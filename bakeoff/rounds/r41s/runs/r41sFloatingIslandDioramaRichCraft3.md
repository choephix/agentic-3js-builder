```ts
import * as THREE from "three";
import { createBuilder, rng, mottle, countershade, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Sky Island",
  description: "Floating island with ruined arches, a waterfall, glowing crystals and trees in a stylized Genshin-like look.",
};

export default function build() {
  const b = createBuilder({ name: "skyisland" });
  const r = rng(5);
  const Y0 = 1.2; // island sits above floor; hangs in the air
  const GRASS = mottle("#7ccf5a", "#a6e06a", { size: 0.5, seed: 2 });
  const ROCK = countershade(mottle("#8a7a68", "#a89880", { size: 0.35, seed: 4 }), "#4a4050", { level: -0.2 });
  const STONE = mottle("#d9d2bc", "#b9b29c", { size: 0.2, seed: 8 });
  const WATER = "#6fd8f0";

  // grassy top disc
  b.lathe([[0, 0], [1.9, 0], [2, -0.12], [1.95, -0.25], [0, -0.25]], { at: [0, Y0 + 0.9, 0], segments: 10, color: GRASS });
  // inverted rock underside
  b.lathe(
    [[0, 0], [1.95, 0], [1.6, -0.5], [1.1, -1.0], [0.7, -1.5], [0.25, -2.0], [0, -2.1]],
    { at: [0, Y0 + 0.65, 0], segments: 9, color: ROCK }
  );
  // hanging rock spikes
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const rad = 1.0 + r() * 0.5;
    b.spike([Math.cos(a) * rad, Y0 + 0.3, Math.sin(a) * rad], [0, -1, 0], 0.5 + r() * 0.6, 0.12, { color: ROCK, sides: 6 });
  }
  // glowing crystals on underside
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.8;
    glow(b.spike([Math.cos(a) * 0.5, Y0 - 1.1, Math.sin(a) * 0.5], [0, -1, 0], 0.5, 0.08, { color: "#7ae8ff", sides: 5 }), 1.5);
  }

  // ruins: ring of pillars and an arch
  const top = Y0 + 0.9;
  for (const [x, z, h] of [[-0.9, -0.3, 0.7], [-0.3, -0.5, 0.5], [0.0, 0.0, 0.9], [-0.6, 0.4, 0.35]] as number[][]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.1, h, 6), STONE, { at: [x, top + h / 2, z] });
    b.part(new THREE.BoxGeometry(0.26, 0.05, 0.26), "#efe6c8", { at: [x, top + h + 0.02, z] });
  }
  b.part(new THREE.BoxGeometry(1.0, 0.1, 0.2), STONE, { at: [-0.45, top + 0.95, 0.0] });
  b.part(new THREE.BoxGeometry(0.2, 0.9, 0.2), STONE, { at: [-0.95, top + 0.45, 0.0] });
  b.part(new THREE.BoxGeometry(1.0, 0.06, 1.0), "#cfc7ae", { at: [-0.5, top + 0.03, 0.0] });
  const rune = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="#6fe6ff" stroke-width="3"/><path d="M16 6V26M8 12L24 20M24 12L8 20" stroke="#6fe6ff" stroke-width="3"/></svg>`, { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { at: [-0.5, top + 0.07, 0.0], dir: [0, 1, 0], axis: "z", texture: rune }), 1.3);

  // trees
  const tree = (x: number, z: number, s: number, col: string) => {
    b.rod([x, top, z], [x, top + 0.6 * s, z], 0.07 * s, "#7a5232", { sides: 6 });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.IcosahedronGeometry(0.36 * s * (1 - k * 0.2), 0), col, { at: [x, top + (0.75 + k * 0.28) * s, z], flat: true });
  };
  tree(1.0, 0.6, 1.2, "#ff9db8");
  tree(0.6, -1.0, 1.0, "#6cc65a");
  tree(1.2, -0.3, 0.8, "#ff9db8");
  tree(-1.3, 0.9, 0.9, "#58b84e");

  // waterfall at the front edge
  const wx = 0.2, wz = 1.9;
  b.part(new THREE.BoxGeometry(0.9, 0.04, 1.0), WATER, { at: [wx, top - 0.02, 1.35] }); // stream
  b.frustumBox([wx, top - 0.02, wz], [wx, top - 2.6, wz + 0.1], [0.45, 0.06], [0.3, 0.06], { color: WATER });
  glow(b.part(new THREE.SphereGeometry(0.28, 6, 4), "#dff8ff", { at: [wx, top - 2.7, wz + 0.1] }), 0.6);

  // floating islets
  for (const [x, y, z, s] of [[2.6, Y0 + 1.6, 0.5, 0.3], [-2.5, Y0 + 0.6, -0.8, 0.22]]) {
    b.part(new THREE.IcosahedronGeometry(s, 0), ROCK, { at: [x, y, z], flat: true });
    b.part(new THREE.CylinderGeometry(s, s * 0.9, 0.08, 7), GRASS, { at: [x, y + s * 0.8, z] });
  }
  return b.root;
}
```