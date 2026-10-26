```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An airy Alexander Calder-inspired hanging mobile of asymmetrical painted metal shapes, counterbalanced rods, wires, and playful primary colours.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#171719";
  const RED = "#e83b2f";
  const BLUE = "#1769aa";
  const YELLOW = "#f5c542";
  const ORANGE = "#ee7838";
  const WHITE = "#f2ead8";
  const PINK = "#d95882";
  const GREEN = "#5e9f68";

  const rod = (a: THREE.Vector3 | [number, number, number], c: THREE.Vector3 | [number, number, number], r = 0.012, color = BLACK) =>
    b.rod(a, c, r, { color, caps: "round", sides: 6 });

  const wire = (a: THREE.Vector3 | [number, number, number], c: THREE.Vector3 | [number, number, number], r = 0.004) =>
    b.rod(a, c, r, { color: BLACK, caps: "round", sides: 5 });

  const disc = (
    at: [number, number, number],
    radius: number,
    color: string,
    rotation = 0,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, 0.018, 16),
      color,
      {
        at,
        dir: [0, 0, 1],
        axis: "y",
        rotation: [0, rotation, 0],
        flat: true,
        name: "painted-disc",
      },
    );
  };

  const smallDisc = (
    at: [number, number, number],
    radius: number,
    color: string,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, 0.022, 14),
      color,
      { at, dir: [0, 0, 1], axis: "y", flat: true, name: "round-counterweight" },
    );

  const oval = (
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    rot = 0,
  ) =>
    b.part(
      new THREE.SphereGeometry(1, 12, 6),
      color,
      {
        at,
        scale,
        rotation: [0, 0, rot],
        name: "soft-oval",
      },
    );

  const shape = (
    outline: [number, number][] | [number, number, "sharp"][],
    at: [number, number, number],
    color: string,
    x: [number, number, number] = [1, 0, 0],
  ) =>
    b.extrude(outline, {
      at,
      x,
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 1,
      color,
      name: "cut-metal-shape",
    });

  // A tiny suspended loop and the black central spine.
  b.part(
    new THREE.TorusGeometry(0.055, 0.009, 6, 12, Math.PI * 1.7),
    BLACK,
    {
      at: [0, 2.74, 0],
      rotation: [Math.PI / 2, 0, 0],
      name: "suspension-loop",
    },
  );
  wire([0, 2.72, 0], [0, 2.48, 0], 0.006);
  rod([0, 2.48, 0], [0, 2.05, 0], 0.016);

  // Highest, long counterbalanced arm: a Calder-like black line with a red leaf on one end
  // and a yellow circular counterweight on the other.
  rod([-0.64, 2.30, 0], [0.72, 2.30, 0], 0.015);
  wire([0, 2.48, 0], [0, 2.30, 0], 0.005);

  shape(
    [
      [-0.04, -0.03],
      [0.18, -0.02],
      [0.34, 0.08],
      [0.29, 0.19],
      [0.08, 0.16],
      [-0.10, 0.06],
    ],
    [-0.70, 2.30, 0],
    RED,
  );
  smallDisc([0.78, 2.30, 0], 0.095, YELLOW);
  wire([-0.48, 2.30, 0], [-0.58, 1.80, 0], 0.004);
  wire([0.78, 2.30, 0], [0.78, 1.91, 0], 0.004);
  disc([-0.58, 1.72, 0], 0.20, BLUE, -0.18);

  // Mid-level diagonal arm, visibly independent from the upper arm.
  wire([0, 2.05, 0], [0.04, 1.84, 0], 0.005);
  rod([-0.73, 1.84, 0.015], [0.68, 1.55, 0.015], 0.014);
  oval([-0.73, 1.84, 0.015], [0.16, 0.055, 0.018], WHITE, -0.18);
  shape(
    [
      [-0.02, -0.22],
      [0.12, -0.14],
      [0.18, 0.07],
      [0.08, 0.27],
      [-0.08, 0.17],
      [-0.13, -0.06],
    ],
    [0.68, 1.55, 0.015],
    ORANGE,
  );

  // A string from the left end supports a broad blue crescent.
  wire([-0.73, 1.84, 0.015], [-0.91, 1.28, 0.015], 0.004);
  shape(
    [
      [-0.22, 0.22],
      [-0.03, 0.28],
      [0.18, 0.17],
      [0.24, -0.02],
      [0.15, -0.18],
      [-0.06, -0.25],
      [-0.20, -0.15],
      [-0.10, -0.02],
      [0.04, 0.06],
      [0.08, 0.16],
      [-0.07, 0.13],
      [-0.20, 0.05],
    ],
    [-0.91, 1.05, 0.015],
    BLUE,
  );

  // Lower center spindle and its four-way delicate bar.
  wire([0.04, 1.84, 0], [0.04, 1.42, 0], 0.005);
  rod([-0.58, 1.42, -0.02], [0.62, 1.42, -0.02], 0.013);
  wire([0.04, 1.42, 0], [0.04, 1.19, 0], 0.005);

  // Left hanging pink disc with a tiny yellow dot layered in front.
  wire([-0.58, 1.42, -0.02], [-0.62, 0.86, -0.02], 0.004);
  disc([-0.62, 0.72, -0.02], 0.155, PINK, 0.12);
  smallDisc([-0.55, 0.76, 0.01], 0.045, YELLOW);

  // Right hanging white blade and green counterweight.
  wire([0.62, 1.42, -0.02], [0.82, 1.03, -0.02], 0.004);
  shape(
    [
      [-0.03, -0.27],
      [0.13, -0.15],
      [0.19, 0.10],
      [0.04, 0.29],
      [-0.12, 0.16],
      [-0.18, -0.10],
    ],
    [0.82, 0.75, -0.02],
    WHITE,
  );
  smallDisc([0.57, 1.42, -0.03], 0.075, GREEN);

  // Lowest eccentric arm, offset in depth to make the silhouette richer.
  wire([0.04, 1.19, 0], [-0.08, 0.98, -0.02], 0.005);
  rod([-0.50, 0.98, -0.03], [0.58, 0.78, -0.03], 0.012);
  shape(
    [
      [-0.26, 0.03],
      [-0.07, 0.17],
      [0.15, 0.15],
      [0.27, 0.02],
      [0.14, -0.12],
      [-0.12, -0.18],
      [-0.27, -0.10],
    ],
    [-0.50, 0.98, -0.03],
    YELLOW,
  );

  // Orange teardrop under the low arm.
  wire([-0.50, 0.98, -0.03], [-0.56, 0.45, -0.03], 0.004);
  shape(
    [
      [0, 0.28],
      [0.14, 0.08],
      [0.15, -0.13],
      [0.02, -0.27, "sharp"],
      [-0.13, -0.10],
      [-0.15, 0.11],
    ],
    [-0.56, 0.19, -0.03],
    ORANGE,
  );

  // Blue-green thin leaf at the other low end.
  wire([0.58, 0.78, -0.03], [0.78, 0.39, -0.03], 0.004);
  shape(
    [
      [-0.02, -0.24],
      [0.14, -0.08],
      [0.25, 0.15],
      [0.12, 0.28],
      [-0.08, 0.18],
      [-0.18, -0.03],
    ],
    [0.78, 0.12, -0.03],
    GREEN,
  );

  // Small front-facing decorative circles make the flat planes read as painted metal.
  disc([-0.91, 1.05, 0.038], 0.056, WHITE, 0.0);
  disc([0.82, 0.75, 0.038], 0.048, BLUE, 0.0);
  disc([-0.56, 0.19, 0.038], 0.035, PINK, 0.0);

  // A few tiny black joints give the construction a hand-made Calder balance-point character.
  for (const p of [
    [0, 2.30, 0.035],
    [0.04, 1.84, 0.035],
    [0.04, 1.42, 0.035],
    [-0.08, 0.98, 0.035],
  ] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(0.026, 8, 5), BLACK, {
      at: p,
      name: "balance-joint",
    });
  }

  return b.root;
}
```