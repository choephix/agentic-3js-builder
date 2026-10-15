// Monster truck in pixel art: a blue pickup body with painted flames perched on a tube chassis, live axles, big
// coilover shocks and four huge mud-caked lugged tyres. Everything in the body is cellPaint on a 5 cm pixel grid.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";
import { cellPaint, pixelArt, pixelTexture, stepped } from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";
import { createBuilder } from "../../../../src/builder";
import { aim, rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";

export const meta = {
  name: "Monster Truck",
  description:
    "Pixel-art monster truck: flame-painted blue pickup on a tube chassis with live axles, coilover shocks, a blown engine and four giant mud-caked lugged tyres.",
  style: "pixel art",
  commit: "88fc1f0",
};

type P = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette

const BLUE = "#2f63e0";
const BLUE_D = "#1d3e9e";
const BLUE_DD = "#122668";
const BLUE_L = "#6b9bff";
const BLUE_LL = "#b4ccff";
const ORANGE = "#ff8a1c";
const FLAME_Y = "#ffd53a";
const FLAME_R = "#e8301c";
const YELLOW = "#f4c21c";
const YELLOW_D = "#b88a0c";
const STEEL = "#8c95aa";
const STEEL_D = "#4d5468";
const STEEL_L = "#cdd5e6";
const IRON = "#262935";
const IRON_L = "#3c4152";
const LUG = "#1a1b23";
const BLUES = [BLUE_DD, BLUE_D, BLUE, BLUE_L, BLUE_LL];
const FLAMES = [FLAME_Y, ORANGE, FLAME_R];
const GLASS = ["#0b1428", "#14305f", "#2459a0", "#5a93d0", "#a9d4f5"];
const MUD = ["#3b2a18", "#58401f", "#7a5630", "#9c7442"];
const RUBBER = ["#0c0c11", "#14141b", "#1e1f29", "#2a2c39"];
const DECK = ["#14161e", "#202431", "#2f3446", "#454c64"];
const ENG = ["#14161e", "#232736", "#363c52"];

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)

const TEXEL = 0.05;
const FINE = 0.025;
const BY = 1.95; // underside of the body
const HW = 0.9; // body half width
const RY = 3.2; // roof
const HB = 2.5; // top of the engine bay (the hood lid sits on it)
const CY = 2.65; // cowl
const WY = 0.875; // wheel centre height
const WX = 1.45;
const WZ = 1.7;

/** Height of the cab and hood profile at z. */
const cabTop = (z: number) => (z < 0.35 ? RY : z < 0.95 ? RY - ((z - 0.35) / 0.6) * (RY - CY) : HB);

// ---------------------------------------------------------------------------------------------------------------
// Pixel font and textures

const FONT: Record<string, string[]> = {
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "3": ["###", "..#", ".##", "..#", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
};

const PLATE = pixelTexture(23, 9, (g) => {
  g.fill(() => "#2a2d38");
  g.fill(() => "#efe6a4", [1, 1, 21, 7]);
  "MUD13".split("").forEach((ch, i) => g.stamp(2 + i * 4, 2, FONT[ch], { "#": "#1d2a5a" }));
});

const SKULL = pixelArt(
  [
    "..rrrrrrr..",
    ".rrrrrrrrr.",
    "rrrwwwwwrrr",
    "rrwwwwwwwrr",
    "rwwkkwkkwwr",
    "rwwkkwkkwwr",
    "rrwwwkwwwrr",
    "rrwwkwkwwrr",
    "rrrwwwwwrrr",
    ".rrwkwkwrr.",
    "..rrrrrrr..",
  ],
  { r: "#c41e1e", w: "#f4f0e0", k: "#12141c" },
);

const CHECK = pixelTexture(6, 4, (g) => g.fill((x, y) => ((x + y) % 2 === 0 ? "#f4f4f8" : "#14141c")));

// ---------------------------------------------------------------------------------------------------------------
// Paints

const mudAt = (c: Cell, y0: number, k: number): string | null => {
  const m = noise(c.at, 0.22, 3) + (y0 - c.at.y) * k;
  return m > 0.95 ? c.pick(MUD, (m - 0.95) * 2 + 0.25 * noise(c.at, 0.1, 9)) : null;
};

const glass = (c: Cell): string => {
  const t = (c.at.x * 1.1 + c.at.y + c.at.z * 1.1) / 0.3;
  const f = t - Math.floor(t);
  if (f < 0.1) return GLASS[4];
  if (f < 0.2) return GLASS[3];
  return c.pick(GLASS.slice(0, 3), 0.2 + 0.6 * ((c.at.y - 2.4) / 0.8));
};

const stripe = (ax: number): string | null => (ax < 0.1 ? ORANGE : ax < 0.15 ? BLUE_DD : ax < 0.2 ? YELLOW : null);

const engine = (c: Cell): string => {
  if (c.u % 9 === 4 && Math.abs(c.at.x) < 0.8) return STEEL_D;
  if (c.v % 11 === 5) return IRON_L;
  return c.pick(ENG, 0.3 + 0.4 * noise(c.at, 0.2, 8));
};

const bodyColor = (c: Cell): string => {
  const { x, y, z } = c.at;
  const ax = Math.abs(x);
  const rel = y - BY;
  const side = c.axis === 0;
  const hi = c.n.y > 0.5;
  if (c.n.y < -0.5) return IRON;

  // Side glass, with a helmeted driver in the left window.
  if (side && ax > 0.85) {
    if (z > 0.05 && z < 0.85 && rel > 0.5 && y < cabTop(z) - 0.12) {
      if (c.n.x > 0) {
        const dh = Math.hypot(z - 0.38, y - 2.88);
        if (dh < 0.15) return z > 0.4 && y > 2.82 && y < 2.94 ? "#0b1020" : "#e84a2a";
        if (z > 0.22 && z < 0.55 && y < 2.74) return "#f0a020";
        if (z > 0.66 && z < 0.74 && y > 2.5 && y < 2.72) return IRON;
      }
      return glass(c);
    }
    if (z > -0.4 && z < -0.1 && rel > 0.62 && y < RY - 0.14) return glass(c);
  }
  // Windshield stairs.
  if (z > 0.36 && z < 0.94 && ax < 0.8 && y > CY + 0.03 && y < RY - 0.1 && ((c.axis === 2 && c.n.z > 0.5) || hi))
    return glass(c);
  // Rear window.
  if (c.axis === 2 && c.n.z < -0.5 && z < -0.45 && z > -0.55 && ax < 0.62 && y > 2.78 && y < RY - 0.1) return glass(c);
  // Grille, headlight bezels, valance.
  if (c.axis === 2 && c.n.z > 0.5 && z > 2.3) {
    if (ax < 0.4 && rel > 0.14 && rel < 0.5) {
      if (ax > 0.33 || rel < 0.19 || rel > 0.45) return STEEL_L;
      return c.v % 2 === 0 ? STEEL_D : "#0b0c12";
    }
    if (ax > 0.48 && ax < 0.82 && Math.abs(rel - 0.33) < 0.15) return STEEL_L;
    if (rel < 0.12) return BLUE_DD;
  }
  if (hi) {
    if (Math.abs(y - HB) < 0.04 && z > 0.95) return engine(c);
    if (z > 0.95 && y > 2.55) {
      const st = stripe(ax);
      if (st) return st;
      if (z < 1.25 && ax > 0.4 && ax < 0.85 && c.v % 2 === 0) return BLUE_DD;
    }
    if (y > RY - 0.04 && z > -0.5 && z < 0.36) {
      const st = stripe(ax);
      if (st) return st;
    }
    return c.pick(BLUES, 0.74 + 0.2 * (noise(c.at, 0.3, 11) - 0.5));
  }
  if (side && ax > 0.85) {
    if ((c.u === 0 || c.u === 17) && y < cabTop(z) - 0.02) return BLUE_DD;
    if (z > -0.45 && rel > 0.46 && rel < 0.49) return STEEL_L;
    if (z > -0.45 && rel > 0.41 && rel < 0.44) return BLUE_DD;
    if (rel < 0.45) {
      const m = mudAt(c, BY + 0.4, 1.3);
      if (m) return m;
    }
    // Flame tongues licking back from the nose.
    const env = Math.min(1, Math.max(0, (z + 0.2) / 1.7));
    if (env > 0 && rel < 0.5) {
      const ph = z * 2.4 - rel * 1.7;
      const f = ph - Math.floor(ph);
      const tri = 1 - Math.abs(2 * f - 1);
      const topRel = 0.08 + 0.42 * env * (0.3 + 0.7 * tri);
      if (rel < topRel) {
        const q = rel / topRel;
        return q > 0.9 ? "#7a1208" : c.pick(FLAMES, q);
      }
    }
    if (rel < 0.06) return BLUE_DD;
  }
  return c.pick(BLUES, 0.5 + 0.28 * c.n.y + 0.14 * (rel / 1.25) - 0.12 * Math.abs(c.n.z) + 0.2 * (noise(c.at, 0.3, 11) - 0.5));
};

/** The number roundel on the bed sides, in the font above. */
const roundel = (c: Cell, sgn: number): string | null => {
  const { y, z } = c.at;
  if (z < -1.75 || z > -1.2 || y < 2.1 || y > 2.55) return null;
  const ix = sgn > 0 ? Math.round((-1.2 - 0.025 - z) / 0.05) : Math.round((z + 1.75 - 0.025) / 0.05);
  const row = Math.round((2.55 - 0.025 - y) / 0.05);
  if (ix < 0 || ix > 10 || row < 0 || row > 8) return null;
  if ((ix === 0 || ix === 10) && (row === 0 || row === 8)) return null;
  if (ix === 0 || ix === 10 || row === 0 || row === 8) return "#12141c";
  const gy = row - 2;
  if (gy >= 0 && gy < 5) {
    const gx = ix - 2;
    if (gx >= 0 && gx < 3 && FONT["1"][gy][gx] === "#") return BLUE_D;
    if (ix >= 6 && ix < 9 && FONT["3"][gy][ix - 6] === "#") return BLUE_D;
  }
  return "#f4f0e0";
};

const bedColor = (c: Cell): string => {
  const { x, y, z } = c.at;
  if (c.n.y < -0.5) return IRON;
  if (c.n.y > 0.5) {
    if (y < 2.2) {
      if (c.v % 5 === 0) return DECK[3];
      const m = noise(c.at, 0.25, 5);
      if (m > 0.72) return c.pick(MUD, (m - 0.72) * 3);
      return c.pick(DECK, 0.3 + 0.35 * noise(c.at, 0.12, 6));
    }
    return BLUE_L;
  }
  if (c.axis === 0) {
    const outward = c.n.x * Math.sign(x) > 0;
    if (!outward) return c.u % 6 === 0 ? DECK[3] : c.pick(DECK, 0.25 + 0.3 * noise(c.at, 0.15, 3));
    const m = mudAt(c, 2.3, 1.3);
    if (m) return m;
    const r = roundel(c, Math.sign(x));
    if (r) return r;
    if (y > 2.5) return BLUE_L;
    if (c.u % 10 === 0) return BLUE_D;
    return c.pick(BLUES, 0.5 + 0.16 * (y - 2.0) + 0.2 * (noise(c.at, 0.3, 12) - 0.5));
  }
  // Faces looking along z.
  if (z < -2.3) {
    if (c.n.z > 0) return c.pick(DECK, 0.3);
    if (y > 2.5) return BLUE_L;
    if (c.v % 6 === 2) return BLUE_D;
    if (c.v % 6 === 3) return BLUE_L;
    return c.pick(BLUES, 0.5 + 0.2 * (noise(c.at, 0.3, 13) - 0.5));
  }
  if (c.n.z < -0.5) return c.pick(DECK, 0.3 + 0.3 * noise(c.at, 0.15, 2));
  return BLUE_D;
};

const tyrePaint = (cx: number, cy: number, cz: number, s: number): Paint =>
  cellPaint(FINE, (c) => {
    const dy = c.at.y - cy;
    const dz = c.at.z - cz;
    const dx = (c.at.x - cx) * s;
    const r = Math.hypot(dy, dz);
    const a = Math.atan2(dy, dz) + Math.PI;
    const mud = noise(c.at, 0.15, 5) + 0.7 * Math.max(0, 1 - c.at.y / 1.4);
    if (mud > 0.95) return c.pick(MUD, (mud - 0.95) / 0.6);
    if (c.axis === 0 && Math.abs(c.n.x) > 0.7) {
      if (r < 0.5) return RUBBER[0];
      if (r < 0.56) return "#34384a";
      const ring = Math.floor(a / (Math.PI / 18));
      if (r > 0.64 && r < 0.7 && ring % 3 !== 2) return "#c8c8d4";
      if (r > 0.74 && r < 0.77) return RUBBER[3];
      return c.pick(RUBBER, 0.3 + 0.35 * noise(c.at, 0.12, 4) + (ring % 2 === 0 ? 0.08 : 0));
    }
    const f = a / ((Math.PI * 2) / 16);
    const pf = f - Math.floor(f);
    if (pf < 0.12) return RUBBER[0];
    if (Math.abs(dx) < 0.05) return RUBBER[1];
    if (Math.abs(dx) > 0.4) return RUBBER[2];
    return c.pick(RUBBER, 0.3 + 0.4 * noise(c.at, 0.1, 2));
  });

const BODY = cellPaint(TEXEL, bodyColor, { dither: true });
const BED = cellPaint(TEXEL, bedColor, { dither: true });

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers (model space, merged per bone and colour)

const UNIT = new THREE.Vector3(1, 1, 1);
const V3 = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);
const place = (g: THREE.BufferGeometry, at: P, q?: THREE.Quaternion) => {
  g.applyMatrix4(new THREE.Matrix4().compose(V3(at), q ?? new THREE.Quaternion(), UNIT));
  return g;
};
const box = (size: P, at: P, q?: THREE.Quaternion) =>
  place(new THREE.BoxGeometry(size[0], size[1], size[2]), at, q);
const ball = (r: number, at: P, w = 8, h = 6) => place(new THREE.SphereGeometry(r, w, h), at);
const cyl = (a: P, e: P, r0: number, r1: number, seg = 8) => {
  const d = V3(e).sub(V3(a));
  return place(new THREE.CylinderGeometry(r1, r0, d.length(), seg, 1), [
    (a[0] + e[0]) / 2,
    (a[1] + e[1]) / 2,
    (a[2] + e[2]) / 2,
  ], aim(d));
};

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const rand = rng(7);

  // ----- skeleton ---------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 1.5, 0] });
  const axleF = b.joint("axleF", { parent: chassis, at: [0, WY, WZ], role: "hinge" });
  const axleR = b.joint("axleR", { parent: chassis, at: [0, WY, -WZ], role: "hinge" });
  const sideName = (s: number) => (s > 0 ? "L" : "R");
  const steer: Record<string, Joint> = {};
  const wheel: Record<string, Joint> = {};
  const door: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const sd = sideName(s);
    steer[sd] = b.joint(`steerF${sd}`, { parent: axleF, at: [s * 1.0, WY, WZ], role: "hinge" });
    wheel[`F${sd}`] = b.joint(`wheelF${sd}`, { parent: steer[sd], at: [s * WX, WY, WZ], role: "hinge" });
    wheel[`R${sd}`] = b.joint(`wheelR${sd}`, { parent: axleR, at: [s * WX, WY, -WZ], role: "hinge" });
    door[sd] = b.joint(`door${sd}`, { parent: chassis, at: [s * (HW + 0.025), 2.0, 0.9], role: "hinge" });
  }
  const hood = b.joint("hood", { parent: chassis, at: [0, HB, 0.95], role: "hinge" });
  const tailgate = b.joint("tailgate", { parent: chassis, at: [0, 2.05, -2.4], role: "hinge" });

  // ----- merge buckets ----------------------------------------------------------------------------------------
  const buckets = new Map<string, { bone: Joint; color: string | Paint; geos: THREE.BufferGeometry[] }>();
  const put = (bone: Joint, color: string | Paint, ...geos: THREE.BufferGeometry[]) => {
    const key = `${bone.name}|${String(color)}`;
    let e = buckets.get(key);
    if (!e) buckets.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(...geos);
  };
  const flush = () => {
    for (const e of buckets.values()) {
      const g = mergeGeometries(e.geos);
      if (!g) throw new Error(`monsterTruck: merge failed on ${e.bone.name}`);
      b.part(g, e.color, { bone: e.bone, at: [0, 0, 0], flat: true });
    }
  };

  // ----- chassis frame ----------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    put(chassis, IRON, box([0.14, 0.2, 4.9], [s * 0.45, 1.5, 0]));
    put(chassis, IRON_L, box([0.04, 0.12, 4.7], [s * 0.53, 1.5, 0]));
    // Body mounts: yellow posts from the rail up to the body, with bolt heads.
    for (const z of [-2.0, -1.0, 0.2, 1.2, 2.2]) {
      put(chassis, YELLOW, box([0.18, 0.35, 0.22], [s * 0.45, 1.775, z]));
      put(chassis, YELLOW_D, box([0.22, 0.04, 0.26], [s * 0.45, 1.6, z]));
      put(chassis, STEEL_L, cyl([s * 0.45, 1.95, z], [s * 0.45, 1.98, z], 0.04, 0.04, 6));
    }
    // Front and rear frame horns.
    put(chassis, IRON, box([0.16, 0.16, 0.3], [s * 0.45, 1.5, 2.55]), box([0.16, 0.16, 0.3], [s * 0.45, 1.5, -2.55]));
  }
  for (const z of [-2.3, -1.4, -0.5, 0.3, 1.0, 2.2]) put(chassis, IRON_L, cyl([-0.45, 1.5, z], [0.45, 1.5, z], 0.06, 0.06, 6));
  // Skid plate, oil pan, transmission, transfer case, fuel cell.
  put(chassis, STEEL, box([0.7, 0.2, 0.9], [0, 1.28, 1.4]), box([0.4, 0.34, 0.9], [0, 1.3, 0.45]), box([0.35, 0.3, 0.4], [0, 1.22, -0.3]));
  put(chassis, STEEL_D, box([0.76, 0.05, 0.96], [0, 1.16, 1.4]), box([0.46, 0.05, 0.5], [0, 1.1, 0.45]));
  put(chassis, STEEL, box([0.7, 0.3, 0.7], [0, 1.75, -1.5]));
  for (const z of [-1.7, -1.3]) put(chassis, IRON_L, box([0.74, 0.34, 0.05], [0, 1.75, z]));
  put(chassis, STEEL_L, cyl([-0.3, 1.92, -1.5], [0.3, 1.92, -1.5], 0.04, 0.04, 6));
  // Driveshafts with universal joints.
  put(chassis, STEEL_D, cyl([0, 1.1, 0.9], [0, 0.95, WZ - 0.2], 0.05, 0.05, 6), cyl([0, 1.1, -0.5], [0, 0.95, -WZ + 0.2], 0.05, 0.05, 6));
  put(chassis, IRON_L, box([0.12, 0.12, 0.12], [0, 1.1, 0.9]), box([0.12, 0.12, 0.12], [0, 1.1, -0.5]));

  // ----- axles, diffs, links and steering -------------------------------------------------------------------
  for (const [axle, z, dir] of [
    [axleF, WZ, 1],
    [axleR, -WZ, -1],
  ] as const) {
    put(axle, IRON_L, cyl([-1.0, WY, z], [1.0, WY, z], 0.11, 0.11, 8));
    put(axle, STEEL, ball(0.22, [0, WY, z + dir * 0.06], 8, 6));
    put(axle, STEEL_D, box([0.3, 0.3, 0.05], [0, WY, z + dir * 0.27]));
    for (let k = 0; k < 6; k++) {
      const th = (k / 6) * Math.PI * 2;
      put(axle, STEEL_L, cyl([Math.cos(th) * 0.11, WY + Math.sin(th) * 0.11, z + dir * 0.29], [Math.cos(th) * 0.11, WY + Math.sin(th) * 0.11, z + dir * 0.32], 0.015, 0.015, 4));
    }
    for (const s of [1, -1]) {
      const link = z * 0.5 > 0 ? 0.8 : -0.8;
      const mount = z > 0 ? 0.9 : -0.9;
      put(chassis, STEEL_D, cyl([s * 0.5, 0.78, z], [s * 0.45, 1.35, link], 0.045, 0.045, 6), cyl([s * 0.25, 1.05, z], [s * 0.2, 1.45, mount], 0.045, 0.045, 6));
      put(axle, IRON, box([0.12, 0.1, 0.12], [s * 0.5, 0.78, z]), box([0.1, 0.1, 0.1], [s * 0.25, 1.05, z]));
    }
  }
  for (const s of [1, -1]) {
    const sd = sideName(s);
    put(steer[sd], STEEL_D, box([0.18, 0.38, 0.36], [s * 0.94, WY, WZ]));
    put(steer[sd], YELLOW_D, box([0.12, 0.08, 0.22], [s * 0.94, WY + 0.22, WZ]));
    put(axleR, STEEL_D, box([0.18, 0.38, 0.36], [s * 0.94, WY, -WZ]));
  }
  put(axleF, STEEL_L, cyl([-1.0, 0.74, WZ + 0.3], [1.0, 0.74, WZ + 0.3], 0.03, 0.03, 6));
  put(axleF, IRON_L, box([0.1, 0.08, 0.3], [-0.95, 0.76, WZ + 0.15]), box([0.1, 0.08, 0.3], [0.95, 0.76, WZ + 0.15]));

  // ----- coilover shocks and towers -------------------------------------------------------------------------
  const shock = (lo: P, up: P) => {
    const d = V3(up).sub(V3(lo));
    const len = d.length();
    const n = d.clone().normalize();
    const at = (t: number): P => [lo[0] + n.x * len * t, lo[1] + n.y * len * t, lo[2] + n.z * len * t];
    put(chassis, YELLOW, cyl(at(0), at(0.45), 0.075, 0.075, 8));
    put(chassis, STEEL_L, cyl(at(0.45), at(1), 0.03, 0.03, 6));
    put(chassis, STEEL_D, cyl(at(0), at(0.06), 0.11, 0.11, 8), cyl(at(0.94), at(1), 0.11, 0.11, 8));
    for (let i = 0; i < 7; i++) put(chassis, FLAME_R, cyl(at(0.1 + i * 0.12), at(0.135 + i * 0.12), 0.125, 0.125, 10));
  };
  for (const s of [1, -1])
    for (const z of [WZ, -WZ]) {
      shock([s * 0.78, 1.0, z], [s * 0.62, 1.82, z]);
      put(chassis, IRON, box([0.1, 0.45, 0.3], [s * 0.54, 1.62, z]));
      put(chassis, STEEL_D, box([0.16, 0.1, 0.16], [s * 0.78, 0.98, z]));
    }

  // ----- wheels -------------------------------------------------------------------------------------------
  const buildWheel = (wj: Joint, cx: number, cz: number, s: number, tag: string) => {
    const cy = WY;
    b.part(new THREE.CylinderGeometry(0.82, 0.82, 0.9, 16, 1), tyrePaint(cx, cy, cz, s), {
      bone: wj,
      at: [cx, cy, cz],
      rotation: [0, 0, 90],
      flat: true,
      name: `tyre${tag}`,
    });
    // Tread lugs: two staggered rows of chunky blocks.
    const lugs: THREE.BufferGeometry[] = [];
    for (let row = 0; row < 2; row++)
      for (let k = 0; k < 16; k++) {
        const th = ((k + row * 0.5) / 16) * Math.PI * 2;
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), th);
        lugs.push(box([0.34, 0.1, 0.19], [cx + (row ? 0.2 : -0.2), cy + 0.83 * Math.cos(th), cz + 0.83 * Math.sin(th)], q));
      }
    put(wj, LUG, ...lugs);
    // Rim, recessed faces, spokes, bead-lock bolts, hub and nuts on both sides.
    put(wj, YELLOW, cyl([cx - 0.48, cy, cz], [cx + 0.48, cy, cz], 0.44, 0.44, 12));
    for (const e of [1, -1]) {
      put(wj, IRON_L, cyl([cx + e * 0.47, cy, cz], [cx + e * 0.5, cy, cz], 0.36, 0.36, 12));
      put(wj, STEEL_L, cyl([cx + e * 0.48, cy, cz], [cx + e * 0.56, cy, cz], 0.17, 0.17, 8));
      put(wj, YELLOW_D, cyl([cx + e * 0.56, cy, cz], [cx + e * 0.62, cy, cz], 0.06, 0.06, 6));
      const spokes: THREE.BufferGeometry[] = [];
      const nuts: THREE.BufferGeometry[] = [];
      const bolts: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 6; k++) {
        const th = (k / 6) * Math.PI * 2 + Math.PI / 6;
        spokes.push(cyl([cx + e * 0.5, cy + 0.16 * Math.cos(th), cz + 0.16 * Math.sin(th)], [cx + e * 0.5, cy + 0.34 * Math.cos(th), cz + 0.34 * Math.sin(th)], 0.05, 0.05, 6));
        const th2 = (k / 6) * Math.PI * 2;
        nuts.push(cyl([cx + e * 0.56, cy + 0.11 * Math.cos(th2), cz + 0.11 * Math.sin(th2)], [cx + e * 0.6, cy + 0.11 * Math.cos(th2), cz + 0.11 * Math.sin(th2)], 0.03, 0.03, 6));
      }
      for (let k = 0; k < 12; k++) {
        const th = (k / 12) * Math.PI * 2;
        bolts.push(cyl([cx + e * 0.48, cy + 0.4 * Math.cos(th), cz + 0.4 * Math.sin(th)], [cx + e * 0.52, cy + 0.4 * Math.cos(th), cz + 0.4 * Math.sin(th)], 0.022, 0.022, 5));
      }
      put(wj, YELLOW, ...spokes);
      put(wj, STEEL_D, ...nuts);
      put(wj, STEEL_L, ...bolts);
    }
    // Mud clods stuck low on the tread.
    const clods: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++) {
      const th = Math.PI * (0.55 + 0.9 * rand());
      const rr = 0.86 + 0.05 * rand();
      const sz = 0.05 + 0.07 * rand();
      const y = Math.max(cy + rr * Math.cos(th), 0.1);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
      clods.push(box([sz, sz * 0.8, sz * 1.2], [cx + (rand() - 0.5) * 0.8, y, cz + rr * Math.sin(th)], q));
    }
    put(wj, MUD[1], ...clods);
  };
  for (const s of [1, -1]) {
    const sd = sideName(s);
    buildWheel(wheel[`F${sd}`], s * WX, WZ, s, `F${sd}`);
    buildWheel(wheel[`R${sd}`], s * WX, -WZ, s, `R${sd}`);
  }

  // ----- body: cab and nose profile ---------------------------------------------------------------------------
  const cols = 58;
  const cabSpans: [number, number][] = Array.from({ length: cols }, (_, i) => [
    0,
    Math.round((cabTop(-0.5 + TEXEL * (i + 0.5)) - BY) / TEXEL),
  ]);
  b.extrude(stepped(cabSpans, TEXEL), {
    at: [0, BY, -0.5],
    x: [0, 0, 1],
    thickness: HW * 2,
    color: BODY,
    bone: chassis,
    name: "cab",
  });

  // Doors: same paint, hinged at the front edge, with handle and mirror.
  const doorSpans: [number, number][] = Array.from({ length: 18 }, (_, i) => [
    0,
    Math.round((cabTop(TEXEL * (i + 0.5)) - 0.05 - 2.0) / TEXEL),
  ]);
  for (const s of [1, -1]) {
    const sd = sideName(s);
    b.extrude(stepped(doorSpans, TEXEL), {
      at: [s * (HW + 0.025), 2.0, 0],
      x: [0, 0, 1],
      thickness: 0.05,
      color: BODY,
      bone: door[sd],
      name: `door${sd}`,
    });
    put(door[sd], STEEL_L, box([0.03, 0.05, 0.14], [s * 0.97, 2.3, 0.12]), box([0.06, 0.22, 0.16], [s * 1.12, 2.78, 0.8]));
    put(door[sd], IRON_L, cyl([s * 0.95, 2.72, 0.8], [s * 1.09, 2.76, 0.8], 0.015, 0.015, 4));
    put(door[sd], STEEL_D, box([0.02, 0.18, 0.12], [s * 1.155, 2.78, 0.8]));
  }

  // Hood lid with a hole for the blower, hinged at the cowl.
  const lid = (name: string, size: P, at: P) => b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), BODY, { bone: hood, at, name });
  lid("hoodFront", [1.8, 0.1, 0.5], [0, 2.55, 2.15]);
  lid("hoodBack", [1.8, 0.1, 0.35], [0, 2.55, 1.125]);
  lid("hoodLeft", [0.55, 0.1, 0.6], [0.625, 2.55, 1.6]);
  lid("hoodRight", [0.55, 0.1, 0.6], [-0.625, 2.55, 1.6]);
  for (const s of [1, -1]) {
    put(hood, STEEL_L, cyl([s * 0.8, 2.6, 1.0], [s * 0.8, 2.64, 1.0], 0.03, 0.03, 6), cyl([s * 0.8, 2.6, 2.3], [s * 0.8, 2.64, 2.3], 0.03, 0.03, 6));
    put(hood, IRON, box([0.14, 0.08, 0.06], [s * 0.7, 2.58, 0.97]));
  }

  // ----- blower, stacks, wipers ------------------------------------------------------------------------------
  put(chassis, STEEL_D, box([0.56, 0.12, 0.56], [0, 2.56, 1.6]));
  put(chassis, STEEL, box([0.48, 0.2, 0.48], [0, 2.72, 1.6]));
  put(chassis, STEEL_L, box([0.52, 0.05, 0.52], [0, 2.845, 1.6]));
  put(chassis, STEEL_D, box([0.4, 0.16, 0.4], [0, 2.95, 1.6]));
  put(chassis, "#07080c", box([0.32, 0.02, 0.32], [0, 3.04, 1.6]));
  put(chassis, STEEL_L, ...[-0.2, 0.2].map((x) => cyl([x, 2.6, 1.34], [x, 2.75, 1.34], 0.035, 0.035, 6)));
  for (const s of [1, -1])
    for (const z of [1.5, 1.85]) {
      put(chassis, STEEL_L, cyl([s * 0.72, 2.3, z], [s * 0.72, 2.9, z], 0.055, 0.055, 8), cyl([s * 0.72, 2.9, z], [s * 0.72, 3.02, z], 0.055, 0.09, 8));
      put(chassis, "#c8782a", cyl([s * 0.72, 2.5, z], [s * 0.72, 2.56, z], 0.066, 0.066, 8));
      put(chassis, IRON, cyl([s * 0.72, 3.02, z], [s * 0.72, 3.03, z], 0.075, 0.075, 8));
    }
  for (const xo of [0.5, -0.05]) put(chassis, IRON, cyl([xo, 2.72, 0.9], [xo - 0.5, 2.855, 0.78], 0.012, 0.012, 4));

  // ----- bed ---------------------------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(1.8, 0.1, 1.9), BED, { bone: chassis, at: [0, 2.0, -1.45], name: "bedFloor" });
  b.part(new THREE.BoxGeometry(0.1, 0.5, 1.85), BED, { bone: chassis, at: [0.85, 2.3, -1.475], name: "bedWallL" });
  b.part(new THREE.BoxGeometry(0.1, 0.5, 1.85), BED, { bone: chassis, at: [-0.85, 2.3, -1.475], name: "bedWallR" });
  b.part(new THREE.BoxGeometry(1.6, 0.5, 0.1), BED, { bone: chassis, at: [0, 2.3, -0.6], name: "bedFront" });
  b.part(new THREE.BoxGeometry(1.6, 0.5, 0.08), BED, { bone: tailgate, at: [0, 2.3, -2.36], name: "tailgate" });
  for (const s of [1, -1]) {
    put(chassis, BLUE_L, box([0.14, 0.04, 1.85], [s * 0.85, 2.57, -1.475]));
    put(chassis, STEEL_L, box([0.04, 0.06, 0.1], [s * 0.93, 2.45, -0.9]), box([0.04, 0.06, 0.1], [s * 0.93, 2.45, -2.0]));
    // Roll bar hoop with braces.
    put(chassis, STEEL_L, cyl([s * 0.75, 2.55, -0.85], [s * 0.75, 3.25, -0.85], 0.045, 0.045, 6), cyl([s * 0.75, 3.25, -0.85], [s * 0.75, 2.55, -1.4], 0.04, 0.04, 6), ball(0.06, [s * 0.75, 3.25, -0.85], 6, 4));
  }
  put(chassis, STEEL_L, cyl([-0.75, 3.25, -0.85], [0.75, 3.25, -0.85], 0.045, 0.045, 6));
  // Tailgate hinges, latch and reflectors.
  put(tailgate, STEEL_D, box([0.12, 0.08, 0.1], [0.7, 2.08, -2.36]), box([0.12, 0.08, 0.1], [-0.7, 2.08, -2.36]), box([0.16, 0.06, 0.04], [0, 2.5, -2.41]));
  put(tailgate, FLAME_R, box([0.1, 0.05, 0.02], [0.45, 2.1, -2.405]), box([0.1, 0.05, 0.02], [-0.45, 2.1, -2.405]));
  // Bed cargo: toolbox, jerry can, spare tyre stack.
  put(chassis, YELLOW, box([0.5, 0.26, 0.28], [-0.5, 2.18, -0.95]));
  put(chassis, YELLOW_D, box([0.52, 0.04, 0.3], [-0.5, 2.33, -0.95]), cyl([-0.65, 2.37, -0.95], [-0.35, 2.37, -0.95], 0.02, 0.02, 5));
  put(chassis, IRON, box([0.04, 0.06, 0.06], [-0.25, 2.2, -0.95]));
  put(chassis, "#c83a22", box([0.3, 0.4, 0.15], [0.5, 2.25, -0.95]));
  put(chassis, "#8a2414", box([0.24, 0.05, 0.1], [0.5, 2.47, -0.95]), cyl([0.58, 2.45, -0.95], [0.64, 2.56, -0.95], 0.03, 0.03, 6));
  put(chassis, STEEL_L, cyl([0.38, 2.44, -0.95], [0.5, 2.44, -0.95], 0.02, 0.02, 5));
  for (const [i, y] of [2.15, 2.31].entries()) {
    put(chassis, LUG, cyl([-0.35, y - 0.08, -1.75], [-0.35, y + 0.08, -1.75], 0.32, 0.32, 14));
    put(chassis, YELLOW, cyl([-0.35, y - 0.085, -1.75], [-0.35, y + 0.085, -1.75], 0.15, 0.15, 8));
    if (i === 1) put(chassis, STEEL_D, cyl([-0.35, y + 0.085, -1.75], [-0.35, y + 0.1, -1.75], 0.07, 0.07, 6));
  }
  // Pixel stickers and plate on the tailgate.
  b.part(new THREE.PlaneGeometry(0.46, 0.18), "#ffffff", { texture: PLATE, bone: tailgate, at: [0.38, 2.2, -2.405], dir: [0, 0, -1], axis: "z", name: "plate" });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { texture: SKULL, bone: tailgate, at: [-0.42, 2.33, -2.405], dir: [0, 0, -1], axis: "z", name: "skull" });

  // ----- bumpers, winch, push bar ---------------------------------------------------------------------------
  put(chassis, IRON, box([1.8, 0.22, 0.24], [0, 2.15, 2.52]), box([1.8, 0.2, 0.22], [0, 2.1, -2.5]));
  put(chassis, IRON_L, box([1.7, 0.04, 0.26], [0, 2.27, 2.52]), box([1.7, 0.04, 0.24], [0, 2.21, -2.5]));
  put(chassis, STEEL_D, box([0.46, 0.2, 0.2], [0, 2.18, 2.7]));
  put(chassis, STEEL_L, cyl([-0.2, 2.2, 2.7], [0.2, 2.2, 2.7], 0.075, 0.075, 8), box([0.2, 0.12, 0.04], [0, 2.18, 2.81]));
  put(chassis, YELLOW, box([0.08, 0.08, 0.12], [0.7, 2.1, 2.66]), box([0.08, 0.08, 0.12], [-0.7, 2.1, 2.66]), box([0.08, 0.08, 0.12], [0.7, 2.05, -2.66]), box([0.08, 0.08, 0.12], [-0.7, 2.05, -2.66]));
  put(chassis, STEEL_L, cyl([0.75, 2.2, 2.6], [0.75, 2.7, 2.5], 0.045, 0.045, 6), cyl([-0.75, 2.2, 2.6], [-0.75, 2.7, 2.5], 0.045, 0.045, 6), cyl([-0.75, 2.7, 2.5], [0.75, 2.7, 2.5], 0.045, 0.045, 6));
  put(chassis, STEEL_D, cyl([-0.3, 2.74, 2.5], [-0.3, 2.74, 2.58], 0.1, 0.1, 8), cyl([0.3, 2.74, 2.5], [0.3, 2.74, 2.58], 0.1, 0.1, 8));
  put(chassis, STEEL, ball(0.05, [0, 2.1, -2.66], 6, 4), cyl([0, 2.1, -2.62], [0, 2.1, -2.5], 0.03, 0.03, 5));

  // ----- lights (glowing) --------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.26, 0.2, 0.04), "#fff1a8", { bone: chassis, at: [s * 0.65, BY + 0.33, 2.41], name: `headlight${sideName(s)}` }), 1.4);
    glow(b.part(new THREE.BoxGeometry(0.1, 0.26, 0.04), "#ff3030", { bone: chassis, at: [s * 0.84, 2.3, -2.42], name: `taillight${sideName(s)}` }), 1.3);
    glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8), "#ffd86a", { bone: chassis, at: [s * 0.3, 2.74, 2.59], rotation: [90, 0, 0], name: `aux${sideName(s)}` }), 1.4);
  }
  // Roof light bar.
  put(chassis, IRON, box([1.5, 0.1, 0.18], [0, 3.25, 0.1]));
  const pods: THREE.BufferGeometry[] = [];
  const lenses: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const x = -0.625 + i * 0.25;
    pods.push(box([0.2, 0.16, 0.2], [x, 3.38, 0.1]));
    lenses.push(box([0.16, 0.12, 0.03], [x, 3.38, 0.21]));
  }
  put(chassis, IRON_L, ...pods);
  const lensGeo = mergeGeometries(lenses);
  if (!lensGeo) throw new Error("monsterTruck: lens merge failed");
  glow(b.part(lensGeo, "#fff4b8", { bone: chassis, at: [0, 0, 0], flat: true, name: "lightBar" }), 1.3);

  // ----- antenna with checkered flag -------------------------------------------------------------------------
  put(chassis, STEEL_L, cyl([-0.78, 3.2, -0.4], [-0.78, 3.58, -0.4], 0.012, 0.012, 4));
  b.part(new THREE.BoxGeometry(0.01, 0.16, 0.26), "#ffffff", { texture: CHECK, bone: chassis, at: [-0.78, 3.5, -0.54], name: "flag" });

  flush();
  return b.root;
}
