import * as THREE from "three";
import { createBuilder, polyline, svg } from "../../../../src/index";

export const meta = {
  name: "calder-hanging-mobile",
  description:
    "A stylized Alexander Calder-inspired hanging mobile with black balancing wires, asymmetrical rods, and colorful low-poly biomorphic plates.",
};

type P = [number, number, number];
type Outline = [number, number][];

const WIRE = "#171821";
const WIRE_HIGHLIGHT = "#343440";
const RED = "#df3d35";
const BLUE = "#2859c7";
const YELLOW = "#f3c522";
const ORANGE = "#ed752f";
const TEAL = "#1ca6a0";
const MAGENTA = "#c94788";
const CREAM = "#f1dfbd";
const PURPLE = "#67449b";
const PALE_BLUE = "#75b7cc";
const BRASS = "#b78835";
const CHARCOAL = "#24242b";

const DOTS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="22" cy="25" r="10" fill="#f2c52a"/>
    <circle cx="70" cy="22" r="7" fill="#171821"/>
    <circle cx="46" cy="53" r="13" fill="#f5e4bd"/>
    <circle cx="82" cy="72" r="11" fill="#171821"/>
    <circle cx="18" cy="80" r="6" fill="#ef7130"/>
  </svg>`,
  { size: 160 },
);

const RAYS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M50 50 L50 4 M50 50 L79 10 M50 50 L96 35 M50 50 L91 66 M50 50 L72 95 M50 50 L31 96 M50 50 L5 78 M50 50 L4 40 M50 50 L23 8"
      stroke="#171821" stroke-width="6" stroke-linecap="round" fill="none"/>
    <circle cx="50" cy="50" r="10" fill="#f3c522"/>
  </svg>`,
  { size: 160 },
);

const WAVES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M-5 28 Q12 8 29 28 T63 28 T103 28" stroke="#f1dfbd" stroke-width="9" fill="none"/>
    <path d="M-5 56 Q12 36 29 56 T63 56 T103 56" stroke="#171821" stroke-width="6" fill="none"/>
    <path d="M-5 84 Q12 64 29 84 T63 84 T103 84" stroke="#f3c522" stroke-width="8" fill="none"/>
  </svg>`,
  { size: 160 },
);

const TARGET = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="42" fill="#f1dfbd" stroke="#171821" stroke-width="6"/>
    <circle cx="50" cy="50" r="29" fill="#df3d35" stroke="#171821" stroke-width="5"/>
    <circle cx="50" cy="50" r="15" fill="#2859c7" stroke="#171821" stroke-width="4"/>
    <circle cx="50" cy="50" r="5" fill="#f3c522"/>
  </svg>`,
  { size: 160 },
);

const SLASHES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M-15 88 L35 -12 M15 112 L65 12 M45 112 L95 12 M75 112 L125 12"
      stroke="#171821" stroke-width="10" stroke-linecap="round"/>
    <circle cx="21" cy="26" r="7" fill="#f3c522"/>
    <circle cx="77" cy="78" r="7" fill="#ed752f"/>
  </svg>`,
  { size: 160 },
);

const LOOPS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M16 50 C16 19 84 19 84 50 C84 81 16 81 16 50Z"
      fill="none" stroke="#171821" stroke-width="8"/>
    <path d="M31 50 C31 34 69 34 69 50 C69 66 31 66 31 50Z"
      fill="none" stroke="#f1dfbd" stroke-width="8"/>
    <circle cx="50" cy="50" r="7" fill="#f3c522"/>
  </svg>`,
  { size: 160 },
);

const CHECKS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M0 0 H25 V25 H0ZM50 0 H75 V25 H50ZM25 25 H50 V50 H25ZM75 25 H100 V50 H75ZM0 50 H25 V75 H0ZM50 50 H75 V75 H50ZM25 75 H50 V100 H25ZM75 75 H100 V100 H75Z"
      fill="#f1dfbd"/>
    <path d="M25 0 H50 V25 H25ZM75 0 H100 V25 H75ZM0 25 H25 V50 H0ZM50 25 H75 V50 H50ZM25 50 H50 V75 H25ZM75 50 H100 V75 H75ZM0 75 H25 V100 H0ZM50 75 H75 V100 H50Z"
      fill="#171821"/>
  </svg>`,
  { size: 160 },
);

function localPoint(center: P, x: number, y: number, angleDeg = 0, zOffset = 0): P {
  const a = (angleDeg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    center[0] + x * c - y * s,
    center[1] + x * s + y * c,
    center[2] + zOffset,
  ];
}

function add(a: P, b: P): P {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export default function build() {
  const b = createBuilder({ name: "calder-hanging-mobile", detail: 1 });

  let wireId = 0;
  let beadId = 0;
  let accentId = 0;

  function wire(a: P, c: P, radius = 0.0045, color = WIRE, label = "wire") {
    wireId++;
    return b.rod(a, c, radius, {
      color,
      caps: "round",
      section: { ngon: 6 },
      name: `${label}_${wireId}`,
      group: "black-wire",
    });
  }

  function bead(p: P, radius = 0.012, color = BRASS, label = "counterweight") {
    beadId++;
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      name: `${label}_${beadId}`,
      group: "wire-fittings",
      flat: true,
    });
  }

  function bar(a: P, c: P, label: string, radius = 0.007) {
    wire(a, c, radius, WIRE, label);
    bead(a, 0.011, CHARCOAL, `${label}_end`);
    bead(c, 0.011, CHARCOAL, `${label}_end`);
  }

  type Plate = {
    center: P;
    angle: number;
    thickness: number;
    width: number;
    height: number;
  };

  function plate(
    name: string,
    center: P,
    outline: Outline,
    color: string,
    angle: number,
    texture?: THREE.Texture,
    textureSize?: [number, number],
    thickness = 0.018,
  ): Plate {
    const radians = (angle * Math.PI) / 180;
    const x: P = [Math.cos(radians), Math.sin(radians), 0];
    const y: P = [-Math.sin(radians), Math.cos(radians), 0];

    b.extrude(outline, {
      at: center,
      x,
      y,
      thickness,
      bevel: 0.004,
      smoothing: 0,
      color,
      name: `${name}_metal`,
      group: "painted-plates",
    });

    let width = 0;
    let height = 0;
    for (const [px, py] of outline) {
      width = Math.max(width, Math.abs(px) * 2);
      height = Math.max(height, Math.abs(py) * 2);
    }

    if (texture) {
      const size = textureSize ?? [width * 0.78, height * 0.78];
      b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
        at: [center[0], center[1], center[2] + thickness / 2 + 0.003],
        rotation: [0, 0, angle],
        texture,
        name: `${name}_paint`,
        group: "graphic-inlays",
      });
    }

    return { center, angle, thickness, width, height };
  }

  function frontPoint(plateRef: Plate, x: number, y: number, lift = 0.012): P {
    return localPoint(
      plateRef.center,
      x,
      y,
      plateRef.angle,
      plateRef.thickness / 2 + lift,
    );
  }

  function frontDot(
    plateRef: Plate,
    x: number,
    y: number,
    radius: number,
    color: string,
    lift = 0.014,
  ) {
    accentId++;
    b.part(new THREE.CylinderGeometry(radius, radius, 0.008, 10), color, {
      at: frontPoint(plateRef, x, y, lift),
      dir: [0, 0, 1],
      name: `accent_dot_${accentId}`,
      group: "plate-accents",
      flat: true,
    });
  }

  function frontLine(
    plateRef: Plate,
    a: [number, number],
    c: [number, number],
    color = WIRE,
    radius = 0.003,
    lift = 0.017,
  ) {
    accentId++;
    wire(
      frontPoint(plateRef, a[0], a[1], lift),
      frontPoint(plateRef, c[0], c[1], lift),
      radius,
      color,
      `plate_line_${accentId}`,
    );
  }

  function hangingString(
    from: P,
    to: P,
    label: string,
    withKnot = true,
  ) {
    wire(from, to, 0.0032, WIRE_HIGHLIGHT, label);
    if (withKnot) bead(to, 0.009, CHARCOAL, `${label}_knot`);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Suspension and main balancing structure.

  const topY = 2.48;
  const topRingPoints: P[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    topRingPoints.push([Math.cos(a) * 0.064, topY, Math.sin(a) * 0.064]);
  }
  b.sweep(polyline(topRingPoints, { closed: true }), 0.0055, {
    color: WIRE,
    caps: "none",
    section: { ngon: 6 },
    name: "suspension_loop",
    group: "black-wire",
  });

  b.part(new THREE.TorusGeometry(0.064, 0.006, 6, 16), BRASS, {
    at: [0, topY, 0],
    name: "brass_hanging_eye",
    group: "wire-fittings",
    flat: true,
  });

  wire([0, topY - 0.01, 0], [0, 2.21, 0], 0.006, WIRE, "main_hanger");
  bead([0, 2.205, 0], 0.016, BRASS, "top_pivot");

  const topLeft: P = [-0.56, 2.21, 0];
  const topRight: P = [0.50, 2.245, 0.025];
  const topPivot: P = [0.005, 2.225, 0.01];
  bar(topLeft, topRight, "upper_balance_bar", 0.008);
  wire(topPivot, [0, 2.21, 0], 0.005, WIRE, "upper_pivot_stem");
  bead(topPivot, 0.015, BRASS, "upper_balance_pivot");

  // -------------------------------------------------------------------------------------------------------------
  // Main biomorphic metal sheets.

  const redDrop = plate(
    "red_drop",
    [-0.60, 1.82, -0.015],
    [
      [-0.035, 0.205],
      [0.105, 0.145],
      [0.175, 0.015],
      [0.12, -0.145],
      [-0.015, -0.205],
      [-0.145, -0.095],
      [-0.17, 0.075],
    ],
    RED,
    -12,
    DOTS,
    [0.245, 0.34],
  );

  const blueCrescent = plate(
    "blue_crescent",
    [0.62, 1.77, 0.025],
    [
      [-0.17, 0.17],
      [-0.005, 0.19],
      [0.125, 0.115],
      [0.16, 0.005],
      [0.11, -0.13],
      [-0.035, -0.19],
      [-0.15, -0.13],
      [-0.08, -0.035],
      [-0.015, 0.055],
    ],
    BLUE,
    17,
    WAVES,
    [0.27, 0.31],
  );

  const creamSail = plate(
    "cream_sail",
    [-0.19, 2.015, -0.05],
    [
      [-0.115, 0.015],
      [-0.07, 0.095],
      [0.06, 0.115],
      [0.135, 0.035],
      [0.09, -0.065],
      [-0.035, -0.105],
      [-0.13, -0.055],
    ],
    CREAM,
    -28,
    LOOPS,
    [0.22, 0.18],
  );

  const orangeLeaf = plate(
    "orange_leaf",
    [-0.47, 1.30, -0.045],
    [
      [-0.025, 0.225],
      [0.13, 0.11],
      [0.13, -0.045],
      [0.02, -0.205],
      [-0.12, -0.10],
      [-0.15, 0.065],
    ],
    ORANGE,
    18,
    SLASHES,
    [0.24, 0.34],
  );

  const tealBlade = plate(
    "teal_blade",
    [0.48, 1.24, 0.035],
    [
      [-0.185, 0.105],
      [-0.01, 0.215],
      [0.16, 0.065],
      [0.13, -0.13],
      [-0.045, -0.19],
      [-0.18, -0.045],
    ],
    TEAL,
    -24,
    RAYS,
    [0.28, 0.31],
  );

  const magentaOval = plate(
    "magenta_oval",
    [0.09, 1.49, 0.01],
    [
      [-0.13, 0.10],
      [-0.04, 0.17],
      [0.105, 0.14],
      [0.16, 0],
      [0.09, -0.15],
      [-0.045, -0.17],
      [-0.145, -0.065],
    ],
    MAGENTA,
    9,
    CHECKS,
    [0.25, 0.25],
  );

  const yellowSwoop = plate(
    "yellow_swoop",
    [-0.37, 0.74, 0.055],
    [
      [-0.155, 0.13],
      [-0.02, 0.205],
      [0.145, 0.12],
      [0.12, 0.005],
      [0.035, -0.115],
      [-0.115, -0.145],
      [-0.075, -0.025],
    ],
    YELLOW,
    -18,
    TARGET,
    [0.25, 0.27],
  );

  const cobaltDiamond = plate(
    "cobalt_diamond",
    [0.43, 0.78, 0.085],
    [
      [-0.015, 0.225],
      [0.155, 0.055],
      [0.09, -0.17],
      [-0.06, -0.205],
      [-0.16, -0.02],
    ],
    BLUE,
    23,
    DOTS,
    [0.23, 0.29],
  );

  const orangeFan = plate(
    "orange_fan",
    [0.02, 1.00, -0.075],
    [
      [-0.175, 0.12],
      [-0.01, 0.21],
      [0.19, 0.10],
      [0.145, -0.09],
      [-0.005, -0.175],
      [-0.18, -0.045],
    ],
    ORANGE,
    33,
    RAYS,
    [0.3, 0.29],
  );

  const ivoryPebble = plate(
    "ivory_pebble",
    [-0.74, 1.39, -0.09],
    [
      [-0.11, 0.07],
      [-0.025, 0.115],
      [0.105, 0.065],
      [0.12, -0.04],
      [0.025, -0.105],
      [-0.10, -0.065],
    ],
    CREAM,
    -31,
    SLASHES,
    [0.20, 0.18],
  );

  const smallRed = plate(
    "small_red_leaf",
    [0.80, 1.39, 0.105],
    [
      [-0.075, 0.10],
      [0.065, 0.055],
      [0.085, -0.08],
      [-0.02, -0.13],
      [-0.095, -0.035],
    ],
    RED,
    28,
    LOOPS,
    [0.16, 0.17],
  );

  const tealChip = plate(
    "teal_chip",
    [-0.64, 0.98, 0.13],
    [
      [-0.07, 0.095],
      [0.08, 0.065],
      [0.09, -0.055],
      [-0.01, -0.10],
      [-0.09, -0.02],
    ],
    TEAL,
    -35,
    TARGET,
    [0.15, 0.16],
  );

  const paleBlueDrop = plate(
    "pale_blue_drop",
    [0.68, 0.98, 0.14],
    [
      [-0.03, 0.13],
      [0.105, 0.04],
      [0.065, -0.105],
      [-0.055, -0.13],
      [-0.11, 0.005],
    ],
    PALE_BLUE,
    24,
    CHECKS,
    [0.17, 0.19],
  );

  const purpleBottom = plate(
    "purple_bottom",
    [0.055, 0.55, -0.045],
    [
      [-0.08, 0.16],
      [0.07, 0.18],
      [0.13, 0.04],
      [0.09, -0.13],
      [-0.015, -0.205],
      [-0.11, -0.09],
    ],
    PURPLE,
    -8,
    WAVES,
    [0.19, 0.29],
  );

  // -------------------------------------------------------------------------------------------------------------
  // Suspension strings and the second balancing tier.

  hangingString(topLeft, frontPoint(redDrop, 0, 0.19, -0.02), "red_drop_string");
  hangingString(
    topRight,
    frontPoint(blueCrescent, -0.015, 0.18, -0.015),
    "blue_crescent_string",
  );

  wire([0.005, 2.225, 0.01], [0.01, 1.84, -0.015], 0.0045, WIRE, "middle_drop_string");
  bead([0.01, 1.84, -0.015], 0.014, BRASS, "middle_pivot");

  const middleLeft: P = [-0.49, 1.83, -0.04];
  const middleRight: P = [0.49, 1.77, -0.035];
  bar(middleLeft, middleRight, "middle_balance_bar", 0.007);

  hangingString(
    middleLeft,
    frontPoint(orangeLeaf, -0.015, 0.20, -0.012),
    "orange_leaf_string",
  );
  hangingString(
    middleRight,
    frontPoint(tealBlade, -0.01, 0.19, -0.015),
    "teal_blade_string",
  );

  hangingString(
    [0.01, 1.84, -0.015],
    frontPoint(magentaOval, 0.0, 0.17, -0.015),
    "magenta_center_string",
  );

  hangingString(
    [-0.49, 1.83, -0.04],
    frontPoint(ivoryPebble, 0.0, 0.10, -0.01),
    "ivory_side_string",
  );
  hangingString(
    [0.49, 1.77, -0.035],
    frontPoint(smallRed, 0.0, 0.10, -0.01),
    "small_red_side_string",
  );

  // Third balancing bar, suspended from the magenta plate.
  const lowerPivot: P = [0.02, 1.355, 0.045];
  hangingString(
    frontPoint(magentaOval, 0, -0.17, -0.02),
    lowerPivot,
    "lower_tier_string",
  );
  bead(lowerPivot, 0.014, BRASS, "lower_pivot");

  const lowerLeft: P = [-0.43, 1.34, 0.06];
  const lowerRight: P = [0.46, 1.39, 0.06];
  bar(lowerLeft, lowerRight, "lower_balance_bar", 0.007);

  hangingString(
    lowerLeft,
    frontPoint(yellowSwoop, 0, 0.19, -0.01),
    "yellow_swoop_string",
  );
  hangingString(
    lowerRight,
    frontPoint(cobaltDiamond, -0.01, 0.20, -0.01),
    "cobalt_diamond_string",
  );

  hangingString(
    lowerPivot,
    frontPoint(orangeFan, 0, 0.20, -0.012),
    "orange_fan_string",
  );
  hangingString(
    lowerPivot,
    frontPoint(purpleBottom, 0, 0.16, -0.018),
    "purple_bottom_string",
  );

  // -------------------------------------------------------------------------------------------------------------
  // Small articulated counterweight bars, giving the mobile its characteristic asymmetry.

  const redBranchA: P = [-0.60, 1.64, -0.01];
  const redBranchB: P = [-0.84, 1.57, -0.025];
  wire(frontPoint(redDrop, 0, -0.18, -0.02), redBranchA, 0.003, WIRE, "red_branch_stem");
  bar(redBranchA, redBranchB, "red_branch_bar", 0.0055);
  bead(redBranchA, 0.010, BRASS, "red_branch_pivot");

  const creamChip = plate(
    "cream_branch_chip",
    [-0.89, 1.40, -0.035],
    [
      [-0.07, 0.09],
      [0.07, 0.07],
      [0.085, -0.05],
      [-0.005, -0.10],
      [-0.085, -0.025],
    ],
    CREAM,
    14,
    TARGET,
    [0.14, 0.15],
  );
  hangingString(
    redBranchB,
    frontPoint(creamChip, 0, 0.09, -0.01),
    "cream_branch_string",
  );

  const blueBranchA: P = [0.64, 1.58, 0.025];
  const blueBranchB: P = [0.86, 1.49, 0.0];
  wire(frontPoint(blueCrescent, 0, -0.18, -0.02), blueBranchA, 0.003, WIRE, "blue_branch_stem");
  bar(blueBranchA, blueBranchB, "blue_branch_bar", 0.0055);
  bead(blueBranchA, 0.010, BRASS, "blue_branch_pivot");

  const yellowChip = plate(
    "yellow_branch_chip",
    [0.91, 1.31, 0.025],
    [
      [-0.08, 0.055],
      [-0.025, 0.105],
      [0.08, 0.06],
      [0.075, -0.06],
      [-0.03, -0.10],
      [-0.09, -0.035],
    ],
    YELLOW,
    -20,
    SLASHES,
    [0.16, 0.15],
  );
  hangingString(
    blueBranchB,
    frontPoint(yellowChip, 0, 0.10, -0.01),
    "yellow_branch_string",
  );

  const orangeBranchA: P = [-0.47, 1.08, -0.045];
  const orangeBranchB: P = [-0.67, 1.01, 0.015];
  wire(frontPoint(orangeLeaf, 0, -0.20, -0.018), orangeBranchA, 0.003, WIRE, "orange_branch_stem");
  bar(orangeBranchA, orangeBranchB, "orange_branch_bar", 0.005);
  bead(orangeBranchA, 0.009, BRASS, "orange_branch_pivot");
  hangingString(
    orangeBranchB,
    frontPoint(tealChip, 0, 0.095, -0.012),
    "teal_chip_string",
  );

  const tealBranchA: P = [0.48, 1.02, 0.035];
  const tealBranchB: P = [0.70, 0.96, -0.01];
  wire(frontPoint(tealBlade, 0, -0.18, -0.018), tealBranchA, 0.003, WIRE, "teal_branch_stem");
  bar(tealBranchA, tealBranchB, "teal_branch_bar", 0.005);
  bead(tealBranchA, 0.009, BRASS, "teal_branch_pivot");
  hangingString(
    tealBranchB,
    frontPoint(paleBlueDrop, 0, 0.12, -0.01),
    "pale_blue_string",
  );

  // A final offset bar under the lower tier.
  const bottomBranchA: P = [0.03, 0.79, -0.04];
  const bottomBranchB: P = [0.28, 0.72, 0.025];
  wire(frontPoint(orangeFan, 0, -0.18, -0.02), bottomBranchA, 0.003, WIRE, "bottom_branch_stem");
  bar(bottomBranchA, bottomBranchB, "bottom_branch_bar", 0.0055);
  bead(bottomBranchA, 0.009, BRASS, "bottom_branch_pivot");

  const tinyPurple = plate(
    "tiny_purple_leaf",
    [0.40, 0.61, 0.02],
    [
      [-0.055, 0.085],
      [0.07, 0.045],
      [0.05, -0.075],
      [-0.035, -0.09],
      [-0.075, -0.01],
    ],
    PURPLE,
    21,
    DOTS,
    [0.13, 0.14],
  );
  hangingString(
    bottomBranchB,
    frontPoint(tinyPurple, 0, 0.08, -0.01),
    "tiny_purple_string",
  );

  // -------------------------------------------------------------------------------------------------------------
  // Graphic accents on the plates. These make the simple geometry feel hand-painted and Calder-like.

  frontDot(redDrop, -0.075, 0.07, 0.031, YELLOW);
  frontDot(redDrop, 0.055, -0.095, 0.023, CHARCOAL);
  frontLine(redDrop, [-0.10, -0.04], [0.09, 0.10], CHARCOAL, 0.0035);

  frontDot(blueCrescent, 0.055, 0.075, 0.025, YELLOW);
  frontDot(blueCrescent, -0.085, -0.09, 0.02, CREAM);
  frontLine(blueCrescent, [-0.11, 0.00], [0.08, -0.12], WIRE, 0.003);

  frontDot(creamSail, -0.035, 0.03, 0.018, RED);
  frontDot(creamSail, 0.065, -0.035, 0.014, BLUE);
  frontLine(creamSail, [-0.09, -0.02], [0.085, 0.07], WIRE, 0.0028);

  frontDot(orangeLeaf, -0.055, 0.055, 0.024, BLUE);
  frontDot(orangeLeaf, 0.07, -0.09, 0.018, CREAM);
  frontLine(orangeLeaf, [-0.08, -0.12], [0.09, 0.14], CHARCOAL, 0.003);

  frontDot(tealBlade, 0.04, 0.09, 0.024, RED);
  frontDot(tealBlade, -0.08, -0.07, 0.018, YELLOW);
  frontLine(tealBlade, [-0.13, -0.08], [0.12, 0.13], WIRE, 0.003);

  frontDot(magentaOval, -0.05, 0.05, 0.026, YELLOW);
  frontDot(magentaOval, 0.065, -0.055, 0.019, TEAL);
  frontLine(magentaOval, [-0.10, -0.015], [0.10, 0.08], CHARCOAL, 0.003);

  frontDot(yellowSwoop, -0.055, 0.065, 0.024, BLUE);
  frontDot(yellowSwoop, 0.07, -0.06, 0.019, RED);
  frontLine(yellowSwoop, [-0.10, -0.04], [0.08, 0.12], WIRE, 0.003);

  frontDot(cobaltDiamond, -0.045, 0.095, 0.024, YELLOW);
  frontDot(cobaltDiamond, 0.06, -0.08, 0.018, RED);
  frontLine(cobaltDiamond, [-0.09, -0.01], [0.10, 0.09], CREAM, 0.0028);

  frontDot(orangeFan, -0.07, 0.035, 0.027, TEAL);
  frontDot(orangeFan, 0.075, -0.075, 0.019, BLUE);
  frontLine(orangeFan, [-0.12, -0.06], [0.13, 0.12], WIRE, 0.003);

  frontDot(ivoryPebble, -0.045, 0.035, 0.018, RED);
  frontDot(ivoryPebble, 0.05, -0.045, 0.014, BLUE);
  frontLine(ivoryPebble, [-0.07, -0.02], [0.07, 0.05], WIRE, 0.0025);

  frontDot(smallRed, -0.035, 0.035, 0.015, YELLOW);
  frontDot(smallRed, 0.045, -0.035, 0.012, CREAM);

  frontDot(tealChip, -0.025, 0.03, 0.014, YELLOW);
  frontDot(tealChip, 0.04, -0.035, 0.011, CHARCOAL);

  frontDot(paleBlueDrop, -0.025, 0.045, 0.014, RED);
  frontDot(paleBlueDrop, 0.04, -0.035, 0.011, YELLOW);

  frontDot(purpleBottom, -0.045, 0.07, 0.021, YELLOW);
  frontDot(purpleBottom, 0.065, -0.08, 0.017, TEAL);
  frontLine(purpleBottom, [-0.08, -0.05], [0.09, 0.11], CREAM, 0.003);

  frontDot(creamChip, -0.03, 0.035, 0.013, BLUE);
  frontDot(yellowChip, 0.02, 0.025, 0.013, RED);
  frontDot(tinyPurple, -0.02, 0.025, 0.011, YELLOW);

  // -------------------------------------------------------------------------------------------------------------
  // Extra fittings and tiny floating counterweights. They reinforce the hand-built, balanced-object feeling.

  const fittingPoints: Array<[P, string, number]> = [
    [[-0.56, 2.21, 0], BRASS, 0.013],
    [[0.50, 2.245, 0.025], BRASS, 0.013],
    [[-0.49, 1.83, -0.04], BRASS, 0.012],
    [[0.49, 1.77, -0.035], BRASS, 0.012],
    [[-0.43, 1.34, 0.06], BRASS, 0.012],
    [[0.46, 1.39, 0.06], BRASS, 0.012],
    [[-0.84, 1.57, -0.025], BRASS, 0.010],
    [[0.86, 1.49, 0.0], BRASS, 0.010],
    [[-0.67, 1.01, 0.015], BRASS, 0.009],
    [[0.70, 0.96, -0.01], BRASS, 0.009],
    [[0.28, 0.72, 0.025], BRASS, 0.009],
  ];
  for (const [p, color, radius] of fittingPoints) bead(p, radius, color, "rod_fitting");

  // Short paired wires make several sheets read as suspended rather than merely placed in space.
  wire(
    frontPoint(redDrop, -0.13, 0.07, -0.012),
    frontPoint(redDrop, -0.05, 0.19, -0.012),
    0.0025,
    WIRE,
    "red_detail_wire",
  );
  wire(
    frontPoint(blueCrescent, 0.10, -0.11, -0.012),
    frontPoint(blueCrescent, 0.14, 0.03, -0.012),
    0.0025,
    WIRE,
    "blue_detail_wire",
  );
  wire(
    frontPoint(orangeLeaf, -0.12, -0.06, -0.012),
    frontPoint(orangeLeaf, -0.02, -0.19, -0.012),
    0.0024,
    WIRE,
    "orange_detail_wire",
  );
  wire(
    frontPoint(tealBlade, 0.12, -0.05, -0.012),
    frontPoint(tealBlade, 0.14, 0.06, -0.012),
    0.0024,
    WIRE,
    "teal_detail_wire",
  );

  // A few deliberately oversized dark counterweights provide the visual punctuation of Calder's originals.
  bead([-0.78, 1.60, 0.02], 0.018, CHARCOAL, "left_counterweight");
  bead([0.75, 1.53, -0.04], 0.016, CHARCOAL, "right_counterweight");
  bead([-0.56, 1.11, 0.10], 0.014, CHARCOAL, "lower_left_counterweight");
  bead([0.62, 1.08, 0.09], 0.014, CHARCOAL, "lower_right_counterweight");
  bead([0.17, 0.69, 0.07], 0.013, CHARCOAL, "bottom_counterweight");

  wire(
    [-0.78, 1.60, 0.02],
    [-0.74, 1.48, -0.025],
    0.003,
    WIRE,
    "left_counterweight_string",
  );
  wire(
    [0.75, 1.53, -0.04],
    [0.80, 1.42, 0.105],
    0.003,
    WIRE,
    "right_counterweight_string",
  );
  wire(
    [-0.56, 1.11, 0.10],
    [-0.64, 1.075, 0.13],
    0.0028,
    WIRE,
    "lower_left_counterweight_string",
  );
  wire(
    [0.62, 1.08, 0.09],
    [0.68, 1.10, 0.14],
    0.0028,
    WIRE,
    "lower_right_counterweight_string",
  );
  wire(
    [0.17, 0.69, 0.07],
    [0.40, 0.67, 0.02],
    0.0028,
    WIRE,
    "bottom_counterweight_string",
  );

  return b.root;
}
