```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, rng } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "A colorful Alexander Calder-inspired hanging mobile of balancing rods, fine suspension lines, faceted discs, and counterweights.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const RED = "#d92f35";
  const CORAL = "#f05a3c";
  const YELLOW = "#f4c542";
  const GOLD = "#e7a928";
  const BLUE = "#2367a8";
  const SKY = "#4fa6c8";
  const GREEN = "#4c9b68";
  const TEAL = "#2d9a94";
  const PURPLE = "#76458c";
  const BLACK = "#252733";
  const WHITE = "#f0e8d2";

  const metal = "#343943";
  const darkMetal = "#1d2028";

  const v = (p: readonly [number, number, number]) =>
    new THREE.Vector3(p[0], p[1], p[2]);

  function rod(
    a: readonly [number, number, number],
    c: readonly [number, number, number],
    radius = 0.012,
    color = metal,
  ) {
    return b.rod(a, c, radius, { color, caps: "round", sides: 6 });
  }

  function ball(
    p: readonly [number, number, number],
    radius: number,
    color: string,
  ) {
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      flat: true,
    });
  }

  function weight(
    p: readonly [number, number, number],
    radius: number,
    color: string,
  ) {
    return b.part(
      new THREE.IcosahedronGeometry(radius, 1),
      color,
      { at: p, flat: true },
    );
  }

  function disc(
    p: readonly [number, number, number],
    outline: [number, number][],
    color: string,
    x: readonly [number, number, number] = [1, 0, 0],
    y: readonly [number, number, number] = [0, 1, 0],
    thickness = 0.012,
  ) {
    return b.extrude(outline, {
      at: p,
      x,
      y,
      thickness,
      bevel: 0.004,
      smoothing: 1,
      color,
    });
  }

  function stringLine(
    a: readonly [number, number, number],
    c: readonly [number, number, number],
    radius = 0.004,
  ) {
    return rod(a, c, radius, darkMetal);
  }

  const leafA: [number, number][] = [
    [-0.015, -0.12],
    [0.05, -0.08],
    [0.16, 0.08],
    [0.13, 0.23],
    [0.02, 0.34],
    [-0.10, 0.21],
    [-0.14, 0.02],
  ];

  const leafB: [number, number][] = [
    [-0.02, -0.09],
    [0.13, -0.03],
    [0.28, 0.12],
    [0.23, 0.27],
    [0.05, 0.31],
    [-0.10, 0.20],
    [-0.13, 0.02],
  ];

  const diamond: [number, number][] = [
    [0, -0.22],
    [0.18, 0],
    [0.02, 0.27],
    [-0.19, 0.03],
  ];

  const fan: [number, number][] = [
    [-0.02, -0.18],
    [0.11, -0.05],
    [0.30, 0.08],
    [0.12, 0.17],
    [-0.06, 0.14],
    [-0.18, 0.02],
  ];

  // The small sculptural hook: a dark, bent Calder-like suspension stem.
  b.sweep(
    bezier(
      [0, 3.32, 0],
      [0, 3.48, 0.01],
      [0.15, 3.48, 0.01],
      [0.18, 3.31, 0],
    ),
    0.018,
    { color: darkMetal, caps: "round", sides: 7 },
  );
  b.sweep(
    catmull([
      [0.18, 3.31, 0],
      [0.22, 3.22, 0],
      [0.13, 3.12, 0],
      [0.03, 3.10, 0],
    ]),
    0.014,
    { color: darkMetal, caps: "round", sides: 7 },
  );
  ball([0, 3.32, 0], 0.035, metal);
  ball([0.03, 3.10, 0], 0.027, metal);

  // Upper suspension line and first balancing bar.
  stringLine([0.03, 3.10, 0], [0.03, 2.76, 0]);
  rod([-0.48, 2.76, 0], [0.59, 2.76, 0], 0.017, BLUE);
  ball([0.03, 2.76, 0], 0.035, darkMetal);

  // First pair: asymmetric yellow and red leaves.
  stringLine([-0.48, 2.76, 0], [-0.48, 2.42, 0]);
  disc([-0.48, 2.22, 0], leafA, YELLOW, [1, 0, 0], [0, 1, 0], 0.015);
  ball([-0.48, 2.42, 0], 0.022, darkMetal);

  stringLine([0.59, 2.76, 0], [0.59, 2.38, 0]);
  disc([0.59, 2.13, 0.02], leafB, RED, [0.96, 0.12, 0], [0, 1, 0.05], 0.014);
  ball([0.59, 2.38, 0], 0.022, darkMetal);

  // Tiny counterweight on the first bar, intentionally offset in depth.
  stringLine([0.59, 2.76, 0], [0.59, 2.76, -0.16]);
  weight([0.59, 2.76, -0.19], 0.055, GOLD);

  // Second level: a long blue cantilever suspended from the red leaf side.
  stringLine([0.59, 2.38, 0], [0.59, 1.98, 0]);
  rod([0.10, 1.98, 0], [1.08, 1.98, 0.03], 0.016, RED);
  ball([0.59, 1.98, 0], 0.032, darkMetal);

  stringLine([0.10, 1.98, 0], [0.10, 1.60, 0]);
  disc(
    [0.10, 1.39, 0.03],
    diamond,
    BLUE,
    [1, 0.08, 0],
    [0.02, 1, 0.05],
    0.016,
  );

  stringLine([1.08, 1.98, 0.03], [1.08, 1.71, 0.03]);
  disc(
    [1.08, 1.53, 0.05],
    fan,
    CORAL,
    [0.98, 0.16, 0],
    [0, 1, 0],
    0.014,
  );
  ball([1.08, 1.71, 0.03], 0.021, darkMetal);

  // Counterweight hanging behind the blue bar.
  stringLine([0.10, 1.98, 0], [-0.04, 1.98, -0.23]);
  weight([-0.08, 1.98, -0.27], 0.07, PURPLE);

  // Third level, suspended from the blue diamond: a strong horizontal red/green balance.
  stringLine([0.10, 1.60, 0], [0.10, 1.22, 0]);
  rod([-0.58, 1.22, 0.01], [0.74, 1.22, -0.02], 0.015, GOLD);
  ball([0.10, 1.22, 0], 0.031, darkMetal);

  stringLine([-0.58, 1.22, 0.01], [-0.58, 0.90, 0.01]);
  disc(
    [-0.58, 0.72, 0.02],
    leafB,
    TEAL,
    [1, 0, 0],
    [0, 1, 0.02],
    0.015,
  );

  stringLine([0.74, 1.22, -0.02], [0.74, 0.88, -0.02]);
  disc(
    [0.74, 0.67, -0.02],
    leafA,
    GREEN,
    [0.98, -0.08, 0.02],
    [0, 1, 0],
    0.014,
  );

  // A small vertical counterweight makes the balance visibly asymmetric.
  stringLine([-0.58, 1.22, 0.01], [-0.80, 1.22, 0.01]);
  weight([-0.85, 1.22, 0.01], 0.052, RED);

  // Fourth level from the green leaf: angled bar with a blue side disc and yellow pendant.
  stringLine([0.74, 0.88, -0.02], [0.74, 0.54, -0.02]);
  rod([0.28, 0.54, -0.02], [1.17, 0.54, 0.12], 0.013, PURPLE);
  ball([0.74, 0.54, -0.02], 0.027, darkMetal);

  stringLine([0.28, 0.54, -0.02], [0.28, 0.30, -0.02]);
  disc(
    [0.28, 0.16, -0.01],
    diamond,
    YELLOW,
    [0.92, 0.1, 0],
    [0, 1, 0.04],
    0.013,
  );

  stringLine([1.17, 0.54, 0.12], [1.17, 0.23, 0.12]);
  disc(
    [1.17, 0.05, 0.10],
    leafA,
    SKY,
    [0, 0, 1],
    [0, 1, 0],
    0.014,
  );

  // Sideways depth counterweight, giving the mobile a changing silhouette as it turns.
  stringLine([1.17, 0.54, 0.12], [1.35, 0.54, -0.10]);
  weight([1.40, 0.54, -0.13], 0.055, CORAL);

  // A second, independent upper branch makes the overall composition richer.
  stringLine([0.03, 2.76, 0], [-0.05, 2.76, 0.18]);
  stringLine([-0.05, 2.76, 0.18], [-0.05, 2.49, 0.18]);
  rod([-0.48, 2.49, 0.18], [0.35, 2.49, 0.18], 0.012, TEAL);
  ball([-0.05, 2.49, 0.18], 0.025, darkMetal);

  stringLine([-0.48, 2.49, 0.18], [-0.48, 2.19, 0.18]);
  disc(
    [-0.48, 2.01, 0.18],
    diamond,
    CORAL,
    [0.98, 0, 0.15],
    [0, 1, 0],
    0.013,
  );

  stringLine([0.35, 2.49, 0.18], [0.35, 2.22, 0.18]);
  disc(
    [0.35, 2.04, 0.18],
    leafA,
    WHITE,
    [0, 0, 1],
    [0, 1, 0],
    0.012,
  );

  stringLine([0.35, 2.49, 0.18], [0.54, 2.49, 0.18]);
  weight([0.59, 2.49, 0.18], 0.045, BLUE);

  // Small colored beads at a few joints emphasize the hand-built, puppet-like construction.
  ball([-0.48, 2.76, 0], 0.018, YELLOW);
  ball([0.10, 1.98, 0], 0.017, RED);
  ball([0.74, 1.22, -0.02], 0.017, SKY);
  ball([0.74, 0.54, -0.02], 0.016, GREEN);

  return b.root;
}
```