import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  rng,
  spots,
  stripes,
  countershade,
  paint,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "alebrije jaguar-eagle",
  description:
    "A brightly painted Oaxacan alebrije: a spotted jaguar body with eagle wings, feather crest, beak, talons, and a curled ornamental tail.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const INK = "#241126";
  const WOOD = "#d96b26";
  const GOLD = "#f4bd38";
  const TURQUOISE = "#18b9a7";
  const BLUE = "#2371c8";
  const MAGENTA = "#d7378b";
  const CREAM = "#ffe7a1";
  const WHITE = "#fff3c2";
  const RED = "#c92f37";
  const BROWN = "#63301e";
  const BLACK = "#171521";
  const GREEN = "#42a85b";

  const coat = countershade(
    spots(
      stripes(WOOD, [MAGENTA, GOLD, TURQUOISE], {
        size: 0.22,
        width: 0.22,
        wobble: 0.35,
        seed: 12,
      }),
      [RED, TURQUOISE, GOLD],
      { size: 0.18, amount: 0.55, rosette: true, seed: 8 },
    ),
    CREAM,
    { level: -0.18, soft: 0.28 },
  );

  const wingPaint = countershade(
    stripes(TURQUOISE, [BLUE, MAGENTA, GOLD], {
      size: 0.16,
      axis: "y",
      width: 0.3,
      wobble: 0.2,
      seed: 21,
    }),
    BLUE,
    { level: -0.1, soft: 0.25 },
  );

  const featherPaint = stripes(
    GOLD,
    [RED, MAGENTA, TURQUOISE],
    { size: 0.12, axis: "y", width: 0.32, wobble: 0.15, seed: 33 },
  );

  const hips = b.joint("hips", {
    at: [0, 0.72, -0.42],
    dir: [0, 0.12, 1],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.54],
      [0, 0.79, -0.18],
      [0, 0.84, 0.2],
      [0, 0.9, 0.55],
      [0, 0.98, 0.72],
    ]),
    {
      parent: hips,
      names: ["spineRump", "spineMid", "spineChest", "spineShoulder", "spineTip"],
      role: "spine",
      group: "body",
    },
  );

  const body = b.sweep(
    spine,
    (t) => 0.27 - 0.055 * t,
    {
      color: coat,
      section: "box",
      sides: 8,
      group: "body",
      name: "paintedJaguarBody",
    },
  );

  const chest = spine.joints[3];

  const neck = b.chain(
    "neck",
    catmull([
      spine.at(0.82).at,
      [0, 1.08, 0.78],
      [0, 1.28, 0.88],
      [0, 1.43, 0.92],
    ]),
    {
      parent: chest,
      names: ["neckBase", "neckRise", "neckCrown", "neckTip"],
      role: "neck",
      group: "head",
    },
  );

  b.sweep(neck, [0.17, 0.125], {
    color: coat,
    section: { ngon: 7 },
    group: "head",
    name: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.48, 0.94],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    coat,
    {
      bone: head,
      at: [0, 1.49, 0.98],
      scale: [0.28, 0.25, 0.31],
      group: "head",
      name: "roundJaguarSkull",
      flat: true,
    },
  );

  const muzzle = b.part(
    new THREE.SphereGeometry(1, 10, 6),
    countershade(CREAM, GOLD, { level: -0.25, soft: 0.2 }),
    {
      bone: head,
      at: [0, 1.43, 1.2],
      scale: [0.19, 0.14, 0.18],
      group: "face",
      name: "creamMuzzle",
      flat: true,
    },
  );

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.4, 1.18],
    dir: [0, -0.12, 0.98],
    role: "jaw",
    group: "face",
  });

  b.part(
    new THREE.SphereGeometry(1, 9, 5),
    CREAM,
    {
      bone: jaw,
      at: [0, 1.38, 1.28],
      scale: [0.16, 0.075, 0.2],
      group: "face",
      name: "lowerJaw",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 8, 5),
    BLACK,
    {
      bone: head,
      at: [0, 1.48, 1.385],
      scale: [0.065, 0.05, 0.035],
      group: "face",
      name: "paintedNose",
    },
  );

  const beak = b.sweep(
    bezier(
      [0, 1.5, 1.39],
      [0, 1.51, 1.53],
      [0, 1.48, 1.63],
      [0, 1.42, 1.68],
    ),
    [0.08, 0],
    {
      color: GOLD,
      caps: { start: "flat", end: "point" },
      group: "face",
      name: "hookedEagleBeak",
      bone: head,
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 8, 5),
    RED,
    {
      bone: jaw,
      at: [0, 1.405, 1.44],
      scale: [0.105, 0.018, 0.13],
      group: "face",
      name: "redMouthInterior",
    },
  );

  for (const side of [-1, 1]) {
    const eyeX = -side * 0.13;
    b.part(
      new THREE.SphereGeometry(1, 10, 6),
      CREAM,
      {
        bone: head,
        at: [eyeX, 1.54, 1.19],
        scale: [0.095, 0.105, 0.045],
        group: "face",
        name: side < 0 ? "eyeRimR" : "eyeRimL",
      },
    );
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      TURQUOISE,
      {
        bone: head,
        at: [eyeX, 1.545, 1.225],
        scale: [0.06, 0.068, 0.025],
        group: "face",
        name: side < 0 ? "irisR" : "irisL",
      },
    );
    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      BLACK,
      {
        bone: head,
        at: [eyeX, 1.545, 1.247],
        scale: [0.022, 0.045, 0.012],
        group: "face",
        name: side < 0 ? "pupilR" : "pupilL",
      },
    );
    b.part(
      new THREE.SphereGeometry(1, 5, 3),
      WHITE,
      {
        bone: head,
        at: [eyeX - 0.018, 1.57, 1.262],
        scale: [0.014, 0.018, 0.008],
        group: "face",
        name: side < 0 ? "eyeGlintR" : "eyeGlintL",
      },
    );

    b.extrude(
      [
        [0, 0],
        [0.13, 0.02],
        [0.18, 0.15],
        [0.08, 0.22],
        [0, 0.14],
      ],
      {
        at: [eyeX + side * 0.01, 1.63, 1.12],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.008,
        color: MAGENTA,
        bone: head,
        group: "face",
        name: side < 0 ? "browR" : "browL",
      },
    );
  }

  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.12, 0.02],
        [0.2, 0.23],
        [0.11, 0.38],
        [0.02, 0.27],
      ],
      {
        at: [-side * 0.19, 1.62, 0.93],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.012,
        color: TURQUOISE,
        bone: head,
        group: "ears",
        name: side < 0 ? "earR" : "earL",
      },
    );

    b.spike(
      [side * 0.17, 1.66, 0.86],
      [side * 0.05, 0.2, -0.02],
      0.16,
      0.035,
      { color: MAGENTA, bone: head, group: "ears" },
    );
  }

  const crest = b.chain(
    "crest",
    catmull([
      [0, 1.65, 0.78],
      [0, 1.86, 0.75],
      [0, 2.05, 0.68],
    ]),
    {
      parent: head,
      names: ["crestBase", "crestMid", "crestTip"],
      role: "fan",
      group: "crest",
    },
  );
  b.sweep(crest, [0.11, 0.025], {
    color: featherPaint,
    caps: "point",
    group: "crest",
    name: "centralCrest",
  });

  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.055;
    b.spike(
      [x, 1.68 + Math.abs(i - 3) * 0.012, 0.79],
      [x * 1.7, 0.27 + (i % 2) * 0.04, -0.02],
      0.24 + (i % 3) * 0.035,
      0.025,
      {
        color: i % 2 ? MAGENTA : GOLD,
        bone: head,
        group: "crest",
      },
    );
  }

  const legTargets = [
    [0.2, 0.11, 0.35],
    [-0.2, 0.11, 0.35],
    [0.22, 0.11, -0.48],
    [-0.22, 0.11, -0.48],
  ] as const;

  const legRoots = [
    [0.19, 0.76, 0.38],
    [-0.19, 0.76, 0.38],
    [0.2, 0.7, -0.38],
    [-0.2, 0.7, -0.38],
  ] as const;

  const legNames = [
    ["shoulderL", "elbowL", "wristL", "pawL"],
    ["shoulderR", "elbowR", "wristR", "pawR"],
    ["hipL", "kneeL", "hockL", "pawHL"],
    ["hipR", "kneeR", "hockR", "pawHR"],
  ];

  legRoots.forEach((root, i) => {
    const s = i % 2 === 0 ? 1 : -1;
    const points = limb(
      root,
      legTargets[i],
      [0.27, 0.25, 0.2],
      [
        [0, 0, s],
        [0, 0, -s],
      ],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain(`legChain${i}`, points, {
      parent: hips,
      names: legNames[i],
      role: "leg",
      contact: legTargets[i],
      group: "legs",
    });
    const foot = leg.tip!;
    b.sweep(leg, [0.085, 0.055], {
      color: coat,
      section: { ngon: 6 },
      group: "legs",
      name: `paintedLeg${i}`,
    });
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      BROWN,
      {
        bone: foot,
        at: foot.at,
        scale: [0.105, 0.055, 0.13],
        group: "legs",
        name: `paw${i}`,
      },
    );
    for (let toe = -1; toe <= 1; toe++) {
      b.spike(
        [leg.tip.at.x + toe * 0.045, 0.105, leg.tip.at.z + 0.07],
        [0, -0.03, 1],
        0.09,
        0.012,
        { color: CREAM, bone: foot, group: "talons" },
      );
    }
  });

  const tailPath = catmull([
    [0, 0.68, -0.58],
    [0, 0.62, -0.9],
    [0.04, 0.7, -1.18],
    [0.13, 0.84, -1.42],
    [0.28, 0.94, -1.54],
    [0.4, 1.08, -1.48],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
    group: "tail",
  });
  b.sweep(tail, (t) => 0.12 * (1 - t) + 0.028, {
    color: coat,
    bands: [[0.78, GOLD], [0.91, MAGENTA], [1, TURQUOISE]],
    section: { ngon: 7 },
    group: "tail",
    name: "curledPaintedTail",
  });
  for (let i = 0; i < 6; i++) {
    const p = tail.at(0.72 + i * 0.045);
    b.spike(
      p,
      [0, 0.22 + (i % 2) * 0.03, -0.08],
      0.12,
      0.025,
      { color: i % 2 ? MAGENTA : GOLD, group: "tail", bone: p.bone },
    );
  }

  const wingRoots = [
    [0.18, 1.01, 0.42],
    [-0.18, 1.01, 0.42],
  ] as const;

  wingRoots.forEach((root, wi) => {
    const side = wi === 0 ? 1 : -1;
    const wing = b.chain(
      `wing${side > 0 ? "L" : "R"}`,
      catmull([
        root,
        [side * 0.42, 1.22, 0.28],
        [side * 0.72, 1.48, 0.05],
        [side * 0.98, 1.58, -0.18],
      ]),
      {
        parent: chest,
        names: side > 0 ? ["wingLBase", "wingLElbow", "wingLWrist", "wingLTip"] : ["wingRBase", "wingRElbow", "wingRWrist", "wingRTip"],
        role: "wing",
        group: "wings",
      },
    );

    b.sweep(wing, [0.105, 0.035], {
      color: wingPaint,
      section: { ngon: 5 },
      group: "wings",
      name: side > 0 ? "leftWingArm" : "rightWingArm",
    });

    const upper = [
      root,
      [side * 0.45, 1.28, 0.32],
      [side * 0.78, 1.56, 0.08],
      [side * 1.02, 1.65, -0.16],
    ];
    const lower = [
      [side * 0.2, 0.94, 0.42],
      [side * 0.48, 1.05, 0.28],
      [side * 0.77, 1.15, 0.02],
      [side * 0.96, 1.22, -0.2],
    ];
    b.membrane(upper, lower, {
      color: wingPaint,
      thickness: 0.018,
      rows: 3,
      cols: 7,
      scallop: 0.16,
      group: "wings",
      name: side > 0 ? "leftWingWeb" : "rightWingWeb",
    });

    for (let f = 0; f < 7; f++) {
      const u = f / 6;
      const base = [
        side * (0.3 + u * 0.58),
        1.1 + u * 0.26,
        0.28 - u * 0.35,
      ] as [number, number, number];
      const tip = [
        side * (0.48 + u * 0.72),
        1.36 + u * 0.2,
        -0.18 - u * 0.23,
      ] as [number, number, number];
      b.sweep(bezier(base, [
        side * (0.36 + u * 0.6),
        1.26 + u * 0.25,
        0.15 - u * 0.2,
      ], [
        side * (0.43 + u * 0.66),
        1.38 + u * 0.22,
        -0.05 - u * 0.2,
      ], tip), [0.035, 0.006], {
        color: f % 3 === 0 ? MAGENTA : f % 3 === 1 ? GOLD : TURQUOISE,
        caps: { start: "round", end: "point" },
        group: "flight-feathers",
        name: `${side > 0 ? "left" : "right"}FlightFeather${f}`,
      });
    }

    for (let f = 0; f < 4; f++) {
      const p = wing.at(0.25 + f * 0.18);
      b.spike(
        p,
        [side * 0.06, 0.2 + f * 0.025, -0.18],
        0.17,
        0.024,
        {
          color: f % 2 ? RED : BLUE,
          group: "wing-fingers",
          bone: p.bone,
        },
      );
    }
  });

  const collar = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collar, 0.022, {
    color: MAGENTA,
    group: "ornaments",
    name: "paintedNeckCollar",
  });

  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const p = neck.at(0.08 + t * 0.78);
    b.spike(
      p,
      p,
      0.07 + (i % 3) * 0.018,
      0.018,
      {
        color: i % 2 ? GOLD : TURQUOISE,
        group: "neckRuff",
        bone: p.bone,
      },
    );
  }

  const eyeMark = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M8 52 Q50 8 92 52 Q50 94 8 52Z" fill="#fff3c2" stroke="#241126" stroke-width="7"/>
      <ellipse cx="53" cy="52" rx="20" ry="28" fill="#18b9a7" stroke="#241126" stroke-width="5"/>
      <ellipse cx="53" cy="54" rx="7" ry="20" fill="#171521"/>
      <circle cx="45" cy="40" r="6" fill="white"/>
      <circle cx="62" cy="68" r="3" fill="white"/>
    </svg>`,
    { size: 128 },
  );

  for (const side of [-1, 1]) {
    b.decal(skull, eyeMark, {
      at: [side * -0.13, 1.545, 1.255],
      dir: [0, 0.1, 1],
      up: [0, 1, 0],
      size: [0.13, 0.12],
      lift: 0.012,
      mirror: side > 0,
      group: "paintedEyes",
      name: side < 0 ? "eyeDecalR" : "eyeDecalL",
    });
  }

  const whiskerPaint = paint((p, n) =>
    n.z > 0.4 ? (p.x > 0 ? GOLD : TURQUOISE) : CREAM,
  );

  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.sweep(
        bezier(
          [side * 0.12, 1.43 - i * 0.035, 1.31],
          [side * (0.25 + i * 0.02), 1.42 - i * 0.04, 1.35],
          [side * (0.34 + i * 0.025), 1.36 - i * 0.03, 1.27],
          [side * (0.42 + i * 0.03), 1.32 - i * 0.02, 1.18],
        ),
        [0.007, 0.001],
        {
          color: whiskerPaint,
          caps: { start: "round", end: "point" },
          group: "whiskers",
          name: "paintedWhisker",
          bone: head,
        },
      );
    }
  }

  b.part(
    new THREE.SphereGeometry(1, 8, 5),
    GOLD,
    {
      bone: hips,
      at: [0, 0.82, -0.63],
      scale: [0.2, 0.14, 0.08],
      group: "bodyOrnaments",
      name: "rumpMedallion",
    },
  );

  for (let i = 0; i < 5; i++) {
    const a = (i / 4 - 0.5) * Math.PI;
    b.spike(
      [Math.sin(a) * 0.15, 0.9 + Math.cos(a) * 0.1, -0.68],
      [Math.sin(a) * 0.15, 0.18, -0.12],
      0.12,
      0.022,
      { color: i % 2 ? TURQUOISE : MAGENTA, bone: hips, group: "rumpFan" },
    );
  }

  return b.root;
}
