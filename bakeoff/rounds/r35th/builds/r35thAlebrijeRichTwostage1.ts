import * as THREE from "three";
import { createBuilder, catmull, limb } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const PALETTE = {
  body: "#d86b32",
  bodyLight: "#f2a447",
  belly: "#f7d58a",
  brown: "#71351f",
  darkBrown: "#301a22",
  teal: "#168f91",
  turquoise: "#31c8bc",
  deepTeal: "#075c68",
  magenta: "#b93678",
  coral: "#ef5d62",
  gold: "#f0b83c",
  yellow: "#ffd76b",
  cream: "#fff0bf",
  eye: "#49d6d0",
  eyeDark: "#122841",
  claw: "#271a26",
  wood: "#8d4428",
  woodDark: "#4d251e",
  wing: "#1b9b9a",
  wingShadow: "#08616c",
  featherLight: "#66dfc9",
} as const;

export const meta = {
  name: "alebrije jaguar-eagle",
  description:
    "A stylized Oaxacan alebrije carved from bright painted wood: a sturdy spotted jaguar body, expressive beaked feline head, lifted eagle wings, feathered tail, and a neutral rig-ready quadruped pose.",
};

export const REQUESTS = [
  {
    id: "crownPlume",
    kind: "add",
    part: "headShell",
    what: "Painted alebrije crown plume behind the ears: three broad carved feathers in MAGENTA, CORAL, and GOLD, with dark brown ink-like edge bands and small cream dots. Keep the plume fan readable from the front.",
    at: [0, 1.92, 1.47],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.62, 0.38, 0.16],
  },
  {
    id: "wingLFeatherFan",
    kind: "add",
    part: "wingL_membrane",
    what: "Rich left eagle feather fan attached to the outer wing: five overlapping pointed feathers, alternating TURQUOISE, MAGENTA, and YELLOW, with small GOLD shaft bands. Follow the existing wing silhouette and leave the teal membrane visible between feathers.",
    at: [1.35, 1.72, 0.08],
    normal: [0.72, 0.52, -0.28],
    bone: "wingL_wrist",
    room: [0.68, 0.58, 0.24],
  },
  {
    id: "wingRFeatherFan",
    kind: "add",
    part: "wingR_membrane",
    what: "Matching right eagle feather fan: five overlapping pointed feathers, alternating TURQUOISE, MAGENTA, and YELLOW, with GOLD shaft bands. Mirror the left fan while preserving the hand-painted asymmetry of an alebrije.",
    at: [-1.35, 1.72, 0.08],
    normal: [-0.72, 0.52, -0.28],
    bone: "wingR_wrist",
    room: [0.68, 0.58, 0.24],
  },
  {
    id: "tailFeatherFan",
    kind: "add",
    part: "tailShell",
    what: "Fan of three carved eagle tail feathers at the tail tip, layered upward and backward in MAGENTA, TURQUOISE, and GOLD. Add cream teardrop motifs and dark brown painted outlines.",
    at: [0, 1.43, -1.82],
    normal: [0, 0.45, -0.9],
    bone: "tailTip",
    room: [0.48, 0.48, 0.46],
  },
  {
    id: "leftCheekRosette",
    kind: "add",
    part: "headShell",
    what: "Large left cheek rosette in CREAM, GOLD, and MAGENTA: a dark brown outer ring, six chunky petal shapes, and a turquoise centre. Seat it directly on the cheek like a carved painted medallion.",
    at: [0.25, 1.52, 1.78],
    normal: [0.28, 0.12, 0.95],
    bone: "head",
    room: [0.34, 0.3, 0.12],
  },
  {
    id: "rightCheekRosette",
    kind: "add",
    part: "headShell",
    what: "Large right cheek rosette matching the left: CREAM, GOLD, MAGENTA, and TURQUOISE with a dark brown ring. Keep both cheek ornaments bold enough to read at thumbnail size.",
    at: [-0.25, 1.52, 1.78],
    normal: [-0.28, 0.12, 0.95],
    bone: "head",
    room: [0.34, 0.3, 0.12],
  },
  {
    id: "neckCollar",
    kind: "add",
    part: "neckShell",
    what: "Decorative alebrije collar around the neck: a broad MAGENTA band with repeating GOLD diamond plates, small TURQUOISE studs, and a scalloped CREAM lower edge. Follow the neck curve without covering the face.",
    at: [0, 1.31, 1.31],
    normal: [0, 0, 1],
    bone: "neckMid",
    room: [0.58, 0.3, 0.28],
  },
  {
    id: "breastEmblem",
    kind: "add",
    part: "breastPlate",
    what: "Central carved breast emblem on the cream bib: a turquoise jaguar sun with eight GOLD rays, a MAGENTA centre, and a dark brown outline. It should sit proud of the chest but remain flat and graphic.",
    at: [0, 1.25, 1.05],
    normal: [0, 0.18, 0.98],
    bone: "spine4",
    room: [0.42, 0.36, 0.08],
  },
  {
    id: "leftTalonSet",
    kind: "add",
    part: "pawL",
    what: "Three chunky carved eagle talons on the left forepaw in CREAM with DARK_BROWN tips, splayed forward and slightly outward. Add tiny GOLD bands at their roots.",
    at: [0.5, 0.16, 0.9],
    normal: [0, 1, 0],
    bone: "pawL",
    room: [0.34, 0.22, 0.42],
  },
  {
    id: "rightTalonSet",
    kind: "add",
    part: "pawR",
    what: "Three chunky carved eagle talons on the right forepaw in CREAM with DARK_BROWN tips, splayed forward and slightly outward. Add tiny GOLD bands at their roots.",
    at: [-0.5, 0.16, 0.9],
    normal: [0, 1, 0],
    bone: "pawR",
    room: [0.34, 0.22, 0.42],
  },
  {
    id: "beakGlyph",
    kind: "add",
    part: "upperBeak",
    what: "Small hand-painted glyph on the upper beak: a dark brown zigzag bordered by CREAM, following the beak's front-facing plane. Keep the gold beak surface otherwise visible.",
    at: [0, 1.55, 1.98],
    normal: [0, -0.12, 0.99],
    bone: "head",
    room: [0.16, 0.12, 0.05],
  },
  {
    id: "bodyRosetteTexture",
    kind: "texture",
    part: "bodyShell",
    what: "Paint the jaguar body as Oaxacan wood: irregular dark BROWN rosettes with CREAM centres over BODY orange, plus occasional MAGENTA and TURQUOISE accent dots. Keep the existing cream belly sector clean and graphic.",
  },
  {
    id: "headMaskTexture",
    kind: "texture",
    part: "headShell",
    what: "Paint a bold jaguar face mask in BODY_LIGHT, CREAM, and BROWN: forehead stripes, cheek dots, a cream muzzle transition, and tiny dark painted whisker marks. Do not obscure the eyes or beak.",
  },
  {
    id: "wingPatternTexture",
    kind: "texture",
    part: "wingL_membrane",
    what: "Paint the left wing membrane with alternating TURQUOISE and DEEP_TEAL feather panels, thin GOLD ribs, and small MAGENTA diamond marks arranged like carved folk ornament.",
  },
  {
    id: "wingPatternTextureMirror",
    kind: "texture",
    part: "wingR_membrane",
    what: "Paint the right wing membrane with alternating TURQUOISE and DEEP_TEAL feather panels, thin GOLD ribs, and small MAGENTA diamond marks arranged like carved folk ornament.",
  },
  {
    id: "tailBandsTexture",
    kind: "texture",
    part: "tailShell",
    what: "Paint the tail in repeating alebrije bands of BODY orange, MAGENTA, TURQUOISE, and CREAM, with small GOLD triangles at the band boundaries and a darker BROWN underside.",
  },
] as const;

export const STAGE2: ((b: Builder) => void)[] = [];

function addToe(
  b: Builder,
  paw: { at: THREE.Vector3; bone: any },
  side: number,
  zOffset: number,
  index: number,
) {
  const base = paw.at.clone().add(new THREE.Vector3(side * 0.045 * (index - 1), -0.02, zOffset));
  const tip = base.clone().add(new THREE.Vector3(side * (index - 1) * 0.018, -0.01, 0.14));
  b.rod(base, tip, 0.026, {
    color: PALETTE.cream,
    bone: paw.bone,
    name: `toe${side > 0 ? "L" : "R"}${index}`,
  });
  const clawBase = tip.clone().add(new THREE.Vector3(0, 0, 0.025));
  const clawTip = clawBase.clone().add(new THREE.Vector3(side * 0.012, -0.015, 0.065));
  b.spike(clawBase, clawTip, null, 0.017, {
    color: PALETTE.claw,
    bone: paw.bone,
    name: `claw${side > 0 ? "L" : "R"}${index}`,
  });
}

function makeFeather(
  b: Builder,
  at: any,
  side: number,
  color: string,
  name: string,
  bone: any,
  length: number,
  width: number,
) {
  return b.extrude(
    [
      [0, 0],
      [width, 0],
      [width * 0.92, length * 0.28],
      [width * 0.56, length * 0.72],
      [width * 0.08, length, "sharp"],
      [0, length * 0.72],
    ],
    {
      at,
      x: [side, 0, 0],
      y: [0, 0.2, -1],
      thickness: 0.026,
      bevel: 0.006,
      smoothing: 0,
      color,
      bone,
      name,
      group: "wing-feathers",
    },
  );
}

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first: a single root, a continuous spine and neck, four grounded legs, a segmented tail, and two
  // extended eagle wings. All joints are placed in the neutral rest pose before geometry is attached.

  const hips = b.joint("hips", {
    at: [0, 0.98, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "skeleton",
  });

  const spinePoints = [
    [0, 1.0, -0.76],
    [0, 1.04, -0.38],
    [0, 1.08, 0.08],
    [0, 1.11, 0.55],
    [0, 1.16, 0.98],
  ];

  const spine = b.chain("spine", spinePoints, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
    group: "skeleton",
  });

  const neckPoints = [
    spinePoints[4],
    [0, 1.23, 1.2],
    [0, 1.35, 1.43],
  ];

  const neck = b.chain("neck", neckPoints, {
    parent: spine.tip,
    names: ["neckBase", "neckMid", "neckTop"],
    role: "neck",
    group: "skeleton",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.48, 1.52],
    dir: [0, 0, 1],
    role: "head",
    group: "skeleton",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.42, 1.72],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "skeleton",
  });

  const tailPoints = [
    spinePoints[0],
    [0, 1.0, -1.08],
    [0, 1.05, -1.38],
    [0, 1.18, -1.64],
    [0, 1.38, -1.84],
  ];

  const tail = b.chain("tail", tailPoints, {
    parent: spine.joints[0],
    names: ["tailBase", "tailMid1", "tailMid2", "tailFan", "tailTip"],
    role: "tail",
    group: "skeleton",
  });

  const legData = [
    {
      side: 1,
      label: "L",
      front: true,
      root: [0.35, 1.0, 0.7],
      target: [0.5, 0.2, 0.9],
      lengths: [0.34, 0.34, 0.25],
      names: ["hipL", "kneeL", "ankleL", "pawL"],
    },
    {
      side: -1,
      label: "R",
      front: true,
      root: [-0.35, 1.0, 0.7],
      target: [-0.5, 0.2, 0.9],
      lengths: [0.34, 0.34, 0.25],
      names: ["hipR", "kneeR", "ankleR", "pawR"],
    },
    {
      side: 1,
      label: "L",
      front: false,
      root: [0.36, 0.98, -0.55],
      target: [0.51, 0.2, -0.84],
      lengths: [0.38, 0.36, 0.25],
      names: ["hindHipL", "hindKneeL", "hindAnkleL", "hindPawL"],
    },
    {
      side: -1,
      label: "R",
      front: false,
      root: [-0.36, 0.98, -0.55],
      target: [-0.51, 0.2, -0.84],
      lengths: [0.38, 0.36, 0.25],
      names: ["hindHipR", "hindKneeR", "hindAnkleR", "hindPawR"],
    },
  ];

  const legs = legData.map((data) => {
    const points = limb(
      data.root,
      data.target,
      data.lengths,
      data.front ? [[0, 0, 1], [0, 0, 1]] : [[0, 0, 1], [0, 0, -1]],
    );
    return {
      ...data,
      points,
      chain: b.chain(data.front ? `foreLeg${data.label}` : `hindLeg${data.label}`, points, {
        parent: hips,
        names: data.names,
        role: "leg",
        contact: data.target,
        group: "skeleton",
      }),
    };
  });

  const wingLPoints = [
    [0.27, 1.32, 0.72],
    [0.62, 1.55, 0.68],
    [1.02, 1.72, 0.46],
    [1.42, 1.64, 0.12],
    [1.7, 1.47, -0.2],
  ];

  const wingRPoints = wingLPoints.map(([x, y, z]) => [-x, y, z]);

  const wingL = b.chain("wingL", wingLPoints, {
    parent: spine.joints[3],
    names: ["wingL_root", "wingL_elbow", "wingL_wrist", "wingL_tipJoint", "wingL_tip"],
    role: "wing",
    group: "skeleton",
  });

  const wingR = b.chain("wingR", wingRPoints, {
    parent: spine.joints[3],
    names: ["wingR_root", "wingR_elbow", "wingR_wrist", "wingR_tipJoint", "wingR_tip"],
    role: "wing",
    group: "skeleton",
  });

  // The jaw is an independent lower piece so a later animator can open it around the hinge.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  // -------------------------------------------------------------------------------------------------------------
  // Main body volumes. The silhouette is deliberately chunky and carved-looking, with low-poly tubes and broad,
  // graphic colour fields reserved for later painted ornament.

  const bodyTube = b.sweep(spine, [0.27, 0.31, 0.34, 0.32, 0.22], {
    color: PALETTE.body,
    sectors: [[105, 255, PALETTE.belly]],
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "bodyShell",
    group: "body",
  });

  const neckTube = b.sweep(neck, [0.23, 0.2, 0.17], {
    color: PALETTE.bodyLight,
    sectors: [[108, 252, PALETTE.cream]],
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "neckShell",
    group: "body",
  });

  const tailTube = b.sweep(
    tail,
    (t) => 0.17 * (1 - t) + 0.045,
    {
      color: PALETTE.body,
      bands: [
        [0.48, PALETTE.teal],
        [0.7, PALETTE.magenta],
        [0.88, PALETTE.gold],
        [1, PALETTE.cream],
      ],
      sectors: [[112, 245, PALETTE.brown]],
      section: { ngon: 7 },
      smooth: false,
      caps: "round",
      name: "tailShell",
      group: "tail",
    },
  );

  const headShell = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    PALETTE.bodyLight,
    {
      bone: head,
      at: head.at,
      scale: [0.34, 0.31, 0.38],
      flat: true,
      name: "headShell",
      group: "head",
    },
  );

  const muzzle = b.part(
    new THREE.SphereGeometry(1, 10, 7),
    PALETTE.cream,
    {
      bone: head,
      at: [0, 1.47, 1.79],
      scale: [0.23, 0.16, 0.22],
      flat: true,
      name: "muzzle",
      group: "face",
    },
  );

  const lowerMuzzle = b.part(
    new THREE.SphereGeometry(1, 9, 6),
    PALETTE.coral,
    {
      bone: jaw,
      at: [0, 1.39, 1.78],
      scale: [0.17, 0.075, 0.16],
      flat: true,
      name: "lowerMuzzle",
      group: "face",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Four legs, with thick feline upper limbs and broad carved paws near the floor.

  for (const data of legs) {
    const leg = data.chain;
    const legName = data.front ? `foreLeg${data.label}` : `hindLeg${data.label}`;

    b.sweep(leg, [0.12, 0.105, 0.08, 0.065], {
      color: data.front ? PALETTE.body : PALETTE.bodyLight,
      bands: [
        [0.58, PALETTE.teal],
        [0.78, PALETTE.magenta],
        [1, PALETTE.gold],
      ],
      section: { ngon: 7 },
      smooth: false,
      caps: "round",
      name: `${legName}_tube`,
      group: "legs",
    });

    const paw = b.part(
      new THREE.SphereGeometry(1, 9, 6),
      PALETTE.cream,
      {
        bone: leg.tip,
        at: leg.tip.at,
        scale: data.front ? [0.16, 0.12, 0.2] : [0.18, 0.13, 0.22],
        flat: true,
        name: data.front ? `paw${data.label}` : `hindPaw${data.label}`,
        group: "feet",
      },
    );

    for (let toe = 0; toe < 3; toe++) {
      addToe(b, paw, data.side, 0.055 + toe * 0.025, toe);
    }

    const ankleBand = b.ring(
      leg.joints[leg.joints.length - 2],
      {
        count: 6,
        radius: 0.075,
        fromDeg: 0,
        toDeg: 360,
        group: "leg-cuffs",
      },
    );
    for (const item of ankleBand.items) {
      if (item.i % 2 === 0) {
        b.part(new THREE.SphereGeometry(0.018, 6, 4), PALETTE.gold, {
          frame: item,
          scale: [1, 1, 1],
          name: `${legName}_ankleStud${item.i}`,
          group: "leg-cuffs",
        });
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Broad wings: a low-poly arm tube, a continuous membrane, and a handful of large carved feather blades.

  const wingEdges = {
    L: catmull([
      [0.27, 1.37, 0.72],
      [0.68, 1.83, 0.56],
      [1.18, 1.96, 0.2],
      [1.65, 1.76, -0.22],
      [1.82, 1.52, -0.34],
    ]),
    R: catmull([
      [-0.27, 1.37, 0.72],
      [-0.68, 1.83, 0.56],
      [-1.18, 1.96, 0.2],
      [-1.65, 1.76, -0.22],
      [-1.82, 1.52, -0.34],
    ]),
  };

  const wingTubeL = b.sweep(wingL, [0.115, 0.09, 0.06, 0.04, 0.025], {
    color: PALETTE.deepTeal,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "wingL_arm",
    group: "wings",
  });

  const wingTubeR = b.sweep(wingR, [0.115, 0.09, 0.06, 0.04, 0.025], {
    color: PALETTE.deepTeal,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "wingR_arm",
    group: "wings",
  });

  const membraneL = b.membrane(wingL, wingEdges.L, {
    color: PALETTE.wing,
    thickness: 0.022,
    rows: 5,
    cols: 8,
    scallop: 0.08,
    bone: wingL,
    name: "wingL_membrane",
    group: "wings",
  });

  const membraneR = b.membrane(wingR, wingEdges.R, {
    color: PALETTE.wing,
    thickness: 0.022,
    rows: 5,
    cols: 8,
    scallop: 0.08,
    bone: wingR,
    name: "wingR_membrane",
    group: "wings",
  });

  for (const side of [1, -1]) {
    const wing = side > 0 ? wingL : wingR;
    const edge = side > 0 ? wingEdges.L : wingEdges.R;
    const label = side > 0 ? "L" : "R";

    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const centre = wing.at(t);
      const outer = edge.at(t);
      b.rod(centre.at, outer, 0.018, {
        color: PALETTE.gold,
        bone: wing.joints[Math.min(i, wing.joints.length - 1)],
        name: `wing${label}_rib${i}`,
        group: "wings",
      });
    }

    makeFeather(
      b,
      wing.at(0.16),
      side,
      PALETTE.turquoise,
      `wing${label}_featherBase`,
      wing.joints[0],
      0.64,
      0.2,
    );
    makeFeather(
      b,
      wing.at(0.43),
      side,
      PALETTE.magenta,
      `wing${label}_featherMid`,
      wing.joints[1],
      0.78,
      0.24,
    );
    makeFeather(
      b,
      wing.at(0.68),
      side,
      PALETTE.gold,
      `wing${label}_featherOuter`,
      wing.joints[2],
      0.9,
      0.28,
    );
    makeFeather(
      b,
      wing.at(0.86),
      side,
      PALETTE.coral,
      `wing${label}_featherTip`,
      wing.joints[3],
      0.72,
      0.24,
    );

    const shoulder = b.part(
      new THREE.SphereGeometry(1, 8, 6),
      PALETTE.magenta,
      {
        bone: wing.joints[0],
        at: wing.joints[0].at,
        scale: [0.16, 0.15, 0.16],
        flat: true,
        name: `wing${label}_shoulder`,
        group: "wings",
      },
    );

    b.ring(
      wing.joints[0],
      {
        count: 6,
        radius: 0.15,
        fromDeg: 0,
        toDeg: 360,
        group: "wing-shoulders",
      },
      (item) =>
        b.spike(item, item, 0.09, 0.025, {
          color: item.i % 2 === 0 ? PALETTE.gold : PALETTE.cream,
          name: `wing${label}_shoulderSpike${item.i}`,
          group: "wing-shoulders",
        }),
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Face, ears, beak, eyes, and the large readable painted expression.

  for (const side of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.2, 0.01],
        [0.17, 0.17],
        [0.06, 0.31, "sharp"],
        [0.0, 0.22],
      ],
      {
        at: [side * 0.24, 1.66, 1.5],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.008,
        smoothing: 0,
        color: PALETTE.coral,
        bone: head,
        name: `ear${side > 0 ? "L" : "R"}`,
        group: "head",
      },
    );

    b.extrude(
      [
        [0, 0.015],
        [0.12, 0.02],
        [0.1, 0.13],
        [0.04, 0.22, "sharp"],
        [0.0, 0.16],
      ],
      {
        at: [side * 0.242, 1.67, 1.525],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.052,
        bevel: 0.004,
        smoothing: 0,
        color: PALETTE.darkBrown,
        bone: head,
        name: `ear${side > 0 ? "L" : "R"}_inner`,
        group: "head",
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 10, 7),
      PALETTE.eye,
      {
        bone: head,
        at: [side * 0.13, 1.58, 1.82],
        scale: [0.095, 0.11, 0.055],
        flat: true,
        name: `eye${side > 0 ? "L" : "R"}_iris`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      PALETTE.eyeDark,
      {
        bone: head,
        at: [side * 0.13, 1.58, 1.875],
        scale: [0.038, 0.075, 0.018],
        flat: true,
        name: `eye${side > 0 ? "L" : "R"}_pupil`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      PALETTE.cream,
      {
        bone: head,
        at: [side * 0.105, 1.625, 1.895],
        scale: [0.018, 0.025, 0.009],
        flat: true,
        name: `eye${side > 0 ? "L" : "R"}_glint`,
        group: "face",
      },
    );

    const browPath = catmull([
      [side * 0.22, 1.72, 1.86],
      [side * 0.14, 1.77, 1.9],
      [side * 0.04, 1.74, 1.88],
    ]);
    b.sweep(browPath, 0.022, {
      color: PALETTE.darkBrown,
      bone: head,
      section: { ngon: 5 },
      caps: "round",
      name: `brow${side > 0 ? "L" : "R"}`,
      group: "face",
    });

    const whiskerPath = catmull([
      [side * 0.17, 1.49, 1.91],
      [side * 0.31, 1.48, 1.96],
      [side * 0.39, 1.47, 1.99],
    ]);
    b.sweep(whiskerPath, 0.009, {
      color: PALETTE.darkBrown,
      bone: head,
      section: { ngon: 4 },
      caps: "round",
      name: `whisker${side > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  b.part(
    new THREE.SphereGeometry(1, 8, 5),
    PALETTE.darkBrown,
    {
      bone: head,
      at: [0, 1.51, 1.96],
      scale: [0.075, 0.06, 0.035],
      flat: true,
      name: "nose",
      group: "face",
    },
  );

  const upperBeak = b.spike(
    [0, 1.51, 1.77],
    [0, -0.18, 1],
    0.3,
    0.115,
    {
      color: PALETTE.gold,
      bone: head,
      caps: "point",
      section: { ngon: 6 },
      name: "upperBeak",
      group: "beak",
    },
  );

  b.spike(
    jaw.at,
    [0, -0.07, 1],
    0.22,
    0.07,
    {
      color: PALETTE.coral,
      bone: jaw,
      caps: "point",
      section: { ngon: 6 },
      name: "lowerBeak",
      group: "beak",
    },
  );

  b.rod(
    [0, 1.49, 1.88],
    [0, 1.44, 1.89],
    0.012,
    {
      color: PALETTE.darkBrown,
      bone: head,
      name: "mouthLine",
      group: "face",
    },
  );

  // A ring of chunky spikes gives the head and neck the carved mane silhouette of an alebrije.
  b.ring(
    neck.tip,
    {
      count: 10,
      radius: 0.19,
      fromDeg: 20,
      toDeg: 340,
      tilt: -16,
      group: "ruff",
    },
    (item) =>
      b.spike(item, item, 0.12, 0.035, {
        color: item.i % 3 === 0 ? PALETTE.magenta : item.i % 3 === 1 ? PALETTE.gold : PALETTE.coral,
        name: `neckRuff${item.i}`,
        group: "ruff",
      }),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Painted wood ornament: chest bib, shoulder bosses, dorsal crest, tail spines, and a feathered tail fan.

  const breastPlate = b.extrude(
    [
      [-0.19, 0],
      [0.19, 0],
      [0.16, 0.2],
      [0.08, 0.37],
      [0, 0.44, "sharp"],
      [-0.08, 0.37],
      [-0.16, 0.2],
    ],
    {
      at: [0, 1.03, 1.05],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.024,
      bevel: 0.006,
      smoothing: 1,
      color: PALETTE.cream,
      bone: spine.joints[3],
      name: "breastPlate",
      group: "ornament",
    },
  );

  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.16, 0.12],
      [0, 0.31, "sharp"],
      [-0.16, 0.12],
    ],
    {
      at: [0, 1.05, 1.066],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.031,
      bevel: 0.004,
      smoothing: 0,
      color: PALETTE.teal,
      bone: spine.joints[3],
      name: "breastInset",
      group: "ornament",
    },
  );

  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      PALETTE.gold,
      {
        bone: spine.joints[3],
        at: [side * 0.31, 1.27, 0.72],
        scale: [0.14, 0.14, 0.1],
        flat: true,
        name: `shoulderBoss${side > 0 ? "L" : "R"}`,
        group: "ornament",
      },
    );
  }

  for (let i = 0; i < 6; i++) {
    const t = 0.12 + i * 0.15;
    const top = bodyTube.at(t, 0);
    b.spike(top, top, 0.13 + (i % 2) * 0.035, 0.035, {
      color: i % 3 === 0 ? PALETTE.magenta : i % 3 === 1 ? PALETTE.gold : PALETTE.teal,
      name: `backCrest${i}`,
      group: "crest",
    });
  }

  for (let i = 0; i < 4; i++) {
    const t = 0.18 + i * 0.17;
    const top = tailTube.at(t, 0);
    b.spike(top, top, 0.09 + i * 0.015, 0.026, {
      color: i % 2 === 0 ? PALETTE.coral : PALETTE.cream,
      name: `tailCrest${i}`,
      group: "tail",
    });
  }

  makeFeather(
    b,
    tail.tip.moved([-0.13, 0, 0]),
    1,
    PALETTE.magenta,
    "tailFeatherL",
    tail.tip,
    0.6,
    0.18,
  );
  makeFeather(
    b,
    tail.tip.moved([0, 0.03, 0]),
    1,
    PALETTE.turquoise,
    "tailFeatherC",
    tail.tip,
    0.72,
    0.2,
  );
  makeFeather(
    b,
    tail.tip.moved([0.13, 0, 0]),
    -1,
    PALETTE.gold,
    "tailFeatherR",
    tail.tip,
    0.58,
    0.18,
  );

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";
    const cheek = b.part(
      new THREE.CylinderGeometry(0.075, 0.075, 0.018, 8),
      PALETTE.gold,
      {
        bone: head,
        at: [side * 0.245, 1.52, 1.895],
        dir: [0, 0, 1],
        scale: [1, 1, 1],
        name: `cheekPlate${label}`,
        group: "face-ornament",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.028, 7, 5),
      PALETTE.magenta,
      {
        bone: head,
        at: [side * 0.245, 1.52, 1.914],
        name: `cheekDot${label}`,
        group: "face-ornament",
      },
    );
  }

  // A few raised wooden seams at the wing roots make the wings read as carved slabs rather than cloth.
  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";
    const root = side > 0 ? wingL.at(0.05) : wingR.at(0.05);
    const seamPath = catmull([
      root.at,
      [side * 0.4, 1.47, 0.73],
      [side * 0.68, 1.67, 0.59],
    ]);
    b.sweep(seamPath, 0.014, {
      color: PALETTE.gold,
      bone: side > 0 ? wingL.joints[0] : wingR.joints[0],
      section: { ngon: 5 },
      caps: "round",
      name: `wing${label}_goldSeam`,
      group: "wings",
    });
  }

  // Stage 2 builders append their own details and textures here.
  for (const add of STAGE2) add(b);

  return b.root;
}
