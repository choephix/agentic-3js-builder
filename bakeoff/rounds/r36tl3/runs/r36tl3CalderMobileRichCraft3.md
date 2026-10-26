```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An abstract Alexander Calder-inspired hanging mobile of black wire, bright primary-color planes, and counterbalanced organic forms.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#17191d";
  const RED = "#d9362b";
  const BLUE = "#2459ad";
  const YELLOW = "#f2bf32";
  const WHITE = "#eee8d8";
  const CORAL = "#e56f55";
  const TEAL = "#2c9b91";
  const PURPLE = "#7653a8";
  const ORANGE = "#e58932";

  const top = [0, 3.18, 0] as const;
  const crown = [0, 2.92, 0] as const;

  // The unseen ceiling thread and the tall central stem.
  b.rod(top, crown, 0.008, { color: BLACK, caps: "flat", name: "ceilingThread" });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), BLACK, {
    at: crown,
    name: "topKnot",
  });

  const stemA = [0, 2.92, 0] as const;
  const stemB = [0.02, 2.57, 0.015] as const;
  b.rod(stemA, stemB, 0.012, { color: BLACK, name: "centralStem" });

  // Helper for the fine vertical suspension strings.
  const stringTo = (a: readonly [number, number, number], c: readonly [number, number, number], name: string) =>
    b.rod(a, c, 0.0045, { color: BLACK, caps: "flat", name });

  // Flat, hand-cut Calder-like silhouettes. They are deliberately planar and slightly irregular.
  const plane = (
    outline: Array<[number, number]>,
    at: readonly [number, number, number],
    color: string,
    name: string,
    thickness = 0.012,
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: 0.002,
      smoothing: 1,
      color,
      name,
    });

  const disc = (
    at: readonly [number, number, number],
    radius: number,
    color: string,
    name: string,
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, 0.012, segments), color, {
      at,
      dir: [0, 0, 1],
      axis: "y",
      name,
    });

  // Uppermost small arm: a balanced yellow crescent and blue diamond.
  const armTop = [0.02, 2.6, 0.015] as const;
  const armTopL = [-0.48, 2.68, 0.01] as const;
  const armTopR = [0.57, 2.53, 0.02] as const;
  b.rod(armTop, armTopL, 0.009, { color: BLACK, name: "upperArmLeft" });
  b.rod(armTop, armTopR, 0.009, { color: BLACK, name: "upperArmRight" });
  stringTo(armTopL, [-0.48, 2.22, 0.01], "yellowString");
  stringTo(armTopR, [0.57, 2.15, 0.02], "blueString");

  plane(
    [
      [-0.16, 0],
      [-0.08, 0.17],
      [0.07, 0.24],
      [0.18, 0.11],
      [0.12, -0.06],
      [-0.04, -0.13],
    ],
    [-0.48, 2.22, 0.01],
    YELLOW,
    "yellowLeaf",
  );
  plane(
    [
      [0, 0.18],
      [0.15, 0.02],
      [0.04, -0.18],
      [-0.15, -0.02],
    ],
    [0.57, 2.15, 0.02],
    BLUE,
    "blueDiamond",
  );

  // Main broad crossbar, tilted through the composition.
  const barCenter = [0.02, 2.3, 0.02] as const;
  const barL = [-0.86, 2.22, 0.02] as const;
  const barR = [0.92, 2.38, 0.02] as const;
  b.rod(barL, barR, 0.011, { color: BLACK, name: "longCrossbar" });
  stringTo(barL, [-0.86, 1.69, 0.02], "leftMainString");
  stringTo(barR, [0.92, 1.73, 0.02], "rightMainString");

  // Left red vertical leaf and right coral disk.
  plane(
    [
      [-0.2, -0.26],
      [-0.12, 0.07],
      [0.02, 0.29],
      [0.17, 0.19],
      [0.1, -0.18],
      [-0.03, -0.32],
    ],
    [-0.86, 1.69, 0.02],
    RED,
    "redLeaf",
    0.014,
  );
  disc([0.92, 1.73, 0.02], 0.19, CORAL, "coralRound", 14);

  // A lower black branch hangs from the left, carrying a white blade and a teal pebble.
  const lowerPivot = [-0.43, 2.02, -0.01] as const;
  stringTo(lowerPivot, [-0.43, 1.62, -0.01], "lowerDrop");
  const lowerBarA = [-0.43, 1.62, -0.01] as const;
  const lowerBarB = [0.3, 1.55, -0.015] as const;
  b.rod(lowerBarA, lowerBarB, 0.009, { color: BLACK, name: "lowerCrossbar" });

  const whiteAt = [-0.72, 1.23, -0.01] as const;
  const tealAt = [0.3, 1.17, -0.015] as const;
  stringTo(lowerBarA, whiteAt, "whiteDrop");
  stringTo(lowerBarB, tealAt, "tealDrop");

  plane(
    [
      [-0.24, -0.04],
      [-0.08, 0.25],
      [0.1, 0.36],
      [0.2, 0.13],
      [0.05, -0.22],
      [-0.12, -0.31],
    ],
    whiteAt,
    WHITE,
    "whiteSail",
    0.013,
  );
  plane(
    [
      [-0.12, 0],
      [0.02, 0.2],
      [0.18, 0.13],
      [0.2, -0.08],
      [0.03, -0.2],
      [-0.14, -0.1],
    ],
    tealAt,
    TEAL,
    "tealPebble",
    0.014,
  );

  // Right-side lower arm, with a playful purple triangle and orange counterweight.
  const rightFork = [0.63, 2.02, 0.02] as const;
  stringTo(rightFork, [0.63, 1.65, 0.02], "rightForkString");
  const forkA = [0.63, 1.65, 0.02] as const;
  const forkB = [1.18, 1.58, 0.02] as const;
  b.rod(forkA, forkB, 0.009, { color: BLACK, name: "rightLowerArm" });
  stringTo(forkA, [0.63, 1.2, 0.02], "purpleDrop");
  stringTo(forkB, [1.18, 1.11, 0.02], "orangeDrop");

  plane(
    [
      [0, 0.25],
      [0.24, -0.18],
      [-0.2, -0.12],
    ],
    [0.63, 1.2, 0.02],
    PURPLE,
    "purpleTriangle",
  );
  plane(
    [
      [-0.18, 0.08],
      [-0.05, 0.24],
      [0.16, 0.12],
      [0.13, -0.11],
      [-0.1, -0.2],
    ],
    [1.18, 1.11, 0.02],
    ORANGE,
    "orangePebble",
  );

  // The lowest counterbalanced arm: an oversized blue crescent and small yellow disk.
  const lowHinge = [-0.02, 1.62, -0.02] as const;
  stringTo(lowHinge, [-0.02, 1.3, -0.02], "lowestDrop");
  const lowA = [-0.02, 1.3, -0.02] as const;
  const lowB = [0.88, 1.18, -0.02] as const;
  b.rod(lowA, lowB, 0.009, { color: BLACK, name: "lowestArm" });
  stringTo(lowA, [-0.02, 0.82, -0.02], "crescentString");
  stringTo(lowB, [0.88, 0.72, -0.02], "smallDiscString");

  plane(
    [
      [-0.34, 0.02],
      [-0.22, 0.31],
      [0.02, 0.42],
      [0.27, 0.3],
      [0.34, 0.09],
      [0.22, -0.05],
      [-0.02, 0.07],
      [-0.24, -0.14],
    ],
    [-0.02, 0.82, -0.02],
    BLUE,
    "blueCrescent",
    0.016,
  );
  disc([0.88, 0.72, -0.02], 0.135, YELLOW, "lowestYellowDisc", 12);

  // Tiny spherical beads make the wire joints legible without overpowering the planes.
  for (const p of [
    armTop,
    armTopL,
    armTopR,
    barL,
    barR,
    lowerBarA,
    lowerBarB,
    forkA,
    forkB,
    lowA,
    lowB,
  ]) {
    b.part(new THREE.SphereGeometry(0.018, 7, 5), BLACK, {
      at: p,
      name: "wireBead",
    });
  }

  return b.root;
}
```