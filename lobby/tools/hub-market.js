'use strict';
const { World, BLOCKS: B } = require('./world');
const Z = require('./zones');
const { Rng } = require('./rand');
const block = (name, props) => ({name:`minecraft:${name}`, ...(props ? {props} : {})});
// Public town; clipboard origin stays (60,81,108).
module.exports = function buildHub() {
  const w = new World(121,112,121);
  function island(cx,cz,r,depth) {
    for(let y=80-depth;y<=80;y++) {
      const rr=r*(0.22+0.78*(y-80+depth)/depth);
      for(let x=Math.ceil(cx-rr);x<=cx+rr;x++) for(let z=Math.ceil(cz-rr);z<=cz+rr;z++) {
        if((x-cx)**2+(z-cz)**2>rr**2) continue;
        w.set(x,y,z,y===80?B.GRASS_BLOCK:((x+z+y)%11===0?B.TUFF:B.STONE));
        if(y===80 && (x-cx)**2+(z-cz)**2>(r-1.5)**2) {
          w.set(x,y,z,B.STONE_BRICKS);w.set(x,y+1,z,B.STONE_BRICK_WALL);
        }
      }
    }
  }
  island(60,72,39,25);
  for(const [x,z] of [[24,48],[96,48],[24,92],[96,92]]) island(x,z,16,18);
  island(60,18,13,17);
  function path(x1,z1,x2,z2,width=3) {
    if(x1!==x2 && z1!==z2) throw Error('Paths must be axial');
    const minX=Math.min(x1,x2),maxX=Math.max(x1,x2),minZ=Math.min(z1,z2),maxZ=Math.max(z1,z2);
    if(x1===x2) {w.fill(x1-width,80,minZ,x1+width,80,maxZ,B.SMOOTH_QUARTZ);w.fill(x1-width,81,minZ,x1+width,83,maxZ,B.AIR);}
    else {w.fill(minX,80,z1-width,maxX,80,z1+width,B.SMOOTH_QUARTZ);w.fill(minX,81,z1-width,maxX,83,z1+width,B.AIR);}
  }
  path(60,108,60,18);path(24,48,96,48);path(24,92,96,92);
  path(24,48,24,92);path(96,48,96,92);
  for(let z=27;z<=34;z++) for(const x of [56,64]) {w.set(x,80,z,B.STONE_BRICKS);w.set(x,81,z,B.SPRUCE_FENCE);}
  w.fill(55,80,104,65,80,112,B.SMOOTH_QUARTZ);w.set(60,80,108,B.CHISELED_QUARTZ);
  for(const x of [54,66]) {w.fill(x,81,105,x,89,105,B.QUARTZ_PILLAR);w.set(x,90,105,B.LANTERN);}
  w.fill(54,89,105,66,89,105,B.SMOOTH_QUARTZ);
  // Compass plaza and contained fountain.
  for(let x=48;x<=72;x++) for(let z=60;z<=84;z++) {
    const d=(x-60)**2+(z-72)**2;
    if(d<=144) {w.set(x,80,z,d>=121?B.PRISMARINE_BRICKS:B.SMOOTH_QUARTZ);w.fill(x,81,z,x,83,z,B.AIR);}
    if(d<=25) {w.set(x,80,z,B.SEA_LANTERN);w.set(x,81,z,d>=16?B.STONE_BRICK_SLAB:B.WATER);}
  }
  w.fill(60,81,72,60,84,72,B.QUARTZ_PILLAR);w.set(60,85,72,B.SEA_LANTERN);w.set(60,86,72,B.WATER);
  function hall(cx,cz,roof,accent) {
    w.fill(cx-8,80,cz-7,cx+8,80,cz+7,B.SMOOTH_QUARTZ);
    w.fill(cx-7,81,cz-6,cx+7,87,cz-6,B.CALCITE);
    w.fill(cx-7,81,cz-6,cx-7,87,cz+6,B.CALCITE);w.fill(cx+7,81,cz-6,cx+7,87,cz+6,B.CALCITE);
    for(const dx of [-7,7]) for(const dz of [-6,6]) w.fill(cx+dx,81,cz+dz,cx+dx,88,cz+dz,B.STRIPPED_SPRUCE_LOG);
    for(const dx of [-4,4]) w.fill(cx+dx,82,cz-6,cx+dx+1,85,cz-6,B.GLASS);
    for(let dx=-9;dx<=9;dx++) {const y=88+Math.floor((9-Math.abs(dx))/2);w.fill(cx+dx,y,cz-8,cx+dx,y,cz+8,roof);}
    w.fill(cx-3,81,cz+2,cx+3,81,cz+2,accent);
    for(const dx of [-6,6]) w.set(cx+dx,86,cz+5,B.LANTERN_HANGING);
    w.set(cx-5,81,cz-4,B.BARREL);w.set(cx+5,81,cz-4,B.CHEST_S);
  }
  hall(24,42,block('green_concrete'),B.SPRUCE_PLANKS);
  hall(96,42,block('cyan_concrete'),B.PRISMARINE_BRICKS);
  hall(24,86,block('purple_concrete'),B.BOOKSHELF);
  hall(96,86,block('yellow_concrete'),B.GOLD_BLOCK);
  for(const [cx,cz,crop] of [[17,58,'carrots'],[29,58,'potatoes'],[17,65,'wheat'],[29,65,'beetroots']]) {
    w.fill(cx-3,80,cz-2,cx+3,80,cz+2,block('farmland',{moisture:'7'}));w.set(cx,80,cz,B.WATER);
    for(let x=cx-3;x<=cx+3;x++) for(let z=cz-2;z<=cz+2;z++) if(x!==cx||z!==cz) w.set(x,81,z,block(crop,{age:crop==='beetroots'?'3':'7'}));
    for(const x of [cx-4,cx+4]) w.fill(x,81,cz-3,x,81,cz+3,B.SPRUCE_FENCE);
  }
  for(const [x,z,roof] of [[38,56,'green_wool'],[82,56,'cyan_wool']]) {
    w.fill(x-3,80,z-3,x+3,80,z+3,B.SPRUCE_PLANKS);w.fill(x-2,81,z,x+2,81,z,B.BARREL);
    for(const dx of [-3,3]) w.fill(x+dx,81,z-2,x+dx,84,z-2,B.SPRUCE_FENCE);
    w.fill(x-4,85,z-3,x+4,85,z+2,block(roof));w.set(x,84,z-1,B.LANTERN_HANGING);
  }
  w.fill(18,81,81,19,84,81,B.BOOKSHELF);w.fill(29,81,81,30,84,81,B.BOOKSHELF);w.set(24,81,83,B.LECTERN_S);
  for(const x of [91,101]) {w.set(x,81,83,B.GOLD_BLOCK);w.set(x,82,83,B.GLASS);w.set(x,83,83,B.LANTERN);}
  for(const x of [52,68]) for(const z of [12,24]) w.fill(x,81,z,x,88,z,B.QUARTZ_PILLAR);
  w.fill(51,89,11,69,89,25,B.PRISMARINE_BRICKS);w.fill(56,80,14,64,80,22,B.AMETHYST_BLOCK);
  for(const [x,z] of [[42,38],[78,38],[42,92],[78,92],[45,55],[75,55],[45,86],[75,86]]) {
    Z.SKY_TREE(w,new Rng(x*100+z),x,80,z);w.set(x-2,81,z+2,B.POTTED_POPPY);
  }
  for(const [x,z] of [[54,100],[66,100],[50,90],[70,90],[48,58],[72,58],[54,34],[66,34],[24,72],[96,72],[38,98],[82,98]]) {
    Z.LANTERN_POST(w,x,80,z);w.set(x,80,z,B.SEA_LANTERN);
  }
  for(const [x,z] of [[47,76],[73,76],[47,66],[73,66]]) {w.fill(x-2,81,z,x+2,81,z,B.SPRUCE_STAIRS);w.set(x-3,81,z,B.POTTED_AZALEA);w.set(x+3,81,z,B.POTTED_AZALEA);}
  w.fill(56,79,105,64,79,113,B.STONE_BRICKS);
  return w;
};
