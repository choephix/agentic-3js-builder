```ts
import * as THREE from "three";
import { createBuilder, rng, stripes, grain } from "agentic-3js-builder";

export const meta = {
  name: "Treasure Chest",
  description: "Banded wooden pirate chest with an open domed lid, gold hoard, coins and gems.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "chest" });
  const W = 0.9, D = 0.56, H = 0.4, FLOOR = 0.04;
  const IRON = "#3a3f47", GOLD = "#e3b23c";

  b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0], role: "spine" });
  const lid = b.joint("lid", { parent: "base", at: [0, H, -D / 2], dir: [0, 1, 0], role: "hinge" });

  const wood = stripes(grain("#8a5a30", "#7a4c26", { size: 0.02, axis: "x" }), "#4a2c14", {
    size: 0.09, axis: "y", width: 0.07, wobble: 0.05,
  });
  const lidWood = stripes(grain("#94603400".slice(0, 0) + "#946034", "#83532b", { size: 0.02, axis: "x" }), "#4a2c14", {
    size: 0.09, axis: "z", width: 0.07, wobble: 0.05,
  });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const half = (len: number, r: number) =>
    new THREE.CylinderGeometry(r, r, len, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2);
  const LS: [number, number, number] = [1, 0.75, 1];

  // body
  b.part(box(W, H - FLOOR, D), wood, { at: [0, (H + FLOOR) / 2, 0], bone: "base", name: "body" });
  // feet
  for (const x of [-0.38, 0.38])
    for (const z of [-0.22, 0.22])
      b.part(box(0.1, FLOOR + 0.01, 0.1), "#4a2c14", { at: [x, FLOOR / 2, z], bone: "base" });
  // body iron bands + corner plates
  for (const x of [-0.3, 0.3]) {
    b.part(box(0.07, H - FLOOR + 0.01, D + 0.02), IRON, { at: [x, (H + FLOOR) / 2, 0], bone: "base" });
    for (const z of [-0.29, 0.29]) b.part(box(0.1, 0.07, 0.025), IRON, { at: [x, FLOOR + 0.04, z], bone: "base" });
  }
  for (const x of [-W / 2, W / 2])
    for (const z of [-D / 2, D / 2])
      b.part(box(0.04, H - FLOOR + 0.012, 0.04), IRON, { at: [x, (H + FLOOR) / 2, z], bone: "base" });
  // top rim
  b.part(box(W + 0.02, 0.02, D + 0.02), IRON, { at: [0, H - 0.01, 0], bone: "base" });

  // lid
  b.part(half(W, D / 2), lidWood, { at: [0, H, 0], scale: LS, bone: lid, name: "lidShell" });
  for (const x of [-0.3, 0.3]) b.part(half(0.07, D / 2 + 0.012), IRON, { at: [x, H, 0], scale: LS, bone: lid });
  b.part(box(W + 0.02, 0.02, D + 0.02), IRON, { at: [0, H + 0.01, 0], bone: lid });
  // lid front lock tab
  b.part(box(0.09, 0.07, 0.02), GOLD, { at: [0, H + 0.0, D / 2 + 0.01], bone: lid });

  // hinges
  for (const x of [-0.3, 0.3])
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8).rotateZ(Math.PI / 2), IRON, {
      at: [x, H, -D / 2 - 0.01], bone: "base",
    });

  // lock plate on front
  b.part(box(0.14, 0.15, 0.025), GOLD, { at: [0, H - 0.06, D / 2 + 0.012], bone: "base", name: "lock" });
  b.part(box(0.02, 0.05, 0.01), "#2a1a0c", { at: [0, H - 0.07, D / 2 + 0.028], bone: "base" });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 8).rotateX(Math.PI / 2), "#2a1a0c", {
    at: [0, H - 0.04, D / 2 + 0.028], bone: "base",
  });
  // studs on bands
  for (const x of [-0.3, 0.3])
    for (let i = 0; i < 3; i++)
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [x, 0.1 + i * 0.1, D / 2 + 0.018], bone: "base" });

  // open the lid
  b.pose(lid, { axis: [1, 0, 0], deg: -62 });

  // treasure hoard
  b.part(new THREE.SphereGeometry(0.26, 10, 6), "#d9a526", {
    at: [0, H - 0.01, 0], scale: [1.6, 0.36, 1.0], bone: "base", name: "hoard",
  });
  const r = rng(11);
  const coinG = new THREE.CylinderGeometry(0.035, 0.035, 0.008, 10);
  const cols = ["#f2c744", "#e3b23c", "#cf9a2a"];
  for (let i = 0; i < 34; i++) {
    const x = (r() - 0.5) * 0.7, z = (r() - 0.5) * 0.36;
    const y = H + 0.085 * Math.max(0, 1 - (x / 0.42) ** 2 - (z / 0.26) ** 2) + 0.005;
    b.part(coinG, cols[i % 3], {
      at: [x, y, z], rotation: [(r() - 0.5) * 70, r() * 360, (r() - 0.5) * 70], bone: "base",
    });
  }
  const gem = (c: string, x: number, z: number, s: number) =>
    b.part(new THREE.OctahedronGeometry(s), c, {
      at: [x, H + 0.075 * Math.max(0.2, 1 - (x / 0.42) ** 2 - (z / 0.26) ** 2) + s * 0.5, z],
      rotation: [20, 30, 10], bone: "base",
    });
  gem("#d62a3c", -0.15, 0.05, 0.04);
  gem("#2a6fe0", 0.12, -0.06, 0.035);
  gem("#2ec47a", 0.25, 0.08, 0.03);
  gem("#b45ae0", -0.28, -0.08, 0.028);
  // pearl string
  for (let i = 0; i < 7; i++)
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#f3efe6", {
      at: [-0.05 + i * 0.03, H + 0.06 - Math.abs(i - 3) * 0.004, 0.14], bone: "base",
    });

  return b.root;
}
```