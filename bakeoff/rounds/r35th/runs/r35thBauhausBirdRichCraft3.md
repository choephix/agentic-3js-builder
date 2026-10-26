```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  grain,
  limb,
  svg,
} from "agentic-3js-builder";

const RED = "#d93636";
const BLUE = "#1557a6";
const YELLOW = "#f4c431";
const ORANGE = "#e97928";
const BLACK = "#171b2a";
const WHITE = "#fff5d6";
const BRANCH_DARK = "#263449";
const BRANCH_LIGHT = "#68758a";

const BRANCH = grain(BRANCH_DARK, BRANCH_LIGHT, {
  size: 0.16,
  axis: "z",
  seed: 12,
});

const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 128">
    <path d="M8 67 Q50 14 92 67 Q50 110 8 67Z" fill="#fff5d6" stroke="#171b2a" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="52" cy="66" r="27" fill="#d93636" stroke="#171b2a" stroke-width="6"/>
    <circle cx="52" cy="68" r="11" fill="#171b2a"/>
    <circle cx="43" cy="54" r="8" fill="#ffffff"/>
    <circle cx="61" cy="80" r="4" fill="#ffffff"/>
    <path d="M12 47 Q43 5 87 27" fill="none" stroke="#171b2a" stroke-width="8" stroke-linecap="square"/>
  </svg>`,
  { size: 256 },
);

const CHEST_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="56" fill="#171b2a"/>
    <rect x="27" y="27" width="74" height="74" fill="#f4c431"/>
    <circle cx="64" cy="64" r="29" fill="#d93636"/>
    <rect x="54" y="30" width="20" height="68" fill="#fff5d6"/>
    <rect x="30" y="54" width="68" height="20" fill="#fff5d6"/>
  </svg>`,
  { size: 256 },
);

const WING_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="9" y="9" width="110" height="110" fill="#f4c431" stroke="#171b2a" stroke-width="7"/>
    <circle cx="64" cy="64" r="39" fill="#d93636"/>
    <rect x="26" y="55" width="76" height="18" fill="#fff5d6"/>
    <rect x="55" y="26" width="18" height="76" fill="#fff5d6"/>
  </svg>`,
  { size: 192 },
);

const TAIL_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
    <path d="M8 8 H56 V120 L32 104 L8 120Z" fill="#f4c431" stroke="#171b2a" stroke-width="6"/>
    <circle cx="32" cy="50" r="18" fill="#d93636"/>
    <rect x="24" y="68" width="16" height="40" fill="#1557a6"/>
  </svg>`,
  { size: 192 },
);

const BEAK_TOP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
    <path d="M3 7 H55 L61 16 L55 25 H3 L14 16Z" fill="#f4c431" stroke="#171b2a" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string,
  at: THREE.Vector3 | [number, number, number],
  bone: any,
  name: string,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    flat: true,
    name,
  });
}

export default function build() {
  const b = createBuilder({
    name: "bauhaus-songbird",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one compact spine, a separate head and jaw, wings, tail, legs, and individual toes.

  const spinePath = catmull([
    [0, 0.91, 0.0],
    [0, 1.02, 0.035],
    [0, 1.14, 0.12],
  ]);

  const spine = b.chain("spine", spinePath, {
    names: ["body", "chest", "neckBase"],
    role: "spine",
  });

  const body = spine.joints[0];
  const chest = spine.joints[1];
  const neckBase = spine.joints[2];

  const headCenter = new THREE.Vector3(0, 1.285, 0.225);

  const neck = b.chain(
    "neck",
    catmull([
      neckBase.at,
      [0, 1.225, 0.175],
      headCenter,
    ]),
    {
      parent: neckBase,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: headCenter,
    dir: [0, 0.02, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.255, 0.375],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "face",
  });

  const wingChains: any[] = [];
  const wingLowerEdges: THREE.Vector3[][] = [];

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";
    const wingRoot: [number, number, number] = [side * 0.16, 1.055, 0.025];
    const wingMid: [number, number, number] = [side * 0.38, 1.21, 0.045];
    const wingTip: [number, number, number] = [side * 0.61, 1.31, 0.06];

    const wing = b.chain(
      `wing${label}`,
      catmull([wingRoot, wingMid, wingTip]),
      {
        parent: chest,
        names: [`wing${label}`, `wing${label}Mid`, `wing${label}Tip`],
        role: "wing",
        group: "wings",
      },
    );

    wingChains.push(wing);

    wingLowerEdges.push([
      new THREE.Vector3(side * 0.14, 0.99, 0.025),
      new THREE.Vector3(side * 0.35, 1.075, 0.045),
      new THREE.Vector3(side * 0.53, 1.12, 0.055),
    ]);
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.955, -0.22],
      [0, 1.005, -0.42],
      [0, 1.055, -0.72],
    ]),
    {
      parent: body,
      names: ["tailBase", "tailMid", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  const legChains: any[] = [];
  const toeChains: any[][] = [];

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";
    const hip: [number, number, number] = [side * 0.105, 0.79, 0.035];
    const footTarget: [number, number, number] = [side * 0.125, 0.585, 0.055];

    const legPoints = limb(
      hip,
      footTarget,
      [0.17, 0.22],
      [
        [0, 0, 1],
      ],
    );

    const leg = b.chain(`leg${label}`, legPoints, {
      parent: body,
      names: [`hip${label}`, `knee${label}`, `ankle${label}`],
      role: "leg",
      contact: footTarget,
      group: "legs",
    });

    legChains.push(leg);

    const foot = leg.tip!;
    const toes: any[] = [];

    const toeTargets: [number, number, number][] = [
      [side * 0.13, 0.56, 0.18],
      [side * 0.19, 0.555, 0.11],
      [side * 0.125, 0.56, -0.085],
    ];

    const toeNames = ["front", "side", "back"];

    for (let i = 0; i < toeTargets.length; i++) {
      const toe = b.chain(
        `toe${label}${toeNames[i]}`,
        [foot.at, toeTargets[i]],
        {
          parent: foot,
          names: [`toe${label}${toeNames[i]}`, `toe${label}${toeNames[i]}Tip`],
          role: "digit",
          group: "digits",
        },
      );
      toes.push(toe);
    }

    toeChains.push(toes);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Branch: a single graphic, faceted branch with a short grounded support.

  const branchPath = catmull([
    [-0.88, 0.235, -0.095],
    [-0.58, 0.355, -0.075],
    [-0.18, 0.465, -0.055],
    [0.22, 0.485, -0.045],
    [0.61, 0.515, -0.035],
    [0.9, 0.57, -0.025],
  ]);

  const branch = b.sweep(branchPath, 0.062, {
    color: BRANCH,
    section: { ngon: 8 },
    caps: "round",
    name: "branch",
    group: "scenery",
  });

  const supportPath = catmull([
    [-0.7, 0.055, -0.095],
    [-0.7, 0.16, -0.095],
    [-0.67, 0.28, -0.08],
  ]);

  b.sweep(supportPath, 0.052, {
    color: BRANCH,
    section: { ngon: 7 },
    caps: "round",
    name: "branchSupport",
    group: "scenery",
  });

  const branchBandPositions = [0.18, 0.41, 0.68, 0.88];
  const branchBandColors = [RED, YELLOW, RED, YELLOW];

  for (let i = 0; i < branchBandPositions.length; i++) {
    const at = branch.at(branchBandPositions[i]);
    b.stick(
      new THREE.CylinderGeometry(0.074, 0.074, 0.019, 8),
      branchBandColors[i],
      at,
      {
        embed: 0.18,
        name: `branchBand${i}`,
        group: "scenery",
      },
    );
  }

  // A small Bauhaus square plate at the grounded cut, making the support read as intentional scenery.
  box(
    b,
    [0.17, 0.022, 0.13],
    RED,
    [-0.7, 0.015, -0.095],
    body,
    "branchFootPlate",
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Main bird volume: low-poly yellow body, red breast, and a blue geometric neck band.

  const bodyPart = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    YELLOW,
    {
      bone: body,
      at: [0, 0.91, 0.0],
      scale: [0.235, 0.285, 0.345],
      flat: true,
      name: "body",
      group: "bird",
    },
  );

  const breast = b.part(
    new THREE.SphereGeometry(1, 10, 7),
    RED,
    {
      bone: body,
      at: [0, 0.905, 0.292],
      scale: [0.135, 0.185, 0.075],
      flat: true,
      name: "redBreast",
      group: "bird",
    },
  );

  b.sweep(neck, [0.105, 0.085], {
    color: YELLOW,
    section: { ngon: 8 },
    caps: "round",
    name: "neck",
    group: "bird",
  });

  b.stick(
    new THREE.CylinderGeometry(0.125, 0.125, 0.027, 8),
    BLUE,
    neck.at(0.47),
    {
      embed: 0.12,
      name: "neckBand",
      group: "bird",
    },
  );

  b.stick(
    new THREE.CylinderGeometry(0.137, 0.137, 0.018, 8),
    RED,
    neck.at(0.73),
    {
      embed: 0.11,
      name: "neckBandTrim",
      group: "bird",
    },
  );

  // Chest emblem projected onto the curved breast.
  const bodySurface = b.surface(bodyPart);
  const chestHit = bodySurface.nearest([0, 0.905, 0.344]);

  b.decal(bodyPart, CHEST_MARK, {
    at: chestHit,
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.145, 0.145],
    segments: 8,
    lift: 0.003,
    bone: body,
    name: "chestEmblem",
    group: "markings",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Head and face, built before the wings and tail so the expression stays clear.

  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    YELLOW,
    {
      bone: head,
      at: headCenter,
      scale: [0.195, 0.205, 0.205],
      flat: true,
      name: "head",
      group: "face",
    },
  );

  const cap = b.part(
    new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    BLUE,
    {
      bone: head,
      at: headCenter,
      scale: [0.199, 0.207, 0.209],
      flat: true,
      name: "blueCap",
      group: "face",
    },
  );

  const headSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const eyeHit = headSurface.around(headCenter).at(side * 33, 7);

    b.decal(skull, EYE, {
      at: eyeHit,
      size: [0.071, 0.091],
      mirror: side > 0,
      lift: 0.004,
      segments: 8,
      name: side > 0 ? "eyeL" : "eyeR",
      group: "face",
    });
  }

  // A single angular crest gives the otherwise circular head a strong Bauhaus silhouette.
  const crown = headSurface.around(headCenter).at(0, 76);
  b.stick(
    new THREE.ConeGeometry(0.052, 0.115, 6),
    RED,
    crown,
    {
      embed: 0.22,
      name: "crest",
      group: "face",
    },
  );

  // Upper beak: a yellow rectangular wedge.
  const upperBeak = b.frustumBox(
    [0, 1.285, 0.345],
    [0, 1.285, 0.475],
    [0.105, 0.075],
    [0.022, 0.025],
    {
      bone: head,
      color: YELLOW,
      flat: true,
      name: "upperBeak",
      group: "face",
    },
  );

  // A small red underside makes the separate jaw readable.
  const lowerBeak = b.frustumBox(
    [0, 1.255, 0.355],
    [0, 1.235, 0.455],
    [0.082, 0.043],
    [0.018, 0.014],
    {
      bone: jaw,
      color: RED,
      flat: true,
      name: "lowerBeak",
      group: "jaw",
    },
  );

  // Open the jaw only a little: a readable hinge, not a dramatic grimace.
  b.pose(jaw, {
    axis: [1, 0, 0],
    deg: 9,
  });

  // Black throat hinge line and a tiny beak-tip cap.
  box(
    b,
    [0.084, 0.018, 0.018],
    BLACK,
    [0, 1.252, 0.355],
    jaw,
    "jawLine",
  );

  b.stick(
    new THREE.SphereGeometry(0.018, 6, 4),
    BLACK,
    [0, 1.285, 0.476],
    {
      bone: head,
      name: "beakTip",
      group: "face",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: blue membranes with crisp yellow/red bars and graphic emblems.

  for (let index = 0; index < wingChains.length; index++) {
    const side = index === 0 ? 1 : -1;
    const label = side > 0 ? "L" : "R";
    const wing = wingChains[index];
    const lower = wingLowerEdges[index];

    const wingMembrane = b.membrane(wing, lower, {
      color: BLUE,
      thickness: 0.021,
      rows: 4,
      cols: 7,
      scallop: 0.14,
      bone: wing.joints[0],
      name: `wingMembrane${label}`,
      group: "wings",
    });

    // Bold rods are deliberately over-large: they read as painted geometric ribs.
    b.rod(
      [side * 0.205, 1.11, 0.078],
      [side * 0.565, 1.285, 0.082],
      0.017,
      {
        bone: wing.joints[0],
        color: YELLOW,
        section: { ngon: 6 },
        name: `wingYellowBar${label}`,
        group: "wings",
      },
    );

    b.rod(
      [side * 0.255, 1.045, 0.084],
      [side * 0.505, 1.165, 0.09],
      0.014,
      {
        bone: wing.joints[0],
        color: RED,
        section: { ngon: 6 },
        name: `wingRedBar${label}`,
        group: "wings",
      },
    );

    const wingSurface = b.surface(wingMembrane);
    const markHit = wingSurface.nearest([side * 0.42, 1.18, 0.085]);

    b.decal(wingMembrane, WING_MARK, {
      at: markHit,
      size: [0.105, 0.105],
      mirror: side > 0,
      lift: 0.004,
      segments: 6,
      name: `wingMark${label}`,
      group: "markings",
    });

    // A yellow low-poly tip medallion sits at the outer joint.
    b.stick(
      new THREE.CylinderGeometry(0.052, 0.052, 0.025, 8),
      YELLOW,
      wing.tip!,
      {
        embed: 0.14,
        spin: side > 0 ? 8 : -8,
        name: `wingTipMedallion${label}`,
        group: "wings",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Tail: one tapered blue center tube plus three broad, graphic feather slabs.

  b.sweep(tail, [0.115, 0.022], {
    color: BLUE,
    section: { ngon: 7 },
    caps: {
      start: "round",
      end: "point",
    },
    name: "tailTube",
    group: "tail",
  });

  const centerFeather = b.slab(
    [
      [-0.075, 1.0, -0.235],
      [0.075, 1.0, -0.235],
      [0.095, 1.055, -0.69],
      [0.0, 1.115, -0.84],
      [-0.095, 1.055, -0.69],
    ],
    {
      color: RED,
      thickness: 0.026,
      bone: tail.joints[0],
      name: "tailCenterFeather",
      group: "tail",
    },
  );

  const leftFeather = b.slab(
    [
      [0.025, 0.99, -0.235],
      [0.145, 1.0, -0.225],
      [0.335, 1.12, -0.64],
      [0.27, 1.17, -0.79],
      [0.115, 1.08, -0.59],
    ],
    {
      color: BLUE,
      thickness: 0.026,
      bone: tail.joints[0],
      name: "tailLeftFeather",
      group: "tail",
    },
  );

  const rightFeather = b.slab(
    [
      [-0.025, 0.99, -0.235],
      [-0.145, 1.0, -0.225],
      [-0.335, 1.12, -0.64],
      [-0.27, 1.17, -0.79],
      [-0.115, 1.08, -0.59],
    ],
    {
      color: BLUE,
      thickness: 0.026,
      bone: tail.joints[0],
      name: "tailRightFeather",
      group: "tail",
    },
  );

  // The center feather receives a small vertical Bauhaus mark.
  b.decal(centerFeather, TAIL_MARK, {
    at: [0, 1.045, -0.52],
    dir: [0, 0.2, -1],
    up: [0, 1, 0],
    size: [0.075, 0.15],
    segments: 5,
    lift: 0.003,
    bone: tail.joints[0],
    name: "tailMark",
    group: "markings",
  });

  // A yellow square at the tail root makes the fan join visually to the body.
  box(
    b,
    [0.17, 0.095, 0.035],
    YELLOW,
    [0, 0.985, -0.245],
    tail.joints[0],
    "tailRootPlate",
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and toes: orange sticks, chunky joints, and black geometric claw tips.

  for (let index = 0; index < legChains.length; index++) {
    const side = index === 0 ? 1 : -1;
    const label = side > 0 ? "L" : "R";
    const leg = legChains[index];

    b.sweep(leg, (t: number) => 0.027 - 0.007 * t, {
      color: ORANGE,
      section: { ngon: 6 },
      caps: "round",
      name: `legTube${label}`,
      group: "legs",
    });

    b.stick(
      new THREE.SphereGeometry(0.035, 7, 5),
      YELLOW,
      leg.joints[1],
      {
        embed: 0.18,
        name: `kneeCap${label}`,
        group: "legs",
      },
    );

    const toes = toeChains[index];

    for (let i = 0; i < toes.length; i++) {
      const toe = toes[i];

      b.sweep(toe, [0.015, 0.006], {
        color: ORANGE,
        section: { ngon: 6 },
        caps: {
          start: "round",
          end: "point",
        },
        name: `toeTube${label}${i}`,
        group: "digits",
      });

      const tip = toe.tip!;
      b.spike(tip, tip, 0.025, 0.0055, {
        color: BLACK,
        caps: "point",
        name: `claw${label}${i}`,
        group: "digits",
      });
    }
  }

  // A few primary-color rivets on the branch reinforce the designed, non-naturalistic Bauhaus staging.
  const branchRivetPoints = [
    [-0.43, 0.405, -0.14],
    [0.24, 0.49, -0.105],
    [0.67, 0.535, -0.095],
  ];

  for (let i = 0; i < branchRivetPoints.length; i++) {
    b.part(
      new THREE.SphereGeometry(0.022, 6, 4),
      i === 1 ? RED : YELLOW,
      {
        at: branchRivetPoints[i],
        bone: body,
        flat: true,
        name: `branchRivet${i}`,
        group: "scenery",
      },
    );
  }

  return b.root;
}

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A low-poly songbird perched on a faceted branch, built from bold yellow, red, blue, orange, and black geometric forms with graphic eyes, wing emblems, a red breast, angular tail feathers, articulated jaw, legs, toes, and grounding branch support.",
};
```