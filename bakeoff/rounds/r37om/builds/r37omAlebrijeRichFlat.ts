import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  stripes,
  countershade,
} from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A vividly painted Oaxacan alebrije: a spotted jaguar body with eagle wings, beak, talons, feathers, carved-wood facets, and bright folkloric ornament.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const COAT = "#d66a25";
  const COAT_DARK = "#7d261e";
  const GOLD = "#f4bd32";
  const CREAM = "#f6df9b";
  const TEAL = "#168f86";
  const TURQUOISE = "#35c7b0";
  const MAGENTA = "#c73572";
  const PURPLE = "#653b91";
  const BLUE = "#2454a6";
  const RED = "#c8332e";
  const INK = "#24152d";
  const WOOD = "#9d3d27";
  const TALON = "#e8c76d";
  const EYE = "#f7e85a";

  const coatPaint = countershade(
    stripes(COAT, COAT_DARK, {
      size: 0.17,
      axis: "z",
      width: 0.28,
      wobble: 0.12,
      seed: 11,
    }),
    CREAM,
    { level: -0.18 },
  );

  const hips = b.joint("hips", {
    at: [0, 0.82, -0.28],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, -0.48],
      [0, 0.91, -0.12],
      [0, 1.02, 0.25],
      [0, 1.12, 0.56],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "shoulders", "neckRoot"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.08, 0.48],
      [0, 1.22, 0.68],
      [0, 1.31, 0.82],
    ]),
    {
      parent: spine.tip,
      names: ["neck1", "neck2", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.31, 0.82],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.27, 0.91],
    dir: [0, -0.16, 1],
    role: "jaw",
    group: "head",
  });

  const legPoints = [
    {
      side: "L",
      x: 0.25,
      z: 0.25,
      target: [0.34, 0.13, 0.41] as [number, number, number],
      names: ["hipL", "kneeL", "ankleL", "pawL"],
    },
    {
      side: "R",
      x: -0.25,
      z: 0.25,
      target: [-0.34, 0.13, 0.41] as [number, number, number],
      names: ["hipR", "kneeR", "ankleR", "pawR"],
    },
    {
      side: "L",
      x: 0.24,
      z: -0.31,
      target: [0.36, 0.13, -0.49] as [number, number, number],
      names: ["hipBackL", "kneeBackL", "ankleBackL", "pawBackL"],
    },
    {
      side: "R",
      x: -0.24,
      z: -0.31,
      target: [-0.36, 0.13, -0.49] as [number, number, number],
      names: ["hipBackR", "kneeBackR", "ankleBackR", "pawBackR"],
    },
  ];

  const legs = legPoints.map((l) =>
    b.chain(
      `leg${l.side}${l.z > 0 ? "Front" : "Back"}`,
      catmull([
        [l.x, 0.82, l.z],
        [l.x * 1.1, 0.55, l.z + (l.z > 0 ? -0.03 : 0.06)],
        [l.x * 1.18, 0.28, l.z + (l.z > 0 ? 0.04 : -0.08)],
        l.target,
      ]),
      {
        parent: hips,
        names: l.names,
        role: "leg",
        contact: l.target,
      },
    ),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.86, -0.55],
      [0, 0.82, -0.86],
      [0.02, 0.91, -1.15],
      [0.09, 1.07, -1.4],
      [0.16, 1.24, -1.58],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.18, 1.03, 0.25],
      [0.47, 1.22, 0.19],
      [0.79, 1.43, 0.08],
      [1.08, 1.47, -0.12],
      [1.28, 1.3, -0.32],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingL", "wingL2", "wingL3", "wingLTip"],
      role: "wing",
    },
  );

  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.18, 1.03, 0.25],
      [-0.47, 1.22, 0.19],
      [-0.79, 1.43, 0.08],
      [-1.08, 1.47, -0.12],
      [-1.28, 1.3, -0.32],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingR", "wingR2", "wingR3", "wingRTip"],
      role: "wing",
    },
  );

  const wingFingerL = b.chain(
    "wingFanL",
    catmull([
      [0.46, 1.22, 0.18],
      [0.73, 1.65, 0.03],
      [1.02, 1.76, -0.04],
      [1.43, 1.69, -0.17],
    ]),
    { parent: wingL.joints[0], names: ["fanL1", "fanL2", "fanL3"], role: "fan" },
  );

  const wingFingerR = b.chain(
    "wingFanR",
    catmull([
      [-0.46, 1.22, 0.18],
      [-0.73, 1.65, 0.03],
      [-1.02, 1.76, -0.04],
      [-1.43, 1.69, -0.17],
    ]),
    { parent: wingR.joints[0], names: ["fanR1", "fanR2", "fanR3"], role: "fan" },
  );

  // Main carved body.
  const body = b.sweep(spine, (t) => 0.27 - t * 0.035, {
    color: coatPaint,
    section: { ngon: 8 },
    sides: 8,
    name: "paintedJaguarBody",
  });

  b.sweep(neck, [0.2, 0.15], {
    color: coatPaint,
    section: { ngon: 8 },
    name: "stripedNeck",
  });

  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.025, {
    color: (t) => (t > 0.76 ? MAGENTA : t > 0.5 ? TEAL : COAT_DARK),
    section: { ngon: 7 },
    name: "paintedTail",
  });

  for (const [i, leg] of legs.entries()) {
    b.sweep(leg, (t) => (t < 0.45 ? 0.105 : 0.075), {
      color: t => (t > 0.7 ? CREAM : i % 2 ? TEAL : COAT),
      section: { ngon: 7 },
      name: `carvedLeg${i}`,
    });
  }

  // Chest ruff and belly.
  b.sweep(
    catmull([
      [0, 1.04, 0.39],
      [0, 0.92, 0.47],
      [0, 0.74, 0.38],
    ]),
    [0.22, 0.14],
    { color: CREAM, section: { ngon: 8 }, name: "creamChestRuff" },
  );

  // Wing membranes.
  b.membrane(wingL, wingFingerL, {
    color: TEAL,
    thickness: 0.018,
    rows: 5,
    cols: 8,
    scallop: 0.15,
    name: "leftTurquoiseWing",
  });
  b.membrane(wingR, wingFingerR, {
    color: TEAL,
    thickness: 0.018,
    rows: 5,
    cols: 8,
    scallop: 0.15,
    name: "rightTurquoiseWing",
  });

  // Secondary feather panels.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.26, 0.02],
        [0.19, 0.19],
        [0.04, 0.33],
        [-0.03, 0.18],
      ],
      {
        at: [s * 0.57, 1.28, 0.08],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        bevel: 0.008,
        color: MAGENTA,
        bone: s > 0 ? wingL.joints[1] : wingR.joints[1],
        name: `wingMagentaPanel${s}`,
      },
    );

    for (let i = 0; i < 4; i++) {
      const base: [number, number, number] = [
        s * (0.57 + i * 0.14),
        1.3 + i * 0.08,
        0.03 - i * 0.06,
      ];
      b.spike(base, [s * 0.24, 0.12 + i * 0.02, -0.12], 0.32, 0.035, {
        color: i % 2 ? GOLD : PURPLE,
        name: `wingFeather${s}${i}`,
      });
    }
  }

  // Skull and muzzle.
  const skull = b.part(
    new THREE.SphereGeometry(0.255, 12, 8),
    coatPaint,
    {
      bone: head,
      at: [0, 1.34, 0.83],
      scale: [1.02, 0.92, 1.18],
      name: "angularJaguarSkull",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.15, 10, 7),
    CREAM,
    {
      bone: jaw,
      at: [0, 1.23, 1.03],
      scale: [1.18, 0.66, 1.25],
      name: "creamLowerMuzzle",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.13, 10, 7),
    CREAM,
    {
      bone: head,
      at: [0, 1.35, 1.02],
      scale: [1.18, 0.75, 0.86],
      name: "upperMuzzle",
      flat: true,
    },
  );

  // Eagle beak, separated upper and lower.
  b.part(
    new THREE.ConeGeometry(0.105, 0.32, 6),
    GOLD,
    {
      bone: head,
      at: [0, 1.38, 1.22],
      dir: [0, -0.18, 1],
      axis: "z",
      scale: [1, 1, 1],
      name: "goldenEagleBeak",
      flat: true,
    },
  );
  b.part(
    new THREE.ConeGeometry(0.07, 0.22, 6),
    RED,
    {
      bone: jaw,
      at: [0, 1.27, 1.2],
      dir: [0, 0.18, 1],
      axis: "z",
      name: "lowerBeak",
      flat: true,
    },
  );

  // Nose and open-mouth interior.
  b.part(new THREE.SphereGeometry(0.052, 8, 6), INK, {
    bone: jaw,
    at: [0, 1.27, 1.16],
    scale: [1.35, 0.72, 0.65],
    name: "nose",
  });
  b.part(new THREE.BoxGeometry(0.13, 0.012, 0.08), INK, {
    bone: jaw,
    at: [0, 1.29, 1.13],
    name: "openMouth",
  });

  // Eyes with painted outer sockets.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.09, 10, 7), INK, {
      bone: head,
      at: [s * 0.13, 1.42, 1.0],
      scale: [1, 1.05, 0.48],
      name: `eyeSocket${s}`,
    });
    b.part(new THREE.SphereGeometry(0.062, 10, 7), EYE, {
      bone: head,
      at: [s * 0.13, 1.42, 1.035],
      scale: [0.84, 1.08, 0.35],
      name: `goldenEye${s}`,
    });
    b.part(new THREE.SphereGeometry(0.025, 8, 6), INK, {
      bone: head,
      at: [s * 0.13, 1.42, 1.06],
      scale: [0.68, 1.3, 0.28],
      name: `verticalPupil${s}`,
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), "#ffffff", {
      bone: head,
      at: [s * 0.108, 1.455, 1.075],
      name: `eyeGlint${s}`,
    });
  }

  // Large jaguar ears.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.22, 0.04],
        [0.17, 0.27],
        [0.02, 0.36],
        [-0.04, 0.16],
      ],
      {
        at: [s * 0.16, 1.49, 0.78],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.012,
        color: COAT_DARK,
        bone: head,
        name: `pointedEar${s}`,
      },
    );
    b.part(new THREE.ConeGeometry(0.045, 0.12, 6), CREAM, {
      bone: head,
      at: [s * 0.17, 1.61, 0.8],
      dir: [0, 1, 0],
      name: `earInner${s}`,
    });
  }

  // Forehead crest, a flamboyant alebrije signature.
  b.extrude(
    [
      [-0.2, 0],
      [0.2, 0],
      [0.16, 0.2],
      [0.08, 0.39],
      [0, 0.55, "sharp"],
      [-0.08, 0.39],
      [-0.16, 0.2],
    ],
    {
      at: [0, 1.47, 0.72],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.01,
      color: PURPLE,
      bone: head,
      name: "purpleForeheadCrest",
    },
  );

  // Painted body rosettes and carved medallions.
  const spots = [
    [0.27, 1.03, 0.1, GOLD],
    [-0.27, 1.03, 0.1, MAGENTA],
    [0.29, 0.88, -0.18, TEAL],
    [-0.29, 0.87, -0.05, GOLD],
    [0.18, 0.98, -0.43, PURPLE],
    [-0.18, 0.97, -0.46, RED],
    [0.12, 1.12, 0.45, BLUE],
    [-0.12, 1.13, 0.42, MAGENTA],
  ] as const;

  for (const [x, y, z, c] of spots) {
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.018, 8), c, {
      at: [x, y, z],
      dir: [x > 0 ? 1 : -1, 0.15, 0.3],
      name: "paintedRosette",
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.022, 8), INK, {
      at: [x, y, z + 0.012],
      dir: [x > 0 ? 1 : -1, 0.15, 0.3],
      name: "rosetteCenter",
    });
  }

  // Facial stripes and cheek whisker rods.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.rod(
        [s * (0.17 + i * 0.015), 1.32 + i * 0.055, 1.0],
        [s * (0.29 + i * 0.025), 1.35 + i * 0.055, 1.08],
        0.012,
        INK,
        { name: `cheekStripe${s}${i}` },
      );
    }
    b.rod(
      [s * 0.12, 1.35, 1.09],
      [s * 0.32, 1.4, 1.14],
      0.006,
      CREAM,
      { name: `whisker${s}a` },
    );
    b.rod(
      [s * 0.12, 1.31, 1.1],
      [s * 0.34, 1.29, 1.17],
      0.006,
      CREAM,
      { name: `whisker${s}b` },
    );
  }

  // Legs receive bright bands, cuffs, and chunky jaguar paws.
  for (const [i, l] of legs.entries()) {
    const p = legPoints[i].target;
    b.part(new THREE.SphereGeometry(0.105, 8, 6), CREAM, {
      at: p,
      scale: [1.15, 0.55, 1.25],
      name: `roundedPaw${i}`,
    });
    for (let t = 0; t < 3; t++) {
      const s = i % 2 ? -1 : 1;
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.09, 6), TALON, {
        at: [p[0] + s * (t - 1) * 0.035, 0.09, p[2] + 0.045],
        dir: [0, 0, 1],
        axis: "z",
        name: `toe${i}${t}`,
      });
    }
    b.sweep(
      catmull([
        [legPoints[i].x * 1.1, 0.42, legPoints[i].z],
        [legPoints[i].x * 1.13, 0.36, legPoints[i].z],
        [legPoints[i].x * 1.17, 0.3, legPoints[i].z],
      ]),
      0.112,
      {
        color: i % 2 ? MAGENTA : BLUE,
        section: { ngon: 6 },
        name: `legPaintCuff${i}`,
      },
    );
  }

  // Tail tip fan.
  for (const s of [1, -1]) {
    b.spike([s * 0.08, 1.15, -1.48], [s * 0.2, 0.34, -0.15], 0.34, 0.045, {
      color: s > 0 ? GOLD : MAGENTA,
      name: `tailFan${s}`,
    });
  }

  // Bright dorsal diamonds and wooden peg details.
  for (let i = 0; i < 5; i++) {
    const z = -0.34 + i * 0.22;
    b.extrude(
      [
        [0, 0],
        [0.07, 0.06],
        [0, 0.16],
        [-0.07, 0.06],
      ],
      {
        at: [0, 1.12 - Math.abs(i - 2) * 0.035, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color: i % 2 ? GOLD : RED,
        bone: spine.joints[Math.min(i, spine.joints.length - 1)],
        name: `dorsalDiamond${i}`,
      },
    );
  }

  // Small wooden-looking joints/rivets around the wings.
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.SphereGeometry(0.025, 6, 4), WOOD, {
        at: [
          s * (0.28 + i * 0.14),
          1.12 + i * 0.06,
          0.22 - i * 0.08,
        ],
        name: `wingWoodRivet${s}${i}`,
      });
    }
  }

  // A few talon hooks at wing tips reinforce the eagle silhouette.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (0.9 + i * 0.16);
      b.spike(
        [x, 1.45 + i * 0.08, -0.12 - i * 0.07],
        [s * 0.08, -0.12, -0.08],
        0.16,
        0.025,
        { color: TALON, name: `wingTalon${s}${i}` },
      );
    }
  }

  return b.root;
}
