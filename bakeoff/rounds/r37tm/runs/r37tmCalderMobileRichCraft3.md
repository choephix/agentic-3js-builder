```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An airy Alexander Calder-inspired hanging mobile of black balancing wires and bold, asymmetrical primary-color shapes.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#16151a";
  const RED = "#e43b32";
  const BLUE = "#1768a8";
  const YELLOW = "#f2c52d";
  const WHITE = "#f4eee0";
  const ORANGE = "#e87532";
  const PINK = "#d85c83";
  const GREEN = "#4c9271";

  const rodRadius = 0.009;
  const wireRadius = 0.0045;

  const rod = (a: [number, number, number], z: [number, number, number], r = rodRadius, color = BLACK) =>
    b.rod(a, z, r, { color, caps: "round", section: { ngon: 6 }, flat: true });

  const wire = (a: [number, number, number], z: [number, number, number]) =>
    b.rod(a, z, wireRadius, { color: BLACK, caps: "round", section: { ngon: 6 } });

  const bead = (p: [number, number, number], radius = 0.025, color = BLACK) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      flat: true,
    });

  const disc = (
    p: [number, number, number],
    radius: number,
    color: string,
    thickness = 0.014,
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, thickness, segments), color, {
      at: p,
      dir: [0, 0, 1],
      flat: true,
    });

  const plate = (
    outline: [number, number][],
    at: [number, number, number],
    color: string,
    x: [number, number, number] = [1, 0, 0],
    y: [number, number, number] = [0, 1, 0],
    thickness = 0.018,
  ) =>
    b.extrude(outline, {
      at,
      x,
      y,
      thickness,
      bevel: 0.004,
      smoothing: 0,
      color,
    });

  const tinyPlate = (
    outline: [number, number][],
    at: [number, number, number],
    color: string,
    x: [number, number, number] = [1, 0, 0],
    y: [number, number, number] = [0, 1, 0],
  ) => plate(outline, at, color, x, y, 0.012);

  // A small ceiling hook and the first hanging thread.
  const hookPath = catmull([
    [0, 3.36, 0],
    [0.015, 3.27, 0],
    [0.035, 3.20, 0.015],
    [0.005, 3.13, 0.025],
  ]);
  b.sweep(hookPath, 0.012, { color: BLACK, caps: "round", section: { ngon: 6 } });
  wire([0.005, 3.13, 0.025], [0, 3.02, 0]);

  // Upper balancing arm: deliberately slightly off-axis and almost weightless.
  rod([-0.62, 3.00, 0.02], [0.59, 2.94, -0.035], 0.011);
  bead([0, 2.97, -0.005], 0.034);
  wire([0, 3.00, 0], [0, 3.13, 0]);

  // Upper left: a red angular leaf.
  wire([-0.62, 3.00, 0.02], [-0.72, 2.67, 0.045]);
  plate(
    [
      [-0.19, -0.08],
      [-0.08, -0.19],
      [0.12, -0.17],
      [0.23, 0.0],
      [0.10, 0.17],
      [-0.08, 0.20],
      [-0.21, 0.08],
    ],
    [-0.72, 2.55, 0.045],
    RED,
    [1, 0.02, 0],
    [0, 1, 0],
  );
  disc([-0.72, 2.55, 0.065], 0.032, WHITE, 0.009, 10);
  disc([-0.72, 2.55, 0.073], 0.014, BLACK, 0.007, 10);

  // Upper right: a bright yellow crescent-like stepped plate.
  wire([0.59, 2.94, -0.035], [0.76, 2.62, -0.01]);
  plate(
    [
      [-0.17, -0.18],
      [0.03, -0.21],
      [0.18, -0.08],
      [0.18, 0.10],
      [0.05, 0.22],
      [-0.08, 0.15],
      [0.02, 0.04],
      [-0.10, -0.01],
    ],
    [0.76, 2.47, -0.01],
    YELLOW,
    [0.96, 0, 0.18],
    [-0.08, 1, 0],
  );
  tinyPlate(
    [
      [-0.09, -0.03],
      [0.01, -0.08],
      [0.10, -0.01],
      [0.06, 0.07],
      [-0.04, 0.08],
    ],
    [0.76, 2.47, 0.012],
    BLACK,
    [0.96, 0, 0.18],
    [-0.08, 1, 0],
  );

  // Second suspension descends from the center of the upper arm.
  wire([0, 2.97, -0.005], [0.08, 2.53, 0.06]);
  bead([0.08, 2.53, 0.06], 0.026);

  // Middle arm, a strong diagonal with a counterweight at its right tip.
  rod([-0.64, 2.40, 0.07], [0.72, 2.24, 0.02], 0.012);
  bead([0.08, 2.34, 0.045], 0.031);
  wire([0.08, 2.53, 0.06], [0.08, 2.34, 0.045]);

  // Middle arm left: blue triangular sail.
  wire([-0.64, 2.40, 0.07], [-0.86, 2.08, 0.11]);
  plate(
    [
      [-0.22, -0.16],
      [0.10, -0.21],
      [0.23, -0.02],
      [0.04, 0.23],
      [-0.18, 0.15],
    ],
    [-0.86, 1.93, 0.11],
    BLUE,
    [0.98, 0, 0.12],
    [0.04, 1, 0],
  );
  tinyPlate(
    [
      [-0.13, -0.07],
      [0.06, -0.11],
      [0.12, 0.03],
      [-0.02, 0.12],
    ],
    [-0.86, 1.93, 0.13],
    WHITE,
    [0.98, 0, 0.12],
    [0.04, 1, 0],
  );

  // Middle arm right: orange disc and a little black counterweight.
  wire([0.72, 2.24, 0.02], [0.93, 1.99, -0.03]);
  disc([0.93, 1.86, -0.03], 0.16, ORANGE, 0.018, 14);
  disc([0.93, 1.86, -0.052], 0.064, RED, 0.01, 12);
  bead([0.93, 1.86, -0.075], 0.018, WHITE);

  // A thread from the middle pivot supports the lower balancing arm.
  wire([0.08, 2.34, 0.045], [-0.05, 1.84, 0.10]);
  bead([-0.05, 1.84, 0.10], 0.026);

  // Lower arm, with an elegant shallow curve rather than a perfectly straight bar.
  const lowerArm = catmull([
    [-0.58, 1.82, 0.10],
    [-0.18, 1.77, 0.13],
    [0.18, 1.83, 0.12],
    [0.72, 1.72, 0.06],
  ]);
  b.sweep(lowerArm, 0.011, {
    color: BLACK,
    caps: "round",
    section: { ngon: 6 },
  });
  bead([0.02, 1.80, 0.12], 0.03);
  wire([-0.05, 1.84, 0.10], [0.02, 1.80, 0.12]);

  // Lower left: broad yellow fan, faceted like painted sheet metal.
  wire([-0.58, 1.82, 0.10], [-0.66, 1.47, 0.13]);
  plate(
    [
      [-0.24, -0.17],
      [-0.08, -0.24],
      [0.13, -0.20],
      [0.27, -0.04],
      [0.18, 0.16],
      [-0.04, 0.22],
      [-0.24, 0.11],
    ],
    [-0.66, 1.31, 0.13],
    YELLOW,
    [0.97, 0, -0.12],
    [0.05, 1, 0],
  );
  tinyPlate(
    [
      [-0.16, -0.06],
      [0.0, -0.13],
      [0.15, -0.02],
      [0.05, 0.12],
      [-0.11, 0.08],
    ],
    [-0.66, 1.31, 0.16],
    RED,
    [0.97, 0, -0.12],
    [0.05, 1, 0],
  );

  // Lower right: red vertical petal with a white inset.
  wire([0.72, 1.72, 0.06], [0.84, 1.40, 0.01]);
  plate(
    [
      [-0.12, -0.24],
      [0.07, -0.20],
      [0.16, -0.02],
      [0.11, 0.20],
      [-0.04, 0.27],
      [-0.16, 0.10],
    ],
    [0.84, 1.22, 0.01],
    RED,
    [1, 0.12, 0],
    [-0.08, 1, 0],
  );
  tinyPlate(
    [
      [-0.06, -0.12],
      [0.06, -0.10],
      [0.08, 0.04],
      [0.01, 0.13],
      [-0.08, 0.04],
    ],
    [0.84, 1.22, 0.038],
    WHITE,
    [1, 0.12, 0],
    [-0.08, 1, 0],
  );

  // Deep central string and bottom arm provide the characteristic cascading silhouette.
  wire([0.02, 1.80, 0.12], [0.02, 1.23, 0.17]);
  rod([-0.43, 1.17, 0.16], [0.61, 1.08, 0.11], 0.010);
  bead([0.02, 1.13, 0.14], 0.027);
  wire([0.02, 1.23, 0.17], [0.02, 1.13, 0.14]);

  // Bottom left: small green diamond, nearly edge-on in depth.
  wire([-0.43, 1.17, 0.16], [-0.48, 0.84, 0.18]);
  plate(
    [
      [0, -0.22],
      [0.16, 0],
      [0, 0.25],
      [-0.16, 0],
    ],
    [-0.48, 0.68, 0.18],
    GREEN,
    [0.99, 0, 0.1],
    [0, 1, 0],
  );
  disc([-0.48, 0.68, 0.207], 0.047, WHITE, 0.008, 10);

  // Bottom right: large blue abstract paddle.
  wire([0.61, 1.08, 0.11], [0.76, 0.76, 0.07]);
  plate(
    [
      [-0.18, -0.20],
      [0.03, -0.23],
      [0.19, -0.09],
      [0.18, 0.12],
      [0.01, 0.25],
      [-0.17, 0.13],
      [-0.27, -0.02],
    ],
    [0.76, 0.56, 0.07],
    BLUE,
    [0.96, 0, 0.28],
    [-0.12, 1, 0],
  );
  tinyPlate(
    [
      [-0.10, -0.12],
      [0.07, -0.08],
      [0.12, 0.03],
      [-0.02, 0.12],
      [-0.12, 0.04],
    ],
    [0.76, 0.56, 0.105],
    ORANGE,
    [0.96, 0, 0.28],
    [-0.12, 1, 0],
  );

  // A final small white pendant gives the base a gentle visual stop without touching the floor.
  wire([0.02, 1.13, 0.14], [0.13, 0.82, 0.20]);
  plate(
    [
      [-0.12, -0.13],
      [0.10, -0.13],
      [0.16, 0.02],
      [0.02, 0.16],
      [-0.15, 0.08],
    ],
    [0.13, 0.68, 0.20],
    WHITE,
    [1, 0, 0],
    [0.06, 1, 0],
  );
  disc([0.13, 0.68, 0.226], 0.026, BLACK, 0.008, 8);

  // Small colored beads at a few pivots emphasize the hand-balanced construction.
  bead([-0.62, 3.00, 0.02], 0.018, RED);
  bead([0.59, 2.94, -0.035], 0.018, YELLOW);
  bead([-0.64, 2.40, 0.07], 0.019, BLUE);
  bead([0.72, 2.24, 0.02], 0.019, ORANGE);
  bead([-0.58, 1.82, 0.10], 0.018, YELLOW);
  bead([0.72, 1.72, 0.06], 0.018, RED);

  return b.root;
}
```