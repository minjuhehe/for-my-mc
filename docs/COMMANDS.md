# Command Reference

**Keep this file correct.** When you add, rename or remove a command, change
it here in the same commit and log it in `CHANGELOG.md`.

Columns:
- **Source**: which plugin or script provides the command. Check there if it
  stops working.
- **Status**: `planned` = designed but not built yet, `draft` = written but
  not tested on a real server, `live` = tested and working.

## Player commands

### Public town (`lostsky-market.sk`)

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/market` | Sell crops for in-game money | none | lostsky-market.sk | draft |
| `/skyshop` | Buy building supplies with in-game money | none | lostsky-market.sk | live: one cobblestone purchase; edge cases pending |
| `/skyquests` | Submit delivery quests every 24 hours | none | lostsky-market.sk | draft |
| `/topup` | Open supporter storefront preview; payments closed | none | lostsky-market.sk | preview |
| `/supporter` | Preview proposed ranks and title products | none | lostsky-support.sk | preview |
| `/style` | Equip an unlocked cosmetic title | none | lostsky-support.sk | test pending |
| `supportgrant <online-player> <sku> <order-id>` | Grant cosmetic entitlement once per order ID | console only | lostsky-support.sk | test pending |

Console-only `/lshubbuild` places the shared spawn schematic via WorldEdit.
Save and preserve a lobby backup before using it; it replaces existing blocks.

### Island (from BentoBox / BSkyBlock)

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/is` | Create your island, or teleport to it | `bskyblock.island` | BSkyBlock | planned |
| `/is team invite <player>` | Invite a player to your island | `bskyblock.island.team.invite` | BSkyBlock | planned |
| `/is sethome` | Set island home | `bskyblock.island.sethome` | BSkyBlock | planned |
| `/is level` | Calculate island level | `bskyblock.island.level` | Level addon | planned |
| `/is top` | Island leaderboard | `bskyblock.island.top` | Level addon | planned |

### Lost Sky story (custom, from `lostsky.sk`)

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/chapter` | Show current chapter, relic total and next goal | none | lostsky.sk | draft |
| `/citadel` | Teleport to the Sky Citadel | `lostsky.citadel` | lostsky.sk | draft |
| `/donate` | Donate the relic in your main hand | `lostsky.donate` | lostsky.sk | draft |
| `/relics` | Show your personal Citadel points and title | none | lostsky.sk | draft |
| `/ruin` | Teleport to the active ruin island (if one is up) | `lostsky.ruin` | lostsky.sk | draft |

### General (from EssentialsX)

Shared hub additions (`lostsky-hub.sk`, draft until live tests):

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/hub`, `/lobby` | Return to shared spawn via Essentials | `essentials.spawn` | lostsky-hub.sk | live |
| `/menu`, `/skymenu` | Open the shared harbour menu | none | lostsky-hub.sk | `/menu` live: supplies route; other routes pending |
| `/skyguide` | Show starting steps, earning money via market/quests, supplies and balance | none | lostsky-hub.sk | draft |

Team city commands (`lostsky-city.sk`):

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/city`, `/is city` | Open the restoration menu of the active island | island membership | lostsky-city.sk | draft |
| `/city <slot>`, `/is city <slot>` | Choose the island in that selector slot, then open its menu | island membership | lostsky-city.sk | draft (selector) |
| `/city go`, `/is city go` | Prepare and warp to the active island's city | island membership | lostsky-city.sk | `/city go` live for owner (before selector); alias/team tests pending |
| `/city go <slot>`, `/is city go <slot>` | Choose the island in that slot, then warp to its city | island membership | lostsky-city.sk | draft (selector) |
| `/city donate` | Donate held relic to the active island's city | island membership | lostsky-city.sk | draft |

Island selector (`lostsky-islands.sk`, see `docs/ISLAND_SELECTOR.md`):

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/is` (no arguments) | Opens Your Islands, via BSkyBlock `default-action`/`new-player-action: /islands` | `bskyblock.island` | BSkyBlock config + lostsky-islands.sk | draft; config not applied yet |
| `/islands`, `/myislands` | Your Islands: island slots (go / city / city menu), create confirmation, locked slots | none | lostsky-islands.sk | draft |

All other `/is` subcommands stay native BentoBox.

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/spawn` | Return to shared harbour in lobby | `essentials.spawn` | EssentialsSpawn | live |
| `/bal`, `/money` | Check own money | `essentials.balance` | EssentialsX | permission installed; player retest pending |
| `/pay <player> <amount>` | Send money | `essentials.pay` | EssentialsX | planned |

## Admin commands

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/lostsky setchapter <1-5>` | Force the chapter | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky addrelics <amount>` | Add to the server relic total | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky giverelic <player> <type>` | Give a relic item (`shard`, `tablet`, `core`, `crown`) | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky setcitadel` | Save your position as the Citadel warp | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky setruin` | Open a ruin warp at your position right now (closes after 45 min) | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky spawnruin` | Pick a random ruin site now (5 min warning, then opens) | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky clearruin` | Close the ruin warp | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky addsite <id> <tier>` | Save your position as a ruin site (tier 1-5 = earliest chapter it can appear) | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky delsite <id>` | Remove a ruin site | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky sites` | List ruin sites and their tiers | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky autoruins <on\|off>` | Turn automatic ruins (every 2 hours) on or off. Default: off | `lostsky.admin` | lostsky.sk | draft |
| `/lsunlock <chapter> <command>` | Save a console command (no `/`) to run when that chapter unlocks | `lostsky.admin` | lostsky.sk | draft |
| `/lsunlocks <chapter>` | List a chapter's unlock commands | `lostsky.admin` | lostsky.sk | draft |
| `/lsunlockclear <chapter>` | Delete all of a chapter's unlock commands | `lostsky.admin` | lostsky.sk | draft |
| `/bsbadmin ...` | Island admin tools | `bskyblock.admin.*` | BSkyBlock | planned |
| `/co inspect` | Check who broke/placed blocks | `coreprotect.inspect` | CoreProtect | planned |

## Isolated server checks (console only)

| Command | Purpose | Source | Status |
|---------|---------|--------|--------|
| `lstownselftest` | Multi-stack removal, relic authenticity and inventory capacity using temporary inventories | lostsky-selftest.sk | live; passed |
| `lscityselftest` | Chapter 1 -> 5 -> 1 paste in reserved slot 0; refuses occupied fixture | lostsky-selftest.sk | live; passed |

These checks do not replace player tests of trades, quest cooldowns, team warp
or lobby protection. Players cannot run them.

## Commands the script runs by itself (console)

These run automatically. If you rename a plugin or change these, update the script.

| When | Console command | Needs |
|------|-----------------|-------|
| Player reaches a new title | `lp user <name> meta setprefix 100 "<title>"` | LuckPerms |
| A chapter unlocks | Every command saved with `/lsunlock` for that chapter | whatever plugin each command belongs to |

## Permission groups (LuckPerms)

| Group | Gets |
|-------|------|
| `default` | all player permissions above |
| `mod` | `default` + `coreprotect.inspect`, `essentials.kick`, `essentials.mute` |
| `admin` | everything, including `lostsky.admin` |

/shop: full EconomyShopGUI catalog. /sell and /sellgui: deposit items into empty GUI, close to sell; unsellable items returned. /market now opens the same sell GUI and /skyshop opens the main shop. Hub market and shop buttons/NPCs use these same paths.

## Incremental garden prototype

| Command | Purpose | Permission | Status |
|---|---|---|---|
| /cityprojects | Selected island's garden project menu; also via /city | player command, no additional node | installed prototype |
| /cityprojects donate | Donate required plain blocks from main hand | same | player test pending |
| /cityprojects go | Visit garden after foundation is finished | same | player test pending |
| lsprojectselftest | Diagnostic slot0 queued build and cleanup | console only | isolated check |

## Universal selling update

/sell, /sellgui and /market now open lostskyworth:lssell (54 empty slots; close to sell all ordinary vanilla item types). /lssell is also available directly, no additional permission. /shop stays EconomyShopGUI. lsworthcheck is console-only and checks quote coverage/Relic guards/slot filtering. /city projects opens Restoration Projects; /city projects go visits the garden. Namespaced EconomyShopGUI selling is the old catalog-limited path.
