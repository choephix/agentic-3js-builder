```ts
import * as THREE from "three";
import { createBuilder, grain, spiral } from "agentic-3js-builder";

export const meta = {
  name: "Clockwork terrier",
  description:
    "A wind-up terrier in polished brass and copper: riveted plates, gears in the chest, a winding key, springy legs, leather ears, green glass eyes, a coil-spring tail and a red collar with a brass tag.",
};

const BRASS = grain("#f2d27a", "#8f6a1c", { size: 0.035, axis: "z", seed: 3 });
const COPPER = grain("#eaa171", "#7e3f1c", { size: 0.03, axis: "z", seed: 7 });
const LEATHER = "#4a2a18";
const RED = "#a3161c";
const LENS = "#7fe6b4";
const DARK = "#1c1c1c";

// Ear outline in the ear's own plane: x runs forward (+Z), y up. It droops below the attachment point.
const EAR: [number, number][] = [
  [-0.012, 0.0],
  [0.018, 0.004],
  [0.03, -0.02],
  [0.032, -0.07],
  [0.02, -0.11],
  [0.0, -0.115],
  [-0.012, -0.08],
  [-0.02, -0.03],
];

/** A chest gear: a copper disc, a brass rim, teeth around it and a hub, all facing +Z. */
function gear(
  b: ReturnType<typeof createBuilder>,
  x: number,
  y: number,
  z: number,
  r: number,
  teeth: number,
  phase: number,
  bone: THREE.Object3D | any,
) {
  b.part(new THREE.CylinderGeometry(r, r, 0.008, 14), COPPER, { at: [x, y, z], bone, rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(r + 0.004, 0.0028, 6, 18), BRASS, { at: [x, y, z + 0.003], bone });
  for (let i = 0; i < teeth; i++) {
    const a = phase + (i / teeth) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.006, 0.007, 0.008), BRASS, {
      at: [x + Math.cos(a) * (r + 0.003), y + Math.sin(a) * (r + 0.003), z],
      bone,
      // Euler Z turns the box's +Y (its radial side) onto the tooth's outward direction.
      rotation: [0, 0, (a * 180) / Math.PI - 90],
    });
  }
  b.part(new THREE.SphereGeometry(0.004, 6, 4), BRASS, { at: [x, y, z + 0.005], bone });
}

export default function clockworkTerrier() {
  const b = createBuilder({ name: "clockwork terrier", detail: 1, paintSize: 1024 });

  // Skeleton: hips at the back, chest, neck, head, lower jaw.
  const hips = b.joint("hips", { at: [0, 0.2, -0.12], dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.22, 0.06], dir: [0, 0.15, 1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.25, 0.15], dir: [0, 0.5, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.31, 0.2], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.282, 0.24], dir: [0, 0, 1], role: "jaw" });

  // Body: a brass box with copper top and side plates.
  b.part(new THREE.BoxGeometry(0.13, 0.1, 0.25), BRASS, { at: [0, 0.22, 0], bone: chest });
  b.part(new THREE.BoxGeometry(0.112, 0.008, 0.2), COPPER, { at: [0, 0.274, 0], bone: chest });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.008, 0.086, 0.2), COPPER, { at: [s * 0.069, 0.22, 0], bone: chest });

  // Rivets along the plate edges.
  for (const z of [-0.09, -0.06, -0.03, 0, 0.03, 0.06, 0.09])
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.0034, 6, 4), BRASS, { at: [s * 0.052, 0.28, z], bone: chest });
  for (const z of [-0.08, -0.04, 0, 0.04, 0.08])
    for (const y of [0.19, 0.25])
      for (const s of [1, -1])
        b.part(new THREE.SphereGeometry(0.0034, 6, 4), BRASS, { at: [s * 0.0735, y, z], bone: chest });

  // Chest: two visible gears on the front plate, one with a brass bezel.
  gear(b, -0.02, 0.225, 0.128, 0.02, 10, 0.2, chest);
  gear(b, 0.025, 0.2, 0.128, 0.014, 8, 0.5, chest);

  // Winding key on the back: a shaft, a flat ring handle and a little cross bit.
  b.rod([0, 0.276, -0.05], [0, 0.33, -0.05], 0.007, { color: BRASS, bone: hips });
  b.part(new THREE.TorusGeometry(0.024, 0.007, 8, 18), BRASS, {
    at: [0, 0.335, -0.05],
    rotation: [90, 0, 0],
    bone: hips,
  });
  b.part(new THREE.BoxGeometry(0.03, 0.006, 0.01), BRASS, { at: [0, 0.332, -0.05], bone: hips });

  // Tail: a coil spring rising from the rear.
  const coil = spiral([0, 0.23, -0.14], [0.018, 0.23, -0.14], [0, 1, 0], { turns: 4, pitch: 0.018 });
  b.sweep(coil, 0.0065, { color: COPPER, bone: hips, sides: 6, name: "tailSpring" });

  // Legs: springy two-span chains, each with a brass tube and a copper paw.
  const legs = [
    { s: "L", x: 0.05, hip: chest, pts: [[0.05, 0.2, 0.08], [0.05, 0.11, 0.1], [0.05, 0.02, 0.11]] },
    { s: "R", x: -0.05, hip: chest, pts: [[-0.05, 0.2, 0.08], [-0.05, 0.11, 0.1], [-0.05, 0.02, 0.11]] },
    { s: "L", x: 0.05, hip: hips, pts: [[0.05, 0.2, -0.1], [0.05, 0.11, -0.06], [0.05, 0.02, -0.11]] },
    { s: "R", x: -0.05, hip: hips, pts: [[-0.05, 0.2, -0.1], [-0.05, 0.11, -0.06], [-0.05, 0.02, -0.11]] },
  ];
  legs.forEach((leg, i) => {
    const front = i < 2 ? "front" : "hind";
    const chain = b.chain(`${front}${leg.s}`, leg.pts, {
      names: [`shoulder${leg.s}${i}`, `elbow${leg.s}${i}`, `paw${leg.s}${i}`],
      parent: leg.hip,
      role: "leg",
    });
    b.sweep(chain, 0.016, { color: BRASS });
    const paw = chain.joints[2];
    b.part(new THREE.BoxGeometry(0.04, 0.02, 0.055), COPPER, {
      at: [leg.x, 0.01, leg.pts[2][2] + 0.01],
      bone: paw,
    });
  });

  // Neck and head.
  b.rod(neck, head, 0.024, { color: COPPER, bone: neck });
  b.part(new THREE.BoxGeometry(0.07, 0.07, 0.09), COPPER, { at: [0, 0.31, 0.2], bone: head });
  b.part(new THREE.BoxGeometry(0.04, 0.034, 0.07), COPPER, { at: [0, 0.296, 0.27], bone: head });
  b.part(new THREE.BoxGeometry(0.036, 0.016, 0.07), BRASS, { at: [0, 0.276, 0.265], bone: jaw });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), DARK, { at: [0, 0.302, 0.31], bone: head });

  // Glass-lens eyes with a brass bezel.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 12, 8), LENS, { at: [s * 0.03, 0.335, 0.238], bone: head });
    b.part(new THREE.TorusGeometry(0.018, 0.0045, 8, 16), BRASS, { at: [s * 0.03, 0.335, 0.246], bone: head });
  }

  // Floppy leather ears, hanging from the sides of the skull.
  for (const s of [1, -1])
    b.extrude(EAR, {
      color: LEATHER,
      at: [s * 0.037, 0.345, 0.19],
      thickness: 0.006,
      bevel: 0.002,
      bone: head,
      name: s > 0 ? "earL" : "earR",
    });

  // Red collar with a brass tag.
  b.part(new THREE.TorusGeometry(0.046, 0.008, 8, 20), RED, {
    at: [0, 0.25, 0.15],
    rotation: [90, 0, 0],
    bone: neck,
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.003, 14), BRASS, {
    at: [0, 0.225, 0.199],
    rotation: [90, 0, 0],
    bone: neck,
  });

  return b.root;
}
```