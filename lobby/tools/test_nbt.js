'use strict';
// Smoke test: build a tiny world, export a schematic, parse the NBT back and
// verify structure (v2 layout, palette, varint data, sign + entity fields).

const { World, BLOCKS, encodeVarIntArray } = require('./world');
const zlib = require('zlib');

// --- mini NBT reader (validation only) ---------------------------------------
function parseNbt(buf) {
  let o = 0;
  const type = buf[o++];
  const name = readStr();
  const value = readPayload(type);
  return { name, value };

  function readStr() {
    const len = buf.readUInt16BE(o); o += 2;
    const s = buf.slice(o, o + len).toString('utf8'); o += len;
    return s;
  }
  function readPayload(t) {
    switch (t) {
      case 1: return buf.readInt8(o++);
      case 2: { const v = buf.readInt16BE(o); o += 2; return v; }
      case 3: { const v = buf.readInt32BE(o); o += 4; return v; }
      case 4: { const v = buf.readBigInt64BE(o); o += 8; return v; }
      case 5: { const v = buf.readFloatBE(o); o += 4; return v; }
      case 6: { const v = buf.readDoubleBE(o); o += 8; return v; }
      case 7: {
        const len = buf.readInt32BE(o); o += 4;
        const a = Array.from(buf.slice(o, o + len)); o += len;
        return { __byteArray: a };
      }
      case 8: return readStr();
      case 9: {
        const et = buf[o++];
        const len = buf.readInt32BE(o); o += 4;
        const items = [];
        for (let i = 0; i < len; i++) items.push(readPayload(et));
        return { __list: items, elemType: et };
      }
      case 10: {
        const obj = {};
        while (true) {
          const ct = buf[o++];
          if (ct === 0) break;
          const cn = readStr();
          obj[cn] = readPayload(ct);
        }
        return obj;
      }
      case 11: {
        const len = buf.readInt32BE(o); o += 4;
        const a = [];
        for (let i = 0; i < len; i++) { a.push(buf.readInt32BE(o)); o += 4; }
        return { __intArray: a };
      }
      default: throw new Error('read: unknown tag ' + t + ' at ' + (o - 1));
    }
  }
}

// --- helpers -------------------------------------------------------------------
function decodeVarints(bytes, count) {
  const out = [];
  let o = 0;
  for (let i = 0; i < count; i++) {
    let shift = 0, result = 0, b;
    do {
      b = bytes[o++];
      result |= (b & 0x7f) << shift;
      shift += 7;
    } while (b & 0x80);
    out.push(result >>> 0);
  }
  return out;
}

function run() {
  // Tiny 4x3x4 world: stone floor, a sign, an item frame, quartz block.
  const w = new World(4, 3, 4);
  w.fill(0, 0, 0, 3, 0, 3, BLOCKS.STONE);
  w.set(1, 1, 1, BLOCKS.SMOOTH_QUARTZ);
  w.addSign(2, 1, 2, 'N', ['Lost Sky', 'line2', '', '']);
  w.addItemFrame(0, 1, 0, 'S', 'minecraft:amethyst_shard');

  const buf = w.toSchematicBuffer({ name: 'smoke' });
  const root = parseNbt(zlib.gunzipSync(buf)).value;

  const checks = [];
  const ok = (cond, msg) => checks.push({ pass: !!cond, msg });
  const assertEq = (a, b, msg) => ok(a === b, `${msg} (${a} vs ${b})`);

  assertEq(root.Version, 2, 'Version=2');
  assertEq(root.DataVersion, 3953, 'DataVersion=3953');
  assertEq(root.Width, 4, 'Width');
  assertEq(root.Height, 3, 'Height');
  assertEq(root.Length, 4, 'Length');
  assertEq(root.PaletteMax, root.Palette && Object.keys(root.Palette).length, 'PaletteMax matches palette size');
  ok(root.Palette['minecraft:air'] === 0, 'air at index 0');
  ok(typeof root.Palette['minecraft:smooth_quartz'] === 'number', 'quartz in palette');
  ok(root.Palette['minecraft:stone'] !== undefined, 'stone in palette');
  ok(Array.isArray(root.BlockData.__byteArray), 'BlockData is byte array');
  assertEq(root.BlockData.__byteArray.length, 48, '48 blocks serialized');
  assertEq(
    Array.from(encodeVarIntArray(Uint32Array.from([0, 1, 127, 128, 255, 300]))).join(','),
    '0,1,127,128,1,255,1,172,2',
    'plain unsigned LEB128 matches WorldEdit canonical bytes'
  );
  const decoded = decodeVarints(root.BlockData.__byteArray, 48);
  assertEq(decoded.length, 48, '48 varints decoded');
  // index = (y*4 + z)*4 + x -> block at (1,1,1) = (1*4+1)*4+1 = 21
  assertEq(decoded[21], root.Palette['minecraft:smooth_quartz'], 'quartz at index 21');
  assertEq(decoded[0], root.Palette['minecraft:stone'], 'stone at index 0');

  ok(Array.isArray(root.BlockEntities.__list), 'BlockEntities is a list');
  const sign = root.BlockEntities.__list[0];
  ok(sign.Id === 'minecraft:sign', 'sign Id');
  assertEq(sign.Pos.__intArray.join(','), '2,1,2', 'sign pos');
  ok(JSON.parse(sign.front_text.messages.__list[0]).text === 'Lost Sky', 'sign line 1 text');
  ok(sign.front_text.messages.__list.every((m) => typeof m === 'string'), 'sign messages are JSON strings');

  ok(Array.isArray(root.Entities.__list), 'Entities is a list');
  const frame = root.Entities.__list[0];
  ok(frame.Id === 'minecraft:item_frame', 'frame Id');
  ok(Array.isArray(frame.Pos.__list) ? frame.Pos.__list.length === 3 : (frame.Pos.elemType === 6 && frame.Pos.__list.length === 3), 'frame Pos 3 doubles');
  ok(frame.Rotation.__list.length === 2, 'frame Rotation 2 floats');
  ok(frame.Item.id === 'minecraft:amethyst_shard', 'frame item id');
  ok(frame.NoGravity === 1, 'NoGravity set');

  const fails = checks.filter((c) => !c.pass);
  for (const c of checks) console.log((c.pass ? '  ok  ' : 'FAIL  ') + c.msg);
  console.log(fails.length === 0 ? 'SMOKE TEST PASSED' : `${fails.length} FAILURES`);
  return fails.length === 0;
}

if (require.main === module) process.exit(run() ? 0 : 1);
module.exports = { run, parseNbt, decodeVarints };
