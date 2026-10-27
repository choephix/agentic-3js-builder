```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "agentic-3js-builder";

export const meta = {
  name: "ukiyo-e dream-eating baku",
  description:
    "A chunky low-poly baku tapir spirit in an ukiyo-e woodblock palette, with a long trunk, striped body, paper-like ears, tusks, cloud wisps, and a curling dream aura.",
};

export default function build() {
  const b = createBuilder({ name: "ukiyo-e-baku", detail: 1 });

  const INK = "#211b2b";
  const INDIGO = "#263b63";
  const DEEP_INDIGO = "#172846";
  const TEAL = "#3d7775";
  const VERMILION = "#b94a38";
  const PALE = "#e6d4a6";
  const CREAM = "#f2e4bd";
  const OCHRE = "#bd873e";
  const ROSE = "#c87568";
  const WHITE = "#fff4d1";
  const DREAM = "#8d9bc3";
  const SHADOW = "#493a4a";

  const H = 1.0;
  const rngLocal = rng(27);

  // ---------------------------------------------------------------------------
  // Skeleton: broad spine, short neck, four sturdy legs, articulated jaw,
  // flexible trunk, and a small spirit tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.86, -0.48],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [-0.02, 0.87, -0.72],
    [0, 0.94, -0.35],
    [0, 0.98, 0.05],
    [0, 1.04, 0.42],
    [0, 1.08, 0.66],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineRear", "spineMid", "spineChest", "spineFront", "spineTip"],
    role: "spine",
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.05, 0.54],
      [0, 1.16, 0.73],
      [0, 1.28, 0.9],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.3, 0.93],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.2, 1.08],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 1.25, 1.12],
      [0, 1.18, 1.34],
      [0, 1.06, 1.51],
      [0, 0.88, 1.59],
      [0, 0.75, 1.52],
    ]),
    {
      parent: head,
      names: ["trunkBase", "trunkMid", "trunkTip", "trunkEnd"],
      role: "tentacle",
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.72],
      [0, 1.03, -0.94],
      [0, 1.11, -1.08],
      [0, 1.2, -1.16],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tailMid", "tailTip"],
      role: "tail",
    },
  );

  const feet = {
    rearL: [0.28, 0.13, -0.55] as [number, number, number],
    rearR: [-0.28, 0.13, -0.55] as [number, number, number],
    frontL: [0.27, 0.13, 0.42] as [number, number, number],
    frontR: [-0.27, 0.13, 0.42] as [number, number, number],
  };

  const legData = [
    {
      side: "L",
      label: "rearL",
      root: [0.25, 0.91, -0.43] as [number, number, number],
      foot: feet.rearL,
      bends: [[0, 0, -1], [0, 0, 1]] as [number, number, number][],
    },
    {
      side: "R",
      label: "rearR",
      root: [-0.25, 0.91, -0.43] as [number, number, number],
      foot: feet.rearR,
      bends: [[0, 0, -1], [0, 0, 1]] as [number, number, number][],
    },
    {
      side: "L",
      label: "frontL",
      root: [0.24, 1.0, 0.39] as [number, number, number],
      foot: feet.frontL,
      bends: [[0, 0, 1], [0, 0, -1]] as [number, number, number][],
    },
    {
      side: "R",
      label: "frontR",
      root: [-0.24, 1.0, 0.39] as [number, number, number],
      foot: feet.frontR,
      bends: [[0, 0, 1], [0, 0, -1]] as [number, number, number][],
    },
  ];

  const legs: { label: string; chain: any }[] = [];

  for (const data of legData) {
    const points = limb(
      data.root,
      data.foot,
      [0.27, 0.27, 0.25],
      data.bends,
      { sole: [0, 0, 1] },
    );

    const chain = b.chain(`leg${data.label}`, points, {
      parent: hips,
      names: [`hip${data.label}`, `knee${data.label}`, `ankle${data.label}`],
      role: "leg",
      contact: data.foot,
    });

    legs.push({ label: data.label, chain });
  }

  // ---------------------------------------------------------------------------
  // Main silhouette: faceted body, neck, legs, trunk, tail.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.34 - t * 0.045, {
    color: PALE,
    sides: 8,
    section: "circle",
    caps: "round",
    bands: [
      [0.16, OCHRE],
      [0.31, PALE],
      [0.48, OCHRE],
      [0.64, PALE],
      [0.81, OCHRE],
      [1, PALE],
    ],
    sectors: [
      [-55, 55, INDIGO],
      [125, 235, CREAM],
    ],
  });

  const neckTube = b.sweep(neck, [0.27, 0.2], {
    color: TEAL,
    sides: 8,
    section: "circle",
    caps: "round",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, [0.115, 0.09, 0.075], {
      color: PALE,
      sides: 6,
      section: "circle",
      caps: "round",
      bands: [
        [0.36, OCHRE],
        [0.7, PALE],
        [1, SHADOW],
      ],
    });
  }

  b.sweep(trunk, (t) => 0.13 - t * 0.085, {
    color: TEAL,
    sides: 8,
    section: "circle",
    caps: "round",
    bands: [
      [0.5, PALE],
      [0.79, ROSE],
      [1, TEAL],
    ],
  });

  b.sweep(tail, [0.105, 0.025], {
    color: INDIGO,
    sides: 7,
    section: "circle",
    caps: "point",
  });

  // ---------------------------------------------------------------------------
  // Head first: broad tapir skull, muzzle, eyes, brows, and expressive mouth.
  // ---------------------------------------------------------------------------

  const skull = b.part(
    new THREE.SphereGeometry(0.31, 10, 7),
    TEAL,
    {
      bone: head,
      at: [0, 1.31, 0.98],
      scale: [1.0, 0.92, 1.16],
      flat: true,
      group: "head",
      name: "bakuSkull",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.21, 8, 6),
    CREAM,
    {
      bone: head,
      at: [0, 1.22, 1.19],
      scale: [1.0, 0.78, 1.12],
      flat: true,
      group: "head",
      name: "creamMuzzle",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.105, 8, 5),
    INK,
    {
      bone: head,
      at: [0, 1.18, 1.36],
      scale: [1.25, 0.72, 0.7],
      flat: true,
      group: "face",
      name: "dreamNose",
    },
  );

  // Large ink-rimmed eyes with amber centers and white woodblock glints.
  for (const s of [1, -1]) {
    const eyeX = s * 0.145;

    b.part(
      new THREE.SphereGeometry(0.085, 8, 6),
      INK,
      {
        bone: head,
        at: [eyeX, 1.39, 1.18],
        scale: [1.0, 1.12, 0.5],
        flat: true,
        group: "face",
        name: `eyeSocket${s > 0 ? "L" : "R"}`,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.057, 7, 5),
      OCHRE,
      {
        bone: head,
        at: [eyeX, 1.39, 1.215],
        scale: [1.0, 1.15, 0.45],
        flat: true,
        group: "face",
        name: `goldenEye${s > 0 ? "L" : "R"}`,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.027, 6, 4),
      INK,
      {
        bone: head,
        at: [eyeX, 1.39, 1.25],
        scale: [0.65, 1.35, 0.35],
        flat: true,
        group: "face",
        name: `pupil${s > 0 ? "L" : "R"}`,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.014, 5, 4),
      WHITE,
      {
        bone: head,
        at: [eyeX - s * 0.02, 1.42, 1.27],
        flat: true,
        group: "face",
        name: `eyeGlint${s > 0 ? "L" : "R"}`,
      },
    );

    b.sweep(
      [
        [eyeX - s * 0.08, 1.48, 1.21],
        [eyeX, 1.51, 1.235],
        [eyeX + s * 0.075, 1.48, 1.21],
      ],
      0.018,
      {
        color: INK,
        caps: "flat",
        sides: 5,
        bone: head,
        group: "face",
        name: `brow${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Open lower jaw, separately rigged for animation.
  b.frustumBox(
    [0, 1.19, 1.18],
    [0, 1.15, 1.35],
    [0.16, 0.08],
    [0.14, 0.065],
    {
      bone: jaw,
      color: CREAM,
      group: "jaw",
      name: "lowerJaw",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.18, 0.018, 0.11),
    INK,
    {
      bone: jaw,
      at: [0, 1.205, 1.31],
      group: "jaw",
      name: "mouthLine",
    },
  );

  // Tusks, not too realistic: two pale carved wedges beside the mouth.
  for (const s of [1, -1]) {
    b.spike(
      [s * 0.13, 1.18, 1.29],
      [0, -0.35, 0.94],
      0.105,
      0.027,
      {
        color: WHITE,
        bone: jaw,
        caps: "point",
        sides: 6,
        group: "jaw",
        name: `tusk${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Ears and crown: broad paper-cut silhouettes in side planes.
  // ---------------------------------------------------------------------------

  const earOutline: [number, number, "sharp"][] = [
    [-0.13, 0],
    [-0.16, 0.16, "sharp"],
    [-0.09, 0.38, "sharp"],
    [0.02, 0.48, "sharp"],
    [0.12, 0.29, "sharp"],
    [0.11, 0],
  ];

  for (const s of [1, -1]) {
    const ear = b.extrude(earOutline, {
      at: [s * 0.245, 1.47, 0.91],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.045, 0.025],
      bevel: 0.008,
      color: INK,
      bone: head,
      group: "head",
      name: `earOutline${s > 0 ? "L" : "R"}`,
    });

    b.extrude(
      [
        [-0.085, 0.025],
        [-0.1, 0.16, "sharp"],
        [-0.045, 0.32, "sharp"],
        [0.055, 0.25, "sharp"],
        [0.06, 0.025],
      ],
      {
        at: [s * 0.251, 1.475, 0.905],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        color: ROSE,
        bone: head,
        group: "head",
        name: `earInner${s > 0 ? "L" : "R"}`,
      },
    );

    // A small ochre bead makes the ears read as painted ornament.
    b.part(
      new THREE.SphereGeometry(0.026, 6, 4),
      OCHRE,
      {
        bone: head,
        at: [s * 0.255, 1.57, 0.91],
        group: "head",
        name: `earBead${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Crown tufts: a modest mane rather than a smooth modern-animal silhouette.
  const crownSpines = [
    [[-0.17, 1.54, 0.77], [-0.23, 1.72, 0.69]],
    [[-0.08, 1.59, 0.8], [-0.1, 1.8, 0.78]],
    [[0, 1.61, 0.81], [0, 1.86, 0.82]],
    [[0.08, 1.59, 0.8], [0.1, 1.8, 0.78]],
    [[0.17, 1.54, 0.77], [0.23, 1.72, 0.69]],
  ];

  for (let i = 0; i < crownSpines.length; i++) {
    b.spike(crownSpines[i][0], crownSpines[i][1], null, 0.045, {
      color: i % 2 ? VERMILION : INDIGO,
      bone: head,
      sides: 6,
      group: "mane",
      name: `crownTuft${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Painted body accents: a saddle-like back patch, belly bib, leg bands,
  // hoof blocks, and carved-looking tail ornaments.
  // ---------------------------------------------------------------------------

  b.sweep(
    catmull([
      [-0.3, 1.18, -0.46],
      [0, 1.31, -0.1],
      [0.3, 1.22, 0.3],
    ]),
    [0.035, 0.022],
    {
      color: VERMILION,
      bone: spine.joints[1],
      caps: "flat",
      sides: 6,
      group: "paint",
      name: "backSash",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.42, 0.32, 0.018),
    CREAM,
    {
      bone: spine.joints[2],
      at: [0, 0.76, 0.18],
      group: "paint",
      name: "bellyBib",
    },
  );

  for (const leg of legs) {
    const side = leg.label.endsWith("L") ? 1 : -1;
    const z = leg.label.startsWith("front") ? 0.38 : -0.5;

    b.part(
      new THREE.CylinderGeometry(0.108, 0.108, 0.035, 7),
      VERMILION,
      {
        bone: leg.chain.joints[1],
        at: [side * 0.275, 0.52, z],
        dir: [0, 1, 0],
        group: "paint",
        name: `legBand${leg.label}`,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.19, 0.09, 0.23),
      INK,
      {
        bone: leg.chain.tip,
        at: [side * 0.275, 0.09, z + 0.045],
        group: "feet",
        name: `hoof${leg.label}`,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.13, 0.018, 0.012),
      OCHRE,
      {
        bone: leg.chain.tip,
        at: [side * 0.275, 0.14, z + 0.16],
        group: "feet",
        name: `hoofHighlight${leg.label}`,
      },
    );
  }

  // Tail rings, like repeating woodblock marks.
  for (let i = 0; i < 4; i++) {
    const t = 0.16 + i * 0.22;
    const p = tail.at(t);
    b.ring(p, { count: 6, radius: 0.012 }, (item: any) => {
      b.part(
        new THREE.SphereGeometry(0.026, 5, 4),
        i % 2 ? OCHRE : VERMILION,
        {
          frame: item,
          bone: item.bone,
          group: "tail",
          name: `tailBead${i}`,
        },
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Dream-eating spirit aura: three asymmetrical curls behind and above the baku.
  // These are the signature fantastical feature and remain simpler than the hero.
  // ---------------------------------------------------------------------------

  const dreamPaths = [
    catmull([
      [-0.28, 1.18, -0.72],
      [-0.62, 1.34, -0.95],
      [-0.62, 1.65, -0.72],
      [-0.34, 1.72, -0.56],
      [-0.18, 1.53, -0.67],
    ]),
    catmull([
      [0.2, 1.2, -0.65],
      [0.55, 1.42, -0.95],
      [0.48, 1.7, -1.1],
      [0.2, 1.78, -0.95],
      [0.12, 1.62, -0.78],
    ]),
    catmull([
      [-0.06, 1.55, 0.38],
      [-0.34, 1.77, 0.32],
      [-0.3, 1.98, 0.55],
      [0, 2.08, 0.65],
      [0.23, 1.96, 0.58],
    ]),
  ];

  dreamPaths.forEach((path, i) => {
    b.sweep(path, [0.035, 0.012], {
      color: i === 1 ? DREAM : WHITE,
      caps: "round",
      sides: 7,
      group: "dreamAura",
      name: `dreamCurl${i}`,
    });

    const end = path.at(1);
    b.part(
      new THREE.SphereGeometry(0.07, 7, 5),
      i === 1 ? VERMILION : OCHRE,
      {
        at: end,
        group: "dreamAura",
        name: `dreamSpark${i}`,
      },
    );
  });

  // Little floating dream motes, deliberately arranged as a woodblock-print motif.
  const motes = [
    [0.67, 1.88, -0.65],
    [-0.72, 1.83, -0.42],
    [0.52, 2.12, 0.48],
    [-0.48, 2.15, 0.62],
    [0.76, 1.58, -0.98],
    [-0.78, 1.5, -0.85],
  ];

  motes.forEach((p, i) => {
    b.part(
      new THREE.OctahedronGeometry(0.045 + (i % 2) * 0.015, 0),
      i % 3 === 0 ? VERMILION : i % 3 === 1 ? OCHRE : DREAM,
      {
        at: p,
        rotation: [0, i * 21, i * 13],
        group: "dreamAura",
        name: `dreamMote${i}`,
      },
    );
  });

  // A few flat ink strokes on the body imply carved fur and make the silhouette
  // read like a print rather than a generic smooth toy.
  const bodyMarks = [
    [[0.29, 1.2, -0.32], [0.32, 1.28, -0.18]],
    [[-0.29, 1.2, -0.32], [-0.32, 1.28, -0.18]],
    [[0.3, 1.2, 0.02], [0.31, 1.3, 0.16]],
    [[-0.3, 1.2, 0.02], [-0.31, 1.3, 0.16]],
  ];

  bodyMarks.forEach((mark, i) => {
    b.rod(mark[0], mark[1], 0.012, {
      color: INK,
      bone: spine.joints[2],
      caps: "flat",
      group: "carvedMarks",
      name: `bodyStroke${i}`,
    });
  });

  // Tiny spirit seal on the rump: a red square with an ink inset.
  b.part(
    new THREE.BoxGeometry(0.13, 0.13, 0.025),
    VERMILION,
    {
      bone: spine.joints[0],
      at: [0.22, 1.04, -0.72],
      rotation: [0, 18, 0],
      group: "seal",
      name: "spiritSeal",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.065, 0.065, 0.032),
    INK,
    {
      bone: spine.joints[0],
      at: [0.22, 1.04, -0.704],
      rotation: [0, 18, 0],
      group: "seal",
      name: "sealMark",
    },
  );

  return b.root;
}
```