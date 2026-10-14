import * as THREE from "three";
import { createBuilder, grain, mottle, noise, paint } from "../../../../src/index";

export const meta = {
  name: "Forest Spirit",
  description:
    "A small deer-shaped spirit of river stone under soft moss, with slender wooden legs ending in hooves, " +
    "flowering antlers, a pale wooden mask face with glowing green eyes and fireflies circling its head.",
};

// Paints: stone under moss on top, grained wood for legs, antlers and mask.
const stone = mottle("#777974", "#9a9c93", { size: 0.22, seed: 4 });
const moss = mottle("#3d6b2c", "#74a94b", { size: 0.1, seed: 9, contrast: 1.2 });
const mossy = paint((p, n) => (n.y * 0.9 + 0.5 * (noise(p, 0.3, 2) - 0.5) + 0.15 > 0.35 ? moss : stone));
const bark = grain("#a8875a", "#7a5c38", { size: 0.035, axis: "y", seed: 3 });
const antlerWood = grain("#d8c7a0", "#9b8460", { size: 0.02, axis: "y", seed: 5 });
const maskWood = grain("#f2e6c8", "#d6c292", { size: 0.04, axis: "y", seed: 7 });
const leaf = mottle("#4f9a3c", "#86c45a", { size: 0.05, seed: 11 });
const flower = "#fbfbf2";
const glow = "#9dff6a";
const hoof = "#3a2b1f";
const firefly = "#e8ff7a";

export default function forestSpirit() {
  const b = createBuilder({ name: "forest-spirit" });

  // Skeleton: pelvis, chest, neck, head.
  const pelvis = b.joint("pelvis", { at: [0, 0.84, -0.3], role: "spine" });
  const chest = b.joint("chest", { parent: pelvis, at: [0, 0.92, 0.18], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.08, 0.4], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.22, 0.56], role: "head" });

  // Stone body, low-poly, with a few stones sitting on the back.
  b.part(new THREE.DodecahedronGeometry(1, 0), mossy, {
    bone: chest,
    at: [0, 0.9, -0.02],
    scale: [0.42, 0.3, 0.6],
    name: "body",
  });
  const backStones: Array<[number, number, number, number]> = [
    [0.1, 1.2, -0.2, 0.13],
    [-0.14, 1.14, -0.36, 0.1],
    [0.02, 1.25, 0.1, 0.09],
  ];
  for (const [x, y, z, r] of backStones) {
    b.part(new THREE.DodecahedronGeometry(r, 0), mossy, {
      bone: chest,
      at: [x, y, z],
      scale: [1, 0.7, 1.1],
      rotation: [x * 200, y * 90, z * 60],
      name: "stone",
    });
  }
  b.part(new THREE.DodecahedronGeometry(0.1, 0), mossy, {
    bone: chest,
    at: [0, 0.96, -0.62],
    scale: [0.9, 0.8, 1.2],
    name: "tuft",
  });

  // Slender wooden legs: hip, knee, ankle, hoof, one chain per leg.
  const leg = (front: boolean, s: 1 | -1) => {
    const tag = (front ? "F" : "B") + (s > 0 ? "L" : "R");
    const x = 0.17 * s;
    const z = front ? 0.2 : -0.36;
    const dz = front ? 0.04 : -0.1;
    const chain = b.chain(
      `leg${tag}`,
      [
        [x, 0.84, z],
        [x * 1.1, 0.46, z + dz],
        [x * 0.92, 0.13, z - dz * 0.2],
        [x * 0.92, 0.03, z + 0.04],
      ],
      { parent: pelvis, role: "leg", names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `hoof${tag}`] },
    );
    const [hip, knee, ankle, toe] = chain.joints;
    b.capsule(hip, knee, [0.058, 0.04], { color: bark, name: `thigh${tag}` });
    b.capsule(knee, ankle, [0.04, 0.03], { color: bark, name: `shin${tag}` });
    b.capsule(ankle, toe, 0.03, { color: bark, name: `foot${tag}` });
    b.part(new THREE.CylinderGeometry(0.048, 0.058, 0.07, 6), hoof, {
      bone: toe,
      at: [x * 0.92, 0.035, z + 0.04],
      name: `hoof${tag}`,
    });
  };
  leg(true, 1);
  leg(true, -1);
  leg(false, 1);
  leg(false, -1);

  // Neck and stone skull.
  b.capsule(chest, neck, [0.15, 0.1], { color: mossy, name: "neck" });
  b.part(new THREE.DodecahedronGeometry(0.2, 0), mossy, {
    bone: head,
    scale: [0.95, 1.05, 1.0],
    name: "skull",
  });

  // Pale wooden mask face with two glowing eyes.
  b.part(new THREE.SphereGeometry(0.18, 8, 6), maskWood, {
    bone: head,
    at: [0, 1.2, 0.7],
    scale: [0.8, 1, 0.45],
    name: "mask",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), glow, {
      bone: head,
      at: [0.07 * s, 1.23, 0.765],
      name: "eye",
    });
  }

  // Antlers: a curved beam per side, two tines, leaves and white flowers at the tips.
  const antlers = (s: 1 | -1) => {
    const P = (x: number, y: number, z: number): [number, number, number] => [x * s, y, z];
    b.sweep(
      [P(0.09, 1.34, 0.5), P(0.2, 1.5, 0.44), P(0.34, 1.68, 0.36), P(0.4, 1.9, 0.22)],
      [0.032, 0.011],
      { color: antlerWood, name: "antler" },
    );
    b.rod(P(0.24, 1.52, 0.42), P(0.42, 1.6, 0.42), [0.02, 0.008], { color: antlerWood, name: "tine" });
    b.rod(P(0.33, 1.7, 0.34), P(0.44, 1.84, 0.46), [0.018, 0.007], { color: antlerWood, name: "tine" });

    for (const [x, y, z] of [
      [0.2, 1.5, 0.5],
      [0.3, 1.6, 0.42],
      [0.36, 1.78, 0.32],
    ] as const) {
      b.part(new THREE.OctahedronGeometry(0.035, 0), leaf, {
        bone: head,
        at: P(x, y, z),
        scale: [1, 0.35, 0.6],
        rotation: [0, 0, 30 * s],
        name: "leaf",
      });
    }
    for (const [x, y, z] of [
      [0.42, 1.6, 0.42],
      [0.44, 1.84, 0.46],
      [0.4, 1.9, 0.22],
    ] as const) {
      b.part(new THREE.IcosahedronGeometry(0.03, 0), flower, {
        bone: head,
        at: P(x, y, z),
        name: "flower",
      });
    }
  };
  antlers(1);
  antlers(-1);

  // Fireflies circling the head.
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26 + 0.3;
    const r = 0.36 + 0.08 * (i % 2);
    b.part(new THREE.IcosahedronGeometry(0.022, 0), firefly, {
      bone: head,
      at: [Math.cos(a) * r, 1.3 + 0.2 * Math.sin(a * 1.7), 0.56 + Math.sin(a) * r],
      name: "firefly",
    });
  }

  return b.root;
}
