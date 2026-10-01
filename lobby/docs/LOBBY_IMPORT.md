# Importing the Lost Sky lobby into your server

Everything is generated: the five schematic files live in `schematics/`, and each
one is a complete 121×121 floating island with all seven zones. You paste one of
them into the `lobby` void world — chapter 1 first, then the next one each time
a chapter unlocks.

## What you need on the server

| Plugin | Version | Why |
|--------|---------|-----|
| WorldEdit | **7.4.2** (as planned in `server/PLUGINS.md`) | pasting the schematics |
| Multiverse-Core | 4 or 5 | creating + managing the `lobby` void world |
| VoidGen | latest for 1.21.x | empty-sky world generator |
| EssentialsX | latest | `/setspawn`, `spawn-on-join` |
| WorldGuard | compatible with Paper 1.21.x / Java 21 | protect the whole lobby world |

All schematics are **Sponge v2, DataVersion 3953 (Minecraft 1.21)** — exactly
what WorldEdit 7.4.x writes natively.

## 1. Create the lobby world

```
/mv create lobby normal -g VoidGen        # Multiverse 4
/mv create lobby normal --generator VoidGen   # Multiverse 5
```

## 2. Install the schematics

Copy every file from this folder:

```
C:\Lost sky\schematics\lobby_ch1.schem  ... lobby_ch5.schem
```

to the server:

```
<server>/plugins/WorldEdit/schematics/
```

## 3. Paste chapter 1 (the ruins)

Fly to where the island's centre should sit, then:

```
//schem load lobby_ch1.schem sponge.2
//paste
```

The `WEOffset` inside each schematic is preset so that **`//paste` puts the
Arrival Terrace spawn pad right where you stood** — you spawn facing north at
the citadel. Centre of the island = where you were standing; the island extends
~60 blocks in every direction and ~50 blocks down.

Paste when few players are online, and back up the world folder first.

## 4. Save the spawn points

Stand on the quartz spawn pad (south terrace) and run:

```
/setspawn
```

Then check `plugins/Essentials/config.yml`: `spawn-on-join` should be `true`
(or `newbies`) so new players arrive on that pad. If you use the `/lostsky
setcitadel` warp from your plugin, stand at the Donation Altar (in front of the
keep gate — the lectern on the quartz pillar) and save it there.

## 5. Upgrading chapters later

When `/lsunlock` opens chapter *n*:

```
//schem load lobby_ch<n>.schem sponge.2
//paste
```

Each version is a **full replacement island** — it pastes over the old one, no
need to delete first. Spawn pad, altar, and all sign positions are identical in
all five versions, so warps and spawn keep working. WorldEdit will ask to
confirm replacing `//paste`. Always paste **without `-a`**: skipping air would
leave old rubble and broken walls wherever the new chapter contains air.

## 6. Protect before opening

`spawn-protection` only covers the main world. Install WorldGuard before
letting players enter `lobby`, then protect the entire world through its
`__global__` region:

```
/rg flag __global__ -w lobby passthrough deny
/rg flag __global__ -w lobby pvp deny
/rg flag __global__ -w lobby mob-spawning deny
/rg flag __global__ -w lobby creeper-explosion deny
/rg flag __global__ -w lobby tnt deny
/rg flag __global__ -w lobby other-explosion deny
/rg flag __global__ -w lobby ghast-fireball deny
/rg flag __global__ -w lobby wither-damage deny
/rg flag __global__ -w lobby enderman-grief deny
/rg flag __global__ -w lobby ravager-grief deny
/rg flag __global__ -w lobby entity-item-frame-destroy deny
/rg flag __global__ -w lobby fire-spread deny
/rg flag __global__ -w lobby lava-fire deny
/rg flag __global__ -w lobby water-flow deny
/rg flag __global__ -w lobby lava-flow deny
```

WorldGuard recommends `passthrough deny` for the global region; do not set its
`build` flag. Enable `high-frequency-flags` in WorldGuard's config so the fire
and fluid-flow flags are enforced. `water-flow deny` also keeps the decorative
waterfalls stable.

Give trusted builders `worldguard.region.bypass.lobby` through LuckPerms while
they work, then remove that permission. Verify protection using a normal test
account before opening. Keep the server whitelist-only until that check passes.

## Generated files

```
schematics/lobby_ch1.schem   ruined citadel          (≈239k blocks)
schematics/lobby_ch2.schem   roots of stone          (≈240k blocks)
schematics/lobby_ch3.schem   drowned spire           (≈241k blocks)
schematics/lobby_ch4.schem   ember halls             (≈241k blocks)
schematics/lobby_ch5.schem   the citadel rises       (≈241k blocks)
schematics/manifest.json     coordinates + report
```

Preview renders: `preview/index.html` (open in a browser) — top-down views of
all five chapters plus a cross-section through the island.
