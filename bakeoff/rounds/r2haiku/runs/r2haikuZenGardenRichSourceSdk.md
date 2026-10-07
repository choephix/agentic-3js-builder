```ts
import * as THREE from "three";
import { catmull, createBuilder, mix, mottle, noise, paint, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "Japanese garden diorama",
  description:
    "A square garden base with a red arched bridge over a koi pond, three koi, a stone lantern, a cloud-pruned pine, a pink cherry tree dropping petals, raked gravel, mossy rocks and stepping stones.",
};

const RED = "#b5302c";
const WOOD = "#6b4a2b";
const BARK = "#4a3026";

export default function build() {
  const b = createBuilder({ name: "japanese-garden", detail: 1, paintSize: 1024 });
  const random = rng(7);

  // Paints: raked gravel with ripples centred on the pond, water with soft depth variation, koi with white spots.
  const gravel = paint((p) => {
    const d = Math.hypot(p.x - 0.1, p.z - 0.03);
    return mix("#f1ede4", "#d7d1c3", 0.5 + 0.5 * Math.sin(d * 75));
  });
  const water = paint((p) => mix("#1d5566", "#3b8a92", noise(p, 0.06, 3)));
  const koiPaint = spots("#ff7a2a", "#fbf7f0", { size: 0.035, amount: 0.45, seed: 4 });
  const pineFoliage = mottle("#2f6b43", "#3f7f4f", { size: 0.05, seed: 2 });
  const mossRock = mottle("#7b7f78", "#8b9184", { size: 0.06, seed: 5 });

  // The root joint: every piece of the scenery rides it.
  b.joint("ground", { at: [0, 0, 0] });

  // Base: a square plinth from y = 0 to 0.06, gravel on top, wood at the sides.
  const square = [
    [-0.6, -0.6],
    [0.6, -0.6],
    [0.6, 0.6],
    [-0.6, 0.6],
  ];
  b.extrude(square, {
    name: "base",
    color: paint((p, n) => (n.y > 0.5 ? gravel : WOOD)),
    at: [0, 0.03, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.06,
    bevel: 0.012,
  });

  // Pond: a kidney-smoothed water slab sitting in the gravel.
  const pond: number[][] = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [0.1 + 0.26 * Math.cos(a), 0.03 + 0.2 * Math.sin(a)];
  });
  b.extrude(pond, {
    name: "pond",
    color: water,
    at: [0, 0.066, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.012,
    smoothing: 2,
  });

  // Koi: tapered swept bodies with spotted paint, and a small tail fin.
  const koi = (cx: number, cz: number, ang: number) => {
    const fwd = [Math.sin(ang), 0, Math.cos(ang)];
    const side = [Math.cos(ang), 0, -Math.sin(ang)];
    const at = (f: number, w: number): [number, number, number] => [
      cx + fwd[0] * f + side[0] * w,
      0.066,
      cz + fwd[2] * f + side[2] * w,
    ];
    const spine = [0, 0.25, 0.5, 0.75, 1].map((u) => {
      const f = 0.06 - 0.12 * u;
      const w = 0.012 * Math.sin(u * Math.PI * 1.2) * u;
      return at(f, w);
    });
    b.sweep(catmull(spine), (t: number) => 0.015 * Math.max(0.25, Math.sin(Math.PI * (0.08 + 0.84 * t))), {
      name: "koi",
      color: koiPaint,
    });
    b.slab(
      [at(-0.05, 0), at(-0.085, 0.02), at(-0.095, 0), at(-0.085, -0.02)],
      { name: "koi.fin", color: "#ff7a2a", thickness: 0.003 },
    );
  };
  koi(0.02, -0.02, 0.35);
  koi(0.2, 0.09, -1.0);
  koi(0.12, -0.1, 2.6);

  // Red wooden bridge: an arch in the YZ plane, crossing the pond along Z.
  const deck = (x: number, dy: number, n = 12) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const u = i / n;
      return [x, 0.07 + 0.14 * Math.sin(Math.PI * u) + dy, -0.32 + 0.7 * u] as [number, number, number];
    });
  b.sweep(catmull(deck(0.1, 0)), {
    name: "bridge.deck",
    radius: () => [0.05, 0.012],
    section: "box",
    caps: "flat",
    color: RED,
  });
  b.sweep(catmull(deck(0.15, 0.05)), 0.006, { name: "bridge.railR", color: RED });
  b.sweep(catmull(deck(0.05, 0.05)), 0.006, { name: "bridge.railL", color: RED });

  // Stepping stones from the front edge to the bridge's near end.
  const stones: Array<[number, number]> = [
    [0.2, 0.56],
    [0.16, 0.49],
    [0.12, 0.42],
  ];
  for (const [x, z] of stones)
    b.part(new THREE.SphereGeometry(0.05, b.segments(10), b.segments(6)), "#9c9a94", {
      name: "stepping-stone",
      at: [x, 0.062, z],
      scale: [1, 0.32, 0.85],
    });

  // Stone lantern at the back left, on a lathed pedestal, with a glowing lamp box and a flared roof.
  const [lx, ly, lz] = [-0.38, 0.06, -0.2];
  b.lathe(
    [
      [0, 0],
      [0.08, 0],
      [0.08, 0.02],
      [0.045, 0.05],
      [0.04, 0.1],
      [0.03, 0.1],
      [0.03, 0.3],
      [0.05, 0.33],
      [0, 0.33],
    ],
    { name: "lantern.pedestal", color: "#8a8f93", at: [lx, ly, lz] },
  );
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), "#ffd27a", { name: "lantern.lamp", at: [lx, ly + 0.37, lz] });
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.09, 0.05],
      [0.04, 0.07],
      [0, 0.085],
    ],
    { name: "lantern.roof", color: "#3b3a3f", at: [lx, ly + 0.42, lz] },
  );
  b.part(new THREE.SphereGeometry(0.02, b.segments(6), b.segments(4)), "#3b3a3f", {
    name: "lantern.finial",
    at: [lx, ly + 0.52, lz],
  });

  // Cloud-pruned pine at the back right: a trunk and tiers of flattened foliage pads.
  const [px, pz] = [0.42, -0.3];
  b.rod([px, 0.06, pz], [px, 0.42, pz], [0.022, 0.01], { name: "pine.trunk", color: BARK });
  b.rod([px, 0.3, pz], [px - 0.14, 0.4, pz + 0.02], [0.008, 0.004], { name: "pine.branchL", color: BARK });
  b.rod([px, 0.34, pz], [px + 0.14, 0.44, pz - 0.02], [0.008, 0.004], { name: "pine.branchR", color: BARK });
  const pads: Array<[number, number, number, number]> = [
    [0, 0.34, 0, 0.13],
    [-0.13, 0.4, 0.03, 0.1],
    [0.12, 0.42, -0.02, 0.1],
    [0, 0.48, 0, 0.12],
    [-0.04, 0.58, 0.02, 0.09],
    [0.05, 0.66, 0, 0.06],
  ];
  for (const [dx, dy, dz, r] of pads)
    b.part(new THREE.SphereGeometry(r, b.segments(10), b.segments(7)), pineFoliage, {
      name: "pine.pad",
      at: [px + dx, dy, pz + dz],
      scale: [1, 0.6, 1],
    });

  // Cherry tree at the front left: a curved trunk, branches and a cloud of pink blossom.
  const [cx, cz] = [-0.42, 0.26];
  b.sweep(
    catmull([
      [-0.4, 0.06, 0.25],
      [-0.41, 0.22, 0.24],
      [-0.37, 0.38, 0.25],
      [cx, 0.52, cz],
    ]),
    (t: number) => 0.03 - 0.012 * t,
    { name: "cherry.trunk", color: BARK },
  );
  b.rod([-0.41, 0.36, 0.25], [-0.53, 0.5, 0.24], [0.014, 0.005], { name: "cherry.branchL", color: BARK });
  b.rod([-0.38, 0.4, 0.25], [-0.3, 0.52, 0.27], [0.013, 0.005], { name: "cherry.branchR", color: BARK });
  b.rod([cx, 0.5, cz], [cx - 0.05, 0.62, cz + 0.02], [0.01, 0.004], { name: "cherry.branchTop", color: BARK });
  const blossom = ["#f6b2c6", "#ffd0dc", "#f49bb7"];
  const blobs: Array<[number, number, number, number]> = [
    [0, 0, 0, 0.13],
    [-0.09, 0.04, 0.03, 0.1],
    [0.09, 0.03, -0.02, 0.1],
    [0.02, 0.12, 0.05, 0.09],
    [-0.06, -0.04, -0.07, 0.09],
    [0.1, -0.05, 0.06, 0.08],
    [-0.13, -0.02, -0.04, 0.08],
    [0.04, 0.16, -0.05, 0.07],
    [-0.03, 0.08, 0.11, 0.08],
    [0.05, -0.08, -0.1, 0.07],
  ];
  blobs.forEach(([dx, dy, dz, r], i) =>
    b.part(new THREE.SphereGeometry(r, b.segments(9), b.segments(6)), blossom[i % blossom.length], {
      name: "cherry.blossom",
      at: [cx + dx, 0.62 + dy, cz + dz],
      scale: [1, 0.85, 1],
    }),
  );
  // Petals drifting down past the canopy.
  for (let i = 0; i < 16; i++) {
    const x = cx + (random() - 0.5) * 0.7;
    const z = cz + (random() - 0.5) * 0.7;
    const y = 0.12 + random() * 0.6;
    b.part(new THREE.SphereGeometry(0.013, b.segments(5), b.segments(4)), "#ffc2d4", {
      name: "petal",
      at: [x, y, z],
      scale: [1, 0.25, 0.7],
      rotation: [random() * 180, random() * 180, 0],
    });
  }

  // Mossy rocks: grey stone with a green moss cap.
  const rocks: Array<[number, number, number]> = [
    [0.5, 0.2, 0.07],
    [-0.2, 0.45, 0.05],
    [0.44, -0.12, 0.055],
  ];
  for (const [x, z, r] of rocks) {
    const y = 0.06 + r * 0.42;
    b.part(new THREE.SphereGeometry(r, b.segments(9), b.segments(6)), mossRock, {
      name: "rock",
      at: [x, y, z],
      scale: [1.2, 0.7, 1],
    });
    b.part(new THREE.SphereGeometry(r * 0.8, b.segments(8), b.segments(5)), "#6f9a45", {
      name: "rock.moss",
      at: [x, y + r * 0.42, z],
      scale: [1.1, 0.35, 1],
    });
  }

  return b.root;
}
```