```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  countershade,
  gradient,
  limb,
  paint,
  rng,
  spots,
  stripes,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A vividly painted Oaxacan alebrije: a spotted jaguar body with an eagle's beak, expressive eyes, fan wings, feather crest, talons, and carved-wood colors.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const INK = "#24152d";
  const WOOD = "#6c2d26";
  const WOOD_DARK = "#3b1c27";
  const JAGUAR = "#e9a52e";
  const JAGUAR_GOLD = "#f5c94a";
  const BELLY = "#f4d98b";
  const TURQUOISE = "#18a9a4";
  const TURQUOISE_DARK = "#096d78";
  const MAGENTA = "#d93c77";
  const RED = "#b92d39";
  const CORAL = "#f06b47";
  const PURPLE = "#673d91";
  const BLUE = "#285ca8";
  const IVORY = "#fff0bd";
  const BEAK = "#e8b83e";
  const TALON = "#4a2030";

  const jaguarCoat = countershade(
    spots(
      stripes(JAGUAR, [WOOD_DARK, WOOD], {
        size: 0.34,
        width: 0.12,
        wobble: 0.3,
        seed: 18,
      }),
      [WOOD_DARK, "#57243a", "#7f2d32"],
      { size: 0.17, amount: 0.65, rosette: true, seed: 9 },
    ),
    BELLY,
    { level: -0.18, soft: 0.28 },
  );

  const legPaint = spots(
    countershade(JAGUAR_GOLD, BELLY, { level: -0.25, soft: 0.3 }),
    [WOOD_DARK, "#7f2d32"],
    { size: 0.14, amount: 0.42, rosette: true, seed: 44 },
  );

  const tailPaint = gradient(
    stripes(JAGUAR, [WOOD_DARK, MAGENTA], {
      size: 0.18,
      width: 0.3,
      wobble: 0.15,
      seed: 21,
    }),
    MAGENTA,
    [0, 0.8, -0.45],
    [0, 1.15, -1.55],
  );

  const wingPaint = countershade(
    spots(TURQUOISE, [MAGENTA, CORAL, PURPLE], {
      size: 0.23,
      amount: 0.5,
      rosette: true,
      seed: 7,
    }),
    TURQUOISE_DARK,
    { level: -0.08, soft: 0.3 },
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iris" cx="42%" cy="35%">
          <stop offset="0" stop-color="#fff4a8"/>
          <stop offset=".35" stop-color="#f7c52d"/>
          <stop offset=".78" stop-color="#d36121"/>
          <stop offset="1" stop-color="#24152d"/>
        </radialGradient>
      </defs>
      <path d="M8 68 Q48 4 92 62 Q56 112 8 68Z" fill="#24152d"/>
      <ellipse cx="51" cy="62" rx="29" ry="39" fill="url(#iris)" stroke="#24152d" stroke-width="5"/>
      <ellipse cx="53" cy="66" rx="8" ry="28" fill="#170f1d"/>
      <ellipse cx="39" cy="38" rx="10" ry="14" fill="#fffbe5"/>
      <circle cx="67" cy="88" r="5" fill="#fffbe5"/>
      <path d="M13 55 Q43 12 87 39" fill="none" stroke="#fff0bd" stroke-width="4" opacity=".9"/>
      <path d="M5 67 Q-2 60 -5 52 M88 48 Q98 43 103 35" fill="none" stroke="#24152d" stroke-width="6"/>
    </svg>`,
    { size: 256 },
  );

  const featherTexture = svg(
    `<svg viewBox="0 0 64 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 158 C17 132 9 101 16 62 C20 35 30 12 36 2 C45 29 55 57 51 91 C48 121 39 143 32 158Z"
        fill="#f6d85e" stroke="#24152d" stroke-width="4"/>
      <path d="M32 151 L35 13 M29 133 L17 72 M36 129 L49 73 M26 106 L17 95 M39 104 L49 91"
        fill="none" stroke="#b92d39" stroke-width="4"/>
      <path d="M33 143 L40 56" fill="none" stroke="#fff0bd" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const wingMedallion = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#d93c77" stroke="#24152d" stroke-width="7"/>
      <circle cx="50" cy="50" r="31" fill="#18a9a4" stroke="#f7d65b" stroke-width="5"/>
      <path d="M50 17 L58 42 L84 42 L63 57 L71 82 L50 66 L29 82 L37 57 L16 42 L42 42Z"
        fill="#f7d65b" stroke="#24152d" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  // Skeleton first: one central root and clearly named chains.
  const hips = b.joint("hips", {
    at: [0, 0.72, -0.35],
    dir: [0, 0.1, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.42],
      [0, 0.79, -0.05],
      [0, 0.84, 0.32],
      [0, 0.91, 0.55],
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
      [0, 0.88, 0.48],
      [0, 1.01, 0.68],
      [0, 1.11, 0.83],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.12, 0.83],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.075, 1.03],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.72, -0.48],
      [0, 0.66, -0.78],
      [0, 0.72, -1.08],
      [0, 0.87, -1.34],
      [0, 1.03, -1.53],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  const legTargets = [
    { s: 1, z: -0.38, name: "legHL", side: "L" },
    { s: -1, z: -0.38, name: "legHR", side: "R" },
    { s: 1, z: 0.35, name: "legFL", side: "L" },
    { s: -1, z: 0.35, name: "legFR", side: "R" },
  ];

  const legs: { chain: ReturnType<typeof b.chain>; s: number; z: number }[] = [];
  for (const item of legTargets) {
    const root: [number, number, number] =
      item.z < 0
        ? [item.s * 0.2, 0.72, item.z]
        : [item.s * 0.2, 0.88, item.z];
    const target: [number, number, number] = [item.s * 0.24, 0.115, item.z + 0.035];
    const pts = limb(
      root,
      target,
      item.z < 0 ? [0.27, 0.27, 0.22] : [0.28, 0.27, 0.2],
      [
        [0, 0, item.z < 0 ? 1 : -1],
        [0, 0, item.z < 0 ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(item.name, pts, {
      parent: hips,
      names: [`hip${item.side}`, `knee${item.side}`, `ankle${item.side}`, `paw${item.side}`],
      role: "leg",
      contact: target,
    });
    legs.push({ chain, s: item.s, z: item.z });
  }

  const wingChains: { chain: ReturnType<typeof b.chain>; s: number }[] = [];
  for (const s of [1, -1]) {
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.18, 0.97, 0.28],
        [s * 0.43, 1.15, 0.2],
        [s * 0.73, 1.34, 0.05],
        [s * 1.04, 1.38, -0.18],
        [s * 1.28, 1.2, -0.42],
      ]),
      {
        parent: hips,
        names: [`shoulder${s > 0 ? "L" : "R"}`, `wingArm${s > 0 ? "L" : "R"}`, `wingMid${s > 0 ? "L" : "R"}`, `wingTip${s > 0 ? "L" : "R"}`],
        role: "wing",
      },
    );
    wingChains.push({ chain: wing, s });
  }

  // Main carved-wood body, neck, tail, and limbs.
  b.sweep(spine, (t) => 0.27 - t * 0.035, {
    color: jaguarCoat,
    sides: 8,
    caps: "round",
    group: "body",
  });

  b.sweep(neck, [0.19, 0.14], {
    color: jaguarCoat,
    sides: 8,
    group: "body",
  });

  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.025, {
    color: tailPaint,
    sides: 7,
    caps: { start: "round", end: "point" },
    group: "tail",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, (t) => (t < 0.72 ? 0.105 : 0.08), {
      color: legPaint,
      sides: 7,
      group: "legs",
    });
  }

  for (const { chain, s } of wingChains) {
    const wingTube = b.sweep(chain, [0.105, 0.055], {
      color: wingPaint,
      sides: 6,
      caps: { start: "round", end: "point" },
      group: "wings",
    });

    const upper = catmull([
      chain.at(0.08).at,
      chain.at(0.3).at,
      chain.at(0.55).at,
      chain.at(0.83).at,
    ]);
    const lower = catmull([
      [s * 0.24, 0.91, 0.18],
      [s * 0.52, 0.96, 0.03],
      [s * 0.84, 1.05, -0.18],
      [s * 1.14, 1.02, -0.42],
    ]);
    b.membrane(upper, lower, {
      color: wingPaint,
      thickness: 0.018,
      rows: 4,
      cols: 8,
      scallop: 0.16,
      group: "wing-membrane",
    });

    const cardFrames = [0.24, 0.42, 0.6, 0.77, 0.91].map((t) => wingTube.at(t, 0));
    b.cards(cardFrames, featherTexture, {
      size: [0.14, 0.42],
      lean: 48,
      bend: 18,
      vary: 0.16,
      sink: 0.08,
      mirror: s < 0,
      color: IVORY,
      rng: rng(s > 0 ? 91 : 92),
      group: "wing-feathers",
    });

    // Painted eye medallion on each wing.
    const medallionAt: [number, number, number] = [s * 0.63, 1.27, 0.095];
    b.part(new THREE.CircleGeometry(0.105, 12), "#ffffff", {
      bone: chain.joints[1],
      at: medallionAt,
      dir: [0, 0, 1],
      axis: "z",
      texture: wingMedallion,
      group: "wing-ornament",
    });
  }

  // Head silhouette: broad feline skull, muzzle, open lower jaw, and eagle beak.
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), jaguarCoat, {
    bone: head,
    at: [0, 1.18, 1.0],
    scale: [0.255, 0.23, 0.27],
    flat: true,
    group: "head",
    name: "carved-skull",
  });

  b.part(new THREE.SphereGeometry(1, 10, 7), BELLY, {
    bone: head,
    at: [0, 1.12, 1.19],
    scale: [0.16, 0.13, 0.16],
    flat: true,
    group: "face",
    name: "cream-muzzle",
  });

  b.part(new THREE.ConeGeometry(0.105, 0.27, 6), BEAK, {
    bone: head,
    at: [0, 1.17, 1.31],
    dir: [0, 0.03, 1],
    axis: "y",
    flat: true,
    group: "beak",
    name: "upper-beak",
  });

  b.sweep(
    catmull([
      [0, 1.08, 1.08],
      [0, 1.025, 1.16],
      [0, 1.0, 1.28],
    ]),
    [0.075, 0.025],
    {
      bone: jaw,
      color: WOOD_DARK,
      sides: 6,
      caps: { start: "flat", end: "point" },
      group: "jaw",
      name: "lower-jaw",
    },
  );

  b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
    bone: head,
    at: [0, 1.18, 1.3],
    scale: [0.047, 0.038, 0.035],
    group: "face",
    name: "beak-nostril",
  });

  // Large alebrije eyes seated on the curved skull.
  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = headSurface.around([0, 1.18, 1.0]).at(s * 34, 7);
    if (eyeHit) {
      b.decal(headSurface, eyeTexture, {
        at: eyeHit,
        size: [0.105, 0.14],
        lift: 0.003,
        mirror: s > 0,
        group: "eyes",
        name: `eye${s > 0 ? "L" : "R"}`,
      });
    }

    // Tall jaguar ears with colored inner triangles.
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.13, 0.015, "sharp"],
        [0.095, 0.17, "sharp"],
        [0.035, 0.23, "sharp"],
      ],
      {
        at: [s * 0.145, 1.29, 0.97],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.006,
        color: jaguarCoat,
        bone: head,
        group: "ears",
        name: `ear${s > 0 ? "L" : "R"}`,
      },
    );
    b.extrude(
      [
        [0.025, 0.035, "sharp"],
        [0.095, 0.04, "sharp"],
        [0.058, 0.145, "sharp"],
      ],
      {
        at: [s * 0.147, 1.305, 0.992],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.041,
        color: MAGENTA,
        bone: head,
        group: "ear-inner",
      },
    );
  }

  // Brow ridges and forehead crest, emphasizing the hand-painted carved look.
  for (const s of [1, -1]) {
    b.rod(
      [s * 0.085, 1.28, 1.12],
      [s * 0.17, 1.3, 1.08],
      0.018,
      INK,
      { bone: head, group: "brows" },
    );
  }

  const crestColors = [MAGENTA, CORAL, TURQUOISE, PURPLE];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.045;
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.045, 0.02, "sharp"],
        [0.03, 0.17 + (i % 2) * 0.045, "sharp"],
        [0, 0.25 + (i % 2) * 0.05, "sharp"],
        [-0.025, 0.12, "sharp"],
      ],
      {
        at: [x, 1.31, 0.93],
        x: [1, 0, 0],
        y: [0, 0.96, -0.18],
        thickness: 0.028,
        bevel: 0.004,
        color: crestColors[i % crestColors.length],
        bone: head,
        group: "feather-crest",
        name: `crest${i}`,
      },
    );
  }

  // Chunky paws and three unmistakable carved talons per foot.
  for (const leg of legs) {
    const p = leg.chain.tip.at;
    b.part(new THREE.SphereGeometry(1, 8, 5), WOOD, {
      bone: leg.chain.tip,
      at: [p.x, 0.105, p.z],
      scale: [0.13, 0.09, 0.16],
      flat: true,
      group: "paws",
      name: `paw${leg.s > 0 ? "L" : "R"}${leg.z > 0 ? "front" : "back"}`,
    });

    for (let j = -1; j <= 1; j++) {
      const toeBase: [number, number, number] = [
        p.x + j * 0.055,
        0.105,
        p.z + 0.075,
      ];
      b.spike(toeBase, [j * 0.12, -0.08, 1], 0.13, 0.018, {
        color: TALON,
        bone: leg.chain.tip,
        group: "talons",
        name: `talon${leg.s > 0 ? "L" : "R"}${j + 1}`,
      });
    }
  }

  // Hand-painted dots and small carved studs on the torso.
  const bodySurface = b.surface(spine);
  const dotHits = bodySurface.scatter(22, {
    rng: rng(120),
    minDist: 0.095,
    filter: (h) => h.n.y > -0.35,
  });
  for (let i = 0; i < dotHits.length; i++) {
    b.stick(
      new THREE.CylinderGeometry(0.018 + (i % 3) * 0.004, 0.018 + (i % 3) * 0.004, 0.009, 8),
      i % 3 === 0 ? MAGENTA : i % 3 === 1 ? TURQUOISE : IVORY,
      dotHits[i],
      {
        embed: 0.35,
        spin: i * 27,
        group: "painted-studs",
        name: `body-stud-${i}`,
      },
    );
  }

  // Tail tip ornament: a small fan of painted feathers.
  const tailTip = tail.at(0.94);
  for (const s of [-1, 0, 1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.07, 0.02, "sharp"],
        [0.065, 0.2, "sharp"],
        [0.02, 0.29, "sharp"],
        [-0.025, 0.14, "sharp"],
      ],
      {
        at: [
          tailTip.at.x + s * 0.035,
          tailTip.at.y,
          tailTip.at.z,
        ],
        x: [1, 0, 0],
        y: [s * 0.16, 0.94, 0.12],
        thickness: 0.022,
        bevel: 0.004,
        color: s === 0 ? IVORY : s < 0 ? MAGENTA : TURQUOISE,
        bone: tailTip.bone,
        group: "tail-fan",
      },
    );
  }

  // A few raised wooden bands make the silhouette feel carved rather than digitally smooth.
  b.sweep(
    catmull([
      [0, 0.59, -0.74],
      [0, 0.61, -0.84],
      [0, 0.66, -0.93],
    ]),
    0.022,
    {
      color: IVORY,
      sides: 6,
      caps: "round",
      group: "tail-bands",
      name: "tail-band",
    },
  );

  // A tiny painted heart on the chest, a signature alebrije flourish.
  const chestMark = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 84 L14 49 Q3 18 28 13 Q44 11 50 29 Q56 11 72 13 Q97 18 86 49Z"
        fill="#d93c77" stroke="#24152d" stroke-width="7"/>
      <path d="M27 29 Q35 22 42 30" fill="none" stroke="#fff0bd" stroke-width="5"/>
    </svg>`,
    { size: 128 },
  );
  b.decal(spine, chestMark, {
    at: [0, 0.91, 0.58],
    dir: [0, 0.05, 1],
    up: [0, 1, 0],
    size: [0.12, 0.12],
    lift: 0.006,
    group: "chest-mark",
  });

  return b.root;
}
```