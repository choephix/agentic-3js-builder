import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  svg,
  stripes,
  spots,
  countershade,
  grain,
  frame,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description:
    "A brightly painted Oaxacan alebrije combining a spotted jaguar body, eagle wings, hooked beak, feather crest, and carved wooden ornament.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const TURQUOISE = "#159e9b";
  const DEEP_TEAL = "#075d69";
  const MAGENTA = "#d92e79";
  const PINK = "#ff6b9d";
  const GOLD = "#f5c43d";
  const ORANGE = "#e9652c";
  const RED = "#bd2d35";
  const VIOLET = "#58328f";
  const COBALT = "#244ca4";
  const CREAM = "#ffe8a4";
  const WOOD_DARK = "#3b1b27";
  const BLACK = "#211327";
  const WHITE = "#fff5d2";

  const wood = grain(TURQUOISE, DEEP_TEAL, {
    size: 0.055,
    axis: [0, 0, 1],
    seed: 12,
  });
  const coat = cel(
    furEdge(
      stripes(wood, [MAGENTA, GOLD, ORANGE], {
        size: 0.16,
        width: 0.24,
        wobble: 0.22,
        seed: 4,
      }),
      countershade(DEEP_TEAL, VIOLET, { level: -0.15, soft: 0.25 }),
      {
        level: -0.1,
        teeth: 0.2,
        period: 0.075,
        along: [0, 0, 1],
        ink: WOOD_DARK,
        inkWidth: 0.025,
      },
    ),
    DEEP_TEAL,
  );
  const headPaint = cel(
    spots(
      furEdge(ORANGE, GOLD, {
        by: "position",
        axis: [0, 1, 0],
        level: 1.18,
        teeth: 0.06,
        period: 0.075,
        along: [1, 0, 0],
        ink: WOOD_DARK,
        inkWidth: 0.012,
      }),
      [MAGENTA, VIOLET, TURQUOISE],
      { size: 0.12, amount: 0.72, rosette: true, seed: 8 },
    ),
    ORANGE,
  );
  const wingPaint = cel(
    stripes(MAGENTA, [GOLD, TURQUOISE, COBALT], {
      size: 0.13,
      axis: [1, 0, 0],
      width: 0.35,
      wobble: 0.1,
      seed: 19,
    }),
    VIOLET,
  );
  const beakPaint = cel(GOLD, ORANGE);
  const clawPaint = cel(CREAM, "#b87438");
  const featherPaint = cel(
    furEdge(COBALT, MAGENTA, {
      by: "position",
      axis: [0, 1, 0],
      level: 1.28,
      teeth: 0.13,
      period: 0.07,
      along: [0, 0, 1],
      ink: WOOD_DARK,
      inkWidth: 0.018,
    }),
    VIOLET,
  );

  // ---------------------------------------------------------------------------
  // Skeleton: one root, then the torso, head, jaw, limbs, wings, and tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.78, -0.3],
    dir: [0, 0, 1],
    role: "spine",
  });

  const bodyPath = catmull([
    [0, 0.78, -0.42],
    [0, 0.82, -0.18],
    [0, 0.88, 0.1],
    [0, 0.91, 0.38],
    [0, 0.98, 0.56],
  ]);
  const body = b.chain("body", bodyPath, {
    parent: hips,
    count: 5,
    names: ["rump", "spine", "shoulder", "chest", "neckBase"],
    role: "spine",
  });

  const neckPath = catmull([
    body.at(1).at,
    [0, 1.08, 0.65],
    [0, 1.22, 0.78],
    [0, 1.35, 0.86],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: body.joints[body.joints.length - 1],
    count: 3,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.39, 0.88],
    dir: [0, 0.02, 1],
    role: "head",
    group: "face",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.32, 0.99],
    dir: [0, -0.04, 1],
    role: "jaw",
    group: "face",
  });

  const legSpecs = [
    {
      side: "L",
      x: 1,
      fore: true,
      root: [0.22, 0.82, 0.32] as [number, number, number],
      foot: [0.29, 0.115, 0.48] as [number, number, number],
      names: ["shoulderL", "elbowL", "wristL", "pawL"],
    },
    {
      side: "R",
      x: -1,
      fore: true,
      root: [-0.22, 0.82, 0.32] as [number, number, number],
      foot: [-0.29, 0.115, 0.48] as [number, number, number],
      names: ["shoulderR", "elbowR", "wristR", "pawR"],
    },
    {
      side: "L",
      x: 1,
      fore: false,
      root: [0.23, 0.76, -0.27] as [number, number, number],
      foot: [0.31, 0.115, -0.47] as [number, number, number],
      names: ["hipL", "kneeL", "hockL", "footL"],
    },
    {
      side: "R",
      x: -1,
      fore: false,
      root: [-0.23, 0.76, -0.27] as [number, number, number],
      foot: [-0.31, 0.115, -0.47] as [number, number, number],
      names: ["hipR", "kneeR", "hockR", "footR"],
    },
  ];

  const legs: Array<{ chain: any; x: number; fore: boolean }> = [];
  for (const spec of legSpecs) {
    const points = limb(
      spec.root,
      spec.foot,
      spec.fore ? [0.31, 0.3, 0.19] : [0.34, 0.31, 0.2],
      spec.fore
        ? [
            [0, 0, 1],
            [0, 0, -1],
          ]
        : [
            [0, 0, -1],
            [0, 0, 1],
          ],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(`leg${spec.side}${spec.fore ? "F" : "H"}`, points, {
      parent: hips,
      names: spec.names,
      role: "leg",
      contact: spec.foot,
    });
    legs.push({ chain, x: spec.x, fore: spec.fore });
  }

  const wingChains: any[] = [];
  for (const s of [1, -1]) {
    const wingPath = catmull([
      [s * 0.23, 1.02, 0.3],
      [s * 0.48, 1.22, 0.25],
      [s * 0.75, 1.48, 0.08],
      [s * 1.0, 1.57, -0.13],
      [s * 1.2, 1.38, -0.27],
    ]);
    const wing = b.chain(`wing${s > 0 ? "L" : "R"}`, wingPath, {
      parent: body.joints[2],
      count: 5,
      names:
        s > 0
          ? ["wingRootL", "wingMidL", "wingElbowL", "wingTipL", "wingFeatherL"]
          : ["wingRootR", "wingMidR", "wingElbowR", "wingTipR", "wingFeatherR"],
      role: "wing",
    });
    wingChains.push(wing);
  }

  const tailPath = catmull([
    [0, 0.75, -0.48],
    [0, 0.68, -0.78],
    [0, 0.7, -1.04],
    [0.08, 0.84, -1.26],
    [0.02, 1.02, -1.44],
    [0, 1.15, -1.53],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  // ---------------------------------------------------------------------------
  // Torso, neck, tail, limbs.
  // ---------------------------------------------------------------------------

  b.sweep(body, (t) => 0.22 - 0.045 * t, {
    color: coat,
    sides: 8,
    section: "circle",
    group: "paintedWood",
  });

  b.sweep(neck, [0.17, 0.135], {
    color: headPaint,
    sides: 8,
    group: "paintedWood",
  });

  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.028, {
    color: stripes(ORANGE, [MAGENTA, GOLD, CREAM], {
      size: 0.14,
      width: 0.32,
      axis: [0, 0, 1],
      seed: 23,
    }),
    bands: [
      [0.56, MAGENTA],
      [0.76, GOLD],
      [0.9, CREAM],
    ],
    sides: 7,
    group: "tail",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, (t) => (leg.fore ? 0.105 : 0.12) * (1 - 0.2 * t), {
      color: leg.fore
        ? cel(stripes(TURQUOISE, [MAGENTA, GOLD], { size: 0.12, width: 0.3, seed: 31 }), DEEP_TEAL)
        : cel(stripes(ORANGE, [MAGENTA, TURQUOISE], { size: 0.11, width: 0.28, seed: 33 }), RED),
      sides: 6,
      section: "circle",
      group: "legs",
    });
  }

  // Bold painted shoulder and haunch rosettes.
  for (const s of [1, -1]) {
    const shoulder = b.part(new THREE.SphereGeometry(0.2, 8, 6), headPaint, {
      at: [s * 0.18, 0.91, 0.27],
      scale: [1, 1.08, 0.82],
      group: "rosettes",
    });
    const haunch = b.part(new THREE.SphereGeometry(0.22, 8, 6), coat, {
      at: [s * 0.2, 0.76, -0.25],
      scale: [1.05, 1.03, 0.9],
      group: "rosettes",
    });
    b.surface(shoulder);
    b.surface(haunch);
  }

  // ---------------------------------------------------------------------------
  // Feet, toes, claws.
  // ---------------------------------------------------------------------------

  for (const leg of legs) {
    const tip = leg.chain.tip;
    b.part(new THREE.SphereGeometry(0.115, 8, 5), cel(MAGENTA, VIOLET), {
      bone: tip,
      at: tip.at,
      scale: [1.12, 0.55, 1.3],
      group: "paws",
    });

    for (const d of [-1, 0, 1]) {
      const toeStart = [tip.at.x + d * 0.045, 0.11, tip.at.z + 0.045] as [
        number,
        number,
        number,
      ];
      const toeEnd = [tip.at.x + d * 0.055, 0.075, tip.at.z + 0.13] as [
        number,
        number,
        number,
      ];
      b.spike(toeStart, toeEnd, null, 0.022, {
        color: clawPaint,
        bone: tip,
        caps: { start: "round", end: "point" },
        group: "claws",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Head and face.
  // ---------------------------------------------------------------------------

  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), headPaint, {
    bone: head,
    at: [0, 1.4, 0.9],
    scale: [0.28, 0.27, 0.3],
    group: "head",
  });

  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 7), cel(CREAM, ORANGE), {
    bone: head,
    at: [0, 1.32, 1.09],
    scale: [0.19, 0.14, 0.16],
    group: "face",
  });

  const nose = b.part(new THREE.SphereGeometry(0.065, 8, 5), cel(BLACK, WOOD_DARK), {
    bone: head,
    at: [0, 1.34, 1.235],
    scale: [1.1, 0.72, 0.78],
    group: "face",
  });

  // Separate open lower jaw for a readable rigging hinge.
  b.sweep(
    catmull([
      [0, 1.3, 1.02],
      [0, 1.245, 1.12],
      [0, 1.27, 1.19],
    ]),
    [0.095, 0.045],
    {
      bone: jaw,
      color: cel(RED, VIOLET),
      sides: 7,
      group: "jaw",
    },
  );
  b.part(new THREE.SphereGeometry(0.045, 7, 5), CREAM, {
    bone: jaw,
    at: [-0.085, 1.305, 1.13],
    group: "teeth",
  });
  b.part(new THREE.SphereGeometry(0.045, 7, 5), CREAM, {
    bone: jaw,
    at: [0.085, 1.305, 1.13],
    group: "teeth",
  });

  // Hooked golden eagle beak, split into upper and lower painted pieces.
  b.sweep(
    catmull([
      [0, 1.39, 1.17],
      [0, 1.43, 1.32],
      [0, 1.41, 1.43],
      [0, 1.34, 1.47],
    ]),
    [0.1, 0.008],
    {
      bone: head,
      color: beakPaint,
      sides: 6,
      caps: { start: "flat", end: "point" },
      group: "beak",
    },
  );
  b.part(new THREE.ConeGeometry(0.065, 0.14, 6), ORANGE, {
    bone: jaw,
    at: [0, 1.3, 1.25],
    dir: [0, 0.05, 1],
    group: "beak",
  });

  // Large expressive painted eyes.
  const EYE = animeEye({
    iris: "#27d8ca",
    irisLight: "#b8fff0",
    irisDark: "#153c88",
    ink: INK,
    blush: "#ff719e",
    size: 256,
  });
  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeAt = [s * 0.13, 1.46, 1.105] as [number, number, number];
    b.decal(faceSurface, EYE, {
      at: eyeAt,
      dir: [0, 0.05, 1],
      up: [0, 1, 0],
      size: [0.115, 0.145],
      mirror: s > 0,
      lift: 0.004,
      segments: 6,
      group: "eyes",
    });
  }

  // Jaguar ears with inner gold triangles.
  const earOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.12, 0.02, "sharp"],
    [0.16, 0.25, "sharp"],
    [0.035, 0.16, "sharp"],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [s * 0.19, 1.51, 0.83],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: cel(MAGENTA, VIOLET),
      bone: head,
      group: "ears",
    });
    b.extrude(
      [
        [0.02, 0.035],
        [0.075, 0.045],
        [0.105, 0.17, "sharp"],
        [0.035, 0.12],
      ],
      {
        at: [s * 0.205, 1.535, 0.848],
        x: [s, 0, 0],
        thickness: 0.012,
        color: GOLD,
        bone: head,
        group: "earInner",
      },
    );
  }

  // Painted cheek ruffs and whiskers.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const root = [s * (0.18 + i * 0.018), 1.32 - i * 0.04, 1.05] as [
        number,
        number,
        number
      ];
      const tip = [s * (0.3 + i * 0.025), 1.3 - i * 0.045, 1.08 + i * 0.025] as [
        number,
        number,
        number
      ];
      b.spike(root, tip, null, 0.025, {
        color: cel(CREAM, ORANGE),
        bone: head,
        caps: { start: "round", end: "point" },
        group: "cheekRuff",
      });
    }
    for (let i = 0; i < 2; i++) {
      b.rod(
        [s * 0.12, 1.32 - i * 0.05, 1.17],
        [s * (0.34 + i * 0.03), 1.3 - i * 0.07, 1.22 + i * 0.05],
        0.006,
        {
          color: WHITE,
          bone: head,
          group: "whiskers",
          caps: "round",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Eagle wings: thick roots, feathered leading edges, and painted membranes.
  // ---------------------------------------------------------------------------

  for (let wi = 0; wi < wingChains.length; wi++) {
    const s = wi === 0 ? 1 : -1;
    const wing = wingChains[wi];

    b.sweep(wing, (t) => 0.095 - 0.055 * t, {
      color: wingPaint,
      sides: 6,
      group: "wingBones",
    });

    const lowerEdge = catmull([
      [s * 0.25, 1.0, 0.28],
      [s * 0.5, 1.08, 0.2],
      [s * 0.77, 1.25, 0.02],
      [s * 1.04, 1.3, -0.18],
      [s * 1.18, 1.3, -0.27],
    ]);
    b.membrane(wing, lowerEdge, {
      color: wingPaint,
      thickness: 0.018,
      rows: 4,
      cols: 6,
      scallop: 0.12,
      bone: wing.joints[0],
      group: "wingMembrane",
    });

    // Six broad carved primary feathers make the silhouette unmistakable.
    for (let i = 1; i <= 6; i++) {
      const root = wing.at(Math.min(0.35 + i * 0.09, 0.88)).at;
      const tip = [
        s * (0.55 + i * 0.12),
        1.45 + (i % 2) * 0.09 - i * 0.018,
        -0.08 - i * 0.09,
      ] as [number, number, number];
      b.spike(root, tip, null, 0.055 - i * 0.004, {
        color: i % 2 ? featherPaint : cel(GOLD, ORANGE),
        bone: wing.joints[Math.min(i, wing.joints.length - 1)],
        caps: { start: "round", end: "point" },
        group: "primaryFeathers",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Crown crest, shoulder medallions, and painted decorative studs.
  // ---------------------------------------------------------------------------

  const crest = b.extrude(
    [
      [0, 0],
      [0.08, 0.03],
      [0.13, 0.16],
      [0.1, 0.3, "sharp"],
      [0.035, 0.19],
      [-0.035, 0.28, "sharp"],
      [-0.075, 0.13],
      [-0.03, 0.04],
    ],
    {
      at: [0, 1.57, 0.77],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.008,
      color: featherPaint,
      bone: head,
      group: "crest",
    },
  );
  b.part(new THREE.SphereGeometry(0.045, 7, 5), GOLD, {
    bone: head,
    at: [0, 1.58, 0.74],
    group: "crestJewel",
  });

  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.025, 8), GOLD, {
      at: [s * 0.245, 0.95, 0.35],
      dir: [s, 0, 0],
      group: "shoulderMedallions",
    });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), CREAM, {
      at: [s * 0.275, 0.95, 0.35],
      group: "medallionStuds",
    });
  }

  // Bright geometric body ornaments, seated directly on the torso.
  const bodySurface = b.surface(b.root);
  const ornamentHits = [
    bodySurface.around([0, 0.88, 0.18]).at(0, 48),
    bodySurface.around([0, 0.88, 0.18]).at(180, 34),
    bodySurface.around([0, 0.84, -0.18]).at(35, 28),
    bodySurface.around([0, 0.84, -0.18]).at(-35, 28),
  ];
  for (let i = 0; i < ornamentHits.length; i++) {
    const hit = ornamentHits[i];
    if (hit) {
      b.stick(
        new THREE.ConeGeometry(0.045, 0.025, 5),
        i % 2 ? GOLD : PINK,
        hit,
        { embed: 0.25, group: "bodyJewels" },
      );
    }
  }

  // Tail-tip carved diamond.
  const tailTip = tail.joints[tail.joints.length - 1];
  b.part(new THREE.ConeGeometry(0.12, 0.18, 6), GOLD, {
    bone: tailTip,
    at: tailTip.at,
    dir: tailTip.axis,
    group: "tailOrnament",
  });

  // A small painted cheek mark, shaped like a traditional alebrije flame.
  const flame = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 3 C15 26 46 28 12 58 C3 67 11 91 34 93 C56 94 65 76 55 60 C48 49 38 43 40 25 C35 30 30 37 29 47 C19 37 25 20 32 3Z"
        fill="#ffd43d" stroke="#29142d" stroke-width="5" stroke-linejoin="round"/>
      <path d="M32 39 C24 52 36 56 25 70 C19 78 28 87 37 84 C47 81 47 71 41 64 C36 58 34 54 36 47Z"
        fill="#e52c72" stroke="#29142d" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.decal(skull, flame, {
      at: [s * 0.205, 1.38, 1.12],
      dir: [s * 0.75, 0.02, 0.66],
      up: [0, 1, 0],
      size: [0.06, 0.095],
      mirror: s > 0,
      lift: 0.003,
      segments: 4,
      group: "facePaint",
    });
  }

  return b.root;
}
