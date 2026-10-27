import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  frame,
} from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A fantastical Oaxacan alebrije carved from painted wood: a spotted jaguar body with an eagle head, open beak, enormous feathered wings, paws, tail, and bright folk-art ornament.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const COAT = "#d94b28";
  const COAT_DARK = "#8f251d";
  const GOLD = "#f5b52e";
  const TURQUOISE = "#17a9a4";
  const BLUE = "#2459a8";
  const PURPLE = "#713d91";
  const CREAM = "#f6d892";
  const WOOD = "#6b281d";
  const INK = "#24152b";
  const WHITE = "#fff1c2";
  const ORANGE = "#ed7425";
  const GREEN = "#3d9b59";

  // ---------------------------------------------------------------------------
  // Skeleton: one rooted spine, neck/head, four legs, tail, wing fingers, jaw.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.91, -0.18],
    dir: [0, 0.03, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.0, 0.94, -0.48],
      [0, 1.02, -0.12],
      [0, 1.08, 0.28],
      [0, 1.15, 0.58],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "spineShoulders", "chestTip"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.12, 0.48],
      [0, 1.28, 0.63],
      [0, 1.43, 0.78],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckTop", "headSocket"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.48, 0.82],
    dir: [0, 0.02, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.43, 0.94],
    dir: [0, -0.2, 1],
    role: "jaw",
    group: "face",
  });

  const legTargets = [
    ["legL", "hipL", "kneeL", "ankleL", [0.29, 0.1, -0.4] as [number, number, number], [0, 0, 1] as [number, number, number]],
    ["legR", "hipR", "kneeR", "ankleR", [-0.29, 0.1, -0.4] as [number, number, number], [0, 0, 1] as [number, number, number]],
    ["legFL", "shoulderL", "elbowL", "wristL", [0.30, 0.1, 0.43] as [number, number, number], [0, 0, 1] as [number, number, number]],
    ["legFR", "shoulderR", "elbowR", "wristR", [-0.30, 0.1, 0.43] as [number, number, number], [0, 0, 1] as [number, number, number]],
  ] as const;

  const legs: any[] = [];
  for (const [chainName, n0, n1, n2, target, bend] of legTargets) {
    const root = target[0] > 0 ? [0.22, 0.99, target[2] + 0.12] : [-0.22, 0.99, target[2] + 0.12];
    const pts = limb(root, target, [0.29, 0.27, 0.22], [bend, bend]);
    const ch = b.chain(chainName, pts, {
      parent: chainName.includes("shoulder") ? spine.joints[2] : hips,
      names: [n0, n1, n2],
      role: "leg",
      contact: target,
    });
    legs.push(ch);
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.88, -0.47],
      [0, 0.75, -0.78],
      [0.02, 0.72, -1.08],
      [0.12, 0.82, -1.34],
      [0.28, 1.02, -1.53],
    ]),
    {
      parent: hips,
      names: ["tail0", "tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.05, 1.25, 0.34],
      [0.38, 1.43, 0.27],
      [0.78, 1.66, 0.18],
      [1.18, 1.82, 0.08],
    ]),
    { parent: spine.joints[2], names: ["wingL", "wingElbowL", "wingTipL"], role: "wing" },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.05, 1.25, 0.34],
      [-0.38, 1.43, 0.27],
      [-0.78, 1.66, 0.18],
      [-1.18, 1.82, 0.08],
    ]),
    { parent: spine.joints[2], names: ["wingR", "wingElbowR", "wingTipR"], role: "wing" },
  );

  // ---------------------------------------------------------------------------
  // Main carved wooden forms.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.30 + 0.10 * Math.sin(Math.PI * t), {
    color: COAT,
    sides: 8,
    section: "circle",
    caps: "round",
    group: "wooden-body",
  });

  b.sweep(neck, [0.22, 0.18], {
    color: TURQUOISE,
    sides: 8,
    caps: "round",
    group: "wooden-body",
  });

  b.sweep(tail, (t) => 0.14 * (1 - t) + 0.035, {
    color: COAT_DARK,
    sides: 7,
    caps: { start: "round", end: "point" },
    bands: [[0.45, GOLD], [0.72, PURPLE], [0.88, TURQUOISE]],
    group: "wooden-body",
  });

  const legColors = [GOLD, TURQUOISE, BLUE, ORANGE];
  legs.forEach((leg, i) => {
    b.sweep(leg, [0.105, 0.075], {
      color: legColors[i],
      sides: 6,
      caps: "round",
      group: "carved-legs",
    });
  });

  // Paws and toes.
  legs.forEach((leg, i) => {
    const tip = leg.tip.at;
    const s = tip.x > 0 ? 1 : -1;
    b.part(new THREE.SphereGeometry(0.105, 8, 5), COAT_DARK, {
      at: tip,
      bone: leg.tip,
      scale: [1.15, 0.65, 1.25],
      group: "paws",
      name: `paw${i}`,
    });
    for (let j = -1; j <= 1; j++) {
      const toe = [tip[0] + s * j * 0.045, 0.082, tip[2] + 0.085] as [number, number, number];
      b.part(new THREE.SphereGeometry(0.034, 6, 4), CREAM, {
        at: toe,
        bone: leg.tip,
        scale: [1, 0.6, 1.35],
        group: "paws",
        name: `toe${i}_${j}`,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Eagle head, brow, muzzle, separate lower jaw, hooked beak.
  // ---------------------------------------------------------------------------

  b.part(new THREE.SphereGeometry(0.30, 12, 8), GOLD, {
    bone: head,
    at: [0, 1.51, 0.84],
    scale: [1.0, 1.12, 1.05],
    group: "eagle-head",
    name: "goldenSkull",
  });

  b.part(new THREE.SphereGeometry(0.22, 10, 7), CREAM, {
    bone: head,
    at: [0, 1.44, 1.045],
    scale: [1.0, 0.72, 0.72],
    group: "eagle-head",
    name: "creamFace",
  });

  b.part(new THREE.BoxGeometry(0.34, 0.105, 0.17), COAT_DARK, {
    bone: jaw,
    at: [0, 1.395, 1.10],
    dir: [0, -0.15, 1],
    scale: [1, 1, 1.2],
    group: "eagle-head",
    name: "lowerJaw",
  });

  b.part(new THREE.ConeGeometry(0.14, 0.38, 6), ORANGE, {
    bone: head,
    at: [0, 1.46, 1.27],
    dir: [0, 0, 1],
    rotation: [Math.PI / 2, 0, 0],
    scale: [1, 0.8, 1],
    group: "beak",
    name: "upperBeak",
  });

  b.part(new THREE.ConeGeometry(0.09, 0.25, 6), COAT_DARK, {
    bone: jaw,
    at: [0, 1.405, 1.23],
    dir: [0, -0.18, 1],
    rotation: [Math.PI / 2, 0, 0],
    group: "beak",
    name: "lowerBeak",
  });

  // Dark mouth gap and tongue.
  b.part(new THREE.BoxGeometry(0.23, 0.018, 0.17), INK, {
    bone: jaw,
    at: [0, 1.445, 1.17],
    group: "face-details",
    name: "mouthGap",
  });
  b.part(new THREE.SphereGeometry(0.035, 7, 4), "#d83d55", {
    bone: jaw,
    at: [0, 1.455, 1.235],
    scale: [1.8, 0.4, 2.0],
    group: "face-details",
    name: "tongue",
  });

  // Eyes with raised dark sockets, bright irises and glints.
  for (const s of [1, -1]) {
    const x = s * 0.145;
    b.part(new THREE.SphereGeometry(0.095, 10, 7), INK, {
      bone: head,
      at: [x, 1.56, 1.015],
      scale: [1, 1.08, 0.45],
      group: "face-details",
      name: `eyeSocket${s}`,
    });
    b.part(new THREE.SphereGeometry(0.067, 10, 7), TURQUOISE, {
      bone: head,
      at: [x, 1.56, 1.055],
      scale: [1, 1.15, 0.35],
      group: "face-details",
      name: `iris${s}`,
    });
    b.part(new THREE.SphereGeometry(0.025, 7, 5), INK, {
      bone: head,
      at: [x, 1.56, 1.085],
      scale: [0.7, 1.4, 0.3],
      group: "face-details",
      name: `pupil${s}`,
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), WHITE, {
      bone: head,
      at: [x - s * 0.02, 1.59, 1.10],
      group: "face-details",
      name: `eyeGlint${s}`,
    });
    b.part(new THREE.BoxGeometry(0.17, 0.045, 0.045), PURPLE, {
      bone: head,
      at: [x, 1.655, 1.0],
      rotation: [0, s * 0.16, s * 0.16],
      group: "face-details",
      name: `brow${s}`,
    });
  }

  // Feathered crown: broad carved slabs.
  const crest = [
    [[-0.20, 1.69], [-0.06, 1.94], [0.04, 1.72], [0.17, 1.88], [0.23, 1.66]],
    [[-0.16, 1.66], [-0.18, 1.91], [0.0, 1.78], [0.12, 1.98], [0.19, 1.68]],
  ];
  crest.forEach((outline, i) => {
    b.extrude(outline as any, {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      color: i ? BLUE : PURPLE,
      bone: head,
      group: "crown-feathers",
      name: `crown${i}`,
    });
  });

  // Jagged cheek feathers.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.spike(
        [s * (0.19 + i * 0.025), 1.47 - i * 0.055, 0.98],
        [s * 0.16, -0.05, 0.08],
        0.14,
        0.042,
        { color: i === 1 ? PURPLE : CREAM, bone: head, group: "cheek-feathers" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Large spread wings, with membranes and individually readable primary feathers.
  // ---------------------------------------------------------------------------

  b.sweep(wingL, [0.14, 0.075], {
    color: BLUE,
    sides: 6,
    caps: "round",
    group: "wing-bones",
  });
  b.sweep(wingR, [0.14, 0.075], {
    color: BLUE,
    sides: 6,
    caps: "round",
    group: "wing-bones",
  });

  b.membrane(
    wingL,
    [
      [0.05, 1.22, 0.30],
      [0.30, 1.20, -0.03],
      [0.76, 1.30, -0.10],
      [1.18, 1.58, 0.08],
    ],
    { color: TURQUOISE, thickness: 0.018, rows: 4, cols: 8, scallop: 0.1, group: "wing-membrane" },
  );
  b.membrane(
    wingR,
    [
      [-0.05, 1.22, 0.30],
      [-0.30, 1.20, -0.03],
      [-0.76, 1.30, -0.10],
      [-1.18, 1.58, 0.08],
    ],
    { color: TURQUOISE, thickness: 0.018, rows: 4, cols: 8, scallop: 0.1, group: "wing-membrane" },
  );

  for (const s of [1, -1]) {
    const root = [s * 0.40, 1.42, 0.23] as [number, number, number];
    const tips = [
      [s * 0.76, 1.78, 0.12],
      [s * 0.96, 1.94, 0.08],
      [s * 1.16, 2.02, 0.02],
      [s * 1.34, 1.92, -0.10],
      [s * 1.43, 1.73, -0.18],
    ] as [number, number, number][];
    tips.forEach((tip, i) => {
      b.sweep(
        catmull([root, [tip[0] * 0.75, tip[1] - 0.04, tip[2] + 0.02], tip]),
        [0.055, 0.012],
        {
          color: i % 2 ? GOLD : ORANGE,
          sides: 6,
          caps: { start: "round", end: "point" },
          group: "primary-feathers",
          name: `primary${s}_${i}`,
        },
      );
      b.part(new THREE.SphereGeometry(0.028, 6, 4), PURPLE, {
        at: [s * (0.52 + i * 0.10), 1.48 + i * 0.035, 0.18],
        bone: s > 0 ? wingL.joints[1] : wingR.joints[1],
        group: "wing-spots",
        name: `wingSpot${s}_${i}`,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Painted alebrije ornament: spots, rosettes, stripes, collar and tail charms.
  // ---------------------------------------------------------------------------

  const coatSurface = b.surface(body);
  const spotRng = rng(19);
  const spots = coatSurface.scatter(28, {
    rng: spotRng,
    minDist: 0.105,
    filter: (h: any) => h.n.y > -0.5,
  });
  spots.forEach((h: any, i: number) => {
    b.stick(
      new THREE.CylinderGeometry(0.043 + (i % 3) * 0.008, 0.043 + (i % 3) * 0.008, 0.014, 8),
      i % 4 === 0 ? TURQUOISE : i % 4 === 1 ? GOLD : PURPLE,
      h,
      { embed: 0.35, group: "jaguar-rosettes", name: `rosette${i}` },
    );
    if (i % 3 === 0) {
      for (const a of [0, 90, 180, 270]) {
        const p = h.moved([Math.cos((a * Math.PI) / 180) * 0.065, 0.012, Math.sin((a * Math.PI) / 180) * 0.065]);
        b.stick(new THREE.SphereGeometry(0.012, 6, 4), INK, p, {
          embed: 0.2,
          group: "rosette-centres",
        });
      }
    }
  });

  // Bright bands along the chest and legs.
  b.sweep(
    catmull([
      [0, 1.19, 0.59],
      [0, 1.29, 0.70],
      [0, 1.39, 0.78],
    ]),
    0.235,
    {
      color: GOLD,
      sides: 8,
      caps: "none",
      from: 0.18,
      to: 0.43,
      group: "painted-collar",
    },
  );

  for (const leg of legs) {
    const cuff = leg.at(0.62);
    b.ring(cuff, { count: 10, radius: 0.083, fromDeg: 0, toDeg: 360 }, (item: any) => {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), INK, {
        frame: item,
        group: "leg-ornament",
      });
    });
  }

  // Tail end carved like a multicolour flower.
  const tailTip = tail.tip;
  const flower = b.ring(tailTip, {
    count: 7,
    radius: 0.09,
    fromDeg: 0,
    toDeg: 360,
    tilt: -12,
    role: "fan",
    name: "tailFlower",
  });
  flower.items.forEach((item: any, i: number) => {
    b.spike(item, item, 0.13, 0.035, {
      color: [GOLD, PURPLE, TURQUOISE, ORANGE][i % 4],
      group: "tail-flower",
      name: `tailPetal${i}`,
    });
  });

  // Small carved nose and nostrils.
  b.part(new THREE.SphereGeometry(0.045, 8, 5), INK, {
    bone: head,
    at: [0, 1.50, 1.45],
    scale: [1.35, 0.75, 0.75],
    group: "beak",
    name: "beakNose",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, {
      bone: head,
      at: [s * 0.045, 1.52, 1.47],
      group: "beak",
      name: `nostril${s}`,
    });
  }

  // Ground contact is provided by paws at y≈0.08; nothing hangs below the floor.
  return b.root;
}
