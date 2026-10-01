# Command Reference

**Keep this file correct.** When you add, rename or remove a command, change
it here in the same commit and log it in `CHANGELOG.md`.

Columns:
- **Source**: which plugin or script provides the command. Check there if it
  stops working.
- **Status**: `planned` = designed but not built yet, `draft` = written but
  not tested on a real server, `live` = tested and working.

## Player commands

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
| `/menu`, `/skymenu` | Open the shared harbour menu | none | lostsky-hub.sk | draft |
| `/skyguide` | Show the Thai starting guide | none | lostsky-hub.sk | draft |

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/spawn` | Return to shared harbour in lobby | `essentials.spawn` | EssentialsSpawn | live |
| `/bal` | Check money | `essentials.balance` | EssentialsX | planned |
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
