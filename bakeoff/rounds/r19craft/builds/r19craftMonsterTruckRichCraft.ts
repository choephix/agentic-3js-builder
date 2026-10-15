// Monster truck, pixel art: 1.7 m tyres, tall coil-over shocks, a flame-licked orange pickup body with a toothy grille,
// chrome blower, exhaust stacks, doors and tailgate on hinges, steering knuckles and four spinning wheels. Every
// surface is built from hard square texels (cellPaint at 5 cm, pixel textures for grille, glass, roundel, flag).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { SweepOptions } from "../../../../src/sweep";
import type { Joint } from "../../../../src/skeleton";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Monster Truck",
  description:
    "A 3.7 m tall pixel-art monster truck: 1.7 m mud-caked tyres, coil-over shocks, flame-painted orange pickup with a toothy grille, chrome blower and exhaust stacks. Wheels, steering, doors and tailgate are hinge joints.",
  style: "pixel art",
  commit: "88fc1f0",
};

type P = [number, number, number];
type Col = string | Paint;

// ---------------------------------------------------------------------------------------------------------------
// Palette

const T = 0.05; // texel size of every paint, in meters
const YEL = "#ffcf1f";
const NAVY = "#241455";
const NAVYL = "#3a2a86";
const CYAN = "#33b5e5";
const RED = "#d92b2b";
const LAMP = "#fff3b0";
const AMBER = "#ff9f1c";
const DARK = "#15152a";
const BLACK = "#0b0b10";
const GREY = "#6b6f7c";

const ORANGE = ["#5e1308", "#9c2a0e", "#d9470f", "#f56a1c", "#ff9640", "#ffc27a"];
const MUD = ["#2b1d12", "#3f2b19", "#5a3d22"];
const RUBBER = ["#08080a", "#121216", "#1d1d24", "#2a2a33", "#3a3a46"];
const STEELR = ["#14161c", "#22262f", "#363c48", "#4f5767", "#707a8c"];
const CHROMER = ["#2b3342", "#5d687f", "#9aa6bd", "#d4dcea", "#ffffff"];
const GLASSR = ["#0a1330", "#12234f", "#1b3a7a", "#2c5fae", "#6fb2f0"];
const LINER = ["#0e0e12", "#17171d", "#23232b"];
const FL_OUT = "#4a1470";
const FL_MID = "#ffb81c";
const FL_IN = "#fff08a";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const TONGUES = [
  { y: 2.0, L: 3.4, w: 0.11, ph: 0.2 },
  { y: 2.16, L: 4.0, w: 0.13, ph: 1.6 },
  { y: 2.33, L: 3.3, w: 0.13, ph: 3.0 },
  { y: 2.5, L: 2.5, w: 0.12, ph: 4.4 },
];

/** Flame tongues licking back from the nose along the body side; null off the flames. */
function flameAt(y: number, z: number): string | null {
  const q = 2.15 - z;
  let best: string | null = null;
  for (const t of TONGUES) {
    if (q < 0 || q > t.L) continue;
    const k = q / t.L;
    const w = t.w * Math.pow(1 - k, 0.75) * (0.55 + 0.45 * Math.min(1, q / 0.35));
    const off = 0.07 * Math.sin(q * 5.5 + t.ph) * k;
    const d = Math.abs(y - (t.y + off)) / Math.max(w, 1e-4);
    if (d < 1) best = d > 0.78 ? FL_OUT : d > 0.45 ? FL_MID : FL_IN;
  }
  return best;
}

const BODY = cellPaint(
  T,
  (c) => {
    const { x, y, z } = c.at;
    if (c.axis === 0) {
      if (y > 1.84 && y < 2.67) {
        const f = flameAt(y, z);
        if (f) return f;
      }
      if (y < 1.96) return c.pick([DARK, NAVY, NAVYL], 0.3 + 0.4 * noise(c.at, 0.25, 4));
      if (y > 2.57 && y < 2.66) return NAVY;
    }
    if (c.axis === 1 && c.n.y > 0.5) {
      if (y < 2.5 && z < -1.0 && Math.abs(x) < 0.95)
        return c.pick(LINER, (c.u % 3 === 0 ? 0.7 : 0.3) + 0.25 * noise(c.at, 0.2, 9));
      if (y > 2.6) {
        const ax = Math.abs(x);
        if (ax >= 0.14 && ax < 0.34) return NAVY;
        if (ax >= 0.34 && ax < 0.39) return YEL;
        if (y < 2.7 && z > 0.78 && z < 2.1 && c.u === 0) return ORANGE[1];
      }
      if (y < 2.7 && c.v === 16) return ORANGE[0];
    }
    const mud = noise(c.at, 0.4, 7) + (2.25 - y) * 0.9;
    if (y < 2.25 && c.n.y < 0.7 && mud > 0.72) return c.pick(MUD, noise(c.at, 0.15, 8));
    const v = 0.45 + 0.3 * c.n.y + 0.1 * c.n.z + 0.22 * (noise(c.at, 0.6, 3) - 0.5) + 0.15 * (c.random(1) - 0.5);
    return c.pick(ORANGE, v);
  },
  { dither: true },
);

const STEEL = cellPaint(
  T,
  (c) => {
    if (c.random(5) < 0.035) return "#7a4a2a";
    const mud = noise(c.at, 0.35, 11) + (1.3 - c.at.y) * 0.6;
    if (c.at.y < 1.3 && mud > 0.8) return c.pick(MUD, noise(c.at, 0.1, 12));
    return c.pick(STEELR, 0.3 + 0.25 * c.n.y + 0.12 * c.n.z + 0.25 * (noise(c.at, 0.2, 13) - 0.5));
  },
  { dither: true },
);

const CHROME = cellPaint(
  T,
  (c) => {
    if (c.random(2) < 0.025) return CHROMER[0];
    let v = 0.45 + 0.35 * c.n.y + 0.15 * c.n.z;
    if ((c.u + c.v) % 6 === 0) v += 0.28;
    return c.pick(CHROMER, v);
  },
  { dither: true },
);

const PIPE = cellPaint(
  T,
  (c) => {
    const heat = Math.min(1, Math.max(0, (c.at.y - 2.2) / 1.0));
    const bronze = ["#2a1c10", "#6a4a24", "#b98a3c", "#e8d08a"];
    if (heat > 0.3) return c.pick(bronze, 0.3 + 0.45 * Math.abs(c.n.x) + 0.2 * (noise(c.at, 0.15, 3) - 0.5));
    let v = 0.4 + 0.35 * Math.abs(c.n.x) + 0.15 * c.n.z;
    if (c.v % 5 === 0) v += 0.25;
    return c.pick(CHROMER, v);
  },
  { dither: true },
);

const GLASS = cellPaint(
  T,
  (c) => {
    const { x, y, z } = c.at;
    if (c.axis === 0 && Math.abs(x) > 0.5 && z > -0.02 && z < 0.6 && y > 2.74 && y < 3.3) {
      const d = Math.hypot(z - 0.2, y - 2.99);
      if (d < 0.16) {
        if (z > 0.22 && Math.abs(y - 2.99) < 0.06) return "#7fe3ff";
        return y > 3.05 ? "#ff6a4a" : RED;
      }
      if (y < 2.86 && z > 0.0 && z < 0.34) return YEL;
      if (z < 0.07) return "#1b1d2b";
    }
    const streak = c.axis === 0 && (c.u + c.v) % 9 === 0;
    return c.pick(GLASSR, streak ? 0.9 : 0.15 + 0.35 * noise(c.at, 0.3, 2) + 0.2 * (y - 2.7));
  },
  { dither: true },
);

const TREAD = cellPaint(
  T,
  (c) => {
    const mud = noise(c.at, 0.3, 21) + (0.6 - c.at.y) * 1.2;
    if (c.at.y < 0.85 && mud > 0.8) return c.pick(MUD, noise(c.at, 0.12, 22));
    return c.pick(RUBBER, 0.3 + 0.35 * c.n.y + 0.2 * c.n.z + 0.3 * (noise(c.at, 0.12, 23) - 0.5));
  },
  { dither: true },
);

/** Tyre barrel: sidewall rings with a dashed lettering band around the wheel centre (cy, cz). */
const tyrePaint = (cy: number, cz: number, seed: number) =>
  cellPaint(
    T,
    (c) => {
      const mud = noise(c.at, 0.3, seed) + (0.55 - c.at.y) * 1.2;
      if (mud > 0.78 && c.at.y < 0.8) return c.pick(MUD, noise(c.at, 0.12, seed + 1));
      if (c.axis === 0) {
        const dy = c.at.y - cy;
        const dz = c.at.z - cz;
        const r = Math.hypot(dy, dz);
        if (r > 0.6 && r < 0.67) {
          const a = Math.atan2(dz, dy);
          if (Math.floor((a + Math.PI) * 5) % 2 === 0) return "#d8d8e0";
        }
        if (r > 0.72) return c.pick(RUBBER, 0.45 + 0.25 * (c.random(2) - 0.5));
        return c.pick(RUBBER, 0.18 + 0.2 * noise(c.at, 0.2, seed + 2));
      }
      return c.pick(RUBBER, 0.3 + 0.3 * c.n.y + 0.35 * (noise(c.at, 0.12, seed + 3) - 0.5));
    },
    { dither: true },
  );

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const GRILLE = pixelTexture(24, 10, (g) => {
  g.fill((x, y) =>
    x === 0 || x === 23 || y === 0 || y === 9
      ? "#c4ccdb"
      : pick(["#05050a", "#1a0a22", "#3b0f33"], 0.15 + 0.5 * (y / 9), bayer(x, y)),
  );
  const top = [1, 3, 3, 1];
  const bot = [3, 1, 1, 3];
  for (let x = 1; x < 23; x++) {
    const dt = top[x % 4];
    for (let y = 1; y <= dt; y++) g.set(x, y, y === dt ? "#cfc9b4" : "#f4f1e4");
    const db = bot[x % 4];
    for (let y = 8; y >= 9 - db; y--) g.set(x, y, y === 9 - db ? "#cfc9b4" : "#f4f1e4");
  }
  g.fill((x, y) => (y === 5 && x % 3 !== 0 ? "#ff3a2a" : undefined), [2, 0, 20, 10]);
});

const ROUNDEL = pixelArt(
  [
    "...kkkkkkk...",
    "..kwwwwwwwk..",
    ".kwwwwwwwwwk.",
    "kwwwnnnnnwwwk",
    "kwwnnwwwnnwwk",
    "kwwnnwwwnnwwk",
    "kwwwnnnnnnwwk",
    "kwwwwwwwnnwwk",
    "kwwwwwwwnnwwk",
    "kwwwwwwnnwwwk",
    ".kwwwnnnwwwk.",
    "..kwwwwwwwk..",
    "...kkkkkkk...",
  ],
  { k: NAVY, w: "#ffffff", n: "#d9470f" },
);

const WINDSHIELD = pixelTexture(24, 10, (g) => {
  g.fill((x, y, _w, h) => (y < 2 ? NAVY : pick(GLASSR, 0.1 + 0.4 * (1 - y / h), bayer(x, y))));
  g.fill((x, y) => ((x + y) % 9 === 0 && y > 2 ? "#6fb2f0" : (x + 2 * y) % 13 === 0 && y > 2 ? "#2c5fae" : undefined));
});

const FLAG = pixelTexture(8, 6, (g) => g.fill((x, y) => ((x + y) % 2 === 0 ? "#0b0b10" : "#ffffff")));

const PLATE = pixelTexture(11, 7, (g) => {
  g.fill((x, y) => (x === 0 || x === 10 || y === 0 || y === 6 ? NAVY : "#f2f0e0"));
  g.stamp(2, 1, ["k.k", "kkk", "kkk", "k.k", "k.k"], { k: NAVY });
  g.stamp(6, 1, ["kkk", ".k.", ".k.", ".k.", ".k."], { k: NAVY });
});

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers

const merge = (parts: THREE.BufferGeometry[]) => {
  const g = mergeGeometries(parts);
  if (!g) throw new Error("monsterTruck: could not merge geometry");
  return g;
};
const boxG = (w: number, h: number, d: number, x: number, y: number, z: number, ry = 0) => {
  const g = new THREE.BoxGeometry(w, h, d);
  if (ry) g.rotateY(ry);
  return g.translate(x, y, z);
};
const cylG = (r: number, h: number, seg: number, x: number, y: number, z: number) =>
  new THREE.CylinderGeometry(r, r, h, seg).translate(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// The truck

const WX = 1.45; // wheel centre x
const WZ = 1.55; // wheel centre z (front +, rear -)
const WY = 0.855; // wheel centre height = tyre radius

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 1.5, 0], dir: [0, 0, 1] });

  // Part helpers, all riding the chassis unless told otherwise.
  const box = (w: number, h: number, d: number, color: Col, at: P, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at, ...o });
  const cyl = (r: number, h: number, color: Col, at: P, dir: P = [0, 1, 0], seg = 10, o: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone: chassis, at, dir, ...o });
  const bar = (a: P, c: P, r: number, color: Col, o: SweepOptions = {}) =>
    b.rod(a, c, r, color, { bone: chassis, section: "box", ...o });
  const pipe = (a: P, c: P, r: number, color: Col, o: SweepOptions = {}) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 8, ...o });
  const lamp = (w: number, h: number, d: number, color: string, at: P, o: PartOptions = {}) =>
    glow(box(w, h, d, color, at, o), 1.3);
  const studs = (pts: P[], size: number, color: Col, o: PartOptions = {}) =>
    b.part(merge(pts.map((p) => boxG(size, size, size, p[0], p[1], p[2]))), color, {
      bone: chassis,
      at: [0, 0, 0],
      ...o,
    });

  // ----- joints -----
  const steer: Record<number, Joint> = {};
  const wheelJ: Record<string, Joint> = {};
  const doorJ: Record<number, Joint> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    steer[s] = b.joint(`steer${side}`, {
      parent: chassis,
      at: [s * WX, WY + 0.3, WZ],
      dir: [0, -1, 0],
      role: "hinge",
    });
    wheelJ[`F${s}`] = b.joint(`wheelF${side}`, { parent: steer[s], at: [s * WX, WY, WZ], dir: [s, 0, 0], role: "hinge" });
    wheelJ[`B${s}`] = b.joint(`wheelB${side}`, { parent: chassis, at: [s * WX, WY, -WZ], dir: [s, 0, 0], role: "hinge" });
    doorJ[s] = b.joint(`door${side}`, { parent: chassis, at: [s * 0.97, 2.0, 0.78], dir: [0, 1, 0], role: "hinge" });
  }
  const tailgate = b.joint("tailgate", { parent: chassis, at: [0, 2.46, -2.04], dir: [0, 1, 0], role: "hinge" });

  // ----- wheels -----
  const wheel = (s: number, wz: number, bone: Joint, seed: number) => {
    const at: P = [s * WX, WY, wz];
    const o: PartOptions = { bone, at, dir: [1, 0, 0] };
    b.part(new THREE.CylinderGeometry(0.76, 0.76, 0.98, 20, 1), tyrePaint(WY, wz, seed), o);
    // Two staggered rows of paddle lugs; one lug points straight down so the tyre touches the floor.
    const lugs: THREE.BufferGeometry[] = [];
    for (let row = 0; row < 2; row++)
      for (let k = 0; k < 14; k++) {
        const th = -Math.PI / 2 + ((k + row * 0.5) * 2 * Math.PI) / 14;
        lugs.push(boxG(0.13, 0.46, 0.2, 0.8 * Math.cos(th), row ? -0.245 : 0.245, 0.8 * Math.sin(th), -th));
      }
    b.part(merge(lugs), TREAD, o);
    // Sidewall protector blocks.
    const blocks: THREE.BufferGeometry[] = [];
    for (const e of [1, -1])
      for (let k = 0; k < 16; k++) {
        const th = ((k + (e > 0 ? 0 : 0.5)) * 2 * Math.PI) / 16;
        blocks.push(boxG(0.24, 0.05, 0.09, 0.64 * Math.cos(th), e * 0.5, 0.64 * Math.sin(th), -th));
      }
    b.part(merge(blocks), TREAD, o);
    // Rim: chrome lip, dark dish, six spokes, gold hub, nut, beadlock bolts.
    b.part(merge([cylG(0.47, 0.05, 16, 0, 0.505, 0), cylG(0.47, 0.05, 16, 0, -0.505, 0)]), CHROME, o);
    b.part(merge([cylG(0.4, 0.05, 16, 0, 0.512, 0), cylG(0.4, 0.05, 16, 0, -0.512, 0)]), DARK, o);
    const spokes: THREE.BufferGeometry[] = [];
    for (const e of [1, -1])
      for (let k = 0; k < 6; k++) {
        const th = (k * 2 * Math.PI) / 6 + (e > 0 ? 0 : Math.PI / 6);
        spokes.push(boxG(0.3, 0.06, 0.1, 0.28 * Math.cos(th), e * 0.545, 0.28 * Math.sin(th), -th));
      }
    b.part(merge(spokes), CHROME, o);
    b.part(merge([cylG(0.16, 0.14, 10, 0, 0.58, 0), cylG(0.16, 0.14, 10, 0, -0.58, 0)]), YEL, o);
    b.part(merge([cylG(0.07, 0.08, 6, 0, 0.66, 0), cylG(0.07, 0.08, 6, 0, -0.66, 0)]), CHROME, o);
    const bolts: THREE.BufferGeometry[] = [];
    for (const e of [1, -1])
      for (let k = 0; k < 16; k++) {
        const th = (k * 2 * Math.PI) / 16;
        bolts.push(boxG(0.05, 0.05, 0.05, 0.435 * Math.cos(th), e * 0.55, 0.435 * Math.sin(th), -th));
      }
    b.part(merge(bolts), GREY, o);
  };
  wheel(1, WZ, wheelJ.F1, 31);
  wheel(-1, WZ, wheelJ["F-1"], 41);
  wheel(1, -WZ, wheelJ.B1, 51);
  wheel(-1, -WZ, wheelJ["B-1"], 61);

  // ----- chassis frame -----
  for (const s of [1, -1]) {
    box(0.14, 0.22, 4.7, STEEL, [s * 0.55, 1.45, 0]);
    bar([s * 0.55, 1.62, 2.3], [s * 0.5, 1.82, 2.28], 0.04);
    bar([s * 0.55, 1.62, -2.3], [s * 0.5, 1.82, -2.28], 0.04);
  }
  for (const z of [-2.25, -1.0, -0.1, 0.9, 1.7, 2.25]) {
    box(1.0, 0.12, 0.12, STEEL, [0, 1.52, z]);
    bar([-0.55, 1.58, z], [0.55, 1.58, z], 0.03);
  }
  for (const s of [1, -1])
    for (const z of [-1.6, 0, 1.4]) {
      box(0.2, 0.3, 0.22, "#1d1d24", [s * 0.55, 1.7, z]);
      box(0.24, 0.04, 0.26, GREY, [s * 0.55, 1.86, z]);
    }
  box(0.8, 0.3, 0.55, STEEL, [0, 1.62, -1.6]); // fuel cell
  cyl(0.06, 0.08, GREY, [0, 1.8, -1.6], [0, 1, 0], 8);
  for (const dz of [-0.2, 0.2]) box(0.84, 0.05, 0.04, "#3a3a46", [0, 1.62, -1.6 + dz]);
  box(0.4, 0.3, 0.5, STEEL, [0, 1.3, 0.2]); // transfer case
  pipe([0, 1.25, 0.45], [0, 0.98, 1.28], 0.045, STEEL);
  pipe([0, 1.25, -0.05], [0, 0.98, -1.28], 0.045, STEEL);
  for (const z of [1.28, -1.28]) box(0.12, 0.12, 0.1, GREY, [0, 0.98, z]);

  // ----- axles, links, shocks -----
  const shock = (top: P, bot: P, side: number) => {
    const tp = new THREE.Vector3(...top);
    const bt = new THREE.Vector3(...bot);
    const dv = tp.clone().sub(bt);
    const L = dv.length();
    dv.normalize();
    const at = (t: number): P => [bt.x + dv.x * L * t, bt.y + dv.y * L * t, bt.z + dv.z * L * t];
    b.rod(at(0), at(0.52), 0.028, CHROME, { bone: chassis, sides: 6 });
    b.rod(at(0.42), at(0.97), 0.066, CYAN, { bone: chassis, sides: 8 });
    const rings: THREE.BufferGeometry[] = [];
    for (let y = 0.12 * L; y < 0.92 * L; y += 0.052) rings.push(cylG(0.108, 0.026, 8, 0, y, 0));
    b.part(merge(rings), YEL, { bone: chassis, at: bot, dir: [dv.x, dv.y, dv.z] });
    box(0.14, 0.14, 0.14, STEEL, bot);
    box(0.2, 0.05, 0.16, STEEL, top);
    const off: P = [0, 0, side * 0.15];
    const a = at(0.3);
    const c2 = at(0.78);
    b.capsule([a[0] + off[0], a[1] + off[1], a[2] + off[2]], [c2[0] + off[0], c2[1] + off[1], c2[2] + off[2]], 0.04, RED, {
      bone: chassis,
      sides: 6,
    });
    const h0 = at(0.9);
    b.rod(h0, [c2[0] + off[0], c2[1] + off[1], c2[2] + off[2]], 0.012, BLACK, { bone: chassis, sides: 4 });
  };
  for (const z of [WZ, -WZ]) {
    const f = z > 0 ? 1 : -1;
    pipe([-1.3, WY, z], [1.3, WY, z], 0.1, STEEL);
    cyl(0.24, 0.5, STEEL, [0, WY + 0.06, z], [0, 0, 1], 10);
    cyl(0.19, 0.06, CHROME, [0, WY + 0.06, z + f * 0.28], [0, 0, 1], 10);
    const dbolts: P[] = [];
    for (let k = 0; k < 10; k++) {
      const th = (k * 2 * Math.PI) / 10;
      dbolts.push([0.16 * Math.cos(th), WY + 0.06 + 0.16 * Math.sin(th), z + f * 0.32]);
    }
    studs(dbolts, 0.035, GREY);
    cyl(0.07, 0.14, STEEL, [0, WY + 0.06, z - f * 0.34], [0, 0, 1], 8);
    for (const s of [1, -1]) {
      box(0.18, 0.12, 0.3, STEEL, [s * 0.84, WY + 0.15, z]); // shock bracket
      bar([s * 0.62, WY - 0.03, z], [s * 0.5, 1.42, z - f * 1.1], 0.04);
      bar([s * 0.3, WY + 0.28, z], [s * 0.3, 1.5, z - f * 0.9], 0.035);
      for (const dz of [-0.22, 0.22]) shock([s * 0.62, 1.72, z + dz], [s * 0.84, 1.0, z + dz], dz > 0 ? 1 : -1);
    }
  }
  // steering: arms on the knuckles and a tie rod between them
  for (const s of [1, -1]) box(0.3, 0.06, 0.06, STEEL, [s * 0.82, 0.72, WZ + 0.17], { bone: steer[s] });
  pipe([-0.7, 0.72, WZ + 0.17], [0.7, 0.72, WZ + 0.17], 0.03, STEEL);
  for (const s of [1, -1]) box(0.14, 0.14, 0.14, YEL, [s * WX, WY + 0.3, WZ], { bone: steer[s] }); // knuckle caps

  // ----- body: lower tub and cab (stepped pixel silhouettes extruded across the width) -----
  const BODY_ROWS: [number, number][] = [
    [0, 42], [0, 42], [0, 42], [0, 42], [0, 42], [0, 42], [10, 42], [10, 41],
  ];
  b.extrude(stepped(BODY_ROWS, 0.1, { rows: true }), {
    at: [0, 1.85, -2.0],
    x: [0, 0, 1],
    thickness: 1.9,
    color: BODY,
    bone: chassis,
    name: "bodyLower",
  });
  const GH_ROWS: [number, number][] = [[10, 28], [10, 27], [11, 26], [11, 25], [12, 24], [12, 23], [13, 22]];
  b.extrude(stepped(GH_ROWS, 0.1, { rows: true }), {
    at: [0, 2.65, -2.0],
    x: [0, 0, 1],
    thickness: 1.7,
    color: BODY,
    bone: chassis,
    name: "cab",
  });
  // rear quarter glass, static
  const QTR: [number, number][] = [[11, 19], [12, 19], [12, 19], [13, 19], [13, 19]];
  b.extrude(stepped(QTR, 0.1, { rows: true, start: 1 }), {
    at: [0, 2.65, -2.0],
    x: [0, 0, 1],
    thickness: 1.74,
    color: GLASS,
    bone: chassis,
    name: "quarterGlass",
  });
  // windshield and rear window
  b.part(new THREE.BoxGeometry(1.5, 0.89, 0.07), "#ffffff", {
    bone: chassis,
    at: [0, 2.985, 0.52],
    rotation: [-45, 0, 0],
    texture: WINDSHIELD,
  });
  b.part(new THREE.BoxGeometry(1.3, 0.61, 0.06), "#ffffff", {
    bone: chassis,
    at: [0, 3.0, -0.91],
    rotation: [23.2, 0, 0],
    texture: WINDSHIELD,
  });
  for (const x of [-0.3, 0.45]) bar([x, 2.74, 0.8], [x - 0.5, 3.2, 0.34], 0.012, BLACK, { section: "circle", sides: 4 });
  box(1.5, 0.03, 0.1, DARK, [0, 2.665, 0.84]); // cowl vent
  box(1.74, 0.06, 0.08, NAVY, [0, 3.34, 0.22]); // roof visor edge
  box(0.3, 0.05, 0.3, STEEL, [0, 3.375, -0.35]); // roof vent

  // roof lightbar
  box(1.4, 0.12, 0.14, STEEL, [0, 3.41, 0.07]);
  for (let k = 0; k < 6; k++) lamp(0.18, 0.08, 0.03, LAMP, [-0.55 + k * 0.22, 3.41, 0.155]);

  // ----- front fascia: toothy grille, angry headlight eyes, bumper -----
  b.part(new THREE.BoxGeometry(1.36, 0.5, 0.05), "#ffffff", { bone: chassis, at: [0, 2.3, 2.225], texture: GRILLE });
  box(1.4, 0.05, 0.07, CHROME, [0, 2.57, 2.23]);
  box(1.4, 0.05, 0.07, CHROME, [0, 2.04, 2.23]);
  for (const s of [1, -1]) {
    box(0.3, 0.34, 0.08, CHROME, [s * 0.8, 2.34, 2.24]);
    lamp(0.22, 0.26, 0.05, LAMP, [s * 0.8, 2.34, 2.285]);
    box(0.24, 0.05, 0.06, AMBER, [s * 0.8, 2.15, 2.28]);
    b.extrude(
      [
        [0, 0],
        [0.32, 0.1],
        [0.32, 0.2],
        [0, 0.1],
      ],
      { at: [s * 0.66, 2.47, 2.2], x: [s, 0, 0], thickness: 0.1, color: NAVY, bone: chassis, name: s > 0 ? "browL" : "browR" },
    );
    bar([s * 0.8, 1.95, 2.42], [s * 0.8, 2.6, 2.42], 0.035, CHROME); // brush guard
    box(0.1, 0.1, 0.12, RED, [s * 0.42, 1.9, 2.45]); // tow hook
  }
  box(1.9, 0.2, 0.28, STEEL, [0, 2.0, 2.36]);
  box(1.92, 0.05, 0.3, CHROME, [0, 2.12, 2.36]);
  bar([-0.8, 2.52, 2.42], [0.8, 2.52, 2.42], 0.035, CHROME);
  const rivets: P[] = [];
  for (let k = 0; k < 15; k++) rivets.push([-0.84 + k * 0.12, 2.0, 2.51]);
  studs(rivets, 0.035, GREY);
  cyl(0.09, 0.4, DARK, [0, 1.98, 2.5], [1, 0, 0], 8); // winch drum
  box(0.5, 0.25, 0.03, "#ffffff", [0, 2.0, 2.52], { texture: PLATE });

  // ----- hood: chrome blower, intake stacks, pulley, hood pins -----
  box(0.7, 0.05, 0.9, STEEL, [0, 2.675, 1.45]);
  box(0.55, 0.34, 0.8, CHROME, [0, 2.85, 1.45]);
  for (const y of [2.76, 2.85, 2.94]) box(0.59, 0.03, 0.84, STEEL, [0, y, 1.45]);
  box(0.46, 0.12, 0.7, CHROME, [0, 3.08, 1.45]);
  for (const z of [1.22, 1.68]) {
    cyl(0.09, 0.22, CHROME, [0, 3.25, z], [0, 1, 0], 8);
    cyl(0.125, 0.04, CHROME, [0, 3.37, z], [0, 1, 0], 8);
    cyl(0.09, 0.02, BLACK, [0, 3.385, z], [0, 1, 0], 8);
  }
  cyl(0.16, 0.08, CHROME, [0, 2.85, 1.92], [0, 0, 1], 12);
  cyl(0.06, 0.1, YEL, [0, 2.85, 1.95], [0, 0, 1], 8);
  bar([0, 2.85, 1.9], [0, 2.7, 2.1], 0.05, BLACK);
  for (const s of [1, -1])
    for (const z of [1.0, 2.0]) cyl(0.03, 0.05, GREY, [s * 0.78, 2.675, z], [0, 1, 0], 6);

  // ----- doors (hinged) with window, handle, mirror, roundel -----
  const DOOR_WIN: [number, number][] = [[20, 26], [20, 25], [20, 24], [20, 23], [20, 22]];
  for (const s of [1, -1]) {
    const door = doorJ[s];
    const o: PartOptions = { bone: door };
    box(0.05, 0.65, 0.78, BODY, [s * 0.975, 2.325, 0.39], o);
    box(0.06, 0.03, 0.8, NAVY, [s * 0.975, 2.665, 0.39], o);
    b.extrude(stepped(DOOR_WIN, 0.1, { rows: true, start: 1 }), {
      at: [s * 0.865, 2.65, -2.0],
      x: [0, 0, 1],
      thickness: 0.045,
      color: GLASS,
      bone: door,
      name: s > 0 ? "doorGlassL" : "doorGlassR",
    });
    box(0.06, 0.05, 0.16, CHROME, [s * 1.02, 2.5, 0.14], o); // handle
    box(0.025, 0.03, 0.2, GREY, [s * 1.015, 2.43, 0.14], o); // keyhole plate
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      bone: door,
      at: [s * 1.003, 2.28, 0.45],
      dir: [s, 0, 0],
      axis: "z",
      texture: ROUNDEL,
    });
    bar([s * 0.97, 2.72, 0.7], [s * 1.14, 2.78, 0.7], 0.018, CHROME, { bone: door });
    box(0.05, 0.2, 0.14, NAVY, [s * 1.2, 2.8, 0.68], o);
    box(0.03, 0.16, 0.1, CHROME, [s * 1.225, 2.8, 0.68], o);
    // side step (frame mounted)
    box(0.18, 0.04, 1.05, STEEL, [s * 1.04, 1.93, 0.35]);
    for (const z of [-0.1, 0.8]) bar([s * 1.0, 1.9, z], [s * 0.96, 1.62, z], 0.03, STEEL);
  }

  // ----- bed: side rails, tailgate, sports bar with flood lights, cargo -----
  for (const s of [1, -1]) {
    box(0.1, 0.3, 1.0, BODY, [s * 0.9, 2.6, -1.5]);
    box(0.13, 0.04, 1.02, NAVY, [s * 0.9, 2.77, -1.5]);
    // rear bumper-side lights
    lamp(0.14, 0.3, 0.06, RED, [s * 0.8, 2.22, -2.03]);
    lamp(0.14, 0.06, 0.05, AMBER, [s * 0.8, 2.02, -2.03]);
    // sports bar
    bar([s * 0.8, 2.45, -1.15], [s * 0.8, 3.05, -1.15], 0.045, CHROME);
    bar([s * 0.8, 3.0, -1.15], [s * 0.8, 2.5, -1.75], 0.035, CHROME);
    // exhaust stack beside the cab
    pipe([s * 1.03, 1.75, -0.88], [s * 1.03, 3.15, -0.88], 0.065, PIPE);
    cyl(0.1, 0.06, PIPE, [s * 1.03, 3.18, -0.88], [0, 1, 0], 8);
    cyl(0.075, 0.02, BLACK, [s * 1.03, 3.205, -0.88], [0, 1, 0], 8);
    for (const y of [2.0, 2.5, 3.0]) box(0.1, 0.05, 0.14, STEEL, [s * 1.03, y, -0.88]);
  }
  pipe([-0.8, 3.05, -1.15], [0.8, 3.05, -1.15], 0.045, CHROME);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) {
    cyl(0.1, 0.08, CHROME, [x, 3.17, -1.2], [0, 0, 1], 10);
    glow(cyl(0.075, 0.05, LAMP, [x, 3.17, -1.255], [0, 0, 1], 10), 1.4);
  }
  box(0.14, 0.14, 0.14, STEEL, [0, 2.75, -1.12]);
  // tailgate
  const tg: PartOptions = { bone: tailgate };
  box(1.7, 0.3, 0.06, BODY, [0, 2.61, -2.03], tg);
  box(1.5, 0.03, 0.02, NAVY, [0, 2.54, -2.07], tg);
  box(1.5, 0.03, 0.02, NAVY, [0, 2.68, -2.07], tg);
  box(0.25, 0.05, 0.03, CHROME, [0, 2.73, -2.075], tg);
  for (const s of [1, -1]) box(0.08, 0.08, 0.08, GREY, [s * 0.8, 2.5, -2.06], tg);
  // cargo: fuel can and tool box
  box(0.3, 0.42, 0.14, RED, [0.5, 2.66, -1.7]);
  box(0.1, 0.05, 0.04, BLACK, [0.5, 2.9, -1.7]);
  bar([0.42, 2.88, -1.7], [0.58, 2.88, -1.7], 0.015, BLACK, { section: "circle", sides: 4 });
  box(0.8, 0.26, 0.34, STEEL, [-0.3, 2.58, -1.5]);
  box(0.82, 0.04, 0.36, CHROME, [-0.3, 2.72, -1.5]);
  box(0.08, 0.06, 0.04, YEL, [-0.3, 2.6, -1.32]);
  // rear bumper, plate, hitch
  box(1.9, 0.18, 0.2, STEEL, [0, 2.0, -2.14]);
  box(1.92, 0.04, 0.22, CHROME, [0, 2.1, -2.14]);
  box(0.4, 0.2, 0.03, "#ffffff", [0, 2.18, -2.265], { texture: PLATE });
  box(0.14, 0.14, 0.2, GREY, [0, 1.9, -2.3]);
  cyl(0.05, 0.1, CHROME, [0, 1.98, -2.3], [0, 1, 0], 8);
  // antenna with a checkered flag
  pipe([-0.88, 2.78, -1.9], [-0.88, 3.6, -1.9], 0.012, GREY, { sides: 4 });
  b.part(new THREE.BoxGeometry(0.015, 0.22, 0.32), "#ffffff", { bone: chassis, at: [-0.88, 3.48, -2.08], texture: FLAG });
  box(0.06, 0.06, 0.06, RED, [-0.88, 3.62, -1.9]);

  return b.root;
}
