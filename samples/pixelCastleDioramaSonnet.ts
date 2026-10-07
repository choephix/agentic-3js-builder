// Castle on a Hill: a pixel-art diorama. A walled keep stands on a stepped hill ringed by a moat; a drawbridge and a
// cobbled road run down to a village with a canal, watermill, tavern, church and windmill. Every surface is a hard
// square texel (kits/pixel): 2.5 cm cells on terrain, 1.25 cm cells on walls, roofs and small props.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { noise } from "../src/paint";
import type { Paint } from "../src/paint";
import { cellPaint, pixelArt, snapColor, stepped } from "../kits/pixel";
import type { Cell } from "../kits/pixel";
import { glow } from "../kits/glow";

export const meta = {
  name: "Castle on the Hill",
  description:
    "Pixel-art diorama: a walled castle with keep, towers and gatehouse on a stepped hill with a moat and working drawbridge, a cobbled road down to a village with canal, watermill, tavern, church and windmill.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (15-bit colour steps) and small helpers

const snap = (c: string) => snapColor(c, 32);
const ramp = (...cs: string[]) => cs.map(snap);
const mod = (a: number, n: number) => ((a % n) + n) % n;
const hash = (a: number, b: number, s = 0) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(s + 1, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const GRASS = ramp("#2d5f2c", "#3c7d31", "#4f9b39", "#6cba46", "#94d25c");
const SOIL = ramp("#2e1c12", "#4a2e1c", "#66402a", "#835637", "#a06f48");
const AUTUMN = ramp("#7a2a14", "#a84a1c", "#d07a24", "#e8a838", "#f4cc58");
const ROCK = ramp("#4a4440", "#686058", "#887c6c", "#a89a84", "#c8baa0");
const STONE = ramp("#4c5470", "#68728f", "#8792b0", "#a6b2cc", "#c6d2e6");
const MORTAR = snap("#343848");
const MOSS = ramp("#26502a", "#3a7a34", "#5aa040");
const WATER = ramp("#16408e", "#215fbf", "#3a86e0", "#6ab4f2", "#c8eeff");
const SLATE = ramp("#1c2d68", "#29459a", "#3a62cf", "#5d88f0", "#92b6ff");
const TILE = ramp("#6a2020", "#9a3828", "#cc5a34", "#e8804a", "#f8aa6c");
const THATCH = ramp("#6a4e20", "#8e6c2c", "#b48e3c", "#d6b256", "#f0d078");
const SHAKE = ramp("#2c1c14", "#46301e", "#62442a", "#80593a", "#9c7448");
const WOOD = ramp("#3a2414", "#573620", "#74492b", "#92623a", "#b27f4c");
const PLASTER = [
  ramp("#c2ae84", "#dccaa0", "#eee2c0", "#fbf3da"), // cream
  ramp("#b4802e", "#d29e46", "#e6bc62", "#f4d886"), // ochre
  ramp("#b0645e", "#cc867a", "#e2a696", "#f2c6b6"), // rose
  ramp("#6a90a6", "#8ab0c4", "#a8cedc", "#c6e6f0"), // sky
  ramp("#6c6e7c", "#8b8e9c", "#a9acba", "#c6c9d4"), // church stone
];
const BRICKR = ramp("#5c2a22", "#8a4030", "#b45a3c", "#d27c52");
const LEAF = ramp("#1d4a22", "#2d6a2c", "#41883a", "#5eaa48", "#86cc60");
const PINE = ramp("#123a30", "#1c5236", "#2a6c3c", "#3e8a48", "#62ac5a");
const CROP = ramp("#2a5a20", "#3c7e2c", "#58a63a");
const HAY = ramp("#8a6a24", "#b08c34", "#d0ac4a", "#ecca66");
const BANK = ramp("#7a6a50", "#968462", "#b09c78", "#cbb894");
const ROAD = ramp("#6e5c46", "#8a7658", "#a69070", "#c2ac88");

const DARK = snap("#1a1c2a");
const IRON = snap("#3a3d4c");
const STEEL = snap("#8f98ac");
const GOLD = snap("#f0bc2c");
const GOLDD = snap("#b8861c");
const RED = snap("#c8282c");
const REDD = snap("#8a1a24");
const BLUE = snap("#2f5fcf");
const WHITE = snap("#f4f0e4");
const GLASS = snap("#1e2c4c");
const GLOWY = snap("#ffd45a");
const FIRE = snap("#ff8a2a");
const SKIN = snap("#eeb890");
const SKIN2 = snap("#c48858");
const BARK = snap("#5a3a22");
const PINK = snap("#f08ab0");
const YEL = snap("#f8e040");
const LILAC = snap("#b48ae8");
const SMOKE = snap("#d8d8e0");

// ---------------------------------------------------------------------------------------------------------------
// Grid, levels

const H = 0.0125; // fine cell
const T = 0.025; // terrain cell
const COL = 0.1; // terrain column
const NC = 30;
const X0 = -1.5;
const Z0 = -1.5;
const G = 0.3; // village ground
const R2 = 0.6;
const R3 = 0.45;
const YI = 0.8; // castle island and bank
const WY = 0.725; // moat water
const MF = 0.6; // moat floor
const CZ = -0.4; // hill centre z

type Kind = "island" | "moat" | "bank" | "slope" | "grass" | "stream" | "road";
interface Col {
  h: number;
  kind: Kind;
  w: number | null;
}

const cc = (i: number) => X0 + (i + 0.5) * COL;
const n3 = (x: number, z: number) => Math.cbrt(Math.abs(x) ** 3 + Math.abs(z) ** 3);
const idx = (v: number, o: number) => Math.min(NC - 1, Math.max(0, Math.floor((v - o) / COL)));

const streamCells = new Set<string>();
for (let iz = 19; iz <= 23; iz++) streamCells.add(`12,${iz}`); // spillway down the hill
for (let ix = 4; ix <= 12; ix++) streamCells.add(`${ix},24`); // canal
for (let ix = 1; ix <= 3; ix++) for (let iz = 24; iz <= 27; iz++) streamCells.add(`${ix},${iz}`); // pond

function makeCol(ix: number, iz: number): Col {
  const x = cc(ix);
  const z = cc(iz);
  const d = n3(x, z - CZ);
  const dj = d + (hash(ix, iz, 3) - 0.5) * 0.1;
  let h = G;
  let kind: Kind = "grass";
  let w: number | null = null;
  if (d < 0.6) {
    h = YI;
    kind = "island";
  } else if (d < 0.8) {
    h = MF;
    kind = "moat";
    w = WY;
  } else if (dj < 0.9) {
    h = YI;
    kind = "bank";
  } else if (dj < 1.1) {
    h = R2;
    kind = "slope";
  } else if (dj < 1.3) {
    h = R3;
    kind = "slope";
  }
  if (streamCells.has(`${ix},${iz}`)) {
    w = Math.min(h - 0.025, WY);
    h = w - 0.05;
    kind = "stream";
  } else if ((ix === 14 || ix === 15) && iz >= 19 && kind !== "moat" && kind !== "island") kind = "road";
  return { h, kind, w };
}
const cols: Col[][] = [];
for (let ix = 0; ix < NC; ix++) {
  cols.push([]);
  for (let iz = 0; iz < NC; iz++) cols[ix].push(makeCol(ix, iz));
}
const colOf = (x: number, z: number): Col => cols[idx(x, X0)][idx(z, Z0)];
const hAt = (x: number, z: number) => colOf(x, z).h;

// Flat patches painted over grass (plaza, dirt lanes, crop strips)
interface Patch {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  kind: "plaza" | "dirt" | "field" | "yard";
  dir?: "x" | "z";
}
const PATCHES: Patch[] = [
  { x0: -0.2, x1: 0.6, z0: 0.9, z1: 1.1, kind: "plaza" },
  { x0: -1.1, x1: 1.4, z0: 1.3, z1: 1.42, kind: "dirt" },
  { x0: 1.35, x1: 1.5, z0: -0.95, z1: 0.35, kind: "field", dir: "z" },
  { x0: -1.5, x1: -1.35, z0: -0.95, z1: 0.35, kind: "field", dir: "z" },
  { x0: 1.15, x1: 1.4, z0: 0.5, z1: 1.05, kind: "yard" },
];
const patchAt = (x: number, z: number) => PATCHES.find((p) => x >= p.x0 && x < p.x1 && z >= p.z0 && z < p.z1);

// ---------------------------------------------------------------------------------------------------------------
// Houses: one table drives walls (paint), roofs, doors, windows and trim

type Face = "+z" | "-z" | "+x" | "-x";
type RoofKind = "tile" | "thatch" | "slate" | "shake";
interface House {
  id: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  y0: number;
  face: Face;
  plaster: number;
  timber: boolean;
  floors: 1 | 2;
  ridge: "x" | "z";
  roof: RoofKind;
  pitch: 1 | 2;
  shutter: string;
  lit?: boolean;
  chimney?: [number, number];
  flowers?: boolean;
}
const mk = (id: string, x: number, z: number, w: number, d: number, h: number, o: Partial<House>): House => ({
  id,
  x,
  z,
  w,
  d,
  h,
  y0: G,
  face: "+z",
  plaster: 0,
  timber: true,
  floors: 1,
  ridge: "x",
  roof: "tile",
  pitch: 1,
  shutter: "#3a6aa8",
  ...o,
});
const HOUSES: House[] = [
  mk("h1", -0.9, 1.2, 0.3, 0.2, 0.175, { roof: "tile", plaster: 0, shutter: "#2f6aa0", chimney: [-0.05, 0.03], flowers: true }),
  mk("h2", -0.25, 1.2, 0.2, 0.2, 0.25, { floors: 2, ridge: "z", roof: "tile", plaster: 1, pitch: 2, shutter: "#2c7a52", chimney: [0.04, 0], lit: true }),
  mk("h3", 0.25, 1.2, 0.2, 0.2, 0.175, { roof: "thatch", plaster: 2, shutter: "#7a3a8a", flowers: true }),
  mk("tav", 0.65, 1.2, 0.3, 0.2, 0.25, { floors: 2, roof: "shake", plaster: 0, shutter: "#a83030", lit: true, chimney: [0.08, 0.02] }),
  mk("h5", 1.05, 1.2, 0.2, 0.2, 0.2, { ridge: "z", roof: "tile", plaster: 3, pitch: 2, shutter: "#e0a838", flowers: true }),
  mk("mill", -0.55, 1.1, 0.25, 0.15, 0.2, { roof: "thatch", plaster: 0, shutter: "#5a3a22", timber: false }),
  mk("nave", 1.275, 0.7, 0.2, 0.3, 0.2, { ridge: "z", roof: "slate", plaster: 4, timber: false, shutter: "#2a3a68" }),
  mk("tower", 1.275, 0.95, 0.15, 0.15, 0.45, { roof: "slate", plaster: 4, timber: false, ridge: "x", shutter: "#2a3a68" }),
  mk("cot", -1.275, 0.55, 0.2, 0.2, 0.15, { roof: "thatch", plaster: 1, shutter: "#3a6aa8", flowers: true }),
  mk("barn", -1.3, -1.3, 0.2, 0.2, 0.175, { ridge: "z", roof: "shake", plaster: 2, shutter: "#5a3a22", face: "+z", pitch: 2 }),
  // inside the castle
  mk("hall", -0.3, -0.25, 0.15, 0.3, 0.2, { y0: YI, face: "+x", ridge: "z", roof: "slate", plaster: 0, timber: true, shutter: "#2f5fcf", chimney: [0, 0.09], lit: true }),
  mk("barr", 0.3, -0.25, 0.15, 0.3, 0.175, { y0: YI, face: "-x", ridge: "z", roof: "tile", plaster: 3, timber: true, shutter: "#a83030", chimney: [0, -0.09], lit: true }),
  mk("stab", -0.3, -0.65, 0.2, 0.15, 0.125, { y0: YI, face: "+z", ridge: "x", roof: "shake", plaster: 1, timber: true, shutter: "#5a3a22" }),
  mk("smith", 0.3, -0.65, 0.2, 0.15, 0.15, { y0: YI, face: "+z", ridge: "x", roof: "thatch", plaster: 4, timber: false, shutter: "#2a2a30", chimney: [0.05, 0.0] }),
];

interface Rect {
  a0: number;
  a1: number;
  r0: number;
  r1: number;
}
interface Slots {
  door: Rect | null;
  wins: Rect[];
}
const slotCache = new Map<string, Slots>();
const faceW = (h: House, f: Face) => Math.round((f === "+z" || f === "-z" ? h.w : h.d) / H);
function slotsFor(h: House, face: Face): Slots {
  const key = h.id + face;
  const hit = slotCache.get(key);
  if (hit) return hit;
  const W = faceW(h, face);
  const hc = Math.round(h.h / H);
  const wins: Rect[] = [];
  let door: Rect | null = null;
  const rows = h.floors === 2 ? [5, Math.round(hc / 2) + 3] : [5];
  const addWin = (centre: number, r0: number) => {
    const a0 = Math.round(centre - 3);
    if (a0 < 1 || a0 + 6 > W - 1 || r0 + 5 > hc - 2) return;
    wins.push({ a0, a1: a0 + 6, r0, r1: r0 + 5 });
  };
  const onDoorFace = face === h.face;
  if (onDoorFace) {
    const centred = W >= 22;
    const a0 = centred ? Math.round(W / 2 - 3) : Math.round(W * 0.3 - 3);
    door = { a0, a1: a0 + 6, r0: 0, r1: Math.min(10, hc - 3) };
  }
  rows.forEach((r0, i) => {
    const n = Math.max(1, Math.floor((W - 2) / 11));
    if (i === 0 && door) {
      if (W >= 22) {
        addWin(W * 0.2, r0);
        addWin(W * 0.8, r0);
      } else addWin(W * 0.74, r0);
      return;
    }
    for (let k = 0; k < n; k++) {
      const ac = ((k + 0.5) * W) / n;
      addWin(ac, r0);
    }
  });
  const out = { door, wins };
  slotCache.set(key, out);
  return out;
}

/** Height of a house's ridge line, where the roof stack ends. */
function ridgeY(h: House) {
  const hw0 = Math.round(((h.ridge === "x" ? h.d : h.w) + 2 * H) / 2 / H);
  return h.y0 + h.h + (h.pitch === 2 ? 2 * hw0 - 1 : hw0) * H;
}

function houseAtCell(c: Cell): House | undefined {
  const px = c.at.x - c.n.x * H * 0.5;
  const pz = c.at.z - c.n.z * H * 0.5;
  return HOUSES.find(
    (h) =>
      Math.abs(px - h.x) <= h.w / 2 + 1e-3 &&
      Math.abs(pz - h.z) <= h.d / 2 + 1e-3 &&
      c.at.y >= h.y0 - 0.03 &&
      c.at.y <= h.y0 + h.h + 0.01,
  );
}

const inRect = (r: Rect, a: number, y: number) => a >= r.a0 && a < r.a1 && y >= r.r0 && y < r.r1;

function faceOf(n: THREE.Vector3): Face {
  return Math.abs(n.x) > Math.abs(n.z) ? (n.x > 0 ? "+x" : "-x") : n.z > 0 ? "+z" : "-z";
}
/** Cell index along a face, running to the right as seen from outside. */
function alongCells(h: House, f: Face, c: Cell): number {
  const xm = h.x - h.w / 2;
  const xM = h.x + h.w / 2;
  const zm = h.z - h.d / 2;
  const zM = h.z + h.d / 2;
  const a = f === "+z" ? c.at.x - xm : f === "-z" ? xM - c.at.x : f === "+x" ? zM - c.at.z : c.at.z - zm;
  return Math.floor(a / H + 1e-6);
}

/** Staggered brick courses, optionally mossy near the moat and ivy-streaked on the lower wall. */
function brickColor(c: Cell, rmp: string[], moss: boolean): string {
  const row = Math.floor(c.v / 3);
  const rr = mod(c.v, 3);
  const uu = c.u + mod(row, 2) * 3;
  const cx = mod(uu, 6);
  if (rr === 0 || cx === 0) return MORTAR;
  const id = hash(Math.floor(uu / 6), row, 7);
  const y = c.at.y;
  if (moss) {
    if (y < WY + 0.05 && c.random(3) < (WY + 0.05 - y) * 14) return c.pick(MOSS, c.random(4));
    const strand = hash(Math.floor(c.u / 5), 3, 12);
    if (y < YI + 0.25 && strand < 0.22 && c.random(5) < 0.9 - (y - YI) * 2.5 + 0.2 * (strand - 0.1)) return c.pick(LEAF, c.random(6));
  }
  let v = 0.3 + 0.5 * id + (rr === 2 ? 0.14 : 0) + (cx === 1 ? 0.06 : 0);
  if (c.random(9) < 0.025) v -= 0.3;
  return c.pick(rmp, Math.min(0.99, Math.max(0, v)));
}

function wallColor(c: Cell): string {
  const h = houseAtCell(c);
  if (!h) return STONE[1];
  const f = faceOf(c.n);
  const W = faceW(h, f);
  const hc = Math.round(h.h / H);
  const a = alongCells(h, f, c);
  const y = Math.floor((c.at.y - h.y0) / H + 1e-6);
  const PL = PLASTER[h.plaster];
  const timberC = h.plaster === 4 ? STONE[2] : snap("#55361f");
  if (y < 2) {
    const id = hash(Math.floor(a / 3), Math.floor(y / 2), 5);
    return mod(a, 3) === 0 || y === 1 ? (y === 1 ? ROCK[3] : ROCK[1]) : id < 0.5 ? ROCK[2] : ROCK[3];
  }
  const s = slotsFor(h, f);
  if (s.door && inRect({ a0: s.door.a0 - 1, a1: s.door.a1 + 1, r0: 0, r1: s.door.r1 + 1 }, a, y)) {
    const d = s.door;
    const lx = a - d.a0;
    const ly = y;
    const frame = lx < 0 || lx >= 6 || ly >= d.r1;
    if (frame) return snap("#3c2616");
    if (ly >= d.r1 - 1 && (lx === 0 || lx === 5)) return snap("#3c2616");
    if (lx === 4 && ly === 4) return GOLD;
    if (ly === 5 && (lx === 0 || lx === 5)) return IRON;
    if (ly === 2 || ly === d.r1 - 3) return lx === 0 || lx === 5 ? WOOD[0] : IRON; // door straps
    return mod(lx, 2) === 0 ? WOOD[2] : WOOD[1];
  }
  for (const w of s.wins) {
    if (inRect(w, a, y)) {
      const lx = a - w.a0;
      const ly = y - w.r0;
      if (lx === 0 || lx === 5) return mod(ly, 2) === 0 ? h.shutter : darker(h.shutter);
      if (ly === 0 || ly === 4 || lx === 1 || lx === 4) return h.plaster === 4 ? STONE[4] : WHITE;
      // glass: two columns, three rows, with a glint
      if (lx === 2 && ly === 3) return snap("#9ad0f0");
      if (lx === 2 && ly === 2) return snap("#4a78b0");
      return ly === 1 ? GLASS : snap("#2c4a7c");
    }
  }
  if (h.timber) {
    const corner = a < 1 || a >= W - 1;
    const topBeam = y >= hc - 1;
    const midBeam = h.floors === 2 && y === Math.round(hc / 2) + 1;
    const stud = mod(a - 2, 8) === 0 && y >= 2 && y < hc - 1;
    if (corner || topBeam || midBeam || stud) {
      const darkC = c.random(2) < 0.2 ? snap("#3e2616") : timberC;
      return darkC;
    }
    // diagonal brace on the upper wall of larger houses
    const braceBase = Math.floor((a - 2) / 8) * 8 + 2;
    const lx = a - braceBase;
    if (W >= 20 && y >= 2 && y < hc - 1 && lx > 0 && lx < 8 && Math.abs(y - 2 - lx) <= 0 && mod(Math.floor(a / 8), 2) === 0)
      return timberC;
  }
  if (h.plaster === 4) return brickColor(c, PLASTER[4], false);
  let v = 0.5 + 0.22 * (noise(c.at, 0.09, 5) - 0.5) * 2 - (y < 7 ? 0.14 * (1 - y / 7) : 0);
  if (c.random(9) < 0.03) v -= 0.25;
  return c.pick(PL, Math.min(0.99, Math.max(0, v + (c.random(4) - 0.5) * 0.2)));
}
function darker(hex: string) {
  const col = new THREE.Color(hex).multiplyScalar(0.72);
  return snap(`#${col.getHexString()}`);
}

const named = new Map<Paint, string>();
const label = (name: string, p: Paint) => {
  named.set(p, name);
  return p;
};

const WALLP = label("wall", cellPaint(H, wallColor, { dither: true }));

// Roof: gable end plaster, shingle treads and risers
function roofPaint(kind: RoofKind, ridge: "x" | "z") {
  const RP = kind === "tile" ? TILE : kind === "thatch" ? THATCH : kind === "slate" ? SLATE : SHAKE;
  return label(
    `roof${kind}${ridge}`,
    cellPaint(H, (c) => {
      const gable = ridge === "x" ? Math.abs(c.n.x) > 0.7 : Math.abs(c.n.z) > 0.7;
      if (gable) {
        const hs = HOUSES.find((q) => Math.abs(c.at.x - q.x) < q.w / 2 + 0.03 && Math.abs(c.at.z - q.z) < q.d / 2 + 0.03 && c.at.y > q.y0);
        if (hs) {
          const PL = PLASTER[hs.plaster];
          const a = ridge === "z" ? Math.floor((c.at.x - hs.x) / H) : Math.floor((c.at.z - hs.z) / H);
          if (hs.timber && mod(a, 6) === 0) return snap("#55361f");
          return c.pick(PL, 0.5 + (c.random(6) - 0.5) * 0.3);
        }
        return SHAKE[2];
      }
      const along = Math.floor((ridge === "x" ? c.at.x : c.at.z) / H);
      const row = Math.floor(c.at.y / H);
      const tread = c.n.y > 0.5;
      const k = mod(along + mod(row, 2) * 2, 4);
      const id = hash(Math.floor((along + mod(row, 2) * 2) / 4), row, 11);
      if (kind === "thatch") {
        const v = 0.45 + 0.4 * id + (tread ? 0.12 : -0.1) + (c.random(3) - 0.5) * 0.25;
        return c.pick(RP, Math.min(0.99, Math.max(0, v)));
      }
      if (k === 0) return RP[0];
      const v = 0.38 + 0.4 * id + (tread ? 0.2 : 0) + (k === 1 ? 0.08 : 0);
      return c.pick(RP, Math.min(0.99, Math.max(0, v)));
    }),
  );
}
const roofPaints = new Map<string, Paint>();
const roofFor = (kind: RoofKind, ridge: "x" | "z") => {
  const key = kind + ridge;
  let p = roofPaints.get(key);
  if (!p) roofPaints.set(key, (p = roofPaint(kind, ridge)));
  return p;
};

// ---------------------------------------------------------------------------------------------------------------
// Other paints

const cobble = (c: Cell, n: number, rmp: string[], mortar: string, seed: number) => {
  const row = Math.floor(c.v / n);
  const uu = c.u + mod(row, 2) * Math.floor(n / 2);
  if (mod(c.v, n) === 0 || mod(uu, n) === 0) return mortar;
  const id = hash(Math.floor(uu / n), row, seed);
  return rmp[Math.min(rmp.length - 1, Math.floor(0.15 * rmp.length + id * rmp.length * 0.8))];
};

const colIdx = (x: number, o: number) => Math.floor((x - o) / COL);
const neighbourKind = (x: number, z: number, dx: number, dz: number): Col | undefined => {
  const ix = colIdx(x, X0) + dx;
  const iz = colIdx(z, Z0) + dz;
  return ix < 0 || iz < 0 || ix >= NC || iz >= NC ? undefined : cols[ix][iz];
};
/** True when the cell touches (within one cell) a column matching `test` across a column border. */
function nearBorder(x: number, z: number, test: (c: Col) => boolean) {
  const fx = (x - X0) / COL - Math.floor((x - X0) / COL);
  const fz = (z - Z0) / COL - Math.floor((z - Z0) / COL);
  const e = T / COL;
  const probe = (dx: number, dz: number) => {
    const n = neighbourKind(x, z, dx, dz);
    return !!n && test(n);
  };
  return (fx < e && probe(-1, 0)) || (fx > 1 - e && probe(1, 0)) || (fz < e && probe(0, -1)) || (fz > 1 - e && probe(0, 1));
}

const FLOWERS = [snap("#f8e040"), snap("#f4f0e4"), snap("#f08ab0"), snap("#b48ae8"), snap("#ff6a4a")];

const TERRAIN = label(
  "terrain",
  cellPaint(
    T,
    (c) => {
      const n = c.n;
      const x = c.at.x;
      const z = c.at.z;
      if (n.y > 0.5) {
        const col = colOf(x, z);
        const pt = patchAt(x, z);
        if (col.kind === "island") {
          const lane = Math.abs(x) < 0.1 && z > -0.3;
          return cobble(c, 3, lane ? BANK : STONE.slice(1, 4), lane ? "#4a3c2c" : MORTAR, 2);
        }
        if (col.kind === "moat") return SOIL[1];
        if (col.kind === "stream") return BANK[2];
        if (col.kind === "road") return cobble(c, 3, ROAD, snap("#4a3c2c"), 4);
        if (col.kind === "bank" && nearBorder(x, z, (q) => q.kind === "moat")) return cobble(c, 3, STONE.slice(2, 5), MORTAR, 8);
        if (col.kind === "bank" || col.kind === "slope" || col.kind === "grass") {
          if (nearBorder(x, z, (q) => q.kind === "stream" && q.h < col.h + 0.01) && col.kind !== "bank")
            return c.pick(BANK, 0.5 + (c.random(1) - 0.5) * 0.6);
        }
        if (pt) {
          if (pt.kind === "plaza") return cobble(c, 4, BANK, snap("#5a4c38"), 9);
          if (pt.kind === "dirt") return c.pick(SOIL.slice(2), 0.35 + 0.5 * c.random(2));
          if (pt.kind === "yard") return c.pick(GRASS.slice(0, 4), 0.3 + 0.2 * c.random(2));
          if (pt.kind === "field") {
            const row = mod(Math.floor(pt.dir === "z" ? c.u : c.v), 3);
            if (row === 0) return SOIL[1];
            const leafy = c.random(3) < 0.75 && row === 2 ? c.pick(CROP, c.random(4)) : c.pick(SOIL.slice(1), 0.4 + 0.3 * c.random(5));
            return leafy;
          }
        }
        // grass with tufts, shade and the odd flower
        let v = 0.52 + 0.3 * (noise(c.at, 0.22, 3) - 0.5) * 2 + (col.h > G + 0.01 ? 0.04 : 0);
        v += (c.random(1) - 0.5) * 0.16;
        const r = c.random(2);
        if (r < 0.05) v -= 0.3;
        else if (r < 0.09) v += 0.25;
        if (c.random(7) < 0.008 && col.kind === "grass") return FLOWERS[Math.floor(c.random(8) * FLOWERS.length)];
        return c.pick(GRASS, Math.min(1, Math.max(0, v)));
      }
      if (n.y < -0.5) return SOIL[0];
      // vertical faces: stone facing at the moat, rock cliffs above ground, layered soil below
      const y = c.at.y;
      const owner = colOf(x - n.x * 0.02, z - n.z * 0.02);
      const other = neighbourKind(x - n.x * 0.02, z - n.z * 0.02, Math.round(n.x), Math.round(n.z));
      if (other && (other.kind === "moat" || other.kind === "stream") && owner.kind !== "moat") {
        const wet = y < (other.w ?? WY) + 0.001 + 0.0125;
        const col = cobble(c, 3, wet ? ROCK.slice(0, 3) : STONE.slice(1, 4), MORTAR, 12);
        return col;
      }
      if (y > G + 0.001) {
        const top = owner.h - y < T * 1.01;
        if (top && c.random(2) < 0.7) return c.pick(GRASS.slice(0, 4), 0.2 + 0.6 * c.random(3));
        let v = 0.45 + 0.25 * (noise(c.at, 0.12, 6) - 0.5) * 2 + (c.random(5) - 0.5) * 0.25;
        if (mod(c.v, 4) === 0) v -= 0.18;
        if (y < G + 0.06 && c.random(8) < 0.3) return c.pick(MOSS, c.random(9));
        return c.pick(ROCK, Math.min(1, Math.max(0, v)));
      }
      // soil: grass fringe, topsoil, clay with pebbles and boulders
      const depth = G - y;
      if (depth < T && c.random(11) < 0.6) return c.pick(GRASS.slice(0, 3), c.random(12));
      const boulder = hash(c.u >> 1, c.v >> 1, 14) < 0.07 && depth > 0.04;
      if (boulder) {
        const lit = mod(c.u, 2) === 0 && mod(c.v, 2) === 1;
        return lit ? ROCK[3] : mod(c.u, 2) === 1 && mod(c.v, 2) === 0 ? ROCK[1] : ROCK[2];
      }
      if (c.random(15) < 0.05) return ROCK[2];
      let sv = 0.2 + 0.6 * (1 - Math.min(1, depth / 0.24)) * 0 + 0.3 * c.random(16);
      sv += depth > 0.14 ? 0.3 : depth > 0.07 ? 0.1 : -0.1;
      if (mod(c.v, 5) === 0) sv -= 0.18;
      return c.pick(SOIL, Math.min(1, Math.max(0, sv)));
    },
    { dither: true },
  ),
);

const WATERP = label(
  "water",
  cellPaint(
    T,
    (c) => {
      const x = c.at.x;
      const z = c.at.z;
      if (Math.abs(c.n.y) < 0.5) {
        const streak = hash(c.u, c.depth, 3);
        return streak < 0.25 ? WATER[4] : streak < 0.55 ? WATER[3] : WATER[2];
      }
      const col = colOf(x, z);
      const edge = nearBorder(x, z, (q) => q.w === null);
      let v = 0.36 + 0.34 * noise(new THREE.Vector3(x * 1.6, 0, z), 0.2, 2);
      const wave = mod(c.u + 2 * Math.floor(c.v / 2), 6) === 0 && c.random(5) < 0.5;
      if (wave) v += 0.28;
      if (hash(c.u, c.v, 4) < 0.025) return WATER[4];
      if (edge && c.random(6) < 0.55) return WATER[3];
      if (col.kind === "stream") v += 0.06;
      return c.pick(WATER, Math.min(1, Math.max(0, v)));
    },
    { dither: true },
  ),
);

// Castle brick: 3-cell courses, 6-cell bricks, moss and ivy at the waterline
const flagTop = (c: Cell) => cobble(c, 4, STONE.slice(1, 5), MORTAR, 21);
const BRICK = label(
  "brick",
  cellPaint(H, (c) => (c.n.y > 0.5 ? flagTop(c) : c.n.y < -0.5 ? STONE[0] : brickColor(c, STONE, true))),
);
// Slate / tile roofs on towers
const CASTLE_ROOF = label(
  "slate",
  cellPaint(H, (c) => {
    const tread = c.n.y > 0.5;
    const along = c.axis === 1 ? c.u : c.u;
    const row = Math.floor(c.at.y / H);
    const k = mod(along + mod(row, 2) * 2, 4);
    if (k === 0 && !tread) return SLATE[0];
    const id = hash(Math.floor((along + mod(row, 2) * 2) / 4), row, 17);
    const v = 0.35 + 0.35 * id + (tread ? 0.22 : 0) + (k === 1 ? 0.08 : 0);
    return c.pick(SLATE, Math.min(0.99, v));
  }),
);
const RED_ROOF = label(
  "redroof",
  cellPaint(H, (c) => {
    const tread = c.n.y > 0.5;
    const row = Math.floor(c.at.y / H);
    const k = mod(c.u + mod(row, 2) * 2, 4);
    if (k === 0 && !tread) return TILE[0];
    const id = hash(Math.floor((c.u + mod(row, 2) * 2) / 4), row, 19);
    return c.pick(TILE, Math.min(0.99, 0.3 + 0.35 * id + (tread ? 0.22 : 0)));
  }),
);
const WOODP = label(
  "planks",
  cellPaint(H, (c) => {
    const along = c.axis === 1 ? c.u : c.u;
    const row = Math.floor(c.v / 3);
    if (mod(c.v, 3) === 0) return WOOD[0];
    const id = hash(Math.floor((along + row * 5) / 7), row, 23);
    if (mod(along + row * 5, 7) === 0 && c.random(1) < 0.8) return WOOD[0];
    return c.pick(WOOD, 0.35 + 0.4 * id + (mod(c.v, 3) === 2 ? 0.12 : 0));
  }),
);
const VPLANK = label(
  "vplanks",
  cellPaint(H, (c) => {
    if (mod(c.u + c.depth, 3) === 0) return WOOD[0];
    const id = hash(Math.floor((c.u + c.depth) / 3), c.depth, 29);
    return c.pick(WOOD, 0.3 + 0.5 * id + (c.random(2) - 0.5) * 0.2);
  }),
);
const BARREL = label(
  "barrel",
  cellPaint(H, (c) => {
    if (c.n.y > 0.5) return mod(c.u + c.v, 3) === 0 ? WOOD[0] : WOOD[3];
    const y = Math.floor(c.at.y / H);
    if (mod(y, 7) === 0 || mod(y, 7) === 6) return IRON;
    if (mod(c.u, 3) === 0) return WOOD[0];
    return c.pick(WOOD, 0.4 + 0.3 * hash(c.u, 1, 31) + (mod(c.u, 3) === 1 ? 0.1 : 0));
  }),
);
const BRICKS_RED = label(
  "redbrick",
  cellPaint(H, (c) => {
    if (c.n.y > 0.5) return BRICKR[0];
    const row = Math.floor(c.v / 2);
    const uu = c.u + mod(row, 2) * 2;
    if (mod(c.v, 2) === 0 || mod(uu, 4) === 0) return STONE[1];
    return c.pick(BRICKR, 0.3 + 0.6 * hash(Math.floor(uu / 4), row, 33));
  }),
);
const LEAFP = label(
  "leaf",
  cellPaint(
    H,
    (c) => {
      let v = 0.42 + 0.34 * Math.max(0, c.n.y) + 0.2 * (noise(c.at, 0.08, 7) - 0.5) * 2 + (c.random(1) - 0.5) * 0.25;
      if (c.random(2) < 0.05) v += 0.3;
      else if (c.random(3) < 0.08) v -= 0.3;
      return c.pick(LEAF, Math.min(1, Math.max(0, v)));
    },
    { dither: true },
  ),
);
const AUTUMNP = label(
  "autumn",
  cellPaint(
    H,
    (c) => {
      let v = 0.42 + 0.34 * Math.max(0, c.n.y) + 0.2 * (noise(c.at, 0.08, 8) - 0.5) * 2 + (c.random(1) - 0.5) * 0.25;
      if (c.random(2) < 0.05) v += 0.3;
      else if (c.random(3) < 0.08) v -= 0.3;
      return c.pick(AUTUMN, Math.min(1, Math.max(0, v)));
    },
    { dither: true },
  ),
);
const PINEP = label(
  "pine",
  cellPaint(
    H,
    (c) => {
      let v = 0.4 + 0.4 * Math.max(0, c.n.y) + 0.2 * (noise(c.at, 0.06, 9) - 0.5) * 2 + (c.random(1) - 0.5) * 0.25;
      if (c.random(2) < 0.05) v += 0.3;
      return c.pick(PINE, Math.min(1, Math.max(0, v)));
    },
    { dither: true },
  ),
);
const ROCKP = label(
  "rock",
  cellPaint(
    H,
    (c) => {
      let v = 0.4 + 0.3 * Math.max(0, c.n.y) + 0.15 * (c.n.x + c.n.z) * 0 + (c.random(1) - 0.5) * 0.3;
      if (mod(c.v, 4) === 0) v -= 0.15;
      if (c.n.y > 0.5 && c.random(2) < 0.12) return c.pick(MOSS, c.random(3));
      return c.pick(ROCK, Math.min(1, Math.max(0, v)));
    },
    { dither: true },
  ),
);
const HAYP = label(
  "hay",
  cellPaint(H, (c) => {
    const v = 0.4 + 0.4 * c.random(1) + (c.n.y > 0.5 ? 0.15 : 0);
    return mod(c.v, 4) === 0 ? HAY[0] : c.pick(HAY, Math.min(0.99, v));
  }),
);
const CLOTH = label(
  "cloth",
  cellPaint(H, (c) => {
    const rib = mod(c.u, 4) === 0 || mod(c.v, 4) === 0;
    return rib ? snap("#c8b890") : c.pick(PLASTER[0], 0.55 + (c.random(1) - 0.5) * 0.3);
  }),
);
const AWNING = (a: string, b2: string) =>
  label(
    `awning${a}`,
    cellPaint(H, (c) => (mod(Math.floor((c.axis === 2 ? c.u : c.v) / 3), 2) === 0 ? a : b2)),
  );

// ---------------------------------------------------------------------------------------------------------------
// Geometry kit: boxes are merged per scope, fill and bone into one part each

type Fill = string | Paint;
type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;
interface Opt {
  bone?: Joint;
  tex?: THREE.Texture;
  glow?: number;
}
interface Group {
  fill: Fill;
  geos: THREE.BufferGeometry[];
  opt: Opt;
  name: string;
}
class Kit {
  scope = "scene";
  private groups = new Map<string, Group>();
  private ids = new Map<object, number>();
  constructor(
    private readonly b: Builder,
    private readonly root: Joint,
  ) {}
  private id(o: object) {
    let v = this.ids.get(o);
    if (v === undefined) this.ids.set(o, (v = this.ids.size + 1));
    return v;
  }
  add(fill0: Fill, geo: THREE.BufferGeometry, opt: Opt = {}) {
    const fill = typeof fill0 === "string" ? snapColor(fill0, 16) : fill0; // flat colours: 12-bit palette keeps the colour count low
    const f = typeof fill === "string" ? fill : `p${this.id(fill)}`;
    const key = [this.scope, f, opt.bone ? opt.bone.name : "", opt.tex ? this.id(opt.tex) : "", opt.glow ?? ""].join("|");
    let g = this.groups.get(key);
    if (!g) {
      const nm = typeof fill === "string" ? fill.slice(1) : (named.get(fill) ?? "paint");
      g = { fill, geos: [], opt, name: `${this.scope}.${nm}` };
      this.groups.set(key, g);
    }
    g.geos.push(geo);
  }
  box(fill: Fill, x: number, y0: number, z: number, w: number, h: number, d: number, opt?: Opt) {
    this.add(fill, new THREE.BoxGeometry(w, h, d).translate(x, y0 + h / 2, z), opt);
  }
  flush() {
    for (const g of this.groups.values()) {
      const geo = g.geos.length === 1 ? g.geos[0] : mergeGeometries(g.geos);
      if (!geo) throw new Error(`could not merge ${g.name}`);
      const p = this.b.part(geo, g.opt.tex ? "#ffffff" : g.fill, {
        bone: g.opt.bone ?? this.root,
        at: [0, 0, 0],
        texture: g.opt.tex,
        name: g.name,
      });
      if (g.opt.glow) glow(p, g.opt.glow);
    }
    this.groups.clear();
  }
}

/** A box builder in a frame at (x, y0, z) turned `rot` radians about the vertical. */
function frameAt(k: Kit, x: number, y0: number, z: number, rot: number) {
  return {
    box(fill: Fill, lx: number, ly: number, lz: number, w: number, h: number, d: number, opt?: Opt) {
      k.add(fill, new THREE.BoxGeometry(w, h, d).translate(lx, ly + h / 2, lz).rotateY(rot).translate(x, y0, z), opt);
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Terrain meshes

class Mesh {
  pos: number[] = [];
  nor: number[] = [];
  uv: number[] = [];
  idx: number[] = [];
  quad(a: number[], b: number[], c: number[], d: number[], n: number[]) {
    const base = this.pos.length / 3;
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const flip = cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0;
    for (const v of [a, b, c, d]) {
      this.pos.push(...v);
      this.nor.push(...n);
      this.uv.push(v[0] + v[2], v[1]);
    }
    if (flip) this.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    else this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
    g.setIndex(this.idx);
    return g;
  }
}

const BOTTOM = 0.06;
function terrainGeo() {
  const m = new Mesh();
  for (let ix = 0; ix < NC; ix++)
    for (let iz = 0; iz < NC; iz++) {
      const col = cols[ix][iz];
      const x0 = X0 + ix * COL;
      const x1 = x0 + COL;
      const z0 = Z0 + iz * COL;
      const z1 = z0 + COL;
      m.quad([x0, col.h, z0], [x0, col.h, z1], [x1, col.h, z1], [x1, col.h, z0], [0, 1, 0]);
      const sides: [number, number, number[], number[][]][] = [
        [1, 0, [1, 0, 0], [[x1, 0, z0], [x1, 0, z1]]],
        [-1, 0, [-1, 0, 0], [[x0, 0, z1], [x0, 0, z0]]],
        [0, 1, [0, 0, 1], [[x1, 0, z1], [x0, 0, z1]]],
        [0, -1, [0, 0, -1], [[x0, 0, z0], [x1, 0, z0]]],
      ];
      for (const [dx, dz, n, edge] of sides) {
        const nx = ix + dx;
        const nz = iz + dz;
        const low = nx < 0 || nz < 0 || nx >= NC || nz >= NC ? BOTTOM : cols[nx][nz].h;
        if (low >= col.h - 1e-6) continue;
        const [p, q] = edge;
        m.quad([p[0], low, p[2]], [q[0], low, q[2]], [q[0], col.h, q[2]], [p[0], col.h, p[2]], n);
      }
    }
  return m.geo();
}
function waterGeo() {
  const m = new Mesh();
  for (let ix = 0; ix < NC; ix++)
    for (let iz = 0; iz < NC; iz++) {
      const col = cols[ix][iz];
      if (col.w === null) continue;
      const x0 = X0 + ix * COL;
      const x1 = x0 + COL;
      const z0 = Z0 + iz * COL;
      const z1 = z0 + COL;
      m.quad([x0, col.w, z0], [x0, col.w, z1], [x1, col.w, z1], [x1, col.w, z0], [0, 1, 0]);
      const sides: [number, number, number[], number[][]][] = [
        [1, 0, [1, 0, 0], [[x1, 0, z0], [x1, 0, z1]]],
        [-1, 0, [-1, 0, 0], [[x0, 0, z1], [x0, 0, z0]]],
        [0, 1, [0, 0, 1], [[x1, 0, z1], [x0, 0, z1]]],
        [0, -1, [0, 0, -1], [[x0, 0, z0], [x1, 0, z0]]],
      ];
      for (const [dx, dz, n, edge] of sides) {
        const nb = cols[ix + dx]?.[iz + dz];
        if (!nb || nb.w === null || nb.w >= col.w - 1e-6) continue;
        const [p, q] = edge;
        m.quad([p[0], nb.w, p[2]], [q[0], nb.w, q[2]], [q[0], col.w, q[2]], [p[0], col.w, p[2]], n);
      }
    }
  return m.geo();
}

// ---------------------------------------------------------------------------------------------------------------
// Textures (pixel drawings, 1.25 cm per pixel)

const PENNANT_RED = pixelArt(
  ["rrrrrrrrrrrr", "rrrrrrrrrrrr", "gggggggggg..", "rrrrrrrrrr..", "rrrrrrrr....", "rrrrrr......"].map((r) => r.padEnd(12, ".")),
  { r: RED, g: GOLD },
);
const PENNANT_BLUE = pixelArt(
  ["bbbbbbbbbbbb", "bbbbbbbbbbbb", "wwwwwwwwww..", "bbbbbbbbbb..", "bbbbbbbb....", "bbbbbb......"],
  { b: BLUE, w: WHITE },
);
const BANNER = pixelArt(
  [
    "yyyyyyyyyy",
    "rrrrrrrrrr",
    "rrrrggrrrr",
    "rrrgggrrrr",
    "rrgggggrrr",
    "rrrrggrrrr",
    "rrrgggggrr",
    "rrrrggrrrr",
    "rrrrggrrrr",
    "rdrrrrrrdr",
    ".rrrrrrrr.",
    "..rrrrrr..",
    "...rrrr...",
    "....rr....",
  ].map((r) => r),
  { r: RED, g: GOLD, y: GOLDD, d: REDD },
);
const BANNER_BLUE = pixelArt(
  [
    "yyyyyyyyyy",
    "bbbbbbbbbb",
    "bbbbwwbbbb",
    "bbbwwwbbbb",
    "bbwwwwwbbb",
    "bbbbwwbbbb",
    "bbbwwwwwbb",
    "bbbbwwbbbb",
    "bbbbwwbbbb",
    "bdbbbbbbdb",
    ".bbbbbbbb.",
    "..bbbbbb..",
    "...bbbb...",
    "....bb....",
  ],
  { b: BLUE, w: WHITE, y: GOLDD, d: snap("#1c3a8a") },
);
const SHIELD = pixelArt(
  [
    "kkkkkkkkkk",
    "kbbbbkrrrk",
    "kbgbbkrrrk",
    "kbbgbkrrrk",
    "kkkkkkkkkk",
    "krrrkbbbbk",
    "krrrkbbgbk",
    ".krrkbbbk.",
    "..krbbbk..",
    "...kbbk...",
    "....kk....",
  ],
  { k: GOLDD, b: BLUE, r: RED, g: GOLD },
);
const SIGN = pixelArt(
  [
    "kkkkkkkkkkkk",
    "kwwwwwwwwwwk",
    "kwwyyyyywwwk",
    "kwwywwwywwwk",
    "kwwywwwyyywk",
    "kwwywwwywywk",
    "kwwyyyyyyywk",
    "kwwwwwwwwwwk",
    "kkkkkkkkkkkk",
  ],
  { k: snap("#3a2414"), w: snap("#c8a060"), y: snap("#f0d070") },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "castleDiorama", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const k = new Kit(b, base);
  const rand = rng(42);

  // Joints for the parts that move
  const bridgeJ = b.joint("drawbridge", { parent: base, at: [0, YI - 0.0125, 0.175], dir: [0, 0, 1], role: "hinge" });
  const portJ = b.joint("portcullis", { parent: base, at: [0, YI + 0.1, 0.15], dir: [0, 1, 0], role: "hinge" });
  const sailsJ = b.joint("windmillSails", { parent: base, at: [1.3, 0.62, -1.2], dir: [0, 0, 1], role: "hinge" });
  const wheelJ = b.joint("millWheel", { parent: base, at: [-0.55, 0.37, 0.97], dir: [1, 0, 0], role: "hinge" });
  const vaneJ = b.joint("weathervane", { parent: base, at: [1.275, 0.955, 0.95], dir: [0, 1, 0], role: "hinge" });

  // --- Terrain, plinth, water -------------------------------------------------------------------------------
  k.scope = "terrain";
  k.add(TERRAIN, terrainGeo());
  k.scope = "water";
  k.add(WATERP, waterGeo());
  k.scope = "plinth";
  k.box(label("plinth", cellPaint(T, (c) => (c.n.y > 0.5 ? ROCK[3] : cobble(c, 3, ROCK.slice(1, 4), "#2c2a34", 40)))), 0, 0, 0, 3.06, BOTTOM, 3.06);
  k.flush();

  // --- Castle ----------------------------------------------------------------------------------------------
  castle(k, bridgeJ, portJ);
  // --- Village ---------------------------------------------------------------------------------------------
  for (const h of HOUSES) house(k, h);
  village(k, wheelJ, vaneJ, sailsJ);
  // --- Nature ----------------------------------------------------------------------------------------------
  nature(k, rand);
  return b.root;

  // ============================================================================================================
  function castle(k: Kit, bridge: Joint, port: Joint) {
    const cz = CZ;
    // curtain walls with plinth and crenellations
    k.scope = "castle.walls";
    const U = YI - 0.625;
    const WB = 0.5 + U;
    const WT = 0.875 + U;
    const wallSeg = (x0: number, z0: number, x1: number, z1: number) => {
      const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      const len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;
      k.box(BRICK, mx, WB, mz, alongX ? len : 0.075, WT - WB, alongX ? 0.075 : len);
      k.box(BRICK, mx, WB, mz, alongX ? len : 0.1, 0.125, alongX ? 0.1 : len); // batter at the foot
    };
    wallSeg(-0.5, cz + 0.5, -0.15, cz + 0.5);
    wallSeg(0.15, cz + 0.5, 0.5, cz + 0.5);
    wallSeg(-0.5, cz - 0.5, 0.5, cz - 0.5);
    wallSeg(-0.5, cz - 0.5, -0.5, cz + 0.5);
    wallSeg(0.5, cz - 0.5, 0.5, cz + 0.5);
    // merlons on the outer edge of every wall
    const merlons = (x0: number, z0: number, x1: number, z1: number, top: number, outX: number, outZ: number, depth: number) => {
      const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      const len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
      const n = Math.floor(len / 0.1);
      for (let i = 0; i < n; i++) {
        const t = -len / 2 + (i + 0.5) * (len / n);
        const mx = (x0 + x1) / 2 + (alongX ? t : 0) + outX * (0.0375 - depth / 2);
        const mz = (z0 + z1) / 2 + (alongX ? 0 : t) + outZ * (0.0375 - depth / 2);
        k.box(BRICK, mx, top, mz, alongX ? 0.05 : depth, 0.05, alongX ? depth : 0.05);
      }
      // inner low rail so the wall walk reads
      const rx = (x0 + x1) / 2 - outX * (0.0375 - 0.0063);
      const rz = (z0 + z1) / 2 - outZ * (0.0375 - 0.0063);
      k.box(BRICK, rx, top, rz, alongX ? len : 0.0125, 0.0125, alongX ? 0.0125 : len);
    };
    merlons(-0.425, cz + 0.5, -0.15, cz + 0.5, WT, 0, 1, 0.025);
    merlons(0.15, cz + 0.5, 0.425, cz + 0.5, WT, 0, 1, 0.025);
    merlons(-0.425, cz - 0.5, 0.425, cz - 0.5, WT, 0, -1, 0.025);
    merlons(-0.5, cz - 0.425, -0.5, cz + 0.425, WT, -1, 0, 0.025);
    merlons(0.5, cz - 0.425, 0.5, cz + 0.425, WT, 1, 0, 0.025);

    // pilasters, arrow slits, hanging banners and a back postern with a jetty
    k.scope = "castle.wallDecor";
    const wface = (face: Face, a: number, t: number) => {
      const o = 0.0375 + t / 2 - 0.002;
      return face === "+z" ? [a, cz + 0.5 + o] : face === "-z" ? [a, cz - 0.5 - o] : face === "+x" ? [0.5 + o, a] : [-0.5 - o, a];
    };
    const wbox = (fill: Fill, face: Face, a: number, y0: number, w: number, h: number, t: number, opt?: Opt) => {
      const [x, z] = wface(face, a, t);
      const zf = face === "+z" || face === "-z";
      k.box(fill, x, y0, z, zf ? w : t, h, zf ? t : w, opt);
    };
    const turn: Record<Face, number> = { "+z": 0, "-z": Math.PI, "+x": Math.PI / 2, "-x": -Math.PI / 2 };
    const sides: [Face, number[], number[], number[]][] = [
      ["+z", [-0.3, 0.3], [-0.375, -0.225, 0.225, 0.375], []],
      ["-z", [-0.25, 0.25], [-0.375, 0.375], [-0.125, 0.125]],
      ["+x", [cz - 0.25, cz, cz + 0.25], [cz - 0.375, cz + 0.375], [cz - 0.125, cz + 0.125]],
      ["-x", [cz - 0.25, cz, cz + 0.25], [cz - 0.375, cz + 0.375], [cz - 0.125, cz + 0.125]],
    ];
    sides.forEach(([face, pil, slits, bans], fi) => {
      for (const a of pil) wbox(BRICK, face, a, WB + 0.1, 0.05, WT - WB - 0.1, 0.025);
      for (const a of slits) {
        wbox(DARK, face, a, WB + 0.17, 0.0125, 0.06, 0.006);
        wbox(STONE[4], face, a, WB + 0.23, 0.0375, 0.0125, 0.01);
        wbox(STONE[3], face, a, WB + 0.1575, 0.0375, 0.0125, 0.01);
      }
      bans.forEach((a, i) => {
        const [x, z] = wface(face, a, 0.004);
        k.add("#ffffff", new THREE.PlaneGeometry(0.0625, 0.0875).rotateY(turn[face]).translate(x, WT - 0.085, z), {
          tex: (fi + i) % 2 === 0 ? BANNER : BANNER_BLUE,
        });
        wbox(GOLDD, face, a, WT - 0.0375, 0.0725, 0.008, 0.012);
      });
    });
    // postern on the back wall, step and jetty over the moat
    wbox(snap("#3c2616"), "-z", 0, YI, 0.0875, 0.1125, 0.012);
    wbox(VPLANK, "-z", 0, YI, 0.0625, 0.0925, 0.018);
    wbox(GOLD, "-z", 0.02, YI + 0.045, 0.008, 0.008, 0.024);
    wbox(STONE[4], "-z", 0, YI + 0.1125, 0.1125, 0.0125, 0.02);
    wbox(FIRE, "-z", -0.07, YI + 0.07, 0.014, 0.02, 0.02, { glow: 1.0 });
    wbox(FIRE, "-z", 0.07, YI + 0.07, 0.014, 0.02, 0.02, { glow: 1.0 });
    wbox(IRON, "-z", -0.07, YI + 0.055, 0.01, 0.0125, 0.02);
    wbox(IRON, "-z", 0.07, YI + 0.055, 0.01, 0.0125, 0.02);
    k.box(WOODP, 0, YI - 0.0125, cz - 0.5 - 0.0375 - 0.1, 0.075, 0.0125, 0.2);
    for (const s of [1, -1])
      for (const dz of [0.03, 0.19]) k.box(WOOD[1], s * 0.0375, MF, cz - 0.5 - 0.0375 - dz, 0.0125, YI - MF + 0.02, 0.0125);
    // corner towers
    const towers: [number, number, number, boolean][] = [
      [-0.5, cz - 0.5, 1.2 + U, true],
      [0.5, cz - 0.5, 1.2 + U, true],
      [-0.5, cz + 0.5, 1.05 + U, false],
      [0.5, cz + 0.5, 1.05 + U, false],
    ];
    towers.forEach(([tx, tz, top, roofed], i) => {
      k.scope = `castle.tower${i}`;
      k.box(BRICK, tx, WB, tz, 0.175, 0.1, 0.175); // foot
      k.box(BRICK, tx, WB + 0.1, tz, 0.15, top - 0.05 - WB - 0.1, 0.15);
      k.box(BRICK, tx, top - 0.05, tz, 0.175, 0.025, 0.175); // corbels
      k.box(BRICK, tx, top - 0.025, tz, 0.2, 0.025, 0.2);
      // arrow slits and windows
      for (const [dx, dz, ax] of [
        [0, 1, 0],
        [0, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
      ] as const) {
        const sx = tx + dx * 0.0775;
        const sz = tz + dz * 0.0775;
        k.box(DARK, sx, WB + 0.22, sz, ax ? 0.005 : 0.0125, 0.05, ax ? 0.0125 : 0.005);
        k.box(STONE[4], sx + dx * 0.001, WB + 0.27, sz + dz * 0.001, ax ? 0.004 : 0.025, 0.0125, ax ? 0.025 : 0.004);
        // upper lit window with a lintel and sill
        k.box(DARK, sx, top - 0.2, sz, ax ? 0.006 : 0.03, 0.055, ax ? 0.03 : 0.006);
        k.box(GLOWY, sx + dx * 0.001, top - 0.1925, sz + dz * 0.001, ax ? 0.006 : 0.0125, 0.0375, ax ? 0.0125 : 0.006, { glow: 1.0 });
        k.box(STONE[4], sx + dx * 0.002, top - 0.145, sz + dz * 0.002, ax ? 0.006 : 0.0425, 0.0125, ax ? 0.0425 : 0.006);
        k.box(STONE[4], sx + dx * 0.002, top - 0.2125, sz + dz * 0.002, ax ? 0.006 : 0.0425, 0.0125, ax ? 0.0425 : 0.006);
      }
      if (roofed) {
        // pyramid hat
        let hh = 0.1;
        let y = top;
        while (hh > 0.006) {
          k.box(CASTLE_ROOF, tx, y, tz, 2 * hh, 0.025, 2 * hh);
          y += 0.025;
          hh -= 0.0125;
        }
        k.box(GOLD, tx, y, tz, 0.0125, 0.04, 0.0125);
        flagPole(k, tx, y + 0.02, tz, 0.16, i % 2 === 0 ? PENNANT_RED : PENNANT_BLUE);
      } else {
        for (const [dx, dz] of [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]) {
          for (const t of [-0.0625, 0.0625]) {
            const mx = tx + (dz !== 0 ? t : dx * 0.0875);
            const mz = tz + (dz !== 0 ? dz * 0.0875 : t);
            k.box(BRICK, mx, top, mz, dz !== 0 ? 0.05 : 0.025, 0.05, dz !== 0 ? 0.025 : 0.05);
          }
        }
        // brazier
        k.box(IRON, tx, top, tz, 0.05, 0.025, 0.05);
        k.box(IRON, tx, top + 0.025, tz, 0.0375, 0.0125, 0.0375);
        k.box(FIRE, tx, top + 0.0375, tz, 0.03, 0.025, 0.03, { glow: 1.0 });
        k.box(GLOWY, tx, top + 0.0625, tz, 0.0125, 0.0125, 0.0125, { glow: 1.0 });
        flagPole(k, tx - 0.05, top, tz - 0.05, 0.12, i % 2 === 0 ? PENNANT_BLUE : PENNANT_RED);
      }
    });

    // gatehouse: two piers, a lintel with a pixel arch, portcullis and iron-bound doors
    k.scope = "castle.gate";
    const gz = cz + 0.5;
    const gh = 1.04 + U;
    const py = YI + 0.175; // top of the passage
    for (const s of [1, -1]) {
      k.box(BRICK, s * 0.1, WB, gz, 0.1, gh - WB, 0.15);
      k.box(BRICK, s * 0.1, gh - 0.05, gz + 0.0625, 0.1, 0.025, 0.025); // corbel
      for (let r = 0; r < 3; r++) {
        const w = 0.0125 * (3 - r);
        k.box(BRICK, s * (0.05 - w / 2), py - 0.0125 * (r + 1), gz, w, 0.0125, 0.15); // stepped arch
      }
    }
    k.box(BRICK, 0, py, gz, 0.1, gh - py, 0.15); // lintel
    k.box(BRICK, 0, WB, gz, 0.1, YI - WB, 0.15); // sill
    k.box(BRICK, 0, gh, gz, 0.3, 0.025, 0.15);
    for (let i = 0; i < 3; i++) k.box(BRICK, -0.125 + i * 0.125, gh + 0.025, gz + 0.0625, 0.05, 0.05, 0.025);
    for (const s of [1, -1]) {
      k.box(BRICK, s * 0.1375, gh + 0.025, gz, 0.025, 0.05, 0.1);
      k.box(BRICK, s * 0.1, gh + 0.025, gz - 0.0625, 0.1, 0.05, 0.025);
      k.box(DARK, s * 0.1, gh - 0.11, gz + 0.0775, 0.0125, 0.05, 0.004); // arrow slits
      k.box(VPLANK, s * 0.0475, YI, gz - 0.04, 0.005, 0.165, 0.06); // inner doors open against the passage walls
      k.box(IRON, s * 0.0475, YI + 0.04, gz - 0.04, 0.007, 0.0125, 0.062);
      k.box(IRON, s * 0.0475, YI + 0.11, gz - 0.04, 0.007, 0.0125, 0.062);
    }
    flagPole(k, 0, gh + 0.025, gz - 0.04, 0.13, PENNANT_RED);
    for (const s of [1, -1]) k.box(GOLD, s * 0.1375, gh + 0.075, gz + 0.0625, 0.0125, 0.0125, 0.0125);
    k.scope = "castle.gateDecor";
    k.add("#ffffff", new THREE.PlaneGeometry(0.0875, 0.1).translate(0, py + 0.08, gz + 0.0775), { tex: SHIELD });
    for (const s of [1, -1]) {
      k.add("#ffffff", new THREE.PlaneGeometry(0.075, 0.1).translate(s * 0.1, py + 0.04, gz + 0.0775), { tex: s > 0 ? BANNER : BANNER_BLUE });
      // torch brackets with flames
      k.box(IRON, s * 0.1625, YI + 0.075, gz + 0.04, 0.0125, 0.0125, 0.0375);
      k.box(WOOD[2], s * 0.1625, YI + 0.0875, gz + 0.0625, 0.0125, 0.0375, 0.0125);
      k.box(FIRE, s * 0.1625, YI + 0.125, gz + 0.0625, 0.02, 0.025, 0.02, { glow: 1.0 });
      k.box(GLOWY, s * 0.1625, YI + 0.15, gz + 0.0625, 0.0075, 0.0125, 0.0075, { glow: 1.0 });
    }
    // portcullis (hinged joint, geometry in model space)
    k.scope = "castle.portcullis";
    const pb = { bone: port };
    const pz = gz + 0.05;
    for (let i = -2; i <= 2; i++) k.box(IRON, i * 0.02, YI + 0.01, pz, 0.008, 0.16, 0.008, pb);
    for (const yy of [0.03, 0.07, 0.11, 0.15]) k.box(IRON, 0, YI + yy, pz, 0.09, 0.008, 0.01, pb);
    for (let i = -2; i <= 2; i++) k.box(STEEL, i * 0.02, YI, pz, 0.006, 0.012, 0.006, pb);
    // drawbridge: deck planks, rails, cross ties, chains to the gate corbels
    k.scope = "castle.bridge";
    const bb = { bone: bridge };
    const BL = 0.3;
    const bz0 = gz + 0.075;
    k.box(WOODP, 0, YI - 0.025, bz0 + BL / 2, 0.175, 0.025, BL, bb);
    for (let i = 0; i < 6; i++) k.box(WOOD[0], 0, YI - 0.0, bz0 + 0.025 + i * 0.05, 0.176, 0.003, 0.006, bb);
    for (const s of [1, -1]) {
      k.box(WOOD[1], s * 0.0875, YI, bz0 + BL / 2, 0.0125, 0.025, BL, bb);
      for (let i = 0; i < 4; i++) k.box(WOOD[2], s * 0.0875, YI, bz0 + 0.04 + i * 0.075, 0.0188, 0.04, 0.0188, bb);
      const a = new THREE.Vector3(s * 0.0875, YI + 0.045, bz0 + BL);
      const bpt = new THREE.Vector3(s * 0.0875, gh - 0.0375, bz0 + 0.0);
      for (let i = 0; i <= 14; i++) {
        const p = a.clone().lerp(bpt, i / 14);
        k.box(i % 2 ? IRON : STEEL, p.x, p.y, p.z, 0.0075, 0.0125, 0.0075, bb);
      }
    }
    k.flush();

    // keep
    k.scope = "castle.keep";
    const kx = 0;
    const kz = -0.575;
    const ktop = 1.1 + U;
    k.box(BRICK, kx, YI, kz, 0.325, 0.05, 0.325);
    k.box(BRICK, kx, YI + 0.05, kz, 0.3, ktop - YI - 0.05, 0.3);
    for (const [ox, oz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      k.box(BRICK, kx + ox * 0.15, YI + 0.05, kz + oz * 0.15, 0.05, ktop - YI + 0.05, 0.05); // pilaster buttresses
    k.box(BRICK, kx, ktop - 0.05, kz, 0.325, 0.025, 0.325);
    k.box(BRICK, kx, ktop - 0.025, kz, 0.35, 0.025, 0.35);
    // corner turrets
    for (const [ox, oz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const tx = kx + ox * 0.1625;
      const tz = kz + oz * 0.1625;
      k.box(BRICK, tx, ktop, tz, 0.075, 0.1, 0.075);
      k.box(BRICK, tx, ktop + 0.1, tz, 0.1, 0.0125, 0.1);
      let hh = 0.0375;
      let y = ktop + 0.1125;
      while (hh > 0.005) {
        k.box(RED_ROOF, tx, y, tz, 2 * hh + 0.0125, 0.0125, 2 * hh + 0.0125);
        y += 0.0125;
        hh -= 0.00625;
      }
      k.box(GOLD, tx, y, tz, 0.006, 0.025, 0.006);
    }
    // great roof
    {
      let hh = 0.13;
      let y = ktop;
      while (hh > 0.006) {
        k.box(CASTLE_ROOF, kx, y, kz, 2 * hh, 0.0125, 2 * hh);
        y += 0.0125;
        hh -= 0.0125 * 0.75;
      }
      k.box(GOLD, kx, y, kz, 0.0125, 0.05, 0.0125);
      flagPole(k, kx, y + 0.03, kz, 0.2, PENNANT_RED, 1.3);
    }
    // keep door, stairs, windows, banner
    const KB = { x: kx, z: kz, w: 0.3, d: 0.3 };
    dbox(k, VPLANK, "+z", KB, 0, YI, 0.075, 0.125, 0.02);
    dbox(k, snap("#3c2616"), "+z", KB, 0, YI + 0.125, 0.1, 0.0125, 0.025);
    for (const s of [1, -1]) dbox(k, snap("#3c2616"), "+z", KB, s * 0.0425, YI, 0.0125, 0.125, 0.025);
    dbox(k, GOLD, "+z", KB, 0.02, YI + 0.05, 0.0125, 0.0125, 0.03);
    for (let i = 0; i < 4; i++) k.box(BRICK, kx, YI + i * 0.0125, kz + 0.15 + 0.0125 * (3 - i) + 0.0125, 0.125, 0.0125, 0.0125 + i * 0.0125 * 0);
    for (const face of ["+z", "-z", "+x", "-x"] as Face[])
      for (const a of face === "+z" ? [-0.09, 0.09] : [-0.07, 0.07])
        for (const y of [YI + 0.16, YI + 0.32]) {
          dbox(k, DARK, face, KB, a, y, 0.025, 0.05, 0.01);
          dbox(k, GLOWY, face, KB, a, y + 0.0, 0.0125, 0.0375, 0.012, { glow: 1.1 });
          dbox(k, STONE[4], face, KB, a, y + 0.05, 0.0375, 0.0125, 0.014);
          dbox(k, STONE[4], face, KB, a, y - 0.0125, 0.0375, 0.0125, 0.014);
        }
    k.add("#ffffff", new THREE.PlaneGeometry(0.075, 0.105).translate(kx, YI + 0.38, kz + 0.1525), { tex: BANNER });
    k.flush();

    // halls, stable, smithy, chimneys are in the house table; courtyard dressing
    courtyard(k);
  }

  function courtyard(k: Kit) {
    // well
    k.scope = "castle.well";
    const wx = 0;
    const wz = -0.05;
    const ring = (y: number) => {
      for (const [dx, dz, w2, d2] of [
        [0, 0.0375, 0.1, 0.025],
        [0, -0.0375, 0.1, 0.025],
        [0.0375, 0, 0.025, 0.05],
        [-0.0375, 0, 0.025, 0.05],
      ])
        k.box(BRICK, wx + dx, y, wz + dz, w2, 0.0375, d2);
    };
    ring(YI);
    ring(YI + 0.0375);
    k.box(WATER[2], wx, YI + 0.05, wz, 0.05, 0.0125, 0.05);
    for (const s of [1, -1]) k.box(WOOD[1], wx + s * 0.0475, YI + 0.075, wz, 0.0125, 0.075, 0.0125);
    k.box(WOOD[1], wx, YI + 0.14, wz, 0.1, 0.0125, 0.0125);
    k.box(WOOD[2], wx, YI + 0.1, wz, 0.0075, 0.0075, 0.0075);
    k.box(WOOD[3], wx, YI + 0.1075, wz, 0.003, 0.0325, 0.003);
    k.box(RED_ROOF, wx, YI + 0.1525, wz, 0.125, 0.0125, 0.08);
    k.box(RED_ROOF, wx, YI + 0.165, wz, 0.1, 0.0125, 0.05);
    k.box(RED_ROOF, wx, YI + 0.1775, wz, 0.075, 0.0125, 0.025);
    k.flush();
    // barrels, crates, hay, training dummy, cart
    k.scope = "castle.stores";
    const f = frameAt(k, 0.4, YI, -0.05, 0);
    f.box(WOODP, 0, 0, 0, 0.05, 0.05, 0.05);
    f.box(WOODP, 0.0, 0.05, 0.0, 0.04, 0.04, 0.04);
    f.box(WOODP, 0.0625, 0, 0.0, 0.05, 0.05, 0.05);
    for (let i = 0; i < 3; i++) k.add(BARREL, new THREE.CylinderGeometry(0.0225, 0.0225, 0.05, 8).translate(0.4 - 0.05 + i * 0.05, YI + 0.025, 0.04 + (i % 2) * 0.03));
    k.box(HAYP, -0.38, YI, 0.0, 0.075, 0.05, 0.05);
    k.box(HAYP, -0.38, YI + 0.05, 0.0, 0.05, 0.0375, 0.05);
    // training dummy
    const df = frameAt(k, -0.14, YI, -0.0, 0.4);
    df.box(WOOD[1], 0, 0, 0, 0.0125, 0.06, 0.0125);
    df.box(WOOD[2], 0, 0.04, 0, 0.05, 0.0125, 0.0125);
    df.box(HAY[2], 0, 0.0525, 0, 0.025, 0.03, 0.02);
    df.box(HAY[2], 0, 0.0825, 0, 0.0225, 0.0225, 0.0225);
    df.box(RED, 0, 0.0525, 0.011, 0.03, 0.01, 0.003);
    // chimney smoke from the smithy handled in house()
    k.flush();
    // soldiers
    person(k, 0.1, YI, 0.02, 0, { shirt: STEEL, pants: IRON, hair: IRON, helm: true, plume: RED, spear: true });
    person(k, -0.1, YI, 0.02, 0, { shirt: STEEL, pants: IRON, hair: IRON, helm: true, plume: BLUE, spear: true });
    person(k, 0.25, YI, 0.02, -1.2, { shirt: RED, pants: IRON, hair: snap("#5a3a22") });
    person(k, -0.2, YI, -0.2, 2.0, { shirt: BLUE, pants: IRON, hair: snap("#e0c068"), hat: snap("#2a2a60") });
  }

  function flagPole(k: Kit, x: number, y0: number, z: number, hgt: number, tex: THREE.Texture, scale = 1) {
    const sc = k.scope;
    k.scope = `${sc}.flag`;
    k.box(WOOD[1], x, y0, z, 0.0075, hgt, 0.0075);
    k.box(GOLD, x, y0 + hgt, z, 0.0125, 0.0125, 0.0125);
    const w = 0.075 * scale;
    const hh = 0.0375 * scale;
    k.add("#ffffff", new THREE.BoxGeometry(w, hh, 0.004).translate(x + w / 2 + 0.004, y0 + hgt - hh / 2 - 0.004, z), { tex });
    k.scope = sc;
  }

  function dbox(k: Kit, fill: Fill, face: Face, B: { x: number; z: number; w: number; d: number }, a: number, y0: number, w: number, h: number, t: number, opt?: Opt) {
    const hx = B.w / 2;
    const hz = B.d / 2;
    const e = t / 2 - 0.002;
    let x = 0;
    let z = 0;
    if (face === "+z") {
      x = B.x + a;
      z = B.z + hz + e;
    } else if (face === "-z") {
      x = B.x - a;
      z = B.z - hz - e;
    } else if (face === "+x") {
      x = B.x + hx + e;
      z = B.z - a;
    } else {
      x = B.x - hx - e;
      z = B.z + a;
    }
    const zf = face === "+z" || face === "-z";
    k.box(fill, x, y0, z, zf ? w : t, h, zf ? t : w, opt);
  }

  function person(
    k: Kit,
    x: number,
    y0: number,
    z: number,
    rot: number,
    o: { shirt: string; pants: string; hair: string; hat?: string; helm?: boolean; plume?: string; spear?: boolean; skin?: string; arms?: number },
  ) {
    k.scope = `person.${x.toFixed(2)}.${z.toFixed(2)}`;
    const f = frameAt(k, x, y0, z, rot);
    const skin = o.skin ?? SKIN;
    f.box(o.pants, -0.007, 0, 0, 0.011, 0.025, 0.013);
    f.box(o.pants, 0.007, 0, 0, 0.011, 0.025, 0.013);
    f.box(DARK, -0.007, 0, 0.002, 0.011, 0.005, 0.016);
    f.box(DARK, 0.007, 0, 0.002, 0.011, 0.005, 0.016);
    f.box(o.shirt, 0, 0.025, 0, 0.03, 0.03, 0.018);
    f.box(o.shirt, -0.0185, 0.03, 0, 0.008, 0.025, 0.012);
    f.box(o.shirt, 0.0185, 0.03, 0, 0.008, 0.025, 0.012);
    f.box(skin, -0.0185, 0.0265, 0.0, 0.008, 0.005, 0.012);
    f.box(skin, 0.0185, 0.0265, 0.0, 0.008, 0.005, 0.012);
    f.box(skin, 0, 0.055, 0, 0.0225, 0.0225, 0.0225);
    f.box(o.hair, 0, 0.0675, -0.002, 0.025, 0.01, 0.0255);
    f.box(DARK, -0.005, 0.062, 0.0118, 0.0035, 0.0035, 0.002);
    f.box(DARK, 0.005, 0.062, 0.0118, 0.0035, 0.0035, 0.002);
    if (o.helm) {
      f.box(o.shirt, 0, 0.0725, 0, 0.0275, 0.012, 0.0275);
      if (o.plume) f.box(o.plume, 0, 0.0845, -0.004, 0.006, 0.018, 0.012);
    }
    if (o.hat) {
      f.box(o.hat, 0, 0.0725, 0, 0.035, 0.005, 0.035);
      f.box(o.hat, 0, 0.0775, 0, 0.022, 0.012, 0.022);
    }
    if (o.spear) {
      f.box(WOOD[2], 0.027, 0, 0.005, 0.004, 0.115, 0.004);
      f.box(STEEL, 0.027, 0.115, 0.005, 0.007, 0.014, 0.004);
    }
    k.flush();
  }

  // ============================================================================================================
  function house(k: Kit, h: House) {
    k.scope = `house.${h.id}`;
    k.box(WALLP, h.x, h.y0 - 0.025, h.z, h.w, h.h + 0.025, h.d);
    // roof as a stepped gable extrusion
    const across = (h.ridge === "x" ? h.d : h.w) + 2 * H;
    const along = (h.ridge === "x" ? h.w : h.d) + 2 * H;
    const spans: [number, number][] = [];
    for (let hw = Math.round(across / 2 / H); hw >= 1; hw--) {
      spans.push([-hw, hw]);
      if (h.pitch === 2 && hw > 1) spans.push([-hw, hw]);
    }
    const roofY = h.y0 + h.h;
    const rp = h.id === "tower" || h.id === "nave" ? roofFor("slate", h.ridge) : roofFor(h.roof, h.ridge);
    if (h.id === "tower") {
      // tower: a square spire of stacked slabs instead of a gable
      let hh = h.w / 2 + 0.0125;
      let y = roofY;
      while (hh > 0.006) {
        k.box(CASTLE_ROOF, h.x, y, h.z, 2 * hh, 0.025, 2 * hh);
        y += 0.025;
        hh -= 0.0125;
      }
      k.box(GOLD, h.x, y, h.z, 0.0125, 0.03, 0.0125);
      // belfry openings
      for (const f of ["+z", "-z", "+x", "-x"] as Face[]) {
        dbox(k, DARK, f, h, 0, roofY - 0.1, 0.04, 0.0625, 0.01);
        dbox(k, STONE[4], f, h, 0, roofY - 0.0375, 0.05, 0.0125, 0.014);
      }
    } else {
      b.extrude(stepped(spans, H, { rows: true }), {
        at: [h.x, roofY, h.z],
        x: h.ridge === "z" ? [1, 0, 0] : [0, 0, 1],
        y: [0, 1, 0],
        thickness: along,
        color: rp,
        bone: base,
        name: `roof.${h.id}`,
      });
    }
    // door and windows, trim
    for (const f of ["+z", "-z", "+x", "-x"] as Face[]) {
      const s = slotsFor(h, f);
      const W = faceW(h, f);
      if (s.door) {
        const a = ((s.door.a0 + s.door.a1) / 2 - W / 2) * H;
        dbox(k, ROCK[3], f, h, a, h.y0 - 0.0, 0.1, 0.0125, 0.03); // step
        dbox(k, snap("#3c2616"), f, h, a, h.y0 + s.door.r1 * H, 0.1, 0.0125, 0.02); // canopy beam
        dbox(k, h.roof === "thatch" ? THATCH[2] : h.roof === "slate" ? SLATE[2] : TILE[2], f, h, a, h.y0 + s.door.r1 * H + 0.0125, 0.1, 0.0125, 0.034);
        // lantern by the door
        dbox(k, IRON, f, h, a + 0.06, h.y0 + 0.075, 0.008, 0.025, 0.012);
        dbox(k, GLOWY, f, h, a + 0.06, h.y0 + 0.0775, 0.006, 0.015, 0.016, { glow: 1.2 });
      }
      for (const w of s.wins) {
        const a = ((w.a0 + w.a1) / 2 - W / 2) * H;
        dbox(k, WHITE, f, h, a, h.y0 + (w.r0 - 1) * H, 0.085, 0.0125, 0.02); // sill
        if (h.lit && f === h.face) dbox(k, GLOWY, f, h, a, h.y0 + (w.r0 + 1) * H, 0.025, 0.0375, 0.004, { glow: 1.2 });
        if (h.flowers && w.r0 === 5) {
          dbox(k, WOOD[2], f, h, a, h.y0 + (w.r0 - 1) * H, 0.07, 0.015, 0.025);
          dbox(k, MOSS[1], f, h, a, h.y0 + (w.r0 - 1) * H + 0.015, 0.06, 0.008, 0.02);
          for (let i = -2; i <= 2; i++) {
            const pc = [PINK, YEL, RED, LILAC, WHITE][mod(i + h.id.length, 5)];
            dbox(k, pc, f, h, a + i * 0.0125, h.y0 + (w.r0 - 1) * H + 0.023 + (mod(i, 2) === 0 ? 0.004 : 0), 0.007, 0.007, 0.016);
          }
        }
      }
    }
    // chimney with smoke
    if (h.chimney) {
      const [cxo, czo] = h.chimney;
      const cx = h.x + cxo;
      const cz = h.z + czo;
      const top = ridgeY(h) - 0.005;
      const sx = Math.round(cx / 0.0125) * 0.0125;
      const sz = Math.round(cz / 0.0125) * 0.0125;
      k.box(BRICKS_RED, sx, h.y0 + h.h * 0.8, sz, 0.0375, top - (h.y0 + h.h * 0.8) + 0.02, 0.0375);
      k.box(STONE[1], sx, top + 0.02, sz, 0.05, 0.0125, 0.05);
      k.box(DARK, sx, top + 0.0325, sz, 0.025, 0.002, 0.025);
      for (let i = 0; i < 4; i++) k.box(i % 2 ? SMOKE : WHITE, sx + i * 0.008, top + 0.045 + i * 0.03, sz + (i % 2) * 0.006, 0.02 + i * 0.008, 0.02 + i * 0.008, 0.02 + i * 0.008);
    }
    k.flush();
  }

  // ============================================================================================================
  function village(k: Kit, wheel: Joint, vane: Joint, sails: Joint) {
    // tavern sign
    k.scope = "tavern.sign";
    const T0 = HOUSES.find((q) => q.id === "tav")!;
    const sx = T0.x + 0.0;
    const sz = T0.z + T0.d / 2;
    k.box(WOOD[1], sx - 0.1, T0.y0 + 0.125, sz + 0.0125, 0.0125, 0.0125, 0.075);
    k.box(WOOD[1], sx - 0.1, T0.y0 + 0.125, sz + 0.0625, 0.075, 0.0125, 0.0125);
    for (const dx of [-0.025, 0.025]) k.box(IRON, sx - 0.1 + dx, T0.y0 + 0.0875, sz + 0.0625, 0.004, 0.0375, 0.004);
    k.add("#ffffff", new THREE.BoxGeometry(0.0625, 0.05, 0.006).translate(sx - 0.1, T0.y0 + 0.0625, sz + 0.0625), { tex: SIGN });
    k.flush();

    // church extras: nave windows, door, buttresses, graveyard, weathervane
    k.scope = "church";
    const nave = HOUSES.find((q) => q.id === "nave")!;
    for (const f of ["+x", "-x"] as Face[]) {
      for (const a of [-0.07, 0.07]) {
        dbox(k, DARK, f, nave, a, nave.y0 + 0.08, 0.0275, 0.075, 0.01);
        dbox(k, snap("#e84860"), f, nave, a, nave.y0 + 0.095, 0.0125, 0.0125, 0.012, { glow: 0.9 });
        dbox(k, snap("#4a8ae8"), f, nave, a, nave.y0 + 0.11, 0.0125, 0.0125, 0.012, { glow: 0.9 });
        dbox(k, YEL, f, nave, a, nave.y0 + 0.0825, 0.0125, 0.0125, 0.012, { glow: 0.9 });
        dbox(k, STONE[4], f, nave, a, nave.y0 + 0.155, 0.0375, 0.0125, 0.014);
      }
      for (const a of [-0.1, 0.0, 0.1]) dbox(k, STONE[3], f, nave, a, nave.y0, 0.025, 0.13, 0.03);
    }
    // round window on the nave gable (back) and a small cross
    dbox(k, GLASS, "-z", nave, 0, nave.y0 + 0.2, 0.05, 0.05, 0.01);
    dbox(k, snap("#e84860"), "-z", nave, 0, nave.y0 + 0.2125, 0.025, 0.025, 0.012, { glow: 0.9 });
    k.box(GOLD, nave.x, ridgeY(nave) - 0.01, nave.z - 0.145, 0.0075, 0.045, 0.0075);
    k.box(GOLD, nave.x, ridgeY(nave) + 0.012, nave.z - 0.145, 0.03, 0.0075, 0.0075);
    // churchyard fence and gravestones
    for (const [gx, gzz] of [
      [1.42, 0.55],
      [1.42, 0.7],
      [1.42, 0.85],
      [1.12, 0.62],
      [1.12, 0.8],
    ])
      k.box(ROCK[3], gx, G, gzz, 0.02, 0.04, 0.0075);
    k.flush();
    // weathervane
    k.scope = "church.vane";
    const vb = { bone: vane };
    const vx = 1.275;
    const vz = 0.95;
    const vy = 0.955; // tip of the spire
    k.box(IRON, vx, vy, vz, 0.006, 0.04, 0.006, vb);
    k.box(IRON, vx, vy + 0.03, vz, 0.07, 0.006, 0.006, vb);
    k.box(GOLD, vx + 0.036, vy + 0.0265, vz, 0.012, 0.015, 0.006, vb);
    k.box(GOLD, vx - 0.034, vy + 0.0325, vz, 0.018, 0.018, 0.004, vb);
    k.box(RED, vx - 0.03, vy + 0.0225, vz, 0.012, 0.008, 0.004, vb);
    k.flush();

    // watermill: wheel in the canal
    k.scope = "mill.wheel";
    const wb = { bone: wheel };
    const R = 0.095;
    // wheel plane is x-y at the joint (centre = joint), axle along z
    const wg = (w2: number, h2: number, d2: number, px: number, py: number, pz: number, rz: number) =>
      new THREE.BoxGeometry(w2, h2, d2).rotateZ(rz).translate(px, py, pz);
    // geometry is built around the wheel centre and positioned by joint at (-0.55, 0.37, 0.97)
    const cxw = -0.55;
    const cyw = 0.37;
    const czw = 0.97;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      for (const dz of [-0.022, 0.022]) {
        k.add(WOOD[1], wg(0.01, R * 2 - 0.02, 0.01, 0, 0, dz, ang).translate(cxw, cyw, czw), wb);
      }
    }
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const px = Math.cos(ang) * R;
      const py = Math.sin(ang) * R;
      for (const dz of [-0.026, 0.026]) k.add(WOOD[2], wg(0.026, 0.012, 0.008, px, py, dz, ang + Math.PI / 2).translate(cxw, cyw, czw), wb);
      k.add(WOOD[3], wg(0.012, 0.03, 0.05, px * 1.05, py * 1.05, 0, ang + Math.PI / 2).translate(cxw, cyw, czw), wb);
    }
    k.add(IRON, new THREE.BoxGeometry(0.02, 0.02, 0.07).translate(cxw, cyw, czw), wb);
    k.flush();

    // windmill (tower on terrain, sails on a hinge)
    k.scope = "windmill";
    const mx = 1.3;
    const mz = -1.3;
    const mcol = cellPaint(H, (c) => {
      if (c.n.y > 0.5) return WHITE;
      const row = Math.floor(c.v / 3);
      if (mod(c.v, 3) === 0 || mod(c.u + mod(row, 2) * 2, 4) === 0) return PLASTER[0][0];
      return c.pick(PLASTER[0], 0.55 + (c.random(1) - 0.5) * 0.4);
    });
    label("windmillwall", mcol);
    const layers = 11;
    for (let i = 0; i < layers; i++) {
      const wdt = 0.2 - i * 0.00625 * 2 * 0.8;
      k.box(mcol, mx, G - 0.025 + i * 0.05, mz, Math.round(wdt / 0.0125) * 0.0125, 0.05, Math.round(wdt / 0.0125) * 0.0125);
    }
    const cap = G - 0.025 + layers * 0.05;
    k.box(BRICK, mx, cap, mz, 0.15, 0.0125, 0.15);
    let hh = 0.0875;
    let y = cap + 0.0125;
    while (hh > 0.006) {
      k.box(roofFor("shake", "x"), mx, y, mz, 2 * hh, 0.0125, 2 * hh);
      y += 0.0125;
      hh -= 0.0125;
    }
    k.box(WOOD[1], mx, y, mz, 0.0125, 0.025, 0.0125);
    // door and windows
    const WM = { x: mx, z: mz, w: 0.2 - 0.1, d: 0.2 - 0.1 };
    dbox(k, snap("#3c2616"), "+z", { x: mx, z: mz, w: 0.125, d: 0.125 }, 0, G, 0.05, 0.075, 0.02);
    dbox(k, GLASS, "+z", { x: mx, z: mz, w: 0.1, d: 0.1 }, 0, G + 0.3, 0.03, 0.04, 0.02);
    dbox(k, GLASS, "+x", WM, 0, G + 0.2, 0.03, 0.04, 0.02);
    dbox(k, GLASS, "-x", WM, 0, G + 0.2, 0.03, 0.04, 0.02);
    k.box(WOOD[1], mx, 0.6, mz + 0.0825, 0.03, 0.03, 0.045); // axle housing
    k.flush();
    k.scope = "windmill.sails";
    const sb = { bone: sails };
    const hubx = 1.3;
    const huby = 0.62;
    const hubz = -1.2;
    k.add(WOOD[1], new THREE.BoxGeometry(0.03, 0.03, 0.04).translate(hubx, huby, hubz + 0.005), sb);
    k.add(GOLD, new THREE.BoxGeometry(0.015, 0.015, 0.015).translate(hubx, huby, hubz + 0.03), sb);
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2 + Math.PI / 4;
      const arm = (w: number, h: number, d: number, ox: number, oy: number, oz: number) =>
        new THREE.BoxGeometry(w, h, d).translate(ox, oy, 0).rotateZ(ang).translate(hubx, huby, hubz + oz);
      k.add(WOOD[1], arm(0.012, 0.23, 0.012, 0, 0.115, 0.012), sb); // spar
      k.add(CLOTH, arm(0.05, 0.16, 0.006, 0.031, 0.1, 0), sb); // canvas
      k.add(WOOD[2], arm(0.006, 0.16, 0.01, 0.058, 0.1, 0), sb); // outer rib
      for (const ry of [0.04, 0.08, 0.12, 0.16, 0.18]) k.add(WOOD[2], arm(0.056, 0.006, 0.01, 0.031, ry, 0), sb); // rungs
    }
    k.flush();

    // canal footbridge, market stall, well, haystacks, fences, signposts
    k.scope = "footbridge";
    k.box(WOODP, -1.0, G - 0.01, 0.95, 0.075, 0.015, 0.14);
    for (const s of [1, -1]) {
      k.box(WOOD[1], -1.0 + s * 0.0375, G, 0.95, 0.008, 0.03, 0.14);
      for (const t of [-0.065, 0.065]) k.box(WOOD[2], -1.0 + s * 0.0375, G - 0.01, 0.95 + t, 0.012, 0.04, 0.012);
    }
    k.flush();

    k.scope = "stall";
    const AW = AWNING(RED, WHITE);
    const stx = 0.35;
    const stz = 1.0;
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      k.box(WOOD[1], stx + dx * 0.05, G, stz + dz * 0.035, 0.0125, 0.1, 0.0125);
    k.box(WOOD[2], stx, G + 0.03, stz + 0.02, 0.1, 0.03, 0.025);
    k.box(AW, stx, G + 0.1, stz, 0.125, 0.0125, 0.0875);
    k.box(AW, stx, G + 0.1125, stz - 0.01, 0.125, 0.0125, 0.0625);
    k.box(AW, stx, G + 0.125, stz - 0.02, 0.125, 0.0125, 0.0375);
    for (let i = 0; i < 6; i++) k.box([RED, YEL, snap("#f0a030"), snap("#6cba46"), snap("#f08ab0"), snap("#e8e0c8")][i], stx - 0.04 + i * 0.016, G + 0.06, stz + 0.02, 0.012, 0.012, 0.012);
    k.flush();

    // village well with a little tiled roof
    k.scope = "plaza.well";
    const wx = 0.19;
    const wz = 1.0;
    for (const y of [G, G + 0.0375])
      for (const [dx, dz, w2, d2] of [
        [0, 0.0375, 0.1, 0.025],
        [0, -0.0375, 0.1, 0.025],
        [0.0375, 0, 0.025, 0.05],
        [-0.0375, 0, 0.025, 0.05],
      ])
        k.box(ROCKP, wx + dx, y, wz + dz, w2, 0.0375, d2);
    k.box(WATER[2], wx, G + 0.045, wz, 0.05, 0.01, 0.05);
    for (const s of [1, -1]) k.box(WOOD[1], wx + s * 0.0475, G + 0.075, wz, 0.0125, 0.075, 0.0125);
    k.box(WOOD[1], wx, G + 0.14, wz, 0.1, 0.0125, 0.0125);
    k.box(WOOD[3], wx, G + 0.1, wz, 0.006, 0.04, 0.006);
    k.box(WOOD[2], wx, G + 0.09, wz, 0.0225, 0.0125, 0.0225);
    k.box(RED_ROOF, wx, G + 0.1525, wz, 0.125, 0.0125, 0.08);
    k.box(RED_ROOF, wx, G + 0.165, wz, 0.1, 0.0125, 0.05);
    k.box(RED_ROOF, wx, G + 0.1775, wz, 0.075, 0.0125, 0.025);
    k.flush();

    // notice board, laundry line, market cart, flour sacks, benches
    k.scope = "plaza.props";
    for (const s of [1, -1]) k.box(WOOD[1], -0.17 + s * 0.03, G, 1.05, 0.0125, 0.075, 0.0125);
    k.box(WOODP, -0.17, G + 0.045, 1.05, 0.0875, 0.0525, 0.008);
    for (const [dx, dy, c2] of [
      [-0.025, 0.0, WHITE],
      [0.005, 0.005, snap("#f0e0a0")],
      [0.03, 0.0, snap("#f0c0c0")],
    ] as const)
      k.box(c2, -0.17 + dx, G + 0.055 + dy, 1.057, 0.02, 0.025, 0.003);
    for (const px of [0.36, 0.49]) k.box(WOOD[1], px, G, 1.28, 0.008, 0.11, 0.008);
    k.box(DARK, 0.425, G + 0.1, 1.28, 0.13, 0.002, 0.002);
    for (const [dx, c2, hh] of [
      [-0.04, WHITE, 0.045],
      [-0.005, RED, 0.035],
      [0.03, BLUE, 0.05],
    ] as const)
      k.box(c2, 0.425 + dx, G + 0.1 - hh, 1.28, 0.025, hh, 0.004);
    const cart = frameAt(k, -0.62, G, 1.4, 0.2);
    cart.box(WOODP, 0, 0.025, 0, 0.1, 0.012, 0.06);
    for (const s of [1, -1]) {
      cart.box(WOOD[2], s * 0.05, 0.025, 0, 0.006, 0.025, 0.06);
      cart.box(WOOD[2], 0, 0.025, s * 0.03, 0.1, 0.025, 0.006);
      cart.box(WOOD[3], s * 0.03, 0.018, -0.05, 0.006, 0.006, 0.06); // shafts
    }
    cart.box(HAYP, 0, 0.037, 0, 0.085, 0.03, 0.05);
    for (const s of [1, -1]) k.add(WOOD[1], new THREE.CylinderGeometry(0.022, 0.022, 0.008, 8).rotateZ(Math.PI / 2).rotateY(0.2).translate(-0.62 + s * 0.055 * Math.cos(0.2), G + 0.022, 1.4 - s * 0.055 * Math.sin(0.2)));
    for (const [sx, sz] of [
      [-0.46, 1.255],
      [-0.435, 1.265],
      [-0.45, 1.27],
    ]) {
      k.box(PLASTER[0][2], sx, G, sz, 0.022, 0.03, 0.018);
      k.box(PLASTER[0][1], sx, G + 0.03, sz, 0.01, 0.008, 0.01);
    }
    for (const [bx0, bz0] of [
      [0.5, 1.36],
      [0.8, 1.36],
    ]) {
      k.box(WOOD[2], bx0, G + 0.02, bz0, 0.08, 0.008, 0.02);
      for (const s of [1, -1]) k.box(WOOD[1], bx0 + s * 0.03, G, bz0, 0.01, 0.02, 0.016);
    }
    k.flush();

    // fences along yards
    k.scope = "fences";
    const fence = (x0: number, z0: number, x1: number, z1: number, y: number) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const n = Math.max(1, Math.round(len / 0.05));
      const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      for (let i = 0; i <= n; i++) {
        const px = x0 + ((x1 - x0) * i) / n;
        const pz = z0 + ((z1 - z0) * i) / n;
        k.box(WOOD[2], px, y, pz, 0.0125, 0.0425, 0.0125);
      }
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;
      k.box(WOOD[3], mx, y + 0.015, mz, alongX ? len : 0.006, 0.008, alongX ? 0.006 : len);
      k.box(WOOD[3], mx, y + 0.03, mz, alongX ? len : 0.006, 0.008, alongX ? 0.006 : len);
    };
    fence(-1.05, 1.47, -0.1, 1.47, G);
    fence(0.1, 1.47, 1.2, 1.47, G);
    fence(1.15, 0.45, 1.45, 0.45, G);
    fence(1.45, 0.45, 1.45, 1.05, G);
    fence(1.15, 1.05, 1.15, 1.2, G);
    fence(1.35, -0.95, 1.35, 0.4, G);
    fence(-1.35, -0.95, -1.35, 0.4, G);
    k.flush();

    // people, animals and small stories
    person(k, -0.05, G, 1.03, 0.6, { shirt: snap("#e8a030"), pants: snap("#3a3a60"), hair: snap("#4a2c1a"), hat: snap("#6a3a1a") });
    person(k, 0.2, G, 1.05, -2.2, { shirt: snap("#3aa860"), pants: snap("#5a4a3a"), hair: snap("#e0c068"), skin: SKIN2 });
    person(k, 0.55, G, 1.02, 3.0, { shirt: snap("#a050c8"), pants: snap("#3a3a60"), hair: snap("#2a1a14"), hat: snap("#a050c8") });
    person(k, 0.1, G, 1.35, 1.0, { shirt: snap("#d8d0c0"), pants: snap("#6a5a40"), hair: snap("#8a8a98"), skin: SKIN2 });
    person(k, -1.1, G, 1.4, 0.3, { shirt: snap("#3a8ad0"), pants: snap("#5a4a3a"), hair: snap("#4a2c1a"), hat: snap("#e8c060") });
    person(k, 1.4, G, -0.2, 1.57, { shirt: snap("#c85a3a"), pants: snap("#5a4a3a"), hair: snap("#5a3a22"), hat: snap("#d8b858") });
    person(k, 0.0, hAt(0, 0.45), 0.45, 3.14, { shirt: RED, pants: IRON, hair: IRON, helm: true, plume: RED, spear: true });

    // pigeons and a cat on the roofs, bunting across the lane
    k.scope = "roofPets";
    const pigeon = (x: number, y: number, z: number, rot: number) => {
      const f = frameAt(k, x, y, z, rot);
      f.box(snap("#9aa0b8"), 0, 0.006, 0, 0.012, 0.012, 0.02);
      f.box(snap("#7a82a0"), 0, 0.012, 0.011, 0.008, 0.01, 0.008);
      f.box(GOLD, 0, 0.014, 0.017, 0.003, 0.003, 0.004);
      f.box(snap("#7a82a0"), 0, 0.009, -0.013, 0.008, 0.004, 0.008);
    };
    const tav = HOUSES.find((q) => q.id === "tav")!;
    const h3 = HOUSES.find((q) => q.id === "h3")!;
    pigeon(0.55, ridgeY(tav), tav.z, 1.2);
    pigeon(0.62, ridgeY(tav), tav.z, 4.4);
    pigeon(0.9, ridgeY(tav), tav.z, 1.57);
    const cat = frameAt(k, 0.3, ridgeY(h3), h3.z, 1.57);
    cat.box(snap("#3a3a48"), 0, 0.006, 0, 0.014, 0.014, 0.03);
    cat.box(snap("#3a3a48"), 0, 0.012, 0.018, 0.013, 0.013, 0.013);
    cat.box(snap("#3a3a48"), 0.0045, 0.024, 0.018, 0.004, 0.005, 0.004);
    cat.box(snap("#3a3a48"), -0.0045, 0.024, 0.018, 0.004, 0.005, 0.004);
    cat.box(snap("#3a3a48"), 0, 0.012, -0.02, 0.005, 0.02, 0.005);
    cat.box(YEL, 0, 0.0155, 0.0245, 0.009, 0.003, 0.002);
    const bunt = [RED, YEL, BLUE, WHITE, snap("#3aa860"), PINK];
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.5) / 12;
      const bx0 = -0.145 + t * 0.29;
      const sag = 0.026 * (1 - (2 * t - 1) ** 2);
      const by = G + 0.185 - 0.05 * t - sag;
      k.box(bunt[i % bunt.length], bx0, by - 0.014, 1.2, 0.014, 0.014, 0.002);
      k.box(bunt[i % bunt.length], bx0, by - 0.022, 1.2, 0.008, 0.008, 0.002);
      k.box(DARK, bx0, by, 1.2, 0.0125, 0.003, 0.003);
    }
    k.flush();

    animals(k);
  }

  function animals(k: Kit) {
    k.scope = "animals";
    const sheep = (x: number, y: number, z: number, rot: number) => {
      const f = frameAt(k, x, y, z, rot);
      f.box(WHITE, 0, 0.012, 0, 0.04, 0.032, 0.05);
      f.box(snap("#d8d2c0"), 0, 0.012, -0.0, 0.043, 0.01, 0.045);
      f.box(DARK, 0, 0.02, 0.03, 0.02, 0.022, 0.018);
      for (const [lx, lz] of [
        [-0.013, -0.018],
        [0.013, -0.018],
        [-0.013, 0.018],
        [0.013, 0.018],
      ])
        f.box(DARK, lx, 0, lz, 0.006, 0.014, 0.006);
    };
    for (const [sx, sz, sr] of [
      [1.0, -0.05, 1.5],
      [1.05, -0.2, 2.2],
      [0.95, -0.3, 0.6],
      [-1.0, -0.15, 0.9],
      [-1.05, 0.0, 4.0],
    ])
      sheep(sx, hAt(sx, sz), sz, sr);
    // chickens near the cottage
    const hen = (x: number, z: number, rot: number) => {
      const f = frameAt(k, x, G, z, rot);
      f.box(WHITE, 0, 0.008, 0, 0.014, 0.014, 0.02);
      f.box(WHITE, 0, 0.018, 0.011, 0.01, 0.012, 0.008);
      f.box(RED, 0, 0.03, 0.011, 0.004, 0.004, 0.006);
      f.box(GOLD, 0, 0.022, 0.017, 0.004, 0.004, 0.005);
      f.box(WHITE, 0, 0.018, -0.012, 0.006, 0.014, 0.004);
    };
    hen(-1.15, 0.38, 0.7);
    hen(-1.2, 0.34, 2.4);
    hen(-1.1, 0.3, 4.0);
    // ducks on the moat and pond
    const duck = (x: number, z: number, rot: number) => {
      const f = frameAt(k, x, WY, z, rot);
      f.box(WHITE, 0, 0, 0, 0.02, 0.012, 0.03);
      f.box(snap("#2a6a3a"), 0, 0.012, 0.014, 0.012, 0.012, 0.012);
      f.box(GOLD, 0, 0.012, 0.022, 0.008, 0.004, 0.008);
    };
    duck(0.5, 0.28, 1.0);
    duck(0.58, 0.24, 1.4);
    duck(-0.45, -1.1, -0.4);
    duck(-0.75, -0.3, 2.4);
    // a dog by the tavern door
    const dog = frameAt(k, 0.58, G, 1.34, 4.2);
    dog.box(snap("#a8703a"), 0, 0.012, 0, 0.016, 0.018, 0.034);
    dog.box(snap("#a8703a"), 0, 0.022, 0.02, 0.014, 0.014, 0.014);
    dog.box(DARK, 0, 0.026, 0.028, 0.006, 0.006, 0.004);
    dog.box(snap("#6a4020"), 0.007, 0.03, 0.017, 0.004, 0.01, 0.006);
    dog.box(snap("#6a4020"), -0.007, 0.03, 0.017, 0.004, 0.01, 0.006);
    dog.box(snap("#a8703a"), 0, 0.026, -0.02, 0.005, 0.016, 0.006);
    for (const [lx, lz] of [
      [-0.005, -0.012],
      [0.005, -0.012],
      [-0.005, 0.012],
      [0.005, 0.012],
    ])
      dog.box(snap("#6a4020"), lx, 0, lz, 0.005, 0.012, 0.005);
    const pduck = frameAt(k, -1.3, 0.275, 1.25, 0.5);
    pduck.box(WHITE, 0, 0, 0, 0.02, 0.012, 0.03);
    pduck.box(snap("#2a6a3a"), 0, 0.012, 0.014, 0.012, 0.012, 0.012);
    pduck.box(GOLD, 0, 0.012, 0.022, 0.008, 0.004, 0.008);
    // row boat on the moat
    const bt = frameAt(k, -0.7, WY, 0.1, 0.0);
    bt.box(WOOD[2], 0, 0.0, 0, 0.05, 0.012, 0.11);
    bt.box(WOOD[1], -0.025, 0.012, 0, 0.006, 0.014, 0.1);
    bt.box(WOOD[1], 0.025, 0.012, 0, 0.006, 0.014, 0.1);
    bt.box(WOOD[3], 0, 0.012, -0.05, 0.05, 0.012, 0.006);
    bt.box(WOOD[3], 0, 0.012, 0.05, 0.03, 0.02, 0.006);
    bt.box(WOOD[3], 0, 0.0125, 0.0, 0.044, 0.005, 0.01);
    k.flush();
  }

  // ============================================================================================================
  function nature(k: Kit, r: () => number) {
    const taken: [number, number, number][] = [];
    const free = (x: number, z: number, rad: number) => {
      const col = colOf(x, z);
      if (col.kind === "island" || col.kind === "moat" || col.kind === "bank" || col.kind === "stream" || col.kind === "road") return false;
      if (patchAt(x, z)) return false;
      if (HOUSES.some((q) => Math.abs(x - q.x) < q.w / 2 + rad + 0.03 && Math.abs(z - q.z) < q.d / 2 + rad + 0.03)) return false;
      if (Math.hypot(x + 0.55, z - 0.97) < 0.2) return false;
      if (Math.abs(x - 1.3) < 0.28 && Math.abs(z + 1.17) < 0.28) return false;
      // keep the stream's banks and the foot of the road clear
      if (nearAny(x, z, 0.06, (q) => q.kind === "stream" || q.kind === "road" || q.kind === "moat")) return false;
      return !taken.some(([tx, tz, tr]) => Math.hypot(tx - x, tz - z) < tr + rad);
    };
    const nearAny = (x: number, z: number, rad: number, test: (q: Col) => boolean) => {
      for (const [dx, dz] of [
        [rad, 0],
        [-rad, 0],
        [0, rad],
        [0, -rad],
      ]) {
        const xx = x + dx;
        const zz = z + dz;
        if (xx < X0 || xx > -X0 || zz < Z0 || zz > -Z0) continue;
        if (test(colOf(xx, zz))) return true;
      }
      return false;
    };

    // trees
    k.scope = "trees";
    let placedTrees = 0;
    for (let tries = 0; tries < 900 && placedTrees < 34; tries++) {
      const x = X0 + 0.1 + r() * 2.8;
      const z = Z0 + 0.1 + r() * 2.8;
      const pine = r() < 0.5;
      const rad = pine ? 0.08 : 0.1;
      if (z > 0.8 && Math.abs(x) < 1.1 && !(colOf(x, z).h > G)) continue;
      if (!free(x, z, rad)) continue;
      taken.push([x, z, rad]);
      placedTrees++;
      const y = hAt(x, z);
      const sc = 0.85 + r() * 0.5;
      if (pine) pineTree(k, x, y, z, sc);
      else {
        const autumn = r() < 0.12;
        roundTree(k, x, y, z, sc, autumn ? AUTUMNP : LEAFP, !autumn && r() < 0.4);
      }
    }
    k.flush();

    // rocks, bushes, flowers, tufts
    k.scope = "rocks";
    for (let i = 0, n = 0; i < 400 && n < 22; i++) {
      const x = X0 + 0.1 + r() * 2.8;
      const z = Z0 + 0.1 + r() * 2.8;
      if (!free(x, z, 0.04)) continue;
      taken.push([x, z, 0.03]);
      n++;
      const y = hAt(x, z);
      const s = 0.8 + r();
      k.box(ROCKP, x, y - 0.005, z, 0.05 * s, 0.03 * s, 0.04 * s);
      k.box(ROCKP, x + 0.02 * s, y + 0.02 * s, z + 0.005, 0.03 * s, 0.02 * s, 0.03 * s);
      if (r() < 0.5) k.box(ROCKP, x - 0.035 * s, y - 0.005, z + 0.02, 0.025 * s, 0.02 * s, 0.025 * s);
    }
    k.flush();
    k.scope = "bushes";
    for (let i = 0, n = 0; i < 500 && n < 26; i++) {
      const x = X0 + 0.1 + r() * 2.8;
      const z = Z0 + 0.1 + r() * 2.8;
      if (!free(x, z, 0.04)) continue;
      taken.push([x, z, 0.03]);
      n++;
      const y = hAt(x, z);
      const s = 0.8 + r() * 0.6;
      k.box(LEAFP, x, y - 0.005, z, 0.06 * s, 0.035 * s, 0.05 * s);
      k.box(LEAFP, x + 0.01, y + 0.03 * s, z, 0.04 * s, 0.025 * s, 0.035 * s);
      if (r() < 0.4) for (let j = 0; j < 3; j++) k.box([PINK, YEL, RED][j % 3], x - 0.02 + j * 0.02, y + 0.02 * s + 0.01 * (j % 2), z + 0.027 * s, 0.006, 0.006, 0.006);
    }
    k.flush();
    k.scope = "flowers";
    for (let i = 0, n = 0; i < 1200 && n < 130; i++) {
      const x = X0 + 0.02 + r() * 2.96;
      const z = Z0 + 0.02 + r() * 2.96;
      const col = colOf(x, z);
      if (col.kind === "island" || col.kind === "moat" || col.kind === "stream" || col.kind === "road") continue;
      if (patchAt(x, z) || HOUSES.some((q) => Math.abs(x - q.x) < q.w / 2 + 0.02 && Math.abs(z - q.z) < q.d / 2 + 0.02)) continue;
      if (col.kind === "bank" && nearAny(x, z, 0.05, (q) => q.kind === "moat")) continue;
      n++;
      const y = col.h;
      const c = [PINK, YEL, WHITE, LILAC, RED][n % 5];
      k.box(c, x, y - 0.001, z, 0.0075, 0.0095, 0.0075);
    }
    k.flush();
    // lily pads and reeds
    k.scope = "pond";
    for (const [px, pz] of [
      [-1.35, 1.1],
      [-1.25, 1.2],
      [-1.4, 1.22],
      [-1.22, 1.03],
      [-1.3, 0.95],
    ]) {
      k.box(snap("#3a9a3a"), px, 0.275, pz, 0.035, 0.003, 0.035);
      if (px < -1.3) k.box(PINK, px, 0.278, pz, 0.012, 0.006, 0.012);
    }
    let pads = 0;
    for (let ix = 0; ix < NC; ix++)
      for (let iz = 0; iz < NC; iz++) {
        const col = cols[ix][iz];
        const roll = hash(ix, iz, 77);
        if (col.kind !== "moat" || roll > 0.28) continue;
        const px = X0 + (ix + 0.2 + 0.6 * hash(ix, iz, 78)) * COL;
        const pz = Z0 + (iz + 0.2 + 0.6 * hash(ix, iz, 79)) * COL;
        pads++;
        k.box(snap("#3a9a3a"), px, WY, pz, 0.03, 0.003, 0.03);
        if (pads % 3 === 0) k.box(pads % 2 ? PINK : WHITE, px, WY + 0.003, pz, 0.01, 0.006, 0.01);
      }
    // cattails on the banks of the moat and pond
    for (const [rx, rz, ry] of [
      [-1.2, 1.38, G],
      [-1.25, 1.4, G],
      [-1.18, 1.36, G],
      [-1.46, 0.88, G],
      [-1.42, 0.86, G],
      [-0.52, 0.5, hAt(-0.52, 0.5)],
      [0.52, 0.5, hAt(0.52, 0.5)],
      [-0.6, -1.04, hAt(-0.6, -1.04)],
      [0.6, -1.04, hAt(0.6, -1.04)],
      [0.82, -0.1, hAt(0.82, -0.1)],
      [-0.82, -0.7, hAt(-0.82, -0.7)],
    ]) {
      k.box(snap("#4a7a30"), rx, ry - 0.01, rz, 0.005, 0.07, 0.005);
      k.box(BARK, rx, ry + 0.05, rz, 0.01, 0.025, 0.01);
      k.box(snap("#4a7a30"), rx + 0.012, ry - 0.01, rz + 0.006, 0.005, 0.05, 0.005);
    }
    k.flush();
    // fisherman on the pond bank
    person(k, -1.36, G, 1.36, Math.PI, { shirt: snap("#c85a3a"), pants: snap("#3a3a60"), hair: snap("#5a3a22"), hat: snap("#d8b858") });
    k.scope = "fishing";
    const fr = frameAt(k, -1.36, G, 1.36, Math.PI);
    fr.box(WOOD[3], 0.0, 0.05, 0.02, 0.004, 0.004, 0.11);
    fr.box(DARK, 0.0, -0.025, 0.13, 0.0015, 0.075, 0.0015);
    fr.box(RED, 0.0, -0.028, 0.13, 0.008, 0.008, 0.008);
    k.flush();
    // log pile + firewood by the cottage
    k.scope = "wood";
    for (let i = 0; i < 3; i++) for (let j = 0; j <= 2 - i; j++) k.add(WOOD[2], new THREE.CylinderGeometry(0.009, 0.009, 0.06, 6).rotateZ(Math.PI / 2).translate(-1.4 + 0.0, G + 0.01 + i * 0.016, 0.7 + j * 0.02 + i * 0.01));
    // hay bales near the barn
    k.box(HAYP, -1.38, G, -1.08, 0.05, 0.04, 0.05);
    k.box(HAYP, -1.3, G, -1.05, 0.05, 0.04, 0.05);
    k.box(HAYP, -1.34, G + 0.04, -1.06, 0.05, 0.04, 0.05);
    // barrels and crates by the tavern
    for (let i = 0; i < 3; i++) k.add(BARREL, new THREE.CylinderGeometry(0.0225, 0.0225, 0.05, 8).translate(0.88, G + 0.025, 1.12 + i * 0.045));
    k.box(WOODP, 0.86, G, 1.3 + 0.0, 0.04, 0.04, 0.04);
    // signpost at the foot of the castle road
    k.box(WOOD[1], 0.17, G, 1.38, 0.0125, 0.125, 0.0125);
    for (const [sy, sl, sd] of [
      [0.095, 0.055, 1],
      [0.07, 0.045, -1],
    ] as const) {
      k.box(WOOD[3], 0.17 + sd * 0.0225, G + sy, 1.38, sl, 0.02, 0.006);
      k.box(WOOD[3], 0.17 + sd * (0.0225 + sl / 2 + 0.005), G + sy + 0.005, 1.38, 0.01, 0.01, 0.006);
    }
    k.box(GOLD, 0.17, G + 0.125, 1.38, 0.0125, 0.0125, 0.0125);
    // scarecrows in the crop strips
    for (const [sx, sz, rot] of [
      [1.425, -0.4, -1.57],
      [-1.425, -0.55, 1.57],
    ]) {
      const sc = frameAt(k, sx, G, sz, rot);
      sc.box(WOOD[1], 0, 0, 0, 0.008, 0.1, 0.008);
      sc.box(WOOD[2], 0, 0.07, 0, 0.07, 0.008, 0.008);
      sc.box(snap("#6a7ac8"), 0, 0.045, 0, 0.03, 0.035, 0.014);
      sc.box(HAY[2], 0, 0.08, 0, 0.022, 0.022, 0.022);
      sc.box(snap("#d8b858"), 0, 0.1, 0, 0.04, 0.005, 0.04);
      sc.box(snap("#d8b858"), 0, 0.105, 0, 0.022, 0.012, 0.022);
      sc.box(DARK, -0.005, 0.088, 0.012, 0.004, 0.004, 0.002);
      sc.box(DARK, 0.005, 0.088, 0.012, 0.004, 0.004, 0.002);
      sc.box(DARK, 0.0, 0.112, 0.036, 0.01, 0.01, 0.014); // crow on the arm
    }
    k.flush();
    // rock path markers up the hill and wall lanterns on the road
    k.scope = "roadside";
    for (const s of [1, -1])
      for (const lz of [0.5, 0.7, 0.9, 1.1, 1.3]) {
        const ly = hAt(s * 0.14, lz);
        k.box(WOOD[1], s * 0.14, ly, lz, 0.0125, 0.075, 0.0125);
        k.box(IRON, s * 0.14, ly + 0.0625, lz, 0.025, 0.0125, 0.025);
        k.box(GLOWY, s * 0.14, ly + 0.075, lz, 0.0175, 0.02, 0.0175, { glow: 1.3 });
        k.box(IRON, s * 0.14, ly + 0.095, lz, 0.025, 0.0075, 0.025);
      }
    k.flush();
  }

  function pineTree(k: Kit, x: number, y: number, z: number, s: number) {
    k.box(BARK, x, y - 0.01, z, 0.025, 0.05 * s + 0.01, 0.025);
    const widths = [0.15, 0.125, 0.1, 0.075, 0.05, 0.025];
    let yy = y + 0.035 * s;
    widths.forEach((w, i) => {
      const ww = Math.round((w * s) / 0.0125) * 0.0125;
      k.box(PINEP, x, yy, z, ww, 0.04 * s, ww);
      if (i < 3) yy += 0.03 * s;
      else yy += 0.032 * s;
    });
    k.box(snap("#b8e078"), x, yy, z, 0.0125, 0.0125, 0.0125);
  }
  function roundTree(k: Kit, x: number, y: number, z: number, s: number, leaf: Paint, fruit: boolean) {
    k.box(BARK, x, y - 0.01, z, 0.0375, 0.09 * s + 0.01, 0.0375);
    k.box(BARK, x + 0.0, y + 0.06 * s, z + 0.0, 0.0625, 0.02, 0.0125);
    const rs = (v: number) => Math.round((v * s) / 0.0125) * 0.0125;
    k.box(leaf, x, y + 0.075 * s, z, rs(0.15), rs(0.075), rs(0.15));
    k.box(leaf, x + 0.0, y + 0.125 * s, z, rs(0.1), rs(0.05), rs(0.125));
    k.box(leaf, x + 0.045 * s, y + 0.1 * s, z + 0.03 * s, rs(0.075), rs(0.06), rs(0.075));
    k.box(leaf, x - 0.045 * s, y + 0.095 * s, z - 0.03 * s, rs(0.075), rs(0.06), rs(0.075));
    if (fruit)
      for (const [fx, fy, fz] of [
        [0.076, 0.1, 0.02],
        [-0.03, 0.07, 0.077],
        [0.04, 0.14, 0.05],
        [-0.076, 0.09, -0.01],
        [0.02, 0.085, -0.077],
        [-0.05, 0.13, 0.04],
      ])
        k.box(RED, x + fx * s, y + fy * s, z + fz * s, 0.01, 0.01, 0.01);
  }
}
