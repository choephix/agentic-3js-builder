import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A glittering treasure hoard on a rune-lit dais: an open banded chest with velvet lid and floating hextech gem, mounds of stamped coins, cut gems, a spiked jewelled crown, three goblets, ingots, a spilled sack, a pearl necklace and glowing crystal clusters.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#ffc42e";
const GOLD_LT = "#ffe27a";
const GOLD_HI = "#fff2b0";
const GOLD_DK = "#e0952a";
const GOLD_SH = "#9a5a12";
const SILVER = "#dfe8f5";
const SILVER_DK = "#8ea3c0";
const WOOD_A = "#8a4030";
const WOOD_B = "#5e2a28";
const WOOD_SEAM = "#2a1018";
const WOOD_HI = "#b8603e";
const VELVET = "#b4173f";
const VELVET_DK = "#7d0f33";
const STONE_A = "#3a4570";
const STONE_B = "#2e3760";
const STONE_HI = "#5a6aa0";
const STONE_LINE = "#171c33";
const CHANNEL = "#0f1530";
const NAVY = "#1b2a52";
const CYAN = "#34e8ff";
const RUBY = "#ff2650";
const SAPPH = "#2d6bff";
const EMER = "#20e58a";
const AMETH = "#b45cff";
const TOPAZ = "#ffb21a";
const PINK = "#ff5fb0";
const PEARL = "#f4f1ff";
const BURLAP = "#c29a5c";
const BURLAP_DK = "#8f6a38";
const ROPE = "#e6cf9a";
const ROCK_A = "#2b3350";
const ROCK_B = "#3d4770";

type V = [number, number, number];
type Fill = string | Paint;

// ---------------------------------------------------------------------------------------------------------------
// Frames of reference: every object is modelled in its own space and placed through one of these
class Loc {
  readonly q: THREE.Quaternion;
  constructor(
    readonly pos: THREE.Vector3,
    rot: V = [0, 0, 0],
  ) {
    this.q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ"));
  }
  p(v: V) {
    return new THREE.Vector3(...v).applyQuaternion(this.q).add(this.pos);
  }
  d(v: V) {
    return new THREE.Vector3(...v).applyQuaternion(this.q);
  }
  toLocal(p: THREE.Vector3) {
    return p.clone().sub(this.pos).applyQuaternion(this.q.clone().invert());
  }
  m(v: V, rot: V = [0, 0, 0], s: number | V = 1) {
    const q = this.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)));
    const sc = typeof s === "number" ? new THREE.Vector3(s, s, s) : new THREE.Vector3(...s);
    return new THREE.Matrix4().compose(this.p(v), q, sc);
  }
}
const at = (x: number, y: number, z: number, rot: V = [0, 0, 0]) => new Loc(new THREE.Vector3(x, y, z), rot);

// ---------------------------------------------------------------------------------------------------------------
// Scene layout
const F = 0.08; // dais top
const HR = 1.1; // hoard heap radius
const W = 1.0; // chest width / depth / body height
const D = 0.62;
const FEET = 0.06;
const BODY = 0.4;
const TOP = FEET + BODY; // body top, chest-local
const LIP = 0.045;
const Lc = at(0.0, F, -0.4, [-6, 0, 0]);

const bumps: Array<[number, number, number, number]> = [
  [0.0, 0.3, 0.26, 0.3],
  [0.62, 0.22, 0.3, 0.3],
  [-0.55, 0.05, 0.28, 0.3],
  [0.78, -0.35, 0.3, 0.25],
  [-0.78, -0.35, 0.3, 0.25],
  [-0.35, 0.62, 0.12, 0.25],
  [0.35, 0.7, 0.1, 0.25],
  [0.0, 0.88, 0.05, 0.2],
  [-0.72, -0.2, 0.12, 0.2],
];
function H(x: number, z: number) {
  const r = Math.hypot(x, z);
  let h = 0;
  for (const [bx, bz, bh, bs] of bumps) h += bh * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / (2 * bs * bs));
  h += 0.012 * (Math.sin(x * 17 + z * 5) + Math.sin(z * 13 - x * 7));
  const f = 1 - smoothstep(HR - 0.35, HR, r);
  return Math.max(0, h * f);
}
const surfY = (x: number, z: number) => F + 0.004 + H(x, z);
function surfN(x: number, z: number) {
  const e = 0.02;
  const dx = (H(x + e, z) - H(x - e, z)) / (2 * e);
  const dz = (H(x, z + e) - H(x, z - e)) / (2 * e);
  return new THREE.Vector3(-dx, 1, -dz).normalize();
}

// ---------------------------------------------------------------------------------------------------------------
// Textures
const COIN_TEX = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#9a5a10" stroke-width="3.4"/>
  <circle cx="32" cy="32" r="23.5" fill="none" stroke="#fff3b0" stroke-width="1.8"/>
  <path d="M32 13 L45 32 L32 51 L19 32Z" fill="#b8700f" stroke="#9a5a10" stroke-width="1.5"/>
  <path d="M32 13 L45 32 L32 32Z" fill="#fff0a0"/><path d="M32 51 L19 32 L32 32Z" fill="#fff0a0" opacity="0.8"/>
  <circle cx="32" cy="32" r="3.2" fill="#fff8d0"/>
  <g stroke="#9a5a10" stroke-width="2.4" stroke-linecap="round"><path d="M32 4.5V8.5M32 55.5V59.5M4.5 32H8.5M55.5 32H59.5"/></g></svg>`,
  { size: 128 },
);

function crystalTex(dark: string, mid: string, light: string) {
  const shade = [0, 0.3, 0.5, 0.12, 0.38, 0.05];
  const hi = [0.0, 0.0, 0.0, 0.28, 0.0, 0.4];
  let cols = "";
  for (let i = 0; i < 6; i++) {
    cols += `<rect x="${i * 16}" y="0" width="16" height="128" fill="#000" opacity="${shade[i]}"/>`;
    if (hi[i] > 0) cols += `<rect x="${i * 16}" y="0" width="16" height="128" fill="#fff" opacity="${hi[i]}"/>`;
    cols += `<rect x="${i * 16 + 6}" y="30" width="3.2" height="62" fill="#fff" opacity="0.38"/>`;
  }
  return svg(
    `<svg viewBox="0 0 96 128"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="${dark}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${light}"/></linearGradient></defs>
    <rect width="96" height="128" fill="url(#g)"/>${cols}</svg>`,
    { size: 256 },
  );
}
const CRYSTAL_CYAN = crystalTex("#0a5a86", "#1fc4e8", "#c8fbff");
const CRYSTAL_VIOLET = crystalTex("#3a0f78", "#b13cf0", "#ffc4ff");

const runeGlyphs = [
  "M-9 12 L0 -14 L9 12 M-6 3 H6",
  "M-8 -13 V13 M-8 -13 L8 0 L-8 13",
  "M0 -14 V14 M-9 -5 L0 -14 L9 -5 M-9 6 L0 -1 L9 6",
  "M-9 -13 L9 -13 L-9 13 L9 13",
  "M-8 -13 L8 -13 M0 -13 V14 M-8 14 L0 5 L8 14",
  "M-9 0 L0 -14 L9 0 L0 14Z M0 -6 V6",
];
let runes = "";
for (let i = 0; i < 24; i++)
  runes += `<g transform="translate(400 400) rotate(${i * 15}) translate(0 -357)"><path d="${runeGlyphs[i % 6]}" fill="none" stroke="#7df3ff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
let ticks = "";
for (let i = 0; i < 72; i++)
  ticks += `<path d="M400 ${400 - (i % 3 === 0 ? 393 : 389)} V${400 - 383}" transform="rotate(${i * 5} 400 400)" stroke="#34e8ff" stroke-width="3" opacity="0.9"/>`;
const RUNE_TEX = svg(
  `<svg viewBox="0 0 800 800" fill="none"><circle cx="400" cy="400" r="385" stroke="#34e8ff" stroke-width="5"/>
  <circle cx="400" cy="400" r="330" stroke="#34e8ff" stroke-width="5"/>
  <circle cx="400" cy="400" r="378" stroke="#bafaff" stroke-width="2.4" opacity="0.8"/>
  <circle cx="400" cy="400" r="337" stroke="#bafaff" stroke-width="2.4" opacity="0.8"/>${ticks}${runes}
  <g stroke="#34e8ff" stroke-width="4"><path d="M400 15 L412 36 H388Z M400 785 L412 764 H388Z M15 400 L36 412 V388Z M785 400 L764 412 V388Z" fill="#7df3ff"/></g></svg>`,
  { size: 2048 },
);

const ORNAMENT_TEX = svg(
  `<svg viewBox="0 0 60 80"><rect x="2" y="2" width="56" height="76" rx="9" fill="#3b1420" stroke="#ffd34a" stroke-width="2.6"/>
  <rect x="6.5" y="6.5" width="47" height="67" rx="6" fill="none" stroke="#c9821a" stroke-width="1.4"/>
  <g fill="none" stroke="#ffd34a" stroke-width="2.6" stroke-linecap="round">
  <path d="M30 70 C10 62 10 46 30 42 C50 38 50 22 30 11"/><path d="M30 70 C50 62 50 46 30 42 C10 38 10 22 30 11"/></g>
  <g fill="#ffb02e" stroke="#ffd34a" stroke-width="1.2"><ellipse cx="18" cy="30" rx="4.5" ry="2.6" transform="rotate(-50 18 30)"/>
  <ellipse cx="42" cy="30" rx="4.5" ry="2.6" transform="rotate(50 42 30)"/><ellipse cx="17" cy="58" rx="4.5" ry="2.6" transform="rotate(40 17 58)"/>
  <ellipse cx="43" cy="58" rx="4.5" ry="2.6" transform="rotate(-40 43 58)"/></g>
  <circle cx="30" cy="42" r="5.2" fill="#ff2650" stroke="#ffd34a" stroke-width="2"/><circle cx="28.6" cy="40.4" r="1.6" fill="#ffd0da"/>
  <path d="M30 6.5 L34 11 L30 15.5 L26 11Z" fill="#34e8ff" stroke="#ffd34a" stroke-width="1.4"/>
  <circle cx="30" cy="73" r="2.2" fill="#ffd34a"/></svg>`,
  { size: 256 },
);

function latticeSvg() {
  let lines = "";
  for (let k = -160; k <= 260; k += 17) {
    lines += `<path d="M${k} 0 L${k + 100} 100"/><path d="M${k + 100} 0 L${k} 100"/>`;
  }
  let btn = "";
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 8; j++) {
      const x = 8.5 + i * 17;
      const y = 8.5 + j * 17;
      if (x < 160 && y < 96) btn += `<circle cx="${x}" cy="${y}" r="1.7"/>`;
    }
  return `<svg viewBox="0 0 164 100"><defs><clipPath id="c"><rect x="7" y="7" width="150" height="86" rx="6"/></clipPath></defs>
  <g clip-path="url(#c)" fill="none" stroke="#e8a528" stroke-width="1.3" opacity="0.85">${lines}</g>
  <g clip-path="url(#c)" fill="#ffe27a" stroke="#9a5a12" stroke-width="0.5">${btn}</g>
  <rect x="3" y="3" width="158" height="94" rx="9" fill="none" stroke="#ffd34a" stroke-width="3"/>
  <rect x="7" y="7" width="150" height="86" rx="6" fill="none" stroke="#c9821a" stroke-width="1.6"/>
  <g transform="translate(82 50)"><path d="M0 -34 L12 -12 L34 0 L12 12 L0 34 L-12 12 L-34 0 L-12 -12Z" fill="#7d0f33" stroke="#ffd34a" stroke-width="2.6"/>
  <path d="M0 -24 L8 -8 L24 0 L8 8 L0 24 L-8 8 L-24 0 L-8 -8Z" fill="none" stroke="#e8a528" stroke-width="1.5"/>
  <circle r="10" fill="#ffd34a"/><circle r="7" fill="#34e8ff" stroke="#9a5a12" stroke-width="1.2"/><circle cx="-2" cy="-2.4" r="2.2" fill="#e6ffff"/></g></svg>`;
}
const LATTICE_TEX = svg(latticeSvg(), { size: 1024 });

const STAMP_TEX = svg(
  `<svg viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="6" fill="#c9821a" stroke="#9a5a12" stroke-width="3"/>
  <path d="M32 12 L40 28 L56 32 L40 36 L32 52 L24 36 L8 32 L24 28Z" fill="#ffe27a" stroke="#9a5a12" stroke-width="2"/>
  <circle cx="32" cy="32" r="5" fill="#9a5a12"/></svg>`,
  { size: 96 },
);

const PATCH_TEX = svg(
  `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="4" fill="#d9b673" stroke="#8f6a38" stroke-width="3"/>
  <rect x="8" y="8" width="48" height="48" fill="none" stroke="#6b4a22" stroke-width="2.4" stroke-dasharray="5 4"/>
  <circle cx="32" cy="32" r="14" fill="#ffc42e" stroke="#9a5a12" stroke-width="3"/>
  <path d="M32 21 L38 32 L32 43 L26 32Z" fill="#c9821a"/><path d="M32 21 L38 32 L32 32Z" fill="#fff0a0"/></svg>`,
  { size: 128 },
);

const STAR_TEX = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 2 L36.5 27.5 L62 32 L36.5 36.5 L32 62 L27.5 36.5 L2 32 L27.5 27.5Z" fill="#34e8ff"/>
  <path d="M32 11 L35 29 L53 32 L35 35 L32 53 L29 35 L11 32 L29 29Z" fill="#bafaff"/><circle cx="32" cy="32" r="4.5" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const SPARK_TEX = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 2 L36.5 27.5 L62 32 L36.5 36.5 L32 62 L27.5 36.5 L2 32 L27.5 27.5Z" fill="#ffd34a"/>
  <path d="M32 11 L35 29 L53 32 L35 35 L32 53 L29 35 L11 32 L29 29Z" fill="#fff2b0"/><circle cx="32" cy="32" r="4.5" fill="#ffffff"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const goldPaint = (seed: number, dark = false) =>
  paint((p, n) => {
    const u = n.y * 0.5 + 0.5;
    const nz = noise(p, 0.06, seed);
    const lo = dark ? GOLD_SH : GOLD_DK;
    const mid = dark ? GOLD_DK : GOLD;
    const base = mix(lo, mid, smoothstep(0.15, 0.8, u * 0.8 + nz * 0.45));
    return mix(base, dark ? GOLD_LT : GOLD_HI, smoothstep(0.75, 1, u) * 0.5);
  });
const GOLD_P = goldPaint(1);
const GOLD_DP = goldPaint(2, true);

const heapPaint = paint((p, n) => {
  const c = cells(p, 0.052, 3);
  const edge = c.d2 - c.d1;
  const base = c.id < 0.4 ? GOLD : c.id < 0.68 ? GOLD_LT : c.id < 0.9 ? GOLD_DK : SILVER;
  if (edge < 0.07) return GOLD_SH;
  const lit = mix(base, GOLD_HI, smoothstep(0.55, 1, n.y) * 0.35 * smoothstep(0.1, 0.5, c.d1));
  return mix(lit, GOLD_SH, smoothstep(0.55, 0.9, c.d1) * 0.15);
});

const woodPaint = paint((p, n) => {
  const q = Lc.toLocal(p);
  const k = (q.x + W / 2 + 0.026) / 0.125;
  const f = k - Math.floor(k);
  if (f < 0.04 || f > 0.96) return WOOD_SEAM;
  const id = Math.floor(k);
  const g = noise(new THREE.Vector3(q.x * 2 + id * 3.1, q.y * 0.14, q.z * 0.14), 0.03, 5);
  const base = mix(WOOD_B, WOOD_A, g);
  return mix(base, WOOD_HI, smoothstep(0.6, 1, n.y) * 0.4);
});
const lidPaint = paint((p, n) => {
  if (n.y < -0.9) return VELVET;
  return woodPaint.at(p, n);
});

const daisPaint = paint((p, n) => {
  const r = Math.hypot(p.x, p.z);
  const a = Math.atan2(p.z, p.x);
  if (n.y < 0.4) return mix(STONE_LINE, STONE_B, noise(p, 0.12, 2));
  if (Math.abs(r - 1.395) < 0.014 || Math.abs(r - 1.105) < 0.009) return GOLD_DK;
  if (r > 1.395) {
    const f = (((a / (Math.PI / 12)) % 1) + 1) % 1;
    if (f < 0.03 || f > 0.97) return STONE_LINE;
    return mix(STONE_A, STONE_HI, smoothstep(0.7, 1, n.y) * 0.5 + noise(p, 0.1, 6) * 0.3);
  }
  if (r > 1.105) return mix(CHANNEL, STONE_LINE, noise(p, 0.15, 3));
  const c = cells(p, 0.34, 4);
  if (c.d2 - c.d1 < 0.055) return STONE_LINE;
  return mix(mix(STONE_A, STONE_B, c.id), STONE_HI, noise(p, 0.07, 8) * 0.25);
});

const burlapPaint = paint((p) => {
  const cx = Math.floor((p.x + p.z * 0.7) / 0.011);
  const cy = Math.floor(p.y / 0.011);
  const check = (cx + cy) % 2 === 0 ? 0 : 0.5;
  return mix(BURLAP, BURLAP_DK, Math.min(1, check + noise(p, 0.09, 9) * 0.55));
});

// ---------------------------------------------------------------------------------------------------------------
// Builder, merge buckets
const b = createBuilder({ name: "treasureHoard", paintSize: 2048 });
const base = b.joint("base", { at: [0, 0, 0] });
type Bone = typeof base;
const R = rng(2024);

const texIds = new Map<object, number>();
type Bucket = { color: string; bone: Bone; geos: THREE.BufferGeometry[]; glowS: number; tex?: ReturnType<typeof svg>; name: string };
const buckets = new Map<string, Bucket>();
function put(
  name: string,
  color: string,
  geo: THREE.BufferGeometry,
  m: THREE.Matrix4,
  opt: { bone?: Bone; glowS?: number; tex?: ReturnType<typeof svg> } = {},
) {
  const bone = opt.bone ?? base;
  const glowS = opt.glowS ?? 0;
  let tid = "";
  if (opt.tex) {
    if (!texIds.has(opt.tex)) texIds.set(opt.tex, texIds.size);
    tid = String(texIds.get(opt.tex));
  }
  const key = `${name}|${color}|${bone.name}|${glowS}|${tid}`;
  let bk = buckets.get(key);
  if (!bk) {
    bk = { color, bone, geos: [], glowS, tex: opt.tex, name };
    buckets.set(key, bk);
  }
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.applyMatrix4(m);
  bk.geos.push(g);
}
function flush() {
  for (const bk of buckets.values()) {
    const merged = mergeGeometries(bk.geos);
    if (!merged) throw new Error(`merge failed for ${bk.name}`);
    const part = b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0], flat: true, name: bk.name, texture: bk.tex });
    if (bk.glowS > 0) glow(part, bk.glowS);
  }
}
const I4 = new THREE.Matrix4();
const mat = (pos: THREE.Vector3, q: THREE.Quaternion = new THREE.Quaternion(), s = 1) =>
  new THREE.Matrix4().compose(pos, q, new THREE.Vector3(s, s, s));
const eul = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * DEG, y * DEG, z * DEG));

// ---------------------------------------------------------------------------------------------------------------
// Gem shapes (Y up, origin at the girdle) and where they glow
const GEM_GLOW = 0.42;
type GemKind = "brilliant" | "octa" | "emerald" | "pear";
function gemGeo(kind: GemKind, r: number): THREE.BufferGeometry {
  if (kind === "octa") return new THREE.OctahedronGeometry(r, 0).scale(0.9, 1.35, 0.9);
  if (kind === "emerald") {
    const top = new THREE.CylinderGeometry(r * 0.62, r, r * 0.4, 8, 1).translate(0, r * 0.2, 0);
    const bot = new THREE.CylinderGeometry(r, r * 0.35, r * 0.75, 8, 1).translate(0, -r * 0.375, 0);
    return mergeGeometries([top, bot])!.scale(1.25, 1, 0.85);
  }
  if (kind === "pear") {
    const top = new THREE.ConeGeometry(r * 0.8, r * 0.9, 8).translate(0, r * 0.45, 0);
    const bot = new THREE.OctahedronGeometry(r, 0).scale(0.8, 0.8, 0.8).translate(0, -r * 0.3, 0);
    return mergeGeometries([top.toNonIndexed(), bot])!;
  }
  const crown = new THREE.CylinderGeometry(r * 0.55, r, r * 0.32, 8, 1).translate(0, r * 0.16, 0);
  const pav = new THREE.ConeGeometry(r, r * 0.78, 8).rotateX(Math.PI).translate(0, -r * 0.39, 0);
  return mergeGeometries([crown, pav])!;
}
const GEM_COLORS = [RUBY, SAPPH, EMER, AMETH, TOPAZ, CYAN, PINK];
const gem = (kind: GemKind, r: number, color: string, m: THREE.Matrix4, bone?: Bone) =>
  put(`gem.${color}`, color, gemGeo(kind, r), m, { glowS: GEM_GLOW, bone });

// ---------------------------------------------------------------------------------------------------------------
// Coins
const COIN_R = 0.036;
const coinGeo = new THREE.CylinderGeometry(COIN_R, COIN_R, 0.008, 8);
const coinDecal = new THREE.CircleGeometry(COIN_R * 0.97, 8).rotateX(-Math.PI / 2).translate(0, 0.0046, 0);
const pickCoin = () => {
  const r = R();
  return r < 0.4 ? GOLD : r < 0.68 ? GOLD_LT : r < 0.9 ? GOLD_DK : SILVER;
};
function coin(pos: THREE.Vector3, q: THREE.Quaternion, s = 1, color = pickCoin()) {
  const m = mat(pos, q, s);
  put(`coins.${color}`, color, coinGeo, m);
  put("coins.stamp", "#ffffff", coinDecal, m, { tex: COIN_TEX });
}
function coinOn(normal: THREE.Vector3, pos: THREE.Vector3, tilt = 26, s = 1, color?: string) {
  const q = aim(normal).multiply(eul((R() - 0.5) * 2 * tilt, R() * 360, (R() - 0.5) * 2 * tilt));
  coin(pos, q, s, color);
}

// keep-out zones so loose coins and gems do not sit inside other objects
const keep: Array<[number, number, number]> = [
  [0.62, 0.22, 0.17],
  [-0.85, 0.42, 0.11],
  [1.02, -0.18, 0.11],
  [-1.0, -0.4, 0.26],
  [0.95, -0.52, 0.24],
  [0.86, -0.8, 0.3],
  [-0.86, -0.8, 0.3],
  [-0.4, 0.2, 0.17],
  [-0.2, 0.78, 0.06],
  [0.3, 0.82, 0.06],
  [0.52, 0.64, 0.06],
];
function free(x: number, z: number, pad = 0) {
  const q = Lc.toLocal(new THREE.Vector3(x, F, z));
  if (Math.abs(q.x) < W / 2 + 0.04 + pad && Math.abs(q.z) < D / 2 + 0.04 + pad) return false;
  return !keep.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr + pad);
}

// ---------------------------------------------------------------------------------------------------------------
// DAIS
{
  const prof: OutlinePoint[] = [
    [0, 0],
    [1.5, 0],
    [1.5, 0.04],
    [1.45, 0.058],
    [1.4, F],
    [0, F],
  ];
  b.lathe(prof, { at: [0, 0, 0], bone: base, segments: 24, color: daisPaint, name: "dais" });
  const decal = new THREE.CircleGeometry(1.4, 48).rotateX(-Math.PI / 2).translate(0, F + 0.0015, 0);
  put("dais.runes", "#ffffff", decal, I4, { tex: RUNE_TEX, glowS: 1 });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + 0.1;
    const pos = new THREE.Vector3(Math.cos(a) * 1.445, 0.062, Math.sin(a) * 1.445);
    if (i % 3 === 0) gem("octa", 0.036, CYAN, mat(pos.clone().setY(0.075)));
    else put("dais.bosses", GOLD, new THREE.SphereGeometry(0.03, 6, 4), mat(pos));
  }
}

// ---------------------------------------------------------------------------------------------------------------
// HOARD HEAP
{
  const rings = 18;
  const segs = 36;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= rings; i++)
    for (let j = 0; j < segs; j++) {
      const r = HR * Math.pow(i / rings, 0.85);
      const a = (j / segs) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      pos.push(x, surfY(x, z), z);
    }
  const vi = (i: number, j: number) => i * segs + (j % segs);
  for (let i = 1; i <= rings; i++)
    for (let j = 0; j < segs; j++) {
      if (i > 1) idx.push(vi(i - 1, j), vi(i - 1, j + 1), vi(i, j + 1));
      idx.push(vi(i - 1, j), vi(i, j + 1), vi(i, j));
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  b.part(g, heapPaint, { bone: base, at: [0, 0, 0], flat: true, name: "heap" });
}

// loose coins over the heap
{
  let n = 0;
  let tries = 0;
  while (n < 640 && tries++ < 4000) {
    const r = HR * Math.sqrt(R()) * 1.02;
    const a = R() * Math.PI * 2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = H(x, z);
    if (!free(x, z) || (h < 0.02 && R() < 0.55)) continue;
    coinOn(surfN(x, z), new THREE.Vector3(x, surfY(x, z) + 0.004 + R() * 0.012, z), 30);
    n++;
  }
}

// coin stacks
for (const [sx, sz, count] of [
  [-0.2, 0.78, 8],
  [0.3, 0.82, 6],
  [0.52, 0.64, 4],
] as Array<[number, number, number]>) {
  const baseY = Math.max(surfY(sx, sz), surfY(sx + 0.03, sz), surfY(sx - 0.03, sz), surfY(sx, sz + 0.03), surfY(sx, sz - 0.03));
  for (let k = 0; k < count; k++) {
    const jx = (R() - 0.5) * 0.008;
    const jz = (R() - 0.5) * 0.008;
    coin(new THREE.Vector3(sx + jx, baseY - 0.002 + 0.0082 * k + 0.004, sz + jz), eul(0, R() * 360, 0), 1, k % 5 === 3 ? SILVER : k % 2 ? GOLD : GOLD_LT);
  }
}

// coins on edge
for (const [ex, ez, yaw, lean] of [
  [-0.35, 1.17, 30, 8],
  [0.5, 1.22, -50, -10],
  [0.05, 1.24, 80, 12],
] as Array<[number, number, number, number]>) {
  const q = eul(0, yaw, 0).multiply(eul(90 + lean, 0, 0));
  coin(new THREE.Vector3(ex, F + COIN_R * 0.97, ez), q, 1, GOLD_LT);
}

// loose cut gems over the heap
{
  const kinds: GemKind[] = ["brilliant", "octa", "emerald", "pear", "brilliant", "octa"];
  let n = 0;
  let tries = 0;
  while (n < 44 && tries++ < 3000) {
    const r = HR * Math.sqrt(R()) * 0.98;
    const a = R() * Math.PI * 2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!free(x, z, 0.02) || H(x, z) < 0.03) continue;
    const size = 0.03 + R() * 0.026;
    const color = GEM_COLORS[n % GEM_COLORS.length];
    const q = aim(surfN(x, z)).multiply(eul((R() - 0.5) * 70, R() * 360, (R() - 0.5) * 70));
    gem(kinds[n % kinds.length], size, color, mat(new THREE.Vector3(x, surfY(x, z) + size * 0.3, z), q));
    n++;
  }
}

// pearls
for (let i = 0; i < 9; i++) {
  const a = R() * Math.PI * 2;
  const r = 0.2 + R() * 0.8;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  if (!free(x, z, 0.03) || H(x, z) < 0.04) continue;
  put("pearls", PEARL, new THREE.SphereGeometry(0.02, 6, 4), mat(new THREE.Vector3(x, surfY(x, z) + 0.012, z)));
}

// ---------------------------------------------------------------------------------------------------------------
// CHEST
const hingeY = TOP + LIP + 0.002;
const lid = b.joint("lid", { parent: base, at: Lc.p([0, hingeY, -(D + 0.05) / 2]), dir: Lc.d([1, 0, 0]), role: "hinge" });
{
  const place = (g: THREE.BufferGeometry, color: string, v: V, rot: V = [0, 0, 0], bone: Bone = base, name = "chest.trim") =>
    put(name, color, g, Lc.m(v, rot), { bone });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // body: planked wood, base and top mouldings, corner posts, bands, feet
  b.part(new THREE.BoxGeometry(W, BODY, D), woodPaint, { bone: base, at: Lc.p([0, FEET + BODY / 2, 0]), quat: Lc.q, flat: true, name: "chest.body" });
  b.part(new THREE.BoxGeometry(W + 0.05, 0.05, D + 0.05), GOLD_DP, { bone: base, at: Lc.p([0, FEET + 0.025, 0]), quat: Lc.q, name: "chest.baseMould" });
  b.part(new THREE.BoxGeometry(W + 0.05, 0.035, D + 0.05), GOLD_P, { bone: base, at: Lc.p([0, TOP - 0.0175, 0]), quat: Lc.q, name: "chest.topMould" });
  // lip frame round the opening
  for (const sz of [1, -1])
    b.part(new THREE.BoxGeometry(W + 0.05, LIP, 0.07), GOLD_P, { bone: base, at: Lc.p([0, TOP + LIP / 2, sz * (D / 2 - 0.0)]), quat: Lc.q, name: "chest.lipFB" });
  for (const sx of [1, -1])
    b.part(new THREE.BoxGeometry(0.07, LIP, D - 0.09), GOLD_P, { bone: base, at: Lc.p([sx * (W / 2 - 0.0), TOP + LIP / 2, 0]), quat: Lc.q, name: "chest.lipLR" });
  // glowing inner edge of the lip
  for (const sz of [1, -1])
    put("chest.edgeGlow", CYAN, box(W - 0.1, 0.012, 0.012), Lc.m([0, TOP + LIP + 0.002, sz * (D / 2 - 0.047)]), { glowS: 1 });
  for (const sx of [1, -1])
    put("chest.edgeGlow", CYAN, box(0.012, 0.012, D - 0.1), Lc.m([sx * (W / 2 - 0.047), TOP + LIP + 0.002, 0]), { glowS: 1 });
  // corner posts with caps and feet
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.075, BODY + 0.02, 0.075), GOLD_DP, { bone: base, at: Lc.p([sx * (W / 2 - 0.004), FEET + BODY / 2, sz * (D / 2 - 0.004)]), quat: Lc.q, name: "chest.post" });
      place(new THREE.CylinderGeometry(0.058, 0.04, 0.07, 6), GOLD_DK, [sx * (W / 2 - 0.02), 0.03, sz * (D / 2 - 0.02)], [0, 0, 0], base, "chest.foot");
      put("chest.cap", GOLD_HI, new THREE.OctahedronGeometry(0.038, 0).scale(1, 0.75, 1), Lc.m([sx * (W / 2 - 0.004), TOP + 0.01, sz * (D / 2 - 0.004)]));
      for (let k = 0; k < 3; k++) {
        const y = FEET + 0.08 + k * 0.12;
        put("chest.rivets", GOLD_HI, new THREE.SphereGeometry(0.011, 5, 4), Lc.m([sx * (W / 2 + 0.034), y, sz * (D / 2 - 0.004)]));
        put("chest.rivets", GOLD_HI, new THREE.SphereGeometry(0.011, 5, 4), Lc.m([sx * (W / 2 - 0.004), y, sz * (D / 2 + 0.034)]));
      }
    }
  // vertical bands on front, back and sides
  for (const sz of [1, -1])
    for (const sx of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.1, BODY, 0.014), GOLD_DP, { bone: base, at: Lc.p([sx * 0.3, FEET + BODY / 2, sz * (D / 2 + 0.003)]), quat: Lc.q, name: "chest.band" });
      for (let k = 0; k < 4; k++) {
        put("chest.rivets", GOLD_HI, new THREE.SphereGeometry(0.011, 5, 4), Lc.m([sx * 0.3 - 0.028 + (k % 2) * 0.056, FEET + 0.07 + Math.floor(k / 2) * 0.26, sz * (D / 2 + 0.012)]));
        put("chest.rivets", GOLD_HI, new THREE.SphereGeometry(0.011, 5, 4), Lc.m([sx * 0.3 + 0.028 - (k % 2) * 0.056, FEET + 0.2 + Math.floor(k / 2) * 0.1, sz * (D / 2 + 0.012)]));
      }
    }
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.014, BODY, 0.1), GOLD_DP, { bone: base, at: Lc.p([sx * (W / 2 + 0.003), FEET + BODY / 2, 0]), quat: Lc.q, name: "chest.sideBand" });
    // ring handle on a mount plate
    b.part(new THREE.BoxGeometry(0.02, 0.09, 0.08), GOLD_P, { bone: base, at: Lc.p([sx * (W / 2 + 0.02), FEET + 0.28, 0]), quat: Lc.q, name: "chest.mount" });
    put("chest.handle", GOLD_LT, new THREE.TorusGeometry(0.05, 0.011, 5, 10), Lc.m([sx * (W / 2 + 0.04), FEET + 0.235, 0], [0, 90, 0]));
    put("chest.rivets", GOLD_HI, new THREE.SphereGeometry(0.012, 5, 4), Lc.m([sx * (W / 2 + 0.034), FEET + 0.31, 0.025]));
    put("chest.rivets", GOLD_HI, new THREE.SphereGeometry(0.012, 5, 4), Lc.m([sx * (W / 2 + 0.034), FEET + 0.31, -0.025]));
    put("chest.panel", "#ffffff", new THREE.PlaneGeometry(0.15, 0.2), Lc.m([sx * (W / 2 + 0.0042), FEET + 0.15, 0.17 * 0], [0, sx * 90, 0]), { tex: ORNAMENT_TEX });
  }
  // front panels
  for (const sx of [1, -1])
    put("chest.panel", "#ffffff", new THREE.PlaneGeometry(0.14, 0.2), Lc.m([sx * 0.17, FEET + 0.2, D / 2 + 0.0042]), { tex: ORNAMENT_TEX });
  // lock plate
  const shield: OutlinePoint[] = [
    [-0.085, 0.11],
    [0.085, 0.11],
    [0.085, -0.02],
    [0, -0.11, "sharp"],
    [-0.085, -0.02],
  ];
  b.extrude(shield, { at: Lc.p([0, FEET + 0.24, D / 2 + 0.014]), x: Lc.d([1, 0, 0]), y: Lc.d([0, 1, 0]), thickness: 0.03, bevel: 0.008, smoothing: 1, color: GOLD_P, bone: base, name: "chest.lock" });
  const inset: OutlinePoint[] = shield.map(([x, y, s]) => (s ? [x * 0.7, y * 0.7 + 0.012, s] : [x * 0.7, y * 0.7 + 0.012]));
  b.extrude(inset, { at: Lc.p([0, FEET + 0.24, D / 2 + 0.026]), x: Lc.d([1, 0, 0]), y: Lc.d([0, 1, 0]), thickness: 0.012, bevel: 0.003, smoothing: 1, color: NAVY, bone: base, name: "chest.lockInlay" });
  put("chest.keyhole", CYAN, new THREE.CylinderGeometry(0.02, 0.02, 0.01, 10).rotateX(Math.PI / 2), Lc.m([0, FEET + 0.255, D / 2 + 0.034]), { glowS: 1 });
  put("chest.keyhole", CYAN, new THREE.BoxGeometry(0.014, 0.044, 0.01), Lc.m([0, FEET + 0.225, D / 2 + 0.034]), { glowS: 1 });
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    put("chest.rivets", GOLD_HI, new THREE.SphereGeometry(0.01, 5, 4), Lc.m([Math.cos(a) * 0.07, FEET + 0.24 + 0.02 + Math.sin(a) * 0.07 * 0.8, D / 2 + 0.03]));
  }

  // coin fill inside the open chest
  const rx = W / 2 - 0.06;
  const rz = D / 2 - 0.06;
  const ry = 0.15;
  b.part(new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), heapPaint, { bone: base, at: Lc.p([0, TOP - 0.01, 0]), quat: Lc.q, scale: [rx, ry, rz], flat: true, name: "chest.fill" });
  for (let i = 0; i < 95; i++) {
    const x = (R() * 2 - 1) * (rx - 0.02);
    const z = (R() * 2 - 1) * (rz - 0.02);
    const e = 1 - (x / rx) ** 2 - (z / rz) ** 2;
    if (e <= 0.05) continue;
    const y = ry * Math.sqrt(e);
    const n = new THREE.Vector3(x / (rx * rx), y / (ry * ry), z / (rz * rz)).normalize();
    const world = Lc.p([x, TOP - 0.01 + y + 0.006, z]);
    coinOn(n.applyQuaternion(Lc.q), world, 28);
  }
  const fillGems: Array<[number, number, GemKind, number, string]> = [
    [-0.22, 0.08, "octa", 0.045, RUBY],
    [0.3, -0.05, "brilliant", 0.05, EMER],
    [0.05, -0.12, "emerald", 0.048, SAPPH],
    [-0.38, -0.1, "pear", 0.042, AMETH],
    [0.18, 0.14, "octa", 0.04, TOPAZ],
    [-0.08, 0.17, "brilliant", 0.036, PINK],
    [0.42, 0.1, "octa", 0.036, CYAN],
  ];
  for (const [x, z, kind, size, color] of fillGems) {
    const e = 1 - (x / rx) ** 2 - (z / rz) ** 2;
    const y = ry * Math.sqrt(Math.max(e, 0.1));
    gem(kind, size, color, Lc.m([x, TOP - 0.01 + y + size * 0.3, z], [R() * 40 - 20, R() * 360, R() * 40 - 20]));
  }

  // LID
  const Dl = D + 0.05;
  const Wl = W + 0.05;
  const rise = 0.2;
  const sideH = 0.05;
  const arch = (pad: number): OutlinePoint[] => {
    const pts: OutlinePoint[] = [
      [-pad, 0],
      [Dl + pad, 0],
      [Dl + pad, sideH],
    ];
    for (let i = 1; i < 10; i++) {
      const t = (i / 10) * Math.PI;
      pts.push([Dl / 2 + Math.cos(t) * (Dl / 2 + pad), sideH + Math.sin(t) * (rise + pad)]);
    }
    pts.push([-pad, sideH]);
    return pts;
  };
  const hingeP = lid.at.clone();
  const lidX = Lc.d([0, 0, 1]);
  const lidY = Lc.d([0, 1, 0]);
  b.extrude(arch(0), { at: hingeP, x: lidX, y: lidY, thickness: Wl, bevel: 0.01, color: lidPaint, bone: lid, name: "lid.shell" });
  const bandSpec: Array<[number, number]> = [
    [0.495, 0.06],
    [-0.495, 0.06],
    [0.3, 0.1],
    [-0.3, 0.1],
    [0, 0.1],
  ];
  for (const [bx, bw] of bandSpec) {
    b.extrude(arch(0.014), {
      at: Lc.p([bx, hingeY, -Dl / 2]),
      x: lidX,
      y: lidY,
      thickness: bw,
      bevel: 0.006,
      color: bx === 0 ? GOLD_P : GOLD_DP,
      bone: lid,
      name: "lid.band",
    });
    for (let i = 1; i < 10; i += 2) {
      const t = (i / 10) * Math.PI;
      const zl = Dl / 2 + Math.cos(t) * (Dl / 2 + 0.016);
      const yl = sideH + Math.sin(t) * (rise + 0.016);
      put("lid.rivets", GOLD_HI, new THREE.SphereGeometry(0.012, 5, 4), Lc.m([bx, hingeY + yl + 0.002, -Dl / 2 + zl]), { bone: lid });
    }
  }
  // hinge barrels
  for (const hx of [-0.33, 0, 0.33])
    put("lid.hinge", GOLD_LT, new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6).rotateZ(Math.PI / 2), Lc.m([hx, hingeY + 0.005, -Dl / 2 - 0.012]), { bone: lid });
  // hasp tongue that hangs over the lock
  const tongue: OutlinePoint[] = [
    [-0.05, 0],
    [0.05, 0],
    [0.05, -0.08],
    [0, -0.125, "sharp"],
    [-0.05, -0.08],
  ];
  b.extrude(tongue, { at: Lc.p([0, hingeY + 0.04, Dl / 2 + 0.03]), x: Lc.d([1, 0, 0]), y: Lc.d([0, 1, 0]), thickness: 0.016, bevel: 0.004, color: GOLD_P, bone: lid, name: "lid.hasp" });
  put("lid.hasp", RUBY, new THREE.OctahedronGeometry(0.03, 0).scale(0.9, 1.25, 0.9), Lc.m([0, hingeY - 0.005, Dl / 2 + 0.046]), { bone: lid, glowS: 0.5 });
  put("lid.rivets", GOLD_HI, new THREE.SphereGeometry(0.01, 5, 4), Lc.m([-0.034, hingeY + 0.025, Dl / 2 + 0.04]), { bone: lid });
  put("lid.rivets", GOLD_HI, new THREE.SphereGeometry(0.01, 5, 4), Lc.m([0.034, hingeY + 0.025, Dl / 2 + 0.04]), { bone: lid });
  // quilted velvet lining drawn on the underside
  put("lid.lining", "#ffffff", new THREE.PlaneGeometry(Wl - 0.06, Dl - 0.04).rotateX(Math.PI / 2).rotateY(Math.PI), Lc.m([0, hingeY - 0.0035, 0]), { bone: lid, tex: LATTICE_TEX });
}

// ---------------------------------------------------------------------------------------------------------------
// Floating hextech gem over the chest
{
  const c = Lc.p([0, TOP + 0.36, 0.02]);
  const L = at(c.x, c.y, c.z);
  put("float.gem", CYAN, gemGeo("brilliant", 0.095, CYAN), L.m([0, 0, 0], [0, 20, 0]), { glowS: 0.8 });
  put("float.gem", CYAN, new THREE.ConeGeometry(0.095 * 0.55, 0.075, 8).translate(0, 0.095 * 0.32 + 0.0375, 0), L.m([0, 0, 0], [0, 20, 0]), { glowS: 0.8 });
  b.part(new THREE.TorusGeometry(0.15, 0.009, 5, 18), GOLD_P, { bone: base, at: c, rotation: [72, 0, 12], name: "float.ringA" });
  b.part(new THREE.TorusGeometry(0.12, 0.007, 5, 16), GOLD_DP, { bone: base, at: c, rotation: [20, 40, -30], name: "float.ringB" });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.5;
    const v = new THREE.Vector3(Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15).applyEuler(new THREE.Euler(72 * DEG, 0, 12 * DEG));
    gem("octa", 0.02, i % 2 ? GOLD_HI : PINK, mat(c.clone().add(v)));
  }
}

// ---------------------------------------------------------------------------------------------------------------
// CROWN
function crown(L: Loc) {
  const Rb = 0.116;
  const bandPaint = paint((_p, _n, s) => {
    const h = s[0];
    const tri = Math.abs((((s[1] / 18) % 2) + 2) % 2 - 1);
    if (h < 0.009 || h > 0.07) return GOLD_HI;
    if (Math.abs(h - (0.033 + 0.014 * tri)) < 0.0038) return GOLD_SH;
    return mix(GOLD_DK, GOLD, 0.5 + noise(new THREE.Vector3(s[1] * 0.02, h * 6, 0), 0.5, 4) * 0.5);
  });
  const band: OutlinePoint[] = [
    [0.098, 0],
    [0.109, 0],
    [0.123, 0.078],
    [0.111, 0.078],
  ];
  b.lathe(band, { at: L.p([0, 0, 0]), axis: L.d([0, 1, 0]), segments: 10, color: bandPaint, bone: base, name: "crown.band" });
  for (const y of [0.004, 0.076])
    put("crown.rim", GOLD_LT, new THREE.TorusGeometry(y < 0.01 ? 0.103 : 0.118, 0.0075, 5, 10).rotateX(Math.PI / 2), L.m([0, y, 0]));
  // velvet cap
  put("crown.velvet", VELVET, new THREE.SphereGeometry(0.108, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.75, 1), L.m([0, 0.05, 0]));
  put("crown.velvetRim", VELVET_DK, new THREE.TorusGeometry(0.1, 0.012, 4, 10).rotateX(Math.PI / 2), L.m([0, 0.034, 0]));
  // spikes
  for (let k = 0; k < 10; k++) {
    const tall = k % 2 === 0;
    const phi = k * 36 * DEG;
    const len = tall ? (k === 0 ? 0.225 : 0.185) : 0.1;
    const w = tall ? 0.034 : 0.026;
    const out: OutlinePoint[] = tall
      ? [
          [-w, 0],
          [w, 0],
          [w * 0.55, len * 0.38],
          [w * 0.25, len * 0.7],
          [0, len, "sharp"],
          [-w * 0.25, len * 0.7],
          [-w * 0.55, len * 0.38],
        ]
      : [
          [-w, 0],
          [w, 0],
          [w * 0.45, len * 0.5],
          [0, len, "sharp"],
          [-w * 0.45, len * 0.5],
        ];
    const tan: V = [Math.cos(phi), 0, -Math.sin(phi)];
    const rad: V = [Math.sin(phi), 0, Math.cos(phi)];
    const up: V = [rad[0] * 0.12, 1, rad[2] * 0.12];
    const upN = new THREE.Vector3(...up).normalize();
    const origin = L.p([rad[0] * Rb, 0.05, rad[2] * Rb]);
    b.extrude(out, { at: origin, x: L.d(tan), y: L.d(up), thickness: 0.014, bevel: 0.004, color: GOLD_P, bone: base, name: "crown.spike" });
    const tip = origin.clone().add(L.d([upN.x, upN.y, upN.z]).multiplyScalar(len));
    if (tall) {
      const gc = [RUBY, EMER, SAPPH, AMETH, TOPAZ][(k / 2) % 5];
      gem("octa", k === 0 ? 0.03 : 0.022, gc, mat(tip.clone().add(L.d([0, 0.012, 0])), L.q));
      // gem inlaid at the spike base
      const face = L.p([rad[0] * (Rb + 0.014), 0.088, rad[2] * (Rb + 0.014)]);
      gem("brilliant", 0.018, k === 0 ? CYAN : GEM_COLORS[(k / 2 + 2) % 7], mat(face, L.q.clone().multiply(eul(90, phi / DEG, 0))));
    } else {
      put("crown.pearl", PEARL, new THREE.SphereGeometry(0.015, 6, 4), mat(tip.clone().add(L.d([0, 0.006, 0]))));
    }
  }
  // band jewels in gold bezels
  for (let k = 0; k < 10; k++) {
    const phi = (k * 36 + 18) * DEG;
    const rr = 0.1155;
    const pos = L.p([Math.sin(phi) * rr, 0.042, Math.cos(phi) * rr]);
    const q = L.q.clone().multiply(eul(0, phi / DEG, 0));
    put("crown.bezel", GOLD_HI, new THREE.TorusGeometry(0.019, 0.0045, 4, 8), mat(pos, q));
    const col = k % 2 ? SAPPH : RUBY;
    put(`gem.${col}`, col, new THREE.SphereGeometry(0.015, 6, 4).scale(1, 1.1, 0.5), mat(pos, q), { glowS: GEM_GLOW });
  }
  // arches and orb
  for (const turn of [0, 90]) {
    const pts = [
      [0, 0.075, Rb],
      [0, 0.14, 0.085],
      [0, 0.195, 0.04],
      [0, 0.218, 0],
      [0, 0.195, -0.04],
      [0, 0.14, -0.085],
      [0, 0.075, -Rb],
    ].map(([x, y, z]) => {
      const c = Math.cos(turn * DEG);
      const s = Math.sin(turn * DEG);
      return L.p([x * c + z * s, y, -x * s + z * c]);
    });
    b.sweep(catmull(pts), 0.0075, { bone: base, color: GOLD_HI, sides: 5, caps: "flat", name: "crown.arch" });
  }
  put("crown.orb", GOLD_LT, new THREE.SphereGeometry(0.02, 6, 4), L.m([0, 0.222, 0]));
  put(`gem.${CYAN}`, CYAN, gemGeo("octa", 0.03, CYAN), L.m([0, 0.255, 0]), { glowS: 0.7 });
}
{
  const cx = 0.62;
  const cz = 0.22;
  crown(at(cx, surfY(cx, cz) + 0.012, cz, [28, -22, 9]));
}

// ---------------------------------------------------------------------------------------------------------------
// GOBLETS
function goblet(L: Loc, metal: Fill, gemColor: string, fill: "liquid" | "gems" | "none", liquid = CYAN) {
  const outline: OutlinePoint[] = [
    [0, 0],
    [0.078, 0],
    [0.085, 0.012],
    [0.078, 0.022],
    [0.04, 0.034],
    [0.022, 0.06],
    [0.02, 0.095],
    [0.036, 0.108],
    [0.036, 0.118],
    [0.02, 0.13],
    [0.022, 0.16],
    [0.06, 0.185],
    [0.092, 0.235],
    [0.098, 0.29],
    [0.094, 0.298],
    [0.084, 0.298],
    [0.082, 0.29],
    [0.075, 0.235],
    [0.045, 0.2],
    [0, 0.188],
  ];
  const flute = paint((p, n, s) => {
    const h = s[0];
    const a = s[1];
    const base = metal instanceof Object ? metal.at(p, n, s) : mix(metal, metal, 0);
    if (h > 0.2 && h < 0.29) {
      const f = (((a / 22.5) % 1) + 1) % 1;
      if (f < 0.1 || f > 0.9) return GOLD_SH;
      if (Math.abs(h - 0.27) < 0.0035 || Math.abs(h - 0.215) < 0.003) return GOLD_SH;
    }
    return base;
  });
  const bowl = b.lathe(outline, { at: L.p([0, 0, 0]), axis: L.d([0, 1, 0]), segments: 12, color: flute, bone: base, name: "goblet.body" });
  void bowl;
  put("goblet.rim", GOLD_HI, new THREE.TorusGeometry(0.0905, 0.007, 4, 12).rotateX(Math.PI / 2), L.m([0, 0.296, 0]));
  put("goblet.knot", GOLD_LT, new THREE.TorusGeometry(0.034, 0.008, 4, 10).rotateX(Math.PI / 2), L.m([0, 0.1, 0]));
  put("goblet.knot", GOLD_LT, new THREE.TorusGeometry(0.075, 0.007, 4, 12).rotateX(Math.PI / 2), L.m([0, 0.013, 0]));
  for (let k = 0; k < 6; k++) {
    const phi = ((k + 0.5) / 6) * 360;
    const rr = 0.087;
    const pos = L.m([Math.sin(phi * DEG) * rr, 0.245, Math.cos(phi * DEG) * rr], [0, phi, 0]);
    put("goblet.bezel", GOLD_HI, new THREE.TorusGeometry(0.02, 0.005, 4, 8), pos);
    put(`gem.${gemColor}`, gemColor, new THREE.SphereGeometry(0.016, 6, 4).scale(1, 1.15, 0.5), pos, { glowS: GEM_GLOW });
  }
  put(`gem.${gemColor}`, gemColor, new THREE.OctahedronGeometry(0.02, 0).scale(1, 1.3, 1), L.m([0, 0.1, 0]), { glowS: GEM_GLOW });
  if (fill === "liquid")
    put("goblet.liquid", liquid, new THREE.CircleGeometry(0.081, 12).rotateX(-Math.PI / 2), L.m([0, 0.275, 0]), { glowS: 1 });
  if (fill === "gems") {
    const kinds: GemKind[] = ["brilliant", "octa", "emerald", "pear", "brilliant"];
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      const rr = k === 0 ? 0 : 0.045;
      const col = GEM_COLORS[(k * 3) % 7];
      gem(kinds[k % 5], 0.034, col, L.m([Math.cos(a) * rr, 0.285 + (k === 0 ? 0.04 : 0.008), Math.sin(a) * rr], [R() * 50 - 25, R() * 360, R() * 50 - 25]));
    }
  }
}
goblet(at(-0.85, surfY(-0.85, 0.42) - 0.004, 0.42, [30, 0, 0]), goldPaint(3), RUBY, "liquid", "#ff4fb0");
goblet(at(1.02, surfY(1.02, -0.18) - 0.004, -0.18, [-60, 0, 0]), SILVER, SAPPH, "gems");
// tipped goblet spilling coins
{
  const x = -0.42;
  const z = 0.1;
  const L = at(x, surfY(x, z) + 0.088, z, [111, 0, 80]);
  goblet(L, GOLD_P, EMER, "none");
  const mouth = L.p([0, 0.29, 0]);
  const dirv = L.d([0, 1, 0]);
  for (let i = 0; i < 14; i++) {
    const t = 0.02 + i * 0.045;
    const px = mouth.x + dirv.x * t + (R() - 0.5) * 0.07;
    const pz = mouth.z + dirv.z * t + (R() - 0.5) * 0.07;
    const py = Math.max(surfY(px, pz), F) + 0.006 + (i < 3 ? 0.06 - i * 0.02 : 0);
    coinOn(i < 3 ? new THREE.Vector3(0, 1, 0) : surfN(px, pz), new THREE.Vector3(px, py, pz), 40);
  }
  gem("octa", 0.034, EMER, mat(mouth.clone().add(dirv.clone().multiplyScalar(0.07)).setY(F + 0.04)));
  gem("brilliant", 0.036, TOPAZ, mat(mouth.clone().add(dirv.clone().multiplyScalar(0.18)).setY(F + 0.03), eul(20, 40, 10)));
}

// ---------------------------------------------------------------------------------------------------------------
// INGOT STACK
{
  const L = at(0.95, F, -0.52, [0, 35, 0]);
  const prof: OutlinePoint[] = [
    [-0.058, 0],
    [0.058, 0],
    [0.044, 0.056],
    [-0.044, 0.056],
  ];
  const rows: Array<[number, number]> = [
    [-0.125, 0],
    [0, 0],
    [0.125, 0],
    [-0.0625, 1],
    [0.0625, 1],
    [0, 2],
  ];
  for (const [ix, row] of rows) {
    const y = row * 0.056;
    b.extrude(prof, { at: L.p([ix, y, 0]), x: L.d([1, 0, 0]), y: L.d([0, 1, 0]), thickness: 0.24, bevel: 0.008, color: GOLD_P, bone: base, name: "ingot" });
    put("ingot.stamp", "#ffffff", new THREE.PlaneGeometry(0.06, 0.06).rotateX(-Math.PI / 2), L.m([ix, y + 0.0585, 0]), { tex: STAMP_TEX });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// SACK with spilled coins
{
  const L = at(-1.0, F, -0.4, [20, 0, -28]);
  const outline: OutlinePoint[] = [
    [0, 0],
    [0.12, 0],
    [0.19, 0.06],
    [0.215, 0.16],
    [0.19, 0.25],
    [0.12, 0.31],
    [0.085, 0.345],
    [0.11, 0.4],
    [0.135, 0.45],
    [0.125, 0.455],
    [0.095, 0.41],
    [0.075, 0.36],
    [0, 0.33],
  ];
  const sack = b.lathe(outline, { at: L.p([0, 0.0, 0]), axis: L.d([0, 1, 0]), segments: 10, smoothing: 1, color: burlapPaint, bone: base, name: "sack" });
  b.decal(sack, PATCH_TEX, { at: L.p([0.0, 0.17, 0.22]), dir: L.d([0, 0, 1]), up: L.d([0, 1, 0]), size: [0.14, 0.14], bone: base, name: "sack.patch" });
  put("sack.rope", ROPE, new THREE.TorusGeometry(0.093, 0.012, 5, 10).rotateX(Math.PI / 2), L.m([0, 0.347, 0]));
  put("sack.rope", ROPE, new THREE.SphereGeometry(0.02, 5, 4), L.m([0, 0.35, 0.092]));
  put("sack.rope", ROPE, new THREE.CylinderGeometry(0.007, 0.005, 0.09, 4), L.m([0.012, 0.31, 0.1], [-10, 0, 25]));
  put("sack.rope", ROPE, new THREE.CylinderGeometry(0.007, 0.005, 0.08, 4), L.m([-0.014, 0.312, 0.1], [-12, 0, -22]));
  put("sack.coins", GOLD, new THREE.SphereGeometry(0.082, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.55, 1), L.m([0, 0.39, 0]));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    coin(L.p([Math.cos(a) * 0.045, 0.43 + (i % 2) * 0.01, Math.sin(a) * 0.045]), L.q.clone().multiply(eul(R() * 60 - 30, R() * 360, R() * 60 - 30)), 1, i % 2 ? GOLD_LT : GOLD);
  }
  const mouth = L.p([0, 0.4, 0]);
  const target = new THREE.Vector3(-0.66, 0, -0.12);
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const px = mouth.x + (target.x - mouth.x) * t + (R() - 0.5) * 0.1;
    const pz = mouth.z + (target.z - mouth.z) * t + (R() - 0.5) * 0.1;
    const py = Math.max(surfY(px, pz), F) + 0.006 + (t < 0.35 ? (0.35 - t) * 0.22 : 0);
    coinOn(t < 0.35 ? new THREE.Vector3(0.3, 1, 0.2).normalize() : surfN(px, pz), new THREE.Vector3(px, py, pz), 38);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// NECKLACE and RINGS on the front heap
{
  const pts: Array<[number, number]> = [
    [-0.3, 0.0],
    [-0.26, 0.28],
    [-0.1, 0.5],
    [0.1, 0.52],
    [0.27, 0.34],
    [0.3, 0.06],
  ];
  const path = catmull(pts.map(([x, z]) => [x, surfY(x, z) + 0.026, z]));
  b.sweep(path, 0.0045, { bone: base, color: GOLD_LT, sides: 4, name: "necklace.chain" });
  for (let i = 0; i < 22; i++) {
    const t = (i + 0.5) / 22;
    const p = path.at(t);
    if (i === 11) continue;
    put("necklace.pearls", PEARL, new THREE.SphereGeometry(0.0155, 6, 4), mat(p));
    if (i % 5 === 2) gem("octa", 0.014, CYAN, mat(p.clone().add(new THREE.Vector3(0, 0.014, 0))));
  }
  const pend = path.at(0.5);
  gem("pear", 0.06, RUBY, mat(pend.clone().add(new THREE.Vector3(0, 0.012, 0.01)), eul(75, 0, 0)));
  put("necklace.bezel", GOLD_P as unknown as string, new THREE.TorusGeometry(0.03, 0.007, 4, 8), mat(pend.clone().add(new THREE.Vector3(0, 0.022, -0.03)), eul(60, 0, 0)));
}
