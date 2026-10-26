import * as THREE from "three";
import { type Builder, type ColorInput, createBuilder, catmull, limb, spiral, frame, paint } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";

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

const fract = (v: number) => v - Math.floor(v);

const BODY_SCARS = paint((p, n, s) => {
  const angle = ((s[1] % 360) + 360) % 360;
  const flank = Math.abs(p.x) > 0.22 && Math.abs(p.x) < 0.64 && p.y < 1.32;
  const rump = p.z < -0.32 && Math.abs(p.x) < 0.55;
  const slashPhase = fract(p.z * 3.1 + p.y * 1.7 + angle / 180);
  const slash = Math.abs(slashPhase - 0.5);
  const broadPhase = fract(p.z * 1.45 - p.y * 0.8 + angle / 250);
  const broad = Math.abs(broadPhase - 0.5);

  if ((flank || rump) && slash < 0.045) return "#111416";
  if ((flank || rump) && slash < 0.105) return "#454443";
  if (broad < 0.18 && n.y < 0.55) return "#303536";
  return n.y < -0.18 ? "#202324" : PALETTE.hide;
});

const BELLY_PATTERN = paint((p, n, s) => {
  const angle = ((s[1] % 360) + 360) % 360;
  const bellyFacing = Math.abs(angle - 180) < 92 || n.y < -0.28;
  const segment = fract(s[0] * 12.5 + p.x * 0.7);
  const seam = segment < 0.075 || segment > 0.94;
  const offset = Math.sin(p.z * 8.5 + p.x * 3.2) * 0.035;

  if (bellyFacing && seam) return "#393735";
  if (bellyFacing && segment > 0.16 + offset && segment < 0.82 + offset) return "#81776a";
  return "#625a50";
});

const HEAD_MARKINGS = paint((p, n) => {
  const front = n.z > 0.28;
  const brow = p.y > 2.18 && p.y < 2.70;
  const cheek = p.y > 1.98 && p.y < 2.42;
  const stripe = Math.abs(Math.sin(p.x * 25 + p.y * 5.5 + p.z * 2.2)) > 0.78;
  const ridge = Math.abs(Math.sin(p.x * 15 - p.y * 8 + p.z * 3.5)) > 0.88;

  if (front && ((brow && stripe) || (cheek && ridge))) return "#8f2723";
  if (front && brow && Math.abs(Math.sin(p.x * 11 + p.z * 4)) > 0.91) return "#c14a32";
  return PALETTE.hideLight;
});

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
    HEAD_MARKINGS,
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
    ["L", 1, -0.38, -0.38],
    ["R", -1, -0.38, -0.38],
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
      parent: torso.tip ?? undefined,
      names: [`neck${s.key}0`, `neck${s.key}1`, `neck${s.key}2`, `head${s.key}`],
      role: "neck",
    });
    const head = neck.tip!;
    head.userData.role = "head";
    const jaw = b.joint(`jaw${s.key}`, {
      parent: head,
      at: [s.x, s.y - 0.13 * s.sx, s.z + 0.18 * s.sx],
      dir: [0, -0.25, 1],
      role: "jaw",
    });
    heads.push(head);
    jaws.push(jaw);
  }

  // Main organic masses.
  const torsoSweep = b.sweep(torso, (t: number) => 0.43 + 0.07 * Math.sin(t * Math.PI), {
    color: BODY_SCARS,
    section: "box",
    sides: 8,
    name: "bodyArmor",
  });

  b.sweep(torso, (t: number) => 0.30 + 0.03 * t, {
    color: BELLY_PATTERN,
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
    const neck = (torso as any).joints
      ? undefined
      : undefined;
    // Locate the already-created chain through its public root hierarchy by using the named head bone.
    const head = heads[headSpecs.indexOf(s)];
    b.sweep(
      catmull([
        [s.rootX, 1.16, s.rootZ],
        [s.rootX * 0.95, 1.47, s.rootZ + 0.08],
        [s.x * 0.92, 1.82, s.z - 0.08],
        [s.x, s.y, s.z],
      ]),
      [0.20 * s.sx, 0.12 * s.sx],
      { color: PALETTE.hideLight, bone: head, section: "box", name: `${neckName}Armor` },
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addCrownSpines(b: Builder) {
  const IRON = PALETTE.ironDark;
  const IRON_EDGE = PALETTE.iron;
  const BRONZE = PALETTE.bronze;
  const BRONZE_HI = PALETTE.bronzeLight;
  const BONE = "headC";

  const spine = (
    x: number,
    rootY: number,
    height: number,
    width: number,
    lean: number,
    name: string,
  ) => {
    const root = new THREE.Vector3(x, rootY, 0.77);

    const outline: [number, number, "sharp"][] = [
      [-width * 0.58, 0, "sharp"],
      [width * 0.58, 0, "sharp"],
      [width * 0.46, height * 0.32, "sharp"],
      [width * 0.18 + lean * 0.45, height * 0.78, "sharp"],
      [lean, height, "sharp"],
      [-width * 0.10 + lean * 0.72, height * 0.72, "sharp"],
      [-width * 0.52, height * 0.30, "sharp"],
    ];

    const blade = b.extrude(outline, {
      at: root,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.105, 0.055],
      bevel: 0.012,
      smoothing: 0,
      color: IRON,
      bone: BONE,
      name,
      group: "crownSpines",
    });

    // A raised bronze spine running up the face makes the broad slab read as forged armor.
    b.sweep(
      [
        blade.local([0, 0.045, 0.062]),
        blade.local([lean * 0.35, height * 0.34, 0.062]),
        blade.local([lean * 0.72, height * 0.72, 0.062]),
        blade.local([lean, height * 0.91, 0.062]),
      ],
      0.012,
      {
        color: BRONZE_HI,
        caps: { start: "round", end: "point" },
        bone: BONE,
        name: `${name}Ridge`,
        section: { ngon: 5 },
      },
    );

    // Dark inset notch on each blade.
    b.extrude(
      [
        [-width * 0.16, height * 0.17, "sharp"],
        [width * 0.16, height * 0.17, "sharp"],
        [width * 0.09, height * 0.27, "sharp"],
        [-width * 0.08, height * 0.29, "sharp"],
      ],
      {
        at: root.clone().add(new THREE.Vector3(0, 0, 0.066)),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: PALETTE.hideDark,
        bone: BONE,
        name: `${name}Notch`,
      },
    );

    // Bronze collar stud at the root, seated slightly into the blade.
    b.part(new THREE.CylinderGeometry(0.046, 0.052, 0.026, 8), BRONZE, {
      at: root.clone().add(new THREE.Vector3(0, 0.025, 0.073)),
      dir: [0, 0, 1],
      axis: "y",
      bone: BONE,
      name: `${name}RootStud`,
      flat: true,
    });

    b.part(new THREE.SphereGeometry(0.025, 7, 5), BRONZE_HI, {
      at: root.clone().add(new THREE.Vector3(0, 0.025, 0.094)),
      bone: BONE,
      name: `${name}StudCap`,
      flat: true,
    });

    return blade;
  };

  // Three uneven blades: the central one is tallest, with the side blades hooked outward.
  spine(-0.245, 2.69, 0.48, 0.22, -0.075, "s21CrownL");
  spine(0, 2.67, 0.62, 0.27, 0.015, "s21CrownC");
  spine(0.245, 2.69, 0.51, 0.22, 0.082, "s21CrownR");

  // Forged bronze base bar tying the three crown plates together behind the skull.
  b.frustumBox(
    [-0.36, 2.70, 0.75],
    [0.36, 2.70, 0.75],
    [0.105, 0.12],
    [0.085, 0.10],
    {
      color: BRONZE,
      bone: BONE,
      section: "box",
      name: "s21CrownBaseBar",
    },
  );

  for (const x of [-0.30, -0.15, 0.15, 0.30]) {
    b.part(new THREE.CylinderGeometry(0.027, 0.032, 0.032, 8), BRONZE_HI, {
      at: [x, 2.715, 0.875],
      dir: [0, 0, 1],
      axis: "y",
      bone: BONE,
      name: "s21CrownRivet",
      flat: true,
    });
  }

  // Small outward-facing iron teeth at the ends of the side blades.
  b.spike([-0.30, 2.83, 0.79], [-0.42, 2.91, 0.75], null, 0.035, {
    color: IRON_EDGE,
    bone: BONE,
    name: "s21CrownHookL",
  });
  b.spike([0.30, 2.83, 0.79], [0.42, 2.91, 0.75], null, 0.035, {
    color: IRON_EDGE,
    bone: BONE,
    name: "s21CrownHookR",
  });
}
    return addCrownSpines;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addNeckArmor(b: Builder) {
  const BONE = "hips";
  const bronze = PALETTE.bronze;
  const bronzeLight = PALETTE.bronzeLight;
  const iron = PALETTE.iron;
  const ironDark = PALETTE.ironDark;
  const edge = PALETTE.ironEdge;

  const scaleOutline: [number, number, "sharp"][] = [
    [-0.12, -0.105, "sharp"],
    [0.12, -0.105, "sharp"],
    [0.145, 0.025, "sharp"],
    [0.075, 0.115, "sharp"],
    [-0.075, 0.115, "sharp"],
    [-0.145, 0.025, "sharp"],
  ];

  const smallScaleOutline: [number, number, "sharp"][] = [
    [-0.085, -0.075, "sharp"],
    [0.085, -0.075, "sharp"],
    [0.105, 0.015, "sharp"],
    [0.045, 0.085, "sharp"],
    [-0.045, 0.085, "sharp"],
    [-0.105, 0.015, "sharp"],
  ];

  const plate = (
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    row: number,
    index: number,
  ) => {
    const sx = width / 0.29;
    const sy = height / 0.23;

    b.extrude(scaleOutline, {
      at: [x, y, z - 0.018],
      x: [sx, 0, 0],
      y: [0, sy, 0],
      thickness: 0.055,
      bevel: 0.008,
      smoothing: 0,
      color: ironDark,
      bone: BONE,
      name: `s22NeckBacking${row}_${index}`,
      group: "neckArmor",
    });

    b.extrude(smallScaleOutline, {
      at: [x, y + 0.012, z + 0.015],
      x: [sx, 0, 0],
      y: [0, sy, 0],
      thickness: 0.032,
      bevel: 0.006,
      smoothing: 0,
      color: row === 1 ? bronzeLight : bronze,
      bone: BONE,
      name: `s22BronzeScale${row}_${index}`,
      group: "neckArmor",
    });

    const rivetY = y + height * 0.36;
    for (const side of [-1, 1]) {
      b.part(
        new THREE.SphereGeometry(0.022, 7, 5),
        edge,
        {
          at: [x + side * width * 0.28, rivetY, z + 0.041],
          bone: BONE,
          scale: [1, 0.8, 0.42],
          name: `s22Rivet${row}_${index}_${side}`,
          group: "neckArmor",
          flat: true,
        },
      );
    }
  };

  // Three staggered collars make a heavy armored fan around the five neck roots.
  const rows = [
    {
      y: 1.285,
      z: 0.555,
      xs: [-0.62, -0.31, 0, 0.31, 0.62],
      widths: [0.24, 0.25, 0.27, 0.25, 0.24],
    },
    {
      y: 1.445,
      z: 0.595,
      xs: [-0.47, -0.16, 0.16, 0.47],
      widths: [0.28, 0.29, 0.29, 0.28],
    },
    {
      y: 1.61,
      z: 0.565,
      xs: [-0.30, 0, 0.30],
      widths: [0.25, 0.30, 0.25],
    },
  ];

  rows.forEach((row, r) => {
    row.xs.forEach((x, i) => {
      plate(x, row.y, row.z, row.widths[i], r === 0 ? 0.19 : 0.17, r, i);
    });
  });

  // Dark side-wrap plates turn the front scale fan into a believable collar.
  const sideOutline: [number, number, "sharp"][] = [
    [-0.09, -0.17, "sharp"],
    [0.10, -0.13, "sharp"],
    [0.13, 0.09, "sharp"],
    [0.03, 0.18, "sharp"],
    [-0.10, 0.08, "sharp"],
  ];

  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = side * (0.73 + i * 0.055);
      const y = 1.30 + i * 0.16;
      b.extrude(sideOutline, {
        at: [x, y, 0.43],
        x: [0, 0, side],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.007,
        color: i === 1 ? bronze : iron,
        bone: BONE,
        name: `s22SideCollar${side}_${i}`,
        group: "neckArmor",
      });

      b.part(
        new THREE.CylinderGeometry(0.026, 0.026, 0.045, 8),
        bronzeLight,
        {
          at: [x + side * 0.035, y + 0.065, 0.445],
          bone: BONE,
          dir: [side, 0, 0],
          scale: [1, 1, 0.7],
          name: `s22SideRivet${side}_${i}`,
          group: "neckArmor",
          flat: true,
        },
      );
    }
  }

  // Reinforced lower collar rail, kept low so it does not block the jaw hinges.
  b.rod(
    [-0.78, 1.18, 0.54],
    [0.78, 1.18, 0.54],
    0.035,
    bronze,
    {
      bone: BONE,
      section: { ngon: 6 },
      caps: "flat",
      name: "s22LowerBronzeRail",
      group: "neckArmor",
    },
  );

  b.rod(
    [-0.72, 1.205, 0.575],
    [0.72, 1.205, 0.575],
    0.018,
    edge,
    {
      bone: BONE,
      section: { ngon: 6 },
      caps: "flat",
      name: "s22LowerIronEdge",
      group: "neckArmor",
    },
  );

  // Four battered wedge tabs break up the perfect manufactured rhythm.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const base = new THREE.Vector3(side * (0.64 + i * 0.17), 1.22 + i * 0.18, 0.59);
      const tip = new THREE.Vector3(side * (0.78 + i * 0.17), 1.16 + i * 0.18, 0.60);
      b.spike(base, tip, null, 0.045, {
        color: iron,
        bone: BONE,
        name: `s22BatteredTab${side}_${i}`,
        group: "neckArmor",
      });
    }
  }

  // A central raised boss visually locks the five plates together without entering the throat.
  b.part(
    new THREE.CylinderGeometry(0.105, 0.13, 0.07, 8),
    bronzeLight,
    {
      at: [0, 1.555, 0.625],
      bone: BONE,
      dir: [0, 0, 1],
      scale: [1, 1, 0.72],
      name: "s22CentralCollarBoss",
      group: "neckArmor",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.035, 7, 5),
    PALETTE.claw,
    {
      at: [0, 1.555, 0.685],
      bone: BONE,
      scale: [1, 0.7, 0.5],
      name: "s22CentralBossStud",
      group: "neckArmor",
      flat: true,
    },
  );
}
    return addNeckArmor;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addLeftShoulder(b: Builder) {
  const IRON = PALETTE.iron;
  const IRON_DARK = PALETTE.ironDark;
  const EDGE = PALETTE.ironEdge;
  const BRONZE = PALETTE.bronze;
  const BRONZE_LIGHT = PALETTE.bronzeLight;
  const RIVET = PALETTE.boneDark;

  const leftBone = "shoulderL";
  const rightBone = "shoulderR";

  const plate = (
    bone: string,
    at: [number, number, number],
    size: [number, number, number],
    name: string,
    color = IRON,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone,
      at,
      dir: bone === leftBone ? [1, 0.2, 0] : [-1, 0.2, 0],
      axis: "y",
      name,
      flat: true,
    });

  const rivet = (
    bone: string,
    at: [number, number, number],
    radius: number,
    name: string,
    color = BRONZE_LIGHT,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      bone,
      at,
      name,
      flat: true,
    });

  const spike = (
    bone: string,
    base: [number, number, number],
    tip: [number, number, number],
    radius: number,
    name: string,
  ) =>
    b.spike(base, tip, null, radius, {
      bone,
      color: EDGE,
      caps: { start: "round", end: "point" },
      name,
    });

  // LEFT: broad, layered pauldron. The main slab is slightly tilted upward,
  // while the lower lames overlap it like battered scale armor.
  plate(leftBone, [0.765, 1.10, 0.28], [0.16, 0.51, 0.48], "leftShoulderCore");
  plate(leftBone, [0.835, 1.20, 0.28], [0.09, 0.40, 0.42], "leftShoulderOuter");
  plate(leftBone, [0.855, 1.01, 0.30], [0.075, 0.28, 0.46], "leftShoulderLower");
  plate(leftBone, [0.855, 0.86, 0.29], [0.07, 0.16, 0.38], "leftShoulderLame");

  // Raised upper rim and a dark inset band make the armor read as thick metal.
  plate(leftBone, [0.866, 1.31, 0.28], [0.055, 0.075, 0.43], "leftShoulderRim", EDGE);
  plate(leftBone, [0.884, 1.05, 0.28], [0.025, 0.20, 0.34], "leftShoulderInset", IRON_DARK);

  // Bronze reinforcement bars across the lower and rear edges.
  plate(leftBone, [0.891, 0.95, 0.10], [0.026, 0.055, 0.31], "leftBronzeBandA", BRONZE);
  plate(leftBone, [0.891, 1.08, 0.47], [0.026, 0.055, 0.27], "leftBronzeBandB", BRONZE);
  plate(leftBone, [0.891, 1.22, 0.28], [0.026, 0.045, 0.33], "leftBronzeCrown", BRONZE_LIGHT);

  // Four hammered rivets along the outer edge.
  rivet(leftBone, [0.922, 1.28, 0.10], 0.035, "leftRivet0");
  rivet(leftBone, [0.922, 1.28, 0.46], 0.035, "leftRivet1");
  rivet(leftBone, [0.922, 0.94, 0.08], 0.029, "leftRivet2");
  rivet(leftBone, [0.922, 0.94, 0.47], 0.029, "leftRivet3");

  // A bronze spiral sigil lies on the exposed outer face, in the Y/Z plane.
  const spiralCenter = new THREE.Vector3(0.925, 1.10, 0.28);
  const spiralStart = new THREE.Vector3(0.925, 1.10, 0.39);
  const sigil = spiral(
    spiralCenter,
    spiralStart,
    [1, 0, 0],
    { turns: 1.25, r1: 0.018, pitch: 0.0 },
  );
  b.sweep(sigil, 0.014, {
    bone: leftBone,
    color: BRONZE_LIGHT,
    sides: 6,
    caps: "round",
    name: "leftBronzeSpiral",
  });

  // Two deliberately blunt spikes crown the asymmetric shoulder.
  spike(
    leftBone,
    [0.89, 1.33, 0.10],
    [1.10, 1.51, 0.08],
    0.075,
    "leftShoulderSpikeFront",
  );
  spike(
    leftBone,
    [0.89, 1.30, 0.47],
    [1.09, 1.43, 0.55],
    0.07,
    "leftShoulderSpikeBack",
  );

  // Small collar hinge beneath the pauldron, tying it into the body.
  b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.20, 8), IRON_DARK, {
    bone: leftBone,
    at: [0.62, 0.91, 0.28],
    dir: [1, 0, 0],
    name: "leftShoulderHinge",
    flat: true,
  });
  rivet(leftBone, [0.735, 0.91, 0.28], 0.035, "leftHingeRivet", BRONZE);

  // RIGHT: smaller, visibly asymmetrical plate with a sharper silhouette.
  plate(rightBone, [-0.755, 1.10, 0.28], [0.14, 0.40, 0.40], "rightShoulderCore");
  plate(rightBone, [-0.815, 1.18, 0.28], [0.075, 0.28, 0.34], "rightShoulderOuter");
  plate(rightBone, [-0.825, 0.97, 0.30], [0.06, 0.22, 0.36], "rightShoulderLower");
  plate(rightBone, [-0.842, 1.30, 0.28], [0.045, 0.055, 0.35], "rightShoulderRim", EDGE);
  plate(rightBone, [-0.858, 1.06, 0.28], [0.022, 0.17, 0.28], "rightShoulderInset", IRON_DARK);

  // Three large bronze rivets form a triangular mark on the smaller plate.
  rivet(rightBone, [-0.895, 1.27, 0.28], 0.034, "rightRivetTop");
  rivet(rightBone, [-0.895, 1.05, 0.12], 0.031, "rightRivetFront");
  rivet(rightBone, [-0.895, 1.05, 0.44], 0.031, "rightRivetBack");

  // A narrow bronze slash and two dark fasteners add asymmetry without obscuring the plate.
  plate(rightBone, [-0.887, 1.16, 0.28], [0.025, 0.035, 0.25], "rightBronzeSlash", BRONZE);
  rivet(rightBone, [-0.90, 1.18, 0.08], 0.018, "rightDarkFastener", RIVET);
  rivet(rightBone, [-0.90, 1.18, 0.48], 0.018, "rightDarkFastener2", RIVET);

  // Short rear flange on both pauldrons, giving the shoulder armor a hooked silhouette.
  plate(leftBone, [0.79, 1.12, 0.54], [0.12, 0.25, 0.10], "leftRearFlange", IRON_DARK);
  plate(rightBone, [-0.79, 1.11, 0.53], [0.10, 0.21, 0.09], "rightRearFlange", IRON_DARK);
}
    return addLeftShoulder;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addHeadCrest(b: Builder) {
  const iron = metal("iron", {
    tarnish: 0.72,
    verdigris: 0.08,
    polish: 0.18,
    size: 0.045,
    seed: 241,
  });
  const blued = metal("blued", {
    tarnish: 0.42,
    polish: 0.28,
    size: 0.035,
    seed: 242,
  });

  const bone = "headC";
  const at: [number, number, number] = [0, 2.72, 1.2];

  // The main crown is a deliberately angular three-lobed silhouette. It rises above
  // the brow and leans subtly backward, away from the eyes.
  const crown = b.extrude(
    [
      [-0.175, 0],
      [-0.145, 0.10],
      [-0.115, 0.15],
      [-0.095, 0.39],
      [-0.045, 0.30],
      [0.0, 0.56, "sharp"],
      [0.045, 0.30],
      [0.095, 0.39],
      [0.115, 0.15],
      [0.145, 0.10],
      [0.175, 0],
    ],
    {
      at,
      x: [1, 0, 0],
      y: [0, 0.985, -0.17],
      thickness: [0.075, 0.045],
      bevel: 0.008,
      smoothing: 0,
      color: iron,
      bone,
      name: "s24CrownPlate",
      group: "headCrest",
    },
  );

  // A second, narrower rear fin gives the crest a layered war-crown profile.
  b.extrude(
    [
      [-0.105, 0.025],
      [-0.075, 0.18],
      [-0.048, 0.29],
      [0, 0.46, "sharp"],
      [0.052, 0.27],
      [0.082, 0.17],
      [0.105, 0.025],
    ],
    {
      at: [0, 2.735, 1.165],
      x: [1, 0, 0],
      y: [0, 0.97, -0.24],
      thickness: [0.055, 0.022],
      bevel: 0.006,
      smoothing: 0,
      color: blued,
      bone,
      name: "s24CrownRearPlate",
      group: "headCrest",
    },
  );

  // Side flanges frame the brow and make the crest read from a three-quarter view.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [side * 0.055, 0.06],
        [side * 0.115, 0.19],
        [side * 0.135, 0.23, "sharp"],
        [side * 0.155, 0.09],
        [side * 0.17, 0],
      ],
      {
        at: [0, 2.725, 1.18],
        x: [side, 0, 0],
        y: [0, 1, -0.12],
        thickness: 0.045,
        bevel: 0.005,
        smoothing: 0,
        color: iron,
        bone,
        name: `s24CrownFlange${side > 0 ? "L" : "R"}`,
        group: "headCrest",
      },
    );
  }

  // Jagged iron crown teeth projecting from the upper silhouette.
  const toothData = [
    { x: -0.13, y: 0.15, h: 0.19, r: 0.032 },
    { x: -0.078, y: 0.28, h: 0.13, r: 0.026 },
    { x: 0.0, y: 0.46, h: 0.12, r: 0.034 },
    { x: 0.078, y: 0.28, h: 0.13, r: 0.026 },
    { x: 0.13, y: 0.15, h: 0.19, r: 0.032 },
  ];

  for (let i = 0; i < toothData.length; i++) {
    const d = toothData[i];
    const base = new THREE.Vector3(d.x, at[1] + d.y, at[2] - 0.01);
    const tip = new THREE.Vector3(
      d.x * 1.05,
      at[1] + d.y + d.h,
      at[2] - 0.07 - Math.abs(d.x) * 0.12,
    );

    b.spike(base, tip, null, d.r, {
      color: i === 2 ? blued : iron,
      bone,
      caps: { start: "flat", end: "point" },
      name: `s24CrownTooth${i}`,
      group: "headCrest",
    });
  }

  // Bronze rivets along the brow and at each flange root.
  const rivetGeometry = new THREE.SphereGeometry(0.018, 7, 5);
  const rivets = [
    [-0.135, 0.055, 0.045],
    [-0.068, 0.075, 0.052],
    [0, 0.088, 0.058],
    [0.068, 0.075, 0.052],
    [0.135, 0.055, 0.045],
    [-0.125, 0.17, 0.03],
    [0.125, 0.17, 0.03],
  ] as const;

  for (let i = 0; i < rivets.length; i++) {
    const [x, y, z] = rivets[i];
    b.part(rivetGeometry, PALETTE.bronzeLight, {
      at: [at[0] + x, at[1] + y, at[2] + z],
      bone,
      scale: [1, 1, 0.58],
      name: `s24CrownRivet${i}`,
      group: "headCrest",
    });
  }

  // Raised dark crack lines: these sit on the front-facing plane and break up the
  // otherwise simple primitive silhouette into battered forged metal.
  const crackRoutes: [THREE.Vector3, THREE.Vector3, number][] = [
    [
      new THREE.Vector3(-0.02, 2.91, 1.246),
      new THREE.Vector3(-0.055, 3.04, 1.224),
      0.009,
    ],
    [
      new THREE.Vector3(-0.055, 3.04, 1.224),
      new THREE.Vector3(-0.028, 3.12, 1.208),
      0.007,
    ],
    [
      new THREE.Vector3(0.045, 2.87, 1.25),
      new THREE.Vector3(0.075, 2.98, 1.228),
      0.008,
    ],
    [
      new THREE.Vector3(0.075, 2.98, 1.228),
      new THREE.Vector3(0.052, 3.075, 1.208),
      0.006,
    ],
    [
      new THREE.Vector3(-0.115, 2.82, 1.235),
      new THREE.Vector3(-0.145, 2.90, 1.217),
      0.006,
    ],
  ];

  for (let i = 0; i < crackRoutes.length; i++) {
    const [a, c, radius] = crackRoutes[i];
    b.rod(a, c, radius, {
      color: PALETTE.hideDark,
      bone,
      caps: "flat",
      name: `s24CrownCrack${i}`,
      group: "headCrest",
    });
  }

  // A small central bronze boss makes the brow ornament feel forged rather than
  // merely painted on.
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.028, 8), PALETTE.bronze, {
    at: [0, 2.795, 1.252],
    dir: [0, 0.2, 1],
    axis: "y",
    bone,
    name: "s24CrownBoss",
    group: "headCrest",
  });

  // Two short outward hooks at the base echo the hydra's horns and visually lock
  // the crown into the brow ridge.
  for (const side of [-1, 1]) {
    const hookPath = [
      [side * 0.125, 2.765, 1.235],
      [side * 0.18, 2.80, 1.21],
      [side * 0.205, 2.86, 1.17],
    ] as [number, number, number][];

    b.sweep(hookPath, [0.026, 0.012], {
      color: iron,
      bone,
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      name: `s24CrownHook${side > 0 ? "L" : "R"}`,
      group: "headCrest",
    });
  }

  return crown;
}
    return addHeadCrest;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addJawFangs(b: Builder) {
  const heads = [
    { key: "C", x: 0, y: 2.30, z: 0.88, scale: 1.16 },
    { key: "L", x: 0.62, y: 2.13, z: 0.76, scale: 0.94 },
    { key: "R", x: -0.62, y: 2.13, z: 0.76, scale: 0.94 },
    { key: "FL", x: 0.84, y: 2.00, z: 0.66, scale: 0.82 },
    { key: "FR", x: -0.84, y: 2.00, z: 0.66, scale: 0.82 },
  ] as const;

  const MOUTH = "#5a1719";
  const MOUTH_DARK = "#2b090d";
  const GUM = "#8e2427";
  const FANG = "#d1c29d";
  const FANG_DARK = "#8e795d";
  const INK = "#171214";

  for (const h of heads) {
    const jaw = `jaw${h.key}`;
    const s = h.scale;
    const y = h.y;
    const z = h.z;

    // A deep, inset mouth plate gives the open jaws a readable dark cavity.
    b.part(
      new THREE.BoxGeometry(0.39 * s, 0.105 * s, 0.035 * s),
      MOUTH_DARK,
      {
        bone: jaw,
        at: [h.x, y - 0.205 * s, z + 0.405 * s],
        name: `s25MouthPlate${h.key}`,
        flat: true,
      },
    );

    // Thick red gum bar, visible behind the individual ivory teeth.
    b.rod(
      [h.x - 0.175 * s, y - 0.145 * s, z + 0.418 * s],
      [h.x + 0.175 * s, y - 0.145 * s, z + 0.418 * s],
      0.027 * s,
      {
        bone: jaw,
        color: GUM,
        caps: "round",
        section: { ngon: 6 },
        name: `s25Gum${h.key}`,
      },
    );

    // A broad lower lip sill makes the lower jaw read as a separate hinged piece.
    b.rod(
      [h.x - 0.185 * s, y - 0.225 * s, z + 0.415 * s],
      [h.x + 0.185 * s, y - 0.225 * s, z + 0.415 * s],
      0.026 * s,
      {
        bone: jaw,
        color: MOUTH,
        caps: "round",
        section: { ngon: 6 },
        name: `s25LowerLip${h.key}`,
      },
    );

    // Seven alternating, oversized teeth across each mouth.
    const teeth = [-3, -2, -1, 0, 1, 2, 3];
    for (const i of teeth) {
      const u = i / 3;
      const long = Math.abs(i) % 2 === 0;
      const width = 0.043 * s;
      const baseY = y - 0.135 * s;
      const tipY = baseY - (long ? 0.235 : 0.16) * s;
      const toothZ = z + (0.422 + (i % 2 === 0 ? 0.012 : -0.008)) * s;

      b.spike(
        [h.x + u * 0.155 * s, baseY, toothZ],
        [h.x + u * 0.155 * s, tipY, toothZ + 0.014 * s],
        null,
        width,
        {
          bone: jaw,
          color: long ? FANG : FANG_DARK,
          name: `s25Fang${h.key}${i + 3}`,
        },
      );

      // Small dark root collar keeps every tooth seated in the gum.
      b.part(
        new THREE.CylinderGeometry(width * 1.15, width * 1.05, 0.034 * s, 6),
        GUM,
        {
          bone: jaw,
          at: [h.x + u * 0.155 * s, baseY + 0.006 * s, toothZ],
          name: `s25ToothRoot${h.key}${i + 3}`,
          flat: true,
        },
      );
    }

    // Two pronounced saber tusks at the corners, angled slightly outward.
    for (const side of [-1, 1]) {
      const base = [
        h.x + side * 0.175 * s,
        y - 0.145 * s,
        z + 0.425 * s,
      ] as [number, number, number];

      const tip = [
        h.x + side * 0.215 * s,
        y - 0.405 * s,
        z + 0.448 * s,
      ] as [number, number, number];

      b.spike(base, tip, null, 0.058 * s, {
        bone: jaw,
        color: FANG,
        name: `s25CornerTusk${h.key}${side > 0 ? "L" : "R"}`,
      });

      // Dark cap at each tusk root, like a battered iron tooth socket.
      b.part(
        new THREE.CylinderGeometry(0.064 * s, 0.055 * s, 0.045 * s, 7),
        INK,
        {
          bone: jaw,
          at: [base[0], base[1] + 0.008 * s, base[2]],
          name: `s25TuskSocket${h.key}${side > 0 ? "L" : "R"}`,
          flat: true,
        },
      );
    }

    // Short lower-jaw crease lines beside the mouth plate, emphasizing the hinge.
    for (const side of [-1, 1]) {
      b.rod(
        [h.x + side * 0.19 * s, y - 0.19 * s, z + 0.345 * s],
        [h.x + side * 0.22 * s, y - 0.26 * s, z + 0.38 * s],
        0.012 * s,
        {
          bone: jaw,
          color: INK,
          caps: "flat",
          section: { ngon: 5 },
          name: `s25JawCrease${h.key}${side > 0 ? "L" : "R"}`,
        },
      );
    }
  }
}
    return addJawFangs;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addTailBlade(b: Builder) {
  const tailBone = "tail4";

  // Broad hooked executioner's blade fused to the very end of the tail.
  const bladeOutline: [number, number, "sharp"][] = [
    [-0.27, 0.03, "sharp"],
    [-0.34, 0.18, "sharp"],
    [-0.31, 0.48, "sharp"],
    [-0.19, 0.69, "sharp"],
    [0.02, 0.76, "sharp"],
    [0.20, 0.65, "sharp"],
    [0.28, 0.45, "sharp"],
    [0.24, 0.27, "sharp"],
    [0.13, 0.17, "sharp"],
    [0.08, 0.30, "sharp"],
    [0.00, 0.43, "sharp"],
    [-0.08, 0.48, "sharp"],
    [-0.14, 0.34, "sharp"],
    [-0.12, 0.18, "sharp"],
    [-0.04, 0.08, "sharp"],
  ];

  b.extrude(bladeOutline, {
    at: [0, 0.22, -2.04],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.065, 0.035],
    bevel: 0.018,
    smoothing: 0,
    color: PALETTE.ironDark,
    bone: tailBone,
    name: "s26TailExecutionerBlade",
    group: "tailBlade",
  });

  const bronzeEdge: [number, number, "sharp"][] = [
    [-0.205, 0.055, "sharp"],
    [-0.275, 0.21, "sharp"],
    [-0.245, 0.44, "sharp"],
    [-0.145, 0.62, "sharp"],
    [0.01, 0.68, "sharp"],
    [0.16, 0.58, "sharp"],
    [0.215, 0.42, "sharp"],
    [0.175, 0.30, "sharp"],
    [0.10, 0.25, "sharp"],
    [0.04, 0.40, "sharp"],
    [-0.045, 0.51, "sharp"],
    [-0.11, 0.44, "sharp"],
    [-0.08, 0.28, "sharp"],
    [-0.02, 0.16, "sharp"],
    [0.015, 0.10, "sharp"],
  ];

  b.extrude(bronzeEdge, {
    at: [0, 0.222, -2.045],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.012, 0.008],
    bevel: 0.006,
    smoothing: 0,
    color: PALETTE.bronzeLight,
    bone: tailBone,
    name: "s26TailBronzeEdge",
    group: "tailBlade",
  });

  b.sweep(
    catmull([
      [-0.03, 0.39, -1.94],
      [-0.03, 0.43, -1.99],
      [-0.03, 0.49, -2.02],
      [-0.03, 0.57, -2.02],
    ]),
    0.035,
    {
      color: PALETTE.bronze,
      bone: tailBone,
      section: { ngon: 6 },
      caps: "round",
      name: "s26TailBladeSpine",
      group: "tailBlade",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.115, 0.14, 0.13, 8),
    PALETTE.iron,
    {
      at: [0, 0.41, -1.88],
      dir: [0, 0, 1],
      bone: tailBone,
      name: "s26TailBladeSocket",
      group: "tailBlade",
      flat: true,
    },
  );

  for (const x of [-0.16, 0.16]) {
    b.part(
      new THREE.SphereGeometry(0.032, 7, 5),
      PALETTE.bronzeLight,
      {
        at: [x, 0.50, -2.018],
        bone: tailBone,
        name: `s26TailRivet${x > 0 ? "L" : "R"}`,
        group: "tailBlade",
        flat: true,
      },
    );
  }

  // Six oversized forward-hooked talons. The iron knuckles are deliberately
  // chunky, while each pale claw has a separate curved silhouette.
  const feet = [
    { side: "L", x: 0.54, bone: "footfrontL" },
    { side: "R", x: -0.54, bone: "footfrontR" },
  ];

  for (const foot of feet) {
    b.part(
      new THREE.BoxGeometry(0.30, 0.16, 0.22),
      PALETTE.ironDark,
      {
        at: [foot.x, 0.18, 0.45],
        bone: foot.bone,
        name: `s26${foot.side}ClawGauntlet`,
        group: "forelegClaws",
        flat: true,
      },
    );

    for (let i = -1; i <= 1; i++) {
      const x = foot.x + i * 0.095;
      const lift = Math.abs(i) * 0.018;
      const rootZ = 0.54 + (i === 0 ? 0.015 : 0);
      const tipZ = 0.86 - Math.abs(i) * 0.035;

      b.part(
        new THREE.CylinderGeometry(0.045, 0.055, 0.075, 7),
        PALETTE.iron,
        {
          at: [x, 0.20 + lift, rootZ - 0.025],
          dir: [0, 0, 1],
          bone: foot.bone,
          name: `s26${foot.side}ClawBase${i + 2}`,
          group: "forelegClaws",
          flat: true,
        },
      );

      b.sweep(
        catmull([
          [x, 0.205 + lift, rootZ],
          [x, 0.205 + lift, rootZ + 0.105],
          [x + (i * 0.018), 0.18 + lift, tipZ - 0.045],
          [x + (i * 0.026), 0.115 + lift, tipZ],
        ]),
        [0.040, 0.025, 0.010, 0.001],
        {
          color: PALETTE.claw,
          bone: foot.bone,
          section: { ngon: 6 },
          caps: { start: "round", end: "point" },
          name: `s26${foot.side}HookedClaw${i + 2}`,
          group: "forelegClaws",
        },
      );

      b.part(
        new THREE.SphereGeometry(0.018, 6, 4),
        PALETTE.boneDark,
        {
          at: [x, 0.225 + lift, rootZ + 0.025],
          bone: foot.bone,
          name: `s26${foot.side}ClawRivet${i + 2}`,
          group: "forelegClaws",
          flat: true,
        },
      );
    }
  }
}
    return addTailBlade;
  })(),
);
