import * as THREE from "three";
import { type Builder, createBuilder, catmull, paint, svg, frame } from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description:
    "A stylized low-poly Spitfire fighter plane in cyanotype blueprint colours, with a strong elliptical wing, tapered fuselage, cockpit canopy, propeller, tailplane and landing gear.",
};

export const REQUESTS = [
  {
    id: "propellerHub",
    kind: "add",
    part: "engineCowling",
    what: "Blueprint annotation-style propeller hub cap and four broad wooden-looking propeller blades in PALE_CYAN, with DARK_CYAN root collars and tiny cyan fasteners.",
    at: [0, 1.45, 4.72],
    normal: [0, 0, 1],
    bone: null,
    room: [0.8, 0.8, 0.25],
  },
  {
    id: "wingRoundels",
    kind: "add",
    part: "leftWing",
    what: "Large RAF-style cyanotype roundel on the upper surface: concentric circles in PALE_CYAN, MID_CYAN and DARK_CYAN, kept flat and clean inside the wing.",
    at: [2.8, 1.54, 0.25],
    normal: [0, 1, 0],
    bone: null,
    room: [1.25, 0.03, 1.25],
  },
  {
    id: "wingRoundelRight",
    kind: "add",
    part: "rightWing",
    what: "Matching RAF-style cyanotype roundel on the right upper wing, with three crisp concentric rings and a small central dot.",
    at: [-2.8, 1.54, 0.25],
    normal: [0, 1, 0],
    bone: null,
    room: [1.25, 0.03, 1.25],
  },
  {
    id: "fuselageCode",
    kind: "add",
    part: "fuselage",
    what: "A bold vintage fuselage identification code, 'C-17', in pale blueprint lettering on the side behind the cockpit, with a thin DARK_CYAN rectangular backing plate.",
    at: [0.63, 1.62, -0.6],
    normal: [1, 0, 0],
    bone: null,
    room: [0.08, 0.42, 1.05],
  },
  {
    id: "cockpitFrame",
    kind: "add",
    part: "canopy",
    what: "Raised canopy framing: three slim cyan rails over the dark blue canopy, one longitudinal spine and two transverse hoops, all following the canopy curve.",
    at: [0, 2.18, 0.35],
    normal: [0, 1, 0],
    bone: null,
    room: [1.18, 0.3, 1.55],
  },
  {
    id: "antenna",
    kind: "add",
    part: "fuselage",
    what: "Small dorsal radio antenna behind the canopy: a tapered DARK_CYAN mast with a short forward-leaning cyan aerial wire and a tiny spherical tip.",
    at: [0, 2.05, -0.95],
    normal: [0, 1, 0],
    bone: null,
    room: [0.12, 0.55, 0.5],
  },
  {
    id: "exhaustStacks",
    kind: "add",
    part: "leftNose",
    what: "Six short rectangular exhaust stacks on the left side of the engine cowling, alternating MID_CYAN and DARK_CYAN, aimed slightly forward.",
    at: [0.58, 1.52, 3.45],
    normal: [1, 0, 0],
    bone: null,
    room: [0.25, 0.55, 1.25],
  },
  {
    id: "tailMarking",
    kind: "add",
    part: "tailFin",
    what: "Cyanotype checker stripe near the top of the vertical tail, made from six small alternating PALE_CYAN and DARK_CYAN rectangular tiles.",
    at: [0, 3.0, -3.55],
    normal: [0, 0, 1],
    bone: null,
    room: [0.9, 0.42, 0.05],
  },
  {
    id: "landingLights",
    kind: "add",
    part: "leftWing",
    what: "Two inset landing-light bezels in the wing leading edges, pale cyan discs with DARK_CYAN rims, one on each wing near the roots.",
    at: [1.08, 1.45, 1.3],
    normal: [0, 0, 1],
    bone: null,
    room: [0.35, 0.22, 0.12],
  },
  {
    id: "wingBlueprintLines",
    kind: "texture",
    part: "leftWing",
    what: "Add fine cyanotype blueprint panel lines, spar seams and subtle construction station marks across both main wings; preserve the clean roundel area.",
  },
  {
    id: "fuselageBlueprintLines",
    kind: "texture",
    part: "fuselage",
    what: "Paint thin pale cyan longitudinal blueprint guide lines, access-panel seams and evenly spaced rivet rows over the fuselage, leaving the code area uncluttered.",
  },
  {
    id: "tailBlueprintLines",
    kind: "texture",
    part: "tailFin",
    what: "Add sparse cyanotype contour lines and hinge seams to the tail fin and rudder, with a darker shaded rudder edge.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const DARK_CYAN = "#063b58";
const DEEP_BLUE = "#062b45";
const MID_CYAN = "#087ca5";
const CYAN = "#20b7d1";
const PALE_CYAN = "#9ce9ed";
const BLUE_WHITE = "#d7fbfa";
const GLASS_BLUE = "#0b5878";
const INK_BLUE = "#021b31";
const WHEEL = "#041d2d";
const METAL = "#4da9ba";

const WING_BLUEPRINT = paint((p, n) => {
  const side = p.x >= 0 ? 1 : -1;
  const ax = Math.abs(p.x);

  // Keep the requested roundel zones optically clean for the later decal pass.
  const roundelX = side * 2.8;
  const roundelDist = Math.hypot(p.x - roundelX, p.z - 0.25);
  if (roundelDist < 0.73 && n.y > 0.35) return MID_CYAN;

  const spar = Math.abs(p.z - 0.82) < 0.018 || Math.abs(p.z - 0.08) < 0.014;
  const station = Math.abs((ax - 0.7) % 0.62) < 0.012;
  const rib = Math.abs(p.z - (0.95 - ax * 0.23)) < 0.014;
  const edge = n.y < -0.35 && Math.abs(p.z + 0.55) < 0.055;

  if (edge) return DARK_CYAN;
  if (spar || station || rib) return PALE_CYAN;

  // Small evenly spaced rivet ticks along the front spar.
  const rivetRun = Math.abs(p.z - 0.82) < 0.055;
  const rivet = rivetRun && Math.abs(Math.sin(p.x * 42)) > 0.94;
  return rivet ? BLUE_WHITE : MID_CYAN;
});

const FUSELAGE_BLUEPRINT = paint((p, n) => {
  const side = Math.abs(n.x) > 0.42;
  const codeKeepOut = Math.abs(p.x) > 0.48 && Math.abs(p.x) < 0.8 && p.z > -1.18 && p.z < -0.05;
  if (codeKeepOut) return MID_CYAN;

  const longitudinal = side && Math.abs(p.y - 1.72) < 0.018;
  const lowerGuide = side && Math.abs(p.y - 1.29) < 0.014;
  const panelSeam = side && (
    Math.abs(p.z + 2.05) < 0.018 ||
    Math.abs(p.z - 1.05) < 0.016 ||
    Math.abs(p.z - 2.62) < 0.014
  );
  const rivetRow = side && Math.abs(p.y - 1.53) < 0.045;
  const rivet = rivetRow && Math.abs(Math.sin((p.z + 4.4) * 31)) > 0.9;

  if (panelSeam) return PALE_CYAN;
  if (longitudinal || lowerGuide) return BLUE_WHITE;
  if (rivet) return PALE_CYAN;

  // A restrained darker underside keeps the blueprint read dimensional.
  return n.y < -0.55 ? DARK_CYAN : MID_CYAN;
});

const TAIL_BLUEPRINT = paint((p, n) => {
  const contour =
    Math.abs(p.y - 2.1) < 0.018 ||
    Math.abs(p.y - 2.72) < 0.016 ||
    Math.abs(p.z + 3.82) < 0.018;
  const hinge = Math.abs(p.y - 1.92) < 0.022;
  const rudderEdge = Math.abs(p.z + 3.36) < 0.075;

  if (rudderEdge) return DARK_CYAN;
  if (hinge) return DARK_CYAN;
  if (contour) return PALE_CYAN;
  return n.z > 0.35 ? MID_CYAN : DARK_CYAN;
});

function box(
  b: Builder,
  size: [number, number, number],
  color: string,
  at: [number, number, number],
  name: string,
  dir?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    dir,
    name,
  });
}

function cylinder(
  b: Builder,
  radius: number,
  length: number,
  color: string,
  at: [number, number, number],
  dir: [number, number, number],
  name: string,
  segments = 10,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, length, segments), color, {
    at,
    dir,
    name,
  });
}

function addWheel(b: Builder, x: number, z: number, name: string) {
  cylinder(b, 0.29, 0.14, WHEEL, [x, 0.29, z], [1, 0, 0], `${name}Tire`, 12);
  cylinder(b, 0.12, 0.152, MID_CYAN, [x, 0.29, z], [1, 0, 0], `${name}Hub`, 10);
  cylinder(b, 0.045, 0.17, PALE_CYAN, [x, 0.29, z], [1, 0, 0], `${name}Axle`, 8);
}

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  // Main fuselage: a deliberately chunky, faceted elliptical fighter body.
  const fuselagePath = catmull([
    [0, 1.46, -4.45],
    [0, 1.47, -3.55],
    [0, 1.52, -2.35],
    [0, 1.57, -0.9],
    [0, 1.58, 0.85],
    [0, 1.54, 2.25],
    [0, 1.5, 3.55],
    [0, 1.47, 4.35],
    [0, 1.46, 4.62],
  ]);
  const fuselage = b.sweep(
    fuselagePath,
    (t) => {
      if (t < 0.12) return 0.22 + t * 2.4;
      if (t < 0.3) return 0.5 + (t - 0.12) * 0.75;
      if (t < 0.72) return 0.64;
      if (t < 0.91) return 0.64 - (t - 0.72) * 1.5;
      return 0.35 - (t - 0.91) * 1.8;
    },
    {
      color: FUSELAGE_BLUEPRINT,
      sides: 10,
      section: "circle",
      caps: "round",
      name: "fuselage",
    },
  );

  // Darker belly keel gives the aircraft a strong readable blueprint silhouette.
  b.sweep(
    catmull([
      [0, 1.12, -3.2],
      [0, 1.08, -1.4],
      [0, 1.03, 0.4],
      [0, 1.07, 2.2],
      [0, 1.18, 3.55],
    ]),
    [0.24, 0.3],
    {
      color: DARK_CYAN,
      sides: 8,
      caps: "round",
      name: "fuselageBelly",
    },
  );

  // Nose ring and engine cowling.
  cylinder(b, 0.68, 0.18, DARK_CYAN, [0, 1.48, 3.82], [0, 0, 1], "engineCowling", 12);
  cylinder(b, 0.59, 0.16, DEEP_BLUE, [0, 1.48, 4.02], [0, 0, 1], "engineIntake", 12);
  cylinder(b, 0.38, 0.11, INK_BLUE, [0, 1.48, 4.13], [0, 0, 1], "engineCore", 10);
  cylinder(b, 0.74, 0.08, PALE_CYAN, [0, 1.48, 3.72], [0, 0, 1], "cowlingRing", 12);

  // Main elliptical wings, mirrored about the fuselage.
  const wingOutline: [number, number][] = [
    [0.12, 1.7],
    [1.15, 1.42],
    [2.5, 0.95],
    [4.15, 0.25],
    [5.25, -0.38],
    [5.38, -0.67],
    [4.63, -0.82],
    [3.28, -0.45],
    [1.55, 0.02],
    [0.2, 0.35],
  ];
  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [0, 1.38, 0],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.13, 0.09],
      bevel: 0.025,
      smoothing: 1,
      color: WING_BLUEPRINT,
      name: s > 0 ? "leftWing" : "rightWing",
    });

    // Leading-edge highlight and darker trailing edge.
    b.sweep(
      catmull([
        [s * 0.35, 1.49, 1.65],
        [s * 1.7, 1.48, 1.15],
        [s * 3.4, 1.43, 0.25],
        [s * 5.05, 1.37, -0.47],
      ]),
      [0.09, 0.045],
      {
        color: PALE_CYAN,
        section: "box",
        caps: "flat",
        name: s > 0 ? "leftWingLeadingEdge" : "rightWingLeadingEdge",
      },
    );
    b.sweep(
      catmull([
        [s * 0.35, 1.39, 0.28],
        [s * 1.8, 1.35, -0.14],
        [s * 3.6, 1.3, -0.55],
        [s * 4.92, 1.3, -0.73],
      ]),
      0.045,
      {
        color: DARK_CYAN,
        sides: 6,
        caps: "flat",
        name: s > 0 ? "leftWingTrailingEdge" : "rightWingTrailingEdge",
      },
    );
  }

  // Aileron blocks, kept plain for later detail.
  for (const s of [1, -1]) {
    box(b, [1.55, 0.065, 0.34], DARK_CYAN, [s * 3.45, 1.43, -0.48], s > 0 ? "leftAileron" : "rightAileron");
    box(b, [1.05, 0.06, 0.22], PALE_CYAN, [s * 4.25, 1.42, -0.6], s > 0 ? "leftAileronTip" : "rightAileronTip");
  }

  // Horizontal tailplanes.
  const tailplane: [number, number][] = [
    [0.08, 0.42],
    [0.92, 0.26],
    [2.02, -0.15],
    [2.27, -0.34],
    [1.72, -0.43],
    [0.72, -0.18],
    [0.08, -0.03],
  ];
  for (const s of [1, -1]) {
    b.extrude(tailplane, {
      at: [0, 1.73, -3.35],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.095,
      bevel: 0.018,
      smoothing: 1,
      color: MID_CYAN,
      name: s > 0 ? "leftTailplane" : "rightTailplane",
    });
    box(
      b,
      [1.05, 0.055, 0.18],
      DARK_CYAN,
      [s * 1.42, 1.78, -3.48],
      s > 0 ? "leftElevator" : "rightElevator",
    );
  }

  // Vertical fin and rudder.
  b.extrude(
    [
      [0, 0],
      [0, 1.58],
      [-0.42, 2.55],
      [-0.2, 3.25],
      [0.18, 3.42],
      [0.38, 2.2],
      [0.45, 0],
    ],
    {
      at: [0, 1.52, -3.58],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.02,
      smoothing: 1,
      color: TAIL_BLUEPRINT,
      name: "tailFin",
    },
  );
  box(b, [0.1, 0.95, 0.08], DARK_CYAN, [0, 2.25, -3.55], "rudder");
  box(b, [0.12, 0.3, 0.1], PALE_CYAN, [0, 3.0, -3.55], "tailCap");

  // Cockpit sill and faceted canopy.
  box(b, [1.14, 0.12, 1.5], DARK_CYAN, [0, 1.92, 0.2], "cockpitSill");
  const canopy = b.part(new THREE.SphereGeometry(1, 12, 8), GLASS_BLUE, {
    at: [0, 2.08, 0.35],
    scale: [0.56, 0.34, 0.98],
    name: "canopy",
  });
  // Rear canopy fairing.
  b.part(new THREE.SphereGeometry(1, 10, 6), MID_CYAN, {
    at: [0, 1.93, -0.62],
    scale: [0.59, 0.23, 0.65],
    name: "canopyFairing",
  });
  box(b, [0.14, 0.15, 1.3], PALE_CYAN, [0, 2.39, 0.26], "canopyTopRail");
  for (const z of [-0.18, 0.58]) {
    box(b, [1.0, 0.1, 0.09], CYAN, [0, 2.18, z], "canopyHoop");
  }

  // Engine side cheek panels and cheek cooling slots.
  for (const s of [1, -1]) {
    box(b, [0.1, 0.62, 1.08], DARK_CYAN, [s * 0.57, 1.53, 2.8], s > 0 ? "leftNose" : "rightNose");
    for (let i = 0; i < 5; i++) {
      box(
        b,
        [0.035, 0.035, 0.34],
        PALE_CYAN,
        [s * 0.64, 1.3 + i * 0.1, 3.0],
        `${s > 0 ? "left" : "right"}CoolingSlot${i}`,
      );
    }
  }

  // Landing gear struts and wheels.
  for (const s of [1, -1]) {
    b.rod([s * 0.72, 1.16, 0.45], [s * 1.05, 0.48, 0.42], 0.075, {
      color: DARK_CYAN,
      name: s > 0 ? "leftGearStrut" : "rightGearStrut",
    });
    b.rod([s * 1.05, 0.46, 0.42], [s * 1.12, 0.31, 0.38], 0.045, {
      color: METAL,
      name: s > 0 ? "leftGearFork" : "rightGearFork",
    });
    addWheel(b, s * 1.16, 0.3, s > 0 ? "leftWheel" : "rightWheel");
  }
  b.rod([0, 1.05, 3.2], [0, 0.42, 3.35], 0.055, { color: DARK_CYAN, name: "noseGearStrut" });
  addWheel(b, 0, 0.26, "noseWheel");

  // Propeller blades in the vertical XY plane, just ahead of the nose.
  const propOutline: [number, number][] = [
    [0.02, 0],
    [0.16, 0.08],
    [0.23, 0.62],
    [0.13, 1.02],
    [0.03, 0.78],
    [-0.03, 0.2],
  ];
  for (const rot of [0, 90, 180, 270]) {
    const blade = b.extrude(propOutline, {
      at: [0, 1.48, 4.6],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      color: PALE_CYAN,
      name: `propellerBlade${rot}`,
    });
    blade.rotation.z = THREE.MathUtils.degToRad(rot);
  }
  cylinder(b, 0.19, 0.23, DARK_CYAN, [0, 1.48, 4.72], [0, 0, 1], "propellerHub", 10);
  cylinder(b, 0.08, 0.27, PALE_CYAN, [0, 1.48, 4.83], [0, 0, 1], "propellerSpinner", 10);

  // A few broad blueprint-only plates establish the construction language without consuming detail space.
  box(b, [0.9, 0.025, 0.5], PALE_CYAN, [0.0, 2.0, -1.9], "dorsalPanel");
  box(b, [0.65, 0.03, 0.28], DARK_CYAN, [0.0, 1.15, -2.0], "bellyPanel");
  for (const s of [1, -1]) {
    box(b, [0.72, 0.028, 0.3], PALE_CYAN, [s * 0.4, 1.84, -1.45], `${s > 0 ? "left" : "right"}AccessPanel`);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addPropellerHub(b: Builder) {
  const center: [number, number, number] = [0, 1.48, 4.76];

  // A faceted spinner, with a stepped blueprint washer behind it.
  b.part(new THREE.ConeGeometry(0.235, 0.34, 10), PALE_CYAN, {
    at: [0, 1.48, 4.88],
    dir: [0, 0, 1],
    name: "s21SpinnerCap",
  });
  b.part(new THREE.CylinderGeometry(0.245, 0.245, 0.045, 12), DARK_CYAN, {
    at: [0, 1.48, 4.72],
    dir: [0, 0, 1],
    name: "s21HubWasher",
  });
  b.part(new THREE.CylinderGeometry(0.205, 0.205, 0.055, 12), MID_CYAN, {
    at: [0, 1.48, 4.80],
    dir: [0, 0, 1],
    name: "s21HubFace",
  });

  // A pale blueprint medallion gives the spinner an annotated, instrument-like face.
  const hubMark = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="57" fill="#9ce9ed" stroke="#063b58" stroke-width="6"/>
      <circle cx="64" cy="64" r="42" fill="none" stroke="#087ca5" stroke-width="4"/>
      <circle cx="64" cy="64" r="24" fill="none" stroke="#063b58" stroke-width="3"/>
      <path d="M64 8v18M64 102v18M8 64h18M102 64h18" stroke="#063b58" stroke-width="3"/>
      <path d="M64 34v60M34 64h60" stroke="#20b7d1" stroke-width="2"/>
      <circle cx="64" cy="64" r="8" fill="#063b58"/>
      <path d="M64 18l4 11-4 8-4-8zM110 64l-11 4-8-4 8-4zM64 110l-4-11 4-8 4 8zM18 64l11-4 8 4-8 4z"
        fill="#087ca5"/>
    </svg>`,
    { size: 192 },
  );
  b.part(new THREE.CircleGeometry(0.188, 20), BLUE_WHITE, {
    at: [0, 1.48, 4.835],
    dir: [0, 0, 1],
    axis: "z",
    texture: hubMark,
    name: "s21HubBlueprintMark",
  });

  // Four broad, tapered cyanotype propeller blades, each with a darker root collar.
  const bladeOutline: [number, number][] = [
    [-0.045, 0.055],
    [0.09, 0.12],
    [0.205, 0.35],
    [0.17, 0.58],
    [0.075, 0.68],
    [-0.07, 0.48],
    [-0.12, 0.2],
  ];

  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const x: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
    const y: [number, number, number] = [-Math.sin(a), Math.cos(a), 0];

    b.extrude(bladeOutline, {
      at: center,
      x,
      y,
      thickness: [0.042, 0.026],
      bevel: 0.012,
      smoothing: 1,
      color: PALE_CYAN,
      name: `s21PropellerBlade${i}`,
    });

    const rootX = 0.115 * Math.cos(a);
    const rootY = 0.115 * Math.sin(a);
    b.part(new THREE.CylinderGeometry(0.092, 0.092, 0.07, 8), DARK_CYAN, {
      at: [rootX, 1.48 + rootY, 4.77],
      dir: [0, 0, 1],
      name: `s21BladeCollar${i}`,
    });

    // Two narrow inlaid grain / construction lines on every blade.
    for (const lateral of [-0.038, 0.038]) {
      const p0: [number, number, number] = [
        (lateral * Math.cos(a)) + 0.13 * Math.sin(a),
        1.48 + lateral * Math.sin(a) - 0.13 * Math.cos(a),
        4.816,
      ];
      const p1: [number, number, number] = [
        (lateral * Math.cos(a)) + 0.5 * Math.sin(a),
        1.48 + lateral * Math.sin(a) - 0.5 * Math.cos(a),
        4.816,
      ];
      b.rod(p0, p1, 0.009, {
        color: MID_CYAN,
        name: `s21BladeGrain${i}`,
      });
    }
  }

  // Tiny pale fasteners around the face, deliberately oversized enough to read at inspection scale.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const r = 0.155;
    b.part(new THREE.SphereGeometry(0.019, 7, 5), PALE_CYAN, {
      at: [r * Math.cos(a), 1.48 + r * Math.sin(a), 4.872],
      name: `s21HubFastener${i}`,
    });
  }

  // Four short radial seam marks reinforce the technical drawing language.
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    b.rod(
      [0.255 * Math.cos(a), 1.48 + 0.255 * Math.sin(a), 4.826],
      [0.315 * Math.cos(a), 1.48 + 0.315 * Math.sin(a), 4.826],
      0.008,
      { color: DARK_CYAN, name: `s21HubRadialMark${i}` },
    );
  }
}
    return addPropellerHub;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addWingRoundels(b: Builder) {
  const roundel = (x: number, label: string) => {
    const z = 0.25;
    const baseY = 1.515;

    // Broad layered discs create a crisp cyanotype RAF-style target.
    b.part(new THREE.CylinderGeometry(0.53, 0.53, 0.012, 32), PALE_CYAN, {
      at: [x, baseY, z],
      name: `s22_${label}_outerRoundel`,
    });

    b.part(new THREE.CylinderGeometry(0.405, 0.405, 0.014, 32), MID_CYAN, {
      at: [x, baseY + 0.009, z],
      name: `s22_${label}_middleRoundel`,
    });

    b.part(new THREE.CylinderGeometry(0.255, 0.255, 0.016, 32), DARK_CYAN, {
      at: [x, baseY + 0.019, z],
      name: `s22_${label}_innerRoundel`,
    });

    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.018, 24), PALE_CYAN, {
      at: [x, baseY + 0.03, z],
      name: `s22_${label}_centralDot`,
    });

    // A narrow dark registration line gives the painted emblem a printed blueprint edge.
    b.part(new THREE.TorusGeometry(0.522, 0.012, 6, 32), DARK_CYAN, {
      at: [x, baseY + 0.008, z],
      rotation: [90, 0, 0],
      name: `s22_${label}_outerInkRing`,
    });

    // Small fasteners echo the aircraft's riveted construction without cluttering the emblem.
    const rivetRadius = 0.012;
    const rivetDistance = 0.485;
    const rivetAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    for (let i = 0; i < rivetAngles.length; i++) {
      const a = (rivetAngles[i] * Math.PI) / 180;
      b.part(new THREE.SphereGeometry(rivetRadius, 6, 4), DARK_CYAN, {
        at: [
          x + Math.sin(a) * rivetDistance,
          baseY + 0.026,
          z + Math.cos(a) * rivetDistance,
        ],
        name: `s22_${label}_rivet${i}`,
      });
    }

    // Four tiny pale alignment ticks make the mark read as a drafted stencil.
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const cx = x + Math.sin(a) * 0.565;
      const cz = z + Math.cos(a) * 0.565;
      b.part(new THREE.BoxGeometry(0.018, 0.008, 0.075), PALE_CYAN, {
        at: [cx, baseY + 0.018, cz],
        rotation: [0, (i * 90) as number, 0],
        name: `s22_${label}_draftTick${i}`,
      });
    }
  };

  roundel(2.8, "left");
  roundel(-2.8, "right");
}
    return addWingRoundels;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addFuselageCode(b: Builder) {
  const plateX = 0.655;
  const faceX = 0.681;
  const y0 = 1.62;
  const z0 = -0.6;

  // Thin raised identification plate, aligned to the aircraft's curved side.
  b.part(new THREE.BoxGeometry(0.045, 0.38, 0.94), DARK_CYAN, {
    at: [plateX, y0, z0],
    name: "fuselageCodeBacking",
  });

  // The lettering is intentionally oversized and slightly distressed like a painted
  // workshop stencil, while the surrounding construction marks retain the blueprint feel.
  const codeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100">
      <rect x="3" y="3" width="234" height="94" rx="5"
        fill="none" stroke="#9ce9ed" stroke-width="3"/>
      <path d="M14 18 H226 M14 82 H226" stroke="#20b7d1" stroke-width="1.5"
        stroke-dasharray="7 5"/>
      <text x="120" y="70" text-anchor="middle"
        font-family="DejaVu Sans, Arial, sans-serif"
        font-size="57" font-weight="900"
        letter-spacing="5" fill="#d7fbfa" stroke="#063b58"
        stroke-width="1.5" paint-order="stroke">C-17</text>
      <circle cx="18" cy="50" r="4" fill="#20b7d1"/>
      <circle cx="222" cy="50" r="4" fill="#20b7d1"/>
      <path d="M28 12 V22 M212 12 V22 M28 78 V88 M212 78 V88"
        stroke="#9ce9ed" stroke-width="2"/>
    </svg>`,
    { size: 512 },
  );

  b.part(new THREE.PlaneGeometry(0.86, 0.30), BLUE_WHITE, {
    at: [faceX, y0, z0],
    dir: [1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture: codeTexture,
    name: "fuselageCodeStencil",
  });

  // Raised cyan perimeter rails make the marking readable against the faceted fuselage.
  const x = faceX + 0.006;
  const top = y0 + 0.185;
  const bottom = y0 - 0.185;
  const left = z0 - 0.47;
  const right = z0 + 0.47;
  const rail = 0.012;

  b.rod([x, top, left], [x, top, right], rail, {
    color: PALE_CYAN,
    caps: "flat",
    name: "codeRailTop",
  });
  b.rod([x, bottom, left], [x, bottom, right], rail, {
    color: PALE_CYAN,
    caps: "flat",
    name: "codeRailBottom",
  });
  b.rod([x, bottom, left], [x, top, left], rail, {
    color: PALE_CYAN,
    caps: "flat",
    name: "codeRailFront",
  });
  b.rod([x, bottom, right], [x, top, right], rail, {
    color: PALE_CYAN,
    caps: "flat",
    name: "codeRailRear",
  });

  // Small fasteners at the four corners and midway along the long edges.
  for (const [yy, zz, i] of [
    [top, left, 0],
    [top, z0, 1],
    [top, right, 2],
    [bottom, left, 3],
    [bottom, z0, 4],
    [bottom, right, 5],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.018, 8), CYAN, {
      at: [x + 0.012, yy, zz],
      dir: [1, 0, 0],
      name: `codeRivet${i}`,
    });
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.021, 6), DARK_CYAN, {
      at: [x + 0.023, yy, zz],
      dir: [1, 0, 0],
      name: `codeRivetInset${i}`,
    });
  }

  // A tiny stencil registration mark below the plate, like a draughtsman's datum.
  b.rod(
    [x + 0.01, y0 - 0.225, z0 - 0.16],
    [x + 0.01, y0 - 0.225, z0 + 0.16],
    0.006,
    { color: CYAN, caps: "flat", name: "codeDatum" },
  );
}
    return addFuselageCode;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addCockpitFrame(b: Builder) {
  const RAIL = CYAN;
  const RAIL_HIGHLIGHT = PALE_CYAN;
  const RAIL_SHADOW = DARK_CYAN;

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
      sides: 8,
      name,
      group: "stage2.cockpit",
    });

  const rivet = (p: [number, number, number], name: string, r = 0.025) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), RAIL_HIGHLIGHT, {
      at: p,
      name,
      group: "stage2.cockpit",
    });

  // The canopy is an ellipsoid centred near (0, 2.08, 0.35), with
  // half-width .56, half-height .34 and half-length .98. These points
  // sit just above its curved shell, making the framing visibly seated.
  const canopyTop = (z: number, x = 0, lift = 0.018): [number, number, number] => {
    const dz = (z - 0.35) / 0.98;
    const dx = x / 0.56;
    const cap = Math.max(0, 1 - dz * dz - dx * dx);
    return [x, 2.08 + 0.34 * Math.sqrt(cap) + lift, z];
  };

  // Dark-blue raised foot pads make the rails read as attached hardware
  // instead of floating lines.
  const spineStart = canopyTop(-0.54, 0, 0.012);
  const spineEnd = canopyTop(1.18, 0, 0.012);
  const spineFoot = [0, 2.395, -0.54] as [number, number, number];
  const spineFootBack = [0, 2.385, 1.18] as [number, number, number];

  b.part(new THREE.BoxGeometry(0.1, 0.035, 0.16), RAIL_SHADOW, {
    at: spineFoot,
    name: "canopySpineFrontFoot",
    group: "stage2.cockpit",
  });
  b.part(new THREE.BoxGeometry(0.1, 0.035, 0.16), RAIL_SHADOW, {
    at: spineFootBack,
    name: "canopySpineRearFoot",
    group: "stage2.cockpit",
  });

  // Longitudinal canopy spine, with a pale highlight down its crown.
  rod(spineStart, spineEnd, 0.032, RAIL_SHADOW, "canopySpineShadow");
  rod(
    [0, spineStart[1] + 0.018, spineStart[2] + 0.015],
    [0, spineEnd[1] + 0.018, spineEnd[2] + 0.015],
    0.015,
    RAIL_HIGHLIGHT,
    "canopySpineHighlight",
  );

  // Two transverse hoops. Each is made from three rods so the top follows
  // the canopy's faceted arch rather than forming a flat bar.
  const hoop = (z: number, label: string) => {
    const left = canopyTop(z, 0.48, 0.018);
    const crown = canopyTop(z, 0, 0.045);
    const right = canopyTop(z, -0.48, 0.018);

    rod(left, crown, 0.029, RAIL_SHADOW, `${label}Left`);
    rod(crown, right, 0.029, RAIL_SHADOW, `${label}Right`);

    const leftHi: [number, number, number] = [
      left[0] * 0.93,
      left[1] + 0.018,
      left[2] + 0.012,
    ];
    const rightHi: [number, number, number] = [
      right[0] * 0.93,
      right[1] + 0.018,
      right[2] + 0.012,
    ];
    rod(leftHi, [0, crown[1] + 0.026, crown[2] + 0.012], 0.012, RAIL_HIGHLIGHT, `${label}HighlightL`);
    rod([0, crown[1] + 0.026, crown[2] + 0.012], rightHi, 0.012, RAIL_HIGHLIGHT, `${label}HighlightR`);

    // Small bright rivets at the hoop feet and crown.
    rivet([left[0], left[1] + 0.026, left[2]], `${label}RivetL`, 0.022);
    rivet([right[0], right[1] + 0.026, right[2]], `${label}RivetR`, 0.022);
    rivet([0, crown[1] + 0.05, crown[2]], `${label}RivetC`, 0.019);
  };

  hoop(0.0, "canopyFrontHoop");
  hoop(0.72, "canopyRearHoop");

  // Tiny low-profile canopy latch on the starboard side, a useful blueprint
  // hardware cue that remains inside the cleared canopy room.
  b.part(new THREE.BoxGeometry(0.06, 0.055, 0.13), RAIL_SHADOW, {
    at: [-0.515, 2.13, -0.12],
    name: "canopyLatch",
    group: "stage2.cockpit",
  });
  rivet([-0.55, 2.16, -0.12], "canopyLatchPin", 0.018);

  // ---- Dorsal radio antenna ------------------------------------------------

  const antennaBase: [number, number, number] = [0, 2.035, -0.95];
  const antennaTop: [number, number, number] = [0, 2.445, -1.015];

  // A thin elliptical mounting plate follows the fuselage roof.
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 10), RAIL_SHADOW, {
    at: [0, 2.04, -0.95],
    dir: [0, 1, 0],
    name: "antennaMount",
    group: "stage2.antenna",
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 5), RAIL_HIGHLIGHT, {
    at: [0, 2.065, -0.95],
    name: "antennaMountCap",
    group: "stage2.antenna",
  });

  // Tapered mast: broad and dark at the root, ending in a bright cap.
  b.sweep(
    [
      antennaBase,
      [0, 2.18, -0.975],
      antennaTop,
    ],
    [0.045, 0.016],
    {
      color: RAIL_SHADOW,
      caps: "flat",
      sides: 7,
      name: "radioMast",
      group: "stage2.antenna",
    },
  );

  // Forward-leaning aerial wire, split into a dark support and a pale tip
  // so it stays legible against the cyan canopy and fuselage.
  const wireKnee: [number, number, number] = [0, 2.49, -1.02];
  const wireTip: [number, number, number] = [0, 2.56, -0.48];

  rod(antennaTop, wireKnee, 0.012, RAIL, "aerialLowerWire");
  rod(wireKnee, wireTip, 0.008, RAIL_HIGHLIGHT, "aerialForwardWire");

  b.part(new THREE.SphereGeometry(0.027, 8, 5), RAIL_HIGHLIGHT, {
    at: wireTip,
    name: "aerialTip",
    group: "stage2.antenna",
  });

  // Two tiny dark collars give the mast and wire a manufactured, riveted finish.
  cylinder(
    b,
    0.028,
    0.035,
    RAIL_SHADOW,
    [0, 2.205, -0.985],
    [0, 1, 0],
    "mastCollar",
    8,
  );
  cylinder(
    b,
    0.018,
    0.028,
    RAIL_SHADOW,
    [0, 2.488, -1.02],
    [0, 1, 0],
    "aerialCollar",
    8,
  );

  function cylinder(
    builder: Builder,
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number],
    name: string,
    segments: number,
  ) {
    return builder.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
      group: "stage2.antenna",
    });
  }
}
    return addCockpitFrame;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addExhaustStacks(b: Builder) {
  const stackCount = 6;
  const firstZ = 2.92;
  const spacing = 0.125;

  for (let i = 0; i < stackCount; i++) {
    const z = firstZ + i * spacing;
    const base: [number, number, number] = [0.585, 1.52, z];
    const shoulder: [number, number, number] = [0.645, 1.525, z + 0.014];
    const mouth: [number, number, number] = [0.695, 1.535, z + 0.028];

    const bodyColor = i % 2 === 0 ? MID_CYAN : DARK_CYAN;

    // A slightly tapered, square-sided exhaust riser. Its diagonal axis makes
    // the stacks project from the cowling while leaning subtly toward the nose.
    b.frustumBox(
      base,
      shoulder,
      [0.082, 0.094],
      [0.075, 0.086],
      {
        color: bodyColor,
        caps: "flat",
        name: `s25ExhaustStack${i}`,
      },
    );

    // Dark hot-gas mouth, inset into the pale outer collar.
    b.frustumBox(
      shoulder,
      mouth,
      [0.075, 0.086],
      [0.061, 0.068],
      {
        color: INK_BLUE,
        caps: "flat",
        name: `s25ExhaustOpening${i}`,
      },
    );

    // Thin bright upper lip gives each stack a crisp cyanotype drafting highlight.
    const lipBase: [number, number, number] = [
      shoulder[0] - 0.002,
      shoulder[1] + 0.035,
      shoulder[2] - 0.003,
    ];
    const lipTip: [number, number, number] = [
      mouth[0] + 0.003,
      mouth[1] + 0.032,
      mouth[2] + 0.003,
    ];
    b.frustumBox(
      lipBase,
      lipTip,
      [0.018, 0.012],
      [0.014, 0.009],
      {
        color: PALE_CYAN,
        caps: "flat",
        name: `s25ExhaustHighlight${i}`,
      },
    );
  }

  // A narrow mounting rail visually unifies the six individual stacks with
  // the engine cheek panel and adds a clean blueprint construction seam.
  b.frustumBox(
    [0.575, 1.475, firstZ - 0.07],
    [0.575, 1.475, firstZ + spacing * (stackCount - 1) + 0.07],
    [0.035, 0.032],
    [0.035, 0.032],
    {
      color: DARK_CYAN,
      caps: "flat",
      name: "s25ExhaustMountingRail",
    },
  );

  // Small pale fasteners at the ends of the rail.
  for (const z of [firstZ - 0.055, firstZ + spacing * (stackCount - 1) + 0.055]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.018, 8), PALE_CYAN, {
      at: [0.595, 1.475, z],
      dir: [1, 0.08, 0.2],
      name: `s25ExhaustRailRivet${z.toFixed(2)}`,
    });
  }
}
    return addExhaustStacks;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addTailMarking(b: Builder) {
  const PALE_CYAN = "#9ce9ed";
  const DARK_CYAN = "#063b58";
  const CYAN = "#20b7d1";
  const DEEP_BLUE = "#062b45";

  // Tail checkerboard: a thin, proud blueprint applique on the visible +Z face.
  // Six tiles are deliberately slightly separated so the dark grout reads at a distance.
  const tileW = 0.145;
  const tileH = 0.16;
  const gap = 0.012;
  const x0 = -1.5 * tileW - gap;
  const y0 = 2.86;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const x = x0 + col * (tileW + gap);
      const y = y0 + row * (tileH + gap);
      const pale = (row + col) % 2 === 0;
      b.part(
        new THREE.BoxGeometry(tileW, tileH, 0.026),
        pale ? PALE_CYAN : DARK_CYAN,
        {
          at: [x, y, -3.485],
          name: `tailChecker_${row}_${col}`,
        },
      );
    }
  }

  // Narrow dark carrier strip behind the checkerboard, plus bright top and bottom
  // blueprint registration rails. These keep the marking legible against the fin.
  b.part(new THREE.BoxGeometry(0.49, 0.39, 0.012), DEEP_BLUE, {
    at: [0, 3.02, -3.505],
    name: "tailCheckerBacking",
  });
  b.part(new THREE.BoxGeometry(0.5, 0.018, 0.032), PALE_CYAN, {
    at: [0, 2.815, -3.475],
    name: "tailCheckerLowerRail",
  });
  b.part(new THREE.BoxGeometry(0.5, 0.018, 0.032), PALE_CYAN, {
    at: [0, 3.225, -3.475],
    name: "tailCheckerUpperRail",
  });

  // Small corner fasteners add the drafted-metal detail without obscuring the tiles.
  for (const x of [-0.235, 0.235]) {
    for (const y of [2.82, 3.23]) {
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.036, 8), CYAN, {
        at: [x, y, -3.462],
        dir: [0, 0, 1],
        name: "tailCheckerRivet",
      });
    }
  }

  // Landing lights: dark stepped bezels seated on the leading-edge areas,
  // with pale lenses and a restrained cyan inner reflection.
  for (const side of [1, -1]) {
    const x = side * 1.08;
    const z = 1.335;

    b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.052, 12), DARK_CYAN, {
      at: [x, 1.455, z],
      dir: [0, 0, 1],
      name: side > 0 ? "leftLandingLightBezel" : "rightLandingLightBezel",
    });

    b.part(new THREE.CylinderGeometry(0.132, 0.132, 0.058, 16), PALE_CYAN, {
      at: [x, 1.458, z + 0.018],
      dir: [0, 0, 1],
      name: side > 0 ? "leftLandingLightLens" : "rightLandingLightLens",
    });

    b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.061, 12), CYAN, {
      at: [x, 1.458, z + 0.026],
      dir: [0, 0, 1],
      name: side > 0 ? "leftLandingLightCore" : "rightLandingLightCore",
    });

    // A slim diagonal highlight makes each lens read as glass rather than paint.
    const highlight = b.part(
      new THREE.BoxGeometry(0.018, 0.105, 0.008),
      "#d7fbfa",
      {
        at: [x - side * 0.035, 1.49, z + 0.061],
        name: side > 0 ? "leftLandingLightGlint" : "rightLandingLightGlint",
      },
    );
    highlight.rotation.z = side * THREE.MathUtils.degToRad(-24);
  }
}
    return addTailMarking;
  })(),
);
