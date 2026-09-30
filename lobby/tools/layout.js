'use strict';
// Coordinates (relative to world centre C = (60, ?, 60)):
//   C     = (60, 60)   Citadel keep centre
//   south = +Z (spawn side), north = -Z (Hall of Relics)
//   west  = -X (Ruin Dock), east = +X (Island Gate)
// Ground Y = 80 (plateau top). World size 121 x 96 x 121 (Y 16..111).
// Feet Y (where players walk) = GROUND + 1.

const SIZE_X = 121, SIZE_Y = 96, SIZE_Z = 121;
const GROUND = 80;                    // plateau top block Y
const FEET = GROUND + 1;              // player feet Y on the plateau
const RIM = 58;                       // island rim radius

const ZONES = {
  terrace:  { x1: 50, z1: 103, x2: 70, z2: 113 },  // 21 x 11, south edge (spawn)
  path:     { x1: 58, z1: 83,  x2: 62, z2: 102 },  // 5 wide, terrace -> plaza
  dock:     { x1: 3,  z1: 55,  x2: 15, z2: 65 },   // 13 x 11, west edge
  gate:     { x1: 100, z1: 53, x2: 110, z2: 67 },  // 11 x 15, east edge
  hall:     { x1: 48, z1: 26,  x2: 72, z2: 42 },  // 25 x 17, north of keep + north pillar
  citadel:  { x1: 40, z1: 40,  x2: 80, z2: 80 },   // 41 x 41 plaza zone
  keep:     { x1: 48, z1: 48,  x2: 72, z2: 72 },   // 25 x 25 keep footprint
  eastWalk: { x1: 73, z1: 58,  x2: 100, z2: 62 },  // walkway keep -> gate
};

// Spawn point: south terrace, facing north (yaw 180).
const SPAWN = { x: 60, y: FEET, z: 108, yaw: 180 };

// Donation altar: in front of the keep's south gate, on the north-south axis.
const ALTAR = { x: 60, y: FEET, z: 76 };

// Main gate of the keep (south wall opening).
const GATE = { x1: 57, x2: 63, z: 72 };

// Chapter pillars: ring around the keep, angles chosen to keep the south
// gate approach (x 57..63) clear.
const PILLARS = [
  { x: 52, z: 46 },  // north-west courtyard (clear of the north gate corridor)
  { x: 75, z: 47 },  // north-east
  { x: 75, z: 73 },  // south-east
  { x: 45, z: 47 },  // north-west
  { x: 45, z: 73 },  // south-west
];

// WEOffset so `//paste` puts the spawn point at the player's position:
// schematic min corner is (0,16,0) in world coords; spawn is at (60,81,108).
const PASTE_OFFSET = null; // computed in generate.js from SPAWN

module.exports = {
  SIZE_X, SIZE_Y, SIZE_Z, GROUND, FEET, RIM,
  ZONES, SPAWN, ALTAR, GATE, PILLARS,
};
