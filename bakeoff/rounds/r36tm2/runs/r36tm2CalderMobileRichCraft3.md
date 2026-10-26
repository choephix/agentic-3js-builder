```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An asymmetrical Alexander Calder-inspired hanging mobile with black wire arms, counterweights, and colorful floating biomorphic plates.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#171719";
  const RED = "#d92d2f";
  const BLUE = "#2368b1";
  const YELLOW = "#f2c52f";
  const ORANGE = "#e56b2f";
  const WHITE = "#e8e4d7";
  const GREEN = "#5b9d68";
  const PURPLE = "#764b9b";

  // The suspension point is the single root of the small rig.
  const suspension = b.joint("suspension", {
    at: [0, 2.82, 0],
    dir: [0, -1, 0],
    role: "spine",
  });

  const upperPivot = b.joint("upperPivot", {
    parent: suspension,
    at: [0, 2.54, 0],
    dir: [0, -1, 0],
    role: "hinge",
  });

  const leftPivot = b.joint("leftPivot", {
    parent: upperPivot,
    at: [-0.56, 2.42, 0.02],
    dir: [0, -1, 0],
    role: "hinge",
  });

  const rightPivot = b.joint("rightPivot", {
    parent: upperPivot,
    at: [0.58, 2.50, -0.04],
    dir: [0, -1, 0],
    role: "hinge",
  });

  const midPivot = b.joint("midPivot", {
    parent: upperPivot,
    at: [-0.18, 2.18, -0.08],
    dir: [0, -1, 0],
    role: "hinge",
  });

  const lowerPivot = b.joint("lowerPivot", {
    parent: midPivot,
    at: [0.25, 1.57, -0.03],
    dir: [0, -1, 0],
    role: "hinge",
  });

  const bottomPivot = b.joint("bottomPivot", {
    parent: rightPivot,
    at: [0.35, 1.73, 0.08],
    dir: [0, -1, 0],
    role: "hinge",
  });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius = 0.009,
    color: string | any = BLACK,
    bone: any = suspension,
  ) => {
    return b.rod(a, c, radius, {
      color,
      bone,
      caps: "round",
      sides: 6,
      name: "black-wire",
      group: "wire",
    });
  };

  const bead = (
    at: [number, number, number],
    r: number,
    color: string,
    bone: any = suspension,
  ) => {
    return b.part(new THREE.SphereGeometry(r, 8, 5), color, {
      at,
      bone,
      flat: true,
      name: "counterweight",
      group: "weights",
    });
  };

  type Outline = [number, number] | [number, number, "sharp"];

  const plate = (
    name: string,
    at: [number, number, number],
    outline: Outline[],
    color: string,
    x: [number, number, number],
    y: [number, number, number],
    thickness: number,
    bone: any = suspension,
    smoothing = 1,
  ) => {
    return b.extrude(outline, {
      at,
      x,
      y,
      thickness,
      bevel: 0.004,
      smoothing,
      color,
      bone,
      name,
      group: "painted-plates",
    });
  };

  // A tiny pixel-like emblem texture, used as a sparse painted accent on one plate.
  const dotTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="none"/>
      <circle cx="18" cy="18" r="5" fill="#ffffff"/>
      <circle cx="43" cy="29" r="3.5" fill="#ffffff"/>
      <circle cx="29" cy="47" r="4.5" fill="#ffffff"/>
    </svg>`,
    { size: 128, pixelated: true },
  );

  // Suspension cord and the almost invisible top hook.
  rod([0, 2.82, 0], [0, 2.67, 0], 0.012, BLACK, suspension);
  bead([0, 2.68, 0], 0.025, BLACK, suspension);

  // Upper asymmetric counterbalanced bar.
  rod([0, 2.54, 0], [-0.74, 2.60, 0.02], 0.011, BLACK, upperPivot);
  rod([0, 2.54, 0], [0.72, 2.44, -0.02], 0.011, BLACK, upperPivot);
  rod([-0.74, 2.60, 0.02], [-0.88, 2.60, 0.02], 0.009, BLACK, upperPivot);
  rod([0.72, 2.44, -0.02], [0.91, 2.44, -0.02], 0.009, BLACK, upperPivot);

  bead([-0.88, 2.60, 0.02], 0.055, RED, upperPivot);
  bead([0.91, 2.44, -0.02], 0.042, BLACK, upperPivot);

  // A small copper-colored pivot cap.
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.025, 8), ORANGE, {
    at: [0, 2.54, 0],
    dir: [0, 1, 0],
    bone: upperPivot,
    flat: true,
    name: "upper-pivot-cap",
  });

  // Left hanging line and a large red organic silhouette.
  rod([-0.74, 2.60, 0.02], [-0.70, 2.04, 0.04], 0.007, BLACK, leftPivot);
  const redPlate = plate(
    "red-crescent",
    [-0.70, 1.91, 0.04],
    [
      [-0.03, -0.24],
      [0.14, -0.20],
      [0.24, -0.05],
      [0.20, 0.13],
      [0.08, 0.25],
      [-0.11, 0.22],
      [-0.22, 0.08],
      [-0.18, -0.10],
      [-0.03, -0.24],
    ],
    RED,
    [1, 0, 0],
    [0, 0, 1],
    0.018,
    leftPivot,
    1,
  );
  // A black slit gives the red plate its Calder-like cut-paper character.
  rod([-0.82, 1.91, 0.055], [-0.58, 2.02, 0.055], 0.006, BLACK, leftPivot);
  rod([-0.78, 1.87, 0.055], [-0.60, 1.78, 0.055], 0.006, BLACK, leftPivot);

  // Right hanging branch carries a blue leaf and a tiny yellow counterweight.
  rod([0.72, 2.44, -0.02], [0.58, 1.99, -0.01], 0.007, BLACK, rightPivot);
  rod([0.58, 1.99, -0.01], [0.93, 1.82, -0.02], 0.009, BLACK, rightPivot);
  rod([0.93, 1.82, -0.02], [1.02, 1.82, -0.02], 0.007, BLACK, rightPivot);
  bead([1.02, 1.82, -0.02], 0.035, YELLOW, rightPivot);

  plate(
    "blue-fan",
    [0.58, 1.72, -0.01],
    [
      [-0.02, -0.22],
      [0.16, -0.17],
      [0.28, -0.03],
      [0.22, 0.12],
      [0.05, 0.23],
      [-0.15, 0.16],
      [-0.26, 0.02],
      [-0.16, -0.14],
    ],
    BLUE,
    [1, 0, 0],
    [0, 0, 1],
    0.016,
    rightPivot,
    2,
  );

  // A thin diagonal slash on the blue leaf.
  rod([0.44, 1.61, 0.01], [0.72, 1.82, 0.01], 0.006, WHITE, rightPivot);

  // Central descending arm, deliberately bent and unbalanced.
  rod([0, 2.54, 0], [-0.18, 2.18, -0.08], 0.010, BLACK, upperPivot);
  rod([-0.18, 2.18, -0.08], [-0.48, 2.02, -0.06], 0.009, BLACK, midPivot);
  rod([-0.48, 2.02, -0.06], [-0.40, 1.71, -0.05], 0.007, BLACK, midPivot);

  // Yellow horizontal lozenge.
  plate(
    "yellow-lozenge",
    [-0.40, 1.58, -0.05],
    [
      [-0.34, 0],
      [-0.20, 0.11],
      [0.08, 0.14],
      [0.32, 0.04],
      [0.20, -0.12],
      [-0.10, -0.16],
      [-0.34, 0],
    ],
    YELLOW,
    [1, 0, 0],
    [0, 0, 1],
    0.019,
    midPivot,
    1,
  );

  // A tiny white disk hanging from the lozenge, like a punctuation mark.
  rod([-0.40, 1.58, -0.05], [-0.40, 1.31, -0.05], 0.006, BLACK, midPivot);
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.012, 10), WHITE, {
    at: [-0.40, 1.29, -0.05],
    dir: [0, 1, 0],
    bone: midPivot,
    flat: true,
    name: "white-disc",
  });

  // Lower pivot: a second counterbalanced bar.
  rod([0.25, 1.57, -0.03], [-0.15, 1.48, -0.04], 0.009, BLACK, lowerPivot);
  rod([0.25, 1.57, -0.03], [0.70, 1.48, -0.02], 0.009, BLACK, lowerPivot);
  bead([-0.19, 1.48, -0.04], 0.032, BLACK, lowerPivot);
  bead([0.75, 1.48, -0.02], 0.043, ORANGE, lowerPivot);

  // Green lower plate, broad and almost leaf-like.
  rod([0.25, 1.57, -0.03], [0.25, 1.08, -0.01], 0.007, BLACK, lowerPivot);
  plate(
    "green-leaf",
    [0.25, 0.91, -0.01],
    [
      [-0.05, -0.30],
      [0.16, -0.25],
      [0.29, -0.08],
      [0.24, 0.13],
      [0.09, 0.28],
      [-0.14, 0.22],
      [-0.25, 0.04],
      [-0.20, -0.17],
      [-0.05, -0.30],
    ],
    GREEN,
    [1, 0, 0],
    [0, 0, 1],
    0.017,
    lowerPivot,
    1,
  );

  // Lower-right branch with a purple vertical plate.
  rod([0.35, 1.73, 0.08], [0.72, 1.39, 0.10], 0.009, BLACK, bottomPivot);
  rod([0.72, 1.39, 0.10], [0.93, 1.15, 0.10], 0.007, BLACK, bottomPivot);
  plate(
    "purple-banner",
    [0.93, 0.91, 0.10],
    [
      [-0.15, -0.28],
      [0.10, -0.25],
      [0.19, -0.06],
      [0.14, 0.24],
      [-0.02, 0.34],
      [-0.18, 0.16],
      [-0.15, -0.28],
    ],
    PURPLE,
    [1, 0, 0],
    [0, 1, 0],
    0.018,
    bottomPivot,
    1,
  );

  // Small yellow-orange counterweight on the far side of the purple arm.
  rod([0.72, 1.39, 0.10], [1.06, 1.52, 0.10], 0.007, BLACK, bottomPivot);
  bead([1.11, 1.54, 0.10], 0.052, YELLOW, bottomPivot);

  // A final floating white accent, hung from the red branch, with a sparse graphic.
  rod([-0.70, 2.04, 0.04], [-0.95, 1.67, 0.09], 0.006, BLACK, leftPivot);
  const whiteAccent = b.part(
    new THREE.CircleGeometry(0.105, 10),
    WHITE,
    {
      at: [-0.95, 1.58, 0.09],
      dir: [0, 0, 1],
      axis: "z",
      bone: leftPivot,
      texture: dotTexture,
      flat: true,
      name: "dotted-white-accent",
      group: "painted-plates",
    },
  );

  // Small black pin caps emphasize the handcrafted wire joins.
  for (const p of [
    [0, 2.54, 0],
    [-0.18, 2.18, -0.08],
    [0.25, 1.57, -0.03],
    [0.35, 1.73, 0.08],
  ] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(0.018, 7, 5), BLACK, {
      at: p,
      bone: suspension,
      flat: true,
      name: "wire-pin",
      group: "wire",
    });
  }

  return b.root;
}
```