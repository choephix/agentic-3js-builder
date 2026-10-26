import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
} from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "Crouched Cathedral Gargoyle",
  description:
    "A stylized gothic stone gargoyle crouched on a carved cathedral ledge, with heavy haunches, spread wings, horns, talons, fangs, and a snarling carved face.",
};

export const REQUESTS = [
  {
    id: "foreheadCrown",
    kind: "add",
    part: "head",
    what: "A gothic carved brow crown: three small pointed stone finials with chipped edges, centered above the forehead, dark slate with pale worn tips.",
    at: [0, 2.06, 0.72],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.5, 0.28, 0.24],
  },
  {
    id: "wingRibsL",
    kind: "add",
    part: "wingMembraneL",
    what: "Four raised gothic wing ribs on the left wing, following the wing fingers from shoulder to tips; charcoal stone ribs with light grey worn ridges.",
    at: [0.72, 1.72, 0.04],
    normal: [0.7, 0.35, 0],
    bone: "wingL1",
    room: [1.35, 0.75, 0.18],
  },
  {
    id: "wingRibsR",
    kind: "add",
    part: "wingMembraneR",
    what: "Four raised gothic wing ribs on the right wing, mirrored from the left, charcoal stone with pale chipped highlights.",
    at: [-0.72, 1.72, 0.04],
    normal: [-0.7, 0.35, 0],
    bone: "wingR1",
    room: [1.35, 0.75, 0.18],
  },
  {
    id: "chestRosette",
    kind: "add",
    part: "chest",
    what: "A large six-lobed cathedral rosette emblem carved into the upper chest, with a deep black recess, raised slate petals, and a small pale stone hub.",
    at: [0, 1.42, 0.47],
    normal: [0, 0.1, 1],
    bone: "chest",
    room: [0.46, 0.48, 0.12],
  },
  {
    id: "eyeGlowL",
    kind: "add",
    part: "head",
    what: "A tiny cold blue-violet magical ember seated deep in the left eye socket, surrounded by a dark carved socket rim.",
    at: [0.155, 1.91, 0.83],
    normal: [0.12, 0.05, 1],
    bone: "head",
    room: [0.12, 0.12, 0.08],
  },
  {
    id: "eyeGlowR",
    kind: "add",
    part: "head",
    what: "A tiny cold blue-violet magical ember seated deep in the right eye socket, surrounded by a dark carved socket rim.",
    at: [-0.155, 1.91, 0.83],
    normal: [-0.12, 0.05, 1],
    bone: "head",
    room: [0.12, 0.12, 0.08],
  },
  {
    id: "ledgeGargoyleScroll",
    kind: "add",
    part: "ledge",
    what: "A compact gothic stone scroll ornament at the front corner of the ledge: curled blocky volutes and a small pointed trefoil, simpler than the gargoyle.",
    at: [0.78, 0.27, 0.63],
    normal: [0, 0.2, 1],
    bone: null,
    room: [0.42, 0.38, 0.22],
  },
  {
    id: "talonClaws",
    kind: "add",
    part: "footL",
    what: "Three oversized hooked talon caps on the left forefoot, angular black stone claws with pale worn tips, planted firmly on the ledge.",
    at: [0.48, 0.27, 0.61],
    normal: [0, 0, 1],
    bone: "ankleL",
    room: [0.35, 0.22, 0.48],
  },
  {
    id: "talonClawsR",
    kind: "add",
    part: "footR",
    what: "Three oversized hooked talon caps on the right forefoot, mirrored angular black stone claws with pale worn tips.",
    at: [-0.48, 0.27, 0.61],
    normal: [0, 0, 1],
    bone: "ankleR",
    room: [0.35, 0.22, 0.48],
  },
  {
    id: "stonePatina",
    kind: "texture",
    part: "body",
    what: "Paint the main body stone in two flat gothic slate tones: warm grey on upward planes, blue-black in recesses, with sparse pale lichen flecks and broad chipped wear on shoulders and spine.",
  },
  {
    id: "wingPatina",
    kind: "texture",
    part: "wingMembraneL",
    what: "Paint the left wing membrane as dark weathered basalt, with alternating charcoal panels and desaturated grey along the outer scalloped edge.",
  },
  {
    id: "wingPatinaR",
    kind: "texture",
    part: "wingMembraneR",
    what: "Paint the right wing membrane to match the left: dark basalt panels, blue-black recesses, and pale weathering on the outer edge.",
  },
  {
    id: "ledgeMasonry",
    kind: "texture",
    part: "ledge",
    what: "Paint the ledge as old cathedral masonry with broad rectangular ashlar blocks, black mortar seams, pale rain-worn top planes, and moss in the rear creases.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const STONE = "#747887";
const STONE_LIGHT = "#aeb2b8";
const STONE_DARK = "#343746";
const STONE_DEEP = "#1d202c";
const EDGE = "#c4c2b8";
const CLAW = "#242331";
const MOUTH = "#171520";
const EYE = "#b8a4ff";
const LEDGE = "#555967";
const MOSS = "#56634d";
const BRASS = "#8c8064";

function box(
  b: Builder,
  size: [number, number, number],
  at: [number, number, number],
  color: string,
  bone: any,
  name: string,
  bevel = 0,
) {
  const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
  if (bevel > 0) {
    const e = new THREE.EdgesGeometry(g);
    void e;
  }
  return b.part(g, color, { at, ...(bone ? { bone } : {}), name, flat: true });
}

function sphere(
  b: Builder,
  radius: number,
  at: [number, number, number],
  color: string,
  bone: any,
  name: string,
  seg = 8,
  rings = 6,
) {
  return b.part(
    new THREE.SphereGeometry(radius, seg, rings),
    color,
    { at, bone, name, flat: true },
  );
}

function claw(
  b: Builder,
  base: any,
  tip: [number, number, number],
  name: string,
) {
  return b.spike(base, tip, null, 0.045, {
    color: CLAW,
    caps: "point",
    name,
  });
}

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  // One root skeleton, then the major chains hang from it.
  const hips = b.joint("hips", {
    at: [0, 0.98, -0.22],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.98, -0.22],
    [0, 1.18, -0.04],
    [0, 1.38, 0.22],
    [0, 1.53, 0.43],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineBase", "spineMid", "chest", "neckBase"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 1.75, 0.57],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.68, 0.72],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const body = b.sweep(spine, (t) => 0.28 - 0.035 * t, {
    color: STONE,
    section: { ngon: 8 },
    sides: 8,
    name: "body",
    group: "body",
    sectors: [
      [-62, 62, STONE_LIGHT],
      [122, 238, STONE_DARK],
    ],
  });

  // Shoulder and haunch plates establish the carved, heavy silhouette.
  box(b, [0.72, 0.36, 0.46], [0, 1.25, 0.18], STONE, spine.joints[1], "shoulderMass");
  box(b, [0.58, 0.38, 0.5], [0, 1.01, -0.3], STONE_DARK, hips, "rumpMass");
  box(b, [0.43, 0.18, 0.38], [0, 1.49, 0.41], STONE_LIGHT, spine.joints[2], "chest", 0.01);

  // Hind legs: broad crouched thighs, knuckled ankles, planted feet.
  const legLPoints = limb(
    [0.29, 1.04, -0.24],
    [0.46, 0.29, 0.48],
    [0.42, 0.43, 0.28],
    [[0, 0, 1], [0, 0, -1]],
  );
  const legRPoints = limb(
    [-0.29, 1.04, -0.24],
    [-0.46, 0.29, 0.48],
    [0.42, 0.43, 0.28],
    [[0, 0, 1], [0, 0, -1]],
  );
  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.46, 0.2, 0.56],
  });
  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.46, 0.2, 0.56],
  });
  b.sweep(legL, [0.16, 0.12, 0.08], {
    color: STONE,
    section: { ngon: 7 },
    name: "legL",
    sectors: [[-65, 65, STONE_LIGHT], [125, 235, STONE_DARK]],
  });
  b.sweep(legR, [0.16, 0.12, 0.08], {
    color: STONE,
    section: { ngon: 7 },
    name: "legR",
    sectors: [[-65, 65, STONE_LIGHT], [125, 235, STONE_DARK]],
  });

  box(b, [0.34, 0.16, 0.42], [0.46, 0.26, 0.55], STONE_DARK, legL.tip, "footL");
  box(b, [0.34, 0.16, 0.42], [-0.46, 0.26, 0.55], STONE_DARK, legR.tip, "footR");

  for (const s of [1, -1]) {
    const foot = s > 0 ? legL.tip : legR.tip;
    claw(b, foot, [s * 0.58, 0.21, 0.78], `toe${s}A`);
    claw(b, foot, [s * 0.46, 0.21, 0.84], `toe${s}B`);
    claw(b, foot, [s * 0.34, 0.21, 0.75], `toe${s}C`);
    sphere(b, 0.065, [s * 0.46, 0.33, 0.48], STONE_LIGHT, foot, `ankleKnuckle${s}`);
  }

  // Short arms reach forward in the neutral crouched pose.
  const armL = b.chain(
    "armL",
    [
      [0.39, 1.43, 0.29],
      [0.57, 1.16, 0.55],
      [0.55, 0.86, 0.73],
      [0.5, 0.68, 0.86],
    ],
    {
      parent: spine.joints[2],
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
    },
  );
  const armR = b.chain(
    "armR",
    [
      [-0.39, 1.43, 0.29],
      [-0.57, 1.16, 0.55],
      [-0.55, 0.86, 0.73],
      [-0.5, 0.68, 0.86],
    ],
    {
      parent: spine.joints[2],
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
    },
  );
  b.sweep(armL, [0.1, 0.075, 0.04], {
    color: STONE,
    section: { ngon: 7 },
    name: "armL",
  });
  b.sweep(armR, [0.1, 0.075, 0.04], {
    color: STONE,
    section: { ngon: 7 },
    name: "armR",
  });

  for (const s of [1, -1]) {
    const hand = s > 0 ? armL.tip : armR.tip;
    claw(b, hand, [s * 0.57, 0.55, 1.05], `finger${s}A`);
    claw(b, hand, [s * 0.49, 0.51, 1.08], `finger${s}B`);
    claw(b, hand, [s * 0.41, 0.54, 1.02], `finger${s}C`);
    sphere(b, 0.07, [s * 0.5, 0.68, 0.86], STONE_LIGHT, hand, `palmKnuckle${s}`);
  }

  // Head, muzzle, cheek planes and a separate open jaw.
  sphere(b, 0.31, [0, 1.78, 0.58], STONE, head, "head", 12, 8);
  box(b, [0.42, 0.26, 0.28], [0, 1.72, 0.78], STONE_LIGHT, head, "muzzle");
  box(b, [0.56, 0.16, 0.22], [0, 1.91, 0.68], STONE_DARK, head, "browBridge");
  box(b, [0.38, 0.12, 0.12], [0, 1.59, 0.8], MOUTH, jaw, "lowerJaw");
  b.sweep(
    polyline([
      [-0.19, 1.6, 0.79],
      [0, 1.54, 0.89],
      [0.19, 1.6, 0.79],
    ]),
    0.035,
    { color: MOUTH, bone: jaw, caps: "round", name: "mouthGap" },
  );
  sphere(b, 0.075, [0, 1.72, 0.93], STONE_DEEP, head, "nose", 8, 5);

  for (const s of [1, -1]) {
    sphere(b, 0.082, [s * 0.145, 1.91, 0.82], STONE_DEEP, head, `eyeSocket${s}`, 8, 5);
    sphere(b, 0.042, [s * 0.145, 1.91, 0.884], EYE, head, `eye${s}`, 8, 5);
    box(b, [0.2, 0.07, 0.08], [s * 0.14, 2.005, 0.77], STONE_DARK, head, `brow${s}`);
    // Cheek ruff blocks
    box(b, [0.18, 0.25, 0.18], [s * 0.27, 1.75, 0.61], STONE_LIGHT, head, `cheek${s}`);
    b.spike(
      [s * 0.31, 1.69, 0.62],
      [s * 0.43, 1.58, 0.58],
      null,
      0.055,
      { color: EDGE, bone: head, name: `cheekFang${s}`, caps: "point" },
    );
  }

  // Horns and pointed ears.
  for (const s of [1, -1]) {
    b.spike(
      [s * 0.18, 1.98, 0.55],
      [s * 0.3, 2.28, 0.39],
      null,
      0.105,
      { color: STONE_DARK, bone: head, name: `horn${s}`, caps: "point" },
    );
    b.spike(
      [s * 0.27, 1.95, 0.54],
      [s * 0.43, 2.12, 0.45],
      null,
      0.075,
      { color: STONE, bone: head, name: `ear${s}`, caps: "point" },
    );
    b.spike(
      [s * 0.095, 1.65, 0.83],
      [s * 0.095, 1.45, 0.9],
      null,
      0.028,
      { color: EDGE, bone: jaw, name: `fang${s}`, caps: "point" },
    );
  }

  // Wings: broad, extended, readable membranes with three finger spars each.
  const wingL = b.chain(
    "wingL",
    [
      [0.45, 1.46, 0.02],
      [0.82, 1.64, -0.02],
      [1.3, 1.93, -0.06],
      [1.72, 2.08, 0.02],
    ],
    {
      parent: spine.joints[2],
      names: ["wingL1", "wingL2", "wingL3", "wingL4"],
      role: "wing",
    },
  );
  const wingR = b.chain(
    "wingR",
    [
      [-0.45, 1.46, 0.02],
      [-0.82, 1.64, -0.02],
      [-1.3, 1.93, -0.06],
      [-1.72, 2.08, 0.02],
    ],
    {
      parent: spine.joints[2],
      names: ["wingR1", "wingR2", "wingR3", "wingR4"],
      role: "wing",
    },
  );

  const wingEdgeL = [
    [0.45, 1.46, 0.02],
    [0.72, 1.28, -0.03],
    [1.2, 1.42, -0.04],
    [1.63, 1.66, 0.02],
  ];
  const wingEdgeR = [
    [-0.45, 1.46, 0.02],
    [-0.72, 1.28, -0.03],
    [-1.2, 1.42, -0.04],
    [-1.63, 1.66, 0.02],
  ];

  b.membrane(wingL, wingEdgeL, {
    color: STONE_DARK,
    thickness: 0.035,
    rows: 4,
    cols: 8,
    scallop: 0.12,
    name: "wingMembraneL",
  });
  b.membrane(wingR, wingEdgeR, {
    color: STONE_DARK,
    thickness: 0.035,
    rows: 4,
    cols: 8,
    scallop: 0.12,
    name: "wingMembraneR",
  });

  for (const s of [1, -1]) {
    const w = s > 0 ? wingL : wingR;
    b.sweep(
      polyline([
        [s * 0.45, 1.46, 0.03],
        [s * 0.95, 1.63, 0.0],
        [s * 1.55, 1.98, 0.02],
      ]),
      [0.035, 0.018],
      { color: STONE_LIGHT, bone: w.joints[0], caps: "point", name: `wingRib${s}A` },
    );
    b.sweep(
      polyline([
        [s * 0.55, 1.47, 0.03],
        [s * 1.12, 1.45, 0.0],
        [s * 1.65, 1.69, 0.03],
      ]),
      [0.032, 0.012],
      { color: STONE_LIGHT, bone: w.joints[0], caps: "point", name: `wingRib${s}B` },
    );
    b.spike(
      [s * 1.3, 1.93, -0.03],
      [s * 1.92, 2.15, 0.08],
      null,
      0.045,
      { color: EDGE, bone: w.tip!, name: `wingFinger${s}A`, caps: "point" },
    );
    b.spike(
      [s * 1.2, 1.43, -0.03],
      [s * 1.76, 1.55, 0.07],
      null,
      0.04,
      { color: EDGE, bone: w.tip!, name: `wingFinger${s}B`, caps: "point" },
    );
    b.spike(
      [s * 0.95, 1.62, -0.03],
      [s * 1.57, 1.27, 0.05],
      null,
      0.035,
      { color: EDGE, bone: w.tip!, name: `wingFinger${s}C`, caps: "point" },
    );
  }

  // A short ridged tail curls behind the haunches.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.43],
      [0, 0.82, -0.72],
      [0.12, 0.65, -0.95],
      [0.3, 0.63, -1.16],
      [0.45, 0.78, -1.28],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );
  const tailTube = b.sweep(tail, (t) => 0.13 * (1 - t) + 0.025, {
    color: STONE_DARK,
    section: { ngon: 7 },
    name: "tail",
  });
  b.along(tailTube, 5, (at) =>
    b.spike(at, at, 0.085, 0.028, {
      color: EDGE,
      name: "tailSpine",
      caps: "point",
    }),
  );

  // Cathedral ledge, intentionally simpler than the gargoyle.
  box(b, [2.9, 0.22, 1.55], [0, 0.11, 0.02], LEDGE, null, "ledge");
  box(b, [3.15, 0.16, 0.22], [0, 0.29, 0.67], STONE_LIGHT, null, "ledgeFrontCap");
  box(b, [2.7, 0.16, 0.2], [0, 0.29, -0.68], STONE_DARK, null, "ledgeBackCap");

  for (const x of [-1.15, -0.42, 0.42, 1.15]) {
    box(b, [0.025, 0.02, 1.34], [x, 0.235, 0.02], STONE_DEEP, null, "ledgeSeamX");
  }
  for (const z of [-0.42, 0.08, 0.55]) {
    box(b, [2.82, 0.018, 0.025], [0, 0.235, z], STONE_DEEP, null, "ledgeSeamZ");
  }

  // Simple corner masonry blocks and moss-colored upward chips leave room for stage 2 ornament.
  box(b, [0.38, 0.28, 0.32], [1.22, 0.33, 0.52], STONE_DARK, null, "ledgeCornerR");
  box(b, [0.38, 0.28, 0.32], [-1.22, 0.33, 0.52], STONE_DARK, null, "ledgeCornerL");
  box(b, [0.42, 0.035, 0.2], [0.8, 0.315, 0.34], MOSS, null, "ledgeMossR");
  box(b, [0.38, 0.035, 0.18], [-0.82, 0.315, -0.3], MOSS, null, "ledgeMossL");

  for (const add of STAGE2) add(b);
  return b.root;
}
