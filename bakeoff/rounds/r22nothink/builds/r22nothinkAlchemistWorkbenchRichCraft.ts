import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { grain, mottle, paint, scales, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK, shadowOf } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "Cel-shaded Teyvat-style alchemist's workbench: gold-trimmed oak table with a cloth runner, glowing elemental potions, a brass balance scale, stacked grimoires, a mortar, an alembic still, and hanging and potted herbs.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const WOOD = cel(grain("#9a6238", "#b47a48", { size: 0.03, axis: "x", seed: 3 }), "#5b3140");
const WOOD_DARK = cel(grain("#6d4232", "#82503a", { size: 0.03, axis: "x", seed: 5 }), "#3c2236");
const WOOD_TOP = cel(grain("#b57c48", "#c78d55", { size: 0.025, axis: "x", seed: 9 }), "#69403f");
const GOLD = cel("#f2c35a", "#b9742f");
const GOLD_BRIGHT = "#ffe08a";
const CLOTH = cel("#2f8f93", "#1d5a7c");
const CLOTH_TRIM = cel("#f6e3a1", "#d9a96a");
const PARCH = cel("#f5e6bd", "#d9b27f");
const STONE = cel(mottle("#d9d3c4", "#bdb6a8", { size: 0.04, seed: 2 }), "#8c86a0");
const IRON = cel("#58607a", "#2e3050");
const BRASS = cel("#e0b04c", "#a5642a");
const CORK = cel("#c88f55", "#8a5340");
const GLASS = "#cfeeff";
const LEAF = cel("#58c05a", "#237a6a");
const LEAF_DARK = cel("#2f9a56", "#17604f");
const SOIL = cel("#6b4332", "#3a2236");
const CREAM = cel("#fff3d0", "#e2b98a");

const BOOK_COLORS = [
  ["#c9433f", "#8a2447"],
  ["#2f6fc4", "#23408a"],
  ["#2f9a74", "#1d6064"],
  ["#7a4cc0", "#4a2a86"],
  ["#e08a2c", "#a2502a"],
];

// ---------------------------------------------------------------- textures
const RUNE_BAND = svg(
  `<svg viewBox="0 0 128 16"><rect width="128" height="16" fill="#f2c35a"/>
  <path d="M0 3H128M0 13H128" stroke="#a5642a" stroke-width="1.6"/>
  ${Array.from({ length: 10 }, (_, i) => {
    const x = 7 + i * 12.5;
    return `<path d="M${x} 4 L${x + 4} 8 L${x} 12 L${x - 4} 8 Z" fill="none" stroke="#7a3c22" stroke-width="1.4"/><circle cx="${x}" cy="8" r="1.2" fill="#7a3c22"/>`;
  }).join("")}</svg>`,
  { size: 512 },
);

const CLOTH_EMBROIDERY = svg(
  `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#2f8f93"/>
  <rect x="2" y="2" width="124" height="28" fill="none" stroke="#f6e3a1" stroke-width="1.5"/>
  <rect x="5" y="5" width="118" height="22" fill="none" stroke="#f2c35a" stroke-width="0.8"/>
  ${Array.from({ length: 5 }, (_, i) => {
    const x = 14 + i * 25;
    return `<g transform="translate(${x} 16)"><circle r="7" fill="none" stroke="#f6e3a1" stroke-width="1.3"/><path d="M0 -7 L2 0 L0 7 L-2 0 Z M-7 0 L0 -2 L7 0 L0 2 Z" fill="#f2c35a"/><circle r="1.6" fill="#ff8a5a"/></g>`;
  }).join("")}
  <path d="M26 16 H38 M51 16 H63 M76 16 H88 M101 16 H113" stroke="#f6e3a1" stroke-width="1.2" stroke-dasharray="2 2"/></svg>`,
  { size: 512 },
);

const BOOK_FRONT = (a: string, b: string) =>
  svg(
    `<svg viewBox="0 0 64 80"><rect width="64" height="80" fill="${a}"/>
    <rect x="4" y="4" width="56" height="72" fill="none" stroke="#f2c35a" stroke-width="2"/>
    <rect x="8" y="8" width="48" height="64" fill="none" stroke="${b}" stroke-width="1.5"/>
    <circle cx="32" cy="40" r="14" fill="none" stroke="#f2c35a" stroke-width="2"/>
    <path d="M32 22 L36 40 L32 58 L28 40 Z M14 40 L32 36 L50 40 L32 44 Z" fill="#f2c35a"/>
    <circle cx="32" cy="40" r="3" fill="${b}"/>
    <path d="M10 10 L18 10 L10 18 Z M54 10 L46 10 L54 18 Z M10 70 L18 70 L10 62 Z M54 70 L46 70 L54 62 Z" fill="#f2c35a"/></svg>`,
    { size: 256 },
  );

const PAGES = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f5e6bd"/>
  ${Array.from({ length: 7 }, (_, i) => `<path d="M0 ${2 + i * 2}H64" stroke="#d9b27f" stroke-width="0.7"/>`).join("")}</svg>`,
  { size: 128 },
);

const LABEL = (c: string) =>
  svg(
    `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#f5e6bd" stroke="#a5642a" stroke-width="2.5"/>
    <circle cx="24" cy="24" r="11" fill="none" stroke="${c}" stroke-width="2.5"/>
    <path d="M24 12 L27 24 L24 36 L21 24 Z M12 24 L24 21 L36 24 L24 27 Z" fill="${c}"/></svg>`,
    { size: 128 },
  );

const SCROLL = svg(
  `<svg viewBox="0 0 64 96"><rect width="64" height="96" fill="#f5e6bd"/>
  <rect x="3" y="3" width="58" height="90" fill="none" stroke="#c98a4b" stroke-width="2"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M10 ${14 + i * 8}H${44 + ((i * 7) % 12)}" stroke="#7a4a3a" stroke-width="2"/>`).join("")}
  <circle cx="46" cy="76" r="8" fill="none" stroke="#c9433f" stroke-width="2"/><path d="M46 69 L48 76 L46 83 L44 76 Z" fill="#c9433f"/></svg>`,
  { size: 192 },
);

const LEAF_TEX = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 C2 44 2 18 16 2 C30 18 30 44 16 62 Z" fill="#58c05a"/>
  <path d="M16 62 C8 44 8 22 16 2 C16 22 16 44 16 62 Z" fill="#2f9a56"/>
  <path d="M16 60 V6" stroke="#e8f6a0" stroke-width="2"/>
  <path d="M16 20 L8 14 M16 32 L7 25 M16 44 L9 38 M16 20 L24 14 M16 32 L25 25 M16 44 L23 38" stroke="#b8e878" stroke-width="1.5"/></svg>`,
  { size: 128 },
);
const LEAF_BLUE = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 C4 46 4 20 16 2 C28 20 28 46 16 62 Z" fill="#4aa8d8"/>
  <path d="M16 62 C9 46 9 22 16 2 C16 22 16 46 16 62 Z" fill="#2f78b8"/>
  <path d="M16 58 V8" stroke="#d8f4ff" stroke-width="2"/></svg>`,
  { size: 128 },
);
const LAVENDER = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 64 V20" stroke="#3a9a58" stroke-width="2.5"/>
  ${[4, 11, 18, 25, 32, 39]
    .map(
      (y) =>
        `<ellipse cx="8.5" cy="${60 - y - 8}" rx="4" ry="3.4" fill="#9a6ad8"/><ellipse cx="15.5" cy="${60 - y - 11}" rx="4" ry="3.4" fill="#b88af0"/>`,
    )
    .join("")}
  <ellipse cx="12" cy="6" rx="3.5" ry="4.5" fill="#c9a2ff"/></svg>`,
  { size: 128 },
);
const FLAME_TEX = svg(
  `<svg viewBox="0 0 32 48"><path d="M16 46 C2 40 2 24 14 4 C16 14 20 14 22 20 C30 28 30 42 16 46 Z" fill="#ff8a3c"/>
  <path d="M16 44 C8 40 8 30 16 18 C24 30 24 40 16 44 Z" fill="#ffd25a"/><path d="M16 42 C12 38 13 32 16 28 C19 32 20 38 16 42 Z" fill="#fff6c8"/></svg>`,
  { size: 96 },
);
const SPARKLE = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 0 L19 13 L32 16 L19 19 L16 32 L13 19 L0 16 L13 13 Z" fill="#ffffff"/></svg>`,
  { size: 64 },
);

// ---------------------------------------------------------------- build
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "alchemistWorkbench", paintSize: 2048 });
  const R = rng(7);

  // geometry helpers
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const merged = (gs: THREE.BufferGeometry[]) => mergeGeometries(gs.map((g) => (g.index ? g.toNonIndexed() : g)));

  // ============================================================ TABLE
  const TW = 1.7; // width x
  const TD = 0.8; // depth z
  const TH = 0.84; // surface height
  const TOP_T = 0.07;

  // top slab planks
  b.part(box(TW, TOP_T, TD), WOOD_TOP, { at: [0, TH - TOP_T / 2, 0] });
  // plank seams
  for (let i = 1; i < 5; i++) {
    b.part(box(TW - 0.02, 0.003, 0.004), INK, { at: [0, TH + 0.0005, -TD / 2 + (i * TD) / 5] });
  }
  // front gold-trim apron
  b.part(box(TW + 0.04, 0.012, TD + 0.04), GOLD, { at: [0, TH - TOP_T - 0.004, 0] });
  b.part(box(TW + 0.05, 0.05, 0.02), WOOD_DARK, { at: [0, TH - TOP_T - 0.03, TD / 2 + 0.01] });
  b.part(box(TW + 0.05, 0.05, 0.02), WOOD_DARK, { at: [0, TH - TOP_T - 0.03, -TD / 2 - 0.01] });
  for (const s of [1, -1]) b.part(box(0.02, 0.05, TD + 0.05), WOOD_DARK, { at: [s * (TW / 2 + 0.01), TH - TOP_T - 0.03, 0] });
  // rune band along front apron
  b.part(new THREE.PlaneGeometry(TW - 0.12, 0.034), "#ffffff", {
    at: [0, TH - TOP_T - 0.03, TD / 2 + 0.0215],
    dir: [0, 0, 1],
    axis: "z",
    texture: RUNE_BAND,
  });
  // gold corner caps on the top
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(box(0.06, 0.016, 0.06), GOLD, { at: [sx * (TW / 2 - 0.02), TH + 0.004, sz * (TD / 2 - 0.02)] });
      b.part(sph(0.012, 6, 4), GOLD_BRIGHT, { at: [sx * (TW / 2 - 0.02), TH + 0.016, sz * (TD / 2 - 0.02)] });
    }

  // legs: chunky turned
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const lx = sx * (TW / 2 - 0.07);
      const lz = sz * (TD / 2 - 0.07);
      b.lathe(
        [
          [0, 0],
          [0.06, 0],
          [0.06, 0.03],
          [0.045, 0.05],
          [0.045, 0.3],
          [0.058, 0.36],
          [0.045, 0.42],
          [0.045, 0.6],
          [0.065, 0.66],
          [0.065, 0.76],
          [0, 0.76],
        ],
        { at: [lx, 0, lz], segments: 8, color: WOOD_DARK },
      );
      b.part(cyl(0.068, 0.068, 0.012, 8), GOLD, { at: [lx, 0.034, lz] });
      b.part(cyl(0.07, 0.07, 0.012, 8), GOLD, { at: [lx, 0.76, lz] });
    }
  // stretchers
  for (const sz of [1, -1]) b.part(box(TW - 0.2, 0.04, 0.04), WOOD, { at: [0, 0.2, sz * (TD / 2 - 0.07)] });
  for (const sx of [1, -1]) b.part(box(0.04, 0.04, TD - 0.2), WOOD, { at: [sx * (TW / 2 - 0.07), 0.2, 0] });
  // lower shelf
  b.part(box(TW - 0.2, 0.025, TD - 0.2), WOOD, { at: [0, 0.22, 0] });
  b.part(box(TW - 0.2, 0.012, 0.012), GOLD, { at: [0, 0.2375, TD / 2 - 0.1] });

  // ---- shelf clutter: crates, sacks, jars
  b.part(box(0.3, 0.16, 0.24), WOOD_DARK, { at: [-0.55, 0.3, 0.0] });
  for (const dy of [-0.055, 0.0, 0.055]) b.part(box(0.31, 0.012, 0.25), WOOD, { at: [-0.55, 0.3 + dy, 0] });
  b.part(box(0.025, 0.17, 0.25), GOLD, { at: [-0.55 + 0.115, 0.3, 0] });
  b.part(box(0.025, 0.17, 0.25), GOLD, { at: [-0.55 - 0.115, 0.3, 0] });
  // sack
  b.part(sph(0.11, 9, 7), CREAM, { at: [0.5, 0.345, 0.0], scale: [1, 1.0, 0.9] });
  b.part(cyl(0.035, 0.05, 0.05, 8), CREAM, { at: [0.5, 0.45, 0.0] });
  b.rod([0.46, 0.425, 0], [0.54, 0.425, 0], 0.008, { color: CORK, caps: "flat" });
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", { at: [0.5, 0.35, 0.098], dir: [0, 0, 1], axis: "z", texture: LABEL("#2f8f93") });
  // glass jars of dried stuff
  for (const [x, c] of [
    [0.12, "#ffb36a"],
    [0.24, "#8ad45a"],
    [-0.12, "#c99cff"],
  ] as Array<[number, string]>) {
    b.part(cyl(0.045, 0.045, 0.1, 8), GLASS, { at: [x, 0.285, 0.05] });
    b.part(cyl(0.04, 0.04, 0.06, 8), c, { at: [x, 0.275, 0.05] });
    b.part(cyl(0.048, 0.048, 0.015, 8), GOLD, { at: [x, 0.34, 0.05] });
  }

  // ============================================================ CLOTH RUNNER
  b.part(box(1.3, 0.008, 0.32), CLOTH, { at: [0.0, TH + 0.004, 0.2] });
  b.part(new THREE.PlaneGeometry(1.3, 0.32), "#ffffff", {
    at: [0.0, TH + 0.0086, 0.2],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: CLOTH_EMBROIDERY,
  });
  // hanging front flap
  b.part(box(1.3, 0.008, 0.005), CLOTH_TRIM, { at: [0, TH + 0.004, 0.36] });
  b.part(box(1.3, 0.12, 0.008), CLOTH, { at: [0, TH - 0.056, 0.364] });
  b.part(new THREE.PlaneGeometry(1.3, 0.12), "#ffffff", { at: [0, TH - 0.056, 0.369], dir: [0, 0, 1], axis: "z", texture: CLOTH_EMBROIDERY });
  // tassels
  const tassels: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const x = -0.6 + i * 0.15;
    tassels.push(cyl(0.012, 0.004, 0.06, 5).translate(x, TH - 0.14, 0.368));
    tassels.push(sph(0.012, 6, 4).translate(x, TH - 0.108, 0.368));
  }
  b.part(merged(tassels), GOLD, { at: [0, 0, 0] });

  // ============================================================ RAISED BACK SHELF + BACKBOARD
  const BZ = -0.3; // back edge zone
  // back shelf rail on posts
  for (const sx of [1, -1]) {
    b.part(box(0.07, 0.62, 0.05), WOOD_DARK, { at: [sx * (TW / 2 - 0.04), TH + 0.31, BZ - 0.06] });
    b.part(box(0.085, 0.03, 0.065), GOLD, { at: [sx * (TW / 2 - 0.04), TH + 0.625, BZ - 0.06] });
    b.part(sph(0.03, 8, 5), GOLD_BRIGHT, { at: [sx * (TW / 2 - 0.04), TH + 0.665, BZ - 0.06] });
    b.part(box(0.09, 0.04, 0.07), GOLD, { at: [sx * (TW / 2 - 0.04), TH + 0.02, BZ - 0.06] });
  }
  // backboard
  b.part(box(TW - 0.12, 0.5, 0.025), WOOD, { at: [0, TH + 0.3, BZ - 0.08] });
  b.part(new THREE.PlaneGeometry(TW - 0.14, 0.04), "#ffffff", { at: [0, TH + 0.5, BZ - 0.0665], dir: [0, 0, 1], axis: "z", texture: RUNE_BAND });
  b.part(new THREE.PlaneGeometry(TW - 0.14, 0.04), "#ffffff", { at: [0, TH + 0.12, BZ - 0.0665], dir: [0, 0, 1], axis: "z", texture: RUNE_BAND });
  // upper board top rail
  b.part(box(TW, 0.04, 0.08), GOLD, { at: [0, TH + 0.655, BZ - 0.06] });
  // upper shelf (hanging rack)
  const SHELF_Y = TH + 0.33;
  b.part(box(TW - 0.12, 0.025, 0.2), WOOD_TOP, { at: [0, SHELF_Y, BZ - 0.0] });
  b.part(box(TW - 0.12, 0.014, 0.212), GOLD, { at: [0, SHELF_Y - 0.018, BZ - 0.0] });
  for (const sx of [1, -1, 0.5, -0.5].map((v) => v * 0.7))
    b.part(box(0.035, 0.07, 0.15), WOOD_DARK, { at: [sx, SHELF_Y - 0.06, BZ - 0.01] });
  // tiny front lip on shelf
  b.part(box(TW - 0.12, 0.02, 0.012), WOOD_DARK, { at: [0, SHELF_Y + 0.018, BZ + 0.09] });

  // ============================================================ HANGING HERB BUNDLES on rail
  const bundleXs = [-0.62, -0.38, 0.45, 0.65];
  const cardFrames: Array<{ f: THREE.Vector3 }> = [];
  void cardFrames;
  bundleXs.forEach((x, i) => {
    const y0 = TH + 0.64;
    b.rod([x, y0, BZ + 0.0], [x, y0 - 0.09, BZ + 0.0], 0.003, { color: CREAM, caps: "flat" });
    b.part(cyl(0.02, 0.024, 0.03, 6), CORK, { at: [x, y0 - 0.1, BZ] });
    const tex = i % 2 ? LEAF_TEX : LAVENDER;
    const frames = Array.from({ length: 6 }, (_, k) => {
      const a = (k / 6) * Math.PI * 2;
      return { at: [x + Math.cos(a) * 0.012, y0 - 0.1, BZ + Math.sin(a) * 0.012], axis: [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3] };
    });
    b.cards(
      frames.map((f) => ({ at: f.at, axis: f.axis })),
      tex,
      { size: [0.05, 0.16], lean: 180, flow: [0, 0, 1], bend: 10, cross: true, vary: 0.2, rng: rng(20 + i), spin: 30 },
    );
  });
  // dried garland of chilies / berries along rail
  const berries: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const x = -0.25 + i * (0.5 / 13);
    const y = TH + 0.64 - 0.02 - Math.sin((i / 13) * Math.PI) * 0.05;
    berries.push(sph(0.015, 6, 4).translate(x, y - 0.04, BZ + 0.045));
  }
  b.part(merged(berries), "#e3463a", { at: [0, 0, 0] });
  b.sweep(
    [
      [-0.25, TH + 0.62, BZ + 0.045],
      [-0.12, TH + 0.575, BZ + 0.045],
      [0.0, TH + 0.565, BZ + 0.045],
      [0.12, TH + 0.575, BZ + 0.045],
      [0.25, TH + 0.62, BZ + 0.045],
    ],
    0.003,
    { color: LEAF_DARK, sides: 4 },
  );

  // ============================================================ SHELF DRESSING: potion rack on the upper shelf
  // small bottles on shelf
  const smallBottle = (x: number, y: number, z: number, liquid: string, glowing: boolean, label: string) => {
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.036, 0.015],
        [0.036, 0.05],
        [0.014, 0.075],
        [0.014, 0.095],
        [0.017, 0.098],
        [0.017, 0.105],
        [0.011, 0.105],
        [0, 0.09],
      ],
      { at: [x, y, z], segments: 8, color: GLASS },
    );
    const liq = b.lathe(
      [
        [0, 0.004],
        [0.027, 0.004],
        [0.032, 0.015],
        [0.032, 0.042],
        [0.02, 0.058],
        [0, 0.058],
      ],
      { at: [x, y, z], segments: 8, color: liquid },
    );
    if (glowing) glow(liq, 1.1);
    b.part(cyl(0.015, 0.013, 0.022, 6), CORK, { at: [x, y + 0.105, z] });
    b.part(new THREE.PlaneGeometry(0.036, 0.036), "#ffffff", { at: [x, y + 0.03, z + 0.0385], dir: [0, 0, 1], axis: "z", texture: LABEL(label) });
  };
  const smallCols = ["#ff7a4a", "#4ad0ff", "#9cff6a", "#d27aff", "#ffd24a", "#ff6a9a"];
  [-0.7, -0.6, -0.5, -0.4, -0.3, 0.3, 0.4, 0.5, 0.6, 0.7].forEach((x, i) => {
    smallBottle(x, SHELF_Y + 0.0125, BZ + 0.0, smallCols[i % smallCols.length], i % 2 === 0, smallCols[(i + 2) % smallCols.length]);
  });
  // books lying on the shelf centre
  const shelfBooks: Array<[number, number, number, number]> = [
    [-0.12, 0.05, 0.12, 0],
    [-0.06, 0.04, 0.11, 1],
    [0.0, 0.055, 0.13, 2],
    [0.07, 0.045, 0.115, 3],
    [0.13, 0.05, 0.125, 4],
  ];
  shelfBooks.forEach(([x, t, h, ci]) => {
    const [c1, c2] = BOOK_COLORS[ci];
    b.part(box(t, h, 0.1), cel(c1, c2), { at: [x, SHELF_Y + 0.0125 + h / 2, BZ] });
    b.part(box(t + 0.004, h - 0.01, 0.01), GOLD, { at: [x, SHELF_Y + 0.0125 + h / 2, BZ + 0.045] });
    b.part(box(t + 0.006, 0.01, 0.102), GOLD, { at: [x, SHELF_Y + 0.0125 + h * 0.75, BZ] });
    b.part(box(t + 0.006, 0.01, 0.102), GOLD, { at: [x, SHELF_Y + 0.0125 + h * 0.25, BZ] });
  });

  // ============================================================ CENTRE: BALANCE SCALE
  const SX = -0.38;
  const SZ = 0.05;
  // base
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.1, 0.012],
      [0.08, 0.025],
      [0.04, 0.035],
      [0.025, 0.06],
      [0.03, 0.08],
      [0, 0.08],
    ],
    { at: [SX, TH, SZ], segments: 10, color: BRASS },
  );
  b.part(cyl(0.104, 0.104, 0.008, 10), GOLD, { at: [SX, TH + 0.004, SZ] });
  // column
  b.rod([SX, TH + 0.07, SZ], [SX, TH + 0.36, SZ], [0.016, 0.011], { color: BRASS, sides: 8, caps: "flat" });
  for (const y of [0.14, 0.24]) b.part(cyl(0.02, 0.02, 0.012, 8), GOLD, { at: [SX, TH + y, SZ] });
  b.part(sph(0.026, 8, 6), GOLD, { at: [SX, TH + 0.38, SZ] });
  // pivot
  b.part(sph(0.012, 6, 4), GOLD_BRIGHT, { at: [SX, TH + 0.395, SZ] });
  // beam (slightly tilted: left side heavier)
  const tilt = 0.035;
  const beamL = [SX + 0.22, TH + 0.395 - tilt, SZ];
  const beamR = [SX - 0.22, TH + 0.395 + tilt, SZ];
  b.rod(beamL, beamR, [0.009, 0.009], { color: GOLD, sides: 6 });
  b.part(sph(0.02, 8, 5), GOLD, { at: [SX, TH + 0.4, SZ], scale: [1.2, 0.7, 0.8] });
  b.spike([SX, TH + 0.41, SZ], [0, 1, 0], 0.045, 0.008, { color: GOLD });
  const pans: Array<[number[], string]> = [
    [beamL, "#ffcf4a"],
    [beamR, "#ff6a8a"],
  ];
  pans.forEach(([end, gem], i) => {
    const px = end[0];
    const hang = 0.2;
    const py = end[1] - hang;
    b.part(sph(0.013, 6, 4), GOLD_BRIGHT, { at: end as [number, number, number] });
    // chains
    for (const a of [0, 120, 240]) {
      const r = (a * Math.PI) / 180;
      b.rod([end[0], end[1] - 0.005, end[2]], [px + Math.cos(r) * 0.07, py + 0.012, SZ + Math.sin(r) * 0.07], 0.0025, { color: GOLD, caps: "flat" });
    }
    // pan
    b.lathe(
      [
        [0, 0],
        [0.06, 0.008],
        [0.085, 0.024],
        [0.08, 0.026],
        [0.056, 0.014],
        [0, 0.01],
      ],
      { at: [px, py - 0.006, SZ], segments: 12, color: BRASS },
    );
    b.part(new THREE.TorusGeometry(0.083, 0.004, 4, 12), GOLD, { at: [px, py + 0.02, SZ], rotation: [90, 0, 0] });
    // contents
    if (i === 0) {
      // pile of gems/crystals (heavier)
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.OctahedronGeometry(0.018), k % 2 ? "#ffd24a" : "#ff9a3a", {
          at: [px + Math.cos(a) * 0.03, py + 0.022, SZ + Math.sin(a) * 0.03],
          rotation: [20 * k, 30 * k, 0],
        });
      }
      glow(b.part(new THREE.OctahedronGeometry(0.03), "#ffb43a", { at: [px, py + 0.04, SZ], scale: [1, 1.4, 1] }), 1.0);
    } else {
      b.part(sph(0.032, 7, 5), "#8ad4c4", { at: [px, py + 0.03, SZ] });
      b.part(sph(0.02, 7, 5), "#e8f6ff", { at: [px + 0.03, py + 0.022, SZ + 0.02] });
    }
    void gem;
  });
  // weights beside the scale
  [0, 1, 2, 3].forEach((i) => {
    const r = 0.016 - i * 0.002;
    b.part(cyl(r, r + 0.003, 0.014 + i * 0.002, 8), BRASS, { at: [SX + 0.14 + i * 0.04, TH + 0.008, SZ + 0.18] });
    b.part(sph(r * 0.6, 6, 4), GOLD, { at: [SX + 0.14 + i * 0.04, TH + 0.02 + i * 0.002, SZ + 0.18] });
  });

  // ============================================================ MORTAR & PESTLE (right front)
  const MX = 0.45;
  const MZ = 0.22;
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.065, 0.02],
      [0.085, 0.07],
      [0.092, 0.095],
      [0.078, 0.095],
      [0.07, 0.07],
      [0.0, 0.045],
    ],
    { at: [MX, TH, MZ], segments: 10, color: STONE },
  );
  b.part(new THREE.TorusGeometry(0.09, 0.006, 4, 10), STONE, { at: [MX, TH + 0.095, MZ], rotation: [90, 0, 0] });
  // gold band
  b.part(cyl(0.077, 0.071, 0.012, 10), GOLD, { at: [MX, TH + 0.055, MZ] });
  // ground herbs inside
  b.part(sph(0.07, 8, 4), "#4aa84a", { at: [MX, TH + 0.058, MZ], scale: [1, 0.25, 1] });
  for (let i = 0; i < 6; i++) b.part(sph(0.009, 5, 4), i % 2 ? "#ffe07a" : "#7ad46a", { at: [MX - 0.03 + R() * 0.06, TH + 0.075, MZ - 0.03 + R() * 0.06] });
  // pestle
  b.rod([MX + 0.02, TH + 0.06, MZ + 0.01], [MX + 0.1, TH + 0.2, MZ + 0.04], [0.014, 0.022], { color: STONE, sides: 8 });
  b.part(sph(0.022, 8, 5), STONE, { at: [MX + 0.1, TH + 0.205, MZ + 0.04] });
  b.part(cyl(0.018, 0.018, 0.01, 8), GOLD, { at: [MX + 0.1, TH + 0.185, MZ + 0.04], rotation: [20, 0, -29] });

  // ============================================================ BOOKS STACK (left front)
  const BX = -0.68;
  const BZZ = 0.2;
  const stack: Array<[number, number, number, number, number]> = [
    // w, d, t, rotY, colorIndex
    [0.3, 0.22, 0.05, 4, 0],
    [0.27, 0.2, 0.045, -7, 1],
    [0.25, 0.19, 0.04, 6, 2],
    [0.22, 0.17, 0.038, -3, 3],
  ];
  let sy = TH + 0.01;
  stack.forEach(([w, d, t, rot, ci], k) => {
    const [c1, c2] = BOOK_COLORS[ci];
    const col = cel(c1, c2);
    const rotQ = [0, rot, 0] as [number, number, number];
    // pages block
    b.part(box(w - 0.012, t - 0.012, d - 0.01), "#f5e6bd", { at: [BX, sy + t / 2, BZZ], rotation: rotQ });
    // covers
    b.part(box(w, 0.008, d), col, { at: [BX, sy + 0.004, BZZ], rotation: rotQ });
    b.part(box(w, 0.008, d), col, { at: [BX, sy + t - 0.004, BZZ], rotation: rotQ });
    // spine (on +z side? spine on -x side)
    const rad = (rot * Math.PI) / 180;
    const spx = BX - Math.cos(rad) * (w / 2);
    const spz = BZZ + Math.sin(rad) * (w / 2);
    b.part(box(0.012, t, d), col, { at: [spx, sy + t / 2, spz], rotation: rotQ });
    b.part(box(0.014, 0.01, d - 0.02), GOLD, { at: [spx - 0.001, sy + t * 0.25, spz], rotation: rotQ });
    b.part(box(0.014, 0.01, d - 0.02), GOLD, { at: [spx - 0.001, sy + t * 0.75, spz], rotation: rotQ });
    // gold corner caps
    for (const sxn of [1, -1])
      for (const szn of [1, -1]) {
        const cx = BX + (Math.cos(rad) * sxn * w) / 2 + Math.sin(rad) * szn * (d / 2);
        const cz = BZZ + (-Math.sin(rad) * sxn * w) / 2 + Math.cos(rad) * szn * (d / 2);
        b.part(box(0.025, t + 0.004, 0.025), GOLD, { at: [cx, sy + t / 2, cz], rotation: rotQ });
      }
    if (k === 0) {
      // clasp strap
      b.part(box(0.02, t + 0.01, 0.06), GOLD, { at: [BX + w / 2 - 0.004, sy + t / 2, BZZ], rotation: rotQ });
    }
    sy += t;
  });
  // cover emblem on top book
  b.part(new THREE.PlaneGeometry(0.15, 0.19), "#ffffff", {
    at: [BX, sy + 0.0008, BZZ],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    rotation: undefined,
    texture: BOOK_FRONT(BOOK_COLORS[3][0], BOOK_COLORS[3][1]),
  });
  // bookmark ribbon
  b.rod([BX + 0.05, sy, BZZ + 0.08], [BX + 0.08, sy - 0.06, BZZ + 0.15], 0.006, { color: "#e3463a", caps: "flat" });
  // quill in a tiny inkpot atop the stack
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.03, 0.02],
      [0.02, 0.035],
      [0.02, 0.042],
      [0.014, 0.042],
      [0, 0.03],
    ],
    { at: [BX + 0.06, sy, BZZ - 0.02], segments: 8, color: "#2a2a58" },
  );
  b.part(cyl(0.032, 0.032, 0.006, 8), GOLD, { at: [BX + 0.06, sy + 0.04, BZZ - 0.02] });
  b.spike([BX + 0.06, sy + 0.04, BZZ - 0.02], [-0.45, 1, -0.2], 0.2, 0.004, { color: CREAM });
  const quillFeather = [
    { at: [BX + 0.06 - 0.09 * 0.4, sy + 0.04 + 0.18, BZZ - 0.02 - 0.04] as [number, number, number], axis: [-0.45, 1, -0.2] as [number, number, number] },
  ];
  b.cards(quillFeather, LEAF_BLUE, { size: [0.04, 0.12], lean: 10, flow: [0, 0, 1], bend: 20, cross: false });
  // open book next to stack, lying flat: open spread
  const OBX = -0.5;
  const OBZ = 0.38;
  void OBX;
  void OBZ;

  // ============================================================ ALEMBIC DISTILLATION (centre-right)
  const AX = 0.12;
  const AZ = 0.02;
  // brass stand with burner
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.09, 0.02],
      [0.07, 0.035],
      [0.05, 0.08],
      [0.07, 0.12],
      [0.0, 0.12],
    ],
    { at: [AX, TH, AZ], segments: 10, color: BRASS },
  );
  // tripod
  for (const a of [30, 150, 270]) {
    const r = (a * Math.PI) / 180;
    b.rod([AX + Math.cos(r) * 0.08, TH + 0.12, AZ + Math.sin(r) * 0.08], [AX + Math.cos(r) * 0.11, TH, AZ + Math.sin(r) * 0.11], 0.008, { color: IRON, sides: 6 });
  }
  b.part(new THREE.TorusGeometry(0.075, 0.007, 4, 12), IRON, { at: [AX, TH + 0.12, AZ], rotation: [90, 0, 0] });
  // flame
  const flame = b.cards(
    [{ at: [AX, TH + 0.075, AZ], axis: [0, 1, 0] }],
    FLAME_TEX,
    { size: [0.09, 0.1], lean: 0, flow: [0, 0, 1], cross: true },
  );
  glow(flame, 1.3);
  glow(b.part(sph(0.025, 6, 4), "#ffb44a", { at: [AX, TH + 0.085, AZ], scale: [1, 0.7, 1] }), 1.2);
  // flask (round-bottom)
  const flaskCy = TH + 0.25;
  b.part(sph(0.1, 12, 8), GLASS, { at: [AX, flaskCy, AZ] });
  glow(b.part(sph(0.085, 10, 6), "#7ae8c8", { at: [AX, flaskCy - 0.018, AZ], scale: [1, 0.9, 1] }), 0.9);
  b.rod([AX, flaskCy + 0.08, AZ], [AX, flaskCy + 0.2, AZ], [0.03, 0.022], { color: GLASS, sides: 8, caps: "flat" });
  b.part(cyl(0.035, 0.035, 0.012, 8), GOLD, { at: [AX, flaskCy + 0.16, AZ] });
  // second head & condenser arm
  b.part(sph(0.04, 8, 5), GLASS, { at: [AX, flaskCy + 0.22, AZ], scale: [1, 0.9, 1] });
  b.sweep(
    [
      [AX, flaskCy + 0.24, AZ],
      [AX + 0.07, flaskCy + 0.27, AZ + 0.02],
      [AX + 0.16, flaskCy + 0.2, AZ + 0.06],
      [AX + 0.22, flaskCy + 0.06, AZ + 0.1],
    ],
    [0.014, 0.01],
    { color: BRASS, sides: 8, caps: "flat" },
  );
  b.part(cyl(0.02, 0.02, 0.012, 8), GOLD, { at: [AX + 0.1, flaskCy + 0.25, AZ + 0.035], rotation: [0, 0, -60] });
  b.part(cyl(0.02, 0.02, 0.012, 8), GOLD, { at: [AX + 0.18, flaskCy + 0.14, AZ + 0.08], rotation: [0, 0, -70] });
  // collecting beaker
  b.part(cyl(0.04, 0.035, 0.08, 8), GLASS, { at: [AX + 0.22, TH + 0.04, AZ + 0.1] });
  glow(b.part(cyl(0.032, 0.028, 0.04, 8), "#ffe27a", { at: [AX + 0.22, TH + 0.025, AZ + 0.1] }), 1.0);
  // drip
  glow(b.part(sph(0.007, 5, 4), "#ffe27a", { at: [AX + 0.22, flaskCy - 0.04, AZ + 0.1], scale: [1, 1.5, 1] }), 1.0);

  // ============================================================ BIG GLOWING POTION (elemental, hero)
  const PX = 0.72;
  const PZ = -0.12;
  const hero = (x: number, z: number, h: number, liquid: string, name: string) => {
    void name;
    // gold stand ring
    b.part(cyl(0.065, 0.075, 0.015, 8), GOLD, { at: [x, TH + 0.0075, z] });
    b.lathe(
      [
        [0, 0],
        [0.055, 0],
        [0.075, 0.03],
        [0.082, 0.08],
        [0.07, 0.13],
        [0.03, 0.17],
        [0.026, 0.2],
        [0.03, 0.205],
        [0.03, 0.22],
        [0.022, 0.22],
        [0, 0.2],
      ].map(([r, y]) => [r, y * h]) as Array<[number, number]>,
      { at: [x, TH + 0.015, z], segments: 10, color: GLASS },
    );
    const l = b.lathe(
      [
        [0, 0.012],
        [0.05, 0.012],
        [0.07, 0.04],
        [0.076, 0.08],
        [0.064, 0.125],
        [0.03, 0.15],
        [0, 0.15],
      ].map(([r, y]) => [r, y * h]) as Array<[number, number]>,
      { at: [x, TH + 0.015, z], segments: 10, color: liquid },
    );
    glow(l, 1.2);
    // cork + gold collar
    b.part(cyl(0.028, 0.022, 0.04 * h, 8), CORK, { at: [x, TH + 0.015 + 0.225 * h, z] });
    b.part(cyl(0.034, 0.034, 0.012, 8), GOLD, { at: [x, TH + 0.015 + 0.205 * h, z] });
    // sparkles above
    for (let k = 0; k < 3; k++) {
      const f = b.cards(
        [{ at: [x + (k - 1) * 0.045, TH + 0.015 + 0.27 * h + k * 0.03, z + 0.02 * k], axis: [0, 1, 0] }],
        SPARKLE,
        { size: 0.03 + k * 0.006, lean: 0, flow: [0, 0, 1], cross: true },
      );
      glow(f, 1.3);
    }
    b.part(box(0.09, 0.07, 0.003), "#ffffff", { at: [x, TH + 0.015 + 0.08 * h, z + 0.0825], dir: [0, 0, 1], axis: "z", texture: LABEL("#a5642a") });
  };
  hero(PX, PZ, 1.25, "#4ad8ff", "hydro");
  hero(0.56, -0.2, 1.0, "#ff7a3a", "pyro");
  hero(-0.1, -0.2, 1.1, "#b46aff", "electro");
  hero(0.28, -0.2, 0.9, "#8aee5a", "dendro");

  // ============================================================ FLASK ROW (front) - conical flasks
  const conical = (x: number, z: number, col: string, gl: boolean) => {
    b.lathe(
      [
        [0, 0],
        [0.055, 0],
        [0.06, 0.01],
        [0.02, 0.1],
        [0.02, 0.14],
        [0.026, 0.145],
        [0.026, 0.152],
        [0.016, 0.152],
        [0.0, 0.1],
      ],
      { at: [x, TH, z], segments: 10, color: GLASS },
    );
    const l = b.lathe(
      [
        [0, 0.004],
        [0.05, 0.004],
        [0.053, 0.012],
        [0.03, 0.065],
        [0, 0.065],
      ],
      { at: [x, TH, z], segments: 10, color: col },
    );
    if (gl) glow(l, 1.0);
    b.part(cyl(0.017, 0.014, 0.03, 6), CORK, { at: [x, TH + 0.16, z] });
  };
  conical(0.0, 0.34, "#ff6a9a", true);
  conical(0.2, 0.3, "#ffd24a", true);
  conical(0.65, 0.12, "#6aa8ff", false);

  // ============================================================ SCROLL & PARCHMENTS
  // rolled scroll
  b.part(cyl(0.022, 0.022, 0.22, 8), PARCH, { at: [-0.08, TH + 0.022, 0.3], rotation: [0, 0, 90] });
  for (const sx of [1, -1]) b.part(cyl(0.026, 0.026, 0.012, 8), GOLD, { at: [-0.08 + sx * 0.116, TH + 0.022, 0.3], rotation: [0, 0, 90] });
  b.part(cyl(0.024, 0.024, 0.02, 8), "#c9433f", { at: [-0.08, TH + 0.022, 0.3], rotation: [0, 0, 90] });
  // flat parchment with writing
  b.part(new THREE.PlaneGeometry(0.2, 0.3), "#ffffff", {
    at: [0.72, TH + 0.0016, 0.18],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    rotation: undefined,
    texture: SCROLL,
  });
  b.part(box(0.2, 0.002, 0.3), CREAM, { at: [0.72, TH + 0.001, 0.18] });
  // feather pen lying
  b.rod([0.65, TH + 0.008, 0.33], [0.78, TH + 0.008, 0.28], 0.004, { color: CREAM, caps: "round" });
  b.cards([{ at: [0.78, TH + 0.01, 0.28], axis: [0.9, 0, -0.35] }], LEAF_BLUE, { size: [0.05, 0.14], lean: 90, flow: [0, 1, 0], bend: 0 });

  // ============================================================ POTTED HERBS (left back)
  const pot = (x: number, z: number, h: number, tex: THREE.Texture, soilOnly: boolean, col: ReturnType<typeof cel>, count: number, size: [number, number]) => {
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.065, 0.02],
        [0.08, h],
        [0.087, h],
        [0.087, h + 0.014],
        [0.074, h + 0.014],
        [0.074, h - 0.01],
        [0, h - 0.01],
      ],
      { at: [x, TH, z], segments: 10, color: col },
    );
    b.part(cyl(0.088, 0.088, 0.01, 10), GOLD, { at: [x, TH + h + 0.004, z] });
    b.part(cyl(0.074, 0.074, 0.006, 10), SOIL, { at: [x, TH + h - 0.004, z] });
    if (soilOnly) return;
    const frames = Array.from({ length: count }, (_, k) => {
      const a = (k / count) * Math.PI * 2 + k * 0.7;
      const rr = 0.012 + (k % 3) * 0.015;
      return { at: [x + Math.cos(a) * rr, TH + h, z + Math.sin(a) * rr] as [number, number, number], axis: [Math.cos(a) * 0.55, 1, Math.sin(a) * 0.55] as [number, number, number] };
    });
    b.cards(frames, tex, { size, lean: 15, bend: 25, flow: (f) => [f.axis.x, -0.2, f.axis.z], vary: 0.3, rng: rng(40 + count), spin: 20, cross: true });
  };
  pot(-0.74, -0.14, 0.09, LEAF_TEX, false, cel("#d77a4a", "#8a3d4a"), 9, [0.07, 0.17]);
  pot(-0.58, -0.2, 0.07, LAVENDER, false, cel("#4a8ad8", "#2a3f8a"), 10, [0.05, 0.19]);
  pot(0.9 - 0.04, 0.25, 0.08, LEAF_BLUE, false, cel("#e0b04c", "#a5642a"), 8, [0.06, 0.15]);
  // pot rim pattern
  for (const [x, z] of [
    [-0.74, -0.14],
    [-0.58, -0.2],
  ])
    b.part(cyl(0.083, 0.07, 0.014, 10), GOLD, { at: [x, TH + 0.032, z] });
  // loose herb sprigs on table
  const sprigFrames = [0, 1, 2, 3, 4].map((k) => ({
    at: [0.3 + k * 0.012, TH + 0.004, 0.42 + k * 0.01] as [number, number, number],
    axis: [0, 1, 0] as [number, number, number],
  }));
  b.cards(sprigFrames, LEAF_TEX, { size: [0.045, 0.11], lean: 88, flow: (_f, i) => [Math.cos(i * 1.3), 0, Math.sin(i * 1.3)], mirror: true, vary: 0.2, rng: rng(77) });
  // tied herb bundle
  b.rod([0.3, TH + 0.015, 0.4], [0.44, TH + 0.02, 0.43], 0.014, { color: LEAF_DARK, sides: 6 });
  b.rod([0.36, TH + 0.015, 0.405], [0.36, TH + 0.02, 0.435], 0.016, { color: "#e3463a", sides: 6, caps: "flat" });

  // ============================================================ MUSHROOMS & CRYSTALS (small clutter)
  const mush = (x: number, z: number, s: number) => {
    b.part(cyl(0.01 * s, 0.014 * s, 0.035 * s, 6), CREAM, { at: [x, TH + 0.0175 * s, z] });
    b.part(new THREE.SphereGeometry(0.03 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), cel("#e3463a", "#a02050"), { at: [x, TH + 0.032 * s, z] });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6;
      b.part(sph(0.005 * s, 4, 3), "#fff6df", { at: [x + Math.cos(a) * 0.017 * s, TH + 0.048 * s, z + Math.sin(a) * 0.017 * s] });
    }
  };
  mush(0.86, 0.4, 1.2);
  mush(0.82, 0.36, 0.8);
  mush(-0.86, 0.4, 1);
  // glowing crystals cluster
  for (let k = 0; k < 4; k++) {
    const a = k * 1.7;
    glow(
      b.spike([-0.2 + Math.cos(a) * 0.025, TH, 0.38 + Math.sin(a) * 0.025], [Math.cos(a) * 0.25, 1, Math.sin(a) * 0.25], 0.07 + (k % 2) * 0.05, 0.014, {
        color: ["#7ad8ff", "#a88aff", "#7ad8ff", "#ff9ad8"][k],
        sides: 5,
      }),
      1.1,
    );
  }

  // ============================================================ HANGING LANTERN on the right post
  const LX = -TW / 2 + 0.04;
  void LX;
  const lx = TW / 2 - 0.04;
  b.rod([lx, TH + 0.62, BZ - 0.06], [lx, TH + 0.62, BZ + 0.1], 0.01, { color: GOLD, sides: 6 });
  b.rod([lx, TH + 0.62, BZ + 0.1], [lx, TH + 0.55, BZ + 0.1], 0.003, { color: GOLD, caps: "flat" });
  b.part(cyl(0.012, 0.045, 0.04, 6), GOLD, { at: [lx, TH + 0.525, BZ + 0.1] });
  glow(b.part(cyl(0.04, 0.036, 0.07, 6), "#ffd978", { at: [lx, TH + 0.47, BZ + 0.1] }), 1.4);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    b.rod([lx + Math.cos(a) * 0.043, TH + 0.435, BZ + 0.1 + Math.sin(a) * 0.043], [lx + Math.cos(a) * 0.046, TH + 0.505, BZ + 0.1 + Math.sin(a) * 0.046], 0.004, { color: GOLD, sides: 4, caps: "flat" });
  }
  b.part(cyl(0.04, 0.03, 0.014, 6), GOLD, { at: [lx, TH + 0.43, BZ + 0.1] });
  b.part(sph(0.012, 6, 4), GOLD_BRIGHT, { at: [lx, TH + 0.415, BZ + 0.1] });

  // ============================================================ SKULL-FREE: scale-pattern shelf tiles & decorative ribbon on legs
  // pennant banner hanging from shelf's left end
  const bx = -TW / 2 + 0.1;
  b.part(box(0.1, 0.012, 0.012), GOLD, { at: [bx, SHELF_Y - 0.03, BZ + 0.1] });
  b.extrude(
    [
      [-0.05, 0],
      [0.05, 0],
      [0.05, -0.18],
      [0, -0.13, "sharp"],
      [-0.05, -0.18],
    ],
    { at: [bx, SHELF_Y - 0.036, BZ + 0.105], x: [1, 0, 0], thickness: 0.006, color: CLOTH },
  );
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", { at: [bx, SHELF_Y - 0.1, BZ + 0.109], dir: [0, 0, 1], axis: "z", texture: LABEL("#f2c35a") });

  // ============================================================ iron nail heads along apron
  const nails: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) nails.push(sph(0.007, 5, 3).translate(-0.78 + i * 0.12, TH - TOP_T - 0.03 + 0.02, TD / 2 + 0.02));
  b.part(merged(nails), GOLD_BRIGHT, { at: [0, 0, 0] });

  // scale pattern gold paint on the lower shelf front plate
  b.part(box(TW - 0.22, 0.03, 0.006), scales(["#9a6238", "#b47a48"], "#5b3140", { size: 0.04, width: 0.1, seed: 4 }), { at: [0, 0.21, TD / 2 - 0.095] });
  b.part(box(TW - 0.4, 0.014, 0.004), stripes("#f2c35a", "#a5642a", { size: 0.03, axis: "x", width: 0.4 }), { at: [0, 0.185, TD / 2 - 0.068] });

  // ---- INK ref so import used
  void INK;
  void paint;
  void shadowOf;
  void CLOTH_TRIM;
  void LEAF;
  void IRON;

  return b.root;
}
