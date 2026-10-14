```ts
import * as THREE from "three";
import { createBuilder, catmull, stripes, mottle, grain, rng } from "agentic-3js-builder";

export const meta = {
  name: "Japanese garden",
  description: "A raked-gravel garden with a stone lantern, a pond under a plank bridge, a pine, clipped azaleas, a stone basin and a bamboo fence.",
};

const GRAVEL = "#e8dfc9";
const GRAVEL_DARK = "#c9bc9a";
const WATER = "#2f5f68";
const WATER_DARK = "#1f434c";
const STONE = "#8d887d";
const STONE_DARK = "#6b675e";
const STONE_LIGHT = "#b9b3a6";
const WOOD = "#7a5a3c";
const BARK = "#5b4330";
const BARK_DARK = "#3a2a1e";
const PINE = "#2f5b3a";
const PINE_DARK = "#1d3d27";
const LEAF = "#3f7a3f";
const FLOWER = "#d0607f";
const BAMBOO = "#b9b06a";
const BAMBOO_DARK = "#8a8448";
const LIGHT = "#f6e7b0";

export default function build() {
  const b = createBuilder({ name: "japanese-garden" });

  // Root joint: the whole garden is scenery and rides this one bone.
  b.joint("ground", { at: [0, 0, 0] });

  // Raked gravel bed, top surface at y = 0.01.
  b.part(new THREE.BoxGeometry(6.4, 0.05, 6.4), stripes(GRAVEL, GRAVEL_DARK, { size: 0.09, width: 0.45 }), {
    at: [0, -0.015, 0],
  });

  // Pond: an irregular outline, water as a thin slab, rocks along the rim.
  const pc = [-0.6, -0.4];
  const pondPts: [number, number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r = 0.85 + 0.1 * Math.sin(3 * a) + 0.05 * Math.cos(5 * a);
    pondPts.push([pc[0] + r * Math.cos(a), 0.02, pc[1] + r * Math.sin(a)]);
  }
  b.slab(pondPts, {
    color: mottle(WATER, WATER_DARK, { size: 0.35, contrast: 0.4 }),
    thickness: 0.02,
  });

  const pondRim = catmull(pondPts, { closed: true });
  const pebble = rng(11);
  b.along(pondRim, 20, (at) => {
    const s = 0.1 + pebble() * 0.06;
    const q = at.at;
    b.part(new THREE.DodecahedronGeometry(s, 0), mottle(STONE, STONE_DARK, { size: 0.15 }), {
      at: [q.x, s * 0.2, q.z],
      scale: [1.2, 0.7, 1],
      flat: true,
    });
  });

  // Plank bridge arching over the pond.
  const bridge = catmull([
    [-1.6, 0.02, -0.4],
    [-1.05, 0.22, -0.4],
    [-0.6, 0.36, -0.4],
    [-0.15, 0.22, -0.4],
    [0.4, 0.02, -0.4],
  ]);
  b.sweep(bridge, () => [0.2, 0.03], { section: "box", color: WOOD });

  // Stepping stones from the viewer toward the bridge.
  const steps: [number, number, number][] = [
    [0.95, 0.02, 2.4],
    [0.65, 0.02, 1.8],
    [0.9, 0.02, 1.25],
    [0.55, 0.02, 0.7],
  ];
  for (const p of steps) {
    b.part(new THREE.CylinderGeometry(0.22, 0.25, 0.05, 7), mottle(STONE_LIGHT, STONE, { size: 0.2 }), {
      at: p,
      flat: true,
    });
  }

  // Stone lantern (tōrō) at the garden's left.
  const LANTERN: [number, number, number] = [1.9, 0, -0.9];
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.22, 0.05],
      [0.12, 0.12],
      [0.12, 0.2],
      [0, 0.2],
    ],
    { at: LANTERN, segments: 8, color: mottle(STONE, STONE_DARK, { size: 0.2 }) },
  );
  b.lathe(
    [
      [0, 0.2],
      [0.07, 0.2],
      [0.06, 0.62],
      [0.09, 0.66],
      [0, 0.66],
    ],
    { at: LANTERN, segments: 8, color: STONE },
  );
  b.lathe(
    [
      [0, 0.66],
      [0.2, 0.66],
      [0.2, 0.7],
      [0, 0.7],
    ],
    { at: LANTERN, segments: 4, spin: 45, color: STONE_DARK },
  );
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.2), LIGHT, { at: [1.9, 0.81, -0.9] });
  for (const [dx, dz] of [
    [-0.11, -0.11],
    [0.11, -0.11],
    [-0.11, 0.11],
    [0.11, 0.11],
  ]) {
    b.part(new THREE.BoxGeometry(0.03, 0.22, 0.03), STONE_DARK, { at: [1.9 + dx, 0.81, -0.9 + dz] });
  }
  b.lathe(
    [
      [0, 0.92],
      [0.3, 0.94],
      [0.3, 0.97],
      [0.12, 1.06],
      [0, 1.08],
    ],
    { at: LANTERN, segments: 4, spin: 45, color: STONE_DARK },
  );
  b.lathe(
    [
      [0, 1.08],
      [0.05, 1.08],
      [0.02, 1.16],
      [0, 1.2],
    ],
    { at: LANTERN, segments: 6, color: STONE },
  );

  // Pine tree at the back left: a leaning trunk, branches and cloud-pruned pads.
  const trunk = catmull([
    [-2.1, 0, -1.9],
    [-2.0, 0.9, -1.85],
    [-1.7, 1.6, -1.75],
    [-1.3, 2.0, -1.7],
  ]);
  b.sweep(trunk, (t) => 0.12 * (1 - t) + 0.03, {
    color: grain(BARK, BARK_DARK, { size: 0.05, axis: "y" }),
  });

  const clumps: [number, number, number][] = [
    [-2.7, 1.9, -1.9],
    [-1.0, 2.25, -1.6],
    [-1.5, 2.7, -2.0],
    [-2.6, 1.45, -1.45],
    [-1.05, 1.75, -2.2],
  ];
  const branchFrom = [0.45, 0.6, 0.85, 0.7, 0.8];
  clumps.forEach((tip, i) => {
    const base = trunk.at(branchFrom[i]);
    const mid = [(base.x + tip[0]) / 2, (base.y + tip[1]) / 2 + 0.12, (base.z + tip[2]) / 2];
    b.sweep(catmull([[base.x, base.y, base.z], mid, tip]), [0.035, 0.012], { color: BARK });
    b.part(new THREE.IcosahedronGeometry(0.42, 1), mottle(PINE, PINE_DARK, { size: 0.25 }), {
      at: tip,
      scale: [1, 0.45, 0.9],
      flat: true,
    });
  });

  // Clipped azaleas: rounded green mounds with flowering patches.
  const azaleas: [number, number, number, number][] = [
    [1.6, 0, 1.5, 0.45],
    [2.2, 0, 0.3, 0.5],
    [-2.4, 0, 0.9, 0.4],
  ];
  for (const [x, , z, r] of azaleas) {
    b.part(new THREE.IcosahedronGeometry(r, 1), mottle(LEAF, FLOWER, { size: 0.12, contrast: 0.6 }), {
      at: [x, r * 0.7, z],
      scale: [1, 0.75, 1],
      flat: true,
    });
  }

  // Tsukubai: a stone water basin with a short bamboo spout.
  const BASIN: [number, number, number] = [-1.8, 0, 0.9];
  b.lathe(
    [
      [0, 0],
      [0.28, 0],
      [0.3, 0.1],
      [0.22, 0.2],
      [0.24, 0.28],
      [0.2, 0.28],
      [0.17, 0.2],
      [0, 0.17],
    ],
    { at: BASIN, segments: 10, color: mottle(STONE_LIGHT, STONE, { size: 0.15 }) },
  );
  b.rod([-1.5, 0.22, 0.9], [-1.0, 0.16, 0.9], 0.025, { color: BAMBOO });

  // Boulders set in the gravel.
  b.part(new THREE.DodecahedronGeometry(0.4, 0), mottle(STONE, STONE_DARK, { size: 0.2 }), {
    at: [1.6, 0.15, -1.9],
    scale: [1.3, 0.8, 1.1],
    flat: true,
  });
  b.part(new THREE.DodecahedronGeometry(0.25, 0), STONE_DARK, {
    at: [-0.1, 0.08, -1.6],
    scale: [1.2, 0.7, 1],
    flat: true,
  });

  // Bamboo fence along the back edge.
  for (let i = 0; i < 16; i++) {
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 6), BAMBOO, {
      at: [-3 + i * 0.4, 0.85, -2.9],
      flat: true,
    });
  }
  for (const y of [0.45, 1.35]) {
    b.part(new THREE.BoxGeometry(6.2, 0.04, 0.04), BAMBOO_DARK, { at: [0, y, -2.9] });
  }

  return b.root;
}
```