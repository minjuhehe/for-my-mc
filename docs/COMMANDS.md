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
| `/relics` | Show your personal Citadel points | none | lostsky.sk | draft |
| `/ruin` | Teleport to the active ruin island (if one is up) | `lostsky.ruin` | lostsky.sk | draft |

### General (from EssentialsX)

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/spawn` | Go to spawn | `essentials.spawn` | EssentialsX | planned |
| `/bal` | Check money | `essentials.balance` | EssentialsX | planned |
| `/pay <player> <amount>` | Send money | `essentials.pay` | EssentialsX | planned |

## Admin commands

| Command | What it does | Permission | Source | Status |
|---------|--------------|------------|--------|--------|
| `/lostsky setchapter <1-5>` | Force the chapter | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky addrelics <amount>` | Add to the server relic total | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky giverelic <player> <type>` | Give a relic item (`shard`, `tablet`, `core`, `crown`) | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky setcitadel` | Save your position as the Citadel warp | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky setruin` | Save your position as the active ruin warp | `lostsky.admin` | lostsky.sk | draft |
| `/lostsky clearruin` | Close the ruin warp | `lostsky.admin` | lostsky.sk | draft |
| `/bsbadmin ...` | Island admin tools | `bskyblock.admin.*` | BSkyBlock | planned |
| `/co inspect` | Check who broke/placed blocks | `coreprotect.inspect` | CoreProtect | planned |

## Permission groups (LuckPerms)

| Group | Gets |
|-------|------|
| `default` | all player permissions above |
| `mod` | `default` + `coreprotect.inspect`, `essentials.kick`, `essentials.mute` |
| `admin` | everything, including `lostsky.admin` |
