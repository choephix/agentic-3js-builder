import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { b } from "three";

export const meta = {
  "name": "Calder Hanging Mobile",
  "description": "An Alexander Calder-style hanging mobile: a cascade of four black wire balance arms stepping down from a ceiling anchor, each tipped and weighted with hand-cut flat sheet-metal lobes in red, yellow, blue and white on black."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  wire: "#232323",
  black: "#111111",
  red: "#dd3b26",
  yellow: "#f5b719",
  blue: "#2058c8",
  white: "#f4efe3",
  steel: "#b9bec6",
};
const M = {
  ceilingAnchor: [-0.08, 2.4, 0.2] as [number, number, number],
  pivot1: [-0.08, 2.18, 0.15] as [number, number, number],
  pivot2: [0.47, 1.85, 0.1] as [number, number, number],
  pivot3: [0.47, 1.52, 0.62] as [number, number, number],
  pendantTop: [0.87, 1.44, 0.62] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // crown
  (() => {
function buildCrown({ b, J, P, M }: Ctx) {
  const WIRE = P.wire ?? "#232323";
  const BLACK = P.black ?? "#111111";
  const RED = P.red ?? "#dd3b26";
  const WHITE = P.white ?? "#f4efe3";
  const STEEL = P.steel ?? "#b9bec6";

  const anchor = M.ceilingAnchor ?? [-0.08, 2.4, 0.2];
  const pivot1 = M.pivot1 ?? [-0.08, 2.18, 0.15];
  const pivot2 = M.pivot2 ?? [0.47, 1.85, 0.1];

  const hanger = J.hanger;
  const arm1 = J.arm1;

  // Small ceiling washer, with a dark inset underside and a bright steel rim.
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.012, 12), WHITE, {
    at: anchor,
    bone: hanger,
    dir: [0, 1, 0],
    name: "crown.ceilingPlate",
    group: "crown",
    flat: true,
  });

  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.014, 12), STEEL, {
    at: [anchor[0], anchor[1] - 0.008, anchor[2]],
    bone: hanger,
    dir: [0, 1, 0],
    name: "crown.plateRim",
    group: "crown",
    flat: true,
  });

  // A small dark central cap makes the suspension point read as a mechanical eyelet.
  b.part(new THREE.SphereGeometry(0.018, 8, 5), BLACK, {
    at: [anchor[0], anchor[1] - 0.014, anchor[2]],
    bone: hanger,
    name: "crown.plateEye",
    group: "crown",
    flat: true,
  });

  // Ceiling suspension and the first hanging drop.
  b.rod(anchor, pivot1, 0.012, {
    color: WIRE,
    bone: hanger,
    caps: "round",
    name: "crown.ceilingDrop",
    group: "crown",
    section: { ngon: 8 },
  });

  b.part(new THREE.SphereGeometry(0.022, 8, 6), BLACK, {
    at: pivot1,
    bone: arm1,
    name: "crown.pivot1",
    group: "crown",
    flat: true,
  });

  // The first deliberately unbalanced black balance arm.
  const leftTip = [-0.88, 2.23, 0.15] as const;
  const rightTip = [0.47, 2.12, 0.15] as const;
  b.rod(leftTip, rightTip, 0.011, {
    color: WIRE,
    bone: arm1,
    caps: "round",
    name: "crown.arm1",
    group: "arms",
    section: { ngon: 8 },
  });

  // A tiny counterweight collar around the pivot emphasizes the hinge.
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.028, 8), STEEL, {
    at: pivot1,
    bone: arm1,
    dir: [1, 0, 0],
    name: "crown.pivotCollar",
    group: "arms",
    flat: true,
  });

  // Irregular hand-cut leaf and oval outlines, drawn in the X/Y plane and extruded toward +Z.
  const redLeaf: [number, number, "sharp"][] = [
    [-0.012, -0.105, "sharp"],
    [-0.062, -0.055, "sharp"],
    [-0.058, 0.018, "sharp"],
    [-0.022, 0.094, "sharp"],
    [0.015, 0.115, "sharp"],
    [0.048, 0.048, "sharp"],
    [0.036, -0.045, "sharp"],
  ];

  const whiteOval: [number, number, "sharp"][] = [
    [0.0, -0.068, "sharp"],
    [-0.038, -0.045, "sharp"],
    [-0.047, 0.008, "sharp"],
    [-0.024, 0.058, "sharp"],
    [0.018, 0.066, "sharp"],
    [0.044, 0.027, "sharp"],
    [0.036, -0.035, "sharp"],
  ];

  const smallLeaf: [number, number, "sharp"][] = [
    [-0.008, -0.092, "sharp"],
    [-0.045, -0.044, "sharp"],
    [-0.038, 0.022, "sharp"],
    [-0.006, 0.088, "sharp"],
    [0.032, 0.046, "sharp"],
    [0.041, -0.032, "sharp"],
  ];

  // Left-tip suspension, with the red leaf and the staggered white oval.
  b.rod(leftTip, [-0.88, 2.125, 0.15], 0.008, {
    color: WIRE,
    bone: arm1,
    caps: "round",
    name: "crown.leftLeafWire",
    group: "crown",
    section: { ngon: 8 },
  });

  b.extrude(redLeaf, {
    at: [-0.88, 2.05, 0.15],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 0,
    color: RED,
    bone: arm1,
    name: "crown.leftRedLeaf",
    group: "lobes",
  });

  b.rod([-0.86, 2.045, 0.22], [-0.86, 2.015, 0.22], 0.008, {
    color: WIRE,
    bone: arm1,
    caps: "round",
    name: "crown.whiteOvalWire",
    group: "crown",
    section: { ngon: 8 },
  });

  b.extrude(whiteOval, {
    at: [-0.86, 1.99, 0.22],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 0,
    color: WHITE,
    bone: arm1,
    name: "crown.whiteOval",
    group: "lobes",
  });

  // A small red flag lobe pierced directly by the beam near its left-middle.
  b.extrude(smallLeaf, {
    at: [-0.43, 2.20, 0.15],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 0,
    color: RED,
    bone: arm1,
    name: "crown.midRedFlag",
    group: "lobes",
  });

  b.part(new THREE.SphereGeometry(0.012, 7, 5), BLACK, {
    at: [-0.43, 2.20, 0.158],
    bone: arm1,
    name: "crown.flagPin",
    group: "crown",
    flat: true,
  });

  // The right handoff is intentionally vertical: the next builder's arm2 meets this exact point.
  b.rod(rightTip, pivot2, 0.012, {
    color: WIRE,
    bone: arm1,
    caps: "round",
    name: "crown.midDrop",
    group: "crown",
    section: { ngon: 8 },
  });

  b.part(new THREE.SphereGeometry(0.021, 8, 6), BLACK, {
    at: rightTip,
    bone: arm1,
    name: "crown.rightTipPin",
    group: "crown",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.021, 8, 6), STEEL, {
    at: pivot2,
    bone: arm1,
    name: "crown.handoffPin",
    group: "crown",
    flat: true,
  });
}
    return buildCrown;
  })(),
  // midTier
  (() => {
function buildMidTier({ b, J, P, M }: Ctx) {
  const arm = J.arm2;
  const wire = P.wire ?? "#232323";
  const black = P.black ?? "#111111";
  const blue = P.blue ?? "#2058c8";
  const yellow = P.yellow ?? "#f5b719";

  const front = new THREE.Vector3(0.47, 1.90, 0.58);
  const back = new THREE.Vector3(0.47, 1.79, -0.48);
  const pivot = new THREE.Vector3(0.47, 1.85, 0.10);
  const mid = new THREE.Vector3(0.47, 1.88, 0.35);
  const frontDrop = new THREE.Vector3(0.47, 1.45, 0.58);

  // The long, slightly canted balance beam.
  b.rod(front, back, 0.011, {
    color: wire,
    bone: arm,
    caps: "round",
    name: "midTier.balanceArm",
    group: "midTier",
  });

  // Suspension rod at the front: this is the hand-off to the next arm.
  b.rod(front, frontDrop, 0.009, {
    color: wire,
    bone: arm,
    caps: "round",
    name: "midTier.frontDrop",
    group: "midTier",
  });

  // Small central blue leaf, hung from the beam.
  const blueLeafCenter = new THREE.Vector3(0.47, 1.70, 0.35);
  b.rod(mid, new THREE.Vector3(0.47, 1.755, 0.35), 0.008, {
    color: wire,
    bone: arm,
    caps: "round",
    name: "midTier.blueWire",
    group: "midTier",
  });

  b.extrude(
    [
      [-0.045, -0.11],
      [0.018, -0.095],
      [0.062, -0.025],
      [0.047, 0.058],
      [0.008, 0.11],
      [-0.048, 0.072],
      [-0.068, -0.018],
    ],
    {
      at: blueLeafCenter,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 0,
      color: blue,
      bone: arm,
      name: "midTier.blueLeaf",
      group: "midTier",
    },
  );

  // Back-tip suspension. The yellow disc hangs from the lower end of the beam.
  const yellowTop = new THREE.Vector3(0.47, 1.675, -0.48);
  const yellowCenter = new THREE.Vector3(0.47, 1.60, -0.48);
  b.rod(back, yellowTop, 0.008, {
    color: wire,
    bone: arm,
    caps: "round",
    name: "midTier.yellowWire",
    group: "midTier",
  });

  const yellowOutline: [number, number, "sharp"][] = [];
  const yellowRadius = 0.075;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const wobble = i % 3 === 0 ? 1.045 : i % 3 === 1 ? 0.97 : 1;
    yellowOutline.push([
      Math.cos(a) * yellowRadius * wobble,
      Math.sin(a) * yellowRadius * wobble,
      "sharp",
    ]);
  }
  b.extrude(yellowOutline, {
    at: yellowCenter,
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 0,
    color: yellow,
    bone: arm,
    name: "midTier.yellowDisc",
    group: "midTier",
  });

  // Short chain from the yellow disc's lower rim to the small black disc.
  const blackTop = new THREE.Vector3(0.47, 1.555, -0.44);
  const blackCenter = new THREE.Vector3(0.47, 1.52, -0.44);
  b.rod(
    new THREE.Vector3(0.47, 1.545, -0.48),
    blackTop,
    0.007,
    {
      color: wire,
      bone: arm,
      caps: "round",
      name: "midTier.blackWire",
      group: "midTier",
    },
  );

  const blackOutline: [number, number, "sharp"][] = [];
  const blackRadius = 0.04;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const wobble = i % 2 === 0 ? 1.08 : 0.94;
    blackOutline.push([
      Math.cos(a) * blackRadius * wobble,
      Math.sin(a) * blackRadius * wobble,
      "sharp",
    ]);
  }
  b.extrude(blackOutline, {
    at: blackCenter,
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.0025,
    smoothing: 0,
    color: black,
    bone: arm,
    name: "midTier.blackDisc",
    group: "midTier",
  });

  // Small contrasting edge studs emphasize the hand-cut sheet-metal construction.
  const studGeo = new THREE.SphereGeometry(0.006, 6, 4);
  for (const p of [
    new THREE.Vector3(0.47, 1.675, -0.48),
    new THREE.Vector3(0.47, 1.545, -0.48),
  ]) {
    b.part(studGeo, wire, {
      at: p,
      bone: arm,
      scale: [1, 1, 0.55],
      name: "midTier.sheetStud",
      group: "midTier",
    });
  }
}
    return buildMidTier;
  })(),
  // lowerTier
  (() => {
function buildLowerTier({ b, J, P, M }: Ctx) {
  const wire = P.wire ?? P.black ?? "#232323";
  const black = P.black ?? "#111111";
  const red = P.red ?? "#dd3b26";
  const yellow = P.yellow ?? "#f5b719";
  const blue = P.blue ?? "#2058c8";
  const white = P.white ?? "#f4efe3";

  const arm3 = J.arm3;
  const leftTip: [number, number, number] = [-0.38, 1.56, 0.62];
  const pivot: [number, number, number] = [0.47, 1.52, 0.62];
  const rightTip: [number, number, number] = [0.87, 1.47, 0.62];
  const mid: [number, number, number] = [0.17, 1.50, 0.62];
  const gongCenter: [number, number, number] = [-0.38, 1.16, 0.62];
  const petalCenter: [number, number, number] = [0.17, 1.30, 0.62];
  const pendantTop: [number, number, number] =
    M.pendantTop ?? [0.87, 1.44, 0.62];

  // The slightly sagging black balance bar, with a deliberately blunt,
  // hand-fabricated silhouette rather than a mathematically perfect line.
  b.rod(leftTip, rightTip, 0.011, {
    color: wire,
    bone: arm3,
    caps: "round",
    section: { ngon: 8 },
    name: "lowerTier.balanceArm",
    group: "lowerTier",
  });

  // Tiny collars at the pivot and suspension points make the wirework read
  // as assembled metal rather than floating strokes.
  for (const [name, p, r] of [
    ["pivot", pivot, 0.022],
    ["leftCollar", leftTip, 0.017],
    ["midCollar", mid, 0.015],
    ["rightCollar", rightTip, 0.016],
  ] as const) {
    b.part(new THREE.SphereGeometry(r, 8, 5), black, {
      at: p,
      bone: arm3,
      name: `lowerTier.${name}`,
      group: "lowerTier",
      flat: true,
    });
  }

  // Left suspension: the gong hangs below the high end of the arm.
  b.rod(leftTip, [-0.38, 1.30, 0.62], 0.008, {
    color: wire,
    bone: arm3,
    caps: "round",
    section: { ngon: 8 },
    name: "lowerTier.gongWire",
    group: "lowerTier",
  });

  // Mid suspension for the red petal.
  b.rod(mid, [0.17, 1.39, 0.62], 0.008, {
    color: wire,
    bone: arm3,
    caps: "round",
    section: { ngon: 8 },
    name: "lowerTier.petalWire",
    group: "lowerTier",
  });

  // The low end hands the next tier off exactly at the specified pendant mount.
  b.rod(rightTip, pendantTop, 0.009, {
    color: wire,
    bone: arm3,
    caps: "round",
    section: { ngon: 8 },
    name: "lowerTier.dropToPendant",
    group: "lowerTier",
  });

  // Irregular twelve-corner gong.  It is intentionally not a perfect circle:
  // Calder's cut sheet forms are broad, spare and visibly hand-shaped.
  const gongRim: [number, number, "sharp"][] = [
    [0.00, 0.175, "sharp"],
    [0.075, 0.158, "sharp"],
    [0.145, 0.108, "sharp"],
    [0.173, 0.028, "sharp"],
    [0.158, -0.065, "sharp"],
    [0.095, -0.145, "sharp"],
    [0.012, -0.174, "sharp"],
    [-0.073, -0.157, "sharp"],
    [-0.145, -0.104, "sharp"],
    [-0.176, -0.018, "sharp"],
    [-0.151, 0.070, "sharp"],
    [-0.082, 0.145, "sharp"],
  ];

  const gong = b.extrude(gongRim, {
    at: gongCenter,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.004,
    smoothing: 0,
    color: black,
    bone: arm3,
    name: "lowerTier.heroGong",
    group: "lowerTier",
  });

  // A second, inset face gives the gong a restrained layered edge without
  // losing the large black silhouette.
  const innerRim: [number, number, "sharp"][] = [
    [0.00, 0.145, "sharp"],
    [0.066, 0.132, "sharp"],
    [0.124, 0.089, "sharp"],
    [0.143, 0.022, "sharp"],
    [0.128, -0.054, "sharp"],
    [0.071, -0.120, "sharp"],
    [0.006, -0.141, "sharp"],
    [-0.064, -0.126, "sharp"],
    [-0.122, -0.082, "sharp"],
    [-0.143, -0.012, "sharp"],
    [-0.122, 0.060, "sharp"],
    [-0.065, 0.119, "sharp"],
  ];
  b.extrude(innerRim, {
    at: [-0.38, 1.16, 0.629],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.002,
    color: wire,
    bone: arm3,
    name: "lowerTier.gongInset",
    group: "lowerTier",
  });

  // Bright red boss, seated just proud of the gong's front (+Z) face.
  const boss: [number, number, "sharp"][] = [
    [0.00, 0.052, "sharp"],
    [0.036, 0.038, "sharp"],
    [0.052, 0.004, "sharp"],
    [0.034, -0.040, "sharp"],
    [-0.006, -0.052, "sharp"],
    [-0.043, -0.030, "sharp"],
    [-0.050, 0.013, "sharp"],
    [-0.028, 0.046, "sharp"],
  ];
  b.extrude(boss, {
    at: [-0.38, 1.16, 0.641],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.003,
    color: red,
    bone: arm3,
    name: "lowerTier.gongRedBoss",
    group: "lowerTier",
  });

  // A small radial highlight tab on the boss, kept as a separate flat colour.
  b.extrude(
    [
      [-0.010, 0.010, "sharp"],
      [0.010, 0.010, "sharp"],
      [0.014, 0.038, "sharp"],
      [-0.004, 0.045, "sharp"],
    ],
    {
      at: [-0.38, 1.16, 0.650],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.001,
      color: yellow,
      bone: arm3,
      name: "lowerTier.bossGlimmer",
      group: "lowerTier",
    },
  );

  // Organic red petal beneath the arm's centre.
  const petal: [number, number, "sharp"][] = [
    [0.00, 0.104, "sharp"],
    [0.047, 0.071, "sharp"],
    [0.061, 0.014, "sharp"],
    [0.045, -0.060, "sharp"],
    [0.012, -0.092, "sharp"],
    [-0.030, -0.073, "sharp"],
    [-0.057, -0.018, "sharp"],
    [-0.046, 0.050, "sharp"],
  ];
  const petalPart = b.extrude(petal, {
    at: petalCenter,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 1,
    color: red,
    bone: arm3,
    name: "lowerTier.redPetal",
    group: "lowerTier",
  });

  // A small offset yellow chip on the petal adds the cut-paper character.
  b.extrude(
    [
      [-0.018, 0.028, "sharp"],
      [0.008, 0.044, "sharp"],
      [0.021, 0.014, "sharp"],
      [0.002, -0.006, "sharp"],
    ],
    {
      at: [0.17, 1.30, 0.629],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.003,
      bevel: 0.001,
      color: yellow,
      bone: arm3,
      name: "lowerTier.petalMark",
      group: "lowerTier",
    },
  );

  // Fine rivet-like dots along the bar are sparse and graphic, not mechanical.
  for (const [i, t] of [0.18, 0.42, 0.68, 0.86].entries()) {
    const x = leftTip[0] + (rightTip[0] - leftTip[0]) * t;
    const y = leftTip[1] + (rightTip[1] - leftTip[1]) * t;
    b.part(new THREE.SphereGeometry(0.012, 6, 4), steelColor(P), {
      at: [x, y + 0.012, 0.62],
      bone: arm3,
      name: `lowerTier.armRivet${i}`,
      group: "lowerTier",
      flat: true,
    });
  }

  function steelColor(palette: any) {
    return palette.steel ?? "#b9bec6";
  }

  return petalPart;
}
    return buildLowerTier;
  })(),
  // pendant
  (() => {
function buildPendant({ b, J, P, M }: Ctx) {
  const bone = J.pendant;
  const WIRE = P.black ?? P.wire ?? "#111111";
  const RED = P.red ?? "#dd3b26";
  const YELLOW = P.yellow ?? "#f5b719";

  const x = 0.87;
  const z = 0.62;

  const rod = (a: [number, number, number], c: [number, number, number], r = 0.007) =>
    b.rod(a, c, r, {
      color: WIRE,
      bone,
      caps: "round",
      name: "pendantWire",
      group: "dangler",
    });

  const sheet = (
    outline: [number, number, "sharp"][] | [number, number][],
    at: [number, number, number],
    color: string,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.0025,
      smoothing: 0,
      color,
      bone,
      rotation,
      name,
      group: "sheets",
    });

  const top = M.pendantTop as [number, number, number];

  // Short upper suspension wire, ending just inside the red sheet.
  rod(top, [x, 1.35, z]);

  // Hand-cut red oval, slightly pinched at its top and bottom.
  sheet(
    [
      [-0.018, 0.072, "sharp"],
      [0.042, 0.058],
      [0.065, 0.012],
      [0.058, -0.040],
      [0.018, -0.072, "sharp"],
      [-0.035, -0.056],
      [-0.062, -0.005],
      [-0.052, 0.044],
    ],
    [x, 1.28, z],
    RED,
    "pendantRedOval",
  );

  // Small visible gap and the wire linking the red and yellow sheets.
  rod([x, 1.208, z], [x, 1.135, z]);

  // Angular yellow blade, with an intentionally asymmetrical Calder-like cut.
  sheet(
    [
      [-0.018, 0.082, "sharp"],
      [0.044, 0.050],
      [0.027, 0.008],
      [0.057, -0.070, "sharp"],
      [-0.010, -0.052],
      [-0.050, -0.012],
      [-0.032, 0.035],
    ],
    [x, 1.06, z],
    YELLOW,
    "pendantYellowBlade",
    [0, 0, 15],
  );

  // Lower drop, kept just long enough to separate the final black disc.
  rod([x, 0.978, z], [x, 0.905, z], 0.007);

  // Low black disc: irregular eight-sided silhouette, bottom at approximately y = 0.815.
  sheet(
    [
      [0.000, 0.045, "sharp"],
      [0.030, 0.034],
      [0.046, 0.005],
      [0.031, -0.034],
      [0.000, -0.045, "sharp"],
      [-0.034, -0.032],
      [-0.047, 0.004],
      [-0.028, 0.036],
    ],
    [x, 0.86, z],
    WIRE,
    "pendantBlackDisc",
  );

  // Tiny central face accent gives the lowest disc a cut-metal highlight without
  // changing its restrained black silhouette.
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.002, 8), P.steel ?? "#b9bec6", {
    at: [x, 0.86, z + 0.007],
    dir: [0, 0, 1],
    axis: "y",
    bone,
    name: "pendantDiscRivet",
    group: "dangler",
  });
}
    return buildPendant;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const J: Record<string, Joint> = {};
  J["hanger"] = b.joint("hanger", { at: [-0.08,2.4,0.2], dir: [0,-1,0], role: "spine" });
  J["arm1"] = b.joint("arm1", { parent: J["hanger"], at: [-0.08,2.18,0.15], dir: [1,0,0], role: "hinge", group: "arms" });
  J["arm2"] = b.joint("arm2", { parent: J["arm1"], at: [0.47,1.85,0.1], dir: [0,0,1], role: "hinge", group: "arms" });
  J["arm3"] = b.joint("arm3", { parent: J["arm2"], at: [0.47,1.52,0.62], dir: [1,0,0], role: "hinge", group: "arms" });
  J["pendant"] = b.joint("pendant", { parent: J["arm3"], at: [0.87,1.44,0.62], dir: [0,-1,0], role: "hinge", group: "dangler" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
