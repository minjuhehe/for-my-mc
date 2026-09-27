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

**Season reset:** delete `{lostsky::*}`, then reload the script. That
wipes all story progress. Do it only between seasons.

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
When the total reaches the next goal it moves the chapter up and
broadcasts. It calls itself again so one big donation can skip more than
one chapter.

**The actual unlocks (generators, biomes, ruin tiers) are not wired yet.**
That is the `TODO` in `checkChapter()`. The plan is to run console
commands for the BentoBox addons from there, or to have admins do it by
hand for the first season.

### Ruins (for now: manual)

1. An admin pastes a ruin schematic near spawn with WorldEdit.
2. The admin stands at its entrance and runs `/lostsky setruin`.
3. Everyone gets a broadcast and can use `/ruin` for 45 minutes. Then the
   warp closes on its own. Remove the build by hand, or `//undo`.

Automatic spawning every 2 hours is planned (see `CHANGELOG.md` → Next).

## 4. Conventions

- Every new command gets a row in `docs/COMMANDS.md` with a permission,
  a source and a status (`planned` / `draft` / `live`).
- Custom permissions start with `lostsky.`
- Custom messages start with the `{@prefix}` option.
- Change a status to `live` only after testing it on a real server.
- Every change gets a `CHANGELOG.md` entry.
