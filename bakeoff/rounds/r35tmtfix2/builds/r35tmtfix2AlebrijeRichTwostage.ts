import * as THREE from "three";
import { type Builder, type ColorInput, createBuilder, paint, rng, spots, stripes, frame } from "../../../../src/index";

export const meta = {
  name: "Oaxacan Alebrije Jaguar-Eagle",
  description:
    "A vividly painted wooden alebrije combining a powerful spotted jaguar body with an eagle's beak, crest, talons, and broad spread wings.",
};

export const PALETTE = {
  WOOD_RED: "#b9362d",
  WOOD_ORANGE: "#e77b32",
  JAGUAR_GOLD: "#e2ad42",
  JAGUAR_DARK: "#44243b",
  BELLY_CREAM: "#f4d79a",
  WING_TEAL: "#187f82",
  WING_TURQUOISE: "#36b5a7",
  FEATHER_BLUE: "#255c8f",
  FEATHER_PURPLE: "#673c83",
  FEATHER_MAGENTA: "#c74678",
  BEAK_GOLD: "#f0b936",
  BEAK_DARK: "#8c4b22",
  TALON: "#39262b",
  EYE_WHITE: "#fff1c2",
  EYE_BLACK: "#1b1725",
  EYE_TURQUOISE: "#26d2c0",
  PAINT_GREEN: "#62a64a",
  PAINT_PINK: "#ec7192",
  PAINT_CREAM: "#ffe8ae",
  INK: "#26182b",
} as const;

const torsoRosettePaint = spots(
  spots(PALETTE.JAGUAR_GOLD, PALETTE.JAGUAR_DARK, {
    size: 0.19,
    amount: 0.72,
    rosette: true,
    seed: 41,
  }),
  [PALETTE.WOOD_RED, PALETTE.PAINT_CREAM],
  {
    size: 0.055,
    amount: 0.34,
    rosette: false,
    seed: 73,
  },
);

const headPatternPaint = paint((p, _n, _s) => {
  const cheek = Math.abs(p.x) > 0.105 && Math.abs(p.x) < 0.29 && p.y > 1.59 && p.y < 1.77 && p.z > 1.02;
  const cheekStripe = cheek && Math.sin(p.y * 145 + Math.abs(p.x) * 31) > 0.18;
  const browMark = p.y > 1.81 && p.y < 1.9 && Math.abs(p.x) > 0.055 && Math.abs(p.x) < 0.19 && p.z > 1.02;
  const muzzleDot =
    p.z > 1.115 &&
    p.y > 1.61 &&
    p.y < 1.78 &&
    Math.sin(p.x * 190) * Math.cos(p.y * 175) > 0.35;
  if (cheekStripe) return PALETTE.JAGUAR_DARK;
  if (browMark && Math.sin(p.x * 230 + p.y * 80) > -0.25) return PALETTE.PAINT_GREEN;
  if (muzzleDot) return PALETTE.PAINT_CREAM;
  return Math.sin(p.x * 42 + p.z * 31) > 0.3 ? PALETTE.JAGUAR_GOLD : PALETTE.WOOD_ORANGE;
});

const wingPatternPaint = paint((_p, _n, s) => {
  const along = s[0];
  const across = s[1];
  const band = Math.floor(along * 7);
  if (across > 0.86 && Math.sin(along * 92) > -0.25) return PALETTE.PAINT_CREAM;
  if (Math.sin(along * 72 + across * 25) > 0.62) return PALETTE.PAINT_PINK;
  return band % 2 === 0 ? PALETTE.WING_TEAL : PALETTE.FEATHER_BLUE;
});

const bellyPatternPaint = stripes(
  stripes(PALETTE.BELLY_CREAM, PALETTE.WOOD_RED, {
    size: 0.23,
    axis: "z",
    width: 0.42,
    wobble: 0.18,
    seed: 91,
  }),
  PALETTE.PAINT_GREEN,
  {
    size: 0.115,
    axis: "x",
    width: 0.22,
    wobble: 0.12,
    seed: 117,
  },
);

export const REQUESTS = [
  {
    id: "crownFeatherPattern",
    kind: "add",
    part: "head",
    what:
      "Build a proud three-feather crown rising from the jaguar-eagle's forehead. Use broad low-poly feather blades in FEATHER_BLUE, FEATHER_PURPLE, and FEATHER_MAGENTA with PAINT_CREAM tips, attached firmly to the top of the head.",
    at: [0, 2.08, 0.86],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.48, 0.48, 0.22],
  },
  {
    id: "earPaint",
    kind: "add",
    part: "head",
    what:
      "Add two oversized rounded jaguar ears with WOOD_RED outer rims, BELLY_CREAM inner faces, and tiny PAINT_PINK inner triangles. Keep them symmetrical and clearly visible above the eyes.",
    at: [0.21, 1.98, 0.78],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.58, 0.42, 0.3],
  },
  {
    id: "beakStripe",
    kind: "add",
    part: "beak",
    what:
      "Add a dark BEAK_DARK beak separation seam and a small hooked lower tip over the existing BEAK_GOLD eagle beak. Use chunky painted-wood geometry, not a smooth realistic beak.",
    at: [0, 1.78, 1.22],
    normal: [0, 0, 1],
    bone: "jaw",
    room: [0.26, 0.2, 0.22],
  },
  {
    id: "wingEyes",
    kind: "add",
    part: "wingL",
    what:
      "Place three large decorative eye-feather medallions along each spread wing. Each is a layered oval in FEATHER_BLUE, PAINT_GREEN, PAINT_CREAM, and EYE_BLACK, painted like an alebrije peacock eye.",
    at: [0.92, 1.57, 0.2],
    normal: [0, 1, 0],
    bone: "wingL1",
    room: [1.5, 0.32, 0.28],
  },
  {
    id: "wingTips",
    kind: "add",
    part: "wingL",
    what:
      "Add five long pointed primary feathers to each wing tip, alternating FEATHER_BLUE, FEATHER_PURPLE, and FEATHER_MAGENTA. They should fan apart in the neutral spread-wing pose.",
    at: [1.72, 1.4, 0.05],
    normal: [0, 0, 1],
    bone: "wingL2",
    room: [0.85, 0.42, 0.48],
  },
  {
    id: "shoulderOrnaments",
    kind: "add",
    part: "torso",
    what:
      "Add chunky round shoulder rosettes at both wing roots: WOOD_ORANGE outer discs, JAGUAR_DARK rings, and a small PAINT_CREAM centre. They should look carved and brightly hand-painted.",
    at: [0.52, 1.43, 0.35],
    normal: [1, 0, 0],
    bone: "hips",
    room: [0.42, 0.46, 0.42],
  },
  {
    id: "tailFan",
    kind: "add",
    part: "tail",
    what:
      "Build a small flamboyant tail fan at the end of the curled tail: five leaf-shaped feathers in WING_TEAL, FEATHER_BLUE, FEATHER_PURPLE, FEATHER_MAGENTA, and PAINT_CREAM with dark painted seams.",
    at: [0, 1.05, -1.55],
    normal: [0, 0, -1],
    bone: "tail3",
    room: [0.82, 0.68, 0.3],
  },
  {
    id: "legBands",
    kind: "add",
    part: "legL",
    what:
      "Add bright carved ankle bands on all four legs, alternating PAINT_GREEN and PAINT_PINK, with two raised ridges per band. Leave the talon tips visible.",
    at: [0.34, 0.23, 0.32],
    normal: [0, 1, 0],
    bone: "ankleL",
    room: [0.38, 0.25, 0.38],
  },
  {
    id: "clawCharms",
    kind: "add",
    part: "footL",
    what:
      "Add tiny PAINT_CREAM and WOOD_RED carved charms between the front talons, like little wooden beads tied into the creature's feet.",
    at: [0.2, 0.08, 0.55],
    normal: [0, 1, 0],
    bone: "footL",
    room: [0.34, 0.18, 0.32],
  },
  {
    id: "torsoRosettes",
    kind: "texture",
    part: "torso",
    what:
      "Paint bold jaguar rosettes across the golden torso and haunches. Use JAGUAR_DARK broken rings with WOOD_RED and PAINT_CREAM pinpricks, arranged asymmetrically but balanced like hand-painted Oaxacan wood.",
  },
  {
    id: "headPattern",
    kind: "texture",
    part: "head",
    what:
      "Paint the head in JAGUAR_GOLD and WOOD_ORANGE with symmetrical JAGUAR_DARK cheek stripes, PAINT_GREEN brow marks, and small PAINT_CREAM dots around the muzzle.",
  },
  {
    id: "wingPattern",
    kind: "texture",
    part: "wingL",
    what:
      "Paint the wing membranes in alternating WING_TEAL and FEATHER_BLUE bands, with magenta zigzags along the feather shafts and PAINT_CREAM scallops on the trailing edges. Mirror the same visual language on wingR.",
  },
  {
    id: "bellyPattern",
    kind: "texture",
    part: "belly",
    what:
      "Paint the underside BELLY_CREAM with wide WOOD_RED and PAINT_GREEN ornamental stripes following the chest and belly, leaving the face and eyes clean.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function sphere(
  b: Builder,
  color: ColorInput,
  at: [number, number, number],
  scale: [number, number, number],
  bone: any,
  name: string,
  segments = 10,
) {
  return b.part(new THREE.SphereGeometry(1, segments, Math.max(6, segments - 2)), color, {
    at,
    bone,
    scale,
    name,
  });
}

function box(
  b: Builder,
  color: string,
  at: [number, number, number],
  size: [number, number, number],
  bone: any,
  name: string,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function cone(
  b: Builder,
  color: string,
  at: [number, number, number],
  radius: number,
  height: number,
  dir: [number, number, number],
  bone: any,
  name: string,
) {
  return b.part(new THREE.ConeGeometry(radius, height, 7), color, {
    at,
    bone,
    dir,
    axis: "y",
    name,
    flat: true,
  });
}

function addRosette(
  b: Builder,
  bone: any,
  x: number,
  y: number,
  z: number,
  side: number,
  name: string,
) {
  b.part(new THREE.TorusGeometry(0.075, 0.018, 5, 9), PALETTE.JAGUAR_DARK, {
    at: [x, y, z],
    bone,
    dir: [side, 0, 0],
    name: `${name}Ring`,
    flat: true,
  });
  sphere(b, PALETTE.WOOD_RED, [x, y, z + 0.004], [0.024, 0.024, 0.018], bone, `${name}Spot`, 7);
  sphere(b, PALETTE.PAINT_CREAM, [x - side * 0.045, y + 0.014, z + 0.005], [0.014, 0.014, 0.012], bone, `${name}DotA`, 6);
  sphere(b, PALETTE.PAINT_CREAM, [x + side * 0.04, y - 0.018, z + 0.005], [0.012, 0.012, 0.01], bone, `${name}DotB`, 6);
}

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one rooted spine, a forward neck and head, four grounded legs, a curled tail, and spread wings.

  const hips = b.joint("hips", {
    at: [0, 0.92, -0.12],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.9, -0.48],
      [0, 0.98, -0.12],
      [0, 1.08, 0.28],
      [0, 1.18, 0.58],
    ],
    {
      parent: hips,
      names: ["spineRear", "spineMid", "spineFront", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 1.18, 0.58],
      [0, 1.35, 0.76],
      [0, 1.54, 0.85],
    ],
    {
      parent: spine.tip ?? spine.joints[spine.joints.length - 1],
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip ?? neck.joints[neck.joints.length - 1],
    at: [0, 1.62, 0.88],
    dir: [0, 0.2, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.57, 1.0],
    dir: [0, -0.06, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    [
      [0, 0.96, -0.48],
      [0, 1.0, -0.82],
      [0, 1.04, -1.14],
      [0, 1.13, -1.43],
    ],
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  const legData = [
    {
      side: 1,
      x: 0.34,
      z: 0.31,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      prefix: "L",
    },
    {
      side: -1,
      x: -0.34,
      z: 0.31,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      prefix: "R",
    },
    {
      side: 1,
      x: 0.34,
      z: -0.29,
      names: ["hipBackL", "kneeBackL", "ankleBackL", "footBackL"],
      prefix: "BackL",
    },
    {
      side: -1,
      x: -0.34,
      z: -0.29,
      names: ["hipBackR", "kneeBackR", "ankleBackR", "footBackR"],
      prefix: "BackR",
    },
  ];

  const legs: any[] = [];
  for (const leg of legData) {
    const pts = [
      [leg.x, 0.98, leg.z] as [number, number, number],
      [leg.x * 1.08, 0.67, leg.z + (leg.z > 0 ? 0.06 : -0.05)] as [number, number, number],
      [leg.x * 1.04, 0.3, leg.z + (leg.z > 0 ? 0.015 : -0.02)] as [number, number, number],
      [leg.x * 1.03, 0.12, leg.z + (leg.z > 0 ? 0.08 : -0.07)] as [number, number, number],
    ];
    const chain = b.chain(`leg${leg.prefix}`, pts, {
      parent: hips,
      names: leg.names,
      role: "leg",
      contact: pts[3],
    });
    legs.push(chain);
  }

  const wingL = b.chain(
    "wingL",
    [
      [0.42, 1.35, 0.38],
      [0.82, 1.56, 0.32],
      [1.32, 1.62, 0.2],
      [1.86, 1.48, 0.03],
    ],
    {
      parent: hips,
      names: ["wingL1", "wingL2", "wingL3", "wingLTip"],
      role: "wing",
    },
  );

  const wingR = b.chain(
    "wingR",
    [
      [-0.42, 1.35, 0.38],
      [-0.82, 1.56, 0.32],
      [-1.32, 1.62, 0.2],
      [-1.86, 1.48, 0.03],
    ],
    {
      parent: hips,
      names: ["wingR1", "wingR2", "wingR3", "wingRTip"],
      role: "wing",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Main silhouette: broad painted wooden torso, warm jaguar belly, neck, head, and tail.

  const body = b.sweep(spine, (t: number) => 0.31 - t * 0.035, {
    color: torsoRosettePaint,
    name: "torso",
    section: { ngon: 8 },
    caps: "round",
  });

  b.sweep(
    [
      [0, 0.89, 0.56],
      [0, 0.95, 0.3],
      [0, 0.89, 0.02],
      [0, 0.82, -0.25],
    ],
    (t: number) => 0.23 - t * 0.035,
    {
      color: bellyPatternPaint,
      bone: hips,
      name: "belly",
      section: { ngon: 8 },
      caps: "round",
    },
  );

  b.sweep(neck, [0.2, 0.13], {
    color: PALETTE.WOOD_RED,
    name: "neck",
    section: { ngon: 7 },
  });

  sphere(b, headPatternPaint, [0, 1.7, 0.9], [0.31, 0.29, 0.3], head, "head", 12);
  sphere(b, PALETTE.BELLY_CREAM, [0, 1.68, 1.08], [0.22, 0.13, 0.16], head, "muzzle", 9);

  b.sweep(tail, (t: number) => 0.14 - t * 0.1, {
    color: PALETTE.WOOD_RED,
    name: "tail",
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and feet. They are deliberately chunky and slightly angular, like carved wood.

  for (let i = 0; i < legs.length; i++) {
    const chain = legs[i];
    const isFront = i < 2;
    b.sweep(chain, [0.105, 0.075], {
      color: isFront ? PALETTE.WOOD_ORANGE : PALETTE.JAGUAR_GOLD,
      name: `leg${i}`,
      section: { ngon: 6 },
      skin: "smooth",
    });

    const foot = chain.tip ?? chain.joints[chain.joints.length - 1];
    const p = foot.at;
    box(
      b,
      PALETTE.TALON,
      [p.x, 0.105, p.z + (isFront ? 0.045 : -0.035)],
      [0.2, 0.09, 0.24],
      foot,
      `foot${i}`,
    );

    for (let toe = -1; toe <= 1; toe++) {
      const toeX = p.x + toe * 0.065;
      const toeZ = p.z + (isFront ? 0.16 : -0.13);
      b.spike(
        [toeX, 0.12, toeZ - (isFront ? 0.055 : -0.045)],
        [0, -0.08, isFront ? 1 : -1],
        0.16,
        0.027,
        {
          color: PALETTE.TALON,
          bone: foot,
          name: `toe${i}_${toe}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: two colourful membranes with strong feathered silhouettes.

  const wingSurfaceL = b.membrane(
    wingL,
    [
      [0.4, 1.26, 0.34],
      [0.78, 1.36, 0.2],
      [1.27, 1.37, 0.02],
      [1.82, 1.24, -0.14],
    ],
    {
      color: wingPatternPaint,
      bone: wingL.joints[0],
      thickness: 0.025,
      rows: 5,
      cols: 4,
      scallop: 0.18,
      name: "wingL",
    },
  );

  const wingSurfaceR = b.membrane(
    wingR,
    [
      [-0.4, 1.26, 0.34],
      [-0.78, 1.36, 0.2],
      [-1.27, 1.37, 0.02],
      [-1.82, 1.24, -0.14],
    ],
    {
      color: wingPatternPaint,
      bone: wingR.joints[0],
      thickness: 0.025,
      rows: 5,
      cols: 4,
      scallop: 0.18,
      name: "wingR",
    },
  );

  b.sweep(wingL, [0.12, 0.045], {
    color: PALETTE.FEATHER_BLUE,
    name: "wingLArm",
    section: { ngon: 6 },
  });
  b.sweep(wingR, [0.12, 0.045], {
    color: PALETTE.FEATHER_BLUE,
    name: "wingRArm",
    section: { ngon: 6 },
  });

  for (const s of [1, -1]) {
    const chain = s > 0 ? wingL : wingR;
    const bone = chain.joints[chain.joints.length - 1];

    for (let i = 0; i < 5; i++) {
      const rootX = s * (1.38 + i * 0.095);
      const rootY = 1.5 - i * 0.025;
      const rootZ = 0.13 - i * 0.08;
      const tipX = s * (1.75 + i * 0.11);
      const tipY = 1.62 + i * 0.07;
      const tipZ = -0.05 - i * 0.08;

      b.sweep(
        [
          [rootX, rootY, rootZ],
          [tipX, tipY, tipZ],
        ],
        [0.07, 0.008],
        {
          color: i % 2 === 0 ? PALETTE.FEATHER_PURPLE : PALETTE.FEATHER_MAGENTA,
          bone,
          name: `primary${s > 0 ? "L" : "R"}${i}`,
          section: { ngon: 5 },
          caps: { start: "round", end: "point" },
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Face: large readable eyes, brows, nose, eagle beak, and a separate openable lower jaw.

  for (const s of [-1, 1]) {
    const eyeX = s * 0.125;

    sphere(b, PALETTE.EYE_WHITE, [eyeX, 1.76, 1.14], [0.09, 0.055, 0.095], head, `eyeWhite${s}`, 9);
    sphere(b, PALETTE.EYE_TURQUOISE, [eyeX, 1.775, 1.19], [0.058, 0.025, 0.066], head, `iris${s}`, 8);
    sphere(b, PALETTE.EYE_BLACK, [eyeX, 1.78, 1.212], [0.026, 0.018, 0.047], head, `pupil${s}`, 7);
    sphere(
      b,
      PALETTE.PAINT_CREAM,
      [eyeX - s * 0.018, 1.794, 1.254],
      [0.014, 0.009, 0.018],
      head,
      `eyeGlint${s}`,
      6,
    );

    b.sweep(
      [
        [eyeX - s * 0.09, 1.84, 1.145],
        [eyeX, 1.89, 1.17],
        [eyeX + s * 0.09, 1.84, 1.145],
      ],
      0.018,
      {
        color: PALETTE.JAGUAR_DARK,
        bone: head,
        name: `brow${s}`,
        section: { ngon: 5 },
        caps: "round",
      },
    );

    b.spike(
      [eyeX + s * 0.09, 1.78, 1.195],
      [s * 0.04, 0.03, 0.06],
      0.075,
      0.009,
      {
        color: PALETTE.INK,
        bone: head,
        name: `lash${s}`,
      },
    );
  }

  sphere(b, PALETTE.JAGUAR_DARK, [0, 1.73, 1.22], [0.055, 0.04, 0.035], head, "nose", 7);

  cone(b, PALETTE.BEAK_GOLD, [0, 1.74, 1.31], 0.13, 0.36, [0, 0.03, 1], jaw, "beak");
  b.part(new THREE.ConeGeometry(0.085, 0.2, 7), PALETTE.BEAK_DARK, {
    at: [0, 1.64, 1.29],
    bone: jaw,
    dir: [0, -0.22, 1],
    axis: "y",
    name: "lowerBeak",
    flat: true,
  });

  b.sweep(
    [
      [-0.13, 1.66, 1.16],
      [0, 1.63, 1.2],
      [0.13, 1.66, 1.16],
    ],
    0.012,
    {
      color: PALETTE.INK,
      bone: jaw,
      name: "mouthSeam",
      section: { ngon: 5 },
      caps: "round",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Ears, crest, and wooden decorative silhouette pieces.

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.14, 0.02],
        [0.18, 0.15],
        [0.08, 0.25],
        [0, 0.19],
      ],
      {
        at: [s * 0.2, 1.89, 0.87],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.01,
        color: PALETTE.WOOD_RED,
        bone: head,
        name: `ear${s}`,
      },
    );

    b.extrude(
      [
        [0.015, 0.03],
        [0.1, 0.04],
        [0.09, 0.13],
        [0.035, 0.17],
      ],
      {
        at: [s * 0.205, 1.9, 0.885],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.063,
        bevel: 0.004,
        color: PALETTE.BELLY_CREAM,
        bone: head,
        name: `earInner${s}`,
      },
    );
  }

  for (const [i, z] of [-0.02, 0.06, 0.14].entries()) {
    b.extrude(
      [
        [0, 0],
        [0.1, 0.02],
        [0.075, 0.3 - i * 0.045],
        [0, 0.42 - i * 0.05],
        [-0.075, 0.3 - i * 0.045],
        [-0.1, 0.02],
      ],
      {
        at: [0, 1.91, 0.78 + z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.006,
        color: i === 0 ? PALETTE.FEATHER_BLUE : i === 1 ? PALETTE.FEATHER_PURPLE : PALETTE.FEATHER_MAGENTA,
        bone: head,
        name: `crest${i}`,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Carved facial and body paint blocks, kept as separate named parts for later texturing.

  for (const s of [-1, 1]) {
    addRosette(b, spine.joints[1], s * 0.22, 1.13, 0.24, s, `torsoRosette${s}`);
    addRosette(b, spine.joints[0], s * 0.24, 1.02, -0.18, s, `haunchRosette${s}`);

    b.part(new THREE.BoxGeometry(0.025, 0.12, 0.018), PALETTE.PAINT_GREEN, {
      at: [s * 0.19, 1.77, 1.17],
      bone: head,
      name: `browPaint${s}`,
      rotation: [0, 0, s * 0.3],
    });

    b.part(new THREE.BoxGeometry(0.028, 0.09, 0.02), PALETTE.PAINT_PINK, {
      at: [s * 0.2, 1.61, 1.16],
      bone: head,
      name: `cheekPaint${s}`,
      rotation: [0, 0, -s * 0.35],
    });
  }

  // Chest diamonds give the creature a strong alebrije front even before stage 2 paints it.

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.09, 0.1],
        [0, 0.2],
        [-0.09, 0.1],
      ],
      {
        at: [s * 0.12, 1.38, 0.72],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        color: s > 0 ? PALETTE.PAINT_GREEN : PALETTE.PAINT_PINK,
        bone: spine.tip ?? spine.joints[spine.joints.length - 1],
        name: `chestDiamond${s}`,
      },
    );
  }

  // Stage 2 may append builders that use the skeleton and named surfaces.
  for (const add of STAGE2) add(b);

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addCrownFeatherPattern(b: Builder) {
  const bone = "head";
  const baseY = 2.015;
  const baseZ = 0.86;

  type Feather = {
    x: number;
    lean: number;
    height: number;
    width: number;
    color: string;
    tip: string;
    name: string;
  };

  const feathers: Feather[] = [
    {
      x: -0.115,
      lean: -0.18,
      height: 0.27,
      width: 0.145,
      color: PALETTE.FEATHER_BLUE,
      tip: PALETTE.PAINT_CREAM,
      name: "s21CrownFeatherL",
    },
    {
      x: 0,
      lean: 0,
      height: 0.34,
      width: 0.16,
      color: PALETTE.FEATHER_PURPLE,
      tip: PALETTE.PAINT_CREAM,
      name: "s21CrownFeatherC",
    },
    {
      x: 0.115,
      lean: 0.18,
      height: 0.27,
      width: 0.145,
      color: PALETTE.FEATHER_MAGENTA,
      tip: PALETTE.PAINT_CREAM,
      name: "s21CrownFeatherR",
    },
  ];

  for (const f of feathers) {
    const base = new THREE.Vector3(f.x, baseY, baseZ);
    const rise = new THREE.Vector3(f.lean, f.height, 0).normalize();
    const across = new THREE.Vector3(1, 0, 0);

    // Broad, angular feather silhouette with a carved central notch at the crown.
    const blade = b.extrude(
      [
        [0, 0],
        [f.width * 0.42, 0.018],
        [f.width * 0.58, f.height * 0.38],
        [f.width * 0.48, f.height * 0.7],
        [f.width * 0.16, f.height * 0.91],
        [0, f.height],
        [-f.width * 0.16, f.height * 0.91],
        [-f.width * 0.48, f.height * 0.7],
        [-f.width * 0.58, f.height * 0.38],
        [-f.width * 0.42, 0.018],
      ],
      {
        at: base,
        x: across,
        y: rise,
        thickness: 0.034,
        bevel: 0.006,
        smoothing: 1,
        color: f.color,
        bone,
        name: f.name,
        group: "stage2Crown",
      },
    );

    // Cream-painted upper blade, slightly inset so the coloured feather remains a visible border.
    const tipBase = base.clone().addScaledVector(rise, f.height * 0.66);
    b.extrude(
      [
        [-f.width * 0.31, 0],
        [f.width * 0.31, 0],
        [f.width * 0.24, f.height * 0.2],
        [0, f.height * 0.34],
        [-f.width * 0.24, f.height * 0.2],
      ],
      {
        at: tipBase,
        x: across,
        y: rise,
        thickness: 0.04,
        bevel: 0.004,
        smoothing: 1,
        color: f.tip,
        bone,
        name: `${f.name}Tip`,
        group: "stage2Crown",
      },
    );

    // Raised wooden quill down the centre of each feather.
    const shaftEnd = base.clone().addScaledVector(rise, f.height * 0.91);
    b.rod(base, shaftEnd, 0.012, {
      color: PALETTE.JAGUAR_DARK,
      bone,
      section: { ngon: 5 },
      caps: "round",
      name: `${f.name}Quill`,
      group: "stage2Crown",
    });

    // Small painted bead at each root makes the three feathers read as one carved crest.
    b.part(new THREE.SphereGeometry(0.026, 7, 5), PALETTE.PAINT_GREEN, {
      at: base.clone().add(new THREE.Vector3(0, 0.008, 0.018)),
      bone,
      name: `${f.name}RootBead`,
      group: "stage2Crown",
      flat: true,
    });
  }

  // A low, scalloped collar locks the crown visually to the forehead.
  b.sweep(
    [
      [-0.19, 2.025, 0.875],
      [-0.095, 2.0, 0.905],
      [0, 1.99, 0.92],
      [0.095, 2.0, 0.905],
      [0.19, 2.025, 0.875],
    ],
    0.025,
    {
      color: PALETTE.WOOD_RED,
      bone,
      section: { ngon: 6 },
      caps: "round",
      name: "s21CrownCollar",
      group: "stage2Crown",
    },
  );

  // Alternating tiny studs echo the hand-painted rosette language on the body.
  for (let i = 0; i < 5; i++) {
    const x = -0.16 + i * 0.08;
    b.part(
      new THREE.CylinderGeometry(0.016, 0.016, 0.012, 7),
      i % 2 === 0 ? PALETTE.PAINT_CREAM : PALETTE.PAINT_PINK,
      {
        at: [x, 2.026, 0.905],
        dir: [0, 0, 1],
        axis: "y",
        bone,
        name: `s21CrownStud${i}`,
        group: "stage2Crown",
        flat: true,
      },
    );
  }
}
    return addCrownFeatherPattern;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addEarPaint(b: Builder) {
  const P = PALETTE;

  // ---------------------------------------------------------------------------------------------------------------
  // Oversized carved jaguar ears: a dark painted backing makes the red rim read clearly,
  // while nested cream and pink shapes give the ears the layered hand-painted look of an alebrije.

  for (const s of [-1, 1]) {
    const earAt: [number, number, number] = [s * 0.2, 1.89, 0.925];

    b.extrude(
      [
        [-0.145, 0.015],
        [-0.17, 0.105],
        [-0.12, 0.235],
        [-0.035, 0.285],
        [0.055, 0.245],
        [0.145, 0.12],
        [0.13, 0.025],
      ],
      {
        at: earAt,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.009,
        color: P.JAGUAR_DARK,
        bone: "head",
        name: `s22EarShadow${s}`,
      },
    );

    b.extrude(
      [
        [-0.125, 0.018],
        [-0.145, 0.105],
        [-0.1, 0.205],
        [-0.032, 0.25],
        [0.045, 0.213],
        [0.12, 0.11],
        [0.11, 0.025],
      ],
      {
        at: [s * 0.2, 1.892, 0.94],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.032,
        bevel: 0.008,
        color: P.WOOD_RED,
        bone: "head",
        name: `s22EarRedRim${s}`,
      },
    );

    b.extrude(
      [
        [-0.087, 0.035],
        [-0.1, 0.105],
        [-0.065, 0.18],
        [-0.022, 0.215],
        [0.035, 0.18],
        [0.078, 0.105],
        [0.07, 0.04],
      ],
      {
        at: [s * 0.2, 1.895, 0.959],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.036,
        bevel: 0.005,
        color: P.BELLY_CREAM,
        bone: "head",
        name: `s22EarCream${s}`,
      },
    );

    // Inner painted triangle, deliberately offset toward the pointed upper half.
    b.extrude(
      [
        [-0.045, 0.055],
        [0.0, 0.178],
        [0.052, 0.065],
        [0.018, 0.045],
      ],
      {
        at: [s * 0.2, 1.898, 0.98],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.041,
        bevel: 0.003,
        color: P.PAINT_PINK,
        bone: "head",
        name: `s22EarPink${s}`,
      },
    );

    // A pair of tiny cream carved dots makes the inner paint feel brushed and imperfect.
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.PAINT_CREAM, {
      at: [s * 0.165, 1.965, 0.997],
      bone: "head",
      name: `s22EarDotUpper${s}`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), P.PAINT_CREAM, {
      at: [s * 0.235, 1.935, 0.999],
      bone: "head",
      name: `s22EarDotLower${s}`,
      flat: true,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Eagle beak finishing: a thick dark carved separation seam, cheek-side paint blocks,
  // and a hooked lower tip that remains separate on the jaw bone.

  b.rod(
    [-0.105, 1.735, 1.445],
    [0.105, 1.735, 1.445],
    0.014,
    {
      color: P.BEAK_DARK,
      bone: "jaw",
      name: "s22BeakSeparation",
      section: { ngon: 5 },
      caps: "round",
    },
  );

  b.rod(
    [-0.072, 1.715, 1.455],
    [-0.025, 1.704, 1.468],
    0.009,
    {
      color: P.WOOD_RED,
      bone: "jaw",
      name: "s22BeakLeftPaint",
      section: { ngon: 5 },
      caps: "round",
    },
  );

  b.rod(
    [0.025, 1.704, 1.468],
    [0.072, 1.715, 1.455],
    0.009,
    {
      color: P.WOOD_RED,
      bone: "jaw",
      name: "s22BeakRightPaint",
      section: { ngon: 5 },
      caps: "round",
    },
  );

  // Hooked lower beak: a dark root and a gold-painted pointed end produce a chunky carved silhouette.
  b.spike(
    [0, 1.635, 1.405],
    [0, -0.22, 1],
    0.16,
    0.064,
    {
      color: P.BEAK_DARK,
      bone: "jaw",
      name: "s22HookDark",
      section: { ngon: 6 },
      caps: "point",
    },
  );

  b.spike(
    [0, 1.625, 1.448],
    [0, -0.32, 1],
    0.105,
    0.043,
    {
      color: P.BEAK_GOLD,
      bone: "jaw",
      name: "s22HookGold",
      section: { ngon: 6 },
      caps: "point",
    },
  );

  b.part(new THREE.SphereGeometry(0.018, 6, 4), P.PAINT_CREAM, {
    at: [-0.055, 1.69, 1.464],
    bone: "jaw",
    name: "s22BeakCharmL",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.018, 6, 4), P.PAINT_CREAM, {
    at: [0.055, 1.69, 1.464],
    bone: "jaw",
    name: "s22BeakCharmR",
    flat: true,
  });
}
    return addEarPaint;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addWingEyes(b: Builder) {
  const P = PALETTE;

  const disc = (
    color: string,
    at: [number, number, number],
    radius: number,
    scaleZ: number,
    bone: string,
    name: string,
    height = 0.018,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius * 0.96, height, 12, 1, false),
      color,
      {
        at,
        bone,
        scale: [1, 1, scaleZ],
        name,
        flat: true,
      },
    );
  };

  const ring = (
    color: string,
    at: [number, number, number],
    radius: number,
    tube: number,
    scaleZ: number,
    bone: string,
    name: string,
  ) => {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, 14), color, {
      at,
      bone,
      dir: [0, 1, 0],
      axis: "z",
      scale: [1, scaleZ, 1],
      name,
      flat: true,
    });
  };

  const ray = (
    color: string,
    at: [number, number, number],
    dir: [number, number, number],
    bone: string,
    name: string,
  ) => {
    return b.part(new THREE.ConeGeometry(0.018, 0.105, 5), color, {
      at,
      bone,
      dir,
      axis: "y",
      name,
      flat: true,
    });
  };

  const eye = (
    side: 1 | -1,
    i: number,
    x: number,
    y: number,
    z: number,
    bone: string,
  ) => {
    const sx = side;
    const tag = `${side > 0 ? "L" : "R"}${i}`;

    // A broad turquoise-blue carved eye medallion.
    disc(P.FEATHER_BLUE, [sx * x, y, z], 0.13, 0.67, bone, `s23WingEyeBase${tag}`, 0.025);
    ring(P.FEATHER_PURPLE, [sx * x, y + 0.014, z], 0.112, 0.014, 0.67, bone, `s23WingEyeOuter${tag}`);

    // Layered green and cream iris shapes create the characteristic alebrije eye-feather.
    disc(P.PAINT_GREEN, [sx * x, y + 0.027, z], 0.092, 0.67, bone, `s23WingEyeGreen${tag}`, 0.022);
    ring(P.PAINT_CREAM, [sx * x, y + 0.041, z], 0.073, 0.011, 0.64, bone, `s23WingEyeCreamRing${tag}`);
    disc(P.PAINT_CREAM, [sx * x, y + 0.043, z], 0.064, 0.61, bone, `s23WingEyeCream${tag}`, 0.018);

    // Dark pupil and a small carved glint.
    disc(P.EYE_BLACK, [sx * x, y + 0.056, z], 0.034, 0.75, bone, `s23WingEyePupil${tag}`, 0.016);
    disc(P.PAINT_CREAM, [sx * (x - 0.015), y + 0.066, z + 0.025], 0.012, 0.72, bone, `s23WingEyeGlint${tag}`, 0.01);

    // Four tiny painted rays make each medallion read as a carved feather rather than a flat sticker.
    ray(P.PAINT_GREEN, [sx * x, y + 0.049, z + 0.107], [0, 1, 0.25], bone, `s23WingEyeRayTop${tag}`);
    ray(P.PAINT_PINK, [sx * x, y + 0.049, z - 0.107], [0, 1, -0.25], bone, `s23WingEyeRayBottom${tag}`);
    ray(P.PAINT_CREAM, [sx * (x + 0.125), y + 0.049, z], [sx * 0.25, 1, 0], bone, `s23WingEyeRayOuter${tag}`);
    ray(P.FEATHER_MAGENTA, [sx * (x - 0.125), y + 0.049, z], [-sx * 0.25, 1, 0], bone, `s23WingEyeRayInner${tag}`);
  };

  // The wing membrane rises gently toward its shoulder, so the three medallions
  // step upward and become slightly smaller toward the outer feather fan.
  const positions = [
    { x: 0.78, y: 1.585, z: 0.285 },
    { x: 1.06, y: 1.605, z: 0.205 },
    { x: 1.32, y: 1.585, z: 0.105 },
  ];

  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    eye(1, i, p.x, p.y, p.z, "wingL1");
    eye(-1, i, p.x, p.y, p.z, "wingR1");
  }

  // Add short painted feather-shaft marks between the medallions, tying the
  // individual eyes into the larger wing pattern.
  for (const side of [1, -1] as const) {
    const bone = side > 0 ? "wingL1" : "wingR1";
    for (let i = 0; i < 4; i++) {
      const x = 0.66 + i * 0.22;
      const z = 0.34 - i * 0.075;
      b.part(new THREE.BoxGeometry(0.018, 0.012, 0.13), i % 2 ? P.PAINT_PINK : P.PAINT_CREAM, {
        at: [side * x, 1.612 + (i % 2) * 0.004, z],
        bone,
        rotation: [0, side * 0.18, side * 0.24],
        name: `s23WingShaft${side > 0 ? "L" : "R"}${i}`,
        flat: true,
      });
    }
  }
}
    return addWingEyes;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addWingTips(b: Builder) {
  const featherColors = [
    PALETTE.FEATHER_BLUE,
    PALETTE.FEATHER_PURPLE,
    PALETTE.FEATHER_MAGENTA,
    PALETTE.FEATHER_BLUE,
    PALETTE.FEATHER_PURPLE,
  ];

  // Broad, angular carved feather blades: each has a dark shaft, a coloured vane,
  // a pale painted tip, and a small raised centre mark.
  for (const side of [-1, 1]) {
    const wingBone = side > 0 ? "wingL2" : "wingR2";

    for (let i = 0; i < 5; i++) {
      const rootX = side * (1.34 + i * 0.095);
      const rootY = 1.47 - i * 0.018;
      const rootZ = 0.15 - i * 0.055;

      const tipX = side * (1.72 + i * 0.115);
      const tipY = 1.54 + i * 0.075;
      const tipZ = -0.06 - i * 0.105;

      const dx = tipX - rootX;
      const dy = tipY - rootY;
      const dz = tipZ - rootZ;
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = -side * 0.045;
      const nz = 0.035;

      // Dark carved quill visible between the two vane colours.
      b.rod(
        [rootX, rootY, rootZ],
        [tipX, tipY, tipZ],
        0.012,
        {
          color: PALETTE.JAGUAR_DARK,
          bone: wingBone,
          name: `s24_primaryShaft_${side > 0 ? "L" : "R"}_${i}`,
          section: { ngon: 5 },
        },
      );

      // Main pointed blade, an extruded low-poly feather silhouette.
      const blade = b.extrude(
        [
          [0, 0],
          [0.055, length * 0.18],
          [0.075, length * 0.55],
          [0.012, length],
          [-0.075, length * 0.55],
          [-0.055, length * 0.18],
        ],
        {
          at: [rootX, rootY, rootZ],
          x: [side, 0, 0],
          y: [dx / length, dy / length, dz / length],
          thickness: 0.026,
          bevel: 0.006,
          smoothing: 0,
          color: featherColors[i],
          bone: wingBone,
          name: `s24_primaryBlade_${side > 0 ? "L" : "R"}_${i}`,
        },
      );

      // A cream-painted pointed tip sits over the blade's upper section.
      b.extrude(
        [
          [0, length * 0.72],
          [0.038, length * 0.83],
          [0.012, length],
          [-0.038, length * 0.83],
        ],
        {
          at: [rootX, rootY, rootZ],
          x: [side, 0, 0],
          y: [dx / length, dy / length, dz / length],
          thickness: 0.031,
          bevel: 0.004,
          smoothing: 0,
          color: PALETTE.PAINT_CREAM,
          bone: wingBone,
          name: `s24_primaryTip_${side > 0 ? "L" : "R"}_${i}`,
        },
      );

      // Small painted ridge marks make the feather read as hand-carved wood.
      b.rod(
        [
          rootX + nx,
          rootY + dy * 0.28,
          rootZ + dz * 0.28 + nz,
        ],
        [
          tipX + nx * 0.25,
          tipY - dy * 0.08,
          tipZ + dz * 0.82 + nz,
        ],
        0.008,
        {
          color: i % 2 === 0 ? PALETTE.PAINT_GREEN : PALETTE.PAINT_PINK,
          bone: wingBone,
          name: `s24_primaryRidge_${side > 0 ? "L" : "R"}_${i}`,
          section: { ngon: 5 },
        },
      );
    }

    // Two tiny beads at the feather roots, a recurring alebrije ornament motif.
    for (let i = 0; i < 2; i++) {
      b.part(
        new THREE.SphereGeometry(0.027, 7, 5),
        i === 0 ? PALETTE.PAINT_GREEN : PALETTE.PAINT_PINK,
        {
          at: [side * (1.31 + i * 0.13), 1.45, 0.19 - i * 0.06],
          bone: wingBone,
          name: `s24_featherBead_${side > 0 ? "L" : "R"}_${i}`,
          flat: true,
        },
      );
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Layered shoulder rosettes. The discs are oriented along each side's outward normal,
  // with a carved ring, centre boss, six painted ray marks, and small raised rivets.

  for (const side of [-1, 1]) {
    const normal: [number, number, number] = [side, 0, 0];
    const x = side * 0.515;
    const y = 1.43;
    const z = 0.35;
    const bone = "hips";
    const label = side > 0 ? "L" : "R";

    // Wooden outer medallion.
    b.part(
      new THREE.CylinderGeometry(0.145, 0.145, 0.055, 10),
      PALETTE.WOOD_ORANGE,
      {
        at: [x, y, z],
        dir: normal,
        bone,
        name: `s24_shoulderDisc_${label}`,
        flat: true,
      },
    );

    // Raised dark carved ring.
    b.part(
      new THREE.TorusGeometry(0.105, 0.018, 5, 10),
      PALETTE.JAGUAR_DARK,
      {
        at: [x + side * 0.034, y, z],
        dir: normal,
        axis: "z",
        bone,
        name: `s24_shoulderRing_${label}`,
        flat: true,
      },
    );

    // Cream centre and turquoise inset dot.
    b.part(
      new THREE.CylinderGeometry(0.073, 0.073, 0.07, 9),
      PALETTE.PAINT_CREAM,
      {
        at: [x + side * 0.045, y, z],
        dir: normal,
        bone,
        name: `s24_shoulderCentre_${label}`,
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.032, 7, 5),
      PALETTE.WING_TEAL,
      {
        at: [x + side * 0.085, y, z],
        bone,
        name: `s24_shoulderBoss_${label}`,
        flat: true,
      },
    );

    // Six coloured rays around the rosette, kept chunky like painted wood inlay.
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const ry = Math.cos(a) * 0.105;
      const rz = Math.sin(a) * 0.105;
      const rayColor =
        i % 3 === 0
          ? PALETTE.PAINT_GREEN
          : i % 3 === 1
            ? PALETTE.PAINT_PINK
            : PALETTE.FEATHER_BLUE;

      b.part(
        new THREE.BoxGeometry(0.026, 0.052, 0.012),
        rayColor,
        {
          at: [x + side * 0.078, y + ry, z + rz],
          dir: normal,
          bone,
          name: `s24_shoulderRay_${label}_${i}`,
          rotation: [0, 0, -a],
          flat: true,
        },
      );
    }

    // Four raised cream studs give the medallion a tactile carved finish.
    for (let i = 0; i < 4; i++) {
      const a = Math.PI * 0.25 + i * Math.PI * 0.5;
      b.part(
        new THREE.SphereGeometry(0.014, 6, 4),
        PALETTE.PAINT_CREAM,
        {
          at: [
            x + side * 0.092,
            y + Math.cos(a) * 0.108,
            z + Math.sin(a) * 0.108,
          ],
          bone,
          name: `s24_shoulderStud_${label}_${i}`,
          flat: true,
        },
      );
    }

    // A short dark connector visually seats the ornament into the wing root.
    b.rod(
      [x - side * 0.04, y, z],
      [side * 0.39, 1.38, 0.36],
      0.018,
      {
        color: PALETTE.JAGUAR_DARK,
        bone,
        name: `s24_shoulderConnector_${label}`,
        section: { ngon: 5 },
      },
    );
  }
}
    return addWingTips;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addTailFan(b: Builder) {
  const bone = "tail3";
  const base = new THREE.Vector3(0, 1.05, -1.555);
  const featherColors = [
    PALETTE.WING_TEAL,
    PALETTE.FEATHER_BLUE,
    PALETTE.FEATHER_PURPLE,
    PALETTE.FEATHER_MAGENTA,
    PALETTE.PAINT_CREAM,
  ];

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const add = (a: THREE.Vector3, d: THREE.Vector3, t: number) =>
    a.clone().addScaledVector(d, t);

  const feather = (
    i: number,
    angleDeg: number,
    height: number,
    width: number,
    color: string,
  ) => {
    const angle = (angleDeg * Math.PI) / 180;
    const growth = v(Math.sin(angle), Math.cos(angle), 0).normalize();
    const across = v(Math.cos(angle), -Math.sin(angle), 0).normalize();
    const root = base.clone().add(v(0, i === 2 ? 0.005 : 0, 0));

    const outline: [number, number, "sharp"][] = [
      [0, 0, "sharp"],
      [width * 0.34, height * 0.13, "sharp"],
      [width * 0.48, height * 0.54, "sharp"],
      [width * 0.16, height * 0.86, "sharp"],
      [0, height, "sharp"],
      [-width * 0.16, height * 0.86, "sharp"],
      [-width * 0.48, height * 0.54, "sharp"],
      [-width * 0.34, height * 0.13, "sharp"],
    ];

    const blade = b.extrude(outline, {
      at: root,
      x: across,
      y: growth,
      thickness: 0.034,
      bevel: 0.006,
      color,
      bone,
      name: `s25TailFeather${i}`,
    });

    // A raised dark carved shaft makes each feather read as painted wood.
    const shaftStart = add(root, growth, height * 0.055).add(v(0, 0, 0.022));
    const shaftEnd = add(root, growth, height * 0.91).add(v(0, 0, 0.022));
    b.rod(shaftStart, shaftEnd, 0.011, PALETTE.JAGUAR_DARK, {
      bone,
      name: `s25TailShaft${i}`,
      section: { ngon: 5 },
      caps: "round",
    });

    // Two short, hand-painted cross marks echo the zig-zag ornament of Oaxacan carving.
    for (const [j, t] of [0.34, 0.63].entries()) {
      const center = add(root, growth, height * t).add(v(0, 0, 0.025));
      const span = width * (0.27 - t * 0.1);
      const a = center.clone().addScaledVector(across, -span);
      const c = center.clone().addScaledVector(across, span);
      b.rod(a, c, 0.008, j === 0 ? PALETTE.PAINT_CREAM : PALETTE.WOOD_RED, {
        bone,
        name: `s25TailStripe${i}_${j}`,
        section: { ngon: 5 },
        caps: "round",
      });
    }

    // A small contrasting pointed cap sits over the carved feather tip.
    const tip = add(root, growth, height * 0.82).add(v(0, 0, 0.026));
    const cap = b.extrude(
      [
        [-width * 0.11, 0],
        [width * 0.11, 0],
        [0, height * 0.16, "sharp"],
      ],
      {
        at: tip,
        x: across,
        y: growth,
        thickness: 0.012,
        bevel: 0.002,
        color: i % 2 === 0 ? PALETTE.PAINT_GREEN : PALETTE.PAINT_PINK,
        bone,
        name: `s25TailTipPaint${i}`,
      },
    );

    // A tiny raised rivet at the base visually pins the feather into the tail.
    const rivet = add(root, growth, 0.035).add(v(0, 0, 0.035));
    b.part(new THREE.SphereGeometry(0.026, 7, 5), PALETTE.PAINT_CREAM, {
      at: rivet,
      bone,
      scale: [1, 0.7, 0.45],
      name: `s25TailRivet${i}`,
      flat: true,
    });

    return { blade, cap };
  };

  const feathers = [
    [-54, 0.58, 0.19],
    [-29, 0.66, 0.22],
    [0, 0.72, 0.24],
    [29, 0.66, 0.22],
    [54, 0.58, 0.19],
  ] as const;

  for (let i = 0; i < feathers.length; i++) {
    const [angle, height, width] = feathers[i];
    feather(i, angle, height, width, featherColors[i]);
  }

  // Layered carved hub at the attachment point, giving the fan a deliberate wooden join.
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.035, 10), PALETTE.WOOD_RED, {
    at: base.clone().add(v(0, 0, 0.035)),
    bone,
    dir: [0, 0, 1],
    axis: "y",
    name: "s25TailFanHub",
    flat: true,
  });

  b.part(new THREE.TorusGeometry(0.085, 0.014, 5, 12), PALETTE.JAGUAR_DARK, {
    at: base.clone().add(v(0, 0, 0.058)),
    bone,
    dir: [0, 0, 1],
    axis: "y",
    name: "s25TailFanHubRing",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.035, 7, 5), PALETTE.PAINT_GREEN, {
    at: base.clone().add(v(0, 0, 0.073)),
    bone,
    scale: [1, 1, 0.45],
    name: "s25TailFanHubDot",
    flat: true,
  });
}
    return addTailFan;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addLegBands(b: Builder) {
  const bandGeo = (radius: number, height: number) =>
    new THREE.CylinderGeometry(radius, radius * 0.97, height, 8, 1, false);

  const ridgeGeo = (radius: number, tube: number) =>
    new THREE.TorusGeometry(radius, tube, 5, 10);

  const beadGeo = (radius: number) =>
    new THREE.SphereGeometry(radius, 7, 5);

  const loopGeo = (radius: number, tube: number) =>
    new THREE.TorusGeometry(radius, tube, 5, 8);

  const legs = [
    {
      x: 0.35,
      z: 0.325,
      bone: "ankleL",
      foot: "footL",
      band: PALETTE.PAINT_GREEN,
      ridge: PALETTE.PAINT_PINK,
      charmSide: 1,
      front: true,
    },
    {
      x: -0.35,
      z: 0.325,
      bone: "ankleR",
      foot: "footR",
      band: PALETTE.PAINT_PINK,
      ridge: PALETTE.PAINT_GREEN,
      charmSide: -1,
      front: true,
    },
    {
      x: 0.35,
      z: -0.31,
      bone: "ankleBackL",
      foot: "footBackL",
      band: PALETTE.PAINT_PINK,
      ridge: PALETTE.PAINT_GREEN,
      charmSide: 1,
      front: false,
    },
    {
      x: -0.35,
      z: -0.31,
      bone: "ankleBackR",
      foot: "footBackR",
      band: PALETTE.PAINT_GREEN,
      ridge: PALETTE.PAINT_PINK,
      charmSide: -1,
      front: false,
    },
  ];

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    const axis: [number, number, number] = leg.front
      ? [0, -0.985, 0.17]
      : [0, -0.99, -0.12];

    const center: [number, number, number] = [
      leg.x,
      0.285,
      leg.z,
    ];

    // A thick carved cuff hides the plain lower-leg transition.
    b.part(bandGeo(0.105, 0.075), leg.band, {
      at: center,
      bone: leg.bone,
      dir: axis,
      axis: "y",
      flat: true,
      name: `s26_band_${i}`,
      group: "legBands",
    });

    // Raised upper and lower wooden ridges make the cuff read as carved rather
    // than painted directly onto the leg.
    for (let r = 0; r < 2; r++) {
      const along = r === 0 ? -0.027 : 0.027;
      const p: [number, number, number] = [
        leg.x,
        center[1] + along,
        leg.z + (r === 0 ? -0.004 : 0.004),
      ];

      b.part(ridgeGeo(0.104, 0.012), leg.ridge, {
        at: p,
        bone: leg.bone,
        dir: axis,
        axis: "y",
        flat: true,
        name: `s26_band_${i}_ridge_${r}`,
        group: "legBands",
      });
    }

    // A small inset bead on the outer face breaks up the broad band with the
    // hand-painted ornament typical of alebrije carving.
    const outerX = leg.x + (leg.x > 0 ? 0.098 : -0.098);
    b.part(beadGeo(0.018), PAINT_CREAM, {
      at: [outerX, 0.285, leg.z + 0.002],
      bone: leg.bone,
      name: `s26_band_${i}_bead`,
      group: "legBands",
    });

    // Front feet receive three little carved charms suspended between the
    // talons. Rear feet get one smaller charm so the rear silhouette remains
    // lighter.
    if (leg.front) {
      const sx = leg.charmSide;
      const charmPoints: Array<{
        at: [number, number, number];
        color: string;
        radius: number;
      }> = [
        {
          at: [leg.x - sx * 0.055, 0.135, leg.z + 0.105],
          color: PAINT_CREAM,
          radius: 0.027,
        },
        {
          at: [leg.x, 0.125, leg.z + 0.125],
          color: PALETTE.WOOD_RED,
          radius: 0.023,
        },
        {
          at: [leg.x + sx * 0.055, 0.135, leg.z + 0.105],
          color: PALETTE.PAINT_CREAM,
          radius: 0.027,
        },
      ];

      for (let c = 0; c < charmPoints.length; c++) {
        const charm = charmPoints[c];

        b.part(beadGeo(charm.radius), charm.color, {
          at: charm.at,
          bone: leg.foot,
          name: `s26_charm_${i}_${c}`,
          group: "clawCharms",
          flat: true,
        });

        b.part(loopGeo(charm.radius * 0.72, 0.006), PALETTE.PAINT_GREEN, {
          at: [charm.at[0], charm.at[1] + 0.006, charm.at[2]],
          bone: leg.foot,
          dir: [0, 1, 0],
          axis: "y",
          name: `s26_charm_${i}_${c}_carvedLoop`,
          group: "clawCharms",
          flat: true,
        });
      }

      // A short painted cord visually ties the three beads together.
      b.part(
        new THREE.CylinderGeometry(0.006, 0.006, 0.16, 6),
        PALETTE.WOOD_RED,
        {
          at: [leg.x, 0.16, leg.z + 0.105],
          bone: leg.foot,
          name: `s26_charm_${i}_cord`,
          group: "clawCharms",
          flat: true,
        },
      );
    } else {
      b.part(beadGeo(0.018), PALETTE.PAINT_CREAM, {
        at: [leg.x, 0.14, leg.z - 0.085],
        bone: leg.foot,
        name: `s26_rearCharm_${i}`,
        group: "clawCharms",
        flat: true,
      });
    }
  }
}
    return addLegBands;
  })(),
);
