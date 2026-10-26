import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A stylized Slavic folk-art diorama of a crooked log hut with bright carved trim, a shingled roof, chicken legs, talons, windows, chimney, mossy stones, and a tiny sun finial.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD_DARK = "#3b211d";
  const WOOD = "#774128";
  const WOOD_LIGHT = "#a65d32";
  const WOOD_GOLD = "#c27b3b";
  const BARK = "#54291f";
  const ROOF = "#71313a";
  const ROOF_DARK = "#43232d";
  const ROOF_LIGHT = "#9a4b43";
  const RED = "#b73532";
  const BLUE = "#2d6575";
  const BLUE_LIGHT = "#6bb5b0";
  const CREAM = "#f1d39a";
  const GOLD = "#df9c32";
  const OCHRE = "#b7792e";
  const LEG = "#bf8730";
  const LEG_LIGHT = "#d8a34a";
  const LEG_DARK = "#69401e";
  const INK = "#24161a";
  const MOSS = "#5d7442";
  const MOSS_LIGHT = "#80914d";
  const STONE = "#6f6659";
  const STONE_LIGHT = "#918473";
  const GLASS = "#75b5a9";
  const BLACK = "#171319";
  const WHITE = "#fff1c7";

  const rand = rng(29);

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: the hut is a prop, but its chicken legs are articulated creature chains.

  const hutRoot = b.joint("hutRoot", {
    at: [0, 1.48, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "hut",
  });

  const legLPoints = [
    [0.3, 1.48, -0.06],
    [0.39, 1.08, -0.02],
    [0.27, 0.59, 0.05],
    [0.3, 0.22, 0.19],
  ];

  const legRPoints = [
    [-0.3, 1.48, -0.04],
    [-0.38, 1.06, 0.02],
    [-0.25, 0.58, 0.06],
    [-0.29, 0.22, 0.19],
  ];

  const legL = b.chain("legL", legLPoints, {
    parent: hutRoot,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.3, 0, 0.19],
    group: "legs",
  });

  const legR = b.chain("legR", legRPoints, {
    parent: hutRoot,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.29, 0, 0.19],
    group: "legs",
  });

  function makeToe(
    name: string,
    parent: typeof legL.tip,
    points: number[][],
  ) {
    return b.chain(name, points, {
      parent,
      names: [`${name}Base`, `${name}Mid`, `${name}Tip`],
      role: "digit",
      group: "talons",
    });
  }

  const footL = legL.tip;
  const footR = legR.tip;

  const toeLInner = makeToe("toeLInner", footL, [
    footL.at,
    [0.29, 0.13, 0.3],
    [0.22, 0.045, 0.48],
  ]);

  const toeLMiddle = makeToe("toeLMiddle", footL, [
    footL.at,
    [0.3, 0.12, 0.34],
    [0.3, 0.04, 0.54],
  ]);

  const toeLOuter = makeToe("toeLOuter", footL, [
    footL.at,
    [0.34, 0.13, 0.28],
    [0.43, 0.045, 0.45],
  ]);

  const toeRInner = makeToe("toeRInner", footR, [
    footR.at,
    [-0.29, 0.13, 0.3],
    [-0.22, 0.045, 0.48],
  ]);

  const toeRMiddle = makeToe("toeRMiddle", footR, [
    footR.at,
    [-0.29, 0.12, 0.35],
    [-0.29, 0.04, 0.54],
  ]);

  const toeROuter = makeToe("toeROuter", footR, [
    footR.at,
    [-0.34, 0.13, 0.29],
    [-0.43, 0.045, 0.45],
  ]);

  // ---------------------------------------------------------------------------------------------------------------
  // Small placement helpers.

  function box(
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation: [number, number, number] = [0, 0, 0],
    bone = hutRoot,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      bone,
      at,
      rotation,
      flat: true,
    });
  }

  function cyl(
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    bone = hutRoot,
    segments = 8,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1),
      color,
      {
        name,
        bone,
        at,
        dir,
        flat: true,
      },
    );
  }

  function beam(
    name: string,
    a: number[],
    z: number[],
    radius: number,
    color: string,
    bone = hutRoot,
  ) {
    return b.rod(a, z, radius, {
      name,
      bone,
      color,
      sides: 8,
      section: "circle",
      caps: "round",
    });
  }

  function diamond(
    name: string,
    at: [number, number, number],
    halfWidth: number,
    halfHeight: number,
    color: string,
    thickness = 0.018,
  ) {
    return b.extrude(
      [
        [-halfWidth, 0],
        [0, halfHeight],
        [halfWidth, 0],
        [0, -halfHeight],
      ],
      {
        name,
        bone: hutRoot,
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness,
        bevel: 0.003,
        color,
      },
    );
  }

  function frontSpoke(
    name: string,
    cx: number,
    cy: number,
    angle: number,
    length: number,
    width: number,
    color: string,
    z = 0.575,
  ) {
    const rad = (angle * Math.PI) / 180;
    const x = cx + Math.sin(rad) * length * 0.42;
    const y = cy + Math.cos(rad) * length * 0.42;
    return box(
      name,
      [width, length, 0.022],
      [x, y, z],
      color,
      [0, 0, -angle],
    );
  }

  function nail(
    name: string,
    at: [number, number, number],
    color = CREAM,
    dir: [number, number, number] = [0, 0, 1],
  ) {
    return cyl(name, 0.018, 0.012, at, color, dir, hutRoot, 6);
  }

  function roofShingle(
    name: string,
    side: 1 | -1,
    index: number,
    color: string,
  ) {
    const x = side * (0.09 + index * 0.125);
    const y = 2.73 - Math.abs(x) * 0.49;
    return box(
      name,
      [0.19, 0.052, 1.16],
      [x, y, 0],
      color,
      [0, 0, side * -27],
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Mossy diorama plinth and a few deliberately simple stones.

  cyl("plinthBase", 1.02, 0.12, [0, 0.06, 0], WOOD_DARK, [0, 1, 0], hutRoot, 12);
  cyl("plinthTop", 0.94, 0.07, [0, 0.145, 0], MOSS, [0, 1, 0], hutRoot, 12);

  const stonePositions: [number, number, number][] = [
    [-0.72, 0.14, 0.42],
    [0.7, 0.13, 0.45],
    [-0.68, 0.13, -0.37],
    [0.66, 0.13, -0.4],
    [0.05, 0.12, -0.78],
  ];

  stonePositions.forEach((p, i) => {
    const r = 0.1 + rand() * 0.035;
    b.part(
      new THREE.DodecahedronGeometry(r, 0),
      i % 2 === 0 ? STONE : STONE_LIGHT,
      {
        name: `mossStone${i}`,
        bone: hutRoot,
        at: p,
        rotation: [rand() * 12, rand() * 35, rand() * 12],
        flat: true,
      },
    );
    const mossX = p[0] + (rand() - 0.5) * 0.035;
    const mossZ = p[2] + (rand() - 0.5) * 0.035;
    cyl(
      `stoneMoss${i}`,
      r * 0.34,
      0.012,
      [mossX, p[1] + r * 0.75, mossZ],
      MOSS_LIGHT,
      [0, 1, 0],
      hutRoot,
      6,
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Chicken legs: heavy upper joints, angular shins, scale ridges, toes, and black hooked claws.

  b.sweep(legL, (t) => 0.088 - t * 0.026, {
    name: "legSkinL",
    bone: legL,
    color: LEG,
    section: { ngon: 6 },
    caps: "round",
  });

  b.sweep(legR, (t) => 0.088 - t * 0.026, {
    name: "legSkinR",
    bone: legR,
    color: LEG,
    section: { ngon: 6 },
    caps: "round",
  });

  for (const [side, leg] of [
    [1, legL],
    [-1, legR],
  ] as const) {
    b.part(
      new THREE.SphereGeometry(0.105, 8, 5),
      LEG_LIGHT,
      {
        name: `thighJoint${side > 0 ? "L" : "R"}`,
        bone: leg.joints[0],
        at: leg.joints[0].at,
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.08, 7, 5),
      LEG_DARK,
      {
        name: `kneeJoint${side > 0 ? "L" : "R"}`,
        bone: leg.joints[1],
        at: leg.joints[1].at,
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.071, 7, 5),
      LEG_LIGHT,
      {
        name: `ankleJoint${side > 0 ? "L" : "R"}`,
        bone: leg.joints[2],
        at: leg.joints[2].at,
        flat: true,
      },
    );

    const scaleRing = b.ring(leg.at(0.54), {
      count: 6,
      radius: 0.071,
      fromDeg: 0,
      toDeg: 300,
      tilt: -8,
      name: `scaleRing${side > 0 ? "L" : "R"}`,
      role: "fan",
    });

    scaleRing.items.forEach((item, i) => {
      b.part(
        new THREE.SphereGeometry(0.015, 5, 4),
        i % 2 === 0 ? LEG_LIGHT : LEG_DARK,
        {
          name: `scale${side > 0 ? "L" : "R"}${i}`,
          frame: item,
          bone: leg.joints[1],
          flat: true,
        },
      );
    });

    b.part(
      new THREE.CylinderGeometry(0.122, 0.105, 0.11, 8),
      WOOD_DARK,
      {
        name: `legCollar${side > 0 ? "L" : "R"}`,
        bone: hutRoot,
        at: [side * 0.3, 1.42, -0.04],
        flat: true,
      },
    );
  }

  const toes = [
    ["toeSkinLInner", toeLInner],
    ["toeSkinLMiddle", toeLMiddle],
    ["toeSkinLOuter", toeLOuter],
    ["toeSkinRInner", toeRInner],
    ["toeSkinRMiddle", toeRMiddle],
    ["toeSkinROuter", toeROuter],
  ] as const;

  toes.forEach(([name, toe]) => {
    b.sweep(toe, (t) => 0.029 - t * 0.016, {
      name,
      bone: toe,
      color: LEG_LIGHT,
      section: { ngon: 6 },
      caps: "round",
    });

    b.spike(toe.tip, toe.tip, 0.075, 0.018, {
      name: `${name}Claw`,
      bone: toe.tip,
      color: BLACK,
      caps: "point",
    });
  });

  // Small pale feathers at the tops of the legs, visible below the hut.

  for (const side of [1, -1] as const) {
    for (let i = 0; i < 4; i++) {
      const x = side * (0.22 + i * 0.045);
      const y = 1.5 + (i % 2) * 0.035;
      const z = -0.02 + (i % 2) * 0.025;
      b.extrude(
        [
          [0, 0],
          [0.055, 0.025],
          [0.03, 0.13],
          [-0.025, 0.06],
        ],
        {
          name: `feather${side > 0 ? "L" : "R"}${i}`,
          bone: hutRoot,
          at: [x, y, z],
          x: [side, 0, 0],
          y: [0, 1, 0],
          thickness: 0.016,
          bevel: 0.002,
          color: i % 2 === 0 ? CREAM : LEG_LIGHT,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The log cabin body: a dark core, chunky crossing logs, corner posts, and end pegs.

  box("shadowInsideWall", [1.18, 0.88, 0.84], [0, 1.89, 0], WOOD_DARK);

  const logRows = [1.5, 1.69, 1.88, 2.07, 2.26];

  logRows.forEach((y, row) => {
    const logColor = row % 2 === 0 ? WOOD_LIGHT : WOOD;
    beam(`frontLog${row}`, [-0.62, y, 0.44], [0.62, y, 0.44], 0.105, logColor);
    beam(`backLog${row}`, [-0.62, y, -0.44], [0.62, y, -0.44], 0.105, logColor);
    beam(`leftLog${row}`, [0.58, y, -0.42], [0.58, y, 0.42], 0.105, logColor);
    beam(`rightLog${row}`, [-0.58, y, -0.42], [-0.58, y, 0.42], 0.105, logColor);

    nail(`frontNailL${row}`, [-0.49, y, 0.553], row % 2 ? GOLD : CREAM);
    nail(`frontNailR${row}`, [0.49, y, 0.553], row % 2 ? GOLD : CREAM);
    nail(`backNailL${row}`, [-0.49, y, -0.553], row % 2 ? GOLD : CREAM, [0, 0, -1]);
    nail(`backNailR${row}`, [0.49, y, -0.553], row % 2 ? GOLD : CREAM, [0, 0, -1]);
  });

  for (const side of [1, -1] as const) {
    for (const z of [-0.42, 0.42] as const) {
      beam(
        `cornerPost${side > 0 ? "L" : "R"}${z > 0 ? "Front" : "Back"}`,
        [side * 0.61, 1.42, z],
        [side * 0.61, 2.38, z],
        0.12,
        BARK,
      );
      cyl(
        `cornerPeg${side > 0 ? "L" : "R"}${z > 0 ? "Front" : "Back"}`,
        0.028,
        0.014,
        [side * 0.61, 2.19, z + (z > 0 ? 0.11 : -0.11)],
        GOLD,
        [0, 0, z > 0 ? 1 : -1],
        hutRoot,
        6,
      );
    }
  }

  // Decorative lower beam and painted band.

  beam("lowerFrontBeam", [-0.66, 1.38, 0.49], [0.66, 1.38, 0.49], 0.07, BARK);
  beam("lowerBackBeam", [-0.66, 1.38, -0.49], [0.66, 1.38, -0.49], 0.07, BARK);
  beam("upperFrontBeam", [-0.67, 2.35, 0.49], [0.67, 2.35, 0.49], 0.065, WOOD_DARK);
  beam("upperBackBeam", [-0.67, 2.35, -0.49], [0.67, 2.35, -0.49], 0.065, WOOD_DARK);

  const bandColors = [RED, CREAM, BLUE, GOLD, RED, CREAM, BLUE, GOLD, RED];
  bandColors.forEach((color, i) => {
    box(
      `paintedBand${i}`,
      [0.115, 0.065, 0.022],
      [-0.51 + i * 0.128, 2.39, 0.554],
      color,
      [0, 0, i % 2 === 0 ? 0 : 45],
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Front door with bright folk geometry and an iron ring.

  box("doorDarkOutline", [0.43, 0.66, 0.07], [-0.27, 1.77, 0.535], INK);
  box("doorPlank", [0.33, 0.555, 0.075], [-0.27, 1.76, 0.58], WOOD_GOLD);

  for (let i = 0; i < 4; i++) {
    box(
      `doorPlankLine${i}`,
      [0.012, 0.52, 0.012],
      [-0.4 + i * 0.087, 1.76, 0.625],
      WOOD_DARK,
      [0, 0, 0],
    );
  }

  beam("doorTopLintel", [-0.5, 2.09, 0.61], [-0.04, 2.09, 0.61], 0.042, RED);
  beam("doorLeftFrame", [-0.5, 1.44, 0.61], [-0.5, 2.1, 0.61], 0.038, RED);
  beam("doorRightFrame", [-0.04, 1.44, 0.61], [-0.04, 2.1, 0.61], 0.038, RED);

  diamond("doorDiamondOuter", [-0.27, 1.82, 0.63], 0.105, 0.13, BLUE, 0.016);
  diamond("doorDiamondInner", [-0.27, 1.82, 0.643], 0.058, 0.075, CREAM, 0.012);

  cyl("doorHandleBacking", 0.045, 0.018, [-0.1, 1.76, 0.64], INK, [0, 0, 1], hutRoot, 8);
  b.part(
    new THREE.TorusGeometry(0.038, 0.009, 5, 10, Math.PI * 1.65),
    GOLD,
    {
      name: "doorIronRing",
      bone: hutRoot,
      at: [-0.1, 1.76, 0.66],
      rotation: [0, 0, 0],
      flat: true,
    },
  );

  // A little threshold.

  box("doorStep", [0.5, 0.08, 0.22], [-0.27, 1.42, 0.58], WOOD_DARK);
  box("doorStepPaint", [0.34, 0.025, 0.225], [-0.27, 1.47, 0.59], CREAM);

  // ---------------------------------------------------------------------------------------------------------------
  // Front folk-art window: deep frame, turquoise glass, crossbars, shutters, and a sunburst.

  box("frontWindowFrame", [0.43, 0.42, 0.07], [0.33, 2.08, 0.54], WOOD_DARK);
  box("frontWindowGlass", [0.31, 0.3, 0.078], [0.33, 2.08, 0.585], GLASS);

  box("windowCrossVertical", [0.028, 0.31, 0.025], [0.33, 2.08, 0.63], CREAM);
  box("windowCrossHorizontal", [0.32, 0.028, 0.025], [0.33, 2.08, 0.63], CREAM);

  box("windowShutterL", [0.11, 0.4, 0.06], [0.055, 2.08, 0.57], RED);
  box("windowShutterR", [0.11, 0.4, 0.06], [0.605, 2.08, 0.57], BLUE);

  for (let i = 0; i < 3; i++) {
    box(
      `shutterLStripe${i}`,
      [0.018, 0.34, 0.016],
      [0.02 + i * 0.035, 2.08, 0.61],
      i % 2 === 0 ? GOLD : CREAM,
      [0, 0, 18],
    );
    box(
      `shutterRStripe${i}`,
      [0.018, 0.34, 0.016],
      [0.57 + i * 0.035, 2.08, 0.61],
      i % 2 === 0 ? GOLD : CREAM,
      [0, 0, -18],
    );
  }

  for (let i = 0; i < 8; i++) {
    frontSpoke(`windowSunRay${i}`, 0.33, 2.08, i * 45, 0.17, 0.028, GOLD, 0.635);
  }
  cyl("windowSunCenter", 0.045, 0.028, [0.33, 2.08, 0.655], RED, [0, 0, 1], hutRoot, 8);

  // Three little carved diamonds beneath the window.

  diamond("windowCharmL", [0.06, 1.72, 0.57], 0.045, 0.065, GOLD, 0.012);
  diamond("windowCharmC", [0.33, 1.72, 0.57], 0.045, 0.065, RED, 0.012);
  diamond("windowCharmR", [0.6, 1.72, 0.57], 0.045, 0.065, BLUE, 0.012);

  // ---------------------------------------------------------------------------------------------------------------
  // Side window on the hut's left side, with an angled painted frame.

  box("sideWindowFrame", [0.075, 0.4, 0.42], [0.65, 2.03, -0.08], WOOD_DARK);
  box("sideWindowGlass", [0.082, 0.29, 0.3], [0.695, 2.03, -0.08], BLUE_LIGHT);
  box("sideWindowVertical", [0.022, 0.3, 0.025], [0.74, 2.03, -0.08], CREAM, [0, 0, 0]);
  box("sideWindowHorizontal", [0.022, 0.025, 0.31], [0.74, 2.03, -0.08], CREAM);

  beam("sideWindowTop", [0.7, 2.27, -0.31], [0.7, 2.27, 0.15], 0.035, RED);
  beam("sideWindowBottom", [0.7, 1.79, -0.31], [0.7, 1.79, 0.15], 0.035, RED);
  beam("sideWindowFront", [0.7, 1.79, 0.15], [0.7, 2.27, 0.15], 0.035, RED);
  beam("sideWindowBack", [0.7, 1.79, -0.31], [0.7, 2.27, -0.31], 0.035, RED);

  for (let i = 0; i < 4; i++) {
    cyl(
      `sideWindowPeg${i}`,
      0.018,
      0.012,
      [0.735, 1.84 + i * 0.125, 0.21],
      GOLD,
      [1, 0, 0],
      hutRoot,
      6,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Gable triangles and their large, unmistakable Slavic geometric ornaments.

  b.extrude(
    [
      [-0.66, 0],
      [0.66, 0],
      [0, 0.47],
    ],
    {
      name: "frontGable",
      bone: hutRoot,
      at: [0, 2.32, 0.5],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.004,
      color: WOOD_GOLD,
    },
  );

  b.extrude(
    [
      [-0.66, 0],
      [0.66, 0],
      [0, 0.47],
    ],
    {
      name: "backGable",
      bone: hutRoot,
      at: [0, 2.32, -0.5],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.004,
      color: WOOD,
    },
  );

  beam("gableFrontBase", [-0.67, 2.32, 0.56], [0.67, 2.32, 0.56], 0.045, RED);
  beam("gableFrontSlopeL", [-0.67, 2.32, 0.56], [0, 2.81, 0.56], 0.038, BLUE);
  beam("gableFrontSlopeR", [0.67, 2.32, 0.56], [0, 2.81, 0.56], 0.038, BLUE);

  diamond("gableDiamondBig", [0, 2.53, 0.56], 0.14, 0.14, RED, 0.02);
  diamond("gableDiamondSmall", [0, 2.53, 0.58], 0.075, 0.075, CREAM, 0.014);

  for (let i = 0; i < 5; i++) {
    const x = -0.42 + i * 0.21;
    diamond(
      `gableDiamond${i}`,
      [x, 2.39 + Math.abs(x) * 0.22, 0.565],
      0.035,
      0.052,
      i % 2 === 0 ? BLUE : GOLD,
      0.01,
    );
  }

  // A little carved branch-like motif on the rear gable.

  beam("backGableBranch", [-0.32, 2.44, -0.55], [0.32, 2.44, -0.55], 0.024, GOLD);
  beam("backGableBranchL", [-0.18, 2.44, -0.56], [-0.28, 2.6, -0.56], 0.018, GOLD);
  beam("backGableBranchR", [0.18, 2.44, -0.56], [0.28, 2.6, -0.56], 0.018, GOLD);
  diamond("backGableMark", [0, 2.58, -0.56], 0.06, 0.075, RED, 0.012);

  // ---------------------------------------------------------------------------------------------------------------
  // Crooked roof, colored shingles, ridge beam, fascia, chimney, and a carved sun finial.

  box(
    "roofLeftPlane",
    [0.93, 0.115, 1.24],
    [-0.4, 2.59, 0],
    ROOF,
    [0, 0, 27],
  );

  box(
    "roofRightPlane",
    [0.93, 0.115, 1.24],
    [0.4, 2.59, 0],
    ROOF_DARK,
    [0, 0, -27],
  );

  for (const side of [1, -1] as const) {
    for (let i = 0; i < 7; i++) {
      const shade = i % 3 === 0 ? ROOF_LIGHT : i % 3 === 1 ? ROOF : ROOF_DARK;
      roofShingle(`roofShingle${side > 0 ? "L" : "R"}${i}`, side, i, shade);
    }
  }

  beam("ridgeBeam", [0, 2.8, -0.68], [0, 2.8, 0.68], 0.065, WOOD_DARK);
  beam("frontRoofEaveL", [-0.76, 2.31, 0.65], [0, 2.79, 0.65], 0.045, RED);
  beam("frontRoofEaveR", [0.76, 2.31, 0.65], [0, 2.79, 0.65], 0.045, BLUE);
  beam("backRoofEaveL", [-0.76, 2.31, -0.65], [0, 2.79, -0.65], 0.045, RED);
  beam("backRoofEaveR", [0.76, 2.31, -0.65], [0, 2.79, -0.65], 0.045, BLUE);

  for (let i = 0; i < 5; i++) {
    const x = -0.58 + i * 0.29;
    box(
      `frontRoofTile${i}`,
      [0.18, 0.045, 0.05],
      [x, 2.34, 0.69],
      i % 2 === 0 ? GOLD : CREAM,
      [0, 0, 0],
    );
  }

  // Crooked brick chimney tucked into the left roof plane.

  box("chimneyBody", [0.18, 0.42, 0.18], [-0.38, 2.73, -0.12], RED, [0, 0, -8]);
  box("chimneyShadow", [0.19, 0.09, 0.21], [-0.38, 2.94, -0.12], WOOD_DARK, [0, 0, -8]);
  box("chimneyCap", [0.27, 0.07, 0.25], [-0.38, 2.99, -0.12], CREAM, [0, 0, -8]);

  for (let i = 0; i < 3; i++) {
    box(
      `chimneyBrick${i}`,
      [0.195, 0.026, 0.19],
      [-0.38, 2.58 + i * 0.12, -0.12],
      i % 2 === 0 ? ROOF_LIGHT : GOLD,
      [0, 0, -8],
    );
  }

  // Sun wheel at the front of the ridge.

  cyl("finialHub", 0.055, 0.035, [0, 2.81, 0.72], GOLD, [0, 0, 1], hutRoot, 8);
  for (let i = 0; i < 10; i++) {
    const angle = i * 36;
    const rad = (angle * Math.PI) / 180;
    const x = Math.sin(rad) * 0.115;
    const y = 2.81 + Math.cos(rad) * 0.115;
    box(
      `finialRay${i}`,
      [0.025, 0.13, 0.026],
      [x, y, 0.745],
      i % 2 === 0 ? RED : CREAM,
      [0, 0, -angle],
    );
  }
  diamond("finialCenter", [0, 2.81, 0.77], 0.045, 0.045, BLUE, 0.018);

  // A tiny wooden hanging charm under the front eave.

  beam("hangingCharmCord", [0.48, 2.34, 0.64], [0.48, 2.17, 0.64], 0.009, INK);
  diamond("hangingCharm", [0.48, 2.1, 0.64], 0.06, 0.095, RED, 0.016);
  diamond("hangingCharmInset", [0.48, 2.1, 0.66], 0.027, 0.046, GOLD, 0.012);

  // ---------------------------------------------------------------------------------------------------------------
  // Extra folk-art trim: painted corner bars and repeated talisman marks.

  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 4; i++) {
      const y = 1.53 + i * 0.23;
      box(
        `cornerStripe${side > 0 ? "L" : "R"}${i}`,
        [0.025, 0.12, 0.035],
        [side * 0.675, y, 0.47],
        i % 2 === 0 ? CREAM : BLUE,
        [0, 0, side * 12],
      );
    }
  }

  for (let i = 0; i < 6; i++) {
    const x = -0.5 + i * 0.2;
    diamond(
      `lowerFrontCharm${i}`,
      [x, 1.52, 0.565],
      0.035,
      0.045,
      i % 3 === 0 ? RED : i % 3 === 1 ? BLUE : GOLD,
      0.009,
    );
  }

  // Log-end circles on the side walls make the crossing construction readable.

  for (let i = 0; i < logRows.length; i++) {
    const y = logRows[i];
    cyl(`leftLogEnd${i}`, 0.06, 0.018, [0.69, y, 0.18], CREAM, [1, 0, 0], hutRoot, 8);
    cyl(`rightLogEnd${i}`, 0.06, 0.018, [-0.69, y, -0.18], GOLD, [-1, 0, 0], hutRoot, 8);
    cyl(`leftLogEndDot${i}`, 0.018, 0.021, [0.705, y, 0.18], RED, [1, 0, 0], hutRoot, 6);
    cyl(`rightLogEndDot${i}`, 0.018, 0.021, [-0.705, y, -0.18], BLUE, [-1, 0, 0], hutRoot, 6);
  }

  // A few moss tufts soften the plinth without competing with the hut.

  const mossTufts: [number, number, number][] = [
    [-0.86, 0.21, 0.08],
    [0.84, 0.2, -0.04],
    [-0.55, 0.2, -0.67],
    [0.48, 0.2, -0.7],
    [0.86, 0.2, 0.1],
  ];

  mossTufts.forEach((p, i) => {
    for (let j = 0; j < 3; j++) {
      const x = p[0] + (j - 1) * 0.035;
      const z = p[2] + (j % 2) * 0.018;
      b.spike(
        [x, p[1], z],
        [x + (j - 1) * 0.025, p[1] + 0.075 + j * 0.014, z],
        null,
        0.022,
        {
          name: `mossTuft${i}_${j}`,
          bone: hutRoot,
          color: j === 1 ? MOSS_LIGHT : MOSS,
          caps: "point",
        },
      );
    }
  });

  // Ensure the ornamental sun is seated on the front-facing ridge plane.

  const finialFrame = frame([0, 2.81, 0.76], [0, 0, 1]);
  b.part(new THREE.SphereGeometry(0.035, 8, 5), GOLD, {
    name: "finialFrontButton",
    frame: finialFrame,
    bone: hutRoot,
    flat: true,
  });

  return b.root;
}
