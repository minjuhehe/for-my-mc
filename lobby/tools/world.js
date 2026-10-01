'use strict';
// Voxel world + Sponge v2 schematic export (WorldEdit 7.4.x native, MC 1.21.x).
// World is a flat Int32Array; index = (y * sizeZ + z) * sizeX + x.

const { writeNbt } = require('./nbt');
const { gzipSync } = require('zlib');

// ---- BlockState palette (subset; extend as needed) --------------------------
// Each entry: { name, props? } — props serialized alphabetically.
const BLOCKS = {
  AIR: { name: 'minecraft:air' },

  // Structure / floors
  CALCITE: { name: 'minecraft:calcite' },
  SMOOTH_QUARTZ: { name: 'minecraft:smooth_quartz' },
  QUARTZ_PILLAR: { name: 'minecraft:quartz_pillar' },
  CHISELED_QUARTZ: { name: 'minecraft:chiseled_quartz_block' },
  STONE_BRICKS: { name: 'minecraft:stone_bricks' },
  MOSSY_STONE_BRICKS: { name: 'minecraft:mossy_stone_bricks' },
  CRACKED_STONE_BRICKS: { name: 'minecraft:cracked_stone_bricks' },
  CHISELED_STONE_BRICKS: { name: 'minecraft:chiseled_stone_bricks' },
  STONE_BRICK_STAIRS: { name: 'minecraft:stone_brick_stairs' },
  STONE_BRICK_WALL: { name: 'minecraft:stone_brick_wall' },
  STONE_BRICK_SLAB: { name: 'minecraft:stone_brick_slab', props: { type: 'bottom' } },
  POLISHED_ANDESITE: { name: 'minecraft:polished_andesite' },
  ANDESITE: { name: 'minecraft:andesite' },
  COBBLESTONE: { name: 'minecraft:cobblestone' },
  MOSSY_COBBLESTONE: { name: 'minecraft:mossy_cobblestone' },
  GRAVEL: { name: 'minecraft:gravel' },
  TUFF: { name: 'minecraft:tuff' },
  TUFF_BRICKS: { name: 'minecraft:tuff_bricks' },
  CHISELED_TUFF: { name: 'minecraft:chiseled_tuff' },
  STONE: { name: 'minecraft:stone' },
  DEEPSLATE: { name: 'minecraft:deepslate' },
  COBBLED_DEEPSLATE: { name: 'minecraft:cobbled_deepslate' },
  DRIPSTONE_BLOCK: { name: 'minecraft:dripstone_block' },
  POINTED_DRIPSTONE: { name: 'minecraft:pointed_dripstone', props: { thickness: 'tip', vertical_direction: 'down' } },

  // Earth & greenery
  GRASS_BLOCK: { name: 'minecraft:grass_block' },
  DIRT: { name: 'minecraft:dirt' },
  COARSE_DIRT: { name: 'minecraft:coarse_dirt' },
  ROOTED_DIRT: { name: 'minecraft:rooted_dirt' },
  MOSS_BLOCK: { name: 'minecraft:moss_block' },
  MOSS_CARPET: { name: 'minecraft:moss_carpet' },
  AZALEA: { name: 'minecraft:azalea' },
  FLOWERING_AZALEA: { name: 'minecraft:flowering_azalea' },
  AZALEA_LEAVES: { name: 'minecraft:azalea_leaves' },
  FLOWERING_AZALEA_LEAVES: { name: 'minecraft:flowering_azalea_leaves' },
  OAK_LEAVES: { name: 'minecraft:oak_leaves' },
  VINE: { name: 'minecraft:vine', props: { north: 'false', east: 'false', south: 'false', west: 'false' } },
  VINE_N: { name: 'minecraft:vine', props: { north: 'true', east: 'false', south: 'false', west: 'false' } },
  VINE_S: { name: 'minecraft:vine', props: { north: 'false', east: 'false', south: 'true', west: 'false' } },
  VINE_E: { name: 'minecraft:vine', props: { north: 'false', east: 'true', south: 'false', west: 'false' } },
  VINE_W: { name: 'minecraft:vine', props: { north: 'false', east: 'false', south: 'false', west: 'true' } },
  GLOW_LICHEN: { name: 'minecraft:glow_lichen', props: { north: 'false', east: 'false', south: 'false', west: 'false', up: 'true' } },
  GLOW_LICHEN_UP: { name: 'minecraft:glow_lichen', props: { north: 'true', east: 'true', south: 'true', west: 'true', up: 'true' } },
  HANGING_ROOTS: { name: 'minecraft:hanging_roots' },
  GRASS: { name: 'minecraft:short_grass' },
  FERN: { name: 'minecraft:fern' },
  OXEYE_DAISY: { name: 'minecraft:oxeye_daisy' },
  CORNFLOWER: { name: 'minecraft:cornflower' },
  POPPY: { name: 'minecraft:poppy' },
  LILAC: { name: 'minecraft:lilac' },

  // Wood
  SPRUCE_PLANKS: { name: 'minecraft:spruce_planks' },
  SPRUCE_LOG: { name: 'minecraft:spruce_log', props: { axis: 'y' } },
  SPRUCE_STAIRS: { name: 'minecraft:spruce_stairs', props: { facing: 'south', half: 'bottom', shape: 'straight' } },
  SPRUCE_SLAB: { name: 'minecraft:spruce_slab', props: { type: 'bottom' } },
  SPRUCE_FENCE: { name: 'minecraft:spruce_fence' },
  OAK_FENCE: { name: 'minecraft:oak_fence' },
  SPRUCE_TRAPDOOR: { name: 'minecraft:spruce_trapdoor', props: { facing: 'north', half: 'top', open: 'true' } },
  STRIPPED_SPRUCE_LOG: { name: 'minecraft:stripped_spruce_log', props: { axis: 'y' } },

  // Accents
  AMETHYST_BLOCK: { name: 'minecraft:amethyst_block' },
  AMETHYST_CLUSTER: { name: 'minecraft:amethyst_cluster', props: { facing: 'up' } },
  BUDDING_AMETHYST: { name: 'minecraft:budding_amethyst' },
  GOLD_BLOCK: { name: 'minecraft:gold_block' },
  GILDED_BLACKSTONE: { name: 'minecraft:gilded_blackstone' },
  BLACKSTONE: { name: 'minecraft:blackstone' },
  POLISHED_BLACKSTONE_BRICKS: { name: 'minecraft:polished_blackstone_bricks' },
  PRISMARINE: { name: 'minecraft:prismarine' },
  PRISMARINE_BRICKS: { name: 'minecraft:prismarine_bricks' },
  DARK_PRISMARINE: { name: 'minecraft:dark_prismarine' },
  SEA_LANTERN: { name: 'minecraft:sea_lantern' },

  // Lights
  LANTERN: { name: 'minecraft:lantern', props: { hanging: 'false' } },
  LANTERN_HANGING: { name: 'minecraft:lantern', props: { hanging: 'true' } },
  SOUL_LANTERN: { name: 'minecraft:soul_lantern', props: { hanging: 'false' } },
  END_ROD: { name: 'minecraft:end_rod', props: { facing: 'up' } },
  SHROOMLIGHT: { name: 'minecraft:shroomlight' },
  GLOWSTONE: { name: 'minecraft:glowstone' },
  CRYING_OBSIDIAN: { name: 'minecraft:crying_obsidian' },
  BEACON: { name: 'minecraft:beacon' },
  TORCH: { name: 'minecraft:torch' },
  CAMPFIRE: { name: 'minecraft:campfire', props: { facing: 'north', lit: 'true', signal_fire: 'false' } },
  CAMPFIRE_UNLIT: { name: 'minecraft:campfire', props: { facing: 'north', lit: 'false', signal_fire: 'false' } },

  // Water
  WATER: { name: 'minecraft:water' },
  WATER_FALLING: { name: 'minecraft:water', props: { level: '8' } },

  // Misc
  GLASS: { name: 'minecraft:glass' },
  CHAIN: { name: 'minecraft:chain', props: { axis: 'y' } },

  // Furniture / functional
  LECTERN_S: { name: 'minecraft:lectern', props: { facing: 'south', has_book: 'false' } },
  LECTERN_N: { name: 'minecraft:lectern', props: { facing: 'north', has_book: 'false' } },
  BOOKSHELF: { name: 'minecraft:bookshelf' },
  CHISELED_BOOKSHELF_S: { name: 'minecraft:chiseled_bookshelf', props: { facing: 'south' } },
  PURPLE_CARPET: { name: 'minecraft:purple_carpet' },
  CYAN_CARPET: { name: 'minecraft:cyan_carpet' },
  WHITE_CARPET: { name: 'minecraft:white_carpet' },
  FLOWER_POT: { name: 'minecraft:flower_pot' },
  POTTED_AZALEA: { name: 'minecraft:potted_azalea_bush' },
  POTTED_FERN: { name: 'minecraft:potted_fern' },
  POTTED_POPPY: { name: 'minecraft:potted_poppy' },
  POTTED_CORNFLOWER: { name: 'minecraft:potted_cornflower' },
  CHEST_S: { name: 'minecraft:chest', props: { facing: 'south', type: 'single' } },
  BARREL: { name: 'minecraft:barrel', props: { facing: 'up', open: 'false' } },
  BONE_BLOCK: { name: 'minecraft:bone_block', props: { axis: 'y' } },
  BONE_BLOCK_X: { name: 'minecraft:bone_block', props: { axis: 'x' } },
  PURPUR_PILLAR: { name: 'minecraft:purpur_pillar' },
  WHITE_CONCRETE: { name: 'minecraft:white_concrete' },
  LIGHT_GRAY_CONCRETE: { name: 'minecraft:light_gray_concrete' },

  // Signs — standing rotation: 0=south, 4=west, 8=north, 12=east
  OAK_SIGN_S: { name: 'minecraft:oak_sign', props: { rotation: '0' } },
  OAK_SIGN_N: { name: 'minecraft:oak_sign', props: { rotation: '8' } },
  OAK_SIGN_W: { name: 'minecraft:oak_sign', props: { rotation: '4' } },
  OAK_SIGN_E: { name: 'minecraft:oak_sign', props: { rotation: '12' } },
  OAK_WALL_SIGN_N: { name: 'minecraft:oak_wall_sign', props: { facing: 'north' } },
  OAK_WALL_SIGN_S: { name: 'minecraft:oak_wall_sign', props: { facing: 'south' } },
  OAK_WALL_SIGN_E: { name: 'minecraft:oak_wall_sign', props: { facing: 'east' } },
  OAK_WALL_SIGN_W: { name: 'minecraft:oak_wall_sign', props: { facing: 'west' } },
  SPRUCE_SIGN_S: { name: 'minecraft:spruce_sign', props: { rotation: '0' } },
  SPRUCE_SIGN_N: { name: 'minecraft:spruce_sign', props: { rotation: '8' } },
  SPRUCE_SIGN_E: { name: 'minecraft:spruce_sign', props: { rotation: '12' } },
  SPRUCE_SIGN_W: { name: 'minecraft:spruce_sign', props: { rotation: '4' } },
  SPRUCE_WALL_SIGN_N: { name: 'minecraft:spruce_wall_sign', props: { facing: 'north' } },
  SPRUCE_WALL_SIGN_S: { name: 'minecraft:spruce_wall_sign', props: { facing: 'south' } },
};

function stateString(block) {
  if (!block.props || Object.keys(block.props).length === 0) return block.name;
  const props = Object.keys(block.props)
    .sort()
    .map((k) => `${k}=${block.props[k]}`)
    .join(',');
  return `${block.name}[${props}]`;
}

const FACING_BYTE = { down: 0, up: 1, north: 2, south: 3, west: 4, east: 5 };
const FACING_YAW = { north: 180, south: 0, west: 90, east: 270 };

// ---- World -------------------------------------------------------------------
class World {
  constructor(sizeX, sizeY, sizeZ) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.blocks = new Int32Array(sizeX * sizeY * sizeZ);

    // Palette: index 0 must be air (default fill).
    this.palette = [BLOCKS.AIR];
    this.paletteMap = new Map([['minecraft:air', 0]]);
    this.signs = []; // { x, y, z, facing, lines[4] }
    this.entities = []; // raw entity objects
  }

  idx(x, y, z) {
    return (y * this.sizeZ + z) * this.sizeX + x;
  }

  inBounds(x, y, z) {
    return x >= 0 && x < this.sizeX && y >= 0 && y < this.sizeY && z >= 0 && z < this.sizeZ;
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return BLOCKS.AIR;
    return this.palette[this.blocks[this.idx(x, y, z)]];
  }

  name(x, y, z) {
    return this.get(x, y, z).name;
  }

  isAir(x, y, z) {
    return this.name(x, y, z) === 'minecraft:air';
  }

  set(x, y, z, block) {
    if (!this.inBounds(x, y, z)) return false;
    const key = stateString(block);
    let id = this.paletteMap.get(key);
    if (id === undefined) {
      id = this.palette.length;
      this.palette.push(block);
      this.paletteMap.set(key, id);
    }
    this.blocks[this.idx(x, y, z)] = id;
    return true;
  }

  setIfAir(x, y, z, block) {
    if (this.isAir(x, y, z)) return this.set(x, y, z, block);
    return false;
  }

  fill(x1, y1, z1, x2, y2, z2, block) {
    const ax = Math.min(x1, x2), bx = Math.max(x1, x2);
    const ay = Math.min(y1, y2), by = Math.max(y1, y2);
    const az = Math.min(z1, z2), bz = Math.max(z1, z2);
    for (let y = ay; y <= by; y++)
      for (let z = az; z <= bz; z++)
        for (let x = ax; x <= bx; x++) this.set(x, y, z, block);
  }

  walls(x1, y1, z1, x2, y2, z2, block) {
    const ax = Math.min(x1, x2), bx = Math.max(x1, x2);
    const ay = Math.min(y1, y2), by = Math.max(y1, y2);
    const az = Math.min(z1, z2), bz = Math.max(z1, z2);
    for (let y = ay; y <= by; y++)
      for (let z = az; z <= bz; z++)
        for (let x = ax; x <= bx; x++) {
          if (x === ax || x === bx || z === az || z === bz) this.set(x, y, z, block);
        }
  }

  box(x1, y1, z1, x2, y2, z2, block) {
    this.walls(x1, y1, z1, x2, y2, z2, block);
    this.fill(x1, y2, z1, x2, y2, z2, block); // roof
    this.fill(x1, y1, z1, x2, y1, z2, block); // floor
  }

  nonAirCount() {
    let n = 0;
    for (let i = 0; i < this.blocks.length; i++) if (this.blocks[i] !== 0) n++;
    return n;
  }

  paletteSize() {
    return this.palette.length;
  }

  // ---- Signs -----------------------------------------------------------------
  // facing: direction the sign's FRONT text faces: 'N'|'S'|'E'|'W'
  addSign(x, y, z, facing, lines) {
    this.signs.push({ x, y, z, facing, lines: lines.slice(0, 4).map((s) => s || '') });
    return this;
  }

  // ---- Item frames (entities) --------------------------------------------------
  // Frame sits in the air block at (x,y,z); wallFace = direction of its visible
  // face ('N','S','E','W' on walls, 'U' flat facing up). The supporting block is
  // the neighbour on the opposite side.
  addItemFrame(x, y, z, wallFace, itemId) {
    const f = { N: 'north', S: 'south', E: 'east', W: 'west', U: 'up' }[wallFace];
    this.entities.push({
      id: 'minecraft:item_frame',
      x: x + 0.5, y, z: z + 0.5,
      facing: FACING_BYTE[f],
      yaw: FACING_YAW[f] || 0,
      item: itemId,
    });
    return this;
  }

  addGlowItemFrame(x, y, z, wallFace, itemId) {
    const f = { N: 'north', S: 'south', E: 'east', W: 'west', U: 'up' }[wallFace];
    this.entities.push({
      id: 'minecraft:glow_item_frame',
      x: x + 0.5, y, z: z + 0.5,
      facing: FACING_BYTE[f],
      yaw: FACING_YAW[f] || 0,
      item: itemId,
    });
    return this;
  }

  // ---- Sponge v2 schematic export ---------------------------------------------
  // Root: Version=2, DataVersion, Width/Height/Length (ushort), Offset int[3],
  // Palette (string->int), PaletteMax, BlockData (varint byte array),
  // BlockEntities (Id, Pos int[3], tile data merged), Entities, Metadata.
  toSchematicBuffer(meta) {
    const stripUndefined = (obj) => {
      if (Array.isArray(obj)) { obj.forEach(stripUndefined); return obj; }
      if (obj && typeof obj === 'object' && !obj.__intArray && !obj.__byteArray && !obj.__doubleList && !obj.__floatList) {
        for (const k of Object.keys(obj)) {
          if (obj[k] === undefined) delete obj[k];
          else stripUndefined(obj[k]);
        }
      }
      return obj;
    };

    // --- block entities (signs) ---
    const blockEntities = this.signs.map((s) => {
      const facing = { N: 'north', S: 'south', E: 'east', W: 'west' }[s.facing] || 'north';
      const json = (t) => JSON.stringify({ text: t });
      return {
        Id: 'minecraft:sign',
        Pos: { __intArray: [s.x, s.y, s.z] },
        keepPacked: { __byte: 0 },
        is_waxed: { __byte: 0 },
        facing,
        front_text: {
          has_glowing_text: { __byte: 0 },
          color: 'black',
          messages: s.lines.map(json),
        },
        back_text: {
          has_glowing_text: { __byte: 0 },
          color: 'black',
          messages: ['', '', '', ''].map(json),
        },
      };
    });

    // --- entities (item frames) ---
    const entities = this.entities.map((e, i) => ({
      Id: e.id,
      Pos: { __doubleList: [e.x, e.y, e.z] },
      Motion: { __doubleList: [0, 0, 0] },
      Rotation: { __floatList: [e.yaw, 0] },
      Facing: { __byte: e.facing },
      Fixed: { __byte: 0 },
      Invulnerable: { __byte: 0 },
      Air: { __short: 300 },
      Fire: { __short: -1 },
      OnGround: { __byte: 0 },
      NoGravity: { __byte: 1 },
      PortalCooldown: 0,
      Pose: { __byte: 0 },
      UUID: { __intArray: [0x10c5d5ee + i, 0x4a3d41d4, 0x9776c1d3 + i, 0x5a31b29e] },
      Item: {
        id: e.item,
        Count: { __byte: 1 },
      },
    }));

    const paletteObj = {};
    this.palette.forEach((b, i) => { paletteObj[stateString(b)] = i; });

    const root = {
      Version: 2,
      DataVersion: meta.dataVersion || 3953,
      Width: { __short: this.sizeX },
      Height: { __short: this.sizeY },
      Length: { __short: this.sizeZ },
      Offset: { __intArray: [0, 0, 0] },
      Palette: paletteObj,
      PaletteMax: this.palette.length,
      BlockData: { __byteArray: encodeVarIntArray(this.blocks) },
      BlockEntities: blockEntities,
      Entities: entities,
      Metadata: {
        Name: meta.name,
        Author: meta.author || 'LostSkyBuilder',
        Date: BigInt(Date.now()),
        WEOffsetX: meta.weOffset ? meta.weOffset[0] : 0,
        WEOffsetY: meta.weOffset ? meta.weOffset[1] : 0,
        WEOffsetZ: meta.weOffset ? meta.weOffset[2] : 0,
      },
    };
    stripUndefined(root);

    const uncompressed = writeNbt('', root);
    return gzipSync(uncompressed);
  }

  saveSchematic(file, meta) {
    const fs = require('fs');
    fs.writeFileSync(file, this.toSchematicBuffer(meta));
    return file;
  }
}

// Sponge v2 encodes non-negative palette indices as plain unsigned LEB128,
// matching WorldEdit's WriterUtil.writeVarInt and VarIntIterator.
function encodeVarIntArray(indices) {
  const out = new Uint8Array(indices.length * 3);
  let o = 0;
  for (let i = 0; i < indices.length; i++) {
    let u = indices[i] >>> 0;
    while (true) {
      if ((u & ~0x7f) === 0) {
        out[o++] = u;
        break;
      }
      out[o++] = (u & 0x7f) | 0x80;
      u >>>= 7;
    }
  }
  return out.slice(0, o);
}

module.exports = { World, BLOCKS, stateString, encodeVarIntArray, FACING_BYTE };
