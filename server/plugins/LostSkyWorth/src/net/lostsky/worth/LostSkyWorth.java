package net.lostsky.worth;

import com.comphenix.protocol.PacketType;
import com.comphenix.protocol.ProtocolLibrary;
import com.comphenix.protocol.events.PacketAdapter;
import com.comphenix.protocol.events.PacketEvent;
import com.comphenix.protocol.events.ListenerPriority;
import org.bukkit.GameMode;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.inventory.InventoryDragEvent;
import org.bukkit.event.player.PlayerGameModeChangeEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.java.JavaPlugin;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Display-only sell quotes; never edits a server inventory or item. */
public final class LostSkyWorth extends JavaPlugin implements Listener {
    private Method sellPrice;
    private boolean reportedFailure;

    @Override public void onEnable() {
        try {
            sellPrice = Class.forName("me.gypopo.economyshopgui.api.EconomyShopGUIHook")
                .getMethod("getItemSellPrice", Player.class, ItemStack.class);
        } catch (ReflectiveOperationException failure) {
            getLogger().severe("EconomyShopGUI sell quote API unavailable; disabling.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }
        ProtocolLibrary.getProtocolManager().addPacketListener(new PacketAdapter(this,
            ListenerPriority.HIGHEST, PacketType.Play.Server.SET_SLOT,
            PacketType.Play.Server.WINDOW_ITEMS, PacketType.Play.Server.SET_PLAYER_INVENTORY) {
            @Override public void onPacketSending(PacketEvent event) {
                if (event.isCancelled() || event.getPlayer().getGameMode() == GameMode.CREATIVE
                    || event.getPlayer().getGameMode() == GameMode.SPECTATOR) return;
                // Deep clone the packet too: broadcast packets must not share another player's quotes.
                event.setPacket(event.getPacket().deepClone());
                if (event.getPacketType().equals(PacketType.Play.Server.WINDOW_ITEMS)) {
                    List<ItemStack> original = event.getPacket().getItemListModifier().readSafely(0);
                    if (original == null) return;
                    List<ItemStack> display = new ArrayList<>(original.size());
                    for (ItemStack item : original) display.add(quote(event.getPlayer(), item));
                    event.getPacket().getItemListModifier().writeSafely(0, display);
                } else {
                    ItemStack item = event.getPacket().getItemModifier().readSafely(0);
                    if (item != null) event.getPacket().getItemModifier()
                        .writeSafely(0, quote(event.getPlayer(), item));
                }
            }
        });
        getServer().getPluginManager().registerEvents(this, this);
        getLogger().info("Display-only sell prices enabled: per item and stack, EconomyShopGUI player quotes.");
    }

    private ItemStack quote(Player player, ItemStack original) {
        if (original == null || original.getType().isAir() || original.getAmount() <= 0) return original;
        try {
            Double total = (Double) sellPrice.invoke(null, player, original);
            if (total == null || !Double.isFinite(total) || total <= 0) return original;
            ItemStack display = original.clone();
            ItemMeta meta = display.getItemMeta();
            if (meta == null) return original;
            List<String> lore = meta.hasLore() ? new ArrayList<>(meta.getLore()) : new ArrayList<>();
            lore.add(String.format(Locale.US, "§eSell each: §f$%.2f", total / original.getAmount()));
            lore.add(String.format(Locale.US, "§eSell stack (%d): §f$%.2f", original.getAmount(), total));
            meta.setLore(lore);
            display.setItemMeta(meta);
            return display;
        } catch (ReflectiveOperationException failure) {
            if (!reportedFailure) {
                reportedFailure = true;
                getLogger().warning("Sell quote failed; leaving items unchanged: " + failure);
            }
            return original;
        }
    }

    private void refresh(Player player) {
        getServer().getScheduler().runTaskLater(this, () -> {
            if (player.isOnline()) player.updateInventory();
        }, 2L);
    }
    @EventHandler public void click(InventoryClickEvent event) {
        if (event.getWhoClicked() instanceof Player player) refresh(player);
    }
    @EventHandler public void drag(InventoryDragEvent event) {
        if (event.getWhoClicked() instanceof Player player) refresh(player);
    }
    @EventHandler public void mode(PlayerGameModeChangeEvent event) { refresh(event.getPlayer()); }
    @Override public void onDisable() { ProtocolLibrary.getProtocolManager().removePacketListeners(this); }
}
