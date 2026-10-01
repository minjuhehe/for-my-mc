'use strict';
const { World, BLOCKS: B } = require('./world');
const Z = require('./zones');
const { Rng } = require('./rand');

// A new travel plaza, independent of the five restoration chapters.
module.exports = function buildHub() {
  const w = new World(121, 96, 121);
  function island(cx, cz, r, depth) {
    for (let y = 80 - depth; y <= 80; y++) {
      const rr = r * (0.25 + 0.75 * (y - 80 + depth) / depth);
      for (let x = Math.ceil(cx - rr); x <= cx + rr; x++) {
        for (let z = Math.ceil(cz - rr); z <= cz + rr; z++) {
          if ((x-cx)**2 + (z-cz)**2 > rr**2) continue;
          w.set(x,y,z,y === 80 ? B.POLISHED_ANDESITE : ((x+z+y)%7 ? B.STONE : B.TUFF));
        }
      }
    }
  }
  island(60,90,24,18);
  island(28,90,9,10); island(92,90,9,10); island(60,50,10,12);
  // Broad crosswalks and contrasting borders.
  w.fill(57,80,66,63,80,113,B.SMOOTH_QUARTZ);
  w.fill(20,80,87,100,80,93,B.SMOOTH_QUARTZ);
  w.fill(57,80,50,63,80,66,B.SMOOTH_QUARTZ);
  for (let x=20;x<=100;x++) for (const z of [86,94]) {
    if (w.isAir(x,80,z)) w.set(x,80,z,B.STONE_BRICKS);
    w.set(x,81,z,B.STONE_BRICK_WALL);
  }
  for (let z=50;z<=66;z++) for (const x of [56,64]) {
    w.set(x,80,z,B.STONE_BRICKS); w.set(x,81,z,B.STONE_BRICK_WALL);
  }
  // Central compass mosaic with a clear route through its centre.
  for(let x=52;x<=68;x++) for(let z=82;z<=98;z++) {
    const d=Math.abs(x-60)+Math.abs(z-90);
    if(d<=8) w.set(x,80,z,d===8?B.GOLD_BLOCK:d===0?B.SEA_LANTERN:B.SMOOTH_QUARTZ);
  }
  // Travel pavilions: island / city / future exploration.
  for(const [cx,cz,accent] of [[28,90,{name:'minecraft:emerald_block'}],[92,90,B.AMETHYST_BLOCK],[60,50,B.PRISMARINE_BRICKS]]) {
    w.fill(cx-5,80,cz-5,cx+5,80,cz+5,B.SMOOTH_QUARTZ);
    for(const dx of [-5,5]) for(const dz of [-5,5]) {
      w.fill(cx+dx,81,cz+dz,cx+dx,85,cz+dz,B.QUARTZ_PILLAR);
      w.set(cx+dx,86,cz+dz,B.LANTERN);
    }
    w.fill(cx-6,86,cz-6,cx+6,86,cz+6,B.SPRUCE_SLAB);
    w.fill(cx-3,80,cz-3,cx+3,80,cz+3,accent);
  }
  // Safe arrival pad and landscaped seating pockets.
  w.fill(57,80,105,63,80,111,B.SMOOTH_QUARTZ);
  w.set(60,80,108,B.CHISELED_QUARTZ);
  for (const [x,z] of [[44,76],[76,76],[44,103],[76,103]]) {
    w.fill(x-3,80,z-3,x+3,80,z+3,B.GRASS_BLOCK);
    Z.SKY_TREE(w,new Rng(x*100+z),x,80,z);
    w.set(x-3,81,z+2,B.SPRUCE_STAIRS);
    w.set(x+3,81,z+2,B.SPRUCE_STAIRS);
  }
  for(const [x,z] of [[54,107],[66,107],[50,90],[70,90],[60,74],[28,83],[92,83],[60,44]]) {
    Z.LANTERN_POST(w,x,80,z);
    w.set(x,80,z,B.SEA_LANTERN);
  }
  return w;
};
