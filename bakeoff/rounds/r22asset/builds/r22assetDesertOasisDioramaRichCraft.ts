import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { grain, mottle, paint, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis",
  description:
    "A round sandstone-rimmed diorama: a turquoise pond ringed by rocks, reeds and lily pads, five curved palms, a striped round tent and a gable tent with awning, a campfire with a cooking pot, a resting camel and two wandering camels, crates, jars, cactus, bunting and a water sign.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

const RAD = Math.PI / 180;
const G = 0.12; // top of the base disc

// palette
const SAND = "#e8c27a";
const SAND2 = "#f4d89a";
const SAND3 = "#f9e6b4";
const SAND_D = "#c99a54";
const MUD = "#8a6a3c";
const WATER = "#2fb3c6";
const WATER2 = "#86e4e2";
const ROCK = "#b09a82";
const ROCK2 = "#86725f";
const GRASS = "#62b042";
const GRASS2 = "#3f8c37";
const GRASS3 = "#9ccc5a";
const PALM = "#33a04a";
const PALM2 = "#5cbc54";
const PALM_D = "#277a3c";
const TRUNK = "#946236";
const TRUNKD = "#5e3a1e";
const COCO = "#6b4423";
const RED = "#d8473c";
const CREAM = "#fff0d0";
const BLUE = "#2f6fb8";
const TEAL = "#2a9d8f";
const YELLOW = "#f2b630";
const GOLD = "#e8b020";
const PINK = "#e0698a";
const ORANGE = "#ef7b2a";
const CAMEL1 = "#cf9650";
const CAMEL1L = "#e6bb7c";
const CAMEL2 = "#b97d3e";
const CAMEL2L = "#d9a565";
const CAMEL3 = "#e0b070";
const CAMEL3L = "#f2cf98";
const CAMELD = "#7a4c26";
const DARK = "#2a1c18";
const ROPE = "#d3ba8e";
const WOOD = "#8a5a30";
const WOODD = "#5f3b1d";
const WOODC = "#a06c3a";
const IRON = "#3b3a42";
const TERRA = "#c8663a";
const SILVER = "#cfd6dc";
const SMOKE = "#f1ede6";
const CACT = "#4fa05a";
const CACTD = "#2f7a46";

type V3t = [number, number, number];
type Opt = { scale?: number | V3t; rot?: V3t; flat?: boolean; texture?: THREE.Texture; name?: string };
type RadiusIn = number | number[] | ((t: number) => number | [number, number]);

export default function build() {
  const b = createBuilder({ name: "desertOasis" });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const sph = () => new THREE.SphereGeometry(1, 8, 6);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const cone = (r: number, h: number, seg = 6) => new THREE.ConeGeometry(r, h, seg);
  const dodeca = () => new THREE.DodecahedronGeometry(1, 0);

  // A local frame: position, yaw (degrees about +Y) and uniform scale. Everything placed through it moves with it.
  const mk = (cx: number, cz: number, yaw = 0, s = 1, cy = G) => {
    const yq = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw * RAD);
    const P = (x: number, y: number, z: number) => V(x * s, y * s, z * s).applyQuaternion(yq).add(V(cx, cy, cz));
    const D = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(yq);
    const part = (geo: THREE.BufferGeometry, color: Fill, x: number, y: number, z: number, o: Opt = {}) => {
      const [rx, ry, rz] = o.rot ?? [0, 0, 0];
      const q = yq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * RAD, ry * RAD, rz * RAD)));
      const sc: V3t = o.scale === undefined ? [1, 1, 1] : typeof o.scale === "number" ? [o.scale, o.scale, o.scale] : o.scale;
      const opts: PartOptions = { at: P(x, y, z), quat: q, scale: [sc[0] * s, sc[1] * s, sc[2] * s], flat: o.flat ?? true };
      if (o.texture) opts.texture = o.texture;
      if (o.name) opts.name = o.name;
      return b.part(geo, color, opts);
    };
    const rs = (r: RadiusIn): RadiusIn =>
      typeof r === "number"
        ? r * s
        : Array.isArray(r)
          ? r.map((v) => v * s)
          : (t: number): number | [number, number] => {
              const v = r(t);
              return typeof v === "number" ? v * s : [v[0] * s, v[1] * s];
            };
    const sweep = (pts: V3t[], radius: RadiusIn, color: Fill, o: SweepOptions = {}) =>
      b.sweep(
        pts.map((p) => P(p[0], p[1], p[2])),
        rs(radius),
        { sides: 6, caps: "round", ...o, color },
      );
    const rod = (a: V3t, c: V3t, r: number, color: Fill, o: SweepOptions = {}) =>
      b.rod(P(a[0], a[1], a[2]), P(c[0], c[1], c[2]), r * s, color, { sides: 6, ...o });
    const lathe = (outline: Array<[number, number]>, x: number, y: number, z: number, color: Fill, segments = 8) =>
      b.lathe(outline, { at: P(x, y, z), axis: D(0, 1, 0), color, segments });
    const extrude = (
      outline: OutlinePoint[],
      x: number,
      y: number,
      z: number,
      xdir: V3t,
      thickness: number,
      color: Fill,
      bevel = 0,
    ) => b.extrude(outline, { at: P(x, y, z), x: D(xdir[0], xdir[1], xdir[2]), thickness: thickness * s, color, bevel });
    return { P, D, part, sweep, rod, lathe, extrude };
  };
  const W = mk(0, 0, 0, 1, 0);

  // ------------------------------------------------------------------ base and dunes
  const sandTop = mottle(SAND2, SAND, { size: 0.3, contrast: 0.7, seed: 3 });
  const strata = stripes(SAND_D, "#dcae66", { size: 0.025, axis: "y", width: 0.5, wobble: 0.3 });
  b.lathe(
    [
      [0, 0],
      [1.28, 0],
      [1.32, 0.03],
      [1.3, 0.1],
      [1.22, G],
      [0, G],
    ],
    { at: [0, 0, 0], color: paint((_p, n) => (n.y > 0.6 ? sandTop : strata)), segments: 24 },
  );
  const duneCol = mottle(SAND3, SAND2, { size: 0.35, contrast: 0.6, seed: 8 });
  const dunes: Array<[number, number, number, number, number]> = [
    [-0.35, -0.85, 0.55, 0.1, 0.3],
    [0.2, -0.95, 0.45, 0.1, 0.25],
    [-0.95, -0.1, 0.2, 0.08, 0.28],
  ];
  for (const [x, z, sx, sy, sz] of dunes) W.part(sph(), duneCol, x, G, z, { scale: [sx, sy, sz] });

  const ell = (x: number, z: number, cx: number, cz: number, rx: number, rz: number) =>
    ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2;
  const free = (x: number, z: number) =>
    Math.hypot(x, z) < 1.1 &&
    ell(x, z, 0.1, 0.25, 0.95, 0.75) > 1 &&
    Math.hypot(x + 0.78, z + 0.35) > 0.5 &&
    Math.hypot(x - 0.85, z + 0.15) > 0.55 &&
    ell(x, z, -0.35, -0.85, 0.6, 0.35) > 1.1 &&
    ell(x, z, 0.2, -0.95, 0.5, 0.3) > 1.1 &&
    ell(x, z, -0.95, -0.1, 0.25, 0.3) > 1.1 &&
    Math.hypot(x - 0.45, z - 0.88) > 0.4 &&
    Math.hypot(x + 0.5, z + 0.5) > 0.25;
  let ripples = 0;
  for (let i = 0; i < 700 && ripples < 26; i++) {
    const x = (rand() - 0.5) * 2.4;
    const z = (rand() - 0.5) * 2.4;
    if (!free(x, z)) continue;
    ripples++;
    W.part(box(0.16 + rand() * 0.1, 0.004, 0.012), SAND_D, x, G + 0.002, z, { rot: [0, rand() * 40 - 20, 0] });
    W.part(box(0.1, 0.004, 0.01), SAND_D, x + 0.04, G + 0.002, z + 0.035, { rot: [0, rand() * 40 - 20, 0] });
  }
  let pebbles = 0;
  for (let i = 0; i < 500 && pebbles < 14; i++) {
    const x = (rand() - 0.5) * 2.4;
    const z = (rand() - 0.5) * 2.4;
    if (!free(x, z)) continue;
    pebbles++;
    const r = 0.014 + rand() * 0.016;
    W.part(dodeca(), [ROCK, ROCK2, SAND_D][pebbles % 3], x, G + r * 0.2, z, {
      scale: [r * 1.2, r * 0.7, r],
      rot: [0, rand() * 360, 0],
    });
  }

  // ------------------------------------------------------------------ pond
  W.part(cyl(1, 1, 0.01, 14), mottle(GRASS, GRASS3, { size: 0.3, contrast: 0.8, seed: 5 }), 0.1, G + 0.003, 0.25, {
    scale: [0.85, 1, 0.65],
  });
  W.part(cyl(1, 1, 0.012, 12), MUD, 0.1, G + 0.006, 0.25, { scale: [0.56, 1, 0.43] });
  W.part(cyl(1, 1, 0.02, 12), mottle(WATER, WATER2, { size: 0.18, contrast: 0.8, seed: 2 }), 0.1, G + 0.01, 0.25, {
    scale: [0.5, 1, 0.37],
  });
  for (let i = 0; i < 14; i++) {
    const a = i * (360 / 14) + 8;
    if (a > 45 && a < 135) continue;
    const ar = a * RAD;
    const x = 0.1 + Math.cos(ar) * 0.62;
    const z = 0.25 + Math.sin(ar) * 0.46;
    const rr = 0.04 + rand() * 0.035;
    W.part(dodeca(), i % 2 ? ROCK : ROCK2, x, G + rr * 0.3, z, {
      scale: [rr * 1.2, rr * 0.8, rr],
      rot: [rand() * 40, rand() * 360, rand() * 40],
    });
  }
  const pads: Array<[number, number, number]> = [
    [0.0, 0.2, 0.055],
    [0.22, 0.34, 0.045],
    [-0.15, 0.36, 0.05],
    [0.32, 0.14, 0.04],
  ];
  pads.forEach(([x, z, r], i) => {
    W.part(cyl(1, 1, 0.006, 8), i % 2 ? GRASS : GRASS2, x, G + 0.023, z, { scale: [r, 1, r] });
    if (i % 2 === 0) {
      W.part(cone(0.02, 0.03, 5), PINK, x + 0.01, G + 0.04, z, { rot: [0, 0, 0] });
      W.part(sph(), YELLOW, x + 0.01, G + 0.036, z, { scale: 0.009 });
    }
  });
  for (let i = 0; i < 5; i++)
    W.part(box(0.04, 0.003, 0.008), WATER2, 0.1 + (rand() - 0.5) * 0.7, G + 0.021, 0.25 + (rand() - 0.5) * 0.45, {
      rot: [0, rand() * 90, 0],
    });
  // reeds and cattails
  for (let i = 0; i < 10; i++) {
    const a = (190 + i * 7) * RAD;
    const x = 0.1 + Math.cos(a) * (0.55 + rand() * 0.06);
    const z = 0.25 + Math.sin(a) * (0.4 + rand() * 0.05);
    const hgt = 0.18 + rand() * 0.12;
    const lx = (rand() - 0.5) * 0.06;
    const lz = (rand() - 0.5) * 0.06;
    W.sweep(
      [
        [x, G, z],
        [x + lx * 0.5, G + hgt * 0.5, z + lz * 0.5],
        [x + lx, G + hgt, z + lz],
      ],
      [0.008, 0.005, 0.002],
      i % 2 ? GRASS2 : GRASS,
      { sides: 4, caps: "point" },
    );
    if (i % 3 === 0) W.part(cyl(0.011, 0.011, 0.055, 6), COCO, x + lx, G + hgt - 0.01, z + lz);
  }

  const tuft = (x: number, z: number, k: number) => {
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + x * 5;
      W.part(cone(0.013 * k, 0.075 * k, 4), i % 2 ? GRASS2 : GRASS, x + Math.cos(a) * 0.02, G + 0.03 * k, z + Math.sin(a) * 0.02, {
        rot: [(rand() - 0.5) * 40, 0, (rand() - 0.5) * 40],
      });
    }
  };
  [
    [-0.4, 0.5],
    [0.62, 0.52],
    [0.2, 0.68],
    [-0.1, 0.62],
    [0.5, -0.08],
    [-0.62, 0.3],
    [0.72, 0.28],
    [0.0, -0.18],
    [0.38, -0.36],
    [-0.28, -0.2],
  ].forEach(([x, z], i) => tuft(x, z, 0.8 + (i % 3) * 0.25));

  // ------------------------------------------------------------------ palms
  const leafW =
    (w: number) =>
    (t: number): [number, number] => [Math.max(0.004, w * Math.sin(Math.PI * (0.06 + 0.94 * t)) ** 0.6 * (1 - 0.25 * t)), 0.006];
  const palm = (x: number, z: number, h: number, lx: number, lz: number, nf: number, fl: number, seed: number) => {
    const r = rng(seed);
    const pts = [0, 0.25, 0.5, 0.75, 1].map((t) => V(x + lx * h * t * t, G - 0.02 + h * t, z + lz * h * t * t));
    const k = 0.55 + 0.45 * h;
    b.sweep(pts, [0.062 * k, 0.048 * k, 0.04 * k, 0.035 * k, 0.033 * k], {
      color: stripes(TRUNK, TRUNKD, { size: 0.055, axis: "y", width: 0.4, wobble: 0.12, seed }),
      sides: 7,
    });
    const top = pts[4];
    W.part(sph(), TRUNKD, top.x, top.y, top.z, { scale: 0.05 * k + 0.012 });
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6 + seed;
      W.part(sph(), COCO, top.x + Math.cos(a) * 0.045, top.y - 0.04, top.z + Math.sin(a) * 0.045, { scale: 0.028 });
    }
    const frond = (
      d: THREE.Vector3,
      L: number,
      f1: number,
      y1: number,
      f2: number,
      y2: number,
      f3: number,
      y3: number,
      col: string,
      w: number,
    ) => {
      const at = (f: number, y: number) => top.clone().addScaledVector(d, f * L).add(V(0, y, 0));
      const p0 = at(0, 0.02);
      const p1 = at(f1, y1);
      const p2 = at(f2, y2);
      const p3 = at(f3, y3);
      b.sweep(bezier(p0, p1, p2, p3), leafW(w), { color: col, section: "box", caps: "flat" });
      const up = V(0, 0.008, 0);
      b.sweep(bezier(p0.clone().add(up), p1.clone().add(up), p2.clone().add(up), p3.clone().add(up)), [0.007, 0.002], {
        color: PALM_D,
        sides: 4,
        caps: "flat",
      });
    };
    for (let i = 0; i < nf; i++) {
      const a = (i / nf) * Math.PI * 2 + r() * 0.35;
      const L = fl * (0.85 + 0.3 * r());
      const drop = 0.12 + 0.2 * r() * (L / 0.5);
      const rise = 0.14 + 0.08 * r();
      frond(V(Math.cos(a), 0, Math.sin(a)), L, 0.32, rise + 0.06, 0.68, rise + 0.04, 1, -drop, i % 2 ? PALM : PALM2, 0.075 * (fl / 0.5));
    }
    for (let j = 0; j < 3; j++) {
      const a = r() * Math.PI * 2;
      frond(V(Math.cos(a), 0, Math.sin(a)), fl * 0.6, 0.1, 0.14, 0.2, 0.26, 0.32, 0.32, PALM2, 0.05 * (fl / 0.5));
    }
    tuft(x + 0.06, z + 0.05, 0.8);
    return pts;
  };
  const palmA = palm(-0.45, 0.05, 1.0, 0.35, 0.1, 9, 0.5, 21);
  palm(0.45, -0.5, 0.9, -0.2, 0.3, 9, 0.46, 22);
  palm(-0.1, -0.6, 0.72, 0.1, 0.2, 8, 0.4, 23);
  palm(1.0, 0.3, 0.5, -0.2, 0.1, 7, 0.3, 24);

  // ------------------------------------------------------------------ round striped tent
  const tentPaint = (cx: number, cz: number, phase: number, a: string, c: string) =>
    paint((p) => {
      const ang = Math.atan2(p.x - cx, p.z - cz) / RAD - phase;
      const k = Math.floor((((ang % 360) + 360) % 360) / 60 + 1e-6);
      return k % 2 ? a : c;
    });
  const tAyaw = 35;
  const tA = mk(-0.78, -0.35, tAyaw);
  tA.part(cyl(0.28, 0.3, 0.16, 6), tentPaint(-0.78, -0.35, tAyaw + 30, CREAM, TEAL), 0, 0.08, 0, { rot: [0, 30, 0] });
  tA.part(cone(0.34, 0.36, 6), tentPaint(-0.78, -0.35, tAyaw + 30, RED, CREAM), 0, 0.34, 0, { rot: [0, 30, 0] });
  tA.part(cyl(0.345, 0.345, 0.025, 6), GOLD, 0, 0.162, 0, { rot: [0, 30, 0] });
  tA.rod([0, 0.5, 0], [0, 0.68, 0], 0.008, WOOD);
  tA.part(sph(), GOLD, 0, 0.7, 0, { scale: 0.026 });
  tA.extrude(
    [
      [0, 0],
      [0.15, 0.03],
      [0, 0.06],
    ],
    0.008,
    0.62,
    0,
    [1, 0, 0],
    0.006,
    RED,
  );
  // door
  tA.extrude(
    [
      [-0.075, 0],
      [0.075, 0],
      [0.075, 0.1],
      [0, 0.155],
      [-0.075, 0.1],
    ],
    0,
    0,
    0.256,
    [1, 0, 0],
    0.02,
    DARK,
  );
  for (const sx of [1, -1]) {
    tA.part(box(0.045, 0.14, 0.012), RED, sx * 0.1, 0.075, 0.265, { rot: [0, sx * 20, sx * -12] });
    tA.part(sph(), GOLD, sx * 0.082, 0.1, 0.275, { scale: 0.009 });
  }
  for (let k = 0; k < 6; k++) {
    const a = (30 + 60 * k) * RAD;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    tA.rod([0.34 * sa, 0.16, 0.34 * ca], [0.56 * sa, 0.05, 0.56 * ca], 0.004, ROPE, { sides: 4 });
    tA.rod([0.56 * sa, -0.01, 0.56 * ca], [0.56 * sa, 0.07, 0.56 * ca], 0.011, WOOD);
  }
  // rug, cushions, tea tray
  tA.part(box(0.4, 0.008, 0.28), CREAM, 0, 0.004, 0.47);
  tA.part(box(0.34, 0.012, 0.22), stripes(RED, BLUE, { size: 0.045, axis: tA.D(1, 0, 0), width: 0.5, wobble: 0.05 }), 0, 0.006, 0.47);
  tA.part(sph(), PINK, 0.1, 0.03, 0.52, { scale: [0.05, 0.022, 0.04], rot: [0, 25, 0] });
  tA.part(sph(), TEAL, 0.13, 0.026, 0.42, { scale: [0.04, 0.02, 0.035], rot: [0, -20, 0] });
  tA.part(cyl(0.06, 0.06, 0.008, 10), GOLD, -0.08, 0.016, 0.47);
  tA.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.03, 0.015],
      [0.026, 0.035],
      [0.012, 0.04],
      [0, 0.04],
    ],
    -0.08,
    0.02,
    0.47,
    SILVER,
  );
  tA.part(cone(0.008, 0.02, 4), SILVER, -0.08, 0.062, 0.47);
  tA.part(cyl(0.013, 0.01, 0.018, 6), CREAM, -0.04, 0.029, 0.5);
  tA.part(cyl(0.013, 0.01, 0.018, 6), CREAM, -0.11, 0.029, 0.43);
  // water skin by the door
  tA.part(sph(), WOODC, -0.2, 0.06, 0.32, { scale: [0.05, 0.04, 0.035], rot: [0, 20, 0] });
  tA.part(cone(0.012, 0.03, 5), WOODD, -0.2, 0.11, 0.32);

  // bunting from the tent pole to the first palm
  {
    const a = tA.P(0, 0.66, 0);
    const c = palmA[2].clone().add(V(0.03, 0, 0.03));
    const mid = a.clone().lerp(c, 0.5).add(V(0, -0.1, 0));
    const path = catmull([a, mid, c]);
    b.sweep(path, 0.004, { color: ROPE, sides: 4 });
    const flags = [RED, YELLOW, BLUE, TEAL, PINK];
    for (let k = 1; k < 10; k++) {
      const p = path.at(k / 10);
      W.part(cone(0.03, 0.06, 3), flags[k % 5], p.x, p.y - 0.032, p.z, { rot: [180, k * 40, 0] });
    }
  }

  // ------------------------------------------------------------------ gable tent
  const tB = mk(0.85, -0.15, -30);
  const stripeB = stripes(CREAM, BLUE, { size: 0.1, axis: tB.D(1, 0, 0), width: 0.5, wobble: 0.05 });
  tB.extrude(
    [
      [-0.26, 0],
      [0.26, 0],
      [0.26, 0.13],
      [0, 0.4, "sharp"],
      [-0.26, 0.13],
    ],
    0,
    0,
    0,
    [1, 0, 0],
    0.5,
    stripeB,
    0.008,
  );
  tB.extrude(
    [
      [-0.115, 0],
      [0.115, 0],
      [0.115, 0.105],
      [0, 0.245, "sharp"],
      [-0.115, 0.105],
    ],
    0,
    0,
    0.252,
    [1, 0, 0],
    0.01,
    GOLD,
  );
  tB.extrude(
    [
      [-0.095, 0],
      [0.095, 0],
      [0.095, 0.1],
      [0, 0.215, "sharp"],
      [-0.095, 0.1],
    ],
    0,
    0,
    0.26,
    [1, 0, 0],
    0.012,
    DARK,
  );
  for (const z of [0.256, -0.256])
    for (const sx of [1, -1])
      tB.rod([sx * 0.26, 0.13, z], [0, 0.4, z], 0.008, GOLD, { sides: 4 });
  tB.rod([0, 0.4, -0.34], [0, 0.4, 0.34], 0.012, WOOD);
  tB.part(sph(), GOLD, 0, 0.4, 0.35, { scale: 0.024 });
  tB.part(sph(), GOLD, 0, 0.4, -0.35, { scale: 0.024 });
  tB.extrude(
    [
      [0, 0],
      [0.13, 0.015],
      [0, 0.04],
    ],
    0,
    0.41,
    0.36,
    [0, 0, 1],
    0.004,
    YELLOW,
  );
  // awning
  tB.part(box(0.54, 0.014, 0.24), stripes(RED, CREAM, { size: 0.05, axis: tB.D(1, 0, 0), width: 0.5, wobble: 0.02 }), 0, 0.2, 0.37, {
    rot: [14, 0, 0],
  });
  for (let i = 0; i < 9; i++)
    tB.part(cone(0.012, 0.03, 4), YELLOW, -0.24 + i * 0.06, 0.158, 0.49, { rot: [180, 0, 0] });
  for (const sx of [1, -1]) {
    tB.rod([sx * 0.25, 0, 0.47], [sx * 0.25, 0.175, 0.47], 0.01, WOOD);
    tB.part(sph(), GOLD, sx * 0.25, 0.18, 0.47, { scale: 0.014 });
  }
  tB.rod([0, 0.168, 0.46], [0, 0.11, 0.46], 0.003, ROPE, { sides: 4 });
  glow(tB.part(box(0.035, 0.05, 0.035), YELLOW, 0, 0.082, 0.46), 1.4);
  tB.part(cone(0.03, 0.025, 4), RED, 0, 0.12, 0.46, { rot: [0, 45, 0] });
  tB.part(box(0.04, 0.008, 0.04), RED, 0, 0.054, 0.46);
  // guy ropes
  tB.rod([0, 0.4, -0.35], [0, 0.0, -0.64], 0.004, ROPE, { sides: 4 });
  tB.rod([0, -0.01, -0.64], [0, 0.07, -0.64], 0.011, WOOD);
  for (const sx of [1, -1]) {
    tB.rod([sx * 0.26, 0.13, 0.0], [sx * 0.52, 0.0, 0.06], 0.004, ROPE, { sides: 4 });
    tB.rod([sx * 0.52, -0.01, 0.06], [sx * 0.52, 0.07, 0.06], 0.011, WOOD);
  }
  // rug and cushions in front
  tB.part(box(0.4, 0.008, 0.26), YELLOW, 0, 0.004, 0.64);
  tB.part(box(0.34, 0.012, 0.2), stripes(TEAL, CREAM, { size: 0.04, axis: tB.D(0, 0, 1), width: 0.5, wobble: 0.05 }), 0, 0.006, 0.64);
  tB.part(sph(), RED, -0.1, 0.03, 0.6, { scale: [0.045, 0.022, 0.04], rot: [0, 15, 0] });
  tB.part(sph(), BLUE, 0.1, 0.03, 0.68, { scale: [0.045, 0.022, 0.04], rot: [0, -30, 0] });
  // barrel
  tB.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.068, 0.03],
      [0.072, 0.06],
      [0.068, 0.09],
      [0.055, 0.12],
      [0, 0.12],
    ],
    0.36,
    0,
    0.15,
    paint((p) => {
      const y = p.y - G;
      return Math.abs(y - 0.03) < 0.007 || Math.abs(y - 0.09) < 0.007 ? IRON : grain(WOODC, WOOD, { size: 0.01, axis: "y" });
    }),
    10,
  );

  // ------------------------------------------------------------------ crates, sacks, jars
  const cr = mk(-0.5, -0.5, 20);
  const crateCol = grain(WOODC, WOOD, { size: 0.012, axis: "x" });
  const crate = (x: number, y: number, z: number, k: number, yaw: number) => {
    cr.part(box(0.15 * k, 0.15 * k, 0.15 * k), crateCol, x, y, z, { rot: [0, yaw, 0] });
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        cr.part(box(0.02 * k, 0.156 * k, 0.02 * k), WOODD, x + Math.cos(yaw * RAD) * sx * 0.07 * k + Math.sin(yaw * RAD) * sz * 0.07 * k, y, z - Math.sin(yaw * RAD) * sx * 0.07 * k + Math.cos(yaw * RAD) * sz * 0.07 * k, {
          rot: [0, yaw, 0],
        });
  };
  crate(0, 0.075, 0, 1, 0);
  cr.rod([-0.065, 0.015, 0.078], [0.065, 0.135, 0.078], 0.007, WOODD, { sides: 4 });
  crate(0.01, 0.2, 0, 0.66, 30);
  const sack = mottle(CREAM, "#e3d3a8", { size: 0.06, contrast: 0.7, seed: 4 });
  cr.part(sph(), sack, -0.17, 0.08, 0.04, { scale: [0.07, 0.085, 0.06] });
  cr.part(cone(0.02, 0.035, 5), ROPE, -0.17, 0.175, 0.04);
  cr.part(sph(), sack, -0.13, 0.065, -0.1, { scale: [0.06, 0.07, 0.055], rot: [0, 40, 0] });
  cr.part(cone(0.018, 0.03, 5), ROPE, -0.13, 0.14, -0.1);
  const jarCol = paint((p) => {
    const y = p.y - G;
    return (y > 0.1 && y < 0.125) || (y > 0.04 && y < 0.05) ? CREAM : TERRA;
  });
  const jar = (x: number, z: number) => {
    cr.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.055, 0.03],
        [0.068, 0.08],
        [0.06, 0.125],
        [0.032, 0.16],
        [0.034, 0.185],
        [0.046, 0.2],
        [0.046, 0.21],
        [0, 0.21],
      ],
      x,
      0,
      z,
      jarCol,
      9,
    );
    for (const sx of [1, -1]) cr.part(new THREE.TorusGeometry(0.03, 0.007, 4, 6, Math.PI), TERRA, x + sx * 0.045, 0.15, z, { rot: [0, 0, sx * -90] });
  };
  jar(0.22, 0.05);
  jar(0.27, -0.12);
  jar(0.15, 0.18);

  // ------------------------------------------------------------------ campfire
  const fire = mk(0.45, 0.88, 0);
  fire.part(cyl(0.085, 0.09, 0.01, 8), DARK, 0, 0.005, 0);
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * RAD;
    fire.part(dodeca(), i % 2 ? ROCK : ROCK2, Math.sin(a) * 0.14, 0.018, Math.cos(a) * 0.14, {
      scale: [0.036, 0.026, 0.032],
      rot: [0, i * 40, 0],
    });
  }
  for (let i = 0; i < 3; i++) {
    const a = i * 120 * RAD;
    fire.rod([Math.sin(a) * 0.11, 0.025, Math.cos(a) * 0.11], [Math.sin(a) * 0.02, 0.065, Math.cos(a) * 0.02], 0.02, WOOD);
  }
  glow(fire.part(cone(0.055, 0.16, 6), ORANGE, 0, 0.1, 0), 1.2);
  glow(fire.part(cone(0.036, 0.12, 5), YELLOW, 0.012, 0.085, 0.01), 1.4);
  for (const a of [60, 180, 300])
    fire.rod([Math.sin(a * RAD) * 0.2, 0, Math.cos(a * RAD) * 0.2], [0, 0.34, 0], 0.008, WOOD, { sides: 5 });
  fire.rod([0, 0.34, 0], [0, 0.27, 0], 0.003, IRON, { sides: 4 });
  fire.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.06, 0.02],
      [0.065, 0.07],
      [0.058, 0.075],
      [0, 0.06],
    ],
    0,
    0.18,
    0,
    IRON,
    9,
  );
  fire.part(sph(), SMOKE, 0.0, 0.3, 0.0, { scale: 0.028 });
  fire.part(sph(), SMOKE, 0.02, 0.37, 0.01, { scale: 0.038 });
  fire.part(sph(), SMOKE, -0.01, 0.46, 0.0, { scale: 0.048 });
  fire.part(sph(), SMOKE, 0.02, 0.57, -0.01, { scale: 0.058 });
  fire.part(cyl(0.04, 0.04, 0.26, 7), WOOD, 0, 0.04, -0.3, { rot: [0, 0, 90] });
  fire.part(cyl(0.04, 0.04, 0.26, 7), WOOD, 0, 0.04, 0.3, { rot: [0, 0, 90] });
  fire.part(cyl(0.04, 0.04, 0.26, 7), WOOD, -0.3, 0.04, 0, { rot: [90, 0, 0] });
  for (const z of [-0.3, 0.3]) fire.part(cyl(0.032, 0.032, 0.003, 7), WOODC, 0.131, 0.04, z, { rot: [0, 0, 90] });

  // ------------------------------------------------------------------ sign
  const sign = mk(0.05, 0.9, 0);
  const drop = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="4" fill="#d9a35c"/><rect x="2" y="2" width="60" height="28" rx="3" fill="none" stroke="#7a4e2a" stroke-width="2"/><path d="M32 5 C24 15 22 19 22 22 a10 10 0 0 0 20 0 C42 19 40 15 32 5Z" fill="#37b8c8" stroke="#1f6f8c" stroke-width="2"/><circle cx="29" cy="21" r="2.4" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  sign.rod([0, -0.02, 0], [0, 0.3, 0], 0.012, WOOD);
  sign.part(box(0.21, 0.11, 0.02), WOOD, 0, 0.25, 0);
  sign.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", 0, 0.25, 0.0115, { texture: drop, flat: false });
  sign.part(sph(), GOLD, 0, 0.31, 0, { scale: 0.014 });

  // ------------------------------------------------------------------ cactus and cairn
  const cactus = mk(1.0, 0.62, 0);
  const cactCol = grain(CACT, CACTD, { size: 0.012, axis: "y" });
  cactus.sweep(
    [
      [0, -0.01, 0],
      [0, 0.1, 0],
      [0, 0.17, 0],
    ],
    [0.03, 0.03, 0.022],
    cactCol,
    { sides: 7 },
  );
  cactus.sweep(
    [
      [0, 0.06, 0],
      [0.06, 0.07, 0],
      [0.075, 0.13, 0],
    ],
    0.017,
    cactCol,
    { sides: 6 },
  );
  cactus.sweep(
    [
      [0, 0.09, 0],
      [-0.05, 0.1, 0],
      [-0.06, 0.15, 0],
    ],
    0.015,
    cactCol,
    { sides: 6 },
  );
  cactus.part(sph(), PINK, 0, 0.2, 0, { scale: 0.016 });
  cactus.part(cone(0.012, 0.02, 5), YELLOW, 0.075, 0.17, 0);
  const cairn = mk(-0.05, -0.82, 0);
  [
    [0.06, 0.03],
    [0.048, 0.07],
    [0.036, 0.1],
    [0.024, 0.125],
  ].forEach(([r, y], i) =>
    cairn.part(dodeca(), i % 2 ? ROCK : ROCK2, 0, y, 0, { scale: [r * 1.2, r * 0.6, r], rot: [0, i * 50, 0] }),
  );

  // ------------------------------------------------------------------ camels
  const camel = (
    cx: number,
    cz: number,
    yaw: number,
    rest: boolean,
    s: number,
    coatA: string,
    coatB: string,
    belly: string,
    blA: string,
    blB: string,
    seed: number,
    hat: boolean,
  ) => {
    const c = mk(cx, cz, yaw, s);
    const coat = mottle(coatA, coatB, { size: 0.09, contrast: 0.6, seed });
    const dy = rest ? -0.15 : 0;
    const hdy = rest ? dy + 0.09 : 0;
    const hu = hdy - dy;
    c.part(sph(), belly, 0, 0.255 + dy, 0, { scale: [0.1, 0.085, 0.18] });
    c.part(sph(), coat, 0, 0.3 + dy, 0, { scale: [0.11, 0.115, 0.2] });
    c.part(sph(), coat, 0, 0.3 + dy, -0.13, { scale: [0.1, 0.105, 0.1] });
    c.part(sph(), coat, 0, 0.3 + dy, 0.15, { scale: [0.095, 0.105, 0.1] });
    c.part(sph(), coat, 0, 0.41 + dy, -0.03, { scale: [0.062, 0.08, 0.075] });
    // blanket and tassels
    const bl = stripes(blA, blB, { size: 0.035, axis: "x", width: 0.5, wobble: 0.1, seed });
    for (const sx of [1, -1]) {
      c.part(box(0.09, 0.01, 0.17), bl, sx * 0.068, 0.385 + dy, 0.085, { rot: [0, 0, sx * -38] });
      for (const z of [0.01, 0.16]) {
        c.part(sph(), GOLD, sx * 0.108, 0.318 + dy, z, { scale: 0.011 });
        c.rod([sx * 0.108, 0.31 + dy, z], [sx * 0.108, 0.27 + dy, z], 0.005, blB, { sides: 4 });
      }
    }
    c.part(box(0.07, 0.01, 0.17), bl, 0, 0.415 + dy, 0.085);
    // neck
    c.sweep(
      [
        [0, 0.3 + dy, 0.15],
        [0, 0.36 + dy + hu * 0.3, 0.235],
        [0, 0.48 + dy + hu * 0.7, 0.27],
        [0, 0.58 + dy + hu, 0.315],
      ],
      [0.06, 0.042, 0.034, 0.03],
      coat,
      { sides: 7 },
    );
    // head
    c.part(sph(), coat, 0, 0.605 + hdy, 0.355, { scale: [0.038, 0.04, 0.06], rot: [20, 0, 0] });
    c.part(sph(), belly, 0, 0.575 + hdy, 0.41, { scale: [0.032, 0.03, 0.045] });
    c.part(sph(), belly, 0, 0.553 + hdy, 0.395, { scale: [0.024, 0.014, 0.04] });
    for (const sx of [1, -1]) {
      c.part(sph(), DARK, sx * 0.012, 0.582 + hdy, 0.452, { scale: 0.006 });
      c.part(sph(), DARK, sx * 0.034, 0.618 + hdy, 0.352, { scale: 0.014 });
      c.part(sph(), CREAM, sx * 0.038, 0.624 + hdy, 0.36, { scale: 0.005 });
      c.rod([sx * 0.035, 0.63 + hdy, 0.356], [sx * 0.042, 0.645 + hdy, 0.364], 0.0025, DARK, { sides: 4 });
      c.part(sph(), coat, sx * 0.03, 0.634 + hdy, 0.342, { scale: [0.02, 0.01, 0.025] });
      c.part(cone(0.014, 0.04, 4), coat, sx * 0.034, 0.65 + hdy, 0.322, { rot: [0, 0, -25 * sx] });
      c.rod([sx * 0.025, 0.566 + hdy, 0.438], [sx * 0.005, 0.561 + hdy, 0.455], 0.0025, DARK, { sides: 4 });
    }
    c.part(new THREE.TorusGeometry(0.034, 0.004, 4, 8), RED, 0, 0.58 + hdy, 0.392);
    c.rod([0.034, 0.58 + hdy, 0.392], [0.06, 0.4 + dy + hu * 0.3, 0.2], 0.003, RED, { sides: 4 });
    if (hat) {
      c.part(cyl(0.018, 0.026, 0.04, 8), RED, 0, 0.675 + hdy, 0.33);
      c.part(sph(), GOLD, 0, 0.7 + hdy, 0.33, { scale: 0.008 });
      c.rod([0.0, 0.7 + hdy, 0.33], [0.03, 0.66 + hdy, 0.325], 0.003, GOLD, { sides: 4 });
    }
    // legs
    if (!rest) {
      for (const sx of [1, -1])
        for (const hind of [false, true]) {
          const z = hind ? -0.13 : 0.13;
          c.sweep(
            [
              [sx * 0.07, 0.26, z],
              [sx * 0.07, 0.125, z + (hind ? -0.025 : 0.01)],
              [sx * 0.068, 0.03, z],
            ],
            [0.034, 0.022, 0.018],
            coat,
            { sides: 6 },
          );
          c.part(sph(), CAMELD, sx * 0.072, 0.125, z + (hind ? -0.04 : 0.03), { scale: 0.02 });
          c.part(cyl(0.03, 0.034, 0.02, 7), CAMELD, sx * 0.068, 0.01, z + 0.005);
        }
    } else {
      for (const sx of [1, -1]) {
        c.sweep(
          [
            [sx * 0.085, 0.07, 0.1],
            [sx * 0.09, 0.035, 0.12],
            [sx * 0.09, 0.033, 0.25],
          ],
          [0.034, 0.028, 0.02],
          coat,
          { sides: 6 },
        );
        c.part(sph(), CAMELD, sx * 0.09, 0.03, 0.265, { scale: [0.026, 0.02, 0.03] });
        c.sweep(
          [
            [sx * 0.09, 0.12, -0.14],
            [sx * 0.1, 0.045, -0.17],
            [sx * 0.095, 0.034, -0.02],
          ],
          [0.04, 0.03, 0.02],
          coat,
          { sides: 6 },
        );
      }
      c.part(sph(), CAMELD, 0, 0.04, 0.12, { scale: [0.04, 0.025, 0.05] });
    }
    // tail
    c.sweep(
      [
        [0, 0.34 + dy, -0.2],
        [0, Math.max(0.1, 0.28 + dy), -0.27],
        [0, Math.max(0.07, 0.2 + dy), -0.285],
      ],
      [0.012, 0.008, 0.006],
      coat,
      { sides: 5 },
    );
    c.part(sph(), CAMELD, 0, Math.max(0.05, 0.17 + dy), -0.287, { scale: [0.016, 0.032, 0.016] });
  };
  camel(-0.35, 0.85, 145, false, 1, CAMEL1, CAMEL1L, CAMEL1L, RED, CREAM, 31, false);
  camel(-0.85, 0.35, 80, true, 1, CAMEL2, CAMEL2L, CAMEL2L, BLUE, YELLOW, 32, false);
  camel(0.62, 0.7, -140, false, 0.82, CAMEL3, CAMEL3L, CAMEL3L, TEAL, CREAM, 33, true);

  return b.root;
}
