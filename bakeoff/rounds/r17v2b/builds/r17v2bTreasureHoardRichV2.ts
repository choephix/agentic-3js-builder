// Treasure hoard: a rune-lit stone dais heaped with gold coins, an open ornate chest, a spiked crown, goblets, gem
// crystals and loose jewels. League of Legends style: exaggerated chunky shapes, painted hard-edged light tones,
// saturated cyan/magenta magic glow against warm gold.
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mix, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { shadowOf } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A rune-lit stone dais heaped with gold: an open iron-banded chest with a glowing keyhole, a spiked jewel crown, three goblets, hundreds of coins, ingots, a coin sack, a pearl necklace and glowing crystal clusters.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Light tones: every painted colour is four hard-edged tones picked by the surface normal against one key light.

const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const lvl = (n: THREE.Vector3) => {
  const d = n.dot(KEY);
  return d > 0.78 ? 0 : d > 0.1 ? 1 : d > -0.35 ? 2 : 3;
};
type Pal = readonly [string, string, string, string]; // highlight, lit, shade, deep shade
const tone = (p: Pal) => paint((_p, n) => p[lvl(n)]);

const GOLD: Pal = ["#fff3a6", "#ffc934", "#e8861a", "#9b3f1c"];
const GOLD_B: Pal = ["#ffe27a", "#f5b523", "#d07418", "#7a3320"];
const GOLD_C: Pal = ["#fff0a0", "#eaa01c", "#c0661a", "#6b2a22"];
const SILVER: Pal = ["#ffffff", "#d4e2ff", "#8c9fe0", "#4b4796"];
const STONE: Pal = ["#a590ee", "#6d58c2", "#44339a", "#271b5f"];
const STONE_B: Pal = ["#9a86e8", "#5f4cb8", "#3a2b8c", "#21165a"];
const VELVET: Pal = ["#ff6b8d", "#d41f55", "#8e1550", "#4a0c3d"];
const WOOD_A: Pal = ["#f09a5c", "#c25a30", "#7d3033", "#3e1d3a"];
const WOOD_B: Pal = ["#e58a50", "#b04c2c", "#6f2a34", "#361a38"];
const LEATHER: Pal = ["#f8d696", "#d4a05c", "#98593c", "#552f3d"];

const GOLDP = tone(GOLD);
const SILVERP = tone(SILVER);
const VELVETP = tone(VELVET);

const COIN_A = "#ffd23f";
const COIN_B = "#f5ab1e";
const COIN_C = "#ffe580";
const COIN_D = "#e8921c";
const COIN_S = "#d9e5ff";
const CYAN = "#3be8ff";
const VIOLET = "#a066ff";
const MAGENTA = "#ff4fc3";

function gemPaint(base: string) {
  const hi = mix(base, "#ffffff", 0.7);
  const lt = mix(base, "#ffffff", 0.3);
  const sh = shadowOf(base);
  const dp = mix(shadowOf(base), "#1a0a33", 0.5);
  return paint((_p, n) => {
    const d = n.dot(KEY);
    if (d > 0.9) return "#ffffff";
    if (d > 0.62) return hi;
    if (d > 0.2) return lt;
    if (d > -0.15) return base;
    if (d > -0.55) return sh;
    return dp;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const qe = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
const frac = (x: number) => x - Math.floor(x);

/** A local frame: origin, orientation, and conversion of local points and directions to model space. */
class Xf {
  constructor(
    readonly o: THREE.Vector3,
    readonly q: THREE.Quaternion,
  ) {}
  static yaw(o: THREE.Vector3, yaw = 0, pitch = 0, roll = 0) {
    return new Xf(o, new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, "YXZ")));
  }
  p(v: readonly number[]) {
    return V(v[0], v[1], v[2]).applyQuaternion(this.q).add(this.o);
  }
  d(v: readonly number[]) {
    return V(v[0], v[1], v[2]).applyQuaternion(this.q);
  }
  inv(w: THREE.Vector3) {
    return w.clone().sub(this.o).applyQuaternion(this.q.clone().invert());
  }
  /** This frame's orientation turned by a local euler rotation. */
  turn(x: number, y: number, z: number) {
    return this.q.clone().multiply(qe(x, y, z));
  }
  child(offset: readonly number[], x = 0, y = 0, z = 0) {
    return new Xf(this.p(offset), this.turn(x, y, z));
  }
}

/** Geometries collected in model space, merged into one part per bag. */
class Bag {
  readonly geos: THREE.BufferGeometry[] = [];
  add(g: THREE.BufferGeometry, pos: THREE.Vector3, q?: THREE.Quaternion, scale?: THREE.Vector3) {
    const m = new THREE.Matrix4().compose(pos, q ?? new THREE.Quaternion(), scale ?? V(1, 1, 1));
    this.geos.push(g.clone().applyMatrix4(m));
  }
  merged() {
    return this.geos.length ? mergeGeometries(this.geos) : null;
  }
}

const faceted = (g: THREE.BufferGeometry) => {
  const n = g.index ? g.toNonIndexed() : g;
  n.computeVertexNormals();
  return mergeVertices(n);
};

/** Brilliant-cut gem, point down, table up, base at y = 0. */
function cutGem(r: number, h: number) {
  const pts = [
    [0, 0],
    [0.52 * r, 0.3 * h],
    [r, 0.52 * h],
    [0.84 * r, 0.64 * h],
    [0.5 * r, 0.72 * h],
    [0, 0.72 * h],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return faceted(new THREE.LatheGeometry(pts, 8));
}

/** Hexagonal crystal prism with a two-stage point. */
function prism(r: number, h: number) {
  const pts = [
    [0, 0],
    [r, 0],
    [r, h],
    [0.62 * r, h + 0.5 * r],
    [0, h + 1.0 * r],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return faceted(new THREE.LatheGeometry(pts, 6));
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

function coinFace(kind: "crown" | "star" | "gem", ring: string, disc: string, glyph: string, rim: string) {
  const shapes = {
    crown: `<path d="M27 66 L24 38 L38 50 L50 30 L62 50 L76 38 L73 66 Z" fill="${glyph}"/><rect x="27" y="69" width="46" height="6" rx="2" fill="${glyph}"/>`,
    star: `<polygon points="50,22 57,41 78,35 65,52 80,67 58,62 50,82 42,62 20,67 35,52 22,35 43,41" fill="${glyph}"/><circle cx="50" cy="52" r="6" fill="${disc}"/>`,
    gem: `<polygon points="50,24 72,44 50,78 28,44" fill="${glyph}"/><polygon points="50,24 60,44 50,78 40,44" fill="${ring}"/><rect x="26" y="42" width="48" height="4" fill="${disc}"/>`,
  };
  return svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="${rim}"/><circle cx="50" cy="50" r="45" fill="${ring}"/><circle cx="50" cy="50" r="39" fill="${disc}"/><circle cx="50" cy="50" r="35" fill="none" stroke="${ring}" stroke-width="3" stroke-dasharray="5 4"/>${shapes[kind]}<path d="M16 42 A36 36 0 0 1 40 17" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="4.5" stroke-linecap="round"/></svg>`,
    { size: 160 },
  );
}

function runeRing() {
  let g = "";
  const N = 28;
  const glyphs = [
    "M0 -166 v22 M-8 -158 h16",
    "M-7 -166 l7 -9 l7 9 M0 -158 v14",
    "M-8 -168 l16 9 M-8 -150 l16 -9",
    "M0 -170 v26 M-8 -156 l8 -8 l8 8",
    "M-8 -166 h16 M0 -166 v22 M-8 -144 h16",
  ];
  for (let i = 0; i < N; i++)
    g += `<path transform="translate(200 200) rotate(${(i * 360) / N})" d="${glyphs[i % glyphs.length]}"/>`;
  let ticks = "";
  for (let i = 0; i < 56; i++)
    ticks += `<path transform="translate(200 200) rotate(${(i * 360) / 56})" d="M0 -190 v6"/>`;
  const inner = (stroke: string, w: number) =>
    `<g fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><circle cx="200" cy="200" r="196"/><circle cx="200" cy="200" r="178"/><circle cx="200" cy="200" r="132"/>${g}${ticks}</g>`;
  return svg(`<svg viewBox="0 0 400 400">${inner("#1d5fd0", 9)}${inner("#5ff3ff", 3.6)}</svg>`, { size: 1024 });
}

const KEYHOLE = svg(
  `<svg viewBox="0 0 40 60"><path d="M20 4 a14 14 0 0 1 8 25 l6 27 h-28 l6 -27 a14 14 0 0 1 8 -25 z" fill="#1b0f3a"/><path d="M20 9 a9.5 9.5 0 0 1 5 17.500 l4 24 h-18 l4 -24 a9.5 9.5 0 0 1 5 -17.500 z" fill="#5ff3ff"/><circle cx="20" cy="19" r="4" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const SPARKLE = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 1 L38 26 L63 32 L38 38 L32 63 L26 38 L1 32 L26 26 Z" fill="#c9fbff"/><path d="M32 12 L35 29 L52 32 L35 35 L32 52 L29 35 L12 32 L29 29 Z" fill="#ffffff"/></svg>`,
  { size: 96 },
);
const SIGIL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#5a1236"/><circle cx="50" cy="50" r="43" fill="#c91f58"/><circle cx="50" cy="50" r="36" fill="none" stroke="#ffd23f" stroke-width="4"/><path d="M27 66 L24 38 L38 50 L50 28 L62 50 L76 38 L73 66 Z" fill="#ffd23f"/><rect x="27" y="69" width="46" height="7" rx="2" fill="#ffd23f"/><circle cx="50" cy="22" r="4" fill="#ffffff"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// World layout

const DAIS = 0.095; // top of the stone dais
const HW = 0.47; // chest half width and depth, height
const HD = 0.29;
const CH = 0.42;
const CHEST = Xf.yaw(V(-0.15, DAIS - 0.01, -0.45), 0.15);
const CH_TOP = DAIS - 0.01 + CH;

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

const BUMPS: readonly (readonly [number, number, number, number])[] = [
  [0.1, -0.05, 1.0, 0.38],
  [0.45, 0.4, 0.5, 0.17],
  [-0.55, 0.4, 0.5, 0.2],
  [0.0, 0.62, 0.42, 0.1],
  [0.8, -0.15, 0.5, 0.22],
  [-0.85, -0.2, 0.45, 0.2],
];

/** Height of the coin heap above the dais at x, z (chest fill included). */
function heap(x: number, z: number) {
  let h = 0;
  for (const [cx, cz, r, a] of BUMPS) {
    const d2 = ((x - cx) ** 2 + (z - cz) ** 2) / (r * r);
    if (d2 < 1) h += a * (1 - d2) * (1 - d2);
  }
  h = Math.min(h, 0.58) * (1 - smooth(0.85, 1.22, Math.hypot(x, z)));
  const l = CHEST.inv(V(x, 0, z));
  const du = Math.abs(l.x) - (HW - 0.05);
  const dv = Math.abs(l.z) - (HD - 0.05);
  const mask = 1 - smooth(0, 0.16, Math.max(du, dv));
  if (mask > 0) {
    const fill =
      CH_TOP + 0.04 - DAIS + 0.11 * Math.max(0, 1 - (l.x / HW) ** 2) * Math.max(0, 1 - (l.z / HD) ** 2);
    h = Math.max(h, fill * mask);
  }
  return h;
}
const heapY = (x: number, z: number) => DAIS + heap(x, z);
function heapNormal(x: number, z: number) {
  const e = 0.04;
  return V(-(heap(x + e, z) - heap(x - e, z)) / (2 * e), 1, -(heap(x, z + e) - heap(x, z - e)) / (2 * e)).normalize();
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "treasureHoard", paintSize: 2048 });
  const R = rng(2024);
  const root = b.joint("hoard", { at: [0, 0, 0] });
  const L = Xf.yaw(CHEST.p([0, CH, -HD]), 0.15);
  const LID = new Xf(CHEST.p([0, CH, -HD]), CHEST.turn(-(105 * Math.PI) / 180, 0, 0));
  void L;
  const lid = b.joint("lid", { parent: root, at: LID.o, dir: LID.d([0, 0, 1]), role: "hinge" });

  // Merge bags ------------------------------------------------------------------------------------------------
  const goldBag = new Bag(); // small gold fittings (studs, rivets, beads)
  const silverBag = new Bag();
  const gems = new Map<string, Bag>(); // painted cut gems, per colour
  const glowGems = new Map<string, Bag>(); // glowing cut gems
  const crystals = new Map<string, Bag>(); // glowing crystal prisms
  const gemAt = (map: Map<string, Bag>, color: string, pos: THREE.Vector3, axis: THREE.Vector3, r: number, h: number, spin = 0) => {
    let bag = map.get(color);
    if (!bag) map.set(color, (bag = new Bag()));
    const q = new THREE.Quaternion().setFromUnitVectors(UP, axis.clone().normalize()).multiply(qe(0, spin, 0));
    bag.add(cutGem(r, h), pos, q);
  };
  const stud = (bag: Bag, pos: THREE.Vector3, r: number) => bag.add(new THREE.SphereGeometry(r, 6, 4), pos);

  // Coins ------------------------------------------------------------------------------------------------------
  const FACE_A = coinFace("crown", "#e8921c", "#ffd23f", "#b35c14", "#8a3a14");
  const FACE_B = coinFace("star", "#d9791a", "#f7b92a", "#9d4313", "#7a2f16");
  const FACE_S = coinFace("gem", "#8c9fe0", "#d9e5ff", "#4b4796", "#4a3d8f");
  type CoinBucket = { body: Bag; face: Bag };
  const mk = (): CoinBucket => ({ body: new Bag(), face: new Bag() });
  const cA = mk();
  const cB = mk();
  const cC = mk();
  const cD = mk();
  const cS = mk();
  const coinBody = new THREE.CylinderGeometry(0.05, 0.05, 0.013, 8, 1);
  const coinFaceG = new THREE.CircleGeometry(0.043, 8).rotateX(-Math.PI / 2).translate(0, 0.0075, 0);
  const faceOf = new Map<CoinBucket, number>([
    [cA, 0],
    [cB, 1],
    [cC, 0],
    [cD, 1],
    [cS, 2],
  ]);
  const coin = (pos: THREE.Vector3, normal: THREE.Vector3, bucket: CoinBucket, r = 0.05, withFace = true) => {
    const q = new THREE.Quaternion()
      .setFromUnitVectors(UP, normal.clone().normalize())
      .multiply(qe(0, R() * Math.PI * 2, 0));
    const s = V(r / 0.05, 1, r / 0.05);
    bucket.body.add(coinBody, pos, q, s);
    if (withFace) bucket.face.add(coinFaceG, pos, q, s);
  };
  const pickBucket = () => {
    const t = R();
    return t < 0.27 ? cA : t < 0.52 ? cB : t < 0.76 ? cC : t < 0.93 ? cD : cS;
  };
  const jitterNormal = (n: THREE.Vector3, amt: number) =>
    n
      .clone()
      .add(V((R() - 0.5) * amt, (R() - 0.5) * amt * 0.4, (R() - 0.5) * amt))
      .normalize();

  // Keep-outs for the coin scatter ----------------------------------------------------------------------------
  const keep: { x: number; z: number; r: number }[] = [
    { x: -0.62, z: 0.4, r: 0.15 }, // goblet A
    { x: 0.72, z: -0.02, r: 0.17 }, // goblet B
    { x: 0.4, z: 0.4, r: 0.19 }, // crown
    { x: -1.2, z: 0.05, r: 0.3 }, // crystals
    { x: 1.2, z: 0.12, r: 0.28 },
    { x: 0.2, z: -1.2, r: 0.26 },
    { x: -0.55, z: 1.15, r: 0.26 },
    { x: 0.95, z: -0.7, r: 0.3 }, // sack
    { x: -1.0, z: -0.75, r: 0.32 }, // ingots
    { x: 0.82, z: 0.95, r: 0.15 }, // stacks
    { x: 0.98, z: 0.78, r: 0.15 },
  ];
  // The tipped goblet lies along this segment (xz).
  const TIP_FOOT = V(-0.34, 0, 0.3);
  const TIP_DIR = V(0.5, 0, 0.86).normalize();
  const nearTip = (x: number, z: number) => {
    const t = Math.min(Math.max((x - TIP_FOOT.x) * TIP_DIR.x + (z - TIP_FOOT.z) * TIP_DIR.z, 0), 0.45);
    return Math.hypot(x - TIP_FOOT.x - TIP_DIR.x * t, z - TIP_FOOT.z - TIP_DIR.z * t) < 0.19;
  };
  const blocked = (x: number, z: number) => {
    if (nearTip(x, z)) return true;
    if (keep.some((k) => Math.hypot(x - k.x, z - k.z) < k.r)) return true;
    const l = CHEST.inv(V(x, 0, z));
    const near = Math.abs(l.x) < HW + 0.07 && Math.abs(l.z) < HD + 0.07;
    return near && !(Math.abs(l.x) < HW - 0.08 && Math.abs(l.z) < HD - 0.08);
  };

  // The heap itself: a faceted gold mound over the dais, painted with coin-shaped cells.
  const heapMat = paint((p, n) => {
    const c = cells(p, 0.085, 2);
    const pal = c.id < 0.34 ? GOLD : c.id < 0.67 ? GOLD_B : GOLD_C;
    const l = lvl(n);
    if (c.d2 - c.d1 < 0.14) return pal[Math.min(3, l + 1)];
    return pal[l];
  });
  {
    const N = 44;
    const ext = 1.3;
    const step = (2 * ext) / N;
    const pos: number[] = [];
    const hs: number[] = [];
    for (let j = 0; j <= N; j++)
      for (let i = 0; i <= N; i++) {
        const x = -ext + i * step;
        const z = -ext + j * step;
        const h = heap(x, z);
        hs.push(h);
        pos.push(x, h > 0.003 ? DAIS + h : DAIS - 0.014, z);
      }
    const idx: number[] = [];
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i;
        const c = a + N + 1;
        if (Math.max(hs[a], hs[a + 1], hs[c], hs[c + 1]) < 0.004) continue;
        idx.push(a, c, a + 1, a + 1, c, c + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    const f = g.toNonIndexed();
    f.computeVertexNormals();
    b.part(mergeVertices(f), heapMat, { bone: root, at: [0, 0, 0], flat: true, name: "heapMound" });
  }

  // Scatter coins over the heap.
  let placed = 0;
  for (let attempt = 0; attempt < 2400 && placed < 760; attempt++) {
    const a = R() * Math.PI * 2;
    const r = 1.18 * Math.sqrt(R());
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = heap(x, z);
    if (h < 0.05 || blocked(x, z)) continue;
    let n = heapNormal(x, z);
    const roll = R();
    n = roll < 0.13 ? V(R() - 0.5, 0.25 + R() * 0.3, R() - 0.5).normalize() : jitterNormal(n, 0.85);
    const pos = V(x, DAIS + h + 0.01 + R() * 0.02, z);
    coin(pos, n, pickBucket(), 0.046 + R() * 0.012, n.y > 0.3 && R() < 0.92);
    placed++;
  }
  // The chest overflows: a denser sprinkle inside its rim.
  for (let k = 0; k < 150; k++) {
    const lx = (R() * 2 - 1) * (HW - 0.1);
    const lz = (R() * 2 - 1) * (HD - 0.1);
    const w = CHEST.p([lx, 0, lz]);
    const h = heap(w.x, w.z);
    const n = jitterNormal(heapNormal(w.x, w.z), 0.9);
    coin(V(w.x, DAIS + h + 0.012 + R() * 0.03, w.z), n, pickBucket(), 0.048 + R() * 0.01, true);
  }

  // Loose coins over the dais rim, a few standing on edge.
  for (let k = 0; k < 46; k++) {
    const a = R() * Math.PI * 2;
    const r = 1.12 + R() * 0.3;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (blocked(x, z)) continue;
    const standing = R() < 0.25;
    const n = standing ? V(R() - 0.5, 0.12, R() - 0.5).normalize() : jitterNormal(UP, 0.18);
    coin(V(x, DAIS + (standing ? 0.045 : 0.007), z), n, pickBucket(), 0.048 + R() * 0.01, !standing);
  }

  // Coin stacks and a toppled stack.
  const stack = (x: number, z: number, n: number, bucket: CoinBucket) => {
    for (let i = 0; i < n; i++)
      coin(V(x + (R() - 0.5) * 0.008, DAIS + 0.0075 + i * 0.0135, z + (R() - 0.5) * 0.008), UP, bucket, 0.05, i === n - 1);
  };
  stack(0.82, 0.95, 11, cA);
  stack(0.98, 0.78, 7, cB);
  stack(1.05, 0.97, 4, cS);
  for (let i = 0; i < 7; i++) {
    const t = i * 0.0145;
    coin(V(0.62 + t * 0.6, DAIS + 0.05, 1.05 - t * 0.8), V(0.6, 0.12, -0.8).normalize(), i % 2 ? cC : cA, 0.05, false);
  }

  // Dais ---------------------------------------------------------------------------------------------------------
  const daisMat = paint((p, n) => {
    const c = cells(p, 0.46, 5);
    const pal = c.id > 0.55 ? STONE : STONE_B;
    const l = lvl(n);
    if (c.d2 - c.d1 < 0.05 && n.y > 0.5) return pal[3];
    return pal[l];
  });
  b.lathe(
    [
      [0, 0],
      [1.54, 0],
      [1.55, 0.035],
      [1.5, 0.05],
      [1.47, 0.095],
      [0, 0.095],
    ],
    { at: [0, 0, 0], segments: 28, color: daisMat, bone: root, name: "dais" },
  );
  // Gold studs round the dais lip, and four rune-lit pylons are the crystal bases.
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    stud(goldBag, V(Math.cos(a) * 1.465, 0.078, Math.sin(a) * 1.465), 0.02);
  }
  glow(
    b.part(new THREE.CircleGeometry(1.42, 48), "#ffffff", {
      bone: root,
      at: [0, DAIS + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: runeRing(),
      name: "runeRing",
    }),
    1,
  );

  // Chest ---------------------------------------------------------------------------------------------------------
  const woodPaint = (xf: Xf, plankW: number, yAxis: boolean) => {
    const inv = xf.q.clone().invert();
    return paint((p, n) => {
      const l = lvl(n);
      const loc = p.clone().sub(xf.o).applyQuaternion(inv);
      const nl = n.clone().applyQuaternion(inv);
      if (!yAxis && nl.y < -0.7) return VELVET[l === 0 ? 1 : l];
      const u = yAxis ? loc.y : loc.x;
      const id = Math.floor(u / plankW);
      const f = u / plankW - id;
      const pal = id % 2 ? WOOD_A : WOOD_B;
      if (f < 0.06) return pal[Math.min(3, l + 1)];
      const g = noise(V(loc.x * 0.4 + loc.z * 0.4, loc.y * 8 + id * 3, 0), 0.25, 3 + id);
      if (g > 0.7) return pal[Math.min(3, l + 1)];
      return pal[l];
    });
  };
  const chestBody = b.part(new THREE.BoxGeometry(2 * HW, CH, 2 * HD), woodPaint(CHEST, 0.105, true), {
    bone: root,
    at: CHEST.p([0, CH / 2, 0]),
    quat: CHEST.q,
    name: "chestBody",
  });
  void chestBody;
  const box = (xf: Xf, c: readonly number[], size: readonly number[], pal: ReturnType<typeof tone>, name: string, bone = root) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), pal, { bone, at: xf.p(c), quat: xf.q, name });
  box(CHEST, [0, 0.03, 0], [2 * HW + 0.05, 0.06, 2 * HD + 0.05], GOLDP, "chestPlinth");
  // top rim frame
  box(CHEST, [0, CH - 0.03, HD], [2 * HW + 0.05, 0.06, 0.055], GOLDP, "chestRimF");
  box(CHEST, [0, CH - 0.03, -HD], [2 * HW + 0.05, 0.06, 0.055], GOLDP, "chestRimB");
  box(CHEST, [HW, CH - 0.03, 0], [0.055, 0.06, 2 * HD], GOLDP, "chestRimL");
  box(CHEST, [-HW, CH - 0.03, 0], [0.055, 0.06, 2 * HD], GOLDP, "chestRimR");
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(CHEST, [sx * (HW - 0.005), CH / 2, sz * (HD - 0.005)], [0.085, CH, 0.085], GOLDP, "chestPost");
      stud(goldBag, CHEST.p([sx * (HW + 0.012), CH - 0.07, sz * (HD + 0.012)]), 0.026);
      stud(goldBag, CHEST.p([sx * (HW + 0.012), 0.09, sz * (HD + 0.012)]), 0.022);
      // claw foot
      b.part(new THREE.SphereGeometry(0.06, 8, 5), GOLDP, {
        bone: root,
        at: CHEST.p([sx * (HW - 0.04), 0.0, sz * (HD - 0.04)]),
        name: "chestFoot",
      });
    }
  // front straps with rivets
  for (const sx of [1, -1]) {
    box(CHEST, [sx * 0.27, CH / 2, HD + 0.006], [0.105, CH - 0.06, 0.02], GOLDP, "chestStrap");
    for (let k = 0; k < 4; k++) stud(goldBag, CHEST.p([sx * 0.27, 0.07 + k * 0.095, HD + 0.02]), 0.013);
    // back straps
    box(CHEST, [sx * 0.27, CH / 2, -HD - 0.006], [0.105, CH - 0.06, 0.02], GOLDP, "chestStrapBack");
  }
  // side handles
  for (const sx of [1, -1]) {
    box(CHEST, [sx * (HW + 0.012), 0.24, 0], [0.02, 0.1, 0.1], GOLDP, "handlePlate");
    b.part(new THREE.TorusGeometry(0.055, 0.012, 5, 10), GOLDP, {
      bone: root,
      at: CHEST.p([sx * (HW + 0.03), 0.235, 0]),
      quat: CHEST.turn(0, Math.PI / 2, 0),
      name: "handle",
    });
  }
  // lock plate with glowing keyhole and ruby
  b.extrude(
    [
      [-0.085, 0.07],
      [0.085, 0.07],
      [0.085, -0.02],
      [0, -0.1],
      [-0.085, -0.02],
    ],
    {
      at: CHEST.p([0, 0.23, HD + 0.015]),
      x: CHEST.d([1, 0, 0]),
      y: CHEST.d([0, 1, 0]),
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      color: GOLDP,
      bone: root,
      name: "lockPlate",
    },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.06, 0.09), "#ffffff", {
      bone: root,
      at: CHEST.p([0, 0.215, HD + 0.0315]),
      quat: CHEST.q,
      texture: KEYHOLE,
      name: "keyhole",
    }),
    1,
  );
  gemAt(gems, "#ff2d55", CHEST.p([0, 0.318, HD + 0.025]), CHEST.d([0, 0.3, 1]), 0.04, 0.06);

  // Lid, hinged at the back edge; built in its open pose.
  const archOut = (grow: number): OutlinePoint[] => {
    const pts: OutlinePoint[] = [
      [-grow, 0],
      [-grow, 0.05],
    ];
    const hw = D2 + grow;
    const ry = 0.23 + grow;
    for (let k = 1; k < 10; k++) {
      const ang = Math.PI - (k * Math.PI) / 10;
      pts.push([D2 + hw * Math.cos(ang), 0.05 + ry * Math.sin(ang)]);
    }
    pts.push([2 * D2 + grow, 0.05], [2 * D2 + grow, 0]);
    return pts;
  };
  const D2 = HD; // half lid depth (lid spans 0..2*HD)
  const lidArc = (x: number, grow: number, thick: number, pal: ReturnType<typeof paint>, name: string) =>
    b.extrude(archOut(grow), {
      at: LID.p([x, 0, 0]),
      x: LID.d([0, 0, 1]),
      y: LID.d([0, 1, 0]),
      thickness: thick,
      bevel: Math.min(0.01, thick / 3),
      color: pal,
      bone: lid,
      name,
    });
  lidArc(0, 0.012, 2 * HW - 0.02, woodPaint(LID, 0.118, false), "lidShell");
  for (const sx of [1, -1]) {
    lidArc(sx * 0.27, 0.03, 0.105, GOLDP, "lidBand");
    lidArc(sx * (HW + 0.008), 0.034, 0.03, GOLDP, "lidEnd");
    for (let k = 1; k < 10; k++) {
      const ang = Math.PI - (k * Math.PI) / 10;
      const pz = D2 + (D2 + 0.03) * Math.cos(ang);
      const py = 0.05 + (0.23 + 0.03) * Math.sin(ang);
      stud(goldBag, LID.p([sx * 0.27, py, pz]), 0.014);
    }
    // ruby on the end plate
    gemAt(gems, "#ff2d55", LID.p([sx * (HW + 0.02), 0.16, D2]), LID.d([sx, 0, 0]), 0.055, 0.07);
    b.part(new THREE.CylinderGeometry(0.075, 0.08, 0.016, 8), GOLDP, {
      bone: lid,
      at: LID.p([sx * (HW + 0.025), 0.16, D2]),
      quat: LID.turn(0, 0, -sx * (Math.PI / 2)),
      name: "lidEndBezel",
    });
    // hinge barrel
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), GOLDP, {
      bone: lid,
      at: LID.p([sx * 0.27, 0.0, 0]),
      quat: LID.turn(0, 0, Math.PI / 2),
      name: "hinge",
    });
  }
  // hasp tongue hanging over the lock
  b.extrude(
    [
      [-0.055, 0.04],
      [0.055, 0.04],
      [0.055, -0.07],
      [0, -0.13],
      [-0.055, -0.07],
    ],
    {
      at: LID.p([0, 0, 2 * HD + 0.016]),
      x: LID.d([1, 0, 0]),
      y: LID.d([0, 1, 0]),
      thickness: 0.02,
      bevel: 0.005,
      smoothing: 1,
      color: GOLDP,
      bone: lid,
      name: "hasp",
    },
  );
  // ridge studs along the lid crown
  for (let k = -3; k <= 3; k++) stud(goldBag, LID.p([k * 0.12, 0.05 + 0.23 + 0.014, D2]), 0.014);

  // Crown ---------------------------------------------------------------------------------------------------------
  {
    const cx = 0.4;
    const cz = 0.4;
    const CR = Xf.yaw(V(cx, heapY(cx, cz) - 0.012, cz), 0.5, -0.32, 0.16);
    const lattice = paint((_p, n, s) => {
      const l = lvl(n);
      const u = frac(s[1] / 24);
      const v = frac(s[0] / 0.035);
      const d = Math.abs(u - 0.5) + Math.abs(v - 0.5);
      if (Math.abs(d - 0.5) < 0.07) return GOLD[3];
      return GOLD[l];
    });
    b.lathe(
      [
        [0.12, 0],
        [0.14, 0],
        [0.154, 0.05],
        [0.162, 0.115],
        [0.15, 0.123],
        [0.135, 0.112],
        [0.127, 0.05],
      ],
      { at: CR.o, axis: CR.d([0, 1, 0]), segments: 18, color: lattice, bone: root, name: "crownBand" },
    );
    b.lathe(
      [
        [0, 0.02],
        [0.125, 0.02],
        [0.128, 0.09],
        [0.105, 0.17],
        [0.055, 0.225],
        [0, 0.245],
      ],
      { at: CR.o, axis: CR.d([0, 1, 0]), segments: 12, color: VELVETP, bone: root, name: "crownCap" },
    );
    const lean = 0.2;
    for (let i = 0; i < 9; i++) {
      const th = ((20 + i * 40) * Math.PI) / 180;
      const tall = i % 2 === 0;
      const h = tall ? 0.28 : 0.165;
      const out = [Math.sin(th), 0, Math.cos(th)];
      const yd = [out[0] * Math.sin(lean), Math.cos(lean), out[2] * Math.sin(lean)];
      const base = [out[0] * 0.146, 0.085, out[2] * 0.146];
      const outline: OutlinePoint[] = tall
        ? [
            [-0.055, 0],
            [-0.05, 0.05],
            [-0.03, 0.12],
            [-0.014, 0.19],
            [0, h, "sharp"],
            [0.014, 0.19],
            [0.03, 0.12],
            [0.05, 0.05],
            [0.055, 0],
          ]
        : [
            [-0.05, 0],
            [-0.048, 0.05],
            [-0.03, 0.1],
            [0, h, "sharp"],
            [0.03, 0.1],
            [0.048, 0.05],
            [0.05, 0],
          ];
      b.extrude(outline, {
        at: CR.p(base),
        x: CR.d([Math.cos(th), 0, -Math.sin(th)]),
        y: CR.d(yd),
        thickness: 0.03,
        bevel: 0.007,
        color: GOLDP,
        bone: root,
        name: "crownSpike",
      });
      const tip = CR.p([base[0] + yd[0] * (h + 0.012), base[1] + yd[1] * (h + 0.012), base[2] + yd[2] * (h + 0.012)]);
      if (tall) gemAt(gems, i % 4 === 0 ? "#ff2d55" : "#ffa51f", tip, CR.d(yd), 0.03, 0.05);
      else stud(goldBag, tip, 0.024);
      // gem mid-spike
      if (tall)
        gemAt(gems, "#2f7bff", CR.p([base[0] + out[0] * 0.03 + yd[0] * 0.06, base[1] + yd[1] * 0.06, base[2] + out[2] * 0.03 + yd[2] * 0.06]), CR.d(out), 0.02, 0.03);
    }
    // front: big glowing gem in a bezel
    const fp = CR.p([0, 0.058, 0.162]);
    gemAt(glowGems, CYAN, fp, CR.d([0, 0.15, 1]), 0.06, 0.085);
    b.part(new THREE.CylinderGeometry(0.066, 0.074, 0.018, 8), GOLDP, {
      bone: root,
      at: CR.p([0, 0.058, 0.157]),
      quat: CR.turn(Math.PI / 2, 0, 0),
      name: "crownBezel",
    });
    for (const sx of [1, -1]) {
      const a = sx * 0.9;
      const p = CR.p([Math.sin(a) * 0.162, 0.058, Math.cos(a) * 0.162]);
      gemAt(gems, "#b64dff", p, CR.d([Math.sin(a), 0.1, Math.cos(a)]), 0.034, 0.05);
    }
    // pearl bead ring along the band top and base studs
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      stud(goldBag, CR.p([Math.sin(a) * 0.158, 0.125, Math.cos(a) * 0.158]), 0.013);
    }
  }

  // Goblets -------------------------------------------------------------------------------------------------------
  const G_OUT: [number, number][] = [
    [0, 0],
    [0.085, 0],
    [0.088, 0.012],
    [0.07, 0.024],
    [0.04, 0.04],
    [0.024, 0.07],
    [0.022, 0.12],
    [0.04, 0.135],
    [0.046, 0.155],
    [0.04, 0.175],
    [0.024, 0.19],
    [0.022, 0.215],
    [0.06, 0.235],
    [0.105, 0.275],
    [0.125, 0.33],
    [0.128, 0.385],
    [0.12, 0.405],
    [0.108, 0.405],
    [0.11, 0.385],
    [0.106, 0.33],
    [0.085, 0.285],
    [0.04, 0.265],
    [0, 0.262],
  ];
  const gobletPaint = (pal: Pal, sc: number) =>
    paint((_p, n, s) => {
      const l = lvl(n);
      const h = s[0] / sc;
      const deg = s[1];
      if (h < 0.012 && n.y > -0.5) return pal[3];
      if (h > 0.346 && h < 0.354) return pal[3];
      if (h > 0.295 && h < 0.34) {
        const tri = Math.abs(frac(deg / 22.5) - 0.5) * 2;
        if (Math.abs(h - 0.318) < 0.02 * (1 - tri)) return pal[3];
      }
      if (h > 0.372 && h < 0.4 && frac(deg / 30) < 0.14) return pal[3];
      return pal[l];
    });
  const goblet = (xf: Xf, pal: Pal, sc: number, gemCol: string, name: string) => {
    b.lathe(
      G_OUT.map(([x, y]) => [x * sc, y * sc] as OutlinePoint),
      { at: xf.o, axis: xf.d([0, 1, 0]), segments: 12, color: gobletPaint(pal, sc), bone: root, name },
    );
    // jewel band on the bowl, set in bezels
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      const ox = Math.cos(a);
      const oz = Math.sin(a);
      const surf = xf.p([ox * 0.118 * sc, 0.3 * sc, oz * 0.118 * sc]);
      const axis = xf.d([ox, 0.28, oz]).normalize();
      gemAt(gems, gemCol, surf.clone().addScaledVector(axis, -0.006 * sc), axis, 0.024 * sc, 0.034 * sc);
      (pal === SILVER ? silverBag : goldBag).add(
        new THREE.CylinderGeometry(0.029 * sc, 0.033 * sc, 0.012 * sc, 8),
        surf.clone().addScaledVector(axis, -0.002 * sc),
        new THREE.Quaternion().setFromUnitVectors(UP, axis),
      );
    }
    // knop beads
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      (pal === SILVER ? silverBag : goldBag).add(
        new THREE.SphereGeometry(0.014 * sc, 6, 4),
        xf.p([Math.cos(a) * 0.047 * sc, 0.155 * sc, Math.sin(a) * 0.047 * sc]),
      );
    }
  };

  // A: gold goblet brimming with cyan potion, front left.
  {
    const x = -0.62;
    const z = 0.4;
    let y = -1;
    for (let i = 0; i < 8; i++) y = Math.max(y, heapY(x + Math.cos(i) * 0.09, z + Math.sin(i) * 0.09));
    const GA = Xf.yaw(V(x, y - 0.015, z), 0.4, 0.1, -0.06);
    goblet(GA, GOLD, 1, "#ff2d55", "gobletA");
    glow(
      b.part(new THREE.CircleGeometry(0.104, 12).rotateX(-Math.PI / 2), CYAN, {
        bone: root,
        at: GA.p([0, 0.368, 0]),
        quat: GA.q,
        name: "potion",
      }),
      1,
    );
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7;
      gemAt(glowGems, CYAN, GA.p([Math.cos(a) * 0.05, 0.4 + k * 0.05, Math.sin(a) * 0.05]), V(R() - 0.5, 1, R() - 0.5), 0.012, 0.016);
    }
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      coin(V(x + Math.cos(a) * 0.115, y + 0.006, z + Math.sin(a) * 0.115), jitterNormal(UP, 0.5), pickBucket(), 0.044, k % 2 === 0);
    }
  }
  // B: tall silver chalice heaped with coins, right.
  {
    const x = 0.72;
    const z = -0.02;
    let y = -1;
    for (let i = 0; i < 8; i++) y = Math.max(y, heapY(x + Math.cos(i) * 0.1, z + Math.sin(i) * 0.1));
    const GB = Xf.yaw(V(x, y - 0.02, z), -0.3, -0.08, 0.05);
    goblet(GB, SILVER, 1.18, "#2f7bff", "gobletB");
    b.lathe(
      [
        [0, 0.28],
        [0.12, 0.28],
        [0.13, 0.34],
        [0.09, 0.42],
        [0.04, 0.455],
        [0, 0.465],
      ],
      { at: GB.o, axis: GB.d([0, 1, 0]), segments: 9, color: heapMat, bone: root, name: "chaliceCoins" },
    );
    for (let k = 0; k < 11; k++) {
      const a = k * 2.4;
      const rr = 0.02 + (k % 4) * 0.025;
      const n = V(Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5).normalize();
      coin(GB.p([Math.cos(a) * rr, 0.46 + (k % 3) * 0.012 - rr * 0.35, Math.sin(a) * rr]), n, pickBucket(), 0.05, true);
    }
    gemAt(gems, "#20e08a", GB.p([0.03, 0.52, 0.02]), V(0.2, 1, 0.1), 0.04, 0.06);
    gemAt(gems, "#ff2d55", GB.p([-0.05, 0.5, -0.04]), V(-0.3, 1, -0.2), 0.034, 0.05);
  }
  // C: gold goblet knocked over, spilling coins and emerald gems.
  {
    const foot = V(TIP_FOOT.x, 0, TIP_FOOT.z);
    const fy = Math.max(heapY(foot.x, foot.z), heapY(foot.x + TIP_DIR.x * 0.35, foot.z + TIP_DIR.z * 0.35)) + 0.12;
    foot.y = fy;
    const axisDir = V(TIP_DIR.x, 0.12, TIP_DIR.z).normalize();
    const GC = new Xf(foot, new THREE.Quaternion().setFromUnitVectors(UP, axisDir));
    goblet(GC, GOLD_C, 1, "#20e08a", "gobletC");
    const mouth = GC.p([0, 0.405, 0]);
    for (let k = 0; k < 26; k++) {
      const t = 0.03 + (k / 26) * 0.55;
      const sp = (R() - 0.5) * (0.04 + t * 0.35);
      const px = mouth.x + TIP_DIR.x * t - TIP_DIR.z * sp;
      const pz = mouth.z + TIP_DIR.z * t + TIP_DIR.x * sp;
      const h = heapY(px, pz);
      const onBowl = t < 0.07;
      coin(
        V(px, Math.max(h + 0.012, onBowl ? mouth.y - 0.06 : 0), pz),
        onBowl ? jitterNormal(axisDir, 0.6) : jitterNormal(heapNormal(px, pz), 0.8),
        pickBucket(),
        0.048 + R() * 0.01,
        true,
      );
    }
    gemAt(gems, "#20e08a", V(mouth.x + TIP_DIR.x * 0.2, heapY(mouth.x + TIP_DIR.x * 0.2, mouth.z + TIP_DIR.z * 0.2) + 0.02, mouth.z + TIP_DIR.z * 0.2), V(0.3, 1, 0.2), 0.04, 0.06);
  }

  // Ingots ---------------------------------------------------------------------------------------------------------
  {
    const ingotPaint = paint((_p, n, s) => {
      const l = lvl(n);
      if (n.y > 0.7) {
        const e = Math.max(Math.abs(s[0]) / 0.105, Math.abs(s[1]) / 0.043);
        if (e > 0.82) return GOLD[0];
        if (Math.abs(s[0]) < 0.055 && Math.abs(s[1]) < 0.022 && Math.abs(s[0]) > 0.04) return GOLD[3];
        if (Math.abs(s[0]) < 0.04 && Math.abs(s[1]) < 0.022 && Math.abs(s[1]) > 0.014) return GOLD[3];
        return GOLD[1];
      }
      return GOLD[l];
    });
    const IG = Xf.yaw(V(-1.0, DAIS, -0.75), 0.45);
    const rows: [number, number, number][] = [
      [-0.12, 0, 0],
      [0, 0, 0],
      [0.12, 0, 0],
      [-0.06, 0, 1],
      [0.06, 0, 1],
      [0, 0, 2],
    ];
    for (const [ox, , row] of rows) {
      const oy = 0.036 + row * 0.07;
      const oz = row === 2 ? 0 : 0;
      const ig = IG.child([ox * 1.7 - (row === 1 ? 0 : 0), oy, oz + (row === 1 ? 0.0 : 0)], 0, ox * 0.15, 0);
      b.extrude(
        [
          [-0.115, -0.048],
          [0.115, -0.048],
          [0.095, 0.048],
          [-0.095, 0.048],
        ],
        {
          at: ig.o,
          x: ig.d([1, 0, 0]),
          y: ig.d([0, 0, -1]),
          thickness: 0.07,
          bevel: 0.016,
          color: ingotPaint,
          bone: root,
          name: "ingot",
        },
      );
    }
  }

  // Sack ------------------------------------------------------------------------------------------------------------
  {
    const SK = Xf.yaw(V(0.95, DAIS - 0.005, -0.7), -0.5, -0.22, 0);
    const sack = b.lathe(
      [
        [0, 0],
        [0.11, 0],
        [0.18, 0.045],
        [0.215, 0.13],
        [0.2, 0.23],
        [0.15, 0.31],
        [0.08, 0.355],
        [0.065, 0.375],
        [0.1, 0.41],
        [0.15, 0.455],
        [0.125, 0.46],
        [0.075, 0.43],
        [0, 0.415],
      ],
      { at: SK.o, axis: SK.d([0, 1, 0]), segments: 9, color: tone(LEATHER), bone: root, name: "sack" },
    );
    b.decal(sack, SIGIL, { at: SK.p([0, 0.17, 0.21]), dir: SK.d([0, 0, 1]), size: [0.17, 0.17] });
    b.part(new THREE.TorusGeometry(0.074, 0.014, 5, 10), GOLDP, {
      bone: root,
      at: SK.p([0, 0.366, 0]),
      quat: SK.turn(Math.PI / 2, 0, 0),
      name: "sackTie",
    });
    stud(goldBag, SK.p([0.07, 0.355, 0.04]), 0.022);
    // coins and gems spilling from the mouth
    for (let k = 0; k < 16; k++) {
      const t = 0.16 + k * 0.035 + R() * 0.03;
      const lat = (R() - 0.5) * (0.12 + t * 0.7);
      const dx = Math.sin(-0.5) * 0;
      void dx;
      const f = SK.d([0, 0, 1]);
      const side = SK.d([1, 0, 0]);
      const px = SK.o.x + f.x * (0.1 + t) + side.x * lat;
      const pz = SK.o.z + f.z * (0.1 + t) + side.z * lat;
      coin(V(px, DAIS + 0.008 + (k % 5 === 0 ? 0.014 : 0), pz), jitterNormal(UP, 0.3), pickBucket(), 0.048, true);
    }
    gemAt(gems, "#ffa51f", V(SK.o.x + SK.d([0, 0, 1]).x * 0.35, DAIS + 0.015, SK.o.z + SK.d([0, 0, 1]).z * 0.35), V(0.2, 1, 0.3), 0.04, 0.06);
  }

  // Crystal clusters ---------------------------------------------------------------------------------------------
  const cluster = (x: number, z: number, color: string, sc: number, seed: number) => {
    const r2 = rng(seed);
    const base = V(x, DAIS - 0.01, z);
    const out = Math.atan2(x, z);
    const count = 7;
    for (let i = 0; i < count; i++) {
      const a = i === 0 ? 0 : ((i - 1) / (count - 1)) * Math.PI * 2 + r2() * 0.6;
      const tilt = i === 0 ? 0.08 : 0.3 + r2() * 0.35;
      const rr = i === 0 ? 0 : 0.06 + r2() * 0.05;
      const r = (i === 0 ? 0.085 : 0.045 + r2() * 0.03) * sc;
      const h = (i === 0 ? 0.42 : 0.12 + r2() * 0.2) * sc;
      const q = qe(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
      let bag = crystals.get(color);
      if (!bag) crystals.set(color, (bag = new Bag()));
      bag.add(prism(r, h), V(base.x + Math.cos(a) * rr * sc, base.y, base.z + Math.sin(a) * rr * sc), q);
    }
    // faceted rock base
    b.lathe(
      [
        [0, 0],
        [0.3 * sc, 0],
        [0.27 * sc, 0.06],
        [0.19 * sc, 0.11],
        [0.07 * sc, 0.14],
        [0, 0.14],
      ],
      { at: [x, DAIS - 0.012, z], segments: 7, spin: (out * 180) / Math.PI, color: tone(STONE), bone: root, name: "rock" },
    );
  };
  cluster(-1.2, 0.05, CYAN, 1.05, 11);
  cluster(1.2, 0.12, CYAN, 0.85, 12);
  cluster(0.2, -1.2, VIOLET, 0.9, 13);
  cluster(-0.55, 1.15, MAGENTA, 0.75, 14);

  // Loose cut jewels sunk into the heap -------------------------------------------------------------------------
  const jewelColors = ["#ff2d55", "#2f7bff", "#20e08a", "#b64dff", "#ffa51f", "#3be8ff"];
  let gcount = 0;
  for (let attempt = 0; attempt < 400 && gcount < 24; attempt++) {
    const a = R() * Math.PI * 2;
    const r = 1.15 * Math.sqrt(R());
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (heap(x, z) < 0.08 || blocked(x, z)) continue;
    const size = 0.034 + R() * 0.03;
    const n = jitterNormal(heapNormal(x, z), 1.3);
    gemAt(gems, jewelColors[gcount % jewelColors.length], V(x, heapY(x, z) + 0.004, z), n, size, size * 1.5, R() * 6);
    gcount++;
  }
  // a few glowing ones on top
  for (let k = 0; k < 5; k++) {
    const a = k * 1.3 + 0.4;
    const r = 0.5 + R() * 0.4;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (blocked(x, z) || heap(x, z) < 0.1) continue;
    gemAt(glowGems, k % 2 ? CYAN : MAGENTA, V(x, heapY(x, z) + 0.01, z), jitterNormal(heapNormal(x, z), 1), 0.04, 0.06, R() * 6);
  }

  // Rings and a pearl necklace draped over the chest front -------------------------------------------------------
  {
    const pts: THREE.Vector3[] = [];
    const lp = [
      [-0.34, 0.12],
      [-0.24, 0.2],
      [-0.12, 0.24],
      [0.0, 0.22],
      [0.1, 0.17],
      [0.2, 0.1],
    ];
    for (const [px, pz] of lp) pts.push(V(px, heapY(px, pz) + 0.035, pz));
    const path = catmull(pts);
    b.sweep(path, 0.005, { color: GOLDP, bone: root, sides: 4 } as never);
    const pearls = new Bag();
    for (let i = 0; i < 26; i++) pearls.add(new THREE.SphereGeometry(0.018, 6, 4), path.at(i / 25));
    b.part(pearls.merged()!, "#ffeef4", { bone: root, at: [0, 0, 0], name: "pearls" });
    const mid = path.at(0.5);
    gemAt(gems, "#2f7bff", V(mid.x, mid.y - 0.01, mid.z), V(0, 1, 0.5), 0.045, 0.1);
  }
  for (const [rx, rz, col] of [
    [0.3, 0.62, "#ff2d55"],
    [-0.22, 0.78, "#3be8ff"],
  ] as const) {
    const y = heapY(rx, rz);
    b.part(new THREE.TorusGeometry(0.032, 0.008, 5, 10), GOLDP, {
      bone: root,
      at: [rx, y + 0.035, rz],
      rotation: [60, 20, 0],
      name: "ring",
    });
    gemAt(gems, col, V(rx, y + 0.065, rz + 0.01), V(0, 1, 0.4), 0.018, 0.026);
  }

  // Sparkles ---------------------------------------------------------------------------------------------------------
  glow(
    b.cards(
      [
        [0.42, 0.78, 0.42],
        [-0.62, 0.62, 0.4],
        [-1.2, 0.8, 0.05],
        [1.2, 0.62, 0.12],
        [0.2, 0.8, -1.2],
        [-0.15, 1.12, -0.85],
        [0.72, 0.72, -0.02],
        [-0.55, 0.78, 1.15],
      ].map((p) => frame(p, [0, 1, 0])),
      SPARKLE,
      { size: [0.16, 0.16], lean: 0, flow: [0, 0, 1], cross: true, bone: root, rng: R, vary: 0.35 },
    ),
    1,
  );

  // Flush the merged bags -----------------------------------------------------------------------------------------
  const out = (bag: Bag, color: Parameters<typeof b.part>[1], name: string, extra: object = {}) => {
    const g = bag.merged();
    if (g) b.part(g, color, { bone: root, at: [0, 0, 0], name, ...extra });
  };
  out(goldBag, GOLDP, "goldFittings");
  out(silverBag, SILVERP, "silverFittings");
  for (const [bucket, color] of [
    [cA, COIN_A],
    [cB, COIN_B],
    [cC, COIN_C],
    [cD, COIN_D],
    [cS, COIN_S],
  ] as const) {
    out(bucket.body, color, `coins_${color}`, { flat: true });
    const g = bucket.face.merged();
    if (g) {
      const tex = faceOf.get(bucket) === 0 ? FACE_A : faceOf.get(bucket) === 1 ? FACE_B : FACE_S;
      b.part(g, "#ffffff", { bone: root, at: [0, 0, 0], texture: tex, name: `coinFaces_${color}` });
    }
  }
  for (const [color, bag] of gems) out(bag, gemPaint(color), `gem_${color}`, { flat: true });
  for (const [color, bag] of glowGems) {
    const g = bag.merged();
    if (g) glow(b.part(g, color, { bone: root, at: [0, 0, 0], flat: true, name: `glowGem_${color}` }), 0.7);
  }
  for (const [color, bag] of crystals) {
    const g = bag.merged();
    if (g) glow(b.part(g, color, { bone: root, at: [0, 0, 0], flat: true, name: `crystal_${color}` }), 0.65);
  }

  return b.root;
}
