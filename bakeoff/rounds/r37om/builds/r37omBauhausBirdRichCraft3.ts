import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A stylized primary-colour songbird perched on a faceted branch, built from bold low-poly geometry with a readable rig, open wings, graphic eyes, crest, tail feathers, and angular feet.",
};

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird", detail: 1 });

  const RED = "#e53935";
  const RED_DARK = "#a91f2b";
  const BLUE = "#2364c4";
  const BLUE_DARK = "#15356e";
  const YELLOW = "#f6c928";
  const YELLOW_LIGHT = "#ffe889";
  const ORANGE = "#ef781f";
  const BLACK = "#171820";
  const WHITE = "#fff8e7";
  const BRANCH = "#70452d";
  const BRANCH_LIGHT = "#a56a3d";
  const BRANCH_DARK = "#3c261e";
  const LEAF_GREEN = "#2e8748";

  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
      <ellipse cx="50" cy="66" rx="43" ry="58" fill="#fff8e7" stroke="#171820" stroke-width="7"/>
      <ellipse cx="53" cy="70" rx="25" ry="39" fill="#2364c4" stroke="#171820" stroke-width="5"/>
      <ellipse cx="56" cy="73" rx="11" ry="27" fill="#171820"/>
      <ellipse cx="45" cy="48" rx="9" ry="14" fill="#ffffff"/>
      <circle cx="67" cy="91" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const wingMark = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M10 75 Q38 13 91 9 Q71 39 27 88 Z" fill="#f6c928"/>
      <path d="M20 77 Q47 30 84 17" fill="none" stroke="#fff8e7" stroke-width="8"/>
      <path d="M31 82 Q54 46 77 28" fill="none" stroke="#2364c4" stroke-width="7"/>
    </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: the bird stands in a neutral, readable puppet pose with wings extended.

  const hips = b.joint("hips", {
    at: [0, 0.72, 0.02],
    dir: [0, 0.3, 0.15],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, 0.02],
      [0, 0.79, 0.07],
      [0, 0.88, 0.12],
      [0, 0.96, 0.15],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      count: 3,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.96, 0.15],
      [0, 1.04, 0.19],
      [0, 1.11, 0.22],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
      count: 2,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.14, 0.23],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.095, 0.285],
    dir: [0, -0.08, 0.45],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.75, -0.12],
      [0, 0.72, -0.28],
      [0, 0.70, -0.48],
      [0, 0.70, -0.66],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
      count: 3,
    },
  );

  const leftWing = b.chain(
    "wingL",
    catmull([
      [0.105, 0.91, 0.13],
      [0.25, 0.90, 0.10],
      [0.43, 0.86, 0.08],
      [0.62, 0.81, 0.10],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingL", "wingL2", "wingLtip"],
      role: "wing",
      count: 3,
    },
  );

  const rightWing = b.chain(
    "wingR",
    catmull([
      [-0.105, 0.91, 0.13],
      [-0.25, 0.90, 0.10],
      [-0.43, 0.86, 0.08],
      [-0.62, 0.81, 0.10],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingR", "wingR2", "wingRtip"],
      role: "wing",
      count: 3,
    },
  );

  const legLPoints = limb(
    [0.075, 0.71, 0.06],
    [0.13, 0.305, 0.06],
    [0.18, 0.17],
    [[0.1, 0, 1], [0, 0, -1]],
  );
  const legRPoints = limb(
    [-0.075, 0.71, 0.06],
    [-0.13, 0.305, 0.06],
    [0.18, 0.17],
    [[-0.1, 0, 1], [0, 0, -1]],
  );

  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "ankleL"],
    role: "leg",
    contact: [0.13, 0.18, 0.06],
  });
  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "ankleR"],
    role: "leg",
    contact: [-0.13, 0.18, 0.06],
  });

  const toeChains: ReturnType<typeof b.chain>[] = [];
  for (const s of [1, -1]) {
    const ankle = s > 0 ? legL.tip : legR.tip;
    const x = s * 0.13;
    for (let i = 0; i < 3; i++) {
      const toeTip: [number, number, number] = [
        x + s * (i - 1) * 0.028,
        0.285,
        0.12 + (i === 2 ? -0.04 : 0.035),
      ];
      toeChains.push(
        b.chain(
          `toe${s > 0 ? "L" : "R"}${i + 1}`,
          [
            [x, 0.305, 0.08],
            [x + s * (i - 1) * 0.014, 0.292, 0.105],
            toeTip,
          ],
          {
            parent: ankle,
            names: [
              `toe${s > 0 ? "L" : "R"}${i + 1}Base`,
              `toe${s > 0 ? "L" : "R"}${i + 1}Tip`,
            ],
            role: "digit",
            count: 2,
          },
        ),
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Branch and small offshoots. Its underside is at y = 0.

  const branchPath = catmull([
    [-0.92, 0.13, -0.14],
    [-0.55, 0.17, -0.04],
    [-0.15, 0.15, 0.02],
    [0.28, 0.18, 0.00],
    [0.72, 0.14, -0.08],
    [1.02, 0.16, -0.02],
  ]);

  const branch = b.sweep(branchPath, (t) => 0.105 - t * 0.025, {
    color: BRANCH,
    sides: 7,
    section: "circle",
    caps: "round",
    name: "mainBranch",
    group: "scenery",
  });

  const twigA = b.sweep(
    catmull([
      [-0.64, 0.16, -0.05],
      [-0.78, 0.31, -0.10],
      [-0.85, 0.45, -0.08],
    ]),
    [0.045, 0.018],
    {
      color: BRANCH_LIGHT,
      sides: 6,
      caps: "round",
      name: "twigA",
      group: "scenery",
    },
  );

  const twigB = b.sweep(
    catmull([
      [0.67, 0.15, -0.06],
      [0.78, 0.28, -0.01],
      [0.88, 0.38, 0.02],
    ]),
    [0.035, 0.012],
    {
      color: BRANCH_DARK,
      sides: 6,
      caps: "round",
      name: "twigB",
      group: "scenery",
    },
  );

  // Angular Bauhaus leaves, kept sparse so the bird remains the hero.
  for (const [x, y, z, flip] of [
    [-0.86, 0.45, -0.08, 1],
    [0.88, 0.38, 0.02, -1],
  ] as [number, number, number, number][]) {
    b.extrude(
      [
        [0, 0],
        [0.13 * flip, 0.035],
        [0.17 * flip, 0.11],
        [0.07 * flip, 0.18],
        [-0.04 * flip, 0.09],
      ],
      {
        at: [x, y, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.004,
        color: LEAF_GREEN,
        name: "geometricLeaf",
        group: "scenery",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Body: chunky, faceted, primary-colour geometry.

  const body = b.sweep(spine, (t) => 0.17 - 0.025 * t, {
    color: YELLOW,
    sides: 8,
    section: "circle",
    caps: "round",
    name: "goldenBody",
    group: "body",
  });

  b.sweep(neck, [0.12, 0.10], {
    color: RED,
    sides: 8,
    caps: "round",
    name: "redNeck",
    group: "body",
  });

  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    RED,
    {
      bone: head,
      at: [0, 1.14, 0.23],
      scale: [0.145, 0.15, 0.145],
      flat: true,
      name: "facetedHead",
      group: "head",
    },
  );

  // Yellow cheek discs and a graphic red crown.
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      YELLOW_LIGHT,
      {
        bone: head,
        at: [s * 0.078, 1.105, 0.325],
        scale: [0.067, 0.065, 0.025],
        dir: [0, 0, 1],
        name: "cheek",
        group: "face",
      },
    );
  }

  b.extrude(
    [
      [-0.09, 0],
      [-0.06, 0.13],
      [-0.015, 0.08],
      [0.025, 0.20],
      [0.06, 0.09],
      [0.10, 0.14],
      [0.11, 0],
    ],
    {
      at: [0, 1.245, 0.18],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: RED_DARK,
      bone: head,
      name: "threePointCrest",
      group: "head",
    },
  );

  // Eyes are large graphic Bauhaus decals, intentionally oversized.
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.075, 0.098), WHITE, {
      bone: head,
      at: [s * 0.075, 1.16, 0.363],
      dir: [0, 0, 1],
      axis: "z",
      texture: eyeTexture,
      name: "graphicEye",
      group: "face",
    });
  }

  // Separate upper and lower beak/jaw: the jaw is an independently riggable hinge.
  b.part(
    new THREE.ConeGeometry(0.055, 0.17, 5),
    ORANGE,
    {
      bone: head,
      at: [0, 1.12, 0.39],
      dir: [0, -0.02, 1],
      name: "upperBeak",
      group: "face",
    },
  );

  b.part(
    new THREE.ConeGeometry(0.042, 0.115, 5),
    RED_DARK,
    {
      bone: jaw,
      at: [0, 1.078, 0.355],
      dir: [0, -0.18, 1],
      name: "lowerBeakJaw",
      group: "jaw",
    },
  );

  // A small black mouth seam emphasizes the separate jaw.
  b.rod([0, 1.095, 0.36], [0, 1.087, 0.425], 0.008, {
    color: BLACK,
    bone: jaw,
    name: "mouthSeam",
    group: "jaw",
  });

  // Belly medallion: a simple circle gives the silhouette a strong graphic focal point.
  b.part(
    new THREE.CylinderGeometry(0.103, 0.103, 0.018, 12),
    WHITE,
    {
      bone: spine.joints[1],
      at: [0, 0.82, 0.185],
      dir: [0, 0, 1],
      name: "bellyMedallion",
      group: "body",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.052, 0.052, 0.021, 10),
    RED,
    {
      bone: spine.joints[1],
      at: [0, 0.82, 0.198],
      dir: [0, 0, 1],
      name: "bellyDot",
      group: "body",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Wings: strong red-blue planar silhouettes, extended in the neutral rest pose.

  const wingL = b.sweep(leftWing, [0.075, 0.025], {
    color: BLUE_DARK,
    sides: 6,
    caps: "round",
    name: "leftWingArm",
    group: "wing",
  });
  const wingR = b.sweep(rightWing, [0.075, 0.025], {
    color: BLUE_DARK,
    sides: 6,
    caps: "round",
    name: "rightWingArm",
    group: "wing",
  });

  b.membrane(
    leftWing,
    [
      [0.105, 0.91, 0.13],
      [0.22, 1.04, 0.08],
      [0.46, 1.00, 0.06],
      [0.62, 0.81, 0.10],
    ],
    {
      color: BLUE,
      thickness: 0.018,
      rows: 3,
      cols: 8,
      scallop: 0.12,
      name: "leftWingMembrane",
      group: "wing",
    },
  );

  b.membrane(
    rightWing,
    [
      [-0.105, 0.91, 0.13],
      [-0.22, 1.04, 0.08],
      [-0.46, 1.00, 0.06],
      [-0.62, 0.81, 0.10],
    ],
    {
      color: BLUE,
      thickness: 0.018,
      rows: 3,
      cols: 8,
      scallop: 0.12,
      name: "rightWingMembrane",
      group: "wing",
    },
  );

  for (const s of [1, -1]) {
    const wingBase = s > 0 ? [0.20, 0.91, 0.105] : [-0.20, 0.91, 0.105];
    b.part(new THREE.PlaneGeometry(0.24, 0.19), YELLOW, {
      at: wingBase,
      dir: [s, 0.12, 0.2],
      axis: "z",
      texture: wingMark,
      name: "wingGraphic",
      group: "wing",
    });

    for (let i = 0; i < 4; i++) {
      const root: [number, number, number] = [
        s * (0.23 + i * 0.045),
        0.90 - i * 0.018,
        0.09 - i * 0.004,
      ];
      const tip: [number, number, number] = [
        s * (0.42 + i * 0.055),
        0.77 - i * 0.018,
        0.10 + i * 0.012,
      ];
      b.rod(root, tip, 0.014, {
        color: YELLOW_LIGHT,
        bone: s > 0 ? leftWing.joints[1] : rightWing.joints[1],
        name: "wingFeatherRib",
        group: "wing",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Tail: three large graphic feathers with a blue outer fan and red centre.

  b.sweep(tail, [0.11, 0.028], {
    color: RED_DARK,
    sides: 7,
    caps: "round",
    name: "tailBase",
    group: "tail",
  });

  const tailFeathers: [number, number, number, number][] = [
    [-0.10, 0.70, -0.38, -0.20],
    [0, 0.69, -0.41, 0],
    [0.10, 0.70, -0.38, 0.20],
  ];
  for (const [x, y, z, spread] of tailFeathers) {
    b.extrude(
      [
        [0, 0],
        [0.045 + spread, 0.015],
        [0.06 + spread, 0.34],
        [-0.025 + spread, 0.27],
        [-0.06 + spread, 0.04],
      ],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        bevel: 0.006,
        color: BLUE,
        bone: tail.joints[1],
        name: "tailFeather",
        group: "tail",
      },
    );
  }
  b.part(
    new THREE.ConeGeometry(0.075, 0.16, 6),
    YELLOW,
    {
      bone: tail.tip,
      at: [0, 0.705, -0.65],
      dir: [0, 0, -1],
      name: "tailAccent",
      group: "tail",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Legs and feet: orange angular rods, with three splayed toes per foot.

  for (const s of [1, -1]) {
    const leg = s > 0 ? legL : legR;
    b.sweep(leg, [0.038, 0.026], {
      color: ORANGE,
      sides: 6,
      caps: "round",
      name: "orangeLeg",
      group: "leg",
    });

    b.part(new THREE.SphereGeometry(0.043, 7, 5), ORANGE, {
      bone: leg.tip,
      at: leg.tip.at,
      name: "ankle",
      group: "leg",
    });

    for (let i = 0; i < 3; i++) {
      const toe = toeChains[s > 0 ? i : 3 + i];
      b.sweep(toe, [0.018, 0.008], {
        color: ORANGE,
        sides: 5,
        caps: "round",
        name: "toe",
        group: "digit",
      });
    }
  }

  // A few dark triangular branch knots make the perch feel constructed rather than generic.
  for (const p of [
    [-0.34, 0.20, 0.065],
    [0.15, 0.19, 0.07],
    [0.55, 0.18, -0.01],
  ] as [number, number, number][]) {
    b.part(new THREE.ConeGeometry(0.035, 0.045, 6), BRANCH_DARK, {
      at: p,
      dir: [0, 1, 0],
      name: "branchKnot",
      group: "scenery",
    });
  }

  return b.root;
}
