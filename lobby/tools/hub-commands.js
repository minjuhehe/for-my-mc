'use strict';
// Console commands for Paper 1.21.11. Paste spawn_hub.schem first.
// Re-running replaces only entities tagged lostsky_hub, avoiding duplicates.
const fs = require('fs');
const path = require('path');
const cmds = [
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
  cmds.push(`execute in minecraft:lobby run minecraft:summon minecraft:text_display ${x} ${y} ${z} {Tags:["lostsky_hub"],billboard:"center",text:{text:${JSON.stringify(content)},color:"${color}"},background:1073741824,shadow:1b,line_width:260,view_range:0.5f,brightness:{block:15,sky:15},transformation:{translation:[0f,0f,0f],left_rotation:[0f,0f,0f,1f],scale:[${scale}f,${scale}f,${scale}f],right_rotation:[0f,0f,0f,1f]}}`);
}
npc(-4.5, -8.5, 'Lost Sky Guide', 'librarian');
npc(4.5, -8.5, 'Island Captain', 'cartographer');
npc(32.5, -18.5, 'City Architect', 'mason');
text(0.5, 104.8, -9.5, 'LOST SKY\nเมืองท่ากลาง', 'gold', 1.4);
text(-4.5, 102.8, -8.5, 'ผู้แนะนำการเล่น\nคลิกขวาเพื่อเปิดเมนู');
text(4.5, 102.8, -8.5, 'เดินทางสู่เกาะของคุณ\nคลิกขวาเพื่อเปิดเมนู', 'green');
text(0.5, 102.5, -17.5, '/spawn กลับเมืองท่า\n/menu เปิดเมนูได้ทุกที่', 'white');
text(32.5, 102.8, -18.5, 'เมืองฟื้นฟูของทีม\nคลิกขวา หรือ /is city', 'light_purple');
text(-31.5, 103.5, -18.5, 'เกาะของคุณ\nใช้ /is เพื่อกลับเกาะ', 'green');
text(0.5, 103.5, -58.5, 'ท่าเรือสำรวจ\nกิจกรรมกำลังเตรียมเปิด', 'aqua');
cmds.push(
  'rg flag __global__ -w lobby mob-spawning deny',
  'execute in minecraft:lobby run minecraft:gamerule minecraft:advance_time false',
  'execute in minecraft:lobby run minecraft:time set 6000',
  'execute in minecraft:lobby run minecraft:gamerule minecraft:advance_weather false',
  'execute in minecraft:lobby run minecraft:weather clear',
  'rg flag __global__ -w lobby invincible allow',
  'lp group default permission set essentials.spawn true',
  'lp group default permission set bskyblock.island true',
  'skript reload lostsky-hub',
  'save-all flush',
);
const out = path.join(__dirname, '../docs/HUB_CONSOLE_COMMANDS.txt');
fs.writeFileSync(out, cmds.join('\n') + '\n');
console.log(`${cmds.length} repeatable hub setup commands -> ${out}`);
