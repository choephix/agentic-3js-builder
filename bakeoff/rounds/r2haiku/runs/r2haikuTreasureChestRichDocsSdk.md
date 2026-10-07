```ts
import * as THREE from "three";
import { createBuilder, rng, mottle, grain, svg, catmull, polyline } from "agentic-3js-builder";

export const meta = {
  name: "Pirate treasure chest",
  description: "Weathered oak chest with its lid thrown open, iron straps and studs, a loose padlock, and gold coins, pearls, a jewelled goblet and gems spilling out. A skull and crossbones is carved on the front.",
};

export default function build() {
  const b = createBuilder({ name: "treasure-chest" });
  const rand = rng(11);

  // ---- Paints and colours ----
  const WOOD_X = grain(mottle("#7a5234", "#4a3020", { size: 0.35, contrast: 0.6, seed: 3 }), "#2a1a10", {
    size: 0.012,
    axis: "x",
    seed: 5,
  });
  const WOOD_Z = grain(mottle("#6a4a30", "#432c1c", { size: 0.35, contrast: 0.6, seed: 8 }), "#24170e", {
    size: 0.012,
    axis: "z",
    seed: 6,
  });
  const RUST = mottle("#8a4a1e", "#4a3a30", { size: 0.06, contrast: 0.8, seed: 9 });
  const IRON = mottle("#4a4540", "#2e2a27", { size: 0.05, contrast: 0.5, seed: 13 });
  const GOLD = "#d9a52c";
  const GOLD2 = "#bf8f24";
  const PEARL = "#efe8d8";
  const RED = "#b3132e";
  const GREEN = "#14905a";
  const BRASS = "#a8862e";
  const PLAQUE = "#3a281a";

  const heap = (x: number, z: number) =>
    0.16 * Math.pow(Math.max(0, 1 - (x / 0.36) ** 2 - (z / 0.2) ** 2), 0.6);

  // ---- Skeleton: body root and the lid hinge ----
  const body = b.joint("body", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: body, at: [0, 0.42, -0.27] });

  // ---- Chest body: planks ----
  // Front and back walls, six planks each
  for (const z of [0.255, -0.255]) {
    for (let i = 0; i < 6; i++) {
      const cx = -0.375 + 0.15 * i;
      b.part(new THREE.BoxGeometry(0.146, 0.42, 0.03), WOOD_X, { at: [cx, 0.21, z] });
    }
  }
  // Side walls, three planks each
  for (const x of [0.435, -0.435]) {
    for (let i = 0; i < 3; i++) {
      const cz = -0.16 + 0.16 * i;
      b.part(new THREE.BoxGeometry(0.03, 0.42, 0.16), WOOD_Z, { at: [x, 0.21, cz] });
    }
  }
  // Floor
  b.part(new THREE.BoxGeometry(0.87, 0.03, 0.48), WOOD_X, { at: [0, 0.015, 0] });

  // Corner iron brackets
  for (const x of [0.45, -0.45]) {
    for (const z of [0.27, -0.27]) {
      b.part(new THREE.BoxGeometry(0.02, 0.44, 0.02), IRON, { at: [x, 0.21, z] });
    }
  }

  // Vertical straps on front and back
  for (const z of [0.277, -0.277]) {
    for (const x of [-0.3, 0.3]) {
      b.part(new THREE.BoxGeometry(0.035, 0.44, 0.012), RUST, { at: [x, 0.21, z] });
    }
  }
  // Vertical straps on the sides
  for (const x of [0.457, -0.457]) {
    for (const z of [-0.15, 0.15]) {
      b.part(new THREE.BoxGeometry(0.012, 0.44, 0.035), RUST, { at: [x, 0.21, z] });
    }
  }

  // Horizontal iron bands wrapping the body, with rivets
  const band = (y: number) =>
    polyline(
      [
        [-0.458, y, -0.278],
        [0.458, y, -0.278],
        [0.458, y, 0.278],
        [-0.458, y, 0.278],
      ],
      { closed: true },
    );
  for (const y of [0.09, 0.33]) {
    const loop = band(y);
    b.sweep(loop, [0.007, 0.014], { section: "box", color: RUST });
    b.along(loop, 16, (at) => b.part(new THREE.SphereGeometry(0.008, 6, 4), IRON, { at }));
  }

  // Hinge knuckles on the back edge
  for (const x of [-0.33, 0, 0.33]) {
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 8), IRON, {
      at: [x, 0.425, -0.275],
      rotation: [0, 0, 90],
    });
  }

  // ---- Carved front: dark plaque and skull and crossbones ----
  const skull = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<g stroke="#e9dfc4" stroke-width="6" stroke-linecap="round">
<line x1="8" y1="48" x2="56" y2="60"/>
<line x1="56" y1="48" x2="8" y2="60"/>
</g>
<g fill="#e9dfc4" stroke="#1d150e" stroke-width="2">
<ellipse cx="32" cy="27" rx="17" ry="18"/>
<rect x="20" y="38" width="24" height="12" rx="3"/>
</g>
<ellipse cx="25" cy="28" rx="5" ry="6" fill="#1d150e"/>
<ellipse cx="39" cy="28" rx="5" ry="6" fill="#1d150e"/>
<path d="M32 34 L28.5 41 L35.5 41 Z" fill="#1d150e"/>
<path d="M26 39 V50 M32 39 V50 M38 39 V50" stroke="#1d150e" stroke-width="2"/>
</svg>`,
    { size: 256 },
  );
  b.part(new THREE.BoxGeometry(0.22, 0.22, 0.008), PLAQUE, { at: [-0.12, 0.2, 0.276] });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    at: [-0.12, 0.2, 0.282],
    dir: [0, 0, 1],
    axis: "z",
    texture: skull,
  });

  // ---- Hasp, staple and a loose padlock ----
  b.part(new THREE.BoxGeometry(0.07, 0.1, 0.008), IRON, { at: [0.18, 0.22, 0.274] });
  b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 12, Math.PI), IRON, {
    at: [0.18, 0.175, 0.282],
    rotation: [0, 0, 180],
  });
  b.part(new THREE.BoxGeometry(0.065, 0.08, 0.035), BRASS, { at: [0.18, 0.12, 0.31], rotation: [0, 0, 6] });
  b.part(new THREE.TorusGeometry(0.02, 0.004, 6, 12, Math.PI), IRON, { at: [0.18, 0.168, 0.31] });

  // ---- Lid: planks, straps, and handles on the lid bone ----
  for (let i = 0; i < 4; i++) {
    const zc = -0.2025 + 0.135 * i;
    b.part(new THREE.BoxGeometry(0.9, 0.05, 0.13), WOOD_X, { bone: lid, at: [0, 0.445, zc] });
  }
  for (const x of [-0.3, 0.3]) {
    b.part(new THREE.BoxGeometry(0.035, 0.012, 0.56), RUST, { bone: lid, at: [x, 0.476, 0] });
  }
  b.part(new THREE.BoxGeometry(0.9, 0.012, 0.035), RUST, { bone: lid, at: [0, 0.476, 0.25] });

  // Open the lid about the back hinge
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });

  // ---- Interior: a heap of gold coins ----
  for (let i = 0; i < 90; i++) {
    const x = (rand() * 2 - 1) * 0.36;
    const z = (rand() * 2 - 1) * 0.2;
    const top = heap(x, z);
    const y = 0.034 + top * rand();
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 10), rand() < 0.5 ? GOLD : GOLD2, {
      at: [x, y, z],
      rotation: [(rand() * 2 - 1) * 25, rand() * 360, (rand() * 2 - 1) * 25],
    });
  }

  // A few coins spilled on the floor in front
  for (let i = 0; i < 10; i++) {
    const x = (rand() * 2 - 1) * 0.3;
    const z = 0.32 + rand() * 0.13;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 10), GOLD, {
      at: [x, 0.003, z],
      rotation: [(rand() * 2 - 1) * 6, 0, (rand() * 2 - 1) * 6],
    });
  }

  // ---- Pearl necklace draped over the heap ----
  const necklace = catmull(
    Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const x = -0.08 + 0.2 * Math.cos(a);
      const z = 0.02 + 0.14 * Math.sin(a);
      return [x, 0.045 + heap(x, z), z];
    }),
    { closed: true },
  );
  b.along(necklace, 28, (at) => b.part(new THREE.SphereGeometry(0.011, 8, 6), PEARL, { at }));

  // ---- Jewelled goblet standing on the coins ----
  const gx = 0.22;
  const gz = 0.08;
  const gy = 0.034 + heap(gx, gz) + 0.01;
  const goblet = [
    [0, 0],
    [0.045, 0],
    [0.045, 0.008],
    [0.012, 0.02],
    [0.012, 0.06],
    [0.035, 0.075],
    [0.058, 0.14],
    [0.062, 0.165],
    [0.054, 0.168],
    [0.05, 0.15],
    [0.04, 0.1],
    [0, 0.1],
  ] as [number, number][];
  b.lathe(goblet, { at: [gx, gy, gz], segments: 12, color: GOLD });
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    b.part(new THREE.OctahedronGeometry(0.011), k % 2 ? GREEN : RED, {
      at: [gx + 0.056 * Math.cos(a), gy + 0.135 + (k % 2) * 0.012, gz + 0.056 * Math.sin(a)],
    });
  }

  // ---- Loose gems among the coins ----
  for (let i = 0; i < 8; i++) {
    const x = (rand() * 2 - 1) * 0.28;
    const z = (rand() * 2 - 1) * 0.16;
    b.part(new THREE.OctahedronGeometry(0.016), rand() < 0.5 ? RED : GREEN, {
      at: [x, 0.04 + heap(x, z) * rand(), z],
      rotation: [rand() * 60, rand() * 60, rand() * 60],
    });
  }
  // Gems spilled on the floor
  b.part(new THREE.OctahedronGeometry(0.016), RED, { at: [0.16, 0.012, 0.36], rotation: [20, 10, 40] });
  b.part(new THREE.OctahedronGeometry(0.014), GREEN, { at: [-0.05, 0.011, 0.4], rotation: [70, 30, 10] });

  return b.root;
}
```