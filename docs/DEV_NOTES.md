# Developer Notes

Current direction: shared public spawn and independently restored team
cities. See `SHARED_SPAWN.md`. `lostsky-hub.sk` supplies hub navigation and
menus; `lostsky.sk` below remains the earlier server-wide prototype until
the team-progress migration. Never re-paste shared spawn on story unlocks.

Read this before you change anything. It explains how the game is put
together, so you can change one part without breaking another.

## 1. Server stack

| Layer | Choice | Why |
|-------|--------|-----|
| Server software | **Paper** (latest stable 1.21.x) | Fast, supports all the plugins below |
| Islands | **BentoBox + BSkyBlock addon** | Standard Skyblock engine: islands, teams, protection |
| Island level / top | BentoBox **Level** addon | `/is level`, `/is top` |
| Challenges | BentoBox **Challenges** addon | Weekly challenges, money source |
| Generators | BentoBox **MagicCobblestoneGenerator** addon | Generator tiers unlocked per chapter |
| Story system | **Skript** + `lostsky.sk` | Chapters, relics, Citadel, ruin warp. Easy to edit without Java |
| Economy | **Vault** + **EssentialsX** | Money, `/bal`, `/pay`, `/spawn` |
| Permissions | **LuckPerms** | Groups `default`, `mod`, `admin` |
| Ruin building | **WorldEdit** (or FAWE) | Paste ruin schematics |
| Logging / rollback | **CoreProtect** | Grief checks |
| Custom mobs (later) | **MythicMobs** | Ruin guardians and chapter bosses |

Full plugin list with notes: `server/PLUGINS.md`.

MineLan runtime verified on 2026-09-30: Paper 1.21.11 build 132, Java 21,
BentoBox 3.17.0, BSkyBlock 1.20.0, Challenges 1.8.1, Level 2.29.0 and
MagicCobblestoneGenerator 2.9.0. Keep these versions together; BentoBox
3.23.1 requires Java 25, while MagicCobblestoneGenerator 2.10.0 requires
BentoBox 3.19.1 or newer.

## 2. How the pieces connect

```
 Player island (BSkyBlock) ── money ──► Vault/Essentials ◄── money ── /donate
                                                                      │
 Ruin island (WorldEdit paste) ── loot chests ──► relic items ────────┘
                                                                      │
                                   lostsky.sk: {lostsky::relics} total
                                                                      │
                                   checkChapter() ──► broadcast new chapter
                                                       (TODO: unlock content)
```

## 3. `lostsky.sk`: the story script

File: `server/plugins/Skript/scripts/lostsky.sk`

### Saved variables (these persist across restarts)

| Variable | Meaning |
|----------|---------|
| `{lostsky::chapter}` | Current chapter, 1–5 |
| `{lostsky::relics}` | Server-wide relic points donated |
| `{lostsky::points::<uuid>}` | One player's personal Citadel points |
| `{lostsky::goal::<n>}` | Relic total needed to reach chapter `n` (set on load) |
| `{lostsky::name::<n>}` | Display name of chapter `n` (set on load) |
| `{lostsky::citadel}` | Citadel warp location |
| `{lostsky::ruin}` | Active ruin warp. Unset when no ruin is up |
| `{lostsky::site::<id>}` | Location of a pre-built ruin site |
| `{lostsky::sitetier::<id>}` | Tier of that site = earliest chapter it can appear |
| `{lostsky::autoruins}` | `true` = open a random ruin every 2 hours |
| `{lostsky::unlocks::<n>::*}` | Console commands to run when chapter `n` unlocks |
| `{lostsky::title::<uuid>}` | The last title prefix given to a player |

**Season reset:** reset only the progress, not the setup:
`chapter`, `relics`, `points::*`, `title::*` (and remove the LuckPerms
prefixes). Keep `site::*`, `sitetier::*`, `unlocks::*`, `citadel` so the
next season can reuse them. Do it only between seasons.

### How relics are recognised

A relic is real only if **the first lore line is `Lost Sky Relic`**
(colour codes ignored). The item type then sets its value:

| Type key | Item | Points |
|----------|------|-------:|
| `shard` | amethyst shard | 1 |
| `tablet` | brick | 3 |
| `core` | heart of the sea | 10 |
| `crown` | nether star | 25 |

We check the lore and not the name because anvils can rename items but
cannot add lore. If you add a new relic type, change **both**
`relicItem()` and `relicValue()`, then update the tables here, in
`docs/CONCEPT.md` and in `docs/COMMANDS.md` (`giverelic` types).

To put relics in ruin loot chests, use `/lostsky giverelic <you> <type>`
and place the items in the schematic's chests before saving it.

### Chapter unlocking

`checkChapter()` runs after every donation and after `/lostsky addrelics`.
When the total reaches the next goal it moves the chapter up, broadcasts,
and calls `runUnlocks(n)`. It calls itself again so one big donation can
skip more than one chapter (each skipped chapter still runs its unlocks).

**Unlocks are data, not code.** Admins save console commands per chapter
with `/lsunlock <chapter> <command>`. The script doesn't know about
generators or biomes. It only runs what was saved. So to change what a
chapter unlocks, you don't edit the script. You use `/lsunlocks` to look
and `/lsunlockclear` + `/lsunlock` to change.

Plan for the first season (fill these in on the real server, and write
the exact commands into `docs/CHAPTER_UNLOCKS.md` when they're known):
- Ch 2: generator tier 2 + forest/plains biomes
- Ch 3: ocean biome + island size upgrade
- Ch 4: nether biome + lava generator
- Ch 5: sky biome + elytra recipe + boss event

⚠ `/lostsky setchapter` does **not** run unlocks. It only moves the number.
Use it for fixing mistakes, not for progressing the story.

### Ruins

Ruins don't really fly in. They are **pre-built ruin sites** far from
spawn (e.g. 5 000+ blocks away in the island world, or in a separate
void world). "Drifting in" means the `/ruin` warp opens to one of them.

Setup (once per ruin):
1. Build or paste the ruin with WorldEdit. Put relics in its chests.
2. Stand at its entrance: `/lostsky addsite <id> <tier>`.
   Example: `/lostsky addsite mossy_tower 1`.
3. When you have a few sites: `/lostsky autoruins on`.

What happens then:
- Every 2 hours (real time) the script picks a random site with
  `tier <= current chapter`, broadcasts a 5-minute warning, then opens
  `/ruin` for 45 minutes.
- If a ruin is already open, that round is skipped.
- `/lostsky setruin` still works for a one-off ruin at your position.

⚠ **Loot does not refill by itself yet.** After a ruin closes, an admin
has to restock its chests (or re-paste it with WorldEdit). Automatic
restocking is in `CHANGELOG.md` → Next.

### Titles

After every donation `updateTitle()` checks the player's points and, if
they've reached a new title, runs
`lp user <name> meta setprefix 100 "<title>"`. EssentialsX Chat shows the
prefix in chat. Thresholds are in `titleFor()` and must match the
table in `docs/CONCEPT.md`.

## 4. Lobby schematics

The generated lobby lives in `lobby/`. `lobby/tools/generate.js` is the source
of truth and writes five complete Sponge v2 schematics to `lobby/schematics/`.
Each version is 121×96×121, uses Minecraft 1.21 DataVersion 3953 and carries a
WorldEdit offset that places the Arrival Terrace spawn pad at the paste point.

Deployment order:

1. Install Java 21 compatible Multiverse-Core, VoidGen and WorldGuard alongside
   the tested WorldEdit 7.4.2.
2. Create a separate void world named `lobby`.
3. Copy `lobby/schematics/*.schem` to `plugins/WorldEdit/schematics/`.
4. Paste `lobby_ch1` at the intended spawn position, then set Essentials spawn.
5. Protect the complete `lobby` world with WorldGuard's `__global__` region.
6. Paste the matching full schematic without `-a` when a later chapter unlocks.

Run `node lobby/tools/test_lobby.js` after any generator change. The current
suite has 1,087 checks. Back up the lobby world before every paste and keep it
whitelist-only until a WorldGuard region is configured. Exact coordinates,
paste behavior and the live-server checklist are in
`lobby/LOBBY_HANDOFF.md` and `lobby/docs/LOBBY_IMPORT.md`.

How it connects:
- EssentialsX `/setspawn` sits on the Arrival Terrace.
- `/lostsky setcitadel` is set at the donation altar.
- The Ruin Dock is decoration: `/ruin` still warps to configured ruin sites.
- Islands remain in the BSkyBlock world; only the shared Citadel uses `lobby`.
- The script cannot paste schematics, so an admin pastes the matching version
  after a chapter unlock.

The spawn point, altar and all sign positions are identical in every version,
so saved warps remain valid across chapter upgrades.

## 5. Website

Thai-language info page. Static files, no build step, no backend, no forms.

| File | What it holds |
|------|---------------|
| `website/index.html` | All content (Thai). Sections: `#intro`, `#status`, `#how`, `#hub` (with `#zone-market`, `#zone-shop`, `#zone-quests`), `#team`, `#relics`, `#gallery`, `#start`, `#rules`, `#commands`, `#topup`, `#faq` |
| `website/assets/site.css` | Colour tokens (light + dark, plus hub zone swatches), layout, reduced-motion rules |
| `website/assets/site.js` | Mobile menu, chapter tabs, command filter, copy buttons, current-section highlight |
| `website/assets/spawn-market.png` | Hub render, generated by `lobby/tools/render.js` (supplied with the market build) |
| `website/assets/maps/city-ch1.png` … `city-ch5.png` | Team city renders, copied from `lobby/preview/iso_ch*.png` |
| `website/assets/favicon.svg` | Tab icon |

`.github/workflows/pages.yml` publishes the whole `website/` folder to
GitHub Pages on every push to `main` that touches `website/`. Pages must be
set to "GitHub Actions" in the repo settings once. **Not deployed yet.**

### What the site describes (as of 2026-10-03)

- **One shared, protected hub** with a central fountain and four zones:
  crop market `/market`, supplies shop `/skyshop`, delivery quests
  `/skyquests`, top-up lounge `/topup`. Roof colours on the render:
  green, cyan, purple, gold. A team city pavilion leads to `/city go`.
  `/spawn` (and `/hub`, `/lobby`) return to the hub, and `/menu` opens it.
  The hub is shown as **installed** (zones, 7 guide NPCs, protection
  verified on the server).
- **Player-test badges follow `docs/PLAYTEST_20261003.md` only.** As of
  2026-10-03 (one owner account): tested = `/spawn`, `/hub`, `/menu`,
  `/city go`; partly tested = `/skyshop` (one cobblestone purchase, $32 → 32
  blocks; refuses without money) and `/skyquests` (builder quest: 128
  cobblestone → $80 + 2 genuine shards, immediate retry blocked). Everything
  else stays รอทดสอบ: crop selling, farmer quest, 24-hour expiry, full bag,
  GUI drag/shift-click, multi-member teams, donation, chapter change.
- **Join steps** explain the required ThaiFontFix pack
  (`docs/RESOURCE_PACK.md`): accept the prompt; if it never appears, set
  Server Resource Packs to Enabled or Prompt. Floating hub text is "being
  adjusted" and map decoration "unfinished"; don't claim either is done.
- **In-game UI is English** (since Codex `037447b`); the website stays
  Thai. Show English in-game names where players need to match them
  (quest names, menu examples). The font pack stays required.
- **Prices and rewards** shown in tables must match `lostsky-market.sk`.
  If the script changes, update `#zone-market`, `#zone-shop` and
  `#zone-quests` in the same commit.
- **Each BentoBox island/team has its own restoration city.** Never write
  that the whole server restores one shared city. Island (`/is`, free
  build) and city (`/city`, protected prefab) are separate.
- **Team chapter goals:** cumulative team relic points 100/300/600/1000.
- The old server-wide `/chapter`, `/donate`, `/citadel`, `/relics` and
  `/ruin` commands are **not** listed for players (prototype only).

### Rules for the content

- **Say only what is true.** The server is in a private whitelist test.
  Never add the server IP, player counts, online status, reviews, an
  opening date, Discord or payment details unless the owner confirms them
  for publishing.
- **Top-up stays "not open"** until the owner gives official payment
  details. No forms, no prices, no fake checkout. The page must never ask
  for passwords, card or bank details.
- **Every claim has a status badge:**
  - `b-ok`: ยืนยันแล้ว / ทดสอบแล้ว (decided, or passed an in-game test).
  - `b-draft`: รอทดสอบ (installed or written, not playtested yet).
  - `b-plan`: แผน (intended, may change).
  - `b-wait`: รอประกาศ / ยังไม่เปิด (no information yet, or not open).
- **Commands follow `docs/COMMANDS.md`:** `live` → ทดสอบแล้ว, anything
  else → รอทดสอบ. Change a badge only after a real in-game test.
- Rules ban alt accounts only for collecting duplicate quest rewards. The
  owner plays on two accounts, so there is no one-person-one-account rule.
- Team size 4 and PvP off are shown as **แผน**. Paper 1.21.11 and the
  whitelist test are shown as confirmed.
- Map images are renders of the schematic files, and the captions say so.
  Replace them with in-game screenshots once those exist (keep the
  `width`/`height` attributes and Thai `alt` text).

If you change the hub, prices, quests, chapters, relics, rules or player
commands in the docs or scripts, **update the website in the same commit**.

### How it's built

- The hero art is inline SVG (the `#isle` symbol), and the relic icons are
  8×8 SVG (`.px-*` classes). The map renders are PNG files with fixed
  `width`/`height` so the layout doesn't jump while they load.
- Works without JavaScript: all 5 chapters and all commands show, and the
  copy and filter buttons stay hidden. JS adds the `js` class to `<html>`.
- Chapter tabs follow the WAI-ARIA tabs pattern: arrow keys, Home and End.
- `prefers-reduced-motion: reduce` turns off all animation.
- Fonts come from Google Fonts (Taviraj, IBM Plex Sans Thai Looped, IBM Plex
  Mono), with Thai system fonts as fallback.

### Testing before a push

Run `node tests/website/check-site.js` (see `tests/website/README.md`).
It covers everything below and writes a report with screenshots. Update its
content checks when the server status or prices change.

Manual equivalent: serve the folder (`python3 -m http.server -d website 8765`) and check:
desktop (1280px) and phone (390px) widths in light and dark mode, no
sideways scrolling, every image loads, every `#link` and file link works,
the mobile menu (open, link, Escape), chapter tabs with the keyboard,
command filters and copy buttons (mouse and keyboard), visible focus, FAQ
with Enter, reduced motion, and the page with JavaScript turned off. Also
search the page for an IP address, "Discord" and shared-city wording.

## 6. Conventions

- Every new command gets a row in `docs/COMMANDS.md` with a permission,
  a source and a status (`planned` / `draft` / `live`).
- Custom permissions start with `lostsky.`
- Custom messages start with the `{@prefix}` option.
- Change a status to `live` only after testing it on a real server.
- Every change gets a `CHANGELOG.md` entry.

## New MineLan instance (2026-10-01)

2026-10-03: public town replacement has four commerce/quest/lounge zones.
`lostsky-market.sk` provides inventory-identity protected GUIs. Trade
operations check money/items/capacity before changing inventories.
`skytown::quest::<uuid>::<key>` stores last completion for 24-hour cooldown;
preserve these in backups. `skytown::menu/kind` are temporary, cleared on
close/quit/load. Relic rewards reuse `relicItem` from lostsky.sk.
`topup-url` is unset; payment lounge announces closed until configured.
`/lshubbuild` is console-only and delegates to chapter 0 of skyCityBuild:
world lobby, spawn_hub.schem, origin (0,100,0). World clone
`lobby_pre_market_20261003` preserves old lobby before replacement.

Migration checkpoint, 2026-10-03: shared market spawn pasted successfully;
five floor/roof checks, seven NPC identities and global flags verified.
skript-reflect 2.6.3 loaded; `lostsky_cities` created/protected. Hub, city and
market scripts reload successfully. Local chapter tests: 1,087 passed.
Console-only `/lstownselftest` verifies isolated inventory/relic cases;
`/lscityselftest` verifies chapter 1 -> 5 -> 1 replacement in reserved slot 0.
Both passed live; player slots begin at 1. WorldEdit paste uses
SideEffectSet.none() and disableBuffering(), replacing deprecated fast mode
which caused a long main-thread pause. Repeat paste test passed after fix.
Owner `/city go` was verified from live entity position/dimension at
(1024.5,100,0.5) in lostsky_cities. Real-player commerce, multi-member city
identity/isolation and non-OP protection still need testing.
Owner estimates map at 20% and requests decoration paused; see DOT_HANDOFF.md.
Player reports supplies GUI rejects insufficient funds. Hub guide now explains
market/quest income before supplies purchases; no default starting balance
was changed. A one-off $32 game-currency grant supported one verified purchase:
balance $32 -> $0 and inventory cobblestone count32. Evidence/remaining cases
are in PLAYTEST_20261003.md.
Builder quest reward/cooldown retry now passed owner interaction and balance/
inventory verification. Default essentials.balance added after denied /money.
One required ThaiFontFix1.0.8 pack is configured through server.properties;
direct CDN URL, SHA1 and rollback steps are in RESOURCE_PACK.md. No pack plugin
or additional texture packs are needed. Client font rendering remains a test.

Server 9623747d uses Paper 1.21.11 build 132 / Java 21, 8 GB RAM.
WorldEdit 7.4.5 and WorldGuard 7.0.17 FAILED on Java 21 (class version 69).
Use WorldEdit 7.4.2 and WorldGuard 7.0.16 (class version 65). The former
7.4.5 compatibility statement was incorrect.
Lobby exists with the 15 documented global protection flags. Config has
high-frequency-flags enabled. In-game protection and schematic paste still
require a player test; keep whitelist on.

Live lobby import succeeded using //schem load lobby_ch1.schem sponge.2. Default format selects v3 and fails on these v2 files. Corrected chiseled_quartz_block in all five schematics after a live palette warning. Verify spawn floor at (0,99,0), pillar (0,100,-32), lectern (0,102,-32). Non-OP protection test remains pending.

2026-10-03: Player confirms required Thai resource pack loads. For floating-label artifacts, disabled text_display shadows and added opaque background; moved plaza label from (0.5,104,-36) to (0.5,105,-32) to clear fountain pillar. Applied via tagged entity data merge; client visual confirmation pending.

The shadow-only change did not resolve the player's red/black Thai glyphs. Applied minecraft:uniform to all10 tagged text components at02:14:33; command log confirms all updates. Corrected actual original plaza position z=-35.5 (integer teleport centering); live move confirmed to (0.5,105,-31.5). Suspected TTF/shader incompatibility, consistent with Iris issue3251, not yet proven on this client. Awaiting player retest.

2026-10-03: English player UI replaces Thai strings in hub, market and city scripts and floating labels. Resource pack remains required; do not clear pack properties. Website language remains separate. Vanilla item names and translated third-party plugin output may follow each client's language.
