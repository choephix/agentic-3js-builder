import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  frame,
} from "../../../../src/index";

export const meta = {
  name: "Grimjaw the Dwarf Blacksmith",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith in a leather apron, standing behind a riveted anvil with a raised hammer, braided beard, copper goggles, belt tools, and heavy boots.",
};

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith", detail: 1 });

  const IRON = "#252733";
  const IRON_DARK = "#14161d";
  const STEEL = "#66717b";
  const STEEL_HI = "#aeb9bb";
  const BRASS = "#c58a32";
  const BRASS_HI = "#f0c45b";
  const COPPER = "#b95f38";
  const LEATHER = "#542b1f";
  const LEATHER_DARK = "#321b17";
  const APRON = "#263a42";
  const APRON_HI = "#3f6065";
  const TUNIC = "#493d52";
  const SKIN = "#b98261";
  const SKIN_LIGHT = "#d6a17a";
  const SKIN_SHADOW = "#754b42";
  const HAIR = "#372622";
  const HAIR_HI = "#694234";
  const BEARD = "#4b3029";
  const BEARD_HI = "#81513a";
  const CREAM = "#d9c298";
  const RED = "#a72f28";
  const GLOW = "#ff9b30";
  const INK = "#17131a";

  const V = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bone?: any,
    rotation?: [number, number, number],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
    });
  }

  function sphere(
    radius: number,
    at: [number, number, number],
    color: string,
    bone?: any,
    scale?: [number, number, number],
    name?: string,
  ) {
    return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      bone,
      scale,
      name,
    });
  }

  function cyl(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    bone?: any,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      bone,
      dir,
      name,
    });
  }

  function rod(
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone?: any,
    name?: string,
  ) {
    return b.rod(a, c, radius, { color, bone, name, caps: "round" });
  }

  function rivet(at: [number, number, number], bone?: any, color = BRASS_HI) {
    return sphere(0.018, at, color, bone, [1, 0.7, 1], "rivet");
  }

  function strap(
    a: [number, number, number],
    c: [number, number, number],
    width: number,
    color: string,
    bone?: any,
  ) {
    const mid: [number, number, number] = [
      (a[0] + c[0]) / 2,
      (a[1] + c[1]) / 2,
      (a[2] + c[2]) / 2,
    ];
    const len = Math.sqrt(
      (c[0] - a[0]) ** 2 + (c[1] - a[1]) ** 2 + (c[2] - a[2]) ** 2,
    );
    return b.part(new THREE.BoxGeometry(width, len, width * 0.42), color, {
      at: mid,
      bone,
      dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]],
      name: "leatherStrap",
    });
  }

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: compact dwarf proportions, relaxed working stance.

  const hips = b.joint("hips", {
    at: [0, 0.72, -0.04],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.04],
      [0, 0.91, -0.02],
      [0, 1.10, 0.0],
      [0, 1.22, 0.02],
    ]),
    {
      parent: hips,
      names: ["pelvis", "abdomen", "chest", "shoulderRoot"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.18, 0.02],
      [0, 1.30, 0.03],
      [0, 1.39, 0.07],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTop", "headBase"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.43, 0.08],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.35, 0.18],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "face",
  });

  const leftLegPts = [
    [-0.18, 0.69, -0.02],
    [-0.20, 0.42, 0.00],
    [-0.19, 0.17, 0.08],
    [-0.20, 0.09, 0.18],
  ] as [number, number, number][];

  const rightLegPts = [
    [0.18, 0.69, -0.02],
    [0.20, 0.42, 0.00],
    [0.19, 0.17, 0.08],
    [0.20, 0.09, 0.18],
  ] as [number, number, number][];

  const legL = b.chain("legL", leftLegPts, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [-0.20, 0, 0.18],
  });

  const legR = b.chain("legR", rightLegPts, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [0.20, 0, 0.18],
  });

  const armLPts = [
    [-0.28, 1.16, 0.03],
    [-0.42, 1.03, 0.17],
    [-0.32, 0.82, 0.34],
    [-0.17, 0.70, 0.39],
  ] as [number, number, number][];

  const armRPts = [
    [0.28, 1.16, 0.03],
    [0.42, 1.04, 0.17],
    [0.30, 0.84, 0.40],
    [0.15, 0.72, 0.40],
  ] as [number, number, number][];

  const armL = b.chain("armL", armLPts, {
    parent: spine.tip,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });

  const armR = b.chain("armR", armRPts, {
    parent: spine.tip,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  // ------------------------------------------------------------------------------------------------
  // Legs and boots.

  b.sweep(legL, [0.105, 0.082, 0.065], {
    color: TUNIC,
    section: { ngon: 6 },
    name: "leftLeg",
  });
  b.sweep(legR, [0.105, 0.082, 0.065], {
    color: TUNIC,
    section: { ngon: 6 },
    name: "rightLeg",
  });

  for (const s of [-1, 1]) {
    const leg = s < 0 ? legL : legR;
    box([0.18, 0.16, 0.23], [s * 0.20, 0.12, 0.17], LEATHER_DARK, leg.tip, undefined, "boot");
    box([0.19, 0.055, 0.26], [s * 0.20, 0.045, 0.20], LEATHER, leg.tip, undefined, "bootSole");
    box([0.17, 0.035, 0.13], [s * 0.20, 0.205, 0.13], BRASS, leg.tip, undefined, "bootCuff");
    strap([s * 0.12, 0.15, 0.13], [s * 0.28, 0.15, 0.13], 0.045, LEATHER_DARK, leg.tip);
    rivet([s * 0.17, 0.15, 0.20], leg.tip);
    rivet([s * 0.23, 0.15, 0.20], leg.tip);
  }

  // Knee guards and belt.
  for (const s of [-1, 1]) {
    sphere(0.105, [s * 0.20, 0.42, 0.075], IRON, s < 0 ? legL.joints[1] : legR.joints[1], [1.1, 0.65, 0.45], "kneeGuard");
    rivet([s * 0.20, 0.44, 0.125], s < 0 ? legL.joints[1] : legR.joints[1]);
  }

  b.sweep(
    catmull([
      [-0.32, 0.73, 0.01],
      [0, 0.75, 0.0],
      [0.32, 0.73, 0.01],
    ]),
    0.035,
    { color: LEATHER_DARK, caps: "flat", name: "wideBelt" },
  );

  box([0.16, 0.13, 0.055], [0, 0.73, 0.075], BRASS, hips, undefined, "beltBuckle");
  box([0.095, 0.075, 0.022], [0, 0.73, 0.109], BRASS_HI, hips, undefined, "buckleInset");
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      rivet([s * (0.24 + i * 0.045), 0.75, 0.04], hips);
      rivet([s * (0.24 + i * 0.045), 0.75, -0.03], hips);
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Torso, shoulders, apron, and back harness.

  b.sweep(spine, [0.27, 0.25, 0.22, 0.19], {
    color: TUNIC,
    section: { ngon: 8 },
    name: "stockyTorso",
  });

  box([0.68, 0.16, 0.34], [0, 1.12, 0.025], APRON, spine.joints[2], undefined, "apronBib");
  box([0.58, 0.25, 0.035], [0, 0.92, 0.17], APRON_HI, spine.joints[1], undefined, "apronLower");
  box([0.52, 0.035, 0.045], [0, 1.18, 0.21], LEATHER, spine.joints[2], undefined, "apronTopTrim");
  box([0.48, 0.035, 0.045], [0, 0.79, 0.19], LEATHER_DARK, hips, undefined, "apronBottomTrim");

  for (const s of [-1, 1]) {
    strap([s * 0.20, 0.91, 0.20], [s * 0.24, 1.18, 0.18], 0.07, LEATHER, spine.joints[1]);
    rivet([s * 0.205, 1.11, 0.225], spine.joints[2]);
    rivet([s * 0.235, 1.02, 0.225], spine.joints[2]);
  }

  // Shoulder plates.
  for (const s of [-1, 1]) {
    const shoulder = s < 0 ? armL.joints[0] : armR.joints[0];
    sphere(0.145, [s * 0.31, 1.16, 0.02], IRON, shoulder, [1.15, 0.72, 0.9], "shoulderPlate");
    box([0.18, 0.045, 0.24], [s * 0.31, 1.27, 0.04], STEEL, shoulder, undefined, "shoulderRim");
    rivet([s * 0.27, 1.20, 0.13], shoulder);
    rivet([s * 0.35, 1.20, 0.13], shoulder);
  }

  // Back crossed harness.
  strap([-0.25, 1.17, -0.10], [0.25, 0.76, -0.10], 0.055, LEATHER_DARK, spine.joints[1]);
  strap([0.25, 1.17, -0.10], [-0.25, 0.76, -0.10], 0.055, LEATHER_DARK, spine.joints[1]);

  // ------------------------------------------------------------------------------------------------
  // Arms, gauntlets, hands.

  b.sweep(armL, [0.105, 0.085, 0.065], {
    color: LEATHER,
    section: { ngon: 7 },
    name: "leftSleeveArm",
  });
  b.sweep(armR, [0.105, 0.085, 0.065], {
    color: LEATHER,
    section: { ngon: 7 },
    name: "rightSleeveArm",
  });

  for (const s of [-1, 1]) {
    const arm = s < 0 ? armL : armR;
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    const hand = arm.tip;

    sphere(0.095, [s * 0.38, 1.03, 0.17], LEATHER_DARK, elbow, [1.05, 0.8, 0.8], "elbowGuard");
    box([0.14, 0.09, 0.18], [s * 0.31, 0.86, 0.31], IRON, wrist, undefined, "wristCuff");
    box([0.16, 0.035, 0.19], [s * 0.31, 0.91, 0.32], STEEL, wrist, undefined, "wristRim");
    sphere(0.10, [s * 0.16, 0.70, 0.40], SKIN, hand, [1.1, 0.85, 0.85], "hand");
    for (let i = 0; i < 3; i++) {
      rod(
        [s * (0.11 + i * 0.04), 0.68, 0.45],
        [s * (0.10 + i * 0.04), 0.64, 0.48],
        0.018,
        SKIN_LIGHT,
        hand,
        "finger",
      );
    }
  }

  // Left hand holds a pair of tongs angled toward the anvil.
  rod([-0.18, 0.70, 0.41], [-0.12, 0.61, 0.57], 0.018, IRON, armL.tip, "tongsHandle");
  rod([-0.12, 0.61, 0.57], [-0.04, 0.58, 0.62], 0.014, STEEL, armL.tip, "tongsJaw");
  rod([-0.12, 0.61, 0.57], [-0.18, 0.58, 0.63], 0.014, STEEL, armL.tip, "tongsJaw");
  sphere(0.025, [-0.12, 0.61, 0.57], BRASS, armL.tip, undefined, "tongsHinge");

  // ------------------------------------------------------------------------------------------------
  // Head: broad skull, ears, nose, brows, eyes, mouth, and enormous beard.

  sphere(0.255, [0, 1.45, 0.10], SKIN, head, [1.08, 1.0, 0.88], "broadSkull");
  box([0.39, 0.12, 0.28], [0, 1.30, 0.18], SKIN_SHADOW, jaw, undefined, "lowerJaw");
  sphere(0.12, [0, 1.36, 0.29], SKIN_LIGHT, jaw, [1.2, 0.75, 0.75], "muzzle");
  sphere(0.055, [0, 1.39, 0.345], INK, jaw, [1.25, 0.68, 0.65], "nose");
  box([0.16, 0.025, 0.015], [0, 1.335, 0.355], INK, jaw, undefined, "mouthLine");

  for (const s of [-1, 1]) {
    sphere(0.075, [s * 0.12, 1.49, 0.285], CREAM, head, [1.0, 0.86, 0.35], "eyeWhite");
    sphere(0.038, [s * 0.12, 1.49, 0.312], IRON_DARK, head, [0.85, 0.9, 0.35], "eye");
    sphere(0.015, [s * 0.105, 1.51, 0.327], CREAM, head, undefined, "eyeGlint");
    box([0.13, 0.035, 0.045], [s * 0.12, 1.57, 0.285], HAIR, head, [s * 0.12, 0, 0], "heavyBrow");
    sphere(0.08, [s * 0.255, 1.46, 0.11], SKIN, head, [0.55, 1.2, 0.85], "ear");
    sphere(0.043, [s * 0.266, 1.46, 0.145], SKIN_SHADOW, head, [0.45, 1.0, 0.6], "earInner");
  }

  // Hair cap and sideburn blocks.
  sphere(0.265, [0, 1.54, 0.03], HAIR, head, [1.08, 0.68, 0.92], "hairCap");
  for (const s of [-1, 1]) {
    box([0.10, 0.27, 0.12], [s * 0.23, 1.42, 0.07], HAIR, head, undefined, "sideburn");
    sphere(0.105, [s * 0.19, 1.34, 0.22], BEARD, jaw, [0.8, 1.0, 0.75], "beardCheek");
  }

  // Beard as a rich layered silhouette.
  box([0.29, 0.25, 0.18], [0, 1.29, 0.23], BEARD, jaw, undefined, "beardMass");
  sphere(0.16, [0, 1.19, 0.23], BEARD, jaw, [1.35, 1.15, 0.85], "beardPoint");
  for (const s of [-1, 1]) {
    rod([s * 0.07, 1.38, 0.285], [s * 0.15, 1.22, 0.28], 0.035, BEARD_HI, jaw, "beardLock");
    rod([s * 0.16, 1.33, 0.26], [s * 0.22, 1.22, 0.24], 0.028, BEARD_HI, jaw, "beardLock");
    rod([s * 0.04, 1.25, 0.32], [s * 0.03, 1.11, 0.28], 0.027, BEARD_HI, jaw, "beardLock");
  }
  box([0.13, 0.035, 0.03], [0, 1.25, 0.34], BRASS, jaw, undefined, "beardClasp");
  rivet([-0.045, 1.25, 0.36], jaw);
  rivet([0.045, 1.25, 0.36], jaw);

  // Iconic horned smithing helmet.
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.28, 0.035],
      [0.23, 0.16],
      [0.18, 0.25],
      [0.0, 0.29],
    ],
    {
      at: [0, 1.57, 0.02],
      axis: [0, 1, 0],
      segments: 10,
      color: IRON,
      bone: head,
      name: "smithHelmet",
    },
  );
  box([0.54, 0.045, 0.33], [0, 1.43, 0.02], IRON_DARK, head, undefined, "helmetBrim");
  box([0.48, 0.035, 0.035], [0, 1.45, 0.19], BRASS, head, undefined, "helmetFrontBand");
  for (const s of [-1, 1]) {
    b.spike([s * 0.23, 1.52, 0.01], [s * 0.34, 1.72, -0.01], null, 0.055, {
      color: STEEL,
      bone: head,
      name: "helmetHorn",
      caps: { end: "point" },
    });
    rivet([s * 0.21, 1.47, 0.18], head);
  }

  // Copper goggles resting above the eyes.
  for (const s of [-1, 1]) {
    cyl(0.065, 0.025, [s * 0.12, 1.55, 0.30], COPPER, head, [0, 0, 1], "goggleRim");
    sphere(0.047, [s * 0.12, 1.55, 0.318], GLOW, head, [1, 1, 0.18], "goggleGlass");
  }
  rod([-0.055, 1.55, 0.31], [0.055, 1.55, 0.31], 0.014, COPPER, head, "goggleBridge");
  rod([-0.18, 1.55, 0.29], [-0.26, 1.52, 0.12], 0.012, COPPER, head, "goggleStrap");
  rod([0.18, 1.55, 0.29], [0.26, 1.52, 0.12], 0.012, COPPER, head, "goggleStrap");

  // Braided beard ornaments and hair beads.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      sphere(0.027, [s * (0.20 - i * 0.035), 1.33 - i * 0.045, 0.30], BRASS_HI, jaw, undefined, "beardBead");
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Hammer raised in the right hand: leather grip, steel haft collars, broad head.

  rod([0.15, 0.70, 0.40], [0.23, 1.12, 0.43], 0.028, LEATHER_DARK, armR.tip, "hammerHandle");
  for (let i = 0; i < 5; i++) {
    const y = 0.75 + i * 0.07;
    strap([0.15 + i * 0.016, y, 0.40], [0.17 + i * 0.016, y + 0.018, 0.40], 0.024, BRASS, armR.tip);
  }
  cyl(0.042, 0.055, [0.23, 1.10, 0.43], BRASS, armR.tip, [0, 1, 0], "hammerCollar");
  box([0.25, 0.18, 0.22], [0.23, 1.22, 0.43], STEEL, armR.tip, [0.15, 0, 0], "hammerHead");
  box([0.30, 0.035, 0.15], [0.23, 1.22, 0.43], STEEL_HI, armR.tip, [0.15, 0, 0], "hammerFace");
  box([0.21, 0.045, 0.18], [0.23, 1.315, 0.43], IRON_DARK, armR.tip, [0.15, 0, 0], "hammerTop");
  rivet([0.16, 1.22, 0.55], armR.tip);
  rivet([0.30, 1.22, 0.55], armR.tip);

  // ------------------------------------------------------------------------------------------------
  // The hero anvil in front of him.

  const anvilRoot = b.joint("anvilRoot", {
    at: [0, 0.03, 0.48],
    dir: [0, 1, 0],
    role: "hinge",
    group: "prop",
  });

  box([0.64, 0.10, 0.34], [0, 0.72, 0.48], STEEL, anvilRoot, undefined, "anvilFace");
  box([0.58, 0.035, 0.28], [0, 0.785, 0.48], STEEL_HI, anvilRoot, undefined, "anvilFaceTop");
  box([0.34, 0.37, 0.24], [0, 0.49, 0.48], IRON, anvilRoot, undefined, "anvilWaist");
  box([0.52, 0.10, 0.30], [0, 0.26, 0.48], IRON_DARK, anvilRoot, undefined, "anvilBase");
  box([0.78, 0.08, 0.38], [0, 0.18, 0.48], IRON, anvilRoot, undefined, "anvilFeet");
  for (const s of [-1, 1]) {
    box([0.16, 0.16, 0.34], [s * 0.28, 0.20, 0.48], IRON_DARK, anvilRoot, undefined, "anvilFoot");
    rivet([s * 0.28, 0.22, 0.67], anvilRoot);
    rivet([s * 0.28, 0.22, 0.29], anvilRoot);
  }

  // Square heel on one side and tapered horn projecting toward the viewer.
  box([0.18, 0.13, 0.22], [-0.40, 0.72, 0.48], STEEL, anvilRoot, undefined, "anvilHeel");
  b.spike(
    [0.25, 0.73, 0.48],
    [0.70, 0.73, 0.48],
    null,
    0.12,
    { color: STEEL, bone: anvilRoot, name: "anvilHorn", caps: { end: "point" } },
  );
  box([0.15, 0.06, 0.10], [0.0, 0.845, 0.48], STEEL_HI, anvilRoot, undefined, "anvilTopHighlight");
  for (const x of [-0.27, -0.09, 0.09, 0.27]) {
    rivet([x, 0.805, 0.34], anvilRoot);
    rivet([x, 0.805, 0.62], anvilRoot);
  }
  box([0.06, 0.02, 0.13], [0.08, 0.858, 0.48], IRON_DARK, anvilRoot, undefined, "anvilHardyHole");

  // A glowing hot billet on the anvil, held by the tongs.
  box([0.14, 0.075, 0.10], [-0.06, 0.86, 0.49], GLOW, anvilRoot, [0.05, 0.16, 0], "hotBillet");
  box([0.12, 0.025, 0.07], [-0.06, 0.905, 0.49], "#ffd36a", anvilRoot, [0.05, 0.16, 0], "hotBilletHighlight");

  // ------------------------------------------------------------------------------------------------
  // Smithing props: coal brazier behind the anvil, chimney, tools, and hanging apron pockets.

  const brazier = b.joint("brazier", {
    at: [-0.55, 0.03, 0.02],
    dir: [0, 1, 0],
    role: "hinge",
    group: "prop",
  });
  box([0.38, 0.08, 0.31], [-0.55, 0.07, 0.02], IRON_DARK, brazier, undefined, "brazierBase");
  box([0.30, 0.35, 0.24], [-0.55, 0.27, 0.02], IRON, brazier, undefined, "brazierBowl");
  box([0.34, 0.035, 0.29], [-0.55, 0.46, 0.02], IRON_DARK, brazier, undefined, "brazierRim");
  for (const s of [-1, 1]) {
    box([0.035, 0.46, 0.035], [-0.69, 0.27, 0.02], STEEL, brazier, undefined, "brazierLeg");
    box([0.035, 0.46, 0.035], [-0.41, 0.27, 0.02], STEEL, brazier, undefined, "brazierLeg");
  }
  sphere(0.11, [-0.55, 0.49, 0.02], RED, brazier, [1.3, 0.55, 1.0], "coalBed");
  sphere(0.075, [-0.59, 0.53, 0.04], GLOW, brazier, [1.2, 0.6, 1.0], "ember");
  sphere(0.045, [-0.49, 0.54, 0.02], "#ffe070", brazier, undefined, "ember");
  sphere(0.035, [-0.55, 0.56, -0.02], "#fff0a0", brazier, undefined, "ember");

  // Tool rack behind the character.
  box([0.09, 1.20, 0.08], [-0.70, 0.62, -0.18], LEATHER_DARK, hips, undefined, "toolRackPost");
  box([0.09, 1.20, 0.08], [0.70, 0.62, -0.18], LEATHER_DARK, hips, undefined, "toolRackPost");
  box([1.48, 0.08, 0.08], [0, 1.15, -0.18], LEATHER_DARK, hips, undefined, "toolRackBeam");
  for (const x of [-0.54, -0.28, 0.0, 0.28, 0.54]) {
    cyl(0.018, 0.12, [x, 1.05, -0.18], BRASS, hips, [0, 0, 1], "rackHook");
  }
  rod([-0.53, 1.02, -0.18], [-0.53, 0.65, -0.18], 0.028, IRON, hips, "hangingTongs");
  box([0.16, 0.07, 0.08], [-0.53, 0.62, -0.18], IRON, hips, undefined, "hangingTongsJaw");
  rod([-0.27, 1.03, -0.18], [-0.20, 0.67, -0.18], 0.025, LEATHER, hips, "hangingHammer");
  box([0.16, 0.11, 0.11], [-0.20, 0.60, -0.18], STEEL, hips, undefined, "hangingHammerHead");
  rod([0.02, 1.03, -0.18], [0.02, 0.68, -0.18], 0.022, STEEL, hips, "hangingPoker");
  b.spike([0.02, 0.68, -0.18], [0.02, 0.56, -0.18], null, 0.04, {
    color: STEEL,
    bone: hips,
    name: "pokerTip",
  });

  // Apron pockets and tools at the waist.
  for (const s of [-1, 1]) {
    box([0.15, 0.12, 0.035], [s * 0.19, 0.88, 0.205], LEATHER, spine.joints[1], undefined, "apronPocket");
    box([0.12, 0.025, 0.018], [s * 0.19, 0.945, 0.224], BRASS, spine.joints[1], undefined, "pocketTrim");
  }
  rod([0.28, 0.76, 0.08], [0.34, 0.47, 0.08], 0.014, STEEL, hips, "chisel");
  rod([0.34, 0.47, 0.08], [0.34, 0.40, 0.08], 0.026, LEATHER, hips, "chiselGrip");
  cyl(0.045, 0.11, [0.28, 0.66, 0.08], BRASS, hips, [0, 1, 0], "toolLoop");

  // A few exaggerated iron seams and decorative studs on the armor.
  for (const s of [-1, 1]) {
    box([0.035, 0.28, 0.025], [s * 0.30, 1.0, 0.24], BRASS, spine.joints[1], undefined, "armorTrim");
    for (let i = 0; i < 3; i++) {
      rivet([s * 0.30, 0.91 + i * 0.09, 0.255], spine.joints[1], BRASS_HI);
    }
  }

  // Ensure a few readable silhouette accents remain in model space.
  b.extrude(
    [
      [-0.16, 0],
      [-0.18, 0.10],
      [-0.12, 0.18],
      [0, 0.22, "sharp"],
      [0.12, 0.18],
      [0.18, 0.10],
      [0.16, 0],
    ],
    {
      at: [0, 1.55, -0.20],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      color: HAIR_HI,
      bone: head,
      name: "rearHairCrest",
    },
  );

  return b.root;
}
