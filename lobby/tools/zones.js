'use strict';
// Zone builders part 1: Arrival Terrace, Tutorial Path, Ruin Dock, Island Gate.
// Shared helpers (PAVE, LANTERN_POST, GREENERY, LIGHT_WALKABLE) live here too.

const { Rng } = require('./rand');
const B = require('./world').BLOCKS;
const L = require('./layout');
const GROUND = L.GROUND;

// ---- helpers ------------------------------------------------------------------
function PAVE(w, x, y, z, blk) { w.set(x, y, z, blk); }

// Lantern on a stone-brick wall post: post at y+1..y+2, lantern on top.
function LANTERN_POST(w, x, y, z) {
  w.set(x, y + 1, z, B.STONE_BRICK_WALL);
  w.set(x, y + 2, z, B.LANTERN);
}

// Small tree: spruce trunk + azalea leaf blob, returns nothing.
function SKY_TREE(w, rng, x, y, z) {
  const h = rng.int(4, 6);
  for (let i = 1; i <= h; i++) w.set(x, y + i, z, B.SPRUCE_LOG);
  for (let dy = h - 2; dy <= h + 1; dy++) {
    const rr = dy >= h ? 1 : 2;
    for (let dx = -rr; dx <= rr; dx++) {
      for (let dz = -rr; dz <= rr; dz++) {
        if (Math.abs(dx) === rr && Math.abs(dz) === rr && rng.chance(0.7)) continue;
        w.setIfAir(x + dx, y + dy, z + dz,
          rng.chance(0.35) ? B.FLOWERING_AZALEA_LEAVES : B.AZALEA_LEAVES);
      }
    }
  }
}

// Greenery pass: moss carpet, flowers, grass on grass blocks near edges.
function GREENERY(w, rng, x1, z1, x2, z2) {
  for (let z = z1; z <= z2; z++) {
    for (let x = x1; x <= x2; x++) {
      // keep the main-gate (south) and postern (north) corridors walkable
      if (z >= 70 && z <= 74 && x >= 55 && x <= 65) continue;
      if (z >= 46 && z <= 50 && x >= 57 && x <= 63) continue;
      // keep the keep's doorway lines + interior clear of outside greenery
      if (x >= 55 && x <= 65 && z >= 51 && z <= 69) continue;
      if (w.name(x, GROUND, z) !== 'minecraft:grass_block') continue;
      if (!w.isAir(x, GROUND + 1, z)) continue;
      const r = rng.f();
      if (r < 0.30) w.set(x, GROUND + 1, z, B.MOSS_CARPET);
      else if (r < 0.42) w.set(x, GROUND + 1, z, rng.chance(0.5) ? B.OXEYE_DAISY : B.CORNFLOWER);
      else if (r < 0.48) w.set(x, GROUND + 1, z, B.POPPY);
      else if (r < 0.53) w.set(x, GROUND + 1, z, B.GRASS);
    }
  }
}

// Vines hanging from a wall block at (x,y,z) growing on its `face` side.
function HANG_VINE(w, x, y, z, face, len, rng) {
  const b = { N: B.VINE_N, S: B.VINE_S, E: B.VINE_E, W: B.VINE_W }[face];
  for (let i = 0; i < len; i++) {
    if (!w.isAir(x, y - i, z)) break;
    w.set(x, y - i, z, b);
  }
}

// ---------------------------------------------------------------------------
// 1. Arrival Terrace (spawn) — 21x11 paved terrace, south edge.
// ---------------------------------------------------------------------------
function terrace(w) {
  const { x1, z1, x2, z2 } = L.ZONES.terrace;
  const rng = new Rng(4242);

  // Floor: polished andesite with variation; 1-block stone-brick border.
  for (let z = z1; z <= z2; z++) {
    for (let x = x1; x <= x2; x++) {
      const border = x === x1 || x === x2 || z === z1 || z === z2;
      let blk = B.POLISHED_ANDESITE;
      if (border) blk = B.STONE_BRICKS;
      else if (rng.chance(0.12)) blk = B.MOSSY_STONE_BRICKS;
      else if (rng.chance(0.10)) blk = B.CRACKED_STONE_BRICKS;
      w.set(x, GROUND, z, blk);
    }
  }

  // Corner lantern posts.
  LANTERN_POST(w, x1 + 1, GROUND, z1 + 1);
  LANTERN_POST(w, x2 - 1, GROUND, z1 + 1);
  LANTERN_POST(w, x1 + 1, GROUND, z2 - 1);
  LANTERN_POST(w, x2 - 1, GROUND, z2 - 1);

  // Welcome board (left of spawn) and rules board (right of spawn) at z=111.
  const boardY = GROUND + 1;
  // left board: 3x2 quartz panel at x 54..56
  w.fill(54, boardY, 111, 56, boardY + 1, 111, B.CALCITE);
  w.fill(54, boardY + 2, 111, 56, boardY + 2, 111, B.STONE_BRICK_SLAB);
  w.set(55, boardY, 112, B.OAK_SIGN_S);
  w.addSign(55, boardY, 112, 'S', ['§6WELCOME TO', '§eLOST SKY', '§7the sky citadel', '§8awaits repair']);
  // right board: 3x2 panel at x 64..66
  w.fill(64, boardY, 111, 66, boardY + 1, 111, B.CALCITE);
  w.fill(64, boardY + 2, 111, 66, boardY + 2, 111, B.STONE_BRICK_SLAB);
  w.set(65, boardY, 112, B.OAK_SIGN_S);
  w.addSign(65, boardY, 112, 'S', ['§6RULES', '§7be kind', '§7no griefing', '§7have fun']);

  // "server in testing" sign at the terrace entrance (south, z=113 border).
  w.set(60, GROUND + 1, 113, B.OAK_SIGN_S);
  w.addSign(60, GROUND + 1, 113, 'S', ['§7server', '§ein testing', '', '']);

  // Spawn pad: quartz ring under the spawn point, lanterns flanking it.
  w.fill(59, GROUND, 107, 61, GROUND, 109, B.SMOOTH_QUARTZ);
  w.set(60, GROUND, 108, B.CHISELED_QUARTZ);
  LANTERN_POST(w, 54, GROUND, 107);
  LANTERN_POST(w, 66, GROUND, 107);

  // A couple of potted plants + seats near the boards.
  w.set(53, GROUND + 1, 110, B.POTTED_AZALEA);
  w.set(67, GROUND + 1, 110, B.POTTED_AZALEA);
  w.set(52, GROUND + 1, 108, B.SPRUCE_STAIRS);
  w.set(68, GROUND + 1, 108, B.SPRUCE_STAIRS);
}

// ---------------------------------------------------------------------------
// 2. Tutorial Path — 5-wide andesite path from terrace (z=102) to plaza
//    (z=83), five sign stops on the west side with mini displays.
// ---------------------------------------------------------------------------
function tutorialPath(w) {
  const { x1, x2 } = L.ZONES.path; // 58..62
  const rng = new Rng(777);

  for (let z = 83; z <= 102; z++) {
    for (let x = x1; x <= x2; x++) {
      const edge = x === x1 || x === x2;
      let blk = B.POLISHED_ANDESITE;
      if (edge) blk = B.STONE_BRICKS;
      else if (rng.chance(0.15)) blk = B.ANDESITE;
      w.set(x, GROUND, z, blk);
    }
  }

  // Lantern posts flanking the path every 4 blocks.
  for (let z = 85; z <= 101; z += 4) {
    LANTERN_POST(w, x1 - 1, GROUND, z);
    LANTERN_POST(w, x2 + 1, GROUND, z + 2);
  }

  // Five stops along the west side (x=55..56), one every ~4 z.
  const stops = [
    { z: 98, sign: ['§6/is', '§7get your', '§7own island', ''], display: 'island' },
    { z: 94, sign: ['§6/ruin', '§7drifting ruins', '§7dock to the west', ''], display: 'ruin' },
    { z: 90, sign: ['§6Relics', '§7donate them at', '§7the altar ahead', ''], display: 'relic' },
    { z: 86, sign: ['§6/donate', '§7at the amethyst', '§7altar', ''], display: 'altar' },
    { z: 84, sign: ['§6/chapter', '§7watch the story', '§7unfold', ''], display: 'chapter' },
  ];
  for (const s of stops) {
    // sign on a post (fence post + spruce sign block facing east)
    w.set(56, GROUND + 1, s.z, B.SPRUCE_FENCE);
    w.set(56, GROUND + 2, s.z, B.SPRUCE_SIGN_E);
    w.addSign(56, GROUND + 2, s.z, 'E', s.sign);
    // mini display east of the sign
    const dx = 54;
    switch (s.display) {
      case 'island': // mini floating island: 2 grass blocks + tree on a stone nub
        w.fill(dx - 1, GROUND + 1, s.z - 1, dx + 1, GROUND + 1, s.z + 1, B.STONE);
        w.fill(dx - 1, GROUND + 2, s.z - 1, dx + 1, GROUND + 2, s.z + 1, B.GRASS_BLOCK);
        w.set(dx, GROUND + 3, s.z, B.SPRUCE_LOG);
        w.set(dx, GROUND + 4, s.z, B.AZALEA_LEAVES);
        break;
      case 'ruin': // mini ruin: 3 broken mossy pillars
        w.fill(dx - 1, GROUND + 1, s.z, dx + 1, GROUND + 1, s.z, B.COBBLESTONE);
        w.set(dx - 1, GROUND + 2, s.z, B.MOSSY_STONE_BRICKS);
        w.set(dx, GROUND + 2, s.z, B.CRACKED_STONE_BRICKS);
        w.set(dx, GROUND + 3, s.z, B.MOSS_CARPET);
        break;
      case 'relic': // amethyst shard on pedestal
        w.set(dx, GROUND + 1, s.z, B.POLISHED_ANDESITE);
        w.set(dx, GROUND + 2, s.z, B.AMETHYST_CLUSTER);
        break;
      case 'altar': // mini altar: chiseled brick + amethyst blocks
        w.set(dx, GROUND + 1, s.z, B.CHISELED_STONE_BRICKS);
        w.set(dx, GROUND + 2, s.z, B.AMETHYST_BLOCK);
        w.set(dx - 1, GROUND + 1, s.z - 1, B.AMETHYST_CLUSTER);
        w.set(dx + 1, GROUND + 1, s.z + 1, B.AMETHYST_CLUSTER);
        break;
      case 'chapter': // book on lectern
        w.set(dx, GROUND + 1, s.z, B.LECTERN_S);
        break;
    }
  }

  // A couple of azalea bushes flanking the path.
  w.set(55, GROUND + 1, 92, B.AZALEA);
  w.set(65, GROUND + 1, 97, B.FLOWERING_AZALEA);
}

// ---------------------------------------------------------------------------
// 3. Ruin Dock (west) — spruce dock extending from x=15 to x=3, with chains,
//    lantern post, mooring platform and sign.
// ---------------------------------------------------------------------------
function ruinDock(w) {
  const { x1, z1, x2, z2 } = L.ZONES.dock; // x 3..15, z 55..65
  const rng = new Rng(31337);

  // Main deck: spruce planks at GROUND, y+1 empty, supported by spruce log legs
  // down to the underside (3 deep, then nothing — it floats).
  for (let z = z1; z <= z2; z++) {
    for (let x = x1; x <= x2; x++) {
      w.set(x, GROUND, z, B.SPRUCE_PLANKS);
      // legs every 3 blocks on the deck perimeter
      if ((x === x1 || x === x2 || z === z1 || z === z2) && (x % 3 === 0) && (z % 3 === 0)) {
        w.fill(x, GROUND - 1, z, x, GROUND - 4, z, B.SPRUCE_LOG);

      }
    }
  }

  // Mooring: sunken 5x5 platform at the west end (x 3..7, z 58..62), one
  // block below deck, open to the sky so "drifting ruins" can arrive.
  for (let z = 58; z <= 62; z++) {
    for (let x = x1; x <= x1 + 4; x++) {
      w.set(x, GROUND, z, B.AIR);              // open the deck above
      w.set(x, GROUND - 1, z, B.SPRUCE_PLANKS); // sunken platform
    }
  }
  // Railing around the opening at deck level; east side has a walk-in gap.
  for (let x = x1; x <= x1 + 5; x++) {
    w.setIfAir(x, GROUND, 57, B.OAK_FENCE);
    w.setIfAir(x, GROUND, 63, B.OAK_FENCE);
  }
  w.setIfAir(x1 + 5, GROUND, 58, B.OAK_FENCE);
  w.setIfAir(x1 + 5, GROUND, 62, B.OAK_FENCE);

  // Chains dropping from the mooring corners into the void.
  for (let d = 2; d <= 4; d++) {
    w.set(x1 + 1, GROUND - d, 58, B.CHAIN);
    w.set(x1 + 1, GROUND - d, 62, B.CHAIN);
  }

  // A small drifting-ruin chunk floating just off the mooring.
  for (let dx = 0; dx <= 1; dx++) {
    for (let dz = 59; dz <= 61; dz++) {
      w.set(x1 - 3 + dx, GROUND - 3, dz, rng.chance(0.5) ? B.MOSSY_STONE_BRICKS : B.CRACKED_STONE_BRICKS);
    }
  }
  w.set(x1 - 2, GROUND - 2, 60, B.MOSSY_COBBLESTONE);
  w.set(x1 - 3, GROUND - 4, 60, B.MOSS_BLOCK);

  // Lantern posts at the deck corners + a barrel for flavour.
  LANTERN_POST(w, x2 - 1, GROUND, z1 + 1);
  LANTERN_POST(w, x2 - 1, GROUND, z2 - 1);
  w.set(x2 - 1, GROUND + 1, z1 + 2, B.BARREL);

  // Dock sign at the island-side entrance, front facing west (toward walker).
  w.set(16, GROUND + 1, 60, B.SPRUCE_FENCE);
  w.set(16, GROUND + 2, 60, B.SPRUCE_SIGN_W);
  w.addSign(16, GROUND + 2, 60, 'W', ['§6Ruin Dock', '§7drifting ruins', '§7arrive here', '§8/ruin']);
}

// ---------------------------------------------------------------------------
// 4. Island Gate (east) — 11-wide stone arch on the east edge, amethyst
//    keystone, vines, big sign, walkway connecting back to the plaza.
// ---------------------------------------------------------------------------
function islandGate(w) {
  const { x1, z1, x2, z2 } = L.ZONES.gate; // x 100..110, z 53..67
  const cx = 105;                          // arch centre x
  const cz = 60;                           // arch centre z
  const y = GROUND;

  // Arch piers: 2x2 stone brick columns at z 56..57 and 63..64, x 103..104
  // and 106..107 — opening between x 105 and z 58..62.
  const piers = [
    { x1: 103, x2: 104, z1: 56, z2: 57 },
    { x1: 103, x2: 104, z1: 63, z2: 64 },
  ];
  for (const p of piers) {
    w.fill(p.x1, y, p.z1, p.x2, y + 7, p.z2, B.STONE_BRICKS);
    // weathering
    w.set(p.x1, y + 2, p.z1, B.MOSSY_STONE_BRICKS);
    w.set(p.x2, y + 5, p.z2, B.CRACKED_STONE_BRICKS);
  }
  // Arch spans z 56..64 over the walkway (runs east-west).
  for (let z = 58; z <= 62; z++) w.fill(103, y + 7, z, 104, y + 7, z, B.STONE_BRICKS);
  w.fill(103, y + 8, 57, 104, y + 8, 63, B.STONE_BRICKS); // top band
  w.fill(103, y + 9, 58, 104, y + 9, 62, B.STONE_BRICKS); // upper step
  // Keystone: amethyst block + cluster at the crown centre.
  w.set(103, y + 10, 60, B.AMETHYST_BLOCK);
  w.set(104, y + 10, 60, B.AMETHYST_BLOCK);
  w.set(104, y + 11, 60, B.AMETHYST_CLUSTER);
  // End rods at the piers for light.
  w.set(102, y + 1, 56, B.END_ROD);
  w.set(102, y + 1, 64, B.END_ROD);
  // Vines clinging to the pier inner faces (piers at x 103..104).
  HANG_VINE(w, 105, y + 6, 58, 'W', 3, new Rng(1));
  HANG_VINE(w, 102, y + 6, 62, 'E', 2, new Rng(2));

  // Big sign under the arch, facing west (toward arriving players).
  w.set(105, y + 1, 58, B.SPRUCE_FENCE);
  w.set(105, y + 2, 58, B.SPRUCE_SIGN_W);
  w.addSign(105, y + 2, 58, 'W', ['§dIsland Gate', '§eType /is', '§7to get your', '§7own island']);

  // Arch footings drop to the underside; terrace pad at the arch base.
  for (const p of piers) {
    for (const zz of [p.z1, p.z2]) {
      w.fill(p.x1, y - 1, zz, p.x2, y - 3, zz, B.STONE);
    }
  }
  for (let z = 57; z <= 63; z++) {
    for (let x = 103; x <= 107; x++) {
      if (w.isAir(x, y, z) || w.name(x, y, z) === 'minecraft:spruce_fence') continue;
      w.set(x, y, z, B.STONE_BRICKS);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Hall of Relics (north) — 21x13 calcite hall at x 48..72 / z 32..46 with
//    tall windows, relic pedestals + item frames, title board, carpets.
// ---------------------------------------------------------------------------
function hallOfRelics(w) {
  const { x1, z1, x2, z2 } = L.ZONES.hall; // 48..72 x 26..42
  const y = GROUND;
  const zc = 34; // interior aisle centre

  // Floor: calcite with quartz border.
  w.fill(x1, y, z1, x2, y, z2, B.CALCITE);
  w.walls(x1, y, z1, x2, y, z2, B.SMOOTH_QUARTZ);

  // Walls: calcite, 6 tall, with quartz pillars every 6 blocks.
  w.walls(x1, y + 1, z1, x2, y + 6, z2, B.CALCITE);
  for (let x = x1; x <= x2; x += 6) {
    w.fill(x, y + 1, z1, x, y + 6, z1, B.QUARTZ_PILLAR);
    w.fill(x, y + 1, z2, x, y + 6, z2, B.QUARTZ_PILLAR);
  }

  // Tall windows on the north wall at y+3..y+4.
  for (let x = x1 + 4; x <= x2 - 4; x += 4) {
    w.fill(x, y + 3, z1, x, y + 4, z1, B.GLASS);
  }
  // Doorway on south wall facing the keep: opening x 59..61.
  w.fill(59, y + 1, z2, 61, y + 2, z2, B.AIR);

  // Roof: calcite slab cap with glowstone inlays for interior light.
  w.fill(x1, y + 7, z1, x2, y + 7, z2, B.STONE_BRICK_SLAB);
  for (const gx of [52, 60, 68]) {
    w.set(gx, y + 7, zc - 5, B.GLOWSTONE);
    w.set(gx, y + 7, zc + 5, B.GLOWSTONE);
  }
  for (let x = 54; x <= 66; x++) w.set(x, y + 1, zc, B.PURPLE_CARPET);

  // 4 relic pedestals (2 each side): amethyst shard, brick, heart of the sea,
  // nether star — glow item frames flat on the pedestals.
  const relics = [
    { x: 53, z: zc - 4, item: 'minecraft:amethyst_shard', label: ['§dAmethyst Shard', '§71 point', '', ''] },
    { x: 53, z: zc + 4, item: 'minecraft:brick', label: ['§6Brick', '§75 points', '', ''] },
    { x: 67, z: zc - 4, item: 'minecraft:heart_of_the_sea', label: ['§bHeart of the Sea', '§710 points', '', ''] },
    { x: 67, z: zc + 4, item: 'minecraft:nether_star', label: ['§eNether Star', '§725 points', '', ''] },
  ];
  for (const r of relics) {
    w.fill(r.x - 1, y + 1, r.z - 1, r.x + 1, y + 1, r.z + 1, B.POLISHED_ANDESITE);
    w.set(r.x, y + 2, r.z, B.CHISELED_STONE_BRICKS);
    w.set(r.x, y + 3, r.z, B.AMETHYST_BLOCK);
    w.addGlowItemFrame(r.x, y + 4, r.z, 'U', r.item);
    // label wall sign attached to the pedestal core, facing the aisle
    const sx = r.x < 60 ? r.x + 1 : r.x - 1;
    const face = r.x < 60 ? 'E' : 'W';
    w.set(sx, y + 2, r.z, face === 'E' ? B.OAK_WALL_SIGN_E : B.OAK_WALL_SIGN_W);
    w.addSign(sx, y + 2, r.z, face, r.label);
  }

  // Title board on the north wall (between windows): quartz panel + 4 signs.
  w.fill(56, y + 1, z1 + 1, 64, y + 4, z1 + 1, B.SMOOTH_QUARTZ);
  const titles = [
    ['§7Wanderer', '§70 relics', '', ''],
    ['§aPathfinder', '§710 relics', '', ''],
    ['§bSky Warden', '§725 relics', '', ''],
    ['§6Citadel Keeper', '§750 relics', '', ''],
  ];
  titles.forEach((t, i) => {
    w.set(57 + i * 2, y + 1, z1 + 2, B.OAK_SIGN_S);
    w.addSign(57 + i * 2, y + 1, z1 + 2, 'S', t);
  });

  // A bookshelf + chest for cosiness.
  w.set(50, y + 1, z1 + 1, B.BOOKSHELF);
  w.set(50, y + 2, z1 + 1, B.BOOKSHELF);
  w.set(50, y + 1, z1 + 2, B.CHEST_S);
}

module.exports = { terrace, tutorialPath, ruinDock, islandGate, hallOfRelics, PAVE, LANTERN_POST, SKY_TREE, GREENERY, HANG_VINE };