```ts
import * as THREE from "three";
import { catmull, createBuilder, mottle, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "roadside-shrine",
  description:
    "A roadside shrine in a Genshin-style cel look: a stone plinth with a teal-roofed hokora under a shimenawa and shide, a vermilion torii with glowing paper lanterns, an offering table of mochi, mikan, sake and candles, stone lanterns, flowers and a sake barrel.",
};

// ---------------------------------------------------------------------------------------------------------------
// Paints. Cel shading: a lit tone and a hue-shifted shadow, picked against the key light.

const STONE = cel(mottle("#dcd6ea", "#b7aed3", { size: 0.35, seed: 4 }));
const WOOD = cel("#f0b874", "#c9803f");
const TABLE = cel("#7a4a32", "#4e2c22");
const VERMILION = cel("#e6482d", "#a92d22");
const LACQUER = cel("#2a2446", "#17132c");
const TEAL = cel("#2fa6b0", "#1f6f8a");
const GILT = cel("#ffd35a", "#c58a2c");
const PAPER = cel("#fdfbf4", "#c8d2e8");
const STRAW = cel("#f3d27a", "#b8863a");
const CERAMIC = cel("#fbf6ea", "#c8c4da");
const CANDLE = cel("#fff4d6", "#d8c8a8");
const TEALWARE = cel("#9fdcf2", "#5b9cc2");
const PLATE = cel("#3fc4b4", "#237f78");
const BARREL = cel("#dc9f58", "#9c5e34");
const HOOP = cel("#c8402a", "#7e2218");
const MOCHI = cel("#fffaf0", "#d6cfe6");
const FRUIT = cel("#ff9d2e", "#d25c24");
const LEAF = cel("#4fc26c", "#2a7d4f");

// Flat colours for pieces that glow (painted surfaces cannot).
const LANTERN = "#ff6a3d";
const PANEL = "#ffd46b";
const FLAME = "#ffc64a";
const BLACK = "#241c33";
const STEM = "#4caf6a";

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** The hokora door: a carved panel with a teal crest and gilt diamond. */
const DOOR = svg(
  `<svg viewBox="0 0 90 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="90" height="100" fill="#7a4a2a"/>
    <rect x="5" y="5" width="80" height="90" rx="5" fill="#f0c27a" stroke="#2b1b3a" stroke-width="2.5"/>
    <rect x="11" y="11" width="68" height="78" rx="3" fill="none" stroke="#b5672f" stroke-width="2.5"/>
    <circle cx="45" cy="50" r="23" fill="#2a9aa6" stroke="#2b1b3a" stroke-width="2.5"/>
    <circle cx="45" cy="50" r="16" fill="none" stroke="#ffd35a" stroke-width="3"/>
    <path d="M45 36 L51 50 L45 64 L39 50Z" fill="#ffd35a"/>
    <circle cx="45" cy="50" r="3.5" fill="#e5472c"/>
  </svg>`,
  { size: 256 },
);

/** The gakuzuka plaque on the torii's tie beam. */
const PLAQUE = svg(
  `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="56" rx="7" fill="#2b2448"/>
    <rect x="4" y="4" width="92" height="48" rx="5" fill="none" stroke="#ffd35a" stroke-width="3"/>
    <circle cx="50" cy="28" r="16" fill="#ffd35a"/>
    <circle cx="50" cy="28" r="9" fill="#e5472c"/>
    <path d="M14 28 H32 M68 28 H86" stroke="#ffd35a" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

/** The sake barrel lid: a red sun on cream. */
const LID = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#f6ecd2"/>
    <circle cx="50" cy="50" r="46" fill="#f6ecd2" stroke="#c8402a" stroke-width="5"/>
    <circle cx="50" cy="50" r="30" fill="#e5472c"/>
    <circle cx="50" cy="50" r="15" fill="#ffd35a"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Profiles (lathe outlines are [radius, height] around the axis; extrude outlines are [x, y] in meters)

const LANTERN_BODY: [number, number][] = [
  [0, -0.13],
  [0.05, -0.13],
  [0.085, -0.1],
  [0.11, -0.04],
  [0.118, 0],
  [0.11, 0.04],
  [0.085, 0.1],
  [0.05, 0.13],
  [0, 0.13],
];
const TOKKURI: [number, number][] = [
  [0, 0],
  [0.045, 0],
  [0.052, 0.03],
  [0.05, 0.09],
  [0.03, 0.12],
  [0.026, 0.16],
  [0.04, 0.175],
  [0.034, 0.19],
  [0, 0.19],
];
const BELL: [number, number][] = [
  [0, 0.03],
  [0.02, 0.03],
  [0.03, 0],
  [0.042, -0.03],
  [0, -0.03],
];
const SAKE_BARREL: [number, number][] = [
  [0, 0],
  [0.16, 0],
  [0.19, 0.05],
  [0.2, 0.25],
  [0.19, 0.46],
  [0.16, 0.5],
  [0, 0.5],
];
const TORII_KASAGI: [number, number][] = [
  [-1.25, 0.2],
  [-0.62, 0.14],
  [0, 0.17],
  [0.62, 0.14],
  [1.25, 0.2],
  [1.27, 0.12],
  [0.8, 0],
  [-0.8, 0],
  [-1.27, 0.12],
];

/** A shide: a zig-zag paper streamer hanging down from its rope point (y runs down, x across). */
function shide(folds: number): [number, number][] {
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let i = 0; i <= folds; i++) {
    const c = i % 2 ? -0.012 : 0.012;
    const y = -0.04 * i;
    left.push([c - 0.025, y]);
    right.push([c + 0.025, y]);
  }
  return [...left, ...right.reverse()];
}

// ---------------------------------------------------------------------------------------------------------------
// The shrine. One root joint; every part hangs on it, grouped by section.

export default function build() {
  const b = createBuilder({ name: "roadside-shrine" });
  const shrine = b.joint("shrine", { at: [0, 0, 0] });
  const rand = rng(11);
  const jitter = () => (rand() - 0.5) * 0.012;
  const sec = (group: string) => ({ bone: shrine, group });

  // ---- Plinth: two stacked stone courses the whole shrine stands on -------------------------------------------
  const pl = sec("plinth");
  b.part(new THREE.BoxGeometry(2.0, 0.1, 1.46), STONE, { ...pl, at: [0, 0.05, -0.17] });
  b.part(new THREE.BoxGeometry(1.9, 0.1, 1.36), STONE, { ...pl, at: [0, 0.15, -0.17] });

  // ---- Hokora: the small wooden shrine house -------------------------------------------------------------------
  const hk = sec("hokora");
  const HZ = -0.4;
  const ROPE_Z = -0.07;
  b.part(new THREE.BoxGeometry(0.84, 0.56, 0.6), WOOD, { ...hk, at: [0, 0.48, HZ] });
  for (const x of [-0.4, 0.4])
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.56, 10), VERMILION, { ...hk, at: [x, 0.48, -0.11] });
  b.part(new THREE.PlaneGeometry(0.36, 0.4), "#ffffff", {
    ...hk,
    at: [0, 0.44, -0.098],
    dir: [0, 0, 1],
    axis: "z",
    texture: DOOR,
  });
  // Gable roof: its ridge runs front to back, the gable faces forward.
  b.extrude(
    [
      [-0.5, 0],
      [0.5, 0],
      [0.5, 0.07],
      [0, 0.3],
      [-0.5, 0.07],
    ],
    { ...hk, at: [0, 0.76, HZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.8, bevel: 0.012, color: TEAL },
  );
  b.part(new THREE.BoxGeometry(0.05, 0.03, 0.82), GILT, { ...hk, at: [0, 1.065, HZ] });
  for (const dz of [-0.36, 0.36])
    b.part(new THREE.SphereGeometry(0.035, 8, 6), GILT, { ...hk, at: [0, 1.075, HZ + dz] });

  // Shimenawa: a straw rope across the front, with shide and a bell.
  const rope = catmull([
    [-0.4, 0.72, ROPE_Z],
    [-0.2, 0.695, ROPE_Z],
    [0, 0.685, ROPE_Z],
    [0.2, 0.695, ROPE_Z],
    [0.4, 0.72, ROPE_Z],
  ]);
  b.sweep(rope, 0.016, { ...hk, color: STRAW });
  for (const x of [-0.2, 0.2])
    b.extrude(shide(4), {
      ...hk,
      at: [x, 0.695, ROPE_Z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      color: PAPER,
    });
  b.rod([0, 0.685, ROPE_Z], [0, 0.64, ROPE_Z], 0.005, BLACK, { ...hk });
  b.lathe(BELL, { ...hk, at: [0, 0.605, ROPE_Z], color: GILT, segments: 10 });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), BLACK, { ...hk, at: [0, 0.574, ROPE_Z] });

  // ---- Offering table on the plinth ----------------------------------------------------------------------------
  const off = sec("offerings");
  b.part(new THREE.BoxGeometry(0.9, 0.32, 0.4), TABLE, { ...off, at: [0, 0.36, 0.22] });
  b.part(new THREE.BoxGeometry(0.96, 0.04, 0.46), VERMILION, { ...off, at: [0, 0.54, 0.22] });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.01), GILT, { ...off, at: [0, 0.4, 0.425] });

  // Kagami mochi: two stacked rice cakes with a mikan on top and a leaf.
  const MOCHI_Y = 0.56;
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.125, 0.03],
      [0.115, 0.05],
      [0, 0.05],
    ],
    { ...off, at: [-0.3, MOCHI_Y, 0.24], color: MOCHI, segments: 14 },
  );
  b.lathe(
    [
      [0, 0],
      [0.095, 0],
      [0.1, 0.025],
      [0.09, 0.045],
      [0, 0.045],
    ],
    { ...off, at: [-0.3, MOCHI_Y + 0.05, 0.24], color: MOCHI, segments: 12 },
  );
  b.part(new THREE.SphereGeometry(0.05, 10, 7), FRUIT, { ...off, at: [-0.3, MOCHI_Y + 0.13, 0.24] });
  b.extrude(
    [
      [0, 0],
      [0.04, 0.025],
      [0.08, 0],
      [0.04, -0.025],
    ],
    { ...off, at: [-0.34, MOCHI_Y + 0.185, 0.24], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.006, smoothing: 1, color: LEAF },
  );

  // A plate of mikan.
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.18, 0.02],
      [0, 0.02],
    ],
    { ...off, at: [0.24, 0.56, 0.24], color: PLATE, segments: 14 },
  );
  const pile: [number, number, number][] = [
    [0.2, 0.626, 0.2],
    [0.28, 0.626, 0.2],
    [0.24, 0.626, 0.29],
    [0.24, 0.672, 0.245],
  ];
  for (const [x, y, z] of pile)
    b.part(new THREE.SphereGeometry(0.046, 10, 7), FRUIT, { ...off, at: [x + jitter(), y, z + jitter()] });

  // Two sake bottles at the back.
  b.lathe(TOKKURI, { ...off, at: [-0.1, 0.56, 0.12], color: CERAMIC, segments: 12 });
  b.lathe(TOKKURI, { ...off, at: [0, 0.56, 0.08], color: CERAMIC, segments: 12 });

  // Candles on gilt holders, with flames that glow.
  for (const x of [-0.06, 0.06]) {
    b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.02, 10), GILT, { ...off, at: [x, 0.57, 0.36] });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8), CANDLE, { ...off, at: [x, 0.64, 0.36] });
    glow(b.part(new THREE.SphereGeometry(0.018, 8, 6), FLAME, { ...off, at: [x, 0.71, 0.36] }), 2.4);
  }

  // ---- Flowers in a ceramic vase on the plinth's front-left corner --------------------------------------------
  const fl = sec("flowers");
  const VX = -0.82;
  const VZ = 0.36;
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.075, 0.05],
      [0.1, 0.13],
      [0.07, 0.2],
      [0.05, 0.22],
      [0, 0.22],
    ],
    { ...fl, at: [VX, 0.2, VZ], color: TEALWARE, segments: 12 },
  );
  const heads: [number, number, number, string][] = [
    [-0.06, 0.66, -0.02, "#ff7fb0"],
    [0.05, 0.7, 0.03, "#ffd84a"],
    [0.0, 0.74, -0.05, "#fff3f8"],
    [-0.03, 0.64, 0.07, "#9fd8ff"],
    [0.07, 0.62, -0.06, "#ff9bd0"],
  ];
  for (const [dx, y, dz, color] of heads) {
    b.rod([VX, 0.4, VZ], [VX + dx, y, VZ + dz], 0.006, STEM, { ...fl });
    b.part(new THREE.SphereGeometry(0.036, 8, 6), color, { ...fl, at: [VX + dx, y, VZ + dz] });
  }

  // ---- Torii gate at the front: vermilion posts, a dark kasagi, a glowing lantern pair --------------------
  const tor = sec("torii");
  for (const x of [-0.85, 0.85]) {
    b.part(new THREE.CylinderGeometry(0.12, 0.13, 0.06, 10), STONE, { ...tor, at: [x, 0.03, 0.85] });
    b.part(new THREE.CylinderGeometry(0.075, 0.085, 1.74, 12), VERMILION, { ...tor, at: [x, 0.93, 0.85] });
  }
  b.part(new THREE.BoxGeometry(2.0, 0.1, 0.12), VERMILION, { ...tor, at: [0, 1.5, 0.85] });
  b.extrude(TORII_KASAGI, {
    ...tor,
    at: [0, 1.8, 0.85],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.2,
    bevel: 0.01,
    color: LACQUER,
  });
  b.part(new THREE.PlaneGeometry(0.34, 0.19), "#ffffff", {
    ...tor,
    at: [0, 1.5, 0.915],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLAQUE,
  });

  const chochin = (x: number) => {
    const at: [number, number, number] = [x, 1.2, 0.85];
    glow(b.lathe(LANTERN_BODY, { ...tor, at, color: LANTERN, segments: 14 }), 1.6);
    b.part(new THREE.CylinderGeometry(0.122, 0.122, 0.014, 14, 1, true), LACQUER, { ...tor, at });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10), LACQUER, { ...tor, at: [x, 1.34, 0.85] });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10), LACQUER, { ...tor, at: [x, 1.06, 0.85] });
    b.part(new THREE.CylinderGeometry(0.008, 0.012, 0.07, 6), GILT, { ...tor, at: [x, 1.02, 0.85] });
    b.rod([x, 1.45, 0.85], [x, 1.35, 0.85], 0.006, BLACK, { ...tor });
  };
  chochin(-0.42);
  chochin(0.42);

  // ---- Stone lanterns (toro) beside the path -------------------------------------------------------------------
  const toro = (side: number) => {
    const tg = sec("toro");
    const x = side * 1.38;
    const z = -0.25;
    b.part(new THREE.CylinderGeometry(0.19, 0.21, 0.1, 8), STONE, { ...tg, at: [x, 0.05, z] });
    b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 8), STONE, { ...tg, at: [x, 0.16, z] });
    b.part(new THREE.CylinderGeometry(0.05, 0.075, 0.42, 8), STONE, { ...tg, at: [x, 0.43, z] });
    b.part(new THREE.CylinderGeometry(0.13, 0.1, 0.04, 8), STONE, { ...tg, at: [x, 0.66, z] });
    b.part(new THREE.BoxGeometry(0.24, 0.22, 0.24), STONE, { ...tg, at: [x, 0.79, z] });
    // Four glowing windows in the chamber.
    glow(b.part(new THREE.BoxGeometry(0.15, 0.14, 0.012), PANEL, { ...tg, at: [x, 0.79, z + 0.125] }), 1.8);
    glow(b.part(new THREE.BoxGeometry(0.15, 0.14, 0.012), PANEL, { ...tg, at: [x, 0.79, z - 0.125] }), 1.8);
    glow(b.part(new THREE.BoxGeometry(0.012, 0.14, 0.15), PANEL, { ...tg, at: [x + 0.125, 0.79, z] }), 1.8);
    glow(b.part(new THREE.BoxGeometry(0.012, 0.14, 0.15), PANEL, { ...tg, at: [x - 0.125, 0.79, z] }), 1.8);
    // Octagonal flared roof and a gilt finial.
    b.lathe(
      [
        [0, 0],
        [0.25, 0],
        [0.2, 0.045],
        [0.1, 0.1],
        [0, 0.13],
      ],
      { ...tg, at: [x, 0.9, z], color: STONE, segments: 8 },
    );
    b.part(new THREE.ConeGeometry(0.035, 0.1, 8), GILT, { ...tg, at: [x, 1.08, z] });
  };
  toro(1);
  toro(-1);

  // ---- Sake barrel on the ground, dressed with hoops and a sun lid ---------------------------------------------
  const bg = sec("barrel");
  b.lathe(SAKE_BARREL, { ...bg, at: [1.25, 0, 0.6], color: BARREL, segments: 14 });
  for (const y of [0.1, 0.4])
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 14, 1, true), HOOP, { ...bg, at: [1.25, y, 0.6] });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 14), CERAMIC, { ...bg, at: [1.25, 0.51, 0.6] });
  b.part(new THREE.CircleGeometry(0.16, 20), "#ffffff", {
    ...bg,
    at: [1.25, 0.524, 0.6],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: LID,
  });

  return b.root;
}
```