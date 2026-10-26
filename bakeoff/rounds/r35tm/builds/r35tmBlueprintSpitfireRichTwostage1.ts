import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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
      color: MID_CYAN,
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
      color: MID_CYAN,
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
      color: MID_CYAN,
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
