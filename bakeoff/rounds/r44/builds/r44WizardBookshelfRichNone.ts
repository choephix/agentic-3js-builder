import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { grain, mottle } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description: "High-fantasy arcane bookcase with a pointed crown, gilt spines, scrolls, glowing orbs, candles, potions and runes.",
};

const GOLD = "#e8b84a";
const CREAM = "#f1e2b6";
const WOOD = grain("#5b3a6a", "#3a2148", { size: 0.03, axis: "y" });
const WOOD_LIGHT = grain("#7a4d86", "#583468", { size: 0.03, axis: "y" });
const BACK = mottle("#2a1838", "#3a2150", { size: 0.12 });
const BOOKS = ["#8c1f3a", "#1f4f8c", "#2c7a5a", "#6a2c8c", "#b8601f", "#1d3a5a", "#7a1f1f", "#2f6a7a"];

const SPINE = svg(
  `<svg viewBox="0 0 20 100"><rect x="1" y="6" width="18" height="5" fill="#e8b84a"/><rect x="1" y="14" width="18" height="2" fill="#f7dc8a"/>
  <path d="M10 36 L17 50 L10 64 L3 50Z" fill="none" stroke="#e8b84a" stroke-width="3"/><circle cx="10" cy="50" r="2.5" fill="#f7dc8a"/>
  <rect x="1" y="84" width="18" height="2" fill="#f7dc8a"/><rect x="1" y="89" width="18" height="5" fill="#e8b84a"/></svg>`,
  { size: 128 },
);
const RUNES = svg(
  `<svg viewBox="0 0 40 120" stroke="#ffd66a" stroke-width="3" fill="none" stroke-linecap="round">
  <circle cx="20" cy="16" r="9"/><path d="M20 7V25M11 16H29"/>
  <path d="M10 42L20 54L30 42M20 54V70"/><path d="M12 82L28 82M20 76V96M12 96L28 90"/>
  <path d="M20 104L12 116M20 104L28 116"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#e8b84a" stroke-width="3"/>
  <path d="M32 10L38 28L56 32L38 36L32 54L26 36L8 32L26 28Z" fill="#f7dc8a" stroke="#e8b84a" stroke-width="2"/>
  <circle cx="32" cy="32" r="5" fill="#8c1f3a"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "wizard-bookshelf" });
  const R = rng(11);

  const part = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { at, ...o });
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], o: any = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, o);
  const decal = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

  // ---------- carcass ----------
  const W = 1.1, D = 0.4;
  box(0.06, 1.9, D, WOOD, [-0.55, 0.95, 0]);
  box(0.06, 1.9, D, WOOD, [0.55, 0.95, 0]);
  box(1.04, 1.8, 0.03, BACK, [0, 1.0, -0.18]);
  const S = [0.1, 0.55, 1.0, 1.45];
  for (const s of S) box(1.04, 0.04, D - 0.02, WOOD_LIGHT, [0, s - 0.02, 0]);
  box(1.04, 0.05, D - 0.02, WOOD_LIGHT, [0, 1.925, 0]);
  // plinth + feet
  box(1.2, 0.07, D + 0.06, WOOD, [0, 0.035, 0.01]);
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    part(new THREE.SphereGeometry(0.04, 6, 4), GOLD, [sx * 0.55, 0.03, sz * 0.19]);
  }
  // front pillars with gilt capitals
  for (const s of [1, -1]) {
    box(0.07, 1.8, 0.06, WOOD, [s * 0.52, 1.0, 0.19]);
    box(0.1, 0.05, 0.09, GOLD, [s * 0.52, 1.92, 0.19]);
    box(0.1, 0.05, 0.09, GOLD, [s * 0.52, 0.1, 0.19]);
    part(new THREE.OctahedronGeometry(0.035), "#9be6ff", [s * 0.52, 1.99, 0.19]);
    glow(b.part(new THREE.OctahedronGeometry(0.03), "#9be6ff", { at: [s * 0.52, 2.0, 0.19] }), 1.2);
  }
  // cornice
  box(1.22, 0.05, D + 0.08, WOOD, [0, 1.975, 0.01]);
  box(1.16, 0.03, D + 0.04, GOLD, [0, 2.01, 0.01]);
  // pointed gable crown
  const crown = [[-0.6, 0], [0.6, 0], [0.46, 0.2], [0.18, 0.34], [0, 0.56, "sharp"], [-0.18, 0.34], [-0.46, 0.2]] as any;
  b.extrude(crown, { at: [0, 2.025, 0.0], x: [1, 0, 0], thickness: 0.08, bevel: 0.01, color: WOOD });
  b.extrude(
    [[-0.4, 0.04], [0.4, 0.04], [0.28, 0.16], [0, 0.4, "sharp"], [-0.28, 0.16]] as any,
    { at: [0, 2.025, 0.045], x: [1, 0, 0], thickness: 0.012, color: "#2a1838" },
  );
  decal(0.22, 0.22, EMBLEM, [0, 2.2, 0.05], [0, 0, 1]);
  glow(b.part(new THREE.IcosahedronGeometry(0.045, 0), "#ffe07a", { at: [0, 2.62, 0] }), 1.4);
  box(0.02, 0.05, 0.02, GOLD, [0, 2.585, 0]);
  // side runes
  for (const s of [1, -1]) glow(decal(0.14, 0.42, RUNES, [s * 0.582, 1.0, 0], [s, 0, 0]), 1.2);

  // ---------- helpers ----------
  const book = (x: number, y: number, w: number, h: number, c: string, lean = 0) => {
    const d = 0.26, z = 0.02;
    if (lean) {
      box(w, h, d, c, [x + Math.sin((lean * Math.PI) / 180) * h * 0.5, y + h * 0.5 * Math.cos((lean * Math.PI) / 180), z], { rotation: [0, 0, -lean] });
      return;
    }
    box(w, h, d, c, [x, y + h / 2, z]);
    box(w - 0.006, h - 0.012, d - 0.02, CREAM, [x, y + h / 2, z - 0.012]);
    decal(w * 0.92, h * 0.86, SPINE, [x, y + h / 2, z + d / 2 + 0.002], [0, 0, 1]);
  };
  const row = (x0: number, x1: number, y: number, leanEnd = false) => {
    let x = x0;
    while (true) {
      const w = 0.04 + R() * 0.035, h = 0.24 + R() * 0.14;
      if (x + w > x1) break;
      const last = x + w + 0.1 > x1 && leanEnd;
      book(x + w / 2, y, w, h, BOOKS[Math.floor(R() * BOOKS.length)], last ? 14 : 0);
      x += w + 0.004;
      if (last) break;
    }
  };
  const scroll = (x: number, y: number, z: number, len: number, rad: number, vertical = false) => {
    const o = vertical ? {} : { rotation: [0, 0, 90] };
    cyl(rad, rad, len, 8, "#e9d7a0", [x, y, z], o);
    for (const e of [-1, 1]) {
      const p = vertical ? [x, y + e * len * 0.36, z] : [x + e * len * 0.36, y, z];
      cyl(rad * 1.12, rad * 1.12, 0.012, 8, "#b8302c", p, o);
      const q = vertical ? [x, y + e * len * 0.5, z] : [x + e * len * 0.5, y, z];
      cyl(rad * 0.8, rad * 0.8, 0.008, 8, "#c9a86a", q, o);
    }
  };
  const candle = (x: number, y: number, z: number, h: number) => {
    const dish = [[0, 0], [0.04, 0], [0.04, 0.008], [0.02, 0.02], [0.012, 0.03], [0, 0.03]] as any;
    b.lathe(dish, { at: [x, y, z], color: GOLD, segments: 8 });
    cyl(0.017, 0.019, h, 8, "#f6ecd0", [x, y + 0.03 + h / 2, z]);
    cyl(0.021, 0.019, 0.015, 8, "#fff8e4", [x, y + 0.03 + h - 0.005, z]);
    box(0.007, 0.03, 0.007, "#fff8e4", [x + 0.018, y + 0.03 + h - 0.02, z]);
    cyl(0.002, 0.002, 0.014, 4, "#222", [x, y + 0.04 + h, z]);
    glow(part(new THREE.ConeGeometry(0.014, 0.05, 6), "#ff9a2e", [x, y + 0.074 + h, z]), 1.5);
    glow(part(new THREE.ConeGeometry(0.007, 0.03, 6), "#fff2a0", [x, y + 0.066 + h, z]), 1.6);
  };
  const orb = (x: number, y: number, z: number, r: number, c: string, c2: string) => {
    const base = [[0, 0], [r * 0.9, 0], [r * 0.9, 0.012], [r * 0.45, 0.04], [r * 0.55, 0.07], [0, 0.07]] as any;
    b.lathe(base, { at: [x, y, z], color: GOLD, segments: 8 });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.7;
      b.spike([x + Math.sin(a) * r * 0.55, y + 0.06, z + Math.cos(a) * r * 0.55], [Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5], r * 1.1, 0.008, { color: GOLD });
    }
    const cy = y + 0.07 + r * 0.85;
    glow(part(new THREE.IcosahedronGeometry(r, 1), c, [x, cy, z], { flat: true }), 1.1);
    glow(part(new THREE.IcosahedronGeometry(r * 0.45, 0), c2, [x, cy, z], { flat: true }), 1.6);
  };
  const potion = (x: number, y: number, z: number, c: string) => {
    const p = [[0, 0], [0.035, 0], [0.045, 0.02], [0.045, 0.07], [0.015, 0.1], [0.015, 0.14], [0.022, 0.14], [0.022, 0.155], [0, 0.155]] as any;
    glow(b.lathe(p, { at: [x, y, z], color: c, segments: 8 }), 0.9);
    cyl(0.017, 0.015, 0.03, 6, "#8a5a2a", [x, y + 0.168, z]);
    cyl(0.026, 0.026, 0.008, 8, GOLD, [x, y + 0.15, z]);
  };

  // ---------- shelf 0 ----------
  row(-0.49, -0.05, S[0], true);
  [0.3, 0.27, 0.24].forEach((w, i) => {
    box(w, 0.06, 0.22, BOOKS[(i + 3) % 8], [0.22 + i * 0.01, S[0] + 0.03 + i * 0.06, 0.04]);
    box(w - 0.02, 0.045, 0.2, CREAM, [0.22 + i * 0.01, S[0] + 0.03 + i * 0.06, 0.05]);
    box(w + 0.004, 0.012, 0.222, GOLD, [0.22 + i * 0.01, S[0] + 0.006 + i * 0.06 + 0.024, 0.04]);
  });
  box(0.02, 0.03, 0.01, GOLD, [0.22, S[0] + 0.1, 0.153]);
  candle(0.22, S[0] + 0.18, 0.04, 0.12);
  scroll(0.42, S[0] + 0.025, 0.0, 0.12, 0.025);
  scroll(0.42, S[0] + 0.025, 0.07, 0.12, 0.025);
  scroll(0.42, S[0] + 0.07, 0.035, 0.12, 0.025);

  // ---------- shelf 1 ----------
  orb(-0.28, S[1], 0.04, 0.095, "#6fd0ff", "#e6fbff");
  row(-0.1, 0.49, S[1], true);

  // ---------- shelf 2 ----------
  row(-0.49, -0.1, S[2], true);
  // hourglass
  const hg = [[0, 0], [0.04, 0], [0.04, 0.01], [0.006, 0.07], [0.04, 0.13], [0.04, 0.14], [0, 0.14]] as any;
  glow(b.lathe(hg, { at: [0.03, S[2] + 0.02, 0.04], color: "#bfeaff", segments: 8 }), 0.6);
  for (const y of [0.0, 0.16]) cyl(0.05, 0.05, 0.02, 8, GOLD, [0.03, S[2] + 0.01 + y, 0.04]);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.09;
    cyl(0.004, 0.004, 0.16, 4, GOLD, [0.03 + Math.sin(a) * 0.043, S[2] + 0.09, 0.04 + Math.cos(a) * 0.043]);
  }
  glow(part(new THREE.ConeGeometry(0.022, 0.045, 6), "#ffd66a", [0.03, S[2] + 0.055, 0.04]), 0.8);
  // candle cluster on a book stack
  box(0.14, 0.05, 0.14, "#2c7a5a", [0.26, S[2] + 0.025, 0.04]);
  candle(0.26, S[2] + 0.05, 0.04, 0.16);
  candle(0.33, S[2], 0.1, 0.08);
  // scroll rack
  cyl(0.07, 0.06, 0.07, 8, "#6a3a1e", [0.42, S[2] + 0.035, 0.0]);
  scroll(0.40, S[2] + 0.19, -0.01, 0.3, 0.025, true);
  scroll(0.45, S[2] + 0.17, 0.02, 0.26, 0.025, true);
  scroll(0.42, S[2] + 0.2, 0.03, 0.32, 0.025, true);

  // ---------- shelf 3 ----------
  potion(-0.43, S[3], 0.05, "#5dff9a");
  potion(-0.33, S[3], 0.08, "#ff6ad0");
  orb(-0.2, S[3], 0.0, 0.06, "#c58aff", "#f4e4ff");
  row(-0.06, 0.49, S[3], true);
  glow(part(new THREE.OctahedronGeometry(0.05), "#6affd8", [0.0, S[3] + 0.9 * 0, 0.17], { flat: true, scale: [1, 1.6, 1] }), 0.0);
  return b.root;
}
