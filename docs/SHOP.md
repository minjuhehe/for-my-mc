# Shop and sell GUI

EconomyShopGUI 6.16.3, official CurseForge file 7423771. MD5:
0326da94b07ec43c53e2ba66320ba3a5. Supports Paper 1.21.11.

Install JAR in plugins and restart. First startup generates the complete default
catalog (16 config files; 14 economy-enabled sections). Vault connects to existing
Essentials balances. Keep language-file lang-en.yml and per-player-languages false.
No real-money handling is enabled.

/shop and /skyshop open the category catalog. /sell, /sellgui and /market open
the deposit inventory; close it to sell accepted items and receive unsellable items
back. /sell is intercepted by lostsky-market.sk so Essentials' instant sell does not
run. Namespaced essentials:sell remains a separate command; no permission granted.
Hub and merchant NPCs use the same routes. The legacy small shop/farm functions
are retained for rollback but no longer opened by the public entry points.

Default prices replace the old six-product script prices. Review the generated
shop files before public launch. Custom/lore items are matched by components;
only repair_cost is ignored, so named Lost Sky Relics should be returned unsold.
Owner confirms closing the sell GUI sells ordinary items and earns money.
Exact amounts and Relic-return behavior still need a player test.

Player permissions explicitly set:
EconomyShopGUI.shop
EconomyShopGUI.shop.all
EconomyShopGUI.sellgui
EconomyShopGUI.sellall.all

In LanguageFiles/lang-en.yml:
left-click-buy: '&a&lBuy: &f%buyPrice%'
right-click-sell: '&e&lSell: &f%sellPrice%'

Reload using /sreload. Tooltip placeholders use the actual current prices.
Owner confirms both GUIs open and an ordinary-item sale earns money. Exact
amounts, all catalog prices and return behavior are not yet verified.

Inventory hover prices: LostSkyWorth 1.0.0 queries EconomyShopGUI's player-aware
sell quote API on the original item and sends display-only cloned items through
ProtocolLib. It shows `Sell each` and `Sell stack (quantity)` in English. No new
command or permission is needed. Creative and spectator quotes are disabled.
Items with no positive sell quote are left unchanged, including rejected custom
items. The real inventory and item lore are never changed. Refresh follows
clicks, drags and game-mode changes. Quotes are estimates at display time; shop
price changes between hovering and selling can change the actual transaction.

Dependency: official ProtocolLib dev-build, SHA256
bdd7c55799ea625e66992c89f7746be6d25e5adacb6aaf173316bebd493bf834.
The stable 5.4.0 release only explicitly supports through 1.21.8; the development
release includes 1.21.11 support. Keep this exact downloaded dependency with the
server package; the dev-build download URL may change later.

Build source in server/plugins/LostSkyWorth with build.ps1 using Java 21,
ProtocolLib.jar and Spigot API 1.21.11. Install both plugin jars and restart.
Client hover, split-stack refresh, stacking and exact-sale checks remain pending.
Do not install Simple Worth or HoverWorth alongside this plugin.

References:
https://dev.bukkit.org/projects/economyshopgui/files/7423771
https://wiki.gpplugins.com/economyshopgui/basics/commands
https://wiki.gpplugins.com/economyshopgui/file-configuration/config.yml

Live startup verified 2026-10-03 09:25 ICT on Paper1.21.11: both plugins enabled, no ERROR/Exception in inspected startup. LostSkyWorth deployed SHA256 f40000be4eac04d14a7473c462372e4507ac9cfab063dbcd06a02df6bfbf1de9. Client hover verification pending.
