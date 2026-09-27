# Developer Notes

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

## 4. Website

`website/index.html` is the public info page (one file, no build step).
`.github/workflows/pages.yml` publishes it to GitHub Pages on every push
to `main` that touches `website/`.

If you change chapters, relics, titles or player commands, **update the
website too**. It repeats that info for players.

## 5. Conventions

- Every new command gets a row in `docs/COMMANDS.md` with a permission,
  a source and a status (`planned` / `draft` / `live`).
- Custom permissions start with `lostsky.`
- Custom messages start with the `{@prefix}` option.
- Change a status to `live` only after testing it on a real server.
- Every change gets a `CHANGELOG.md` entry.
