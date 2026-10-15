// Desert oasis diorama: a round sandstone plinth with a turquoise pond, three palms, a striped ridge tent, a conical
// tent, three camels (one tethered, one kneeling, one calf), a campfire, crates, jars, a sign and a cactus.
// Low-poly whimsical mix: faceted flat-shaded primitives with soft chunky proportions, big friendly eyes, cheerful
// colour blocking and little story details. Everything is a plain object on one root joint; only things that move
// (tent door flaps, hanging lantern, swinging sign, flag) get their own hinge joints.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import type { Path } from "../../../../src/path";
import { countershade, grain, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis",
  description:
    "A round desert diorama: turquoise pond ringed by grass, reeds and lilies, three palms with dates and coconuts, a striped ridge tent with a lantern and tea set, a conical pavilion tent with a flag, a tethered camel, a kneeling camel and a calf, a campfire with a pot, crates, jars and a swinging sign.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

type L = readonly number[];
type Col = string | Paint;
type Rad = number | number[] | ((t: number) => number | [number, number]);
type Pl = { x: number; y: number; z: number; yaw: number; s: number };

const pl = (x: number, y: number, z: number, yaw = 0, s = 1): Pl => ({ x, y, z, yaw, s });

/** A local point (x right-hand model left, y up, z forward) of placement F in model space. */
const P = (F: Pl, l: L): THREE.Vector3 => {
  const a = F.yaw * DEG;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const x = l[0] * F.s;
  const y = l[1] * F.s;
  const z = l[2] * F.s;
  return new THREE.Vector3(F.x + x * c + z * sn, F.y + y, F.z - x * sn + z * c);
};

/** A local direction of F in model space (rotation only). */
const D = (F: Pl, l: L): THREE.Vector3 => {
  const a = F.yaw * DEG;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return new THREE.Vector3(l[0] * c + l[2] * sn, l[1], -l[0] * sn + l[2] * c);
};

/** A model-space point in F's unscaled local coordinates. */
const INV = (F: Pl, w: THREE.Vector3): [number, number, number] => {
  const a = F.yaw * DEG;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const dx = w.x - F.x;
  const dz = w.z - F.z;
  return [(dx * c - dz * sn) / F.s, (w.y - F.y) / F.s, (dx * sn + dz * c) / F.s];
};

const scaleRad = (r: Rad, s: number): Rad => {
  if (typeof r === "number") return r * s;
  if (typeof r === "function")
    return (t: number) => {
      const v = r(t);
      return typeof v === "number" ? v * s : [v[0] * s, v[1] * s];
    };
  return r.map((v) => v * s);
};

const scaleOutline = (o: OutlinePoint[], s: number): OutlinePoint[] =>
  o.map((q): OutlinePoint => (q.length === 3 ? [q[0] * s, q[1] * s, "sharp"] : [q[0] * s, q[1] * s]));

const Y0 = 0.14; // sand surface height

const C = {
  woodL: "#b5824f",
  wood: "#8b5a34",
  woodD: "#5e3b22",
  rope: "#dcc58f",
  gold: "#f2b632",
  goldD: "#c98a1c",
  red: "#d6453a",
  teal: "#2fa8a0",
  cream: "#f7e8c4",
  navy: "#2a3f7a",
  orange: "#f08a2c",
  pink: "#f27f9b",
  yellow: "#ffd45a",
  stone: "#b8a58c",
  stoneD: "#8e7b67",
  stoneL: "#d4c3a8",
  dark: "#2a1d16",
  white: "#ffffff",
  green: "#4fa04a",
  greenD: "#2f7a3c",
  greenL: "#8fd060",
  fire: "#ff7a1c",
  fire2: "#ffd23c",
  coal: "#3a2a24",
  clay: "#c8683c",
  clayD: "#8f4526",
  clayL: "#e48b5a",
  hoof: "#5b4030",
  iron: "#47423f",
  smoke: "#efe9df",
  bark: "#7a5232",
  barkD: "#4f3321",
  date: "#c4501c",
  coco: "#6b4a2a",
  cactus: "#5fb06a",
  cactusD: "#3f8a50",
};

type PutOpt = {
  rx?: number;
  ry?: number;
  rz?: number;
  sc?: number | readonly number[];
  flat?: boolean;
  bone?: Joint;
  texture?: THREE.Texture;
};
type TubeOpt = { bone?: Joint; sides?: number; caps?: SweepOptions["caps"]; curve?: boolean; smooth?: boolean };
type ShpOpt = { th: number | [number, number]; x?: L; y?: L; bevel?: number; bone?: Joint };

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n, 1);
const ball = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
const cone = (r: number, h: number, n = 6) => new THREE.ConeGeometry(r, h, n, 1);
const ico = (r: number) => new THREE.IcosahedronGeometry(r, 0);
const torus = (r: number, t: number, a = 5, c = 8) => new THREE.TorusGeometry(r, t, a, c);

const grassSvg = (a: string, c: string, d: string, e: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M6 64 Q8 34 2 8 Q18 30 20 64 Z" fill="${a}"/>
<path d="M18 64 Q22 26 24 2 Q36 28 34 64 Z" fill="${c}"/>
<path d="M30 64 Q38 36 48 14 Q48 40 44 64 Z" fill="${d}"/>
<path d="M42 64 Q50 40 62 28 Q58 46 56 64 Z" fill="${e}"/>
</svg>`,
    { size: 128 },
  );

const rugSvg = (base: string, border: string, d1: string, d2: string, d3: string, corner: string) => {
  const fringe = Array.from(
    { length: 20 },
    (_, i) =>
      `<rect x="${i * 4 + 1}" y="0" width="1.6" height="4" fill="${border}"/><rect x="${i * 4 + 1}" y="48" width="1.6" height="4" fill="${border}"/>`,
  ).join("");
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 52">${fringe}
<rect x="0" y="4" width="80" height="44" fill="${base}"/>
<rect x="4" y="8" width="72" height="36" fill="none" stroke="${border}" stroke-width="2"/>
<path d="M40 12 L58 26 L40 40 L22 26Z" fill="${d1}"/>
<path d="M40 17 L52 26 L40 35 L28 26Z" fill="${d2}"/>
<path d="M40 22 L46 26 L40 30 L34 26Z" fill="${d3}"/>
<path d="M8 12 L18 12 L8 22Z" fill="${corner}"/>
<path d="M72 12 L62 12 L72 22Z" fill="${corner}"/>
<path d="M8 40 L18 40 L8 30Z" fill="${corner}"/>
<path d="M72 40 L62 40 L72 30Z" fill="${corner}"/>
</svg>`,
    { size: 256 },
  );
};

export default function build() {
  const b = createBuilder({ name: "desertOasis" });
  const R = b.joint("base", { at: [0, 0, 0] });
  const W = pl(0, 0, 0);
  const rand = rng(7);

  // ------------------------------------------------------------------------------------------------ helpers
  const put = (F: Pl, geo: THREE.BufferGeometry, color: Col, l: L, o: PutOpt = {}) => {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler((o.rx ?? 0) * DEG, (F.yaw + (o.ry ?? 0)) * DEG, (o.rz ?? 0) * DEG, "YXZ"),
    );
    const sc = o.sc ?? 1;
    const scale: number[] =
      typeof sc === "number" ? [sc * F.s, sc * F.s, sc * F.s] : [sc[0] * F.s, sc[1] * F.s, sc[2] * F.s];
    return b.part(geo, color, {
      bone: o.bone ?? R,
      at: P(F, l),
      quat: q,
      scale,
      flat: o.flat ?? true,
      ...(o.texture ? { texture: o.texture } : {}),
    });
  };

  const tubeP = (F: Pl, path: Path | THREE.Vector3[], r: Rad, color: Col, o: TubeOpt = {}) =>
    b.sweep(path, scaleRad(r, F.s), {
      bone: o.bone ?? R,
      color,
      sides: o.sides ?? 6,
      smooth: o.smooth ?? false,
      caps: o.caps ?? "round",
    });

  const tube = (F: Pl, pts: L[], r: Rad, color: Col, o: TubeOpt = {}) => {
    const q = pts.map((p) => P(F, p));
    return tubeP(F, o.curve && q.length > 2 ? catmull(q) : q, r, color, o);
  };

  const rodP = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: Col, o: TubeOpt = {}) =>
    b.rod(a, c, r, { bone: o.bone ?? R, color, sides: o.sides ?? 5, smooth: false });

  const rod = (F: Pl, a: L, c: L, r: number, color: Col, o: TubeOpt = {}) =>
    rodP(P(F, a), P(F, c), r * F.s, color, o);

  const spkP = (base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: Col, o: TubeOpt = {}) =>
    b.spike(base, dir, len, r, { bone: o.bone ?? R, color, sides: o.sides ?? 5, smooth: false });

  const spk = (F: Pl, base: L, dir: L, len: number, r: number, color: Col, o: TubeOpt = {}) =>
    spkP(P(F, base), D(F, dir), len * F.s, r * F.s, color, o);

  const shp = (F: Pl, outline: OutlinePoint[], l: L, color: Col, o: ShpOpt) =>
    b.extrude(scaleOutline(outline, F.s), {
      at: P(F, l),
      x: D(F, o.x ?? [1, 0, 0]),
      y: D(F, o.y ?? [0, 1, 0]),
      thickness: typeof o.th === "number" ? o.th * F.s : [o.th[0] * F.s, o.th[1] * F.s],
      color,
      bone: o.bone ?? R,
      ...(o.bevel ? { bevel: o.bevel * F.s } : {}),
    });

  const lat = (F: Pl, outline: OutlinePoint[], l: L, color: Col, segments = 10, spin?: number) =>
    b.lathe(scaleOutline(outline, F.s), {
      at: P(F, l),
      axis: [0, 1, 0],
      color,
      bone: R,
      segments,
      ...(spin !== undefined ? { spin } : {}),
    });

  const tufts = (pts: THREE.Vector3[], tex: THREE.Texture, size: [number, number], seed: number) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      tex,
      { size, cross: true, vary: 0.35, spin: 180, rng: rng(seed), bone: R, flow: [0, 0, -1] },
    );

  const stripeFabric = (F: Pl, cols: string[], size: number, axis: 0 | 2) =>
    paint((p) => {
      const l = INV(F, p);
      const k = Math.floor(l[axis] / size) + 200;
      return mix(cols[k % cols.length], "#3b2a1c", 0.08 + 0.1 * noise(p, 0.05, 4));
    });

  const coatPaint = (a: string, bb: string, belly: string, seed: number) =>
    countershade(mottle(a, bb, { size: 0.16, contrast: 0.8, seed }), belly, { level: -0.2, soft: 0.3 });

  // ------------------------------------------------------------------------------------------------ textures
  const grassTex = grassSvg("#5f9e34", "#7cc243", "#4e8a2e", "#8ed04c");
  const dryTex = grassSvg("#c7a64e", "#dcc067", "#b08f3c", "#e6cf82");
  const reedTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
<path d="M8 96 Q6 50 11 6 Q18 50 15 96Z" fill="#5c9a3c"/>
<path d="M16 96 Q20 54 27 12 Q26 58 22 96Z" fill="#79b84a"/>
<rect x="13.2" y="26" width="2" height="70" fill="#6a9a3a"/>
<ellipse cx="14.2" cy="18" rx="3.4" ry="10" fill="#7a4a22"/>
<rect x="13.4" y="2" width="1.6" height="6" fill="#7a4a22"/>
</svg>`,
    { size: 256 },
  );
  const rugA = rugSvg("#b83a32", "#f3dcae", "#2a3f7a", "#f3dcae", "#d6453a", "#e8a63a");
  const rugB = rugSvg("#2a8f93", "#ffe7a3", "#d9602f", "#ffe7a3", "#2a3f7a", "#f2b632");
  const rippleTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="34 22 14 24"/>
<circle cx="50" cy="50" r="27" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="20 16 28 12"/>
<circle cx="50" cy="50" r="12" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="14 10"/>
<path d="M72 18 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4z" fill="#ffffff"/>
<path d="M24 70 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z" fill="#ffffff"/>
</svg>`,
    { size: 256 },
  );
  const signTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 18">
<rect x="0" y="0" width="44" height="18" fill="#f3dcae"/>
<rect x="1" y="1" width="42" height="16" fill="none" stroke="#8b5a34" stroke-width="1.2"/>
<path d="M10 16 Q9 10 12 4" fill="none" stroke="#7a5232" stroke-width="1.6"/>
<path d="M12 4 Q6 2 3 6 M12 4 Q16 0 20 3 M12 4 Q9 7 6 10 M12 4 Q16 6 18 10" fill="none" stroke="#2f7a3c" stroke-width="1.6"/>
<path d="M24 11 Q27 8 30 11 T36 11 T42 11" fill="none" stroke="#2a8fc0" stroke-width="1.5"/>
<path d="M24 15 Q27 12 30 15 T36 15 T42 15" fill="none" stroke="#2a8fc0" stroke-width="1.5"/>
<circle cx="34" cy="5" r="2.6" fill="#f2b632"/>
</svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------------------------------------ paints
  const sandRipple = stripes("#f3d9a0", "#e3c283", {
    size: 0.07,
    axis: [0.35, 0, 1],
    width: 0.3,
    wobble: 0.9,
    seed: 3,
  });
  const strata = paint((p) => mix("#cfa66b", "#b98d55", Math.floor(p.y / 0.02) % 2));
  const baseTop = paint((_p, n) => (n.y > 0.6 ? sandRipple : strata));
  const plinth = stripes("#6b4a31", "#563b27", { size: 0.12, axis: "x", width: 0.5, wobble: 0.15, seed: 4 });
  const duneSand = countershade(
    stripes("#f6dca4", "#e8c98a", { size: 0.05, axis: [0.5, 0, 1], width: 0.3, wobble: 0.8, seed: 5 }),
    "#d3ae70",
    { level: 0.05 },
  );
  const rockPaint = mottle(C.stone, C.stoneD, { size: 0.08, seed: 3 });
  const grassBank = mottle("#6cb546", "#4a9a40", { size: 0.12, seed: 8 });
  const woodGrain = grain(C.woodL, C.wood, { size: 0.02, axis: "y" });
  const plankGrain = grain(C.woodL, C.wood, { size: 0.015, axis: "x" });
  const waterPaint = paint((p) => {
    const d = Math.hypot(p.x - 0.15, p.z);
    return mix("#1f8fc0", "#45cfcf", smoothstep(0.08, 0.31, d));
  });
  const jarPaint = paint((_p, _n, s) => {
    const y = s[0];
    if (y > 0.085 && y < 0.1) return C.teal;
    if (y > 0.105 && y < 0.115) return C.cream;
    if (y > 0.125 && y < 0.14) return C.teal;
    return mix(C.clay, C.clayL, smoothstep(0, 0.2, y));
  });

  // ------------------------------------------------------------------------------------------------ plinth and sand
  put(W, cyl(1.42, 1.48, 0.06, 20), plinth, [0, 0.03, 0]);
  put(W, cyl(1.36, 1.41, 0.08, 20), baseTop, [0, 0.1, 0]);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    put(W, ball(0.02, 5, 4), C.goldD, [Math.sin(a) * 1.45, 0.035, Math.cos(a) * 1.45]);
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const rr = 0.05 + rand() * 0.04;
    put(W, ico(rr), rockPaint, [Math.sin(a) * 1.29, Y0 + rr * 0.35, Math.cos(a) * 1.29], {
      sc: [1.3, 0.8, 1],
      ry: rand() * 90,
    });
  }
  // low dunes
  for (const [dx, dz, dr] of [
    [-0.25, -1.08, 0.25],
    [0.42, -1.08, 0.22],
  ]) {
    put(W, ball(dr, 9, 5), duneSand, [dx, Y0 - 0.03, dz], { sc: [1.4, 0.3, 1] });
  }

  // exclusion zones for scattered clutter
  const zones: Array<[number, number, number]> = [
    [0.15, 0, 0.62],
    [-0.8, -0.12, 0.6],
    [0.78, -0.4, 0.45],
    [0.68, 0.55, 0.5],
    [-0.4, 0.9, 0.5],
    [0.45, 0.95, 0.3],
    [0.98, 0.12, 0.28],
    [-0.7, -0.68, 0.3],
    [-0.88, -0.85, 0.2],
    [0.62, -0.98, 0.2],
    [-1.05, 0.72, 0.3],
    [-0.38, -0.58, 0.18],
    [0.4, -0.64, 0.18],
    [0.0, -0.88, 0.18],
    [-0.58, 0.44, 0.35],
  ];
  const free = (x: number, z: number) => zones.every(([zx, zz, zr]) => Math.hypot(x - zx, z - zz) > zr);

  // pebbles
  let pebbles = 0;
  for (let tries = 0; tries < 200 && pebbles < 16; tries++) {
    const a = rand() * Math.PI * 2;
    const d = 0.3 + rand() * 0.9;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (!free(x, z)) continue;
    const rr = 0.014 + rand() * 0.016;
    put(W, ico(rr), rand() > 0.5 ? C.stone : C.stoneL, [x, Y0 + rr * 0.3, z], { sc: [1.2, 0.7, 1], ry: rand() * 90 });
    pebbles++;
  }

  // dry grass on the sand
  const dryPts: THREE.Vector3[] = [];
  for (let tries = 0; tries < 200 && dryPts.length < 12; tries++) {
    const a = rand() * Math.PI * 2;
    const d = 0.5 + rand() * 0.75;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (free(x, z)) dryPts.push(new THREE.Vector3(x, Y0, z));
  }
  tufts(dryPts, dryTex, [0.11, 0.09], 31);

  // ------------------------------------------------------------------------------------------------ pond
  const F1 = pl(0.15, Y0, 0);
  put(F1, cyl(0.31, 0.31, 0.04, 16), waterPaint, [0, 0.01, 0]);
  put(F1, new THREE.PlaneGeometry(0.56, 0.56), C.white, [0, 0.0315, 0], { rx: -90, flat: false, texture: rippleTex });
  lat(
    F1,
    [
      [0.28, -0.02],
      [0.28, 0.045],
      [0.35, 0.07],
      [0.42, 0.06],
      [0.49, 0.025],
      [0.52, -0.02],
    ],
    [0, 0, 0],
    grassBank,
    16,
  );
  for (let i = 0; i < 13; i++) {
    const a = (i / 13) * Math.PI * 2 + 0.2;
    const rr = 0.04 + rand() * 0.03;
    put(F1, ico(rr), rockPaint, [Math.sin(a) * 0.4, 0.06 + rr * 0.1, Math.cos(a) * 0.4], {
      sc: [1.3, 0.85, 1],
      ry: rand() * 90,
    });
  }
  // lily pads
  const pads: Array<[number, number, number]> = [
    [-0.1, 0.05, 0.06],
    [0.12, -0.1, 0.05],
    [0.0, 0.15, 0.045],
    [-0.15, -0.12, 0.04],
    [0.15, 0.1, 0.05],
  ];
  pads.forEach(([px, pz, pr], i) => {
    const outline: OutlinePoint[] = [[0, 0, "sharp"]];
    const start = (i * 70 + 20) * DEG;
    for (let k = 0; k < 9; k++) {
      const a = start + (k * 40 * DEG);
      outline.push([Math.cos(a) * pr, Math.sin(a) * pr]);
    }
    shp(F1, outline, [px, 0.0335, pz], i % 2 ? C.greenL : C.green, { th: 0.006, x: [1, 0, 0], y: [0, 0, 1] });
  });
  // lotus flowers on two pads
  for (const [px, pz] of [pads[0], pads[2]] as Array<[number, number, number]>) {
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      spk(F1, [px + Math.sin(a) * 0.008, 0.036, pz + Math.cos(a) * 0.008], [Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5], 0.04, 0.012, C.pink, { sides: 4 });
    }
    put(F1, ball(0.01, 5, 4), C.yellow, [px, 0.045, pz]);
  }
  // frog on the fourth pad
  {
    const Fr = pl(F1.x - 0.15, Y0 + 0.037, F1.z - 0.12, 35);
    put(Fr, ball(0.03, 6, 4), C.green, [0, 0.02, 0], { sc: [1, 0.75, 1.2] });
    put(Fr, ball(0.022, 6, 4), C.green, [0, 0.03, 0.036], { sc: [1.1, 0.8, 1] });
    put(Fr, ball(0.018, 5, 4), C.cream, [0, 0.012, 0.014], { sc: [1, 0.5, 1.2] });
    for (const s of [1, -1]) {
      put(Fr, ball(0.0095, 5, 4), C.white, [s * 0.014, 0.047, 0.036]);
      put(Fr, ball(0.0045, 4, 3), C.dark, [s * 0.015, 0.049, 0.043]);
      put(Fr, ball(0.007, 4, 3), C.pink, [s * 0.026, 0.026, 0.04], { sc: [0.5, 1, 1] });
      tube(Fr, [[s * 0.022, 0.018, -0.006], [s * 0.044, 0.008, -0.03], [s * 0.03, 0.004, -0.045]], 0.007, C.green, { sides: 4 });
      rod(Fr, [s * 0.016, 0.01, 0.03], [s * 0.022, 0.003, 0.055], 0.005, C.green, { sides: 4 });
    }
    rod(Fr, [-0.014, 0.025, 0.056], [0.014, 0.025, 0.056], 0.002, C.dark, { sides: 4 });
  }
  // reeds and grass around the bank
  const reedPts: THREE.Vector3[] = [];
  const bankPts: THREE.Vector3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.1;
    const cluster = [0.4, 1.5, 2.8, 3.6, 5.0, 5.8].some((c) => Math.abs(((a - c + Math.PI * 3) % (Math.PI * 2)) - Math.PI) > 2.9);
    const rr = 0.46 + rand() * 0.05;
    const p = new THREE.Vector3(F1.x + Math.sin(a) * rr, Y0 + 0.03, F1.z + Math.cos(a) * rr);
    if (cluster) reedPts.push(p);
    else bankPts.push(p);
  }
  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.44 + rand() * 0.1;
    bankPts.push(new THREE.Vector3(F1.x + Math.sin(a) * rr, Y0 + 0.04, F1.z + Math.cos(a) * rr));
  }
  tufts(reedPts, reedTex, [0.07, 0.38], 21);
  tufts(bankPts, grassTex, [0.12, 0.1], 22);
  // little flowers on the bank
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.43 + rand() * 0.08;
    const x = F1.x + Math.sin(a) * rr;
    const z = F1.z + Math.cos(a) * rr;
    const col = [C.pink, C.yellow, C.white][i % 3];
    rodP(new THREE.Vector3(x, Y0 + 0.05, z), new THREE.Vector3(x, Y0 + 0.11, z), 0.003, C.greenD, { sides: 4 });
    put(W, ball(0.014, 5, 4), col, [x, Y0 + 0.115, z]);
    put(W, ball(0.006, 4, 3), C.yellow, [x, Y0 + 0.125, z]);
  }
  // wooden bucket with a rope handle
  {
    const Fb = pl(-0.12, Y0, 0.54, 30);
    put(Fb, cyl(0.05, 0.04, 0.07, 8), plankGrain, [0, 0.035, 0]);
    put(Fb, cyl(0.052, 0.052, 0.008, 8), C.iron, [0, 0.02, 0]);
    put(Fb, cyl(0.05, 0.05, 0.008, 8), C.iron, [0, 0.06, 0]);
    put(Fb, torus(0.045, 0.004, 4, 8), C.rope, [0, 0.075, 0], { rx: 0, rz: 0 });
    put(Fb, cyl(0.042, 0.042, 0.004, 8), "#2a8fc0", [0, 0.062, 0]);
  }

  // ------------------------------------------------------------------------------------------------ palms
  const barkPaint = (len: number, a: string, c: string) =>
    paint((p, _n, s) => {
      const k = Math.floor((s[0] * len) / 0.075);
      return mix(k % 2 === 0 ? a : c, "#3a2416", 0.12 + 0.3 * noise(p, 0.05, 3));
    });

  const frond = (crown: THREE.Vector3, az: number, p1: number, dp: number, len: number, wid: number, tone: number) => {
    const a = az * DEG;
    const q1 = p1 * DEG;
    const q2 = (p1 + dp) * DEG;
    const h1 = new THREE.Vector3(Math.sin(a) * Math.cos(q1), Math.sin(q1), Math.cos(a) * Math.cos(q1));
    const h2 = new THREE.Vector3(Math.sin(a) * Math.cos(q2), Math.sin(q2), Math.cos(a) * Math.cos(q2));
    const w = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const hw = (x: number) => Math.max(0.006, wid * Math.sin(Math.PI * Math.pow(x / len, 0.65)));
    const ys = (k: number) => hw((len * k) / 10) * (k % 2 === 1 ? 0.5 : 1);
    const seg1: OutlinePoint[] = [];
    for (let k = 0; k <= 5; k++) seg1.push([(len * k) / 10, ys(k)]);
    for (let k = 5; k >= 0; k--) seg1.push([(len * k) / 10, -ys(k)]);
    const seg2: OutlinePoint[] = [];
    for (let k = 5; k <= 9; k++) seg2.push([(len * k) / 10, ys(k)]);
    seg2.push([len, 0, "sharp"]);
    for (let k = 9; k >= 5; k--) seg2.push([(len * k) / 10, -ys(k)]);
    const [ca, cb] = tone === 0 ? ["#2c8a3c", "#8ad24f"] : ["#348f3f", "#b0dc55"];
    const leaf = paint((_p, _n, s) => {
      const x = s[0];
      const y = Math.abs(s[1]);
      if (y < 0.007) return "#d4e27a";
      const v = (((x - y * 1.3) / 0.045) % 1 + 1) % 1;
      const base = mix(ca, cb, smoothstep(0, len, x));
      return v > 0.78 ? mix(base, "#1f5a2c", 0.35) : base;
    });
    b.extrude(seg1, { at: crown, x: h1, y: w, thickness: 0.006, color: leaf, bone: R });
    const end1 = crown.clone().addScaledVector(h1, len * 0.5);
    b.extrude(seg2, { at: end1.clone().addScaledVector(h2, -len * 0.5), x: h2, y: w, thickness: 0.006, color: leaf, bone: R });
  };

  const palm = (x: number, z: number, h: number, az: number, lean: number, seed: number, fruit: "date" | "coco", tone: number) => {
    const rr = rng(seed);
    const dx = Math.sin(az * DEG);
    const dz = Math.cos(az * DEG);
    const prog = [0, 0.1, 0.4, 1];
    const hy = [0, 0.3, 0.65, 1];
    const bow = [0, 0.03, 0.04, 0];
    const pts = prog.map(
      (k, i) => new THREE.Vector3(x + dx * lean * k - dz * bow[i], Y0 - 0.02 + h * hy[i], z + dz * lean * k + dx * bow[i]),
    );
    const path = catmull(pts);
    b.sweep(path, [0.088, 0.064, 0.054, 0.047], {
      bone: R,
      color: barkPaint(path.length, C.bark, C.barkD),
      sides: 7,
      smooth: false,
      caps: { start: "flat", end: "round" },
    });
    put(W, cyl(0.088, 0.125, 0.07, 7), C.barkD, [x, Y0 + 0.015, z]);
    const top = pts[3];
    put(W, ball(0.078, 7, 5), C.bark, [top.x, top.y, top.z], { sc: [1, 0.85, 1] });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rr();
      spkP(
        new THREE.Vector3(top.x + Math.cos(a) * 0.04, top.y - 0.02, top.z + Math.sin(a) * 0.04),
        new THREE.Vector3(Math.cos(a) * 0.8, -0.5, Math.sin(a) * 0.8),
        0.1,
        0.026,
        C.barkD,
      );
    }
    const L0 = 0.42 + h * 0.12;
    for (let i = 0; i < 10; i++) {
      const az2 = i * 36 + rr() * 14;
      const up = i % 3 === 0 ? 42 : 20;
      frond(
        new THREE.Vector3(top.x, top.y + 0.02, top.z),
        az2,
        up + rr() * 12,
        -(24 + rr() * 30) - (i % 2 === 1 ? 14 : 0),
        L0 * (0.9 + rr() * 0.2),
        0.07 + h * 0.012,
        tone,
      );
    }
    if (fruit === "date") {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const rad = 0.06 + rr() * 0.03;
        const p = new THREE.Vector3(top.x + Math.cos(a) * rad, top.y - 0.08 - rr() * 0.07, top.z + Math.sin(a) * rad);
        rodP(new THREE.Vector3(top.x, top.y - 0.04, top.z), p, 0.004, C.barkD, { sides: 4 });
        put(W, ball(0.024, 5, 4), C.date, [p.x, p.y - 0.01, p.z], { sc: [0.9, 1.25, 0.9] });
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.4;
        put(W, ball(0.04, 6, 5), C.coco, [top.x + Math.cos(a) * 0.07, top.y - 0.07 - (i % 2) * 0.03, top.z + Math.sin(a) * 0.07]);
      }
    }
    return new THREE.Vector3(x, Y0, z);
  };

  const palmBases = [
    palm(-0.38, -0.58, 1.5, 40, 0.38, 5, "date", 0),
    palm(0.4, -0.64, 1.3, -35, 0.3, 9, "coco", 1),
    palm(0.0, -0.88, 0.95, 10, 0.12, 13, "coco", 0),
  ];
  tufts(
    palmBases.flatMap((p) => [0, 1, 2].map((k) => new THREE.Vector3(p.x + Math.sin(k * 2.1) * 0.12, Y0, p.z + Math.cos(k * 2.1) * 0.12))),
    dryTex,
    [0.13, 0.12],
    41,
  );

  // ------------------------------------------------------------------------------------------------ tent A
  const FA = pl(-0.78, Y0, -0.12, 25, 0.9);
  const flapL = b.joint("flapL", { parent: R, at: P(FA, [0.34, 0, 0.29]), role: "hinge" });
  const flapR = b.joint("flapR", { parent: R, at: P(FA, [-0.34, 0, 0.29]), role: "hinge" });
  const lamp = b.joint("lampSwing", { parent: R, at: P(FA, [0, 0.455, 0.36]), role: "hinge" });
  {
    const F = FA;
    const cols = [C.red, C.cream, C.teal, C.cream];
    const fab = stripeFabric(F, cols, 0.1, 2);
    const fabX = stripeFabric(F, cols, 0.1, 0);
    const ang = Math.atan2(0.33, 0.38) / DEG;
    const len = Math.hypot(0.38, 0.33);
    const sinA = Math.sin(ang * DEG);
    const cosA = Math.cos(ang * DEG);
    for (const s of [1, -1]) {
      put(F, box(len, 0.016, 0.74), fab, [s * 0.19, 0.295, 0.06], { rz: -s * ang });
      put(F, box(0.022, 0.026, 0.74), C.goldD, [s * 0.375, 0.128, 0.06], { rz: -s * ang });
      for (const z of [-0.2, 0.06, 0.32]) {
        put(F, box(len, 0.008, 0.018), C.gold, [s * 0.19 + s * sinA * 0.011, 0.295 + cosA * 0.011, z], { rz: -s * ang });
      }
      put(F, box(0.014, 0.165, 0.56), fab, [s * 0.34, 0.0825, 0]);
      // valance triangles along the eave
      for (let k = 0; k < 11; k++) {
        const z = -0.28 + k * 0.07;
        shp(F, [[-0.033, 0], [0.033, 0], [0, -0.06]], [s * 0.38, 0.118, z + 0.06 - 0.0], [C.red, C.teal, C.cream][k % 3], {
          th: 0.008,
          x: [0, 0, 1],
        });
      }
    }
    // gables
    shp(F, [[-0.34, 0], [0.34, 0], [0.34, 0.165], [0, 0.46], [-0.34, 0.165]], [0, 0, -0.28], fabX, { th: 0.014 });
    shp(F, [[-0.18, 0.3], [0.18, 0.3], [0, 0.455]], [0, 0, 0.28], fabX, { th: 0.014 });
    for (let k = 0; k < 6; k++) {
      shp(F, [[-0.03, 0], [0.03, 0], [0, -0.05]], [-0.15 + k * 0.06, 0.3, 0.29], [C.gold, C.red][k % 2], { th: 0.008 });
    }
    // ridge pole, finials and tassel
    rod(F, [0, 0.462, -0.34], [0, 0.462, 0.46], 0.012, C.goldD);
    put(F, ball(0.027, 6, 5), C.gold, [0, 0.462, 0.47]);
    put(F, ball(0.027, 6, 5), C.gold, [0, 0.462, -0.35]);
    spk(F, [0, 0.49, 0.47], [0, 1, 0], 0.05, 0.012, C.gold);
    spk(F, [0, 0.45, 0.47], [0, -1, 0.1], 0.08, 0.02, C.red);
    // porch poles
    for (const s of [1, -1]) {
      put(F, cyl(0.013, 0.013, 0.15, 6), C.woodL, [s * 0.36, 0.075, 0.4]);
      put(F, ball(0.02, 5, 4), C.gold, [s * 0.36, 0.152, 0.4]);
      put(F, cyl(0.03, 0.036, 0.012, 6), C.stoneD, [s * 0.36, 0.006, 0.4]);
    }
    // door flaps on hinges
    shp(F, [[0, 0], [-0.3, 0], [-0.3, 0.42], [0, 0.165]], [0.34, 0, 0.29], fabX, { th: 0.012, bone: flapL });
    shp(F, [[0, 0], [0.3, 0], [0.3, 0.42], [0, 0.165]], [-0.34, 0, 0.29], fabX, { th: 0.012, bone: flapR });
    put(F, ball(0.02, 5, 4), C.gold, [0.06, 0.34, 0.3], { bone: flapL });
    put(F, ball(0.02, 5, 4), C.gold, [-0.06, 0.34, 0.3], { bone: flapR });
    spk(F, [0.06, 0.32, 0.3], [0, -1, 0], 0.07, 0.014, C.red, { bone: flapL });
    spk(F, [-0.06, 0.32, 0.3], [0, -1, 0], 0.07, 0.014, C.red, { bone: flapR });
    // guy ropes and pegs
    for (const s of [1, -1]) {
      for (const [ez, pz] of [
        [0.43, 0.52],
        [-0.31, -0.38],
      ]) {
        rod(F, [s * 0.38, 0.125, ez], [s * 0.46, 0.01, pz], 0.004, C.rope, { sides: 4 });
        rod(F, [s * 0.46, -0.01, pz], [s * 0.46, 0.05, pz + 0.015], 0.01, C.woodL, { sides: 5 });
      }
    }
  }
  void 0;
  return b.root;
}
