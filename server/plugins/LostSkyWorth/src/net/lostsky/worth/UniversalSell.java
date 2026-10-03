package net.lostsky.worth;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.GameMode;
import org.bukkit.Material;
import org.bukkit.OfflinePlayer;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryCloseEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.InventoryHolder;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.BlockStateMeta;
import org.bukkit.inventory.meta.BundleMeta;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.RegisteredServiceProvider;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Universal close-to-sell box. Prices shared with inventory display quotes. */
final class UniversalSell implements Listener {
    private final LostSkyWorth plugin;
    private final Method shopPrice;
    private Object economy;
    private Method deposit;
    private double fallback;

    UniversalSell(LostSkyWorth plugin, Method shopPrice) {
        this.plugin = plugin;
        this.shopPrice = shopPrice;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    boolean initialize() {
        plugin.getConfig().addDefault("fallback-sell-price", 0.01);
        plugin.getConfig().options().copyDefaults(true);
        plugin.saveConfig();
        fallback = plugin.getConfig().getDouble("fallback-sell-price", 0.01);
        if (!Double.isFinite(fallback) || fallback < 0.01) fallback = 0.01;
        try {
            Class vault = Class.forName("net.milkbowl.vault.economy.Economy");
            RegisteredServiceProvider registration = Bukkit.getServicesManager().getRegistration(vault);
            if (registration == null) throw new IllegalStateException("No Vault economy provider");
            economy = registration.getProvider();
            deposit = vault.getMethod("depositPlayer", OfflinePlayer.class, double.class);
        } catch (Exception failure) {
            plugin.getLogger().severe("Universal sell unavailable: " + failure);
            return false;
        }
        plugin.getServer().getPluginManager().registerEvents(this, plugin);
        plugin.getCommand("lssell").setExecutor((sender, command, label, args) -> {
            if (!(sender instanceof Player player)) return true;
            if (blockedMode(player)) {
                player.sendMessage("§eSwitch to Survival or Adventure to sell items.");
                return true;
            }
            Box box = new Box(player);
            box.inventory = Bukkit.createInventory(box, 54, "Lost Sky | Sell Items");
            player.openInventory(box.inventory);
            return true;
        });
        plugin.getCommand("lsworthcheck").setExecutor((sender, command, label, args) -> check(sender));
        plugin.getLogger().info("Universal sell box enabled; unmapped vanilla items sell for $" + fallback + " each.");
        return true;
    }

    private boolean blockedMode(Player player) {
        return player.getGameMode() == GameMode.CREATIVE || player.getGameMode() == GameMode.SPECTATOR;
    }

    // Negative means a protected special item (including inside a container).
    double price(Player player, ItemStack item, int depth) {
        if (item == null || item.getType().isAir()) return 0;
        if (depth > 8 || !item.getType().isItem()) return -1;
        ItemMeta meta = item.getItemMeta();
        if (meta != null && meta.hasLore()) {
            for (String line : meta.getLore())
                if ("Lost Sky Relic".equals(ChatColor.stripColor(line))) return -1;
        }
        double contents = 0;
        if (meta instanceof BlockStateMeta block && block.getBlockState() instanceof InventoryHolder storage) {
            for (ItemStack child : storage.getInventory().getContents()) {
                double value = price(player, child, depth + 1);
                if (value < 0) return -1;
                contents += value;
            }
        }
        if (meta instanceof BundleMeta bundle) {
            for (ItemStack child : bundle.getItems()) {
                double value = price(player, child, depth + 1);
                if (value < 0) return -1;
                contents += value;
            }
        }
        double base = fallback * item.getAmount();
        if (player != null) {
            try {
                Double exact = (Double) shopPrice.invoke(null, player, item);
                if (exact != null && Double.isFinite(exact) && exact > 0) base = exact;
                else {
                    // Variants not in the catalog use the ordinary material's price.
                    Double plain = (Double) shopPrice.invoke(null, player,
                        new ItemStack(item.getType(), item.getAmount()));
                    if (plain != null && Double.isFinite(plain) && plain > 0) base = plain;
                }
            } catch (ReflectiveOperationException failure) {
                throw new IllegalStateException("Shop quote failed; sale cancelled", failure);
            }
        }
        // Each saleable item must retain a positive cent value in the actual payout.
        return BigDecimal.valueOf(Math.max(0.01 * item.getAmount(), base) + contents * item.getAmount())
            .setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    @EventHandler public void close(InventoryCloseEvent event) {
        if (!(event.getInventory().getHolder() instanceof Box box) || box.settled) return;
        box.settled = true;
        Player player = box.owner;
        List<ItemStack> accepted = new ArrayList<>(), returned = new ArrayList<>();
        double total = 0;
        boolean failure = blockedMode(player);
        for (ItemStack item : event.getInventory().getContents()) {
            if (item == null || item.getType().isAir()) continue;
            try {
                double value = price(player, item, 0);
                if (value > 0 && Double.isFinite(value)) {
                    accepted.add(item.clone());
                    total += value;
                } else returned.add(item.clone());
            } catch (RuntimeException error) {
                failure = true;
                returned.add(item.clone());
                plugin.getLogger().warning(error.getMessage());
            }
        }
        event.getInventory().clear();
        total = BigDecimal.valueOf(total).setScale(2, RoundingMode.HALF_UP).doubleValue();
        if (!accepted.isEmpty() && !failure) {
            try {
                Object response = deposit.invoke(economy, player, total);
                failure = !(Boolean) response.getClass().getMethod("transactionSuccess").invoke(response);
            } catch (ReflectiveOperationException error) {
                failure = true;
                plugin.getLogger().severe("Economy deposit failed: " + error);
            }
        }
        if (failure) returned.addAll(accepted);
        else if (!accepted.isEmpty()) {
            player.sendMessage(String.format(Locale.US, "§3[Lost Sky] §aSold items for $%.2f", total));
            plugin.getLogger().info(player.getName() + " sold " + accepted.size() + " stacks for $" + total);
        }
        returnItems(player, returned);
        if (!returned.isEmpty()) player.sendMessage("§eUnsold or protected items returned.");
    }

    private void returnItems(Player player, List<ItemStack> items) {
        for (ItemStack item : items)
            player.getInventory().addItem(item).values().forEach(left -> {
                var drop = player.getWorld().dropItem(player.getLocation(), left);
                drop.setOwner(player.getUniqueId());
            });
    }

    void returnOpenInventories() {
        for (Player player : Bukkit.getOnlinePlayers()) {
            Inventory inventory = player.getOpenInventory().getTopInventory();
            if (!(inventory.getHolder() instanceof Box box) || box.settled) continue;
            box.settled = true;
            List<ItemStack> items = new ArrayList<>();
            for (ItemStack item : inventory.getContents()) if (item != null) items.add(item.clone());
            inventory.clear();
            returnItems(player, items);
            player.closeInventory();
        }
    }

    private boolean check(CommandSender sender) {
        if (sender instanceof Player) { sender.sendMessage("Console only."); return true; }
        Player sample = Bukkit.getOnlinePlayers().stream().findFirst().orElse(null);
        int count = 0;
        for (Material material : Material.values()) {
            if (material.isLegacy() || !material.isItem() || material.isAir()) continue;
            if (!(price(sample, new ItemStack(material), 0) > 0)) throw new IllegalStateException("No price: " + material);
            count++;
        }
        ItemStack relic = new ItemStack(Material.AMETHYST_SHARD);
        ItemMeta meta = relic.getItemMeta();
        meta.setLore(List.of("§8Lost Sky Relic")); relic.setItemMeta(meta);
        if (price(sample, relic, 0) >= 0) throw new IllegalStateException("Relic accepted");
        ItemStack bundle = new ItemStack(Material.BUNDLE);
        BundleMeta bundleMeta = (BundleMeta) bundle.getItemMeta();
        bundleMeta.addItem(relic); bundle.setItemMeta(bundleMeta);
        if (price(sample, bundle, 0) >= 0) throw new IllegalStateException("Bundled relic accepted");
        double one = price(sample, new ItemStack(Material.STONE), 0);
        double stack = price(sample, new ItemStack(Material.STONE, 32), 0);
        if (Math.abs(stack - one * 32) > 0.00001) throw new IllegalStateException("Stack quote mismatch");
        if (LostSkyWorth.isPlayerSlot(1, 0, 54) || !LostSkyWorth.isPlayerSlot(1, 54, 54)
            || LostSkyWorth.isPlayerSlot(1, 90, 54) || !LostSkyWorth.isPlayerSlot(0, 9, 5))
            throw new IllegalStateException("UI slot filter failed");
        sender.sendMessage("[Lost Sky WORTH TEST] PASS: " + count + " vanilla item materials, relic/container guard, stack quote, inventory-only slot filter; live shop player=" + (sample == null ? "none (fallback only)" : sample.getName()));
        return true;
    }

    private static final class Box implements InventoryHolder {
        final Player owner;
        Inventory inventory;
        boolean settled;
        Box(Player owner) { this.owner = owner; }
        @Override public Inventory getInventory() { return inventory; }
    }
}
