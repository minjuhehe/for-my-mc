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
Actual Relic-return and close-to-sale transactions still need a player test.

Player permissions explicitly set:
EconomyShopGUI.shop
EconomyShopGUI.shop.all
EconomyShopGUI.sellgui
EconomyShopGUI.sellall.all

In LanguageFiles/lang-en.yml:
left-click-buy: '&a&lBuy: &f%buyPrice%'
right-click-sell: '&e&lSell: &f%sellPrice%'

Reload using /sreload. Tooltip placeholders use the actual current prices.
Owner confirms both GUIs open. Do not describe sales, return behavior or all
prices as verified until actual player transactions are checked.

References:
https://dev.bukkit.org/projects/economyshopgui/files/7423771
https://wiki.gpplugins.com/economyshopgui/basics/commands
https://wiki.gpplugins.com/economyshopgui/file-configuration/config.yml
