import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped, tileBox } from "../kits/pixel";

export const meta = {
  name: "Stone-Sealed Hero Sword",
  description:
    "A legendary longsword driven hilt-deep into a rune-carved stone block on a grassy mound. Gold-inlaid fuller, filigreed guard, wrapped grip, sapphire pommel, a ruby on the guard, a tassel and sparkles. Pixel art, 1.35 m tall.",
  style: "pixel art",
  commit: "b816db2",
};

type V3 = [number, number, number];

// Two texel sizes, one per scale: the sword is drawn on a 1 cm grid, the stone and ground on 2 cm.
const CELL = 0.01;
const TEXEL = 0.02;

// Palettes (rising brightness).
const ROCK = ["#3a4150", "#4a5263", "#5d6678", "#718096", "#8a94a9", "#a3acbd", "#bcc4d2", "#d6dbe4"];
const MOSS = ["#2e4d1d", "#3f6a28", "#55883a", "#77ad4c"];
const CRACK = "#2c3342";
const STEEL = ["#1f2636", "#2f3b52", "#46577a", "#63779a", "#8ea2bf", "#c0d0e6", "#eef4fb"];
const GOLD = ["#6b430f", "#a8741c", "#d9a13a", "#f2cc5c", "#fff0b0"];
const LEATHER = ["#24150f", "#352117", "#4a2e20"];
const GRASS = ["#23501f", "#2c6a2a", "#4f9a3c", "#7cba4a"];
const DIRT = "#4a3a26";
const RUBY = "#c42b3a";
const SAPPHIRE = "#2e7fe0";

// Blade: 80 cells (0.8 m) from tip to ricasso. Half-width in cells: a 2-cell tip, 3-cell body, 4-cell ricasso.
function bladeHW(row: number): number {
  return row < 6 ? 1 : row < 12 ? 2 : 3;
}
const BLADE_ROWS = 80;
const BLADE_SPANS: [number, number][] = [];
for (let r = 0; r < BLADE_ROWS; r++) BLADE_SPANS.push([-bladeHW(r), bladeHW(r)]);
const BLADE = stepped(BLADE_SPANS, CELL, { rows: true });

// Crossguard: 7 rows (7 cm), tips widen at rows 2 and 3.
const GUARD_SPANS: [number, number][] = [
  [-5, 5],
  [-12, 12],
  [-13, 13],
  [-13, 13],
  [-12, 12],
  [-7, 7],
  [-4, 4],
];
const GUARD = stepped(GUARD_SPANS, CELL, { rows: true });

// Grip and pommel are turned (8-sided, pixel-faceted).
const GRIP: OutlinePoint[] = [
  [0, 0],
  [0.024, 0, "sharp"],
  [0.024, 0.012, "sharp"],
  [0.016, 0.02, "sharp"],
  [0.016, 0.17, "sharp"],
  [0.022, 0.18, "sharp"],
  [0.022, 0.19, "sharp"],
  [0, 0.19],
];
const POMMEL: OutlinePoint[] = [
  [0, 0],
  [0.02, 0, "sharp"],
  [0.034, 0.02, "sharp"],
  [0.038, 0.035, "sharp"],
  [0.028, 0.05, "sharp"],
  [0, 0.058],
];
const MOUND: OutlinePoint[] = [
  [0, 0],
  [0.9, 0, "sharp"],
  [0.94, 0.015, "sharp"],
  [0.92, 0.03, "sharp"],
  [0, 0.03],
];

// Stone: each block is a blocky pixel tile with cracks; the top one carries moss.
function rockTile(seed: number, mossy: boolean, lift: number) {
  const r = rng(seed);
  return pixelTexture(64, 64, (g) => {
    g.fill((x, y) => pick(ROCK, lift + (1 - y / 64) * 0.4 + (r() - 0.5) * 0.3, bayer(x, y)));
    for (let k = 0; k < 5; k++) {
      let x = Math.floor(r() * 64);
      let y = Math.floor(r() * 64);
      for (let s = 0; s < 12; s++) {
        g.set(x, y, CRACK);
        x += r() < 0.6 ? 1 : 0;
        y += r() < 0.5 ? 1 : r() < 0.5 ? -1 : 0;
      }
    }
    if (mossy)
      g.fill((x, y) => (y < 14 && r() < 0.7 - y / 20 ? pick(MOSS, 0.7 - y / 20, bayer(x, y)) : ""));
  });
}
const ROCK_LOW = rockTile(3, false, 0.0);
const ROCK_MID = rockTile(5, false, 0.1);
const ROCK_TOP = rockTile(7, true, 0.15);

// Socket: a dark cracked ring round the blade where it enters the stone top, cracks running outward.
const SOCKET = pixelTexture(20, 20, (g) => {
  const s = rng(61);
  g.fill((x, y) => {
    const dx = x - 9.5;
    const dy = y - 9.5;
    const d = Math.hypot(dx, dy);
    if (d < 2.6 || d > 9.8) return "";
    if (d > 5 && Math.abs(Math.sin(Math.atan2(dy, dx) * 5 + 0.4)) < 0.12) return CRACK;
    if (d < 6) return "#2a303e";
    return s() < 0.6 ? "#4a5366" : "";
  });
});

// Carved gold runic band (on a stone face): a wave of gold with dark edges and tick marks.
function runeBand(w: number) {
  return pixelTexture(w, 6, (g) => {
    for (let x = 0; x < w; x++) {
      const y = 2 + Math.round(Math.sin(x * 0.75));
      g.set(x, y, GOLD[3]);
      g.set(x, y - 1, "#3a2a0c");
      g.set(x, y + 1, GOLD[1]);
    }
    for (let x = 2; x < w; x += 6) {
      g.set(x, 0, GOLD[2]);
      g.set(x, 5, GOLD[2]);
    }
  });
}
const PLAQUE = runeBand(25);
const PLAQUE_TOP = runeBand(18);

// Faint gold rune ring on the mound: dashes on an outer ring, dots on an inner one (2 cm pixels).
const RUNE_RING = pixelTexture(86, 86, (g) => {
  g.fill((x, y) => {
    const dx = x - 42.5;
    const dy = y - 42.5;
    const d = Math.hypot(dx, dy);
    const seg = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * 16);
    if (d > 39 && d < 41.5) return seg % 2 === 0 ? GOLD[2] : "";
    if (d > 34 && d < 35.5) return seg % 3 === 0 ? GOLD[3] : "";
    return "";
  });
});

// Grass tufts and a flower variant (8 px wide, drawn at CELL).
const TUFT_ROWS = [
  "l.....l.",
  ".l...l.l",
  "gl.l.l.g",
  "gGl.lGlg",
  "gGGlGGlg",
  "gGGGGGGg",
  "gggGGggg",
  ".gg..gg.",
];
const TUFT_PAL = { g: GRASS[1], G: GRASS[2], l: GRASS[3] };
const GRASS_A = pixelArt(TUFT_ROWS, TUFT_PAL);
const GRASS_B = pixelArt(
  TUFT_ROWS.map((row) => [...row].reverse().join("")),
  TUFT_PAL,
);
const FLOWER = pixelArt(
  [
    "........",
    "..r..y..",
    ".rYr.yY.",
    "..r..y..",
    "gGg.gGg.",
    "gGGgGGGg",
    "gGGGGGGg",
    "gggggggg",
  ],
  { r: "#e04a5a", Y: "#ffe14d", y: "#ffd23f", g: GRASS[1], G: GRASS[2] },
);

// Moss hanging from the plinth's top edge (3 px wide, 1 cm pixels).
const MOSS_DRIP = pixelArt(
  ["gGg", "GlG", "gGg", "GlG", "gGg", "GGG", "gGg", "g.g", "..."],
  { g: MOSS[1], G: MOSS[2], l: MOSS[3] },
);

// Sparkles and the hanging tassel from the guard tip.
const SPARK = pixelArt(
  ["..w..", "..y..", "wyWyw", "..y..", "..w.."],
  { w: "#fff3b0", y: "#ffd23f", W: "#ffffff" },
);
const TASSEL = pixelArt(
  ["ggg", "rRr", "rrr", "gGg", "rRr", "rrr", "rRr", "rrr", "gGg", "rrr", "rRr", "rrr", "ggg", "rrr"],
  { g: GOLD[2], G: GOLD[4], r: "#b3202f", R: "#7a1220" },
);

// Paints (per cell, so every square is a pixel on the sword and ground).
const bladePaint = cellPaint(CELL, (c) => {
  if (Math.abs(c.n.z) < 0.5) return "#2a3346";
  const u = Math.abs(c.s[0]) / CELL;
  const row = Math.max(0, Math.floor(c.s[1] / CELL));
  const hw = bladeHW(row);
  if (u >= hw - 0.5) return c.s[0] < 0 ? "#f4f9ff" : "#b6c6da";
  if (u < 0.5) return row % 8 < 4 ? GOLD[3] : "#3a4660";
  if (row >= 72 && (Math.floor(c.s[0] / CELL) + row) % 2 === 0) return STEEL[5];
  return c.pick(STEEL, 0.35 + (c.s[0] > 0 ? 0.25 : 0) + (row / BLADE_ROWS) * 0.15);
});
const guardPaint = cellPaint(CELL, (c) => {
  if (Math.abs(c.n.z) < 0.5) return GOLD[0];
  const u = Math.abs(c.s[0]) / CELL;
  const row = Math.min(GUARD_SPANS.length - 1, Math.max(0, Math.floor(c.s[1] / CELL)));
  const hw = GUARD_SPANS[row][1];
  if (u >= hw - 0.5) return row >= 4 ? GOLD[4] : GOLD[0];
  if ((Math.floor(c.s[0] / CELL) + row) % 4 === 0) return GOLD[3];
  return c.pick(GOLD, 0.4 + (row / 6) * 0.3);
});
const gripPaint = cellPaint(CELL, (c) => {
  const row = Math.floor(c.s[0] / CELL);
  const sector = Math.floor(c.s[1] / 45);
  if ((row + sector) % 3 === 0) return GOLD[3];
  return c.pick(LEATHER, c.random(9));
});
const pommelPaint = cellPaint(CELL, (c) => c.pick(GOLD, 0.3 + (0.6 * c.s[0]) / 0.058));
const groundPaint = cellPaint(TEXEL, (c) => (c.random(5) < 0.12 ? DIRT : c.pick(GRASS, 0.2 + 0.7 * c.random(6))));

export default function build() {
  const b = createBuilder({ name: "pixelHeroSword", paintSize: 2048 });
  b.joint("stone", { at: [0, 0, 0] });

  // Heights: stone top T, guard bottom GB (0.29 m of blade stands out of the stone), blade tip TIP.
  const T = 0.77;
  const GB = T + 0.255;
  const TIP = GB + 0.035 - 0.8;
  const UP: V3 = [0, 1, 0];

  // Mound and stone.
  b.lathe(MOUND, { at: [0, 0, 0], segments: 16, color: groundPaint, name: "mound" });
  const chunk = (size: V3, tile: THREE.Texture, texel: number, seed: number, at: V3, yaw = 0, name?: string) =>
    b.part(tileBox(size, tile, texel, { rand: rng(seed) }), "#ffffff", {
      texture: tile,
      at,
      rotation: [0, yaw, 0],
      name,
    });
  chunk([0.98, 0.22, 0.74], ROCK_LOW, TEXEL, 21, [0, 0.11, 0], 0, "stone.base");
  chunk([0.9, 0.03, 0.68], ROCK_TOP, TEXEL, 22, [0, 0.235, 0], 0, "stone.ledge");
  chunk([0.84, 0.3, 0.62], ROCK_MID, TEXEL, 23, [0, 0.4, 0], 0, "stone.mid");
  chunk([0.7, 0.22, 0.56], ROCK_TOP, TEXEL, 24, [0, 0.66, 0], 0, "stone.top");
  b.part(new THREE.BoxGeometry(0.74, 0.024, 0.6), "#c9962e", { at: [0, 0.552, 0], name: "trim.gold" });
  b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
    texture: PLAQUE,
    at: [0, 0.4, 0.314],
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    name: "plaque",
  });
  b.part(new THREE.CircleGeometry(0.2, 24), "#ffffff", {
    texture: SOCKET,
    at: [0, T + 0.003, 0],
    dir: UP,
    axis: "z",
    up: [0, 0, 1],
    name: "socket",
  });
  b.part(new THREE.PlaneGeometry(0.36, 0.12), "#ffffff", {
    texture: PLAQUE_TOP,
    at: [0, 0.66, 0.284],
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    name: "plaque.top",
  });
  b.part(new THREE.CircleGeometry(0.86, 48), "#ffffff", {
    texture: RUNE_RING,
    at: [0, 0.031, 0],
    dir: UP,
    axis: "z",
    up: [0, 0, 1],
    name: "rune.ring",
  });
  // Chips on the stone top and rubble on the mound.
  chunk([0.07, 0.04, 0.06], ROCK_TOP, 0.01, 41, [0.22, T + 0.02, 0.12], 25, "chip.a");
  chunk([0.05, 0.03, 0.05], ROCK_TOP, 0.01, 42, [-0.25, T + 0.015, -0.1], -30, "chip.b");
  chunk([0.04, 0.025, 0.04], ROCK_LOW, 0.01, 43, [0.1, T + 0.0125, -0.22], 0, "chip.c");
  chunk([0.16, 0.14, 0.15], ROCK_MID, TEXEL, 51, [-0.6, 0.1, 0.2], 28, "rubble.a");
  chunk([0.12, 0.08, 0.11], ROCK_MID, TEXEL, 52, [0.64, 0.07, 0.3], -14, "rubble.b");
  chunk([0.09, 0.06, 0.09], ROCK_TOP, TEXEL, 53, [0.55, 0.06, -0.42], 40, "rubble.c");
  chunk([0.07, 0.05, 0.07], ROCK_LOW, TEXEL, 54, [-0.44, 0.055, -0.5], 12, "rubble.d");
  chunk([0.05, 0.035, 0.045], ROCK_TOP, 0.01, 55, [-0.78, 0.047, 0.1], 0, "pebble.a");
  chunk([0.04, 0.03, 0.04], ROCK_MID, 0.01, 56, [0.78, 0.045, -0.08], 15, "pebble.b");

  // Blade, guard and hilt.
  b.extrude(BLADE, {
    at: [0, TIP, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.005, 0.012],
    color: bladePaint,
    name: "blade",
  });
  b.extrude(GUARD, {
    at: [0, GB, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.026,
    color: guardPaint,
    name: "guard",
  });
  b.part(new THREE.OctahedronGeometry(0.02), RUBY, { at: [0, GB + 0.035, 0.024], flat: true, name: "gem.ruby" });
  for (const s of [1, -1])
    b.part(new THREE.OctahedronGeometry(0.011), SAPPHIRE, {
      at: [s * 0.118, GB + 0.025, 0.012],
      flat: true,
      name: s > 0 ? "gem.tipL" : "gem.tipR",
    });
  b.lathe(GRIP, { at: [0, GB + 0.07, 0], segments: 8, color: gripPaint, name: "grip" });
  b.lathe(POMMEL, { at: [0, GB + 0.26, 0], segments: 8, color: pommelPaint, name: "pommel" });
  b.part(new THREE.OctahedronGeometry(0.016), SAPPHIRE, { at: [0, GB + 0.325, 0], flat: true, name: "gem.pommel" });

  // Tassel from the guard's right tip, hanging down.
  b.cards([frame([0.125, GB + 0.02, 0], UP)], TASSEL, { size: [0.03, 0.14], lean: 180, flow: [0, 0, 1] });

  // Grass tufts around the mound.
  const tufts = [];
  const rt = rng(31);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + (rt() - 0.5) * 0.2;
    const d = 0.66 + 0.1 * rt();
    tufts.push(frame([Math.cos(a) * d, 0.03, Math.sin(a) * d], UP));
  }
  b.cards(tufts, [GRASS_A, GRASS_A, GRASS_B, FLOWER], { size: [0.08, 0.08], cross: true, rng: rng(32), vary: 0.2 });

  // Moss drips off the plinth's top front edge, and tufts sprouting from the stone top.
  const drips = [-0.42, -0.25, -0.08, 0.1, 0.27, 0.42].map((x) => frame([x, 0.22, 0.372], UP));
  b.cards(drips, MOSS_DRIP, { size: [0.03, 0.09], lean: 180, flow: [0, 0, 1], rng: rng(71), vary: 0.3 });
  const topSpots: V3[] = [
    [-0.3, T, 0.18],
    [0.27, T, -0.2],
    [-0.12, T, -0.24],
    [-0.28, T, -0.05],
  ];
  b.cards(topSpots.map((p) => frame(p, UP)), [GRASS_A, GRASS_B], { size: [0.08, 0.08], cross: true, rng: rng(72) });

  // Sparkles drifting round the hilt (each card stands on its frame, so start it half a card below).
  const sparks: V3[] = [
    [0.16, 1.13, 0.1],
    [-0.17, 1.22, 0.06],
    [0.11, 1.3, 0.14],
    [-0.12, 0.92, 0.16],
    [0.22, 0.98, -0.04],
    [-0.22, 1.32, -0.06],
    [0.0, 1.38, 0.12],
  ];
  b.cards(
    sparks.map(([x, y, z]) => frame([x, y - 0.025, z], UP)),
    SPARK,
    { size: 0.05, cross: true },
  );

  return b.root;
}
