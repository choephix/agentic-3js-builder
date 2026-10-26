import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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
  color: string,
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
    color: PALETTE.JAGUAR_GOLD,
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
      color: PALETTE.BELLY_CREAM,
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

  sphere(b, PALETTE.WOOD_ORANGE, [0, 1.7, 0.9], [0.31, 0.29, 0.3], head, "head", 12);
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
      color: PALETTE.WING_TEAL,
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
      color: PALETTE.WING_TEAL,
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
