import * as THREE from "three";
import {
  catmull,
  createBuilder,
  polyline,
} from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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
    "A low-poly Spitfire fighter plane built as a cyanotype blueprint: broad elliptical wings, tapered fuselage, bubble canopy, three-bladed propeller, tail surfaces, panel contours and landing gear.",
};

export const REQUESTS = [
  {
    id: "cockpitInterior",
    kind: "add",
    part: "canopy",
    what:
      "Add a compact cyanotype cockpit interior visible through the canopy: dark seat, pale instrument panel, circular gauges, a control stick and two thin canopy braces. Use BLUEPRINT_INK, BLUEPRINT_LIGHT and BLUEPRINT_PALE.",
    at: [0, 2.56, 0.28],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.35, 1.25],
  },
  {
    id: "propellerBadge",
    kind: "add",
    part: "propellerHub",
    what:
      "Add a small crisp blueprint roundel and a tiny three-spoke hub cap on the propeller nose. Use BLUEPRINT_PALE, BLUEPRINT_CYAN and BLUEPRINT_INK, keeping the propeller readable.",
    at: [0, 1.55, 5.58],
    normal: [0, 0, 1],
    bone: null,
    room: [0.45, 0.45, 0.08],
  },
  {
    id: "wingRoundels",
    kind: "add",
    part: "wingL",
    what:
      "Add matching RAF-style cyanotype roundels on both upper wings: concentric BLUEPRINT_PALE, BLUEPRINT_CYAN and BLUEPRINT_INK discs, flat to the wing and large enough to read from above.",
    at: [2.45, 1.54, 0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [1.45, 0.08, 1.45],
  },
  {
    id: "wingGunPorts",
    kind: "add",
    part: "wingL",
    what:
      "Add four paired wing gun-port details, mirrored across the aircraft: short dark-blue barrels, pale muzzle rings and tiny recessed access plates along the leading edges. Keep the barrels aligned with +Z.",
    at: [3.45, 1.29, 0.92],
    normal: [0, 0, 1],
    bone: null,
    room: [2.9, 0.32, 0.55],
  },
  {
    id: "radiatorIntake",
    kind: "add",
    part: "radiator",
    what:
      "Build the Spitfire's ventral radiator intake beneath the engine: a shallow rounded housing, dark recessed opening, pale inner grille bars and a thin cyan rim.",
    at: [0, 1.03, 2.85],
    normal: [0, -1, 0],
    bone: null,
    room: [1.25, 0.45, 0.9],
  },
  {
    id: "exhaustStacks",
    kind: "add",
    part: "fuselage",
    what:
      "Add six stubby exhaust stacks in two mirrored rows on the forward fuselage. Use BLUEPRINT_INK sockets, BLUEPRINT_CYAN stack bodies and BLUEPRINT_PALE tips, all pointing slightly forward.",
    at: [0.73, 1.68, 2.58],
    normal: [1, 0, 0],
    bone: null,
    room: [0.35, 0.75, 1.1],
  },
  {
    id: "antennaMast",
    kind: "add",
    part: "fuselage",
    what:
      "Add the small radio mast behind the cockpit with a tapered cyan mast, dark foot fairing and a fine blueprint cable running toward the tail.",
    at: [0, 2.53, -1.42],
    normal: [0, 1, 0],
    bone: null,
    room: [0.18, 0.9, 0.35],
  },
  {
    id: "navigationLights",
    kind: "add",
    part: "wingL",
    what:
      "Add tiny navigation lamps at both wing tips and a small tail lamp: faceted BLUEPRINT_PALE housings with cyan inset lenses.",
    at: [5.58, 1.5, 0.02],
    normal: [1, 0, 0],
    bone: null,
    room: [0.32, 0.3, 0.38],
  },
  {
    id: "gearDoors",
    kind: "add",
    part: "landingGear",
    what:
      "Add the two angular main landing-gear doors and a small tail-wheel door, with dark hinge lines and pale blueprint edge marks. Keep them close to the existing struts and wheels.",
    at: [1.15, 0.94, -0.08],
    normal: [0, -1, 0],
    bone: null,
    room: [0.9, 0.32, 1.1],
  },
  {
    id: "tailInspection",
    kind: "add",
    part: "tailplaneL",
    what:
      "Add a small rectangular inspection hatch and four rivet marks on each tailplane, aligned with the aircraft's longitudinal axis.",
    at: [1.25, 1.78, -3.92],
    normal: [0, 1, 0],
    bone: null,
    room: [0.72, 0.08, 0.42],
  },
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

function plate(
  b: Builder,
  outline: [number, number][],
  at: [number, number, number],
  x: [number, number, number],
  y: [number, number, number],
  color: string,
  name: string,
  thickness = 0.08,
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
  color: string,
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
  color: string,
  name: string,
) {
  const points: [number, number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    points.push([
      center[0] + Math.cos(a) * rx,
      center[1] + Math.sin(a) * ry,
      center[2],
    ]);
  }
  return b.sweep(polyline(points, { closed: true }), 0.018, {
    color,
    sides: 6,
    caps: "none",
    name,
  });
}

function wingPanelLine(
  b: Builder,
  side: number,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  y: number,
  color: string,
  name: string,
) {
  return rod(
    b,
    [side * x0, y, z0],
    [side * x1, y, z1],
    0.014,
    color,
    name,
  );
}

export default function build() {
  const b = createBuilder({
    name: "cyanotype-spitfire",
    detail: 1,
  });

  const fuselageStations = [
    { at: [0, 1.6, -5.2], w: 0.16, h: 0.18 },
    { at: [0, 1.61, -4.75], w: 0.3, h: 0.3 },
    { at: [0, 1.62, -4.15], w: 0.48, h: 0.45 },
    { at: [0, 1.64, -3.35], w: 0.66, h: 0.62 },
    { at: [0, 1.66, -2.2], w: 0.78, h: 0.76 },
    { at: [0, 1.67, -0.8], w: 0.84, h: 0.84 },
    { at: [0, 1.67, 0.65], w: 0.84, h: 0.86 },
    { at: [0, 1.66, 1.9], w: 0.78, h: 0.78 },
    { at: [0, 1.64, 3.05], w: 0.69, h: 0.7 },
    { at: [0, 1.6, 3.95], w: 0.57, h: 0.58 },
    { at: [0, 1.57, 4.6], w: 0.43, h: 0.45 },
    { at: [0, 1.55, 5.03], w: 0.2, h: 0.22 },
  ];

  const fuselage = b.loft(fuselageStations, {
    color: BLUEPRINT_BLUE,
    section: { ngon: 10 },
    caps: "round",
    name: "fuselage",
    group: "airframe",
  });

  const bellyKeel = b.loft(
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

  const dorsalSpine = b.sweep(
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
      caps: "round",
      name: "dorsalSpine",
      group: "airframe",
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
      BLUEPRINT_BLUE,
      side > 0 ? "wingL" : "wingR",
      0.15,
    );

    const wingRootFairing = b.sweep(
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
        caps: "round",
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
      BLUEPRINT_MID,
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

    wingPanelLine(
      b,
      side,
      1.55,
      1.55,
      0.88,
      -0.56,
      1.56,
      BLUEPRINT_LIGHT,
      side > 0 ? "wingRibL0" : "wingRibR0",
    );
    wingPanelLine(
      b,
      side,
      2.35,
      2.35,
      0.65,
      -0.63,
      1.56,
      BLUEPRINT_CYAN,
      side > 0 ? "wingRibL1" : "wingRibR1",
    );
    wingPanelLine(
      b,
      side,
      3.2,
      3.2,
      0.48,
      -0.59,
      1.56,
      BLUEPRINT_CYAN,
      side > 0 ? "wingRibL2" : "wingRibR2",
    );
    wingPanelLine(
      b,
      side,
      4.25,
      4.25,
      0.29,
      -0.49,
      1.55,
      BLUEPRINT_LIGHT,
      side > 0 ? "wingRibL3" : "wingRibR3",
    );

    rod(
      b,
      [side * 1.3, 1.55, -0.69],
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
      BLUEPRINT_BLUE,
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
      BLUEPRINT_MID,
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
    BLUEPRINT_BLUE,
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
    [0, 1.92, -4.55],
    [0, 3.82, -4.03],
    0.014,
    BLUEPRINT_LIGHT,
    "finConstructionLine",
  );

  rod(
    b,
    [0, 1.82, -4.14],
    [0, 1.82, -4.68],
    0.018,
    BLUEPRINT_INK,
    "rudderHinge",
  );

  const rudder = plate(
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

  rod(
    b,
    [0, 1.63, -4.02],
    [0, 1.63, -4.55],
    0.02,
    BLUEPRINT_LIGHT,
    "tailPost",
  );

  const canopy = b.part(
    new THREE.SphereGeometry(1, 14, 9),
    BLUEPRINT_GLASS,
    {
      at: [0, 2.15, 0.22],
      scale: [0.58, 0.56, 1.08],
      flat: true,
      name: "canopy",
      group: "cockpit",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.56),
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

  contourRing(b, [0, 1.66, -2.82], 0.67, 0.62, BLUEPRINT_CYAN, "fuselageRingRear");
  contourRing(b, [0, 1.66, 2.95], 0.69, 0.68, BLUEPRINT_LIGHT, "fuselageRingFront");
  contourRing(b, [0, 1.59, 4.0], 0.55, 0.54, BLUEPRINT_CYAN, "engineCowlingRing");

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

  const spinner = b.spike(
    [0, 1.55, 4.55],
    [0, 0, 1],
    0.92,
    0.52,
    {
      color: BLUEPRINT_MID,
      section: { ngon: 10 },
      name: "spinner",
      group: "propeller",
    },
  );

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

  const radiatorSlats = [
    [-0.45, 2.7],
    [-0.27, 2.72],
    [-0.09, 2.73],
    [0.09, 2.73],
    [0.27, 2.72],
    [0.45, 2.7],
  ];

  for (let i = 0; i < radiatorSlats.length; i++) {
    const [x, z] = radiatorSlats[i];
    rod(
      b,
      [x, 1.17, z],
      [x, 1.12, z + 0.35],
      0.018,
      i % 2 === 0 ? BLUEPRINT_CYAN : BLUEPRINT_LIGHT,
      `radiatorSlat${i}`,
    );
  }

  const bellyPanel: [number, number][] = [
    [-0.38, -0.52],
    [0.38, -0.52],
    [0.55, 0.22],
    [0.34, 0.42],
    [-0.34, 0.42],
    [-0.55, 0.22],
  ];

  plate(
    b,
    bellyPanel,
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

    rod(
      b,
      [side * 0.9, 1.68, 2.92],
      [side * 0.88, 1.68, 3.18],
      0.032,
      BLUEPRINT_INK,
      side > 0 ? "exhaustEndL" : "exhaustEndR",
    );

    rod(
      b,
      [side * 0.91, 1.66, 2.42],
      [side * 0.91, 1.66, 2.94],
      0.012,
      BLUEPRINT_LIGHT,
      side > 0 ? "exhaustMarkL" : "exhaustMarkR",
    );
  }

  const mast = b.sweep(
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

  rod(
    b,
    [0, 2.92, -1.53],
    [0, 2.13, -3.9],
    0.006,
    BLUEPRINT_CYAN,
    "radioCableShadow",
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

  for (const side of [1, -1]) {
    const flapOutline: [number, number][] = [
      [1.45, -0.68],
      [2.15, -0.68],
      [2.25, -0.57],
      [1.5, -0.54],
    ];

    plate(
      b,
      flapOutline,
      [0, 1.445, 0],
      [side, 0, 0],
      [0, 0, 1],
      BLUEPRINT_SHADE,
      side > 0 ? "flapL" : "flapR",
      0.028,
    );

    rod(
      b,
      [side * 1.48, 1.49, -0.57],
      [side * 2.2, 1.49, -0.6],
      0.011,
      BLUEPRINT_LIGHT,
      side > 0 ? "flapHingeL" : "flapHingeR",
    );
  }

  const canopyBase = [
    [-0.5, -0.7],
    [0.5, -0.7],
    [0.62, -0.32],
    [0.6, 0.45],
    [0.38, 0.82],
    [-0.38, 0.82],
    [-0.6, 0.45],
    [-0.62, -0.32],
  ] as [number, number][];

  plate(
    b,
    canopyBase,
    [0, 1.75, 0.2],
    [1, 0, 0],
    [0, 0, 1],
    BLUEPRINT_INK,
    "canopyBaseSeal",
    0.035,
  );

  rod(
    b,
    [-0.5, 1.78, -0.48],
    [0.5, 1.78, -0.48],
    0.018,
    BLUEPRINT_LIGHT,
    "canopyFrontSeal",
  );

  rod(
    b,
    [-0.48, 1.78, 0.82],
    [0.48, 1.78, 0.82],
    0.014,
    BLUEPRINT_CYAN,
    "canopyRearSeal",
  );

  const lowerFuselageBand = b.sweep(
    polyline(
      [
        [-0.8, 1.38, -0.92],
        [-0.55, 1.18, -0.92],
        [0, 1.08, -0.92],
        [0.55, 1.18, -0.92],
        [0.8, 1.38, -0.92],
        [0.7, 1.9, -0.92],
        [0.3, 2.15, -0.92],
        [0, 2.2, -0.92],
        [-0.3, 2.15, -0.92],
        [-0.7, 1.9, -0.92],
      ],
      { closed: true },
    ),
    0.018,
    {
      color: BLUEPRINT_CYAN,
      sides: 6,
      caps: "none",
      name: "fuselageServiceBand",
    },
  );

  const tailFuselageOutline: [number, number][] = [
    [-0.24, -0.12],
    [0.24, -0.12],
    [0.28, 0.12],
    [0.2, 0.2],
    [-0.2, 0.2],
    [-0.28, 0.12],
  ];

  plate(
    b,
    tailFuselageOutline,
    [0, 1.62, -4.42],
    [1, 0, 0],
    [0, 0, 1],
    BLUEPRINT_MID,
    "tailServicePlate",
    0.035,
  );

  for (let i = 0; i < 4; i++) {
    b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      BLUEPRINT_LIGHT,
      {
        at: [
          -0.18 + i * 0.12,
          1.85,
          -4.42,
        ],
        flat: true,
        name: `tailPlateRivet${i}`,
      },
    );
  }

  for (const side of [1, -1]) {
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

  for (const side of [1, -1]) {
    rod(
      b,
      [side * 0.62, 1.35, -1.75],
      [side * 0.76, 1.43, -0.9],
      0.014,
      BLUEPRINT_CYAN,
      side > 0 ? "wingRootContourL" : "wingRootContourR",
    );

    rod(
      b,
      [side * 0.74, 1.41, -1.95],
      [side * 0.84, 1.44, -0.95],
      0.009,
      BLUEPRINT_LIGHT,
      side > 0 ? "wingRootFineLineL" : "wingRootFineLineR",
    );
  }

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
    const x = -0.15 + i * 0.075;
    b.part(
      new THREE.CylinderGeometry(0.022, 0.022, 0.018, 8),
      i % 2 === 0 ? BLUEPRINT_CYAN : BLUEPRINT_INK,
      {
        at: [x, 2.59, -0.42],
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

  const blueprintTailStrake = b.sweep(
    catmull([
      [0, 1.74, -4.82],
      [0, 1.86, -4.2],
      [0, 2.02, -3.62],
    ]),
    [0.06, 0.025],
    {
      color: BLUEPRINT_LIGHT,
      section: { ngon: 6 },
      caps: "point",
      name: "tailDorsalStrake",
    },
  );

  const tipStrakeL = plate(
    b,
    [
      [0, 0],
      [0.65, 0.03],
      [0.96, 0.12],
      [0.65, 0.19],
      [0, 0.18],
    ],
    [0, 1.48, 4.2],
    [1, 0, 0],
    [0, 0, 1],
    BLUEPRINT_LIGHT,
    "noseWingFilletL",
    0.025,
  );

  const tipStrakeR = plate(
    b,
    [
      [0, 0],
      [0.65, 0.03],
      [0.96, 0.12],
      [0.65, 0.19],
      [0, 0.18],
    ],
    [0, 1.48, 4.2],
    [-1, 0, 0],
    [0, 0, 1],
    BLUEPRINT_LIGHT,
    "noseWingFilletR",
    0.025,
  );

  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.12, 0.08, 0.52),
      BLUEPRINT_CYAN,
      {
        at: [side * 0.52, 1.35, 3.5],
        rotation: [0, side * 8, 0],
        flat: true,
        name: side > 0 ? "engineSidePanelL" : "engineSidePanelR",
      },
    );
  }

  for (const z of [-2.2, -1.3, 1.55, 2.35]) {
    rod(
      b,
      [-0.79, 1.66, z],
      [0.79, 1.66, z],
      0.009,
      BLUEPRINT_LIGHT,
      `fuselageStationLine${z.toString().replace(".", "_")}`,
    );
  }

  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.18, 0.04, 0.64),
      BLUEPRINT_PALE,
      {
        at: [side * 0.88, 1.54, 3.68],
        rotation: [0, side * 0.1, 0],
        flat: true,
        name: side > 0 ? "enginePanelLatchL" : "enginePanelLatchR",
      },
    );
  }

  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.052, 7, 5),
      BLUEPRINT_LIGHT,
      {
        at: [side * 0.88, 1.3, 3.08],
        flat: true,
        name: side > 0 ? "engineLowerLampL" : "engineLowerLampR",
      },
    );
  }

  const leftRootLine = b.sweep(
    catmull([
      [0.32, 1.55, 1.0],
      [0.78, 1.53, 0.72],
      [1.22, 1.5, 0.3],
      [1.62, 1.48, -0.16],
    ]),
    0.015,
    {
      color: BLUEPRINT_LIGHT,
      section: { ngon: 6 },
      caps: "round",
      name: "leftWingRootBlueprint",
    },
  );

  const rightRootLine = b.sweep(
    catmull([
      [-0.32, 1.55, 1.0],
      [-0.78, 1.53, 0.72],
      [-1.22, 1.5, 0.3],
      [-1.62, 1.48, -0.16],
    ]),
    0.015,
    {
      color: BLUEPRINT_LIGHT,
      section: { ngon: 6 },
      caps: "round",
      name: "rightWingRootBlueprint",
    },
  );

  for (const side of [1, -1]) {
    const fairing = plate(
      b,
      [
        [0, -0.06],
        [0.45, -0.04],
        [0.68, 0.08],
        [0.45, 0.17],
        [0, 0.19],
      ],
      [0, 1.49, 0.8],
      [side, 0, 0],
      [0, 0, 1],
      BLUEPRINT_MID,
      side > 0 ? "frontWingRootFairingL" : "frontWingRootFairingR",
      0.06,
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
      new THREE.BoxGeometry(0.22, 0.04, 0.38),
      BLUEPRINT_LIGHT,
      {
        at: [side * 0.84, 1.49, -1.75],
        rotation: [0, side * 0.08, 0],
        flat: true,
        name: side > 0 ? "fuselageSideAccessL" : "fuselageSideAccessR",
      },
    );
  }

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.cos(a) * 0.72;
    const y = 1.67 + Math.sin(a) * 0.72;
    b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      BLUEPRINT_PALE,
      {
        at: [x, y, 2.95],
        flat: true,
        name: `cowlingRivet${i}`,
      },
    );
  }

  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.38, 0.035, 0.08),
      BLUEPRINT_INK,
      {
        at: [side * 0.98, 1.52, 1.7],
        rotation: [0, side * 0.18, 0],
        flat: true,
        name: side > 0 ? "wingRootHatchL" : "wingRootHatchR",
      },
    );

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
  }

  for (const side of [1, -1]) {
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
    const x = -0.32 + i * 0.16;
    b.part(
      new THREE.SphereGeometry(0.016, 6, 4),
      BLUEPRINT_PALE,
      {
        at: [x, 1.87, -3.92],
        flat: true,
        name: `tailplaneRivet${i}`,
      },
    );
  }

  for (const side of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.04, 0.04, 0.07, 8),
      BLUEPRINT_INK,
      {
        at: [side * 2.84, 1.48, 0.02],
        dir: [1, 0, 0],
        flat: true,
        name: side > 0 ? "wingTipEndL" : "wingTipEndR",
      },
    );
  }

  for (const add of STAGE2) add(b);

  return b.root;
}
