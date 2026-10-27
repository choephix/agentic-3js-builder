import * as THREE from "three";
import { createBuilder, rng, svg } from "../../../../src/index";

export const meta = {
  name: "cardboard-box robot kid",
  description:
    "A stylized child wearing a handmade cardboard robot costume, with a boxy torso and helmet, taped seams, rivets, antenna, chunky limbs, expressive robot eyes, chest controls, and scuffed craft-paper details.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = "#b9783f";
  const CARDBOARD_LIGHT = "#d49a5b";
  const CARDBOARD_TOP = "#e0aa6b";
  const CARDBOARD_DARK = "#754225";
  const EDGE = "#56301e";
  const TAPE = "#d8bc78";
  const TAPE_LIGHT = "#efd89a";
  const INK = "#241b18";
  const EYE_BLUE = "#54c7d9";
  const EYE_GLOW = "#b9f4e8";
  const RED = "#bb4230";
  const YELLOW = "#e6b93e";
  const GREEN = "#69a85a";
  const SKIN = "#e8a878";
  const HAIR = "#4b2b20";
  const SHOE = "#3b2923";
  const SHORTS = "#315b72";

  const rand = rng(18);

  const box = (
    size: [number, number, number],
    at: [number, number, number] | THREE.Vector3,
    color: string,
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const round = (
    radius: number,
    at: [number, number, number] | THREE.Vector3,
    color: string,
    bone?: any,
    scale: [number, number, number] = [1, 1, 1],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      scale,
      name,
      flat: true,
    });

  const button = (
    at: [number, number, number] | THREE.Vector3,
    color: string,
    radius = 0.027,
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, 0.018, 8), color, {
      at,
      bone,
      dir: [0, 0, 1],
      name,
      flat: true,
    });

  const strip = (
    size: [number, number, number],
    at: [number, number, number] | THREE.Vector3,
    color = TAPE,
    bone?: any,
    name?: string,
  ) => box(size, at, color, bone, name);

  const rivet = (
    at: [number, number, number] | THREE.Vector3,
    color = CARDBOARD_DARK,
    r = 0.018,
    bone?: any,
    name?: string,
  ) => round(r, at, color, bone, [1, 0.45, 1], name);

  // ---------------------------------------------------------------------------
  // Skeleton first: hips, torso, neck and head.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.74, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.74, 0],
      [0, 1.04, 0],
      [0, 1.31, 0.01],
    ],
    {
      parent: hips,
      names: ["pelvis", "chest", "neck"],
      role: "spine",
      group: "body",
    },
  );

  const neck = spine.tip;
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.38, 0.02],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.43, 0.22],
    dir: [0, -0.08, 0.35],
    role: "jaw",
    group: "face",
  });

  const armL = b.chain(
    "armL",
    [
      [0.31, 1.22, 0],
      [0.48, 1.09, 0.01],
      [0.57, 0.83, 0.04],
    ],
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "handL"],
      role: "arm",
      group: "limbs",
    },
  );

  const armR = b.chain(
    "armR",
    [
      [-0.31, 1.22, 0],
      [-0.48, 1.09, 0.01],
      [-0.57, 0.83, 0.04],
    ],
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "handR"],
      role: "arm",
      group: "limbs",
    },
  );

  const legL = b.chain(
    "legL",
    [
      [0.16, 0.71, 0],
      [0.17, 0.39, 0.035],
      [0.17, 0.15, 0.13],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      group: "limbs",
      contact: [0.17, 0, 0.15],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.16, 0.71, 0],
      [-0.17, 0.39, 0.035],
      [-0.17, 0.15, 0.13],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      group: "limbs",
      contact: [-0.17, 0, 0.15],
    },
  );

  // ---------------------------------------------------------------------------
  // Lower body: visible child legs beneath the costume.
  // ---------------------------------------------------------------------------

  box([0.22, 0.28, 0.22], [0.16, 0.56, 0.015], SHORTS, hips, "shortsL");
  box([0.22, 0.28, 0.22], [-0.16, 0.56, 0.015], SHORTS, hips, "shortsR");

  strip([0.025, 0.27, 0.24], [0.29, 0.56, 0.015], TAPE_LIGHT, hips, "shortsTrimL");
  strip([0.025, 0.27, 0.24], [-0.29, 0.56, 0.015], TAPE_LIGHT, hips, "shortsTrimR");

  // Soft-looking but still primitive-built knees.
  round(0.105, [0.17, 0.39, 0.035], SKIN, legL.joints[1], [1, 0.9, 0.8], "kneePadL");
  round(0.105, [-0.17, 0.39, 0.035], SKIN, legR.joints[1], [1, 0.9, 0.8], "kneePadR");

  box([0.16, 0.27, 0.17], [0.17, 0.25, 0.055], SKIN, legL.joints[1], "shinL");
  box([0.16, 0.27, 0.17], [-0.17, 0.25, 0.055], SKIN, legR.joints[1], "shinR");

  box([0.23, 0.12, 0.34], [0.17, 0.065, 0.12], SHOE, legL.tip, "shoeL");
  box([0.23, 0.12, 0.34], [-0.17, 0.065, 0.12], SHOE, legR.tip, "shoeR");

  strip([0.19, 0.025, 0.035], [0.17, 0.112, 0.285], TAPE, legL.tip, "shoeStripeL");
  strip([0.19, 0.025, 0.035], [-0.17, 0.112, 0.285], TAPE, legR.tip, "shoeStripeR");

  // ---------------------------------------------------------------------------
  // Main cardboard costume box.
  // ---------------------------------------------------------------------------

  box([0.68, 0.70, 0.48], [0, 1.04, 0], CARDBOARD, spine.joints[1], "torsoBox");

  // Warm top plane and darker side/front edge treatment.
  box([0.62, 0.018, 0.43], [0, 1.394, 0.005], CARDBOARD_TOP, spine.joints[1], "torsoTop");
  strip([0.018, 0.68, 0.03], [0.352, 1.04, 0.005], CARDBOARD_DARK, spine.joints[1], "torsoEdgeL");
  strip([0.018, 0.68, 0.03], [-0.352, 1.04, 0.005], CARDBOARD_DARK, spine.joints[1], "torsoEdgeR");
  strip([0.68, 0.022, 0.025], [0, 0.70, 0.005], CARDBOARD_DARK, spine.joints[1], "torsoBottomEdge");

  // Corrugated-looking vertical tape seams.
  strip([0.035, 0.68, 0.012], [0.01, 1.04, 0.247], TAPE, spine.joints[1], "frontCenterTape");
  strip([0.025, 0.68, 0.012], [-0.28, 1.04, 0.247], TAPE_LIGHT, spine.joints[1], "frontTapeL");
  strip([0.025, 0.68, 0.012], [0.28, 1.04, 0.247], TAPE_LIGHT, spine.joints[1], "frontTapeR");

  // Side panel scribbles represented as little dark craft-paper bars.
  for (const s of [-1, 1]) {
    strip([0.012, 0.18, 0.025], [s * 0.347, 1.18, 0.04], CARDBOARD_DARK, spine.joints[1], `sideMark${s}A`);
    strip([0.012, 0.025, 0.17], [s * 0.347, 1.07, 0.04], CARDBOARD_DARK, spine.joints[1], `sideMark${s}B`);
    strip([0.012, 0.025, 0.12], [s * 0.347, 0.93, 0.04], CARDBOARD_DARK, spine.joints[1], `sideMark${s}C`);
  }

  // Chest control panel, layered like handmade glued cardboard.
  box([0.33, 0.23, 0.025], [0, 1.12, 0.258], CARDBOARD_DARK, spine.joints[1], "chestPanelShadow");
  box([0.30, 0.20, 0.03], [0, 1.125, 0.274], TAPE_LIGHT, spine.joints[1], "chestPanel");
  strip([0.30, 0.018, 0.012], [0, 1.223, 0.293], CARDBOARD_DARK, spine.joints[1], "panelTop");
  strip([0.30, 0.018, 0.012], [0, 1.027, 0.293], CARDBOARD_DARK, spine.joints[1], "panelBottom");

  const panelLabel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 48">
      <rect width="128" height="48" fill="#d8bc78"/>
      <path d="M5 7h118v34H5z" fill="none" stroke="#56301e" stroke-width="3"/>
      <text x="64" y="30" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="#56301e">KID-BOT</text>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.25, 0.095), "#ffffff", {
    at: [0, 1.13, 0.292],
    bone: spine.joints[1],
    dir: [0, 0, 1],
    axis: "z",
    texture: panelLabel,
    name: "chestLabel",
  });

  // Chest lights and buttons.
  button([-0.105, 1.185, 0.304], RED, 0.026, spine.joints[1], "redChestLight");
  button([0, 1.185, 0.304], YELLOW, 0.026, spine.joints[1], "yellowChestLight");
  button([0.105, 1.185, 0.304], GREEN, 0.026, spine.joints[1], "greenChestLight");
  button([-0.08, 1.075, 0.304], INK, 0.014, spine.joints[1], "chestKnobL");
  button([0.08, 1.075, 0.304], INK, 0.014, spine.joints[1], "chestKnobR");

  // Rivets around the torso corners.
  for (const x of [-0.315, 0.315]) {
    for (const y of [0.77, 1.31]) {
      rivet([x, y, 0.255], CARDBOARD_DARK, 0.018, spine.joints[1], `torsoRivet${x}${y}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Boxy arms, shoulder caps, taped wrists and mitten hands.
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const arm = side === 1 ? armL : armR;
    const shoulder = side === 1 ? armL.joints[0] : armR.joints[0];
    const elbow = side === 1 ? armL.joints[1] : armR.joints[1];
    const hand = side === 1 ? armL.tip : armR.tip;

    round(0.14, [side * 0.36, 1.22, 0], CARDBOARD_TOP, shoulder, [1, 1, 0.82], `shoulderCap${side}`);
    rivet([side * 0.36, 1.22, 0.115], CARDBOARD_DARK, 0.022, shoulder, `shoulderRivet${side}`);

    b.frustumBox(
      [side * 0.37, 1.18, 0],
      [side * 0.48, 1.055, 0.015],
      [0.19, 0.22],
      [0.17, 0.20],
      { bone: shoulder, color: CARDBOARD, name: `upperArmBox${side}` },
    );

    strip([0.19, 0.035, 0.23], [side * 0.43, 1.12, 0.012], TAPE, shoulder, `upperArmTape${side}`);

    b.frustumBox(
      [side * 0.49, 1.04, 0.018],
      [side * 0.57, 0.84, 0.045],
      [0.17, 0.20],
      [0.15, 0.18],
      { bone: elbow, color: CARDBOARD_LIGHT, name: `forearmBox${side}` },
    );

    strip([0.18, 0.035, 0.20], [side * 0.535, 0.935, 0.05], TAPE_LIGHT, elbow, `forearmTape${side}`);

    box([0.19, 0.14, 0.19], [side * 0.58, 0.76, 0.06], CARDBOARD_DARK, hand, `wristBox${side}`);
    strip([0.21, 0.025, 0.20], [side * 0.58, 0.82, 0.06], TAPE, hand, `wristTape${side}`);

    // Child's mitten hand peeking from the costume.
    round(0.115, [side * 0.58, 0.67, 0.075], SKIN, hand, [1, 1.05, 0.9], `hand${side}`);
    round(0.045, [side * 0.665, 0.69, 0.08], SKIN, hand, [1.2, 0.8, 0.75], `thumb${side}`);
  }

  // ---------------------------------------------------------------------------
  // Helmet/head: oversized cardboard cube with open front face.
  // ---------------------------------------------------------------------------

  box([0.56, 0.48, 0.49], [0, 1.61, 0.02], CARDBOARD_LIGHT, head, "helmetBox");
  box([0.52, 0.025, 0.45], [0, 1.855, 0.02], CARDBOARD_TOP, head, "helmetTop");
  strip([0.035, 0.48, 0.025], [0.28, 1.61, 0.02], CARDBOARD_DARK, head, "helmetEdgeL");
  strip([0.035, 0.48, 0.025], [-0.28, 1.61, 0.02], CARDBOARD_DARK, head, "helmetEdgeR");
  strip([0.56, 0.035, 0.025], [0, 1.375, 0.02], CARDBOARD_DARK, head, "helmetBottom");
  strip([0.035, 0.48, 0.018], [0, 1.61, 0.268], TAPE, head, "helmetCenterSeam");

  // Side folded flaps.
  box([0.10, 0.30, 0.035], [0.32, 1.59, 0.015], CARDBOARD, head, "helmetFlapL");
  box([0.10, 0.30, 0.035], [-0.32, 1.59, 0.015], CARDBOARD, head, "helmetFlapR");
  strip([0.015, 0.28, 0.045], [0.32, 1.59, 0.04], TAPE_LIGHT, head, "flapTapeL");
  strip([0.015, 0.28, 0.045], [-0.32, 1.59, 0.04], TAPE_LIGHT, head, "flapTapeR");

  // Face opening / dark inner panel.
  box([0.43, 0.265, 0.025], [0, 1.60, 0.272], INK, head, "faceOpening");

  // Pale child face visible through the opening.
  box([0.34, 0.22, 0.022], [0, 1.58, 0.291], SKIN, head, "face");

  // Robot brow visor.
  box([0.40, 0.065, 0.026], [0, 1.735, 0.307], CARDBOARD_DARK, head, "visorBrow");
  strip([0.38, 0.018, 0.012], [0, 1.702, 0.323], TAPE_LIGHT, head, "visorHighlight");

  // Large handmade robot eyes with dark surrounds.
  for (const side of [1, -1]) {
    round(0.072, [side * 0.105, 1.635, 0.318], INK, head, [1.0, 0.9, 0.30], `eyeSocket${side}`);
    round(0.052, [side * 0.105, 1.635, 0.329], EYE_BLUE, head, [1.0, 1.0, 0.25], `eyeGlass${side}`);
    round(0.020, [side * 0.09, 1.655, 0.341], EYE_GLOW, head, [1, 1, 0.20], `eyeSpark${side}`);
    rivet([side * 0.18, 1.70, 0.325], TAPE_LIGHT, 0.015, head, `browRivet${side}`);
  }

  // Nose made from a little triangular-ish cardboard stack.
  box([0.065, 0.07, 0.055], [0, 1.565, 0.335], CARDBOARD_DARK, head, "noseBlock");
  strip([0.035, 0.018, 0.062], [0, 1.60, 0.37], TAPE_LIGHT, head, "noseHighlight");

  // Separate lower jaw, readable as a hinged costume part.
  box([0.37, 0.095, 0.10], [0, 1.445, 0.29], CARDBOARD_DARK, jaw, "lowerJaw");
  box([0.31, 0.052, 0.035], [0, 1.475, 0.348], SKIN, jaw, "smileGap");
  strip([0.30, 0.018, 0.015], [0, 1.415, 0.34], TAPE, jaw, "jawTape");

  // A cheerful row of square cardboard teeth / mouth pixels.
  for (let i = -2; i <= 2; i++) {
    box([0.038, 0.026, 0.012], [i * 0.052, 1.468, 0.369], TAPE_LIGHT, jaw, `tooth${i}`);
  }

  // Ear-like side bolts and cardboard cheek corners.
  for (const side of [1, -1]) {
    box([0.06, 0.13, 0.10], [side * 0.32, 1.52, 0.02], CARDBOARD_DARK, head, `earBox${side}`);
    rivet([side * 0.35, 1.56, 0.085], TAPE_LIGHT, 0.022, head, `earRivet${side}`);
    strip([0.018, 0.20, 0.11], [side * 0.23, 1.43, 0.30], CARDBOARD_DARK, head, `cheekEdge${side}`);
  }

  // ---------------------------------------------------------------------------
  // Antenna, warning pennant and handmade head markings.
  // ---------------------------------------------------------------------------

  b.rod([0, 1.855, 0.02], [0, 2.02, 0.02], 0.018, {
    bone: head,
    color: CARDBOARD_DARK,
    name: "antennaStem",
  });
  round(0.045, [0, 2.055, 0.02], RED, head, [1, 1, 0.8], "antennaTip");
  strip([0.026, 0.09, 0.018], [0.045, 1.91, 0.025], TAPE, head, "antennaTape");

  b.extrude(
    [
      [0, 0],
      [0.15, 0.035],
      [0.15, 0.12],
      [0.045, 0.09],
      [0, 0.16],
    ],
    {
      at: [0.015, 1.95, 0.02],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: RED,
      bone: head,
      name: "warningPennant",
    },
  );

  // Little hand-drawn lightning mark on the helmet.
  b.extrude(
    [
      [0, 0],
      [0.045, 0],
      [-0.008, 0.095],
      [0.065, 0.095],
      [-0.045, 0.24],
      [-0.005, 0.13],
      [-0.075, 0.13],
    ],
    {
      at: [-0.20, 1.48, 0.275],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: YELLOW,
      bone: head,
      name: "helmetLightning",
    },
  );

  // ---------------------------------------------------------------------------
  // Cardboard craft details: folded corners, patches, staples and scuffs.
  // ---------------------------------------------------------------------------

  // Tape collar around the neck gap.
  strip([0.44, 0.055, 0.44], [0, 1.365, 0.02], TAPE, spine.joints[1], "neckTapeFront");
  strip([0.055, 0.055, 0.44], [0.245, 1.365, 0.02], TAPE_LIGHT, spine.joints[1], "neckTapeSideL");
  strip([0.055, 0.055, 0.44], [-0.245, 1.365, 0.02], TAPE_LIGHT, spine.joints[1], "neckTapeSideR");

  // Repeated staple pairs on the front seams.
  for (const y of [0.82, 0.95, 1.08, 1.21, 1.34]) {
    for (const x of [-0.29, 0.29]) {
      strip([0.032, 0.008, 0.008], [x, y, 0.266], EDGE, spine.joints[1], `staple${x}${y}`);
    }
  }

  // Handmade patches on the torso.
  box([0.12, 0.10, 0.012], [0.23, 0.87, 0.27], CARDBOARD_TOP, spine.joints[1], "patchL");
  box([0.10, 0.14, 0.012], [-0.22, 1.27, 0.27], CARDBOARD_DARK, spine.joints[1], "patchR");
  strip([0.13, 0.012, 0.008], [0.23, 0.87, 0.282], TAPE_LIGHT, spine.joints[1], "patchTapeL");
  strip([0.012, 0.14, 0.008], [-0.275, 1.27, 0.282], TAPE, spine.joints[1], "patchTapeR");

  // A few intentionally uneven dark pencil-like marks.
  for (let i = 0; i < 7; i++) {
    const x = -0.25 + rand() * 0.5;
    const y = 0.77 + rand() * 0.52;
    const w = 0.025 + rand() * 0.05;
    strip([w, 0.009, 0.008], [x, y, 0.282], EDGE, spine.joints[1], `scuff${i}`);
  }

  // Backpack-like rear flap, visible as a silhouette from the side.
  box([0.43, 0.38, 0.07], [0, 1.05, -0.27], CARDBOARD_DARK, spine.joints[1], "backpackFlap");
  strip([0.40, 0.025, 0.018], [0, 1.23, -0.315], TAPE, spine.joints[1], "backpackTopTape");
  rivet([0.18, 1.08, -0.325], TAPE_LIGHT, 0.02, spine.joints[1], "backpackRivetL");
  rivet([-0.18, 1.08, -0.325], TAPE_LIGHT, 0.02, spine.joints[1], "backpackRivetR");

  // Final hand-built "control wires" over the chest.
  b.rod([-0.12, 1.08, 0.31], [-0.06, 1.03, 0.32], 0.006, {
    bone: spine.joints[1],
    color: INK,
    name: "wireL",
  });
  b.rod([0.12, 1.08, 0.31], [0.06, 1.03, 0.32], 0.006, {
    bone: spine.joints[1],
    color: INK,
    name: "wireR",
  });

  return b.root;
}
