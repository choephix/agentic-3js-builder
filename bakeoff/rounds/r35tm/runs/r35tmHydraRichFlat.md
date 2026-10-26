```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal five-headed hydra built as a low-poly, God of War-inspired puppet monster with plated scales, branching serpentine necks, open jaws, horns, glowing eyes, claws, and a heavy armored body.",
};

const COAT = "#24352c";
const COAT_DARK = "#101914";
const COAT_LIGHT = "#405744";
const BELLY = "#68715c";
const SCALE = "#52664d";
const SCALE_DARK = "#2c3b31";
const BONE = "#c9b58a";
const BONE_DARK = "#665b48";
const TOOTH = "#eee0b0";
const GUM = "#592a28";
const BLOOD = "#8d2525";
const IRON = "#252b2a";
const IRON_EDGE = "#59645a";
const BRONZE = "#91652d";
const GOLD = "#ffbd46";
const GOLD_HOT = "#fff0a0";
const EYE_DARK = "#180d0b";
const CLAW = "#191a18";

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string,
  at: any,
  options: Record<string, any> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    ...options,
  });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  color: string,
  at: any,
  scale: [number, number, number] = [1, 1, 1],
  bone?: any,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    scale,
    bone,
    flat: true,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  color: string,
  at: any,
  dir: any = [0, 1, 0],
  bone?: any,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius * 1.06, height, 8), color, {
    at,
    dir,
    bone,
    flat: true,
  });
}

function claw(
  b: ReturnType<typeof createBuilder>,
  base: any,
  tip: any,
  radius = 0.035,
  color = CLAW,
) {
  return b.spike(base, tip, null, radius, {
    color,
    caps: "point",
    detail: 1,
  });
}

function tooth(
  b: ReturnType<typeof createBuilder>,
  base: any,
  dir: any,
  length: number,
  radius: number,
  bone?: any,
) {
  return b.spike(base, dir, length, radius, {
    color: TOOTH,
    bone,
    caps: "point",
  });
}

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one root, a plated trunk, four legs, a heavy tail, and five
  // separately riggable neck/head/jaw assemblies.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.88, -0.42],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.9, -1.12],
    [0, 0.96, -0.58],
    [0, 1.02, 0.0],
    [0, 1.06, 0.48],
    [0, 1.02, 0.72],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineRear", "spineMid", "spineShoulder", "spineFront", "spineTip"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.83, -0.98],
    [0, 0.72, -1.48],
    [0.05, 0.58, -1.92],
    [-0.07, 0.43, -2.28],
    [-0.22, 0.34, -2.56],
    [-0.34, 0.3, -2.76],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tailBase", "tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const legTargets = [
    { s: 1, z: -0.68, name: "hindL" },
    { s: -1, z: -0.68, name: "hindR" },
    { s: 1, z: 0.43, name: "frontL" },
    { s: -1, z: 0.43, name: "frontR" },
  ];

  const legs: { chain: any; side: number; front: boolean }[] = [];
  for (const leg of legTargets) {
    const s = leg.s;
    const root = [s * 0.31, 0.88, leg.z] as [number, number, number];
    const target = [s * 0.43, 0.16, leg.z + (leg.z > 0 ? 0.12 : -0.08)] as [
      number,
      number,
      number,
    ];
    const points = limb(
      root,
      target,
      leg.z > 0 ? [0.34, 0.3, 0.22] : [0.38, 0.34, 0.22],
      leg.z > 0 ? [[0, 0, 1], [0, 0, -1]] : [[0, 0, 1], [0, 0, -1]],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(leg.name, points, {
      parent: hips,
      names: [
        `${leg.name}Hip`,
        `${leg.name}Knee`,
        `${leg.name}Ankle`,
        `${leg.name}Paw`,
      ],
      role: "leg",
      contact: target,
    });
    legs.push({ chain, side: s, front: leg.z > 0 });
  }

  const neckSpecs = [
    { name: "neckCenter", root: [0, 1.18, 0.57], tip: [0, 2.12, 0.8] },
    { name: "neckLeftInner", root: [0.22, 1.12, 0.55], tip: [0.48, 2.0, 0.79] },
    { name: "neckRightInner", root: [-0.22, 1.12, 0.55], tip: [-0.48, 2.0, 0.79] },
    { name: "neckLeftOuter", root: [0.42, 1.08, 0.42], tip: [0.92, 1.86, 0.66] },
    { name: "neckRightOuter", root: [-0.42, 1.08, 0.42], tip: [-0.92, 1.86, 0.66] },
  ];

  const necks: { chain: any; head: any; jaw: any; s: number; center: boolean }[] = [];
  for (let i = 0; i < neckSpecs.length; i++) {
    const n = neckSpecs[i];
    const s = n.tip[0] >= 0 ? 1 : -1;
    const midX = n.root[0] * 0.72 + n.tip[0] * 0.28;
    const midY = n.root[1] + 0.43;
    const midZ = n.root[2] + 0.1;
    const path = catmull([
      n.root,
      [midX, midY, midZ],
      [n.tip[0] * 0.96, n.tip[1] - 0.12, n.tip[2]],
      n.tip,
    ]);
    const chain = b.chain(n.name, path, {
      parent: spine.tip,
      count: 4,
      names: [`${n.name}1`, `${n.name}2`, `${n.name}3`, `${n.name}Tip`],
      role: "neck",
    });
    const head = b.joint(`${n.name}Head`, {
      parent: chain.tip,
      at: n.tip,
      dir: [n.tip[0] * 0.08, -0.03, 1],
      role: "head",
      group: "heads",
    });
    const jaw = b.joint(`${n.name}Jaw`, {
      parent: head,
      at: head.local({ forward: 0.08, down: 0.1 }),
      dir: head.dir([0, 0.26, -0.11]),
      role: "jaw",
      group: "heads",
    });
    necks.push({ chain, head, jaw, s, center: i === 0 });
  }

  // ---------------------------------------------------------------------------
  // Main body: broad armored reptilian mass, darker belly, shoulder blocks, and
  // a ridged spinal silhouette.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spinePath, (t) => {
    if (t < 0.22) return 0.32 + t * 0.35;
    if (t < 0.72) return 0.45;
    return 0.45 - (t - 0.72) * 0.55;
  }, {
    bone: spine,
    color: COAT,
    sides: 8,
    sectors: [
      [-62, 62, COAT_LIGHT],
      [112, 248, BELLY],
    ],
    caps: "round",
    group: "body",
    name: "armoredTrunk",
  });

  // Belly plates as broad, overlapping slabs.
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + i * 0.12;
    const p = spine.at(t).at;
    const width = i < 2 ? 0.3 : 0.36;
    b.part(
      new THREE.CylinderGeometry(width, width * 0.88, 0.045, 8),
      BELLY,
      {
        at: [p.x, p.y - 0.39, p.z],
        dir: [0, 1, 0],
        scale: [1, 0.25, 1],
        bone: spine.at(t).bone,
        name: `bellyPlate${i}`,
        group: "armor",
      },
    );
  }

  // Back armor: separate shield-like plates with bronze rivets.
  for (let i = 0; i < 6; i++) {
    const t = 0.12 + i * 0.14;
    const cp = spine.at(t);
    const w = i < 2 ? 0.26 : 0.32;
    box(b, [w, 0.07, 0.22], IRON, [cp.at.x, cp.at.y + 0.39, cp.at.z], {
      bone: cp.bone,
      dir: [0, 0, 1],
      name: `backPlate${i}`,
      group: "armor",
    });
    cylinder(
      b,
      0.025,
      0.018,
      BRONZE,
      [cp.at.x - w * 0.34, cp.at.y + 0.435, cp.at.z],
      [0, 1, 0],
      cp.bone,
    );
    cylinder(
      b,
      0.025,
      0.018,
      BRONZE,
      [cp.at.x + w * 0.34, cp.at.y + 0.435, cp.at.z],
      [0, 1, 0],
      cp.bone,
    );
  }

  // Dorsal spikes, increasing toward the shoulders.
  b.along(body, 12, (at: any) => {
    const h = 0.12 + 0.13 * Math.sin(at.t * Math.PI);
    return b.spike(at, [0, 1, 0], h, 0.052, {
      color: SCALE_DARK,
      group: "dorsalSpines",
    });
  });

  // Scales seated on the actual trunk surface.
  const bodySurface = b.surface(body);
  const scaleHits = bodySurface.scatter(42, {
    rng: rng(42),
    minDist: 0.11,
    filter: (h: any) => h.n.y > -0.15 && h.at.z > -1.0,
  });
  for (let i = 0; i < scaleHits.length; i++) {
    const h = scaleHits[i];
    b.stick(
      new THREE.ConeGeometry(0.065, 0.045, 6),
      i % 4 === 0 ? COAT_LIGHT : SCALE,
      h,
      { embed: 0.55, spin: (i % 6) * 15, name: `scale${i}`, group: "scales" },
    );
  }

  // ---------------------------------------------------------------------------
  // Legs: thick joints, armored shins, four-toed clawed feet.
  // ---------------------------------------------------------------------------

  for (const leg of legs) {
    const c = leg.chain;
    b.sweep(c, [0.16, 0.12], {
      color: COAT_DARK,
      bone: c,
      sides: 7,
      group: "legs",
      name: leg.front ? "frontLegSkin" : "hindLegSkin",
    });

    const knee = c.at(0.45);
    const ankle = c.at(0.78);
    sphere(b, 0.17, SCALE_DARK, knee.at, [1, 0.85, 1], knee.bone);
    box(b, [0.18, 0.28, 0.18], IRON, ankle.at, {
      bone: ankle.bone,
      dir: ankle.tangent,
      group: "legArmor",
    });

    const paw = c.tip;
    box(b, [0.27, 0.13, 0.3], COAT_DARK, paw.at, {
      bone: paw,
      dir: [0, 0, 1],
      group: "feet",
    });

    const forward = new THREE.Vector3(0, 0, 1);
    const side = leg.side;
    for (let j = -1; j <= 1; j++) {
      const base = [
        paw.at.x + side * j * 0.07,
        0.12,
        paw.at.z + 0.13,
      ] as [number, number, number];
      const tip = [
        base[0] + side * j * 0.015,
        0.055,
        base[2] + 0.18,
      ] as [number, number, number];
      claw(b, base, tip, 0.035);
    }
    claw(
      b,
      [paw.at.x + side * 0.1, 0.13, paw.at.z - 0.02],
      [paw.at.x + side * 0.2, 0.045, paw.at.z + 0.08],
      0.038,
    );
  }

  // ---------------------------------------------------------------------------
  // Tail: tapering, segmented, with a mace-like armored tip.
  // ---------------------------------------------------------------------------

  b.sweep(tail, (t) => 0.2 * (1 - t) + 0.045, {
    bone: tail,
    color: COAT_DARK,
    sides: 7,
    bands: [
      [0.2, SCALE_DARK],
      [0.42, COAT_DARK],
      [0.64, SCALE_DARK],
      [0.82, COAT_DARK],
      [1, BONE_DARK],
    ],
    group: "tail",
    name: "serpentineTail",
  });

  for (let i = 0; i < 7; i++) {
    const t = 0.16 + i * 0.115;
    const p = tail.at(t);
    b.sweep(
      catmull([
        p.at,
        [p.at.x, p.at.y + 0.08, p.at.z],
        [p.at.x, p.at.y + 0.02, p.at.z - 0.1],
      ]),
      [0.042, 0.008],
      {
        color: IRON_EDGE,
        bone: p.bone,
        caps: "flat",
        group: "tailArmor",
        name: `tailBand${i}`,
      },
    );
  }
  const tailTip = tail.at(1);
  sphere(b, 0.13, IRON, tailTip.at, [1.1, 1.1, 1.2], tailTip.bone);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const base = [
      tailTip.at.x + Math.cos(a) * 0.09,
      tailTip.at.y + Math.sin(a) * 0.09,
      tailTip.at.z,
    ];
    const tip = [
      tailTip.at.x + Math.cos(a) * 0.2,
      tailTip.at.y + Math.sin(a) * 0.2,
      tailTip.at.z - 0.01,
    ];
    claw(b, base, tip, 0.035, BONE_DARK);
  }

  // ---------------------------------------------------------------------------
  // Five heads. Each has skull, brow ridges, cheek plates, two-piece jaw,
  // gums, teeth, horns, eyes, nostrils, and a small crown of mane scales.
  // ---------------------------------------------------------------------------

  for (let hi = 0; hi < necks.length; hi++) {
    const n = necks[hi];
    const head = n.head;
    const jaw = n.jaw;
    const s = n.s;

    b.sweep(n.chain, (t) => 0.18 - 0.065 * t, {
      bone: n.chain,
      color: COAT,
      sides: 8,
      sectors: [
        [-60, 60, COAT_LIGHT],
        [120, 240, BELLY],
      ],
      group: "necks",
      name: `neckSkin${hi}`,
    });

    const crown = sphere(b, 0.29, COAT, head.at, [1.0, 0.9, 1.12], head);
    const skullSurface = b.surface(crown);

    // Brow and cheek armor.
    box(b, [0.55, 0.12, 0.16], IRON, head.local({ up: 0.14, forward: 0.08 }), {
      bone: head,
      dir: head.dir([0, 0, 1]),
      group: "headArmor",
      name: `browPlate${hi}`,
    });
    for (const side of [-1, 1]) {
      const cheek = head.local([side * 0.2, 0.08, -0.02]);
      sphere(b, 0.13, SCALE_DARK, cheek, [1.2, 0.65, 0.85], head);
      cylinder(
        b,
        0.045,
        0.045,
        BRONZE,
        head.local([side * 0.22, 0.08, 0.11]),
        head.dir([0, 0, 1]),
        head,
      );
    }

    // Upper muzzle and nose.
    const upperMuzzle = b.sweep(
      catmull([
        head.local({ forward: 0.12, down: 0.02 }),
        head.local({ forward: 0.28, down: 0.06 }),
        head.local({ forward: 0.43, down: 0.08 }),
      ]),
      [0.18, 0.11],
      {
        bone: head,
        color: COAT_LIGHT,
        sides: 8,
        caps: "round",
        group: "faces",
        name: `upperMuzzle${hi}`,
      },
    );
    sphere(
      b,
      0.105,
      EYE_DARK,
      head.local({ forward: 0.49, down: 0.075 }),
      [1.25, 0.72, 0.78],
      head,
    );

    // Lower jaw is its own hinge chain and visibly hangs open.
    b.sweep(
      catmull([
        jaw.at,
        jaw.local({ forward: 0.18, down: 0.03 }),
        jaw.local({ forward: 0.38, down: -0.01 }),
      ]),
      [0.12, 0.055],
      {
        bone: jaw,
        color: GUM,
        sides: 7,
        caps: "round",
        group: "jaws",
        name: `lowerJaw${hi}`,
      },
    );
    box(b, [0.23, 0.07, 0.3], BONE_DARK, jaw.local({ forward: 0.25, down: -0.02 }), {
      bone: jaw,
      dir: head.dir([0, 0, 1]),
      group: "jawArmor",
      name: `jawPlate${hi}`,
    });

    // Teeth: upper row hangs down, lower row points up.
    for (const side of [-1, 1]) {
      for (let j = 0; j < 3; j++) {
        const x = side * (0.065 + j * 0.045);
        tooth(
          b,
          head.local({ left: x, forward: 0.29 + j * 0.045, down: 0.01 }),
          head.dir([0, -1, 0]),
          0.095 - j * 0.012,
          0.018,
          head,
        );
        tooth(
          b,
          jaw.local({ left: x, forward: 0.25 + j * 0.045, up: 0.015 }),
          jaw.dir([0, 1, 0]),
          0.07 - j * 0.008,
          0.015,
          jaw,
        );
      }
    }

    // Eyes: dark sockets, glowing amber irises, black slit pupils.
    for (const side of [-1, 1]) {
      const socket = sphere(
        b,
        0.075,
        EYE_DARK,
        head.local({ left: side * 0.14, up: 0.055, forward: 0.19 }),
        [1.05, 0.72, 0.5],
        head,
      );
      const iris = sphere(
        b,
        0.043,
        GOLD,
        head.local({ left: side * 0.14, up: 0.055, forward: 0.225 }),
        [0.8, 0.62, 0.3],
        head,
      );
      glow(iris, 2.4);
      sphere(
        b,
        0.014,
        EYE_DARK,
        head.local({ left: side * 0.14, up: 0.055, forward: 0.25 }),
        [0.45, 1.2, 0.25],
        head,
      );
      sphere(
        b,
        0.009,
        GOLD_HOT,
        head.local({ left: side * 0.12, up: 0.078, forward: 0.258 }),
        [0.7, 0.5, 0.22],
        head,
      );
    }

    // Nostrils and scar-like bronze facial bars.
    for (const side of [-1, 1]) {
      sphere(
        b,
        0.022,
        EYE_DARK,
        head.local({ left: side * 0.055, down: 0.085, forward: 0.505 }),
        [1.3, 0.65, 0.4],
        head,
      );
      b.rod(
        head.local({ left: side * 0.21, up: 0.13, forward: 0.18 }),
        head.local({ left: side * 0.27, down: 0.03, forward: 0.25 }),
        0.012,
        {
          color: BRONZE,
          bone: head,
          group: "facialMetal",
          name: `faceBar${hi}_${side}`,
        },
      );
    }

    // Three swept horns per skull.
    for (const side of [-1, 1]) {
      tooth(
        b,
        head.local({ left: side * 0.19, up: 0.18, back: 0.02 }),
        head.dir([side * 0.35, 0.55, -0.18]),
        0.27,
        0.055,
        head,
      );
      tooth(
        b,
        head.local({ left: side * 0.12, up: 0.24, back: 0.02 }),
        head.dir([side * 0.22, 0.62, -0.05]),
        0.23,
        0.043,
        head,
      );
    }
    tooth(
      b,
      head.local({ up: 0.2, back: 0.12 }),
      head.dir([0, 0.55, -0.4]),
      0.29,
      0.05,
      head,
    );

    // Mane spines down each neck, seated on neck surface frames.
    const neckSurface = b.surface(n.chain);
    const maneHits = neckSurface.scatter(8, {
      rng: rng(100 + hi),
      minDist: 0.1,
      filter: (h: any) => h.n.y > 0.05,
    });
    for (let i = 0; i < maneHits.length; i++) {
      b.stick(new THREE.ConeGeometry(0.045, 0.16, 6), SCALE_DARK, maneHits[i], {
        embed: 0.55,
        name: `mane${hi}_${i}`,
        group: "manes",
      });
    }

    // A hanging throat barb makes the five heads easy to distinguish.
    tooth(
      b,
      head.local({ down: 0.16, back: 0.03 }),
      head.dir([0, -0.65, 0.15]),
      0.15,
      0.032,
      head,
    );
  }

  // ---------------------------------------------------------------------------
  // Additional bronze harness and shoulder plates to sell the God of War scale.
  // ---------------------------------------------------------------------------

  const shoulderL = spine.at(0.7);
  const shoulderR = spine.at(0.7);
  for (const s of [-1, 1]) {
    const p = [s * 0.39, shoulderL.at.y + 0.08, shoulderL.at.z - 0.02] as [
      number,
      number,
      number,
    ];
    box(b, [0.2, 0.24, 0.3], IRON, p, {
      bone: shoulderL.bone,
      dir: [0, 0, 1],
      group: "shoulderArmor",
      name: `shoulderGuard${s}`,
    });
    cylinder(b, 0.035, 0.025, BRONZE, [p[0], p[1] + 0.13, p[2] + 0.12], [0, 1, 0], shoulderL.bone);
  }

  // Thin dark scars across the torso, each an actual raised primitive.
  for (let i = 0; i < 5; i++) {
    const z = -0.55 + i * 0.23;
    b.rod(
      [0.31, 1.03 + (i % 2) * 0.015, z],
      [-0.18, 1.07 - (i % 2) * 0.02, z + 0.12],
      0.012,
      {
        color: BLOOD,
        bone: spine.at(0.42 + i * 0.07).bone,
        group: "scars",
        name: `scar${i}`,
      },
    );
  }

  return b.root;
}
```