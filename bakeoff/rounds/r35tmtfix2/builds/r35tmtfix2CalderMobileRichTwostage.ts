import * as THREE from "three";
import { type Builder, type ColorInput, type Paint, createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An asymmetrical Alexander Calder-inspired hanging mobile of slender black wire, counterbalanced arms, and bold red, yellow, blue, and white abstract plates.",
};

export const PALETTE = {
  WIRE: "#17151a",
  WIRE_HIGHLIGHT: "#332d36",
  RED: "#d82d28",
  RED_DARK: "#9e1e25",
  YELLOW: "#f2bd24",
  YELLOW_DARK: "#bd8315",
  BLUE: "#1768a8",
  BLUE_DARK: "#103d73",
  WHITE: "#f0e9d8",
  ORANGE: "#ed6b2b",
  TEAL: "#2b9d9b",
  PURPLE: "#74478d",
};

const RED_DISC_PAINT = paint((p, _n, _s) => {
  const notch = p.z > 0.15 && p.x > -0.99 && p.x < -0.84;
  return notch ? PALETTE.WHITE : PALETTE.RED;
});

const BLUE_LEAF_PAINT = paint((_p, _n, s) => {
  const crescent = s[0] > 0.1 && s[1] > -0.18 && s[1] < 0.28;
  return crescent ? "#3288c1" : PALETTE.BLUE_DARK;
});

const YELLOW_FAN_PAINT = paint((_p, _n, s) => {
  if (s[0] < -0.035 && s[1] > -0.02) return PALETTE.YELLOW_DARK;
  if (s[0] > 0.035 && s[1] < 0.08) return PALETTE.ORANGE;
  return PALETTE.YELLOW;
});

export const REQUESTS = [
  {
    id: "topSuspensionLoop",
    kind: "add",
    part: "suspensionHead",
    what: "Add a small black forged suspension eye and a tiny warm brass cap above the mobile, keeping the Calder wire silhouette spare.",
    at: [0, 3.48, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.22, 0.18, 0.22],
  },
  {
    id: "upperBlueAccent",
    kind: "add",
    part: "upperArm",
    what: "Add one small cobalt-blue folded paper-like abstract petal at the upper arm's outer end, with a narrow black connector.",
    at: [1.02, 2.85, 0.02],
    normal: [0, 0, 1],
    bone: null,
    room: [0.42, 0.5, 0.08],
  },
  {
    id: "upperCounterweight",
    kind: "add",
    part: "upperArm",
    what: "Add a tiny matte yellow counterweight bead and a short black dangling pin beneath the right end of the upper arm.",
    at: [-0.93, 2.82, 0],
    normal: [0, -1, 0],
    bone: null,
    room: [0.16, 0.3, 0.16],
  },
  {
    id: "middleRedDisc",
    kind: "add",
    part: "middleArm",
    what: "Add a bold red circular Calder-style disc hanging just below the middle arm, with a black wire loop and a small offset yellow dot.",
    at: [-1.05, 2.05, 0.08],
    normal: [0, 0, 1],
    bone: null,
    room: [0.55, 0.62, 0.1],
  },
  {
    id: "middleYellowFin",
    kind: "add",
    part: "middleArm",
    what: "Add a thin mustard-yellow triangular fin to the far end of the middle arm, canted diagonally and held by one black wire.",
    at: [1.02, 2.18, 0],
    normal: [0, 0, 1],
    bone: null,
    room: [0.42, 0.5, 0.08],
  },
  {
    id: "lowerBlueLeaf",
    kind: "add",
    part: "lowerArm",
    what: "Add a large deep-blue curved leaf plate beneath the lowest arm, with one lighter blue inset crescent and a black suspension line.",
    at: [0.78, 1.0, 0.1],
    normal: [0, 0, 1],
    bone: null,
    room: [0.7, 0.85, 0.1],
  },
  {
    id: "lowerWhiteShard",
    kind: "add",
    part: "lowerArm",
    what: "Add a small off-white diamond shard at the left end of the lowest arm, floating from a thin black thread.",
    at: [-0.98, 1.25, 0],
    normal: [0, 0, 1],
    bone: null,
    room: [0.3, 0.42, 0.08],
  },
  {
    id: "orangeTail",
    kind: "add",
    part: "lowerBlueLeaf",
    what: "Add a bright orange narrow comma-shaped plate beneath the blue leaf, offset to one side so the counterweight feels deliberately unbalanced.",
    at: [0.98, 0.48, 0.05],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.55, 0.08],
  },
  {
    id: "redPlateTexture",
    kind: "texture",
    part: "redDisc",
    what: "Paint the red plate with a very simple flat vermilion field and one small cream geometric notch near its upper edge; keep the finish matte and graphic.",
  },
  {
    id: "bluePlateTexture",
    kind: "texture",
    part: "blueLeaf",
    what: "Paint the blue leaf in two flat cobalt tones: deep blue overall with one broad lighter-blue crescent following the plate's curved edge.",
  },
  {
    id: "yellowPlateTexture",
    kind: "texture",
    part: "yellowFan",
    what: "Add two broad mustard and ochre wedges to the yellow fan, with no gradients, no text, and a hand-cut paper quality.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function rod(
  b: Builder,
  a: THREE.Vector3 | [number, number, number],
  c: THREE.Vector3 | [number, number, number],
  radius = 0.012,
  color = PALETTE.WIRE,
  name?: string,
) {
  return b.rod(a, c, radius, {
    color,
    caps: "round",
    sides: 6,
    name,
    group: "wire",
  });
}

function bead(
  b: Builder,
  at: [number, number, number],
  radius: number,
  color: string | Paint,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
    at,
    name,
    group: "counterweights",
    flat: true,
  });
}

function verticalThread(
  b: Builder,
  top: [number, number, number],
  bottom: [number, number, number],
  name: string,
  radius = 0.008,
) {
  rod(b, top, bottom, radius, PALETTE.WIRE, name);
}

function plate(
  b: Builder,
  outline: [number, number][],
  at: [number, number, number],
  color: string | Paint,
  name: string,
  x: [number, number, number] = [1, 0, 0],
  y: [number, number, number] = [0, 1, 0],
  thickness = 0.018,
) {
  return b.extrude(outline, {
    at,
    x,
    y,
    thickness,
    bevel: 0.004,
    smoothing: 1,
    color,
    name,
    group: "painted-plates",
  });
}

function horizontalDisc(
  b: Builder,
  at: [number, number, number],
  radius: number,
  depth: number,
  color: string,
  name: string,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius * 0.94, depth, 12), color, {
    at,
    dir: [0, 1, 0],
    name,
    group: "painted-plates",
    flat: true,
  });
}

function smallRing(
  b: Builder,
  at: [number, number, number],
  radius: number,
  color: string,
  name: string,
) {
  return b.part(
    new THREE.TorusGeometry(radius, 0.009, 5, 12),
    color,
    {
      at,
      dir: [0, 1, 0],
      name,
      group: "wire",
      flat: true,
    },
  );
}

export default function build() {
  const b = createBuilder({ name: "calder-hanging-mobile", detail: 1 });

  const top = new THREE.Vector3(0, 3.44, 0);
  const hub = new THREE.Vector3(0, 3.12, 0);

  // Main hanging stem and the small suspension eye.
  rod(b, [0, 3.45, 0], [0, 3.16, 0], 0.018, PALETTE.WIRE, "suspensionStem");
  smallRing(b, [0, 3.51, 0], 0.055, PALETTE.WIRE, "suspensionHead");
  bead(b, [0, 3.12, 0], 0.055, PALETTE.WIRE_HIGHLIGHT, "centralHub");

  // A small collar gives the hub a crafted, hand-bent-wire character.
  b.part(new THREE.CylinderGeometry(0.09, 0.075, 0.035, 8), PALETTE.WIRE, {
    at: [0, 3.08, 0],
    dir: [0, 1, 0],
    name: "hubCollar",
    group: "wire",
    flat: true,
  });

  // Upper level: a long, slightly asymmetric horizontal balance.
  const upperPivot: [number, number, number] = [0, 3.02, 0];
  rod(b, [-0.9, 3.02, 0], [1.12, 3.02, 0.02], 0.015, PALETTE.WIRE, "upperArm");
  bead(b, [-0.86, 3.02, 0], 0.035, PALETTE.WIRE_HIGHLIGHT, "upperPivot");
  bead(b, [1.08, 3.02, 0.02], 0.026, PALETTE.WIRE, "upperTip");

  // Upper left hanging yellow plate.
  verticalThread(b, [-0.78, 3.01, 0], [-0.78, 2.58, 0], "upperYellowThread");
  plate(
    b,
    [
      [-0.16, -0.2],
      [0.06, -0.24],
      [0.22, -0.04],
      [0.11, 0.2],
      [-0.13, 0.16],
    ],
    [-0.78, 2.47, 0],
    PALETTE.YELLOW,
    "upperYellowPlate",
  );
  plate(
    b,
    [
      [-0.07, -0.12],
      [0.04, -0.13],
      [0.11, 0.01],
      [0.01, 0.1],
      [-0.08, 0.06],
    ],
    [-0.78, 2.47, 0.012],
    PALETTE.YELLOW_DARK,
    "upperYellowInset",
  );

  // Upper right suspended blue, tall and blade-like.
  verticalThread(b, [0.82, 3.02, 0.02], [0.82, 2.54, 0.02], "upperBlueThread");
  plate(
    b,
    [
      [-0.17, -0.29],
      [0.12, -0.22],
      [0.22, 0.02],
      [0.1, 0.31],
      [-0.1, 0.18],
      [-0.2, -0.06],
    ],
    [0.82, 2.36, 0.02],
    PALETTE.BLUE,
    "upperBluePlate",
  );
  rod(b, [0.82, 2.54, 0.02], [0.82, 2.53, 0.02], 0.021, PALETTE.WIRE, "upperBlueEyelet");

  // Secondary arm hangs from the upper pivot, rotated visually in depth.
  verticalThread(b, [0.08, 3.0, 0], [0.08, 2.57, 0], "middleSuspension");
  rod(b, [-1.22, 2.54, -0.03], [1.16, 2.54, 0.04], 0.014, PALETTE.WIRE, "middleArm");
  bead(b, [0.08, 2.54, 0], 0.034, PALETTE.WIRE_HIGHLIGHT, "middlePivot");

  // Large red disc on the left, with a small off-axis white tab.
  verticalThread(b, [-0.92, 2.53, -0.03], [-0.92, 2.12, -0.03], "redDiscThread");
  horizontalDisc(b, [-0.92, 2.01, -0.03], 0.265, 0.024, RED_DISC_PAINT, "redDisc");
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.032, 8), PALETTE.WHITE, {
    at: [-0.77, 2.01, 0.02],
    dir: [0, 1, 0],
    name: "redDiscTab",
    group: "painted-plates",
    flat: true,
  });
  smallRing(b, [-0.92, 2.18, -0.03], 0.035, PALETTE.WIRE, "redDiscLoop");

  // A small mustard fan on the opposite end of the middle balance.
  verticalThread(b, [0.96, 2.54, 0.04], [0.96, 2.22, 0.04], "yellowFanThread");
  plate(
    b,
    [
      [-0.2, -0.17],
      [0.18, -0.12],
      [0.27, 0.02],
      [0.12, 0.14],
      [-0.06, 0.24],
      [-0.18, 0.08],
    ],
    [0.96, 2.08, 0.04],
    YELLOW_FAN_PAINT,
    "yellowFan",
  );
  plate(
    b,
    [
      [-0.08, -0.12],
      [0.08, -0.08],
      [0.14, 0.02],
      [0.01, 0.14],
      [-0.08, 0.05],
    ],
    [0.96, 2.08, 0.055],
    PALETTE.ORANGE,
    "yellowFanInset",
  );

  // Lowest balance hangs at a diagonal, making the whole composition feel hand-balanced.
  verticalThread(b, [0.02, 2.52, 0.03], [0.02, 1.83, 0.03], "lowerSuspension");
  rod(b, [-1.13, 1.84, 0.06], [1.08, 1.84, 0.01], 0.016, PALETTE.WIRE, "lowerArm");
  bead(b, [0.02, 1.84, 0.03], 0.037, PALETTE.WIRE_HIGHLIGHT, "lowerPivot");

  // Left lower off-white diamond.
  verticalThread(b, [-0.91, 1.84, 0.06], [-0.91, 1.43, 0.06], "whiteShardThread");
  plate(
    b,
    [
      [0, -0.28],
      [0.15, -0.02],
      [0.03, 0.26],
      [-0.18, 0.02],
    ],
    [-0.91, 1.3, 0.06],
    PALETTE.WHITE,
    "whiteShard",
  );
  b.part(new THREE.SphereGeometry(0.025, 7, 5), PALETTE.YELLOW_DARK, {
    at: [-0.91, 1.3, 0.085],
    name: "whiteShardRivet",
    group: "counterweights",
    flat: true,
  });

  // Hero blue leaf on the right lower side.
  verticalThread(b, [0.77, 1.84, 0.01], [0.77, 1.32, 0.1], "blueLeafThread");
  plate(
    b,
    [
      [-0.34, -0.18],
      [-0.17, -0.36],
      [0.08, -0.3],
      [0.32, -0.03],
      [0.24, 0.22],
      [-0.04, 0.34],
      [-0.29, 0.18],
    ],
    [0.77, 0.98, 0.1],
    BLUE_LEAF_PAINT,
    "blueLeaf",
  );
  plate(
    b,
    [
      [-0.16, -0.12],
      [-0.05, -0.22],
      [0.13, -0.15],
      [0.23, 0.02],
      [0.11, 0.14],
      [-0.08, 0.19],
      [-0.2, 0.08],
    ],
    [0.77, 0.98, 0.125],
    PALETTE.BLUE_DARK,
    "blueLeafInset",
  );

  // A long orange comma counterweight below the blue leaf.
  verticalThread(b, [0.94, 0.96, 0.1], [0.94, 0.57, 0.1], "orangeTailThread");
  plate(
    b,
    [
      [-0.12, -0.28],
      [0.08, -0.24],
      [0.17, -0.06],
      [0.1, 0.18],
      [-0.02, 0.31],
      [-0.13, 0.18],
      [-0.04, 0.02],
    ],
    [0.94, 0.33, 0.1],
    PALETTE.ORANGE,
    "orangeTail",
  );

  // Tiny purple balancing tag at the lowest arm's far left end.
  verticalThread(b, [-1.03, 1.84, 0.06], [-1.03, 1.59, 0.06], "purpleTagThread");
  plate(
    b,
    [
      [-0.1, -0.13],
      [0.1, -0.08],
      [0.11, 0.13],
      [-0.06, 0.19],
      [-0.16, 0.02],
    ],
    [-1.03, 1.47, 0.06],
    PALETTE.PURPLE,
    "purpleTag",
  );

  // A few deliberately visible collars and eyelets make the wire construction legible.
  for (const p of [
    [0, 2.57, 0.03],
    [-0.92, 2.12, -0.03],
    [0.96, 2.22, 0.04],
    [0.77, 1.32, 0.1],
  ] as [number, number, number][]) {
    bead(b, p, 0.022, PALETTE.WIRE, "wireEyelet");
  }

  // Short radial stabilizer wires behind the colored elements.
  rod(b, [0.02, 2.57, 0.03], [-0.3, 2.75, -0.1], 0.007, PALETTE.WIRE_HIGHLIGHT, "stabilizerA");
  rod(b, [0.02, 1.84, 0.03], [0.42, 2.02, -0.08], 0.007, PALETTE.WIRE_HIGHLIGHT, "stabilizerB");
  rod(b, [0, 3.08, 0], [-0.42, 3.22, -0.05], 0.007, PALETTE.WIRE_HIGHLIGHT, "stabilizerC");

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addTopSuspensionLoop(b: Builder) {
  const BLACK = "#17151a";
  const BRASS = "#b87932";
  const BRASS_HIGHLIGHT = "#e0ad52";

  // A forged eye standing in the front-facing X/Y plane, so its opening reads clearly.
  b.part(
    new THREE.TorusGeometry(0.052, 0.012, 6, 14),
    BLACK,
    {
      at: [0, 3.48, 0],
      dir: [0, 0, 1],
      axis: "y",
      name: "s21ForgedSuspensionEye",
      group: "stage2-suspension",
      flat: true,
    },
  );

  // Short black neck visually joins the new eye to the existing suspension hardware.
  b.rod(
    [0, 3.485, 0],
    [0, 3.535, 0],
    0.014,
    {
      color: BLACK,
      caps: "round",
      sides: 6,
      name: "s21EyeNeck",
      group: "stage2-suspension",
    },
  );

  // Warm brass cap perched above the eye: a low faceted collar and a small domed crown.
  b.part(
    new THREE.CylinderGeometry(0.038, 0.046, 0.018, 8),
    BRASS,
    {
      at: [0, 3.548, 0],
      dir: [0, 1, 0],
      name: "s21BrassCapCollar",
      group: "stage2-suspension",
      flat: true,
    },
  );

  b.part(
    new THREE.ConeGeometry(0.031, 0.032, 8),
    BRASS_HIGHLIGHT,
    {
      at: [0, 3.573, 0],
      dir: [0, 1, 0],
      name: "s21BrassCapCrown",
      group: "stage2-suspension",
      flat: true,
    },
  );

  // Tiny dark pin through the crown gives the cap a hand-forged, assembled detail.
  b.part(
    new THREE.SphereGeometry(0.009, 6, 4),
    BLACK,
    {
      at: [0, 3.591, 0],
      name: "s21CapPin",
      group: "stage2-suspension",
      flat: true,
    },
  );
}
    return addTopSuspensionLoop;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addUpperBlueAccent(b: Builder) {
  const BLUE = PALETTE.BLUE;
  const BLUE_DARK = PALETTE.BLUE_DARK;
  const BLUE_LIGHT = "#3d8fc4";

  const attach: [number, number, number] = [1.02, 2.85, 0.02];
  const armEnd: [number, number, number] = [1.08, 3.02, 0.02];

  // The connector is intentionally visible: a bent black wire makes the new
  // paper petal feel suspended from, rather than glued onto, the balance arm.
  b.rod(armEnd, [1.055, 2.94, 0.02], 0.009, {
    color: PALETTE.WIRE,
    caps: "round",
    sides: 6,
    name: "s22_upperBlueConnector",
    group: "wire",
  });
  b.rod([1.055, 2.94, 0.02], attach, 0.007, {
    color: PALETTE.WIRE,
    caps: "round",
    sides: 6,
    name: "s22_upperBlueDrop",
    group: "wire",
  });

  // A small eyelet at the root of the folded sheet.
  b.part(new THREE.TorusGeometry(0.026, 0.006, 5, 10), PALETTE.WIRE, {
    at: [1.02, 2.85, 0.025],
    dir: [0, 0, 1],
    name: "s22_upperBlueEyelet",
    group: "wire",
    flat: true,
  });

  // Main angular petal: a hand-cut, slightly asymmetric cobalt silhouette.
  b.extrude(
    [
      [-0.15, -0.18],
      [0.025, -0.215],
      [0.17, -0.105],
      [0.19, 0.075],
      [0.085, 0.205],
      [-0.075, 0.17],
      [-0.19, 0.035],
    ],
    {
      at: [1.02, 2.85, 0.035],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 1,
      color: BLUE,
      name: "s22_upperBluePetal",
      group: "painted-plates",
    },
  );

  // Offset folded facet, raised toward the viewer so the petal reads as
  // folded paper rather than a single flat polygon.
  b.extrude(
    [
      [-0.145, -0.17],
      [0.015, -0.195],
      [0.17, -0.09],
      [0.085, 0.01],
      [-0.02, 0.115],
      [-0.16, 0.03],
    ],
    {
      at: [1.02, 2.85, 0.052],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: BLUE_DARK,
      name: "s22_upperBlueFold",
      group: "painted-plates",
    },
  );

  // A pale blue triangular flap catches the light on the opposite fold.
  b.extrude(
    [
      [0.015, -0.19],
      [0.17, -0.09],
      [0.085, 0.19],
      [-0.005, 0.105],
    ],
    {
      at: [1.02, 2.85, 0.067],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      smoothing: 1,
      color: BLUE_LIGHT,
      name: "s22_upperBlueHighlightFold",
      group: "painted-plates",
    },
  );

  // Dark crease lines emphasize the two deliberately broad folds.
  b.rod(
    [0.875, 2.68, 0.078],
    [1.10, 2.96, 0.078],
    0.006,
    {
      color: PALETTE.WIRE_HIGHLIGHT,
      caps: "round",
      sides: 5,
      name: "s22_upperBlueCreaseA",
      group: "plate-detail",
    },
  );
  b.rod(
    [1.035, 2.66, 0.081],
    [1.105, 2.94, 0.081],
    0.005,
    {
      color: PALETTE.WIRE_HIGHLIGHT,
      caps: "round",
      sides: 5,
      name: "s22_upperBlueCreaseB",
      group: "plate-detail",
    },
  );

  // Tiny cobalt rivet and a warm counter-colour bead at the hinge.
  b.part(new THREE.SphereGeometry(0.018, 7, 5), BLUE_LIGHT, {
    at: [1.02, 2.85, 0.09],
    name: "s22_upperBlueRivet",
    group: "plate-detail",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.012, 7, 5), PALETTE.YELLOW_DARK, {
    at: [1.055, 2.90, 0.094],
    name: "s22_upperBlueBrassPin",
    group: "plate-detail",
    flat: true,
  });
}
    return addUpperBlueAccent;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addUpperCounterweight(b: Builder) {
  const WIRE = PALETTE.WIRE;
  const YELLOW = PALETTE.YELLOW;
  const YELLOW_DARK = PALETTE.YELLOW_DARK;
  const RED = PALETTE.RED;
  const RED_DARK = PALETTE.RED_DARK;
  const WHITE = PALETTE.WHITE;

  // ---------------------------------------------------------------------------
  // Upper arm: a tiny handmade yellow counterweight, collar, and dangling pin.
  // The attachment point is deliberately just below the arm, leaving the
  // original arm visible as the balancing spine.
  // ---------------------------------------------------------------------------
  const upperAttach: [number, number, number] = [-0.93, 2.82, 0];

  b.part(new THREE.SphereGeometry(0.055, 9, 6), YELLOW, {
    at: upperAttach,
    name: "upperCounterweightBead",
    group: "stage2-counterweights",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.034, 8, 5), YELLOW_DARK, {
    at: [-0.93, 2.82, 0.046],
    name: "upperCounterweightCap",
    group: "stage2-counterweights",
    flat: true,
  });

  b.rod(
    [-0.93, 2.785, 0],
    [-0.93, 2.625, 0],
    0.009,
    WIRE,
    {
      caps: "round",
      sides: 6,
      name: "upperCounterweightPin",
      group: "stage2-wire",
    },
  );

  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.026, 7), WIRE, {
    at: [-0.93, 2.625, 0],
    dir: [0, 1, 0],
    name: "upperCounterweightPinTip",
    group: "stage2-wire",
    flat: true,
  });

  // A small offset brass-yellow bead makes the counterweight read as a
  // deliberately assembled Calder component rather than a plain sphere.
  b.part(new THREE.SphereGeometry(0.018, 7, 5), YELLOW_DARK, {
    at: [-0.968, 2.718, 0.014],
    name: "upperCounterweightOffsetBead",
    group: "stage2-counterweights",
    flat: true,
  });

  // ---------------------------------------------------------------------------
  // Middle red disc: enrich the existing red element with a front-facing
  // Calder-like plate, a raised rim, an offset yellow dot, and a visible wire
  // loop.  The plate is seated toward +Z, matching the supplied attachment
  // normal.
  // ---------------------------------------------------------------------------
  const discCenter: [number, number, number] = [-1.05, 2.05, 0.08];

  b.part(new THREE.CylinderGeometry(0.214, 0.214, 0.026, 16), RED, {
    at: discCenter,
    dir: [0, 0, 1],
    name: "middleRedDiscStage2",
    group: "stage2-painted-plates",
    flat: true,
  });

  // Slightly smaller inset gives the broad plate a cut-paper, layered edge.
  b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.008, 16), RED_DARK, {
    at: [-1.05, 2.05, 0.099],
    dir: [0, 0, 1],
    name: "middleRedDiscInset",
    group: "stage2-painted-plates",
    flat: true,
  });

  // Raised outer rim, kept thin so it reads as a wire-like contour rather
  // than a heavy mechanical ring.
  b.part(new THREE.TorusGeometry(0.205, 0.009, 5, 16), WIRE, {
    at: [-1.05, 2.05, 0.105],
    dir: [0, 0, 1],
    name: "middleRedDiscRim",
    group: "stage2-wire",
    flat: true,
  });

  // Offset yellow dot: intentionally not centered, as in a cut-paper mobile.
  b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.012, 10), YELLOW, {
    at: [-0.928, 2.145, 0.116],
    dir: [0, 0, 1],
    name: "middleRedDiscYellowDot",
    group: "stage2-painted-plates",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.014, 7, 5), YELLOW_DARK, {
    at: [-0.928, 2.145, 0.127],
    name: "middleRedDiscYellowDotCap",
    group: "stage2-painted-plates",
    flat: true,
  });

  // Black loop above the plate, made from three short rods so its angular,
  // hand-bent construction remains readable at low polygon count.
  b.rod(
    [-1.05, 2.19, 0.09],
    [-1.05, 2.245, 0.09],
    0.008,
    WIRE,
    {
      caps: "round",
      sides: 6,
      name: "middleRedDiscLoopStem",
      group: "stage2-wire",
    },
  );

  b.rod(
    [-1.05, 2.245, 0.09],
    [-1.105, 2.285, 0.09],
    0.008,
    WIRE,
    {
      caps: "round",
      sides: 6,
      name: "middleRedDiscLoopLeft",
      group: "stage2-wire",
    },
  );

  b.rod(
    [-1.05, 2.245, 0.09],
    [-0.995, 2.285, 0.09],
    0.008,
    WIRE,
    {
      caps: "round",
      sides: 6,
      name: "middleRedDiscLoopRight",
      group: "stage2-wire",
    },
  );

  b.rod(
    [-1.105, 2.285, 0.09],
    [-0.995, 2.285, 0.09],
    0.008,
    WIRE,
    {
      caps: "round",
      sides: 6,
      name: "middleRedDiscLoopTop",
      group: "stage2-wire",
    },
  );

  // A tiny cream triangular notch adds a hand-cut graphic accent without
  // competing with the dominant red disc.
  b.extrude(
    [
      [-0.035, -0.025],
      [0.035, -0.025],
      [0, 0.045],
    ],
    {
      at: [-1.17, 2.17, 0.122],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      color: WHITE,
      name: "middleRedDiscCreamNotch",
      group: "stage2-painted-plates",
    },
  );
}
    return addUpperCounterweight;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addMiddleYellowFin(b: Builder) {
  const YELLOW = "#f2bd24";
  const OCHRE = "#bd8315";
  const ORANGE = "#ed6b2b";
  const WIRE = "#17151a";
  const WIRE_HIGHLIGHT = "#332d36";
  const WHITE = "#f0e9d8";

  const attach: [number, number, number] = [1.02, 2.18, 0];
  const front: [number, number, number] = [0, 0, 1];

  // The single black hanger is deliberately visible, like bent sculpture wire.
  b.rod([1.02, 2.18, 0], [1.04, 2.43, 0.02], 0.009, {
    color: WIRE,
    caps: "round",
    sides: 6,
    name: "s24MiddleFinHanger",
    group: "stage2-wire",
  });

  // A second short diagonal wire braces the fin's folded root.
  b.rod([1.04, 2.43, 0.02], [0.91, 2.47, -0.015], 0.006, {
    color: WIRE_HIGHLIGHT,
    caps: "round",
    sides: 6,
    name: "s24MiddleFinBrace",
    group: "stage2-wire",
  });

  // Main hand-cut triangular fin, canted toward the suspension point.
  b.extrude(
    [
      [-0.035, -0.015],
      [0.115, -0.005],
      [0.145, 0.085],
      [0.045, 0.245, "sharp"],
      [-0.09, 0.135],
    ],
    {
      at: attach,
      x: [0.94, 0, -0.34],
      y: [0.06, 0.998, 0],
      thickness: [0.022, 0.012],
      bevel: 0.004,
      smoothing: 1,
      color: YELLOW,
      name: "s24MiddleYellowFin",
      group: "stage2-painted-plates",
    },
  );

  // Broad ochre wedge gives the otherwise flat fin a graphic, Calder-like cut-paper rhythm.
  b.extrude(
    [
      [-0.008, 0.018],
      [0.084, 0.023],
      [0.095, 0.078],
      [0.035, 0.181],
      [-0.018, 0.112],
    ],
    {
      at: [1.02, 2.18, 0.015],
      x: [0.94, 0, -0.34],
      y: [0.06, 0.998, 0],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      color: OCHRE,
      name: "s24MiddleFinOchreInset",
      group: "stage2-painted-plates",
    },
  );

  // A tiny orange slash near the shoulder makes the fin readable in profile.
  b.extrude(
    [
      [-0.025, 0.055],
      [0.008, 0.045],
      [0.058, 0.112],
      [0.045, 0.14],
    ],
    {
      at: [1.02, 2.18, 0.022],
      x: [0.94, 0, -0.34],
      y: [0.06, 0.998, 0],
      thickness: 0.004,
      bevel: 0.0015,
      color: ORANGE,
      name: "s24MiddleFinOrangeSlash",
      group: "stage2-painted-plates",
    },
  );

  // Fold line and rim wire emphasize the thin metal/paper construction.
  b.rod([0.985, 2.19, 0.035], [1.062, 2.405, 0.035], 0.005, {
    color: WIRE_HIGHLIGHT,
    caps: "round",
    sides: 5,
    name: "s24MiddleFinFold",
    group: "stage2-wire",
  });

  b.rod([0.985, 2.19, 0.025], [1.13, 2.265, 0.025], 0.0045, {
    color: WIRE,
    caps: "round",
    sides: 5,
    name: "s24MiddleFinLowerRim",
    group: "stage2-wire",
  });

  // Small eyelet bead at the attachment, with a pale face highlight.
  b.part(new THREE.SphereGeometry(0.018, 7, 5), WIRE, {
    at: [1.02, 2.18, 0.035],
    name: "s24MiddleFinEyelet",
    group: "stage2-wire",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.006, 6, 4), WHITE, {
    at: [1.013, 2.187, 0.051],
    name: "s24MiddleFinEyeletHighlight",
    group: "stage2-detail",
    flat: true,
  });

  // A tiny counterweight bead at the upper bend keeps the fin's visual mechanics legible.
  b.part(new THREE.SphereGeometry(0.022, 7, 5), OCHRE, {
    at: [1.04, 2.43, 0.02],
    name: "s24MiddleFinCounterweight",
    group: "stage2-detail",
    flat: true,
  });
}
    return addMiddleYellowFin;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addLowerBlueLeaf(b: Builder) {
  const BLUE = "#1768a8";
  const DEEP_BLUE = "#103d73";
  const LIGHT_BLUE = "#4aa6d8";
  const PALE_BLUE = "#8cc9df";
  const INK = "#17151a";

  const center: [number, number, number] = [0.77, 0.98, 0.138];

  const plate = (
    outline: [number, number][],
    at: [number, number, number],
    color: string,
    name: string,
    thickness = 0.008,
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: 0.0025,
      smoothing: 1,
      color,
      name,
      group: "stage2-lower-blue-leaf",
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
      sides: 6,
      name,
      group: "stage2-lower-blue-leaf",
    });

  // A thin, darker cut-paper silhouette sits just in front of the original blue plate,
  // making the leaf's irregular edge read clearly from a distance.
  plate(
    [
      [-0.31, -0.16],
      [-0.21, -0.34],
      [0.02, -0.30],
      [0.25, -0.10],
      [0.30, 0.07],
      [0.20, 0.23],
      [-0.04, 0.32],
      [-0.27, 0.17],
    ],
    [center[0], center[1], center[2] - 0.006],
    DEEP_BLUE,
    "s25LeafShadowSilhouette",
    0.006,
  );

  // Main blue face, deliberately offset a little to expose the dark rim as a hand-cut border.
  plate(
    [
      [-0.29, -0.15],
      [-0.18, -0.30],
      [0.04, -0.27],
      [0.27, -0.06],
      [0.25, 0.10],
      [0.15, 0.22],
      [-0.05, 0.29],
      [-0.25, 0.14],
    ],
    center,
    BLUE,
    "s25LeafFace",
    0.009,
  );

  // Broad lighter-blue crescent inset, following the leaf's upper/right sweep.
  plate(
    [
      [-0.20, -0.03],
      [-0.16, 0.10],
      [-0.06, 0.20],
      [0.08, 0.23],
      [0.20, 0.15],
      [0.24, 0.02],
      [0.18, -0.10],
      [0.06, -0.14],
      [-0.02, -0.08],
      [0.07, -0.02],
      [0.12, 0.06],
      [0.05, 0.13],
      [-0.06, 0.11],
      [-0.13, 0.03],
    ],
    [center[0], center[1], center[2] + 0.008],
    LIGHT_BLUE,
    "s25LeafCrescent",
    0.006,
  );

  // A small pale triangular glint breaks up the large crescent without becoming shiny.
  plate(
    [
      [-0.13, 0.17],
      [-0.05, 0.22],
      [-0.08, 0.09],
      [-0.17, 0.05],
    ],
    [center[0], center[1], center[2] + 0.015],
    PALE_BLUE,
    "s25LeafGlint",
    0.004,
  );

  // Central raised midrib, segmented so it retains Calder's primitive, assembled quality.
  const z = center[2] + 0.021;
  rod([0.55, 0.82, z], [0.68, 0.93, z], 0.009, INK, "s25LeafMidribLower");
  rod([0.68, 0.93, z], [0.82, 1.05, z], 0.009, INK, "s25LeafMidribMiddle");
  rod([0.82, 1.05, z], [0.98, 1.17, z], 0.008, INK, "s25LeafMidribUpper");

  // Blue overlays soften the heavy black line in places, creating a drawn-and-built vein.
  rod([0.59, 0.85, z + 0.006], [0.69, 0.94, z + 0.006], 0.004, LIGHT_BLUE, "s25LeafMidribPaintLower");
  rod([0.72, 0.97, z + 0.006], [0.81, 1.05, z + 0.006], 0.004, LIGHT_BLUE, "s25LeafMidribPaintUpper");

  // Short diagonal veins radiate into both sides of the leaf.
  const veins: Array<
    [[number, number, number], [number, number, number], string]
  > = [
    [[0.67, 0.92, z], [0.55, 1.02, z], "s25LeafVeinL1"],
    [[0.74, 0.99, z], [0.57, 1.10, z], "s25LeafVeinL2"],
    [[0.82, 1.06, z], [0.65, 1.20, z], "s25LeafVeinL3"],
    [[0.88, 1.10, z], [0.80, 1.25, z], "s25LeafVeinL4"],
    [[0.69, 0.94, z], [0.78, 0.83, z], "s25LeafVeinR1"],
    [[0.77, 1.01, z], [0.91, 0.91, z], "s25LeafVeinR2"],
    [[0.84, 1.07, z], [1.01, 1.02, z], "s25LeafVeinR3"],
    [[0.90, 1.12, z], [1.04, 1.15, z], "s25LeafVeinR4"],
  ];

  for (const [a, c, name] of veins) {
    rod(a, c, 0.0048, DEEP_BLUE, name);
  }

  // Three tiny pale-blue vein tips add a graphic rhythm to the crescent edge.
  for (const [x, y, name] of [
    [0.57, 1.10, "s25LeafTipL"],
    [0.91, 0.91, "s25LeafTipR"],
    [1.01, 1.02, "s25LeafTipFar"],
  ] as [number, number, string][]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), PALE_BLUE, {
      at: [x, y, z + 0.008],
      name,
      group: "stage2-lower-blue-leaf",
      flat: true,
    });
  }

  // A compact black collar and a second, slightly offset suspension filament seat the
  // ornament to the existing lower arm rather than leaving the leaf visually weightless.
  b.part(new THREE.CylinderGeometry(0.028, 0.024, 0.022, 8), INK, {
    at: [0.77, 1.285, 0.10],
    dir: [0, 1, 0],
    name: "s25LeafHangingCollar",
    group: "stage2-lower-blue-leaf",
    flat: true,
  });

  rod(
    [0.77, 1.30, 0.10],
    [0.77, 1.39, 0.10],
    0.006,
    INK,
    "s25LeafSuspensionLine",
  );

  // A tiny geometric rivet at the lower end of the midrib.
  b.part(new THREE.SphereGeometry(0.018, 7, 4), LIGHT_BLUE, {
    at: [0.55, 0.82, z + 0.012],
    name: "s25LeafRootRivet",
    group: "stage2-lower-blue-leaf",
    flat: true,
  });
}
    return addLowerBlueLeaf;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addLowerWhiteShard(b: Builder) {
  const WIRE = "#17151a";
  const WHITE = "#f0e9d8";
  const WHITE_SHADE = "#c9c1ad";
  const ORANGE = "#ed6b2b";
  const ORANGE_DARK = "#a94322";
  const YELLOW = "#f2bd24";

  // The request point is the eyelet on the lowest balance. Add a second,
  // clearly visible hand-bent suspension segment rather than hiding it inside
  // the already-built stage-one thread.
  b.rod(
    [-0.98, 1.25, 0],
    [-0.98, 1.17, 0.012],
    0.006,
    { color: WIRE, caps: "round", sides: 6, name: "s26_white_upper_thread", group: "s26-details" },
  );

  b.part(new THREE.TorusGeometry(0.027, 0.006, 5, 10), WIRE, {
    at: [-0.98, 1.155, 0.014],
    dir: [0, 0, 1],
    name: "s26_white_eyelet",
    group: "s26-details",
    flat: true,
  });

  // Off-white shard: a crisp, slightly skewed diamond with a clipped corner.
  b.extrude(
    [
      [-0.045, -0.18],
      [0.105, -0.045],
      [0.075, 0.145],
      [-0.025, 0.19],
      [-0.135, 0.015],
    ],
    {
      at: [-0.98, 1.04, 0.018],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.024,
      bevel: 0.004,
      smoothing: 0,
      color: WHITE,
      name: "s26_white_shard",
      group: "s26-details",
    },
  );

  // A narrow shadow facet makes the plate read as folded paper rather than a
  // generic flat polygon.
  b.extrude(
    [
      [-0.025, -0.145],
      [0.075, -0.04],
      [0.052, 0.102],
      [-0.005, 0.13],
    ],
    {
      at: [-0.98, 1.04, 0.034],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 0,
      color: WHITE_SHADE,
      name: "s26_white_fold",
      group: "s26-details",
    },
  );

  // Tiny warm rivet and a black edge stitch supply a Calder-like crafted
  // counterweight detail without filling the intentionally open silhouette.
  b.part(new THREE.SphereGeometry(0.018, 7, 5), YELLOW, {
    at: [-1.015, 1.105, 0.052],
    name: "s26_white_rivet",
    group: "s26-details",
    flat: true,
  });
  b.rod(
    [-1.105, 1.025, 0.05],
    [-1.04, 0.935, 0.05],
    0.0045,
    { color: WIRE, caps: "round", sides: 5, name: "s26_white_tail_wire", group: "s26-details" },
  );

  // Orange comma-shaped counterweight. It stays within the requested clear
  // room and is offset from the blue leaf's centreline.
  b.rod(
    [0.98, 0.48, 0.05],
    [0.98, 0.415, 0.065],
    0.006,
    { color: WIRE, caps: "round", sides: 6, name: "s26_orange_thread", group: "s26-details" },
  );

  b.part(new THREE.TorusGeometry(0.025, 0.006, 5, 10), WIRE, {
    at: [0.98, 0.405, 0.067],
    dir: [0, 0, 1],
    name: "s26_orange_eyelet",
    group: "s26-details",
    flat: true,
  });

  b.extrude(
    [
      [-0.075, -0.22],
      [0.035, -0.205],
      [0.105, -0.085],
      [0.088, 0.075],
      [0.018, 0.19],
      [-0.07, 0.12],
      [-0.025, 0.005],
      [-0.095, -0.09],
    ],
    {
      at: [0.98, 0.205, 0.072],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      smoothing: 0,
      color: ORANGE,
      name: "s26_orange_comma",
      group: "s26-details",
    },
  );

  // Offset ochre facet follows the comma's bend and gives it a hand-cut,
  // two-tone graphic face.
  b.extrude(
    [
      [-0.028, -0.165],
      [0.028, -0.15],
      [0.067, -0.065],
      [0.045, 0.035],
      [0.005, 0.105],
      [-0.02, 0.035],
      [0.025, -0.045],
    ],
    {
      at: [0.98, 0.205, 0.089],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 0,
      color: ORANGE_DARK,
      name: "s26_orange_fold",
      group: "s26-details",
    },
  );

  // A single bright rivet near the root visually ties this lower piece to
  // the yellow and white counterweights elsewhere in the mobile.
  b.part(new THREE.SphereGeometry(0.019, 7, 5), YELLOW, {
    at: [0.946, 0.285, 0.108],
    name: "s26_orange_rivet",
    group: "s26-details",
    flat: true,
  });

  // Two short black edge strokes accent the comma's hook without becoming a
  // full outline or making the plate visually heavy.
  b.rod(
    [0.91, 0.115, 0.1],
    [0.955, 0.075, 0.1],
    0.004,
    { color: WIRE, caps: "round", sides: 5, name: "s26_orange_edge_a", group: "s26-details" },
  );
  b.rod(
    [1.045, 0.28, 0.1],
    [1.075, 0.34, 0.1],
    0.004,
    { color: WIRE, caps: "round", sides: 5, name: "s26_orange_edge_b", group: "s26-details" },
  );
}
    return addLowerWhiteShard;
  })(),
);
