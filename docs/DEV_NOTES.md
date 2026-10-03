# Developer Notes

Rank effects in lostsky-perks.sk read same skysupport tier, store aura/arrival/
celebrated UUID preferences, and send personal particles/sounds only in lobby.
/perks, /aura, /arrival and /celebrate use direct tier gates; no LP permission
expansion. Wardrobe links to perks; cleanup removes effect preferences/cooldown.

Supporter runtime17:11-17:16: syntax corrected and tested console-only/order
dedupe/conflict, locked wardrobe, title selection and rank/selection reconnect.
Test entitlements cleared. Menu lifecycle closes inventories on script reload.
No real payments integrated. Diagnostic client profile action reads only its
own player-list display; human visual/full restart verification remains pending.

Supporter preview: lostsky-support.sk owns UUID-keyed tier/title entitlements,
selected title and fulfillment-ID records. /topup and Sky Concierge route to
/supporter; /style applies cosmetic display/tab names. Console supportgrant
requires connected player and deduplicates order IDs. No billing connected;
read SUPPORTER_STORE.md before integrating payments. No LuckPerms staff or
gameplay permissions are granted by these display ranks.

03Oct2026 16:48 ICT: LostSkyWorth1.1.1 live, clean startup. Non-OP diagnostic
client verified actual sale payouts, named/damaged items, container contents and
Relic return.1504-material live coverage check and garden queue self-test passed.
Temporary inventory/balance cleared and whitelist access removed. See
PLAYTEST_20261003.md; preserve owner city/island progress.

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

## 3c. Island selector (one island = one team)

`lostsky-islands.sk` (draft) lets a player hold several islands, each its own
team and its own restoration city. Full design, required BSkyBlock config and
API evidence: `docs/ISLAND_SELECTOR.md`. Offline checks:
`node tests/islands/check-islands.js`.

Saved variables:

| Variable | Meaning |
|----------|---------|
| `{skyisland::selected::<player uuid>}` | Active island **ID** (BentoBox `Island.getUniqueId()`), re-validated on every use. Persistent; keep in backups |
| `{skyisland::menu/kind/target/slot::...}` | Temporary menu state; cleared on close/quit/load |

`lostsky-city.sk` now gets its key from `skyIslandSelected()` instead of
`IslandsManager.getIsland(world, uuid)` (which prefers the island the player
stands on). City data stays keyed by island ID; nothing was migrated or reset.
Reload `lostsky-islands` before `lostsky-city`.

**Before players accept team invites:** BSkyBlock
`world.disallow-team-member-islands` must be `false`, otherwise accepting an
invite deletes the player's islands (BentoBox 3.17.0 source).

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
- **Player-test badges follow `docs/PLAYTEST_20261003.md` and `docs/SHOP.md`
  only.** As of 2026-10-03 (one owner account): tested = `/spawn`, `/hub`,
  `/menu`, `/is` (selector -> Restoration City), `/city go`; partly tested =
  `/shop`, `/skyshop`, `/sell` (menus open; transactions, amounts and Relic
  return pending) and `/skyquests` (builder quest only). Everything else
  stays รอทดสอบ: farmer quest, 24-hour expiry, full bag, creating several
  islands, multi-member teams, team isolation, donation, chapter change.
- **2026-10-03 update:** `/sell` is the universal 54-slot box (LostSkyWorth
  1.1.0, `docs/UNIVERSAL_SELL.md`): shop price -> plain-material price ->
  $0.01; Relics and Relic containers returned. Shown as รอทดสอบ until a
  player test of its payout (only the older ESGUI box paid out). Prices are
  shown in player inventory (Sell each / Sell stack), not on shop icons.
  Restoration Garden prototype (`/cityprojects [go|donate]`, 25 Stone
  Bricks / 8 Grass Block / 4 Oak Log): donation accepted, visual change
  pending. Full-city incremental restoration stays a future plan.
- **2026-10-03 update 2 (after 959ff62):** `/sell` (LostSkyWorth 1.1.1) is
  ทดสอบแล้ว: a non-OP client was paid the quoted amounts, incl. named/damaged
  items and Shulker contents; a genuine Relic and a Relic bundle were
  returned; the 1,504-material coverage check passed (coverage, not a sale of
  every type). Inventory prices are verified from the data sent to the
  client only, so they are รอตรวจด้วยตา until a person looks on screen.
  Still รอทดสอบ: economy failure and restart with the box open. Garden:
  server self-test passed 3 stages; player donation visual, restart
  persistence and multi-team isolation pending. Checks: 112.
- **Supporter store preview (website `#topup`, after 88c4eae):** mirrors
  `docs/SUPPORTER_STORE.md`. SKY 99 (cyan), AURORA 199 (purple + Builder),
  NOVA 399 (gold + all three titles), Builder/Farmer/Explorer 39 each; every
  price labelled ราคาที่เสนอ (proposed THB). Cosmetic, permanent, account
  bound, no money/gear/island/progress advantage. No buy buttons, payment
  details, QR or external links; checks forbid them. `/topup`, `/supporter`
  and `/style` stay รอทดสอบ until the owner reports the runtime menu test.
  **Update (a00d1a3, headless non-OP client):** `/topup` and `/style` are
  ทดสอบบางส่วน (preview opens, product click charges nothing, locked title
  refused, unlocked title equips, NOVA/title survive reconnect, lower SKY
  grant keeps NOVA). `/supporter` stays รอทดสอบ: same function, but not
  clicked on its own. Human screen/chat review is รอตรวจด้วยตา; full
  server-restart persistence is รอทดสอบ. Checks allow partly tested but
  never ทดสอบแล้ว for the store, and payments stay closed. Checks: 125.
- **Rank effects (website, after dfee340):** rank cards list lobby effects
  from `lostsky-perks.sk`: SKY Cloud Aura; AURORA + Enchant Aura, Arrival
  Chime; NOVA + Halo, Nova Arrival, `/celebrate` (30 s). Higher ranks include
  lower ones. Site states owner-only (others do not see/hear), lobby only,
  off by default, no flight/damage/economy. `/perks`, `/aura`, `/arrival`,
  `/celebrate` listed in the hub filter as รอทดสอบ until runtime results are
  reported. `/supporter` now ทดสอบบางส่วน (opened directly in the final
  client check, `docs/SUPPORTER_STORE.md`); product click evidence is still
  only via `/topup`. Particles left the future plan; pets, furniture skins and
  custom models remain แผน · ยังไม่ขาย. Commands on site: 29. Checks: 131.
  Particles, pets, furniture skins and custom models shown only as แผน ·
  ยังไม่ขาย. If prices or SKUs change, update the page and the store check in
  `tests/website/check-site.js` together. Commands on site: 25. Checks: 122.
- **Shop prices are not on the website.** The shop is EconomyShopGUI's
  default catalog (`docs/SHOP.md`); the site tells players to read prices in
  game. The old six-item price tables were removed. Quest rewards stay.
- **Islands:** one island = one team, up to 3 islands per player including
  team memberships, each with its own city (`docs/ISLAND_SELECTOR.md`).
  Incremental restoration (`docs/INCREMENTAL_RESTORATION.md`) is shown only
  as an unbuilt future plan.
- **Join steps** explain the required ThaiFontFix pack
  (`docs/RESOURCE_PACK.md`): accept the prompt; if it never appears, set
  Server Resource Packs to Enabled or Prompt. Map decoration is
  "unfinished"; don't claim it is done.
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

English labels use default font and bold; Thai font workaround is no longer needed for these labels.

2026-10-03: Installed EconomyShopGUI6.16.3 from official CurseForge file7423771, MD5 0326da94b07ec43c53e2ba66320ba3a5. Startup verified1.21.11, English,16 config sections /14 economy sections, Vault+Essentials linked. Uses generated default catalog (prices differ from old6-item script). /sell intercepted to namespaced sellgui; /market and /skyshop routed to plugin. Actual transactions pending player test. Island-selector development assigned to Claude based on native concurrent islands; no selector deployment yet.

Shop tooltip language: left-click-buy now Buy: %buyPrice%, right-click-sell Sell: %sellPrice%, using actual plugin pricing placeholders. Owner confirms /shop and /sell GUIs open; sale amount/return behavior not yet confirmed. Named/lore Relics remain protected by ESGUI component matching (only repair_cost ignored).

Floating-label background now transparent (background0, default_background false).

Live reload2026-10-03 at09:03:17 ICT passed lostsky-islands after correcting execute {_p} command; lostsky-city passed09:01:38. Config installation and live player flow still pending.

Native BSkyBlock live config saved: new-player-action/default-action /islands, concurrent-islands3, disallow-team-member-islands false. Server restarted normally; all scripts loaded without errors and Done14.822s at09:05:47 ICT. Player flow checks pending. Local config backup saved before edit; existing worlds/progress untouched.

Saved accepted incremental restoration design in docs/INCREMENTAL_RESTORATION.md; implementation deferred at owner request. Resume shop transactions and multi-island/team checks first.

Local island check initially failed because its native-command assertion still expected the old invalid event-player syntax. Corrected to explicit function parameter;70/70 checks passed. This is separate from actual live Skript parsing and owner flow confirmation.

2026-10-03: Owner confirms ordinary sell-GUI transaction earns money (amount not measured). Added LostSkyWorth1.0.0 display-only inventory prices via ProtocolLib and ESGUI player-aware item matching. English unit/stack quotes, cloned packets/items, no saved variables or commands. Creative/spectator disabled to avoid client creative-item lore persistence. HoverWorth fork rejected because its material/config matching ignores custom names/lore; Simple Worth has fixed Portuguese labels. Website update2a23497 pulled; exact values and Relic return remain pending.
Live09:25:35 verified ProtocolLib5.5.0-SNAPSHOT-583353e and LostSkyWorth1.0.0 enabled; Done09:25:39, no ERROR/Exception in inspected startup. Own reproducible Java21 build passed. Client hover/stack behavior still awaiting owner test.

2026-10-03: Gradual restoration prototype lostsky-projects.sk added. /city slot20 opens three-stage garden; /cityprojects [go|donate] alternate entry. Footprint +96..100X,0..4Z,99..101Y, outside chapter prefabs. Plain hand-stack donations capped by remaining requirement, stage queue persisted by stable island ID, one block/project each5ticks, global5block cap. skyproject::complete/paid/active/cursor/reserved persistent; menu/menu-island temporary. Stale selected-island menus rejected. No currency reward. Existing full chapter restoration remains active. Hard-crash atomicity, full restart and player/team tests not proven.
Live verification09:40 project reload passed86ms;09:42:00 isolated lsprojectselftest returned true for all3 funded stages, queued placement, arrival floor and cleanup.09:42:40 city menu reload passed105ms. No player materials/progress used in fixture. Player donation and actual restart tests pending.

2026-10-03: Owner confirms project donations take items, but couldn't see the change. Added delivered/required counts, completion notification to selected-island players, menu refresh, Visit Garden - See What Changed and /city projects [go]. Garden is separate from original city warp; no new prefab paste. Owner authorizes autonomous continued work while asleep. UniversalSell replaces public sell-box routing:54 empty slots, ESGUI exact/normal-material prices then0.01 fallback, shared quote function, Relic/container guard, Vault payout, overflow return, disable-return. Main inventory-only slot filter now excludes all menu/top slots and cursor. Removed ESGUI buy/sell icon lore. Live1.1.0+scripts started09:58:10 noerrors; lsworthcheck sent but result unread when auth expired. Local1.1.1 generic inventory-container refinement remains unuploaded; Java build and597 slot checks passed; island checker70/70. No test account whitelisted or connected. Exact universal payout and rendered client checks pending.
Prepared controlled Mineflayer4.39.0 test client in tests/minecraft (syntax checked only); stdin-driven, restricted LostSkyTest... names, no owner impersonation, no automatic world actions. Local dependencies installed in ignored outputs. Whitelist and real connection NOT performed because panel logged out. Resource-pack acknowledgment is simulated, never counts as visual validation.
Final handoff03Oct: Minecraft status ping succeeds Paper1.21.11,0online. Claude website110checks reported, commitsb3834e4/e36dfea pulled. Local preview on127.0.0.1:8765 restarted (not public deployment). Prepared docs/NEXT_SESSION.md with installed/staged/tested separation and resume order.
