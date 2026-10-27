```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description:
    "A brightly painted Oaxacan alebrije combining a spotted jaguar body, eagle head, crest, talons, sweeping wings, and a curled patterned tail.",
};

const WOOD = "#8d351f";
const WOOD_DARK = "#542017";
const WOOD_LIGHT = "#c9652f";
const GOLD = "#f3bd32";
const SUN = "#ffe477";
const TURQUOISE = "#18a7a0";
const TURQUOISE_DARK = "#075c69";
const MAGENTA = "#d93473";
const PURPLE = "#6b2c88";
const CREAM = "#f4d58a";
const IVORY = "#fff0bd";
const BLACK = "#211522";
const RED = "#bd2931";
const GREEN = "#4e9b48";
const BLUE = "#2766a7";

function box(
  b: any,
  color: string,
  at: [number, number, number],
  size: [number, number, number],
  bone?: any,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    rotation,
    flat: true,
  });
}

function sphere(
  b: any,
  color: string,
  at: [number, number, number],
  scale: [number, number, number],
  bone?: any,
) {
  return b.part(new THREE.SphereGeometry(1, 8, 6), color, {
    at,
    bone,
    scale,
    flat: true,
  });
}

function cylinder(
  b: any,
  color: string,
  at: [number, number, number],
  radius: number,
  height: number,
  dir: [number, number, number],
  bone?: any,
  sides = 8,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
    at,
    bone,
    dir,
    flat: true,
  });
}

function bead(
  b: any,
  color: string,
  at: [number, number, number],
  r: number,
  bone?: any,
) {
  return sphere(b, color, at, [r, r, r], bone);
}

function feather(
  b: any,
  color: string,
  at: [number, number, number],
  x: [number, number, number],
  bone?: any,
  length = 0.28,
  width = 0.1,
) {
  return b.extrude(
    [
      [0, 0],
      [width * 0.55, length * 0.42],
      [0, length],
      [-width * 0.55, length * 0.42],
    ],
    {
      at,
      x,
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.008,
      color,
      bone,
    },
  );
}

function tuft(
  b: any,
  color: string,
  at: [number, number, number],
  dir: [number, number, number],
  length: number,
  radius: number,
  bone?: any,
) {
  return b.spike(at, dir, length, radius, {
    color,
    bone,
    caps: { start: "round", end: "point" },
  });
}

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  // ------------------------------------------------------------------------------------------------
  // Skeleton: broad jaguar spine, four legs, neck, tail, wings, jaw and crest.
  // ------------------------------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.76, -0.42],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.76, -0.55],
      [0, 0.8, -0.22],
      [0, 0.82, 0.12],
      [0, 0.86, 0.42],
      [0, 0.9, 0.62],
    ]),
    {
      parent: hips,
      names: ["spineA", "spineB", "spineC", "shoulder"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.88, 0.52],
      [0, 1.02, 0.68],
      [0, 1.15, 0.78],
      [0, 1.25, 0.86],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckMid", "neckTop", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.3, 0.9],
    dir: [0, 0.05, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.22, 1.01],
    dir: [0, -0.05, 1],
    role: "jaw",
    group: "face",
  });

  const legTargets = [
    { s: 1, z: -0.37, name: "hindL", x: 0.24 },
    { s: -1, z: -0.37, name: "hindR", x: -0.24 },
    { s: 1, z: 0.38, name: "frontL", x: 0.23 },
    { s: -1, z: 0.38, name: "frontR", x: -0.23 },
  ];

  const legs: any[] = [];
  for (const l of legTargets) {
    const path = catmull([
      [l.x, 0.72, l.z],
      [l.x * 1.05, 0.43, l.z + (l.z < 0 ? -0.07 : 0.05)],
      [l.x * 0.98, 0.18, l.z + (l.z < 0 ? 0.025 : 0.05)],
      [l.x * 1.02, 0.085, l.z + (l.z < 0 ? -0.02 : 0.035)],
    ]);
    const chain = b.chain(l.name, path, {
      parent: hips,
      names: [`hip${l.name}`, `knee${l.name}`, `ankle${l.name}`, `paw${l.name}`],
      role: "leg",
      contact: [l.x * 1.02, 0, l.z + (l.z < 0 ? -0.02 : 0.035)],
    });
    legs.push({ ...l, chain });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.73, -0.58],
      [0, 0.66, -0.88],
      [0.04, 0.61, -1.16],
      [0.12, 0.68, -1.39],
      [0.22, 0.82, -1.57],
      [0.33, 0.94, -1.63],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      role: "tail",
    },
  );

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.24, 0.98, 0.35],
      [0.52, 1.11, 0.28],
      [0.84, 1.32, 0.2],
      [1.12, 1.25, 0.08],
    ]),
    {
      parent: spine.tip,
      names: ["wingShoulderL", "wingElbowL", "wingWristL", "wingTipL"],
      role: "wing",
    },
  );

  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.24, 0.98, 0.35],
      [-0.52, 1.11, 0.28],
      [-0.84, 1.32, 0.2],
      [-1.12, 1.25, 0.08],
    ]),
    {
      parent: spine.tip,
      names: ["wingShoulderR", "wingElbowR", "wingWristR", "wingTipR"],
      role: "wing",
    },
  );

  const crest = b.chain(
    "crest",
    catmull([
      [0, 1.47, 0.83],
      [0, 1.64, 0.78],
      [0, 1.81, 0.7],
    ]),
    {
      parent: head,
      names: ["crestBase", "crestMid", "crestTip"],
      role: "fan",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Main carved wood volumes.
  // ------------------------------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.27 + 0.11 * Math.sin(Math.PI * t), {
    color: WOOD,
    section: { ngon: 8 },
    caps: "round",
    name: "painted-jaguar-body",
    group: "body",
  });

  b.sweep(neck, [0.22, 0.17], {
    color: WOOD_LIGHT,
    section: { ngon: 8 },
    group: "body",
  });

  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.035, {
    color: WOOD_DARK,
    section: { ngon: 8 },
    group: "tail",
  });

  for (const l of legs) {
    b.sweep(l.chain, (t) => 0.115 * (1 - t) + 0.07, {
      color: WOOD,
      section: { ngon: 7 },
      caps: "round",
      group: "legs",
    });
  }

  // Belly and shoulder panels, like broad hand-painted carved zones.
  box(b, WOOD_DARK, [0, 0.59, -0.02], [0.39, 0.17, 0.5], spine.joints[1]);
  box(b, WOOD_LIGHT, [0, 0.94, 0.5], [0.38, 0.22, 0.25], spine.tip);

  // Head, eagle brow and muzzle.
  const skull = sphere(b, WOOD_LIGHT, [0, 1.35, 0.91], [0.29, 0.31, 0.27], head);
  sphere(b, CREAM, [0, 1.27, 1.1], [0.21, 0.16, 0.16], jaw);
  sphere(b, WOOD_DARK, [0, 1.21, 1.18], [0.12, 0.095, 0.08], jaw);

  // Eagle beak: gold upper hook and dark lower jaw.
  tuft(b, GOLD, [0, 1.3, 1.22], [0, 0.04, 1], 0.29, 0.105, jaw);
  tuft(b, RED, [0, 1.22, 1.2], [0, -0.02, 1], 0.18, 0.065, jaw);
  box(b, GOLD, [0, 1.305, 1.28], [0.18, 0.06, 0.13], jaw, [0.12, 0, 0]);

  // ------------------------------------------------------------------------------------------------
  // Face first: eyes, brows, cheek paint and nostrils.
  // ------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const x = s * 0.115;
    sphere(b, BLACK, [x, 1.39, 1.135], [0.075, 0.085, 0.035], head);
    sphere(b, GOLD, [x, 1.39, 1.158], [0.047, 0.055, 0.022], head);
    sphere(b, BLACK, [x, 1.39, 1.178], [0.021, 0.032, 0.012], head);
    bead(b, IVORY, [x - s * 0.018, 1.413, 1.194], 0.012, head);

    // Painted eye masks and brows.
    box(b, TURQUOISE_DARK, [x, 1.475, 1.08], [0.14, 0.035, 0.025], head, [0, s * 0.18, s * 0.06]);
    box(b, MAGENTA, [x, 1.315, 1.12], [0.13, 0.035, 0.018], head, [0, -s * 0.15, 0]);
    bead(b, BLACK, [s * 0.055, 1.27, 1.255], 0.018, jaw);
    bead(b, BLACK, [-s * 0.055, 1.27, 1.255], 0.018, jaw);

    // Jaguar cheek rosettes.
    for (let i = 0; i < 3; i++) {
      const yy = 1.18 + i * 0.06;
      bead(b, PURPLE, [s * (0.19 + (i % 2) * 0.025), yy, 1.02 - i * 0.015], 0.018, head);
      bead(b, GOLD, [s * (0.19 + (i % 2) * 0.025), yy + 0.025, 1.02 - i * 0.015], 0.007, head);
    }
  }

  // Beak nostril and forehead diamond.
  bead(b, BLACK, [0.055, 1.32, 1.29], 0.018, jaw);
  bead(b, BLACK, [-0.055, 1.32, 1.29], 0.018, jaw);
  b.extrude(
    [
      [0, 0.07],
      [0.06, 0],
      [0, -0.07],
      [-0.06, 0],
    ],
    {
      at: [0, 1.51, 1.105],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: MAGENTA,
      bone: head,
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Jaguar ears and eagle crest.
  // ------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.16, 0.04],
        [0.13, 0.27],
        [0.015, 0.19],
      ],
      {
        at: [s * 0.19, 1.49, 0.86],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.06,
        bevel: 0.012,
        color: WOOD_DARK,
        bone: head,
      },
    );
    b.extrude(
      [
        [0, 0.03],
        [0.1, 0.06],
        [0.075, 0.18],
        [0.02, 0.14],
      ],
      {
        at: [s * 0.195, 1.51, 0.89],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.066,
        color: MAGENTA,
        bone: head,
      },
    );
  }

  const crestColors = [RED, GOLD, TURQUOISE, MAGENTA, PURPLE];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.065;
    tuft(
      b,
      crestColors[i],
      [x, 1.5 + Math.abs(i - 2) * 0.018, 0.82],
      [x * 0.35, 0.7, -0.14],
      0.24 + (2 - Math.abs(i - 2)) * 0.035,
      0.055,
      crest.joints[Math.min(i, crest.joints.length - 1)],
    );
    bead(b, SUN, [x, 1.61 + Math.abs(i - 2) * 0.015, 0.78], 0.018, crest.tip);
  }

  // ------------------------------------------------------------------------------------------------
  // Wing bones, membranes and layered carved feathers.
  // ------------------------------------------------------------------------------------------------

  b.sweep(wingL, [0.13, 0.075], {
    color: TURQUOISE_DARK,
    section: { ngon: 6 },
    group: "wings",
  });
  b.sweep(wingR, [0.13, 0.075], {
    color: TURQUOISE_DARK,
    section: { ngon: 6 },
    group: "wings",
  });

  b.membrane(
    wingL,
    [
      [0.24, 0.98, 0.35],
      [0.55, 1.38, 0.28],
      [0.88, 1.55, 0.18],
      [1.12, 1.25, 0.08],
    ],
    {
      color: MAGENTA,
      thickness: 0.025,
      rows: 5,
      cols: 8,
      scallop: 0.12,
      group: "wings",
    },
  );
  b.membrane(
    wingR,
    [
      [-0.24, 0.98, 0.35],
      [-0.55, 1.38, 0.28],
      [-0.88, 1.55, 0.18],
      [-1.12, 1.25, 0.08],
    ],
    {
      color: MAGENTA,
      thickness: 0.025,
      rows: 5,
      cols: 8,
      scallop: 0.12,
      group: "wings",
    },
  );

  for (const s of [1, -1]) {
    const wing = s > 0 ? wingL : wingR;
    const colors = [GOLD, RED, TURQUOISE, SUN, PURPLE, BLUE];
    for (let i = 0; i < 6; i++) {
      const base: [number, number, number] = [
        s * (0.42 + i * 0.12),
        1.08 + i * 0.07,
        0.31 - i * 0.065,
      ];
      feather(
        b,
        colors[i],
        base,
        [s * 0.45, 0.18 + i * 0.015, -0.88],
        wing.joints[Math.min(i % 3, wing.joints.length - 1)],
        0.36 + i * 0.035,
        0.14,
      );
      bead(b, SUN, [base[0], base[1] + 0.08, base[2] + 0.02], 0.018, wing.joints[1]);
    }

    // Long primary flight feathers.
    for (let i = 0; i < 7; i++) {
      const base: [number, number, number] = [
        s * (0.58 + i * 0.085),
        1.28 + i * 0.045,
        0.15 - i * 0.04,
      ];
      feather(
        b,
        i % 2 ? TURQUOISE_DARK : WOOD_DARK,
        base,
        [s * 0.24, 0.12 + i * 0.01, -0.97],
        wing.joints[2],
        0.42 + i * 0.025,
        0.11,
      );
      bead(b, MAGENTA, [base[0], base[1] + 0.14, base[2]], 0.014, wing.joints[2]);
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Legs, painted cuffs, paws and chunky carved talons.
  // ------------------------------------------------------------------------------------------------

  for (const l of legs) {
    const s = l.s;
    const chain = l.chain;
    const front = l.z > 0;

    box(b, GOLD, [s * 0.245, 0.49, l.z], [0.16, 0.08, 0.13], chain.joints[0]);
    box(b, TURQUOISE, [s * 0.25, 0.30, l.z + (front ? 0.02 : -0.02)], [0.14, 0.06, 0.12], chain.joints[1]);
    box(b, MAGENTA, [s * 0.25, 0.16, l.z], [0.13, 0.045, 0.12], chain.joints[2]);

    const pawZ = l.z + (front ? 0.045 : -0.02);
    sphere(b, WOOD_LIGHT, [s * 0.255, 0.085, pawZ], [0.13, 0.075, 0.15], chain.tip);

    for (let i = -1; i <= 1; i++) {
      const toeX = s * (0.255 + i * 0.055);
      tuft(
        b,
        CREAM,
        [toeX, 0.06, pawZ + 0.065],
        [0, -0.03, 1],
        0.105,
        0.027,
        chain.tip,
      );
      bead(b, BLACK, [toeX, 0.045, pawZ + 0.12], 0.018, chain.tip);
    }

    // Painted spot on each ankle.
    bead(b, RED, [s * 0.25, 0.23, l.z + 0.075], 0.028, chain.joints[2]);
    bead(b, GOLD, [s * 0.25, 0.26, l.z - 0.075], 0.022, chain.joints[2]);
  }

  // ------------------------------------------------------------------------------------------------
  // Body markings: large turquoise saddle, jaguar rosettes and colorful bands.
  // ------------------------------------------------------------------------------------------------

  const bodySurface = b.surface(body);

  const spots = [
    [-0.21, 0.93, -0.34],
    [0.22, 0.94, -0.22],
    [-0.24, 1.02, 0.03],
    [0.23, 1.04, 0.12],
    [-0.2, 0.99, 0.34],
    [0.2, 1.05, 0.39],
    [-0.14, 0.67, -0.2],
    [0.16, 0.65, -0.05],
    [-0.15, 0.68, 0.2],
    [0.15, 0.71, 0.31],
  ] as [number, number, number][];

  for (let i = 0; i < spots.length; i++) {
    const p = spots[i];
    bead(b, i % 2 ? TURQUOISE : MAGENTA, p, 0.055, spine.joints[Math.min(i % 3, spine.joints.length - 1)]);
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2;
      bead(
        b,
        GOLD,
        [p[0] + Math.cos(a) * 0.067, p[1] + Math.sin(a) * 0.035, p[2] + Math.cos(a) * 0.067],
        0.012,
        spine.joints[Math.min(i % 3, spine.joints.length - 1)],
      );
    }
  }

  // A broad saddle motif made from overlapping painted plates.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      box(
        b,
        i % 2 ? MAGENTA : TURQUOISE,
        [s * (0.18 + i * 0.018), 1.055 + i * 0.025, -0.08 + i * 0.11],
        [0.045, 0.035, 0.13],
        spine.joints[1],
        [0, 0.15 * s, 0.18 * s],
      );
    }
  }

  // Hand-painted stripes around the tail.
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + i * 0.12;
    const p = tail.at(t);
    b.ring(p, { count: 1, radius: 0 }, (at: any) => {
      cylinder(
        b,
        i % 2 ? GOLD : TURQUOISE,
        [p.at.x, p.at.y, p.at.z],
        Math.max(0.035, 0.105 - t * 0.06),
        0.025,
        p.tangent,
        p.bone,
        7,
      );
      return at;
    });
  }

  // Tail tip flower/star.
  const tailTip = tail.at(1);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    tuft(
      b,
      [GOLD, MAGENTA, TURQUOISE][i % 3],
      [tailTip.at.x, tailTip.at.y, tailTip.at.z],
      [Math.cos(a) * 0.55, Math.sin(a) * 0.35, 0.3],
      0.15,
      0.025,
      tailTip.bone,
    );
  }
  bead(b, SUN, [tailTip.at.x, tailTip.at.y, tailTip.at.z + 0.03], 0.05, tailTip.bone);

  // ------------------------------------------------------------------------------------------------
  // Dorsal carved spikes and neck ornament.
  // ------------------------------------------------------------------------------------------------

  for (let i = 0; i < 8; i++) {
    const p = spine.at(0.12 + i * 0.105);
    tuft(
      b,
      i % 2 ? MAGENTA : GOLD,
      [p.at.x, p.at.y + 0.17, p.at.z],
      [0, 0.8 + (i % 3) * 0.08, -0.1],
      0.11 + (i % 3) * 0.025,
      0.035,
      p.bone,
    );
  }

  for (let i = 0; i < 6; i++) {
    const p = neck.at(0.1 + i * 0.14);
    bead(
      b,
      [GOLD, RED, TURQUOISE][i % 3],
      [p.at.x + (i % 2 ? 0.13 : -0.13), p.at.y, p.at.z + 0.01],
      0.035,
      p.bone,
    );
  }

  // Small side whiskers and ceremonial cheek feathers.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      tuft(
        b,
        i % 2 ? IVORY : GOLD,
        [s * (0.19 + i * 0.018), 1.22 - i * 0.025, 1.08],
        [s * 0.7, -0.05 - i * 0.08, 0.35],
        0.12 + i * 0.018,
        0.012,
        head,
      );
    }
  }

  // Painted wood studs along the shoulders.
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const z = 0.12 + i * 0.08;
      bead(b, i % 2 ? GOLD : RED, [s * 0.275, 0.94, z], 0.018, spine.tip);
    }
  }

  // A few surface-seated turquoise and cream chips make the body read as carved and painted.
  const hits = bodySurface.scatter(24, {
    rng: rng(42),
    minDist: 0.11,
    filter: (h: any) => h.n.y > -0.2,
  });
  for (let i = 0; i < hits.length; i++) {
    b.stick(
      new THREE.CylinderGeometry(0.025, 0.025, 0.012, 6),
      i % 3 === 0 ? CREAM : i % 3 === 1 ? RED : TURQUOISE,
      hits[i],
      { embed: 0.35, spin: i * 31 },
    );
  }

  // Decorative shoulder rosettes placed after the surface exists.
  const shoulderHits = b.surface(spine.tip).scatter(10, {
    rng: rng(93),
    minDist: 0.07,
    filter: (h: any) => Math.abs(h.at.x) > 0.12,
  });
  for (let i = 0; i < shoulderHits.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.026, 7, 5),
      i % 2 ? GOLD : MAGENTA,
      shoulderHits[i],
      { embed: 0.18 },
    );
  }

  // Keep all ornament geometry above the floor; the lowest paw pads sit at y ≈ 0.01.
  return b.root;
}
```