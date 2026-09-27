# Changelog

Every addition or change goes here: **what** changed, **why**, and **which
commands** it touched. Newest first.

## Next (planned, not built)

- Ruin loot restocking (a loot plugin, or re-pasting with WorldEdit).
- Write the real `/lsunlock` commands per chapter once plugins are installed.
- Citadel hologram that shows relic progress.
- MythicMobs ruin guardians and the chapter 5 boss.
- Put the real server address on the website.

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
