import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  paint,
  mottle,
  countershade,
  stripes,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouched gothic cathedral gargoyle carved from weathered stone, perched on a heavy ledge with spread bat wings, horns, fangs, claws, tail spines, and glowing amber eyes.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = countershade(
    mottle("#5b5b61", "#292b32", { size: 0.18, contrast: 1.5, seed: 17 }),
    "#24262c",
    { level: -0.15, soft: 0.3 },
  );
  const DARK_STONE = mottle("#34363e", "#17191f", {
    size: 0.11,
    contrast: 1.4,
    seed: 29,
  });
  const PALE_STONE = countershade("#8b8b8b", "#3f4148", {
    level: 0.05,
    soft: 0.35,
  });
  const EDGE_STONE = mottle("#77777a", "#35363b", {
    size: 0.08,
    contrast: 1.3,
    seed: 42,
  });
  const INNER_WING = mottle("#3a3038", "#171820", {
    size: 0.12,
    contrast: 1.5,
    seed: 8,
  });
  const CLAW = countershade("#96928c", "#3c3a3c", {
    level: 0.1,
    soft: 0.28,
  });
  const IRON = "#16151b";
  const EYE_GOLD = "#ffbf39";
  const EYE_TEX = svg(
    `<svg viewBox="0 0 128 72" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 36 Q31 4 64 14 Q97 4 124 36 Q97 68 64 58 Q31 68 4 36Z"
        fill="#20151d" stroke="#09070c" stroke-width="7"/>
      <path d="M18 36 Q39 14 64 18 Q89 14 110 36 Q89 58 64 54 Q39 58 18 36Z"
        fill="#c66e24"/>
      <ellipse cx="64" cy="37" rx="12" ry="23" fill="#08070b"/>
      <path d="M64 17 Q78 23 82 37 Q78 31 64 29Z" fill="#ffd96a"/>
      <circle cx="58" cy="25" r="5" fill="#fff4b0"/>
      <path d="M11 29 Q25 8 44 7" fill="none" stroke="#09070c" stroke-width="6"/>
      <path d="M117 29 Q103 8 84 7" fill="none" stroke="#09070c" stroke-width="6"/>
    </svg>`,
    { size: 256 },
  );
  const RUNE_TEX = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 5 L39 25 L58 32 L39 39 L32 59 L25 39 L6 32 L25 25Z"
        fill="none" stroke="#d2b777" stroke-width="4"/>
      <path d="M32 15 L35 29 L49 32 L35 35 L32 49 L29 35 L15 32 L29 29Z"
        fill="#7b5c2b"/>
    </svg>`,
    { size: 128 },
  );

  const ledge = b.part(
    new THREE.BoxGeometry(1.72, 0.22, 0.82, 1, 1, 1),
    EDGE_STONE,
    { at: [0, 0.11, -0.08], name: "carved_ledge", group: "scenery" },
  );
  b.part(
    new THREE.BoxGeometry(1.58, 0.12, 0.7),
    DARK_STONE,
    { at: [0, 0.27, -0.06], name: "ledge_shadow", group: "scenery" },
  );
  const ledgeFront = b.part(
    new THREE.BoxGeometry(1.52, 0.24, 0.07),
    PALE_STONE,
    { at: [0, 0.17, 0.34], name: "ledge_front_band", group: "scenery" },
  );
  for (const x of [-0.62, -0.3, 0, 0.3, 0.62]) {
    b.part(
      new THREE.BoxGeometry(0.035, 0.18, 0.075),
      DARK_STONE,
      { at: [x, 0.17, 0.385], name: "ledge_groove", group: "scenery" },
    );
  }
  b.part(
    new THREE.BoxGeometry(1.82, 0.07, 0.09),
    PALE_STONE,
    { at: [0, 0.29, 0.28], name: "ledge_rim", group: "scenery" },
  );

  // Skeleton first: the heavy, folded crouching spine.
  const hips = b.joint("hips", {
    at: [0, 0.86, -0.02],
    dir: [0, 0.35, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, -0.04],
      [0, 1.04, 0.0],
      [0, 1.25, 0.08],
      [0, 1.4, 0.2],
    ]),
    {
      parent: hips,
      names: ["pelvis", "back", "chest", "shoulder"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.4, 0.2],
      [0, 1.49, 0.36],
      [0, 1.57, 0.48],
    ]),
    {
      parent: spine.tip,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.57, 0.48],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.51, 0.66],
    dir: [0, -0.16, 0.95],
    role: "jaw",
    group: "head",
  });

  const legLPoints = limb(
    [0.23, 0.88, -0.02],
    [0.38, 0.32, 0.27],
    [0.34, 0.34, 0.25],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
    { sole: [0, 0, 1] },
  );
  const legRPoints = limb(
    [-0.23, 0.88, -0.02],
    [-0.38, 0.32, 0.27],
    [0.34, 0.34, 0.25],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
    { sole: [0, 0, 1] },
  );
  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.38, 0, 0.27],
  });
  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.38, 0, 0.27],
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.29, 1.3, 0.2],
      [0.51, 1.18, 0.25],
      [0.63, 0.92, 0.32],
      [0.67, 0.62, 0.37],
    ]),
    {
      parent: spine.tip,
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
    },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.29, 1.3, 0.2],
      [-0.51, 1.18, 0.25],
      [-0.63, 0.92, 0.32],
      [-0.67, 0.62, 0.37],
    ]),
    {
      parent: spine.tip,
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
    },
  );

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.35, 1.31, 0.06],
      [0.7, 1.47, -0.02],
      [1.02, 1.7, -0.1],
      [1.22, 1.94, -0.12],
    ]),
    {
      parent: spine.tip,
      names: ["wingRootL", "wingElbowL", "wingWristL", "wingTipL"],
      role: "wing",
    },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.35, 1.31, 0.06],
      [-0.7, 1.47, -0.02],
      [-1.02, 1.7, -0.1],
      [-1.22, 1.94, -0.12],
    ]),
    {
      parent: spine.tip,
      names: ["wingRootR", "wingElbowR", "wingWristR", "wingTipR"],
      role: "wing",
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.92, -0.23],
      [0, 0.72, -0.5],
      [0, 0.57, -0.78],
      [0, 0.48, -1.03],
      [0, 0.4, -1.25],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
      role: "tail",
    },
  );

  // Main carved volumes.
  const body = b.sweep(spine, (t) => 0.31 - t * 0.095, {
    color: STONE,
    sides: 8,
    section: "circle",
    name: "ribbed_torso",
    group: "body",
    sectors: [
      [-55, 55, DARK_STONE],
      [125, 235, PALE_STONE],
    ],
  });
  b.sweep(neck, [0.2, 0.16], {
    color: STONE,
    sides: 8,
    name: "thick_neck",
    group: "body",
  });
  b.sweep(tail, (t) => 0.15 * (1 - t) + 0.035, {
    color: STONE,
    sides: 7,
    name: "barbed_tail",
    group: "tail",
  });
  b.sweep(legL, [0.14, 0.1], {
    color: STONE,
    sides: 7,
    name: "legL",
    group: "limbs",
  });
  b.sweep(legR, [0.14, 0.1], {
    color: STONE,
    sides: 7,
    name: "legR",
    group: "limbs",
  });
  b.sweep(armL, [0.11, 0.075], {
    color: STONE,
    sides: 7,
    name: "armL",
    group: "limbs",
  });
  b.sweep(armR, [0.11, 0.075], {
    color: STONE,
    sides: 7,
    name: "armR",
    group: "limbs",
  });

  // Hind feet and foreclaws.
  for (const s of [-1, 1]) {
    const foot = s > 0 ? legL.tip : legR.tip;
    const hand = s > 0 ? armL.tip : armR.tip;
    b.part(new THREE.SphereGeometry(0.13, 7, 5), STONE, {
      bone: foot,
      at: foot.at,
      scale: [1.25, 0.48, 1.2],
      name: `rear_paw_${s}`,
      group: "limbs",
    });
    for (let i = -1; i <= 1; i++) {
      const toeBase = [s * (0.38 + i * 0.065), 0.31, 0.38] as [
        number,
        number,
        number,
      ];
      b.spike(toeBase, [0, -0.1, 1], 0.18, 0.035, {
        color: CLAW,
        name: `rear_claw_${s}_${i}`,
        group: "claws",
      });
    }
    b.part(new THREE.SphereGeometry(0.09, 7, 5), STONE, {
      bone: hand,
      at: hand.at,
      scale: [1.05, 0.6, 1.05],
      name: `front_paw_${s}`,
      group: "limbs",
    });
    for (let i = -1; i <= 1; i++) {
      const base = hand.at.clone().add(new THREE.Vector3(s * i * 0.055, -0.03, 0.04));
      b.spike(base, [s * 0.08 * i, -0.08, 1], 0.17, 0.025, {
        color: CLAW,
        name: `front_claw_${s}_${i}`,
        group: "claws",
      });
    }
  }

  // Head and face, completed before horns and wings.
  const skull = b.part(
    new THREE.SphereGeometry(0.29, 12, 8),
    STONE,
    {
      bone: head,
      at: [0, 1.64, 0.58],
      scale: [0.92, 0.96, 1.15],
      name: "massive_skull",
      group: "head",
    },
  );
  b.part(
    new THREE.SphereGeometry(0.17, 9, 6),
    PALE_STONE,
    {
      bone: jaw,
      at: [0, 1.51, 0.76],
      scale: [1.2, 0.62, 1.08],
      name: "lower_muzzle",
      group: "face",
    },
  );
  b.frustumBox(
    [0, 1.58, 0.75],
    [0, 1.56, 0.98],
    [0.19, 0.14],
    [0.13, 0.095],
    { bone: head, color: DARK_STONE, name: "upper_muzzle", group: "face" },
  );
  b.part(
    new THREE.SphereGeometry(0.052, 8, 5),
    IRON,
    {
      bone: head,
      at: [0, 1.59, 1.0],
      scale: [1.2, 0.8, 0.7],
      name: "flat_nose",
      group: "face",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.27, 0.018, 0.012),
    IRON,
    {
      bone: jaw,
      at: [0, 1.61, 0.91],
      name: "mouth_shadow",
      group: "face",
    },
  );
  for (const s of [-1, 1]) {
    b.part(
      new THREE.PlaneGeometry(0.115, 0.085),
      "#ffffff",
      {
        bone: head,
        at: [s * 0.115, 1.69, 0.812],
        dir: [0, 0.08, 1],
        axis: "z",
        texture: EYE_TEX,
        name: `ember_eye_${s}`,
        group: "face",
      },
    );
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      b.part(
        new THREE.ConeGeometry(0.018, 0.11, 6),
        PALE_STONE,
        {
          bone: jaw,
          at: [s * (0.075 + i * 0.085), 1.59, 0.89],
          rotation: [Math.PI, 0, 0],
          name: `lower_fang_${s}_${i}`,
          group: "fangs",
        },
      );
    }
  }

  // Brow shelves and cheek planes.
  for (const s of [-1, 1]) {
    b.frustumBox(
      [s * 0.11, 1.76, 0.78],
      [s * 0.17, 1.73, 0.83],
      [0.09, 0.045],
      [0.07, 0.035],
      { bone: head, color: EDGE_STONE, name: `brow_${s}`, group: "face" },
    );
    b.part(
      new THREE.SphereGeometry(0.11, 7, 5),
      PALE_STONE,
      {
        bone: head,
        at: [s * 0.2, 1.58, 0.68],
        scale: [0.8, 1.05, 0.7],
        name: `cheek_${s}`,
        group: "face",
      },
    );
  }

  // Pointed ears.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.14, 0.02],
        [0.105, 0.18],
        [0.025, 0.29],
        [0, 0.08],
      ],
      {
        at: [s * 0.19, 1.79, 0.52],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.01,
        color: STONE,
        bone: head,
        name: `pointed_ear_${s}`,
        group: "head",
      },
    );
  }

  // Horns curling backward from the crown.
  for (const s of [-1, 1]) {
    const hornPath = catmull([
      [s * 0.12, 1.83, 0.51],
      [s * 0.19, 1.99, 0.42],
      [s * 0.25, 2.08, 0.22],
      [s * 0.2, 2.03, 0.02],
    ]);
    b.sweep(hornPath, [0.065, 0.012], {
      color: EDGE_STONE,
      sides: 7,
      caps: { start: "round", end: "point" },
      bone: head,
      name: `ram_horn_${s}`,
      group: "head",
    });
  }

  // Rib plates and shoulder blocks.
  for (let i = 0; i < 5; i++) {
    const t = 0.16 + i * 0.15;
    const p = body.at(t);
    b.part(
      new THREE.BoxGeometry(0.48 - i * 0.035, 0.035, 0.08),
      EDGE_STONE,
      {
        bone: p.bone,
        at: p.at.clone().add(new THREE.Vector3(0, -0.02, 0.01)),
        dir: p.tangent,
        name: `rib_plate_${i}`,
        group: "carving",
      },
    );
  }
  for (const s of [-1, 1]) {
    b.part(
      new THREE.DodecahedronGeometry(0.16, 0),
      EDGE_STONE,
      {
        bone: spine.tip,
        at: [s * 0.3, 1.34, 0.13],
        scale: [1.15, 0.8, 0.75],
        name: `shoulder_knuckle_${s}`,
        group: "carving",
      },
    );
  }

  // Wing arm tubes and broad membranes.
  b.sweep(wingL, [0.105, 0.028], {
    color: STONE,
    sides: 7,
    name: "wing_bone_L",
    group: "wings",
  });
  b.sweep(wingR, [0.105, 0.028], {
    color: STONE,
    sides: 7,
    name: "wing_bone_R",
    group: "wings",
  });

  const wingFingerL: ReturnType<typeof b.chain>[] = [];
  const wingFingerR: ReturnType<typeof b.chain>[] = [];
  const wingTipsL = [
    [1.38, 2.22, -0.13],
    [1.5, 2.02, -0.1],
    [1.48, 1.81, -0.04],
  ] as const;
  const wingTipsR = [
    [-1.38, 2.22, -0.13],
    [-1.5, 2.02, -0.1],
    [-1.48, 1.81, -0.04],
  ] as const;

  for (let i = 0; i < 3; i++) {
    const fl = b.chain(
      `wingFingerL${i}`,
      catmull([
        wingL.at(0.52).at,
        [0.92 + i * 0.06, 1.72 - i * 0.03, -0.1],
        wingTipsL[i],
      ]),
      {
        parent: wingL.tip,
        names: [`digitWingL${i}`, `digitWingL${i}Tip`],
        role: "digit",
      },
    );
    const fr = b.chain(
      `wingFingerR${i}`,
      catmull([
        wingR.at(0.52).at,
        [-0.92 - i * 0.06, 1.72 - i * 0.03, -0.1],
        wingTipsR[i],
      ]),
      {
        parent: wingR.tip,
        names: [`digitWingR${i}`, `digitWingR${i}Tip`],
        role: "digit",
      },
    );
    wingFingerL.push(fl);
    wingFingerR.push(fr);
    b.sweep(fl, [0.026, 0.008], {
      color: EDGE_STONE,
      sides: 6,
      caps: "point",
      name: `wing_finger_L${i}`,
      group: "wings",
    });
    b.sweep(fr, [0.026, 0.008], {
      color: EDGE_STONE,
      sides: 6,
      caps: "point",
      name: `wing_finger_R${i}`,
      group: "wings",
    });
  }

  b.membrane(wingL, wingFingerL[0], {
    color: INNER_WING,
    thickness: 0.018,
    rows: 5,
    cols: 9,
    scallop: 0.12,
    name: "wing_web_L0",
    group: "wings",
  });
  b.membrane(wingFingerL[0], wingFingerL[1], {
    color: INNER_WING,
    thickness: 0.014,
    rows: 4,
    cols: 8,
    scallop: 0.18,
    name: "wing_web_L1",
    group: "wings",
  });
  b.membrane(wingFingerL[1], wingFingerL[2], {
    color: INNER_WING,
    thickness: 0.012,
    rows: 4,
    cols: 7,
    scallop: 0.2,
    name: "wing_web_L2",
    group: "wings",
  });
  b.membrane(wingR, wingFingerR[0], {
    color: INNER_WING,
    thickness: 0.018,
    rows: 5,
    cols: 9,
    scallop: 0.12,
    name: "wing_web_R0",
    group: "wings",
  });
  b.membrane(wingFingerR[0], wingFingerR[1], {
    color: INNER_WING,
    thickness: 0.014,
    rows: 4,
    cols: 8,
    scallop: 0.18,
    name: "wing_web_R1",
    group: "wings",
  });
  b.membrane(wingFingerR[1], wingFingerR[2], {
    color: INNER_WING,
    thickness: 0.012,
    rows: 4,
    cols: 7,
    scallop: 0.2,
    name: "wing_web_R2",
    group: "wings",
  });

  // Wing-vein ribs.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const root = [s * (0.42 + i * 0.08), 1.42 + i * 0.06, -0.015] as [
        number,
        number,
        number,
      ];
      const tip = [s * (1.23 + i * 0.075), 1.78 + i * 0.13, -0.12] as [
        number,
        number,
        number,
      ];
      b.rod(root, tip, 0.009, {
        color: EDGE_STONE,
        name: `wing_vein_${s}_${i}`,
        group: "wings",
      });
    }
  }

  // Tail ridges and plated spines.
  b.along(tail, 6, (at) => {
    b.spike(at, [0, 0.8, -0.35], 0.12, 0.032, {
      color: EDGE_STONE,
      name: "tail_spine",
      group: "tail",
    });
  });
  b.along(spine, 7, (at) => {
    b.spike(at, [0, 0.8, -0.15], 0.09, 0.026, {
      color: EDGE_STONE,
      name: "dorsal_spine",
      group: "carving",
    });
  });

  // A few large gothic carving marks on the ledge and chest.
  for (const s of [-1, 1]) {
    b.part(
      new THREE.PlaneGeometry(0.18, 0.22),
      PALE_STONE,
      {
        bone: hips,
        at: [s * 0.13, 1.02, 0.31],
        dir: [0, 0.1, 1],
        axis: "z",
        texture: RUNE_TEX,
        name: `chest_rune_${s}`,
        group: "ornament",
      },
    );
  }
  b.part(
    new THREE.BoxGeometry(0.92, 0.025, 0.025),
    PALE_STONE,
    { at: [0, 0.305, 0.315], name: "ledge_chisel_line", group: "scenery" },
  );

  // Resting jaw, slightly open like a snarling gargoyle.
  b.pose(jaw, { axis: [1, 0, 0], deg: -10 });

  return b.root;
}
