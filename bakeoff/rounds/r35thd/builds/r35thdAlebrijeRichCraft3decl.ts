import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  limb,
  paint,
  mottle,
  spots,
  stripes,
  grain,
  countershade,
  offset,
} from "../../../../src/index";
import { svg } from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A fantastical Oaxacan alebrije carved from painted wood: a spotted jaguar body with eagle beak, jeweled eyes, enormous patterned wings, feathered tail, and saturated hand-painted ornament.",
};

const TURQUOISE = "#16a99b";
const TURQUOISE_DARK = "#075b68";
const EMERALD = "#087d62";
const JADE = "#36c9a4";
const SUN_YELLOW = "#ffd34e";
const GOLD = "#f39b32";
const ORANGE = "#ee5d32";
const CORAL = "#d83e58";
const MAGENTA = "#a52a72";
const PURPLE = "#54236c";
const BLUE = "#2265a8";
const CREAM = "#ffe8a4";
const BONE = "#f6c873";
const DARK = "#29152c";
const WOOD = "#70352d";
const PAW = "#e96869";
const WHITE = "#fff4c9";

const BODY_BASE = grain(
  mottle(TURQUOISE, EMERALD, { size: 0.17, contrast: 1.2, seed: 11 }),
  JADE,
  { size: 0.11, axis: "z", seed: 8 },
);

const BODY_COAT = cel(
  spots(BODY_BASE, [ORANGE, GOLD, CORAL], {
    size: 0.16,
    amount: 0.72,
    rosette: true,
    seed: 23,
  }),
  TURQUOISE_DARK,
  { threshold: 0.06 },
);

const BELLY = cel(
  grain(CREAM, GOLD, { size: 0.09, axis: "z", seed: 29 }),
  "#b94c43",
);

const LEG_COAT = cel(
  stripes(BODY_COAT, [GOLD, CORAL, MAGENTA], {
    size: 0.17,
    axis: "y",
    width: 0.32,
    wobble: 0.18,
    seed: 36,
  }),
  TURQUOISE_DARK,
);

const WING_PAINT = cel(
  grain(
    spots(JADE, [GOLD, MAGENTA, ORANGE], {
      size: 0.13,
      amount: 0.58,
      rosette: false,
      seed: 45,
    }),
    TURQUOISE,
    { size: 0.08, axis: "x", seed: 51 },
  ),
  "#124a72",
);

const MEMBRANE_PAINT = cel(
  mottle("#1e9ab0", "#2459a3", { size: 0.12, contrast: 1.4, seed: 61 }),
  "#173c72",
);

const BEAK_PAINT = cel(
  grain(GOLD, ORANGE, { size: 0.055, axis: "y", seed: 69 }),
  "#9e352d",
);

const CREST_PAINT = cel(
  stripes(MAGENTA, [ORANGE, SUN_YELLOW, BLUE], {
    size: 0.07,
    axis: "y",
    width: 0.38,
    wobble: 0.1,
    seed: 76,
  }),
  PURPLE,
);

const EYE_TEXTURE = animeEye({
  iris: "#32d6bd",
  irisLight: "#d8ff82",
  irisDark: "#163a6d",
  ink: INK,
  blush: "#f08b82",
  size: 512,
});

const FEATHER_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 220">
    <defs>
      <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffd94f"/>
        <stop offset=".42" stop-color="#ef653c"/>
        <stop offset="1" stop-color="#92276c"/>
      </linearGradient>
    </defs>
    <path d="M50 216 C20 190 5 145 16 89 C23 52 39 19 50 4 C63 22 80 52 86 91 C96 148 78 191 50 216Z"
      fill="url(#f)" stroke="#281531" stroke-width="6" stroke-linejoin="round"/>
    <path d="M50 207 C47 158 47 87 50 13" fill="none" stroke="#ffe77c" stroke-width="6"/>
    <path d="M45 165 C30 150 22 128 19 103 M55 165 C70 150 78 127 81 101"
      fill="none" stroke="#42d2b2" stroke-width="8" stroke-linecap="round"/>
    <circle cx="31" cy="72" r="8" fill="#2165a7"/>
    <circle cx="69" cy="72" r="8" fill="#2165a7"/>
    <circle cx="27" cy="121" r="6" fill="#ffd94f"/>
    <circle cx="73" cy="121" r="6" fill="#ffd94f"/>
  </svg>`,
  { size: 256 },
);

const SUN_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="43" fill="#ffd84f" stroke="#3b1735" stroke-width="7"/>
    <path d="M64 6 L72 38 L99 18 L87 47 L122 49 L91 64 L116 88 L84 80 L82 119 L64 89 L43 119 L45 84 L11 96 L37 68 L5 49 L42 45 L27 14 L55 36Z"
      fill="#ef6737" stroke="#3b1735" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="64" cy="64" r="22" fill="#ffe8a4" stroke="#3b1735" stroke-width="5"/>
    <circle cx="56" cy="57" r="5" fill="#3b1735"/>
    <circle cx="72" cy="57" r="5" fill="#3b1735"/>
    <path d="M53 73 Q64 82 75 73" fill="none" stroke="#3b1735" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const CHEST_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <path d="M80 7 L97 55 L150 45 L111 78 L145 119 L96 99 L80 153 L63 99 L15 119 L49 78 L10 45 L63 55Z"
      fill="#f6d34d" stroke="#351630" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="80" cy="80" r="28" fill="#1a9e9f" stroke="#351630" stroke-width="7"/>
    <circle cx="80" cy="80" r="12" fill="#ef653c"/>
  </svg>`,
  { size: 256 },
);

function sphere(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3 | readonly number[],
  scale: readonly [number, number, number],
  color: any,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
    at,
    scale,
    bone,
    flat: true,
    name,
  });
}

function makeRosette(
  b: ReturnType<typeof createBuilder>,
  hit: any,
  radius: number,
  color: string,
  name: string,
) {
  return b.stick(
    new THREE.TorusGeometry(radius, radius * 0.17, 5, 9),
    color,
    hit,
    { embed: 0.42, name },
  );
}

function makeStripeBand(
  b: ReturnType<typeof createBuilder>,
  chain: any,
  t: number,
  radius: number,
  color: string,
  name: string,
) {
  const p = chain.at(t);
  const ring = b.ring(p, { count: 12, radius });
  b.sweep(catmull(ring.items, { closed: true }), 0.014, {
    color,
    caps: "none",
    name,
  });
}

export default function build() {
  const b = createBuilder({
    name: "alebrije-jaguar-eagle",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------
  // Skeleton first: one readable quadruped spine, open jaw, tail, four legs,
  // and broad resting wings.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.88, -0.24],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.88, -0.38],
      [0, 0.97, -0.05],
      [0, 1.04, 0.25],
      [0, 1.08, 0.48],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "chest", "withers"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.07, 0.43],
      [0, 1.17, 0.61],
      [0, 1.29, 0.76],
    ]),
    {
      parent: spine.tip!,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.33, 0.82],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.22, 1.01],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.87, -0.3],
      [0, 0.82, -0.63],
      [0, 0.73, -0.96],
      [0, 0.62, -1.28],
      [0, 0.56, -1.58],
      [0, 0.58, -1.82],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legData: {
    side: number;
    front: boolean;
    chain: any;
    target: THREE.Vector3;
  }[] = [];

  for (const side of [1, -1]) {
    for (const front of [true, false]) {
      const z = front ? 0.28 : -0.24;
      const target = new THREE.Vector3(side * 0.42, 0.105, z + (front ? 0.07 : -0.03));
      const root = new THREE.Vector3(side * 0.29, 0.92, z);
      const points = limb(
        root,
        target,
        [0.31, 0.30, 0.22],
        [
          [0, 0, front ? 1 : -1],
          [0, 0, front ? -1 : 1],
        ],
      );
      const tag = `${front ? "front" : "hind"}${side > 0 ? "L" : "R"}`;
      const leg = b.chain("leg" + tag, points, {
        parent: hips,
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `paw${tag}`],
        role: "leg",
        contact: target,
      });
      legData.push({ side, front, chain: leg, target });
    }
  }

  const wingData: { side: number; chain: any }[] = [];

  for (const side of [1, -1]) {
    const wing = b.chain(
      `wing${side > 0 ? "L" : "R"}`,
      catmull([
        [side * 0.34, 1.12, 0.26],
        [side * 0.57, 1.29, 0.20],
        [side * 0.88, 1.43, 0.04],
        [side * 1.19, 1.46, -0.16],
        [side * 1.43, 1.34, -0.32],
      ]),
      {
        parent: spine.tip!,
        names: [
          `shoulder${side > 0 ? "L" : "R"}`,
          `wingArm${side > 0 ? "L" : "R"}`,
          `wingElbow${side > 0 ? "L" : "R"}`,
          `wingWrist${side > 0 ? "L" : "R"}`,
          `wingTip${side > 0 ? "L" : "R"}`,
        ],
        role: "wing",
      },
    );
    wingData.push({ side, chain: wing });
  }

  // ---------------------------------------------------------------------------
  // Main carved volumes.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.28 - t * 0.045, {
    color: BODY_COAT,
    shift: [0, -0.025],
    section: { ngon: 8 },
    sides: 8,
    smooth: false,
    sectors: [[125, 235, BELLY]],
    name: "painted-jaguar-body",
    group: "body",
  });

  const neckSweep = b.sweep(neck, [0.22, 0.18], {
    color: BODY_COAT,
    section: { ngon: 8 },
    sides: 8,
    smooth: false,
    sectors: [[122, 238, BELLY]],
    name: "painted-neck",
    group: "body",
  });

  const tailSweep = b.sweep(tail, (t) => 0.16 * (1 - t) + 0.035, {
    color: BODY_COAT,
    section: { ngon: 8 },
    sides: 8,
    smooth: false,
    bands: [
      [0.66, GOLD],
      [0.79, CORAL],
      [0.9, MAGENTA],
    ],
    name: "striped-tail",
    group: "tail",
  });

  for (const { side, front, chain } of legData) {
    const legSweep = b.sweep(chain, (t) => 0.105 - t * 0.035, {
      color: LEG_COAT,
      section: { ngon: 6 },
      sides: 6,
      smooth: false,
      bands: [
        [0.56, GOLD],
        [0.68, CORAL],
        [0.8, LEG_COAT as any],
      ],
      name: `${front ? "front" : "hind"}-leg-${side > 0 ? "L" : "R"}`,
      group: "legs",
    });

    makeStripeBand(b, chain, 0.61, 0.1, SUN_YELLOW, "painted-leg-cuff");
    makeStripeBand(b, chain, 0.73, 0.088, CORAL, "painted-leg-cuff");

    const paw = chain.tip!;
    sphere(
      b,
      paw.at,
      [0.12, 0.085, 0.14],
      BODY_COAT,
      paw,
      `rounded-paw-${side > 0 ? "L" : "R"}-${front ? "F" : "H"}`,
    );

    const pad = sphere(
      b,
      new THREE.Vector3(side * 0.42, 0.095, front ? 0.39 : -0.29),
      [0.058, 0.018, 0.072],
      PAW,
      paw,
      "paw-pad",
    );

    for (let i = -1; i <= 1; i++) {
      const base = new THREE.Vector3(
        side * 0.42 + i * 0.042,
        0.105,
        (front ? 0.39 : -0.29) + 0.035,
      );
      const tip = base.clone().add(
        new THREE.Vector3(i * 0.022, 0.005, front ? 0.105 : -0.095),
      );
      b.spike(base, tip, null, 0.019, BONE, {
        bone: paw,
        caps: { start: "round", end: "point" },
        name: "painted-toe",
        group: "digits",
      });
    }

    b.part(new THREE.SphereGeometry(0.025, 7, 5), SUN_YELLOW, {
      bone: paw,
      at: new THREE.Vector3(side * 0.42, 0.145, front ? 0.365 : -0.265),
      name: "paw-gold-stud",
      group: "ornament",
    });
  }

  // Head, muzzle, open lower jaw, and beak.
  const skullCenter = head.local([0, 0.08, 0.015]);
  const skull = sphere(
    b,
    skullCenter,
    [0.335, 0.285, 0.325],
    BODY_COAT,
    head,
    "faceted-jaguar-skull",
  );

  const skullSurface = b.surface(skull);

  const muzzle = b.capsule(
    head.local([0, 0.27, -0.045]),
    head.local([0, 0.47, -0.075]),
    [0.17, 0.135],
    BELLY,
    {
      bone: head,
      section: { ngon: 8 },
      sides: 8,
      smooth: false,
      name: "cream-muzzle",
      group: "face",
    },
  );

  const lowerJaw = b.capsule(
    jaw.at,
    head.local([0, 0.47, -0.14]),
    [0.105, 0.07],
    BELLY,
    {
      bone: jaw,
      section: { ngon: 6 },
      sides: 6,
      smooth: false,
      name: "open-lower-jaw",
      group: "jaw",
    },
  );

  const nose = sphere(
    b,
    head.local([0, 0.53, -0.035]),
    [0.1, 0.07, 0.065],
    DARK,
    head,
    "black-jaguar-nose",
  );

  b.extrude(
    [
      [-0.13, 0],
      [0.13, 0],
      [0.115, 0.075],
      [0.045, 0.16],
      [-0.01, 0.22],
      [-0.07, 0.18],
      [-0.13, 0.09],
    ],
    {
      at: head.local([0, 0.48, 0.025]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.13,
      bevel: 0.012,
      smoothing: 1,
      color: BEAK_PAINT,
      bone: head,
      name: "broad-eagle-beak",
      group: "face",
    },
  );

  b.rod(
    head.local([0, 0.49, -0.035]),
    head.local([0, 0.68, -0.05]),
    0.009,
    INK,
    { bone: head, name: "beak-mouth-line", group: "face" },
  );

  for (const side of [1, -1]) {
    const eyePoint = head.local([side * 0.145, 0.27, 0.105]);
    const eyeHit = skullSurface.nearest(eyePoint);
    b.decal(skullSurface, EYE_TEXTURE, {
      at: eyeHit,
      dir: eyeHit.n,
      up: [0, 1, 0],
      size: [0.14, 0.18],
      segments: [5, 6],
      lift: 0.004,
      mirror: side > 0,
      name: `painted-eye-${side > 0 ? "L" : "R"}`,
      group: "face",
    });

    const earBase = head.local([side * 0.19, 0.035, 0.17]);
    b.extrude(
      [
        [0, 0],
        [0.16, 0.025],
        [0.125, 0.19],
        [0.045, 0.255],
        [-0.035, 0.15],
      ],
      {
        at: earBase,
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.07,
        bevel: 0.012,
        smoothing: 1,
        color: BODY_COAT,
        bone: head,
        name: `jaguar-ear-${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );

    b.extrude(
      [
        [0.02, 0.015],
        [0.105, 0.04],
        [0.08, 0.135],
        [0.035, 0.18],
      ],
      {
        at: earBase,
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.078,
        bevel: 0.005,
        smoothing: 1,
        color: MAGENTA,
        bone: head,
        name: `ear-inner-${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );

    b.spike(
      head.local([side * 0.17, 0.1, 0.29]),
      [0, 0.25, 0.3],
      0.085,
      0.028,
      SUN_YELLOW,
      {
        bone: head,
        name: "ear-tuft",
        group: "ornament",
      },
    );

    // Whiskers and two small jaguar teeth on the open jaw.
    for (const row of [-1, 0, 1]) {
      const root = head.local([side * (0.12 + Math.abs(row) * 0.018), 0.43, -0.045 + row * 0.035]);
      const tip = root.clone().add(
        new THREE.Vector3(side * (0.18 + Math.abs(row) * 0.035), 0.12 + row * 0.025, row * 0.035),
      );
      b.rod(root, tip, 0.0045, INK, {
        bone: head,
        name: "painted-whisker",
        group: "face",
      });
    }

    b.spike(
      head.local([side * 0.06, 0.43, -0.13]),
      [0, -0.08, 1],
      0.08,
      0.018,
      WHITE,
      { bone: jaw, name: "jaguar-tooth", group: "jaw" },
    );
  }

  // Bright forehead sun and chest emblem.
  const forehead = skullSurface.nearest(head.local([0, 0.19, 0.22]));
  b.decal(skullSurface, SUN_TEXTURE, {
    at: forehead,
    dir: forehead.n,
    up: [0, 1, 0],
    size: [0.14, 0.14],
    segments: [5, 5],
    lift: 0.006,
    name: "forehead-sun",
    group: "ornament",
  });

  const chestHit = b.surface(body).nearest([0, 1.08, 0.56]);
  b.decal(b.surface(body), CHEST_TEXTURE, {
    at: chestHit,
    dir: chestHit.n,
    up: [0, 1, 0],
    size: [0.22, 0.23],
    segments: [6, 6],
    lift: 0.006,
    name: "chest-sun",
    group: "ornament",
  });

  // A carved magenta crest behind the skull.
  b.extrude(
    [
      [-0.19, 0],
      [-0.13, 0.16],
      [-0.07, 0.08],
      [0, 0.31],
      [0.07, 0.08],
      [0.14, 0.2],
      [0.2, 0],
    ],
    {
      at: head.local([0, -0.13, 0.1]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.009,
      smoothing: 1,
      color: CREST_PAINT,
      bone: head,
      name: "painted-head-crest",
      group: "ornament",
    },
  );

  // ---------------------------------------------------------------------------
  // Wings: low-poly leading bones, colored membranes, and large transparent
  // painted feather cards for the characteristic alebrije silhouette.
  // ---------------------------------------------------------------------------

  for (const { side, chain: wing } of wingData) {
    const wingSweep = b.sweep(wing, (t) => 0.125 - 0.085 * t, {
      color: WING_PAINT,
      section: { ngon: 6 },
      sides: 6,
      smooth: false,
      name: `wing-leading-edge-${side > 0 ? "L" : "R"}`,
      group: "wings",
    });

    const centerPts = [
      [side * 0.34, 1.12, 0.26],
      [side * 0.57, 1.29, 0.2],
      [side * 0.88, 1.43, 0.04],
      [side * 1.19, 1.46, -0.16],
      [side * 1.43, 1.34, -0.32],
    ];

    const lower = centerPts.map(([x, y, z]) => [x, y - 0.13, z + 0.015]);
    const upper = centerPts.map(([x, y, z], i) => [
      x,
      y + 0.13 - i * 0.035,
      z - 0.02,
    ]);

    b.membrane(lower, upper, {
      color: MEMBRANE_PAINT,
      thickness: 0.018,
      rows: 5,
      cols: 8,
      scallop: 0.14,
      bone: wing,
      name: `painted-wing-membrane-${side > 0 ? "L" : "R"}`,
      group: "wings",
    });

    makeStripeBand(b, wing, 0.2, 0.14, SUN_YELLOW, "wing-gold-band");
    makeStripeBand(b, wing, 0.42, 0.115, CORAL, "wing-coral-band");

    const featherFrames: any[] = [];
    const featherT = [0.18, 0.34, 0.5, 0.65, 0.78, 0.88, 0.95];

    featherT.forEach((t, i) => {
      const root = wing.at(t).at.clone().add(
        new THREE.Vector3(0, -0.04 + i * 0.008, 0.04),
      );
      const direction = new THREE.Vector3(
        side * (0.52 + i * 0.045),
        0.26 - i * 0.024,
        -0.03 - i * 0.012,
      ).normalize();
      featherFrames.push(frame(root, direction));
    });

    b.cards(featherFrames, FEATHER_TEXTURE, {
      size: [0.17, 0.52],
      lean: 4,
      bend: 10,
      vary: 0.13,
      spin: side > 0 ? 3 : -3,
      mirror: side < 0,
      color: WHITE,
      bone: wing.joints[0],
      sink: 0.12,
      name: `painted-flight-feathers-${side > 0 ? "L" : "R"}`,
      group: "wings",
    });

    // Small raised quills along the wing's upper edge.
    b.along(wingSweep, 6, (at: any) => {
      b.spike(at, at, 0.065, 0.018, {
        color: SUN_YELLOW,
        name: "wing-quill",
        group: "wings",
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Tail plume: broad patterned feather cards and a carved fan.
  // ---------------------------------------------------------------------------

  const tailEnd = tail.tip!.at.clone();
  const tailFrames: any[] = [];
  for (let i = -3; i <= 3; i++) {
    const root = tailEnd.clone().add(new THREE.Vector3(i * 0.045, 0.015 + Math.abs(i) * 0.015, 0));
    const direction = new THREE.Vector3(
      i * 0.22,
      0.2 + (3 - Math.abs(i)) * 0.04,
      -0.38 - Math.abs(i) * 0.025,
    ).normalize();
    tailFrames.push(frame(root, direction));
  }

  b.cards(tailFrames, FEATHER_TEXTURE, {
    size: [0.13, 0.4],
    lean: 0,
    bend: 12,
    vary: 0.12,
    mirror: false,
    color: WHITE,
    bone: tail.tip!,
    sink: 0.13,
    name: "seven-feather-tail-fan",
    group: "tail",
  });

  b.extrude(
    [
      [-0.23, 0],
      [-0.13, 0.06],
      [-0.07, 0.29],
      [0, 0.43],
      [0.07, 0.29],
      [0.14, 0.06],
      [0.23, 0],
    ],
    {
      at: tailEnd.clone().add(new THREE.Vector3(0, -0.02, -0.015)),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      smoothing: 1,
      color: CREST_PAINT,
      bone: tail.tip!,
      name: "carved-tail-fan",
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // Raised painted rosettes, dorsal tufts, collars, and carved studs.
  // ---------------------------------------------------------------------------

  const bodySurface = b.surface(body);
  const bodySpots = bodySurface.scatter(25, {
    rng: rng(102),
    minDist: 0.115,
    filter: (h: any) => h.n.y > -0.42 && h.n.z > -0.45,
  });

  bodySpots.forEach((hit: any, i: number) => {
    makeRosette(
      b,
      hit,
      0.038 + (i % 3) * 0.006,
      i % 3 === 0 ? DARK : MAGENTA,
      `raised-body-rosette-${i}`,
    );
    if (i % 4 === 0) {
      b.stick(
        new THREE.SphereGeometry(0.012, 6, 4),
        SUN_YELLOW,
        hit,
        { embed: 0.35, name: "rosette-center", group: "ornament" },
      );
    }
  });

  const cheekSpots = skullSurface.scatter(11, {
    rng: rng(119),
    minDist: 0.055,
    filter: (h: any) => h.n.z > 0.12 && h.n.y < 0.18,
  });

  cheekSpots.forEach((hit: any, i: number) => {
    makeRosette(b, hit, 0.025 + (i % 2) * 0.006, DARK, `cheek-rosette-${i}`);
  });

  // A row of turquoise-and-gold dorsal carved spikes.
  for (let i = 0; i < 8; i++) {
    const t = 0.08 + i * 0.115;
    const top = body.at(t, 0);
    b.spike(top, top, 0.07 + (i % 3) * 0.012, 0.025, i % 2 ? GOLD : SUN_YELLOW, {
      name: "dorsal-carved-tuft",
      group: "ornament",
    });
  }

  // Painted collar around the base of the neck.
  const collarPoint = neck.at(0.22);
  const collarRing = b.ring(collarPoint, {
    count: 14,
    radius: 0.205,
    name: "collar",
    role: "fan",
    group: "ornament",
  });
  b.sweep(catmull(collarRing.items, { closed: true }), 0.022, {
    color: MAGENTA,
    caps: "none",
    name: "magenta-neck-collar",
    group: "ornament",
  });

  const collarRing2 = b.ring(neck.at(0.27), {
    count: 14,
    radius: 0.208,
    group: "ornament",
  });
  b.sweep(catmull(collarRing2.items, { closed: true }), 0.012, {
    color: SUN_YELLOW,
    caps: "none",
    name: "gold-neck-collar",
    group: "ornament",
  });

  // Decorative wooden beads at the shoulder and hip.
  for (const side of [1, -1]) {
    for (const z of [-0.2, 0.25]) {
      const p = new THREE.Vector3(side * 0.32, 1.01, z);
      b.part(new THREE.SphereGeometry(0.045, 7, 5), ORANGE, {
        at: p,
        bone: hips,
        scale: [1, 1.15, 1],
        name: "carved-shoulder-bead",
        group: "ornament",
      });
      b.part(new THREE.SphereGeometry(0.021, 6, 4), SUN_YELLOW, {
        at: p.clone().add(new THREE.Vector3(side * 0.028, 0.015, 0.025)),
        bone: hips,
        name: "bead-highlight",
        group: "ornament",
      });
    }
  }

  // Bright little cheek fans, a signature alebrije exaggeration.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const p = head.local([side * (0.22 + i * 0.025), 0.27 - i * 0.03, -0.01 + i * 0.035]);
      const tip = p.clone().add(
        new THREE.Vector3(side * (0.13 + i * 0.025), 0.03 + i * 0.025, -0.025),
      );
      b.spike(p, tip, null, 0.018, i === 1 ? SUN_YELLOW : MAGENTA, {
        bone: head,
        name: "cheek-feather-fan",
        group: "ornament",
      });
    }
  }

  // Tiny glowing turquoise jewel on the forehead for a magical carved-inlay accent.
  const jewelHit = skullSurface.nearest(head.local([0, 0.3, 0.19]));
  const jewel = b.stick(
    new THREE.OctahedronGeometry(0.026, 0),
    "#6effd7",
    jewelHit,
    { embed: 0.08, name: "forehead-jewel", group: "magic" },
  );
  glow(jewel, 1.8);

  // A few painted marks on the legs, deliberately asymmetrical like hand-painted wood.
  for (const { side, front, chain } of legData) {
    const ankle = chain.at(0.78);
    b.stick(
      new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8),
      front ? MAGENTA : BLUE,
      ankle,
      { embed: 0.25, spin: side * 18, name: "ankle-inlay", group: "ornament" },
    );
  }

  // Ensure the whole creature is a single builder-owned object tree.
  return b.root;
}
