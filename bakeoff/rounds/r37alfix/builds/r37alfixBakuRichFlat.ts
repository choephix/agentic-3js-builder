import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb } from "../../../../src/index";

export const meta = {
  name: "Baku — Dream-Eating Tapir Spirit",
  description:
    "A chunky ukiyo-e woodblock baku with a long tapir trunk, striped hindquarters, ink-dark mane, curling dream wisps, and a moonlit indigo palette.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  const INK = "#17152b";
  const NIGHT = "#282650";
  const INDIGO = "#3c4380";
  const BLUE = "#6678b4";
  const CREAM = "#e8d6a4";
  const PALE = "#f5e8bd";
  const RUSSET = "#a94f3f";
  const RUST_DARK = "#713141";
  const GOLD = "#d59b45";
  const RED = "#c94c48";
  const DREAM = "#90c9c1";
  const WHITE = "#fff2c9";

  const rngLocal = rng(19);

  // ---------------------------------------------------------------------------
  // Skeleton: a low, broad quadruped in a calm, readable rest pose.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.88, -0.05],
    dir: [0, 0.02, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.88, -0.38],
    [0, 0.98, -0.08],
    [0, 1.04, 0.26],
    [0, 1.08, 0.48],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineRear", "spineMid", "spineFront", "shoulders"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 1.08, 0.43],
    [0, 1.19, 0.58],
    [0, 1.31, 0.72],
    [0, 1.39, 0.79],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.tip!,
    names: ["neckBase", "neckMid", "neckTop", "neckTip"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.42, 0.82],
    dir: [0, -0.03, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.35, 0.92],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "face",
  });

  // Legs use explicit IK points, with short sturdy tapir proportions.
  const legTargets = [
    { s: 1, side: "L", rear: true, foot: [0.28, 0.15, -0.34] as [number, number, number] },
    { s: -1, side: "R", rear: true, foot: [-0.28, 0.15, -0.34] as [number, number, number] },
    { s: 1, side: "L", rear: false, foot: [0.30, 0.15, 0.32] as [number, number, number] },
    { s: -1, side: "R", rear: false, foot: [-0.30, 0.15, 0.32] as [number, number, number] },
  ];

  const legs: { chain: any; rear: boolean; s: number; foot: [number, number, number] }[] = [];

  for (const item of legTargets) {
    const root: [number, number, number] = [
      item.s * (item.rear ? 0.31 : 0.27),
      item.rear ? 0.91 : 0.98,
      item.rear ? -0.27 : 0.28,
    ];

    const pts = limb(
      root,
      item.foot,
      [0.34, 0.31, 0.22],
      [
        [0, 0, item.rear ? -1 : 1],
        [0, 0, item.rear ? 1 : -1],
      ],
      { sole: [0, 1, 0] },
    );

    const chain = b.chain(`leg${item.side}${item.rear ? "Hind" : "Fore"}`, pts, {
      parent: hips,
      names: [
        `${item.rear ? "hip" : "shoulder"}${item.side}`,
        `${item.rear ? "knee" : "elbow"}${item.side}`,
        `${item.rear ? "hock" : "wrist"}${item.side}`,
        `${item.rear ? "ankle" : "paw"}${item.side}`,
      ],
      role: "leg",
      contact: item.foot,
    });

    legs.push({ chain, rear: item.rear, s: item.s, foot: item.foot });
  }

  // A little curled tail, visible behind the rump.
  const tailPath = bezier(
    [0.03, 1.02, -0.45],
    [0.02, 1.12, -0.72],
    [0.12, 1.22, -0.86],
    [0.22, 1.10, -0.90],
  );
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });

  // ---------------------------------------------------------------------------
  // Main body masses, all intentionally faceted and blocky.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.27 + 0.045 * Math.sin(t * Math.PI), {
    color: RUSSET,
    section: { ngon: 8 },
    sides: 8,
    name: "broad russet body",
    group: "body",
    sectors: [
      [112, 248, CREAM],
      [-48, 48, NIGHT],
    ],
  });

  const neckTube = b.sweep(neck, [0.19, 0.16], {
    color: NIGHT,
    section: { ngon: 8 },
    name: "ink blue neck",
    group: "body",
    sectors: [[105, 255, INDIGO]],
  });

  b.sweep(tail, [0.12, 0.018], {
    color: RUST_DARK,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "curling tail",
    group: "tail",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, (t) => 0.105 - t * 0.035, {
      color: leg.rear ? RUSSET : NIGHT,
      section: { ngon: 7 },
      name: `${leg.rear ? "hind" : "front"} leg`,
      group: "legs",
    });

    const paw = b.part(
      new THREE.BoxGeometry(0.19, 0.12, 0.27),
      INK,
      {
        bone: leg.chain.tip,
        at: leg.foot,
        scale: [1, 1, 1],
        name: "square ink paw",
        group: "legs",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.145, 0.035, 0.205),
      CREAM,
      {
        bone: leg.chain.tip,
        at: [leg.foot[0], 0.105, leg.foot[2] + 0.018],
        name: "pale paw sole",
        group: "legs",
      },
    );

    for (let toe = -1; toe <= 1; toe++) {
      b.part(
        new THREE.SphereGeometry(0.027, 6, 4),
        GOLD,
        {
          bone: leg.chain.tip,
          at: [
            leg.foot[0] + toe * 0.045,
            0.125,
            leg.foot[2] + 0.12,
          ],
          name: "golden toe",
          group: "legs",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Head and the unmistakable long tapir muzzle.
  // ---------------------------------------------------------------------------

  const skull = b.part(
    new THREE.SphereGeometry(0.24, 10, 7),
    NIGHT,
    {
      bone: head,
      at: [0, 1.43, 0.84],
      scale: [1.02, 0.9, 1.0],
      name: "faceted spirit skull",
      group: "head",
    },
  );

  const forehead = b.part(
    new THREE.SphereGeometry(0.18, 8, 6),
    INDIGO,
    {
      bone: head,
      at: [0, 1.51, 0.91],
      scale: [1.05, 0.8, 0.8],
      name: "blue forehead",
      group: "head",
    },
  );

  const muzzlePath = catmull([
    [0, 1.40, 0.91],
    [0, 1.35, 1.08],
    [0, 1.31, 1.23],
    [0, 1.29, 1.34],
  ]);

  const muzzle = b.sweep(muzzlePath, (t) => 0.15 - t * 0.045, {
    color: CREAM,
    section: { ngon: 8 },
    name: "long cream tapir trunk",
    group: "face",
  });

  const lowerJawPath = catmull([
    [0, 1.34, 0.98],
    [0, 1.28, 1.11],
    [0, 1.25, 1.27],
    [0, 1.25, 1.34],
  ]);

  b.sweep(lowerJawPath, [0.11, 0.045], {
    color: PALE,
    bone: jaw,
    section: { ngon: 7 },
    caps: "round",
    name: "separate lower jaw",
    group: "face",
  });

  b.part(
    new THREE.SphereGeometry(0.075, 8, 5),
    INK,
    {
      bone: jaw,
      at: [0, 1.27, 1.36],
      scale: [1.25, 0.55, 0.7],
      name: "dream snout nose",
      group: "face",
    },
  );

  // Nose bridge stripe, like a carved woodblock highlight.
  b.part(
    new THREE.BoxGeometry(0.075, 0.025, 0.22),
    GOLD,
    {
      bone: head,
      at: [0, 1.49, 1.09],
      rotation: [0, 0, 0],
      name: "nose bridge print",
      group: "face",
    },
  );

  // Eyes: large, graphic, and slightly mysterious.
  for (const s of [-1, 1]) {
    const eyeOuter = b.part(
      new THREE.SphereGeometry(0.062, 8, 5),
      INK,
      {
        bone: head,
        at: [s * 0.145, 1.48, 1.005],
        scale: [1.0, 1.1, 0.55],
        name: `ink eye ${s}`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.039, 8, 5),
      GOLD,
      {
        bone: head,
        at: [s * 0.145, 1.48, 1.037],
        scale: [1.0, 1.12, 0.38],
        name: `amber eye ${s}`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      INK,
      {
        bone: head,
        at: [s * 0.145, 1.48, 1.06],
        scale: [0.7, 1.35, 0.45],
        name: `black pupil ${s}`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.009, 5, 3),
      WHITE,
      {
        bone: head,
        at: [s * 0.132, 1.501, 1.075],
        name: `eye glint ${s}`,
        group: "face",
      },
    );

    // Heavy carved brow.
    b.rod(
      [s * 0.19, 1.57, 0.99],
      [s * 0.105, 1.59, 1.02],
      0.018,
      INK,
      { bone: head, name: "strong brow", group: "face" },
    );
  }

  // Tapir ears: broad, rounded leaf slabs, with dark outer and pale inner layers.
  const earOutline: [number, number, "sharp"][] = [
    [-0.12, -0.02, "sharp"],
    [-0.15, 0.15, "sharp"],
    [-0.09, 0.30, "sharp"],
    [0.02, 0.23, "sharp"],
    [0.09, 0.05, "sharp"],
    [0.04, -0.03, "sharp"],
  ];

  for (const s of [-1, 1]) {
    const ear = b.extrude(earOutline, {
      at: [s * 0.17, 1.58, 0.80],
      x: [s, 0, 0],
      y: [0, 0.86, 0.18],
      thickness: 0.055,
      bevel: 0.012,
      color: INK,
      bone: head,
      name: `pointed ear ${s}`,
      group: "head",
    });

    b.extrude(
      [
        [-0.07, 0.01, "sharp"],
        [-0.095, 0.13, "sharp"],
        [-0.045, 0.22, "sharp"],
        [0.025, 0.16, "sharp"],
        [0.055, 0.045, "sharp"],
      ],
      {
        at: [s * 0.175, 1.585, 0.83],
        x: [s, 0, 0],
        y: [0, 0.86, 0.18],
        thickness: 0.012,
        color: RUSSET,
        bone: head,
        name: `rust inner ear ${s}`,
        group: "head",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Mane, shoulder markings, and woodblock-like body stripes.
  // ---------------------------------------------------------------------------

  const manePath = catmull([
    [0, 1.54, 0.58],
    [0, 1.48, 0.39],
    [0, 1.35, 0.20],
    [0, 1.19, 0.03],
    [0, 1.10, -0.22],
  ]);

  const mane = b.sweep(manePath, (t) => 0.09 - t * 0.06, {
    color: INK,
    section: { ngon: 6 },
    name: "ink black neck mane",
    group: "mane",
  });

  // Mane blades give the silhouette a carved, flame-like edge.
  for (let i = 0; i < 7; i++) {
    const z = 0.48 - i * 0.105;
    const y = 1.48 - i * 0.055;
    b.spike(
      [0, y, z],
      [0, 0.22, -0.12],
      0.16 - i * 0.009,
      0.045,
      { color: INK, bone: spine.tip, name: "mane blade", group: "mane" },
    );
  }

  // Broad cream rump saddle.
  b.part(
    new THREE.SphereGeometry(0.30, 9, 6),
    CREAM,
    {
      bone: spine.joints[0],
      at: [0, 0.98, -0.24],
      scale: [1.0, 0.82, 0.62],
      name: "cream rump saddle",
      group: "markings",
    },
  );

  // Vertical russet and indigo rump bands, deliberately graphic.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.072;
    b.part(
      new THREE.BoxGeometry(0.034, 0.28, 0.018),
      i % 2 === 0 ? RUST_DARK : INDIGO,
      {
        bone: spine.joints[0],
        at: [x, 1.07, -0.455],
        rotation: [Math.PI * 0.11, 0, i * 0.035],
        name: "woodblock rump stripe",
        group: "markings",
      },
    );
  }

  // Shoulder fan lines.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.rod(
        [s * (0.13 + i * 0.035), 1.19, 0.34 - i * 0.018],
        [s * (0.25 + i * 0.018), 1.04, 0.28 - i * 0.015],
        0.012,
        GOLD,
        { bone: spine.tip!, name: "gold shoulder cut", group: "markings" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Dream spirit ornament: three curling wisps behind the head.
  // ---------------------------------------------------------------------------

  const cloudWisp = (s: number, y: number, z: number, scale: number, color: string) => {
    const p = catmull([
      [s * 0.06, y, z],
      [s * 0.22, y + 0.08 * scale, z - 0.04],
      [s * 0.36, y + 0.20 * scale, z + 0.02],
      [s * 0.25, y + 0.30 * scale, z + 0.12],
      [s * 0.10, y + 0.24 * scale, z + 0.18],
      [s * 0.18, y + 0.12 * scale, z + 0.20],
    ]);
    b.sweep(p, [0.035 * scale, 0.006], {
      color,
      caps: { start: "round", end: "point" },
      section: { ngon: 6 },
      name: "curl of eaten dream",
      group: "dream",
    });
  };

  cloudWisp(1, 1.55, 0.48, 1.0, DREAM);
  cloudWisp(-1, 1.63, 0.51, 0.83, BLUE);
  cloudWisp(1, 1.75, 0.50, 0.62, GOLD);

  // A small gold dream jewel between the ears.
  b.part(
    new THREE.OctahedronGeometry(0.075, 0),
    GOLD,
    {
      bone: head,
      at: [0, 1.78, 0.77],
      rotation: [0, 0, Math.PI * 0.25],
      name: "dream jewel",
      group: "dream",
    },
  );

  // Decorative necklace of chunky woodblock beads.
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.052;
    const y = 1.21 + Math.abs(i) * 0.012;
    b.part(
      new THREE.SphereGeometry(0.026, 6, 4),
      i % 2 ? GOLD : CREAM,
      {
        bone: neck.joints[0],
        at: [x, y, 0.62],
        name: "necklace bead",
        group: "ornament",
      },
    );
  }

  // A visible little lower-jaw fang pair: not aggressive, ceremonial.
  for (const s of [-1, 1]) {
    b.spike(
      [s * 0.075, 1.285, 1.27],
      [0, -1, 0.08],
      0.075,
      0.019,
      { color: PALE, bone: jaw, name: "ceremonial tusk", group: "face" },
    );
  }

  // Three floor-contact ink shadow stones make the silhouette feel printed without
  // introducing a separate scene or ground plane.
  for (let i = -1; i <= 1; i++) {
    b.part(
      new THREE.CylinderGeometry(0.17 - Math.abs(i) * 0.025, 0.20, 0.025, 7),
      INK,
      {
        at: [i * 0.25, 0.012, -0.02 + Math.abs(i) * 0.08],
        rotation: [0, i * 0.3, 0],
        name: "ink floor shadow",
        group: "print",
      },
    );
  }

  // A few tiny pale print marks under the muzzle suggest drifting dream dust.
  for (let i = 0; i < 9; i++) {
    const a = rngLocal() * Math.PI * 2;
    const r = 0.12 + rngLocal() * 0.18;
    b.part(
      new THREE.OctahedronGeometry(0.012 + rngLocal() * 0.009, 0),
      i % 2 ? GOLD : DREAM,
      {
        at: [Math.cos(a) * r, 0.035 + rngLocal() * 0.13, 1.13 + Math.sin(a) * r * 0.45],
        rotation: [rngLocal(), rngLocal(), rngLocal()],
        name: "floating dream mote",
        group: "dream",
      },
    );
  }

  return b.root;
}
