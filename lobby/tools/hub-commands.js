'use strict';
// Console commands for Paper 1.21.11. Paste spawn_hub.schem first.
// Re-running replaces only entities tagged lostsky_hub, avoiding duplicates.
const fs = require('fs');
const path = require('path');
const cmds = [
  'execute in minecraft:lobby run minecraft:forceload add -60 -108 60 12',
  'rg flag __global__ -w lobby mob-spawning allow',
  'execute in minecraft:lobby run minecraft:gamerule minecraft:spawn_mobs false',
  'execute in minecraft:lobby run minecraft:kill @e[tag=lostsky_hub]',
  'execute in minecraft:lobby run minecraft:fill -5 99 -9 -4 99 -8 minecraft:smooth_quartz',
  'execute in minecraft:lobby run minecraft:fill 4 99 -9 5 99 -8 minecraft:smooth_quartz',
  'execute in minecraft:lobby run minecraft:fill -5 100 -9 -4 102 -8 minecraft:air',
  'execute in minecraft:lobby run minecraft:fill 4 100 -9 5 102 -8 minecraft:air',
];
function npc(x, z, name, profession) {
  cmds.push(`execute in minecraft:lobby run minecraft:summon minecraft:villager ${x} 100 ${z} {Tags:["lostsky_hub"],CustomName:{text:${JSON.stringify(name)}},CustomNameVisible:0b,NoAI:1b,Silent:1b,Invulnerable:1b,PersistenceRequired:1b,NoGravity:1b,Rotation:[0f,0f],VillagerData:{type:"minecraft:plains",profession:"minecraft:${profession}",level:5}}`);
}
function text(x, y, z, content, color = 'aqua', scale = 1) {
  cmds.push(`execute in minecraft:lobby run minecraft:summon minecraft:text_display ${x} ${y} ${z} {Tags:["lostsky_hub"],billboard:"center",text:{font:"minecraft:uniform",text:${JSON.stringify(content)},color:"${color}"},background:1711276032,shadow:0b,default_background:0b,see_through:0b,text_opacity:-1b,line_width:260,view_range:0.5f,brightness:{block:15,sky:15},transformation:{translation:[0f,0f,0f],left_rotation:[0f,0f,0f,1f],scale:[${scale}f,${scale}f,${scale}f],right_rotation:[0f,0f,0f,1f]}}`);
}
npc(-4.5, -8.5, 'Lost Sky Guide', 'librarian');
npc(4.5, -8.5, 'Island Captain', 'cartographer');
npc(0.5, -89.5, 'City Architect', 'mason');
npc(-35.5, -59.5, 'Farm Merchant', 'farmer');
npc(36.5, -59.5, 'Supply Merchant', 'toolsmith');
npc(-35.5, -15.5, 'Quest Keeper', 'librarian');
npc(36.5, -15.5, 'Sky Concierge', 'cleric');
text(0.5, 104.8, -9.5, 'LOST SKY\nเมืองท่ากลาง', 'gold', 1.4);
text(-4.5, 102.8, -8.5, 'ผู้แนะนำการเล่น\nคลิกขวาเพื่อเปิดเมนู');
text(4.5, 102.8, -8.5, 'เดินทางสู่เกาะของคุณ\nคลิกขวาเพื่อเปิดเมนู', 'green');
text(0.5, 102.5, -17.5, '/spawn กลับเมืองท่า\n/menu เปิดเมนูได้ทุกที่', 'white');
text(0.5, 103.5, -89.5, 'เมืองฟื้นฟูของทีม\nคลิกขวา หรือ /is city', 'light_purple');
text(-35.5, 104, -59.5, 'ตลาดผัก\nคลิก NPC หรือ /market', 'green');
text(36.5, 104, -59.5, 'ร้านวัสดุ\nคลิก NPC หรือ /skyshop', 'aqua');
text(-35.5, 104, -15.5, 'หอเควสต์\nคลิก NPC หรือ /skyquests', 'light_purple');
text(36.5, 104, -15.5, 'โซนเติมเงิน\nคลิก NPC หรือ /topup', 'gold');
text(0.5, 105, -32, 'LOST SKY PLAZA\nตลาดผัก · ร้านค้า · เควสต์ · เมืองของทีม', 'aqua');
cmds.push(
  'rg flag __global__ -w lobby mob-spawning deny',
  'execute in minecraft:lobby run minecraft:gamerule minecraft:advance_time false',
  'execute in minecraft:lobby run minecraft:time set 6000',
  'execute in minecraft:lobby run minecraft:gamerule minecraft:advance_weather false',
  'execute in minecraft:lobby run minecraft:weather clear',
  'rg flag __global__ -w lobby invincible allow',
  'rg flag __global__ -w lobby block-break deny',
  'rg flag __global__ -w lobby block-place deny',
  'rg flag __global__ -w lobby interact allow',
  'rg flag __global__ -w lobby chest-access deny',
  'rg flag __global__ -w lobby block-trampling deny',
  'rg flag __global__ -w lobby pvp deny',
  'lp group default permission set essentials.spawn true',
  'lp group default permission set essentials.balance true',
  'lp group default permission set bskyblock.island true',
  'skript reload lostsky-hub',
  'skript reload lostsky-market',
  'save-all flush',
  'execute in minecraft:lobby run minecraft:forceload remove -60 -108 60 12',
);
const out = path.join(__dirname, '../docs/HUB_CONSOLE_COMMANDS.txt');
fs.writeFileSync(out, cmds.join('\n') + '\n');
console.log(`${cmds.length} repeatable hub setup commands -> ${out}`);
