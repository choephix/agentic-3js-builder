```ts
import * as THREE from "three";
import { createBuilder, rng, noise, polyline } from "agentic-3js-builder";
import { cellPaint, pixelArt, pick, snapColor } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Pixel Koala on Eucalyptus Stand",
  description:
    "A chunky pixel-art koala sitting on a eucalyptus branch stand, gripping it with hands and feet, with big fluffy ears, a huge nose and leafy twigs.",
};

const T = 0.02;
const GREY = ["#3f4249", "#5d616b", "#7e838f", "#a0a5b0", "#c3c7d0"].map((c) => snapColor(c, 32));
const CREAM = ["#a99f8c", "#d2c9b2", "#efe8d2"];
const BARK = ["#3a2a1c", "#5a4129", "#7a5a38", "#977349"];
const LEAF = ["#1f4a2e", "#2f6b40", "#4a8c52", "#7ab36a"];

const fur = cellPaint(
  T,
  (c) => c.pick(GREY, 0.5 + 0.28 * c.n.y + 0.55 * (noise(c.at, 0.09, 3) - 0.5) + 0.12 * (c.random(1) - 0.5)),
  { dither: true },
);
const furDark = cellPaint(T, (c) => c.pick(GREY, 0.2 + 0.25 * c.n.y + 0.3 * (c.random(2) - 0.5)), { dither: true });
const belly = cellPaint(T, (c) => c.pick(CREAM, 0.55 + 0.3 * c.n.y + 0.5 * (c.random(4) - 0.5)), { dither: true });
const bark = cellPaint(T, (c) => c.pick(BARK, 0.45 + 0.3 * c.n.y + 0.9 * (noise(c.at, 0.05, 7) - 0.5) + 0.25 * (c.random(5) - 0.5)), { dither: true });
const leafP = cellPaint(0.012, (c) => c.pick(LEAF, 0.4 + 0.4 * c.n.y + 0.7 * (c.random(6) - 0.5)), { dither: true });
const NOSE = "#16141a";
const PINK = "#d99aa0";
const CLAW = "#2a2530";

const EYE = pixelArt(
  ["kkkk", "kwkk", "kkkk"].map((r) => r),
  { k: "#0d0b10", w: "#ffffff" },
);

export default function build() {
  const b = createBuilder({ name: "koala" });
  const rand = rng(5);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.54, -0.04], dir: [0, 1, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.6, -0.03], dir: [0, 1, 0.1], role: "spine" });
  const neck = b.joint("neck", { parent: spine, at: [0, 0.86, 0.02], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.9, 0.04], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.94, 0.17], aim: [0, 0.94, 0.3], role: "jaw" });

  // body
  b.part(box(0.38, 0.44, 0.32), fur, { bone: spine, at: [0, 0.7, -0.03] });
  b.part(box(0.4, 0.2, 0.34), fur, { bone: hips, at: [0, 0.5, -0.06] });
  b.part(box(0.26, 0.3, 0.02), belly, { bone: spine, at: [0, 0.68, 0.14] });
  b.part(box(0.2, 0.14, 0.1), furDark, { bone: hips, at: [0, 0.5, -0.24] }); // stub tail

  // head
  b.part(box(0.4, 0.32, 0.32), fur, { bone: head, at: [0, 1.04, 0.05] });
  b.part(box(0.2, 0.14, 0.12), fur, { bone: head, at: [0, 0.98, 0.2] });
  b.part(box(0.2, 0.06, 0.18), belly, { bone: head, at: [0, 0.93, 0.15] });
  b.part(box(0.2, 0.08, 0.12), belly, { bone: jaw, at: [0, 0.9, 0.17] }); // lower jaw
  b.part(box(0.16, 0.02, 0.1), PINK, { bone: jaw, at: [0, 0.945, 0.17] });
  b.part(box(0.15, 0.12, 0.08), NOSE, { bone: head, at: [0, 1.04, 0.27] }); // big nose
  b.part(box(0.04, 0.03, 0.02), "#8a8a99", { bone: head, at: [-0.03, 1.08, 0.315] });
  const nGeo = box(0.03, 0.03, 0.01);
  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.PlaneGeometry(0.07, 0.056), "#ffffff", {
      bone: head, at: [s * 0.1, 1.1, 0.213], dir: [0, 0, 1], axis: "z", texture: EYE,
    });
    b.part(nGeo, "#000000", { bone: head, at: [s * 0.04, 1.0, 0.31] });
    // ears
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.2, 1.18, 0.0], dir: [s, 1, 0], role: "hinge" });
    b.part(box(0.2, 0.2, 0.08), furDark, { bone: ear, at: [s * 0.23, 1.25, 0.0] });
    b.part(box(0.16, 0.16, 0.06), CREAM[2], { bone: ear, at: [s * 0.23, 1.25, 0.025] });
    b.part(box(0.1, 0.1, 0.06), PINK, { bone: ear, at: [s * 0.23, 1.24, 0.045] });
    b.part(box(0.06, 0.08, 0.1), belly, { bone: head, at: [s * 0.22, 0.95, 0.04] }); // cheek fluff
  }
  b.part(box(0.42, 0.04, 0.2), furDark, { bone: head, at: [0, 1.2, 0.06] }); // brow tuft

  // branch stand
  const BY = 0.4;
  b.part(box(0.6, 0.04, 0.6), bark, { bone: hips, at: [0, 0.02, 0.0] });
  b.part(box(0.5, 0.03, 0.5), bark, { bone: hips, at: [0, 0.055, 0.0] });
  b.rod([-0.5, 0.06, 0.08], [-0.5, 1.05, 0.08], [0.06, 0.04], { bone: hips, color: bark, section: { ngon: 4 } });
  b.rod([-0.52, BY, 0.08], [0.62, BY + 0.03, 0.08], [0.052, 0.045], { bone: hips, color: bark, section: { ngon: 6 } });
  b.rod([-0.5, 0.8, 0.08], [-0.78, 1.1, 0.12], [0.03, 0.015], { bone: hips, color: bark, section: { ngon: 4 } });
  b.rod([-0.5, 0.95, 0.08], [-0.22, 1.28, 0.0], [0.03, 0.015], { bone: hips, color: bark, section: { ngon: 4 } });
  const leafAt: [number, number, number, number][] = [
    [-0.78, 1.1, 0.12, -1], [-0.22, 1.28, 0.0, 1], [-0.5, 1.05, 0.08, 1], [0.62, BY + 0.03, 0.08, 1],
  ];
  const outline: [number, number][] = [[0, 0], [0.05, 0.035], [0.14, 0.04], [0.22, 0.0], [0.14, -0.035], [0.05, -0.035]].map(
    ([x, y]) => [x, y] as [number, number],
  );
  for (const [x, y, z, dx] of leafAt)
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.extrude(outline, {
        at: [x, y, z], x: [dx * Math.cos(a) * 0.7, -0.3 + 0.5 * Math.sin(a), Math.sin(a) * 0.8 + 0.1],
        y: [0, 1, 0], thickness: 0.012, color: leafP, bone: hips,
      });
    }
  for (let i = 0; i < 8; i++)
    b.part(box(0.03, 0.03, 0.03), bark, { bone: hips, at: [-0.4 + i * 0.12 + 0.02 * rand(), BY + 0.045, 0.08] });

  // limbs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${S}`, polyline([[s * 0.2, 0.8, 0.04], [s * 0.26, 0.64, 0.2], [s * 0.18, 0.5, 0.18]]), {
      parent: spine, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm",
    });
    b.sweep(arm, [0.085, 0.07, 0.06], { color: furDark, section: { ngon: 4 }, caps: "flat" });
    const hand = arm.tip!;
    b.part(box(0.1, 0.07, 0.12), furDark, { bone: hand, at: [s * 0.17, 0.46, 0.17] });
    for (let k = -1; k <= 1; k++) {
      const d = b.joint(`fingerA${S}${k + 2}`, { parent: hand, at: [s * 0.17 + k * 0.035, 0.45, 0.2], dir: [0, -0.5, 1], role: "digit" });
      b.part(box(0.028, 0.03, 0.08), CLAW, { bone: d, at: [s * 0.17 + k * 0.035, 0.425, 0.24] });
    }
    const leg = b.chain(`leg${S}`, polyline([[s * 0.17, 0.52, -0.08], [s * 0.26, 0.46, 0.08], [s * 0.18, 0.43, 0.12]]), {
      parent: hips, names: [`hip${S}`, `knee${S}`, `foot${S}`], role: "leg", contact: [s * 0.18, 0.4, 0.12],
    });
    b.sweep(leg, [0.11, 0.085, 0.065], { color: fur, section: { ngon: 4 }, caps: "flat" });
    const foot = leg.tip!;
    b.part(box(0.12, 0.05, 0.14), furDark, { bone: foot, at: [s * 0.17, 0.48, 0.13] });
    for (let k = 0; k < 3; k++) {
      const d = b.joint(`toe${S}${k + 1}`, { parent: foot, at: [s * 0.17 + (k - 1) * 0.04, 0.47, 0.19], dir: [0, -0.5, 1], role: "digit" });
      b.part(box(0.03, 0.03, 0.07), CLAW, { bone: d, at: [s * 0.17 + (k - 1) * 0.04, 0.45, 0.23] });
    }
  }
  return b.root;
}
```