'use strict';
// Floating sky island: flat building plateau at groundY, tapered underside ~50 blocks deep.
// Square 121x121 footprint centred on world centre (cx, cz). Ground layer is grass,
// edge ring is stone-brick rim so paths and zones sit on a defined border.

const { Rng } = require('./rand');
const { BLOCKS: B } = require('./world');

function radiusAt(dx, dz) {
  return Math.sqrt(dx * dx + dz * dz);
}

// Depth of island underside at (dx, dz), 0 at ragged edge, ~48 at centre.
function depthAt(dx, dz, rng) {
  const r = radiusAt(dx, dz);
  if (r > 60) return 0;
  if (r > 54) return 1 + Math.floor((60 - r) / 4); // ragged rim: 1-2 deep
  const t = 1 - r / 54; // 0 at r=54, 1 at centre
  const base = Math.pow(t, 0.7) * 50;
  const wob = Math.floor(rng.f() * 7) - 3; // ±3 wobble -> natural, not a cone
  return Math.max(0, Math.round(base + wob + 2)); // +2 bias: centre always ~49+ deep
}

// Pick underside block: mostly stone, banded tuff/andesite, dripstone pockets.
function undersideBlock(rng) {
  const roll = rng.f();
  if (roll < 0.55) return B.STONE;
  if (roll < 0.70) return B.TUFF;
  if (roll < 0.85) return B.ANDESITE;
  if (roll < 0.92) return B.COBBLED_DEEPSLATE;
  return B.DRIPSTONE_BLOCK;
}

// The island body: plateau top (y = groundY), dirt layer (groundY-1), underside.
function generateIsland(w, groundY, cx, cz, seed) {
  const rng = new Rng(seed);
  const R = 60;
  let edgeCount = 0;

  for (let dz = -R; dz <= R; dz++) {
    for (let dx = -R; dx <= R; dx++) {
      const r = radiusAt(dx, dz);
      if (r > 60) continue;

      const x = cx + dx;
      const z = cz + dz;
      const depth = depthAt(dx, dz, rng);

      // Top of the plateau: grass everywhere (zones pave over it).
      w.set(x, groundY, z, B.GRASS_BLOCK);
      // Dirt lens under the top, then rock.
      w.set(x, groundY - 1, z, depth >= 2 ? B.DIRT : B.STONE);
      for (let d = 2; d <= depth; d++) {
        w.set(x, groundY - d, z, undersideBlock(rng));
      }

      // Stone-brick rim only at the very outer ring (keeps edges defined).
      if (r > 58.4) {
        w.set(x, groundY, z, B.STONE_BRICKS);
        edgeCount++;
      }
    }
  }

  // Pointed dripstone + hanging roots under the island (chunky features).
  const dr = new Rng(seed ^ 0x5f3759df);
  for (let i = 0; i < 90; i++) {
    const dx = dr.int(-55, 55);
    const dz = dr.int(-55, 55);
    const x = cx + dx;
    const z = cz + dz;
    // Find the lowest solid block in this column.
    let y = groundY - 2;
    while (y > groundY - 60 && w.isAir(x, y, z)) y--;
    if (w.isAir(x, y, z)) continue; // outside island
    const feature = dr.f();
    if (feature < 0.5) {
      // stalactite: dripstone block + 1-3 pointed tips below
      w.set(x, y - 1, z, B.DRIPSTONE_BLOCK);
      const tips = dr.int(1, 3);
      for (let t = 1; t <= tips; t++) {
        if (y - 1 - t < 0) break;
        if (!w.isAir(x, y - 1 - t, z)) break;
        w.set(x, y - 1 - t, z, B.POINTED_DRIPSTONE);
      }
    } else if (feature < 0.75) {
      w.set(x, y - 1, z, B.HANGING_ROOTS);
    } else {
      w.set(x, y - 1, z, B.GLOW_LICHEN_UP);
    }
  }

  return { radius: R, rimBlocks: edgeCount };
}

module.exports = { generateIsland, depthAt, radiusAt };
