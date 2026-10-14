```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, mottle, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Stag Beetle",
  description: "A stag beetle with big antler-like mandibles, glossy elytra, segmented legs and comb antennae.",
};

export default function build() {
  const b = createBuilder({ name: "stagBeetle" });
  const SHELL = "#4a2210";
  const SHELL2 = "#6b3216";
  const BLACK = "#1c1210";
  const DARK = "#2a1a12";
  const LEG = "#2b1a14";
  const HL = "#8a4a22";

  // Beetle ~ 9 cm long, scaled up slightly. Body axis along Z.
  const H = 0.035; // body height from floor
  const root = b.joint("root", { at: [0, H, 0], role: "spine" });
  const thorax = b.joint("thorax", { parent: root, at: [0, H + 0.004, 0.02], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, H + 0.002, 0.055], dir: [0, 0, 1], role: "head" });
  const abdomen = b.joint("abdomen", { parent: root, at: [0, H + 0.005, -0.01], dir: [0, 0, -1], role: "spine" });

  // Abdomen / elytra
  const coat = countershade(mottle(SHELL, SHELL2, { size: 0.03, contrast: 0.5 }), BLACK, { level: -0.2 });
  b.part(new THREE.SphereGeometry(0.05, 10, 8), coat, {
    bone: abdomen, at: [0, H + 0.004, -0.06], scale: [0.88, 0.62, 1.55],
  });
  // elytra halves with split line
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 10, 8), coat, {
      bone: abdomen, at: [s * 0.022, H + 0.014, -0.06], scale: [0.5, 0.45, 1.5], name: "elytra",
    });
    b.part(new THREE.BoxGeometry(0.004, 0.003, 0.1), HL, {
      bone: abdomen, at: [s * 0.036, H + 0.04, -0.06], rotation: [0, 0, s * -25],
    });
  }
  b.part(new THREE.BoxGeometry(0.003, 0.004, 0.12), BLACK, { bone: abdomen, at: [0, H + 0.036, -0.07] });
  // abdomen rim underside
  b.part(new THREE.SphereGeometry(0.045, 8, 6), BLACK, { bone: abdomen, at: [0, H - 0.004, -0.06], scale: [0.9, 0.4, 1.5] });

  // Thorax (pronotum)
  b.part(new THREE.SphereGeometry(0.045, 10, 8), SHELL, { bone: thorax, at: [0, H + 0.006, 0.03], scale: [1.0, 0.6, 0.85] });
  b.part(new THREE.BoxGeometry(0.075, 0.012, 0.02), BLACK, { bone: thorax, at: [0, H + 0.002, 0.018] });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), HL, { bone: thorax, at: [0, H + 0.025, 0.03], scale: [1.4, 0.4, 1.0] });

  // Head
  b.part(new THREE.SphereGeometry(0.036, 10, 8), BLACK, { bone: head, at: [0, H + 0.002, 0.075], scale: [1.25, 0.7, 0.85] });
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.02), DARK, { bone: head, at: [0, H + 0.0, 0.098] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.01, 6, 5), "#d9a441", { bone: head, at: [s * 0.04, H + 0.012, 0.085], scale: [0.8, 0.8, 1.1] });
  }

  // Mandibles: antler-like, jaw pair
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const jaw = b.joint(`jaw${side}`, { parent: head, at: [s * 0.016, H, 0.1], dir: [s * 0.2, 0, 1], role: "jaw" });
    const path = catmull([
      [s * 0.016, H, 0.1],
      [s * 0.036, H + 0.002, 0.14],
      [s * 0.044, H + 0.006, 0.18],
      [s * 0.03, H + 0.01, 0.215],
      [s * 0.016, H + 0.012, 0.225],
    ]);
    b.sweep(path, [0.011, 0.004], { bone: jaw, color: SHELL, caps: { end: "point" }, sides: 6 });
    // inner tines
    b.spike([s * 0.04, H + 0.004, 0.15], [-s * 0.5, 0.1, 0.9], 0.04, 0.005, { bone: jaw, color: HL });
    b.spike([s * 0.044, H + 0.007, 0.18], [-s * 0.6, 0.1, 0.8], 0.03, 0.004, { bone: jaw, color: HL });
    b.spike([s * 0.044, H + 0.008, 0.18], [s * 0.7, 0.4, 0.5], 0.025, 0.004, { bone: jaw, color: SHELL2 });
  }

  // Antennae with comb tips
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const a0: [number, number, number] = [s * 0.025, H + 0.01, 0.105];
    const a1: [number, number, number] = [s * 0.055, H + 0.03, 0.14];
    const a2: [number, number, number] = [s * 0.07, H + 0.04, 0.17];
    const ant = b.chain(`antenna${side}`, catmull([a0, a1, a2]), { parent: head, names: [`antenna${side}1`, `antenna${side}2`], role: "digit" });
    b.sweep(ant, 0.003, { color: DARK, sides: 5 });
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.02, 0.004, 0.006), HL, {
        bone: ant.joints[1], at: [s * (0.066 + i * 0.002), H + 0.039 + i * 0.002, 0.165 + i * 0.008],
        rotation: [0, s * -20, 0],
      });
    }
  }

  // Legs: 3 pairs, spread out
  const legZ = [0.05, 0.01, -0.035];
  const reach = [0.07, 0.095, 0.09];
  const fz = [0.1, 0.02, -0.095];
  for (let i = 0; i < 3; i++) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hip: [number, number, number] = [s * 0.025, H - 0.003, legZ[i]];
      const knee: [number, number, number] = [s * (0.025 + reach[i] * 0.6), H + 0.03, legZ[i] + (i === 0 ? 0.03 : i === 1 ? 0 : -0.03)];
      const foot: [number, number, number] = [s * (0.025 + reach[i]), 0.004, fz[i]];
      const leg = b.chain(`leg${i}${side}`, [hip, knee, foot], {
        parent: i === 0 ? thorax : root,
        names: [`hip${i}${side}`, `knee${i}${side}`, `foot${i}${side}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, [0.008, 0.005], { color: LEG, sides: 6, caps: "round" });
      b.part(new THREE.SphereGeometry(0.009, 6, 5), SHELL, { bone: leg.joints[1], at: knee });
      // tarsal claw
      b.spike(foot, [s * 0.5, -0.5, 0.3], 0.014, 0.004, { color: BLACK, bone: leg.joints[2] });
      // spines on tibia
      b.spike(mid3(knee, foot, 0.5), [s, 0.2, 0], 0.012, 0.003, { color: HL, bone: leg.joints[1] });
    }
  }

  function mid3(a: number[], c: number[], t: number): [number, number, number] {
    return [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
  }

  return b.root;
}
```