import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  svg,
  spots,
  stripes,
  countershade,
  paint,
  offset,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description:
    "A vividly painted Oaxacan alebrije: a spotted jaguar body with eagle head, open wings, feathered tail, carved crest, and jewel-like eyes.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const GOLD = "#e9a62f";
  const GOLD_DARK = "#9b481e";
  const SUN = "#ffd45b";
  const TURQUOISE = "#16b9b2";
  const TURQUOISE_DARK = "#075b70";
  const VIOLET = "#742d9c";
  const MAGENTA = "#c52f73";
  const CORAL = "#ef5c38";
  const GREEN = "#5e9c45";
  const CREAM = "#ffe7aa";
  const BROWN = "#5b251b";
  const DARK = "#21152a";
  const BEAK = "#e8662b";
  const TALON = "#34201b";
  const BLUE = "#2879c5";

  const COAT = countershade(
    spots(
      furEdge(GOLD, GOLD_DARK, {
        level: -0.18,
        teeth: 0.22,
        period: 0.075,
        ink: "#6b241f",
        inkWidth: 0.025,
      }),
      [BROWN, MAGENTA, TURQUOISE_DARK],
      { size: 0.22, amount: 0.62, rosette: true, seed: 17 },
    ),
    CREAM,
    { level: -0.12, soft: 0.28 },
  );

  const LEG_COAT = stripes(
    cel(GOLD, GOLD_DARK),
    [MAGENTA, TURQUOISE_DARK, VIOLET],
    { size: 0.105, width: 0.34, wobble: 0.35, seed: 8 },
  );

  const WING_PAINT = countershade(
    stripes(TURQUOISE, [VIOLET, MAGENTA, SUN], {
      size: 0.16,
      width: 0.28,
      wobble: 0.18,
      axis: "z",
      seed: 22,
    }),
    TURQUOISE_DARK,
    { level: -0.15, soft: 0.3 },
  );

  const FEATHER_PAINT = cel(CORAL, "#8e2846");
  const CREST_PAINT = cel(VIOLET, "#321955");
  const FACE_PAINT = furEdge(CREAM, TURQUOISE, {
    by: "position",
    axis: [0, 1, 0],
    level: 1.55,
    teeth: 0.05,
    period: 0.08,
    along: [1, 0, 0],
  });

  // ---------------------------------------------------------------------------
  // Skeleton first: one root, torso, head/jaw, four legs, tail, and wings.

  const hips = b.joint("hips", {
    at: [0, 0.88, -0.22],
    dir: [0, 0.05, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.88, -0.38],
    [0, 1.02, -0.08],
    [0, 1.09, 0.28],
    [0, 1.23, 0.5],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["back", "chest", "shoulder", "neckBase", "neckTip"],
    role: "spine",
    count: 5,
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.42, 0.62],
    dir: [0, 0.16, 1],
    group: "head",
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.34, 0.73],
    aim: [0, 1.25, 1.03],
    group: "jaw",
    role: "jaw",
  });

  const legTargets = {
    hindL: [0.37, 0.13, -0.55] as [number, number, number],
    hindR: [-0.37, 0.13, -0.55] as [number, number, number],
    foreL: [0.34, 0.13, 0.42] as [number, number, number],
    foreR: [-0.34, 0.13, 0.42] as [number, number, number],
  };

  const hindL = b.chain(
    "hindLegL",
    limb([0.31, 0.92, -0.26], legTargets.hindL, [0.29, 0.31, 0.29], [
      [0, 0, 1],
      [0, 0, -1],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "hockL"],
      role: "leg",
      contact: legTargets.hindL,
    },
  );
  const hindR = b.chain(
    "hindLegR",
    limb([-0.31, 0.92, -0.26], legTargets.hindR, [0.29, 0.31, 0.29], [
      [0, 0, 1],
      [0, 0, -1],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "hockR"],
      role: "leg",
      contact: legTargets.hindR,
    },
  );
  const foreL = b.chain(
    "foreLegL",
    limb([0.27, 1.12, 0.31], legTargets.foreL, [0.27, 0.29, 0.27], [
      [0, 0, 1],
      [0, 0, -1],
    ]),
    {
      parent: spine.joints[2],
      names: ["shoulderL", "elbowL", "wristL"],
      role: "leg",
      contact: legTargets.foreL,
    },
  );
  const foreR = b.chain(
    "foreLegR",
    limb([-0.27, 1.12, 0.31], legTargets.foreR, [0.27, 0.29, 0.27], [
      [0, 0, 1],
      [0, 0, -1],
    ]),
    {
      parent: spine.joints[2],
      names: ["shoulderR", "elbowR", "wristR"],
      role: "leg",
      contact: legTargets.foreR,
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.43],
      [0, 0.78, -0.73],
      [0, 0.72, -1.03],
      [0, 0.83, -1.32],
      [0, 1.02, -1.56],
      [0, 1.14, -1.76],
    ]),
    {
      parent: hips,
      names: ["tail0", "tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      count: 6,
    },
  );

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.24, 1.22, 0.17],
      [0.54, 1.43, 0.05],
      [0.92, 1.66, -0.04],
      [1.27, 1.71, -0.18],
      [1.55, 1.55, -0.39],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingRootL", "wingArmL", "wingElbowL", "wingTipL"],
      role: "wing",
      count: 4,
    },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.24, 1.22, 0.17],
      [-0.54, 1.43, 0.05],
      [-0.92, 1.66, -0.04],
      [-1.27, 1.71, -0.18],
      [-1.55, 1.55, -0.39],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingRootR", "wingArmR", "wingElbowR", "wingTipR"],
      role: "wing",
      count: 4,
    },
  );

  // ---------------------------------------------------------------------------
  // Main carved volumes.

  const body = b.sweep(
    spine,
    (t) => 0.23 + 0.055 * Math.sin(t * Math.PI),
    {
      color: COAT,
      sides: 8,
      section: "circle",
      caps: "round",
      name: "spotted-jaguar-body",
      group: "body",
    },
  );

  b.sweep(spine.path, [0.25, 0.13], {
    bone: spine,
    color: COAT,
    sides: 8,
    from: 0.02,
    to: 0.72,
    caps: "none",
    shift: [0, -0.035],
    name: "deep-belly",
    group: "body",
  });

  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.032, {
    color: stripes(COAT, [CORAL, CREAM], {
      size: 0.18,
      width: 0.28,
      axis: "z",
      seed: 51,
    }),
    sides: 7,
    caps: { start: "round", end: "point" },
    name: "ringed-feather-tail",
    group: "tail",
  });

  for (const [chain, name] of [
    [hindL, "hind-leg-L"],
    [hindR, "hind-leg-R"],
    [foreL, "fore-leg-L"],
    [foreR, "fore-leg-R"],
  ] as const) {
    b.sweep(chain, [0.105, 0.075], {
      color: LEG_COAT,
      sides: 7,
      caps: "round",
      name,
      group: "legs",
    });
  }

  const skull = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    FACE_PAINT,
    {
      bone: head,
      at: [0, 1.52, 0.73],
      scale: [0.255, 0.235, 0.29],
      name: "eagle-jaguar-skull",
      group: "head",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 10, 7),
    CREAM,
    {
      bone: head,
      at: [0, 1.43, 0.91],
      scale: [0.19, 0.14, 0.18],
      name: "cream-face-mask",
      group: "face",
      flat: true,
    },
  );

  b.sweep(
    catmull([
      [0, 1.4, 0.82],
      [0, 1.34, 0.99],
      [0, 1.31, 1.13],
    ]),
    [0.13, 0.035],
    {
      bone: jaw,
      color: BEAK,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: "hooked-eagle-beak",
      group: "face",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 8, 6),
    DARK,
    {
      bone: jaw,
      at: [0, 1.31, 1.13],
      scale: [0.055, 0.045, 0.035],
      name: "beak-tip",
      group: "face",
    },
  );

  // Open lower jaw, clearly hinged for animation.
  b.sweep(
    catmull([
      [0, 1.34, 0.78],
      [0, 1.25, 0.91],
      [0, 1.23, 1.04],
    ]),
    [0.105, 0.018],
    {
      bone: jaw,
      color: MAGENTA,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: "open-lower-jaw",
      group: "jaw",
    },
  );
  b.part(
    new THREE.SphereGeometry(1, 8, 5),
    DARK,
    {
      bone: jaw,
      at: [0, 1.275, 0.91],
      scale: [0.075, 0.035, 0.13],
      name: "mouth-shadow",
      group: "jaw",
    },
  );

  // ---------------------------------------------------------------------------
  // Face: huge expressive painted eyes, brow plates, cheek disks, nostrils.

  const EYE = animeEye({
    iris: "#23d8ce",
    irisLight: "#f6ffbe",
    irisDark: "#352071",
    ink: INK,
    blush: "#f06b83",
    size: 384,
  });

  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeAt = [s * 0.112, 1.59, 0.935] as [number, number, number];
    b.decal(faceSurface, EYE, {
      at: eyeAt,
      dir: [0, 0.06, 1],
      up: [0, 1, 0],
      size: [0.105, 0.14],
      segments: 7,
      lift: 0.006,
      mirror: s > 0,
      name: s > 0 ? "left-gem-eye" : "right-gem-eye",
      group: "face",
    });

    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      CREST_PAINT,
      {
        bone: head,
        at: [s * 0.115, 1.68, 0.88],
        scale: [0.12, 0.025, 0.045],
        rotation: [s * -12, 0, s * -8],
        name: s > 0 ? "brow-L" : "brow-R",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      CORAL,
      {
        bone: head,
        at: [s * 0.18, 1.42, 0.91],
        scale: [0.065, 0.06, 0.035],
        name: s > 0 ? "cheek-L" : "cheek-R",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      DARK,
      {
        bone: head,
        at: [s * 0.06, 1.43, 1.105],
        scale: [0.022, 0.018, 0.012],
        name: s > 0 ? "nostril-L" : "nostril-R",
        group: "face",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Ears, crown crest, and decorative carved face fins.

  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.19, 0.02],
        [0.17, 0.18],
        [0.065, 0.31],
        [0, 0.22],
      ],
      {
        at: [s * 0.18, 1.64, 0.67],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.012,
        smoothing: 1,
        color: CREST_PAINT,
        bone: head,
        name: s > 0 ? "painted-ear-L" : "painted-ear-R",
        group: "head",
      },
    );

    b.extrude(
      [
        [0, 0],
        [0.12, 0.02],
        [0.1, 0.13],
        [0.04, 0.2],
        [0, 0.14],
      ],
      {
        at: [s * 0.181, 1.65, 0.69],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.052,
        bevel: 0.008,
        color: CORAL,
        bone: head,
        name: s > 0 ? "ear-inner-L" : "ear-inner-R",
        group: "head",
      },
    );
  }

  const crestOutline: [number, number, "sharp"][] = [
    [0, 0],
    [0.09, 0.08, "sharp"],
    [0.07, 0.25, "sharp"],
    [0.16, 0.18, "sharp"],
    [0.13, 0.4, "sharp"],
    [0.27, 0.29, "sharp"],
    [0.21, 0.56, "sharp"],
    [0, 0.44, "sharp"],
  ];
  b.extrude(crestOutline, {
    at: [0, 1.63, 0.56],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.065,
    bevel: 0.012,
    color: CREST_PAINT,
    bone: head,
    name: "royal-feather-crest",
    group: "head",
  });

  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.12, 0.02],
        [0.2, 0.12],
        [0.28, 0.2],
        [0.16, 0.18],
        [0.05, 0.08],
      ],
      {
        at: [s * 0.15, 1.51, 0.68],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        bevel: 0.006,
        color: TURQUOISE,
        bone: head,
        name: s > 0 ? "cheek-frill-L" : "cheek-frill-R",
        group: "head",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Wings: broad membranes plus a fan of large carved feathers.

  const wingLowerL = catmull([
    [0.2, 1.2, 0.13],
    [0.56, 1.2, -0.14],
    [0.94, 1.29, -0.39],
    [1.3, 1.31, -0.6],
    [1.55, 1.46, -0.39],
  ]);
  const wingLowerR = catmull([
    [-0.2, 1.2, 0.13],
    [-0.56, 1.2, -0.14],
    [-0.94, 1.29, -0.39],
    [-1.3, 1.31, -0.6],
    [-1.55, 1.46, -0.39],
  ]);

  b.membrane(wingL, wingLowerL, {
    color: WING_PAINT,
    thickness: 0.028,
    rows: 5,
    cols: 12,
    scallop: 0.16,
    name: "turquoise-wing-membrane-L",
    group: "wings",
  });
  b.membrane(wingR, wingLowerR, {
    color: WING_PAINT,
    thickness: 0.028,
    rows: 5,
    cols: 12,
    scallop: 0.16,
    name: "turquoise-wing-membrane-R",
    group: "wings",
  });

  const featherTex = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 2 C18 20 12 49 18 76 C21 93 27 111 32 126 C37 111 43 93 46 76 C52 49 46 20 32 2Z" fill="#fff"/>
      <path d="M32 8 L32 119 M32 34 L19 51 M32 51 L45 66 M32 69 L20 87 M32 87 L43 103" stroke="#777" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 192 },
  );

  for (const [wing, side] of [
    [wingL, 1],
    [wingR, -1],
  ] as const) {
    const feathers = [0.38, 0.53, 0.68, 0.8, 0.91];
    for (let i = 0; i < feathers.length; i++) {
      const t = feathers[i];
      const p = wing.at(t).at;
      const span = 0.26 + i * 0.045;
      const tip = [
        p.x + side * (0.24 + i * 0.075),
        p.y + 0.11 + i * 0.025,
        p.z - 0.12 - i * 0.04,
      ] as [number, number, number];
      const f = b.sweep(
        catmull([
          [p.x, p.y, p.z],
          [p.x + side * span * 0.45, p.y + 0.08, p.z - 0.04],
          tip,
        ]),
        [0.055, 0.008],
        {
          color: FEATHER_PAINT,
          sides: 6,
          caps: { start: "round", end: "point" },
          bone: wing.joints[Math.min(i, wing.joints.length - 1)],
          name: `${side > 0 ? "L" : "R"}-primary-feather-${i}`,
          group: "wings",
        },
      );
      b.cards([f.at(0.68, side > 0 ? 28 : -28)], featherTex, {
        size: [0.14 + i * 0.012, 0.28 + i * 0.035],
        lean: 35,
        bend: 18,
        flow: [side * 0.3, 0.2, -1],
        color: i % 2 ? SUN : CREAM,
        mirror: side < 0,
        sink: 0.08,
        name: `${side > 0 ? "L" : "R"}-feather-card-${i}`,
        group: "wings",
      });
    }
  }

  // Wing root rosettes and bright studs.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(
        new THREE.SphereGeometry(0.035, 8, 5),
        i % 2 ? SUN : MAGENTA,
        {
          bone: spine.joints[2],
          at: [s * (0.28 + i * 0.045), 1.29 + i * 0.035, 0.14 - i * 0.025],
          name: `${s > 0 ? "L" : "R"}-wing-rosette-${i}`,
          group: "wings",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Feet: chunky paws and three carved eagle talons on each foot.

  for (const [chain, side, prefix] of [
    [hindL, 1, "hindL"],
    [hindR, -1, "hindR"],
    [foreL, 1, "foreL"],
    [foreR, -1, "foreR"],
  ] as const) {
    const foot = chain.tip.at;
    b.part(
      new THREE.SphereGeometry(1, 9, 6),
      LEG_COAT,
      {
        bone: chain.tip,
        at: foot,
        scale: [0.13, 0.09, 0.15],
        name: `${prefix}-paw`,
        group: "feet",
      },
    );
    for (let j = -1; j <= 1; j++) {
      const toeStart = [foot.x + j * 0.055, foot.y + 0.015, foot.z + 0.015] as [
        number,
        number,
        number,
      ];
      const toeTip = [
        foot.x + j * 0.075,
        0.075,
        foot.z + 0.14 - Math.abs(j) * 0.025,
      ] as [number, number, number];
      b.sweep([toeStart, toeTip], [0.028, 0.006], {
        bone: chain.tip,
        color: TALON,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `${prefix}-talon-${j + 2}`,
        group: "feet",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Tail fan: three luminous feather blades at the tip.

  const tailEnd = tail.at(1).at;
  for (const [s, color] of [
    [-1, TURQUOISE],
    [0, CORAL],
    [1, VIOLET],
  ] as const) {
    const root = [
      tailEnd.x + s * 0.025,
      tailEnd.y,
      tailEnd.z,
    ] as [number, number, number];
    b.extrude(
      [
        [0, 0],
        [0.09, 0.03],
        [0.13, 0.2],
        [0.07, 0.43],
        [0, 0.58, "sharp"],
        [-0.045, 0.31],
      ],
      {
        at: [root[0] + s * 0.08, root[1] - 0.03, root[2]],
        x: [1, 0, 0],
        y: [s * 0.18, 0.95, -0.15],
        thickness: [0.025, 0.008],
        bevel: 0.006,
        color,
        bone: tail.tip,
        name: `tail-fan-${s}`,
        group: "tail",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Alebrije woodcarving details: painted bands, medallions, and little studs.

  const bodySurface = b.surface(body);
  const collar = bodySurface.loop(spine.joints[3], { lift: 0.012 });
  b.sweep(collar, 0.026, {
    color: MAGENTA,
    sides: 6,
    caps: "none",
    name: "neck-paint-collar",
    group: "ornament",
  });

  const chestMedallion = b.part(
    new THREE.CylinderGeometry(0.105, 0.105, 0.018, 12),
    SUN,
    {
      bone: spine.joints[2],
      at: [0, 1.18, 0.53],
      dir: [0, 0, 1],
      name: "sun-chest-medallion",
      group: "ornament",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.062, 0.062, 0.021, 10),
    VIOLET,
    {
      bone: spine.joints[2],
      at: [0, 1.18, 0.545],
      dir: [0, 0, 1],
      name: "sun-medallion-center",
      group: "ornament",
    },
  );

  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const p = [s * (0.12 + i * 0.05), 1.16 + 0.035 * Math.sin(i), 0.51] as [
        number,
        number,
        number,
      ];
      b.part(
        new THREE.SphereGeometry(0.018, 7, 5),
        i % 2 ? TURQUOISE : CORAL,
        {
          bone: spine.joints[2],
          at: p,
          name: `${s > 0 ? "L" : "R"}-chest-bead-${i}`,
          group: "ornament",
        },
      );
    }
  }

  // Small raised wooden dots around the rump, like hand-painted alebrije punctuation.
  const rumpHits = bodySurface.scatter(22, {
    rng: rng(31),
    minDist: 0.085,
    filter: (h) => h.at.z < -0.08 && h.n.y > -0.35,
  });
  for (let i = 0; i < rumpHits.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.018 + (i % 3) * 0.004, 7, 5),
      i % 3 === 0 ? SUN : i % 3 === 1 ? MAGENTA : TURQUOISE,
      rumpHits[i],
      { embed: 0.35, name: `rump-painted-stud-${i}`, group: "ornament" },
    );
  }

  // A few short carved stripes on the muzzle and brow.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(
        new THREE.BoxGeometry(0.012, 0.018, 0.07),
        i % 2 ? MAGENTA : TURQUOISE_DARK,
        {
          bone: head,
          at: [s * (0.105 + i * 0.03), 1.48 + i * 0.026, 0.99],
          rotation: [0, s * (12 + i * 4), 0],
          name: `${s > 0 ? "L" : "R"}-muzzle-paint-${i}`,
          group: "face",
        },
      );
    }
  }

  return b.root;
}
