```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { catmull, polyline } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";

export const meta = {
  name: "sleepy-koala",
  description:
    "A drowsy ash-grey koala sitting on a eucalyptus branch, hugging it with one arm while the other lifts a blue-green sprig to its nose.",
};

const FUR = "#9a9ea3";
const FUR_DARK = "#7d8288";
const CREAM = "#efe6d2";
const BLACK = "#1b1b1d";
const CLAW = "#2c2c30";
const IRIS = "#5a3a22";
const BRANCH = "#6b4a2e";
const LEAF = "#3f8a7a";
const LEAF_LIGHT = "#5fae98";
const STEM = "#7f9a5a";

export default function build() {
  const b = createBuilder({ name: "sleepy-koala" });
  const r = rng(7);

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const spine = b.joint("spine", { at: [0, 0.42, 0.04], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.6, 0.08], parent: spine });
  const head = b.joint("head", { at: [0, 0.74, 0.1], parent: neck });

  const shoulderL = b.joint("shoulderL", { at: [0.14, 0.5, 0.06], parent: spine });
  const elbowL = b.joint("elbowL", { at: [0.18, 0.34, 0.2], parent: shoulderL });
  const pawL = b.joint("pawL", { at: [0.1, 0.12, 0.26], parent: elbowL });

  const shoulderR = b.joint("shoulderR", { at: [-0.14, 0.5, 0.06], parent: spine });
  const elbowR = b.joint("elbowR", { at: [-0.2, 0.42, 0.18], parent: shoulderR });
  const handR = b.joint("handR", { at: [-0.14, 0.52, 0.24], parent: elbowR });

  const hipL = b.joint("hipL", { at: [0.12, 0.2, 0.1], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.17, 0.14, 0.22], parent: hipL });
  const footL = b.joint("footL", { at: [0.1, 0.04, 0.3], parent: kneeL });

  const hipR = b.joint("hipR", { at: [-0.12, 0.2, 0.1], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.17, 0.14, 0.22], parent: hipR });
  const footR = b.joint("footR", { at: [-0.1, 0.04, 0.3], parent: kneeR });

  // ---- Eucalyptus branch (prop, lies on the ground) ------------------------
  b.sweep(
    polyline([
      [-0.75, 0.07, 0.05],
      [-0.3, 0.085, 0.03],
      [0.1, 0.09, 0.0],
      [0.45, 0.08, -0.02],
      [0.8, 0.06, -0.06],
    ]),
    0.07,
    { color: BRANCH },
  );

  // ---- Body: sculpted tube from hips up through the spine -----------------
  b.sweep(
    polyline([
      [0, 0.2, -0.02],
      [0, 0.3, -0.02],
      [0, 0.42, 0.02],
      [0, 0.56, 0.06],
    ]),
    0.18,
    { color: FUR },
  );
  // Rounded rump and belly
  b.part(new THREE.SphereGeometry(1, 16, 12), FUR, {
    at: [0, 0.27, -0.03],
    bone: hips,
    scale: [0.22, 0.24, 0.2],
  });
  // Cream chest
  b.part(new THREE.SphereGeometry(1, 16, 12), CREAM, {
    at: [0, 0.4, 0.12],
    bone: spine,
    scale: [0.13, 0.17, 0.08],
  });

  // Neck
  b.sweep(
    polyline([
      [0, 0.56, 0.06],
      [0, 0.64, 0.09],
      [0, 0.7, 0.1],
    ]),
    0.1,
    { color: FUR },
  );

  // ---- Head ----------------------------------------------------------------
  const headC: [number, number, number] = [0, 0.74, 0.1];
  b.part(new THREE.SphereGeometry(0.12, 18, 14), FUR, {
    at: headC,
    bone: head,
    scale: [1, 0.92, 0.95],
  });
  // Cream muzzle
  b.part(new THREE.SphereGeometry(1, 14, 10), CREAM, {
    at: [0, 0.712, 0.19],
    bone: head,
    scale: [0.075, 0.06, 0.06],
  });
  // Big black leathery nose
  b.part(new THREE.SphereGeometry(1, 14, 10), BLACK, {
    at: [0, 0.728, 0.245],
    bone: head,
    scale: [0.05, 0.035, 0.03],
  });

  // Ears: fluffy grey with cream inner lining
  for (const s of [-1, 1]) {
    const ex = 0.1 * s;
    b.part(new THREE.SphereGeometry(1, 14, 10), FUR_DARK, {
      at: [ex, 0.85, 0.06],
      bone: head,
      scale: [0.055, 0.06, 0.02],
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, {
      at: [ex, 0.85, 0.078],
      bone: head,
      scale: [0.038, 0.042, 0.012],
    });
  }

  // Half-closed drowsy eyes: brown iris under heavy grey lids
  for (const s of [-1, 1]) {
    const ex = 0.052 * s;
    b.part(new THREE.SphereGeometry(1, 12, 8), IRIS, {
      at: [ex, 0.752, 0.205],
      bone: head,
      scale: [0.02, 0.016, 0.01],
    });
    b.part(new THREE.SphereGeometry(1, 14, 10), BLACK, {
      at: [ex, 0.772, 0.2],
      bone: head,
      scale: [0.032, 0.02, 0.018],
    });
  }

  // ---- Arms ----------------------------------------------------------------
  // Left arm wraps around the branch
  b.sweep(polyline([[0.14, 0.5, 0.06], [0.18, 0.34, 0.2], [0.1, 0.12, 0.26]]), 0.045, {
    color: FUR,
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), FUR_DARK, {
    at: [0.1, 0.12, 0.27],
    bone: pawL,
    scale: [0.06, 0.05, 0.05],
  });

  // Right arm lifts the sprig up to the mouth
  b.sweep(polyline([[-0.14, 0.5, 0.06], [-0.2, 0.42, 0.18], [-0.14, 0.52, 0.24]]), 0.045, {
    color: FUR,
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), FUR_DARK, {
    at: [-0.14, 0.52, 0.25],
    bone: handR,
    scale: [0.055, 0.055, 0.055],
  });

  // Claws on both paws
  const claw = (base: [number, number, number], dir: [number, number, number]) =>
    b.spike(base, dir, 0.02, 0.004);
  for (const dx of [-0.02, 0, 0.02]) {
    claw([0.1 + dx, 0.12, 0.31], [0, -0.25, 1]);
    claw([-0.14 + dx, 0.52, 0.29], [0, 0.2, 1]);
  }

  // ---- Legs ----------------------------------------------------------------
  for (const s of [-1, 1]) {
    const x = 0.12 * s;
    b.sweep(
      polyline([
        [x, 0.2, 0.1],
        [x * 1.4, 0.14, 0.22],
        [x * 0.85, 0.04, 0.3],
      ]),
      0.055,
      { color: FUR },
    );
    b.part(new THREE.SphereGeometry(1, 14, 10), FUR_DARK, {
      at: [x * 0.85, 0.035, 0.31],
      bone: s > 0 ? footL : footR,
      scale: [0.065, 0.04, 0.07],
    });
    for (const dx of [-0.018, 0, 0.018]) {
      claw([x * 0.85 + dx, 0.03, 0.345], [0, -0.2, 1]);
    }
  }

  // ---- Eucalyptus sprig in the right hand ----------------------------------
  const stemPath = catmull([
    [-0.14, 0.52, 0.24],
    [-0.1, 0.6, 0.265],
    [-0.05, 0.66, 0.25],
  ]);
  b.sweep(stemPath, 0.008, { color: STEM });

  const leafSpots: [number, number, number][] = [
    [-0.13, 0.56, 0.255],
    [-0.1, 0.61, 0.27],
    [-0.075, 0.64, 0.27],
    [-0.055, 0.67, 0.255],
    [-0.09, 0.6, 0.29],
    [-0.06, 0.645, 0.29],
  ];
  leafSpots.forEach((p, i) => {
    const tilt = (i % 2 === 0 ? 1 : -1) * (0.5 + r() * 0.4);
    b.part(new THREE.SphereGeometry(1, 10, 6), i % 2 ? LEAF : LEAF_LIGHT, {
      at: p,
      bone: handR,
      dir: [Math.sin(tilt), 0.6, Math.cos(tilt)],
      scale: [0.012, 0.034, 0.006],
    });
  });

  return b.root;
}
```