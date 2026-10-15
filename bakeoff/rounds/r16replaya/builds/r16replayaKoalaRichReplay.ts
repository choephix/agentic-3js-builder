import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { noise } from "../../../../src/paint";
import {
  bayer,
  cellPaint,
  pixelTexture,
  skinBox,
  skinLayout,
  stepped,
  type Cell,
} from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Branch Stand",
  description:
    "A chubby pixel-art koala sitting in the fork of a scribbly-gum eucalyptus, gripping both limbs, on a grassy round stand with gumnuts, leaves and a little plaque.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette. Ramps are dark to light; paints pick from them with dithering.

const FUR = ["#35302f", "#544e4c", "#767170", "#9a9591", "#bdb8b0", "#dad6cc", "#f0ece1"];
const PAW = ["#1c1719", "#2c2527", "#41373a", "#5a4b4e"];
const BARK_TAN = ["#6f6250", "#8e8068", "#ae9f82", "#cdbf9d", "#e4d9b8"];
const BARK_GREY = ["#4f4b47", "#6c6762", "#8b857c", "#a9a396"];
const BARK_PEEL = ["#8a4a2e", "#b0653a", "#cf8450", "#e2a56a"];
const BARK_DARK = "#2e2822";
const LEAF = ["#1f4a3c", "#2f6a50", "#46896a", "#6aa985", "#98c8a2"];
const GRASS = ["#1d4a22", "#2d6a2c", "#468a36", "#6aac48", "#98cc62"];
const SOIL = ["#2e1f18", "#46301f", "#62442a", "#80603a"];
const STONE = ["#4c4a52", "#6a6870", "#8a8890", "#aaa8ae"];
const CLAW = "#ece2c8";
const EARIN = ["#c98f8a", "#e2b7ad", "#f4dccc", "#fbf0de"];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const key = (arr: number[], t: number) => {
  const f = Math.min(Math.max(t, 0), 1) * (arr.length - 1);
  const i = Math.min(Math.floor(f), arr.length - 2);
  return arr[i] + (arr[i + 1] - arr[i]) * (f - i);
};

// ---------------------------------------------------------------------------------------------------------------
// Paints

function fur(size: number, bias: (c: Cell) => number = () => 0) {
  return cellPaint(
    size,
    (c) => {
      const streak = noise(V(c.at.x * 2.5, c.at.y * 0.5, c.at.z * 2.5), 0.1, 3);
      let v = 0.48 + 0.2 * c.n.y + 0.08 * c.n.z + (streak - 0.5) * 0.7 + bias(c);
      const r = c.random(7);
      if (r < 0.07) v += 0.2;
      else if (r > 0.94) v -= 0.2;
      return c.pick(FUR, v);
    },
    { dither: true },
  );
}

const bodyFur = fur(0.016, (c) => {
  let v = 0;
  if (c.n.z > 0.3 && c.at.y > 0.66) v += 0.28; // pale chest and belly
  if (c.n.z < -0.2 && c.at.y < 0.8 && noise(c.at, 0.07, 41) > 0.55) v += 0.45; // spotted rump
  if (c.n.z < -0.2 && c.at.y > 0.8) v -= 0.08;
  return v;
});
const headFur = fur(0.012, (c) => {
  let v = 0;
  if (c.at.y > 1.255) v -= 0.1;
  if (c.n.z > 0.45 && c.at.y < 1.2) v += 0.15;
  if (Math.abs(c.at.x) > 0.075 && c.at.y < 1.2 && c.n.z > -0.1) v += 0.22; // fluffy pale cheeks
  return v;
});
const muzzleFur = fur(0.01, () => 0.2);
const limbFur = fur(0.014, (c) => (c.n.y < -0.3 ? 0.05 : -0.05));
const pawSkin = cellPaint(0.01, (c) => c.pick(PAW, 0.3 + 0.4 * c.n.y + 0.3 * (c.random(2) - 0.5)), { dither: true });

const barkPaint = (size: number, seed: number) =>
  cellPaint(
    size,
    (c) => {
      const a = noise(V(c.at.x * 3, c.at.y * 0.5, c.at.z * 3), 0.18, seed);
      const m = noise(c.at, 0.16, seed + 12);
      let col: string;
      if (m > 0.66) col = c.pick(BARK_PEEL, (a - 0.25) * 1.5);
      else if (m < 0.32) col = c.pick(BARK_GREY, a * 1.1);
      else col = c.pick(BARK_TAN, a * 1.2 + 0.05 + 0.1 * c.n.y);
      // scribbly-gum tracks
      const w = noise(V(c.at.x * 2, c.at.y * 2, c.at.z * 2), 0.06, seed + 40);
      if (Math.abs(w - 0.5) < 0.03 && m > 0.3) col = BARK_DARK;
      if (c.random(4) < 0.035) col = BARK_DARK;
      return col;
    },
    { dither: true },
  );
const BARK = barkPaint(0.02, 21);
const TWIG = barkPaint(0.012, 5);

const STAND_SIDE = cellPaint(
  0.02,
  (c) => {
    const n = noise(c.at, 0.12, 8);
    return c.pick(SOIL, 0.35 + 0.5 * n + (c.v % 2 === 0 ? 0.05 : -0.08) + 0.3 * (c.random(1) - 0.5));
  },
  { dither: true },
);
const STAND_TOP = cellPaint(
  0.02,
  (c) => {
    const n = noise(c.at, 0.09, 61);
    const dist = Math.hypot(c.at.x, c.at.z + 0.1);
    if (c.n.y < 0.6) return c.pick(SOIL, 0.4 + 0.4 * n);
    if (n < 0.32 || (dist < 0.16 && n < 0.45)) return c.pick(SOIL, 0.45 + 0.5 * n); // bare dirt patches
    const blade = c.random(3);
    return c.pick(GRASS, 0.2 + 0.9 * n + (blade < 0.12 ? 0.3 : blade > 0.9 ? -0.25 : 0));
  },
  { dither: true },
);
const ROCK = cellPaint(0.012, (c) => c.pick(STONE, 0.3 + 0.5 * c.n.y + 0.4 * (noise(c.at, 0.04, 9) - 0.5)), {
  dither: true,
});
const GUMNUT = cellPaint(0.006, (c) => c.pick(["#4a5a3a", "#6b6a44", "#8e8656", "#b8a870"], 0.4 + 0.5 * c.n.y + 0.3 * (c.random(1) - 0.5)), {
  dither: true,
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const leafTex = (ramp: string[], w: number, h: number, bend: number) =>
  pixelTexture(w, h, (g) => {
    for (let y = 0; y < h; y++) {
      const t = (h - 1 - y) / (h - 1); // 0 at the stem (bottom row), 1 at the tip
      const half = Math.max(0.5, ((w - 1) / 2) * Math.sin(Math.PI * Math.pow(Math.min(t * 0.98 + 0.02, 1), 0.7)) * 1.05);
      const cx = (w - 1) / 2 + bend * t * t * (w * 0.3);
      for (let x = 0; x < w; x++) {
        const d = x - cx;
        if (Math.abs(d) <= half) {
          const edge = Math.abs(d) / half;
          let v = 0.3 + 0.45 * (d < 0 ? 1 : 0.55) * (1 - edge * 0.6) + 0.1 * bayer(x, y);
          if (Math.abs(d) < 0.6) v = 0.88; // midrib
          g.set(x, y, ramp[Math.min(ramp.length - 1, Math.max(0, Math.floor(v * ramp.length)))]);
        }
      }
    }
    g.set(Math.round((w - 1) / 2), h - 1, "#6b4a2e");
  });
const LEAF_A = leafTex(LEAF, 8, 22, 0.6);
const LEAF_B = leafTex(LEAF, 7, 18, -0.5);
const LEAF_FLAT = leafTex(["#6a5a2c", "#8a7a38", "#a8983f", "#c8b852", "#e4d578"], 8, 20, 0.4);

const tuftTex = (lo: number, hi: number) =>
  pixelTexture(6, 8, (g) => {
    for (let y = 0; y < 8; y++) {
      const t = (7 - y) / 7;
      const half = 2.9 * (1 - Math.pow(t, 1.6));
      for (let x = 0; x < 6; x++) {
        const d = x - 2.5;
        if (Math.abs(d) <= half) {
          const g255 = Math.round(255 * (lo + (hi - lo) * (0.35 + 0.65 * t + 0.1 * bayer(x, y)) * (d < 0 ? 1 : 0.9)));
          const c = Math.min(255, Math.max(0, g255)).toString(16).padStart(2, "0");
          g.set(x, y, `#${c}${c}${c}`);
        }
      }
    }
  });
const TUFT = tuftTex(0.7, 1.0);

const GRASS_TEX = pixelTexture(9, 10, (g) => {
  const blades = [
    [1, 6],
    [2, 9],
    [4, 10],
    [5, 7],
    [7, 9],
    [3, 5],
    [6, 5],
  ];
  blades.forEach(([x, h], i) => {
    for (let y = 0; y < h; y++) g.set(x + (y > h - 3 ? (i % 2 ? 1 : -1) * 0 : 0), 9 - y, GRASS[Math.min(4, 1 + Math.floor((y / h) * 4))]);
  });
});

const PEEL_TEX = pixelTexture(5, 12, (g) => {
  for (let y = 0; y < 12; y++) {
    const t = (11 - y) / 11;
    const half = 2.4 * (1 - t * 0.7);
    for (let x = 0; x < 5; x++)
      if (Math.abs(x - 2 - t * 0.8) <= half)
        g.set(x, y, BARK_PEEL[Math.min(3, Math.floor((0.2 + 0.5 * t + 0.35 * bayer(x, y)) * 4))]);
  }
});

// Skin sheet: nose, eyes and the plaque on the stand.
const layout = skinLayout({ nose: [8, 6, 5], eye: [4, 4, 2], plaque: [22, 14, 3] }, 64);
const SHEET = pixelTexture(layout.size[0], layout.size[1], (g) => {
  const n = layout.faces.nose;
  for (const r of Object.values(n)) g.fill(() => "#151012", r);
  g.fill((x, y) => (y === 0 ? "#2f262b" : y === 5 ? "#241c20" : "#151012"), n.pz);
  g.stamp(n.pz[0] + 1, n.pz[1] + 1, ["ppp", "pw."], { p: "#4d4048", w: "#8a7a84" });
  g.stamp(n.pz[0] + 2, n.pz[1] + 4, ["kk..kk"], { k: "#3a2d33" });
  for (const r of Object.values(layout.faces.eye)) g.fill(() => "#0e0a0c", r);
  const e = layout.faces.eye.pz;
  g.stamp(e[0] + 1, e[1] + 1, ["ww", "w."], { w: "#ffffff" });
  g.set(e[0] + 2, e[1] + 2, "#4a3b46");
  const p = layout.faces.plaque;
  for (const r of Object.values(p)) g.fill((x, y) => STONE[Math.min(3, 1 + Math.floor(((x + y) % 3) * 0.7))], r);
  g.fill((x, y, w, h) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#3c3a42" : (x + y * 3) % 7 === 0 ? "#7c7a84" : STONE[2]), p.pz);
  g.stamp(p.pz[0] + 3, p.pz[1] + 2, [
    "....................",
    ".........gg.........",
    "........gGGg........",
    ".......gGlGGg.......",
    "......gGGlGGGg...nn.",
    ".....gGGGlGGGGg.nNn.",
    "....gGGGGlGGGGg..nn.",
    "...gGGGGGlGGGg......",
    "..gGGGGGGlGGg.......",
    ".bbbggGGGlgg........",
  ], { g: "#2f6a50", G: "#46896a", l: "#98c8a2", b: "#6b4a2e", n: "#4a5a3a", N: "#8e8656" });
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "koalaSonnet", paintSize: 2048 });
  const rand = rng(20);

  // Skeleton root sits on the floor; the stand and tree ride on it.
  const stand = b.joint("stand", { at: [0, 0, 0] });

  // ---- Stand ---------------------------------------------------------------------------------------------------
  const R0 = 0.47;
  b.lathe(
    [
      [0, 0],
      [R0, 0],
      [R0, 0.05],
      [R0 - 0.04, 0.05],
      [R0 - 0.04, 0.085],
      [R0 - 0.07, 0.085],
      [R0 - 0.07, 0.11],
      [0, 0.11],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STAND_SIDE, bone: stand, name: "standSide" },
  );
  // grass cap: a slightly smaller disc of turf painted by the top paint
  b.lathe(
    [
      [0, 0.1],
      [R0 - 0.075, 0.1],
      [R0 - 0.075, 0.118],
      [0, 0.128],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STAND_TOP, bone: stand, name: "standTurf" },
  );

  // ---- Trunk and fork --------------------------------------------------------------------------------------------
  const trunkPath = catmull([
    [0, 0.07, -0.2],
    [0, 0.2, -0.21],
    [0, 0.36, -0.215],
    [0, 0.5, -0.22],
  ]);
  b.sweep(trunkPath, [0.125, 0.1, 0.09, 0.083], { bone: stand, color: BARK, sides: 8, name: "trunk" });
  // root flare
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const len = 0.17 + 0.06 * rand();
    b.sweep(
      catmull([
        [dx * 0.07, 0.17, -0.2 + dz * 0.07],
        [dx * (0.1 + len * 0.45), 0.12, -0.2 + dz * (0.1 + len * 0.45)],
        [dx * (0.1 + len), 0.095, -0.2 + dz * (0.1 + len)],
      ]),
      [0.038, 0.012],
      { bone: stand, color: BARK, sides: 6, name: "root" },
    );
  }

  const limbPts = (s: number) => [
    V(0, 0.46, -0.22),
    V(s * 0.08, 0.5, -0.17),
    V(s * 0.17, 0.54, -0.08),
    V(s * 0.25, 0.72, -0.03),
    V(s * 0.3, 0.95, 0.0),
    V(s * 0.31, 1.15, 0.0),
    V(s * 0.27, 1.42, 0.02),
    V(s * 0.2, 1.68, 0.04),
  ];
  const limbPaths = [1, -1].map((s) => catmull(limbPts(s)));
  const LIMB_R = [0.068, 0.062, 0.054, 0.05, 0.046, 0.038, 0.028, 0.018];
  [1, -1].forEach((s, i) => {
    const sw = b.sweep(limbPaths[i], LIMB_R, { bone: stand, color: BARK, sides: 8, name: `limb${s > 0 ? "L" : "R"}` });
    // a few dark knots and scars on the limb
    const skin = b.surface(sw);
    for (const hit of skin.scatter(7, { rng: rng(30 + i), minDist: 0.12, filter: (h) => Math.abs(h.n.y) < 0.6 })) {
      b.stick(new THREE.CylinderGeometry(0.014, 0.017, 0.012, 6), BARK_DARK, hit, { embed: 0.5, bone: stand });
    }
  });

  // knots and a broken stub on the trunk, peeling bark ribbons
  const trunkSurf = b.surface(b.root.getObjectByName("trunk") as THREE.Mesh);
  const stubHit = trunkSurf.around([0, 0.35, -0.215]).at(180, 10);
  if (stubHit) {
    b.stick(new THREE.CylinderGeometry(0.02, 0.026, 0.1, 7), "#8a7a62", stubHit, { embed: 0.3, bone: stand });
    b.stick(new THREE.CylinderGeometry(0.019, 0.019, 0.006, 7), "#4a3626", stubHit.moved([0, 0.095, 0]), { embed: 0.1, bone: stand });
  }
  const peelHits = trunkSurf.scatter(9, { rng: rng(77), minDist: 0.06, filter: (h) => h.n.z < 0.3 });
  b.cards(peelHits, PEEL_TEX, { size: [0.045, 0.1], lean: 55, bend: 40, vary: 0.25, rng: rng(78), flow: [0, 0.2, 1], bone: stand });

  // ---- Twigs, leaves, gumnuts ---------------------------------------------------------------------------------
  const nutGeos: THREE.BufferGeometry[] = [];
  const hangLeaves: ReturnType<typeof frame>[] = [];
  const addNut = (p: THREE.Vector3) => {
    nutGeos.push(new THREE.SphereGeometry(0.012, 5, 4).scale(1, 0.9, 1).translate(p.x, p.y, p.z));
    nutGeos.push(new THREE.CylinderGeometry(0.007, 0.011, 0.007, 5).translate(p.x, p.y + 0.011, p.z));
  };
  const addLeaves = (p: THREE.Vector3, n: number) => {
    for (let i = 0; i < n; i++) hangLeaves.push(frame(p.clone().add(V((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.02)), [0, 1, 0]));
  };
  const twig = (from: THREE.Vector3, dir: THREE.Vector3, len: number, curl: number, leaves: number, thick = 0.014) => {
    const d = dir.clone().normalize();
    const p1 = from.clone().addScaledVector(d, len * 0.35).add(V(0, 0.03, 0));
    const p2 = from.clone().addScaledVector(d, len * 0.7).add(V(0, 0.03 - curl * 0.4, 0));
    const p3 = from.clone().addScaledVector(d, len).add(V(0, -curl, 0));
    const path = catmull([from, p1, p2, p3]);
    b.sweep(path, [thick, thick * 0.35], { bone: stand, color: TWIG, sides: 5, name: "twig", caps: "point" });
    for (let i = 0; i < leaves; i++) {
      const t = 0.45 + (0.55 * (i + 1)) / leaves;
      addLeaves(path.at(Math.min(t, 1)), 2);
    }
    if (rand() < 0.7) addNut(path.at(0.6).add(V(0.0, -0.025, 0)));
    return path;
  };
  [1, -1].forEach((s, i) => {
    const lp = limbPaths[i];
    const spec: Array<[number, number, number, number, number, number]> = [
      [0.58, 1.0, 0.25, 0.3, 0.12, 5],
      [0.66, 0.9, -0.2, 0.34, 0.14, 6],
      [0.74, 1.0, 0.0, 0.4, 0.14, 7],
      [0.82, 0.7, 0.35, 0.32, 0.1, 5],
      [0.9, 0.5, -0.3, 0.28, 0.1, 5],
      [0.95, 0.4, 0.4, 0.3, 0.1, 5],
    ];
    for (const [t, out, fwd, len, curl, n] of spec) {
      const p = lp.at(t);
      twig(p, V(s * out, 0.35, fwd), len, curl, n);
    }
    const tip = lp.at(1);
    // crown of leaves at the end of each limb
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + (s > 0 ? 0.3 : 0.9);
      twig(tip, V(Math.sin(a) * 0.6 + s * 0.2, 0.7, Math.cos(a) * 0.6), 0.24, 0.1, 5, 0.012);
    }
    addLeaves(tip, 6);
  });
  // back branchlets from the trunk fork, so the tree has depth behind the koala
  twig(V(0.02, 0.43, -0.22), V(0.35, 0.8, -0.8), 0.45, 0.12, 6, 0.02);
  twig(V(-0.02, 0.4, -0.22), V(-0.4, 0.5, -0.8), 0.4, 0.1, 5, 0.018);

  // leaf cards: hanging gum leaves (two textures, random swing)
  b.cards(hangLeaves, [LEAF_A, LEAF_B, LEAF_A], {
    size: [0.062, 0.17],
    lean: 175,
    bend: 25,
    vary: 0.25,
    spin: 25,
    rng: rng(55),
    flow: () => V((rand() - 0.5) * 2, 0, (rand() - 0.3) * 2),
    bone: stand,
    name: "gumLeaves",
  });
  if (nutGeos.length) b.part(mergeGeometries(nutGeos), GUMNUT, { bone: stand, at: [0, 0, 0], name: "gumnuts" });

  // ---- Stand dressing --------------------------------------------------------------------------------------------
  const grassFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.1 + rand() * 0.3;
    grassFrames.push(frame([Math.sin(a) * r, 0.115, Math.cos(a) * r - 0.05], [0, 1, 0]));
  }
  b.cards(grassFrames, GRASS_TEX, { size: [0.07, 0.07], lean: 8, bend: 15, cross: true, vary: 0.3, spin: 180, rng: rng(91), bone: stand, name: "grass" });
  // fallen leaves lying on the turf
  const flat: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.18 + rand() * 0.2;
    flat.push(frame([Math.sin(a) * r, 0.1235 + i * 0.0003, Math.cos(a) * r + 0.02], [0, 1, 0]));
  }
  b.cards(flat, LEAF_FLAT, { size: [0.05, 0.13], lean: 90, mirror: true, flow: () => V(rand() - 0.5, 0, rand() - 0.5), vary: 0.2, rng: rng(5), bone: stand, name: "fallenLeaves" });
  // pebbles
  const rocks: Array<[number, number, number]> = [
    [0.27, 0.3, 0.035],
    [0.33, 0.22, 0.025],
    [-0.3, 0.26, 0.03],
    [-0.12, 0.36, 0.02],
    [0.1, 0.38, 0.022],
    [-0.36, -0.1, 0.028],
  ];
  rocks.forEach(([x, z, r], i) => {
    b.part(new THREE.IcosahedronGeometry(r, 0), ROCK, { bone: stand, at: [x, 0.122 + r * 0.25, z], rotation: [i * 40, i * 70, 0], scale: [1.2, 0.7, 1], name: "pebble" });
  });
  // plaque on the stand's front
  b.part(skinBox(SHEET, layout.faces.plaque, 0.01), "#ffffff", {
    texture: SHEET,
    bone: stand,
    at: [0, 0.19, 0.31],
    rotation: [-18, 0, 0],
    name: "plaque",
  });
  b.rod([-0.085, 0.12, 0.31], [-0.085, 0.14, 0.31], 0.012, { bone: stand, color: "#6b4a2e", name: "plaquePost" });
  b.rod([0.085, 0.12, 0.31], [0.085, 0.14, 0.31], 0.012, { bone: stand, color: "#6b4a2e", name: "plaquePost" });
  // toadstools
  const cap = stepped([[0, 3], [0, 3], [0, 2]].map(([a, c]) => [-c, c] as [number, number]), 0.01, { rows: true });
  void cap;
  const mushrooms: Array<[number, number, number]> = [
    [-0.31, 0.18, 0.05],
    [-0.35, 0.12, 0.035],
    [0.34, -0.12, 0.04],
  ];
  mushrooms.forEach(([x, z, r]) => {
    b.rod([x, 0.118, z], [x, 0.118 + r * 1.5, z], r * 0.3, { bone: stand, color: "#e8dcc0", sides: 6, name: "stem" });
    b.lathe(
      [
        [0, 0],
        [r, 0],
        [r * 0.85, r * 0.5],
        [0, r * 0.75],
      ],
      { at: [x, 0.118 + r * 1.3, z], bone: stand, segments: 7, color: cellPaint(0.008, (c) => (c.random(2) < 0.18 ? "#f4ecd6" : c.pick(["#8a2a26", "#b23a30", "#d4503a"], 0.4 + 0.5 * c.n.y)), { dither: true }), name: "cap" },
    );
  });

  // ==================================================================================================================
  // KOALA
  // ==================================================================================================================
  const spinePts: [number, number, number][] = [
    [0, 0.6, -0.05],
    [0, 0.74, -0.035],
    [0, 0.9, 0.005],
    [0, 1.04, 0.05],
  ];
  const spine = b.chain("spine", catmull(spinePts), { parent: stand, names: ["pelvis", "spine2", "spine3"], role: "spine" });
  const pelvis = spine.joints[0];
  const chest = spine.joints[2];
  const RX = [0.175, 0.19, 0.17, 0.13];
  const RY = [0.15, 0.175, 0.15, 0.12];
  const body = b.sweep(spine, (t) => [key(RX, t), key(RY, t)], { color: bodyFur, sides: 10, name: "body" });
  // rump
  b.part(new THREE.SphereGeometry(0.16, 8, 6), bodyFur, { bone: pelvis, at: [0, 0.54, -0.07], scale: [1.05, 0.72, 0.95], name: "rump" });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), "#ddd8cc", { bone: pelvis, at: [0, 0.5, -0.2], name: "tailStub" });

  // neck and head
  const neck = b.chain("neck", [V(0, 1.04, 0.05), V(0, 1.12, 0.08)], { parent: chest, names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.13, 0.085], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.1, 0.075], dir: [0, 0, 1], role: "jaw" });
  const hc = V(0, 1.18, 0.09);
  b.part(new THREE.SphereGeometry(0.118, 10, 8), headFur, { bone: head, at: hc, scale: [1.12, 0.9, 1.0], name: "skull" });
  // fluffy cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.062, 7, 5), headFur, { bone: head, at: [s * 0.1, 1.12, 0.115], scale: [0.9, 0.9, 1], name: "cheek" });
  }
  // muzzle (upper jaw)
  b.part(new THREE.SphereGeometry(0.07, 8, 6), muzzleFur, { bone: head, at: [0, 1.135, 0.185], scale: [1.15, 0.8, 1.05], name: "muzzle" });
  // lower jaw
  b.part(new THREE.SphereGeometry(0.058, 8, 5), muzzleFur, { bone: jaw, at: [0, 1.085, 0.16], scale: [1.2, 0.5, 1.15], name: "lowerJaw" });
  // nose, eyes
  b.part(skinBox(SHEET, layout.faces.nose, 0.01), "#ffffff", { texture: SHEET, bone: head, at: [0, 1.168, 0.243], name: "nose" });
  for (const s of [1, -1]) {
    b.part(skinBox(SHEET, layout.faces.eye, 0.008), "#ffffff", { texture: SHEET, bone: head, at: [s * 0.066, 1.205, 0.188], name: "eye" });
    // brow tuft and cheek tuft shadow bars
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.02), "#3b3536", { bone: head, at: [s * 0.068, 1.232, 0.178], rotation: [0, 0, s * -10], name: "brow" });
  }
  // mouth line
  b.sweep(polyline([V(-0.04, 1.105, 0.236), V(-0.018, 1.098, 0.252), V(0.018, 1.098, 0.252), V(0.04, 1.105, 0.236)]), 0.004, { bone: head, color: "#2b2024", sides: 4, name: "mouth" });

  // ears: big round fluffy discs, outer fur, pale inner, rim tufts
  const R_CELLS = 5;
  const CELL = 0.0175;
  const earOuter = stepped(
    Array.from({ length: 2 * R_CELLS }, (_, i) => {
      const dy = i - R_CELLS + 0.5;
      const hw = Math.round(Math.sqrt(R_CELLS * R_CELLS - dy * dy - 0.5));
      return [-hw, hw] as [number, number];
    }),
    CELL,
    { rows: true, start: -R_CELLS },
  );
  const earInner = stepped(
    Array.from({ length: 2 * (R_CELLS - 2) }, (_, i) => {
      const dy = i - (R_CELLS - 2) + 0.5;
      const hw = Math.round(Math.sqrt((R_CELLS - 1.6) * (R_CELLS - 1.6) - dy * dy));
      return [-hw, hw] as [number, number];
    }),
    CELL,
    { rows: true, start: -(R_CELLS - 2) },
  );
  const earFur = fur(0.0175, (c) => (c.n.y > 0 ? 0 : 0) - 0.05);
  const earIn = cellPaint(
    0.0175,
    (c) => {
      const r = Math.hypot(c.at.x - c.at.x, 0) + c.random(3) * 0.4;
      return c.pick(EARIN, 0.5 + 0.8 * (c.random(5) - 0.5) + r * 0.2 + 0.2 * c.n.z);
    },
    { dither: true },
  );
  for (const s of [1, -1]) {
    const n = V(s * 0.72, 0.3, 0.62).normalize();
    const xd = V(0, 1, 0).cross(n).normalize();
    const yd = n.clone().cross(xd);
    const centre = V(s * 0.132, 1.262, 0.04);
    const earJoint = b.joint(`ear${s > 0 ? "L" : "R"}`, { parent: head, at: centre, dir: yd, role: "hinge" });
    b.extrude(earOuter, { at: centre, x: xd, y: yd, thickness: 0.032, color: earFur, bone: earJoint, name: "earOuter" });
    b.extrude(earInner, { at: centre.clone().addScaledVector(n, 0.008), x: xd, y: yd, thickness: 0.026, color: earIn, bone: earJoint, name: "earInner" });
    const rim = b.ring(frame(centre, n.toArray() as [number, number, number]), { count: 18, radius: 0.088 });
    b.cards(rim.items, TUFT, { size: [0.034, 0.05], lean: 20, flow: n, rng: rng(15), vary: 0.2, color: "#f2eee6", bone: earJoint, name: "earTufts" });
  }

  // fur tuft cards: shaggy silhouette
  const bodyHits = b.surface(body).scatter(150, { rng: rng(61), minDist: 0.045, filter: (h) => h.n.y > -0.4 });
  b.cards(bodyHits, TUFT, { size: [0.05, 0.075], lean: 62, bend: 25, vary: 0.25, rng: rng(62), color: bodyFur, name: "bodyTufts" });
  const chestHits = b.surface(body).scatter(70, { rng: rng(63), minDist: 0.03, filter: (h) => h.n.z > 0.35 && h.at.y > 0.8 });
  b.cards(chestHits, TUFT, { size: [0.04, 0.055], lean: 70, bend: 20, vary: 0.2, rng: rng(64), color: "#f4f0e6", name: "chestTufts" });

  // ---- Arms: shoulder, elbow, wrist, five digits wrapped around the fork limbs ------------------------------------
  const clawGeo = () => new THREE.ConeGeometry(0.0075, 0.03, 4);
  const digits = (wrist: ReturnType<typeof b.joint>, ctr: THREE.Vector3, rLimb: number, s: number, side: string, start: number, y0: number, n: number, rad: number, len: number) => {
    const R = rLimb + rad * 0.9;
    for (let i = 0; i < n; i++) {
      const y = y0 + (i - (n - 1) / 2) * rad * 2.1;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k < 4; k++) {
        const a = ((start + (len * k) / 3) * Math.PI) / 180;
        pts.push(V(ctr.x + s * R * Math.sin(a), y, ctr.z + R * Math.cos(a)));
      }
      const dch = b.chain(`digit${side}${i + 1}${wrist.name.slice(0, 5)}`, catmull(pts), {
        parent: wrist,
        names: [`${wrist.name}_d${i + 1}a`, `${wrist.name}_d${i + 1}b`, `${wrist.name}_d${i + 1}c`],
        role: "digit",
      });
      b.sweep(dch, [rad, rad * 0.8, rad * 0.65], { color: pawSkin, sides: 6, name: "digit" });
      const end = dch.at(1);
      b.spike(end, end, 0.028, 0.0075, { color: CLAW, name: "claw", bone: dch.joints[2] });
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const lp = limbPaths[s > 0 ? 0 : 1];
    // hand grips the limb at y = 1.08
    const ctr = lp.at(lp.closestT(V(s * 0.3, 1.08, 0)));
    const handY = ctr.y;
    const handTarget = V(ctr.x - s * 0.033, handY, ctr.z + 0.045);
    const shoulder = V(s * 0.135, 1.0, 0.04);
    const pts = limb(shoulder, handTarget, [0.15, 0.15], [V(s * 0.4, -0.5, 1)]);
    const arm = b.chain(`arm${side}`, pts, { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    b.sweep(arm, [0.072, 0.062, 0.05], { color: limbFur, sides: 8, name: "arm" });
    const wrist = arm.tip!;
    // palm pad
    b.rod(V(handTarget.x, handY - 0.06, handTarget.z), V(handTarget.x, handY + 0.06, handTarget.z), 0.028, { bone: wrist, color: pawSkin, sides: 6, name: "palm" });
    digits(wrist, ctr, 0.046, s, side, -40, handY, 5, 0.0125, 160);
    // fur cuffs
    const cuff = b.ring(arm.at(0.5), { count: 8, radius: 0.062 });
    b.cards(cuff.items, TUFT, { size: [0.04, 0.05], lean: 70, flow: [0, -0.3, -1], vary: 0.2, rng: rng(70 + s), color: limbFur, name: "armTufts" });
  }

  // ---- Legs: hip, knee, ankle, five toes gripping the lower fork limbs ------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const lp = limbPaths[s > 0 ? 0 : 1];
    const ctr = lp.at(lp.closestT(V(s * 0.18, 0.56, -0.07)));
    const ankleTarget = V(ctr.x - s * 0.03, ctr.y, ctr.z + 0.048);
    const hip = V(s * 0.12, 0.64, -0.03);
    const pts = limb(hip, ankleTarget, [0.18, 0.2], [V(s * 0.3, 0.3, 1)]);
    const leg = b.chain(`leg${side}`, pts, { parent: pelvis, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, [0.085, 0.068, 0.052], { color: limbFur, sides: 8, name: "leg" });
    const ankle = leg.tip!;
    b.rod(V(ankleTarget.x, ctr.y - 0.055, ankleTarget.z), V(ankleTarget.x, ctr.y + 0.05, ankleTarget.z), 0.026, { bone: ankle, color: pawSkin, sides: 6, name: "sole" });
    digits(ankle, ctr, 0.05, s, side, -40, ctr.y, 5, 0.0115, 150);
  }

  return b.root;
}
