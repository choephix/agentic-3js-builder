import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  paint,
  noise,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A charming child in a hand-built cardboard robot costume, with a box torso, square robot head, rivets, taped seams, chunky limbs, antenna, face screen, and expressive glowing-looking paper eyes.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot", detail: 1 });

  const INK = "#25232b";
  const DARK = "#69452d";
  const TAPE = "#d49b58";
  const TAPE_LIGHT = "#e7bd7c";
  const CARDBOARD = paint((p, n) => {
    const grain = noise(p, 0.09, 14);
    const warm = 0.82 + 0.18 * grain;
    const top = 0.92 + Math.max(0, n.y) * 0.08;
    return [0.62 * warm * top, 0.38 * warm * top, 0.19 * warm * top];
  });
  const CARDBOARD_LIGHT = paint((p, n) => {
    const grain = noise(p, 0.065, 27);
    const warm = 0.9 + 0.1 * grain;
    const top = 0.9 + Math.max(0, n.y) * 0.1;
    return [0.79 * warm * top, 0.56 * warm * top, 0.31 * warm * top];
  });
  const EDGE = "#8b5b38";
  const RUBBER = "#272a32";
  const RED = "#bd3b2f";
  const BLUE = "#386c91";
  const YELLOW = "#edbd42";
  const PAPER_WHITE = "#f8e9c7";
  const EYE_TEX = svg(
    `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="96" fill="#24232b"/>
      <rect x="5" y="5" width="118" height="86" rx="9" fill="#172b31" stroke="#d49b58" stroke-width="4"/>
      <ellipse cx="39" cy="47" rx="18" ry="24" fill="#f7e8bd" stroke="#161820" stroke-width="5"/>
      <ellipse cx="89" cy="47" rx="18" ry="24" fill="#f7e8bd" stroke="#161820" stroke-width="5"/>
      <circle cx="42" cy="51" r="8" fill="#397c8a"/>
      <circle cx="86" cy="51" r="8" fill="#397c8a"/>
      <circle cx="42" cy="51" r="3.5" fill="#161820"/>
      <circle cx="86" cy="51" r="3.5" fill="#161820"/>
      <circle cx="37" cy="44" r="3" fill="#fff9db"/>
      <circle cx="81" cy="44" r="3" fill="#fff9db"/>
      <path d="M57 70 Q64 77 71 70" fill="none" stroke="#e4ae54" stroke-width="4" stroke-linecap="round"/>
      <path d="M13 18 H34 M94 18 H115" stroke="#edbd42" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const CHEST_TEX = svg(
    `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="120" fill="#25313a" stroke="#d49b58" stroke-width="5"/>
      <path d="M80 18 L91 46 L121 48 L98 66 L106 96 L80 79 L54 96 L62 66 L39 48 L69 46 Z"
        fill="#edbd42" stroke="#1f2027" stroke-width="5"/>
      <circle cx="23" cy="20" r="6" fill="#bd3b2f"/>
      <circle cx="137" cy="20" r="6" fill="#386c91"/>
      <path d="M18 101 H142" stroke="#d49b58" stroke-width="4" stroke-dasharray="7 7"/>
    </svg>`,
    { size: 256 },
  );
  const LABEL_TEX = svg(
    `<svg viewBox="0 0 180 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="48" rx="7" fill="#e7bd7c" stroke="#69452d" stroke-width="4"/>
      <text x="90" y="33" text-anchor="middle" font-family="sans-serif" font-weight="bold"
        font-size="25" fill="#25232b">KID-BOT</text>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton first: one root, a child head/jaw, and recognizable limb chains.
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.82, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.82, 0],
      [0, 1.02, 0],
      [0, 1.22, 0],
    ]),
    {
      parent: hips,
      names: ["spineLow", "spineHigh"],
      role: "spine",
      group: "body",
    },
  );
  const neck = b.joint("neck", {
    parent: spine.joints[1],
    at: [0, 1.28, 0.02],
    dir: [0, 1, 0],
    role: "neck",
    group: "body",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.48, 0.04],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.35, 0.18],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const shoulderL = [0.37, 1.18, 0.01] as [number, number, number];
  const shoulderR = [-0.37, 1.18, 0.01] as [number, number, number];
  const handL = [0.59, 0.82, 0.08] as [number, number, number];
  const handR = [-0.59, 0.82, 0.08] as [number, number, number];

  const armL = b.chain(
    "armL",
    catmull([shoulderL, [0.46, 1.03, 0.04], handL]),
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL"],
      role: "arm",
      group: "limbs",
    },
  );
  const armR = b.chain(
    "armR",
    catmull([shoulderR, [-0.46, 1.03, 0.04], handR]),
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR"],
      role: "arm",
      group: "limbs",
    },
  );

  const legL = b.chain(
    "legL",
    polyline([
      [0.17, 0.78, 0],
      [0.18, 0.48, 0.02],
      [0.18, 0.19, 0.08],
      [0.18, 0.12, 0.22],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.18, 0, 0.25],
      group: "limbs",
    },
  );
  const legR = b.chain(
    "legR",
    polyline([
      [-0.17, 0.78, 0],
      [-0.18, 0.48, 0.02],
      [-0.18, 0.19, 0.08],
      [-0.18, 0.12, 0.22],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.18, 0, 0.25],
      group: "limbs",
    },
  );

  // ---------------------------------------------------------------------------
  // Helpers for the cardboard construction language.
  // ---------------------------------------------------------------------------
  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any = CARDBOARD,
    bone: any = hips,
    name = "cardboardBox",
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      flat: true,
      name,
    });

  const cylinder = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    bone: any = hips,
    name = "roundPart",
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, depth, 8, 1),
      color,
      { at, dir, bone, flat: true, name },
    );

  const seam = (
    at: [number, number, number],
    size: [number, number, number],
    bone: any = hips,
    color: any = TAPE,
    name = "tapeSeam",
  ) => box(size, at, color, bone, name);

  const rivet = (
    at: [number, number, number],
    radius = 0.018,
    dir: [number, number, number] = [0, 0, 1],
    bone: any = hips,
    color: any = EDGE,
  ) => cylinder(radius, 0.012, at, color, dir, bone, "paperRivet");

  const panel = (
    at: [number, number, number],
    size: [number, number],
    texture: THREE.Texture,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      bone,
      name,
    });

  // ---------------------------------------------------------------------------
  // Torso: an oversized shipping box worn as a robot chest.
  // ---------------------------------------------------------------------------
  box([0.72, 0.63, 0.48], [0, 1.04, 0.01], CARDBOARD, hips, "largeTorsoBox");
  box([0.64, 0.06, 0.43], [0, 0.735, 0.01], CARDBOARD_LIGHT, hips, "lowerTorsoFlap");
  seam([0, 1.04, 0.255], [0.66, 0.018, 0.018], hips, TAPE_LIGHT, "chestTopTape");
  seam([0, 1.04, -0.245], [0.66, 0.018, 0.018], hips, TAPE, "chestBackTape");
  seam([0.365, 1.04, 0.01], [0.018, 0.62, 0.018], hips, TAPE, "leftCornerTape");
  seam([-0.365, 1.04, 0.01], [0.018, 0.62, 0.018], hips, TAPE, "rightCornerTape");
  seam([0, 1.04, 0.01], [0.024, 0.62, 0.024], hips, TAPE_LIGHT, "centerPackingTape");
  panel([0, 1.08, 0.258], [0.38, 0.285], CHEST_TEX, hips, "chestStarPanel");
  panel([0, 0.79, 0.255], [0.28, 0.07], LABEL_TEX, hips, "kidBotLabel");

  for (const x of [-0.28, 0.28]) {
    for (const y of [0.82, 1.27]) {
      rivet([x, y, 0.266], 0.018, [0, 0, 1], hips, EDGE);
      rivet([x, y, -0.266], 0.018, [0, 0, -1], hips, EDGE);
    }
  }
  cylinder(0.036, 0.014, [-0.25, 1.01, 0.268], RED, [0, 0, 1], hips, "redChestLight");
  cylinder(0.036, 0.014, [0.25, 1.01, 0.268], BLUE, [0, 0, 1], hips, "blueChestLight");

  // Small cardboard shoulder boxes.
  box([0.18, 0.20, 0.24], [0.39, 1.16, 0.01], CARDBOARD_LIGHT, spine.joints[1], "leftShoulderPad");
  box([0.18, 0.20, 0.24], [-0.39, 1.16, 0.01], CARDBOARD_LIGHT, spine.joints[1], "rightShoulderPad");
  for (const s of [1, -1]) {
    seam([s * 0.39, 1.16, 0.135], [0.13, 0.018, 0.018], spine.joints[1], TAPE, "shoulderTape");
    rivet([s * 0.39, 1.22, 0.14], 0.014, [0, 0, 1], spine.joints[1]);
  }

  // ---------------------------------------------------------------------------
  // Head box and face: deliberately larger and more expressive than the body.
  // ---------------------------------------------------------------------------
  box([0.54, 0.45, 0.46], [0, 1.51, 0.05], CARDBOARD_LIGHT, head, "squareRobotHead");
  seam([0, 1.735, 0.05], [0.50, 0.022, 0.022], head, TAPE_LIGHT, "headTopTape");
  seam([0, 1.285, 0.05], [0.50, 0.022, 0.022], head, TAPE, "headBottomTape");
  seam([0.285, 1.51, 0.05], [0.018, 0.39, 0.018], head, TAPE, "headSideTapeL");
  seam([-0.285, 1.51, 0.05], [0.018, 0.39, 0.018], head, TAPE, "headSideTapeR");
  panel([0, 1.51, 0.292], [0.42, 0.305], EYE_TEX, head, "animatedFaceScreen");

  // Side ear / speaker discs.
  for (const s of [1, -1]) {
    cylinder(0.095, 0.035, [s * 0.305, 1.51, 0.05], DARK, [1, 0, 0], head, "earSpeaker");
    cylinder(0.052, 0.04, [s * 0.328, 1.51, 0.05], TAPE_LIGHT, [1, 0, 0], head, "speakerCenter");
    for (let i = 0; i < 4; i++) {
      const z = 0.02 + i * 0.025;
      cylinder(0.006, 0.046, [s * 0.35, 1.51, z], INK, [1, 0, 0], head, "speakerSlot");
    }
  }

  // Open lower jaw, with a dark mouth cavity and two paper teeth.
  box([0.38, 0.10, 0.25], [0, 1.285, 0.19], CARDBOARD, jaw, "lowerJaw");
  box([0.29, 0.035, 0.018], [0, 1.33, 0.325], INK, jaw, "mouthDarkGap");
  box([0.045, 0.055, 0.025], [0.10, 1.30, 0.335], PAPER_WHITE, jaw, "toothL");
  box([0.045, 0.055, 0.025], [-0.10, 1.30, 0.335], PAPER_WHITE, jaw, "toothR");
  b.pose(jaw, { axis: [1, 0, 0], deg: -9 });

  // Antenna, warning flag, and antenna cap.
  cylinder(0.018, 0.20, [0, 1.87, 0.05], EDGE, [0, 1, 0], head, "antennaStem");
  cylinder(0.052, 0.065, [0, 1.985, 0.05], RED, [0, 1, 0], head, "antennaLamp");
  b.extrude(
    [
      [0, 0],
      [0.14, 0],
      [0.11, 0.10],
      [0.02, 0.15],
    ],
    {
      at: [0.018, 1.92, 0.05],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: YELLOW,
      bone: head,
      name: "antennaWarningFlag",
    },
  );

  // ---------------------------------------------------------------------------
  // Arms: boxy upper sleeves, exposed joint, forearm boxes, mitten hands.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR;
    const shoulder = s > 0 ? shoulderL : shoulderR;
    const elbow = s > 0 ? [0.46, 1.03, 0.04] : [-0.46, 1.03, 0.04];
    const hand = s > 0 ? handL : handR;
    box([0.16, 0.25, 0.20], [s * 0.43, 1.07, 0.04], CARDBOARD, arm.joints[0], "boxyUpperArm");
    cylinder(0.055, 0.08, [elbow[0], elbow[1], elbow[2] + 0.02], RUBBER, [0, 0, 1], arm.joints[1], "elbowJoint");
    box([0.15, 0.25, 0.19], [s * 0.53, 0.91, 0.08], CARDBOARD_LIGHT, arm.joints[1], "boxyForearm");
    seam([s * 0.53, 0.91, 0.185], [0.13, 0.018, 0.018], arm.joints[1], TAPE, "forearmTape");
    box([0.19, 0.17, 0.18], [hand[0], hand[1], hand[2] + 0.025], CARDBOARD, arm.tip, "mittenHand");
    for (let i = -1; i <= 1; i++) {
      box(
        [0.045, 0.10, 0.07],
        [hand[0] + i * 0.055, hand[1] - 0.095, hand[2] + 0.08],
        CARDBOARD_LIGHT,
        arm.tip,
        "paperFinger",
      );
    }
    rivet([s * 0.43, 1.16, 0.15], 0.015, [0, 0, 1], arm.joints[0]);
    rivet([s * 0.53, 0.91, 0.19], 0.014, [0, 0, 1], arm.joints[1]);
  }

  // ---------------------------------------------------------------------------
  // Legs: costume shorts/hips, cardboard shin shells, boots with soles and toes.
  // ---------------------------------------------------------------------------
  box([0.42, 0.18, 0.40], [0, 0.75, 0.01], CARDBOARD_LIGHT, hips, "hipSkirtBox");
  seam([0, 0.75, 0.215], [0.38, 0.018, 0.018], hips, TAPE, "hipFrontTape");

  for (const s of [1, -1]) {
    const leg = s > 0 ? legL : legR;
    box([0.20, 0.28, 0.22], [s * 0.17, 0.57, 0.03], CARDBOARD, leg.joints[0], "thighBox");
    cylinder(0.055, 0.08, [s * 0.18, 0.42, 0.15], RUBBER, [0, 0, 1], leg.joints[1], "kneeCap");
    box([0.19, 0.28, 0.21], [s * 0.18, 0.28, 0.07], CARDBOARD_LIGHT, leg.joints[2], "shinBox");
    seam([s * 0.18, 0.28, 0.185], [0.16, 0.018, 0.018], leg.joints[2], TAPE, "shinTape");
    box([0.24, 0.12, 0.40], [s * 0.18, 0.105, 0.18], RUBBER, leg.tip, "rubberBoot");
    box([0.25, 0.055, 0.42], [s * 0.18, 0.035, 0.19], DARK, leg.tip, "bootSole");
    box([0.07, 0.08, 0.08], [s * 0.10, 0.14, 0.37], CARDBOARD_LIGHT, leg.tip, "bootToePatch");
    rivet([s * 0.18, 0.38, 0.185], 0.014, [0, 0, 1], leg.joints[2]);
  }

  // ---------------------------------------------------------------------------
  // Craft details: layered corner guards, labels, bolts, and a little backpack.
  // ---------------------------------------------------------------------------
  box([0.30, 0.42, 0.15], [0, 1.06, -0.31], CARDBOARD, hips, "backpackBox");
  seam([0, 1.06, -0.392], [0.25, 0.018, 0.018], hips, TAPE_LIGHT, "backpackTape");
  seam([0, 1.06, -0.23], [0.25, 0.018, 0.018], hips, TAPE, "backpackInnerTape");
  for (const s of [1, -1]) {
    box([0.05, 0.33, 0.08], [s * 0.14, 1.07, -0.405], TAPE, hips, "backpackStrap");
    rivet([s * 0.11, 1.20, -0.45], 0.014, [0, 0, -1], hips);
  }

  // Chest corner protectors and hand-drawn warning chevrons.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.07, 0],
        [0.07, 0.21],
        [0.03, 0.27],
        [0, 0.21],
      ],
      {
        at: [s * 0.33, 0.84, 0.272],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.01,
        color: TAPE_LIGHT,
        bone: hips,
        name: "cornerCardboardGuard",
      },
    );
  }

  // A few oversized visible packing staples around the silhouette.
  for (const p of [
    [0.33, 1.30, 0.27],
    [-0.33, 1.30, 0.27],
    [0.33, 0.78, 0.27],
    [-0.33, 0.78, 0.27],
    [0.22, 1.74, 0.29],
    [-0.22, 1.74, 0.29],
  ] as [number, number, number][]) {
    rivet(p, 0.012, [0, 0, 1], p[1] > 1.4 ? head : hips, TAPE_LIGHT);
  }

  // Two loose cardboard strips hang from the costume like playful craft fringe.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.08, 0],
        [0.065, 0.28],
        [0.015, 0.34],
        [0, 0.27],
      ],
      {
        at: [s * 0.25, 0.70, 0.25],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: TAPE_LIGHT,
        bone: hips,
        name: "loosePackingTab",
      },
    );
  }

  // A tiny paper badge on the left shoulder and a red emergency button.
  panel([0.40, 1.17, 0.145], [0.11, 0.075], LABEL_TEX, spine.joints[1], "shoulderBadge");
  cylinder(0.028, 0.018, [-0.40, 1.10, 0.145], RED, [0, 0, 1], spine.joints[1], "shoulderButton");

  // Keep the lowest boot soles at the floor and return the builder root.
  return b.root;
}
