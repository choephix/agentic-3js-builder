```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, countershade, mottle, svg, rng, limb } from "agentic-3js-builder";

export const meta = { name: "Axolotl", description: "Chibi axolotl with frilly pink gills, big eyes and a finned tail." };

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const SKIN = "#f4c2cf", BELLY = "#fde6ea", PINK = "#ff6f9c", DEEP = "#d9447c", INK = "#3a1630";
  const skinPaint = countershade(mottle("#f0b3c4", "#f9d0da", { size: 0.08, seed: 3 }), BELLY, { level: -0.2 });

  const hips = b.joint("hips", { at: [0, 0.1, -0.02], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.1, -0.02], [0, 0.12, 0.1], [0, 0.14, 0.2]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.15, 0.2], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.1, 0.3], aim: [0, 0.1, 0.4], role: "jaw" });

  // body & head (big chibi head)
  b.sweep(catmull([[0, 0.1, -0.12], [0, 0.12, 0.05], [0, 0.14, 0.18]]), [0.1, 0.12], { bone: hips, color: skinPaint });
  b.part(new THREE.SphereGeometry(1, 12, 9), skinPaint, { bone: head, at: [0, 0.17, 0.3], scale: [0.2, 0.15, 0.17] });
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, { bone: jaw, at: [0, 0.09, 0.38], scale: [0.14, 0.04, 0.1] });
  // smile
  b.sweep(catmull([[-0.1, 0.115, 0.46], [0, 0.1, 0.49], [0.1, 0.115, 0.46]]), 0.004, { bone: head, color: DEEP });

  // eyes
  const EYE = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${INK}"/><circle cx="32" cy="32" r="26" fill="#2a1a3a"/><circle cx="23" cy="22" r="10" fill="#fff"/><circle cx="40" cy="40" r="5" fill="#fff"/></svg>`, { size: 128 });
  const BLUSH = svg(`<svg viewBox="0 0 64 32"><ellipse cx="32" cy="16" rx="28" ry="12" fill="#ff7aa0" opacity="0.9"/></svg>`, { size: 64 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), "#ffffff", { bone: head, at: [s * 0.1, 0.25, 0.4], scale: [1, 1, 0.6] });
    b.part(new THREE.CircleGeometry(0.045, 14), "#ffffff", { bone: head, at: [s * 0.1, 0.25, 0.434], dir: [s * 0.2, 0.1, 1], axis: "z", texture: EYE });
    b.part(new THREE.PlaneGeometry(0.07, 0.035), "#ffffff", { bone: head, at: [s * 0.15, 0.15, 0.4], dir: [s * 0.8, 0, 1], axis: "z", texture: BLUSH });
    // nostrils
    b.part(new THREE.SphereGeometry(0.008, 5, 4), DEEP, { bone: head, at: [s * 0.03, 0.2, 0.465] });

    // gills: three frilly feathery stalks each side
    for (let i = 0; i < 3; i++) {
      const a = 0.35 + i * 0.28;
      const base: [number, number, number] = [s * 0.18, 0.2 + i * 0.045 - 0.02, 0.22];
      const tip: [number, number, number] = [s * (0.4 + i * 0.03), 0.28 + i * 0.1, 0.1 - i * 0.03];
      const mid: [number, number, number] = [s * 0.3, 0.2 + i * 0.07, 0.2 - i * 0.02];
      const stalk = bezier(base, mid, tip);
      b.sweep(stalk, [0.016, 0.006], { bone: head, color: DEEP });
      for (let k = 1; k <= 5; k++) {
        const t = k / 6, p = stalk.at(t);
        const L = 0.1 - t * 0.04;
        for (const d of [-1, 1]) {
          const e: [number, number, number] = [p.x + s * 0.03, p.y + d * L * 0.9 + 0.02, p.z - 0.03 + d * 0.01];
          b.spike(p, e, null, 0.012, { bone: head, color: k % 2 ? PINK : "#ff93b6" });
        }
      }
      b.part(new THREE.SphereGeometry(0.02, 6, 4), PINK, { bone: head, at: tip });
      void a;
    }
  }

  // legs
  for (const s of [1, -1]) {
    for (const [z, nm] of [[0.12, "F"], [-0.1, "H"]] as [number, string][]) {
      const side = s > 0 ? "L" : "R";
      const root: [number, number, number] = [s * 0.1, 0.07, z];
      const pts = limb(root, [s * 0.2, 0.025, z + 0.04], [0.07, 0.07], [[0, 0, -1]]);
      const leg = b.chain(`leg${nm}${side}`, pts, { parent: hips, role: "leg", names: [`hip${nm}${side}`, `knee${nm}${side}`, `foot${nm}${side}`] });
      b.sweep(leg, [0.032, 0.025], { color: SKIN });
      const f = leg.tip!;
      b.part(new THREE.SphereGeometry(0.04, 8, 5), skinPaint, { bone: f, at: [s * 0.21, 0.02, z + 0.05], scale: [1.1, 0.5, 1.2] });
      for (let d = -1; d <= 1; d++)
        b.capsule([s * 0.21 + d * 0.025 * s, 0.02, z + 0.07], [s * (0.22 + d * 0.035), 0.018, z + 0.115], 0.01, { bone: f, color: PINK });
    }
  }

  // tail with fin
  const tailPath = catmull([[0, 0.1, -0.12], [0, 0.09, -0.3], [0.04, 0.08, -0.5], [-0.03, 0.09, -0.68]]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail", count: 4 });
  b.sweep(tail, (t) => [0.085 * (1 - t) + 0.02, 0.07 * (1 - t) + 0.02], { color: skinPaint });
  const fin = b.extrude([[0, 0], [0.2, 0.02], [0.4, 0.04], [0.55, 0.02], [0.5, -0.02], [0.3, -0.04], [0.1, -0.03]], {
    at: [0, 0.11, -0.2], x: [0, 0, -1], thickness: 0.008, smoothing: 1, color: PINK, bone: tail.joints[1],
  });
  void fin;
  const fin2 = b.extrude([[0, 0], [0.2, -0.06], [0.4, -0.09], [0.5, -0.04], [0.3, 0.0]], {
    at: [0, 0.05, -0.2], x: [0, 0, -1], thickness: 0.008, smoothing: 1, color: "#ff8fb0", bone: tail.joints[1],
  });
  void fin2;
  void rng;

  return b.root;
}
```