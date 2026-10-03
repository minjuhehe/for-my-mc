# Universal selling and inventory-only hover prices

Live: LostSkyWorth1.1.0, alongside ProtocolLib and ESGUI6.16.3. Startup verified
03Oct2026 09:58 ICT: all plugins/scripts enabled, Done15.488s, no ERROR/Exception
in inspected startup. JAR filename still LostSkyWorth-1.0.0.jar (legacy filename).

Staged:1.1.1 includes all inventory-bearing block-item containers, extending1.1.0
which handles shulkers and bundles. It builds but was not uploaded because panel
login expired. Replace the existing JAR; never install two LostSkyWorth JARs.

## Behavior

/shop and /skyshop still use ESGUI's category catalog. /sell, /sellgui, /market,
Sell Items menu and Farm Merchant use lostskyworth:lssell. It opens an empty
54-slot box; closing sells deposited vanilla items via Vault/Essentials.
Namespaced economyshopgui:sellgui remains the old limited route.

Exact player-aware ESGUI price first; unlisted variants use the plain material's
price. Any remaining vanilla item gets fallback$0.01 per item, configurable in
LostSkyWorth/config.yml. Minimum positive cent per item,2decimal HALF_UP rounding.
Unlisted enchantments don't add a premium. Damaged/renamed ordinary items can sell.
Container contents contribute to the value. Any lore line reading Lost Sky Relic
protects that item, and a container holding a Relic is returned whole.

Creative/spectator cannot sell. Quote errors or rejected economy deposits return
items. Each box settles once. Plugin disable returns open inventories without
selling. Full-inventory overflow drops owned items at the player's position.
Inventory removal and Vault deposit run on the server thread without waits, but
there is no durable cross-plugin transaction journal. Hard-crash consistency is
not guaranteed; verify backups before public opening.

## Price display

Sell each and Sell stack use the same function as the sell transaction. Only
player inventory slots receive cloned display lore, including the player inventory
underneath another menu. Menu buttons, shop icons, sell-box contents and cursor
do not receive extra prices. Armor/offhand included; crafting slots excluded.
Real item metadata stays unchanged. Refresh on clicks, drags and mode changes.
Relics have no money price.

ESGUI lore-arrangement no longer contains buy-prices/sell-prices. Confirmation
total and wallet remain visible; individual shop icon prices are hidden.

## Validation and remaining work

Owner confirmed an ordinary sale earned money in the previous ESGUI sell box.
This doesn't verify universal-seller payout. Java21 build passed.597 standalone
slot-boundary checks passed (9..54-slot menus, own inventory, direct inventory and
cursor exclusion). Existing island checker still70/70 after city alias changes.
lsworthcheck was sent before logout; result not retrieved. It checks all vanilla
item materials, Relic/bundled-Relic guards, stack totals and slot filtering. With
an online player it queries live shop pricing; otherwise only fallback is tested.
Real payout, client display, container sale/return and restart-close behavior
remain pending. No temporary test client was whitelisted or connected.

Build using server/plugins/LostSkyWorth/build.ps1 with Java21, ProtocolLib.jar and
Spigot API1.21.11. Output LostSkyWorth.jar. Stop server and replace old JAR (rename
output to existing filename if needed), then start. lssell is a player command
without an extra permission; lsworthcheck refuses players. Skript routes are in
lostsky-market.sk. Do not install another worth-lore plugin alongside it.
