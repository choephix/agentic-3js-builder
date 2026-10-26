import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

const KRAFT = "#b97842";
const KRAFT_LIGHT = "#d39a5d";
const KRAFT_TOP = "#e1b477";
const KRAFT_DARK = "#754323";
const EDGE = "#5a321d";
const TAPE = "#e7c37d";
const TAPE_SHADOW = "#b98b4d";
const INK = "#2b211b";
const INK_SOFT = "#4a3020";
const SKIN = "#f0b27c";
const SKIN_SHADOW = "#c97750";
const HAIR = "#5b3020";
const WHITE = "#fff1ce";
const BLACK = "#18151a";
const RED = "#c94332";
const BLUE = "#3f83a5";
const GREEN = "#65a86a";
const YELLOW = "#e7bd43";
const RUBBER = "#28262a";
const COPPER = "#a85f36";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A cheerful child in a hand-built cardboard robot costume, with taped box armor, a blinking chest panel, oversized helmet, wheels, antenna, mitts, boots, and a visible expressive face.",
};

type Bone = any;
type Point = THREE.Vector3 | readonly [number, number, number];

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const sideName = (s: number) => (s > 0 ? "L" : "R");

  function box(
    name: string,
    size: readonly [number, number, number],
    at: Point,
    color: string,
    bone: Bone,
    options: Record<string, any> = {},
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
      ...options,
    });
  }

  function sphere(
    name: string,
    radius: number,
    at: Point,
    color: string,
    bone: Bone,
    scale: readonly [number, number, number] = [1, 1, 1],
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(radius, segments, Math.max(6, Math.floor(segments * 0.75))), color, {
      at,
      bone,
      scale,
      name,
      flat: true,
    });
  }

  function cylinder(
    name: string,
    radius: number,
    height: number,
    at: Point,
    color: string,
    bone: Bone,
    axis: readonly [number, number, number] = [0, 1, 0],
    segments = 10,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone,
      dir: axis,
      name,
      flat: true,
    });
  }

  function cone(
    name: string,
    radius: number,
    height: number,
    at: Point,
    color: string,
    bone: Bone,
    axis: readonly [number, number, number] = [0, 1, 0],
  ) {
    return b.part(new THREE.ConeGeometry(radius, height, 8), color, {
      at,
      bone,
      dir: axis,
      name,
      flat: true,
    });
  }

  function frontDisc(
    name: string,
    radius: number,
    depth: number,
    at: Point,
    color: string,
    bone: Bone,
    segments = 10,
  ) {
    return cylinder(name, radius, depth, at, color, bone, [0, 0, 1], segments);
  }

  function segment(
    name: string,
    a: Point,
    c: Point,
    width: number,
    height: number,
    color: string,
    bone: Bone,
  ) {
    return b.frustumBox(a, c, [width, height], [width * 0.96, height * 0.96], {
      color,
      bone,
      name,
      skin: "rigid",
      flat: true,
    });
  }

  function rod(name: string, a: Point, c: Point, radius: number, color: string, bone: Bone) {
    return b.rod(a, c, radius, { color, bone, name, section: { ngon: 6 } });
  }

  function tapeStrip(
    name: string,
    at: Point,
    size: readonly [number, number, number],
    color: string,
    bone: Bone,
  ) {
    return box(name, size, at, color, bone);
  }

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: the cardboard costume hangs from a readable child-sized humanoid rig.

  const hips = b.joint("hips", {
    at: [0, 0.64, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.64, 0],
      [0, 0.88, 0],
      [0, 1.13, 0],
    ],
    {
      parent: hips,
      names: ["pelvis", "torso", "chest"],
      role: "spine",
    },
  );

  const torsoBone = spine.joints[1];
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    [
      chest.at,
      [0, 1.34, 0.01],
    ],
    {
      parent: chest,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const neckTip = neck.tip ?? neck.joints[neck.joints.length - 1];

  const head = b.joint("head", {
    parent: neckTip,
    at: [0, 1.52, 0.04],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.42, 0.19],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "face",
  });

  const armL = b.chain(
    "armL",
    [
      [0.34, 1.14, 0],
      [0.49, 0.96, 0.015],
      [0.56, 0.73, 0.10],
    ],
    {
      parent: chest,
      names: ["shoulderL", "elbowL", "wristL"],
      role: "arm",
      contact: [0.57, 0.64, 0.12],
    },
  );

  const armR = b.chain(
    "armR",
    [
      [-0.34, 1.14, 0],
      [-0.49, 0.96, 0.015],
      [-0.56, 0.73, 0.10],
    ],
    {
      parent: chest,
      names: ["shoulderR", "elbowR", "wristR"],
      role: "arm",
      contact: [-0.57, 0.64, 0.12],
    },
  );

  const legL = b.chain(
    "legL",
    [
      [0.17, 0.65, 0],
      [0.20, 0.39, 0.025],
      [0.18, 0.15, 0.055],
      [0.18, 0.10, 0.20],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.18, 0, 0.24],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.17, 0.65, 0],
      [-0.20, 0.39, 0.025],
      [-0.18, 0.15, 0.055],
      [-0.18, 0.10, 0.20],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.18, 0, 0.24],
    },
  );

  // A slightly open hinged jaw makes the face animate cleanly.
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  // ------------------------------------------------------------------------------------------------
  // Main cardboard body: overlapping boxes give the silhouette of a handmade costume.

  const belly = box("bellyBox", [0.58, 0.25, 0.39], [0, 0.77, 0], KRAFT, torsoBone);
  const torso = box("largeTorsoBox", [0.64, 0.54, 0.43], [0, 1.02, 0], KRAFT_LIGHT, chest);
  const shoulderBar = box("shoulderBar", [0.76, 0.16, 0.42], [0, 1.25, 0], KRAFT, chest);
  const lowerFlap = box("lowerFrontFlap", [0.55, 0.18, 0.035], [0, 0.67, 0.215], KRAFT_TOP, torsoBone);

  // Handmade edge rails around the torso.
  box("torsoFrontLeftEdge", [0.022, 0.51, 0.028], [0.305, 1.02, 0.224], EDGE, chest);
  box("torsoFrontRightEdge", [0.022, 0.51, 0.028], [-0.305, 1.02, 0.224], EDGE, chest);
  box("torsoTopEdge", [0.61, 0.024, 0.03], [0, 1.275, 0.224], EDGE, chest);
  box("torsoBottomEdge", [0.57, 0.026, 0.03], [0, 0.745, 0.224], EDGE, torsoBone);
  box("torsoLeftSideEdge", [0.03, 0.48, 0.025], [0.325, 1.02, 0.02], EDGE, chest);
  box("torsoRightSideEdge", [0.03, 0.48, 0.025], [-0.325, 1.02, 0.02], EDGE, chest);

  // Corrugation lines, especially visible on the exposed lower flap and side faces.
  for (let i = 0; i < 6; i++) {
    const y = 0.70 + i * 0.036;
    box(`lowerCorrugation${i}`, [0.48, 0.009, 0.012], [0, y, 0.238], KRAFT_DARK, torsoBone);
  }

  for (let i = 0; i < 5; i++) {
    const y = 0.83 + i * 0.073;
    box(`leftSideCorrugation${i}`, [0.012, 0.022, 0.31], [0.338, y, 0.01], KRAFT_DARK, torsoBone);
    box(`rightSideCorrugation${i}`, [0.012, 0.022, 0.31], [-0.338, y, 0.01], KRAFT_DARK, torsoBone);
  }

  // Broad packing tape down one corner and across the lower seam.
  tapeStrip("torsoTapeVertical", [0.245, 1.01, 0.242], [0.045, 0.47, 0.012], TAPE, chest);
  tapeStrip("torsoTapeLower", [0, 0.755, 0.244], [0.52, 0.045, 0.014], TAPE_SHADOW, torsoBone);
  tapeStrip("torsoTapeShoulderL", [0.20, 1.255, 0.235], [0.18, 0.038, 0.014], TAPE, chest);
  tapeStrip("torsoTapeShoulderR", [-0.20, 1.255, 0.235], [0.18, 0.038, 0.014], TAPE, chest);

  // ------------------------------------------------------------------------------------------------
  // Chest control panel, assembled like a child's decorated cereal-box robot.

  box("chestPanelShadow", [0.43, 0.27, 0.026], [0, 1.01, 0.238], EDGE, chest);
  box("chestPanel", [0.39, 0.235, 0.022], [0, 1.015, 0.255], KRAFT_DARK, chest);

  box("panelTopTape", [0.40, 0.018, 0.016], [0, 1.143, 0.271], TAPE, chest);
  box("panelBottomTape", [0.40, 0.018, 0.016], [0, 0.887, 0.271], TAPE, chest);
  box("panelLeftTape", [0.018, 0.24, 0.016], [0.195, 1.015, 0.271], TAPE, chest);
  box("panelRightTape", [0.018, 0.24, 0.016], [-0.195, 1.015, 0.271], TAPE, chest);

  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48">
      <rect width="240" height="48" rx="5" fill="#e7c37d"/>
      <path d="M8 7H232V41H8Z" fill="none" stroke="#5a321d" stroke-width="4"/>
      <text x="120" y="33" text-anchor="middle" font-family="monospace" font-size="25" font-weight="bold" fill="#2b211b">ROBO KID</text>
    </svg>`,
    { size: 256 },
  );

  b.part(new THREE.PlaneGeometry(0.28, 0.056), WHITE, {
    at: [0, 1.105, 0.274],
    bone: chest,
    dir: [0, 0, 1],
    axis: "z",
    texture: labelTexture,
    name: "roboKidLabel",
  });

  const emblem = b.extrude(
    [
      [-0.025, 0.075],
      [0.018, 0.025],
      [0.048, 0.025],
      [0.005, -0.075],
      [0.005, -0.015],
      [-0.046, -0.015],
    ],
    {
      at: [0, 0.995, 0.278],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.002,
      color: YELLOW,
      bone: chest,
      name: "lightningEmblem",
    },
  );

  frontDisc("emblemBoltRivet", 0.012, 0.016, [0, 0.995, 0.291], RED, chest, 8);

  // Three chunky switches and a tiny colored status row.
  box("switchHousing", [0.17, 0.07, 0.026], [0, 0.93, 0.282], INK, chest);
  cylinder("switchRed", 0.022, 0.018, [-0.052, 0.93, 0.302], RED, chest, [0, 0, 1], 8);
  cylinder("switchBlue", 0.022, 0.018, [0, 0.93, 0.302], BLUE, chest, [0, 0, 1], 8);
  cylinder("switchGreen", 0.022, 0.018, [0.052, 0.93, 0.302], GREEN, chest, [0, 0, 1], 8);

  for (let i = 0; i < 5; i++) {
    const statusColors = [RED, YELLOW, GREEN, BLUE, RED];
    cylinder(`statusLight${i}`, 0.009, 0.014, [-0.14 + i * 0.07, 1.175, 0.282], statusColors[i], chest, [0, 0, 1], 7);
  }

  // Panel rivets.
  for (const [i, p] of [
    [0, [0.17, 1.125, 0.289]],
    [1, [-0.17, 1.125, 0.289]],
    [2, [0.17, 0.90, 0.289]],
    [3, [-0.17, 0.90, 0.289]],
  ] as Array<[number, [number, number, number]]>) {
    frontDisc(`panelRivet${i}`, 0.012, 0.012, p, KRAFT_TOP, chest, 8);
  }

  // A little loose wire tucked beneath the panel.
  rod("panelWireRed", [-0.12, 0.89, 0.29], [-0.09, 0.84, 0.29], 0.006, RED, chest);
  rod("panelWireBlue", [-0.07, 0.89, 0.29], [-0.04, 0.84, 0.29], 0.006, BLUE, chest);
  rod("panelWireGreen", [0.12, 0.89, 0.29], [0.09, 0.84, 0.29], 0.006, GREEN, chest);

  // Surface-seated rivets make the front plate feel fastened to the box.
  const torsoSurface = b.surface(torso);
  let torsoRivetIndex = 0;
  for (const x of [-0.27, 0.27]) {
    for (const y of [0.82, 0.94, 1.08, 1.20]) {
      const hit = torsoSurface.ray([x, y, 1], [0, 0, -1]);
      if (hit) {
        b.stick(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8), TAPE, hit, {
          embed: 0.48,
          name: `seatedTorsoRivet${torsoRivetIndex++}`,
        });
      }
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Neck collar and cardboard shoulders.

  cylinder("neckCollarShadow", 0.21, 0.085, [0, 1.30, 0], EDGE, chest, [0, 1, 0], 8);
  cylinder("neckCollar", 0.205, 0.065, [0, 1.32, 0], KRAFT_TOP, chest, [0, 1, 0], 8);
  box("neckTapeFront", [0.14, 0.038, 0.025], [0, 1.318, 0.205], TAPE, chest);

  for (const s of [1, -1]) {
    const side = sideName(s);

    box(`shoulderArmor${side}`, [0.19, 0.22, 0.43], [s * 0.375, 1.18, 0], KRAFT_LIGHT, chest);
    box(`shoulderArmorEdge${side}`, [0.025, 0.20, 0.44], [s * 0.475, 1.18, 0], EDGE, chest);
    box(`shoulderTape${side}`, [0.20, 0.035, 0.018], [s * 0.375, 1.265, 0.225], TAPE, chest);
    frontDisc(`shoulderBolt${side}`, 0.027, 0.018, [s * 0.375, 1.185, 0.225], COPPER, chest, 8);
    frontDisc(`shoulderBoltInner${side}`, 0.010, 0.022, [s * 0.375, 1.185, 0.239], KRAFT_TOP, chest, 8);

    box(`shoulderSideFold${side}`, [0.024, 0.15, 0.28], [s * 0.485, 1.18, 0.02], KRAFT_DARK, chest);
  }

  // ------------------------------------------------------------------------------------------------
  // Box helmet, face opening, ears, helmet wheels, and antenna.

  const helmet = box("helmetShell", [0.49, 0.41, 0.40], [0, 1.52, 0.045], KRAFT_LIGHT, head);
  box("helmetTopPanel", [0.38, 0.035, 0.31], [0, 1.735, 0.045], KRAFT_TOP, head);
  box("helmetTopSeam", [0.40, 0.018, 0.026], [0, 1.753, 0.045], EDGE, head);
  box("helmetBottomSeam", [0.45, 0.024, 0.03], [0, 1.307, 0.045], EDGE, head);
  box("helmetFrontLeftEdge", [0.032, 0.40, 0.032], [0.238, 1.52, 0.255], EDGE, head);
  box("helmetFrontRightEdge", [0.032, 0.40, 0.032], [-0.238, 1.52, 0.255], EDGE, head);

  // Dark opening is deliberately behind the child's face.
  box("helmetFaceOpening", [0.35, 0.27, 0.018], [0, 1.515, 0.254], INK, head);
  box("helmetOpeningTopTape", [0.37, 0.035, 0.022], [0, 1.665, 0.274], TAPE, head);
  box("helmetOpeningBottomTape", [0.37, 0.035, 0.022], [0, 1.365, 0.274], TAPE, head);
  box("helmetOpeningLeftTape", [0.035, 0.30, 0.022], [0.185, 1.515, 0.274], TAPE_SHADOW, head);
  box("helmetOpeningRightTape", [0.035, 0.30, 0.022], [-0.185, 1.515, 0.274], TAPE_SHADOW, head);

  const headSurface = b.surface(helmet);
  let helmetRivetIndex = 0;
  for (const x of [-0.205, 0.205]) {
    for (const y of [1.40, 1.63]) {
      const hit = headSurface.ray([x, y, 1], [0, 0, -1]);
      if (hit) {
        b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.014, 8), TAPE, hit, {
          embed: 0.45,
          name: `helmetRivet${helmetRivetIndex++}`,
        });
      }
    }
  }

  // Side ears are layered cardboard discs rather than smooth robot parts.
  for (const s of [1, -1]) {
    const side = sideName(s);
    cylinder(`helmetWheelDark${side}`, 0.115, 0.055, [s * 0.275, 1.525, 0.035], EDGE, head, [s, 0, 0], 10);
    cylinder(`helmetWheel${side}`, 0.087, 0.062, [s * 0.305, 1.525, 0.035], KRAFT_TOP, head, [s, 0, 0], 10);
    cylinder(`helmetWheelHub${side}`, 0.035, 0.070, [s * 0.34, 1.525, 0.035], COPPER, head, [s, 0, 0], 8);
    cylinder(`helmetWheelHubCap${side}`, 0.014, 0.077, [s * 0.382, 1.525, 0.035], TAPE, head, [s, 0, 0], 8);
    box(`helmetSideTape${side}`, [0.024, 0.29, 0.035], [s * 0.25, 1.525, 0.10], TAPE, head);
  }

  // Antenna mast and a playful red signal ball.
  rod("antennaMast", [0, 1.735, 0.05], [0, 1.875, 0.05], 0.015, EDGE, head);
  box("antennaTape", [0.055, 0.04, 0.045], [0, 1.81, 0.05], TAPE, head);
  sphere("antennaSignal", 0.046, [0, 1.925, 0.05], RED, head, [1, 1, 1], 8);
  sphere("antennaHighlight", 0.012, [-0.014, 1.942, 0.076], KRAFT_TOP, head, [1, 1, 1], 7);

  // ------------------------------------------------------------------------------------------------
  // Child's face inside the helmet.

  sphere("childFace", 0.145, [0, 1.515, 0.278], SKIN, head, [1.02, 1.14, 0.58], 12);
  sphere("leftCheek", 0.047, [0.105, 1.465, 0.346], SKIN_SHADOW, head, [1.2, 0.75, 0.42], 8);
  sphere("rightCheek", 0.047, [-0.105, 1.465, 0.346], SKIN_SHADOW, head, [1.2, 0.75, 0.42], 8);

  // Hair peeks between the cardboard helmet and the forehead.
  for (const [i, x] of [-0.13, -0.065, 0, 0.065, 0.13].entries()) {
    cone(`hairLock${i}`, 0.042, 0.13, [x, 1.69, 0.245], HAIR, head, [0, 1, 0]);
  }
  box("hairline", [0.30, 0.045, 0.045], [0, 1.665, 0.275], HAIR, head);

  // Large friendly eyes, built from layered discs and tiny highlights.
  for (const s of [1, -1]) {
    const side = sideName(s);
    const x = s * 0.068;
    frontDisc(`eyeWhite${side}`, 0.042, 0.015, [x, 1.56, 0.373], WHITE, head, 12);
    frontDisc(`eyeIris${side}`, 0.025, 0.019, [x, 1.558, 0.389], BLUE, head, 10);
    frontDisc(`eyePupil${side}`, 0.012, 0.022, [x, 1.558, 0.401], BLACK, head, 8);
    sphere(`eyeSpark${side}`, 0.006, [x - s * 0.009, 1.572, 0.414], WHITE, head, [1, 1, 0.5], 6);
    box(`eyebrow${side}`, [0.074, 0.018, 0.014], [x, 1.625, 0.382], HAIR, head);
  }

  sphere("buttonNose", 0.028, [0, 1.515, 0.405], SKIN_SHADOW, head, [0.75, 0.75, 0.8], 8);

  // Mouth is split between the head and the jaw hinge.
  box("upperMouthLine", [0.082, 0.012, 0.012], [0, 1.475, 0.397], INK_SOFT, head);
  box("lowerJawSkin", [0.105, 0.055, 0.07], [0, 1.438, 0.31], SKIN, jaw);
  box("openMouth", [0.072, 0.024, 0.014], [0, 1.455, 0.369], INK, jaw);
  box("lowerLip", [0.060, 0.012, 0.014], [0, 1.425, 0.386], SKIN_SHADOW, jaw);

  // Two little cardboard cheek tabs frame the face.
  box("faceTabL", [0.045, 0.12, 0.022], [0.207, 1.515, 0.27], KRAFT_TOP, head);
  box("faceTabR", [0.045, 0.12, 0.022], [-0.207, 1.515, 0.27], KRAFT_TOP, head);

  // ------------------------------------------------------------------------------------------------
  // Boxy arms, cuffs, mitts, thumbs, and hand-made seam marks.

  for (const s of [1, -1]) {
    const side = sideName(s);
    const arm = s > 0 ? armL : armR;
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];

    segment(`upperSleeve${side}`, arm.at(0), arm.at(1), 0.16, 0.18, KRAFT_LIGHT, shoulder);
    segment(`lowerSleeve${side}`, arm.at(1), arm.at(2), 0.145, 0.17, KRAFT, elbow);

    box(`elbowCap${side}`, [0.18, 0.13, 0.19], [s * 0.50, 0.95, 0.035], KRAFT_TOP, elbow);
    box(`elbowSeam${side}`, [0.19, 0.018, 0.20], [s * 0.50, 0.90, 0.145], EDGE, elbow);

    box(`upperSleeveTape${side}`, [0.18, 0.038, 0.19], [s * 0.425, 1.04, 0.035], TAPE, shoulder);
    box(`lowerSleeveTape${side}`, [0.17, 0.034, 0.18], [s * 0.545, 0.78, 0.10], TAPE_SHADOW, elbow);

    frontDisc(`elbowRivet${side}`, 0.022, 0.017, [s * 0.50, 0.96, 0.145], COPPER, elbow, 8);
    frontDisc(`wristRivet${side}`, 0.015, 0.016, [s * 0.56, 0.73, 0.205], TAPE, wrist, 8);

    // Oversized mitts read more like a child inside the suit than robot claws.
    box(`mittPalm${side}`, [0.19, 0.17, 0.19], [s * 0.575, 0.63, 0.12], KRAFT_LIGHT, wrist);
    box(`mittPalmShadow${side}`, [0.17, 0.025, 0.16], [s * 0.575, 0.545, 0.12], KRAFT_DARK, wrist);
    box(`mittThumb${side}`, [0.09, 0.095, 0.12], [s * 0.675, 0.655, 0.10], KRAFT_TOP, wrist);
    box(`mittThumbSeam${side}`, [0.018, 0.10, 0.13], [s * 0.715, 0.655, 0.10], EDGE, wrist);

    for (let i = 0; i < 3; i++) {
      box(
        `mittFinger${side}${i}`,
        [0.045, 0.075, 0.095],
        [s * (0.53 + i * 0.045), 0.565, 0.22],
        i === 1 ? KRAFT_TOP : KRAFT,
        wrist,
      );
      box(
        `mittFingerSeam${side}${i}`,
        [0.047, 0.012, 0.10],
        [s * (0.53 + i * 0.045), 0.606, 0.268],
        EDGE,
        wrist,
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Cardboard legs, knee plates, boots, soles, and toe caps.

  for (const s of [1, -1]) {
    const side = sideName(s);
    const leg = s > 0 ? legL : legR;
    const thighBone = leg.joints[0];
    const shinBone = leg.joints[1];
    const ankleBone = leg.joints[2];
    const footBone = leg.joints[3];

    segment(`thighBox${side}`, leg.at(0), leg.at(1), 0.205, 0.20, KRAFT_LIGHT, thighBone);
    segment(`shinBox${side}`, leg.at(1), leg.at(2), 0.18, 0.18, KRAFT, shinBone);

    box(`kneePadShadow${side}`, [0.20, 0.16, 0.035], [s * 0.20, 0.39, 0.145], EDGE, shinBone);
    box(`kneePad${side}`, [0.16, 0.12, 0.025], [s * 0.20, 0.40, 0.17], KRAFT_TOP, shinBone);
    frontDisc(`kneeRivet${side}`, 0.018, 0.016, [s * 0.20, 0.40, 0.193], COPPER, shinBone, 8);

    box(`thighTape${side}`, [0.21, 0.035, 0.21], [s * 0.185, 0.54, 0.06], TAPE, thighBone);
    box(`shinTape${side}`, [0.19, 0.035, 0.19], [s * 0.19, 0.23, 0.10], TAPE_SHADOW, shinBone);
    box(`ankleCuff${side}`, [0.22, 0.11, 0.22], [s * 0.18, 0.145, 0.08], KRAFT_TOP, ankleBone);
    box(`ankleCuffEdge${side}`, [0.225, 0.018, 0.225], [s * 0.18, 0.095, 0.08], EDGE, ankleBone);

    // Feet are deliberately broad and low so the model plants on the floor.
    box(`robotBoot${side}`, [0.29, 0.17, 0.39], [s * 0.18, 0.105, 0.16], KRAFT_LIGHT, footBone);
    box(`robotBootToe${side}`, [0.29, 0.11, 0.16], [s * 0.18, 0.105, 0.34], KRAFT_TOP, footBone);
    box(`bootSole${side}`, [0.31, 0.045, 0.42], [s * 0.18, 0.025, 0.17], RUBBER, footBone);
    box(`bootSoleEdge${side}`, [0.32, 0.022, 0.40], [s * 0.18, 0.052, 0.17], EDGE, footBone);
    box(`bootToeTape${side}`, [0.22, 0.025, 0.018], [s * 0.18, 0.165, 0.41], TAPE, footBone);

    for (let i = 0; i < 3; i++) {
      box(
        `bootToeFold${side}${i}`,
        [0.018, 0.06, 0.025],
        [s * (0.10 + i * 0.08), 0.17, 0.415],
        EDGE,
        footBone,
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Cardboard craft embellishments: tabs, folded corners, handwritten panel marks, and side vents.

  box("leftWaistTab", [0.09, 0.10, 0.035], [0.29, 0.72, 0.23], KRAFT_TOP, torsoBone);
  box("rightWaistTab", [0.09, 0.10, 0.035], [-0.29, 0.72, 0.23], KRAFT_TOP, torsoBone);
  frontDisc("leftWaistPin", 0.014, 0.014, [0.29, 0.72, 0.253], COPPER, torsoBone, 8);
  frontDisc("rightWaistPin", 0.014, 0.014, [-0.29, 0.72, 0.253], COPPER, torsoBone, 8);

  // Hand-drawn faux vents on the upper chest.
  for (let i = 0; i < 4; i++) {
    box(`ventLine${i}`, [0.085, 0.012, 0.014], [0.11, 1.205 - i * 0.026, 0.282], INK_SOFT, chest);
    box(`ventLineMirror${i}`, [0.085, 0.012, 0.014], [-0.11, 1.205 - i * 0.026, 0.282], INK_SOFT, chest);
  }

  // A rough marker-drawn lightning on each side panel.
  for (const s of [1, -1]) {
    const side = sideName(s);
    b.extrude(
      [
        [-0.045, 0.04],
        [0.015, 0.01],
        [-0.005, -0.015],
        [0.05, -0.075],
        [-0.015, -0.025],
        [0.005, 0.01],
        [-0.045, 0.045],
      ],
      {
        at: [s * 0.345, 1.03, 0.16],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.001,
        color: YELLOW,
        bone: chest,
        name: `sideLightning${side}`,
      },
    );
  }

  // Tiny dark stitch marks along a few tape edges.
  for (let i = 0; i < 7; i++) {
    box(`tapeStitch${i}`, [0.012, 0.006, 0.018], [-0.13 + i * 0.043, 0.775, 0.258], INK_SOFT, torsoBone);
  }

  // Loose side straps, each made from short cardboard blocks.
  for (const s of [1, -1]) {
    const side = sideName(s);
    box(`sideStrapUpper${side}`, [0.025, 0.17, 0.035], [s * 0.325, 1.15, 0.13], TAPE, chest);
    box(`sideStrapLower${side}`, [0.025, 0.17, 0.035], [s * 0.325, 0.88, 0.13], TAPE, torsoBone);
    box(`sideStrapBuckle${side}`, [0.045, 0.07, 0.045], [s * 0.325, 1.01, 0.145], COPPER, chest);
    box(`sideStrapBuckleHole${side}`, [0.025, 0.030, 0.012], [s * 0.325, 1.01, 0.17], INK, chest);
  }

  // ------------------------------------------------------------------------------------------------
  // A few deliberately chunky cardboard "robot" mechanisms.

  // Waist gear made from layered octagonal cylinders.
  cylinder("waistGearShadow", 0.13, 0.038, [0, 0.70, 0.21], EDGE, torsoBone, [0, 0, 1], 10);
  cylinder("waistGear", 0.105, 0.044, [0, 0.70, 0.235], COPPER, torsoBone, [0, 0, 1], 10);
  cylinder("waistGearHub", 0.035, 0.050, [0, 0.70, 0.265], TAPE, torsoBone, [0, 0, 1], 8);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    frontDisc(
      `waistGearTooth${i}`,
      0.018,
      0.036,
      [Math.cos(a) * 0.115, 0.70 + Math.sin(a) * 0.115, 0.246],
      COPPER,
      torsoBone,
      6,
    );
  }

  // Two side "battery" cartridges.
  for (const s of [1, -1]) {
    const side = sideName(s);
    box(`battery${side}`, [0.08, 0.20, 0.12], [s * 0.36, 0.89, -0.16], KRAFT_DARK, torsoBone);
    box(`batteryLabel${side}`, [0.05, 0.11, 0.014], [s * 0.36, 0.89, -0.226], TAPE, torsoBone);
    for (let i = 0; i < 3; i++) {
      box(`batteryStripe${side}${i}`, [0.035, 0.012, 0.016], [s * 0.36, 0.85 + i * 0.035, -0.238], RED, torsoBone);
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Final accents: cardboard squares on the floor-facing boot edges and a small back fin.

  for (const s of [1, -1]) {
    const side = sideName(s);
    box(`bootSidePatch${side}`, [0.018, 0.10, 0.13], [s * 0.335, 0.12, 0.20], TAPE_SHADOW, footBone);
    box(`bootSidePatchEdge${side}`, [0.022, 0.012, 0.14], [s * 0.347, 0.17, 0.20], EDGE, footBone);
  }

  // A folded cardboard fin on the back gives the silhouette a playful robot profile.
  b.extrude(
    [
      [-0.16, 0],
      [0.16, 0],
      [0.12, 0.22],
      [0, 0.31, "sharp"],
      [-0.12, 0.22],
    ],
    {
      at: [0, 0.91, -0.225],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.002,
      color: KRAFT_TOP,
      bone: torsoBone,
      name: "backCardboardFin",
    },
  );

  box("backFinCenterTape", [0.045, 0.27, 0.035], [0, 1.06, -0.246], TAPE, torsoBone);

  return b.root;
}
