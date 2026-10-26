```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  limb,
  polyline,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A low-poly songbird perched on a geometric branch, built from bold primary-colour shapes with graphic eyes, wings, tail feathers, musical emblems, and tiny gripping toes.",
};

const BLUE = "#1557A6";
const BLUE_DARK = "#0D3268";
const RED = "#D9363E";
const RED_DARK = "#8D1F32";
const YELLOW = "#F5C62D";
const YELLOW_DARK = "#C58C16";
const WHITE = "#F7F1DF";
const BLACK = "#171820";
const BARK = "#523A2D";
const BARK_LIGHT = "#866044";
const ORANGE = "#E98227";

const EYE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <circle cx="48" cy="48" r="42" fill="#f7f1df" stroke="#171820" stroke-width="8"/>
    <circle cx="48" cy="50" r="25" fill="#1557a6" stroke="#171820" stroke-width="5"/>
    <ellipse cx="48" cy="53" rx="10" ry="19" fill="#171820"/>
    <circle cx="39" cy="39" r="8" fill="#ffffff"/>
    <circle cx="59" cy="64" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const NOTE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <path d="M55 18v48.5c-3.6-2.7-9.2-4.3-14.5-3.2-8.8 1.7-14.1 8.2-11.2 14.5
      2.8 6.3 13.1 8.2 21.1 3.9 6.7-3.6 9.2-9.3 7.2-15.5V34l24-7v25.5
      c-3.6-2.6-9.1-4.2-14.4-3.1-8.8 1.7-14.2 8.2-11.3 14.5 2.8 6.3 13.2 8.2
      21.2 3.9 6.7-3.6 9.2-9.3 7.2-15.5V12z" fill="#171820"/>
    <path d="M55 18l30-6v12l-30 7z" fill="#d9363e"/>
  </svg>`,
  { size: 128 },
);

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  depth: number,
  color: string,
  at: THREE.Vector3 | readonly number[],
  name: string,
  bone: any,
  segments = 12,
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, depth, segments, 1, false),
    color,
    {
      at,
      bone,
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name,
    },
  );
}

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string,
  at: THREE.Vector3 | readonly number[],
  name: string,
  bone: any,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    flat: true,
    name,
  });
}

function build() {
  const b = createBuilder({
    name: "bauhaus-songbird",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one compact spine, a hinged jaw, separated wings, a tail, and planted legs with toes.

  const hips = b.joint("hips", {
    at: [0, 0.285, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "bird",
  });

  const neck = b.joint("neck", {
    parent: hips,
    at: [0, 0.415, 0.095],
    dir: [0, 0.18, 1],
    role: "neck",
    group: "bird",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.485, 0.165],
    dir: [0, 0.06, 1],
    role: "head",
    group: "bird",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.462, 0.245],
    dir: [0, -0.13, 1],
    role: "jaw",
    group: "face",
  });

  const tailPath = catmull([
    [0, 0.335, -0.085],
    [0, 0.33, -0.18],
    [0, 0.325, -0.285],
    [0, 0.32, -0.38],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tailBase", "tail2", "tail3", "tailTip"],
    role: "tail",
    group: "bird",
  });

  const wingLPath = catmull([
    [0.072, 0.41, 0.045],
    [0.17, 0.46, 0.015],
    [0.285, 0.43, -0.035],
  ]);

  const wingRPath = catmull([
    [-0.072, 0.41, 0.045],
    [-0.17, 0.46, 0.015],
    [-0.285, 0.43, -0.035],
  ]);

  const wingL = b.chain("wingL", wingLPath, {
    parent: hips,
    names: ["wingL", "wingTipL", "wingEndL"],
    role: "wing",
    group: "wings",
  });

  const wingR = b.chain("wingR", wingRPath, {
    parent: hips,
    names: ["wingR", "wingTipR", "wingEndR"],
    role: "wing",
    group: "wings",
  });

  const legData: {
    side: number;
    leg: ReturnType<typeof b.chain>;
    foot: THREE.Vector3;
    toeFront: ReturnType<typeof b.chain>;
    toeBack: ReturnType<typeof b.chain>;
  }[] = [];

  for (const side of [1, -1]) {
    const hipPoint = [side * 0.055, 0.285, 0.005] as const;
    const footTarget = [side * 0.06, 0.098, 0.05] as const;
    const legPoints = limb(
      hipPoint,
      footTarget,
      [0.105, 0.095],
      [[0, 0, 1]],
    );

    const leg = b.chain(
      side > 0 ? "legL" : "legR",
      legPoints,
      {
        parent: hips,
        names:
          side > 0
            ? ["hipL", "ankleL", "footL"]
            : ["hipR", "ankleR", "footR"],
        role: "leg",
        group: "legs",
        contact: [side * 0.06, 0.09, 0.05],
      },
    );

    const foot = legPoints[legPoints.length - 1].clone();

    const frontTip = [side * 0.092, 0.092, 0.115] as const;
    const backTip = [side * 0.035, 0.09, -0.025] as const;

    const toeFront = b.chain(
      side > 0 ? "toeLF" : "toeRF",
      polyline([foot, frontTip]),
      {
        parent: leg.tip!,
        names:
          side > 0 ? ["toeLF", "toeLFtip"] : ["toeRF", "toeRFtip"],
        role: "digit",
        group: "feet",
      },
    );

    const toeBack = b.chain(
      side > 0 ? "toeLB" : "toeRB",
      polyline([foot, backTip]),
      {
        parent: leg.tip!,
        names:
          side > 0 ? ["toeLB", "toeLBtip"] : ["toeRB", "toeRBtip"],
        role: "digit",
        group: "feet",
      },
    );

    legData.push({ side, leg, foot, toeFront, toeBack });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Scenery: a single stout branch that reaches the floor and remains simpler than the bird.

  const branchPath = catmull([
    [0, 0.045, -0.62],
    [-0.02, 0.048, -0.34],
    [0.015, 0.045, 0],
    [-0.01, 0.047, 0.34],
    [0.025, 0.052, 0.68],
  ]);

  const branch = b.sweep(branchPath, 0.045, {
    bone: hips,
    color: BARK,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    skin: "rigid",
    group: "branch",
    name: "mainBranch",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Body and head: deliberately chunky, faceted, and organized around circles, wedges, and bars.

  const bodyPath = catmull([
    [0, 0.355, -0.12],
    [0, 0.375, -0.045],
    [0, 0.39, 0.065],
    [0, 0.405, 0.145],
  ]);

  const body = b.sweep(
    bodyPath,
    () => [0.078, 0.091],
    {
      bone: hips,
      color: BLUE,
      sides: 8,
      caps: "round",
      section: "circle",
      bands: [
        [0.72, BLUE],
        [0.81, RED],
        [0.9, BLUE],
      ],
      sectors: [[112, 248, YELLOW]],
      group: "body",
      name: "facetedBody",
    },
  );

  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BLUE,
    {
      bone: head,
      at: head.at,
      scale: [0.092, 0.087, 0.101],
      flat: true,
      group: "head",
      name: "roundHead",
    },
  );

  // A small white neck collar and a red geometric breast badge make the head/body boundary graphic.
  b.sweep(
    catmull([
      [0, 0.432, 0.118],
      [0, 0.441, 0.132],
      [0, 0.45, 0.145],
    ]),
    0.087,
    {
      bone: neck,
      color: WHITE,
      sides: 8,
      caps: "round",
      group: "body",
      name: "whiteCollar",
    },
  );

  cylinder(
    b,
    0.052,
    0.014,
    RED,
    [0, 0.382, 0.164],
    "redBreastRoundel",
    hips,
    12,
  );

  cylinder(
    b,
    0.028,
    0.018,
    YELLOW,
    [0, 0.382, 0.176],
    "goldBreastCore",
    hips,
    10,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Face first: eyes, cheeks, two jaw pieces, and a bold wedge-like beak.

  const headSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const eyeHit = headSurface.around(head.at).at(side * 24, 8);
    if (eyeHit) {
      b.decal(headSurface, EYE_TEXTURE, {
        at: eyeHit,
        size: [0.043, 0.052],
        lift: 0.002,
        segments: [5, 6],
        mirror: side > 0,
        group: "face",
        name: side > 0 ? "leftEye" : "rightEye",
      });
    }

    cylinder(
      b,
      0.016,
      0.009,
      RED,
      [side * 0.061, 0.458, 0.252],
      side > 0 ? "leftCheek" : "rightCheek",
      head,
      10,
    );
  }

  const upperBeakBase = [0, 0.487, 0.245] as const;
  const beakTip = [0, 0.477, 0.34] as const;

  b.spike(upperBeakBase, beakTip, null, 0.032, YELLOW, {
    bone: head,
    caps: { start: "round", end: "point" },
    sides: 6,
    group: "face",
    name: "upperBeak",
  });

  b.spike(jaw.at, [0, 0.452, 0.305], null, 0.022, ORANGE, {
    bone: jaw,
    caps: { start: "round", end: "point" },
    sides: 6,
    group: "face",
    name: "lowerBeak",
  });

  b.rod(
    [0, 0.466, 0.27],
    [0, 0.458, 0.31],
    0.004,
    BLACK,
    {
      bone: jaw,
      caps: "round",
      sides: 6,
      group: "face",
      name: "mouthLine",
    },
  );

  // A tiny black throat bar gives the openable jaw a visible hinge.
  cylinder(
    b,
    0.012,
    0.015,
    BLACK,
    [0, 0.464, 0.246],
    "jawHinge",
    jaw,
    8,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: extended in a readable rest pose, with red Bauhaus silhouettes, blue arm bars, yellow discs,
  // and a musical-note emblem on each side.

  b.sweep(wingL, [0.027, 0.011], {
    bone: wingL,
    color: BLUE_DARK,
    section: { ngon: 6 },
    caps: "round",
    group: "wings",
    name: "leftWingArm",
  });

  b.sweep(wingR, [0.027, 0.011], {
    bone: wingR,
    color: BLUE_DARK,
    section: { ngon: 6 },
    caps: "round",
    group: "wings",
    name: "rightWingArm",
  });

  const wingOutline = (side: number): [number, number][] => [
    [0, -0.045],
    [side * 0.095, -0.035],
    [side * 0.225, 0.055],
    [side * 0.185, 0.145],
    [side * 0.09, 0.17],
    [side * 0.025, 0.105],
  ];

  for (const side of [1, -1]) {
    const wingBone = side > 0 ? wingL.joints[0] : wingR.joints[0];

    b.extrude(wingOutline(side), {
      at: [side * 0.07, 0.405, 0.038],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 0,
      bone: wingBone,
      color: RED,
      group: "wings",
      name: side > 0 ? "leftRedWing" : "rightRedWing",
    });

    cylinder(
      b,
      0.043,
      0.014,
      YELLOW,
      [side * 0.172, 0.475, 0.054],
      side > 0 ? "leftWingSun" : "rightWingSun",
      wingBone,
      12,
    );

    cylinder(
      b,
      0.021,
      0.018,
      BLUE,
      [side * 0.172, 0.475, 0.064],
      side > 0 ? "leftWingBlueCore" : "rightWingBlueCore",
      wingBone,
      10,
    );

    b.part(
      new THREE.PlaneGeometry(0.078, 0.078),
      WHITE,
      {
        at: [side * 0.185, 0.5, 0.069],
        dir: [0, 0, 1],
        axis: "z",
        bone: wingBone,
        texture: NOTE_TEXTURE,
        group: "wings",
        name: side > 0 ? "leftMusicMark" : "rightMusicMark",
      },
    );

    // Three short graphic feather bars reinforce the wing's geometric construction.
    const featherYs = [0.435, 0.47, 0.505];
    featherYs.forEach((y, i) => {
      b.rod(
        [side * (0.105 + i * 0.018), y, 0.065],
        [side * (0.205 + i * 0.012), y + 0.025, 0.06],
        0.006,
        i === 1 ? YELLOW : BLUE,
        {
          bone: wingBone,
          caps: "round",
          sides: 6,
          group: "wings",
          name: `${side > 0 ? "left" : "right"}WingFeatherBar${i}`,
        },
      );
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Tail: three separate rigid colour bars, fanning behind the blue tail chain.

  const tailFeatherColors = [RED, YELLOW, BLUE_DARK];
  const tailXs = [-0.052, 0, 0.052];

  tailXs.forEach((x, i) => {
    const endX = x * 1.2;
    b.sweep(
      polyline([
        [x, 0.334, -0.14],
        [endX, 0.332 + (i - 1) * 0.009, -0.395],
      ]),
      [0.025, 0.008],
      {
        bone: tail.joints[Math.min(i, tail.joints.length - 1)],
        color: tailFeatherColors[i],
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        group: "tail",
        name: `tailFeather${i}`,
      },
    );

    b.rod(
      [x, 0.335, -0.17],
      [endX, 0.333 + (i - 1) * 0.009, -0.33],
      0.004,
      WHITE,
      {
        bone: tail.joints[Math.min(i, tail.joints.length - 1)],
        caps: "round",
        sides: 5,
        group: "tail",
        name: `tailFeatherStripe${i}`,
      },
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and gripping feet: yellow bird legs with two toes per side, each made as a visible chain.

  for (const data of legData) {
    const side = data.side;
    const legBone = data.leg;

    b.sweep(legBone, [0.018, 0.012], {
      bone: legBone,
      color: YELLOW_DARK,
      section: { ngon: 6 },
      caps: "round",
      group: "legs",
      name: side > 0 ? "leftLeg" : "rightLeg",
    });

    b.sweep(data.toeFront, 0.008, {
      bone: data.toeFront,
      color: YELLOW,
      section: { ngon: 6 },
      caps: "round",
      group: "feet",
      name: side > 0 ? "leftFrontToe" : "rightFrontToe",
    });

    b.sweep(data.toeBack, 0.007, {
      bone: data.toeBack,
      color: YELLOW,
      section: { ngon: 6 },
      caps: "round",
      group: "feet",
      name: side > 0 ? "leftBackToe" : "rightBackToe",
    });

    cylinder(
      b,
      0.014,
      0.014,
      RED,
      data.foot,
      side > 0 ? "leftFootPad" : "rightFootPad",
      data.leg.tip!,
      8,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Branch details: two angular offshoots, a pair of primary-colour collars, and a small cut face.

  b.rod(
    [-0.01, 0.052, -0.32],
    [0.125, 0.145, -0.47],
    0.026,
    BARK_LIGHT,
    {
      bone: hips,
      section: { ngon: 6 },
      caps: "round",
      group: "branch",
      name: "leftBranchStub",
    },
  );

  b.rod(
    [0.01, 0.047, 0.37],
    [-0.11, 0.135, 0.49],
    0.023,
    BARK_LIGHT,
    {
      bone: hips,
      section: { ngon: 6 },
      caps: "round",
      group: "branch",
      name: "rightBranchStub",
    },
  );

  b.part(
    new THREE.TorusGeometry(0.045, 0.0055, 6, 12),
    RED,
    {
      at: [0, 0.047, 0.015],
      dir: [0, 0, 1],
      bone: hips,
      flat: true,
      group: "branch",
      name: "redBranchRing",
    },
  );

  b.part(
    new THREE.TorusGeometry(0.045, 0.005, 6, 12),
    YELLOW,
    {
      at: [0, 0.047, 0.045],
      dir: [0, 0, 1],
      bone: hips,
      flat: true,
      group: "branch",
      name: "yellowBranchRing",
    },
  );

  cylinder(
    b,
    0.031,
    0.006,
    WHITE,
    [0.026, 0.052, 0.68],
    "branchCutFace",
    hips,
    8,
  );

  // A simple black square under the cut makes the branch end read as designed rather than organic filler.
  box(
    b,
    [0.032, 0.032, 0.006],
    BLACK,
    [0.026, 0.052, 0.684],
    "branchEndMark",
    hips,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Small finishing geometry: a yellow crown block and a red back button give the silhouette a poster-like finish.

  b.extrude(
    [
      [-0.035, 0],
      [0.035, 0],
      [0.025, 0.035],
      [0, 0.06, "sharp"],
      [-0.025, 0.035],
    ],
    {
      at: [0, 0.555, 0.145],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      bone: head,
      color: YELLOW,
      group: "head",
      name: "smallCrown",
    },
  );

  cylinder(
    b,
    0.025,
    0.012,
    RED_DARK,
    [0, 0.39, -0.125],
    "backButton",
    hips,
    10,
  );

  // Force construction/baking before handing the finished model to the application.
  const root = b.root;
  root.userData.subject = "songbird";
  root.userData.palette = {
    primary: [RED, YELLOW, BLUE],
    neutral: [BLACK, WHITE],
  };
  return root;
}

export default build;
```