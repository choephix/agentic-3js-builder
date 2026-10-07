A raked-gravel garden with a pond, taiko bridge, stone lantern, cloud pine, red maple, bamboo grove, stepping stones and a small veranda.

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  grain,
  mix,
  mottle,
  noise,
  paint,
  patches,
  rng,
  scales,
  smoothstep,
  stripes,
} from "agentic-3js-builder";

export const meta = {
  name: "Japanese garden",
  description:
    "A raked-gravel garden with a koi pond, a taiko bridge, a stone lantern, a cloud-pruned pine, a red maple, a bamboo grove, a stone basin and a small veranda.",
};

const POND = { x: -1.2, z: 0.2, rx: 2.3, rz: 1.7 };
const ISLAND = { x: 2.6, z: -2.0 };
const LANTERN = { x: 1.9, z: 0.6 };
const BASIN = { x: -3.3, z: 1.4 };
const PINE = { x: -3.4, z: -2.4 };
const MAPLE = { x: -0.7, z: -2.9 };

/** Outline of the pond, a little irregular, in ground (x, z) meters. */
function pondEdge(a: number): [number, number] {
  const k = 1 + 0.07 * Math.sin(3 * a) + 0.04 * Math.cos(5 * a + 1);
  return [POND.x + POND.rx * k * Math.cos(a), POND.z + POND.rz * k * Math.sin(a)];
}

/** Leaf quad from a base point along a direction. */
function leafPoints(base: THREE.Vector3, dir: THREE.Vector3, len: number, w: number) {
  const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
  if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
  side.normalize();
  const mid = base.clone().addScaledVector(dir, len * 0.4);
  return [
    base,
    mid.clone().addScaledVector(side, w),
    base.clone().addScaledVector(dir, len),
    mid.clone().addScaledVector(side, -w),
  ].map((v) => [v.x, v.y, v.z]);
}

export default function japaneseGarden() {
  const b = createBuilder({ name: "japanese-garden", detail: 0.8, paintSize: 2048 });
  b.joint("ground", { at: [0, 0, 0] });
  const rnd = rng(7);

  // ---------------------------------------------------------------- ground: raked gravel around a rock island
  const SAND_A = "#ece3cf";
  const SAND_B = "#c9bb9a";
  const groundPaint = paint((p, n) => {
    if (n.y < 0.5) return "#6b5a44"; // the tray's edges are packed earth
    const d = Math.hypot(p.x - ISLAND.x, p.z - ISLAND.z);
    const ring = 0.5 + 0.5 * Math.sin(d * 30 + 3 * noise(p, 1.6, 4));
    const rake = 0.5 + 0.5 * Math.sin(p.z * 22 + noise(p, 0.8, 9) * 2);
    const t = 0.55 * smoothstep(0.55, 0.9, ring) + 0.25 * rake;
    return mix(SAND_A, SAND_B, t);
  });
  const floor = b.extrude(
    [
      [-5, -4],
      [5, -4],
      [5, 4],
      [-5, 4],
    ],
    { color: groundPaint, at: [0, -0.04, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.08, name: "floor" },
  );

  // ---------------------------------------------------------------- pond
  const waterPaint = paint((p) => mix("#2b5f6b", "#4d8a8c", noise(p, 0.9, 2) * 0.8));
  const pondPts: [number, number][] = Array.from({ length: 16 }, (_, i) => pondEdge((i / 16) * Math.PI * 2));
  b.extrude(pondPts, {
    color: waterPaint,
    at: [0, 0.03, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.06,
    smoothing: 2,
    name: "pond",
  });

  // Edge stones around the pond.
  const pondStone = patches("#77786f", ["#8a8b80", "#66675f"], { size: 0.35, seed: 3 });
  for (let i = 0; i < 18; i++) {
    const a = ((i + rnd() * 0.4) / 18) * Math.PI * 2;
    const [x, z] = pondEdge(a);
    const r = 0.14 + rnd() * 0.12;
    b.part(new THREE.DodecahedronGeometry(r, 0), pondStone, {
      at: [x, 0.02 + r * 0.3, z],
      rotation: [rnd() * 40, rnd() * 180, rnd() * 40],
      scale: [1.3, 0.7, 1.0],
      name: "pond-stone",
    });
  }

  // ---------------------------------------------------------------- taiko bridge across the pond
  const archY = (z: number) => 0.02 + 0.7 * (1 - ((z - POND.z) / 2.4) ** 2);
  const zs = Array.from({ length: 11 }, (_, i) => -2.6 + i * 0.52);
  const deck = zs.map((z) => [POND.x, archY(z), z] as [number, number, number]);
  const woodPaint = grain("#9b6a45", "#7a4e33", { size: 0.03, axis: "z" });
  b.sweep(catmull(deck), (t) => [0.42, 0.05], {
    color: woodPaint,
    section: "box",
    caps: "flat",
    name: "bridge-deck",
  });
  for (const side of [-0.4, 0.4]) {
    const rail = zs.map((z) => [POND.x + side, archY(z) + 0.3, z] as [number, number, number]);
    b.sweep(catmull(rail), 0.022, { color: "#4e3020", name: "bridge-rail" });
    zs.forEach((z, i) => {
      if (i % 2) return;
      const x = POND.x + side;
      b.rod([x, archY(z), z], [x, archY(z) + 0.3, z], 0.022, { color: "#4e3020", name: "bridge-post" });
    });
  }

  // ---------------------------------------------------------------- stone lantern (tōrō) at the pond edge
  const stone = mottle("#a9a79c", "#8c8b82", { size: 0.5, seed: 5 });
  const lanternAt = [LANTERN.x, 0, LANTERN.z] as [number, number, number];
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.06],
      [0.22, 0.14],
      [0.16, 0.2],
      [0, 0.2],
    ],
    { color: stone, at: lanternAt, segments: 6, name: "lantern-base" },
  );
  b.lathe(
    [
      [0, 0.2],
      [0.14, 0.2],
      [0.1, 0.3],
      [0.1, 0.62],
      [0.14, 0.68],
      [0, 0.68],
    ],
    { color: stone, at: lanternAt, segments: 6, name: "lantern-shaft" },
  );
  b.lathe(
    [
      [0, 0.7],
      [0.13, 0.7],
      [0.13, 0.94],
      [0, 0.94],
    ],
    { color: "#f2b65e", at: lanternAt, segments: 4, spin: 45, name: "lantern-light" },
  );
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const x = LANTERN.x + sx * 0.17;
    const z = LANTERN.z + sz * 0.17;
    b.rod([x, 0.7, z], [x, 0.98, z], 0.022, { color: stone, name: "lantern-post" });
  }
  b.lathe(
    [
      [0, 0.98],
      [0.36, 1.0],
      [0.3, 1.06],
      [0.12, 1.1],
      [0, 1.12],
    ],
    { color: scales(["#55585e", "#43464c"], "#2f3136", { size: 0.1, width: 0.2 }), at: lanternAt, segments: 4, spin: 45, name: "lantern-roof" },
  );
  b.lathe(
    [
      [0, 1.12],
      [0.06, 1.13],
      [0, 1.2],
    ],
    { color: "#3e3f44", at: lanternAt, segments: 6, name: "lantern-finial" },
  );

  // ---------------------------------------------------------------- rock island (kare-sansui)
  const rockStone = patches("#6f7169", ["#7e8074", "#5d5f58"], { size: 0.4, seed: 4 });
  const moss = mottle("#587a3b", "#7d9a4a", { size: 0.25, seed: 6 });
  b.part(new THREE.DodecahedronGeometry(0.55, 0), rockStone, {
    at: [ISLAND.x, 0.42, ISLAND.z],
    rotation: [8, 25, 4],
    scale: [1.25, 1.05, 0.95],
    name: "island-rock",
  });
  b.part(new THREE.DodecahedronGeometry(0.3, 0), rockStone, {
    at: [3.25, 0.2, -1.55],
    rotation: [0, 40, 0],
    scale: [1.1, 0.8, 1],
    name: "island-rock",
  });
  b.part(new THREE.DodecahedronGeometry(0.22, 0), rockStone, {
    at: [2.1, 0.14, -2.6],
    rotation: [10, 70, 0],
    name: "island-rock",
  });
  b.part(new THREE.SphereGeometry(0.42, b.segments(9), b.segments(5)), moss, {
    at: [ISLAND.x, 0.82, ISLAND.z],
    scale: [1.2, 0.35, 1.0],
    name: "island-moss",
  });

  // ---------------------------------------------------------------- stone basin (tsukubai) with water
  const basinStone = mottle("#a7a496", "#8e8b7e", { size: 0.4, seed: 12 });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.34, 0.26],
      [0.26, 0.42],
      [0.2, 0.46],
      [0.17, 0.46],
      [0.17, 0.4],
      [0, 0.4],
    ],
    { color: basinStone, at: [BASIN.x, 0, BASIN.z], segments: 10, name: "basin" },
  );
  b.part(new THREE.CircleGeometry(0.16, b.segments(12)), "#3c6b74", {
    at: [BASIN.x, 0.41, BASIN.z],
    rotation: [-90, 0, 0],
    name: "basin-water",
  });

  // ---------------------------------------------------------------- stepping stones
  const stepPaint = mottle("#8f8c82", "#77766d", { size: 0.3, seed: 11 });
  for (const [x, z] of [
    [-4.3, 2.9],
    [-3.5, 3.0],
    [-2.7, 2.85],
    [-1.9, 3.0],
    [-1.1, 2.9],
  ]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.26, 0.08, b.segments(8)), stepPaint, {
      at: [x, 0.035, z],
      rotation: [0, rnd() * 40, 0],
      name: "step-stone",
    });
  }

  // ---------------------------------------------------------------- Japanese pine (cloud-pruned)
  const bark = grain("#7b5538", "#5a3c28", { size: 0.05, axis: "y" });
  b.sweep(
    catmull([
      [PINE.x - 0.1, 0, PINE.z],
      [PINE.x - 0.02, 1.0, PINE.z + 0.05],
      [PINE.x + 0.2, 2.0, PINE.z],
      [PINE.x + 0.5, 2.9, PINE.z - 0.15],
    ]),
    (t) => 0.2 - 0.12 * t,
    { color: bark, name: "pine-trunk" },
  );
  b.sweep(
    catmull([
      [PINE.x, 1.6, PINE.z + 0.02],
      [PINE.x + 0.5, 1.9, PINE.z + 0.08],
      [PINE.x + 1.2, 2.2, PINE.z + 0.2],
    ]),
    (t) => 0.07 - 0.05 * t,
    { color: bark, name: "pine-branch" },
  );
  b.sweep(
    catmull([
      [PINE.x + 0.1, 2.3, PINE.z - 0.05],
      [PINE.x - 0.5, 2.6, PINE.z - 0.1],
      [PINE.x - 1.2, 2.9, PINE.z - 0.1],
    ]),
    (t) => 0.06 - 0.04 * t,
    { color: bark, name: "pine-branch" },
  );
  const needles = mottle("#2d5a39", "#4b7d4f", { size: 0.4, seed: 2 });
  const pads: [number, number, number, number, number, number][] = [
    [PINE.x + 0.8, 2.5, PINE.z + 0.2, 1.1, 0.27, 0.85],
    [PINE.x - 0.6, 2.7, PINE.z + 0.3, 1.0, 0.25, 0.8],
    [PINE.x + 0.2, 3.2, PINE.z - 0.3, 0.95, 0.26, 0.8],
    [PINE.x - 0.1, 3.7, PINE.z, 0.7, 0.24, 0.6],
    [PINE.x + 0.5, 3.9, PINE.z - 0.1, 0.55, 0.22, 0.5],
  ];
  for (const [x, y, z, rx, ry, rz] of pads) {
    b.part(new THREE.SphereGeometry(1, b.segments(12), b.segments(7)), needles, {
      at: [x, y, z],
      scale: [rx, ry, rz],
      name: "pine-pad",
    });
  }

  // ---------------------------------------------------------------- red maple
  const mapleBark = grain("#6e4a36", "#4f3426", { size: 0.04, axis: "y" });
  b.sweep(
    catmull([
      [MAPLE.x, 0, MAPLE.z],
      [MAPLE.x + 0.04, 0.8, MAPLE.z + 0.04],
      [MAPLE.x + 0.3, 1.5, MAPLE.z + 0.1],
    ]),
    (t) => 0.14 - 0.07 * t,
    { color: mapleBark, name: "maple-trunk" },
  );
  const redLeaf = mottle("#b5452a", "#e07a3c", { size: 0.35, seed: 8 });
  const canopy: [number, number, number, number][] = [
    [MAPLE.x + 0.3, 2.2, MAPLE.z + 0.1, 0.85],
    [MAPLE.x + 0.9, 2.6, MAPLE.z + 0.25, 0.75],
    [MAPLE.x - 0.4, 2.5, MAPLE.z + 0.2, 0.8],
    [MAPLE.x + 0.3, 2.9, MAPLE.z, 0.7],
    [MAPLE.x + 0.8, 2.1, MAPLE.z - 0.2, 0.6],
    [MAPLE.x - 0.2, 2.0, MAPLE.z - 0.3, 0.55],
  ];
  for (const [x, y, z, r] of canopy) {
    b.part(new THREE.SphereGeometry(r, b.segments(10), b.segments(7)), redLeaf, {
      at: [x, y, z],
      name: "maple-leaves",
    });
  }

  // ---------------------------------------------------------------- rock-garden stones and moss
  // (the island stones above; a few stones by the basin)
  const basinRock = patches("#7a7c72", ["#8b8d80", "#666860"], { size: 0.3, seed: 15 });
  b.part(new THREE.DodecahedronGeometry(0.2, 0), basinRock, {
    at: [BASIN.x - 0.5, 0.1, BASIN.z + 0.35],
    rotation: [20, 10, 30],
    scale: [1.3, 0.8, 1],
    name: "basin-rock",
  });

  // ---------------------------------------------------------------- bamboo grove at the back right
  const culmMat = stripes("#86a95e", "#5b8040", { size: 0.24, axis: "y", width: 0.2, wobble: 0.1 });
  const leafGreen = "#5f8f3c";
  const culms: [number, number, number][] = [
    [3.3, -3.4, 3.6],
    [3.7, -3.0, 4.2],
    [4.1, -3.5, 3.8],
    [4.5, -3.1, 4.6],
    [4.3, -3.7, 3.2],
    [3.9, -2.8, 3.9],
    [4.8, -3.8, 3.4],
  ];
  for (const [x, z, h] of culms) {
    const lx = rnd() * 0.5 - 0.25;
    const lz = rnd() * 0.5 - 0.25;
    b.rod([x, 0, z], [x + lx, h, z + lz], [0.045, 0.03], { color: culmMat, name: "bamboo" });
    const top = new THREE.Vector3(x + lx, h, z + lz);
    for (let k = 0; k < 3; k++) {
      const dir = new THREE.Vector3(rnd() - 0.5, 0.3 + rnd() * 0.4, rnd() - 0.5).normalize();
      b.slab(leafPoints(top, dir, 0.45, 0.07), { color: leafGreen, thickness: 0.012, name: "bamboo-leaf" });
    }
  }

  // ---------------------------------------------------------------- back fence of bamboo
  const fenceMat = grain("#c9b77e", "#a8955f", { size: 0.03, axis: "y" });
  for (let x = -4.9; x <= 4.9; x += 0.26) {
    const h = 1.5 + rnd() * 0.1;
    b.rod([x, 0, -3.9], [x, h, -3.9], 0.022, { color: fenceMat, name: "fence-post" });
  }
  b.rod([-5, 0.5, -3.9], [5, 0.5, -3.9], 0.02, { color: fenceMat, name: "fence-rail" });
  b.rod([-5, 1.2, -3.9], [5, 1.2, -3.9], 0.02, { color: fenceMat, name: "fence-rail" });

  // ---------------------------------------------------------------- azalea mounds
  const shrub = mottle("#3d6e3c", "#5a8a48", { size: 0.3, seed: 14 });
  for (const [x, y, z, r] of [
    [-4.6, 0.3, 0.3, 0.55],
    [-4.3, 0.22, -0.7, 0.42],
    [-4.8, 0.25, -1.3, 0.5],
  ] as const) {
    b.part(new THREE.SphereGeometry(r, b.segments(10), b.segments(6)), shrub, {
      at: [x, y, z],
      scale: [1.1, 0.7, 1.0],
      name: "azalea",
    });
  }

  // ---------------------------------------------------------------- small veranda with a hip roof
  const deckWood = grain("#c7966a", "#a87450", { size: 0.05, axis: "x" });
  b.extrude(
    [
      [2.0, 0.8],
      [4.6, 0.8],
      [4.6, 2.6],
      [2.0, 2.6],
    ],
    { color: deckWood, at: [0, 0.2, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.2, name: "veranda-deck" },
  );
  for (const [x, z] of [
    [2.1, 0.9],
    [4.5, 0.9],
    [2.1, 2.5],
    [4.5, 2.5],
  ]) {
    b.rod([x, 0.1, z], [x, 2.3, z], 0.05, { color: "#4a2f1e", name: "veranda-post" });
  }
  const roof = scales(["#4b5058", "#3a3e45"], "#2a2c31", { size: 0.14, width: 0.2 });
  b.slab(
    [
      [1.7, 2.3, 0.5],
      [4.9, 2.3, 0.5],
      [4.9, 2.95, 1.7],
      [1.7, 2.95, 1.7],
    ],
    { color: roof, thickness: 0.07, name: "roof-front" },
  );
  b.slab(
    [
      [1.7, 2.95, 1.7],
      [4.9, 2.95, 1.7],
      [4.9, 2.3, 2.9],
      [1.7, 2.3, 2.9],
    ],
    { color: roof, thickness: 0.07, name: "roof-back" },
  );

  // ---------------------------------------------------------------- pebbles scattered over the gravel
  const blocked = (p: THREE.Vector3) => {
    const inPond = ((p.x - POND.x) / (POND.rx * 1.15)) ** 2 + ((p.z - POND.z) / (POND.rz * 1.15)) ** 2 < 1;
    const onBridge = Math.abs(p.x - POND.x) < 0.7 && Math.abs(p.z - POND.z) < 2.9;
    const onDeck = p.x > 1.8 && p.x < 4.7 && p.z > 0.7 && p.z < 2.7;
    const nearIsland = Math.hypot(p.x - ISLAND.x, p.z - ISLAND.z) < 0.9;
    const nearFeature = [
      [LANTERN.x, LANTERN.z],
      [BASIN.x, BASIN.z],
      [PINE.x, PINE.z],
      [MAPLE.x, MAPLE.z],
    ].some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 0.6);
    const bamboo = p.x > 3.0 && p.z < -2.4;
    return inPond || onBridge || onDeck || nearIsland || nearFeature || bamboo;
  };
  const pebbleColors = ["#b9b2a0", "#a39d8c", "#c9c2ae"];
  const pebbleRnd = rng(21);
  const hits = b.surface(floor).scatter(160, {
    rng: pebbleRnd,
    minDist: 0.2,
    keepOut: blocked,
    filter: (h) => h.n.y > 0.9,
  });
  hits.forEach((hit, i) => {
    b.stick(new THREE.DodecahedronGeometry(0.07 + pebbleRnd() * 0.05, 0), pebbleColors[i % 3], hit, {
      embed: 0.35,
      spin: pebbleRnd() * 360,
      name: "pebble",
    });
  });

  return b.root;
}
```