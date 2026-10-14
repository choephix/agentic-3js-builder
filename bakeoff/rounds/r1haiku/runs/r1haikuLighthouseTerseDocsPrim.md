```ts
import * as THREE from "three";
import { createBuilder, rng, stripes, mottle } from "agentic-3js-builder";

export const meta = {
  name: "lighthouse",
  description: "A striped stone lighthouse with a lantern room, keeper's cottage and rocks on a tiny island.",
};

const WHITE = "#f5f1e8";
const RED = "#b8322a";
const DARK = "#2b2f33";
const GREY = "#5d6266";
const STONE = "#9f978a";
const ROOF = "#3a3f47";
const WOOD = "#6b4a2e";
const GLASS = "#fff1b8";
const WATER = "#2f6f8f";
const FOAM = "#e8f4f6";

const ROCK = mottle("#7b7266", "#5f7a3e", { size: 0.9, contrast: 0.6, seed: 3 });
const TOWER = stripes(WHITE, RED, { size: 1.4, axis: "y" });

// Height of the island's top surface (an ellipsoid of radius 3, centre y 0.6, half-height 0.66).
function landY(x: number, z: number): number {
  const r2 = (x * x + z * z) / 9;
  return r2 < 1 ? 0.6 + 0.66 * Math.sqrt(1 - r2) : 0.6;
}

// Tower radius at height y (tapers from 1.2 at y=1 to 0.8 at y=8).
function towerR(y: number): number {
  return 1.2 - (0.4 * (y - 1)) / 7;
}

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  const isle = b.joint("isle", { at: [0, 0.5, 0] });
  const rand = rng(7);

  // Sea disc: its top sits exactly on the floor.
  b.part(new THREE.CylinderGeometry(6, 6, 0.2, 24), WATER, { bone: isle, at: [0, -0.1, 0] });

  // Foam ring where the water meets the rock.
  b.part(new THREE.TorusGeometry(3.4, 0.05, 4, 20), FOAM, {
    bone: isle,
    at: [0, 0.05, 0],
    rotation: [90, 0, 0],
  });

  // A few wave flecks on the water.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rand() * 0.5;
    const d = 4.2 + rand() * 1.2;
    b.part(new THREE.BoxGeometry(0.8, 0.02, 0.08), FOAM, {
      bone: isle,
      at: [Math.sin(a) * d, 0.01, Math.cos(a) * d],
      rotation: [0, rand() * 180, 0],
    });
  }

  // The island: a squashed low-poly sphere.
  b.part(new THREE.SphereGeometry(3, 16, 10), ROCK, {
    bone: isle,
    at: [0, 0.6, 0],
    scale: [1, 0.22, 1],
    flat: true,
  });

  // Scattered boulders, kept clear of the cottage.
  const cottageX = -1.9;
  const cottageZ = 0.3;
  let placed = 0;
  for (let tries = 0; tries < 60 && placed < 14; tries++) {
    const a = rand() * Math.PI * 2;
    const d = 1.6 + rand() * 1.0;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (Math.hypot(x - cottageX, z - cottageZ) < 1.2) continue;
    const s = 0.1 + rand() * 0.15;
    b.part(new THREE.DodecahedronGeometry(s, 0), STONE, {
      bone: isle,
      at: [x, landY(x, z) + s * 0.2, z],
      rotation: [rand() * 60, rand() * 360, rand() * 60],
      scale: [1, 0.7, 1],
      flat: true,
    });
    placed++;
  }

  // The tower: a tapered, striped stone column.
  b.sweep(
    [
      [0, 1.0, 0],
      [0, 8.0, 0],
    ],
    [1.2, 0.8],
    {
      bone: isle,
      section: { ngon: 10 },
      caps: { start: "flat", end: "flat" },
      color: TOWER,
    },
  );

  // Windows on four sides of the tower.
  for (const [y, a] of [
    [4.0, 0],
    [4.0, 90],
    [4.0, 180],
    [4.0, 270],
    [6.0, 45],
    [6.0, 225],
  ] as const) {
    const r = towerR(y);
    const t = (a * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(0.16, 0.3, 0.08), DARK, {
      bone: isle,
      at: [Math.sin(t) * (r - 0.01), y, Math.cos(t) * (r - 0.01)],
      rotation: [0, a, 0],
    });
  }

  // Door at the front (+Z).
  b.part(new THREE.BoxGeometry(0.42, 0.8, 0.12), WOOD, { bone: isle, at: [0, 1.56, 1.16] });
  // Door lintel.
  b.part(new THREE.BoxGeometry(0.52, 0.08, 0.14), WHITE, { bone: isle, at: [0, 2.0, 1.17] });

  // Gallery deck and railing around the top.
  b.part(new THREE.CylinderGeometry(1.0, 0.9, 0.18, 10), GREY, { bone: isle, at: [0, 8.05, 0] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), DARK, {
      bone: isle,
      at: [Math.sin(a) * 0.95, 8.35, Math.cos(a) * 0.95],
    });
  }
  b.part(new THREE.TorusGeometry(0.95, 0.03, 4, 16), DARK, {
    bone: isle,
    at: [0, 8.6, 0],
    rotation: [90, 0, 0],
  });

  // Lantern room: glowing glass with a dark frame.
  b.part(new THREE.CylinderGeometry(0.62, 0.62, 1.0, 10), GLASS, { bone: isle, at: [0, 8.65, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.07, 1.0, 0.07), DARK, {
      bone: isle,
      at: [Math.sin(a) * 0.62, 8.65, Math.cos(a) * 0.62],
    });
  }
  // Lantern base and lantern top.
  b.part(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 10), DARK, { bone: isle, at: [0, 9.19, 0] });
  b.part(new THREE.CylinderGeometry(0, 0.8, 0.6, 10), ROOF, { bone: isle, at: [0, 9.53, 0] });
  b.part(new THREE.SphereGeometry(0.08, 6, 4), RED, { bone: isle, at: [0, 9.9, 0] });

  // Keeper's cottage on the island.
  b.part(new THREE.BoxGeometry(1.3, 1.0, 1.1), WHITE, {
    bone: isle,
    at: [cottageX, 1.4, cottageZ],
  });
  b.part(new THREE.CylinderGeometry(0, 0.95, 0.7, 4), ROOF, {
    bone: isle,
    at: [cottageX, 2.25, cottageZ],
    rotation: [0, 45, 0],
  });
  b.part(new THREE.BoxGeometry(0.3, 0.6, 0.04), WOOD, {
    bone: isle,
    at: [cottageX, 1.3, cottageZ + 0.57],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.04), DARK, {
    bone: isle,
    at: [cottageX + 0.45, 1.5, cottageZ + 0.57],
  });

  return b.root;
}
```