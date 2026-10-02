# Island selector (one island = one team)

Status: **draft, not loaded on the server yet.** Written against BentoBox
3.17.0 and BSkyBlock 1.20.0 source (tags checked out by
`tests/islands/check-islands.js`). Skript reload and live tests are pending.

## What players get

- `/is` (no arguments) opens **Your Islands**: one slot per island the player
  is a team member of (oldest first), empty slots they may still fill, and
  locked slots above their limit. At least 3 slots are shown.
- Click an island: **Go to Island**, **Restoration City**, **City Menu**, Back.
- Click an empty slot: **Create Island?** confirmation, then BentoBox's own
  `/is create` (which shows the blueprint panel if there are several designs).
- `/islands` (alias `/myislands`) opens the same menu directly.
- `/city`, `/city go`, `/city donate` act on the **active island**.
  `/city <slot>` and `/city go <slot>` choose the island in that slot first.
  `/is city [slot]` and `/is city go [slot]` do the same.
- The city menu has a **Choose Island** button.
- All other `/is` subcommands (`go`, `team`, `sethome`, `level`, ...) are
  untouched and still BentoBox's.

One island = one team. Creating another island creates a separate team with
its own members and its own restoration city. Being invited to someone's
island adds that island to your list; it does not merge teams.

## Required configuration (owner/Codex applies on the server)

Stop the server normally, edit, then start. Back up first (see bottom).

`plugins/BentoBox/addons/BSkyBlock/config.yml`:

```yaml
bskyblock:
  command:
    # Plain /is (with no arguments) runs /islands = the selector.
    # A value starting with "/" is run as a full command
    # (DefaultPlayerCommand.runCommand in BentoBox 3.17.0).
    new-player-action: /islands
    default-action: /islands
world:
  # Islands per player (own + team islands they are a member of).
  concurrent-islands: 3
  # MUST be false for one-island-one-team with several islands.
  disallow-team-member-islands: false
```

Why `disallow-team-member-islands: false` is required: with `true` (the
BSkyBlock default) **accepting a team invite deletes every island the player
already has** (`IslandTeamInviteAcceptCommand.acceptTeamInvite`:
`if (disallowTeamMemberIslands) ... deleteIsland(island, true, ...)`), and
team members cannot create islands at all. Check the current value before
anyone accepts an invite.

Optional per-group limit instead of the config value: LuckPerms permission
`bskyblock.island.number.<n>` (for example `bskyblock.island.number.3`). The
highest one wins; a negative value means unlimited. This is the same rule
`/is create` uses.

If the two `command` keys are not changed, `/is` keeps its native behaviour
(go home / create) and players can still open the selector with `/islands`.

## Scripts

| File | Change |
|------|--------|
| `server/plugins/Skript/scripts/lostsky-islands.sk` | New: selector menus, active-island logic, `/islands` |
| `server/plugins/Skript/scripts/lostsky-city.sk` | `skyCityKey` uses the active island; `/city` and `/is city` take an optional slot; Choose Island button |

Upload both, then reload **islands first**, because the city script calls its
functions:

```
skript reload lostsky-islands
skript reload lostsky-city
```

Fix any parse error before continuing. Hub, market and shop scripts are not
changed.

## How the active island is chosen

Stored per player as an island **ID**: `{skyisland::selected::<player uuid>}`.
On every use it is checked again: the island must still exist, not be
deleted, be in `bskyblock_world`, and the player must be in its team
(`Island.inTeam`, MEMBER rank or higher). If not:

1. the player's BentoBox primary island (if they are in its team), else
2. their oldest team island, else
3. none ("Create or join an island with /is first").

Choosing an island in the menu, using **Go to Island**, or `/city <slot>`
stores its ID and also sets it as the BentoBox primary island, so native
`/is` subcommands follow the choice. After **Create Island** the stored choice
is cleared; BentoBox makes the new island primary (`NewIsland`), so it
becomes active.

Slot numbers are display positions only (oldest island = 1). A slot is turned
into an island ID at the moment of the click or command and never stored. If
an island is deleted, later slots move up by one.

City data is still keyed by island ID (`skycity::slot|ready|chapter|points::
<island id>`). Players with one island resolve to the same ID as before, so
existing cities and progress carry over. Nothing is reset or deleted.

## BentoBox API used (all verified in 3.17.0 source)

| Call | Why |
|------|-----|
| `IslandsManager.getIslands(World, UUID)` | All islands of the player in the world, sorted oldest first |
| `Island.inTeam(UUID)`, `isDeleted()`, `getWorld()`, `getUniqueId()` | Validation and identity |
| `IslandsManager.getIslandById(String)` | Load the stored ID (returns `Optional`) |
| `IslandsManager.setPrimaryIsland(UUID, Island)` | Keep native `/is` subcommands on the chosen island |
| `Island.isPrimary(UUID)` | Fallback when the stored choice is invalid |
| `IslandsManager.homeTeleportAsync(Island, User)` | Teleport to that exact island's home |
| `IslandsManager.isGoingHome(User)` | Avoid double teleports |
| `User.getInstance(UUID)`, `User.getPermissionValue(String, int)` | Island limit, same as `/is create` |
| `BentoBox.getIWM().getWorldSettings(World).getConcurrentIslands()` | Configured limit |
| `Island.getName()`, `getRank(UUID)`, `getMemberSet()` | Menu labels |

`IslandsManager.getIsland(World, UUID)` (used by the old city key) returns the
island the player is **standing on** first, which is why a stored ID is used.

## Known limits and uncertainties

- **Not run yet.** Skript and skript-reflect parsing, reflection overload
  choice and GUI clicks are only checked offline. Live tests are pending.
- **Teleport delay.** **Go to Island** calls the API directly, so the native
  `/is go` countdown/cooldown (if configured) is not applied.
- **Native team commands** (`/is team`, `invite`, `leave`, `kick`) act on the
  island you are standing on, otherwise your primary island. From the hub
  they follow the selector's choice; on another of your islands they act on
  that island. Tell players to use team commands from the hub or on the
  island they mean.
- **Limit counts team islands.** BentoBox counts every island you are a member
  of (`getNumberOfConcurrentIslands` = all member islands), not only owned ones.
- More than 7 islands: the menu shows the oldest 7 and points to `/is go <name>`.
- Leaving or being kicked from a team removes that island from the list; if it
  was active, the next lookup falls back as described above.

## Live test checklist (Codex/owner)

1. Config read back after restart; `/is` opens Your Islands.
2. New player: empty slot → confirm → native create → island appears in slot 1.
3. Create a 2nd and 3rd island; 4th slot locked; native refusal message on create.
4. Go to Island for each slot lands on the right island.
5. `/city go 2` reaches island 2's own city; island 1's city progress unchanged.
6. Second player invited to island 2 only: sees island 2, not 1 or 3; their own
   islands survive accepting (requires `disallow-team-member-islands: false`).
7. Kick that player: island 2 disappears from their list; `/city` falls back.
8. Existing single-island player: same city slot and chapter as before.
9. `/is team`, `/is sethome`, `/is level` still behave natively.
10. Clicking, shift-clicking and dragging items in all three menus does nothing.

## Backup and rollback

Before changing config: back up `plugins/BentoBox/addons/BSkyBlock/config.yml`,
`plugins/Skript/variables.csv` (or database), the BentoBox database and the
`lostsky_cities` world together. Rollback: restore the two `command` values
(`create`, `go`), remove `lostsky-islands.sk`, restore the previous
`lostsky-city.sk`, reload. Stored `skyisland::selected` values can stay; they
are ignored without the script. Do not set `disallow-team-member-islands`
back to `true` while players have several islands.
