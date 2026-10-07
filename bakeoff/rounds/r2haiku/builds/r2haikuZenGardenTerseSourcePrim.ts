import * as THREE from "three";
import { countershade, createBuilder, grain, mix, mottle, paint, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese garden",
  description:
    "A stroll garden: raked gravel rings around a koi pond, a stone lantern, an arched taiko bridge, a clipped pine, karikomi shrubs, a tsukubai basin and a bamboo fence.",
};

type V3 = [number, number, number];

export default function japaneseGarden() {
  const b = createBuilder({ name: "japanese-garden", paintSize: 2048 });
  b.joint("ground", { at: [0, 0, 0] });

  // Paints: raked gravel, stone, moss, pine foliage, bark, planks and bamboo.
  const gravel = paint((p) => {
    const d = Math.hypot(p.x, p.z);
    const ripple = 0.5 + 0.5 * Math.sin((d * 2 * Math.PI) / 0.1);
    return mix("#ebe5d6", "#c9bfa8", ripple * 0.6);
  });
  const stone = mottle("#77786f", "#a4a296", { size: 0.3, seed: 3 });
  const moss = countershade("#7f9a52", "#5d5c55", { level: 0.25, soft: 0.3 });
  const foliage = mottle("#2b4d2c", "#4f7d3f", { size: 0.25, seed: 9 });
  const bark = grain("#5a4030", "#7d5b42", { size: 0.06, axis: "y", seed: 7 });
  const wood = grain("#8b5a35", "#b5814f", { size: 0.05, axis: "y", seed: 2 });
  const bamboo = "#c4b475";
  const water = "#2f6b6e";

  // Ground: a thin slab of raked gravel, top at y = 0.
  b.part(new THREE.BoxGeometry(9, 0.05, 7), gravel, { at: [0, -0.025, 0] });

  // Koi pond with a shallow water disc.
  b.part(new THREE.CylinderGeometry(1.5, 1.5, 0.02, 28), water, { at: [0, 0.01, 0] });
  const koi: Array<[number, number, string, number]> = [
    [0.3, 0.2, "#e0582c", 0.6],
    [-0.5, -0.4, "#f2efe6", 2.1],
    [0.6, -0.6, "#1d1d1d", 4.0],
  ];
  for (const [x, z, color, angle] of koi)
    b.part(new THREE.SphereGeometry(0.12, 8, 5), color, {
      at: [x, 0.012, z],
      scale: [1.7, 0.3, 0.8],
      rotation: [0, (angle * 180) / Math.PI, 0],
    });

  // Stones ringing the pond, jittered deterministically.
  const rand = rng(3);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + (rand() - 0.5) * 0.25;
    const r = 1.5 + (rand() - 0.5) * 0.1;
    const size = 0.13 + rand() * 0.05;
    const sy = 0.55;
    b.part(new THREE.IcosahedronGeometry(size, 0), stone, {
      at: [Math.cos(a) * r, 0.851 * size * sy - 0.02, Math.sin(a) * r],
      scale: [1.3, sy, 1.0],
      rotation: [0, rand() * 360, 0],
    });
  }

  // Arched taiko bridge across the pond, along X: planks on a circular arc, with rails.
  const R = 2.67;
  const cy = -2.04;
  const a0 = 50;
  const a1 = 130;
  const planks = 12;
  for (let i = 0; i < planks; i++) {
    const th = a0 + ((a1 - a0) * (i + 0.5)) / planks;
    const rad = (th * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(0.32, 0.05, 0.9), wood, {
      at: [R * Math.cos(rad), cy + R * Math.sin(rad), 0],
      rotation: [0, 0, th + 90],
    });
    for (const z of [-0.42, 0.42]) {
      b.part(new THREE.BoxGeometry(0.05, 0.2, 0.05), wood, {
        at: [(R + 0.1) * Math.cos(rad), cy + (R + 0.1) * Math.sin(rad), z],
        rotation: [0, 0, th - 90],
      });
    }
  }
  for (const z of [-0.42, 0.42]) {
    // Top rail as a series of short segments following the arc.
    for (let i = 0; i < planks; i++) {
      const th = a0 + ((a1 - a0) * (i + 0.5)) / planks;
      const rad = (th * Math.PI) / 180;
      b.part(new THREE.BoxGeometry(0.3, 0.04, 0.05), wood, {
        at: [(R + 0.2) * Math.cos(rad), cy + (R + 0.2) * Math.sin(rad), z],
        rotation: [0, 0, th + 90],
      });
    }
  }

  // Stepping stones.
  for (const [x, z] of [
    [-3.4, 0.5],
    [-2.9, -0.1],
    [-2.4, 0.4],
    [-1.95, 0.0],
  ])
    b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 8), stone, { at: [x, 0.025, z] });

  // Stone lantern (tōrō) at the right-hand side of the pond.
  const lanternAt = [2.5, 0, -0.9] as const;
  const L = (x: number, y: number, z: number): V3 => [lanternAt[0] + x, y, lanternAt[2] + z];
  b.part(new THREE.BoxGeometry(0.5, 0.08, 0.5), stone, { at: L(0, 0.04, 0) });
  b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.26, 8), stone, { at: L(0, 0.21, 0) });
  b.part(new THREE.CylinderGeometry(0.2, 0.14, 0.06, 8), stone, { at: L(0, 0.36, 0) });
  b.part(new THREE.CylinderGeometry(0.075, 0.1, 0.42, 6), stone, { at: L(0, 0.61, 0) });
  b.part(new THREE.BoxGeometry(0.34, 0.05, 0.34), stone, { at: L(0, 0.845, 0) });
  b.part(new THREE.BoxGeometry(0.22, 0.24, 0.22), "#ffd27a", { at: L(0, 0.985, 0) });
  b.part(new THREE.BoxGeometry(0.3, 0.04, 0.3), stone, { at: L(0, 1.12, 0) });
  b.part(new THREE.ConeGeometry(0.36, 0.2, 4), stone, { at: L(0, 1.24, 0), rotation: [0, 45, 0] });
  b.part(new THREE.ConeGeometry(0.05, 0.14, 6), stone, { at: L(0, 1.38, 0) });

  // Clipped pine (kuromatsu) at the back-left: leaning trunk, cloud pads, one branch.
  const px = -2.9;
  const pz = -2.4;
  b.part(new THREE.CylinderGeometry(0.09, 0.15, 2.0, 7), bark, {
    at: [px + 0.085, 0.97, pz],
    rotation: [0, 0, -10],
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.05, 0.9, 5), bark, {
    at: [px + 0.99, 2.03, pz],
    rotation: [0, 0, -60],
  });
  const pads: Array<[number, number, number, number, number]> = [
    [px + 0.4, 2.2, pz, 0.75, 0.26],
    [px - 0.45, 2.02, pz + 0.25, 0.55, 0.28],
    [px + 1.2, 2.15, pz - 0.1, 0.5, 0.28],
    [px + 0.3, 2.55, pz - 0.05, 0.5, 0.3],
    [px - 0.1, 2.85, pz, 0.32, 0.3],
  ];
  for (const [x, y, z, r, sy] of pads)
    b.part(new THREE.IcosahedronGeometry(r, 1), foliage, {
      at: [x, y, z],
      scale: [1.3, sy, 1.15],
      rotation: [0, 0, 0],
    });

  // Karikomi shrubs: clipped mounds along the back right.
  const mound = (x: number, z: number, r: number, sy: number) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), foliage, {
      at: [x, 0.851 * r * sy - 0.02, z],
      scale: [1.1, sy, 1.0],
    });
  mound(2.9, -2.6, 0.42, 0.9);
  mound(3.5, -2.9, 0.36, 0.85);
  mound(2.35, -2.9, 0.3, 0.8);

  // Rock arrangement with mossy tops, at the front right.
  const rock = (x: number, z: number, r: number, sx: number, sy: number, sz: number, angle: number) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), moss, {
      at: [x, 0.851 * r * sy - 0.02, z],
      scale: [sx, sy, sz],
      rotation: [0, angle, 0],
    });
  rock(1.6, 2.3, 0.55, 1.3, 0.8, 1.0, 20);
  rock(2.25, 2.0, 0.35, 1.0, 0.7, 1.0, 70);
  rock(1.25, 1.55, 0.22, 1.0, 0.6, 1.1, 130);

  // Tsukubai: stone basin with dark water and a bamboo spout.
  b.part(new THREE.CylinderGeometry(0.28, 0.22, 0.24, 8), stone, { at: [-2.4, 0.12, 1.9] });
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 8), "#1f2c30", { at: [-2.4, 0.23, 1.9] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), bamboo, {
    at: [-2.2, 0.25, 1.9],
    rotation: [0, 0, 90],
  });

  // Bamboo fence along the back edge.
  for (let i = 0; i <= 56; i++) {
    const x = -4.2 + i * 0.15;
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 1.4, 6), bamboo, { at: [x, 0.7, -3.3] });
  }
  b.part(new THREE.BoxGeometry(8.5, 0.05, 0.05), bamboo, { at: [0, 0.25, -3.3] });
  b.part(new THREE.BoxGeometry(8.5, 0.05, 0.05), bamboo, { at: [0, 1.1, -3.3] });

  return b.root;
}
