import * as THREE from "three";
import { type Builder, bezier, catmull, createBuilder, limb, mix, noise, paint, smoothstep, svg } from "../../../../src/index";

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

const BODY_PAINT = paint((p, n) => {
  const broadPatch = smoothstep(0.30, 0.70, noise(p, 0.28, 17));
  const upperLight = smoothstep(0.42, 0.92, p.y);
  const coat = mix(AXO_PALETTE.body, AXO_PALETTE.bodyLight, 0.18 + broadPatch * 0.30 + upperLight * 0.08);
  const belly = 1 - smoothstep(-0.55, -0.10, n.y);
  return mix(coat, AXO_PALETTE.belly, belly * 0.84);
});

const HEAD_PAINT = paint((p, n) => {
  const broadPatch = smoothstep(0.30, 0.72, noise(p, 0.20, 29));
  const upperLight = smoothstep(0.45, 0.92, p.y);
  let color = mix(
    AXO_PALETTE.body,
    AXO_PALETTE.bodyLight,
    0.18 + broadPatch * 0.25 + upperLight * 0.12,
  );
  const muzzle = smoothstep(0.58, 0.80, p.z) * (1 - smoothstep(0.48, 0.72, p.y));
  color = mix(color, AXO_PALETTE.belly, muzzle * 0.48);
  const cheekVariation = smoothstep(0.56, 0.90, noise(p, 0.11, 47));
  return mix(color, AXO_PALETTE.blush, cheekVariation * 0.035);
});

const TAIL_FIN_PAINT = paint((_p, n, s) => {
  const t = Math.min(1, Math.max(0, s[0] / 0.98));
  const color = mix(AXO_PALETTE.tailFin, AXO_PALETTE.gillLight, t);
  const rim = Math.abs(n.x) < 0.55 || s[1] < -0.10 || s[1] > 0.105;
  return rim ? mix(color, AXO_PALETTE.bodyShadow, 0.72) : color;
});

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
      color: BODY_PAINT,
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
      [0.98, -0.015, "sharp"] as [number, number, "sharp"],
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
      color: TAIL_FIN_PAINT,
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

  b.part(new THREE.SphereGeometry(1, 12, 8), HEAD_PAINT, {
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

      const outline: ([number, number] | [number, number, "sharp"])[] = [
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addLeftGillFilaments(b: Builder) {
  const GILL = "#ed4384";
  const GILL_LIGHT = "#ff79aa";
  const GILL_HIGHLIGHT = "#ffacc8";
  const GILL_DARK = "#b92c69";
  const COLLAR = "#ffd9d3";

  type P = [number, number, number];

  const addCapsule = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    radius: number,
    color: string,
    name: string,
  ) => {
    b.capsule(a, c, radius, {
      color,
      bone: "head",
      sides: 6,
      caps: "round",
      name,
      group: "s21_leftGillFilaments",
    });
  };

  const addLeaf = (
    base: THREE.Vector3,
    tip: THREE.Vector3,
    width: number,
    length: number,
    color: string,
    name: string,
  ) => {
    const direction = tip.clone().sub(base);
    const planar = new THREE.Vector3(direction.x, direction.y, 0);

    if (planar.lengthSq() < 1e-8) planar.set(1, 0, 0);
    planar.normalize();

    const widthDirection = new THREE.Vector3(planar.y, -planar.x, 0);
    const origin = base.clone().addScaledVector(planar, -length * 0.20);
    origin.z += 0.006;

    const outline: [number, number][] = [
      [0, -length * 0.18],
      [width * 0.72, -length * 0.04],
      [width, length * 0.27],
      [width * 0.62, length * 0.72],
      [0, length],
      [-width * 0.62, length * 0.72],
      [-width, length * 0.27],
      [-width * 0.72, -length * 0.04],
    ];

    b.extrude(outline, {
      at: origin,
      x: widthDirection,
      y: planar,
      thickness: 0.009,
      bevel: 0.0025,
      smoothing: 1,
      color,
      bone: "head",
      name,
      group: "s21_leftGillFrills",
    });
  };

  const fans: {
    starts: P[];
    ends: P[];
    forks: P[];
  }[] = [
    {
      starts: [
        [0.345, 0.860, 0.470],
        [0.370, 0.880, 0.466],
        [0.395, 0.900, 0.460],
        [0.420, 0.920, 0.450],
      ],
      ends: [
        [0.500, 1.035, 0.470],
        [0.550, 1.020, 0.500],
        [0.575, 0.985, 0.540],
        [0.555, 0.960, 0.405],
      ],
      forks: [
        [0.535, 1.055, 0.445],
        [0.565, 1.000, 0.530],
        [0.570, 0.955, 0.555],
        [0.565, 0.930, 0.380],
      ],
    },
    {
      starts: [
        [0.350, 0.820, 0.450],
        [0.380, 0.830, 0.440],
        [0.410, 0.840, 0.420],
        [0.430, 0.820, 0.400],
      ],
      ends: [
        [0.555, 0.930, 0.400],
        [0.575, 0.880, 0.345],
        [0.570, 0.820, 0.305],
        [0.550, 0.770, 0.370],
      ],
      forks: [
        [0.570, 0.945, 0.455],
        [0.575, 0.860, 0.315],
        [0.575, 0.795, 0.325],
        [0.570, 0.740, 0.425],
      ],
    },
    {
      starts: [
        [0.345, 0.780, 0.430],
        [0.370, 0.780, 0.400],
        [0.400, 0.770, 0.380],
        [0.420, 0.750, 0.360],
      ],
      ends: [
        [0.555, 0.780, 0.345],
        [0.570, 0.735, 0.305],
        [0.550, 0.680, 0.335],
        [0.510, 0.670, 0.400],
      ],
      forks: [
        [0.570, 0.805, 0.385],
        [0.575, 0.750, 0.320],
        [0.570, 0.675, 0.375],
        [0.545, 0.660, 0.440],
      ],
    },
  ];

  const rootBulbs: P[] = [
    [0.340, 0.858, 0.468],
    [0.350, 0.817, 0.448],
    [0.345, 0.778, 0.428],
  ];

  for (let i = 0; i < rootBulbs.length; i++) {
    b.part(new THREE.SphereGeometry(1, 8, 5), COLLAR, {
      bone: "head",
      at: rootBulbs[i],
      scale: [0.040, 0.036, 0.034],
      flat: true,
      name: `s21_gillRootCuff${i + 1}`,
      group: "s21_leftGillFilaments",
    });
  }

  let filamentIndex = 0;

  for (let fanIndex = 0; fanIndex < fans.length; fanIndex++) {
    const fan = fans[fanIndex];

    for (let i = 0; i < fan.starts.length; i++) {
      const start = new THREE.Vector3(...fan.starts[i]);
      const end = new THREE.Vector3(...fan.ends[i]);
      const forkEnd = new THREE.Vector3(...fan.forks[i]);

      const mainColor =
        (fanIndex + i) % 3 === 0
          ? GILL_LIGHT
          : (fanIndex + i) % 3 === 1
            ? GILL
            : GILL_HIGHLIGHT;

      const forkColor = i % 2 === 0 ? GILL_HIGHLIGHT : GILL_LIGHT;

      addCapsule(
        start,
        end,
        0.0105 - fanIndex * 0.0007,
        mainColor,
        `s21_leftGillStem${filamentIndex}`,
      );

      const mainMid = start.clone().lerp(end, 0.53);
      addLeaf(
        mainMid,
        end,
        0.019 - fanIndex * 0.001,
        0.058 - fanIndex * 0.002,
        mainColor,
        `s21_leftGillLeaf${filamentIndex}`,
      );

      const forkStart = start.clone().lerp(end, 0.56);
      addCapsule(
        forkStart,
        forkEnd,
        0.0075,
        forkColor,
        `s21_leftGillBranch${filamentIndex}`,
      );

      const forkMid = forkStart.clone().lerp(forkEnd, 0.56);
      addLeaf(
        forkMid,
        forkEnd,
        0.014,
        0.046,
        forkColor,
        `s21_leftGillBranchLeaf${filamentIndex}`,
      );

      b.part(new THREE.SphereGeometry(1, 6, 4), GILL_DARK, {
        bone: "head",
        at: end,
        scale: [0.014, 0.014, 0.014],
        flat: true,
        name: `s21_leftGillTip${filamentIndex}`,
        group: "s21_leftGillFilaments",
      });

      filamentIndex++;
    }
  }

  const accentRoots: [P, P][] = [
    [
      [0.365, 0.895, 0.468],
      [0.425, 0.955, 0.465],
    ],
    [
      [0.370, 0.835, 0.440],
      [0.435, 0.865, 0.405],
    ],
    [
      [0.370, 0.775, 0.415],
      [0.430, 0.735, 0.370],
    ],
  ];

  for (let i = 0; i < accentRoots.length; i++) {
    const a = new THREE.Vector3(...accentRoots[i][0]);
    const c = new THREE.Vector3(...accentRoots[i][1]);

    addCapsule(
      a,
      c,
      0.0055,
      GILL_DARK,
      `s21_leftGillInnerRidge${i + 1}`,
    );

    const ridgeMid = a.clone().lerp(c, 0.56);
    addLeaf(
      ridgeMid,
      c,
      0.011,
      0.034,
      GILL_HIGHLIGHT,
      `s21_leftGillInnerRidgeLeaf${i + 1}`,
    );
  }
}
    return addLeftGillFilaments;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addRightGillFilaments(b: Builder) {
  const GILL = "#ed4384";
  const GILL_LIGHT = "#ff79aa";
  const GILL_HIGHLIGHT = "#ffacc8";
  const GILL_DARK = "#b92c69";
  const FRECKLE = "#c44772";

  const point = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const filament = (
    name: string,
    points: THREE.Vector3[],
    color: string,
    radius = 0.010,
  ) => {
    b.sweep(catmull(points), [radius, radius * 0.22], {
      bone: "head",
      color,
      sides: 6,
      smooth: false,
      caps: "round",
      name,
      group: "stage2-right-gill-filaments",
    });
  };

  const leaf = (
    name: string,
    root: THREE.Vector3,
    length: number,
    rise: number,
    width: number,
    color: string,
  ) => {
    const outline: [number, number][] = [];

    outline.push(
      [0, 0],
      [length * 0.25, rise * 0.25 - width * 0.54],
      [length * 0.68, rise * 0.68 - width * 0.34],
      [length, rise],
      [length * 0.68, rise * 0.68 + width * 0.34],
      [length * 0.25, rise * 0.25 + width * 0.54],
    );

    b.extrude(outline, {
      at: root,
      x: [-1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.0025,
      color,
      bone: "head",
      name,
      group: "stage2-right-gill-frills",
    });

    const tip = root.clone().add(point(-length, rise, 0.002));
    b.rod(root, tip, 0.0025, {
      bone: "head",
      color: GILL_DARK,
      sides: 5,
      name: `${name}Rib`,
      group: "stage2-right-gill-frills",
    });
  };

  const gillFilaments: {
    name: string;
    points: THREE.Vector3[];
    color: string;
  }[] = [
    {
      name: "rightGillTopUpper",
      points: [
        point(-0.325, 0.902, 0.505),
        point(-0.425, 0.967, 0.535),
        point(-0.555, 1.032, 0.535),
      ],
      color: GILL,
    },
    {
      name: "rightGillTopMiddle",
      points: [
        point(-0.340, 0.910, 0.495),
        point(-0.455, 0.944, 0.500),
        point(-0.565, 0.982, 0.478),
      ],
      color: GILL_LIGHT,
    },
    {
      name: "rightGillTopLower",
      points: [
        point(-0.348, 0.892, 0.485),
        point(-0.445, 0.885, 0.470),
        point(-0.555, 0.922, 0.448),
      ],
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillMiddleUpper",
      points: [
        point(-0.335, 0.820, 0.445),
        point(-0.445, 0.872, 0.415),
        point(-0.565, 0.902, 0.390),
      ],
      color: GILL_LIGHT,
    },
    {
      name: "rightGillMiddleCenter",
      points: [
        point(-0.350, 0.802, 0.432),
        point(-0.462, 0.830, 0.365),
        point(-0.568, 0.855, 0.332),
      ],
      color: GILL,
    },
    {
      name: "rightGillMiddleLower",
      points: [
        point(-0.345, 0.784, 0.420),
        point(-0.455, 0.750, 0.375),
        point(-0.558, 0.790, 0.315),
      ],
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillLowUpper",
      points: [
        point(-0.330, 0.733, 0.378),
        point(-0.438, 0.730, 0.320),
        point(-0.558, 0.750, 0.278),
      ],
      color: GILL,
    },
    {
      name: "rightGillLowCenter",
      points: [
        point(-0.344, 0.714, 0.365),
        point(-0.455, 0.682, 0.300),
        point(-0.565, 0.690, 0.252),
      ],
      color: GILL_LIGHT,
    },
    {
      name: "rightGillLowLower",
      points: [
        point(-0.345, 0.697, 0.350),
        point(-0.452, 0.660, 0.330),
        point(-0.555, 0.652, 0.286),
      ],
      color: GILL_HIGHLIGHT,
    },
  ];

  for (const f of gillFilaments) filament(f.name, f.points, f.color);

  const branches: {
    name: string;
    a: THREE.Vector3;
    b: THREE.Vector3;
    color: string;
  }[] = [
    {
      name: "rightGillTopForkUp",
      a: point(-0.455, 0.944, 0.500),
      b: point(-0.535, 1.045, 0.515),
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillTopForkDown",
      a: point(-0.445, 0.885, 0.470),
      b: point(-0.545, 0.888, 0.430),
      color: GILL_DARK,
    },
    {
      name: "rightGillMiddleForkUp",
      a: point(-0.445, 0.872, 0.415),
      b: point(-0.535, 0.935, 0.390),
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillMiddleForkDown",
      a: point(-0.462, 0.830, 0.365),
      b: point(-0.545, 0.800, 0.305),
      color: GILL_DARK,
    },
    {
      name: "rightGillLowForkUp",
      a: point(-0.438, 0.730, 0.320),
      b: point(-0.535, 0.785, 0.280),
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillLowForkDown",
      a: point(-0.455, 0.682, 0.300),
      b: point(-0.548, 0.665, 0.260),
      color: GILL_DARK,
    },
  ];

  for (const branch of branches) {
    filament(
      branch.name,
      [
        branch.a,
        branch.a.clone().lerp(branch.b, 0.48).add(point(0, 0.012, 0.008)),
        branch.b,
      ],
      branch.color,
      0.0075,
    );
  }

  const leaves: {
    name: string;
    root: THREE.Vector3;
    length: number;
    rise: number;
    width: number;
    color: string;
  }[] = [
    {
      name: "rightGillTopLeafA",
      root: point(-0.505, 1.002, 0.532),
      length: 0.052,
      rise: 0.020,
      width: 0.026,
      color: GILL_LIGHT,
    },
    {
      name: "rightGillTopLeafB",
      root: point(-0.515, 0.950, 0.482),
      length: 0.060,
      rise: -0.018,
      width: 0.030,
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillTopLeafC",
      root: point(-0.500, 0.910, 0.452),
      length: 0.048,
      rise: 0.030,
      width: 0.024,
      color: GILL,
    },
    {
      name: "rightGillMidLeafA",
      root: point(-0.515, 0.875, 0.405),
      length: 0.058,
      rise: 0.026,
      width: 0.030,
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillMidLeafB",
      root: point(-0.520, 0.825, 0.352),
      length: 0.055,
      rise: -0.023,
      width: 0.027,
      color: GILL_LIGHT,
    },
    {
      name: "rightGillMidLeafC",
      root: point(-0.510, 0.775, 0.322),
      length: 0.046,
      rise: 0.028,
      width: 0.023,
      color: GILL,
    },
    {
      name: "rightGillLowLeafA",
      root: point(-0.510, 0.735, 0.285),
      length: 0.052,
      rise: 0.024,
      width: 0.026,
      color: GILL_LIGHT,
    },
    {
      name: "rightGillLowLeafB",
      root: point(-0.520, 0.685, 0.260),
      length: 0.050,
      rise: -0.018,
      width: 0.027,
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillLowLeafC",
      root: point(-0.505, 0.655, 0.285),
      length: 0.044,
      rise: 0.026,
      width: 0.023,
      color: GILL,
    },
    {
      name: "rightGillForkLeafA",
      root: point(-0.505, 1.015, 0.518),
      length: 0.040,
      rise: 0.018,
      width: 0.021,
      color: GILL_HIGHLIGHT,
    },
    {
      name: "rightGillForkLeafB",
      root: point(-0.505, 0.855, 0.390),
      length: 0.044,
      rise: -0.020,
      width: 0.022,
      color: GILL_LIGHT,
    },
    {
      name: "rightGillForkLeafC",
      root: point(-0.505, 0.700, 0.286),
      length: 0.040,
      rise: 0.018,
      width: 0.020,
      color: GILL_HIGHLIGHT,
    },
  ];

  for (const l of leaves) {
    leaf(l.name, l.root, l.length, l.rise, l.width, l.color);
  }

  const gillBuds = [
    [-0.355, 0.906, 0.495],
    [-0.355, 0.810, 0.435],
    [-0.350, 0.718, 0.360],
    [-0.475, 0.968, 0.515],
    [-0.475, 0.850, 0.390],
    [-0.470, 0.700, 0.315],
  ];

  for (let i = 0; i < gillBuds.length; i++) {
    const [x, y, z] = gillBuds[i];
    b.part(new THREE.SphereGeometry(1, 7, 5), i % 2 ? GILL_HIGHLIGHT : GILL_DARK, {
      bone: "head",
      at: [x, y, z],
      scale: [0.015, 0.015, 0.012],
      flat: true,
      name: `rightGillBud${i + 1}`,
      group: "stage2-right-gill-filaments",
    });
  }

  const freckles: {
    x: number;
    y: number;
    z: number;
    r: number;
  }[] = [
    { x: -0.142, y: 0.690, z: 0.794, r: 0.011 },
    { x: -0.108, y: 0.712, z: 0.807, r: 0.009 },
    { x: -0.071, y: 0.680, z: 0.810, r: 0.010 },
    { x: -0.124, y: 0.730, z: 0.810, r: 0.008 },
    { x: -0.050, y: 0.716, z: 0.817, r: 0.007 },
    { x: 0.142, y: 0.690, z: 0.794, r: 0.011 },
    { x: 0.108, y: 0.712, z: 0.807, r: 0.009 },
    { x: 0.071, y: 0.680, z: 0.810, r: 0.010 },
    { x: 0.124, y: 0.730, z: 0.810, r: 0.008 },
    { x: 0.050, y: 0.716, z: 0.817, r: 0.007 },
    { x: -0.026, y: 0.730, z: 0.818, r: 0.006 },
    { x: 0.026, y: 0.730, z: 0.818, r: 0.006 },
  ];

  for (let i = 0; i < freckles.length; i++) {
    const f = freckles[i];
    b.part(new THREE.SphereGeometry(1, 8, 5), FRECKLE, {
      bone: "head",
      at: [f.x, f.y, f.z],
      scale: [f.r, f.r * 0.82, 0.0065],
      flat: true,
      name: `muzzleFreckle${i + 1}`,
      group: "stage2-face-freckles",
    });
  }
}
    return addRightGillFilaments;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addEyeHighlights(b: Builder) {
  const highlightTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80">
      <defs>
        <linearGradient id="shine" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.72"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <ellipse cx="23" cy="24" rx="11.5" ry="16.5" fill="url(#shine)"/>
      <ellipse cx="28" cy="18" rx="5.5" ry="7.5" fill="#ffffff" opacity="0.72"/>
      <circle cx="43" cy="57" r="4.2" fill="#ffacc8"/>
      <circle cx="44.5" cy="55.5" r="1.7" fill="#fff8f1"/>
      <path
        d="M13 43 Q18 49 25 51"
        fill="none"
        stroke="#fff8f1"
        stroke-width="2.2"
        stroke-linecap="round"
        opacity="0.7"
      />
    </svg>`,
    { size: 192 },
  );

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";

    b.decal(b.root, highlightTexture, {
      at: [side * 0.118, 0.805, 0.767],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.064, 0.076],
      segments: 8,
      lift: 0.004,
      bone: "head",
      name: `s23EyeShine${label}`,
      group: "face",
    });

    b.part(new THREE.SphereGeometry(1, 7, 5), "#fff8f1", {
      bone: "head",
      at: [side * 0.095, 0.838, 0.770],
      scale: [0.014, 0.018, 0.005],
      flat: true,
      name: `s23EyeCatchlight${label}`,
      group: "face",
    });

    const lid = bezier(
      [side * 0.060, 0.838, 0.765],
      [side * 0.078, 0.875, 0.768],
      [side * 0.155, 0.878, 0.768],
      [side * 0.176, 0.842, 0.765],
    );

    b.sweep(lid, 0.0065, {
      color: "#542039",
      bone: "head",
      sides: 6,
      caps: "round",
      name: `s23UpperLid${label}`,
      group: "face",
    });

    const lidAccent = bezier(
      [side * 0.069, 0.845, 0.772],
      [side * 0.091, 0.866, 0.775],
      [side * 0.142, 0.868, 0.775],
      [side * 0.163, 0.848, 0.772],
    );

    b.sweep(lidAccent, 0.0022, {
      color: "#d76f97",
      bone: "head",
      sides: 5,
      caps: "round",
      name: `s23LidRoseEdge${label}`,
      group: "face",
    });
  }
}
    return addEyeHighlights;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addToePads(b: Builder) {
  const PAW = AXO_PALETTE.paw;
  const BELLY = AXO_PALETTE.belly;
  const GILL_DARK = AXO_PALETTE.gillDark;
  const GILL_HIGHLIGHT = AXO_PALETTE.gillHighlight;

  const surface = b.surface(b.root);

  const toeLocations: Array<{
    x: number;
    z: number;
    foot: "front" | "rear";
    side: "L" | "R";
    index: number;
  }> = [];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    [
      [0.35, 0.43],
      [0.39, 0.34],
      [0.33, 0.255],
    ].forEach(([x, z], i) => {
      toeLocations.push({
        x: side * x,
        z,
        foot: "front",
        side: sideName,
        index: i,
      });
    });

    [
      [0.35, -0.49],
      [0.40, -0.39],
      [0.34, -0.285],
    ].forEach(([x, z], i) => {
      toeLocations.push({
        x: side * x,
        z,
        foot: "rear",
        side: sideName,
        index: i,
      });
    });
  }

  const padHits = toeLocations.map((toe) => {
    return (
      surface.ray([toe.x, 0.28, toe.z], [0, -1, 0]) ??
      surface.nearest([toe.x, 0.075, toe.z])
    );
  });

  for (let i = 0; i < toeLocations.length; i++) {
    const toe = toeLocations[i];
    const hit = padHits[i];
    const id = `${toe.foot}ToePad${toe.side}${toe.index + 1}`;

    b.stick(new THREE.SphereGeometry(1, 8, 5), PAW, hit, {
      embed: 0.24,
      scale: [0.022, 0.011, 0.017],
      name: id,
      group: "toePads",
    });

    const glint = hit.moved([
      toe.side === "L" ? -0.0025 : 0.0025,
      0.010,
      0.004,
    ]);

    b.stick(new THREE.SphereGeometry(1, 6, 4), BELLY, glint, {
      embed: 0.18,
      scale: [0.0065, 0.0028, 0.0045],
      name: `${id}Highlight`,
      group: "toePads",
    });
  }

  const rayRoot = new THREE.Vector3(0, 0.567, -0.285);
  const rayEnds = [
    new THREE.Vector3(0, 0.578, -0.385),
    new THREE.Vector3(0, 0.615, -0.525),
    new THREE.Vector3(0, 0.665, -0.665),
    new THREE.Vector3(0, 0.685, -0.805),
    new THREE.Vector3(0, 0.652, -0.945),
    new THREE.Vector3(0, 0.605, -1.065),
    new THREE.Vector3(0, 0.565, -1.165),
  ];

  for (let i = 0; i < rayEnds.length; i++) {
    const end = rayEnds[i];
    const start = rayRoot.clone().lerp(end, 0.08);
    const radiusStart = i < 2 ? 0.013 : 0.011;
    const radiusEnd = i === rayEnds.length - 1 ? 0.001 : 0.0028;

    b.rod(start, end, [radiusStart, radiusEnd], {
      color: GILL_DARK,
      bone: "hips",
      sides: 6,
      section: "circle",
      caps: "flat",
      name: `tailFinRay${i + 1}`,
      group: "tailFinDetails",
    });

    const tangent = end.clone().sub(start).normalize();
    const tip = end.clone().addScaledVector(tangent, 0.012);

    b.part(new THREE.SphereGeometry(1, 7, 4), GILL_HIGHLIGHT, {
      bone: "hips",
      at: tip,
      scale: [0.008, 0.006, 0.008],
      flat: true,
      name: `tailFinRayTip${i + 1}`,
      group: "tailFinDetails",
    });
  }

  b.rod(
    new THREE.Vector3(0, 0.568, -0.30),
    new THREE.Vector3(0, 0.568, -1.18),
    [0.0045, 0.001],
    {
      color: GILL_HIGHLIGHT,
      bone: "hips",
      sides: 5,
      caps: "flat",
      name: "tailFinCenterVein",
      group: "tailFinDetails",
    },
  );
}
    return addToePads;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addCheekBlush(b: Builder) {
  const skin = b.surface(b.root);

  const makeDisc = (
    on: any,
    radius: number,
    depth: number,
    color: string,
    name: string,
    scale: [number, number, number],
  ) => {
    return b.stick(
      new THREE.CylinderGeometry(radius, radius * 0.96, depth, 12, 1, false),
      color,
      on,
      {
        bone: "head",
        embed: 0.42,
        scale,
        name,
        group: "face",
      },
    );
  };

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";

    const base = skin.nearest([side * 0.19, 0.69, 0.70]);

    // A broad, slightly darker low-poly rim keeps the blush readable against
    // the pale cheek without making it look like a floating decal.
    makeDisc(
      base,
      0.064,
      0.009,
      AXO_PALETTE.bodyShadow,
      `s25BlushOuter${label}`,
      [1.18, 1, 0.72],
    );

    // Offset outward along the live cheek normal so the two layers do not
    // z-fight, while still inheriting the head's bone.
    const center = base.moved([0, 0.006, 0.001]);

    makeDisc(
      center,
      0.053,
      0.008,
      AXO_PALETTE.blush,
      `s25Blush${label}`,
      [1.18, 1, 0.72],
    );

    // Two tiny pale glints give the patch a soft painted highlight and add
    // asymmetry without covering the smile or crowding the eye.
    const upperGlint = center.moved([side * 0.014, 0.006, 0.014]);
    const lowerGlint = center.moved([-side * 0.018, 0.006, -0.012]);

    makeDisc(
      upperGlint,
      0.014,
      0.006,
      AXO_PALETTE.bodyLight,
      `s25BlushGlintUpper${label}`,
      [1.35, 1, 0.58],
    );

    makeDisc(
      lowerGlint,
      0.009,
      0.005,
      AXO_PALETTE.bodyLight,
      `s25BlushGlintLower${label}`,
      [1.2, 1, 0.62],
    );
  }
}
    return addCheekBlush;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addGillClips(b: Builder) {
  const BELLY = "#ffd9d3";
  const BODY_SHADOW = "#d76f97";
  const BODY_LIGHT = "#ffb5c7";
  const GILL = "#ed4384";
  const GILL_DARK = "#b92c69";

  const collarGeometry = new THREE.TorusGeometry(0.034, 0.009, 6, 10);
  const collarRimGeometry = new THREE.TorusGeometry(0.034, 0.0035, 5, 10);

  const gillRoots = [
    { side: 1, index: 1, at: [0.235, 0.82, 0.49], dir: [0.135, 0.10, 0.01] },
    { side: 1, index: 2, at: [0.255, 0.78, 0.47], dir: [0.155, 0.02, -0.05] },
    { side: 1, index: 3, at: [0.245, 0.73, 0.44], dir: [0.135, -0.05, -0.08] },
    { side: -1, index: 1, at: [-0.235, 0.82, 0.49], dir: [-0.135, 0.10, 0.01] },
    { side: -1, index: 2, at: [-0.255, 0.78, 0.47], dir: [-0.155, 0.02, -0.05] },
    { side: -1, index: 3, at: [-0.245, 0.73, 0.44], dir: [-0.135, -0.05, -0.08] },
  ];

  for (const root of gillRoots) {
    const sideName = root.side > 0 ? "L" : "R";
    const d = new THREE.Vector3(...root.dir).normalize();
    const bandAt = new THREE.Vector3(...root.at).addScaledVector(d, 0.014);
    const rimAt = new THREE.Vector3(...root.at).addScaledVector(d, 0.026);

    b.part(collarGeometry, BELLY, {
      bone: "head",
      at: bandAt,
      dir: d,
      name: `gillClip${sideName}${root.index}`,
      group: "gills",
      flat: true,
    });

    b.part(collarRimGeometry, GILL_DARK, {
      bone: "head",
      at: rimAt,
      dir: d,
      name: `gillClipRim${sideName}${root.index}`,
      group: "gills",
      flat: true,
    });

    const beadAt = new THREE.Vector3(...root.at)
      .addScaledVector(d, 0.035)
      .add(new THREE.Vector3(0, 0.004, 0));

    b.part(new THREE.SphereGeometry(1, 6, 4), GILL, {
      bone: "head",
      at: beadAt,
      scale: [0.012, 0.012, 0.012],
      name: `gillClipBead${sideName}${root.index}`,
      group: "gills",
      flat: true,
    });
  }

  const surface = b.surface(b.root);
  const patchGeometry = new THREE.SphereGeometry(1, 8, 5);
  const tinyPatchGeometry = new THREE.SphereGeometry(1, 7, 4);

  const addPatch = (
    origin: [number, number, number],
    direction: [number, number, number],
    size: [number, number, number],
    color: string,
    name: string,
    tiny = false,
  ) => {
    const hit = surface.ray(origin, direction);
    if (!hit) return;

    b.stick(tiny ? tinyPatchGeometry : patchGeometry, color, hit, {
      embed: 0.58,
      scale: size,
      name,
      group: "bodySpots",
    });
  };

  // Broad, low-poly patches on the upper back. Their ray origins deliberately
  // stay away from the cream belly and the central silhouette.
  addPatch([0.13, 1.12, -0.16], [0, -1, 0], [0.062, 0.014, 0.045], BODY_SHADOW, "backSpotL1");
  addPatch([-0.14, 1.12, -0.03], [0, -1, 0], [0.052, 0.013, 0.040], BODY_LIGHT, "backSpotR1");
  addPatch([0.11, 1.12, 0.14], [0, -1, 0], [0.047, 0.013, 0.035], BODY_SHADOW, "backSpotL2");

  // Rounded flank patches, fetched from the side so their flattened faces
  // follow the curved body rather than floating above it.
  addPatch([0.58, 0.69, -0.19], [-1, 0, 0], [0.054, 0.014, 0.042], BODY_SHADOW, "flankSpotL1");
  addPatch([-0.58, 0.69, -0.10], [1, 0, 0], [0.050, 0.014, 0.038], BODY_LIGHT, "flankSpotR1");

  // Small companion freckles make the large patches feel clustered while
  // retaining the chunky puppet-built silhouette.
  addPatch([0.075, 1.12, -0.205], [0, -1, 0], [0.022, 0.009, 0.018], BODY_LIGHT, "backSpotL1a", true);
  addPatch([0.185, 1.12, -0.105], [0, -1, 0], [0.018, 0.009, 0.015], BODY_SHADOW, "backSpotL1b", true);
  addPatch([-0.195, 1.12, 0.025], [0, -1, 0], [0.018, 0.009, 0.014], BODY_SHADOW, "backSpotR1a", true);
  addPatch([-0.085, 1.12, 0.035], [0, -1, 0], [0.020, 0.009, 0.015], BODY_LIGHT, "backSpotR1b", true);
  addPatch([0.075, 1.12, 0.205], [0, -1, 0], [0.016, 0.009, 0.013], BODY_LIGHT, "backSpotL2a", true);
  addPatch([0.58, 0.69, -0.245], [-1, 0, 0], [0.020, 0.009, 0.016], BODY_LIGHT, "flankSpotL1a", true);
  addPatch([-0.58, 0.69, -0.055], [1, 0, 0], [0.019, 0.009, 0.015], BODY_SHADOW, "flankSpotR1a", true);

  // A few raised dark-pink pinpricks at the upper edge of the back patches
  // echo the axolotl's soft, ornamental surface detail.
  addPatch([0.145, 1.12, -0.085], [0, -1, 0], [0.010, 0.007, 0.010], GILL_DARK, "backSpotPinL", true);
  addPatch([-0.105, 1.12, 0.005], [0, -1, 0], [0.010, 0.007, 0.010], GILL_DARK, "backSpotPinR", true);
}
    return addGillClips;
  })(),
);
