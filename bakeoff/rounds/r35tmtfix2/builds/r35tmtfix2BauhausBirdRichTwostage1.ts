import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  line,
  rng,
  type Builder,
} from "../../../../src/index";

export const meta = {
  name: "bauhaus-songbird-on-branch",
  description:
    "A low-poly Bauhaus songbird perched on a simple branch, built from bold primary-colour geometry with a complete rest-pose skeleton.",
};

const RED = "#e53935";
const BLUE = "#1565c0";
const YELLOW = "#f6c515";
const BLACK = "#171717";
const WHITE = "#f5f2e8";
const ORANGE = "#ef8b18";
const GREEN = "#2e7d32";
const WOOD = "#6b3f25";
const WOOD_LIGHT = "#a66b36";
const DARK_BLUE = "#0d2b52";
const PALE_BLUE = "#5da9df";

export const REQUESTS = [
  {
    id: "leftWingPattern",
    kind: "texture",
    part: "wingL",
    what: "Paint a crisp Bauhaus fan pattern on the left blue wing: three broad nested geometric bands in BLUE, RED, and YELLOW, with clean black separators and no shading.",
  },
  {
    id: "rightWingPattern",
    kind: "texture",
    part: "wingR",
    what: "Mirror the Bauhaus fan pattern on the right wing using BLUE, RED, and YELLOW, keeping the wing silhouette clear and the graphic shapes broad.",
  },
  {
    id: "bodyBellyPattern",
    kind: "texture",
    part: "body",
    what: "Add a simple graphic belly treatment: a large YELLOW oval panel on the front underside, bordered by a thin BLACK ring, leaving the BLUE body visible around it.",
  },
  {
    id: "headMark",
    kind: "texture",
    part: "head",
    what: "Add a small RED and YELLOW geometric cheek emblem on both sides of the head, like two overlapping Bauhaus circles, placed behind the eyes.",
  },
  {
    id: "branchBark",
    kind: "texture",
    part: "branch",
    what: "Paint the branch in alternating WOOD and WOOD_LIGHT angular bark bands, with a few short BLACK seam marks following the branch direction.",
  },
  {
    id: "tailTips",
    kind: "add",
    part: "tail",
    what: "Three small triangular tail-tip pennants in RED, YELLOW, and WHITE, attached across the rear feather fan.",
    at: [0, 0.95, -0.72],
    normal: [0, 0.15, -1],
    bone: "hips",
    room: [0.62, 0.42, 0.18],
  },
  {
    id: "crownFeather",
    kind: "add",
    part: "head",
    what: "A jaunty Bauhaus crown feather: one short RED diamond blade with a smaller YELLOW diamond inset, rising from the top of the head.",
    at: [0, 1.73, 0.39],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.16, 0.28, 0.12],
  },
  {
    id: "legBands",
    kind: "add",
    part: "legs",
    what: "Two small BLACK and YELLOW geometric bands around the orange legs just above the feet, one matching band per leg.",
    at: [0, 0.3, 0.02],
    normal: [0, 1, 0],
    bone: null,
    room: [0.48, 0.18, 0.25],
  },
  {
    id: "branchLeaves",
    kind: "add",
    part: "branch",
    what: "Two simple flat GREEN leaves on short brown stems, one leaf near each end of the branch, kept well away from the bird silhouette.",
    at: [-0.72, 0.13, -0.05],
    normal: [0, 1, 0],
    bone: null,
    room: [0.3, 0.38, 0.18],
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function box(
  b: Builder,
  size: [number, number, number],
  color: string,
  at: THREE.Vector3 | [number, number, number],
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    flat: true,
    ...options,
  });
}

function sphere(
  b: Builder,
  radius: number,
  color: string,
  at: THREE.Vector3 | [number, number, number],
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    flat: true,
    ...options,
  });
}

function rod(
  b: Builder,
  a: THREE.Vector3 | [number, number, number],
  c: THREE.Vector3 | [number, number, number],
  radius: number,
  color: string,
  options: Record<string, unknown> = {},
) {
  return b.rod(a, c, radius, {
    color,
    section: { ngon: 6 },
    ...options,
  });
}

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one root, a spine, a separate jaw hinge, two legs, and toes.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.93, -0.12],
    dir: [0, 0.15, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.93, -0.22],
      [0, 1.06, -0.06],
      [0, 1.16, 0.14],
      [0, 1.27, 0.29],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "chest", "chestTip"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 1.48, 0.38],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.39, 0.47],
    dir: [0, 0.18, 1],
    role: "jaw",
    group: "head",
  });

  const legL = b.chain(
    "legL",
    [
      [0.14, 0.96, -0.02],
      [0.19, 0.61, 0.02],
      [0.18, 0.22, 0.08],
      [0.18, 0.14, 0.17],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.18, 0.07, 0.17],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.14, 0.96, -0.02],
      [-0.19, 0.61, 0.02],
      [-0.18, 0.22, 0.08],
      [-0.18, 0.14, 0.17],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.18, 0.07, 0.17],
    },
  );

  const toesL = b.chain(
    "toesL",
    [
      [0.18, 0.15, 0.17],
      [0.18, 0.13, 0.28],
    ],
    { parent: legL.tip, names: ["toeL"], role: "digit" },
  );

  const toesR = b.chain(
    "toesR",
    [
      [-0.18, 0.15, 0.17],
      [-0.18, 0.13, 0.28],
    ],
    { parent: legR.tip, names: ["toeR"], role: "digit" },
  );

  const tail = b.chain(
    "tail",
    [
      [0, 1.03, -0.24],
      [0, 1.02, -0.43],
      [0, 1.00, -0.61],
    ],
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // Branch and the broad silhouette.
  // ---------------------------------------------------------------------------

  rod(
    b,
    [-0.94, 0.075, -0.03],
    [0.94, 0.075, 0.02],
    0.075,
    WOOD,
    { name: "branch", group: "scenery" },
  );

  rod(
    b,
    [-0.65, 0.075, -0.02],
    [-0.76, 0.22, -0.03],
    0.035,
    WOOD_LIGHT,
    { name: "branchTwigL", group: "scenery" },
  );

  rod(
    b,
    [0.61, 0.075, 0.03],
    [0.76, 0.20, 0.05],
    0.032,
    WOOD_LIGHT,
    { name: "branchTwigR", group: "scenery" },
  );

  // The torso is a chunky eight-sided blue tube with a strong yellow underside.
  const body = b.sweep(spine, (t) => 0.255 - 0.055 * t, {
    color: BLUE,
    name: "body",
    group: "bird",
    sides: 8,
    sectors: [
      [112, 248, YELLOW],
      [248, 292, ORANGE],
    ],
  });

  // A small red breast block makes the front of the bird legible from a distance.
  box(b, [0.27, 0.34, 0.19], RED, [0, 1.27, 0.27], {
    bone: spine.tip,
    name: "breast",
    group: "bird",
  });

  // Head: deliberately oversized and geometric.
  sphere(b, 0.205, RED, head.at, {
    bone: head,
    name: "head",
    group: "bird",
    scale: [1.02, 0.95, 1.08],
  });

  // A flat yellow throat panel is left intentionally broad for Stage 2.
  box(b, [0.22, 0.20, 0.035], YELLOW, [0, 1.39, 0.555], {
    bone: head,
    name: "throatPanel",
    group: "bird",
  });

  // ---------------------------------------------------------------------------
  // Face, beak, eyes, and brow blocks.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    sphere(b, 0.064, WHITE, head.local([s * 0.105, 0.055, 0.065]), {
      bone: head,
      name: s > 0 ? "eyeWhiteL" : "eyeWhiteR",
      group: "face",
    });

    sphere(b, 0.031, BLACK, head.local([s * 0.105, 0.103, 0.065]), {
      bone: head,
      name: s > 0 ? "pupilL" : "pupilR",
      group: "face",
    });

    sphere(b, 0.009, WHITE, head.local([s * 0.116, 0.128, 0.087]), {
      bone: head,
      name: s > 0 ? "eyeGlintL" : "eyeGlintR",
      group: "face",
    });

    box(b, [0.12, 0.025, 0.025], BLACK, head.local([s * 0.095, 0.09, 0.145]), {
      bone: head,
      name: s > 0 ? "browL" : "browR",
      group: "face",
      rotation: [0, s * 10, s * 8],
    });
  }

  b.part(new THREE.ConeGeometry(0.095, 0.22, 6), YELLOW, {
    bone: head,
    at: head.local([0, 0.205, 0.005]),
    dir: [0, 0, 1],
    axis: "y",
    flat: true,
    name: "upperBeak",
    group: "face",
  });

  b.part(new THREE.ConeGeometry(0.073, 0.16, 6), ORANGE, {
    bone: jaw,
    at: jaw.local([0, 0.105, -0.03]),
    dir: [0, 0, 1],
    axis: "y",
    flat: true,
    name: "lowerBeak",
    group: "face",
  });

  // A narrow black mouth gap separates upper and lower beak.
  rod(
    b,
    [0, 1.405, 0.55],
    [0, 1.405, 0.68],
    0.009,
    BLACK,
    { bone: jaw, name: "mouthGap", group: "face" },
  );

  // ---------------------------------------------------------------------------
  // Wings: broad Bauhaus plates, deliberately plain for graphic overlays.
  // ---------------------------------------------------------------------------

  const wingOutline: [number, number, "sharp"][] = [
    [0.0, 0.0, "sharp"],
    [0.28, 0.02, "sharp"],
    [0.37, 0.19, "sharp"],
    [0.28, 0.43, "sharp"],
    [0.10, 0.51, "sharp"],
    [-0.02, 0.29, "sharp"],
  ];

  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [s * 0.205, 1.08, 0.03],
      x: [0, 0, s],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      bone: spine.joints[1],
      color: BLUE,
      name: s > 0 ? "wingL" : "wingR",
      group: "wings",
    });

    // A red shoulder cap gives the silhouette a bold primary-colour hinge.
    sphere(b, 0.075, RED, [s * 0.235, 1.28, 0.12], {
      bone: spine.joints[1],
      name: s > 0 ? "shoulderL" : "shoulderR",
      group: "wings",
    });

    // Small yellow lower wing block, separated from the main plate.
    box(b, [0.055, 0.20, 0.10], YELLOW, [s * 0.31, 1.03, 0.08], {
      bone: spine.joints[1],
      name: s > 0 ? "wingLowerL" : "wingLowerR",
      group: "wings",
      rotation: [0, 0, s * 18],
    });
  }

  // ---------------------------------------------------------------------------
  // Tail fan: three red/blue/black planar feathers with a clear rear silhouette.
  // ---------------------------------------------------------------------------

  const feather: [number, number, "sharp"][] = [
    [-0.075, 0, "sharp"],
    [0.075, 0, "sharp"],
    [0.055, 0.46, "sharp"],
    [0, 0.61, "sharp"],
    [-0.055, 0.46, "sharp"],
  ];

  b.extrude(feather, {
    at: [-0.14, 0.94, -0.47],
    x: [1, 0, 0],
    y: [0, 0.34, -0.94],
    thickness: 0.035,
    bevel: 0.005,
    bone: tail.joints[1],
    color: RED,
    name: "tailFeatherL",
    group: "tail",
  });

  b.extrude(feather, {
    at: [0.14, 0.94, -0.47],
    x: [-1, 0, 0],
    y: [0, 0.34, -0.94],
    thickness: 0.035,
    bevel: 0.005,
    bone: tail.joints[1],
    color: YELLOW,
    name: "tailFeatherR",
    group: "tail",
  });

  b.extrude(
    [
      [-0.09, 0],
      [0.09, 0],
      [0.06, 0.48],
      [0, 0.68],
      [-0.06, 0.48],
    ],
    {
      at: [0, 0.96, -0.49],
      x: [1, 0, 0],
      y: [0, 0.28, -0.96],
      thickness: 0.04,
      bevel: 0.005,
      bone: tail.tip!,
      color: DARK_BLUE,
      name: "tailFeatherCenter",
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // Legs and feet: orange vertical rods and simple black toe geometry.
  // ---------------------------------------------------------------------------

  b.sweep(legL, [0.044, 0.027], {
    color: ORANGE,
    name: "legL",
    group: "legs",
    sides: 6,
    skin: "rigid",
  });

  b.sweep(legR, [0.044, 0.027], {
    color: ORANGE,
    name: "legR",
    group: "legs",
    sides: 6,
    skin: "rigid",
  });

  for (const s of [1, -1]) {
    rod(
      b,
      [s * 0.18, 0.15, 0.17],
      [s * 0.18, 0.13, 0.31],
      0.018,
      BLACK,
      { bone: s > 0 ? legL.tip! : legR.tip!, name: s > 0 ? "toeFrontL" : "toeFrontR", group: "feet" },
    );

    rod(
      b,
      [s * 0.18, 0.15, 0.17],
      [s * 0.245, 0.13, 0.25],
      0.017,
      BLACK,
      { bone: s > 0 ? legL.tip! : legR.tip!, name: s > 0 ? "toeSideL" : "toeSideR", group: "feet" },
    );

    sphere(b, 0.032, YELLOW, [s * 0.18, 0.135, 0.17], {
      bone: s > 0 ? legL.tip! : legR.tip!,
      name: s > 0 ? "footL" : "footR",
      group: "feet",
    });
  }

  // ---------------------------------------------------------------------------
  // Stage 1 result plus reserved hook for concurrent Stage 2 builders.
  // ---------------------------------------------------------------------------

  for (const add of STAGE2) add(b);

  return b.root;
}
