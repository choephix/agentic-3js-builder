import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An abstract Alexander Calder-inspired hanging mobile of balanced black wire, bright primary plates, disks, and suspended forms.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#171717";
  const RED = "#d9362b";
  const YELLOW = "#f2c230";
  const BLUE = "#1769a8";
  const ORANGE = "#e87528";
  const PINK = "#d85a86";
  const WHITE = "#e8e2d4";
  const GREEN = "#4d9670";

  const root = b.joint("mobileRoot", {
    at: [0, 2.48, 0],
    dir: [0, -1, 0],
    role: "spine",
    group: "suspension",
  });

  const top = b.joint("topHinge", {
    parent: root,
    at: [0, 2.34, 0],
    dir: [0, -1, 0],
    role: "hinge",
    group: "suspension",
  });

  // Suspension cord and a small black hanging hook.
  b.rod([0, 2.58, 0], [0, 2.48, 0], 0.012, {
    color: BLACK,
    bone: root,
    caps: "round",
    name: "ceilingCord",
  });
  b.part(new THREE.SphereGeometry(0.035, 8, 5), BLACK, {
    bone: root,
    at: [0, 2.48, 0],
    name: "topKnot",
  });

  // A broad, slightly bowed upper arm.
  const upperArm = catmull([
    [-0.02, 2.35, 0],
    [0.28, 2.32, 0.01],
    [0.65, 2.25, 0.02],
    [1.03, 2.18, 0],
  ]);
  b.sweep(upperArm, 0.014, {
    color: BLACK,
    bone: top,
    caps: "round",
    name: "upperArm",
  });

  b.part(new THREE.SphereGeometry(0.026, 8, 5), BLACK, {
    bone: top,
    at: [0.65, 2.25, 0.02],
    name: "upperPivot",
  });

  // Left counter-arm, deliberately shorter and more vertical.
  const leftArm = catmull([
    [-0.02, 2.35, 0],
    [-0.34, 2.29, -0.015],
    [-0.62, 2.14, 0],
    [-0.82, 1.97, 0.01],
  ]);
  b.sweep(leftArm, 0.013, {
    color: BLACK,
    bone: top,
    caps: "round",
    name: "leftArm",
  });

  // A small red disk at the left arm tip.
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.026, 12), RED, {
    bone: top,
    at: [-0.82, 1.94, 0.01],
    dir: [0, 1, 0],
    name: "redDisk",
  });
  b.part(new THREE.SphereGeometry(0.025, 8, 5), BLACK, {
    bone: top,
    at: [-0.82, 1.98, 0.01],
    name: "leftEndPivot",
  });

  // Long thread from the left disk to a yellow vertical blade.
  b.rod([-0.82, 1.92, 0.01], [-0.82, 1.38, 0.01], 0.007, {
    color: BLACK,
    bone: top,
    caps: "round",
    name: "leftThread",
  });

  b.extrude(
    [
      [-0.19, -0.12],
      [0.08, -0.17],
      [0.22, 0.02],
      [0.16, 0.25],
      [-0.13, 0.19],
      [-0.25, 0.02],
    ],
    {
      at: [-0.82, 1.25, 0.01],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.008,
      color: YELLOW,
      bone: top,
      name: "yellowLeaf",
    },
  );

  // Right end of the upper arm: a dangling blue crescent-like plate.
  b.rod([1.03, 2.17, 0], [1.03, 1.72, 0], 0.007, {
    color: BLACK,
    bone: top,
    caps: "round",
    name: "rightThread",
  });
  b.extrude(
    [
      [-0.23, 0.02],
      [-0.11, -0.18],
      [0.13, -0.22],
      [0.25, -0.04],
      [0.18, 0.2],
      [-0.04, 0.29],
      [-0.2, 0.19],
    ],
    {
      at: [1.03, 1.53, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.006,
      color: BLUE,
      bone: top,
      name: "bluePetal",
    },
  );

  // Lower mobile bar, hung from the far right of the upper bar.
  const lowerHanger = b.joint("lowerHanger", {
    parent: top,
    at: [0.65, 2.25, 0.02],
    dir: [0, -1, 0],
    role: "hinge",
    group: "lowerMobile",
  });

  b.rod([0.65, 2.25, 0.02], [0.65, 2.0, 0.02], 0.009, {
    color: BLACK,
    bone: lowerHanger,
    caps: "round",
    name: "centralString",
  });

  const lowerArm = catmull([
    [0.65, 1.99, 0.02],
    [0.31, 1.96, 0.01],
    [-0.05, 1.9, 0],
    [-0.42, 1.82, -0.02],
  ]);
  b.sweep(lowerArm, 0.014, {
    color: BLACK,
    bone: lowerHanger,
    caps: "round",
    name: "lowerArm",
  });

  // Large orange vertical plate hanging from the left of the lower bar.
  b.rod([-0.42, 1.82, -0.02], [-0.42, 1.49, -0.02], 0.007, {
    color: BLACK,
    bone: lowerHanger,
    caps: "round",
    name: "orangeCord",
  });
  b.extrude(
    [
      [-0.2, -0.19],
      [0.04, -0.25],
      [0.23, -0.02],
      [0.16, 0.27],
      [-0.08, 0.34],
      [-0.25, 0.1],
    ],
    {
      at: [-0.42, 1.25, -0.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      color: ORANGE,
      bone: lowerHanger,
      name: "orangeBlade",
    },
  );

  // Center blue and white disks give the composition a quiet focal point.
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.032, 14), WHITE, {
    bone: lowerHanger,
    at: [0.22, 1.92, 0.02],
    dir: [0, 1, 0],
    name: "whiteBalanceDisk",
  });
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.04, 12), BLUE, {
    bone: lowerHanger,
    at: [0.22, 1.95, 0.02],
    dir: [0, 1, 0],
    name: "blueHub",
  });

  // A thin line from the center disk to a hanging green form.
  b.rod([0.22, 1.88, 0.02], [0.22, 1.19, 0.02], 0.006, {
    color: BLACK,
    bone: lowerHanger,
    caps: "round",
    name: "centerThread",
  });
  b.extrude(
    [
      [-0.24, 0],
      [-0.1, -0.16],
      [0.12, -0.21],
      [0.25, -0.06],
      [0.2, 0.18],
      [0, 0.3],
      [-0.19, 0.2],
    ],
    {
      at: [0.22, 0.94, 0.02],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: GREEN,
      bone: lowerHanger,
      name: "greenLeaf",
    },
  );

  // Far end of the lower bar: pink disk and a tiny offset black bead.
  b.rod([-0.05, 1.9, 0], [-0.05, 1.56, 0], 0.006, {
    color: BLACK,
    bone: lowerHanger,
    caps: "round",
    name: "pinkThread",
  });
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.025, 12), PINK, {
    bone: lowerHanger,
    at: [-0.05, 1.47, 0],
    dir: [0, 1, 0],
    name: "pinkDisk",
  });
  b.part(new THREE.SphereGeometry(0.035, 8, 5), BLACK, {
    bone: lowerHanger,
    at: [0.1, 1.42, 0.04],
    name: "pinkCounterweight",
  });

  // A final small branch hangs behind the lower arm, adding depth without clutter.
  const rearBranch = catmull([
    [0.3, 1.96, -0.06],
    [0.52, 1.76, -0.1],
    [0.68, 1.55, -0.08],
  ]);
  b.sweep(rearBranch, 0.01, {
    color: BLACK,
    bone: lowerHanger,
    caps: "round",
    name: "rearBranch",
  });
  b.rod([0.68, 1.55, -0.08], [0.68, 1.22, -0.08], 0.006, {
    color: BLACK,
    bone: lowerHanger,
    caps: "round",
    name: "rearThread",
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.024, 10), RED, {
    bone: lowerHanger,
    at: [0.68, 1.15, -0.08],
    dir: [0, 1, 0],
    name: "rearRedDisk",
  });

  // Small brass-like visual pivots, kept flat black in the Calder wire language.
  for (const p of [
    [0.31, 1.96, 0.01],
    [-0.05, 1.9, 0],
    [0.68, 1.55, -0.08],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.022, 8, 5), BLACK, {
      bone: lowerHanger,
      at: p,
      name: "pivot",
    });
  }

  return b.root;
}
