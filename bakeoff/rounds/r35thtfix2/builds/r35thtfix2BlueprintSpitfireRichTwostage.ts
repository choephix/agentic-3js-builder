import * as THREE from "three";
import { type Builder, catmull, createBuilder, paint, polyline, svg } from "../../../../src/index";

export const BLUEPRINT_NAVY = "#061b32";
export const BLUEPRINT_BLUE = "#0a3555";
export const BLUEPRINT_MID = "#0d5275";
export const BLUEPRINT_CYAN = "#25bfd0";
export const BLUEPRINT_LIGHT = "#76e4e8";
export const BLUEPRINT_PALE = "#c8fbf5";
export const BLUEPRINT_WHITE = "#e9ffff";
export const BLUEPRINT_INK = "#02101f";
export const BLUEPRINT_SHADE = "#082844";
export const BLUEPRINT_GLASS = "#55c8da";

export const meta = {
  name: "cyanotype spitfire",
  description:
    "A low-poly Spitfire fighter plane painted as a luminous cyanotype blueprint, with restrained panel diagrams, construction seams, canopy glazing and faded serial marks.",
};

// fuselageBlueprint: paint the fuselage with deep cyanotype blue, broad shadow panels, longitudinal contour seams and a faded serial-code rhythm near the tail.
// wingBlueprint: paint both wings with restrained cyanotype panel divisions, preserving a clean central field for future roundels and highlighting the leading and trailing edges.
// tailBlueprint: paint the fin and tailplanes with pale construction lines, dark hinge seams and small faded unit-code marks.
// canopyBlueprint: paint the canopy as layered cyanotype glazing with blue panes, dark frame bands and pale reflected blueprint strokes.

export const REQUESTS = [
  {
    id: "fuselageBlueprint",
    kind: "texture",
    part: "fuselage",
    what:
      "Paint the fuselage as a cyanotype blueprint: deep BLUEPRINT_BLUE base, broad BLUEPRINT_MID shadow panels, thin BLUEPRINT_LIGHT contour lines following the length, and a faded white-blue aircraft serial near the rear.",
  },
  {
    id: "wingBlueprint",
    kind: "texture",
    part: "wingL",
    what:
      "Paint both wing surfaces with restrained blueprint panel geometry in BLUEPRINT_BLUE and BLUEPRINT_MID, leaving clear space around the future roundels and adding pale cyan leading-edge and aileron seams.",
  },
  {
    id: "tailBlueprint",
    kind: "texture",
    part: "fin",
    what:
      "Paint the fin and tailplanes with pale cyan construction lines, a dark BLUEPRINT_INK hinge seam and a simple white-blue unit code near the fin tip.",
  },
  {
    id: "canopyBlueprint",
    kind: "texture",
    part: "canopy",
    what:
      "Add transparent-looking cyanotype canopy glazing: BLUEPRINT_GLASS panes, dark BLUEPRINT_INK frame lines, and a few BLUEPRINT_PALE reflected blueprint strokes. Keep the canopy dome legible.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const FUSELAGE_BLUEPRINT = paint((p, n, _s) => {
  let c = BLUEPRINT_BLUE;

  if (n.y < -0.38) c = BLUEPRINT_SHADE;
  else if (n.y < 0.05) c = BLUEPRINT_MID;

  const station = Math.abs(Math.sin((p.z + 4.65) * Math.PI / 0.62));
  if (station > 0.988 && n.y > -0.15) c = BLUEPRINT_LIGHT;

  const upperContour = Math.abs(p.x - 0.56);
  if (upperContour < 0.018 && n.y > 0.05) c = BLUEPRINT_CYAN;

  const serialZone = p.z < -3.55 && p.z > -4.55 && p.y > 1.65;
  if (serialZone) {
    const serialBars =
      Math.abs(Math.sin((p.x + 0.9) * 28)) > 0.72 &&
      Math.abs(Math.sin((p.y - 1.66) * 42)) > 0.5;
    if (serialBars) c = BLUEPRINT_PALE;
  }

  if (p.z < -4.25 && n.y > 0.25) c = BLUEPRINT_MID;
  return c;
});

const WING_BLUEPRINT = paint((p, n, _s) => {
  const span = Math.abs(p.x);
  let c = BLUEPRINT_BLUE;

  if (n.y < 0.25) c = BLUEPRINT_SHADE;
  else if (n.y < 0.65) c = BLUEPRINT_MID;

  const leading = p.z > 0.7 - span * 0.105;
  const trailing = p.z < -0.5 + span * 0.045;
  if (leading) c = BLUEPRINT_LIGHT;
  if (trailing) c = BLUEPRINT_CYAN;

  // Broad panel seams stop around the future roundel field.
  const roundelKeepout =
    span > 1.45 &&
    span < 3.75 &&
    p.z > -0.42 &&
    p.z < 0.52;

  if (!roundelKeepout && n.y > 0.45) {
    const rib = Math.abs(Math.sin((span - 0.42) * Math.PI / 0.78));
    if (rib > 0.992) c = BLUEPRINT_LIGHT;

    const chordLine = Math.abs(Math.sin((p.z + 0.52) * Math.PI / 0.43));
    if (chordLine > 0.996) c = BLUEPRINT_CYAN;
  }

  if (Math.abs(span - 4.6) < 0.035) c = BLUEPRINT_PALE;
  return c;
});

const TAIL_BLUEPRINT = paint((p, n, _s) => {
  let c = BLUEPRINT_BLUE;
  if (n.y < 0.1) c = BLUEPRINT_MID;

  const hinge = Math.abs(p.z + 4.61);
  if (hinge < 0.035) c = BLUEPRINT_INK;

  const construction =
    Math.abs(Math.sin((p.y - 1.5) * 18 + p.z * 4.5)) > 0.992;
  if (construction && n.y > 0.2) c = BLUEPRINT_LIGHT;

  const codeZone = p.y > 3.15 && p.y < 3.62 && p.z < -4.48;
  if (codeZone) {
    const code = Math.abs(Math.sin((p.y - 3.12) * 46)) > 0.65;
    if (code) c = BLUEPRINT_PALE;
  }

  if (Math.abs(p.x) > 1.45 && n.y > 0.35) c = BLUEPRINT_CYAN;
  return c;
});

const CANOPY_BLUEPRINT = paint((p, n, _s) => {
  const x = p.x;
  const y = p.y - 2.18;
  const z = p.z - 0.22;

  let c = BLUEPRINT_GLASS;
  const light = Math.max(0, n.y * 0.55 + n.z * 0.65 + 0.25);
  if (light < 0.25) c = BLUEPRINT_MID;
  else if (light > 0.78) c = BLUEPRINT_PALE;

  const centerFrame = Math.abs(x) < 0.035;
  const frontFrame = Math.abs(z + 0.64) < 0.038;
  const rearFrame = Math.abs(z - 0.73) < 0.032;
  const lowerFrame = Math.abs(y + 0.42) < 0.035;

  if (centerFrame || frontFrame || rearFrame || lowerFrame) {
    c = BLUEPRINT_INK;
  } else {
    const reflection =
      Math.abs(Math.sin((x + z * 0.28) * 23)) > 0.985 &&
      y > 0.03;
    if (reflection) c = BLUEPRINT_PALE;
  }

  return c;
});

function plate(
  b: Builder,
  outline: [number, number][],
  at: [number, number, number],
  x: [number, number, number],
  y: [number, number, number],
  color: any,
  name: string,
  thickness = 0.06,
) {
  return b.extrude(outline, {
    at,
    x,
    y,
    thickness,
    bevel: 0.008,
    color,
    name,
  });
}

function rod(
  b: Builder,
  a: [number, number, number],
  c: [number, number, number],
  radius: number,
  color: any,
  name: string,
) {
  return b.rod(a, c, radius, {
    color,
    caps: "round",
    name,
  });
}

function contourRing(
  b: Builder,
  center: [number, number, number],
  rx: number,
  ry: number,
  color: any,
  name: string,
) {
  const points: [number, number, number][] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    points.push([
      center[0] + Math.cos(a) * rx,
      center[1] + Math.sin(a) * ry,
      center[2],
    ]);
  }

  return b.sweep(polyline(points, { closed: true }), 0.016, {
    color,
    sides: 6,
    caps: "none",
    name,
  });
}

export default function build() {
  const b = createBuilder({
    name: "cyanotype-spitfire",
    detail: 1,
    paintSize: 2048,
  });

  const fuselageStations = [
    { at: [0, 1.59, -5.28], w: 0.15, h: 0.17 },
    { at: [0, 1.6, -4.76], w: 0.29, h: 0.29 },
    { at: [0, 1.61, -4.15], w: 0.47, h: 0.43 },
    { at: [0, 1.63, -3.3], w: 0.65, h: 0.61 },
    { at: [0, 1.65, -2.15], w: 0.78, h: 0.75 },
    { at: [0, 1.67, -0.8], w: 0.84, h: 0.84 },
    { at: [0, 1.67, 0.62], w: 0.84, h: 0.86 },
    { at: [0, 1.66, 1.86], w: 0.78, h: 0.79 },
    { at: [0, 1.64, 3.02], w: 0.69, h: 0.7 },
    { at: [0, 1.6, 3.94], w: 0.56, h: 0.57 },
    { at: [0, 1.57, 4.62], w: 0.42, h: 0.44 },
    { at: [0, 1.55, 5.08], w: 0.19, h: 0.21 },
  ];

  b.loft(fuselageStations, {
    color: FUSELAGE_BLUEPRINT,
    section: { ngon: 10 },
    caps: "round",
    name: "fuselage",
    group: "airframe",
  });

  b.loft(
    [
      { at: [0, 1.29, -3.55], w: 0.24, h: 0.16 },
      { at: [0, 1.2, -2.0], w: 0.3, h: 0.2 },
      { at: [0, 1.16, -0.2], w: 0.34, h: 0.22 },
      { at: [0, 1.18, 1.7], w: 0.3, h: 0.2 },
      { at: [0, 1.28, 2.9], w: 0.2, h: 0.16 },
    ],
    {
      color: BLUEPRINT_SHADE,
      section: { ngon: 8 },
      name: "bellyKeel",
      group: "airframe",
    },
  );

  b.sweep(
    catmull([
      [0, 2.02, -3.45],
      [0, 2.16, -2.0],
      [0, 2.3, -0.4],
      [0, 2.31, 1.6],
      [0, 2.12, 3.2],
    ]),
    [0.13, 0.08],
    {
      color: BLUEPRINT_MID,
      section: { ngon: 6 },
      name: "dorsalSpine",
    },
  );

  const wingOutline: [number, number][] = [
    [0, 0.96],
    [0.78, 0.9],
    [2.25, 0.63],
    [4.7, 0.2],
    [5.52, 0.04],
    [5.72, -0.14],
    [5.52, -0.38],
    [4.7, -0.58],
    [2.3, -0.72],
    [0.82, -0.78],
    [0, -0.68],
  ];

  for (const side of [1, -1]) {
    plate(
      b,
      wingOutline,
      [0, 1.47, 0],
      [side, 0, 0],
      [0, 0, 1],
      WING_BLUEPRINT,
      side > 0 ? "wingL" : "wingR",
      0.15,
    );

    b.sweep(
      catmull([
        [side * 0.15, 1.52, 1.0],
        [side * 0.7, 1.52, 0.82],
        [side * 1.25, 1.5, 0.47],
        [side * 1.7, 1.48, 0.02],
        [side * 1.25, 1.47, -0.58],
        [side * 0.35, 1.48, -0.7],
      ]),
      [0.1, 0.07],
      {
        color: BLUEPRINT_MID,
        section: { ngon: 6 },
        name: side > 0 ? "wingRootFairingL" : "wingRootFairingR",
      },
    );

    rod(
      b,
      [side * 0.35, 1.57, 0.98],
      [side * 5.4, 1.53, 0.02],
      0.035,
      BLUEPRINT_CYAN,
      side > 0 ? "wingLeadingEdgeL" : "wingLeadingEdgeR",
    );

    rod(
      b,
      [side * 0.55, 1.43, -0.66],
      [side * 5.45, 1.42, -0.34],
      0.022,
      BLUEPRINT_CYAN,
      side > 0 ? "wingTrailingEdgeL" : "wingTrailingEdgeR",
    );

    const aileron: [number, number][] = [
      [1.34, -0.55],
      [2.4, -0.51],
      [5.33, -0.29],
      [5.5, -0.36],
      [4.68, -0.57],
      [2.4, -0.7],
      [1.34, -0.72],
    ];

    plate(
      b,
      aileron,
      [0, 1.5, 0],
      [side, 0, 0],
      [0, 0, 1],
      BLUEPRINT_MID,
      side > 0 ? "aileronL" : "aileronR",
      0.045,
    );

    for (const x of [1.55, 2.35, 3.2, 4.25]) {
      rod(
        b,
        [side * x, 1.56, 0.9 - x * 0.14],
        [side * x, 1.56, -0.58 + x * 0.055],
        0.011,
        BLUEPRINT_LIGHT,
        side > 0 ? `wingRibL${x}` : `wingRibR${x}`,
      );
    }

    rod(
      b,
      [side * 1.3, 1.49, -0.69],
      [side * 5.25, 1.53, -0.3],
      0.012,
      BLUEPRINT_LIGHT,
      side > 0 ? "aileronHingeL" : "aileronHingeR",
    );

    plate(
      b,
      [
        [5.3, 0.03],
        [5.62, 0.01],
        [5.72, -0.13],
        [5.52, -0.25],
        [5.25, -0.2],
      ],
      [0, 1.56, 0],
      [side, 0, 0],
      [0, 0, 1],
      BLUEPRINT_LIGHT,
      side > 0 ? "wingtipCapL" : "wingtipCapR",
      0.055,
    );
  }

  const tailplaneOutline: [number, number][] = [
    [0, 0.24],
    [0.7, 0.23],
    [1.55, 0.16],
    [2.4, 0.02],
    [2.55, -0.11],
    [2.25, -0.39],
    [1.42, -0.55],
    [0.65, -0.51],
    [0, -0.35],
  ];

  for (const side of [1, -1]) {
    plate(
      b,
      tailplaneOutline,
      [0, 1.78, -3.85],
      [side, 0, 0],
      [0, 0, 1],
      TAIL_BLUEPRINT,
      side > 0 ? "tailplaneL" : "tailplaneR",
      0.11,
    );

    rod(
      b,
      [side * 0.16, 1.85, -3.62],
      [side * 2.42, 1.81, -3.82],
      0.027,
      BLUEPRINT_CYAN,
      side > 0 ? "tailLeadingL" : "tailLeadingR",
    );

    rod(
      b,
      [side * 0.42, 1.73, -4.28],
      [side * 2.27, 1.75, -4.2],
      0.018,
      BLUEPRINT_LIGHT,
      side > 0 ? "tailTrailingL" : "tailTrailingR",
    );

    plate(
      b,
      [
        [0.75, -0.4],
        [2.2, -0.34],
        [2.36, -0.19],
        [1.42, -0.1],
        [0.75, -0.16],
      ],
      [0, 1.79, -3.85],
      [side, 0, 0],
      [0, 0, 1],
      BLUEPRINT_MID,
      side > 0 ? "elevatorL" : "elevatorR",
      0.035,
    );
  }

  const finOutline: [number, number][] = [
    [-0.18, 0.32],
    [0.02, 0.05],
    [0.88, 0.02],
    [0.72, 0.7],
    [0.56, 1.38],
    [0.42, 2.15],
    [0.2, 2.42],
    [-0.02, 2.29],
    [-0.22, 1.5],
    [-0.32, 0.65],
  ];

  plate(
    b,
    finOutline,
    [0, 1.56, -4.62],
    [0, 0, 1],
    [0, 1, 0],
    TAIL_BLUEPRINT,
    "fin",
    0.14,
  );

  rod(
    b,
    [0, 1.95, -4.42],
    [0, 3.83, -4.2],
    0.025,
    BLUEPRINT_CYAN,
    "finLeadingEdge",
  );

  rod(
    b,
    [0, 1.82, -4.14],
    [0, 1.82, -4.68],
    0.018,
    BLUEPRINT_INK,
    "rudderHinge",
  );

  plate(
    b,
    [
      [0.52, 0.37],
      [0.85, 0.28],
      [0.74, 0.85],
      [0.59, 1.43],
      [0.4, 2.1],
      [0.2, 2.3],
      [0.2, 1.4],
      [0.24, 0.63],
    ],
    [0, 1.57, -4.61],
    [0, 0, 1],
    [0, 1, 0],
    BLUEPRINT_MID,
    "rudder",
    0.045,
  );

  const canopy = b.part(
    new THREE.SphereGeometry(1, 16, 10),
    CANOPY_BLUEPRINT,
    {
      at: [0, 2.15, 0.22],
      scale: [0.58, 0.56, 1.08],
      flat: true,
      name: "canopy",
      group: "cockpit",
    },
  );

  b.part(
    new THREE.SphereGeometry(
      1,
      14,
      8,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.56,
    ),
    BLUEPRINT_PALE,
    {
      at: [0, 2.18, 0.27],
      scale: [0.52, 0.5, 0.99],
      flat: true,
      name: "canopyHighlight",
      group: "cockpit",
    },
  );

  rod(
    b,
    [0, 2.64, -0.68],
    [0, 2.67, 1.0],
    0.027,
    BLUEPRINT_INK,
    "canopyCenterFrame",
  );

  for (const side of [1, -1]) {
    rod(
      b,
      [side * 0.38, 2.35, -0.63],
      [side * 0.42, 2.38, 0.86],
      0.024,
      BLUEPRINT_INK,
      side > 0 ? "canopyFrameL" : "canopyFrameR",
    );

    rod(
      b,
      [side * 0.26, 2.53, -0.5],
      [side * 0.47, 2.45, -0.05],
      0.017,
      BLUEPRINT_LIGHT,
      side > 0 ? "canopyBraceL0" : "canopyBraceR0",
    );

    rod(
      b,
      [side * 0.47, 2.45, -0.05],
      [side * 0.39, 2.46, 0.62],
      0.017,
      BLUEPRINT_LIGHT,
      side > 0 ? "canopyBraceL1" : "canopyBraceR1",
    );
  }

  rod(
    b,
    [-0.42, 2.42, 0.05],
    [0.42, 2.42, 0.05],
    0.02,
    BLUEPRINT_INK,
    "canopyRearFrame",
  );

  contourRing(
    b,
    [0, 1.66, -2.82],
    0.67,
    0.62,
    BLUEPRINT_CYAN,
    "fuselageRingRear",
  );
  contourRing(
    b,
    [0, 1.66, 2.95],
    0.69,
    0.68,
    BLUEPRINT_LIGHT,
    "fuselageRingFront",
  );
  contourRing(
    b,
    [0, 1.59, 4.0],
    0.55,
    0.54,
    BLUEPRINT_CYAN,
    "engineCowlingRing",
  );

  rod(
    b,
    [0, 2.32, -3.42],
    [0, 2.28, 3.42],
    0.016,
    BLUEPRINT_LIGHT,
    "topBlueprintSpine",
  );

  rod(
    b,
    [-0.66, 1.72, -2.8],
    [-0.7, 1.64, 2.92],
    0.014,
    BLUEPRINT_MID,
    "leftFuselageContour",
  );

  rod(
    b,
    [0.66, 1.72, -2.8],
    [0.7, 1.64, 2.92],
    0.014,
    BLUEPRINT_MID,
    "rightFuselageContour",
  );

  b.spike([0, 1.55, 4.55], [0, 0, 1], 0.92, 0.52, {
    color: BLUEPRINT_MID,
    section: { ngon: 10 },
    name: "spinner",
    group: "propeller",
  });

  b.part(
    new THREE.CylinderGeometry(0.17, 0.2, 0.3, 10),
    BLUEPRINT_INK,
    {
      at: [0, 1.55, 5.43],
      dir: [0, 0, 1],
      flat: true,
      name: "propellerHub",
      group: "propeller",
    },
  );

  const propBlade: [number, number][] = [
    [0.03, 0.08],
    [0.3, 0.15],
    [0.83, 0.3],
    [1.5, 0.47],
    [2.08, 0.32],
    [2.3, 0.08],
    [2.08, -0.08],
    [1.5, -0.13],
    [0.78, -0.11],
    [0.28, -0.08],
    [0.03, -0.04],
  ];

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const radial: [number, number, number] = [
      Math.cos(a),
      Math.sin(a),
      0,
    ];
    const tangent: [number, number, number] = [
      -Math.sin(a),
      Math.cos(a),
      0,
    ];

    plate(
      b,
      propBlade,
      [0, 1.55, 5.56],
      radial,
      tangent,
      i === 0 ? BLUEPRINT_PALE : BLUEPRINT_CYAN,
      `propellerBlade${i + 1}`,
      0.09,
    );

    rod(
      b,
      [radial[0] * 0.25, 1.55 + radial[1] * 0.25, 5.61],
      [radial[0] * 2.08, 1.55 + radial[1] * 2.08, 5.61],
      0.014,
      BLUEPRINT_INK,
      `propellerBladeEdge${i + 1}`,
    );
  }

  b.part(
    new THREE.CylinderGeometry(0.11, 0.11, 0.12, 10),
    BLUEPRINT_PALE,
    {
      at: [0, 1.55, 5.65],
      dir: [0, 0, 1],
      flat: true,
      name: "propellerCap",
      group: "propeller",
    },
  );

  for (const side of [1, -1]) {
    rod(
      b,
      [side * 0.92, 1.23, 0.15],
      [side * 1.4, 0.55, -0.05],
      0.07,
      BLUEPRINT_INK,
      side > 0 ? "mainGearStrutL" : "mainGearStrutR",
    );

    rod(
      b,
      [side * 1.08, 1.27, 0.22],
      [side * 1.4, 0.55, 0.12],
      0.035,
      BLUEPRINT_CYAN,
      side > 0 ? "mainGearBraceL" : "mainGearBraceR",
    );

    b.part(
      new THREE.CylinderGeometry(0.27, 0.27, 0.16, 12),
      BLUEPRINT_INK,
      {
        at: [side * 1.42, 0.28, -0.08],
        dir: [1, 0, 0],
        flat: true,
        name: side > 0 ? "mainWheelL" : "mainWheelR",
        group: "landingGear",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.115, 0.115, 0.175, 10),
      BLUEPRINT_PALE,
      {
        at: [side * 1.42, 0.28, -0.08],
        dir: [1, 0, 0],
        flat: true,
        name: side > 0 ? "mainWheelHubL" : "mainWheelHubR",
        group: "landingGear",
      },
    );

    b.part(
      new THREE.TorusGeometry(0.235, 0.017, 6, 14),
      BLUEPRINT_CYAN,
      {
        at: [side * 1.515, 0.28, -0.08],
        dir: [1, 0, 0],
        axis: "z",
        flat: true,
        name: side > 0 ? "wheelBlueprintRingL" : "wheelBlueprintRingR",
        group: "landingGear",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.28, 0.05, 0.54),
      BLUEPRINT_SHADE,
      {
        at: [side * 1.12, 1.08, -0.08],
        flat: true,
        name: side > 0 ? "gearDoorL" : "gearDoorR",
        group: "landingGear",
      },
    );

    rod(
      b,
      [side * 0.98, 1.11, -0.32],
      [side * 1.25, 1.11, 0.16],
      0.012,
      BLUEPRINT_LIGHT,
      side > 0 ? "gearDoorMarkL" : "gearDoorMarkR",
    );
  }

  rod(
    b,
    [0, 1.04, -3.72],
    [0, 0.46, -4.1],
    0.045,
    BLUEPRINT_INK,
    "tailGearStrut",
  );

  b.part(
    new THREE.CylinderGeometry(0.18, 0.18, 0.13, 10),
    BLUEPRINT_INK,
    {
      at: [0, 0.2, -4.14],
      dir: [1, 0, 0],
      flat: true,
      name: "tailWheel",
      group: "landingGear",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.075, 0.075, 0.145, 8),
    BLUEPRINT_LIGHT,
    {
      at: [0, 0.2, -4.14],
      dir: [1, 0, 0],
      flat: true,
      name: "tailWheelHub",
      group: "landingGear",
    },
  );

  plate(
    b,
    [
      [-0.6, -0.02],
      [0.6, -0.02],
      [0.82, 0.18],
      [0.55, 0.28],
      [-0.55, 0.28],
      [-0.82, 0.18],
    ],
    [0, 1.22, 2.72],
    [1, 0, 0],
    [0, 0, 1],
    BLUEPRINT_SHADE,
    "radiatorFairing",
    0.07,
  );

  for (let i = 0; i < 7; i++) {
    const x = -0.54 + i * 0.18;
    rod(
      b,
      [x, 1.17, 2.7],
      [x, 1.12, 3.05],
      0.016,
      i % 2 === 0 ? BLUEPRINT_CYAN : BLUEPRINT_LIGHT,
      `radiatorSlat${i}`,
    );
  }

  plate(
    b,
    [
      [-0.38, -0.52],
      [0.38, -0.52],
      [0.55, 0.22],
      [0.34, 0.42],
      [-0.34, 0.42],
      [-0.55, 0.22],
    ],
    [0, 1.16, 1.02],
    [1, 0, 0],
    [0, 0, 1],
    BLUEPRINT_MID,
    "bellyAccessPanel",
    0.045,
  );

  for (const side of [1, -1]) {
    rod(
      b,
      [side * 0.73, 1.62, 2.46],
      [side * 0.88, 1.68, 2.98],
      0.024,
      BLUEPRINT_CYAN,
      side > 0 ? "exhaustRailL" : "exhaustRailR",
    );

    for (let i = 0; i < 3; i++) {
      const z = 2.5 + i * 0.25;
      rod(
        b,
        [side * 0.9, 1.68, z],
        [side * 0.9, 1.68, z + 0.14],
        0.035,
        BLUEPRINT_INK,
        side > 0 ? `exhaustSocketL${i}` : `exhaustSocketR${i}`,
      );
      b.part(
        new THREE.CylinderGeometry(0.026, 0.035, 0.08, 7),
        BLUEPRINT_PALE,
        {
          at: [side * 0.91, 1.68, z + 0.17],
          dir: [0, 0, 1],
          flat: true,
          name: side > 0 ? `exhaustTipL${i}` : `exhaustTipR${i}`,
        },
      );
    }
  }

  b.sweep(
    catmull([
      [0, 2.3, -1.48],
      [0, 2.85, -1.54],
      [0, 3.4, -1.4],
    ]),
    [0.035, 0.012],
    {
      color: BLUEPRINT_CYAN,
      section: { ngon: 6 },
      caps: "point",
      name: "radioMast",
      group: "antenna",
    },
  );

  rod(
    b,
    [0, 2.92, -1.53],
    [0, 2.13, -3.62],
    0.008,
    BLUEPRINT_LIGHT,
    "radioCable",
  );

  for (const side of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.09, 0.1, 0.07, 8),
      BLUEPRINT_PALE,
      {
        at: [side * 5.58, 1.52, 0.02],
        dir: [1, 0, 0],
        flat: true,
        name: side > 0 ? "wingNavigationHousingL" : "wingNavigationHousingR",
        group: "navigation",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.075, 8, 5),
      BLUEPRINT_LIGHT,
      {
        at: [side * 5.62, 1.52, 0.02],
        flat: true,
        name: side > 0 ? "wingNavigationLensL" : "wingNavigationLensR",
        group: "navigation",
      },
    );
  }

  b.part(
    new THREE.SphereGeometry(0.065, 8, 5),
    BLUEPRINT_PALE,
    {
      at: [0, 1.58, -5.12],
      flat: true,
      name: "tailNavigationHousing",
      group: "navigation",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.043, 8, 5),
    BLUEPRINT_CYAN,
    {
      at: [0, 1.58, -5.17],
      flat: true,
      name: "tailNavigationLens",
      group: "navigation",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.18, 0.035, 0.42),
    BLUEPRINT_SHADE,
    {
      at: [0, 0.82, -3.9],
      flat: true,
      name: "tailGearDoor",
      group: "landingGear",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.56, 0.08, 0.16),
    BLUEPRINT_INK,
    {
      at: [0, 2.42, -0.38],
      flat: true,
      name: "cockpitInstrumentShelf",
      group: "cockpit",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.42, 0.16, 0.08),
    BLUEPRINT_PALE,
    {
      at: [0, 2.49, -0.38],
      flat: true,
      name: "cockpitInstrumentFace",
      group: "cockpit",
    },
  );

  for (let i = 0; i < 5; i++) {
    b.part(
      new THREE.CylinderGeometry(0.022, 0.022, 0.018, 8),
      i % 2 === 0 ? BLUEPRINT_CYAN : BLUEPRINT_INK,
      {
        at: [-0.15 + i * 0.075, 2.59, -0.42],
        dir: [0, 1, 0],
        flat: true,
        name: `cockpitGauge${i}`,
        group: "cockpit",
      },
    );
  }

  rod(
    b,
    [0, 2.5, -0.13],
    [0, 2.22, -0.03],
    0.018,
    BLUEPRINT_INK,
    "controlStick",
  );

  b.part(
    new THREE.SphereGeometry(0.045, 8, 5),
    BLUEPRINT_LIGHT,
    {
      at: [0, 2.22, -0.03],
      flat: true,
      name: "controlStickGrip",
      group: "cockpit",
    },
  );

  for (const side of [1, -1]) {
    rod(
      b,
      [side * 0.3, 2.26, -0.55],
      [side * 0.3, 2.45, 0.65],
      0.012,
      BLUEPRINT_PALE,
      side > 0 ? "canopyReflectionL" : "canopyReflectionR",
    );
  }

  for (let i = 0; i < 6; i++) {
    const z = -3.75 + i * 0.18;
    rod(
      b,
      [-0.34, 1.34, z],
      [0.34, 1.34, z],
      0.008,
      BLUEPRINT_CYAN,
      `bellyBlueprintRib${i}`,
    );
  }

  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.22, 0.025, 0.035),
      BLUEPRINT_PALE,
      {
        at: [side * 1.0, 1.55, 1.7],
        rotation: [0, side * 0.18, 0],
        flat: true,
        name: side > 0 ? "wingRootHatchMarkL" : "wingRootHatchMarkR",
      },
    );

    rod(
      b,
      [side * 1.2, 1.58, -3.72],
      [side * 2.15, 1.58, -3.88],
      0.012,
      BLUEPRINT_LIGHT,
      side > 0 ? "tailplanePanelLineL" : "tailplanePanelLineR",
    );
  }

  for (let i = 0; i < 5; i++) {
    b.part(
      new THREE.SphereGeometry(0.016, 6, 4),
      BLUEPRINT_PALE,
      {
        at: [-0.32 + i * 0.16, 1.87, -3.92],
        flat: true,
        name: `tailplaneRivet${i}`,
      },
    );
  }

  for (const add of STAGE2) add(b);

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addCockpitInterior(b: Builder) {
  const panelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 64">
      <rect width="256" height="64" fill="#082844"/>
      <path d="M5 7 H251 M5 57 H251 M5 7 V57 M251 7 V57"
        fill="none" stroke="#76e4e8" stroke-width="3"/>
      <path d="M10 13 H44 M212 13 H246 M10 51 H33 M223 51 H246"
        stroke="#25bfd0" stroke-width="2"/>
      <circle cx="28" cy="32" r="14" fill="none" stroke="#c8fbf5" stroke-width="3"/>
      <circle cx="28" cy="32" r="3" fill="#c8fbf5"/>
      <path d="M28 32 L35 21 M28 32 L17 38" stroke="#25bfd0" stroke-width="3"/>
      <circle cx="65" cy="32" r="14" fill="none" stroke="#c8fbf5" stroke-width="3"/>
      <circle cx="65" cy="32" r="3" fill="#c8fbf5"/>
      <path d="M65 32 L61 19 M65 32 L76 39" stroke="#25bfd0" stroke-width="3"/>
      <circle cx="102" cy="32" r="14" fill="none" stroke="#c8fbf5" stroke-width="3"/>
      <circle cx="102" cy="32" r="3" fill="#c8fbf5"/>
      <path d="M102 32 L111 28" stroke="#25bfd0" stroke-width="3"/>
      <path d="M133 18 H191 M133 27 H184 M133 36 H194 M133 45 H174"
        stroke="#76e4e8" stroke-width="3"/>
      <path d="M201 18 h40 M201 27 h31 M201 36 h40 M201 45 h24"
        stroke="#25bfd0" stroke-width="3"/>
      <text x="135" y="57" fill="#c8fbf5" font-size="10"
        font-family="monospace" letter-spacing="2">MK.II</text>
    </svg>`,
    { size: 256 },
  );

  const smallPanelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 32">
      <path d="M3 4 H125 V28 H3 Z" fill="#061b32" stroke="#76e4e8" stroke-width="2"/>
      <path d="M10 10 H118 M10 16 H92 M10 22 H108"
        stroke="#25bfd0" stroke-width="2"/>
      <circle cx="111" cy="16" r="5" fill="none" stroke="#c8fbf5" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      name,
      group: "cockpitInterior",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      caps: "round",
      name,
      group: "cockpitInterior",
    });

  // Low central cockpit floor and the raised console between the pilot's knees.
  box(
    [0.66, 0.035, 0.82],
    [0, 2.405, 0.16],
    BLUEPRINT_INK,
    "cockpitFloor",
  );
  box(
    [0.16, 0.09, 0.58],
    [0, 2.45, 0.32],
    BLUEPRINT_SHADE,
    "centerConsole",
  );
  box(
    [0.12, 0.012, 0.52],
    [0, 2.502, 0.32],
    BLUEPRINT_CYAN,
    "centerConsoleGuide",
  );
  box(
    [0.08, 0.018, 0.28],
    [0, 2.555, 0.29],
    BLUEPRINT_PALE,
    "consoleSwitchRail",
  );

  // The compact pilot seat: thick back, cushion, head pad, and visible construction seams.
  box(
    [0.36, 0.075, 0.34],
    [0, 2.435, -0.22],
    BLUEPRINT_INK,
    "pilotSeatCushion",
  );
  box(
    [0.39, 0.235, 0.07],
    [0, 2.555, -0.39],
    BLUEPRINT_INK,
    "pilotSeatBack",
  );
  box(
    [0.22, 0.075, 0.055],
    [0, 2.69, -0.42],
    BLUEPRINT_SHADE,
    "pilotHeadRest",
  );

  rod(
    [-0.18, 2.435, -0.34],
    [-0.18, 2.59, -0.39],
    0.013,
    BLUEPRINT_CYAN,
    "seatEdgeL",
  );
  rod(
    [0.18, 2.435, -0.34],
    [0.18, 2.59, -0.39],
    0.013,
    BLUEPRINT_CYAN,
    "seatEdgeR",
  );
  rod(
    [-0.17, 2.47, -0.05],
    [-0.17, 2.66, -0.36],
    0.012,
    BLUEPRINT_PALE,
    "harnessL",
  );
  rod(
    [0.17, 2.47, -0.05],
    [0.17, 2.66, -0.36],
    0.012,
    BLUEPRINT_PALE,
    "harnessR",
  );
  box(
    [0.055, 0.045, 0.07],
    [0, 2.54, -0.13],
    BLUEPRINT_LIGHT,
    "harnessLatch",
  );

  // Instrument shelf and its drawn cyanotype face.
  box(
    [0.56, 0.14, 0.075],
    [0, 2.505, 0.68],
    BLUEPRINT_INK,
    "instrumentPanelHousing",
  );
  b.part(new THREE.PlaneGeometry(0.52, 0.13), BLUEPRINT_PALE, {
    at: [0, 2.505, 0.722],
    dir: [0, 0, 1],
    axis: "z",
    texture: panelTexture,
    flat: true,
    name: "instrumentPanelDrawing",
    group: "cockpitInterior",
  });

  // Five physical gauge bezels sit proud of the illustrated panel.
  const gaugeXs = [-0.19, -0.095, 0, 0.095, 0.19];
  for (let i = 0; i < gaugeXs.length; i++) {
    const x = gaugeXs[i];
    const y = i === 2 ? 2.52 : 2.505;
    const z = 0.733;

    b.part(new THREE.TorusGeometry(0.031, 0.006, 5, 10), BLUEPRINT_LIGHT, {
      at: [x, y, z],
      flat: true,
      name: `gaugeBezel${i}`,
      group: "cockpitInterior",
    });

    b.part(new THREE.CircleGeometry(0.024, 10), BLUEPRINT_INK, {
      at: [x, y, z + 0.006],
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: `gaugeFace${i}`,
      group: "cockpitInterior",
    });

    const angle = [-0.72, -0.2, 0.42, -0.48, 0.2][i];
    rod(
      [x, y, z + 0.014],
      [x + Math.sin(angle) * 0.017, y + Math.cos(angle) * 0.017, z + 0.014],
      0.0035,
      BLUEPRINT_CYAN,
      `gaugeNeedle${i}`,
    );

    b.part(new THREE.SphereGeometry(0.0055, 6, 4), BLUEPRINT_PALE, {
      at: [x, y, z + 0.017],
      flat: true,
      name: `gaugeHub${i}`,
      group: "cockpitInterior",
    });
  }

  // Tiny side annunciator strip on the right of the main panel.
  b.part(new THREE.PlaneGeometry(0.27, 0.07), BLUEPRINT_LIGHT, {
    at: [0.105, 2.41, 0.726],
    dir: [0, 0, 1],
    axis: "z",
    texture: smallPanelTexture,
    flat: true,
    name: "annunciatorStrip",
    group: "cockpitInterior",
  });

  // Control column rises from the central console, with a chunky grip and a small trigger block.
  rod(
    [0, 2.47, 0.13],
    [0, 2.615, 0.25],
    0.014,
    BLUEPRINT_INK,
    "controlColumn",
  );
  b.part(new THREE.SphereGeometry(0.043, 8, 5), BLUEPRINT_PALE, {
    at: [0, 2.625, 0.26],
    flat: true,
    name: "controlGrip",
    group: "cockpitInterior",
  });
  box(
    [0.052, 0.04, 0.075],
    [0, 2.555, 0.205],
    BLUEPRINT_CYAN,
    "controlTriggerBlock",
  );

  // Two strong canopy braces follow the bubble canopy's inner silhouette.
  rod(
    [-0.31, 2.42, -0.36],
    [-0.27, 2.705, 0.36],
    0.012,
    BLUEPRINT_PALE,
    "canopyBraceInnerL",
  );
  rod(
    [0.31, 2.42, -0.36],
    [0.27, 2.705, 0.36],
    0.012,
    BLUEPRINT_PALE,
    "canopyBraceInnerR",
  );
  rod(
    [-0.265, 2.7, 0.35],
    [0.265, 2.7, 0.35],
    0.009,
    BLUEPRINT_CYAN,
    "canopyBraceHeader",
  );

  // A pair of short side consoles and their pale edge rails make the cockpit read as engineered,
  // rather than as a floating collection of instruments.
  box(
    [0.11, 0.075, 0.42],
    [-0.315, 2.455, 0.22],
    BLUEPRINT_SHADE,
    "leftSideConsole",
  );
  box(
    [0.11, 0.075, 0.42],
    [0.315, 2.455, 0.22],
    BLUEPRINT_SHADE,
    "rightSideConsole",
  );
  rod(
    [-0.375, 2.5, 0.02],
    [-0.375, 2.5, 0.43],
    0.009,
    BLUEPRINT_LIGHT,
    "leftSideRail",
  );
  rod(
    [0.375, 2.5, 0.02],
    [0.375, 2.5, 0.43],
    0.009,
    BLUEPRINT_LIGHT,
    "rightSideRail",
  );

  // Small square side switches, deliberately chunky in the blueprint style.
  for (let i = 0; i < 3; i++) {
    const z = 0.09 + i * 0.13;
    box(
      [0.035, 0.028, 0.055],
      [-0.38, 2.51, z],
      i === 1 ? BLUEPRINT_PALE : BLUEPRINT_CYAN,
      `leftSwitch${i}`,
    );
    box(
      [0.035, 0.028, 0.055],
      [0.38, 2.51, z],
      i === 1 ? BLUEPRINT_PALE : BLUEPRINT_CYAN,
      `rightSwitch${i}`,
    );
  }
}
    return addCockpitInterior;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addPropellerBadge(b: Builder) {
  const GROUP = "stage2-blueprint-details";

  type P = [number, number, number];

  const disc = (
    radius: number,
    at: P,
    color: string,
    name: string,
    segments = 28,
  ) =>
    b.part(new THREE.CircleGeometry(radius, segments), color, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      group: GROUP,
      name,
    });

  const ring = (
    inner: number,
    outer: number,
    at: P,
    color: string,
    name: string,
    segments = 32,
  ) =>
    b.part(new THREE.RingGeometry(inner, outer, segments), color, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      group: GROUP,
      name,
    });

  const line = (a: P, c: P, radius: number, color: string, name: string) =>
    b.rod(a, c, radius, {
      color,
      caps: "round",
      section: { ngon: 6 },
      group: GROUP,
      name,
    });

  // ---------------------------------------------------------------------------
  // Propeller nose badge. A recessed registration ring anchors the badge at the
  // requested attachment surface, while the small graphic sits just ahead of
  // the existing pale propeller cap so it remains visible from the front.
  // ---------------------------------------------------------------------------

  ring(
    0.115,
    0.158,
    [0, 1.55, 5.586],
    BLUEPRINT_INK,
    "propellerBadgeRecess",
    28,
  );

  ring(
    0.122,
    0.15,
    [0, 1.55, 5.592],
    BLUEPRINT_CYAN,
    "propellerBadgeOuterTrace",
    28,
  );

  const badgeZ = 5.718;

  disc(
    0.147,
    [0, 1.55, badgeZ],
    BLUEPRINT_INK,
    "propellerBadgeDarkField",
    28,
  );

  ring(
    0.119,
    0.145,
    [0, 1.55, badgeZ + 0.004],
    BLUEPRINT_PALE,
    "propellerBadgePaleBorder",
    28,
  );

  disc(
    0.102,
    [0, 1.55, badgeZ + 0.008],
    BLUEPRINT_CYAN,
    "propellerBadgeCyanField",
    28,
  );

  ring(
    0.074,
    0.096,
    [0, 1.55, badgeZ + 0.012],
    BLUEPRINT_PALE,
    "propellerBadgeInnerRing",
    24,
  );

  disc(
    0.043,
    [0, 1.55, badgeZ + 0.016],
    BLUEPRINT_INK,
    "propellerBadgeCenter",
    20,
  );

  // Three crisp, slightly oversize radial spokes make the hub read as a
  // mechanical propeller fitting rather than a flat decal.
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
    b.part(
      new THREE.BoxGeometry(0.018, 0.105, 0.012),
      BLUEPRINT_PALE,
      {
        at: [0, 1.55, badgeZ + 0.022],
        rotation: [0, 0, angle],
        flat: true,
        group: GROUP,
        name: `propellerBadgeSpoke${i + 1}`,
      },
    );
  }

  // Tiny cyan fasteners at the three spoke roots.
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(angle) * 0.068;
    const y = 1.55 + Math.sin(angle) * 0.068;

    b.part(
      new THREE.SphereGeometry(0.014, 7, 4),
      BLUEPRINT_CYAN,
      {
        at: [x, y, badgeZ + 0.028],
        flat: true,
        group: GROUP,
        name: `propellerBadgeRivet${i + 1}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Matching upper-wing RAF-style cyanotype roundels.
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const cx = side * 2.45;
    const cz = 0.2;
    const y0 = 1.553;

    // Deep field leaves a strong blueprint outline against the blue wing.
    disc(
      0.435,
      [cx, y0, cz],
      BLUEPRINT_INK,
      side > 0 ? "wingRoundelFieldL" : "wingRoundelFieldR",
      32,
    );

    // Pale outer disc and cyan middle disc produce the cyanotype equivalent
    // of the RAF concentric colour hierarchy.
    disc(
      0.354,
      [cx, y0 + 0.004, cz],
      BLUEPRINT_PALE,
      side > 0 ? "wingRoundelPaleL" : "wingRoundelPaleR",
      32,
    );

    disc(
      0.246,
      [cx, y0 + 0.008, cz],
      BLUEPRINT_CYAN,
      side > 0 ? "wingRoundelCyanL" : "wingRoundelCyanR",
      32,
    );

    disc(
      0.125,
      [cx, y0 + 0.012, cz],
      BLUEPRINT_INK,
      side > 0 ? "wingRoundelCenterL" : "wingRoundelCenterR",
      28,
    );

    // Fine construction circles keep the markings integrated with the
    // technical-drawing language of the airframe.
    ring(
      0.412,
      0.431,
      [cx, y0 + 0.017, cz],
      BLUEPRINT_LIGHT,
      side > 0 ? "wingRoundelOuterTraceL" : "wingRoundelOuterTraceR",
      32,
    );

    ring(
      0.232,
      0.249,
      [cx, y0 + 0.019, cz],
      BLUEPRINT_PALE,
      side > 0 ? "wingRoundelInnerTraceL" : "wingRoundelInnerTraceR",
      28,
    );

    // Eight registration ticks sit just outside the roundel. They are kept
    // short so the marking remains a roundel first and a blueprint detail
    // second.
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const r0 = 0.447;
      const r1 = i % 2 === 0 ? 0.485 : 0.472;

      const a: P = [
        cx + Math.cos(angle) * r0,
        y0 + 0.021,
        cz + Math.sin(angle) * r0,
      ];
      const c: P = [
        cx + Math.cos(angle) * r1,
        y0 + 0.021,
        cz + Math.sin(angle) * r1,
      ];

      line(
        a,
        c,
        i % 2 === 0 ? 0.009 : 0.006,
        i % 2 === 0 ? BLUEPRINT_LIGHT : BLUEPRINT_CYAN,
        side > 0
          ? `wingRoundelTickL${i}`
          : `wingRoundelTickR${i}`,
      );
    }

    // Four small pale rivets mark the cardinal construction points without
    // cluttering the dark central disc.
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      b.part(
        new THREE.SphereGeometry(0.018, 7, 4),
        BLUEPRINT_PALE,
        {
          at: [
            cx + Math.cos(angle) * 0.292,
            y0 + 0.026,
            cz + Math.sin(angle) * 0.292,
          ],
          flat: true,
          group: GROUP,
          name: side > 0
            ? `wingRoundelRivetL${i}`
            : `wingRoundelRivetR${i}`,
        },
      );
    }
  }
}
    return addPropellerBadge;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addWingGunPorts(b: Builder) {
  const gunRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      section: { ngon: 8 },
      caps: "round",
      name,
      group: "stage2-guns",
    });

  const gunCylinder = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    name: string,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 8), color, {
      at,
      dir,
      flat: true,
      name,
      group: "stage2-guns",
    });

  const gunPositions = [
    { x: 2.25, z: 0.88 },
    { x: 2.78, z: 0.81 },
    { x: 3.31, z: 0.74 },
    { x: 3.84, z: 0.67 },
  ];

  for (const side of [1, -1]) {
    for (let i = 0; i < gunPositions.length; i++) {
      const { x, z } = gunPositions[i];
      const sx = side * x;
      const barrelStart: [number, number, number] = [sx, 1.435, z - 0.015];
      const barrelEnd: [number, number, number] = [sx, 1.435, z + 0.205];
      const muzzleZ = z + 0.225;

      gunCylinder(
        0.075,
        0.034,
        [sx, 1.435, z - 0.035],
        BLUEPRINT_SHADE,
        `s23-gun-collar-${side > 0 ? "L" : "R"}-${i}`,
      );

      gunRod(
        barrelStart,
        barrelEnd,
        0.032,
        BLUEPRINT_INK,
        `s23-gun-barrel-${side > 0 ? "L" : "R"}-${i}`,
      );

      b.part(
        new THREE.TorusGeometry(0.052, 0.009, 6, 12),
        BLUEPRINT_PALE,
        {
          at: [sx, 1.435, muzzleZ],
          dir: [0, 0, 1],
          axis: "z",
          flat: true,
          name: `s23-muzzle-ring-${side > 0 ? "L" : "R"}-${i}`,
          group: "stage2-guns",
        },
      );

      gunCylinder(
        0.027,
        0.012,
        [sx, 1.435, muzzleZ + 0.003],
        BLUEPRINT_INK,
        `s23-muzzle-bore-${side > 0 ? "L" : "R"}-${i}`,
        [0, 0, 1],
      );

      b.part(
        new THREE.BoxGeometry(0.18, 0.026, 0.255),
        BLUEPRINT_SHADE,
        {
          at: [sx, 1.425, z - 0.155],
          flat: true,
          name: `s23-gun-access-plate-${side > 0 ? "L" : "R"}-${i}`,
          group: "stage2-guns",
        },
      );

      gunRod(
        [sx, 1.445, z - 0.26],
        [sx, 1.445, z - 0.065],
        0.009,
        BLUEPRINT_LIGHT,
        `s23-gun-access-seam-${side > 0 ? "L" : "R"}-${i}`,
      );

      for (const dx of [-0.06, 0.06]) {
        b.part(
          new THREE.SphereGeometry(0.014, 6, 4),
          BLUEPRINT_PALE,
          {
            at: [sx + dx, 1.447, z - 0.155],
            flat: true,
            name: `s23-gun-rivet-${side > 0 ? "L" : "R"}-${i}-${dx < 0 ? "a" : "b"}`,
            group: "stage2-guns",
          },
        );
      }
    }

    gunRod(
      [side * 2.02, 1.45, 0.99],
      [side * 4.08, 1.45, 0.70],
      0.012,
      BLUEPRINT_CYAN,
      `s23-gun-leading-blueprint-line-${side > 0 ? "L" : "R"}`,
    );
  }

  const housingOutline: [number, number][] = [
    [-0.48, -0.34],
    [0.48, -0.34],
    [0.62, -0.23],
    [0.66, 0.14],
    [0.55, 0.27],
    [-0.55, 0.27],
    [-0.66, 0.14],
    [-0.62, -0.23],
  ];

  b.extrude(housingOutline, {
    at: [0, 1.08, 2.85],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.1,
    bevel: 0.025,
    smoothing: 1,
    color: BLUEPRINT_MID,
    name: "s23-radiator-rounded-housing",
    group: "stage2-radiator",
  });

  const openingOutline: [number, number][] = [
    [-0.43, -0.22],
    [0.43, -0.22],
    [0.51, -0.12],
    [0.51, 0.16],
    [0.43, 0.23],
    [-0.43, 0.23],
    [-0.51, 0.16],
    [-0.51, -0.12],
  ];

  b.extrude(openingOutline, {
    at: [0, 1.005, 2.85],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.026,
    bevel: 0.008,
    smoothing: 1,
    color: BLUEPRINT_INK,
    name: "s23-radiator-recess",
    group: "stage2-radiator",
  });

  const rimPath = polyline(
    [
      [-0.46, 0.982, 2.63],
      [0.46, 0.982, 2.63],
      [0.56, 0.982, 2.73],
      [0.56, 0.982, 3.01],
      [0.46, 0.982, 3.08],
      [-0.46, 0.982, 3.08],
      [-0.56, 0.982, 3.01],
      [-0.56, 0.982, 2.73],
    ],
    { closed: true },
  );

  b.sweep(rimPath, 0.014, {
    color: BLUEPRINT_CYAN,
    section: { ngon: 6 },
    caps: "none",
    name: "s23-radiator-cyan-rim",
    group: "stage2-radiator",
  });

  const grilleXs = [-0.36, -0.18, 0, 0.18, 0.36];
  for (let i = 0; i < grilleXs.length; i++) {
    const x = grilleXs[i];
    gunRod(
      [x, 0.972, 2.69],
      [x, 0.972, 3.03],
      0.013,
      i === 2 ? BLUEPRINT_PALE : BLUEPRINT_LIGHT,
      `s23-radiator-grille-bar-${i}`,
    );
  }

  gunRod(
    [-0.48, 0.974, 2.68],
    [0.48, 0.974, 2.68],
    0.013,
    BLUEPRINT_PALE,
    "s23-radiator-grille-rear-bar",
  );

  gunRod(
    [-0.48, 0.974, 3.04],
    [0.48, 0.974, 3.04],
    0.013,
    BLUEPRINT_CYAN,
    "s23-radiator-grille-front-bar",
  );

  gunRod(
    [0, 0.968, 2.69],
    [0, 0.968, 3.03],
    0.008,
    BLUEPRINT_INK,
    "s23-radiator-center-recess-line",
  );

  b.part(
    new THREE.BoxGeometry(0.82, 0.035, 0.055),
    BLUEPRINT_PALE,
    {
      at: [0, 1.025, 2.57],
      flat: true,
      name: "s23-radiator-rear-lip",
      group: "stage2-radiator",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.82, 0.035, 0.055),
    BLUEPRINT_CYAN,
    {
      at: [0, 1.025, 3.13],
      flat: true,
      name: "s23-radiator-front-lip",
      group: "stage2-radiator",
    },
  );
}
    return addWingGunPorts;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addExhaustStacks(b: Builder) {
  const stackZ = [2.47, 2.68, 2.89];
  const stackY = [1.64, 1.68, 1.72];

  const axisFor = (side: number) => new THREE.Vector3(side * 0.23, 0.03, 0.105).normalize();

  const pointAlong = (
    side: number,
    y: number,
    z: number,
    t: number,
  ): [number, number, number] => [
    side * (0.735 + 0.23 * t),
    y + 0.03 * t,
    z + 0.105 * t,
  ];

  // A dark, slightly inset exhaust bay gives the six pipes a crisp blueprint silhouette.
  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.035, 0.43, 0.72),
      BLUEPRINT_SHADE,
      {
        at: [side * 0.715, 1.69, 2.68],
        flat: true,
        name: `s24_exhaustBay${side > 0 ? "L" : "R"}`,
        group: "exhaust",
      },
    );

    const bayX = side * 0.748;

    for (const z of [2.31, 3.05]) {
      b.rod(
        [bayX, 1.48, z],
        [bayX, 1.91, z],
        0.012,
        {
          color: BLUEPRINT_CYAN,
          caps: "round",
          name: `s24_exhaustBayEdge${side > 0 ? "L" : "R"}${z}`,
          group: "exhaust",
        },
      );
    }

    for (const y of [1.48, 1.91]) {
      b.rod(
        [bayX, y, 2.31],
        [bayX, y, 3.05],
        0.009,
        {
          color: BLUEPRINT_LIGHT,
          caps: "round",
          name: `s24_exhaustBaySeam${side > 0 ? "L" : "R"}${y}`,
          group: "exhaust",
        },
      );
    }

    for (const y of [1.5, 1.9]) {
      for (const z of [2.34, 3.02]) {
        b.part(
          new THREE.SphereGeometry(0.022, 7, 5),
          BLUEPRINT_PALE,
          {
            at: [side * 0.758, y, z],
            flat: true,
            name: `s24_exhaustRivet${side > 0 ? "L" : "R"}${y}${z}`,
            group: "exhaust",
          },
        );
      }
    }
  }

  for (const side of [1, -1]) {
    for (let i = 0; i < stackZ.length; i++) {
      const z = stackZ[i];
      const y = stackY[i];
      const axis = axisFor(side);

      const base: [number, number, number] = [
        side * 0.738,
        y,
        z,
      ];
      const bodyEnd = pointAlong(side, y, z, 0.78);
      const tipStart = pointAlong(side, y, z, 0.76);
      const tipEnd = pointAlong(side, y, z, 1.0);

      // Dark mounting socket seated against the fuselage side.
      b.part(
        new THREE.CylinderGeometry(0.067, 0.067, 0.034, 8),
        BLUEPRINT_INK,
        {
          at: base,
          dir: axis,
          flat: true,
          name: `s24_exhaustSocket${side > 0 ? "L" : "R"}${i}`,
          group: "exhaust",
        },
      );

      // Pale inner collar makes the mouth read as a machined opening.
      b.part(
        new THREE.CylinderGeometry(0.047, 0.047, 0.017, 8),
        BLUEPRINT_PALE,
        {
          at: [
            base[0] + axis.x * 0.022,
            base[1] + axis.y * 0.022,
            base[2] + axis.z * 0.022,
          ],
          dir: axis,
          flat: true,
          name: `s24_exhaustInnerRing${side > 0 ? "L" : "R"}${i}`,
          group: "exhaust",
        },
      );

      // Cyan stack body, angled outward and a little toward the nose (+Z).
      b.rod(base, bodyEnd, 0.043, {
        color: BLUEPRINT_CYAN,
        caps: "round",
        section: { ngon: 8 },
        name: `s24_exhaustStack${side > 0 ? "L" : "R"}${i}`,
        group: "exhaust",
      });

      // Fine dark seam at the transition from the stack to its pale heat-marked tip.
      b.rod(
        pointAlong(side, y, z, 0.72),
        pointAlong(side, y, z, 0.81),
        0.047,
        {
          color: BLUEPRINT_INK,
          caps: "round",
          section: { ngon: 8 },
          name: `s24_exhaustCollar${side > 0 ? "L" : "R"}${i}`,
          group: "exhaust",
        },
      );

      // Pale ends sit slightly proud of the cyan body.
      b.rod(tipStart, tipEnd, 0.036, {
        color: BLUEPRINT_PALE,
        caps: "round",
        section: { ngon: 8 },
        name: `s24_exhaustTip${side > 0 ? "L" : "R"}${i}`,
        group: "exhaust",
      });

      // A tiny cyan end-face inset keeps the tips from reading as plain white cylinders.
      b.part(
        new THREE.CylinderGeometry(0.024, 0.024, 0.012, 8),
        BLUEPRINT_CYAN,
        {
          at: [
            tipEnd[0] + axis.x * 0.008,
            tipEnd[1] + axis.y * 0.008,
            tipEnd[2] + axis.z * 0.008,
          ],
          dir: axis,
          flat: true,
          name: `s24_exhaustTipInset${side > 0 ? "L" : "R"}${i}`,
          group: "exhaust",
        },
      );

      // Two small pale witness marks per pipe, like a technical drawing's clamp bands.
      for (const t of [0.34, 0.57]) {
        const p = pointAlong(side, y, z, t);
        b.part(
          new THREE.TorusGeometry(0.044, 0.006, 5, 8),
          BLUEPRINT_LIGHT,
          {
            at: p,
            dir: axis,
            axis: "z",
            flat: true,
            name: `s24_exhaustBand${side > 0 ? "L" : "R"}${i}_${t}`,
            group: "exhaust",
          },
        );
      }
    }
  }
}
    return addExhaustStacks;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addAntennaMast(b: Builder) {
  const mastPath = catmull([
    [0, 2.36, -1.46],
    [0, 2.72, -1.45],
    [0, 3.08, -1.41],
    [0, 3.28, -1.36],
  ]);

  b.part(
    new THREE.ConeGeometry(0.105, 0.14, 8),
    BLUEPRINT_INK,
    {
      at: [0, 2.37, -1.46],
      flat: true,
      name: "s25AntennaFootFairing",
      group: "antenna",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.078, 0.092, 0.065, 8),
    BLUEPRINT_MID,
    {
      at: [0, 2.445, -1.455],
      flat: true,
      name: "s25AntennaFootCollar",
      group: "antenna",
    },
  );

  b.sweep(mastPath, [0.052, 0.014], {
    color: BLUEPRINT_CYAN,
    section: { ngon: 6 },
    caps: { start: "flat", end: "point" },
    name: "s25RadioMast",
    group: "antenna",
  });

  for (const [i, y] of [2.56, 2.82, 3.06].entries()) {
    b.part(
      new THREE.CylinderGeometry(
        i === 0 ? 0.057 : 0.029,
        i === 0 ? 0.057 : 0.029,
        0.026,
        8,
      ),
      i === 1 ? BLUEPRINT_PALE : BLUEPRINT_LIGHT,
      {
        at: [0, y, -1.44 + (y - 2.56) * 0.055],
        flat: true,
        name: `s25AntennaCollar${i}`,
        group: "antenna",
      },
    );
  }

  b.part(
    new THREE.SphereGeometry(0.027, 7, 5),
    BLUEPRINT_PALE,
    {
      at: [0, 3.27, -1.36],
      flat: true,
      name: "s25AntennaTip",
      group: "antenna",
    },
  );

  b.rod(
    [0, 3.02, -1.405],
    [0, 2.18, -3.62],
    0.006,
    {
      color: BLUEPRINT_LIGHT,
      section: { ngon: 6 },
      caps: "round",
      name: "s25AntennaCable",
      group: "antenna",
    },
  );

  b.rod(
    [0, 3.02, -1.405],
    [0, 2.2, -3.72],
    0.003,
    {
      color: BLUEPRINT_CYAN,
      section: { ngon: 6 },
      caps: "round",
      name: "s25AntennaCableShadow",
      group: "antenna",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.026, 0.033, 0.055, 8),
    BLUEPRINT_INK,
    {
      at: [0, 2.175, -3.65],
      flat: true,
      name: "s25AntennaCableSocket",
      group: "antenna",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.019, 6, 4),
    BLUEPRINT_PALE,
    {
      at: [0, 2.2, -3.72],
      flat: true,
      name: "s25AntennaCableInsulator",
      group: "antenna",
    },
  );

  for (const side of [1, -1]) {
    const prefix = side > 0 ? "L" : "R";
    const tipX = side * 5.585;

    b.part(
      new THREE.CylinderGeometry(0.108, 0.118, 0.105, 8),
      BLUEPRINT_PALE,
      {
        at: [tipX, 1.52, 0.02],
        dir: [side, 0, 0],
        flat: true,
        name: `s25NavigationHousing${prefix}`,
        group: "navigation",
      },
    );

    b.part(
      new THREE.TorusGeometry(0.073, 0.013, 6, 12),
      BLUEPRINT_INK,
      {
        at: [side * 5.64, 1.52, 0.02],
        dir: [side, 0, 0],
        flat: true,
        name: `s25NavigationRim${prefix}`,
        group: "navigation",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.057, 0.057, 0.04, 8),
      BLUEPRINT_CYAN,
      {
        at: [side * 5.665, 1.52, 0.02],
        dir: [side, 0, 0],
        flat: true,
        name: `s25NavigationLens${prefix}`,
        group: "navigation",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.022, 6, 4),
      BLUEPRINT_WHITE,
      {
        at: [side * 5.692, 1.548, 0.035],
        flat: true,
        name: `s25NavigationLensGlint${prefix}`,
        group: "navigation",
      },
    );

    b.rod(
      [side * 5.59, 1.64, -0.08],
      [side * 5.68, 1.64, -0.02],
      0.008,
      {
        color: BLUEPRINT_INK,
        section: { ngon: 6 },
        caps: "round",
        name: `s25NavigationUpperMark${prefix}`,
        group: "navigation",
      },
    );

    b.rod(
      [side * 5.59, 1.4, 0.1],
      [side * 5.68, 1.4, 0.04],
      0.008,
      {
        color: BLUEPRINT_LIGHT,
        section: { ngon: 6 },
        caps: "round",
        name: `s25NavigationLowerMark${prefix}`,
        group: "navigation",
      },
    );
  }

  b.part(
    new THREE.CylinderGeometry(0.076, 0.086, 0.09, 8),
    BLUEPRINT_PALE,
    {
      at: [0, 1.58, -5.145],
      dir: [0, 0, -1],
      flat: true,
      name: "s25TailNavigationHousing",
      group: "navigation",
    },
  );

  b.part(
    new THREE.TorusGeometry(0.052, 0.011, 6, 12),
    BLUEPRINT_INK,
    {
      at: [0, 1.58, -5.205],
      dir: [0, 0, -1],
      flat: true,
      name: "s25TailNavigationRim",
      group: "navigation",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.039, 0.039, 0.034, 8),
    BLUEPRINT_CYAN,
    {
      at: [0, 1.58, -5.225],
      dir: [0, 0, -1],
      flat: true,
      name: "s25TailNavigationLens",
      group: "navigation",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.014, 6, 4),
    BLUEPRINT_WHITE,
    {
      at: [0.018, 1.602, -5.248],
      flat: true,
      name: "s25TailNavigationGlint",
      group: "navigation",
    },
  );
}
    return addAntennaMast;
  })(),
);
// add6
STAGE2.push(
  (() => {
type P = [number, number, number];

function addGearDoors(b: Builder) {
  const hatchStencil = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48">
      <rect x="2" y="2" width="156" height="44" rx="5" fill="none" stroke="#e9ffff" stroke-width="4"/>
      <path d="M16 36 L16 12 L31 12 Q42 12 42 24 Q42 36 31 36 Z
               M22 30 L30 30 Q35 30 35 24 Q35 18 30 18 L22 18 Z"
            fill="#e9ffff"/>
      <path d="M53 36 L53 12 L60 12 L60 30 L76 30 L76 36 Z
               M87 12 L94 12 L94 36 L87 36 Z
               M105 12 L128 12 L128 18 L112 18 L112 21 L125 21 L125 27 L112 27 L112 30 L129 30 L129 36 L105 36 Z
               M138 12 L145 12 L145 30 L157 30 L157 36 L138 36 Z"
            fill="#e9ffff"/>
    </svg>`,
    { size: 256 },
  );

  const point = (side: number, u: number, y: number, z: number): P => [
    side * u,
    y,
    z,
  ];

  const rod = (
    a: P,
    c: P,
    radius: number,
    color: string,
    name: string,
  ) => {
    b.rod(a, c, radius, {
      color,
      caps: "round",
      section: { ngon: 6 },
      name,
      group: "stage2",
    });
  };

  const doorOutline: [number, number][] = [
    [-0.31, -0.29],
    [0.2, -0.3],
    [0.34, -0.16],
    [0.33, 0.18],
    [0.21, 0.29],
    [-0.2, 0.28],
    [-0.34, 0.13],
    [-0.36, -0.1],
  ];

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const doorCenter: P = point(side, 1.13, 1.075, -0.08);

    b.extrude(doorOutline, {
      at: doorCenter,
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.045,
      bevel: 0.012,
      color: BLUEPRINT_SHADE,
      name: `mainGearDoor${tag}`,
      group: "landingGear",
    });

    const doorEdge: P[] = doorOutline.map(([u, z]) =>
      point(side, 1.13 + u, 1.047, -0.08 + z),
    );
    for (let i = 0; i < doorEdge.length; i++) {
      rod(
        doorEdge[i],
        doorEdge[(i + 1) % doorEdge.length],
        0.009,
        BLUEPRINT_LIGHT,
        `mainGearDoorEdge${tag}_${i}`,
      );
    }

    const panelOutline: [number, number][] = [
      [-0.18, -0.16],
      [0.14, -0.16],
      [0.2, -0.08],
      [0.18, 0.13],
      [0.1, 0.18],
      [-0.14, 0.17],
      [-0.2, 0.09],
      [-0.21, -0.08],
    ];

    b.extrude(panelOutline, {
      at: point(side, 1.13, 1.041, -0.08),
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.014,
      bevel: 0.006,
      color: BLUEPRINT_BLUE,
      name: `gearDoorAccessPanel${tag}`,
      group: "landingGear",
    });

    rod(
      point(side, 1.0, 1.031, -0.19),
      point(side, 1.27, 1.031, 0.05),
      0.009,
      BLUEPRINT_CYAN,
      `gearDoorPanelDiagonalA${tag}`,
    );
    rod(
      point(side, 1.25, 1.031, -0.22),
      point(side, 1.0, 1.031, 0.08),
      0.007,
      BLUEPRINT_MID,
      `gearDoorPanelDiagonalB${tag}`,
    );

    const hingeX = side * 0.84;
    rod(
      [hingeX, 1.067, -0.31],
      [hingeX, 1.067, 0.17],
      0.018,
      BLUEPRINT_INK,
      `gearDoorHingeLine${tag}`,
    );

    for (let i = 0; i < 3; i++) {
      b.part(
        new THREE.CylinderGeometry(0.035, 0.035, 0.105, 8),
        BLUEPRINT_CYAN,
        {
          at: [hingeX, 1.067, -0.25 + i * 0.21],
          dir: [0, 0, 1],
          flat: true,
          name: `gearDoorHingeKnuckle${tag}_${i}`,
          group: "landingGear",
        },
      );
    }

    rod(
      point(side, 0.91, 1.19, 0.15),
      point(side, 1.08, 1.065, 0.1),
      0.022,
      BLUEPRINT_PALE,
      `gearDoorActuator${tag}`,
    );
    rod(
      point(side, 0.91, 1.19, 0.15),
      point(side, 0.98, 1.22, 0.15),
      0.034,
      BLUEPRINT_INK,
      `gearDoorActuatorSocket${tag}`,
    );

    b.part(
      new THREE.BoxGeometry(0.095, 0.022, 0.15),
      BLUEPRINT_INK,
      {
        at: point(side, 1.34, 1.036, -0.04),
        flat: true,
        name: `gearDoorOuterLatch${tag}`,
        group: "landingGear",
      },
    );

    rod(
      point(side, 1.3, 1.021, -0.1),
      point(side, 1.38, 1.021, 0.02),
      0.008,
      BLUEPRINT_LIGHT,
      `gearDoorLatchMark${tag}`,
    );

    b.part(
      new THREE.SphereGeometry(0.027, 7, 5),
      BLUEPRINT_PALE,
      {
        at: point(side, 1.13, 1.018, -0.24),
        flat: true,
        name: `gearDoorRivetFront${tag}`,
        group: "landingGear",
      },
    );
    b.part(
      new THREE.SphereGeometry(0.027, 7, 5),
      BLUEPRINT_PALE,
      {
        at: point(side, 1.13, 1.018, 0.11),
        flat: true,
        name: `gearDoorRivetRear${tag}`,
        group: "landingGear",
      },
    );

    const lowerDoorLine: P[] = [
      point(side, 0.91, 1.019, -0.21),
      point(side, 0.96, 1.019, -0.25),
      point(side, 1.02, 1.019, -0.26),
    ];
    for (let i = 0; i < lowerDoorLine.length - 1; i++) {
      rod(
        lowerDoorLine[i],
        lowerDoorLine[i + 1],
        0.007,
        BLUEPRINT_CYAN,
        `gearDoorWarningTick${tag}_${i}`,
      );
    }
  }

  b.part(
    new THREE.BoxGeometry(0.22, 0.028, 0.42),
    BLUEPRINT_SHADE,
    {
      at: [0, 0.805, -3.9],
      flat: true,
      name: "tailWheelDoorReinforced",
      group: "landingGear",
    },
  );

  rod(
    [0, 0.787, -4.09],
    [0, 0.787, -3.71],
    0.011,
    BLUEPRINT_INK,
    "tailWheelDoorHinge",
  );
  rod(
    [-0.095, 0.785, -4.08],
    [0.095, 0.785, -4.08],
    0.008,
    BLUEPRINT_LIGHT,
    "tailWheelDoorEdgeFront",
  );
  rod(
    [-0.095, 0.785, -3.73],
    [0.095, 0.785, -3.73],
    0.008,
    BLUEPRINT_LIGHT,
    "tailWheelDoorEdgeRear",
  );

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const cx = side * 1.25;
    const cy = 1.844;
    const cz = -3.92;

    b.part(
      new THREE.BoxGeometry(0.46, 0.026, 0.21),
      BLUEPRINT_MID,
      {
        at: [cx, cy, cz],
        flat: true,
        name: `tailInspectionHatch${tag}`,
        group: "tailplaneL",
      },
    );

    const hx0 = side * 1.02;
    const hx1 = side * 1.48;
    const hz0 = -4.025;
    const hz1 = -3.815;

    rod(
      [hx0, 1.862, hz0],
      [hx1, 1.862, hz0],
      0.008,
      BLUEPRINT_PALE,
      `tailHatchEdgeFront${tag}`,
    );
    rod(
      [hx1, 1.862, hz0],
      [hx1, 1.862, hz1],
      0.008,
      BLUEPRINT_PALE,
      `tailHatchEdgeOuter${tag}`,
    );
    rod(
      [hx1, 1.862, hz1],
      [hx0, 1.862, hz1],
      0.008,
      BLUEPRINT_PALE,
      `tailHatchEdgeRear${tag}`,
    );
    rod(
      [hx0, 1.862, hz1],
      [hx0, 1.862, hz0],
      0.008,
      BLUEPRINT_PALE,
      `tailHatchEdgeInner${tag}`,
    );

    b.part(
      new THREE.PlaneGeometry(0.32, 0.096),
      BLUEPRINT_WHITE,
      {
        at: [cx, 1.863, cz],
        dir: [0, 1, 0],
        axis: "z",
        up: [0, 0, 1],
        texture: hatchStencil,
        flat: true,
        name: `tailHatchStencil${tag}`,
        group: "tailplaneL",
      },
    );

    const rivets: P[] = [
      [side * 1.07, 1.874, -4.0],
      [side * 1.43, 1.874, -4.0],
      [side * 1.07, 1.874, -3.84],
      [side * 1.43, 1.874, -3.84],
    ];

    for (let i = 0; i < rivets.length; i++) {
      b.part(
        new THREE.SphereGeometry(0.018, 7, 5),
        BLUEPRINT_PALE,
        {
          at: rivets[i],
          flat: true,
          name: `tailHatchRivet${tag}_${i}`,
          group: "tailplaneL",
        },
      );
    }

    rod(
      [side * 1.03, 1.869, -3.93],
      [side * 1.03, 1.869, -3.81],
      0.012,
      BLUEPRINT_INK,
      `tailHatchHinge${tag}`,
    );

    b.part(
      new THREE.BoxGeometry(0.075, 0.018, 0.035),
      BLUEPRINT_INK,
      {
        at: [side * 1.44, 1.875, -3.92],
        flat: true,
        name: `tailHatchLatch${tag}`,
        group: "tailplaneL",
      },
    );

    rod(
      [side * 1.4, 1.887, -3.98],
      [side * 1.4, 1.887, -3.86],
      0.006,
      BLUEPRINT_CYAN,
      `tailHatchLatchMark${tag}`,
    );

    rod(
      [side * 1.11, 1.873, -3.92],
      [side * 1.37, 1.873, -3.92],
      0.006,
      BLUEPRINT_CYAN,
      `tailHatchCenterMark${tag}`,
    );
  }

  rod(
    [0, 1.87, -4.32],
    [0, 1.87, -3.55],
    0.009,
    BLUEPRINT_INK,
    "tailplaneCenterServiceLine",
  );

  b.part(
    new THREE.SphereGeometry(0.024, 7, 5),
    BLUEPRINT_PALE,
    {
      at: [0, 1.88, -3.92],
      flat: true,
      name: "tailplaneCenterRivet",
      group: "tailplaneL",
    },
  );
}
    return addGearDoors;
  })(),
);
