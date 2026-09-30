'use strict';
// Minimal NBT writer (big-endian, uncompressed at this layer).
// Only what Sponge schematics need: compound, list, string, int, byte array, int array.

const TAG = {
  END: 0,
  BYTE: 1,
  SHORT: 2,
  INT: 3,
  LONG: 4,
  FLOAT: 5,
  DOUBLE: 6,
  BYTE_ARRAY: 7,
  STRING: 8,
  LIST: 9,
  COMPOUND: 10,
  INT_ARRAY: 11,
  LONG_ARRAY: 12,
};

// Value types accepted:
//  - number               -> TAG_INT
//  - BigInt               -> TAG_LONG
//  - string               -> TAG_STRING
//  - { __byte: v }        -> TAG_BYTE
//  - { __short: v }       -> TAG_SHORT
//  - { __float: v }       -> TAG_FLOAT
//  - { __double: v }      -> TAG_DOUBLE
//  - { __byteArray }      -> TAG_BYTE_ARRAY
//  - { __intArray }       -> TAG_INT_ARRAY
//  - Array                -> TAG_LIST (homogeneous by inference)
//  - plain object         -> TAG_COMPOUND
function inferType(value) {
  if (typeof value === 'number') return TAG.INT;
  if (typeof value === 'bigint') return TAG.LONG;
  if (typeof value === 'string') return TAG.STRING;
  if (Array.isArray(value)) {
    return TAG.LIST; // element type inferred at write time; empty list -> elem type END
  }
  if (value && value.__byte !== undefined) return TAG.BYTE;
  if (value && value.__short !== undefined) return TAG.SHORT;
  if (value && value.__float !== undefined) return TAG.FLOAT;
  if (value && value.__double !== undefined) return TAG.DOUBLE;
  if (value && value.__byteArray) return TAG.BYTE_ARRAY;
  if (value && value.__intArray) return TAG.INT_ARRAY;
  if (value && value.__doubleList) return TAG.LIST;
  if (value && value.__floatList) return TAG.LIST;
  if (value && typeof value === 'object') return TAG.COMPOUND;
  throw new Error('Cannot infer NBT type for value: ' + String(value));
}

function writeString(buf, str) {
  const utf8 = Buffer.from(str, 'utf8');
  pushShort(buf, utf8.length);
  buf.push(utf8);
}

// Flatten payload into a Buffer (after tag type + name are already written by parent).
function writePayload(buf, type, value) {
  switch (type) {
    case TAG.BYTE:
      buf.push(Buffer.from([payloadValue(value) & 0xff]));
      break;
    case TAG.SHORT:
      pushShort(buf, payloadValue(value));
      break;
    case TAG.FLOAT: {
      const b = Buffer.alloc(4);
      b.writeFloatBE(payloadValue(value));
      buf.push(b);
      break;
    }
    case TAG.DOUBLE: {
      const b = Buffer.alloc(8);
      b.writeDoubleBE(payloadValue(value));
      buf.push(b);
      break;
    }
    case TAG.INT:
      pushInt(buf, value);
      break;
    case TAG.LONG: {
      const b = Buffer.alloc(8);
      b.writeBigInt64BE(BigInt(value));
      buf.push(b);
      break;
    }
    case TAG.BYTE_ARRAY: {
      const arr = value.__byteArray;
      pushInt(buf, arr.length);
      buf.push(Buffer.from(arr));
      break;
    }
    case TAG.STRING:
      writeString(buf, value);
      break;
    case TAG.LIST: {
      // Typed lists: { __doubleList: [...] } / { __floatList: [...] }
      if (value.__doubleList) {
        buf.push(Buffer.from([TAG.DOUBLE]));
        pushInt(buf, value.__doubleList.length);
        for (const d of value.__doubleList) {
          const b = Buffer.alloc(8);
          b.writeDoubleBE(d);
          buf.push(b);
        }
        break;
      }
      if (value.__floatList) {
        buf.push(Buffer.from([TAG.FLOAT]));
        pushInt(buf, value.__floatList.length);
        for (const f of value.__floatList) {
          const b = Buffer.alloc(4);
          b.writeFloatBE(f);
          buf.push(b);
        }
        break;
      }
      const elemType = value.length ? inferType(value[0]) : TAG.END;
      buf.push(Buffer.from([elemType]));
      pushInt(buf, value.length);
      for (const item of value) writePayload(buf, elemType, item);
      break;
    }
    case TAG.COMPOUND: {
      for (const [name, val] of Object.entries(value)) {
        const t = inferType(val);
        buf.push(Buffer.from([t]));
        writeString(buf, name);
        writePayload(buf, t, val);
      }
      buf.push(Buffer.from([TAG.END]));
      break;
    }
    case TAG.INT_ARRAY: {
      const arr = value.__intArray;
      pushInt(buf, arr.length);
      for (const n of arr) pushInt(buf, n);
      break;
    }
    case TAG.LONG_ARRAY:
      throw new Error('LONG_ARRAY not needed for schematics');
    default:
      throw new Error('Unsupported NBT type ' + type);
  }
}

function payloadValue(value) {
  if (value && typeof value === 'object') {
    if (value.__byte !== undefined) return value.__byte;
    if (value.__short !== undefined) return value.__short;
    if (value.__float !== undefined) return value.__float;
    if (value.__double !== undefined) return value.__double;
  }
  return value;
}

function pushShort(buf, v) {
  const b = Buffer.alloc(2);
  b.writeInt16BE(v | 0);
  buf.push(b);
}

function pushInt(buf, v) {
  const b = Buffer.alloc(4);
  b.writeInt32BE(v | 0);
  buf.push(b);
}

// Write a full NBT file: TAG_COMPOUND root with the given name ("" allowed).
function writeNbt(rootName, rootValue) {
  const buf = [];
  buf.push(Buffer.from([TAG.COMPOUND]));
  writeString(buf, rootName);
  writePayload(buf, TAG.COMPOUND, rootValue);
  return Buffer.concat(buf);
}

module.exports = { TAG, writeNbt, inferType };
