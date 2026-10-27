```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  countershade,
  frame,
  limb,
  mottle,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Baku, Dream-Eating Tapir Spirit",
  description:
    "A chunky ukiyo-e woodblock baku spirit with indigo fur, cream muzzle, carved ears, curling dream wisps, tusks, and a long expressive trunk.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  const INK = "#241b2b";
  const NIGHT = "#202b52";
  const INDIGO = "#344a78";
  const BLUE = "#506b9a";
  const CREAM = "#e8d3a0";
  const PALE = "#f4e8c4";
  const OCHRE = "#b9783e";
  const RED = "#9b3f3c";
  const TEAL = "#3c7778";
  const WOOD = "#6b432f";

  const fur = countershade(
    mottle(INDIGO, BLUE, { size: 0.22, contrast: 1.15, seed: 18 }),
    "#26324e",
    { level: -0.15, soft: 0.28 },
  );
  const muzzlePaint = countershade(CREAM, "#a77962", { level: -0.2, soft: 0.3 });

  // ---------------------------------------------------------------------------
  // Skeleton: one readable root, broad spine, four planted legs, head, jaw, tail.
  const hips = b.joint("hips", {
    at: [0, 0.88, -0.28],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.02, 0.88, -0.42],
      [0, 0.98, -0.12],
      [0, 1.02, 0.2],
      [0, 1.0, 0.47],
    ]),
    {
      parent: hips,
      names: ["spineA", "spineB", "shoulders", "chest"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.12, 0.57],
    dir: [0, -0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.01, 0.78],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.43],
      [0, 0.83, -0.67],
      [0.02, 0.78, -0.88],
      [0.02, 0.82, -1.03],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  const legData = [
    { s: 1, z: -0.28, n: ["hipL", "kneeL", "ankleL", "footL"] },
    { s: -1, z: -0.28, n: ["hipR", "kneeR", "ankleR", "footR"] },
    { s: 1, z: 0.32, n: ["shoulderL", "elbowL", "wristL", "toeL"] },
    { s: -1, z: 0.32, n: ["shoulderR", "elbowR", "wristR", "toeR"] },
  ];

  const legs: { chain: any; s: number; z: number }[] = [];
  for (const d of legData) {
    const root: [number, number, number] = [d.s * 0.27, d.z > 0 ? 0.98 : 0.88, d.z];
    const foot: [number, number, number] = [d.s * 0.29, 0.13, d.z + (d.z > 0 ? 0.08 : -0.04)];
    const points = limb(
      root,
      foot,
      [0.34, 0.32, 0.28],
      d.z > 0 ? [[0, 0, -1], [0, 0, 1]] : [[0, 0, 1], [0, 0, -1]],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(d.n[0].includes("shoulder") ? "foreleg" + (d.s > 0 ? "L" : "R") : "hindleg" + (d.s > 0 ? "L" : "R"), points, {
      parent: d.z > 0 ? spine.joints[2] : hips,
      names: d.n,
      role: "leg",
      contact: foot,
    });
    legs.push({ chain, s: d.s, z: d.z });
  }

  // ---------------------------------------------------------------------------
  // Main continuous masses.
  const body = b.sweep(spine, (t) => 0.27 + 0.035 * Math.sin(t * Math.PI), {
    color: fur,
    section: { ngon: 8 },
    sides: 8,
    shift: [0, -0.015],
    name: "broad_body",
    group: "body",
  });

  b.sweep(spine, (t) => 0.22 + 0.04 * (1 - t), {
    color: fur,
    section: { ngon: 8 },
    caps: "round",
    name: "shoulder_mass",
    group: "body",
  });

  for (const { chain, s, z } of legs) {
    b.sweep(chain, (t) => (t < 0.56 ? 0.105 : 0.075), {
      color: fur,
      section: { ngon: 6 },
      skin: "smooth",
      name: `${z > 0 ? "fore" : "hind"}leg_${s > 0 ? "L" : "R"}`,
      group: "limbs",
    });
    const hoof = b.part(
      new THREE.BoxGeometry(0.19, 0.09, 0.22),
      INK,
      {
        bone: chain.tip,
        at: chain.tip.at,
        scale: [1, 0.75, 1],
        name: "square_hoof",
        group: "limbs",
      },
    );
    b.part(new THREE.BoxGeometry(0.13, 0.025, 0.025), CREAM, {
      bone: chain.tip,
      at: [chain.tip.at.x, chain.tip.at.y + 0.045, chain.tip.at.z + 0.08],
      name: "hoof_highlight",
      group: "limbs",
    });
  }

  b.sweep(tail, [0.095, 0.035], {
    color: fur,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "short_tail",
    role: "tail",
  });

  // ---------------------------------------------------------------------------
  // Head and characteristic tapir muzzle.
  const skull = b.part(
    new THREE.SphereGeometry(0.31, 12, 8),
    fur,
    {
      bone: head,
      at: [0, 1.16, 0.64],
      scale: [1.08, 0.92, 1.15],
      name: "round_skull",
      group: "head",
    },
  );

  const cheek = b.part(
    new THREE.SphereGeometry(0.22, 10, 7),
    muzzlePaint,
    {
      bone: head,
      at: [0, 1.08, 0.83],
      scale: [1.0, 0.8, 1.25],
      name: "cream_cheeks",
      group: "face",
    },
  );

  const trunkPath = catmull([
    [0, 1.13, 0.82],
    [0, 1.07, 1.02],
    [0, 0.91, 1.14],
    [0, 0.77, 1.08],
    [0, 0.72, 0.97],
  ]);
  const trunk = b.sweep(trunkPath, [0.13, 0.065], {
    bone: head,
    color: muzzlePaint,
    section: { ngon: 7 },
    caps: { start: "round", end: "round" },
    name: "curling_trunk",
    group: "face",
  });

  // Separate upper/lower mouth planes make the jaw readable and riggable.
  b.sweep(
    catmull([
      [-0.11, 0.93, 0.88],
      [0, 0.91, 1.03],
      [0.11, 0.93, 0.88],
    ]),
    0.025,
    { bone: head, color: INK, section: { ngon: 5 }, name: "upper_mouth_line", group: "face" },
  );
  b.sweep(
    catmull([
      [-0.09, 0.82, 0.94],
      [0, 0.78, 1.04],
      [0.09, 0.82, 0.94],
    ]),
    0.035,
    { bone: jaw, color: muzzlePaint, section: { ngon: 6 }, name: "lower_jaw", group: "jaw" },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: -5 });

  // Nose, nostrils, and tiny red tongue.
  b.part(new THREE.SphereGeometry(0.09, 8, 6), INK, {
    bone: head,
    at: [0, 0.72, 0.975],
    scale: [1.1, 0.65, 0.8],
    name: "velvet_nose",
    group: "face",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), PALE, {
      bone: head,
      at: [s * 0.045, 0.745, 1.04],
      name: "nostril_glint",
      group: "face",
    });
  }
  b.part(new THREE.SphereGeometry(0.035, 7, 4), RED, {
    bone: jaw,
    at: [0, 0.79, 1.05],
    scale: [1.4, 0.35, 0.8],
    name: "tongue",
    group: "face",
  });

  // Eyes with graphic white/black layered construction.
  for (const s of [-1, 1]) {
    const eyeAt: [number, number, number] = [s * 0.16, 1.23, 0.83];
    b.part(new THREE.SphereGeometry(0.075, 8, 6), PALE, {
      bone: head,
      at: eyeAt,
      scale: [0.82, 1, 0.5],
      name: `eye_white_${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.041, 8, 6), INK, {
      bone: head,
      at: [s * 0.16, 1.23, 0.895],
      scale: [0.72, 1.12, 0.42],
      name: `ink_eye_${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), PALE, {
      bone: head,
      at: [s * 0.145, 1.255, 0.93],
      name: "eye_highlight",
      group: "face",
    });
    b.sweep(
      [
        [s * 0.22, 1.31, 0.84],
        [s * 0.17, 1.34, 0.88],
        [s * 0.1, 1.32, 0.88],
      ],
      0.013,
      { bone: head, color: INK, section: { ngon: 5 }, caps: "round", name: "heavy_brow", group: "face" },
    );
  }

  // ---------------------------------------------------------------------------
  // Huge rounded ears, carved like paper-cut woodblock silhouettes.
  const earOutline: [number, number, "sharp"][] = [
    [-0.12, 0],
    [-0.18, 0.17, "sharp"],
    [-0.16, 0.39, "sharp"],
    [0, 0.5, "sharp"],
    [0.15, 0.38, "sharp"],
    [0.17, 0.14, "sharp"],
    [0.1, 0],
  ];
  for (const s of [-1, 1]) {
    b.extrude(earOutline, {
      at: [s * 0.22, 1.3, 0.56],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.012,
      smoothing: 1,
      color: fur,
      bone: head,
      name: `rounded_ear_${s > 0 ? "L" : "R"}`,
      group: "head",
    });
    b.extrude(
      [
        [-0.06, 0.04],
        [-0.09, 0.19],
        [-0.06, 0.31],
        [0, 0.36],
        [0.07, 0.25],
        [0.07, 0.06],
      ],
      {
        at: [s * 0.225, 1.31, 0.56],
        x: [s, 0, 0],
        thickness: 0.084,
        color: OCHRE,
        bone: head,
        name: "ear_inner",
        group: "head",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Ukiyo-e silhouette: mane ridge, ink contours, and cloudlike dream wisps.
  const mane = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 2 C15 18 48 23 20 40 C5 51 43 57 17 75 C4 85 43 96 23 111 C16 117 24 124 32 126 C40 120 47 115 40 108 C27 96 58 87 43 73 C26 57 57 51 43 38 C25 23 49 16 32 2Z" fill="#f3d27a" stroke="#241b2b" stroke-width="5"/>
      <path d="M31 17 C24 30 39 31 25 45 M28 60 C42 70 26 78 39 91 M29 104 C37 111 33 116 31 120" fill="none" stroke="#9b3f3c" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );
  const maneFrames = [
    frame([0, 1.28, -0.48], [0, 1, 0]),
    frame([0, 1.35, -0.24], [0, 1, 0]),
    frame([0, 1.4, 0.04], [0, 1, 0]),
    frame([0, 1.4, 0.3], [0, 1, 0]),
    frame([0, 1.42, 0.5], [0, 1, 0]),
  ];
  b.cards(maneFrames, mane, {
    size: [0.18, 0.38],
    lean: 12,
    bend: 24,
    flow: [0, 0, -1],
    cross: true,
    color: PALE,
    sink: 0.12,
    group: "spirit_mane",
  });

  // Back and leg graphic bands evoke carved print registration marks.
  for (const z of [-0.42, -0.12, 0.18, 0.43]) {
    b.part(new THREE.BoxGeometry(0.5, 0.018, 0.025), OCHRE, {
      bone: hips,
      at: [0, 1.2, z],
      name: "woodblock_back_mark",
      group: "markings",
    });
  }
  for (const { chain, s, z } of legs) {
    b.part(new THREE.BoxGeometry(0.22, 0.025, 0.025), OCHRE, {
      bone: chain.joints[1],
      at: [s * 0.19, 0.56, z],
      name: "leg_band",
      group: "markings",
    });
  }

  // Dream-eating spirit wisps: translucent-looking pale graphic coils above the back.
  const wisp = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M7 78 C17 37 50 72 42 39 C37 17 76 12 86 31 C96 50 70 59 62 42" fill="none" stroke="#f4e8c4" stroke-width="8" stroke-linecap="round"/>
      <path d="M10 80 C20 39 51 72 44 40 C39 20 74 17 83 32" fill="none" stroke="#9b3f3c" stroke-width="2.5"/>
    </svg>`,
    { size: 192 },
  );
  b.cards(
    [
      frame([-0.08, 1.38, -0.05], [0, 1, 0]),
      frame([0.17, 1.44, 0.16], [0, 1, 0]),
      frame([-0.18, 1.42, 0.36], [0, 1, 0]),
    ],
    wisp,
    {
      size: [0.22, 0.42],
      lean: 8,
      bend: 30,
      flow: [0, 0, 1],
      color: PALE,
      cross: true,
      sink: 0.08,
      group: "dream_wisps",
    },
  );

  // A small painted talisman hangs at the throat.
  const talisman = svg(
    `<svg viewBox="0 0 64 92">
      <path d="M32 2 L59 19 L52 82 L32 90 L12 82 L5 19Z" fill="#b9783e" stroke="#241b2b" stroke-width="5"/>
      <path d="M32 18 L32 72 M18 39 Q32 25 46 39 Q32 53 18 39Z" fill="none" stroke="#f4e8c4" stroke-width="4"/>
      <circle cx="32" cy="39" r="5" fill="#9b3f3c"/>
    </svg>`,
    { size: 160 },
  );
  b.cards([frame([0, 1.02, 0.59], [0, 0, 1])], talisman, {
    size: [0.11, 0.18],
    lean: 10,
    flow: [0, -1, 0],
    color: PALE,
    sink: 0.08,
    group: "talisman",
  });

  // Tiny tusks, stylized as separate pale spikes beside the trunk.
  for (const s of [-1, 1]) {
    b.spike([s * 0.115, 0.92, 0.91], [s * 0.12, 0.76, 1.03], null, 0.026, {
      bone: head,
      color: PALE,
      caps: { start: "round", end: "point" },
      name: "small_tusk",
      group: "face",
    });
  }

  return b.root;
}
```