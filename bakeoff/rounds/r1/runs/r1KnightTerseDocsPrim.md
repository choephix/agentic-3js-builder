```ts
import * as THREE from "three";
import { createBuilder, polyline, mottle, gradient } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description:
    "A plate-armored knight with a great helm and plume, crimson tabard and cape, kite shield, and a sword planted point-down, rigged for animation.",
};

const STEEL = "#9aa5b1";
const STEEL2 = "#6f7c8a";
const DARK = "#23272f";
const GOLD = "#d4a437";
const RED = "#a62b2b";
const DKRED = "#5e171c";
const LEATHER = "#5a3a22";

export default function build() {
  const b = createBuilder({ name: "knight" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.0, 0],
      [0, 1.2, 0],
      [0, 1.4, 0],
      [0, 1.55, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.55, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.63, 0.01], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.68, 0.03],
    aim: [0, 1.68, 0.2],
    role: "jaw",
  });

  const arms: Record<string, any> = {};
  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    arms[k] = b.chain(
      `arm${k}`,
      polyline([
        [s * 0.25, 1.5, 0],
        [s * 0.38, 1.24, 0.02],
        [s * 0.46, 1.0, 0.08],
        [s * 0.5, 0.9, 0.1],
      ]),
      { parent: chest, names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`], role: "arm" },
    );
    legs[k] = b.chain(
      `leg${k}`,
      polyline([
        [s * 0.11, 0.95, 0],
        [s * 0.11, 0.52, 0.03],
        [s * 0.11, 0.09, 0],
        [s * 0.11, 0.05, 0.17],
      ]),
      { parent: hips, names: [`hip${k}`, `knee${k}`, `ankle${k}`, `toe${k}`], role: "leg" },
    );
  }

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---------- torso ----------
  const plate = mottle(STEEL, "#8793a0", { size: 0.06, contrast: 0.5 });
  b.frustumBox([0, 0.92, 0], [0, 1.3, 0], [0.3, 0.2], [0.34, 0.22], { bone: hips, color: STEEL2 });
  b.frustumBox([0, 1.3, 0], [0, 1.56, 0], [0.34, 0.24], [0.46, 0.28], { bone: chest, color: plate });
  // gold cross on breastplate
  b.part(box(0.035, 0.2, 0.012), GOLD, { bone: chest, at: [0, 1.43, 0.145] });
  b.part(box(0.16, 0.035, 0.012), GOLD, { bone: chest, at: [0, 1.48, 0.145] });
  // belt and buckle
  b.frustumBox([0, 0.97, 0], [0, 1.03, 0], [0.33, 0.23], [0.33, 0.23], { bone: hips, color: LEATHER });
  b.part(box(0.06, 0.06, 0.02), GOLD, { bone: hips, at: [0, 1.0, 0.125] });
  // faulds skirt
  b.part(new THREE.CylinderGeometry(0.2, 0.27, 0.2, 8), STEEL, { bone: hips, at: [0, 0.88, 0], flat: true });
  // tabard
  b.extrude(
    [
      [-0.13, 0],
      [0.13, 0],
      [0.13, -0.48],
      [0, -0.58, "sharp"],
      [-0.13, -0.48],
    ],
    { at: [0, 0.98, 0.25], x: [1, 0, 0], y: [0, 1, 0.1], thickness: 0.015, color: RED, bone: hips },
  );
  b.part(box(0.03, 0.26, 0.01), GOLD, { bone: hips, at: [0, 0.75, 0.262] });
  b.part(box(0.12, 0.03, 0.01), GOLD, { bone: hips, at: [0, 0.8, 0.262] });
  // cape
  b.extrude(
    [
      [-0.22, 0],
      [0.22, 0],
      [0.3, -0.9],
      [0.1, -1.0],
      [-0.1, -0.95],
      [-0.3, -0.9],
    ],
    {
      at: [0, 1.52, -0.15],
      x: [1, 0, 0],
      y: [0, 1, 0.15],
      thickness: 0.012,
      color: gradient(RED, DKRED, [0, 1.5, 0], [0, 0.5, 0]),
      bone: chest,
    },
  );
  // gorget
  b.part(new THREE.CylinderGeometry(0.09, 0.14, 0.1, 8), STEEL2, { bone: neck, at: [0, 1.58, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.025, 8), GOLD, { bone: neck, at: [0, 1.63, 0], flat: true });

  // ---------- head ----------
  b.part(new THREE.CylinderGeometry(0.115, 0.12, 0.15, 8), STEEL, { bone: head, at: [0, 1.775, 0.01], flat: true });
  b.part(new THREE.SphereGeometry(0.115, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
    bone: head,
    at: [0, 1.85, 0.01],
    scale: [1, 0.65, 1],
    flat: true,
  });
  b.part(box(0.17, 0.022, 0.02), DARK, { bone: head, at: [0, 1.775, 0.12] });
  b.part(box(0.028, 0.15, 0.015), GOLD, { bone: head, at: [0, 1.78, 0.127] });
  b.part(new THREE.CylinderGeometry(0.118, 0.115, 0.1, 8), STEEL2, { bone: jaw, at: [0, 1.65, 0.01], flat: true });
  for (const x of [-0.04, 0, 0.04]) b.part(box(0.01, 0.05, 0.01), DARK, { bone: jaw, at: [x, 1.65, 0.118] });
  // plume
  b.sweep(
    polyline([
      [0, 1.9, 0.0],
      [0, 2.0, -0.1],
      [0, 1.98, -0.25],
      [0, 1.85, -0.38],
    ]),
    [0.03, 0.01],
    { bone: head, color: RED, caps: { start: "round", end: "point" } },
  );

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const a = arms[k].joints;
    const sh = a[0], el = a[1], wr = a[2], hd = a[3];
    b.part(new THREE.SphereGeometry(0.11, 8, 6), STEEL, { bone: sh, at: [s * 0.29, 1.53, 0], scale: [1.1, 0.75, 1.1], flat: true });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), STEEL2, { bone: sh, at: [s * 0.31, 1.46, 0], scale: [1.1, 0.6, 1.1], flat: true });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), DARK, { bone: sh, at: [s * 0.27, 1.45, 0] });
    b.rod([s * 0.27, 1.45, 0], [s * 0.38, 1.24, 0.02], [0.058, 0.05], { bone: sh, color: STEEL });
    b.part(new THREE.SphereGeometry(0.06, 6, 5), STEEL2, { bone: el, at: [s * 0.38, 1.24, 0.03], flat: true });
    b.part(new THREE.ConeGeometry(0.025, 0.07, 6), GOLD, { bone: el, at: [s * 0.44, 1.23, 0], rotation: [0, 0, -s * 90] });
    b.rod([s * 0.38, 1.24, 0.02], [s * 0.46, 1.0, 0.08], [0.052, 0.045], { bone: el, color: STEEL });
    b.rod([s * 0.4, 1.16, 0.03], [s * 0.43, 1.1, 0.05], 0.058, { bone: el, color: GOLD });
    // gauntlet
    b.part(box(0.09, 0.14, 0.09), STEEL2, { bone: hd, at: [s * 0.49, 0.92, 0.1] });
  }

  // shield on left arm
  b.extrude(
    [
      [-0.17, 0],
      [0.17, 0],
      [0.16, -0.25],
      [0, -0.6, "sharp"],
      [-0.16, -0.25],
    ],
    { at: [0.52, 1.32, 0.15], thickness: 0.03, bevel: 0.01, color: RED, bone: arms.L.joints[2] },
  );
  b.part(box(0.04, 0.4, 0.012), GOLD, { bone: arms.L.joints[2], at: [0.52, 1.1, 0.17] });
  b.part(box(0.22, 0.04, 0.012), GOLD, { bone: arms.L.joints[2], at: [0.52, 1.2, 0.17] });
  b.part(new THREE.SphereGeometry(0.045, 8, 5), GOLD, { bone: arms.L.joints[2], at: [0.52, 1.2, 0.17], scale: [1, 1, 0.6] });

  // sword in right hand, point on the floor
  const hR = arms.R.joints[3];
  b.frustumBox([-0.5, 0.18, 0.1], [-0.5, 0.84, 0.1], [0.045, 0.012], [0.055, 0.014], { bone: hR, color: "#d8dee6" });
  b.frustumBox([-0.5, 0.0, 0.1], [-0.5, 0.18, 0.1], [0.004, 0.004], [0.045, 0.012], { bone: hR, color: "#d8dee6" });
  b.part(box(0.28, 0.03, 0.04), GOLD, { bone: hR, at: [-0.5, 0.855, 0.1] });
  b.rod([-0.5, 0.87, 0.1], [-0.5, 0.99, 0.1], 0.018, { bone: hR, color: LEATHER });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), GOLD, { bone: hR, at: [-0.5, 1.01, 0.1] });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const l = legs[k].joints;
    const x = s * 0.11;
    b.sweep(polyline([[x, 0.95, 0], [x, 0.52, 0.03]]), 0.045, { bone: l[0], color: DARK });
    b.rod([x, 0.95, 0], [x, 0.54, 0.03], [0.078, 0.065], { bone: l[0], color: STEEL, sides: 8 });
    b.part(box(0.13, 0.18, 0.03), STEEL2, { bone: l[0], at: [x, 0.86, 0.09], rotation: [-8, 0, 0] });
    b.part(new THREE.SphereGeometry(0.07, 6, 5), STEEL2, { bone: l[1], at: [x, 0.52, 0.06], flat: true });
    b.part(new THREE.ConeGeometry(0.03, 0.08, 6), GOLD, { bone: l[1], at: [x + s * 0.07, 0.52, 0.03], rotation: [0, 0, -s * 90] });
    b.rod([x, 0.5, 0.03], [x, 0.1, 0], [0.062, 0.05], { bone: l[1], color: STEEL });
    b.part(box(0.1, 0.1, 0.02), STEEL2, { bone: l[1], at: [x, 0.35, 0.06] });
    // sabaton
    b.part(box(0.11, 0.08, 0.2), STEEL2, { bone: l[2], at: [x, 0.04, 0.06] });
    b.part(new THREE.ConeGeometry(0.055, 0.1, 4), STEEL2, { bone: l[3], at: [x, 0.04, 0.2], rotation: [90, 45, 0], scale: [1, 1, 0.7] });
  }

  return b.root;
}
```