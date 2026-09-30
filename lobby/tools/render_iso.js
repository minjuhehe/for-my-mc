'use strict';
// Isometric cube render of a lobby schematic -> PNG picture.
// Usage: node tools/render_iso.js [chapter]  (renders ch1 + ch5 by default)

const fs = require('fs');
const path = require('path');
const { loadSchematic, writePng, colorFor } = require('./render');

const HW = 4;          // half-width of a cube in px
const HH = 2;          // half-height of the top diamond
const VH = 4;          // vertical pixel height of a block side

// Painter order: draw back-to-front, bottom-to-top.
// Key = (x + z) primary, y secondary.
function renderIso(schem, file, opts) {
  const { W, H, Lg, blocks, idxToState } = schem;
  const at = (x, y, z) => blocks[(y * Lg + z) * W + x];
  const solid = (x, y, z) =>
    x >= 0 && x < W && y >= 0 && y < H && z >= 0 && z < Lg && at(x, y, z) !== 0;

  // Collect visible cubes (at least one exposed face).
  const visible = [];
  for (let y = 0; y < H; y++) {
    for (let z = 0; z < Lg; z++) {
      for (let x = 0; x < W; x++) {
        const id = at(x, y, z);
        if (id === 0) continue;
        if (
          solid(x + 1, y, z) && solid(x - 1, y, z) &&
          solid(x, y, z + 1) && solid(x, y, z - 1) &&
          solid(x, y + 1, z) && solid(x, y - 1, z)
        ) continue; // fully buried
        visible.push({ x, y, z, id, key: (x + z) * 1000 + y });
      }
    }
  }
  visible.sort((a, b) => a.key - b.key);

  const cx0 = (W - 1) / 2, cz0 = (Lg - 1) / 2; // centre the island
  const project = (x, y, z) => ({
    cx: (x - z) * HW,
    cy: (x + z - (cx0 + cz0)) * HH - y * VH,
  });

  // Pass 1: fit the frame to the actual projected content.
  const pad = 24;
  let minSx = Infinity, maxSx = -Infinity, minSy = Infinity, maxSy = -Infinity;
  for (const v of visible) {
    const p = project(v.x, v.y, v.z);
    if (p.cx < minSx) minSx = p.cx;
    if (p.cx > maxSx) maxSx = p.cx;
    if (p.cy < minSy) minSy = p.cy;
    if (p.cy > maxSy) maxSy = p.cy;
  }
  minSx -= pad; maxSx += pad; minSy -= pad; maxSy += pad;
  const width = Math.ceil(maxSx - minSx);
  const height = Math.ceil(maxSy - minSy);

  // RGBA buffer + sky gradient.
  const img = new Uint8ClampedArray(width * height * 4);
  const skyTop = [96, 148, 224], skyBot = [205, 228, 250];
  for (let y = 0; y < height; y++) {
    const t = y / (height - 1);
    const r = skyTop[0] + (skyBot[0] - skyTop[0]) * t;
    const g = skyTop[1] + (skyBot[1] - skyTop[1]) * t;
    const b = skyTop[2] + (skyBot[2] - skyTop[2]) * t;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      img[o] = r; img[o + 1] = g; img[o + 2] = b; img[o + 3] = 255;
    }
  }

  const ox = -minSx, oy = -minSy;
  const scr = (x, y, z) => {
    const p = project(x, y, z);
    return { cx: ox + p.cx, cy: oy + p.cy };
  };

  // Parallelogram fill: origin o, edge vectors a, b, 0<=u,v<1.
  const det = (a, b) => a[0] * b[1] - a[1] * b[0];
  function quad(o, a, b, rgb) {
    const d = det(a, b);
    if (Math.abs(d) < 1e-9) return;
    const x0 = Math.floor(Math.min(o[0], o[0] + a[0], o[0] + b[0], o[0] + a[0] + b[0]));
    const x1 = Math.ceil(Math.max(o[0], o[0] + a[0], o[0] + b[0], o[0] + a[0] + b[0]));
    const y0 = Math.floor(Math.min(o[1], o[1] + a[1], o[1] + b[1], o[1] + a[1] + b[1]));
    const y1 = Math.ceil(Math.max(o[1], o[1] + a[1], o[1] + b[1], o[1] + a[1] + b[1]));
    for (let py = y0; py <= y1; py++) {
      if (py < 0 || py >= height) continue;
      for (let px = x0; px <= x1; px++) {
        if (px < 0 || px >= width) continue;
        const dx = px - o[0], dy = py - o[1];
        const u = (dx * b[1] - dy * b[0]) / d;
        const v = (dy * a[0] - dx * a[1]) / d;
        if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
        const o2 = (py * width + px) * 4;
        img[o2] = rgb[0]; img[o2 + 1] = rgb[1]; img[o2 + 2] = rgb[2]; img[o2 + 3] = 255;
      }
    }
  }

  const shade = (c, m) => [
    Math.min(255, Math.round(c[0] * m)),
    Math.min(255, Math.round(c[1] * m)),
    Math.min(255, Math.round(c[2] * m)),
  ];

  let drawn = 0;
  for (const v of visible) {
    const base = colorFor(idxToState[v.id]);
    if (base[0] === 255 && base[1] === 0 && base[2] === 255) continue; // never draw "unknown"
    const { cx, cy } = scr(v.x, v.y, v.z);
    // Cube anchor: centre of the top diamond.
    const N = [cx, cy - HH], E = [cx + HW, cy], S = [cx, cy + HH], Wp = [cx - HW, cy];
    // top face (brightest)
    quad(N, [E[0] - N[0], E[1] - N[1]], [Wp[0] - N[0], Wp[1] - N[1]], shade(base, 1.0));
    // left face (SW side, medium)
    quad(Wp, [S[0] - Wp[0], S[1] - Wp[1]], [0, VH], shade(base, 0.78));
    // right face (SE side, darkest)
    quad(S, [E[0] - S[0], E[1] - S[1]], [0, VH], shade(base, 0.58));
    drawn++;
  }

  const buf = Buffer.from(img.buffer);
  writePng(file, width, height, buf);
  return { drawn, width, height };
}

function main() {
  const schemDir = path.join(__dirname, '..', 'schematics');
  const outDir = path.join(__dirname, '..', 'preview');
  fs.mkdirSync(outDir, { recursive: true });

  const chapters = process.argv[2]
    ? [Number(process.argv[2])]
    : [1, 5];
  for (const ch of chapters) {
    const s = loadSchematic(path.join(schemDir, `lobby_ch${ch}.schem`));
    const t0 = Date.now();
    const r = renderIso(s, path.join(outDir, `iso_ch${ch}.png`));
    console.log(
      `ch${ch}: isometric picture -> preview/iso_ch${ch}.png ` +
      `(${r.width}x${r.height}, ${r.drawn} cubes, ${Date.now() - t0} ms)`
    );
  }
}

if (require.main === module) main();
module.exports = { renderIso };
