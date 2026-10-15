import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { mix, noise, paint, scales, smoothstep, spots } from "../../../../src/paint";
import type { Paint, SurfaceCoords } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hextech Dragon Hoard",
  description:
    "A League of Legends style treasure hoard: an open banded chest spilling coins, a spired crown with hextech crystal, jewelled goblets (one tipped over), gold ingots, coin stacks, glowing gems and crystal clusters.",
  style: "League of Legends",
};

type V3t = [number, number, number];
type Fillish = string | Paint;
type Outline = ([number, number] | [number, number, "sharp"])[];

// ---------------------------------------------------------------------------------------------------------------
// Local transforms: an assembly (crown, goblet, ingot stack) is authored in its own frame and placed in the model.

function xf(pos: V3t, rot: V3t | THREE.Quaternion, scale = 1) {
  const quat =
    rot instanceof THREE.Quaternion
      ? rot.clone()
      : new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG));
  const origin = new THREE.Vector3(pos[0], pos[1], pos[2]);
  return {
    quat,
    scale,
    p: (v: V3t) => new THREE.Vector3(v[0], v[1], v[2]).multiplyScalar(scale).applyQuaternion(quat).add(origin),
    d: (v: V3t) => new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(quat),
    q: (local: THREE.Quaternion) => quat.clone().multiply(local),
  };
}
type Xf = ReturnType<typeof xf>;
const lq = (x: number, y: number, z: number) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(x * DEG, y * DEG, z * DEG));

// ---------------------------------------------------------------------------------------------------------------
// Palette: hand-painted bands (shadow / mid / light / shine) with hue-shifted shade, like League's painted props.

const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const Q = new THREE.Vector3();

const banded = (shadow: string, mid: string, hi: string, shine: string, seed: number, cool: string) =>
  paint((p, n) => {
    const k = noise(p, 0.1, seed);
    const lit = n.dot(KEY) + (k - 0.5) * 0.3;
    if (lit > 0.8) return shine;
    if (lit > 0.4) return hi;
    if (lit > -0.05) return mid;
    return n.y < -0.4 ? cool : shadow;
  });

const GOLD = banded("#8f4b1b", "#dd8c25", "#f8c648", "#fff1a8", 3, "#6d3a4e");
const GOLD_DK = banded("#5f2e16", "#a8601c", "#d98f2c", "#f4c25a", 8, "#4a2845");
const PLINTH = banded("#1d1530", "#33264f", "#503f7c", "#8570b4", 6, "#241a40");

const woodPaint = (seam: (p: THREE.Vector3, n: THREE.Vector3, s: SurfaceCoords) => boolean) =>
  paint((p, n, s) => {
    if (seam(p, n, s)) return "#1f0f19";
    Q.set(p.x * 0.3, p.y * 4, p.z * 0.3);
    const g = noise(Q, 0.1, 4);
    const lit = n.dot(KEY);
    let c = mix("#5a2c27", "#8c4f34", g);
    if (lit > 0.55) c = mix(c, "#c98a52", 0.4);
    else if (lit < -0.05) c = mix(c, "#25132a", 0.5);
    return c;
  });
const WOOD_BODY = woodPaint((p, n) => Math.abs(n.y) < 0.5 && (((p.y / 0.095) % 1) + 1) % 1 < 0.05);
const WOOD_LID = woodPaint((_p, _n, s) => {
  const ang = Math.atan2(s[1], s[0] - 0.35) / (Math.PI / 7);
  return ((ang % 1) + 1) % 1 < 0.05;
});

const quiltPaint = (base: string, puff: string, seamC: string) =>
  paint((p, n) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const a = (u + v) / 0.08;
    const c = (u - v) / 0.08;
    const fa = a - Math.floor(a);
    const fc = c - Math.floor(c);
    const d = Math.min(fa, 1 - fa, fc, 1 - fc);
    if (d < 0.07) return seamC;
    if (d > 0.3) return puff;
    return base;
  });
const QUILT = quiltPaint("#b01834", "#d8304e", "#5a0a1c");

const STONE = paint((p, n) => {
  const k = noise(p, 0.16, 9);
  const lit = n.dot(KEY);
  let c = mix("#35264f", "#5d4a88", k);
  if (lit > 0.5) c = mix(c, "#8774b8", 0.4);
  else if (lit < 0) c = mix(c, "#1c1330", 0.5);
  return c;
});

const MOUND_LIT = scales(["#f3b53a", "#fbd052", "#e2982c"], "#7d3f15", { size: 0.075, width: 0.24, seed: 4 });
const MOUND_SHADE = scales(["#c4781f", "#d78d27", "#b36a1c"], "#4e2a22", { size: 0.075, width: 0.24, seed: 4 });
const MOUND = paint((_p, n) => (n.dot(KEY) > 0 ? MOUND_LIT : MOUND_SHADE));
const ERMINE = spots("#fff6e8", "#2b2233", { size: 0.04, amount: 0.5, seed: 2 });

const GEM_COLORS = ["#e8334f", "#2f7dff", "#2fd98c", "#a95cff", "#ffb62e", "#46eaff"];
const COIN_TONES = ["#f7c445", "#ffdf74", "#e8a02e", "#cf7f20", "#fff1b0"];
const HEX = "#46eaff";

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const COIN = svg(
  `<svg viewBox="0 0 100 100">
  <defs><radialGradient id="g" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stop-color="#fff0a8"/><stop offset="0.55" stop-color="#f5b93a"/><stop offset="1" stop-color="#c8741a"/></radialGradient></defs>
  <circle cx="50" cy="50" r="48.5" fill="url(#g)" stroke="#7a3f10" stroke-width="3"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="#8a4a12" stroke-width="2.6" stroke-dasharray="3 5"/>
  <circle cx="50" cy="50" r="35" fill="none" stroke="#fff0a8" stroke-width="2.2"/>
  <polygon points="50,22 74,36 74,64 50,78 26,64 26,36" fill="#e49b2a" stroke="#7a3f10" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="50,28 68,62 32,62" fill="none" stroke="#7a3f10" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="50,72 32,38 68,38" fill="none" stroke="#fff0a8" stroke-width="2.6" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="7" fill="#46eaff" stroke="#7a3f10" stroke-width="2.5"/>
  <circle cx="47.5" cy="47.5" r="2.2" fill="#ffffff"/>
</svg>`,
  { size: 192 },
);

const LOCK = svg(
  `<svg viewBox="0 0 100 120">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="0.5" stop-color="#f4b83c"/><stop offset="1" stop-color="#b86a1c"/></linearGradient></defs>
  <path d="M50 3 L93 20 L93 80 Q93 104 50 117 Q7 104 7 80 L7 20 Z" fill="url(#g)" stroke="#5e2c12" stroke-width="4.5" stroke-linejoin="round"/>
  <path d="M50 13 L83 26 L83 78 Q83 96 50 107 Q17 96 17 78 L17 26 Z" fill="none" stroke="#fff1b0" stroke-width="2.6" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="19" fill="#2a1830" stroke="#5e2c12" stroke-width="3"/>
  <circle cx="50" cy="50" r="19" fill="none" stroke="#46eaff" stroke-width="2.4" stroke-dasharray="4 4"/>
  <circle cx="50" cy="46" r="7" fill="#0d0714"/>
  <path d="M45 50 L55 50 L58 72 L42 72 Z" fill="#0d0714"/>
  <circle cx="17" cy="22" r="4.2" fill="#7a3f10"/><circle cx="83" cy="22" r="4.2" fill="#7a3f10"/>
  <circle cx="17" cy="78" r="4.2" fill="#7a3f10"/><circle cx="83" cy="78" r="4.2" fill="#7a3f10"/>
  <path d="M30 92 L50 100 L70 92" fill="none" stroke="#7a3f10" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  { size: 192 },
);

const RUNES = svg(
  `<svg viewBox="0 0 80 100">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#1b8fb0" stroke-width="7.5">
      <path d="M40 6 L72 24 L72 58 L40 76 L8 58 L8 24 Z"/>
      <path d="M40 6 L40 28 M8 24 L28 36 M72 24 L52 36 M40 76 L40 54 M8 58 L28 48 M72 58 L52 48"/>
      <circle cx="40" cy="42" r="9"/>
      <path d="M22 90 L58 90 M30 96 L50 96"/>
    </g>
    <g stroke="#c4fcff" stroke-width="3.2">
      <path d="M40 6 L72 24 L72 58 L40 76 L8 58 L8 24 Z"/>
      <path d="M40 6 L40 28 M8 24 L28 36 M72 24 L52 36 M40 76 L40 54 M8 58 L28 48 M72 58 L52 48"/>
      <circle cx="40" cy="42" r="9"/>
      <path d="M22 90 L58 90 M30 96 L50 96"/>
    </g>
  </g>
  <circle cx="40" cy="42" r="3.6" fill="#ffffff"/>
</svg>`,
  { size: 192 },
);

const CREST = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#243b87" stroke="#f6b83f" stroke-width="5"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#ffe39a" stroke-width="2.4"/>
  <g id="w"><path d="M46 52 Q26 28 8 36 Q22 44 17 56 Q30 52 27 67 Q40 62 46 72 Z" fill="#f6b83f" stroke="#7a3f10" stroke-width="2.4" stroke-linejoin="round"/></g>
  <g transform="translate(100 0) scale(-1 1)"><path d="M46 52 Q26 28 8 36 Q22 44 17 56 Q30 52 27 67 Q40 62 46 72 Z" fill="#f6b83f" stroke="#7a3f10" stroke-width="2.4" stroke-linejoin="round"/></g>
  <path d="M50 12 L57 54 L50 82 L43 54 Z" fill="#fff3c0" stroke="#7a3f10" stroke-width="2.6" stroke-linejoin="round"/>
  <rect x="35" y="50" width="30" height="6" rx="2" fill="#f6b83f" stroke="#7a3f10" stroke-width="2.2"/>
  <circle cx="50" cy="53" r="3.4" fill="#46eaff"/>
</svg>`,
  { size: 192 },
);

const SPARK = svg(
  `<svg viewBox="0 0 64 64">
  <path d="M32 1 Q35 29 63 32 Q35 35 32 63 Q29 35 1 32 Q29 29 32 1Z" fill="#fffbe0" stroke="#ffe27a" stroke-width="2"/>
  <circle cx="32" cy="32" r="8" fill="#ffffff"/>
</svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "treasureHoard", detail: 1 });
  const random = rng(20240611);

  const root = b.joint("hoardRoot", { at: [0, 0, 0], role: "spine" });
  const RIMY = 0.485;
  const lid = b.joint("chestLid", { parent: root, at: [0, RIMY, -0.7], dir: [0, 0, 1], role: "hinge" });

  type Put = {
    at: THREE.Vector3 | V3t;
    quat?: THREE.Quaternion;
    rot?: V3t;
    scale?: number | V3t;
    bone?: typeof root;
    texture?: THREE.Texture;
    glow?: number;
    dir?: THREE.Vector3 | V3t;
    up?: THREE.Vector3 | V3t;
    axis?: "x" | "y" | "z";
  };
  const put = (geometry: THREE.BufferGeometry, color: Fillish, o: Put) => {
    const opts: PartOptions = { bone: o.bone ?? root, at: o.at, flat: true };
    if (o.quat) opts.quat = o.quat;
    if (o.rot) opts.rotation = o.rot;
    if (o.scale !== undefined) opts.scale = o.scale;
    if (o.texture) opts.texture = o.texture;
    if (o.dir) opts.dir = o.dir;
    if (o.up) opts.up = o.up;
    if (o.axis) opts.axis = o.axis;
    const item = b.part(geometry, color, opts);
    if (o.glow) glow(item, o.glow);
    return item;
  };
  const box = (w: number, h: number, d: number, color: Fillish, at: V3t, o: Partial<Put> = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, { ...o, at });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fillish, at: V3t, o: Partial<Put> = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg, 1), color, { ...o, at });
  const octa = (r: number) => new THREE.OctahedronGeometry(r, 0);
  const hemi = (seg = 14, rings = 5) => new THREE.SphereGeometry(1, seg, rings, 0, Math.PI * 2, 0, Math.PI / 2);
  const cutGem = (size: number) =>
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.5 * size, 0.5 * size),
        new THREE.Vector2(0.52 * size, 0.62 * size),
        new THREE.Vector2(0.38 * size, 0.84 * size),
        new THREE.Vector2(0, 0.84 * size),
      ],
      8,
    );

  // -------------------------------------------------------------------------------------------------------------
  // The pile: overlapping gold mounds, with a height field so coins, gems and goblets can be seated on them.

  type Mound = { cx: number; cy: number; cz: number; rx: number; h: number; rz: number };
  const mounds: Mound[] = [
    { cx: 0, cy: 0.2, cz: -0.35, rx: 0.48, h: 0.42, rz: 0.28 }, // inside the chest
    { cx: 0, cy: 0, cz: 0.35, rx: 0.95, h: 0.2, rz: 0.62 },
    { cx: -0.78, cy: 0, cz: 0.05, rx: 0.5, h: 0.28, rz: 0.55 },
    { cx: 0.78, cy: 0, cz: 0.1, rx: 0.5, h: 0.3, rz: 0.55 },
    { cx: -0.45, cy: 0, cz: 0.85, rx: 0.42, h: 0.14, rz: 0.3 },
    { cx: 0.5, cy: 0, cz: 0.8, rx: 0.45, h: 0.17, rz: 0.32 },
    { cx: 0.18, cy: 0.16, cz: 0.04, rx: 0.26, h: 0.33, rz: 0.24 }, // spill over the chest lip
  ];
  const H = (x: number, z: number) => {
    let best = 0;
    for (const m of mounds) {
      const dx = (x - m.cx) / m.rx;
      const dz = (z - m.cz) / m.rz;
      const q = 1 - dx * dx - dz * dz;
      if (q > 0) best = Math.max(best, m.cy + m.h * Math.sqrt(q));
    }
    return best;
  };
  const NRM = (x: number, z: number) => {
    const e = 0.015;
    const dx = (H(x + e, z) - H(x - e, z)) / (2 * e);
    const dz = (H(x, z + e) - H(x, z - e)) / (2 * e);
    return new THREE.Vector3(-dx, 1, -dz).normalize();
  };
  for (const m of mounds) put(hemi(16, 6), MOUND, { at: [m.cx, m.cy, m.cz], scale: [m.rx, m.h, m.rz] });

  // Zones the loose coins keep out of: [x, z, radius].
  const CROWN_AT: V3t = [0.52, 0.74, 0];
  const G1_AT: V3t = [-0.45, 0.5, 0];
  const G2_AT: V3t = [1.05, 0.28, 0];
  const G3_FOOT: V3t = [-0.8, 0.92, 0];
  const INGOT_AT: V3t = [-1.0, 0.55, 0];
  const STACKS: [number, number, number][] = [
    [0.98, 0.6, 10],
    [-0.15, 0.7, 7],
    [0.15, 0.95, 9],
  ];
  const avoid: [number, number, number][] = [
    [CROWN_AT[0], CROWN_AT[1], 0.24],
    [G1_AT[0], G1_AT[1], 0.12],
    [G2_AT[0], G2_AT[1], 0.12],
    [G3_FOOT[0], G3_FOOT[1], 0.14],
    [INGOT_AT[0], INGOT_AT[1], 0.3],
    [0.08, -0.42, 0.1],
    ...STACKS.map(([x, z]): [number, number, number] => [x, z, 0.07]),
  ];
  const clearOf = (x: number, z: number) => avoid.every(([ax, az, ar]) => Math.hypot(x - ax, z - az) > ar);
  const inChest = (x: number, z: number) => Math.abs(x) < 0.6 && z > -0.76 && z < 0.03;

  // -------------------------------------------------------------------------------------------------------------
  // Chest

  const CW = 1.1;
  const CD = 0.7;
  const Z0 = -0.35;
  box(1.14, 0.07, 0.74, PLINTH, [0, 0.035, Z0]);
  box(CW, 0.38, 0.05, WOOD_BODY, [0, 0.26, -0.025]);
  box(CW, 0.38, 0.05, WOOD_BODY, [0, 0.26, -0.675]);
  for (const s of [1, -1]) box(0.05, 0.38, CD - 0.1, WOOD_BODY, [s * 0.525, 0.26, Z0]);
  // crimson lining inside the walls
  box(1.0, 0.38, 0.006, QUILT, [0, 0.26, -0.053]);
  box(1.0, 0.38, 0.006, QUILT, [0, 0.26, -0.647]);
  for (const s of [1, -1]) box(0.006, 0.38, 0.6, QUILT, [s * 0.497, 0.26, Z0]);
  // gold rim trim, corner posts, straps
  box(CW + 0.1, 0.035, 0.09, GOLD, [0, RIMY - 0.0175, -0.02]);
  box(CW + 0.1, 0.035, 0.09, GOLD, [0, RIMY - 0.0175, -0.68]);
  for (const s of [1, -1]) {
    box(0.09, 0.035, CD, GOLD, [s * 0.525, RIMY - 0.0175, Z0]);
    for (const z of [-0.035, -0.665]) box(0.08, 0.415, 0.08, GOLD_DK, [s * 0.53, 0.2775, z]);
    for (const z of [0.006, -0.706]) box(0.09, 0.415, 0.012, GOLD, [s * 0.33, 0.2775, z]);
    // side handle: backing plate and ring
    box(0.02, 0.11, 0.13, GOLD_DK, [s * 0.56, 0.28, Z0]);
    put(new THREE.TorusGeometry(0.05, 0.011, 5, 10), GOLD, { at: [s * 0.585, 0.27, Z0], rot: [0, 90, 0] });
    // rune panels between straps and lock
    put(new THREE.PlaneGeometry(0.15, 0.19), "#ffffff", {
      at: [s * 0.19, 0.29, 0.003],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNES,
      glow: 0.9,
    });
  }
  // lock plate on the body front
  box(0.2, 0.24, 0.016, GOLD, [0, 0.29, 0.004]);
  put(new THREE.PlaneGeometry(0.19, 0.23), "#ffffff", {
    at: [0, 0.29, 0.0125],
    dir: [0, 0, 1],
    axis: "z",
    texture: LOCK,
  });
  // studs
  {
    const studs: THREE.BufferGeometry[] = [];
    const stud = (x: number, y: number, z: number) => studs.push(new THREE.SphereGeometry(0.012, 6, 4).translate(x, y, z));
    for (const s of [1, -1])
      for (const y of [0.14, 0.2, 0.26, 0.32, 0.38, 0.44]) {
        stud(s * 0.33, y, 0.016);
        stud(s * 0.33, y, -0.71);
      }
    for (let i = -5; i <= 5; i++) stud(i * 0.1, RIMY - 0.0175, 0.027);
    const merged = mergeGeometries(studs);
    if (merged) put(merged, "#ffe08a", { at: [0, 0, 0] });
  }
  // hinge knuckles
  for (const x of [-0.34, 0, 0.34])
    cyl(0.028, 0.028, 0.14, 8, GOLD_DK, [x, RIMY, -0.705], { rot: [0, 0, 90], bone: x === 0 ? lid : root });

  // lid: a faceted barrel vault drawn as an outline in (depth, height) and extruded across the chest
  const ARCH_N = 10;
  const archPts = (sx: number, sy: number): [number, number][] => {
    const pts: [number, number][] = [[0.35 - 0.35 * sx, 0]];
    for (let k = 0; k < ARCH_N; k++) {
      const phi = Math.PI - (Math.PI * (k + 0.5)) / ARCH_N;
      pts.push([0.35 + 0.35 * sx * Math.cos(phi), 0.28 * sy * Math.sin(phi)]);
    }
    pts.push([0.35 + 0.35 * sx, 0]);
    return pts;
  };
  const HINGE: V3t = [0, RIMY, -0.7];
  b.extrude(archPts(1, 1), { at: HINGE, thickness: 1.14, bevel: 0.012, color: WOOD_LID, bone: lid });
  for (const s of [1, -1]) {
    b.extrude(archPts(1.045, 1.06), { at: [s * 0.33, RIMY, -0.7], thickness: 0.1, bevel: 0.01, color: GOLD, bone: lid });
    b.extrude(archPts(1.03, 1.04), { at: [s * 0.565, RIMY, -0.7], thickness: 0.035, bevel: 0.006, color: GOLD_DK, bone: lid });
  }
  box(1.16, 0.035, 0.05, GOLD, [0, RIMY + 0.0175, 0.0], { bone: lid });
  box(1.08, 0.008, 0.62, QUILT, [0, RIMY, Z0], { bone: lid });
  // crest medallion on top of the lid
  cyl(0.1, 0.11, 0.02, 10, GOLD, [0, 0.7596, Z0], { bone: lid });
  put(new THREE.CircleGeometry(0.085, 12), "#ffffff", {
    at: [0, 0.7706, Z0],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: CREST,
    bone: lid,
  });
  // hasp tongue over the lock, with a hextech gem
  box(0.1, 0.15, 0.012, GOLD, [0, 0.41, 0.02], { bone: lid });
  put(octa(0.024), HEX, { at: [0, 0.395, 0.032], scale: [1, 1.3, 0.6], bone: lid, glow: 0.8 });

  // -------------------------------------------------------------------------------------------------------------
  // Coins: every loose coin is an 8-sided disc merged by tone into one part per tone.

  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  const coinBuckets: THREE.BufferGeometry[][] = [[], [], [], [], []];
  const addCoin = (c: THREE.Vector3, axisIn: THREE.Vector3, radius: number, tone: number, spin = 0, thick = 0.013) => {
    const axis = axisIn.clone().normalize();
    const lowest = c.y - (radius * Math.sqrt(Math.max(0, 1 - axis.y * axis.y)) + (thick / 2) * Math.abs(axis.y));
    const center = c.clone();
    if (lowest < 0) center.y -= lowest;
    const g = new THREE.CylinderGeometry(radius, radius * 0.95, thick, 8, 1);
    const q = aim(axis).multiply(new THREE.Quaternion().setFromAxisAngle(Y_AXIS, spin));
    g.applyMatrix4(new THREE.Matrix4().compose(center, q, new THREE.Vector3(1, 1, 1)));
    coinBuckets[tone].push(g);
  };
  const pickTone = () => {
    const t = random();
    return t < 0.32 ? 0 : t < 0.58 ? 1 : t < 0.8 ? 2 : t < 0.95 ? 3 : 4;
  };
  const dropCoin = (x: number, z: number, lift = 0) => {
    const n = NRM(x, z);
    const standing = random() < 0.22;
    const j = standing ? 1.6 : 0.55;
    const axis = new THREE.Vector3(
      n.x + (random() - 0.5) * j,
      n.y + (standing ? (random() - 0.5) * 0.8 : 0),
      n.z + (random() - 0.5) * j,
    );
    if (axis.lengthSq() < 1e-4) axis.set(0, 1, 0);
    const r = 0.045 + random() * 0.014;
    addCoin(new THREE.Vector3(x, H(x, z) + lift + 0.004, z), axis, r, pickTone(), random() * 6.283);
  };

  let placed = 0;
  for (let tries = 0; tries < 9000 && placed < 400; tries++) {
    const x = -1.3 + random() * 2.6;
    const z = -0.75 + random() * 1.9;
    const h = H(x, z);
    if (h < 0.05 || (inChest(x, z) && h < 0.5) || !clearOf(x, z)) continue;
    dropCoin(x, z);
    placed++;
  }
  placed = 0;
  for (let tries = 0; tries < 3000 && placed < 80; tries++) {
    const x = -0.46 + random() * 0.92;
    const z = -0.64 + random() * 0.58;
    if (H(x, z) < 0.47 || !clearOf(x, z)) continue;
    dropCoin(x, z);
    placed++;
  }
  // neat stacks
  for (const [x, z, count] of STACKS) {
    const r = 0.05;
    const base = Math.min(H(x, z), H(x + r, z), H(x - r, z), H(x, z + r), H(x, z - r)) - 0.012;
    for (let i = 0; i < count; i++)
      addCoin(
        new THREE.Vector3(x + (random() - 0.5) * 0.007, Math.max(base + 0.0065, 0.0066) + i * 0.0135, z + (random() - 0.5) * 0.007),
        Y_AXIS,
        r,
        i === count - 1 ? 4 : i % 2 ? 0 : 2,
        random() * 6,
      );
  }

  // hero coins with the hextech emblem, standing on edge against the pile
  const heroCoin = (x: number, z: number, lean: number, azimuth: number) => {
    const r = 0.075;
    const t = 0.02;
    const axis = new THREE.Vector3(Math.sin(azimuth) * Math.sin(lean), Math.cos(lean), Math.cos(azimuth) * Math.sin(lean));
    let cy = H(x, z) + 0.02;
    const lowest = cy - (r * Math.sqrt(1 - axis.y * axis.y) + (t / 2) * Math.abs(axis.y));
    if (lowest < 0) cy -= lowest;
    const c = new THREE.Vector3(x, cy, z);
    put(new THREE.CylinderGeometry(r, r, t, 12, 1), "#d98a24", { at: c, quat: aim(axis) });
    const face = new THREE.CircleGeometry(r * 0.93, 12);
    const off = t / 2 + 0.0012;
    put(face, "#ffffff", { at: c.clone().addScaledVector(axis, off), dir: axis, axis: "z", texture: COIN });
    put(face.clone(), "#ffffff", {
      at: c.clone().addScaledVector(axis, -off),
      dir: axis.clone().negate(),
      axis: "z",
      texture: COIN,
    });
  };
  heroCoin(-0.12, 0.84, 1.15, 0.2);
  heroCoin(0.35, 0.5, 1.2, 0.5);
  heroCoin(-0.7, 0.45, 1.1, -0.7);
  heroCoin(0.92, 0.9, 1.25, 0.6);
  heroCoin(-0.95, 0.12, 1.1, -1.0);
  heroCoin(1.12, 0.05, 1.15, 1.2);
  heroCoin(0.72, 0.3, 0.95, 0.9);
  heroCoin(-0.38, 0.12, 1.0, -0.2);

  // -------------------------------------------------------------------------------------------------------------
  // Gems and crystals

  const glints: THREE.Vector3[] = [];

  const dropGem = (x: number, z: number, size: number, color: string, lift = 0.03) => {
    const n = NRM(x, z).add(new THREE.Vector3((random() - 0.5) * 0.6, 0, (random() - 0.5) * 0.6)).normalize();
    const at = new THREE.Vector3(x, H(x, z) + lift, z);
    put(cutGem(size), color, { at, quat: aim(n), glow: 0.45 });
    return at;
  };

  const crystalSpray = (base: THREE.Vector3, count: number, s: number, tones: string[], seed: number, strength: number) => {
    const rnd = rng(seed);
    let tip = base.clone();
    for (let i = 0; i < count; i++) {
      const central = i === 0;
      const az = (i * Math.PI * 2) / Math.max(1, count - 1) + rnd() * 0.4;
      const tilt = central ? 0.06 : 0.25 + rnd() * 0.4;
      const r = (central ? 0.055 : 0.03 + rnd() * 0.015) * s;
      const h = (central ? 0.55 : 0.2 + rnd() * 0.18) * s;
      const axis = new THREE.Vector3(Math.sin(tilt) * Math.cos(az), Math.cos(tilt), Math.sin(tilt) * Math.sin(az));
      const at = base.clone().add(new THREE.Vector3(Math.cos(az) * 0.07 * s * (central ? 0 : 1), 0, Math.sin(az) * 0.07 * s * (central ? 0 : 1)));
      glow(
        b.lathe(
          [
            [0, 0],
            [r * 0.96, 0],
            [r, h * 0.68],
            [0, h],
          ],
          { at, axis, segments: 6, spin: az / DEG, color: tones[i % tones.length], bone: root },
        ),
        strength,
      );
      if (central) tip = at.clone().addScaledVector(axis, h);
    }
    return tip;
  };

  const crystalCluster = (cx: number, cz: number, s: number, tones: string[], seed: number) => {
    put(hemi(10, 4), STONE, { at: [cx, 0, cz], scale: [0.34 * s, 0.15 * s, 0.28 * s] });
    put(hemi(8, 3), STONE, { at: [cx + 0.3 * s, 0, cz + 0.12 * s], scale: [0.16 * s, 0.09 * s, 0.14 * s] });
    put(hemi(8, 3), STONE, { at: [cx - 0.28 * s, 0, cz + 0.16 * s], scale: [0.14 * s, 0.075 * s, 0.12 * s] });
    return crystalSpray(new THREE.Vector3(cx, 0.11 * s, cz), 7, s, tones, seed, 0.55);
  };
  const tipA = crystalCluster(-0.95, -0.42, 1.0, ["#3be7ff", "#2a7bff", "#79f3ff", "#2a7bff", "#3be7ff", "#1d5fe0"], 31);
  const tipB = crystalCluster(0.98, -0.5, 0.9, ["#b05cff", "#e0408c", "#8a3dff", "#ff5aa8", "#c47bff"], 47);
  const tipC = crystalSpray(new THREE.Vector3(0.08, 0.56, -0.42), 4, 0.5, ["#46eaff", "#8ff6ff", "#2fb8ff"], 12, 0.95);
  glints.push(tipA.clone().add(new THREE.Vector3(0, -0.05, 0.05)), tipB.clone().add(new THREE.Vector3(0, -0.05, 0.05)), tipC);

  // loose cut gems
  const gemSpots: [number, number][] = [];
  for (let tries = 0; tries < 3000 && gemSpots.length < 22; tries++) {
    const x = -1.25 + random() * 2.5;
    const z = -0.15 + random() * 1.25;
    if (H(x, z) < 0.07 || inChest(x, z) || !clearOf(x, z)) continue;
    if (gemSpots.some(([gx, gz]) => Math.hypot(gx - x, gz - z) < 0.17)) continue;
    gemSpots.push([x, z]);
  }
  gemSpots.forEach(([x, z], i) => {
    const at = dropGem(x, z, 0.07 + random() * 0.045, GEM_COLORS[i % GEM_COLORS.length]);
    if (i % 3 === 0) glints.push(at);
  });
  for (const [x, z, i] of [
    [-0.2, -0.3, 0],
    [0.3, -0.22, 1],
    [-0.28, -0.5, 3],
  ] as [number, number, number][])
    dropGem(x, z, 0.09, GEM_COLORS[i], 0.025);

  // -------------------------------------------------------------------------------------------------------------
  // Gold ingots

  {
    const S = xf([INGOT_AT[0], 0, INGOT_AT[1]], [0, 28, 0]);
    const base = Math.min(H(INGOT_AT[0], INGOT_AT[1]), H(-0.9, 0.5), H(-1.1, 0.6), H(-0.95, 0.65)) - 0.02;
    const outline: [number, number][] = [
      [-0.13, 0],
      [0.13, 0],
      [0.1, 0.07],
      [-0.1, 0.07],
    ];
    const rows: [number, number][] = [
      [-0.14, 0],
      [0, 0],
      [0.14, 0],
      [-0.07, 1],
      [0.07, 1],
      [0, 2],
    ];
    for (const [ox, row] of rows) {
      const at = S.p([ox, 0, 0]);
      at.y = Math.max(base, 0) + row * 0.07;
      b.extrude(outline, { at, x: S.d([0, 0, 1]), y: [0, 1, 0], thickness: 0.12, bevel: 0.008, color: GOLD, bone: root });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Crown

  {
    const yAt = H(CROWN_AT[0], CROWN_AT[1]) + 0.03;
    const X = xf([CROWN_AT[0], yAt, CROWN_AT[1]], [-10, 25, 7], 1.1);
    const k = X.scale;
    const bandPaint = paint((_p, n, s) => {
      const h = (s[0] - 0.045 * k) / (0.05 * k);
      if (h > 0 && h < 1 && Math.abs(n.y) < 0.5) {
        const a = s[1] / 22.5;
        const f = a - Math.floor(a);
        if (Math.abs(f - 0.5) * 2 < h) return "#7b3d16";
      }
      return GOLD;
    });
    const scaled = (pts: [number, number][]) => pts.map(([r, y]): [number, number] => [r * k, y * k]);
    b.lathe(
      scaled([
        [0.19, 0],
        [0.21, 0],
        [0.215, 0.02],
        [0.205, 0.1],
        [0.22, 0.115],
        [0.22, 0.13],
        [0.19, 0.13],
        [0.185, 0.1],
        [0.185, 0.02],
      ]),
      { at: X.p([0, 0, 0]), axis: X.d([0, 1, 0]), segments: 10, color: bandPaint, bone: root },
    );
    // ermine trim and velvet cap
    put(new THREE.TorusGeometry(0.2 * k, 0.027 * k, 6, 14), ERMINE, { at: X.p([0, 0.02, 0]), quat: X.q(lq(90, 0, 0)) });
    put(hemi(12, 5), QUILT, { at: X.p([0, 0.1, 0]), quat: X.quat, scale: [0.178 * k, 0.11 * k, 0.178 * k] });
    // spires with gems and pearls
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const tall = i % 2 === 0 ? 1 : 0.62;
      const sp: Outline = [
        [-0.042 * k, 0],
        [0.042 * k, 0],
        [0.05 * k, 0.045 * tall * k],
        [0.022 * k, 0.12 * tall * k],
        [0, 0.19 * tall * k, "sharp"],
        [-0.022 * k, 0.12 * tall * k],
        [-0.05 * k, 0.045 * tall * k],
      ];
      b.extrude(sp, {
        at: X.p([Math.sin(a) * 0.2, 0.12, Math.cos(a) * 0.2]),
        x: X.d([Math.cos(a), 0, -Math.sin(a)]),
        y: X.d([0, 1, 0]),
        thickness: 0.016 * k,
        bevel: 0.004 * k,
        color: GOLD,
        bone: root,
      });
      const gemLocal: V3t = [Math.sin(a) * 0.21, 0.12 + 0.075 * tall, Math.cos(a) * 0.21];
      put(octa(0.018 * k), GEM_COLORS[i % 2 ? 1 : 0], {
        at: X.p(gemLocal),
        quat: X.q(aim([Math.sin(a), 0.1, Math.cos(a)])),
        scale: [1, 0.6, 1],
        glow: 0.5,
      });
      put(new THREE.SphereGeometry(0.011 * k, 6, 4), "#fff3b8", { at: X.p([Math.sin(a) * 0.2, 0.12 + 0.19 * tall, Math.cos(a) * 0.2]) });
      // band cabochon between spires
      const g = a + Math.PI / 8;
      put(octa(0.026 * k), GEM_COLORS[(i + 2) % 6], {
        at: X.p([Math.sin(g) * 0.208, 0.065, Math.cos(g) * 0.208]),
        quat: X.q(aim([Math.sin(g), 0, Math.cos(g)])),
        scale: [1, 0.6, 1],
        glow: 0.5,
      });
    }
    // big front jewel
    put(octa(0.042 * k), HEX, { at: X.p([0, 0.065, 0.215]), quat: X.q(aim([0, 0, 1])), scale: [1, 0.55, 1.2], glow: 0.75 });
    // arches to the apex
    for (let j = 0; j < 4; j++) {
      const a = (j * Math.PI) / 2;
      const pts = [
        X.p([Math.sin(a) * 0.19, 0.13, Math.cos(a) * 0.19]),
        X.p([Math.sin(a) * 0.15, 0.22, Math.cos(a) * 0.15]),
        X.p([Math.sin(a) * 0.07, 0.3, Math.cos(a) * 0.07]),
        X.p([0, 0.335, 0]),
      ];
      b.sweep(catmull(pts), 0.011 * k, { color: GOLD, bone: root, sides: 6 });
    }
    put(new THREE.SphereGeometry(0.03 * k, 8, 6), GOLD, { at: X.p([0, 0.335, 0]) });
    put(octa(0.032 * k), HEX, { at: X.p([0, 0.4, 0]), quat: X.quat, scale: [1, 1.9, 1], glow: 1 });
    glints.push(X.p([0, 0.36, 0]));
  }

  // -------------------------------------------------------------------------------------------------------------
  // Goblets

  const GOBLET: [number, number][] = [
    [0, 0],
    [0.09, 0],
    [0.1, 0.012],
    [0.085, 0.03],
    [0.045, 0.05],
    [0.028, 0.07],
    [0.03, 0.11],
    [0.052, 0.125],
    [0.056, 0.145],
    [0.04, 0.165],
    [0.03, 0.18],
    [0.05, 0.2],
    [0.088, 0.235],
    [0.105, 0.3],
    [0.108, 0.32],
    [0.098, 0.32],
    [0.092, 0.3],
    [0.07, 0.245],
    [0, 0.215],
  ];
  const goblet = (X: Xf, fill: "liquid" | "gems" | "empty", tones: string[]) => {
    const up = X.d([0, 1, 0]);
    const gp = paint((_p, n, s) => {
      if (n.dot(up) < 0.12) {
        if (s[0] > 0.245 && s[0] < 0.285) {
          const a = s[1] / 30;
          const f = a - Math.floor(a);
          if (Math.abs(f - 0.5) * 2 < (s[0] - 0.245) / 0.04) return "#7a3a14";
        }
        if (s[0] > 0.196 && s[0] < 0.205) return "#7a3a14";
      }
      return GOLD;
    });
    b.lathe(GOBLET, { at: X.p([0, 0, 0]), axis: up, segments: 10, color: gp, bone: root });
    put(new THREE.TorusGeometry(0.103, 0.008, 4, 12), GOLD, { at: X.p([0, 0.32, 0]), quat: X.q(lq(90, 0, 0)) });
    put(new THREE.TorusGeometry(0.095, 0.01, 4, 10), GOLD_DK, { at: X.p([0, 0.014, 0]), quat: X.q(lq(90, 0, 0)) });
    put(new THREE.TorusGeometry(0.058, 0.008, 4, 8), GOLD, { at: X.p([0, 0.146, 0]), quat: X.q(lq(90, 0, 0)) });
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + 0.3;
      put(octa(0.021), tones[i % tones.length], {
        at: X.p([Math.sin(a) * 0.095, 0.235, Math.cos(a) * 0.095]),
        quat: X.q(aim([Math.sin(a), 0.18, Math.cos(a)])),
        scale: [1, 0.6, 1],
        glow: 0.5,
      });
      const c = a + Math.PI / 6;
      put(octa(0.011), tones[(i + 1) % tones.length], {
        at: X.p([Math.sin(c) * 0.059, 0.146, Math.cos(c) * 0.059]),
        quat: X.q(aim([Math.sin(c), 0, Math.cos(c)])),
        scale: [1, 0.6, 1],
        glow: 0.5,
      });
    }
    if (fill === "liquid") {
      put(new THREE.CylinderGeometry(0.085, 0.08, 0.012, 10, 1), HEX, { at: X.p([0, 0.292, 0]), quat: X.quat, glow: 0.95 });
      glints.push(X.p([0, 0.33, 0]));
    } else if (fill === "gems") {
      for (let i = 0; i < 9; i++) {
        const ang = random() * 6.283;
        const rr = random() * 0.05;
        put(octa(0.026 + random() * 0.01), GEM_COLORS[(i + 1) % 6], {
          at: X.p([Math.cos(ang) * rr, 0.272 + (0.05 - rr) * 0.7 + random() * 0.02, Math.sin(ang) * rr]),
          rot: [random() * 180, random() * 180, random() * 180],
          glow: 0.5,
        });
      }
      addCoin(X.p([0.02, 0.33, 0.0]), X.d([0.6, 0.8, 0.3]), 0.04, 4, 0.4);
      addCoin(X.p([-0.03, 0.31, 0.02]), X.d([-0.5, 0.8, 0.4]), 0.038, 1, 1.4);
      glints.push(X.p([0, 0.34, 0]));
    }
  };
  const GT = ["#46eaff", "#a95cff", "#e8334f", "#2f7dff", "#ffb62e", "#2fd98c"];
  goblet(xf([G1_AT[0], H(G1_AT[0], G1_AT[1]) - 0.02, G1_AT[1]], [4, 20, -3]), "liquid", GT);
  goblet(xf([G2_AT[0], H(G2_AT[0], G2_AT[1]) - 0.02, G2_AT[1]], [-3, -40, 4]), "gems", GT.slice().reverse());
  {
    // tipped over, mouth toward the viewer, with a spill of coins and gems running out of it
    const alpha = 0.06;
    const hx = 0.862;
    const hz = 0.507;
    const d = new THREE.Vector3(Math.cos(alpha) * hx, Math.sin(alpha), Math.cos(alpha) * hz);
    const G3 = xf([G3_FOOT[0], 0.1, G3_FOOT[1]], aim(d));
    goblet(G3, "empty", ["#e8334f", "#ffb62e", "#a95cff", "#2f7dff", "#2fd98c", "#46eaff"]);
    const mouth = G3.p([0, 0.32, 0]);
    for (let i = 0; i < 34; i++) {
      const t = 0.04 + random() * 0.55;
      const lat = (random() - 0.5) * (0.12 + t * 0.35);
      const x = mouth.x + hx * t - hz * lat;
      const z = mouth.z + hz * t + hx * lat;
      dropCoin(x, z, 0.002);
    }
    for (let i = 0; i < 5; i++) {
      const t = 0.1 + random() * 0.4;
      const lat = (random() - 0.5) * 0.25;
      const at = dropGem(mouth.x + hx * t - hz * lat, mouth.z + hz * t + hx * lat, 0.07 + random() * 0.03, GEM_COLORS[(i * 5 + 1) % 6], 0.03);
      if (i % 2 === 0) glints.push(at);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Merge the coins, then add sparkles

  coinBuckets.forEach((list, tone) => {
    const merged = list.length ? mergeGeometries(list) : null;
    if (merged) put(merged, COIN_TONES[tone], { at: [0, 0, 0] });
  });

  const sparkFrames = glints.map((p) => frame([p.x, p.y - 0.07, p.z], [0, 1, 0]));
  glow(b.cards(sparkFrames, SPARK, { size: [0.15, 0.15], lean: 0, cross: true, vary: 0.3, rng: rng(11), bone: root }), 1);

  // open the lid
  b.pose(lid, { axis: [1, 0, 0], deg: -102 });

  // smooth helpers kept in use for tuning
  void smoothstep;

  return b.root;
}
