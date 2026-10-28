import * as THREE from "three";
import { createBuilder, rng, noise, catmull, limb, frame } from "../../../../src/index";
import { cellPaint, pixelArt, bayer } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description: "Pixel-art koala sitting on a branch stand, gripping the rails with claws, eucalyptus leaves above.",
};

const FURR = ["#4a4d58", "#6c7080", "#8d909c", "#b0b3bd", "#d4d6dc"];
const FUR = cellPaint(0.025, (c) => c.pick(FURR, 0.45 + 0.3 * c.n.y + 0.15 * c.n.z + 0.5 * (noise(c.at, 0.1, 3) - 0.5)), { dither: true });
const FURHEAD = cellPaint(0.02, (c) => c.pick(FURR, 0.5 + 0.25 * c.n.y + 0.4 * (noise(c.at, 0.08, 5) - 0.5)), { dither: true });
const BARKR = ["#3a2616", "#5a3d24", "#7a5a38", "#977450"];
const BARK = cellPaint(0.025, (c) => c.pick(BARKR, 0.4 + 0.3 * c.n.y + 0.7 * (noise(c.at, 0.07, 9) - 0.5)), { dither: true });
const WOOD = cellPaint(0.03, (c) => c.pick(["#6b4a2a", "#86613a", "#a07b4c"], 0.4 + 0.3 * c.n.y + 0.4 * c.random(2)));
const NOSE = "#16141a";
const CREAM = "#ecebe4";
const PINK = "#d9a0a8";
const CLAW = "#2a2622";
const EYE = "#0c0b10";

const LEAF = pixelArt(
  [
    "....gg....",
    "...gGGg...",
    "..gGGLGg..",
    "..gGLLGg..",
    ".gGGLGGGg.",
    ".gGGLGGGg.",
    ".gGLLGGGg.",
    "..gGLGGg..",
    "..gGLGg...",
    "...gLg....",
    "....L.....",
    "....L.....",
  ],
  { g: "#3e6a4a", G: "#5d8f62", L: "#a9c9a0" },
);

export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(11);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.66, -0.05], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.05],
      [0, 0.82, 0.0],
      [0, 1.0, 0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const HC: [number, number, number] = [0, 1.19, 0.09];
  const head = b.joint("head", { parent: chest, at: [0, 1.04, 0.05], aim: [0, 1.15, 0.09], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.13, 0.12], aim: [0, 1.13, 0.3], role: "jaw" });

  // ---------------- stand
  const S = { bone: hips };
  b.part(new THREE.CylinderGeometry(0.5, 0.55, 0.07, 8), WOOD, { ...S, at: [0, 0.035, -0.02] });
  b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 8), BARK, { ...S, at: [0, 0.08, -0.02] });
  b.rod([0, 0.07, -0.24], [0, 1.45, -0.24], [0.075, 0.04], BARK, { ...S, sides: 7 });
  const rail = (y: number, z: number, h: number) => {
    b.rod([-0.42, y, z], [0.42, y, z], 0.042, BARK, { ...S, sides: 6 });
    b.rod([0, y, -0.24], [0, y, z], 0.03, BARK, { ...S, sides: 6 });
    for (const s of [1, -1]) b.part(box(0.05, 0.05, 0.05), BARKR[1], { ...S, at: [s * 0.43, y, z] });
    if (h) for (const s of [1, -1]) b.rod([s * 0.3, 0.07, z], [s * 0.3, y - 0.03, z], 0.03, BARK, { ...S, sides: 6 });
  };
  rail(0.5, 0.0, 1);
  rail(0.25, 0.17, 1);

  // eucalyptus leaves
  const twigs = [
    [[0, 1.2, -0.24], [0.2, 1.4, -0.2], [0.42, 1.52, -0.12], [0.55, 1.62, -0.05]],
    [[0, 1.3, -0.24], [-0.2, 1.45, -0.2], [-0.38, 1.58, -0.12], [-0.5, 1.7, -0.08]],
    [[0, 1.4, -0.24], [0.05, 1.6, -0.2], [-0.03, 1.78, -0.18], [0.05, 1.92, -0.16]],
  ];
  for (const t of twigs) {
    const path = catmull(t as number[][]);
    b.sweep(path, [0.022, 0.008], { ...S, color: BARKR[2] });
    const fr: any[] = [];
    b.along(path, 7, (a: any) => {
      fr.push(a);
    });
    b.cards(fr, LEAF, { size: [0.11, 0.2], lean: 65, cross: true, vary: 0.3, spin: 180, rng: R, bone: hips, flow: [0.6, -0.2, 0.5] });
  }

  // ---------------- koala body
  b.sweep(spine, [0.2, 0.22, 0.2, 0.15], { color: FUR });
  // belly patch
  b.part(new THREE.SphereGeometry(1, 8, 6), "#c8cad2", { bone: spine.joints[1], at: [0, 0.82, 0.14], scale: [0.14, 0.17, 0.08] });

  // head
  b.part(new THREE.SphereGeometry(1, 10, 8), FURHEAD, { bone: head, at: HC, scale: [0.2, 0.17, 0.17] });
  // cheek ruffs
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 5), "#c4c6ce", { bone: head, at: [s * 0.15, 1.14, 0.1], scale: [0.06, 0.07, 0.07] });
    // ears
    b.part(new THREE.SphereGeometry(1, 8, 6), FURHEAD, { bone: head, at: [s * 0.17, 1.3, 0.04], scale: [0.1, 0.1, 0.05] });
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [s * 0.17, 1.3, 0.075], scale: [0.075, 0.075, 0.025] });
    for (let i = 0; i < 4; i++) {
      const a = 0.4 + i * 0.7;
      b.part(box(0.035, 0.035, 0.03), CREAM, { bone: head, at: [s * (0.17 + Math.cos(a) * 0.09), 1.3 + Math.sin(a) * 0.09, 0.04] });
    }
    // eyes
    b.part(box(0.04, 0.04, 0.02), EYE, { bone: head, at: [s * 0.075, 1.22, 0.255] });
    b.part(box(0.014, 0.014, 0.01), "#ffffff", { bone: head, at: [s * 0.083, 1.232, 0.268] });
  }
  // muzzle & nose
  b.part(box(0.12, 0.08, 0.08), "#a6a9b4", { bone: head, at: [0, 1.14, 0.24] });
  b.part(box(0.1, 0.11, 0.06), NOSE, { bone: head, at: [0, 1.2, 0.285] });
  b.part(box(0.03, 0.03, 0.01), "#4a4a56", { bone: head, at: [-0.02, 1.235, 0.318] });
  // lower jaw
  b.part(box(0.11, 0.04, 0.11), "#a6a9b4", { bone: jaw, at: [0, 1.1, 0.22] });
  b.part(box(0.07, 0.012, 0.05), PINK, { bone: jaw, at: [0, 1.122, 0.24] });

  // ---------------- limbs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const handP: [number, number, number] = [s * 0.15, 0.565, 0.08];
    const arm = limb([s * 0.2, 0.95, 0.06], handP, [0.24, 0.24], [[s * 0.8, 0, -0.6]]);
    const ac = b.chain(`arm${side}`, arm, { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" });
    b.sweep(ac, [0.075, 0.05], { color: FUR });
    const hb = ac.tip!;
    b.part(box(0.1, 0.05, 0.09), FUR, { bone: hb, at: [handP[0], 0.57, 0.085] });
    for (let i = -1; i <= 1; i++)
      b.spike([handP[0] + i * 0.03, 0.56, 0.12], [0, -0.35, 1], 0.06, 0.012, CLAW, { bone: hb, sides: 5 });

    const footP: [number, number, number] = [s * 0.15, 0.31, 0.17];
    const leg = limb([s * 0.14, 0.62, -0.03], footP, [0.24, 0.24], [[0, 0.4, 1]]);
    const lc = b.chain(`leg${side}`, leg, { parent: hips, names: [`hip${side}`, `knee${side}`, `foot${side}`], role: "leg" });
    b.sweep(lc, [0.1, 0.055], { color: FUR });
    const fb = lc.tip!;
    b.part(box(0.1, 0.05, 0.12), "#8d909c", { bone: fb, at: [footP[0], 0.315, 0.18] });
    for (let i = -1; i <= 1; i++)
      b.spike([footP[0] + i * 0.03, 0.3, 0.235], [0, -0.35, 1], 0.06, 0.012, CLAW, { bone: fb, sides: 5 });
  }

  return b.root;
}
