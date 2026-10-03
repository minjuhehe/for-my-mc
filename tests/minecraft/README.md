# Controlled Minecraft diagnostics — prepared, not run

Mineflayer4.39.0 supports the server's1.21.11. Dependencies are installed locally
under ignored outputs/mc-testbot; no test client has connected yet. Use only a
temporary LostSkyTest... account, explicitly add it to whitelist, and remove it
after testing. Never impersonate the owner's accounts or grant OP. No actions run
until explicit stdin input. Pass server address privately as command arguments;
do not commit it. Offline authentication matches this server's current mode.

Set LOSTSKY_MINEFLAYER_PATH to the absolute node_modules/mineflayer directory.
Run node tests/minecraft/client.cjs HOST PORT LostSkyTest.
Send one JSON object per stdin line, e.g.:

```json
{"action":"chat","text":"/sell"}
{"action":"window"}
{"action":"inventory"}
{"action":"click","slot":54,"mouse":0,"mode":0}
{"action":"close"}
{"action":"equip","item":"stone_bricks"}
{"action":"position"}
{"action":"quit"}
```

Read the current window inventoryStart and actual slots before clicking;54 is
only an example for a54-slot sell box. Chat, inventory/components and menu data
are printed as JSON. Do not publish player data or raw logs.

Plan: console gives plain stone, unmapped vanilla item, named/damaged ordinary
tool and genuine Relic to this temporary account. Check player inventory has
price lore but menu top does not. Record /bal, deposit normal items, close, record
/bal and compare to quoted totals. Relic and Relic-containing bundle must return.
Check failed/creative sale returns items. Only afterward use separate temporary
islands to test project charging, stages, membership changes and city isolation.
Never reset/delete owner islands or progress. Keep cleanup limited to fixtures.

Headless resource-pack acknowledgment is simulated by Mineflayer and does not
prove the font loaded or rendered. This tool also doesn't replace human visual
review, genuine-account login testing or client performance checks.

Source: https://github.com/PrismarineJS/mineflayer
