```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull } from "agentic-3js-builder";
import { cellPaint, pixelArt, bayer } from "agentic-3js-builder/kits/pixel";
import { noise } from "agentic-3js-builder";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description: "Pixel-art koala sitting on a branch of a eucalyptus stand, gripping it with hands and feet.",
};

const GREYS = ["#3f414b", "#5a5d68", "#777a86", "#979aa5", "#b4b7c0"];
const CREAM = ["#d9cfb4", "#ece3cb", "#f7f1de"];
const BARK = ["#4b3a2c", "#65503b", "#7d6650", "#9a8468"];
const WOODS = ["#5a3d24", "#74502f", "#8d6639"];
const DARK = "#17141c";
const PINK = "#e79aa4";

const fur = cellPaint(
  0.02,
  (c) => {
    const belly = c.n.z > 0.35 && c.at.y < 1.0 && c.at.y > 0.6 && Math.abs(c.at.x) < 0.16;
    const v = 0.5 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.09, 3) - 0.5);
    return belly ? c.pick(CREAM, 0.55 + 0.4 * (noise(c.at, 0.06, 8) - 0.5)) : c.pick(GREYS, v);
  },
  { dither: true },
);
const cream = cellPaint(0.02, (c) => c.pick(CREAM, 0.5 + 0.4 * (noise(c.at, 0.05, 4) - 0.5) + 0.2 * c.n.y), { dither: true });
const bark = cellPaint(
  0.022,
  (c) => {
    const streak = noise([c.at.x * 6, c.at.y * 0.8, c.at.z * 6] as any, 0.1, 5);
    return c.pick(BARK, 0.35 + 0.6 * streak + 0.15 * (c.random(1) - 0.5));
  },
  { dither: true },
);
const wood = cellPaint(0.02, (c) => c.pick(WOODS, 0.4 + 0.5 * c.n.y + 0.3 * (c.random(2) - 0.5)), { dither: true });

const EYE = pixelArt(["wkk", "kkk", "kkk"], { w: "#ffffff", k: DARK });
const LEAF = pixelArt(
  ["..l..", ".lgg.", ".lgg.", "lggG.", "lgGg.", ".gGg.", ".gGg.", ".gGg.", "..Gg.", "..G..", "..G..", "..G.."],
  { l: "#b9d889", g: "#6fa25a", G: "#3f7448" },
);

export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(11);

  const stand = b.joint("stand", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: stand, at: [0, 0.72, 0.02], dir: [0, 1, 0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    [[0, 0.72, 0.02], [0, 0.86, 0.07], [0, 1.0, 0.1]],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: "chest", at: [0, 1.0, 0.11], dir: [0, 1, 0.2], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.04, 0.13], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.04, 0.14], aim: [0, 1.03, 0.32], role: "jaw" });

  const box = (w: number, h: number, d: number, color: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  // ---- stand: base, trunk, branch
  b.part(new THREE.CylinderGeometry(0.5, 0.54, 0.06, 8), wood, { bone: stand, at: [0, 0.03, 0.05] });
  b.part(new THREE.CylinderGeometry(0.4, 0.44, 0.03, 8), "#8d6639", { bone: stand, at: [0, 0.075, 0.05] });
  const trunk = b.sweep([[0, 0.08, -0.22], [0, 1.45, -0.22]], [0.1, 0.07], {
    bone: stand, color: bark, section: { ngon: 7 }, caps: "flat",
  });
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7;
    box(0.05, 0.06, 0.02, "#2e2219", [Math.sin(a) * 0.1, 0.4 + i * 0.28, -0.22 + Math.cos(a) * 0.1], stand, { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  b.rod([0, 0.48, -0.22], [0, 0.55, 0.64], [0.05, 0.035], bark, { bone: stand, section: { ngon: 6 } });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.02, 6), "#c9a36a", { bone: stand, at: [0, 0.555, 0.655], dir: [0, 0.1, 1] });

  // ---- body
  b.sweep(spine, (t) => [0.2 + 0.02 * Math.sin(t * 3), 0.17], { color: fur });
  box(0.22, 0.09, 0.03, cream, [0, 0.96, 0.25], "chest"); // chest ruff
  // rump bump
  b.part(new THREE.SphereGeometry(0.17, 7, 5), fur, { bone: hips, at: [0, 0.65, -0.02], scale: [1.1, 0.8, 1] });

  // ---- head
  box(0.36, 0.24, 0.29, fur, [0, 1.14, 0.155], head);
  box(0.3, 0.06, 0.25, fur, [0, 1.3, 0.14], head); // brow top step
  box(0.2, 0.06, 0.2, cream, [0, 1.0, 0.2], jaw);
  box(0.1, 0.08, 0.06, DARK, [0, 1.0, 0.3], jaw, { }); // chin pad
  // nose
  box(0.1, 0.14, 0.06, DARK, [0, 1.14, 0.31], head);
  box(0.03, 0.03, 0.01, "#6b6a7a", [-0.02, 1.18, 0.345], head);
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", { bone: head, at: [s * 0.105, 1.19, 0.302], dir: [0, 0, 1], axis: "z", texture: EYE });
    box(0.06, 0.015, 0.02, "#4a4b56", [s * 0.105, 1.225, 0.3], head);
    // cheek fluff
    box(0.07, 0.11, 0.14, cream, [s * 0.185, 1.08, 0.18], head);
    box(0.05, 0.06, 0.1, cream, [s * 0.215, 1.03, 0.16], head);
    // ears
    const e = [s * 0.19, 1.27, 0.1];
    b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.03, 8), cream, { bone: head, at: [e[0], e[1], e[2] - 0.012], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.04, 8), fur, { bone: head, at: e, dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 8), PINK, { bone: head, at: [e[0], e[1] - 0.005, e[2] + 0.02], dir: [0, 0, 1] });
    for (let k = 0; k < 3; k++)
      box(0.025, 0.035, 0.02, cream, [e[0] + s * (k - 1) * 0.03, e[1] - 0.075 + Math.abs(k - 1) * 0.01, e[2] + 0.045], head);
  }

  // ---- limbs
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${N}`,
      [[s * 0.2, 0.9, 0.1], [s * 0.28, 0.76, 0.26], [s * 0.07, 0.62, 0.42]],
      { parent: "chest", names: [`shoulder${N}`, `elbow${N}`, `hand${N}`], role: "arm" },
    );
    b.sweep(arm, [0.065, 0.05], { color: fur });
    const hand = arm.tip!;
    box(0.09, 0.05, 0.08, DARK, [s * 0.07, 0.6, 0.43], hand);
    for (let k = 0; k < 3; k++) {
      box(0.022, 0.03, 0.06, DARK, [s * (0.07 + (k - 1) * 0.027), 0.575, 0.47], hand);
      box(0.012, 0.012, 0.03, "#d8d2c0", [s * (0.07 + (k - 1) * 0.027), 0.56, 0.51], hand);
    }
    const leg = b.chain(
      `leg${N}`,
      [[s * 0.15, 0.7, 0.04], [s * 0.27, 0.62, 0.2], [s * 0.08, 0.6, 0.27]],
      { parent: hips, names: [`hip${N}`, `knee${N}`, `foot${N}`], role: "leg" },
    );
    b.sweep(leg, [0.09, 0.055], { color: fur });
    const foot = leg.tip!;
    box(0.1, 0.05, 0.09, DARK, [s * 0.08, 0.58, 0.28], foot);
    for (let k = 0; k < 2; k++) box(0.03, 0.03, 0.05, DARK, [s * (0.07 + (k - 0.5) * 0.04), 0.56, 0.33], foot);
    box(0.012, 0.012, 0.03, "#d8d2c0", [s * 0.09, 0.545, 0.36], foot);
  }

  // ---- eucalyptus foliage
  const twigs: number[][][] = [
    [[0, 1.38, -0.22], [0.22, 1.5, -0.12], [0.5, 1.58, 0.0]],
    [[0, 1.3, -0.22], [-0.2, 1.42, -0.18], [-0.52, 1.46, -0.05]],
    [[0, 1.42, -0.22], [0.02, 1.55, -0.05], [0.0, 1.64, 0.2]],
  ];
  const leafFrames: any[] = [];
  for (const tw of twigs) {
    const path = catmull(tw);
    b.sweep(path, [0.028, 0.012], "#6b5a45", { bone: stand });
    for (let i = 0; i < 7; i++) {
      const t = 0.2 + (i / 6) * 0.8;
      const p = path.at(t);
      for (const s of [1, -1]) {
        const d = [s * 0.6 + (R() - 0.5) * 0.3, 0.2 + (R() - 0.5) * 0.4, (R() - 0.5) * 0.8];
        leafFrames.push(frame([p.x, p.y, p.z], d));
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const z = 0.4 + i * 0.045;
    leafFrames.push(frame([0, 0.52 + z * 0.1 + 0.03, z], [(i % 2 ? 1 : -1) * 0.8, 0.3, 0.2]));
  }
  b.cards(leafFrames, LEAF, { size: [0.09, 0.2], lean: 55, vary: 0.3, cross: true, rng: rng(5), spin: 30, bone: stand });

  return b.root;
}
```