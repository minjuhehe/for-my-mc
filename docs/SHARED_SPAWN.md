# Shared spawn / team cities

The public `lobby` world is a restored sky harbour shared by all players.
It remains independent of any team's story chapter. Existing five chapter
schematics are retained as design material for future team cities.

## Interaction design

Replace the 24 old story signs with eight short floating headings and two
stationary villager guides. Right-click either guide to open a three-row
menu: own island, starting guide, return to spawn, close. `/menu` opens it
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
3. Upload to `plugins/WorldEdit/schematics/` and upload `lostsky-hub.sk`
   to `plugins/Skript/scripts/`.
4. Reload with `skript reload lostsky-hub`; fix any parse errors first.
5. In Creative at lobby `(0.5,100,0.5)`, facing north, use
   `//schem load spawn_hub.schem sponge.2`, then `//paste`.
6. Run `node lobby/tools/hub-commands.js` and run the generated console
   commands in `lobby/docs/HUB_CONSOLE_COMMANDS.txt` sequentially.
   Mob spawning is temporarily allowed for the two guides, then denied again.
   Gamerules use the namespaced snake_case names required by 1.21.11.
7. At the arrival terrace, run `/setspawn` and `/mv setspawn`. Essentials
   owns `/spawn`; default group needs `essentials.spawn`. `/hub` and
   `/lobby` call the same Essentials spawn command.
8. Verify NPC menu, `/spawn` from an island world, GUI item protection,
   respawn and void rescue, and WorldGuard using a non-OP player.

## Current scope

The restored hub is installed on MineLan server 9623747d. The script reloads
successfully; two villager guides and eight Thai text displays were verified
from live entity data. Arrival floor and removed sign positions pass live
block checks. GUI clicks and drags still need a player interaction test.
`/spawn` and `/hub` executed on the owner successfully, returning to the
arrival terrace. Latest script reload (join/respawn handlers) passed live.
Visitors arrive in the hub on login; deaths within lobby respawn there and
falling below Y45 triggers a return to the terrace. Island deaths are unchanged.
The existing `lostsky.sk` still has server-wide progress. Team-owned chapters,
relic donation and city restoration are a separate migration and are not
implemented by this hub change. Never connect global chapter unlocks to
re-pasting the shared spawn.
