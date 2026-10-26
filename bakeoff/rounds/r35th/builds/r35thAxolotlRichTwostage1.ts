import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  limb,
  type Builder,
} from "../../../../src/index";

export const AXO_PALETTE = {
  body: "#ee91ad",
  bodyLight: "#ffb5c7",
  bodyShadow: "#d76f97",
  belly: "#ffd9d3",
  paw: "#f7a2b8",
  gill: "#ed4384",
  gillLight: "#ff79aa",
  gillHighlight: "#ffacc8",
  gillDark: "#b92c69",
  tailFin: "#f47da5",
  eye: "#341d38",
  mouth: "#542039",
  white: "#fff8f1",
  blush: "#ff8bad",
} as const;

export const meta = {
  name: "chibi-axolotl",
  description:
    "A chunky, friendly chibi axolotl with a broad smiling head, soft pink body, stubby planted feet, a tapering tail fin, and six large frilly external gills.",
};

export const REQUESTS = [
  {
    id: "leftGillFilaments",
    kind: "add",
    part: "head",
    what: "Add a rich fan of fine branching filaments to the axolotl's left-side pink gills. Use several rounded coral-pink rods and small leaf-shaped frills, alternating GILL and GILL_LIGHT, following the three existing gill stalks without obscuring the face.",
    at: [0.34, 0.86, 0.46],
    normal: [1, 0.15, 0],
    bone: "head",
    room: [0.48, 0.42, 0.32],
  },
  {
    id: "rightGillFilaments",
    kind: "add",
    part: "head",
    what: "Mirror the left gill detail on the right side: a dense but readable fan of rounded branching filaments and little leaf frills in GILL, GILL_LIGHT and GILL_HIGHLIGHT. Keep the filaments separated and puppet-like.",
    at: [-0.34, 0.86, 0.46],
    normal: [-1, 0.15, 0],
    bone: "head",
    room: [0.48, 0.42, 0.32],
  },
  {
    id: "faceFreckles",
    kind: "add",
    part: "muzzle",
    what: "Place a small symmetrical constellation of dark pink freckles across the cream muzzle, with three to five rounded dots per side and two tiny freckles near the nose. Keep clear space around both eyes and the smile.",
    at: [0, 0.72, 0.81],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.34, 0.17, 0.035],
  },
  {
    id: "eyeHighlights",
    kind: "add",
    part: "eyeL",
    what: "Enhance both large eyes with layered glossy highlights: one large white rounded glint, one tiny pink-white glint, and a subtle dark upper lid rim. The eyes should remain nearly black and very readable from the front.",
    at: [0, 0.82, 0.77],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.38, 0.18, 0.06],
  },
  {
    id: "toePads",
    kind: "add",
    part: "frontPaws",
    what: "Add soft round toe pads to all four feet: three tiny cream-pink pads on each paw, arranged in a simple chibi fan and seated directly on the existing toes. Use PAW with small BELLY highlights.",
    at: [0.27, 0.075, 0.34],
    normal: [0, 1, 0],
    bone: null,
    room: [0.72, 0.13, 0.72],
  },
  {
    id: "tailFinRays",
    kind: "add",
    part: "tailFin",
    what: "Add a row of broad, dark-pink fin rays inside the tail fin, following its length from the rump toward the pointed tip. Use six or seven low-poly tapered rods, evenly spaced, with slightly brighter tips.",
    at: [0, 0.59, -0.72],
    normal: [0, 0, 1],
    bone: "hips",
    room: [0.16, 0.28, 0.92],
  },
  {
    id: "cheekBlush",
    kind: "add",
    part: "head",
    what: "Add two soft stylized blush patches on the cheeks, one on each side just below and outside the eyes. Use BLUSH as flat low-poly discs or tiny clustered spheres, clearly visible but not covering the smile.",
    at: [0.19, 0.69, 0.70],
    normal: [0.25, 0.1, 0.95],
    bone: "head",
    room: [0.52, 0.19, 0.06],
  },
  {
    id: "gillClips",
    kind: "add",
    part: "gillStalks",
    what: "Add small pale cream collar bands where each of the six gill stalks emerges from the head. The bands should be chunky, clean, and slightly lighter than the belly, like little ornamental cuffs.",
    at: [0.27, 0.78, 0.47],
    normal: [0.8, 0.2, 0.1],
    bone: "head",
    room: [0.66, 0.34, 0.28],
  },
  {
    id: "bodySpotClusters",
    kind: "add",
    part: "body",
    what: "Add a few oversized rounded axolotl speckles along the upper back and rear flanks, using BODY_SHADOW and BODY_LIGHT. Keep the belly clear and leave the central back surface open for the texture pass.",
    at: [0, 0.83, -0.14],
    normal: [0, 1, 0],
    bone: null,
    room: [0.52, 0.16, 0.52],
  },
  {
    id: "bodyPattern",
    kind: "texture",
    part: "body",
    what: "Paint a restrained hand-painted pastel pattern over the body: mostly BODY with irregular soft BODY_LIGHT patches and a warm BELLY underside. Use broad low-frequency patches rather than noise, keeping the silhouette and the clean chibi material readable.",
  },
  {
    id: "headPattern",
    kind: "texture",
    part: "head",
    what: "Paint the head with a gentle BODY to BODY_LIGHT gradient, a warm BELLY muzzle transition, and very subtle rosy cheek variation. Do not texture over the eyes, mouth, or gills; those should remain crisp separate parts.",
  },
  {
    id: "tailFinPattern",
    kind: "texture",
    part: "tailFin",
    what: "Paint the tail fin with a translucent-looking flat-color gradient from TAIL_FIN at the root to GILL_LIGHT near the tip, plus a narrow BODY_SHADOW edge. Keep the fin graphic and low-poly, not realistic.",
  },
] as const;

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const BODY = AXO_PALETTE.body;
  const BODY_LIGHT = AXO_PALETTE.bodyLight;
  const BODY_SHADOW = AXO_PALETTE.bodyShadow;
  const BELLY = AXO_PALETTE.belly;
  const PAW = AXO_PALETTE.paw;
  const GILL = AXO_PALETTE.gill;
  const GILL_LIGHT = AXO_PALETTE.gillLight;
  const GILL_HIGHLIGHT = AXO_PALETTE.gillHighlight;
  const GILL_DARK = AXO_PALETTE.gillDark;
  const TAIL_FIN = AXO_PALETTE.tailFin;
  const EYE = AXO_PALETTE.eye;
  const MOUTH = AXO_PALETTE.mouth;
  const WHITE = AXO_PALETTE.white;

  const hips = b.joint("hips", {
    at: [0, 0.57, -0.25],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.57, -0.25],
    [0, 0.61, -0.05],
    [0, 0.65, 0.18],
    [0, 0.70, 0.40],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    count: 4,
    names: ["spineRear", "spineMid", "spineChest", "spineNeck"],
    role: "spine",
    group: "body",
  });

  const tailPath = catmull([
    [0, 0.57, -0.25],
    [0, 0.55, -0.48],
    [0, 0.54, -0.76],
    [0, 0.55, -1.04],
    [0, 0.58, -1.24],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 5,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    group: "body",
  });

  const neckJoint = spine.tip ?? spine.joints[spine.joints.length - 1];

  const head = b.joint("head", {
    parent: neckJoint,
    at: [0, 0.72, 0.43],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.65, 0.68],
    aim: [0, 0.61, 0.86],
    role: "jaw",
    group: "head",
  });

  type GillRecord = {
    side: number;
    index: number;
    chain: any;
  };

  const gills: GillRecord[] = [];

  const gillCurves = [
    [
      [0.235, 0.82, 0.49],
      [0.37, 0.92, 0.50],
      [0.54, 1.03, 0.46],
    ],
    [
      [0.255, 0.78, 0.47],
      [0.41, 0.80, 0.42],
      [0.58, 0.85, 0.35],
    ],
    [
      [0.245, 0.73, 0.44],
      [0.38, 0.68, 0.36],
      [0.53, 0.64, 0.27],
    ],
  ];

  for (const side of [1, -1]) {
    const sideLabel = side > 0 ? "L" : "R";
    for (let i = 0; i < gillCurves.length; i++) {
      const points = gillCurves[i].map(([x, y, z]) => [side * x, y, z]);
      const name = `gill${sideLabel}${i + 1}`;
      const chain = b.chain(name, catmull(points), {
        parent: head,
        count: 3,
        names: [`${name}Base`, `${name}Mid`, `${name}Tip`],
        role: "fan",
        group: "gills",
      });
      gills.push({ side, index: i, chain });
    }
  }

  type LegRecord = {
    side: number;
    label: string;
    front: boolean;
    chain: any;
    target: THREE.Vector3;
    toes: { chain: any; root: THREE.Vector3; tip: THREE.Vector3; index: number }[];
  };

  const legs: LegRecord[] = [];

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";

    const frontRoot = new THREE.Vector3(side * 0.205, 0.62, 0.22);
    const frontTarget = new THREE.Vector3(side * 0.285, 0.105, 0.33);
    const frontPoints = limb(
      frontRoot,
      frontTarget,
      [0.285, 0.265],
      [new THREE.Vector3(side * 0.55, 0, -1)],
    );

    const front = b.chain(`frontLeg${label}`, frontPoints, {
      parent: hips,
      names: [`shoulder${label}`, `elbow${label}`, `wrist${label}`],
      role: "leg",
      contact: [frontTarget.x, 0, frontTarget.z],
      group: "limbs",
    });

    const frontToes = [
      new THREE.Vector3(side * 0.35, 0.065, 0.43),
      new THREE.Vector3(side * 0.39, 0.065, 0.34),
      new THREE.Vector3(side * 0.33, 0.065, 0.255),
    ];

    const frontRecord: LegRecord = {
      side,
      label,
      front: true,
      chain: front,
      target: frontTarget,
      toes: [],
    };

    for (let i = 0; i < frontToes.length; i++) {
      const toeRoot = frontTarget.clone();
      const toeTip = frontToes[i];
      const toeName = `frontToe${label}${i + 1}`;
      const toe = b.chain(toeName, [toeRoot, toeTip], {
        parent: front.tip ?? front.joints[front.joints.length - 1],
        names: [toeName, `${toeName}Tip`],
        role: "digit",
        group: "limbs",
      });
      frontRecord.toes.push({ chain: toe, root: toeRoot, tip: toeTip, index: i });
    }

    legs.push(frontRecord);

    const rearRoot = new THREE.Vector3(side * 0.215, 0.58, -0.24);
    const rearTarget = new THREE.Vector3(side * 0.29, 0.105, -0.38);
    const rearPoints = limb(
      rearRoot,
      rearTarget,
      [0.30, 0.27],
      [new THREE.Vector3(side * 0.42, 0, 1)],
    );

    const rear = b.chain(`rearLeg${label}`, rearPoints, {
      parent: hips,
      names: [`hip${label}`, `knee${label}`, `ankle${label}`],
      role: "leg",
      contact: [rearTarget.x, 0, rearTarget.z],
      group: "limbs",
    });

    const rearToes = [
      new THREE.Vector3(side * 0.35, 0.065, -0.49),
      new THREE.Vector3(side * 0.40, 0.065, -0.39),
      new THREE.Vector3(side * 0.34, 0.065, -0.285),
    ];

    const rearRecord: LegRecord = {
      side,
      label,
      front: false,
      chain: rear,
      target: rearTarget,
      toes: [],
    };

    for (let i = 0; i < rearToes.length; i++) {
      const toeRoot = rearTarget.clone();
      const toeTip = rearToes[i];
      const toeName = `rearToe${label}${i + 1}`;
      const toe = b.chain(toeName, [toeRoot, toeTip], {
        parent: rear.tip ?? rear.joints[rear.joints.length - 1],
        names: [toeName, `${toeName}Tip`],
        role: "digit",
        group: "limbs",
      });
      rearRecord.toes.push({ chain: toe, root: toeRoot, tip: toeTip, index: i });
    }

    legs.push(rearRecord);
  }

  const body = b.sweep(
    spine,
    (t: number) => [0.255 + 0.035 * Math.sin(t * Math.PI), 0.19 + 0.025 * Math.sin(t * Math.PI)],
    {
      color: BODY,
      sides: 8,
      section: "circle",
      sectors: [[112, 248, BELLY]],
      caps: "round",
      name: "body",
      group: "body",
    },
  );

  const tailTube = b.sweep(
    tail,
    (t: number) => [0.145 * (1 - t) + 0.018, 0.105 * (1 - t) + 0.012],
    {
      color: BODY,
      sides: 7,
      section: "circle",
      sectors: [[112, 248, BELLY]],
      caps: { start: "round", end: "point" },
      name: "tailTube",
      group: "body",
    },
  );

  b.extrude(
    [
      [0.00, -0.10],
      [0.20, -0.125],
      [0.48, -0.15],
      [0.78, -0.105],
      [0.98, -0.015, "sharp"],
      [0.88, 0.095],
      [0.60, 0.155],
      [0.30, 0.135],
      [0.00, 0.085],
    ],
    {
      at: [0, 0.565, -0.27],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.006,
      color: TAIL_FIN,
      bone: hips,
      name: "tailFin",
      group: "tail",
    },
  );

  b.extrude(
    [
      [0.01, -0.065],
      [0.22, -0.087],
      [0.50, -0.10],
      [0.80, -0.06],
      [0.94, 0.0, "sharp"],
      [0.79, 0.06],
      [0.48, 0.10],
      [0.22, 0.08],
      [0.01, 0.055],
    ],
    {
      at: [0, 0.565, -0.275],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: GILL_LIGHT,
      bone: hips,
      name: "tailFinInner",
      group: "tail",
    },
  );

  b.part(new THREE.SphereGeometry(1, 12, 8), BODY, {
    bone: head,
    at: [0, 0.73, 0.46],
    scale: [0.34, 0.285, 0.325],
    flat: true,
    name: "head",
    group: "head",
  });

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";

    b.part(new THREE.SphereGeometry(1, 9, 6), BODY_LIGHT, {
      bone: head,
      at: [side * 0.235, 0.675, 0.535],
      scale: [0.125, 0.145, 0.13],
      flat: true,
      name: `cheek${label}`,
      group: "head",
    });

    b.part(new THREE.SphereGeometry(1, 10, 7), EYE, {
      bone: head,
      at: [side * 0.118, 0.805, 0.705],
      scale: [0.078, 0.092, 0.062],
      flat: true,
      name: `eye${label}`,
      group: "face",
    });

    b.part(new THREE.SphereGeometry(1, 7, 5), WHITE, {
      bone: head,
      at: [side * 0.094, 0.838, 0.758],
      scale: [0.025, 0.031, 0.016],
      flat: true,
      name: `eyeGlint${label}`,
      group: "face",
    });

    b.part(new THREE.SphereGeometry(1, 6, 4), GILL_HIGHLIGHT, {
      bone: head,
      at: [side * 0.145, 0.777, 0.758],
      scale: [0.010, 0.014, 0.008],
      flat: true,
      name: `eyePinGlint${label}`,
      group: "face",
    });
  }

  b.part(new THREE.SphereGeometry(1, 10, 6), BELLY, {
    bone: head,
    at: [0, 0.685, 0.705],
    scale: [0.205, 0.135, 0.115],
    flat: true,
    name: "muzzle",
    group: "face",
  });

  b.part(new THREE.SphereGeometry(1, 7, 5), GILL_DARK, {
    bone: head,
    at: [0, 0.735, 0.812],
    scale: [0.045, 0.032, 0.025],
    flat: true,
    name: "nose",
    group: "face",
  });

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 6, 4), MOUTH, {
      bone: head,
      at: [side * 0.048, 0.715, 0.814],
      scale: [0.014, 0.010, 0.008],
      flat: true,
      name: `nostril${label}`,
      group: "face",
    });
  }

  for (const side of [1, -1]) {
    const curve = bezier(
      [0, 0.690, 0.812],
      [side * 0.035, 0.655, 0.818],
      [side * 0.095, 0.645, 0.807],
      [side * 0.145, 0.680, 0.792],
    );
    b.sweep(curve, 0.010, {
      color: MOUTH,
      bone: jaw,
      sides: 6,
      caps: "round",
      name: `smile${side > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  b.part(new THREE.SphereGeometry(1, 9, 6), BODY_LIGHT, {
    bone: jaw,
    at: [0, 0.635, 0.735],
    scale: [0.17, 0.060, 0.105],
    flat: true,
    name: "lowerJaw",
    group: "face",
  });

  for (const leg of legs) {
    const label = leg.label;
    const legColor = leg.front ? BODY_LIGHT : BODY_SHADOW;

    b.sweep(leg.chain, [0.070, 0.045], {
      color: legColor,
      sides: 6,
      section: "circle",
      caps: "round",
      name: `${leg.front ? "front" : "rear"}LegTube${label}`,
      group: "limbs",
    });

    b.part(new THREE.SphereGeometry(1, 8, 5), PAW, {
      bone: leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1],
      at: [leg.target.x, 0.09, leg.target.z],
      scale: [0.105, 0.090, 0.12],
      flat: true,
      name: `${leg.front ? "front" : "rear"}Paw${label}`,
      group: "limbs",
    });

    for (const toe of leg.toes) {
      b.sweep(toe.chain, [0.020, 0.011], {
        color: PAW,
        sides: 6,
        caps: "round",
        name: `toeTube${label}${leg.front ? "F" : "H"}${toe.index + 1}`,
        group: "digits",
      });

      b.part(new THREE.SphereGeometry(1, 6, 4), BELLY, {
        bone: toe.chain.tip ?? toe.chain.joints[toe.chain.joints.length - 1],
        at: toe.tip,
        scale: [0.020, 0.014, 0.027],
        flat: true,
        name: `toeTip${label}${leg.front ? "F" : "H"}${toe.index + 1}`,
        group: "digits",
      });
    }
  }

  for (const gill of gills) {
    const sideLabel = gill.side > 0 ? "L" : "R";
    const chainName = `gillStalk${sideLabel}${gill.index + 1}`;

    b.sweep(gill.chain, [0.036, 0.017], {
      color: GILL,
      sides: 7,
      caps: { start: "round", end: "point" },
      name: chainName,
      group: "gills",
    });

    const leafTimes = [0.16, 0.39, 0.62, 0.84];

    for (let j = 0; j < leafTimes.length; j++) {
      const t = leafTimes[j];
      const at = gill.chain.at(t);
      const upward = j % 2 === 0 ? 1 : -1;
      const size = 0.82 + 0.16 * Math.sin((gill.index + 1) * 1.7 + j);

      const outline: [number, number, "sharp"?][] = [
        [0, -0.022 * upward],
        [0.034 * size, -0.010 * upward],
        [0.072 * size, 0.025 * upward],
        [0.047 * size, 0.087 * upward],
        [0.012 * size, 0.115 * upward],
        [0, 0.055 * upward],
      ];

      b.extrude(outline, {
        at,
        x: [gill.side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: j % 3 === 0 ? GILL_HIGHLIGHT : GILL_LIGHT,
        bone: at.bone,
        name: `gillFrill${sideLabel}${gill.index + 1}_${j + 1}`,
        group: "gills",
      });

      const secondary = b.spike(
        at,
        [gill.side, upward * 0.42, 0.08],
        0.065 * size,
        0.013,
        {
          color: GILL_DARK,
          bone: at.bone,
          sides: 6,
          name: `gillRay${sideLabel}${gill.index + 1}_${j + 1}`,
          group: "gills",
        },
      );

      void secondary;
    }

    const tip = gill.chain.at(0.96);
    b.spike(tip, [gill.side, 0.20, 0.05], 0.085, 0.018, {
      color: GILL_DARK,
      bone: tip.bone,
      sides: 7,
      name: `gillTip${sideLabel}${gill.index + 1}`,
      group: "gills",
    });
  }

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";

    b.rod(
      [side * 0.20, 0.88, 0.555],
      [side * 0.32, 0.90, 0.515],
      0.010,
      {
        color: GILL_DARK,
        bone: head,
        name: `gillRootRidge${label}`,
        group: "gills",
      },
    );
  }

  b.part(new THREE.SphereGeometry(1, 8, 5), BODY_LIGHT, {
    bone: head,
    at: [0, 0.865, 0.455],
    scale: [0.115, 0.055, 0.105],
    flat: true,
    name: "foreheadPuff",
    group: "head",
  });

  b.rod(
    [-0.17, 0.875, 0.735],
    [-0.055, 0.895, 0.757],
    0.012,
    {
      color: BODY_SHADOW,
      bone: head,
      name: "browR",
      group: "face",
    },
  );

  b.rod(
    [0.055, 0.895, 0.757],
    [0.17, 0.875, 0.735],
    0.012,
    {
      color: BODY_SHADOW,
      bone: head,
      name: "browL",
      group: "face",
    },
  );

  for (const add of STAGE2) add(b);

  return b.root;
}
