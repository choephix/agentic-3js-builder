```ts
import * as THREE from "three";
import { catmull, cells, createBuilder, frame, grain, mix, mottle, noise, paint, rng, svg } from "agentic-3js-builder";
import type { ColorInput, Part } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

type V = [number, number, number];
type Pt = [number, number];

export const meta = {
  name: "Sky island",
  description:
    "A floating island of grassy cliffs under a ruined sun temple. A crystal spring runs off the lip in a waterfall, with windswept trees and hanging roots.",
};

const V3 = (x: number, y: number, z: number): V => [x, y, z];

/** A point on a circle around the island axis: compass angle deg (0 = +Z, 90 = +X) at radius r. */
const around = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [Math.sin(a) * r, Math.cos(a) * r];
};

/** n points on a horizontal circle of radius r centred on (cx, y, cz). */
const ringOf = (cx: number, y: number, cz: number, r: number, n: number): V[] =>
  Array.from({ length: n }, (_, i) => {
    const [dx, dz] = around((i / n) * 360, r);
    return V3(cx + dx, y, cz + dz);
  });

// ---------------------------------------------------------------------------------------------------------------
// Layout constants (metres, model space, +Y up)

const TOP = 3.0; // grass on top of the island
const FLOOR = 3.2; // the ruin floor sits on the grass
const RING = 0.85; // radius of the column ring

/** The island's silhouette: from the axis out, around the cliff, and back to the axis at the tip. */
const ISLAND: Pt[] = [
  [0, TOP],
  [1.55, TOP],
  [1.9, 2.97],
  [2.03, 2.78],
  [1.93, 2.5],
  [2.0, 2.27],
  [1.7, 1.98],
  [1.78, 1.74],
  [1.32, 1.42],
  [0.85, 1.18],
  [0.35, 0.98],
  [0, 0.86],
];

const BASIN: Pt[] = [
  [0, 0],
  [0.46, 0],
  [0.46, 0.12],
  [0.36, 0.12],
  [0.36, 0.05],
  [0, 0.05],
];

const columnProfile = (h: number): Pt[] => [
  [0, 0],
  [0.17, 0],
  [0.17, 0.07],
  [0.13, 0.1],
  [0.11, 0.16],
  [0.095, h - 0.22],
  [0.135, h - 0.2],
  [0.135, h - 0.14],
  [0.16, h - 0.1],
  [0.16, h - 0.04],
  [0, h - 0.02],
];

const brokenProfile = (h: number): Pt[] => [
  [0, 0],
  [0.17, 0],
  [0.17, 0.07],
  [0.13, 0.1],
  [0.11, 0.16],
  [0.1, h - 0.25],
  [0.12, h - 0.12],
  [0.11, h],
  [0.04, h - 0.08],
  [0, h - 0.1],
];

// ---------------------------------------------------------------------------------------------------------------
// Paints. Every colour is a cel-shaded two-tone (lit and a hue-shifted shadow), Genshin style.

const ROCK_TONES = ["#c49a6a", "#b58758", "#d8b38a", "#a97b52"];
const ROCK = cel(
  paint((p, n) => {
    if (n.y < -0.45 && noise(p, 0.45, 8) > 0.6) return "#7fa27a";
    const band = Math.floor(p.y / 0.17 + noise(p, 0.7, 3) * 1.6);
    return ROCK_TONES[((band % 4) + 4) % 4];
  }),
);

const GRASS = cel(mottle("#a8ea6c", "#63c25b", { size: 0.32, seed: 2 }), "#3f9a55");

const ISLE = paint((p, n) => {
  if (n.y > 0.55) return GRASS;
  if (Math.abs(n.y - 0.46) < 0.035 && p.y > TOP - 0.4) return "#2b5a34"; // dark line along the grass lip
  return ROCK;
});

const STONE = cel(
  paint((p) => {
    const c = cells(p, 0.24, 4);
    if (c.d2 - c.d1 < 0.06) return "#b8a582"; // mortar lines between irregular blocks
    return mix("#f7edd7", "#e6d5b1", c.id);
  }),
);

const GOLD = cel("#ffd766", "#c48a2e");
const BARK = cel(grain("#b07a4c", "#6e4630", { size: 0.05, axis: "y", seed: 5 }));
const LEAF_A = cel(mottle("#9be46a", "#4cb65a", { size: 0.22, seed: 6 }), "#2f7f4e");
const LEAF_B = cel(mottle("#6fdc86", "#2b9360", { size: 0.18, seed: 9 }), "#1f6a48");
const BLOSSOM = cel(mottle("#ffd6ea", "#f7a8cc", { size: 0.2, seed: 11 }), "#c77aa6");
const VINE = cel(mottle("#7ccf72", "#3b8a50", { size: 0.1, seed: 13 }), "#2a6a40");
const MIST = cel("#f4feff", "#b7e6f6");

// Flat colours: these glow with the glow kit, so they stay unpainted.
const WATER = "#63e4ff";
const CRYSTAL = "#8ef4ff";
const SHARD = "#c9fbff";

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const LEAF_SVG = `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 3 C60 28 62 66 32 93 C2 66 4 28 32 3 Z" fill="#8fe066" stroke="#1d5a34" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 4 C48 28 48 66 32 92 C40 64 41 30 32 4 Z" fill="#5cba56"/>
  <path d="M32 12 L32 84" stroke="#2c6e3e" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M32 34 L19 26 M32 48 L45 40 M32 62 L19 54 M32 74 L45 68" stroke="#2c6e3e" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;

const PETAL_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="#ffd0e8" stroke="#d25f97" stroke-width="2.4">
    <ellipse cx="32" cy="17" rx="10" ry="14"/>
    <ellipse cx="32" cy="17" rx="10" ry="14" transform="rotate(72 32 32)"/>
    <ellipse cx="32" cy="17" rx="10" ry="14" transform="rotate(144 32 32)"/>
    <ellipse cx="32" cy="17" rx="10" ry="14" transform="rotate(216 32 32)"/>
    <ellipse cx="32" cy="17" rx="10" ry="14" transform="rotate(288 32 32)"/>
  </g>
  <circle cx="32" cy="32" r="6.5" fill="#ffd45c" stroke="#c98a2b" stroke-width="2"/>
</svg>`;

const TUFT_SVG = `<svg viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 40 Q7 18 1 5 Q15 17 15 40 Z" fill="#7fd45e" stroke="#25603a" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M15 40 Q20 9 27 1 Q29 22 25 40 Z" fill="#b5ef78" stroke="#25603a" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M27 40 Q33 16 45 9 Q38 27 38 40 Z" fill="#6cc857" stroke="#25603a" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;

const FALL_SVG = `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6fdff"/>
      <stop offset="0.35" stop-color="#7fe3ff"/>
      <stop offset="0.8" stop-color="#2fa6ec"/>
      <stop offset="1" stop-color="#1b74c9"/>
    </linearGradient>
  </defs>
  <path d="M0 0 H64 V106 L58 112 L51 104 L44 116 L36 106 L29 118 L21 106 L13 116 L6 105 L0 110 Z" fill="url(#w)"/>
  <g stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.85">
    <path d="M9 4 V52"/><path d="M19 0 V80"/><path d="M27 8 V40"/>
    <path d="M38 2 V96"/><path d="M49 6 V60"/><path d="M57 10 V46"/>
  </g>
  <path d="M0 104 Q8 96 16 104 T32 104 T48 104 T64 104 V128 H0 Z" fill="#f4feff" opacity="0.9"/>
</svg>`;

const TABLET_SVG = `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="40" height="72" rx="7" fill="#2a3d5c" stroke="#ffe27a" stroke-width="3.5"/>
  <path d="M14 18 L24 28 L34 18 M24 28 L24 44 M14 54 L34 54 M14 64 L34 64 M18 36 L30 36"
    fill="none" stroke="#9ff6ff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/** A sun seal on the platform: rings, runic triangles and twelve tick marks, transparent outside. */
const ringSvg = () => {
  const at = (r: number, a: number) => `${(100 + Math.cos(a) * r).toFixed(1)} ${(100 + Math.sin(a) * r).toFixed(1)}`;
  const ticks = Array.from(
    { length: 12 },
    (_, i) => `<path d="M${at(66, (i * Math.PI) / 6)} L${at(84, (i * Math.PI) / 6)}"/>`,
  ).join("");
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#9ff6ff" stroke-linecap="round">
    <circle cx="100" cy="100" r="92" stroke-width="5"/>
    <circle cx="100" cy="100" r="78" stroke-width="2.5" stroke-dasharray="10 7"/>
    <circle cx="100" cy="100" r="58" stroke-width="2"/>
    <polygon points="100,64 134,122 66,122" stroke-width="3"/>
    <polygon points="100,136 66,78 134,78" stroke-width="2.4"/>
    <g stroke-width="3.2">${ticks}</g>
  </g>
</svg>`;
};

// ---------------------------------------------------------------------------------------------------------------

type TreeSpec = {
  x: number;
  z: number;
  h: number;
  lean: number;
  crown: number;
  leaf: ColorInput;
  card: THREE.Texture;
  cardSize: [number, number];
  leaves: number;
  branches: number;
  seed: number;
};

/** Trunks and crowns that a dozen cards round the ruins don't cover. */
const TREE_SPOTS: Pt[] = [
  [-1.55, -0.7],
  [1.4, -0.95],
  [-0.5, -1.6],
  [1.6, 0.5],
];
const BUSH_SPOTS: Pt[] = [
  [-1.25, 0.95],
  [0.4, -1.75],
];

export default function build() {
  const b = createBuilder({ name: "skyisle" });
  const isle = b.joint("isle", { at: V3(0, 0, 0) });
  const on = { bone: isle };

  const tex = {
    leaf: svg(LEAF_SVG, { size: 192 }),
    petal: svg(PETAL_SVG, { size: 128 }),
    tuft: svg(TUFT_SVG, { size: 128 }),
    fall: svg(FALL_SVG, { size: 256 }),
    tablet: svg(TABLET_SVG, { size: 192 }),
    ring: svg(ringSvg(), { size: 256 }),
  };

  /** One faceted lump: an icosahedron, scaled per axis. */
  const blob = (c: V, r: V, color: ColorInput) =>
    b.part(new THREE.IcosahedronGeometry(1, 1), color, { at: c, scale: r, flat: true, ...on });

  /** A closed tube round a horizontal circle: a gold band, a rim, a collar. */
  const ringTube = (pts: V[], radius: number, color: ColorInput) =>
    b.sweep(catmull(pts, { closed: true }), radius, { color, ...on });

  const vine = (pts: V[], r: number) =>
    b.sweep(catmull(pts), (t: number) => r * (1 - t) + 0.012, { color: VINE, name: "vine", ...on });

  // -------------------------------------------------------------------------------------------------------------
  // The island: a faceted cliff with a grass cap, hanging rock and roots

  const island = b.lathe(ISLAND, {
    at: V3(0, 0, 0),
    axis: V3(0, 1, 0),
    segments: 16,
    color: ISLE,
    name: "island",
    ...on,
  });

  const chunks: [number, number, number, number, number][] = [
    [0.62, 1.02, -0.55, 0.2, 20],
    [-0.5, 1.12, -0.85, 0.16, 50],
    [-0.95, 1.2, 0.4, 0.18, 70],
    [0.7, 1.2, 0.75, 0.17, 35],
  ];
  for (const [x, y, z, r, yaw] of chunks)
    b.part(new THREE.DodecahedronGeometry(r, 0), ROCK, {
      at: V3(x, y, z),
      rotation: V3(12, yaw, 8),
      scale: V3(1, 0.75, 1.1),
      flat: true,
      name: "chunk",
      ...on,
    });

  const stalactites: [number, number, number, number, number][] = [
    [0.7, 1.3, 0.45, 0.5, 0.12],
    [-0.9, 1.25, -0.2, 0.42, 0.11],
    [0.15, 1.22, -0.75, 0.6, 0.1],
    [-0.5, 1.35, 0.85, 0.35, 0.1],
  ];
  for (const [x, y, z, len, r] of stalactites)
    b.spike(V3(x, y, z), V3(0, -1, 0), len, r, { color: ROCK, ...on });

  vine(
    [V3(-1.45, 2.5, 0.65), V3(-1.6, 2.0, 0.8), V3(-1.52, 1.45, 0.92), V3(-1.66, 0.95, 1.05)],
    0.045,
  );
  vine([V3(1.6, 2.3, -0.7), V3(1.78, 1.75, -0.8), V3(1.7, 1.3, -0.95)], 0.035);
  vine([V3(-0.2, 2.2, -1.55), V3(-0.25, 1.7, -1.85), V3(-0.15, 1.2, -2.0)], 0.035);

  // -------------------------------------------------------------------------------------------------------------
  // The ruin: a platform with a gold rim, a column ring, an arch, a wall, rubble and steps

  const platform = b.lathe(
    [
      [0, 2.9],
      [1.12, 2.9],
      [1.12, 3.1],
      [1.04, 3.2],
      [0, 3.2],
    ] as Pt[],
    { at: V3(0, 0, 0), axis: V3(0, 1, 0), segments: 14, color: STONE, name: "platform", ...on },
  );
  ringTube(ringOf(0, 3.13, 0, 1.08, 14), 0.02, GOLD);

  b.part(new THREE.BoxGeometry(0.5, 0.12, 0.24), STONE, { at: V3(-0.15, 3.06, 1.2), name: "stepLow", ...on });
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.24), STONE, { at: V3(-0.15, 3.1, 1.0), name: "stepHigh", ...on });

  const COLS = [
    { deg: 0, h: 1.8, broken: false },
    { deg: 60, h: 1.0, broken: true },
    { deg: 120, h: 1.8, broken: false },
    { deg: 180, h: 1.3, broken: true },
    { deg: 240, h: 1.8, broken: false },
    { deg: 300, h: 0.62, broken: true },
  ];
  const columns: Part[] = COLS.map((c, i) => {
    const [x, z] = around(c.deg, RING);
    return b.lathe(c.broken ? brokenProfile(c.h) : columnProfile(c.h), {
      at: V3(x, FLOOR, z),
      axis: V3(0, 1, 0),
      segments: 8,
      color: STONE,
      name: `column${i}`,
      ...on,
    });
  });
  COLS.forEach((c) => {
    if (c.broken) return;
    const [x, z] = around(c.deg, RING);
    ringTube(ringOf(x, FLOOR + c.h - 0.19, z, 0.19, 10), 0.018, GOLD);
    ringTube(ringOf(x, FLOOR + 0.13, z, 0.2, 10), 0.02, GOLD);
  });

  // Glowing rune tablets on the two whole columns facing out.
  for (const i of [0, 4]) {
    const c = COLS[i];
    const [ox, oz] = around(c.deg, 1);
    const [x, z] = around(c.deg, RING);
    glow(
      b.decal(columns[i], tex.tablet, {
        at: V3(x + ox * 0.115, FLOOR + 0.95, z + oz * 0.115),
        dir: V3(ox, 0, oz),
        size: [0.12, 0.2],
        color: "#ffffff",
        name: `tablet${i}`,
        ...on,
      }),
      0.9,
    );
  }

  // A collapsed arch springing from the front column and falling toward its neighbour.
  b.sweep(
    catmull([V3(0, FLOOR + 1.7, 0.85), V3(0.36, FLOOR + 1.95, 0.6), V3(0.78, FLOOR + 0.9, 0.42)]),
    () => [0.075, 0.1] as [number, number],
    { section: "box", caps: "flat", color: STONE, name: "arch", ...on },
  );

  // A half-standing wall between the back columns.
  const WALL_DEG = [195, 203, 211, 219, 226];
  const wall = WALL_DEG.map((d) => {
    const [x, z] = around(d, RING);
    return V3(x, FLOOR + 0.22, z);
  });
  b.sweep(catmull(wall), () => [0.055, 0.22] as [number, number], {
    section: "box",
    caps: "flat",
    up: V3(0, 1, 0),
    color: STONE,
    name: "wall",
    ...on,
  });

  // A fallen block and loose rubble.
  b.part(new THREE.BoxGeometry(0.4, 0.2, 0.26), STONE, {
    at: V3(0.93, FLOOR + 0.1, 0.02),
    rotation: V3(0, 18, 0),
    name: "block",
    ...on,
  });
  const rubble: [number, number, number, number][] = [
    [0.3, -1.0, 0.2, 20],
    [-0.12, -1.07, 0.14, -15],
    [0.55, -0.7, 0.16, 40],
  ];
  for (const [x, z, s, yaw] of rubble)
    b.part(new THREE.BoxGeometry(s, s * 0.6, s * 0.8), STONE, {
      at: V3(x, FLOOR + s * 0.3, z),
      rotation: V3(0, yaw, 0),
      name: "rubble",
      ...on,
    });

  // The spring basin at the centre, a crystal rising from its pool.
  b.lathe(BASIN, { at: V3(0, FLOOR, 0), axis: V3(0, 1, 0), segments: 12, color: STONE, name: "basin", ...on });
  ringTube(ringOf(0, FLOOR + 0.12, 0, 0.46, 12), 0.012, GOLD);
  glow(
    b.part(new THREE.CircleGeometry(0.36, 14), WATER, {
      at: V3(0, FLOOR + 0.07, 0),
      rotation: V3(-90, 0, 0),
      name: "pool",
      ...on,
    }),
    0.55,
  );
  const crystal = b.part(new THREE.OctahedronGeometry(0.2, 0), CRYSTAL, {
    at: V3(0, FLOOR + 0.51, 0),
    scale: V3(0.9, 2.2, 0.9),
    flat: true,
    name: "crystal",
    ...on,
  });
  const shard = b.part(new THREE.OctahedronGeometry(0.1, 0), CRYSTAL, {
    at: V3(0.17, FLOOR + 0.27, -0.12),
    scale: V3(0.8, 2.0, 0.8),
    rotation: V3(0, 0, 14),
    flat: true,
    name: "shard",
    ...on,
  });
  glow(crystal, 1.4);
  glow(shard, 1.3);

  // Three small motes drifting above the crystal.
  const motes: [number, number, number, number][] = [
    [0.42, FLOOR + 1.15, 0.1, 0.07],
    [-0.35, FLOOR + 1.45, -0.2, 0.06],
    [0.1, FLOOR + 1.7, 0.35, 0.05],
  ];
  for (const [x, y, z, r] of motes)
    glow(
      b.part(new THREE.OctahedronGeometry(r, 0), SHARD, {
        at: V3(x, y, z),
        rotation: V3(20, 35, 10),
        flat: true,
        name: "mote",
        ...on,
      }),
      1.6,
    );

  // The rune seal on the platform.
  glow(
    b.decal(platform, tex.ring, {
      at: V3(0, FLOOR, 0),
      dir: V3(0, 1, 0),
      up: V3(0, 0, -1),
      size: [1.8, 1.8],
      color: "#ffffff",
      name: "runeRing",
      ...on,
    }),
    1.0,
  );

  // -------------------------------------------------------------------------------------------------------------
  // The waterfall: a channel from the basin to the lip, a glowing sheet falling off the edge, mist at its foot

  const channel = b.sweep(
    catmull([
      V3(0.3, FLOOR + 0.1, 0.12),
      V3(0.4, FLOOR - 0.01, 0.75),
      V3(0.5, 3.04, 1.2),
      V3(0.58, 3.0, 1.55),
      V3(0.6, 2.98, 1.98),
    ]),
    (t: number) => [0.07 - 0.025 * t, 0.012] as [number, number],
    { section: "box", caps: "flat", up: V3(0, 1, 0), color: WATER, name: "channel", ...on },
  );
  glow(channel, 0.6);

  const fallTop = 2.98;
  const fallBottom = 0.6;
  glow(
    b.cards([frame(V3(0.6, fallTop, 2.02), V3(0, -1, 0))], tex.fall, {
      size: [0.62, fallTop - fallBottom],
      lean: 0,
      sink: 0,
      flow: V3(0, 0, 1),
      color: "#ffffff",
      ...on,
    }),
    0.9,
  );
  glow(
    b.cards([frame(V3(0.36, 2.9, 2.08), V3(0, -1, 0))], tex.fall, {
      size: [0.36, 2.3],
      lean: 0,
      sink: 0,
      flow: V3(0, 0, 1),
      color: "#ffffff",
      ...on,
    }),
    0.9,
  );

  const puffs: [number, number, number, number][] = [
    [0.62, 0.62, 2.0, 0.24],
    [0.25, 0.66, 2.12, 0.2],
    [1.0, 0.7, 1.75, 0.22],
    [0.82, 1.1, 2.25, 0.18],
    [0.5, 1.9, 2.3, 0.16],
  ];
  for (const [x, y, z, r] of puffs) blob(V3(x, y, z), V3(r * 1.3, r * 0.7, r * 1.3), MIST);

  // -------------------------------------------------------------------------------------------------------------
  // Trees: a tapering trunk with branches, a crown of faceted lumps, and leaves scattered over it

  const grow = (s: TreeSpec) => {
    const rand = rng(s.seed);
    const spine: V[] = [
      V3(s.x, TOP - 0.05, s.z),
      V3(s.x + 0.03, TOP + s.h * 0.45, s.z - 0.02),
      V3(s.x - 0.04, TOP + s.h * 0.8, s.z + 0.03),
      V3(s.x + s.lean, TOP + s.h, s.z),
    ];
    b.sweep(catmull(spine), (t: number) => 0.13 * (1 - t) + 0.05, {
      color: BARK,
      name: `trunk${s.seed}`,
      ...on,
    });
    for (let k = 0; k < s.branches; k++) {
      const from = spine[1 + (k % 2)];
      const a = rand() * Math.PI * 2;
      const len = s.h * (0.35 + 0.2 * rand());
      const tip = V3(from[0] + Math.cos(a) * len * 0.8, from[1] + len * 0.7, from[2] + Math.sin(a) * len * 0.8);
      const knee = V3(
        (from[0] + tip[0]) / 2 - Math.sin(a) * 0.06,
        (from[1] + tip[1]) / 2 + 0.04,
        (from[2] + tip[2]) / 2 + Math.cos(a) * 0.06,
      );
      b.sweep(catmull([from, knee, tip]), (t: number) => 0.05 * (1 - t) + 0.018, { color: BARK, ...on });
    }

    const top = spine[3];
    const crown: Part[] = [blob(V3(top[0], top[1] + 0.05, top[2]), V3(s.crown, s.crown * 0.9, s.crown), s.leaf)];
    const n = 6 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * 0.7;
      const d = s.crown * (0.55 + 0.3 * rand());
      const rr = s.crown * (0.48 + 0.24 * rand());
      crown.push(
        blob(
          V3(top[0] + Math.cos(a) * d, top[1] + 0.05 + (rand() - 0.35) * s.crown * 0.6, top[2] + Math.sin(a) * d),
          V3(rr, rr * 0.8, rr),
          s.leaf,
        ),
      );
    }

    const hits = b.surface(crown).scatter(s.leaves, {
      rng: rng(s.seed + 5),
      minDist: 0.1,
      filter: (h) => h.n.y > -0.45,
    });
    b.cards(hits, s.card, {
      size: s.cardSize,
      lean: 42,
      vary: 0.25,
      rng: rng(s.seed + 6),
      color: "#ffffff",
      ...on,
    });
  };

  grow({ x: -1.55, z: -0.7, h: 1.7, lean: -0.05, crown: 0.72, leaf: LEAF_A, card: tex.leaf, cardSize: [0.24, 0.32], leaves: 110, branches: 3, seed: 11 });
  grow({ x: 1.4, z: -0.95, h: 1.2, lean: 0.06, crown: 0.6, leaf: BLOSSOM, card: tex.petal, cardSize: [0.2, 0.2], leaves: 90, branches: 2, seed: 22 });
  grow({ x: -0.5, z: -1.6, h: 1.45, lean: 0.03, crown: 0.62, leaf: LEAF_B, card: tex.leaf, cardSize: [0.22, 0.3], leaves: 100, branches: 3, seed: 33 });
  grow({ x: 1.6, z: 0.5, h: 0.75, lean: -0.03, crown: 0.42, leaf: LEAF_A, card: tex.leaf, cardSize: [0.18, 0.24], leaves: 60, branches: 2, seed: 44 });

  const bush = (x: number, z: number, r: number, seed: number) => {
    const rand = rng(seed);
    blob(V3(x, TOP + r * 0.5, z), V3(r, r * 0.8, r), LEAF_B);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + rand();
      blob(
        V3(x + Math.cos(a) * r * 0.9, TOP + r * 0.35, z + Math.sin(a) * r * 0.9),
        V3(r * 0.7, r * 0.6, r * 0.7),
        LEAF_B,
      );
    }
  };
  bush(BUSH_SPOTS[0][0], BUSH_SPOTS[0][1], 0.24, 81);
  bush(BUSH_SPOTS[1][0], BUSH_SPOTS[1][1], 0.2, 82);

  // -------------------------------------------------------------------------------------------------------------
  // Grass: tufts and flowers on the top, a fringe over the lip

  const clear = (x: number, z: number) =>
    Math.hypot(x, z) > 1.22 &&
    !(z > 0.15 && Math.abs(x - (0.3 + 0.15 * z)) < 0.22) &&
    ![...TREE_SPOTS, ...BUSH_SPOTS].some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 0.36);

  const tufts = b.surface(island).scatter(90, {
    rng: rng(61),
    minDist: 0.14,
    filter: (h) => h.n.y > 0.8 && clear(h.at.x, h.at.z),
  });
  b.cards(tufts, tex.tuft, { size: [0.16, 0.14], lean: 0, vary: 0.3, rng: rng(62), color: "#ffffff", ...on });

  const flowers = b.surface(island).scatter(34, {
    rng: rng(71),
    minDist: 0.3,
    filter: (h) => h.n.y > 0.8 && clear(h.at.x, h.at.z),
  });
  b.cards(flowers, tex.petal, { size: 0.1, lean: 0, vary: 0.2, rng: rng(72), color: "#ffffff", ...on });

  const fringe = b.surface(island).scatter(40, {
    rng: rng(81),
    minDist: 0.2,
    filter: (h) => h.n.y > 0.25 && h.n.y < 0.7 && Math.hypot(h.at.x, h.at.z) > 1.5,
  });
  b.cards(fringe, tex.tuft, { size: [0.2, 0.16], lean: 70, vary: 0.2, rng: rng(82), color: "#ffffff", ...on });

  return b.root;
}
```