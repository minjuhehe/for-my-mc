# Importing the Lost Sky lobby into your server

Everything is generated: the five schematic files live in `schematics/`, and each
one is a complete 121×121 floating island with all seven zones. You paste one of
them into the `lobby` void world — chapter 1 first, then the next one each time
a chapter unlocks.

## What you need on the server

| Plugin | Version | Why |
|--------|---------|-----|
| WorldEdit | **7.4.5** (as planned in `server/PLUGINS.md`) | pasting the schematics |
| Multiverse-Core | 4 or 5 | creating + managing the `lobby` void world |
| VoidGen | latest for 1.21.x | empty-sky world generator |
| EssentialsX | latest | `/setspawn`, `spawn-on-join` |

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
//schem load lobby_ch1
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
//schem load lobby_ch<n>
//paste
```

Each version is a **full replacement island** — it pastes over the old one, no
need to delete first. Spawn pad, altar, and all sign positions are identical in
all five versions, so warps and spawn keep working. WorldEdit will ask to
confirm replacing //paste — use `//paste -a` (skip air) if you prefer.

## 6. Protect before opening

`spawn-protection` only covers the main world. Until WorldGuard is set up with
a lobby region, **keep the lobby whitelist-only** (builders), as decided in
`LOBBY_MAP.md`.

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
