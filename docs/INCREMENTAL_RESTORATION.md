# Incremental city restoration — saved design

Owner accepted this direction on 3 October 2026. Initially saved for later;
subsequently asked to proceed gradually. The first small garden prototype is
implemented separately from existing chapter maps. Full-city remodeling remains
deferred.

Build a finished city and a ruined copy using exactly the same origin and bounds.
Split buildings into projects and each project into ordered stages: foundations,
walls, roof, decoration. Example projects: bridge, market, garden, town hall.

Players select a project in /city and donate its required materials. Accept only
remaining required amounts. Progress and construction state are keyed by stable
BentoBox island ID; one island equals one team. Completing a material milestone
queues a small construction stage, placed gradually within protected city areas.

Prefer milestone-based stages initially, rather than one donated item per placed
block. Recipes may use slabs, stairs and crafted decorations. Preserve unrelated
blocks; do not paste the entire chapter city over the world for every donation.

Future implementation must persist accepted materials and placement progress,
resume safely after restart, avoid double charging/rewarding, validate membership,
and bound block placement per tick. Never replace player-controlled island blocks.
Existing five chapter schematics remain references and the current chapter system
remains active until a tested replacement is deliberately installed.

## First prototype: Restoration Garden

`/city` -> Restoration Projects, or `/cityprojects`, opens the selected island's
project. First visit `/city go` to prepare that island's city. Stages:

| Stage | Required plain materials | Blocks constructed |
| --- | --- | --- |
| Foundation | 25 stone bricks | 5 x 5 floor |
| Planters | 8 grass blocks | two rows of planters |
| Tree stumps | 4 oak logs | four small decorative stumps |

Hold materials and click Donate Materials, or `/cityprojects donate`. Partial
donations count; only remaining required quantity is taken from the hand.
Named/lore/enchanted items are rejected. A funded stage flies matching display
blocks from the side and above before committing each block (about1.25 seconds
per block). A global budget processes at most5 island flights every5 ticks.
No currency or reward is paid. Fully-funded or completed stages take no more
materials. `/cityprojects go` unlocks after the foundation and checks its arrival
floor. The main city warp still goes to the existing city.

Footprint is city center +96..100 on X, Z 0..4, Y 99..101, outside existing
chapter prefab bounds. Before accepting the first donation, the entire footprint
must be empty. Existing protection of lostsky_cities still applies. It is a small
mechanical prototype, not a finished garden design or a ruined-city replacement.

Persistent variables under `skyproject`: complete, paid, active, cursor, reserved,
all keyed by stable island ID. Menu inventory and bound island ID are temporary
per-player variables. Membership and selected island are checked for each action;
stale menus cannot donate to a newly-selected team. The saved queue and cursor
are retained through script reload. Repeating placement writes the same block.
Skript variables use the server's existing storage; hard crashes can still lose
the most recent inventory/progress writes, so this is not an atomic transaction
system. Full restart recovery and multi-user donation tests remain required.

`lsprojectselftest` is console-only. It reserves diagnostic slot 0, refuses a
non-empty footprint or nearby players, funds three test stages without using any
player materials, checks the queue/floor/decorations, and cleans up. It does not
prove inventory charging or multi-team isolation.
