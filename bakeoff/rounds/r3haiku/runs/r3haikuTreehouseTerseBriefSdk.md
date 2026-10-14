```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A small plank cabin on a railed deck, built around an oak trunk that rises through a gable roof. Has a ladder, front window boxes, a hanging lantern and string lights.",
};

const C = {
  trunk: "#6b4a2e",
  trunkDark: "#4a3220",
  deck: "#d9a866",
  deckDark: "#b58448",
  wall: "#c98a4b",
  wallDark: "#8a5a32",
  trim: "#f2e3c2",
  roof: "#b5472f",
  roofDark: "#7d2f20",
  glass: "#2c4f63",
  shutter: "#3c7a8c",
  door: "#7a4a2a",
  planter: "#7a4a2a",
  pink: "#ff7fa8",
  yellow: "#ffd34d",
  bulb: "#ffe08a",
  wire: "#2b2b2b",
  lantern: "#ffcf6b",
  brass: "#e8b84a",
  iron: "#3a3a3a",
  grass: "#6aa84f",
  stone: "#9a9a92",
  leaf1: "#3f7a3a",
  leaf2: "#5c9a45",
  leaf3: "#2e5f30",
  leaf4: "#78b04e",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const trunk = b.joint("trunk", { at: [0, 0, 0] });
  const rand = rng(7);
  const UP = new THREE.Vector3(0, 1, 0);

  // Every piece is built in model space and placed on the trunk joint.
  const put = (geo: THREE.BufferGeometry, color: string) => {
    b.part(geo, color, { at: [0, 0, 0], bone: trunk });
  };

  const box = (
    w: number, h: number, d: number,
    x: number, y: number, z: number,
    color: string,
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y, z);
    put(g, color);
  };

  const beam = (
    a: number[], c: number[], r: number, color: string, seg = 6,
  ) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(c[0], c[1], c[2]);
    const d = B.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()),
    );
    g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
    put(g, color);
  };

  const ball = (
    r: number, x: number, y: number, z: number, color: string,
    sx = 1, sy = 1, sz = 1,
  ) => {
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.scale(sx, sy, sz);
    g.translate(x, y, z);
    put(g, color);
  };

  // Railing run along the deck edge, from (a) to (c) in x/z.
  const railing = (a: [number, number], c: [number, number]) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const n = Math.max(1, Math.ceil(len / 0.6));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = a[0] + (c[0] - a[0]) * t;
      const z = a[1] + (c[1] - a[1]) * t;
      beam([x, 3.28, z], [x, 4.2, z], 0.045, C.trim);
    }
    beam([a[0], 4.2, a[1]], [c[0], 4.2, c[1]], 0.04, C.trim);
    beam([a[0], 3.74, a[1]], [c[0], 3.74, c[1]], 0.03, C.trim);
  };

  // Ground mound, lowest point at y = 0.
  const ground = new THREE.CylinderGeometry(4.6, 4.8, 0.12, 18);
  ground.translate(0, 0.06, 0);
  put(ground, C.grass);

  // Trunk: tapers from 0.5 m at the base to 0.3 m at 8.6 m.
  const tg = new THREE.CylinderGeometry(0.3, 0.5, 8.6, 8);
  tg.translate(0, 4.3, 0);
  put(tg, C.trunk);

  const trunkR = (y: number) => 0.5 - (0.2 * y) / 8.6;
  const knots: [number, number][] = [
    [0.4, 1.3],
    [2.4, 7.6],
    [4.6, 7.9],
  ];
  for (const [ang, y] of knots) {
    const r = trunkR(y) + 0.02;
    ball(0.07, Math.cos(ang) * r, y, Math.sin(ang) * r, C.trunkDark, 0.6, 1, 0.6);
  }

  // Roots flaring out over the grass.
  b.sweep(
    [[0.35, 0.08, 0.15], [0.8, 0.1, 0.5], [1.3, 0.1, 0.8]],
    0.11,
    { color: C.trunk },
  );
  b.sweep(
    [[-0.3, 0.08, -0.3], [-0.9, 0.1, -0.6], [-1.2, 0.1, -1.1]],
    0.1,
    { color: C.trunk },
  );

  // Branches reaching up into the canopy.
  b.sweep(
    [[0, 7.0, 0], [-1.2, 7.9, 0.3], [-2.6, 8.6, 0.6], [-3.6, 9.0, 0.8]],
    0.16,
    { color: C.trunk },
  );
  b.sweep(
    [[0, 7.6, 0], [1.0, 8.4, -0.4], [2.2, 9.2, -0.9]],
    0.14,
    { color: C.trunk },
  );
  b.sweep(
    [[0, 8.2, 0], [0.2, 9.4, 0.5], [0.6, 10.2, 0.7]],
    0.12,
    { color: C.trunk },
  );
  b.sweep(
    [[0, 8.0, 0], [-0.5, 9.3, -0.9], [-0.9, 10.0, -1.4]],
    0.11,
    { color: C.trunk },
  );

  // Deck, planks and braces.
  box(3.6, 0.12, 3.6, 0, 3.22, 0, C.deck);
  for (const z of [-1.2, -0.6, 0, 0.6, 1.2]) {
    box(3.6, 0.02, 0.03, 0, 3.295, z, C.deckDark);
  }
  beam([0.3, 2.5, 0.3], [1.6, 3.16, 1.6], 0.06, C.wallDark);
  beam([-0.3, 2.5, -0.3], [-1.6, 3.16, -1.6], 0.06, C.wallDark);
  beam([-0.3, 2.5, 0.3], [-1.6, 3.16, 1.6], 0.06, C.wallDark);
  beam([0.3, 2.5, -0.3], [1.6, 3.16, -1.6], 0.06, C.wallDark);

  // Railings on three sides, gap at the front for the ladder.
  railing([-1.75, -1.75], [-1.75, 1.75]);
  railing([1.75, -1.75], [1.75, 1.75]);
  railing([-1.75, -1.75], [1.75, -1.75]);
  railing([-1.75, 1.75], [-1.2, 1.75]);
  railing([1.2, 1.75], [1.75, 1.75]);

  // Ladder down the front-left.
  beam([-1.2, 0, 3.7], [-1.2, 3.25, 1.8], 0.035, C.wallDark);
  beam([-0.8, 0, 3.7], [-0.8, 3.25, 1.8], 0.035, C.wallDark);
  for (let k = 1; k <= 9; k++) {
    const t = k / 10;
    const y = 3.25 * t;
    const z = 3.7 + (1.8 - 3.7) * t;
    beam([-1.2, y, z], [-0.8, y, z], 0.025, C.wallDark, 5);
  }

  // Cabin walls.
  const WY = 4.48;
  box(3.0, 2.4, 0.12, 0, WY, -1.5, C.wall); // back
  box(0.12, 2.4, 3.0, -1.5, WY, 0, C.wall); // left
  box(0.12, 2.4, 3.0, 1.5, WY, 0, C.wall); // right
  box(1.1, 2.4, 0.12, -0.95, WY, 1.5, C.wall); // front left of door
  box(1.1, 2.4, 0.12, 0.95, WY, 1.5, C.wall); // front right of door
  box(0.8, 0.6, 0.12, 0, 5.38, 1.5, C.wall); // lintel over door

  // Corner posts.
  for (const x of [-1.5, 1.5]) {
    for (const z of [-1.5, 1.5]) {
      box(0.2, 2.44, 0.2, x, WY, z, C.trim);
    }
  }

  // Board lines.
  for (const y of [3.55, 3.95, 4.35, 4.75, 5.15, 5.55]) {
    box(3.02, 0.03, 0.02, 0, y, -1.56, C.wallDark);
    box(0.02, 0.03, 3.02, -1.56, y, 0, C.wallDark);
    box(0.02, 0.03, 3.02, 1.56, y, 0, C.wallDark);
    box(1.12, 0.03, 0.02, -0.95, y, 1.56, C.wallDark);
    box(1.12, 0.03, 0.02, 0.95, y, 1.56, C.wallDark);
  }

  // Side windows with shutters.
  for (const s of [-1, 1]) {
    box(0.06, 1.1, 1.1, s * 1.6, 4.5, 0, C.trim);
    box(0.03, 0.85, 0.85, s * 1.635, 4.5, 0, C.glass);
    box(0.04, 0.06, 0.9, s * 1.66, 4.5, 0, C.trim);
    box(0.04, 0.9, 0.06, s * 1.66, 4.5, 0, C.trim);
    for (const sz of [-0.75, 0.75]) {
      box(0.04, 1.1, 0.3, s * 1.6, 4.5, sz, C.shutter);
    }
  }

  // Front windows with flower boxes.
  for (const s of [-1, 1]) {
    const x = s * 0.95;
    box(0.7, 0.9, 0.06, x, 4.5, 1.6, C.trim);
    box(0.56, 0.76, 0.03, x, 4.5, 1.645, C.glass);
    box(0.56, 0.05, 0.04, x, 4.5, 1.67, C.trim);
    box(0.05, 0.76, 0.04, x, 4.5, 1.67, C.trim);
    box(0.8, 0.16, 0.26, x, 3.98, 1.72, C.planter);
    for (const k of [-0.3, -0.15, 0, 0.15, 0.3]) {
      const col = rand() < 0.5 ? C.pink : C.yellow;
      ball(0.06, x + k, 4.14 + rand() * 0.04, 1.76, col);
    }
  }

  // Door, knob and hanging lantern.
  box(0.74, 1.75, 0.05, 0, 4.165, 1.4, C.door);
  ball(0.04, 0.25, 4.1, 1.44, C.brass);
  beam([0, 4.95, 1.56], [0, 4.95, 1.95], 0.02, C.iron);
  beam([0, 4.95, 1.95], [0, 4.55, 1.95], 0.01, C.iron, 4);
  ball(0.13, 0, 4.4, 1.95, C.lantern);

  // Gable roof: a triangle extruded along z, ridge running front to back.
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-1.85, 0);
  roofShape.lineTo(1.85, 0);
  roofShape.lineTo(0, 1.25);
  roofShape.closePath();
  const roofG = new THREE.ExtrudeGeometry(roofShape, {
    depth: 3.5,
    bevelEnabled: false,
  });
  roofG.translate(0, 5.66, -1.75);
  put(roofG, C.roof);

  // Ridge cap and eave trims.
  box(0.16, 0.08, 3.5, 0, 6.92, 0, C.roofDark);
  for (const s of [-1, 1]) {
    box(0.1, 0.1, 3.5, s * 1.85, 5.64, 0, C.trim);
  }

  // Shingle rows lying on both slopes.
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    for (const s of [-1, 1]) {
      const x = s * 1.85 * (1 - t);
      const y = 5.66 + 1.25 * t;
      beam([x, y, -1.75], [x, y, 1.75], 0.025, C.roofDark, 5);
    }
  }

  // String lights strung across the back, outside the railing.
  const wirePts: number[][] = [];
  const bulbs: number[][] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = -1.75 + 3.5 * t;
    const y = 4.25 - 0.35 * Math.sin(Math.PI * t);
    const z = -1.95;
    wirePts.push([x, y, z]);
    if (i > 0 && i < 12) bulbs.push([x, y - 0.03, z]);
  }
  b.sweep(wirePts, 0.01, { color: C.wire });
  for (const [x, y, z] of bulbs) {
    ball(0.05, x, y, z, C.bulb);
  }

  // Canopy: faceted clusters of leaves around the top of the trunk.
  const leafs = [C.leaf1, C.leaf2, C.leaf3, C.leaf4];
  for (let i = 0; i < 28; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 3.6;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d * 0.85;
    const y = 8.2 + rand() * 1.6;
    const r = 0.85 + rand() * 0.8;
    ball(r, x, y, z, leafs[i % 4], 1, 0.8 + rand() * 0.3, 1);
  }

  // Bushes and stones at the base.
  ball(0.55, 2.6, 0.4, 2.4, C.leaf3, 1.2, 0.8, 1.1);
  ball(0.5, -2.6, 0.35, 2.0, C.leaf2, 1.2, 0.7, 1.0);
  ball(0.2, -2.2, 0.14, -0.8, C.stone, 1, 0.7, 1);
  ball(0.14, 2.0, 0.1, -1.4, C.stone, 1, 0.7, 1);

  return b.root;
}
```