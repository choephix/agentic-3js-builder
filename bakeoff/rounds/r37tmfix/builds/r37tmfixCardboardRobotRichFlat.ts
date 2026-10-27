import * as THREE from "three";
import { createBuilder, limb, catmull, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "cardboard-box-robot-kid",
  description: "A cheerful child wearing a chunky handmade cardboard-box robot costume.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = "#b8753d";
  const CARDBOARD_LIGHT = "#d99658";
  const CARDBOARD_DARK = "#754124";
  const EDGE = "#552b1e";
  const TAPE = "#e6bf69";
  const TAPE_LIGHT = "#f2d38a";
  const RUBBER = "#24252b";
  const VISOR = "#17252b";
  const METAL = "#8b8f86";
  const METAL_DARK = "#4f554f";
  const RED = "#d94b3f";
  const BLUE = "#3478a8";
  const YELLOW = "#f5c548";
  const EYE = "#b9f3d1";
  const SKIN = "#e7a477";
  const HAIR = "#4a241b";
  const SHOE = "#343944";
  const WHITE = "#f6e9c6";

  const box = (
    w: number,
    h: number,
    d: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    dir: [number, number, number] = [0, 1, 0],
    name = "cylinder",
    sides = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      bone,
      dir,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    name = "sphere",
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const frontBar = (
    w: number,
    h: number,
    d: number,
    color: string,
    x: number,
    y: number,
    z: number,
    bone: any,
    name: string,
  ) => box(w, h, d, color, [x, y, z], bone, name);

  // ---------------------------------------------------------------------------
  // Skeleton first: compact child proportions inside an oversized robot shell.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 1.02, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, 0],
      [0, 1.27, 0],
      [0, 1.49, 0],
    ]),
    {
      parent: hips,
      names: ["pelvis", "chest", "shoulder"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.83, 0.02],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.73, 0.16],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const legLPoints = limb(
    [0.17, 1.02, 0],
    [0.18, 0.12, 0.08],
    [0.34, 0.32, 0.23],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );
  const legRPoints = limb(
    [-0.17, 1.02, 0],
    [-0.18, 0.12, 0.08],
    [0.34, 0.32, 0.23],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );

  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.18, 0, 0.08],
  });
  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.18, 0, 0.08],
  });

  const armL = b.chain(
    "armL",
    [
      [0.34, 1.43, 0],
      [0.55, 1.22, 0.01],
      [0.62, 0.95, 0.06],
    ],
    {
      parent: spine.tip,
      names: ["shoulderL", "elbowL", "handL"],
      role: "arm",
    },
  );
  const armR = b.chain(
    "armR",
    [
      [-0.34, 1.43, 0],
      [-0.55, 1.22, 0.01],
      [-0.62, 0.95, 0.06],
    ],
    {
      parent: spine.tip,
      names: ["shoulderR", "elbowR", "handR"],
      role: "arm",
    },
  );

  const antenna = b.joint("antenna", {
    parent: head,
    at: [0, 2.13, 0],
    dir: [0, 1, 0],
    role: "hinge",
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // Main cardboard costume volumes.
  // ---------------------------------------------------------------------------

  box(0.72, 0.70, 0.48, CARDBOARD, [0, 1.27, 0], hips, "torsoBox");
  box(0.60, 0.16, 0.43, CARDBOARD_DARK, [0, 0.91, 0], hips, "lowerTorsoShadow");
  box(0.54, 0.50, 0.50, CARDBOARD_LIGHT, [0, 1.83, 0.02], head, "helmetBox");

  // Head top flap and side flaps.
  box(0.48, 0.035, 0.40, TAPE, [0, 2.085, 0.02], head, "helmetTopTape");
  box(0.035, 0.34, 0.40, CARDBOARD_DARK, [0.305, 1.83, 0.02], head, "helmetRightEdge");
  box(0.035, 0.34, 0.40, CARDBOARD_DARK, [-0.305, 1.83, 0.02], head, "helmetLeftEdge");

  // Large cardboard shoulder and limb shells.
  b.sweep(armL, [0.115, 0.10], {
    color: CARDBOARD,
    section: "box",
    caps: "flat",
    skin: "rigid",
    name: "armShellL",
  });
  b.sweep(armR, [0.115, 0.10], {
    color: CARDBOARD,
    section: "box",
    caps: "flat",
    skin: "rigid",
    name: "armShellR",
  });
  b.sweep(legL, [0.14, 0.115], {
    color: CARDBOARD,
    section: "box",
    caps: "flat",
    skin: "rigid",
    name: "legShellL",
  });
  b.sweep(legR, [0.14, 0.115], {
    color: CARDBOARD,
    section: "box",
    caps: "flat",
    skin: "rigid",
    name: "legShellR",
  });

  // Boxy boots, with a little real child shoe peeking below the costume.
  box(0.29, 0.19, 0.40, RUBBER, [0.18, 0.105, 0.09], legL.tip!, "bootL");
  box(0.29, 0.19, 0.40, RUBBER, [-0.18, 0.105, 0.09], legR.tip!, "bootR");
  box(0.22, 0.055, 0.31, CARDBOARD_DARK, [0.18, 0.215, 0.08], legL.tip, "bootCuffL");
  box(0.22, 0.055, 0.31, CARDBOARD_DARK, [-0.18, 0.215, 0.08], legR.tip, "bootCuffR");

  // Rounded cardboard mitts, with simple finger bumps.
  sphere(0.13, CARDBOARD_LIGHT, [0.63, 0.93, 0.07], armL.tip, "mittenL");
  sphere(0.13, CARDBOARD_LIGHT, [-0.63, 0.93, 0.07], armR.tip, "mittenR");
  for (const s of [1, -1]) {
    const hand = s > 0 ? armL.tip : armR.tip;
    for (let i = -1; i <= 1; i++) {
      cylinder(0.032, 0.10, CARDBOARD_DARK, [s * (0.64 + i * 0.035), 0.88, 0.13], hand, [0, 0, 1], `finger${s}${i}`, 6);
    }
  }

  // ---------------------------------------------------------------------------
  // Cardboard construction language: seams, folded flaps, tape, corner guards.
  // ---------------------------------------------------------------------------

  // Vertical and horizontal packing seams on the torso.
  frontBar(0.022, 0.63, 0.012, EDGE, 0, 1.29, 0.248, hips, "torsoVerticalSeam");
  frontBar(0.65, 0.018, 0.014, EDGE, 0, 1.39, 0.250, hips, "torsoHorizontalSeam");
  frontBar(0.65, 0.018, 0.014, EDGE, 0, 1.07, 0.250, hips, "torsoLowerSeam");
  frontBar(0.018, 0.58, 0.012, EDGE, 0.355, 1.28, 0.02, hips, "sideSeamL");
  frontBar(0.018, 0.58, 0.012, EDGE, -0.355, 1.28, 0.02, hips, "sideSeamR");

  // Tape bands over the seams.
  frontBar(0.055, 0.68, 0.018, TAPE, 0, 1.27, 0.265, hips, "frontPackingTape");
  frontBar(0.72, 0.045, 0.020, TAPE_LIGHT, 0, 1.48, 0.263, hips, "topTape");
  frontBar(0.72, 0.040, 0.020, TAPE, 0, 1.00, 0.263, hips, "bottomTape");
  frontBar(0.035, 0.52, 0.020, TAPE_LIGHT, 0.365, 1.25, 0.01, hips, "sideTapeL");
  frontBar(0.035, 0.52, 0.020, TAPE_LIGHT, -0.365, 1.25, 0.01, hips, "sideTapeR");

  // Head fold lines and tape across the top/front.
  frontBar(0.018, 0.43, 0.014, EDGE, 0, 1.83, 0.276, head, "faceFold");
  frontBar(0.52, 0.028, 0.018, TAPE, 0, 2.005, 0.278, head, "helmetTape");
  frontBar(0.030, 0.38, 0.018, TAPE_LIGHT, 0.235, 1.83, 0.278, head, "helmetTapeSideL");
  frontBar(0.030, 0.38, 0.018, TAPE_LIGHT, -0.235, 1.83, 0.278, head, "helmetTapeSideR");

  // Little folded triangular-looking flap approximated by layered slabs.
  b.slab(
    [
      [0, 1.98, 0.29],
      [0.24, 2.06, 0.29],
      [0.18, 2.12, 0.29],
      [-0.02, 2.08, 0.29],
    ],
    { color: CARDBOARD_LIGHT, thickness: 0.018, bone: head, name: "topFoldFlap" },
  );

  // Cardboard corner protectors on shoulders and hips.
  for (const s of [1, -1]) {
    const shoulder = s > 0 ? armL.joints[0] : armR.joints[0];
    const hip = s > 0 ? legL.joints[0] : legR.joints[0];
    box(0.055, 0.20, 0.055, TAPE_LIGHT, [s * 0.355, 1.44, 0.19], shoulder, `shoulderCorner${s}`);
    box(0.055, 0.17, 0.055, TAPE, [s * 0.215, 1.00, 0.18], hip, `hipCorner${s}`);
  }

  // ---------------------------------------------------------------------------
  // Robot face: dark inset visor, glowing eyes, grille mouth and cheek bolts.
  // ---------------------------------------------------------------------------

  box(0.43, 0.19, 0.025, VISOR, [0, 1.87, 0.287], head, "blackVisor");
  frontBar(0.43, 0.018, 0.018, EDGE, 0, 1.98, 0.306, head, "visorTopRim");
  frontBar(0.43, 0.018, 0.018, EDGE, 0, 1.76, 0.306, jaw, "visorBottomRim");

  for (const s of [1, -1]) {
    const eyePart = sphere(0.050, EYE, [s * 0.105, 1.875, 0.315], head, `glowingEye${s}`);
    glow(eyePart, 1.8);
    cylinder(0.062, 0.018, METAL_DARK, [s * 0.105, 1.875, 0.302], head, [0, 0, 1], `eyeSocket${s}`, 8);
    sphere(0.016, WHITE, [s * 0.087, 1.895, 0.354], head, `eyeSpark${s}`);
  }

  // Mouth grille on separate jaw bone, visually able to open with the jaw.
  box(0.25, 0.075, 0.028, EDGE, [0, 1.685, 0.30], jaw, "mouthDark");
  for (let i = -2; i <= 2; i++) {
    frontBar(0.018, 0.058, 0.018, METAL, i * 0.045, 1.685, 0.322, jaw, `mouthGrille${i}`);
  }
  frontBar(0.29, 0.018, 0.018, TAPE_LIGHT, 0, 1.735, 0.322, jaw, "mouthLowerTape");

  // Side ear discs and bolts.
  for (const s of [1, -1]) {
    cylinder(0.10, 0.035, CARDBOARD_DARK, [s * 0.33, 1.84, 0.01], head, [1, 0, 0], `earDisc${s}`, 8);
    cylinder(0.050, 0.045, METAL, [s * 0.365, 1.84, 0.01], head, [1, 0, 0], `earHub${s}`, 8);
    sphere(0.018, TAPE_LIGHT, [s * 0.39, 1.88, 0.04], head, `earBolt${s}`);
  }

  // ---------------------------------------------------------------------------
  // Chest control panel: a charming handmade robot dashboard.
  // ---------------------------------------------------------------------------

  box(0.40, 0.25, 0.035, CARDBOARD_DARK, [0, 1.27, 0.275], hips, "chestPanelShadow");
  box(0.36, 0.21, 0.025, METAL_DARK, [0, 1.28, 0.298], hips, "chestPanel");
  frontBar(0.36, 0.018, 0.018, TAPE_LIGHT, 0, 1.405, 0.315, hips, "panelHeaderTape");
  frontBar(0.018, 0.19, 0.018, TAPE, -0.19, 1.28, 0.315, hips, "panelLeftTape");
  frontBar(0.018, 0.19, 0.018, TAPE, 0.19, 1.28, 0.315, hips, "panelRightTape");

  // Central power light and two square indicator buttons.
  const power = cylinder(0.043, 0.022, RED, [0, 1.335, 0.325], hips, [0, 0, 1], "powerLamp", 10);
  glow(power, 1.4);
  box(0.055, 0.055, 0.025, BLUE, [-0.105, 1.275, 0.325], hips, "blueButton");
  box(0.055, 0.055, 0.025, YELLOW, [0.105, 1.275, 0.325], hips, "yellowButton");
  for (const x of [-0.105, 0.105]) {
    frontBar(0.065, 0.010, 0.012, WHITE, x, 1.315, 0.344, hips, `buttonHighlight${x}`);
  }

  // A pretend battery gauge made from stacked bars.
  frontBar(0.16, 0.018, 0.014, EDGE, 0, 1.205, 0.326, hips, "batteryFrame");
  for (let i = 0; i < 4; i++) {
    frontBar(0.028, 0.030, 0.018, i < 3 ? BLUE : RED, -0.055 + i * 0.037, 1.205, 0.341, hips, `batteryCell${i}`);
  }

  // Chest emblem: a cardboard lightning bolt made of two overlapping slabs.
  b.slab(
    [
      [-0.035, 1.40, 0.33],
      [0.045, 1.40, 0.33],
      [0.005, 1.32, 0.33],
      [0.075, 1.32, 0.33],
      [-0.045, 1.18, 0.33],
      [-0.005, 1.29, 0.33],
      [-0.075, 1.29, 0.33],
    ],
    { color: TAPE_LIGHT, thickness: 0.014, bone: hips, name: "cardboardLightning" },
  );

  // ---------------------------------------------------------------------------
  // Mechanical-looking limb accents and handmade fasteners.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR;
    const leg = s > 0 ? legL : legR;

    // Elbow and knee hinge plates.
    cylinder(0.105, 0.032, METAL_DARK, [s * 0.55, 1.22, 0.055], arm.joints[1], [0, 0, 1], `elbowPlate${s}`, 8);
    cylinder(0.105, 0.032, METAL_DARK, [s * 0.18, 0.68, 0.07], leg.joints[1], [0, 0, 1], `kneePlate${s}`, 8);

    cylinder(0.045, 0.045, METAL, [s * 0.55, 1.22, 0.085], arm.joints[1], [0, 0, 1], `elbowPin${s}`, 8);
    cylinder(0.045, 0.045, METAL, [s * 0.18, 0.68, 0.10], leg.joints[1], [0, 0, 1], `kneePin${s}`, 8);

    // Repeated tape on arm and leg edges.
    frontBar(0.025, 0.16, 0.018, TAPE_LIGHT, s * 0.56, 1.12, 0.13, arm.joints[1], `forearmTape${s}`);
    frontBar(0.025, 0.16, 0.018, TAPE_LIGHT, s * 0.18, 0.50, 0.13, leg.joints[1], `shinTape${s}`);

    // Shoulder rivets and boot bolts.
    sphere(0.027, METAL, [s * 0.40, 1.48, 0.135], arm.joints[0], `shoulderRivetA${s}`);
    sphere(0.027, METAL, [s * 0.32, 1.40, 0.135], arm.joints[0], `shoulderRivetB${s}`);
    sphere(0.027, METAL, [s * 0.11, 0.15, 0.285], leg.tip, `bootRivet${s}`);
  }

  // Rectangular hand control marks.
  box(0.10, 0.045, 0.018, TAPE, [0.625, 0.955, 0.17], armL.tip, "handMarkL");
  box(0.10, 0.045, 0.018, TAPE, [-0.625, 0.955, 0.17], armR.tip, "handMarkR");

  // ---------------------------------------------------------------------------
  // Antenna and backpack: silhouette details that sell "robot costume".
  // ---------------------------------------------------------------------------

  cylinder(0.025, 0.24, METAL_DARK, [0, 2.22, 0.01], antenna, [0, 1, 0], "antennaStem", 8);
  const antennaLight = sphere(0.065, RED, [0, 2.36, 0.01], antenna, "antennaLamp");
  glow(antennaLight, 1.7);
  cylinder(0.038, 0.045, TAPE_LIGHT, [0, 2.10, 0.01], antenna, [0, 1, 0], "antennaCollar", 8);

  // Backpack protruding behind the torso, mostly visible from a three-quarter view.
  box(0.42, 0.40, 0.16, CARDBOARD_DARK, [0, 1.30, -0.29], hips, "backpack");
  box(0.34, 0.28, 0.025, TAPE, [0, 1.31, -0.385], hips, "backpackTape");
  frontBar(0.025, 0.31, 0.022, EDGE, 0, 1.30, -0.405, hips, "backpackSeam");
  cylinder(0.035, 0.20, METAL, [0.16, 1.51, -0.39], hips, [0, 0, 1], "backpackExhaustL", 8);
  cylinder(0.035, 0.20, METAL, [-0.16, 1.51, -0.39], hips, [0, 0, 1], "backpackExhaustR", 8);

  // Two loose cardboard straps over the shoulders, layered above the torso.
  for (const s of [1, -1]) {
    box(0.075, 0.54, 0.025, TAPE_LIGHT, [s * 0.25, 1.31, 0.276], hips, `shoulderStrap${s}`);
    box(0.095, 0.065, 0.028, CARDBOARD_DARK, [s * 0.25, 1.53, 0.292], hips, `strapTopOverlap${s}`);
  }

  // ---------------------------------------------------------------------------
  // Child details: small face peeking through the open robot mask and hair.
  // ---------------------------------------------------------------------------

  // A tiny lower face panel suggests the child inside the costume.
  box(0.22, 0.095, 0.012, SKIN, [0, 1.69, 0.333], jaw, "childChin");
  for (const s of [1, -1]) {
    sphere(0.014, HAIR, [s * 0.20, 2.035, 0.225], head, `hairCurl${s}`);
    sphere(0.018, SKIN, [s * 0.135, 1.695, 0.344], jaw, `cheek${s}`);
  }

  // ---------------------------------------------------------------------------
  // Tiny cardboard labels and rivet rows.
  // ---------------------------------------------------------------------------

  frontBar(0.18, 0.032, 0.012, WHITE, 0, 1.565, 0.27, hips, "modelLabel");
  frontBar(0.13, 0.012, 0.012, EDGE, 0, 1.566, 0.284, hips, "modelLabelInk");

  for (let i = -2; i <= 2; i++) {
    sphere(0.015, METAL, [i * 0.105, 1.565, 0.30], hips, `labelRivet${i}`);
  }

  // Dotted corner rivet runs emphasize folded construction.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      sphere(0.012, METAL_DARK, [s * 0.33, 1.10 + i * 0.12, 0.265], hips, `torsoRivet${s}${i}`);
    }
  }

  return b.root;
}
