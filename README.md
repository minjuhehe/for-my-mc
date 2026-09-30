# Lost Sky — a Skyblock server (draft)

> Ruins drift in from the void. Explore them, recover relics, and rebuild the
> lost Sky Citadel together.

This repo is the **design draft** for a future Minecraft server. Nothing is
live yet. It holds the idea, the rules, the command list and starter configs.

## What makes it different

Normal Skyblock: you grow your island and chase a leaderboard.
**Lost Sky** adds a shared story on top of that:

1. Every player gets a normal Skyblock island.
2. **Ruin islands** drift in near spawn on a schedule. They hold loot, puzzles,
   mobs and **Relics**.
3. Players donate relics to the **Sky Citadel** at spawn.
4. When the server reaches a relic goal, the **next story chapter** unlocks for
   everyone and brings new generators, biomes, island upgrades and ruins.

There are 5 chapters. After chapter 5 the season ends and a new one starts.

## Where to read next

| File | What it is for |
|------|----------------|
| [docs/CONCEPT.md](docs/CONCEPT.md) | Full game design: story, chapters, relics, economy |
| [docs/COMMANDS.md](docs/COMMANDS.md) | **Every command** (player + admin) and its permission |
| [docs/DEV_NOTES.md](docs/DEV_NOTES.md) | How the pieces fit together. **Read this before changing anything** |
| [docs/LOBBY_MAP.md](docs/LOBBY_MAP.md) | The lobby (Sky Citadel plaza): zones, style, and prompts to design and build it |
| [docs/INSTALL_MINELAN.md](docs/INSTALL_MINELAN.md) | How to install everything on the Minelan server |
| [.claude/skills/lostsky-minelan/](.claude/skills/lostsky-minelan/SKILL.md) | Skill for Claude: everything needed to keep setting up the Minelan server |
| [CHANGELOG.md](CHANGELOG.md) | A log of every addition, with notes on what each one changed |
| [server/](server/) | Starter config files |

## The rule for this repo

Every time something is added or changed:

1. Add an entry to `CHANGELOG.md` (what + why + which commands changed).
2. If a command was added or changed, update `docs/COMMANDS.md`.
3. If it changes how systems connect, update `docs/DEV_NOTES.md`.

That way anyone (a new developer, a new admin, or future you) can read the docs
and know exactly how the game works and which commands are real.
