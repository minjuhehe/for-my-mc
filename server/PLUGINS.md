# Plugin List

Install into `server/plugins/`. The versions below are pinned from the first
successful MineLan runtime test on 2026-09-30.

Minecraft version in use: **Paper 1.21.11** (Minelan). Every plugin must
match this version.

MineLan runs Paper 1.21.11 with **Java 21**. BentoBox 3.23.1 cannot run on
that image because it uses Java 25 bytecode, so keep BentoBox pinned to
3.17.0. MagicCobblestoneGenerator 2.10.0 requires BentoBox 3.19.1+, so keep
that addon pinned to 2.9.0.

| Plugin | Tested version | Needed? | Notes |
|--------|----------------|---------|-------|
| BentoBox | 3.17.0 | required | Skyblock framework; Java 21 build |
| ↳ BSkyBlock addon | 1.20.0 | required | The Skyblock game mode (`/is`) |
| ↳ Level addon | 2.29.0 | required | Island level + `/is top` |
| ↳ Challenges addon | 1.8.1 | required | Weekly challenges |
| ↳ MagicCobblestoneGenerator addon | 2.9.0 | required | Generator tiers per chapter; compatible with BentoBox 3.17.0 |
| Skript | 2.16.2 | required | Runs `scripts/lostsky.sk` |
| skript-reflect | 2.6.3 | required for team cities | BentoBox team identity and WorldEdit city placement; loaded live, city behavior pending validation |
| VaultUnlocked (Modrinth) | 2.20.3 | required | Drop-in replacement for Vault, the economy bridge Skript + BentoBox use. Original Vault (SpigotMC, by MilkBowl) also works |
| EssentialsX (+ EssentialsX Spawn) | 2.22.0 | required | Economy, `/spawn`, basics |
| EssentialsX Chat | 2.22.0 | required | Shows LuckPerms title prefixes in chat |
| LuckPerms | 5.5.71 | required | Permission groups |
| WorldEdit | 7.4.2 | required | Pasting ruins and the Citadel |
| Multiverse-Core | 5.8.1 | required (lobby) | Creates and manages the separate `lobby` world; check it runs on Java 21 |
| VoidGen | 2.3.8 | required (lobby) | Generator for the empty-sky `lobby` world; check it runs on Java 21 |
| WorldGuard | 7.0.16 | required before opening | Protects the lobby region (other worlds aren't covered by `spawn-protection`) |
| CoreProtect | 24.1 | recommended | Grief logging / rollback |
| MythicMobs | not installed | later | Ruin guardians, chapter bosses |
| DecentHolograms | not installed | later | Relic progress hologram at the Citadel |
