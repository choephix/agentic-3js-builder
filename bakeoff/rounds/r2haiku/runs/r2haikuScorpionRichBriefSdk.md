```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline } from "agentic-3js-builder";

const AMBER = "#d08a2e";
const AMBER_LIGHT = "#eab46a";
const AMBER_DARK = "#6b3a12";
const DARK = "#2b1a0e";
const EYE = "#080808";

export const meta = {
  name: "Desert scorpion",
  description: "Amber armoured desert scorpion with raised tail, large pincers, eight legs and a cluster of black eyes.",
};

export default function build() {
  const b = createBuilder({ name: "desert-scorpion" });

  // Unit sphere, scaled per part into ellipsoids.
  const sphere = (segW = 12, segH = 8) => new THREE.SphereGeometry(1, segW, segH);
  const ell = (at: [number, number, number], s: [number, number, number], color: string) =>
    b.part(sphere(), color, { at, scale: s });

  // Skeleton root sits in the middle of the body.
  b.joint("body", { at: [0, 0.05, 0] });

  // ---- Body: flat carapace, mesosoma, and band seams ----
  // Prosoma (head shield)
  const prosoma = ell([0, 0.045, 0.03], [0.042, 0.02, 0.05], AMBER);
  // Pale plate on the shield
  ell([0, 0.06, 0.035], [0.034, 0.007, 0.038], AMBER_LIGHT);
  // Mesosoma (abdomen segments)
  ell([0, 0.045, -0.06], [0.04, 0.024, 0.05], AMBER);
  ell([0, 0.05, -0.085], [0.034, 0.02, 0.03], AMBER);

  // Dark bands at every body seam
  ell([0, 0.045, -0.005], [0.044, 0.024, 0.006], AMBER_DARK); // prosoma / mesosoma
  ell([0, 0.045, -0.035], [0.042, 0.025, 0.004], AMBER_DARK); // mesosoma segment seam
  ell([0, 0.048, -0.105], [0.036, 0.022, 0.006], AMBER_DARK); // mesosoma / tail base

  // ---- Black eyes clustered on the shield ----
  const shield = prosoma;
  const eyePts: [number, number, number][] = [
    [0.006, 0.064, 0.058],
    [-0.006, 0.064, 0.058],
    [0.014, 0.061, 0.05],
    [-0.014, 0.061, 0.05],
    [0.0, 0.066, 0.07],
  ];
  for (const p of eyePts) {
    const hit = b.surface(shield).nearest(p);
    b.stick(new THREE.SphereGeometry(0.0035, 8, 6), EYE, hit);
  }

  // ---- Tail: arched high over the back, stinger curling forward ----
  const tailPts: [number, number, number][] = [
    [0, 0.05, -0.11],
    [0, 0.085, -0.15],
    [0, 0.12, -0.165],
    [0, 0.15, -0.15],
    [0, 0.166, -0.115],
    [0, 0.165, -0.08],
  ];
  const tail = b.chain("tail", catmull(tailPts), { role: "tail" });
  b.sweep(tail, 0.014, { color: AMBER });

  // Dark bands at tail joints, tapering down the tail
  const bandR = [0.0165, 0.0150, 0.0135, 0.0120];
  [1, 2, 3, 4].forEach((i, k) => {
    const p = tailPts[i];
    b.part(sphere(10, 6), AMBER_DARK, { at: p, scale: [bandR[k], bandR[k] * 0.9, bandR[k]] });
  });

  // Bulbous dark stinger with a small tip
  b.part(sphere(12, 8), DARK, { at: [0, 0.165, -0.08], scale: [0.017, 0.017, 0.02] });
  b.part(sphere(8, 6), DARK, { at: [0, 0.162, -0.055], scale: [0.007, 0.007, 0.008] });

  // ---- Legs: four pairs, thin, with dark knee joints ----
  const legZ = [0.02, 0.0, -0.03, -0.06];
  for (let i = 0; i < 4; i++) {
    for (const sx of [1, -1]) {
      const side = sx > 0 ? "L" : "R";
      const z = legZ[i];
      const hip: [number, number, number] = [sx * 0.035, 0.05, z];
      const knee: [number, number, number] = [sx * (0.082 + i * 0.004), 0.075 - i * 0.004, z + 0.005];
      const foot: [number, number, number] = [sx * (0.12 + i * 0.003), 0.0, z - 0.012];
      const leg = b.chain(`leg${side}${i}`, polyline([hip, knee, foot]), { role: "leg" });
      b.sweep(leg, 0.0045, { color: AMBER });
      b.part(sphere(8, 6), AMBER_DARK, { at: knee, scale: [0.0055, 0.0055, 0.0055] });
    }
  }

  // ---- Pincers: big crab-like claws held forward ----
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, catmull([
      [sx * 0.036, 0.05, 0.07],
      [sx * 0.072, 0.056, 0.12],
      [sx * 0.092, 0.05, 0.18],
      [sx * 0.096, 0.046, 0.205],
    ]), { role: "arm" });
    b.sweep(arm, 0.0075, { color: AMBER });

    // Palm
    b.part(sphere(12, 8), AMBER, { at: [sx * 0.096, 0.046, 0.225], scale: [0.026, 0.02, 0.032] });
    // Highlight on the palm top
    b.part(sphere(10, 6), AMBER_LIGHT, { at: [sx * 0.096, 0.061, 0.222], scale: [0.018, 0.005, 0.02] });

    // Fixed finger and moving finger, meeting at a dark tip
    const fixed = b.chain(`fingerFixed${side}`, catmull([
      [sx * 0.086, 0.048, 0.24],
      [sx * 0.086, 0.05, 0.27],
      [sx * 0.074, 0.048, 0.295],
    ]), { role: "hinge" });
    b.sweep(fixed, 0.0065, { color: AMBER });

    const moving = b.chain(`fingerMoving${side}`, catmull([
      [sx * 0.106, 0.048, 0.24],
      [sx * 0.106, 0.05, 0.27],
      [sx * 0.094, 0.048, 0.298],
    ]), { role: "hinge" });
    b.sweep(moving, 0.0065, { color: AMBER });

    // Dark pincer tips
    b.part(sphere(8, 6), DARK, { at: [sx * 0.08, 0.048, 0.298], scale: [0.0085, 0.0085, 0.0085] });
    b.part(sphere(8, 6), DARK, { at: [sx * 0.1, 0.048, 0.302], scale: [0.0085, 0.0085, 0.0085] });
  }

  return b.root;
}
```