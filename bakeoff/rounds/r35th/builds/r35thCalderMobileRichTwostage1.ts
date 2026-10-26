import * as THREE from "three";
import { createBuilder, catmull, polyline } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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
  color: string,
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

  // ---------------------------------------------------------------------------------------------------------------
  // Suspension point: a dark hand-bent hook, a round hanging loop, and a clean central thread.

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

  // ---------------------------------------------------------------------------------------------------------------
  // Main vertical spindle and the long asymmetrical Calder crossbar.

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

  // The suspension threads from the main crossbar.
  wire(b, [-0.92, 2.20, 0.030], [-0.92, 1.735, 0.055], 0.0055, "sunThread");
  wire(b, [0.95, 2.147, -0.038], [0.94, 1.785, -0.025], 0.0055, "moonThread");
  wire(b, [0.00, 2.18, 0.018], [0.00, 1.735, 0.110], 0.0055, "centerDropThread");

  bead(b, [-0.92, 1.735, 0.055], 0.020, BRASS_LIGHT, "sunPivot");
  bead(b, [0.94, 1.785, -0.025], 0.020, BRASS_LIGHT, "moonPivot");
  bead(b, [0.00, 1.735, 0.110], 0.020, BRASS_LIGHT, "centerDropPivot");

  // ---------------------------------------------------------------------------------------------------------------
  // First lower balance, left side: a long black rod with a yellow plate and a blue disc.

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

  // Yellow sun-like plate, kept broad and plain for the texture stage.
  plate(
    b,
    sunShape,
    [-0.92, 1.545, 0.055],
    YELLOW,
    "plateSun",
    [1, 0, 0],
    0.030,
  );

  // A tiny raised yellow-to-red graphic counterweight on the sun.
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

  // Blue circular plate with a small warm off-center dot.
  puck(b, [-0.34, 1.015, 0.040], 0.158, BLUE, "plateBlue", [0, 0, 1], 0.030);
  puck(b, [-0.29, 1.075, 0.076], 0.038, CREAM, "blueOffsetDot", [0, 0, 1], 0.012);
  puck(b, [-0.39, 0.955, 0.078], 0.021, RED, "blueRedPin", [0, 0, 1], 0.012);

  // ---------------------------------------------------------------------------------------------------------------
  // First lower balance, right side: a warm plate and a long turquoise leaf.

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
    ORANGE,
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
    TEAL,
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

  // ---------------------------------------------------------------------------------------------------------------
  // Central drop: a smaller offset balance with purple and pink pieces.

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

  // ---------------------------------------------------------------------------------------------------------------
  // Lower-left and lower-right terminal shapes. These establish the lowest silhouette while staying well above floor.

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

  // A few deliberately visible brass fittings break up the otherwise graphic wire silhouette.
  collar(b, [-0.92, 1.735, 0.055], 0.027, 0.020, BRASS_LIGHT, "sunTopCollar", [0, 1, 0]);
  collar(b, [0.94, 1.785, -0.025], 0.027, 0.020, BRASS_LIGHT, "moonTopCollar", [0, 1, 0]);
  collar(b, [-1.27, 1.145, 0.055], 0.022, 0.018, BRASS, "greenTopCollar", [0, 1, 0]);
  collar(b, [-0.34, 1.185, 0.040], 0.022, 0.018, BRASS, "blueTopCollar", [0, 1, 0]);
  collar(b, [0.48, 1.455, -0.020], 0.022, 0.018, BRASS, "rubyTopCollar", [0, 1, 0]);
  collar(b, [1.28, 1.175, -0.050], 0.022, 0.018, BRASS, "aquaTopCollar", [0, 1, 0]);

  // Small wire tails at several pivots make the handmade suspended construction legible.
  wire(b, [-1.27, 1.145, 0.055], [-1.27, 1.105, 0.055], 0.0034, "greenTailWire");
  wire(b, [-0.34, 1.185, 0.040], [-0.34, 1.145, 0.040], 0.0034, "blueTailWire");
  wire(b, [0.48, 1.455, -0.020], [0.48, 1.420, -0.020], 0.0034, "rubyTailWire");
  wire(b, [1.28, 1.175, -0.050], [1.28, 1.135, -0.050], 0.0034, "aquaTailWire");

  // Leave the model extensible for the concurrent detail builders.
  for (const add of STAGE2) add(b);

  return b.root;
}
