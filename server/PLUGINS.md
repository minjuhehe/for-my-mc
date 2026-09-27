# Plugin List

Install into `server/plugins/`. Versions are not pinned yet. Pin them once
the server is first tested.

Minecraft version in use: **Paper 1.21.11** (Minelan). Every plugin must
match this version.

**Java 25 is required.** BentoBox 3.23.1 and WorldEdit 7.4.6 are built for
Java 25 (class file version 69). On Java 21 they fail with
`UnsupportedClassVersionError ... class file version 69.0`.

| Plugin | Needed? | Notes |
|--------|---------|-------|
| BentoBox | required | Skyblock framework |
| ↳ BSkyBlock addon | required | The Skyblock game mode (`/is`) |
| ↳ Level addon | required | Island level + `/is top` |
| ↳ Challenges addon | required | Weekly challenges |
| ↳ MagicCobblestoneGenerator addon | required | Generator tiers per chapter |
| Skript | required | Runs `scripts/lostsky.sk` |
| VaultUnlocked (Modrinth) | required | Drop-in replacement for Vault, the economy bridge Skript + BentoBox use. Original Vault (SpigotMC, by MilkBowl) also works |
| EssentialsX (+ EssentialsX Spawn) | required | Economy, `/spawn`, basics |
| EssentialsX Chat | required | Shows LuckPerms title prefixes in chat |
| LuckPerms | required | Permission groups |
| WorldEdit or FastAsyncWorldEdit | required | Pasting ruins and the Citadel |
| CoreProtect | recommended | Grief logging / rollback |
| MythicMobs | later | Ruin guardians, chapter bosses |
| DecentHolograms | later | Relic progress hologram at the Citadel |
