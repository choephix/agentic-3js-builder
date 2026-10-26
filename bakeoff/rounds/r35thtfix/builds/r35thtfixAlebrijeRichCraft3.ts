import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  paint,
  grain,
  spots,
  stripes,
  countershade,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "alebrije jaguar-eagle",
  description:
    "A vivid Oaxacan alebrije: a carved wooden jaguar body with an eagle's head, hooked beak, spread feathered wings, talons, painted rosettes, turquoise shadows, and ceremonial patterns.",
};

export default function build() {
  const b = createBuilder({
    name: "alebrije-jaguar-eagle",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Palette and painted-wood surfaces

  const INK = "#251331";
  const BURGUNDY = "#741d3d";
  const PURPLE = "#45205f";
  const VIOLET = "#6d2c88";
  const ORANGE = "#d85c25";
  const TANGERINE = "#ef8c2e";
  const GOLD = "#f5c34d";
  const OCHRE = "#bd6b26";
  const CREAM = "#f6df9a";
  const BONE = "#fff0bd";
  const TEAL = "#159b9c";
  const TURQUOISE = "#29d0bd";
  const DEEP_TEAL = "#075d70";
  const MAGENTA = "#d73576";
  const RED = "#b92e35";
  const GREEN = "#4b9d55";
  const DARK_GREEN = "#21604d";
  const CLAW = "#362343";

  const woodOrange = grain(ORANGE, TANGERINE, {
    size: 0.065,
    axis: "z",
    seed: 12,
  });

  const rosetteWood = spots(woodOrange, [INK, BURGUNDY, PURPLE], {
    size: 0.20,
    amount: 0.63,
    rosette: true,
    seed: 19,
  });

  const jaguarWood = countershade(rosetteWood, CREAM, {
    level: -0.22,
    soft: 0.27,
  });

  const shoulderWood = stripes(
    grain(TANGERINE, GOLD, {
      size: 0.055,
      axis: "z",
      seed: 31,
    }),
    [MAGENTA, PURPLE, RED],
    {
      size: 0.18,
      width: 0.25,
      wobble: 0.25,
      seed: 44,
    },
  );

  const wingWood = stripes(
    grain(TEAL, TURQUOISE, {
      size: 0.07,
      axis: "y",
      seed: 51,
    }),
    [MAGENTA, GOLD, DEEP_TEAL],
    {
      size: 0.22,
      width: 0.26,
      wobble: 0.18,
      axis: "x",
      seed: 59,
    },
  );

  const wingMembrane = countershade(wingWood, DEEP_TEAL, {
    level: -0.12,
    soft: 0.22,
  });

  const legWood = stripes(
    grain(RED, ORANGE, {
      size: 0.06,
      axis: "y",
      seed: 72,
    }),
    [GOLD, PURPLE, MAGENTA],
    {
      size: 0.17,
      width: 0.34,
      wobble: 0.16,
      axis: "y",
      seed: 77,
    },
  );

  const tailWood = stripes(
    grain(PURPLE, VIOLET, {
      size: 0.065,
      axis: "y",
      seed: 83,
    }),
    [GOLD, TURQUOISE, MAGENTA],
    {
      size: 0.23,
      width: 0.31,
      wobble: 0.12,
      axis: "y",
      seed: 89,
    },
  );

  const beakWood = grain(GOLD, OCHRE, {
    size: 0.04,
    axis: "y",
    seed: 93,
  });

  const faceWood = countershade(
    grain(TANGERINE, GOLD, {
      size: 0.05,
      axis: "z",
      seed: 101,
    }),
    CREAM,
    {
      level: -0.1,
      soft: 0.3,
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Texture drawings. They are intentionally geometric, like painted motifs on carved wood.

  const EYE = svg(
    `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#114d70"/>
          <stop offset="0.52" stop-color="#27d5c5"/>
          <stop offset="1" stop-color="#f4d052"/>
        </linearGradient>
      </defs>
      <path d="M8 76 Q36 17 91 30 Q112 37 117 62 Q88 119 35 120 Q14 111 8 76Z" fill="#251331" stroke="#f5c34d" stroke-width="5"/>
      <ellipse cx="67" cy="72" rx="28" ry="39" fill="url(#iris)" stroke="#251331" stroke-width="5"/>
      <ellipse cx="68" cy="74" rx="10" ry="28" fill="#251331"/>
      <path d="M52 46 Q65 29 78 44" fill="none" stroke="#fff4c6" stroke-width="8" stroke-linecap="round"/>
      <circle cx="85" cy="94" r="5" fill="#fff4c6"/>
      <path d="M20 32 Q49 3 92 17" fill="none" stroke="#251331" stroke-width="9" stroke-linecap="round"/>
      <path d="M19 115 Q34 132 53 137" fill="none" stroke="#d73576" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const WING_EYE = svg(
    `<svg viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 65 Q80 6 150 65 Q80 124 10 65Z" fill="#f5c34d" stroke="#251331" stroke-width="8"/>
      <path d="M28 65 Q80 24 132 65 Q80 106 28 65Z" fill="#159b9c" stroke="#45205f" stroke-width="6"/>
      <circle cx="80" cy="65" r="22" fill="#251331"/>
      <circle cx="72" cy="55" r="8" fill="#fff0bd"/>
      <path d="M20 19 L38 38 M140 19 L122 38 M20 111 L39 91 M140 111 L121 91"
        stroke="#d73576" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 320 },
  );

  const CHEST_EMBLEM = svg(
    `<svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <path d="M80 8 L98 51 L145 42 L117 79 L151 111 L105 108 L80 170 L55 108 L9 111 L43 79 L15 42 L62 51Z"
        fill="#f5c34d" stroke="#251331" stroke-width="8" stroke-linejoin="round"/>
      <path d="M80 34 L90 68 L125 68 L97 88 L108 123 L80 101 L52 123 L63 88 L35 68 L70 68Z"
        fill="#d73576" stroke="#45205f" stroke-width="6"/>
      <circle cx="80" cy="79" r="12" fill="#29d0bd" stroke="#251331" stroke-width="5"/>
    </svg>`,
    { size: 320 },
  );

  const FOREHEAD_MARK = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 6 L60 42 L91 52 L61 63 L50 114 L39 63 L9 52 L40 42Z"
        fill="#29d0bd" stroke="#251331" stroke-width="7" stroke-linejoin="round"/>
      <path d="M50 27 L53 48 L72 52 L53 57 L50 82 L47 57 L28 52 L47 48Z"
        fill="#f5c34d"/>
    </svg>`,
    { size: 256 },
  );

  const FEATHER_MARK = svg(
    `<svg viewBox="0 0 80 180" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 174 Q4 132 14 68 Q22 22 40 5 Q58 22 66 68 Q76 132 40 174Z"
        fill="#f5c34d" stroke="#251331" stroke-width="7"/>
      <path d="M40 158 L40 26 M40 68 L20 48 M40 91 L63 67 M40 115 L17 96 M40 135 L61 117"
        fill="none" stroke="#d73576" stroke-width="8" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const TALON_MARK = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 65 Q30 18 52 9 Q47 39 71 65 Q43 54 8 65Z" fill="#fff0bd" stroke="#251331" stroke-width="7"/>
      <path d="M18 61 Q38 46 59 57" fill="none" stroke="#d73576" stroke-width="7"/>
    </svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one readable root, then spine, head, jaw, legs, wings, and tail.

  const hips = b.joint("hips", {
    at: [0, 0.91, -0.38],
    dir: [0, 0.05, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.91, -0.55],
      [0, 1.00, -0.18],
      [0, 1.06, 0.18],
      [0, 1.10, 0.46],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "spineChest", "spineTip"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.10, 0.45],
      [0, 1.27, 0.57],
      [0, 1.42, 0.67],
    ]),
    {
      parent: spine.tip ?? undefined,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip ?? undefined,
    at: [0, 1.46, 0.70],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.37, 0.78],
    aim: [0, 1.37, 1.16],
    role: "jaw",
    group: "head",
  });

  const legChains: {
    side: number;
    name: string;
    chain: ReturnType<typeof b.chain>;
    target: THREE.Vector3;
  }[] = [];

  const legData = [
    { side: 1, name: "legHL", root: [0.31, 0.95, -0.50], foot: [0.43, 0.14, -0.56] },
    { side: -1, name: "legHR", root: [-0.31, 0.95, -0.50], foot: [-0.43, 0.14, -0.56] },
    { side: 1, name: "legFL", root: [0.31, 1.03, 0.31], foot: [0.40, 0.14, 0.40] },
    { side: -1, name: "legFR", root: [-0.31, 1.03, 0.31], foot: [-0.40, 0.14, 0.40] },
  ];

  for (const data of legData) {
    const root = new THREE.Vector3(...data.root);
    const target = new THREE.Vector3(...data.foot);
    const pts = limb(
      root,
      target,
      [0.29, 0.27, 0.24],
      [
        [0, 0, data.name.includes("F") ? 1 : -1],
        [0, 0, data.name.includes("F") ? -1 : 1],
      ],
    );
    const chain = b.chain(data.name, pts, {
      parent: data.name.includes("F") ? spine.joints[2] : spine.joints[1],
      names: [
        `${data.name}_hip`,
        `${data.name}_knee`,
        `${data.name}_hock`,
        `${data.name}_ankle`,
      ],
      role: "leg",
      contact: data.foot as [number, number, number],
      group: "legs",
    });
    legChains.push({ side: data.side, name: data.name, chain, target });
  }

  const wingChains: {
    side: number;
    name: string;
    chain: ReturnType<typeof b.chain>;
  }[] = [];

  for (const side of [1, -1]) {
    const name = side > 0 ? "wingL" : "wingR";
    const chain = b.chain(
      name,
      catmull([
        [side * 0.32, 1.12, 0.25],
        [side * 0.63, 1.34, 0.17],
        [side * 0.99, 1.60, -0.02],
        [side * 1.30, 1.76, -0.25],
        [side * 1.52, 1.62, -0.48],
      ]),
      {
        parent: spine.joints[2],
        names: [
          `${name}Root`,
          `${name}Elbow`,
          `${name}Wrist`,
          `${name}Finger`,
          `${name}Tip`,
        ],
        role: "wing",
        group: "wings",
      },
    );
    wingChains.push({ side, name, chain });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.88, -0.66],
      [0, 0.88, -0.95],
      [0, 1.02, -1.23],
      [0, 1.18, -1.49],
      [0, 1.30, -1.72],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Small helpers

  const sphere = (
    geometryColor: any,
    at: THREE.Vector3 | [number, number, number],
    scale: [number, number, number],
    bone: any,
    name: string,
    segments = 10,
    rings = 7,
  ) =>
    b.part(new THREE.SphereGeometry(1, segments, rings), geometryColor, {
      at,
      bone,
      scale,
      flat: true,
      name,
    });

  const box = (
    geometryColor: any,
    at: THREE.Vector3 | [number, number, number],
    size: [number, number, number],
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), geometryColor, {
      at,
      bone,
      flat: true,
      name,
    });

  const paintedSpike = (
    base: THREE.Vector3 | [number, number, number],
    tip: THREE.Vector3 | [number, number, number],
    radius: number,
    color: any,
    bone: any,
    name: string,
  ) =>
    b.spike(base, tip, null, radius, {
      color,
      bone,
      caps: "point",
      name,
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Main carved body, rump, neck and face

  const body = b.sweep(spine, (t) => [0.39 - 0.035 * t, 0.275 - 0.025 * t], {
    color: jaguarWood,
    section: "circle",
    sides: 8,
    shift: [0, -0.025],
    caps: "round",
    name: "carved-jaguar-body",
    group: "body",
  });

  const rump = sphere(jaguarWood, [0, 0.91, -0.53], [0.42, 0.31, 0.43], hips, "rounded-rump", 10, 7);
  const shoulder = sphere(shoulderWood, [0, 1.06, 0.25], [0.40, 0.31, 0.38], spine.joints[2], "painted-shoulders", 10, 7);

  const neckTube = b.sweep(
    neck,
    (t) => [0.22 - t * 0.025, 0.22 - t * 0.025],
    {
      color: shoulderWood,
      section: "circle",
      sides: 8,
      caps: "round",
      name: "carved-neck",
      group: "neck",
    },
  );

  const skull = sphere(faceWood, head.at, [0.255, 0.245, 0.285], head, "eagle-jaguar-skull", 14, 10);
  const cheekL = sphere(CREAM, [0.145, 1.42, 0.91], [0.145, 0.14, 0.16], head, "cheekL", 9, 6);
  const cheekR = sphere(CREAM, [-0.145, 1.42, 0.91], [0.145, 0.14, 0.16], head, "cheekR", 9, 6);
  const muzzle = sphere(CREAM, [0, 1.405, 1.00], [0.18, 0.125, 0.16], head, "cream-muzzle", 10, 7);
  const nose = sphere(INK, [0, 1.435, 1.135], [0.105, 0.07, 0.065], head, "carved-nose", 9, 6);

  const upperBeak = b.sweep(
    catmull([
      [0, 1.50, 1.08],
      [0, 1.53, 1.19],
      [0, 1.48, 1.31],
      [0, 1.40, 1.37],
    ]),
    (t) => [0.105 * (1 - t * 0.82), 0.085 * (1 - t * 0.92)],
    {
      color: beakWood,
      bone: head,
      section: "box",
      caps: { start: "round", end: "point" },
      name: "hooked-upper-beak",
      group: "face",
    },
  );

  const lowerBeak = b.sweep(
    catmull([
      [0, 1.385, 1.06],
      [0, 1.365, 1.17],
      [0, 1.34, 1.27],
    ]),
    [0.075, 0.015],
    {
      color: OCHRE,
      bone: jaw,
      section: "box",
      caps: { start: "round", end: "point" },
      name: "separate-lower-jaw",
      group: "face",
    },
  );

  // A thin dark gap keeps the two jaws visibly separate for rigging.
  b.rod([0, 1.405, 1.095], [0, 1.39, 1.27], 0.012, {
    color: INK,
    bone: jaw,
    name: "mouth-gap",
  });

  // Eyes and forehead glyph, seated on the skull surface.
  const skullSurface = b.surface(skull);
  for (const side of [1, -1]) {
    const eyeHit = skullSurface.around(head.at).at(side * 29, 5);
    if (eyeHit) {
      b.decal(skull, EYE, {
        at: eyeHit.at,
        dir: eyeHit.n,
        size: [0.145, 0.18],
        mirror: side > 0,
        lift: 0.004,
        segments: 8,
        name: side > 0 ? "painted-eye-left" : "painted-eye-right",
        group: "face",
      });
    }

    b.rod(
      [side * 0.105, 1.60, 0.94],
      [side * 0.215, 1.64, 0.99],
      0.018,
      {
        color: INK,
        bone: head,
        name: side > 0 ? "brow-left" : "brow-right",
      },
    );
  }

  const foreheadHit = skullSurface.around(head.at).at(0, 72);
  if (foreheadHit) {
    b.decal(skull, FOREHEAD_MARK, {
      at: foreheadHit.at,
      dir: foreheadHit.n,
      size: [0.10, 0.15],
      lift: 0.003,
      segments: 6,
      name: "forehead-painted-glyph",
      group: "face",
    });
  }

  // Jaguar ears: thick painted wooden slabs with magenta inner paint.
  const earOutline: [number, number, "sharp"][] = [
    [-0.095, 0.00, "sharp"],
    [-0.095, 0.095, "sharp"],
    [-0.025, 0.17, "sharp"],
    [0.075, 0.115, "sharp"],
    [0.095, 0.00, "sharp"],
  ];
  const innerEarOutline: [number, number, "sharp"][] = [
    [-0.055, 0.012, "sharp"],
    [-0.05, 0.075, "sharp"],
    [-0.018, 0.115, "sharp"],
    [0.052, 0.078, "sharp"],
    [0.06, 0.012, "sharp"],
  ];

  for (const side of [1, -1]) {
    b.extrude(earOutline, {
      at: [side * 0.155, 1.62, 0.70],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.042,
      bevel: 0.008,
      color: woodOrange,
      bone: head,
      name: side > 0 ? "ear-left" : "ear-right",
      group: "face",
    });
    b.extrude(innerEarOutline, {
      at: [side * 0.158, 1.625, 0.716],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: MAGENTA,
      bone: head,
      name: side > 0 ? "inner-ear-left" : "inner-ear-right",
      group: "face",
    });
  }

  // Cheek ruffs: chunky carved cones rather than smooth fur.
  for (const side of [1, -1]) {
    const roots = [
      [side * 0.17, 1.48, 0.87],
      [side * 0.19, 1.43, 0.90],
      [side * 0.17, 1.38, 0.91],
      [side * 0.13, 1.35, 0.92],
    ] as [number, number, number][];
    const tips = [
      [side * 0.31, 1.52, 0.82],
      [side * 0.34, 1.44, 0.84],
      [side * 0.31, 1.35, 0.86],
      [side * 0.26, 1.29, 0.91],
    ] as [number, number, number][];
    roots.forEach((root, i) => {
      paintedSpike(
        root,
        tips[i],
        0.040 - i * 0.004,
        i % 2 === 0 ? CREAM : GOLD,
        head,
        side > 0 ? `cheek-ruff-left-${i}` : `cheek-ruff-right-${i}`,
      );
    });

    b.rod(
      [side * 0.18, 1.40, 0.96],
      [side * 0.40, 1.37, 1.00],
      0.006,
      {
        color: GOLD,
        bone: head,
        name: side > 0 ? "whisker-left-low" : "whisker-right-low",
      },
    );
    b.rod(
      [side * 0.17, 1.45, 0.97],
      [side * 0.39, 1.49, 1.08],
      0.006,
      {
        color: GOLD,
        bone: head,
        name: side > 0 ? "whisker-left-high" : "whisker-right-high",
      },
    );
  }

  // Crown of three broad carved crest blades.
  const crestOutline: [number, number, "sharp"][] = [
    [-0.09, 0, "sharp"],
    [-0.055, 0.20, "sharp"],
    [0, 0.30, "sharp"],
    [0.055, 0.20, "sharp"],
    [0.09, 0, "sharp"],
  ];
  for (const [i, x] of [-0.12, 0, 0.12].entries()) {
    b.extrude(crestOutline, {
      at: [x, 1.65, 0.73],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.006,
      color: i === 1 ? GOLD : MAGENTA,
      bone: head,
      name: `painted-crown-${i}`,
      group: "face",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Legs, paws, and splayed jaguar talons

  for (const legInfo of legChains) {
    const leg = legInfo.chain;
    const side = legInfo.side;
    const front = legInfo.name.includes("F");

    b.sweep(leg, (t) => [0.115 - 0.045 * t, 0.105 - 0.042 * t], {
      color: legWood,
      section: "box",
      caps: "round",
      bands: [
        [0.23, GOLD],
        [0.48, legWood],
        [0.72, MAGENTA],
      ],
      name: `${legInfo.name}-wooden-leg`,
      group: "legs",
    });

    const paw = sphere(
      front ? CREAM : GOLD,
      leg.tip!.at,
      [0.13, 0.095, 0.16],
      leg.tip!,
      `${legInfo.name}-paw`,
      9,
      6,
    );
    const pawAt = leg.tip!.at;
    /*
    sphere(
      front ? CREAM : GOLD,
      pawAt,
      [0.13, 0.095, 0.16],
      leg.tip,
      `${legInfo.name}-paw`,
      9,
      6,
    );
    */

    // A bright cuff is a classic alebrije paint band.
    b.ring(
      leg.joints[Math.min(1, leg.joints.length - 1)],
      {
        count: 7,
        radius: 0.112,
        fromDeg: 0,
        toDeg: 360,
        name: `${legInfo.name}-cuff`,
        role: "fan",
        group: "legs",
      },
      (at) =>
        b.spike(at, at, 0.018, 0.012, {
          color: GOLD,
          bone: leg.joints[Math.min(1, leg.joints.length - 1)],
          name: `${legInfo.name}-cuff-stud`,
        }),
    );

    for (let toe = -1; toe <= 1; toe++) {
      const root: [number, number, number] = [
        pawAt.x + toe * 0.055,
        pawAt.y - 0.015,
        pawAt.z + 0.055,
      ];
      const tip: [number, number, number] = [
        pawAt.x + toe * 0.072,
        0.065,
        pawAt.z + 0.19 + (front ? 0.025 : 0),
      ];
      paintedSpike(
        root,
        tip,
        0.026,
        BONE,
        leg.tip,
        `${legInfo.name}-toe-${toe + 1}`,
      );
      b.decal(
        paw,
        TALON_MARK,
        {
          at: [pawAt.x + toe * 0.055, pawAt.y + 0.002, pawAt.z + 0.07],
          dir: [0, 1, 0],
          size: [0.035, 0.035],
          lift: 0.001,
          segments: 4,
          bone: leg.tip!,
          name: `${legInfo.name}-toe-mark-${toe + 1}`,
          group: "legs",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: low-poly arm bones, large membranes, then broad primary feathers.

  const wingSweeps: { side: number; chain: ReturnType<typeof b.chain>; sweep: any }[] = [];

  for (const wingInfo of wingChains) {
    const side = wingInfo.side;
    const wing = wingInfo.chain;
    const name = wingInfo.name;

    const wingSweep = b.sweep(wing, (t) => [0.105 - 0.065 * t, 0.085 - 0.06 * t], {
      color: wingWood,
      section: "box",
      caps: "round",
      name: `${name}-arm`,
      group: "wings",
    });
    wingSweeps.push({ side, chain: wing, sweep: wingSweep });

    const edgePoints = [0.08, 0.31, 0.54, 0.76, 0.96].map((t) => {
      const p = wing.at(t);
      return p.moved(p.at.clone().add(new THREE.Vector3(0, 0.19 - 0.07 * t, 0.045)));
    });

    const wingEdge = catmull(edgePoints);
    b.membrane(wing, wingEdge, {
      color: wingMembrane,
      thickness: 0.018,
      rows: 4,
      cols: 10,
      scallop: 0.16,
      bone: wing.joints[0],
      name: `${name}-painted-membrane`,
      group: "wings",
    });

    // Painted knuckle disks and a row of angular wing joints.
    for (const t of [0.16, 0.39, 0.62, 0.84]) {
      const at = wing.at(t);
      sphere(
        t > 0.55 ? MAGENTA : GOLD,
        at.at,
        [0.075 - t * 0.025, 0.075 - t * 0.025, 0.045],
        at.bone ?? wing.joints[0],
        `${name}-knuckle-${t}`,
        8,
        5,
      );
    }

    // Five blocky primary feathers fan past the membrane.
    for (let i = 0; i < 5; i++) {
      const rootT = 0.33 + i * 0.13;
      const rootFrame = wing.at(rootT);
      const tip: [number, number, number] = [
        side * (1.02 + i * 0.13),
        1.53 + i * 0.105,
        -0.14 - i * 0.16,
      ];
      const featherColor = i % 3 === 0 ? GOLD : i % 3 === 1 ? MAGENTA : TURQUOISE;

      b.frustumBox(
        rootFrame.at,
        tip,
        [0.16 - i * 0.018, 0.055],
        [0.025, 0.018],
        {
          color: featherColor,
          bone: rootFrame.bone ?? wing.joints[Math.min(i + 1, wing.joints.length - 1)],
          name: `${name}-primary-feather-${i}`,
          group: "wings",
        },
      );

      b.rod(rootFrame.at, tip, 0.018, {
        color: INK,
        bone: rootFrame.bone ?? wing.joints[Math.min(i + 1, wing.joints.length - 1)],
        name: `${name}-primary-shaft-${i}`,
        group: "wings",
      });

      b.cards(
        [rootFrame.moved(rootFrame.at.clone().add(new THREE.Vector3(0, 0.01, 0.015)))],
        FEATHER_MARK,
        {
          size: [0.075, 0.16],
          lean: 72,
          flow: [side * 0.8, 0.2, -0.35],
          bend: 12,
          color: "#ffffff",
          sink: 0.04,
          mirror: side < 0,
          name: `${name}-feather-painted-mark-${i}`,
          group: "wings",
        },
      );
    }

    // A large eye motif on each wing makes the silhouette instantly alebrije.
    const wingEyePoint = wingSweep.at(0.49, 0, 0.008);
    b.decal(wingSweep, WING_EYE, {
      at: wingEyePoint.at,
      dir: wingEyePoint.n,
      size: [0.26, 0.21],
      mirror: side < 0,
      lift: 0.004,
      segments: 8,
      name: `${name}-wing-eye`,
      group: "wings",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Tail, tail fan, and dorsal crest

  const tailSweep = b.sweep(
    tail,
    (t) => [0.17 - 0.135 * t, 0.14 - 0.11 * t],
    {
      color: tailWood,
      section: "circle",
      sides: 8,
      caps: "round",
      bands: [
        [0.24, GOLD],
        [0.50, tailWood],
        [0.74, TURQUOISE],
        [0.88, MAGENTA],
      ],
      name: "striped-carved-tail",
      group: "tail",
    },
  );

  // Dorsal spikes follow the body and tail as a continuous ornament.
  b.along(body, 8, (at) =>
    b.spike(at, at, 0.085, 0.025, {
      color: GOLD,
      name: "back-ridge",
      group: "body",
    }),
  );
  b.along(tailSweep, 6, (at) =>
    b.spike(at, at, 0.055, 0.018, {
      color: TURQUOISE,
      name: "tail-ridge",
      group: "tail",
    }),
  );

  // Five broad tail feathers.
  for (let i = -2; i <= 2; i++) {
    const base: [number, number, number] = [i * 0.035, 1.08 + Math.abs(i) * 0.015, -1.19];
    const tip: [number, number, number] = [
      i * 0.27,
      1.37 + (2 - Math.abs(i)) * 0.05,
      -1.72 - Math.abs(i) * 0.05,
    ];
    b.frustumBox(
      base,
      tip,
      [0.13, 0.045],
      [0.018, 0.012],
      {
        color: i === 0 ? GOLD : i % 2 ? MAGENTA : TURQUOISE,
        bone: tail.joints[Math.min(2, tail.joints.length - 1)],
        name: `tail-fan-feather-${i + 2}`,
        group: "tail",
      },
    );
    b.rod(base, tip, 0.014, {
      color: INK,
      bone: tail.joints[Math.min(2, tail.joints.length - 1)],
      name: `tail-fan-shaft-${i + 2}`,
      group: "tail",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Physical painted rosettes and ceremonial body markings.

  const bodySurface = b.surface([body, rump, shoulder]);
  const rosetteHits = bodySurface.scatter(30, {
    rng: rng(2468),
    minDist: 0.105,
    filter: (hit) => hit.n.y > -0.38 && hit.at.y > 0.72,
  });

  for (let i = 0; i < rosetteHits.length; i++) {
    const hit = rosetteHits[i];
    const r = 0.032 + (i % 3) * 0.005;
    b.stick(new THREE.CylinderGeometry(r, r, 0.014, 8), INK, hit, {
      embed: 0.45,
      name: `carved-rosette-${i}`,
      group: "body-paint",
    });
    if (i % 2 === 0) {
      b.stick(
        new THREE.CylinderGeometry(r * 0.38, r * 0.38, 0.018, 7),
        GOLD,
        hit.moved([0, 0.006, 0]),
        {
          embed: 0.3,
          name: `rosette-center-${i}`,
          group: "body-paint",
        },
      );
    }
  }

  // Chest star emblem, placed on the forward-facing body surface.
  const chestHit = bodySurface.nearest([0, 1.03, 0.61]);
  if (chestHit) {
    b.decal([body, shoulder], CHEST_EMBLEM, {
      at: chestHit.at,
      dir: chestHit.n,
      size: [0.29, 0.33],
      lift: 0.005,
      segments: 9,
      name: "hero-chest-emblem",
      group: "body-paint",
    });
  }

  // A collar of carved studs separates the jaguar body from the eagle neck.
  const collar = b.ring(neck.joints[0], {
    count: 12,
    radius: 0.205,
    fromDeg: 0,
    toDeg: 360,
    name: "collar-studs",
    role: "fan",
    group: "neck",
  });
  collar.items.forEach((item, i) => {
    b.stick(
      new THREE.CylinderGeometry(0.026, 0.026, 0.018, 7),
      i % 3 === 0 ? GOLD : MAGENTA,
      item,
      {
        embed: 0.3,
        spin: i * 17,
        name: `collar-stud-${i}`,
        group: "neck",
      },
    );
  });

  // Decorative hooked quills beneath the eagle jaw.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const base: [number, number, number] = [
        side * (0.07 + i * 0.035),
        1.35 - i * 0.04,
        0.81,
      ];
      const tip: [number, number, number] = [
        side * (0.14 + i * 0.05),
        1.23 - i * 0.045,
        0.78 + i * 0.025,
      ];
      paintedSpike(
        base,
        tip,
        0.021,
        i === 1 ? TURQUOISE : MAGENTA,
        jaw,
        side > 0 ? `jaw-quill-left-${i}` : `jaw-quill-right-${i}`,
      );
    }
  }

  // A few chunky carved blocks at the hips give the body a hand-hewn puppet quality.
  for (const side of [1, -1]) {
    box(
      GOLD,
      [side * 0.34, 0.91, -0.40],
      [0.12, 0.13, 0.12],
      hips,
      side > 0 ? "left-hip-plate" : "right-hip-plate",
    );
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 8), INK, {
      at: [side * 0.405, 0.91, -0.40],
      dir: [side, 0, 0],
      bone: hips,
      name: side > 0 ? "left-hip-rivet" : "right-hip-rivet",
      group: "body-paint",
    });
  }

  // Final tiny colored studs around the eyes and beak.
  for (const side of [1, -1]) {
    b.stick(
      new THREE.SphereGeometry(0.018, 7, 5),
      GOLD,
      skullSurface.nearest([side * 0.18, 1.56, 1.00]),
      {
        embed: 0.1,
        name: side > 0 ? "eye-gold-stud-left" : "eye-gold-stud-right",
        group: "face",
      },
    );
  }

  return b.root;
}
