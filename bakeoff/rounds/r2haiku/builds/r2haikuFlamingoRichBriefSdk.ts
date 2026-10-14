import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description: "A tall candy-pink flamingo standing in shallow water, with coral wings, black tips, an S-curved neck and a bent two-tone beak.",
};

const PINK = "#f7a8c9";
const CORAL = "#ef6b57";
const BLACK = "#1c1b22";
const BEAK = "#f8cfdc";
const ROSE = "#e2567f";
const EYE = "#f3ee9c";
const WATER = "#7fd3e0";

function sphere(r: number, w = 14, h = 10) {
  return new THREE.SphereGeometry(r, w, h);
}

function toe(angle: number, len: number, r: number) {
  const g = new THREE.CylinderGeometry(r, r, len, 6);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, len / 2);
  g.rotateY(angle);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // Skeleton: body root, then legs and head
  const hips = b.joint("hips", { at: [0, 0.92, 0] });
  const head = b.joint("head", { at: [0, 1.62, 0.36], parent: hips });

  // Neck: S-curve, built as a chain so it bends with the rig
  const neckPts: number[][] = [
    [0, 1.08, 0.14],
    [0, 1.22, 0.24],
    [0.06, 1.36, 0.27],
    [-0.04, 1.5, 0.3],
    [0, 1.62, 0.36],
  ];
  const neck = b.chain("neck", neckPts, { role: "neck" });
  b.sweep(neck, 0.055, { color: PINK });

  // Body: egg-shaped mass plus tail
  b.part(sphere(1), PINK, { at: [0, 0.98, -0.02], bone: hips, scale: [0.26, 0.22, 0.4] });
  b.part(sphere(1, 12, 8), PINK, { at: [0, 0.95, -0.38], bone: hips, scale: [0.14, 0.1, 0.14] });
  b.part(sphere(1, 12, 8), CORAL, { at: [0, 0.99, -0.3], bone: hips, scale: [0.16, 0.12, 0.12] });

  // Head
  b.part(sphere(1), PINK, { at: [0, 1.62, 0.36], bone: head, scale: [0.1, 0.1, 0.12] });

  // Beak: upper mandible pale pink with black tip, lower mandible black-tipped
  const upperPts: number[][] = [
    [0, 1.64, 0.42],
    [0, 1.62, 0.56],
    [0, 1.56, 0.66],
    [0, 1.5, 0.7],
  ];
  b.sweep(upperPts, 0.034, { color: BEAK });
  b.sweep(
    [
      [0, 1.56, 0.66],
      [0, 1.5, 0.7],
    ],
    0.036,
    { color: BLACK },
  );
  const lowerPts: number[][] = [
    [0, 1.6, 0.42],
    [0, 1.58, 0.54],
    [0, 1.54, 0.62],
    [0, 1.5, 0.68],
  ];
  b.sweep(lowerPts, 0.024, { color: BEAK });
  b.sweep(
    [
      [0, 1.54, 0.62],
      [0, 1.5, 0.68],
    ],
    0.026,
    { color: BLACK },
  );

  // Eyes: pale yellow with a dark pupil
  for (const s of [-1, 1]) {
    const x = 0.055 * s;
    b.part(sphere(1, 12, 8), EYE, { at: [x, 1.66, 0.4], bone: head, scale: [0.022, 0.022, 0.022] });
    b.part(sphere(1, 8, 6), BLACK, { at: [x * 1.1, 1.66, 0.42], bone: head, scale: [0.011, 0.011, 0.011] });
  }

  // Wings: folded coral coverts with black flight-feather tips
  for (const s of [-1, 1]) {
    const x = 0.14 * s;
    b.part(sphere(1), CORAL, { at: [x, 1.0, -0.08], bone: hips, scale: [0.1, 0.12, 0.3] });
    b.part(sphere(1), CORAL, { at: [x * 0.95, 0.96, -0.26], bone: hips, scale: [0.08, 0.08, 0.16] });
    b.part(sphere(1, 10, 6), BLACK, { at: [x * 0.9, 0.94, -0.38], bone: hips, scale: [0.05, 0.03, 0.12] });
  }

  // Legs: thigh, knobbly knee, shin, webbed foot, each side
  for (const s of [-1, 1]) {
    const side = s === 1 ? "L" : "R";
    const x = 0.1 * s;
    const hip = b.joint(`hip${side}`, { at: [x, 0.9, 0], parent: hips });
    const knee = b.joint(`knee${side}`, { at: [x, 0.56, 0.05], parent: hip });
    const ankle = b.joint(`ankle${side}`, { at: [x, 0.12, -0.03], parent: knee });

    b.sweep(
      [
        [x, 0.92, 0],
        [x, 0.56, 0.05],
        [x, 0.12, -0.03],
      ],
      0.018,
      { color: ROSE },
    );
    // knobbly knee
    b.part(sphere(1, 10, 8), ROSE, { at: [x, 0.56, 0.05], bone: knee, scale: [0.03, 0.03, 0.03] });
    // ankle
    b.part(sphere(1, 8, 6), ROSE, { at: [x, 0.12, -0.03], bone: ankle, scale: [0.014, 0.014, 0.014] });

    // webbed foot: flat fan plus three forward toes
    b.part(sphere(1, 12, 6), ROSE, {
      at: [x, 0.015, 0.06],
      bone: ankle,
      scale: [0.085, 0.008, 0.085],
    });
    for (const a of [-0.55, 0, 0.55]) {
      b.part(toe(a * s, 0.1, 0.008), ROSE, { at: [x, 0.01, 0.0], bone: ankle });
    }
  }

  // Shallow water disc for the standing pose
  b.part(new THREE.CylinderGeometry(0.9, 0.9, 0.02, 24), WATER, {
    at: [0, -0.01, 0],
    bone: hips,
  });

  return b.root;
}
