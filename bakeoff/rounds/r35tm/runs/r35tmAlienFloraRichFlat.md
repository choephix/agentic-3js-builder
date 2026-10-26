```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, glow } from "agentic-3js-builder";

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "A stylized Avatar-inspired alien plant with a braided indigo stalk, luminous cyan veins, broad neon leaves, curling tendrils, floating seed-lights, and a radiant crown flower.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const INK = "#17133f";
  const TRUNK = "#29236e";
  const TRUNK_LIGHT = "#49389b";
  const ROOT = "#201a58";
  const ROOT_GLOW = "#3f64c4";
  const LEAF = "#176b9a";
  const LEAF_DARK = "#123d78";
  const LEAF_LIGHT = "#2cc5bd";
  const CYAN = "#6effef";
  const AQUA = "#32f4dc";
  const BLUE = "#3e9cff";
  const VIOLET = "#7656e8";
  const PURPLE = "#ae55e8";
  const MAGENTA = "#ff55c7";
  const PINK = "#ff9be8";
  const CORE = "#dfffff";
  const GOLD = "#c8ff82";

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const arr = (p: THREE.Vector3): [number, number, number] => [p.x, p.y, p.z];

  function addOrb(
    at: THREE.Vector3,
    radius: number,
    color: string,
    luminous = true,
    segments = 8,
  ) {
    const part = b.part(
      new THREE.SphereGeometry(radius, segments, Math.max(4, Math.floor(segments * 0.7))),
      color,
      { at, flat: true, name: "seed-light" },
    );
    if (luminous) glow(part, 2.2);
    return part;
  }

  function addStem(
    points: THREE.Vector3[],
    radii: number | number[],
    color: string,
    luminous = false,
    name = "stem",
  ) {
    const stem = b.sweep(
      catmull(points.map(arr)),
      radii,
      {
        color,
        sides: 7,
        caps: "round",
        name,
        group: "plant-stems",
      },
    );
    if (luminous) glow(stem, 1.35);
    return stem;
  }

  function addLeaf(
    base: THREE.Vector3,
    direction: THREE.Vector3,
    width: number,
    length: number,
    color: string,
    veinColor: string,
    luminous = false,
    name = "alien-leaf",
  ) {
    const d = direction.clone().normalize();
    const side = new THREE.Vector3(0, 1, 0).cross(d);
    if (side.lengthSq() < 0.01) side.set(1, 0, 0);
    side.normalize();

    const outline: [number, number, "sharp"][] = [
      [-width * 0.08, 0, "sharp"],
      [width * 0.38, length * 0.18, "sharp"],
      [width * 0.5, length * 0.48, "sharp"],
      [width * 0.22, length * 0.78, "sharp"],
      [0, length, "sharp"],
      [-width * 0.22, length * 0.78, "sharp"],
      [-width * 0.5, length * 0.48, "sharp"],
      [-width * 0.38, length * 0.18, "sharp"],
    ];

    const leaf = b.extrude(outline, {
      at: base,
      x: arr(side),
      y: arr(d),
      thickness: [0.012, 0.004],
      bevel: 0.006,
      smoothing: 1,
      color,
      group: "plant-leaves",
      name,
    });

    if (luminous) glow(leaf, 0.65);

    const tip = base.clone().addScaledVector(d, length * 0.96);
    const veinStart = base.clone().addScaledVector(d, 0.035);
    const vein = b.rod(veinStart, tip, 0.008, {
      color: veinColor,
      caps: "round",
      name: `${name}-central-vein`,
      group: "bioluminescent-veins",
    });
    glow(vein, 2.3);

    const sideA = base.clone().addScaledVector(d, length * 0.32);
    const sideB = base.clone().addScaledVector(d, length * 0.57);
    const branch1 = sideA.clone().addScaledVector(side, width * 0.31);
    const branch2 = sideA.clone().addScaledVector(side, -width * 0.31);
    const branch3 = sideB.clone().addScaledVector(side, width * 0.2);
    const branch4 = sideB.clone().addScaledVector(side, -width * 0.2);

    for (const [a, c] of [
      [sideA, branch1],
      [sideA, branch2],
      [sideB, branch3],
      [sideB, branch4],
    ] as [THREE.Vector3, THREE.Vector3][]) {
      const twig = b.rod(a, c, 0.0045, {
        color: veinColor,
        caps: "round",
        name: `${name}-vein`,
        group: "bioluminescent-veins",
      });
      glow(twig, 1.8);
    }

    return leaf;
  }

  function addTendril(
    points: THREE.Vector3[],
    color: string,
    radius: number,
    name: string,
  ) {
    const tendril = b.sweep(
      bezier(
        arr(points[0]),
        arr(points[1]),
        arr(points[2]),
        arr(points[3]),
      ),
      [radius, radius * 0.55],
      {
        color,
        sides: 6,
        caps: { start: "round", end: "point" },
        name,
        group: "curling-tendrils",
      },
    );
    glow(tendril, 2.1);
    addOrb(points[3], radius * 1.7, CYAN, true, 7);
    return tendril;
  }

  // Low, angular root crown. The roots are chunky and visibly grip the floor.
  const rootEnds = [
    V(0.34, 0.035, 0.08),
    V(-0.36, 0.035, 0.02),
    V(0.16, 0.035, -0.36),
    V(-0.2, 0.035, -0.31),
    V(0.53, 0.035, -0.18),
    V(-0.53, 0.035, -0.12),
  ];

  for (let i = 0; i < rootEnds.length; i++) {
    const end = rootEnds[i];
    const mid = end.clone().multiplyScalar(0.56).add(V(0, 0.06, 0));
    addStem(
      [V(0, 0.075, -0.02), mid, end],
      [0.075, 0.045, 0.012],
      i % 2 ? ROOT : ROOT_GLOW,
      i === 1 || i === 4,
      `root-${i}`,
    );
    if (i === 1 || i === 4) addOrb(end.clone().add(V(0, 0.018, 0)), 0.025, AQUA);
  }

  // Main stalk: a faceted, subtly leaning trunk with a luminous central seam.
  const stalkPath = [
    V(0, 0.06, 0),
    V(-0.025, 0.32, 0.01),
    V(0.045, 0.65, -0.005),
    V(-0.02, 0.98, 0.02),
    V(0.04, 1.28, 0.01),
    V(0, 1.54, 0.03),
  ];
  const stalk = addStem(stalkPath, [0.12, 0.115, 0.1, 0.082, 0.06, 0.035], TRUNK, false, "main-stalk");

  // Raised ridges spiral over the stalk, giving the plant a graphic Avatar silhouette.
  const ridgeA = addStem(
    [
      V(-0.08, 0.12, 0.08),
      V(0.085, 0.38, 0.07),
      V(-0.065, 0.67, 0.06),
      V(0.06, 0.93, 0.05),
      V(-0.035, 1.22, 0.05),
      V(0.02, 1.48, 0.04),
    ],
    [0.014, 0.012, 0.011, 0.009, 0.007, 0.003],
    TRUNK_LIGHT,
    false,
    "spiral-ridge-a",
  );
  const ridgeB = addStem(
    [
      V(0.075, 0.12, 0.035),
      V(-0.07, 0.37, 0.045),
      V(0.07, 0.63, 0.045),
      V(-0.055, 0.9, 0.045),
      V(0.04, 1.17, 0.04),
      V(0.01, 1.43, 0.035),
    ],
    [0.01, 0.009, 0.008, 0.007, 0.005, 0.002],
    VIOLET,
    false,
    "spiral-ridge-b",
  );

  // Symmetrical lower leaf fans.
  const lowerLeaves: Array<[THREE.Vector3, THREE.Vector3, number, number]> = [
    [V(-0.045, 0.34, 0.01), V(0.95, 0.22, 0.15), 0.28, 0.62],
    [V(0.035, 0.38, 0.0), V(-0.95, 0.25, 0.12), 0.28, 0.65],
    [V(-0.025, 0.51, 0.01), V(0.35, 0.2, 0.95), 0.24, 0.58],
    [V(0.025, 0.55, 0.0), V(-0.3, 0.25, 0.98), 0.24, 0.58],
    [V(-0.02, 0.78, 0.02), V(0.92, 0.35, -0.34), 0.31, 0.69],
    [V(0.02, 0.83, 0.02), V(-0.92, 0.32, -0.31), 0.31, 0.69],
  ];

  lowerLeaves.forEach(([base, dir, width, length], i) => {
    addLeaf(
      base,
      dir,
      width,
      length,
      i % 3 === 0 ? LEAF_LIGHT : LEAF,
      i % 2 ? AQUA : CYAN,
      i % 2 === 0,
      `lower-leaf-${i}`,
    );
  });

  // Long upper leaves create the unmistakable exotic plant silhouette.
  const upperLeaves: Array<[THREE.Vector3, THREE.Vector3, number, number]> = [
    [V(0.01, 0.91, 0.01), V(1.0, 0.45, 0.02), 0.36, 0.84],
    [V(-0.015, 0.96, 0.02), V(-1.0, 0.42, 0.04), 0.36, 0.88],
    [V(0.025, 1.1, 0.015), V(0.38, 0.7, 0.82), 0.32, 0.72],
    [V(-0.015, 1.13, 0.02), V(-0.38, 0.72, 0.82), 0.32, 0.74],
    [V(0.01, 1.27, 0.025), V(0.7, 0.8, -0.38), 0.28, 0.7],
    [V(0.0, 1.31, 0.025), V(-0.7, 0.8, -0.4), 0.28, 0.7],
  ];

  upperLeaves.forEach(([base, dir, width, length], i) => {
    addLeaf(
      base,
      dir,
      width,
      length,
      i % 2 ? LEAF_DARK : LEAF_LIGHT,
      i % 2 ? BLUE : AQUA,
      true,
      `upper-leaf-${i}`,
    );
  });

  // Small bioluminescent beads run up the stalk like a living circuit.
  const beads = [
    V(0.085, 0.2, 0.075),
    V(-0.085, 0.31, 0.075),
    V(0.08, 0.46, 0.07),
    V(-0.07, 0.61, 0.07),
    V(0.065, 0.77, 0.065),
    V(-0.06, 0.93, 0.06),
    V(0.048, 1.08, 0.055),
    V(-0.04, 1.23, 0.05),
    V(0.02, 1.39, 0.045),
  ];
  beads.forEach((p, i) => addOrb(p, i % 3 === 0 ? 0.026 : 0.018, i % 2 ? CYAN : AQUA));

  // Side tendrils curl outward and end in glowing seed bulbs.
  addTendril(
    [V(0.06, 0.45, 0), V(0.35, 0.49, 0.12), V(0.64, 0.35, 0.2), V(0.55, 0.18, 0.38)],
    AQUA,
    0.016,
    "right-lower-tendril",
  );
  addTendril(
    [V(-0.06, 0.58, 0.01), V(-0.34, 0.7, 0.08), V(-0.62, 0.61, 0.2), V(-0.7, 0.42, 0.08)],
    CYAN,
    0.014,
    "left-middle-tendril",
  );
  addTendril(
    [V(0.04, 0.9, 0.02), V(0.27, 1.02, -0.06), V(0.48, 1.18, -0.15), V(0.39, 1.37, -0.25)],
    BLUE,
    0.012,
    "right-upper-tendril",
  );
  addTendril(
    [V(-0.035, 1.02, 0.02), V(-0.25, 1.15, -0.04), V(-0.43, 1.3, 0.04), V(-0.35, 1.48, 0.16)],
    PURPLE,
    0.011,
    "left-upper-tendril",
  );

  // Crown stem and a luminous flower with six angular petals.
  const crownBase = V(0, 1.48, 0.03);
  const crownCenter = V(0, 1.73, 0.08);
  addStem(
    [crownBase, V(0.015, 1.59, 0.04), crownCenter],
    [0.035, 0.025, 0.018],
    TRUNK_LIGHT,
    false,
    "flower-stem",
  );

  const petalDirections = [
    V(0, 0.92, 0.18),
    V(0.72, 0.62, 0.22),
    V(0.82, 0.58, -0.08),
    V(0, 0.84, -0.28),
    V(-0.82, 0.58, -0.08),
    V(-0.72, 0.62, 0.22),
  ];

  petalDirections.forEach((dir, i) => {
    addLeaf(
      crownCenter.clone().addScaledVector(dir.clone().normalize(), 0.015),
      dir,
      0.19,
      0.38,
      i % 2 ? PURPLE : MAGENTA,
      i % 2 ? PINK : CYAN,
      true,
      `crown-petal-${i}`,
    );
  });

  addOrb(crownCenter, 0.075, CORE, true, 10);
  addOrb(crownCenter.clone().add(V(0, 0.055, 0.015)), 0.035, GOLD, true, 8);

  // Crown stamens: thin luminous rods with bead-like tips.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const base = crownCenter.clone().add(V(Math.cos(a) * 0.025, 0.025, Math.sin(a) * 0.025));
    const tip = crownCenter.clone().add(V(Math.cos(a) * 0.12, 0.12 + (i % 2) * 0.035, Math.sin(a) * 0.12));
    const stamen = b.rod(base, tip, 0.005, {
      color: CYAN,
      caps: "round",
      name: "flower-stamen",
      group: "flower-details",
    });
    glow(stamen, 2.8);
    addOrb(tip, 0.016, GOLD, true, 7);
  }

  // A few floating spores hover just above the crown, keeping the plant grounded but magical.
  const spores = [
    V(0.18, 1.91, 0.14),
    V(-0.2, 1.98, 0.04),
    V(0.03, 2.05, -0.08),
    V(0.31, 1.82, -0.16),
    V(-0.34, 1.86, 0.2),
  ];
  spores.forEach((p, i) => {
    addOrb(p, i === 2 ? 0.028 : 0.018, i % 2 ? PINK : CYAN, true, 7);
    const filament = b.rod(
      p.clone().add(V(0, -0.025, 0)),
      p.clone().add(V(0, -0.09, 0)),
      0.0025,
      {
        color: VIOLET,
        caps: "round",
        name: "spore-filament",
        group: "floating-spores",
      },
    );
    glow(filament, 1.4);
  });

  // Small translucent-looking color blocks around the root suggest alien mineral symbiosis.
  const crystals = [
    [V(0.2, 0.055, -0.23), V(0.06, 0.16, 0.04), BLUE],
    [V(-0.28, 0.055, -0.16), V(0.05, 0.12, 0.04), PURPLE],
    [V(0.38, 0.05, 0.05), V(0.045, 0.1, 0.035), CYAN],
    [V(-0.42, 0.05, 0.08), V(0.04, 0.13, 0.035), MAGENTA],
  ] as [THREE.Vector3, THREE.Vector3, string][];

  crystals.forEach(([at, scale, color], i) => {
    const crystal = b.part(
      new THREE.ConeGeometry(1, 1, 6),
      color,
      {
        at: at.clone().add(V(0, scale.y * 0.5, 0)),
        scale: [scale.x, scale.y, scale.z],
        flat: true,
        name: `root-crystal-${i}`,
        group: "symbiotic-crystals",
      },
    );
    glow(crystal, 1.1);
  });

  return b.root;
}
```