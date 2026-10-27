import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description: "A charming kid wearing a handmade cardboard robot costume, complete with taped box armor, antenna, face screen, rivets, chest emblem, chunky boots, and playful craft details.",
};

export default function build() {
  const b = createBuilder({ name: "cardboardRobotKid", detail: 1 });

  const CARDBOARD = "#b9783f";
  const CARDBOARD_LIGHT = "#d79a58";
  const CARDBOARD_DARK = "#714321";
  const EDGE = "#4a2819";
  const TAPE = "#e8c879";
  const TAPE_DARK = "#ae8240";
  const PANEL = "#3d3029";
  const SCREEN = "#182f34";
  const SCREEN_GLOW = "#65d4c5";
  const EYE = "#f2d86b";
  const RED = "#c9503b";
  const BLUE = "#4388a0";
  const PANTS = "#35435a";
  const SHOE = "#272532";
  const SKIN = "#e8a47b";
  const WHITE = "#f8e9c6";

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      flat: true,
      name,
    });

  const cyl = (
    radius: number,
    depth: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    dir: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 8), color, {
      at,
      dir,
      bone,
      flat: true,
      name,
    });

  const rivet = (
    at: THREE.Vector3 | [number, number, number],
    color = TAPE,
    bone?: any,
    name = "rivet",
  ) =>
    b.part(new THREE.SphereGeometry(0.014, 6, 4), color, {
      at,
      bone,
      flat: true,
      name,
    });

  // ---------------------------------------------------------------------------
  // Skeleton first: one readable rest-pose root and named chains.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.77, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.77, 0],
      [0, 1.03, 0],
      [0, 1.28, 0],
    ]),
    {
      parent: hips,
      names: ["waist", "chest", "shoulder"],
      role: "spine",
    },
  );

  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 1.34, 0],
    dir: [0, 0.2, 0.1],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.48, 0.02],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.405, 0.16],
    dir: [0, -0.08, 0.35],
    role: "jaw",
    group: "face",
  });

  const legL = b.chain(
    "legL",
    [
      [0.145, 0.76, 0],
      [0.15, 0.47, 0.025],
      [0.15, 0.17, 0.06],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.15, 0, 0.09],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.145, 0.76, 0],
      [-0.15, 0.47, 0.025],
      [-0.15, 0.17, 0.06],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.15, 0, 0.09],
    },
  );

  const armL = b.chain(
    "armL",
    [
      [0.285, 1.28, 0],
      [0.43, 1.10, 0],
      [0.49, 0.91, 0.02],
    ],
    {
      parent: spine.tip!,
      names: ["shoulderL", "elbowL", "wristL"],
      role: "arm",
    },
  );

  const armR = b.chain(
    "armR",
    [
      [-0.285, 1.28, 0],
      [-0.43, 1.10, 0],
      [-0.49, 0.91, 0.02],
    ],
    {
      parent: spine.tip!,
      names: ["shoulderR", "elbowR", "wristR"],
      role: "arm",
    },
  );

  const antenna = b.joint("antenna", {
    parent: head,
    at: [0, 1.73, 0],
    dir: [0, 1, 0],
    role: "hinge",
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // Lower body: a small child hidden inside a big, homemade machine costume.
  // ---------------------------------------------------------------------------

  box([0.28, 0.22, 0.25], PANTS, [0.15, 0.66, 0.01], legL.joints[0], "pantsL");
  box([0.28, 0.22, 0.25], PANTS, [-0.15, 0.66, 0.01], legR.joints[0], "pantsR");

  b.sweep(legL, [0.095, 0.105], {
    color: CARDBOARD_DARK,
    section: "box",
    sides: 6,
    caps: "flat",
    name: "cardboardLegL",
  });
  b.sweep(legR, [0.095, 0.105], {
    color: CARDBOARD_DARK,
    section: "box",
    sides: 6,
    caps: "flat",
    name: "cardboardLegR",
  });

  box([0.25, 0.11, 0.36], SHOE, [0.15, 0.085, 0.09], legL.tip, "bootL");
  box([0.25, 0.11, 0.36], SHOE, [-0.15, 0.085, 0.09], legR.tip, "bootR");

  box([0.23, 0.035, 0.37], TAPE, [0.15, 0.143, 0.095], legL.tip, "bootTapeL");
  box([0.23, 0.035, 0.37], TAPE, [-0.15, 0.143, 0.095], legR.tip, "bootTapeR");

  // A front seam and toe marks make the boots read as folded cardboard.
  box([0.018, 0.095, 0.012], CARDBOARD_LIGHT, [0.15, 0.09, 0.275], legL.tip, "toeMarkL");
  box([0.018, 0.095, 0.012], CARDBOARD_LIGHT, [-0.15, 0.09, 0.275], legR.tip, "toeMarkR");

  // ---------------------------------------------------------------------------
  // Main costume box: oversized and slightly top-heavy like a real child-built suit.
  // ---------------------------------------------------------------------------

  box([0.65, 0.58, 0.42], CARDBOARD, [0, 1.06, 0], spine.joints[1], "bigTorsoBox");

  // Broad folded corner panels.
  box([0.025, 0.51, 0.44], CARDBOARD_DARK, [0.328, 1.06, 0], spine.joints[1], "torsoEdgeL");
  box([0.025, 0.51, 0.44], CARDBOARD_DARK, [-0.328, 1.06, 0], spine.joints[1], "torsoEdgeR");
  box([0.62, 0.025, 0.43], CARDBOARD_LIGHT, [0, 1.345, 0], spine.joints[1], "torsoTopFold");
  box([0.62, 0.025, 0.43], CARDBOARD_DARK, [0, 0.775, 0], spine.joints[0], "torsoBottomFold");

  // Packing tape crossing the box.
  box([0.075, 0.59, 0.012], TAPE, [0, 1.06, 0.216], spine.joints[1], "verticalFrontTape");
  box([0.64, 0.07, 0.012], TAPE_DARK, [0, 1.06, 0.222], spine.joints[1], "horizontalFrontTape");

  // Side labels and fake hand-written arrows.
  box([0.012, 0.15, 0.15], WHITE, [0.333, 1.19, 0.08], spine.joints[1], "sideLabelL");
  box([0.012, 0.15, 0.15], WHITE, [-0.333, 1.19, 0.08], spine.joints[1], "sideLabelR");
  box([0.014, 0.022, 0.10], EDGE, [0.341, 1.19, 0.08], spine.joints[1], "sideLabelMarkL");
  box([0.014, 0.022, 0.10], EDGE, [-0.341, 1.19, 0.08], spine.joints[1], "sideLabelMarkR");

  // Shoulder caps, like little folded cartons.
  box([0.17, 0.14, 0.31], CARDBOARD_LIGHT, [0.32, 1.29, 0], spine.tip, "shoulderCapL");
  box([0.17, 0.14, 0.31], CARDBOARD_LIGHT, [-0.32, 1.29, 0], spine.tip, "shoulderCapR");
  box([0.18, 0.025, 0.32], TAPE, [0.32, 1.36, 0], spine.tip, "shoulderTapeL");
  box([0.18, 0.025, 0.32], TAPE, [-0.32, 1.36, 0], spine.tip, "shoulderTapeR");

  // ---------------------------------------------------------------------------
  // Arms and mitten-like cardboard hands.
  // ---------------------------------------------------------------------------

  b.sweep(armL, [0.105, 0.11], {
    color: CARDBOARD_LIGHT,
    section: "box",
    caps: "flat",
    name: "boxArmL",
  });
  b.sweep(armR, [0.105, 0.11], {
    color: CARDBOARD_LIGHT,
    section: "box",
    caps: "flat",
    name: "boxArmR",
  });

  box([0.18, 0.18, 0.17], CARDBOARD, [0.49, 0.84, 0.03], armL.tip, "handBoxL");
  box([0.18, 0.18, 0.17], CARDBOARD, [-0.49, 0.84, 0.03], armR.tip, "handBoxR");

  // Tape cuffs.
  box([0.23, 0.035, 0.19], TAPE, [0.49, 0.94, 0.03], armL.tip, "cuffL");
  box([0.23, 0.035, 0.19], TAPE, [-0.49, 0.94, 0.03], armR.tip, "cuffR");

  // Tiny visible fingers peeking from the costume.
  for (const s of [1, -1]) {
    const hand = s > 0 ? armL.tip : armR.tip;
    for (let i = -1; i <= 1; i++) {
      box(
        [0.045, 0.085, 0.055],
        SKIN,
        [s * (0.49 + i * 0.048), 0.72, 0.075],
        hand,
        `finger${s > 0 ? "L" : "R"}${i}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Box helmet and expressive robot face.
  // ---------------------------------------------------------------------------

  box([0.47, 0.38, 0.40], CARDBOARD_LIGHT, [0, 1.53, 0.03], head, "helmetBox");
  box([0.49, 0.035, 0.42], CARDBOARD_DARK, [0, 1.72, 0.03], head, "helmetTopFold");
  box([0.035, 0.34, 0.42], CARDBOARD_DARK, [0.238, 1.53, 0.03], head, "helmetEdgeL");
  box([0.035, 0.34, 0.42], CARDBOARD_DARK, [-0.238, 1.53, 0.03], head, "helmetEdgeR");

  // Side ear-like bolts.
  for (const s of [1, -1]) {
    cyl(0.055, 0.035, TAPE_DARK, [s * 0.265, 1.56, 0.03], [s, 0, 0], head, "earBolt");
    rivet([s * 0.29, 1.56, 0.03], TAPE, head, "earRivet");
  }

  // Dark face screen, inset on the front.
  box([0.35, 0.19, 0.018], PANEL, [0, 1.57, 0.238], head, "faceScreenFrame");
  box([0.305, 0.145, 0.012], SCREEN, [0, 1.57, 0.251], head, "faceScreen");

  // Glowing square eyes and brows.
  box([0.075, 0.07, 0.012], EYE, [0.095, 1.59, 0.262], head, "eyeL");
  box([0.075, 0.07, 0.012], EYE, [-0.095, 1.59, 0.262], head, "eyeR");
  box([0.085, 0.016, 0.014], SCREEN_GLOW, [0.095, 1.645, 0.266], head, "browL");
  box([0.085, 0.016, 0.014], SCREEN_GLOW, [-0.095, 1.645, 0.266], head, "browR");
  box([0.022, 0.022, 0.014], SCREEN_GLOW, [0.095, 1.59, 0.268], head, "pupilL");
  box([0.022, 0.022, 0.014], SCREEN_GLOW, [-0.095, 1.59, 0.268], head, "pupilR");

  // Nose made from a little folded carton.
  box([0.07, 0.05, 0.06], CARDBOARD_DARK, [0, 1.52, 0.267], head, "noseBlock");

  // Separate jaw, with a happy open-screen mouth.
  box([0.34, 0.105, 0.29], CARDBOARD, [0, 1.38, 0.16], jaw, "lowerJaw");
  box([0.23, 0.048, 0.014], PANEL, [0, 1.405, 0.315], jaw, "mouthSlot");
  box([0.14, 0.022, 0.016], SCREEN_GLOW, [0, 1.405, 0.326], jaw, "mouthSmile");

  // ---------------------------------------------------------------------------
  // Antenna, chest controls, emblem, screws, and handmade labels.
  // ---------------------------------------------------------------------------

  b.rod([0, 1.70, 0.03], [0, 1.86, 0.03], 0.018, {
    color: TAPE_DARK,
    bone: antenna,
    name: "antennaStem",
  });
  cyl(0.055, 0.075, RED, [0, 1.91, 0.03], [0, 1, 0], antenna, "antennaLamp");
  cyl(0.026, 0.078, WHITE, [0, 1.91, 0.03], [0, 1, 0], antenna, "antennaHighlight");

  // Chest control panel frame and display.
  box([0.31, 0.19, 0.025], PANEL, [0, 1.12, 0.222], spine.joints[1], "controlPanel");
  box([0.19, 0.08, 0.014], SCREEN, [0.02, 1.16, 0.239], spine.joints[1], "controlDisplay");
  box([0.13, 0.014, 0.012], SCREEN_GLOW, [0.02, 1.174, 0.248], spine.joints[1], "displayBar");
  box([0.05, 0.05, 0.014], RED, [-0.105, 1.16, 0.239], spine.joints[1], "redButton");
  box([0.05, 0.05, 0.014], BLUE, [0.105, 1.16, 0.239], spine.joints[1], "blueButton");

  // Chest warning stripes.
  for (let i = -2; i <= 2; i++) {
    box([0.028, 0.008, 0.014], TAPE, [i * 0.043, 0.925, 0.229], spine.joints[1], "warningStripe");
  }

  // A raised cardboard star emblem.
  const star: [number, number][] = [
    [0, 0.105],
    [0.026, 0.032],
    [0.102, 0.032],
    [0.042, -0.012],
    [0.065, -0.09],
    [0, -0.04],
    [-0.065, -0.09],
    [-0.042, -0.012],
    [-0.102, 0.032],
    [-0.026, 0.032],
  ];
  b.extrude(star, {
    at: [0, 1.02, 0.235],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.018,
    bevel: 0.004,
    color: TAPE,
    bone: spine.joints[1],
    name: "chestStar",
  });

  // Corner rivets and bright craft fasteners.
  const torsoRivets: [number, number][] = [
    [-0.28, 1.30],
    [0.28, 1.30],
    [-0.28, 0.82],
    [0.28, 0.82],
    [-0.29, 1.05],
    [0.29, 1.05],
  ];
  for (const [x, y] of torsoRivets) rivet([x, y, 0.232], TAPE, spine.joints[1], "torsoRivet");

  // Little hand-drawn "MODEL KID-01" label made from block strips.
  box([0.16, 0.012, 0.012], EDGE, [0.17, 0.875, 0.232], spine.joints[1], "labelLine1");
  box([0.11, 0.012, 0.012], EDGE, [-0.18, 0.875, 0.232], spine.joints[1], "labelLine2");
  box([0.012, 0.055, 0.012], EDGE, [0.02, 0.87, 0.233], spine.joints[1], "labelTick");

  // Thin rear shoulder straps, giving the costume a convincing wearable silhouette.
  box([0.055, 0.38, 0.025], TAPE_DARK, [0.23, 1.08, -0.225], spine.joints[1], "backStrapL");
  box([0.055, 0.38, 0.025], TAPE_DARK, [-0.23, 1.08, -0.225], spine.joints[1], "backStrapR");

  // Small cardboard tabs sticking out from the sides.
  box([0.09, 0.06, 0.025], TAPE, [0.38, 1.00, 0], spine.joints[1], "sideTabL");
  box([0.09, 0.06, 0.025], TAPE, [-0.38, 1.00, 0], spine.joints[1], "sideTabR");

  return b.root;
}
