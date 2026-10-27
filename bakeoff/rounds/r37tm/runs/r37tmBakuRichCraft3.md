```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  stripes,
  countershade,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "ukiyo-e baku",
  description:
    "A stout dream-eating baku spirit with a tapir body, elephant trunk, tiger paws, ox tail, carved woodblock colours, and floating dream emblems.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  const INK = "#211b2b";
  const INDIGO = "#263c59";
  const BLUE = "#385d78";
  const PALE = "#ead9ae";
  const CREAM = "#f3e7c4";
  const RUST = "#a84c3d";
  const VERMILION = "#c75b42";
  const OCHRE = "#c3914c";
  const BLACK = "#171924";
  const DREAM = "#8b78b5";
  const GOLD = "#d8b05c";

  const coat = countershade(
    stripes(INDIGO, [BLUE, "#314e6c"], {
      size: 0.18,
      axis: "z",
      width: 0.22,
      wobble: 0.22,
      seed: 12,
    }),
    "#1f3049",
    { level: -0.15, soft: 0.3 },
  );

  const cheekPaint = stripes(PALE, [CREAM, "#d6bd91"], {
    size: 0.14,
    axis: "x",
    width: 0.18,
    wobble: 0.12,
    seed: 8,
  });

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: one root, a stout spine, four resting legs, trunk, jaw, and tail.

  const hips = b.joint("hips", {
    at: [0, 0.82, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.83, -0.52],
      [0, 0.91, -0.2],
      [0, 0.94, 0.18],
      [0, 0.98, 0.48],
    ]),
    {
      parent: hips,
      names: ["spineRear", "spineMid", "shoulders", "chest"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.04, 0.54],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.94, 0.64],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "face",
  });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 1.04, 0.66],
      [0, 0.99, 0.82],
      [0, 0.88, 0.94],
      [0, 0.72, 0.99],
      [0, 0.62, 0.92],
    ]),
    {
      parent: head,
      names: ["trunkBase", "trunkBridge", "trunkCurl", "trunkTip"],
      role: "tentacle",
    },
  );

  const legTargets = [
    { side: 1, z: 0.29, name: "legFL", hip: [0.2, 0.86, 0.3] },
    { side: -1, z: 0.29, name: "legFR", hip: [-0.2, 0.86, 0.3] },
    { side: 1, z: -0.34, name: "legHL", hip: [0.2, 0.82, -0.34] },
    { side: -1, z: -0.34, name: "legHR", hip: [-0.2, 0.82, -0.34] },
  ];

  const legs: { chain: any; side: number; front: boolean }[] = [];
  for (const leg of legTargets) {
    const foot: [number, number, number] = [leg.side * 0.24, 0.105, leg.z + (leg.z > 0 ? 0.075 : -0.045)];
    const points = limb(
      leg.hip,
      foot,
      [0.29, 0.25, 0.17],
      [
        [0, 0, leg.z > 0 ? 1 : -1],
        [0, 0, leg.z > 0 ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(leg.name, points, {
      parent: hips,
      names: [
        `${leg.name}_upper`,
        `${leg.name}_shin`,
        `${leg.name}_ankle`,
        `${leg.name}_paw`,
      ],
      role: "leg",
      contact: foot,
    });
    legs.push({ chain, side: leg.side, front: leg.z > 0 });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.5],
      [0.03, 0.76, -0.69],
      [0.1, 0.72, -0.83],
      [0.02, 0.79, -0.94],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Main silhouette: heavy body, chest, head, and separate lower jaw.

  const body = b.sweep(spine, (t) => 0.27 + 0.045 * Math.sin(t * Math.PI), {
    color: coat,
    sides: 8,
    section: "circle",
    name: "great rounded body",
    group: "body",
  });

  b.sweep(
    catmull([
      [0, 0.96, 0.28],
      [0, 1.02, 0.46],
      [0, 1.04, 0.61],
    ]),
    [0.25, 0.18],
    {
      bone: head,
      color: cheekPaint,
      sides: 8,
      caps: "round",
      name: "high forehead and cheeks",
      group: "head",
    },
  );

  const skull = b.part(
    new THREE.SphereGeometry(0.235, 12, 8),
    cheekPaint,
    {
      bone: head,
      at: [0, 1.08, 0.61],
      scale: [1.08, 0.92, 1.12],
      name: "broad spirit skull",
      group: "head",
      flat: true,
    },
  );

  b.sweep(
    catmull([
      [0, 0.93, 0.62],
      [0, 0.88, 0.73],
      [0, 0.84, 0.78],
    ]),
    [0.18, 0.12],
    {
      bone: jaw,
      color: PALE,
      sides: 7,
      caps: "round",
      name: "lower jaw",
      group: "jaw",
    },
  );

  b.sweep(trunk, (t) => 0.125 - t * 0.087, {
    color: PALE,
    sides: 8,
    caps: { start: "round", end: "point" },
    name: "dream-scenting trunk",
    group: "face",
  });

  // Trunk tip nostrils and a small dark mouth gap.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.025, 7, 5), BLACK, {
      bone: trunk.tip,
      at: trunk.tip.local([s * 0.045, 0.015, 0.012]),
      name: `nostril${s}`,
      group: "face",
    });
  }

  b.sweep(
    [
      [0.11, 0.895, 0.765],
      [0.05, 0.865, 0.8],
      [-0.05, 0.865, 0.8],
      [-0.11, 0.895, 0.765],
    ],
    0.012,
    {
      bone: jaw,
      color: INK,
      caps: "round",
      sides: 6,
      name: "mouth ink line",
      group: "face",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Face: large graphic eyes are settled before ears and mane.

  const eyeWhite = "#f6e8be";
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.064, 10, 7), eyeWhite, {
      bone: head,
      at: [s * 0.125, 1.135, 0.735],
      scale: [1, 1.12, 0.5],
      name: `almondEye${s}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.038, 9, 6), RUST, {
      bone: head,
      at: [s * 0.125, 1.135, 0.768],
      scale: [1, 1.18, 0.42],
      name: `copperIris${s}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.014, 7, 5), BLACK, {
      bone: head,
      at: [s * 0.125, 1.135, 0.793],
      scale: [1, 1.35, 0.35],
      name: `verticalPupil${s}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), "#fff8dc", {
      bone: head,
      at: [s * 0.108, 1.16, 0.808],
      name: `eyeGlint${s}`,
      group: "face",
    });

    // Bold carved brow.
    b.rod(
      [s * 0.09, 1.205, 0.76],
      [s * 0.17, 1.19, 0.75],
      0.013,
      INK,
      { bone: head, name: `heavyBrow${s}`, group: "face" },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Ears: tall rounded tapir ears, dark outside and pale inner woodblock shapes.

  const earOutline: [number, number, "sharp"][] = [
    [0, -0.12],
    [0.09, -0.08],
    [0.12, 0.08],
    [0.075, 0.25],
    [0, 0.3],
    [-0.07, 0.25],
    [-0.12, 0.08],
    [-0.09, -0.08],
  ];

  for (const s of [-1, 1]) {
    const ear = b.extrude(earOutline, {
      at: [s * 0.19, 1.17, 0.49],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      smoothing: 1,
      color: coat,
      bone: head,
      name: `roundedEar${s}`,
      group: "head",
    });
    b.extrude(
      [
        [-0.055, -0.04],
        [0.055, -0.04],
        [0.068, 0.08],
        [0.038, 0.19],
        [0, 0.22],
        [-0.038, 0.19],
        [-0.068, 0.08],
      ],
      {
        at: ear.local([0, 0.015, 0.031]),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.008,
        color: RUST,
        bone: head,
        name: `innerEar${s}`,
        group: "head",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Legs: chunky blue limbs, ochre tiger-like cuffs, and broad carved paws.

  for (const entry of legs) {
    const c = entry.chain;
    b.sweep(c, [0.105, 0.075], {
      color: coat,
      sides: 7,
      skin: "smooth",
      name: `${c.name} blue limb`,
      group: "legs",
    });

    for (const t of [0.57, 0.76]) {
      b.sweep(
        catmull([c.at(t).at, c.at(t + 0.055).at]),
        [0.087, 0.078],
        {
          color: RUST,
          sides: 7,
          caps: "flat",
          name: `${c.name} vermilion cuff ${t}`,
          group: "legs",
        },
      );
    }

    const foot = c.tip;
    b.part(new THREE.BoxGeometry(0.19, 0.095, 0.18), PALE, {
      bone: foot,
      at: foot.at,
      scale: [entry.side, 1, 1],
      name: `${c.name} broad paw`,
      group: "legs",
      flat: true,
    });

    for (const toe of [-0.055, 0, 0.055]) {
      b.part(new THREE.SphereGeometry(0.025, 7, 5), BLACK, {
        bone: foot,
        at: [foot.at.x + toe, 0.095, foot.at.z + 0.07],
        name: `${c.name} toe`,
        group: "legs",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Ox tail, little tail tuft, and a row of stylised back bristles.

  b.sweep(tail, [0.095, 0.025], {
    color: coat,
    sides: 7,
    name: "ox tail",
    group: "tail",
  });

  const tailTuft = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 3 L38 22 L57 13 L43 31 L62 42 L39 40 L42 61 L29 43 L13 58 L22 38 L3 34 L24 28 L10 10 L29 20Z"
        fill="#ead9ae" stroke="#211b2b" stroke-width="4" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
  b.cards([tail.at(1)], tailTuft, {
    size: [0.18, 0.22],
    color: PALE,
    lean: 15,
    bend: 12,
    cross: true,
    sink: 0.08,
    name: "starry tail tuft",
    group: "tail",
  });

  for (let i = 0; i < 9; i++) {
    const p = spine.at(0.12 + i * 0.095);
    b.spike(
      p,
      p,
      0.075 + (i % 3) * 0.018,
      0.025,
      {
        color: RUST,
        bone: p.bone,
        name: `back brush ${i}`,
        group: "mane",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Mane ruff: a blocky fan behind the head.

  const maneOutline: [number, number, "sharp"][] = [
    [-0.28, -0.02],
    [-0.2, 0.08],
    [-0.24, 0.2],
    [-0.11, 0.16],
    [-0.06, 0.31],
    [0, 0.19],
    [0.06, 0.31],
    [0.11, 0.16],
    [0.24, 0.2],
    [0.2, 0.08],
    [0.28, -0.02],
    [0, -0.06],
  ];
  b.extrude(maneOutline, {
    at: [0, 1.01, 0.39],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.008,
    color: RUST,
    bone: head,
    name: "sunset mane ruff",
    group: "mane",
  });

  // Small cream mane teeth overlay.
  for (const s of [-1, 1]) {
    b.spike(
      [s * 0.2, 1.06, 0.39],
      [s * 0.25, 1.02, 0.39],
      null,
      0.022,
      { color: PALE, bone: head, name: `mane point ${s}`, group: "mane" },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Ukiyo-e dream emblem on the flank and a second small floating charm on the chest.

  const dreamMark = svg(
    `<svg viewBox="0 0 128 128">
      <path d="M18 67 C35 22 98 18 106 54 C113 86 69 105 43 83 C27 69 42 48 66 48
        C88 48 93 68 78 78 C65 86 51 76 57 65 C62 57 74 59 76 66"
        fill="none" stroke="#211b2b" stroke-width="8" stroke-linecap="round"/>
      <path d="M18 67 C35 22 98 18 106 54 C113 86 69 105 43 83 C27 69 42 48 66 48
        C88 48 93 68 78 78 C65 86 51 76 57 65 C62 57 74 59 76 66"
        fill="none" stroke="#d8b05c" stroke-width="4" stroke-linecap="round"/>
      <circle cx="25" cy="30" r="6" fill="#c75b42"/>
      <path d="M103 92 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1Z"
        fill="#ead9ae" stroke="#211b2b" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const bodySurface = b.surface(body);
  const flank = bodySurface.around([0, 0.86, -0.02]).at(90, 3);
  if (flank) {
    b.decal(bodySurface, dreamMark, {
      at: flank,
      dir: [1, 0, 0],
      up: [0, 1, 0],
      size: [0.25, 0.25],
      lift: 0.004,
      segments: 8,
      name: "dream spiral flank crest",
      group: "dream magic",
    });
  }

  const chestMark = b.part(
    new THREE.CircleGeometry(0.09, 8),
    DREAM,
    {
      bone: head,
      at: [0, 1.01, 0.805],
      dir: [0, 0, 1],
      axis: "z",
      name: "dream seal on chest",
      group: "dream magic",
    },
  );
  b.part(new THREE.CircleGeometry(0.055, 8), GOLD, {
    bone: head,
    at: [0, 1.01, 0.812],
    dir: [0, 0, 1],
    axis: "z",
    name: "gold inner seal",
    group: "dream magic",
  });

  // Floating dream motes around the trunk, kept close to the creature.
  for (const [i, p] of [
    [0.18, 0.86, 0.88],
    [-0.18, 0.79, 0.9],
    [0.13, 0.59, 0.95],
    [-0.12, 0.67, 1.03],
  ].entries()) {
    b.part(new THREE.OctahedronGeometry(0.035, 0), DREAM, {
      at: p as [number, number, number],
      rotation: [0, i * 25, i * 17],
      name: `dream mote ${i}`,
      group: "dream magic",
    });
  }

  // A few graphic woodblock cuts: dark claws, nostril accents, and shoulder studs.
  for (const s of [-1, 1]) {
    b.part(new THREE.ConeGeometry(0.022, 0.09, 6), BLACK, {
      bone: head,
      at: [s * 0.2, 1.02, 0.48],
      dir: [0, 0, -1],
      name: `shoulder ink tusk ${s}`,
      group: "ornament",
    });
  }

  return b.root;
}
```