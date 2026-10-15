// Dragon's hoard: a heaped coin mound with an open hextech-blue chest, a spired crown, goblets, gems, ingots,
// a coin sack, a pearl necklace and glowing crystals. League of Legends look: faceted exaggerated shapes, cel-shaded
// paints, high-contrast saturated accents (gold against deep blue, ruby, cyan and violet magic glow).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A treasure hoard: open chest with glowing gems, heaped coins, a spired crown, goblets, ingots, a coin sack, a pearl necklace and magic crystals.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ------------------------------------------------------------------------------------------------------------
// Layout constants

const CW = 0.84; // chest width (x)
const CD = 0.54; // chest depth (z)
const CH = 0.36; // chest body height
const CZ = -0.5; // chest centre z
const RIM = 0.39; // top of the chest rim, the lid's hinge height
const LR = 0.28; // lid half depth
const LHS = 0.04; // lid straight side height
const LHT = 0.17; // lid arch height
const HINGE_Z = CZ - LR;

type Dome = { x: number; z: number; rx: number; rz: number; h: number; y: number };

const FLOOR: Dome[] = [
  { x: 0, z: 0.45, rx: 1.2, rz: 0.95, h: 0.3, y: 0 },
  { x: -0.78, z: -0.35, rx: 0.5, rz: 0.55, h: 0.26, y: 0 },
  { x: 0.8, z: -0.35, rx: 0.55, rz: 0.5, h: 0.3, y: 0 },
  { x: -0.2, z: -1.0, rx: 0.6, rz: 0.3, h: 0.18, y: 0 },
  { x: -0.45, z: 1.0, rx: 0.6, rz: 0.4, h: 0.2, y: 0 },
  { x: 0.55, z: 1.05, rx: 0.55, rz: 0.38, h: 0.18, y: 0 },
  { x: -1.1, z: 0.5, rx: 0.35, rz: 0.45, h: 0.15, y: 0 },
  { x: 1.15, z: 0.55, rx: 0.3, rz: 0.4, h: 0.14, y: 0 },
];

const HEAP_Y = CH + 0.004;
const CHEST_HEAP: Dome[] = [
  { x: 0, z: CZ, rx: 0.35, rz: 0.21, h: 0.16, y: HEAP_Y },
  { x: -0.17, z: CZ + 0.02, rx: 0.2, rz: 0.16, h: 0.2, y: HEAP_Y },
  { x: 0.18, z: CZ - 0.03, rx: 0.2, rz: 0.15, h: 0.19, y: HEAP_Y },
];

function domeH(d: Dome, x: number, z: number) {
  const u = (x - d.x) / d.rx;
  const w = (z - d.z) / d.rz;
  const q = 1 - u * u - w * w;
  return q > 0 ? d.y + d.h * Math.sqrt(q) : -1;
}

function heightOf(ds: Dome[], x: number, z: number) {
  let h = -1;
  for (const d of ds) h = Math.max(h, domeH(d, x, z));
  return h;
}

function normalAt(ds: Dome[], x: number, z: number) {
  const e = 0.03;
  const g = (a: number, c: number) => Math.max(0, heightOf(ds, a, c));
  const hx = (g(x + e, z) - g(x - e, z)) / (2 * e);
  const hz = (g(x, z + e) - g(x, z - e)) / (2 * e);
  return new THREE.Vector3(-hx, 1, -hz).normalize();
}

/** A frame round a tilted axis: `front` is the direction closest to +Z, `side` completes it. */
function basis(axis: THREE.Vector3) {
  const a = axis.clone().normalize();
  let front = new THREE.Vector3(0, 0, 1).addScaledVector(a, -a.z);
  if (front.lengthSq() < 1e-4) front = new THREE.Vector3(1, 0, 0).addScaledVector(a, -a.x);
  front.normalize();
  const side = new THREE.Vector3().crossVectors(a, front).normalize();
  return { a, front, side };
}
type Basis = ReturnType<typeof basis>;

const radialDir = (B: Basis, deg: number) =>
  B.front
    .clone()
    .multiplyScalar(Math.cos(deg * DEG))
    .addScaledVector(B.side, Math.sin(deg * DEG));
const tangentDir = (B: Basis, deg: number) =>
  B.front
    .clone()
    .multiplyScalar(-Math.sin(deg * DEG))
    .addScaledVector(B.side, Math.cos(deg * DEG));
const ringPt = (c: THREE.Vector3, B: Basis, r: number, deg: number, h = 0) =>
  c.clone().addScaledVector(radialDir(B, deg), r).addScaledVector(B.a, h);

/** Arch outline across the chest lid in (z, y): a straight start, a half ellipse over, a straight end. */
function arch(R: number, hs: number, ht: number, n = 10): Array<[number, number]> {
  const pts: Array<[number, number]> = [[-R, 0]];
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI * i) / n;
    pts.push([-R * Math.cos(a), hs + ht * Math.sin(a)]);
  }
  pts.push([R, 0]);
  return pts;
}

/** A band of the arch with thickness d outside it. */
function archBand(R: number, hs: number, ht: number, d: number): Array<[number, number]> {
  return [...arch(R + d, hs, ht + d), ...arch(R, hs, ht).reverse()];
}

const spireOutline = (w: number, h: number): OutlinePoint[] => [
  [-w, 0],
  [w, 0],
  [w * 0.8, h * 0.3],
  [w * 0.35, h * 0.62],
  [0, h, "sharp"],
  [-w * 0.35, h * 0.62],
  [-w * 0.8, h * 0.3],
];

/** Brilliant-cut gem profile: tip at the origin, table on top at 0.85 s. */
const gemOutline = (s: number): Array<[number, number]> => [
  [0, 0],
  [0.5 * s, 0.55 * s],
  [0.52 * s, 0.62 * s],
  [0.36 * s, 0.85 * s],
  [0, 0.85 * s],
];

const GOBLET_PTS: Array<[number, number]> = [
  [0, 0],
  [0.07, 0],
  [0.076, 0.01],
  [0.058, 0.028],
  [0.022, 0.05],
  [0.018, 0.092],
  [0.036, 0.108],
  [0.022, 0.124],
  [0.02, 0.138],
  [0.052, 0.165],
  [0.076, 0.225],
  [0.071, 0.238],
  [0.063, 0.238],
  [0.066, 0.224],
  [0.046, 0.17],
  [0, 0.155],
];

// Palette
const RUBY = "#ff2d4f";
const SAPPH = "#2f7bff";
const EMER = "#19d46a";
const AMETH = "#a855ff";
const TOPAZ = "#ffab1f";
const AQUA = "#22e6e0";
const ROSE = "#ff6bb4";
const GEM_HEX = [RUBY, SAPPH, EMER, AMETH, TOPAZ, AQUA, ROSE];
const COIN_COLORS = ["#ffc62e", "#ffdb5c", "#f2a41f", "#e9eef5", "#d8782e"];
const RIVET = "#ffd34d";
const MOUND_A = "#c4801a";
const MOUND_B = "#b87212";

const WOOD_A = "#2f7fb0";
const WOOD_B = "#2468a0";
const WOOD_LINE = "#0f3556";

const L = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const UP = new THREE.Vector3(0, 1, 0);

const gemPaints = new Map<string, Paint>();
function gemPaint(hex: string) {
  let p = gemPaints.get(hex);
  if (!p) {
    const hi = mix(hex, "#ffffff", 0.62);
    const lit = mix(hex, "#ffffff", 0.2);
    const deep = mix(hex, "#1a0a40", 0.5);
    const mid = mix(hex, "#1a0a40", 0.2);
    p = paint((_p, n) => {
      const d = n.dot(L);
      return d > 0.82 ? hi : d > 0.45 ? lit : d > 0.0 ? mid : deep;
    });
    gemPaints.set(hex, p);
  }
  return p;
}

const woodTone = (p: THREE.Vector3, k: number) => {
  const q = new THREE.Vector3(p.x * 0.18 + k * 3.1, p.y, p.z * 0.18 + k * 1.7);
  const g = noise(q, 0.05, 5);
  const base = mix(WOOD_A, WOOD_B, smoothstep(0.35, 0.65, g));
  return mix(base, "#4aa0cf", (((k * 37) % 5) + 5) % 5 * 0.028);
};

const bodyWood = cel(
  paint((p) => {
    const f = p.y / 0.09;
    const k = Math.floor(f);
    const fr = f - k;
    if (fr < 0.06) return WOOD_LINE;
    return woodTone(p, k);
  }),
);

const lidWood = cel(
  paint((p, n) => {
    if (Math.abs(n.x) > 0.9) return "#3a92c8";
    const ang = Math.atan2((p.y - RIM) / (LHS + LHT), (p.z - CZ) / LR);
    const f = ang / 0.42;
    const k = Math.floor(f);
    const fr = f - k;
    if (fr < 0.07) return WOOD_LINE;
    return woodTone(new THREE.Vector3(p.x, 0, p.z), k + 40);
  }),
);

const WOOD_RIM = cel("#1b4a74", "#12304f");

const GOLD = cel("#ffc42b", "#d9780f");
const GOLD_BR = cel("#ffe167", "#f0a21d");
const GOLD_DEEP = cel("#f2a521", "#a8530c");
const SILVER_LIT = "#e4f0ff";
const SILVER_SHADE = "#8294cf";

const velvet = (base: string, hi: string) =>
  cel(
    paint((p, n) => {
      const u = p.x / 0.085;
      const v = (Math.abs(n.y) > 0.5 ? p.z : p.y) / 0.085;
      const fu = u - Math.floor(u) - 0.5;
      const fv = v - Math.floor(v) - 0.5;
      const d = Math.abs(fu) + Math.abs(fv);
      if (d < 0.07) return "#ffd24a";
      if (Math.abs(d - 0.5) < 0.035) return "#6a0c2c";
      return mix(base, hi, smoothstep(0.5, 0.0, d) * 0.55);
    }),
  );

const metalPaint = (lit: string, shade: string, line: string, k: number) =>
  cel(
    paint((_p, _n, s) => {
      const h = s[0] / k;
      const zz = Math.abs((((s[1] / 30) % 1) + 1) % 1 * 2 - 1);
      const zig = 0.19 + 0.012 * zz;
      if (Math.abs(h - zig) < 0.0035 || Math.abs(h - 0.212) < 0.003 || Math.abs(h - 0.014) < 0.003) return line;
      return lit;
    }),
    shade,
  );

const crownBand = cel(
  paint((_p, _n, s) => {
    const zz = Math.abs((((s[1] / 45) % 1) + 1) % 1 * 2 - 1);
    const y0 = 0.046 + 0.014 * zz;
    return Math.abs(s[0] - y0) < 0.004 || s[0] < 0.008 || s[0] > 0.084 ? "#b8620e" : "#ffc42b";
  }),
  "#d9780f",
);

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: root, at: [0, RIM, HINGE_Z], role: "hinge" });
  const R = rng(2025);

  const put = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: PartOptions = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // --------------------------------------------------------------------------------------------------------
  // Textures

  const COIN_TEX = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#b8620e"/>
      <circle cx="32" cy="32" r="28.5" fill="#ffd23f"/>
      <circle cx="32" cy="32" r="25" fill="none" stroke="#c9780f" stroke-width="2.4" stroke-dasharray="4 3"/>
      <path d="M32 11 L36.5 27.5 L53 32 L36.5 36.5 L32 53 L27.5 36.5 L11 32 L27.5 27.5 Z" fill="#c9780f"/>
      <path d="M32 16 L35 29 L48 32 L35 35 L32 48 L29 35 L16 32 L29 29 Z" fill="#fff0a0"/>
      <circle cx="32" cy="32" r="4.5" fill="#e0861a"/>
    </svg>`,
    { size: 128 },
  );
  const FLOURISH = svg(
    `<svg viewBox="0 0 50 100">
      <g fill="none" stroke-linecap="round">
        <path d="M25 10 C8 20 8 36 25 42 C42 48 42 62 25 66 C14 69 14 80 25 82 C33 85 31 93 23 93" stroke="#6e3205" stroke-width="7"/>
        <path d="M25 10 C8 20 8 36 25 42 C42 48 42 62 25 66 C14 69 14 80 25 82 C33 85 31 93 23 93" stroke="#ffcf3a" stroke-width="3.4"/>
      </g>
      <circle cx="25" cy="8" r="5.5" fill="#6e3205"/><circle cx="25" cy="8" r="3.6" fill="#fff0a0"/>
      <circle cx="23" cy="93" r="4.5" fill="#6e3205"/><circle cx="23" cy="93" r="2.8" fill="#ffcf3a"/>
    </svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#2a1a3a"/>
      <circle cx="32" cy="32" r="25" fill="none" stroke="#ffcf3a" stroke-width="4"/>
      <path d="M32 12 L37 27 L52 32 L37 37 L32 52 L27 37 L12 32 L27 27 Z" fill="#ffcf3a"/>
      <circle cx="32" cy="32" r="5" fill="#2a1a3a"/>
    </svg>`,
    { size: 128 },
  );
  const STAR_GOLD = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 2 L37.5 26.5 L62 32 L37.5 37.5 L32 62 L26.5 37.5 L2 32 L26.5 26.5 Z" fill="#fff0a8"/><circle cx="32" cy="32" r="7" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const STAR_CYAN = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 2 L37.5 26.5 L62 32 L37.5 37.5 L32 62 L26.5 37.5 L2 32 L26.5 26.5 Z" fill="#9ff6ff"/><circle cx="32" cy="32" r="7" fill="#ffffff"/></svg>`,
    { size: 128 },
  );

  // --------------------------------------------------------------------------------------------------------
  // Shared helpers

  type GemOptions = { glowS?: number; spin?: number; bone?: Joint };
  function gem(at: THREE.Vector3, axis: THREE.Vector3, s: number, hex: string, o: GemOptions = {}) {
    const glows = (o.glowS ?? 0) > 0;
    const part = b.lathe(gemOutline(s), {
      at,
      axis,
      segments: 8,
      spin: o.spin ?? 0,
      color: glows ? hex : gemPaint(hex),
      bone: o.bone ?? root,
    });
    if (glows) glow(part, o.glowS);
    return part;
  }

  const coinGroups = new Map<string, THREE.BufferGeometry[]>();
  function coin(color: string, pos: THREE.Vector3, q: THREE.Quaternion, r = 0.05, t = 0.014) {
    const g = new THREE.CylinderGeometry(r, r, t, 8, 1);
    g.applyMatrix4(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(1, 1, 1)));
    const list = coinGroups.get(color) ?? [];
    list.push(g);
    coinGroups.set(color, list);
  }
  const pickCoin = () => {
    const r = R();
    return r < 0.45 ? COIN_COLORS[0] : r < 0.75 ? COIN_COLORS[1] : r < 0.9 ? COIN_COLORS[2] : r < 0.96 ? COIN_COLORS[3] : COIN_COLORS[4];
  };

  function placeCoin(ds: Dome[], x: number, z: number, wild: number, lift = 0, standing = false) {
    const h = Math.max(0, heightOf(ds, x, z));
    const nb = normalAt(ds, x, z);
    const n = nb.clone();
    if (standing) {
      n.set((R() - 0.5) * 2, 0.15 + R() * 0.2, (R() - 0.5) * 2).normalize();
    } else {
      n.x += (R() - 0.5) * wild;
      n.z += (R() - 0.5) * wild;
      n.normalize();
    }
    const pos = V(x, h, z).addScaledVector(nb, (standing ? 0.04 : 0.002) + lift + R() * 0.01);
    const q = aim(n).multiply(new THREE.Quaternion().setFromAxisAngle(UP, R() * Math.PI * 2));
    coin(pickCoin(), pos, q);
  }

  const RES: Array<[number, number, number]> = [
    [0.52, 0.62, 0.2], // crown
    [-0.42, 0.95, 0.14], // upright goblet
    [0.06, 0.7, 0.2], // tipped goblet
    [0.06, 1.05, 0.2], // spilled coins
    [1.0, 0.45, 0.12], // chalice
    [-0.9, 0.5, 0.3], // ingots
    [0.55, 1.1, 0.22], // necklace
    [-0.3, 0.3, 0.07], // ring
    [-0.8, 0.95, 0.07], // stacks
    [0.98, 0.88, 0.07],
    [0.78, 0.85, 0.07],
    [-0.2, 1.25, 0.07],
    [-0.5, 0.45, 0.07],
    [0.25, 0.12, 0.07], // standing coins
    [-0.58, 0.05, 0.07],
    [0.1, 0.05, 0.07],
    [0.9, -0.45, 0.25], // crystals
    [-0.95, -0.5, 0.2],
    [-1.15, 0.02, 0.28], // sack
  ];
  const free = (x: number, z: number, extra = 0) =>
    RES.every(([rx, rz, rr]) => Math.hypot(x - rx, z - rz) > rr + extra) &&
    !(Math.abs(x) < 0.5 && z > -0.86 && z < -0.17);

  const rivetGeos: THREE.BufferGeometry[] = [];
  const lidRivetGeos: THREE.BufferGeometry[] = [];
  const rivet = (list: THREE.BufferGeometry[], x: number, y: number, z: number, r = 0.011) =>
    list.push(new THREE.SphereGeometry(r, 6, 4).translate(x, y, z));

  // --------------------------------------------------------------------------------------------------------
  // The mound

  FLOOR.forEach((d, i) =>
    put(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? MOUND_B : MOUND_A, [d.x, d.y, d.z], {
      scale: [d.rx, d.h, d.rz],
      flat: true,
    }),
  );

  // --------------------------------------------------------------------------------------------------------
  // Chest

  put(new THREE.BoxGeometry(CW, CH, CD), bodyWood, [0, CH / 2, CZ]);
  put(new THREE.BoxGeometry(CW + 0.03, 0.035, CD + 0.03), GOLD_DEEP, [0, 0.0175, CZ]);
  // rim frame and velvet lining
  for (const sz of [1, -1])
    put(new THREE.BoxGeometry(CW, 0.03, 0.05), WOOD_RIM, [0, CH + 0.015, CZ + sz * (CD / 2 - 0.025)]);
  for (const sx of [1, -1])
    put(new THREE.BoxGeometry(0.05, 0.03, CD - 0.1), WOOD_RIM, [sx * (CW / 2 - 0.025), CH + 0.015, CZ]);
  put(new THREE.BoxGeometry(CW - 0.1, 0.008, CD - 0.1), velvet("#c2174a", "#ff7d9a"), [0, CH + 0.002, CZ]);

  // corner posts, straps, rivets, side handles
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * (CW / 2 - 0.005);
      const z = CZ + sz * (CD / 2 - 0.005);
      put(new THREE.BoxGeometry(0.07, CH, 0.07), GOLD, [x, CH / 2, z]);
      if (sz > 0) for (const y of [0.06, 0.18, 0.3]) rivet(rivetGeos, x, y, z + 0.035);
    }
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const z = CZ + sz * (CD / 2 + 0.001);
      put(new THREE.BoxGeometry(0.08, CH, 0.014), GOLD, [sx * 0.26, CH / 2, z]);
      if (sz > 0) for (const y of [0.05, 0.12, 0.19, 0.26, 0.33]) rivet(rivetGeos, sx * 0.26, y, z + 0.008);
    }
  for (const sx of [1, -1]) {
    put(new THREE.BoxGeometry(0.02, 0.07, 0.07), GOLD, [sx * (CW / 2 + 0.008), 0.22, CZ]);
    put(new THREE.TorusGeometry(0.034, 0.008, 5, 12), GOLD_BR, [sx * (CW / 2 + 0.022), 0.205, CZ], {
      dir: [1, 0, 0],
      axis: "z",
    });
  }
  // flourish panels either side of the lock
  for (const sx of [1, -1])
    put(new THREE.PlaneGeometry(0.1, 0.2), "#ffffff", [sx * 0.145, 0.2, CZ + CD / 2 + 0.0025], {
      dir: [0, 0, 1],
      axis: "z",
      texture: FLOURISH,
    });
  // lock plate with a glowing keystone and a keyhole
  b.extrude(
    [
      [-0.065, 0.07],
      [0.065, 0.07],
      [0.065, -0.02],
      [0, -0.085, "sharp"],
      [-0.065, -0.02],
    ],
    { at: [0, 0.27, CZ + CD / 2 - 0.006], x: [1, 0, 0], thickness: 0.016, bevel: 0.004, color: GOLD, bone: root },
  );
  gem(V(0, 0.32, CZ + CD / 2 + 0.004), V(0, 0.15, 1), 0.05, "#27e3ff", { glowS: 0.7, spin: 20 });
  put(new THREE.CircleGeometry(0.014, 8), INK, [0, 0.245, CZ + CD / 2 + 0.0035], { dir: [0, 0, 1], axis: "z" });
  put(new THREE.BoxGeometry(0.008, 0.032, 0.002), INK, [0, 0.222, CZ + CD / 2 + 0.0035]);

  // chest heap
  for (const d of CHEST_HEAP)
    put(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), MOUND_A, [d.x, d.y, d.z], {
      scale: [d.rx, d.h, d.rz],
      flat: true,
    });
  for (let i = 0, placed = 0; placed < 90 && i < 2400; i++) {
    const x = -0.36 + R() * 0.72;
    const z = CZ - 0.22 + R() * 0.44;
    if (heightOf(CHEST_HEAP, x, z) < HEAP_Y + 0.01) continue;
    placeCoin(CHEST_HEAP, x, z, 0.8);
    placed++;
  }
  for (const [x, z, s, hex] of [
    [-0.1, CZ + 0.0, 0.085, RUBY],
    [0.16, CZ - 0.05, 0.07, AQUA],
    [0.0, CZ + 0.11, 0.06, EMER],
    [0.25, CZ + 0.08, 0.055, AMETH],
    [-0.26, CZ - 0.04, 0.06, TOPAZ],
  ] as Array<[number, number, number, string]>) {
    const h = heightOf(CHEST_HEAP, x, z);
    const nb = normalAt(CHEST_HEAP, x, z);
    const axis = nb.clone().add(V((R() - 0.5) * 0.5, 0.2, 0.25)).normalize();
    gem(V(x, h, z).addScaledVector(axis, -0.15 * s), axis, s, hex, { glowS: 0.6, spin: R() * 45 });
  }
  for (let i = 0, placed = 0; placed < 10 && i < 800; i++) {
    const x = -0.34 + R() * 0.68;
    const z = CZ - 0.2 + R() * 0.4;
    if (heightOf(CHEST_HEAP, x, z) < HEAP_Y + 0.05) continue;
    const s = 0.024 + R() * 0.018;
    const nb = normalAt(CHEST_HEAP, x, z);
    const axis = nb.clone().add(V((R() - 0.5) * 1.4, 0.1, (R() - 0.5) * 1.4)).normalize();
    const h = heightOf(CHEST_HEAP, x, z);
    gem(V(x, h, z).addScaledVector(nb, 0.3 * s).addScaledVector(axis, -0.42 * s), axis, s, GEM_HEX[placed % GEM_HEX.length], {
      spin: R() * 45,
    });
    placed++;
  }

  // lid, on its hinge joint
  const lidBone = { bone: lid };
  b.extrude(arch(LR, LHS, LHT), {
    at: [0, RIM, CZ],
    x: [0, 0, 1],
    thickness: 0.86,
    bevel: 0.01,
    color: lidWood,
    ...lidBone,
  });
  put(new THREE.BoxGeometry(CW - 0.04, 0.008, CD - 0.04), velvet("#c2174a", "#ff7d9a"), [0, RIM - 0.004, CZ], lidBone);
  for (const sx of [1, -1]) {
    b.extrude(archBand(LR, LHS, LHT, 0.016), {
      at: [sx * 0.26, RIM, CZ],
      x: [0, 0, 1],
      thickness: 0.075,
      color: GOLD,
      ...lidBone,
    });
    for (let i = 1; i < 8; i++) {
      const a = (Math.PI * i) / 8;
      rivet(
        lidRivetGeos,
        sx * 0.26,
        RIM + LHS + (LHT + 0.016) * Math.sin(a) + 0.003,
        CZ - (LR + 0.016) * Math.cos(a),
        0.0105,
      );
    }
    // end plates and jewels
    b.extrude(arch(LR + 0.01, LHS, LHT + 0.01), {
      at: [sx * 0.436, RIM, CZ],
      x: [0, 0, 1],
      thickness: 0.02,
      bevel: 0.004,
      color: GOLD_DEEP,
      ...lidBone,
    });
    gem(V(sx * 0.44, RIM + 0.1, CZ), V(sx, 0, 0), 0.07, sx > 0 ? AMETH : SAPPH, { bone: lid, spin: 10 });
  }
  b.extrude(
    [
      [-0.05, 0.0],
      [0.05, 0.0],
      [0.05, -0.1],
      [0, -0.145, "sharp"],
      [-0.05, -0.1],
    ],
    { at: [0, RIM + 0.04, CZ + LR + 0.0065], x: [1, 0, 0], thickness: 0.013, bevel: 0.003, color: GOLD_BR, bone: lid },
  );
  put(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8), GOLD, [0, RIM, HINGE_Z], { dir: [1, 0, 0], ...lidBone });
  for (const sx of [1, -1])
    put(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8), GOLD, [sx * 0.25, RIM, HINGE_Z], { dir: [1, 0, 0] });

  // --------------------------------------------------------------------------------------------------------
  // Coins

  for (let i = 0, placed = 0; placed < 470 && i < 12000; i++) {
    const x = -1.4 + R() * 2.8;
    const z = -1.2 + R() * 2.6;
    const h = heightOf(FLOOR, x, z);
    if (h < 0.03 || !free(x, z)) continue;
    placeCoin(FLOOR, x, z, 0.9, 0, R() < 0.05);
    placed++;
  }
  // coins lying around the mound
  for (let i = 0, placed = 0; placed < 18 && i < 800; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.15 + R() * 0.7;
    const x = Math.cos(a) * r * 1.1;
    const z = 0.3 + Math.sin(a) * r * 0.9;
    if (heightOf(FLOOR, x, z) > 0.005 || Math.abs(x) < 0.55 && z < -0.1 || Math.hypot(x + 1.15, z - 0.02) < 0.34) continue;
    const q = new THREE.Quaternion().setFromAxisAngle(UP, R() * Math.PI * 2);
    coin(pickCoin(), V(x, 0.0065, z), q);
    placed++;
  }
  // spilled stream from the tipped goblet
  const SPILL = V(0.15, 0, 0.97).normalize();
  for (let i = 0; i < 15; i++) {
    const s = 0.28 + i * 0.034;
    const wob = (R() - 0.5) * 0.06 * (0.4 + i / 10);
    const x = 0.04 + SPILL.x * s + wob;
    const z = 0.62 + SPILL.z * s * 0.95;
    placeCoin(FLOOR, x, z, 0.6, 0.004 * (i % 3));
  }
  // coin stacks, each with an emblem on top
  const stack = (x: number, z: number, count: number, color: string) => {
    const t = 0.014;
    const base = heightOf(FLOOR, x, z) - 0.012;
    for (let i = 0; i < count; i++) {
      const q = new THREE.Quaternion().setFromAxisAngle(UP, R() * Math.PI * 2);
      coin(color, V(x + (R() - 0.5) * 0.008, base + t / 2 + i * (t + 0.0008), z + (R() - 0.5) * 0.008), q);
    }
    put(new THREE.CircleGeometry(0.044, 12), "#ffffff", [x, base + count * (t + 0.0008) + 0.0008, z], {
      dir: [0, 1, 0],
      axis: "z",
      texture: COIN_TEX,
    });
  };
  stack(-0.8, 0.95, 5, COIN_COLORS[0]);
  stack(0.98, 0.88, 7, COIN_COLORS[1]);
  stack(0.78, 0.85, 4, COIN_COLORS[3]);
  stack(-0.2, 1.25, 3, COIN_COLORS[0]);
  stack(-0.5, 0.45, 6, COIN_COLORS[1]);
  // big coins standing on edge, faces painted with an emblem
  const standCoin = (x: number, z: number, face: THREE.Vector3, r = 0.058) => {
    const f = face.clone().normalize();
    const t = 0.018;
    const h = Math.max(0, heightOf(FLOOR, x, z));
    const pos = V(x, h - 0.012 + r * Math.sqrt(1 - f.y * f.y) + (t / 2) * Math.abs(f.y), z);
    put(new THREE.CylinderGeometry(r, r, t, 10, 1), GOLD, pos, { quat: aim(f), flat: true });
    for (const sg of [1, -1])
      put(new THREE.CircleGeometry(r * 0.88, 12), "#ffffff", pos.clone().addScaledVector(f, sg * (t / 2 + 0.0015)), {
        dir: f.clone().multiplyScalar(sg),
        axis: "z",
        texture: COIN_TEX,
      });
    put(new THREE.TorusGeometry(r * 0.96, 0.0045, 4, 14), GOLD_BR, pos, { dir: f, axis: "z" });
  };
  standCoin(0.25, 0.12, V(0.25, 0.4, 0.88));
  standCoin(-0.58, 0.05, V(-0.45, 0.35, 0.82));
  standCoin(0.1, 0.05, V(0.0, 0.3, 0.95));

  // --------------------------------------------------------------------------------------------------------
  // Ingot pyramid

  const ingotTop = paint((_p, n) => (n.y > 0.7 ? GOLD_BR : GOLD));
  const ingot = (x: number, y: number, z: number, yawDeg: number) => {
    const W = 0.17;
    const D = 0.08;
    const H = 0.05;
    const g = new THREE.CylinderGeometry(0.78, 1, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    put(g, ingotTop, [x, y + H / 2, z], { scale: [W / 1.4142, H, D / 1.4142], rotation: [0, yawDeg, 0], flat: true });
    put(new THREE.BoxGeometry(W * 0.5, 0.003, D * 0.45), GOLD_DEEP, [x, y + H + 0.0005, z], { rotation: [0, yawDeg, 0] });
  };
  {
    const yaw = 20;
    const cy = Math.cos(yaw * DEG);
    const sy = Math.sin(yaw * DEG);
    const at = (lx: number, lz: number): [number, number] => [-0.9 + lx * cy + lz * sy, 0.5 - lx * sy + lz * cy];
    const base =
      Math.min(...[-0.19, 0, 0.19].map((lx) => heightOf(FLOOR, ...at(lx, 0)))) - 0.015;
    for (const lx of [-0.19, 0, 0.19]) {
      const [x, z] = at(lx, 0);
      ingot(x, base, z, yaw + (R() - 0.5) * 6);
    }
    for (const lx of [-0.095, 0.095]) {
      const [x, z] = at(lx, 0);
      ingot(x, base + 0.05, z, yaw + (R() - 0.5) * 6);
    }
    const [tx, tz] = at(0, 0);
    ingot(tx, base + 0.1, tz, yaw + 4);
    const [lx2, lz2] = at(0.1, 0.17);
    ingot(lx2, Math.max(0, heightOf(FLOOR, lx2, lz2)) - 0.02, lz2, yaw + 70);
  }

  // --------------------------------------------------------------------------------------------------------
  // Goblets

  function goblet(
    foot: THREE.Vector3,
    axis: THREE.Vector3,
    k: number,
    o: { lit: string; shade: string; line: string; trim: Paint; gems: string[]; heap: boolean; topGem?: string },
  ) {
    const B = basis(axis);
    b.lathe(
      GOBLET_PTS.map(([x, y]) => [x * k, y * k] as [number, number]),
      { at: foot, axis: B.a, segments: 10, color: metalPaint(o.lit, o.shade, o.line, k), bone: root },
    );
    put(new THREE.TorusGeometry(0.0675 * k, 0.0075 * k, 5, 12), o.trim, foot.clone().addScaledVector(B.a, 0.2385 * k), {
      dir: B.a,
      axis: "z",
    });
    put(new THREE.TorusGeometry(0.073 * k, 0.007 * k, 5, 12), o.trim, foot.clone().addScaledVector(B.a, 0.008 * k), {
      dir: B.a,
      axis: "z",
    });
    put(new THREE.TorusGeometry(0.037 * k, 0.005 * k, 5, 10), o.trim, foot.clone().addScaledVector(B.a, 0.108 * k), {
      dir: B.a,
      axis: "z",
    });
    for (let i = 0; i < 6; i++) {
      const deg = i * 60 + 15;
      const rad = radialDir(B, deg);
      const axisG = rad.clone().multiplyScalar(0.9).addScaledVector(B.a, 0.35).normalize();
      gem(ringPt(foot, B, 0.057 * k, deg, 0.183 * k), axisG, 0.03 * k, o.gems[i % o.gems.length], { spin: i * 7 });
    }
    for (let i = 0; i < 4; i++) {
      const deg = i * 90;
      gem(ringPt(foot, B, 0.034 * k, deg, 0.108 * k), radialDir(B, deg), 0.016 * k, o.gems[(i + 1) % o.gems.length]);
    }
    if (o.heap) {
      put(
        new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2),
        "#f5b928",
        foot.clone().addScaledVector(B.a, 0.2 * k),
        { scale: [0.054 * k, 0.045 * k, 0.054 * k], dir: B.a, flat: true },
      );
      for (let i = 0; i < 6; i++) {
        const deg = i * 60 + 10;
        const lean = radialDir(B, deg).multiplyScalar(0.75).addScaledVector(B.a, 0.65).normalize();
        coin(COIN_COLORS[i % 2], ringPt(foot, B, 0.03 * k, deg, 0.232 * k), aim(lean), 0.03 * k, 0.01 * k);
      }
      if (o.topGem) gem(foot.clone().addScaledVector(B.a, 0.236 * k), B.a, 0.036 * k, o.topGem, { glowS: 0.6 });
    }
  }

  goblet(
    V(-0.42, heightOf(FLOOR, -0.42, 0.95) - 0.015, 0.95),
    V(0.04, 1, 0.08),
    1.1,
    { lit: "#ffc42b", shade: "#d9780f", line: "#b8620e", trim: GOLD_BR, gems: [EMER, RUBY, EMER, SAPPH], heap: true, topGem: RUBY },
  );
  goblet(
    V(1.0, heightOf(FLOOR, 1.0, 0.45) - 0.01, 0.45),
    V(-0.1, 1, -0.06),
    0.95,
    { lit: SILVER_LIT, shade: SILVER_SHADE, line: "#5d6fb0", trim: GOLD_BR, gems: [AMETH, AQUA, AMETH], heap: true, topGem: AMETH },
  );
  {
    const foot = V(0.0, heightOf(FLOOR, 0.0, 0.62) + 0.045, 0.62);
    goblet(foot, V(0.15, -0.08, 0.98), 1.0, {
      lit: "#ffc42b",
      shade: "#d9780f",
      line: "#b8620e",
      trim: GOLD_BR,
      gems: [SAPPH, TOPAZ, SAPPH],
      heap: false,
    });
  }

  // --------------------------------------------------------------------------------------------------------
  // Crown

  {
    const c = V(0.52, heightOf(FLOOR, 0.52, 0.62) - 0.02, 0.62);
    const B = basis(V(0.1, 1, 0.42));
    b.lathe(
      [
        [0.1, 0],
        [0.116, 0],
        [0.122, 0.012],
        [0.122, 0.08],
        [0.114, 0.092],
        [0.1, 0.092],
      ],
      { at: c, axis: B.a, segments: 16, color: crownBand, bone: root },
    );
    b.lathe(
      [
        [0, 0.018],
        [0.1, 0.018],
        [0.1, 0.06],
        [0.07, 0.078],
        [0, 0.085],
      ],
      { at: c, axis: B.a, segments: 12, color: velvet("#c71f4f", "#ff6f8e"), bone: root },
    );
    const beads: THREE.BufferGeometry[] = [];
    for (const h of [0.012, 0.082])
      for (let i = 0; i < 16; i++) {
        const p = ringPt(c, B, 0.121, i * 22.5, h);
        beads.push(new THREE.SphereGeometry(0.0075, 6, 4).translate(p.x, p.y, p.z));
      }
    const beadMerged = mergeGeometries(beads);
    if (beadMerged) put(beadMerged, RIVET, [0, 0, 0]);
    for (let i = 0; i < 8; i++) {
      const deg = i * 45;
      const tall = i % 2 === 0;
      const hgt = tall ? 0.19 : 0.105;
      const w = tall ? 0.044 : 0.03;
      const base = ringPt(c, B, 0.118, deg, 0.08);
      b.extrude(spireOutline(w, hgt), {
        at: base,
        x: tangentDir(B, deg),
        y: B.a,
        thickness: 0.018,
        bevel: 0.004,
        smoothing: 1,
        color: tall ? GOLD : GOLD_BR,
        bone: root,
      });
      const tip = base.clone().addScaledVector(B.a, hgt + 0.008);
      put(new THREE.SphereGeometry(tall ? 0.016 : 0.012, 6, 4), tall ? "#fff4d8" : RIVET, tip);
      const rad = radialDir(B, deg);
      if (tall)
        gem(base.clone().addScaledVector(B.a, 0.05).addScaledVector(rad, 0.004), rad, 0.03, [SAPPH, AQUA, AMETH, EMER][i / 2], {
          spin: 9,
        });
      const gemColor = i === 0 ? RUBY : [SAPPH, EMER, AQUA, AMETH, TOPAZ, ROSE, EMER][(i - 1) % 7];
      if (i === 0) gem(ringPt(c, B, 0.108, deg, 0.046), rad, 0.085, gemColor, { glowS: 0.65, spin: 12 });
      else gem(ringPt(c, B, 0.113, deg, 0.046), rad, 0.048, gemColor, { spin: i * 5 });
    }
    star(ringPt(c, B, 0.118, 0, 0.08 + 0.19 + 0.07), 0.13, STAR_GOLD);
  }

  // --------------------------------------------------------------------------------------------------------
  // Scattered gems

  {
    const placed: Array<[number, number]> = [];
    for (let i = 0; placed.length < 34 && i < 4000; i++) {
      const x = -1.25 + R() * 2.5;
      const z = -0.2 + R() * 1.55;
      const h = heightOf(FLOOR, x, z);
      if (h < 0.08 || !free(x, z, 0.03) || placed.some(([gx, gz]) => Math.hypot(x - gx, z - gz) < 0.14)) continue;
      placed.push([x, z]);
      const s = 0.03 + R() * 0.028;
      const hex = GEM_HEX[Math.floor(R() * GEM_HEX.length)];
      const nb = normalAt(FLOOR, x, z);
      const axis = nb.clone().add(V((R() - 0.5) * 1.6, (R() - 0.2) * 0.6, (R() - 0.5) * 1.6)).normalize();
      const at = V(x, h, z).addScaledVector(nb, 0.35 * s).addScaledVector(axis, -0.42 * s);
      gem(at, axis, s, hex, { glowS: placed.length % 6 === 0 ? 0.5 : 0, spin: R() * 45 });
    }
  }

  // --------------------------------------------------------------------------------------------------------
  // Crystals

  function crystal(base: THREE.Vector3, axis: THREE.Vector3, len: number, r: number, body: string, tip: string, spin: number) {
    const a = axis.clone().normalize();
    glow(
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r, 0.72 * len],
          [0, 0.72 * len],
        ],
        { at: base, axis: a, segments: 6, spin, color: body, bone: root },
      ),
      0.6,
    );
    glow(
      b.lathe(
        [
          [0, 0.72 * len],
          [r, 0.72 * len],
          [0, len],
        ],
        { at: base, axis: a, segments: 6, spin, color: tip, bone: root },
      ),
      0.9,
    );
  }
  {
    const cx = 0.92;
    const cz = -0.45;
    const y0 = heightOf(FLOOR, cx, cz) - 0.03;
    const specs: Array<[number, number, number, number, number, number]> = [
      [0, 0, 0.55, 0.06, 0.0, -0.1],
      [0.13, 0.05, 0.38, 0.045, 0.5, 0.2],
      [-0.12, 0.07, 0.34, 0.04, -0.45, 0.1],
      [0.04, 0.14, 0.28, 0.035, 0.2, 0.6],
      [-0.06, -0.12, 0.24, 0.032, -0.3, -0.6],
      [0.15, -0.08, 0.2, 0.03, 0.6, -0.3],
    ];
    specs.forEach(([dx, dz, len, r, tx, tz], i) =>
      crystal(V(cx + dx, y0, cz + dz), V(tx, 1, tz), len, r, "#25d3ff", "#aaf5ff", i * 11),
    );
    const vx = -0.95;
    const vz = -0.5;
    const vy = heightOf(FLOOR, vx, vz) - 0.03;
    const vspecs: Array<[number, number, number, number, number, number]> = [
      [0, 0, 0.36, 0.05, 0.1, 0.0],
      [0.1, 0.06, 0.26, 0.036, 0.5, 0.3],
      [-0.1, 0.05, 0.22, 0.032, -0.5, 0.2],
    ];
    vspecs.forEach(([dx, dz, len, r, tx, tz], i) =>
      crystal(V(vx + dx, vy, vz + dz), V(tx, 1, tz), len, r, "#8f4dff", "#d6b4ff", i * 17),
    );
  }

  // --------------------------------------------------------------------------------------------------------
  // Pearl necklace and a ring

  {
    const cx = 0.55;
    const cz = 1.1;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = cx + 0.17 * Math.cos(a);
      const z = cz + 0.1 * Math.sin(a);
      pts.push(V(x, Math.max(0.02, heightOf(FLOOR, x, z)) + 0.014, z));
    }
    const path = catmull(pts, { closed: true });
    b.sweep(path, 0.0035, { color: "#6d4a2a", bone: root });
    const pearls: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 34; i++) {
      const p = path.at(i / 34);
      pearls.push(new THREE.SphereGeometry(0.0135, 6, 4).translate(p.x, p.y, p.z));
    }
    const pm = mergeGeometries(pearls);
    if (pm) put(pm, "#f3f0ff", [0, 0, 0]);
    const front = path.at(0.25);
    put(new THREE.SphereGeometry(0.02, 6, 4), GOLD_BR, [front.x, front.y + 0.006, front.z + 0.012]);
    gem(V(front.x, front.y + 0.008, front.z + 0.022), V(0, 0.45, 1), 0.06, SAPPH, { spin: 15 });
  }
  {
    const x = -0.3;
    const z = 0.3;
    const h = heightOf(FLOOR, x, z);
    const d = V(0, 0.6, 0.8).normalize();
    const upIn = V(0, 0.8, -0.6);
    const pos = V(x, h + 0.034, z);
    put(new THREE.TorusGeometry(0.03, 0.007, 5, 12), GOLD_BR, pos, { dir: d, axis: "z" });
    put(new THREE.SphereGeometry(0.011, 6, 4), GOLD, pos.clone().addScaledVector(upIn, 0.036));
    gem(pos.clone().addScaledVector(upIn, 0.04), upIn, 0.04, RUBY, { glowS: 0.5, spin: 8 });
  }

  // --------------------------------------------------------------------------------------------------------
  // Coin sack

  {
    const bx = -1.15;
    const bz = 0.02;
    const sack = b.lathe(
      [
        [0, 0],
        [0.17, 0],
        [0.22, 0.09],
        [0.21, 0.2],
        [0.13, 0.31],
        [0.06, 0.36],
        [0.07, 0.385],
        [0.13, 0.44],
        [0.115, 0.455],
        [0.075, 0.42],
        [0, 0.4],
      ],
      { at: [bx, 0, bz], axis: [0, 1, 0], segments: 10, color: cel(mottle("#d6ab6e", "#b88a4d", { size: 0.035, seed: 3 })), bone: root },
    );
    b.decal(sack, EMBLEM, { at: V(bx, 0.17, bz + 0.2), dir: [0, 0, 1], size: [0.17, 0.17] });
    put(new THREE.TorusGeometry(0.075, 0.012, 5, 10), "#8a5a2b", [bx, 0.375, bz], { rotation: [90, 0, 0] });
    b.rod(V(bx + 0.07, 0.37, bz + 0.03), V(bx + 0.17, 0.2, bz + 0.1), 0.008, { color: "#8a5a2b", bone: root });
    b.rod(V(bx + 0.06, 0.375, bz + 0.05), V(bx + 0.1, 0.18, bz + 0.17), 0.008, { color: "#8a5a2b", bone: root });
    for (let i = 0; i < 6; i++) {
      const deg = i * 60 + 20;
      const x = bx + Math.cos(deg * DEG) * 0.06;
      const z = bz + Math.sin(deg * DEG) * 0.06;
      const lean = V(Math.cos(deg * DEG) * 0.6, 0.8, Math.sin(deg * DEG) * 0.6).normalize();
      coin(COIN_COLORS[i % 3], V(x, 0.45 + (i % 2) * 0.02, z), aim(lean));
    }
  }

  // --------------------------------------------------------------------------------------------------------
  // Glints

  function star(at: THREE.Vector3, size: number, tex: THREE.Texture) {
    return glow(b.cards([frame([at.x, at.y - size / 2, at.z], [0, 1, 0])], tex, { size, flow: [0, 0, 1], bone: root, sink: 0 }), 1.2);
  }
  star(V(0.1, 0.72, CZ + 0.12), 0.14, STAR_GOLD);
  star(V(-0.24, 0.62, CZ + 0.2), 0.1, STAR_GOLD);
  star(V(0.3, 0.64, CZ + 0.14), 0.08, STAR_CYAN);
  star(V(-0.42, 0.58, 0.95), 0.1, STAR_GOLD);
  star(V(1.0, 0.5, 0.45), 0.1, STAR_CYAN);
  star(V(0.92, 0.98, -0.45), 0.16, STAR_CYAN);
  star(V(1.12, 0.68, -0.3), 0.09, STAR_CYAN);
  star(V(-0.95, 0.62, -0.5), 0.1, STAR_CYAN);
  star(V(0.0, 0.42, 0.62), 0.09, STAR_GOLD);

  // --------------------------------------------------------------------------------------------------------
  // Flush merged parts

  for (const [color, list] of coinGroups) {
    const merged = mergeGeometries(list);
    if (merged) put(merged, color, [0, 0, 0], { flat: true });
  }
  const rv = mergeGeometries(rivetGeos);
  if (rv) put(rv, RIVET, [0, 0, 0]);
  const lrv = mergeGeometries(lidRivetGeos);
  if (lrv) put(lrv, RIVET, [0, 0, 0], { bone: lid });

  // Swing the lid open on its hinge.
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });

  return b.root;
}
