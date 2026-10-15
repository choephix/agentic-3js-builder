import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { noise } from "../../../../src/paint";
import { cellPaint, pixelArt, snapColor } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Stand",
  description: "A chunky voxel-style koala sitting on a eucalyptus branch, hands and feet gripping, on a round wooden stand.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const snap = (c: string) => snapColor(c, 64);

const GREY = ["#3f424c", "#5b5f6b", "#7b7f8b", "#9a9ea9", "#b7bac3"].map(snap);
const CREAM = ["#a9a18f", "#c9c1ac", "#e6dfca", "#f6f1e2"].map(snap);
const BARK = ["#3b2c22", "#56402f", "#7a5a40", "#9d7a58", "#b8a07c"].map(snap);
const WOOD = ["#4a2f1a", "#63401f", "#7e5528", "#9a6b34"].map(snap);

const FUR = cellPaint(
  TEXEL,
  (c) => c.pick(GREY, 0.5 + 0.28 * c.n.y + 0.45 * (noise(c.at, 0.07, 3) - 0.5) + (c.random(5) < 0.08 ? 0.18 : 0)),
  { dither: true },
);
const FUR_DARK = cellPaint(TEXEL, (c) => c.pick(GREY, 0.2 + 0.3 * (noise(c.at, 0.06, 8) - 0.5) + 0.15 * c.n.y), { dither: true });
const FLUFF = cellPaint(
  TEXEL,
  (c) => c.pick(CREAM, 0.6 + 0.2 * c.n.y + 0.5 * (noise(c.at, 0.06, 4) - 0.5) + (c.random(9) < 0.1 ? -0.2 : 0)),
  { dither: true },
);
const PINK = cellPaint(TEXEL / 2, (c) => c.pick(["#a85a6a", "#d98a95", "#f0b0b4"].map(snap), 0.5 + 0.4 * (c.random(2) - 0.5)));
const BARKP = cellPaint(
  TEXEL,
  (c) => {
    const streak = noise(c.at.clone().multiply(new THREE.Vector3(6, 0.5, 6)), 0.1, 6);
    return c.pick(BARK, 0.25 + 0.65 * streak + 0.15 * c.n.y + (c.random(4) < 0.06 ? 0.3 : 0));
  },
  { dither: true },
);
const WOODP = cellPaint(TEXEL, (c) => c.pick(WOOD, 0.45 + 0.4 * (noise(c.at.clone().multiply(new THREE.Vector3(1, 8, 1)), 0.08, 2) - 0.5) + 0.2 * c.n.y), { dither: true });

const LEAF = pixelArt(
  [
    "....g....",
    "...gGg...",
    "..gGGGg..",
    "..gGlGg..",
    ".gGGlGGg.",
    ".gGGlGGg.",
    ".gGGlGGg.",
    "..gGlGg..",
    "..gGlGg..",
    "...gGg...",
    "...gGg...",
    "....l....",
    "....l....",
  ],
  { g: "#2f6b4a", G: "#5a9a78", l: "#a9cfae" },
);
const EYE = pixelArt(["kkw", "kkk", "kkk"], { k: "#0b0a10", w: "#ffffff" });

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "koala" });
  const R = rng(11);

  const box = (size: [number, number, number], at: [number, number, number], color: any, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation });

  // ---------- stand ----------
  b.part(new THREE.CylinderGeometry(0.3, 0.33, 0.06, 8), WOODP, { at: [0, 0.03, -0.1] });
  b.part(new THREE.CylinderGeometry(0.26, 0.28, 0.025, 8), WOODP, { at: [0, 0.0725, -0.1] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    box([0.03, 0.02, 0.03], [Math.sin(a) * 0.31, 0.04, -0.1 + Math.cos(a) * 0.31], "#3a2412");
  }

  // ---------- trunk and branches ----------
  const trunk = b.sweep(
    catmull([
      [0, 0.06, -0.25],
      [0.01, 0.4, -0.26],
      [-0.01, 0.8, -0.29],
      [0.02, 1.1, -0.3],
    ]),
    [0.075, 0.04],
    { color: BARKP, sides: 8, caps: "flat" },
  );
  const branch = b.sweep(
    catmull([
      [0, 0.38, -0.27],
      [0, 0.43, -0.1],
      [0, 0.46, 0.15],
      [0, 0.5, 0.42],
    ]),
    [0.048, 0.03],
    { color: BARKP, sides: 8, caps: "flat" },
  );
  const upper = b.sweep(
    catmull([
      [0, 0.85, -0.29],
      [0.12, 1.0, -0.3],
      [0.26, 1.18, -0.28],
    ]),
    [0.03, 0.018],
    { color: BARKP, sides: 6, caps: "flat" },
  );
  // knots, root flare, stubs
  box([0.06, 0.05, 0.05], [0.05, 0.62, -0.3], "#4a3626");
  box([0.05, 0.05, 0.05], [-0.06, 0.95, -0.31], "#4a3626");
  for (const s of [1, -1]) {
    b.rod([s * 0.07, 0.06, -0.25], [s * 0.1, 0.02, -0.18], [0.025, 0.012], { color: BARKP, sides: 6 });
    b.rod([s * 0.06, 0.07, -0.3], [s * 0.1, 0.02, -0.36], [0.025, 0.012], { color: BARKP, sides: 6 });
  }
  box([0.05, 0.03, 0.05], [0, 0.55, 0.43], "#5b4430");
  box([0.04, 0.04, 0.04], [0.04, 0.5, 0.45], "#6b5238");

  // leaves
  const leafSets: Array<[any, number, number]> = [
    [trunk, 36, 0.09],
    [upper, 14, 0.08],
    [branch, 8, 0.1],
  ];
  leafSets.forEach(([tgt, n, md], i) => {
    const hits = b.surface(tgt).scatter(n, { rng: rng(20 + i), minDist: md, filter: (h) => h.n.y > -0.3 });
    b.cards(hits, LEAF, { size: [0.07, 0.17], lean: 55, bend: 25, vary: 0.3, spin: 180, rng: rng(30 + i), cross: true });
  });
  // leaf crown at the top
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.PlaneGeometry(0.1, 0.22), "#ffffff", {
      at: [0.02 + Math.sin(a) * 0.05, 1.18, -0.3 + Math.cos(a) * 0.05],
      dir: [Math.sin(a) * 0.8, 0.6, Math.cos(a) * 0.8],
      axis: "y",
      texture: LEAF,
    });
  }

  // ---------- koala ----------
  // body
  box([0.32, 0.34, 0.26], [0, 0.66, 0.0], FUR);
  box([0.38, 0.2, 0.3], [0, 0.58, -0.01], FUR_DARK); // haunches
  box([0.26, 0.26, 0.04], [0, 0.66, 0.14], FLUFF); // chest patch
  box([0.2, 0.1, 0.04], [0, 0.78, 0.13], FLUFF);
  box([0.3, 0.1, 0.1], [0, 0.55, -0.12], FLUFF); // rump fluff
  box([0.12, 0.1, 0.06], [0, 0.5, 0.06], FUR_DARK);
  // back shading blocks
  box([0.28, 0.2, 0.04], [0, 0.72, -0.14], FUR_DARK);

  // head
  box([0.3, 0.24, 0.22], [0, 0.94, 0.07], FUR);
  box([0.26, 0.06, 0.2], [0, 1.06, 0.07], FUR_DARK); // brow/top darker
  for (const s of [1, -1]) {
    // cheek fluff
    box([0.05, 0.12, 0.14], [s * 0.16, 0.9, 0.07], FLUFF);
    box([0.04, 0.05, 0.1], [s * 0.18, 0.84, 0.06], FLUFF);
    // ears: big round with fluff rim and pink inner
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.03, 8), FLUFF, { at: [s * 0.16, 1.06, 0.02], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), FUR_DARK, { at: [s * 0.16, 1.06, -0.005], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), PINK, { at: [s * 0.16, 1.055, 0.03], rotation: [90, 0, 0] });
    box([0.03, 0.04, 0.03], [s * 0.2, 1.1, 0.04], FLUFF);
    box([0.03, 0.03, 0.03], [s * 0.12, 1.12, 0.04], FLUFF);
    // eyes
    b.part(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", { at: [s * 0.075, 0.975, 0.1815], dir: [0, 0, 1], axis: "z", texture: EYE });
    box([0.05, 0.015, 0.01], [s * 0.075, 1.007, 0.181], FUR_DARK);
  }
  // muzzle + nose
  box([0.14, 0.1, 0.05], [0, 0.9, 0.185], FLUFF);
  box([0.09, 0.115, 0.06], [0, 0.935, 0.205], "#14121a");
  box([0.03, 0.02, 0.01], [-0.015, 0.97, 0.237], "#4a4a58");
  box([0.1, 0.012, 0.012], [0, 0.865, 0.212], "#2a1a1e");
  box([0.012, 0.03, 0.012], [0, 0.88, 0.212], "#2a1a1e");
  // forehead tuft
  box([0.06, 0.04, 0.04], [0, 1.08, 0.12], FLUFF);

  // arms gripping branch
  for (const s of [1, -1]) {
    b.rod([s * 0.19, 0.78, 0.03], [s * 0.1, 0.54, 0.2], [0.055, 0.045], { color: FUR, sides: 6 });
    box([0.05, 0.1, 0.05], [s * 0.17, 0.73, 0.06], FUR_DARK);
    // hand wrapping branch
    box([0.075, 0.07, 0.085], [s * 0.095, 0.52, 0.22], FUR_DARK);
    box([0.07, 0.03, 0.05], [s * 0.095, 0.5, 0.27], FUR_DARK);
    for (let k = -1; k <= 1; k++) {
      box([0.017, 0.017, 0.04], [s * 0.095 + k * 0.022, 0.47, 0.285], "#e9e2cf");
      box([0.012, 0.012, 0.012], [s * 0.095 + k * 0.022, 0.462, 0.31], "#2b2523");
    }
    // legs
    b.rod([s * 0.17, 0.6, -0.02], [s * 0.15, 0.51, 0.13], [0.075, 0.06], { color: FUR, sides: 6 });
    box([0.09, 0.055, 0.1], [s * 0.12, 0.49, 0.14], FUR_DARK);
    box([0.06, 0.03, 0.04], [s * 0.12, 0.47, 0.2], FLUFF);
    for (let k = -1; k <= 1; k++) {
      box([0.017, 0.017, 0.035], [s * 0.12 + k * 0.022, 0.455, 0.215], "#e9e2cf");
    }
  }
  // fur tufts hanging off the body
  for (let i = 0; i < 10; i++) {
    const a = R() * Math.PI * 2;
    box([0.03, 0.03, 0.03], [Math.sin(a) * 0.19, 0.5 + R() * 0.3, Math.cos(a) * 0.14 - 0.02], R() < 0.5 ? FLUFF : FUR);
  }

  return b.root;
}
