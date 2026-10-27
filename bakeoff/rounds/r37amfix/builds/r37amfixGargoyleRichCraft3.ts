import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  mottle,
  countershade,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle perched on a carved cathedral ledge, with folded claws, snarling face, horns, ridged wings, and a curling tail.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = "#55545b";
  const STONE_LIT = "#77747a";
  const STONE_DARK = "#302f37";
  const STONE_BLUE = "#454957";
  const EDGE = "#97919a";
  const BLACK = "#17151d";
  const EYE_GOLD = "#ffb83e";
  const MOUTH = "#21141b";
  const TOOTH = "#d0c4ae";
  const MOSS = "#344538";
  const LEDGE = "#403e47";

  const weatheredStone = countershade(
    mottle(STONE, STONE_LIT, { size: 0.18, contrast: 1.5, seed: 17 }),
    STONE_DARK,
    { level: -0.16, soft: 0.3 },
  );

  const wingStone = mottle(STONE_BLUE, STONE_LIT, {
    size: 0.13,
    contrast: 1.25,
    seed: 29,
  });

  const mossyStone = paint((p, n) => {
    const moss =
      n.y > 0.48 &&
      p.y < 0.58 &&
      Math.sin(p.x * 31 + p.z * 17) + Math.sin(p.z * 53) > 1.05;
    return moss ? MOSS : weatheredStone;
  });

  // ---------------------------------------------------------------------------
  // Ledge and carved architectural support

  b.part(
    new THREE.BoxGeometry(2.35, 0.26, 0.92, 1, 1, 1),
    mossyStone,
    { at: [0, 0.23, 0], name: "ledge_slab", group: "scenery" },
  );

  b.part(
    new THREE.BoxGeometry(2.05, 0.16, 0.72, 1, 1, 1),
    EDGE,
    { at: [0, 0.43, 0.02], name: "ledge_cap", group: "scenery" },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.38, 0.58, 0.54, 1, 1, 1),
      LEDGE,
      { at: [s * 0.73, -0.03, -0.03], name: `ledge_bracket_${s}`, group: "scenery" },
    );
    b.part(
      new THREE.ConeGeometry(0.18, 0.3, 6),
      STONE_DARK,
      {
        at: [s * 0.73, 0.39, 0.27],
        dir: [0, 1, 0],
        name: `ledge_gargoyle_carving_${s}`,
        group: "scenery",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Skeleton: spine, head, jaw, legs, arms, tail, and wing bones

  const hips = b.joint("hips", {
    at: [0, 1.02, -0.08],
    dir: [0, 0.45, 1],
    role: "spine",
  });

  const torsoPath = catmull([
    [0, 1.02, -0.08],
    [0, 1.24, 0.02],
    [0, 1.48, 0.12],
    [0, 1.63, 0.22],
  ]);

  const torso = b.chain("spine", torsoPath, {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 1.59, 0.22],
    [0, 1.72, 0.29],
    [0, 1.83, 0.39],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: torso.joints[torso.joints.length - 1],
    names: ["neck1", "neck2", "neckTip"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.88, 0.43],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.81, 0.53],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const legPoints = (s: number) =>
    limb(
      [s * 0.26, 1.05, -0.1],
      [s * 0.28, 0.51, 0.36],
      [0.34, 0.31, 0.22],
      [
        [s * 0.3, 0, 1],
        [s * 0.2, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );

  const legL = b.chain("legL", legPoints(1), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.28, 0.45, 0.36],
  });

  const legR = b.chain("legR", legPoints(-1), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.28, 0.45, 0.36],
  });

  const armPoints = (s: number) =>
    limb(
      [s * 0.34, 1.42, 0.18],
      [s * 0.48, 0.73, 0.53],
      [0.3, 0.34, 0.24],
      [
        [s * 0.3, 0, 1],
        [s * 0.25, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );

  const armL = b.chain("armL", armPoints(1), {
    parent: torso.joints[1],
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });

  const armR = b.chain("armR", armPoints(-1), {
    parent: torso.joints[1],
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  const tailPath = catmull([
    [0, 1.08, -0.27],
    [0, 0.94, -0.52],
    [0.04, 0.76, -0.82],
    [0.16, 0.63, -1.1],
    [0.34, 0.67, -1.31],
    [0.48, 0.82, -1.42],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  const wingLPath = catmull([
    [0.36, 1.45, 0.02],
    [0.67, 1.7, -0.05],
    [0.98, 1.98, -0.12],
    [1.28, 2.08, -0.27],
  ]);
  const wingRPath = catmull([
    [-0.36, 1.45, 0.02],
    [-0.67, 1.7, -0.05],
    [-0.98, 1.98, -0.12],
    [-1.28, 2.08, -0.27],
  ]);

  const wingL = b.chain("wingL", wingLPath, {
    parent: torso.joints[1],
    names: ["wingRootL", "wingMidL", "wingKnuckleL", "wingTipL"],
    role: "wing",
  });
  const wingR = b.chain("wingR", wingRPath, {
    parent: torso.joints[1],
    names: ["wingRootR", "wingMidR", "wingKnuckleR", "wingTipR"],
    role: "wing",
  });

  // ---------------------------------------------------------------------------
  // Body and limbs

  b.sweep(torso, (t) => 0.27 - t * 0.04, {
    color: weatheredStone,
    section: { ngon: 8 },
    sides: 8,
    name: "carved_torso",
    group: "body",
  });

  b.sweep(neck, [0.18, 0.145], {
    color: weatheredStone,
    section: { ngon: 7 },
    name: "carved_neck",
    group: "body",
  });

  b.sweep(legL, (t) => 0.105 - t * 0.025, {
    color: weatheredStone,
    section: { ngon: 6 },
    name: "legL_stone",
    group: "limbs",
  });
  b.sweep(legR, (t) => 0.105 - t * 0.025, {
    color: weatheredStone,
    section: { ngon: 6 },
    name: "legR_stone",
    group: "limbs",
  });

  b.sweep(armL, (t) => 0.085 - t * 0.022, {
    color: weatheredStone,
    section: { ngon: 6 },
    name: "armL_stone",
    group: "limbs",
  });
  b.sweep(armR, (t) => 0.085 - t * 0.022, {
    color: weatheredStone,
    section: { ngon: 6 },
    name: "armR_stone",
    group: "limbs",
  });

  b.sweep(tail, (t) => 0.14 * (1 - t) + 0.025, {
    color: weatheredStone,
    section: { ngon: 7 },
    caps: "round",
    name: "curling_tail",
    group: "tail",
  });

  // Heavy belly plate and chest keystone.
  b.part(
    new THREE.SphereGeometry(1, 10, 7),
    countershade(STONE_LIT, STONE_DARK, { level: -0.05, soft: 0.24 }),
    {
      bone: torso.joints[1],
      at: [0, 1.27, 0.16],
      scale: [0.27, 0.31, 0.24],
      name: "belly_mass",
      group: "body",
    },
  );

  b.part(
    new THREE.ConeGeometry(0.13, 0.28, 6),
    EDGE,
    {
      bone: torso.joints[1],
      at: [0, 1.47, 0.32],
      dir: [0, 0.3, 1],
      name: "chest_keystone",
      group: "carving",
    },
  );

  // ---------------------------------------------------------------------------
  // Head, muzzle, jaw, brow, ears, and horns

  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    weatheredStone,
    {
      bone: head,
      at: [0, 1.89, 0.44],
      scale: [0.255, 0.25, 0.25],
      name: "gargoyle_skull",
      group: "head",
    },
  );

  const muzzle = b.part(
    new THREE.SphereGeometry(1, 10, 7),
    mottle(STONE_LIT, STONE, { size: 0.09, contrast: 1.4, seed: 41 }),
    {
      bone: head,
      at: [0, 1.82, 0.62],
      scale: [0.19, 0.13, 0.2],
      name: "muzzle",
      group: "face",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 9, 6),
    MOUTH,
    {
      bone: jaw,
      at: [0, 1.76, 0.68],
      scale: [0.16, 0.045, 0.15],
      name: "open_lower_jaw",
      group: "face",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.25, 0.035, 0.18),
    BLACK,
    {
      bone: head,
      at: [0, 1.79, 0.76],
      name: "mouth_shadow",
      group: "face",
    },
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="39" ry="35" fill="#17151d" stroke="#0a080d" stroke-width="7"/>
      <ellipse cx="53" cy="53" rx="23" ry="28" fill="#ffb83e"/>
      <ellipse cx="55" cy="54" rx="8" ry="24" fill="#21131b"/>
      <circle cx="45" cy="38" r="7" fill="#fff4bd"/>
      <path d="M12 27 Q47 4 88 25" fill="none" stroke="#121019" stroke-width="9"/>
    </svg>`,
    { size: 256 },
  );

  const headSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = headSurface.around([0, 1.89, 0.44]).at(s * 39, 5);
    if (hit) {
      b.decal(headSurface, eyeTexture, {
        at: hit,
        size: [0.105, 0.105],
        mirror: s > 0,
        lift: 0.003,
        name: `glowing_eye_${s}`,
        group: "face",
      });
    }
  }

  b.part(
    new THREE.SphereGeometry(0.055, 8, 5),
    BLACK,
    {
      bone: head,
      at: [0, 1.84, 0.805],
      scale: [1.15, 0.72, 0.8],
      name: "nostril_block",
      group: "face",
    },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.16, 0.045, 0.06),
      STONE_DARK,
      {
        bone: head,
        at: [s * 0.105, 2.025, 0.59],
        rotation: [s * -12, s * 7, s * -18],
        name: `heavy_brow_${s}`,
        group: "face",
      },
    );

    b.spike(
      [s * 0.17, 1.99, 0.48],
      [s * 0.34, 2.28, 0.34],
      null,
      0.065,
      { color: STONE_DARK, bone: head, name: `horn_${s}`, group: "head" },
    );

    b.extrude(
      [
        [0, 0],
        [0.11, 0.015],
        [0.09, 0.2],
        [0.02, 0.27],
        [0, 0.1],
      ],
      {
        at: [s * 0.22, 1.94, 0.41],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        color: EDGE,
        bone: head,
        name: `pointed_ear_${s}`,
        group: "head",
      },
    );
  }

  // Fangs: four unmistakable carved teeth.
  for (const s of [-1, 1]) {
    b.spike(
      [s * 0.095, 1.79, 0.77],
      [s * 0.095, 1.69, 0.79],
      null,
      0.018,
      { color: TOOTH, bone: jaw, name: `fang_lower_${s}`, group: "face" },
    );
    b.spike(
      [s * 0.145, 1.805, 0.75],
      [s * 0.145, 1.72, 0.77],
      null,
      0.014,
      { color: TOOTH, bone: jaw, name: `fang_outer_${s}`, group: "face" },
    );
  }

  // ---------------------------------------------------------------------------
  // Clawed hands and feet

  for (const [side, hand] of [
    [1, armL.joints[armL.joints.length - 1]],
    [-1, armR.joints[armR.joints.length - 1]],
  ] as const) {
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      STONE_LIT,
      {
        bone: hand,
        at: hand.at,
        scale: [0.11, 0.075, 0.13],
        name: `palm_${side}`,
        group: "claws",
      },
    );
    for (let i = -1; i <= 1; i++) {
      const start = [side * (0.48 + i * 0.045), 0.7, 0.62] as [number, number, number];
      const end = [side * (0.5 + i * 0.06), 0.63, 0.78] as [number, number, number];
      b.spike(start, end, null, 0.018, {
        color: TOOTH,
        bone: hand,
        name: `hand_claw_${side}_${i}`,
        group: "claws",
      });
    }
  }

  for (const [side, foot] of [
    [1, legL.joints[legL.joints.length - 1]],
    [-1, legR.joints[legR.joints.length - 1]],
  ] as const) {
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      STONE_LIT,
      {
        bone: foot,
        at: foot.at,
        scale: [0.14, 0.075, 0.19],
        name: `foot_${side}`,
        group: "claws",
      },
    );
    for (let i = -1; i <= 1; i++) {
      b.spike(
        [side * (0.28 + i * 0.055), 0.48, 0.42],
        [side * (0.29 + i * 0.065), 0.46, 0.57],
        null,
        0.022,
        { color: TOOTH, bone: foot, name: `toe_claw_${side}_${i}`, group: "claws" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Monumental bat wings: sculpted spars plus membranes

  b.sweep(wingL, [0.105, 0.035], {
    color: wingStone,
    section: { ngon: 6 },
    name: "wing_spar_L",
    group: "wings",
  });
  b.sweep(wingR, [0.105, 0.035], {
    color: wingStone,
    section: { ngon: 6 },
    name: "wing_spar_R",
    group: "wings",
  });

  const lowerL = catmull([
    [0.39, 1.4, 0.03],
    [0.72, 1.25, -0.12],
    [1.05, 1.12, -0.31],
    [1.28, 1.43, -0.27],
  ]);
  const lowerR = catmull([
    [-0.39, 1.4, 0.03],
    [-0.72, 1.25, -0.12],
    [-1.05, 1.12, -0.31],
    [-1.28, 1.43, -0.27],
  ]);

  const lowerWingL = b.chain("wingLowerL", lowerL, {
    parent: torso.joints[1],
    names: ["wingLowerRootL", "wingLowerMidL", "wingLowerTipL"],
    role: "wing",
  });
  const lowerWingR = b.chain("wingLowerR", lowerR, {
    parent: torso.joints[1],
    names: ["wingLowerRootR", "wingLowerMidR", "wingLowerTipR"],
    role: "wing",
  });

  b.membrane(wingL, lowerWingL, {
    color: wingStone,
    thickness: 0.018,
    rows: 5,
    cols: 8,
    scallop: 0.16,
    name: "wing_membrane_L",
    group: "wings",
  });
  b.membrane(wingR, lowerWingR, {
    color: wingStone,
    thickness: 0.018,
    rows: 5,
    cols: 8,
    scallop: 0.16,
    name: "wing_membrane_R",
    group: "wings",
  });

  // Three pointed finger bones along each wing edge.
  for (const s of [-1, 1]) {
    const root = [s * 0.68, 1.7, -0.05] as [number, number, number];
    const fingers = [
      [s * 1.0, 2.12, -0.12],
      [s * 1.23, 2.02, -0.2],
      [s * 1.42, 1.71, -0.3],
    ] as [number, number, number][];
    for (let i = 0; i < fingers.length; i++) {
      b.spike(root, fingers[i], null, 0.025, {
        color: EDGE,
        bone: i === 0 ? (s > 0 ? wingL.joints[1] : wingR.joints[1]) : undefined,
        name: `wing_finger_${s}_${i}`,
        group: "wings",
      });
    }
  }

  // Wing membrane ribs, giving the carved wings architectural rhythm.
  for (const s of [-1, 1]) {
    const parent = s > 0 ? wingL.joints[1] : wingR.joints[1];
    const ribs = [
      [s * 0.68, 1.66, -0.03],
      [s * 0.86, 1.48, -0.1],
      [s * 1.02, 1.35, -0.18],
      [s * 1.14, 1.3, -0.24],
    ] as [number, number, number][];
    for (let i = 0; i < ribs.length; i++) {
      b.rod(
        ribs[i],
        [s * (0.88 + i * 0.15), 1.88 + i * 0.055, -0.13 - i * 0.03],
        0.012,
        { color: STONE_DARK, bone: parent, name: `wing_rib_${s}_${i}`, group: "wings" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Tail spines and stone ornament

  b.along(tail, 7, (at) =>
    b.spike(at, at, 0.075, 0.021, {
      color: EDGE,
      name: "tail_spine",
      group: "tail",
    }),
  );

  // Small dorsal ridges from neck to skull.
  b.along(neck, 4, (at) =>
    b.spike(at, at, 0.09, 0.028, {
      color: STONE_DARK,
      name: "neck_ridge",
      group: "carving",
    }),
  );

  // Carved gothic rune on the ledge front.
  const rune = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M50 8 L50 112 M18 28 L50 42 L82 28 M25 77 Q50 58 75 77 M31 98 L50 84 L69 98"
        fill="none" stroke="#c8b88f" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter"/>
    </svg>`,
    { size: 128 },
  );

  const runePart = b.part(
    new THREE.PlaneGeometry(0.24, 0.29),
    "#baa979",
    {
      at: [0, 0.29, 0.47],
      dir: [0, 0, 1],
      axis: "z",
      texture: rune,
      name: "cathedral_rune",
      group: "scenery",
    },
  );
  glow(runePart, 0.16);

  // A few deliberately chunky erosion chips on the silhouette.
  for (const [x, y, z, r] of [
    [0.21, 1.3, 0.22, 0.032],
    [-0.22, 1.18, 0.03, 0.028],
    [0.17, 1.98, 0.42, 0.022],
    [-0.18, 1.71, 0.43, 0.025],
  ] as const) {
    b.part(
      new THREE.ConeGeometry(r, r * 1.8, 5),
      STONE_DARK,
      {
        at: [x, y, z],
        dir: [x > 0 ? 0.3 : -0.3, 0.1, -1],
        name: "weathered_chip",
        group: "carving",
      },
    );
  }

  return b.root;
}
