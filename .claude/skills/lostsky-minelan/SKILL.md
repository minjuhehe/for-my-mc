---
name: lostsky-minelan
description: Set up, fix and run the "Lost Sky" Skyblock Minecraft server that is hosted on Minelan (panel.minelan.in.th). Use when the owner asks to install or fix plugins, read server logs, change server settings, upload the Lost Sky script, test commands, or continue building the Lost Sky server, website or docs.
---

# Lost Sky on Minelan

You are helping the owner run **Lost Sky**, a story-driven Skyblock server.
The owner speaks **Thai** and some English. Reply in the language they write
in, with short steps and plain words. They are not a developer.

## First, read the project

The repo `minjuhehe/for-my-mc` holds everything. Read these before acting:

| File | Why |
|------|-----|
| `CLAUDE.md` | Rules: after every change, update CHANGELOG, COMMANDS, DEV_NOTES and tell the owner |
| `docs/CONCEPT.md` | Game design: 5 chapters, relics, ruins, titles |
| `docs/COMMANDS.md` | Every command, its permission and status (`planned` / `draft` / `live`) |
| `docs/DEV_NOTES.md` | How the plugins and `lostsky.sk` connect, saved variables |
| `docs/INSTALL_MINELAN.md` | Step-by-step install on the Minelan panel |
| `server/PLUGINS.md` | Plugin list and version notes |
| `server/plugins/Skript/scripts/lostsky.sk` | The story system (Skript) |
| `CHANGELOG.md` | What was done and what is next |

Follow the `CLAUDE.md` rules after **every** change.

## Facts about the Minelan server (updated 2026-09-30)

- Panel: `https://panel.minelan.in.th`, server ID `396da441`, server name
  "Lostsky", region BKK-9, plan "Woodlands Pack" (4 CPU cores, 16 GB RAM,
  80 GB disk).
- Runner category: **Minecraft Cross** (the startup command has
  `-DgeyserUdpPort`, so Bedrock via Geyser is possible, but Geyser is not
  installed).
- Server software: **Paper 1.21.11** (build 132).
- **Java is 21 and can't be changed for 1.21.11.** The settings page only
  offers "ล่าสุด | Java-25" (latest), and it doesn't apply to 1.21.11.
- The panel is Pterodactyl-based (`/api/client` answers 401), but Minelan
  **does not give users API keys**. The account page only has
  change-password and change-email.
- **Billing:** credits are charged every hour. If the server expires and
  isn't renewed within 12 hours, Minelan deletes it with its worlds. Remind
  the owner when the panel shows little time left.
- Panel tabs: Console, Players, Files, Configs, Versions, Plugins, Worlds,
  Backups. The Plugins tab installs from Modrinth or Spigot, filtered by
  loader and Minecraft version.
- Buttons: เปิด = Start, รีสตาร์ท = Restart, หยุด = Stop, ตั้งค่า = Settings,
  ยืนยัน = Confirm/Save, ยกเลิก = Cancel.
- The blue button "น้องมายวิเคราะห์ Log" is Minelan's own log analyzer.

## Plugin status at last check

| Plugin | Version | Status |
|--------|---------|--------|
| LuckPerms | 5.5.71 | ✅ loaded |
| Vault (VaultUnlocked) | 2.20.3 | ✅ loaded, Essentials found it |
| Essentials, EssentialsChat, EssentialsSpawn | 2.22.0 | ✅ loaded |
| Skript | 2.16.2 | ✅ loaded; `lostsky.sk` reloads with no errors |
| CoreProtect | 24.1 | ✅ loaded |
| BentoBox | 3.17.0 | ✅ loaded on Java 21 |
| BSkyBlock | 1.20.0 | ✅ enabled |
| Challenges | 1.8.1 | ✅ enabled |
| Level | 2.29.0 | ✅ enabled |
| MagicCobblestoneGenerator | 2.9.0 | ✅ enabled |
| WorldEdit | 7.4.5 | ✅ loaded on Java 21 |

**Resolved compatibility choice:** keep BentoBox 3.17.0, WorldEdit 7.4.5 and
MagicCobblestoneGenerator 2.9.0 while the server stays on Paper 1.21.11 and
Java 21. Upgrade these only as one tested stack.

To find the right build for sure: download candidate jars from Modrinth
(`api.modrinth.com`, `cdn.modrinth.com`, which must be allowed in the network
settings) and read the class file major version of the main class
(bytes 6–7 of any `.class` file: 65 = Java 21, 69 = Java 25).

## What's left, in order

1. Give the owner admin rights and whitelist their Minecraft username
   (`docs/INSTALL_MINELAN.md` step 6).
2. Test each command in game and mark it `live` in `docs/COMMANDS.md`.
3. Set team size 4 in the BSkyBlock config.
4. Build ruin sites, save them with `/lostsky addsite`, and fill in the
   `/lsunlock` commands for each chapter.
5. Put the real server address on the website (`website/index.html`) and
   publish it (GitHub Pages needs a `main` branch and Pages enabled).

## How to work with the owner

Pick the mode based on what you can reach in this session.

**If you can control the owner's browser or screen:** work in the panel
directly. Before anything that deletes, reinstalls or changes the Minecraft
version, say what you're about to do and wait for a yes.

**If you can only read screenshots:** guide one step at a time. Name the
exact tab, button (Thai label + English meaning) and file path. Ask for a
screenshot after each step. Keep each message to one or two actions.

**Reading logs:**
- The panel's file editor shows only part of `logs/latest.log` until you
  zoom out or scroll.
- Ask the owner to search for `ERROR`, step through matches with the ›
  arrow, or copy the whole log as text (Ctrl+A, Ctrl+C) and paste it.
- In the console, `plugins` lists plugins: green = loaded, red = failed.

## Safety rules

- **Never** ask for or accept the Minelan password, or any password or key,
  in chat. If a key is needed, it goes in the environment settings as a
  variable, never in the conversation.
- Don't try to log in to the panel with the owner's password through
  scripts or browser automation.
- Warn the owner before they open a `.jar` in the file editor. If one is
  open, they should press ยกเลิก (Cancel), never ยืนยัน (Confirm), because
  saving would corrupt the plugin.
- Don't delete worlds or change the Minecraft version without a clear yes.
- Back up (Backups tab) before big changes once players have built things.
