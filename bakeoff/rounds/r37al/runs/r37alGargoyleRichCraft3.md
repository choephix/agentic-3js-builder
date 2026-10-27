```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  bezier,
  limb,
  rng,
  paint,
  mottle,
  countershade,
  scales,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "cathedral gargoyle crouched on a ledge",
  description:
    "A stylized low-poly gothic stone gargoyle, crouched low with folded wings, hooked horns, snarling jaws, talons, tail, and carved masonry details.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 0.85, paintSize: 2048 });

  const STONE_DARK = "#34333a";
  const STONE = "#68656a";
  const STONE_LIGHT = "#908b88";
  const STONE_EDGE = "#b0a69d";
  const STONE_SHADOW = "#29282e";
  const MOUTH = "#17151b";
  const TOOTH = "#c8bba7";
  const IRON = "#1a1820";
  const MOSS = "#52634b";
  const EYE = "#d3a84d";

  const stone = countershade(
    mottle(STONE_DARK, STONE_LIGHT, { size: 0.18, contrast: 1.35, seed: 31 }),
    STONE_SHADOW,
    { level: -0.16, soft: 0.28 },
  );
  const carved = scales(stone, STONE_DARK, { size: 0.12, width: 0.07, seed: 8 });
  const belly = mottle("#777477", "#b1a9a4", { size: 0.16, contrast: 1.2, seed: 22 });

  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="32" rx="29" ry="25" fill="#120f17" stroke="#050409" stroke-width="4"/>
      <ellipse cx="34" cy="34" rx="17" ry="19" fill="#d7a63a"/>
      <ellipse cx="37" cy="34" rx="7" ry="16" fill="#100b12"/>
      <circle cx="28" cy="24" r="5" fill="#fff0af"/>
      <path d="M8 20 Q31 5 56 18" fill="none" stroke="#29202a" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  const root = b.joint("pelvis", {
    at: [0, 0.73, -0.02],
    dir: [0, 0.1, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.73, -0.02],
    [0, 0.93, 0.02],
    [0, 1.16, 0.08],
    [0, 1.34, 0.20],
    [0, 1.43, 0.38],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: root,
    names: ["spine1", "spine2", "shoulders", "neckBase", "neckTip"],
    role: "spine",
    group: "body",
  });
  const torso = b.sweep(spine, (t) => 0.26 - t * 0.07, {
    color: stone,
    section: { ngon: 8 },
    sides: 8,
    group: "body",
  });

  const chest = b.joint("chest", {
    parent: spine.joints[2],
    at: [0, 1.27, 0.22],
    dir: [0, 0.02, 1],
    role: "spine",
    group: "body",
  });
  b.part(new THREE.SphereGeometry(0.31, 10, 7), stone, {
    bone: chest,
    at: [0, 1.28, 0.22],
    scale: [1.0, 0.82, 1.15],
    flat: true,
    group: "body",
    name: "carved_breast",
  });
  b.part(new THREE.SphereGeometry(0.22, 9, 6), belly, {
    bone: spine.joints[1],
    at: [0, 1.02, 0.17],
    scale: [1.1, 0.82, 0.9],
    flat: true,
    group: "belly",
    name: "pale_belly",
  });

  const shoulderL = b.joint("shoulderL", {
    parent: chest,
    at: [0.23, 1.31, 0.20],
    dir: [0.42, 0.04, 0.08],
    role: "arm",
    group: "arms",
  });
  const shoulderR = b.joint("shoulderR", {
    parent: chest,
    at: [-0.23, 1.31, 0.20],
    dir: [-0.42, 0.04, 0.08],
    role: "arm",
    group: "arms",
  });

  for (const s of [1, -1]) {
    const shoulder = s > 0 ? shoulderL : shoulderR;
    const armPts = limb(
      shoulder.at,
      [s * 0.39, 0.89, 0.40],
      [0.29, 0.29],
      [s > 0 ? [0.4, -0.2, 0.5] : [-0.4, -0.2, 0.5]],
    );
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, armPts, {
      parent: shoulder,
      names: [s > 0 ? "elbowL" : "elbowR", s > 0 ? "wristL" : "wristR"],
      role: "arm",
      group: "arms",
    });
    b.sweep(arm, [0.105, 0.075], {
      color: stone,
      section: { ngon: 6 },
      group: "arms",
    });

    const palm = arm.tip;
    b.part(new THREE.SphereGeometry(0.105, 7, 5), stone, {
      bone: palm,
      at: palm.at,
      scale: [1.0, 0.8, 1.35],
      flat: true,
      name: `clawed_palm_${s}`,
      group: "hands",
    });

    for (let i = 0; i < 3; i++) {
      const x = s * (0.055 + i * 0.052);
      const base = [x, 0.82 - Math.abs(i - 1) * 0.015, 0.48 + i * 0.012] as [number, number, number];
      const tip = [x + s * (0.018 + i * 0.009), 0.70 - i * 0.012, 0.57 + i * 0.012] as [
        number,
        number,
        number,
      ];
      b.sweep(bezier(base, [x, 0.78, 0.53], [tip[0], 0.73, 0.62], tip), [0.026, 0.005], {
        bone: palm,
        color: STONE_DARK,
        caps: { start: "round", end: "point" },
        group: "talons",
      });
      b.part(new THREE.ConeGeometry(0.024, 0.10, 5), TOOTH, {
        bone: palm,
        at: [tip[0], tip[1] - 0.012, tip[2]],
        dir: [s * 0.15, -0.35, 0.94],
        group: "talons",
        name: `hand_claw_${s}_${i}`,
      });
    }
  }

  for (const s of [1, -1]) {
    const hip = b.joint(`hip${s > 0 ? "L" : "R"}`, {
      parent: root,
      at: [s * 0.18, 0.73, -0.02],
      dir: [s * 0.12, -0.15, 0.25],
      role: "leg",
      group: "legs",
    });
    const legPts = limb(
      hip.at,
      [s * 0.31, 0.19, 0.38],
      [0.34, 0.29, 0.23],
      [s > 0 ? [0.5, 0, 0.7] : [-0.5, 0, 0.7], s > 0 ? [-0.3, 0, -0.7] : [0.3, 0, -0.7]],
      { sole: [0, 1, 0] },
    );
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, legPts, {
      parent: hip,
      names: [
        s > 0 ? "thighL" : "thighR",
        s > 0 ? "kneeL" : "kneeR",
        s > 0 ? "ankleL" : "ankleR",
        s > 0 ? "footL" : "footR",
      ],
      role: "leg",
      contact: [s * 0.31, 0, 0.38],
      group: "legs",
    });
    b.sweep(leg, (t) => 0.13 - t * 0.055, {
      color: stone,
      section: { ngon: 6 },
      group: "legs",
    });

    const foot = leg.tip;
    b.part(new THREE.BoxGeometry(0.19, 0.105, 0.36), stone, {
      bone: foot,
      at: [s * 0.31, 0.105, 0.44],
      scale: [1, 1, 1],
      flat: true,
      group: "feet",
      name: `heavy_foot_${s}`,
    });
    for (let i = 0; i < 3; i++) {
      const fx = s * (0.25 + i * 0.06);
      b.sweep(
        polyline([
          [fx, 0.09, 0.57],
          [fx + s * 0.015, 0.055, 0.70 + i * 0.015],
          [fx + s * 0.01, 0.025, 0.77 + i * 0.02],
        ]),
        [0.032, 0.004],
        {
          bone: foot,
          color: TOOTH,
          caps: { start: "round", end: "point" },
          group: "talons",
          name: `foot_talon_${s}_${i}`,
        },
      );
    }
  }

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.39, 0.34],
      [0, 1.53, 0.43],
      [0, 1.64, 0.55],
    ]),
    {
      parent: spine.joints[3],
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
      group: "head",
    },
  );
  b.sweep(neck, [0.20, 0.145], {
    color: stone,
    section: { ngon: 8 },
    group: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.68, 0.61],
    dir: [0, -0.02, 1],
    role: "head",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.255, 10, 8), carved, {
    bone: head,
    at: [0, 1.69, 0.63],
    scale: [1.02, 0.95, 1.12],
    flat: true,
    group: "head",
    name: "angular_skull",
  });

  const muzzle = b.joint("muzzle", {
    parent: head,
    at: [0, 1.62, 0.82],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "face",
  });
  b.part(new THREE.BoxGeometry(0.26, 0.18, 0.23), stone, {
    bone: muzzle,
    at: [0, 1.60, 0.82],
    scale: [1.0, 0.9, 1.0],
    flat: true,
    group: "face",
    name: "square_muzzle",
  });

  const jaw = b.joint("jaw", {
    parent: muzzle,
    at: [0, 1.55, 0.87],
    dir: [0, -0.32, 0.95],
    role: "jaw",
    group: "face",
  });
  b.part(new THREE.BoxGeometry(0.23, 0.10, 0.26), stone, {
    bone: jaw,
    at: [0, 1.54, 0.88],
    flat: true,
    group: "face",
    name: "lower_jaw",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: -13 });

  b.part(new THREE.BoxGeometry(0.205, 0.055, 0.11), MOUTH, {
    bone: muzzle,
    at: [0, 1.57, 0.915],
    flat: true,
    group: "mouth",
    name: "deep_mouth_gap",
  });

  for (const s of [1, -1]) {
    const eyeAt = [s * 0.105, 1.735, 0.815] as [number, number, number];
    b.decal(head, eyeTexture, {
      at: eyeAt,
      dir: [0, 0.20, 0.98],
      up: [0, 1, 0],
      size: [0.105, 0.105],
      mirror: s > 0,
      lift: 0.006,
      segments: 5,
      group: "face",
      name: `carved_eye_${s}`,
    });

    b.part(new THREE.ConeGeometry(0.042, 0.15, 6), stone_light(), {
      bone: head,
      at: [s * 0.12, 1.85, 0.64],
      dir: [s * 0.16, 0.35, -0.45],
      group: "brow",
      name: `heavy_brow_${s}`,
    });

    b.part(new THREE.ConeGeometry(0.036, 0.17, 6), stone_edge(), {
      bone: head,
      at: [s * 0.14, 1.87, 0.56],
      dir: [s * 0.48, 0.76, -0.12],
      group: "horns",
      name: `temple_horn_${s}`,
    });

    const ear = b.extrude(
      [
        [0, 0],
        [0.13, 0.015],
        [0.09, 0.13],
        [0.025, 0.24, "sharp"],
        [0, 0.10],
      ],
      {
        at: [s * 0.19, 1.77, 0.57],
        x: [s, 0, 0],
        y: [0, 0.75, -0.18],
        thickness: 0.045,
        bevel: 0.012,
        smoothing: 1,
        color: stone,
        bone: head,
        group: "ears",
        name: `pointed_ear_${s}`,
      },
    );
    b.part(new THREE.ConeGeometry(0.025, 0.11, 5), STONE_DARK, {
      bone: head,
      at: ear.local([s * 0.055, 0.10, 0.03]),
      dir: [s * 0.1, 0.2, 1],
      group: "ears",
    });
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(0.018, 0.105, 5), TOOTH, {
        bone: muzzle,
        at: [s * (0.07 + i * 0.055), 1.535, 0.925],
        dir: [0, -0.72, 0.35],
        group: "teeth",
        name: `upper_fang_${s}_${i}`,
      });
      b.part(new THREE.ConeGeometry(0.016, 0.09, 5), TOOTH, {
        bone: jaw,
        at: [s * (0.065 + i * 0.05), 1.595, 0.93],
        dir: [0, 0.68, 0.45],
        group: "teeth",
        name: `lower_fang_${s}_${i}`,
      });
    }
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.70, -0.18],
      [0, 0.58, -0.48],
      [sweepX(0.11), 0.44, -0.78],
      [0.12, 0.33, -1.02],
      [-0.02, 0.29, -1.20],
    ]),
    {
      parent: root,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );
  b.sweep(tail, (t) => 0.105 * (1 - t) + 0.018, {
    color: stone,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    group: "tail",
  });
  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.12;
    const p = tail.at(t);
    b.spike(p, p, 0.08 - i * 0.006, 0.027 - i * 0.002, {
      color: stone_edge(),
      group: "tail_spines",
      name: `tail_spine_${i}`,
    });
  }

  const wingBaseL = b.joint("wingBaseL", {
    parent: chest,
    at: [0.22, 1.39, 0.12],
    dir: [0.65, 0.30, -0.15],
    role: "wing",
    group: "wings",
  });
  const wingBaseR = b.joint("wingBaseR", {
    parent: chest,
    at: [-0.22, 1.39, 0.12],
    dir: [-0.65, 0.30, -0.15],
    role: "wing",
    group: "wings",
  });

  for (const s of [1, -1]) {
    const base = s > 0 ? wingBaseL : wingBaseR;
    const armPts = [
      base.at,
      [s * 0.48, 1.57, -0.02],
      [s * 0.69, 1.70, -0.14],
      [s * 0.82, 1.64, -0.33],
    ] as [number, number, number][];
    const wingArm = b.chain(`wing${s > 0 ? "L" : "R"}`, armPts, {
      parent: base,
      names: [s > 0 ? "wingArmL" : "wingArmR", s > 0 ? "wingElbowL" : "wingElbowR", s > 0 ? "wingTipL" : "wingTipR"],
      role: "wing",
      group: "wings",
    });
    const boneColor = stone;
    b.sweep(wingArm, [0.075, 0.035], {
      color: boneColor,
      section: { ngon: 6 },
      group: "wing_bones",
    });

    const finger1 = b.chain(
      `wingFingerA${s}`,
      catmull([
        wingArm.at(0.42).at,
        [s * 0.77, 1.91, -0.21],
        [s * 0.96, 2.12, -0.20],
      ]),
      { parent: wingArm.joints[0], names: [`wingFingerA${s}`, `wingFingerATip${s}`], role: "digit", group: "wings" },
    );
    const finger2 = b.chain(
      `wingFingerB${s}`,
      catmull([
        wingArm.at(0.62).at,
        [s * 0.84, 1.78, -0.25],
        [s * 1.03, 1.88, -0.38],
      ]),
      { parent: wingArm.joints[1], names: [`wingFingerB${s}`, `wingFingerBTip${s}`], role: "digit", group: "wings" },
    );
    const finger3 = b.chain(
      `wingFingerC${s}`,
      catmull([
        wingArm.at(0.78).at,
        [s * 0.88, 1.61, -0.34],
        [s * 0.98, 1.52, -0.57],
      ]),
      { parent: wingArm.tip, names: [`wingFingerC${s}`, `wingFingerCTip${s}`], role: "digit", group: "wings" },
    );

    for (const f of [finger1, finger2, finger3]) {
      b.sweep(f, [0.035, 0.009], {
        color: stone_edge(),
        caps: { start: "round", end: "point" },
        group: "wing_bones",
      });
    }

    const inner = catmull([
      wingArm.at(0.22).at,
      wingArm.at(0.52).at,
      wingArm.at(0.82).at,
    ]);
    b.membrane(inner, finger1, {
      color: countershade(STONE, STONE_DARK, { level: 0.1, soft: 0.25 }),
      thickness: 0.018,
      rows: 4,
      cols: 8,
      scallop: 0.14,
      group: "wing_membrane",
      name: `upper_wing_membrane_${s}`,
    });
    b.membrane(finger1, finger2, {
      color: stone,
      thickness: 0.016,
      rows: 4,
      cols: 7,
      scallop: 0.18,
      group: "wing_membrane",
      name: `middle_wing_membrane_${s}`,
    });
    b.membrane(finger2, finger3, {
      color: countershade(STONE_LIGHT, STONE_DARK, { level: -0.05, soft: 0.3 }),
      thickness: 0.014,
      rows: 4,
      cols: 7,
      scallop: 0.23,
      group: "wing_membrane",
      name: `lower_wing_membrane_${s}`,
    });

    for (let i = 0; i < 5; i++) {
      const t = 0.16 + i * 0.17;
      const q = wingArm.at(t);
      b.spike(q, q, 0.11 - i * 0.012, 0.025, {
        color: stone_edge(),
        group: "wing_ridges",
        name: `wing_ridge_${s}_${i}`,
      });
    }
  }

  // Broad carved ribs across the breast.
  for (let i = 0; i < 5; i++) {
    const y = 1.08 + i * 0.085;
    b.rod(
      [-(0.16 - i * 0.012), y, 0.36 + i * 0.008],
      [(0.16 - i * 0.012), y, 0.36 + i * 0.008],
      0.012,
      {
        bone: chest,
        color: STONE_EDGE,
        caps: "round",
        group: "carved_ribs",
        name: `breast_rib_${i}`,
      },
    );
  }

  // Small blocky moss patches, kept sparse so the carved stone remains the hero.
  const mossTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M2 27 Q7 13 13 22 Q17 5 23 17 Q28 10 30 27Z" fill="#6f8658"/>
      <path d="M4 27 Q11 18 17 27 M14 27 Q21 15 28 27" fill="none" stroke="#31462f" stroke-width="3"/>
    </svg>`,
    { size: 64, pixelated: true },
  );
  const mossFrames = [
    [0.22, 0.79, -0.18],
    [-0.25, 0.82, -0.10],
    [0.31, 0.19, 0.43],
    [-0.28, 0.20, 0.42],
    [0.72, 1.67, -0.18],
    [-0.72, 1.67, -0.18],
  ].map((p) => b.surface(b.root).nearest(p));
  b.cards(
    mossFrames.filter(Boolean) as any,
    mossTexture,
    {
      size: [0.12, 0.10],
      color: MOSS,
      lean: 72,
      bend: 18,
      vary: 0.22,
      rng: rng(44),
      group: "moss",
    },
  );

  // A simple carved ledge beneath the crouching creature, sized to its footprint.
  b.part(new THREE.BoxGeometry(1.95, 0.16, 1.45), STONE_DARK, {
    at: [0, 0.02, 0.03],
    flat: true,
    group: "ledge",
    name: "cathedral_ledge",
  });
  b.part(new THREE.BoxGeometry(1.72, 0.045, 1.30), STONE, {
    at: [0, 0.125, 0.03],
    flat: true,
    group: "ledge",
    name: "ledge_cap",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.075, 0.34, 0.075), STONE_LIGHT, {
      at: [s * 0.80, 0.23, -0.42],
      flat: true,
      group: "ledge_carving",
      name: `ledge_corbels_${s}`,
    });
    b.part(new THREE.BoxGeometry(0.075, 0.34, 0.075), STONE_LIGHT, {
      at: [s * 0.80, 0.23, 0.48],
      flat: true,
      group: "ledge_carving",
      name: `ledge_corbels_front_${s}`,
    });
  }

  return b.root;
}

function sweepX(v: number) {
  return v;
}

function stone_light() {
  return "#9a9590";
}

function stone_edge() {
  return "#aaa19a";
}
```