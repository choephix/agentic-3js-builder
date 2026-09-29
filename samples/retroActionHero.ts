// Retro action hero: a 1996 Build-engine / early-3D-shooter protagonist. Blond flat-top, wraparound shades, square
// jaw with a smirk, red tank top, massive arms, bandolier, cargo pants, combat boots and a huge chunky pistol, about
// 1.9 m tall. Everything is chunky and hard-faceted: eight-sided prism tubes for torso, limbs and neck, six- and
// four-sided rods for fingers, flat-shaded lumps for pecs and deltoids. Detail is painted, not modelled: the head is
// two hand-unwrapped boxes (skull, lower jaw) on one 64x64 sheet with painted shades, brows, nostrils, teeth, stubble,
// a cleft chin and ears, a flat-top hair block has its own 64x64 bristle sheet, and every other surface is a paint that
// quantises the model into 2 cm cells, picks colours from five-step ramps and dithers between steps with a 4x4 Bayer
// matrix: muscle grooves and veins on the arms, pec split and sweat V on the tank, stitching and knee patches on the
// cargo pants, serrations and grip checkering on the pistol.
import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { createBuilder } from "../src/builder";
import { DEG } from "../src/math";
import { limb } from "../src/ik";
import { noise, paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import type { Part } from "../src/parts";
import type { Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "Retro action hero",
  description:
    "A 1996 boomer-shooter hero: blond flat-top, wraparound shades, smirk, red tank, huge arms, bandolier, cargo pants, combat boots and a chunky pistol. Eight-sided prism tubes, a hand-unwrapped 64x64 head sheet, dithered five-step palette paints for muscle lines, stitching and gun details.",
  builtBy: "Claude Sonnet 5.5",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette: every paint and sheet picks from these short ramps (dark to light).

const SK = ["#5e3222", "#8e5236", "#bc7a50", "#e0a074", "#f6c898"] as const;
const RED = ["#2a0808", "#5a0d0e", "#8c1414", "#c21f1a", "#e8452e"] as const;
const PANTS = ["#1c2014", "#343c20", "#525a30", "#767c44", "#9a9c60"] as const;
const BOOT = ["#0a0a0e", "#1a1a22", "#2c2c38", "#484858", "#74748a"] as const;
const BROWN = ["#24140c", "#432612", "#6a3f1c", "#94602c", "#b8843c"] as const;
const BRASS = ["#5a4210", "#a67c1c", "#e2b83c", "#fff0a0"] as const;
const STEEL = ["#0e1014", "#1e2229", "#363c46", "#5a6270", "#8e98a8"] as const;
const GRIP = ["#0a0808", "#1a1414", "#2c2220", "#443230"] as const;
const BL = ["#7a5a12", "#b08a1e", "#d8b436", "#f2d85a", "#fff4a0"] as const;
const LENS = ["#06070c", "#0e1220", "#1a2440", "#2e3a5c"] as const;
const TEETH = "#f4f0e0";
const TEETH_SHADE = "#b8b09c";
const LIP = "#a8524a";
const MOUTH = "#3a0e10";

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const bayer = (i: number, j: number) => (BAYER[((j % 4) + 4) % 4][((i % 4) + 4) % 4] + 0.5) / 16;
/** The ramp step for value v (0..1), dithered between neighbouring steps by threshold t. */
function pick(ramp: readonly string[], v: number, t: number) {
  const x = Math.min(Math.max(v, 0), 1) * (ramp.length - 1);
  const i = Math.min(Math.floor(x), ramp.length - 2);
  return x - i > t ? ramp[i + 1] : ramp[i];
}
const hash = (x: number, y: number, seed = 0) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return h - Math.floor(h);
};

/** Piecewise-linear lookup through sorted `[x, y]` keys. */
function interp(keys: readonly (readonly [number, number])[], x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++)
    if (x <= keys[i][0])
      return keys[i - 1][1] + ((keys[i][1] - keys[i - 1][1]) * (x - keys[i - 1][0])) / (keys[i][0] - keys[i - 1][0]);
  return keys[keys.length - 1][1];
}

/** Flat-shaded copy of a smooth three.js geometry. */
function flat(g: BufferGeometry) {
  const n = g.index ? g.toNonIndexed() : g;
  n.computeVertexNormals();
  return n;
}

// ---------------------------------------------------------------------------------------------------------------
// Paints. All of them work in square cells (of the face a point lies on) so every surface reads as big pixels.

const CELL = 0.02;

/** The cell (two indices) a point falls in on the face its normal points at. */
function cellIdx(p: Vector3, n: Vector3, cell: number): [number, number] {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const [u, v] = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
  return [Math.floor(u / cell), Math.floor(v / cell)];
}
/** The centre of the 3D cell containing p: every texel of a cell agrees on its value. */
function centre(p: Vector3, cell: number) {
  return new Vector3(
    (Math.floor(p.x / cell) + 0.5) * cell,
    (Math.floor(p.y / cell) + 0.5) * cell,
    (Math.floor(p.z / cell) + 0.5) * cell,
  );
}

/** Tanned skin, dithered; `extra` adds light (+) or shadow (-) at a cell centre (muscle grooves, veins). */
function skinPaint(cell: number, extra?: (q: Vector3, n: Vector3) => number, grain = 0.28) {
  return paint((p, n) => {
    const [iu, iv] = cellIdx(p, n, cell);
    const q = centre(p, cell);
    const g = noise(q, 0.09, 4) - 0.5;
    const v = 0.5 + 0.3 * n.y + 0.08 * n.z + grain * g + (extra ? 1.4 * extra(q, n) : 0);
    return pick(SK, v, bayer(iu, iv));
  });
}

/** Muscle lines painted on an arm from its three joints: biceps and triceps grooves, deltoid striations, a triceps
 *  horseshoe, a bulging biceps, forearm extensor line, brachioradialis and a wandering vein. */
function armMuscle(S: Vector3, E: Vector3, W: Vector3, s: number) {
  const a1 = E.clone().sub(S);
  const L1 = a1.length();
  a1.normalize();
  const a2 = W.clone().sub(E);
  const L2 = a2.length();
  a2.normalize();
  const medial = new Vector3(-s, 0, 0);
  const axes = (a: Vector3) => ({
    f: new Vector3(0, 0, 1).addScaledVector(a, -a.z).normalize(),
    m: medial.clone().addScaledVector(a, -medial.dot(a)).normalize(),
  });
  const A1 = axes(a1);
  const A2 = axes(a2);
  return (q: Vector3): number => {
    const upper = q.clone().sub(E).dot(a1) <= 0;
    const O = upper ? S : E;
    const a = upper ? a1 : a2;
    const A = upper ? A1 : A2;
    const d = q.clone().sub(O);
    const along = d.dot(a);
    const t = along / (upper ? L1 : L2);
    const r = d.addScaledVector(a, -along);
    const rho = r.length();
    if (rho < 0.02) return 0;
    const th = Math.atan2(r.dot(A.m), r.dot(A.f)) / DEG;
    // Arc distance (m) from the line at angle `c` degrees.
    const near = (c: number) => {
      let dt = Math.abs(th - c) % 360;
      if (dt > 180) dt = 360 - dt;
      return dt * DEG * rho < 0.011;
    };
    if (upper) {
      if (t > 0.2 && t < 0.9 && (near(-82) || near(96))) return -0.4;
      if (t > -0.4 && t < 0.2 && (near(-42) || near(38))) return -0.32;
      if (t > 0.26 && t < 0.62 && (near(140) || near(-140))) return -0.36;
      if (t > 0.58 && t < 0.65 && Math.abs(th) > 140) return -0.36;
      if (t > 0.3 && t < 0.74 && Math.abs(th) < 34) return 0.22;
      return 0;
    }
    if (t > 0.08 && t < 0.78 && near(-70)) return -0.32;
    if (t > 0.3 && t < 0.96 && near(12 + 24 * Math.sin(t * 10 + 1))) return -0.3;
    if (t > 0.1 && t < 0.45 && Math.abs(th + 18) < 32) return 0.17;
    if (t > 0.9 && t < 0.96) return -0.2;
    return 0;
  };
}

/** Olive cargo pants: dithered drab with dirt at the cuffs, knee patches with stitched borders, fly seam and hems. */
const PANTS_P = paint((p, n) => {
  const [iu, iv] = cellIdx(p, n, CELL);
  const t = bayer(iu, iv);
  const q = centre(p, CELL);
  const g = noise(q, 0.08, 7) - 0.5;
  let v = 0.5 + 0.28 * n.y + 0.08 * n.z + 0.3 * g;
  const y = q.y;
  if (y < 0.34) v -= 0.3 * (1 - y / 0.34) * (0.5 + hash(iu, iv, 2));
  // Knee patches on the front faces, thread-coloured border on the outer cells.
  if (n.z > 0.3 && y > 0.44 && y < 0.6) {
    const edge = y < 0.47 || y > 0.57;
    if (edge) return (iu + iv) % 2 === 0 ? PANTS[4] : PANTS[1];
    v -= 0.2;
  }
  if (y < 0.26 && y > 0.235) return (iu + iv) % 2 === 0 ? PANTS[0] : PANTS[1];
  if (Math.abs(q.x) < 0.012 && n.z > 0.3 && y > 0.86 && y < 1.045) return PANTS[0];
  // Wrinkles: sparse dark diagonal cells.
  if (hash(iu >> 1, iv, 9) < 0.035) v -= 0.22;
  return pick(PANTS, v, t);
});

/** Leather (belts, bandolier, pouches): brown ramp with stitched edges. */
function leatherPaint(cell: number) {
  return paint((p, n) => {
    const [iu, iv] = cellIdx(p, n, cell);
    const q = centre(p, cell);
    const g = noise(q, 0.05, 8) - 0.5;
    const v = 0.5 + 0.28 * n.y + 0.05 * n.z + 0.5 * g;
    return pick(BROWN, v, bayer(iu, iv));
  });
}
const STRAP_P = leatherPaint(0.012);

/** A stuck pouch: leather box whose top half is a flap with a brass snap, stitched along its lower edge. */
function pouchPaint(ramp: readonly string[], cy: number, hp: Vector3, thread: string) {
  const cell = 0.01;
  return paint((p, n) => {
    const [iu, iv] = cellIdx(p, n, cell);
    const q = centre(p, cell);
    const g = noise(q, 0.05, 3) - 0.5;
    const v = 0.5 + 0.28 * n.y + 0.5 * g;
    const dy = q.y - cy;
    if (Math.abs(dy + 0.012) < 0.007) return (iu + iv) % 2 === 0 ? thread : ramp[0];
    if (Math.hypot(q.x - hp.x, q.z - hp.z) < 0.011 && Math.abs(dy - 0.008) < 0.01) return BRASS[2];
    if (dy > 0.005) return pick(ramp, v + 0.06, bayer(iu, iv));
    return pick(ramp, v - 0.06, bayer(iu, iv));
  });
}

/** Buckle: brass plate with a dark centre, brighter on top. */
function buckle(hp: Vector3) {
  const cell = 0.008;
  return paint((p, n) => {
    const [iu, iv] = cellIdx(p, n, cell);
    const q = centre(p, cell);
    const dx = Math.abs(q.x - hp.x);
    const dy = Math.abs(q.y - hp.y);
    if (n.z > 0.6 && dx < 0.024 && dy < 0.011) return STEEL[0];
    return pick(BRASS, 0.55 + 0.3 * n.y + 0.2 * (hash(iu, iv, 4) - 0.5), bayer(iu, iv));
  });
}

/** Tank top, belt and pants in one paint keyed by height, so the torso reads as one garment stack. */
const TORSO_P = paint((p, n) => {
  const [iu, iv] = cellIdx(p, n, CELL);
  const q = centre(p, CELL);
  const t = bayer(iu, iv);
  const g = noise(q, 0.09, 11) - 0.5;
  const y = q.y;
  if (y < 1.045) return PANTS_P;
  if (y < 1.105) {
    const stitch = (y < 1.062 || y > 1.09) && (iu + iv) % 2 === 0;
    const hole = Math.abs(y - 1.075) < 0.008 && iu % 3 === 0 && n.z > 0.3;
    const v = 0.5 + 0.28 * n.y + 0.4 * g + (stitch ? 0.22 : 0) - (hole ? 0.5 : 0);
    return pick(BROWN, v, t);
  }
  const isSkin = (c: Vector3) => {
    const x = Math.abs(c.x);
    const front = Math.abs(n.z) > 0.3 ? n.z > 0 : c.z > 0.02;
    if (c.y < 1.105) return false;
    if (n.y > 0.6 && c.y > 1.46) return x < 0.105 || x > 0.205;
    if (x >= 0.205) return c.y > 1.3;
    if (x < 0.105) return front ? c.y > 1.43 + 3 * x * x : c.y > 1.47 + 3 * x * x;
    return false;
  };
  const skin = isSkin(q);
  if (skin) return pick(SK, 0.5 + 0.3 * n.y + 0.08 * n.z + 0.28 * g, t);
  // The garment's trim: a dark outline where it meets skin or the belt.
  const nb = [
    new Vector3(q.x + CELL, q.y, q.z),
    new Vector3(q.x - CELL, q.y, q.z),
    new Vector3(q.x, q.y + CELL, q.z),
    new Vector3(q.x, q.y - CELL, q.z),
  ];
  if (nb.some(isSkin)) return RED[1];
  if (y < 1.125) return RED[2];
  const x = Math.abs(q.x);
  const front = Math.abs(n.z) > 0.3 ? n.z > 0 : q.z > 0.02;
  let v = 0.52 + 0.3 * n.y + 0.1 * n.z + 0.3 * g;
  if (front) {
    if (x < 0.02 && y > 1.3 && y < 1.43) v -= 0.4;
    if (x < 0.23 && Math.abs(y - (1.365 - 1.6 * x * x)) < 0.011) v -= 0.4;
    if (y > 1.15 && y < 1.4 && x < 0.03 + (y - 1.15) * 0.25) v -= 0.22 + 0.12 * hash(iu, iv, 6);
  } else {
    if (x < 0.011 && y > 1.15 && y < 1.45) v -= 0.4;
    if (y > 1.3 && y < 1.44 && Math.abs(x - 0.1) < 0.011) v -= 0.3;
  }
  if (hash(iu >> 1, iv, 5) < 0.05) v -= 0.25;
  return pick(RED, v, t);
});

/** Combat boots: black leather with dithered shine, tread on the sole, welt line, laced instep. */
const BOOT_P = paint((p, n) => {
  const cell = 0.014;
  const [iu, iv] = cellIdx(p, n, cell);
  const t = bayer(iu, iv);
  const q = centre(p, cell);
  const y = q.y;
  if (y < 0.027) return pick(BOOT, 0.18 + 0.2 * ((iu + iv) % 2), t);
  if (y < 0.043) return (iu + iv) % 3 === 0 ? BOOT[2] : BOOT[3];
  const footX = Math.sign(q.x) * 0.135;
  if ((n.y > 0.5 || n.z > 0.6) && Math.abs(q.x - footX) < 0.03 && q.z > 0.02 && q.z < 0.2 && q.y > 0.06 && q.y < 0.225)
    return iv % 2 === 0 ? BOOT[4] : BOOT[1];
  if (q.y > 0.225 && q.z < 0.1) return q.y > 0.24 ? BOOT[4] : BOOT[3];
  const g = noise(q, 0.05, 2) - 0.5;
  let v = 0.32 + 0.35 * n.y + 0.12 * n.z + 0.4 * g;
  if (n.z > 0.5 && q.z > 0.18) v -= 0.1;
  return pick(BOOT, v, t);
});

/** Wraparound shades: near-black lens ramp with two diagonal glints on the front. */
const SHADES_P = paint((p, n) => {
  const cell = 0.008;
  const [iu, iv] = cellIdx(p, n, cell);
  const q = centre(p, cell);
  const d = (Math.abs(q.x) + q.y * 0.9) * 55;
  const glint = n.z > 0.5 && Math.abs(q.x) > 0.02 && Math.abs(q.x) < 0.08 && ((d % 9) + 9) % 9 < 1.4;
  if (glint) return (iu + iv) % 2 === 0 ? "#dfe8ff" : "#8fa8d0";
  return pick(LENS, 0.3 + 0.5 * n.y + 0.4 * (q.y - 1.727) * 30 + 0.3 * (hash(iu, iv, 1) - 0.5), bayer(iu, iv));
});

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures.

/** A pixel grid ("" = transparent) as an `svg()` drawing: one rect per horizontal run, rasterised 1:1. */
function pixelTexture(w: number, h: number, draw: (g: string[][]) => void) {
  const g = Array.from({ length: h }, () => Array<string>(w).fill(""));
  draw(g);
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = g[y][x];
      let n = 1;
      while (x + n < w && g[y][x + n] === c) n++;
      if (c) rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${c}"/>`);
      x += n;
    }
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}

type Rect = readonly [number, number, number, number];
/** Where each face of the head boxes sits on the 64x64 head sheet (pixels, y down). */
const HEAD_FACE = {
  frontUp: [0, 0, 28, 27],
  frontLo: [0, 27, 28, 36],
  sideUp: [28, 0, 64, 27],
  sideLo: [28, 27, 64, 36],
  backUp: [0, 36, 28, 63],
  backLo: [28, 36, 56, 45],
  topCap: [56, 36, 64, 44],
  botCap: [56, 44, 64, 52],
  roof: [28, 45, 56, 54],
  floor: [28, 54, 56, 63],
} as const satisfies Record<string, Rect>;
/** Hair sheet: front, back, side and top of the flat-top block. */
const HAIR_FACE = {
  front: [0, 0, 28, 16],
  back: [0, 16, 28, 32],
  side: [28, 0, 64, 16],
  top: [28, 16, 56, 50],
} as const satisfies Record<string, Rect>;

function headSheet() {
  return pixelTexture(64, 64, (g) => {
    const put = (r: Rect, x: number, y: number, c: string) => {
      if (x >= 0 && y >= 0 && x < r[2] - r[0] && y < r[3] - r[1]) g[r[1] + y][r[0] + x] = c;
    };
    const fill = (r: Rect, f: (x: number, y: number) => string) => {
      for (let y = 0; y < r[3] - r[1]; y++) for (let x = 0; x < r[2] - r[0]; x++) put(r, x, y, f(x, y));
    };
    const speckle = (x: number, y: number, chance: number, seed: number) =>
      hash(x, y, seed) < chance ? (hash(x, y, seed + 1) < 0.5 ? SK[2] : SK[1]) : "";

    // ---- front of the skull, mouth line to crown (28 x 27; mouth line is the bottom edge)
    const FU = HEAD_FACE.frontUp;
    fill(FU, (x, y) => {
      if (y < 6) return pick(BL, 0.5 + 0.25 * (hash(x, y) - 0.5), bayer(x, y));
      const ex = Math.abs(x - 13.5) / 13.5;
      const v = 0.72 - 0.42 * ex * ex + (y > 5 && y < 12 ? 0.05 : 0) - (y > 20 ? 0.03 : 0);
      return pick(SK, v, bayer(x, y));
    });
    // stubble on the lower cheeks and upper lip
    for (let y = 20; y < 27; y++)
      for (let x = 0; x < 28; x++) {
        const c = speckle(x, y, Math.abs(x - 13.5) > 4.5 ? 0.13 : y === 24 ? 0.1 : 0, 3);
        if (c) put(FU, x, y, c);
      }
    // brows: inner ends low (a scowl), the right one cocked higher
    for (let x = 3; x <= 11; x++) put(FU, x, x < 7 ? 12 : 13, x % 3 === 0 ? BL[0] : "#5c420c");
    for (let x = 16; x <= 24; x++) put(FU, x, x > 19 ? 11 : 12, x % 3 === 0 ? BL[0] : "#5c420c");
    put(FU, 12, 13, SK[1]);
    put(FU, 15, 12, SK[1]);
    // the shades
    const lensRow = (y: number, x0: number, x1: number, c: string) => {
      for (let x = x0; x <= x1; x++) put(FU, x, y, c);
    };
    for (const [a, b] of [
      [1, 12],
      [15, 26],
    ] as const) {
      lensRow(15, a + 1, b, "#2a2e3a");
      lensRow(16, a, b, LENS[2]);
      lensRow(17, a, b, LENS[1]);
      lensRow(18, a, b, LENS[0]);
      lensRow(19, a + 2, b - 2, LENS[1]);
    }
    lensRow(15, 13, 14, "#2a2e3a");
    lensRow(16, 13, 14, "#2a2e3a");
    for (const [x, y, c] of [
      [3, 18, "#8fa8d0"],
      [4, 17, "#dfe8ff"],
      [5, 16, "#dfe8ff"],
      [6, 16, "#8fa8d0"],
      [18, 18, "#8fa8d0"],
      [19, 17, "#dfe8ff"],
      [20, 16, "#dfe8ff"],
      [21, 16, "#8fa8d0"],
    ] as const)
      put(FU, x, y, c);
    // nose: lit ridge, shadowed wings, nostrils
    for (let y = 20; y <= 24; y++) {
      put(FU, 13, y, SK[4]);
      put(FU, 14, y, SK[4]);
      put(FU, 12, y, SK[2]);
      put(FU, 15, y, SK[2]);
    }
    for (const y of [22, 23, 24]) {
      put(FU, 11, y, SK[1]);
      put(FU, 16, y, SK[1]);
    }
    put(FU, 11, 24, SK[0]);
    put(FU, 16, 24, SK[0]);
    put(FU, 12, 24, SK[0]);
    put(FU, 15, 24, SK[0]);
    // nasolabial folds
    for (const [x, y] of [
      [9, 22],
      [8, 23],
      [8, 24],
      [7, 25],
      [18, 22],
      [19, 23],
      [20, 24],
    ] as const)
      put(FU, x, y, SK[1]);
    // smirk: teeth on the bottom row, upper lip above, the mouth corner riding up on the right
    for (let x = 8; x <= 20; x++) put(FU, x, 25, LIP);
    for (let x = 7; x <= 20; x++) put(FU, x, 26, x % 3 === 1 ? TEETH_SHADE : TEETH);
    put(FU, 6, 26, MOUTH);
    put(FU, 5, 26, SK[1]);
    for (const [x, y] of [
      [21, 26],
      [21, 25],
      [22, 25],
      [22, 24],
      [23, 24],
    ] as const)
      put(FU, x, y, MOUTH);
    put(FU, 24, 23, SK[1]);
    put(FU, 25, 23, SK[1]);

    // ---- front of the lower jaw (28 x 9): teeth, lower lip, cleft chin, stubble
    const FL = HEAD_FACE.frontLo;
    fill(FL, (x, y) => {
      const ex = Math.abs(x - 13.5) / 13.5;
      return pick(SK, 0.66 - 0.05 * y - 0.3 * ex * ex, bayer(x, y + 27));
    });
    for (let y = 2; y < 9; y++)
      for (let x = 0; x < 28; x++) {
        const c = speckle(x, y, 0.2, 5);
        if (c) put(FL, x, y, c);
      }
    for (let x = 7; x <= 19; x++) put(FL, x, 0, x % 3 === 1 ? TEETH_SHADE : TEETH);
    put(FL, 5, 0, SK[1]);
    put(FL, 6, 0, MOUTH);
    for (const x of [20, 21, 22]) put(FL, x, 0, MOUTH);
    for (let x = 9; x <= 19; x++) put(FL, x, 1, LIP);
    for (let x = 10; x <= 18; x++) put(FL, x, 2, x % 2 === 0 ? SK[1] : SK[2]);
    for (const [x, y] of [
      [13, 4],
      [14, 4],
      [13, 5],
      [14, 5],
      [13, 6],
    ] as const)
      put(FL, x, y, SK[1]);
    put(FL, 13, 3, SK[4]);
    put(FL, 14, 3, SK[4]);

    // ---- sides (drawn for the character's right, back at the left, front at the right; the left side mirrors it)
    const SU = HEAD_FACE.sideUp;
    const hairMask = (x: number, y: number) =>
      y < 6 || (x < 12 && y < 15) || (x < 7 && y < 19) || (x >= 22 && x <= 26 - Math.floor((y - 6) / 3) && y < 15);
    fill(SU, (x, y) => {
      if (hairMask(x, y)) return pick(BL, 0.42 + 0.3 * (hash(x, y, 2) - 0.5) - 0.06 * (y / 27), bayer(x, y));
      const back = x < 8 ? (8 - x) / 8 : 0;
      return pick(SK, 0.62 - 0.3 * back - 0.06 * (y / 27), bayer(x, y));
    });
    for (let y = 19; y < 27; y++)
      for (let x = 18; x < 36; x++) {
        const c = speckle(x, y, 0.15, 8);
        if (c && !hairMask(x, y)) put(SU, x, y, c);
      }
    // ear
    for (let y = 14; y <= 21; y++)
      for (let x = 13; x <= 19; x++) put(SU, x, y, y === 14 || y === 21 || x === 13 || x === 19 ? SK[1] : SK[2]);
    for (const [x, y] of [
      [15, 16],
      [16, 16],
      [15, 17],
      [16, 18],
      [16, 19],
    ] as const)
      put(SU, x, y, SK[0]);
    // shades: temple arm and wrap lens
    for (let x = 19; x < 36; x++) {
      put(SU, x, 16, "#2a2e3a");
      put(SU, x, 17, LENS[1]);
    }
    for (let x = 24; x < 36; x++) {
      put(SU, x, 15, "#2a2e3a");
      put(SU, x, 18, LENS[0]);
    }
    const SL = HEAD_FACE.sideLo;
    fill(SL, (x, y) => pick(SK, 0.55 - 0.045 * y - 0.25 * (x < 8 ? (8 - x) / 8 : 0), bayer(x, y + 27)));
    for (let y = 1; y < 9; y++)
      for (let x = 12; x < 36; x++) {
        const c = speckle(x, y, 0.22, 9);
        if (c) put(SL, x, y, c);
      }
    for (const x of [30, 31, 32, 33, 34, 35]) put(SL, x, 0, x > 33 ? MOUTH : SK[1]);

    // ---- back of the head: cropped nape hair fading into skin
    const BU = HEAD_FACE.backUp;
    fill(BU, (x, y) => {
      if (y < 12) return pick(BL, 0.5 - 0.2 * (y / 12) + 0.25 * (hash(x, y, 4) - 0.5), bayer(x, y));
      if (y < 16 && hash(x, y, 6) < (16 - y) / 5) return pick(BL, 0.25, bayer(x, y));
      return pick(SK, 0.42 - 0.012 * (y - 16), bayer(x, y));
    });
    fill(HEAD_FACE.backLo, (x, y) => pick(SK, 0.3 - 0.01 * y, bayer(x, y)));
    fill(HEAD_FACE.topCap, () => BL[1]);
    fill(HEAD_FACE.botCap, () => SK[0]);

    // ---- mouth interior: roof with the upper teeth at the front edge, floor with lower teeth and tongue
    fill(HEAD_FACE.roof, (x, y) => {
      if (y < 2) return x >= 7 && x <= 20 ? (x % 3 === 1 ? TEETH_SHADE : TEETH) : MOUTH;
      return pick(["#2a0a0c", "#5a1c20", "#80323a"], 0.35 + 0.25 * (hash(x, y, 7) - 0.5), bayer(x, y));
    });
    fill(HEAD_FACE.floor, (x, y) => {
      if (y < 2) return x >= 7 && x <= 20 ? (x % 3 === 1 ? TEETH_SHADE : TEETH) : MOUTH;
      if (x >= 8 && x <= 19 && y >= 2)
        return pick(["#7a2c38", "#a8505c", "#c8727a"], 0.5 + 0.2 * (hash(x, y, 3) - 0.5), bayer(x, y));
      return MOUTH;
    });
  });
}

function hairSheet() {
  return pixelTexture(64, 64, (g) => {
    const put = (r: Rect, x: number, y: number, c: string) => {
      if (x >= 0 && y >= 0 && x < r[2] - r[0] && y < r[3] - r[1]) g[r[1] + y][r[0] + x] = c;
    };
    // Bristles: vertical streaks (per-column value) with speckle; lit from above.
    const bristle = (r: Rect, x: number, y: number, top: boolean) => {
      const col = hash(x, 0, 5) - 0.5;
      const v = 0.6 + 0.3 * col + 0.35 * (hash(x, y, 2) - 0.5) + (top ? 0.06 : 0.12 - 0.08 * (y / (r[3] - r[1])));
      return pick(BL, v, bayer(x, y));
    };
    const block = (r: Rect, top: boolean, cut?: (x: number, y: number) => boolean) => {
      for (let y = 0; y < r[3] - r[1]; y++)
        for (let x = 0; x < r[2] - r[0]; x++) if (!cut || !cut(x, y)) put(r, x, y, bristle(r, x, y, top));
    };
    block(HAIR_FACE.front, false, (x, y) => (y === 15 && hash(x, 15) < 0.55) || (y === 14 && hash(x, 14) < 0.2));
    block(HAIR_FACE.back, false, (x, y) => y === 15 && hash(x, 41) < 0.4);
    block(
      HAIR_FACE.side,
      false,
      (x, y) => x >= 9 && x <= 23 && y >= 11 + (x > 19 ? 0 : 0) && !(x >= 22 && x <= 26 - Math.floor((y - 6) / 3)),
    );
    block(HAIR_FACE.top, true);
    // a lighter fringe line along the front edge of the top
    for (let x = 0; x < 28; x++) put(HAIR_FACE.top, x, 0, BL[3]);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Hand-unwrapped boxes for the head. A ring is one horizontal slice of the head: four corners (front +x, front -x,
// back -x, back +x). Faces are planar projections onto one texture rectangle each, u running along the face as seen
// from outside (sides: back to front, so both sides show the same drawing mirrored).

type Ring = { y: number; xf: number; zf: number; xb: number; zb: number };

class Hull {
  private pos: number[] = [];
  private uv: number[] = [];
  constructor(private rings: readonly Ring[]) {}

  private corner(r: Ring, k: number) {
    return k === 0
      ? new Vector3(r.xf, r.y, r.zf)
      : k === 1
        ? new Vector3(-r.xf, r.y, r.zf)
        : k === 2
          ? new Vector3(-r.xb, r.y, r.zb)
          : new Vector3(r.xb, r.y, r.zb);
  }

  /** `kind` face over rings i0..i1, textured from rectangle `rc` of the 64x64 sheet. */
  face(kind: "front" | "back" | "left" | "right" | "top" | "bottom", i0: number, i1: number, rc: Rect) {
    const rs = this.rings.slice(i0, i1 + 1);
    const X = Math.max(...rs.map((r) => Math.max(r.xf, r.xb)));
    const zmin = Math.min(...rs.map((r) => r.zb));
    const zmax = Math.max(...rs.map((r) => r.zf));
    const y0 = rs[0].y;
    const y1 = rs[rs.length - 1].y;
    const outward: Record<string, Vector3> = {
      front: new Vector3(0, 0, 1),
      back: new Vector3(0, 0, -1),
      left: new Vector3(1, 0, 0),
      right: new Vector3(-1, 0, 0),
      top: new Vector3(0, 1, 0),
      bottom: new Vector3(0, -1, 0),
    };
    const uvOf = (p: Vector3): [number, number] => {
      let fx: number;
      let fy: number;
      if (kind === "front") [fx, fy] = [(p.x + X) / (2 * X), (y1 - p.y) / (y1 - y0)];
      else if (kind === "back") [fx, fy] = [(X - p.x) / (2 * X), (y1 - p.y) / (y1 - y0)];
      else if (kind === "left" || kind === "right") [fx, fy] = [(p.z - zmin) / (zmax - zmin), (y1 - p.y) / (y1 - y0)];
      else [fx, fy] = [(X - p.x) / (2 * X), (zmax - p.z) / (zmax - zmin)];
      const w = rc[2] - rc[0];
      const h = rc[3] - rc[1];
      return [(rc[0] + 0.25 + fx * (w - 0.5)) / 64, 1 - (rc[1] + 0.25 + fy * (h - 0.5)) / 64];
    };
    const quad = (p: Vector3[]) => {
      const n = new Vector3().subVectors(p[1], p[0]).cross(new Vector3().subVectors(p[2], p[0]));
      const order = n.dot(outward[kind]) < 0 ? [0, 3, 2, 1] : [0, 1, 2, 3];
      for (const k of [order[0], order[1], order[2], order[0], order[2], order[3]]) {
        this.pos.push(p[k].x, p[k].y, p[k].z);
        this.uv.push(...uvOf(p[k]));
      }
    };
    if (kind === "top" || kind === "bottom") {
      const r = kind === "top" ? this.rings[i1] : this.rings[i0];
      quad([0, 1, 2, 3].map((k) => this.corner(r, k)));
      return;
    }
    const [a, b] = kind === "front" ? [1, 0] : kind === "back" ? [2, 3] : kind === "left" ? [0, 3] : [1, 2];
    for (let i = i0; i < i1; i++)
      quad([
        this.corner(this.rings[i], a),
        this.corner(this.rings[i + 1], a),
        this.corner(this.rings[i + 1], b),
        this.corner(this.rings[i], b),
      ]);
  }

  geometry() {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.pos, 3));
    g.setAttribute("uv", new Float32BufferAttribute(this.uv, 2));
    g.computeVertexNormals();
    return g;
  }
}

/** A flat-shaded solid from triangles (a, b, c) wound outward from `inside`. */
function solid(tris: [Vector3, Vector3, Vector3][], inside: Vector3) {
  const pos: number[] = [];
  for (const [a, b, c] of tris) {
    const n = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a));
    const mid = new Vector3().add(a).add(b).add(c).divideScalar(3).sub(inside);
    for (const p of n.dot(mid) < 0 ? [a, c, b] : [a, b, c]) pos.push(p.x, p.y, p.z);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// A local frame, for the gun and the hands: p() maps local coordinates to the model.

class Basis {
  constructor(
    readonly o: Vector3,
    readonly ex: Vector3,
    readonly ey: Vector3,
    readonly ez: Vector3,
  ) {}
  /** Frame whose z is `z`, with y leaning toward `yHint` (x is the character's left when z is forward). */
  static zy(o: Vector3, z: Vector3, yHint: Vector3) {
    const ez = z.clone().normalize();
    const ex = yHint.clone().cross(ez).normalize();
    return new Basis(o.clone(), ex, ez.clone().cross(ex), ez);
  }
  /** Frame whose y is `y`, with z leaning toward `zHint`. */
  static yz(o: Vector3, y: Vector3, zHint: Vector3) {
    const ey = y.clone().normalize();
    const ex = ey.clone().cross(zHint).normalize();
    return new Basis(o.clone(), ex, ey, ex.clone().cross(ey));
  }
  p(x: number, y: number, z: number) {
    return this.o.clone().addScaledVector(this.ex, x).addScaledVector(this.ey, y).addScaledVector(this.ez, z);
  }
  d(x: number, y: number, z: number) {
    return this.ex.clone().multiplyScalar(x).addScaledVector(this.ey, y).addScaledVector(this.ez, z);
  }
  local(p: Vector3) {
    const d = p.clone().sub(this.o);
    return new Vector3(d.dot(this.ex), d.dot(this.ey), d.dot(this.ez));
  }
  quat() {
    return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(this.ex, this.ey, this.ez));
  }
}

/** Points of a finger from `base`: each phalanx runs along the local direction (x across, y along, z toward the palm). */
function fingerPts(B: Basis, base: V3, lens: number[], dirs: V3[]) {
  const pts = [B.p(...base)];
  lens.forEach((len, i) => {
    const d = B.d(...dirs[i]).normalize();
    pts.push(pts[i].clone().addScaledVector(d, len));
  });
  return pts;
}

// Grip geometry of the pistol in gun space: back and front of the grip at height y (raked backward).
const gripBack = (y: number) => -0.044 + 0.15 * y;
const gripFront = (y: number) => 0.038 + 0.12 * y;

export default function build() {
  const b = createBuilder({ name: "retroActionHero", paintSize: 1024 });

  const HEAD_TEX = headSheet();
  const HAIR_TEX = hairSheet();

  // The head is authored at 1:1 in `head space` (chin at y 1.615) and scaled up 12% about the chin, which sits
  // low between the trapezius: big heads sat on big shoulders in 1996.
  const HS = 1.12;
  const HY = 1.598;
  const hp = (x: number, y: number, z: number) => new Vector3(x * HS, HY + (y - 1.615) * HS, z * HS);
  const sc = (r: Ring): Ring => ({
    y: HY + (r.y - 1.615) * HS,
    xf: r.xf * HS,
    zf: r.zf * HS,
    xb: r.xb * HS,
    zb: r.zb * HS,
  });

  // ---------------------------------------------------------------- spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.98, 0],
      [0, 1.12, 0.005],
      [0, 1.3, 0.01],
      [0, 1.5, 0.01],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 1.5, 0.008],
      [0, 1.565, 0.012],
      [0, 1.62, 0.012],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck", group: "head" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.62, 0.012],
    dir: [0, 1, 0],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, 1.7, -0.03),
    aim: hp(0, 1.62, 0.095),
    role: "jaw",
    group: "jaw",
  });

  // ---------------------------------------------------------------- torso: one octagonal prism, pelvis to shoulder line
  const TORSO_RX = [
    [0.84, 0.2],
    [0.95, 0.235],
    [1.035, 0.235],
    [1.045, 0.243],
    [1.105, 0.243],
    [1.115, 0.205],
    [1.2, 0.208],
    [1.3, 0.248],
    [1.4, 0.272],
    [1.46, 0.275],
    [1.5, 0.245],
  ] as const;
  const TORSO_RY = [
    [0.84, 0.125],
    [0.95, 0.14],
    [1.035, 0.14],
    [1.045, 0.148],
    [1.105, 0.148],
    [1.115, 0.125],
    [1.2, 0.14],
    [1.3, 0.155],
    [1.4, 0.16],
    [1.46, 0.15],
    [1.5, 0.12],
  ] as const;
  const torso = b.sweep(
    polyline([0.84, 0.95, 1.045, 1.115, 1.2, 1.3, 1.4, 1.5].map((y): V3 => [0, y, 0])),
    (t) => {
      const y = 0.84 + 0.66 * t;
      return [interp(TORSO_RX, y), interp(TORSO_RY, y)];
    },
    {
      bone: [hips, spine],
      color: TORSO_P,
      section: { ngon: 8 },
      caps: { start: "flat", end: "flat" },
      group: "body",
      name: "torso",
    },
  );

  // Trapezius and shoulder yoke: a tapered slab over the top of the ribs, straps painted on it.
  const yoke = b.extrude(
    [
      [-0.31, 1.44],
      [-0.305, 1.505],
      [-0.1, 1.62],
      [0.1, 1.62],
      [0.305, 1.505],
      [0.31, 1.44],
    ],
    {
      at: [0, 0, 0.005],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.24, 0.15],
      bevel: 0.018,
      color: TORSO_P,
      bone: chest,
      group: "body",
      name: "yoke",
    },
  );

  // Pecs: flat-shaded lumps under the tank.
  const pecs: Part[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const)
    pecs.push(
      b.part(flat(new SphereGeometry(1, 8, 5)), TORSO_P, {
        bone: chest,
        at: [s * 0.105, 1.385, 0.147],
        scale: [0.125, 0.078, 0.075],
        group: "body",
        name: `pec${side}`,
      }),
    );

  // Neck.
  b.sweep(neck, [0.088, 0.078, 0.076], {
    color: skinPaint(CELL),
    section: { ngon: 8 },
    caps: { start: "flat", end: "flat" },
    group: "head",
    name: "neck",
  });

  // ---------------------------------------------------------------- head
  const SKULL: Ring[] = [
    { y: 1.615, xf: 0.058, zf: 0.092, xb: 0.068, zb: -0.058 },
    { y: 1.64, xf: 0.074, zf: 0.104, xb: 0.085, zb: -0.085 },
    { y: 1.668, xf: 0.086, zf: 0.109, xb: 0.092, zb: -0.104 },
    { y: 1.715, xf: 0.093, zf: 0.113, xb: 0.096, zb: -0.112 },
    { y: 1.76, xf: 0.097, zf: 0.116, xb: 0.098, zb: -0.116 },
    { y: 1.805, xf: 0.095, zf: 0.11, xb: 0.097, zb: -0.114 },
    { y: 1.84, xf: 0.088, zf: 0.1, xb: 0.09, zb: -0.108 },
  ];
  const upper = new Hull(SKULL.slice(2).map(sc));
  upper.face("front", 0, 4, HEAD_FACE.frontUp);
  upper.face("back", 0, 4, HEAD_FACE.backUp);
  upper.face("left", 0, 4, HEAD_FACE.sideUp);
  upper.face("right", 0, 4, HEAD_FACE.sideUp);
  upper.face("top", 0, 4, HEAD_FACE.topCap);
  upper.face("bottom", 0, 4, HEAD_FACE.roof);
  const lower = new Hull(SKULL.slice(0, 3).map(sc));
  lower.face("front", 0, 2, HEAD_FACE.frontLo);
  lower.face("back", 0, 2, HEAD_FACE.backLo);
  lower.face("left", 0, 2, HEAD_FACE.sideLo);
  lower.face("right", 0, 2, HEAD_FACE.sideLo);
  lower.face("top", 0, 2, HEAD_FACE.floor);
  lower.face("bottom", 0, 2, HEAD_FACE.botCap);
  b.part(upper.geometry(), "#ffffff", { texture: HEAD_TEX, bone: head, at: [0, 0, 0], group: "head", name: "skull" });
  b.part(lower.geometry(), "#ffffff", { texture: HEAD_TEX, bone: jaw, at: [0, 0, 0], group: "jaw", name: "lowerJaw" });

  // Flat-top: a block of hair sitting on the skull, with a ragged hairline and sideburns in its alpha.
  const hair = new Hull(
    [
      { y: 1.8, xf: 0.102, zf: 0.118, xb: 0.104, zb: -0.122 },
      { y: 1.846, xf: 0.102, zf: 0.118, xb: 0.104, zb: -0.123 },
      { y: 1.888, xf: 0.096, zf: 0.113, xb: 0.098, zb: -0.118 },
    ].map(sc),
  );
  hair.face("front", 0, 2, HAIR_FACE.front);
  hair.face("back", 0, 2, HAIR_FACE.back);
  hair.face("left", 0, 2, HAIR_FACE.side);
  hair.face("right", 0, 2, HAIR_FACE.side);
  hair.face("top", 0, 2, HAIR_FACE.top);
  b.part(hair.geometry(), "#ffffff", { texture: HAIR_TEX, bone: head, at: [0, 0, 0], group: "head", name: "flatTop" });

  // Nose: a four-faced wedge on the face plane, below the shades.
  const B0 = hp(0, 1.737, 0.113);
  const T0 = hp(0, 1.699, 0.147);
  const NL = hp(0.023, 1.69, 0.111);
  const NR = hp(-0.023, 1.69, 0.111);
  b.part(
    solid(
      [
        [B0, T0, NL],
        [B0, NR, T0],
        [T0, NR, NL],
        [B0, NL, NR],
      ],
      hp(0, 1.71, 0.105),
    ),
    skinPaint(0.01),
    { bone: head, at: [0, 0, 0], group: "head", name: "nose" },
  );
  // Ears.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const)
    b.part(new BoxGeometry(0.02 * HS, 0.05 * HS, 0.03 * HS), skinPaint(0.01), {
      bone: head,
      at: hp(s * 0.101, 1.712, -0.03),
      group: "head",
      name: `ear${side}`,
    });
  // Wraparound shades: a faceted band of five slabs (two arms, two corners, the front lens).
  const wrap: V3[] = [
    [0.106, 1.73, -0.005],
    [0.106, 1.73, 0.104],
    [0.09, 1.73, 0.122],
    [-0.09, 1.73, 0.122],
    [-0.106, 1.73, 0.104],
    [-0.106, 1.73, -0.005],
  ];
  for (let i = 0; i + 1 < wrap.length; i++) {
    const a = hp(...wrap[i]);
    const c = hp(...wrap[i + 1]);
    const d = c.clone().sub(a);
    b.part(new BoxGeometry(d.length(), 0.032 * HS, 0.009 * HS), SHADES_P, {
      bone: head,
      at: a.clone().add(c).multiplyScalar(0.5),
      dir: d,
      axis: "x",
      group: "head",
      name: `shades${i}`,
    });
  }

  // ---------------------------------------------------------------- arms and hands
  const wrists: Joint[] = [];

  // The pistol arm's frame comes first: the forearm ends where the gun's grip wants the wrist.
  const rS = new Vector3(-0.335, 1.45, 0);
  const rE = rS.clone().addScaledVector(new Vector3(-0.5, -0.86, 0.05).normalize(), 0.33);
  const gunDir = new Vector3(-0.16, -0.09, 0.98).normalize();
  const rW = rE.clone().addScaledVector(gunDir, 0.28);
  const rH = rW.clone().addScaledVector(gunDir, 0.1);
  const G = Basis.zy(new Vector3(), gunDir, new Vector3(0, 1, 0));
  const WRIST_G: V3 = [-0.058, -0.1, -0.13]; // the wrist in gun space
  const gunO = rW.clone().sub(G.d(...WRIST_G));
  const gun = new Basis(gunO, G.ex, G.ey, G.ez);

  const lS = new Vector3(0.335, 1.45, 0);
  const lE = lS.clone().addScaledVector(new Vector3(0.5, -0.86, 0.05).normalize(), 0.33);
  const lW = lE.clone().addScaledVector(new Vector3(0.28, -0.9, 0.3).normalize(), 0.29);
  const lH = lW.clone().addScaledVector(new Vector3(0.1, -0.93, 0.35).normalize(), 0.1);

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const [S, E, W, H] = s > 0 ? [lS, lE, lW, lH] : [rS, rE, rW, rH];
    const arm = b.chain(`arm${side}`, [S, E, W, H], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    wrists.push(arm.joints[2]);
    const t = arm.ts;
    const keys = [
      [t[0], 0.112],
      [t[0] + (t[1] - t[0]) * 0.45, 0.122],
      [t[1], 0.088],
      [t[1] + (t[2] - t[1]) * 0.25, 0.1],
      [t[2], 0.06],
    ] as const;
    b.sweep(arm, (u) => interp(keys, u), {
      to: t[2],
      color: skinPaint(CELL, armMuscle(S, E, W, s), 0.16),
      section: { ngon: 8 },
      caps: { start: "flat", end: "flat" },
      group: `arm${side}`,
      name: `arm${side}`,
    });
    // Deltoid: a flat-shaded lump over the shoulder joint.
    b.part(flat(new SphereGeometry(1, 8, 5)), skinPaint(CELL, armMuscle(S, E, W, s), 0.16), {
      bone: arm.joints[0],
      at: [S.x + s * 0.005, S.y + 0.015, S.z],
      scale: [0.128, 0.118, 0.128],
      group: `arm${side}`,
      name: `deltoid${side}`,
    });
  }

  const HAND = skinPaint(0.012);
  const digits = ["thumb", "index", "middle", "ring", "pinky"] as const;
  const addFinger = (
    side: string,
    name: (typeof digits)[number],
    parent: Joint,
    pts: Vector3[],
    radii: readonly [number, number],
  ) => {
    const chain = b.chain(`${name}${side}`, pts, {
      parent,
      names: pts.slice(1).map((_, i) => `${name}${i + 1}${side}`),
      role: "digit",
      group: `arm${side}`,
    });
    b.sweep(chain, radii, {
      color: HAND,
      section: { ngon: 4 },
      caps: { start: "flat", end: "flat" },
      group: `arm${side}`,
      name: `${name}${side}`,
    });
  };

  // Left hand: open and relaxed, palm to the thigh, fingers slightly spread and curled.
  {
    const D = lH.clone().sub(lW).normalize();
    const H = Basis.yz(lW, D, new Vector3(-1, 0, 0));
    b.part(new BoxGeometry(0.12, 0.115, 0.055), HAND, {
      bone: wrists[0],
      at: H.p(0, 0.05, 0),
      quat: H.quat(),
      group: "armL",
      name: "palmL",
    });
    const spec: [(typeof digits)[number], number, number[], number, number][] = [
      ["index", -0.044, [0.05, 0.036, 0.03], -0.1, 8],
      ["middle", -0.015, [0.056, 0.039, 0.031], -0.02, 12],
      ["ring", 0.014, [0.05, 0.036, 0.029], 0.05, 16],
      ["pinky", 0.042, [0.04, 0.028, 0.024], 0.13, 20],
    ];
    for (const [name, x, lens, spread, curl] of spec) {
      const dirs = [0, 1, 2].map((i): V3 => {
        const a = ((curl * (i + 1)) / 1.4) * DEG;
        return [spread, Math.cos(a), Math.sin(a)];
      });
      addFinger("L", name, wrists[0], fingerPts(H, [x, 0.11, 0], lens, dirs), [0.02, 0.0135]);
    }
    addFinger(
      "L",
      "thumb",
      wrists[0],
      fingerPts(
        H,
        [-0.058, 0.035, 0.01],
        [0.048, 0.04, 0.034],
        [
          [-0.5, 0.8, 0.25],
          [-0.3, 0.85, 0.4],
          [-0.15, 0.85, 0.5],
        ],
      ),
      [0.024, 0.016],
    );
  }

  // Right hand: a fist closed round the pistol grip. The palm lies on the grip's outer side, the fingers wrap the front.
  {
    const gp = (x: number, y: number, z: number) => gun.p(x, y, z);
    b.part(new BoxGeometry(0.046, 0.125, 0.11), HAND, {
      bone: wrists[1],
      at: gp(-0.059, -0.095, -0.075),
      quat: gun.quat(),
      group: "armR",
      name: "palmR",
    });
    const ys = { index: -0.056, middle: -0.09, ring: -0.124, pinky: -0.155 } as const;
    for (const name of ["index", "middle", "ring", "pinky"] as const) {
      const y = ys[name];
      const r = name === "pinky" ? 0.0155 : 0.0175;
      const pts = [
        gp(-0.052, y, gripBack(y) + 0.008),
        gp(-0.048, y, gripFront(y) + 0.007),
        gp(0.034, y, gripFront(y) + 0.012),
        gp(0.048, y, gripFront(y) - 0.036),
      ];
      addFinger("R", name, wrists[1], pts, [r, r * 0.72]);
    }
    addFinger(
      "R",
      "thumb",
      wrists[1],
      [
        gp(-0.055, -0.045, -0.09),
        gp(0.0, -0.043, gripBack(-0.043) - 0.016),
        gp(0.049, -0.04, -0.055),
        gp(0.054, -0.038, 0.01),
      ],
      [0.022, 0.015],
    );
  }

  // ---------------------------------------------------------------- the pistol: rides the right wrist
  {
    const wr = wrists[1];
    const gunP = paint((p, n) => {
      const cell = 0.008;
      const [iu, iv] = cellIdx(p, n, cell);
      const t = bayer(iu, iv);
      const q = centre(p, cell);
      const L = gun.local(q);
      const nl = new Vector3(n.dot(gun.ex), n.dot(gun.ey), n.dot(gun.ez));
      const g = noise(q, 0.03, 5) - 0.5;
      const side = Math.abs(nl.x) > 0.6;
      const inGrip = L.y < -0.02 && L.z > gripBack(L.y) - 0.012 && L.z < gripFront(L.y) + 0.012;
      if (L.y < -0.185 && inGrip) return pick(STEEL, 0.5 + 0.3 * nl.y + 0.3 * g, t);
      if (inGrip) {
        const edge = L.y > -0.03 || L.y < -0.176 || L.z < gripBack(L.y) + 0.007 || L.z > gripFront(L.y) - 0.007;
        if (side && !edge) {
          if (Math.abs(L.y + 0.07) < 0.005 && Math.abs(L.z + 0.008) < 0.005) return BRASS[2];
          return pick(GRIP, 0.42 + 0.3 * (((iu + iv) & 1) === 0 ? 1 : 0) + 0.2 * g, t);
        }
        return pick(STEEL, 0.28 + 0.2 * nl.y + 0.2 * g, t);
      }
      let v = 0.5 + 0.32 * nl.y + 0.06 * nl.z + 0.3 * g;
      if (L.z > 0.283) return STEEL[0];
      if (nl.y > 0.6 && L.y > 0.07 && L.z > 0.2 && L.z < 0.28 && Math.floor(L.z / cell) % 2 === 0) return STEEL[0];
      if (L.y > 0.001) {
        // slide: rear serrations, ejection port, top rib
        if (L.z < -0.08 && L.z > -0.13 && side && L.y > 0.006 && L.y < 0.084 && Math.floor(L.z / cell) % 2 === 0)
          return STEEL[0];
        if (side && L.z > -0.012 && L.z < 0.085 && L.y > 0.036 && L.y < 0.076)
          return (iu + iv) % 7 === 0 ? STEEL[2] : STEEL[0];
        if (nl.y > 0.6 && Math.abs(L.x) < 0.01) v += 0.3;
        if (L.y > 0.084) v += 0.12;
      } else {
        v -= 0.16;
        if (side && L.y > -0.05 && L.y < -0.034 && Math.floor(L.z / cell) % 3 === 0) return STEEL[0];
      }
      return pick(STEEL, v, t);
    });
    const P = (z: number, y: number): [number, number] => [z, y];
    b.extrude([P(-0.14, 0), P(-0.14, 0.07), P(-0.12, 0.09), P(0.14, 0.09), P(0.19, 0.07), P(0.19, 0)], {
      at: gun.p(0, 0, 0),
      x: gun.ez,
      y: gun.ey,
      thickness: 0.07,
      bevel: 0.008,
      color: gunP,
      bone: wr,
      group: "gun",
      name: "slide",
    });
    b.extrude(
      [
        P(-0.13, 0.002),
        P(0.17, 0.002),
        P(0.17, -0.03),
        P(0.13, -0.055),
        P(-0.03, -0.055),
        P(-0.065, -0.025),
        P(-0.13, -0.025),
      ],
      {
        at: gun.p(0, 0, 0),
        x: gun.ez,
        y: gun.ey,
        thickness: 0.062,
        bevel: 0.005,
        color: gunP,
        bone: wr,
        group: "gun",
        name: "frame",
      },
    );
    b.extrude(
      [
        P(gripBack(-0.02), -0.02),
        P(gripFront(-0.02), -0.02),
        P(gripFront(-0.185), -0.185),
        P(gripBack(-0.185), -0.185),
      ],
      {
        at: gun.p(0, 0, 0),
        x: gun.ez,
        y: gun.ey,
        thickness: 0.062,
        bevel: 0.006,
        color: gunP,
        bone: wr,
        group: "gun",
        name: "grip",
      },
    );
    b.extrude([P(-0.085, -0.185), P(0.03, -0.185), P(0.03, -0.2), P(-0.085, -0.2)], {
      at: gun.p(0, 0, 0),
      x: gun.ez,
      y: gun.ey,
      thickness: 0.07,
      bevel: 0.003,
      color: gunP,
      bone: wr,
      group: "gun",
      name: "magBase",
    });
    b.part(new BoxGeometry(0.078, 0.08, 0.1), gunP, {
      bone: wr,
      at: gun.p(0, 0.05, 0.24),
      quat: gun.quat(),
      group: "gun",
      name: "compensator",
    });
    b.sweep([gun.p(0, 0.046, 0.15), gun.p(0, 0.046, 0.24)], 0.03, {
      color: gunP,
      section: { ngon: 6 },
      caps: { start: "flat", end: "flat" },
      bone: wr,
      group: "gun",
      name: "barrel",
    });
    b.sweep(
      [
        gun.p(0, -0.055, 0.075),
        gun.p(0, -0.085, 0.09),
        gun.p(0, -0.105, 0.055),
        gun.p(0, -0.1, gripFront(-0.1) + 0.004),
      ],
      0.007,
      {
        color: gunP,
        section: { ngon: 4 },
        caps: { start: "flat", end: "flat" },
        bone: wr,
        group: "gun",
        name: "triggerGuard",
      },
    );
    b.sweep([gun.p(0, -0.06, 0.04), gun.p(0, -0.082, 0.032)], 0.007, {
      color: gunP,
      section: { ngon: 4 },
      caps: { start: "flat", end: "flat" },
      bone: wr,
      group: "gun",
      name: "trigger",
    });
    for (const [x, y, z, w, h, d, name] of [
      [0, 0.099, -0.125, 0.04, 0.018, 0.016, "rearSight"],
      [0, 0.099, 0.165, 0.014, 0.018, 0.016, "frontSight"],
      [0, 0.066, -0.152, 0.018, 0.03, 0.024, "hammer"],
    ] as const)
      b.part(new BoxGeometry(w, h, d), gunP, { bone: wr, at: gun.p(x, y, z), quat: gun.quat(), group: "gun", name });
  }

  // ---------------------------------------------------------------- legs and boots
  const legSweeps: Sweep[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const ankleAt = new Vector3(s * 0.135, 0.165, -0.015);
    const knees = limb([s * 0.115, 0.93, 0], ankleAt, [0.387, 0.38], [[0, 0, 1]]);
    const ball = new Vector3(s * 0.135, 0.045, 0.13);
    const tip = new Vector3(s * 0.135, 0.04, 0.255);
    const leg = b.chain(`leg${side}`, [...knees, ball, tip], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.135, 0, 0.13],
      group: `leg${side}`,
    });
    const t = leg.ts;
    const cuffT = t[1] + ((t[2] - t[1]) * (knees[1].y - 0.235)) / (knees[1].y - knees[2].y);
    const keys = [
      [t[0], 0.138],
      [(t[0] + t[1]) / 2, 0.14],
      [t[1], 0.108],
      [(t[1] + t[2]) / 2, 0.1],
      [t[2], 0.108],
    ] as const;
    legSweeps.push(
      b.sweep(leg, (u) => interp(keys, u), {
        to: cuffT,
        color: PANTS_P,
        section: { ngon: 8 },
        caps: { start: "round", end: "flat" },
        group: `leg${side}`,
        name: `leg${side}`,
      }),
    );
    const ankle = leg.joints[2];
    const toe = leg.joints[3];
    const x = s * 0.135;
    b.frustumBox([x, 0.056, -0.088], [x, 0.056, 0.13], [0.132, 0.11], [0.136, 0.11], {
      color: BOOT_P,
      bone: ankle,
      group: `foot${side}`,
      name: `heel${side}`,
    });
    b.frustumBox([x, 0.046, 0.13], [x, 0.046, 0.262], [0.136, 0.09], [0.108, 0.07], {
      color: BOOT_P,
      bone: toe,
      group: `foot${side}`,
      name: `toeBox${side}`,
    });
    b.frustumBox([x, 0.05, -0.022], [x, 0.245, -0.022], [0.13, 0.15], [0.136, 0.156], {
      color: BOOT_P,
      bone: ankle,
      group: `foot${side}`,
      name: `shaft${side}`,
    });
  }

  // Cargo pockets on the outer thighs.
  for (const [i, s] of [1, -1].entries()) {
    const skin = b.surface(legSweeps[i]);
    const hit = skin.ray(new Vector3(s * 0.7, 0.72, 0.005), new Vector3(-s, 0, 0));
    if (hit)
      b.stick(new BoxGeometry(0.1, 0.06, 0.2), pouchPaint(PANTS, hit.at.y, hit.at, PANTS[4]), hit, {
        embed: 0.35,
        flow: new Vector3(0, -1, 0),
        group: "pants",
        name: `pocket${s > 0 ? "L" : "R"}`,
      });
  }

  // ---------------------------------------------------------------- belt kit and bandolier
  const skinTorso = b.surface([torso, yoke, ...pecs]);
  for (const s of [1, -1]) {
    const hit = skinTorso.ray(new Vector3(s * 0.15, 1.075, 0.6), new Vector3(0, 0, -1));
    if (hit)
      b.stick(new BoxGeometry(0.08, 0.045, 0.085), pouchPaint(BROWN, hit.at.y, hit.at, BROWN[4]), hit, {
        embed: 0.3,
        flow: new Vector3(0, -1, 0),
        bone: hips,
        group: "belt",
        name: s > 0 ? "pouchL" : "pouchR",
      });
  }
  const bh = skinTorso.ray(new Vector3(0, 1.075, 0.6), new Vector3(0, 0, -1));
  if (bh)
    b.stick(new BoxGeometry(0.07, 0.018, 0.048), buckle(bh.at), bh, {
      embed: 0.25,
      flow: new Vector3(0, -1, 0),
      bone: hips,
      group: "belt",
      name: "buckle",
    });

  const loop = catmull(
    (
      [
        [-0.19, 1.56, 0.08],
        [-0.12, 1.45, 0.22],
        [0.0, 1.31, 0.24],
        [0.14, 1.18, 0.2],
        [0.25, 1.09, 0.1],
        [0.29, 1.07, 0.0],
        [0.25, 1.09, -0.12],
        [0.14, 1.2, -0.19],
        [0.0, 1.32, -0.2],
        [-0.12, 1.45, -0.17],
        [-0.19, 1.56, -0.08],
      ] as V3[]
    ).map((p) => new Vector3(...p)),
    { closed: true },
  );
  const strap = b.sweep(skinTorso.drape(loop, { lift: 0.012 }), 0.028, {
    color: STRAP_P,
    section: { ngon: 6 },
    bone: chest,
    group: "bandolier",
    name: "bandolier",
  });
  // Brass rounds lie across the front of the strap, seated on the torso surface under its centreline.
  const centreline = strap.curve();
  const N = 120;
  let lastAt: Vector3 | null = null;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const pt = centreline.at(t);
    const out = skinTorso.nearest(pt).n;
    if (!(out.z > 0.45 && pt.z > 0.1 && pt.y > 1.12)) continue;
    if (lastAt && pt.distanceTo(lastAt) < 0.055) continue;
    lastAt = pt.clone();
    // Each round lies across the strap: a brass hex casing with a copper cone for the slug.
    const across = new Vector3().crossVectors(centreline.tangentAt(t), out).normalize();
    const mid = pt.clone().addScaledVector(out, 0.022);
    const tail = mid.clone().addScaledVector(across, -0.03);
    const neck = mid.clone().addScaledVector(across, 0.008);
    const opts = { section: { ngon: 6 }, bone: chest, group: "bandolier", name: "round" } as const;
    b.rod(tail, neck, 0.0135, { ...opts, color: BRASS[2] });
    b.spike(neck, across, 0.03, 0.011, { ...opts, color: "#c8642a" });
  }

  // Rest pose: mouth closed, everything neutral. (No pose needed: the build is the rest pose.)
  return b.root;
}
