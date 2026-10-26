```ts
import * as THREE from "three";
import { createBuilder, polyline, type Builder } from "agentic-3js-builder";

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
  color: string,
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
  color: string,
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
  box(b, [1.28, 0.94, 0.76], CARDBOARD, [0, 1.2, 0], chest, "hull");

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
    CARDBOARD_DARK,
    [0.655, 1.25, 0.02],
    chest,
    "hullSideL",
  );

  box(
    b,
    [0.06, 0.68, 0.54],
    CARDBOARD_DARK,
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
    CARDBOARD,
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
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "flat",
    name: "upperArmL",
    group: "limbs",
  });

  b.sweep(armR, () => [0.13, 0.14], {
    color: CARDBOARD,
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
```