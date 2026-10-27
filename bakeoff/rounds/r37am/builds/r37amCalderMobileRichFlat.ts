import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An abstract Alexander Calder-inspired hanging mobile with black wire arms, asymmetrical suspended rods, and bold red, blue, yellow, white, and black geometric forms.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#171717";
  const RED = "#d83b32";
  const BLUE = "#245aa8";
  const YELLOW = "#e7b928";
  const ORANGE = "#dc7130";
  const CREAM = "#f2ead6";
  const WHITE = "#fffdf4";
  const GREEN = "#4b8061";
  const PINK = "#cf6d7c";

  /*
   * The mobile floats in space. Its top hook is at 2.72 m and its lowest
   * geometric pieces are around 0.66 m, leaving the whole sculpture readable
   * as a suspended object rather than a floor-standing prop.
   */

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one hanging root, a central descending spine, and articulated fan-like arms.

  const suspension = b.joint("suspension", {
    at: [0, 2.7, 0],
    dir: [0, -1, 0],
    role: "hinge",
    group: "mobile",
  });

  const stemPath = catmull([
    [0, 2.7, 0],
    [0.015, 2.42, 0],
    [-0.02, 2.1, 0.015],
    [0.02, 1.78, -0.01],
    [0, 1.5, 0],
  ]);
  const stem = b.chain("stem", stemPath, {
    parent: suspension,
    count: 4,
    names: ["stemTop", "stemMid", "stemLow", "stemEnd"],
    role: "spine",
    group: "mobile",
  });

  const leftUpperPath = catmull([
    [0.0, 2.38, 0],
    [0.32, 2.41, 0.018],
    [0.78, 2.28, 0.02],
    [1.08, 2.18, 0],
  ]);
  const leftUpper = b.chain("armLeftUpper", leftUpperPath, {
    parent: stem.joints[0],
    count: 3,
    names: ["armL", "elbowL", "tipL"],
    role: "arm",
    group: "mobile",
  });

  const rightUpperPath = catmull([
    [0.0, 2.12, 0],
    [-0.28, 2.17, -0.02],
    [-0.68, 2.05, 0.01],
    [-1.02, 1.91, 0],
  ]);
  const rightUpper = b.chain("armRightUpper", rightUpperPath, {
    parent: stem.joints[1],
    count: 3,
    names: ["armR", "elbowR", "tipR"],
    role: "arm",
    group: "mobile",
  });

  const leftLowerPath = catmull([
    [0.0, 1.78, 0],
    [0.2, 1.72, 0.03],
    [0.54, 1.58, 0.02],
    [0.78, 1.38, 0],
  ]);
  const leftLower = b.chain("armLeftLower", leftLowerPath, {
    parent: stem.joints[2],
    count: 3,
    names: ["armL2", "elbowL2", "tipL2"],
    role: "arm",
    group: "mobile",
  });

  const rightLowerPath = catmull([
    [0, 1.55, 0],
    [-0.24, 1.49, -0.025],
    [-0.49, 1.34, 0.02],
    [-0.72, 1.19, 0],
  ]);
  const rightLower = b.chain("armRightLower", rightLowerPath, {
    parent: stem.joints[3],
    count: 3,
    names: ["armR2", "elbowR2", "tipR2"],
    role: "arm",
    group: "mobile",
  });

  const centerForkPath = [
    [0, 1.95, 0],
    [0.11, 1.78, 0.05],
    [0.1, 1.57, 0.08],
  ];
  const centerFork = b.chain("centerFork", centerForkPath, {
    parent: stem.joints[1],
    count: 2,
    names: ["fork", "forkTip"],
    role: "fan",
    group: "mobile",
  });

  // Suspended strings are chains too, giving the sculpture natural rig handles.
  const stringBlue = b.chain(
    "stringBlue",
    [
      [1.08, 2.18, 0],
      [1.14, 1.72, 0.04],
      [1.12, 1.3, 0.04],
    ],
    { parent: leftUpper.tip ?? leftUpper.joints[2], count: 2, names: ["stringBlue", "blueDrop"], role: "fan", group: "mobile" },
  );

  const stringRed = b.chain(
    "stringRed",
    [
      [-1.02, 1.91, 0],
      [-1.08, 1.53, -0.03],
      [-1.06, 1.08, -0.03],
    ],
    { parent: rightUpper.tip ?? rightUpper.joints[2], count: 2, names: ["stringRed", "redDrop"], role: "fan", group: "mobile" },
  );

  const stringYellow = b.chain(
    "stringYellow",
    [
      [0.78, 1.38, 0],
      [0.9, 1.08, 0.03],
      [0.87, 0.78, 0.03],
    ],
    { parent: leftLower.tip ?? leftLower.joints[2], count: 2, names: ["stringYellow", "yellowDrop"], role: "fan", group: "mobile" },
  );

  const stringWhite = b.chain(
    "stringWhite",
    [
      [-0.72, 1.19, 0],
      [-0.56, 0.92, 0.02],
      [-0.57, 0.66, 0.02],
    ],
    { parent: rightLower.tip ?? rightLower.joints[2], count: 2, names: ["stringWhite", "whiteDrop"], role: "fan", group: "mobile" },
  );

  const stringCenter = b.chain(
    "stringCenter",
    [
      [0.1, 1.57, 0.08],
      [0.08, 1.22, 0.08],
      [0.08, 0.91, 0.08],
    ],
    { parent: centerFork.tip ?? centerFork.joints[1], count: 2, names: ["stringCenter", "centerDrop"], role: "fan", group: "mobile" },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Small construction helpers.

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius = 0.014,
    color = BLACK,
    bone?: any,
  ) => b.rod(a, c, radius, { color, bone, caps: "flat", section: { ngon: 6 } });

  const bead = (at: any, radius: number, color: string, bone?: any) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      bone,
      flat: true,
      name: "wire-bead",
      group: "mobile",
    });

  const disk = (
    at: any,
    radius: number,
    thickness: number,
    color: string,
    dir: [number, number, number] = [0, 0, 1],
    bone?: any,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, thickness, 16, 1), color, {
      at,
      bone,
      dir,
      flat: true,
      name: "colored-disc",
      group: "forms",
    });

  const smallDisc = (
    at: any,
    radius: number,
    color: string,
    dir: [number, number, number] = [0, 0, 1],
    bone?: any,
  ) => disk(at, radius, 0.018, color, dir, bone);

  const polygon = (
    at: any,
    outline: [number, number, "sharp"][] | [number, number][],
    color: string,
    x: [number, number, number] = [1, 0, 0],
    thickness = 0.018,
    bone?: any,
  ) =>
    b.extrude(outline, {
      at,
      x,
      y: [0, 1, 0],
      thickness,
      bevel: 0.003,
      smoothing: 0,
      color,
      bone,
      group: "forms",
    });

  const diamond = (at: any, w: number, h: number, color: string, x?: [number, number, number], bone?: any) =>
    polygon(
      at,
      [
        [0, h * 0.5, "sharp"],
        [w * 0.5, 0, "sharp"],
        [0, -h * 0.5, "sharp"],
        [-w * 0.5, 0, "sharp"],
      ],
      color,
      x ?? [1, 0, 0],
      0.02,
      bone,
    );

  const triangle = (at: any, w: number, h: number, color: string, x?: [number, number, number], bone?: any) =>
    polygon(
      at,
      [
        [0, h * 0.5, "sharp"],
        [w * 0.5, -h * 0.5, "sharp"],
        [-w * 0.5, -h * 0.5, "sharp"],
      ],
      color,
      x ?? [1, 0, 0],
      0.02,
      bone,
    );

  const bar = (
    at: any,
    size: [number, number, number],
    color: string,
    bone?: any,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      flat: true,
      group: "forms",
      name: "flat-bar",
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Central suspension hardware.

  b.part(new THREE.TorusGeometry(0.085, 0.014, 6, 12), BLACK, {
    bone: suspension,
    at: [0, 2.76, 0],
    dir: [0, 1, 0],
    flat: true,
    group: "hardware",
    name: "hanging-loop",
  });

  rod([0, 2.7, 0], [0, 2.78, 0], 0.018, BLACK, suspension);
  b.sweep(stem, 0.025, {
    color: BLACK,
    section: { ngon: 6 },
    caps: "flat",
    skin: "rigid",
    group: "hardware",
    name: "central-wire",
  });

  // A tiny brass-colored pivot bead at the top makes the otherwise black construction legible.
  bead([0, 2.67, 0], 0.045, YELLOW, suspension);

  // ---------------------------------------------------------------------------------------------------------------
  // Calder-like wire arms. The dark rods remain visible between the colored forms.

  b.sweep(leftUpper, 0.018, {
    color: BLACK,
    section: { ngon: 6 },
    caps: "flat",
    skin: "rigid",
    group: "hardware",
    name: "left-upper-wire",
  });
  b.sweep(rightUpper, 0.018, {
    color: BLACK,
    section: { ngon: 6 },
    caps: "flat",
    skin: "rigid",
    group: "hardware",
    name: "right-upper-wire",
  });
  b.sweep(leftLower, 0.017, {
    color: BLACK,
    section: { ngon: 6 },
    caps: "flat",
    skin: "rigid",
    group: "hardware",
    name: "left-lower-wire",
  });
  b.sweep(rightLower, 0.017, {
    color: BLACK,
    section: { ngon: 6 },
    caps: "flat",
    skin: "rigid",
    group: "hardware",
    name: "right-lower-wire",
  });
  b.sweep(centerFork, 0.014, {
    color: BLACK,
    section: { ngon: 6 },
    caps: "flat",
    skin: "rigid",
    group: "hardware",
    name: "center-fork-wire",
  });

  for (const p of [
    leftUpper.at(0),
    leftUpper.at(0.5),
    leftUpper.at(1),
    rightUpper.at(0),
    rightUpper.at(0.5),
    rightUpper.at(1),
    leftLower.at(0),
    leftLower.at(0.5),
    leftLower.at(1),
    rightLower.at(0),
    rightLower.at(0.5),
    rightLower.at(1),
  ]) {
    bead(p, 0.025, BLACK);
  }

  // Decorative pivot collars: stacked thin discs around selected joints.
  smallDisc(leftUpper.at(0.48), 0.055, RED, [0, 1, 0], leftUpper.joints[1]);
  smallDisc(rightUpper.at(0.5), 0.05, YELLOW, [0, 1, 0], rightUpper.joints[1]);
  smallDisc(leftLower.at(0.5), 0.045, BLUE, [0, 1, 0], leftLower.joints[1]);
  smallDisc(rightLower.at(0.5), 0.045, ORANGE, [0, 1, 0], rightLower.joints[1]);

  // ---------------------------------------------------------------------------------------------------------------
  // Strings and their subtle knots.

  b.sweep(stringBlue, 0.008, {
    color: BLACK,
    section: { ngon: 5 },
    caps: "flat",
    skin: "rigid",
    group: "strings",
    name: "blue-string",
  });
  b.sweep(stringRed, 0.008, {
    color: BLACK,
    section: { ngon: 5 },
    caps: "flat",
    skin: "rigid",
    group: "strings",
    name: "red-string",
  });
  b.sweep(stringYellow, 0.008, {
    color: BLACK,
    section: { ngon: 5 },
    caps: "flat",
    skin: "rigid",
    group: "strings",
    name: "yellow-string",
  });
  b.sweep(stringWhite, 0.008, {
    color: BLACK,
    section: { ngon: 5 },
    caps: "flat",
    skin: "rigid",
    group: "strings",
    name: "white-string",
  });
  b.sweep(stringCenter, 0.008, {
    color: BLACK,
    section: { ngon: 5 },
    caps: "flat",
    skin: "rigid",
    group: "strings",
    name: "center-string",
  });

  for (const [p, c] of [
    [stringBlue.at(0.5), BLUE],
    [stringRed.at(0.5), RED],
    [stringYellow.at(0.5), YELLOW],
    [stringWhite.at(0.5), WHITE],
    [stringCenter.at(0.5), GREEN],
  ] as const) {
    bead(p, 0.022, c);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Large suspended shapes. Their different planes and scale give the mobile its
  // silhouette when viewed from the front, side, or above.

  // Left upper: a blue vertical disc with a little yellow counterweight.
  disk(stringBlue.at(1), 0.16, 0.022, BLUE, [0.18, 0.1, 1], stringBlue.joints[1]);
  smallDisc(stringBlue.at(0.86), 0.052, YELLOW, [1, 0.1, 0.15], stringBlue.joints[1]);
  rod(stringBlue.at(0.79), stringBlue.at(0.91), 0.009, BLACK, stringBlue.joints[1]);

  // Right upper: a red diamond, deliberately offset from the wire.
  diamond(
    stringRed.at(1),
    0.38,
    0.48,
    RED,
    [0.1, 0, 0.995],
    stringRed.joints[1],
  );
  smallDisc(stringRed.at(1).clone().add(new THREE.Vector3(0.12, 0.02, 0.015)), 0.045, CREAM, [0, 0, 1], stringRed.joints[1]);

  // Left lower: a broad yellow triangular pennant with a red spot.
  triangle(
    stringYellow.at(1),
    0.5,
    0.5,
    YELLOW,
    [0.98, 0.05, 0.12],
    stringYellow.joints[1],
  );
  smallDisc(
    stringYellow.at(1).clone().add(new THREE.Vector3(-0.04, 0.04, 0.02)),
    0.09,
    RED,
    [0.98, 0.05, 0.12],
    stringYellow.joints[1],
  );

  // Right lower: a cream crescent-like composition built from an off-center disk and a dark overlay.
  const whiteAt = stringWhite.at(1);
  disk(whiteAt, 0.22, 0.022, CREAM, [0.98, 0.02, 0.08], stringWhite.joints[1]);
  disk(
    whiteAt.clone().add(new THREE.Vector3(0.075, 0.015, 0.022)),
    0.18,
    0.026,
    BLACK,
    [0.98, 0.02, 0.08],
    stringWhite.joints[1],
  );
  smallDisc(
    whiteAt.clone().add(new THREE.Vector3(-0.075, 0.05, 0.03)),
    0.045,
    ORANGE,
    [0.98, 0.02, 0.08],
    stringWhite.joints[1],
  );

  // Center drop: green oval, formed as a thick low-poly vertical plate.
  disk(stringCenter.at(1), 0.145, 0.026, GREEN, [0.08, 0, 1], stringCenter.joints[1]);
  bar(
    stringCenter.at(1).clone().add(new THREE.Vector3(0.0, -0.03, 0.02)),
    [0.025, 0.2, 0.03],
    BLACK,
    stringCenter.joints[1],
    [0.05, 0.12, -0.04],
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Extra Calder-style counterweights at the arm ends. These are not all hanging
  // straight down, so the object feels balanced by visual rhythm rather than symmetry.

  const leftEnd = leftUpper.at(1);
  disk(leftEnd.clone().add(new THREE.Vector3(0.02, 0.02, 0)), 0.1, 0.02, ORANGE, [0.2, 0.9, 0.28], leftUpper.joints[2]);
  diamond(leftEnd.clone().add(new THREE.Vector3(-0.08, -0.02, 0.03)), 0.18, 0.22, WHITE, [1, 0, 0], leftUpper.joints[2]);

  const rightEnd = rightUpper.at(1);
  triangle(rightEnd.clone().add(new THREE.Vector3(-0.04, -0.03, 0)), 0.23, 0.28, BLUE, [0.08, 0.05, 1], rightUpper.joints[2]);
  smallDisc(rightEnd.clone().add(new THREE.Vector3(0.1, 0.04, 0.025)), 0.055, YELLOW, [0, 0, 1], rightUpper.joints[2]);

  const leftLowerEnd = leftLower.at(1);
  polygon(
    leftLowerEnd.clone().add(new THREE.Vector3(0.02, -0.02, 0.02)),
    [
      [-0.13, 0.1, "sharp"],
      [0.11, 0.15, "sharp"],
      [0.16, -0.1, "sharp"],
      [-0.08, -0.2, "sharp"],
    ],
    PINK,
    [0.85, 0.1, 0.5],
    0.02,
    leftLower.joints[2],
  );

  const rightLowerEnd = rightLower.at(1);
  disk(rightLowerEnd.clone().add(new THREE.Vector3(-0.05, 0.01, 0.02)), 0.12, 0.02, WHITE, [0.2, 0.3, 0.93], rightLower.joints[2]);
  diamond(rightLowerEnd.clone().add(new THREE.Vector3(0.08, -0.08, 0.03)), 0.16, 0.18, RED, [1, 0, 0], rightLower.joints[2]);

  // ---------------------------------------------------------------------------------------------------------------
  // A small central abstract "sun" at the fork, plus two thin crossing balance bars.

  const forkAt = centerFork.at(0.9);
  disk(forkAt, 0.115, 0.03, YELLOW, [0, 1, 0], centerFork.joints[1]);
  rod(
    forkAt.clone().add(new THREE.Vector3(-0.28, 0.03, 0)),
    forkAt.clone().add(new THREE.Vector3(0.28, 0.03, 0)),
    0.012,
    BLACK,
    centerFork.joints[1],
  );
  rod(
    forkAt.clone().add(new THREE.Vector3(0, 0.03, -0.22)),
    forkAt.clone().add(new THREE.Vector3(0, 0.03, 0.22)),
    0.01,
    BLACK,
    centerFork.joints[1],
  );
  smallDisc(forkAt.clone().add(new THREE.Vector3(0, 0.055, 0)), 0.035, RED, [0, 1, 0], centerFork.joints[1]);

  // Two short black pins emphasize the mechanical, hand-balanced construction.
  rod([0.02, 2.41, 0], [0.18, 2.5, 0.01], 0.01, BLACK, stem.joints[0]);
  rod([-0.02, 2.1, 0], [-0.2, 2.0, -0.015], 0.01, BLACK, stem.joints[1]);

  // A few colored low-poly beads at the most important pivots.
  bead([0.32, 2.4, 0.02], 0.035, RED, leftUpper.joints[1]);
  bead([-0.3, 2.16, -0.02], 0.035, BLUE, rightUpper.joints[1]);
  bead([0.2, 1.72, 0.03], 0.032, YELLOW, leftLower.joints[1]);
  bead([-0.24, 1.48, -0.02], 0.032, ORANGE, rightLower.joints[1]);

  return b.root;
}
