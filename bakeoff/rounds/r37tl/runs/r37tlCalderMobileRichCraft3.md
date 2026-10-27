```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An asymmetrical Alexander Calder-inspired hanging mobile of black wire arms and boldly colored floating geometric forms.",
};

export default function build() {
  const b = createBuilder({ name: "calderMobile", detail: 1 });

  const BLACK = "#17181b";
  const RED = "#d9362b";
  const RED_DARK = "#9d211f";
  const BLUE = "#2168b5";
  const BLUE_DARK = "#17477d";
  const YELLOW = "#f2bb28";
  const YELLOW_DARK = "#bb8515";
  const WHITE = "#e7dfc9";
  const GREEN = "#4d987d";
  const PURPLE = "#704b8e";

  const top = [0, 2.82, 0] as const;
  const crown = [0, 2.65, 0] as const;

  const wire = (a: readonly [number, number, number], c: readonly [number, number, number], r = 0.008) =>
    b.rod(a, c, r, { color: BLACK, caps: "flat", group: "wire" });

  const disk = (
    at: readonly [number, number, number],
    radius: number,
    color: string,
    horizontal = false,
  ) => {
    const outline: [number, number][] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      outline.push([Math.cos(a) * radius, Math.sin(a) * radius]);
    }
    return b.extrude(outline, {
      at,
      x: horizontal ? [1, 0, 0] : [1, 0, 0],
      y: horizontal ? [0, 0, 1] : [0, 1, 0],
      thickness: horizontal ? 0.025 : 0.018,
      bevel: 0.004,
      color,
      group: "colored forms",
    });
  };

  const polygon = (
    points: [number, number][],
    at: readonly [number, number, number],
    color: string,
    horizontal = false,
  ) =>
    b.extrude(points, {
      at,
      x: [1, 0, 0],
      y: horizontal ? [0, 0, 1] : [0, 1, 0],
      thickness: horizontal ? 0.024 : 0.018,
      bevel: 0.004,
      color,
      group: "colored forms",
    });

  const tinyBall = (at: readonly [number, number, number], radius: number, color: string) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      group: "counterweights",
    });

  // Calder's suspended ceiling point and the first quiet vertical thread.
  wire(top, crown, 0.009);
  tinyBall(crown, 0.024, BLACK);

  // A high, slightly off-center balancing arm.
  const armA = [-0.64, 2.54, 0.03] as const;
  const armB = [0.72, 2.54, -0.02] as const;
  wire(armA, armB, 0.012);
  tinyBall([0.03, 2.54, 0], 0.022, BLACK);

  // Central pivot and two short hangers.
  wire([0.03, 2.54, 0], [0.03, 2.33, 0], 0.007);
  wire(armA, [-0.64, 2.17, 0.03], 0.006);
  wire(armB, [0.72, 2.27, -0.02], 0.006);

  // Left: a red, irregular vertical leaf.
  polygon(
    [
      [-0.17, -0.19],
      [-0.11, -0.35],
      [0.02, -0.47],
      [0.17, -0.28],
      [0.14, 0.02],
      [0.01, 0.25],
      [-0.12, 0.11],
    ],
    [-0.64, 1.78, 0.03],
    RED,
  );
  wire([-0.64, 2.17, 0.03], [-0.64, 2.03, 0.03], 0.006);

  // A tiny yellow counterweight at the far left of the upper arm.
  polygon(
    [
      [-0.09, -0.07],
      [0.09, -0.07],
      [0.04, 0.10],
      [-0.05, 0.15],
    ],
    [-0.84, 2.45, 0.03],
    YELLOW,
    true,
  );
  wire(armA, [-0.84, 2.45, 0.03], 0.006);

  // Right: a large blue circle floating low.
  disk([0.72, 1.79, -0.02], 0.24, BLUE);
  wire([0.72, 2.27, -0.02], [0.72, 2.03, -0.02], 0.006);

  // A small red disk behind the blue one, giving the profile a second bright beat.
  disk([0.91, 1.98, -0.10], 0.105, RED_DARK);
  wire([0.72, 2.12, -0.02], [0.91, 2.09, -0.10], 0.005);

  // A lower, diagonal Calder arm hung from the central pivot.
  const lowPivot = [0.03, 2.33, 0] as const;
  const lowL = [-0.68, 2.10, -0.06] as const;
  const lowR = [0.58, 2.08, 0.05] as const;
  wire(lowL, lowR, 0.011);
  tinyBall(lowPivot, 0.018, BLACK);
  wire(lowPivot, [0.03, 2.20, 0], 0.006);

  // Left lower hanger: a yellow diamond and a thin dark red tail.
  wire(lowL, [-0.68, 1.89, -0.06], 0.006);
  polygon(
    [
      [0, 0.24],
      [0.15, 0],
      [0, -0.28],
      [-0.15, 0],
    ],
    [-0.68, 1.58, -0.06],
    YELLOW,
  );
  wire([-0.68, 1.89, -0.06], [-0.68, 1.82, -0.06], 0.005);
  disk([-0.68, 1.28, -0.06], 0.07, RED_DARK);
  wire([-0.68, 1.58, -0.06], [-0.68, 1.35, -0.06], 0.005);

  // Right lower hanger: a blue-green horizontal leaf.
  wire(lowR, [0.58, 1.84, 0.05], 0.006);
  polygon(
    [
      [-0.30, 0],
      [-0.08, 0.11],
      [0.28, 0.05],
      [0.39, -0.04],
      [0.15, -0.14],
      [-0.15, -0.11],
    ],
    [0.58, 1.51, 0.05],
    GREEN,
  );

  // A second nested arm, hung from the underside of the first arm.
  const nestedA = [-0.23, 2.32, 0.10] as const;
  const nestedB = [0.43, 2.32, 0.10] as const;
  wire([0.03, 2.33, 0], [0.03, 2.38, 0], 0.005);
  wire(nestedA, nestedB, 0.009);
  wire([0.03, 2.38, 0], [0.03, 2.32, 0.10], 0.005);

  // A purple crescent-like angular form on the left.
  polygon(
    [
      [-0.20, 0.26],
      [-0.04, 0.29],
      [0.13, 0.18],
      [0.20, 0.02],
      [0.13, -0.15],
      [-0.04, -0.28],
      [-0.18, -0.23],
      [-0.07, -0.08],
      [0.01, 0.08],
    ],
    [-0.23, 1.92, 0.10],
    PURPLE,
  );
  wire(nestedA, [-0.23, 2.12, 0.10], 0.005);

  // A small white vertical lozenge balances the purple piece.
  polygon(
    [
      [0, 0.25],
      [0.13, 0.06],
      [0.08, -0.24],
      [0, -0.34],
      [-0.08, -0.24],
      [-0.13, 0.06],
    ],
    [0.43, 1.72, 0.10],
    WHITE,
  );
  wire(nestedB, [0.43, 1.98, 0.10], 0.005);

  // A small yellow bead and red fin on the nested arm's far right.
  wire(nestedB, [0.76, 2.16, 0.10], 0.005);
  tinyBall([0.76, 2.11, 0.10], 0.055, YELLOW_DARK);
  polygon(
    [
      [-0.02, 0],
      [0.12, 0.18],
      [0.21, 0.03],
      [0.12, -0.23],
    ],
    [0.76, 1.83, 0.10],
    RED,
  );
  wire([0.76, 2.16, 0.10], [0.76, 2.03, 0.10], 0.005);

  // A tiny lower balancing arm, almost like a drawn line in space.
  const bottomPivot = [0.16, 1.95, -0.13] as const;
  const bottomLeft = [-0.18, 1.83, -0.13] as const;
  const bottomRight = [0.48, 1.84, -0.13] as const;
  wire([0.43, 1.98, 0.10], bottomPivot, 0.005);
  wire(bottomLeft, bottomRight, 0.008);
  wire(bottomPivot, [0.16, 1.89, -0.13], 0.005);

  // Orange-red flat circle at one end.
  disk([-0.18, 1.53, -0.13], 0.14, RED, false);
  wire(bottomLeft, [-0.18, 1.72, -0.13], 0.005);

  // Blue triangular flag at the other end.
  polygon(
    [
      [-0.14, 0.17],
      [0.19, 0.02],
      [-0.11, -0.20],
    ],
    [0.48, 1.51, -0.13],
    BLUE_DARK,
  );
  wire(bottomRight, [0.48, 1.71, -0.13], 0.005);

  // Two minute black beads give the silhouette the hand-balanced Calder punctuation.
  tinyBall([-0.18, 1.34, -0.13], 0.025, BLACK);
  tinyBall([0.48, 1.31, -0.13], 0.02, BLACK);

  // A small, slightly translucent-looking pale accent made as a simple colored card.
  const accent = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16 L16 3 L28 16 L16 29 Z" fill="#f4e8c8"/>
      <path d="M8 16 L16 8 L24 16 L16 24 Z" fill="#d8c79d"/>
    </svg>`,
    { size: 64 },
  );
  b.part(new THREE.PlaneGeometry(0.16, 0.16), WHITE, {
    at: [0.22, 1.34, 0.02],
    dir: [0, 0, 1],
    axis: "z",
    texture: accent,
    group: "paper accent",
  });

  return b.root;
}
```