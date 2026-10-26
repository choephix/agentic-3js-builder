import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  type Builder,
} from "../../../../src/index";

const PALETTE = {
  hide: "#252729",
  hideLight: "#3b3f3f",
  hideDark: "#151719",
  belly: "#6d6256",
  bone: "#b9a98b",
  boneDark: "#756852",
  horn: "#292321",
  eye: "#f2b12d",
  pupil: "#120d0b",
  mouth: "#5a1719",
  tongue: "#b73632",
  claw: "#d1c29d",
  iron: "#47494a",
  ironDark: "#252729",
  ironEdge: "#8b7960",
  bronze: "#8b542c",
  bronzeLight: "#c18442",
};

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A massive five-headed war hydra with a plated reptilian body, splayed necks, open jaws, horns, claws, and a heavy serpent tail.",
};

export const REQUESTS = [
  {
    id: "crownSpines",
    kind: "add",
    part: "centralHead",
    what: "A brutal crown of three broad dark iron spines behind the central hydra head, with bronze studs at their roots. Keep the silhouette jagged and God of War-like.",
    at: [0, 2.9, 1.0],
    normal: [0, 0.4, -1],
    bone: "headC",
    room: [0.7, 0.8, 0.25],
  },
  {
    id: "neckArmor",
    kind: "add",
    part: "neckArmor",
    what: "Layered bronze-and-iron scale plates around the five neck bases, leaving the throat and jaw hinges clear. Large overlapping plates, battered edges.",
    at: [0, 1.45, 0.42],
    normal: [0, 0.2, 1],
    bone: "hips",
    room: [1.7, 0.75, 0.45],
  },
  {
    id: "leftShoulder",
    kind: "add",
    part: "leftShoulder",
    what: "A huge asymmetric iron shoulder pauldron on the hydra's left side, decorated with one bronze spiral and two blunt spikes.",
    at: [0.72, 1.05, 0.28],
    normal: [1, 0.2, 0],
    bone: "shoulderL",
    room: [0.55, 0.6, 0.55],
  },
  {
    id: "rightShoulder",
    kind: "add",
    part: "rightShoulder",
    what: "A smaller battered iron shoulder plate on the hydra's right side, with three raised bronze rivets.",
    at: [-0.72, 1.05, 0.28],
    normal: [-1, 0.2, 0],
    bone: "shoulderR",
    room: [0.45, 0.5, 0.45],
  },
  {
    id: "headCrest",
    kind: "add",
    part: "centralHead",
    what: "A tall central brow crest shaped like a cracked black-metal war crown, centered between the eyes and rising backward.",
    at: [0, 2.72, 1.2],
    normal: [0, 0.55, 0.83],
    bone: "headC",
    room: [0.35, 0.55, 0.3],
  },
  {
    id: "jawFangs",
    kind: "add",
    part: "allHeads",
    what: "Rows of oversized ivory fangs on all five open lower jaws, alternating long and short teeth. Add a dark red inner-mouth plate behind each row.",
    at: [0, 2.48, 1.42],
    normal: [0, -0.4, 0.9],
    bone: null,
    room: [2.2, 0.55, 0.65],
  },
  {
    id: "tailBlade",
    kind: "add",
    part: "tail",
    what: "A hooked bronze-and-iron blade assembly at the tail tip, like a broad executioner's axe fused to the serpent tail. Keep it behind the body.",
    at: [0, 0.52, -1.85],
    normal: [0, 0.2, -1],
    bone: "tail4",
    room: [0.7, 0.8, 0.45],
  },
  {
    id: "forelegClaws",
    kind: "add",
    part: "frontFeet",
    what: "Three enormous hooked claw blades on each front foot, pale bone with dark iron bases, splayed forward and clearly separated.",
    at: [0, 0.17, 0.52],
    normal: [0, 0, 1],
    bone: null,
    room: [1.4, 0.35, 0.7],
  },
  {
    id: "bodyScars",
    kind: "texture",
    part: "bodyArmor",
    what: "Paint broad faded war scars and blackened slash marks across the charcoal hide, especially along the flanks and rump. Preserve the bronze plates.",
  },
  {
    id: "bellyPattern",
    kind: "texture",
    part: "belly",
    what: "Add a segmented warm gray belly pattern with irregular vertical armored bands, darker between segments and subtly weathered.",
  },
  {
    id: "headMarkings",
    kind: "texture",
    part: "centralHead",
    what: "Paint ritual red war-paint stripes across the central brow and cheek ridges, with smaller matching marks on the four side heads.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function sphere(
  b: Builder,
  color: string,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  bone: any,
  name: string,
  segments = 10,
) {
  return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
    at,
    bone,
    scale,
    name,
    flat: true,
  });
}

function box(
  b: Builder,
  color: string,
  at: THREE.Vector3 | [number, number, number],
  size: [number, number, number],
  bone: any,
  name: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function headAssembly(
  b: Builder,
  head: any,
  jaw: any,
  p: THREE.Vector3,
  side: number,
  label: string,
  scale: number,
) {
  const skull = sphere(
    b,
    PALETTE.hideLight,
    p,
    [0.32 * scale, 0.34 * scale, 0.38 * scale],
    head,
    `${label}Head`,
    12,
  );

  sphere(
    b,
    PALETTE.hide,
    [p.x, p.y - 0.01 * scale, p.z + 0.29 * scale],
    [0.24 * scale, 0.20 * scale, 0.32 * scale],
    head,
    `${label}Snout`,
    10,
  );

  sphere(
    b,
    PALETTE.mouth,
    [p.x, p.y - 0.19 * scale, p.z + 0.38 * scale],
    [0.20 * scale, 0.055 * scale, 0.22 * scale],
    jaw,
    `${label}Mouth`,
    8,
  );

  box(
    b,
    PALETTE.hideDark,
    [p.x, p.y - 0.17 * scale, p.z + 0.37 * scale],
    [0.39 * scale, 0.12 * scale, 0.30 * scale],
    jaw,
    `${label}LowerJaw`,
  );

  sphere(
    b,
    PALETTE.tongue,
    [p.x, p.y - 0.245 * scale, p.z + 0.43 * scale],
    [0.095 * scale, 0.025 * scale, 0.14 * scale],
    jaw,
    `${label}Tongue`,
    8,
  );

  for (const eyeSide of [-1, 1]) {
    const ex = p.x + eyeSide * 0.145 * scale;
    const ey = p.y + 0.105 * scale;
    const ez = p.z + 0.275 * scale;

    sphere(b, PALETTE.eye, [ex, ey, ez], [0.065 * scale, 0.07 * scale, 0.035 * scale], head, `${label}Eye${eyeSide}`, 8);
    sphere(b, PALETTE.pupil, [ex, ey, ez + 0.028 * scale], [0.022 * scale, 0.045 * scale, 0.012 * scale], head, `${label}Pupil${eyeSide}`, 6);

    b.spike(
      [ex, ey + 0.09 * scale, ez + 0.015 * scale],
      [ex, ey + 0.15 * scale, ez - 0.02 * scale],
      null,
      0.025 * scale,
      { color: PALETTE.horn, bone: head, name: `${label}Brow${eyeSide}` },
    );
  }

  for (const hornSide of [-1, 1]) {
    const base = new THREE.Vector3(
      p.x + hornSide * 0.20 * scale,
      p.y + 0.19 * scale,
      p.z - 0.03 * scale,
    );
    const tip = new THREE.Vector3(
      p.x + hornSide * 0.30 * scale,
      p.y + 0.47 * scale,
      p.z - 0.10 * scale,
    );
    b.spike(base, tip, null, 0.07 * scale, {
      color: PALETTE.horn,
      bone: head,
      name: `${label}Horn${hornSide}`,
    });
  }

  for (const toothSide of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const tx = p.x + toothSide * (0.07 + i * 0.055) * scale;
      const tz = p.z + (0.31 + (i % 2) * 0.07) * scale;
      b.spike(
        [tx, p.y - 0.16 * scale, tz],
        [tx, p.y - 0.28 * scale - (i === 1 ? 0.04 : 0), tz + 0.018],
        null,
        0.025 * scale,
        { color: PALETTE.bone, bone: jaw, name: `${label}Tooth${toothSide}${i}` },
      );
    }
  }

  return skull;
}

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  // Skeleton first: one root, a heavy torso spine, four planted legs, tail, then five neck/head assemblies.
  const hips = b.joint("hips", { at: [0, 0.88, -0.05], role: "spine" });

  const torsoPath = catmull([
    [0, 0.88, -0.62],
    [0, 0.92, -0.18],
    [0, 1.02, 0.30],
    [0, 1.14, 0.58],
  ]);
  const torso = b.chain("torso", torsoPath, {
    parent: hips,
    names: ["torso0", "torso1", "shoulderC", "neckRoot"],
    role: "spine",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.87, -0.40],
      [0, 0.70, -0.92],
      [0, 0.53, -1.42],
      [0, 0.44, -1.87],
      [0, 0.38, -2.20],
    ]),
    { parent: hips, names: ["tail0", "tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  const legChains: Record<string, any> = {};
  const legData = [
    ["L", 1, 0.43, 0.38],
    ["R", -1, 0.43, 0.38],
    ["L", 1, -0.38, -0.45],
    ["R", -1, -0.38, -0.45],
  ] as const;

  for (const [sideName, sx, z, footZ] of legData) {
    const prefix = z > 0 ? "front" : "rear";
    const side = sx > 0 ? "L" : "R";
    const hip = [sx * 0.43, 0.88, z] as [number, number, number];
    const foot = [sx * 0.54, 0.18, footZ + (z > 0 ? 0.06 : -0.03)] as [number, number, number];
    const pts = limb(hip, foot, [0.36, 0.34, 0.25], [[0, 0, z > 0 ? 1 : -1], [0, 0, z > 0 ? -1 : 1]]);
    legChains[`${prefix}${side}`] = b.chain(`${prefix}${side}`, pts, {
      parent: hips,
      names: [`hip${prefix}${side}`, `knee${prefix}${side}`, `ankle${prefix}${side}`, `foot${prefix}${side}`],
      role: "leg",
      contact: foot,
    });
  }

  const headSpecs = [
    { key: "C", x: 0, y: 2.30, z: 0.88, sx: 1.16, rootX: 0, rootZ: 0.46 },
    { key: "L", x: 0.62, y: 2.13, z: 0.76, sx: 0.94, rootX: 0.27, rootZ: 0.48 },
    { key: "R", x: -0.62, y: 2.13, z: 0.76, sx: 0.94, rootX: -0.27, rootZ: 0.48 },
    { key: "FL", x: 0.84, y: 2.00, z: 0.66, sx: 0.82, rootX: 0.44, rootZ: 0.40 },
    { key: "FR", x: -0.84, y: 2.00, z: 0.66, sx: 0.82, rootX: -0.44, rootZ: 0.40 },
  ];

  const heads: any[] = [];
  const jaws: any[] = [];

  for (const s of headSpecs) {
    const neckPath = catmull([
      [s.rootX, 1.16, s.rootZ],
      [s.rootX * 0.95, 1.47, s.rootZ + 0.08],
      [s.x * 0.92, 1.82, s.z - 0.08],
      [s.x, s.y, s.z],
    ]);

    const neck = b.chain(`neck${s.key}`, neckPath, {
      parent: torso.tip!,
      names: [`neck${s.key}0`, `neck${s.key}1`, `neck${s.key}2`, `head${s.key}`],
      role: "neck",
    });
    const head = neck.tip!;
    head.userData.role = "head";
    const jaw = b.joint(`jaw${s.key}`, {
      parent: head!,
      at: [s.x, s.y - 0.13 * s.sx, s.z + 0.18 * s.sx],
      dir: [0, -0.25, 1],
      role: "jaw",
    });
    heads.push(head);
    jaws.push(jaw);
  }

  // Main organic masses.
  const bodyPaint = PALETTE.hide;
  const torsoSweep = b.sweep(torso, (t: number) => 0.43 + 0.07 * Math.sin(t * Math.PI), {
    color: bodyPaint,
    section: "box",
    sides: 8,
    name: "bodyArmor",
  });

  b.sweep(torso, (t: number) => 0.30 + 0.03 * t, {
    color: PALETTE.belly,
    shift: [0, -0.18],
    section: "box",
    name: "belly",
  });

  b.sweep(tail, [0.30, 0.045], {
    color: PALETTE.hideDark,
    section: "box",
    name: "tail",
  });

  for (const [key, chain] of Object.entries(legChains)) {
    b.sweep(chain, [0.16, 0.105, 0.08, 0.065], {
      color: PALETTE.hideLight,
      section: "box",
      name: `${key}Leg`,
    });
  }

  for (const s of headSpecs) {
    const neckName = `neck${s.key}`;
    const head = heads[headSpecs.indexOf(s)];
    b.sweep(
      catmull([
        [s.rootX, 1.16, s.rootZ],
        [s.rootX * 0.95, 1.47, s.rootZ + 0.08],
        [s.x * 0.92, 1.82, s.z - 0.08],
        [s.x, s.y, s.z],
      ]),
      [0.20 * s.sx, 0.12 * s.sx],
      { color: PALETTE.hideLight, section: "box", name: `${neckName}Armor` },
    );
    headAssembly(b, head, jaws[headSpecs.indexOf(s)], new THREE.Vector3(s.x, s.y, s.z), s.x >= 0 ? 1 : -1, `head${s.key}`, s.sx);
  }

  // Heavy dorsal plates and body armor ridges, intentionally leaving a broad clean flank for Stage 2.
  for (let i = 0; i < 5; i++) {
    const z = -0.42 + i * 0.23;
    b.spike(
      [0, 1.34 + Math.sin(i * 0.7) * 0.02, z],
      [0, 1.62 + (i === 3 ? 0.10 : 0), z - 0.02],
      null,
      0.09,
      { color: PALETTE.boneDark, bone: torso.joints[2], name: `dorsalSpine${i}` },
    );
  }

  // Bronze collar blocks at the base of the hydra's neck fan.
  for (const x of [-0.52, -0.26, 0, 0.26, 0.52]) {
    box(b, PALETTE.bronze, [x, 1.28, 0.47], [0.20, 0.18, 0.16], torso.joints[2], "neckArmor");
  }

  // Feet and broad knuckle pads.
  for (const [key, chain] of Object.entries(legChains)) {
    const end = chain.tip.at;
    sphere(b, PALETTE.hideDark, end, [0.22, 0.13, 0.28], chain.tip, `${key}Foot`, 8);
    for (let i = -1; i <= 1; i++) {
      const x = end.x + i * 0.085;
      b.spike(
        [x, 0.15, end.z + 0.15],
        [x, 0.11, end.z + 0.34],
        null,
        0.035,
        { color: PALETTE.claw, bone: chain.tip, name: `${key}Claw${i}` },
      );
    }
  }

  // A few large, readable iron plates on the torso, with explicit clear central flank.
  box(b, PALETTE.iron, [0.48, 1.02, 0.18], [0.20, 0.42, 0.48], hips, "bodyArmor");
  box(b, PALETTE.iron, [-0.48, 1.02, 0.18], [0.20, 0.42, 0.48], hips, "bodyArmor");
  box(b, PALETTE.bronze, [0, 1.27, 0.39], [0.42, 0.18, 0.10], torso.joints[2], "neckArmor");

  for (const add of STAGE2) add(b);
  return b.root;
}
