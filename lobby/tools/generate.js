'use strict';
// Build the Lost Sky lobby for all five chapters and export schematics.
// Usage: node tools/generate.js [--only 1,2,3]

const fs = require('fs');
const path = require('path');

const { World, BLOCKS: B } = require('./world');
const L = require('./layout');
const { generateIsland } = require('./island');
const Z = require('./zones');
const C = require('./citadel');
const { Rng } = require('./rand');

const OUT_DIR = path.join(__dirname, '..', 'schematics');
const GROUND = L.GROUND;
const SIZE_X = L.SIZE_X, SIZE_Y = L.SIZE_Y, SIZE_Z = L.SIZE_Z;

// ---------------------------------------------------------------------------
function buildChapter(ch) {
  const w = new World(SIZE_X, SIZE_Y, SIZE_Z);

  // 1. Island base (stone rim ring included).
  generateIsland(w, GROUND, 60, 60, 424242 + ch);

  // 2. Path spine first (terrace -> plaza) so later zones connect to it.
  Z.tutorialPath(w);
  Z.terrace(w);

  // 3. Citadel: keep, altar, chapter pillars.
  C.keep(w, ch);
  C.altar(w, ch);
  C.pillars(w, ch);
  C.chapterAtmosphere(w, ch);

  // 4. Edge zones.
  Z.ruinDock(w);
  Z.islandGate(w);
  Z.hallOfRelics(w);

  // 5. Greenery on remaining grass.
  Z.GREENERY(w, new Rng(999 + ch), 0, 0, SIZE_X - 1, SIZE_Z - 1);

  // 6. Sky islets around the island (pure decoration, floats in the void).
  const rng = new Rng(31415 + ch);
  for (let i = 0; i < 7; i++) {
    const a = rng.f() * Math.PI * 2;
    const dist = rng.int(66, 78);
    const ix = Math.round(60 + Math.cos(a) * dist);
    const iz = Math.round(60 + Math.sin(a) * dist);
    const iy = GROUND + rng.int(-8, 6);
    const rr = rng.int(2, 4);
    for (let dx = -rr; dx <= rr; dx++) {
      for (let dz = -rr; dz <= rr; dz++) {
        if (dx * dx + dz * dz > rr * rr) continue;
        w.set(ix + dx, iy, iz + dz, B.GRASS_BLOCK);
        w.set(ix + dx, iy - 1, iz + dz, rng.chance(0.5) ? B.STONE : B.DIRT);
        if (rng.chance(0.3)) w.set(ix + dx, iy + 1, iz + dz, B.MOSS_CARPET);
      }
    }
    if (rng.chance(0.6)) Z.SKY_TREE(w, rng, ix, iy, iz);
  }

  // 7. Lighting sweep: every walkable block must have a light source nearby —
  // glowstone + end rods fill dark interior corners of the plaza.
  for (let z = 40; z <= 84; z += 7) {
    for (let x = 40; x <= 84; x += 7) {
      if (w.isAir(x, GROUND + 1, z) && w.name(x, GROUND, z) === 'minecraft:grass_block') {
        if (rng.chance(0.25)) w.set(x, GROUND + 1, z, B.END_ROD);
      }
    }
  }

  return w;
}

// ---------------------------------------------------------------------------
// WEOffset is min - clipboardOrigin in WorldEdit's Sponge v2 format. The
// schematic min is (0,0,0), so a negative spawn vector makes the clipboard
// origin equal to the Arrival Terrace spawn. `//paste` then puts that exact
// block at the player's feet.
function metaFor(ch) {
  return {
    name: `LostSky_lobby_ch${ch}`,
    author: 'LostSkyBuilder',
    dataVersion: 3953, // MC 1.21
    weOffset: [-L.SPAWN.x, -L.SPAWN.y, -L.SPAWN.z],
  };
}

function main() {
  const onlyArg = process.argv.includes('--only');
  const only = onlyArg
    ? process.argv[process.argv.indexOf('--only') + 1].split(',').map(Number)
    : [1, 2, 3, 4, 5];

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const report = [];
  for (const ch of only) {
    const t0 = Date.now();
    const w = buildChapter(ch);
    const file = path.join(OUT_DIR, `lobby_ch${ch}.schem`);
    w.saveSchematic(file, metaFor(ch));
    const kb = (fs.statSync(file).size / 1024).toFixed(1);
    report.push({
      ch,
      file: `schematics/lobby_ch${ch}.schem`,
      kb,
      blocks: w.nonAirCount(),
      palette: w.paletteSize(),
      signs: w.signs.length,
      frames: w.entities.length,
      ms: Date.now() - t0,
    });
    console.log(
      `ch${ch}: ${w.nonAirCount()} blocks, palette ${w.paletteSize()}, ` +
      `${w.signs.length} signs, ${w.entities.length} frames -> ${file} (${kb} KB)`
    );
  }

  // Write a manifest with spawn/altar coords for the import guide.
  const manifest = {
    generated: new Date().toISOString(),
    dataVersion: 3953,
    mcVersion: '1.21.x',
    size: { x: SIZE_X, y: SIZE_Y, z: SIZE_Z },
    worldYBase: 16,
    spawn: L.SPAWN,
    altar: L.ALTAR,
    pasteOffset: metaFor(1).weOffset,
    chapters: report,
  };
  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('\nmanifest written to schematics/manifest.json');
}

main();
