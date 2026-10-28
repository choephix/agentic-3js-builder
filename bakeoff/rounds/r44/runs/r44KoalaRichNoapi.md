```ts
import * as THREE from "three";
import { createBuilder, frame, noise } from "agentic-3js-builder";
import { cellPaint, pick, pixelArt, snapColor } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Branch",
  description: "Pixel-art koala hugging a eucalyptus branch on a small wooden stand, with big fluffy ears, a black nose and leaf sprigs.",
};

const T = 0.02;
const ramp = (a: string[]) => a.map((c) => snapColor(c, 32));
const FUR = ramp(["#3c3d48", "#575963", "#767884", "#9a9ca6", "#b9bbc2"]);
const CREAM = ramp(["#9c9486", "#c4bcab", "#e6dfcc", "#f6f0e0"]);
const BARK = ramp(["#3a2818", "#58402a", "#7a5a3a", "#9a7a50"]);
const WOOD = ramp(["#4a3020", "#68472c", "#865e3a", "#a37a4c"]);
const LEAFC = ramp(["#2a4a3a", "#3e6a52", "#5a8e6c", "#86b898"]);

const fur = cellPaint(T, (c) => c.pick(FUR, 0.45 + 0.35 * c.n.y + 0.5 * (noise(c.at, 0.1, 3) - 0.5)), { dither: true });
const cream = cellPaint(T, (c) => c.pick(CREAM, 0.55 + 0.25 * c.n.y + 0.5 * (noise(c.at, 0.08, 5) - 0.5)), { dither: true });
const bodyFur = cellPaint(T, (c) => (c.at.z > 0.1 && c.n.z > 0.4 && Math.abs(c.at.x) < 0.1 + 0.03 * (c.v & 1) ? c.pick(CREAM, 0.7 + 0.2 * c.random(2)) : c.pick(FUR, 0.45 + 0.35 * c.n.y + 0.5 * (noise(c.at, 0.1, 3) - 0.5))), { dither: true });
const bark = cellPaint(T, (c) => c.pick(BARK, 0.4 + 0.5 * c.random(1) * (c.u % 3 === 0 ? 0.4 : 1) + 0.2 * c.n.y), { dither: true });
const wood = cellPaint(T, (c) => c.pick(WOOD, 0.35 + 0.4 * c.random(4) + 0.2 * c.n.y), { dither: true });

const EYE = pixelArt(["kkkk", "kwkk", "kkkk"], { k: "#101016", w: "#ffffff" });
const LEAF = pixelArt(
  ["....gg....", "...gGGg...", "..gGGHGg..", ".gGGHGGGg.", ".gGHGGGGg.", "..gGGGGg..", "...gGGg...", "....gg....", ".....s....", ".....s...."],
  { g: "#2a5a40", G: "#4c8a64", H: "#86b898", s: "#6a4a2a" },
);
const NOSE = pixelArt(["kkkkk", "kkkkk", "kwkkk", "kkkkk"], { k: "#15151c", w: "#6a6a7a" });
const EARIN = pixelArt(["ppppp", "pPPPp", "pPPPp", "ppppp"], { p: "#f2dcd8", P: "#e0a8b0" });

export default function build() {
  const b = createBuilder({ name: "koala", paintSize: 1024 });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // stand
  const base = b.joint("stand", { at: [0, 0, 0], dir: [0, 1, 0] });
  b.part(box(0.9, 0.05, 0.5), wood, { bone: base, at: [0, 0.02, 0] });
  b.part(box(0.8, 0.03, 0.4), wood, { bone: base, at: [0, 0.055, 0] });
  const BY = 0.32;
  const BZ = 0.0;
  for (const s of [1, -1]) {
    b.part(box(0.07, BY - 0.07, 0.07), wood, { bone: base, at: [s * 0.4, 0.07 + (BY - 0.07) / 2, BZ] });
    b.part(box(0.1, 0.04, 0.1), wood, { bone: base, at: [s * 0.4, BY - 0.04, BZ] });
  }
  const branch = b.joint("branch", { parent: base, at: [0, BY, BZ], dir: [1, 0, 0] });
  b.rod([-0.52, BY, BZ], [0.52, BY, BZ], 0.055, { bone: branch, color: bark, sides: 6 });
  b.rod([0.4, BY + 0.02, BZ], [0.62, BY + 0.2, BZ - 0.03], 0.025, { bone: branch, color: bark, sides: 5 });
  b.rod([-0.38, BY + 0.02, BZ], [-0.6, BY + 0.18, BZ + 0.03], 0.025, { bone: branch, color: bark, sides: 5 });
  b.cards(
    [frame([0.62, BY + 0.2, BZ - 0.03], [0, 1, 0]), frame([-0.6, BY + 0.18, BZ + 0.03], [0, 1, 0]), frame([0.5, BY + 0.1, BZ], [0.3, 1, 0]), frame([-0.5, BY + 0.09, BZ], [-0.3, 1, 0]), frame([0.1, BY + 0.03, 0.04], [0, 1, 0.3])],
    LEAF,
    { size: [0.13, 0.17], lean: 40, cross: true, flow: [0, 0, 1], vary: 0.2, color: "#ffffff" },
  );

  // koala skeleton
  const hips = b.joint("hips", { parent: base, at: [0, 0.42, -0.04], dir: [0, 1, 0.1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.6, 0.0], dir: [0, 1, 0.1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.74, 0.03], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.8, 0.04], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.76, 0.14], dir: [0, 0, 1], role: "jaw" });

  b.part(box(0.36, 0.26, 0.3), bodyFur, { bone: hips, at: [0, 0.46, -0.04] });
  b.part(box(0.4, 0.3, 0.32), bodyFur, { bone: chest, at: [0, 0.64, 0.0] });
  b.part(box(0.28, 0.14, 0.26), cream, { bone: hips, at: [0, 0.4, 0.08] });
  b.part(box(0.2, 0.1, 0.1), fur, { bone: hips, at: [0, 0.4, -0.2] }); // stub tail
  b.part(box(0.3, 0.1, 0.28), fur, { bone: neck, at: [0, 0.77, 0.03] });

  // head
  b.part(box(0.42, 0.34, 0.34), fur, { bone: head, at: [0, 0.9, 0.05] });
  b.part(box(0.3, 0.1, 0.1), cream, { bone: head, at: [0, 0.77, 0.15] });
  b.part(box(0.26, 0.1, 0.2), cream, { bone: head, at: [0, 0.76, 0.12] });
  b.part(box(0.16, 0.2, 0.08), "#15151c", { bone: head, at: [0, 0.88, 0.25], texture: NOSE });
  b.part(box(0.15, 0.06, 0.1), cream, { bone: jaw, at: [0, 0.72, 0.14] });
  b.part(box(0.2, 0.05, 0.16), cream, { bone: jaw, at: [0, 0.73, 0.1] });
  b.part(box(0.12, 0.01, 0.04), "#7a3a44", { bone: jaw, at: [0, 0.76, 0.2] });
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    b.part(new THREE.PlaneGeometry(0.07, 0.05), "#ffffff", { bone: head, at: [s * 0.11, 0.94, 0.222], dir: [0, 0, 1], axis: "z", texture: EYE });
    b.part(box(0.1, 0.02, 0.03), fur, { bone: head, at: [s * 0.11, 0.99, 0.222] });
    const ear = b.joint("ear" + sd, { parent: head, at: [s * 0.26, 1.0, 0.0], dir: [s, 0.3, 0], role: "hinge" });
    b.part(box(0.24, 0.24, 0.1), fur, { bone: ear, at: [s * 0.26, 1.04, -0.01] });
    b.part(box(0.28, 0.1, 0.08), cream, { bone: ear, at: [s * 0.26, 1.02, -0.025] });
    b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", { bone: ear, at: [s * 0.26, 1.04, 0.045], dir: [0, 0, 1], axis: "z", texture: EARIN });
    b.part(box(0.1, 0.1, 0.1), fur, { bone: ear, at: [s * 0.26, 1.15, -0.01] });
  }

  // arms hugging the branch
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = b.joint("shoulder" + sd, { parent: chest, at: [s * 0.23, 0.7, 0.04], aim: [s * 0.21, 0.52, 0.14], role: "arm" });
    const el = b.joint("elbow" + sd, { parent: sh, at: [s * 0.21, 0.52, 0.14], aim: [s * 0.15, 0.4, 0.1], role: "arm" });
    const ha = b.joint("hand" + sd, { parent: el, at: [s * 0.15, 0.4, 0.1], aim: [s * 0.15, 0.34, 0.06], role: "arm" });
    b.rod([s * 0.23, 0.7, 0.04], [s * 0.21, 0.52, 0.14], 0.065, { bone: sh, color: fur, sides: 4 });
    b.rod([s * 0.21, 0.52, 0.14], [s * 0.15, 0.4, 0.1], 0.06, { bone: el, color: fur, sides: 4 });
    b.part(box(0.1, 0.08, 0.12), fur, { bone: ha, at: [s * 0.15, 0.38, 0.06] });
    for (let k = 0; k < 3; k++) {
      b.part(box(0.025, 0.12, 0.03), "#15151c", { bone: ha, at: [s * (0.115 + 0.035 * k), 0.37, 0.115] });
      b.part(box(0.025, 0.03, 0.05), "#d8d0bc", { bone: ha, at: [s * (0.115 + 0.035 * k), 0.31, 0.1] });
    }
  }

  // legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hp = b.joint("hip" + sd, { parent: hips, at: [s * 0.17, 0.42, -0.02], aim: [s * 0.2, 0.36, 0.14], role: "leg" });
    const kn = b.joint("knee" + sd, { parent: hp, at: [s * 0.2, 0.36, 0.14], aim: [s * 0.16, 0.36, 0.24], role: "leg" });
    const ft = b.joint("foot" + sd, { parent: kn, at: [s * 0.16, 0.36, 0.24], aim: [s * 0.16, 0.34, 0.3], role: "leg" });
    b.rod([s * 0.17, 0.42, -0.02], [s * 0.2, 0.37, 0.14], 0.085, { bone: hp, color: fur, sides: 4 });
    b.rod([s * 0.2, 0.37, 0.14], [s * 0.16, 0.37, 0.24], 0.06, { bone: kn, color: fur, sides: 4 });
    b.part(box(0.12, 0.06, 0.1), "#4a4a56", { bone: ft, at: [s * 0.16, 0.36, 0.28] });
    for (let k = 0; k < 3; k++) b.part(box(0.025, 0.07, 0.025), "#15151c", { bone: ft, at: [s * (0.125 + 0.035 * k), 0.33, 0.33] });
  }

  return b.root;
}
```