import * as THREE from "three";
import {
  type Builder,
  type ColorInput,
  createBuilder,
  catmull,
  frame,
  line,
  paint,
  rng,
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

const WING_PATTERN = paint((p, _n, _s) => {
  const side = p.x >= 0 ? 1 : -1;
  const u = Math.max(0, Math.abs(p.x) - 0.20);
  const v = Math.max(0, p.y - 1.04);
  const fan = (u + v * 0.52) / 0.42;
  const stripe = ((fan % 0.54) + 0.54) % 0.54;
  if (stripe < 0.018) return BLACK;
  if (stripe < 0.19) return RED;
  if (stripe < 0.21) return BLACK;
  if (stripe < 0.37) return YELLOW;
  if (stripe < 0.39) return BLACK;
  return side > 0 ? BLUE : BLUE;
});

const BELLY_PATTERN = paint((p, _n, _s) => {
  const ex = p.x / 0.235;
  const ey = (p.y - 1.18) / 0.275;
  const d = ex * ex + ey * ey;
  if (d < 0.72) return YELLOW;
  if (d < 0.84) return BLACK;
  return BLUE;
});

const HEAD_MARK = paint((p, _n, _s) => {
  const side = p.x >= 0 ? 1 : -1;
  const cx = side * 0.145;
  const red = ((p.x - cx) / 0.075) ** 2 + ((p.y - 1.445) / 0.075) ** 2;
  const yellow = ((p.x - side * 0.125) / 0.048) ** 2 + ((p.y - 1.475) / 0.048) ** 2;
  if (yellow < 1) return YELLOW;
  if (red < 1) return RED;
  return RED;
});

const BRANCH_PATTERN = paint((p, _n, _s) => {
  const band = ((p.x + 1.0) % 0.24 + 0.24) % 0.24;
  if (band < 0.014) return BLACK;
  if (band < 0.12) return WOOD_LIGHT;
  return WOOD;
});

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
    parent: spine.tip,
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
    BRANCH_PATTERN,
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
    color: BELLY_PATTERN,
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
  sphere(b, 0.205, HEAD_MARK, head.at, {
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
      color: WING_PATTERN,
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
      bone: tail.tip,
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
      { bone: s > 0 ? legL.tip : legR.tip, name: s > 0 ? "toeFrontL" : "toeFrontR", group: "feet" },
    );

    rod(
      b,
      [s * 0.18, 0.15, 0.17],
      [s * 0.245, 0.13, 0.25],
      0.017,
      BLACK,
      { bone: s > 0 ? legL.tip : legR.tip, name: s > 0 ? "toeSideL" : "toeSideR", group: "feet" },
    );

    sphere(b, 0.032, YELLOW, [s * 0.18, 0.135, 0.17], {
      bone: (s > 0 ? legL.tip : legR.tip) ?? undefined,
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addTailTips(b: Builder) {
  const tailBone = "hips";

  const pennant = (
    name: string,
    x: number,
    color: string,
    phase: number,
  ) => {
    const anchor: [number, number, number] = [x, 1.06, -0.685];

    // Bold black silhouette behind each coloured pennant.
    b.extrude(
      [
        [-0.072, 0.11, "sharp"],
        [0.072, 0.11, "sharp"],
        [0, -0.18, "sharp"],
      ],
      {
        at: anchor,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.004,
        bone: tailBone,
        color: BLACK,
        name: `${name}Outline`,
        group: "stage2-tail",
      },
    );

    // Primary-colour inset, offset toward the viewer so the black rim reads clearly.
    b.extrude(
      [
        [-0.052, 0.082, "sharp"],
        [0.052, 0.082, "sharp"],
        [0, -0.145, "sharp"],
      ],
      {
        at: [x, 1.06, -0.667],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.002,
        bone: tailBone,
        color,
        name: `${name}Color`,
        group: "stage2-tail",
      },
    );

    // A simple Bauhaus shaft runs from the attachment rivet toward the point.
    b.rod(
      [x, 1.14, -0.65],
      [x, 0.91, -0.65],
      0.009,
      BLACK,
      {
        bone: tailBone,
        section: { ngon: 4 },
        caps: "flat",
        name: `${name}Shaft`,
        group: "stage2-tail",
      },
    );

    // Square graphic rivet at the feather root.
    b.part(
      new THREE.CylinderGeometry(0.027, 0.027, 0.018, 8),
      YELLOW,
      {
        at: [x, 1.145, -0.645],
        dir: [0, 0, 1],
        axis: "y",
        rotation: [0, 0, phase],
        bone: tailBone,
        flat: true,
        name: `${name}Rivet`,
        group: "stage2-tail",
      },
    );

    // Tiny pale highlight block makes each pennant read as a finished graphic object.
    b.part(
      new THREE.BoxGeometry(0.026, 0.026, 0.012),
      WHITE,
      {
        at: [x - 0.018, 1.075, -0.647],
        bone: tailBone,
        rotation: [0, 0, phase],
        flat: true,
        name: `${name}Highlight`,
        group: "stage2-tail",
      },
    );
  };

  pennant("s21TailTipL", -0.19, RED, -8);
  pennant("s21TailTipC", 0, YELLOW, 0);
  pennant("s21TailTipR", 0.19, WHITE, 8);

  // Two short black separators visually bind the three pennants into one tail fan.
  b.rod(
    [-0.29, 1.125, -0.635],
    [-0.09, 1.125, -0.635],
    0.006,
    BLACK,
    {
      bone: tailBone,
      section: { ngon: 4 },
      caps: "flat",
      name: "s21TailBandL",
      group: "stage2-tail",
    },
  );

  b.rod(
    [0.09, 1.125, -0.635],
    [0.29, 1.125, -0.635],
    0.006,
    BLACK,
    {
      bone: tailBone,
      section: { ngon: 4 },
      caps: "flat",
      name: "s21TailBandR",
      group: "stage2-tail",
    },
  );
}
    return addTailTips;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addCrownFeather(b: Builder) {
  const base: [number, number, number] = [0, 1.73, 0.39];

  // A thin black silhouette gives the crown a strong Bauhaus outline and
  // leaves a narrow dark rim around the red blade.
  b.extrude(
    [
      [-0.062, 0, "sharp"],
      [0, 0.145, "sharp"],
      [0.062, 0, "sharp"],
      [0.034, 0.018, "sharp"],
      [-0.034, 0.018, "sharp"],
    ],
    {
      at: base,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.004,
      smoothing: 0,
      bone: "head",
      color: BLACK,
      name: "s22CrownOutline",
      group: "crown",
    },
  );

  // Red face, slightly inset from the outline, rising directly from the head.
  b.extrude(
    [
      [-0.047, 0.012, "sharp"],
      [0, 0.128, "sharp"],
      [0.047, 0.012, "sharp"],
      [0.025, 0.027, "sharp"],
      [-0.025, 0.027, "sharp"],
    ],
    {
      at: [0, 1.73, 0.416],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.002,
      smoothing: 0,
      bone: "head",
      color: RED,
      name: "s22CrownRedBlade",
      group: "crown",
    },
  );

  // Smaller yellow diamond inset: the recognizable primary-colour accent.
  b.extrude(
    [
      [0, 0.034, "sharp"],
      [0.027, 0.066, "sharp"],
      [0, 0.108, "sharp"],
      [-0.027, 0.066, "sharp"],
    ],
    {
      at: [0, 1.73, 0.425],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.0015,
      smoothing: 0,
      bone: "head",
      color: YELLOW,
      name: "s22CrownYellowDiamond",
      group: "crown",
    },
  );

  // A compact black collar seats the blade into the crown surface.
  b.part(new THREE.CylinderGeometry(0.045, 0.052, 0.025, 8), BLACK, {
    bone: "head",
    at: [0, 1.735, 0.39],
    name: "s22CrownCollar",
    group: "crown",
    flat: true,
  });

  // Two tiny red studs visually lock the diamond into its black backing.
  for (const x of [-0.034, 0.034]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), RED, {
      bone: "head",
      at: [x, 1.752, 0.444],
      name: x < 0 ? "s22CrownStudL" : "s22CrownStudR",
      group: "crown",
      flat: true,
    });
  }
}
    return addCrownFeather;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addLegBands(b: Builder) {
  const bandRadius = 0.043;
  const tubeRadius = 0.009;
  const legAxisL: [number, number, number] = [0.035, -0.997, 0.055];
  const legAxisR: [number, number, number] = [-0.035, -0.997, 0.055];

  const addBand = (
    side: 1 | -1,
    y: number,
    color: string,
    accent: string,
    bone: string,
    index: number,
  ) => {
    const center: [number, number, number] = [
      side * 0.186,
      y,
      0.055,
    ];
    const axis = side > 0 ? legAxisL : legAxisR;
    const ring = b.ring(
      frame(center, axis),
      {
        count: 10,
        radius: bandRadius,
        fromDeg: 0,
        toDeg: 360,
        name: `s23BandRing${side > 0 ? "L" : "R"}${index}`,
        group: "s23-leg-bands",
      },
    );

    const band = b.sweep(
      catmull(ring.items, { closed: true }),
      tubeRadius,
      {
        bone,
        color,
        caps: "none",
        sides: 6,
        name: `s23LegBand${side > 0 ? "L" : "R"}${index}`,
        group: "s23-leg-bands",
      },
    );

    // Six chunky contrasting studs make each narrow band read as designed geometry.
    for (let i = 0; i < 6; i++) {
      const item = ring.items[Math.floor((i * ring.items.length) / 6)];
      b.part(
        new THREE.SphereGeometry(0.012, 6, 4),
        accent,
        {
          bone,
          at: item.at,
          scale: [1, 0.72, 1],
          flat: true,
          name: `s23BandStud${side > 0 ? "L" : "R"}${index}_${i}`,
          group: "s23-leg-bands",
        },
      );
    }

    return band;
  };

  for (const side of [1, -1] as const) {
    const bone = side > 0 ? "ankleL" : "ankleR";

    // Lower black ring, with yellow studs.
    addBand(side, 0.265, "#171717", "#f6c515", bone, 0);

    // Upper yellow ring, with black studs; the small gap keeps the two bands crisp.
    addBand(side, 0.325, "#f6c515", "#171717", bone, 1);

    // A tiny orange ankle cap visually locks the bands into the leg rather than
    // letting them read as floating rings.
    b.part(
      new THREE.CylinderGeometry(0.031, 0.035, 0.028, 6),
      "#ef8b18",
      {
        bone,
        at: [side * 0.186, 0.232, 0.064],
        dir: side > 0 ? legAxisL : legAxisR,
        flat: true,
        name: `s23AnkleCap${side > 0 ? "L" : "R"}`,
        group: "s23-leg-bands",
      },
    );
  }
}
    return addLegBands;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addBranchLeaves(b: Builder) {
  const leafOutline: [number, number, "sharp"][] = [
    [0.0, 0.0, "sharp"],
    [0.075, 0.035, "sharp"],
    [0.19, 0.12, "sharp"],
    [0.25, 0.22, "sharp"],
    [0.19, 0.28, "sharp"],
    [0.085, 0.235, "sharp"],
    [0.0, 0.13, "sharp"],
  ];

  const makeLeaf = (
    side: 1 | -1,
    root: [number, number, number],
    xAxis: [number, number, number],
    yAxis: [number, number, number],
    name: string,
  ) => {
    const x = new THREE.Vector3(...xAxis).normalize();
    const y = new THREE.Vector3(...yAxis).normalize();
    const r = new THREE.Vector3(...root);
    const tip = r.clone().addScaledVector(x, 0.25).addScaledVector(y, 0.22);

    b.extrude(leafOutline, {
      at: r,
      x: x.toArray() as [number, number, number],
      y: y.toArray() as [number, number, number],
      thickness: [0.014, 0.006],
      bevel: 0.004,
      smoothing: 1,
      color: GREEN,
      name,
      group: "stage2-leaves",
    });

    // A raised angular midrib gives each otherwise-flat leaf a graphic,
    // constructed detail and visually connects it to its stem.
    b.rod(r.clone().addScaledVector(y, 0.018), tip, 0.008, {
      color: WOOD_LIGHT,
      section: { ngon: 5 },
      caps: "flat",
      name: `${name}Midrib`,
      group: "stage2-leaves",
    });

    // Two short diagonal veins, kept broad and geometric rather than botanical.
    const veinA = r
      .clone()
      .addScaledVector(x, 0.095)
      .addScaledVector(y, 0.075);
    const veinB = r
      .clone()
      .addScaledVector(x, 0.095)
      .addScaledVector(y, 0.075)
      .addScaledVector(x, side * 0.065)
      .addScaledVector(y, 0.055);

    const veinC = r
      .clone()
      .addScaledVector(x, 0.145)
      .addScaledVector(y, 0.125);
    const veinD = r
      .clone()
      .addScaledVector(x, 0.145)
      .addScaledVector(y, 0.125)
      .addScaledVector(x, side * 0.055)
      .addScaledVector(y, 0.045);

    b.rod(veinA, veinB, 0.0045, {
      color: WOOD_LIGHT,
      section: { ngon: 4 },
      caps: "flat",
      name: `${name}VeinA`,
      group: "stage2-leaves",
    });

    b.rod(veinC, veinD, 0.0045, {
      color: WOOD_LIGHT,
      section: { ngon: 4 },
      caps: "flat",
      name: `${name}VeinB`,
      group: "stage2-leaves",
    });

    // A small yellow node makes the stem-to-leaf join read clearly.
    b.part(new THREE.SphereGeometry(0.026, 7, 5), YELLOW, {
      at: r,
      scale: [1.1, 0.75, 0.8],
      name: `${name}Node`,
      group: "stage2-leaves",
    });
  };

  const leftBranch = new THREE.Vector3(-0.68, 0.105, -0.02);
  const leftLeafRoot = new THREE.Vector3(-0.79, 0.225, -0.055);
  b.rod(leftBranch, leftLeafRoot, 0.018, {
    color: WOOD,
    section: { ngon: 5 },
    caps: "round",
    name: "s24StemL",
    group: "stage2-leaves",
  });

  makeLeaf(
    -1,
    [-0.79, 0.225, -0.055],
    [-0.98, 0.0, -0.18],
    [0.05, 0.99, 0.08],
    "s24LeafL",
  );

  const rightBranch = new THREE.Vector3(0.61, 0.105, 0.03);
  const rightLeafRoot = new THREE.Vector3(0.755, 0.205, 0.07);
  b.rod(rightBranch, rightLeafRoot, 0.017, {
    color: WOOD,
    section: { ngon: 5 },
    caps: "round",
    name: "s24StemR",
    group: "stage2-leaves",
  });

  makeLeaf(
    1,
    [0.755, 0.205, 0.07],
    [0.97, 0.0, 0.22],
    [-0.08, 0.985, 0.06],
    "s24LeafR",
  );
}
    return addBranchLeaves;
  })(),
);
