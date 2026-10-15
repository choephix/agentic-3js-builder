import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, grain, mix, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A cel-shaded sky island with a mossy ruined gate guarding a glowing crystal, a waterfall pouring off the rim, a pond, a blossom tree, an oak, a pine, a stone lantern, hanging vines and drifting rocks.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// Palette
const GRASS_A = "#8be05a";
const GRASS_B = "#5fcf5f";
const DIRT = "#c58a5a";
const ROCK_A = "#a79bc4";
const ROCK_B = "#8d86b0";
const VEIN = "#5fd6c8";
const STONE_A = "#e8dfc8";
const STONE_B = "#cfc3a8";
const GROUT = "#a89c86";
const MOSS_A = "#7fcf55";
const MOSS_B = "#4fae5a";
const GOLD = "#f2c44f";
const TEAL = "#37e0d0";
const BARK_C = "#9a6a48";
const WATER = "#58dcf0";

export default function build() {
  const b = createBuilder({ name: "floatingIsland" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const D = Math.PI / 180;
  const TOP = 1.12;

  // ---- helpers -------------------------------------------------------------------------------------------
  const pol = (r: number, a: number, y: number): [number, number, number] => [
    r * Math.sin(a * D),
    y,
    r * Math.cos(a * D),
  ];
  type Opt = {
    scale?: number | number[];
    rotation?: number[];
    flat?: boolean;
    dir?: number[];
    axis?: "x" | "y" | "z";
    texture?: THREE.Texture;
  };
  const P = (geo: THREE.BufferGeometry, color: Fill, at: number[], o: Opt = {}) =>
    b.part(geo, color, { at, ...o });
  const ball = (r: number, color: Fill, at: number[], scale?: number[], seg = 8) =>
    P(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, at, { scale, flat: true });
  const slabBox = (w: number, h: number, d: number, color: Fill, at: number[], yaw = 0) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, { rotation: [0, yaw, 0] });
  const norm3 = (v: number[]): [number, number, number] => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const dirs = (n: number): Array<[number, number, number]> => {
    const out: Array<[number, number, number]> = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - (1.55 * (i + 0.5)) / n;
      const s = Math.sqrt(1 - y * y);
      const ph = i * 2.399963;
      out.push([Math.cos(ph) * s, y, Math.sin(ph) * s]);
    }
    return out;
  };

  // ---- paints --------------------------------------------------------------------------------------------
  const stone = (seed: number) =>
    cel(
      paint((p, n) => {
        const m = noise(p, 0.22, seed);
        if (n.y > 0.45 && noise(p, 0.16, seed + 4) > 0.5) return mix(MOSS_A, MOSS_B, noise(p, 0.07, seed + 9));
        if (p.y < 1.2 && noise(p, 0.12, seed + 6) > 0.62) return MOSS_A;
        const c = cells(p, 0.28, seed);
        if (c.d2 - c.d1 < 0.025) return GROUT;
        return mix(STONE_A, STONE_B, m);
      }),
    );
  const STONE = stone(3);
  const STONE2 = stone(8);
  const ROCKP = cel(
    paint((p, n) => {
      const y = p.y;
      if (y > 0.86 + 0.06 * noise(p, 0.08, 3)) return DIRT;
      if (n.y > 0.35 && noise(p, 0.2, 4) > 0.55) return MOSS_A;
      const c = cells(p, 0.34, 5);
      if (c.d2 - c.d1 < 0.03 && y < 0.75) return VEIN;
      const band = Math.floor(y * 9 + noise(p, 0.4, 2) * 2.5) % 2;
      return band ? ROCK_A : ROCK_B;
    }),
  );
  const GRASSP = cel(
    paint((p, n) => {
      if (n.y < 0) return DIRT;
      const c = cells(p, 0.24, 5);
      if (n.y > 0.6 && c.d1 < 0.06 && c.id > 0.72) return c.id > 0.9 ? "#ffffff" : c.id > 0.81 ? "#ffe45e" : "#ff9fc0";
      return mix(GRASS_A, GRASS_B, noise(p, 0.35, 3));
    }),
  );
  const BARK = cel(
    paint((p) => {
      const g = noise(p, 0.05, 2);
      return mix(BARK_C, "#7c4f35", g);
    }),
  );
  const LEAF_G = cel("#5fcf5f");
  const LEAF_G2 = cel("#46b85a");
  const PINK = cel("#ff9fc0");
  const CLOUD = cel("#f3fbff", "#c4dcf6");
  const colPaint = cel(
    paint((p, n, s) => {
      if ((s[0] > 0.54 && s[0] < 0.585) || (s[0] > 0.07 && s[0] < 0.092)) return GOLD;
      if (s[0] > 0.2 && noise(p, 0.2, 7) > 0.74) return MOSS_B;
      if (p.y < 1.3 && noise(p, 0.1, 9) > 0.55 && n.y > -2) return MOSS_A;
      return mix(STONE_A, STONE_B, noise(p, 0.2, 3));
    }),
  );

  // ---- textures ------------------------------------------------------------------------------------------
  const LEAF = svg(
    `<svg viewBox="0 0 32 40"><path d="M16 39 C2 28 2 10 16 1 C30 10 30 28 16 39Z" fill="#ffffff" stroke="#9a9a9a" stroke-width="1.6"/><path d="M16 36 L16 8" stroke="#b4b4b4" stroke-width="1.8" stroke-linecap="round"/><path d="M16 26 L8 18 M16 20 L24 13 M16 30 L23 24" stroke="#c8c8c8" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const GRASSTEX = svg(
    `<svg viewBox="0 0 40 40"><path d="M5 40 Q9 20 3 5 Q15 18 17 40Z" fill="#6bd24f" stroke="#2f8f4a" stroke-width="1.3"/><path d="M15 40 Q18 14 21 1 Q27 18 27 40Z" fill="#8be05a" stroke="#2f8f4a" stroke-width="1.3"/><path d="M25 40 Q30 22 38 9 Q36 26 35 40Z" fill="#5fcf5f" stroke="#2f8f4a" stroke-width="1.3"/></svg>`,
    { size: 128 },
  );
  const flowerSvg = (petal: string, mid: string) =>
    svg(
      `<svg viewBox="0 0 24 40"><path d="M12 40 L12 15" stroke="#3a9e48" stroke-width="2.4" stroke-linecap="round"/><path d="M12 31 Q4 29 3 22 Q10 22 12 29Z" fill="#59c455" stroke="#2f8f4a" stroke-width="1"/>${[0, 72, 144, 216, 288]
        .map(
          (a) =>
            `<ellipse cx="12" cy="7.5" rx="3.6" ry="5.6" transform="rotate(${a} 12 12)" fill="${petal}" stroke="${INK}" stroke-width="1"/>`,
        )
        .join("")}<circle cx="12" cy="12" r="3" fill="${mid}" stroke="${INK}" stroke-width="0.8"/></svg>`,
      { size: 128 },
    );
  const FLOWERS = [
    flowerSvg("#ff8fb8", "#ffe45e"),
    flowerSvg("#ffffff", "#ffb347"),
    flowerSvg("#9fb4ff", "#fff3a0"),
  ];
  const VINE = svg(
    `<svg viewBox="0 0 20 80"><path d="M10 0 Q14 20 8 40 Q4 60 10 78" stroke="#3d9a4a" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="14" cy="18" rx="5" ry="3" fill="#6bd24f" stroke="#2f8f4a" stroke-width="1"/><ellipse cx="4" cy="34" rx="5" ry="3" fill="#5fcf5f" stroke="#2f8f4a" stroke-width="1"/><ellipse cx="13" cy="52" rx="5" ry="3" fill="#8be05a" stroke="#2f8f4a" stroke-width="1"/><ellipse cx="6" cy="68" rx="4.5" ry="2.8" fill="#6bd24f" stroke="#2f8f4a" stroke-width="1"/></svg>`,
    { size: 128 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 20 60"><path d="M10 0 L10 16" stroke="#c9962e" stroke-width="2.4"/><circle cx="10" cy="19" r="5" fill="#f2c44f" stroke="#a9761c" stroke-width="1.2"/><path d="M5 24 L15 24 L17 58 L3 58Z" fill="#37e0d0" stroke="#1a8f8f" stroke-width="1.2"/><path d="M7 28 L7 56 M10 28 L10 58 M13 28 L13 56" stroke="#9ff5ea" stroke-width="1.2"/><rect x="4" y="24" width="12" height="3" fill="#f2c44f"/></svg>`,
    { size: 128 },
  );
  const PETAL = svg(
    `<svg viewBox="0 0 16 20"><path d="M8 19 C0 12 1 4 8 1 C15 4 16 12 8 19Z" fill="#ffd0e0" stroke="#e57aa0" stroke-width="1.2"/></svg>`,
    { size: 64 },
  );
  const rings: string[] = [];
  for (let k = 0; k < 16; k++) {
    const a = k * 22.5 * D;
    rings.push(
      `<path d="M${50 + 36 * Math.sin(a)} ${50 - 36 * Math.cos(a)} L${50 + 43 * Math.sin(a)} ${50 - 43 * Math.cos(a)}" stroke="#ffd976" stroke-width="2.2" stroke-linecap="round"/>`,
    );
  }
  const RUNE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#7ff3e6" stroke-width="2.4"/><circle cx="50" cy="50" r="33" fill="none" stroke="#ffd976" stroke-width="2.2"/><circle cx="50" cy="50" r="12" fill="none" stroke="#7ff3e6" stroke-width="2.2"/><path d="M50 17 L61 50 L50 83 L39 50Z M17 50 L50 39 L83 50 L50 61Z" fill="none" stroke="#ffd976" stroke-width="1.8"/>${rings.join("")}</svg>`,
    { size: 256 },
  );
  const FILI = svg(
    `<svg viewBox="0 0 60 100"><path d="M30 6 L30 94" stroke="#f2c44f" stroke-width="1.8"/><circle cx="30" cy="30" r="9" fill="none" stroke="#f2c44f" stroke-width="1.8"/><circle cx="30" cy="30" r="3" fill="#37e0d0"/><path d="M30 48 C16 44 10 56 18 62 C24 66 28 58 22 56 M30 48 C44 44 50 56 42 62 C36 66 32 58 38 56" fill="none" stroke="#f2c44f" stroke-width="1.8" stroke-linecap="round"/><path d="M30 70 C20 70 16 82 24 86 M30 70 C40 70 44 82 36 86" fill="none" stroke="#37e0d0" stroke-width="1.8" stroke-linecap="round"/><rect x="4" y="4" width="52" height="92" fill="none" stroke="#f2c44f" stroke-width="1.6"/></svg>`,
    { size: 256 },
  );

  // ---- island body ---------------------------------------------------------------------------------------
  const profile: Array<[number, number]> = [
    [0, 0],
    [0.1, 0.03],
    [0.22, 0.2],
    [0.2, 0.34],
    [0.42, 0.46],
    [0.38, 0.58],
    [0.7, 0.7],
    [0.66, 0.78],
    [0.98, 0.86],
    [1.12, 0.97],
  ];
  const rockR = (y: number) => {
    const yy = Math.min(Math.max(y, 0), 0.97);
    for (let i = 0; i < profile.length - 1; i++) {
      const [x0, y0] = profile[i];
      const [x1, y1] = profile[i + 1];
      if (yy >= y0 && yy <= y1) return x0 + ((x1 - x0) * (yy - y0)) / (y1 - y0);
    }
    return 1.12;
  };
  const rockOutline: Array<[number, number]> = [...profile, [0, 0.97]];
  b.lathe(rockOutline, { at: [0, 0, 0], segments: 10, color: ROCKP, name: "rock" });
  b.lathe(
    [
      [0, 0.96],
      [1.14, 0.96],
      [1.2, 1.02],
      [1.19, 1.08],
      [1.02, TOP],
      [0, TOP],
    ],
    { at: [0, 0, 0], segments: 10, color: GRASSP, name: "grass" },
  );

  // rim chunks
  for (let i = 0; i < 10; i++) {
    const a = i * 36 + 10 + R() * 14;
    if (Math.abs(a - 50) < 20) continue;
    const s = 0.08 + R() * 0.05;
    P(new THREE.DodecahedronGeometry(1, 0), ROCKP, pol(1.1, a, 0.9 + R() * 0.05), {
      scale: [s * 1.2, s * 0.9, s * 1.2],
      flat: true,
      rotation: [R() * 40, R() * 360, R() * 40],
    });
  }
  // stalactites
  for (const [a, y, len] of [
    [20, 0.55, 0.22],
    [75, 0.62, 0.18],
    [130, 0.5, 0.24],
    [190, 0.6, 0.2],
    [245, 0.52, 0.26],
    [300, 0.64, 0.17],
    [350, 0.5, 0.2],
  ]) {
    b.spike(pol(rockR(y) * 0.9, a, y), [0, -1, 0], len, 0.05, ROCKP, { sides: 5 });
  }
  // underside crystals
  const crystal = (at: number[], dirv: number[], size: number, color: string, strength = 1) => {
    const n = norm3(dirv);
    const c = [at[0] + n[0] * size * 0.35, at[1] + n[1] * size * 0.35, at[2] + n[2] * size * 0.35];
    return glow(
      P(new THREE.OctahedronGeometry(1, 0), color, c, {
        dir: n,
        scale: [size * 0.35, size, size * 0.35],
        flat: true,
      }),
      strength,
    );
  };
  for (const [a, y, s] of [
    [30, 0.42, 0.16],
    [105, 0.5, 0.2],
    [170, 0.4, 0.14],
    [235, 0.48, 0.18],
    [315, 0.44, 0.17],
    [60, 0.62, 0.1],
    [270, 0.66, 0.12],
  ]) {
    const pos = pol(rockR(y) * 0.97, a, y);
    const dv = [Math.sin(a * D) * 0.8, -0.45, Math.cos(a * D) * 0.8];
    crystal(pos, dv, s, a % 2 ? TEAL : "#7fb6ff", 1.2);
  }
  // hanging roots
  for (const a of [200, 290, 345, 120]) {
    const y0 = 0.85;
    b.sweep(
      catmull([
        pol(rockR(y0) * 0.9, a, y0),
        pol(rockR(y0) + 0.08, a + 10, y0 - 0.15),
        pol(0.62, a + 20, 0.55),
        pol(0.4, a + 30, 0.28),
      ]),
      [0.045, 0.006],
      BARK,
      { sides: 5, caps: { start: "flat", end: "point" } },
    );
  }
  // little clouds beneath
  for (const [a, r, y, s] of [
    [30, 0.62, 0.3, 0.14],
    [150, 0.7, 0.26, 0.16],
    [250, 0.66, 0.34, 0.13],
  ]) {
    const c = pol(r, a, y);
    ball(s, CLOUD, c, [1.4, 0.8, 1], 7);
    ball(s * 0.8, CLOUD, [c[0] + s, c[1] - 0.02, c[2] + s * 0.3], [1.2, 0.8, 1], 7);
    ball(s * 0.7, CLOUD, [c[0] - s * 0.9, c[1] - 0.03, c[2] - s * 0.2], [1.2, 0.8, 1], 7);
  }

  // ---- pond, river, waterfall ----------------------------------------------------------------------------
  const PC = pol(0.55, 50, TOP);
  P(
    new THREE.CylinderGeometry(0.32, 0.32, 0.03, 10),
    paint((p) => {
      const d = Math.hypot(p.x - PC[0], p.z - PC[2]);
      if (Math.abs(d - 0.17) < 0.01 || Math.abs(d - 0.26) < 0.008) return "#d9fbff";
      return mix("#7eeaf0", "#34b8e4", Math.min(1, d / 0.32));
    }),
    [PC[0], TOP + 0.012, PC[2]],
    {},
  );
  for (let k = 0; k < 11; k++) {
    const ang = k * 32.7;
    if (Math.abs(ang - 50) < 24) continue;
    const s = 0.05 + R() * 0.03;
    P(new THREE.DodecahedronGeometry(1, 0), STONE2, [
      PC[0] + 0.345 * Math.sin(ang * D),
      TOP + 0.02,
      PC[2] + 0.345 * Math.cos(ang * D),
    ], { scale: [s * 1.3, s, s * 1.3], flat: true, rotation: [0, R() * 360, 0] });
  }
  for (const [dx, dz, s] of [
    [-0.1, 0.08, 0.07],
    [0.12, -0.1, 0.055],
  ]) {
    P(new THREE.CylinderGeometry(s, s, 0.012, 8), "#4fbf5a", [PC[0] + dx, TOP + 0.034, PC[2] + dz]);
  }
  ball(0.03, "#ff9fc0", [PC[0] - 0.1, TOP + 0.05, PC[2] + 0.08], [1, 0.7, 1], 6);
  ball(0.022, "#ffffff", [PC[0] + 0.12, TOP + 0.045, PC[2] - 0.1], [1, 0.7, 1], 6);

  const FA = 50;
  const ux = Math.sin(FA * D);
  const uz = Math.cos(FA * D);
  const wx = Math.cos(FA * D);
  const wz = -Math.sin(FA * D);
  const fpt = (r: number, off: number, y: number): [number, number, number] => [
    r * ux + off * wx,
    y,
    r * uz + off * wz,
  ];
  b.sweep(
    catmull([pol(0.62, FA, 1.135), pol(0.85, FA, 1.135), pol(1.05, FA, 1.133), pol(1.2, FA, 1.122)]),
    { radius: [0.09, 0.012], section: "box", up: [0, 1, 0], caps: "flat", color: grain("#aef3ff", WATER, { size: 0.04, axis: [ux, 0, uz] }) },
  );
  const waterGrain = grain("#c8f8ff", "#43c6ee", { size: 0.03, axis: "y" });
  b.sweep(
    catmull([
      pol(1.0, FA, 1.137),
      pol(1.18, FA, 1.125),
      pol(1.265, FA, 1.04),
      pol(1.3, FA, 0.85),
      pol(1.31, FA, 0.5),
      pol(1.31, FA, 0.16),
    ]),
    (t) => [0.1 + 0.05 * t, 0.028],
    {
      section: "box",
      up: [0, 1, 0],
      caps: "flat",
      color: paint((p) => (p.y < 0.3 + 0.05 * noise(p, 0.06, 1) ? "#f4ffff" : waterGrain)),
      name: "fall",
    },
  );
  for (const off of [-0.06, 0.02, 0.07]) {
    b.sweep(
      catmull([fpt(1.2, off, 1.13), fpt(1.28, off, 1.02), fpt(1.345, off, 0.8), fpt(1.35, off, 0.35)]),
      [0.012, 0.01],
      "#ffffff",
      { sides: 4, caps: "flat" },
    );
  }
  // mist and spray
  for (const [dx, dy, dz, s] of [
    [0, 0.13, 0, 0.14],
    [0.12, 0.12, 0.05, 0.1],
    [-0.12, 0.13, -0.04, 0.11],
    [0.04, 0.2, 0.1, 0.09],
    [-0.05, 0.18, -0.12, 0.08],
    [0.2, 0.1, -0.08, 0.07],
  ]) {
    const c = fpt(1.35, dz, 0);
    ball(s, CLOUD, [c[0] + dx * ux, dy, c[2] + dx * uz], [1.1, 0.8, 1.1], 7);
  }
  for (let i = 0; i < 12; i++) {
    const y = 0.3 + R() * 0.45;
    const c = fpt(1.4 + R() * 0.12, (R() - 0.5) * 0.3, y);
    ball(0.012 + R() * 0.008, i % 2 ? "#ffffff" : "#aef3ff", c, undefined, 5);
  }
  // bank stones along the river
  for (const [r, off, s] of [
    [0.85, -0.13, 0.04],
    [0.95, 0.13, 0.045],
    [1.08, -0.12, 0.05],
    [1.12, 0.12, 0.04],
  ]) {
    P(new THREE.DodecahedronGeometry(1, 0), STONE2, fpt(r, off, TOP + 0.01), {
      scale: [s * 1.3, s, s * 1.3],
      flat: true,
      rotation: [0, R() * 360, 0],
    });
  }

  // ---- ruined gate ---------------------------------------------------------------------------------------
  const cx = -0.45;
  const cz = -0.35;
  const colOutline: Array<[number, number]> = [
    [0, 0],
    [0.11, 0],
    [0.11, 0.05],
    [0.085, 0.07],
    [0.08, 0.6],
    [0.1, 0.62],
    [0.1, 0.68],
    [0.125, 0.7],
    [0, 0.7],
  ];
  const brokenOutline: Array<[number, number]> = [
    [0, 0],
    [0.11, 0],
    [0.11, 0.05],
    [0.085, 0.07],
    [0.08, 0.28],
    [0.07, 0.36],
    [0.03, 0.31],
    [0.02, 0.4],
    [0, 0.34],
  ];
  b.lathe(colOutline, { at: [cx - 0.3, TOP - 0.01, cz], segments: 8, color: colPaint, name: "colL" });
  b.lathe(brokenOutline, { at: [cx + 0.3, TOP - 0.01, cz], segments: 8, color: colPaint, name: "colR" });
  // gold rings on the intact capital
  b.lathe(
    [
      [0.083, 0.54],
      [0.092, 0.54],
      [0.092, 0.585],
      [0.083, 0.585],
    ],
    { at: [cx - 0.3, TOP - 0.01, cz], segments: 8, color: GOLD, name: "colRing" },
  );
  // arch (left half, broken)
  const arch: Array<[number, number]> = [];
  for (let a = 180; a >= 70; a -= 10) arch.push([0.38 * Math.cos(a * D), 0.38 * Math.sin(a * D)]);
  for (let a = 70; a <= 180; a += 10) arch.push([0.22 * Math.cos(a * D), 0.22 * Math.sin(a * D)]);
  const archPaint = cel(
    paint((p, n, s) => {
      const r = Math.hypot(s[0], s[1]);
      if (r < 0.238 || r > 0.364) return GOLD;
      const ang = (Math.atan2(s[1], s[0]) / D + 360) % 360;
      if (ang % 14 < 1.3) return GROUT;
      if (n.y > 0.5 && noise(p, 0.12, 2) > 0.5) return MOSS_A;
      return mix(STONE_A, STONE_B, noise(p, 0.18, 4));
    }),
  );
  b.extrude(arch, {
    at: [cx, TOP + 0.7, cz],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.16,
    bevel: 0.015,
    color: archPaint,
    name: "arch",
  });
  // fallen arch fragments and column drum
  slabBox(0.22, 0.12, 0.16, STONE2, [cx + 0.42, TOP + 0.06, cz + 0.22], 25);
  slabBox(0.16, 0.1, 0.15, STONE, [cx + 0.55, TOP + 0.05, cz + 0.08], -15);
  P(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 8), STONE, [cx + 0.7, TOP + 0.1, cz - 0.15], {
    rotation: [0, 30, 90],
    flat: true,
  });
  P(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), GOLD, [cx + 0.77, TOP + 0.1, cz - 0.18], {
    rotation: [0, 30, 90],
    flat: true,
  });
  // tassels
  b.cards(
    [frame([cx - 0.22, TOP + 0.7 + 0.2, cz + 0.09], [0, 1, 0]), frame([cx - 0.02, TOP + 0.7 + 0.37, cz + 0.09], [0, 1, 0])],
    TASSEL,
    { size: [0.07, 0.22], lean: 180, flow: [0, 0, 1], sink: 0 },
  );
  // steps
  slabBox(0.85, 0.05, 0.3, STONE, [cx, TOP + 0.02, cz + 0.4]);
  slabBox(0.7, 0.05, 0.22, STONE2, [cx, TOP + 0.065, cz + 0.36]);
  slabBox(0.55, 0.05, 0.16, STONE, [cx, TOP + 0.11, cz + 0.32]);
  // rune circle
  glow(
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
      at: [cx, TOP + 0.004, cz - 0.02],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNE,
    }),
    1.1,
  );
  // pedestal and floating crystal
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.14, 0.04],
      [0.1, 0.07],
      [0.09, 0.2],
      [0.13, 0.24],
      [0.13, 0.27],
      [0, 0.27],
    ],
    { at: [cx, TOP, cz], segments: 8, color: STONE, name: "pedestal" },
  );
  b.lathe(
    [
      [0.1, 0.17],
      [0.112, 0.17],
      [0.112, 0.2],
      [0.1, 0.2],
    ],
    { at: [cx, TOP, cz], segments: 8, color: GOLD },
  );
  const cy = TOP + 0.62;
  glow(
    P(new THREE.OctahedronGeometry(1, 0), TEAL, [cx, cy, cz], {
      scale: [0.1, 0.2, 0.1],
      flat: true,
    }),
    1.6,
  );
  P(new THREE.TorusGeometry(0.19, 0.008, 5, 18), GOLD, [cx, cy, cz], { rotation: [75, 0, 20] });
  P(new THREE.TorusGeometry(0.25, 0.006, 5, 20), GOLD, [cx, cy, cz], { rotation: [20, 0, -40] });
  for (let i = 0; i < 5; i++) {
    const a = i * 72 * D;
    glow(
      P(new THREE.OctahedronGeometry(1, 0), i % 2 ? "#ffe9a0" : "#9ff5ea", [
        cx + 0.3 * Math.cos(a),
        cy - 0.08 + 0.1 * Math.sin(a * 2),
        cz + 0.3 * Math.sin(a),
      ], { scale: [0.018, 0.04, 0.018], flat: true }),
      1.3,
    );
  }
  // ruined wall
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < 5; i++) {
      if (c === 2 && R() > 0.5) continue;
      if (c === 1 && i > 3 && R() > 0.5) continue;
      slabBox(
        0.13,
        0.09,
        0.14,
        c % 2 ? STONE2 : STONE,
        [-0.55 + i * 0.14 + (c % 2) * 0.07, TOP + 0.045 + c * 0.09, -0.82 + (R() - 0.5) * 0.01],
        (R() - 0.5) * 6,
      );
    }
  }
  for (let i = 0; i < 7; i++) {
    const s = 0.025 + R() * 0.03;
    P(new THREE.DodecahedronGeometry(1, 0), i % 2 ? STONE : STONE2, [-0.9 + R() * 1.0, TOP + 0.015, -0.55 + (R() - 0.8) * 0.4], {
      scale: [s * 1.3, s, s * 1.3],
      flat: true,
      rotation: [0, R() * 360, 0],
    });
  }
  // stele with filigree
  slabBox(0.26, 0.5, 0.08, STONE, [0.3, TOP + 0.25, -0.78], 0);
  slabBox(0.3, 0.05, 0.12, GOLD, [0.3, TOP + 0.525, -0.78], 0);
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.34), "#ffffff", {
      at: [0.3, TOP + 0.27, -0.78 + 0.044],
      dir: [0, 0, 1],
      axis: "z",
      texture: FILI,
    }),
    0.6,
  );

  // ---- lantern -------------------------------------------------------------------------------------------
  const L: [number, number] = [0.1, 0.78];
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.09, 0.03],
      [0.05, 0.05],
      [0.05, 0.2],
      [0.09, 0.22],
      [0.09, 0.26],
      [0, 0.26],
    ],
    { at: [L[0], TOP, L[1]], segments: 6, color: STONE2, name: "lanternBase" },
  );
  glow(P(new THREE.BoxGeometry(0.1, 0.1, 0.1), "#ffcf6a", [L[0], TOP + 0.31, L[1]]), 1.5);
  slabBox(0.13, 0.025, 0.13, STONE, [L[0], TOP + 0.375, L[1]]);
  P(new THREE.CylinderGeometry(0, 0.13, 0.09, 4, 1), STONE, [L[0], TOP + 0.43, L[1]], { rotation: [0, 45, 0] });
  ball(0.022, GOLD, [L[0], TOP + 0.5, L[1]], undefined, 6);

  // ---- trees ---------------------------------------------------------------------------------------------
  const tree = (
    x: number,
    z: number,
    trunkH: number,
    lean: [number, number],
    canopy: Array<[number, number, number, number]>,
    leafPaint: Fill,
    tint: string,
  ) => {
    const y0 = TOP - 0.02;
    const top: [number, number, number] = [x + lean[0], y0 + trunkH, z + lean[1]];
    b.sweep(
      catmull([
        [x, y0, z],
        [x + lean[0] * 0.2, y0 + trunkH * 0.4, z + lean[1] * 0.2 + 0.03],
        [x + lean[0] * 0.7, y0 + trunkH * 0.75, z + lean[1] * 0.7],
        top,
      ]),
      [0.085, 0.04],
      BARK,
      { sides: 6 },
    );
    for (let k = 0; k < 4; k++) {
      const a = k * 90 + 30;
      b.spike(
        [x + 0.03 * Math.sin(a * D), y0 + 0.1, z + 0.03 * Math.cos(a * D)],
        [Math.sin(a * D), -0.5, Math.cos(a * D)],
        0.28,
        0.045,
        BARK,
        { sides: 5 },
      );
    }
    const frames: Array<ReturnType<typeof frame>> = [];
    canopy.forEach(([dx, dy, dz, r], i) => {
      const c: [number, number, number] = [top[0] + dx, top[1] + dy, top[2] + dz];
      if (i > 0)
        b.rod(
          [top[0], top[1] - 0.12, top[2]],
          [c[0], c[1] - r * 0.6, c[2]],
          [0.03, 0.015],
          BARK,
          { sides: 5 },
        );
      ball(r, i % 2 ? leafPaint : LEAF_G2 === leafPaint ? LEAF_G : leafPaint, c, [1, 0.88, 1], 8);
      const n = Math.round(r * 110);
      for (const d of dirs(n)) frames.push(frame([c[0] + d[0] * r * 0.95, c[1] + d[1] * r * 0.85, c[2] + d[2] * r * 0.95], d));
    });
    b.cards(frames, LEAF, {
      size: [0.15, 0.18],
      lean: 40,
      bend: 25,
      vary: 0.3,
      spin: 180,
      rng: R,
      color: tint,
    });
  };
  tree(0.62, -0.42, 0.75, [-0.06, 0.04], [
    [0, 0.2, 0, 0.3],
    [0.25, 0.05, 0.05, 0.22],
    [-0.25, 0.02, 0.0, 0.23],
    [0.05, 0.05, 0.25, 0.22],
    [-0.02, 0.05, -0.25, 0.22],
  ], LEAF_G, "#8be05a");
  tree(-0.62, 0.62, 0.55, [0.04, -0.03], [
    [0, 0.18, 0, 0.26],
    [0.2, 0.0, 0.05, 0.19],
    [-0.2, 0.02, 0.0, 0.2],
    [0.0, 0.03, 0.2, 0.18],
  ], PINK, "#ffb3cf");
  // pine
  {
    const px = 0.88;
    const pz = -0.3;
    P(new THREE.CylinderGeometry(0.04, 0.055, 0.3, 6), BARK, [px, TOP + 0.13, pz], { flat: true });
    const tiers: Array<[number, number, number]> = [
      [0.26, 0.34, 0.3],
      [0.21, 0.3, 0.5],
      [0.16, 0.26, 0.7],
      [0.1, 0.22, 0.88],
    ];
    tiers.forEach(([r, h, y], i) =>
      P(new THREE.CylinderGeometry(0, r, h, 7, 1), i % 2 ? cel("#46b87a") : cel("#3fae6a"), [px, TOP + y, pz], {
        flat: true,
      }),
    );
    glow(P(new THREE.OctahedronGeometry(1, 0), TEAL, [px, TOP + 1.06, pz], { scale: [0.03, 0.05, 0.03], flat: true }), 1.4);
  }

  // ---- bushes, mushrooms, tufts, flowers -----------------------------------------------------------------
  const bush = (x: number, z: number, s: number) => {
    ball(0.12 * s, LEAF_G, [x, TOP + 0.07 * s, z], [1.2, 0.9, 1.1], 7);
    ball(0.1 * s, LEAF_G2, [x + 0.1 * s, TOP + 0.06 * s, z + 0.04 * s], [1, 0.9, 1], 7);
    ball(0.09 * s, LEAF_G, [x - 0.08 * s, TOP + 0.06 * s, z - 0.05 * s], [1, 0.9, 1], 7);
    for (let i = 0; i < 4; i++)
      ball(0.018 * s, i % 2 ? "#ff6a8a" : "#ffe45e", [x + (R() - 0.5) * 0.2 * s, TOP + 0.1 * s + R() * 0.06 * s, z + 0.1 * s + R() * 0.05], undefined, 5);
  };
  bush(0.12, -0.55, 1.1);
  bush(-0.85, 0.15, 1);
  bush(0.95, 0.2, 0.9);
  bush(-0.2, 0.9, 0.9);
  for (const [mx, mz, s] of [
    [0.4, -0.2, 1],
    [0.46, -0.16, 0.7],
    [-0.4, 0.45, 0.9],
  ]) {
    P(new THREE.CylinderGeometry(0.014 * s, 0.018 * s, 0.06 * s, 6), "#fff4d2", [mx, TOP + 0.03 * s, mz], { flat: true });
    P(new THREE.SphereGeometry(0.045 * s, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), cel("#f06a7a"), [mx, TOP + 0.06 * s, mz], { flat: true });
    ball(0.01 * s, "#ffffff", [mx + 0.015 * s, TOP + 0.095 * s, mz], undefined, 5);
    ball(0.008 * s, "#ffffff", [mx - 0.02 * s, TOP + 0.085 * s, mz + 0.015 * s], undefined, 5);
  }

  const circles: Array<[number, number, number]> = [
    [PC[0], PC[2], 0.42],
    [0.62, -0.42, 0.2],
    [-0.62, 0.62, 0.2],
    [0.88, -0.3, 0.22],
    [0.1, 0.78, 0.2],
    [0.12, -0.55, 0.15],
    [-0.85, 0.15, 0.14],
    [0.95, 0.2, 0.14],
    [-0.2, 0.9, 0.14],
    [0.4, -0.18, 0.1],
    [-0.4, 0.45, 0.1],
  ];
  const blocked = (x: number, z: number) => {
    if (circles.some(([qx, qz, r]) => Math.hypot(x - qx, z - qz) < r)) return true;
    if (x > -0.95 && x < 0.0 && z > -0.6 && z < 0.3) return true;
    if (x > -0.62 && x < 0.45 && z < -0.7) return true;
    const l = x * wx + z * wz;
    const a = x * ux + z * uz;
    return a > 0.7 && Math.abs(l) < 0.17;
  };
  const scatter = (n: number, minD: number) => {
    const pts: Array<[number, number]> = [];
    for (let tries = 0; tries < 4000 && pts.length < n; tries++) {
      const rr = Math.sqrt(R()) * 1.05;
      const a = R() * Math.PI * 2;
      const x = rr * Math.sin(a);
      const z = rr * Math.cos(a);
      if (blocked(x, z)) continue;
      if (pts.some(([qx, qz]) => Math.hypot(x - qx, z - qz) < minD)) continue;
      pts.push([x, z]);
    }
    return pts;
  };
  b.cards(
    scatter(95, 0.09).map(([x, z]) => frame([x, TOP - 0.005, z], [0, 1, 0])),
    GRASSTEX,
    { size: [0.12, 0.13], cross: true, vary: 0.4, spin: 180, bend: 15, rng: R, color: "#ffffff" },
  );
  const fl = scatter(27, 0.12);
  FLOWERS.forEach((tex, k) => {
    const mine = fl.filter((_, i) => i % 3 === k);
    b.cards(
      mine.map(([x, z]) => frame([x, TOP - 0.005, z], [0, 1, 0])),
      tex,
      { size: [0.07, 0.14], cross: true, vary: 0.3, spin: 180, rng: R, color: "#ffffff" },
    );
  });

  // ---- vines under the lip -------------------------------------------------------------------------------
  const vineAz: number[] = [];
  for (let a = 0; a < 360; a += 13) if (Math.abs(a - FA) > 16) vineAz.push(a);
  b.cards(
    vineAz.map((a) => frame(pol(1.15, a, 0.99), [0, 1, 0])),
    VINE,
    {
      size: [0.07, 0.3],
      lean: 180,
      vary: 0.5,
      rng: R,
      sink: 0,
      color: "#ffffff",
      flow: (_f, i) => [Math.sin(vineAz[i] * D), 0, Math.cos(vineAz[i] * D)],
    },
  );

  // falling petals around the blossom tree
  const petals: Array<ReturnType<typeof frame>> = [];
  for (let i = 0; i < 16; i++)
    petals.push(frame([-0.62 + (R() - 0.5) * 0.9, 1.3 + R() * 0.9, 0.62 + (R() - 0.5) * 0.9], [0, 1, 0]));
  b.cards(petals, PETAL, { size: 0.05, lean: 90, flow: [1, 0, 0], spin: 180, rng: R, color: "#ffffff" });

  // ---- drifting rocks ------------------------------------------------------------------------------------
  const floatRock = (at: [number, number, number], s: number, crystalColor: string) => {
    P(new THREE.DodecahedronGeometry(1, 0), ROCKP, at, {
      scale: [s, s * 0.7, s],
      flat: true,
      rotation: [10, R() * 360, 5],
    });
    ball(s * 0.82, cel("#7fd957"), [at[0], at[1] + s * 0.5, at[2]], [1, 0.3, 1], 7);
    b.spike([at[0], at[1] - s * 0.4, at[2]], [0, -1, 0], s * 1.1, s * 0.4, ROCKP, { sides: 5 });
    crystal([at[0] + s * 0.3, at[1] + s * 0.58, at[2]], [0.3, 1, 0.1], s * 0.5, crystalColor, 1.3);
  };
  floatRock(pol(1.42, -70, 1.35), 0.2, TEAL);
  floatRock(pol(1.38, 150, 0.7), 0.15, "#7fb6ff");
  floatRock(pol(1.4, -150, 1.65), 0.12, TEAL);
  for (const [a, r, y] of [
    [-100, 1.5, 1.0],
    [170, 1.5, 1.15],
    [110, 1.45, 1.5],
  ]) {
    P(new THREE.DodecahedronGeometry(1, 0), ROCKP, pol(r, a, y), { scale: 0.05, flat: true, rotation: [R() * 90, R() * 90, 0] });
  }

  return b.root;
}
