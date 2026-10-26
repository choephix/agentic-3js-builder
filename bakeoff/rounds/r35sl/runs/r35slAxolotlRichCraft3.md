```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, svg, countershade, mottle, bezier, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = { name: "Axolotl", description: "Chibi axolotl with frilly pink gills" };

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const SKIN = countershade(mottle("#f6c3cf", "#eaa9bd", { size: 0.12, seed: 3 }), "#fde6e8", { level: -0.2 });
  const PINK = "#ff5f8f", DEEP = "#d93a73", DARK = "#2a1a2e";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.1, -0.1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.12, -0.1], [0, 0.14, 0.05], [0, 0.17, 0.18]]), { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] });
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.17, 0.18], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.12, 0.3], aim: [0, 0.1, 0.42], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.1, -0.1], [0, 0.1, -0.4], [0, 0.12, -0.7], [0, 0.16, -0.95]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });

  // body & tail
  b.sweep(catmull([[0, 0.12, -0.55], [0, 0.12, -0.1], [0, 0.14, 0.05], [0, 0.16, 0.2]]), [0.1, 0.13], { bone: [hips, spine], color: SKIN, shift: [0, 0] });
  b.sweep(tail, (t) => [0.07 * (1 - t) + 0.015, 0.1 * (1 - t) + 0.03], { color: SKIN });
  // tail fin
  b.extrude([[0, -0.03], [0.5, -0.07], [0.7, 0], [0.5, 0.07], [0, 0.04]].map(([x, y]) => [x, y] as [number, number]), {
    at: [0, 0.2, -0.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.008, color: "#f4a5bd", bone: tail.joints[1], smoothing: 1,
  });

  // head: big chibi
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: head, at: [0, 0.2, 0.3], scale: [0.27, 0.18, 0.22] });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#fde6e8", { bone: jaw, at: [0, 0.14, 0.42], scale: [0.2, 0.05, 0.14] });

  // eyes
  const EYE = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#2a1a2e"/><circle cx="14" cy="13" r="7" fill="#fff"/><circle cx="26" cy="27" r="3" fill="#fff"/></svg>`, { size: 96 });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.05, 14), "#ffffff", { bone: head, at: [s * 0.12, 0.25, 0.505], dir: [s * 0.15, 0.05, 1], axis: "z", texture: EYE });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#ff9db8", { bone: head, at: [s * 0.17, 0.17, 0.46], scale: [0.04, 0.025, 0.01] });
    // gills: three fronds each
    for (let i = 0; i < 3; i++) {
      const a = 0.12 + i * 0.07;
      const base: [number, number, number] = [s * 0.2, 0.22 + i * 0.01, 0.18];
      const tip = offset(base, [s * 1, 0.55 + i * 0.35, -0.25], 0.22 + (i === 1 ? 0.04 : 0));
      const rod = b.sweep(bezier(base, offset(base, [s, 0.2, -0.1], 0.1), tip), [0.012, 0.004], { bone: head, color: DEEP });
      for (let k = 1; k <= 4; k++) {
        const p = rod.at(k / 5);
        b.spike(p, [s * 0.6, 1, 0.1], 0.07 - k * 0.006, 0.01, { color: PINK, bone: head });
        b.spike(p, [s * 0.9, 0.2, -0.5], 0.06, 0.009, { color: PINK, bone: head });
      }
      b.part(new THREE.SphereGeometry(0.012, 6, 4), "#ffb3cc", { bone: head, at: tip });
      void a;
    }
  }
  // nostrils & smile
  b.sweep(catmull([[-0.1, 0.13, 0.5], [0, 0.115, 0.53], [0.1, 0.13, 0.5]]), 0.004, { bone: head, color: DARK });

  // legs
  const r = rng(2);
  for (const s of [1, -1]) {
    for (const [z, nm] of [[0.12, "F"], [-0.2, "H"]] as const) {
      const side = s > 0 ? "L" : "R";
      const leg = b.chain(`leg${nm}${side}`, catmull([[s * 0.12, 0.1, z], [s * 0.2, 0.06, z + 0.02], [s * 0.26, 0.03, z + 0.06]]), { parent: nm === "F" ? spine.joints[1] : hips, role: "leg", names: [`hip${nm}${side}`, `knee${nm}${side}`, `foot${nm}${side}`] });
      b.sweep(leg, [0.04, 0.03], { color: SKIN });
      const foot = leg.at(1).at;
      b.part(new THREE.SphereGeometry(1, 6, 4), SKIN, { bone: leg.tip ?? leg.joints[1], at: [foot.x + s * 0.02, 0.018, foot.z + 0.02], scale: [0.05, 0.02, 0.06] });
      for (let d = -1; d <= 1; d++)
        b.spike([foot.x + s * 0.02 + d * 0.03 * 0.9, 0.02, foot.z + 0.06], [d * 0.3 * s, 0, 1], 0.04, 0.012, { bone: leg.tip ?? leg.joints[1], color: "#f4a5bd" });
    }
  }
  void r; void glow;
  return b.root;
}
```