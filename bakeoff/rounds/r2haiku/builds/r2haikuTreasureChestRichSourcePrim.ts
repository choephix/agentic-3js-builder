import * as THREE from "three";
import { createBuilder, grain, mottle, rng } from "../../../../src/index";

export const meta = {
  name: "Pirate treasure chest",
  description: "A weathered oak chest with its lid thrown open, iron straps and studs, a loose padlock, and gold, pearls, a jewelled goblet and gems spilling out. A skull and crossbones is carved on the front.",
};

const DEG = Math.PI / 180;
const GOLD = "#d9a22e";
const BRASS = "#a77b2a";
const PEARL = "#f3efe4";
const BONE = "#d9d0b6";
const DARK = "#1c1109";
const RED = "#b3122c";
const GREEN = "#17905a";

/** Weathered dark oak: grain running along the planks, with cloudy darker blotches. */
const wood = mottle(
  grain("#5a3520", "#2a170b", { size: 0.04, axis: "x", seed: 3 }),
  "#4a4236",
  { size: 0.3, contrast: 0.7, seed: 5 },
);

/** Rusty iron: dark steel patched with orange rust. */
const iron = mottle("#4d4640", "#8c4c24", { size: 0.05, seed: 9, contrast: 0.8 });

/** Height of the coin heap above the floor at (x, z). */
const heap = (x: number, z: number) => 0.05 + 0.42 * Math.max(0, 1 - (x / 0.42) ** 2 - (z / 0.24) ** 2) * 0.75;

export default function treasureChest() {
  const b = createBuilder({ name: "pirate treasure chest", paintSize: 2048 });
  const r = rng(7);

  // Skeleton: the body is the root, the lid hinges on its back top edge.
  b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  b.joint("lid", { parent: "base", at: [0, 0.42, -0.28], dir: [0, 1, 0], role: "hinge" });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---- Body: a hollow box of planks -------------------------------------------------------------
  b.part(box(0.82, 0.04, 0.52), wood, { at: [0, 0.02, 0], bone: "base" }); // floor
  b.part(box(0.9, 0.42, 0.04), wood, { at: [0, 0.21, 0.26], bone: "base" }); // front
  b.part(box(0.9, 0.42, 0.04), wood, { at: [0, 0.21, -0.26], bone: "base" }); // back
  b.part(box(0.04, 0.42, 0.52), wood, { at: [0.43, 0.21, 0], bone: "base" }); // left
  b.part(box(0.04, 0.42, 0.52), wood, { at: [-0.43, 0.21, 0], bone: "base" }); // right

  // Plank seams on the front and back.
  for (const z of [0.283, -0.283]) {
    for (const y of [0.14, 0.28]) b.part(box(0.9, 0.007, 0.004), DARK, { at: [0, y, z], bone: "base" });
    for (const x of [-0.15, 0.15]) b.part(box(0.007, 0.42, 0.004), DARK, { at: [x, 0.21, z], bone: "base" });
  }

  // ---- Iron straps, front and back, and along the sides --------------------------------------
  for (const z of [0.287, -0.287]) {
    for (const x of [-0.3, 0.3]) b.part(box(0.04, 0.42, 0.014), iron, { at: [x, 0.21, z], bone: "base" });
    for (const y of [0.07, 0.34]) b.part(box(0.9, 0.04, 0.014), iron, { at: [0, y, z], bone: "base" });
  }
  for (const x of [0.457, -0.457]) {
    for (const z of [-0.2, 0.2]) b.part(box(0.014, 0.42, 0.04), iron, { at: [x, 0.21, z], bone: "base" });
  }

  // Brass studs where the straps cross.
  const stud = () => new THREE.SphereGeometry(0.013, 8, 6);
  for (const y of [0.07, 0.34]) {
    for (const x of [-0.42, -0.15, 0.15, 0.42]) b.part(stud(), BRASS, { at: [x, y, 0.296], bone: "base" });
    b.part(stud(), BRASS, { at: [-0.3, y, 0.296], bone: "base" });
    b.part(stud(), BRASS, { at: [-0.3, y, -0.296], bone: "base" });
    b.part(stud(), BRASS, { at: [0.3, y, -0.296], bone: "base" });
  }
  for (const z of [-0.2, 0.2]) {
    for (const y of [0.07, 0.34]) {
      b.part(stud(), BRASS, { at: [0.466, y, z], bone: "base" });
      b.part(stud(), BRASS, { at: [-0.466, y, z], bone: "base" });
    }
  }

  // ---- Carved skull and crossbones on the front ----------------------------------------------
  b.part(new THREE.SphereGeometry(0.045, 12, 10), BONE, {
    at: [0, 0.27, 0.302],
    scale: [1, 1.05, 0.7],
    bone: "base",
  });
  b.part(box(0.045, 0.02, 0.03), BONE, { at: [0, 0.228, 0.3], bone: "base" });
  for (const x of [-0.018, 0.018]) {
    b.part(new THREE.SphereGeometry(0.012, 8, 6), DARK, { at: [x, 0.28, 0.33], bone: "base" });
  }
  b.part(box(0.012, 0.016, 0.01), DARK, { at: [0, 0.262, 0.332], bone: "base" });
  const bone = (a: [number, number, number], c: [number, number, number]) =>
    b.capsule(a, c, 0.009, { color: BONE, bone: "base" });
  bone([-0.07, 0.13, 0.29], [0.07, 0.25, 0.29]);
  bone([0.07, 0.13, 0.29], [-0.07, 0.25, 0.29]);
  for (const [x, y] of [
    [-0.07, 0.13],
    [0.07, 0.13],
    [-0.07, 0.25],
    [0.07, 0.25],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.013, 8, 6), BONE, { at: [x, y, 0.29], bone: "base" });
  }

  // ---- Hasp and a loose padlock hanging from it -----------------------------------------------
  b.part(box(0.07, 0.05, 0.012), iron, { at: [0.36, 0.4, 0.29], bone: "base" });
  b.part(new THREE.TorusGeometry(0.018, 0.005, 8, 16, Math.PI), iron, { at: [0.36, 0.37, 0.31], bone: "base" });
  b.part(box(0.06, 0.075, 0.025), iron, { at: [0.36, 0.3325, 0.31], rotation: [0, 0, 5], bone: "base" });
  b.part(box(0.008, 0.02, 0.004), DARK, { at: [0.36, 0.325, 0.323], bone: "base" });

  // ---- Lid: an open slab hinged on the back edge ---------------------------------------------
  const lid = b.region({
    at: [0, 0.42, -0.28],
    quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-100 * DEG, 0, 0)),
    bone: "lid",
  });
  lid.part(box(0.9, 0.1, 0.56), wood, { at: [0, 0.05, 0.28] });
  for (const x of [-0.3, 0.3]) {
    lid.part(box(0.04, 0.012, 0.58), iron, { at: [x, 0.106, 0.28] });
    for (const z of [0.1, 0.46]) {
      lid.part(new THREE.SphereGeometry(0.013, 8, 6), BRASS, { at: [x, 0.1, z] });
    }
  }
  lid.part(box(0.1, 0.03, 0.06), iron, { at: [0, 0.1, 0.5] }); // lock plate on the lid's far edge

  // ---- Gold coins: a heap inside and a spill over the front ----------------------------------
  const coin = () => new THREE.CylinderGeometry(0.03, 0.03, 0.006, 12);
  for (let i = 0; i < 70; i++) {
    const x = (r() * 2 - 1) * 0.4;
    const z = (r() * 2 - 1) * 0.22;
    const mound = Math.max(0, 1 - (x / 0.42) ** 2 - (z / 0.24) ** 2);
    const y = 0.05 + mound * 0.42 * (0.5 + 0.5 * r());
    b.part(coin(), i % 3 === 0 ? "#c98f1e" : GOLD, {
      at: [x, y, z],
      rotation: [(r() * 2 - 1) * 35, r() * 360, (r() * 2 - 1) * 35],
      bone: "base",
    });
  }
  for (let i = 0; i < 16; i++) {
    const x = (r() * 2 - 1) * 0.5;
    const z = 0.32 + r() * 0.22;
    b.part(coin(), GOLD, {
      at: [x, 0.004, z],
      rotation: [(r() * 2 - 1) * 6, r() * 360, (r() * 2 - 1) * 6],
      bone: "base",
    });
  }

  // ---- Pearl necklace draped over the heap ----------------------------------------------------
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const x = 0.02 + 0.17 * Math.cos(a);
    const z = 0.0 + 0.12 * Math.sin(a);
    b.part(new THREE.SphereGeometry(0.011, 10, 8), PEARL, {
      at: [x, heap(x, z) + 0.012, z],
      bone: "base",
    });
  }

  // ---- Jewelled goblet standing in the coins -------------------------------------------------
  const gx = -0.2;
  const gz = 0.05;
  const gy = heap(gx, gz) + 0.02;
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.04, 0.012],
      [0.013, 0.03],
      [0.011, 0.08],
      [0.05, 0.12],
      [0.056, 0.16],
      [0.05, 0.168],
      [0.044, 0.16],
      [0.04, 0.125],
      [0, 0.1],
    ],
    { color: GOLD, at: [gx, gy, gz], bone: "base", segments: 12 },
  );
  for (const [k, c] of [
    [-0.5, RED],
    [0, GREEN],
    [0.5, RED],
  ] as const) {
    b.part(new THREE.OctahedronGeometry(0.011), c, {
      at: [gx + 0.054 * Math.sin(k), gy + 0.12, gz + 0.054 * Math.cos(k)],
      scale: [1, 1.3, 1],
      bone: "base",
    });
  }

  // ---- A few loose red and green gems in the heap ------------------------------------------
  for (let i = 0; i < 5; i++) {
    const x = (r() * 2 - 1) * 0.3;
    const z = (r() * 2 - 1) * 0.18;
    b.part(new THREE.OctahedronGeometry(0.014), i % 2 === 0 ? RED : GREEN, {
      at: [x, heap(x, z) + 0.01, z],
      scale: [1, 1.3, 1],
      rotation: [r() * 60, r() * 360, r() * 60],
      bone: "base",
    });
  }

  return b.root;
}
