import * as THREE from "three";
import { type Builder, createBuilder, catmull, polyline, limb, paint, noise, cells } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Crouched Cathedral Gargoyle",
  description:
    "A gothic stone gargoyle crouched on a carved cathedral ledge, with weathered slate patina, spread wings, horns, talons, fangs, and a snarling face.",
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

function box(
  b: Builder,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  bone: any,
  name: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    ...(bone ? { bone } : {}),
    name,
    flat: true,
  });
}

function sphere(
  b: Builder,
  radius: number,
  at: [number, number, number],
  color: any,
  bone: any,
  name: string,
  sides = 8,
  rings = 6,
) {
  return b.part(new THREE.SphereGeometry(radius, sides, rings), color, {
    at,
    ...(bone ? { bone } : {}),
    name,
    flat: true,
  });
}

function stonePaint() {
  const base = paint((p, n) => {
    const light = 0.5 + 0.5 * n.y;
    const recess = Math.max(0, -n.y) * 0.42 + Math.max(0, -n.z) * 0.15;
    const fleck = noise(p, 0.16, 41);
    if (fleck > 0.91 && n.y > -0.25) return "#c0c0b0";
    if (fleck < 0.13 || recess > 0.34) return "#272b38";
    return light > 0.56 ? "#8b8e96" : "#565a69";
  });

  return paint((p, n) => {
    const broad = noise(p, 0.42, 12);
    const chip = noise(p, 0.085, 77);
    if (chip > 0.955 && n.y > 0.08) return "#c9c8bb";
    if (chip < 0.075 || n.y < -0.58) return "#202330";
    if (broad > 0.67) return "#96989a";
    return base.at(p, n);
  });
}

function wingPaint() {
  return paint((p, n, s) => {
    const panel = Math.floor((s[0] * 5 + 0.5) % 2);
    const weather = noise(p, 0.13, 91);
    const edge = s[0] > 0.72 || s[0] < 0.12;
    if (edge && weather > 0.5) return "#96999b";
    if (weather < 0.13) return "#202430";
    if (panel === 0) return n.y > 0.15 ? "#555966" : "#303441";
    return n.y > 0.15 ? "#646873" : "#292d3a";
  });
}

function ledgePaint() {
  return paint((p, n) => {
    const ux = Math.floor((p.x + 1.5) / 0.45);
    const uz = Math.floor((p.z + 0.78) / 0.38);
    const seamX = Math.abs(((p.x + 1.5) % 0.45) - 0.225) < 0.018;
    const seamZ = Math.abs(((p.z + 0.78) % 0.38) - 0.19) < 0.018;
    const mortar = seamX || seamZ;
    if (mortar) return "#252832";
    if (p.z < -0.48 && n.y > 0.4 && noise(p, 0.12, 19) > 0.55)
      return "#52604e";
    const block = (ux + uz * 3) & 3;
    if (n.y > 0.5) return block === 0 ? "#8d9194" : "#777b84";
    if (n.z > 0.5) return block === 1 ? "#696d78" : "#555a67";
    return "#454956";
  });
}

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE_PATINA = stonePaint();
  const WING_PATINA = wingPaint();
  const LEDGE_MASONRY = ledgePaint();

  const hips = b.joint("hips", {
    at: [0, 0.98, -0.22],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.22],
      [0, 1.18, -0.04],
      [0, 1.38, 0.22],
      [0, 1.53, 0.43],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "chest", "neckBase"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
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

  b.sweep(spine, (t) => 0.28 - 0.035 * t, {
    color: STONE_PATINA,
    section: { ngon: 8 },
    name: "body",
    group: "body",
  });

  box(b, [0.72, 0.36, 0.46], [0, 1.25, 0.18], STONE_PATINA, spine.joints[1], "shoulderMass");
  box(b, [0.58, 0.38, 0.5], [0, 1.01, -0.3], STONE_PATINA, hips, "rumpMass");
  box(b, [0.43, 0.18, 0.38], [0, 1.49, 0.41], STONE_PATINA, spine.joints[2], "chest");

  const legL = b.chain(
    "legL",
    limb(
      [0.29, 1.04, -0.24],
      [0.46, 0.29, 0.48],
      [0.42, 0.43, 0.28],
      [[0, 0, 1], [0, 0, -1]],
    ),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.46, 0.2, 0.56],
    },
  );

  const legR = b.chain(
    "legR",
    limb(
      [-0.29, 1.04, -0.24],
      [-0.46, 0.29, 0.48],
      [0.42, 0.43, 0.28],
      [[0, 0, 1], [0, 0, -1]],
    ),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.46, 0.2, 0.56],
    },
  );

  b.sweep(legL, [0.16, 0.12, 0.08], {
    color: STONE_PATINA,
    section: { ngon: 7 },
    name: "legL",
  });
  b.sweep(legR, [0.16, 0.12, 0.08], {
    color: STONE_PATINA,
    section: { ngon: 7 },
    name: "legR",
  });

  box(b, [0.34, 0.16, 0.42], [0.46, 0.26, 0.55], STONE_PATINA, legL.tip, "footL");
  box(b, [0.34, 0.16, 0.42], [-0.46, 0.26, 0.55], STONE_PATINA, legR.tip, "footR");

  for (const s of [1, -1]) {
    const foot = s > 0 ? legL.tip : legR.tip;
    b.spike(foot, [s * 0.58, 0.21, 0.78], null, 0.045, {
      color: CLAW,
      caps: "point",
      name: `toe${s}A`,
    });
    b.spike(foot, [s * 0.46, 0.21, 0.84], 0.18, 0.045, {
      color: CLAW,
      caps: "point",
      name: `toe${s}B`,
    });
    b.spike(foot, [s * 0.34, 0.21, 0.75], 0.13, 0.045, {
      color: CLAW,
      caps: "point",
      name: `toe${s}C`,
    });
    sphere(b, 0.065, [s * 0.46, 0.33, 0.48], STONE_LIGHT, foot, `ankleKnuckle${s}`);
  }

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
    color: STONE_PATINA,
    section: { ngon: 7 },
    name: "armL",
  });
  b.sweep(armR, [0.1, 0.075, 0.04], {
    color: STONE_PATINA,
    section: { ngon: 7 },
    name: "armR",
  });

  for (const s of [1, -1]) {
    const hand = s > 0 ? armL.tip : armR.tip;
    b.spike(hand, [s * 0.57, 0.55, 1.05], 0.25, 0.035, {
      color: CLAW,
      caps: "point",
      name: `finger${s}A`,
    });
    b.spike(hand, [s * 0.49, 0.51, 1.08], 0.29, 0.035, {
      color: CLAW,
      caps: "point",
      name: `finger${s}B`,
    });
    b.spike(hand, [s * 0.41, 0.54, 1.02], 0.22, 0.035, {
      color: CLAW,
      caps: "point",
      name: `finger${s}C`,
    });
    sphere(b, 0.07, [s * 0.5, 0.68, 0.86], STONE_LIGHT, hand, `palmKnuckle${s}`);
  }

  sphere(b, 0.31, [0, 1.78, 0.58], STONE_PATINA, head, "head", 12, 8);
  box(b, [0.42, 0.26, 0.28], [0, 1.72, 0.78], STONE_PATINA, head, "muzzle");
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
    box(b, [0.18, 0.25, 0.18], [s * 0.27, 1.75, 0.61], STONE_PATINA, head, `cheek${s}`);
    b.spike(
      [s * 0.31, 1.69, 0.62],
      [s * 0.43, 1.58, 0.58],
      null,
      0.055,
      { color: EDGE, bone: head, name: `cheekFang${s}`, caps: "point" },
    );
    b.spike(
      [s * 0.095, 1.65, 0.83],
      [s * 0.095, 1.45, 0.9],
      0.20,
      0.028,
      { color: EDGE, bone: jaw, name: `fang${s}`, caps: "point" },
    );
  }

  for (const s of [1, -1]) {
    b.spike(
      [s * 0.18, 1.98, 0.55],
      [s * 0.3, 2.28, 0.39],
      0.38,
      0.105,
      { color: STONE_DARK, bone: head, name: `horn${s}`, caps: "point" },
    );
    b.spike(
      [s * 0.27, 1.95, 0.54],
      [s * 0.43, 2.12, 0.45],
      0.25,
      0.075,
      { color: STONE_PATINA, bone: head, name: `ear${s}`, caps: "point" },
    );
  }

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
    color: WING_PATINA,
    thickness: 0.035,
    rows: 4,
    cols: 8,
    scallop: 0.12,
    name: "wingMembraneL",
  });

  b.membrane(wingR, wingEdgeR, {
    color: WING_PATINA,
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
        [s * 0.95, 1.63, 0],
        [s * 1.55, 1.98, 0.02],
      ]),
      [0.035, 0.018],
      {
        color: STONE_LIGHT,
        bone: w.joints[0],
        caps: "point",
        name: `wingRib${s}A`,
      },
    );

    b.sweep(
      polyline([
        [s * 0.55, 1.47, 0.03],
        [s * 1.12, 1.45, 0],
        [s * 1.65, 1.69, 0.03],
      ]),
      [0.032, 0.012],
      {
        color: STONE_LIGHT,
        bone: w.joints[0],
        caps: "point",
        name: `wingRib${s}B`,
      },
    );

    b.spike(
      [s * 1.3, 1.93, -0.03],
      [s * 1.92, 2.15, 0.08],
      null,
      0.045,
      { color: EDGE, bone: w.tip, name: `wingFinger${s}A`, caps: "point" },
    );

    b.spike(
      [s * 1.2, 1.43, -0.03],
      [s * 1.76, 1.55, 0.07],
      null,
      0.04,
      { color: EDGE, bone: w.tip, name: `wingFinger${s}B`, caps: "point" },
    );

    b.spike(
      [s * 0.95, 1.62, -0.03],
      [s * 1.57, 1.27, 0.05],
      null,
      0.035,
      { color: EDGE, bone: w.tip, name: `wingFinger${s}C`, caps: "point" },
    );
  }

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
    color: STONE_PATINA,
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

  box(b, [2.9, 0.22, 1.55], [0, 0.11, 0.02], LEDGE_MASONRY, undefined, "ledge");
  box(b, [3.15, 0.16, 0.22], [0, 0.29, 0.67], LEDGE_MASONRY, undefined, "ledgeFrontCap");
  box(b, [2.7, 0.16, 0.2], [0, 0.29, -0.68], LEDGE_MASONRY, undefined, "ledgeBackCap");

  for (const x of [-1.15, -0.42, 0.42, 1.15]) {
    box(b, [0.025, 0.02, 1.34], [x, 0.235, 0.02], LEDGE_MASONRY, null, "ledgeSeamX");
  }

  for (const z of [-0.42, 0.08, 0.55]) {
    box(b, [2.82, 0.018, 0.025], [0, 0.235, z], LEDGE_MASONRY, null, "ledgeSeamZ");
  }

  box(b, [0.38, 0.28, 0.32], [1.22, 0.33, 0.52], LEDGE_MASONRY, undefined, "ledgeCornerR");
  box(b, [0.38, 0.28, 0.32], [-1.22, 0.33, 0.52], LEDGE_MASONRY, undefined, "ledgeCornerL");
  box(b, [0.42, 0.035, 0.2], [0.8, 0.315, 0.34], MOSS, undefined, "ledgeMossR");
  box(b, [0.38, 0.035, 0.18], [-0.82, 0.315, -0.3], MOSS, undefined, "ledgeMossL");

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addForeheadCrown(b: Builder) {
  const bone = "head";
  const DARK_SLATE = "#292c3b";
  const PALE_CHIP = "#c8c5b9";
  const RECESS = "#181a26";

  const crownBaseY = 2.055;
  const crownZ = 0.715;

  // A thin, pointed gothic shield rises from the forehead behind the three finials.
  b.extrude(
    [
      [-0.225, 0],
      [0.225, 0],
      [0.205, 0.045],
      [0.14, 0.085],
      [0.078, 0.115],
      [0, 0.172, "sharp"],
      [-0.078, 0.115],
      [-0.14, 0.085],
      [-0.205, 0.045],
    ],
    {
      at: [0, crownBaseY, crownZ - 0.018],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      smoothing: 1,
      color: DARK_SLATE,
      bone,
      name: "s21CrownShield",
      group: "head",
    },
  );

  // Recessed triangular cut-like inlays make the otherwise simple shield read as carved stone.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [s * 0.018, 0.025],
        [s * 0.073, 0.025],
        [s * 0.035, 0.095],
      ],
      {
        at: [0, crownBaseY + 0.002, crownZ + 0.006],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.041,
        bevel: 0.002,
        color: RECESS,
        bone,
        name: `s21CrownRecess${s}`,
        group: "head",
      },
    );
  }

  const finials = [
    { x: -0.145, h: 0.125, r: 0.047, name: "s21FinialL" },
    { x: 0, h: 0.16, r: 0.056, name: "s21FinialC" },
    { x: 0.145, h: 0.125, r: 0.047, name: "s21FinialR" },
  ];

  for (const f of finials) {
    // Faceted square-ish plinths, sunk slightly into the forehead shield.
    b.part(
      new THREE.CylinderGeometry(f.r * 1.08, f.r * 1.18, 0.032, 6),
      DARK_SLATE,
      {
        at: [f.x, crownBaseY + 0.018, crownZ],
        bone,
        name: `${f.name}Base`,
        group: "head",
        flat: true,
      },
    );

    b.part(
      new THREE.CylinderGeometry(f.r * 0.72, f.r * 0.9, 0.026, 6),
      PALE_CHIP,
      {
        at: [f.x, crownBaseY + 0.046, crownZ],
        bone,
        name: `${f.name}Collar`,
        group: "head",
        flat: true,
      },
    );

    // Main carved needle, with a deliberately angular silhouette.
    b.spike(
      [f.x, crownBaseY + 0.055, crownZ],
      [f.x, crownBaseY + 0.055 + f.h, crownZ],
      null,
      f.r,
      {
        color: DARK_SLATE,
        bone,
        caps: "point",
        name: f.name,
        group: "head",
      },
    );

    // Pale worn cap on each point: a short inset cone rather than a painted line.
    b.spike(
      [f.x, crownBaseY + 0.055 + f.h * 0.70, crownZ],
      [f.x, crownBaseY + 0.055 + f.h * 0.93, crownZ],
      null,
      f.r * 0.48,
      {
        color: PALE_CHIP,
        bone,
        caps: "point",
        name: `${f.name}WornTip`,
        group: "head",
      },
    );
  }

  // Small horizontal carved ledge under the crown ties the three pinnacles together.
  b.part(
    new THREE.BoxGeometry(0.39, 0.026, 0.065),
    PALE_CHIP,
    {
      at: [0, crownBaseY + 0.055, crownZ + 0.002],
      bone,
      name: "s21CrownLintel",
      group: "head",
      flat: true,
    },
  );

  // Two tiny chipped corner bosses complete the stone-carved ornament without leaving the reserved room.
  for (const s of [-1, 1]) {
    b.spike(
      [s * 0.205, crownBaseY + 0.035, crownZ + 0.005],
      [s * 0.225, crownBaseY + 0.082, crownZ + 0.006],
      null,
      0.018,
      {
        color: PALE_CHIP,
        bone,
        caps: "point",
        name: `s21CrownCornerChip${s}`,
        group: "head",
      },
    );
  }
}
    return addForeheadCrown;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addWingRibsL(b: Builder) {
  const RIB = "#3f4250";
  const RIB_EDGE = "#c2c2bb";
  const RIB_SHADOW = "#242631";
  const CHIP = "#8f9298";

  const fan = [
    [
      [0.72, 1.72, 0.065],
      [0.84, 1.55, 0.075],
      [1.18, 1.43, 0.08],
      [1.38, 1.40, 0.085],
    ],
    [
      [0.72, 1.72, 0.072],
      [0.92, 1.68, 0.08],
      [1.22, 1.82, 0.085],
      [1.38, 1.92, 0.09],
    ],
    [
      [0.72, 1.72, 0.078],
      [0.93, 1.82, 0.087],
      [1.18, 2.00, 0.09],
      [1.38, 2.08, 0.092],
    ],
    [
      [0.72, 1.72, 0.083],
      [0.83, 1.88, 0.09],
      [1.04, 2.04, 0.095],
      [1.34, 2.16, 0.1],
    ],
  ] as [number, number, number][][];

  const mirror = (points: [number, number, number][], side: number) =>
    points.map(([x, y, z]) => [side * x, y, z] as [number, number, number]);

  const raised = (
    points: [number, number, number][],
    side: number,
    color: string,
    radius: number,
    name: string,
  ) => {
    b.sweep(polyline(mirror(points, side)), radius, {
      bone: side > 0 ? "wingL1" : "wingR1",
      color,
      section: { ngon: 6 },
      caps: "round",
      name,
      group: "wingRibs",
    });
  };

  for (let i = 0; i < fan.length; i++) {
    const main = fan[i];

    for (const side of [1, -1]) {
      const suffix = side > 0 ? "L" : "R";

      raised(main, side, RIB_SHADOW, 0.039, `s22ribBase${suffix}${i + 1}`);

      const highlight = main.map(
        ([x, y, z]) => [x, y + 0.008, z + 0.032] as [number, number, number],
      );
      raised(
        highlight,
        side,
        RIB_EDGE,
        0.010,
        `s22ribWear${suffix}${i + 1}`,
      );

      const end = main[main.length - 1];
      const prev = main[main.length - 2];
      const dx = end[0] - prev[0];
      const dy = end[1] - prev[1];
      const dz = end[2] - prev[2];
      const length = Math.hypot(dx, dy, dz) || 1;
      const tip = [
        side * (end[0] + (dx / length) * 0.065),
        end[1] + (dy / length) * 0.065,
        end[2] + (dz / length) * 0.065 + 0.018,
      ] as [number, number, number];

      b.spike(
        [side * end[0], end[1], end[2] + 0.02],
        tip,
        null,
        0.043,
        {
          bone: side > 0 ? "wingL1" : "wingR1",
          color: RIB_EDGE,
          caps: "point",
          name: `s22ribFinial${suffix}${i + 1}`,
          group: "wingRibs",
        },
      );

      const root = main[0];
      b.part(
        new THREE.SphereGeometry(0.052, 7, 5),
        RIB_SHADOW,
        {
          bone: side > 0 ? "wingL1" : "wingR1",
          at: [side * root[0], root[1], root[2] + 0.018],
          name: `s22ribRoot${suffix}${i + 1}`,
          group: "wingRibs",
          flat: true,
        },
      );

      if (i > 0) {
        const mark = main[1];
        b.spike(
          [side * mark[0], mark[1], mark[2] + 0.033],
          [side * (mark[0] + 0.045), mark[1] + 0.018, mark[2] + 0.055],
          null,
          0.011,
          {
            bone: side > 0 ? "wingL1" : "wingR1",
            color: CHIP,
            caps: "point",
            name: `s22ribChip${suffix}${i + 1}`,
            group: "wingRibs",
          },
        );
      }
    }
  }

  // Small gothic cross-bridges tie the fan together near the shoulder,
  // reading as carved buttresses rather than loose floating rods.
  for (const side of [1, -1]) {
    const bone = side > 0 ? "wingL1" : "wingR1";
    const suffix = side > 0 ? "L" : "R";

    b.sweep(
      polyline([
        [side * 0.70, 1.70, 0.075],
        [side * 0.84, 1.76, 0.078],
        [side * 0.96, 1.82, 0.08],
      ]),
      0.018,
      {
        bone,
        color: RIB,
        section: { ngon: 5 },
        caps: "round",
        name: `s22Buttress${suffix}A`,
        group: "wingRibs",
      },
    );

    b.sweep(
      polyline([
        [side * 0.78, 1.57, 0.08],
        [side * 0.90, 1.68, 0.083],
        [side * 1.02, 1.78, 0.085],
      ]),
      0.014,
      {
        bone,
        color: RIB_EDGE,
        section: { ngon: 5 },
        caps: "round",
        name: `s22Buttress${suffix}B`,
        group: "wingRibs",
      },
    );
  }
}
    return addWingRibsL;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addChestRosette(b: Builder) {
  const center: [number, number, number] = [0, 1.42, 0.47];
  const bone = "chest";

  // A deep, almost square-cut recess makes the raised carving read against the chest plane.
  b.part(new THREE.CylinderGeometry(0.198, 0.198, 0.018, 12, 1), STONE_DEEP, {
    at: [center[0], center[1], center[2] + 0.006],
    bone,
    dir: [0, 0, 1],
    name: "rosetteRecess",
    flat: true,
  });

  // Chiselled outer rim: two faceted rings, like a small cathedral window surround.
  b.part(new THREE.TorusGeometry(0.182, 0.014, 6, 18), STONE_DARK, {
    at: [center[0], center[1], center[2] + 0.019],
    bone,
    dir: [0, 0, 1],
    name: "rosetteOuterRim",
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.118, 0.009, 6, 18), STONE_LIGHT, {
    at: [center[0], center[1], center[2] + 0.024],
    bone,
    dir: [0, 0, 1],
    name: "rosetteInnerRim",
    flat: true,
  });

  // Each petal is a separate pointed lancet, oriented radially but all facing outward.
  const petal: [number, number][] = [
    [0.018, -0.043],
    [0.078, -0.072],
    [0.145, -0.054],
    [0.184, 0],
    [0.145, 0.054],
    [0.078, 0.072],
    [0.018, 0.043],
    [0.004, 0],
  ];

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const radial: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
    const tangent: [number, number, number] = [-Math.sin(a), Math.cos(a), 0];

    b.extrude(petal, {
      at: [center[0], center[1], center[2] + 0.031],
      x: radial,
      y: tangent,
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 0,
      color: i % 2 === 0 ? STONE : STONE_LIGHT,
      bone,
      name: `rosettePetal${i}`,
    });

    // A raised central ridge on every petal gives the stone carving a hand-chiselled highlight.
    const ridgeStart: [number, number, number] = [
      center[0] + radial[0] * 0.045,
      center[1] + radial[1] * 0.045,
      center[2] + 0.053,
    ];
    const ridgeEnd: [number, number, number] = [
      center[0] + radial[0] * 0.145,
      center[1] + radial[1] * 0.145,
      center[2] + 0.053,
    ];
    b.rod(ridgeStart, ridgeEnd, 0.008, {
      color: EDGE,
      bone,
      name: `rosetteRidge${i}`,
      caps: "flat",
      section: { ngon: 5 },
    });

    // Small dark triangular gutter between neighboring petals.
    const gutter: [number, number][] = [
      [0.022, -0.012],
      [0.112, -0.018],
      [0.132, 0],
      [0.112, 0.018],
      [0.022, 0.012],
    ];
    const gutterRadial: [number, number, number] = [
      Math.cos(a + Math.PI / 6),
      Math.sin(a + Math.PI / 6),
      0,
    ];
    const gutterTangent: [number, number, number] = [
      -Math.sin(a + Math.PI / 6),
      Math.cos(a + Math.PI / 6),
      0,
    ];
    b.extrude(gutter, {
      at: [center[0], center[1], center[2] + 0.055],
      x: gutterRadial,
      y: gutterTangent,
      thickness: 0.006,
      color: MOUTH,
      bone,
      name: `rosetteGutter${i}`,
    });
  }

  // Faceted six-sided hub over the petal roots.
  b.part(new THREE.CylinderGeometry(0.062, 0.071, 0.034, 6, 1), STONE_LIGHT, {
    at: [center[0], center[1], center[2] + 0.066],
    bone,
    dir: [0, 0, 1],
    name: "rosetteHub",
    flat: true,
  });

  // Dark inset in the hub and a tiny worn cap, making the emblem feel carved through rather than painted on.
  b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.008, 6, 1), STONE_DEEP, {
    at: [center[0], center[1], center[2] + 0.086],
    bone,
    dir: [0, 0, 1],
    name: "rosetteHubInset",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), EDGE, {
    at: [center[0], center[1], center[2] + 0.094],
    bone,
    name: "rosetteHubWear",
    flat: true,
  });
}
    return addChestRosette;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addEyeGlowL(b: Builder) {
  const SOCKET = "#111321";
  const SOCKET_EDGE = "#3b3b52";
  const VIOLET = "#796cff";
  const VIOLET_HOT = "#d9d0ff";

  const normal = new THREE.Vector3(0, 0.05, 1).normalize();

  const addEye = (
    side: number,
    at: [number, number, number],
    bone: string,
    name: string,
  ) => {
    const x = at[0];
    const y = at[1];
    const z = at[2];

    // Deep octagonal socket, visibly carved into the brow plane.
    b.part(
      new THREE.CylinderGeometry(0.078, 0.088, 0.026, 8, 1, false),
      SOCKET,
      {
        bone,
        at: [x, y, z - 0.006],
        dir: normal,
        axis: "y",
        name: `${name}Socket`,
        flat: true,
      },
    );

    // Raised stone rim: two nested angular toruses make the socket read as masonry,
    // rather than a floating glowing bead.
    b.part(
      new THREE.TorusGeometry(0.061, 0.012, 5, 8),
      SOCKET_EDGE,
      {
        bone,
        at: [x, y, z + 0.010],
        dir: normal,
        axis: "z",
        rotation: [0, 0, side * 7],
        name: `${name}Rim`,
        flat: true,
      },
    );

    b.part(
      new THREE.TorusGeometry(0.043, 0.006, 4, 8),
      SOCKET,
      {
        bone,
        at: [x, y, z + 0.018],
        dir: normal,
        axis: "z",
        rotation: [0, 0, -side * 7],
        name: `${name}InnerRim`,
        flat: true,
      },
    );

    // Faceted magical ember, slightly embedded behind the existing stone eye.
    const ember = b.part(
      new THREE.IcosahedronGeometry(0.039, 1),
      VIOLET,
      {
        bone,
        at: [x, y, z + 0.024],
        dir: normal,
        axis: "z",
        scale: [0.82, 1.18, 0.72],
        name: `${name}Ember`,
        flat: true,
      },
    );
    glow(ember, 2.8);

    // A hot central facet gives the ember a carved rune-like core.
    const core = b.part(
      new THREE.OctahedronGeometry(0.015, 0),
      VIOLET_HOT,
      {
        bone,
        at: [x, y + 0.002, z + 0.057],
        dir: normal,
        axis: "z",
        scale: [0.7, 1.25, 0.5],
        name: `${name}Core`,
        flat: true,
      },
    );
    glow(core, 4);

    // Three tiny outward chips make the socket feel hand-cut and gothic.
    for (let i = 0; i < 3; i++) {
      const a = (-0.75 + i * 0.75) * side;
      const chip = b.spike(
        [x + a * 0.052, y + 0.035, z + 0.018],
        [x + a * 0.075, y + 0.052, z + 0.024],
        null,
        0.006,
        {
          color: SOCKET_EDGE,
          bone,
          name: `${name}BrowChip${i}`,
          caps: "point",
        },
      );
      void chip;
    }
  };

  addEye(1, [0.155, 1.91, 0.83], "head", "eyeGlowL");
  addEye(-1, [-0.155, 1.91, 0.83], "head", "eyeGlowR");
}
    return addEyeGlowL;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addLedgeGargoyleScroll(b: Builder) {
  const SCROLL = "#858995";
  const SCROLL_LIGHT = "#b8bac0";
  const RECESS = "#292c38";
  const WORN = "#d0cdc2";

  const x0 = 0.78;
  const zFront = 0.765;

  const relief = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z = zFront, name = "scrollRelief") =>
    b.part(geo, color, {
      at: [x, y, z],
      flat: true,
      name,
      group: "ledge-scroll",
    });

  const stoneBlock = (
    size: [number, number, number],
    x: number,
    y: number,
    z: number,
    color: string,
    name: string,
  ) => relief(new THREE.BoxGeometry(size[0], size[1], size[2]), color, x, y, z, name);

  // A dark, shallow pointed arch gives the ornament a carved niche.
  b.extrude(
    [
      [-0.185, 0],
      [0.185, 0],
      [0.17, 0.13],
      [0.135, 0.245],
      [0.075, 0.335],
      [0, 0.385, "sharp"],
      [-0.075, 0.335],
      [-0.135, 0.245],
      [-0.17, 0.13],
    ],
    {
      at: [x0, 0.105, zFront - 0.006],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      smoothing: 0,
      color: RECESS,
      name: "scrollPointedNiche",
      group: "ledge-scroll",
    },
  );

  // Raised outer arch, with deliberate block joints like a tiny cathedral pier.
  const archSegments: Array<[number, number, number, number, string]> = [
    [-0.175, 0.12, 0.055, 0.13, "scrollArchL0"],
    [-0.13, 0.245, 0.05, 0.12, "scrollArchL1"],
    [-0.065, 0.335, 0.055, 0.095, "scrollArchL2"],
    [0.0, 0.37, 0.06, 0.07, "scrollArchCrown"],
    [0.065, 0.335, 0.055, 0.095, "scrollArchR2"],
    [0.13, 0.245, 0.05, 0.12, "scrollArchR1"],
    [0.175, 0.12, 0.055, 0.13, "scrollArchR0"],
  ];
  for (const [dx, y, w, h, name] of archSegments) {
    stoneBlock([w, h, 0.038], x0 + dx, y, zFront + 0.018, SCROLL, name);
  }

  // Pale keystones and worn corners.
  stoneBlock([0.062, 0.055, 0.045], x0, 0.37, zFront + 0.044, SCROLL_LIGHT, "scrollKeystone");
  stoneBlock([0.042, 0.06, 0.045], x0 - 0.174, 0.17, zFront + 0.044, WORN, "scrollWornL");
  stoneBlock([0.042, 0.06, 0.045], x0 + 0.174, 0.17, zFront + 0.044, WORN, "scrollWornR");

  // Blocky lower pedestal and stepped plinth.
  stoneBlock([0.31, 0.055, 0.075], x0, 0.115, zFront + 0.025, SCROLL_DARK_SAFE(), "scrollPlinth0");
  stoneBlock([0.25, 0.055, 0.09], x0, 0.165, zFront + 0.032, SCROLL_LIGHT, "scrollPlinth1");
  stoneBlock([0.19, 0.04, 0.085], x0, 0.21, zFront + 0.038, SCROLL, "scrollPlinth2");

  // Two compact volutes: angular stone coils rather than smooth decoration.
  const coil = (side: number, name: string) => {
    const cx = x0 + side * 0.108;
    const cy = 0.255;
    const pts: [number, number, number][] = [
      [cx + side * 0.045, cy + 0.055, zFront + 0.052],
      [cx + side * 0.068, cy + 0.025, zFront + 0.054],
      [cx + side * 0.062, cy - 0.018, zFront + 0.055],
      [cx + side * 0.031, cy - 0.043, zFront + 0.056],
      [cx - side * 0.008, cy - 0.032, zFront + 0.057],
      [cx - side * 0.021, cy + 0.003, zFront + 0.058],
      [cx - side * 0.004, cy + 0.026, zFront + 0.059],
      [cx + side * 0.019, cy + 0.012, zFront + 0.06],
      [cx + side * 0.012, cy - 0.008, zFront + 0.061],
    ];
    b.sweep(polyline(pts), 0.014, {
      color: SCROLL_LIGHT,
      section: { ngon: 6 },
      caps: "round",
      name,
      group: "ledge-scroll",
    });
    relief(
      new THREE.CylinderGeometry(0.022, 0.022, 0.035, 8),
      RECESS,
      cx + side * 0.01,
      cy + 0.002,
      zFront + 0.046,
      `${name}Recess`,
    ).rotation.x = Math.PI / 2;
    relief(
      new THREE.CylinderGeometry(0.011, 0.011, 0.042, 8),
      WORN,
      cx + side * 0.01,
      cy + 0.002,
      zFront + 0.072,
      `${name}Hub`,
    ).rotation.x = Math.PI / 2;
  };
  coil(1, "scrollVoluteL");
  coil(-1, "scrollVoluteR");

  // Small carved leaf blades between the volutes.
  for (const side of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [side * 0.052, 0.028],
        [side * 0.036, 0.09],
        [0, 0.13, "sharp"],
        [side * -0.036, 0.09],
        [side * -0.052, 0.028],
      ],
      {
        at: [x0 + side * 0.055, 0.265, zFront + 0.064],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.003,
        smoothing: 1,
        color: SCROLL,
        name: `scrollLeaf${side}`,
        group: "ledge-scroll",
      },
    );
  }

  // Pointed trefoil finial above the arch.
  const finialBase = [x0, 0.435, zFront + 0.052] as [number, number, number];
  for (const [dx, dy, name] of [
    [0, 0.102, "scrollTrefoilTop"],
    [-0.062, 0.045, "scrollTrefoilL"],
    [0.062, 0.045, "scrollTrefoilR"],
  ] as Array<[number, number, string]>) {
    b.spike(
      [x0 + dx * 0.48, 0.405 + dy * 0.18, zFront + 0.058],
      [x0 + dx, 0.405 + dy, zFront + 0.065],
      null,
      0.028,
      {
        color: SCROLL_LIGHT,
        caps: "point",
        name,
        group: "ledge-scroll",
      },
    );
  }

  // A tiny central trefoil boss and three worn rivets finish the carving.
  relief(
    new THREE.CylinderGeometry(0.025, 0.025, 0.038, 8),
    WORN,
    finialBase[0],
    finialBase[1],
    finialBase[2] + 0.015,
    "scrollTrefoilBoss",
  ).rotation.x = Math.PI / 2;

  for (const [dx, dy, name] of [
    [-0.135, 0.14, "scrollRivetL"],
    [0.135, 0.14, "scrollRivetR"],
    [0, 0.315, "scrollRivetTop"],
  ] as Array<[number, number, string]>) {
    relief(
      new THREE.SphereGeometry(0.014, 6, 4),
      WORN,
      x0 + dx,
      0.105 + dy,
      zFront + 0.061,
      name,
    );
  }

  function SCROLL_DARK_SAFE() {
    return "#505360";
  }
}
    return addLedgeGargoyleScroll;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addTalonClaws(b: Builder) {
  const CLAW = "#242331";
  const CLAW_EDGE = "#3b3948";
  const WORN = "#b8b2a2";
  const JOINT = "#5d606d";

  const sides = [1, -1] as const;

  for (const s of sides) {
    const bone = s > 0 ? "ankleL" : "ankleR";

    // Three broad angular toe-cap plates, giving each foot a carved armored silhouette.
    const toes = [
      { x: 0.34, z: 0.57, w: 0.105, d: 0.18 },
      { x: 0.48, z: 0.60, w: 0.12, d: 0.21 },
      { x: 0.61, z: 0.56, w: 0.10, d: 0.17 },
    ];

    for (let i = 0; i < toes.length; i++) {
      const t = toes[i];
      const x = s * t.x;

      b.part(
        new THREE.BoxGeometry(t.w, 0.075, t.d),
        CLAW_EDGE,
        {
          at: [x, 0.315, t.z],
          bone,
          name: `s26_talonCap_${s > 0 ? "L" : "R"}_${i}`,
          flat: true,
        },
      );

      // Raised central ridge on each toe cap.
      b.part(
        new THREE.BoxGeometry(t.w * 0.34, 0.035, t.d * 0.76),
        JOINT,
        {
          at: [x, 0.365, t.z + 0.008],
          bone,
          name: `s26_talonRidge_${s > 0 ? "L" : "R"}_${i}`,
          flat: true,
        },
      );

      // A dark collar makes the claw appear rooted into the stone foot.
      b.part(
        new THREE.CylinderGeometry(t.w * 0.48, t.w * 0.58, 0.055, 6),
        CLAW,
        {
          at: [x, 0.285, t.z - 0.045],
          bone,
          name: `s26_talonCollar_${s > 0 ? "L" : "R"}_${i}`,
          flat: true,
        },
      );
    }

    // Angular, hooked talons. They are deliberately separated so the three claws read at a glance.
    const claws = [
      {
        base: [s * 0.34, 0.30, 0.65] as [number, number, number],
        bend: [s * 0.335, 0.245, 0.82] as [number, number, number],
        tip: [s * 0.32, 0.145, 0.925] as [number, number, number],
        r: 0.052,
      },
      {
        base: [s * 0.48, 0.30, 0.69] as [number, number, number],
        bend: [s * 0.48, 0.235, 0.875] as [number, number, number],
        tip: [s * 0.47, 0.12, 0.995] as [number, number, number],
        r: 0.06,
      },
      {
        base: [s * 0.61, 0.30, 0.64] as [number, number, number],
        bend: [s * 0.615, 0.245, 0.81] as [number, number, number],
        tip: [s * 0.63, 0.15, 0.91] as [number, number, number],
        r: 0.048,
      },
    ];

    for (let i = 0; i < claws.length; i++) {
      const c = claws[i];
      const tag = `s26_claw_${s > 0 ? "L" : "R"}_${i}`;

      b.spike(c.base, c.bend, null, c.r, {
        color: CLAW,
        bone,
        caps: "flat",
        name: `${tag}_upper`,
      });

      b.spike(c.bend, c.tip, null, c.r * 0.72, {
        color: CLAW,
        bone,
        caps: "point",
        name: `${tag}_hook`,
      });

      // Pale chipped tips are short angular caps, not floating ornaments.
      const tipDir: [number, number, number] = [
        c.tip[0] - c.bend[0],
        c.tip[1] - c.bend[1],
        c.tip[2] - c.bend[2],
      ];
      const tipBase: [number, number, number] = [
        c.tip[0] - tipDir[0] * 0.18,
        c.tip[1] - tipDir[1] * 0.18,
        c.tip[2] - tipDir[2] * 0.18,
      ];

      b.spike(tipBase, c.tip, null, c.r * 0.42, {
        color: WORN,
        bone,
        caps: "point",
        name: `${tag}_wornTip`,
      });

      // A tiny side chip on each outer face catches the light like a carved facet.
      const chipX = c.base[0] + s * 0.026;
      b.part(
        new THREE.TetrahedronGeometry(c.r * 0.34, 0),
        WORN,
        {
          at: [chipX, c.base[1] + 0.035, c.base[2] + 0.055],
          bone,
          name: `${tag}_chip`,
          flat: true,
        },
      );
    }

    // Small engraved transverse bands unify the claws with the gothic carved style.
    for (let i = 0; i < 3; i++) {
      const t = claws[i];
      const p0: [number, number, number] = [
        t.base[0],
        t.base[1] + 0.018,
        t.base[2] + 0.035,
      ];
      const p1: [number, number, number] = [
        t.base[0],
        t.base[1] + 0.018,
        t.base[2] + 0.075,
      ];
      b.rod(p0, p1, 0.012, {
        color: WORN,
        bone,
        caps: "flat",
        name: `s26_clawBand_${s > 0 ? "L" : "R"}_${i}`,
      });
    }
  }
}
    return addTalonClaws;
  })(),
);
