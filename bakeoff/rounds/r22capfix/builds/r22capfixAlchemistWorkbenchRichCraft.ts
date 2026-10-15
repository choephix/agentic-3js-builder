import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded alchemist's workbench with glowing potions, stacked books, a balance scale, herb bundles, mortar, alembic and elemental crystals, in a bright gold-trimmed anime style.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const GOLD = "#f0b94a";
const GOLD_D = "#c98a2a";
const CREAM = "#f8eed6";
const TEAL = "#2fd6c4";
const PURPLE = "#9a62f5";
const PINK = "#ff7fb0";
const AMBER = "#ffb23d";
const GREEN = "#5fcf6e";
const RED = "#d94a55";
const NAVY = "#2c3d78";
const GLASS = "#d3f1f2";
const CORK = "#b07a47";
const STONE = "#8b95b8";
const INKC = "#3a2340";

const WOOD = cel(grain("#a96a3b", "#935832", { size: 0.04, axis: "x" }));
const WOOD_D = cel(grain("#7b4627", "#6a3a20", { size: 0.04, axis: "x" }));
const WOOD_DV = cel(grain("#7b4627", "#6a3a20", { size: 0.04, axis: "y" }));
const SACK = cel(mottle("#e8d4a4", "#d8bf86", { size: 0.04, seed: 3 }));
const BARREL = cel(grain("#b57a45", "#9c6637", { size: 0.035, axis: "y" }));
const ROCK = cel(mottle("#8b95b8", "#737ea6", { size: 0.05, seed: 7 }));
const POT = cel(mottle("#e0834f", "#cf6e3e", { size: 0.04, seed: 9 }));

const leafTex = svg(
  `<svg viewBox="0 0 40 80"><path d="M20 80 L20 8" stroke="#2f8f4a" stroke-width="3" fill="none"/>
  <path d="M20 60 Q4 56 4 42 Q18 44 20 60Z" fill="#58c868"/><path d="M20 50 Q36 46 36 32 Q22 34 20 50Z" fill="#7de08a"/>
  <path d="M20 36 Q6 32 8 18 Q20 20 20 36Z" fill="#46b45a"/><path d="M20 28 Q32 24 32 10 Q22 12 20 28Z" fill="#6fd47c"/>
  <path d="M20 12 Q14 6 20 0 Q26 6 20 12Z" fill="#8ff09a"/></svg>`,
  { size: 128 },
);
const lavTex = svg(
  `<svg viewBox="0 0 40 80"><path d="M20 80 L20 20" stroke="#4f9a56" stroke-width="3" fill="none"/>
  <circle cx="20" cy="10" r="5" fill="#b389ff"/><circle cx="15" cy="20" r="5" fill="#9a62f5"/><circle cx="25" cy="22" r="5" fill="#b389ff"/>
  <circle cx="15" cy="32" r="5" fill="#b389ff"/><circle cx="25" cy="34" r="5" fill="#9a62f5"/><circle cx="20" cy="44" r="5" fill="#b389ff"/>
  <path d="M20 66 Q8 62 6 54 Q16 54 20 66Z" fill="#58c868"/></svg>`,
  { size: 128 },
);
const labelA = svg(
  `<svg viewBox="0 0 40 50"><rect x="1" y="1" width="38" height="48" rx="5" fill="#f8eed6" stroke="#c98a2a" stroke-width="2.5"/>
  <circle cx="20" cy="25" r="10" fill="none" stroke="#3a2340" stroke-width="2.5"/>
  <path d="M20 13 L24 25 L20 37 L16 25Z" fill="#d94a55"/><circle cx="20" cy="25" r="3" fill="#f0b94a"/></svg>`,
  { size: 96 },
);
const labelB = svg(
  `<svg viewBox="0 0 40 50"><rect x="1" y="1" width="38" height="48" rx="5" fill="#e8f6ff" stroke="#c98a2a" stroke-width="2.5"/>
  <path d="M20 10 L30 36 L10 36Z" fill="none" stroke="#2c3d78" stroke-width="3"/><path d="M10 24 L30 24" stroke="#2c3d78" stroke-width="3"/>
  <circle cx="20" cy="42" r="2.5" fill="#f0b94a"/></svg>`,
  { size: 96 },
);
const pageTex = svg(
  `<svg viewBox="0 0 60 80"><rect width="60" height="80" fill="#fbf3dc"/>
  <path d="M8 10 H52 M8 18 H46 M8 26 H52 M8 34 H40 M8 42 H50" stroke="#6b4a36" stroke-width="2" fill="none"/>
  <circle cx="30" cy="62" r="10" fill="none" stroke="#9a3a3a" stroke-width="2.5"/><path d="M30 52 L35 66 L25 66Z" fill="none" stroke="#2c3d78" stroke-width="2"/></svg>`,
  { size: 128 },
);
const runnerTex = svg(
  `<svg viewBox="0 0 120 50"><rect width="120" height="50" fill="#2c3d78"/><rect x="2" y="2" width="116" height="46" fill="none" stroke="#f0b94a" stroke-width="2"/>
  <rect x="5" y="5" width="110" height="40" fill="none" stroke="#7fa4ff" stroke-width="0.8"/>
  <path d="M60 8 L76 25 L60 42 L44 25Z" fill="none" stroke="#f0b94a" stroke-width="1.8"/><circle cx="60" cy="25" r="6" fill="#2fd6c4"/>
  <path d="M20 25 L30 17 L40 25 L30 33Z M80 25 L90 17 L100 25 L90 33Z" fill="#f0b94a"/>
  <path d="M12 25 H18 M102 25 H108" stroke="#f0b94a" stroke-width="2"/></svg>`,
  { size: 512 },
);
const circleTex = svg(
  `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="none" stroke="#f0b94a" stroke-width="3"/>
  <circle cx="100" cy="100" r="78" fill="none" stroke="#f0b94a" stroke-width="2"/>
  <path d="M100 22 L168 140 L32 140Z M100 178 L32 60 L168 60Z" fill="none" stroke="#f0b94a" stroke-width="3"/>
  <circle cx="100" cy="100" r="24" fill="none" stroke="#2fd6c4" stroke-width="4"/><circle cx="100" cy="100" r="8" fill="#2fd6c4"/>
  <circle cx="100" cy="14" r="5" fill="#f0b94a"/><circle cx="100" cy="186" r="5" fill="#f0b94a"/><circle cx="14" cy="100" r="5" fill="#f0b94a"/><circle cx="186" cy="100" r="5" fill="#f0b94a"/></svg>`,
  { size: 512 },
);

type Pt = [number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "alchemistWorkbench" });
  const TOP = 0.9;

  const box = (x: number, y: number, z: number, w: number, h: number, d: number, c: string | typeof WOOD, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (x: number, y: number, z: number, rt: number, rb: number, h: number, c: string | typeof WOOD, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const sph = (x: number, y: number, z: number, r: number, c: string | typeof WOOD, sc: number[] = [1, 1, 1], seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 3)), c, { at: [x, y, z], scale: sc });
  const torus = (x: number, y: number, z: number, R: number, t: number, c: string, rot: number[] = [90, 0, 0]) =>
    b.part(new THREE.TorusGeometry(R, t, 5, 16), c, { at: [x, y, z], rotation: rot });
  const lathe = (pts: Pt[], x: number, y: number, z: number, c: string | typeof WOOD, seg = 12) =>
    b.lathe(pts, { at: [x, y, z], color: c, segments: seg });
  const yaw = (dx: number, dz: number, th: number): [number, number] => {
    const a = (th * Math.PI) / 180;
    return [dx * Math.cos(a) + dz * Math.sin(a), -dx * Math.sin(a) + dz * Math.cos(a)];
  };

  // ---------- table ----------
  box(0, TOP - 0.03, 0, 1.8, 0.06, 0.8, WOOD);
  box(0, TOP - 0.065, 0, 1.76, 0.02, 0.76, WOOD_D);
  box(0, TOP - 0.002, 0.402, 1.82, 0.012, 0.012, GOLD);
  box(0, TOP - 0.06, 0.402, 1.82, 0.01, 0.012, GOLD_D);
  box(0.903, TOP - 0.03, 0, 0.012, 0.06, 0.81, GOLD_D);
  box(-0.903, TOP - 0.03, 0, 0.012, 0.06, 0.81, GOLD_D);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(sx * 0.82, 0.42, sz * 0.32, 0.09, 0.84, 0.09, WOOD_DV);
      box(sx * 0.82, 0.04, sz * 0.32, 0.105, 0.05, 0.105, GOLD_D);
      box(sx * 0.82, 0.79, sz * 0.32, 0.105, 0.03, 0.105, GOLD);
    }
  box(0, 0.26, 0, 1.64, 0.04, 0.64, WOOD);
  box(0, 0.5, 0.32, 1.55, 0.05, 0.04, WOOD_D);
  box(0, 0.5, -0.32, 1.55, 0.05, 0.04, WOOD_D);
  box(0.82, 0.5, 0, 0.04, 0.05, 0.55, WOOD_D);
  box(-0.82, 0.5, 0, 0.04, 0.05, 0.55, WOOD_D);
  box(0, 0.74, 0.34, 1.55, 0.14, 0.04, WOOD_D);
  for (const dx of [-0.5, 0, 0.5]) {
    box(dx, 0.74, 0.364, 0.46, 0.11, 0.012, WOOD);
    box(dx, 0.74, 0.371, 0.4, 0.008, 0.006, GOLD);
    box(dx, 0.795, 0.371, 0.4, 0.006, 0.006, GOLD_D);
    sph(dx, 0.74, 0.385, 0.018, GOLD, [1, 1, 0.8]);
    box(dx - 0.18, 0.74, 0.37, 0.025, 0.025, 0.006, GOLD);
    box(dx + 0.18, 0.74, 0.37, 0.025, 0.025, 0.006, GOLD);
  }
  b.part(new THREE.PlaneGeometry(1.5, 0.62), "#ffffff", { at: [0, TOP + 0.002, 0.08], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: runnerTex });
  for (const sx of [1, -1]) {
    b.rod([sx * 0.915, 0.78, 0.4], [sx * 0.915, 0.66, 0.4], 0.006, GOLD);
    sph(sx * 0.915, 0.65, 0.4, 0.016, GOLD);
    b.spike([sx * 0.915, 0.65, 0.4], [0, -1, 0], 0.13, 0.026, RED, { sides: 8 });
    cyl(sx * 0.915, 0.645, 0.4, 0.028, 0.028, 0.012, GOLD, 8);
  }

  // ---------- hutch ----------
  box(0, 1.32, -0.38, 1.74, 0.8, 0.04, WOOD_D);
  for (const sx of [1, -1]) {
    box(sx * 0.88, 1.3, -0.33, 0.07, 0.8, 0.12, WOOD_DV);
    box(sx * 0.88, 1.7, -0.33, 0.09, 0.03, 0.14, GOLD);
    sph(sx * 0.88, 1.76, -0.33, 0.035, GOLD);
    box(sx * 0.88, 0.91, -0.33, 0.09, 0.02, 0.14, GOLD_D);
  }
  box(0, 1.2, -0.3, 1.74, 0.035, 0.2, WOOD);
  box(0, 1.2, -0.2, 1.74, 0.02, 0.012, GOLD);
  box(0, 1.72, -0.32, 1.9, 0.05, 0.22, WOOD_D);
  box(0, 1.755, -0.32, 1.94, 0.02, 0.24, GOLD);
  box(0, 1.69, -0.215, 1.8, 0.02, 0.012, GOLD_D);
  b.rod([-0.84, 1.62, -0.28], [0.84, 1.62, -0.28], 0.012, WOOD_D);
  b.part(new THREE.PlaneGeometry(0.72, 0.72), "#ffffff", { at: [0, 1.45, -0.357], dir: [0, 0, 1], axis: "z", texture: circleTex });
  const hang = (xs: number[], tex: THREE.Texture, seed: number) => {
    for (const hx of xs) {
      b.rod([hx, 1.62, -0.28], [hx, 1.56, -0.28], 0.004, GOLD_D);
      b.cards(
        [-0.015, 0, 0.015].map((o) => frame([hx + o, 1.585, -0.28], [0, 1, 0])),
        tex,
        { size: [0.11, 0.26], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.25, spin: 12, rng: rng(seed + Math.round(hx * 100)) },
      );
      sph(hx, 1.575, -0.28, 0.014, RED, [1.2, 0.8, 1.2]);
    }
  };
  hang([-0.82, -0.7, -0.58, 0.58, 0.7, 0.82], leafTex, 1);
  hang([-0.76, -0.64, 0.64, 0.76], lavTex, 2);

  // ---------- potions ----------
  const SHAPES = {
    round: { p: [[0, 0], [0.04, 0], [0.06, 0.02], [0.07, 0.06], [0.06, 0.1], [0.03, 0.125], [0, 0.125]] as Pt[], h: 0.125, r: 0.07 },
    tall: { p: [[0, 0], [0.035, 0], [0.045, 0.02], [0.045, 0.15], [0.03, 0.18], [0, 0.18]] as Pt[], h: 0.18, r: 0.045 },
    squat: { p: [[0, 0], [0.07, 0], [0.085, 0.02], [0.085, 0.05], [0.04, 0.075], [0, 0.075]] as Pt[], h: 0.075, r: 0.085 },
  };
  const potion = (x: number, y: number, z: number, s: number, liq: string, shape: keyof typeof SHAPES, label: THREE.Texture | null) => {
    const sh = SHAPES[shape];
    glow(lathe(sh.p.map(([r, h]) => [r * s, h * s] as Pt), x, y, z, liq, 12), 0.7);
    const hb = sh.h * s;
    lathe(
      [
        [0, hb - 0.01 * s],
        [0.022 * s, hb - 0.01 * s],
        [0.022 * s, hb + 0.07 * s],
        [0.03 * s, hb + 0.07 * s],
        [0.03 * s, hb + 0.085 * s],
        [0, hb + 0.085 * s],
      ] as Pt[],
      x, y, z, GLASS, 8,
    );
    cyl(x, y + hb + 0.1 * s, z, 0.024 * s, 0.02 * s, 0.04 * s, CORK, 8);
    cyl(x, y + hb + 0.07 * s, z, 0.027 * s, 0.027 * s, 0.01 * s, GOLD, 8);
    sph(x - sh.r * s * 0.45, y + hb * 0.7, z + sh.r * s * 0.8, 0.012 * s, "#ffffff", [0.7, 1.4, 0.5], 5);
    if (label)
      b.part(new THREE.PlaneGeometry(sh.r * s * 1.1, sh.r * s * 1.35), "#ffffff", { at: [x, y + hb * 0.42, z + sh.r * s + 0.003], dir: [0, 0, 1], axis: "z", texture: label });
  };
  potion(0.38, TOP, 0.3, 1.1, PURPLE, "round", labelA);
  potion(0.52, TOP, 0.24, 1.0, TEAL, "tall", labelB);
  potion(0.66, TOP, 0.3, 0.9, PINK, "squat", labelA);
  potion(0.3, TOP, 0.12, 0.8, AMBER, "tall", labelB);
  potion(-0.05, TOP, -0.1, 1.0, GREEN, "round", null);
  potion(-0.45, 1.2175, -0.3, 1.0, TEAL, "tall", labelA);
  potion(-0.32, 1.2175, -0.3, 0.9, PINK, "round", labelB);
  potion(-0.2, 1.2175, -0.3, 0.8, AMBER, "squat", labelA);
  potion(0.2, 1.2175, -0.3, 1.0, PURPLE, "round", labelB);
  potion(0.34, 1.2175, -0.3, 0.9, GREEN, "tall", labelA);
  potion(0.46, 1.2175, -0.3, 0.8, TEAL, "squat", labelB);
  potion(-0.1, 0.28, 0.1, 1.0, AMBER, "round", labelA);
  potion(0.05, 0.28, 0.14, 0.8, PURPLE, "tall", labelB);
  potion(0.17, 0.28, 0.08, 0.9, PINK, "squat", labelA);
  cyl(0, 1.225, -0.3, 0.05, 0.06, 0.02, GOLD, 8);
  glow(sph(0, 1.3, -0.3, 0.065, TEAL, [1, 1, 1], 10), 1.2);
  torus(0, 1.3, -0.3, 0.075, 0.006, GOLD, [90, 0, 0]);
  torus(0, 1.3, -0.3, 0.075, 0.006, GOLD, [0, 0, 0]);
  torus(0, 1.3, -0.3, 0.075, 0.006, GOLD_D, [0, 90, 0]);

  // ---------- books ----------
  const book = (x: number, y: number, z: number, w: number, h: number, d: number, col: string, th: number) => {
    const rot = [0, th, 0];
    const at = (dx: number, dy: number, dz: number, bw: number, bh: number, bd: number, c: string) => {
      const [rx, rz] = yaw(dx, dz, th);
      box(x + rx, y + dy, z + rz, bw, bh, bd, c, rot);
    };
    at(0, h / 2 - 0.004, 0, w, 0.008, d, col);
    at(0, -h / 2 + 0.004, 0, w, 0.008, d, col);
    at(0, 0, d / 2 - 0.006, w, h, 0.012, col);
    at(-0.002, 0, -0.006, w - 0.012, h - 0.016, d - 0.012, CREAM);
    for (const k of [-0.3, 0.3]) at(k * w, 0, d / 2 - 0.004, 0.014, h + 0.004, 0.018, GOLD);
    at(0, 0, d / 2 - 0.002, w * 0.5, h * 0.35, 0.016, GOLD_D);
  };
  const stack: Array<[number, number, number, string, number]> = [
    [0.34, 0.05, 0.24, RED, 4],
    [0.3, 0.045, 0.22, NAVY, -6],
    [0.32, 0.055, 0.23, "#2e9c8e", 8],
    [0.26, 0.04, 0.19, PURPLE, -3],
    [0.24, 0.04, 0.18, "#c8782e", 10],
  ];
  let sy = TOP;
  for (const [w, h, d, col, th] of stack) {
    book(-0.75, sy + h / 2, 0.18, w, h, d, col, th);
    sy += h;
  }
  glow(b.part(new THREE.OctahedronGeometry(0.035), PINK, { at: [-0.75, sy + 0.04, 0.18], scale: [1, 1.4, 1] }), 1);
  const standing: Array<[number, number, string]> = [
    [-0.78, 0.05, RED], [-0.725, 0.04, NAVY], [-0.68, 0.045, "#2e9c8e"], [-0.63, 0.04, PURPLE], [-0.585, 0.05, "#c8782e"],
  ];
  for (const [bx, bw, col] of standing) {
    const bh = 0.2 + Math.abs(bx * 0.1);
    box(bx, 1.2175 + bh / 2, -0.3, bw, bh, 0.15, col);
    box(bx, 1.2175 + bh / 2, -0.222, bw - 0.006, bh - 0.02, 0.006, CREAM);
    box(bx, 1.2175 + bh * 0.8, -0.224, bw + 0.004, 0.012, 0.01, GOLD);
    box(bx, 1.2175 + bh * 0.25, -0.224, bw + 0.004, 0.012, 0.01, GOLD);
  }
  box(0.0, TOP + 0.006, 0.28, 0.46, 0.012, 0.3, RED);
  box(0.0, TOP + 0.008, 0.28, 0.48, 0.006, 0.31, GOLD_D);
  for (const s of [1, -1]) {
    box(s * 0.11, TOP + 0.02, 0.28, 0.21, 0.012, 0.27, CREAM);
    box(s * 0.11, TOP + 0.014, 0.28, 0.22, 0.006, 0.28, "#e8d9b0");
    b.part(new THREE.PlaneGeometry(0.17, 0.22), "#ffffff", { at: [s * 0.11, TOP + 0.0275, 0.28], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: pageTex });
  }
  box(0, TOP + 0.024, 0.28, 0.012, 0.012, 0.27, "#c9b787");
  b.rod([0.0, TOP + 0.03, 0.15], [0.02, TOP + 0.01, 0.07], 0.004, RED);
  b.rod([0.02, TOP + 0.01, 0.07], [0.02, TOP + 0.009, 0.045], 0.007, GOLD);
  cyl(-0.38, TOP + 0.025, 0.3, 0.035, 0.04, 0.05, INKC, 8);
  cyl(-0.38, TOP + 0.052, 0.3, 0.025, 0.035, 0.006, GOLD, 8);
  b.rod([-0.38, TOP + 0.05, 0.3], [-0.3, TOP + 0.2, 0.26], [0.004, 0.002], CREAM);
  b.cards([frame([-0.34, TOP + 0.14, 0.28], [0.4, 1, -0.2])], leafTex, { size: [0.05, 0.2], lean: 10, flow: [0, 0, 1], color: "#ffffff" });

  // ---------- scale ----------
  const SX = 0.62;
  const SZ = -0.02;
  cyl(SX, TOP + 0.015, SZ, 0.1, 0.11, 0.03, GOLD_D, 12);
  cyl(SX, TOP + 0.04, SZ, 0.07, 0.09, 0.02, GOLD, 12);
  b.rod([SX, TOP + 0.04, SZ], [SX, TOP + 0.44, SZ], [0.014, 0.01], GOLD);
  torus(SX, TOP + 0.2, SZ, 0.02, 0.006, GOLD, [90, 0, 0]);
  sph(SX, TOP + 0.45, SZ, 0.022, GOLD);
  b.rod([SX - 0.22, TOP + 0.4, SZ], [SX + 0.22, TOP + 0.4, SZ], 0.01, GOLD);
  sph(SX, TOP + 0.4, SZ, 0.02, GOLD_D);
  b.rod([SX, TOP + 0.4, SZ], [SX, TOP + 0.32, SZ + 0.005], [0.004, 0.002], RED);
  for (const [i, s] of ([1, -1] as const).entries()) {
    const px = SX + s * 0.22;
    sph(px, TOP + 0.4, SZ, 0.014, GOLD);
    const panY = TOP + 0.2 - i * 0.02;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.5;
      b.rod([px, TOP + 0.4, SZ], [px + Math.cos(a) * 0.085, panY + 0.045, SZ + Math.sin(a) * 0.085], 0.003, GOLD_D, { caps: "flat" });
    }
    lathe([[0, 0], [0.08, 0.025], [0.095, 0.045], [0.087, 0.045], [0, 0.012]], px, panY, SZ, GOLD, 12);
  }
  glow(b.part(new THREE.OctahedronGeometry(0.03), TEAL, { at: [SX + 0.22, TOP + 0.2 + 0.04, SZ], scale: [1, 1.3, 1] }), 1);
  glow(b.part(new THREE.OctahedronGeometry(0.02), PINK, { at: [SX + 0.25, TOP + 0.2 + 0.03, SZ + 0.03] }), 1);
  cyl(SX - 0.22, TOP + 0.2 - 0.02 + 0.04, SZ, 0.022, 0.028, 0.03, GOLD_D, 8);
  cyl(SX - 0.25, TOP + 0.2 - 0.02 + 0.035, SZ + 0.04, 0.014, 0.018, 0.02, GOLD, 8);
  for (const [i, wx] of [0.42, 0.46, 0.5].entries()) {
    cyl(wx, TOP + 0.012 + i * 0.002, 0.04, 0.014 + i * 0.004, 0.018 + i * 0.004, 0.024 + i * 0.006, GOLD_D, 8);
  }

  // ---------- mortar & pestle ----------
  lathe([[0, 0], [0.055, 0], [0.085, 0.09], [0.07, 0.09], [0.05, 0.03], [0, 0.03]], -0.2, TOP, 0.17, STONE, 12);
  torus(-0.2, TOP + 0.09, 0.17, 0.077, 0.007, GOLD, [90, 0, 0]);
  sph(-0.2, TOP + 0.045, 0.17, 0.052, GREEN, [1, 0.4, 1], 8);
  b.capsule([-0.23, TOP + 0.05, 0.17], [-0.15, TOP + 0.2, 0.17], [0.014, 0.022], STONE);
  sph(-0.15, TOP + 0.205, 0.17, 0.026, STONE, [1, 0.8, 1], 8);
  torus(-0.2, TOP + 0.005, 0.17, 0.056, 0.008, GOLD_D, [90, 0, 0]);

  // ---------- alembic ----------
  const AX = -0.4;
  const AZ = -0.12;
  for (const k of [0, 1, 2]) {
    const a = (k / 3) * Math.PI * 2 + 0.6;
    b.rod([AX + Math.cos(a) * 0.09, TOP, AZ + Math.sin(a) * 0.09], [AX + Math.cos(a) * 0.075, TOP + 0.11, AZ + Math.sin(a) * 0.075], 0.008, GOLD_D);
  }
  torus(AX, TOP + 0.11, AZ, 0.075, 0.007, GOLD, [90, 0, 0]);
  glow(b.part(new THREE.ConeGeometry(0.03, 0.07, 6), AMBER, { at: [AX, TOP + 0.045, AZ] }), 1.4);
  cyl(AX, TOP + 0.01, AZ, 0.04, 0.045, 0.02, "#555a78", 10);
  glow(sph(AX, TOP + 0.21, AZ, 0.095, PURPLE, [1, 1, 1], 10), 0.7);
  sph(AX - 0.04, TOP + 0.25, AZ + 0.07, 0.014, "#ffffff", [0.7, 1.4, 0.5], 5);
  b.sweep(
    [[AX, TOP + 0.28, AZ], [AX, TOP + 0.37, AZ], [AX + 0.1, TOP + 0.4, AZ], [AX + 0.25, TOP + 0.35, AZ], [AX + 0.35, TOP + 0.22, AZ]],
    0.013,
    GLASS,
    { sides: 6 },
  );
  cyl(AX, TOP + 0.3, AZ, 0.028, 0.034, 0.03, GLASS, 8);
  torus(AX, TOP + 0.285, AZ, 0.03, 0.006, GOLD, [90, 0, 0]);
  b.rod([AX + 0.33, TOP + 0.26, AZ], [AX + 0.34, TOP + 0.2, AZ], 0.01, GOLD, { caps: "flat" });

  // ---------- crystals ----------
  const CX = 0.8;
  const CZ = -0.15;
  b.part(new THREE.DodecahedronGeometry(0.09), ROCK, { at: [CX, TOP + 0.04, CZ], scale: [1.2, 0.6, 1] });
  const cr: Array<[number, number, number, number, number, string]> = [
    [0, 0, 0.22, 0, 0, TEAL],
    [0.05, 0.02, 0.15, -18, 12, "#7df0e2"],
    [-0.05, 0.03, 0.14, 16, -14, TEAL],
    [0.01, -0.05, 0.11, 0, -28, "#7df0e2"],
  ];
  for (const [dx, dz, h, rz, rx, c] of cr)
    glow(b.part(new THREE.ConeGeometry(0.028, h, 6), c, { at: [CX + dx, TOP + 0.07 + h / 2, CZ + dz], rotation: [rx, 0, rz] }), 1.2);
  glow(b.part(new THREE.OctahedronGeometry(0.02), "#ffffff", { at: [CX + 0.1, TOP + 0.24, CZ + 0.08] }), 1.2);

  // ---------- herb pot ----------
  const HX = 0.82;
  const HZ = 0.22;
  lathe([[0, 0], [0.045, 0], [0.07, 0.1], [0.075, 0.12], [0.065, 0.12], [0.04, 0.03], [0, 0.03]], HX, TOP, HZ, POT, 10);
  torus(HX, TOP + 0.115, HZ, 0.07, 0.008, GOLD, [90, 0, 0]);
  cyl(HX, TOP + 0.1, HZ, 0.062, 0.062, 0.02, "#4a2f22", 10);
  const pf = Array.from({ length: 14 }, (_v, i) => {
    const a = i * 2.4;
    const r = 0.012 + (i % 3) * 0.008;
    return frame([HX + Math.cos(a) * r, TOP + 0.115, HZ + Math.sin(a) * r], [0, 1, 0]);
  });
  b.cards(pf, [leafTex, leafTex, lavTex], { size: [0.09, 0.2], lean: 28, bend: 25, flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)], vary: 0.3, cross: true, rng: rng(5) });

  // ---------- herb bundle on table ----------
  const bundleFrames = [0, 1, 2, 3, 4].map((i) => frame([0.2 + i * 0.012, TOP + 0.012 + i * 0.004, 0.36 + i * 0.008], [0, 1, 0]));
  b.cards(bundleFrames, [leafTex, lavTex], { size: [0.09, 0.28], lean: 82, bend: 8, flow: [0.2, 0, -1], mirror: true, vary: 0.2, rng: rng(21) });
  b.rod([0.2, TOP + 0.014, 0.35], [0.3, TOP + 0.014, 0.34], 0.012, GREEN);
  box(0.21, TOP + 0.02, 0.36, 0.014, 0.03, 0.03, RED);

  // ---------- candle ----------
  cyl(0.9, TOP + 0.01, -0.02, 0.05, 0.06, 0.02, GOLD, 10);
  cyl(0.9, TOP + 0.07, -0.02, 0.026, 0.028, 0.12, CREAM, 8);
  for (const k of [0, 1, 2]) {
    const a = k * 2.1;
    sph(0.9 + Math.cos(a) * 0.026, TOP + 0.12 - k * 0.02, -0.02 + Math.sin(a) * 0.026, 0.008, CREAM, [1, 2.2, 1], 5);
  }
  glow(b.spike([0.9, TOP + 0.13, -0.02], [0, 1, 0], 0.07, 0.02, AMBER, { sides: 6 }), 1.6);
  glow(b.spike([0.9, TOP + 0.135, -0.02], [0, 1, 0], 0.04, 0.01, "#fff2a8", { sides: 6 }), 1.6);

  // ---------- scroll ----------
  b.rod([-0.1, TOP + 0.03, 0.34], [0.1, TOP + 0.03, 0.34], 0.025, CREAM, { sides: 8 });
  b.rod([-0.105, TOP + 0.03, 0.34], [-0.1, TOP + 0.03, 0.34], 0.03, GOLD, { caps: "flat", sides: 8 });
  b.rod([0.1, TOP + 0.03, 0.34], [0.105, TOP + 0.03, 0.34], 0.03, GOLD, { caps: "flat", sides: 8 });
  b.rod([-0.003, TOP + 0.03, 0.34], [0.003, TOP + 0.03, 0.34], 0.031, RED, { caps: "flat", sides: 8 });

  // ---------- lower shelf dressing ----------
  const BX = 0.6;
  const BZ = 0.0;
  b.part(new THREE.CylinderGeometry(0.15, 0.13, 0.3, 12), BARREL, { at: [BX, 0.43, BZ] });
  b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 12), GOLD_D, { at: [BX, 0.35, BZ] });
  b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 12), GOLD_D, { at: [BX, 0.52, BZ] });
  cyl(BX, 0.585, BZ, 0.14, 0.15, 0.01, WOOD_D, 12);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), GOLD, { at: [BX, 0.42, BZ + 0.15], rotation: [90, 0, 0] });
  for (const [sx, sz, r] of [[-0.55, 0.02, 0.14], [-0.3, 0.12, 0.11]] as const) {
    sph(sx, 0.28 + r * 0.9, sz, r, SACK, [1, 1.1, 1], 9);
    cyl(sx, 0.28 + r * 2.0, sz, r * 0.2, r * 0.35, r * 0.4, SACK, 8);
    torus(sx, 0.28 + r * 1.85, sz, r * 0.3, 0.012, RED, [90, 0, 0]);
  }
  box(-0.55, 0.36, -0.2, 0.3, 0.2, 0.22, WOOD_D);
  box(-0.55, 0.465, -0.2, 0.32, 0.015, 0.24, GOLD_D);
  for (const dz of [-0.11, 0.11]) box(-0.55, 0.36, -0.2 + dz, 0.31, 0.04, 0.01, WOOD);
  b.cards(
    Array.from({ length: 5 }, (_v, i) => frame([-0.63 + i * 0.04, 0.47, -0.2], [0, 1, 0])),
    [leafTex, lavTex],
    { size: [0.09, 0.22], lean: 20, bend: 20, flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(33) },
  );
  b.part(new THREE.CylinderGeometry(0.08, 0.065, 0.14, 10), "#6f87b8", { at: [0.3, 0.35, -0.2] });
  torus(0.3, 0.42, -0.2, 0.08, 0.008, GOLD_D, [90, 0, 0]);
  b.sweep(
    [[0.22, 0.42, -0.2], [0.25, 0.5, -0.2], [0.3, 0.52, -0.2], [0.35, 0.5, -0.2], [0.38, 0.42, -0.2]],
    0.005,
    GOLD_D,
    { sides: 5 },
  );
  b.cards(
    [0, 1, 2, 3].map((i) => frame([0.1 + i * 0.02, 0.285, -0.22], [0, 1, 0])),
    leafTex,
    { size: [0.08, 0.26], lean: 85, flow: [1, 0, 0], mirror: true, vary: 0.2, rng: rng(41) },
  );

  // ---------- hutch shelf jars ----------
  for (const [jx, col] of [[0.62, PINK], [0.74, "#7de08a"]] as const) {
    glow(cyl(jx, 1.2175 + 0.055, -0.3, 0.045, 0.045, 0.11, col, 8), 0.5);
    cyl(jx, 1.2175 + 0.12, -0.3, 0.05, 0.05, 0.02, GOLD, 8);
    sph(jx, 1.2175 + 0.14, -0.3, 0.012, GOLD, [1, 1, 1], 5);
  }

  return b.root;
}
