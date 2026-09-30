# Changelog

Every addition or change goes here: **what** changed, **why**, and **which
commands** it touched. Newest first.

## Next (planned, not built)

- Ruin loot restocking (a loot plugin, or re-pasting with WorldEdit).
- Write the real `/lsunlock` commands per chapter once plugins are installed.
- Citadel hologram that shows relic progress.
- MythicMobs ruin guardians and the chapter 5 boss.
- Put the real server address and contact (Discord) on the website once the
  owner confirms them.
- Import the generated lobby into the `lobby` void world.
- Apply and verify the documented WorldGuard flags before players join.

## 0.4.1: WorldEdit compatibility and lobby safety fixes (2026-10-01)

**Why:** an independent GLM review found that the generated block palette used
zigzag VarInts while WorldEdit reads unsigned LEB128, and that the saved
clipboard origin had the wrong sign. Either issue would break a live paste.

Changed:
- Matched WorldEdit 7.4.5's unsigned LEB128 encoding and corrected `WEOffset`
  so `//paste` puts the Arrival Terrace spawn block at the player's feet.
- Rebuilt the Chapter 5 beacon with a valid 3×3 gold base and a clear beam.
- Added interior lights to every chapter.
- Moved waterfalls under the solid outer rim so players cannot step into a
  hole, and made ember hearths non-burning with hidden light sources.
- Corrected chapter-upgrade instructions to forbid `//paste -a`.
- Added required WorldGuard `__global__` protection flags and a CI workflow.
- Expanded the independent artifact suite from 998 to 1,087 checks, including
  canonical WorldEdit VarInt bytes, clipboard origin, beacon path, entity
  bounds, interior lighting, safe waterfalls and hearths.

Commands documented: WorldGuard `/rg flag` setup for the `lobby` world. No
gameplay command changed.

## 0.3.3: lobby goes in a void world (2026-09-30)

**Why:** the owner chose a separate void world for the lobby, with
protection added later.

Changed:
- `docs/LOBBY_MAP.md`: decision recorded, with world-creation commands,
  spawn setup, and a warning to keep players out until WorldGuard is set up.
- `server/PLUGINS.md`: added Multiverse-Core and VoidGen (lobby), and
  WorldGuard (needed before opening).

No commands changed.

## 0.3.2: lobby map plan and prompts (2026-09-30)

**Why:** the owner asked what the lobby will be and for every prompt needed
to design and build it.

Added:
- `docs/LOBBY_MAP.md`: the lobby is the ruined Sky Citadel on a floating
  island (~121×121) that is rebuilt in 5 versions, one per chapter. It has
  7 zones tied to game systems (spawn, tutorial path, Citadel + donation
  altar, chapter pillars, Hall of Relics, Ruin Dock, Island Gate), a style
  guide, open decisions (void world vs sky, spawn protection), concept-art
  prompts, build-plan prompts, a human builder brief, and a build order.

Found:
- `server/server.properties` has `spawn-protection=0`, so the lobby would
  be unprotected. Written up as a decision in the lobby doc; the file is
  not changed yet.

No commands changed. The lobby uses the existing `/spawn`, `/citadel`,
`/ruin`, `/is` and `/donate`.

## 0.4.0: generated Sky Citadel lobby (2026-09-30)

**Why:** the server needs a real, repeatable lobby whose appearance follows
the five story chapters and can be pasted safely with WorldEdit.

Added:
- `lobby/`: deterministic Node.js generator, five Sponge v2 schematics,
  import guide, preview gallery, poster and source layout documents.
- Seven playable zones: Arrival Terrace, tutorial path, Citadel and donation
  altar, chapter pillars, Hall of Relics, Ruin Dock and Island Gate.
- Chapter 3 prismarine water spire and four three-lane edge waterfalls.
- Chapter 4 blackstone ember hearths; water and ember features persist in
  later chapter versions.
- 1,087 automated checks covering schematic format, paths, signs, lighting,
  chapter changes, entity limits, palette rules and preview rendering.

Commands documented for deployment: Multiverse world creation, WorldEdit
schematic load/paste and Essentials `/setspawn`. No gameplay command changed.

## 0.3.1: first successful MineLan runtime stack (2026-09-30)

**Why:** MineLan runs Paper 1.21.11 on Java 21. BentoBox 3.23.1 used Java
25 bytecode, and MagicCobblestoneGenerator 2.10.0 required a newer BentoBox,
so the SkyBlock engine could not start.

Changed:
- Pinned BentoBox 3.17.0 and MagicCobblestoneGenerator 2.9.0. The previous
  jars were preserved outside the active bundle as incompatible archives.
- Fixed the `/lostsky setchapter` range check so Skript 2.16.2 parses it.
- Updated the MineLan guide and plugin list with the tested Woodlands Pack,
  Java 21 and plugin versions.
- Verified `bbox version`: BSkyBlock 1.20.0, Challenges 1.8.1, Level 2.29.0
  and MagicCobblestoneGenerator 2.9.0 all report `ENABLED`.
- Verified `skript reload lostsky`: the script reloads successfully after a
  clean server restart.

Commands checked: `bbox version`, `skript reload lostsky`, `plugins`,
`whitelist list`. No player command was marked `live` because in-game testing
is still pending.

## 0.3.0: Thai website (2026-09-29)

**Why:** players need a clear Thai page about the story, how to get ready,
the rules and the commands. It must be honest that the server is still in
development and nothing is tested in game yet.

Changed:
- `website/index.html` rewritten in Thai: intro, status (confirmed / draft /
  plan / waiting), how it works, how to get ready, the 5 chapters as
  keyboard tabs, relics and titles, rules, player commands with filter and
  copy buttons, FAQ.
- Server address and contact show "รอประกาศ" (no IP, no fake button).
- Team 4, PvP off, Java only and whitelist are labelled as plans for the
  test period, not confirmed settings. Chapter goals are labelled as
  starting numbers. `[Founder]` is labelled as a plan (not in the script).
- Floating-island art is now inline SVG with CSS animation (replaces the
  canvas). Animation stops with reduced motion.
- New files: `website/assets/site.css`, `website/assets/site.js`,
  `website/assets/favicon.svg`.
- Mobile menu button, skip link, visible focus, tap targets 40px or taller, WCAG AA
  colour contrast in light and dark mode.
- `docs/DEV_NOTES.md` section 4 rewritten: files, content rules, badges,
  how to test.

Not changed:
- `.github/workflows/pages.yml` still publishes `website/` from `main`.
- No commands changed. All game commands stay `draft` or `planned`.

## 0.2.5: `lostsky-minelan` skill (2026-09-28)

**Why:** the owner wants a future Claude session, with panel access or
screen control, to pick up where this one stopped.

Added:
- `.claude/skills/lostsky-minelan/SKILL.md`: project map, Minelan panel
  facts (Paper 1.21.11 locked to Java 21, no API keys, hourly billing),
  plugin status, the open BentoBox/WorldEdit Java problem, remaining steps,
  how to guide the owner, and safety rules.

No commands changed.

## 0.2.4: Java 25 required (2026-09-28)

**Why:** on the first real start, BentoBox 3.23.1 and WorldEdit 7.4.6 failed
to load with `UnsupportedClassVersionError (class file version 69.0)`. They
need Java 25, and the server was on Java 21. The other 7 plugins loaded fine.

Changed:
- `server/PLUGINS.md` and `docs/INSTALL_MINELAN.md`: server must run Java 25.

No commands changed.

## 0.2.3: plugin choices on Minelan (2026-09-28)

**Why:** the original Vault isn't on Modrinth, which is where the Minelan
Plugins tab searches.

Changed:
- `server/PLUGINS.md`: use **VaultUnlocked** (a drop-in Vault replacement)
  and note that the server runs Paper 1.21.11.

No commands changed.

## 0.2.2: Minelan install guide (2026-09-28)

**Why:** the server is now rented at Minelan (Spider Pack, 8 GB RAM,
"Minecraft Cross"). The owner needs clear steps to install everything
through the Minelan panel.

Added:
- `docs/INSTALL_MINELAN.md`: Paper version, plugin list, uploading
  `lostsky.sk`, settings, first test, and Bedrock notes.

No commands changed.

## 0.2.1: website "how to join" + rules (2026-09-27)

**Why:** new players need to know what to install and how to get in before
they read about the story.

Added to `website/index.html`:
- Sticky top menu with links to each section.
- **What you need to play**: Java Edition 1.21.x, whitelist, how to add the
  server, allowed/banned client mods, team size.
- **Rules** section.

Decisions written onto the website (defaults, change them if you disagree):
- Team size: **4 per island**.
- PvP: **off everywhere**, ruins included (matches `pvp=false`).
- Java only, whitelist on (matches `server.properties`).

No commands changed.

## 0.2.0: ruins, chapter unlocks, titles, website (2026-09-27)

**Why:** 0.1.0 announced new chapters but they didn't unlock anything, and
ruins had to be placed by hand every time. Players also had nowhere to read
about the server before joining.

Added:
- **Automatic ruins.** Admins save pre-built "ruin sites" with a tier. Every
  2 hours a random site the current chapter allows opens as `/ruin` (5-minute
  warning, open for 45 min). Off by default.
- **Chapter unlocks.** Admins save console commands per chapter. They run
  when the chapter unlocks. No script edits are needed to change unlocks.
- **Titles.** Donating updates your LuckPerms chat prefix at 10/50/150/400
  points. `/relics` shows your title.
- **Website** at `website/index.html` with the story, chapters, relics,
  titles, how to join and the player commands. The workflow
  `.github/workflows/pages.yml` publishes it to GitHub Pages.
- `EssentialsX Chat` added to the plugin list (it shows the prefixes).

Commands added (all `draft`):
- Admin: `/lostsky spawnruin|addsite|delsite|sites|autoruins`,
  `/lsunlock`, `/lsunlocks`, `/lsunlockclear`

Commands changed:
- `/lostsky setruin` works the same, but now shares its code with auto-ruins.
- `/relics` now also shows your title.

Automatic console commands (new):
- `lp user <name> meta setprefix 100 "<title>"` when a title is earned.

Notes for developers:
- `/lostsky setchapter` does NOT run unlocks.
- Season reset keeps sites and unlocks. See `docs/DEV_NOTES.md`.

## 0.1.0: first draft (2026-09-27)

**Concept chosen:** Skyblock with the "Lost Sky Civilisation" twist, a
server-wide story where players recover relics from drifting ruins to rebuild
the Sky Citadel over 5 chapters.

Added:
- `README.md`: overview and the "always write notes" rule.
- `docs/CONCEPT.md`: story, chapters, relics, ruins, economy, titles.
- `docs/COMMANDS.md`: command and permission reference.
- `docs/DEV_NOTES.md`: server stack, how systems connect, script internals.
- `server/PLUGINS.md`: plugin list.
- `server/server.properties`: starter settings (whitelist on, PvP off).
- `server/plugins/Skript/scripts/lostsky.sk`: story system (draft, untested).

Commands added (all `draft`):
- Player: `/chapter`, `/relics`, `/donate`, `/citadel`, `/ruin`
- Admin: `/lostsky setchapter|addrelics|giverelic|setcitadel|setruin|clearruin`

Notes for developers:
- Relics are identified by the lore line `Lost Sky Relic`, not the name.
- Chapter unlocks only broadcast for now. Content unlocking is a TODO.
- Ruins are placed by hand with WorldEdit + `/lostsky setruin`.
