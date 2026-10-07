import * as THREE from "three";
import { createBuilder, rng, catmull, grain, mottle } from "../../../../src/index";

export const meta = {
  name: "pirate treasure chest",
  description:
    "Weathered dark wood chest with rusty iron straps and studs, a loose brass padlock, and its open lid spilling gold coins, a pearl necklace, a jewelled goblet and red and green gems. A skull and crossbones is carved on the front.",
};

export default function build() {
  const b = createBuilder({ name: "treasure-chest" });
  const rnd = rng(11);

  // Materials
  const WOOD = grain("#5c3c23", "#3a2415", { size: 0.05, axis: "x", seed: 3 });
  const DARK = "#1b1009";
  const IRON = mottle("#5a3520", "#8a4f28", { size: 0.12, seed: 4 });
  const STUD = "#3b3c40";
  const BRASS = "#b7892e";
  const GOLD = "#e2a72e";
  const GOLD_DARK = "#b97d18";
  const PEARL = "#f1ead8";
  const BONE = "#e9e0c8";
  const RED = "#b0102a";
  const GREEN = "#14873f";

  // Joints: the chest body is the root, the lid hinges at its back top edge.
  const chest = b.joint("chest", { at: [0, 0, 0], role: "spine" });
  const lid = b.joint("lid", { parent: chest, at: [0, 0.48, -0.28], role: "hinge" });

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string | THREE.Color | any, bone: any = chest) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], bone });

  const sphere = (r: number, x: number, y: number, z: number, color: any, bone: any = chest) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z], bone });

  // ---- Body: planked box with an open top ----
  box(0.92, 0.06, 0.58, 0, 0.03, 0, WOOD); // bottom
  box(0.92, 0.42, 0.04, 0, 0.27, 0.28, WOOD); // front
  box(0.92, 0.42, 0.04, 0, 0.27, -0.28, WOOD); // back
  box(0.04, 0.42, 0.52, -0.44, 0.27, 0, WOOD); // left side
  box(0.04, 0.42, 0.52, 0.44, 0.27, 0, WOOD); // right side
  box(0.84, 0.02, 0.5, 0, 0.07, 0, DARK); // interior floor

  // Plank seams
  for (const y of [0.24, 0.36]) {
    box(0.92, 0.005, 0.008, 0, y, 0.302, DARK);
    box(0.92, 0.005, 0.008, 0, y, -0.302, DARK);
  }

  // ---- Iron bands and corner straps ----
  const band = (y: number) => {
    box(0.96, 0.04, 0.014, 0, y, 0.307, IRON);
    box(0.96, 0.04, 0.014, 0, y, -0.307, IRON);
    box(0.014, 0.04, 0.6, -0.468, y, 0, IRON);
    box(0.014, 0.04, 0.6, 0.468, y, 0, IRON);
  };
  band(0.07);
  band(0.42);
  for (const x of [-0.44, 0.44]) box(0.05, 0.46, 0.016, x, 0.25, 0.31, IRON);

  // Studs along the front bands
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.1;
    sphere(0.014, x, 0.07, 0.318, STUD);
    sphere(0.014, x, 0.42, 0.318, STUD);
  }

  // ---- Carved skull and crossbones on the front ----
  sphere(0.065, 0, 0.31, 0.315, BONE);
  box(0.07, 0.035, 0.05, 0, 0.245, 0.32, BONE); // jaw
  sphere(0.018, -0.025, 0.3, 0.37, DARK);
  sphere(0.018, 0.025, 0.3, 0.37, DARK);
  b.part(new THREE.ConeGeometry(0.012, 0.025, 4), DARK, { at: [0, 0.272, 0.37], rotation: [180, 0, 0], bone: chest });
  b.rod([-0.11, 0.12, 0.322], [0.11, 0.2, 0.322], 0.013, { color: BONE, bone: chest });
  b.rod([-0.11, 0.2, 0.322], [0.11, 0.12, 0.322], 0.013, { color: BONE, bone: chest });
  for (const [x, y] of [
    [-0.11, 0.12],
    [0.11, 0.2],
    [-0.11, 0.2],
    [0.11, 0.12],
  ])
    sphere(0.02, x, y, 0.322, BONE);

  // ---- Hasp and loose padlock on the front ----
  box(0.08, 0.1, 0.012, 0.27, 0.36, 0.306, IRON);
  b.part(new THREE.BoxGeometry(0.075, 0.085, 0.035), BRASS, {
    at: [0.27, 0.27, 0.33],
    rotation: [0, 0, 14],
    bone: chest,
  });
  b.part(new THREE.TorusGeometry(0.022, 0.007, 6, 10, 4.8), IRON, {
    at: [0.27, 0.325, 0.33],
    rotation: [0, 0, 14],
    bone: chest,
  });

  // ---- Lid (hinged, posed open below) ----
  b.part(new THREE.BoxGeometry(0.94, 0.07, 0.6), WOOD, { at: [0, 0.515, 0], bone: lid });
  b.part(new THREE.BoxGeometry(0.96, 0.072, 0.014), IRON, { at: [0, 0.515, 0.307], bone: lid });
  b.part(new THREE.BoxGeometry(0.96, 0.072, 0.014), IRON, { at: [0, 0.515, -0.307], bone: lid });
  b.part(new THREE.BoxGeometry(0.014, 0.072, 0.62), IRON, { at: [-0.477, 0.515, 0], bone: lid });
  b.part(new THREE.BoxGeometry(0.014, 0.072, 0.62), IRON, { at: [0.477, 0.515, 0], bone: lid });
  for (const x of [-0.3, 0.3]) {
    b.part(new THREE.BoxGeometry(0.05, 0.014, 0.62), IRON, { at: [x, 0.557, 0], bone: lid });
    for (const z of [-0.2, 0, 0.2]) sphere(0.014, x, 0.566, z, STUD, lid);
  }
  for (let i = -3; i <= 3; i++) sphere(0.014, i * 0.12, 0.515, 0.318, STUD, lid);

  // ---- Treasure inside: coins heaped in the chest ----
  const coin = (x: number, y: number, z: number, tilt: number) =>
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.007, 10), GOLD, {
      at: [x, y, z],
      rotation: [(rnd() * 2 - 1) * tilt, rnd() * 360, (rnd() * 2 - 1) * tilt],
      bone: chest,
    });

  for (let i = 0; i < 90; i++) {
    const x = (rnd() * 2 - 1) * 0.38;
    const z = (rnd() * 2 - 1) * 0.22;
    const heap = 1 - Math.abs(x) / 0.5;
    const y = 0.085 + rnd() * 0.16 * heap;
    coin(x, y, z, 25);
  }

  // Coins spilling over the front onto the floor
  for (let i = 0; i < 26; i++) {
    const x = (rnd() * 2 - 1) * 0.7;
    const z = 0.33 + rnd() * 0.35;
    coin(x, 0.004, z, 12);
  }

  // ---- Jewelled goblet standing in the coins ----
  const gx = -0.18;
  const gz = -0.02;
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.066, 0.012],
      [0.022, 0.045],
      [0.016, 0.09],
      [0.05, 0.115],
      [0.06, 0.15],
      [0.05, 0.16],
      [0, 0.135],
    ],
    { at: [gx, 0.3, gz], bone: chest, segments: 10, color: GOLD_DARK },
  );
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    b.part(new THREE.OctahedronGeometry(0.014), k % 2 ? GREEN : RED, {
      at: [gx + 0.05 * Math.cos(a), 0.41, gz + 0.05 * Math.sin(a)],
      rotation: [rnd() * 180, rnd() * 180, 0],
      flat: true,
      bone: chest,
    });
  }

  // ---- Pearl necklace draped over the coins and the front rim ----
  const necklace = catmull([
    [-0.28, 0.33, 0.02],
    [-0.14, 0.36, 0.14],
    [0.02, 0.4, 0.2],
    [0.18, 0.42, 0.22],
    [0.3, 0.4, 0.3],
    [0.36, 0.3, 0.36],
    [0.36, 0.18, 0.4],
  ]);
  b.along(necklace, 26, (at) => {
    b.part(new THREE.SphereGeometry(0.014, 8, 6), PEARL, { at });
  });

  // ---- Loose red and green gems ----
  const gems: [number, number, number][] = [
    [0.1, 0.33, 0.05],
    [-0.05, 0.31, -0.08],
    [0.22, 0.3, -0.1],
    [-0.32, 0.25, -0.12],
    [0.02, 0.36, 0.12],
    [0.3, 0.2, 0.3],
    [-0.12, 0.28, 0.2],
    [0.36, 0.1, 0.42],
  ];
  gems.forEach(([x, y, z], i) => {
    b.part(new THREE.OctahedronGeometry(0.024), i % 2 ? GREEN : RED, {
      at: [x, y, z],
      rotation: [rnd() * 180, rnd() * 180, 0],
      flat: true,
      bone: chest,
    });
  });

  // Open the lid, hinged at the back top edge.
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });

  return b.root;
}
