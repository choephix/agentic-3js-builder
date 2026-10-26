```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  limb,
  paint,
  svg,
} from "agentic-3js-builder";

const RED = "#e53935";
const BLUE = "#1657b8";
const YELLOW = "#f6c515";
const CREAM = "#fff1c7";
const INK = "#171522";
const OCHRE = "#d98224";
const WOOD_DARK = "#56301e";
const WOOD_LIGHT = "#a36535";
const WHITE = "#ffffff";

const BODY = paint((_p, n) => (n.y < -0.18 ? CREAM : YELLOW));
const BRANCH = paint((_p, n) => (n.y > 0.35 ? WOOD_LIGHT : WOOD_DARK));

const EYE_TEXTURE = svg(
  `<svg viewBox="0 0 100 128" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="65" rx="39" ry="55" fill="${INK}"/>
    <ellipse cx="50" cy="66" rx="29" ry="43" fill="${CREAM}"/>
    <circle cx="50" cy="68" r="25" fill="${BLUE}"/>
    <path d="M25 64 Q50 30 75 64 Q50 52 25 64Z" fill="#244386"/>
    <path d="M25 72 Q50 105 75 72 Q50 88 25 72Z" fill="#38a9c8"/>
    <ellipse cx="50" cy="70" rx="10" ry="22" fill="${INK}"/>
    <circle cx="39" cy="49" r="8" fill="${WHITE}"/>
    <rect x="57" y="79" width="7" height="11" rx="2" fill="${WHITE}"/>
    <path d="M17 18 L35 26 M83 18 L65 26" stroke="${RED}" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const CHEEK_TEXTURE = svg(
  `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" fill="${INK}"/>
    <circle cx="40" cy="40" r="30" fill="${RED}"/>
    <path d="M10 40 A30 30 0 0 0 70 40 L40 40Z" fill="${BLUE}"/>
    <circle cx="40" cy="40" r="9" fill="${YELLOW}"/>
    <rect x="36" y="10" width="8" height="60" fill="${CREAM}" opacity=".85"/>
  </svg>`,
  { size: 128 },
);

const CHEST_BADGE = svg(
  `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="54" fill="${INK}"/>
    <circle cx="60" cy="60" r="47" fill="${CREAM}"/>
    <path d="M60 13 A47 47 0 0 1 107 60 L60 60Z" fill="${RED}"/>
    <path d="M13 60 A47 47 0 0 1 60 107 L60 60Z" fill="${BLUE}"/>
    <circle cx="60" cy="60" r="16" fill="${YELLOW}"/>
    <path d="M60 42 V78 M42 60 H78" stroke="${INK}" stroke-width="5"/>
  </svg>`,
  { size: 192 },
);

const WING_MARK = svg(
  `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 78 L42 10 L79 78Z" fill="${BLUE}"/>
    <path d="M48 78 L84 10 L121 78Z" fill="${YELLOW}"/>
    <path d="M91 78 L127 10 L154 78Z" fill="${RED}"/>
    <path d="M25 69 H135" stroke="${INK}" stroke-width="7"/>
    <circle cx="81" cy="49" r="8" fill="${CREAM}"/>
  </svg>`,
  { size: 192 },
);

const TAIL_MARK = svg(
  `<svg viewBox="0 0 60 150" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5 H55 L43 145 H17Z" fill="${BLUE}"/>
    <path d="M10 18 H50 L45 38 H8Z" fill="${RED}"/>
    <path d="M9 53 H48 L46 69 H7Z" fill="${YELLOW}"/>
    <path d="M8 88 H45 L43 102 H7Z" fill="${CREAM}"/>
    <path d="M7 121 H42 L41 137 H16Z" fill="${INK}"/>
  </svg>`,
  { size: 192 },
);

const BRANCH_CUT = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="${CREAM}" stroke="${INK}" stroke-width="5"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="${WOOD_DARK}" stroke-width="5"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="${WOOD_LIGHT}" stroke-width="5"/>
    <path d="M20 23 L39 36 M78 25 L65 39 M23 76 L38 64" stroke="${RED}" stroke-width="5"/>
  </svg>`,
  { size: 160 },
);

function mirroredPoint(
  side: number,
  p: readonly [number, number, number],
): [number, number, number] {
  return [side * p[0], p[1], p[2]];
}

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A low-poly songbird assembled from bold primary-colour geometry, graphic decals, articulated wings, toes, tail feathers, and a rooted angular branch.",
};

export default function build() {
  const b = createBuilder({
    name: "bauhaus-songbird",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first

  const hips = b.joint("hips", {
    at: [0, 1.035, -0.14],
    dir: [0, 0.15, 1],
    role: "spine",
    group: "bird",
  });

  const spinePath = catmull([
    [0, 1.045, -0.12],
    [0, 1.11, 0.01],
    [0, 1.22, 0.18],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "chest", "chestTip"],
    role: "spine",
    group: "bird",
  });

  const chest = spine.tip ?? spine.joints[spine.joints.length - 1];

  const neckPath = catmull([
    chest.at,
    [0, 1.34, 0.245],
    [0, 1.47, 0.29],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: chest,
    names: ["neck1", "neck2", "neckTip"],
    role: "neck",
    group: "bird",
  });

  const neckTip = neck.tip ?? neck.joints[neck.joints.length - 1];

  const head = b.joint("head", {
    parent: neckTip,
    at: [0, 1.505, 0.305],
    dir: [0, 0, 1],
    role: "head",
    group: "bird",
  });

  const upperJaw = b.joint("jawUpper", {
    parent: head,
    at: head.local([0, 0.155, 0.005]),
    aim: head.local([0, 0.36, 0.005]),
    role: "jaw",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.155, -0.018]),
    aim: head.local([0, 0.35, -0.055]),
    role: "jaw",
    group: "face",
  });

  b.pose(jaw, {
    axis: [1, 0, 0],
    deg: 8,
  });

  const tailPath = catmull([
    [0, 1.07, -0.19],
    [0, 1.035, -0.35],
    [0, 1.04, -0.58],
    [0, 1.075, -0.78],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
    group: "bird",
  });

  const wingLPath = catmull([
    [0.18, 1.245, 0.09],
    [0.41, 1.345, 0.09],
    [0.69, 1.405, 0.035],
    [0.96, 1.365, -0.055],
  ]);

  const wingRPath = catmull([
    [-0.18, 1.245, 0.09],
    [-0.41, 1.345, 0.09],
    [-0.69, 1.405, 0.035],
    [-0.96, 1.365, -0.055],
  ]);

  const wingL = b.chain("wingL", wingLPath, {
    parent: chest,
    names: ["wingL", "elbowL", "wristL", "wingTipL"],
    role: "wing",
    group: "wings",
  });

  const wingR = b.chain("wingR", wingRPath, {
    parent: chest,
    names: ["wingR", "elbowR", "wristR", "wingTipR"],
    role: "wing",
    group: "wings",
  });

  const footTargetL: [number, number, number] = [0.12, 0.795, 0.11];
  const footTargetR: [number, number, number] = [-0.12, 0.795, 0.11];

  const legLPoints = limb(
    [0.12, 1.025, 0.015],
    footTargetL,
    [0.135, 0.145],
    [0, 0, 1],
  );

  const legRPoints = limb(
    [-0.12, 1.025, 0.015],
    footTargetR,
    [0.135, 0.145],
    [0, 0, 1],
  );

  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "ankleL", "footL"],
    role: "leg",
    contact: footTargetL,
    group: "bird",
  });

  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "ankleR", "footR"],
    role: "leg",
    contact: footTargetR,
    group: "bird",
  });

  const footL = legL.tip ?? legL.joints[legL.joints.length - 1];
  const footR = legR.tip ?? legR.joints[legR.joints.length - 1];

  const toeChains: Array<{
    side: number;
    chain: ReturnType<typeof b.chain>;
    label: string;
  }> = [];

  function makeToe(
    side: number,
    foot: typeof footL,
    label: string,
    route: readonly [number, number, number][],
  ) {
    const chain = b.chain(
      label,
      catmull([foot.at, ...route]),
      {
        parent: foot,
        names: [`${label}Base`, `${label}Mid`, `${label}Tip`],
        role: "digit",
        group: "feet",
      },
    );
    toeChains.push({ side, chain, label });
  }

  makeToe(1, footL, "toeLFrontOuter", [
    [0.175, 0.735, 0.16],
    [0.205, 0.705, 0.255],
  ]);
  makeToe(1, footL, "toeLFrontCenter", [
    [0.125, 0.725, 0.18],
    [0.12, 0.695, 0.29],
  ]);
  makeToe(1, footL, "toeLFrontInner", [
    [0.075, 0.735, 0.16],
    [0.035, 0.705, 0.245],
  ]);
  makeToe(1, footL, "toeLBack", [
    [0.12, 0.725, 0.065],
    [0.12, 0.695, -0.055],
  ]);

  makeToe(-1, footR, "toeRFrontOuter", [
    [-0.175, 0.735, 0.16],
    [-0.205, 0.705, 0.255],
  ]);
  makeToe(-1, footR, "toeRFrontCenter", [
    [-0.125, 0.725, 0.18],
    [-0.12, 0.695, 0.29],
  ]);
  makeToe(-1, footR, "toeRFrontInner", [
    [-0.075, 0.735, 0.16],
    [-0.035, 0.705, 0.245],
  ]);
  makeToe(-1, footR, "toeRBack", [
    [-0.12, 0.725, 0.065],
    [-0.12, 0.695, -0.055],
  ]);

  // ---------------------------------------------------------------------------------------------------------------
  // Branch and main body

  const branchPath = catmull([
    [0, 0.065, -0.62],
    [-0.015, 0.26, -0.48],
    [-0.22, 0.53, -0.28],
    [-0.39, 0.705, -0.015],
    [-0.08, 0.755, 0.095],
    [0.42, 0.765, 0.11],
    [0.92, 0.775, 0.105],
  ]);

  const branch = b.sweep(
    branchPath,
    (t) => 0.066 - t * 0.018,
    {
      bone: hips,
      color: BRANCH,
      section: { ngon: 6 },
      smooth: false,
      skin: "rigid",
      caps: "round",
      group: "branch",
      name: "mainBranch",
    },
  );

  b.rod(
    [-0.385, 0.695, -0.02],
    [-0.67, 0.91, -0.12],
    0.038,
    {
      bone: hips,
      color: BRANCH,
      section: { ngon: 6 },
      caps: "round",
      group: "branch",
      name: "forkBranch",
    },
  );

  b.spike(
    [-0.67, 0.91, -0.12],
    [-0.95, 1.03, -0.19],
    null,
    0.035,
    {
      bone: hips,
      color: WOOD_DARK,
      section: { ngon: 6 },
      group: "branch",
      name: "forkTip",
    },
  );

  for (const [t, color, name] of [
    [0.46, BLUE, "blueBranchBand"],
    [0.69, RED, "redBranchBand"],
  ] as const) {
    const p = branchPath.at(t);
    const tangent = branchPath.tangentAt(t);
    b.part(new THREE.CylinderGeometry(0.071, 0.071, 0.022, 8), color, {
      bone: hips,
      at: p,
      dir: tangent,
      axis: "y",
      flat: true,
      name,
      group: "branch",
    });
  }

  b.decal(branch, BRANCH_CUT, {
    at: branchPath.at(1),
    dir: branchPath.tangentAt(1),
    up: [0, 1, 0],
    size: [0.105, 0.105],
    segments: 6,
    lift: 0.001,
    name: "branchCut",
    group: "branch",
  });

  const bodyTube = b.sweep(
    spine,
    (t) => [
      0.185 + 0.027 * Math.sin(Math.PI * t),
      0.18 + 0.045 * Math.sin(Math.PI * t),
    ] as [number, number],
    {
      color: BODY,
      sides: 8,
      smooth: false,
      skin: "smooth",
      caps: "round",
      group: "body",
      name: "facetedBody",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [0.112 - 0.025 * t, 0.12 - 0.035 * t] as [number, number],
    {
      color: BODY,
      sides: 8,
      smooth: false,
      skin: "smooth",
      caps: "round",
      group: "body",
      name: "neckTube",
    },
  );

  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BODY,
    {
      bone: head,
      at: head.at,
      scale: [0. eighteenth ?? 0.17, 0.17, 0.17],
      flat: true,
      name: "geometricHead",
      group: "head",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Face and crest

  const headSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const eyeHit = headSurface.around(head.at).at(side * 14, 4);
    if (eyeHit) {
      b.decal(skull, EYE_TEXTURE, {
        at: eyeHit,
        dir: eyeHit.n,
        up: [0, 1, 0],
        size: [0.082, 0.108],
        segments: 8,
        lift: 0.002,
        mirror: side > 0,
        name: side > 0 ? "eyeL" : "eyeR",
        group: "face",
      });
    }

    const cheekHit = headSurface.around(head.at).at(side * 52, -1);
    if (cheekHit) {
      b.decal(skull, CHEEK_TEXTURE, {
        at: cheekHit,
        dir: cheekHit.n,
        up: [0, 1, 0],
        size: [0.06, 0.06],
        segments: 6,
        lift: 0.002,
        mirror: side > 0,
        name: side > 0 ? "cheekL" : "cheekR",
        group: "face",
      });
    }

    const browStart = head.local([side * 0.07, 0.105, 0.115]);
    const browEnd = head.local([side * 0.145, 0.13, 0.105]);
    b.rod(browStart, browEnd, 0.009, {
      bone: head,
      color: INK,
      section: { ngon: 5 },
      caps: "round",
      name: side > 0 ? "browL" : "browR",
      group: "face",
    });
  }

  b.extrude(
    [
      [-0.09, 0],
      [0.09, 0],
      [0.075, 0.07],
      [0.035, 0.145],
      [0, 0.175, "sharp"],
      [-0.035, 0.145],
      [-0.075, 0.07],
    ],
    {
      at: [0, 1.615, 0.305],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      color: RED,
      bone: head,
      name: "redCrest",
      group: "head",
    },
  );

  b.extrude(
    [
      [-0.052, 0],
      [0.052, 0],
      [0.038, 0.06],
      [0, 0.092, "sharp"],
      [-0.038, 0.06],
    ],
    {
      at: [0, 1.613, 0.32],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.003,
      color: BLUE,
      bone: head,
      name: "blueCrestInset",
      group: "head",
    },
  );

  b.spike(
    upperJaw.at,
    [0, 0, 1],
    0.18,
    0.05,
    {
      bone: upperJaw,
      color: RED,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "upperBeak",
      group: "face",
    },
  );

  b.spike(
    jaw.at,
    [0, 0, 1],
    0.145,
    0.037,
    {
      bone: jaw,
      color: BLUE,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "lowerBeak",
      group: "face",
    },
  );

  b.rod(
    upperJaw.at,
    [0, 1.505, 0.63],
    0.006,
    {
      bone: upperJaw,
      color: INK,
      section: { ngon: 5 },
      caps: "round",
      name: "upperMouthLine",
      group: "face",
    },
  );

  b.rod(
    jaw.at,
    [0, 1.49, 0.60],
    0.005,
    {
      bone: jaw,
      color: INK,
      section: { ngon: 5 },
      caps: "round",
      name: "lowerMouthLine",
      group: "face",
    },
  );

  const chestHit = b.surface(bodyTube).around([0, 1.17, 0.12]).at(0, 5);
  if (chestHit) {
    b.decal(bodyTube, CHEST_BADGE, {
      at: chestHit,
      dir: chestHit.n,
      up: [0, 1, 0],
      size: [0.105, 0.105],
      segments: 8,
      lift: 0.002,
      name: "chestBadge",
      group: "body",
    });
  }

  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.025, 10), BLUE, {
    bone: neck.joints[0],
    at: [0, 1.285, 0.215],
    dir: [0, 1, 0],
    axis: "y",
    flat: true,
    name: "blueNeckCollar",
    group: "body",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Tail fan

  b.sweep(
    tail,
    (t) => [0.085 - 0.058 * t, 0.095 - 0.068 * t] as [number, number],
    {
      color: BLUE,
      sides: 7,
      smooth: false,
      skin: "smooth",
      caps: "round",
      group: "tail",
      name: "tailCore",
    },
  );

  const tailFeatherData = [
    { x: -0.15, w: 0.09, y: 0.01, length: 0.49, color: RED },
    { x: -0.075, w: 0.105, y: 0.02, length: 0.57, color: BLUE },
    { x: 0, w: 0.115, y: 0.03, length: 0.62, color: YELLOW },
    { x: 0.075, w: 0.105, y: 0.02, length: 0.57, color: BLUE },
    { x: 0.15, w: 0.09, y: 0.01, length: 0.49, color: RED },
  ] as const;

  for (let i = 0; i < tailFeatherData.length; i++) {
    const feather = tailFeatherData[i];
    const x = feather.x;
    const w = feather.w;
    const endZ = -0.24 - feather.length;
    const part = b.slab(
      [
        [x - w * 0.5, 1.095 + feather.y, -0.225],
        [x + w * 0.5, 1.095 + feather.y, -0.225],
        [x + w * 0.34, 1.045 + feather.y, endZ + 0.08],
        [x, 0.985 + feather.y, endZ],
        [x - w * 0.34, 1.045 + feather.y, endZ + 0.08],
      ] as [number, number, number][],
      {
        bone: tail.joints[0],
        color: feather.color,
        thickness: 0.018,
        name: `tailFeather${i + 1}`,
        group: "tail",
      },
    );

    const featherSurface = b.surface(part);
    const markHit = featherSurface.nearest([x, 1.065 + feather.y, -0.46]);
    if (markHit) {
      b.decal(part, TAIL_MARK, {
        at: markHit,
        dir: markHit.n,
        up: [0, 1, 0],
        size: [w * 0.72, feather.length * 0.45],
        segments: 5,
        lift: 0.001,
        name: `tailMark${i + 1}`,
        group: "tail",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: articulated arm tubes, red membranes, blue feather geometry, and primary-colour rivets

  const wingArmL = b.sweep(
    wingL,
    (t) => [0.058 - 0.024 * t, 0.045 - 0.018 * t] as [number, number],
    {
      color: RED,
      section: "box",
      smooth: false,
      skin: "smooth",
      caps: "round",
      group: "wings",
      name: "wingArmL",
    },
  );

  const wingArmR = b.sweep(
    wingR,
    (t) => [0.058 - 0.024 * t, 0.045 - 0.018 * t] as [number, number],
    {
      color: RED,
      section: "box",
      smooth: false,
      skin: "smooth",
      caps: "round",
      group: "wings",
      name: "wingArmR",
    },
  );

  const lowerWingL: [number, number, number][] = [
    [0.18, 1.205, 0.035],
    [0.4, 1.235, -0.005],
    [0.68, 1.23, -0.075],
    [0.96, 1.235, -0.145],
  ];

  const lowerWingR: [number, number, number][] = lowerWingL.map(
    ([x, y, z]) => [-x, y, z],
  );

  const wingMemL = b.membrane(wingL, lowerWingL, {
    color: RED,
    thickness: 0.015,
    rows: 4,
    cols: 7,
    scallop: 0.1,
    skin: "smooth",
    group: "wings",
    name: "wingMembraneL",
  });

  const wingMemR = b.membrane(wingR, lowerWingR, {
    color: RED,
    thickness: 0.015,
    rows: 4,
    cols: 7,
    scallop: 0.1,
    skin: "smooth",
    group: "wings",
    name: "wingMembraneR",
  });

  for (const side of [1, -1]) {
    const root = side > 0 ? wingL.joints[0] : wingR.joints[0];

    b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.028, 10), YELLOW, {
      bone: root,
      at: mirroredPoint(side, [0.18, 1.245, 0.09]),
      dir: [side, 0, 0],
      axis: "y",
      flat: true,
      name: side > 0 ? "shoulderL" : "shoulderR",
      group: "wings",
    });

    const feathers = [
      {
        root: [0.42, 1.37, 0.065] as [number, number, number],
        tip: [0.95, 1.245, -0.12] as [number, number, number],
        width: 0.105,
        color: BLUE,
      },
      {
        root: [0.52, 1.36, 0.035] as [number, number, number],
        tip: [1.03, 1.215, -0.19] as [number, number, number],
        width: 0.095,
        color: YELLOW,
      },
      {
        root: [0.62, 1.35, 0.005] as [number, number, number],
        tip: [1.08, 1.18, -0.255] as [number, number, number],
        width: 0.085,
        color: BLUE,
      },
      {
        root: [0.69, 1.34, -0.02] as [number, number, number],
        tip: [1.11, 1.15, -0.30] as [number, number, number],
        width: 0.072,
        color: RED,
      },
    ];

    for (let i = 0; i < feathers.length; i++) {
      const f = feathers[i];
      const dx = f.tip[0] - f.root[0];
      const dz = f.tip[2] - f.root[2];
      const len = Math.max(Math.sqrt(dx * dx + dz * dz), 0.001);
      const nx = (-dz / len) * f.width;
      const nz = (dx / len) * f.width;

      b.slab(
        [
          [side * (f.root[0] - nx), f.root[1], f.root[2] - nz],
          [side * (f.root[0] + nx), f.root[1], f.root[2] + nz],
          [side * (f.tip[0] + nx * 0.25), f.tip[1], f.tip[2] + nz * 0.25],
          [side * f.tip[0], f.tip[1] - 0.018, f.tip[2]],
          [side * (f.tip[0] - nx * 0.25), f.tip[1], f.tip[2] - nz * 0.25],
        ] as [number, number, number][],
        {
          bone: side > 0 ? wingL.joints[1] : wingR.joints[1],
          color: f.color,
          thickness: 0.014,
          name: `${side > 0 ? "wingL" : "wingR"}Feather${i + 1}`,
          group: "wings",
        },
      );
    }

    b.along(
      side > 0 ? wingL : wingR,
      4,
      (at) =>
        b.part(
          new THREE.SphereGeometry(0.027, 6, 4),
          YELLOW,
          {
            at,
            flat: true,
            name: side > 0 ? "wingLJointRoundel" : "wingRJointRoundel",
            group: "wings",
          },
        ),
    );
  }

  const wingSurfaceL = b.surface(wingMemL);
  const wingMarkL = wingSurfaceL.nearest(wingL.at(0.52).at);
  if (wingMarkL) {
    b.decal(wingMemL, WING_MARK, {
      at: wingMarkL,
      dir: wingMarkL.n,
      up: [0, 1, 0],
      size: [0.21, 0.12],
      segments: 6,
      lift: 0.002,
      name: "wingGraphicL",
      group: "wings",
    });
  }

  const wingSurfaceR = b.surface(wingMemR);
  const wingMarkR = wingSurfaceR.nearest(wingR.at(0.52).at);
  if (wingMarkR) {
    b.decal(wingMemR, WING_MARK, {
      at: wingMarkR,
      dir: wingMarkR.n,
      up: [0, 1, 0],
      size: [0.21, 0.12],
      segments: 6,
      lift: 0.002,
      mirror: true,
      name: "wingGraphicR",
      group: "wings",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Legs, feet, toes, and graphic bands

  const legTubeL = b.sweep(
    legL,
    (t) => [0.026 - 0.008 * t, 0.023 - 0.007 * t] as [number, number],
    {
      color: INK,
      sides: 6,
      smooth: false,
      skin: "rigid",
      caps: "round",
      group: "feet",
      name: "legTubeL",
    },
  );

  const legTubeR = b.sweep(
    legR,
    (t) => [0.026 - 0.008 * t, 0.023 - 0.007 * t] as [number, number],
    {
      color: INK,
      sides: 6,
      smooth: false,
      skin: "rigid",
      caps: "round",
      group: "feet",
      name: "legTubeR",
    },
  );

  for (const [side, leg, foot] of [
    [1, legL, footL],
    [-1, legR, footR],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.025, 6), OCHRE, {
      bone: leg.joints[0],
      at: leg.joints[0].at,
      dir: leg.joints[0].axis,
      axis: "y",
      flat: true,
      name: side > 0 ? "legBandL" : "legBandR",
      group: "feet",
    });

    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.022, 6), RED, {
      bone: leg.joints[1],
      at: leg.joints[1].at,
      dir: leg.joints[1].axis,
      axis: "y",
      flat: true,
      name: side > 0 ? "ankleBandL" : "ankleBandR",
      group: "feet",
    });

    b.part(new THREE.SphereGeometry(0.034, 7, 5), OCHRE, {
      bone: foot,
      at: foot.at,
      flat: true,
      name: side > 0 ? "footL" : "footR",
      group: "feet",
    });
  }

  for (const entry of toeChains) {
    const toe = entry.chain;
    const tip = toe.tip ?? toe.joints[toe.joints.length - 1];

    b.sweep(
      toe,
      (t) => [0.014 - 0.009 * t, 0.011 - 0.007 * t] as [number, number],
      {
        color: OCHRE,
        sides: 6,
        smooth: false,
        skin: "rigid",
        caps: { start: "round", end: "point" },
        group: "feet",
        name: entry.label,
      },
    );

    b.spike(
      tip.at,
      [0, -1, 0],
      0.026,
      0.006,
      {
        bone: tip,
        color: INK,
        section: { ngon: 5 },
        caps: "point",
        group: "feet",
        name: `${entry.label}Claw`,
      },
    );
  }

  // Small Bauhaus blocks at the shoulder and hip sockets complete the puppet-like geometry.
  for (const side of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.075, 0.065, 0.045), BLUE, {
      bone: chest,
      at: mirroredPoint(side, [0.17, 1.25, 0.08]),
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: side > 0 ? "shoulderBlockL" : "shoulderBlockR",
      group: "wings",
    });

    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.06), RED, {
      bone: hips,
      at: mirroredPoint(side, [0.105, 1.025, -0.015]),
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: side > 0 ? "hipBlockL" : "hipBlockR",
      group: "body",
    });
  }

  return b.root;
}
```