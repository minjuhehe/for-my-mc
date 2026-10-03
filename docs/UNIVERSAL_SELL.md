# Universal selling and inventory-only hover prices

Live: LostSkyWorth1.1.1, alongside ProtocolLib and ESGUI6.16.3. Startup verified
03Oct2026 16:37 ICT: scripts loaded without errors, Done15.376s.
JAR filename remains LostSkyWorth-1.0.0.jar (legacy filename).
All inventory-bearing block-item containers are included. Replace the existing
JAR when updating; never install two LostSkyWorth JARs.

Live client evidence:32 stone quoted and paid$5.76; ordinary unmapped sword paid
$0.01;2 renamed stone plus damaged pickaxe paid$0.37; shulker with32 stone quoted
and paid$5.77. Genuine Relic and Relic-containing bundle returned. Test balance
progressed0 ->5.76 ->5.77 ->6.14 ->11.91, then was reset to0 during cleanup.
Server coverage diagnostic passed1504 materials with the live test player.
Packet inspection found inventory quotes and no added quotes on sampled top-menu
icons. Human visual review and economy-failure/crash tests remain outstanding.

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

Live universal-seller payout and Relic/container returns verified as above.
Java21 build passed.597 standalone
slot-boundary checks passed (9..54-slot menus, own inventory, direct inventory and
cursor exclusion). Existing island checker still70/70 after city alias changes.
lsworthcheck passed with the live temporary player. It checks all vanilla
item materials, Relic/bundled-Relic guards, stack totals and slot filtering. With
an online player it queries live shop pricing; otherwise only fallback is tested.
Manual visual review, restart-close behavior and failed deposit handling remain
pending. Temporary account inventory/balance/whitelist cleaned.

Build using server/plugins/LostSkyWorth/build.ps1 with Java21, ProtocolLib.jar and
Spigot API1.21.11. Output LostSkyWorth.jar. Stop server and replace old JAR (rename
output to existing filename if needed), then start. lssell is a player command
without an extra permission; lsworthcheck refuses players. Skript routes are in
lostsky-market.sk. Do not install another worth-lore plugin alongside it.
