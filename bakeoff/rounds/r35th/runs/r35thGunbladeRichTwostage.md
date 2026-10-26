<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

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
```

<!-- call: texture -->

```ts
import * as THREE from "three";
import { createBuilder, mix, noise, paint, smoothstep } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

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

function nearSegment(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  width: number,
) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
  const px = ax + dx * t;
  const py = ay + dy * t;
  return Math.hypot(x - px, y - py) < width;
}

const BLADE_PAINT = paint((p, n, s) => {
  const x = s[0];
  const y = s[1];

  let color = n.z > 0.4 ? STEEL : EDGE;

  if (n.z > 0.4) {
    const brush = noise(p, 0.045, 17);
    color = mix(STEEL_LIGHT, STEEL_DARK, 0.22 + brush * 0.28);

    const facet = smoothstep(0.0, 0.18, Math.abs(x + 0.1));
    color = mix(color, STEEL, facet * 0.22);

    if (Math.abs(x) < 0.044 && y > 1.2 && y < 2.7) {
      const reflection = 0.22 + 0.16 * smoothstep(0, 1, noise(p, 0.12, 23));
      color = mix(color, CYAN_DARK, reflection);
    }

    const scratchWave = Math.sin(y * 137 + x * 41);
    if (Math.abs(x) > 0.065 && Math.abs(scratchWave) > 0.987) {
      color = mix(color, WHITE, 0.48);
    }

    const serial =
      nearSegment(x, y, -0.055, 2.42, -0.055, 2.53, 0.007) ||
      nearSegment(x, y, -0.055, 2.53, 0.008, 2.53, 0.007) ||
      nearSegment(x, y, -0.055, 2.48, -0.005, 2.48, 0.007) ||
      nearSegment(x, y, 0.025, 2.42, 0.025, 2.53, 0.007) ||
      nearSegment(x, y, 0.025, 2.42, 0.067, 2.42, 0.007);

    if (serial) color = mix(color, MAGENTA_DARK, 0.42);
  }

  return color;
});

const RECEIVER_PAINT = paint((p, n, _s) => {
  let color = NAVY_DARK;

  if (p.z > 0.27) color = NAVY;
  if (p.y > 1.33) color = EDGE;
  if (p.y < 1.02) color = BLACK;

  const panelNoise = noise(p, 0.075, 31);
  color = mix(color, STEEL_DARK, panelNoise * 0.12);

  const machining = Math.sin((p.x + p.y * 0.72 + p.z * 0.31) * 175);
  if (Math.abs(machining) > 0.97 && n.z > 0.35) {
    color = mix(color, STEEL, 0.22);
  }

  const corner =
    Math.abs(p.x) > 0.19 ||
    p.y > 1.34 ||
    p.y < 1.01 ||
    p.z > 0.29 ||
    p.z < -0.06;

  if (corner && Math.abs(Math.sin(p.x * 90 + p.y * 43)) > 0.62) {
    color = mix(color, GOLD, 0.28);
  }

  const caution =
    n.z > 0.45 &&
    p.y > 1.28 &&
    p.y < 1.36 &&
    Math.abs(Math.sin(p.x * 140)) > 0.35;

  if (caution) color = mix(color, GOLD_LIGHT, 0.55);

  const unitMark =
    p.z < 0.02 &&
    p.y > 1.17 &&
    p.y < 1.27 &&
    (nearSegment(p.x, p.y, -0.12, 1.19, -0.12, 1.25, 0.008) ||
      nearSegment(p.x, p.y, -0.12, 1.25, -0.08, 1.25, 0.008) ||
      nearSegment(p.x, p.y, -0.045, 1.19, -0.045, 1.25, 0.008) ||
      nearSegment(p.x, p.y, -0.08, 1.22, -0.045, 1.22, 0.008));

  if (unitMark) color = mix(color, MAGENTA_DARK, 0.5);

  return color;
});

const GRIP_PAINT = paint((p, n, _s) => {
  const band = Math.floor((p.y - 0.31) / 0.052);
  let color = band % 3 === 0 ? LEATHER_DARK : LEATHER;

  const leatherGrain = noise(p, 0.032, 47);
  color = mix(color, BRONZE, leatherGrain * 0.12);

  if (p.z > 0.17 && n.z > 0.25) {
    const ridge = Math.abs(Math.sin(p.y * 142 + p.x * 29));
    if (ridge > 0.68) color = mix(color, GOLD_LIGHT, 0.19);
  }

  const stitchPhase = Math.sin((p.y * 19 + p.x * 34) * Math.PI);
  if (p.z > 0.19 && Math.abs(stitchPhase) > 0.985) {
    color = mix(color, "#f5d59a", 0.82);
  }

  if (n.y > 0.65) color = mix(color, LEATHER, 0.18);

  return color;
});

const GUARD_PAINT = paint((p, n, _s) => {
  let color = n.y > 0.2 ? GOLD_LIGHT : BRONZE;
  color = mix(color, GOLD, 0.35 + 0.2 * noise(p, 0.06, 59));

  if (n.z > 0.35) {
    const motif = Math.abs(Math.sin(p.x * 35 + p.y * 58));
    if (motif > 0.91 && Math.abs(p.x) > 0.07) {
      color = mix(color, BRONZE, 0.72);
    }

    const innerMotif = Math.abs(Math.sin(p.x * 72 - p.y * 37));
    if (innerMotif > 0.965 && Math.abs(p.x) < 0.24) {
      color = mix(color, MAGENTA_DARK, 0.24);
    }
  }

  if (n.y < -0.45) color = mix(color, BRONZE, 0.25);
  return color;
});

function box(
  b: Builder,
  name: string,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
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
  at: [number, number, number],
  color: any,
  dir: [number, number, number] = [0, 1, 0],
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
  at: [number, number, number],
  color: any,
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
  a: [number, number, number],
  c: [number, number, number],
  radius: number,
  color: any,
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
  at: [number, number, number],
  thickness: number,
  color: any,
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
    BLADE_PAINT,
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

  box(b, "receiverBody", [0.48, 0.34, 0.34], [0, 1.16, 0.17], RECEIVER_PAINT, {
    flat: true,
  });

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

  rod(b, "barrel", [0, 1.18, 0.25], [0, 1.18, 0.79], 0.087, STEEL_DARK, {
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
  b.part(new THREE.TorusGeometry(0.126, 0.014, 6, 18), GOLD_LIGHT, {
    at: [0, 1.16, 0.505],
    rotation: [90, 0, 0],
    name: "chamberRing",
  });

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
  box(b, "gripCore", [0.205, 0.52, 0.19], [0, 0.55, 0.105], GRIP_PAINT, {
    rotation: [0, 0, -5],
    flat: true,
  });
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

  box(b, "guardCore", [0.3, 0.13, 0.2], [0, 0.87, 0.115], GUARD_PAINT, {
    flat: true,
  });
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

  b.lathe(
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
```

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addBladeRunes(b: Builder) {
  const zUnder = 0.086;
  const zRune = 0.093;
  const cx = 0.035;
  const ys = [1.72, 1.95, 2.18];

  const point = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const stroke = (
    name: string,
    a: [number, number],
    c: [number, number],
    radius: number,
    color: string,
    z: number,
  ) =>
    b.rod(
      point(a[0], a[1], z),
      point(c[0], c[1], z),
      radius,
      {
        color,
        name,
        section: { ngon: 6 },
        caps: "round",
      },
    );

  const stud = (name: string, x: number, y: number) =>
    b.part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.009, 6), STEEL_LIGHT, {
      at: [x, y, 0.096],
      dir: [0, 0, 1],
      name,
      flat: true,
    });

  const drawRune = (
    name: string,
    pts: [number, number][],
    runeColor: string,
    studIndices: number[],
  ) => {
    for (let i = 0; i < pts.length - 1; i++) {
      stroke(`${name}Outline${i}`, pts[i], pts[i + 1], 0.0085, EDGE, zUnder);
    }

    for (let i = 0; i < pts.length - 1; i++) {
      const luminous = stroke(`${name}Glyph${i}`, pts[i], pts[i + 1], 0.0038, runeColor, zRune);
      glow(luminous, 1.35);
    }

    for (const i of studIndices) {
      const p = pts[i];
      stud(`${name}Stud${i}`, p[0], p[1]);
    }
  };

  const top: [number, number][] = [
    [cx - 0.038, ys[0] + 0.057],
    [cx + 0.037, ys[0] + 0.057],
    [cx + 0.004, ys[0] + 0.006],
    [cx + 0.038, ys[0] - 0.056],
    [cx - 0.037, ys[0] - 0.056],
    [cx - 0.004, ys[0] - 0.006],
    [cx - 0.038, ys[0] + 0.057],
  ];

  const middle: [number, number][] = [
    [cx - 0.039, ys[1] + 0.058],
    [cx + 0.039, ys[1] + 0.031],
    [cx - 0.006, ys[1] - 0.002],
    [cx + 0.039, ys[1] - 0.054],
    [cx - 0.038, ys[1] - 0.061],
    [cx - 0.005, ys[1] - 0.003],
    [cx - 0.039, ys[1] + 0.058],
  ];

  const bottom: [number, number][] = [
    [cx - 0.042, ys[2] - 0.055],
    [cx, ys[2] + 0.061],
    [cx + 0.042, ys[2] - 0.055],
    [cx + 0.019, ys[2] - 0.006],
    [cx - 0.019, ys[2] - 0.006],
    [cx - 0.042, ys[2] - 0.055],
  ];

  drawRune("s21RuneTop", top, CYAN, [0, 1, 3, 4]);
  drawRune("s21RuneMiddle", middle, MAGENTA, [0, 1, 3, 4]);
  drawRune("s21RuneBottom", bottom, CYAN, [0, 1, 2, 4]);

  const linkA = stroke(
    "s21RuneLinkUpperOutline",
    [cx, ys[0] - 0.068],
    [cx, ys[1] + 0.068],
    0.0075,
    EDGE,
    zUnder,
  );
  const linkB = stroke(
    "s21RuneLinkUpper",
    [cx, ys[0] - 0.068],
    [cx, ys[1] + 0.068],
    0.003,
    CYAN_DARK,
    zRune,
  );
  const linkC = stroke(
    "s21RuneLinkLowerOutline",
    [cx, ys[1] - 0.068],
    [cx, ys[2] + 0.068],
    0.0075,
    EDGE,
    zUnder,
  );
  const linkD = stroke(
    "s21RuneLinkLower",
    [cx, ys[1] - 0.068],
    [cx, ys[2] + 0.068],
    0.003,
    MAGENTA_DARK,
    zRune,
  );
  glow(linkB, 1.1);
  glow(linkD, 1.1);
  void linkA;
  void linkC;

  for (const [i, y] of ys.entries()) {
    const leftTick = stroke(
      `s21RuneMarkerLeft${i}`,
      [-0.078, y - 0.027],
      [-0.059, y - 0.027],
      0.0045,
      GOLD_LIGHT,
      0.091,
    );
    const rightTick = stroke(
      `s21RuneMarkerRight${i}`,
      [0.082, y + 0.027],
      [0.099, y + 0.027],
      0.0045,
      GOLD_LIGHT,
      0.091,
    );
    glow(leftTick, 0.8);
    glow(rightTick, 0.8);

    stud(`s21RuneMarkerStudL${i}`, -0.082, y - 0.027);
    stud(`s21RuneMarkerStudR${i}`, 0.101, y + 0.027);
  }

  const crown = stroke(
    "s21RuneCrown",
    [cx - 0.022, 2.285],
    [cx, 2.305],
    0.004,
    STEEL_LIGHT,
    0.091,
  );
  const crown2 = stroke(
    "s21RuneCrown2",
    [cx, 2.305],
    [cx + 0.022, 2.285],
    0.004,
    STEEL_LIGHT,
    0.091,
  );
  const base = stroke(
    "s21RuneBase",
    [cx - 0.022, 1.615],
    [cx + 0.022, 1.615],
    0.004,
    STEEL_LIGHT,
    0.091,
  );
  glow(crown, 0.65);
  glow(crown2, 0.65);
  glow(base, 0.65);

  b.part(new THREE.SphereGeometry(0.010, 6, 4), STEEL_LIGHT, {
    at: [cx, 2.305, 0.096],
    name: "s21RuneCrownStud",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.010, 6, 4), STEEL_LIGHT, {
    at: [cx, 1.615, 0.096],
    name: "s21RuneBaseStud",
    flat: true,
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addBladeSpine(b: Builder) {
  const addRod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    b.rod(a, c, radius, {
      color,
      name: `s22_${name}`,
      sides: 8,
      caps: "round",
      ...options,
    });

  const addCylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 8,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments, 1), color, {
      at,
      dir,
      name: `s22_${name}`,
      ...options,
    });

  const addSphere = (
    name: string,
    radius: number,
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      name: `s22_${name}`,
      ...options,
    });

  const addPlate = (
    name: string,
    outline: [number, number][],
    at: [number, number, number],
    thickness: number,
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: Math.min(thickness * 0.42, 0.008),
      color,
      name: `s22_${name}`,
      ...options,
    });

  /*
   * Serrated blade spine.
   *
   * The blade face is at positive Z, so the spine is deliberately sunk
   * behind it at negative Z. It follows the existing left/rear edge from
   * y 1.45 through y 2.35, with each tooth pointing outward toward -X.
   */
  addRod(
    "spineRail",
    [-0.178, 1.43, -0.035],
    [-0.205, 2.35, -0.035],
    0.023,
    EDGE,
    { section: { ngon: 6 }, flat: true },
  );

  addRod(
    "spineGoldRail",
    [-0.196, 1.46, 0.006],
    [-0.222, 2.32, 0.006],
    0.007,
    GOLD,
    { section: { ngon: 6 } },
  );

  const toothY = [1.53, 1.72, 1.91, 2.10, 2.29];
  const toothLean = [-0.012, -0.006, 0, 0.008, 0.016];

  for (let i = 0; i < toothY.length; i++) {
    const y = toothY[i];
    const lean = toothLean[i];

    addPlate(
      `spineTooth${i}`,
      [
        [-0.064, -0.073],
        [-0.002, -0.058],
        [0.045, -0.036],
        [0.052, 0],
        [0.041, 0.038],
        [-0.002, 0.061],
        [-0.064, 0.073],
        [-0.034, 0.006],
      ],
      [-0.181 + lean, y, -0.034],
      0.043,
      EDGE,
      { bevel: 0.006, flat: true },
    );

    addPlate(
      `spineToothInset${i}`,
      [
        [-0.042, -0.048],
        [0.012, -0.026],
        [0.029, 0],
        [0.012, 0.028],
        [-0.042, 0.048],
        [-0.019, 0.004],
      ],
      [-0.181 + lean, y, -0.012],
      0.009,
      STEEL_DARK,
      { bevel: 0.002, flat: true },
    );

    addCylinder(
      `spineCollar${i}`,
      0.026,
      0.047,
      [-0.178 + lean, y, -0.005],
      GOLD,
      [0, 0, 1],
      8,
      { flat: true },
    );

    addCylinder(
      `spineCollarCap${i}`,
      0.017,
      0.053,
      [-0.178 + lean, y, 0.018],
      GOLD_LIGHT,
      [0, 0, 1],
      8,
      { flat: true },
    );

    addSphere(`spineRivetFront${i}`, 0.012, [-0.145 + lean, y - 0.039, 0.021], GOLD_LIGHT);
    addSphere(`spineRivetBack${i}`, 0.012, [-0.145 + lean, y + 0.039, 0.021], GOLD_LIGHT);

    addRod(
      `spineToothEdge${i}`,
      [-0.222 + lean, y - 0.025, 0.023],
      [-0.243 + lean, y + 0.004, 0.023],
      0.006,
      STEEL_LIGHT,
    );
  }

  addPlate(
    "spineRootEscutcheon",
    [
      [-0.062, -0.115],
      [0.045, -0.086],
      [0.066, 0],
      [0.045, 0.086],
      [-0.062, 0.115],
      [-0.035, 0],
    ],
    [-0.179, 1.405, -0.03],
    0.052,
    GOLD,
    { bevel: 0.007, flat: true },
  );

  addPlate(
    "spineRootInset",
    [
      [-0.04, -0.073],
      [0.026, -0.049],
      [0.041, 0],
      [0.026, 0.049],
      [-0.04, 0.073],
      [-0.019, 0],
    ],
    [-0.179, 1.405, 0.001],
    0.012,
    EDGE,
    { bevel: 0.002, flat: true },
  );

  /*
   * Muzzle energy aperture.
   *
   * The existing muzzle faces +Z. The dark socket is recessed first,
   * followed by a bright cyan emitter and two stepped magenta warning
   * rings. The gold bolts are kept within the original muzzle radius.
   */
  const apertureBack = addCylinder(
    "muzzleApertureSocket",
    0.078,
    0.034,
    [0, 1.18, 0.887],
    BLACK,
    [0, 0, 1],
    10,
    { flat: true },
  );

  addCylinder(
    "muzzleApertureInnerWall",
    0.068,
    0.026,
    [0, 1.18, 0.908],
    CYAN_DARK,
    [0, 0, 1],
    10,
    { flat: true },
  );

  const energyCore = addCylinder(
    "muzzleEnergyCore",
    0.058,
    0.018,
    [0, 1.18, 0.926],
    CYAN,
    [0, 0, 1],
    10,
    { flat: true },
  );
  glow(energyCore, 2.4);

  const energyFace = b.part(new THREE.CircleGeometry(0.051, 12), CYAN, {
    at: [0, 1.18, 0.938],
    dir: [0, 0, 1],
    axis: "z",
    name: "s22_muzzleEnergyFace",
  });
  glow(energyFace, 3);

  addCylinder(
    "muzzleEnergyHub",
    0.019,
    0.024,
    [0, 1.18, 0.946],
    WHITE,
    [0, 0, 1],
    8,
    { flat: true },
  );

  const warningOuter = b.part(new THREE.TorusGeometry(0.092, 0.009, 6, 16), MAGENTA_DARK, {
    at: [0, 1.18, 0.919],
    rotation: [90, 0, 0],
    name: "s22_muzzleWarningOuter",
  });
  const warningInner = b.part(new THREE.TorusGeometry(0.076, 0.007, 6, 16), MAGENTA, {
    at: [0, 1.18, 0.934],
    rotation: [90, 0, 0],
    name: "s22_muzzleWarningInner",
  });
  glow(warningInner, 1.35);

  const tabAngles = [0, 90, 180, 270];
  for (let i = 0; i < tabAngles.length; i++) {
    const a = (tabAngles[i] * Math.PI) / 180;
    const x = Math.sin(a) * 0.093;
    const y = 1.18 + Math.cos(a) * 0.093;
    const horizontal = i % 2 === 0;

    b.part(
      new THREE.BoxGeometry(horizontal ? 0.038 : 0.012, horizontal ? 0.012 : 0.038, 0.014),
      MAGENTA,
      {
        at: [x, y, 0.939],
        name: `s22_warningStep${i}`,
        flat: true,
      },
    );
  }

  const boltPositions: [number, number][] = [
    [-0.097, 1.18],
    [0.097, 1.18],
    [0, 1.083],
    [0, 1.277],
  ];

  for (let i = 0; i < boltPositions.length; i++) {
    const [x, y] = boltPositions[i];

    addCylinder(
      `muzzleRetainer${i}`,
      0.013,
      0.024,
      [x, y, 0.939],
      GOLD,
      [0, 0, 1],
      6,
      { flat: true },
    );

    addCylinder(
      `muzzleRetainerFace${i}`,
      0.007,
      0.028,
      [x, y, 0.954],
      GOLD_LIGHT,
      [0, 0, 1],
      6,
      { flat: true },
    );
  }

  const spokeEnds: [number, number, number, number][] = [
    [0, 1.18, 0.954, 0.047],
    [0, 1.18, 0.954, -0.047],
    [-0.047, 1.18, 0.954, 0],
    [0.047, 1.18, 0.954, 0],
  ];

  addRod("energySpokeVertical", [0, 1.134, 0.954], [0, 1.226, 0.954], 0.004, CYAN_DARK);
  addRod("energySpokeHorizontal", [-0.046, 1.18, 0.954], [0.046, 1.18, 0.954], 0.004, CYAN_DARK);

  addSphere("energySparkTop", 0.007, [0, 1.232, 0.958], WHITE);
  addSphere("energySparkBottom", 0.007, [0, 1.128, 0.958], WHITE);
  addSphere("energySparkLeft", 0.007, [-0.052, 1.18, 0.958], WHITE);
  addSphere("energySparkRight", 0.007, [0.052, 1.18, 0.958], WHITE);
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { arc, type Builder } from "agentic-3js-builder";

export function addChamberGear(b: Builder) {
  const chamberCenter: [number, number, number] = [0, 1.16, 0.39];
  const frontZ = 0.552;
  const axleZ = 0.565;
  const spokeRadius = 0.079;
  const socketRadius = 0.087;

  // Six broad, slightly faceted brass spokes make the mechanism read as a real
  // revolver chamber rather than a flat decorative disk.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const ex = Math.sin(a) * spokeRadius;
    const ey = 1.16 + Math.cos(a) * spokeRadius;

    rod(
      b,
      `s23_chamberSpoke${i}`,
      [0, 1.16, frontZ],
      [ex, ey, frontZ],
      0.012,
      i % 2 === 0 ? GOLD : GOLD_LIGHT,
      { section: { ngon: 6 }, caps: "round" },
    );

    // A small raised spoke collar gives each arm a mechanical pivot.
    cylinder(
      b,
      `s23_spokeCollar${i}`,
      0.016,
      0.016,
      [ex * 0.72, 1.16 + (ey - 1.16) * 0.72, axleZ],
      BRONZE,
      [0, 0, 1],
      8,
    );

    // Dark cartridge well, silver socket rim, and a tiny bright contact.
    cylinder(
      b,
      `s23_cartridgeWell${i}`,
      0.022,
      0.012,
      [Math.sin(a) * socketRadius, 1.16 + Math.cos(a) * socketRadius, 0.548],
      BLACK,
      [0, 0, 1],
      8,
    );

    b.part(
      new THREE.TorusGeometry(0.025, 0.0055, 6, 12),
      STEEL_LIGHT,
      {
        at: [Math.sin(a) * socketRadius, 1.16 + Math.cos(a) * socketRadius, 0.558],
        name: `s23_silverSocket${i}`,
      },
    );

    sphere(
      b,
      `s23_socketContact${i}`,
      0.008,
      [Math.sin(a) * socketRadius, 1.16 + Math.cos(a) * socketRadius, 0.568],
      CYAN_DARK,
    );
  }

  // Layered central axle: black core, steel washer, and a gold locking cap.
  cylinder(b, "s23_chamberAxle", 0.041, 0.026, [0, 1.16, 0.562], BLACK, [0, 0, 1], 10);
  b.part(
    new THREE.TorusGeometry(0.048, 0.007, 6, 14),
    STEEL_LIGHT,
    { at: [0, 1.16, 0.578], name: "s23_axleWasher" },
  );
  cylinder(b, "s23_axleLock", 0.031, 0.018, [0, 1.16, 0.589], GOLD_LIGHT, [0, 0, 1], 8);

  // Six minute radial dark seams between the brass spokes add depth and
  // separate the rotating chamber from the existing bronze inset.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x0 = Math.sin(a) * 0.052;
    const y0 = 1.16 + Math.cos(a) * 0.052;
    const x1 = Math.sin(a) * 0.112;
    const y1 = 1.16 + Math.cos(a) * 0.112;
    rod(b, `s23_chamberSeam${i}`, [x0, y0, 0.574], [x1, y1, 0.574], 0.0035, EDGE, {
      caps: "flat",
      sides: 5,
    });
  }

  // A swept cyan status arc sits above the face, with two jewel-like endpoint
  // indicators so it reads even at a distance.
  const indicatorArc = arc(
    [0, 1.16, 0.58],
    [0.118, 1.16, 0.58],
    [0, 0, 1],
    112,
  );
  b.sweep(indicatorArc, 0.006, {
    color: CYAN,
    sides: 6,
    caps: "round",
    name: "s23_chamberIndicatorArc",
  });
  sphere(b, "s23_indicatorStart", 0.011, [0.118, 1.16, 0.584], CYAN);
  sphere(b, "s23_indicatorEnd", 0.011, [-0.046, 1.269, 0.584], CYAN);

  // A small gold index mark above the chamber ties the indicator into the
  // receiver's existing top rail.
  plate(
    b,
    "s23_chamberIndex",
    [
      [-0.018, 0],
      [0.018, 0],
      [0.012, 0.035],
      [0, 0.05],
      [-0.012, 0.035],
    ],
    [0, 1.315, 0.585],
    0.008,
    GOLD_LIGHT,
    { bevel: 0.002 },
  );

  // Receiver-side fasteners: two horizontal rows on each side plate. The
  // six-sided gold heads are inset into dark backing washers.
  const boltRows = [0.085, 0.24];
  const boltYs = [1.07, 1.18, 1.29];

  for (const side of [-1, 1]) {
    for (let row = 0; row < boltRows.length; row++) {
      const z = boltRows[row];

      for (let col = 0; col < boltYs.length; col++) {
        const y = boltYs[col];
        const x = side * 0.307;

        cylinder(
          b,
          `s23_hexBolt_${side}_${row}_${col}`,
          0.025,
          0.026,
          [x, y, z],
          row === 0 ? GOLD : GOLD_LIGHT,
          [1, 0, 0],
          6,
          { flat: true },
        );

        // Thin dark washer visible around the hex head.
        cylinder(
          b,
          `s23_boltWasher_${side}_${row}_${col}`,
          0.031,
          0.006,
          [side * 0.292, y, z],
          BRONZE,
          [1, 0, 0],
          10,
        );

        // Black inset screw at the outer face, with a tiny cross-slot made from
        // two short rods.
        cylinder(
          b,
          `s23_insetScrew_${side}_${row}_${col}`,
          0.0095,
          0.008,
          [side * 0.329, y, z],
          BLACK,
          [1, 0, 0],
          8,
        );

        rod(
          b,
          `s23_screwSlotA_${side}_${row}_${col}`,
          [side * 0.334, y - 0.006, z],
          [side * 0.334, y + 0.006, z],
          0.002,
          STEEL_DARK,
          { caps: "flat", sides: 5 },
        );
        rod(
          b,
          `s23_screwSlotB_${side}_${row}_${col}`,
          [side * 0.334, y, z - 0.006],
          [side * 0.334, y, z + 0.006],
          0.002,
          STEEL_DARK,
          { caps: "flat", sides: 5 },
        );
      }
    }

    // Narrow side-plate highlight rail and two small cyan inspection dots.
    rod(
      b,
      `s23_sidePlateHighlight${side}`,
      [side * 0.337, 1.035, 0.16],
      [side * 0.337, 1.335, 0.16],
      0.004,
      GOLD_LIGHT,
      { caps: "flat", sides: 5 },
    );
    sphere(b, `s23_inspectionLightTop${side}`, 0.009, [side * 0.34, 1.36, 0.255], CYAN);
    sphere(b, `s23_inspectionLightBottom${side}`, 0.009, [side * 0.34, 1.0, 0.065], MAGENTA_DARK);
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { catmull, type Builder } from "agentic-3js-builder";

export function addTriggerAssembly(b: Builder) {
  const plateZ = 0.391;
  const detailZ = 0.401;
  const frontZ = 0.405;

  box(
    b,
    "s24TriggerInset",
    [0.103, 0.158, 0.014],
    [0, 0.955, plateZ],
    BLACK,
    { flat: true },
  );

  box(
    b,
    "s24TriggerInsetFace",
    [0.083, 0.137, 0.008],
    [0, 0.956, 0.401],
    NAVY_DARK,
    { flat: true },
  );

  rod(
    b,
    "s24TriggerFrameLeft",
    [-0.048, 0.884, detailZ],
    [-0.048, 1.026, detailZ],
    0.0045,
    GOLD,
  );
  rod(
    b,
    "s24TriggerFrameRight",
    [0.048, 0.884, detailZ],
    [0.048, 1.026, detailZ],
    0.0045,
    GOLD,
  );
  rod(
    b,
    "s24TriggerFrameBottom",
    [-0.048, 0.884, detailZ],
    [0.048, 0.884, detailZ],
    0.0045,
    GOLD_LIGHT,
  );
  rod(
    b,
    "s24TriggerFrameTop",
    [-0.048, 1.026, detailZ],
    [0.048, 1.026, detailZ],
    0.0045,
    BRONZE,
  );

  for (const x of [-0.043, 0.043]) {
    for (const y of [0.891, 1.019]) {
      sphere(b, `s24TriggerFrameBolt${x}_${y}`, 0.0065, [x, y, frontZ], GOLD_LIGHT);
      sphere(b, `s24TriggerFrameSocket${x}_${y}`, 0.0095, [x, y, 0.397], BLACK);
    }
  }

  const triggerPath = catmull([
    [-0.018, 1.018, 0.399],
    [0.007, 1.005, 0.399],
    [0.026, 0.966, 0.399],
    [0.028, 0.925, 0.399],
    [0.009, 0.899, 0.399],
  ]);

  b.sweep(triggerPath, 0.0105, {
    color: GOLD,
    caps: "round",
    sides: 8,
    name: "s24CurvedGoldTrigger",
  });

  const triggerHighlight = catmull([
    [-0.012, 1.012, 0.409],
    [0.009, 0.995, 0.409],
    [0.019, 0.962, 0.409],
    [0.018, 0.936, 0.409],
  ]);

  b.sweep(triggerHighlight, 0.0032, {
    color: GOLD_LIGHT,
    caps: "round",
    sides: 6,
    name: "s24TriggerHighlight",
  });

  sphere(b, "s24TriggerToe", 0.013, [0.009, 0.899, 0.399], GOLD_LIGHT);
  sphere(b, "s24TriggerPivotCollar", 0.014, [-0.018, 1.018, 0.405], BRONZE);

  cylinder(
    b,
    "s24TriggerHingePin",
    0.023,
    0.018,
    [-0.018, 1.018, 0.397],
    BLACK,
    [0, 0, 1],
    10,
  );

  b.part(
    new THREE.TorusGeometry(0.023, 0.004, 5, 12),
    GOLD_LIGHT,
    {
      at: [-0.018, 1.018, 0.407],
      rotation: [90, 0, 0],
      name: "s24TriggerHingeRing",
    },
  );

  sphere(b, "s24TriggerHingePinCap", 0.009, [-0.018, 1.018, 0.409], STEEL_LIGHT);

  box(
    b,
    "s24SafetySwitchHousing",
    [0.055, 0.027, 0.017],
    [0.012, 0.985, 0.398],
    EDGE,
    { rotation: [0, 0, -8], flat: true },
  );

  box(
    b,
    "s24MagentaSafetySwitch",
    [0.029, 0.014, 0.013],
    [0.012, 0.991, 0.406],
    MAGENTA,
    { rotation: [0, 0, -18], flat: true },
  );

  rod(
    b,
    "s24SafetySwitchRail",
    [-0.013, 0.978, 0.406],
    [0.039, 0.992, 0.406],
    0.0035,
    MAGENTA_DARK,
  );

  sphere(b, "s24SafetySwitchIndicator", 0.0065, [0.039, 0.992, 0.408], CYAN);
  sphere(b, "s24SafetySwitchPin", 0.006, [-0.014, 0.979, 0.407], GOLD_LIGHT);

  box(
    b,
    "s24TriggerStop",
    [0.036, 0.016, 0.018],
    [0.027, 0.906, 0.397],
    STEEL_DARK,
    { rotation: [0, 0, 18], flat: true },
  );

  sphere(b, "s24TriggerStopBolt", 0.006, [0.027, 0.906, 0.408], GOLD);
  sphere(b, "s24TriggerStopInset", 0.008, [0.027, 0.906, 0.393], BLACK);

  rod(
    b,
    "s24TriggerInnerRail",
    [-0.034, 0.923, 0.405],
    [-0.025, 0.988, 0.405],
    0.003,
    STEEL_LIGHT,
  );

  box(
    b,
    "s24TriggerWarningPlate",
    [0.034, 0.019, 0.008],
    [-0.028, 0.951, 0.407],
    MAGENTA_DARK,
    { rotation: [0, 0, -12], flat: true },
  );

  for (let i = 0; i < 3; i++) {
    sphere(
      b,
      `s24TriggerWarningDot${i}`,
      0.004,
      [-0.038 + i * 0.011, 0.951 + i * 0.002, 0.413],
      MAGENTA,
    );
  }

  rod(
    b,
    "s24TriggerGroundWire",
    [0.037, 0.919, 0.403],
    [0.037, 0.889, 0.403],
    0.0032,
    CYAN_DARK,
  );
  sphere(b, "s24TriggerGroundTerminal", 0.006, [0.037, 0.887, 0.405], GOLD_LIGHT);
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { catmull, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addGuardGem(b: Builder) {
  // ---------------------------------------------------------------------------------------------------------------
  // Guard jewel: a dark octagonal socket, a raised gold rim, and a small, sharply faceted ruby.

  const bezel = b.part(
    new THREE.CylinderGeometry(0.076, 0.076, 0.018, 8, 1),
    RUBY_DARK,
    {
      at: [0, 0.88, 0.239],
      dir: [0, 0, 1],
      name: "s25_guardGemBezel",
      flat: true,
    },
  );

  b.part(
    new THREE.TorusGeometry(0.061, 0.008, 6, 12),
    GOLD,
    {
      at: [0, 0.88, 0.253],
      dir: [0, 0, 1],
      axis: "z",
      name: "s25_guardGemGoldRim",
      flat: true,
    },
  );

  const ruby = b.part(
    new THREE.ConeGeometry(0.052, 0.034, 6, 1),
    RUBY,
    {
      at: [0, 0.88, 0.255],
      dir: [0, 0, 1],
      name: "s25_guardGemCrystal",
      flat: true,
    },
  );

  // A narrow dark facet under the gem gives the jewel a carved, inset appearance.
  b.part(
    new THREE.CylinderGeometry(0.044, 0.053, 0.008, 6, 1),
    RUBY_DARK,
    {
      at: [0, 0.88, 0.238],
      dir: [0, 0, 1],
      name: "s25_guardGemShadowFacet",
      flat: true,
    },
  );

  // Two claw prongs visibly gripping the ruby.
  for (const side of [-1, 1]) {
    b.rod(
      [side * 0.042, 0.852, 0.257],
      [side * 0.058, 0.872, 0.266],
      0.009,
      {
        color: GOLD_LIGHT,
        name: `s25_guardGemClaw${side}`,
        caps: "round",
        sides: 6,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.010, 6, 4),
      GOLD_LIGHT,
      {
        at: [side * 0.058, 0.872, 0.266],
        name: `s25_guardGemClawTip${side}`,
        flat: true,
      },
    );
  }

  // A single hard highlight makes the red crystal read from a distance.
  const rubyGlint = b.part(
    new THREE.SphereGeometry(0.010, 6, 4),
    WHITE,
    {
      at: [-0.020, 0.895, 0.274],
      name: "s25_guardGemGlint",
      flat: true,
    },
  );
  glow(rubyGlint, 0.35);

  // Tiny corner studs echo the gold fittings in the rest of the weapon.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.009, 6, 4),
      GOLD_LIGHT,
      {
        at: [side * 0.071, 0.842, 0.255],
        name: `s25_guardGemLowerStud${side}`,
        flat: true,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Grip wrap: extra leather overlays, bright compression bands, diagonal stitching, and a power cord.

  // Narrow gold compression bands sit over the existing wrap without hiding its broader leather pattern.
  for (const [i, y] of [0.398, 0.548, 0.698].entries()) {
    b.part(
      new THREE.BoxGeometry(0.226, 0.017, 0.204),
      i === 1 ? GOLD_LIGHT : GOLD,
      {
        at: [0, y, 0.108],
        name: `s25_gripGoldWrap${i}`,
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.164, 0.009, 0.012),
      BRONZE,
      {
        at: [0, y + 0.011, 0.218],
        name: `s25_gripGoldWrapInset${i}`,
        flat: true,
      },
    );
  }

  // Leather seam rails on the front face make the grip read as wrapped rather than machined.
  for (const side of [-1, 1]) {
    b.rod(
      [side * 0.082, 0.365, 0.222],
      [side * 0.082, 0.755, 0.222],
      0.005,
      {
        color: LEATHER,
        name: `s25_gripLeatherSeam${side}`,
        caps: "flat",
        sides: 6,
      },
    );
  }

  // Repeated diagonal stitches, kept chunky enough to survive the model's low-poly scale.
  for (let i = 0; i < 8; i++) {
    const y = 0.385 + i * 0.047;
    const lean = i % 2 === 0 ? 0.018 : -0.018;
    b.rod(
      [-0.068, y - 0.018, 0.229],
      [0.068, y + lean, 0.229],
      0.0035,
      {
        color: GOLD_LIGHT,
        name: `s25_gripDiagonalStitch${i}`,
        caps: "round",
        sides: 6,
      },
    );
  }

  // Small rivets at the stitching ends add a premium armament feel.
  for (let i = 0; i < 6; i++) {
    const y = 0.405 + i * 0.061;
    for (const side of [-1, 1]) {
      b.part(
        new THREE.SphereGeometry(0.007, 6, 4),
        GOLD,
        {
          at: [side * 0.078, y, 0.231],
          name: `s25_gripStitchRivet${i}_${side}`,
          flat: true,
        },
      );
    }
  }

  // A small side clasp anchors the wrap near the lower end of the grip.
  b.part(
    new THREE.BoxGeometry(0.028, 0.070, 0.018),
    GOLD,
    {
      at: [-0.119, 0.345, 0.165],
      name: "s25_gripSideClasp",
      rotation: [0, 0, -8],
      flat: true,
    },
  );
  b.part(
    new THREE.BoxGeometry(0.013, 0.041, 0.008),
    BLACK,
    {
      at: [-0.135, 0.345, 0.176],
      name: "s25_gripSideClaspInset",
      rotation: [0, 0, -8],
      flat: true,
    },
  );
  b.part(
    new THREE.SphereGeometry(0.010, 6, 4),
    GOLD_LIGHT,
    {
      at: [-0.145, 0.345, 0.180],
      name: "s25_gripSideClaspPin",
      flat: true,
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Cyan magitech cord: a dark braided sheath with a bright inner filament.

  const cordPath = catmull([
    [-0.092, 0.350, 0.225],
    [-0.112, 0.312, 0.232],
    [-0.138, 0.273, 0.238],
    [-0.142, 0.215, 0.241],
    [-0.126, 0.155, 0.239],
    [-0.094, 0.098, 0.235],
  ]);

  b.sweep(cordPath, [0.017, 0.007], {
    color: LEATHER_DARK,
    caps: "round",
    sides: 8,
    name: "s25_powerCordSheath",
  });

  const powerCord = b.sweep(cordPath, [0.010, 0.004], {
    color: CYAN,
    caps: "round",
    sides: 8,
    name: "s25_powerCordGlow",
  });
  glow(powerCord, 1.45);

  // Gold ferrules and cyan nodes break up the long cable into readable sections.
  for (let i = 0; i < 3; i++) {
    const t = 0.18 + i * 0.29;
    const p = cordPath.at(t);
    b.part(
      new THREE.CylinderGeometry(0.014, 0.014, 0.018, 8, 1),
      GOLD,
      {
        at: p,
        dir: cordPath.tangentAt(t),
        name: `s25_powerCordFerrule${i}`,
        flat: true,
      },
    );
    const node = b.part(
      new THREE.SphereGeometry(0.010, 6, 4),
      CYAN,
      {
        at: cordPath.at(Math.min(t + 0.055, 0.94)),
        name: `s25_powerCordNode${i}`,
        flat: true,
      },
    );
    glow(node, 1.2);
  }

  // End cap / tassel bead, kept above the floor beneath the pommel.
  b.part(
    new THREE.SphereGeometry(0.021, 8, 6),
    GOLD_LIGHT,
    {
      at: [-0.094, 0.098, 0.235],
      name: "s25_powerCordEndBead",
      flat: true,
    },
  );
  const endCrystal = b.part(
    new THREE.ConeGeometry(0.018, 0.038, 6, 1),
    CYAN,
    {
      at: [-0.094, 0.073, 0.235],
      dir: [0, -1, 0],
      name: "s25_powerCordEndCrystal",
      flat: true,
    },
  );
  glow(endCrystal, 1.3);
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addPommelCrystal(b: Builder) {
  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      name,
      sides: 8,
      caps: "round",
    });

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      color,
      name,
      ...options,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Suspended materia beneath the pommel. The crystal is deliberately front-biased so it remains readable beside
  // the stage-one pommel and its original hanging crystal.

  const upperLink = part(
    new THREE.TorusGeometry(0.018, 0.0055, 6, 10),
    EDGE,
    [0, 0.135, 0.258],
    "s26PommelChainUpper",
    { rotation: [0, 0, 0], flat: true },
  );

  const lowerLink = part(
    new THREE.TorusGeometry(0.018, 0.0055, 6, 10),
    EDGE,
    [0, 0.092, 0.258],
    "s26PommelChainLower",
    { rotation: [0, 90, 0], flat: true },
  );

  rod(
    "s26PommelChainStem",
    [0, 0.185, 0.255],
    [0, 0.151, 0.258],
    0.007,
    EDGE,
  );

  const chainBead = part(
    new THREE.SphereGeometry(0.012, 7, 5),
    GOLD,
    [0, 0.111, 0.26],
    "s26PommelChainBead",
    { flat: true },
  );

  const crystalBacking = part(
    new THREE.OctahedronGeometry(0.058, 0),
    CYAN_DARK,
    [0, 0.069, 0.252],
    "s26MateriaBacking",
    {
      scale: [0.8, 1.0, 0.62],
      flat: true,
    },
  );

  const crystal = part(
    new THREE.OctahedronGeometry(0.057, 0),
    CYAN,
    [0, 0.069, 0.278],
    "s26PommelCrystal",
    {
      scale: [0.78, 1.0, 0.68],
      flat: true,
    },
  );
  glow(crystal, 1.7);

  // A pair of offset faceted overlays gives the crystal a stylized internal cut instead of a plain silhouette.
  part(
    new THREE.TetrahedronGeometry(0.024, 0),
    GOLD_LIGHT,
    [-0.017, 0.092, 0.315],
    "s26MateriaFacetLeft",
    {
      scale: [0.7, 0.8, 0.28],
      flat: true,
    },
  );

  part(
    new THREE.TetrahedronGeometry(0.019, 0),
    WHITE,
    [0.018, 0.073, 0.314],
    "s26MateriaFacetHighlight",
    {
      scale: [0.6, 0.72, 0.22],
      flat: true,
    },
  );

  // Horizontal cage ring around the crystal, normal to the hanging axis.
  part(
    new THREE.TorusGeometry(0.052, 0.0065, 6, 16),
    GOLD,
    [0, 0.068, 0.27],
    "s26MateriaCageRing",
    {
      rotation: [90, 0, 0],
      flat: true,
    },
  );

  // Three-prong claw: two visible front-side arms and one upper stabilizer.
  rod(
    "s26MateriaProngL",
    [-0.036, 0.121, 0.272],
    [-0.052, 0.028, 0.276],
    0.009,
    GOLD_LIGHT,
  );
  rod(
    "s26MateriaProngR",
    [0.036, 0.121, 0.272],
    [0.052, 0.028, 0.276],
    0.009,
    GOLD_LIGHT,
  );
  rod(
    "s26MateriaProngTop",
    [0, 0.132, 0.272],
    [0, 0.104, 0.315],
    0.008,
    GOLD,
  );

  part(
    new THREE.SphereGeometry(0.012, 7, 5),
    GOLD_LIGHT,
    [-0.052, 0.028, 0.276],
    "s26MateriaClawL",
    { flat: true },
  );
  part(
    new THREE.SphereGeometry(0.012, 7, 5),
    GOLD_LIGHT,
    [0.052, 0.028, 0.276],
    "s26MateriaClawR",
    { flat: true },
  );
  part(
    new THREE.SphereGeometry(0.011, 7, 5),
    GOLD_LIGHT,
    [0, 0.104, 0.315],
    "s26MateriaClawTop",
    { flat: true },
  );

  // A tiny dark lower cap keeps the suspended ornament visually finished without touching the floor.
  part(
    new THREE.CylinderGeometry(0.018, 0.023, 0.018, 8),
    EDGE,
    [0, 0.012, 0.27],
    "s26MateriaBottomCap",
    { flat: true },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Guard-wing filigree. These rails sit just in front of the stage-one wing rods and follow their swept geometry.

  for (const side of [-1, 1]) {
    const prefix = side < 0 ? "L" : "R";

    // Dark under-rail gives the bright gold trim a crisp Final Fantasy silhouette.
    rod(
      `s26GuardUnderRail${prefix}`,
      [side * 0.16, 0.895, 0.215],
      [side * 0.48, 0.928, 0.215],
      0.014,
      EDGE,
    );

    rod(
      `s26GuardGoldRail${prefix}`,
      [side * 0.165, 0.902, 0.229],
      [side * 0.465, 0.944, 0.229],
      0.008,
      GOLD_LIGHT,
    );

    rod(
      `s26GuardGoldRailLower${prefix}`,
      [side * 0.23, 0.918, 0.237],
      [side * 0.405, 0.943, 0.237],
      0.0055,
      GOLD,
    );

    // Angular branch joining the rail back into the guard.
    rod(
      `s26GuardFiligreeBranch${prefix}`,
      [side * 0.225, 0.911, 0.238],
      [side * 0.275, 0.866, 0.238],
      0.006,
      GOLD_LIGHT,
    );

    rod(
      `s26GuardFiligreeBranchTip${prefix}`,
      [side * 0.275, 0.866, 0.238],
      [side * 0.335, 0.923, 0.238],
      0.006,
      GOLD_LIGHT,
    );

    // Repeated tiny diamond studs are the decorative rhythm along the wing.
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const x = side * (0.205 + t * 0.24);
      const y = 0.908 + t * 0.036;

      part(
        new THREE.OctahedronGeometry(0.011, 0),
        GOLD,
        [x, y, 0.242],
        `s26GuardStud${prefix}${i}`,
        {
          scale: [1.0, 0.68, 0.42],
          flat: true,
        },
      );
    }

    // Small gold socket and a glowing magenta signal lamp on each wing.
    part(
      new THREE.CylinderGeometry(0.026, 0.026, 0.014, 8),
      GOLD,
      [side * 0.362, 0.944, 0.245],
      `s26GuardSignalSocket${prefix}`,
      {
        dir: [0, 0, 1],
        flat: true,
      },
    );

    const signal = part(
      new THREE.SphereGeometry(0.017, 8, 5),
      MAGENTA,
      [side * 0.362, 0.944, 0.257],
      `s26GuardSignal${prefix}`,
      { flat: true },
    );
    glow(signal, 1.5);

    // Additional signal lens at the hinge-side end, kept smaller than the outer lamp.
    const hingeLight = part(
      new THREE.SphereGeometry(0.009, 7, 5),
      MAGENTA,
      [side * 0.225, 0.902, 0.247],
      `s26GuardHingeSignal${prefix}`,
      { flat: true },
    );
    glow(hingeLight, 1.25);

    // Dark steel arrowhead termination, aimed out along the wing.
    part(
      new THREE.ConeGeometry(0.027, 0.072, 6),
      EDGE,
      [side * 0.505, 0.949, 0.226],
      `s26GuardArrowhead${prefix}`,
      {
        dir: [side, 0.16, 0],
        flat: true,
      },
    );

    // Gold collar immediately behind each arrowhead.
    part(
      new THREE.CylinderGeometry(0.022, 0.022, 0.018, 8),
      GOLD_LIGHT,
      [side * 0.468, 0.944, 0.229],
      `s26GuardArrowCollar${prefix}`,
      {
        dir: [side, 0.16, 0],
        flat: true,
      },
    );

    // A small inset dark triangular plate makes the outside cap read as engineered rather than ornamental only.
    b.extrude(
      [
        [0, -0.018],
        [0.06, 0],
        [0, 0.018],
      ],
      {
        at: [side * 0.435, 0.939, 0.246],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.002,
        color: NAVY_DARK,
        name: `s26GuardInset${prefix}`,
        flat: true,
      },
    );
  }

  // A final pair of central gold pins visually anchors both rails into the guard block.
  part(
    new THREE.CylinderGeometry(0.018, 0.018, 0.016, 8),
    GOLD_LIGHT,
    [-0.145, 0.891, 0.246],
    "s26GuardRootPinL",
    { dir: [0, 0, 1], flat: true },
  );
  part(
    new THREE.CylinderGeometry(0.018, 0.018, 0.016, 8),
    GOLD_LIGHT,
    [0.145, 0.891, 0.246],
    "s26GuardRootPinR",
    { dir: [0, 0, 1], flat: true },
  );
}
```