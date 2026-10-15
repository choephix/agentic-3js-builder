import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { DEG, rng } from "../../../../src/math";
import { cells, grain, mix, noise, paint, patches, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall arcane bookcase with a starry back panel, twisted gold pillars, a moon-crowned pediment, shelves of tomes, scrolls, potions, glowing orbs, an armillary sphere and candles, with an owl in a wizard hat, a treasure chest, a scroll basket, an orb stand and a rug around it.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type Vec3 = [number, number, number];
type BoneName = "root" | "lid";

// Palette
const GOLD = "#f4c84e";
const GOLD_D = "#b9852c";
const CREAM = "#fff0cf";
const PAGE = "#f4e6c4";
const PARCH = "#f3e2b3";
const PARCH_D = "#d9b878";
const WAX = "#fff6e0";
const CYAN = "#7ff3ff";
const VIOLET = "#c79bff";
const GREEN_G = "#8dffb0";
const FLAME = "#ffb83b";
const FLAME_I = "#fff2b8";
const RED = "#c0304f";
const INK = "#22112f";
const IRON = "#3b3550";
const CORK = "#b98a5a";
const WHITE = "#ffffff";
const GLASS = "#bfe3f0";
const WOOD_D = "#5a3328";
const BOOKC = [
  "#c0304f",
  "#1fa6a0",
  "#4a3fa8",
  "#8a4fc7",
  "#2f8f5b",
  "#e8863a",
  "#4aa3e0",
  "#e86a9a",
  "#6b2f6f",
  "#b83a2e",
];
const OWL = "#b58b5e";
const OWL_L = "#f0d9b0";
const OWL_D = "#8a6240";

const celCache = new Map<string, ReturnType<typeof cel>>();
const C = (c: string) => {
  let p = celCache.get(c);
  if (!p) {
    p = cel(c);
    celCache.set(c, p);
  }
  return p;
};

// Paints
const WOOD_V = cel(grain("#9a5b44", "#7b4636", { size: 0.02, axis: "y", seed: 3 }));
const WOOD_H = cel(grain("#9a5b44", "#7b4636", { size: 0.02, axis: "x", seed: 4 }));
const STONE = cel(patches("#4b4468", "#5d557c", { size: 0.18, gap: 0.06, seed: 2 }));
const STARS = paint((p) => {
  let base = mix("#1a1b4a", "#3a2b80", smoothstep(0.2, 2.4, p.y));
  base = mix(base, "#5a3aa0", smoothstep(0.55, 0.8, noise(p, 0.45, 2)) * 0.6);
  const c = cells(p, 0.07, 5);
  if (c.id > 0.5 && c.d1 < 0.1 + 0.08 * c.id) return c.id > 0.8 ? "#9ff4ff" : "#ffe9a8";
  return base;
});
const RUG = paint((p) => {
  const dx = p.x;
  const dz = p.z - 0.2;
  const d = Math.hypot(dx, dz);
  const a = Math.atan2(dz, dx);
  if (d > 1.7) return "#e0a93c";
  if (d > 1.6) return "#3a2f7a";
  if (d > 1.55) return "#f4c84e";
  if (d > 1.4) {
    const k = (((a / (Math.PI * 2)) * 40) % 1 + 1) % 1;
    return Math.abs(k - 0.5) < 0.18 ? "#f4c84e" : "#1c8a8c";
  }
  if (d > 0.95) {
    const k = (((a / (Math.PI * 2)) * 12) % 1 + 1) % 1;
    const hw = (0.42 * (1.4 - d)) / 0.45 + 0.04;
    return Math.abs(k - 0.5) < hw ? "#f4c84e" : "#7c2145";
  }
  if (d > 0.9) return "#f4c84e";
  const star = 0.25 + 0.2 * Math.max(0, Math.cos(a * 8));
  return d < star ? "#f4c84e" : "#2b2a6e";
});
const WEAVE = paint((_p, _n, s) => ((Math.floor(s[0] * 20) + Math.floor(s[1] * 8)) % 2 ? "#c99a52" : "#a97a3c"));
const PILLAR = paint((_p, _n, s) => (((((s[1] - 1800 * s[0]) % 120) + 120) % 120 < 30 ? C(GOLD) : C("#6a3a8a"))));

// Textures
const orbTex = (inner: string, mid: string, outer: string) =>
  svg(
    `<svg viewBox="0 0 128 128"><defs><radialGradient id="g" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="${inner}"/><stop offset="0.45" stop-color="${mid}"/><stop offset="1" stop-color="${outer}"/></radialGradient></defs><rect width="128" height="128" fill="url(#g)"/><g stroke="#ffffff" stroke-opacity="0.55" stroke-width="3" fill="none" stroke-linecap="round"><path d="M0 50 Q32 20 64 52 T128 44"/><path d="M0 86 Q40 60 70 90 T128 80"/><path d="M10 110 Q50 96 90 118"/></g><g fill="#ffffff"><circle cx="30" cy="30" r="3"/><circle cx="92" cy="26" r="2.5"/><circle cx="60" cy="70" r="3"/><circle cx="104" cy="64" r="2.5"/><circle cx="20" cy="76" r="2"/><circle cx="76" cy="104" r="2.5"/></g></svg>`,
    { size: 256 },
  );
const ORB_CY = orbTex("#f4ffff", "#7ff3ff", "#2a7bd8");
const ORB_VI = orbTex("#fff0ff", "#c79bff", "#6a3ab8");
const ORB_GR = orbTex("#f4fff0", "#8dffb0", "#1f9a68");
const RUNES = svg(
  `<svg viewBox="0 0 40 160"><g stroke="#8ff7ff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="22" r="12"/><path d="M20 6 V38 M8 22 H32"/><path d="M8 62 L20 48 L32 62 L20 76 Z"/><path d="M20 48 V76"/><path d="M10 100 Q20 84 30 100 Q20 116 10 100 Z"/><circle cx="20" cy="100" r="3"/><path d="M10 128 L20 118 L30 128 M10 144 L20 134 L30 144"/></g></svg>`,
  { size: 512 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 120 100"><path d="M70 14 A38 38 0 1 0 90 76 A30 30 0 1 1 70 14 Z" fill="#ffd966" stroke="#fff3b0" stroke-width="2.5" stroke-linejoin="round"/><g fill="#7ff3ff" stroke="#ffffff" stroke-width="1.2"><path d="M96 22 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M104 62 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/><path d="M84 46 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/></g></svg>`,
  { size: 512 },
);
const PAGE_RUNES = svg(
  `<svg viewBox="0 0 60 80"><g stroke="#4fd8ff" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M8 10 H52 M8 20 H44 M8 30 H50"/><circle cx="30" cy="50" r="11"/><path d="M30 39 V61 M19 50 H41 M22 42 L38 58 M38 42 L22 58"/><path d="M8 72 H40"/></g></svg>`,
  { size: 256 },
);
const WEB = svg(
  `<svg viewBox="0 0 100 70"><g stroke="#eceaf5" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M0 0 L100 8"/><path d="M0 0 L88 40"/><path d="M0 0 L60 66"/><path d="M0 0 L25 70"/><path d="M0 0 L100 0"/><path d="M30 2 Q26 16 10 24"/><path d="M50 4 Q44 26 20 40"/><path d="M72 6 Q64 36 36 56"/><path d="M92 8 Q82 46 50 66"/></g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  // Chest lid hinge
  const CX = -1.3;
  const CZ = 0.58;
  const CW = 0.56;
  const CD = 0.34;
  const TOP = 0.252;
  const lid = b.joint("chestLid", { parent: root, at: [CX, TOP, CZ - CD / 2], dir: [0, 0, 1], role: "hinge" });
  const bones = { root, lid };

  // ---- geometry bag (merged per colour / glow / bone) ----
  const bag = new Map<string, THREE.BufferGeometry[]>();
  type Opts = { rot?: Vec3; s?: Vec3; m?: THREE.Matrix4; g?: number; bone?: BoneName };
  const add = (c: string, geo: THREE.BufferGeometry, at: Vec3, o: Opts = {}) => {
    const key = `${c}|${o.g ?? 0}|${o.bone ?? "root"}`;
    const r = o.rot ?? [0, 0, 0];
    const sc = o.s ?? [1, 1, 1];
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(at[0], at[1], at[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG)),
      new THREE.Vector3(sc[0], sc[1], sc[2]),
    );
    if (o.m) m.premultiply(o.m);
    geo.applyMatrix4(m);
    const list = bag.get(key);
    if (list) list.push(geo);
    else bag.set(key, [geo]);
  };
  const box = (c: string, w: number, h: number, d: number, at: Vec3, o: Opts = {}) =>
    add(c, new THREE.BoxGeometry(w, h, d), at, o);
  const ball = (c: string, r: number, at: Vec3, o: Opts = {}, seg: [number, number] = [8, 6]) =>
    add(c, new THREE.SphereGeometry(r, seg[0], seg[1]), at, o);
  const cyl = (c: string, rt: number, rb: number, h: number, at: Vec3, o: Opts = {}, seg = 8) =>
    add(c, new THREE.CylinderGeometry(rt, rb, h, seg), at, o);
  const lathe = (c: string, pts: number[][], at: Vec3, o: Opts = {}, seg = 10) =>
    add(
      c,
      new THREE.LatheGeometry(
        pts.map((p) => new THREE.Vector2(p[0], p[1])),
        seg,
      ),
      at,
      o,
    );
  const torus = (c: string, r: number, tube: number, at: Vec3, o: Opts = {}, arc = Math.PI * 2, seg = 20) =>
    add(c, new THREE.TorusGeometry(r, tube, 5, seg, arc), at, o);
  const frameM = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * DEG, ry * DEG, rz * DEG)),
      new THREE.Vector3(1, 1, 1),
    );
  const place = (geo: THREE.BufferGeometry, color: string, at: Vec3, name: string, opts: Record<string, unknown> = {}) =>
    b.part(geo, color, { bone: root, at, name, ...opts });

  // ---- small prop builders ----
  const flame = (x: number, y: number, z: number, s = 1) => {
    ball(FLAME, 0.011 * s, [x, y + 0.014 * s, z], { g: 1.4, s: [1, 1.7, 1] });
    cyl(FLAME, 0, 0.008 * s, 0.018 * s, [x, y + 0.033 * s, z], { g: 1.4 }, 6);
    ball(FLAME_I, 0.006 * s, [x, y + 0.011 * s, z], { g: 1.6, s: [1, 1.7, 1] });
  };
  const candle = (
    x: number,
    y0: number,
    z: number,
    h: number,
    r: number,
    col = WAX,
    holder = true,
    drips = 2,
  ) => {
    let y = y0;
    if (holder) {
      lathe(
        GOLD_D,
        [
          [0, 0],
          [0.03, 0],
          [0.03, 0.006],
          [0.014, 0.014],
          [0.012, 0.026],
          [0.024, 0.034],
          [0.024, 0.04],
          [0, 0.04],
        ],
        [x, y, z],
      );
      y += 0.034;
    }
    cyl(col, r, r * 1.04, h, [x, y + h / 2, z]);
    for (let k = 0; k < drips; k++) {
      const a = 0.6 + k * 2.3 + x * 13;
      ball(col, r * 0.34, [x + r * 0.98 * Math.cos(a), y + h - 0.02 - k * 0.018, z + r * 0.98 * Math.sin(a)], {
        s: [1, 2.4, 1],
      });
    }
    box(INK, 0.003, 0.012, 0.003, [x, y + h + 0.005, z]);
    flame(x, y + h + 0.008, z);
  };
  const book = (
    x: number,
    y0: number,
    zc: number,
    w: number,
    h: number,
    d: number,
    col: string,
    tilt: number,
    style: number,
  ) => {
    const m = { m: frameM(x, y0, zc, 0, 0, tilt) };
    box(col, w, h, 0.014, [0, h / 2, d / 2 - 0.007], m);
    for (const s of [1, -1]) box(col, 0.008, h, d, [s * (w / 2 - 0.004), h / 2, 0], m);
    box(PAGE, w - 0.014, h - 0.012, d - 0.012, [0, h / 2, 0], m);
    const gold = style % 2 === 0 ? GOLD : GOLD_D;
    box(gold, w + 0.004, 0.011, 0.004, [0, h * 0.14, d / 2], m);
    box(gold, w + 0.004, 0.011, 0.004, [0, h * 0.86, d / 2], m);
    if (style === 1 || style === 3) {
      box(gold, w + 0.004, 0.006, 0.004, [0, h * 0.22, d / 2], m);
      box(gold, w + 0.004, 0.006, 0.004, [0, h * 0.78, d / 2], m);
    }
    if (style === 0) ball(CYAN, 0.008, [0, h * 0.5, d / 2 + 0.002], { ...m, g: 1, s: [1, 1, 0.6] });
    if (style === 2) {
      box(CREAM, w * 0.7, h * 0.26, 0.004, [0, h * 0.5, d / 2 + 0.001], m);
      box(INK, w * 0.5, 0.004, 0.005, [0, h * 0.53, d / 2 + 0.002], m);
      box(INK, w * 0.4, 0.004, 0.005, [0, h * 0.47, d / 2 + 0.002], m);
    }
    if (style === 3) box(GOLD, 0.014, 0.014, 0.005, [0, h * 0.5, d / 2 + 0.001], { ...m, rot: [0, 0, 45] });
  };
  const fillBooks = (x0: number, x1: number, y0: number, hMax: number) => {
    let x = x0;
    for (;;) {
      const w = 0.026 + R() * 0.028;
      if (x + w > x1) break;
      const h = hMax * (0.6 + R() * 0.4);
      const d = 0.2 + R() * 0.05;
      const col = BOOKC[Math.floor(R() * BOOKC.length)];
      book(x + w / 2, y0, -0.14 + d / 2, w, h, d, col, 0, Math.floor(R() * 4));
      x += w + 0.002;
    }
    if (x1 - x > 0.05) {
      const d = 0.22;
      book(x + 0.04, y0 + 0.003, -0.14 + d / 2, 0.034, hMax * 0.85, d, BOOKC[Math.floor(R() * BOOKC.length)], -15, 2);
    }
  };
  const lying = (x: number, y0: number, z: number, len: number, t: number, d: number, col: string, yaw: number) => {
    const m = { m: frameM(x, y0, z, 0, yaw, 0) };
    box(col, len, t, 0.014, [0, t / 2, d / 2 - 0.007], m);
    box(col, len, 0.008, d, [0, 0.004, 0], m);
    box(col, len, 0.008, d, [0, t - 0.004, 0], m);
    box(PAGE, len - 0.014, t - 0.012, d - 0.012, [0, t / 2, 0], m);
    for (const s of [1, -1]) box(GOLD, 0.012, t + 0.003, 0.004, [s * len * 0.3, t / 2, d / 2], m);
    box(CREAM, len * 0.3, t * 0.55, 0.004, [0, t / 2, d / 2 + 0.001], m);
    box(GOLD, 0.014, 0.014, 0.004, [0, t - 0.004, 0.0], { ...m, rot: [0, 0, 45] });
    return y0 + t;
  };
  const scroll = (x: number, y: number, z: number, len: number, r: number, ribbon: string, yaw = 0) => {
    const m = { m: frameM(x, y, z, 0, yaw, 0) };
    cyl(PARCH, r, r, len, [0, 0, 0], { ...m, rot: [90, 0, 0] });
    cyl(PARCH_D, r * 0.6, r * 0.6, len + 0.006, [0, 0, 0], { ...m, rot: [90, 0, 0] });
    cyl(ribbon, r * 1.1, r * 1.1, 0.014, [0, 0, -len * 0.14], { ...m, rot: [90, 0, 0] });
    cyl(RED, r * 0.32, r * 0.32, 0.006, [0, r * 1.1, -len * 0.14], m, 6);
  };
  const potion = (x: number, y0: number, z: number, r: number, col: string, g: number, tall = 1) => {
    ball(col, r, [x, y0 + r, z], { g });
    cyl(CREAM, r * 1.01, r * 1.01, r * 0.4, [x, y0 + r, z], {}, 8);
    const nh = r * tall;
    cyl(g > 0 ? GLASS : col, r * 0.32, r * 0.42, nh, [x, y0 + r * 1.6 + nh / 2, z]);
    cyl(CORK, r * 0.34, r * 0.28, r * 0.4, [x, y0 + r * 1.6 + nh + r * 0.12, z]);
    ball(WHITE, r * 0.18, [x - r * 0.4, y0 + r * 1.3, z + r * 0.85], { s: [0.7, 1.4, 0.4] });
  };
  const shelfOrb = (x: number, y0: number, z: number, r: number, tex: THREE.Texture) => {
    const hs = r * 0.45;
    lathe(
      GOLD_D,
      [
        [0, 0],
        [r * 0.9, 0],
        [r * 0.9, 0.01],
        [r * 0.5, 0.025],
        [r * 0.22, 0.05],
        [r * 0.22, hs - 0.02],
        [r * 0.7, hs],
        [r * 0.75, hs + 0.012],
        [r * 0.55, hs + 0.02],
        [0, hs + 0.02],
      ],
      [x, y0, z],
    );
    const cy = y0 + hs + r * 0.78;
    glow(place(new THREE.SphereGeometry(r, 12, 9), WHITE, [x, cy, z], "orb", { texture: tex }), 1);
    ball(WHITE, r * 0.14, [x - r * 0.4, cy + r * 0.45, z + r * 0.75], { s: [0.8, 1.5, 0.4], g: 1 });
  };
  const sparkle = (x: number, y: number, z: number, s: number, c: string) => {
    ball(c, 0.012 * s, [x, y, z], { g: 1.3, s: [0.5, 1.8, 0.5] }, [4, 2]);
    ball(c, 0.012 * s, [x, y, z], { g: 1.3, s: [1.8, 0.5, 0.5] }, [4, 2]);
  };

  // =========================================================================
  // Rug and plinth
  // =========================================================================
  place(new THREE.CylinderGeometry(1.75, 1.75, 0.012, 32), RUG as unknown as string, [0, 0.006, 0.2], "rug");
  place(new THREE.BoxGeometry(2.04, 0.12, 0.46), STONE as unknown as string, [0, 0.06, 0], "plinth");
  box(GOLD, 2.06, 0.014, 0.012, [0, 0.12, 0.236]);
  for (const s of [1, -1]) for (const z of [-0.2, 0.2]) ball(GOLD, 0.02, [s * 0.98, 0.1, z]);

  // Carcass
  for (const s of [1, -1]) {
    place(new THREE.BoxGeometry(0.1, 1.98, 0.3), WOOD_V as unknown as string, [s * 0.83, 1.11, 0], "side");
  }
  place(new THREE.BoxGeometry(1.56, 0.14, 0.3), WOOD_H as unknown as string, [0, 0.18, 0], "base");
  for (const y of [0.68, 1.13, 1.58]) place(new THREE.BoxGeometry(1.56, 0.04, 0.3), WOOD_H as unknown as string, [0, y, 0], "shelf");
  place(new THREE.BoxGeometry(1.96, 0.06, 0.38), WOOD_H as unknown as string, [0, 2.07, 0], "top");
  place(new THREE.BoxGeometry(1.56, 1.79, 0.02), STARS as unknown as string, [0, 1.145, -0.155], "back");

  // gold trims on shelves and top
  box(GOLD, 1.98, 0.03, 0.012, [0, 2.065, 0.192]);
  for (let x = -0.9; x <= 0.91; x += 0.15) ball(GOLD, 0.011, [x, 2.065, 0.2]);
  box(GOLD, 1.58, 0.016, 0.008, [0, 0.19, 0.153]);
  for (const y of [0.68, 1.13, 1.58]) {
    box(GOLD, 1.56, 0.016, 0.008, [0, y, 0.153]);
    for (let x = -0.7; x < 0.71; x += 0.14) ball(GOLD, 0.008, [x, y, 0.158]);
    for (const s of [1, -1]) ball(GOLD, 0.014, [s * 0.77, y - 0.03, 0.14]);
  }
  // base inlay
  for (const x of [-0.5, 0, 0.5]) {
    box(GOLD, 0.06, 0.06, 0.006, [x, 0.18, 0.154], { rot: [0, 0, 45] });
    box(CYAN, 0.02, 0.02, 0.006, [x, 0.18, 0.158], { rot: [0, 0, 45], g: 1 });
  }
  for (const x of [-0.25, 0.25]) box(GOLD_D, 0.3, 0.008, 0.004, [x, 0.18, 0.154]);

  // side panels: frame + runes
  for (const s of [1, -1]) {
    const x = s * 0.887;
    box(GOLD, 0.008, 0.012, 0.22, [x, 1.9, 0]);
    box(GOLD, 0.008, 0.012, 0.22, [x, 0.4, 0]);
    for (const z of [-0.1, 0.1]) box(GOLD, 0.008, 1.5, 0.012, [x, 1.15, z]);
    for (const y of [1.9, 0.4]) for (const z of [-0.1, 0.1]) ball(GOLD, 0.013, [x, y, z]);
    glow(
      place(new THREE.PlaneGeometry(0.14, 0.7), WHITE, [s * 0.8935, 1.15, 0], "runes", {
        texture: RUNES,
        dir: [s, 0, 0],
        axis: "z",
      }),
      0.9,
    );
  }

  // pillars
  for (const s of [1, -1]) {
    const x = s * 0.915;
    b.rod([x, 0.19, 0.15], [x, 2.04, 0.15], 0.045, { color: PILLAR, bone: root, sides: 10, name: "pillar" });
    lathe(
      GOLD,
      [
        [0, 0],
        [0.07, 0],
        [0.07, 0.02],
        [0.055, 0.035],
        [0.05, 0.07],
        [0, 0.07],
      ],
      [x, 0.12, 0.15],
    );
    lathe(
      GOLD,
      [
        [0, 0],
        [0.05, 0],
        [0.058, 0.03],
        [0.075, 0.05],
        [0.075, 0.07],
        [0, 0.07],
      ],
      [x, 1.97, 0.15],
    );
    lathe(
      GOLD,
      [
        [0, 0],
        [0.04, 0],
        [0.04, 0.01],
        [0.02, 0.03],
        [0.02, 0.045],
        [0.03, 0.06],
        [0, 0.06],
      ],
      [x, 2.1, 0.15],
    );
    ball(CYAN, 0.03, [x, 2.165, 0.15], { g: 1.2, s: [1, 1.3, 1] });
  }

  // crown
  const crownOutline = (hw: number, lift: number): OutlinePoint[] => {
    const pts: OutlinePoint[] = [[-hw, 0]];
    const N = 12;
    for (let i = 0; i <= N; i++) {
      const x = -hw + (2 * hw * i) / N;
      const u = Math.min(1, Math.abs(x) / hw);
      const y = 0.1 + lift + 0.32 * (1 - Math.pow(u, 2.2)) + 0.1 * Math.max(0, 1 - Math.abs(x) / 0.16);
      pts.push(i === N / 2 ? [0, y, "sharp"] : [x, y]);
    }
    pts.push([hw, 0]);
    return pts;
  };
  b.extrude(crownOutline(0.62, 0), {
    at: [0, 2.1, -0.05],
    x: [1, 0, 0],
    thickness: 0.07,
    color: STARS,
    bone: root,
    name: "crown",
  });
  b.extrude(crownOutline(0.66, 0.035), {
    at: [0, 2.1, -0.065],
    x: [1, 0, 0],
    thickness: 0.05,
    color: C(GOLD),
    bone: root,
    name: "crownRim",
  });
  glow(
    place(new THREE.PlaneGeometry(0.34, 0.283), WHITE, [0, 2.32, -0.0105], "emblem", {
      texture: EMBLEM,
      dir: [0, 0, 1],
      axis: "z",
    }),
    0.8,
  );
  for (let x = -0.54; x <= 0.55; x += 0.09) {
    if (Math.abs(x) < 0.2) continue;
    const u = Math.abs(x) / 0.62;
    const y = 0.1 + 0.32 * (1 - Math.pow(u, 2.2)) - 0.035;
    ball(GOLD, 0.01, [x, 2.1 + y, -0.011]);
  }
  for (const s of [1, -1]) {
    cyl(GOLD, 0, 0.03, 0.18, [s * 0.66, 2.19, -0.04], {}, 6);
    ball(CYAN, 0.014, [s * 0.66, 2.3, -0.04], { g: 1.2 });
  }
  ball(CYAN, 0.045, [0, 2.7, -0.045], { g: 1.4, s: [0.8, 1.7, 0.8] }, [6, 4]);
  cyl(GOLD, 0.02, 0.03, 0.03, [0, 2.65, -0.045], {}, 6);

  // =========================================================================
  // Shelf contents
  // =========================================================================
  const Y0 = 0.25;
  const Y1 = 0.7;
  const Y2 = 1.15;
  const Y3 = 1.6;

  // Row 0
  fillBooks(-0.76, -0.2, Y0, 0.4);
  // cauldron
  lathe(
    IRON,
    [
      [0, 0.03],
      [0.04, 0.03],
      [0.075, 0.07],
      [0.088, 0.12],
      [0.08, 0.172],
      [0.07, 0.172],
      [0.07, 0.15],
      [0, 0.15],
    ],
    [0.02, Y0, 0.0],
    {},
    10,
  );
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    cyl(IRON, 0.008, 0.014, 0.04, [0.02 + 0.05 * Math.cos(a), Y0 + 0.02, 0.05 * Math.sin(a)], {}, 5);
  }
  cyl(GREEN_G, 0.068, 0.068, 0.004, [0.02, Y0 + 0.152, 0], { g: 1.1 }, 10);
  for (const [bx, bz, br] of [
    [0.0, 0.02, 0.012],
    [0.04, -0.02, 0.009],
    [0.03, 0.03, 0.007],
  ])
    ball(GREEN_G, br, [bx, Y0 + 0.158, bz], { g: 1.2 });
  torus(IRON, 0.085, 0.004, [0.02, Y0 + 0.15, 0], {}, Math.PI, 12);
  potion(0.2, Y0, 0.0, 0.035, "#e0335f", 0, 1.2);
  potion(0.28, Y0, 0.02, 0.03, "#48e0c0", 1);
  // lying stack with candle
  let ty = Y0;
  ty = lying(0.57, ty, 0.0, 0.3, 0.05, 0.2, "#4a3fa8", 0);
  ty = lying(0.58, ty, 0.0, 0.27, 0.045, 0.19, "#c0304f", 8);
  ty = lying(0.56, ty, 0.0, 0.29, 0.05, 0.2, "#2f8f5b", -6);
  candle(0.6, ty, 0.0, 0.1, 0.014, WAX, true, 2);

  // Row 1
  scroll(-0.7, Y1 + 0.03, 0.02, 0.22, 0.028, "#c0304f");
  scroll(-0.64, Y1 + 0.03, 0.02, 0.22, 0.028, "#1fa6a0");
  scroll(-0.58, Y1 + 0.03, 0.02, 0.22, 0.028, "#8a4fc7");
  scroll(-0.67, Y1 + 0.082, 0.02, 0.22, 0.028, "#e8863a");
  scroll(-0.61, Y1 + 0.082, 0.02, 0.22, 0.028, "#4aa3e0");
  scroll(-0.64, Y1 + 0.134, 0.02, 0.22, 0.028, "#2f8f5b");
  fillBooks(-0.5, 0.0, Y1, 0.38);
  // lectern + open spellbook
  lathe(
    GOLD_D,
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.01],
      [0.015, 0.03],
      [0.015, 0.1],
      [0.03, 0.12],
      [0, 0.12],
    ],
    [0.3, Y1, 0.0],
  );
  const LP = frameM(0.3, Y1 + 0.13, 0.0, 55, 0, 0);
  box(GOLD_D, 0.18, 0.01, 0.13, [0, 0, 0], { m: LP });
  for (const s of [1, -1]) {
    box("#6a3a8a", 0.088, 0.008, 0.124, [s * 0.044, 0.009, 0], { m: LP });
    box(PAGE, 0.082, 0.012, 0.112, [s * 0.043, 0.017, 0], { m: LP, rot: [0, 0, s * 6] });
  }
  box(GOLD, 0.008, 0.012, 0.126, [0, 0.012, 0], { m: LP });
  const nrm = new THREE.Vector3(0, Math.cos(55 * DEG), Math.sin(55 * DEG));
  for (const s of [1, -1]) {
    const pos = new THREE.Vector3(s * 0.043, 0.04, 0).applyMatrix4(LP);
    glow(
      place(new THREE.PlaneGeometry(0.07, 0.093), WHITE, [pos.x, pos.y, pos.z], "pageRunes", {
        texture: PAGE_RUNES,
        dir: nrm,
        axis: "z",
      }),
      0.9,
    );
  }
  candle(0.44, Y1, 0.02, 0.09, 0.013, "#e86a9a", true, 2);
  shelfOrb(0.58, Y1, 0.0, 0.07, ORB_GR);

  // Row 2
  fillBooks(-0.76, -0.05, Y2, 0.38);
  // hourglass
  const HX = 0.1;
  cyl(GOLD, 0.05, 0.05, 0.012, [HX, Y2 + 0.006, 0]);
  cyl(GOLD, 0.05, 0.05, 0.012, [HX, Y2 + 0.2, 0]);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    cyl(GOLD_D, 0.005, 0.005, 0.19, [HX + 0.042 * Math.cos(a), Y2 + 0.103, 0.042 * Math.sin(a)], {}, 5);
  }
  cyl(GOLD, 0.036, 0.005, 0.085, [HX, Y2 + 0.153, 0], { g: 0.7 }, 8);
  cyl(GLASS, 0.005, 0.036, 0.085, [HX, Y2 + 0.058, 0], {}, 8);
  cyl(GOLD, 0.0035, 0.0035, 0.05, [HX, Y2 + 0.1, 0], { g: 1 }, 4);
  // potions
  potion(0.28, Y2, 0.0, 0.032, "#b58aff", 1, 1.3);
  potion(0.35, Y2, 0.02, 0.027, "#ff9a3c", 0, 1.5);
  potion(0.42, Y2, 0.0, 0.034, "#5ad0ff", 1, 1.1);
  // ink pot with quill on lying stack
  let t2 = Y2;
  t2 = lying(0.64, t2, 0.0, 0.27, 0.05, 0.2, "#6b2f6f", 0);
  t2 = lying(0.63, t2, 0.0, 0.24, 0.045, 0.18, "#e8863a", 10);
  lathe(
    INK,
    [
      [0, 0],
      [0.035, 0],
      [0.04, 0.02],
      [0.03, 0.04],
      [0.02, 0.045],
      [0.02, 0.05],
      [0, 0.05],
    ],
    [0.62, t2, 0.02],
  );
  cyl(CREAM, 0.004, 0.0015, 0.2, [0.64, t2 + 0.14, 0.02], { rot: [0, 0, -18] }, 5);
  cyl("#7ff3ff", 0.022, 0.002, 0.1, [0.675, t2 + 0.2, 0.02], { rot: [0, 0, -18], s: [0.4, 1, 1] }, 4);

  // Row 3
  fillBooks(-0.76, -0.5, Y3, 0.3);
  shelfOrb(-0.3, Y3, 0.0, 0.07, ORB_VI);
  // armillary sphere
  lathe(
    GOLD_D,
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.01],
      [0.02, 0.03],
      [0.012, 0.1],
      [0, 0.1],
    ],
    [0, Y3, 0],
  );
  const AY = Y3 + 0.2;
  torus(GOLD, 0.1, 0.0045, [0, AY, 0], { rot: [0, 0, 0] }, Math.PI * 2, 24);
  torus(GOLD, 0.1, 0.0045, [0, AY, 0], { rot: [0, 90, 0] }, Math.PI * 2, 24);
  torus(GOLD, 0.1, 0.0045, [0, AY, 0], { rot: [90, 0, 0] }, Math.PI * 2, 24);
  torus(GOLD_D, 0.085, 0.004, [0, AY, 0], { rot: [60, 0, 20] }, Math.PI * 2, 24);
  cyl(GOLD_D, 0.004, 0.004, 0.26, [0, AY, 0], { rot: [0, 0, 23] }, 5);
  ball(VIOLET, 0.03, [0, AY, 0], { g: 1.2 });
  ball(CYAN, 0.011, [0.1, AY, 0], { g: 1 });
  ball(GOLD, 0.009, [0, AY + 0.1, 0]);
  shelfOrb(0.3, Y3, 0.0, 0.07, ORB_CY);
  // candles on a small stack
  let t3 = Y3;
  t3 = lying(0.62, t3, 0.0, 0.26, 0.045, 0.18, "#1fa6a0", 0);
  t3 = lying(0.61, t3, 0.0, 0.22, 0.04, 0.17, "#8a4fc7", -8);
  candle(0.54, t3, 0.0, 0.1, 0.014, WAX, true, 2);
  candle(0.62, t3, 0.02, 0.16, 0.015, "#e9d4ff", true, 3);
  candle(0.7, t3, -0.01, 0.07, 0.013, WAX, true, 1);

  // pendants under the top board
  for (const [px, col] of [
    [-0.17, VIOLET],
    [0.17, CYAN],
  ] as const) {
    cyl(GOLD, 0.0025, 0.0025, 0.1, [px, 1.99, 0], {}, 4);
    ball(GOLD, 0.01, [px, 2.04, 0]);
    ball(col, 0.028, [px, 1.925, 0], { g: 1.3, s: [0.6, 1.4, 0.6] }, [6, 4]);
  }

  // cobweb
  place(new THREE.PlaneGeometry(0.22, 0.154), WHITE, [-0.66, 1.963, -0.132], "web", { texture: WEB });

  // =========================================================================
  // Top shoulders: candelabra and owl
  // =========================================================================
  const KX = -0.78;
  const KY = 2.1;
  lathe(
    GOLD,
    [
      [0, 0],
      [0.06, 0],
      [0.06, 0.012],
      [0.03, 0.03],
      [0.014, 0.06],
      [0.014, 0.2],
      [0.03, 0.215],
      [0.03, 0.225],
      [0, 0.225],
    ],
    [KX, KY, 0],
  );
  for (const s of [1, -1]) {
    torus(GOLD, 0.065, 0.006, [KX + s * 0.065, KY + 0.19, 0], { rot: [0, 0, 180] }, Math.PI, 12);
    candle(KX + s * 0.13, KY + 0.18, 0, 0.1, 0.013, WAX, true, 2);
  }
  candle(KX, KY + 0.225, 0, 0.15, 0.015, "#e9d4ff", false, 3);
  ball(WAX, 0.04, [KX + 0.1, KY + 0.004, 0.06], { s: [1, 0.2, 1] });

  // owl in wizard hat
  const OX = 0.76;
  const OY = 2.1;
  ball(OWL, 0.06, [OX, OY + 0.085, 0], { s: [1, 1.35, 0.95] }, [10, 8]);
  ball(OWL_L, 0.05, [OX, OY + 0.075, 0.022], { s: [0.9, 1.3, 0.7] }, [10, 8]);
  ball(OWL, 0.052, [OX, OY + 0.17, 0.006], { s: [1.2, 1, 1] }, [10, 8]);
  for (const s of [1, -1]) {
    cyl(OWL_L, 0.026, 0.026, 0.006, [OX + s * 0.025, OY + 0.172, 0.043], { rot: [90, 0, 0] }, 10);
    ball(GOLD, 0.016, [OX + s * 0.025, OY + 0.172, 0.048], { g: 1 });
    ball(INK, 0.008, [OX + s * 0.025, OY + 0.172, 0.062], { s: [1, 1.3, 0.5] });
    ball(OWL_D, 0.03, [OX + s * 0.058, OY + 0.085, -0.01], { s: [0.45, 1.6, 0.9], rot: [0, 0, -s * 10] });
    box(GOLD_D, 0.016, 0.01, 0.026, [OX + s * 0.025, OY + 0.005, 0.03]);
    cyl(OWL_D, 0, 0.014, 0.05, [OX + s * 0.04, OY + 0.2, 0.0], { rot: [0, 0, -s * 25] }, 5);
  }
  cyl("#f09a30", 0, 0.01, 0.026, [OX, OY + 0.155, 0.066], { rot: [90, 0, 0] }, 5);
  box(OWL_D, 0.05, 0.03, 0.05, [OX, OY + 0.025, -0.05], { rot: [30, 0, 0] });
  cyl(GOLD, 0.075, 0.075, 0.008, [OX, OY + 0.207, 0.0], { rot: [-6, 0, 0] }, 12);
  cyl("#5b3fa0", 0, 0.05, 0.12, [OX, OY + 0.267, -0.012], { rot: [-10, 0, 0] }, 10);
  cyl(GOLD, 0.052, 0.054, 0.012, [OX, OY + 0.218, 0.0], { rot: [-6, 0, 0] }, 10);
  sparkle(OX, OY + 0.345, -0.04, 0.8, GOLD);

  // floating sparkles around the crown
  for (const [sx, sy, sz, ss, sc] of [
    [-0.45, 2.75, 0.1, 1, CYAN],
    [0.5, 2.8, 0.12, 1.2, GOLD],
    [-0.2, 2.9, 0.15, 0.8, VIOLET],
    [0.25, 2.65, 0.18, 0.8, CYAN],
    [-0.9, 2.55, 0.2, 0.9, GOLD],
    [0.95, 2.5, 0.2, 1, CYAN],
    [-1.05, 2.9, 0.1, 0.7, VIOLET],
    [1.0, 2.85, 0.05, 0.8, GOLD],
  ] as const)
    sparkle(sx, sy, sz, ss, sc);

  // =========================================================================
  // Floor props
  // =========================================================================
  // chest body
  const CY = 0.012;
  box(WOOD_D, CW, TOP - CY, CD, [CX, (TOP + CY) / 2, CZ]);
  for (const s of [1, -1]) {
    box(GOLD_D, 0.04, TOP - CY + 0.008, CD + 0.008, [CX + s * 0.2, (TOP + CY) / 2, CZ]);
    for (const z of [-1, 1]) ball(GOLD, 0.012, [CX + s * 0.2, TOP - 0.01, CZ + z * (CD / 2 + 0.006)]);
  }
  box(GOLD, 0.05, 0.075, 0.008, [CX, TOP - 0.05, CZ + CD / 2 + 0.004]);
  box(INK, 0.008, 0.02, 0.004, [CX, TOP - 0.055, CZ + CD / 2 + 0.009]);
  // coins
  for (let k = 0; k < 16; k++) {
    const cx = CX + (R() - 0.5) * 0.4;
    const cz = CZ + (R() - 0.5) * 0.2;
    cyl(GOLD, 0.02, 0.02, 0.004, [cx, TOP + 0.004 + R() * 0.03, cz], { g: 0.8, rot: [R() * 40 - 20, 0, R() * 40 - 20] }, 8);
  }
  ball(RED, 0.016, [CX - 0.08, TOP + 0.03, CZ + 0.05], { g: 1 });
  ball(CYAN, 0.014, [CX + 0.1, TOP + 0.035, CZ - 0.03], { g: 1 });
  // lid (rides hinge joint)
  const LB: BoneName = "lid";
  const lidGeo = (r: number, len: number) => new THREE.CylinderGeometry(r, r, len, 10, 1, false, -Math.PI / 2, Math.PI);
  add(WOOD_D, lidGeo(CD / 2, CW), [CX, TOP, CZ], { rot: [-90, 0, 90], bone: LB });
  box(WOOD_D, CW, 0.012, CD, [CX, TOP + 0.006, CZ], { bone: LB });
  for (const s of [1, -1]) add(GOLD_D, lidGeo(CD / 2 + 0.005, 0.04), [CX + s * 0.2, TOP, CZ], { rot: [-90, 0, 90], bone: LB });
  ball(GOLD, 0.014, [CX, TOP + 0.01, CZ + CD / 2 - 0.004], { bone: LB });

  // floor tome stack with candle
  const SX = -0.7;
  const SZ = 0.6;
  let fy = CY;
  fy = lying(SX, fy, SZ, 0.34, 0.07, 0.25, "#c0304f", 0);
  fy = lying(SX + 0.01, fy, SZ, 0.3, 0.06, 0.23, "#1fa6a0", 14);
  fy = lying(SX - 0.01, fy, SZ, 0.32, 0.065, 0.24, "#4a3fa8", -10);
  fy = lying(SX, fy, SZ, 0.26, 0.055, 0.2, "#8a4fc7", 22);
  fy = lying(SX, fy, SZ, 0.24, 0.05, 0.18, "#2f8f5b", -18);
  ball(WAX, 0.04, [SX, fy + 0.004, SZ], { s: [1, 0.25, 1] });
  candle(SX, fy, SZ, 0.12, 0.022, WAX, false, 3);
  // loose scrolls and an unrolled parchment
  scroll(-0.1, CY + 0.03, 0.85, 0.36, 0.03, "#c0304f", 20);
  scroll(-0.2, CY + 0.03, 0.8, 0.3, 0.026, "#4aa3e0", -25);
  const PM = { m: frameM(0.45, CY + 0.003, 0.85, 0, -15, 0) };
  box(PARCH, 0.32, 0.004, 0.22, [0, 0, 0], PM);
  for (let k = 0; k < 6; k++) box(INK, 0.22 - (k % 3) * 0.04, 0.0015, 0.006, [-0.02, 0.003, -0.08 + k * 0.03], PM);
  cyl(PARCH, 0.016, 0.016, 0.22, [-0.16, 0.012, 0], { m: PM.m, rot: [90, 0, 0] });
  cyl(PARCH, 0.016, 0.016, 0.22, [0.16, 0.012, 0], { m: PM.m, rot: [90, 0, 0] });
  box(GOLD, 0.03, 0.03, 0.006, [0.08, 0.005, 0.07], { m: PM.m, rot: [-90, 0, 45], g: 0 });

  // scroll basket
  const BX = 0.85;
  const BZ = 0.5;
  place(new THREE.CylinderGeometry(0.1, 0.085, 0.3, 12, 1, false), WEAVE as unknown as string, [BX, CY + 0.15, BZ], "basket");
  torus(WOOD_D, 0.1, 0.008, [BX, CY + 0.3, BZ], { rot: [90, 0, 0] }, Math.PI * 2, 12);
  torus(WOOD_D, 0.085, 0.006, [BX, CY + 0.01, BZ], { rot: [90, 0, 0] }, Math.PI * 2, 12);
  cyl(INK, 0.092, 0.092, 0.004, [BX, CY + 0.3, BZ], {}, 12);
  const sc = ["#c0304f", "#1fa6a0", "#e8863a", "#8a4fc7", "#4aa3e0"];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const px = BX + 0.04 * Math.cos(a);
    const pz = BZ + 0.04 * Math.sin(a);
    const hh = 0.24 + (k % 3) * 0.04;
    cyl(PARCH, 0.02, 0.02, hh, [px, CY + 0.2 + hh / 2, pz], { rot: [0, 0, (k - 2) * 3] }, 8);
    cyl(PARCH_D, 0.011, 0.011, hh + 0.004, [px, CY + 0.2 + hh / 2, pz], { rot: [0, 0, (k - 2) * 3] }, 8);
    cyl(sc[k], 0.022, 0.022, 0.014, [px + (k - 2) * 0.004, CY + 0.2 + hh * 0.7, pz], { rot: [0, 0, (k - 2) * 3] }, 8);
  }

  // big crystal orb on a tripod
  const GX = 1.25;
  const GZ = 0.55;
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    b.rod(
      [GX + 0.17 * Math.cos(a), CY, GZ + 0.17 * Math.sin(a)],
      [GX + 0.05 * Math.cos(a), 0.52, GZ + 0.05 * Math.sin(a)],
      0.012,
      { color: C(GOLD_D), bone: root, sides: 6, name: "tripodLeg" },
    );
    ball(GOLD, 0.016, [GX + 0.17 * Math.cos(a), CY + 0.01, GZ + 0.17 * Math.sin(a)]);
  }
  lathe(
    GOLD,
    [
      [0, 0],
      [0.07, 0],
      [0.075, 0.02],
      [0.1, 0.05],
      [0.1, 0.06],
      [0.06, 0.05],
      [0, 0.05],
    ],
    [GX, 0.49, GZ],
  );
  glow(place(new THREE.SphereGeometry(0.16, 14, 10), WHITE, [GX, 0.7, GZ], "bigOrb", { texture: ORB_CY }), 1.1);
  ball(WHITE, 0.025, [GX - 0.06, 0.78, GZ + 0.12], { s: [0.8, 1.5, 0.4], g: 1 });
  torus(GOLD, 0.21, 0.006, [GX, 0.7, GZ], { rot: [70, 0, 20] }, Math.PI * 2, 24);
  ball(VIOLET, 0.014, [GX + 0.2, 0.77, GZ + 0.04], { g: 1.2 });
  for (const [mx, my, mz, ms, mc] of [
    [GX - 0.22, 0.95, GZ + 0.05, 0.8, CYAN],
    [GX + 0.15, 1.02, GZ - 0.1, 1, GOLD],
    [GX - 0.05, 1.12, GZ + 0.12, 0.7, VIOLET],
    [GX + 0.25, 0.9, GZ + 0.15, 0.7, CYAN],
  ] as const)
    sparkle(mx, my, mz, ms, mc);

  // =========================================================================
  // Flush merged geometry
  // =========================================================================
  for (const [key, list] of bag) {
    const [c, g, bn] = key.split("|");
    const merged = mergeGeometries(list);
    if (!merged) throw new Error(`wizardBookshelf: could not merge ${key}`);
    const strength = Number(g);
    const name = `bag.${c.replace("#", "")}${strength > 0 ? ".glow" : ""}.${bn}`;
    const bone = bones[bn as BoneName];
    if (strength > 0) glow(b.part(merged, c, { bone, at: [0, 0, 0], name }), strength);
    else b.part(merged, C(c), { bone, at: [0, 0, 0], name });
  }

  // open the chest lid
  b.pose(lid, { axis: [1, 0, 0], deg: -55 });

  return b.root;
}
