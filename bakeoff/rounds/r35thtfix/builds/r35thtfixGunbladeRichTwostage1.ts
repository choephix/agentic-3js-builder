import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "Gunblade",
  description:
    "A Final Fantasy-inspired gunblade: an oversized silver greatsword fused to a compact magitech firearm, with a jewel-studded guard, wrapped grip, luminous blue fuller, and elegant gold fittings.",
};

export const REQUESTS = [
  {
    id: "bladeRunes",
    kind: "add",
    part: "bladeFace",
    what: "Add a vertical chain of three engraved arcane runes on the clear front face of the blade, alternating CYAN and MAGENTA. Use thin angular glyphs with a faint dark outline and tiny silver studs at their corners.",
    at: [0.0, 1.95, 0.078],
    normal: [0, 0, 1],
    bone: null,
    room: [0.2, 0.72, 0.035],
  },
  {
    id: "bladeSpine",
    kind: "add",
    part: "bladeCore",
    what: "Build a dramatic serrated spine fitting along the model's left edge of the blade: five dark steel teeth with small GOLD collars, following the blade's upward angle without covering the broad face.",
    at: [-0.17, 1.9, 0.0],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.16, 0.92, 0.12],
  },
  {
    id: "muzzleEnergy",
    kind: "add",
    part: "muzzle",
    what: "Add a glowing CYAN energy aperture inside the front muzzle, surrounded by a stepped MAGENTA warning ring and four tiny gold retaining bolts.",
    at: [0, 1.18, 0.83],
    normal: [0, 0, 1],
    bone: null,
    room: [0.22, 0.22, 0.08],
  },
  {
    id: "chamberGear",
    kind: "add",
    part: "chamber",
    what: "Add a visible six-spoke brass revolver chamber on the front side of the receiver, with a dark central axle, six small SILVER cartridge sockets, and a thin CYAN indicator arc.",
    at: [0, 1.16, 0.39],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.34, 0.09],
  },
  {
    id: "receiverBolts",
    kind: "add",
    part: "receiverBody",
    what: "Add two rows of large gold hex bolts and small black inset screws along the receiver's side plates, keeping the main dark receiver silhouette visible.",
    at: [0.235, 1.28, 0.28],
    normal: [1, 0, 0],
    bone: null,
    room: [0.06, 0.32, 0.22],
  },
  {
    id: "triggerAssembly",
    kind: "add",
    part: "triggerGuard",
    what: "Build a stylized trigger assembly inside the guard: a curved GOLD trigger, a dark hinge pin, and a tiny MAGENTA safety switch on the receiver underside.",
    at: [0, 0.96, 0.37],
    normal: [0, 0, 1],
    bone: null,
    room: [0.13, 0.2, 0.08],
  },
  {
    id: "guardGem",
    kind: "add",
    part: "guardCenter",
    what: "Set a large faceted ruby-red crystal into the center of the crossguard, with a dark outline bezel and two small gold claw prongs.",
    at: [0, 0.88, 0.225],
    normal: [0, 0, 1],
    bone: null,
    room: [0.18, 0.16, 0.08],
  },
  {
    id: "gripWrap",
    kind: "add",
    part: "gripCore",
    what: "Add a premium leather wrap over the grip in alternating LEATHER and GOLD bands, with diagonal stitching, a cyan tassel-like power cord exiting from the lower right, and a small pommel-side clasp.",
    at: [0, 0.57, 0.225],
    normal: [0, 0, 1],
    bone: null,
    room: [0.28, 0.43, 0.08],
  },
  {
    id: "pommelCrystal",
    kind: "add",
    part: "pommel",
    what: "Add a small suspended CYAN materia crystal beneath the pommel, held by three gold prongs and a short dark chain. Keep its lowest point just above the floor.",
    at: [0, 0.08, 0.245],
    normal: [0, 0, 1],
    bone: null,
    room: [0.2, 0.2, 0.14],
  },
  {
    id: "guardFiligree",
    kind: "add",
    part: "guardWingL",
    what: "Add thin gold filigree rails over both swept guard wings, ending in small dark steel arrowhead caps and a pair of tiny magenta signal lights.",
    at: [0.34, 0.9, 0.18],
    normal: [0, 0, 1],
    bone: null,
    room: [0.42, 0.16, 0.07],
  },
  {
    id: "bladeFaceTexture",
    kind: "texture",
    part: "bladeFace",
    what: "Paint the broad blade face with brushed SILVER and STEEL facets, a restrained blue reflection along the fuller, hairline scratches near the edge, and a faded Final Fantasy-style serial mark near the upper rear.",
  },
  {
    id: "receiverTexture",
    kind: "texture",
    part: "receiverBody",
    what: "Paint the receiver in charcoal and NAVY panel blocks with warm wear on corners, subtle diagonal machining lines, tiny gold caution marks, and a faded unit number near the rear.",
  },
  {
    id: "gripTexture",
    kind: "texture",
    part: "gripCore",
    what: "Paint the grip as deep brown leather with alternating darker wrap bands, tiny cream stitch marks, and soft worn highlights on the front-facing ridges.",
  },
  {
    id: "guardTexture",
    kind: "texture",
    part: "guardCore",
    what: "Paint the guard with polished GOLD on its upper planes, bronze shadow planes beneath, and a repeating angular engraved motif that leads toward the center jewel.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const STEEL = "#b9c9d9";
const STEEL_LIGHT = "#e7f2f4";
const STEEL_DARK = "#4b596d";
const EDGE = "#20283a";
const NAVY = "#263c68";
const NAVY_DARK = "#111a32";
const CYAN = "#43eaff";
const CYAN_DARK = "#157b9d";
const MAGENTA = "#f039b8";
const MAGENTA_DARK = "#681c68";
const GOLD = "#d6a33d";
const GOLD_LIGHT = "#ffe18a";
const BRONZE = "#80552d";
const LEATHER = "#63382d";
const LEATHER_DARK = "#2b1921";
const RUBY = "#e43b54";
const RUBY_DARK = "#641c34";
const WHITE = "#f5f6e9";
const BLACK = "#080b16";

type V3 = [number, number, number];

function box(
  b: Builder,
  name: string,
  size: V3,
  at: V3,
  color: string,
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    name,
    ...options,
  });
}

function cylinder(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: V3,
  color: string,
  dir: V3 = [0, 1, 0],
  segments = 10,
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments, 1), color, {
    at,
    dir,
    name,
    ...options,
  });
}

function sphere(
  b: Builder,
  name: string,
  radius: number,
  at: V3,
  color: string,
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
    at,
    name,
    ...options,
  });
}

function rod(
  b: Builder,
  name: string,
  a: V3,
  c: V3,
  radius: number,
  color: string,
  options: Record<string, unknown> = {},
) {
  return b.rod(a, c, radius, {
    color,
    name,
    sides: 8,
    caps: "round",
    ...options,
  });
}

function plate(
  b: Builder,
  name: string,
  outline: [number, number][],
  at: V3,
  thickness: number,
  color: string,
  options: Record<string, unknown> = {},
) {
  return b.extrude(outline, {
    at,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness,
    bevel: Math.min(thickness * 0.42, 0.012),
    color,
    name,
    ...options,
  });
}

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const bladeOutline: [number, number][] = [
    [-0.105, 0.91],
    [0.09, 0.91],
    [0.145, 1.25],
    [0.19, 2.24],
    [0.145, 2.53],
    [0.065, 2.76],
    [0.0, 2.94],
    [-0.07, 2.79],
    [-0.16, 2.51],
    [-0.205, 2.18],
    [-0.17, 1.28],
  ];

  const bladeFaceOutline: [number, number][] = [
    [-0.082, 0.99],
    [0.067, 0.99],
    [0.111, 1.29],
    [0.151, 2.2],
    [0.108, 2.45],
    [0.041, 2.69],
    [0.0, 2.83],
    [-0.045, 2.69],
    [-0.125, 2.45],
    [-0.164, 2.17],
    [-0.138, 1.3],
  ];

  const bladeCore = plate(
    b,
    "bladeCore",
    bladeOutline,
    [0, 0, 0],
    0.12,
    STEEL_DARK,
    { smoothing: 0, flat: true },
  );

  plate(
    b,
    "bladeFace",
    bladeFaceOutline,
    [0, 0, 0.066],
    0.012,
    STEEL,
    { smoothing: 1, flat: true },
  );

  const bladeShadowOutline: [number, number][] = [
    [-0.17, 1.32],
    [-0.125, 1.42],
    [-0.15, 2.16],
    [-0.102, 2.44],
    [-0.055, 2.65],
    [-0.095, 2.4],
    [-0.145, 2.13],
    [-0.155, 1.62],
  ];

  plate(b, "bladeLeftShadow", bladeShadowOutline, [0, 0, 0.074], 0.008, EDGE, {
    bevel: 0.003,
  });

  const fuller: [number, number][] = [
    [-0.031, 1.28],
    [0.031, 1.28],
    [0.047, 2.38],
    [0.013, 2.7],
    [-0.016, 2.48],
  ];
  plate(b, "bladeFuller", fuller, [0, 0, 0.078], 0.009, NAVY, {
    bevel: 0.004,
  });

  plate(
    b,
    "bladeFullerGlow",
    [
      [-0.009, 1.43],
      [0.009, 1.43],
      [0.018, 2.34],
      [0.004, 2.58],
      [-0.008, 2.36],
    ],
    [0, 0, 0.085],
    0.006,
    CYAN,
    { bevel: 0.002 },
  );

  rod(b, "bladeRightEdge", [0.114, 1.27, 0.081], [0.16, 2.22, 0.081], 0.018, STEEL_LIGHT);
  rod(b, "bladeRightEdgeTip", [0.16, 2.22, 0.081], [0.025, 2.88, 0.081], 0.015, STEEL_LIGHT);
  rod(b, "bladeLeftEdge", [-0.17, 1.3, 0.081], [-0.16, 2.2, 0.081], 0.016, EDGE);
  rod(b, "bladeLeftEdgeTip", [-0.16, 2.2, 0.081], [-0.04, 2.74, 0.081], 0.013, EDGE);

  plate(
    b,
    "bladeTipCap",
    [
      [-0.055, 2.69],
      [0.04, 2.69],
      [0.0, 2.94],
      [-0.035, 2.83],
    ],
    [0, 0, 0.083],
    0.01,
    STEEL_LIGHT,
    { bevel: 0.003 },
  );

  const bladePanel: [number, number][] = [
    [-0.082, 1.02],
    [0.063, 1.02],
    [0.082, 1.18],
    [-0.096, 1.18],
  ];
  plate(b, "bladeLowerPanel", bladePanel, [0, 0, 0.079], 0.008, NAVY_DARK, {
    bevel: 0.003,
  });

  for (let i = 0; i < 8; i++) {
    const y = 1.42 + i * 0.145;
    sphere(b, `bladeRivet${i}`, 0.018, [0.093, y, 0.091], GOLD_LIGHT);
  }

  for (let i = 0; i < 5; i++) {
    const y = 1.45 + i * 0.19;
    plate(
      b,
      `spineTooth${i}`,
      [
        [0, 0],
        [0.075, 0.035],
        [0.014, 0.13],
      ],
      [-0.185, y, -0.004],
      0.035,
      EDGE,
      { bevel: 0.004 },
    );
    cylinder(b, `spineCollar${i}`, 0.025, 0.025, [-0.188, y + 0.02, 0.02], GOLD, [1, 0, 0], 8);
  }

  box(b, "tang", [0.23, 0.32, 0.14], [0, 0.98, 0.02], EDGE);
  box(b, "tangFace", [0.16, 0.25, 0.018], [0, 1.0, 0.094], NAVY);
  rod(b, "tangBlueLine", [-0.045, 0.91, 0.108], [0.045, 1.17, 0.108], 0.009, CYAN);

  const receiverBody = box(
    b,
    "receiverBody",
    [0.48, 0.34, 0.34],
    [0, 1.16, 0.17],
    NAVY_DARK,
    { flat: true },
  );

  box(b, "receiverUpper", [0.36, 0.11, 0.31], [0, 1.38, 0.15], EDGE);
  box(b, "receiverLower", [0.34, 0.08, 0.29], [0, 0.96, 0.16], BLACK);
  box(b, "receiverFrontPlate", [0.32, 0.25, 0.025], [0, 1.17, 0.35], STEEL_DARK);
  box(b, "receiverBackPlate", [0.39, 0.24, 0.025], [0, 1.17, -0.025], EDGE);
  box(b, "receiverTopRail", [0.28, 0.055, 0.08], [0, 1.47, 0.16], GOLD);
  box(b, "receiverTopRailDark", [0.19, 0.022, 0.082], [0, 1.5, 0.16], GOLD_LIGHT);

  for (const s of [-1, 1]) {
    box(b, `receiverSidePlate${s}`, [0.035, 0.23, 0.28], [s * 0.255, 1.18, 0.16], STEEL_DARK);
    box(b, `receiverSideInset${s}`, [0.012, 0.15, 0.18], [s * 0.276, 1.18, 0.18], NAVY);
    rod(
      b,
      `receiverSideRail${s}`,
      [s * 0.29, 1.05, 0.08],
      [s * 0.29, 1.32, 0.08],
      0.012,
      GOLD,
    );
    cylinder(
      b,
      `receiverSideAxle${s}`,
      0.045,
      0.035,
      [s * 0.285, 1.18, 0.18],
      BLACK,
      [1, 0, 0],
      8,
    );
  }

  const barrel = rod(b, "barrel", [0, 1.18, 0.25], [0, 1.18, 0.79], 0.087, STEEL_DARK, {
    section: { ngon: 8 },
  });
  cylinder(b, "barrelUpperRail", 0.025, 0.51, [0, 1.27, 0.51], NAVY, [0, 0, 1], 8);
  cylinder(b, "barrelLowerRail", 0.024, 0.49, [0, 1.09, 0.51], EDGE, [0, 0, 1], 8);
  cylinder(b, "muzzle", 0.125, 0.1, [0, 1.18, 0.83], EDGE, [0, 0, 1], 10, {
    flat: true,
  });
  cylinder(b, "muzzleSteelRing", 0.105, 0.025, [0, 1.18, 0.885], GOLD, [0, 0, 1], 10);
  cylinder(b, "muzzleBore", 0.072, 0.031, [0, 1.18, 0.904], BLACK, [0, 0, 1], 10);

  cylinder(b, "chamberBacking", 0.18, 0.065, [0, 1.16, 0.37], EDGE, [0, 0, 1], 12);
  cylinder(b, "chamberFace", 0.145, 0.073, [0, 1.16, 0.412], GOLD, [0, 0, 1], 12);
  cylinder(b, "chamberInset", 0.112, 0.078, [0, 1.16, 0.46], BRONZE, [0, 0, 1], 12);
  cylinder(b, "chamberHub", 0.045, 0.092, [0, 1.16, 0.51], BLACK, [0, 0, 1], 10);
  const chamberRing = b.part(
    new THREE.TorusGeometry(0.126, 0.014, 6, 18),
    GOLD_LIGHT,
    {
      at: [0, 1.16, 0.505],
      rotation: [90, 0, 0],
      name: "chamberRing",
    },
  );

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.sin(a) * 0.082;
    const y = 1.16 + Math.cos(a) * 0.082;
    cylinder(b, `cartridgeSocket${i}`, 0.023, 0.018, [x, y, 0.515], STEEL_LIGHT, [0, 0, 1], 7);
    sphere(b, `cartridgePin${i}`, 0.009, [x, y, 0.53], NAVY_DARK);
  }

  rod(b, "chamberArc", [-0.135, 1.08, 0.52], [-0.095, 1.25, 0.52], 0.009, CYAN);
  rod(b, "chamberArc2", [0.095, 1.25, 0.52], [0.135, 1.08, 0.52], 0.009, CYAN);

  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      cylinder(
        b,
        `receiverBolt${s}_${i}`,
        0.018,
        0.018,
        [s * 0.292, 1.05 + i * 0.12, 0.225],
        GOLD_LIGHT,
        [1, 0, 0],
        6,
      );
    }
    for (let i = 0; i < 3; i++) {
      sphere(b, `receiverScrew${s}_${i}`, 0.012, [s * 0.295, 1.08 + i * 0.1, 0.075], BLACK);
    }
  }

  rod(b, "triggerGuardLeft", [-0.16, 1.03, 0.35], [-0.21, 0.88, 0.35], 0.035, GOLD);
  rod(b, "triggerGuardLeftLower", [-0.21, 0.88, 0.35], [-0.09, 0.82, 0.35], 0.035, GOLD);
  rod(b, "triggerGuardRight", [0.16, 1.03, 0.35], [0.21, 0.88, 0.35], 0.035, GOLD);
  rod(b, "triggerGuardRightLower", [0.21, 0.88, 0.35], [0.09, 0.82, 0.35], 0.035, GOLD);
  rod(b, "trigger", [-0.012, 1.02, 0.382], [0.035, 0.91, 0.382], 0.022, GOLD_LIGHT);
  sphere(b, "triggerHinge", 0.028, [0, 1.03, 0.39], BLACK);
  box(b, "safetySwitch", [0.075, 0.035, 0.025], [0, 0.98, 0.39], MAGENTA);

  box(b, "gripSocket", [0.24, 0.13, 0.2], [0, 0.84, 0.11], EDGE);
  cylinder(b, "gripTopCollar", 0.14, 0.08, [0, 0.81, 0.11], GOLD, [0, 1, 0], 10);
  const gripCore = box(
    b,
    "gripCore",
    [0.205, 0.52, 0.19],
    [0, 0.55, 0.105],
    LEATHER_DARK,
    { rotation: [0, 0, -5], flat: true },
  );
  box(b, "gripFrontPanel", [0.15, 0.43, 0.018], [0, 0.55, 0.21], LEATHER);
  box(b, "gripBackPanel", [0.15, 0.43, 0.018], [0, 0.55, 0.0], LEATHER_DARK);
  box(b, "gripLeftPanel", [0.018, 0.4, 0.13], [-0.11, 0.55, 0.105], BRONZE);
  box(b, "gripRightPanel", [0.018, 0.4, 0.13], [0.11, 0.55, 0.105], BRONZE);

  for (let i = 0; i < 9; i++) {
    const y = 0.34 + i * 0.052;
    box(b, `gripBand${i}`, [0.235, 0.025, 0.215], [0, y, 0.108], i % 3 === 0 ? GOLD : LEATHER, {
      rotation: [0, 0, i % 2 === 0 ? -7 : 7],
    });
    sphere(b, `gripBandPinL${i}`, 0.009, [-0.116, y, 0.22], GOLD_LIGHT);
    sphere(b, `gripBandPinR${i}`, 0.009, [0.116, y, 0.22], GOLD_LIGHT);
  }

  for (let i = 0; i < 8; i++) {
    const y = 0.37 + i * 0.05;
    rod(
      b,
      `gripStitch${i}`,
      [-0.078, y - 0.016, 0.222],
      [0.078, y + 0.016, 0.222],
      0.0045,
      GOLD_LIGHT,
    );
  }

  const guardCore = box(
    b,
    "guardCore",
    [0.3, 0.13, 0.2],
    [0, 0.87, 0.115],
    GOLD,
    { flat: true },
  );
  box(b, "guardCenterDark", [0.18, 0.1, 0.025], [0, 0.87, 0.225], BRONZE);

  rod(b, "guardWingL", [-0.12, 0.87, 0.12], [-0.48, 0.95, 0.12], 0.06, GOLD);
  rod(b, "guardWingLTip", [-0.48, 0.95, 0.12], [-0.59, 0.91, 0.12], 0.043, STEEL_DARK);
  rod(b, "guardWingR", [0.12, 0.87, 0.12], [0.48, 0.95, 0.12], 0.06, GOLD);
  rod(b, "guardWingRTip", [0.48, 0.95, 0.12], [0.59, 0.91, 0.12], 0.043, STEEL_DARK);

  box(b, "guardWingLFace", [0.3, 0.045, 0.025], [-0.32, 0.935, 0.18], GOLD_LIGHT, {
    rotation: [0, 0, 12],
  });
  box(b, "guardWingRFace", [0.3, 0.045, 0.025], [0.32, 0.935, 0.18], GOLD_LIGHT, {
    rotation: [0, 0, -12],
  });

  for (const s of [-1, 1]) {
    rod(b, `guardFiligree${s}`, [s * 0.18, 0.91, 0.205], [s * 0.47, 0.95, 0.205], 0.009, GOLD_LIGHT);
    sphere(b, `guardSignal${s}`, 0.018, [s * 0.39, 0.945, 0.219], MAGENTA);
    sphere(b, `guardWingRivet${s}`, 0.022, [s * 0.49, 0.915, 0.165], STEEL_LIGHT);
  }

  plate(
    b,
    "guardInset",
    [
      [-0.07, -0.04],
      [0.07, -0.04],
      [0.105, 0.035],
      [0, 0.105],
      [-0.105, 0.035],
    ],
    [0, 0.82, 0.23],
    0.018,
    RUBY_DARK,
    { bevel: 0.005 },
  );
  plate(
    b,
    "guardJewel",
    [
      [-0.055, -0.025],
      [0.055, -0.025],
      [0.073, 0.02],
      [0, 0.077],
      [-0.073, 0.02],
    ],
    [0, 0.82, 0.246],
    0.018,
    RUBY,
    { bevel: 0.006 },
  );
  sphere(b, "guardJewelHighlight", 0.014, [-0.022, 0.868, 0.263], WHITE);

  for (const s of [-1, 1]) {
    rod(b, `guardClaw${s}`, [s * 0.07, 0.885, 0.248], [s * 0.105, 0.92, 0.25], 0.012, GOLD_LIGHT);
    sphere(b, `guardClawTip${s}`, 0.014, [s * 0.105, 0.92, 0.25], GOLD_LIGHT);
  }

  const pommel = b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.14, 0.035],
      [0.15, 0.095],
      [0.125, 0.17],
      [0.085, 0.22],
      [0, 0.22],
    ],
    {
      at: [0, 0.03, 0.11],
      axis: [0, 1, 0],
      segments: 10,
      color: GOLD,
      name: "pommel",
    },
  );

  b.lathe(
    [
      [0, 0],
      [0.062, 0],
      [0.088, 0.035],
      [0.083, 0.11],
      [0.052, 0.16],
      [0, 0.16],
    ],
    {
      at: [0, 0.065, 0.11],
      axis: [0, 1, 0],
      segments: 8,
      color: BRONZE,
      name: "pommelInset",
    },
  );

  cylinder(b, "pommelCap", 0.112, 0.032, [0, 0.25, 0.11], GOLD_LIGHT, [0, 1, 0], 10);
  cylinder(b, "pommelBottomCap", 0.092, 0.025, [0, 0.035, 0.11], EDGE, [0, 1, 0], 10);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    sphere(
      b,
      `pommelRivet${i}`,
      0.014,
      [Math.sin(a) * 0.112, 0.148, 0.11 + Math.cos(a) * 0.112],
      GOLD_LIGHT,
    );
  }

  rod(b, "pommelChain", [0, 0.035, 0.245], [0, -0.005, 0.245], 0.009, EDGE);
  plate(
    b,
    "pommelCrystal",
    [
      [-0.045, -0.04],
      [0, -0.095],
      [0.045, -0.04],
      [0.025, 0.045],
      [-0.025, 0.045],
    ],
    [0, 0.0, 0.248],
    0.02,
    CYAN,
    { bevel: 0.004 },
  );
  sphere(b, "pommelCrystalSpark", 0.012, [-0.012, 0.03, 0.267], WHITE);

  for (const s of [-1, 1]) {
    rod(b, `pommelProng${s}`, [s * 0.035, 0.02, 0.262], [s * 0.052, -0.025, 0.258], 0.009, GOLD_LIGHT);
  }

  box(b, "bladeMountL", [0.06, 0.26, 0.14], [-0.14, 1.08, 0.03], GOLD);
  box(b, "bladeMountR", [0.06, 0.26, 0.14], [0.14, 1.08, 0.03], GOLD);
  sphere(b, "bladeMountBoltL", 0.028, [-0.175, 1.14, 0.11], GOLD_LIGHT);
  sphere(b, "bladeMountBoltR", 0.028, [0.175, 1.14, 0.11], GOLD_LIGHT);

  for (let i = 0; i < 4; i++) {
    const y = 1.55 + i * 0.23;
    rod(b, `bladeBackSpine${i}`, [-0.12, y, -0.065], [-0.095, y + 0.13, -0.065], 0.012, EDGE);
  }

  plate(
    b,
    "bladeRearEmblem",
    [
      [-0.065, -0.035],
      [0, -0.09],
      [0.065, -0.035],
      [0.042, 0.05],
      [-0.042, 0.05],
    ],
    [0, 2.47, 0.083],
    0.007,
    MAGENTA_DARK,
    { bevel: 0.002 },
  );
  sphere(b, "bladeRearEmblemDot", 0.018, [0, 2.47, 0.095], MAGENTA);

  for (const s of [-1, 1]) {
    box(b, `bladeShoulderPlate${s}`, [0.075, 0.18, 0.025], [s * 0.145, 1.3, 0.095], STEEL_LIGHT, {
      rotation: [0, 0, s * 10],
    });
    sphere(b, `bladeShoulderBolt${s}`, 0.018, [s * 0.16, 1.31, 0.114], GOLD);
  }

  box(b, "receiverRearFin", [0.13, 0.24, 0.2], [0, 1.27, -0.14], NAVY);
  box(b, "receiverRearFinTip", [0.1, 0.08, 0.16], [0, 1.42, -0.14], STEEL_DARK);
  rod(b, "receiverRearBlueLine", [-0.04, 1.16, -0.25], [0.04, 1.37, -0.25], 0.009, CYAN_DARK);

  for (let i = 0; i < 5; i++) {
    const x = -0.18 + i * 0.09;
    sphere(b, `receiverTopRivet${i}`, 0.013, [x, 1.48, 0.215], GOLD_LIGHT);
  }

  const stage2 = STAGE2;
  for (const add of stage2) add(b);

  return b.root;
}
