import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Chibi Axolotl",
  description: "A cute low-poly axolotl with a soft blue body, huge eyes, stubby feet, and extravagant frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const SKIN = "#86cbd0";
  const SKIN_LIGHT = "#b8edf0";
  const SKIN_DARK = "#4f9da8";
  const BELLY = "#e7f7e8";
  const PINK = "#f58fae";
  const PINK_LIGHT = "#ffc1d0";
  const PINK_DARK = "#b94f75";
  const INK = "#281c38";
  const WHITE = "#fffdf5";
  const GOLD = "#ffd86b";
  const FLOOR = "#6c9e91";

  // ---------------------------------------------------------------------------
  // Skeleton first: a relaxed, readable amphibian rest pose.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.38, -0.48],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.38, -0.48],
    [0, 0.41, -0.22],
    [0, 0.43, 0.06],
    [0, 0.48, 0.28],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "spine3", "shoulder"],
    role: "spine",
    group: "body",
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.48, 0.27],
      [0, 0.54, 0.36],
      [0, 0.6, 0.43],
    ]),
    {
      parent: spine.tip,
      count: 2,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "head",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.61, 0.43],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.5, 0.57],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "face",
  });

  const makeLeg = (
    side: "L" | "R",
    x: number,
    z: number,
    target: [number, number, number],
    names: [string, string, string],
  ) => {
    const points = limb(
      [x, 0.38, z],
      target,
      [0.18, 0.17, 0.12],
      [[0, 0, 1], [0, 0, -1]],
    );
    return b.chain(`leg${side}`, points, {
      parent: hips,
      names,
      role: "leg",
      group: "limbs",
      contact: target,
    });
  };

  const legL = makeLeg("L", 0.16, -0.22, [0.27, 0.095, 0.12], [
    "hipL",
    "kneeL",
    "ankleL",
  ]);
  const legR = makeLeg("R", -0.16, -0.22, [-0.27, 0.095, 0.12], [
    "hipR",
    "kneeR",
    "ankleR",
  ]);

  const armL = b.chain(
    "armL",
    limb(
      [0.19, 0.47, 0.23],
      [0.29, 0.13, 0.42],
      [0.15, 0.14],
      [0, 0, 1],
    ),
    {
      parent: spine.tip!,
      names: ["shoulderL", "elbowL", "handL"],
      role: "arm",
      group: "limbs",
      contact: [0.29, 0.13, 0.42],
    },
  );

  const armR = b.chain(
    "armR",
    limb(
      [-0.19, 0.47, 0.23],
      [-0.29, 0.13, 0.42],
      [0.15, 0.14],
      [0, 0, 1],
    ),
    {
      parent: spine.tip!,
      names: ["shoulderR", "elbowR", "handR"],
      role: "arm",
      group: "limbs",
      contact: [-0.29, 0.13, 0.42],
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.39, -0.5],
      [0, 0.36, -0.78],
      [0, 0.31, -1.05],
      [0, 0.24, -1.31],
      [0, 0.17, -1.5],
    ]),
    {
      parent: hips,
      count: 5,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // Body and tail: chunky, soft, and slightly flattened like a plush toy.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.245 - t * 0.045, {
    color: SKIN,
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "soft-body",
    sectors: [[125, 235, BELLY]],
  });

  b.sweep(tail, (t) => 0.16 * (1 - t) + 0.018, {
    color: SKIN,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "tapered-tail",
    bands: [
      [0.72, SKIN_DARK],
      [0.9, SKIN_LIGHT],
      [1, PINK_LIGHT],
    ],
  });

  // Broad belly patch, a deliberately simple lighter under-surface.
  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BELLY,
    {
      bone: hips,
      at: [0, 0.34, -0.02],
      scale: [0.19, 0.17, 0.36],
      name: "belly-patch",
      group: "body",
    },
  );

  // Head: oversized and rounded.
  const skull = b.part(
    new THREE.SphereGeometry(1, 16, 10),
    SKIN_LIGHT,
    {
      bone: head,
      at: [0, 0.63, 0.47],
      scale: [0.31, 0.27, 0.3],
      name: "big-round-head",
      group: "head",
    },
  );

  // Soft cheek pads give the head a very readable axolotl silhouette.
  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(1, 10, 7),
      SKIN_LIGHT,
      {
        bone: head,
        at: [s * 0.205, 0.56, 0.56],
        scale: [0.15, 0.14, 0.16],
        name: `cheek-${s}`,
        group: "face",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Legs and arms: short, rounded, with oversized webbed-looking toes.
  // ---------------------------------------------------------------------------

  const legLimb = b.sweep(legL, [0.075, 0.055], {
    color: SKIN_DARK,
    section: { ngon: 6 },
    skin: "smooth",
    group: "limbs",
    name: "left-leg",
  });
  const legRlimb = b.sweep(legR, [0.075, 0.055], {
    color: SKIN_DARK,
    section: { ngon: 6 },
    skin: "smooth",
    group: "limbs",
    name: "right-leg",
  });

  const armLimb = b.sweep(armL, [0.055, 0.035], {
    color: SKIN,
    section: { ngon: 6 },
    skin: "smooth",
    group: "limbs",
    name: "left-arm",
  });
  const armRlimb = b.sweep(armR, [0.055, 0.035], {
    color: SKIN,
    section: { ngon: 6 },
    skin: "smooth",
    group: "limbs",
    name: "right-arm",
  });

  const footToe = (p: any, side: number, i: number) => {
    const spread = (i - 1) * 0.045;
    const tip = p.moved([side * spread, -0.05, 0.055 + Math.abs(i - 1) * 0.012]);
    b.spike(p, tip, null, 0.025, {
      color: SKIN_LIGHT,
      caps: "round",
      name: `foot-toe-${side}-${i}`,
      group: "limbs",
    });
  };

  for (const [chain, side] of [[legL, 1], [legR, -1]] as const) {
    const foot = chain.at(1);
    for (let i = 0; i < 3; i++) footToe(foot, side, i);
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      SKIN_LIGHT,
      {
        bone: chain.tip!,
        at: chain.tip!.at,
        scale: [0.095, 0.055, 0.11],
        name: `foot-pad-${side}`,
        group: "limbs",
      },
    );
  }

  for (const [chain, side] of [[armL, 1], [armR, -1]] as const) {
    const hand = chain.tip!;
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      SKIN_LIGHT,
      {
        bone: hand,
        at: hand.at,
        scale: [0.075, 0.05, 0.07],
        name: `hand-${side}`,
        group: "limbs",
      },
    );
    for (let i = 0; i < 3; i++) {
      const x = side * (0.025 + i * 0.025);
      b.spike(
        hand,
        [hand.at.x + x, hand.at.y - 0.025, hand.at.z + 0.055],
        null,
        0.014,
        {
          color: SKIN_LIGHT,
          caps: "round",
          name: `finger-${side}-${i}`,
          group: "limbs",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Face: large shiny eyes, tiny nostrils, and a separate smiling jaw.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const eyeAt: [number, number, number] = [s * 0.125, 0.72, 0.695];

    b.part(
      new THREE.SphereGeometry(1, 10, 8),
      INK,
      {
        bone: head,
        at: eyeAt,
        scale: [0.073, 0.09, 0.042],
        name: `large-eye-${s}`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      GOLD,
      {
        bone: head,
        at: [s * 0.125, 0.715, 0.733],
        scale: [0.038, 0.055, 0.018],
        name: `golden-iris-${s}`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      INK,
      {
        bone: head,
        at: [s * 0.125, 0.715, 0.75],
        scale: [0.014, 0.034, 0.012],
        name: `pupil-${s}`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      WHITE,
      {
        bone: head,
        at: [s * 0.101, 0.754, 0.765],
        scale: [0.019, 0.023, 0.009],
        name: `eye-highlight-${s}`,
        group: "face",
      },
    );

    // Small pink cheek freckles.
    for (let i = 0; i < 3; i++) {
      b.part(
        new THREE.SphereGeometry(1, 6, 4),
        PINK_LIGHT,
        {
          bone: head,
          at: [s * (0.19 + i * 0.025), 0.57 + (i % 2) * 0.018, 0.695],
          scale: [0.012, 0.009, 0.006],
          name: `cheek-freckle-${s}-${i}`,
          group: "face",
        },
      );
    }
  }

  // Nostrils sit high on the short muzzle.
  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      INK,
      {
        bone: head,
        at: [s * 0.045, 0.61, 0.763],
        scale: [0.014, 0.009, 0.008],
        name: `nostril-${s}`,
        group: "face",
      },
    );
  }

  // Open, separate upper and lower mouth pieces.
  const mouthPath = catmull([
    [-0.095, 0.535, 0.765],
    [0, 0.515, 0.782],
    [0.095, 0.535, 0.765],
  ]);
  b.sweep(mouthPath, 0.012, {
    color: INK,
    bone: jaw,
    section: { ngon: 5 },
    caps: "round",
    group: "face",
    name: "smiling-mouth",
  });

  const lowerLip = b.part(
    new THREE.SphereGeometry(1, 9, 5),
    PINK,
    {
      bone: jaw,
      at: [0, 0.495, 0.77],
      scale: [0.105, 0.035, 0.055],
      name: "lower-jaw",
      group: "face",
    },
  );

  // Two tiny front teeth-like pale dots make the smile extra expressive.
  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(1, 5, 4),
      WHITE,
      {
        bone: jaw,
        at: [s * 0.035, 0.525, 0.786],
        scale: [0.012, 0.018, 0.008],
        name: `mouth-glint-${s}`,
        group: "face",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Signature frilly external gills.
  // Each side has a dark pink root and three branching, tapered pink filaments.
  // ---------------------------------------------------------------------------

  const gillRoot = (side: number, z: number, y: number, i: number) => {
    const root: [number, number, number] = [side * 0.265, y, z];

    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      PINK_DARK,
      {
        bone: head,
        at: root,
        scale: [0.055, 0.075, 0.09],
        name: `gill-root-${side}-${i}`,
        group: "gills",
      },
    );

    const sweepA = b.sweep(
      catmull([
        root,
        [side * 0.34, y + 0.045, z + 0.015],
        [side * 0.43, y + 0.12, z - 0.005],
        [side * 0.48, y + 0.19, z - 0.02],
      ]),
      [0.027, 0.008],
      {
        color: PINK,
        bone: head,
        caps: { start: "round", end: "point" },
        section: { ngon: 6 },
        group: "gills",
        name: `gill-main-${side}-${i}`,
      },
    );

    const forkBase = sweepA.at(0.48);
    b.sweep(
      catmull([
        forkBase.at,
        [side * 0.46, y + 0.16, z + 0.055],
        [side * 0.43, y + 0.235, z + 0.095],
      ]),
      [0.017, 0.004],
      {
        color: PINK_LIGHT,
        bone: head,
        caps: { start: "round", end: "point" },
        section: { ngon: 5 },
        group: "gills",
        name: `gill-fork-upper-${side}-${i}`,
      },
    );

    b.sweep(
      catmull([
        forkBase.at,
        [side * 0.49, y + 0.12, z - 0.045],
        [side * 0.51, y + 0.17, z - 0.1],
      ]),
      [0.015, 0.003],
      {
        color: PINK_LIGHT,
        bone: head,
        caps: { start: "round", end: "point" },
        section: { ngon: 5 },
        group: "gills",
        name: `gill-fork-lower-${side}-${i}`,
      },
    );

    // Small flat triangular ruffles between the filaments.
    b.slab(
      [
        [side * 0.29, y + 0.025, z + 0.02],
        [side * 0.4, y + 0.12, z + 0.07],
        [side * 0.38, y + 0.17, z - 0.015],
      ],
      {
        color: PINK_LIGHT,
        thickness: 0.012,
        bone: head,
        name: `gill-frill-${side}-${i}`,
        group: "gills",
      },
    );
  };

  for (const side of [-1, 1]) {
    gillRoot(side, 0.57, 0.66, 0);
    gillRoot(side, 0.48, 0.62, 1);
    gillRoot(side, 0.39, 0.59, 2);
  }

  // A few pale ridges on the back suggest soft amphibian texture.
  for (let i = 0; i < 5; i++) {
    const z = -0.55 + i * 0.18;
    b.part(
      new THREE.SphereGeometry(1, 7, 4),
      SKIN_LIGHT,
      {
        bone: hips,
        at: [0, 0.59 - i * 0.018, z],
        scale: [0.035, 0.026, 0.055],
        name: `back-ridge-${i}`,
        group: "body",
      },
    );
  }

  // A tiny decorative tail spot.
  b.part(
    new THREE.SphereGeometry(1, 7, 4),
    PINK_LIGHT,
    {
      bone: tail.tip!,
      at: tail.tip!.at,
      scale: [0.028, 0.022, 0.04],
      name: "tail-tip-mark",
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // Simple contact shadow / presentation pebble kept within the subject footprint.
  // ---------------------------------------------------------------------------

  b.part(
    new THREE.CylinderGeometry(0.42, 0.5, 0.018, 16),
    FLOOR,
    {
      at: [0, 0.008, -0.2],
      scale: [1, 0.35, 1.55],
      name: "small-water-shadow",
      group: "ground",
    },
  );

  return b.root;
}
