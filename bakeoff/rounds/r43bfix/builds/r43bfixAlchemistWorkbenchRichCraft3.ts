import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";
import { grain, mottle, countershade } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "alchemist_workbench",
  description:
    "A Genshin-style alchemist's workbench: gilded wooden bench with glowing potions, a bubbling cauldron, balance scales, open grimoire, books, hanging herbs and an Anemo crystal, with a shelf rack behind.",
};

// ---------- palette (cel shaded) ----------
const WOOD = cel(grain("#b87a42", "#9a6232", { size: 0.03, axis: "x", seed: 3 }));
const WOOD_DK = cel(grain("#7a4a2a", "#623a20", { size: 0.03, axis: "y", seed: 5 }));
const WOOD_BACK = cel(mottle("#5a3a2c", "#4a2e24", { size: 0.12, seed: 2 }));
const GOLD = cel("#f0c050", "#c98a2a");
const GOLD_DK = cel("#c99238", "#9a6420");
const IRON = cel("#4a4a5c", "#2c2c44");
const STONE = cel(mottle("#b9b4a6", "#9a9588", { size: 0.04, seed: 9 }));
const CLAY = cel(countershade("#d9805a", "#b86448", { level: -0.2 }));
const CREAM = cel("#f6ecd0", "#dcc79c");
const CORK = cel("#c79a62", "#9a7144");
const LEAF = cel("#6cc060", "#3e9a6c");
const CANDLE = cel("#fff2d6", "#e8cba0");
const BOOKS = ["#b8322e", "#2e5aa8", "#2f8a64", "#7a3a9a", "#d98a2a", "#2a7f9a"];

// ---------- textures ----------
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke="#ffd36a" stroke-width="4" stroke-linejoin="round">
  <circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="30"/>
  <path d="M50 12 L83 69 L17 69Z"/><path d="M50 88 L17 31 L83 31Z"/></g>
  <circle cx="50" cy="50" r="7" fill="#7fe8ff"/></svg>`,
  { size: 256 },
);
const PAGE = svg(
  `<svg viewBox="0 0 70 100"><rect width="70" height="100" fill="#f5e8c8"/>
  <rect x="3" y="3" width="64" height="94" fill="none" stroke="#b8893a" stroke-width="1.5"/>
  <circle cx="35" cy="28" r="15" fill="none" stroke="#6a3a2a" stroke-width="2"/>
  <path d="M35 13 L48 36 L22 36Z" fill="none" stroke="#6a3a2a" stroke-width="2"/>
  <circle cx="35" cy="28" r="3" fill="#3a9ad0"/>
  <path d="M9 56h52M9 64h46M9 72h52M9 80h38M9 88h48" stroke="#8a6a50" stroke-width="2.5" stroke-dasharray="6 2 3 2"/></svg>`,
  { size: 256 },
);
const LAVENDER = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 L16 20" stroke="#3a8a4a" stroke-width="3"/>
  <g fill="#9a6ae0" stroke="#5a3a9a" stroke-width="1"><ellipse cx="16" cy="8" rx="4" ry="6"/><ellipse cx="11" cy="17" rx="4" ry="5"/><ellipse cx="21" cy="18" rx="4" ry="5"/><ellipse cx="12" cy="27" rx="3.5" ry="5"/><ellipse cx="20" cy="28" rx="3.5" ry="5"/></g>
  <path d="M16 50 Q8 40 5 36 M16 54 Q24 44 27 40" stroke="#3a8a4a" stroke-width="2.5" fill="none"/></svg>`,
  { size: 256 },
);
const FERN = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 Q15 30 16 4" stroke="#2f7a40" stroke-width="3" fill="none"/>
  <g fill="#6cc860" stroke="#2f7a40" stroke-width="1"><path d="M16 14 L4 8 L14 20Z"/><path d="M16 14 L28 8 L18 20Z"/><path d="M16 28 L2 22 L14 34Z"/><path d="M16 28 L30 22 L18 34Z"/><path d="M16 42 L4 38 L14 48Z"/><path d="M16 42 L28 38 L18 48Z"/></g></svg>`,
  { size: 256 },
);
const BIGLEAF = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 Q-2 34 16 2 Q34 34 16 62Z" fill="#58b85a" stroke="#2a6a3a" stroke-width="2.5"/>
  <path d="M16 62 L16 10" stroke="#2a6a3a" stroke-width="2.5"/><path d="M16 30 L8 22 M16 40 L24 30" stroke="#2a6a3a" stroke-width="2"/></svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 40 50"><rect x="2" y="2" width="36" height="46" rx="4" fill="#f6e8c4" stroke="#8a5a2a" stroke-width="3"/>
  <path d="M20 10 L24 22 L36 22 L26 29 L30 41 L20 33 L10 41 L14 29 L4 22 L16 22Z" transform="translate(0 0) scale(.9) translate(2 2)" fill="#c9302c" stroke="#5a2a1a" stroke-width="1.5"/></svg>`,
  { size: 128 },
);
const SIGN = svg(
  `<svg viewBox="0 0 200 40"><rect x="2" y="2" width="196" height="36" rx="6" fill="#3a2418" stroke="#ffd36a" stroke-width="3"/>
  <text x="100" y="28" text-anchor="middle" font-family="serif" font-weight="bold" font-size="24" fill="#ffd36a" letter-spacing="4">ALCHEMY</text></svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "alchemist_workbench" });
  const R = rng(11);

  type V = [number, number, number];
  const box = (sx: number, sy: number, sz: number, color: any, x: number, y: number, z: number, rot?: V) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, x: number, y: number, z: number, rot?: V) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], rotation: rot });
  const lathe = (pts: number[][], color: any, at: V, seg = 10) =>
    b.lathe(pts as [number, number][], { at, color, segments: seg });
  const TOP = 0.9;

  // ---------- workbench ----------
  box(1.72, 0.07, 0.76, WOOD, 0, 0.865, 0);
  box(1.76, 0.03, 0.04, WOOD_DK, 0, 0.9, 0.39);
  box(1.76, 0.03, 0.04, WOOD_DK, 0, 0.9, -0.39);
  for (const s of [1, -1]) box(0.04, 0.03, 0.8, WOOD_DK, s * 0.88, 0.9, 0);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.075, 0.83, 0.075, WOOD_DK, sx * 0.78, 0.415, sz * 0.3);
      box(0.09, 0.05, 0.09, GOLD_DK, sx * 0.78, 0.025, sz * 0.3);
      b.part(new THREE.OctahedronGeometry(0.035, 0), GOLD, { at: [sx * 0.88, 0.92, sz * 0.39], scale: [1, 0.8, 1] });
    }
  box(1.5, 0.03, 0.62, WOOD, 0, 0.22, 0);
  box(1.56, 0.05, 0.04, WOOD_DK, 0, 0.7, 0.34); // apron front
  box(1.56, 0.12, 0.035, WOOD_DK, 0, 0.77, 0.345);
  for (const x of [-0.5, 0, 0.5]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
        at: [x, 0.77, 0.366], dir: [0, 0, 1], axis: "z", texture: EMBLEM,
      }),
      0.9,
    );
  }
  for (const x of [-0.25, 0.25]) box(0.01, 0.12, 0.04, GOLD, x, 0.77, 0.348);
  box(1.5, 0.04, 0.04, WOOD_DK, 0, 0.5, 0.3);

  // ---------- rack behind ----------
  box(1.72, 1.05, 0.04, WOOD_BACK, 0, 1.4, -0.56);
  for (const s of [1, -1]) {
    box(0.08, 1.9, 0.09, WOOD_DK, s * 0.88, 0.95, -0.45);
    b.part(new THREE.SphereGeometry(0.05, 6, 4), GOLD, { at: [s * 0.88, 1.98, -0.45] });
    box(0.1, 0.06, 0.12, GOLD_DK, s * 0.88, 0.03, -0.45);
  }
  const shelfY = [1.18, 1.5];
  for (const y of shelfY) {
    box(1.72, 0.035, 0.24, WOOD, 0, y, -0.45);
    box(1.72, 0.03, 0.02, GOLD, 0, y - 0.004, -0.325);
  }
  box(2.0, 0.14, 0.42, WOOD_DK, 0, 1.92, -0.43);
  box(2.06, 0.03, 0.46, GOLD_DK, 0, 2.0, -0.43);
  box(1.9, 0.02, 0.02, GOLD, 0, 1.86, -0.215);
  b.part(new THREE.PlaneGeometry(0.5, 0.1), "#ffffff", { at: [0, 1.925, -0.217], dir: [0, 0, 1], axis: "z", texture: SIGN });
  // herb bundles hanging from the cornice
  const hang = [-0.8, -0.65, -0.5, 0.5, 0.65, 0.8];
  hang.forEach((x, i) => {
    const root = [x, 1.855, -0.27] as V;
    b.cards([frame(root, [0, 1, 0])], i % 2 ? LAVENDER : FERN, {
      size: [0.14, 0.26], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.2, rng: R, bend: 10,
    });
    cyl(0.02, 0.02, 0.016, 6, GOLD_DK, x, 1.64, -0.27 + 0.0);
    b.rod([x, 1.86, -0.27], [x, 1.62, -0.27], 0.003, CORK);
  });
  // books and potions on shelves
  const bookRow = (x0: number, y: number, z: number, n: number) => {
    let x = x0;
    for (let i = 0; i < n; i++) {
      const w = 0.045 + R() * 0.03;
      const h = 0.2 + R() * 0.1;
      const col = cel(BOOKS[Math.floor(R() * BOOKS.length)]);
      box(w, h, 0.17, col, x + w / 2, y + h / 2, z);
      box(w * 0.9, h - 0.02, 0.15, CREAM, x + w / 2, y + h / 2, z - 0.01);
      box(w + 0.004, 0.014, 0.176, GOLD, x + w / 2, y + h * 0.8, z);
      box(w + 0.004, 0.014, 0.176, GOLD, x + w / 2, y + h * 0.2, z);
      x += w + 0.004;
    }
    return x;
  };

  type PK = { pts: number[][]; h: number; r: number; ly: number; lr: number };
  const KINDS: Record<string, PK> = {
    round: { pts: [[0, 0], [0.05, 0], [0.075, 0.04], [0.08, 0.09], [0.06, 0.14], [0.025, 0.17], [0.025, 0.22], [0, 0.22]], h: 0.22, r: 0.025, ly: 0.08, lr: 0.08 },
    vial: { pts: [[0, 0], [0.03, 0], [0.035, 0.02], [0.035, 0.18], [0.02, 0.2], [0.02, 0.24], [0, 0.24]], h: 0.24, r: 0.02, ly: 0.1, lr: 0.035 },
    cone: { pts: [[0, 0], [0.09, 0], [0.04, 0.13], [0.03, 0.17], [0.03, 0.21], [0, 0.21]], h: 0.21, r: 0.03, ly: 0.04, lr: 0.07 },
  };
  const potion = (kind: string, x: number, y: number, z: number, col: string, sc = 1) => {
    const k = KINDS[kind];
    const pts = k.pts.map(([a, c]) => [a * sc, c * sc]);
    glow(lathe(pts, col, [x, y, z], 10), 0.7);
    cyl(k.r * sc * 1.25, k.r * sc * 1.05, 0.016 * sc, 8, GOLD, x, y + (k.h - 0.03) * sc, z);
    cyl(k.r * sc * 1.05, k.r * sc * 0.85, 0.04 * sc, 8, CORK, x, y + (k.h + 0.012) * sc, z);
    if (kind !== "cone")
      b.part(new THREE.PlaneGeometry(0.07 * sc, 0.085 * sc), "#ffffff", {
        at: [x, y + k.ly * sc + 0.03 * sc, z + (k.lr + 0.012) * sc], dir: [0, 0, 1], axis: "z", texture: LABEL,
      });
  };

  bookRow(-0.8, shelfY[0] + 0.0175, -0.46, 5);
  potion("round", 0.0, shelfY[0] + 0.0175, -0.46, "#ff6a5a");
  potion("vial", 0.15, shelfY[0] + 0.0175, -0.46, "#7fe0ff");
  potion("cone", 0.32, shelfY[0] + 0.0175, -0.46, "#b07aff");
  potion("round", 0.5, shelfY[0] + 0.0175, -0.46, "#ffe05a", 0.9);
  potion("vial", 0.65, shelfY[0] + 0.0175, -0.46, "#7af08a");
  potion("cone", -0.75, shelfY[1] + 0.0175, -0.46, "#5ae0c0");
  potion("round", -0.55, shelfY[1] + 0.0175, -0.46, "#ff9ad0", 0.9);
  potion("vial", -0.38, shelfY[1] + 0.0175, -0.46, "#ffb04a");
  bookRow(-0.25, shelfY[1] + 0.0175, -0.46, 4);
  // leaning book + skull-ish gold orb
  box(0.05, 0.26, 0.17, cel("#7a3a9a"), 0.18, shelfY[1] + 0.15, -0.46, [0, 0, -14]);
  glow(b.part(new THREE.IcosahedronGeometry(0.06, 0), "#ffd36a", { at: [0.45, shelfY[1] + 0.08, -0.46] }), 0.9);
  cyl(0.05, 0.07, 0.025, 8, GOLD_DK, 0.45, shelfY[1] + 0.03, -0.46);
  potion("round", 0.68, shelfY[1] + 0.0175, -0.46, "#7fb0ff");

  // ---------- bench top items ----------
  // front row potions
  potion("round", -0.78, TOP + 0.015, 0.27, "#ff5a6a");
  potion("vial", -0.65, TOP + 0.015, 0.29, "#6ae0ff");
  potion("cone", -0.53, TOP + 0.015, 0.26, "#a0ff6a");
  potion("vial", 0.0, TOP + 0.015, 0.3, "#ff9a3a");
  potion("round", 0.14, TOP + 0.015, 0.28, "#c07aff", 0.85);

  // balance scales
  const sx0 = -0.42;
  const sz0 = -0.02;
  lathe([[0, 0], [0.09, 0], [0.1, 0.02], [0.05, 0.04], [0.025, 0.06], [0.02, 0.38], [0.035, 0.4], [0, 0.4]], GOLD, [sx0, TOP + 0.015, sz0]);
  const beamY = TOP + 0.015 + 0.38;
  b.part(new THREE.BoxGeometry(0.56, 0.02, 0.025), GOLD, { at: [sx0, beamY + 0.02, sz0], rotation: [0, 0, 3] });
  b.part(new THREE.OctahedronGeometry(0.03, 0), GOLD_DK, { at: [sx0, beamY + 0.045, sz0] });
  [[1, 0.0], [-1, -0.0]].forEach(([s], i) => {
    const px = sx0 + s * 0.27;
    const beamEndY = beamY + 0.02 + s * 0.0075;
    const panY = TOP + 0.015 + 0.14 + (i ? 0.02 : -0.02);
    lathe([[0, 0], [0.08, 0.02], [0.095, 0.035], [0.088, 0.035], [0.07, 0.02], [0, 0.012]], GOLD, [px, panY, sz0], 12);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      b.rod([px, beamEndY, sz0], [px + Math.cos(a) * 0.085, panY + 0.035, sz0 + Math.sin(a) * 0.085], 0.0025, GOLD_DK);
    }
    b.part(new THREE.SphereGeometry(0.015, 5, 4), GOLD, { at: [px, beamEndY, sz0] });
  });
  // pan contents: weights and herb
  for (let i = 0; i < 3; i++) cyl(0.018 - i * 0.003, 0.022 - i * 0.003, 0.018, 8, IRON, sx0 + 0.27 + (i - 1) * 0.035, TOP + 0.015 + 0.14 - 0.02 + 0.03, sz0);
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0), "#7fe8ff", { at: [sx0 - 0.27, TOP + 0.015 + 0.14 + 0.02 + 0.06, sz0], scale: [1, 1.4, 1] }), 1);

  // mortar and pestle
  lathe([[0, 0], [0.06, 0], [0.08, 0.03], [0.09, 0.1], [0.075, 0.1], [0.06, 0.04], [0, 0.035]], STONE, [-0.12, TOP + 0.015, 0.14]);
  b.rod([-0.12, TOP + 0.05, 0.14], [-0.04, TOP + 0.2, 0.1], [0.02, 0.013], STONE);
  b.part(new THREE.SphereGeometry(0.024, 6, 4), STONE, { at: [-0.04, TOP + 0.205, 0.1] });
  glow(cyl(0.065, 0.065, 0.006, 8, "#7af08a", -0.12, TOP + 0.075, 0.14), 0.7);

  // open grimoire on a stand
  const bx = 0.28;
  const bz = 0.08;
  box(0.28, 0.06, 0.2, WOOD_DK, bx, TOP + 0.045, bz);
  const T = 12 * (Math.PI / 180);
  for (const s of [1, -1]) {
    const cx = bx + s * 0.1 * Math.cos(T);
    const cy = TOP + 0.085 + 0.1 * Math.sin(T) + 0.01;
    b.part(new THREE.BoxGeometry(0.21, 0.02, 0.29), cel("#8a2a30"), { at: [cx, cy, bz], rotation: [0, 0, s * 12] });
    const n: V = [-s * Math.sin(T), Math.cos(T), 0];
    b.part(new THREE.BoxGeometry(0.19, 0.012, 0.27), CREAM, { at: [cx + n[0] * 0.012, cy + n[1] * 0.012, bz], rotation: [0, 0, s * 12] });
    b.part(new THREE.PlaneGeometry(0.18, 0.26), "#ffffff", {
      at: [cx + n[0] * 0.019, cy + n[1] * 0.019, bz], dir: n, axis: "z", up: [0, 0, -1], texture: PAGE,
    });
    box(0.01, 0.022, 0.29, GOLD, bx + s * 0.205 * Math.cos(T), cy + 0.1 * Math.sin(T) * 0.9, bz, [0, 0, s * 12]);
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.035, 0), "#7fe8ff", { at: [bx, TOP + 0.26, bz] }), 1.3);

  // cauldron
  const cx = 0.64;
  const cz = 0.04;
  lathe([[0, 0.04], [0.08, 0.04], [0.14, 0.12], [0.155, 0.24], [0.13, 0.245], [0.12, 0.13], [0, 0.1]], IRON, [cx, TOP + 0.015 + 0.04, cz], 10);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    b.spike([cx + Math.cos(a) * 0.08, TOP + 0.055, cz + Math.sin(a) * 0.08], [0, -1, 0], 0.05, 0.02, { color: IRON });
  }
  b.part(new THREE.TorusGeometry(0.155, 0.012, 5, 12), GOLD_DK, { at: [cx, TOP + 0.015 + 0.04 + 0.245, cz], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.15, 0.008, 4, 10, Math.PI), IRON, { at: [cx, TOP + 0.015 + 0.04 + 0.245, cz], rotation: [0, 90, 0] });
  glow(cyl(0.128, 0.128, 0.01, 10, "#6aff9a", cx, TOP + 0.015 + 0.04 + 0.205, cz), 1.1);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3;
    glow(b.part(new THREE.SphereGeometry(0.014 + (i % 3) * 0.006, 5, 4), "#b8ffd0", {
      at: [cx + Math.cos(a) * 0.06, TOP + 0.33 + i * 0.045, cz + Math.sin(a) * 0.06],
    }), 1.4);
  }
  // ladle
  b.rod([cx - 0.03, TOP + 0.3, cz + 0.02], [cx - 0.13, TOP + 0.5, cz + 0.12], 0.007, CORK);
  b.part(new THREE.SphereGeometry(0.03, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), GOLD, { at: [cx - 0.03, TOP + 0.285, cz + 0.02], rotation: [180, 0, 0] });

  // book stack with candle
  const sbx = -0.74;
  const sbz = -0.2;
  [0.26, 0.23, 0.2].forEach((w, i) => {
    const y = TOP + 0.015 + i * 0.045 + 0.0225;
    const ox = (i - 1) * 0.012;
    box(w, 0.045, 0.19, cel(BOOKS[(i * 2 + 1) % 6]), sbx + ox, y, sbz);
    box(w - 0.02, 0.034, 0.17, CREAM, sbx + ox + 0.008, y, sbz + 0.012);
    box(0.012, 0.047, 0.192, GOLD, sbx + ox - w / 2 + 0.02, y, sbz);
  });
  const cy0 = TOP + 0.015 + 3 * 0.045;
  cyl(0.05, 0.06, 0.012, 8, GOLD, sbx, cy0 + 0.006, sbz);
  cyl(0.022, 0.025, 0.14, 8, CANDLE, sbx, cy0 + 0.082, sbz);
  glow(b.part(new THREE.ConeGeometry(0.014, 0.05, 6), "#ffb040", { at: [sbx, cy0 + 0.18, sbz] }), 1.6);
  cyl(0.003, 0.003, 0.02, 4, INK, sbx, cy0 + 0.16, sbz);

  // anemo crystal
  lathe([[0, 0], [0.07, 0], [0.06, 0.03], [0.03, 0.05], [0, 0.05]], GOLD_DK, [0.0, TOP + 0.015, -0.22], 8);
  glow(b.part(new THREE.OctahedronGeometry(0.075, 0), "#6ef0d0", { at: [0, TOP + 0.015 + 0.15, -0.22], scale: [0.8, 1.7, 0.8] }), 1.3);
  for (const s of [1, -1])
    glow(b.part(new THREE.OctahedronGeometry(0.03, 0), "#9afff0", { at: [s * 0.07, TOP + 0.015 + 0.08, -0.22], scale: [0.7, 1.5, 0.7] }), 1.2);

  // herb pot
  const hx = 0.34;
  const hz = -0.24;
  lathe([[0, 0], [0.06, 0], [0.075, 0.1], [0.085, 0.11], [0.085, 0.13], [0.07, 0.13], [0.07, 0.115], [0, 0.11]], CLAY, [hx, TOP + 0.015, hz], 10);
  cyl(0.088, 0.088, 0.014, 10, GOLD_DK, hx, TOP + 0.015 + 0.12, hz);
  cyl(0.068, 0.068, 0.01, 8, cel("#4a3022"), hx, TOP + 0.015 + 0.12, hz);
  const lf = [] as ReturnType<typeof frame>[];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const t = 0.4 + (i % 3) * 0.25;
    lf.push(frame([hx + Math.cos(a) * 0.03, TOP + 0.14, hz + Math.sin(a) * 0.03], [Math.cos(a) * t, 1, Math.sin(a) * t]));
  }
  b.cards(lf, [BIGLEAF, LAVENDER], { size: [0.07, 0.16], lean: 15, bend: 25, flow: [0, -0.2, 1], rng: R, vary: 0.25, cross: true });

  // ---------- lower shelf ----------
  lathe([[0, 0], [0.12, 0], [0.16, 0.1], [0.16, 0.22], [0.1, 0.3], [0.07, 0.32], [0.07, 0.36], [0, 0.36]], cel("#6a4aa8"), [-0.5, 0.235, 0.0], 10);
  cyl(0.095, 0.095, 0.05, 10, CORK, -0.5, 0.62, 0.0);
  cyl(0.1, 0.1, 0.02, 10, GOLD, -0.5, 0.6, 0.0);
  [0.3, 0.26, 0.22].forEach((w, i) => {
    box(w, 0.05, 0.22, cel(BOOKS[(i + 3) % 6]), 0.4, 0.235 + 0.025 + i * 0.05, 0.0);
    box(w - 0.02, 0.038, 0.2, CREAM, 0.41, 0.26 + i * 0.05, 0.012);
  });
  potion("round", 0.1, 0.235, 0.05, "#ff7a3a", 1.1);
  potion("cone", -0.12, 0.235, 0.0, "#6ae0ff", 1.1);
  // sack
  b.part(new THREE.SphereGeometry(0.13, 7, 5), cel("#d8c08a"), { at: [0.66, 0.37, -0.1], scale: [1, 1.1, 0.9] });
  cyl(0.05, 0.07, 0.06, 7, cel("#d8c08a"), 0.66, 0.54, -0.1);
  b.part(new THREE.TorusGeometry(0.058, 0.01, 4, 8), cel("#b8322e"), { at: [0.66, 0.51, -0.1], rotation: [90, 0, 0] });

  return b.root;
}
