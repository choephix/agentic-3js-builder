import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A stylized songbird built from bold low-poly primary-colour geometry, perched on a faceted branch with graphic wings, tail feathers, eyes, beak, toes and painted geometric accents.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const BLUE = "#1769aa";
  const BLUE_DARK = "#0d3f73";
  const RED = "#e53935";
  const RED_DARK = "#a91f2a";
  const YELLOW = "#f5c518";
  const YELLOW_LIGHT = "#ffe36e";
  const BLACK = "#171923";
  const WHITE = "#fff8e7";
  const BRANCH = "#5b3826";
  const BRANCH_LIGHT = "#9a6336";
  const BRANCH_DARK = "#30231f";
  const GREEN = "#269c62";

  const flatSphere = (r: number) =>
    new THREE.SphereGeometry(r, 10, 7);

  const smallSphere = (r: number) =>
    new THREE.SphereGeometry(r, 8, 6);

  const box = (x: number, y: number, z: number) =>
    new THREE.BoxGeometry(x, y, z);

  const cylinder = (r: number, h: number, sides = 8) =>
    new THREE.CylinderGeometry(r, r, h, sides);

  const root = b.joint("hips", {
    at: [0, 0.73, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "bird",
  });

  // ---------------------------------------------------------------------------
  // Branch and grounded stump. The branch is a simple Bauhaus stage: angular,
  // dark underneath, warm on top, with two graphic green leaf clusters.
  // ---------------------------------------------------------------------------

  const branchPath = catmull([
    [-0.38, 0.035, -0.68],
    [-0.26, 0.13, -0.42],
    [-0.12, 0.22, -0.17],
    [0.02, 0.30, 0.10],
    [0.18, 0.34, 0.34],
    [0.42, 0.39, 0.54],
  ]);

  const branch = b.sweep(branchPath, (t) => 0.075 - t * 0.032, {
    color: BRANCH,
    sides: 7,
    caps: "round",
    name: "mainBranch",
    group: "stage",
    sectors: [
      [-55, 55, BRANCH_LIGHT],
      [125, 235, BRANCH_DARK],
    ],
  });

  const leftTwig = catmull([
    [-0.08, 0.235, -0.08],
    [-0.22, 0.36, 0.08],
    [-0.32, 0.50, 0.27],
  ]);
  b.sweep(leftTwig, [0.043, 0.018], {
    color: BRANCH,
    sides: 6,
    caps: "round",
    name: "twigL",
    group: "stage",
  });

  const rightTwig = catmull([
    [0.22, 0.35, 0.37],
    [0.34, 0.48, 0.43],
    [0.43, 0.58, 0.42],
  ]);
  b.sweep(rightTwig, [0.035, 0.012], {
    color: BRANCH_LIGHT,
    sides: 6,
    caps: "round",
    name: "twigR",
    group: "stage",
  });

  b.part(cylinder(0.115, 0.19, 7), BRANCH_DARK, {
    at: [-0.38, 0.095, -0.68],
    dir: [0, 1, 0],
    name: "groundedStump",
    group: "stage",
  });

  // Graphic leaf discs at the twig tips.
  for (const [x, y, z, s] of [
    [-0.34, 0.53, 0.29, 1],
    [-0.28, 0.59, 0.24, -1],
    [0.43, 0.61, 0.42, 1],
    [0.39, 0.66, 0.34, -1],
  ] as [number, number, number, number][]) {
    b.part(new THREE.SphereGeometry(0.075, 8, 4), GREEN, {
      at: [x, y, z],
      scale: [1.15, 0.32, 0.82],
      rotation: [0, s * 28, s * 18],
      name: "leaf",
      group: "stage",
    });
  }

  // ---------------------------------------------------------------------------
  // Skeleton first: torso, neck, head, jaw, wings, legs and toes.
  // ---------------------------------------------------------------------------

  const torsoPath = catmull([
    [0, 0.72, -0.10],
    [0, 0.77, 0.02],
    [0, 0.83, 0.13],
  ]);
  const torso = b.chain("torso", torsoPath, {
    parent: root,
    names: ["chest", "shoulders", "torsoTip"],
    role: "spine",
    group: "bird",
  });

  const neckPath = catmull([
    [0, 0.83, 0.13],
    [0, 0.91, 0.15],
    [0, 1.00, 0.17],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: torso.tip!,
    names: ["neckBase", "neckMid", "neckTip"],
    role: "neck",
    group: "bird",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.04, 0.19],
    dir: [0, 0.02, 1],
    role: "head",
    group: "bird",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.005, 0.265],
    dir: [0, -0.06, 1],
    role: "jaw",
    group: "bird",
  });

  const wingLPath = catmull([
    [0.16, 0.86, 0.07],
    [0.27, 0.82, 0.09],
    [0.39, 0.73, 0.16],
    [0.48, 0.62, 0.25],
  ]);
  const wingL = b.chain("wingL", wingLPath, {
    parent: torso.joints[1],
    names: ["shoulderL", "elbowL", "wingTipL"],
    role: "wing",
    group: "bird",
  });

  const wingRPath = catmull([
    [-0.16, 0.86, 0.07],
    [-0.27, 0.82, 0.09],
    [-0.39, 0.73, 0.16],
    [-0.48, 0.62, 0.25],
  ]);
  const wingR = b.chain("wingR", wingRPath, {
    parent: torso.joints[1],
    names: ["shoulderR", "elbowR", "wingTipR"],
    role: "wing",
    group: "bird",
  });

  const legLPoints = [
    [0.105, 0.68, 0.06],
    [0.12, 0.52, 0.12],
    [0.13, 0.405, 0.17],
    [0.13, 0.365, 0.25],
  ];
  const legRPoints = [
    [-0.105, 0.68, 0.06],
    [-0.12, 0.52, 0.12],
    [-0.13, 0.405, 0.17],
    [-0.13, 0.365, 0.25],
  ];

  const legL = b.chain("legL", legLPoints, {
    parent: torso.joints[0],
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.13, 0.30, 0.25],
    group: "bird",
  });

  const legR = b.chain("legR", legRPoints, {
    parent: torso.joints[0],
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.13, 0.30, 0.25],
    group: "bird",
  });

  const toeL1 = b.chain("toeL1", [
    [0.13, 0.365, 0.25],
    [0.20, 0.345, 0.30],
  ], {
    parent: legL.tip,
    names: ["toeL1"],
    role: "digit",
    group: "bird",
  });

  const toeL2 = b.chain("toeL2", [
    [0.13, 0.365, 0.25],
    [0.13, 0.345, 0.35],
  ], {
    parent: legL.tip,
    names: ["toeL2"],
    role: "digit",
    group: "bird",
  });

  const toeL3 = b.chain("toeL3", [
    [0.13, 0.365, 0.25],
    [0.055, 0.345, 0.31],
  ], {
    parent: legL.tip,
    names: ["toeL3"],
    role: "digit",
    group: "bird",
  });

  const toeR1 = b.chain("toeR1", [
    [-0.13, 0.365, 0.25],
    [-0.20, 0.345, 0.30],
  ], {
    parent: legR.tip,
    names: ["toeR1"],
    role: "digit",
    group: "bird",
  });

  const toeR2 = b.chain("toeR2", [
    [-0.13, 0.365, 0.25],
    [-0.13, 0.345, 0.35],
  ], {
    parent: legR.tip,
    names: ["toeR2"],
    role: "digit",
    group: "bird",
  });

  const toeR3 = b.chain("toeR3", [
    [-0.13, 0.365, 0.25],
    [-0.055, 0.345, 0.31],
  ], {
    parent: legR.tip,
    names: ["toeR3"],
    role: "digit",
    group: "bird",
  });

  // ---------------------------------------------------------------------------
  // Torso and head: large primary colour masses with deliberately graphic
  // proportions.
  // ---------------------------------------------------------------------------

  b.sweep(torso, [0.19, 0.205], {
    color: BLUE,
    sides: 8,
    skin: "smooth",
    name: "blueBody",
    group: "bird",
    sectors: [
      [-60, 60, BLUE],
      [120, 240, BLUE_DARK],
    ],
  });

  b.sweep(neck, [0.14, 0.17], {
    color: RED,
    sides: 8,
    name: "redNeck",
    group: "bird",
  });

  b.part(flatSphere(0.185), RED, {
    bone: head,
    at: [0, 1.045, 0.20],
    scale: [1.0, 0.95, 0.94],
    name: "redHead",
    group: "bird",
  });

  // A blue geometric cap on the back of the head.
  b.part(new THREE.SphereGeometry(0.19, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.46), BLUE, {
    bone: head,
    at: [0, 1.06, 0.185],
    rotation: [Math.PI, 0, 0],
    name: "blueHeadCap",
    group: "bird",
  });

  // White cheek discs make the face readable from a distance.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.092, 8, 5), WHITE, {
      bone: head,
      at: [s * 0.115, 1.005, 0.275],
      scale: [0.9, 1.0, 0.34],
      name: s > 0 ? "cheekL" : "cheekR",
      group: "bird",
    });
  }

  // ---------------------------------------------------------------------------
  // Face first: eyes, brows, beak and the separate open lower jaw.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.040, 8, 6), BLACK, {
      bone: head,
      at: [s * 0.088, 1.075, 0.348],
      name: s > 0 ? "eyeL" : "eyeR",
      group: "face",
    });

    b.part(new THREE.SphereGeometry(0.014, 6, 4), WHITE, {
      bone: head,
      at: [s * 0.075, 1.091, 0.379],
      name: s > 0 ? "eyeGlintL" : "eyeGlintR",
      group: "face",
    });

    b.part(new THREE.BoxGeometry(0.092, 0.018, 0.026), RED_DARK, {
      bone: head,
      at: [s * 0.092, 1.135, 0.34],
      rotation: [0, s * 0.18, s * 0.22],
      name: s > 0 ? "browL" : "browR",
      group: "face",
    });
  }

  // Beak is a two-colour Bauhaus wedge, aimed toward +Z.
  b.part(new THREE.ConeGeometry(0.072, 0.19, 4), YELLOW, {
    bone: head,
    at: [0, 1.045, 0.405],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [0, 0, Math.PI / 4],
    name: "upperBeak",
    group: "face",
  });

  b.part(new THREE.ConeGeometry(0.058, 0.145, 4), YELLOW_LIGHT, {
    bone: jaw,
    at: [0, 1.002, 0.385],
    dir: [0, -0.07, 1],
    axis: "z",
    rotation: [0, 0, Math.PI / 4],
    name: "lowerBeak",
    group: "face",
  });

  b.part(new THREE.BoxGeometry(0.012, 0.11, 0.012), BLACK, {
    bone: jaw,
    at: [0, 1.018, 0.414],
    rotation: [0.10, 0, 0],
    name: "beakMouthLine",
    group: "face",
  });

  // ---------------------------------------------------------------------------
  // Wings: broad red blades, dark blue lower panels and yellow circular badges.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = s > 0 ? wingL : wingR;

    b.sweep(wing, [0.10, 0.038], {
      color: RED_DARK,
      sides: 6,
      caps: "round",
      name: `wingArm${side}`,
      group: "wings",
    });

    b.extrude(
      [
        [0, 0],
        [0.19, 0.015],
        [0.24, 0.12],
        [0.18, 0.28],
        [0.04, 0.35],
        [-0.02, 0.22],
      ],
      {
        at: [s * 0.275, 0.73, 0.135],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        color: RED,
        bone: wing.joints[1]!,
        name: `wingRed${side}`,
        group: "wings",
      },
    );

    b.extrude(
      [
        [0, 0],
        [0.14, 0],
        [0.16, 0.09],
        [0.10, 0.16],
        [0.02, 0.18],
      ],
      {
        at: [s * 0.315, 0.67, 0.158],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.043,
        bevel: 0.005,
        color: BLUE_DARK,
        bone: wing.joints[1]!,
        name: `wingBluePanel${side}`,
        group: "wings",
      },
    );

    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.018, 12), YELLOW, {
      bone: wing.joints[1],
      at: [s * 0.345, 0.825, 0.16],
      dir: [0, 0, 1],
      rotation: [Math.PI / 2, 0, 0],
      bone: wing.joints[1]!,
      name: `wingRoundel${side}`,
      group: "wings",
    });

    b.part(new THREE.SphereGeometry(0.016, 6, 4), BLACK, {
      bone: wing.joints[1]!,
      at: [s * 0.345, 0.825, 0.181],
      name: `wingRoundelCenter${side}`,
      group: "wings",
    });
  }

  // ---------------------------------------------------------------------------
  // Tail: three separated graphic feathers, blue roots with red and yellow tips.
  // ---------------------------------------------------------------------------

  const tailBase = [0, 0.73, -0.15] as const;
  const tailTips = [
    [0.0, 0.70, -0.58],
    [0.105, 0.72, -0.53],
    [-0.105, 0.72, -0.53],
  ] as const;

  for (let i = 0; i < tailTips.length; i++) {
    const tip = tailTips[i];
    const p = catmull([
      [tailBase[0], tailBase[1], tailBase[2]],
      [tailBase[0] + tip[0] * 0.45, 0.70, -0.31],
      [tip[0], tip[1], tip[2]],
    ]);
    b.sweep(p, [0.072 - i * 0.008, 0.012], {
      color: i === 0 ? RED : BLUE_DARK,
      sides: 5,
      caps: "point",
      name: `tailFeather${i}`,
      group: "tail",
    });

    b.part(new THREE.SphereGeometry(0.040, 7, 4), YELLOW, {
      at: [tip[0], tip[1], tip[2] + 0.018],
      scale: [1.0, 0.65, 0.38],
      name: `tailTip${i}`,
      group: "tail",
    });
  }

  // ---------------------------------------------------------------------------
  // Legs and toes: thin dark rods, yellow feet gripping the branch.
  // ---------------------------------------------------------------------------

  b.sweep(legL, [0.026, 0.020], {
    color: YELLOW,
    sides: 6,
    caps: "round",
    name: "legL",
    group: "feet",
  });
  b.sweep(legR, [0.026, 0.020], {
    color: YELLOW,
    sides: 6,
    caps: "round",
    name: "legR",
    group: "feet",
  });

  const toes = [
    [toeL1, "toeL1"],
    [toeL2, "toeL2"],
    [toeL3, "toeL3"],
    [toeR1, "toeR1"],
    [toeR2, "toeR2"],
    [toeR3, "toeR3"],
  ] as const;

  for (const [toe, name] of toes) {
    b.sweep(toe, [0.018, 0.009], {
      color: YELLOW_LIGHT,
      sides: 5,
      caps: "round",
      name,
      group: "feet",
    });
  }

  // Small dark ankle cuffs add a crisp graphic break.
  for (const [x, name] of [
    [0.13, "ankleCuffL"],
    [-0.13, "ankleCuffR"],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.045, 6), BLUE_DARK, {
      at: [x, 0.425, 0.16],
      dir: [0, 1, 0],
      name,
      group: "feet",
    });
  }

  // ---------------------------------------------------------------------------
  // Graphic body ornaments: a yellow chest medallion, red belly stripe and
  // three small blue buttons.
  // ---------------------------------------------------------------------------

  b.part(new THREE.SphereGeometry(0.115, 10, 5), YELLOW, {
    bone: torso.joints[1],
    at: [0, 0.825, 0.205],
    scale: [0.88, 1.0, 0.24],
    name: "goldChestMedallion",
    group: "ornament",
  });

  b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.014, 12), RED, {
    bone: torso.joints[1],
    at: [0, 0.825, 0.238],
    dir: [0, 0, 1],
    rotation: [Math.PI / 2, 0, 0],
    name: "chestRedCircle",
    group: "ornament",
  });

  for (const y of [0.70, 0.755, 0.81]) {
    b.part(new THREE.SphereGeometry(0.017, 6, 4), BLUE_DARK, {
      bone: torso.joints[0]!,
      at: [0, y, 0.207],
      name: "bellyButton",
      group: "ornament",
    });
  }

  // A small red geometric crest gives the silhouette a singing, alert character.
  b.extrude(
    [
      [-0.12, 0],
      [-0.08, 0.105],
      [-0.015, 0.19],
      [0.05, 0.105],
      [0.12, 0],
      [0.07, -0.012],
      [0, 0.07],
      [-0.07, -0.012],
    ],
    {
      at: [0, 1.18, 0.17],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.004,
      color: RED,
      bone: head,
      name: "crest",
      group: "face",
    },
  );

  // Add a few warm branch facets beneath the bird so the perch reads as wood,
  // not as a generic tube.
  b.part(new THREE.BoxGeometry(0.12, 0.018, 0.16), BRANCH_LIGHT, {
    at: [0.02, 0.348, 0.12],
    rotation: [0, 0.22, 0],
    name: "branchTopFacet",
    group: "stage",
  });

  b.part(new THREE.BoxGeometry(0.08, 0.014, 0.11), BRANCH_DARK, {
    at: [-0.18, 0.223, -0.18],
    rotation: [0, -0.3, 0],
    name: "branchDarkFacet",
    group: "stage",
  });

  // Deterministic tiny seed-dependent accent dots on the branch: restrained,
  // but enough to suggest the Bauhaus printmaking vocabulary.
  const accents = rng(12);
  for (let i = 0; i < 5; i++) {
    const x = -0.30 + accents() * 0.55;
    const z = -0.50 + accents() * 0.78;
    const y = 0.055 + (x + 0.38) * 0.46;
    b.part(new THREE.SphereGeometry(0.012, 6, 4), YELLOW, {
      at: [x, y + 0.068, z],
      name: "branchAccent",
      group: "stage",
    });
  }

  return b.root;
}
