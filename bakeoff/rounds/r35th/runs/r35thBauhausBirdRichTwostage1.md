```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  polyline,
  type Builder,
} from "agentic-3js-builder";

export const RED = "#e63b32";
export const BLUE = "#1769aa";
export const YELLOW = "#f4c430";
export const CYAN = "#20b9c7";
export const MAGENTA = "#d83b8d";
export const WHITE = "#fff8df";
export const BLACK = "#171b2b";
export const ORANGE = "#ef8b2c";
export const WOOD = "#704126";
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
    color: WOOD,
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
    color: YELLOW,
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
    RED,
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
      color: BLUE,
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
      color: RED,
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
```