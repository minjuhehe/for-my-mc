'use strict';
// Lost Sky lobby test suite. Run: node tools/test_lobby.js
// Checks the actual .schem artifacts: structure, zones, signs, entity limits,
// lighting coverage and preview pixels (no magenta = no unknown blocks).

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { parseNbt, decodeVarints } = require('./test_nbt');

const ROOT = path.join(__dirname, '..');
const SCHEM = path.join(ROOT, 'schematics');
const PREVIEW = path.join(ROOT, 'preview');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) {
  if (cond) { pass++; }
  else { fail++; failures.push(msg); console.log('  FAIL ' + msg); }
}
function section(name) { console.log('-- ' + name); }

// Strip blockstate props: "minecraft:lantern[hanging=true]" -> "minecraft:lantern"
function bare(state) { return (state || '').replace(/\[.*$/, ''); }
function is(state, name) { return bare(state) === name; }
function has(state, name) { return bare(state).includes(name); }

// --- load a schematic into a lookup --------------------------------------------
function load(ch) {
  const raw = zlib.gunzipSync(fs.readFileSync(path.join(SCHEM, `lobby_ch${ch}.schem`)));
  const root = parseNbt(raw).value;
  const W = root.Width, H = root.Height, Lg = root.Length;
  const pal = {};
  for (const [state, id] of Object.entries(root.Palette)) pal[id] = state;
  const data = decodeVarints(root.BlockData.__byteArray, W * H * Lg);
  const at = (x, y, z) => pal[data[(y * Lg + z) * W + x]];
  return { root, W, H, Lg, at, pal, data, signCount: root.BlockEntities.__list.length,
    entityCount: root.Entities ? root.Entities.__list.length : 0 };
}

// --- decode my own PNG back to RGBA --------------------------------------------
function loadPng(file) {
  const buf = fs.readFileSync(file);
  ok(buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), file + ' PNG signature');
  let o = 8;
  let width = 0, height = 0;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.slice(o + 4, o + 8).toString('ascii');
    const data = buf.slice(o + 8, o + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); }
    if (type === 'IDAT') idat.push(data);
    o += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const rgba = Buffer.alloc(width * height * 4);
  const stride = width * 4 + 1;
  for (let y = 0; y < height; y++) {
    raw.copy(rgba, y * width * 4, y * stride + 1, (y + 1) * stride);
  }
  return { width, height, rgba };
}
function px(img, x, y) {
  const o = (y * img.width + x) * 4;
  return [img.rgba[o], img.rgba[o + 1], img.rgba[o + 2]];
}
function near(c, t, tol = 12) {
  return Math.abs(c[0] - t[0]) <= tol && Math.abs(c[1] - t[1]) <= tol && Math.abs(c[2] - t[2]) <= tol;
}

// --- invariants per chapter ------------------------------------------------------
function checkChapter(ch) {
  section(`chapter ${ch}`);
  const s = load(ch);
  const GROUND = 80;

  ok(s.root.Version === 2, 'sponge v2');
  ok(s.root.DataVersion === 3953, 'DataVersion 3953 (1.21)');
  ok(s.W === 121 && s.H === 96 && s.Lg === 121, `size 121x96x121 (got ${s.W}x${s.H}x${s.Lg})`);
  ok(s.root.PaletteMax === Object.keys(s.root.Palette).length, 'PaletteMax matches Palette size');
  const min = s.root.Offset.__intArray;
  const weOffset = [s.root.Metadata.WEOffsetX, s.root.Metadata.WEOffsetY, s.root.Metadata.WEOffsetZ];
  const origin = min.map((v, i) => v - weOffset[i]);
  ok(origin.join(',') === '60,81,108', `clipboard origin is spawn (${origin.join(',')})`);

  // Island plateau exists at the four quadrant sample points.
  for (const [x, z] of [[30, 30], [90, 30], [30, 90], [90, 90]]) {
    ok(s.at(x, GROUND, z) !== 'minecraft:air', `plateau at ${x},${z}`);
  }
  // Void outside the island (corners of the box).
  for (const [x, z] of [[2, 2], [118, 2], [2, 118], [118, 118]]) {
    ok(s.at(x, GROUND, z) === 'minecraft:air', `void at corner ${x},${z}`);
  }
  // Underside tapers: rock near centre deep down, shallow at edges.
  ok(s.at(60, GROUND - 20, 60) !== 'minecraft:air', 'underside 20 deep at centre');
  ok(s.at(60, GROUND - 46, 60) !== 'minecraft:air', 'underside reaches ~45 blocks');
  ok(s.at(10, GROUND - 20, 10) === 'minecraft:air', 'edge underside shallow');

  // Spawn terrace: quartz pad under spawn, floor paved, welcome sign block.
  ok(is(s.at(59, GROUND, 107), 'minecraft:smooth_quartz'), 'spawn pad quartz');
  ok(is(s.at(60, GROUND, 108), 'minecraft:chiseled_quartz'), 'spawn pad centre');
  ok(s.at(52, GROUND, 105) !== 'minecraft:air', 'terrace floor');
  ok(is(s.at(55, GROUND + 1, 112), 'minecraft:oak_sign'), 'welcome sign block');
  ok(is(s.at(60, GROUND + 1, 113), 'minecraft:oak_sign'), 'testing sign block');

  // Tutorial path along x=60 from z=83..102.
  for (const z of [84, 90, 96, 102]) {
    ok(s.at(60, GROUND, z) !== 'minecraft:air', `path at z=${z}`);
  }
  // Tutorial stop signs: spruce fence + sign at x=56.
  for (const z of [98, 94, 90, 86, 84]) {
    ok(is(s.at(56, GROUND + 1, z), 'minecraft:spruce_fence'), `stop post at z=${z}`);
    ok(is(s.at(56, GROUND + 2, z), 'minecraft:spruce_sign'), `stop sign at z=${z}`);
  }

  // Citadel keep walls exist (bare compare).
  ok(s.at(48, GROUND + 1, 60) !== 'minecraft:air', 'west curtain wall');
  ok(s.at(72, GROUND + 1, 60) !== 'minecraft:air', 'east curtain wall');
  ok(s.at(52, GROUND + 1, 48) !== 'minecraft:air', 'north curtain wall');
  ok(has(s.at(48, GROUND + 1, 60), 'stone_bricks'), 'west wall is stone bricks family');

  // Gates: south main gate + north postern, both open at feet level.
  ok(s.at(60, GROUND + 1, 72) === 'minecraft:air', 'main gate open');
  ok(s.at(56, GROUND + 1, 72) !== 'minecraft:air', 'gate jamb west');
  ok(s.at(60, GROUND + 1, 48) === 'minecraft:air', 'north postern open');
  ok(s.at(60, GROUND + 1, 67) === 'minecraft:air', 'keep south doorway');
  ok(s.at(60, GROUND + 1, 53) === 'minecraft:air', 'keep north doorway');

  // Altar dais + lectern + crystal.
  ok(is(s.at(60, GROUND + 1, 76), 'minecraft:quartz_pillar'), 'altar centre column');
  ok(is(s.at(60, GROUND + 3, 76), 'minecraft:lectern'), 'lectern on altar');
  if (ch < 5) ok(is(s.at(60, GROUND + 8, 76), 'minecraft:budding_amethyst'), 'floating crystal');
  else ok(is(s.at(61, GROUND + 8, 76), 'minecraft:amethyst_block'), 'ch5 crystal ring');
  ok(is(s.at(58, GROUND, 74), 'minecraft:polished_andesite'), 'altar dais inner');

  // Chapter pillars: all five base rings exist; restored count per chapter.
  let restoredCount = 0;
  const PILLARS = [[52, 46], [75, 47], [75, 73], [45, 47], [45, 73]];
  PILLARS.forEach(([x, z], i) => {
    ok(is(s.at(x, GROUND, z), 'minecraft:chiseled_stone_bricks'), `pillar ${i} base ring`);
    if (s.at(x, GROUND + 5, z) !== 'minecraft:air') restoredCount++;
  });
  const RESTORED = [0, 2, 3, 4, 5];
  ok(restoredCount === RESTORED[ch - 1], `pillars restored: ${restoredCount} == ${RESTORED[ch - 1]}`);

  // Ruin dock: planks at deck, sign, chain, open mooring.
  ok(is(s.at(10, GROUND, 60), 'minecraft:spruce_planks'), 'dock deck');
  ok(is(s.at(16, GROUND + 2, 60), 'minecraft:spruce_sign'), 'dock sign');
  ok(is(s.at(4, GROUND - 2, 58), 'minecraft:chain'), 'dock chain');
  ok(s.at(4, GROUND, 60) === 'minecraft:air', 'mooring open');
  ok(is(s.at(4, GROUND - 1, 60), 'minecraft:spruce_planks'), 'mooring platform');

  // Island gate arch: piers + keystone + sign.
  ok(s.at(103, GROUND + 3, 56) !== 'minecraft:air', 'gate pier');
  ok(is(s.at(103, GROUND + 10, 60), 'minecraft:amethyst_block'), 'amethyst keystone');
  ok(is(s.at(105, GROUND + 2, 58), 'minecraft:spruce_sign'), 'gate sign');

  // Hall of Relics: floor, windows, doorway, pedestals, title signs.
  ok(is(s.at(60, GROUND, 34), 'minecraft:calcite'), 'hall floor');
  ok(is(s.at(56, GROUND + 3, 26), 'minecraft:glass'), 'hall window');
  ok(s.at(60, GROUND + 1, 42) === 'minecraft:air', 'hall doorway');
  ok(is(s.at(53, GROUND + 3, 30), 'minecraft:amethyst_block'), 'relic pedestal 1');
  ok(is(s.at(67, GROUND + 3, 38), 'minecraft:amethyst_block'), 'relic pedestal 4');
  ok(is(s.at(57, GROUND + 1, 28), 'minecraft:oak_sign'), 'title sign 1');
  ok(is(s.at(63, GROUND + 1, 28), 'minecraft:oak_sign'), 'title sign 4');

  // Entity + sign limits from LOBBY_MAP.md.
  ok(s.signCount === 24, `24 signs (got ${s.signCount})`);
  ok(s.entityCount === 4, `4 item frames (got ${s.entityCount})`);
  for (const e of (s.root.Entities ? s.root.Entities.__list : [])) {
    const p = e.Pos.__list;
    ok(p[0] >= 0 && p[0] < s.W && p[1] >= 0 && p[1] < s.H && p[2] >= 0 && p[2] < s.Lg,
      `entity inside schematic bounds (${p.join(',')})`);
  }

  // Sign texts: every sign has 4 JSON messages on front and back.
  const be = s.root.BlockEntities.__list;
  for (const b of be) {
    ok(b.front_text && b.front_text.messages.__list.length === 4, 'sign has 4 front lines');
    ok(b.back_text && b.back_text.messages.__list.length === 4, 'sign has 4 back lines');
  }
  const welcome = be.find((b) => JSON.parse(b.front_text.messages.__list[0]).text.includes('WELCOME'));
  ok(!!welcome, 'welcome sign present');
  const gate = be.find((b) => JSON.parse(b.front_text.messages.__list[1]).text === '§eType /is');
  ok(!!gate, 'island gate sign mentions /is');

  // Lighting: spawn->gate walk must have a light source within range.
  const lightBlocks = new Set([
    'minecraft:lantern', 'minecraft:soul_lantern', 'minecraft:glowstone',
    'minecraft:end_rod', 'minecraft:shroomlight', 'minecraft:sea_lantern',
    'minecraft:crying_obsidian', 'minecraft:beacon', 'minecraft:torch',
  ]);
  let darkOnPath = 0;
  for (let z = 84; z <= 107; z++) {
    let lit = false;
    for (let dx = -6; dx <= 6 && !lit; dx++) {
      for (let dy = -2; dy <= 3 && !lit; dy++) {
        for (let dz = -3; dz <= 3 && !lit; dz++) {
          const b = bare(s.at(60 + dx, GROUND + 1 + dy, z + dz));
          if (lightBlocks.has(b)) lit = true;
        }
      }
    }
    if (!lit) darkOnPath++;
  }
  ok(darkOnPath === 0, `spawn->gate walk fully lit (dark columns: ${darkOnPath})`);

  let keepLights = 0;
  for (let x = 53; x <= 67; x++) {
    for (let y = GROUND + 1; y <= GROUND + 6; y++) {
      for (let z = 53; z <= 67; z++) {
        if (lightBlocks.has(bare(s.at(x, y, z)))) keepLights++;
      }
    }
  }
  ok(keepLights >= 4, `keep interior has at least four light sources (${keepLights})`);

  // Chapter-specific markers.
  if (ch === 1) {
    // Rubble: count non-air blocks sitting on the keep floor (interior only).
    let rubble = 0;
    for (let x = 54; x <= 66; x++)
      for (let z = 54; z <= 66; z++)
        if (x !== 60 && z !== 60 && s.at(x, GROUND + 1, z) !== 'minecraft:air') rubble++;
    ok(rubble > 15, `ch1 interior rubble present (${rubble} blocks)`);
  }
  if (ch >= 3) {
    ok(is(s.at(69, GROUND + 10, 56), 'minecraft:sea_lantern'), `ch${ch} drowned spire crown`);
    ok(is(s.at(69, GROUND + 5, 56), 'minecraft:water'), `ch${ch} drowned spire water core`);
    for (const [x, z] of [[18, 18], [102, 18], [102, 102], [18, 102]]) {
      ok(is(s.at(x, GROUND, z), 'minecraft:stone_bricks'), `ch${ch} waterfall rim stays solid at ${x},${z}`);
      ok(is(s.at(x, GROUND - 1, z), 'minecraft:water'), `ch${ch} waterfall source below rim at ${x},${z}`);
      ok(is(s.at(x, GROUND - 20, z), 'minecraft:water'), `ch${ch} waterfall curtain at ${x},${z}`);
    }
  }
  if (ch >= 4) {
    for (const [x, z] of [[56, 56], [64, 56], [56, 64], [64, 64]]) {
      ok(s.at(x, GROUND + 1, z).includes('minecraft:campfire') && s.at(x, GROUND + 1, z).includes('lit=false'),
        `ch${ch} ember hearth is unlit and safe at ${x},${z}`);
      ok(is(s.at(x, GROUND - 1, z), 'minecraft:shroomlight'), `ch${ch} ember hearth has hidden light at ${x},${z}`);
    }
  }
  if (ch === 5) {
    ok(is(s.at(60, GROUND + 6, 76), 'minecraft:beacon'), 'ch5 beacon beam source under crystal');
    for (let x = 59; x <= 61; x++) for (let z = 75; z <= 77; z++) {
      ok(is(s.at(x, GROUND + 5, z), 'minecraft:gold_block'), `ch5 beacon base ${x},${z}`);
    }
    for (let y = GROUND + 7; y < s.H; y++) {
      ok(s.at(60, y, 76) === 'minecraft:air', `ch5 beacon beam clear at y=${y}`);
    }
  }
  return s;
}

// --- palette / style rules --------------------------------------------------------
function checkPaletteRules() {
  section('palette + style rules');
  // Gold only from ch4 onward.
  for (const ch of [1, 2, 3]) {
    const s = load(ch);
    const hasGold = Object.values(s.pal).some((k) => k && k.includes('gold'));
    ok(!hasGold, `no gold in ch${ch}`);
  }
  const s4 = load(4), s5 = load(5);
  ok(Object.values(s4.pal).some((k) => k && (k.includes('gold') || k.includes('gilded'))), 'gold present in ch4');
  ok(Object.values(s5.pal).some((k) => k && k.includes('gold')), 'gold present in ch5');

  // No redstone anywhere.
  for (const ch of [1, 2, 3, 4, 5]) {
    const s = load(ch);
    ok(!Object.values(s.pal).some((k) => k.includes('redstone')), `no redstone in ch${ch}`);
  }

  // Every state string parses as minecraft:name or minecraft:name[k=v,...].
  for (const ch of [1, 2, 3, 4, 5]) {
    const s = load(ch);
    for (const state of Object.values(s.pal)) {
      ok(/^minecraft:[a-z_]+(\[[a-z_]+=[a-z_0-9]+(,[a-z_]+=[a-z_0-9]+)*\])?$/.test(state), `state format: ${state}`);
    }
  }
}

// --- preview pixel checks ------------------------------------------------------------
function checkPreviews() {
  section('preview pixels');
  for (const ch of [1, 2, 3, 4, 5]) {
    const img = loadPng(path.join(PREVIEW, `top_ch${ch}.png`));
    ok(img.width === 121 && img.height === 121, `top_ch${ch} is 121x121`);
    let magenta = 0;
    for (let i = 0; i < img.rgba.length; i += 4) {
      if (img.rgba[i] === 255 && img.rgba[i + 1] === 0 && img.rgba[i + 2] === 255) magenta++;
    }
    ok(magenta === 0, `top_ch${ch} no unknown-block pixels (found ${magenta})`);
    ok(!near(px(img, 60, 60), [21, 26, 46], 6), `top_ch${ch} centre not void`);
    ok(near(px(img, 10, 60), [114, 84, 48], 40), `top_ch${ch} dock spruce`);
  }
  const c1 = loadPng(path.join(PREVIEW, 'top_ch1.png'));
  const c5 = loadPng(path.join(PREVIEW, 'top_ch5.png'));
  ok(near(px(c1, 60, 60), [146, 105, 224], 30), 'ch1 centre = dim amethyst crystal');
  const c5px = px(c5, 60, 60);
  ok(near(c5px, [246, 208, 61], 30) || near(c5px, [235, 231, 224], 30), 'ch5 centre = gold crown/quartz drum');
}

// --- run -----------------------------------------------------------------------
function main() {
  console.log('Lost Sky lobby test suite\n');
  if (!fs.existsSync(path.join(SCHEM, 'lobby_ch1.schem'))) {
    console.log('schematics missing — run `node tools/generate.js` first');
    process.exit(2);
  }
  for (const ch of [1, 2, 3, 4, 5]) checkChapter(ch);
  checkPaletteRules();
  checkPreviews();

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log('failures:');
    failures.slice(0, 40).forEach((f) => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('ALL TESTS PASSED');
}

main();
