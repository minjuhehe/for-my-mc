# Incremental city restoration — saved design

Owner accepted this direction on3October2026 and asked to save it for later.
Do not implement or remodel maps yet; continue the existing server work first.

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
