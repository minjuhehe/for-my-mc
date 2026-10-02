# Shared spawn / team cities

The public `lobby` is a floating market plaza with a central fountain,
four coloured commerce/quest zones and a city travel pavilion.
Team restoration belongs to `lostsky_cities`.
See TEAM_CITIES.md for the `/is city` menu and separate team progression.

## Interaction design

Ten floating headings and seven stationary villager guides provide routes.
The four-row hub menu offers island, city, guide, spawn, market, supplies,
quests, top-up and close. Each zone merchant opens its own menu. `/menu` opens it
from anywhere. The menu cancels inventory clicks and drags while open.

Use native Minecraft text displays and villagers plus installed Skript;
no extra plugin or client mod is required. FancyNpcs is a future option
if player skins, configurable actions, or more NPCs become necessary.

Sources consulted:
- https://fancyinnovations.com/docs/minecraft-plugins/fancynpcs/tutorials/action-system
- https://www.minecraft.net/en-us/article/minecraft-snapshot-23w06a
- https://feedback.minecraft.net/hc/en-us/articles/35298208390797-Minecraft-Java-Edition-1-21-5-Spring-to-Life
- https://docs.skriptlang.org/docs.html

## Install

1. Preserve a world backup. Existing server backup holds chapter 1.
2. Generate `spawn_hub.schem`: `node lobby/tools/generate.js --hub`.
3. Upload to `plugins/WorldEdit/schematics/` and upload `lostsky-hub.sk`,
   `lostsky-city.sk` and `lostsky-market.sk`
   to `plugins/Skript/scripts/`.
4. Reload each script with `skript reload <script-name>`; fix errors first.
5. In Creative at lobby `(0.5,100,0.5)`, facing north, use
   `//schem load spawn_hub.schem sponge.2`, then `//paste`.
6. Run `node lobby/tools/hub-commands.js` and run the generated console
   commands in `lobby/docs/HUB_CONSOLE_COMMANDS.txt` sequentially.
   Chunks are temporarily force-loaded for entity replacement; spawning is
   allowed for seven guides, then denied and forced chunks removed.
   Gamerules use the namespaced snake_case names required by 1.21.11.
7. At the arrival terrace, run `/setspawn` and `/mv setspawn`. Essentials
   owns `/spawn`; default group needs `essentials.spawn`. `/hub` and
   `/lobby` call the same Essentials spawn command.
8. Verify NPC menu, `/spawn` from an island world, GUI item protection,
   respawn and void rescue, and WorldGuard using a non-OP player.

## Current scope

The market hub is installed on MineLan server 9623747d. All three scripts
reload successfully. Seven villager identities and five zone floor/roof checks
passed live. Global protection flags are confirmed. GUI clicks and drags
still need a player interaction test.
`/spawn` and `/hub` executed on the owner successfully, returning to the
arrival terrace. Latest script reload (join/respawn handlers) passed live.
Visitors arrive in the hub on login; deaths within lobby respawn there and
falling below Y45 triggers a return to the terrace. Island deaths are unchanged.
`lshubbuild` provides a console-only paste alternative. The old lobby is
preserved as `lobby_pre_market_20261003`. Isolated inventory/relic checks and
chapter 1 -> 5 -> 1 replacement passed live. Team creation, warp, donation
and real-player commerce remain unverified. The owner considers the map a
20% foundation and requests decoration deferred while systems are completed.
Never connect global chapter unlocks to re-pasting the shared spawn.
