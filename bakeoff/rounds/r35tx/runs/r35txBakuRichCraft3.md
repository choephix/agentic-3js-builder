```ts
import * as THREE from "three";
import {
  bezier,
  b,
  catmull,
  createBuilder,
  frame,
  limb,
  mix,
  noise,
  paint,
  polyline,
  rng,
  spiral,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Baku, Dream-Eating Tapir Spirit",
  description:
    "A stocky folkloric baku with a long proboscis, tiger paws, curling dream horns, printed cloud wisps, and an ukiyo-e palette of indigo, vermilion, cream, ochre, and deep woodblock ink.",
};

const INK = "#17182b";
const DEEP = "#18283f";
const INDIGO = "#2c4662";
const BLUE = "#466b80";
const PAPER = "#ead8ad";
const CREAM = "#d9c49b";
const OCHRE = "#b97b3e";
const VERMILION = "#a8473e";
const DARK_RED = "#71313b";
const TEAL = "#39747a";
const IVORY = "#f0dfb0";
const TONGUE = "#b95757";

const BODY_PAINT = paint((p, n, _s) => {
  const saddle = p.z < 0.14 && p.z > -0.72 && p.y > 0.88 + Math.abs(p.x) * 0.08;
  const variation = noise(p, 0.22, 18);
  if (saddle) {
    const base = mix(PAPER, CREAM, 0.25 + variation * 0.26);
    return mix(base, OCHRE, Math.max(0, -n.y) * 0.12 + variation * 0.04);
  }
  const base = mix(INDIGO, DEEP, 0.18 + variation * 0.17);
  return mix(base, "#111b31", Math.max(0, -n.y) * 0.18);
});

const HEAD_PAINT = paint((p, n, _s) => {
  const paleFace = p.z > 0.93 || (p.z > 0.72 && p.y < 1.34);
  const base = paleFace ? mix(PAPER, CREAM, 0.18 + noise(p, 0.17, 23) * 0.2) : INDIGO;
  return mix(base, DEEP, Math.max(0, -n.y) * 0.16);
});

const NECK_PAINT = paint((p, n, _s) => {
  const wash = noise(p, 0.2, 27);
  const base = mix(INDIGO, BLUE, wash * 0.18);
  return mix(base, DEEP, Math.max(0, -n.y) * 0.2);
});

const LEG_PAINT = paint((p, n, _s) => {
  const wash = noise(p, 0.12, 31);
  const base = mix(DEEP, INDIGO, wash * 0.18);
  return mix(base, "#10172b", Math.max(0, -n.y) * 0.15);
});

const TRUNK_PAINT = paint((p, n, _s) => {
  const wash = noise(p, 0.13, 39);
  const base = mix(PAPER, CREAM, 0.22 + wash * 0.22);
  return mix(base, OCHRE, 0.12 + Math.max(0, -n.y) * 0.15);
});

const EAR_PAINT = paint((p, n, _s) => {
  const wash = noise(p, 0.11, 41);
  return mix(INDIGO, DEEP, 0.15 + wash * 0.15 + Math.max(0, -n.y) * 0.15);
});

const CLOUD_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
    <path d="M7 67 Q17 55 30 59 Q28 43 45 38 Q61 33 68 48 Q81 34 99 43 Q113 50 109 64 Q122 65 123 76 Q119 87 103 87 L26 87 Q8 86 7 67Z"
      fill="#ead8ad" stroke="#17182b" stroke-width="5" stroke-linejoin="round"/>
    <path d="M20 72 Q42 65 62 73 T105 70" fill="none" stroke="#a8473e" stroke-width="4"/>
    <path d="M43 52 Q55 45 67 55" fill="none" stroke="#39747a" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const EYE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
    <path d="M7 51 Q34 15 65 20 Q94 23 121 50 Q95 78 64 77 Q31 77 7 51Z"
      fill="#ead8ad" stroke="#17182b" stroke-width="7" stroke-linejoin="round"/>
    <path d="M40 53 Q42 23 66 23 Q92 25 92 52 Q89 77 65 78 Q42 77 40 53Z"
      fill="#b97b3e" stroke="#17182b" stroke-width="4"/>
    <path d="M49 54 Q53 31 66 30 Q82 32 85 54 Q81 70 66 71 Q52 69 49 54Z"
      fill="#a8473e"/>
    <ellipse cx="67" cy="53" rx="8" ry="24" fill="#17182b"/>
    <ellipse cx="56" cy="39" rx="7" ry="9" fill="#fff1ca"/>
    <circle cx="77" cy="65" r="3.5" fill="#fff1ca"/>
    <path d="M16 29 Q38 7 64 10 Q91 10 111 29" fill="none" stroke="#a8473e" stroke-width="5"/>
    <path d="M10 72 Q31 87 55 89" fill="none" stroke="#71313b" stroke-width="3"/>
  </svg>`,
  { size: 384 },
);

const RUNE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 112">
    <circle cx="48" cy="56" r="43" fill="#ead8ad" stroke="#17182b" stroke-width="5"/>
    <path d="M25 28 Q55 18 67 36 Q77 50 55 56 Q30 60 29 78 Q31 93 63 86"
      fill="none" stroke="#a8473e" stroke-width="7" stroke-linecap="round"/>
    <path d="M49 19 L47 92 M29 55 L70 55" fill="none" stroke="#17182b" stroke-width="5"/>
    <circle cx="71" cy="29" r="5" fill="#39747a"/>
    <circle cx="26" cy="86" r="5" fill="#39747a"/>
  </svg>`,
  { size: 256 },
);

const WAVE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M0 44 Q17 28 34 44 T68 44 T102 44 T136 44" fill="none" stroke="#a8473e" stroke-width="7"/>
    <path d="M-8 73 Q10 56 28 73 T64 73 T100 73 T136 73" fill="none" stroke="#39747a" stroke-width="7"/>
    <path d="M0 102 Q18 85 36 102 T72 102 T108 102 T144 102" fill="none" stroke="#17182b" stroke-width="5"/>
    <path d="M8 48 Q18 38 28 48 M75 48 Q85 38 95 48 M42 77 Q52 67 62 77 M104 77 Q114 67 124 77"
      fill="none" stroke="#ead8ad" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const EMBLEM_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="53" fill="#ead8ad" stroke="#17182b" stroke-width="7"/>
    <path d="M64 17 Q78 39 104 45 Q81 55 82 83 Q64 70 46 83 Q47 55 24 45 Q50 39 64 17Z"
      fill="#a8473e" stroke="#17182b" stroke-width="4"/>
    <path d="M38 66 Q64 42 90 66 Q67 61 38 66Z" fill="#39747a"/>
    <circle cx="64" cy="64" r="8" fill="#b97b3e" stroke="#17182b" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const SEAL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="31" fill="#a8473e" stroke="#17182b" stroke-width="5"/>
    <path d="M25 26 Q52 20 53 37 Q53 48 34 51 Q24 54 28 61 M36 23 L36 62"
      fill="none" stroke="#ead8ad" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

function addChainBand(
  builder: ReturnType<typeof createBuilder>,
  chain: any,
  t: number,
  radius: number,
  color: string,
  name: string,
) {
  const ring = builder.ring(chain.at(t), { count: 8, radius, name: `${name}Ring` });
  builder.sweep(polyline(ring.items, { closed: true }), 0.012, {
    color,
    caps: "none",
    name,
  });
}

function addWisp(
  builder: ReturnType<typeof createBuilder>,
  start: any,
  c1: THREE.Vector3,
  c2: THREE.Vector3,
  end: THREE.Vector3,
  color: string,
  name: string,
) {
  return builder.sweep(bezier(start, c1, c2, end), [0.018, 0.003], {
    color,
    caps: { start: "round", end: "point" },
    name,
  });
}

export default function build() {
  const builder = createBuilder({
    name: "baku",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: a compact, neutral quadruped pose with an openable jaw and separated appendages.

  const hips = builder.joint("hips", {
    at: [0, 0.96, -0.38],
    dir: [0, 0, 1],
    role: "spine",
    group: "skeleton",
  });

  const torsoPath = catmull(
    [
      [0, 0.96, -0.90],
      [0, 0.97, -0.58],
      [0, 1.00, -0.22],
      [0, 1.05, 0.14],
      [0, 1.10, 0.52],
    ],
    { tension: 0.25 },
  );

  const torso = builder.chain("spine", torsoPath, {
    parent: hips,
    count: 6,
    names: ["spineBase", "spine1", "spine2", "spine3", "spine4", "spineChest"],
    role: "spine",
    group: "skeleton",
  });

  const neckPath = catmull(
    [
      [0, 1.08, 0.42],
      [0, 1.18, 0.61],
      [0, 1.34, 0.78],
      [0, 1.43, 0.83],
    ],
    { tension: 0.2 },
  );

  const neck = builder.chain("neck", neckPath, {
    parent: torso.joints[torso.joints.length - 1],
    count: 3,
    names: ["neckBase", "neckMid", "neckTip"],
    role: "neck",
    group: "skeleton",
  });

  const head = builder.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.45, 0.83],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = builder.joint("jaw", {
    parent: head,
    at: [0, 1.32, 1.01],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const trunkPath = catmull(
    [
      [0, 1.44, 1.00],
      [0, 1.42, 1.20],
      [0, 1.36, 1.42],
      [0, 1.29, 1.61],
    ],
    { tension: 0.2 },
  );

  const trunk = builder.chain("trunk", trunkPath, {
    parent: head,
    count: 5,
    names: ["trunkBase", "trunk1", "trunk2", "trunk3", "trunkTip"],
    role: "tentacle",
    group: "head",
  });

  const tailPath = catmull(
    [
      [0, 0.96, -0.82],
      [0.015, 0.96, -1.06],
      [0.08, 1.02, -1.27],
      [0.04, 1.12, -1.38],
    ],
    { tension: 0.3 },
  );

  const tail = builder.chain("tail", tailPath, {
    parent: torso.joints[0],
    count: 4,
    names: ["tailBase", "tail1", "tail2", "tailTip"],
    role: "tail",
    group: "skeleton",
  });

  const earJoints: { side: number; joint: any }[] = [];
  for (const side of [1, -1]) {
    const suffix = side > 0 ? "L" : "R";
    const ear = builder.joint(`ear${suffix}`, {
      parent: head,
      at: [side * 0.265, 1.57, 0.76],
      dir: [side * 0.3, 0.2, 0.15],
      role: "hinge",
      group: "head",
    });
    earJoints.push({ side, joint: ear });
  }

  const legRecords: {
    side: number;
    front: boolean;
    chain: any;
    target: THREE.Vector3;
    footBone: any;
  }[] = [];

  const legConfigs = [
    { side: 1, front: false, z: -0.60 },
    { side: -1, front: false, z: -0.60 },
    { side: 1, front: true, z: 0.30 },
    { side: -1, front: true, z: 0.30 },
  ];

  for (const config of legConfigs) {
    const sideName = config.side > 0 ? "L" : "R";
    const root = new THREE.Vector3(config.side * 0.32, 0.96, config.z);
    const target = new THREE.Vector3(config.side * 0.37, 0.17, config.z + (config.front ? 0.06 : -0.035));
    const points = limb(
      root,
      target,
      [0.35, 0.32, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );

    const names = config.front
      ? [`shoulder${sideName}`, `elbow${sideName}`, `wrist${sideName}`, `paw${sideName}`]
      : [`hip${sideName}`, `knee${sideName}`, `ankle${sideName}`, `hoof${sideName}`];

    const leg = builder.chain(config.front ? `legF${sideName}` : `legH${sideName}`, points, {
      parent: torso.nearestJoint(root),
      names,
      role: "leg",
      contact: [target.x, 0, target.z],
      group: "skeleton",
    });

    legRecords.push({
      side: config.side,
      front: config.front,
      chain: leg,
      target,
      footBone: leg.tip ?? leg.joints[leg.joints.length - 1],
    });
  }

  // Hinge the lower jaw downward before any jaw-attached geometry is authored.
  builder.pose(jaw, { axis: [1, 0, 0], deg: 17 });

  // ---------------------------------------------------------------------------------------------------------------
  // Main block-built body.

  const body = builder.sweep(
    torso,
    (t) => {
      const fullness = Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
      return [0.34 + fullness * 0.075, 0.34 + fullness * 0.065];
    },
    {
      color: BODY_PAINT,
      shift: [0, -0.025],
      sides: 10,
      smooth: false,
      caps: "round",
      name: "broadPrintedBody",
      group: "body",
    },
  );

  const neckTube = builder.sweep(
    neck,
    (t) => [0.255 - t * 0.025, 0.265 - t * 0.035],
    {
      color: NECK_PAINT,
      sectors: [[112, 248, CREAM]],
      sides: 9,
      smooth: false,
      caps: "round",
      name: "neck",
      group: "body",
    },
  );

  const tailTube = builder.sweep(
    tail,
    (t) => [0.095 - t * 0.062, 0.082 - t * 0.055],
    {
      color: BODY_PAINT,
      bands: [
        [0.72, VERMILION],
        [0.91, CREAM],
      ],
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "shortDreamTail",
      group: "body",
    },
  );

  const headSkull = builder.part(
    new THREE.SphereGeometry(1, 14, 10),
    HEAD_PAINT,
    {
      bone: head,
      at: head.at,
      scale: [0.34, 0.36, 0.405],
      flat: true,
      name: "facetedHead",
      group: "head",
    },
  );

  const upperMuzzle = builder.sweep(
    catmull(
      [
        [0, 1.44, 0.90],
        [0, 1.43, 1.03],
        [0, 1.42, 1.13],
      ],
      { tension: 0.2 },
    ),
    [0.19, 0.125],
    {
      bone: head,
      color: TRUNK_PAINT,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "upperJaw",
      group: "head",
    },
  );

  const lowerJawPath = catmull(
    [
      jaw.at,
      jaw.local({ forward: 0.18, down: 0.045 }),
      jaw.local({ forward: 0.34, down: 0.115 }),
    ],
    { tension: 0.2 },
  );

  const lowerJaw = builder.sweep(lowerJawPath, [0.145, 0.068], {
    bone: jaw,
    color: TRUNK_PAINT,
    sides: 8,
    smooth: false,
    caps: "round",
    name: "lowerJaw",
    group: "head",
  });

  const trunkTube = builder.sweep(
    trunk,
    (t) => [0.135 - t * 0.055, 0.125 - t * 0.05],
    {
      color: TRUNK_PAINT,
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "round" },
      name: "longProboscis",
      group: "head",
    },
  );

  // Mouth cavity, tongue, and a pair of small ivory teeth make the separated jaw readable.
  builder.part(new THREE.BoxGeometry(0.29, 0.052, 0.028), INK, {
    bone: head,
    at: [0, 1.335, 1.175],
    flat: true,
    name: "openMouthShadow",
    group: "head",
  });

  builder.part(new THREE.BoxGeometry(0.105, 0.022, 0.055), TONGUE, {
    bone: jaw,
    at: jaw.local({ forward: 0.19, down: 0.03 }),
    flat: true,
    name: "tongue",
    group: "head",
  });

  for (const side of [1, -1]) {
    const toothBase = new THREE.Vector3(side * 0.105, 1.365, 1.155);
    builder.spike(toothBase, [0, -0.2, 1], 0.065, 0.018, {
      bone: head,
      color: IVORY,
      name: `upperTooth${side > 0 ? "L" : "R"}`,
      group: "head",
    });
  }

  // Broad low-poly feet, with three separated tiger-like claws on each.
  for (const record of legRecords) {
    const foot = record.target.clone().add(new THREE.Vector3(0, -0.015, 0.045));
    builder.part(new THREE.BoxGeometry(0.22, 0.14, 0.285), INK, {
      bone: record.footBone,
      at: foot,
      flat: true,
      name: `${record.front ? "front" : "hind"}Paw${record.side > 0 ? "L" : "R"}`,
      group: "feet",
    });

    for (const xOffset of [-0.065, 0, 0.065]) {
      const base = new THREE.Vector3(record.target.x + xOffset, 0.085, record.target.z + 0.13);
      const tip = new THREE.Vector3(record.target.x + xOffset * 1.08, 0.062, record.target.z + 0.235);
      builder.spike(base, tip, null, 0.017, {
        bone: record.footBone,
        color: IVORY,
        name: `${record.front ? "front" : "hind"}Claw`,
        group: "feet",
      });
    }

    addChainBand(builder, record.chain, 0.68, 0.112, VERMILION, `${record.front ? "front" : "hind"}LowerBand`);
    addChainBand(builder, record.chain, 0.86, 0.104, OCHRE, `${record.front ? "front" : "hind"}AnkleBand`);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ears, mane, crest, and spirit ornaments.

  const earOutline: [number, number][] = [
    [0, 0],
    [0.105, 0.015],
    [0.185, 0.09],
    [0.20, 0.19],
    [0.145, 0.30],
    [0.045, 0.395],
    [-0.025, 0.26],
  ];

  const innerEarOutline: [number, number][] = [
    [0.01, 0.035],
    [0.09, 0.05],
    [0.14, 0.115],
    [0.145, 0.19],
    [0.085, 0.275],
    [0.025, 0.335],
    [0.0, 0.22],
  ];

  for (const entry of earJoints) {
    const side = entry.side;
    const suffix = side > 0 ? "L" : "R";
    const ear = entry.joint;

    builder.extrude(earOutline, {
      at: ear.at,
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: [0.046, 0.026],
      bevel: 0.012,
      smoothing: 1,
      color: EAR_PAINT,
      bone: ear,
      name: `roundedEar${suffix}`,
      group: "head",
    });

    builder.extrude(innerEarOutline, {
      at: new THREE.Vector3(ear.at.x, ear.at.y, ear.at.z + 0.026),
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: DARK_RED,
      bone: ear,
      name: `innerEar${suffix}`,
      group: "head",
    });

    builder.part(new THREE.PlaneGeometry(0.16, 0.22), "#ffffff", {
      bone: ear,
      at: [side * 0.305, 1.70, 0.80],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      axis: "z",
      texture: WAVE_TEX,
      name: `earWavePrint${suffix}`,
      group: "textures",
    });
  }

  const crestBack: [number, number][] = [
    [-0.11, 0.015],
    [0.11, 0.015],
    [0.17, 0.17],
    [0.065, 0.38],
    [0, 0.49],
    [-0.07, 0.31],
    [-0.16, 0.17],
  ];

  const crestFront: [number, number][] = [
    [-0.075, 0.02],
    [0.075, 0.02],
    [0.11, 0.15],
    [0.04, 0.32],
    [0, 0.41],
    [-0.05, 0.27],
    [-0.105, 0.14],
  ];

  builder.extrude(crestBack, {
    at: [0, 1.56, 0.61],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    bevel: 0.009,
    color: INK,
    bone: head,
    name: "inkCrownSilhouette",
    group: "head",
  });

  builder.extrude(crestFront, {
    at: [0, 1.565, 0.64],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.022,
    bevel: 0.006,
    color: VERMILION,
    bone: head,
    name: "vermilionCrown",
    group: "head",
  });

  const maneOutline: [number, number][] = [
    [0, 0],
    [0.20, 0.035],
    [0.16, 0.17],
    [0.28, 0.30],
    [0.09, 0.285],
    [-0.015, 0.53],
    [-0.14, 0.34],
    [-0.26, 0.39],
    [-0.19, 0.18],
    [-0.29, 0.07],
  ];

  const maneStripe: [number, number][] = [
    [0.035, 0.03],
    [0.11, 0.045],
    [0.09, 0.16],
    [0.16, 0.23],
    [0.07, 0.235],
    [0.015, 0.40],
    [-0.07, 0.27],
    [-0.13, 0.30],
    [-0.10, 0.15],
    [-0.15, 0.08],
  ];

  for (const side of [1, -1]) {
    const sideBone = torso.nearestJoint(new THREE.Vector3(side * 0.34, 1.10, 0.30));
    const suffix = side > 0 ? "L" : "R";

    builder.extrude(maneOutline, {
      at: [side * 0.335, 1.05, 0.18],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.040,
      bevel: 0.008,
      color: INK,
      bone: sideBone,
      name: `sideMane${suffix}`,
      group: "mane",
    });

    builder.extrude(maneStripe, {
      at: [side * 0.36, 1.055, 0.19],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: VERMILION,
      bone: sideBone,
      name: `maneStripe${suffix}`,
      group: "mane",
    });

    builder.part(new THREE.PlaneGeometry(0.095, 0.095), "#ffffff", {
      bone: sideBone,
      at: [side * 0.385, 1.34, 0.40],
      dir: [side, 0, 0],
      up: [0, 1, 0],
      axis: "z",
      texture: SEAL_TEX,
      name: `maneSeal${suffix}`,
      group: "textures",
    });
  }

  // Dorsal pointed tufts mimic carved triangular brush marks along the saddle.
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    const top = body.at(t, 0, 0.012);
    builder.spike(top, top, 0.085 + (i % 3) * 0.014, 0.026, {
      color: i % 2 === 0 ? VERMILION : OCHRE,
      name: `dorsalTuft${i}`,
      group: "mane",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ink contours, printed bands, and surface ornaments.

  builder.sweep(body.line(0, 0.010), 0.009, {
    color: INK,
    caps: "none",
    name: "dorsalInkLine",
    group: "ink",
  });

  builder.sweep(body.line(180, 0.008), 0.007, {
    color: INK,
    caps: "none",
    name: "bellyInkLine",
    group: "ink",
  });

  builder.sweep(neckTube.line(0, 0.008), 0.008, {
    color: INK,
    caps: "none",
    name: "neckInkLine",
    group: "ink",
  });

  builder.sweep(tailTube.line(0, 0.006), 0.006, {
    color: INK,
    caps: "none",
    name: "tailInkLine",
    group: "ink",
  });

  const bodySurface = builder.surface(body);
  const neckCollar = builder.ring(neck.at(0.52), {
    count: 12,
    radius: 0.255,
    tilt: -3,
    name: "neckCollar",
    role: "fan",
    group: "ornament",
  });

  builder.sweep(polyline(neckCollar.items, { closed: true }), 0.016, {
    color: VERMILION,
    caps: "none",
    name: "vermilionNeckCollar",
    group: "ornament",
  });

  for (const item of neckCollar.items) {
    builder.stick(new THREE.SphereGeometry(0.018, 6, 4), OCHRE, item, {
      embed: 0.28,
      name: "collarStud",
      group: "ornament",
    });
  }

  const sash = bodySurface.loop(torso.at(0.59), { lift: 0.008 });
  builder.sweep(sash, 0.016, {
    color: VERMILION,
    caps: "none",
    name: "printedSash",
    group: "ornament",
  });

  builder.along(sash, 10, (at) => {
    builder.stick(new THREE.SphereGeometry(0.017, 6, 4), OCHRE, at, {
      embed: 0.30,
      name: "sashRivet",
      group: "ornament",
    });
  });

  const trunkSurface = builder.surface(trunkTube);
  for (const t of [0.34, 0.56, 0.77]) {
    const trunkRing = trunkSurface.loop(trunk.at(t), { lift: 0.004 });
    builder.sweep(trunkRing, 0.008, {
      color: VERMILION,
      caps: "none",
      name: `proboscisBand${Math.round(t * 100)}`,
      group: "ornament",
    });
  }

  const bodyChips = bodySurface.scatter(22, {
    rng: rng(73),
    minDist: 0.105,
    filter: (hit) => hit.n.y > -0.18 && hit.at.z < 0.16,
  });

  for (let i = 0; i < bodyChips.length; i++) {
    builder.stick(
      new THREE.CylinderGeometry(0.020 + (i % 3) * 0.003, 0.020 + (i % 3) * 0.003, 0.009, 6),
      i % 3 === 0 ? VERMILION : OCHRE,
      bodyChips[i],
      {
        embed: 0.48,
        spin: (i * 37) % 360,
        name: "printedBodyChip",
        group: "print",
      },
    );
  }

  for (const side of [1, -1]) {
    const hit = bodySurface.nearest([side * 0.39, 1.18, -0.28]);
    builder.decal(body, EMBLEM_TEX, {
      at: hit,
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.19, 0.19],
      segments: 8,
      lift: 0.004,
      mirror: side < 0,
      name: `saddleEmblem${side > 0 ? "L" : "R"}`,
      group: "textures",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Face: large printed eyes, a forehead dream seal, tusks, whiskers, and nose.

  const skullSurface = builder.surface(headSkull);

  for (const side of [1, -1]) {
    const suffix = side > 0 ? "L" : "R";
    const eyeHit = skullSurface.around(head.at).at(side * 15, 7);

    if (eyeHit) {
      builder.decal(headSkull, EYE_TEX, {
        at: eyeHit,
        dir: eyeHit.n,
        up: [0, 1, 0],
        size: [0.135, 0.102],
        segments: 8,
        lift: 0.005,
        mirror: side > 0,
        name: `paintedEye${suffix}`,
        group: "face",
      });
    }

    const tuskBase = skullSurface.nearest([side * 0.19, 1.37, 1.04]);
    const tuskTip = new THREE.Vector3(side * 0.235, 1.22, 1.255);

    builder.sweep(
      bezier(
        tuskBase,
        new THREE.Vector3(side * 0.225, 1.30, 1.12),
        tuskTip,
      ),
      [0.032, 0],
      {
        bone: head,
        color: IVORY,
        sides: 7,
        caps: { start: "round", end: "point" },
        name: `curvedTusk${suffix}`,
        group: "face",
      },
    );
  }

  const runeHit = skullSurface.around(head.at).at(0, 28);
  if (runeHit) {
    builder.decal(headSkull, RUNE_TEX, {
      at: runeHit,
      dir: runeHit.n,
      up: [0, 1, 0],
      size: [0.115, 0.145],
      segments: 8,
      lift: 0.005,
      name: "foreheadDreamRune",
      group: "textures",
    });
  }

  const noseCenter = trunk.at(1).at;
  builder.part(new THREE.SphereGeometry(1, 10, 7), INK, {
    bone: trunk.joints[trunk.joints.length - 1],
    at: noseCenter,
    scale: [0.115, 0.078, 0.058],
    flat: true,
    name: "darkNosePad",
    group: "face",
  });

  for (const side of [1, -1]) {
    builder.part(new THREE.SphereGeometry(0.027, 8, 5), INK, {
      bone: trunk.joints[trunk.joints.length - 1],
      at: [side * 0.045, 1.285, 1.672],
      scale: [1, 0.76, 0.55],
      flat: true,
      name: `nostril${side > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const base = new THREE.Vector3(side * (0.105 + i * 0.018), 1.37 - i * 0.032, 1.175);
      const control = new THREE.Vector3(side * (0.235 + i * 0.028), 1.34 - i * 0.045, 1.235);
      const tip = new THREE.Vector3(side * (0.38 + i * 0.045), 1.31 - i * 0.06, 1.23 - i * 0.025);

      builder.sweep(bezier(base, control, tip), [0.0085, 0.0015], {
        bone: head,
        color: INK,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `whisker${side > 0 ? "L" : "R"}${i + 1}`,
        group: "face",
      });
    }
  }

  // Small curled dream horns grow from the crown, a folkloric exaggeration of the tapir silhouette.
  for (const side of [1, -1]) {
    const suffix = side > 0 ? "L" : "R";
    const crownHit = skullSurface.nearest([side * 0.23, 1.68, 0.78]);
    const center = crownHit.at.clone().add(new THREE.Vector3(0, -0.018, -0.025));
    const hornPath = spiral(center, crownHit, [side, 0, 0], {
      turns: -side * 0.82,
      r1: 0.008,
      pitch: 0.045,
    });

    builder.sprout(`dreamHorn${suffix}`, crownHit, hornPath, [0.035, 0.006], {
      count: 0,
      color: OCHRE,
      caps: { start: "round", end: "point" },
      role: "fan",
      name: `dreamHorn${suffix}`,
      group: "spirit",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Dream vapor: carved curls leave the mouth and are punctuated by cut-paper cloud cards.

  const vaporOne = addWisp(
    builder,
    trunkTube.at(1, 34, 0.008),
    new THREE.Vector3(0.16, 1.29, 1.75),
    new THREE.Vector3(0.34, 1.53, 1.84),
    new THREE.Vector3(0.19, 1.76, 1.71),
    VERMILION,
    "dreamWispL",
  );

  const vaporTwo = addWisp(
    builder,
    trunkTube.at(1, -34, 0.008),
    new THREE.Vector3(-0.17, 1.27, 1.76),
    new THREE.Vector3(-0.36, 1.49, 1.86),
    new THREE.Vector3(-0.22, 1.72, 1.73),
    TEAL,
    "dreamWispR",
  );

  const dreamBase = skullSurface.nearest([0, 1.39, 1.14]);
  const vaporThree = addWisp(
    builder,
    dreamBase,
    new THREE.Vector3(0.02, 1.51, 1.36),
    new THREE.Vector3(-0.03, 1.74, 1.46),
    new THREE.Vector3(0.12, 1.91, 1.35),
    OCHRE,
    "dreamWispCrown",
  );

  builder.sweep(vaporOne.line(0, 0.004), 0.004, {
    color: INK,
    caps: "none",
    name: "wispInkL",
    group: "ink",
  });

  builder.sweep(vaporTwo.line(0, 0.004), 0.004, {
    color: INK,
    caps: "none",
    name: "wispInkR",
    group: "ink",
  });

  const vaporCards = [
    frame([0.16, 1.46, 1.76], [0, 1, 0]),
    frame([0.28, 1.67, 1.72], [0, 1, 0]),
    frame([-0.16, 1.46, 1.77], [0, 1, 0]),
    frame([-0.28, 1.65, 1.73], [0, 1, 0]),
    frame([0.09, 1.78, 1.41], [0, 1, 0]),
    vaporOne.at(0.52, 0, 0.006),
    vaporTwo.at(0.53, 0, 0.006),
    vaporThree.at(0.50, 0, 0.006),
  ];

  builder.cards(vaporCards, CLOUD_TEX, {
    size: [0.17, 0.13],
    color: "#fff7d7",
    lean: 0,
    flow: [0, 0, 1],
    bend: 7,
    vary: 0.18,
    cross: true,
    rng: rng(109),
    sink: 0.05,
    name: "dreamCloudCards",
    group: "spirit",
  });

  // A final small cloud at the tail tip makes the short tail feel like a spirit's brush.
  const tailTip = tailTube.at(1, 0, 0.008);
  builder.spike(tailTip, tailTip, 0.13, 0.031, {
    color: VERMILION,
    name: "tailCloudTuft",
    group: "spirit",
  });

  // Printed brushwork across the shoulder and rump gives the otherwise simple primitive body its ukiyo-e finish.
  for (const t of [0.16, 0.28, 0.78, 0.88]) {
    const mark = body.at(t, t % 2 === 0 ? -25 : 25, 0.006);
    builder.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 6), INK, mark, {
      embed: 0.35,
      spin: t * 180,
      name: "woodblockMark",
      group: "print",
    });
  }

  return builder.root;
}
```