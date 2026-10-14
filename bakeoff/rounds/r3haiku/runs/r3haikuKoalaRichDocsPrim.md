```ts
import * as THREE from "three";
import { createBuilder, catmull, grain, limb, mottle } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

// Palette
const ASH = "#8d9297";
const ASH_LT = "#a9adb1";
const CREAM = "#efe2c4";
const NOSE = "#1d1a1a";
const EYE = "#4a2f1c";
const CLAW = "#2b2b2b";
const PAW = "#5d636a";
const BARK = "#6e5a45";
const BARK_DK = "#4b3b2c";
const LEAF = "#3f8f85";
const TWIG = "#8a9a6e";

const LEAF_SHAPE: OutlinePoint[] = [
  [0, 0],
  [0.012, 0.02],
  [0.011, 0.05],
  [0, 0.075, "sharp"],
  [-0.011, 0.05],
  [-0.012, 0.02],
];

export const meta = {
  name: "Sleepy koala",
  description: "A drowsy ash-grey koala with cream chest and ears, hugging a eucalyptus branch and chewing a sprig of leaves.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });
  const coat = mottle(ASH, ASH_LT, { size: 0.1 });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.14, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.34, 0.02], role: "spine" });
  const head = b.joint("head", { parent: chest, at: [0, 0.59, 0.05], role: "head" });

  // Body, legs and feet
  b.part(new THREE.SphereGeometry(0.17, 14, 10), coat, { bone: hips, at: [0, 0.3, 0], scale: [1, 1.1, 0.95] });
  b.part(new THREE.SphereGeometry(0.12, 12, 8), CREAM, {
    bone: chest,
    at: [0, 0.3, 0.13],
    scale: [0.95, 0.9, 0.45],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 12, 8), coat, {
      bone: hips,
      at: [s * 0.12, 0.1, 0.08],
      scale: [1, 0.75, 1.25],
    });
    b.part(new THREE.SphereGeometry(0.055, 10, 8), PAW, {
      bone: hips,
      at: [s * 0.12, 0.03, 0.22],
      scale: [1, 0.55, 1.4],
    });
    for (const dx of [-0.03, 0, 0.03]) {
      b.spike([s * 0.12 + dx, 0.03, 0.29], [0, -0.25, 1], 0.035, 0.006, { color: CLAW });
    }
  }

  // Head, nose and eyes
  b.part(new THREE.SphereGeometry(0.1, 16, 12), coat, {
    bone: head,
    at: [0, 0.59, 0.05],
    scale: [1.08, 1, 1],
  });
  b.part(new THREE.SphereGeometry(0.036, 12, 8), NOSE, {
    bone: head,
    at: head.local({ up: -0.03, forward: 0.095 }),
    scale: [1.3, 0.85, 0.85],
  });
  for (const s of [1, -1]) {
    // Fluffy ears with a cream lining on the outer face
    b.part(new THREE.SphereGeometry(0.05, 12, 8), coat, {
      bone: head,
      at: head.local({ left: s * 0.085, up: 0.07 }),
      scale: [0.35, 1, 1],
    });
    b.part(new THREE.SphereGeometry(0.036, 10, 8), CREAM, {
      bone: head,
      at: head.local({ left: s * 0.1, up: 0.07, forward: -0.005 }),
      scale: [0.3, 0.85, 0.9],
    });

    // Drowsy eye: dark brown eyeball with a fur-coloured upper lid
    const eyeAt = head.local({ left: s * 0.045, up: 0.015, forward: 0.085 });
    b.part(new THREE.SphereGeometry(0.022, 10, 8), EYE, { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.026, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), coat, {
      bone: head,
      at: eyeAt,
    });
  }

  // Left arm (model +X) wrapping around the branch
  const shoulderL = [0.13, 0.4, 0.05];
  const handL = [0.19, 0.46, 0.2];
  const armLPts = limb(shoulderL, handL, [0.12, 0.12], [0, -1, 0]);
  const armL = b.chain("armL", armLPts, {
    parent: chest,
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  b.sweep(armL, [0.05, 0.035], { color: coat });
  b.part(new THREE.SphereGeometry(0.04, 10, 8), PAW, {
    bone: armL.tip ?? chest,
    at: handL,
    scale: [1, 0.8, 1.1],
  });
  for (const dx of [-0.02, 0, 0.02]) {
    b.spike([handL[0] + dx, 0.44, 0.235], [0, -0.3, 1], 0.03, 0.005, { color: CLAW });
  }

  // Right arm (model -X) holding the eucalyptus sprig up to the mouth
  const shoulderR = [-0.13, 0.4, 0.05];
  const handR = [-0.08, 0.52, 0.19];
  const armRPts = limb(shoulderR, handR, [0.12, 0.12], [0, -1, 0]);
  const armR = b.chain("armR", armRPts, {
    parent: chest,
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
  });
  b.sweep(armR, [0.05, 0.035], { color: coat });
  b.part(new THREE.SphereGeometry(0.04, 10, 8), PAW, {
    bone: armR.tip ?? chest,
    at: handR,
    scale: [1, 0.8, 1.1],
  });
  for (const dx of [-0.02, 0, 0.02]) {
    b.spike([handR[0] + dx, 0.5, 0.225], [0, -0.3, 1], 0.03, 0.005, { color: CLAW });
  }

  // Eucalyptus sprig in the right hand
  const stem = catmull([
    [-0.08, 0.52, 0.2],
    [-0.1, 0.6, 0.25],
    [-0.08, 0.66, 0.3],
    [-0.03, 0.72, 0.31],
  ]);
  b.sweep(stem, [0.004, 0.003], { color: TWIG });
  const leaves: [number, [number, number, number]][] = [
    [0.2, [-0.6, 0.6, 0.5]],
    [0.2, [0.4, 0.4, 0.8]],
    [0.5, [-0.7, 0.3, 0.4]],
    [0.5, [0.6, 0.5, 0.4]],
    [0.8, [-0.3, 0.6, 0.7]],
    [0.95, [0.4, 0.9, 0.2]],
  ];
  for (const [t, d] of leaves) {
    const v = new THREE.Vector3(...d).normalize();
    b.extrude(LEAF_SHAPE, {
      at: stem.at(t),
      x: [1, 0, 0],
      y: [v.x, v.y, v.z],
      thickness: 0.003,
      bevel: 0.001,
      smoothing: 1,
      color: LEAF,
    });
  }

  // Eucalyptus branch the koala hugs
  const branch = catmull([
    [0.26, 0, 0.1],
    [0.24, 0.35, 0.2],
    [0.2, 0.75, 0.22],
    [0.22, 1.05, 0.12],
  ]);
  b.sweep(branch, [0.05, 0.028], {
    color: grain(BARK, BARK_DK, { size: 0.03, axis: "y" }),
  });

  return b.root;
}
```