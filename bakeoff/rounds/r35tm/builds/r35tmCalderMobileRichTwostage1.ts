import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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
  color: string,
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
  color: string,
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
  horizontalDisc(b, [-0.92, 2.01, -0.03], 0.265, 0.024, PALETTE.RED, "redDisc");
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
    PALETTE.YELLOW,
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
    PALETTE.BLUE,
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
