import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "cardboard-box-robot-kid",
  description: "A cheerful child wearing a handmade cardboard-box robot costume, with chunky limbs, a glowing-looking face panel, knobs, seams, antenna, and corrugated craft details.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = "#b9783f";
  const CARDBOARD_LIGHT = "#d79a59";
  const CARDBOARD_DARK = "#754225";
  const EDGE = "#4b2919";
  const INNER = "#3b2621";
  const SCREEN = "#172c32";
  const SCREEN_GLOW = "#66d6c4";
  const SCREEN_GLOW_DARK = "#2b867d";
  const METAL = "#8a8d82";
  const METAL_DARK = "#464941";
  const RED = "#d74b35";
  const YELLOW = "#f0bc42";
  const BLUE = "#478ab5";
  const SKIN = "#e8a06d";
  const HAIR = "#4a2819";
  const SHOE = "#30251f";

  // ---------------------------------------------------------------------------
  // Skeleton first: a child-sized, readable neutral pose.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.76, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const torsoPath = catmull([
    [0, 0.76, 0],
    [0, 1.03, 0.01],
    [0, 1.28, 0.02],
    [0, 1.43, 0.03],
  ]);
  const spine = b.chain("spine", torsoPath, {
    parent: hips,
    names: ["waist", "chest", "shoulder"],
    role: "spine",
  });

  const neck = b.chain(
    "neck",
    [
      [0, 1.43, 0.03],
      [0, 1.55, 0.06],
      [0, 1.66, 0.08],
    ],
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.69, 0.1],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.58, 0.2],
    dir: [0, 0.2, 1],
    role: "jaw",
    group: "head",
  });

  const leftLeg = b.chain(
    "leftLeg",
    [
      [0.15, 0.73, 0],
      [0.17, 0.48, 0.035],
      [0.16, 0.17, 0.08],
      [0.16, 0.105, 0.16],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.16, 0, 0.18],
    },
  );

  const rightLeg = b.chain(
    "rightLeg",
    [
      [-0.15, 0.73, 0],
      [-0.17, 0.48, 0.035],
      [-0.16, 0.17, 0.08],
      [-0.16, 0.105, 0.16],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.16, 0, 0.18],
    },
  );

  const leftArm = b.chain(
    "leftArm",
    [
      [0.39, 1.34, 0.02],
      [0.58, 1.22, 0.03],
      [0.72, 0.98, 0.08],
      [0.77, 0.84, 0.12],
    ],
    {
      parent: spine.tip,
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
    },
  );

  const rightArm = b.chain(
    "rightArm",
    [
      [-0.39, 1.34, 0.02],
      [-0.58, 1.22, 0.03],
      [-0.72, 0.98, 0.08],
      [-0.77, 0.84, 0.12],
    ],
    {
      parent: spine.tip,
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
    },
  );

  // ---------------------------------------------------------------------------
  // Reusable craft helpers.
  // ---------------------------------------------------------------------------

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: any,
    name: string,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });
  };

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    bone: any,
    name: string,
    radial = 8,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      bone,
      name,
      flat: true,
    });
  };

  const rivet = (at: [number, number, number], color = METAL, name = "rivet") =>
    b.part(new THREE.SphereGeometry(0.018, 6, 4), color, {
      at,
      name,
      flat: true,
    });

  const seam = (
    at: [number, number, number],
    size: [number, number, number],
    bone: any,
    name: string,
  ) => box(size, EDGE, at, bone, name);

  const button = (
    at: [number, number, number],
    color: string,
    bone: any,
    name: string,
  ) => {
    cylinder(0.035, 0.018, EDGE, at, bone, `${name}Socket`, 8);
    return b.part(new THREE.SphereGeometry(0.028, 8, 5), color, {
      at: [at[0], at[1], at[2] + 0.016],
      bone,
      name,
      flat: true,
    });
  };

  // ---------------------------------------------------------------------------
  // Legs: visible child underneath the costume.
  // ---------------------------------------------------------------------------

  b.sweep(leftLeg, [0.075, 0.065], {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "leftLeg",
    group: "child",
  });
  b.sweep(rightLeg, [0.075, 0.065], {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "rightLeg",
    group: "child",
  });

  box([0.20, 0.105, 0.33], SHOE, [0.16, 0.055, 0.16], leftLeg.tip, "shoeL");
  box([0.20, 0.105, 0.33], SHOE, [-0.16, 0.055, 0.16], rightLeg.tip, "shoeR");
  box([0.19, 0.025, 0.34], CARDBOARD_LIGHT, [0.16, 0.105, 0.16], leftLeg.tip, "soleL");
  box([0.19, 0.025, 0.34], CARDBOARD_LIGHT, [-0.16, 0.105, 0.16], rightLeg.tip, "soleR");

  // ---------------------------------------------------------------------------
  // Arms and mitten-like hands.
  // ---------------------------------------------------------------------------

  b.sweep(leftArm, (t) => 0.075 - t * 0.025, {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "leftArm",
    group: "child",
  });
  b.sweep(rightArm, (t) => 0.075 - t * 0.025, {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "rightArm",
    group: "child",
  });

  box([0.18, 0.16, 0.18], CARDBOARD_LIGHT, [0.78, 0.83, 0.13], leftArm.tip, "mittenL");
  box([0.18, 0.16, 0.18], CARDBOARD_LIGHT, [-0.78, 0.83, 0.13], rightArm.tip, "mittenR");
  box([0.16, 0.045, 0.19], EDGE, [0.78, 0.91, 0.13], leftArm.tip, "mittenPalmL");
  box([0.16, 0.045, 0.19], EDGE, [-0.78, 0.91, 0.13], rightArm.tip, "mittenPalmR");

  // Finger seams make the cardboard gloves readable.
  for (const s of [1, -1]) {
    seam([s * 0.745, 0.84, 0.224], [0.012, 0.11, 0.008], s > 0 ? leftArm.tip : rightArm.tip, "fingerSeam");
    seam([s * 0.795, 0.84, 0.224], [0.012, 0.11, 0.008], s > 0 ? leftArm.tip : rightArm.tip, "fingerSeam");
  }

  // ---------------------------------------------------------------------------
  // Main costume: a large warm corrugated box with open bottom.
  // ---------------------------------------------------------------------------

  box([0.83, 0.70, 0.54], CARDBOARD, [0, 1.105, 0.035], spine.tip, "torsoBox");
  box([0.80, 0.035, 0.50], CARDBOARD_LIGHT, [0, 1.455, 0.035], spine.tip, "topFlap");
  box([0.82, 0.035, 0.51], CARDBOARD_DARK, [0, 0.755, 0.035], hips, "bottomFold");

  // Front panel border and vertical corrugation.
  seam([0, 1.105, 0.314], [0.78, 0.025, 0.018], spine.tip, "frontTopSeam");
  seam([0, 0.755, 0.314], [0.78, 0.025, 0.018], hips, "frontBottomSeam");
  seam([0.405, 1.105, 0.31], [0.025, 0.67, 0.018], spine.tip, "frontEdgeL");
  seam([-0.405, 1.105, 0.31], [0.025, 0.67, 0.018], spine.tip, "frontEdgeR");

  for (let i = -3; i <= 3; i++) {
    const x = i * 0.095;
    box([0.012, 0.56, 0.012], CARDBOARD_LIGHT, [x, 1.105, 0.322], spine.tip, `corrugation${i}`);
  }

  // Side flap tabs.
  box([0.13, 0.24, 0.025], CARDBOARD_LIGHT, [0.455, 1.25, 0.02], spine.tip, "sideTabL");
  box([0.13, 0.24, 0.025], CARDBOARD_LIGHT, [-0.455, 1.25, 0.02], spine.tip, "sideTabR");
  seam([0.455, 1.25, 0.039], [0.09, 0.018, 0.012], spine.tip, "tabFoldL");
  seam([-0.455, 1.25, 0.039], [0.09, 0.018, 0.012], spine.tip, "tabFoldR");

  // Chest control panel, layered like a handmade appliance.
  box([0.46, 0.25, 0.035], EDGE, [0, 1.12, 0.344], spine.tip, "controlPanelBorder");
  box([0.42, 0.21, 0.025], CARDBOARD_DARK, [0, 1.12, 0.366], spine.tip, "controlPanel");
  box([0.18, 0.105, 0.018], SCREEN, [0, 1.165, 0.383], spine.tip, "chestDisplay");
  box([0.13, 0.015, 0.012], SCREEN_GLOW, [0, 1.165, 0.396], spine.tip, "displayBar");
  button([0.16, 1.075, 0.382], RED, spine.tip, "redButton");
  button([-0.16, 1.075, 0.382], YELLOW, spine.tip, "yellowButton");
  button([0.16, 1.18, 0.382], BLUE, spine.tip, "blueButton");
  button([-0.16, 1.18, 0.382], SCREEN_GLOW, spine.tip, "greenButton");

  // Rivets around chest panel.
  for (const x of [-0.205, 0.205]) {
    for (const y of [1.03, 1.21]) rivet([x, y, 0.394], METAL, "panelRivet");
  }

  // ---------------------------------------------------------------------------
  // Head box, neck collar, face screen, ears, and cardboard hair.
  // ---------------------------------------------------------------------------

  cylinder(0.105, 0.10, CARDBOARD_DARK, [0, 1.57, 0.06], neck.tip, "neckCollar", 8);
  box([0.70, 0.52, 0.58], CARDBOARD_LIGHT, [0, 1.79, 0.10], head, "headBox");
  box([0.66, 0.035, 0.54], CARDBOARD, [0, 2.055, 0.10], head, "headTopFlap");
  seam([0, 1.54, 0.405], [0.62, 0.025, 0.02], head, "chinFold");
  seam([0.345, 1.79, 0.10], [0.025, 0.45, 0.02], head, "headEdgeL");
  seam([-0.345, 1.79, 0.10], [0.025, 0.45, 0.02], head, "headEdgeR");

  // Dark front faceplate and inset luminous-looking expression.
  box([0.49, 0.25, 0.025], EDGE, [0, 1.80, 0.405], head, "faceplateBorder");
  box([0.455, 0.215, 0.018], SCREEN, [0, 1.80, 0.425], head, "faceScreen");
  box([0.10, 0.055, 0.012], SCREEN_GLOW, [0.125, 1.84, 0.441], head, "eyeL");
  box([0.10, 0.055, 0.012], SCREEN_GLOW, [-0.125, 1.84, 0.441], head, "eyeR");
  box([0.13, 0.018, 0.012], SCREEN_GLOW_DARK, [0, 1.75, 0.441], head, "mouthBase");
  box([0.035, 0.016, 0.012], SCREEN_GLOW, [-0.06, 1.75, 0.451], head, "mouthPixelL");
  box([0.035, 0.016, 0.012], SCREEN_GLOW, [0.00, 1.75, 0.451], head, "mouthPixelC");
  box([0.035, 0.016, 0.012], SCREEN_GLOW, [0.06, 1.75, 0.451], head, "mouthPixelR");

  // Brows and cheek stickers.
  box([0.135, 0.025, 0.018], CARDBOARD_DARK, [0.125, 1.91, 0.442], head, "browL");
  box([0.135, 0.025, 0.018], CARDBOARD_DARK, [-0.125, 1.91, 0.442], head, "browR");
  box([0.045, 0.045, 0.012], RED, [0.275, 1.68, 0.442], head, "cheekStickerL");
  box([0.045, 0.045, 0.012], BLUE, [-0.275, 1.68, 0.442], head, "cheekStickerR");

  // Box ears with bolts.
  box([0.13, 0.28, 0.10], CARDBOARD, [0.40, 1.80, 0.10], head, "earL");
  box([0.13, 0.28, 0.10], CARDBOARD, [-0.40, 1.80, 0.10], head, "earR");
  box([0.07, 0.16, 0.018], CARDBOARD_DARK, [0.47, 1.80, 0.10], head, "earStripeL");
  box([0.07, 0.16, 0.018], CARDBOARD_DARK, [-0.47, 1.80, 0.10], head, "earStripeR");
  rivet([0.40, 1.80, 0.16], METAL, "earBoltL");
  rivet([-0.40, 1.80, 0.16], METAL, "earBoltR");

  // A little fringe of real hair peeking beneath the box helmet.
  for (const x of [-0.24, -0.12, 0, 0.12, 0.24]) {
    const h = x === 0 ? 0.12 : 0.085;
    b.part(new THREE.ConeGeometry(0.045, h, 5), HAIR, {
      at: [x, 1.535, 0.13],
      bone: jaw,
      name: "hairFringe",
      flat: true,
    });
  }

  // Antenna: cardboard stem, metal cap, and signal fins.
  b.rod([0, 2.07, 0.10], [0, 2.30, 0.10], 0.018, {
    color: CARDBOARD_DARK,
    bone: head,
    caps: "flat",
    name: "antennaStem",
  });
  b.part(new THREE.SphereGeometry(0.055, 8, 5), RED, {
    at: [0, 2.35, 0.10],
    bone: head,
    name: "antennaLamp",
    flat: true,
  });
  for (const s of [-1, 1]) {
    box([0.035, 0.12, 0.025], CARDBOARD_LIGHT, [s * 0.065, 2.28, 0.10], head, "antennaFin");
  }

  // ---------------------------------------------------------------------------
  // Extra handmade details: shoulder caps, warning labels, and tape.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const arm = s > 0 ? leftArm : rightArm;
    box([0.16, 0.13, 0.22], CARDBOARD_LIGHT, [s * 0.42, 1.36, 0.03], arm, "shoulderCap");
    box([0.13, 0.055, 0.018], YELLOW, [s * 0.42, 1.38, 0.145], arm, "shoulderStripe");
    box([0.045, 0.12, 0.018], EDGE, [s * 0.42, 1.38, 0.158], arm, "shoulderStripeEdge");
  }

  // Diagonal warning tape across the torso, built from short blocky pieces.
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.07;
    const y = 0.91 + (i + 4) * 0.035;
    box([0.038, 0.018, 0.016], YELLOW, [x, y, 0.378], spine.tip, "warningTape");
  }

  // A hand-drawn maker mark on the back/side, represented as layered cardboard shapes.
  box([0.20, 0.13, 0.018], CARDBOARD_LIGHT, [0.425, 1.10, -0.255], spine.tip, "makerLabel");
  box([0.11, 0.012, 0.012], EDGE, [0.425, 1.13, -0.267], spine.tip, "makerLabelLine");
  box([0.075, 0.012, 0.012], EDGE, [0.425, 1.08, -0.267], spine.tip, "makerLabelLine");

  // Ensure deterministic construction is tied to the requested seeded pipeline.
  // This harmless seeded read keeps decorative ordering stable if expanded later.
  rng(17)();

  return b.root;
}
