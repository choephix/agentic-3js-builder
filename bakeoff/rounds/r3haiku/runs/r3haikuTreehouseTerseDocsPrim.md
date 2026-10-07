```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";
import { createBuilder, grain, mottle, scales } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description: "A red-roofed plank treehouse on a tall oak, with a ladder, railings, windows, a lantern and a flag.",
};

// Palette
const BARK = grain("#6b4a2e", "#4a3220", { size: 0.25, axis: "y" });
const PLANK = grain("#c9a06a", "#a9794a", { size: 0.18, axis: "x" });
const WALL = grain("#e2bd86", "#c79f68", { size: 0.14, axis: "y" });
const ROOF = scales("#b5483a", "#7e2e25", { size: 0.16 });
const LEAF = mottle("#4f9a3c", "#2f6b2a", { size: 0.5 });
const LEAF_LIGHT = mottle("#7cc152", "#4c9440", { size: 0.4 });
const GRASS = mottle("#8cc85e", "#5a9a40", { size: 0.6 });
const DARK = "#2b2118";
const GLASS = "#ffd77a";
const DOOR = "#7a4a2a";
const RED = "#e0463a";
const TRIM = "#f5ecd2";
const METAL = "#8a8f96";

export default function build() {
  const b = createBuilder({ name: "treehouse" });

  // Root joint: the model is scenery, so one joint carries everything.
  b.joint("base", { at: [0, 0, 0] });

  const leaf = (x: number, y: number, z: number, r: number, c: typeof LEAF) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), c, { at: [x, y, z], flat: true });

  const box = (w: number, h: number, d: number, at: [number, number, number], c: string | typeof WALL) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at });

  // Ground: a low grassy disc, its bottom sinking slightly below the floor line.
  b.part(new THREE.CylinderGeometry(3.2, 3.4, 0.12, 14), GRASS, { at: [0, -0.06, 0], flat: true });
  leaf(-2.7, 0.3, 1.7, 0.45, LEAF_LIGHT);
  leaf(2.9, 0.28, -0.9, 0.4, LEAF_LIGHT);
  leaf(-2.2, 0.22, -2.0, 0.32, LEAF);

  // Trunk: one tapering tube, flat at the root so it sits on the ground.
  const trunk = catmull([
    [0, 0, 0],
    [0, 2, 0.1],
    [0, 4, -0.05],
    [0.1, 6.2, 0],
  ]);
  b.sweep(trunk, (t: number) => 0.42 - 0.18 * t, {
    caps: { start: "flat" },
    color: BARK,
  });

  // Branches: struts under the platform and limbs up into the canopy.
  b.capsule([0, 3.0, 0.2], [-1.5, 3.05, 1.5], 0.08, { color: BARK });
  b.capsule([0, 3.0, -0.2], [1.5, 3.05, -1.5], 0.08, { color: BARK });
  b.capsule([0, 4.6, 0], [-1.9, 5.4, -1.0], [0.12, 0.05], { color: BARK });
  b.capsule([0, 5.2, -0.2], [1.9, 5.6, -1.0], [0.12, 0.05], { color: BARK });
  b.capsule([0.1, 6.0, 0], [-0.9, 6.8, -2.0], [0.1, 0.04], { color: BARK });

  // Canopy: clusters of faceted leaf balls, kept to the sides and back so the roof reads.
  leaf(-1.9, 5.5, -1.1, 1.5, LEAF);
  leaf(1.9, 5.7, -1.0, 1.4, LEAF_LIGHT);
  leaf(0.2, 7.5, -1.7, 1.1, LEAF_LIGHT);
  leaf(-0.9, 6.9, -2.1, 1.2, LEAF);
  leaf(0.3, 5.0, -2.2, 1.0, LEAF);
  leaf(-2.5, 4.4, 0.9, 1.0, LEAF_LIGHT);
  leaf(2.4, 4.6, 0.6, 0.9, LEAF);
  leaf(-1.2, 7.0, -0.2, 0.9, LEAF_LIGHT);

  // Platform with trim.
  box(3.4, 0.14, 3.4, [0, 3.2, 0], PLANK);

  // Railings: posts at the corners, rails round three sides, a gap at the ladder.
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.07, 0.72, 0.07, [sx * 1.62, 3.63, sz * 1.62], PLANK);
  box(3.3, 0.06, 0.06, [0, 3.95, -1.62], PLANK);
  box(0.06, 0.06, 3.3, [-1.62, 3.95, 0], PLANK);
  box(0.06, 0.06, 3.3, [1.62, 3.95, 0], PLANK);
  box(2.3, 0.06, 0.06, [-0.47, 3.95, 1.62], PLANK);

  // Cabin walls, eave band and pitched roof (a square pyramid aligned to the walls).
  box(2.6, 2.2, 2.6, [0, 4.37, 0], WALL);
  box(2.7, 0.12, 2.7, [0, 5.44, 0], PLANK);
  b.part(new THREE.ConeGeometry(2.12, 1.3, 4), ROOF, {
    at: [0, 6.12, 0],
    rotation: [0, 45, 0],
    flat: true,
  });

  // Door on the front (+Z), with a knob.
  box(0.6, 1.4, 0.05, [0.5, 3.97, 1.33], DOOR);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), METAL, { at: [0.62, 3.95, 1.37] });

  // Front window with frame and glass.
  box(0.62, 0.62, 0.04, [-0.7, 4.6, 1.32], TRIM);
  box(0.48, 0.48, 0.03, [-0.7, 4.6, 1.345], GLASS);

  // Side windows on both flanks.
  for (const sx of [-1, 1]) {
    box(0.04, 0.62, 0.62, [sx * 1.32, 4.6, 0], TRIM);
    box(0.03, 0.48, 0.48, [sx * 1.345, 4.6, 0], GLASS);
  }

  // Back window.
  box(0.62, 0.62, 0.04, [0, 4.6, -1.32], TRIM);
  box(0.48, 0.48, 0.03, [0, 4.6, -1.345], GLASS);

  // Lantern hanging beside the door.
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 5), DARK, { at: [-0.5, 5.15, 1.3] });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), "#ffb347", { at: [-0.5, 4.98, 1.36], flat: true });

  // Ladder on the front-right, rising to the platform edge.
  for (const x of [0.95, 1.45]) box(0.06, 3.4, 0.06, [x, 1.7, 1.85], PLANK);
  for (let i = 0; i < 9; i++) box(0.56, 0.035, 0.05, [1.2, 0.35 + i * 0.35, 1.85], PLANK);

  // Flag on a pole at the roof peak.
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6), DARK, { at: [0, 7.17, 0] });
  b.extrude(
    [
      [0, 0],
      [0.6, 0.08],
      [0, 0.16],
    ],
    { at: [0, 7.45, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: RED },
  );

  return b.root;
}
```