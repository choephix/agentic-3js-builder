import * as THREE from "three";
import { type Builder, createBuilder, catmull, paint, polyline, type ColorInput, frame } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "A colorful, airy Alexander Calder-inspired hanging mobile assembled from thin dark wire, brass pivots, and asymmetrical low-poly metal shapes.",
};

export const REQUESTS = [
  {
    id: "sunPunchedDetails",
    kind: "add",
    part: "plateSun",
    what: "Add three small punched circular details and a slim INK outline on the warm YELLOW hanging plate, with one tiny BRASS rivet at the suspension point.",
    at: [-0.92, 1.56, 0.09],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.38, 0.08],
  },
  {
    id: "moonPaintedSlash",
    kind: "add",
    part: "plateMoon",
    what: "Add a floating vermilion crescent slash and two tiny cream rivets on the ORANGE side-turned plate; keep the marks graphic and spare in the Calder style.",
    at: [0.94, 1.55, 0.02],
    normal: [-0.34, 0, 0.94],
    bone: null,
    room: [0.38, 0.42, 0.08],
  },
  {
    id: "greenCutout",
    kind: "add",
    part: "plateGreen",
    what: "Add a small YELLOW triangular cutout and a dark blue pin near the upper third of the GREEN lower-left plate.",
    at: [-1.27, 1.02, 0.09],
    normal: [0, 0, 1],
    bone: null,
    room: [0.3, 0.36, 0.07],
  },
  {
    id: "blueOrbit",
    kind: "add",
    part: "plateBlue",
    what: "Add a thin CREAM orbital arc with one RED dot across the COBALT circular plate, all seated close to its front face.",
    at: [-0.34, 1.04, 0.08],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.34, 0.07],
  },
  {
    id: "rubyInset",
    kind: "add",
    part: "plateRuby",
    what: "Add a smaller INK diamond inset inside the RED diamond, plus one tiny YELLOW bead at its lower point.",
    at: [0.48, 1.29, 0.09],
    normal: [-0.6, 0, 0.8],
    bone: null,
    room: [0.3, 0.42, 0.07],
  },
  {
    id: "aquaVeins",
    kind: "add",
    part: "plateAqua",
    what: "Add two narrow CORAL diagonal veins and a small BRASS eyelet on the long TURQUOISE leaf plate.",
    at: [1.28, 0.99, 0.04],
    normal: [0.7, 0, 0.7],
    bone: null,
    room: [0.32, 0.48, 0.08],
  },
  {
    id: "centerDropMark",
    kind: "add",
    part: "platePurple",
    what: "Add a tiny CREAM disc with a dark ring on the central PURPLE drop, aligned to the front and no larger than one quarter of its width.",
    at: [0, 1.49, 0.16],
    normal: [0, 0, 1],
    bone: null,
    room: [0.24, 0.28, 0.07],
  },
  {
    id: "upperKnot",
    kind: "add",
    part: "centralHub",
    what: "Add a restrained BRASS collar and a small RED enamel bead around the central pivot where the top suspension wire meets the main rod.",
    at: [0, 2.17, 0.08],
    normal: [0, 1, 0],
    bone: null,
    room: [0.24, 0.18, 0.24],
  },
  {
    id: "sunTexture",
    kind: "texture",
    part: "plateSun",
    what: "Paint the YELLOW plate with a flat two-tone geometric pattern: warm YELLOW field, a broad RED-orange offset band, and a few clean INK marks. Preserve the simple cut-metal silhouette.",
  },
  {
    id: "moonTexture",
    kind: "texture",
    part: "plateMoon",
    what: "Paint the ORANGE plate with a sparse Calder-like color block: ORANGE field, one YELLOW wedge, and a small deep RED counter-shape. Keep it matte and graphic.",
  },
  {
    id: "aquaTexture",
    kind: "texture",
    part: "plateAqua",
    what: "Paint the TURQUOISE leaf with alternating TURQUOISE and BLUE angular bands, leaving generous plain metal around the edges and keeping the shape readable from a distance.",
  },
  {
    id: "blueTexture",
    kind: "texture",
    part: "plateBlue",
    what: "Paint the COBALT disc with a very restrained cream-and-INK radial mark, like a hand-cut abstract target, without obscuring its circular silhouette.",
  },
];

export const PALETTE = {
  WIRE: "#17151c",
  WIRE_SOFT: "#302932",
  BRASS: "#b58a42",
  BRASS_LIGHT: "#d5ac59",
  RED: "#d7473f",
  ORANGE: "#e8753e",
  YELLOW: "#e9b949",
  BLUE: "#2b5da8",
  TEAL: "#2da8a1",
  PURPLE: "#7a4d9e",
  PINK: "#d85b86",
  CREAM: "#f0d8ad",
  GREEN: "#6e9d55",
};

export const WIRE = PALETTE.WIRE;
export const WIRE_SOFT = PALETTE.WIRE_SOFT;
export const BRASS = PALETTE.BRASS;
export const BRASS_LIGHT = PALETTE.BRASS_LIGHT;
export const RED = PALETTE.RED;
export const ORANGE = PALETTE.ORANGE;
export const YELLOW = PALETTE.YELLOW;
export const BLUE = PALETTE.BLUE;
export const TEAL = PALETTE.TEAL;
export const PURPLE = PALETTE.PURPLE;
export const PINK = PALETTE.PINK;
export const CREAM = PALETTE.CREAM;
export const GREEN = PALETTE.GREEN;

export const STAGE2: ((b: Builder) => void)[] = [];

const SUN_PAINT = paint((p, n, _s) => {
  if (Math.abs(n.z) < 0.58) return YELLOW;

  const u = p.x + 0.92;
  const v = p.y - 1.545;
  const band = u + 0.42 * v;

  if (band > 0.005 && band < 0.085) return ORANGE;

  const inkSlash =
    (u < -0.105 && v > 0.055 && v < 0.12) ||
    (u < -0.045 && v > 0.115 && v < 0.155);

  return inkSlash ? WIRE_SOFT : YELLOW;
});

const MOON_PAINT = paint((p, n, _s) => {
  const faceNormal = new THREE.Vector3(-0.34, 0, 0.94);
  if (Math.abs(n.dot(faceNormal)) < 0.56) return ORANGE;

  const u = (p.x - 0.94) * 0.94 + (p.z + 0.04) * 0.34;
  const v = p.y - 1.555;

  const yellowWedge =
    u < -0.045 &&
    u > -0.19 &&
    v > -0.115 &&
    v < 0.13 &&
    Math.abs(v) < (u + 0.19) * 0.9 + 0.008;

  if (yellowWedge) return YELLOW;

  const redCounter =
    u > 0.065 &&
    u < 0.145 &&
    v > 0.045 &&
    v < 0.125 &&
    v < 0.22 - u;

  return redCounter ? RED : ORANGE;
});

const AQUA_PAINT = paint((p, n, _s) => {
  const faceNormal = new THREE.Vector3(0.7, 0, 0.7);
  if (Math.abs(n.dot(faceNormal)) < 0.56) return TEAL;

  const u = (p.x - 1.28) * 0.7 + (p.z + 0.05) * -0.7;
  const v = p.y - 0.965;

  if (Math.abs(u) > 0.125 || Math.abs(v) > 0.19) return TEAL;

  const bandIndex = Math.floor((u + 0.35 * v + 0.25) / 0.085);
  const angularBand = ((bandIndex % 3) + 3) % 3 === 1;

  return angularBand ? BLUE : TEAL;
});

const BLUE_PAINT = paint((p, n, _s) => {
  if (Math.abs(n.z) < 0.64) return BLUE;

  const dx = p.x + 0.34;
  const dy = p.y - 1.015;
  const radius = Math.hypot(dx, dy);
  const angle = Math.atan2(dx, dy);

  const creamArc =
    radius > 0.098 &&
    radius < 0.124 &&
    angle > -2.45 &&
    angle < -0.28;

  const inkSpoke =
    radius > 0.028 &&
    radius < 0.112 &&
    Math.abs(angle - 0.56) < 0.075;

  if (inkSpoke) return WIRE_SOFT;
  if (creamArc) return CREAM;
  return BLUE;
});

type P = [number, number, number];
type Outline = [number, number][];

function circlePoints(center: P, radius: number, segments = 16): P[] {
  const points: P[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push([
      center[0] + Math.sin(a) * radius,
      center[1],
      center[2] + Math.cos(a) * radius,
    ]);
  }
  return points;
}

function wire(
  b: Builder,
  a: P,
  c: P,
  radius: number,
  name: string,
  color: string = WIRE,
) {
  return b.rod(a, c, radius, {
    color,
    name,
    section: { ngon: 6 },
    caps: "flat",
  });
}

function bead(
  b: Builder,
  at: P,
  radius: number,
  color: string,
  name: string,
) {
  return b.part(
    new THREE.SphereGeometry(radius, 8, 6),
    color,
    {
      at,
      name,
      flat: true,
    },
  );
}

function puck(
  b: Builder,
  at: P,
  radius: number,
  color: string,
  name: string,
  dir: P = [0, 0, 1],
  depth = 0.022,
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, depth, 12, 1),
    color,
    {
      at,
      dir,
      name,
      flat: true,
    },
  );
}

function plate(
  b: Builder,
  outline: Outline,
  at: P,
  color: ColorInput,
  name: string,
  x: P = [1, 0, 0],
  thickness = 0.026,
) {
  return b.extrude(outline, {
    at,
    x,
    y: [0, 1, 0],
    thickness,
    bevel: 0.0025,
    smoothing: 0,
    color,
    name,
  });
}

function collar(
  b: Builder,
  at: P,
  radius: number,
  length: number,
  color: string,
  name: string,
  dir: P = [0, 1, 0],
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, length, 10, 1),
    color,
    {
      at,
      dir,
      name,
      flat: true,
    },
  );
}

export default function build() {
  const b = createBuilder({
    name: "calder-hanging-mobile",
    detail: 1,
  });

  const sunShape: Outline = [
    [-0.17, -0.13],
    [-0.03, -0.22],
    [0.15, -0.14],
    [0.19, 0.02],
    [0.08, 0.20],
    [-0.10, 0.16],
    [-0.19, 0.02],
  ];

  const moonShape: Outline = [
    [-0.18, -0.16],
    [-0.01, -0.21],
    [0.17, -0.10],
    [0.19, 0.07],
    [0.06, 0.21],
    [-0.12, 0.15],
    [-0.20, 0.00],
  ];

  const greenShape: Outline = [
    [-0.03, -0.20],
    [0.17, -0.10],
    [0.13, 0.12],
    [-0.03, 0.22],
    [-0.16, 0.02],
  ];

  const rubyShape: Outline = [
    [0, -0.22],
    [0.16, -0.01],
    [0.02, 0.22],
    [-0.16, 0.02],
  ];

  const aquaShape: Outline = [
    [-0.08, -0.24],
    [0.10, -0.14],
    [0.16, 0.02],
    [0.08, 0.22],
    [-0.06, 0.16],
    [-0.16, -0.04],
  ];

  const purpleShape: Outline = [
    [-0.11, -0.14],
    [0.07, -0.18],
    [0.15, -0.01],
    [0.05, 0.16],
    [-0.12, 0.11],
  ];

  const pinkShape: Outline = [
    [-0.12, -0.15],
    [0.09, -0.13],
    [0.13, 0.04],
    [0.01, 0.16],
    [-0.14, 0.08],
  ];

  const tinyTriangle: Outline = [
    [0, -0.10],
    [0.09, 0.08],
    [-0.10, 0.08],
  ];

  const tinyBar: Outline = [
    [-0.10, -0.025],
    [0.10, -0.025],
    [0.10, 0.025],
    [-0.10, 0.025],
  ];

  b.sweep(
    catmull(
      [
        [0.00, 2.78, 0.00],
        [0.00, 2.87, 0.00],
        [0.055, 2.91, 0.00],
        [0.095, 2.86, 0.00],
        [0.095, 2.80, 0.00],
      ],
      { tension: 0.15 },
    ),
    0.010,
    {
      color: WIRE,
      name: "topHook",
      caps: "round",
      section: { ngon: 6 },
    },
  );

  b.sweep(
    polyline(circlePoints([0, 2.775, 0], 0.066, 14), { closed: true }),
    0.008,
    {
      color: WIRE_SOFT,
      name: "suspensionLoop",
      section: { ngon: 8 },
      caps: "none",
    },
  );

  wire(b, [0, 2.80, 0], [0, 2.39, 0], 0.0065, "topThread");
  collar(b, [0, 2.785, 0], 0.022, 0.042, BRASS, "topCollar");
  bead(b, [0, 2.395, 0], 0.030, BRASS_LIGHT, "upperPivotBead");

  wire(b, [0, 2.40, 0], [0, 2.18, 0], 0.021, "centralSpindle");
  collar(b, [0, 2.30, 0], 0.032, 0.030, BRASS, "spindleCollarUpper");
  collar(b, [0, 2.205, 0], 0.044, 0.035, BRASS_LIGHT, "centralHubCollar");
  bead(b, [0, 2.175, 0.015], 0.066, BRASS, "centralHub");

  wire(
    b,
    [-0.95, 2.20, 0.030],
    [0.98, 2.145, -0.040],
    0.014,
    "mainBalanceRod",
  );

  collar(b, [-0.78, 2.195, 0.025], 0.023, 0.026, BRASS, "mainRodCollarLeft", [0, 0, 1]);
  collar(b, [0.70, 2.155, -0.022], 0.023, 0.026, BRASS, "mainRodCollarRight", [0, 0, 1]);
  bead(b, [-0.95, 2.20, 0.030], 0.025, RED, "mainRodEndLeft");
  bead(b, [0.98, 2.145, -0.040], 0.025, BLUE, "mainRodEndRight");

  wire(b, [-0.92, 2.20, 0.030], [-0.92, 1.735, 0.055], 0.0055, "sunThread");
  wire(b, [0.95, 2.147, -0.038], [0.94, 1.785, -0.025], 0.0055, "moonThread");
  wire(b, [0.00, 2.18, 0.018], [0.00, 1.735, 0.110], 0.0055, "centerDropThread");

  bead(b, [-0.92, 1.735, 0.055], 0.020, BRASS_LIGHT, "sunPivot");
  bead(b, [0.94, 1.785, -0.025], 0.020, BRASS_LIGHT, "moonPivot");
  bead(b, [0.00, 1.735, 0.110], 0.020, BRASS_LIGHT, "centerDropPivot");

  wire(
    b,
    [-1.28, 1.735, 0.055],
    [-0.34, 1.785, 0.040],
    0.0115,
    "leftBalanceRod",
  );

  collar(b, [-1.13, 1.727, 0.052], 0.019, 0.024, BRASS, "leftRodCollarOuter", [0, 0, 1]);
  collar(b, [-0.55, 1.775, 0.043], 0.019, 0.024, BRASS, "leftRodCollarInner", [0, 0, 1]);
  bead(b, [-1.28, 1.735, 0.055], 0.021, YELLOW, "leftRodEnd");
  bead(b, [-0.34, 1.785, 0.040], 0.021, BLUE, "leftRodEndInner");

  wire(b, [-1.27, 1.735, 0.055], [-1.27, 1.145, 0.055], 0.0048, "greenThread");
  wire(b, [-0.34, 1.785, 0.040], [-0.34, 1.185, 0.040], 0.0048, "blueThread");

  bead(b, [-1.27, 1.145, 0.055], 0.016, BRASS_LIGHT, "greenHangerBead");
  bead(b, [-0.34, 1.185, 0.040], 0.016, BRASS_LIGHT, "blueHangerBead");

  plate(
    b,
    sunShape,
    [-0.92, 1.545, 0.055],
    SUN_PAINT,
    "plateSun",
    [1, 0, 0],
    0.030,
  );

  plate(
    b,
    tinyTriangle,
    [-0.97, 1.535, 0.086],
    RED,
    "sunInsetTriangle",
    [1, 0, 0],
    0.012,
  );
  puck(b, [-0.84, 1.62, 0.090], 0.024, BRASS_LIGHT, "sunRivet", [0, 0, 1], 0.012);

  puck(b, [-0.34, 1.015, 0.040], 0.158, BLUE_PAINT, "plateBlue", [0, 0, 1], 0.030);
  puck(b, [-0.29, 1.075, 0.076], 0.038, CREAM, "blueOffsetDot", [0, 0, 1], 0.012);
  puck(b, [-0.39, 0.955, 0.078], 0.021, RED, "blueRedPin", [0, 0, 1], 0.012);

  wire(
    b,
    [0.47, 1.785, -0.025],
    [1.30, 1.750, -0.050],
    0.0115,
    "rightBalanceRod",
  );

  collar(b, [0.66, 1.777, -0.031], 0.019, 0.024, BRASS, "rightRodCollarInner", [0, 0, 1]);
  collar(b, [1.12, 1.758, -0.043], 0.019, 0.024, BRASS, "rightRodCollarOuter", [0, 0, 1]);
  bead(b, [0.47, 1.785, -0.025], 0.021, RED, "rightRodEndInner");
  bead(b, [1.30, 1.750, -0.050], 0.021, TEAL, "rightRodEndOuter");

  wire(b, [0.48, 1.785, -0.025], [0.48, 1.455, -0.020], 0.0048, "rubyThread");
  wire(b, [1.29, 1.750, -0.050], [1.28, 1.175, -0.050], 0.0048, "aquaThread");

  bead(b, [0.48, 1.455, -0.020], 0.016, BRASS_LIGHT, "rubyHangerBead");
  bead(b, [1.28, 1.175, -0.050], 0.016, BRASS_LIGHT, "aquaHangerBead");

  plate(
    b,
    moonShape,
    [0.94, 1.555, -0.040],
    MOON_PAINT,
    "plateMoon",
    [0.94, 0, 0.34],
    0.030,
  );

  plate(
    b,
    [
      [-0.08, -0.11],
      [0.10, -0.10],
      [0.13, 0.01],
      [0.02, 0.11],
      [-0.11, 0.06],
    ],
    [0.965, 1.56, -0.008],
    YELLOW,
    "moonInset",
    [0.94, 0, 0.34],
    0.012,
  );

  plate(
    b,
    aquaShape,
    [1.28, 0.965, -0.050],
    AQUA_PAINT,
    "plateAqua",
    [0.70, 0, -0.70],
    0.030,
  );

  plate(
    b,
    [
      [-0.045, -0.14],
      [0.055, -0.07],
      [0.07, 0.08],
      [-0.015, 0.14],
      [-0.07, 0.02],
    ],
    [1.275, 0.965, -0.020],
    PINK,
    "aquaInset",
    [0.70, 0, -0.70],
    0.012,
  );

  wire(
    b,
    [-0.39, 1.695, 0.115],
    [0.40, 1.660, 0.135],
    0.0105,
    "centerBalanceRod",
  );

  collar(b, [-0.22, 1.688, 0.119], 0.018, 0.023, BRASS, "centerRodCollarLeft", [0, 0, 1]);
  collar(b, [0.20, 1.672, 0.129], 0.018, 0.023, BRASS, "centerRodCollarRight", [0, 0, 1]);
  bead(b, [-0.39, 1.695, 0.115], 0.019, PURPLE, "centerRodEndLeft");
  bead(b, [0.40, 1.660, 0.135], 0.019, PINK, "centerRodEndRight");

  wire(b, [-0.38, 1.695, 0.115], [-0.38, 1.445, 0.115], 0.0045, "purpleThread");
  wire(b, [0.39, 1.660, 0.135], [0.39, 1.370, 0.135], 0.0045, "pinkThread");

  bead(b, [-0.38, 1.445, 0.115], 0.014, BRASS_LIGHT, "purpleHangerBead");
  bead(b, [0.39, 1.370, 0.135], 0.014, BRASS_LIGHT, "pinkHangerBead");

  plate(
    b,
    purpleShape,
    [-0.38, 1.300, 0.115],
    PURPLE,
    "platePurple",
    [1, 0, 0],
    0.026,
  );

  puck(b, [-0.38, 1.31, 0.149], 0.036, CREAM, "purpleCenterMark", [0, 0, 1], 0.012);
  puck(b, [-0.38, 1.31, 0.158], 0.045, WIRE_SOFT, "purpleCenterRing", [0, 0, 1], 0.006);

  plate(
    b,
    pinkShape,
    [0.39, 1.215, 0.135],
    PINK,
    "platePink",
    [0.88, 0, -0.48],
    0.026,
  );

  plate(
    b,
    [
      [-0.06, -0.09],
      [0.08, -0.07],
      [0.07, 0.04],
      [-0.02, 0.09],
      [-0.09, 0.01],
    ],
    [0.39, 1.215, 0.160],
    CREAM,
    "pinkInset",
    [0.88, 0, -0.48],
    0.011,
  );

  plate(
    b,
    greenShape,
    [-1.27, 0.965, 0.055],
    GREEN,
    "plateGreen",
    [1, 0, 0],
    0.030,
  );

  plate(
    b,
    [
      [-0.065, -0.085],
      [0.075, -0.075],
      [0.025, 0.085],
      [-0.08, 0.025],
    ],
    [-1.27, 0.97, 0.087],
    YELLOW,
    "greenInset",
    [1, 0, 0],
    0.012,
  );

  puck(b, [-1.20, 1.03, 0.095], 0.020, BLUE, "greenPin", [0, 0, 1], 0.012);

  plate(
    b,
    rubyShape,
    [0.48, 1.265, -0.020],
    RED,
    "plateRuby",
    [0.80, 0, 0.60],
    0.030,
  );

  plate(
    b,
    [
      [0, -0.105],
      [0.075, 0],
      [0, 0.105],
      [-0.075, 0],
    ],
    [0.48, 1.265, 0.012],
    WIRE_SOFT,
    "rubyInset",
    [0.80, 0, 0.60],
    0.011,
  );

  bead(b, [0.48, 1.105, 0.016], 0.020, YELLOW, "rubyLowerBead");

  collar(b, [-0.92, 1.735, 0.055], 0.027, 0.020, BRASS_LIGHT, "sunTopCollar", [0, 1, 0]);
  collar(b, [0.94, 1.785, -0.025], 0.027, 0.020, BRASS_LIGHT, "moonTopCollar", [0, 1, 0]);
  collar(b, [-1.27, 1.145, 0.055], 0.022, 0.018, BRASS, "greenTopCollar", [0, 1, 0]);
  collar(b, [-0.34, 1.185, 0.040], 0.022, 0.018, BRASS, "blueTopCollar", [0, 1, 0]);
  collar(b, [0.48, 1.455, -0.020], 0.022, 0.018, BRASS, "rubyTopCollar", [0, 1, 0]);
  collar(b, [1.28, 1.175, -0.050], 0.022, 0.018, BRASS, "aquaTopCollar", [0, 1, 0]);

  wire(b, [-1.27, 1.145, 0.055], [-1.27, 1.105, 0.055], 0.0034, "greenTailWire");
  wire(b, [-0.34, 1.185, 0.040], [-0.34, 1.145, 0.040], 0.0034, "blueTailWire");
  wire(b, [0.48, 1.455, -0.020], [0.48, 1.420, -0.020], 0.0034, "rubyTailWire");
  wire(b, [1.28, 1.175, -0.050], [1.28, 1.135, -0.050], 0.0034, "aquaTailWire");

  for (const add of STAGE2) add(b);

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addSunPunchedDetails(b: Builder) {
  const INK = "#22112f";
  const YELLOW = "#e9b949";
  const BRASS = "#b58a42";
  const BRASS_LIGHT = "#d5ac59";
  const CREAM = "#f0d8ad";

  const at = new THREE.Vector3(-0.92, 1.56, 0.09);
  const front = at.z + 0.004;

  const frontDisc = (
    x: number,
    y: number,
    radius: number,
    color: string,
    name: string,
    z = front,
  ) => {
    return b.part(
      new THREE.CircleGeometry(radius, 12),
      color,
      {
        at: [x, y, z],
        dir: [0, 0, 1],
        axis: "z",
        flat: true,
        name,
        group: "stage2-sun-details",
      },
    );
  };

  const ring = (
    x: number,
    y: number,
    radius: number,
    tube: number,
    color: string,
    name: string,
    z = front + 0.002,
  ) => {
    return b.part(
      new THREE.TorusGeometry(radius, tube, 5, 12),
      color,
      {
        at: [x, y, z],
        name,
        group: "stage2-sun-details",
        flat: true,
      },
    );
  };

  // Three irregular punched holes: each gets a warm metal lip, a deep inset,
  // and a tiny cream glint that makes the low-poly detail readable.
  const holes = [
    { x: -0.982, y: 1.625, r: 0.027, tilt: -0.35, name: "upperHole" },
    { x: -0.846, y: 1.588, r: 0.022, tilt: 0.18, name: "rightHole" },
    { x: -0.927, y: 1.475, r: 0.030, tilt: 0.55, name: "lowerHole" },
  ];

  for (const hole of holes) {
    ring(
      hole.x,
      hole.y,
      hole.r + 0.005,
      0.004,
      BRASS_LIGHT,
      `${hole.name}BrassLip`,
      front - 0.001,
    );

    frontDisc(
      hole.x,
      hole.y,
      hole.r,
      INK,
      `${hole.name}DarkInterior`,
      front + 0.002,
    );

    const glintX = hole.x - 0.007 + hole.tilt * 0.004;
    const glintY = hole.y + hole.r * 0.48;
    frontDisc(
      glintX,
      glintY,
      Math.max(0.0045, hole.r * 0.19),
      CREAM,
      `${hole.name}Glint`,
      front + 0.006,
    );
  }

  // A single angular ink contour follows the yellow plate, leaving generous
  // yellow metal between the outline and the existing red inset triangle.
  const contour = [
    [-1.055, 1.505, front + 0.004],
    [-0.942, 1.408, front + 0.004],
    [-0.807, 1.475, front + 0.004],
    [-0.772, 1.565, front + 0.004],
    [-0.850, 1.685, front + 0.004],
    [-0.993, 1.662, front + 0.004],
    [-1.055, 1.505, front + 0.004],
  ] as [number, number, number][];

  b.sweep(polyline(contour, { closed: true }), 0.0032, {
    color: INK,
    caps: "none",
    section: { ngon: 5 },
    name: "sunSlimInkContour",
    group: "stage2-sun-details",
  });

  // Tiny brass suspension rivet, aligned with the existing hanging wire.
  const rivetX = -0.92;
  const rivetY = 1.705;

  ring(rivetX, rivetY, 0.017, 0.0032, INK, "suspensionRivetInk", front + 0.003);

  b.part(
    new THREE.CylinderGeometry(0.0125, 0.0125, 0.010, 10, 1),
    BRASS,
    {
      at: [rivetX, rivetY, front + 0.007],
      dir: [0, 0, 1],
      name: "suspensionRivet",
      group: "stage2-sun-details",
      flat: true,
    },
  );

  frontDisc(
    rivetX - 0.003,
    rivetY + 0.003,
    0.0035,
    BRASS_LIGHT,
    "suspensionRivetHighlight",
    front + 0.014,
  );
}
    return addSunPunchedDetails;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addMoonPaintedSlash(b: Builder) {
  const at = new THREE.Vector3(0.94, 1.55, 0.02);
  const normal = new THREE.Vector3(-0.34, 0, 0.94).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const across = new THREE.Vector3(0.94, 0, 0.34).normalize();

  // The dark undercut gives the hand-cut vermilion mark a crisp Calder-like edge.
  const crescent = (scale: number): [number, number][] => {
    const raw: [number, number][] = [
      [-0.105, -0.145],
      [-0.025, -0.178],
      [0.070, -0.125],
      [0.125, -0.025],
      [0.118, 0.082],
      [0.063, 0.158],
      [-0.012, 0.182],
      [0.030, 0.105],
      [0.061, 0.030],
      [0.048, -0.042],
      [-0.002, -0.095],
      [-0.072, -0.120],
    ];

    const angle = 17 * Math.PI / 180;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);

    return raw.map(([x, y]) => [
      scale * (x * ca - y * sa),
      scale * (x * sa + y * ca),
    ]);
  };

  const backingAt = at.clone().addScaledVector(normal, 0.008);
  const markAt = at.clone().addScaledVector(normal, 0.017);

  b.extrude(crescent(1.09), {
    at: backingAt,
    x: across,
    y: up,
    thickness: 0.009,
    bevel: 0.002,
    color: WIRE_SOFT,
    name: "moonSlashInk",
  });

  b.extrude(crescent(1.0), {
    at: markAt,
    x: across,
    y: up,
    thickness: 0.010,
    bevel: 0.002,
    color: RED,
    name: "moonVermilionCrescent",
  });

  // Obtain the original plate surface before adding any of the new raised details.
  const plateSurface = b.surface(b.root);

  const rivetPoint = (du: number, dv: number) =>
    at
      .clone()
      .addScaledVector(across, du)
      .addScaledVector(up, dv);

  const rivetA = plateSurface.nearest(rivetPoint(0.125, 0.125));
  const rivetB = plateSurface.nearest(rivetPoint(-0.135, -0.105));

  const washerGeometry = new THREE.CylinderGeometry(0.026, 0.026, 0.006, 10, 1);
  const rivetGeometry = new THREE.CylinderGeometry(0.017, 0.017, 0.010, 10, 1);

  b.stick(washerGeometry, WIRE_SOFT, rivetA, {
    embed: 0.48,
    name: "moonRivetWasherA",
  });
  b.stick(rivetGeometry, CREAM, rivetA.moved([0, 0.005, 0]), {
    embed: 0.32,
    name: "moonCreamRivetA",
  });

  b.stick(washerGeometry, WIRE_SOFT, rivetB, {
    embed: 0.48,
    name: "moonRivetWasherB",
  });
  b.stick(rivetGeometry, CREAM, rivetB.moved([0, 0.005, 0]), {
    embed: 0.32,
    name: "moonCreamRivetB",
  });
}
    return addMoonPaintedSlash;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addGreenCutout(b: Builder) {
  const DARK_BLUE = "#17366c";
  const DEEP_INK = "#251b2b";

  // ---------------------------------------------------------------------------------------------------------------
  // Green lower-left plate: a layered triangular "cutout" with a dark bevel and a blue enamel pin.

  const greenTriangle: [number, number][] = [
    [0.0, -0.060],
    [0.068, 0.055],
    [-0.072, 0.048],
  ];

  const greenTriangleShadow: [number, number][] = [
    [0.0, -0.072],
    [0.082, 0.065],
    [-0.086, 0.057],
  ];

  b.extrude(greenTriangleShadow, {
    at: [-1.27, 1.020, 0.096],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.010,
    bevel: 0.002,
    color: DEEP_INK,
    name: "greenCutoutDarkInset",
  });

  b.extrude(greenTriangle, {
    at: [-1.27, 1.020, 0.103],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.009,
    bevel: 0.002,
    color: YELLOW,
    name: "greenCutoutYellow",
  });

  // A small offset blue pin makes the layered paper-cut silhouette feel pinned to the metal.
  b.part(
    new THREE.CylinderGeometry(0.015, 0.015, 0.012, 8, 1),
    DARK_BLUE,
    {
      at: [-1.215, 1.070, 0.108],
      dir: [0, 0, 1],
      name: "greenCutoutBluePin",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.0105, 8, 5),
    BLUE,
    {
      at: [-1.215, 1.070, 0.116],
      name: "greenCutoutPinHighlight",
      flat: true,
    },
  );

  // Two tiny dark registration marks keep the ornament graphic rather than decorative.
  for (const [i, p] of [
    [-1.312, 1.035, 0.110],
    [-1.235, 0.985, 0.110],
  ] as [number, number, number][]) {
    b.part(
      new THREE.SphereGeometry(0.006, 6, 4),
      DEEP_INK,
      {
        at: p,
        name: `greenCutoutMark${i}`,
        flat: true,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Blue circular plate: a dark under-arc, cream orbital sweep, and one red satellite dot.

  const orbit = catmull(
    [
      [-0.485, 0.985, 0.071],
      [-0.458, 1.030, 0.071],
      [-0.402, 1.069, 0.071],
      [-0.330, 1.080, 0.071],
      [-0.260, 1.058, 0.071],
      [-0.215, 1.020, 0.071],
    ],
    { tension: 0.18 },
  );

  const orbitUnderlay = catmull(
    [
      [-0.485, 0.985, 0.066],
      [-0.458, 1.030, 0.066],
      [-0.402, 1.069, 0.066],
      [-0.330, 1.080, 0.066],
      [-0.260, 1.058, 0.066],
      [-0.215, 1.020, 0.066],
    ],
    { tension: 0.18 },
  );

  b.sweep(orbitUnderlay, 0.009, {
    color: DARK_BLUE,
    caps: "round",
    section: { ngon: 6 },
    name: "blueOrbitUnderlay",
  });

  b.sweep(orbit, 0.0048, {
    color: CREAM,
    caps: "round",
    section: { ngon: 6 },
    name: "blueOrbitCreamArc",
  });

  // Small cream terminals echo the riveted construction without turning the arc into a full rim.
  for (const [i, p] of [
    [-0.485, 0.985, 0.078],
    [-0.215, 1.020, 0.078],
  ] as [number, number, number][]) {
    b.part(
      new THREE.SphereGeometry(0.008, 7, 5),
      CREAM,
      {
        at: p,
        name: `blueOrbitTerminal${i}`,
        flat: true,
      },
    );
  }

  // One red satellite dot, with a restrained dark-blue shadow ring for crisp separation from the cobalt disc.
  b.part(
    new THREE.CylinderGeometry(0.024, 0.024, 0.008, 12, 1),
    DARK_BLUE,
    {
      at: [-0.238, 1.073, 0.073],
      dir: [0, 0, 1],
      name: "blueOrbitDotShadow",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.017, 0.017, 0.010, 10, 1),
    RED,
    {
      at: [-0.238, 1.073, 0.080],
      dir: [0, 0, 1],
      name: "blueOrbitRedDot",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.0055, 7, 4),
    CREAM,
    {
      at: [-0.244, 1.080, 0.088],
      name: "blueOrbitDotGlint",
      flat: true,
    },
  );
}
    return addGreenCutout;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addRubyInset(b: Builder) {
  const INK = "#211827";

  const anchor = new THREE.Vector3(0.48, 1.29, 0.09);
  const normal = new THREE.Vector3(-0.6, 0, 0.8).normalize();
  const across = new THREE.Vector3(0.8, 0, 0.6).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  const diamond = (halfWidth: number, halfHeight: number) => [
    [0, -halfHeight] as [number, number],
    [halfWidth, 0] as [number, number],
    [0, halfHeight] as [number, number],
    [-halfWidth, 0] as [number, number],
  ];

  // The inset is slightly proud of the plate, with its back face seated exactly
  // on the supplied stage-1 surface point.
  const inset = b.extrude(diamond(0.078, 0.112), {
    at: anchor.clone().addScaledVector(normal, 0.006),
    x: across,
    y: up,
    thickness: 0.012,
    bevel: 0.0015,
    color: INK,
    name: "s24RubyInkDiamond",
  });

  // A small warm glint breaks the otherwise solid ink shape without losing the
  // bold graphic silhouette.
  b.extrude(
    [
      [-0.012, -0.038],
      [0.018, -0.005],
      [0.006, 0.038],
      [-0.020, 0.012],
    ],
    {
      at: inset.moved([0, 0, 0.007]).at,
      x: across,
      y: up,
      thickness: 0.004,
      bevel: 0.0008,
      color: RED,
      name: "s24RubyWarmGlint",
    },
  );

  // Two tiny brass pinheads echo the hand-assembled pivot hardware.
  const pinRadius = 0.009;
  for (const [i, side] of [-1, 1].entries()) {
    const pin = anchor
      .clone()
      .addScaledVector(across, side * 0.095)
      .addScaledVector(up, 0.012)
      .addScaledVector(normal, 0.014);

    b.part(
      new THREE.SphereGeometry(pinRadius, 7, 5),
      BRASS_LIGHT,
      {
        at: pin,
        name: `s24RubyPin${i}`,
        flat: true,
      },
    );
  }

  // Required yellow bead at the diamond's lower point, with a dark little cap
  // so it reads as a suspended rivet rather than a loose sphere.
  const beadCenter = anchor
    .clone()
    .addScaledVector(up, -0.132)
    .addScaledVector(normal, 0.014);

  b.part(
    new THREE.SphereGeometry(0.019, 9, 6),
    YELLOW,
    {
      at: beadCenter,
      name: "s24RubyLowerYellowBead",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8, 1),
    INK,
    {
      at: beadCenter.clone().addScaledVector(normal, 0.016),
      dir: normal,
      name: "s24RubyBeadCap",
      flat: true,
    },
  );
}
    return addRubyInset;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addAquaVeins(b: Builder) {
  const CORAL = "#e56c55";
  const at = new THREE.Vector3(1.28, 0.99, 0.04);
  const normal = new THREE.Vector3(0.7, 0, 0.7).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const across = new THREE.Vector3(0.7, 0, -0.7).normalize();

  const point = (u: number, v: number, lift = 0.014) =>
    at
      .clone()
      .addScaledVector(across, u)
      .addScaledVector(up, v)
      .addScaledVector(normal, lift);

  const vein = (
    points: THREE.Vector3[],
    radius: number,
    name: string,
  ) =>
    b.sweep(catmull(points, { tension: 0.25 }), radius, {
      color: CORAL,
      name,
      caps: "round",
      section: { ngon: 6 },
    });

  // Two broad, hand-bent diagonal veins crossing the long leaf.
  vein(
    [
      point(-0.105, -0.165, 0.014),
      point(-0.025, -0.045, 0.018),
      point(0.105, 0.155, 0.014),
    ],
    0.006,
    "aquaCoralVeinA",
  );

  vein(
    [
      point(0.115, -0.145, 0.015),
      point(0.040, -0.030, 0.020),
      point(-0.090, 0.140, 0.014),
    ],
    0.0055,
    "aquaCoralVeinB",
  );

  // Short secondary branches give the marks a cut-paper botanical rhythm.
  vein(
    [
      point(-0.025, -0.045, 0.021),
      point(-0.105, 0.005, 0.020),
      point(-0.135, 0.070, 0.017),
    ],
    0.0032,
    "aquaCoralBranchLeft",
  );

  vein(
    [
      point(0.040, -0.030, 0.022),
      point(0.115, 0.018, 0.020),
      point(0.145, 0.085, 0.016),
    ],
    0.0032,
    "aquaCoralBranchRight",
  );

  // Small coral terminal studs make each vein feel punched into the metal.
  for (const [u, v, name] of [
    [-0.105, -0.165, "aquaCoralStudLower"],
    [0.105, 0.155, "aquaCoralStudUpper"],
    [0.115, -0.145, "aquaCoralStudOuter"],
    [-0.090, 0.140, "aquaCoralStudInner"],
  ] as const) {
    b.stick(
      new THREE.SphereGeometry(0.009, 7, 5),
      CORAL,
      frame(point(u, v, 0.022), normal),
      {
        embed: 0.28,
        name,
      },
    );
  }

  // A layered brass eyelet sits over the crossing point.
  const eyeletFrame = frame(point(0, 0, 0.018), normal);

  b.stick(
    new THREE.CylinderGeometry(0.014, 0.014, 0.006, 10, 1),
    WIRE_SOFT,
    eyeletFrame,
    {
      embed: 0.15,
      name: "aquaEyeletDarkCore",
    },
  );

  b.stick(
    new THREE.TorusGeometry(0.022, 0.0045, 6, 12),
    BRASS_LIGHT,
    eyeletFrame,
    {
      embed: 0.12,
      name: "aquaBrassEyelet",
    },
  );

  // One tiny warm glint just above the eyelet echoes the other mobile fittings.
  b.stick(
    new THREE.SphereGeometry(0.0065, 6, 4),
    BRASS,
    frame(point(-0.035, 0.035, 0.025), normal),
    {
      embed: 0.3,
      name: "aquaEyeletGlint",
    },
  );
}
    return addAquaVeins;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addCenterDropMark(b: Builder) {
  const front = new THREE.Vector3(0, 0, 1);
  const mark = new THREE.Vector3(0, 1.49, 0.16);

  // A dark inset backing gives the small cream medallion a crisp graphic rim.
  b.part(
    new THREE.CylinderGeometry(0.034, 0.034, 0.009, 12, 1),
    WIRE_SOFT,
    {
      at: mark.clone().addScaledVector(front, 0.003),
      dir: front,
      name: "s26CenterMarkBacking",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.023, 0.023, 0.010, 14, 1),
    CREAM,
    {
      at: mark.clone().addScaledVector(front, 0.010),
      dir: front,
      name: "s26CenterMarkCreamDisc",
      flat: true,
    },
  );

  b.part(
    new THREE.TorusGeometry(0.028, 0.0042, 6, 16),
    WIRE_SOFT,
    {
      at: mark.clone().addScaledVector(front, 0.017),
      dir: front,
      axis: "z",
      name: "s26CenterMarkDarkRing",
      flat: true,
    },
  );

  // Three tiny brass fasteners make the disc feel cut, drilled, and assembled by hand.
  const rivetRadius = 0.004;
  const rivetCircle = 0.027;
  for (let i = 0; i < 3; i++) {
    const a = Math.PI * 0.5 + (i * Math.PI * 2) / 3;
    const rivet = mark.clone().add(
      new THREE.Vector3(
        Math.cos(a) * rivetCircle,
        Math.sin(a) * rivetCircle,
        0.021,
      ),
    );
    b.part(
      new THREE.SphereGeometry(rivetRadius, 6, 4),
      BRASS_LIGHT,
      {
        at: rivet,
        name: `s26CenterMarkRivet${i + 1}`,
        flat: true,
      },
    );
  }

  // Upper knot: a squat brass collar follows the vertical suspension axis.
  const knot = new THREE.Vector3(0, 2.17, 0.08);
  const up = new THREE.Vector3(0, 1, 0);

  b.part(
    new THREE.CylinderGeometry(0.045, 0.040, 0.022, 10, 1),
    BRASS,
    {
      at: knot,
      dir: up,
      name: "s26UpperKnotBrassCollar",
      flat: true,
    },
  );

  b.part(
    new THREE.TorusGeometry(0.043, 0.0032, 6, 14),
    BRASS_LIGHT,
    {
      at: knot.clone().addScaledVector(up, 0.012),
      dir: up,
      axis: "z",
      name: "s26UpperKnotCollarRim",
      flat: true,
    },
  );

  // Small red enamel bead, offset just above the collar.
  const bead = knot.clone().addScaledVector(up, 0.030);
  b.part(
    new THREE.SphereGeometry(0.022, 8, 6),
    RED,
    {
      at: bead,
      name: "s26UpperKnotRedEnamelBead",
      flat: true,
    },
  );

  b.part(
    new THREE.TorusGeometry(0.024, 0.0033, 6, 14),
    BRASS_LIGHT,
    {
      at: bead,
      dir: up,
      axis: "z",
      name: "s26UpperKnotBeadBand",
      flat: true,
    },
  );

  // A restrained enamel glint keeps the bead readable without turning it into a new focal point.
  b.part(
    new THREE.SphereGeometry(0.0042, 6, 4),
    CREAM,
    {
      at: bead.clone().add(new THREE.Vector3(-0.008, 0.009, 0.016)),
      name: "s26UpperKnotBeadGlint",
      flat: true,
    },
  );
}
    return addCenterDropMark;
  })(),
);
