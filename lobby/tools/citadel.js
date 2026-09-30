'use strict';
// The Sky Citadel keep (25x25, x 48..72, z 48..72) + gate + towers + crystal.
// All builders take `ch` (1..5) and change with the story chapter.

const { Rng } = require('./rand');
const B = require('./world').BLOCKS;
const L = require('./layout');
const { GROUND } = L;

// ---- helpers -----------------------------------------------------------------
// Scatter a rubble pile: n blocks of ruined stone in a rough blob.
function RUBBLE(w, rng, x, y, z, n) {
  let placed = 0, guard = 0;
  while (placed < n && guard++ < n * 6) {
    const dx = rng.int(-2, 2);
    const dz = rng.int(-2, 2);
    const dy = rng.int(0, 1);
    const bx = x + dx, by = y + dy, bz = z + dz;
    if (!w.isAir(bx, by, bz)) continue;
    const roll = rng.f();
    w.set(bx, by, bz,
      roll < 0.4 ? B.CRACKED_STONE_BRICKS :
      roll < 0.7 ? B.MOSSY_STONE_BRICKS :
      roll < 0.9 ? B.COBBLESTONE : B.STONE_BRICKS);
    placed++;
  }
}

// Weather a wall: randomly swap some bricks for cracked/mossy variants.
function WEATHER(w, rng, x1, y1, z1, x2, y2, z2, amount) {
  for (let y = y1; y <= y2; y++)
    for (let z = z1; z <= z2; z++)
      for (let x = x1; x <= x2; x++) {
        if (w.isAir(x, y, z)) continue; // never fill openings with "weathering"
        if (!rng.chance(amount)) continue;
        const roll = rng.f();
        w.set(x, y, z, roll < 0.5 ? B.CRACKED_STONE_BRICKS : B.MOSSY_STONE_BRICKS);
      }
}

// Hanging vines down a wall face at column (x,z), from y downward.
function WALL_VINES(w, rng, x, y, z, face, maxLen) {
  const b = { N: B.VINE_N, S: B.VINE_S, E: B.VINE_E, W: B.VINE_W }[face];
  const len = rng.int(2, maxLen);
  for (let i = 0; i < len; i++) {
    if (!w.isAir(x, y - i, z)) break;
    w.set(x, y - i, z, b);
  }
}

// ---------------------------------------------------------------------------
// Keep: 25x25 curtain walls with corner towers and a south main gate.
// Chapter look: ch1 broken (rubble, missing wall tops), ch2+ progressively
// repaired, ch5 full height + gold crown.
// ---------------------------------------------------------------------------
function keep(w, ch) {
  const rng = new Rng(1000 + ch);
  const { x1, z1, x2, z2 } = L.ZONES.keep; // 48..72
  const y = GROUND;

  // Curtain wall height by chapter: 4 (broken) -> 7 (full) at ch5.
  const wallH = ch === 1 ? 4 : ch === 2 ? 5 : 7;
  // Walls with gate openings on the south side (x 57..63, z 72) and a north
  // postern (x 59..61, z 48) so the Hall of Relics is reachable.
  for (let x = x1; x <= x2; x++) {
    // north wall with postern opening
    if (x < 59 || x > 61) {
      const h = (ch === 1) ? Math.max(1, wallH - rng.int(0, 2)) : wallH;
      for (let i = 1; i <= h; i++) w.set(x, y + i, z1, B.STONE_BRICKS);
    }
    // south wall, skip gate opening
    if (x < L.GATE.x1 || x > L.GATE.x2) {
      const h2 = (ch === 1) ? Math.max(1, wallH - rng.int(0, 2)) : wallH;
      for (let i = 1; i <= h2; i++) w.set(x, y + i, z2, B.STONE_BRICKS);
    }
  }
  for (let z = z1 + 1; z < z2; z++) {
    const h = (ch === 1) ? Math.max(1, wallH - rng.int(0, 2)) : wallH;
    for (let i = 1; i <= h; i++) {
      w.set(x1, y + i, z, B.STONE_BRICKS);
      w.set(x2, y + i, z, B.STONE_BRICKS);
    }
  }
  // Weathering on all walls (more ruined in ch1).
  WEATHER(w, rng, x1, y + 1, z1, x2, y + wallH, z2, ch === 1 ? 0.35 : ch === 2 ? 0.25 : 0.15);

  // Wall walk + crenellations at full height from ch3+.
  if (ch >= 3) {
    for (let x = x1; x <= x2; x += 2) {
      if (x < 59 || x > 61) w.set(x, y + wallH + 1, z1, B.STONE_BRICKS);
      if (x < L.GATE.x1 || x > L.GATE.x2) w.set(x, y + wallH + 1, z2, B.STONE_BRICKS);
    }
    for (let z = z1 + 2; z < z2; z += 2) {
      w.set(x1, y + wallH + 1, z, B.STONE_BRICKS);
      w.set(x2, y + wallH + 1, z, B.STONE_BRICKS);
    }
  }

  // Corner towers: 5x5, taller than walls. ch1: broken stumps; ch5: tall crowns.
  const towers = [
    { x1: x1, z1: z1, x2: x1 + 4, z2: z1 + 4 },
    { x1: x2 - 4, z1: z1, x2: x2, z2: z1 + 4 },
    { x1: x1, z1: z2 - 4, x2: x1 + 4, z2: z2 },
    { x1: x2 - 4, z1: z2 - 4, x2: x2, z2: z2 },
  ];
  const towerH = ch === 1 ? 6 : ch === 2 ? 8 : ch === 3 ? 10 : ch === 4 ? 12 : 15;
  for (const t of towers) {
    const ragged = ch === 1;
    for (let x = t.x1; x <= t.x2; x++) {
      for (let z = t.z1; z <= t.z2; z++) {
        const edge = x === t.x1 || x === t.x2 || z === t.z1 || z === t.z2;
        if (!edge) continue;
        const top = ragged ? Math.max(2, towerH - rng.int(0, 3)) : towerH;
        for (let i = 1; i <= top; i++) w.set(x, y + i, z, B.STONE_BRICKS);
      }
    }
    WEATHER(w, rng, t.x1, y + 1, t.z1, t.x2, y + towerH, t.z2, ch === 1 ? 0.3 : 0.15);
    // Tower cap: ch3+ gets a floor + rim; ch5 gold trim + roof.
    if (ch >= 3) {
      w.fill(t.x1, y + towerH, t.z1, t.x2, y + towerH, t.z2, B.STONE_BRICKS);
      for (let x = t.x1; x <= t.x2; x++) {
        for (let z = t.z1; z <= t.z2; z++) {
          const edge = x === t.x1 || x === t.x2 || z === t.z1 || z === t.z2;
          if (edge && (x + z) % 2 === 0) w.set(x, y + towerH + 1, z, B.STONE_BRICKS);
        }
      }
    }
    if (ch >= 5) {
      // Gold crown ring + calcite spire tip.
      for (let x = t.x1; x <= t.x2; x++) {
        for (let z = t.z1; z <= t.z2; z++) {
          const edge = x === t.x1 || x === t.x2 || z === t.z1 || z === t.z2;
          if (edge) w.set(x, y + towerH + 2, z, B.GOLD_BLOCK);
        }
      }
      w.fill(t.x1 + 1, y + towerH + 3, t.z1 + 1, t.x2 - 1, y + towerH + 3, t.z2 - 1, B.CALCITE);
      w.set(t.x1 + 2, y + towerH + 4, t.z1 + 2, B.CALCITE);
      w.set(t.x2 - 2, y + towerH + 4, t.z2 - 2, B.CALCITE);
      // tower lamps
      w.set(t.x1 + 2, y + towerH + 1, t.z1 + 2, B.GLOWSTONE);
    }
    // ch4+ lanterns at tower doors.
    if (ch >= 4) {
      w.set(t.x1 + 2, y + 2, t.z2, B.LANTERN);
    }
  }

  // Central keep: 15x15 inner hall (x 53..67, z 53..67), walls 2 stories.
  const kx1 = 53, kz1 = 53, kx2 = 67, kz2 = 67;
  const keepH = ch === 1 ? 5 : ch === 2 ? 6 : 9;
  for (let x = kx1; x <= kx2; x++) {
    for (let z = kz1; z <= kz2; z++) {
      const edge = x === kx1 || x === kx2 || z === kz1 || z === kz2;
      if (!edge) continue;
      const top = ch === 1 ? Math.max(2, keepH - rng.int(0, 2)) : keepH;
      for (let i = 1; i <= top; i++) w.set(x, y + i, z, B.STONE_BRICKS);
    }
  }
  WEATHER(w, rng, kx1, y + 1, kz1, kx2, y + keepH, kz2, ch === 1 ? 0.35 : 0.12);

  // Inner keep doorways: south (facing altar), north (facing hall), east, west.
  w.fill(59, y + 1, kz2, 61, y + 2, kz2, B.AIR);
  w.fill(59, y + 1, kz1, 61, y + 2, kz1, B.AIR);
  w.fill(kx1, y + 1, 59, kx1, y + 2, 61, B.AIR);
  w.fill(kx2, y + 1, 59, kx2, y + 2, 61, B.AIR);

  // Keep roof: ch1 none (open, broken rafters), ch2 partial, ch3+ full slab,
  // ch5 gold-crowned central drum.
  if (ch === 1) {
    // a few blackstone "rafters"
    for (let x = kx1 + 2; x <= kx2 - 2; x += 4) w.set(x, y + keepH, 60, B.BLACKSTONE);
  } else if (ch === 2) {
    w.fill(kx1, y + keepH, kz1, kx2, y + keepH, kz2, B.STONE_BRICKS);
    // hole in the middle (still under repair)
    w.fill(58, y + keepH, 58, 62, y + keepH, 62, B.AIR);
  } else {
    w.fill(kx1, y + keepH, kz1, kx2, y + keepH, kz2, B.STONE_BRICKS);
    if (ch >= 4) {
      // blackstone + gilded band around the roof edge
      for (let x = kx1; x <= kx2; x++) {
        for (let z = kz1; z <= kz2; z++) {
          const edge = x === kx1 || x === kx2 || z === kz1 || z === kz2;
          if (edge) w.set(x, y + keepH + 1, z, (x + z) % 5 === 0 ? B.GILDED_BLACKSTONE : B.POLISHED_BLACKSTONE_BRICKS);
        }
      }
    }
    if (ch >= 5) {
      // central drum + gold crown
      w.fill(57, y + keepH + 1, 57, 63, y + keepH + 2, 63, B.SMOOTH_QUARTZ);
      w.walls(57, y + keepH + 3, 57, 63, y + keepH + 3, 63, B.GOLD_BLOCK);
      w.fill(58, y + keepH + 4, 58, 62, y + keepH + 4, 62, B.CALCITE);
      w.set(60, y + keepH + 5, 60, B.GOLD_BLOCK);
    }
  }

  // Interior floor detail: cracked tiles + a central amethyst inlay.
  for (let x = kx1; x <= kx2; x++) {
    for (let z = kz1; z <= kz2; z++) {
      if (rng.chance(0.08)) w.set(x, y, z, B.CRACKED_STONE_BRICKS);
    }
  }
  w.fill(58, y, 58, 62, y, 62, B.POLISHED_ANDESITE);
  w.set(60, y, 60, B.AMETHYST_BLOCK);

  // ch1 interior rubble; ch2+ cleared but with moss; ch4+ lit halls.
  if (ch === 1) {
    // Rubble piles placed clear of all four doorway corridors.
    RUBBLE(w, rng, 55, y + 1, 57, 8);
    RUBBLE(w, rng, 65, y + 1, 64, 12);
    RUBBLE(w, rng, 55, y + 1, 64, 6);
  } else {
    for (let x = kx1 + 1; x <= kx2 - 1; x += 2) {
      for (let z = kz1 + 1; z <= kz2 - 1; z += 2) {
        if (w.isAir(x, y + 1, z) && rng.chance(0.12)) w.set(x, y + 1, z, B.MOSS_CARPET);
      }
    }
  }
  {
    for (const [lx, lz] of [[55, 55], [65, 55], [55, 65], [65, 65]]) {
      w.set(lx, y + 3, lz, B.LANTERN_HANGING);
      w.set(lx, y + 4, lz, B.CHAIN);
    }
  }

  // Courtyard (between curtain and keep): ch1 rubble, ch2+ gardens.
  if (ch === 1) {
    // Courtyard rubble, clear of both gate corridors.
    RUBBLE(w, rng, 51, y + 1, 60, 8);
    RUBBLE(w, rng, 69, y + 1, 55, 10);
    RUBBLE(w, rng, 67, y + 1, 70, 9);
  } else {
    const gr = new Rng(500 + ch);
    for (let x = x1 + 2; x <= x2 - 2; x++) {
      for (let z = z1 + 2; z <= z2 - 2; z++) {
        const inKeep = x >= kx1 && x <= kx2 && z >= kz1 && z <= kz2;
        if (inKeep) continue;
        if (w.name(x, y, z) !== 'minecraft:grass_block') continue;
        if (!w.isAir(x, y + 1, z)) continue;
        // keep gate + postern corridors clear
        if (z >= 70 && x >= 55 && x <= 65) continue;
        if (z <= 50 && x >= 57 && x <= 63) continue;
        const r = gr.f();
        if (r < 0.25) w.set(x, y + 1, z, B.MOSS_CARPET);
        else if (r < 0.33) w.set(x, y + 1, z, gr.chance(0.5) ? B.OXEYE_DAISY : B.CORNFLOWER);
        else if (r < 0.38) w.set(x, y + 1, z, B.AZALEA_LEAVES);
        else if (r < 0.41) w.set(x, y + 1, z, B.FLOWERING_AZALEA);
      }
    }
    // garden trees at courtyard corners
    const { SKY_TREE } = require('./zones');
    SKY_TREE(w, gr, 51, y, 51);
    SKY_TREE(w, gr, 69, y, 69);
    if (ch >= 3) SKY_TREE(w, gr, 69, y, 51);
    if (ch >= 4) SKY_TREE(w, gr, 51, y, 69);
  }

  // Vines on outer walls (more in later chapters — overgrowth follows repair).
  const vr = new Rng(900 + ch);
  const vineAmount = ch === 1 ? 4 : ch === 2 ? 8 : 12;
  // Keep vines out of the gate corridor (x 56..64 on south walls).
  const vineX = () => {
    const vx = vr.int(x1 + 1, x2 - 1);
    return vx > 55 && vx < 65 ? (vx < 60 ? 52 : 68) : vx;
  };
  for (let i = 0; i < vineAmount; i++) {
    const side = vr.int(0, 3);
    if (side === 0) WALL_VINES(w, vr, vineX(), y + wallH - 1, z1, 'N', 4);
    else if (side === 1) WALL_VINES(w, vr, vineX(), y + wallH - 1, z2, 'S', 4);
    else if (side === 2) WALL_VINES(w, vr, x1, y + wallH - 1, vr.int(z1 + 1, z2 - 1), 'W', 4);
    else WALL_VINES(w, vr, x2, y + wallH - 1, vr.int(z1 + 1, z2 - 1), 'E', 4);
  }
}

// ---------------------------------------------------------------------------
// Chapter atmosphere outside the keep's core geometry.
// ch3+ adds the Drowned Spire and four edge waterfalls; ch4+ turns four
// interior hearths into the warm Ember Halls. These persist into later
// chapters so the restored citadel keeps the story of earlier repairs.
// ---------------------------------------------------------------------------
function chapterAtmosphere(w, ch) {
  const y = GROUND;

  if (ch >= 3) {
    // A slim prismarine fountain-spire in the north-east courtyard. It stays
    // clear of the keep's east doorway and all north/south travel corridors.
    const sx = 69, sz = 56;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (Math.abs(dx) === 2 || Math.abs(dz) === 2) {
          w.set(sx + dx, y, sz + dz, (dx + dz) % 2 === 0 ? B.DARK_PRISMARINE : B.PRISMARINE_BRICKS);
        }
      }
    }
    w.set(sx, y, sz, B.SEA_LANTERN);
    for (let iy = 1; iy <= 9; iy++) {
      const frame = iy <= 5 || iy % 2 === 1;
      if (frame) {
        w.set(sx - 1, y + iy, sz, iy % 3 === 0 ? B.PRISMARINE_BRICKS : B.PRISMARINE);
        w.set(sx + 1, y + iy, sz, iy % 3 === 0 ? B.PRISMARINE_BRICKS : B.PRISMARINE);
        w.set(sx, y + iy, sz - 1, iy % 3 === 0 ? B.PRISMARINE_BRICKS : B.PRISMARINE);
        w.set(sx, y + iy, sz + 1, iy % 3 === 0 ? B.PRISMARINE_BRICKS : B.PRISMARINE);
      }
      w.set(sx, y + iy, sz, B.WATER);
    }
    w.set(sx, y + 10, sz, B.SEA_LANTERN);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      w.set(sx + dx, y + 10, sz + dz, B.WATER);
    }

    // Water drops from four quiet diagonal edges, away from the dock, gate,
    // arrival terrace and Hall of Relics. The heads are lit and framed so the
    // feature reads clearly from both above and below the island.
    for (const [wx, wz, ix, iz] of [
      [18, 18, 1, 1], [102, 18, -1, 1],
      [102, 102, -1, -1], [18, 102, 1, -1],
    ]) {
      w.set(wx + ix, y, wz + iz, B.SEA_LANTERN);
      w.set(wx + ix * 2, y, wz + iz * 2, B.PRISMARINE_BRICKS);
      // Three uneven lanes form a natural curtain below a solid rim. Water
      // starts under the walkable surface, so there is no hole to fall into.
      const tx = -iz, tz = ix;
      const depths = [27, 34, 30];
      for (let lane = -1; lane <= 1; lane++) {
        const lx = wx + tx * lane, lz = wz + tz * lane;
        w.set(lx, y, lz, B.STONE_BRICKS);
        w.set(lx, y - 1, lz, B.WATER);
        for (let wy = y - 2; wy >= y - depths[lane + 1]; wy--) {
          w.set(lx, wy, lz, B.WATER_FALLING);
        }
      }
    }
  }

  if (ch >= 4) {
    // Four low hearths make the Ember Halls literal without redstone or
    // entities. Polished blackstone isolates the fire from greenery.
    for (const [hx, hz] of [[56, 56], [64, 56], [56, 64], [64, 64]]) {
      w.set(hx, y - 1, hz, B.SHROOMLIGHT);
      w.set(hx, y, hz, B.POLISHED_BLACKSTONE_BRICKS);
      w.set(hx, y + 1, hz, B.CAMPFIRE_UNLIT);
    }
  }
}

// ---------------------------------------------------------------------------
// Donation Altar: round dais in front of the keep gate at (60, 76), lectern
// + amethyst clusters + floating crystal. Present in all chapters; gains
// gold trim at ch4+.
// ---------------------------------------------------------------------------
function altar(w, ch) {
  const rng = new Rng(2000 + ch);
  const { x, z } = L.ALTAR; // 60, 76
  const y = GROUND;

  // Square dais 7x7 (x 57..63, z 73..79) with cut corners.
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      if (Math.abs(dx) === 3 && Math.abs(dz) === 3) continue; // cut corners
      w.set(x + dx, y, z + dz, B.CHISELED_STONE_BRICKS);
    }
  }
  // Inner ring: polished andesite, amethyst clusters at 4 points.
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      w.set(x + dx, y, z + dz, B.POLISHED_ANDESITE);
    }
  }
  for (const [dx, dz] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
    w.set(x + dx, y + 1, z + dz, B.AMETHYST_CLUSTER);
  }
  // Steps on the south side (toward spawn).
  w.set(x, y, z + 4, B.STONE_BRICK_SLAB);

  // Central pedestal: 2 blocks + lectern on top (facing south = toward spawn).
  w.fill(x, y + 1, z, x, y + 2, z, B.QUARTZ_PILLAR);
  w.set(x, y + 3, z, B.LECTERN_S);
  // Lectern explanation sign next to it (standing sign on a fence post).
  w.set(x + 2, y + 1, z + 1, B.SPRUCE_FENCE);
  w.set(x + 2, y + 2, z + 1, B.SPRUCE_SIGN_W);
  w.addSign(x + 2, y + 2, z + 1, 'W', ['§dDonation Altar', '§7bring relics', '§7and /donate', '§8repair the citadel']);

  // Floating amethyst crystal above the altar (dim in ch1, beacon beam ch5).
  const cy = y + 8;
  if (ch >= 5) {
    // A valid 3x3 mineral base powers the beacon. The amethyst is a ring,
    // leaving the complete centre column clear for the beam.
    w.fill(x - 1, cy - 3, z - 1, x + 1, cy - 3, z + 1, B.GOLD_BLOCK);
    w.set(x, cy - 2, z, B.BEACON);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      w.set(x + dx, cy, z + dz, B.AMETHYST_BLOCK);
      w.set(x + dx, cy + 1, z + dz, B.AMETHYST_CLUSTER);
    }
  } else {
    w.set(x, cy, z, B.BUDDING_AMETHYST);
    w.set(x, cy + 1, z, B.AMETHYST_BLOCK);
    w.set(x, cy - 1, z, B.AMETHYST_CLUSTER);
    if (ch >= 3) {
      // small orbiting shards
      w.set(x + 1, cy, z, B.AMETHYST_CLUSTER);
      w.set(x - 1, cy + 1, z, B.AMETHYST_CLUSTER);
    }
  }

  // Light around the dais: hidden glowstone in the pedestal + corner lamps ch2+.
  w.set(x, y - 1, z, B.GLOWSTONE); // light through the floor seam
  if (ch >= 2) {
    w.set(x - 3, y + 1, z - 3, B.LANTERN);
    w.set(x + 3, y + 1, z - 3, B.LANTERN);
  }
  if (ch >= 4) {
    w.set(x - 3, y + 1, z + 3, B.SOUL_LANTERN);
    w.set(x + 3, y + 1, z + 3, B.SOUL_LANTERN);
  }

  // ch1: a few rubble bits near the altar (unrepaired plaza).
  if (ch === 1) {
    RUBBLE(w, rng, x - 4, y + 1, z - 4, 5);
    RUBBLE(w, rng, x + 5, y + 1, z + 2, 4);
  }
}

// ---------------------------------------------------------------------------
// Chapter Pillars: 5 pillars around the keep. Pillar i is restored+lit when
// ch > i (chapter 1 restores none... pillar i restored when ch >= i+1), i.e.
// in ch1 all are broken, ch5 all stand.
// ---------------------------------------------------------------------------
function pillars(w, ch) {
  const y = GROUND;
  // Per LOBBY_MAP.md concept art: ch1 all broken, then 2/3/4/5 restored.
  const RESTORED = [0, 2, 3, 4, 5];
  L.PILLARS.forEach((p, i) => {
    const rng = new Rng(3000 + i * 10 + ch);
    const restored = i < RESTORED[ch - 1];
    const h = restored ? 9 : 5;

    // Base ring 3x3.
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        w.set(p.x + dx, y, p.z + dz, B.CHISELED_STONE_BRICKS);
      }
    }
    // Shaft 1x1 (pillar look via polished andesite + stone bricks mix).
    if (restored) {
      for (let iy = 1; iy <= h; iy++) w.set(p.x, y + iy, p.z, iy % 3 === 0 ? B.CHISELED_STONE_BRICKS : B.STONE_BRICKS);
      // Capital + amethyst top + end rods at the 4 diagonal corners.
      w.set(p.x, y + h + 1, p.z, B.STONE_BRICKS);
      w.set(p.x, y + h + 2, p.z, B.AMETHYST_BLOCK);
      w.set(p.x + 1, y + h + 2, p.z + 1, B.END_ROD);
      w.set(p.x - 1, y + h + 2, p.z - 1, B.END_ROD);
      w.set(p.x + 1, y + h + 2, p.z - 1, B.END_ROD);
      w.set(p.x - 1, y + h + 2, p.z + 1, B.END_ROD);
    } else {
      // Broken stump with rubble (never tall enough to reach y+5).
      const stump = Math.max(1, Math.min(3, h - rng.int(1, 2)));
      for (let iy = 1; iy <= stump; iy++) w.set(p.x, y + iy, p.z, B.CRACKED_STONE_BRICKS);
      RUBBLE(w, rng, p.x, y + 1, p.z, 8);
      if (rng.chance(0.6)) w.set(p.x, y + stump + 1, p.z, B.MOSS_CARPET);
    }

    // Sign at the base: chapter number (front faces the citadel centre).
    const dxs = 60 - p.x, dzs = 60 - p.z;
    let face = 'N';
    if (Math.abs(dxs) >= Math.abs(dzs)) face = dxs > 0 ? 'E' : 'W';
    else face = dzs > 0 ? 'S' : 'N';
    const sx = p.x + (face === 'E' ? 1 : face === 'W' ? -1 : 0);
    const sz = p.z + (face === 'S' ? 1 : face === 'N' ? -1 : 0);
    const signBlock = { N: B.OAK_WALL_SIGN_N, S: B.OAK_WALL_SIGN_S, E: B.OAK_WALL_SIGN_E, W: B.OAK_WALL_SIGN_W }[face];
    w.set(sx, y + 1, sz, signBlock);
    const label = restored
      ? ['§dChapter ' + (i + 1), '§7restored', '', '']
      : ['§8Chapter ' + (i + 1), '§7not yet', '§7awakened', ''];
    w.addSign(sx, y + 1, sz, face, label);
  });
}

module.exports = { keep, altar, pillars, chapterAtmosphere, RUBBLE, WEATHER, WALL_VINES };
