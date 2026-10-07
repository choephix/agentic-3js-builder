// Runestone circle: eight carved standing stones, glowing rune panels and crystal crowns around a stepped altar.
// Blizzard/Warcraft look: chunky bevelled slabs, hand-painted stone with moss and light-from-above gradients,
// worn bronze bands with rivets, saturated arcane cyan against warm gold, crimson cloth and fire.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { DEG, aim, rng } from "../src/math";
import { cells, grain, mix, noise, paint, smoothstep } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Runestone Circle",
  description:
    "A ring of eight carved standing stones with glowing arcane runes, bronze bands and crystal crowns around a stepped altar with a floating crystal, braziers, banners and mossy ruins.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette -------------------------------------------------------------------------------------------------------
const STONE_D = "#2c3650";
const STONE_M = "#56698a";
const STONE_L = "#a3b9d0";
const MOSS_D = "#2d6a2a";
const MOSS = "#5fa835";
const MOSS_L = "#b0dc5c";
const GOLD = "#f2b836";
const GOLD_L = "#ffe27e";
const BRONZE = "#a8692a";
const BRONZE_D = "#5a3216";
const GLOW = "#6cf3ff";
const GLOW_W = "#e4ffff";
const RED = "#b8261d";
const RED_D = "#6a1512";
const WOOD = "#7d5129";
const WOOD_D = "#452818";
const BONE = "#ece0c4";
const BONE_D = "#bba980";
const IRON = "#2a2d38";
const FIRE = "#ff8a1e";
const FIRE_L = "#ffd84c";
const EMBER = "#ff4c1c";
const ROPE = "#c9a468";
const DARK = "#0b1020";
const KERB_A = "#5d7090";
const KERB_B = "#475a7b";
const KERB_C = "#7186a6";

const G = 0.13; // top of the flagstone dais
const RING = 2.3; // radius of the standing stones
const clamp = (x: number, a: number, c: number) => Math.min(c, Math.max(a, x));

// Rune glyphs, drawn in a 100 x 160 panel around (50, 80) ----------------------------------------------------------
const GLYPHS = [
  "M50 30 V130 M50 42 L80 64 M50 66 L80 88",
  "M50 32 L76 80 L50 128 L24 80 Z M50 32 V128 M24 80 H76",
  "M20 80 Q50 42 80 80 Q50 118 20 80 Z M41 80 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M50 34 V50 M50 110 V126",
  "M50 72 a8 8 0 0 1 8 8 a16 16 0 0 1 -16 16 a24 24 0 0 1 -24 -24 a32 32 0 0 1 32 -32",
  "M50 132 V38 M50 90 L22 52 M50 90 L78 52 M50 112 L32 96 M50 112 L68 96",
  "M30 36 H70 L30 124 H70 M50 36 V124",
  "M22 124 L50 62 L78 124 Z M50 38 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M36 104 H64",
  "M50 132 V44 M26 52 V70 Q26 92 50 92 Q74 92 74 70 V52 M50 44 L38 30 M50 44 L62 30",
];

const strokeGlyph = (d: string, k: number, dim: boolean) =>
  `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="#050b16" stroke-width="${13 * k}"/>` +
  `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="${dim ? "#2c5668" : "#1fa8d8"}" stroke-width="${8 * k}"/>` +
  `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="${dim ? "#4f8296" : "#e6ffff"}" stroke-width="${3.2 * k}"/>`;

const panelCache = new Map<string, THREE.Texture>();
function panelSvg(index: number, dim: boolean) {
  const key = `${index % GLYPHS.length}|${dim}`;
  const cached = panelCache.get(key);
  if (cached) return cached;
  const line = dim ? "#2f5a6c" : "#2bb6e2";
  const jewel = dim ? "#4f8296" : "#e6ffff";
  let dots = "";
  for (let i = 0; i < 6; i++) {
    const y = 28 + i * 20.8;
    dots += `<circle cx="9.5" cy="${y}" r="2" fill="${line}"/><circle cx="90.5" cy="${y}" r="2" fill="${line}"/>`;
  }
  const tex = svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">` +
      `<rect x="4.5" y="4.5" width="91" height="151" rx="10" fill="none" stroke="#070d1a" stroke-width="7"/>` +
      `<rect x="13" y="13" width="74" height="134" rx="6" fill="none" stroke="${line}" stroke-width="2"/>` +
      `<path d="M50 6 L58 14 L50 22 L42 14 Z M50 138 L58 146 L50 154 L42 146 Z" fill="${jewel}" stroke="#070d1a" stroke-width="1.6"/>` +
      `<path d="M13 30 L30 13 M70 13 L87 30 M13 130 L30 147 M70 147 L87 130" stroke="${line}" stroke-width="2.4" fill="none"/>` +
      dots +
      strokeGlyph(GLYPHS[index % GLYPHS.length], 1, dim) +
      `</svg>`,
    { size: 480 },
  );
  panelCache.set(key, tex);
  return tex;
}

const sigil = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="50" cy="50" r="44" fill="none" stroke="#050b16" stroke-width="9"/>` +
    `<circle cx="50" cy="50" r="44" fill="none" stroke="#1fa8d8" stroke-width="4"/>` +
    `<circle cx="50" cy="50" r="44" fill="none" stroke="#e6ffff" stroke-width="1.4" stroke-dasharray="6 5"/>` +
    strokeGlyph("M50 18 L80 70 H20 Z", 0.7, false) +
    strokeGlyph("M50 82 L26 40 H74 Z", 0.7, false) +
    `<circle cx="50" cy="52" r="6" fill="#e6ffff" stroke="#050b16" stroke-width="2.4"/>` +
    `</svg>`,
  { size: 384 },
);

function floorSvg(angles: number[]) {
  let s = `<svg viewBox="-250 -250 500 500" xmlns="http://www.w3.org/2000/svg">`;
  const ring = (r: number, w: number, dash = "") =>
    `<circle cx="0" cy="0" r="${r}" fill="none" stroke="#070d1a" stroke-width="${w + 3.6}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` +
    `<circle cx="0" cy="0" r="${r}" fill="none" stroke="#25aedc" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  s += ring(190, 3.4) + ring(146, 2.8) + ring(168, 1.4, "5 5");
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const r0 = i % 4 === 0 ? 150 : 178;
    const r1 = 188;
    s += `<path d="M${Math.sin(a) * r0} ${Math.cos(a) * r0} L${Math.sin(a) * r1} ${Math.cos(a) * r1}" stroke="#25aedc" stroke-width="2"/>`;
  }
  angles.forEach((az, i) => {
    const a = az * DEG;
    const gx = Math.sin(a) * 168;
    const gy = Math.cos(a) * 168;
    s += `<g transform="translate(${gx} ${gy}) rotate(${180 - az}) scale(0.36) translate(-50 -80)">`;
    s += `<circle cx="50" cy="80" r="60" fill="#0a1424" stroke="#070d1a" stroke-width="5"/>`;
    s += `<circle cx="50" cy="80" r="60" fill="none" stroke="#25aedc" stroke-width="3.4"/>`;
    s += strokeGlyph(GLYPHS[i % GLYPHS.length], 1.1, false) + `</g>`;
    // inward pointer toward the altar
    const px = Math.sin(a) * 146;
    const py = Math.cos(a) * 146;
    s += `<g transform="translate(${px} ${py}) rotate(${-az})"><path d="M-9 0 L0 -18 L9 0 Z" fill="#e6ffff" stroke="#070d1a" stroke-width="2.6"/></g>`;
  });
  // diamonds at the gaps without a brazier
  for (let i = 0; i < 8; i += 2) {
    const a = (i * 45 * Math.PI) / 180;
    const x = Math.sin(a) * 168;
    const y = Math.cos(a) * 168;
    s += `<g transform="translate(${x} ${y}) rotate(${-i * 45})"><path d="M0 -12 L9 0 L0 12 L-9 0 Z" fill="#e6ffff" stroke="#070d1a" stroke-width="3"/></g>`;
  }
  s += `</svg>`;
  return svg(s, { size: 2048 });
}

// Card drawings ---------------------------------------------------------------------------------------------------
const grassTex = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M10 64 L6 18 L20 64Z" fill="#3f8a2c"/><path d="M18 64 L24 6 L34 64Z" fill="#62ad38"/>` +
    `<path d="M28 64 L40 14 L44 64Z" fill="#4a9a30"/><path d="M38 64 L56 22 L50 64Z" fill="#8cc94a"/>` +
    `<path d="M24 64 L32 28 L30 64Z" fill="#b4e060"/><path d="M44 64 L62 40 L54 64Z" fill="#3f8a2c"/></svg>`,
  { size: 128 },
);
const fernTex = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg"><path d="M24 64 Q23 34 24 4" stroke="#2a6a28" stroke-width="3" fill="none"/>` +
    [0, 1, 2, 3, 4, 5]
      .map(
        (i) =>
          `<path d="M24 ${58 - i * 9} Q${34 - i} ${52 - i * 9} ${44 - i * 3} ${48 - i * 9} Q${34 - i} ${56 - i * 9} 24 ${60 - i * 9}Z" fill="${i % 2 ? "#4f9d36" : "#6dbb3e"}"/>` +
          `<path d="M24 ${58 - i * 9} Q${14 + i} ${52 - i * 9} ${4 + i * 3} ${48 - i * 9} Q${14 + i} ${56 - i * 9} 24 ${60 - i * 9}Z" fill="${i % 2 ? "#6dbb3e" : "#4f9d36"}"/>`,
      )
      .join("") +
    `</svg>`,
  { size: 128 },
);
const flowerTex = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 64 L16 22" stroke="#3a7a2a" stroke-width="3.4"/>` +
    `<path d="M16 48 Q6 44 4 36 Q14 38 16 46Z" fill="#4f9d36"/>` +
    `<g fill="#ffd84c"><circle cx="16" cy="10" r="5"/><circle cx="8" cy="16" r="5"/><circle cx="24" cy="16" r="5"/><circle cx="11" cy="24" r="5"/><circle cx="21" cy="24" r="5"/></g>` +
    `<circle cx="16" cy="17" r="4.4" fill="#d9622b"/></svg>`,
  { size: 96 },
);
const leafTex = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg"><path d="M16 46 C2 34 2 14 16 2 C30 14 30 34 16 46Z" fill="#4f9d36"/>` +
    `<path d="M16 46 C30 34 30 14 16 2Z" fill="#6dbb3e"/><path d="M16 46 L16 8" stroke="#2a6a28" stroke-width="2.6"/></svg>`,
  { size: 96 },
);
const featherTex = (main: string, dark: string, band: string) =>
  svg(
    `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg"><path d="M16 94 C2 62 2 26 16 4 C30 26 30 62 16 94Z" fill="${main}"/>` +
      `<path d="M16 94 C30 62 30 26 16 4Z" fill="${dark}"/><path d="M5 40 Q16 30 27 40 L27 48 Q16 38 5 48Z" fill="${band}"/>` +
      `<path d="M16 96 L16 6" stroke="#f7ecc8" stroke-width="2.4"/></svg>`,
    { size: 128 },
  );
const featherA = featherTex("#c8321f", "#8a1e14", "#f2c037");
const featherB = featherTex("#1fa4cf", "#14708f", "#f2f6ff");
const sigilGold = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M32 12 L50 40 L32 68 L14 40 Z" stroke="#f2b836" stroke-width="5"/>` +
    `<path d="M32 12 V68 M14 40 H50" stroke="#f2b836" stroke-width="4"/>` +
    `<circle cx="32" cy="40" r="7" stroke="#ffe27e" stroke-width="3.4"/></g></svg>`,
  { size: 160 },
);
const inlay = svg(
  `<svg viewBox="0 0 160 24" xmlns="http://www.w3.org/2000/svg">` +
    `<rect x="2" y="2" width="156" height="20" rx="5" fill="none" stroke="#070d1a" stroke-width="4"/>` +
    `<path d="M10 12 H150" stroke="#1d86ad" stroke-width="2.4"/>` +
    [0, 1, 2, 3, 4, 5, 6]
      .map((k) =>
        k === 3
          ? `<path d="M80 3 L90 12 L80 21 L70 12Z" fill="#e6ffff" stroke="#070d1a" stroke-width="1.6"/>`
          : `<path d="M${22 + k * 20} 6 V18 M${22 + k * 20} 12 L${28 + k * 20} 8" stroke="#6cf3ff" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      )
      .join("") +
    `</svg>`,
  { size: 512 },
);


// Outlines ------------------------------------------------------------------------------------------------------------
type Pt = [number, number];
type Profile = { R: Pt[]; L: Pt[]; T: Pt[]; w: number; h: number };

const TOPS: Pt[][] = [
  [[0.38, 0.9], [0.12, 1.0], [-0.12, 0.95], [-0.34, 0.88]],
  [[0.4, 0.88], [0.3, 0.96], [0.08, 0.96], [0.0, 0.9], [-0.1, 0.93], [-0.28, 0.99], [-0.42, 0.88]],
  [[0.42, 0.89], [0.3, 0.96], [0.1, 1.0], [-0.1, 1.0], [-0.3, 0.96], [-0.42, 0.89]],
  [[0.4, 0.94], [0.2, 1.0], [-0.08, 0.92], [-0.3, 0.85]],
];

function profile(w: number, h: number, style: number, r: () => number): Profile {
  const j = () => (r() - 0.5) * 0.05 * w;
  const R: Pt[] = [
    [0.6 * w + j(), 0],
    [0.56 * w + j(), 0.12 * h],
    [0.5 * w + j(), 0.36 * h],
    [0.53 * w + j(), 0.62 * h],
    [0.47 * w, 0.8 * h],
  ];
  const L: Pt[] = [
    [-0.6 * w + j(), 0],
    [-0.56 * w + j(), 0.12 * h],
    [-0.52 * w + j(), 0.36 * h],
    [-0.5 * w + j(), 0.62 * h],
    [-0.47 * w, 0.8 * h],
  ];
  const T = TOPS[style % TOPS.length].map(([fx, fy]): Pt => [fx * w, fy * h + (r() - 0.5) * 0.02 * h]);
  return { R, L, T, w, h };
}

function interp(list: Pt[], y: number) {
  for (let i = 0; i + 1 < list.length; i++) {
    const [x0, y0] = list[i];
    const [x1, y1] = list[i + 1];
    if (y >= y0 && y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0 || 1);
  }
  return list[list.length - 1][0];
}

function outlineOf(p: Profile): OutlinePoint[] {
  return [...p.L.slice(0, 1), ...p.R, ...p.T, ...[...p.L].reverse().slice(0, p.L.length - 1)].map(([x, y]) => [x, y]);
}

/** Left and right extents of a simple outline at height y. */
function extentAt(pts: OutlinePoint[], y: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    if ((y0 <= y && y1 >= y) || (y1 <= y && y0 >= y)) {
      if (y0 === y1) {
        lo = Math.min(lo, x0, x1);
        hi = Math.max(hi, x0, x1);
      } else {
        const x = x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
        lo = Math.min(lo, x);
        hi = Math.max(hi, x);
      }
    }
  }
  return [lo, hi];
}

function topAt(p: Profile, x: number) {
  const full: Pt[] = [p.R[p.R.length - 1], ...p.T, p.L[p.L.length - 1]];
  for (let i = 0; i + 1 < full.length; i++) {
    const [x0, y0] = full[i];
    const [x1, y1] = full[i + 1];
    if (x <= x0 && x >= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return p.h * 0.9;
}

// Stone paint -----------------------------------------------------------------------------------------------------------
function stonePaint(seed: number, y0: number, h: number, N?: THREE.Vector3, moss = 0.3) {
  return paint((p, n) => {
    const big = noise(p, 0.55, seed);
    const mid = noise(p, 0.17, seed + 7);
    const t = clamp((p.y - y0) / h, 0, 1);
    const streak = noise(new THREE.Vector3(p.x * 6, p.y * 0.8, p.z * 6), 0.3, seed + 3);
    let c = mix(STONE_D, STONE_M, 0.22 + 0.5 * big + 0.2 * mid + 0.15 * streak);
    c = mix(c, STONE_L, t * t * 0.4 + (n.y > 0.55 ? 0.28 : 0));
    const cell = cells(p, 0.62, seed);
    const edge = cell.id > 0.5 ? smoothstep(0.015, 0.07, cell.d2 - cell.d1) : 1;
    c = mix(STONE_D, c, 0.35 + 0.65 * edge);
    const tt = (p.y - y0) / h + (big - 0.5) * 0.3;
    const m = 1 - smoothstep(0, moss, tt);
    c = mix(c, mix(MOSS_D, MOSS, mid), m * 0.92);
    if (m > 0.3 && mid > 0.62) c = mix(c, MOSS_L, 0.5);
    if (N) {
      const f = Math.abs(n.dot(N));
      if (f < 0.92) c = mix(c, n.y > 0 ? STONE_L : STONE_D, 0.45 * (1 - f));
    }
    return c;
  });
}

const bronzePaint = (y0: number, y1: number) =>
  paint((p, n, s) => {
    const v = clamp((p.y - y0) / (y1 - y0 || 1), 0, 1);
    const wear = noise(p, 0.08, 3);
    let c = mix(BRONZE_D, GOLD, 0.25 + 0.6 * (1 - Math.abs(v - 0.7) * 1.6));
    if (v > 0.8) c = mix(c, GOLD_L, 0.55);
    c = mix(c, BRONZE, wear * 0.35);
    const zig = Math.abs((((s[0] / 0.1) % 1) + 1) % 1 - 0.5) * 2;
    if (v > 0.22 && v < 0.78 && (v - 0.22) / 0.56 < zig * 0.7 && Math.abs(n.y) < 0.5) c = mix(c, BRONZE_D, 0.8);
    return c;
  });

const groundPaint = paint((p) => {
  const r = Math.hypot(p.x, p.z);
  if (r < 2.7) {
    const c = cells(p, 0.5, 11);
    const edge = smoothstep(0.03, 0.14, c.d2 - c.d1);
    const shade = noise(p, 0.9, 5);
    let base = mix(mix("#6a7b95", "#4f607c", c.id), "#8697b0", shade * 0.3 + (c.id > 0.8 ? 0.25 : 0));
    const moss = smoothstep(0.55, 0.85, noise(p, 0.3, 9)) * smoothstep(1.9, 2.6, r);
    base = mix(base, MOSS, moss * 0.8);
    return mix("#1d2538", base, 0.35 + 0.65 * edge);
  }
  const g = noise(p, 0.5, 21);
  const grass = mix(mix("#3d8a2c", "#5faa38", g), "#9bd250", smoothstep(0.62, 0.9, noise(p, 0.15, 3)) * 0.6);
  const dirt = smoothstep(2.82, 2.7, r) * 0.9 + (r > 3.3 ? smoothstep(3.3, 3.5, r) * 0.9 : 0);
  return mix(grass, mix("#6d4b2d", "#4a3220", g), dirt);
});
interface Merger {
  add(
    color: string,
    geo: THREE.BufferGeometry,
    at: THREE.Vector3,
    quat?: THREE.Quaternion,
    scale?: THREE.Vector3 | number,
    strength?: number,
  ): void;
  flush(): void;
}


// ---------------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "runestoneCircle", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  type Bone = Joint;
  const rnd = rng(1337);
  const UP = new THREE.Vector3(0, 1, 0);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const polar = (r: number, deg: number) => V(Math.sin(deg * DEG) * r, 0, Math.cos(deg * DEG) * r);
  const yaw = (rad: number) => new THREE.Quaternion().setFromAxisAngle(UP, rad);
  const basisQ = (x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) =>
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));

  // Merged small parts: one part per bone, colour and glow strength.
  function merger(bone: Bone): Merger {
    const groups = new Map<string, { color: string; strength: number; geos: THREE.BufferGeometry[] }>();
    return {
      add(
        color: string,
        geo: THREE.BufferGeometry,
        at: THREE.Vector3,
        quat?: THREE.Quaternion,
        scale?: THREE.Vector3 | number,
        strength = 0,
      ) {
        const key = `${color}|${strength}`;
        let group = groups.get(key);
        if (!group) groups.set(key, (group = { color, strength, geos: [] }));
        const sc = typeof scale === "number" ? V(scale, scale, scale) : (scale ?? V(1, 1, 1));
        const g = geo.clone().applyMatrix4(new THREE.Matrix4().compose(at, quat ?? new THREE.Quaternion(), sc));
        group.geos.push(g.index ? g.toNonIndexed() : g);
      },
      flush() {
        for (const g of groups.values()) {
          const part = b.part(mergeGeometries(g.geos)!, g.color, { bone, at: [0, 0, 0], flat: true });
          if (g.strength > 0) glow(part, g.strength);
        }
      },
    };
  }
  const fixed = merger(root);

  // ---- geometry shared by many parts
  const rivetGeo = new THREE.SphereGeometry(0.02, 6, 4);
  const rockGeo = new THREE.IcosahedronGeometry(0.1, 0);
  const crystalBody = new THREE.CylinderGeometry(0.05, 0.065, 0.2, 6);
  const crystalTip = new THREE.ConeGeometry(0.05, 0.11, 6);
  const addCrystal = (m: Merger, at: THREE.Vector3, dir: THREE.Vector3, s: number, color = GLOW, k = 1.4) => {
    const q = aim(dir);
    const d = dir.clone().normalize();
    m.add(color, crystalBody, at.clone().addScaledVector(d, 0.1 * s), q, s, k);
    m.add(color, crystalTip, at.clone().addScaledVector(d, 0.255 * s), q, s, k);
  };

  // ---- ground: grass skirt and flagstone dais
  const groundOutline: OutlinePoint[] = [
    [0, 0],
    [3.5, 0],
    [3.5, 0.05],
    [3.4, 0.075],
    [2.72, 0.075],
    [2.67, G],
    [0, G],
  ];
  b.lathe(groundOutline, { at: [0, 0, 0], segments: 56, color: groundPaint, bone: root, name: "ground" });

  // kerb blocks round the dais, with a gap for the entrance
  for (let i = 0; i < 34; i++) {
    const az = (i / 34) * 360 + 5;
    if (Math.abs(((az + 180) % 360) - 180) < 9) continue;
    const pos = polar(2.7, az);
    pos.y = 0.075 + 0.065 + (rnd() - 0.5) * 0.01;
    fixed.add(
      [KERB_A, KERB_B, KERB_C][i % 3],
      new THREE.BoxGeometry(0.4 + rnd() * 0.04, 0.13 + rnd() * 0.03, 0.2),
      pos,
      yaw(az * DEG),
    );
  }

  // entrance path of worn flagstones through the kerb gap
  for (let k = 0; k < 5; k++) {
    const at = V((rnd() - 0.5) * 0.18, 0.075 + 0.025, 2.55 + k * 0.17);
    fixed.add(
      [KERB_A, KERB_C, KERB_B][k % 3],
      new THREE.BoxGeometry(0.42 + rnd() * 0.1, 0.05, 0.28 + rnd() * 0.06),
      at,
      yaw((rnd() - 0.5) * 0.4),
    );
  }

  // glowing floor ring of runes
  const stoneAz = Array.from({ length: 8 }, (_, i) => 22.5 + 45 * i);
  glow(
    b.part(new THREE.PlaneGeometry(5, 5), "#ffffff", {
      bone: root,
      at: [0, G + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: floorSvg(stoneAz),
      name: "floorRunes",
    }),
    1.15,
  );

  // ---- standing stones
  const BROKEN = 6;
  const heights = [2.25, 1.98, 2.5, 2.15, 2.35, 1.92, 2.15, 2.3];
  const widths = [0.9, 0.92, 1.0, 0.86, 0.94, 0.88, 0.92, 0.96];
  const styles = [0, 1, 2, 3, 2, 1, 0, 3];
  const T = 0.44;
  const featherSets = [
    { frames: [] as Frame[], flows: [] as THREE.Vector3[] },
    { frames: [] as Frame[], flows: [] as THREE.Vector3[] },
  ];
  const leafFrames: Frame[] = [];
  const tuftFrames: Frame[] = [];
  const fernFrames: Frame[] = [];
  const mushrooms = merger(root);
  const glowSmall = merger(root);

  function placeFrame(O: THREE.Vector3, X: THREE.Vector3, Y: THREE.Vector3) {
    const N = new THREE.Vector3().crossVectors(X, Y).normalize();
    return { O, X, Y, N, pt: (u: number, v: number, w: number) => O.clone().addScaledVector(X, u).addScaledVector(Y, v).addScaledVector(N, w) };
  }

  const crownPoints: THREE.Vector3[] = [];

  for (let i = 0; i < 8; i++) {
    const az = stoneAz[i];
    const h = heights[i];
    const w = widths[i];
    const P = polar(RING, az);
    P.y = G - 0.02;
    const d = polar(1, az + 180);
    const out = d.clone().negate();
    const X = V(d.z, 0, -d.x);
    const lean = ((rnd() - 0.5) * 7 + (i === 3 ? 4 : 0)) * DEG;
    const Yl = V(0, Math.cos(lean), 0).addScaledVector(out, Math.sin(lean));
    const F = placeFrame(P, X, Yl);
    const F0 = placeFrame(P, X, UP);
    const prof = profile(w, h, styles[i], rnd);

    // plinth
    const foot: OutlinePoint[] = [
      [-0.66 * w, 0],
      [0.66 * w, 0],
      [0.64 * w, 0.13],
      [0.57 * w, 0.27],
      [-0.57 * w, 0.27],
      [-0.64 * w, 0.13],
    ];
    b.extrude(foot, {
      at: F0.O,
      x: F0.X,
      y: F0.Y,
      thickness: 0.72,
      bevel: 0.035,
      color: stonePaint(40 + i, G, 1.4, F0.N, 0.5),
      bone: root,
      name: `plinth${i}`,
    });
    // glowing inlay strip on both faces of the plinth
    for (const sd of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(1.15 * w, 0.17), "#ffffff", {
          bone: root,
          at: F0.pt(0, 0.125, sd * (0.36 + 0.007)),
          dir: F0.N.clone().multiplyScalar(sd),
          axis: "z",
          texture: inlay,
          name: `inlay${i}`,
        }),
        1.0,
      );
    }

    let main: OutlinePoint[];
    let topY = 0;
    if (i === BROKEN) {
      const cut = 0.5 * h;
      const xr = interp(prof.R, cut);
      const xl = interp(prof.L, cut);
      const lower = (side: Pt[]) => side.filter(([, y]) => y < cut);
      const jag: Pt[] = [
        [xr, cut],
        [xr * 0.7, cut + 0.07],
        [xr * 0.4, cut - 0.02],
        [xr * 0.1, cut + 0.13],
        [xl * 0.2, cut + 0.03],
        [xl * 0.55, cut + 0.11],
        [xl * 0.8, cut + 0.0],
        [xl, cut],
      ];
      main = [
        ...lower(prof.L).slice(0, 1),
        ...lower(prof.R),
        ...jag,
        ...[...lower(prof.L)].reverse().slice(0, lower(prof.L).length - 1),
      ].map(([x, y]) => [x, y]);
      topY = cut + 0.1;
    } else {
      main = outlineOf(prof);
      topY = topAt(prof, 0);
    }
    b.extrude(main, {
      at: F.O,
      x: F.X,
      y: F.Y,
      thickness: T,
      bevel: 0.035,
      color: stonePaint(i * 3 + 1, G, h * 0.9, F.N, 0.3),
      bone: root,
      name: `stone${i}`,
    });

    if (i !== BROKEN) {
      // carved rune panel
      const ph = 0.46 * h;
      const pw = ph / 1.6;
      glow(
        b.part(new THREE.PlaneGeometry(pw, ph), "#ffffff", {
          bone: root,
          at: F.pt(0, 0.49 * h, T / 2 + 0.01),
          dir: F.N,
          axis: "z",
          up: F.Y,
          texture: panelSvg(i, false),
          name: `rune${i}`,
        }),
        1.2,
      );
      // outer face carries another glowing rune
      glow(
        b.part(new THREE.PlaneGeometry(pw, ph), "#ffffff", {
          bone: root,
          at: F.pt(0, 0.49 * h, -T / 2 - 0.01),
          dir: F.N.clone().negate(),
          axis: "z",
          up: F.Y,
          texture: panelSvg(i + 3, false),
          name: `runeOuter${i}`,
        }),
        1.0,
      );

      // bronze straps: a heavy one above the panel and a lighter one low on the stone
      const y0 = 0.79 * h;
      const strap = (ya: number, yb: number, count: number): [number, number] => {
        const [la, ra] = extentAt(main, ya + 0.002);
        const [lb, rb] = extentAt(main, yb - 0.002);
        b.extrude(
          [
            [la - 0.045, ya],
            [ra + 0.045, ya],
            [rb + 0.045, yb],
            [lb - 0.045, yb],
          ],
          {
            at: F.O,
            x: F.X,
            y: F.Y,
            thickness: T + 0.1,
            bevel: 0.022,
            color: bronzePaint(F.O.y + ya * Math.cos(lean), F.O.y + yb * Math.cos(lean)),
            bone: root,
            name: `band${i}`,
          },
        );
        for (const side of [1, -1]) {
          for (let k = 0; k < count; k++) {
            const u = la + (ra - la) * (0.08 + (0.84 * (k + 0.5)) / count);
            fixed.add(GOLD_L, rivetGeo, F.pt(u, (ya + yb) / 2, side * (T / 2 + 0.056)));
          }
        }
        return [la, ra];
      };
      const [l0, r0] = strap(y0, y0 + 0.1, 6);
      strap(0.135 * h, 0.135 * h + 0.075, 5);
      // bronze horns flaring from the strap ends
      for (const sd of [1, -1]) {
        const hb = F.pt(sd > 0 ? r0 + 0.05 : l0 - 0.05, y0 + 0.05, 0);
        const hd = F.X.clone().multiplyScalar(sd).addScaledVector(F.Y, 0.55).normalize();
        fixed.add(BRONZE, new THREE.CylinderGeometry(0.075, 0.085, 0.07, 6), hb, aim(hd));
        fixed.add(GOLD, new THREE.ConeGeometry(0.06, 0.4, 5), hb.clone().addScaledVector(hd, 0.2), aim(hd));
        fixed.add(GOLD_L, rivetGeo, hb.clone().addScaledVector(hd, 0.05).addScaledVector(F.N, 0.055));
        fixed.add(GOLD_L, rivetGeo, hb.clone().addScaledVector(hd, 0.05).addScaledVector(F.N, -0.055));
      }
      // hanging talismans on the band edges
      for (const sd of [1, -1]) {
        const u = sd > 0 ? r0 + 0.05 : l0 - 0.05;
        const base = F.pt(u, y0 + 0.01, 0);
        for (let k = 0; k < 2; k++) {
          const at = base.clone().addScaledVector(F.N, (k - 0.5) * 0.2).addScaledVector(F.X, sd * k * 0.04);
          const set = featherSets[(i + k) % 2];
          set.frames.push(frame(at, [0, 1, 0]));
          set.flows.push(d.clone());
        }
        // cord with bead
        const cordTop = F.pt(u, y0 + 0.02, 0.0);
        fixed.add(ROPE, new THREE.CylinderGeometry(0.008, 0.008, 0.2, 5), cordTop.clone().addScaledVector(UP, -0.1));
        fixed.add(BONE, new THREE.SphereGeometry(0.03, 6, 4), cordTop.clone().addScaledVector(UP, -0.22));
        fixed.add(GOLD, new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), cordTop.clone().addScaledVector(UP, -0.18), basisQ(F.X, F.N, F.Y.clone().negate()));
      }

      // crown: bronze claws round a glowing crystal
      const cb = F.pt(0, topY - 0.02, 0);
      b.lathe(
        [
          [0, 0],
          [0.17, 0],
          [0.15, 0.05],
          [0.09, 0.12],
          [0.0, 0.12],
        ],
        { at: cb, axis: F.Y, segments: 8, color: bronzePaint(cb.y, cb.y + 0.12), bone: root, name: `crown${i}` },
      );
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        const tiltDir = F.Y.clone()
          .multiplyScalar(Math.cos(0.3))
          .addScaledVector(F.X, Math.cos(a) * Math.sin(0.3))
          .addScaledVector(F.N, Math.sin(a) * Math.sin(0.3));
        fixed.add(
          GOLD,
          new THREE.ConeGeometry(0.022, 0.26, 4),
          cb.clone().addScaledVector(F.Y, 0.2).addScaledVector(F.X, Math.cos(a) * 0.075).addScaledVector(F.N, Math.sin(a) * 0.075),
          aim(tiltDir),
        );
      }
      addCrystal(glowSmall, F.pt(0, topY + 0.08, 0), F.Y, 1.45 + (i % 3) * 0.12);
      crownPoints.push(F.pt(0, topY + 0.55, 0));
    } else {
      // broken stump: glowing crystal shards in the fracture and a dim fragment lying in the grass
      const cb = F.pt(0, topY, 0);
      addCrystal(glowSmall, cb.clone().addScaledVector(F.X, 0.14), F.Y.clone().addScaledVector(F.X, 0.25), 1.0);
      addCrystal(glowSmall, cb.clone().addScaledVector(F.X, -0.12).addScaledVector(F.N, 0.06), F.Y.clone().addScaledVector(F.X, -0.35), 0.8);
      addCrystal(glowSmall, cb.clone().addScaledVector(F.N, -0.05), F.Y.clone().addScaledVector(F.N, 0.2), 0.7);
      glow(
        b.part(new THREE.PlaneGeometry(0.4, 0.6), "#ffffff", {
          bone: root,
          at: F.pt(0, 0.25 * h + 0.18, T / 2 + 0.01),
          dir: F.N,
          axis: "z",
          up: F.Y,
          texture: panelSvg(i, false),
          name: `runeStump`,
        }),
        0.9,
      );
      // fallen top
      const cutH = 0.5 * h;
      const upper = (side: Pt[]) => side.filter(([, y]) => y > cutH).map(([x, y]): Pt => [x, y - cutH]);
      const xr = interp(prof.R, cutH);
      const xl = interp(prof.L, cutH);
      const topOut: OutlinePoint[] = [
        [xl, 0],
        [xl * 0.6, 0.06],
        [xl * 0.2, -0.0],
        [xr * 0.3, 0.1],
        [xr * 0.7, 0.02],
        [xr, 0],
        ...upper(prof.R),
        ...prof.T.map(([x, y]): Pt => [x, y - cutH]),
        ...upper(prof.L).reverse(),
      ].map(([x, y]) => [x, y] as OutlinePoint);
      const tang = V(Math.cos(az * DEG), 0, -Math.sin(az * DEG));
      const lieY = out.clone().multiplyScalar(0.15).addScaledVector(tang, -0.99);
      lieY.y = 0.07;
      lieY.normalize();
      const lieX = new THREE.Vector3().crossVectors(lieY, UP).normalize();
      const lieO = polar(3.0, az - 4);
      lieO.y = 0.075 + T / 2 + 0.03;
      const LF = placeFrame(lieO, lieX, lieY);
      b.extrude(topOut, {
        at: LF.O,
        x: LF.X,
        y: LF.Y,
        thickness: T,
        bevel: 0.035,
        color: stonePaint(77, 0.07, 0.6, LF.N, 0.3),
        bone: root,
        name: "fallenTop",
      });
      b.part(new THREE.PlaneGeometry(0.4, 0.62), "#ffffff", {
        bone: root,
        at: LF.pt(0, 0.62, T / 2 + 0.01),
        dir: LF.N,
        axis: "z",
        up: LF.Y,
        texture: panelSvg(i, true),
        name: "runeFallen",
      });
      // broken chunks
      for (let k = 0; k < 4; k++) {
        const at = polar(2.8 + rnd() * 0.4, az + (rnd() - 0.5) * 28);
        at.y = 0.08 + 0.04;
        fixed.add([STONE_M, "#6a7d9a", STONE_D][k % 3], rockGeo, at, yaw(rnd() * 6), V(1.2 + rnd(), 0.8 + rnd() * 0.6, 1 + rnd() * 0.8));
      }
    }

    // rubble and moss at the plinth
    for (let k = 0; k < 4; k++) {
      const a = rnd() * Math.PI * 2;
      const rr = 0.55 * w + 0.18 + rnd() * 0.25;
      const at = F0.pt(Math.cos(a) * rr * 1.2, 0.03, Math.sin(a) * rr * 0.9);
      fixed.add([STONE_M, "#6a7d9a", STONE_D, "#7f93b0"][k], rockGeo, at, yaw(rnd() * 6), V(0.8 + rnd() * 0.8, 0.6 + rnd() * 0.5, 0.8 + rnd() * 0.8));
    }
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + rnd();
      const at = F0.pt(Math.cos(a) * (0.62 * w + 0.12 + rnd() * 0.12), 0.0, Math.sin(a) * (0.5 + rnd() * 0.12));
      (k % 3 === 0 ? fernFrames : tuftFrames).push(frame(at, [0, 1, 0]));
    }

    // glowing crystal clusters and mushrooms at alternating bases
    if (i % 2 === 0) {
      const bx = F0.pt(-0.58 * w - 0.12, 0.02, 0.3);
      addCrystal(glowSmall, bx, V(0.2, 1, 0.1), 1.0);
      addCrystal(glowSmall, bx.clone().add(V(0.12, 0, 0.1)), V(-0.3, 1, 0.1), 0.7);
      addCrystal(glowSmall, bx.clone().add(V(-0.06, 0, -0.1)), V(0.1, 1, -0.4), 0.55);
    } else {
      const bx = F0.pt(0.6 * w + 0.15, 0.02, -0.25);
      for (let k = 0; k < 4; k++) {
        const at = bx.clone().add(V((rnd() - 0.5) * 0.25, 0, (rnd() - 0.5) * 0.25));
        const s = 0.6 + rnd() * 0.7;
        mushrooms.add(BONE, new THREE.CylinderGeometry(0.014 * s, 0.02 * s, 0.07 * s, 5), at.clone().add(V(0, 0.035 * s, 0)));
        mushrooms.add(
          "#58d6ff",
          new THREE.SphereGeometry(0.05 * s, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2),
          at.clone().add(V(0, 0.07 * s, 0)),
          undefined,
          V(1, 0.7, 1),
          1.1,
        );
      }
    }

    // vines winding up some stones
    if (i === 1 || i === 4 || i === 7) {
      const side = i === 4 ? -1 : 1;
      const [lo, hi] = extentAt(main, 0.3 * h);
      const edgeU = side > 0 ? hi : lo;
      const pts: THREE.Vector3[] = [];
      const n = 34;
      for (let k = 0; k <= n; k++) {
        const v = 0.05 + (k / n) * 0.62 * h;
        const eu = (side > 0 ? interp(prof.R, v) : interp(prof.L, v)) || edgeU;
        const th = k * 0.95;
        pts.push(F.pt(eu - side * 0.03 + side * 0.06 * Math.cos(th), v, (T / 2 + 0.03) * Math.sin(th)));
      }
      const path = catmull(pts);
      b.sweep(path, [0.03, 0.012], { color: MOSS_D, bone: root, sides: 5, name: `vine${i}` });
      for (let k = 1; k < 30; k++) {
        const th = (k / 30) * n * 0.95;
        const dirv = F.X.clone().multiplyScalar(side * Math.cos(th)).addScaledVector(F.N, Math.sin(th)).addScaledVector(UP, 0.35);
        leafFrames.push(frame(path.at(k / 30), dirv));
      }
    }
  }

  // ---- small boundary stelae in the gaps, each with its own glowing glyph
  for (let k = 1; k < 8; k++) {
    const az = 45 * k + (k % 2 ? 3 : -3);
    const P = polar(3.0, az);
    P.y = 0.07;
    const d = polar(1, az + 180);
    const F = placeFrame(P, V(d.z, 0, -d.x), UP);
    const sh = 0.6 + (k % 3) * 0.08;
    const sw = 0.4;
    const sp = profile(sw, sh, k, rnd);
    b.extrude(outlineOf(sp), {
      at: F.O,
      x: F.X,
      y: F.Y,
      thickness: 0.2,
      bevel: 0.025,
      color: stonePaint(120 + k, 0.07, sh, F.N, 0.35),
      bone: root,
      name: `stele${k}`,
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.17, 0.27), "#ffffff", {
        bone: root,
        at: F.pt(0, 0.36 * sh + 0.1, 0.108),
        dir: F.N,
        axis: "z",
        up: UP,
        texture: panelSvg(k + 1, false),
        name: `steleRune${k}`,
      }),
      1.0,
    );
    b.extrude(
      [
        [-0.24, 0],
        [0.24, 0],
        [0.21, 0.09],
        [-0.21, 0.09],
      ],
      { at: F.O, x: F.X, y: F.Y, thickness: 0.34, bevel: 0.02, color: stonePaint(140 + k, 0.07, 0.4, F.N, 0.6), bone: root, name: `steleFoot${k}` },
    );
    addCrystal(glowSmall, F.pt(0, topAt(sp, 0) - 0.02, 0), UP, 0.7);
    fixed.add(GOLD, new THREE.CylinderGeometry(0.06, 0.07, 0.04, 6), F.pt(0, topAt(sp, 0) - 0.02, 0));
  }

  // ---- altar
  const tier = (r: number, y0: number, hh: number, seed: number, name: string) =>
    b.lathe(
      [
        [0, 0],
        [r, 0],
        [r, hh - 0.04],
        [r - 0.04, hh],
        [0, hh],
      ],
      { at: [0, y0, 0], segments: 8, spin: 22.5, color: stonePaint(seed, G, 0.6, undefined, 0.15), bone: root, name },
    );
  const t1 = G + 0.14;
  const t2 = t1 + 0.14;
  const t3 = t2 + 0.12;
  tier(1.4, G, 0.14, 91, "tier1");
  tier(1.16, t1, 0.14, 92, "tier2");
  tier(0.9, t2, 0.12, 93, "tier3");
  // bronze trim rings on the tiers
  for (const [r, y, hh] of [
    [1.402, G + 0.075, 0.035],
    [1.162, t1 + 0.075, 0.035],
    [0.902, t2 + 0.06, 0.03],
  ] as const) {
    b.lathe(
      [
        [r - 0.03, 0],
        [r + 0.012, 0],
        [r + 0.012, hh],
        [r - 0.03, hh],
      ],
      { at: [0, y, 0], segments: 8, spin: 22.5, color: bronzePaint(y, y + hh), bone: root, name: "trim" },
    );
  }
  // altar block: a waisted pedestal with a heavy slab on top
  const SA = 1.25;
  const blockOutline: OutlinePoint[] = [
    [-0.5, 0],
    [0.5, 0],
    [0.5, 0.1],
    [0.34, 0.15],
    [0.32, 0.46],
    [0.47, 0.51],
    [0.53, 0.56],
    [0.53, 0.64],
    [-0.53, 0.64],
    [-0.53, 0.56],
    [-0.47, 0.51],
    [-0.32, 0.46],
    [-0.34, 0.15],
    [-0.5, 0.1],
  ].map(([x, y]): OutlinePoint => [x * SA, y * SA]);
  const halfT = 0.33 * SA;
  b.extrude(blockOutline, {
    at: [0, t3, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 2 * halfT,
    bevel: 0.035,
    color: stonePaint(95, t3, 0.8, V(0, 0, 1), 0.08),
    bone: root,
    name: "altarBlock",
  });
  const altarTop = t3 + 0.64 * SA;
  for (const sd of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.34 * SA, 0.34 * SA), "#ffffff", {
        bone: root,
        at: [0, t3 + 0.31 * SA, sd * (halfT + 0.008)],
        dir: [0, 0, sd],
        axis: "z",
        texture: sigil,
        name: "altarSigil",
      }),
      1.15,
    );
    // bronze belt and corner brackets
    if (sd > 0)
      b.part(new THREE.BoxGeometry(1.1 * SA, 0.045 * SA, 2 * halfT + 0.04), bronzePaint(t3 + 0.5 * SA, t3 + 0.55 * SA), {
        bone: root,
        at: [0, t3 + 0.525 * SA, 0],
        name: "altarBelt",
      });
    for (const sx of [1, -1]) {
      fixed.add(BRONZE_D, new THREE.BoxGeometry(0.07, 0.34 * SA, 0.07), V(sx * 0.32 * SA, t3 + 0.31 * SA, sd * (halfT - 0.01)));
      fixed.add(GOLD, new THREE.SphereGeometry(0.03, 6, 4), V(sx * 0.32 * SA, t3 + 0.2 * SA, sd * (halfT + 0.03)));
      fixed.add(GOLD, new THREE.SphereGeometry(0.03, 6, 4), V(sx * 0.32 * SA, t3 + 0.42 * SA, sd * (halfT + 0.03)));
      for (let k = 0; k < 4; k++) fixed.add(GOLD_L, rivetGeo, V(sx * (0.14 + k * 0.12) * SA, t3 + 0.525 * SA, sd * (halfT + 0.03)));
    }
  }
  for (const sx of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.26 * SA, 0.26 * SA), "#ffffff", {
        bone: root,
        at: [sx * (0.32 * SA + 0.008), t3 + 0.31 * SA, 0],
        dir: [sx, 0, 0],
        axis: "z",
        texture: sigil,
        name: "altarSigilSide",
      }),
      1.0,
    );
  b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.45, 0.04],
      [0.37, 0.07],
      [0.25, 0.12],
      [0.0, 0.12],
    ],
    { at: [0, altarTop, 0], segments: 8, spin: 22.5, color: bronzePaint(altarTop, altarTop + 0.12), bone: root, name: "cradle" },
  );
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const base = V(Math.cos(a) * 0.5, altarTop + 0.02, Math.sin(a) * 0.5);
    fixed.add(GOLD, new THREE.ConeGeometry(0.045, 0.36, 5), base.clone().add(V(0, 0.18, 0)), aim(V(Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35)));
  }
  glowSmall.add(GLOW, new THREE.CylinderGeometry(0.26, 0.26, 0.02, 8), V(0, altarTop + 0.125, 0), undefined, 1, 1.0);

  // floating crystal with halo rings and orbiting shards (own joints so they can spin)
  const orbitC = V(0, altarTop + 0.95, 0);
  const crystalJ = b.joint("crystal", { parent: root, at: orbitC, role: "hinge" });
  const haloJ = b.joint("halo", { parent: crystalJ, at: orbitC, role: "hinge" });
  const shardJ = b.joint("shards", { parent: crystalJ, at: orbitC, role: "hinge" });
  const crystalMerge = merger(crystalJ);
  crystalMerge.add(GLOW, new THREE.OctahedronGeometry(0.24, 0), orbitC.clone(), undefined, V(0.85, 1.6, 0.85), 1.5);
  crystalMerge.add(GLOW_W, new THREE.OctahedronGeometry(0.12, 0), orbitC.clone(), undefined, V(0.8, 1.55, 0.8), 2.0);
  crystalMerge.flush();
  const haloMerge = merger(haloJ);
  haloMerge.add(GOLD, new THREE.TorusGeometry(0.5, 0.02, 4, 20), orbitC.clone(), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 + 0.35, 0, 0.2)));
  haloMerge.add(GOLD, new THREE.TorusGeometry(0.4, 0.016, 4, 18), orbitC.clone(), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.5, 0.4, -0.3)));
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const ringPos = orbitC.clone().add(V(Math.cos(a) * 0.6, Math.sin(a * 2) * 0.06, Math.sin(a) * 0.6));
    haloMerge.add(GOLD_L, rivetGeo, ringPos, undefined, 1.1);
  }
  haloMerge.flush();
  const shardMerge = merger(shardJ);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.3;
    const r = 0.72 + (k % 2) * 0.1;
    const pos = orbitC.clone().add(V(Math.cos(a) * r, -0.15 + ((k * 37) % 5) * 0.09, Math.sin(a) * r));
    shardMerge.add(GLOW, new THREE.OctahedronGeometry(0.06, 0), pos, yaw(k), V(0.7, 1.5, 0.7), 1.4);
  }
  shardMerge.flush();
  // arcs of arcane energy from every crown crystal to the floating one
  for (const tip of crownPoints) {
    const horiz = V(tip.x, 0, tip.z).normalize();
    const end = orbitC.clone().addScaledVector(horiz, 0.2);
    const ctrl = V((tip.x + end.x) / 2, Math.max(tip.y, end.y) + 0.55, (tip.z + end.z) / 2);
    glow(b.sweep(bezier(tip, ctrl, end), 0.014, { color: GLOW, sides: 4, bone: root, name: "energyArc" }), 1.3);
  }

  // offerings on the lower steps: ram skull, candles, scroll
  function skull(pos: THREE.Vector3, face: THREE.Vector3, s: number, name: string) {
    const f = face.clone().setY(0).normalize();
    const xs = new THREE.Vector3().crossVectors(UP, f).normalize();
    const loc = (u: number, v: number, w: number) => pos.clone().addScaledVector(xs, u * s).addScaledVector(UP, v * s).addScaledVector(f, w * s);
    const q = basisQ(xs, UP, f);
    const m = merger(root);
    m.add(BONE, new THREE.SphereGeometry(0.1 * s, 7, 5), loc(0, 0.09, 0), q, V(1, 0.9, 1.1));
    m.add(BONE_D, new THREE.BoxGeometry(0.1 * s, 0.07 * s, 0.14 * s), loc(0, 0.04, 0.12), q);
    m.add(BONE, new THREE.BoxGeometry(0.085 * s, 0.03 * s, 0.13 * s), loc(0, -0.005, 0.1), q);
    for (const sd of [1, -1]) {
      m.add(DARK, new THREE.SphereGeometry(0.03 * s, 5, 4), loc(sd * 0.05, 0.1, 0.085), q);
      m.add(DARK, new THREE.SphereGeometry(0.012 * s, 4, 3), loc(sd * 0.025, 0.0, 0.19), q);
    }
    m.flush();
    for (const sd of [1, -1]) {
      const p0 = loc(sd * 0.07, 0.15, 0.0);
      const p1 = loc(sd * 0.2, 0.17, -0.04);
      const p2 = loc(sd * 0.26, 0.03, 0.04);
      const p3 = loc(sd * 0.17, -0.03, 0.13);
      b.sweep(catmull([p0, p1, p2, p3]), [0.035 * s, 0.01 * s], { color: BONE, bone: root, sides: 6, caps: { start: "flat", end: "point" }, name });
    }
  }
  skull(V(0, t2 + 0.0, 1.0), V(0, 0.15, 1), 1.0, "ramSkull");
  skull(V(0, t1 + 0.0, 1.3), V(0, 0.15, 1), 0.7, "ramSkullSmall");

  const candles = merger(root);
  for (const [cx, cz, cy] of [
    [0.48, 0.86, t2],
    [0.62, 0.78, t2],
    [-0.5, 0.84, t2],
    [-0.62, 0.76, t2],
    [0.0, -0.95, t2],
    [0.15, -0.9, t2],
    [-0.12, -0.92, t2],
  ] as const) {
    const ch = 0.1 + rnd() * 0.12;
    candles.add(BONE, new THREE.CylinderGeometry(0.03, 0.034, ch, 6), V(cx, cy + ch / 2, cz));
    candles.add(WOOD_D, new THREE.CylinderGeometry(0.003, 0.003, 0.03, 3), V(cx, cy + ch + 0.012, cz));
    candles.add(FIRE_L, new THREE.ConeGeometry(0.018, 0.06, 5), V(cx, cy + ch + 0.05, cz), undefined, undefined, 1.4);
    candles.add(BONE_D, new THREE.CylinderGeometry(0.04, 0.04, 0.012, 6), V(cx, cy + 0.006, cz));
  }
  candles.flush();
  // scroll and bowl of gems on the altar top rim
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), "#e9d9a8", {
    bone: root,
    at: [0.32, altarTop + 0.12, 0.2],
    rotation: [0, 70, 90],
    name: "scroll",
  });
  fixed.add(RED, new THREE.CylinderGeometry(0.038, 0.038, 0.03, 8), V(0.32, altarTop + 0.12, 0.2), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 1.2, Math.PI / 2)));

  // ---- braziers at the gaps
  const flames = merger(root);
  for (let k = 0; k < 4; k++) {
    const az = 45 + 90 * k;
    const c = polar(1.65, az);
    const topH = 0.62;
    for (let l = 0; l < 3; l++) {
      const a = (l / 3) * Math.PI * 2 + az * DEG;
      const foot = c.clone().add(V(Math.cos(a) * 0.2, G, Math.sin(a) * 0.2));
      b.rod(foot, c.clone().add(V(Math.cos(a) * 0.09, topH, Math.sin(a) * 0.09)), [0.022, 0.018], { color: IRON, bone: root, sides: 5, name: "brazierLeg" });
      fixed.add(BRONZE, rivetGeo, foot.clone().add(V(0, 0.02, 0)), undefined, 1.4);
    }
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.13, 0.04],
        [0.2, 0.17],
        [0.225, 0.22],
        [0.2, 0.22],
        [0.12, 0.14],
        [0, 0.12],
      ],
      { at: c.clone().add(V(0, topH - 0.02, 0)), segments: 8, color: IRON, bone: root, name: "brazierBowl" },
    );
    b.lathe(
      [
        [0.2, 0],
        [0.235, 0],
        [0.235, 0.035],
        [0.2, 0.035],
      ],
      { at: c.clone().add(V(0, topH + 0.17, 0)), segments: 8, color: GOLD, bone: root, name: "brazierRim" },
    );
    flames.add(EMBER, new THREE.SphereGeometry(0.17, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), c.clone().add(V(0, topH + 0.16, 0)), undefined, V(1, 0.5, 1), 1.2);
    flames.add(FIRE, new THREE.ConeGeometry(0.13, 0.44, 6), c.clone().add(V(0, topH + 0.38, 0)), undefined, undefined, 1.5);
    flames.add(FIRE, new THREE.ConeGeometry(0.08, 0.32, 5), c.clone().add(V(0.11, topH + 0.32, 0.04)), aim(V(0.25, 1, 0)), undefined, 1.5);
    flames.add(FIRE, new THREE.ConeGeometry(0.08, 0.28, 5), c.clone().add(V(-0.1, topH + 0.3, -0.05)), aim(V(-0.25, 1, 0.1)), undefined, 1.5);
    flames.add(FIRE_L, new THREE.ConeGeometry(0.075, 0.3, 5), c.clone().add(V(0, topH + 0.33, 0)), undefined, undefined, 1.8);
    for (let e = 0; e < 5; e++) {
      flames.add(FIRE_L, new THREE.OctahedronGeometry(0.014, 0), c.clone().add(V((rnd() - 0.5) * 0.3, topH + 0.7 + rnd() * 0.3, (rnd() - 0.5) * 0.3)), undefined, undefined, 1.8);
    }
  }
  flames.flush();

  // ---- entrance stakes with skulls and crimson banners
  const banner: OutlinePoint[] = [
    [-0.17, 0],
    [0.17, 0],
    [0.17, -0.7],
    [0.0, -0.58],
    [-0.17, -0.7],
  ];
  for (const sd of [1, -1]) {
    const pos = polar(3.15, sd * 30);
    b.sweep([pos, pos.clone().add(V(0, 2.0, 0))], [0.075, 0.05], {
      color: grain(WOOD_D, WOOD, { size: 0.06, axis: "y" }),
      bone: root,
      sides: 6,
      caps: "flat",
      name: "stake",
    });
    // stone cairn at its foot
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      fixed.add([STONE_M, "#6a7d9a", STONE_D][k % 3], rockGeo, pos.clone().add(V(Math.cos(a) * 0.17, 0.1, Math.sin(a) * 0.17)), yaw(k), V(1.1, 0.9, 1.1));
    }
    skull(pos.clone().add(V(0, 1.96, 0)), polar(1, sd * 30), 0.8, "stakeSkull");
    // crossbar and banner on a hinge joint
    const barY = 1.62;
    const swing = b.joint(sd > 0 ? "bannerL" : "bannerR", { parent: root, at: pos.clone().add(V(0, barY, 0)), role: "hinge" });
    const barDir = V(Math.cos(sd * 30 * DEG), 0, -Math.sin(sd * 30 * DEG));
    const outDir = polar(1, sd * 30);
    b.rod(pos.clone().addScaledVector(barDir, -0.26).setY(barY), pos.clone().addScaledVector(barDir, 0.26).setY(barY), 0.022, { color: WOOD_D, bone: swing, sides: 6, name: "crossbar" });
    for (const e of [-1, 1]) fixed.add(GOLD, new THREE.SphereGeometry(0.035, 6, 4), pos.clone().addScaledVector(barDir, e * 0.27).setY(barY));
    b.extrude(banner, {
      at: pos.clone().add(V(0, barY - 0.02, 0)).addScaledVector(outDir, 0.07),
      x: barDir,
      y: UP,
      thickness: 0.016,
      bevel: 0.004,
      color: paint((_p, n, s) => {
        const edge = Math.min(s[0] + 0.17, 0.17 - s[0], 0.0 - s[1] + 0.0);
        if (Math.abs(n.y) < 0.5 && Math.abs(n.dot(outDir)) < 0.5) return BRONZE_D;
        const borderDist = Math.min(0.17 - Math.abs(s[0]), -s[1]);
        if (borderDist < 0.022 || edge < 0.0) return GOLD;
        return mix(RED, RED_D, clamp(-s[1] / 0.7, 0, 1) * 0.6 + noise(new THREE.Vector3(s[0] * 3, s[1] * 3, 0), 0.4, 4) * 0.25);
      }),
      bone: swing,
      name: "banner",
    });
    b.part(new THREE.PlaneGeometry(0.2, 0.25), "#ffffff", {
      bone: swing,
      at: pos.clone().add(V(0, barY - 0.3, 0)).addScaledVector(outDir, 0.07 + 0.012),
      dir: outDir,
      axis: "z",
      texture: sigilGold,
      name: "bannerSigil",
    });
  }

  // ---- dressing: crystals, rocks, plants
  for (let k = 0; k < 5; k++) {
    const az = k * 72 + 20;
    const c = polar(2.95, az);
    c.y = 0.07;
    addCrystal(glowSmall, c, V(0.1, 1, 0.1), 1.3);
    addCrystal(glowSmall, c.clone().add(V(0.14, 0, 0.06)), V(0.5, 1, 0), 0.9);
    addCrystal(glowSmall, c.clone().add(V(-0.1, 0, 0.1)), V(-0.4, 1, 0.3), 0.75);
    for (let m = 0; m < 3; m++) {
      fixed.add([STONE_M, STONE_D, "#6a7d9a"][m], rockGeo, c.clone().add(V((rnd() - 0.5) * 0.4, 0.04, (rnd() - 0.5) * 0.4)), yaw(rnd() * 6), V(1.2, 0.8, 1.1));
    }
  }
  for (let k = 0; k < 26; k++) {
    const az = rnd() * 360;
    if (Math.abs(((az + 180) % 360) - 180) < 14) continue;
    const at = polar(2.8 + rnd() * 0.6, az);
    at.y = 0.07;
    fixed.add([STONE_M, STONE_D, "#6a7d9a", "#7f93b0"][k % 4], rockGeo, at, yaw(rnd() * 6), V(0.5 + rnd() * 0.8, 0.4 + rnd() * 0.5, 0.5 + rnd() * 0.8));
  }
  for (let k = 0; k < 190; k++) {
    const az = rnd() * 360;
    const rr = 2.76 + rnd() * 0.62;
    if (Math.abs(((az + 180) % 360) - 180) < 9 && rr < 2.9) continue;
    const at = polar(rr, az);
    at.y = 0.07;
    (k % 9 === 0 ? fernFrames : tuftFrames).push(frame(at, [0, 1, 0]));
  }
  for (let k = 0; k < 40; k++) {
    const at = polar(2.45 + rnd() * 0.2, rnd() * 360);
    at.y = G;
    tuftFrames.push(frame(at, [0, 1, 0]));
  }
  const flowerFrames: Frame[] = [];
  for (let k = 0; k < 22; k++) {
    const at = polar(2.85 + rnd() * 0.55, rnd() * 360);
    at.y = 0.07;
    flowerFrames.push(frame(at, [0, 1, 0]));
  }
  for (let k = 0; k < 4; k++) {
    const az = 20 + k * 90;
    const c = polar(3.0, az + 30);
    for (let m = 0; m < 5; m++) {
      const at = c.clone().add(V((rnd() - 0.5) * 0.3, 0.07, (rnd() - 0.5) * 0.3));
      const s = 0.6 + rnd() * 0.8;
      mushrooms.add(BONE, new THREE.CylinderGeometry(0.014 * s, 0.02 * s, 0.07 * s, 5), at.clone().add(V(0, 0.035 * s, 0)));
      mushrooms.add("#58d6ff", new THREE.SphereGeometry(0.05 * s, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), at.clone().add(V(0, 0.07 * s, 0)), undefined, V(1, 0.7, 1), 1.1);
    }
  }

  // cards
  b.cards(tuftFrames, grassTex, { size: [0.17, 0.2], lean: 8, flow: [0.2, -0.3, -1], cross: true, vary: 0.35, spin: 180, rng: rng(5), bone: root });
  b.cards(fernFrames, fernTex, { size: [0.3, 0.38], lean: 25, bend: 40, cross: true, vary: 0.3, spin: 180, rng: rng(6), bone: root });
  b.cards(flowerFrames, flowerTex, { size: [0.08, 0.22], lean: 5, cross: true, vary: 0.3, spin: 180, rng: rng(7), bone: root });
  b.cards(leafFrames, leafTex, { size: [0.1, 0.15], lean: 60, bend: 20, vary: 0.3, spin: 180, rng: rng(8), flow: [0, -0.5, -1], bone: root });
  [featherA, featherB].forEach((tex, n) => {
    const set = featherSets[n];
    b.cards(set.frames, tex, { size: [0.07, 0.26], lean: 180, flow: (_f, k) => set.flows[k], bend: 20, bone: root, sink: 0 });
  });

  fixed.flush();
  mushrooms.flush();
  glowSmall.flush();
  return b.root;
}
