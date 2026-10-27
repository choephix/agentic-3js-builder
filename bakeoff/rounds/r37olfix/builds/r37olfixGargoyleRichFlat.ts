import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  line,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "cathedral gargoyle",
  description:
    "A crouching gothic stone gargoyle carved from dark weathered stone, perched on a cathedral ledge with spread bat wings, horns, fangs, claws, and a long curling tail.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = "#4a4b50";
  const STONE_LIGHT = "#707177";
  const STONE_DARK = "#292a30";
  const STONE_MID = "#5b5c62";
  const EDGE = "#85868a";
  const MOSS = "#465847";
  const EYE = "#d49a42";
  const EYE_DARK = "#241916";
  const MOUTH = "#17171b";
  const TOOTH = "#b5a98d";
  const IRON = "#25262b";

  // ---------------------------------------------------------------------------
  // Skeleton first: a compact crouching gargoyle, facing +Z.
  // ---------------------------------------------------------------------------

  const pelvis = b.joint("pelvis", {
    at: [0, 1.03, -0.02],
    dir: [0, 0.18, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, -0.06],
      [0, 1.18, 0.02],
      [0, 1.38, 0.08],
      [0, 1.57, 0.15],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.52, 0.14],
      [0, 1.67, 0.22],
      [0, 1.80, 0.31],
    ]),
    { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.82, 0.32],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.73, 0.47],
    dir: [0, -0.16, 0.98],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.04, -0.16],
      [0, 0.91, -0.42],
      [0, 0.79, -0.76],
      [0.10, 0.76, -1.08],
      [0.30, 0.88, -1.28],
      [0.40, 1.08, -1.23],
    ]),
    {
      parent: pelvis,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const leftHind = limb(
    [0.22, 1.02, -0.02],
    [0.48, 0.40, 0.31],
    [0.34, 0.34, 0.25],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
    { sole: [0, 0, 1] },
  );
  const rightHind = limb(
    [-0.22, 1.02, -0.02],
    [-0.48, 0.40, 0.31],
    [0.34, 0.34, 0.25],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
    { sole: [0, 0, 1] },
  );

  const legL = b.chain("legL", leftHind, {
    parent: pelvis,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.48, 0.16, 0.31],
  });
  const legR = b.chain("legR", rightHind, {
    parent: pelvis,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.48, 0.16, 0.31],
  });

  const leftArm = limb(
    [0.38, 1.48, 0.12],
    [0.73, 0.92, 0.47],
    [0.29, 0.34, 0.25],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );
  const rightArm = limb(
    [-0.38, 1.48, 0.12],
    [-0.73, 0.92, 0.47],
    [0.29, 0.34, 0.25],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );

  const armL = b.chain("armL", leftArm, {
    parent: spine.joints[1],
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", rightArm, {
    parent: spine.joints[1],
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.34, 1.60, 0.03],
      [0.76, 1.92, -0.05],
      [1.15, 2.17, -0.13],
      [1.47, 1.89, -0.25],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingRootL", "wingMidL", "wingTipL"],
      role: "wing",
    },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.34, 1.60, 0.03],
      [-0.76, 1.92, -0.05],
      [-1.15, 2.17, -0.13],
      [-1.47, 1.89, -0.25],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingRootR", "wingMidR", "wingTipR"],
      role: "wing",
    },
  );

  // ---------------------------------------------------------------------------
  // Perch / architectural ledge.
  // ---------------------------------------------------------------------------

  b.part(
    new THREE.BoxGeometry(2.55, 0.22, 1.12),
    STONE_DARK,
    { at: [0, 0.11, 0.08], name: "ledge.block", group: "architecture" },
  );
  b.part(
    new THREE.BoxGeometry(2.25, 0.12, 1.30),
    STONE_MID,
    { at: [0, 0.275, 0.04], name: "ledge.cap", group: "architecture" },
  );
  b.part(
    new THREE.BoxGeometry(2.72, 0.11, 0.22),
    EDGE,
    { at: [0, 0.38, 0.57], name: "ledge.front-lip", group: "architecture" },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.20, 0.34, 0.78),
      STONE,
      { at: [s * 1.05, 0.52, 0.00], name: `ledge.bracket${s}`, group: "architecture" },
    );
    b.part(
      new THREE.ConeGeometry(0.13, 0.30, 6),
      STONE_DARK,
      {
        at: [s * 1.05, 0.34, 0.40],
        dir: [0, 1, 0],
        name: `ledge.carved-corb${s}`,
        group: "architecture",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Main stone masses.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.27 - t * 0.055, {
    color: STONE,
    sides: 8,
    section: "box",
    name: "torso",
    group: "body",
  });

  b.sweep(neck, [0.20, 0.25], {
    color: STONE_MID,
    sides: 8,
    section: "box",
    name: "neck",
    group: "body",
  });

  b.part(
    new THREE.SphereGeometry(0.34, 10, 7),
    STONE_MID,
    { bone: head, at: [0, 1.84, 0.36], scale: [1.05, 0.92, 0.92], name: "skull", group: "head" },
  );

  b.sweep(tail, (t) => 0.16 * (1 - t) + 0.035, {
    color: STONE_DARK,
    sides: 7,
    name: "tail",
    group: "body",
  });

  b.sweep(legL, (t) => 0.14 - t * 0.055, {
    color: STONE,
    sides: 7,
    section: "box",
    name: "hind-leg-L",
    group: "limbs",
  });
  b.sweep(legR, (t) => 0.14 - t * 0.055, {
    color: STONE,
    sides: 7,
    section: "box",
    name: "hind-leg-R",
    group: "limbs",
  });
  b.sweep(armL, (t) => 0.105 - t * 0.04, {
    color: STONE_MID,
    sides: 7,
    name: "forearm-L",
    group: "limbs",
  });
  b.sweep(armR, (t) => 0.105 - t * 0.04, {
    color: STONE_MID,
    sides: 7,
    name: "forearm-R",
    group: "limbs",
  });

  // Broad palms and heavy crouching feet.
  for (const s of [-1, 1]) {
    const hand = (s > 0 ? armL.tip : armR.tip)!;
    const foot = (s > 0 ? legL.tip : legR.tip)!;

    b.part(
      new THREE.SphereGeometry(0.16, 8, 5),
      STONE_LIGHT,
      { bone: hand, at: hand.at, scale: [1.25, 0.65, 1.25], name: `palm${s}`, group: "limbs" },
    );
    b.part(
      new THREE.BoxGeometry(0.34, 0.19, 0.46),
      STONE_DARK,
      { bone: foot, at: foot.at, name: `foot${s}`, group: "limbs" },
    );

    // Three squared claw toes on each planted foot.
    for (let i = -1; i <= 1; i++) {
      const x = foot.at.x + i * 0.105;
      b.spike(
        [x, 0.43, 0.49],
        [0, -0.03, 1],
        0.16,
        0.045,
        { color: EDGE, bone: foot, name: `toe${s}_${i}`, group: "claws" },
      );
    }

    // Fingers hanging over the front of the ledge.
    for (let i = -1; i <= 1; i++) {
      const x = hand.at.x + i * 0.075;
      b.spike(
        [x, 0.90, 0.58],
        [0, -0.35, 0.94],
        0.16,
        0.027,
        { color: EDGE, bone: hand, name: `finger${s}_${i}`, group: "claws" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Wings: articulated stone spars and thin carved membranes.
  // ---------------------------------------------------------------------------

  b.sweep(wingL, [0.11, 0.07], {
    color: STONE_DARK,
    sides: 6,
    name: "wing-spar-L",
    group: "wings",
  });
  b.sweep(wingR, [0.11, 0.07], {
    color: STONE_DARK,
    sides: 6,
    name: "wing-spar-R",
    group: "wings",
  });

  const wingEdgeL = catmull([
    [0.34, 1.56, 0.00],
    [0.68, 1.80, -0.03],
    [1.10, 1.98, -0.12],
    [1.47, 1.89, -0.25],
  ]);
  const wingEdgeR = catmull([
    [-0.34, 1.56, 0.00],
    [-0.68, 1.80, -0.03],
    [-1.10, 1.98, -0.12],
    [-1.47, 1.89, -0.25],
  ]);

  b.membrane(wingL, wingEdgeL, {
    color: STONE_MID,
    thickness: 0.025,
    rows: 4,
    cols: 8,
    scallop: 0.12,
    name: "wing-membrane-L",
    group: "wings",
  });
  b.membrane(wingR, wingEdgeR, {
    color: STONE_MID,
    thickness: 0.025,
    rows: 4,
    cols: 8,
    scallop: 0.12,
    name: "wing-membrane-R",
    group: "wings",
  });

  // Raised ribs over the wing membranes.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const root = [s * (0.38 + i * 0.055), 1.59 + i * 0.03, -0.01 - i * 0.025] as [number, number, number];
      const tip = [s * (0.66 + i * 0.25), 1.82 + i * 0.055, -0.05 - i * 0.07] as [number, number, number];
      b.rod(root, tip, 0.018, {
        color: EDGE,
        name: `wing-rib-${s}-${i}`,
        group: "wings",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Face: brow, muzzle, open jaw, fangs, and glowing-looking amber eyes.
  // ---------------------------------------------------------------------------

  b.part(
    new THREE.BoxGeometry(0.48, 0.17, 0.26),
    STONE_DARK,
    { bone: head, at: [0, 1.91, 0.59], rotation: [0.10, 0, 0], name: "brow-slab", group: "face" },
  );

  b.part(
    new THREE.SphereGeometry(0.22, 8, 5),
    STONE_LIGHT,
    { bone: head, at: [0, 1.78, 0.59], scale: [1.15, 0.68, 0.92], name: "muzzle", group: "face" },
  );

  b.part(
    new THREE.BoxGeometry(0.30, 0.075, 0.18),
    MOUTH,
    { bone: jaw, at: [0, 1.68, 0.64], name: "open-mouth", group: "face" },
  );

  b.part(
    new THREE.BoxGeometry(0.22, 0.055, 0.14),
    STONE_LIGHT,
    { bone: jaw, at: [0, 1.735, 0.64], name: "lower-lip", group: "face" },
  );

  for (const s of [-1, 1]) {
    const eyeAt = [s * 0.145, 1.91, 0.625] as [number, number, number];
    b.part(
      new THREE.SphereGeometry(0.058, 8, 5),
      EYE,
      { bone: head, at: eyeAt, scale: [1.0, 0.82, 0.42], name: `eye${s}`, group: "face" },
    );
    b.part(
      new THREE.SphereGeometry(0.022, 6, 4),
      EYE_DARK,
      { bone: head, at: [s * 0.145, 1.91, 0.655], name: `pupil${s}`, group: "face" },
    );
    b.spike(
      [s * 0.145, 1.96, 0.655],
      [0, -0.10, 0.99],
      0.13,
      0.026,
      { color: STONE_DARK, bone: head, name: `brow-horn${s}`, group: "face" },
    );

    // Upper fangs point into the open mouth.
    b.spike(
      [s * 0.105, 1.755, 0.70],
      [0, -1, 0],
      0.13,
      0.027,
      { color: TOOTH, bone: head, name: `fang${s}`, group: "teeth" },
    );
  }

  b.part(
    new THREE.ConeGeometry(0.075, 0.12, 6),
    EYE_DARK,
    { bone: head, at: [0, 1.80, 0.72], dir: [0, 0, 1], name: "nose", group: "face" },
  );

  // ---------------------------------------------------------------------------
  // Ears and horns, each made from angular slabs and stone spikes.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.22, 0.03],
        [0.31, 0.23],
        [0.11, 0.17],
      ],
      {
        at: [s * 0.25, 1.96, 0.28],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.055,
        bevel: 0.012,
        color: STONE_DARK,
        bone: head,
        name: `ear-${s}`,
        group: "head",
      },
    );

    const hornPath = catmull([
      [s * 0.19, 2.02, 0.25],
      [s * 0.30, 2.19, 0.19],
      [s * 0.39, 2.33, 0.12],
      [s * 0.35, 2.43, 0.06],
    ]);
    b.sweep(hornPath, [0.075, 0.008], {
      color: STONE_LIGHT,
      sides: 6,
      caps: { start: "round", end: "point" },
      bone: head,
      name: `horn-${s}`,
      group: "head",
    });

    // Horn bands make the silhouette read as carved stone rather than rubber.
    for (let i = 1; i <= 2; i++) {
      const p = hornPath.at(i / 3);
      b.ring(line(p, hornPath.at(Math.min(1, i / 3 + 0.02))), {
        count: 6,
        radius: 0.065 - i * 0.012,
        fromDeg: 0,
        toDeg: 360,
        name: `horn-ring-${s}-${i}`,
        group: "head",
      }, (r) =>
        b.part(
          new THREE.CylinderGeometry(0.010, 0.010, 0.032, 6),
          EDGE,
          { frame: r, name: `horn-rivet-${s}-${i}`, group: "head" },
        ),
      );
    }
  }

  // A central brow crest / tiny gothic crown.
  b.extrude(
    [
      [0, 0],
      [0.10, 0.02],
      [0.075, 0.25],
      [0, 0.34],
      [-0.075, 0.25],
      [-0.10, 0.02],
    ],
    {
      at: [0, 2.02, 0.29],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: STONE_DARK,
      bone: head,
      name: "brow-crest",
      group: "head",
    },
  );

  // ---------------------------------------------------------------------------
  // Carved seams, masonry accents, moss, and tail barb.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < 5; i++) {
    const t = (i + 1) / 6;
    const p = spine.at(t).at;
    b.part(
      new THREE.BoxGeometry(0.40 - t * 0.10, 0.018, 0.025),
      STONE_LIGHT,
      { at: [p.x, p.y + 0.20, p.z + 0.02], name: `spine-ridge-${i}`, group: "carving" },
    );
  }

  // Chest sigil: a dark pointed shield with a raised stone cross.
  b.extrude(
    [
      [0, 0],
      [0.18, 0.02],
      [0.15, -0.23],
      [0, -0.34],
      [-0.15, -0.23],
      [-0.18, 0.02],
    ],
    {
      at: [0, 1.42, 0.285],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.025,
      bevel: 0.006,
      color: STONE_DARK,
      bone: spine.joints[1],
      name: "chest-shield",
      group: "carving",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.035, 0.20, 0.035),
    EDGE,
    { at: [0, 1.42, 0.315], name: "shield-cross-v", group: "carving" },
  );
  b.part(
    new THREE.BoxGeometry(0.17, 0.035, 0.035),
    EDGE,
    { at: [0, 1.45, 0.315], name: "shield-cross-h", group: "carving" },
  );

  // Moss sits on the upper ledge and selected upward shoulders.
  const mossSpots = [
    [0.55, 0.405, 0.48],
    [0.78, 0.405, 0.45],
    [-0.62, 0.405, 0.50],
    [-0.80, 0.405, 0.46],
    [0.33, 1.70, 0.21],
    [-0.30, 1.71, 0.21],
  ];
  for (let i = 0; i < mossSpots.length; i++) {
    b.part(
      new THREE.SphereGeometry(i < 4 ? 0.075 : 0.045, 6, 4),
      MOSS,
      {
        at: mossSpots[i] as [number, number, number],
        scale: [1.5, 0.35, 0.8],
        name: `moss-${i}`,
        group: "weathering",
      },
    );
  }

  // Tail terminal barb.
  b.spike(tail.at(1), [0, 0.45, -0.2], 0.23, 0.09, {
    color: STONE_LIGHT,
    bone: tail.tip!,
    name: "tail-barb",
    group: "tail",
  });

  // Small carved studs along the ledge face.
  for (const x of [-0.92, -0.46, 0, 0.46, 0.92]) {
    b.part(
      new THREE.SphereGeometry(0.035, 6, 4),
      IRON,
      { at: [x, 0.39, 0.695], name: `ledge-stud-${x}`, group: "architecture" },
    );
  }

  return b.root;
}
