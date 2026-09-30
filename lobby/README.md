# Lost Sky — Lobby Generator

Builds the **Sky Citadel Plaza** lobby described in `LOBBY_MAP.md`: a 121×121
floating sky island with seven zones, in five story-chapter versions, exported
as WorldEdit-ready Sponge schematics — plus PNG previews and a test suite.

Run everything with plain Node (no dependencies):

```
node tools/generate.js      # build all 5 chapter schematics -> schematics/
node tools/generate.js --only 1   # rebuild just chapter 1
node tools/render.js        # PNG previews (top-down + cross-section) -> preview/
node tools/test_lobby.js    # 1,087-check test suite against the .schem artifacts
node tools/test_nbt.js      # low-level NBT/schematic round-trip smoke test
```

## Outputs

| Path | What |
|------|------|
| `schematics/lobby_ch1.schem` … `lobby_ch5.schem` | paste-ready lobbies (Sponge v2, MC 1.21) |
| `schematics/manifest.json` | sizes, spawn/altar coords, paste offset |
| `preview/index.html` | gallery: top-down views of all chapters + cross-section |
| `docs/LOBBY_IMPORT.md` | how to create the world and paste the schematics |

## Layout (world coords, Y 80 = ground)

```
          N (z-)
     Hall of Relics (z 26-42)
  Dock         CITADEL          Island Gate
  (west)   keep 48-72, altar z 76  (east)
     Terrace + spawn (z 103-113)
          S (z+)
```

Spawn point: (60, 81, 108) facing north. The `WEOffset` in every schematic puts
the spawn pad at the `//paste` position.

## Zones

1. **Arrival Terrace** — spawn pad, welcome/rules boards, "server in testing" sign
2. **Tutorial Path** — five stops: `/is` → `/ruin` → relics → `/donate` → `/chapter`
3. **Citadel + Donation Altar** — keep, gate, lectern altar, floating crystal (beacon beam in ch5)
4. **Chapter Pillars** — 5-pillar ring; pillar *n* restored when chapter *n* unlocks (0/2/3/4/5 per chapter, matching the concept art)
5. **Hall of Relics** — 4 relic pedestals with glow item frames, title board
6. **Ruin Dock** — mooring, chains, drifting-ruin chunk
7. **Island Gate** — arch with amethyst keystone, "/is" sign

Chapter 3 adds a prismarine water spire and four edge waterfalls. Chapter 4
adds four safe blackstone ember hearths; both features remain in later chapters.

## Style rules enforced by tests

- 24 signs, 4 item frames per world (limit: 60)
- no redstone, no gold before chapter 4
- spawn→gate walk lit end-to-end (no mob-spawnable dark pockets)
- every sign has real front text + 4 JSON lines
- chapter look: ch1 ruins w/ rubble → ch5 gold-crowned towers
