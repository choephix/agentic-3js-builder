```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Pirate treasure chest",
  description: "Weathered plank chest, lid thrown open, iron straps and a loose padlock, spilling gold, pearls, a goblet and gems.",
};

const WOOD_A = "#4e3320";
const WOOD_B = "#5d3d26";
const WOOD_C = "#3e2818";
const IRON = "#3a3d42";
const RUST = "#7d4424";
const BRASS = "#8a6a2a";
const GOLD = "#e0b43a";
const GOLD_D = "#b98a22";
const PEARL = "#f3efe4";
const RED = "#b0122c";
const GREEN = "#17874a";
const BONE = "#e6dac0";
const DARK = "#140c07";

const PIVOT_Y = 0.6;
const PIVOT_Z = -0.4;
const OPEN = (-110 * Math.PI) / 180;

export default function build() {
  const r = rng(11);
  const b = createBuilder({ name: "treasure-chest" });

  const chest = b.joint("chest", { at: [0, 0, 0] });
  const lid = b.joint("lid", { at: [0, PIVOT_Y, PIVOT_Z], parent: chest });

  // Lid geometry is authored closed, pivot at the origin, then swung open.
  const lidPut = (geo: THREE.BufferGeometry, color: string) => {
    geo.rotateX(OPEN);
    geo.translate(0, PIVOT_Y, PIVOT_Z);
    b.part(geo, color, { at: [0, 0, 0], bone: lid });
  };

  // ---- Body: five weathered planks ----
  const plankColors = [WOOD_A, WOOD_B, WOOD_A, WOOD_C, WOOD_B];
  plankColors.forEach((color, k) => {
    const y = 0.058 + 0.12 * k;
    b.part(new THREE.BoxGeometry(1.2, 0.116, 0.8), color, { at: [0, y, 0] });
  });

  // Dark interior floor, visible through the opening.
  b.part(new THREE.BoxGeometry(1.1, 0.02, 0.72), DARK, { at: [0, 0.605, 0] });

  // Hinge barrel along the back top edge.
  const hinge = new THREE.CylinderGeometry(0.022, 0.022, 1.1, 10);
  hinge.rotateZ(Math.PI / 2);
  b.part(hinge, IRON, { at: [0, PIVOT_Y, PIVOT_Z] });

  // ---- Iron bands and straps on the front ----
  b.part(new THREE.BoxGeometry(1.22, 0.06, 0.03), IRON, { at: [0, 0.1, 0.415] });
  b.part(new THREE.BoxGeometry(1.22, 0.06, 0.03), RUST, { at: [0, 0.5, 0.415] });
  b.part(new THREE.BoxGeometry(0.07, 0.6, 0.03), IRON, { at: [-0.42, 0.3, 0.415] });
  b.part(new THREE.BoxGeometry(0.07, 0.6, 0.03), IRON, { at: [0.42, 0.3, 0.415] });

  // Back straps and side straps.
  b.part(new THREE.BoxGeometry(0.07, 0.6, 0.03), IRON, { at: [-0.42, 0.3, -0.415] });
  b.part(new THREE.BoxGeometry(0.07, 0.6, 0.03), IRON, { at: [0.42, 0.3, -0.415] });
  b.part(new THREE.BoxGeometry(0.04, 0.6, 0.07), RUST, { at: [-0.61, 0.3, 0.0] });
  b.part(new THREE.BoxGeometry(0.04, 0.6, 0.07), RUST, { at: [0.61, 0.3, 0.0] });

  // Studs on the front bands and straps.
  const stud = () => new THREE.SphereGeometry(0.02, 8, 6);
  for (const y of [0.1, 0.5]) {
    for (const x of [-0.52, -0.14, 0.14, 0.52]) {
      b.part(stud(), BRASS, { at: [x, y, 0.437] });
    }
  }
  for (const x of [-0.42, 0.42]) {
    for (const y of [0.04, 0.22, 0.38, 0.56]) {
      b.part(stud(), BRASS, { at: [x, y, 0.437] });
    }
  }

  // ---- Hasp and loose padlock on the front ----
  b.part(new THREE.BoxGeometry(0.16, 0.14, 0.02), IRON, { at: [-0.3, 0.34, 0.415] });
  b.part(new THREE.BoxGeometry(0.11, 0.13, 0.05), IRON, { at: [-0.3, 0.2, 0.45] });
  b.part(new THREE.TorusGeometry(0.035, 0.01, 8, 16, Math.PI), BRASS, {
    at: [-0.3, 0.265, 0.45],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.04, 0.01), DARK, { at: [-0.3, 0.19, 0.476] });

  // ---- Carved skull and crossbones on the front ----
  const skullGeo = new THREE.SphereGeometry(0.07, 14, 10);
  skullGeo.scale(1, 1.05, 0.9);
  b.part(skullGeo, BONE, { at: [0.3, 0.3, 0.42] });
  b.part(new THREE.BoxGeometry(0.07, 0.035, 0.05), BONE, { at: [0.3, 0.25, 0.43] });
  for (const x of [0.28, 0.3, 0.32]) {
    b.part(new THREE.BoxGeometry(0.012, 0.02, 0.01), BONE, { at: [x, 0.258, 0.46] });
  }
  b.part(new THREE.SphereGeometry(0.022, 8, 6), DARK, { at: [0.275, 0.31, 0.475] });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), DARK, { at: [0.325, 0.31, 0.475] });
  b.part(new THREE.SphereGeometry(0.01, 6, 4), DARK, { at: [0.3, 0.285, 0.48] });

  const boneCenter: [number, number, number] = [0.3, 0.165, 0.42];
  for (const theta of [0.7, -0.7]) {
    const rod = new THREE.CylinderGeometry(0.013, 0.013, 0.2, 6);
    rod.rotateZ(theta);
    b.part(rod, BONE, { at: boneCenter });
    for (const s of [1, -1]) {
      const dx = -Math.sin(theta) * 0.1 * s;
      const dy = Math.cos(theta) * 0.1 * s;
      b.part(new THREE.SphereGeometry(0.022, 8, 6), BONE, {
        at: [boneCenter[0] + dx, boneCenter[1] + dy, boneCenter[2]],
      });
    }
  }

  // ---- Lid (open): planks, straps, studs, edge trim ----
  const lidBoard = new THREE.BoxGeometry(1.2, 0.08, 0.8);
  lidBoard.translate(0, 0.04, 0.4);
  lidPut(lidBoard, WOOD_B);

  for (const x of [-0.42, 0.42]) {
    const strap = new THREE.BoxGeometry(0.07, 0.1, 0.82);
    strap.translate(x, 0.045, 0.41);
    lidPut(strap, IRON);
  }

  const lidRim = new THREE.BoxGeometry(1.22, 0.1, 0.04);
  lidRim.translate(0, 0.04, 0.8);
  lidPut(lidRim, RUST);

  for (const x of [-0.42, 0.42]) {
    for (const z of [0.15, 0.4, 0.65]) {
      const s = new THREE.SphereGeometry(0.015, 8, 6);
      s.translate(x, 0.09, z);
      lidPut(s, BRASS);
    }
  }

  // ---- Spilled treasure inside the chest ----
  // Gold coins heaped in the chest.
  for (let i = 0; i < 60; i++) {
    const x = (r() - 0.5) * 0.9;
    const z = (r() - 0.5) * 0.6;
    const mound = 0.04 * (1 - Math.min(1, (x * x) / 0.2));
    const y = 0.625 + r() * 0.06 + mound;
    const g = new THREE.CylinderGeometry(0.045, 0.045, 0.012, 14);
    g.rotateX((r() - 0.5) * 0.8);
    g.rotateZ((r() - 0.5) * 0.8);
    b.part(g, r() < 0.7 ? GOLD : GOLD_D, { at: [x, y, z] });
  }

  // Pearl necklace draped over the top of the pile.
  for (let i = 0; i < 18; i++) {
    const t = (i / 18) * Math.PI * 2;
    const x = 0.2 * Math.cos(t);
    const z = 0.14 * Math.sin(t);
    b.part(new THREE.SphereGeometry(0.016, 8, 6), PEARL, { at: [x, 0.73, z] });
  }

  // Jewelled goblet tipped into the pile.
  const goblet = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.045, 0.0),
      new THREE.Vector2(0.045, 0.012),
      new THREE.Vector2(0.012, 0.02),
      new THREE.Vector2(0.01, 0.09),
      new THREE.Vector2(0.04, 0.12),
      new THREE.Vector2(0.05, 0.17),
      new THREE.Vector2(0.052, 0.2),
      new THREE.Vector2(0.046, 0.21),
    ],
    16,
  );
  goblet.rotateZ(0.25);
  const gobletAt: [number, number, number] = [-0.32, 0.615, -0.12];
  b.part(goblet, GOLD, { at: gobletAt });
  b.part(new THREE.OctahedronGeometry(0.018), RED, {
    at: [gobletAt[0] + 0.02, gobletAt[1] + 0.15, gobletAt[2] + 0.045],
  });
  b.part(new THREE.OctahedronGeometry(0.018), GREEN, {
    at: [gobletAt[0] - 0.02, gobletAt[1] + 0.15, gobletAt[2] - 0.045],
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GREEN, {
    at: [gobletAt[0], gobletAt[1] + 0.09, gobletAt[2]],
  });

  // Loose red and green gems scattered through the treasure.
  for (let i = 0; i < 8; i++) {
    const x = (r() - 0.5) * 0.8;
    const z = (r() - 0.5) * 0.5;
    const y = 0.67 + r() * 0.06;
    b.part(new THREE.OctahedronGeometry(0.022), i % 2 === 0 ? RED : GREEN, {
      at: [x, y, z],
    });
  }

  // Coins that have spilled out over the front onto the floor.
  for (let i = 0; i < 14; i++) {
    const x = (r() - 0.5) * 1.1;
    const z = 0.5 + r() * 0.35;
    const g = new THREE.CylinderGeometry(0.045, 0.045, 0.012, 14);
    g.rotateX((r() - 0.5) * 0.2);
    g.rotateY(r() * Math.PI);
    b.part(g, r() < 0.7 ? GOLD : GOLD_D, { at: [x, 0.006, z] });
  }

  return b.root;
}
```