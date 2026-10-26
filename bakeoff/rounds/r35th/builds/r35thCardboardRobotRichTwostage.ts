import * as THREE from "three";
import { type Builder, createBuilder, grain, mix, mottle, noise, paint, polyline, resolve, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "cardboard-box-robot-kid",
  description:
    "A stylized kid wearing a chunky cardboard-box robot costume, with a square cab helmet, boxy limbs, folded flaps, dark inset panels, and a playful handmade craft silhouette.",
};

const CARDBOARD = "#b9783f";
const CARDBOARD_LIGHT = "#d79a56";
const CARDBOARD_GOLD = "#e4ad63";
const CARDBOARD_DARK = "#8b512f";
const EDGE = "#633d2d";
const EDGE_LIGHT = "#a9673b";
const INNER = "#242a32";
const SCREEN = "#18232c";
const RUBBER = "#30363e";
const RUBBER_LIGHT = "#4b555b";
const METAL = "#a6a39a";
const METAL_DARK = "#5c6264";
const WARNING = "#d94d3f";
const YELLOW = "#f0c34f";
const SKIN = "#d8905b";

function boxEdgeDistance(
  p: THREE.Vector3,
  n: THREE.Vector3,
  center: readonly [number, number, number],
  half: readonly [number, number, number],
) {
  const dx = Math.abs(Math.abs(p.x - center[0]) - half[0]);
  const dy = Math.abs(Math.abs(p.y - center[1]) - half[1]);
  const dz = Math.abs(Math.abs(p.z - center[2]) - half[2]);

  if (Math.abs(n.z) >= Math.abs(n.x) && Math.abs(n.z) >= Math.abs(n.y)) {
    return Math.min(dx, dy);
  }
  if (Math.abs(n.x) >= Math.abs(n.y)) {
    return Math.min(dy, dz);
  }
  return Math.min(dx, dz);
}

function nearSegment(
  u: number,
  v: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  width: number,
) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq > 0
      ? Math.max(0, Math.min(1, ((u - ax) * dx + (v - ay) * dy) / lengthSq))
      : 0;
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(u - cx, v - cy) < width;
}

const HULL_FIBRE = mottle(
  grain(CARDBOARD, CARDBOARD_LIGHT, {
    size: 0.055,
    axis: [1, 0, 0],
    seed: 17,
  }),
  CARDBOARD_DARK,
  { size: 0.17, contrast: 1.6, seed: 19 },
);

const HULL_PAPER = paint((p, n) => {
  let c = resolve(HULL_FIBRE, p, n);
  const edge = boxEdgeDistance(p, n, [0, 1.2, 0], [0.64, 0.47, 0.38]);

  if (edge < 0.034) c = mix(c, EDGE, 0.3);
  if (n.y > 0.58) c = mix(c, CARDBOARD_LIGHT, 0.1);

  const scuff = noise(p, 0.095, 23);
  if (scuff > 0.79) c = mix(c, CARDBOARD_LIGHT, 0.16);
  if (scuff < 0.15) c = mix(c, CARDBOARD_DARK, 0.12);

  return c;
});

const HELMET_FIBRE = mottle(
  grain(CARDBOARD, CARDBOARD_LIGHT, {
    size: 0.072,
    axis: [1, 0, 0],
    seed: 31,
  }),
  CARDBOARD_DARK,
  { size: 0.2, contrast: 1.45, seed: 37 },
);

const HELMET_PAPER = paint((p, n) => {
  let c = resolve(HELMET_FIBRE, p, n);
  const edge = boxEdgeDistance(p, n, [0, 2.0, 0.06], [0.46, 0.34, 0.38]);

  if (edge < 0.03) c = mix(c, EDGE, 0.26);
  if (n.y > 0.5) c = mix(c, CARDBOARD_LIGHT, 0.16);
  if (Math.abs(n.x) > 0.58) c = mix(c, CARDBOARD_DARK, 0.08);

  const tape = noise(p, 0.14, 43);
  if (tape > 0.84 && Math.abs(p.z - 0.06) < 0.32) {
    c = mix(c, CARDBOARD_GOLD, 0.25);
  }

  return c;
});

const LIMB_FIBRE = mottle(
  grain(CARDBOARD, CARDBOARD_LIGHT, {
    size: 0.034,
    axis: [1, 0, 0],
    seed: 53,
  }),
  CARDBOARD_DARK,
  { size: 0.11, contrast: 1.4, seed: 59 },
);

const LIMB_PAPER = paint((p, n) => {
  let c = resolve(LIMB_FIBRE, p, n);

  if (Math.abs(p.y - 1.15) < 0.028) c = mix(c, EDGE, 0.42);
  if (Math.abs(p.y - 1.52) < 0.025) c = mix(c, EDGE_LIGHT, 0.24);
  if (n.y > 0.55) c = mix(c, CARDBOARD_LIGHT, 0.08);

  const tape = noise(p, 0.075, 67);
  if (tape > 0.86) c = mix(c, CARDBOARD_LIGHT, 0.32);

  return c;
});

const SIDE_PANEL_BASE = grain(CARDBOARD_DARK, CARDBOARD, {
  size: 0.042,
  axis: [0, 1, 0],
  seed: 71,
});

const SIDE_PANEL_MARKS = paint((p, n) => {
  let c = resolve(SIDE_PANEL_BASE, p, n);

  if (Math.abs(n.x) > 0.55) {
    const diagonal = p.y - 0.8 * (p.z + 0.25);

    if (Math.abs(diagonal - 1.0) < 0.048) c = CARDBOARD_GOLD;
    if (Math.abs(diagonal - 1.28) < 0.048) c = CARDBOARD_GOLD;

    const u = (p.z + 0.25) / 0.54;
    const v = (p.y - 0.91) / 0.68;

    const zero =
      nearSegment(u, v, 0.15, 0.19, 0.15, 0.34, 0.012) ||
      nearSegment(u, v, 0.22, 0.19, 0.22, 0.34, 0.012) ||
      nearSegment(u, v, 0.15, 0.19, 0.22, 0.19, 0.012) ||
      nearSegment(u, v, 0.15, 0.34, 0.22, 0.34, 0.012);

    const seven =
      nearSegment(u, v, 0.27, 0.34, 0.36, 0.34, 0.012) ||
      nearSegment(u, v, 0.36, 0.34, 0.29, 0.19, 0.012);

    if (zero || seven) c = mix(c, EDGE, 0.72);

    const pencil =
      Math.abs(v - (0.56 + 0.07 * Math.sin(u * 18))) < 0.009 &&
      u > 0.5 &&
      u < 0.9;

    if (pencil) c = mix(c, EDGE_LIGHT, 0.65);
    if (noise(p, 0.06, 79) > 0.86) c = mix(c, CARDBOARD_LIGHT, 0.15);
  }

  const edge = Math.min(
    Math.abs(Math.abs(p.y - 1.25) - 0.34),
    Math.abs(Math.abs(p.z - 0.02) - 0.27),
  );
  if (Math.abs(n.x) > 0.55 && edge < 0.025) c = mix(c, EDGE, 0.3);

  return c;
});

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cab",
    what: "A cheerful robot light bar on the helmet roof: a thin cardboard housing, six glowing lamps alternating CYAN and MAGENTA, two folded mounting brackets, and tiny dark wiring. Keep it playful and handmade.",
    at: [0, 2.38, 0.08],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.72, 0.22, 0.28],
  },
  {
    id: "faceLenses",
    kind: "add",
    part: "cabScreen",
    what: "Two oversized friendly robot eyes on the front screen, made from rounded lens frames with bright WHITE highlights, CYAN irises, and dark pupils. Leave a little space between them and keep them readable from the front.",
    at: [0, 2.01, 0.47],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.58, 0.27, 0.08],
  },
  {
    id: "mouthGrille",
    kind: "add",
    part: "jawPanel",
    what: "A small smiling speaker grille across the lower face: a dark rounded rectangular plate, five short pale slots, and two tiny corner bolts. It should feel like a kid's robot costume rather than a military machine.",
    at: [0, 1.77, 0.47],
    normal: [0, 0, 1],
    bone: "jaw",
    room: [0.52, 0.16, 0.08],
  },
  {
    id: "chestEmblem",
    kind: "add",
    part: "hullFront",
    what: "A bold handmade robot emblem centered on the chest: a dark outlined badge with a bright YELLOW lightning-bolt star, two little rivets, and a short cardboard nameplate beneath it.",
    at: [0, 1.24, 0.39],
    normal: [0, 0, 1],
    bone: "chest",
    room: [0.55, 0.48, 0.07],
  },
  {
    id: "shoulderBolts",
    kind: "add",
    part: "shoulders",
    what: "Large cardboard shoulder bolt assemblies on both shoulders: concentric octagonal plates, one pale highlight wedge, and a dark centre cap on each side. Mirror the pair.",
    at: [0.72, 1.52, 0.13],
    normal: [0, 0, 1],
    bone: "shoulderL",
    room: [0.28, 0.3, 0.18],
  },
  {
    id: "armCables",
    kind: "add",
    part: "forearmL",
    what: "A pair of chunky exposed costume cables running from each shoulder toward the wrists, with three dark cable bands and small yellow cardboard cable clips. Mirror them on both arms.",
    at: [0.79, 1.25, 0.16],
    normal: [0, 0, 1],
    bone: "elbowL",
    room: [0.22, 0.48, 0.18],
  },
  {
    id: "handClaws",
    kind: "add",
    part: "handL",
    what: "Friendly mitten-like robot hands with three short cardboard finger blocks and one thumb block per hand. Use warm cardboard, dark separation seams, and no sharp weapon-like points.",
    at: [0.98, 0.76, 0.16],
    normal: [0, 0, 1],
    bone: "wristL",
    room: [0.42, 0.34, 0.4],
  },
  {
    id: "kneePlates",
    kind: "add",
    part: "kneeL",
    what: "Large octagonal knee plates on both legs with dark outlines, warm gold centres, and two cardboard rivets each. Mirror the plates and keep the lower leg silhouette clear.",
    at: [0.34, 0.49, 0.18],
    normal: [0, 0, 1],
    bone: "kneeL",
    room: [0.28, 0.28, 0.08],
  },
  {
    id: "bootTreads",
    kind: "add",
    part: "bootL",
    what: "Simple chunky boot tread details: three broad dark rubber strips across each cardboard foot, with a small yellow heel marker. Mirror both feet and keep the soles flat on the floor.",
    at: [0.34, 0.1, 0.48],
    normal: [0, 0, 1],
    bone: "footL",
    room: [0.5, 0.18, 0.5],
  },
  {
    id: "backExhaust",
    kind: "add",
    part: "hull",
    what: "Two harmless cardboard exhaust stacks peeking from behind the torso, each with a dark opening, a folded rim, and one short dangling cable. They are costume decorations, not flames.",
    at: [0, 1.32, -0.4],
    normal: [0, 0, -1],
    bone: "chest",
    room: [0.52, 0.5, 0.16],
  },
  {
    id: "cardboardGrain",
    kind: "texture",
    part: "hull",
    what: "Subtle cardboard craft texture across the torso: broad warm kraft-paper fibres, faint horizontal corrugation lines, slightly darker fold shadows at the edges, and a few soft scuffed patches. Keep the chest emblem panel mostly calm and readable.",
  },
  {
    id: "helmetCardboard",
    kind: "texture",
    part: "cab",
    what: "Warm kraft cardboard texture on the helmet shell: broad paper fibres, slightly lighter top-facing faces, darker side folds, and a few irregular handmade tape marks. Keep the front screen border plain and crisp.",
  },
  {
    id: "sidePanelMarks",
    kind: "texture",
    part: "hullSideL",
    what: "Hand-painted cardboard side markings in CARDBOARD_GOLD and EDGE: two wide diagonal caution bands, a tiny faded unit number near the rear, and a few worn pencil construction marks. Mirror the pattern on hullSideR.",
  },
  {
    id: "limbPaper",
    kind: "texture",
    part: "forearmL",
    what: "Small-scale cardboard fibre texture on both forearms and upper arms, with darker folded seams around the elbow and a few pale tape patches. Keep the cable request area visible above the texture.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

type BoneLike = any;

function box(
  b: Builder,
  size: readonly [number, number, number],
  color: any,
  at: readonly [number, number, number],
  bone: BoneLike,
  name: string,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function cylinder(
  b: Builder,
  radius: number,
  height: number,
  color: any,
  at: readonly [number, number, number],
  bone: BoneLike,
  name: string,
  dir: readonly [number, number, number] = [0, 1, 0],
  segments = 8,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    bone,
    dir,
    name,
    flat: true,
  });
}

function seam(
  b: Builder,
  size: readonly [number, number, number],
  at: readonly [number, number, number],
  bone: BoneLike,
  name: string,
  color = EDGE,
) {
  return box(b, size, color, at, bone, name);
}

function addArmDetails(
  b: Builder,
  side: number,
  arm: any,
  prefix: string,
) {
  const shoulderX = side * 0.72;
  const elbowX = side * 0.83;
  const wristX = side * 0.96;

  box(
    b,
    [0.34, 0.28, 0.48],
    CARDBOARD_LIGHT,
    [shoulderX, 1.52, 0.02],
    arm.joints[0],
    `${prefix}Shoulder`,
  );

  seam(
    b,
    [0.36, 0.035, 0.5],
    [shoulderX, 1.52, 0.27],
    arm.joints[0],
    `${prefix}ShoulderFrontFold`,
    EDGE_LIGHT,
  );

  cylinder(
    b,
    0.105,
    0.09,
    METAL_DARK,
    [elbowX, 1.15, 0.02],
    arm.joints[1],
    `${prefix}ElbowCap`,
    [1, 0, 0],
    8,
  );

  cylinder(
    b,
    0.068,
    0.105,
    CARDBOARD_GOLD,
    [elbowX, 1.15, 0.075],
    arm.joints[1],
    `${prefix}ElbowHighlight`,
    [0, 0, 1],
    8,
  );

  box(
    b,
    [0.36, 0.27, 0.33],
    CARDBOARD_LIGHT,
    [wristX, 0.75, 0.08],
    arm.tip,
    `${prefix}Hand`,
  );

  box(
    b,
    [0.13, 0.18, 0.2],
    CARDBOARD_GOLD,
    [wristX + side * 0.18, 0.74, 0.14],
    arm.tip,
    `${prefix}Thumb`,
  );

  box(
    b,
    [0.1, 0.13, 0.2],
    CARDBOARD,
    [wristX - side * 0.1, 0.66, 0.2],
    arm.tip,
    `${prefix}FingerA`,
  );

  box(
    b,
    [0.1, 0.13, 0.2],
    CARDBOARD,
    [wristX, 0.65, 0.2],
    arm.tip,
    `${prefix}FingerB`,
  );

  box(
    b,
    [0.1, 0.13, 0.2],
    CARDBOARD,
    [wristX + side * 0.1, 0.66, 0.2],
    arm.tip,
    `${prefix}FingerC`,
  );

  seam(
    b,
    [0.38, 0.028, 0.025],
    [wristX, 0.86, 0.27],
    arm.tip,
    `${prefix}HandTopFold`,
    EDGE,
  );
}

function addLegDetails(
  b: Builder,
  side: number,
  leg: any,
  prefix: string,
) {
  const hipX = side * 0.33;
  const kneeX = side * 0.34;
  const ankleX = side * 0.34;

  box(
    b,
    [0.38, 0.3, 0.38],
    CARDBOARD_LIGHT,
    [hipX, 0.8, 0.02],
    leg.joints[0],
    `${prefix}HipBlock`,
  );

  box(
    b,
    [0.34, 0.27, 0.31],
    CARDBOARD,
    [kneeX, 0.47, 0.06],
    leg.joints[1],
    `${prefix}KneeBlock`,
  );

  seam(
    b,
    [0.35, 0.035, 0.03],
    [kneeX, 0.59, 0.22],
    leg.joints[1],
    `${prefix}KneeFold`,
    EDGE_LIGHT,
  );

  cylinder(
    b,
    0.095,
    0.08,
    METAL_DARK,
    [ankleX, 0.2, 0.04],
    leg.joints[2],
    `${prefix}AnkleCap`,
    [1, 0, 0],
    8,
  );

  box(
    b,
    [0.5, 0.22, 0.58],
    CARDBOARD_DARK,
    [ankleX, 0.11, 0.3],
    leg.tip,
    `${prefix}Boot`,
  );

  box(
    b,
    [0.44, 0.06, 0.52],
    RUBBER,
    [ankleX, 0.04, 0.32],
    leg.tip,
    `${prefix}Sole`,
  );

  seam(
    b,
    [0.46, 0.035, 0.035],
    [ankleX, 0.19, 0.58],
    leg.tip,
    `${prefix}ToeFold`,
    EDGE_LIGHT,
  );
}

export default function build() {
  const b = createBuilder({
    name: "cardboard-box-robot-kid",
    detail: 1,
  });

  // Skeleton first: the costume is a riggable child-sized humanoid.
  const hips = b.joint("hips", {
    at: [0, 0.92, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const chest = b.joint("chest", {
    parent: hips,
    at: [0, 1.2, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.68, 0],
    dir: [0, 1, 0],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.82, 0.06],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.75, 0.41],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const armL = b.chain(
    "armL",
    polyline([
      [0.66, 1.52, 0.01],
      [0.82, 1.16, 0.02],
      [0.96, 0.77, 0.08],
    ]),
    {
      parent: chest,
      names: ["shoulderL", "elbowL", "wristL"],
      role: "arm",
      contact: [0.96, 0.62, 0.08],
    },
  );

  const armR = b.chain(
    "armR",
    polyline([
      [-0.66, 1.52, 0.01],
      [-0.82, 1.16, 0.02],
      [-0.96, 0.77, 0.08],
    ]),
    {
      parent: chest,
      names: ["shoulderR", "elbowR", "wristR"],
      role: "arm",
      contact: [-0.96, 0.62, 0.08],
    },
  );

  const legL = b.chain(
    "legL",
    polyline([
      [0.32, 0.88, 0],
      [0.34, 0.5, 0.04],
      [0.34, 0.2, 0.08],
      [0.34, 0.15, 0.3],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.34, 0, 0.3],
    },
  );

  const legR = b.chain(
    "legR",
    polyline([
      [-0.32, 0.88, 0],
      [-0.34, 0.5, 0.04],
      [-0.34, 0.2, 0.08],
      [-0.34, 0.15, 0.3],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.34, 0, 0.3],
    },
  );

  // Main torso box and its broad front panel.
  box(b, [1.28, 0.94, 0.76], HULL_PAPER, [0, 1.2, 0], chest, "hull");

  box(
    b,
    [0.96, 0.62, 0.035],
    CARDBOARD_LIGHT,
    [0, 1.25, 0.395],
    chest,
    "hullFront",
  );

  box(
    b,
    [0.9, 0.08, 0.04],
    CARDBOARD_GOLD,
    [0, 1.69, 0.38],
    chest,
    "hullTopFold",
  );

  box(
    b,
    [0.94, 0.06, 0.04],
    EDGE_LIGHT,
    [0, 0.74, 0.39],
    chest,
    "hullBottomFold",
  );

  box(
    b,
    [0.045, 0.82, 0.045],
    EDGE,
    [0.625, 1.2, 0.39],
    chest,
    "hullFrontSeamL",
  );

  box(
    b,
    [0.045, 0.82, 0.045],
    EDGE,
    [-0.625, 1.2, 0.39],
    chest,
    "hullFrontSeamR",
  );

  box(
    b,
    [0.06, 0.68, 0.54],
    SIDE_PANEL_MARKS,
    [0.655, 1.25, 0.02],
    chest,
    "hullSideL",
  );

  box(
    b,
    [0.06, 0.68, 0.54],
    SIDE_PANEL_MARKS,
    [-0.655, 1.25, 0.02],
    chest,
    "hullSideR",
  );

  box(
    b,
    [1.1, 0.06, 0.6],
    CARDBOARD_LIGHT,
    [0, 1.7, 0.01],
    chest,
    "hullTopFlap",
  );

  box(
    b,
    [0.26, 0.06, 0.04],
    EDGE,
    [0, 1.705, 0.31],
    chest,
    "hullTopCrease",
  );

  // Neck collar and the large cardboard cab.
  box(
    b,
    [0.42, 0.18, 0.42],
    INNER,
    [0, 1.68, 0.02],
    neck,
    "neckInterior",
  );

  cylinder(
    b,
    0.31,
    0.09,
    CARDBOARD_DARK,
    [0, 1.72, 0.02],
    neck,
    "neckCollar",
    [0, 1, 0],
    8,
  );

  box(
    b,
    [0.92, 0.68, 0.76],
    HELMET_PAPER,
    [0, 2.0, 0.06],
    head,
    "cab",
  );

  box(
    b,
    [0.78, 0.08, 0.04],
    CARDBOARD_LIGHT,
    [0, 2.34, 0.06],
    head,
    "cabTopFold",
  );

  box(
    b,
    [0.06, 0.56, 0.04],
    EDGE_LIGHT,
    [0.47, 2.0, 0.43],
    head,
    "cabRightFold",
  );

  box(
    b,
    [0.06, 0.56, 0.04],
    EDGE_LIGHT,
    [-0.47, 2.0, 0.43],
    head,
    "cabLeftFold",
  );

  box(
    b,
    [0.7, 0.42, 0.035],
    SCREEN,
    [0, 2.03, 0.45],
    head,
    "cabScreen",
  );

  box(
    b,
    [0.76, 0.045, 0.04],
    CARDBOARD_GOLD,
    [0, 2.27, 0.47],
    head,
    "cabScreenTopFrame",
  );

  box(
    b,
    [0.76, 0.045, 0.04],
    CARDBOARD_DARK,
    [0, 1.79, 0.47],
    head,
    "cabScreenBottomFrame",
  );

  box(
    b,
    [0.06, 0.46, 0.04],
    CARDBOARD_GOLD,
    [0.39, 2.03, 0.47],
    head,
    "cabScreenFrameL",
  );

  box(
    b,
    [0.06, 0.46, 0.04],
    CARDBOARD_GOLD,
    [-0.39, 2.03, 0.47],
    head,
    "cabScreenFrameR",
  );

  box(
    b,
    [0.18, 0.46, 0.8],
    CARDBOARD_DARK,
    [0.5, 2.0, 0.04],
    head,
    "cabEarL",
  );

  box(
    b,
    [0.18, 0.46, 0.8],
    CARDBOARD_DARK,
    [-0.5, 2.0, 0.04],
    head,
    "cabEarR",
  );

  cylinder(
    b,
    0.13,
    0.045,
    CARDBOARD_GOLD,
    [0.59, 2.02, 0.04],
    head,
    "cabEarBoltL",
    [1, 0, 0],
    8,
  );

  cylinder(
    b,
    0.13,
    0.045,
    CARDBOARD_GOLD,
    [-0.59, 2.02, 0.04],
    head,
    "cabEarBoltR",
    [1, 0, 0],
    8,
  );

  // Separate lower jaw piece, leaving a clear opening for the stage-two grille.
  box(
    b,
    [0.68, 0.18, 0.54],
    CARDBOARD_LIGHT,
    [0, 1.75, 0.1],
    jaw,
    "jawBox",
  );

  box(
    b,
    [0.56, 0.14, 0.035],
    SCREEN,
    [0, 1.77, 0.42],
    jaw,
    "jawPanel",
  );

  box(
    b,
    [0.62, 0.035, 0.04],
    EDGE,
    [0, 1.88, 0.44],
    jaw,
    "jawUpperSeam",
  );

  // Boxy arms, with rigid cardboard sections and oversized costume shoulders.
  b.sweep(armL, () => [0.13, 0.14], {
    color: LIMB_PAPER,
    section: "box",
    skin: "rigid",
    caps: "flat",
    name: "upperArmL",
    group: "limbs",
  });

  b.sweep(armR, () => [0.13, 0.14], {
    color: LIMB_PAPER,
    section: "box",
    skin: "rigid",
    caps: "flat",
    name: "upperArmR",
    group: "limbs",
  });

  addArmDetails(b, 1, armL, "armL");
  addArmDetails(b, -1, armR, "armR");

  const shoulderFlap: [number, number][] = [
    [-0.18, 0],
    [0.2, 0],
    [0.16, 0.2],
    [-0.13, 0.24],
  ];

  b.extrude(shoulderFlap, {
    at: [0.73, 1.42, 0.29],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.028,
    bevel: 0.006,
    bone: armL.joints[0],
    color: CARDBOARD_GOLD,
    name: "shoulderFlapL",
  });

  b.extrude(shoulderFlap, {
    at: [-0.73, 1.42, 0.29],
    x: [-1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.028,
    bevel: 0.006,
    bone: armR.joints[0],
    color: CARDBOARD_GOLD,
    name: "shoulderFlapR",
  });

  seam(
    b,
    [0.28, 0.035, 0.03],
    [0.82, 1.39, 0.17],
    armL.joints[0],
    "shoulderFoldL",
  );

  seam(
    b,
    [0.28, 0.035, 0.03],
    [-0.82, 1.39, 0.17],
    armR.joints[0],
    "shoulderFoldR",
  );

  // Short, sturdy box legs and broad flat boots.
  b.sweep(legL, () => [0.15, 0.14], {
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "flat",
    name: "legL",
    group: "limbs",
  });

  b.sweep(legR, () => [0.15, 0.14], {
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "flat",
    name: "legR",
    group: "limbs",
  });

  addLegDetails(b, 1, legL, "legL");
  addLegDetails(b, -1, legR, "legR");

  // Two broad cardboard hip flaps overlap the torso and make the waist read as a costume box.
  box(
    b,
    [0.48, 0.18, 0.78],
    CARDBOARD_LIGHT,
    [0.35, 0.87, 0.01],
    hips,
    "hipFlapL",
  );

  box(
    b,
    [0.48, 0.18, 0.78],
    CARDBOARD_LIGHT,
    [-0.35, 0.87, 0.01],
    hips,
    "hipFlapR",
  );

  seam(
    b,
    [0.035, 0.14, 0.7],
    [0.6, 0.88, 0.4],
    hips,
    "hipFlapEdgeL",
  );

  seam(
    b,
    [0.035, 0.14, 0.7],
    [-0.6, 0.88, 0.4],
    hips,
    "hipFlapEdgeR",
  );

  // A few exposed costume fasteners give the flat-colour stage a clear handmade construction language.
  cylinder(
    b,
    0.045,
    0.035,
    CARDBOARD_GOLD,
    [0.49, 1.55, 0.4],
    chest,
    "torsoRivetL",
    [0, 0, 1],
    8,
  );

  cylinder(
    b,
    0.045,
    0.035,
    CARDBOARD_GOLD,
    [-0.49, 1.55, 0.4],
    chest,
    "torsoRivetR",
    [0, 0, 1],
    8,
  );

  cylinder(
    b,
    0.038,
    0.035,
    EDGE_LIGHT,
    [0.48, 0.93, 0.4],
    hips,
    "waistRivetL",
    [0, 0, 1],
    8,
  );

  cylinder(
    b,
    0.038,
    0.035,
    EDGE_LIGHT,
    [-0.48, 0.93, 0.4],
    hips,
    "waistRivetR",
    [0, 0, 1],
    8,
  );

  // Flat side strips and back flaps leave broad surfaces for later textures.
  box(
    b,
    [0.06, 0.62, 0.56],
    EDGE_LIGHT,
    [0.69, 1.25, -0.23],
    chest,
    "hullRearFoldL",
  );

  box(
    b,
    [0.06, 0.62, 0.56],
    EDGE_LIGHT,
    [-0.69, 1.25, -0.23],
    chest,
    "hullRearFoldR",
  );

  box(
    b,
    [0.94, 0.55, 0.045],
    CARDBOARD_DARK,
    [0, 1.25, -0.405],
    chest,
    "hullBackPanel",
  );

  box(
    b,
    [0.84, 0.045, 0.04],
    CARDBOARD_GOLD,
    [0, 1.54, -0.44],
    chest,
    "hullBackFoldTop",
  );

  box(
    b,
    [0.84, 0.045, 0.04],
    EDGE,
    [0, 0.96, -0.44],
    chest,
    "hullBackFoldBottom",
  );

  for (const add of STAGE2) add(b);

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const CYAN = "#45e3e8";
  const MAGENTA = "#ed62d8";
  const LAMP_HIGHLIGHT = "#fff4d2";

  const bone = "head";

  const roofSurface = b.surface(b.root);
  const roof =
    roofSurface.ray([0, 2.58, 0.08], [0, -1, 0]) ??
    roofSurface.nearest([0, 2.38, 0.08]);

  const x0 = roof.at.x;
  const y0 = roof.at.y;
  const z0 = roof.at.z;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: readonly [number, number, number],
    name: string,
    extra: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      bone,
      name: `s21${name}`,
      flat: true,
      ...extra,
    });

  const box = (
    size: readonly [number, number, number],
    color: string,
    at: readonly [number, number, number],
    name: string,
    extra: Record<string, unknown> = {},
  ) => part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, name, extra);

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: readonly [number, number, number],
    name: string,
    dir: readonly [number, number, number] = [0, 1, 0],
    segments = 8,
    extra: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      at,
      name,
      {
        dir,
        ...extra,
      },
    );

  const rod = (
    a: readonly [number, number, number],
    c: readonly [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      bone,
      caps: "round",
      name: `s21${name}`,
      group: "roof-lightbar",
    });

  // A thin shadow layer makes the housing read as a separate folded piece of cardboard.
  box(
    [0.66, 0.018, 0.18],
    EDGE,
    [x0, y0 + 0.008, z0],
    "LightbarUnderside",
  );

  // Main folded housing, deliberately squat so it stays inside the reserved roof room.
  box(
    [0.64, 0.05, 0.16],
    CARDBOARD_LIGHT,
    [x0, y0 + 0.027, z0],
    "LightbarHousing",
  );

  box(
    [0.58, 0.014, 0.14],
    CARDBOARD_GOLD,
    [x0, y0 + 0.058, z0],
    "LightbarTopFold",
  );

  // Front lip and side fold lines.
  box(
    [0.56, 0.018, 0.018],
    EDGE_LIGHT,
    [x0, y0 + 0.037, z0 + 0.084],
    "LightbarFrontLip",
  );

  for (const s of [-1, 1]) {
    box(
      [0.018, 0.042, 0.17],
      EDGE,
      [x0 + s * 0.305, y0 + 0.027, z0],
      s < 0 ? "LightbarLeftFold" : "LightbarRightFold",
    );
  }

  // Two folded mounting brackets, each built from a dark upright, a gold top tab,
  // and a visible cardboard rivet.
  for (const s of [-1, 1]) {
    const x = x0 + s * 0.265;

    box(
      [0.07, 0.074, 0.13],
      CARDBOARD_DARK,
      [x, y0 + 0.037, z0],
      s < 0 ? "MountBracketL" : "MountBracketR",
    );

    box(
      [0.09, 0.014, 0.15],
      CARDBOARD_GOLD,
      [x, y0 + 0.078, z0],
      s < 0 ? "MountBracketTabL" : "MountBracketTabR",
    );

    cylinder(
      0.018,
      0.012,
      EDGE_LIGHT,
      [x, y0 + 0.041, z0 + 0.071],
      s < 0 ? "MountRivetL" : "MountRivetR",
      [0, 0, 1],
      8,
    );

    box(
      [0.018, 0.046, 0.018],
      EDGE,
      [x - s * 0.035, y0 + 0.035, z0 + 0.073],
      s < 0 ? "MountFoldL" : "MountFoldR",
    );
  }

  // Six low-poly lamp sockets and glowing faceted domes.
  const lampXs = [-0.25, -0.15, -0.05, 0.05, 0.15, 0.25];

  lampXs.forEach((lx, i) => {
    const x = x0 + lx;
    const color = i % 2 === 0 ? CYAN : MAGENTA;

    cylinder(
      0.037,
      0.012,
      EDGE,
      [x, y0 + 0.071, z0],
      `LampSocket${i}`,
      [0, 1, 0],
      8,
    );

    const lamp = part(
      new THREE.SphereGeometry(0.031, 8, 5),
      color,
      [x, y0 + 0.087, z0],
      `LampGlow${i}`,
      { scale: [1, 0.62, 1] },
    );
    glow(lamp, 1.7);

    // A tiny pale card-like highlight sits toward the front of each lens.
    const highlight = part(
      new THREE.SphereGeometry(0.008, 6, 4),
      LAMP_HIGHLIGHT,
      [x - 0.008, y0 + 0.094, z0 + 0.026],
      `LampHighlight${i}`,
      { scale: [0.8, 0.55, 0.45] },
    );
    glow(highlight, 1.25);
  });

  // Dark wiring rails: one visible along the front and one tucked behind the lamps.
  rod(
    [x0 - 0.285, y0 + 0.074, z0 + 0.087],
    [x0 + 0.285, y0 + 0.074, z0 + 0.087],
    0.005,
    EDGE,
    "FrontWireRail",
  );

  rod(
    [x0 - 0.285, y0 + 0.074, z0 - 0.072],
    [x0 + 0.285, y0 + 0.074, z0 - 0.072],
    0.004,
    EDGE,
    "RearWireRail",
  );

  // Six short jumper wires make the lamps feel plugged into the rails.
  lampXs.forEach((lx, i) => {
    const x = x0 + lx;
    rod(
      [x, y0 + 0.076, z0 + 0.072],
      [x, y0 + 0.082, z0 + 0.026],
      0.0035,
      EDGE,
      `FrontJumper${i}`,
    );
  });

  // Handmade warning stripes on the front fascia.
  for (const s of [-1, 1]) {
    box(
      [0.026, 0.052, 0.019],
      YELLOW,
      [x0 + s * 0.235, y0 + 0.036, z0 + 0.094],
      s < 0 ? "WarningStripeL" : "WarningStripeR",
      { rotation: [0, 0, s * -18] },
    );
  }

  // A tiny stencil label gives the bar a crafted toy-robot identity without
  // competing with the six lights.
  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 32">
      <rect x="1" y="1" width="178" height="30" rx="4" fill="#f0c34f" stroke="#633d2d" stroke-width="3"/>
      <path d="M14 22 L22 7 L30 15 L38 7 L31 24 L23 17 L17 24 Z" fill="#633d2d"/>
      <text x="48" y="22" font-family="monospace" font-size="15" font-weight="bold" letter-spacing="2" fill="#633d2d">LUX-06</text>
    </svg>`,
    { size: 256 },
  );

  part(
    new THREE.PlaneGeometry(0.22, 0.039),
    "#ffffff",
    [x0, y0 + 0.034, z0 + 0.095],
    "LightbarStencil",
    {
      dir: [0, 0, 1],
      axis: "z",
      texture: label,
    },
  );
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addFaceLenses(b: Builder) {
  const WHITE = "#fff7df";
  const CYAN = "#35d9dc";
  const CYAN_DARK = "#087f91";
  const PUPIL = "#101822";
  const SLOT = "#f2c879";

  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="iris" cx="38%" cy="32%" r="72%">
          <stop offset="0" stop-color="#b9ffff"/>
          <stop offset=".28" stop-color="#35d9dc"/>
          <stop offset=".78" stop-color="#1299aa"/>
          <stop offset="1" stop-color="#087f91"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="60" fill="#fff7df"/>
      <circle cx="64" cy="67" r="41" fill="#087f91"/>
      <circle cx="64" cy="65" r="34" fill="url(#iris)"/>
      <path d="M29 49 Q64 17 99 49 Q64 34 29 49Z" fill="#b9ffff" opacity=".5"/>
      <ellipse cx="64" cy="69" rx="13" ry="24" fill="#101822"/>
      <ellipse cx="51" cy="42" rx="11" ry="15" fill="#ffffff"/>
      <circle cx="78" cy="88" r="5" fill="#ffffff"/>
      <path d="M36 103 Q64 116 92 103" fill="none" stroke="#087f91" stroke-width="3" opacity=".65"/>
    </svg>`,
    { size: 256 },
  );

  const roundedPlate = new THREE.Shape();
  const w = 0.24;
  const h = 0.055;
  const r = 0.022;
  roundedPlate.moveTo(-w + r, -h);
  roundedPlate.lineTo(w - r, -h);
  roundedPlate.quadraticCurveTo(w, -h, w, -h + r);
  roundedPlate.lineTo(w, h - r);
  roundedPlate.quadraticCurveTo(w, h, w - r, h);
  roundedPlate.lineTo(-w + r, h);
  roundedPlate.quadraticCurveTo(-w, h, -w, h - r);
  roundedPlate.lineTo(-w, -h + r);
  roundedPlate.quadraticCurveTo(-w, -h, -w + r, -h);

  const grilleGeometry = new THREE.ExtrudeGeometry(roundedPlate, {
    depth: 0.018,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.004,
    bevelThickness: 0.003,
    curveSegments: 3,
  });
  grilleGeometry.translate(0, 0, -0.009);

  const eyeY = 2.01;
  const eyeX = 0.17;
  const eyeZ = 0.49;

  for (const side of [-1, 1]) {
    const x = side * eyeX;

    const outerFrame = b.part(
      new THREE.TorusGeometry(0.112, 0.013, 6, 16),
      INNER,
      {
        at: [x, eyeY, eyeZ - 0.006],
        bone: "head",
        dir: [0, 0, 1],
        axis: "z",
        name: side < 0 ? "eyeFrameR" : "eyeFrameL",
        flat: true,
      },
    );

    b.part(new THREE.CircleGeometry(0.108, 16), WHITE, {
      at: [x, eyeY, eyeZ],
      bone: "head",
      dir: [0, 0, 1],
      axis: "z",
      name: side < 0 ? "eyeWhiteR" : "eyeWhiteL",
      flat: true,
    });

    const iris = b.part(new THREE.CircleGeometry(0.103, 20), WHITE, {
      at: [x, eyeY, eyeZ + 0.006],
      bone: "head",
      dir: [0, 0, 1],
      axis: "z",
      texture: eyeTexture,
      name: side < 0 ? "glowingEyeR" : "glowingEyeL",
      flat: true,
    });
    glow(iris, 0.9);

    b.part(new THREE.TorusGeometry(0.083, 0.006, 5, 16), CYAN_DARK, {
      at: [x, eyeY, eyeZ + 0.012],
      bone: "head",
      dir: [0, 0, 1],
      axis: "z",
      name: side < 0 ? "irisRingR" : "irisRingL",
      flat: true,
    });

    b.part(new THREE.BoxGeometry(0.07, 0.018, 0.014), CARDBOARD_GOLD, {
      at: [x, eyeY + 0.125, eyeZ + 0.012],
      bone: "head",
      dir: [0, 0, 1],
      name: side < 0 ? "browR" : "browL",
      flat: true,
    });

    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.014, 8), CARDBOARD_GOLD, {
      at: [x + side * 0.102, eyeY - 0.092, eyeZ + 0.017],
      bone: "head",
      dir: [0, 0, 1],
      name: side < 0 ? "cheekBoltR" : "cheekBoltL",
      flat: true,
    });
  }

  const grille = b.part(grilleGeometry, INNER, {
    at: [0, 1.77, 0.487],
    bone: "jaw",
    name: "mouthGrille",
    flat: true,
  });

  b.part(new THREE.BoxGeometry(0.39, 0.012, 0.012), CARDBOARD_GOLD, {
    at: [0, 1.832, 0.501],
    bone: "jaw",
    dir: [0, 0, 1],
    name: "mouthGrilleTopTrim",
    flat: true,
  });

  b.part(new THREE.BoxGeometry(0.32, 0.009, 0.012), EDGE_LIGHT, {
    at: [0, 1.708, 0.501],
    bone: "jaw",
    dir: [0, 0, 1],
    name: "mouthGrilleBottomTrim",
    flat: true,
  });

  const slotXs = [-0.16, -0.08, 0, 0.08, 0.16];
  for (let i = 0; i < slotXs.length; i++) {
    const x = slotXs[i];
    const y = 1.774 + (Math.abs(x) / 0.16) * 0.018;

    b.part(new THREE.CapsuleGeometry(0.009, 0.032, 3, 8), SLOT, {
      at: [x, y, 0.505],
      bone: "jaw",
      dir: [1, 0, 0],
      name: `mouthSlot${i + 1}`,
      flat: true,
    });
  }

  for (const side of [-1, 1]) {
    const x = side * 0.205;

    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.014, 8), CARDBOARD_GOLD, {
      at: [x, 1.77, 0.507],
      bone: "jaw",
      dir: [0, 0, 1],
      name: side < 0 ? "grilleBoltR" : "grilleBoltL",
      flat: true,
    });

    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.016, 8), EDGE, {
      at: [x, 1.77, 0.516],
      bone: "jaw",
      dir: [0, 0, 1],
      name: side < 0 ? "grilleBoltCapR" : "grilleBoltCapL",
      flat: true,
    });
  }

  return grille;
}
    return addFaceLenses;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addChestEmblem(b: Builder) {
  const front = (geometry: THREE.BufferGeometry, color: string, at: readonly [number, number, number], bone: string, name: string) =>
    b.part(geometry, color, {
      at,
      bone,
      name,
      flat: true,
    });

  const badgeOuter: [number, number][] = [
    [-0.21, -0.16],
    [0.21, -0.16],
    [0.25, -0.1],
    [0.25, 0.1],
    [0.18, 0.16],
    [-0.18, 0.16],
    [-0.25, 0.1],
    [-0.25, -0.1],
  ];

  const badgeInner: [number, number][] = [
    [-0.175, -0.125],
    [0.175, -0.125],
    [0.205, -0.075],
    [0.205, 0.075],
    [0.145, 0.125],
    [-0.145, 0.125],
    [-0.205, 0.075],
    [-0.205, -0.075],
  ];

  const badgeCore: [number, number][] = [
    [-0.135, -0.095],
    [0.135, -0.095],
    [0.16, -0.055],
    [0.16, 0.055],
    [0.11, 0.095],
    [-0.11, 0.095],
    [-0.16, 0.055],
    [-0.16, -0.055],
  ];

  const bolt: [number, number][] = [
    [-0.025, 0.125],
    [0.105, 0.125],
    [0.025, 0.025],
    [0.09, 0.025],
    [-0.075, -0.145],
    [-0.04, -0.045],
    [-0.115, -0.045],
  ];

  b.extrude(badgeOuter, {
    at: [0, 1.26, 0.399],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.018,
    bevel: 0.005,
    bone: "chest",
    color: EDGE,
    name: "s23ChestBadgeOutline",
  });

  b.extrude(badgeInner, {
    at: [0, 1.26, 0.411],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.004,
    bone: "chest",
    color: CARDBOARD_GOLD,
    name: "s23ChestBadgeFace",
  });

  b.extrude(badgeCore, {
    at: [0, 1.26, 0.422],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.003,
    bone: "chest",
    color: EDGE,
    name: "s23ChestBadgeInset",
  });

  b.extrude(bolt, {
    at: [0, 1.26, 0.433],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    bone: "chest",
    color: YELLOW,
    name: "s23ChestLightningBolt",
  });

  for (const side of [-1, 1]) {
    front(
      new THREE.CylinderGeometry(0.019, 0.019, 0.024, 8),
      CARDBOARD_LIGHT,
      [side * 0.18, 1.385, 0.437],
      "chest",
      `s23ChestRivet${side < 0 ? "L" : "R"}`,
    );
  }

  front(
    new THREE.BoxGeometry(0.33, 0.065, 0.026),
    CARDBOARD_DARK,
    [0, 1.045, 0.421],
    "chest",
    "s23ChestNameplate",
  );

  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32">
      <rect width="160" height="32" rx="4" fill="#8b512f"/>
      <path d="M7 6h146M7 26h146" stroke="#e4ad63" stroke-width="2" opacity=".65"/>
      <text x="80" y="22" text-anchor="middle"
        font-family="monospace" font-size="18" font-weight="bold"
        letter-spacing="2" fill="#f7dfaa">KID BOT</text>
    </svg>`,
    { size: 192 },
  );

  b.part(new THREE.PlaneGeometry(0.285, 0.057), "#ffffff", {
    at: [0, 1.045, 0.438],
    dir: [0, 0, 1],
    axis: "z",
    bone: "chest",
    texture: label,
    name: "s23ChestNameplateText",
  });

  const boltPositions: [number, number][] = [
    [-0.095, 1.17],
    [0.095, 1.17],
    [-0.095, 1.35],
    [0.095, 1.35],
  ];

  for (let i = 0; i < boltPositions.length; i++) {
    const [x, y] = boltPositions[i];
    front(
      new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8),
      CARDBOARD_LIGHT,
      [x, y, 0.438],
      "chest",
      `s23BadgeCornerRivet${i + 1}`,
    );
  }

  const shoulderPlate = (
    side: number,
    bone: string,
    suffix: string,
  ) => {
    const cx = side * 0.72;
    const cy = 1.52;
    const baseZ = 0.13;

    front(
      new THREE.CylinderGeometry(0.122, 0.122, 0.018, 8),
      EDGE,
      [cx, cy, baseZ + 0.009],
      bone,
      `s23ShoulderBoltOuter${suffix}`,
    );

    front(
      new THREE.CylinderGeometry(0.101, 0.101, 0.018, 8),
      CARDBOARD_LIGHT,
      [cx, cy, baseZ + 0.033],
      bone,
      `s23ShoulderBoltPlate${suffix}`,
    );

    front(
      new THREE.CylinderGeometry(0.074, 0.074, 0.014, 8),
      CARDBOARD_GOLD,
      [cx, cy, baseZ + 0.056],
      bone,
      `s23ShoulderBoltInset${suffix}`,
    );

    front(
      new THREE.CylinderGeometry(0.046, 0.046, 0.014, 8),
      EDGE,
      [cx, cy, baseZ + 0.078],
      bone,
      `s23ShoulderBoltCap${suffix}`,
    );

    const highlight: [number, number][] = [
      [-0.052, -0.025],
      [0.018, -0.025],
      [0.054, 0.035],
      [-0.035, 0.06],
    ];

    b.extrude(highlight, {
      at: [cx, cy, baseZ + 0.087],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.0015,
      bone,
      color: CARDBOARD_LIGHT,
      name: `s23ShoulderBoltHighlight${suffix}`,
    });

    const rivets = [
      [0, 0.087],
      [0, -0.087],
      [0.087, 0],
      [-0.087, 0],
    ];

    for (let i = 0; i < rivets.length; i++) {
      const [dx, dy] = rivets[i];
      front(
        new THREE.CylinderGeometry(0.011, 0.011, 0.009, 8),
        CARDBOARD_GOLD,
        [cx + dx, cy + dy, baseZ + 0.087],
        bone,
        `s23ShoulderRivet${suffix}${i + 1}`,
      );
    }

    front(
      new THREE.BoxGeometry(0.12, 0.018, 0.012),
      EDGE_LIGHT,
      [cx, cy - 0.105, baseZ + 0.087],
      bone,
      `s23ShoulderLowerFold${suffix}`,
    );
  };

  shoulderPlate(1, "shoulderL", "L");
  shoulderPlate(-1, "shoulderR", "R");
}
    return addChestEmblem;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addArmCables(b: Builder) {
  const cableColor = RUBBER_LIGHT;
  const bandColor = INNER;
  const clipColor = CARDBOARD_GOLD;
  const clipShadow = CARDBOARD_DARK;

  const makeArmCables = (side: 1 | -1, bone: string, label: string) => {
    const cablePaths = [
      catmull([
        [side * 0.69, 1.57, 0.16],
        [side * 0.79, 1.25, 0.16],
        [side * 0.86, 1.03, 0.16],
        [side * 0.95, 0.79, 0.16],
      ]),
      catmull([
        [side * 0.72, 1.57, 0.18],
        [side * 0.79, 1.25, 0.18],
        [side * 0.89, 1.03, 0.18],
        [side * 0.98, 0.79, 0.18],
      ]),
    ];

    const cables = cablePaths.map((path, cableIndex) =>
      b.sweep(path, 0.019, {
        bone,
        color: cableColor,
        section: { ngon: 6 },
        caps: "round",
        name: `s24${label}Cable${cableIndex + 1}`,
        group: "armCables",
      }),
    );

    for (let cableIndex = 0; cableIndex < cables.length; cableIndex++) {
      const path = cablePaths[cableIndex];
      const cable = cables[cableIndex];

      // Three broad low-poly collars on every cable.
      for (let bandIndex = 0; bandIndex < 3; bandIndex++) {
        const t = [0.28, 0.52, 0.76][bandIndex];
        b.sweep(path.slice(t - 0.026, t + 0.026), 0.025, {
          bone,
          color: bandColor,
          section: { ngon: 6 },
          caps: "flat",
          name: `s24${label}Cable${cableIndex + 1}Band${bandIndex + 1}`,
          group: "armCables",
        });
      }

      // Cardboard clips are seated directly on the cable's outward surface.
      for (let clipIndex = 0; clipIndex < 2; clipIndex++) {
        const t = [0.39, 0.68][clipIndex];
        const hit = cable.at(t, 0);

        b.stick(
          new THREE.BoxGeometry(0.052, 0.028, 0.043),
          clipColor,
          hit,
          {
            embed: 0.22,
            name: `s24${label}Cable${cableIndex + 1}Clip${clipIndex + 1}`,
            group: "armCables",
          },
        );

        // A small dark fastener makes each folded clip read as attached rather than floating.
        b.stick(
          new THREE.SphereGeometry(0.008, 6, 4),
          clipShadow,
          hit.moved([0, 0.019, 0]),
          {
            embed: 0.35,
            name: `s24${label}Cable${cableIndex + 1}Clip${clipIndex + 1}Fastener`,
            group: "armCables",
          },
        );
      }
    }

    // Two little gold cross-links bind the pair together like a handmade cable loom.
    for (let linkIndex = 0; linkIndex < 2; linkIndex++) {
      const t = [0.34, 0.7][linkIndex];
      const a = cablePaths[0].at(t);
      const c = cablePaths[1].at(t);

      b.rod(a, c, 0.011, {
        bone,
        color: clipColor,
        caps: "round",
        name: `s24${label}CableLink${linkIndex + 1}`,
        group: "armCables",
      });
    }

    // A dark shoulder socket and a tiny yellow end tab finish the cable run.
    const start = cablePaths[0].at(0.035);
    const startTangent = cablePaths[0].tangentAt(0.035);
    b.part(
      new THREE.CylinderGeometry(0.032, 0.032, 0.035, 8),
      bandColor,
      {
        at: start,
        dir: startTangent,
        bone,
        flat: true,
        name: `s24${label}ShoulderSocket`,
        group: "armCables",
      },
    );

    const end = cablePaths[1].at(0.965);
    const endTangent = cablePaths[1].tangentAt(0.965);
    b.part(
      new THREE.BoxGeometry(0.042, 0.026, 0.034),
      clipColor,
      {
        at: end,
        dir: endTangent,
        bone,
        flat: true,
        name: `s24${label}WristTab`,
        group: "armCables",
      },
    );
  };

  makeArmCables(1, "elbowL", "ArmL");
  makeArmCables(-1, "elbowR", "ArmR");
}
    return addArmCables;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addHandClaws(b: Builder) {
  const handFingerXs = [-0.11, 0, 0.11];

  const octagon = (rx: number, ry: number): [number, number][] => [
    [-rx * 0.58, -ry],
    [rx * 0.58, -ry],
    [rx, -ry * 0.42],
    [rx, ry * 0.42],
    [rx * 0.58, ry],
    [-rx * 0.58, ry],
    [-rx, ry * 0.42],
    [-rx, -ry * 0.42],
  ];

  const hand = (side: number, bone: string, tag: string) => {
    const cx = side * 0.98;

    // A pale inset palm panel makes the hand read as a separate costume module.
    b.part(
      new THREE.BoxGeometry(0.31, 0.2, 0.038),
      CARDBOARD_LIGHT,
      {
        at: [cx, 0.77, 0.255],
        bone,
        name: `s25_${tag}_palmPanel`,
        flat: true,
      },
    );

    // Dark border strips make the panel look folded and glued onto the mitten.
    b.part(
      new THREE.BoxGeometry(0.33, 0.026, 0.045),
      EDGE,
      {
        at: [cx, 0.875, 0.258],
        bone,
        name: `s25_${tag}_palmTopSeam`,
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.33, 0.026, 0.045),
      EDGE,
      {
        at: [cx, 0.665, 0.258],
        bone,
        name: `s25_${tag}_palmBottomSeam`,
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.026, 0.18, 0.045),
      EDGE,
      {
        at: [cx - side * 0.155, 0.77, 0.258],
        bone,
        name: `s25_${tag}_palmOuterSeam`,
        flat: true,
      },
    );

    // Three broad, blunt finger blocks. They project only slightly beyond the palm.
    handFingerXs.forEach((dx, i) => {
      const x = cx + side * dx;
      const y = i === 1 ? 0.675 : 0.69;
      const h = i === 1 ? 0.15 : 0.135;

      b.part(
        new THREE.BoxGeometry(0.084, h, 0.14),
        i === 1 ? CARDBOARD_GOLD : CARDBOARD,
        {
          at: [x, y, 0.305],
          bone,
          name: `s25_${tag}_finger${i + 1}`,
          flat: true,
        },
      );

      b.part(
        new THREE.BoxGeometry(0.018, h + 0.008, 0.025),
        EDGE,
        {
          at: [x - side * 0.043, y, 0.378],
          bone,
          name: `s25_${tag}_finger${i + 1}Fold`,
          flat: true,
        },
      );
    });

    // A sideways thumb block, deliberately rounded by overlapping two boxes.
    b.part(
      new THREE.BoxGeometry(0.12, 0.15, 0.13),
      CARDBOARD_LIGHT,
      {
        at: [cx + side * 0.18, 0.765, 0.292],
        bone,
        name: `s25_${tag}_thumb`,
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.12, 0.025, 0.145),
      EDGE,
      {
        at: [cx + side * 0.18, 0.845, 0.292],
        bone,
        name: `s25_${tag}_thumbFold`,
        flat: true,
      },
    );

    // A dark cuff seam visually joins the hand to the forearm.
    b.part(
      new THREE.BoxGeometry(0.35, 0.045, 0.36),
      EDGE,
      {
        at: [cx, 0.895, 0.08],
        bone,
        name: `s25_${tag}_cuffSeam`,
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.31, 0.04, 0.34),
      CARDBOARD_GOLD,
      {
        at: [cx, 0.91, 0.08],
        bone,
        name: `s25_${tag}_cuffBand`,
        flat: true,
      },
    );

    // Four friendly cardboard rivets on the palm.
    const rivets: [number, number][] = [
      [-0.12, 0.84],
      [0.12, 0.84],
      [-0.12, 0.7],
      [0.12, 0.7],
    ];
    rivets.forEach(([dx, y], i) => {
      b.part(
        new THREE.CylinderGeometry(0.018, 0.018, 0.028, 8),
        CARDBOARD_GOLD,
        {
          at: [cx + dx, y, 0.282],
          bone,
          dir: [0, 0, 1],
          name: `s25_${tag}_rivet${i + 1}`,
          flat: true,
        },
      );
    });
  };

  hand(1, "wristL", "handL");
  hand(-1, "wristR", "handR");

  const knee = (side: number, bone: string, tag: string) => {
    const x = side * 0.34;

    // Deep octagonal backing plate, like a folded piece of box cardboard.
    b.extrude(octagon(0.145, 0.135), {
      at: [x, 0.49, 0.225],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.006,
      bone,
      color: EDGE,
      name: `s25_${tag}_plateOutline`,
    });

    // Warm inset centre leaves a visible dark rim all around it.
    b.extrude(octagon(0.112, 0.103), {
      at: [x, 0.49, 0.248],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.005,
      bone,
      color: CARDBOARD_GOLD,
      name: `s25_${tag}_plateGold`,
    });

    // A smaller central cardboard patch adds a layered, handmade construction detail.
    b.extrude(octagon(0.066, 0.057), {
      at: [x, 0.49, 0.267],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      bone,
      color: CARDBOARD_LIGHT,
      name: `s25_${tag}_plateCentre`,
    });

    // Two rivets sit on the diagonal corners without widening the lower-leg silhouette.
    ([
      [-0.087, 0.555],
      [0.087, 0.425],
    ] as [number, number][]).forEach(([dx, y], i) => {
      b.part(
        new THREE.CylinderGeometry(0.021, 0.021, 0.034, 8),
        CARDBOARD_LIGHT,
        {
          at: [x + dx, y, 0.286],
          bone,
          dir: [0, 0, 1],
          name: `s25_${tag}_rivet${i + 1}`,
          flat: true,
        },
      );
    });

    // A pair of short dark folds visually anchors the plate to the knee box.
    b.part(
      new THREE.BoxGeometry(0.19, 0.018, 0.022),
      EDGE_LIGHT,
      {
        at: [x, 0.366, 0.265],
        bone,
        name: `s25_${tag}_lowerFold`,
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.19, 0.018, 0.022),
      EDGE_LIGHT,
      {
        at: [x, 0.614, 0.265],
        bone,
        name: `s25_${tag}_upperFold`,
        flat: true,
      },
    );
  };

  knee(1, "kneeL", "kneeL");
  knee(-1, "kneeR", "kneeR");
}
    return addHandClaws;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addBootTreads(b: Builder) {
  const treadYs = [0.065, 0.12, 0.175];

  const addBoot = (side: number, bone: string, suffix: string) => {
    const x = side * 0.34;
    const front = 0.603;

    for (let i = 0; i < treadYs.length; i++) {
      b.part(
        new THREE.BoxGeometry(0.43, 0.034, 0.072),
        RUBBER,
        {
          at: [x, treadYs[i], front],
          bone,
          flat: true,
          name: `s26BootTread${suffix}${i}`,
        },
      );

      b.part(
        new THREE.BoxGeometry(0.41, 0.009, 0.018),
        RUBBER_LIGHT,
        {
          at: [x, treadYs[i] + 0.018, front + 0.038],
          bone,
          flat: true,
          name: `s26BootTreadHighlight${suffix}${i}`,
        },
      );
    }

    // A small cheerful heel marker, placed high enough to remain visible from the front.
    b.part(
      new THREE.BoxGeometry(0.095, 0.042, 0.024),
      YELLOW,
      {
        at: [side * 0.46, 0.188, front + 0.041],
        bone,
        flat: true,
        name: `s26HeelMarker${suffix}`,
      },
    );

    // Tiny side gussets make the tread bars feel folded from separate cardboard strips.
    b.part(
      new THREE.BoxGeometry(0.025, 0.2, 0.085),
      CARDBOARD_DARK,
      {
        at: [side * 0.565, 0.12, 0.565],
        bone,
        flat: true,
        name: `s26BootOuterGusset${suffix}`,
      },
    );
  };

  addBoot(1, "footL", "L");
  addBoot(-1, "footR", "R");

  const addExhaust = (side: number, suffix: string) => {
    const x = side * 0.2;
    const z = -0.465;

    // Main folded-cardboard stack.
    b.part(
      new THREE.CylinderGeometry(0.064, 0.072, 0.27, 8),
      CARDBOARD,
      {
        at: [x, 1.39, z],
        bone: "chest",
        flat: true,
        name: `s26ExhaustStack${suffix}`,
      },
    );

    // Corrugated fold bands.
    for (const [y, radius] of [
      [1.305, 0.073],
      [1.435, 0.07],
    ] as const) {
      b.part(
        new THREE.CylinderGeometry(radius, radius, 0.018, 8),
        CARDBOARD_DARK,
        {
          at: [x, y, z],
          bone: "chest",
          flat: true,
          name: `s26ExhaustBand${suffix}${y}`,
        },
      );
    }

    // Wide folded lip and the recessed dark opening.
    b.part(
      new THREE.CylinderGeometry(0.082, 0.078, 0.035, 8),
      CARDBOARD_LIGHT,
      {
        at: [x, 1.535, z],
        bone: "chest",
        flat: true,
        name: `s26ExhaustRim${suffix}`,
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.052, 0.052, 0.009, 10),
      INNER,
      {
        at: [x, 1.558, z],
        bone: "chest",
        flat: true,
        name: `s26ExhaustOpening${suffix}`,
      },
    );

    // Two visibly separate folded tabs hold the rim together.
    for (const tabSide of [-1, 1]) {
      b.part(
        new THREE.BoxGeometry(0.019, 0.064, 0.032),
        CARDBOARD_GOLD,
        {
          at: [x + tabSide * 0.066, 1.535, z - 0.002],
          bone: "chest",
          flat: true,
          name: `s26ExhaustFoldTab${suffix}${tabSide}`,
        },
      );
    }

    // A harmless dangling costume cable curves down behind the torso.
    const cablePath = polyline([
      [x + side * 0.052, 1.3, -0.518],
      [x + side * 0.068, 1.22, -0.525],
      [x + side * 0.105, 1.105, -0.512],
    ]);

    b.sweep(cablePath, 0.012, {
      bone: "chest",
      color: RUBBER,
      section: { ngon: 6 },
      caps: "round",
      name: `s26ExhaustCable${suffix}`,
      group: "costumeDetails",
    });

    b.part(
      new THREE.BoxGeometry(0.042, 0.045, 0.038),
      YELLOW,
      {
        at: [x + side * 0.055, 1.292, -0.522],
        bone: "chest",
        flat: true,
        name: `s26ExhaustCableClip${suffix}`,
      },
    );

    // A pale paper edge catches the light along the outside of each pipe.
    b.part(
      new THREE.BoxGeometry(0.018, 0.22, 0.018),
      CARDBOARD_GOLD,
      {
        at: [x + side * 0.066, 1.39, -0.515],
        bone: "chest",
        flat: true,
        name: `s26ExhaustEdge${suffix}`,
      },
    );
  };

  addExhaust(1, "L");
  addExhaust(-1, "R");
}
    return addBootTreads;
  })(),
);
