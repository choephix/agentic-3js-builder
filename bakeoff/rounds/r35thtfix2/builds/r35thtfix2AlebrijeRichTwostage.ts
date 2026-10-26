import * as THREE from "three";
import { type Builder, cells, catmull, createBuilder, limb, paint, svg, frame, grain, type OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "alebrije jaguar-eagle",
  description:
    "A brightly painted Oaxacan alebrije combining a spotted jaguar body with an eagle's beak, wings, talons, and feathered tail.",
};

const C = {
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
  wing: "#1b9b9a",
} as const;

const PALETTE = C;
const fract = (x: number) => x - Math.floor(x);

const BODY_PAINT = paint((p, n, _s) => {
  // The underside remains a deliberately clean cream field.
  if (n.y < -0.2) return C.belly;

  const cell = cells(p, 0.22, 41);
  const accent = cell.id > 0.88 && cell.d1 < 0.34;

  // Occasional turquoise and magenta dots break up the repeated rosettes.
  if (accent) return cell.id > 0.94 ? C.magenta : C.turquoise;

  // Irregular cream rosette centres surrounded by dark brown carved rings.
  if (cell.d1 < 0.17) return C.cream;
  if (cell.d1 < 0.34 && cell.d2 - cell.d1 > 0.08) return C.brown;

  return C.body;
});

const HEAD_PAINT = paint((p, n, _s) => {
  // Cream muzzle transition and lower cheek mask.
  if (p.z > 1.69 && p.y < 1.53) return C.cream;

  // Painted forehead bars, kept above the eyes and away from the beak.
  if (p.z > 1.67 && p.y > 1.59) {
    const bar = Math.abs(Math.sin((p.x + 0.015 * Math.sin(p.z * 40)) * 46));
    if (bar > 0.78) return C.brown;
  }

  // Small cheek dots.
  const cheek = cells(p, 0.105, 73);
  if (p.z > 1.65 && p.y < 1.62 && cheek.d1 < 0.2) return C.brown;

  // Tiny whisker marks at the outer muzzle.
  if (
    p.z > 1.75 &&
    p.y > 1.42 &&
    p.y < 1.53 &&
    Math.abs(fract((p.x + 0.42) / 0.055) - 0.5) < 0.13
  )
    return C.darkBrown;

  if (n.y < -0.35) return C.cream;
  return C.bodyLight;
});

const WING_PAINT = paint((_p, _n, s) => {
  const along = s[0];
  const across = s[1];

  // Long feather panels alternate between bright turquoise and deep teal.
  const panel = Math.floor(along * 8);
  let color: string = panel % 2 === 0 ? C.turquoise : C.deepTeal;

  // Thin gold ribs run along the membrane's feather direction.
  const rib = Math.abs(fract(along * 8) - 0.5) < 0.035;
  if (rib) color = C.gold;

  // Small magenta diamond marks form a folk-painted repeating border.
  const u = fract(along * 10 + across * 0.7);
  const v = fract(across * 7 + along * 1.2);
  const diamond = Math.abs(u - 0.5) + Math.abs(v - 0.5) < 0.22;
  if (diamond && panel % 3 !== 1) color = C.magenta;

  return color;
});

const TAIL_PAINT = paint((_p, n, s) => {
  if (n.y < -0.25) return C.brown;

  const t = Math.min(Math.max(s[0], 0), 0.999);
  const band = Math.floor(t * 9);
  const colors: string[] = [C.body, C.magenta, C.turquoise, C.cream];
  let color = colors[band % colors.length];

  // Gold triangular boundary marks appear on the upper and side faces.
  const edge = fract(t * 9);
  const angle = ((s[1] % 360) + 360) % 360;
  const upperFace = angle < 115 || angle > 285;
  if (upperFace && edge < 0.075 && fract(angle / 42) < 0.38) color = C.gold;

  return color;
});

export const REQUESTS = [
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

const EYE_TEXTURE = svg(
  `<svg viewBox="0 0 80 104" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 52 Q38 8 72 52 Q39 94 8 52Z" fill="#301a22"/>
    <ellipse cx="42" cy="53" rx="22" ry="31" fill="#168f91"/>
    <ellipse cx="42" cy="30" rx="22" ry="11" fill="#075c68"/>
    <ellipse cx="42" cy="61" rx="9" ry="20" fill="#122841"/>
    <ellipse cx="33" cy="39" rx="7" ry="10" fill="#fff0bf"/>
    <circle cx="51" cy="69" r="4" fill="#fff0bf"/>
    <path d="M12 42 Q7 28 3 20 M11 49 Q4 44 1 38"
      stroke="#301a22" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);

function addToe(
  b: Builder,
  paw: any,
  side: number,
  index: number,
  bone: any,
) {
  const root = paw.at.clone().add(
    new THREE.Vector3(side * (index - 1) * 0.055, -0.035, 0.075),
  );
  const tip = root.clone().add(
    new THREE.Vector3(side * (index - 1) * 0.018, -0.012, 0.14),
  );

  b.rod(root, tip, 0.025, {
    color: C.cream,
    bone,
    name: `toe${side > 0 ? "L" : "R"}${index}`,
    group: "talons",
  });

  b.spike(
    tip,
    tip.clone().add(new THREE.Vector3(side * 0.018, -0.014, 0.065)),
    null,
    0.015,
    {
      color: C.claw,
      bone,
      name: `claw${side > 0 ? "L" : "R"}${index}`,
      group: "talons",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.018, 6, 4),
    C.gold,
    {
      bone,
      at: root,
      name: `talonBand${side > 0 ? "L" : "R"}${index}`,
      group: "talons",
    },
  );
}

function feather(
  b: Builder,
  at: any,
  side: number,
  color: string,
  bone: any,
  name: string,
  length: number,
  width: number,
) {
  return b.extrude(
    [
      [0, 0],
      [width, 0],
      [width * 0.93, length * 0.3],
      [width * 0.57, length * 0.74],
      [width * 0.08, length, "sharp"],
      [0, length * 0.7],
    ],
    {
      at,
      x: [side, 0, 0],
      y: [0, 0.23, -0.97],
      thickness: 0.025,
      bevel: 0.005,
      color,
      bone,
      name,
      group: "feathers",
    },
  );
}

function addRosette(
  b: Builder,
  at: [number, number, number],
  bone: any,
  side: number,
  name: string,
) {
  b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.025, 10), C.brown, {
    bone,
    at,
    dir: [0, 0, 1],
    name: `${name}_ring`,
    group: "face-ornament",
  });

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.047, 7, 5), i % 2 ? C.cream : C.gold, {
      bone,
      at: [
        at[0] + Math.cos(a) * 0.065,
        at[1] + Math.sin(a) * 0.065,
        at[2] + 0.018,
      ],
      scale: [1, 1.3, 0.35],
      name: `${name}_petal${i}`,
      group: "face-ornament",
    });
  }

  b.part(new THREE.SphereGeometry(0.04, 7, 5), C.turquoise, {
    bone,
    at: [at[0], at[1], at[2] + 0.04],
    name: `${name}_centre`,
    group: "face-ornament",
  });

  b.rod(
    [at[0] - side * 0.1, at[1] - 0.12, at[2] + 0.045],
    [at[0] + side * 0.1, at[1] + 0.12, at[2] + 0.045],
    0.009,
    {
      color: C.magenta,
      bone,
      name: `${name}_slash`,
      group: "face-ornament",
    },
  );
}

export default function build() {
  const b = createBuilder({
    name: "alebrije-jaguar-eagle",
    detail: 1,
    paintSize: 2048,
  });

  const hips = b.joint("hips", {
    at: [0, 0.96, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = [
    [0, 0.98, -0.72],
    [0, 1.02, -0.35],
    [0, 1.06, 0.06],
    [0, 1.1, 0.48],
    [0, 1.15, 0.9],
  ];

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
  });

  const neck = b.chain(
    "neck",
    [
      spinePath[4],
      [0, 1.22, 1.18],
      [0, 1.36, 1.42],
    ],
    {
      parent: spine.tip,
      names: ["neckBase", "neckMid", "neckTop"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.5, 1.53],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.42, 1.72],
    dir: [0, -0.14, 1],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    [
      spinePath[0],
      [0, 0.99, -1.05],
      [0, 1.04, -1.36],
      [0, 1.17, -1.62],
      [0, 1.37, -1.84],
    ],
    {
      parent: spine.joints[0],
      names: ["tailBase", "tailMid1", "tailMid2", "tailFan", "tailTip"],
      role: "tail",
    },
  );

  const legSpecs = [
    {
      side: 1,
      label: "L",
      root: [0.34, 1.0, 0.66],
      target: [0.49, 0.2, 0.82],
      bends: [[0, 0, 1], [0, 0, 1]],
      names: ["hipL", "kneeL", "ankleL", "pawL"],
      front: true,
    },
    {
      side: -1,
      label: "R",
      root: [-0.34, 1.0, 0.66],
      target: [-0.49, 0.2, 0.82],
      bends: [[0, 0, 1], [0, 0, 1]],
      names: ["hipR", "kneeR", "ankleR", "pawR"],
      front: true,
    },
    {
      side: 1,
      label: "L",
      root: [0.36, 0.98, -0.52],
      target: [0.5, 0.2, -0.84],
      bends: [[0, 0, 1], [0, 0, -1]],
      names: ["hindHipL", "hindKneeL", "hindAnkleL", "hindPawL"],
      front: false,
    },
    {
      side: -1,
      label: "R",
      root: [-0.36, 0.98, -0.52],
      target: [-0.5, 0.2, -0.84],
      bends: [[0, 0, 1], [0, 0, -1]],
      names: ["hindHipR", "hindKneeR", "hindAnkleR", "hindPawR"],
      front: false,
    },
  ];

  const legs = legSpecs.map((spec) => {
    const points = limb(
      spec.root,
      spec.target,
      spec.front ? [0.34, 0.34, 0.25] : [0.38, 0.36, 0.25],
      spec.bends,
    );
    return {
      ...spec,
      chain: b.chain(spec.front ? `foreLeg${spec.label}` : `hindLeg${spec.label}`, points, {
        parent: hips,
        names: spec.names,
        role: "leg",
        contact: spec.target,
      }),
    };
  });

  const wingL = b.chain(
    "wingL",
    [
      [0.27, 1.32, 0.7],
      [0.62, 1.55, 0.65],
      [1.03, 1.72, 0.42],
      [1.43, 1.64, 0.1],
      [1.72, 1.47, -0.2],
    ],
    {
      parent: spine.joints[3],
      names: ["wingL_root", "wingL_elbow", "wingL_wrist", "wingL_tipJoint", "wingL_tip"],
      role: "wing",
    },
  );

  const wingR = b.chain(
    "wingR",
    [
      [-0.27, 1.32, 0.7],
      [-0.62, 1.55, 0.65],
      [-1.03, 1.72, 0.42],
      [-1.43, 1.64, 0.1],
      [-1.72, 1.47, -0.2],
    ],
    {
      parent: spine.joints[3],
      names: ["wingR_root", "wingR_elbow", "wingR_wrist", "wingR_tipJoint", "wingR_tip"],
      role: "wing",
    },
  );

  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  const body = b.sweep(spine, [0.27, 0.31, 0.34, 0.32, 0.22], {
    color: BODY_PAINT,
    sectors: [[105, 255, C.belly]],
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "bodyShell",
    group: "body",
  });

  b.sweep(neck, [0.23, 0.2, 0.17], {
    color: C.bodyLight,
    sectors: [[108, 252, C.cream]],
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "neckShell",
    group: "body",
  });

  const tailTube = b.sweep(tail, (t) => 0.17 * (1 - t) + 0.045, {
    color: TAIL_PAINT,
    section: { ngon: 7 },
    smooth: false,
    caps: "round",
    name: "tailShell",
    group: "tail",
  });

  const headShell = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    HEAD_PAINT,
    {
      bone: head,
      at: head.at,
      scale: [0.35, 0.31, 0.39],
      flat: true,
      name: "headShell",
      group: "head",
    },
  );

  b.part(new THREE.SphereGeometry(1, 10, 7), C.cream, {
    bone: head,
    at: [0, 1.47, 1.79],
    scale: [0.23, 0.16, 0.22],
    flat: true,
    name: "muzzle",
    group: "face",
  });

  b.part(new THREE.SphereGeometry(1, 9, 6), C.coral, {
    bone: jaw,
    at: [0, 1.39, 1.77],
    scale: [0.17, 0.075, 0.16],
    flat: true,
    name: "lowerMuzzle",
    group: "face",
  });

  for (const spec of legs) {
    const leg = spec.chain;
    const label = spec.label;
    b.sweep(leg, [0.12, 0.105, 0.08, 0.065], {
      color: spec.front ? C.body : C.bodyLight,
      bands: [
        [0.58, C.teal],
        [0.78, C.magenta],
        [1, C.gold],
      ],
      section: { ngon: 7 },
      smooth: false,
      caps: "round",
      name: `${spec.front ? "foreLeg" : "hindLeg"}${label}_tube`,
      group: "legs",
    });

    const paw = b.part(
      new THREE.SphereGeometry(1, 9, 6),
      C.cream,
      {
        bone: leg.tip!,
        at: leg.tip!.at,
        scale: spec.front ? [0.16, 0.12, 0.2] : [0.18, 0.13, 0.22],
        flat: true,
        name: spec.front ? `paw${label}` : `hindPaw${label}`,
        group: "feet",
      },
    );

    for (let i = 0; i < 3; i++) addToe(b, paw, spec.side, i, leg.tip);
  }

  const wingEdgeL = catmull([
    [0.27, 1.37, 0.72],
    [0.68, 1.83, 0.56],
    [1.18, 1.96, 0.2],
    [1.65, 1.76, -0.22],
    [1.82, 1.52, -0.34],
  ]);

  const wingEdgeR = catmull([
    [-0.27, 1.37, 0.72],
    [-0.68, 1.83, 0.56],
    [-1.18, 1.96, 0.2],
    [-1.65, 1.76, -0.22],
    [-1.82, 1.52, -0.34],
  ]);

  b.sweep(wingL, [0.115, 0.09, 0.06, 0.04, 0.025], {
    color: C.deepTeal,
    section: { ngon: 6 },
    caps: "round",
    name: "wingL_arm",
    group: "wings",
  });

  b.sweep(wingR, [0.115, 0.09, 0.06, 0.04, 0.025], {
    color: C.deepTeal,
    section: { ngon: 6 },
    caps: "round",
    name: "wingR_arm",
    group: "wings",
  });

  b.membrane(wingL, wingEdgeL, {
    color: WING_PAINT,
    thickness: 0.022,
    rows: 5,
    cols: 8,
    scallop: 0.08,
    bone: wingL,
    name: "wingL_membrane",
    group: "wings",
  });

  b.membrane(wingR, wingEdgeR, {
    color: WING_PAINT,
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
    const edge = side > 0 ? wingEdgeL : wingEdgeR;
    const label = side > 0 ? "L" : "R";

    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      b.rod(wing.at(t).at, edge.at(t), 0.017, {
        color: C.gold,
        bone: wing.joints[Math.min(i, wing.joints.length - 1)],
        name: `wing${label}_rib${i}`,
        group: "wings",
      });
    }

    feather(
      b,
      wing.at(0.14),
      side,
      C.turquoise,
      wing.joints[0],
      `wing${label}_featherBase`,
      0.62,
      0.19,
    );
    feather(
      b,
      wing.at(0.38),
      side,
      C.magenta,
      wing.joints[1],
      `wing${label}_featherMid`,
      0.76,
      0.23,
    );
    feather(
      b,
      wing.at(0.62),
      side,
      C.gold,
      wing.joints[2],
      `wing${label}_featherOuter`,
      0.88,
      0.27,
    );
    feather(
      b,
      wing.at(0.82),
      side,
      C.coral,
      wing.joints[3],
      `wing${label}_featherTip`,
      0.7,
      0.23,
    );

    b.part(new THREE.SphereGeometry(1, 8, 6), C.magenta, {
      bone: wing.joints[0],
      at: wing.joints[0].at,
      scale: [0.16, 0.15, 0.16],
      flat: true,
      name: `wing${label}_shoulder`,
      group: "wings",
    });
  }

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";

    b.extrude(
      [
        [0, 0],
        [0.2, 0.01],
        [0.17, 0.17],
        [0.06, 0.31, "sharp"],
        [0, 0.22],
      ],
      {
        at: [side * 0.24, 1.66, 1.5],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.008,
        color: C.coral,
        bone: head,
        name: `ear${label}`,
        group: "head",
      },
    );

    b.extrude(
      [
        [0, 0.015],
        [0.12, 0.02],
        [0.1, 0.13],
        [0.04, 0.22, "sharp"],
        [0, 0.16],
      ],
      {
        at: [side * 0.242, 1.67, 1.525],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.052,
        bevel: 0.004,
        color: C.darkBrown,
        bone: head,
        name: `ear${label}_inner`,
        group: "head",
      },
    );

    b.decal(headShell, EYE_TEXTURE, {
      at: [side * 0.13, 1.59, 1.86],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.145, 0.18],
      mirror: side > 0,
      lift: 0.004,
      name: `eye${label}`,
      group: "face",
    });

    b.sweep(
      catmull([
        [side * 0.22, 1.73, 1.86],
        [side * 0.14, 1.78, 1.9],
        [side * 0.04, 1.75, 1.88],
      ]),
      0.022,
      {
        color: C.darkBrown,
        bone: head,
        section: { ngon: 5 },
        caps: "round",
        name: `brow${label}`,
        group: "face",
      },
    );

    b.sweep(
      catmull([
        [side * 0.17, 1.49, 1.91],
        [side * 0.31, 1.48, 1.96],
        [side * 0.4, 1.47, 1.99],
      ]),
      0.009,
      {
        color: C.darkBrown,
        bone: head,
        section: { ngon: 4 },
        caps: "round",
        name: `whisker${label}`,
        group: "face",
      },
    );

    addRosette(b, [side * 0.25, 1.53, 1.9], head, side, `cheek${label}`);
  }

  b.part(new THREE.SphereGeometry(1, 8, 5), C.darkBrown, {
    bone: head,
    at: [0, 1.51, 1.96],
    scale: [0.075, 0.06, 0.035],
    flat: true,
    name: "nose",
    group: "face",
  });

  b.spike([0, 1.51, 1.77], [0, -0.18, 1], 0.3, 0.115, {
    color: C.gold,
    bone: head,
    caps: "point",
    section: { ngon: 6 },
    name: "upperBeak",
    group: "beak",
  });

  b.spike(jaw.at, [0, -0.07, 1], 0.22, 0.07, {
    color: C.coral,
    bone: jaw,
    caps: "point",
    section: { ngon: 6 },
    name: "lowerBeak",
    group: "beak",
  });

  b.rod([0, 1.49, 1.88], [0, 1.44, 1.89], 0.012, {
    color: C.darkBrown,
    bone: head,
    name: "mouthLine",
    group: "face",
  });

  b.ring(
    neck.tip!,
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
        color: item.i % 3 === 0 ? C.magenta : item.i % 3 === 1 ? C.gold : C.coral,
        name: `neckRuff${item.i}`,
        group: "ruff",
      }),
  );

  b.extrude(
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
      color: C.cream,
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
      color: C.teal,
      bone: spine.joints[3],
      name: "breastInset",
      group: "ornament",
    },
  );

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike(
      [0, 1.2, 1.1],
      new THREE.Vector3(Math.sin(a) * 0.17, 1.2 + Math.cos(a) * 0.17, 1.15),
      null,
      0.018,
      {
        color: C.gold,
        bone: spine.joints[3],
        name: `breastSunRay${i}`,
        group: "ornament",
      },
    );
  }

  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), C.gold, {
      bone: spine.joints[3],
      at: [side * 0.31, 1.27, 0.72],
      scale: [0.14, 0.14, 0.1],
      flat: true,
      name: `shoulderBoss${side > 0 ? "L" : "R"}`,
      group: "ornament",
    });
  }

  for (let i = 0; i < 6; i++) {
    const top = body.at(0.12 + i * 0.15, 0);
    b.spike(top, top, 0.13 + (i % 2) * 0.035, 0.035, {
      color: i % 3 === 0 ? C.magenta : i % 3 === 1 ? C.gold : C.teal,
      name: `backCrest${i}`,
      group: "crest",
    });
  }

  for (let i = 0; i < 4; i++) {
    const top = tailTube.at(0.18 + i * 0.17, 0);
    b.spike(top, top, 0.09 + i * 0.015, 0.026, {
      color: i % 2 === 0 ? C.coral : C.cream,
      name: `tailCrest${i}`,
      group: "tail",
    });
  }

  feather(
    b,
    tail.tip!.moved([-0.13, 0, 0]),
    1,
    C.magenta,
    tail.tip,
    "tailFeatherL",
    0.6,
    0.18,
  );
  feather(
    b,
    tail.tip!.moved([0, 0.03, 0]),
    1,
    C.turquoise,
    tail.tip,
    "tailFeatherC",
    0.72,
    0.2,
  );
  feather(
    b,
    tail.tip!.moved([0.13, 0, 0]),
    -1,
    C.gold,
    tail.tip,
    "tailFeatherR",
    0.58,
    0.18,
  );

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.028, 7, 5), C.magenta, {
      bone: head,
      at: [side * 0.245, 1.52, 1.93],
      name: `cheekDot${label}`,
      group: "face-ornament",
    });
  }

  for (const side of [1, -1]) {
    const wing = side > 0 ? wingL : wingR;
    const label = side > 0 ? "L" : "R";
    b.sweep(
      catmull([
        wing.at(0.05).at,
        [side * 0.4, 1.47, 0.73],
        [side * 0.68, 1.67, 0.59],
      ]),
      0.014,
      {
        color: C.gold,
        bone: wing.joints[0],
        section: { ngon: 5 },
        caps: "round",
        name: `wing${label}_goldSeam`,
        group: "wings",
      },
    );
  }

  for (const add of STAGE2) add(b);

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addCrownPlume(b: Builder) {
  const C = {
    magenta: "#b93678",
    coral: "#ef5d62",
    gold: "#f0b83c",
    cream: "#fff0bf",
    brown: "#301a22",
    teal: "#168f91",
  };

  type Feather = {
    name: string;
    color: string;
    base: THREE.Vector3;
    x: THREE.Vector3;
    y: THREE.Vector3;
    n: THREE.Vector3;
    length: number;
    width: number;
    part: any;
  };

  const makeFeather = (
    name: string,
    color: string,
    base: THREE.Vector3,
    lean: number,
    length: number,
    width: number,
  ): Feather => {
    const x = new THREE.Vector3(1, 0, 0);
    const y = new THREE.Vector3(lean, 1, -0.08).normalize();
    const n = x.clone().cross(y).normalize();

    const point = (u: number, v: number, depth = 0) =>
      base
        .clone()
        .addScaledVector(x, u)
        .addScaledVector(y, v)
        .addScaledVector(n, depth);

    const outline = (w: number, h: number): [number, number, "sharp"][] => [
      [-w * 0.42, 0, "sharp"],
      [w * 0.42, 0, "sharp"],
      [w * 0.52, h * 0.18, "sharp"],
      [w * 0.47, h * 0.42, "sharp"],
      [w * 0.28, h * 0.73, "sharp"],
      [0, h, "sharp"],
      [-w * 0.28, h * 0.73, "sharp"],
      [-w * 0.47, h * 0.42, "sharp"],
      [-w * 0.52, h * 0.18, "sharp"],
    ];

    // The dark, slightly oversized silhouette reads as a hand-painted outline and gives the
    // colored feather a raised carved rim.
    b.extrude(outline(width * 1.12, length * 1.045), {
      at: base,
      x,
      y,
      thickness: 0.034,
      bevel: 0.006,
      color: C.brown,
      bone: "head",
      name: `${name}_darkRim`,
      group: "s21-crown-plume",
    });

    const colored = b.extrude(outline(width, length), {
      at: base.clone().addScaledVector(n, 0.019),
      x,
      y,
      thickness: 0.026,
      bevel: 0.004,
      color,
      bone: "head",
      name,
      group: "s21-crown-plume",
    });

    const front = 0.039;
    const edgePath = (side: number) => [
      point(side * width * 0.42, length * 0.035, front),
      point(side * width * 0.51, length * 0.18, front),
      point(side * width * 0.46, length * 0.43, front),
      point(side * width * 0.28, length * 0.73, front),
      point(side * width * 0.035, length * 0.975, front),
    ];

    for (const side of [-1, 1]) {
      b.sweep(edgePath(side), 0.0085, {
        color: C.brown,
        bone: "head",
        section: { ngon: 5 },
        caps: "round",
        name: `${name}_edge${side < 0 ? "L" : "R"}`,
        group: "s21-crown-ink",
      });
    }

    // Raised central shaft: a warm carved ridge down every feather.
    b.sweep(
      [
        point(0, length * 0.025, front + 0.006),
        point(0, length * 0.32, front + 0.008),
        point(0, length * 0.68, front + 0.009),
        point(0, length * 0.94, front + 0.006),
      ],
      0.011,
      {
        color: C.gold,
        bone: "head",
        section: { ngon: 6 },
        caps: "round",
        name: `${name}_goldShaft`,
        group: "s21-crown-paint",
      },
    );

    // Two small cross-bands make the surfaces feel painted and inlaid rather than plain.
    for (const band of [0.31, 0.57]) {
      const half = width * (0.31 - band * 0.12);
      b.sweep(
        [
          point(-half, length * band, front + 0.014),
          point(half, length * (band + 0.018), front + 0.014),
        ],
        0.0055,
        {
          color: C.cream,
          bone: "head",
          section: { ngon: 5 },
          caps: "round",
          name: `${name}_band${Math.round(band * 100)}`,
          group: "s21-crown-paint",
        },
      );
    }

    const dots = [
      [-0.19, 0.19],
      [0.17, 0.27],
      [-0.14, 0.43],
      [0.14, 0.53],
      [-0.09, 0.67],
    ];

    for (let i = 0; i < dots.length; i++) {
      const [u, v] = dots[i];
      const dotAt = point(u * width, v * length, front + 0.02);
      const dotFrame = colored.moved(dotAt);
      b.stick(
        new THREE.CylinderGeometry(0.014, 0.014, 0.009, 8),
        C.cream,
        dotFrame,
        {
          embed: 0.12,
          name: `${name}_creamDot${i}`,
          group: "s21-crown-dots",
        },
      );
    }

    return { name, color, base, x, y, n, length, width, part: colored };
  };

  // Three overlapping fans, kept inside the requested 0.62 × 0.38 × 0.16 m clear room.
  // The rear feathers are slightly lower and farther back; the center feather sits proud.
  const left = makeFeather(
    "s21_crownMagenta",
    C.magenta,
    new THREE.Vector3(0.15, 1.815, 1.445),
    0.34,
    0.245,
    0.19,
  );

  const right = makeFeather(
    "s21_crownCoral",
    C.coral,
    new THREE.Vector3(-0.15, 1.815, 1.445),
    -0.34,
    0.245,
    0.19,
  );

  const center = makeFeather(
    "s21_crownGold",
    C.gold,
    new THREE.Vector3(0, 1.825, 1.468),
    0,
    0.275,
    0.205,
  );

  // A compact carved boss hides the three feather roots and visually welds the fan to the skull.
  const crownBase = b.part(
    new THREE.CylinderGeometry(0.092, 0.108, 0.045, 10),
    C.brown,
    {
      bone: "head",
      at: [0, 1.805, 1.475],
      dir: [0, 1, 0],
      flat: true,
      name: "s21_crownRoot",
      group: "s21-crown-plume",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.061, 0.061, 0.014, 10),
    C.teal,
    {
      bone: "head",
      at: [0, 1.833, 1.475],
      dir: [0, 1, 0],
      flat: true,
      name: "s21_crownRootInset",
      group: "s21-crown-paint",
    },
  );

  // Small gold rays around the boss echo the folk-sun ornament on the breast.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const start = new THREE.Vector3(Math.sin(a) * 0.064, 1.844, 1.475 + Math.cos(a) * 0.064);
    const end = new THREE.Vector3(Math.sin(a) * 0.092, 1.844, 1.475 + Math.cos(a) * 0.092);
    b.rod(start, end, 0.006, {
      color: C.gold,
      bone: "head",
      name: `s21_crownRay${i}`,
      group: "s21-crown-paint",
    });
  }

  // A few raised turquoise chips at the lower edges give the three feathers a deliberately
  // hand-carved, slightly asymmetrical alebrije finish.
  const accentChips: [Feather, number, number][] = [
    [left, -0.3, 0.18],
    [left, 0.28, 0.48],
    [right, -0.28, 0.49],
    [right, 0.3, 0.2],
    [center, -0.27, 0.35],
    [center, 0.27, 0.62],
  ];

  for (let i = 0; i < accentChips.length; i++) {
    const [feather, u, v] = accentChips[i];
    const at = feather.base
      .clone()
      .addScaledVector(feather.x, u * feather.width)
      .addScaledVector(feather.y, v * feather.length)
      .addScaledVector(feather.n, 0.057);

    b.part(
      new THREE.OctahedronGeometry(0.014, 0),
      C.teal,
      {
        bone: "head",
        at,
        scale: [1.1, 0.55, 0.45],
        dir: feather.n,
        flat: true,
        name: `s21_crownTurquoiseChip${i}`,
        group: "s21-crown-paint",
      },
    );
  }
}
    return addCrownPlume;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addWingLFeatherFan(b: Builder) {
  const AT = new THREE.Vector3(1.35, 1.72, 0.08);
  const SURFACE_NORMAL = new THREE.Vector3(0.72, 0.52, -0.28).normalize();
  const BONE = "wingL_wrist";

  const featherMark = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180">
      <path d="M50 170 C39 136 37 92 50 16 C63 92 61 136 50 170Z"
        fill="${PALETTE.cream}" opacity=".92"/>
      <path d="M50 166 C48 126 48 72 50 18"
        stroke="${PALETTE.darkBrown}" stroke-width="5" fill="none"
        stroke-linecap="round"/>
      <path d="M48 126 L24 105 M49 105 L73 82 M49 78 L29 59 M50 53 L68 37"
        stroke="${PALETTE.gold}" stroke-width="7" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23 105 L31 113 L39 105 L31 97Z
               M61 82 L69 90 L77 82 L69 74Z
               M27 59 L35 67 L43 59 L35 51Z"
        fill="${PALETTE.magenta}" stroke="${PALETTE.darkBrown}" stroke-width="2"/>
      <circle cx="50" cy="145" r="7" fill="${PALETTE.turquoise}"
        stroke="${PALETTE.darkBrown}" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const featherMarkAlt = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180">
      <path d="M50 170 C39 136 37 92 50 16 C63 92 61 136 50 170Z"
        fill="${PALETTE.yellow}" opacity=".9"/>
      <path d="M50 166 C48 126 48 72 50 18"
        stroke="${PALETTE.darkBrown}" stroke-width="5" fill="none"
        stroke-linecap="round"/>
      <path d="M47 130 L25 112 M49 106 L74 87 M49 78 L27 61 M50 52 L69 39"
        stroke="${PALETTE.coral}" stroke-width="7" fill="none"
        stroke-linecap="round"/>
      <path d="M25 112 L33 120 L41 112 L33 104Z
               M62 87 L70 95 L78 87 L70 79Z
               M25 61 L33 69 L41 61 L33 53Z"
        fill="${PALETTE.teal}" stroke="${PALETTE.darkBrown}" stroke-width="2"/>
      <circle cx="50" cy="145" r="7" fill="${PALETTE.magenta}"
        stroke="${PALETTE.darkBrown}" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const lerpPoint = (a: THREE.Vector3, c: THREE.Vector3, t: number) =>
    a.clone().lerp(c, t);

  const featherColors = [
    PALETTE.turquoise,
    PALETTE.magenta,
    PALETTE.yellow,
    PALETTE.turquoise,
    PALETTE.magenta,
  ];

  const roots = [
    new THREE.Vector3(1.18, 1.59, 0.105),
    new THREE.Vector3(1.25, 1.64, 0.092),
    new THREE.Vector3(1.34, 1.69, 0.08),
    new THREE.Vector3(1.43, 1.71, 0.065),
    new THREE.Vector3(1.51, 1.71, 0.05),
  ];

  const tips = [
    new THREE.Vector3(1.50, 1.94, 0.06),
    new THREE.Vector3(1.55, 1.98, 0.045),
    new THREE.Vector3(1.61, 1.995, 0.025),
    new THREE.Vector3(1.655, 1.95, 0.005),
    new THREE.Vector3(1.68, 1.875, -0.015),
  ];

  const widths = [0.145, 0.15, 0.16, 0.145, 0.125];

  const surfaceAt = (target: THREE.Object3D, point: THREE.Vector3) =>
    b.surface(target).nearest(point);

  const raisedHit = (target: THREE.Object3D, point: THREE.Vector3, lift = 0.012) =>
    surfaceAt(target, point).moved([0, lift, 0]);

  for (let i = 0; i < roots.length; i++) {
    const root = roots[i];
    const tip = tips[i];
    const travel = tip.clone().sub(root);
    const featherDir = travel.clone().normalize();

    // A broad, low-poly feather blade. The fan overlaps from the inner feather outward.
    const across = new THREE.Vector3(-travel.y, travel.x, 0).normalize();
    const halfWidth = widths[i] * 0.5;
    const shoulder = travel.clone().multiplyScalar(0.34);
    const nearTip = travel.clone().multiplyScalar(0.82);

    const p0 = root.clone().addScaledVector(across, -halfWidth * 0.48);
    const p1 = root.clone().addScaledVector(across, halfWidth * 0.48);
    const p2 = root.clone().add(shoulder).addScaledVector(across, halfWidth * 0.52);
    const p3 = tip.clone().addScaledVector(across, halfWidth * 0.08);
    const p4 = tip.clone();
    const p5 = tip.clone().addScaledVector(across, -halfWidth * 0.08);
    const p6 = root
      .clone()
      .add(nearTip)
      .addScaledVector(across, -halfWidth * 0.52);

    const blade = b.slab([p0, p1, p2, p3, p4, p5, p6], {
      color: featherColors[i],
      thickness: 0.028,
      bone: BONE,
      name: `s22_wingL_feather${i}`,
      group: "stage2-wingL-feathers",
    });

    const bladeSurface = b.surface(blade.mesh);
    const centre = lerpPoint(root, tip, 0.53);
    const faceHit = bladeSurface.nearest(centre);
    const faceNormal = faceHit.n.clone().normalize();

    // A translucent-looking carved folk motif, projected exactly onto the blade.
    b.decal(blade, i % 2 === 0 ? featherMark : featherMarkAlt, {
      at: centre,
      dir: faceNormal,
      up: featherDir,
      size: [widths[i] * 0.78, travel.length() * 0.62],
      segments: 5,
      lift: 0.003,
      name: `s22_wingL_feather${i}_paint`,
      group: "stage2-wingL-painted-marks",
    });

    // Dark carved edge lines make each feather legible against the turquoise membrane.
    const edgeLift = 0.009;
    const leftEdgeA = bladeSurface.nearest(
      root.clone().addScaledVector(across, -halfWidth * 0.39),
    ).moved([0, edgeLift, 0]);
    const leftEdgeB = bladeSurface.nearest(
      tip.clone().addScaledVector(across, -halfWidth * 0.055),
    ).moved([0, edgeLift, 0]);
    const rightEdgeA = bladeSurface.nearest(
      root.clone().addScaledVector(across, halfWidth * 0.39),
    ).moved([0, edgeLift, 0]);
    const rightEdgeB = bladeSurface.nearest(
      tip.clone().addScaledVector(across, halfWidth * 0.055),
    ).moved([0, edgeLift, 0]);

    b.rod(leftEdgeA, leftEdgeB, 0.006, {
      color: PALETTE.darkBrown,
      bone: BONE,
      caps: "round",
      name: `s22_wingL_feather${i}_edgeL`,
      group: "stage2-wingL-feather-edges",
    });
    b.rod(rightEdgeA, rightEdgeB, 0.006, {
      color: PALETTE.darkBrown,
      bone: BONE,
      caps: "round",
      name: `s22_wingL_feather${i}_edgeR`,
      group: "stage2-wingL-feather-edges",
    });

    // Raised gold quill, following the face of the feather.
    const shaftA = raisedHit(blade.mesh, lerpPoint(root, tip, 0.08), 0.014);
    const shaftB = raisedHit(blade.mesh, lerpPoint(root, tip, 0.94), 0.014);
    b.rod(shaftA, shaftB, 0.009, {
      color: PALETTE.gold,
      bone: BONE,
      caps: "round",
      name: `s22_wingL_feather${i}_quill`,
      group: "stage2-wingL-feather-quills",
    });

    // Two little cross-bands per feather, built as seated low-poly carved bars.
    for (let band = 0; band < 2; band++) {
      const t = band === 0 ? 0.32 : 0.63;
      const bandPoint = lerpPoint(root, tip, t);
      const bandHit = raisedHit(blade.mesh, bandPoint, 0.012);
      b.stick(
        new THREE.BoxGeometry(widths[i] * (band === 0 ? 0.7 : 0.58), 0.018, 0.034),
        PALETTE.gold,
        bandHit,
        {
          embed: 0.48,
          flow: featherDir,
          bone: BONE,
          name: `s22_wingL_feather${i}_goldBand${band}`,
          group: "stage2-wingL-feather-bands",
        },
      );
    }

    // Small alternating rosette studs echo the face medallions and make the painted wood feel hand-carved.
    for (let mark = 0; mark < 2; mark++) {
      const t = mark === 0 ? 0.47 : 0.73;
      const side = mark === 0 ? -0.2 : 0.2;
      const markPoint = lerpPoint(root, tip, t).addScaledVector(
        across,
        side * widths[i],
      );
      const markHit = raisedHit(blade, markPoint, 0.011);
      b.stick(
        new THREE.CylinderGeometry(0.018, 0.018, 0.012, 7),
        mark === 0 ? PALETTE.cream : PALETTE.coral,
        markHit,
        {
          embed: 0.42,
          bone: BONE,
          name: `s22_wingL_feather${i}_rosette${mark}`,
          group: "stage2-wingL-feather-rosettes",
        },
      );
    }
  }

  // A carved magenta hub seats the whole fan at the supplied attachment point.
  const wingSurface = b.surface(b.root);
  const attachment = wingSurface.nearest(AT);

  b.stick(
    new THREE.CylinderGeometry(0.092, 0.102, 0.032, 10),
    PALETTE.magenta,
    attachment,
    {
      embed: 0.46,
      bone: BONE,
      name: "s22_wingL_featherFanHub",
      group: "stage2-wingL-feather-hub",
    },
  );

  b.stick(
    new THREE.CylinderGeometry(0.043, 0.049, 0.038, 8),
    PALETTE.turquoise,
    attachment.moved([0, 0.018, 0]),
    {
      embed: 0.42,
      bone: BONE,
      name: "s22_wingL_featherFanHubInset",
      group: "stage2-wingL-feather-hub",
    },
  );

  const hubRing = b.ring(
    attachment,
    {
      count: 6,
      radius: 0.075,
      fromDeg: 0,
      toDeg: 360,
      group: "stage2-wingL-feather-hub",
    },
  );

  for (const item of hubRing.items) {
    b.stick(
      new THREE.CylinderGeometry(0.014, 0.014, 0.018, 6),
      item.i % 2 === 0 ? PALETTE.gold : PALETTE.cream,
      item.moved([0, 0.012, 0]),
      {
        embed: 0.45,
        bone: BONE,
        name: `s22_wingL_featherFanHubStud${item.i}`,
        group: "stage2-wingL-feather-hub",
      },
    );
  }
}
    return addWingLFeatherFan;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addTailFeatherFan(b: Builder) {
  const tailCenter = new THREE.Vector3(0, 1.43, -1.82);
  const tailSurfaceNormal = new THREE.Vector3(0, 0.45, -0.9).normalize();
  const tailX = new THREE.Vector3(1, 0, 0);

  const featherOutline = (width: number, length: number): [number, number, "sharp"][] => [
    [-width * 0.5, 0, "sharp"],
    [width * 0.5, 0, "sharp"],
    [width * 0.47, length * 0.2, "sharp"],
    [width * 0.35, length * 0.5, "sharp"],
    [width * 0.16, length * 0.78, "sharp"],
    [0, length, "sharp"],
    [-width * 0.16, length * 0.78, "sharp"],
    [-width * 0.35, length * 0.5, "sharp"],
    [-width * 0.47, length * 0.2, "sharp"],
  ];

  const teardropOutline = (width: number, length: number): [number, number, "sharp"][] => [
    [-width * 0.5, 0, "sharp"],
    [width * 0.5, 0, "sharp"],
    [width * 0.42, length * 0.42, "sharp"],
    [0, length, "sharp"],
    [-width * 0.42, length * 0.42, "sharp"],
  ];

  const feathers = [
    {
      x: -0.135,
      lean: -0.2,
      length: 0.38,
      width: 0.17,
      color: PALETTE.magenta,
      name: "tailFeatherFan_outerL",
    },
    {
      x: 0,
      lean: 0,
      length: 0.45,
      width: 0.19,
      color: PALETTE.turquoise,
      name: "tailFeatherFan_center",
    },
    {
      x: 0.135,
      lean: 0.2,
      length: 0.38,
      width: 0.17,
      color: PALETTE.gold,
      name: "tailFeatherFan_outerR",
    },
  ];

  for (const feather of feathers) {
    const direction = new THREE.Vector3(feather.lean, 0.84, -0.54).normalize();
    const faceNormal = new THREE.Vector3().crossVectors(tailX, direction).normalize();
    const base = tailCenter
      .clone()
      .addScaledVector(tailX, feather.x)
      .addScaledVector(direction, -0.035)
      .addScaledVector(tailSurfaceNormal, 0.008);

    b.extrude(featherOutline(feather.width + 0.026, feather.length + 0.024), {
      at: base,
      x: tailX,
      y: direction,
      thickness: 0.035,
      bevel: 0.006,
      color: PALETTE.darkBrown,
      bone: "tailTip",
      name: `${feather.name}_outline`,
      group: "stage2-tail-feathers",
    });

    const coloredBase = base.clone().addScaledVector(faceNormal, 0.022);
    b.extrude(featherOutline(feather.width, feather.length), {
      at: coloredBase,
      x: tailX,
      y: direction,
      thickness: 0.026,
      bevel: 0.005,
      color: feather.color,
      bone: "tailTip",
      name: feather.name,
      group: "stage2-tail-feathers",
    });

    const motifAt = base
      .clone()
      .addScaledVector(direction, feather.length * 0.23)
      .addScaledVector(faceNormal, 0.043);

    b.extrude(teardropOutline(0.082, 0.145), {
      at: motifAt,
      x: tailX,
      y: direction,
      thickness: 0.018,
      bevel: 0.004,
      color: PALETTE.darkBrown,
      bone: "tailTip",
      name: `${feather.name}_teardropOutline`,
      group: "stage2-tail-feathers",
    });

    b.extrude(teardropOutline(0.052, 0.108), {
      at: motifAt.clone().addScaledVector(faceNormal, 0.014),
      x: tailX,
      y: direction,
      thickness: 0.012,
      bevel: 0.003,
      color: PALETTE.cream,
      bone: "tailTip",
      name: `${feather.name}_teardrop`,
      group: "stage2-tail-feathers",
    });

    const shaftStart = base
      .clone()
      .addScaledVector(direction, 0.035)
      .addScaledVector(faceNormal, 0.043);
    const shaftEnd = base
      .clone()
      .addScaledVector(direction, feather.length * 0.88)
      .addScaledVector(faceNormal, 0.043);

    b.rod(shaftStart, shaftEnd, 0.009, {
      color: PALETTE.gold,
      bone: "tailTip",
      name: `${feather.name}_goldShaft`,
      group: "stage2-tail-feathers",
    });

    const bandCenter = base
      .clone()
      .addScaledVector(direction, feather.length * 0.63)
      .addScaledVector(faceNormal, 0.049);
    const bandA = bandCenter.clone().addScaledVector(tailX, -feather.width * 0.31);
    const bandB = bandCenter.clone().addScaledVector(tailX, feather.width * 0.31);

    b.rod(bandA, bandB, 0.012, {
      color: PALETTE.cream,
      bone: "tailTip",
      name: `${feather.name}_creamBand`,
      group: "stage2-tail-feathers",
    });
  }

  // Small painted beads at the feather roots make the fan feel carved and assembled rather than printed flat.
  for (const x of [-0.16, 0, 0.16]) {
    const bead = tailCenter
      .clone()
      .add(new THREE.Vector3(x, -0.018, -0.022))
      .addScaledVector(tailSurfaceNormal, 0.075);

    b.part(new THREE.SphereGeometry(0.026, 7, 5), PALETTE.gold, {
      at: bead,
      bone: "tailTip",
      scale: [1, 0.72, 1],
      flat: true,
      name: `tailFeatherFan_rootBead${x}`,
      group: "stage2-tail-feathers",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Left cheek rosette: a layered, low-poly wooden medallion seated on the cheek.

  const cheekCenter = new THREE.Vector3(0.25, 1.52, 1.78);
  const cheekNormal = new THREE.Vector3(0.28, 0.12, 0.95).normalize();

  const cheekX = new THREE.Vector3(1, 0, 0)
    .addScaledVector(cheekNormal, -cheekNormal.x)
    .normalize();
  const cheekY = new THREE.Vector3().crossVectors(cheekNormal, cheekX).normalize();

  const disc = (
    radius: number,
    height: number,
    at: THREE.Vector3,
    color: string,
    name: string,
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir: cheekNormal,
      bone: "head",
      flat: true,
      name,
      group: "stage2-cheek-rosette",
    });

  disc(
    0.142,
    0.026,
    cheekCenter.clone().addScaledVector(cheekNormal, 0.012),
    PALETTE.darkBrown,
    "leftCheekRosette_outerInkRing",
    14,
  );

  disc(
    0.123,
    0.021,
    cheekCenter.clone().addScaledVector(cheekNormal, 0.029),
    PALETTE.cream,
    "leftCheekRosette_creamGround",
    14,
  );

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const radial = cheekX.clone().applyAxisAngle(cheekNormal, angle).normalize();
    const petalCenter = cheekCenter
      .clone()
      .addScaledVector(radial, 0.071)
      .addScaledVector(cheekNormal, 0.052);

    const color =
      i % 3 === 0 ? PALETTE.cream : i % 3 === 1 ? PALETTE.gold : PALETTE.magenta;

    b.part(new THREE.SphereGeometry(1, 9, 6), color, {
      at: petalCenter,
      dir: cheekNormal,
      up: radial,
      bone: "head",
      scale: [0.047, 0.021, 0.073],
      flat: true,
      name: `leftCheekRosette_petal${i}`,
      group: "stage2-cheek-rosette",
    });

    const separatorStart = cheekCenter
      .clone()
      .addScaledVector(radial, 0.025)
      .addScaledVector(cheekNormal, 0.067);
    const separatorEnd = cheekCenter
      .clone()
      .addScaledVector(radial, 0.111)
      .addScaledVector(cheekNormal, 0.067);

    b.rod(separatorStart, separatorEnd, 0.0065, {
      color: PALETTE.darkBrown,
      bone: "head",
      name: `leftCheekRosette_separator${i}`,
      group: "stage2-cheek-rosette",
    });

    const bead = cheekCenter
      .clone()
      .addScaledVector(radial, 0.118)
      .addScaledVector(cheekNormal, 0.071);

    b.part(new THREE.SphereGeometry(0.014, 7, 5), PALETTE.gold, {
      at: bead,
      bone: "head",
      flat: true,
      name: `leftCheekRosette_outerBead${i}`,
      group: "stage2-cheek-rosette",
    });
  }

  disc(
    0.056,
    0.034,
    cheekCenter.clone().addScaledVector(cheekNormal, 0.073),
    PALETTE.turquoise,
    "leftCheekRosette_turquoiseCenter",
    12,
  );

  b.part(new THREE.SphereGeometry(0.019, 8, 5), PALETTE.magenta, {
    at: cheekCenter.clone().addScaledVector(cheekNormal, 0.101),
    bone: "head",
    flat: true,
    name: "leftCheekRosette_centerJewel",
    group: "stage2-cheek-rosette",
  });

  // Three short dark rays between the petals reinforce the hand-painted outline at the medallion's heart.
  for (const angle of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]) {
    const radial = cheekX.clone().applyAxisAngle(cheekNormal, angle).normalize();
    const rayStart = cheekCenter
      .clone()
      .addScaledVector(radial, 0.043)
      .addScaledVector(cheekNormal, 0.092);
    const rayEnd = cheekCenter
      .clone()
      .addScaledVector(radial, 0.085)
      .addScaledVector(cheekNormal, 0.092);

    b.rod(rayStart, rayEnd, 0.005, {
      color: PALETTE.darkBrown,
      bone: "head",
      name: `leftCheekRosette_innerRay${angle}`,
      group: "stage2-cheek-rosette",
    });
  }
}
    return addTailFeatherFan;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addRightCheekRosette(b: Builder) {
  const P = PALETTE;

  const magentaWood = grain(P.magenta, P.coral, {
    size: 0.045,
    axis: [0, 1, 0],
    seed: 241,
  });
  const goldWood = grain(P.gold, P.yellow, {
    size: 0.035,
    axis: [0, 1, 0],
    seed: 242,
  });
  const creamWood = grain(P.cream, P.belly, {
    size: 0.05,
    axis: [0, 1, 0],
    seed: 243,
  });
  const turquoiseWood = grain(P.turquoise, P.teal, {
    size: 0.04,
    axis: [0, 0, 1],
    seed: 244,
  });

  // -------------------------------------------------------------------------------------------------------------
  // RIGHT CHEEK ROSETTE
  //
  // The requested point is the centre of the ornament. The rosette is assembled as a dark carved ring, a shallow
  // cream plaque, six chunky wooden petals, raised radial spokes, and a turquoise cabochon. Everything is explicitly
  // placed on the head bone so the whole medallion follows the head as one readable ornament.

  const cheekAt = new THREE.Vector3(-0.25, 1.52, 1.78);
  const cheekNormal = new THREE.Vector3(-0.28, 0.12, 0.95).normalize();

  const cheekUp = new THREE.Vector3(0, 1, 0)
    .addScaledVector(cheekNormal, -cheekNormal.y)
    .normalize();
  const cheekSide = cheekUp.clone().cross(cheekNormal).normalize();
  const cheekCenter = cheekAt.clone().addScaledVector(cheekNormal, 0.022);

  b.part(new THREE.TorusGeometry(0.132, 0.017, 6, 16), P.darkBrown, {
    bone: "head",
    at: cheekCenter,
    dir: cheekNormal,
    name: "s24_rightCheekRosette_outerRing",
    group: "cheek-rosette",
  });

  b.part(new THREE.CylinderGeometry(0.112, 0.112, 0.018, 12), creamWood, {
    bone: "head",
    at: cheekCenter.clone().addScaledVector(cheekNormal, 0.008),
    dir: cheekNormal,
    name: "s24_rightCheekRosette_plaque",
    group: "cheek-rosette",
  });

  // Dark radial carving marks remain visible between the petals.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const radial = cheekSide
      .clone()
      .multiplyScalar(Math.cos(a))
      .addScaledVector(cheekUp, Math.sin(a))
      .normalize();

    const spokeStart = cheekCenter.clone().addScaledVector(radial, 0.028);
    const spokeEnd = cheekCenter.clone().addScaledVector(radial, 0.101);

    b.rod(spokeStart, spokeEnd, 0.009, {
      color: P.darkBrown,
      bone: "head",
      name: `s24_rightCheekRosette_spoke${i}`,
      group: "cheek-rosette",
    });
  }

  const petalColors = [P.magenta, goldWood, P.magenta, P.turquoise, goldWood, P.magenta];

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const radial = cheekSide
      .clone()
      .multiplyScalar(Math.cos(a))
      .addScaledVector(cheekUp, Math.sin(a))
      .normalize();

    const petalAt = cheekCenter
      .clone()
      .addScaledVector(radial, 0.064)
      .addScaledVector(cheekNormal, 0.019);

    // Local +Z points from the medallion centre toward the petal tip.
    const petalFrame = frame(petalAt, cheekNormal, radial);

    b.part(new THREE.SphereGeometry(1, 8, 5), petalColors[i], {
      bone: "head",
      frame: petalFrame,
      scale: [0.047, 0.016, 0.075],
      flat: true,
      name: `s24_rightCheekRosette_petal${i}`,
      group: "cheek-rosette",
    });

    // A small cream/gold carved bead at every petal tip gives the ornament a hand-painted punctuation mark.
    const tipAt = cheekCenter
      .clone()
      .addScaledVector(radial, 0.119)
      .addScaledVector(cheekNormal, 0.032);

    b.part(new THREE.SphereGeometry(0.015, 6, 4), i % 2 === 0 ? P.cream : goldWood, {
      bone: "head",
      at: tipAt,
      dir: cheekNormal,
      flat: true,
      name: `s24_rightCheekRosette_tipDot${i}`,
      group: "cheek-rosette",
    });
  }

  b.part(new THREE.TorusGeometry(0.054, 0.009, 5, 12), P.darkBrown, {
    bone: "head",
    at: cheekCenter.clone().addScaledVector(cheekNormal, 0.041),
    dir: cheekNormal,
    name: "s24_rightCheekRosette_innerRing",
    group: "cheek-rosette",
  });

  b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.025, 8), turquoiseWood, {
    bone: "head",
    at: cheekCenter.clone().addScaledVector(cheekNormal, 0.047),
    dir: cheekNormal,
    name: "s24_rightCheekRosette_turquoiseHeart",
    group: "cheek-rosette",
  });

  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.cream, {
    bone: "head",
    at: cheekCenter
      .clone()
      .addScaledVector(cheekNormal, 0.065)
      .addScaledVector(cheekUp, 0.018)
      .addScaledVector(cheekSide, -0.014),
    name: "s24_rightCheekRosette_highlight",
    group: "cheek-rosette",
  });

  // -------------------------------------------------------------------------------------------------------------
  // NECK COLLAR
  //
  // Use the already-built model surface to obtain the actual cross-section of the neck. This keeps the collar seated
  // against the sloping neck rather than making a free-floating horizontal torus.

  const modelSurface = b.surface(b.root);
  const collarPlane = frame(new THREE.Vector3(0, 1.31, 1.31), [0, 0, 1], [0, 1, 0]);
  const collarPath = modelSurface.loop(collarPlane, { lift: 0.009 });

  const collar = b.sweep(collarPath, 0.057, {
    color: magentaWood,
    bone: "neckMid",
    section: { ngon: 8 },
    caps: "none",
    smooth: false,
    name: "s24_neckCollar_magentaBand",
    group: "neck-collar",
  });

  // Narrow wooden cords make the broad band read as a carved layered collar.
  b.sweep(collarPath, 0.014, {
    color: goldWood,
    bone: "neckMid",
    section: { ngon: 6 },
    caps: "none",
    smooth: false,
    name: "s24_neckCollar_upperGoldCord",
    group: "neck-collar",
  });

  // A cream lower cord sits just below the magenta band and is partly hidden by the scallop beads.
  b.sweep(collarPath, 0.011, {
    color: creamWood,
    bone: "neckMid",
    section: { ngon: 6 },
    caps: "none",
    smooth: false,
    name: "s24_neckCollar_lowerCreamCord",
    group: "neck-collar",
  });

  const collarSurface = b.surface(collar);
  const neckCentre = new THREE.Vector3(0, 1.31, 1.31);

  // Repeating diamond plates and turquoise studs are seated on the outward side of the collar tube.
  for (let i = 0; i < 12; i++) {
    const t = i / 12;
    const pathPoint = collarPath.at(t);
    const radial = pathPoint.clone().sub(neckCentre);

    if (radial.lengthSq() < 0.0001) radial.set(0, 0, 1);
    radial.normalize();

    const plateHit = collarSurface.nearest(pathPoint.clone().addScaledVector(radial, 0.07));

    if (plateHit) {
      b.stick(
        new THREE.CylinderGeometry(0.037, 0.037, 0.016, 4),
        goldWood,
        plateHit,
        {
          embed: 0.42,
          spin: 45,
          name: `s24_neckCollar_goldDiamond${i}`,
          group: "neck-collar",
        },
      );

      const studFrame = plateHit.moved([0, 0.019, 0]);
      b.stick(new THREE.SphereGeometry(0.013, 6, 4), turquoiseWood, studFrame, {
        embed: 0.45,
        name: `s24_neckCollar_turquoiseStud${i}`,
        group: "neck-collar",
      });
    }
  }

  // Cream scallops hang along the lower edge as rounded carved beads. Their query point is derived from the live
  // collar path, so they continue to follow the neck if the collar or neck is posed later.
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12;
    const pathPoint = collarPath.at(t);
    const radial = pathPoint.clone().sub(neckCentre);

    if (radial.lengthSq() < 0.0001) radial.set(0, 0, 1);
    radial.normalize();

    const lowerQuery = pathPoint
      .clone()
      .addScaledVector(radial, 0.052)
      .add(new THREE.Vector3(0, -0.052, 0));

    const scallopHit = collarSurface.nearest(lowerQuery);

    if (scallopHit) {
      b.stick(new THREE.SphereGeometry(1, 7, 5), creamWood, scallopHit, {
        embed: 0.48,
        scale: [0.032, 0.047, 0.032],
        name: `s24_neckCollar_creamScallop${i}`,
        group: "neck-collar",
      });

      // Tiny magenta inset on alternating scallops makes the lower edge feel painted rather than mechanically
      // repeated.
      if (i % 2 === 0) {
        const inset = scallopHit.moved([0, 0.039, 0]);
        b.stick(new THREE.SphereGeometry(0.009, 6, 4), P.magenta, inset, {
          embed: 0.5,
          name: `s24_neckCollar_scallopInset${i}`,
          group: "neck-collar",
        });
      }
    }
  }

  // Two slightly larger front medallions anchor the collar visually beneath the head, without covering the face.
  const frontHits = [
    collarSurface.nearest(new THREE.Vector3(0.075, 1.275, 1.43)),
    collarSurface.nearest(new THREE.Vector3(-0.075, 1.275, 1.43)),
  ];

  frontHits.forEach((hit, i) => {
    if (!hit) return;

    b.stick(new THREE.CylinderGeometry(0.029, 0.029, 0.014, 6), P.coral, hit, {
      embed: 0.4,
      spin: i * 30,
      name: `s24_neckCollar_frontMedallion${i}`,
      group: "neck-collar",
    });

    b.stick(new THREE.SphereGeometry(0.009, 6, 4), P.gold, hit.moved([0, 0.018, 0]), {
      embed: 0.45,
      name: `s24_neckCollar_frontMedallionDot${i}`,
      group: "neck-collar",
    });
  });
}
    return addRightCheekRosette;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addBreastEmblem(b: Builder) {
  const emblemAt = new THREE.Vector3(0, 1.25, 1.05);
  const normal = new THREE.Vector3(0, 0.18, 0.98).normalize();

  // A tangent basis for the slightly tilted front of the breast plate.
  const across = new THREE.Vector3(1, 0, 0);
  const vertical = new THREE.Vector3(0, normal.z, -normal.y).normalize();

  const point = (x: number, y: number, lift: number) =>
    emblemAt
      .clone()
      .addScaledVector(across, x)
      .addScaledVector(vertical, y)
      .addScaledVector(normal, lift);

  const rotatedBasis = (angle: number) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const radial = across.clone().multiplyScalar(c).addScaledVector(vertical, s);
    const tangent = across.clone().multiplyScalar(-s).addScaledVector(vertical, c);
    return { radial, tangent };
  };

  // Eight dark carved rays form the ink-like silhouette behind the colored rays.
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const { radial, tangent } = rotatedBasis(angle);
    const darkBase = emblemAt
      .clone()
      .addScaledVector(radial, 0.062)
      .addScaledVector(normal, 0.008);

    const darkOutline: OutlinePoint[] = [
      [-0.022, 0],
      [0.022, 0],
      [0.017, 0.064],
      [0, 0.101, "sharp"],
      [-0.017, 0.064],
    ];

    b.extrude(darkOutline, {
      at: darkBase,
      x: tangent,
      y: radial,
      thickness: 0.018,
      bevel: 0.003,
      color: PALETTE.darkBrown,
      bone: "spine4",
      name: `breastSunRayOutline${i}`,
      group: "breast-emblem",
    });

    const goldBase = emblemAt
      .clone()
      .addScaledVector(radial, 0.069)
      .addScaledVector(normal, 0.019);

    const goldOutline: OutlinePoint[] = [
      [-0.012, 0],
      [0.012, 0],
      [0.009, 0.053],
      [0, 0.082, "sharp"],
      [-0.009, 0.053],
    ];

    b.extrude(goldOutline, {
      at: goldBase,
      x: tangent,
      y: radial,
      thickness: 0.013,
      bevel: 0.002,
      color: PALETTE.gold,
      bone: "spine4",
      name: `breastSunRay${i}`,
      group: "breast-emblem",
    });
  }

  // Raised dark rim, turquoise jaguar face, and a magenta carved heart.
  b.part(
    new THREE.CylinderGeometry(0.101, 0.101, 0.019, 12),
    PALETTE.darkBrown,
    {
      bone: "spine4",
      at: point(0, 0, 0.018),
      dir: normal,
      axis: "y",
      flat: true,
      name: "breastSunOuterRim",
      group: "breast-emblem",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.086, 0.086, 0.018, 12),
    PALETTE.turquoise,
    {
      bone: "spine4",
      at: point(0, 0, 0.032),
      dir: normal,
      axis: "y",
      flat: true,
      name: "breastJaguarFace",
      group: "breast-emblem",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.041, 0.041, 0.022, 10),
    PALETTE.magenta,
    {
      bone: "spine4",
      at: point(0, -0.006, 0.049),
      dir: normal,
      axis: "y",
      flat: true,
      name: "breastJaguarHeart",
      group: "breast-emblem",
    },
  );

  // Tiny graphic face: almond eyes, a carved nose, and a smiling mouth.
  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      PALETTE.darkBrown,
      {
        bone: "spine4",
        at: point(side * 0.029, 0.022, 0.062),
        scale: [0.012, 0.018, 0.006],
        flat: true,
        name: `breastJaguarEye${side > 0 ? "L" : "R"}`,
        group: "breast-emblem",
      },
    );

    b.rod(
      point(side * 0.039, 0.007, 0.062),
      point(side * 0.066, -0.002, 0.061),
      0.004,
      {
        color: PALETTE.darkBrown,
        bone: "spine4",
        section: { ngon: 5 },
        caps: "round",
        name: `breastWhisker${side > 0 ? "L" : "R"}`,
        group: "breast-emblem",
      },
    );
  }

  b.part(
    new THREE.SphereGeometry(1, 6, 4),
    PALETTE.darkBrown,
    {
      bone: "spine4",
      at: point(0, -0.018, 0.064),
      scale: [0.012, 0.009, 0.006],
      flat: true,
      name: "breastJaguarNose",
      group: "breast-emblem",
    },
  );

  b.rod(
    point(-0.022, -0.035, 0.062),
    point(0.022, -0.035, 0.062),
    0.004,
    {
      color: PALETTE.darkBrown,
      bone: "spine4",
      section: { ngon: 5 },
      caps: "round",
      name: "breastJaguarSmile",
      group: "breast-emblem",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Left forepaw: three chunky cream talons with hooked dark tips, gold root collars, and painted studs.

  const pawCenter = new THREE.Vector3(0.5, 0.16, 0.9);
  const toeOffsets = [-0.068, 0, 0.068];

  for (let i = 0; i < 3; i++) {
    const spread = toeOffsets[i];
    const splay = (i - 1) * 0.025;

    const base = new THREE.Vector3(0.5 + spread, 0.181, 0.895);
    const bend = new THREE.Vector3(0.5 + spread + splay * 0.35, 0.166, 0.965);
    const end = new THREE.Vector3(0.5 + spread + splay, 0.153, 1.045);
    const clawTip = new THREE.Vector3(0.5 + spread + splay * 1.35, 0.128, 1.112);

    const talonPath = catmull([base, bend, end]);
    b.sweep(talonPath, (t: number) => 0.029 - t * 0.009, {
      color: PALETTE.cream,
      bone: "pawL",
      section: { ngon: 6 },
      smooth: false,
      caps: "round",
      name: `leftForeTalon${i}`,
      group: "left-talons",
    });

    b.spike(end, clawTip, null, 0.019, {
      color: PALETTE.darkBrown,
      bone: "pawL",
      section: { ngon: 6 },
      caps: "point",
      name: `leftForeClaw${i}`,
      group: "left-talons",
    });

    // A raised gold collar makes each talon read as carved and separately decorated.
    b.part(
      new THREE.CylinderGeometry(0.033, 0.031, 0.014, 8),
      PALETTE.gold,
      {
        bone: "pawL",
        at: new THREE.Vector3(base.x, base.y + 0.004, base.z),
        dir: [0, 1, 0],
        flat: true,
        name: `leftTalonGoldBand${i}`,
        group: "left-talons",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.011, 6, 4),
      i === 1 ? PALETTE.magenta : PALETTE.turquoise,
      {
        bone: "pawL",
        at: new THREE.Vector3(base.x, base.y + 0.016, base.z - 0.018),
        flat: true,
        name: `leftTalonPaintStud${i}`,
        group: "left-talons",
      },
    );
  }

  // Two small cream-and-gold carved beads tucked behind the talon roots enrich the paw silhouette.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.018, 7, 5),
      PALETTE.gold,
      {
        bone: "pawL",
        at: pawCenter.clone().add(new THREE.Vector3(side * 0.11, 0.055, -0.045)),
        flat: true,
        name: `leftPawGoldBead${side > 0 ? "Outer" : "Inner"}`,
        group: "left-talons",
      },
    );
  }
}
    return addBreastEmblem;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addRightTalonSet(b: Builder) {
  const bone = "pawR";

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const along = (a: THREE.Vector3, c: THREE.Vector3, t: number) =>
    a.clone().lerp(c, t);

  // -------------------------------------------------------------------------------------------------------------
  // Right forepaw: three broad, carved cream talons. The existing paw already has simple toes; these raised,
  // ornamented toes sit over them as the requested hero detail, with gold root collars and dark hooked tips.

  const bases = [
    v(-0.585, 0.165, 0.885),
    v(-0.505, 0.155, 0.905),
    v(-0.425, 0.165, 0.89),
  ];

  const tips = [
    v(-0.615, 0.145, 1.115),
    v(-0.505, 0.135, 1.145),
    v(-0.395, 0.145, 1.115),
  ];

  for (let i = 0; i < 3; i++) {
    const base = bases[i];
    const tip = tips[i];
    const direction = tip.clone().sub(base).normalize();
    const collarStart = base.clone().addScaledVector(direction, 0.018);
    const collarEnd = base.clone().addScaledVector(direction, 0.073);
    const creamEnd = tip.clone().addScaledVector(direction, -0.052);
    const label = `s26_talonR${i + 1}`;

    // Gold carved band, slightly oversized so it reads as a painted collar around the root.
    b.rod(collarStart, collarEnd, 0.041, {
      color: PALETTE.gold,
      bone,
      section: { ngon: 7 },
      caps: "flat",
      name: `${label}_goldBand`,
      group: "s26-talons",
    });

    // Faceted cream talon shaft.
    b.rod(collarEnd, creamEnd, 0.034, {
      color: PALETTE.cream,
      bone,
      section: { ngon: 7 },
      caps: "round",
      name: `${label}_creamShaft`,
      group: "s26-talons",
    });

    // Pointed dark claw, angled very slightly outward on each side toe.
    b.spike(creamEnd, tip, null, 0.031, {
      color: PALETTE.darkBrown,
      bone,
      section: { ngon: 6 },
      caps: "point",
      name: `${label}_darkHook`,
      group: "s26-talons",
    });

    // A small turquoise inlay at each collar makes the paw belong to the same painted folk palette as the wings.
    const inlay = base.clone().addScaledVector(direction, 0.043);
    b.part(new THREE.SphereGeometry(0.018, 7, 5), PALETTE.turquoise, {
      bone,
      at: inlay,
      scale: [1, 0.72, 0.7],
      dir: direction,
      flat: true,
      name: `${label}_turquoiseInlay`,
      group: "s26-talons",
    });
  }

  // Tiny magenta carved dots on the paw's upper knuckles, kept between the talons rather than floating above them.
  for (let i = 0; i < 2; i++) {
    b.part(new THREE.SphereGeometry(0.022, 7, 5), PALETTE.magenta, {
      bone,
      at: v(-0.55 + i * 0.095, 0.225, 0.905),
      scale: [1.15, 0.5, 0.7],
      flat: true,
      name: `s26_pawRKnuckle${i + 1}`,
      group: "s26-talons",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Upper-beak glyph: a raised cream diamond plaque with a dark-brown hand-painted zigzag. The plaque is oriented
  // from the supplied outward normal, so its face follows the slanted gold beak rather than using a world-facing card.

  const beakAt = v(0, 1.55, 1.98);
  const beakNormal = v(0, -0.12, 0.99).normalize();
  const beakX = v(1, 0, 0);
  const beakUp = v(0, 1, 0)
    .addScaledVector(beakNormal, -beakNormal.y)
    .normalize();

  const plaqueAt = beakAt.clone().addScaledVector(beakNormal, 0.008);

  b.extrude(
    [
      [-0.065, -0.012],
      [-0.018, -0.052],
      [0.048, -0.03],
      [0.068, 0.012],
      [0.018, 0.052],
      [-0.05, 0.032],
    ],
    {
      at: plaqueAt,
      x: beakX,
      y: beakUp,
      thickness: 0.009,
      bevel: 0.003,
      smoothing: 1,
      color: PALETTE.cream,
      bone: "head",
      name: "s26_beakGlyphPlaque",
      group: "s26-beak-glyph",
    },
  );

  const glyphLift = beakAt.clone().addScaledVector(beakNormal, 0.018);
  const glyphPoints = [
    glyphLift.clone().addScaledVector(beakX, -0.052).addScaledVector(beakUp, -0.027),
    glyphLift.clone().addScaledVector(beakX, -0.018).addScaledVector(beakUp, 0.028),
    glyphLift.clone().addScaledVector(beakX, 0.018).addScaledVector(beakUp, -0.012),
    glyphLift.clone().addScaledVector(beakX, 0.052).addScaledVector(beakUp, 0.032),
  ];

  // Cream under-stroke gives the dark glyph the thick, imperfectly painted border characteristic of carved folk art.
  for (let i = 0; i < glyphPoints.length - 1; i++) {
    b.rod(glyphPoints[i], glyphPoints[i + 1], 0.017, {
      color: PALETTE.cream,
      bone: "head",
      section: { ngon: 5 },
      caps: "round",
      name: `s26_beakGlyphBorder${i + 1}`,
      group: "s26-beak-glyph",
    });
  }

  const darkPoints = glyphPoints.map((p) =>
    p.clone().addScaledVector(beakNormal, 0.008),
  );

  for (let i = 0; i < darkPoints.length - 1; i++) {
    b.rod(darkPoints[i], darkPoints[i + 1], 0.009, {
      color: PALETTE.darkBrown,
      bone: "head",
      section: { ngon: 5 },
      caps: "round",
      name: `s26_beakGlyphInk${i + 1}`,
      group: "s26-beak-glyph",
    });
  }

  // Two tiny cream paint daubs at the glyph's upper corners make the border feel hand-applied instead of machined.
  for (const [i, p] of [
    [0, darkPoints[0]],
    [1, darkPoints[darkPoints.length - 1]],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), PALETTE.cream, {
      bone: "head",
      at: p.clone().addScaledVector(beakNormal, 0.006),
      flat: true,
      name: `s26_beakGlyphDab${i + 1}`,
      group: "s26-beak-glyph",
    });
  }
}
    return addRightTalonSet;
  })(),
);
