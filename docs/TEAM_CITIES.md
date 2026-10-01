# Team restoration cities

The intended replacement travel plaza uses `lobby`; its paste is pending.
Restoration maps use `lostsky_cities`, with one plot per active BentoBox
island/team. The world and protection exist; city script reload and runtime
validation are pending after MineLan sign-in expired.

- `/is city` or `/city`: open the team city menu.
- `/is city go` or `/city go`: prepare chapter 1 on first use, then teleport.
- `/city donate`: donate one genuine Lost Sky relic held in the main hand.
- `/spawn`: return to the public plaza.

Identity comes from `BentoBox.getIslandsManager().getIsland(world, UUID)`
and `Island.getUniqueId()`. The API returns the team island for members.
An ownership transfer keeps the island ID and thus the same city. Joining
another island changes the city you access. Island reset gets a new ID;
the old city's data is retained rather than erased automatically.

`lostsky-city.sk` uses skript-reflect 2.6.3 and WorldEdit 7.4.2 to read the
Sponge v2 chapter maps. Plot arrival points are `(slot*512+0.5,100,0.5)`.
Each team has independent cumulative relic thresholds 100/300/600/1000.
Chapter replacement affects only its assigned plot; the shared spawn and
player-built SkyBlock island stay separate. City plots are protected
prefabs, not free-build areas. Visitors are moved out before replacement.

Variables persist in Skript's variable storage:
`skycity::slot::<islandID>`, `ready`, `chapter`, `points` and `skycity::next`.
Never clear these when updating the script. Include Skript variables,
BentoBox database and `lostsky_cities` world in backups together.

The original `/donate`, `/chapter` and `/citadel` still describe the old
server-wide prototype. City UI uses `/city donate` and team values instead.
Relic loot, team generator unlocks and quests are separate content work.
City identity, warp and replacement are the scope of this migration.

Test checklist: fresh plot creation, same team resolving same island ID,
separate team isolation, no-island guide, `/is` continuing to work, safe
spawn floor, donation rejecting ordinary items, chapter replacement and
world protection. Runtime validation status is recorded in DEV_NOTES.
