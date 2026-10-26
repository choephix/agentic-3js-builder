```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An asymmetrical Alexander Calder-inspired hanging mobile of slender black wire, balanced colored planes, discs, crescents, and floating spheres.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#191719";
  const RED = "#d9362b";
  const BLUE = "#2466a8";
  const YELLOW = "#f2bb32";
  const ORANGE = "#e86d32";
  const WHITE = "#e8e3d2";
  const PINK = "#d65b78";
  const GREEN = "#5b9275";

  const rand = rng(42);

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius = 0.008,
    color = BLACK,
    name = "wire",
  ) => b.rod(a, c, radius, { color, caps: "round", name, group: "wire" });

  const bead = (
    at: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    name = "counterweight",
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      name,
      group: "counterweights",
      flat: true,
    });

  const disk = (
    at: THREE.Vector3 | [number, number, number],
    radius: number,
    depth: number,
    axis: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, depth, 16, 1, false),
      color,
      {
        at,
        dir: axis,
        name,
        group: "painted-forms",
        flat: true,
      },
    );

  const cone = (
    at: THREE.Vector3 | [number, number, number],
    r0: number,
    r1: number,
    h: number,
    axis: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(
      new THREE.ConeGeometry(r0, h, 8, 1),
      color,
      {
        at,
        dir: axis,
        name,
        group: "painted-forms",
        flat: true,
      },
    );

  const horizontalPlate = (
    at: [number, number, number],
    outline: [number, number][],
    color: string,
    name: string,
    thickness = 0.012,
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness,
      bevel: 0.004,
      smoothing: 1,
      color,
      name,
      group: "painted-forms",
    });

  const verticalPlate = (
    at: [number, number, number],
    outline: [number, number][],
    color: string,
    name: string,
    thickness = 0.012,
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: 0.004,
      smoothing: 1,
      color,
      name,
      group: "painted-forms",
    });

  const hook = (at: [number, number, number], color = BLACK, name = "hook") => {
    // A tiny bent-looking suspension hook made from two overlapping wire segments.
    rod(
      [at[0], at[1] + 0.035, at[2]],
      [at[0], at[1], at[2] + 0.012],
      0.006,
      color,
      `${name}-stem`,
    );
    rod(
      [at[0], at[1], at[2] + 0.012],
      [at[0] + 0.026, at[1] - 0.018, at[2] + 0.012],
      0.006,
      color,
      `${name}-bend`,
    );
  };

  // A nearly invisible ceiling cord and the tall central spine.
  rod([0, 2.98, 0], [0, 2.72, 0], 0.006, BLACK, "ceiling-cord");
  bead([0, 2.99, 0], 0.025, BLACK, "ceiling-knot");
  rod([0, 2.72, 0], [0, 2.18, 0], 0.011, BLACK, "central-spine-upper");
  rod([0, 2.18, 0], [0, 1.65, 0], 0.009, BLACK, "central-spine-lower");
  disk([0, 2.48, 0], 0.026, 0.026, [0, 1, 0], BLACK, "top-swivel");

  // Upper Calder balance: a long, lightly angled black arm.
  rod([-0.03, 2.53, 0], [0.56, 2.48, 0.015], 0.009, BLACK, "upper-balance-right");
  rod([-0.03, 2.53, 0], [-0.48, 2.58, -0.02], 0.009, BLACK, "upper-balance-left");
  bead([0.57, 2.48, 0.015], 0.027, ORANGE, "upper-orange-weight");
  bead([-0.49, 2.58, -0.02], 0.021, BLACK, "upper-left-knot");

  // Upper right: a broad blue horizontal sail with a cut-in notch.
  horizontalPlate(
    [0.72, 2.38, 0.02],
    [
      [-0.2, -0.09],
      [0.12, -0.12],
      [0.21, -0.03],
      [0.08, 0.025],
      [0.17, 0.105],
      [-0.14, 0.08],
    ],
    BLUE,
    "upper-blue-sail",
    0.015,
  );
  rod([0.56, 2.48, 0.015], [0.72, 2.42, 0.02], 0.006, BLACK, "upper-blue-drop");
  hook([0.72, 2.38, 0.02], BLACK, "blue-sail-hook");

  // Upper left: a red vertical diamond and a small yellow disc.
  rod([-0.48, 2.58, -0.02], [-0.63, 2.27, -0.01], 0.006, BLACK, "upper-left-drop");
  verticalPlate(
    [-0.63, 2.16, -0.01],
    [
      [0, -0.18],
      [0.14, 0],
      [0, 0.21],
      [-0.13, 0],
    ],
    RED,
    "upper-red-diamond",
    0.014,
  );
  disk([-0.63, 2.42, -0.01], 0.09, 0.012, [0, 0, 1], YELLOW, "upper-yellow-disc");
  rod([-0.63, 2.51, -0.01], [-0.63, 2.58, -0.02], 0.005, BLACK, "yellow-disc-wire");

  // A small orange triangle tucked behind the upper spine.
  verticalPlate(
    [-0.15, 2.27, -0.06],
    [
      [0, -0.12],
      [0.17, 0.1],
      [-0.12, 0.15],
    ],
    ORANGE,
    "upper-orange-triangle",
  );
  rod([-0.03, 2.53, 0], [-0.15, 2.34, -0.06], 0.005, BLACK, "orange-triangle-drop");

  // Middle balance bar, slightly off axis to create the characteristic Calder imbalance.
  rod([0.01, 2.04, 0], [-0.72, 2.00, 0.04], 0.010, BLACK, "middle-balance-left");
  rod([0.01, 2.04, 0], [0.46, 2.10, -0.015], 0.010, BLACK, "middle-balance-right");
  disk([0.01, 2.04, 0], 0.032, 0.03, [0, 1, 0], BLACK, "middle-pivot");
  bead([-0.73, 2.00, 0.04], 0.034, YELLOW, "middle-yellow-counterweight");
  bead([0.46, 2.10, -0.015], 0.022, BLACK, "middle-right-knot");

  // Left middle red crescent assembled from a thick arc-like polygon.
  verticalPlate(
    [-0.91, 1.82, 0.05],
    [
      [-0.02, -0.21],
      [0.10, -0.17],
      [0.18, -0.06],
      [0.16, 0.08],
      [0.08, 0.18],
      [-0.04, 0.22],
      [0.01, 0.10],
      [0.07, 0.02],
      [0.06, -0.07],
      [0.01, -0.13],
    ],
    RED,
    "middle-red-crescent",
    0.016,
  );
  rod([-0.72, 2.00, 0.04], [-0.91, 2.01, 0.05], 0.006, BLACK, "red-crescent-drop");
  hook([-0.91, 2.01, 0.05], BLACK, "red-crescent-hook");

  // Small yellow horizontal lozenge on the left.
  horizontalPlate(
    [-0.34, 1.88, 0.10],
    [
      [-0.19, 0],
      [-0.06, -0.055],
      [0.18, 0],
      [0.06, 0.065],
    ],
    YELLOW,
    "middle-yellow-lozenge",
  );
  rod([-0.72, 2.00, 0.04], [-0.34, 1.97, 0.10], 0.005, BLACK, "yellow-lozenge-drop");

  // Middle right: black arm ending in a floating blue disc.
  rod([0.46, 2.10, -0.015], [0.84, 1.94, -0.035], 0.008, BLACK, "middle-right-arm");
  bead([0.85, 1.94, -0.035], 0.028, BLACK, "middle-right-end");
  rod([0.84, 1.94, -0.035], [0.97, 1.66, -0.02], 0.006, BLACK, "blue-disc-drop");
  disk([0.97, 1.55, -0.02], 0.13, 0.014, [0, 0, 1], BLUE, "middle-blue-disc");
  // A tiny yellow cap gives the disc a hand-cut, toy-like focal point.
  disk([0.97, 1.55, -0.031], 0.032, 0.008, [0, 0, 1], YELLOW, "blue-disc-center");

  // Central lower balance hangs from the spine and spreads dramatically.
  rod([0, 1.78, 0], [0, 1.53, 0], 0.007, BLACK, "lower-pivot-drop");
  bead([0, 1.52, 0], 0.026, BLACK, "lower-pivot-bead");
  rod([0, 1.53, 0], [-0.66, 1.49, 0.015], 0.009, BLACK, "lower-balance-left");
  rod([0, 1.53, 0], [0.58, 1.59, -0.02], 0.009, BLACK, "lower-balance-right");

  // Lower left: large white sail, with an orange triangular counterweight.
  horizontalPlate(
    [-0.84, 1.37, 0.015],
    [
      [-0.26, -0.12],
      [0.06, -0.18],
      [0.27, -0.02],
      [0.12, 0.12],
      [-0.15, 0.18],
      [-0.31, 0.05],
    ],
    WHITE,
    "lower-white-sail",
    0.016,
  );
  rod([-0.66, 1.49, 0.015], [-0.84, 1.42, 0.015], 0.006, BLACK, "white-sail-drop");
  hook([-0.84, 1.42, 0.015], BLACK, "white-sail-hook");

  verticalPlate(
    [-0.37, 1.28, 0.01],
    [
      [-0.18, -0.13],
      [0.18, -0.04],
      [0.02, 0.17],
    ],
    ORANGE,
    "lower-orange-pennant",
  );
  rod([-0.66, 1.49, 0.015], [-0.37, 1.43, 0.01], 0.005, BLACK, "orange-pennant-drop");

  // Lower right: a long blue-green blade and a red ball.
  rod([0.58, 1.59, -0.02], [0.73, 1.34, -0.01], 0.006, BLACK, "blade-drop");
  verticalPlate(
    [0.73, 1.15, -0.01],
    [
      [-0.07, -0.3],
      [0.1, -0.17],
      [0.15, 0.14],
      [0.01, 0.33],
      [-0.1, 0.08],
    ],
    GREEN,
    "lower-green-blade",
    0.014,
  );
  rod([0.58, 1.59, -0.02], [1.02, 1.53, 0.035], 0.007, BLACK, "red-ball-arm");
  bead([1.05, 1.51, 0.035], 0.105, RED, "lower-red-sphere");

  // A small pink horizontal plate hangs behind the central spine.
  rod([0, 1.53, 0], [0.17, 1.26, -0.11], 0.005, BLACK, "pink-plate-drop");
  horizontalPlate(
    [0.17, 1.17, -0.11],
    [
      [-0.13, -0.045],
      [0.03, -0.11],
      [0.17, -0.025],
      [0.09, 0.08],
      [-0.1, 0.07],
    ],
    PINK,
    "lower-pink-diamond",
  );

  // Delicate terminal branch from the central spine, ending in a small yellow disc.
  rod([0, 1.65, 0], [-0.18, 1.23, 0.03], 0.006, BLACK, "terminal-branch");
  rod([-0.18, 1.23, 0.03], [-0.42, 1.12, 0.04], 0.005, BLACK, "terminal-yellow-drop");
  disk([-0.42, 1.02, 0.04], 0.075, 0.012, [0, 0, 1], YELLOW, "terminal-yellow-disc");

  // A few tiny dark beads punctuate the otherwise planar composition.
  bead([0.26, 2.25, 0.12], 0.018, BLACK, "tiny-bead-a");
  bead([-0.22, 1.71, -0.06], 0.015, BLACK, "tiny-bead-b");
  bead([0.33, 1.43, 0.02], 0.019, BLACK, "tiny-bead-c");

  // Subtle second-order wire marks: short rods make the suspension feel handmade.
  rod([0.72, 2.42, 0.02], [0.70, 2.35, 0.02], 0.0035, BLACK, "blue-hook-tail");
  rod([-0.84, 1.42, 0.015], [-0.81, 1.36, 0.015], 0.0035, BLACK, "white-hook-tail");
  rod([0.97, 1.66, -0.02], [0.95, 1.61, -0.02], 0.0035, BLACK, "disc-hook-tail");

  return b.root;
}
```