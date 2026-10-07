```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, svg, mottle, countershade } from "agentic-3js-builder";

export const meta = { name: "Hedgehog", description: "A stylized low-poly hedgehog with a quill coat, snout, ears and four legs." };

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const SKIN = "#d9b48a", QUILL = "#6b4a2e", QUILL2 = "#a47e52", TIP = "#e8d9b8", DARK = "#1c1410", PINK = "#e59aa0", CLAW = "#4a3a2c";

  const hips = b.joint("hips", { at: [0, 0.1, -0.05], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.11, 0.1], aim: [0, 0.12, 0.2], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.12, 0.2], aim: [0, 0.12, 0.28], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.12, 0.26], aim: [0, 0.11, 0.38], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.095, 0.33], aim: [0, 0.088, 0.42], role: "jaw" });

  // body
  const bodyPath = catmull([[0, 0.1, -0.16], [0, 0.11, 0], [0, 0.11, 0.14]]);
  b.sweep(bodyPath, (t) => [0.12 - 0.05 * Math.pow(Math.abs(t - 0.4) * 1.6, 2) * 0.6, 0.1 - 0.02 * t], {
    bone: [hips, chest], color: countershade(mottle(QUILL, QUILL2, { size: 0.03 }), SKIN, { level: -0.35 }), sides: 8,
  });
  // belly
  b.part(new THREE.SphereGeometry(0.1, 8, 6), SKIN, { bone: hips, at: [0, 0.07, 0.02], scale: [1, 0.7, 1.5] });

  // quill coat: cones scattered over the dorsal body
  const surf = b.surface(b.root);
  const r = rng(5);
  const hits = surf.scatter(170, { rng: r, minDist: 0.032, filter: (h) => h.n.y > -0.05 && h.at.z < 0.1 });
  const cone = new THREE.ConeGeometry(0.02, 0.1, 5);
  hits.forEach((h, i) => {
    b.stick(cone, i % 3 === 0 ? QUILL2 : QUILL, h, { embed: 0.25, flow: [0, -0.2, -1], spin: i * 37, scale: 0.8 + r() * 0.5, bone: hips });
    if (i % 4 === 0) b.stick(new THREE.ConeGeometry(0.008, 0.03, 4), TIP, h.moved([0, 0.085, 0]), { embed: 0, bone: hips });
  });
  // fringe over forehead
  for (let i = 0; i < 7; i++) {
    const a = (i / 6 - 0.5) * 2.2;
    b.spike([Math.sin(a) * 0.1, 0.205, 0.22], [Math.sin(a) * 0.3, 0.5, 0.7], 0.08, 0.016, { color: QUILL2, bone: head });
  }

  // head & snout
  b.part(new THREE.SphereGeometry(0.085, 8, 6), SKIN, { bone: head, at: [0, 0.12, 0.29], scale: [1, 0.95, 1.1] });
  b.frustumBox([0, 0.108, 0.33], [0, 0.098, 0.44], [0.1, 0.08], [0.04, 0.04], { bone: head, color: SKIN });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), DARK, { bone: head, at: [0, 0.1, 0.455] });
  b.frustumBox([0, 0.088, 0.33], [0, 0.082, 0.42], [0.07, 0.02], [0.035, 0.015], { bone: jaw, color: PINK });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), DARK, { bone: head, at: [s * 0.05, 0.14, 0.36] });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), "#ffffff", { bone: head, at: [s * 0.054, 0.147, 0.375] });
    const ear = b.part(new THREE.SphereGeometry(0.03, 6, 4), PINK, { bone: head, at: [s * 0.075, 0.185, 0.26], scale: [0.6, 1, 0.8] });
    void ear;
  }

  // legs
  for (const s of [1, -1]) {
    for (const [nm, z, par] of [["F", 0.13, chest], ["H", -0.1, hips]] as const) {
      const top = [s * 0.07, 0.06, z] as [number, number, number];
      const hip = b.joint(`leg${nm}${s > 0 ? "L" : "R"}`, { parent: par, at: top, aim: [s * 0.075, 0.0, z + 0.01], role: "leg" });
      b.rod(top, [s * 0.075, 0.02, z + 0.01], [0.032, 0.026], { bone: hip, color: SKIN });
      const foot = b.joint(`foot${nm}${s > 0 ? "L" : "R"}`, { parent: hip, at: [s * 0.075, 0.02, z + 0.01], aim: [s * 0.075, 0.012, z + 0.06], role: "leg" });
      b.frustumBox([s * 0.075, 0.016, z + 0.0], [s * 0.075, 0.016, z + 0.06], [0.05, 0.03], [0.05, 0.03], { bone: foot, color: SKIN });
      for (let k = -1; k <= 1; k++) b.spike([s * 0.075 + k * 0.016, 0.014, z + 0.06], [0, -0.1, 1], 0.025, 0.007, { color: CLAW, bone: foot });
    }
  }
  // tiny tail
  const tail = b.joint("tail1", { parent: hips, at: [0, 0.09, -0.17], aim: [0, 0.08, -0.22], role: "tail" });
  b.spike([0, 0.09, -0.17], [0, -0.1, -1], 0.05, 0.02, { color: SKIN, bone: tail });

  return b.root;
}
```