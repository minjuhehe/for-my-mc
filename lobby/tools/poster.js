'use strict';
// Combine everything into ONE poster image: preview/LOST_SKY_POSTER.png
// Layout: title band, 5 isometric renders (2 rows), 5 top-down maps, badges.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { writePng } = require('./render');

// --- PNG loader (accepts filter 0 rows only, which is what writePng emits) ----
function loadPng(file) {
  const buf = fs.readFileSync(file);
  let o = 8, w = 0, h = 0;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.slice(o + 4, o + 8).toString('ascii');
    const data = buf.slice(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); }
    if (type === 'IDAT') idat.push(data);
    o += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const rgba = Buffer.alloc(w * h * 4);
  const stride = w * 4 + 1;
  for (let y = 0; y < h; y++) raw.copy(rgba, y * w * 4, y * stride + 1, (y + 1) * stride);
  return { w, h, rgba };
}

// --- tiny 5x7 bitmap font (only the glyphs the poster needs) -------------------
const FONT = {
  A: ['\\.XX./X..X/X..X/XXXXX/X..X/X..X/X..X'.replace(/\\/g, '.'), '', '', '', '', '', ''],
};
// written explicitly to avoid escape confusion:
const G = {
  A: ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  C: ['.XXXX', 'X....', 'X....', 'X....', 'X....', 'X....', '.XXXX'],
  D: ['XXXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'XXXX.'],
  E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  H: ['X...X', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  I: ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', 'XXXXX'],
  K: ['X...X', 'X..X.', 'X.X..', 'XX...', 'X.X..', 'X..X.', 'X...X'],
  L: ['X....', 'X....', 'X....', 'X....', 'X....', 'X....', 'XXXXX'],
  O: ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  P: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X....', 'X....', 'X....'],
  S: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  T: ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', '..X..'],
  U: ['X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  Y: ['X...X', 'X...X', '.X.X.', '..X..', '..X..', '..X..', '..X..'],
  Z: ['XXXXX', '....X', '...X.', '..X..', '.X...', 'X....', 'XXXXX'],
  '1': ['..X..', '.XX..', '..X..', '..X..', '..X..', '..X..', '.XXX.'],
  '2': ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.X...', 'XXXXX'],
  '3': ['.XXX.', 'X...X', '....X', '..XX.', '....X', 'X...X', '.XXX.'],
  '4': ['...X.', '..XX.', '.X.X.', 'X..X.', 'XXXXX', '...X.', '...X.'],
  '5': ['XXXXX', 'X....', 'X....', 'XXXX.', '....X', 'X...X', '.XXX.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

// --- canvas ops -----------------------------------------------------------------
function makeCanvas(w, h, top, bot) {
  const img = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1);
    const r = top[0] + (bot[0] - top[0]) * t;
    const g = top[1] + (bot[1] - top[1]) * t;
    const b = top[2] + (bot[2] - top[2]) * t;
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      img[o] = r; img[o + 1] = g; img[o + 2] = b; img[o + 3] = 255;
    }
  }
  return { w, h, img };
}
function blit(dst, src, dx, dy) {
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const px = dx + x, py = dy + y;
      if (px < 0 || px >= dst.w || py < 0 || py >= dst.h) continue;
      const so = (y * src.w + x) * 4, o = (py * dst.w + px) * 4;
      dst.img[o] = src.rgba[so]; dst.img[o + 1] = src.rgba[so + 1];
      dst.img[o + 2] = src.rgba[so + 2]; dst.img[o + 3] = 255;
    }
  }
}
function blitScaled(dst, src, dx, dy, scale) {
  const sw = Math.round(src.w * scale), sh = Math.round(src.h * scale);
  for (let y = 0; y < sh; y++) {
    const sy = Math.min(src.h - 1, Math.floor(y / scale));
    for (let x = 0; x < sw; x++) {
      const sx = Math.min(src.w - 1, Math.floor(x / scale));
      const px = dx + x, py = dy + y;
      if (px < 0 || px >= dst.w || py < 0 || py >= dst.h) continue;
      const so = (sy * src.w + sx) * 4, o = (py * dst.w + px) * 4;
      dst.img[o] = src.rgba[so]; dst.img[o + 1] = src.rgba[so + 1];
      dst.img[o + 2] = src.rgba[so + 2]; dst.img[o + 3] = 255;
    }
  }
  return { w: sw, h: sh };
}
function drawText(dst, text, dx, dy, scale, color) {
  let cx = dx;
  for (const ch of text) {
    const g = G[ch] || G[' '];
    for (let gy = 0; gy < 7; gy++) {
      for (let gx = 0; gx < 5; gx++) {
        if (g[gy][gx] !== 'X') continue;
        for (let yy = 0; yy < scale; yy++) {
          for (let xx = 0; xx < scale; xx++) {
            const px = cx + gx * scale + xx, py = dy + gy * scale + yy;
            if (px < 0 || px >= dst.w || py < 0 || py >= dst.h) continue;
            const o = (py * dst.w + px) * 4;
            dst.img[o] = color[0]; dst.img[o + 1] = color[1]; dst.img[o + 2] = color[2];
          }
        }
      }
    }
    cx += 6 * scale;
  }
  return cx - dx;
}
function drawBadge(dst, text, cx, cy, scale) {
  const tw = text.length * 6 * scale - scale;
  const th = 7 * scale;
  const pad = 3 * scale;
  const x0 = Math.round(cx - tw / 2 - pad), y0 = Math.round(cy - th / 2 - pad);
  for (let y = y0; y < y0 + th + 2 * pad; y++) {
    for (let x = x0; x < x0 + tw + 2 * pad; x++) {
      if (x < 0 || x >= dst.w || y < 0 || y >= dst.h) continue;
      const o = (y * dst.w + x) * 4;
      dst.img[o] = 21; dst.img[o + 1] = 26; dst.img[o + 2] = 46; // dark navy
    }
  }
  drawText(dst, text, x0 + pad, y0 + pad, scale, [233, 226, 255]);
}

// --- poster ------------------------------------------------------------------------
function main() {
  const pv = path.join(__dirname, '..', 'preview');
  const W = 1660;
  const skyTop = [96, 148, 224], skyBot = [205, 228, 250];

  // measure rows first with fixed scales
  const isoScale = 520 / 772;      // ~0.67
  const mapScale = 2;

  // rough height budget
  const titleH = 118;
  const isoH1 = Math.round(468 * isoScale);   // tallest of row 1 (ch1)
  const isoH2 = Math.round(496 * isoScale);   // tallest of row 2 (ch4)
  const mapH = 121 * mapScale;
  const H = titleH + isoH1 + 26 + isoH2 + 34 + mapH + 44 + 30;

  const c = makeCanvas(W, H, skyTop, skyBot);

  // Title
  const title = 'LOST SKY';
  const tScale = 9;
  const tWidth = title.length * 6 * tScale - tScale;
  drawText(c, title, Math.round((W - tWidth) / 2), 20, tScale, [32, 24, 60]);
  const sub = 'THE SKY CITADEL PLAZA';
  const sScale = 4;
  const sWidth = sub.length * 6 * sScale - sScale;
  drawText(c, sub, Math.round((W - sWidth) / 2), 20 + 7 * tScale + 10, sScale, [96, 74, 150]);

  // Row 1: ch1..ch3
  const row1Y = titleH + 10;
  const cells1 = ['iso_ch1.png', 'iso_ch2.png', 'iso_ch3.png'];
  const gap = 30;
  const cellW = 520;
  const row1W = 3 * cellW + 2 * gap;
  let x = Math.round((W - row1W) / 2);
  const bottoms = [];
  for (const f of cells1) {
    const img = loadPng(path.join(pv, f));
    const sz = blitScaled(c, img, x, row1Y + (isoH1 - Math.round(img.h * isoScale)), isoScale);
    bottoms.push({ x, w: sz.w, y: row1Y + sz.h, label: f.match(/ch(\d)/)[1] });
    x += cellW + gap;
  }
  for (const b of bottoms) drawBadge(c, 'CH' + b.label, b.x + b.w / 2, b.y + 18, 3);

  // Row 2: ch4..ch5 (centred)
  const row2Y = row1Y + isoH1 + 26;
  const cells2 = ['iso_ch4.png', 'iso_ch5.png'];
  const row2W = 2 * cellW + gap;
  x = Math.round((W - row2W) / 2);
  const bottoms2 = [];
  for (const f of cells2) {
    const img = loadPng(path.join(pv, f));
    const sz = blitScaled(c, img, x, row2Y + (isoH2 - Math.round(img.h * isoScale)), isoScale);
    bottoms2.push({ x, w: sz.w, y: row2Y + sz.h, label: f.match(/ch(\d)/)[1] });
    x += cellW + gap;
  }
  for (const b of bottoms2) drawBadge(c, 'CH' + b.label, b.x + b.w / 2, b.y + 18, 3);

  // Row 3: top-down maps
  const row3Y = row2Y + isoH2 + 34;
  const mapW = 121 * mapScale;
  const row3W = 5 * mapW + 4 * 40;
  x = Math.round((W - row3W) / 2);
  const mapLabels = [];
  for (let ch = 1; ch <= 5; ch++) {
    const img = loadPng(path.join(pv, `top_ch${ch}.png`));
    blitScaled(c, img, x, row3Y, mapScale);
    mapLabels.push({ cx: x + mapW / 2, y: row3Y + mapH + 22 });
    x += mapW + 40;
  }
  mapLabels.forEach((m, i) => drawBadge(c, 'CH' + (i + 1), m.cx, m.y, 2));

  const out = path.join(pv, 'LOST_SKY_POSTER.png');
  writePng(out, c.w, c.h, c.img);
  console.log(`poster -> ${out} (${c.w}x${c.h}, ${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
}

main();
