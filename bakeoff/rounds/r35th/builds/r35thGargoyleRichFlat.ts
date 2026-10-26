import * as THREE from "three";
import {
  bezier,
  b,
  catmull,
  countershade,
  createBuilder,
  limb,
  mottle,
  polyline,
  rng,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle perched on a carved cathedral ledge, with raised bat wings, hooked horns, clawed limbs, a snarling jaw, and amber eyes.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = countershade(
    mottle("#555b62", "#7d8388", {
      size: 0.2,
      contrast: 0.38,
      seed: 17,
    }),
    "#33373e",
    { level: -0.16 },
  );
  const STONE_LIGHT = "#8c9091";
  const STONE_HIGHLIGHT = "#b0aea5";
  const STONE_DARK = "#34383e";
  const STONE_DEEP = "#20242a";
  const CARVED_EDGE = "#777c7e";
  const WING_STONE = "#41474e";
  const MEMBRANE = "#292d34";
  const EYE_SOCKET = "#171923";
  const EYE_AMBER = "#e2a64d";
  const EYE_HIGHLIGHT = "#fff0ae";
  const MOSS = "#4d5e4c";
  const MOSS_LIGHT = "#74825e";

  const at = (p: THREE.Vector3 | readonly [number, number, number]) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);

  const stoneBox = (
    size: readonly [number, number, number],
    color: string,
    position: readonly [number, number, number],
    bone?: any,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: position,
      bone,
      flat: true,
    });

  const stoneSphere = (
    radius: number,
    color: string,
    position: THREE.Vector3 | readonly [number, number, number],
    scale: readonly [number, number, number] = [1, 1, 1],
    bone?: any,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at: at(position),
      scale,
      bone,
      flat: true,
    });

  const carvedBlock = (
    size: readonly [number, number, number],
    position: readonly [number, number, number],
    color = STONE,
  ) => stoneBox(size, color, position);

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: the crouching torso, head and jaw.

  const hips = b.joint("hips", {
    at: [0, 1.02, -0.12],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, -0.16],
      [0, 1.14, 0.02],
      [0, 1.3, 0.24],
      [0, 1.45, 0.42],
    ]),
    {
      parent: hips,
      names: ["pelvis", "torso", "chest", "neckBase"],
      role: "spine",
      count: 4,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42, 0.4],
      [0, 1.55, 0.5],
      [0, 1.69, 0.57],
    ]),
    {
      parent: spine.tip,
      names: ["neck1", "neck2", "neckTip"],
      role: "neck",
      count: 3,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.72, 0.62],
    dir: [0, 0.14, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.08, -0.075]),
    aim: head.local([0, 0.35, -0.17]),
    role: "jaw",
    group: "face",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton: tail.

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.2],
      [0, 0.84, -0.48],
      [0, 0.63, -0.78],
      [0, 0.48, -1.05],
      [0, 0.42, -1.28],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      count: 5,
      contact: [0, 0.36, -1.28],
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton: crouched hind legs and lowered arms.

  const legChains: any[] = [];
  const armChains: any[] = [];
  const footTargets: Record<number, THREE.Vector3> = {};
  const handTargets: Record<number, THREE.Vector3> = {};

  for (const s of [1, -1]) {
    const foot = new THREE.Vector3(s * 0.27, 0.39, 0.2);
    const hip = new THREE.Vector3(s * 0.29, 1.0, -0.08);
    const hind = limb(
      hip,
      foot,
      [0.39, 0.34, 0.25],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );

    const leg = b.chain("leg" + (s > 0 ? "L" : "R"), hind, {
      parent: hips,
      names: [
        s > 0 ? "hipL" : "hipR",
        s > 0 ? "kneeL" : "kneeR",
        s > 0 ? "ankleL" : "ankleR",
        s > 0 ? "footL" : "footR",
      ],
      role: "leg",
      contact: [foot.x, 0.36, foot.z],
      count: 4,
    });

    footTargets[s] = foot;
    legChains.push(leg);

    const shoulder = new THREE.Vector3(s * 0.32, 1.35, 0.28);
    const hand = new THREE.Vector3(s * 0.6, 0.52, 0.42);
    const armPoints = limb(
      shoulder,
      hand,
      [0.34, 0.31, 0.24],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );

    const arm = b.chain("arm" + (s > 0 ? "L" : "R"), armPoints, {
      parent: hips,
      names: [
        s > 0 ? "shoulderL" : "shoulderR",
        s > 0 ? "elbowL" : "elbowR",
        s > 0 ? "wristL" : "wristR",
        s > 0 ? "handL" : "handR",
      ],
      role: "arm",
      count: 4,
    });

    handTargets[s] = hand;
    armChains.push(arm);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton: toes and fingers. They are intentionally separated in a neutral, readable rest pose.

  const toeChains: Record<number, any[]> = {};
  const fingerChains: Record<number, any[]> = {};

  for (const s of [1, -1]) {
    toeChains[s] = [];
    const foot = footTargets[s];

    const toeOffsets = [
      [s * 0.12, 0.015, 0.23],
      [s * 0.015, 0.0, 0.29],
      [-s * 0.095, -0.005, 0.22],
    ];

    for (let i = 0; i < toeOffsets.length; i++) {
      const o = toeOffsets[i];
      const base = new THREE.Vector3(foot.x + o[0] * 0.25, 0.39 + o[1], foot.z + 0.02);
      const mid = new THREE.Vector3(foot.x + o[0] * 0.65, 0.375 + o[1], foot.z + o[2] * 0.5);
      const tip = new THREE.Vector3(foot.x + o[0], 0.365 + o[1], foot.z + o[2]);

      const toe = b.chain(
        `toe${s > 0 ? "L" : "R"}${i + 1}`,
        polyline([base, mid, tip]),
        {
          parent: legChains[legChains.length - 2 + (s > 0 ? 1 : 0)]?.tip ?? hips,
          names: [
            `toe${s > 0 ? "L" : "R"}${i + 1}Base`,
            `toe${s > 0 ? "L" : "R"}${i + 1}Mid`,
            `toe${s > 0 ? "L" : "R"}${i + 1}Tip`,
          ],
          role: "digit",
          count: 3,
        },
      );
      toeChains[s].push(toe);
    }

    fingerChains[s] = [];
    const hand = handTargets[s];
    const fingerEnds = [
      [s * 0.18, -0.01, 0.2],
      [s * 0.08, -0.03, 0.27],
      [-s * 0.08, -0.015, 0.22],
    ];

    for (let i = 0; i < fingerEnds.length; i++) {
      const f = fingerEnds[i];
      const base = new THREE.Vector3(hand.x + f[0] * 0.18, hand.y, hand.z);
      const mid = new THREE.Vector3(hand.x + f[0] * 0.62, hand.y - 0.035, hand.z + f[2] * 0.5);
      const tip = new THREE.Vector3(hand.x + f[0], hand.y - 0.065, hand.z + f[2]);

      const finger = b.chain(
        `finger${s > 0 ? "L" : "R"}${i + 1}`,
        polyline([base, mid, tip]),
        {
          parent: armChains[armChains.length - 2 + (s > 0 ? 1 : 0)]?.tip ?? hips,
          names: [
            `finger${s > 0 ? "L" : "R"}${i + 1}Base`,
            `finger${s > 0 ? "L" : "R"}${i + 1}Mid`,
            `finger${s > 0 ? "L" : "R"}${i + 1}Tip`,
          ],
          role: "digit",
          count: 3,
        },
      );
      fingerChains[s].push(finger);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton: raised wings and their long separated wing digits.

  const wingChains: Record<number, any> = {};
  const wingDigits: Record<number, any[]> = {};

  for (const s of [1, -1]) {
    const wingBase = new THREE.Vector3(s * 0.3, 1.31, 0.04);
    const wingPath = catmull([
      wingBase,
      [s * 0.58, 1.57, -0.12],
      [s * 0.87, 1.77, -0.11],
      [s * 1.02, 1.79, 0.02],
    ]);

    const wing = b.chain("wing" + (s > 0 ? "L" : "R"), wingPath, {
      parent: hips,
      names: [
        s > 0 ? "wingLBase" : "wingRBase",
        s > 0 ? "wingLElbow" : "wingRElbow",
        s > 0 ? "wingLWrist" : "wingRWrist",
        s > 0 ? "wingLTip" : "wingRTip",
      ],
      role: "wing",
      count: 4,
    });

    wingChains[s] = wing;
    wingDigits[s] = [];

    const digitPaths = [
      [
        [s * 0.39, 1.42, -0.04],
        [s * 0.64, 1.76, -0.13],
        [s * 0.92, 1.98, 0.02],
      ],
      [
        [s * 0.43, 1.4, -0.07],
        [s * 0.79, 1.76, -0.02],
        [s * 1.14, 2.08, 0.18],
      ],
      [
        [s * 0.48, 1.39, -0.1],
        [s * 0.83, 1.58, -0.3],
        [s * 1.22, 1.82, -0.47],
      ],
      [
        [s * 0.46, 1.38, -0.04],
        [s * 0.68, 1.5, 0.12],
        [s * 0.96, 1.59, 0.3],
      ],
    ];

    for (let i = 0; i < digitPaths.length; i++) {
      const points = digitPaths[i].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const digit = b.chain(
        `wingDigit${s > 0 ? "L" : "R"}${i + 1}`,
        catmull(points),
        {
          parent: wing.joints[0],
          names: [
            `wingDigit${s > 0 ? "L" : "R"}${i + 1}Base`,
            `wingDigit${s > 0 ? "L" : "R"}${i + 1}Mid`,
            `wingDigit${s > 0 ? "L" : "R"}${i + 1}Tip`,
          ],
          role: "digit",
          count: 3,
        },
      );
      wingDigits[s].push(digit);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ledge and its carved architectural silhouette.

  stoneBox([2.65, 0.26, 1.62], "#4a4f55", [0, 0.13, -0.18]);
  stoneBox([2.82, 0.09, 1.76], STONE_LIGHT, [0, 0.305, -0.18]);
  stoneBox([2.62, 0.055, 1.7], "#3b4046", [0, 0.382, -0.18]);

  carvedBlock([0.47, 0.42, 0.54], [-0.82, 0.21, -0.5], "#41464c");
  carvedBlock([0.47, 0.42, 0.54], [0.82, 0.21, -0.5], "#41464c");
  carvedBlock([0.34, 0.29, 0.36], [-1.12, 0.145, 0.34], "#3e4349");
  carvedBlock([0.34, 0.29, 0.36], [1.12, 0.145, 0.34], "#3e4349");

  // Front ledge trim and a pointed gothic arch carved into the vertical face.
  stoneBox([2.73, 0.055, 0.075], STONE_HIGHLIGHT, [0, 0.43, 0.69]);
  stoneBox([2.73, 0.05, 0.08], "#32363c", [0, 0.265, 0.69]);

  b.extrude(
    [
      [-0.35, 0],
      [0.35, 0],
      [0.29, 0.14],
      [0.18, 0.28],
      [0, 0.43],
      [-0.18, 0.28],
      [-0.29, 0.14],
    ],
    {
      at: [0, 0.265, 0.735],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: STONE_DEEP,
      name: "ledgePointedArch",
      group: "ledge-carving",
    },
  );

  b.extrude(
    [
      [-0.19, 0.035],
      [0.19, 0.035],
      [0.14, 0.12],
      [0, 0.29],
      [-0.14, 0.12],
    ],
    {
      at: [0, 0.265, 0.748],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: CARVED_EDGE,
      name: "ledgeArchInner",
      group: "ledge-carving",
    },
  );

  // Moss is restricted to the upper edges of the named ledge.
  stoneBox([0.52, 0.018, 0.11], MOSS, [-0.79, 0.438, 0.39]);
  stoneBox([0.29, 0.018, 0.16], MOSS_LIGHT, [0.92, 0.438, -0.58]);
  stoneBox([0.19, 0.014, 0.12], MOSS, [-1.12, 0.438, -0.45]);

  // Ledge cracks, kept shallow and graphic rather than adding random scenery.
  const ledgeCracks = [
    [
      [-1.05, 0.44, 0.69],
      [-0.92, 0.445, 0.71],
      [-0.87, 0.44, 0.65],
    ],
    [
      [0.57, 0.44, 0.67],
      [0.69, 0.445, 0.71],
      [0.76, 0.44, 0.63],
    ],
    [
      [-0.3, 0.405, -0.92],
      [-0.18, 0.41, -0.99],
      [-0.1, 0.405, -0.91],
    ],
  ];

  for (const crack of ledgeCracks) {
    for (let i = 0; i < crack.length - 1; i++) {
      b.rod(crack[i], crack[i + 1], 0.009, {
        color: STONE_DEEP,
        caps: "flat",
        name: "ledgeCrack",
        group: "ledge-detail",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main carved body.

  const body = b.sweep(
    spine,
    (t) => {
      const width = 0.27 + 0.09 * Math.sin(Math.PI * t);
      const height = 0.28 + 0.045 * Math.sin(Math.PI * t);
      return [width, height];
    },
    {
      color: STONE,
      section: { ngon: 8 },
      caps: "round",
      group: "body",
      name: "facetedTorso",
    },
  );

  const chest = stoneSphere(0.31, STONE, [0, 1.31, 0.27], [1.08, 0.88, 0.95], spine.joints[2]);
  const rump = stoneSphere(0.3, STONE_DARK, [0, 0.99, -0.22], [1.08, 0.8, 0.92], hips);

  // Broad carved belly and sternum plates.
  b.extrude(
    [
      [-0.22, -0.18],
      [0.22, -0.18],
      [0.25, 0.01],
      [0.17, 0.21],
      [0, 0.28],
      [-0.17, 0.21],
      [-0.25, 0.01],
    ],
    {
      at: [0, 1.17, 0.525],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: STONE_LIGHT,
      bone: spine.joints[2],
      name: "carvedSternum",
      group: "body-carving",
    },
  );

  b.extrude(
    [
      [-0.12, -0.06],
      [0.12, -0.06],
      [0.15, 0.06],
      [0, 0.18],
      [-0.15, 0.06],
    ],
    {
      at: [0, 1.2, 0.546],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: STONE_DARK,
      bone: spine.joints[2],
      name: "sternumInset",
      group: "body-carving",
    },
  );

  b.rod(
    spine.at(0.47),
    spine.at(0.76),
    0.018,
    {
      color: STONE_HIGHLIGHT,
      bone: spine.joints[2],
      name: "sternumRidge",
      group: "body-carving",
    },
  );

  // Chiseled chips distributed only over the torso's upward-facing surface.
  const bodySurface = b.surface(body);
  const chips = bodySurface.scatter(18, {
    rng: rng(12),
    minDist: 0.085,
    filter: (h: any) => h.n.y > -0.15 && h.at.z > -0.3,
  });

  for (const chip of chips) {
    b.stick(new THREE.DodecahedronGeometry(0.024, 0), STONE_HIGHLIGHT, chip, {
      embed: 0.55,
      name: "chiselChip",
      group: "body-wear",
    });
  }

  // Neck ridges and a heavy carved collar.
  const neckTube = b.sweep(
    neck,
    (t) => 0.19 - 0.035 * t,
    {
      color: STONE,
      section: { ngon: 8 },
      caps: "round",
      group: "neck",
      name: "neck",
    },
  );

  const collar = b.ring(neck.tip, {
    count: 10,
    radius: 0.19,
    name: "stoneCollar",
    role: "fan",
    group: "neck-detail",
  });

  b.sweep(catmull(collar.items, { closed: true }), 0.026, {
    color: STONE_DEEP,
    caps: "none",
    group: "neck-detail",
    name: "carvedCollarBand",
  });

  for (const ringItem of collar.items) {
    b.stick(new THREE.DodecahedronGeometry(0.032, 0), CARVED_EDGE, ringItem, {
      embed: 0.35,
      name: "collarStud",
      group: "neck-detail",
    });
  }

  // Tail tube, tapered and broken into dorsal stone spines.
  const tailTube = b.sweep(
    tail,
    (t) => 0.13 * (1 - t) + 0.028,
    {
      color: STONE_DARK,
      section: { ngon: 7 },
      caps: { start: "round", end: "point" },
      group: "tail",
      name: "taperedTail",
    },
  );

  b.along(tailTube, 7, (surfacePoint: any) => {
    const size = 0.07 * (1 - surfacePoint.t) + 0.028;
    b.spike(surfacePoint, surfacePoint, size, 0.018, {
      color: CARVED_EDGE,
      group: "tail-detail",
      name: "tailSpine",
    });
  });

  // Tail end has a small hooked barb.
  b.spike(tail.tip, tail.tip, 0.115, 0.026, {
    color: STONE_HIGHLIGHT,
    group: "tail-detail",
    name: "tailBarb",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Legs: thick angular thighs, knees, shins, ankle bands and feet.

  for (let sideIndex = 0; sideIndex < [1, -1].length; sideIndex++) {
    const s = [1, -1][sideIndex];
    const leg = legChains[sideIndex];

    b.sweep(
      leg,
      (t) => {
        if (t < 0.42) return 0.115;
        if (t < 0.78) return 0.09;
        return 0.075;
      },
      {
        color: STONE,
        section: { ngon: 6 },
        caps: "round",
        group: "legs",
        name: `legStone${s > 0 ? "L" : "R"}`,
      },
    );

    stoneSphere(0.115, STONE_LIGHT, leg.joints[1].at, [1.0, 0.8, 0.9], leg.joints[1]);
    stoneSphere(0.09, STONE_DARK, leg.joints[2].at, [0.92, 0.76, 0.9], leg.joints[2]);

    const ankleRing = b.ring(leg.joints[2], {
      count: 8,
      radius: 0.073,
      role: "fan",
      name: `ankleRing${s > 0 ? "L" : "R"}`,
      group: "leg-detail",
    });

    b.sweep(catmull(ankleRing.items, { closed: true }), 0.018, {
      color: STONE_DEEP,
      caps: "none",
      group: "leg-detail",
      name: `ankleBand${s > 0 ? "L" : "R"}`,
    });

    const foot = footTargets[s];
    stoneSphere(0.105, STONE, foot, [1.12, 0.66, 1.0], leg.tip);

    for (const toe of toeChains[s]) {
      b.sweep(toe, [0.043, 0.009], {
        color: STONE_LIGHT,
        section: { ngon: 6 },
        caps: "point",
        group: "claws",
        name: `stoneToe${s > 0 ? "L" : "R"}`,
      });

      b.spike(toe.tip, toe.tip, 0.07, 0.019, {
        color: STONE_HIGHLIGHT,
        group: "claws",
        name: `toeHook${s > 0 ? "L" : "R"}`,
      });
    }

    // Raised facets on each knee make the crouch legible from the front.
    const knee = leg.joints[1];
    b.extrude(
      [
        [-0.085, -0.06],
        [0.085, -0.06],
        [0.07, 0.055],
        [0, 0.095],
        [-0.07, 0.055],
      ],
      {
        at: knee.local([0, 0, 0.102]),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        color: STONE_HIGHLIGHT,
        bone: knee,
        name: `kneePlate${s > 0 ? "L" : "R"}`,
        group: "leg-detail",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Arms and hands, braced toward the ledge.

  for (let sideIndex = 0; sideIndex < [1, -1].length; sideIndex++) {
    const s = [1, -1][sideIndex];
    const arm = armChains[sideIndex];

    b.sweep(
      arm,
      (t) => (t < 0.4 ? 0.09 : t < 0.78 ? 0.067 : 0.052),
      {
        color: STONE,
        section: { ngon: 6 },
        caps: "round",
        group: "arms",
        name: `armStone${s > 0 ? "L" : "R"}`,
      },
    );

    stoneSphere(0.095, STONE_LIGHT, arm.joints[1].at, [0.95, 0.84, 0.9], arm.joints[1]);
    stoneSphere(0.07, STONE_DARK, arm.joints[2].at, [0.92, 0.8, 0.88], arm.joints[2]);
    stoneSphere(0.075, STONE, handTargets[s], [1.0, 0.6, 1.1], arm.tip);

    const elbowPlate = b.ring(arm.joints[1], {
      count: 7,
      radius: 0.077,
      name: `elbowRing${s > 0 ? "L" : "R"}`,
      group: "arm-detail",
    });

    b.sweep(catmull(elbowPlate.items, { closed: true }), 0.015, {
      color: STONE_DEEP,
      caps: "none",
      group: "arm-detail",
      name: `elbowBand${s > 0 ? "L" : "R"}`,
    });

    for (const finger of fingerChains[s]) {
      b.sweep(finger, [0.028, 0.006], {
        color: STONE_LIGHT,
        section: { ngon: 6 },
        caps: "point",
        group: "claws",
        name: `stoneFinger${s > 0 ? "L" : "R"}`,
      });

      b.spike(finger.tip, finger.tip, 0.06, 0.013, {
        color: STONE_HIGHLIGHT,
        group: "claws",
        name: `fingerHook${s > 0 ? "L" : "R"}`,
      });
    }

    // Small carved knuckle stones sit just above each hand.
    for (const finger of fingerChains[s]) {
      b.part(new THREE.DodecahedronGeometry(0.026, 0), CARVED_EDGE, {
        at: finger.joints[1].at,
        bone: finger.joints[1],
        flat: true,
        name: `knuckle${s > 0 ? "L" : "R"}`,
        group: "claws",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: heavy stone fingers with dark inset membranes.

  const wingMembranePaths: Record<number, any[]> = {};

  for (const s of [1, -1]) {
    const wing = wingChains[s];
    const digits = wingDigits[s];
    wingMembranePaths[s] = digits;

    b.sweep(wing, (t) => 0.09 - 0.055 * t, {
      color: WING_STONE,
      section: { ngon: 6 },
      caps: "round",
      group: "wings",
      name: `wingBone${s > 0 ? "L" : "R"}`,
    });

    // A raised shoulder socket anchors the wing to the torso.
    stoneSphere(0.14, STONE_DARK, wing.joints[0].at, [1.12, 0.82, 1.0], wing.joints[0]);

    for (let i = 0; i < digits.length; i++) {
      const digit = digits[i];

      b.sweep(digit, [0.035 - i * 0.004, 0.009], {
        color: STONE_LIGHT,
        section: { ngon: 6 },
        caps: "point",
        group: "wings",
        name: `wingFinger${s > 0 ? "L" : "R"}${i + 1}`,
      });

      b.rod(digit.at(0), digit.at(0.82), 0.012, {
        color: CARVED_EDGE,
        bone: digit.joints[0],
        caps: "flat",
        name: `wingRib${s > 0 ? "L" : "R"}${i + 1}`,
        group: "wing-carving",
      });

      b.spike(digit.tip, digit.tip, 0.075 - i * 0.008, 0.014, {
        color: STONE_HIGHLIGHT,
        group: "wing-carving",
        name: `wingTipClaw${s > 0 ? "L" : "R"}${i + 1}`,
      });
    }

    // Broad bat-like webbing, scalloped between the long fingers.
    b.membrane(wing, digits[0], {
      color: MEMBRANE,
      thickness: 0.014,
      rows: 3,
      scallop: 0.1,
      group: "wing-membrane",
      name: `wingWeb${s > 0 ? "L" : "R"}A`,
    });

    b.membrane(digits[0], digits[1], {
      color: MEMBRANE,
      thickness: 0.012,
      rows: 3,
      scallop: 0.16,
      group: "wing-membrane",
      name: `wingWeb${s > 0 ? "L" : "R"}B`,
    });

    b.membrane(digits[1], digits[2], {
      color: MEMBRANE,
      thickness: 0.012,
      rows: 3,
      scallop: 0.18,
      group: "wing-membrane",
      name: `wingWeb${s > 0 ? "L" : "R"}C`,
    });

    b.membrane(digits[2], digits[3], {
      color: MEMBRANE,
      thickness: 0.01,
      rows: 3,
      scallop: 0.2,
      group: "wing-membrane",
      name: `wingWeb${s > 0 ? "L" : "R"}D`,
    });

    // Three broad raised ribs read as carved reinforcement along each membrane.
    for (let i = 0; i < 3; i++) {
      const ribStart = digits[i].at(0.16);
      const ribEnd = digits[i].at(0.9);
      b.rod(ribStart, ribEnd, 0.009, {
        color: STONE_DARK,
        bone: digits[i].joints[0],
        caps: "flat",
        name: `wingMembraneRib${s > 0 ? "L" : "R"}${i}`,
        group: "wing-carving",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head and face: a large carved skull, brows, muzzle, open jaw, tusks and ears.

  const skull = stoneSphere(0.31, STONE, head.at, [1.0, 0.9, 0.98], head);

  stoneSphere(
    0.22,
    STONE_LIGHT,
    head.local([0, 0.225, -0.045]),
    [1.08, 0.8, 0.72],
    head,
  );

  // Heavy brow shelf, deliberately larger than the eye sockets.
  for (const s of [1, -1]) {
    b.rod(
      head.local([s * 0.21, 0.13, 0.145]),
      head.local([s * 0.055, 0.205, 0.16]),
      0.027,
      {
        color: STONE_DARK,
        bone: head,
        caps: "round",
        name: `browRidge${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // Eye sockets are placed by a live surface query, so they remain seated on the skull.
  const skullSurface = b.surface(skull);
  const eyeParts: any[] = [];

  for (const s of [1, -1]) {
    const eyePoint = head.local([s * 0.135, 0.18, 0.07]);
    const eyeHit = skullSurface.nearest(eyePoint);

    b.stick(new THREE.SphereGeometry(0.082, 10, 6), EYE_SOCKET, eyeHit, {
      embed: 0.62,
      name: `deepEyeSocket${s > 0 ? "L" : "R"}`,
      group: "face",
    });

    const iris = b.stick(
      new THREE.SphereGeometry(0.048, 9, 6),
      EYE_AMBER,
      eyeHit.moved([0, 0.026, 0]),
      {
        embed: 0.42,
        name: `amberEye${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
    eyeParts.push(iris);

    b.stick(
      new THREE.SphereGeometry(0.018, 7, 5),
      EYE_HIGHLIGHT,
      eyeHit.moved([0.012 * s, 0.052, 0.018]),
      {
        embed: 0.35,
        name: `eyeGlint${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );

    // Lower eye wedge, like a carved lid or tear channel.
    b.rod(
      head.local([s * 0.19, 0.19, 0.015]),
      head.local([s * 0.06, 0.245, -0.035]),
      0.012,
      {
        color: STONE_DEEP,
        bone: head,
        caps: "round",
        name: `lowerLid${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  for (const eye of eyeParts) glow(eye, 1.35);

  // Long muzzle and a broad nose block.
  stoneSphere(0.15, STONE_LIGHT, head.local([0, 0.3, -0.035]), [1.18, 0.72, 0.72], head);
  b.part(new THREE.DodecahedronGeometry(0.078, 0), STONE_DEEP, {
    at: head.local([0, 0.405, -0.015]),
    bone: head,
    scale: [1.2, 0.78, 0.9],
    flat: true,
    name: "carvedNose",
    group: "face",
  });

  // Separate upper and lower jaw. The lower jaw is attached to its hinge bone and posed open below.
  b.part(new THREE.BoxGeometry(0.34, 0.13, 0.28), STONE_LIGHT, {
    at: jaw.local([0, 0.12, 0.005]),
    bone: jaw,
    scale: [1, 0.82, 0.88],
    flat: true,
    name: "lowerJaw",
    group: "jaw",
  });

  b.part(new THREE.BoxGeometry(0.3, 0.06, 0.25), STONE_DARK, {
    at: jaw.local([0, 0.19, 0.035]),
    bone: jaw,
    scale: [1, 0.72, 0.8],
    flat: true,
    name: "jawInterior",
    group: "jaw",
  });

  b.rod(
    head.local([-0.14, 0.33, -0.105]),
    head.local([0.14, 0.33, -0.105]),
    0.012,
    {
      color: STONE_DEEP,
      bone: head,
      caps: "round",
      name: "upperMouthCrease",
      group: "jaw",
    },
  );

  b.rod(
    jaw.local([-0.13, 0.225, 0.02]),
    jaw.local([0.13, 0.225, 0.02]),
    0.009,
    {
      color: STONE_DEEP,
      bone: jaw,
      caps: "round",
      name: "lowerMouthCrease",
      group: "jaw",
    },
  );

  for (const s of [1, -1]) {
    b.spike(jaw.local([s * 0.11, 0.205, -0.06]), [0, -1, 0], 0.13, 0.029, {
      color: STONE_HIGHLIGHT,
      bone: jaw,
      group: "fangs",
      name: `lowerFang${s > 0 ? "L" : "R"}`,
    });
  }

  // Tall pointed ears, each made from a primary stone silhouette and a dark inset.
  const earOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.12, 0.015, "sharp"],
    [0.18, 0.23, "sharp"],
    [0.065, 0.39, "sharp"],
    [-0.025, 0.19, "sharp"],
  ];

  const earInset: [number, number, "sharp"][] = [
    [0.02, 0.025, "sharp"],
    [0.09, 0.04, "sharp"],
    [0.125, 0.2, "sharp"],
    [0.06, 0.305, "sharp"],
    [0.01, 0.17, "sharp"],
  ];

  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: head.local([s * 0.2, 0.02, 0.08]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.006,
      color: STONE,
      bone: head,
      name: `pointedEar${s > 0 ? "L" : "R"}`,
      group: "face",
    });

    b.extrude(earInset, {
      at: head.local([s * 0.202, 0.025, 0.082]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: STONE_DEEP,
      bone: head,
      name: `earInset${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // Curved horns rise from the brow and sweep backward like cathedral finials.
  for (const s of [1, -1]) {
    const hornPath = bezier(
      head.local([s * 0.17, 0.035, 0.17]),
      head.local([s * 0.23, -0.02, 0.3]),
      head.local([s * 0.24, -0.18, 0.45]),
      head.local([s * 0.12, -0.34, 0.51]),
    );

    const horn = b.sweep(hornPath, [0.068, 0.012], {
      color: STONE_DARK,
      bone: head,
      section: { ngon: 7 },
      caps: { start: "round", end: "point" },
      group: "horns",
      name: `curvedHorn${s > 0 ? "L" : "R"}`,
    });

    b.along(horn, 5, (p: any) => {
      b.spike(p, p, 0.035, 0.014, {
        color: CARVED_EDGE,
        bone: head,
        group: "horn-detail",
        name: `hornRidge${s > 0 ? "L" : "R"}`,
      });
    });
  }

  // Forehead crest, a small gothic blade between the horns.
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.085, 0.19],
      [0, 0.32, "sharp"],
      [-0.085, 0.19],
    ],
    {
      at: head.local([0, -0.01, 0.16]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.004,
      color: STONE_HIGHLIGHT,
      bone: head,
      name: "foreheadCrest",
      group: "face",
    },
  );

  // A few narrow facial chisels catch the light around the muzzle.
  b.rod(
    head.local([-0.18, 0.285, 0.065]),
    head.local([-0.08, 0.365, 0.055]),
    0.009,
    {
      color: CARVED_EDGE,
      bone: head,
      caps: "flat",
      name: "muzzleChiselL",
      group: "face-carving",
    },
  );
  b.rod(
    head.local([0.18, 0.285, 0.065]),
    head.local([0.08, 0.365, 0.055]),
    0.009,
    {
      color: CARVED_EDGE,
      bone: head,
      caps: "flat",
      name: "muzzleChiselR",
      group: "face-carving",
    },
  );

  // Jaw opens only after all jaw geometry has been attached.
  b.pose(jaw, { axis: [1, 0, 0], deg: -15 });

  // ---------------------------------------------------------------------------------------------------------------
  // Final architectural and stone-carving accents on the body.

  for (const s of [1, -1]) {
    // Shoulder medallion.
    b.part(new THREE.CylinderGeometry(0.095, 0.11, 0.025, 8), STONE_HIGHLIGHT, {
      at: [s * 0.31, 1.34, 0.37],
      dir: [0, 0, 1],
      axis: "y",
      bone: spine.joints[2],
      flat: true,
      name: `shoulderRosette${s > 0 ? "L" : "R"}`,
      group: "body-carving",
    });

    // Side ribs: three stepped stone bars emphasize the hunched ribcage.
    for (let i = 0; i < 3; i++) {
      b.rod(
        [s * (0.22 + i * 0.018), 1.15 + i * 0.07, 0.38 - i * 0.035],
        [s * (0.36 + i * 0.016), 1.18 + i * 0.07, 0.33 - i * 0.035],
        0.013,
        {
          color: STONE_DARK,
          bone: spine.joints[1],
          caps: "flat",
          name: `ribChisel${s > 0 ? "L" : "R"}${i}`,
          group: "body-carving",
        },
      );
    }
  }

  // Small upward-facing stone facets on the ledge-facing hands and feet.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.13, 0.025, 0.08), STONE_HIGHLIGHT, {
      at: [s * 0.6, 0.53, 0.43],
      bone: armChains[s > 0 ? 0 : 1].tip,
      flat: true,
      name: `handTopFacet${s > 0 ? "L" : "R"}`,
      group: "claws",
    });

    b.part(new THREE.BoxGeometry(0.2, 0.022, 0.1), STONE_HIGHLIGHT, {
      at: [s * 0.27, 0.405, 0.22],
      bone: legChains[s > 0 ? 0 : 1].tip,
      flat: true,
      name: `footTopFacet${s > 0 ? "L" : "R"}`,
      group: "claws",
    });
  }

  // A handful of large, deliberate stone scars on the ledge and rump give the sculpture age.
  const scars = [
    [[-0.31, 1.01, -0.41], [-0.21, 1.045, -0.46]],
    [[0.27, 1.08, -0.39], [0.36, 1.11, -0.44]],
    [[-0.42, 0.92, -0.33], [-0.35, 0.91, -0.48]],
    [[0.15, 1.42, 0.49], [0.22, 1.48, 0.47]],
  ];

  for (const scar of scars) {
    b.rod(scar[0], scar[1], 0.011, {
      color: STONE_DEEP,
      bone: hips,
      caps: "flat",
      name: "weatheredStoneScar",
      group: "body-wear",
    });
  }

  return b.root;
}
