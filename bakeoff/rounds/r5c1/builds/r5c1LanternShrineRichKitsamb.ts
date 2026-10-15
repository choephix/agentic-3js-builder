import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  svg,
  paint,
  mottle,
  stripes,
  grain,
  countershade,
  noise,
} from "../../../../src/index";
import type { OutlinePoint, Paint } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description:
    "A cel-shaded Inazuma-style roadside hokora with a curved-roof shrine, vermilion torii with shimenawa and shide, glowing paper and stone lanterns, kitsune guardians, offerings, an ema rack, a jizo, a sakura tree and Electro crystals.",
};

type V = [number, number, number];
type Col = string | Paint;
const DEG = Math.PI / 180;

// ------------------------------------------------------------------ palette
const GOLD = "#f4c24f";
const GOLD_D = "#b98a2c";
const INKC = "#2a2233";
const CREAM = "#fff4de";
const ORANGE = "#ff9a2e";
const LEAFG = "#5fae4f";
const PINK = "#f4a6bd";
const WHITE = "#fff6e8";
const GREEN_D = "#a9d17a";
const BRONZE = "#7b6a4f";
const ASH = "#bdb7c4";
const ELEC = "#b98bff";
const ELEC2 = "#8a63ff";
const FLAME = "#ffb64a";
const FLAME_HOT = "#ffd98a";
const CERAMIC = "#eef0f6";
const BLUE = "#3c5aa8";
const LANT = "#ee4b31";
const BARK_D = "#5b3d33";
const EAR_IN = "#d86b6b";

// cel-shaded paints
const RED = cel("#e0432f", "#a3203b");
const LAC = cel("#3b3350", "#1f1a30");
const PLASTER = cel("#f3e6c8", "#cdb89d");
const WOOD_V = cel(grain("#a87348", "#8c5a3a", { size: 0.035, axis: "y", seed: 3 }), "#6a4136");
const WOOD_H = cel(grain("#a87348", "#8c5a3a", { size: 0.035, axis: "x", seed: 4 }), "#6a4136");
const STONE_BASE = mottle("#b4bacb", "#939bb0", { size: 0.22, seed: 3 });
const STONE = cel(
  paint((p, n) => {
    const m = noise(p, 0.2, 11);
    return (p.y < 0.5 && m > 0.58) || (n.y < 0.5 && m > 0.7) ? "#86b068" : STONE_BASE;
  }),
);
const STONE_L = cel(mottle("#d6d3c7", "#bdb9aa", { size: 0.2, seed: 8 }));
const FOXW = cel(mottle("#e8e5de", "#cfcbc2", { size: 0.15, seed: 9 }));
const TILE = cel(stripes("#43508c", "#2e3870", { size: 0.07, axis: "z", width: 0.28, wobble: 0, seed: 2 }));
const ROOF = paint((_p, n) => (Math.abs(n.z) > 0.8 ? RED : TILE));
const STRAW = cel(stripes("#dcc072", "#b99847", { size: 0.04, axis: "y", width: 0.4, wobble: 0.15, seed: 5 }));
const ROPE_RW = stripes("#f4eee0", "#d83a2c", { size: 0.06, axis: "y", width: 0.5, wobble: 0 });
const GROUND = countershade(
  cel(mottle("#86bd5c", "#6ba44e", { size: 0.6, seed: 4 })),
  cel("#76523d"),
  { level: 0.55, soft: 0.2 },
);
const BARK = cel(grain("#94684f", "#775040", { size: 0.05, axis: "y", seed: 6 }), "#5a3a3c");
const SAKURA = cel(mottle("#ffc6dc", "#ffe2ec", { size: 0.5, seed: 12 }), "#f4a0c2");

// ------------------------------------------------------------------ textures
const LATTICE = svg(
  `<svg viewBox="0 0 52 70" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 35 L26 1 L51 35 L26 69 Z" fill="none" stroke="#6b4533" stroke-width="1.8"/>
    <path d="M1 35 L51 35 M26 1 L26 69" stroke="#6b4533" stroke-width="1.8"/>
    <path d="M13 1 V51 M39 1 V51 M1 18 H51 M1 52 H51" stroke="#7a4f38" stroke-width="2"/>
    <rect x="1" y="52" width="50" height="17" fill="#b5332b"/>
    <rect x="1" y="1" width="50" height="68" fill="none" stroke="#8c2a22" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);
const PLAQUE = svg(
  `<svg viewBox="0 0 68 52" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="65" height="49" rx="4" fill="#231d2c" stroke="#e6b84a" stroke-width="3"/>
    <circle cx="34" cy="26" r="17" fill="none" stroke="#e6b84a" stroke-width="2.4"/>
    <path d="M37 10 L26 28 L33 28 L30 42 L43 23 L36 23 Z" fill="#ffd761" stroke="#b98a2c" stroke-width="1"/>
    <path d="M9 16 q6 -6 10 0 q-4 6 -8 2 M59 36 q-6 6 -10 0 q4 -6 8 -2" fill="none" stroke="#b98bff" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const SHIDE = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 97 L9 82 L27 70 L10 56 L28 44 L11 30 L25 18 L20 3" fill="none" stroke="#bdb5cf" stroke-width="15" stroke-linejoin="bevel"/>
    <path d="M20 97 L9 82 L27 70 L10 56 L28 44 L11 30 L25 18 L20 3" fill="none" stroke="#ffffff" stroke-width="11" stroke-linejoin="bevel"/>
    <rect x="14" y="92" width="12" height="8" fill="#d9bd6a"/>
  </svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#fff1d6" stroke="#b83a2a" stroke-width="4"/>
    ${[0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<g transform="rotate(${a} 50 50)"><path d="M50 50 C36 40 38 16 50 12 C62 16 64 40 50 50Z" fill="#ec7a9c" stroke="#b83a5a" stroke-width="2.4"/></g>`,
      )
      .join("")}
    <circle cx="50" cy="50" r="6" fill="#f4c24f" stroke="#b98a2c" stroke-width="2"/>
  </svg>`,
  { size: 192 },
);
let sigilTicks = "";
for (let i = 0; i < 24; i++) {
  const a = i * 15 * DEG;
  const r1 = i % 3 === 0 ? 80 : 86;
  sigilTicks += `<path d="M${(100 + Math.sin(a) * r1).toFixed(1)} ${(100 - Math.cos(a) * r1).toFixed(1)} L${(100 + Math.sin(a) * 94).toFixed(1)} ${(100 - Math.cos(a) * 94).toFixed(1)}" stroke="#c9a2ff" stroke-width="2.4"/>`;
}
let star = "";
for (let i = 0; i <= 8; i++) {
  const a = ((i * 3) % 8) * 45 * DEG;
  star += `${i === 0 ? "M" : "L"}${(100 + Math.sin(a) * 70).toFixed(1)} ${(100 - Math.cos(a) * 70).toFixed(1)} `;
}
const SIGIL = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="96" fill="none" stroke="#b98bff" stroke-width="2.8"/>
    <circle cx="100" cy="100" r="76" fill="none" stroke="#b98bff" stroke-width="2.2"/>
    <circle cx="100" cy="100" r="36" fill="none" stroke="#c9a2ff" stroke-width="2.2"/>
    ${sigilTicks}
    <path d="${star}Z" fill="none" stroke="#d9bcff" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M106 78 L90 104 L101 104 L96 124 L114 96 L103 96 Z" fill="#e6d2ff"/>
  </svg>`,
  { size: 512 },
);
const COIN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#2a2233"/>
    <circle cx="50" cy="50" r="42" fill="#f4c24f"/>
    <circle cx="50" cy="50" r="33" fill="none" stroke="#b98a2c" stroke-width="3.4"/>
    <path d="M50 12 V22 M50 78 V88 M12 50 H22 M78 50 H88" stroke="#b98a2c" stroke-width="3.4"/>
    <rect x="38" y="38" width="24" height="24" fill="#2a2233"/>
  </svg>`,
  { size: 192 },
);
const EMA_FOX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 90 L17 60 L12 14 L38 34 L62 34 L88 14 L83 60 Z" fill="#fff6ea" stroke="#2a2233" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 90 L36 70 L64 70 Z" fill="#d83a2c"/>
    <path d="M24 52 L42 58 M76 52 L58 58" stroke="#d83a2c" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="68" r="5" fill="#2a2233"/>
  </svg>`,
  { size: 128 },
);
const EMA_BOLT = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="43" fill="#6d4bbf" stroke="#2a2233" stroke-width="4"/>
    <path d="M57 10 L28 55 L47 55 L41 90 L73 43 L54 43 Z" fill="#ffd761" stroke="#2a2233" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);
const BLOSSOM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    ${[0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<g transform="rotate(${a} 32 32)"><path d="M32 32 C20 24 22 6 32 4 C42 6 44 24 32 32Z" fill="#fbb6cd" stroke="#e57aa0" stroke-width="1.8"/></g>`,
      )
      .join("")}
    <circle cx="32" cy="32" r="4.5" fill="#ffd761"/>
  </svg>`,
  { size: 128 },
);
const PETAL = svg(
  `<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 30 C2 22 2 6 12 2 C22 6 22 22 12 30Z" fill="#fbb6cd" stroke="#e98cae" stroke-width="2"/>
  </svg>`,
  { size: 64 },
);
const GRASS_T = svg(
  `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 50 Q9 26 2 4 Q17 24 17 50Z" fill="#5fa84a"/>
    <path d="M14 50 Q20 22 20 2 Q28 24 27 50Z" fill="#7cc35a"/>
    <path d="M24 50 Q30 30 38 12 Q36 34 33 50Z" fill="#4f9a46"/>
  </svg>`,
  { size: 128 },
);
const LEAF_T = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 62 C2 44 4 16 16 2 C28 16 30 44 16 62Z" fill="#5fae4f" stroke="#3f8a3c" stroke-width="2"/>
    <path d="M16 60 L16 8" stroke="#3f8a3c" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);

// ------------------------------------------------------------------ builder, joints, helpers
const b = createBuilder({ name: "inazuma_shrine", paintSize: 2048 });
const R = rng(5);

const base = b.joint("base", { at: [0, 0, 0] });
const lanternL = b.joint("lanternL", { parent: base, at: [0.9, 1.5, -0.45], dir: [0, -1, 0], group: "lanterns" });
const lanternR = b.joint("lanternR", { parent: base, at: [-0.9, 1.5, -0.45], dir: [0, -1, 0], group: "lanterns" });
const bell = b.joint("bell", { parent: base, at: [0, 1.37, -0.45], dir: [0, -1, 0], role: "hinge" });
const doorL = b.joint("doorL", { parent: base, at: [0.54, 0.64, -0.66], dir: [0, 1, 0], role: "hinge" });
const doorR = b.joint("doorR", { parent: base, at: [-0.54, 0.64, -0.66], dir: [0, 1, 0], role: "hinge" });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const P = (geo: THREE.BufferGeometry, color: Col, at: V, o: any = {}) =>
  b.part(geo, color, { bone: base, at, flat: true, ...o });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const box = (w: number, h: number, d: number, c: Col, at: V, o: any = {}) => P(new THREE.BoxGeometry(w, h, d), c, at, o);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cyl = (rt: number, rb: number, h: number, seg: number, c: Col, at: V, o: any = {}) =>
  P(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, o);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ball = (r: number, c: Col, at: V, o: any = {}) => P(new THREE.SphereGeometry(r, 7, 5), c, at, o);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cone = (r: number, h: number, seg: number, c: Col, at: V, o: any = {}) =>
  P(new THREE.ConeGeometry(r, h, seg), c, at, o);
const TUBE = { bone: base, sides: 6, smooth: false };

const blocked = (x: number, z: number) =>
  (Math.abs(x) < 1.85 && z < 0.8 && z > -2.5) ||
  (Math.abs(x) < 0.55 && z > -0.2) ||
  (
    [
      [1, 0.7, 0.45],
      [-1, 0.7, 0.45],
      [1.9, 1.2, 0.65],
      [-1.8, 1.9, 0.4],
      [2, -0.45, 0.5],
      [-2, -0.45, 0.5],
      [-2.1, -2.0, 0.4],
      [1.05, 2, 0.3],
      [-1.05, 2, 0.3],
      [0, 1.35, 0.8],
      [-2.3, 0.5, 0.45],
      [2.2, -1.5, 0.45],
    ] as number[][]
  ).some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r);

// ------------------------------------------------------------------ ground, path, rocks
const ground = cyl(3.5, 3.7, 0.2, 12, GROUND, [0, 0.1, 0]);

for (const z of [3.1, 2.77, 2.44, 2.15]) {
  cyl(0.3 + R() * 0.05, 0.32, 0.03, 7, STONE_L, [R() * 0.1 - 0.05, 0.215, z], { rotation: [0, R() * 60, 0] });
}
glow(
  P(new THREE.PlaneGeometry(1.4, 1.4), "#ffffff", [0, 0.212, 1.35], {
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: SIGIL,
  }),
  0.9,
);

for (let i = 0; i < 12; i++) {
  const a = (30 + (i / 11) * 300) * DEG; // skip the front arc where the path enters
  const rr = 3.15 + R() * 0.15;
  const s = 0.16 + R() * 0.16;
  P(new THREE.DodecahedronGeometry(s, 0), STONE, [Math.sin(a) * rr, 0.2 + s * 0.4, Math.cos(a) * rr], {
    scale: [1, 0.7, 1],
    rotation: [R() * 40, R() * 360, R() * 40],
  });
}

// ------------------------------------------------------------------ shrine platforms
box(3.2, 0.18, 2.0, STONE, [0, 0.29, -1.2]);
box(3.26, 0.025, 2.06, STONE_L, [0, 0.3825, -1.2]);
box(2.0, 0.18, 1.6, STONE, [0, 0.47, -1.2]);
box(1.0, 0.09, 0.3, STONE_L, [0, 0.245, -0.05]);
box(1.0, 0.09, 0.2, STONE_L, [0, 0.425, -0.3]);

// ------------------------------------------------------------------ hokora (shrine building)
box(1.3, 0.06, 1.4, WOOD_H, [0, 0.59, -1.2]);
for (const sx of [1, -1])
  for (const z of [-0.6, -1.8]) box(0.09, 0.88, 0.09, RED, [sx * 0.58, 1.06, z]);
box(1.2, 0.88, 0.05, PLASTER, [0, 1.06, -1.82]);
for (const sx of [1, -1]) box(0.05, 0.88, 1.2, PLASTER, [sx * 0.58, 1.06, -1.2]);
box(1.24, 0.05, 0.07, RED, [0, 0.98, -1.83]);
for (const sx of [1, -1]) box(0.07, 0.05, 1.24, RED, [sx * 0.59, 0.98, -1.2]);
box(1.3, 0.1, 0.1, RED, [0, 1.42, -0.6]);
box(1.2, 0.05, 0.08, WOOD_H, [0, 0.65, -0.62]);
box(0.07, 0.07, 0.2, WOOD_V, [0, 1.4, -0.5]);

// doors (hinged lattice panels)
const doorFrame = (j: typeof doorL, cx: number) =>
  box(0.52, 0.72, 0.03, "#ffffff", [cx, 1.0, -0.66], { bone: j, texture: LATTICE });
doorFrame(doorL, 0.28);
doorFrame(doorR, -0.28);

// interior altar
box(0.7, 0.22, 0.35, LAC, [0, 0.73, -1.55]);
box(0.74, 0.03, 0.39, RED, [0, 0.845, -1.55]);
cyl(0.02, 0.02, 0.3, 6, GOLD_D, [0, 1.0, -1.62]);
glow(cyl(0.15, 0.15, 0.02, 14, GOLD, [0, 1.17, -1.63], { dir: [0, 0.08, 1] }), 0.95);
cyl(0.175, 0.175, 0.015, 14, GOLD_D, [0, 1.17, -1.64], { dir: [0, 0.08, 1] });
for (const sx of [1, -1]) {
  cyl(0.025, 0.025, 0.09, 6, CREAM, [sx * 0.27, 0.92, -1.5]);
  glow(cone(0.02, 0.06, 5, FLAME, [sx * 0.27, 0.99, -1.5]), 1.4);
  glow(ball(0.012, FLAME_HOT, [sx * 0.27, 0.978, -1.5]), 1.5);
  cyl(0.05, 0.05, 0.02, 8, GOLD_D, [sx * 0.27, 0.87, -1.5]);
}

// curved gable roof
const halfRoof: [number, number][] = [
  [0.6, 0.14],
  [0.36, 0.29],
  [0.16, 0.46],
];
const roofO: OutlinePoint[] = [
  [0.98, 0.08, "sharp"],
  ...halfRoof,
  [0, 0.56],
  ...halfRoof
    .slice()
    .reverse()
    .map(([x, y]) => [-x, y] as OutlinePoint),
  [-0.98, 0.08, "sharp"],
  [-0.92, 0, "sharp"],
  [0.92, 0, "sharp"],
];
b.extrude(roofO, { at: [0, 1.5, -1.25], x: [1, 0, 0], y: [0, 1, 0], thickness: 1.9, bevel: 0.012, color: ROOF, bone: base });
cyl(0.055, 0.055, 1.96, 6, TILE, [0, 2.07, -1.25], { dir: [0, 0, 1] });
for (const sz of [1, -1]) {
  cone(0.06, 0.2, 6, GOLD, [0, 2.1, -1.25 + sz * 1.0], { dir: [0, 0.35, sz] });
}
cyl(0.1, 0.1, 0.02, 14, GOLD, [0, 1.74, -0.29], { dir: [0, 0, 1] });
cyl(0.05, 0.05, 0.025, 10, RED, [0, 1.74, -0.285], { dir: [0, 0, 1] });
for (const sx of [1, -1]) ball(0.03, GOLD, [sx * 0.95, 1.58, -0.32]);

// bell + rope
ball(0.07, GOLD, [0, 1.19, -0.45], { bone: bell });
box(0.085, 0.008, 0.006, INKC, [0, 1.15, -0.384], { bone: bell });
b.rod([0, 1.37, -0.45], [0, 1.26, -0.45], 0.008, GOLD_D, { bone: bell, sides: 5 });
b.rod([0, 1.12, -0.45], [0, 0.8, -0.45], 0.018, ROPE_RW, { bone: bell, sides: 6 });
cone(0.035, 0.1, 6, RED, [0, 0.76, -0.45], { bone: bell, rotation: [180, 0, 0] });

// shimenawa on the lintel
b.sweep(
  catmull([
    [-0.62, 1.44, -0.69],
    [-0.3, 1.39, -0.7],
    [0, 1.38, -0.7],
    [0.3, 1.39, -0.7],
    [0.62, 1.44, -0.69],
  ]),
  0.022,
  { color: STRAW, ...TUBE },
);

// paper lanterns under the eaves
function lantern(j: typeof lanternL, x: number, y: number, z: number) {
  const outline: OutlinePoint[] = [
    [0, -0.2],
    [0.1, -0.2],
    [0.17, -0.12],
    [0.2, 0],
    [0.17, 0.12],
    [0.1, 0.2],
    [0, 0.2],
  ];
  const body = b.lathe(outline, { at: [x, y, z], segments: 10, color: LANT, bone: j });
  glow(body, 1.1);
  for (const [dy, r] of [
    [0, 0.206],
    [0.12, 0.176],
    [-0.12, 0.176],
  ] as [number, number][])
    cyl(r, r, 0.012, 10, INKC, [x, y + dy, z], { bone: j });
  cyl(0.1, 0.1, 0.04, 10, INKC, [x, y + 0.22, z], { bone: j });
  cyl(0.1, 0.1, 0.04, 10, INKC, [x, y - 0.22, z], { bone: j });
  b.rod([x, 1.5, z], [x, y + 0.24, z], 0.008, INKC, { bone: j, sides: 4 });
  ball(0.022, GOLD, [x, y - 0.27, z], { bone: j });
  b.rod([x, y - 0.28, z], [x, y - 0.44, z], 0.007, RED, { bone: j, sides: 4 });
  ball(0.02, GOLD, [x, y - 0.46, z], { bone: j });
  glow(b.decal(body, EMBLEM, { at: [x, y, z + 0.2], dir: [0, 0, 1], size: [0.2, 0.2], segments: 8, bone: j }), 1.1);
  glow(b.decal(body, EMBLEM, { at: [x, y, z - 0.2], dir: [0, 0, -1], size: [0.2, 0.2], segments: 8, bone: j }), 1.1);
}
lantern(lanternL, 0.9, 1.22, -0.45);
lantern(lanternR, -0.9, 1.22, -0.45);

// ------------------------------------------------------------------ torii
const TZ = 2.0;
for (const sx of [1, -1]) {
  cyl(0.17, 0.2, 0.12, 8, STONE, [sx * 1.05, 0.26, TZ]);
  cyl(0.125, 0.13, 0.3, 10, LAC, [sx * 1.05, 0.47, TZ]);
  cyl(0.095, 0.11, 2.0, 10, RED, [sx * 1.05, 1.62, TZ]);
  cyl(0.118, 0.118, 0.03, 10, GOLD, [sx * 1.05, 2.45, TZ]);
  box(0.02, 0.14, 0.14, GOLD, [sx * 1.4, 2.15, TZ]);
}
box(2.8, 0.11, 0.12, RED, [0, 2.15, TZ]);

const kasagiTop = (x: number) => 0.1 + 0.14 * Math.pow(Math.abs(x) / 1.6, 2.4);
function beam(half: number, n: number, top: (x: number) => number, lo: (x: number) => number): OutlinePoint[] {
  const xs = Array.from({ length: n + 1 }, (_, i) => -half + (2 * half * i) / n);
  const o: OutlinePoint[] = [];
  xs.forEach((x, i) => o.push(i === 0 || i === n ? [x, top(x), "sharp"] : [x, top(x)]));
  [...xs].reverse().forEach((x, i) => o.push(i === 0 || i === n ? [x, lo(x), "sharp"] : [x, lo(x)]));
  return o;
}
b.extrude(beam(1.6, 12, (x) => kasagiTop(x) + 0.045, (x) => kasagiTop(x) - 0.06), {
  at: [0, 2.55, TZ],
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: 0.3,
  bevel: 0.01,
  color: LAC,
  bone: base,
});
b.extrude(beam(1.5, 12, (x) => kasagiTop(x) - 0.03, (x) => kasagiTop(x) - 0.17), {
  at: [0, 2.55, TZ],
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: 0.2,
  bevel: 0.008,
  color: RED,
  bone: base,
});
box(0.1, 0.3, 0.12, RED, [0, 2.35, TZ]);
box(0.34, 0.26, 0.03, "#ffffff", [0, 2.34, TZ + 0.075], { texture: PLAQUE });

// shimenawa with shide
const ropePath = catmull([
  [-1.0, 2.07, TZ],
  [-0.55, 1.97, TZ],
  [0, 1.93, TZ],
  [0.55, 1.97, TZ],
  [1.0, 2.07, TZ],
]);
b.sweep(ropePath, (t) => 0.03 + 0.03 * Math.sin(Math.PI * t), { color: STRAW, ...TUBE, sides: 7 });
for (const sx of [1, -1]) cone(0.05, 0.2, 7, STRAW, [sx * 0.93, 1.93, TZ], { rotation: [180, 0, 0] });
const shideFrames = [0.14, 0.28, 0.42, 0.58, 0.72, 0.86].map((t) => {
  const p = ropePath.at(t);
  return frame([p.x, p.y - 0.04, p.z + 0.02], [0, 1, 0]);
});
b.cards(shideFrames, SHIDE, { size: [0.11, 0.3], lean: 180, flow: [0, 0, 1], vary: 0.12, rng: R });

// ------------------------------------------------------------------ stone lanterns
function toro(x: number, z: number) {
  cyl(0.21, 0.24, 0.1, 6, STONE, [x, 0.25, z]);
  cyl(0.07, 0.08, 0.52, 6, STONE, [x, 0.56, z]);
  cyl(0.2, 0.14, 0.08, 6, STONE, [x, 0.86, z]);
  box(0.27, 0.24, 0.27, STONE, [x, 1.02, z]);
  glow(box(0.17, 0.15, 0.31, FLAME, [x, 1.03, z]), 1.2);
  glow(box(0.31, 0.15, 0.17, FLAME, [x, 1.03, z]), 1.2);
  box(0.014, 0.16, 0.325, INKC, [x, 1.03, z]);
  box(0.325, 0.16, 0.014, INKC, [x, 1.03, z]);
  b.lathe(
    [
      [0, 0],
      [0.38, 0],
      [0.42, 0.045],
      [0.3, 0.085],
      [0.12, 0.19],
      [0.06, 0.23],
      [0, 0.25],
    ],
    { at: [x, 1.14, z], segments: 6, color: STONE, bone: base },
  );
  ball(0.05, STONE, [x, 1.43, z]);
  cone(0.03, 0.09, 6, STONE, [x, 1.5, z]);
}
toro(1.0, 0.7);
toro(-1.0, 0.7);

// ------------------------------------------------------------------ kitsune guardians
function fox(ox: number, oz: number, s: number) {
  const oy = 0.6;
  const yaw = -s * 20 * DEG;
  const Yax = new THREE.Vector3(0, 1, 0);
  const L = (x: number, y: number, z: number): V => {
    const v = new THREE.Vector3(x, y, z).applyAxisAngle(Yax, yaw);
    return [ox + v.x, oy + v.y, oz + v.z];
  };
  const D = (x: number, y: number, z: number): V => {
    const v = new THREE.Vector3(x, y, z).applyAxisAngle(Yax, yaw);
    return [v.x, v.y, v.z];
  };
  const rot: V = [0, yaw / DEG, 0];
  const sph = (c: Col, at: V, sc: V) => P(new THREE.SphereGeometry(1, 8, 6), c, at, { scale: sc, rotation: rot });

  box(0.56, 0.35, 0.6, STONE, [ox, 0.375, oz]);
  box(0.62, 0.05, 0.66, STONE_L, [ox, 0.575, oz]);

  for (const t of [1, -1]) {
    sph(FOXW, L(t * 0.1, 0.14, -0.1), [0.07, 0.14, 0.16]);
    b.rod(L(t * 0.065, 0.33, 0.07), L(t * 0.065, 0.03, 0.14), 0.032, FOXW, TUBE);
    box(0.075, 0.04, 0.11, FOXW, L(t * 0.065, 0.02, 0.17), { rotation: rot });
    box(0.08, 0.04, 0.15, FOXW, L(t * 0.12, 0.02, 0.0), { rotation: rot });
    cone(0.05, 0.17, 4, FOXW, L(t * 0.065, 0.69, 0.06), { dir: D(t * 0.3, 1, -0.2) });
    cone(0.03, 0.11, 4, EAR_IN, L(t * 0.065, 0.68, 0.085), { dir: D(t * 0.3, 1, -0.2) });
    cone(0.03, 0.09, 5, FOXW, L(t * 0.1, 0.54, 0.1), { dir: D(t * 1, -0.35, -0.15) });
    box(0.04, 0.012, 0.01, INKC, L(t * 0.05, 0.6, 0.19), { rotation: [0, yaw / DEG, t * -18] });
    box(0.045, 0.008, 0.008, RED, L(t * 0.052, 0.612, 0.19), { rotation: [0, yaw / DEG, t * -18] });
  }
  b.capsule(L(0, 0.2, -0.08), L(0, 0.45, 0.07), [0.12, 0.085], FOXW, TUBE);
  sph(FOXW, L(0, 0.58, 0.1), [0.1, 0.09, 0.095]);
  P(new THREE.CylinderGeometry(0.025, 0.055, 0.15, 6), FOXW, L(0, 0.55, 0.2), { dir: D(0, -0.12, 1) });
  ball(0.022, INKC, L(0, 0.535, 0.275));

  const collar: V[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    collar.push(L(0.11 * Math.cos(a), 0.43 - 0.04 * Math.max(0, Math.sin(a)), 0.07 + 0.11 * Math.sin(a)));
  }
  b.sweep(catmull(collar, { closed: true }), 0.028, RED, TUBE);
  box(0.1, 0.1, 0.016, RED, L(0, 0.35, 0.15), { rotation: rot });
  ball(0.028, GOLD, L(0, 0.3, 0.165));

  b.sweep(
    catmull([L(0, 0.1, -0.2), L(0, 0.08, -0.38), L(0, 0.22, -0.52), L(0, 0.45, -0.5), L(0, 0.62, -0.38)]),
    [0.05, 0.085, 0.1, 0.07, 0.02],
    { color: FOXW, ...TUBE, sides: 7 },
  );
}
fox(2.0, -0.45, 1);
fox(-2.0, -0.45, -1);

// ------------------------------------------------------------------ saisen box (offering chest)
box(0.9, 0.5, 0.45, WOOD_V, [0, 0.45, 0.55]);
box(0.84, 0.01, 0.41, LAC, [0, 0.705, 0.55]);
for (const sz of [1, -1]) box(0.92, 0.05, 0.04, RED, [0, 0.725, 0.55 + sz * 0.205]);
for (const sx of [1, -1]) box(0.04, 0.05, 0.45, RED, [sx * 0.44, 0.725, 0.55]);
for (let i = -2; i <= 2; i++) box(0.86, 0.025, 0.045, WOOD_H, [0, 0.72, 0.55 + i * 0.075]);
for (const sx of [1, -1])
  for (const sz of [1, -1]) box(0.05, 0.52, 0.05, RED, [sx * 0.44, 0.46, 0.55 + sz * 0.205]);
box(0.4, 0.4, 0.01, "#ffffff", [0, 0.45, 0.776], { texture: COIN });
for (const [cx, cz] of [
  [-0.2, 0.5],
  [0.12, 0.62],
  [0.25, 0.45],
] as number[][])
  cyl(0.03, 0.03, 0.006, 8, GOLD, [cx, 0.737, cz], { rotation: [0, R() * 90, 4] });

// ------------------------------------------------------------------ offerings on the side strips (platform top y = 0.38)
// sake barrel
cyl(0.19, 0.19, 0.34, 12, STRAW, [1.3, 0.55, -0.7]);
for (const dy of [-0.11, 0.11]) cyl(0.196, 0.196, 0.022, 12, RED, [1.3, 0.55 + dy, -0.7]);
cyl(0.17, 0.17, 0.03, 12, WOOD_H, [1.3, 0.735, -0.7]);
box(0.13, 0.18, 0.012, CREAM, [1.3, 0.56, -0.51]);
box(0.13, 0.04, 0.014, RED, [1.3, 0.62, -0.5075]);
box(0.03, 0.1, 0.014, INKC, [1.3, 0.54, -0.5075]);
// sake tray
box(0.46, 0.03, 0.3, LAC, [1.28, 0.395, -1.3]);
const bottleO: OutlinePoint[] = [
  [0, 0],
  [0.055, 0],
  [0.065, 0.04],
  [0.058, 0.1],
  [0.028, 0.14],
  [0.024, 0.19],
  [0.034, 0.2],
  [0, 0.2],
];
for (const bx of [1.14, 1.3]) {
  b.lathe(bottleO, { at: [bx, 0.41, -1.3], segments: 8, color: CERAMIC, bone: base });
  cyl(0.066, 0.066, 0.035, 8, BLUE, [bx, 0.455, -1.3]);
}
for (const cx of [1.42, 1.46]) cyl(0.032, 0.022, 0.035, 8, CERAMIC, [cx, 0.43, cx === 1.42 ? -1.38 : -1.24]);
// incense burner
cyl(0.1, 0.07, 0.1, 10, BRONZE, [1.3, 0.48, -1.85]);
cyl(0.108, 0.108, 0.02, 10, GOLD_D, [1.3, 0.54, -1.85]);
cyl(0.08, 0.08, 0.012, 10, ASH, [1.3, 0.548, -1.85]);
for (let k = 0; k < 3; k++) {
  const a = (k / 3) * Math.PI * 2;
  cyl(0.015, 0.015, 0.06, 5, BRONZE, [1.3 + Math.cos(a) * 0.06, 0.41, -1.85 + Math.sin(a) * 0.06]);
}
for (let k = 0; k < 5; k++) {
  const a = (k / 5) * Math.PI * 2;
  const ix = 1.3 + Math.cos(a) * 0.035;
  const iz = -1.85 + Math.sin(a) * 0.035;
  b.rod([ix, 0.55, iz], [ix + Math.cos(a) * 0.015, 0.74, iz + Math.sin(a) * 0.015], 0.004, RED, { bone: base, sides: 4 });
  glow(ball(0.007, FLAME, [ix + Math.cos(a) * 0.015, 0.74, iz + Math.sin(a) * 0.015]), 1.5);
}
// kagami mochi on a sanbo
box(0.18, 0.1, 0.18, LAC, [-1.3, 0.43, -0.7]);
box(0.34, 0.025, 0.34, WOOD_H, [-1.3, 0.4925, -0.7]);
box(0.3, 0.004, 0.3, WHITE, [-1.3, 0.507, -0.7], { rotation: [0, 45, 0] });
cyl(0.12, 0.13, 0.06, 10, WHITE, [-1.3, 0.54, -0.7]);
cyl(0.085, 0.095, 0.05, 10, WHITE, [-1.3, 0.595, -0.7]);
ball(0.045, ORANGE, [-1.3, 0.66, -0.7]);
cone(0.03, 0.06, 4, LEAFG, [-1.3, 0.715, -0.7], { rotation: [0, 0, 20] });
// dango plate
cyl(0.13, 0.11, 0.02, 12, CERAMIC, [-1.3, 0.39, -1.3]);
cyl(0.13, 0.13, 0.008, 12, BLUE, [-1.3, 0.4, -1.3]);
for (let k = 0; k < 3; k++) {
  const sx = -1.3 + (k - 1) * 0.07;
  b.rod([sx, 0.4, -1.3 + (k - 1) * 0.02], [sx + (k - 1) * 0.03, 0.66, -1.3], 0.005, "#d6b982", { bone: base, sides: 4 });
  [PINK, WHITE, GREEN_D].forEach((c, i) =>
    ball(0.03, c, [sx + (k - 1) * 0.03 * (0.4 + i * 0.3), 0.5 + i * 0.065, -1.3 + (k - 1) * 0.01]),
  );
}
// sunsettia basket
cyl(0.14, 0.11, 0.1, 10, STRAW, [-1.3, 0.43, -1.85]);
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2;
  ball(0.05, ORANGE, [-1.3 + Math.cos(a) * 0.07, 0.52, -1.85 + Math.sin(a) * 0.07]);
}
ball(0.05, ORANGE, [-1.3, 0.57, -1.85]);
cone(0.03, 0.06, 4, LEAFG, [-1.3, 0.63, -1.85]);

// sakaki vases flanking the steps
function sakaki(x: number, z: number) {
  cyl(0.06, 0.045, 0.22, 8, CERAMIC, [x, 0.31, z]);
  cyl(0.062, 0.062, 0.03, 8, BLUE, [x, 0.36, z]);
  const leaves: ReturnType<typeof frame>[] = [];
  for (const [dx, h, dz] of [
    [-0.12, 0.55, -0.05],
    [0.1, 0.65, 0.06],
    [0.0, 0.75, -0.1],
  ] as number[][]) {
    const path = catmull([
      [x, 0.4, z],
      [x + dx * 0.4, 0.4 + h * 0.5, z + dz * 0.4],
      [x + dx, 0.4 + h, z + dz],
    ]);
    b.sweep(path, 0.01, BARK_D, { bone: base, sides: 5, smooth: false });
    for (let i = 1; i <= 6; i++) {
      const p = path.at(i / 6);
      const a = i * 2.4 + dx * 10;
      leaves.push(frame([p.x, p.y, p.z], [Math.cos(a), 0.6, Math.sin(a)]));
    }
  }
  b.cards(leaves, LEAF_T, {
    size: [0.07, 0.13],
    lean: 55,
    bend: 20,
    flow: (_f, i) => [Math.cos(i * 1.7), -0.2, Math.sin(i * 1.7)],
    vary: 0.25,
    rng: R,
  });
}
sakaki(0.8, 0.05);
sakaki(-0.8, 0.05);

// ------------------------------------------------------------------ ema rack
{
  const rx = 1.9;
  const rz = 1.2;
  for (const sx of [1, -1]) box(0.07, 0.9, 0.07, WOOD_V, [rx + sx * 0.38, 0.65, rz]);
  box(0.86, 0.05, 0.07, WOOD_H, [rx, 1.03, rz]);
  b.extrude(
    [
      [-0.5, 0],
      [0.5, 0],
      [0.0, 0.2],
    ],
    { at: [rx, 1.06, rz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.34, bevel: 0.008, color: TILE, bone: base },
  );
  const texs = [EMA_FOX, EMA_BOLT, BLOSSOM];
  for (let i = 0; i < 6; i++) {
    const px = rx - 0.3 + i * 0.12;
    const py = 0.8 + R() * 0.03;
    b.rod([px, 1.03, rz + 0.01], [px, py + 0.13, rz + 0.01], 0.004, INKC, { bone: base, sides: 4 });
    b.extrude(
      [
        [-0.05, 0],
        [0.05, 0],
        [0.05, 0.1],
        [0, 0.135],
        [-0.05, 0.1],
      ],
      { at: [px, py, rz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, color: WOOD_V, bone: base },
    );
    P(new THREE.PlaneGeometry(0.085, 0.085), "#ffffff", [px, py + 0.055, rz + 0.0085], {
      dir: [0, 0, 1],
      axis: "z",
      texture: texs[i % 3],
    });
  }
}

// ------------------------------------------------------------------ jizo statue by the road
{
  const jx = -1.8;
  const jz = 1.9;
  box(0.3, 0.12, 0.3, STONE, [jx, 0.26, jz]);
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.13, 0.14],
      [0.09, 0.26],
      [0.07, 0.32],
      [0, 0.32],
    ],
    { at: [jx, 0.32, jz], segments: 8, color: STONE_L, bone: base },
  );
  ball(0.075, STONE_L, [jx, 0.71, jz]);
  cone(0.1, 0.07, 8, RED, [jx, 0.78, jz]);
  cyl(0.085, 0.09, 0.035, 8, RED, [jx, 0.65, jz]);
  box(0.1, 0.12, 0.014, RED, [jx, 0.55, jz + 0.12]);
  ball(0.04, ORANGE, [jx + 0.12, 0.345, jz + 0.12]);
}

// ------------------------------------------------------------------ Electro crystals
function crystal(x: number, z: number, s: number, t1: number, t2: number, c: string) {
  glow(
    P(new THREE.OctahedronGeometry(0.13, 0), c, [x, 0.2 + 0.13 * s - 0.01, z], {
      scale: [0.7, s, 0.7],
      rotation: [t1, R() * 90, t2],
    }),
    1.3,
  );
}
crystal(-2.3, 0.5, 2.3, 8, -10, ELEC);
crystal(-2.45, 0.7, 1.5, -12, 14, ELEC2);
crystal(-2.15, 0.7, 1.1, 10, 6, ELEC);
crystal(2.2, -1.5, 2.0, -6, 12, ELEC);
crystal(2.4, -1.35, 1.2, 12, -8, ELEC2);
for (const [fx, fy, fz, fs] of [
  [-0.5, 1.1, 1.0, 1.4],
  [0.55, 1.45, 1.6, 1.1],
  [0.1, 1.8, 1.2, 0.9],
  [-0.4, 1.55, 1.9, 1.0],
] as number[][])
  glow(
    P(new THREE.OctahedronGeometry(0.045, 0), ELEC, [fx, fy, fz], { scale: [0.7, fs, 0.7], rotation: [R() * 30, R() * 90, R() * 30] }),
    1.5,
  );

// ------------------------------------------------------------------ sakura tree
b.sweep(
  catmull([
    [-2.1, 0.15, -2.0],
    [-2.15, 0.9, -1.95],
    [-1.9, 1.7, -1.8],
    [-1.5, 2.5, -1.55],
    [-1.1, 3.0, -1.3],
  ]),
  [0.22, 0.16, 0.11, 0.07, 0.04],
  { color: BARK, bone: base, sides: 7, smooth: false },
);
b.sweep(
  catmull([
    [-1.95, 1.6, -1.85],
    [-2.3, 2.1, -1.9],
    [-2.7, 2.5, -1.8],
  ]),
  [0.07, 0.03],
  { color: BARK, ...TUBE, sides: 5 },
);
b.sweep(
  catmull([
    [-1.6, 2.3, -1.6],
    [-1.0, 2.7, -1.9],
    [-0.4, 2.95, -1.8],
  ]),
  [0.06, 0.025],
  { color: BARK, ...TUBE, sides: 5 },
);
const canopy: ReturnType<typeof P>[] = [];
for (const [cx, cy, cz, cr] of [
  [-1.2, 3.25, -1.3, 0.62],
  [-0.55, 3.05, -1.75, 0.5],
  [-2.3, 2.85, -1.75, 0.55],
  [-1.7, 3.55, -1.9, 0.5],
  [-0.2, 2.95, -1.5, 0.42],
  [-2.7, 2.6, -1.8, 0.4],
  [-1.9, 3.1, -1.4, 0.5],
  [-0.9, 3.7, -1.6, 0.4],
  [-1.5, 2.8, -2.1, 0.42],
  [-0.5, 2.7, -1.0, 0.32],
] as number[][])
  canopy.push(
    P(new THREE.IcosahedronGeometry(cr, 1), SAKURA, [cx, cy, cz], {
      rotation: [R() * 90, R() * 90, 0],
      scale: [1, 0.82, 1],
    }),
  );
const blossoms = b.surface(canopy).scatter(70, { rng: rng(21), minDist: 0.14, filter: (h) => h.n.y > -0.2 });
b.cards(blossoms, BLOSSOM, {
  size: 0.13,
  lean: 60,
  vary: 0.3,
  rng: rng(22),
  flow: (_f, i) => [Math.cos(i * 2.4), -0.3, Math.sin(i * 2.4)],
});

// drifting petals
const air: ReturnType<typeof frame>[] = [];
for (let i = 0; i < 16; i++)
  air.push(frame([-1.5 + R() * 3.4, 0.5 + R() * 2.4, -1.5 + R() * 3.6], [R() - 0.5, 1, R() - 0.5]));
b.cards(air, PETAL, {
  size: 0.07,
  lean: 60,
  spin: 180,
  vary: 0.3,
  rng: rng(23),
  flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
});

// petals on the ground and grass tufts
const fallen = b
  .surface(ground)
  .scatter(45, { rng: rng(41), minDist: 0.2, filter: (h) => h.n.y > 0.8 && !blocked(h.at.x, h.at.z) });
b.cards(fallen, PETAL, {
  size: 0.06,
  lean: 90,
  vary: 0.3,
  rng: rng(42),
  flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
});
const tufts = b
  .surface(ground)
  .scatter(90, { rng: rng(31), minDist: 0.25, filter: (h) => h.n.y > 0.8 && !blocked(h.at.x, h.at.z) });
b.cards(tufts, GRASS_T, { size: [0.2, 0.2], lean: 0, cross: true, vary: 0.3, spin: 180, sink: 0.2, rng: rng(32) });

// meadow flowers: daisies and glowing glaze lilies
const DAISY = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 60 Q22 40 20 24" stroke="#4f9a46" stroke-width="3" fill="none"/>
    <path d="M20 44 Q30 40 33 32 Q24 36 20 44Z" fill="#5fae4f"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315]
      .map(
        (a) =>
          `<ellipse cx="20" cy="12" rx="3.6" ry="8" fill="#fffaf0" stroke="#e8dcc0" stroke-width="0.8" transform="rotate(${a} 20 20)"/>`,
      )
      .join("")}
    <circle cx="20" cy="20" r="5" fill="#ffc83a" stroke="#d89a1c" stroke-width="1.2"/>
  </svg>`,
  { size: 128 },
);
const LILY = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 60 Q18 42 20 28" stroke="#3f8f8a" stroke-width="3" fill="none"/>
    <path d="M20 30 C8 26 4 12 8 4 C16 8 20 18 20 30Z" fill="#9fe3ff" stroke="#4fa8e0" stroke-width="1.6"/>
    <path d="M20 30 C32 26 36 12 32 4 C24 8 20 18 20 30Z" fill="#9fe3ff" stroke="#4fa8e0" stroke-width="1.6"/>
    <path d="M20 30 C12 22 14 8 20 2 C26 8 28 22 20 30Z" fill="#e6f8ff" stroke="#6cc0ee" stroke-width="1.6"/>
    <circle cx="20" cy="24" r="3" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const bloomSpots = b
  .surface(ground)
  .scatter(70, { rng: rng(51), minDist: 0.3, filter: (h) => h.n.y > 0.8 && !blocked(h.at.x, h.at.z) });
b.cards(bloomSpots.slice(0, 40), DAISY, { size: [0.11, 0.17], lean: 0, cross: true, vary: 0.3, spin: 180, sink: 0.2, rng: rng(52) });
glow(
  b.cards(bloomSpots.slice(40), LILY, { size: [0.12, 0.18], lean: 0, cross: true, vary: 0.3, spin: 180, sink: 0.2, rng: rng(53) }),
  0.9,
);

// ------------------------------------------------------------------ rest pose: doors ajar
b.pose(doorL, { axis: [0, 1, 0], deg: 45 });
b.pose(doorR, { axis: [0, 1, 0], deg: -45 });

export default function build() {
  return b.root;
}
