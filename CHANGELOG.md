# Changelog

Every addition or change goes here: **what** changed, **why**, and **which
commands** it touched. Newest first.

## 0.8.2: Inventory hover sell prices (2026-10-03)

Added LostSkyWorth1.0.0 with ProtocolLib: English per-item and stack sell quotes from EconomyShopGUI on cloned display items. Original item data stays unchanged; no new commands or permissions. Owner confirms ordinary selling earns money; exact amounts and Relic return remain pending. Source and build instructions retained. Client hover verification pending.

## 0.8.1: Website for the new shop, island selector and playtest results (2026-10-03)

**Why:** EconomyShopGUI replaced the six-item script shop, the island
selector is installed, and the owner confirmed new flows in game.

Changed (website and its checks only):
- Hub: removed the old fixed crop and supply price tables (no longer
  current). Market card explains the sell box (`/sell`, `/sellgui`,
  `/market`: drop items, close to sell, unsellable items returned) with a
  warning not to put Relics in it. Shop card explains `/shop` / `/skyshop`
  categories with prices read in game. Quest rewards unchanged.
- Status: tested (one owner account) `/is` selector -> Restoration City and
  `/shop` / `/sell` menus opening; pending: shop amounts and Relic return,
  creating several islands, multi-member teams, isolation. Old single
  cobblestone purchase removed (old shop).
- Team: one island = one team, up to 3 islands incl. memberships, one city
  per island, `/city go 2`; incremental restoration shown as an unbuilt
  future plan only.
- Commands: 20 player commands; `/is` tested, `/shop`, `/skyshop`, `/sell`
  partly tested, `/city go <slot>` added (awaiting test).
- FAQ: how many islands, joining a friend's team keeps your islands
  (awaiting multi-player test), where shop prices are, how to sell.
- Checks: 107 (`tests/website/check-site.js`), including no `$` prices in
  shop/market cards and badge sets matching the playtest docs. Verified by
  planting an old price and a wrong badge (both caught).

Unchanged: top-up closed, no payments, no IP, map decoration unfinished.
No commands changed. Server scripts not touched.

## 0.8.0: Island selector, one island = one team (2026-10-03)

**Why:** the owner wants players to hold several islands, each a separate
team with its own restoration city, and `/is` to open a selection menu first.

Added (draft, not loaded on the server yet):
- `lostsky-islands.sk`: Your Islands menu (`/islands`, and plain `/is` once
  BSkyBlock `default-action`/`new-player-action` are set to `/islands`).
  Island slot -> Go to Island / Restoration City / City Menu; empty slot ->
  create confirmation -> native `bskyblock:island create`; locked slots above
  the native limit. Active island stored as BentoBox island ID and
  re-validated (exists, BSkyBlock world, player in team) on every action.
- `lostsky-city.sk`: city key = active island; `/city <slot>`,
  `/city go [slot]`, `/is city [slot]`, `/is city go [slot]`; Choose Island
  button. Existing city data (keyed by island ID) unchanged.
- `docs/ISLAND_SELECTOR.md`: required config (`concurrent-islands: 3`,
  `disallow-team-member-islands: false`), API evidence, limits, live test
  checklist, rollback.
- `tests/islands/check-islands.js`: 70 offline checks against BentoBox 3.17.0
  and BSkyBlock 1.20.0 source (API signatures, behaviour facts), script
  structure, identity/safety rules, docs.

Found in BentoBox source: with the default `disallow-team-member-islands:
true`, accepting a team invite deletes the player's existing islands.

Commands added: `/islands` (`/myislands`); slot argument for `/city`,
`/city go`, `/is city`, `/is city go`. No other `/is` subcommand changed.
Hub, market and shop scripts not touched. No server commands were run.

## 0.7.6: Website player-test results, font pack join steps, English game UI (2026-10-03)

**Why:** first player tests (`docs/PLAYTEST_20261003.md`) and the required
Thai font pack (`docs/RESOURCE_PACK.md`).

Changed (website and its checks only):
- Status: new "tested with a player" card with the exact results (one owner
  account): `/menu` opens; `/city go` reaches the team's own city; one
  cobblestone purchase charged $32 and gave 32; builder quest gave $80 + 2
  genuine shards and blocked an immediate retry. Still awaiting tests: crop
  selling, farmer quest, real 24-hour reset, full bag, multi-member teams,
  donation, chapter change. Floating text and map decoration: being worked on.
- Commands: `/menu` and `/city go` tested; `/skyshop` and `/skyquests`
  partly tested (new "ทดสอบบางส่วน" badge and legend entry).
- Hub: per-quest badges (builder tested, farmer awaiting) and the English
  in-game quest names (Harbor Supplies, Apprentice Builder).
- English game UI (Codex 037447b): status, join steps and a new FAQ say the
  game's menus are in English while the website stays Thai. `/skyguide` no
  longer described as a Thai guide. The font pack is still required.
- Join steps + FAQ: accept the ThaiFontFix pack; how to enable Server
  Resource Packs if the prompt doesn't appear. Removed "nothing to download".
- Checks (`tests/website/check-site.js`, 104 total): badges must match the
  playtest doc, untested items must stay untested, pack steps present,
  decoration marked unfinished. Verified by planting false claims (caught).

Unchanged: top-up closed, no payments, no IP. No commands changed. Server
scripts and lobby files not touched.

## 0.7.5: Required Thai font pack and quest check (2026-10-03)

- Selected ThaiFontFix1.0.8, author-declared Java1.21.11 compatibility,
  direct author CDN download with verified SHA1. Required server pack setup
  documented in RESOURCE_PACK.md; client join/render test pending.
- Builder delivery reward verified: $80, two genuine Common Shards, consumed
  128 cobblestone. Owner confirms immediate retry refuses until24hours.
- Added default essentials.balance permission after /money was denied.
  No balance-other or administrative money permissions granted.

## 0.7.4: Restore package and player city warp (2026-10-03)

- Player confirmed the supplies menu rejects a purchase with insufficient
  money. Added clearer shop name and /skyguide earning-money steps; $32 of
  test currency provided for one cobblestone purchase. Live balance $32 -> $0
  and inventory32 cobblestones confirmed success; hub reload passed. Detailed
  evidence and remaining cases are in PLAYTEST_20261003.md.
- Verified owner `/city go` reaches the team world at Y100 using live entity
  position and dimension. Multi-member identity and donation are still pending.
- Corrected outdated spawn/city installation guides to the installed market
  hub. Refreshed local reinstall ZIPs with the current market, hub, city and
  selftest scripts plus all schematics; verified required ZIP entries.
- The packages contain setup files, not player/world/database backups.

## 0.7.3: Live hub verification and project handoff (2026-10-03)

- Pasted the market hub; verified five zone floor/roof checks and seven NPCs.
- Setup commands load chunks before entity placement and remove forced chunks
  afterwards; global spawn protection includes crop trampling and chest access.
- Fixed city paste side effects/buffering to avoid the observed server pause.
- Added isolated console tests `/lstownselftest` and `/lscityselftest`; both
  passed live. Real player trades, quests and city warp remain pending.
- Chapter signs now route to team-city commands instead of old global progress.
- Recorded owner's estimate of 20% map completion and deferred decoration.
  Prepared Your dot handoff; no dot creation or external GLM connection claimed.

## Next (planned, not built)

- Ruin loot restocking (a loot plugin, or re-pasting with WorldEdit).
- Write the real `/lsunlock` commands per chapter once plugins are installed.
- Citadel hologram that shows relic progress.
- MythicMobs ruin guardians and the chapter 5 boss.
- Put the real server address and contact (Discord) on the website once the
  owner confirms them.
- Import the generated lobby into the `lobby` void world.
- Apply and verify the documented WorldGuard flags before players join.

## 0.7.2: Website review fixes (2026-10-03)

**Why:** owner review of 0.7.1, plus new server status (hub pasted, NPCs and
protection verified, scripts reload and self-test pass).

Changed (website only):
- Status: hub shown as installed (all five zones, 7 guide NPCs, area
  protection). Trading, quests, `/menu` and `/city go` shown as installed
  but awaiting a player test. Only `/spawn` and `/hub` are marked tested.
- Rules: replaced "one person, one account" with "no alt accounts to collect
  duplicate quest rewards".
- Top-up: shorter, player-facing text. Still closed, with no prices or
  payment details.
- Footer date: 3 October 2026.
- Fixed: status-card sentences with commands were broken onto separate lines.
- Menu: switches to the menu button below 72em (follows the reader's font
  size) and wraps instead of clipping if links ever don't fit.
- Chapter tabs on phones now show chapter names, not just numbers.

Added:
- `tests/website/check-site.js` + README + `REPORT.md` (94 checks): layout,
  contrast of every text element, clipping, header at 17 widths, menu jumps,
  content rules, interaction, reduced motion, no-JS.

No commands changed. Server scripts and lobby files were not touched.

## 0.7.1: Website for the hub, team cities and top-up notice (2026-10-02)

**Why:** the design moved to one shared hub with four zones and a separate
restoration city for every team. The website still described a single
server-wide Citadel.

Changed (website only):
- Hub section: the real hub render (`website/assets/spawn-market.png`),
  zone key with roof colours, crop market and supplies price tables, and
  the two 24-hour delivery quests. All marked รอทดสอบ (awaiting playtest).
- Team section: island vs team city comparison, five chapter tabs with
  team goals 100/300/600/1000. No wording about a shared server city.
- Map gallery: hub render + five team city renders
  (`website/assets/maps/city-ch1.png` … `city-ch5.png`), labelled as
  renders, with Thai alt text.
- Top-up section: clearly "not open". No forms, prices or payment details.
- Commands: 18 player commands in 4 filter groups (hub, shops and quests,
  island, team city). `/spawn` and `/hub` are shown as tested, the rest as
  awaiting playtest. The old server-wide `/chapter`, `/donate`, `/citadel`,
  `/relics` and `/ruin` are no longer listed for players.
- Status: Paper 1.21.11 and the private whitelist test shown as confirmed.
  No IP, Discord, player counts or opening date.
- `docs/DEV_NOTES.md` section 5 rewritten for the new content rules.

No commands changed. Server scripts and lobby files were not touched.

## 0.7.0: Public town zones and delivery quests (2026-10-03)

New floating town has a fountain plaza, green crop market, cyan supplies
shop, purple quest hall, gold top-up lounge and team city pavilion.
Adds `/market`, `/skyshop`, `/skyquests`, `/topup` and console-only
`/lshubbuild`. Hub menu links all zones. Crop sales and supplies use
Essentials/Vault in-game money. Two delivery quests grant money and relics
once per UUID every 24 hours. Payment URL remains unset until provided;
no real-money collection or fake checkout. Actual schematic preview is
available for the website. Live validation pending deployment.

## 0.6.0: Separate travel spawn and team city plots (2026-10-01)

Rebuilt public spawn as a compact compass plaza with three travel pavilions.
Moved the five restoration maps into per-team plots in `lostsky_cities`.
Added `/city`, `/city go`, `/city donate`, `/is city`, `/is city go` and a
team city menu button. Cities follow the BentoBox island ID, preserving
team sharing and ownership transfers. Added skript-reflect 2.6.3 for the
BentoBox/WorldEdit API connection. Team relic totals and visual chapter
replacement are separate from the original server-wide prototype.

## 0.5.0: Shared harbour spawn (2026-10-01)

Prepared an independent restored-city spawn schematic without story signs
or relic item frames. Added native floating headings and two villager guides
opening a Thai Skript menu. Added `/hub` and `/lobby` aliases for Essentials
spawn, `/menu` (`/skymenu`) and `/skyguide`. Added void rescue in lobby and
inventory click/drag protection. `/spawn` remains EssentialsSpawn with a
default-group permission. Team city progression is planned separately; the
existing server-wide donation script is not migrated by this change.

## 0.4.3: Live lobby import correction (2026-10-01)

Imported chapter 1 into the new lobby. Use `//schem load lobby_ch1.schem
sponge.2` before `//paste`: an extensionless filename fails validation,
and the default reader selects v3 for our v2 files. Corrected the invalid
`minecraft:chiseled_quartz` palette entry to `minecraft:chiseled_quartz_block`
in all five chapters, including the spawn pad. Regenerated schematics and
passed all 1,087 lobby checks plus the NBT smoke test. Player commands unchanged.

## 0.4.2: New server recovery and Java 21 correction (2026-10-01)

Restored the pinned SkyBlock plugins, Lost Sky script and five schematics to
new MineLan server 9623747d. Corrected WorldEdit to 7.4.2 and WorldGuard to
7.0.16 after live logs proved the newer jars require Java 25. Created lobby
and saved all 15 global protection flags. Enabled high-frequency flags.
Player commands unchanged. Lobby paste and non-OP test remain pending.

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

- Lobby label repair: disable display shadows, improve background contrast, and move plaza heading clear of the central pillar. Player visual retest pending.

- Follow-up: use minecraft:uniform specifically for lobby text displays after shadow-only adjustment failed; preserve ThaiFontFix for client UI.

- Player-facing Lost Sky menus, command messages and10 lobby labels now use English. Commands, prices, rewards and saved progress are unchanged. Required ThaiFontFix remains enabled at the owner's request for future resource-pack expansion.

- English floating NPC labels now use the default font with bold styling for readability.

- Install EconomyShopGUI catalog and empty sell-on-close GUI, unify hub/NPC entry points via /market and /skyshop, route /sell to sellgui. NPC labels made bold. Island selection work pending.

- Clarify hover tooltips with Buy and Sell prices from EconomyShopGUI; owner confirms both GUIs open.

- Remove floating-label backgrounds at owner request; keep bold English lettering.

- Live selector reload fixed: use the function's explicit player parameter when executing native island creation. Both island and city scripts reload successfully.

- Activate /is selection menu with3 concurrent-island slots and separate teams; preserve other islands when accepting team invites. Native config installed and startup checked, player tests pending.

- Save accepted future city restoration design: materials fund staged construction per island/team; no map changes applied. Record owner confirmation of basic island selector/warp flow.

- Align island checker with the live-corrected explicit player parameter;70/70 offline source/structure checks pass locally.
