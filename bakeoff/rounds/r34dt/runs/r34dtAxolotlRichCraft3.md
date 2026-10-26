```ts
import * as THREE from "three";
import { createBuilder, catmull, svg, countershade, mottle, rng } from "agentic-3js-builder";

export const meta = { name: "Axolotl", description: "Chibi axolotl with frilly pink gills" };

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const SKIN = "#f6c6d0", BELLY = "#fde6e8", GILL = "#ff5f9a", GILL2 = "#ff9cc2", DARK = "#3a2030";
  const skin = countershade(mottle("#f3b9c8", "#f9d3da", { size: 0.08, seed: 3 }), BELLY, { level: -0.2 });

  const hips = b.joint("hips", { at: [0, 0.1, -0.05], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.1, -0.05], [0, 0.12, 0.08], [0, 0.14, 0.18]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.15, 0.17], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.09, 0.3], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.09, -0.1], [0, 0.08, -0.3], [0, 0.07, -0.5], [0, 0.08, -0.65]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });

  // body and tail
  b.sweep(catmull([[0, 0.1, -0.12], [0, 0.11, 0.05], [0, 0.13, 0.16]]), [0.1, 0.11], { bone: [hips, spine.joints[0], spine.joints[1]], color: skin });
  b.sweep(tail, (t) => [0.07 * (1 - t) + 0.02, 0.09 * (1 - t) + 0.03], { color: skin });
  // tail fin
  const fin = b.extrude([[0, 0], [0.5, 0.0], [0.45, 0.12], [0.2, 0.15], [0, 0.08]], { at: [0, 0.1, -0.12], x: [0, 0, -1], thickness: 0.012, color: GILL2, bone: tail.joints[0], smoothing: 1 });
  void fin;

  // head: big and wide
  b.part(new THREE.SphereGeometry(1, 12, 9), skin, { bone: head, at: [0, 0.14, 0.2], scale: [0.2, 0.15, 0.17] });
  b.part(new THREE.SphereGeometry(1, 10, 7), skin, { bone: head, at: [0, 0.11, 0.3], scale: [0.14, 0.07, 0.09] });
  b.part(new THREE.SphereGeometry(1, 10, 6), "#f0a6b8", { bone: jaw, at: [0, 0.075, 0.3], scale: [0.12, 0.03, 0.09] });

  // eyes and smile
  const eye = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="${DARK}"/><circle cx="14" cy="13" r="6" fill="#fff"/><circle cx="26" cy="27" r="3" fill="#fff"/></svg>`, { size: 64 });
  const smile = svg(`<svg viewBox="0 0 60 20"><path d="M4 4 Q30 22 56 4" stroke="${DARK}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`, { size: 96 });
  const cheek = svg(`<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#ff7aa6"/></svg>`, { size: 32 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", { bone: head, at: [s * 0.1, 0.2, 0.34], dir: [s * 0.25, 0, 1], axis: "z", texture: eye });
    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", { bone: head, at: [s * 0.15, 0.13, 0.31], dir: [s * 0.6, 0, 1], axis: "z", texture: cheek });
  }
  b.part(new THREE.PlaneGeometry(0.1, 0.035), "#ffffff", { bone: head, at: [0, 0.095, 0.375], dir: [0, 0, 1], axis: "z", texture: smile });

  // gills: three feathery fronds per side
  const r = rng(5);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const a = 0.5 + i * 0.32;
      const base: [number, number, number] = [s * 0.17, 0.17 + i * 0.03 - 0.03, 0.13];
      const tip: [number, number, number] = [s * (0.34 + i * 0.01), 0.2 + i * 0.1, 0.1 - i * 0.03];
      b.sweep(catmull([base, [s * 0.26, 0.19 + i * 0.05, 0.12], tip]), [0.02, 0.006], { bone: head, color: GILL, caps: { end: "point" } });
      for (let k = 0; k < 4; k++) {
        const t = 0.35 + k * 0.17;
        const p: [number, number, number] = [base[0] + (tip[0] - base[0]) * t, base[1] + (tip[1] - base[1]) * t, base[2] + (tip[2] - base[2]) * t];
        b.spike(p, [s * 0.5, 0.8 + r() * 0.3, 0.1], 0.07 - k * 0.008, 0.009, { bone: head, color: GILL2 });
      }
      void a;
    }
  }

  // legs: chubby stubs with toes
  for (const s of [1, -1]) {
    for (const [z, n] of [[0.1, "F"], [-0.12, "H"]] as const) {
      const root: [number, number, number] = [s * 0.1, 0.09, z];
      const foot: [number, number, number] = [s * 0.2, 0.025, z + 0.04];
      const leg = b.chain(`leg${n}${s > 0 ? "L" : "R"}`, [root, [s * 0.16, 0.05, z + 0.01], foot], { parent: hips, role: "leg", names: [`hip${n}${s > 0 ? "L" : "R"}`, `knee${n}${s > 0 ? "L" : "R"}`] });
      b.sweep(leg, [0.04, 0.032], { color: skin });
      for (let t = -1; t <= 1; t++)
        b.capsule([foot[0], 0.02, foot[2]], [foot[0] + s * 0.02 + t * 0.0, 0.012, foot[2] + 0.05 + 0.0], 0.012, { bone: leg.joints[1], color: SKIN, ...(t ? {} : {}) });
    }
  }
  return b.root;
}
```