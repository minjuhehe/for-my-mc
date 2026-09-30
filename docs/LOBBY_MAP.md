# Lobby Map: the Sky Citadel Plaza

Status: **plan**, nothing built yet. This file describes what we're building,
and has every prompt needed to design and build it.

## 1. What we're building

The lobby is where every player arrives (`/spawn`). It is **the ruined Sky
Citadel itself**, floating on a big island in the sky. The lobby **rebuilds
itself as the story moves on**: every time the server unlocks a chapter,
admins paste the next version of the Citadel, so players *see* their relic
donations repairing it.

One build, five versions:

| Chapter | Lobby version | What changes |
|---------|---------------|--------------|
| 1 The Awakening | `lobby_ch1` | Citadel in ruins: broken towers, rubble, cracked stone, a dim amethyst crystal floating over the centre |
| 2 Roots of Stone | `lobby_ch2` | Lower walls rebuilt, stone roots and moss climb the island, gardens appear |
| 3 The Drowned Spire | `lobby_ch3` | Waterfalls pour off the island edges, a water spire rises, prismarine details |
| 4 Ember Halls | `lobby_ch4` | Lower halls lit with lanterns and embers, blackstone and gilded details |
| 5 The Citadel Rises | `lobby_ch5` | Fully restored: tall towers, gold crown, the crystal shines with a beacon beam |

### Zones (every zone ties to a real game system)

The centre of the Citadel is point **(0, 0)**. Players arrive at the
south edge and look **north** at the Citadel.

```
                         N
          ┌─────────────────────────────────┐
          │        (5) Hall of Relics        │
          │                                 │
 (6) Ruin │     ┌───────────────────┐       │ (7) Island
   Dock   │     │   (3) CITADEL     │       │    Gate
  (west)  │     │  + Donation Altar │       │   (east)
          │     │  (4) 5 Chapter    │       │
          │     │      Pillars ring │       │
          │     └───────────────────┘       │
          │       (2) Tutorial Path          │
          │       (1) Arrival Terrace        │
          └─────────────────────────────────┘
                         S   ← players spawn here
```

| # | Zone | Size (approx.) | Ties to | Must have |
|---|------|---------------|---------|-----------|
| 1 | **Arrival Terrace** | 21×15 | `/spawn` (EssentialsX Spawn) | Spawn point facing north, welcome sign, rules board, "server in testing" sign |
| 2 | **Tutorial Path** | 5 wide, ~40 long | New players | 5 sign stops: `/is` → `/ruin` → relics → `/donate` → `/chapter` |
| 3 | **Citadel + Donation Altar** | 41×41, up to 60 tall at ch5 | `/citadel` (warp saved with `/lostsky setcitadel`), `/donate` | Altar in front of the main gate, lectern or sign explaining relics |
| 4 | **Chapter Pillars** | 5 pillars in a ring, radius 14 | `/chapter`, chapter unlocks | Pillar *n* is broken until chapter *n*, then restored and lit |
| 5 | **Hall of Relics** | 21×13 | Relics, titles | Item frames with the 4 relic types and points, title board (Wanderer → Citadel Keeper) |
| 6 | **Ruin Dock** | 15×11, west edge | `/ruin` | Floating dock with a "drifting ruin" sign and an empty mooring where ruins "arrive" |
| 7 | **Island Gate** | 11×9 arch, east edge | `/is` | Big arch with a sign "Type /is to get your island" |
| – | Later | – | Holograms (DecentHolograms), leaderboards | Relic progress hologram over the altar, `/is top` board, Founders wall |

Whole lobby: about **121×121 blocks**, floating island edge to edge.

### Style guide

- **Theme:** high-fantasy sky ruins, bright and readable, not dark or scary.
- **Main palette:** calcite, smooth quartz, stone bricks (plus mossy and
  cracked), chiseled stone bricks, polished andesite.
- **Accent:** amethyst blocks and clusters (the relic colour), gold only
  from chapter 4 onward (the crown).
- **Island underside:** stone, tuff, andesite, dripstone, hanging roots.
  The underside tapers to a point, like the website's floating islands.
- **Greenery:** moss, azalea and flowering azalea leaves, vines, glow
  lichen.
- **Light:** lanterns, end rods, hidden light blocks. **Every walkable
  block needs block light 1 or more**, so no hostile mobs spawn.
- **Keep it light for the server:** fewer than 60 item frames and armor
  stands, no redstone clocks, no mob farms.

### Things to decide or do before building

1. **Where the lobby lives: decided (2026-09-30), a separate void world**
   named `lobby`.
   - Needs two extra plugins: **Multiverse-Core** (manages worlds) and
     **VoidGen** (makes the world empty sky). Check that both load on the
     server's Java version, like BentoBox and WorldEdit.
   - Create the world (the exact syntax depends on the Multiverse version):
     - Multiverse 4: `/mv create lobby normal -g VoidGen`
     - Multiverse 5: `/mv create lobby normal --generator VoidGen`
   - After building, stand on the Arrival Terrace and run `/setspawn`
     (EssentialsX). In `plugins/Essentials/config.yml`, check that new and
     returning players are sent to that spawn (`spawn-on-join` and the
     `newbies` spawnpoint).
2. **Protection: later (owner's choice).** `spawn-protection` doesn't
   cover other worlds, so the plan is **WorldGuard**, with the lobby as a
   protected region. Until then, **don't let players into the lobby world**
   (keep the whitelist to builders only), because anyone could break it.
3. **Pasting new versions.** Each version is saved as a WorldEdit
   schematic (`lobby_ch1.schem` … `lobby_ch5.schem`). An admin pastes the
   next one by hand when a chapter unlocks. `/lsunlock` can't paste
   schematics, but it can broadcast a message. Back up before each paste,
   and paste when few players are online.
4. **WorldEdit must load first.** It currently fails because of the Java
   version (see `server/PLUGINS.md`). Fix that before building.

---

## 2. Prompts

Replace anything in `[brackets]`. The prompts are in English because
image AIs and build tools follow English best.

### A. Concept art (image AI)

Use these to get pictures before building. Add *"Minecraft style, blocky
voxel, 16x16 textures"* if a result looks too realistic.

**A1. Whole lobby, bird's-eye view**
```
Minecraft build, bird's-eye view of a large floating sky island lobby
for a Skyblock server. In the centre a ruined fantasy citadel made of
calcite, smooth quartz and mossy stone bricks, with broken towers and a
glowing purple amethyst crystal floating above it. A ring of five broken
stone pillars around the citadel. A small arrival terrace with a stone
path at the south edge, a wooden dock sticking out of the west edge, a
large stone arch on the east edge, and a small hall on the north side.
The island underside tapers to a point, made of stone, tuff and dripstone
with hanging roots. Clear blue sky, soft clouds, small floating islets
around it. Bright, readable, high fantasy, blocky voxel style.
```

**A2. Player's first view (from the spawn point)**
```
Minecraft first-person screenshot from a spawn terrace looking north
along a stone path toward a ruined sky citadel. Broken calcite towers,
mossy cracked stone bricks, a purple amethyst crystal hovering over the
gate, lanterns along the path, wooden signs on both sides, azalea bushes,
open sky and clouds all around the floating island. Morning light,
inviting, high fantasy, blocky voxel style.
```

**A3–A7. One picture per chapter version (same camera angle)**
```
[A3] Minecraft build, three-quarter view of a ruined floating sky
citadel: collapsed towers, rubble, cracked and mossy stone bricks, a dim
amethyst crystal hovering in the centre, five broken pillars in a ring.
Quiet, abandoned, but bright daytime sky. Blocky voxel style.

[A4] The same floating sky citadel, partly rebuilt: lower walls
restored with fresh stone bricks, thick stone roots and moss climbing the
island edges, small gardens with azalea, two of five pillars restored.
Blocky voxel style, same camera angle.

[A5] The same floating sky citadel with waterfalls pouring off the
island edges into the clouds, a slim spire wrapped in water and
prismarine, three of five pillars restored and glowing. Blocky voxel
style, same camera angle.

[A6] The same floating sky citadel at dusk, lower halls lit by lanterns
and warm embers, blackstone and gilded blackstone details, four of five
pillars restored. Blocky voxel style, same camera angle.

[A7] The same floating sky citadel fully restored: tall white towers, a
gold crown on the main keep, the amethyst crystal blazing with a beacon
beam into the sky, all five pillars glowing, banners, waterfalls and
gardens. Triumphant, bright, high fantasy, blocky voxel style.
```

**A8–A14. One picture per zone**
```
[A8 Arrival Terrace] Minecraft small stone terrace at the edge of a
floating island, 21 by 15 blocks, calcite and polished andesite floor,
lanterns on posts, a big welcome sign board, a rules board, flower pots,
looking toward a citadel. Blocky voxel style.

[A9 Tutorial Path] Minecraft winding stone path 5 blocks wide across a
floating island, five small stops each with a sign on a post and a tiny
display: a mini island, a mini ruin, an amethyst shard on a pedestal, an
altar, a book on a lectern. Lanterns and moss. Blocky voxel style.

[A10 Donation Altar] Minecraft altar in front of a citadel gate: a round
dais of chiseled stone bricks and calcite, amethyst clusters around the
rim, a lectern in the middle, a floating amethyst crystal above, soft
purple glow. Blocky voxel style.

[A11 Chapter Pillars] Minecraft ring of five tall stone pillars around a
citadel, each topped with an amethyst block; two pillars intact and
glowing with end rods, three broken with rubble at their base. Blocky
voxel style.

[A12 Hall of Relics] Minecraft small museum hall with calcite walls and
tall windows, item frames on pedestals showing an amethyst shard, a
brick, a heart of the sea and a nether star, a wall board with four
titles, carpets and lanterns. Blocky voxel style.

[A13 Ruin Dock] Minecraft wooden sky dock sticking out from a floating
island over the clouds, spruce planks and chains, a lantern post, a sign,
an empty mooring platform where a drifting ruin can arrive, rope bridges.
Blocky voxel style.

[A14 Island Gate] Minecraft large stone arch 11 blocks wide on the edge
of a floating island, amethyst keystone, vines, a big sign under the arch,
open sky behind it with small floating islands in the distance. Blocky
voxel style.
```

### B. Build plan prompts (for Claude or another AI helper)

Paste one of these into a new chat. They ask for layer-by-layer plans and
WorldEdit commands you can follow in game.

**B1. Master plan**
```
I'm building the lobby for "Lost Sky", a story Skyblock Minecraft server
(Paper 1.21.x, Java Edition). Read docs/LOBBY_MAP.md in the repo
minjuhehe/for-my-mc. Give me a build plan for the chapter 1 (ruined)
version: a 121x121 floating island with the zones in that file, centred
on (0, y=[height], 0). For each zone give its exact corner coordinates,
its block palette, and the build order. Keep block counts realistic for
one builder with WorldEdit. List what must stay the same across all 5
chapter versions so later versions can paste on top.
```

**B2. Island base shape with WorldEdit**
```
Give me WorldEdit commands (//pos1, //pos2, //set, //replace, //sphere,
//cyl, //smooth and brushes) to make the base of a floating island
121x121 wide centred on (0, [height], 0). The top is mostly flat grass
and path. The underside tapers to a point about 50 blocks below, made of
stone, tuff, andesite and dripstone, with a few hanging-root patches. It
should look natural, not like a perfect cone. Explain each step in one
short line.
```

**B3. One zone at a time** (repeat for each zone)
```
For the Lost Sky lobby (docs/LOBBY_MAP.md), give me a layer-by-layer
build guide for the [ZONE NAME] at [corner coordinates]. Palette:
calcite, smooth quartz, stone bricks (mossy and cracked), chiseled stone
bricks, amethyst accents[, gold only for chapter 4-5]. List each layer
from the bottom up as rows of blocks, then any WorldEdit commands that
save time. Mark where signs, item frames and lights go, and make sure
every walkable block has block light 1 or more.
```

**B4. Chapter upgrade versions**
```
I have the chapter 1 version of the Lost Sky lobby saved as
lobby_ch1.schem. Plan the chapter [2/3/4/5] version described in
docs/LOBBY_MAP.md. List only what changes compared with the previous
version (added, removed, replaced blocks per zone), so I can build it
on a copy and save it as lobby_ch[n].schem. Keep the spawn point, altar
position and all sign positions the same.
```

**B5. Signs and text**
```
Write the text for every sign in the Lost Sky lobby (docs/LOBBY_MAP.md):
the welcome board, rules board, 5 tutorial stops, the donation altar,
the chapter pillars, the Hall of Relics labels, the Ruin Dock and the
Island Gate. Each sign has 4 lines of up to 15 characters. Write one
version in Thai and one in English. Use only commands from
docs/COMMANDS.md, and don't say the server is open.
```

**B6. Check before opening**
```
Here are screenshots of my finished Lost Sky lobby. Check it against
docs/LOBBY_MAP.md: are all zones there, can a new player find /is,
/ruin and /donate within 30 seconds of spawning, are there dark spots
where mobs could spawn, anything players could break or get stuck in,
and anything that would lag the server (too many entities or redstone)?
```

### C. Brief for a human builder

Send this to a builder friend or a hired build team.
```
Project: lobby for "Lost Sky", a story-driven Skyblock server (Java
1.21.x). Theme: the ruined Sky Citadel on a floating island, bright
high fantasy. Size about 121x121, centre (0,0), players spawn on the
south edge facing north.

Zones: arrival terrace (spawn, welcome and rules boards), tutorial path
with 5 sign stops, the Citadel with a donation altar at its gate, a ring
of 5 chapter pillars, a Hall of Relics (item frames), a Ruin Dock (west
edge) and an Island Gate arch (east edge).

Deliverables: 5 versions saved as WorldEdit schematics, lobby_ch1 (in
ruins) to lobby_ch5 (fully restored). Spawn point, altar and sign
positions must stay in the same place in every version.

Palette: calcite, smooth quartz, stone bricks (mossy and cracked),
chiseled stone bricks, polished andesite, amethyst accents; gold only in
versions 4-5. Underside: stone, tuff, andesite, dripstone, hanging roots.

Limits: under 60 item frames or armor stands, no redstone clocks, block
light 1 or more on every walkable block.

Full design: docs/LOBBY_MAP.md in github.com/minjuhehe/for-my-mc.
```

---

## 3. Build order (suggested)

1. Fix WorldEdit. Install Multiverse-Core + VoidGen and create the `lobby`
   void world. Protection (WorldGuard) comes later, before players join.
2. Get concept art (A1, A2, A3) and pick a look.
3. Island base (B2), then the Arrival Terrace and the path, so `/spawn`
   works early.
4. Citadel ruins, altar, pillars (chapter 1 look).
5. Hall of Relics, Ruin Dock, Island Gate.
6. Signs (B5), lighting check, protection check.
7. Save as `lobby_ch1.schem`. Set spawn with `/setspawn` at the terrace,
   and the Citadel warp with `/lostsky setcitadel` at the altar.
8. Build versions 2–5 on a copy (B4), and save each as a schematic.
