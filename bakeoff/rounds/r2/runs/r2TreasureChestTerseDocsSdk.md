```ts
import * as THREE from "three";
import { createBuilder, paint, grain, mix } from "agentic-3js-builder";

export const meta = {
  name: "Treasure Chest",
  description: "Wooden pirate chest with iron bands, brass lock and an open lid full of gold coins and gems.",
};

export default function build() {
  const b = createBuilder({ name: "chest" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: base, at: [0, 0.5, -0.3], dir: [1, 0, 0], role: "hinge" });

  const WOOD = grain("#7a4a24", "#5c3418", { size: 0.04, axis: "x" });
  const WOOD2 = grain("#8a5629", "#693c1c", { size: 0.04, axis: "x" });
  const IRON = "#3a3d44";
  const BRASS = "#d9a62e";
  const GOLD = "#ffcf33";
  const DARK = "#1e130b";

  const W = 0.9, D = 0.6, H = 0.5;

  // body (open box: floor, walls)
  b.part(new THREE.BoxGeometry(W, 0.04, D), WOOD, { bone: base, at: [0, 0.02, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, H, D), WOOD, { bone: base, at: [s * (W / 2 - 0.02), H / 2, 0] });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(W - 0.08, H, 0.04), WOOD2, { bone: base, at: [0, H / 2, s * (D / 2 - 0.02)] });
  }
  // plank lines
  for (const y of [0.17, 0.34]) {
    b.part(new THREE.BoxGeometry(W + 0.005, 0.008, D + 0.005), DARK, { bone: base, at: [0, y, 0] });
  }
  // treasure fill
  b.part(new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.1), GOLD, { bone: base, at: [0, H - 0.1, 0] });
  const r = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const coinG = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10);
  for (let i = 0; i < 26; i++) {
    const x = (r() - 0.5) * (W - 0.2), z = (r() - 0.5) * (D - 0.2);
    const m = b.part(coinG, i % 3 ? GOLD : BRASS, {
      bone: base, at: [x, H - 0.07 + r() * 0.06, z],
      rotation: [(r() - 0.5) * 50, r() * 180, (r() - 0.5) * 50],
    });
    void m;
  }
  const gems = ["#d2263a", "#2b8be0", "#2bc47a"];
  gems.forEach((c, i) => {
    b.part(new THREE.OctahedronGeometry(0.045), c, {
      bone: base, at: [-0.25 + i * 0.25, H - 0.03, 0.05 - i * 0.08], rotation: [20 * i, 30 * i, 10],
    });
  });

  // iron bands on body
  for (const x of [-0.3, 0.3]) {
    b.part(new THREE.BoxGeometry(0.1, H + 0.02, D + 0.03), IRON, { bone: base, at: [x, H / 2, 0] });
  }
  // corner brackets & feet
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.09, 0.14, 0.09), IRON, { bone: base, at: [sx * (W / 2 - 0.01), 0.07, sz * (D / 2 - 0.01)] });
  }
  // lock plate
  b.part(new THREE.BoxGeometry(0.12, 0.14, 0.02), BRASS, { bone: base, at: [0, H - 0.1, D / 2 + 0.02] });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.025, 8), DARK, { bone: base, at: [0, H - 0.1, D / 2 + 0.04], rotation: [90, 0, 0] });
  // rivets
  for (const x of [-0.3, 0.3]) for (const y of [0.08, 0.42]) {
    b.part(new THREE.SphereGeometry(0.015, 6, 4), BRASS, { bone: base, at: [x, y, D / 2 + 0.02] });
  }

  // lid, opened ~110 deg, built closed then posed
  const lc = [0, 0.5, -0.3]; // hinge
  const lidWood = WOOD2;
  // curved top: half cylinder along x
  const arch = new THREE.CylinderGeometry(D / 2, D / 2, W, 10, 1, false, 0, Math.PI);
  b.part(arch, lidWood, { bone: lid, at: [0, H, 0], rotation: [0, 0, 90], flat: true });
  // rotate so arch bulges up: cylinder axis along x, half circle faces +z->; fix via rotation order
  for (const s of [1, -1]) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, D / 2, 0, Math.PI, false);
    const g = new THREE.ShapeGeometry(shape, 10);
    b.part(g, WOOD, { bone: lid, at: [s * (W / 2 + 0.001), H, 0], rotation: [0, s * 90, 0] });
  }
  for (const x of [-0.3, 0.3]) {
    b.part(new THREE.CylinderGeometry(D / 2 + 0.02, D / 2 + 0.02, 0.1, 10, 1, false, 0, Math.PI), IRON, {
      bone: lid, at: [x, H, 0], rotation: [0, 0, 90], flat: true,
    });
  }
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.03), BRASS, { bone: lid, at: [0, H + 0.01, D / 2 + 0.01] });

  b.pose(lid, { axis: [1, 0, 0], deg: -105 });
  // hinge barrel
  b.part(new THREE.CylinderGeometry(0.025, 0.025, W + 0.04, 8), IRON, { bone: base, at: [0, 0.5, -0.31], rotation: [0, 0, 90] });

  return b.root;
}
```