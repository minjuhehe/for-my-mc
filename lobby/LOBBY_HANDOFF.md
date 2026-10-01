# LOST SKY LOBBY — AS-BUILT HANDOFF

**Purpose:** give this file to any AI/helper. It contains the complete as-built
state of the Lost Sky server lobby map: what exists, exact coordinates, every
sign, every chapter difference, the file formats, the tools that generate it,
the tests that verify it, and what is still missing. The original plan is in
`LOBBY_MAP.md` (same folder) — this file describes the **finished implementation**
of that plan.

Project folder: `C:\Lost sky`
Handoff date: 2026-09-30
Status: **all 5 chapter schematics generated and passing 1,087 automated checks**.
Not yet verified in a live Minecraft client.

---

## 1. What exists on disk

| File | What it is |
|---|---|
| `schematics/lobby_ch1.schem` … `lobby_ch5.schem` | The five paste-ready lobby versions (Sponge Schematic **v2**, DataVersion **3953** = Minecraft 1.21, gzip+NBT). ~239–241k non-air blocks each, ~93–95 KB each. |
| `schematics/manifest.json` | Sizes, spawn/altar coords, paste offset, per-chapter block/sign/frame counts. |
| `preview/index.html` | Gallery page: isometric renders of all chapters, top-down maps, cross-sections. |
| `preview/iso_ch1..5.png` | Isometric 3D-style pictures of each chapter. |
| `preview/top_ch1..5.png`, `cross_ch1..5.png` | Top-down heightmaps and north-south cross-sections. |
| `LOST_SKY_POSTER.png` (project root) | Single poster: all 5 renders + maps with title/badges. |
| `docs/LOBBY_IMPORT.md` | Human instructions: create world, paste, set spawns, upgrade chapters. |
| `README.md` | Project overview + command list. |
| `tools/` | The generator (details in §6). No dependencies; plain Node.js. Regenerate with `node tools/generate.js`, re-test with `node tools/test_lobby.js`, re-render with `node tools/render.js` / `render_iso.js` / `poster.js`. |

---

## 2. World layout (as-built coordinates)

World box: **121 × 96 × 121** (X × Y × Z), schematic-local coords. Ground level
**Y = 80** (players walk at Y 81). North = −Z, South = +Z, West = −X, East = +X.

```
                 N (−Z)
        ┌───────────────────────────┐
        │   Hall of Relics          │   hall:   x 48–72, z 26–42
        │                           │
  Dock  │   CITADEL keep 25×25      │   Island
  x 3–15│   keep: x 48–72, z 48–72  │   Gate
 z 55–65│   gate (S wall): x 57–63  │   x 100–110
        │   postern (N wall): x 59–61│  z 53–67
        │                           │
        │   Arrival Terrace         │   terrace: x 50–70, z 103–113
        └───────────────────────────┘
                 S (+Z)
```

Key positions (schematic-local):

| Thing | Coords | Notes |
|---|---|---|
| **Spawn** | (60, 81, 108) | quartz pad `x 59–61, z 107–109`; faces north (yaw 180) |
| Welcome board | x 54–56, z 111–112 | calcite panel + sign (south-facing) |
| Rules board | x 64–66, z 111–112 | calcite panel + sign (south-facing) |
| Tutorial path | x 58–62, z 83–102 | polished andesite, lantern posts |
| Tutorial stops | x 56, z 98 / 94 / 90 / 86 / 84 | fence + spruce sign (east-facing) + mini display at x 54 |
| **Donation Altar** | dais x 57–63, z 73–79; centre (60, 76) | lectern at (60, 83, 76) facing south; crystal at (60, 88, 76) |
| Chapter pillars | (52,46) (75,47) (75,73) (45,47) (45,73) | base ring Y 80; restored pillars 9 tall + amethyst top + 4 end rods |
| Keep walls | x 48–72, z 48–72 | ch1: ragged height 1–4; ch5: full 7 + crenellations |
| Main gate | x 57–63, z 72 | always open, jambs at x 56 & 64 |
| North postern | x 59–61, z 48 | leads to Hall of Relics walkway |
| Keep hall interior | x 53–67, z 53–67 | amethyst inlay centre (60,80,60); 4 doorways N/S/E/W at x/z 59–61 |
| Ruin Dock deck | x 3–15, z 55–65, Y 80 | spruce planks; mooring x 3–7, z 58–62 (sunken 1, open top); chains; sign (16, 82, 60) |
| Island Gate arch | piers x 103–104, z 56–57 & 63–64; keystone (103, 90, 60) | sign at (105, 82, 58) west-facing |
| Hall of Relics | x 48–72, z 26–42 | calcite; door x 59–61 at z 42; 4 pedestals (53,30) (53,38) (67,30) (67,38) — glow item frames at Y 84 |
| Relic items | — | amethyst shard, brick, heart of the sea, nether star |
| Title board | quartz panel x 56–64, z 27; signs at z 28 | Wanderer / Pathfinder / Sky Warden / Citadel Keeper |
| Sky islets | 7 floating decor islets, radius 2–4, ~66–78 from centre | some with mini trees |

Paste behaviour: each schematic carries `WEOffset = [-60, -81, -108]`.
WorldEdit reconstructs the clipboard origin as `Offset - WEOffset`, which is
the local spawn coordinate `(60,81,108)`. Therefore `//paste` puts the
**spawn pad at the paste position**. The island extends 60 blocks east/west,
108 blocks north and 12 blocks south from that position, with its underside
about 62 blocks below the player's feet.

---

## 3. Zones → what each contains (per LOBBY_MAP.md requirements)

1. **Arrival Terrace** — 21×11 paved terrace, quartz spawn pad, lantern posts at
   corners + flanking pad, welcome board, rules board, "server in testing" sign,
   potted azaleas, spruce-stair seats.
2. **Tutorial Path** — 5-wide path; 5 stops with signs + mini displays
   (mini island / mini ruin / shard on pedestal / mini altar / lectern), `/is`,
   `/ruin`, relics, `/donate`, `/chapter`.
3. **Citadel + Donation Altar** — keep with gate; altar dais with lectern,
   amethyst clusters, floating crystal (budding amethyst + block), explanation
   sign; ch3+ orbiting shards; ch5 beacon beam under the crystal.
4. **Chapter Pillars** — 5-pillar ring; pillar *i* restored when chapter *i+1*
   unlocks — per-chapter restored counts: **ch1: 0, ch2: 2, ch3: 3, ch4: 4,
   ch5: 5** (matches concept art A3–A7). Broken pillars = stump + rubble + moss.
5. **Hall of Relics** — calcite hall, glass windows, carpet runner, 4 relic
   pedestals with glow item frames + wall-sign labels + points, title board with
   4 title signs, bookshelf + chest.
6. **Ruin Dock** — spruce dock with log legs, open mooring platform, oak fence
   railing, chains into the void, floating ruin chunk, barrel, lantern posts,
   "Ruin Dock / /ruin" sign.
7. **Island Gate** — 11-wide stone arch, amethyst keystone + cluster, end-rod
   lights, vines, big "/is" sign, stone-brick pad.

---

## 4. Chapters — what changes between versions

| Aspect | ch1 | ch2 | ch3 | ch4 | ch5 |
|---|---|---|---|---|---|
| Curtain wall height | ragged 1–4 | 5 | 7 | 7 | 7 + crenellations |
| Corner towers | stumps ≤6 | 8 | 10 + floor/rim | 12 + lanterns | 15 + gold ring + calcite spire + glowstone |
| Keep hall wall height | ragged ≤5 | 6 | 9 | 9 | 9 |
| Keep roof | none, blackstone rafters | full w/ center hole | full | full + blackstone/gilded band | + quartz drum + gold crown + gold tip |
| Interior | rubble piles | cleared, moss carpet | same | + 4 hanging lanterns | same |
| Courtyard | rubble | gardens (moss, flowers, azalea) | gardens + 3rd tree | + 4th tree | same |
| Altar lanterns | — | 2 front | same | + 2 soul lanterns | same |
| Crystal | dim, no shards | same | + 2 orbiting shards | same | + beacon beam |
| Water theme | — | — | prismarine spire + 4 edge waterfalls | retained | retained |
| Ember hearths | — | — | — | 4 lit blackstone hearths | retained |
| Pillars restored | 0 | 2 | 3 | 4 | 5 |
| Gold present | no | no | no | **yes** (gilded blackstone band, tower rings) | yes (crown, rings, tip) |

Constant across all versions (so pastes stack): spawn pad, terrace, boards,
path + stops, altar position, dock, gate, hall, all 24 sign positions, all
pillar bases.

---

## 5. Signs — complete list (24 per schematic)

Every sign: front text 4 lines, JSON `{"text": "..."}` with `§` colour codes,
black text colour, grey back. Positions are schematic-local; facing = direction
the front faces.

| # | Position (x,y,z) | Facing | Text lines |
|---|---|---|---|
| 1 | (55, 81, 112) | S | §6WELCOME TO / §eLOST SKY / §7the sky citadel / §8awaits repair |
| 2 | (65, 81, 112) | S | §6RULES / §7be kind / §7no griefing / §7have fun |
| 3 | (60, 81, 113) | S | §7server / §ein testing / (blank) / (blank) |
| 4–8 | (56, 82, z), z = 98/94/90/86/84 | E | §6/is §7get your own island · §6/ruin §7drifting ruins dock to the west · §6Relics §7donate them at the altar ahead · §6/donate §7at the amethyst altar · §6/chapter §7watch the story unfold |
| 9 | (62, 82, 77) | W | §dDonation Altar / §7bring relics / §7and /donate / §8repair the citadel |
| 10–14 | pillar bases (53/46, 76/48, 76/74, 44/48, 44/74 area), Y 81 | varies (toward centre) | restored: §dChapter N / §7restored — broken: §8Chapter N / §7not yet / §7awakened |
| 15 | (16, 82, 60) | W | §6Ruin Dock / §7drifting ruins / §7arrive here / §8/ruin |
| 16 | (105, 82, 58) | W | §dIsland Gate / §eType /is / §7to get your / §7own island |
| 17–20 | (53/67, 82, 30/38) ±1 | E/W | §dAmethyst Shard §71 point · §6Brick §75 points · §bHeart of the Sea §710 points · §eNether Star §725 points |
| 21–24 | (57/59/61/63, 81, 28) | S | §7Wanderer §70 relics · §aPathfinder §710 relics · §bSky Warden §725 relics · §6Citadel Keeper §750 relics |

Note: only ~10 of the 24 signs are guaranteed human-readable word-perfect as
above; the pillar/title/dock/gate/altar signs match this table exactly (they are
data-driven from the generator source). If exact in-game text matters, the
source of truth is `tools/zones.js` and `tools/citadel.js` (`addSign` calls).

**Not implemented (from LOBBY_MAP.md B5):** Thai text versions. Signs are
English-only. This was left as a follow-up (needs a Minecraft-compatible Thai
font consideration — §c glyph sizes).

---

## 6. The generator (tools/)

Plain Node.js, **zero dependencies**. Data flow:
`generate.js` → builds voxel `World` (Int32Array + palette) via
`island.js` / `zones.js` / `citadel.js` → `world.js` exports Sponge v2 NBT
(`nbt.js` writer, varint block data, gzip) → `.schem` files.

| File | Role |
|---|---|
| `tools/layout.js` | **All zone coordinates** (single source of truth) |
| `tools/world.js` | `World` class, block palette (`BLOCKS`), Sponge v2 export, sign block-entities, item-frame entities, WEOffset |
| `tools/island.js` | Floating island base: grass plateau, stone-brick rim, tapered underside (stone/tuff/andesite/cobbled deepslate/dripstone), stalactites, hanging roots, glow lichen |
| `tools/zones.js` | terrace, tutorialPath, ruinDock, islandGate, hallOfRelics + helpers (LANTERN_POST, SKY_TREE, GREENERY, HANG_VINE) |
| `tools/citadel.js` | keep(walls/towers/gate/roof/interior/courtyard/vines), altar, pillars — all chapter-aware (`ch` 1–5) |
| `tools/generate.js` | assembles a chapter, adds greenery/islets/lighting sweep, exports + manifest |
| `tools/render.js` | loads .schem, renders top-down + cross-section PNGs (own PNG writer) |
| `tools/render_iso.js` | isometric cube renderer (painter's algorithm, 3-face shading) |
| `tools/poster.js` | composites LOST_SKY_POSTER.png |
| `tools/test_nbt.js` | NBT round-trip smoke test (also exports the parser used by other tools) |
| `tools/test_lobby.js` | **1,087 assertions** against the actual .schem artifacts |
| `tools/rand.js` | seeded RNG (mulberry32) — all generation is deterministic |

Commands:

```
node tools/generate.js            # rebuild all 5 schematics + manifest
node tools/generate.js --only 3   # rebuild one chapter
node tools/render.js              # top-down + cross PNGs
node tools/render_iso.js          # iso_ch1 + iso_ch5 (or: node tools/render_iso.js 3)
node tools/poster.js              # rebuild the poster
node tools/test_lobby.js          # run all 1,087 checks
```

---

## 7. What the tests verify (all passing)

- Sponge v2 header, DataVersion 3953, 121×96×121, palette round-trip, varint decoding
- Island plateau/void/underside taper at sample points
- Every zone's key blocks (spawn pad, path, gates open, jambs, altar, lectern,
  crystal, dock, mooring, chains, arch, keystone, hall, windows, pedestals, title signs)
- Pillar base rings + restored count per chapter (0/2/3/4/5)
- 24 sign block-entities, 4 JSON text lines front + back each; welcome sign and
  `/is` gate sign text present
- 4 item-frame entities (limit 60 per LOBBY_MAP.md)
- No gold in ch1–3; gold in ch4–5; no redstone anywhere
- Spawn→gate walk fully lit (light source within 6/3/5 blocks of every column)
- ch1 interior rubble present; ch5 beacon under crystal
- All 10 PNG previews: correct sizes, no unknown-block magenta pixels, spot-checks
  (dock spruce, ch1 amethyst centre, ch5 gold/calcite centre)

---

## 8. Known gaps / follow-ups

1. **Thai signs** (B5) not implemented — English only.
2. **Two structural test guards to keep green if you edit zones:** ch1-rubble counter
   expects >15 non-air blocks on the keep interior floor ring; lighting test
   requires a light block within dx6/dy-2..3/dz3 of every spawn→gate path column.
3. **Standing-sign rotation:** standing signs (terrace, tutorial stops, dock,
   gate, altar) face exactly N/S/E/W — rotations are multiples of 4 (0/4/8/12),
   no diagonal rotations used.
4. **Item frame UUIDs are synthetic but valid-format**; Minecraft regenerates on paste.
5. **In-game verification pending**: schematic loads in WorldEdit 7.4.5 are
   expected (v2 is its native write format), but nobody has pasted these on a
   live server yet. docs/LOBBY_IMPORT.md has the paste runbook.
6. **Protection**: the import guide now requires WorldGuard and lists the
   `__global__` lobby flags. Keep the lobby whitelist-only until those flags are
   applied and verified with a normal player account.

---

## 9. How to use it (server runbook, short version)

1. Paper 1.21.x + WorldEdit 7.4.5 + Multiverse-Core 4/5 + VoidGen + EssentialsX.
2. `/mv create lobby normal -g VoidGen` (MV4) or `--generator VoidGen` (MV5).
3. Copy `schematics/*.schem` → `plugins/WorldEdit/schematics/`.
4. Fly to the island centre spot → `//schem load lobby_ch1.schem sponge.2` → `//paste`
   (spawn pad appears under you).
5. `/setspawn` on the pad. Configure Essentials `spawn-on-join`.
6. On chapter unlocks: `//schem load lobby_ch<n>.schem sponge.2` → `//paste` (full island
   replacement; all constants stay put).
7. Back up the world before each paste; paste with few players online.
