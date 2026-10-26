```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A charming child hiding inside a handmade cardboard robot costume, with chunky box armor, taped seams, expressive panel eyes, antenna, controls, claws, and corrugated craft details.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = "#b9783f";
  const CARDBOARD_LIGHT = "#d59655";
  const CARDBOARD_DARK = "#754323";
  const EDGE = "#59311f";
  const TAPE = "#e5bd71";
  const TAPE_LIGHT = "#f2d58c";
  const INK = "#241923";
  const SCREEN = "#173e42";
  const SCREEN_LIGHT = "#56c6b4";
  const EYE = "#ffd447";
  const EYE_HIGHLIGHT = "#fff2a0";
  const RED = "#d74432";
  const BLUE = "#3886b8";
  const WHITE = "#f4e9cf";
  const RUBBER = "#322d32";
  const METAL = "#9b9a86";
  const DIRT = "#4d2c1d";

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      dir,
      bone,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const frontPlate = (
    size: [number, number, number],
    at: [number, number, number],
    color = CARDBOARD_LIGHT,
    name = "frontPlate",
  ) => box(size, color, at, undefined, name);

  // -----------------------------------------------------------------------------------------------
  // Skeleton first: a neutral, readable child-sized humanoid puppet.

  const hips = b.joint("hips", {
    at: [0, 0.98, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.joint("spine", {
    parent: hips,
    at: [0, 1.25, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const neck = b.joint("neck", {
    parent: spine,
    at: [0, 1.67, 0],
    dir: [0, 1, 0],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.86, 0],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.72, 0.1],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const legL = b.chain(
    "legL",
    catmull([
      [0.19, 0.92, 0],
      [0.2, 0.58, 0.015],
      [0.19, 0.2, 0.03],
      [0.19, 0.12, 0.12],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.19, 0, 0.16],
    },
  );

  const legR = b.chain(
    "legR",
    catmull([
      [-0.19, 0.92, 0],
      [-0.2, 0.58, 0.015],
      [-0.19, 0.2, 0.03],
      [-0.19, 0.12, 0.12],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.19, 0, 0.16],
    },
  );

  const armL = b.chain(
    "armL",
    catmull([
      [0.43, 1.51, 0],
      [0.63, 1.3, 0],
      [0.68, 1.04, 0.02],
      [0.68, 0.88, 0.11],
    ]),
    {
      parent: spine,
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
    },
  );

  const armR = b.chain(
    "armR",
    catmull([
      [-0.43, 1.51, 0],
      [-0.63, 1.3, 0],
      [-0.68, 1.04, 0.02],
      [-0.68, 0.88, 0.11],
    ]),
    {
      parent: spine,
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
    },
  );

  // -----------------------------------------------------------------------------------------------
  // Legs: handmade cardboard boots, folded shin armor, and dark soles.

  b.sweep(legL, [0.115, 0.12], {
    color: CARDBOARD,
    section: "box",
    sides: 6,
    skin: "rigid",
    caps: "flat",
    name: "legArmorL",
    group: "legs",
  });
  b.sweep(legR, [0.115, 0.12], {
    color: CARDBOARD,
    section: "box",
    sides: 6,
    skin: "rigid",
    caps: "flat",
    name: "legArmorR",
    group: "legs",
  });

  for (const s of [1, -1]) {
    const x = s * 0.19;

    box([0.26, 0.07, 0.3], RUBBER, [x, 0.055, 0.13], s > 0 ? legL.tip : legR.tip, "rubberSole");
    box([0.27, 0.16, 0.34], CARDBOARD_DARK, [x, 0.14, 0.1], s > 0 ? legL.tip : legR.tip, "boot");
    box([0.285, 0.035, 0.355], TAPE, [x, 0.205, 0.1], s > 0 ? legL.joints[2] : legR.joints[2], "bootTopTape");

    box([0.025, 0.25, 0.015], EDGE, [x - s * 0.115, 0.55, 0.125], s > 0 ? legL.joints[1] : legR.joints[1], "shinSeam");
    box([0.025, 0.2, 0.016], TAPE_LIGHT, [x + s * 0.118, 0.62, 0.125], s > 0 ? legL.joints[1] : legR.joints[1], "shinTape");

    // Three little tread blocks on each sole.
    for (let i = 0; i < 3; i++) {
      box(
        [0.19, 0.018, 0.045],
        EDGE,
        [x, 0.018, 0.025 + i * 0.09],
        s > 0 ? legL.tip : legR.tip,
        "soleTread",
      );
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Box torso: oversized costume carton with folded corners, tape, panel, and rivets.

  box([0.92, 0.82, 0.58], CARDBOARD, [0, 1.27, 0], spine, "mainCardboardTorso");
  box([0.84, 0.74, 0.018], CARDBOARD_LIGHT, [0, 1.29, 0.302], spine, "frontCardboardFace");

  // Broad central packing tape.
  box([0.105, 0.78, 0.022], TAPE, [0, 1.28, 0.316], spine, "verticalPackingTape");
  box([0.87, 0.09, 0.024], TAPE_LIGHT, [0, 1.53, 0.32], spine, "horizontalPackingTape");

  // Folded vertical edges.
  for (const x of [-0.455, 0.455]) {
    box([0.025, 0.82, 0.035], EDGE, [x, 1.27, 0.3], spine, "boxFold");
    box([0.025, 0.74, 0.025], TAPE_LIGHT, [x * 0.98, 1.27, -0.3], spine, "backFold");
  }

  // Chest control panel, inset dark screen, and three colorful buttons.
  box([0.52, 0.31, 0.035], EDGE, [0, 1.34, 0.337], spine, "controlPanelShadow");
  box([0.47, 0.26, 0.025], SCREEN, [0, 1.35, 0.36], spine, "controlPanel");
  box([0.33, 0.12, 0.012], SCREEN_LIGHT, [0, 1.405, 0.378], spine, "screenGlow");
  box([0.21, 0.018, 0.012], WHITE, [0, 1.42, 0.386], spine, "screenLine");

  for (const [i, color] of [RED, EYE, BLUE].entries()) {
    cyl(0.045, 0.025, EDGE, [0.2 - i * 0.2, 1.235, 0.365], [0, 0, 1], spine, "buttonSocket");
    cyl(0.031, 0.028, color, [0.2 - i * 0.2, 1.235, 0.382], [0, 0, 1], spine, "coloredButton");
  }

  // Chest bolts and little printed warning bars.
  for (const x of [-0.37, 0.37]) {
    sphere(0.027, METAL, [x, 1.58, 0.34], spine, "chestRivet");
    sphere(0.027, METAL, [x, 0.96, 0.34], spine, "chestRivet");
  }
  for (let i = 0; i < 5; i++) {
    box([0.045, 0.012, 0.008], i % 2 ? RED : TAPE, [-0.34 + i * 0.075, 1.04, 0.348], spine, "warningStripe");
  }

  // Side flaps and bottom hem.
  box([0.055, 0.58, 0.52], CARDBOARD_DARK, [0.48, 1.27, 0], spine, "leftSideFlap");
  box([0.055, 0.58, 0.52], CARDBOARD_DARK, [-0.48, 1.27, 0], spine, "rightSideFlap");
  box([0.87, 0.045, 0.61], EDGE, [0, 0.86, 0], spine, "torsoBottomFold");

  // -----------------------------------------------------------------------------------------------
  // Shoulders and arms: corrugated sleeves, elbow bands, and mitten-like robot claws.

  b.sweep(armL, [0.12, 0.13], {
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "flat",
    name: "armArmorL",
    group: "arms",
  });
  b.sweep(armR, [0.12, 0.13], {
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "flat",
    name: "armArmorR",
    group: "arms",
  });

  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR;
    const shoulderX = s * 0.48;
    const handX = s * 0.68;

    box([0.22, 0.2, 0.62], CARDBOARD_LIGHT, [shoulderX, 1.5, 0], spine, "shoulderBox");
    box([0.035, 0.18, 0.48], TAPE, [shoulderX + s * 0.11, 1.5, 0], spine, "shoulderTape");
    box([0.27, 0.055, 0.035], EDGE, [shoulderX, 1.39, 0.32], spine, "shoulderFrontFold");

    box([0.28, 0.055, 0.035], TAPE, [s * 0.64, 1.2, 0.14], arm.joints[1], "elbowBand");
    box([0.22, 0.045, 0.035], EDGE, [s * 0.675, 0.98, 0.18], arm.joints[2], "wristBand");

    box([0.27, 0.22, 0.26], CARDBOARD_DARK, [handX, 0.87, 0.12], arm.tip, "squareHand");
    box([0.23, 0.12, 0.035], EDGE, [handX, 0.79, 0.26], arm.tip, "palmShadow");

    // Three raised cardboard fingers, separated so the silhouette reads as a robot claw.
    for (let i = 0; i < 3; i++) {
      const fx = handX + s * (i - 1) * 0.075;
      box([0.055, 0.19, 0.08], CARDBOARD_LIGHT, [fx, 0.72, 0.17], arm.tip, "clawFinger");
      box([0.06, 0.018, 0.085], EDGE, [fx, 0.625, 0.17], arm.tip, "clawTip");
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Neck collar and oversized head carton.

  box([0.33, 0.16, 0.32], EDGE, [0, 1.68, 0], neck, "neckShadow");
  box([0.37, 0.055, 0.36], TAPE, [0, 1.73, 0], neck, "neckTape");

  box([0.68, 0.58, 0.62], CARDBOARD, [0, 1.9, 0], head, "robotHeadBox");
  box([0.61, 0.5, 0.028], CARDBOARD_LIGHT, [0, 1.91, 0.326], head, "headFrontFace");

  // Head corner guards, top seam, and side tape.
  for (const x of [-0.34, 0.34]) {
    box([0.035, 0.57, 0.045], EDGE, [x, 1.9, 0.3], head, "headCornerFold");
    box([0.045, 0.54, 0.035], TAPE, [x * 0.97, 1.9, 0.33], head, "headCornerTape");
  }
  box([0.68, 0.045, 0.045], TAPE_LIGHT, [0, 2.185, 0], head, "headTopTape");
  box([0.035, 0.5, 0.045], TAPE_LIGHT, [0, 1.9, -0.33], head, "headBackTape");

  // Ears made from stacked cardboard discs and square brackets.
  for (const s of [1, -1]) {
    const x = s * 0.39;
    box([0.12, 0.2, 0.16], CARDBOARD_DARK, [x, 1.91, 0], head, "earBracket");
    cyl(0.095, 0.06, TAPE, [x + s * 0.07, 1.91, 0], [1, 0, 0], head, "earCap");
    cyl(0.052, 0.067, RED, [x + s * 0.105, 1.91, 0], [1, 0, 0], head, "earIndicator");
  }

  // -----------------------------------------------------------------------------------------------
  // Face: brow bar, glowing-looking yellow eyes, pupils, highlights, muzzle and grille mouth.

  box([0.58, 0.27, 0.035], EDGE, [0, 1.985, 0.354], head, "faceVisorShadow");
  box([0.52, 0.21, 0.025], SCREEN, [0, 1.985, 0.377], head, "faceVisor");

  for (const s of [1, -1]) {
    const x = s * 0.145;
    box([0.155, 0.14, 0.025], EYE, [x, 2.0, 0.398], head, "squareEye");
    box([0.055, 0.11, 0.018], INK, [x, 2.0, 0.42], head, "eyePupil");
    box([0.025, 0.035, 0.012], EYE_HIGHLIGHT, [x - s * 0.04, 2.045, 0.433], head, "eyeGlint");
    box([0.19, 0.025, 0.025], CARDBOARD_DARK, [x, 2.105, 0.4], head, "eyebrow");
  }

  // Nose made from a folded carton tab.
  box([0.11, 0.1, 0.09], CARDBOARD_LIGHT, [0, 1.9, 0.42], head, "paperNose");
  box([0.08, 0.025, 0.02], EDGE, [0, 1.87, 0.47], head, "noseFold");

  // Separate upper and lower jaw pieces, with an open expressive grille.
  box([0.42, 0.11, 0.08], CARDBOARD_DARK, [0, 1.77, 0.36], jaw, "upperJaw");
  box([0.4, 0.1, 0.08], CARDBOARD, [0, 1.66, 0.36], jaw, "lowerJaw");
  box([0.31, 0.07, 0.025], INK, [0, 1.735, 0.414], jaw, "mouthOpening");
  for (let i = 0; i < 5; i++) {
    box([0.018, 0.065, 0.018], TAPE_LIGHT, [-0.12 + i * 0.06, 1.735, 0.435], jaw, "mouthGrille");
  }

  // Cheek rivets and a tiny handmade serial label.
  for (const s of [1, -1]) {
    sphere(0.025, METAL, [s * 0.285, 1.84, 0.39], head, "cheekRivet");
    sphere(0.018, RED, [s * 0.285, 1.98, 0.39], head, "cheekLight");
  }
  box([0.19, 0.06, 0.012], WHITE, [0.21, 1.745, 0.42], head, "serialLabel");
  for (let i = 0; i < 4; i++) {
    box([0.012, 0.028, 0.009], INK, [0.145 + i * 0.035, 1.745, 0.431], head, "serialMark");
  }

  // -----------------------------------------------------------------------------------------------
  // Antenna: two nested cardboard tubes, a glowing yellow cap, and a little warning flag.

  cyl(0.045, 0.12, EDGE, [0, 2.25, 0], [0, 1, 0], head, "antennaSocket");
  cyl(0.025, 0.22, CARDBOARD_DARK, [0, 2.4, 0], [0, 1, 0], head, "antennaStem");
  sphere(0.07, RED, [0, 2.54, 0], head, "antennaLamp");
  sphere(0.038, EYE_HIGHLIGHT, [0, 2.565, 0.035], head, "antennaLampGlint");
  box([0.15, 0.1, 0.018], TAPE, [0.09, 2.39, 0.015], head, "antennaFlag");
  box([0.035, 0.018, 0.02], RED, [0.09, 2.39, 0.028], head, "antennaFlagMark");

  // -----------------------------------------------------------------------------------------------
  // Cardboard craft finishing: corrugation ribs, edge tabs, labels, and wear marks.

  // Horizontal corrugation lines across the torso sides and head.
  for (let i = 0; i < 6; i++) {
    const y = 1.03 + i * 0.095;
    box([0.018, 0.018, 0.43], CARDBOARD_DARK, [0.49, y, -0.02], spine, "corrugationSideL");
    box([0.018, 0.018, 0.43], CARDBOARD_DARK, [-0.49, y, -0.02], spine, "corrugationSideR");
  }
  for (let i = 0; i < 5; i++) {
    const y = 1.72 + i * 0.095;
    box([0.02, 0.018, 0.24], CARDBOARD_DARK, [0.36, y, 0.02], head, "headCorrugation");
    box([0.02, 0.018, 0.24], CARDBOARD_DARK, [-0.36, y, 0.02], head, "headCorrugation");
  }

  // Small folded tabs around the costume openings.
  for (const s of [1, -1]) {
    box([0.08, 0.12, 0.025], TAPE_LIGHT, [s * 0.36, 0.91, 0.3], spine, "hipTab");
    box([0.08, 0.12, 0.025], TAPE_LIGHT, [s * 0.3, 1.67, 0.3], spine, "shoulderTab");
  }

  // Hand-drawn arrow, barcode, and "ROBOT" chest lettering built from tiny flat strips.
  box([0.16, 0.018, 0.01], INK, [0.2, 1.115, 0.37], spine, "labelLine");
  box([0.018, 0.08, 0.01], INK, [0.13, 1.16, 0.37], spine, "labelArrow");
  box([0.018, 0.08, 0.01], INK, [0.27, 1.16, 0.37], spine, "labelArrow");
  for (let i = 0; i < 7; i++) {
    box([0.008 + (i % 2) * 0.006, 0.065, 0.008], INK, [-0.36 + i * 0.032, 1.11, 0.37], spine, "barcode");
  }

  // Scuffed corners and deliberately imperfect dark patches sell the cardboard construction.
  for (const p of [
    [0.41, 1.59, 0.335],
    [-0.41, 1.02, 0.335],
    [0.31, 2.13, 0.365],
    [-0.3, 1.74, 0.365],
    [0.24, 0.27, 0.19],
    [-0.24, 0.42, 0.19],
  ] as [number, number, number][]) {
    box([0.07, 0.025, 0.012], DIRT, p, spine, "cardboardScuff");
  }

  // A small dangling pull-cord at the back/side of the costume.
  b.rod([0.45, 1.1, -0.28], [0.52, 0.86, -0.32], 0.012, {
    color: EDGE,
    bone: spine,
    name: "pullCord",
  });
  sphere(0.035, TAPE, [0.52, 0.84, -0.32], spine, "pullCordHandle");

  return b.root;
}
```