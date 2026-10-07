import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "hedgehog",
  description: "A plump hedgehog on an autumn walk: chestnut spine dome with cream tips, a red maple leaf stuck on its back.",
};

const CHESTNUT = "#8a4b2b";
const CREAM = "#f3e6cf";
const FAWN = "#d9a86c";
const EAR = "#e3b58a";
const PINK = "#f2a7b0";
const BLACK = "#141012";
const RED = "#c0262d";

/** Maple leaf outline in metres, centred on its origin, stem at the bottom. */
const MAPLE: [number, number][] = [
  [0, 0.036],
  [0.01, 0.016],
  [0.034, 0.026],
  [0.028, 0.004],
  [0.04, -0.006],
  [0.012, -0.01],
  [0.01, -0.026],
  [0.002, -0.022],
  [0, -0.04],
  [-0.002, -0.022],
  [-0.01, -0.026],
  [-0.012, -0.01],
  [-0.04, -0.006],
  [-0.028, 0.004],
  [-0.034, 0.026],
  [-0.01, 0.016],
];

export default function hedgehog() {
  const b = createBuilder({ name: "hedgehog", paintSize: 1024 });
  const random = rng(7);

  // Skeleton: body root, head, four short legs.
  b.joint("body", { at: [0, 0.07, -0.01], role: "spine" });
  b.joint("head", { parent: "body", at: [0, 0.065, 0.095], dir: [0, -0.15, 1], role: "head" });
  b.joint("legFL", { parent: "body", at: [0.045, 0.02, 0.07], dir: [0, -1, 0], role: "leg" });
  b.joint("legFR", { parent: "body", at: [-0.045, 0.02, 0.07], dir: [0, -1, 0], role: "leg" });
  b.joint("legBL", { parent: "body", at: [0.05, 0.02, -0.08], dir: [0, -1, 0], role: "leg" });
  b.joint("legBR", { parent: "body", at: [-0.05, 0.02, -0.08], dir: [0, -1, 0], role: "leg" });

  // Body: a dome of chestnut, belly in fawn underneath.
  const C = [0, 0.072, -0.012];
  const RX = 0.085;
  const RY = 0.07;
  const RZ = 0.105;
  b.part(new THREE.SphereGeometry(1, b.segments(18), b.segments(14)), CHESTNUT, {
    at: C,
    bone: "body",
    scale: [RX, RY, RZ],
    name: "body",
  });
  b.part(new THREE.SphereGeometry(1, b.segments(14), b.segments(10)), FAWN, {
    at: [0, 0.03, 0.01],
    bone: "body",
    scale: [0.072, 0.04, 0.095],
    name: "belly",
  });

  // Spines: each a chestnut cone with a cream tip, standing off the dome's back and sides.
  const spine = (p: number[], n: number[], len: number) => {
    const base = p;
    const mid = p.map((v, k) => v + n[k] * len * 0.55);
    const tip = p.map((v, k) => v + n[k] * len);
    b.rod(base, mid, [0.0055, 0.0028], { color: CHESTNUT, name: "spine" });
    b.rod(mid, tip, [0.0028, 0.0006], { color: CREAM, name: "spineTip" });
  };
  for (let i = 0; i < 9; i++) {
    const phi = 0.3 + (i / 8) * 2.3;
    const count = Math.max(6, Math.round(Math.sin(phi) * 18));
    for (let k = 0; k < count; k++) {
      const theta = (k / count) * Math.PI * 2 + (i % 2) * 0.5 + (random() - 0.5) * 0.3;
      const ph = phi + (random() - 0.5) * 0.12;
      const sx = Math.sin(ph) * Math.cos(theta);
      const sy = Math.cos(ph);
      const sz = Math.sin(ph) * Math.sin(theta);
      const p = [C[0] + RX * sx, C[1] + RY * sy, C[2] + RZ * sz];
      const nx = sx / RX;
      const ny = sy / RY;
      const nz = sz / RZ;
      const len = Math.hypot(nx, ny, nz);
      const n = [nx / len, ny / len, nz / len];
      if (n[2] > 0.35 || n[1] < -0.25) continue;
      spine(p, n, 0.028 + random() * 0.008);
    }
  }

  // Head: soft fawn dome with a pointed, twitchy snout.
  b.part(new THREE.SphereGeometry(1, b.segments(16), b.segments(12)), FAWN, {
    at: [0, 0.062, 0.095],
    bone: "head",
    scale: [0.05, 0.047, 0.05],
    name: "head",
  });
  b.capsule([0, 0.06, 0.1], [0, 0.04, 0.165], [0.04, 0.012], { color: FAWN, bone: "head", name: "snout" });
  b.part(new THREE.SphereGeometry(1, b.segments(10), b.segments(8)), BLACK, {
    at: [0, 0.042, 0.168],
    bone: "head",
    scale: 0.012,
    name: "nose",
  });

  // Tiny round ears on the crown.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, b.segments(10), b.segments(8)), EAR, {
      at: [s * 0.038, 0.098, 0.088],
      bone: "head",
      scale: [0.013, 0.013, 0.006],
      name: "ear",
    });
  }

  // Bright beady eyes with a catch-light.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, b.segments(10), b.segments(8)), BLACK, {
      at: [s * 0.024, 0.068, 0.142],
      bone: "head",
      scale: 0.009,
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(1, b.segments(6), b.segments(4)), "#ffffff", {
      at: [s * 0.027, 0.073, 0.149],
      bone: "head",
      scale: 0.0032,
      name: "glint",
    });
  }

  // Little pink paws, planted on the floor.
  const paws: Array<[string, number, number]> = [
    ["legFL", 0.045, 0.07],
    ["legFR", -0.045, 0.07],
    ["legBL", 0.05, -0.08],
    ["legBR", -0.05, -0.08],
  ];
  for (const [bone, x, z] of paws) {
    b.part(new THREE.SphereGeometry(1, b.segments(12), b.segments(8)), PINK, {
      at: [x, 0.0095, z + 0.012],
      bone,
      scale: [0.021, 0.0095, 0.017],
      name: "paw",
    });
  }

  // A single red maple leaf stuck on the spines, like a trophy.
  b.extrude(MAPLE, {
    color: RED,
    at: [0.02, 0.16, -0.04],
    x: [1, 0, 0.3],
    y: [0, 1, 0],
    thickness: 0.003,
    bevel: 0.001,
    bone: "body",
    name: "mapleLeaf",
  });

  return b.root;
}
