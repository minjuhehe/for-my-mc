# Installing Lost Sky on the Minelan server

Step-by-step for the Minelan panel (`panel.minelan.in.th`). The panel tab
names below (Versions, Plugins, Files, Configs, Console) match what the
panel shows at the top.

Plan in use: **Spider Pack**, 8 GB RAM, 50 GB disk, type "Minecraft Cross".

> ⚠ Minelan bills credits **every hour** while the server exists. If the
> server expires and isn't renewed within 12 hours, Minelan deletes it,
> worlds included. Keep credits topped up, and back up the world before any
> long break.

## 1. Server software (Versions tab)

1. Stop the server first (yellow **หยุด / Stop** button).
2. **Versions** → choose **Paper**, latest **1.21.x**.
3. Set **Java 25** (Startup / Docker image / Java version setting).
   BentoBox and WorldEdit won't load on Java 21. The error looks like
   `UnsupportedClassVersionError ... class file version 69.0`.
4. Don't start the server yet.

"Minecraft Cross" probably means Bedrock players can join too (through
Geyser). Check in the Plugins tab whether Geyser/Floodgate are already
installed. If they are, see "Bedrock players" at the bottom.

## 2. Plugins (Plugins tab)

Install these. If the Plugins tab doesn't have one, download the `.jar`
from the plugin's official page (Modrinth, Hangar or SpigotMC) and upload
it in **Files** → `plugins/`.

Required, from `server/PLUGINS.md`:
- BentoBox, then its addons BSkyBlock, Level, Challenges and
  MagicCobblestoneGenerator. Addons go in `plugins/BentoBox/addons/`, not
  in `plugins/`.
- Skript
- Vault
- EssentialsX, EssentialsX Spawn, EssentialsX Chat
- LuckPerms
- WorldEdit (or FastAsyncWorldEdit)
- CoreProtect (recommended)

## 3. Start once, then stop

Start the server (green **เปิด / Start**). Wait until the console says
`Done`, which creates all the plugin folders. Then stop it again.

## 4. Upload the Lost Sky script (Files tab)

1. **Files** → go to `plugins/Skript/scripts/`.
2. Upload `server/plugins/Skript/scripts/lostsky.sk` from this repo.

## 5. Settings (Configs tab or Files → `server.properties`)

Copy the values from `server/server.properties` in this repo. Only change
the lines listed there, and **don't change `server-port`**, because
Minelan assigns the port.

## 6. Start and test (Console tab)

1. Start the server.
2. In the console, check that Skript loaded the script:
   `sk reload lostsky` should report no errors.
   Tip: the panel's log editor only shows part of `latest.log` until you
   scroll or zoom out. Search it for `ERROR` to find problems. If it lists errors, copy
   them and send them over so they can be fixed.
3. Give yourself admin: `lp user <your name> permission set lostsky.admin true`
4. Add yourself to the whitelist: `whitelist add <your name>`
5. Join the game and try `/chapter`, `/lostsky giverelic <you> shard`,
   then `/donate`.

After each command works in game, change its status from `draft` to
`live` in `docs/COMMANDS.md`.

## Bedrock players (only if Geyser is installed)

Bedrock players join with the same IP. The Bedrock port may be different.
Check the Geyser config or ask Minelan. Their names get a prefix (usually
`.`), so whitelist them as `.name`. The website currently says "Java
only", so update it if you keep Bedrock on.
