import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { grain, mottle, paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall arched wizard's bookshelf in cel-shaded high-fantasy anime style: gold-trimmed walnut frame, leaning tomes, scrolls, glowing orbs, melted candles, a skull, potions and an hourglass.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------- palette ----------
const WOOD = cel(grain("#7a4a3a", "#8d5a45", { size: 0.03, axis: "y", seed: 2 }), "#4a2a3a");
const WOOD_H = cel(grain("#7a4a3a", "#8d5a45", { size: 0.03, axis: "x", seed: 3 }), "#4a2a3a");
const WOOD_DARK = cel("#4d2c3c", "#2c1730");
const BACK = cel(stripes("#3a2858", "#44306a", { size: 0.07, axis: "x", width: 0.5, wobble: 0.1, seed: 4 }), "#241640");
const GOLD = cel("#f7c948", "#c8742a");
const GOLD_D = cel("#d9a032", "#a0561f");
const PARCH = cel("#fff0c8", "#e8b98a");
const PARCH_D = cel("#ecd09a", "#c99668");
const RIBBON = cel("#d23a58", "#8c1f4a");
const WAX = cel("#fff6e0", "#e0b8a0");
const WAX_R = cel("#ef6f8e", "#b83c78");
const IRON = cel("#6b6f8e", "#3c3a5e");
const GLASS_T = "#9fe9ff";

const COVERS = [
  ["#c63a4f", "#e8b53c"],
  ["#2e6fd0", "#f2d36b"],
  ["#2f9a74", "#f2d36b"],
  ["#7b3fb8", "#f0c6ff"],
  ["#e07b2a", "#fff0c8"],
  ["#1f4f6b", "#9fe9ff"],
  ["#a8324f", "#f7c948"],
  ["#4c3a9a", "#f7c948"],
  ["#2b8a8a", "#fff0c8"],
];

// ---------- textures ----------
const RUNE_SVG = (c: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
<circle cx="32" cy="32" r="22"/><path d="M32 12 L32 52 M18 26 L46 38 M46 26 L18 38"/><circle cx="32" cy="32" r="7"/></g></svg>`,
    { size: 192 },
  );
const RUNE_GOLD = RUNE_SVG("#ffe27a");

const SPINE_BAND = svg(
  `<svg viewBox="0 0 32 96"><rect x="0" y="6" width="32" height="5" fill="#f7c948"/><rect x="0" y="85" width="32" height="5" fill="#f7c948"/>
<rect x="6" y="28" width="20" height="30" rx="3" fill="none" stroke="#f7c948" stroke-width="3"/>
<path d="M16 32 L20 43 L16 54 L12 43Z" fill="#f7c948"/><circle cx="16" cy="70" r="3" fill="#f7c948"/><circle cx="16" cy="20" r="2" fill="#f7c948"/></svg>`,
  { size: 192 },
);
const SPINE_BAND2 = svg(
  `<svg viewBox="0 0 32 96"><rect x="0" y="10" width="32" height="3" fill="#fff0c8"/><rect x="0" y="16" width="32" height="2" fill="#fff0c8"/>
<rect x="0" y="80" width="32" height="2" fill="#fff0c8"/><rect x="0" y="84" width="32" height="3" fill="#fff0c8"/>
<path d="M16 28 C8 36 8 48 16 62 C24 48 24 36 16 28Z" fill="none" stroke="#fff0c8" stroke-width="3"/><circle cx="16" cy="45" r="3" fill="#fff0c8"/></svg>`,
  { size: 192 },
);
const COVER_EMB = svg(
  `<svg viewBox="0 0 64 80"><rect x="4" y="4" width="56" height="72" rx="3" fill="none" stroke="#f7c948" stroke-width="3"/>
<rect x="10" y="10" width="44" height="60" rx="2" fill="none" stroke="#f7c948" stroke-width="1.5"/>
<g fill="none" stroke="#f7c948" stroke-width="2.5" stroke-linecap="round"><circle cx="32" cy="40" r="14"/>
<path d="M32 20 L32 60 M18 32 L46 48 M46 32 L18 48"/><circle cx="32" cy="40" r="5"/></g>
<g fill="#f7c948"><circle cx="12" cy="12" r="2.2"/><circle cx="52" cy="12" r="2.2"/><circle cx="12" cy="68" r="2.2"/><circle cx="52" cy="68" r="2.2"/></g></svg>`,
  { size: 192 },
);
const SCROLL_TEXT = svg(
  `<svg viewBox="0 0 96 40"><rect width="96" height="40" fill="#f4dca8"/>
<g stroke="#7a4a3a" stroke-width="1.6" stroke-linecap="round" fill="none">
<path d="M6 8 H40 M44 8 H90 M6 14 H60 M64 14 H88 M6 20 H30 M34 20 H84 M6 26 H50 M54 26 H90 M6 32 H70"/></g>
<circle cx="80" cy="33" r="4" fill="none" stroke="#c63a4f" stroke-width="1.6"/></svg>`,
  { size: 192 },
);
const FLAME = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 2 C24 18 30 28 28 42 C27 54 20 62 16 62 C10 62 4 54 4 42 C4 28 12 20 16 2Z" fill="#ff9a2e"/>
<path d="M16 18 C21 28 24 36 22 46 C21 54 18 58 16 58 C13 58 10 54 10 46 C9 36 13 28 16 18Z" fill="#ffd95a"/>
<path d="M16 36 C19 42 20 48 18 54 C17 57 15 57 14 54 C12 48 13 42 16 36Z" fill="#fff8d0"/></svg>`,
  { size: 128 },
);
const STAR = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13Z" fill="#ffe27a"/></svg>`,
  { size: 96 },
);
const LABEL = svg(
  `<svg viewBox="0 0 32 40"><rect x="1" y="1" width="30" height="38" rx="3" fill="#fff0c8" stroke="#a0561f" stroke-width="2"/>
<path d="M16 8 L19 16 L16 30 L13 16Z" fill="#7b3fb8"/><path d="M8 20 H24" stroke="#7b3fb8" stroke-width="2"/></svg>`,
  { size: 96 },
);
const EYE_ORB = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff0c8"/><circle cx="32" cy="32" r="17" fill="#2e6fd0"/>
<circle cx="32" cy="32" r="9" fill="#22112f"/><circle cx="26" cy="26" r="5" fill="#ffffff"/><circle cx="38" cy="38" r="2.4" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const SKY_ORB = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#7b3fb8"/>
<path d="M0 40 C16 28 24 52 40 38 C50 30 58 40 64 34 V64 H0Z" fill="#4c3a9a"/>
<g fill="#ffe27a"><circle cx="12" cy="12" r="2"/><circle cx="44" cy="10" r="2.5"/><circle cx="30" cy="22" r="1.6"/><circle cx="54" cy="26" r="1.6"/></g></svg>`,
  { size: 128 },
);
const PAGE_EDGE = paint((p) => (Math.floor(p.y / 0.003) % 2 ? "#f7e6b8" : "#e9cf98"));

// ---------- dimensions ----------
const W = 1.3; // outer width
const D = 0.4; // depth
const T = 0.04; // board thickness
const BASE_H = 0.14;
const SH = [0.14, 0.58, 0.98, 1.38, 1.76]; // shelf board top surfaces (y of board bottom)
const TOP = 1.76; // top shelf board
const R = rng(7);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 2048 });
  const rand = rng(11);
  const f = (lo: number, hi: number) => lo + (hi - lo) * rand();

  const IN = W / 2 - T; // inner half width
  const PTOP = (y: number) => y + T; // top surface of shelf board at y

  // ======================= CARCASS =======================
  // plinth base
  b.part(new THREE.BoxGeometry(W + 0.1, 0.1, D + 0.1), WOOD_DARK, { at: [0, 0.05, 0.0] });
  b.part(new THREE.BoxGeometry(W + 0.04, 0.03, D + 0.04), WOOD_H, { at: [0, 0.115, 0] });
  b.part(new THREE.BoxGeometry(W + 0.12, 0.012, D + 0.12), GOLD, { at: [0, 0.1, 0] });
  // gold feet studs
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.035, 8, 6), GOLD, { at: [sx * (W / 2 + 0.03), 0.045, sz * (D / 2 + 0.03)] });
    }
  // sides
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(T, TOP + T - 0.13, D), WOOD, { at: [s * (W / 2 - T / 2), 0.13 + (TOP + T - 0.13) / 2, 0] });
    // gold edge trim on front of side
    b.part(new THREE.BoxGeometry(0.012, TOP + T - 0.13, 0.012), GOLD, { at: [s * (W / 2 - T / 2), 0.13 + (TOP + T - 0.13) / 2, D / 2 + 0.004] });
    // outer carved pilaster strips
    b.part(new THREE.BoxGeometry(0.03, TOP - 0.2, 0.03), WOOD_DARK, { at: [s * (W / 2 + 0.012), 0.13 + (TOP - 0.2) / 2 + 0.05, D / 2 - 0.05] });
    // pilaster capitals / bases
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.06), GOLD_D, { at: [s * (W / 2 + 0.012), 0.17, D / 2 - 0.05] });
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.06), GOLD_D, { at: [s * (W / 2 + 0.012), TOP - 0.05, D / 2 - 0.05] });
  }
  // back panel
  b.part(new THREE.BoxGeometry(W - 2 * T, TOP + T - 0.13, 0.02), BACK, { at: [0, 0.13 + (TOP + T - 0.13) / 2, -D / 2 + 0.01] });
  // back panel stars
  {
    const starFrames = [];
    for (let i = 0; i < 26; i++) {
      const x = f(-IN + 0.04, IN - 0.04);
      const y = f(0.2, TOP - 0.05);
      starFrames.push({ at: new THREE.Vector3(x, y, -D / 2 + 0.022), axis: new THREE.Vector3(0, 0, 1) });
    }
    for (const sf of starFrames) {
      const s = f(0.02, 0.045);
      glow(
        b.part(new THREE.PlaneGeometry(s, s), "#ffffff", { at: sf.at, dir: [0, 0, 1], axis: "z", texture: STAR }),
        1.2,
      );
    }
  }
  // shelves
  for (let i = 0; i < SH.length; i++) {
    const y = SH[i];
    b.part(new THREE.BoxGeometry(W - 2 * T, T, D - 0.02), WOOD_H, { at: [0, y + T / 2, 0.01] });
    // front gold lip + dark face band
    b.part(new THREE.BoxGeometry(W - 2 * T, 0.012, 0.012), GOLD, { at: [0, y + T - 0.006, D / 2 + 0.002] });
    b.part(new THREE.BoxGeometry(W - 2 * T, 0.008, 0.01), GOLD_D, { at: [0, y + 0.004, D / 2 + 0.002] });
    // carved rail dots along front edge
    for (let k = 0; k < 15; k++) {
      const x = -IN + 0.06 + k * ((2 * IN - 0.12) / 14);
      b.part(new THREE.SphereGeometry(0.0085, 5, 4), GOLD_D, { at: [x, y + T / 2 - 0.004, D / 2 + 0.004] });
    }
  }
  // vertical dividers in lower bays (two middle shelves) for structure
  const dividers: Array<[number, number, number]> = [
    [0.18, SH[1], 0.14 + T],
    [-0.2, SH[2], SH[1] + T],
  ];
  void dividers;
  b.part(new THREE.BoxGeometry(T * 0.8, SH[2] - SH[1] - T, D - 0.04), WOOD, { at: [0.22, (SH[1] + T + SH[2]) / 2, 0] });
  b.part(new THREE.BoxGeometry(T * 0.8, SH[3] - SH[2] - T, D - 0.04), WOOD, { at: [-0.18, (SH[2] + T + SH[3]) / 2, 0] });
  b.part(new THREE.BoxGeometry(T * 0.8, SH[4] - SH[3] - T, D - 0.04), WOOD, { at: [0.12, (SH[3] + T + SH[4]) / 2, 0] });
  // gold caps on dividers front
  for (const [x, y0, y1] of [
    [0.22, SH[1], SH[2]],
    [-0.18, SH[2], SH[3]],
    [0.12, SH[3], SH[4]],
  ] as Array<[number, number, number]>) {
    b.part(new THREE.BoxGeometry(0.012, y1 - y0 - T, 0.012), GOLD, { at: [x, (y0 + T + y1) / 2, D / 2 - 0.018] });
  }

  // ======================= ARCHED CROWN =======================
  // top board
  b.part(new THREE.BoxGeometry(W + 0.08, 0.05, D + 0.06), WOOD_DARK, { at: [0, TOP + T + 0.025, 0] });
  b.part(new THREE.BoxGeometry(W + 0.12, 0.014, D + 0.1), GOLD, { at: [0, TOP + T + 0.057, 0] });
  b.part(new THREE.BoxGeometry(W + 0.02, 0.03, D + 0.02), WOOD_H, { at: [0, TOP + T - 0.015, 0] });
  // crown headpiece: extruded gothic arch silhouette
  const arch: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.62, 0],
    [0.62, 0],
    [0.62, 0.06],
    [0.5, 0.1],
    [0.38, 0.2],
    [0.24, 0.22],
    [0.14, 0.3],
    [0.06, 0.38],
    [0, 0.5, "sharp"],
    [-0.06, 0.38],
    [-0.14, 0.3],
    [-0.24, 0.22],
    [-0.38, 0.2],
    [-0.5, 0.1],
    [-0.62, 0.06],
  ];
  const crown = b.extrude(arch, {
    at: [0, TOP + T + 0.064, 0],
    x: [1, 0, 0],
    thickness: 0.07,
    bevel: 0.012,
    smoothing: 1,
    color: WOOD,
  });
  void crown;
  // gold inlay outline of arch (slightly smaller, in front)
  const archIn: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.55, 0.035],
    [0.55, 0.035],
    [0.55, 0.06],
    [0.46, 0.085],
    [0.36, 0.17],
    [0.23, 0.19],
    [0.13, 0.27],
    [0.055, 0.35],
    [0, 0.44, "sharp"],
    [-0.055, 0.35],
    [-0.13, 0.27],
    [-0.23, 0.19],
    [-0.36, 0.17],
    [-0.46, 0.085],
    [-0.55, 0.06],
  ];
  b.extrude(archIn, {
    at: [0, TOP + T + 0.064, 0.0],
    x: [1, 0, 0],
    thickness: 0.078,
    bevel: 0.004,
    smoothing: 1,
    color: PARCH_D,
  });
  b.extrude(archIn.map(([x, y, k]) => (k ? [x * 0.94, y * 0.94 + 0.01, k] : [x * 0.94, y * 0.94 + 0.01])) as Array<[number, number] | [number, number, "sharp"]>, {
    at: [0, TOP + T + 0.064, 0.0],
    x: [1, 0, 0],
    thickness: 0.086,
    bevel: 0.004,
    smoothing: 1,
    color: BACK,
  });
  // big rune medallion at crown centre
  const medal = b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.11, 0.008],
      [0.1, 0.016],
      [0, 0.02],
    ],
    { at: [0, TOP + T + 0.19, D / 2 + 0.032], axis: "z" as never, color: GOLD, segments: 14 } as never,
  );
  void medal;
  glow(
    b.part(new THREE.CircleGeometry(0.085, 20), "#ffffff", {
      at: [0, TOP + T + 0.195, D / 2 + 0.046],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE_GOLD,
    }),
    1.3,
  );
  // finials along crown
  for (const x of [-0.6, -0.4, 0.4, 0.6]) {
    const yy = x * x < 0.2 ? 0.1 : 0.06;
    b.rod([x, TOP + T + 0.064, D / 2 - 0.04], [x, TOP + T + 0.064 + yy + 0.08, D / 2 - 0.04], 0.018, GOLD, { sides: 6 });
    b.part(new THREE.SphereGeometry(0.028, 8, 6), GOLD, { at: [x, TOP + T + 0.064 + yy + 0.1, D / 2 - 0.04] });
  }
  // crown spire star
  b.spike([0, TOP + T + 0.55, 0], [0, 1, 0], 0.16, 0.025, GOLD, { sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.038, 10, 8), "#ffe27a", { at: [0, TOP + T + 0.545, 0] }), 1.5);
  // crescent moon on the crown top
  {
    const moon: Array<[number, number]> = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI * 0.45 + (i / n) * Math.PI * 0.9;
      moon.push([Math.cos(a) * 0.07 + 0.0, Math.sin(a) * 0.07]);
    }
    for (let i = n; i >= 0; i--) {
      const a = -Math.PI * 0.45 + (i / n) * Math.PI * 0.9;
      moon.push([Math.cos(a) * 0.045 + 0.022, Math.sin(a) * 0.052]);
    }
    // dedupe-safe: build as a lathe-free simple extrude with sharp tips
    b.extrude(moon.map((p, i) => (i === 0 || i === n ? [p[0], p[1], "sharp"] : p)) as Array<[number, number] | [number, number, "sharp"]>, {
      at: [-0.39, TOP + T + 0.22, 0],
      x: [1, 0, 0],
      thickness: 0.02,
      color: GOLD,
    });
  }
  // sun disc on right of crown
  glow(b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), "#ffe27a", { at: [0.39, TOP + T + 0.26, 0], rotation: [90, 0, 0] }), 1.2);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike([0.39 + Math.cos(a) * 0.05, TOP + T + 0.26 + Math.sin(a) * 0.05, 0], [Math.cos(a), Math.sin(a), 0], 0.035, 0.01, GOLD, { sides: 4 });
  }

  // ======================= HANGING DRAPE / TASSELS =======================
  for (const s of [1, -1]) {
    b.rod([s * 0.66, TOP - 0.02, D / 2 - 0.05], [s * 0.66, TOP - 0.3, D / 2 - 0.05], 0.006, GOLD, { sides: 4 });
    b.part(new THREE.SphereGeometry(0.022, 6, 5), RIBBON, { at: [s * 0.66, TOP - 0.315, D / 2 - 0.05] });
    b.cone = undefined as never;
  }

  // ======================= SHELF CONTENTS =======================
  const bookSpine = (
    x: number,
    y0: number,
    w: number,
    h: number,
    dd: number,
    ci: number,
    tilt = 0,
    zc = 0,
    lean = 0,
  ) => {
    const [cov, trim] = COVERS[ci % COVERS.length];
    const cover = cel(cov);
    const tc = cel(trim);
    const hh = h;
    const cx = x;
    const cy = y0 + hh / 2;
    const rot: [number, number, number] = [lean, 0, tilt];
    // pages block (slightly inset, lighter)
    b.part(new THREE.BoxGeometry(w - 0.012, hh - 0.012, dd - 0.01), PAGE_EDGE, {
      at: [cx, cy, zc - 0.006],
      rotation: rot,
    });
    // cover: back board + spine board + front board as a box slab pair
    b.part(new THREE.BoxGeometry(w, hh, 0.008), cover, { at: [cx, cy, zc + dd / 2 - 0.004 + 0.0], rotation: rot });
    b.part(new THREE.BoxGeometry(w, hh, 0.008), cover, { at: [cx, cy, zc - dd / 2 + 0.004], rotation: rot });
    // spine facing +Z? Books face out with the spine at the front (+Z); front board is the spine side
    // spine plate across width (front face)
    // (the two boards above are the covers on the left/right; use side panels)
    for (const sx of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.008, hh, dd), cover, {
        at: [cx + sx * (w / 2 - 0.004), cy, zc],
        rotation: rot,
      });
    }
    // trim bands on the spine
    const band = b.part(new THREE.PlaneGeometry(w * 0.92, hh * 0.9), "#ffffff", {
      at: [cx, cy, zc + dd / 2 + 0.0015],
      rotation: rot,
      texture: ci % 2 ? SPINE_BAND2 : SPINE_BAND,
      color: trim,
    });
    void band;
    void tc;
  };

  // helper: a row of upright books between xA and xB on a shelf with y base
  const bookRow = (xA: number, xB: number, yBase: number, maxH: number, seedC: number, tiltEnd = true) => {
    let x = xA;
    let ci = seedC;
    const out: Array<{ x: number; h: number; w: number }> = [];
    while (x < xB - 0.04) {
      const w = f(0.035, 0.07);
      const h = Math.min(maxH, f(0.24, maxH));
      const dd = f(0.19, 0.27);
      if (x + w > xB) break;
      bookSpine(x + w / 2, yBase, w, h, dd, ci++, 0, 0.0);
      out.push({ x: x + w / 2, h, w });
      x += w + 0.002;
    }
    // leaning last book
    if (tiltEnd) {
      const w = 0.05;
      const h = Math.min(maxH, 0.3);
      const tilt = -0.28;
      bookSpine(x + 0.04, yBase, w, h, 0.22, ci++, tilt, 0.0);
    }
    return x;
  };
  void bookRow;

  // wide horizontal stack of books
  const bookStack = (cx: number, yBase: number, cz: number, n: number, ci: number, wMax = 0.3) => {
    let y = yBase;
    for (let i = 0; i < n; i++) {
      const [cov, trim] = COVERS[(ci + i) % COVERS.length];
      const w = wMax - i * 0.025 + f(-0.01, 0.01);
      const d = 0.2 - i * 0.01;
      const h = f(0.035, 0.055);
      const rz = f(-0.18, 0.18);
      const ox = f(-0.015, 0.015);
      // pages
      b.part(new THREE.BoxGeometry(w - 0.008, h - 0.012, d - 0.006), PAGE_EDGE, { at: [cx + ox, y + h / 2, cz], rotation: [0, rz * 57, 0] });
      b.part(new THREE.BoxGeometry(w, 0.009, d), cel(cov), { at: [cx + ox, y + 0.0045, cz], rotation: [0, rz * 57, 0] });
      b.part(new THREE.BoxGeometry(w, 0.009, d), cel(cov), { at: [cx + ox, y + h - 0.0045, cz], rotation: [0, rz * 57, 0] });
      b.part(new THREE.BoxGeometry(0.009, h, d), cel(cov), { at: [cx + ox - Math.cos(rz) * (w / 2 - 0.0045), y + h / 2, cz + Math.sin(rz) * (w / 2 - 0.0045)], rotation: [0, rz * 57, 0] });
      // gold corner pieces
      b.part(new THREE.BoxGeometry(0.02, h + 0.004, 0.02), cel(trim), { at: [cx + ox + Math.cos(rz) * (w / 2 - 0.006) - Math.sin(rz) * (d / 2 - 0.006), y + h / 2, cz - Math.sin(rz) * (w / 2 - 0.006) - Math.cos(rz) * (d / 2 - 0.006)], rotation: [0, rz * 57, 0] });
      // title plate on cover top
      b.part(new THREE.PlaneGeometry(w * 0.5, d * 0.5), "#ffffff", {
        at: [cx + ox, y + h + 0.0015, cz],
        dir: [0, 1, 0],
        axis: "z",
        texture: COVER_EMB,
        color: "#ffffff",
        rotation: undefined,
      });
      y += h;
    }
    return y;
  };

  // gold-edged leaning tome (hero tome standing open-ish): a big book standing
  const bigTome = (cx: number, yBase: number, cz: number, ci: number, rotY = 0, tilt = 0) => {
    const [cov, trim] = COVERS[ci % COVERS.length];
    const w = 0.2;
    const h = 0.3;
    const d = 0.055;
    const c = cel(cov);
    const tc = cel(trim);
    const rot: [number, number, number] = [0, rotY, tilt];
    b.part(new THREE.BoxGeometry(w - 0.01, h - 0.01, d - 0.012), PAGE_EDGE, { at: [cx, yBase + h / 2, cz], rotation: rot });
    b.part(new THREE.BoxGeometry(w, h, 0.01), c, { at: [cx, yBase + h / 2, cz + d / 2 - 0.005], rotation: rot });
    b.part(new THREE.BoxGeometry(w, h, 0.01), c, { at: [cx, yBase + h / 2, cz - d / 2 + 0.005], rotation: rot });
    b.part(new THREE.BoxGeometry(0.012, h + 0.004, d + 0.004), c, { at: [cx - w / 2 + 0.006, yBase + h / 2, cz], rotation: rot });
    // front cover embossing
    b.part(new THREE.PlaneGeometry(w * 0.85, h * 0.85), "#ffffff", {
      at: [cx, yBase + h / 2, cz + d / 2 + 0.002],
      rotation: rot,
      texture: COVER_EMB,
    });
    // corner caps and clasp
    for (const sy of [1, -1])
      for (const sx of [1, -1])
        b.part(new THREE.BoxGeometry(0.03, 0.03, d + 0.008), tc, {
          at: [cx + sx * (w / 2 - 0.012), yBase + h / 2 + sy * (h / 2 - 0.012), cz],
          rotation: rot,
        });
    b.part(new THREE.BoxGeometry(0.03, 0.05, 0.012), tc, { at: [cx + w / 2 - 0.005, yBase + h / 2, cz + d / 2 + 0.002], rotation: rot });
    glow(b.part(new THREE.SphereGeometry(0.011, 6, 5), "#ff5a7a", { at: [cx + w / 2 - 0.005, yBase + h / 2, cz + d / 2 + 0.012], rotation: rot }), 1.2);
  };
  void bigTome;

  // ---------------- shelf 0 (bottom bay y0 = 0.14+T) : large tomes and chest-like books ----------------
  {
    const y0 = PTOP(SH[0]);
    const maxH = SH[1] - y0 - 0.04;
    // left: row of tall books
    let x = -IN + 0.02;
    let ci = 0;
    while (x < -0.04) {
      const w = f(0.04, 0.075);
      const h = f(0.26, maxH);
      if (x + w > -0.02) break;
      bookSpine(x + w / 2, y0, w, h, f(0.22, 0.3), ci++);
      x += w + 0.002;
    }
    // leaning book
    bookSpine(x + 0.09, y0, 0.06, 0.3, 0.24, ci++, -0.32);
    // centre: stack of fat tomes with a skull on top
    const top = bookStack(0.2, y0, 0.0, 4, 2, 0.38);
    // skull on top of stack
    const sk = new THREE.Vector3(0.2, top + 0.052, 0.01);
    b.part(new THREE.SphereGeometry(0.06, 10, 8), cel("#f4ead0", "#c9b3a0"), { at: sk, scale: [1, 0.95, 1.05] });
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.06), cel("#f4ead0", "#c9b3a0"), { at: [sk.x, sk.y - 0.05, sk.z + 0.02] });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.017, 6, 5), INK, { at: [sk.x + s * 0.024, sk.y + 0.0, sk.z + 0.052] });
      glow(b.part(new THREE.SphereGeometry(0.007, 5, 4), "#7dffb0", { at: [sk.x + s * 0.024, sk.y + 0.0, sk.z + 0.062] }), 1.5);
    }
    b.part(new THREE.BoxGeometry(0.012, 0.016, 0.01), INK, { at: [sk.x, sk.y - 0.025, sk.z + 0.062] });
    for (let k = -2; k <= 2; k++) b.part(new THREE.BoxGeometry(0.006, 0.018, 0.008), "#ffffff", { at: [sk.x + k * 0.01, sk.y - 0.058, sk.z + 0.052] });
    // right: stack of books on their side and upright tall ones
    let x2 = 0.43;
    while (x2 < IN - 0.06) {
      const w = f(0.04, 0.06);
      const h = f(0.28, maxH);
      bookSpine(x2 + w / 2, y0, w, h, f(0.22, 0.28), ci++);
      x2 += w + 0.002;
    }
  }

  // ---------------- shelf 1 (y0 = 0.58+T) : left tomes, orb on a stand, scrolls ----------------
  {
    const y0 = PTOP(SH[1]);
    const maxH = SH[2] - y0 - 0.05;
    let ci = 3;
    // left row of books
    let x = -IN + 0.02;
    while (x < -0.32) {
      const w = f(0.04, 0.07);
      const h = f(0.24, maxH);
      bookSpine(x + w / 2, y0, w, h, f(0.2, 0.28), ci++);
      x += w + 0.002;
    }
    bookSpine(x + 0.06, y0, 0.055, 0.33, 0.24, ci++, -0.3);
    // crystal ball on a golden claw stand (centre, x = -0.04)
    const ox = -0.02;
    const oy = y0;
    b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.02, 10), GOLD_D, { at: [ox, oy + 0.01, 0.02] });
    b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.03, 10), GOLD, { at: [ox, oy + 0.035, 0.02] });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      b.rod([ox + Math.cos(a) * 0.07, oy + 0.045, 0.02 + Math.sin(a) * 0.07], [ox + Math.cos(a) * 0.075, oy + 0.17, 0.02 + Math.sin(a) * 0.075], [0.012, 0.007], GOLD, { sides: 5 });
    }
    glow(b.part(new THREE.SphereGeometry(0.095, 12, 10), "#7fd8ff", { at: [ox, oy + 0.17, 0.02] }), 0.9);
    // swirl inside the orb
    b.part(new THREE.SphereGeometry(0.1, 12, 10), "#ffffff", { at: [ox, oy + 0.17, 0.02], texture: SKY_ORB, rotation: [0, -90, 0] });
    b.part(new THREE.TorusGeometry(0.1, 0.006, 5, 14), GOLD, { at: [ox, oy + 0.17, 0.02], rotation: [70, 0, 0] });
    // scrolls: bundle in a jar-like basket at right part of the bay
    // scrolls leaning in a bundle
    const bx = 0.38;
    b.part(new THREE.CylinderGeometry(0.075, 0.062, 0.18, 10), cel("#a8603a", "#6a3030"), { at: [bx, y0 + 0.09, 0.03] });
    b.part(new THREE.TorusGeometry(0.073, 0.007, 4, 12), GOLD, { at: [bx, y0 + 0.17, 0.03], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.067, 0.007, 4, 12), GOLD, { at: [bx, y0 + 0.03, 0.03], rotation: [90, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const rx = Math.cos(a) * 0.035;
      const rz = Math.sin(a) * 0.035;
      const lx = Math.cos(a) * 0.05;
      const lz = Math.sin(a) * 0.05;
      const len = f(0.15, 0.22);
      const base = new THREE.Vector3(bx + rx, y0 + 0.08, 0.03 + rz);
      const tip = new THREE.Vector3(bx + lx, y0 + 0.08 + len, 0.03 + lz);
      b.rod(base, tip, 0.016, i % 2 ? PARCH : PARCH_D, { sides: 6 });
      b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.01, 8), i % 2 ? RIBBON : GOLD, { at: tip.clone().lerp(base, 0.12), aim: tip });
    }
    // an end-lying scroll on shelf
    const sc = b.rod([0.17, y0 + 0.02, 0.08], [0.27, y0 + 0.02, 0.1], 0.02, PARCH, { sides: 7 });
    void sc;
    b.rod([0.16, y0 + 0.02, 0.08], [0.17, y0 + 0.02, 0.08], 0.024, RIBBON, { sides: 7 });
    // right books
    let x2 = 0.5;
    while (x2 < IN - 0.06) {
      const w = f(0.04, 0.06);
      const h = f(0.26, maxH);
      bookSpine(x2 + w / 2, y0, w, h, f(0.2, 0.26), ci++);
      x2 += w + 0.002;
    }
  }

  // ---------------- shelf 2 (y0 = 0.98+T) : candles, open tome, potions ----------------
  const candle = (cx: number, yBase: number, cz: number, h: number, wax: ReturnType<typeof cel>, r = 0.025) => {
    // holder: brass dish
    b.part(new THREE.CylinderGeometry(r * 1.8, r * 1.5, 0.012, 10), GOLD, { at: [cx, yBase + 0.006, cz] });
    b.part(new THREE.TorusGeometry(r * 1.75, 0.005, 4, 12), GOLD_D, { at: [cx, yBase + 0.013, cz], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(r, r * 1.05, h, 8), wax, { at: [cx, yBase + 0.012 + h / 2, cz] });
    // melted drips
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      const dl = f(0.025, 0.07);
      b.part(new THREE.CapsuleGeometry(0.006, dl, 3, 5), wax, {
        at: [cx + Math.cos(a) * r * 0.98, yBase + 0.012 + h - dl / 2 - 0.004, cz + Math.sin(a) * r * 0.98],
      });
    }
    // wax top pool
    b.part(new THREE.CylinderGeometry(r * 1.0, r * 1.0, 0.006, 8), wax, { at: [cx, yBase + 0.012 + h, cz] });
    // wick
    b.rod([cx, yBase + 0.012 + h, cz], [cx, yBase + 0.012 + h + 0.018, cz], 0.0025, INK, { sides: 4 });
    // flame: crossed glowing cards
    const fl = b.cards([{ at: new THREE.Vector3(cx, yBase + 0.014 + h, cz), axis: new THREE.Vector3(0, 1, 0) }], FLAME, {
      size: [0.045, 0.085],
      lean: 0,
      cross: true,
      sink: 0,
      flow: [0, 0, 1],
    });
    glow(fl, 1.6);
    return yBase + 0.012 + h + 0.085;
  };

  const potion = (cx: number, yBase: number, cz: number, h: number, liquid: string, shape: 0 | 1 | 2) => {
    const liq = cel(liquid);
    const R0 = shape === 1 ? 0.045 : 0.035;
    if (shape === 0) {
      // round-bottom flask
      b.part(new THREE.SphereGeometry(0.05, 10, 8), cel(GLASS_T, "#6cbfe0"), { at: [cx, yBase + 0.045, cz], scale: [1, 0.9, 1] });
      glow(b.part(new THREE.SphereGeometry(0.043, 9, 7), liquid, { at: [cx, yBase + 0.04, cz], scale: [1, 0.85, 1] }), 0.7);
      b.part(new THREE.CylinderGeometry(0.014, 0.02, 0.07, 8), cel(GLASS_T, "#6cbfe0"), { at: [cx, yBase + 0.12, cz] });
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.026, 8), cel("#b07a4a", "#6a3a30"), { at: [cx, yBase + 0.166, cz] });
    } else if (shape === 1) {
      // squat bottle w/ label
      b.part(new THREE.CylinderGeometry(R0, R0 * 1.05, h * 0.65, 8), cel(GLASS_T, "#6cbfe0"), { at: [cx, yBase + (h * 0.65) / 2, cz] });
      glow(b.part(new THREE.CylinderGeometry(R0 * 0.88, R0 * 0.92, h * 0.55, 8), liquid, { at: [cx, yBase + (h * 0.55) / 2 + 0.01, cz] }), 0.7);
      b.part(new THREE.CylinderGeometry(0.016, R0 * 0.7, h * 0.15, 8), cel(GLASS_T, "#6cbfe0"), { at: [cx, yBase + h * 0.72, cz] });
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), cel("#b07a4a", "#6a3a30"), { at: [cx, yBase + h * 0.83 + 0.01, cz] });
      b.part(new THREE.PlaneGeometry(0.05, 0.062), "#ffffff", { at: [cx, yBase + h * 0.3, cz + R0 + 0.002], dir: [0, 0, 1], axis: "z", texture: LABEL });
      // cork stopper top knob
      b.part(new THREE.SphereGeometry(0.014, 6, 4), cel("#b07a4a", "#6a3a30"), { at: [cx, yBase + h * 0.83 + 0.032, cz] });
    } else {
      // tall vial
      b.part(new THREE.CylinderGeometry(0.022, 0.026, h * 0.75, 7), cel(GLASS_T, "#6cbfe0"), { at: [cx, yBase + (h * 0.75) / 2, cz] });
      glow(b.part(new THREE.CylinderGeometry(0.017, 0.021, h * 0.55, 7), liquid, { at: [cx, yBase + (h * 0.55) / 2 + 0.01, cz] }), 0.7);
      b.part(new THREE.CylinderGeometry(0.012, 0.018, h * 0.15, 7), cel(GLASS_T, "#6cbfe0"), { at: [cx, yBase + h * 0.82, cz] });
      b.part(new THREE.SphereGeometry(0.016, 6, 5), RIBBON, { at: [cx, yBase + h * 0.93, cz] });
    }
    void liq;
  };

  {
    const y0 = PTOP(SH[2]);
    const maxH = SH[3] - y0 - 0.05;
    let ci = 5;
    // far-left: books
    let x = -IN + 0.02;
    while (x < -0.32) {
      const w = f(0.04, 0.07);
      const h = f(0.24, maxH);
      bookSpine(x + w / 2, y0, w, h, f(0.2, 0.28), ci++);
      x += w + 0.002;
    }
    // stacked tomes on which sits the candle cluster
    const topL = bookStack(-0.4 + 0.0, y0, 0.02, 3, 6, 0.3);
    void topL;
    // candle cluster on left, tall to short
    candle(-0.32, y0, 0.07, 0.2, WAX, 0.02);
    candle(-0.25, y0, 0.0, 0.12, WAX_R, 0.024);
    // open spell tome in centre bay (on a small lectern stand)
    const cx = 0.02;
    b.part(new THREE.BoxGeometry(0.26, 0.012, 0.22), GOLD_D, { at: [cx, y0 + 0.006, 0.02] });
    b.part(new THREE.BoxGeometry(0.03, 0.06, 0.16), WOOD_DARK, { at: [cx, y0 + 0.042, 0.04] });
    // book pages as two tilted boxes
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.13, 0.014, 0.19), PARCH, { at: [cx + s * 0.065, y0 + 0.088, 0.03], rotation: [0, 0, -s * 14] });
      b.part(new THREE.BoxGeometry(0.135, 0.01, 0.195), cel("#a8324f"), { at: [cx + s * 0.067, y0 + 0.076, 0.03], rotation: [0, 0, -s * 14] });
      b.part(new THREE.PlaneGeometry(0.11, 0.17), "#ffffff", {
        at: [cx + s * 0.066, y0 + 0.0975, 0.03],
        dir: [Math.sin((s * 14 * Math.PI) / 180) * -1 * 0.0 + 0, 1, 0],
        axis: "z",
        rotation: [-90, 0, -s * 14],
        texture: SCROLL_TEXT,
      });
    }
    // floating spell orb above open book
    glow(b.part(new THREE.SphereGeometry(0.03, 10, 8), "#ffe27a", { at: [cx, y0 + 0.2, 0.03] }), 1.6);
    b.part(new THREE.TorusGeometry(0.05, 0.004, 4, 16), GOLD, { at: [cx, y0 + 0.2, 0.03], rotation: [75, 0, 20] });
    b.part(new THREE.TorusGeometry(0.065, 0.004, 4, 16), GOLD, { at: [cx, y0 + 0.2, 0.03], rotation: [105, 0, -25] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      glow(b.part(new THREE.OctahedronGeometry(0.01), "#ffe27a", { at: [cx + Math.cos(a) * 0.08, y0 + 0.2 + Math.sin(a * 2) * 0.03, 0.03 + Math.sin(a) * 0.08] }), 1.5);
    }
    // potion rack on right: three potions
    potion(0.32, y0, 0.05, 0.2, "#ff5d8f", 0);
    potion(0.42, y0, 0.0, 0.16, "#52e08a", 1);
    potion(0.5, y0, 0.07, 0.17, "#7b6bff", 2);
    potion(0.56, y0, -0.02, 0.19, "#ffb347", 2);
    // right books
    let x2 = 0.6;
    while (x2 < IN - 0.05) {
      const w = f(0.035, 0.05);
      const h = f(0.22, maxH);
      bookSpine(x2 + w / 2, y0, w, h, f(0.2, 0.26), ci++);
      x2 += w + 0.002;
    }
  }

  // ---------------- shelf 3 (y0 = 1.38+T) : hourglass, scroll rack, tomes ----------------
  {
    const y0 = PTOP(SH[3]);
    const maxH = SH[4] - y0 - 0.05;
    let ci = 1;
    // left: tall tomes with a leaning one
    let x = -IN + 0.02;
    while (x < -0.3) {
      const w = f(0.04, 0.07);
      const h = f(0.22, maxH);
      bookSpine(x + w / 2, y0, w, h, f(0.2, 0.28), ci++);
      x += w + 0.002;
    }
    bookSpine(x + 0.07, y0, 0.06, 0.28, 0.24, ci++, -0.34);
    // hourglass in the middle
    const hx = -0.02;
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.014, 10), GOLD, { at: [hx, y0 + 0.007, 0.03] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.014, 10), GOLD, { at: [hx, y0 + 0.263, 0.03] });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      b.rod([hx + Math.cos(a) * 0.058, y0 + 0.014, 0.03 + Math.sin(a) * 0.058], [hx + Math.cos(a) * 0.058, y0 + 0.256, 0.03 + Math.sin(a) * 0.058], 0.0085, GOLD_D, { sides: 5 });
    }
    b.part(new THREE.CylinderGeometry(0.052, 0.01, 0.115, 10), cel(GLASS_T, "#6cbfe0"), { at: [hx, y0 + 0.077 + 0.0, 0.03] });
    b.part(new THREE.CylinderGeometry(0.01, 0.052, 0.115, 10), cel(GLASS_T, "#6cbfe0"), { at: [hx, y0 + 0.197, 0.03] });
    // sand
    glow(b.part(new THREE.CylinderGeometry(0.03, 0.045, 0.045, 8), "#ffcf66", { at: [hx, y0 + 0.05, 0.03] }), 0.8);
    glow(b.part(new THREE.CylinderGeometry(0.035, 0.008, 0.03, 8), "#ffcf66", { at: [hx, y0 + 0.215, 0.03] }), 0.8);
    glow(b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.07, 5), "#ffcf66", { at: [hx, y0 + 0.14, 0.03] }), 0.8);
    // scroll rack: horizontal scrolls stacked in a wooden cradle at x≈0.28
    const sx0 = 0.28;
    b.part(new THREE.BoxGeometry(0.28, 0.02, 0.22), WOOD_DARK, { at: [sx0, y0 + 0.01, 0.01] });
    for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.02, 0.12, 0.22), WOOD_DARK, { at: [sx0 + s * 0.13, y0 + 0.07, 0.01] });
    let sy = y0 + 0.045;
    for (let row = 0; row < 3; row++) {
      const count = 3 - (row === 2 ? 1 : 0);
      for (let k = 0; k < count; k++) {
        const z = -0.05 + k * 0.06 + (row === 1 ? 0.03 : 0);
        const len = 0.22;
        const c = (k + row) % 2 ? PARCH : PARCH_D;
        b.rod([sx0 - len / 2, sy + row * 0.035, z], [sx0 + len / 2, sy + row * 0.035, z], 0.022, c, { sides: 7 });
        // end caps (rolls) and ribbon
        for (const e of [1, -1]) b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), GOLD, { at: [sx0 + e * (len / 2 + 0.002), sy + row * 0.035, z], rotation: [0, 0, 90] });
        b.rod([sx0 + 0.02, sy + row * 0.035, z], [sx0 + 0.036, sy + row * 0.035, z], 0.0255, (k + row) % 2 ? RIBBON : cel("#2e6fd0"), { sides: 7 });
      }
    }
    // candle on cradle top
    candle(sx0 + 0.0, y0 + 0.17, 0.01, 0.1, WAX_R, 0.02);
    // right books
    let x2 = 0.46;
    while (x2 < IN - 0.04) {
      const w = f(0.035, 0.055);
      const h = f(0.22, maxH);
      bookSpine(x2 + w / 2, y0, w, h, f(0.2, 0.26), ci++);
      x2 += w + 0.002;
    }
  }

  // ---------------- shelf 4 (y0 = 1.76+T): top shelf — orbs, eye, candle trio, books ----------------
  {
    const y0 = PTOP(SH[4]);
    // top board is at TOP = SH[4] ; crown above, free height ~0.16 for orbs only up to the crown
    // Actually TOP shelf contents sit between SH[4]+T and the crown underside; we use a low profile.
    void y0;
  }

  // ======================= TOP DECK (on the crown top board) =======================
  {
    const yT = TOP + T + 0.064; // top surface of crown deck
    // candelabra left with three candles
    b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.02, 10), GOLD, { at: [-0.5, yT + 0.01, 0.0] });
    b.rod([-0.5, yT + 0.02, 0], [-0.5, yT + 0.16, 0], [0.012, 0.008], GOLD, { sides: 6 });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), GOLD, { at: [-0.5, yT + 0.09, 0] });
    for (const s of [1, -1]) {
      b.sweep([[-0.5, yT + 0.1, 0], [-0.5 + s * 0.04, yT + 0.115, 0], [-0.5 + s * 0.07, yT + 0.17, 0]], 0.007, GOLD, { sides: 5 });
    }
    candle(-0.5, yT + 0.14, 0.0, 0.07, WAX, 0.012);
    candle(-0.57, yT + 0.16, 0.0, 0.06, WAX_R, 0.011);
    candle(-0.43, yT + 0.16, 0.0, 0.06, WAX_R, 0.011);
    // wizard hat-shaped ornament? A glowing orb on a stand at right
    b.part(new THREE.CylinderGeometry(0.05, 0.07, 0.025, 10), GOLD, { at: [0.5, yT + 0.0125, 0.0] });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      b.rod([0.5 + Math.cos(a) * 0.045, yT + 0.02, Math.sin(a) * 0.045], [0.5 + Math.cos(a) * 0.04, yT + 0.1, Math.sin(a) * 0.04], [0.01, 0.006], GOLD, { sides: 5 });
    }
    glow(b.part(new THREE.SphereGeometry(0.065, 12, 10), "#ff9ae0", { at: [0.5, yT + 0.1, 0] }), 1.0);
    b.part(new THREE.SphereGeometry(0.067, 12, 10), "#ffffff", { at: [0.5, yT + 0.1, 0], texture: EYE_ORB, rotation: [0, -90, 0] });
    // small stack of flat tomes mid-top-left
    bookStack(-0.22, yT, 0.04, 2, 4, 0.26);
    // owl figurine near centre-right
    const ox = 0.24;
    const oz = 0.03;
    b.part(new THREE.SphereGeometry(0.055, 8, 6), cel("#c9a070", "#8a5a50"), { at: [ox, yT + 0.065, oz], scale: [1, 1.2, 0.9] });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), cel("#c9a070", "#8a5a50"), { at: [ox, yT + 0.14, oz] });
    b.part(new THREE.SphereGeometry(0.044, 8, 6), cel("#fff0c8", "#e8b98a"), { at: [ox, yT + 0.055, oz + 0.02], scale: [0.8, 1.0, 0.6] });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.016, 6, 5), cel("#fff0c8"), { at: [ox + s * 0.017, yT + 0.145, oz + 0.032] });
      glow(b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffb020", { at: [ox + s * 0.017, yT + 0.145, oz + 0.044] }), 1.2);
      b.spike([ox + s * 0.025, yT + 0.17, oz], [s * 0.4, 1, 0], 0.035, 0.012, cel("#8a5a50"), { sides: 4 });
      b.part(new THREE.BoxGeometry(0.02, 0.07, 0.03), cel("#a07858", "#6a4050"), { at: [ox + s * 0.05, yT + 0.065, oz - 0.01], rotation: [0, 0, -s * 10] });
    }
    b.spike([ox, yT + 0.14, oz + 0.04], [0, -0.2, 1], 0.02, 0.008, GOLD, { sides: 4 });
  }

  // ======================= HANGING DETAILS ON FRONT =======================
  // hanging scroll banner from the left side with tassels
  {
    const bx = -W / 2 - 0.1;
    b.rod([bx - 0.0, TOP - 0.05, D / 2 - 0.12], [bx + 0.0, TOP - 0.05, D / 2 - 0.12], 0.0, GOLD, {} as never);
  }

  // ======================= SIDE-FLANK DETAILS =======================
  // lantern hanging from right side bracket
  {
    const lx = W / 2 + 0.17;
    const ly = 1.3;
    b.sweep([[W / 2 + 0.02, 1.52, 0.0], [W / 2 + 0.1, 1.56, 0.0], [lx, 1.5, 0.0]], 0.01, IRON, { sides: 5 });
    b.rod([lx, 1.5, 0], [lx, 1.44, 0], 0.003, GOLD, { sides: 4 });
    b.part(new THREE.CylinderGeometry(0.012, 0.045, 0.04, 6), GOLD, { at: [lx, 1.42, 0] });
    glow(b.part(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 6), "#ffd36a", { at: [lx, ly + 0.07, 0] }), 1.4);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.rod([lx + Math.cos(a) * 0.04, ly + 0.02, Math.sin(a) * 0.04], [lx + Math.cos(a) * 0.04, ly + 0.12, Math.sin(a) * 0.04], 0.005, GOLD, { sides: 4 });
    }
    b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.012, 6), GOLD, { at: [lx, ly + 0.01, 0] });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD, { at: [lx, ly - 0.005, 0] });
  }

  // ======================= FLOOR CLUTTER =======================
  // dropped scroll and a stack of tomes with a candle on floor (placed at the base's right)
  {
    const fx = W / 2 + 0.2;
    // floor tome stack
    let y = 0;
    for (let i = 0; i < 3; i++) {
      const [cov, trim] = COVERS[(i * 3 + 1) % COVERS.length];
      const w = 0.28 - i * 0.03;
      const d = 0.2 - i * 0.015;
      const h = 0.055;
      const rz = (i - 1) * 14;
      b.part(new THREE.BoxGeometry(w - 0.01, h - 0.014, d - 0.008), PAGE_EDGE, { at: [fx, y + h / 2, 0.18], rotation: [0, rz, 0] });
      b.part(new THREE.BoxGeometry(w, 0.01, d), cel(cov), { at: [fx, y + 0.005, 0.18], rotation: [0, rz, 0] });
      b.part(new THREE.BoxGeometry(w, 0.01, d), cel(cov), { at: [fx, y + h - 0.005, 0.18], rotation: [0, rz, 0] });
      b.part(new THREE.BoxGeometry(0.012, h, d), cel(cov), { at: [fx - Math.cos((rz * Math.PI) / 180) * (w / 2 - 0.006), y + h / 2, 0.18 + Math.sin((rz * Math.PI) / 180) * (w / 2 - 0.006)], rotation: [0, rz, 0] });
      b.part(new THREE.PlaneGeometry(w * 0.55, d * 0.55), "#ffffff", { at: [fx, y + h + 0.0015, 0.18], dir: [0, 1, 0], axis: "z", texture: COVER_EMB });
      void trim;
      y += h;
    }
    candle(fx, y, 0.18, 0.12, WAX, 0.022);
    // unrolled scroll on the floor
    b.part(new THREE.BoxGeometry(0.26, 0.004, 0.17), PARCH, { at: [fx - 0.12, 0.002, 0.42], rotation: [0, 18, 0] });
    b.part(new THREE.PlaneGeometry(0.24, 0.15), "#ffffff", { at: [fx - 0.12, 0.0045, 0.42], dir: [0, 1, 0], axis: "z", rotation: [-90, 0, -18], texture: SCROLL_TEXT });
    b.rod([fx - 0.25, 0.018, 0.4], [fx - 0.2, 0.018, 0.5], 0.018, PARCH_D, { sides: 7 });
    b.rod([fx + 0.0, 0.018, 0.34], [fx + 0.05, 0.018, 0.44], 0.018, PARCH_D, { sides: 7 });
  }
  // glowing orb on the left floor, with a little brass tripod
  {
    const fx = -W / 2 - 0.16;
    b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.02, 10), GOLD_D, { at: [fx, 0.01, 0.1] });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      b.rod([fx + Math.cos(a) * 0.08, 0.02, 0.1 + Math.sin(a) * 0.08], [fx + Math.cos(a) * 0.05, 0.12, 0.1 + Math.sin(a) * 0.05], [0.014, 0.009], GOLD, { sides: 5 });
    }
    glow(b.part(new THREE.SphereGeometry(0.1, 12, 10), "#9fe0ff", { at: [fx, 0.17, 0.1] }), 1.0);
    b.part(new THREE.SphereGeometry(0.102, 12, 10), "#ffffff", { at: [fx, 0.17, 0.1], texture: SKY_ORB, rotation: [0, -90, 0] });
    b.part(new THREE.TorusGeometry(0.108, 0.006, 5, 16), GOLD, { at: [fx, 0.17, 0.1], rotation: [60, 0, 0] });
  }

  // ======================= BACK / FRONT PANEL DETAIL =======================
  // gold rune studs along the plinth front
  for (let i = 0; i < 9; i++) {
    const x = -0.56 + i * 0.14;
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.01), WOOD_DARK, { at: [x, 0.05, D / 2 + 0.056] });
    glow(
      b.part(new THREE.PlaneGeometry(0.04, 0.04), "#ffffff", { at: [x, 0.05, D / 2 + 0.063], dir: [0, 0, 1], axis: "z", texture: RUNE_GOLD }),
      1.0,
    );
  }
  // cobweb-style wear: dark ink lines on top of crown
  b.part(new THREE.BoxGeometry(W + 0.14, 0.004, 0.004), INK, { at: [0, TOP + T + 0.002, D / 2 + 0.032] });

  // used rng so tooling is stable
  void R;
  void mottle;
  void inkLines;

  return b.root;
}
