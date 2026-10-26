import * as THREE from "three";
import { type Builder, createBuilder, catmull, limb, polyline, paint, frame } from "../../../../src/index";

export const RED = "#e63b32";
export const BLUE = "#1769aa";
export const YELLOW = "#f4c430";
export const CYAN = "#20b9c7";
export const MAGENTA = "#d83b8d";
export const WHITE = "#fff8df";
export const BLACK = "#171b2b";
export const ORANGE = "#ef8b2c";
export const WOOD = "#704126";

const HEAD_BAUHAUS = paint((p, _n, _s) => {
  const cleanFace = p.z > 0.315 && p.y > 1.33 && Math.abs(p.x) < 0.14;
  const cleanBeak = p.z > 0.345 && p.y < 1.43;
  if (cleanFace || cleanBeak) return RED;

  const crownRectangle =
    p.y > 1.515 &&
    p.y < 1.56 &&
    Math.abs(p.x) < 0.052 &&
    p.z < 0.285;
  if (crownRectangle) return BLUE;

  const cheekCircle =
    Math.hypot((p.x - 0.105) / 0.9, (p.y - 1.345) / 0.9) < 0.062 &&
    p.z < 0.31;
  if (cheekCircle) return YELLOW;

  return RED;
});

const BODY_BAUHAUS = paint((p, _n, _s) => {
  const whiteSeparatorA = Math.abs(p.z + 0.055) < 0.011;
  const whiteSeparatorB = Math.abs(p.z - 0.045) < 0.009;
  if (whiteSeparatorA || whiteSeparatorB) return WHITE;

  const redBellyHeight = 0.985 + 0.16 * ((p.z + 0.13) / 0.24);
  if (p.y < redBellyHeight) return RED;

  if (p.z < -0.055) return BLUE;
  return YELLOW;
});

const WING_BAUHAUS = paint((_p, _n, s) => {
  const u = s[0];
  const v = s[1];

  const redDiagonal =
    u > 0.045 &&
    u < 0.42 &&
    Math.abs(v - (0.07 - 0.38 * u)) < 0.021;
  if (redDiagonal) return RED;

  const yellowEdge =
    u > 0.365 &&
    v < 0.035 &&
    v > -0.15;
  if (yellowEdge) return YELLOW;

  return BLUE;
});

const WOOD_BAUHAUS = paint((p, n, _s) => {
  const grainA =
    p.x > -0.88 &&
    p.x < -0.52 &&
    Math.abs(p.z - (-0.54 + 0.67 * (p.x + 0.88))) < 0.014;

  const grainB =
    p.x > -0.3 &&
    p.x < 0.18 &&
    Math.abs(p.z - (-0.18 - 0.1 * (p.x + 0.3))) < 0.014;

  const grainC =
    p.x > 0.45 &&
    p.x < 0.78 &&
    Math.abs(p.z - (-0.33 - 0.67 * (p.x - 0.45))) < 0.014;

  if (grainA || grainB || grainC) return BLACK;
  if (n.y > 0.42 || n.z > 0.35) return WOOD_LIGHT;
  return WOOD;
});
export const WOOD_LIGHT = "#9b6034";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A low-poly songbird assembled from bold primary-colour geometry, perched on an angular wooden branch.",
};

export const REQUESTS = [
  {
    id: "eyeHighlights",
    kind: "add",
    part: "headShell",
    what: "Two crisp white circular eye highlights, one on each black eye, with tiny CYAN glints offset below them. Keep them graphic and perfectly flat in the Bauhaus style.",
    at: [0.075, 1.45, 0.39],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.2, 0.14, 0.025],
  },
  {
    id: "beakNostrils",
    kind: "add",
    part: "upperBeak",
    what: "A pair of tiny BLACK circular nostrils on the yellow upper beak, mirrored across the centre line. Add a short dark seam between the upper and lower jaws.",
    at: [0.028, 1.405, 0.475],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.12, 0.07, 0.025],
  },
  {
    id: "wingRoundels",
    kind: "add",
    part: "wingL",
    what: "A large Bauhaus wing roundel: concentric RED, YELLOW and WHITE circles with a BLACK centre, placed on both blue wings and kept inside the existing red inset panels.",
    at: [0.335, 1.18, 0.075],
    normal: [0, 0, 1],
    bone: "wingL",
    room: [0.19, 0.19, 0.025],
  },
  {
    id: "chestEmblem",
    kind: "add",
    part: "breastBadge",
    what: "A bold geometric chest emblem: a small BLACK square behind a raised RED circle, with a thin YELLOW triangular pointer aimed upward. Keep the emblem centred on the white bib.",
    at: [0, 1.12, 0.315],
    normal: [0, 0, 1],
    bone: "chest",
    room: [0.22, 0.22, 0.035],
  },
  {
    id: "tailBands",
    kind: "add",
    part: "tailCore",
    what: "Three broad alternating YELLOW and RED bands crossing the blue tail feathers, aligned perpendicular to the tail direction. The bands should be simple flat slabs with strong diagonal Bauhaus spacing.",
    at: [0, 1.06, -0.53],
    normal: [0, 0, 1],
    bone: "tailBase",
    room: [0.27, 0.24, 0.035],
  },
  {
    id: "legBands",
    kind: "add",
    part: "legL",
    what: "Matching BLACK and YELLOW ankle bands on both legs, made from two thin rectangular rings. Keep the feet and toes visible below the bands.",
    at: [0.125, 0.79, 0.015],
    normal: [0, 1, 0],
    bone: "ankleL",
    room: [0.08, 0.11, 0.08],
  },
  {
    id: "crest",
    kind: "add",
    part: "headShell",
    what: "A small three-piece head crest in RED, BLUE and YELLOW, like three overlapping Bauhaus triangles. It rises from the crown without covering the eyes.",
    at: [0, 1.59, 0.19],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.24, 0.18, 0.16],
  },
  {
    id: "branchBuds",
    kind: "add",
    part: "branch",
    what: "Three small geometric buds at the branch forks: faceted YELLOW diamonds with tiny BLUE bases. Keep them sparse and subordinate to the bird.",
    at: [-0.55, 0.36, -0.34],
    normal: [0, 1, 0],
    bone: null,
    room: [0.18, 0.24, 0.14],
  },
  {
    id: "branchCutMarks",
    kind: "add",
    part: "branch",
    what: "Angular BLACK cut marks and two short RED rings around the exposed branch ends. Use chunky graphic strokes rather than naturalistic bark.",
    at: [0.84, 0.19, -0.6],
    normal: [0, 0, 1],
    bone: null,
    room: [0.22, 0.16, 0.16],
  },
  {
    id: "headGeometry",
    kind: "texture",
    part: "headShell",
    what: "Paint the red head with a restrained Bauhaus pattern: one large off-centre YELLOW circle over the rear cheek and a small BLUE rectangle near the crown. Leave the eye and beak areas clean.",
  },
  {
    id: "bodyGeometry",
    kind: "texture",
    part: "body",
    what: "Paint the yellow body with broad flat primary-colour geometry: a RED lower belly wedge, a BLUE rear quarter, and a few sharp WHITE separators. No gradients or organic mottling.",
  },
  {
    id: "wingGeometry",
    kind: "texture",
    part: "wingL",
    what: "Paint both blue wings with a crisp RED diagonal stripe and a narrow YELLOW edge stripe that follows the existing angular silhouette.",
  },
  {
    id: "woodGeometry",
    kind: "texture",
    part: "branch",
    what: "Give the branch simple flat WOOD and WOOD_LIGHT polygonal facets with two or three dark angular grain marks. Keep the branch less saturated than the bird.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first. The bird's neutral pose is compact but readable: legs descend to the branch and wings extend
  // sideways enough to expose their graphic silhouettes.
  // -------------------------------------------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.98, -0.12],
    dir: [0, 0, 1],
    role: "spine",
    group: "bird",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.13],
      [0, 1.045, -0.025],
      [0, 1.09, 0.105],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "chest"],
      role: "spine",
      group: "bird",
    },
  );

  const chest = spine.tip;

  const neck = b.chain(
    "neck",
    catmull([
      chest.at,
      [0, 1.235, 0.14],
      [0, 1.345, 0.18],
    ]),
    {
      parent: chest,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
      group: "bird",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.405, 0.205],
    dir: [0, 0, 1],
    role: "head",
    group: "bird",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.145, down: 0.018 }),
    aim: head.local({ forward: 0.29, down: 0.055 }),
    role: "jaw",
    group: "bird",
  });

  // A slight open-jaw rest pose makes the two-piece beak legible.
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  const footL: [number, number, number] = [0.13, 0.665, -0.005];
  const footR: [number, number, number] = [-0.13, 0.665, -0.005];

  const legPtsL = limb(
    [0.135, 1.005, -0.045],
    footL,
    [0.17, 0.145, 0.105],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );

  const legPtsR = limb(
    [-0.135, 1.005, -0.045],
    footR,
    [0.17, 0.145, 0.105],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );

  const legL = b.chain("legL", polyline(legPtsL), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: footL,
    group: "bird",
  });

  const legR = b.chain("legR", polyline(legPtsR), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: footR,
    group: "bird",
  });

  const toeLFront = b.chain(
    "toeLFront",
    polyline([
      footL,
      [0.17, 0.655, 0.085],
      [0.185, 0.65, 0.16],
    ]),
    {
      parent: legL.tip,
      names: ["toeLFront", "toeLFrontTip"],
      role: "digit",
      group: "bird",
    },
  );

  const toeLSide = b.chain(
    "toeLSide",
    polyline([
      footL,
      [0.075, 0.655, 0.085],
      [0.035, 0.65, 0.15],
    ]),
    {
      parent: legL.tip,
      names: ["toeLSide", "toeLSideTip"],
      role: "digit",
      group: "bird",
    },
  );

  const toeRFront = b.chain(
    "toeRFront",
    polyline([
      footR,
      [-0.17, 0.655, 0.085],
      [-0.185, 0.65, 0.16],
    ]),
    {
      parent: legR.tip,
      names: ["toeRFront", "toeRFrontTip"],
      role: "digit",
      group: "bird",
    },
  );

  const toeRSide = b.chain(
    "toeRSide",
    polyline([
      footR,
      [-0.075, 0.655, 0.085],
      [-0.035, 0.65, 0.15],
    ]),
    {
      parent: legR.tip,
      names: ["toeRSide", "toeRSideTip"],
      role: "digit",
      group: "bird",
    },
  );

  const wingPathL = catmull([
    [0.145, 1.145, 0.02],
    [0.28, 1.205, 0.015],
    [0.42, 1.18, -0.025],
    [0.525, 1.11, -0.075],
  ]);

  const wingPathR = catmull([
    [-0.145, 1.145, 0.02],
    [-0.28, 1.205, 0.015],
    [-0.42, 1.18, -0.025],
    [-0.525, 1.11, -0.075],
  ]);

  const wingL = b.chain("wingL", wingPathL, {
    parent: chest,
    names: ["shoulderL", "wingUpperL", "wingElbowL", "wingTipL"],
    role: "wing",
    group: "bird",
  });

  const wingR = b.chain("wingR", wingPathR, {
    parent: chest,
    names: ["shoulderR", "wingUpperR", "wingElbowR", "wingTipR"],
    role: "wing",
    group: "bird",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.17],
      [0, 1.025, -0.31],
      [0, 1.045, -0.49],
      [0, 1.065, -0.68],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tailMid", "tailJoint", "tailTip"],
      role: "tail",
      group: "bird",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Branch and supporting twigs. The lower end of the branch reaches y ~= 0.01, so the complete composition rests
  // on the floor without adding an artificial ground plane.
  // -------------------------------------------------------------------------------------------------------------

  const branchPath = catmull([
    [-0.96, 0.075, -0.61],
    [-0.7, 0.19, -0.4],
    [-0.37, 0.43, -0.2],
    [-0.08, 0.59, -0.07],
    [0.22, 0.56, -0.18],
    [0.52, 0.39, -0.37],
    [0.89, 0.15, -0.62],
  ]);

  const twigLPath = catmull([
    [-0.47, 0.34, -0.27],
    [-0.58, 0.51, -0.24],
    [-0.63, 0.69, -0.17],
  ]);

  const twigRPath = catmull([
    [0.48, 0.38, -0.35],
    [0.59, 0.52, -0.29],
    [0.67, 0.65, -0.21],
  ]);

  const twigBackPath = catmull([
    [0.1, 0.57, -0.1],
    [0.06, 0.69, -0.25],
    [0.08, 0.78, -0.35],
  ]);

  // -------------------------------------------------------------------------------------------------------------
  // Main tubes and body volumes.
  // -------------------------------------------------------------------------------------------------------------

  b.sweep(branchPath, (t) => 0.063 - t * 0.014, {
    color: WOOD_BAUHAUS,
    section: { ngon: 7 },
    smooth: false,
    caps: "flat",
    name: "branch",
    group: "scenery",
  });

  b.sweep(twigLPath, [0.042, 0.018], {
    color: WOOD_LIGHT,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "twigL",
    group: "scenery",
  });

  b.sweep(twigRPath, [0.04, 0.016], {
    color: WOOD_LIGHT,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "twigR",
    group: "scenery",
  });

  b.sweep(twigBackPath, [0.035, 0.012], {
    color: WOOD,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "twigBack",
    group: "scenery",
  });

  b.sweep(spine, (t) => {
    const rx = 0.19 + 0.018 * Math.sin(t * Math.PI);
    const ry = 0.205 + 0.025 * Math.sin(t * Math.PI);
    return [rx, ry];
  }, {
    color: BODY_BAUHAUS,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "body",
    group: "bird",
  });

  b.sweep(neck, [0.112, 0.088], {
    color: RED,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "neck",
    group: "bird",
  });

  b.sweep(tail, (t) => [0.105 - 0.07 * t, 0.09 - 0.065 * t], {
    color: BLUE,
    section: { ngon: 6 },
    smooth: false,
    caps: "point",
    name: "tailCore",
    group: "bird",
  });

  b.sweep(legL, (t) => 0.025 - 0.008 * t, {
    color: BLACK,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "legL",
    group: "bird",
  });

  b.sweep(legR, (t) => 0.025 - 0.008 * t, {
    color: BLACK,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "legR",
    group: "bird",
  });

  for (const [chain, name] of [
    [toeLFront, "toeLFront"],
    [toeLSide, "toeLSide"],
    [toeRFront, "toeRFront"],
    [toeRSide, "toeRSide"],
  ] as const) {
    b.sweep(chain, [0.016, 0.006], {
      color: ORANGE,
      section: { ngon: 6 },
      smooth: false,
      caps: "point",
      name,
      group: "bird",
    });
  }

  b.sweep(wingL, (t) => [0.073 - 0.05 * t, 0.065 - 0.045 * t], {
    color: BLUE,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "wingArmL",
    group: "bird",
  });

  b.sweep(wingR, (t) => [0.073 - 0.05 * t, 0.065 - 0.045 * t], {
    color: BLUE,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "wingArmR",
    group: "bird",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Head and face. The skull is deliberately round and oversized, while the beak and eyes are pushed forward so
  // the species reads immediately even in a silhouette view.
  // -------------------------------------------------------------------------------------------------------------

  const headShell = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    HEAD_BAUHAUS,
    {
      bone: head,
      at: head.at,
      scale: [0.184, 0.19, 0.175],
      flat: true,
      name: "headShell",
      group: "bird",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BLUE,
    {
      bone: head,
      at: head.local({ up: 0.158, back: 0.025 }),
      scale: [0.112, 0.042, 0.088],
      flat: true,
      name: "crownCap",
      group: "bird",
    },
  );

  const eyeWhiteAt = (s: number) =>
    head.local({
      left: s * 0.073,
      forward: 0.137,
      up: 0.035,
    });

  const eyeBlackAt = (s: number) =>
    head.local({
      left: s * 0.073,
      forward: 0.173,
      up: 0.035,
    });

  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.047, 10, 7),
      WHITE,
      {
        bone: head,
        at: eyeWhiteAt(s),
        flat: true,
        name: s > 0 ? "eyeWhiteL" : "eyeWhiteR",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.029, 9, 6),
      BLACK,
      {
        bone: head,
        at: eyeBlackAt(s),
        flat: true,
        name: s > 0 ? "eyeBlackL" : "eyeBlackR",
        group: "face",
      },
    );

    b.rod(
      head.local({
        left: s * 0.105,
        forward: 0.158,
        up: 0.093,
      }),
      head.local({
        left: s * 0.035,
        forward: 0.165,
        up: 0.108,
      }),
      0.009,
      {
        color: BLACK,
        bone: head,
        name: s > 0 ? "browL" : "browR",
        group: "face",
      },
    );
  }

  // A blue neck collar is a simple Bauhaus band between the red head and yellow body.
  b.part(
    new THREE.CylinderGeometry(0.118, 0.118, 0.035, 10),
    BLUE,
    {
      bone: neck.tip,
      at: [0, 1.34, 0.18],
      dir: [0, 1, 0],
      flat: true,
      name: "neckCollar",
      group: "bird",
    },
  );

  const upperBeakBase = head.local({
    forward: 0.155,
    down: 0.012,
  });

  b.spike(upperBeakBase, [0, 0, 1], 0.135, 0.057, {
    color: YELLOW,
    bone: head,
    caps: "point",
    name: "upperBeak",
    group: "face",
  });

  const lowerBeakBase = jaw.local({
    forward: 0.008,
    down: 0.002,
  });

  b.spike(lowerBeakBase, jaw, 0.102, 0.037, {
    color: ORANGE,
    bone: jaw,
    caps: "point",
    name: "lowerBeak",
    group: "face",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Front graphics: a white bib and a red circular badge provide a very clear Bauhaus focal point.
  // -------------------------------------------------------------------------------------------------------------

  b.extrude(
    [
      [-0.115, 0.025],
      [0.115, 0.025],
      [0.13, -0.12],
      [0.0, -0.245, "sharp"],
      [-0.13, -0.12],
    ],
    {
      at: [0, 1.115, 0.285],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: WHITE,
      bone: chest,
      name: "bellyPanel",
      group: "bird",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.077, 0.077, 0.022, 12),
    RED,
    {
      bone: chest,
      at: [0, 1.105, 0.312],
      dir: [0, 0, 1],
      flat: true,
      name: "breastBadge",
      group: "face",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.13, 0.13, 0.012),
    BLACK,
    {
      bone: chest,
      at: [0, 1.105, 0.296],
      dir: [0, 0, 1],
      flat: true,
      name: "badgeBacking",
      group: "face",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Angular wings. The chain is the rigging volume; the extruded polygon is the broad readable wing surface.
  // -------------------------------------------------------------------------------------------------------------

  const wingOutline: [number, number][] = [
    [0.0, 0.02],
    [0.085, 0.055],
    [0.235, 0.09],
    [0.405, 0.015],
    [0.47, -0.14],
    [0.34, -0.225],
    [0.18, -0.185],
    [0.055, -0.09],
  ];

  const wingInset: [number, number][] = [
    [0.055, 0.012],
    [0.18, 0.055],
    [0.295, 0.018],
    [0.335, -0.09],
    [0.205, -0.145],
    [0.095, -0.105],
  ];

  for (const s of [1, -1]) {
    const wingStart: [number, number, number] = [s * 0.145, 1.145, 0.02];
    const wingBone = s > 0 ? wingL.joints[0] : wingR.joints[0];
    const sideName = s > 0 ? "L" : "R";

    b.extrude(wingOutline, {
      at: wingStart,
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.006,
      color: WING_BAUHAUS,
      bone: wingBone,
      name: `wing${sideName}`,
      group: "bird",
    });

    b.extrude(wingInset, {
      at: [s * 0.148, 1.148, 0.041],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: WING_BAUHAUS,
      bone: wingBone,
      name: `wingInset${sideName}`,
      group: "face",
    });

    b.rod(
      [s * 0.19, 1.19, 0.06],
      [s * 0.41, 1.14, 0.06],
      0.008,
      {
        color: YELLOW,
        bone: wingBone,
        name: `wingBar${sideName}`,
        group: "face",
      },
    );

    b.rod(
      [s * 0.255, 1.08, 0.06],
      [s * 0.38, 1.045, 0.06],
      0.007,
      {
        color: BLACK,
        bone: wingBone,
        name: `wingLowerLine${sideName}`,
        group: "face",
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail fan. Three broad, slightly offset slabs make the rear silhouette read as feathers rather than a tube.
  // -------------------------------------------------------------------------------------------------------------

  const featherOutline: [number, number][] = [
    [-0.047, 0.0],
    [0.047, 0.0],
    [0.052, 0.285],
    [0.018, 0.475],
    [-0.02, 0.37],
    [-0.052, 0.18],
  ];

  const tailFeatherData = [
    { x: -0.065, y: 1.025, z: -0.205, name: "tailFeatherL", color: BLUE },
    { x: 0.0, y: 1.045, z: -0.215, name: "tailFeatherC", color: RED },
    { x: 0.065, y: 1.025, z: -0.205, name: "tailFeatherR", color: BLUE },
  ] as const;

  for (const feather of tailFeatherData) {
    b.extrude(featherOutline, {
      at: [feather.x, feather.y, feather.z],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.025,
      bevel: 0.004,
      color: feather.color,
      bone: tail.joints[0],
      name: feather.name,
      group: "bird",
    });
  }

  // A small yellow tail-root block ties the fan back into the body.
  b.part(
    new THREE.BoxGeometry(0.16, 0.13, 0.12),
    YELLOW,
    {
      bone: tail.joints[0],
      at: [0, 1.03, -0.19],
      flat: true,
      name: "tailRoot",
      group: "bird",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Feet and simple graphic joints.
  // -------------------------------------------------------------------------------------------------------------

  for (const [s, ankle] of [
    [1, legL.joints[2]],
    [-1, legR.joints[2]],
  ] as const) {
    b.part(
      new THREE.CylinderGeometry(0.031, 0.031, 0.035, 8),
      YELLOW,
      {
        bone: ankle,
        at: ankle.at,
        dir: ankle.dir([0, 1, 0]),
        flat: true,
        name: s > 0 ? "ankleBandL" : "ankleBandR",
        group: "face",
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // A few branch facets keep the support from becoming a plain tube while remaining simpler than the bird.
  // -------------------------------------------------------------------------------------------------------------

  b.part(
    new THREE.CylinderGeometry(0.066, 0.066, 0.012, 7),
    WOOD_LIGHT,
    {
      at: [-0.96, 0.075, -0.61],
      dir: [-0.55, 0.35, 0.75],
      flat: true,
      name: "branchCutL",
      group: "scenery",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.05, 0.05, 0.012, 7),
    WOOD_LIGHT,
    {
      at: [0.89, 0.15, -0.62],
      dir: [0.62, 0.28, 0.73],
      flat: true,
      name: "branchCutR",
      group: "scenery",
    },
  );

  b.rod(
    [-0.86, 0.16, -0.595],
    [-0.72, 0.235, -0.57],
    0.009,
    {
      color: BLACK,
      name: "branchGrainL",
      group: "scenery",
    },
  );

  b.rod(
    [0.73, 0.245, -0.59],
    [0.84, 0.19, -0.6],
    0.008,
    {
      color: BLACK,
      name: "branchGrainR",
      group: "scenery",
    },
  );

  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.034, 7, 5),
      ORANGE,
      {
        bone: s > 0 ? legL.tip : legR.tip,
        at: s > 0 ? footL : footR,
        scale: [1.35, 0.55, 1.7],
        flat: true,
        name: s > 0 ? "footPadL" : "footPadR",
        group: "bird",
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
function addEyeHighlights(b: Builder) {
  const makeEyeGraphic = (side: number) => {
    const suffix = side > 0 ? "L" : "R";
    const x = side * 0.073;

    // The black eye spheres sit at roughly y=1.44, z=.378. These discs are
    // placed just proud of their forward surface, facing the viewer.
    b.part(new THREE.CircleGeometry(0.011, 12), WHITE, {
      bone: "head",
      at: [x - side * 0.004, 1.452, 0.407],
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: `s21_eyeHighlight${suffix}`,
      group: "face",
    });

    // A smaller cyan counterpoint below the white highlight gives each eye a
    // crisp Bauhaus two-colour glint without making the eye look realistic.
    b.part(new THREE.CircleGeometry(0.0045, 10), CYAN, {
      bone: "head",
      at: [x + side * 0.001, 1.438, 0.408],
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: `s21_eyeGlint${suffix}`,
      group: "face",
    });

    // Tiny red upper-lid tab ties the highlight into the red head shell and
    // adds a graphic eyelid accent above the otherwise circular eye.
    b.part(new THREE.BoxGeometry(0.018, 0.004, 0.006), RED, {
      bone: "head",
      at: [x - side * 0.006, 1.476, 0.406],
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: `s21_eyeLidTab${suffix}`,
      group: "face",
    });
  };

  makeEyeGraphic(1);
  makeEyeGraphic(-1);
}
    return addEyeHighlights;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBeakNostrils(b: Builder) {
  const surface = b.surface(b.root);

  const nostril = (side: number) => {
    const hit = surface.nearest([side * 0.028, 1.405, 0.475]);
    if (!hit) return;

    b.stick(
      new THREE.CylinderGeometry(0.0105, 0.0105, 0.006, 10),
      BLACK,
      hit.moved([0, 0.002, 0]),
      {
        embed: 0.42,
        bone: "head",
        name: side > 0 ? "nostrilL" : "nostrilR",
        group: "stage2-face",
      },
    );

    // A tiny warm rim keeps each nostril readable against the yellow beak.
    b.stick(
      new THREE.CylinderGeometry(0.014, 0.014, 0.003, 10),
      ORANGE,
      hit.moved([0, 0.0005, 0]),
      {
        embed: 0.48,
        bone: "head",
        name: side > 0 ? "nostrilRimL" : "nostrilRimR",
        group: "stage2-face",
      },
    );

    // Re-seat the black centre above the rim so the opening remains crisp.
    b.stick(
      new THREE.CylinderGeometry(0.009, 0.009, 0.007, 10),
      BLACK,
      hit.moved([0, 0.0035, 0]),
      {
        embed: 0.45,
        bone: "head",
        name: side > 0 ? "nostrilInsetL" : "nostrilInsetR",
        group: "stage2-face",
      },
    );
  };

  nostril(1);
  nostril(-1);

  // A short, slightly raised Bauhaus-black jaw seam separates the two graphic beak pieces.
  b.rod(
    [-0.028, 1.389, 0.451],
    [0.028, 1.389, 0.451],
    0.0038,
    {
      color: BLACK,
      bone: "head",
      caps: "round",
      name: "beakJawSeam",
      group: "stage2-face",
    },
  );

  // The wing anchor points are queried before any new roundel geometry is added.
  // Stage 1's actual wing bones are shoulderL and shoulderR.
  const wingHits = [1, -1].map((side) => ({
    side,
    hit: surface.nearest([side * 0.335, 1.18, 0.075]),
  }));

  const roundelLayer = (
    hit: ReturnType<typeof surface.nearest>,
    side: number,
    radius: number,
    color: string,
    lift: number,
    name: string,
  ) => {
    if (!hit) return;
    b.stick(
      new THREE.CylinderGeometry(radius, radius, 0.007, 16),
      color,
      hit.moved([0, lift, 0]),
      {
        embed: 0.48,
        bone: side > 0 ? "shoulderL" : "shoulderR",
        name,
        group: "stage2-wing",
      },
    );
  };

  for (const { side, hit } of wingHits) {
    if (!hit) continue;
    const suffix = side > 0 ? "L" : "R";

    // Four shallow discs, each lifted from the same live wing surface frame.
    roundelLayer(hit, side, 0.056, RED, 0.002, `wingRoundelRed${suffix}`);
    roundelLayer(hit, side, 0.043, YELLOW, 0.010, `wingRoundelYellow${suffix}`);
    roundelLayer(hit, side, 0.029, WHITE, 0.018, `wingRoundelWhite${suffix}`);
    roundelLayer(hit, side, 0.015, BLACK, 0.026, `wingRoundelBlack${suffix}`);

    // Four tiny black satellite points give the roundel a restrained Bauhaus clock-face accent.
    const satellites = [
      [0, 0.073],
      [0.073, 0],
      [0, -0.073],
      [-0.073, 0],
    ] as const;

    satellites.forEach(([localX, localZ], i) => {
      const p = new THREE.Vector3(
        side * 0.335 - localX,
        1.18 + localZ,
        0.083,
      );

      b.part(
        new THREE.CylinderGeometry(0.005, 0.005, 0.004, 8),
        BLACK,
        {
          at: p,
          dir: [0, 0, 1],
          axis: "y",
          bone: side > 0 ? "shoulderL" : "shoulderR",
          flat: true,
          name: `wingRoundelDot${suffix}${i}`,
          group: "stage2-wing",
        },
      );
    });
  }
}
    return addBeakNostrils;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addChestEmblem(b: Builder) {
  const bone = "chest";

  // A compact black plaque sits just proud of the white bib and behind the raised graphics.
  b.part(new THREE.BoxGeometry(0.158, 0.158, 0.007), BLACK, {
    bone,
    at: [0, 1.12, 0.322],
    flat: true,
    name: "s23ChestBlackPlaque",
    group: "stage2",
  });

  // Four separated yellow bars make the plaque read as a crisp Bauhaus frame rather than a soft badge.
  const frameZ = 0.327;
  b.part(new THREE.BoxGeometry(0.174, 0.009, 0.005), YELLOW, {
    bone,
    at: [0, 1.202, frameZ],
    flat: true,
    name: "s23ChestFrameTop",
    group: "stage2",
  });
  b.part(new THREE.BoxGeometry(0.174, 0.009, 0.005), YELLOW, {
    bone,
    at: [0, 1.038, frameZ],
    flat: true,
    name: "s23ChestFrameBottom",
    group: "stage2",
  });
  b.part(new THREE.BoxGeometry(0.009, 0.155, 0.005), YELLOW, {
    bone,
    at: [0.0825, 1.12, frameZ],
    flat: true,
    name: "s23ChestFrameLeft",
    group: "stage2",
  });
  b.part(new THREE.BoxGeometry(0.009, 0.155, 0.005), YELLOW, {
    bone,
    at: [-0.0825, 1.12, frameZ],
    flat: true,
    name: "s23ChestFrameRight",
    group: "stage2",
  });

  // The thin yellow pointer rises behind the red disk and remains visible above it.
  b.extrude(
    [
      [-0.026, -0.035],
      [0.026, -0.035],
      [0.012, 0.005],
      [0, 0.067, "sharp"],
      [-0.012, 0.005],
    ],
    {
      bone,
      at: [0, 1.112, 0.329],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.0015,
      color: YELLOW,
      name: "s23ChestPointer",
      group: "stage2",
    },
  );

  // A real shallow cylinder gives the emblem its raised red medallion silhouette.
  b.part(new THREE.CylinderGeometry(0.051, 0.051, 0.008, 12), RED, {
    bone,
    at: [0, 1.106, 0.331],
    dir: [0, 0, 1],
    flat: true,
    name: "s23ChestRedMedallion",
    group: "stage2",
  });

  // A narrow yellow torus adds a clean concentric Bauhaus ring without obscuring the red centre.
  b.part(new THREE.TorusGeometry(0.054, 0.0045, 5, 16), YELLOW, {
    bone,
    at: [0, 1.106, 0.336],
    flat: true,
    name: "s23ChestMedallionRing",
    group: "stage2",
  });

  // Two tiny black registration squares balance the composition at the lower corners.
  for (const side of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.014, 0.014, 0.004), BLACK, {
      bone,
      at: [side * 0.058, 1.055, 0.333],
      flat: true,
      name: side > 0 ? "s23ChestMarkL" : "s23ChestMarkR",
      group: "stage2",
    });
  }
}
    return addChestEmblem;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addTailBands(b: Builder) {
  // Three broad, slightly skewed slabs sit across the blue tail fan. Their centres progress down the
  // tail axis, while their silhouettes run across the bird's width.
  const tailBands: Array<{
    z: number;
    color: string;
    skew: number;
    name: string;
  }> = [
    { z: -0.435, color: YELLOW, skew: 0.028, name: "s24_tailBandYellowA" },
    { z: -0.535, color: RED, skew: -0.018, name: "s24_tailBandRed" },
    { z: -0.635, color: YELLOW, skew: 0.022, name: "s24_tailBandYellowB" },
  ];

  for (const band of tailBands) {
    const w = 0.245;
    const h = 0.046;
    const y = 1.058;

    b.extrude(
      [
        [-w * 0.5, -h * 0.5],
        [w * 0.5, -h * 0.5],
        [w * 0.5 + band.skew, h * 0.5],
        [-w * 0.5 + band.skew, h * 0.5],
      ],
      {
        at: [0, y, band.z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.003,
        smoothing: 0,
        color: band.color,
        bone: "tailBase",
        name: band.name,
        group: "stage2-tail",
      },
    );

    // A narrow black registration edge makes each primary-colour band read as a deliberate
    // Bauhaus print layer rather than a soft decal.
    b.rod(
      [-w * 0.48, y + h * 0.5 + 0.004, band.z + 0.011],
      [w * 0.48 + band.skew, y + h * 0.5 + 0.004, band.z + 0.011],
      0.0045,
      {
        color: BLACK,
        bone: "tailBase",
        name: `${band.name}_edge`,
        group: "stage2-tail",
      },
    );
  }

  // Small red and yellow geometric tabs overlap the feather roots. They reinforce the repeated
  // stripe rhythm where the three separate tail feathers meet the blue tail core.
  b.part(
    new THREE.BoxGeometry(0.052, 0.034, 0.022),
    RED,
    {
      at: [-0.075, 1.045, -0.285],
      bone: "tailBase",
      flat: true,
      name: "s24_tailRootTabL",
      group: "stage2-tail",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.052, 0.034, 0.022),
    YELLOW,
    {
      at: [0.075, 1.045, -0.285],
      bone: "tailBase",
      flat: true,
      name: "s24_tailRootTabR",
      group: "stage2-tail",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Ankle bands. Surface loops follow the existing angular legs, so the rings remain seated on the tubes rather
  // than floating around a hand-tuned cylinder. The two nested loops are deliberately close but separated.
  // -------------------------------------------------------------------------------------------------------------

  const birdSurface = b.surface(b.root);

  const addAnkleBands = (side: 1 | -1, legName: "L" | "R") => {
    const x = side * 0.125;

    const bandPoints = [
      { y: 0.815, color: BLACK, label: "black" },
      { y: 0.775, color: YELLOW, label: "yellow" },
    ] as const;

    for (const band of bandPoints) {
      const loop = birdSurface.loop([x, band.y, 0.015], {
        dir: [0, -1, 0],
        lift: 0.008,
      });

      b.sweep(loop, 0.012, {
        color: band.color,
        section: "box",
        smooth: false,
        caps: "none",
        bone: legName === "L" ? "ankleL" : "ankleR",
        name: `s24_ankleBand${legName}_${band.label}`,
        group: "stage2-legs",
      });

      // Four chunky front-facing studs repeat the square language of the chest badge. They are
      // placed from live loop frames and therefore inherit the ankle surface orientation.
      const studs = [0.02, 0.27, 0.52, 0.77];
      for (let i = 0; i < studs.length; i++) {
        const at = loop.at(studs[i]);
        b.stick(
          new THREE.BoxGeometry(0.018, 0.008, 0.018),
          band.color === BLACK ? YELLOW : BLACK,
          at,
          {
            embed: 0.1,
            bone: legName === "L" ? "ankleL" : "ankleR",
            name: `s24_ankleStud${legName}_${band.label}_${i}`,
            group: "stage2-legs",
          },
        );
      }
    }

    // A small orange sole block remains visibly below both rings, preserving the bird's foot
    // silhouette and keeping the toes unobstructed.
    b.part(
      new THREE.BoxGeometry(0.045, 0.018, 0.052),
      ORANGE,
      {
        at: [x, 0.725, 0.055],
        bone: legName === "L" ? "ankleL" : "ankleR",
        flat: true,
        name: `s24_ankleSole${legName}`,
        group: "stage2-legs",
      },
    );
  };

  addAnkleBands(1, "L");
  addAnkleBands(-1, "R");
}
    return addTailBands;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addCrest(b: Builder) {
  const y0 = 1.582;
  const black = BLACK;

  const addTriangle = (
    x: number,
    z: number,
    width: number,
    height: number,
    color: string,
    name: string,
    accent: string,
  ) => {
    const outline = [
      [-width * 0.5, 0],
      [width * 0.5, 0],
      [0, height, "sharp"],
    ] as Array<[number, number] | [number, number, "sharp"]>;

    b.extrude(outline, {
      at: [x, y0, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.019,
      bevel: 0.003,
      color,
      bone: "head",
      name,
      group: "stage2-crest",
    });

    const front = z + 0.014;
    const leftBase: [number, number, number] = [x - width * 0.5, y0 + 0.006, front];
    const rightBase: [number, number, number] = [x + width * 0.5, y0 + 0.006, front];
    const tip: [number, number, number] = [x, y0 + height - 0.004, front];

    b.rod(leftBase, tip, 0.0038, {
      color: black,
      bone: "head",
      section: { ngon: 6 },
      smooth: false,
      name: `${name}EdgeL`,
      group: "stage2-crest",
    });

    b.rod(tip, rightBase, 0.0038, {
      color: black,
      bone: "head",
      section: { ngon: 6 },
      smooth: false,
      name: `${name}EdgeR`,
      group: "stage2-crest",
    });

    b.rod(leftBase, rightBase, 0.0038, {
      color: black,
      bone: "head",
      section: { ngon: 6 },
      smooth: false,
      name: `${name}Base`,
      group: "stage2-crest",
    });

    b.part(new THREE.CircleGeometry(0.012, 10), accent, {
      bone: "head",
      at: [x, y0 + height * 0.32, front + 0.006],
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: `${name}Roundel`,
      group: "stage2-crest",
    });
  };

  // The rear blue triangle is broad and low, establishing the fan silhouette.
  addTriangle(
    -0.052,
    0.174,
    0.105,
    0.082,
    BLUE,
    "crestBlue",
    YELLOW,
  );

  // The red centre triangle is tallest and visually anchors the crest.
  addTriangle(
    0,
    0.198,
    0.102,
    0.094,
    RED,
    "crestRed",
    BLUE,
  );

  // The yellow forward triangle overlaps the red one without reaching the eyes.
  addTriangle(
    0.052,
    0.221,
    0.078,
    0.073,
    YELLOW,
    "crestYellow",
    RED,
  );

  // A compact dark base rail makes the three coloured blades read as one designed ornament.
  b.rod(
    [-0.103, y0 + 0.004, 0.192],
    [0.098, y0 + 0.004, 0.192],
    0.0055,
    {
      color: BLACK,
      bone: "head",
      section: { ngon: 6 },
      smooth: false,
      name: "crestBaseRail",
      group: "stage2-crest",
    },
  );

  // Two tiny primary-colour studs flank the rail, adding a deliberate Bauhaus punctuation mark.
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 8), RED, {
    bone: "head",
    at: [-0.086, y0 + 0.005, 0.207],
    dir: [0, 0, 1],
    flat: true,
    name: "crestStudL",
    group: "stage2-crest",
  });

  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 8), BLUE, {
    bone: "head",
    at: [0.081, y0 + 0.005, 0.207],
    dir: [0, 0, 1],
    flat: true,
    name: "crestStudR",
    group: "stage2-crest",
  });
}
    return addCrest;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addBranchBuds(b: Builder) {
  const group = "stage2-branch-details";

  const point = (p: readonly [number, number, number]) =>
    new THREE.Vector3(p[0], p[1], p[2]);

  const up = new THREE.Vector3(0, 1, 0);

  // Three sparse, faceted buds at the twig forks. Each has a blue geometric
  // socket sunk into the branch and a larger yellow diamond above it.
  const buds: readonly (readonly [number, number, number])[] = [
    [-0.55, 0.36, -0.34],
    [0.59, 0.52, -0.29],
    [0.06, 0.69, -0.25],
  ];

  buds.forEach((p, i) => {
    const base = point(p);
    const baseCenter = base.clone().addScaledVector(up, 0.018);
    const budCenter = base.clone().addScaledVector(up, 0.082);

    b.part(
      new THREE.CylinderGeometry(0.035, 0.042, 0.036, 6, 1, false),
      BLUE,
      {
        at: baseCenter,
        dir: [0, 1, 0],
        flat: true,
        name: `budBase${i + 1}`,
        group,
      },
    );

    b.part(
      new THREE.OctahedronGeometry(0.052, 0),
      YELLOW,
      {
        at: budCenter,
        scale: [0.78, 1.18, 0.78],
        flat: true,
        name: `budDiamond${i + 1}`,
        group,
      },
    );

    // A tiny blue collar peeking between the socket and diamond gives each
    // bud a deliberate Bauhaus layered construction.
    b.part(
      new THREE.CylinderGeometry(0.026, 0.026, 0.012, 6, 1, false),
      BLUE,
      {
        at: base.clone().addScaledVector(up, 0.043),
        dir: [0, 1, 0],
        flat: true,
        name: `budCollar${i + 1}`,
        group,
      },
    );
  });

  const deg = Math.PI / 180;

  const addCutEnd = (
    name: string,
    end: THREE.Vector3,
    outward: THREE.Vector3,
    markAngle: number,
  ) => {
    const axis = outward.clone().normalize();

    // The red ring sits slightly back from the exposed cut, around the
    // narrowing wooden tube rather than floating beyond its end.
    const ringCenter = end.clone().addScaledVector(axis, -0.034);
    b.part(
      new THREE.TorusGeometry(0.052, 0.008, 6, 12),
      RED,
      {
        at: ringCenter,
        dir: axis,
        flat: true,
        name: `${name}RedRing`,
        group,
      },
    );

    // Use the actual cut direction as local +Y. The two chunky black bars
    // lie in its cap plane and form an angular cross-hatch.
    const capAt = end.clone().addScaledVector(axis, 0.006);
    const capFrame = frame(capAt, axis, [0, 1, 0]);

    for (const [j, angle] of [-markAngle, markAngle].entries()) {
      const twist = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle * deg,
      );
      const q = capFrame.quat.clone().multiply(twist);

      b.part(
        new THREE.BoxGeometry(0.074, 0.009, 0.012),
        BLACK,
        {
          at: capAt,
          quat: q,
          flat: true,
          name: `${name}BlackMark${j + 1}`,
          group,
        },
      );
    }

    // A short central square nail-like mark makes the cut read clearly even
    // when viewed almost straight down the branch.
    b.part(
      new THREE.BoxGeometry(0.018, 0.010, 0.018),
      BLACK,
      {
        at: capAt.clone().addScaledVector(axis, 0.003),
        quat: capFrame.quat,
        flat: true,
        name: `${name}CutCenter`,
        group,
      },
    );
  };

  // The branch's two exposed ends, with outward directions taken from the
  // endpoint tangents of the stage-1 branch path.
  addCutEnd(
    "leftBranchEnd",
    new THREE.Vector3(-0.96, 0.075, -0.61),
    new THREE.Vector3(-0.26, -0.115, -0.21),
    28,
  );

  addCutEnd(
    "rightBranchEnd",
    new THREE.Vector3(0.89, 0.15, -0.62),
    new THREE.Vector3(0.37, -0.24, -0.25),
    32,
  );
}
    return addBranchBuds;
  })(),
);
