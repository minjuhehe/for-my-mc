# Game Concept — Lost Sky Civilisation

## Story (the pitch players see)

Long ago a civilisation lived in the sky around a great **Sky Citadel**. It
broke apart and fell into the void. Now pieces of it are drifting back up.
You wake up on a tiny island next to the Citadel's ruins. Find the relics,
return them, and bring the Citadel back to life.

## Core loop

```
Grow your island ──► Gear up ──► Explore a ruin island ──► Find relics
       ▲                                                     │
       │                                                     ▼
Unlocks & upgrades ◄── Chapter unlocks ◄── Donate relics at the Citadel
```

- **Solo progress** comes from your own island (normal Skyblock).
- **Server progress** comes from everyone donating relics together.

## Chapters (one season = 5 chapters)

Each chapter needs a server-wide relic total. Numbers are placeholders to tune
once we know the player count.

| # | Chapter | Relic goal | Unlocks for everyone |
|---|---------|-----------:|----------------------|
| 1 | **The Awakening** | 0 (start) | Basic islands, cobble generator, Ruin tier 1 |
| 2 | **Roots of Stone** | 100 | Ore generator tier 2, Forest/Plains island biomes, Ruin tier 2 |
| 3 | **The Drowned Spire** | 300 | Ocean biome, fishing relics, island size +1 upgrade, Ruin tier 3 |
| 4 | **Ember Halls** | 600 | Nether biome, blaze/lava generator, Ruin tier 4 (mini-boss) |
| 5 | **The Citadel Rises** | 1000 | End-style sky biome, elytra crafting, final boss raid |

After the chapter 5 boss is defeated the season ends: rewards go out and the
season archives. Players keep cosmetics and titles. Islands reset.

## Relics

Relics are custom items (a named item with lore and a hidden tag).

| Rarity | Found in | Citadel value |
|--------|----------|--------------:|
| Common Shard | Any ruin chest | 1 |
| Carved Tablet | Ruin tier 2+ puzzles | 3 |
| Ancient Core | Ruin tier 3+ guardians | 10 |
| Crown Fragment | Chapter boss drops | 25 |

Donating a relic gives the player:
- **Citadel points** (for the personal leaderboard + title rewards)
- A small money reward

## Ruin islands

- A ruin spawns near spawn every **2 hours** and despawns after **45 minutes**.
- Tier depends on the current chapter (higher chapters mix in harder ruins).
- Each ruin is a pre-built schematic with loot chests, mobs and sometimes a
  simple puzzle (lever order, parkour, hidden room).
- A server broadcast announces a ruin 5 minutes before it arrives.

## Economy

- Money via Vault + EssentialsX economy.
- Sources: island sales, relic donations, weekly challenges.
- Sinks: island upgrades, generator upgrades, cosmetics, ruin warp fee.

## Titles / rewards (cosmetic only)

| Citadel points | Title |
|---------------:|-------|
| 10 | `[Wanderer]` |
| 50 | `[Relic Seeker]` |
| 150 | `[Sky Scholar]` |
| 400 | `[Citadel Keeper]` |
| Top 3 of season | `[Founder]` (kept forever) |

## Open questions (decide later)

- Max island team size? (suggestion: 4)
- PvP on ruins: on or off? (suggestion: off)
- Season length target? (suggestion: ~2 months)
