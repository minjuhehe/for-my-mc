# Changelog

Every addition or change goes here: **what** changed, **why**, and **which
commands** it touched. Newest first.

## Next (planned, not built)

- Ruin loot restocking (a loot plugin, or re-pasting with WorldEdit).
- Write the real `/lsunlock` commands per chapter once plugins are installed.
- Citadel hologram that shows relic progress.
- MythicMobs ruin guardians and the chapter 5 boss.
- Put the real server address on the website.

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
