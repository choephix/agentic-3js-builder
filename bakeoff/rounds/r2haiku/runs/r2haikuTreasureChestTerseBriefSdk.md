```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Treasure Chest",
  description: "An open oak treasure chest with iron bands, a gold lock and a heap of coins and gems.",
};

const WOOD = "#9a6330";
const WOOD_DARK = "#5e3a1c";
const IRON = "#3b3d45";
const GOLD = "#e0a526";
const COIN = "#f5c842";
const INTERIOR = "#24150b";
const RUBY = "#c41e3a";
const SAPPHIRE = "#2a6fdb";
const EMERALD = "#2fa84f";

// Deterministic pseudo-random in [0, 1), so every build is identical.
function frac(x: number) {
  return x - Math.floor(x);
}
function rnd(i: number, k: number) {
  return frac(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453);
}

// Height of the coin heap above the interior floor at (x, z).
function heapTop(x: number, z: number) {
  const edge = Math.max(0, 1 - (x / 0.55) ** 2 - (z / 0.3) ** 2);
  return 0.63 + edge * 0.15;
}

export default function build() {
  const b = createBuilder({ name: "treasure-chest" });
  b.joint("chest", { at: [0, 0, 0] });

  // Hinge sits on the back top edge of the body.
  const hinge: [number, number, number] = [0, 0.6, -0.35];

  // Rotates a lid-space geometry (arc centred on the origin, base at y = 0)
  // so its pivot sits at the origin and it is propped open about 100 degrees.
  const openLid = (g: THREE.BufferGeometry) => {
    g.translate(0, 0, 0.35);
    g.rotateX(-1.75);
    return g;
  };

  // Body: a plain box with feet.
  b.part(new THREE.BoxGeometry(1.2, 0.5, 0.7), WOOD, { at: [0, 0.35, 0] });
  for (const x of [-0.45, 0.45]) {
    for (const z of [-0.22, 0.22]) {
      b.part(new THREE.BoxGeometry(0.18, 0.1, 0.18), WOOD_DARK, { at: [x, 0.05, z] });
    }
  }

  // Dark interior sitting on the top of the body.
  b.part(new THREE.BoxGeometry(1.1, 0.02, 0.58), INTERIOR, { at: [0, 0.605, 0] });

  // Lid: a half cylinder along X, hinged open.
  const lid = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 24, 1, false, 0, Math.PI);
  lid.rotateZ(Math.PI / 2);
  b.part(openLid(lid), WOOD, { at: hinge });

  // Iron bands wrapping the lid.
  for (const x of [-0.4, 0.4]) {
    const band = new THREE.CylinderGeometry(0.37, 0.37, 0.07, 24, 1, false, 0, Math.PI);
    band.rotateZ(Math.PI / 2);
    band.translate(x, 0, 0);
    b.part(openLid(band), IRON, { at: hinge });
  }

  // Iron straps on front and back of the body.
  for (const x of [-0.4, 0.4]) {
    for (const z of [0.355, -0.355]) {
      b.part(new THREE.BoxGeometry(0.07, 0.5, 0.03), IRON, { at: [x, 0.35, z] });
    }
  }

  // Iron corner posts.
  for (const x of [-0.6, 0.6]) {
    for (const z of [-0.35, 0.35]) {
      b.part(new THREE.BoxGeometry(0.08, 0.5, 0.08), IRON, { at: [x, 0.35, z] });
    }
  }

  // Gold lock plate and keyhole on the front.
  b.part(new THREE.BoxGeometry(0.16, 0.2, 0.03), GOLD, { at: [0, 0.4, 0.37] });
  b.part(new THREE.BoxGeometry(0.03, 0.07, 0.01), INTERIOR, { at: [0, 0.39, 0.386] });

  // Heap of coins inside the chest.
  const coinGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.016, 14);
  for (let i = 0; i < 60; i++) {
    const x = (rnd(i, 1) - 0.5) * 1.0;
    const z = (rnd(i, 2) - 0.5) * 0.5;
    const y = 0.61 + Math.max(0, 1 - (x / 0.55) ** 2 - (z / 0.3) ** 2) * 0.15 * rnd(i, 3) + 0.01;
    const coin = coinGeo.clone();
    coin.rotateX(rnd(i, 4) * 0.5 - 0.25);
    coin.rotateZ(rnd(i, 5) * 0.5 - 0.25);
    coin.rotateY(rnd(i, 6) * Math.PI);
    b.part(coin, COIN, { at: [x, y, z] });
  }

  // Gems resting on top of the heap.
  const gemGeo = new THREE.IcosahedronGeometry(0.04, 0);
  const gems: [number, number, number, string][] = [
    [-0.12, 0, 0.02, RUBY],
    [0.18, 0, -0.06, SAPPHIRE],
    [0.05, 0, 0.1, EMERALD],
    [-0.3, 0, -0.1, SAPPHIRE],
  ];
  for (const [x, , z, color] of gems) {
    b.part(gemGeo, color, { at: [x, heapTop(x, z) + 0.02, z] });
  }

  // A few loose coins spilled on the floor in front.
  const floorCoin = new THREE.CylinderGeometry(0.06, 0.06, 0.016, 14);
  const spill: [number, number][] = [
    [0.85, 0.5],
    [0.95, 0.35],
    [0.7, 0.62],
  ];
  for (const [x, z] of spill) {
    const c = floorCoin.clone();
    c.rotateY(x * 2.3);
    b.part(c, COIN, { at: [x, 0.008, z] });
  }

  return b.root;
}
```