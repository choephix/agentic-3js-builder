import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { frame } from "../../../../src/frame";
import { catmull } from "../../../../src/path";
import { grain, mottle, scales, paint, noise, gradient } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: gnarled bark body, mossy shoulders, huge root-fingered hands, a crowned canopy of leaf cards, glowing amber eyes and rune-lit chest, painted hand-crafted Warcraft style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const BARK_D = "#3a2414";
const BARK = "#5a3a20";
const BARK_L = "#8a5e34";
const BARK_HI = "#b98a52";
const MOSS = "#4f8a2c";
const MOSS_D = "#2f5a1c";
const MOSS_L = "#8cc347";
const LEAF_G = "#5fae2a";
const AMBER = "#ffb21e";
const AMBER_HOT = "#fff0a0";
const RUNE = "#7dff9a";
const IRON = "#6d6a66";
const IRON_D = "#3f3d3b";
const GOLD = "#d9a63a";
const BONE = "#e8dcc0";
const SOIL = "#2a1a0e";
const STONE = "#7b7a72";
const STONE_D = "#4a4a44";
const FLOWER = "#e8556b";
const FLOWER2 = "#f2d34a";

// ---------------------------------------------------------------- textures
const leafA = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 94 C6 70 4 34 32 2 C60 34 58 70 32 94Z" fill="#4f9a22" stroke="#2c5a14" stroke-width="3"/>
  <path d="M32 94 C14 66 14 36 32 2 C32 34 34 66 32 94Z" fill="#7cc83a"/>
  <path d="M32 92 L32 8" stroke="#2c5a14" stroke-width="3"/>
  <path d="M32 70 L16 54 M32 54 L48 38 M32 40 L18 28 M32 62 L48 48" stroke="#2c5a14" stroke-width="2.5" fill="none"/>
  </svg>`,
  { size: 128 },
);
const leafB = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 94 C2 76 6 30 32 4 C58 30 62 76 32 94Z" fill="#c9852a" stroke="#6e3a10" stroke-width="3"/>
  <path d="M32 94 C14 70 16 36 32 4 C32 36 34 70 32 94Z" fill="#f0b648"/>
  <path d="M32 92 L32 8" stroke="#6e3a10" stroke-width="3"/>
  <path d="M32 66 L16 50 M32 48 L48 34 M32 74 L48 58" stroke="#6e3a10" stroke-width="2.5" fill="none"/>
  </svg>`,
  { size: 128 },
);
const leafC = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 94 C10 72 4 40 32 2 C60 40 54 72 32 94Z" fill="#3f8a2a" stroke="#1f4a14" stroke-width="3"/>
  <path d="M32 94 C20 66 20 34 32 2 C36 36 36 66 32 94Z" fill="#6bbd3c"/>
  <path d="M32 92 L32 8" stroke="#1f4a14" stroke-width="3"/>
  <path d="M32 60 L14 44 M32 44 L50 30 M32 76 L50 62" stroke="#1f4a14" stroke-width="2.5" fill="none"/>
  </svg>`,
  { size: 128 },
);
const mossTuft = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 62 C4 36 12 14 18 4 C20 24 24 40 24 62Z" fill="#3a7a22" stroke="#244a14" stroke-width="2.5"/>
  <path d="M20 62 C22 30 30 14 34 2 C38 22 40 42 38 62Z" fill="#6fb53a" stroke="#244a14" stroke-width="2.5"/>
  <path d="M32 62 C34 40 40 26 46 18 C46 36 46 50 44 62Z" fill="#8cc347" stroke="#244a14" stroke-width="2.5"/>
  </svg>`,
  { size: 128 },
);
const vineTex = svg(
  `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2 C6 22 26 40 16 60 C8 74 20 84 16 94" stroke="#3a6a1c" stroke-width="4" fill="none"/>
  <ellipse cx="9" cy="24" rx="7" ry="4" fill="#5fae2a" stroke="#2c5a14" stroke-width="1.5"/>
  <ellipse cx="23" cy="44" rx="7" ry="4" fill="#6bbd3c" stroke="#2c5a14" stroke-width="1.5"/>
  <ellipse cx="9" cy="66" rx="7" ry="4" fill="#5fae2a" stroke="#2c5a14" stroke-width="1.5"/>
  <ellipse cx="21" cy="84" rx="6" ry="3.5" fill="#6bbd3c" stroke="#2c5a14" stroke-width="1.5"/>
  </svg>`,
  { size: 128 },
);
const runeTex = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" fill="none" stroke="#7dff9a" stroke-width="4"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#3fcf7a" stroke-width="2.5"/>
  <path d="M32 12 L32 52 M20 24 L32 34 L44 24 M22 44 L32 36 L42 44 M32 20 L24 14 M32 20 L40 14" stroke="#c8ffd8" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const eyeTex = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 28 C14 4 46 2 62 14 C50 38 18 42 2 28Z" fill="#ffb21e" stroke="#ffe27a" stroke-width="2"/>
  <ellipse cx="34" cy="22" rx="8" ry="11" fill="#fff6b0"/>
  <ellipse cx="34" cy="22" rx="3" ry="8" fill="#a34a00"/>
  </svg>`,
  { size: 128 },
);
const runeBand = svg(
  `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="128" height="32" fill="#2a2018"/>
  <g stroke="#d9a63a" stroke-width="3" fill="none" stroke-linecap="round">
  <path d="M8 6 L8 26 M4 12 L12 18"/><path d="M26 6 L38 6 L26 26 L38 26"/><path d="M52 6 L46 16 L58 16 M52 16 L52 26"/>
  <path d="M70 26 L70 6 L80 16 L90 6 L90 26"/><path d="M104 6 L104 26 M100 10 L108 10 M100 22 L108 22"/><path d="M118 6 L122 16 L118 26"/>
  </g>
  <rect x="0" y="0" width="128" height="3" fill="#d9a63a"/><rect x="0" y="29" width="128" height="3" fill="#d9a63a"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- paints
const BARK_PAINT = paint((p, n, s) => {
  const base = grain(BARK, BARK_D, { size: 0.045, axis: "y", seed: 3 }).at(p, n, s);
  const m = noise(p, 0.18, 7);
  const hi = n.y > 0.35 && m > 0.45;
  const c = scales(BARK, BARK_D, { size: 0.16, width: 0.18, seed: 5 }).at(p, n, s);
  const mixed: [number, number, number] = [
    base[0] * 0.55 + c[0] * 0.45,
    base[1] * 0.55 + c[1] * 0.45,
    base[2] * 0.55 + c[2] * 0.45,
  ];
  if (hi) return [Math.min(1, mixed[0] * 1.18), Math.min(1, mixed[1] * 1.15), Math.min(1, mixed[2] * 1.1)];
  if (n.y < -0.35) return [mixed[0] * 0.7, mixed[1] * 0.7, mixed[2] * 0.72];
  return mixed;
});
const BARK_LIGHT = paint((p, n, s) => {
  const g = grain(BARK_L, BARK, { size: 0.035, axis: "y", seed: 11 }).at(p, n, s);
  const m = noise(p, 0.12, 2);
  return m > 0.62 ? [Math.min(1, g[0] * 1.15), Math.min(1, g[1] * 1.12), Math.min(1, g[2] * 1.05)] : g;
});
const MOSS_PAINT = mottle(MOSS, MOSS_L, { size: 0.09, contrast: 0.9, seed: 4 });
const MOSS_DARK = mottle(MOSS_D, MOSS, { size: 0.07, contrast: 0.8, seed: 9 });
const IRON_PAINT = mottle(IRON, IRON_D, { size: 0.03, contrast: 0.7, seed: 6 });
const STONE_PAINT = scales(STONE, STONE_D, { size: 0.12, width: 0.14, seed: 8 });
const SOIL_PAINT = mottle(SOIL, "#4a2e18", { size: 0.08, contrast: 0.9, seed: 12 });

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "ancientTreant", detail: 1, paintSize: 2048 });
  const R = rng(1337);

  // ------------------------------------------------------------ key dimensions (meters, ~5.6 m tall)
  const HIP_Y = 2.35;
  const CHEST_Y = 3.35;
  const HEAD_Y = 4.2;

  // ------------------------------------------------------------ base: gnarled root feet & earth
  // root-legs: two thick columns, each flaring into splayed roots
  const legBodies: THREE.Mesh[] = [];
  for (const s of [1, -1]) {
    const leg = b.sweep(
      catmull([
        [s * 0.62, 0.0, 0.1],
        [s * 0.6, 0.7, 0.02],
        [s * 0.55, 1.5, -0.04],
        [s * 0.5, HIP_Y, 0.0],
      ]),
      [0.52, 0.36, 0.44],
      { color: BARK_PAINT, sides: 8, caps: "flat" },
    );
    legBodies.push(...leg.meshes);
    // knee knot
    b.part(new THREE.IcosahedronGeometry(0.34, 0), BARK_PAINT, { at: [s * 0.6, 1.15, 0.28], scale: [1, 0.9, 0.8] });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), BARK_LIGHT, { at: [s * 0.62, 1.2, 0.5], scale: [1, 0.9, 0.8] });
    // splayed root toes (front and sides)
    const toeDirs: Array<[number, number, number]> = [
      [s * 0.35, -0.05, 1.0],
      [s * 1.0, -0.05, 0.55],
      [s * -0.15, -0.05, 0.9],
      [s * 0.9, -0.05, -0.35],
      [s * 0.1, -0.05, -1.0],
    ];
    toeDirs.forEach((d, i) => {
      const len = 0.85 + (i % 2) * 0.3;
      const base: [number, number, number] = [s * 0.62, 0.22, 0.05];
      const mid: [number, number, number] = [base[0] + d[0] * len * 0.5, 0.2, base[2] + d[2] * len * 0.5];
      const tip: [number, number, number] = [base[0] + d[0] * len, 0.02, base[2] + d[2] * len];
      b.sweep(catmull([base, mid, tip]), [0.2, 0.045], { color: BARK_PAINT, sides: 6, caps: { start: "none", end: "round" } });
      // claw-tip gnarl
      b.spike(tip, [d[0], -0.05, d[2]], 0.18, 0.05, BARK_HI, { sides: 5 });
    });
    // ankle fringe of moss
    b.part(new THREE.IcosahedronGeometry(0.42, 1), MOSS_PAINT, { at: [s * 0.62, 0.35, 0.1], scale: [1.2, 0.5, 1.2] });
  }

  // earth clod under feet (small ground patch so roots read as growing)
  b.lathe(
    [
      [0, 0],
      [1.9, 0],
      [2.0, 0.05],
      [1.85, 0.14],
      [1.2, 0.18],
      [0, 0.2],
    ],
    { at: [0, -0.02, 0], segments: 14, color: SOIL_PAINT, smoothing: 1 },
  );
  // pebbles & grass tufts on soil
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.1 + R() * 0.75;
    b.part(new THREE.DodecahedronGeometry(0.06 + R() * 0.07, 0), R() > 0.5 ? STONE_PAINT : STONE_D, {
      at: [Math.cos(a) * r, 0.16, Math.sin(a) * r],
      scale: [1, 0.6, 1],
    });
  }
  b.cards(
    Array.from({ length: 28 }, () => {
      const a = R() * Math.PI * 2;
      const r = 0.9 + R() * 1.0;
      return frame([Math.cos(a) * r, 0.18, Math.sin(a) * r], [0, 1, 0]);
    }),
    mossTuft,
    { size: [0.16, 0.24], lean: 10, vary: 0.4, spin: 180, rng: rng(21), cross: true },
  );
  // little flowers
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.0 + R() * 0.8;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    b.rod([x, 0.18, z], [x, 0.36, z], 0.01, "#3f7a22", { sides: 4 });
    b.part(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? FLOWER : FLOWER2, { at: [x, 0.38, z] });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), "#f8f0c0", { at: [x, 0.42, z] });
  }
  // mushrooms near the feet
  for (let i = 0; i < 5; i++) {
    const a = 0.6 + i * 1.1;
    const r = 1.25 + (i % 2) * 0.3;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const hgt = 0.1 + R() * 0.1;
    b.rod([x, 0.18, z], [x, 0.18 + hgt, z], 0.025, BONE, { sides: 6 });
    b.lathe(
      [
        [0, 0],
        [0.09, 0],
        [0.1, 0.03],
        [0.05, 0.07],
        [0, 0.08],
      ],
      { at: [x, 0.18 + hgt, z], segments: 8, color: i % 2 ? "#d94a3a" : "#e8a030" },
    );
  }

  // ------------------------------------------------------------ hips / waist
  b.part(new THREE.DodecahedronGeometry(0.85, 0), BARK_PAINT, { at: [0, HIP_Y + 0.15, 0], scale: [1.15, 0.7, 0.85] });

  // ------------------------------------------------------------ torso (main trunk)
  const trunk = b.loft(
    [
      { at: [0, HIP_Y, 0], w: 1.6, h: 1.2 },
      { at: [0, HIP_Y + 0.5, 0.02], w: 1.75, h: 1.3 },
      { at: [0, CHEST_Y - 0.2, 0.08], w: 2.05, h: 1.45 },
      { at: [0, CHEST_Y + 0.3, 0.06], w: 2.35, h: 1.5 },
      { at: [0, CHEST_Y + 0.65, 0.0], w: 2.0, h: 1.3 },
      { at: [0, CHEST_Y + 0.85, -0.02], w: 1.2, h: 1.0 },
    ],
    { color: BARK_PAINT, section: { ngon: 8 }, caps: "flat" },
  );

  // heavy belly knots and bark ridges
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.36, 0), BARK_LIGHT, { at: [s * 0.55, HIP_Y + 0.7, 0.62], scale: [1.1, 0.9, 0.6] });
    b.part(new THREE.IcosahedronGeometry(0.22, 0), BARK_HI, { at: [s * 0.62, HIP_Y + 0.78, 0.8], scale: [1, 0.9, 0.5] });
  }
  // vertical ridges (ribs) on the front torso
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.27;
    const w = 1 - Math.abs(i) * 0.1;
    b.sweep(
      catmull([
        [x, HIP_Y + 0.35, 0.58],
        [x * 1.05, HIP_Y + 1.0, 0.7 * w + 0.05],
        [x * 1.1, CHEST_Y + 0.1, 0.78 * w + 0.05],
        [x * 0.9, CHEST_Y + 0.7, 0.5],
      ]),
      [0.07, 0.1, 0.04],
      { color: i % 2 ? BARK_LIGHT : BARK_PAINT, sides: 5, caps: "round" },
    );
  }

  // chest rune medallion (glowing)
  b.part(new THREE.CylinderGeometry(0.42, 0.46, 0.08, 10), GOLD, {
    at: [0, CHEST_Y + 0.05, 0.84],
    dir: [0, 0.1, 1],
    axis: "y",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.36, 16), "#ffffff", {
      at: [0, CHEST_Y + 0.05, 0.9],
      dir: [0, 0.1, 1],
      axis: "z",
      texture: runeTex,
    }),
    1.4,
  );
  // medallion rivets
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.03, 5, 4), "#f3cf72", {
      at: [Math.cos(a) * 0.4, CHEST_Y + 0.05 + Math.sin(a) * 0.4, 0.89],
    });
  }
  // glowing cracks radiating from medallion (amber veins)
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + 0.3;
    glow(
      b.sweep(
        catmull([
          [Math.cos(a) * 0.5, CHEST_Y + 0.05 + Math.sin(a) * 0.5, 0.84],
          [Math.cos(a + 0.2) * 0.75, CHEST_Y + 0.05 + Math.sin(a + 0.2) * 0.75, 0.78],
          [Math.cos(a - 0.1) * 0.98, CHEST_Y + 0.05 + Math.sin(a - 0.1) * 0.9, 0.62],
        ]),
        [0.018, 0.006],
        { color: AMBER, sides: 4, caps: "none" },
      ),
      1.2,
    );
  }

  // belt of woven vines with iron buckle
  const beltPath = catmull(
    [
      [0, HIP_Y + 0.55, 0.92],
      [0.95, HIP_Y + 0.55, 0.55],
      [1.0, HIP_Y + 0.58, -0.05],
      [0.0, HIP_Y + 0.5, -0.78],
      [-1.0, HIP_Y + 0.58, -0.05],
      [-0.95, HIP_Y + 0.55, 0.55],
    ],
    { closed: true },
  );
  b.sweep(beltPath, 0.09, { color: "#4a7a22", sides: 6 });
  b.sweep(beltPath.slice(0, 1), 0.001, { color: "#4a7a22" });
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.1), IRON_PAINT, { at: [0, HIP_Y + 0.55, 0.96] });
  b.part(new THREE.BoxGeometry(0.38, 0.2, 0.05), GOLD, { at: [0, HIP_Y + 0.55, 1.02] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), IRON_D, { at: [0, HIP_Y + 0.55, 1.06], rotation: [90, 0, 0] });
  // hanging pouches on belt
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.28, 0.32, 0.2), "#7a5230", { at: [s * 0.7, HIP_Y + 0.28, 0.62], rotation: [0, s * 20, 0] });
    b.part(new THREE.BoxGeometry(0.3, 0.1, 0.22), "#5a3a20", { at: [s * 0.7, HIP_Y + 0.42, 0.62], rotation: [0, s * 20, 0] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), GOLD, { at: [s * 0.74, HIP_Y + 0.34, 0.74] });
  }
  // strap of bone trophies
  for (let i = 0; i < 5; i++) {
    const x = -0.5 + i * 0.25;
    b.rod([x, HIP_Y + 0.5, 0.9], [x, HIP_Y + 0.3 - (i % 2) * 0.05, 0.92], 0.015, "#4a7a22", { sides: 4 });
    b.part(new THREE.IcosahedronGeometry(0.06, 0), BONE, { at: [x, HIP_Y + 0.26 - (i % 2) * 0.05, 0.93], scale: [0.7, 1.2, 0.7] });
  }

  // ------------------------------------------------------------ back: root cloak and hollow
  b.part(new THREE.DodecahedronGeometry(0.9, 0), BARK_LIGHT, { at: [0, CHEST_Y + 0.15, -0.65], scale: [1.2, 1.1, 0.7] });
  for (let i = 0; i < 7; i++) {
    const x = -0.9 + i * 0.3;
    b.sweep(
      catmull([
        [x, CHEST_Y + 0.7, -0.5],
        [x * 1.2, CHEST_Y - 0.3, -0.95],
        [x * 1.1, HIP_Y + 0.4, -0.9],
      ]),
      [0.09, 0.05],
      { color: BARK_LIGHT, sides: 5 },
    );
  }

  // ------------------------------------------------------------ shoulders / pauldron burls
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.85, 1), BARK_PAINT, { at: [s * 1.45, CHEST_Y + 0.5, 0.0], scale: [1.1, 0.95, 1.0] });
    // mossy cap
    b.part(new THREE.IcosahedronGeometry(0.8, 1), MOSS_PAINT, { at: [s * 1.45, CHEST_Y + 0.88, -0.02], scale: [1.05, 0.5, 0.95] });
    // bark plates (pauldron layers)
    for (let k = 0; k < 3; k++) {
      b.frustumBox(
        [s * (1.0 + k * 0.28), CHEST_Y + 0.2 + k * 0.06, 0.45 - k * 0.15],
        [s * (1.0 + k * 0.28), CHEST_Y + 0.75 + k * 0.1, 0.45 - k * 0.15],
        [0.35 - k * 0.04, 0.12],
        [0.28 - k * 0.04, 0.1],
        { color: k % 2 ? BARK_LIGHT : BARK_PAINT },
      );
    }
    // iron studs on shoulder
    for (let k = 0; k < 4; k++) {
      const a = k * 0.5 - 0.7;
      b.part(new THREE.SphereGeometry(0.055, 6, 4), IRON_PAINT, {
        at: [s * (1.45 + Math.sin(a) * 0.5), CHEST_Y + 0.45, 0.75 * Math.cos(a)],
      });
    }
    // branch spikes on shoulder (antler-like)
    for (let k = 0; k < 3; k++) {
      b.spike(
        [s * (1.35 + k * 0.2), CHEST_Y + 1.15, -0.05 + k * 0.12],
        [s * 0.4, 1, 0.1 * (k - 1)],
        0.55 + k * 0.1,
        0.075,
        BARK_L,
        { sides: 5 },
      );
    }
  }

  // ------------------------------------------------------------ arms (huge, root-wrapped) ending in giant hands
  for (const s of [1, -1]) {
    const shoulder: [number, number, number] = [s * 1.65, CHEST_Y + 0.3, 0.05];
    const elbow: [number, number, number] = [s * 2.25, CHEST_Y - 0.9, 0.35];
    const wrist: [number, number, number] = [s * 2.25, CHEST_Y - 2.0, 0.65];
    const arm = b.sweep(catmull([shoulder, [s * 2.0, CHEST_Y - 0.4, 0.2], elbow, [s * 2.3, CHEST_Y - 1.5, 0.5], wrist]), [0.55, 0.48, 0.5, 0.42, 0.38], {
      color: BARK_PAINT,
      sides: 8,
      caps: "round",
    });
    // twisted vine roots wrapping the arm
    for (let k = 0; k < 3; k++) {
      const off = k * 2.1;
      const pts: Array<[number, number, number]> = [];
      for (let u = 0; u <= 10; u++) {
        const t = 0.1 + (u / 10) * 0.8;
        const p = arm.at(t, (u * 55 + off * 57) % 360);
        pts.push([p.x, p.y, p.z]);
      }
      b.sweep(catmull(pts), 0.06, { color: k % 2 ? BARK_LIGHT : BARK_PAINT, sides: 5, caps: "round" });
    }
    // elbow burl
    b.part(new THREE.IcosahedronGeometry(0.42, 1), BARK_PAINT, { at: [s * 2.55, CHEST_Y - 0.9, 0.3], scale: [0.8, 1, 1] });
    b.spike([s * 2.8, CHEST_Y - 0.9, 0.3], [s, 0.2, -0.2], 0.4, 0.14, BARK_L, { sides: 6 });
    // moss patches on forearm/upperarm
    b.part(new THREE.IcosahedronGeometry(0.3, 1), MOSS_PAINT, { at: [s * 2.0, CHEST_Y - 0.25, 0.1], scale: [1.1, 0.7, 1.1] });
    b.part(new THREE.IcosahedronGeometry(0.22, 1), MOSS_DARK, { at: [s * 2.35, CHEST_Y - 1.5, 0.3], scale: [0.9, 0.8, 0.9] });
    // iron bracer on forearm with rune band
    b.lathe(
      [
        [0.4, 0],
        [0.5, 0.03],
        [0.5, 0.42],
        [0.4, 0.45],
        [0.36, 0.42],
        [0.36, 0.03],
      ],
      { at: [s * 2.27, CHEST_Y - 1.75, 0.58], segments: 10, color: IRON_PAINT },
    );
    b.lathe(
      [
        [0.5, 0.06],
        [0.53, 0.08],
        [0.53, 0.14],
        [0.5, 0.16],
      ],
      { at: [s * 2.27, CHEST_Y - 1.75, 0.58], segments: 10, color: GOLD },
    );
    b.lathe(
      [
        [0.5, 0.3],
        [0.53, 0.32],
        [0.53, 0.38],
        [0.5, 0.4],
      ],
      { at: [s * 2.27, CHEST_Y - 1.75, 0.58], segments: 10, color: GOLD },
    );
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.03, 5, 4), "#c8c4be", {
        at: [s * 2.27 + Math.cos(a) * 0.52, CHEST_Y - 1.75 + 0.23, 0.58 + Math.sin(a) * 0.52],
      });
    }

    // ---------- the hand: wide palm + 4 root fingers + thumb
    const palm: [number, number, number] = [s * 2.3, CHEST_Y - 2.35, 0.75];
    b.part(new THREE.IcosahedronGeometry(0.5, 1), BARK_PAINT, { at: palm, scale: [1.0, 0.85, 1.05] });
    const fingers: Array<{ off: number; len: number; r: number }> = [
      { off: -0.28, len: 1.0, r: 0.15 },
      { off: -0.09, len: 1.2, r: 0.16 },
      { off: 0.1, len: 1.15, r: 0.15 },
      { off: 0.28, len: 0.9, r: 0.13 },
    ];
    fingers.forEach((f, i) => {
      const base: [number, number, number] = [palm[0] + s * f.off * 0.9, palm[1] - 0.25, palm[2] + 0.2 + f.off * 0.4];
      const m1: [number, number, number] = [base[0] + s * f.off * 0.4, base[1] - f.len * 0.4, base[2] + 0.25];
      const tip: [number, number, number] = [base[0] + s * f.off * 0.5, base[1] - f.len * 0.95, base[2] + 0.4 + (i % 2) * 0.08];
      b.sweep(catmull([base, m1, tip]), [f.r, f.r * 0.6, 0.05], { color: BARK_PAINT, sides: 6, caps: "round" });
      // knuckle
      b.part(new THREE.IcosahedronGeometry(f.r * 1.1, 0), BARK_LIGHT, { at: m1 });
      // claw/twig tip
      b.spike(tip, [s * f.off * 0.3, -1, 0.35], 0.22, 0.055, BARK_D, { sides: 5 });
    });
    // thumb
    b.sweep(
      catmull([
        [palm[0] - s * 0.35, palm[1] - 0.05, palm[2] + 0.25],
        [palm[0] - s * 0.62, palm[1] - 0.3, palm[2] + 0.4],
        [palm[0] - s * 0.7, palm[1] - 0.6, palm[2] + 0.55],
      ]),
      [0.17, 0.12, 0.05],
      { color: BARK_PAINT, sides: 6, caps: "round" },
    );
    b.spike([palm[0] - s * 0.7, palm[1] - 0.6, palm[2] + 0.55], [-s * 0.2, -1, 0.3], 0.2, 0.05, BARK_D, { sides: 5 });
  }

  // right hand holds a glowing seed-lantern
  {
    const s = -1;
    const lx = s * 2.35;
    const ly = CHEST_Y - 3.25;
    const lz = 1.25;
    b.sweep(
      catmull([
        [lx, ly + 0.95, lz],
        [lx - 0.05, ly + 0.5, lz + 0.02],
        [lx, ly + 0.28, lz],
      ]),
      0.02,
      { color: "#8a6a3a", sides: 4 },
    );
    b.lathe(
      [
        [0, 0],
        [0.13, 0],
        [0.16, 0.05],
        [0.14, 0.09],
        [0, 0.1],
      ],
      { at: [lx, ly + 0.1, lz], segments: 8, color: GOLD },
    );
    glow(b.part(new THREE.IcosahedronGeometry(0.16, 1), AMBER_HOT, { at: [lx, ly + 0.28, lz] }), 1.6);
    b.lathe(
      [
        [0, 0],
        [0.11, 0],
        [0.13, 0.04],
        [0, 0.05],
      ],
      { at: [lx, ly + 0.44, lz], segments: 8, color: GOLD },
    );
    b.part(new THREE.TorusGeometry(0.04, 0.012, 4, 8), GOLD, { at: [lx, ly + 0.52, lz] });
  }

  // ------------------------------------------------------------ neck & head
  const neck = b.sweep(
    catmull([
      [0, CHEST_Y + 0.7, 0.0],
      [0, CHEST_Y + 0.95, 0.12],
      [0, HEAD_Y - 0.15, 0.2],
    ]),
    [0.6, 0.5, 0.48],
    { color: BARK_PAINT, sides: 8, caps: "round" },
  );
  void neck;
  // mossy collar
  b.lathe(
    [
      [0.42, 0],
      [0.75, 0.04],
      [0.85, 0.16],
      [0.7, 0.26],
      [0.44, 0.22],
    ],
    { at: [0, CHEST_Y + 0.75, 0.05], segments: 12, color: MOSS_PAINT, smoothing: 1 },
  );

  // skull / face mass (a chunky bark head, wide brow)
  const hz = 0.42;
  const head = b.part(new THREE.IcosahedronGeometry(0.8, 1), BARK_PAINT, { at: [0, HEAD_Y, hz], scale: [1.0, 0.95, 0.95] });
  void head;
  // heavy brow ridge
  b.frustumBox([-0.62, HEAD_Y + 0.22, hz + 0.6], [0.62, HEAD_Y + 0.22, hz + 0.6], [0.2, 0.2], [0.2, 0.2], { color: BARK_LIGHT });
  for (const s of [1, -1]) {
    b.capsule([s * 0.2, HEAD_Y + 0.32, hz + 0.68], [s * 0.7, HEAD_Y + 0.2, hz + 0.45], 0.1, { color: BARK_PAINT, sides: 6 });
    // glowing eye
    const ex = s * 0.33;
    b.part(new THREE.SphereGeometry(0.17, 8, 6), "#1a0e06", { at: [ex, HEAD_Y + 0.08, hz + 0.7], scale: [1.2, 0.85, 0.5] });
    glow(
      b.part(new THREE.PlaneGeometry(0.34, 0.21), "#ffffff", {
        at: [ex, HEAD_Y + 0.08, hz + 0.77],
        dir: [s * 0.15, 0, 1],
        axis: "z",
        texture: eyeTex,
      }),
      1.8,
    );
    // eye glow aura
    glow(b.part(new THREE.SphereGeometry(0.06, 5, 4), AMBER_HOT, { at: [ex, HEAD_Y + 0.08, hz + 0.78] }), 2);
    // cheek knot
    b.part(new THREE.IcosahedronGeometry(0.22, 0), BARK_LIGHT, { at: [s * 0.62, HEAD_Y - 0.2, hz + 0.45], scale: [1, 0.8, 0.8] });
    // ear-like fungus shelf
    b.lathe(
      [
        [0, 0],
        [0.3, -0.02],
        [0.38, 0.03],
        [0.1, 0.08],
        [0, 0.07],
      ],
      { at: [s * 0.78, HEAD_Y + 0.1, hz - 0.05], axis: [s, 0.3, 0], segments: 8, color: "#c9733a" } as never,
    );
  }
  // nose: gnarled root branch
  b.spike([0, HEAD_Y - 0.02, hz + 0.72], [0, -0.35, 1], 0.5, 0.13, BARK_LIGHT, { sides: 6 });
  b.part(new THREE.IcosahedronGeometry(0.1, 0), BARK_HI, { at: [0, HEAD_Y - 0.12, hz + 1.14] });
  // mouth: deep crack with tooth-roots
  b.sweep(
    catmull([
      [-0.38, HEAD_Y - 0.42, hz + 0.58],
      [-0.15, HEAD_Y - 0.5, hz + 0.68],
      [0.15, HEAD_Y - 0.5, hz + 0.68],
      [0.38, HEAD_Y - 0.42, hz + 0.58],
    ]),
    [0.05, 0.05],
    { color: "#150a05", sides: 4, caps: "round" },
  );
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.1;
    b.spike([x, HEAD_Y - 0.47 + Math.abs(i) * 0.012, hz + 0.68 - Math.abs(i) * 0.03], [0, -1, 0.1], 0.1, 0.022, BONE, { sides: 4 });
  }
  // beard of hanging moss & roots
  for (let i = 0; i < 9; i++) {
    const x = -0.45 + i * 0.112;
    const len = 0.5 + Math.sin(i * 1.3) * 0.2 + (i === 4 ? 0.3 : 0);
    b.sweep(
      catmull([
        [x, HEAD_Y - 0.5, hz + 0.55 - Math.abs(x) * 0.3],
        [x * 1.05, HEAD_Y - 0.5 - len * 0.5, hz + 0.6 - Math.abs(x) * 0.3],
        [x * 1.1, HEAD_Y - 0.5 - len, hz + 0.58 - Math.abs(x) * 0.3],
      ]),
      [0.055, 0.015],
      { color: i % 2 ? MOSS_D : "#6a8a3a", sides: 4, caps: "point" },
    );
  }
  // head moss + bark crown plates
  b.part(new THREE.IcosahedronGeometry(0.62, 1), MOSS_PAINT, { at: [0, HEAD_Y + 0.65, hz - 0.05], scale: [1.1, 0.45, 1.0] });

  // ------------------------------------------------------------ antler-branches crown + canopy
  const crownBase: [number, number, number] = [0, HEAD_Y + 0.7, hz - 0.05];
  const branchTips: Array<[number, number, number]> = [];
  const branchDefs: Array<{ ang: number; lean: number; len: number; r: number }> = [
    { ang: 0, lean: 0.25, len: 1.6, r: 0.17 },
    { ang: 45, lean: 0.55, len: 1.5, r: 0.15 },
    { ang: 90, lean: 0.7, len: 1.55, r: 0.15 },
    { ang: 135, lean: 0.55, len: 1.4, r: 0.14 },
    { ang: 180, lean: 0.4, len: 1.5, r: 0.15 },
    { ang: 225, lean: 0.55, len: 1.4, r: 0.14 },
    { ang: 270, lean: 0.7, len: 1.55, r: 0.15 },
    { ang: 315, lean: 0.55, len: 1.5, r: 0.15 },
  ];
  const leafFrames: ReturnType<typeof frame>[] = [];
  const leafFramesB: ReturnType<typeof frame>[] = [];
  const leafFramesC: ReturnType<typeof frame>[] = [];
  const mossFrames: ReturnType<typeof frame>[] = [];
  branchDefs.forEach((d, bi) => {
    const a = (d.ang * Math.PI) / 180;
    const dx = Math.sin(a) * d.lean;
    const dz = Math.cos(a) * d.lean;
    const p0 = crownBase;
    const p1: [number, number, number] = [p0[0] + dx * 0.5, p0[1] + d.len * 0.45, p0[2] + dz * 0.5];
    const p2: [number, number, number] = [p0[0] + dx * 1.3, p0[1] + d.len * 0.85, p0[2] + dz * 1.3];
    const p3: [number, number, number] = [p0[0] + dx * 2.0, p0[1] + d.len * 1.1, p0[2] + dz * 2.0];
    const br = b.sweep(catmull([p0, p1, p2, p3]), [d.r, d.r * 0.75, d.r * 0.4, 0.04], {
      color: bi % 2 ? BARK_PAINT : BARK_LIGHT,
      sides: 6,
      caps: "round",
    });
    branchTips.push(p3);
    // side twigs
    for (let k = 0; k < 3; k++) {
      const t = 0.45 + k * 0.18;
      const at = br.at(t, 0);
      const side = k % 2 ? 1 : -1;
      const twA = a + side * 0.9;
      const tip: [number, number, number] = [
        at.x + Math.sin(twA) * 0.55,
        at.y + 0.35 + R() * 0.25,
        at.z + Math.cos(twA) * 0.55,
      ];
      b.sweep(catmull([[at.x, at.y, at.z], [(at.x + tip[0]) / 2, (at.y + tip[1]) / 2 + 0.05, (at.z + tip[2]) / 2], tip]), [0.05, 0.02], {
        color: BARK_LIGHT,
        sides: 5,
        caps: "point",
      });
      branchTips.push(tip);
    }
  });
  // leaf clusters along branches and tips
  for (const tp of branchTips) {
    const n = 7;
    for (let i = 0; i < n; i++) {
      const jx = (R() - 0.5) * 0.7;
      const jy = (R() - 0.2) * 0.55;
      const jz = (R() - 0.5) * 0.7;
      const f = frame([tp[0] + jx, tp[1] + jy, tp[2] + jz], [jx * 1.2, 0.6 + R() * 0.6, jz * 1.2]);
      const pick = R();
      if (pick < 0.55) leafFrames.push(f);
      else if (pick < 0.8) leafFramesC.push(f);
      else leafFramesB.push(f);
    }
    // moss ball in the canopy
    b.part(new THREE.IcosahedronGeometry(0.25, 0), MOSS_DARK, { at: [tp[0], tp[1] - 0.05, tp[2]], scale: [1, 0.7, 1] });
  }
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const r = R() * 0.5;
    mossFrames.push(frame([Math.cos(a) * r, HEAD_Y + 0.95, hz + Math.sin(a) * r], [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4]));
  }
  b.cards(leafFrames, leafA, { size: [0.32, 0.5], lean: 28, bend: 25, vary: 0.35, spin: 180, rng: rng(31), cross: true });
  b.cards(leafFramesC, leafC, { size: [0.3, 0.46], lean: 35, bend: 20, vary: 0.35, spin: 180, rng: rng(32), cross: true });
  b.cards(leafFramesB, leafB, { size: [0.3, 0.46], lean: 30, bend: 25, vary: 0.35, spin: 180, rng: rng(33), cross: true });
  b.cards(mossFrames, mossTuft, { size: [0.22, 0.34], lean: 12, vary: 0.3, spin: 180, rng: rng(34), cross: true });

  // dense lower canopy ring behind the head
  const bigLeafFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 40; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.5 + R() * 1.6;
    const y = HEAD_Y + 1.0 + R() * 1.2 + (1.6 - r) * 0.15;
    bigLeafFrames.push(frame([Math.sin(a) * r, y, hz + Math.cos(a) * r], [Math.sin(a), 0.7 + R() * 0.5, Math.cos(a)]));
  }
  b.cards(bigLeafFrames, [leafA, leafC, leafB, leafA], { size: [0.36, 0.55], lean: 30, bend: 25, vary: 0.3, spin: 180, rng: rng(35), cross: true });

  // ------------------------------------------------------------ shoulder / back / arm foliage
  const bodyLeaves: ReturnType<typeof frame>[] = [];
  const bodyMoss: ReturnType<typeof frame>[] = [];
  for (const s of [1, -1]) {
    for (let i = 0; i < 14; i++) {
      const a = R() * Math.PI * 2;
      const r = 0.2 + R() * 0.65;
      bodyMoss.push(frame([s * 1.45 + Math.cos(a) * r, CHEST_Y + 1.0 + R() * 0.1, Math.sin(a) * r], [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4]));
    }
    for (let i = 0; i < 6; i++) {
      bodyLeaves.push(
        frame([s * (1.25 + R() * 0.5), CHEST_Y + 1.3 + R() * 0.6, -0.1 + (R() - 0.5) * 0.6], [s * (0.5 + R() * 0.5), 1, (R() - 0.5)]),
      );
    }
    // elbow & forearm hanging vines
    for (let i = 0; i < 3; i++) {
      const x = s * (2.1 + i * 0.22);
      const y = CHEST_Y - 0.35;
      bodyMoss.push(frame([x, y, 0.1 + i * 0.12], [0, 1, 0]));
    }
  }
  // back leaves
  for (let i = 0; i < 18; i++) {
    const a = (R() - 0.5) * 2.4;
    bodyMoss.push(frame([Math.sin(a) * 1.0, CHEST_Y + 0.9 + R() * 0.4, -0.7 - R() * 0.2], [Math.sin(a) * 0.3, 1, -0.5]));
  }
  b.cards(bodyMoss, mossTuft, { size: [0.22, 0.34], lean: 15, vary: 0.35, spin: 180, rng: rng(41), cross: true });
  b.cards(bodyLeaves, [leafA, leafC], { size: [0.32, 0.5], lean: 30, bend: 25, vary: 0.3, spin: 180, rng: rng(42), cross: true });

  // hanging vines from shoulders & belt (vine drawing cards, hanging)
  const hang: ReturnType<typeof frame>[] = [];
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) hang.push(frame([s * (1.0 + i * 0.28), CHEST_Y + 0.3 - (i % 2) * 0.05, 0.75 - i * 0.12], [0, 1, 0]));
  }
  for (let i = 0; i < 6; i++) hang.push(frame([-0.9 + i * 0.36, HIP_Y + 0.45, 0.85], [0, 1, 0]));
  b.cards(hang, vineTex, { size: [0.14, 0.6], lean: 180, flow: [0, 0, 1], vary: 0.4, spin: 6, rng: rng(51), cross: true });

  // ------------------------------------------------------------ decor: gold-banded rune sash across chest, hanging amulet stones
  const sashPath = catmull([
    [-1.05, CHEST_Y + 0.85, 0.35],
    [-0.5, CHEST_Y + 0.5, 0.88],
    [0.4, CHEST_Y - 0.3, 0.95],
    [0.95, CHEST_Y - 0.75, 0.55],
  ]);
  b.sweep(sashPath, [0.1, 0.1], { color: "#6a4a28", sides: 4 });
  const sashSurf = sashPath;
  b.along(sashSurf, 5, (at) => {
    b.part(new THREE.BoxGeometry(0.11, 0.18, 0.05), GOLD, { frame: at });
  });
  // rune plaque on sash
  b.part(new THREE.PlaneGeometry(0.62, 0.15), "#ffffff", {
    at: [0.0, CHEST_Y + 0.18, 0.99],
    dir: [0, 0.05, 1],
    axis: "z",
    rotation: [0, 0, -34],
    texture: runeBand,
  });

  // ------------------------------------------------------------ stone cairn totem on the back + hanging chain of wooden charms
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.DodecahedronGeometry(0.18 - i * 0.03, 0), STONE_PAINT, {
      at: [0.2 - i * 0.04, CHEST_Y + 1.05 + i * 0.2, -0.6],
      scale: [1.2, 0.7, 1],
    });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.07, 0), RUNE, { at: [0.15, CHEST_Y + 1.58, -0.6] }), 1.5);

  // ------------------------------------------------------------ birds nest on left shoulder (storybook detail)
  {
    const nx = 1.75;
    const ny = CHEST_Y + 1.15;
    b.lathe(
      [
        [0, 0],
        [0.26, 0],
        [0.34, 0.1],
        [0.3, 0.14],
        [0.22, 0.1],
        [0, 0.08],
      ],
      { at: [nx, ny, 0.1], segments: 10, color: "#8a6a3a", smoothing: 1 },
    );
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.07, 6, 5), i === 1 ? "#9ad2e0" : "#bfe6ee", {
        at: [nx + (i - 1) * 0.09, ny + 0.12, 0.1 + (i % 2) * 0.05],
        scale: [0.8, 1, 0.8],
      });
    }
  }

  // ------------------------------------------------------------ final cleanup: ground contact sanity for gold ring / small details
  // knotted face vein lines (amber-lit cracks on cheeks and brow)
  for (const s of [1, -1]) {
    glow(
      b.sweep(
        catmull([
          [s * 0.6, HEAD_Y + 0.35, hz + 0.45],
          [s * 0.7, HEAD_Y + 0.15, hz + 0.4],
          [s * 0.72, HEAD_Y - 0.1, hz + 0.35],
        ]),
        [0.014, 0.006],
        { color: AMBER, sides: 4, caps: "none" },
      ),
      1.0,
    );
  }
  // gradient accent: bark hue fade onto trunk base
  b.part(new THREE.CylinderGeometry(1.0, 1.15, 0.5, 8), gradient(MOSS_D, BARK_D, [0, HIP_Y, 0], [0, HIP_Y + 0.5, 0]), {
    at: [0, HIP_Y - 0.05, 0],
    scale: [1.15, 1, 0.8],
  });

  return b.root;
}
