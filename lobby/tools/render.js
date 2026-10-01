'use strict';
// Renderer: load .schem -> PNG previews (no dependencies; PNG via zlib).
// Outputs into preview/: top_ch[n].png, cross_ch[n].png.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { parseNbt, decodeVarints } = require('./test_nbt');

// ---- tiny PNG writer ---------------------------------------------------------
// PNG: signature + IHDR + IDAT (deflate(filtered scanlines)) + IEND, CRC32'd.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function writePng(file, width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  // filter each scanline with filter type 0
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
}

// ---- palette ------------------------------------------------------------------
// name -> [r, g, b]; derived names fall back to base name.
const COLORS = {
  'air': null,
  'grass_block': [98, 158, 68],
  'dirt': [134, 96, 67],
  'coarse_dirt': [119, 85, 59],
  'rooted_dirt': [144, 104, 76],
  'moss_block': [90, 128, 51],
  'moss_carpet': [104, 146, 60],
  'stone': [125, 125, 125],
  'stone_bricks': [122, 122, 122],
  'mossy_stone_bricks': [110, 122, 95],
  'cracked_stone_bricks': [112, 110, 108],
  'chiseled_stone_bricks': [130, 130, 130],
  'stone_brick_stairs': [126, 126, 126],
  'stone_brick_slab': [128, 128, 128],
  'stone_brick_wall': [120, 120, 120],
  'cobblestone': [140, 140, 140],
  'mossy_cobblestone': [118, 130, 104],
  'cobbled_deepslate': [88, 88, 90],
  'deepslate': [80, 80, 83],
  'tuff': [108, 110, 100],
  'tuff_bricks': [116, 118, 108],
  'chiseled_tuff': [112, 114, 104],
  'dripstone_block': [134, 111, 91],
  'pointed_dripstone': [148, 122, 100],
  'andesite': [136, 136, 136],
  'polished_andesite': [150, 150, 150],
  'calcite': [223, 224, 220],
  'smooth_quartz': [235, 231, 224],
  'quartz_pillar': [238, 234, 226],
  'chiseled_quartz_block': [232, 228, 220],
  'gravel': [131, 127, 126],
  'amethyst_block': [133, 91, 214],
  'budding_amethyst': [146, 105, 224],
  'amethyst_cluster': [170, 130, 240],
  'gold_block': [246, 208, 61],
  'gilded_blackstone': [70, 55, 55],
  'blackstone': [58, 52, 56],
  'polished_blackstone_bricks': [64, 58, 62],
  'prismarine': [99, 155, 148],
  'prismarine_bricks': [108, 166, 158],
  'dark_prismarine': [48, 85, 76],
  'sea_lantern': [172, 199, 190],
  'lantern': [255, 190, 90],
  'soul_lantern': [110, 210, 220],
  'end_rod': [240, 240, 230],
  'shroomlight': [252, 148, 60],
  'glowstone': [255, 216, 130],
  'crying_obsidian': [60, 40, 110],
  'beacon': [150, 230, 240],
  'water': [60, 110, 220],
  'short_grass': [96, 148, 64],
  'fern': [88, 140, 60],
  'oxeye_daisy': [230, 230, 225],
  'cornflower': [90, 110, 220],
  'poppy': [220, 60, 60],
  'lilac': [190, 150, 210],
  'azalea': [100, 140, 60],
  'flowering_azalea': [180, 120, 190],
  'azalea_leaves': [92, 130, 56],
  'flowering_azalea_leaves': [140, 130, 90],
  'oak_leaves': [90, 130, 55],
  'vine': [70, 110, 50],
  'glow_lichen': [110, 160, 150],
  'hanging_roots': [150, 122, 90],
  'spruce_planks': [114, 84, 48],
  'spruce_log': [58, 38, 20],
  'stripped_spruce_log': [118, 88, 52],
  'spruce_stairs': [116, 86, 50],
  'spruce_slab': [118, 88, 52],
  'spruce_fence': [112, 82, 46],
  'oak_fence': [160, 128, 78],
  'spruce_trapdoor': [100, 74, 42],
  'lectern': [124, 92, 52],
  'bookshelf': [150, 120, 70],
  'chiseled_bookshelf': [140, 110, 64],
  'purple_carpet': [130, 60, 160],
  'cyan_carpet': [40, 140, 150],
  'white_carpet': [235, 235, 235],
  'flower_pot': [110, 70, 45],
  'potted_azalea_bush': [110, 150, 70],
  'potted_fern': [100, 140, 60],
  'potted_poppy': [150, 70, 60],
  'potted_cornflower': [90, 110, 180],
  'chest': [162, 130, 78],
  'barrel': [124, 94, 56],
  'torch': [255, 200, 100],
  'campfire': [200, 120, 60],
  'bone_block': [220, 216, 200],
  'purpur_pillar': [170, 130, 170],
  'white_concrete': [207, 213, 214],
  'light_gray_concrete': [125, 125, 115],
  'glass': [200, 230, 240],
  'chain': [90, 90, 95],
  'oak_sign': [180, 146, 90],
  'oak_wall_sign': [176, 142, 86],
  'spruce_sign': [110, 82, 48],
  'spruce_wall_sign': [106, 78, 44],
};

// strip variant props: "minecraft:mossy_stone_bricks" / "lantern[hanging=true]"
function colorFor(stateStr) {
  let n = stateStr.replace(/^minecraft:/, '').replace(/\[.*$/, '');
  if (COLORS[n] === undefined) n = n.replace(/_(stairs|slab|wall)$/, ''); // reuse base
  const c = COLORS[n];
  return c ? c : [255, 0, 255]; // magenta = unknown, easy to spot
}

// ---- schematic loader -----------------------------------------------------------
function loadSchematic(file) {
  const raw = zlib.gunzipSync(fs.readFileSync(file));
  const root = parseNbt(raw).value;
  const { Width, Height, Length, Palette, BlockData } = root;
  const W = Width, H = Height, Lg = Length;
  const blocks = new Uint8Array(W * H * Lg);
  // palette: string->int map (object)
  const idxToState = [];
  for (const [state, id] of Object.entries(Palette)) idxToState[id] = state;
  const decoded = decodeVarints(BlockData.__byteArray, W * H * Lg);
  for (let i = 0; i < decoded.length; i++) blocks[i] = decoded[i];
  return { W, H, Lg, blocks, idxToState, root };
}

// ---- renders ----------------------------------------------------------------------
function renderTop(s, file, scale) {
  const { W, H, Lg, blocks, idxToState } = s;
  const rgba = Buffer.alloc(W * Lg * 4);
  for (let z = 0; z < Lg; z++) {
    for (let x = 0; x < W; x++) {
      // top-most non-air
      let yTop = -1, shade = 1;
      for (let y = H - 1; y >= 0; y--) {
        const id = blocks[(y * Lg + z) * W + x];
        if (id !== 0) {
          yTop = y;
          // cheap shade: look at the block north of it
          const id2 = y < H - 1 ? blocks[((y + 1) * Lg + z) * W + x] : 0;
          shade = id2 === 0 ? 1.0 : 0.82;
          break;
        }
      }
      let c;
      if (yTop < 0) {
        c = [21, 26, 46]; // sky void
      } else {
        c = colorFor(idxToState[blocks[(yTop * Lg + z) * W + x]]).map((v) => Math.min(255, Math.round(v * shade)));
      }
      const o = (z * W + x) * 4;
      rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
    }
  }
  writePng(file, W, Lg, rgba);
}

function renderCross(s, file, sliceZ) {
  const { W, H, Lg, blocks, idxToState } = s;
  const rgba = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const id = blocks[(y * Lg + sliceZ) * W + x];
      let c;
      if (id === 0) c = [21, 26, 46];
      else c = colorFor(idxToState[id]);
      const o = ((H - 1 - y) * W + x) * 4; // flip so up is up
      rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
    }
  }
  writePng(file, W, H, rgba);
}

// ---- main ---------------------------------------------------------------------------
function main() {
  const schemDir = path.join(__dirname, '..', 'schematics');
  const outDir = path.join(__dirname, '..', 'preview');
  fs.mkdirSync(outDir, { recursive: true });

  const sliceZ = 60; // through the citadel centre (north-south axis)
  for (const ch of [1, 2, 3, 4, 5]) {
    const s = loadSchematic(path.join(schemDir, `lobby_ch${ch}.schem`));
    renderTop(s, path.join(outDir, `top_ch${ch}.png`));
    renderCross(s, path.join(outDir, `cross_ch${ch}.png`), sliceZ);
    console.log(`ch${ch}: rendered top + cross (slice z=${sliceZ})`);
  }
  console.log('PNG previews written to preview/');
}

if (require.main === module) main();
module.exports = { loadSchematic, renderTop, renderCross, writePng, colorFor };
