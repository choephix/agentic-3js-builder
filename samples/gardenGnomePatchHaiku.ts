import * as THREE from "three";
import { Builder, createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { countershade, grain, mottle, paint, spots, stripes } from "../src/paint";
import type { ColorInput } from "../src/paint";
import { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Garden Gnome Patch",
  description:
    "A whimsical garden patch on a lawn: three bobbled gnomes (one with a trowel), a birdbath with a bluebird, a watering can with a hinged lid, terracotta pots and a wooden trough, a raised lettuce bed, mushrooms, a picket fence and grass.",
  style: "whimsical",
  commit: "b816db2",
};

type Bone = Joint;
type Color = ColorInput;
type V = [number, number, number];
type Place = {
  p: (lx: number, h: number, lz: number) => V;
  d: (lx: number, ly: number, lz: number) => V;
  rot: V;
};

// Lawn top. Everything stands on it; the lawn bottom is the floor.
const G = 0.04;

const COL = {
  lawnA: "#8fd462",
  lawnB: "#66b64b",
  grassA: "#86d05a",
  grassB: "#5fb04a",
  leaf: "#5fbf4a",
  leafDark: "#3d8c3b",
  lettuceRed: "#c4577f",
  soilA: "#6a4128",
  soilB: "#452a1b",
  woodA: "#c48a52",
  woodB: "#93603a",
  cream: "#fbf0d6",
  mint: "#b9e6cf",
  terra: "#e0794a",
  terraDark: "#b4532c",
  stone: "#ddd6c2",
  stoneDark: "#b5ae99",
  pebble: "#b9b1a0",
  water: "#5fd0f2",
  bluebird: "#3d7fe6",
  wingBlue: "#2c63c4",
  breast: "#f2893a",
  beak: "#ffb23a",
  robeRed: "#e0503f",
  robeGreen: "#3fae62",
  robeBlue: "#3f72dc",
  dotYellow: "#ffd95a",
  hatRed: "#d8362e",
  hatOrange: "#f0873a",
  hatBlue: "#3f72dc",
  boot: "#5a3a26",
  belt: "#4a2d1c",
  brass: "#e9b84a",
  steel: "#c9d2d8",
  skin: "#f4c9a2",
  nose: "#ee7a5c",
  cheek: "#ff9fa0",
  beard: "#f8f5ef",
  beardShade: "#dcd6cb",
  black: "#1d1d25",
  white: "#ffffff",
  canGreen: "#4fb96a",
  canGreenDark: "#2f8a4f",
  canRed: "#e5523c",
  daisyPink: "#ff8fb1",
  daisyYellow: "#ffd447",
  daisyLilac: "#c9a6ff",
  mushRed: "#e8453c",
  ladybird: "#e23b2e",
};

// Model-space point at absolute height h (metres above the lawn top).
const A = (x: number, h: number, z: number): V => [x, G + h, z];

// A frame placed at (x, z) and turned by yaw degrees about Y (0 = facing +Z).
function place(x: number, z: number, yaw: number): Place {
  const a = (yaw * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const d = (lx: number, ly: number, lz: number): V => [lx * c + lz * s, ly, -lx * s + lz * c];
  const p = (lx: number, h: number, lz: number): V => {
    const q = d(lx, h, lz);
    return [q[0] + x, q[1] + G, q[2] + z];
  };
  return { p, d, rot: [0, yaw, 0] };
}

// A horizontal ring of points at absolute height h around (cx, cz).
function circ(cx: number, h: number, cz: number, r: number, n = 14): V[] {
  return Array.from({ length: n }, (_, k) => {
    const t = (k / n) * Math.PI * 2;
    const q: V = [cx + r * Math.cos(t), G + h, cz + r * Math.sin(t)];
    return q;
  });
}

// A horizontal ring of points round a placed frame's vertical axis.
function hoop(pl: Place, r: number, h: number, n = 12): V[] {
  return Array.from({ length: n }, (_, k) => {
    const t = (k / n) * Math.PI * 2;
    return pl.p(r * Math.cos(t), h, r * Math.sin(t));
  });
}

// Scales a [radius, height] profile by r across and h up.
function prof(pts: number[][], r: number, h: number): OutlinePoint[] {
  return pts.map(([a, c]) => [a * r, c * h]) as OutlinePoint[];
}

type GnomeSpec = {
  x: number;
  z: number;
  yaw: number;
  robe: string;
  trim: string;
  hat: string;
  pattern: "dots" | "stripes";
  seed: number;
  armA: V[];
  armB: V[];
  trowel: boolean;
};

function gnome(b: Builder, bone: Bone, g: GnomeSpec) {
  const pl = place(g.x, g.z, g.yaw);
  const { p, rot } = pl;
  const robe: Color =
    g.pattern === "dots"
      ? spots(g.robe, COL.dotYellow, { size: 0.2, amount: 0.3, seed: g.seed })
      : stripes(g.robe, g.trim, { size: 0.12, axis: "y", seed: g.seed });
  const hat: Color = spots(g.hat, COL.cream, { size: 0.09, amount: 0.3, seed: g.seed + 5 });

  // Little boots peeking out under the robe.
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.075, 10, 7), COL.boot, {
      bone,
      at: p(s * 0.085, 0.05, 0.1),
      scale: [1, 0.7, 1.4],
      rotation: rot,
    });

  // Robe: a bell with a belt and a collar.
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.27, 0.05],
      [0.24, 0.2],
      [0.2, 0.4],
      [0.17, 0.56],
      [0.16, 0.66],
      [0, 0.68],
    ],
    { bone, at: p(0, 0, 0), smoothing: 1, color: robe },
  );
  b.sweep(catmull(hoop(pl, 0.2, 0.4), { closed: true }), 0.024, { bone, color: COL.belt });
  b.part(new THREE.BoxGeometry(0.075, 0.06, 0.03), COL.brass, { bone, at: p(0, 0.4, 0.2), rotation: rot });
  b.part(new THREE.BoxGeometry(0.045, 0.035, 0.012), COL.belt, { bone, at: p(0, 0.4, 0.217), rotation: rot });
  // A patch pocket with a brass button on the front of the robe.
  b.part(new THREE.BoxGeometry(0.085, 0.07, 0.02), g.trim, { bone, at: p(-0.1, 0.28, 0.2), rotation: rot });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), COL.brass, { bone, at: p(-0.1, 0.3, 0.218) });
  b.sweep(catmull(hoop(pl, 0.17, 0.665, 14), { closed: true }), 0.028, { bone, color: COL.cream });

  // Head with ears, rosy cheeks, bead eyes and a big round nose.
  b.part(new THREE.SphereGeometry(0.15, 16, 12), COL.skin, {
    bone,
    at: p(0, 0.82, 0),
    scale: [1, 0.93, 0.98],
    rotation: rot,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.04, 8, 6), COL.skin, {
      bone,
      at: p(s * 0.16, 0.8, 0),
      scale: [0.5, 1, 0.8],
      rotation: rot,
    });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), COL.cheek, {
      bone,
      at: p(s * 0.095, 0.79, 0.12),
      scale: [1, 0.6, 0.5],
      rotation: rot,
    });
    b.part(new THREE.SphereGeometry(0.026, 10, 8), COL.black, { bone, at: p(s * 0.058, 0.87, 0.13) });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), COL.white, { bone, at: p(s * 0.058 + 0.009, 0.88, 0.15) });
  }
  b.part(new THREE.SphereGeometry(0.048, 10, 8), COL.nose, {
    bone,
    at: p(0, 0.8, 0.158),
    scale: [1, 0.9, 1.1],
  });

  // Beard: a flat wavy bib, tilted so its tip hangs forward of the robe.
  const beard: OutlinePoint[] = [
    [-0.15, 0.03],
    [-0.1, 0.0],
    [0, 0.02],
    [0.1, 0.0],
    [0.15, 0.03],
    [0.16, -0.05],
    [0.13, -0.15],
    [0.07, -0.22],
    [0, -0.25],
    [-0.07, -0.22],
    [-0.13, -0.15],
    [-0.16, -0.05],
  ];
  b.extrude(beard, {
    bone,
    at: p(0, 0.8, 0.155),
    x: pl.d(1, 0, 0),
    y: pl.d(0, 1, -0.3),
    thickness: 0.06,
    bevel: 0.015,
    smoothing: 1,
    color: grain(COL.beard, COL.beardShade, { size: 0.025, axis: "y", seed: g.seed }),
  });

  // Pointed hat, its tip flopping forward, with a cream pompom.
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.26, 0.03],
      [0.22, 0.06],
      [0.13, 0.11],
      [0.09, 0.15],
      [0, 0.2],
    ],
    { bone, at: p(0, 0.9, 0), smoothing: 1, color: hat },
  );
  b.sweep(bezier(p(0, 1.0, 0), p(0, 1.12, -0.04), p(0, 1.22, -0.02), p(0, 1.2, 0.14)), [0.07, 0.01], {
    bone,
    color: hat,
  });
  b.part(new THREE.SphereGeometry(0.045, 10, 8), COL.cream, { bone, at: p(0, 1.19, 0.14) });

  // Arms: sleeves in the robe colour, round hands.
  for (const arm of [g.armA, g.armB]) {
    const pts = arm.map(([x, h, z]) => p(x, h, z));
    b.sweep(catmull(pts), [0.05, 0.04], { bone, color: g.robe });
    b.part(new THREE.SphereGeometry(0.048, 10, 8), COL.skin, { bone, at: pts[pts.length - 1] });
  }

  if (g.trowel) {
    const hand = p(g.armA[2][0], g.armA[2][1], g.armA[2][2]);
    const tip = p(0.34, 0.2, 0.24);
    b.rod(hand, tip, 0.011, { bone, color: COL.belt });
    b.extrude(
      [
        [-0.035, 0],
        [0.035, 0],
        [0.03, -0.08],
        [0, -0.12, "sharp"],
        [-0.03, -0.08],
      ],
      { bone, at: tip, x: pl.d(1, 0, 0), y: pl.d(0, 1, 0), thickness: 0.008, bevel: 0.002, color: COL.steel },
    );
  }
}

function mushroom(b: Builder, bone: Bone, x: number, z: number, s: number, seed: number) {
  const at = A(x, 0, z);
  const sc = (pts: number[][]) => pts.map(([r, h]) => [r * s, h * s]) as OutlinePoint[];
  b.lathe(sc([[0, 0], [0.035, 0], [0.042, 0.05], [0.03, 0.07], [0, 0.07]]), {
    bone,
    at,
    smoothing: 1,
    color: COL.cream,
  });
  b.lathe(sc([[0, 0.12], [0.06, 0.115], [0.12, 0.085], [0.13, 0.06], [0.1, 0.05], [0, 0.05]]), {
    bone,
    at,
    smoothing: 1,
    color: spots(COL.mushRed, COL.white, { size: 0.05, amount: 0.3, seed }),
  });
}

function pot(b: Builder, bone: Bone, x: number, z: number, r: number, h: number, seed: number) {
  const at = A(x, 0, z);
  b.lathe(
    prof(
      [
        [0, 0],
        [0.62, 0],
        [0.7, 0.08],
        [0.86, 0.5],
        [0.98, 0.9],
        [1.05, 0.97],
        [1.06, 1],
        [0.92, 1],
        [0.9, 0.92],
        [0, 0.92],
      ],
      r,
      h,
    ),
    { bone, at, smoothing: 1, detail: 0.6, color: spots(COL.terra, COL.terraDark, { size: 0.1, amount: 0.3, seed }) },
  );
  b.sweep(catmull(circ(x, h * 0.99, z, r * 1.0, 16), { closed: true }), 0.012, { bone, color: COL.terraDark });
  b.part(new THREE.CylinderGeometry(0.9 * r, 0.9 * r, 0.02, 16), mottle(COL.soilA, COL.soilB, { size: 0.06, seed }), {
    bone,
    at: A(x, 0.92 * h + 0.01, z),
  });

  // Leafy bush spilling out of the pot, with a few daisies and a ladybird.
  const bush = b.part(new THREE.SphereGeometry(0.95 * r, 8, 6), COL.leafDark, {
    bone,
    at: A(x, h + 0.4 * r, z),
    scale: [1, 0.85, 1],
  });
  const leaves = b.surface(bush).scatter(80, {
    rng: rng(seed),
    minDist: 0.035,
    filter: (hh) => hh.at.y > G + h + 0.03,
  });
  b.cards(leaves, LEAF, {
    size: [0.09, 0.11],
    lean: 30,
    flow: [0, 0.7, 0],
    color: COL.leaf,
    vary: 0.25,
    rng: rng(seed + 1),
  });
  const blooms = b.surface(bush).scatter(12, {
    rng: rng(seed + 2),
    minDist: 0.06,
    filter: (hh) => hh.at.y > G + h + 0.1,
  });
  b.cards(blooms, DAISY, {
    size: [0.09, 0.12],
    lean: 12,
    flow: [0, 0.5, 0],
    color: COL.daisyPink,
    rng: rng(seed + 3),
  });
  if (leaves[0]) b.stick(new THREE.SphereGeometry(0.016, 8, 6), COL.ladybird, leaves[0], { embed: 0.3 });
}

function trough(b: Builder, bone: Bone, x: number, z: number, seed: number) {
  const L = 0.9;
  const W = 0.3;
  const H = 0.24;
  const wood = grain(COL.woodA, COL.woodB, { size: 0.05, axis: "x", seed });
  b.part(new THREE.BoxGeometry(L, H, 0.03), wood, { bone, at: A(x, H / 2, z + W / 2 - 0.015) });
  b.part(new THREE.BoxGeometry(L, H, 0.03), wood, { bone, at: A(x, H / 2, z - W / 2 + 0.015) });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.03, H, W), wood, { bone, at: A(x + s * (L / 2 - 0.015), H / 2, z) });
  const soil = b.part(new THREE.BoxGeometry(L - 0.06, 0.2, W - 0.06), mottle(COL.soilA, COL.soilB, { size: 0.06, seed }), {
    bone,
    at: A(x, 0.1, z),
  });
  const plants = b.surface(soil).scatter(70, {
    rng: rng(seed),
    minDist: 0.03,
    filter: (hh) => hh.n.y > 0.9,
  });
  b.cards(plants.slice(0, 40), BLADE, {
    size: [0.05, 0.09],
    lean: 25,
    flow: [0, 0.5, 0],
    color: COL.grassA,
    vary: 0.3,
    rng: rng(seed + 1),
  });
  b.cards(plants.slice(40), DAISY, {
    size: [0.07, 0.1],
    lean: 8,
    color: COL.daisyYellow,
    vary: 0.2,
    rng: rng(seed + 2),
  });
}

// Shared textures, created once per build.
const BLADE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <path d="M10 64 Q6 30 1 14 Q12 26 14 64Z" fill="#f2f2f2"/>
  <path d="M16 64 Q12 26 14 2 Q20 26 18 64Z" fill="#ffffff"/>
  <path d="M22 64 Q24 36 31 22 Q26 40 24 64Z" fill="#dedede"/>
</svg>`,
  { size: 128 },
);
const LEAF = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <path d="M24 47 C5 35 3 15 24 1 L24 47Z" fill="#e2e2e2"/>
  <path d="M24 47 C43 35 45 15 24 1 L24 47Z" fill="#ffffff"/>
  <path d="M24 45 L24 8" stroke="#bdbdbd" stroke-width="2" fill="none"/>
  <path d="M24 31 L14 22 M24 22 L34 14 M24 38 L12 31 M24 38 L36 30" stroke="#bdbdbd" stroke-width="1.5" fill="none"/>
</svg>`,
  { size: 128 },
);
const petalsOf = (n: number, cy: number, rx: number, ry: number) =>
  Array.from(
    { length: n },
    (_, k) => `<ellipse cx="32" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${(k * 360) / n} 32 32)"/>`,
  ).join("");
const DAISY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M32 64 L32 34" stroke="#cfcfcf" stroke-width="3.5" stroke-linecap="round"/>
  <g fill="#ffffff" stroke="#b8b8b8" stroke-width="1.2">${petalsOf(8, 17, 6.5, 13)}</g>
  <circle cx="32" cy="32" r="7" fill="#7a7a7a"/>
</svg>`,
  { size: 128 },
);
const DECAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M32 60 Q22 50 18 44 Q28 44 33 52Z" fill="#4fb96a"/>
  <path d="M32 60 Q42 50 46 44 Q36 44 31 52Z" fill="#3fa35b"/>
  <g fill="#ffd23f" stroke="#e08a1e" stroke-width="2">${petalsOf(6, 16, 8, 13)}</g>
  <circle cx="32" cy="30" r="7" fill="#8a4b1f"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "gardenGnomePatch", detail: 0.75, paintSize: 2048 });
  const patch = b.joint("patch", { at: [0, 0, 0] });
  const bone = patch;

  // Lawn: a thin slab, its top at G, mottled green.
  const lawn = b.part(new THREE.BoxGeometry(3.2, G, 2.4), mottle(COL.lawnA, COL.lawnB, { size: 0.35, seed: 2 }), {
    bone,
    at: [0, G / 2, 0],
  });

  // Picket fence along the back edge.
  const FZ = -1.18;
  const picket: OutlinePoint[] = [
    [-0.045, 0],
    [0.045, 0],
    [0.045, 0.36],
    [0, 0.42, "sharp"],
    [-0.045, 0.36],
  ];
  for (let i = 0; i <= 31; i++)
    b.extrude(picket, {
      bone,
      at: [-1.55 + i * 0.1, G, FZ],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.004,
      color: i % 2 ? grain(COL.cream, "#e6d6ae", { size: 0.03, axis: "y", seed: i }) : grain(COL.mint, "#9fd3b8", { size: 0.03, axis: "y", seed: i }),
    });
  b.part(new THREE.BoxGeometry(3.14, 0.04, 0.03), COL.cream, { bone, at: [0, G + 0.14, FZ] });
  b.part(new THREE.BoxGeometry(3.14, 0.04, 0.03), COL.cream, { bone, at: [0, G + 0.32, FZ] });
  for (const x of [-1.6, -0.8, 0, 0.8, 1.6])
    b.part(new THREE.BoxGeometry(0.07, 0.48, 0.07), COL.cream, { bone, at: [x, G + 0.24, FZ] });

  // Birdbath, centre (BX, BZ): plinth, column, basin with water and a bluebird on the rim.
  const BX = -0.25;
  const BZ = -0.75;
  const stoneP = mottle(COL.stone, COL.stoneDark, { size: 0.22, seed: 5 });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.32, 0.04],
      [0.26, 0.09],
      [0.2, 0.1],
      [0, 0.1],
    ],
    { bone, at: A(BX, 0, BZ), smoothing: 1, color: stoneP },
  );
  b.lathe(
    [
      [0, 0.06],
      [0.16, 0.06],
      [0.12, 0.1],
      [0.1, 0.2],
      [0.095, 0.6],
      [0.11, 0.7],
      [0.13, 0.74],
      [0.1, 0.78],
      [0.1, 0.84],
      [0, 0.84],
    ],
    { bone, at: A(BX, 0, BZ), smoothing: 1, color: stoneP },
  );
  b.lathe(
    [
      [0, 0.8],
      [0.14, 0.82],
      [0.26, 0.87],
      [0.36, 0.94],
      [0.42, 1.0],
      [0.44, 1.05, "sharp"],
      [0.41, 1.06, "sharp"],
      [0.38, 1.0],
      [0.3, 0.95],
      [0.18, 0.92],
      [0, 0.92],
    ],
    { bone, at: A(BX, 0, BZ), smoothing: 1, color: stoneP },
  );
  b.sweep(catmull(circ(BX, 1.05, BZ, 0.43, 16), { closed: true }), 0.016, { bone, color: COL.stoneDark });
  b.part(new THREE.CircleGeometry(0.3, 24), COL.water, { bone, at: A(BX, 0.955, BZ), dir: [0, 1, 0], axis: "z" });
  for (const rr of [0.12, 0.2])
    b.sweep(catmull(circ(BX, 0.958, BZ, rr, 16), { closed: true }), 0.004, { bone, color: "#b9f3ff" });

  const bx = BX + 0.22;
  const bz = BZ + 0.33;
  const birdPaint = paint((_p, n) => (n.z > 0.35 ? COL.breast : COL.bluebird));
  b.part(new THREE.SphereGeometry(0.075, 12, 9), birdPaint, { bone, at: A(bx, 1.13, bz), scale: [0.9, 1.05, 1.2] });
  b.part(new THREE.SphereGeometry(0.05, 10, 8), COL.bluebird, { bone, at: A(bx, 1.2, bz + 0.04) });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.01, 6, 4), COL.black, { bone, at: A(bx + s * 0.025, 1.21, bz + 0.085) });
  b.spike(A(bx, 1.195, bz + 0.082), A(bx, 1.19, bz + 0.12), null, 0.013, { bone, color: COL.beak });
  const wing: OutlinePoint[] = [
    [0.04, 0.04],
    [-0.02, 0.07],
    [-0.09, 0.04],
    [-0.11, -0.03],
    [-0.06, -0.04],
    [0.02, -0.02],
  ];
  for (const s of [1, -1])
    b.extrude(wing, {
      bone,
      at: A(bx + s * 0.07, 1.12, bz),
      thickness: 0.012,
      bevel: 0.003,
      color: COL.wingBlue,
    });
  b.spike(A(bx, 1.1, bz - 0.09), A(bx, 1.02, bz - 0.22), null, 0.02, { bone, color: COL.wingBlue });

  // Watering can with a hinged lid, a red band at top and bottom, a brass rose and a flower on each side.
  const wc = place(-0.85, 0.95, 62);
  const wp = wc.p;
  const can = b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.14, 0.03],
      [0.15, 0.1],
      [0.15, 0.25],
      [0.135, 0.29],
      [0, 0.29],
    ],
    { bone, at: wp(0, 0, 0), smoothing: 1, color: countershade("#8fe3a0", COL.canGreenDark, { level: 0 }) },
  );
  b.sweep(catmull(hoop(wc, 0.148, 0.05, 16), { closed: true }), 0.011, { bone, color: COL.canRed });
  b.sweep(catmull(hoop(wc, 0.14, 0.27, 16), { closed: true }), 0.011, { bone, color: COL.canRed });
  b.sweep(catmull([wp(0, 0.27, -0.13), wp(0, 0.36, -0.2), wp(0, 0.42, -0.15), wp(0, 0.4, -0.06), wp(0, 0.3, -0.04)]), 0.016, {
    bone,
    color: COL.canGreenDark,
  });
  b.sweep(bezier(wp(0, 0.06, 0.13), wp(0, 0.1, 0.28), wp(0, 0.22, 0.4), wp(0, 0.36, 0.5)), [0.03, 0.012], {
    bone,
    color: COL.canGreen,
  });
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.045, 0.02],
      [0.05, 0.04],
      [0.03, 0.06],
      [0, 0.065],
    ],
    { bone, at: wp(0, 0.36, 0.5), axis: wc.d(0, 0.8, 0.6), smoothing: 1, color: COL.brass },
  );
  for (const s of [1, -1]) b.decal(can, DECAL, { bone, at: wp(s * 0.15, 0.14, 0), dir: wc.d(s, 0, 0), size: [0.11, 0.11] });
  const lid = b.joint("canLid", { parent: patch, at: wp(0, 0.27, -0.06), role: "hinge" });
  b.lathe(
    [
      [0, 0],
      [0.08, 0],
      [0.08, 0.012],
      [0.05, 0.035],
      [0.02, 0.05],
      [0, 0.055],
    ],
    { bone: lid, at: wp(0, 0.285, 0), smoothing: 1, color: COL.canGreenDark },
  );
  b.part(new THREE.SphereGeometry(0.018, 8, 6), COL.canRed, { bone: lid, at: wp(0, 0.345, 0) });

  // Gnomes.
  gnome(b, bone, {
    x: -1.0,
    z: -0.6,
    yaw: 40,
    robe: COL.robeRed,
    trim: COL.cream,
    hat: COL.hatBlue,
    pattern: "dots",
    seed: 4,
    armA: [
      [0.17, 0.6, 0],
      [0.29, 0.73, 0.06],
      [0.35, 0.86, 0.08],
    ],
    armB: [
      [-0.17, 0.6, 0],
      [-0.3, 0.5, 0.08],
      [-0.36, 0.42, 0.16],
    ],
    trowel: false,
  });
  gnome(b, bone, {
    x: 0.45,
    z: -0.3,
    yaw: -25,
    robe: COL.robeGreen,
    trim: COL.cream,
    hat: COL.hatRed,
    pattern: "stripes",
    seed: 9,
    armA: [
      [0.17, 0.6, 0],
      [0.27, 0.44, 0.1],
      [0.3, 0.34, 0.16],
    ],
    armB: [
      [-0.17, 0.6, 0],
      [-0.27, 0.5, 0.06],
      [-0.3, 0.4, 0.12],
    ],
    trowel: true,
  });
  gnome(b, bone, {
    x: -1.32,
    z: 0.5,
    yaw: 80,
    robe: COL.robeBlue,
    trim: COL.dotYellow,
    hat: COL.hatOrange,
    pattern: "dots",
    seed: 14,
    armA: [
      [0.17, 0.6, 0],
      [0.32, 0.6, 0.02],
      [0.42, 0.62, 0.06],
    ],
    armB: [
      [-0.17, 0.6, 0],
      [-0.3, 0.52, 0.14],
      [-0.28, 0.4, 0.22],
    ],
    trowel: false,
  });

  // Raised lettuce bed: wooden boards round a soil bed with rows of leaves and pebbles.
  const bedZ = 0.65;
  const bedWood = grain(COL.woodA, COL.woodB, { size: 0.05, axis: "x", seed: 7 });
  b.part(new THREE.BoxGeometry(1.12, 0.2, 0.06), bedWood, { bone, at: A(0, 0.1, bedZ + 0.285) });
  b.part(new THREE.BoxGeometry(1.12, 0.2, 0.06), bedWood, { bone, at: A(0, 0.1, bedZ - 0.285) });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.06, 0.2, 0.62), bedWood, { bone, at: A(s * 0.53, 0.1, bedZ) });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.075, 0.24, 0.075), COL.woodB, { bone, at: A(sx * 0.53, 0.12, bedZ + sz * 0.285) });
  const soil = b.part(new THREE.BoxGeometry(1.0, 0.16, 0.5), mottle(COL.soilA, COL.soilB, { size: 0.08, seed: 8 }), {
    bone,
    at: A(0, 0.08, bedZ),
  });
  const rows: [number, string][] = [
    [0.5, COL.leaf],
    [0.65, COL.leaf],
    [0.8, COL.lettuceRed],
  ];
  for (const [z, col] of rows) {
    const frames = [];
    for (const x of [-0.36, -0.18, 0, 0.18, 0.36]) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + x * 3;
        frames.push(
          frame([x + 0.03 * Math.cos(a), G + 0.16, z + 0.03 * Math.sin(a)], [0.5 * Math.cos(a), 1, 0.5 * Math.sin(a)]),
        );
      }
    }
    b.cards(frames, LEAF, {
      bone,
      size: [0.1, 0.12],
      lean: 40,
      flow: (f) => [f.axis.x, 0, f.axis.z],
      color: col,
      vary: 0.2,
      rng: rng(z * 100),
    });
  }
  const bedStones = b.surface(soil).scatter(24, { rng: rng(31), minDist: 0.06, filter: (hh) => hh.n.y > 0.9 });
  for (const hh of bedStones)
    b.stick(new THREE.IcosahedronGeometry(0.022, 0), COL.pebble, hh, { embed: 0.4 });

  // Terracotta pots with bushes, and a wooden trough.
  pot(b, bone, 1.15, -0.5, 0.22, 0.5, 21);
  pot(b, bone, 1.22, 0.18, 0.17, 0.34, 31);
  pot(b, bone, 0.82, 0.86, 0.12, 0.26, 41);
  trough(b, bone, 0.3, -0.95, 51);

  // Mushrooms by the birdbath.
  mushroom(b, bone, -0.6, -0.28, 1, 61);
  mushroom(b, bone, -0.52, -0.36, 0.7, 62);
  mushroom(b, bone, -0.66, -0.4, 0.55, 63);

  // Garden sign on a stake, facing the front of the patch.
  const SIGN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150">
  <rect x="2" y="2" width="296" height="146" rx="16" fill="#f7e3b0"/>
  <rect x="12" y="12" width="276" height="126" rx="10" fill="none" stroke="#8a5a31" stroke-width="6"/>
  <circle cx="34" cy="34" r="9" fill="#ff8fb1"/>
  <circle cx="266" cy="34" r="9" fill="#ffd447"/>
  <circle cx="34" cy="116" r="9" fill="#c9a6ff"/>
  <circle cx="266" cy="116" r="9" fill="#ff8fb1"/>
  <text x="150" y="80" font-family="Georgia, serif" font-size="34" font-weight="bold" text-anchor="middle" fill="#3d7a2e">Gnome Garden</text>
  <text x="150" y="112" font-family="Georgia, serif" font-size="19" font-style="italic" text-anchor="middle" fill="#b4436e">Mind the gnomes!</text>
</svg>`,
    { size: 256 },
  );
  const signX = -0.25;
  b.part(new THREE.BoxGeometry(0.03, 0.42, 0.03), COL.woodB, { bone, at: A(signX, 0.21, 1.12) });
  b.part(new THREE.BoxGeometry(0.3, 0.16, 0.02), COL.woodA, { bone, at: A(signX, 0.5, 1.12) });
  b.part(new THREE.PlaneGeometry(0.28, 0.14), COL.white, {
    bone,
    at: A(signX, 0.5, 1.135),
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGN,
  });

  // A little rake leaning on the fence: a rod, a head bar and four tines on the lawn.
  b.rod(A(1.45, 0.02, -0.5), A(1.45, 0.5, -1.14), 0.012, { bone, color: COL.woodB });
  b.part(new THREE.BoxGeometry(0.22, 0.02, 0.03), COL.woodA, { bone, at: A(1.45, 0.012, -0.5) });
  for (const x of [-0.08, -0.027, 0.027, 0.08])
    b.part(new THREE.BoxGeometry(0.012, 0.012, 0.09), COL.steel, { bone, at: A(1.45 + x, 0.006, -0.46) });

  // Bunting strung between the fence posts, sagging in the middle.
  const strand: V[] = [];
  for (let i = 0; i <= 12; i++) {
    const x = -1.5 + i * 0.25;
    strand.push(A(x, 0.46 - 0.2 * (1 - (x / 1.5) ** 2), -1.16));
  }
  b.sweep(catmull(strand), 0.005, { bone, color: COL.woodB });
  const flagCols = [COL.hatRed, COL.dotYellow, COL.mint, COL.robeBlue];
  const flag: OutlinePoint[] = [
    [-0.06, 0],
    [0.06, 0],
    [0, -0.13, "sharp"],
  ];
  for (let i = 1; i < 12; i++)
    b.extrude(flag, {
      bone,
      at: strand[i],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.001,
      color: flagCols[i % 4],
    });

  // Grass and daisies on the lawn, kept clear of everything standing on it.
  const KEEP: [number, number, number][] = [
    [BX, BZ, 0.5],
    [-1.0, -0.6, 0.36],
    [0.45, -0.3, 0.36],
    [-1.32, 0.5, 0.36],
    [-0.85, 0.95, 0.27],
    [1.15, -0.5, 0.38],
    [1.22, 0.18, 0.28],
    [0.82, 0.86, 0.2],
    [0.3, -0.95, 0.56],
    [-0.6, -0.34, 0.26],
    [-0.25, 1.12, 0.22],
    [1.45, -0.6, 0.22],
  ];
  const clear = (x: number, z: number) =>
    Math.abs(x) < 1.5 &&
    z > -1.1 &&
    z < 1.1 &&
    !(Math.abs(x) < 0.62 && z > 0.3 && z < 1.02) &&
    KEEP.every(([kx, kz, r]) => Math.hypot(x - kx, z - kz) > r);
  const grass = b.surface(lawn).scatter(480, {
    rng: rng(21),
    minDist: 0.045,
    filter: (hh) => hh.n.y > 0.9 && clear(hh.at.x, hh.at.z),
  });
  b.cards(
    grass.filter((_, i) => i % 2 === 0),
    BLADE,
    { size: [0.06, 0.1], lean: 15, color: COL.grassA, vary: 0.3, rng: rng(22) },
  );
  b.cards(
    grass.filter((_, i) => i % 2 === 1),
    BLADE,
    { size: [0.06, 0.1], lean: 15, color: COL.grassB, vary: 0.3, rng: rng(23) },
  );
  const lawnFlowers = b.surface(lawn).scatter(40, {
    rng: rng(24),
    minDist: 0.12,
    filter: (hh) => hh.n.y > 0.9 && clear(hh.at.x, hh.at.z),
  });
  const tints = [COL.daisyPink, COL.daisyYellow, COL.daisyLilac];
  tints.forEach((tint, k) =>
    b.cards(
      lawnFlowers.filter((_, i) => i % 3 === k),
      DAISY,
      { size: [0.07, 0.11], lean: 8, color: tint, vary: 0.2, rng: rng(40 + k) },
    ),
  );
  const pebbles = b.surface(lawn).scatter(22, {
    rng: rng(25),
    minDist: 0.1,
    filter: (hh) => hh.n.y > 0.9 && clear(hh.at.x, hh.at.z),
  });
  for (const hh of pebbles)
    b.stick(new THREE.IcosahedronGeometry(0.025, 0), COL.pebble, hh, { embed: 0.4 });

  return b.root;
}
