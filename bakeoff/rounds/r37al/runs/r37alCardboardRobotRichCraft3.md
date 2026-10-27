```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  paint,
  grain,
  svg,
  frame,
} from "agentic-3js-builder";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description: "A charming child wearing a handmade cardboard robot costume, with taped panels, glowing eyes, antenna, knobs, and chunky boxy limbs.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = "#b9793c";
  const CARDBOARD_LIGHT = "#d59a55";
  const CARDBOARD_DARK = "#70401f";
  const EDGE = "#4a2817";
  const TAPE = "#e2c078";
  const TAPE_DARK = "#a88448";
  const METAL = "#555862";
  const BLACK = "#17151b";
  const EYE = "#68e6ff";
  const RED = "#d94c3d";
  const GREEN = "#72cc65";
  const WHITE = "#f8e7bd";

  const cardPaint = grain(CARDBOARD_LIGHT, CARDBOARD_DARK, {
    size: 0.07,
    axis: "z",
    seed: 12,
  });

  const corrugated = paint((p, n) => {
    const rib = Math.sin(p.x * 95 + p.y * 2) * 0.5 + 0.5;
    return n.y > 0.45
      ? rib > 0.55
        ? CARDBOARD_LIGHT
        : CARDBOARD
      : CARDBOARD;
  });

  const eyeTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="22" fill="#11151b"/>
      <rect x="10" y="10" width="108" height="108" rx="15" fill="#20343b" stroke="#8defff" stroke-width="5"/>
      <circle cx="64" cy="64" r="38" fill="#54dff5"/>
      <circle cx="64" cy="64" r="24" fill="#17252b"/>
      <circle cx="53" cy="52" r="10" fill="white"/>
      <circle cx="84" cy="82" r="5" fill="white"/>
    </svg>`,
    { size: 128 },
  );

  const warningTexture = svg(
    `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="96" rx="8" fill="#291914"/>
      <path d="M8 48 L32 8 L56 48 L32 88 Z M104 48 L128 8 L152 48 L128 88 Z"
        fill="#e2c078" stroke="#1b1210" stroke-width="6"/>
      <path d="M32 26 L32 55 M32 68 L32 74 M128 26 L128 55 M128 68 L128 74"
        stroke="#291914" stroke-width="8" stroke-linecap="round"/>
    </svg>`,
    { size: 160 },
  );

  const mouthTexture = svg(
    `<svg viewBox="0 0 160 54" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="54" rx="15" fill="#17151b"/>
      <path d="M12 15 H148 M12 39 H148" stroke="#e2c078" stroke-width="5"/>
      <path d="M34 15 V39 M64 15 V39 M94 15 V39 M124 15 V39" stroke="#e2c078" stroke-width="4"/>
    </svg>`,
    { size: 160 },
  );

  const box = (size: [number, number, number], color: any, at: any, bone: any, name: string, bevel = 0) => {
    const g = new THREE.BoxGeometry(...size);
    return b.part(g, color, {
      at,
      bone,
      name,
      flat: true,
    });
  };

  const cylinder = (
    radius: number,
    height: number,
    color: any,
    at: any,
    bone: any,
    name: string,
    radial = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      bone,
      name,
      flat: true,
    });

  // Skeleton first: the child stands in a neutral, readable puppet pose.
  const hips = b.joint("hips", { at: [0, 0.68, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.68, 0],
      [0, 0.92, 0],
      [0, 1.15, 0],
    ]),
    { parent: hips, names: ["pelvis", "chest", "shoulderCore"], role: "spine" },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.43, 0.03],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.36, 0.19],
    dir: [0, -0.04, 1],
    role: "jaw",
    group: "head",
  });

  const legPoints = (x: number) =>
    catmull([
      [x, 0.64, 0],
      [x * 1.04, 0.38, 0.015],
      [x, 0.16, 0.06],
      [x, 0.11, 0.12],
    ]);

  const legL = b.chain("legL", legPoints(0.16), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.11, 0, 0.12],
  });
  const legR = b.chain("legR", legPoints(-0.16), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.11, 0, 0.12],
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.28, 1.17, 0],
      [0.43, 1.10, 0],
      [0.56, 0.88, 0.02],
      [0.61, 0.73, 0.08],
    ]),
    { parent: spine.tip, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.28, 1.17, 0],
      [-0.43, 1.10, 0],
      [-0.56, 0.88, 0.02],
      [-0.61, 0.73, 0.08],
    ]),
    { parent: spine.tip, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  // Main costume silhouette: a big taped carton torso.
  box([0.62, 0.62, 0.42], cardPaint, [0, 0.93, 0], spine.joints[1], "cartonTorso");
  box([0.52, 0.22, 0.40], CARDBOARD, [0, 0.61, 0.015], hips, "lowerCarton");
  box([0.70, 0.035, 0.03], TAPE, [0, 1.12, 0.217], spine.joints[1], "torsoTapeHorizontal");
  box([0.035, 0.64, 0.025], TAPE_DARK, [0, 0.93, 0.218], spine.joints[1], "torsoTapeVertical");

  // Chest control panel and warning emblem.
  box([0.36, 0.20, 0.018], EDGE, [0, 0.92, 0.225], spine.joints[1], "controlPanel");
  b.part(new THREE.PlaneGeometry(0.30, 0.16), WHITE, {
    at: [0, 0.94, 0.237],
    bone: spine.joints[1],
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
    name: "warningBadge",
  });
  cylinder(0.035, 0.018, RED, [0.13, 0.84, 0.24], spine.joints[1], "redButton");
  cylinder(0.035, 0.018, GREEN, [-0.13, 0.84, 0.24], spine.joints[1], "greenButton");

  // Boxy legs, cuffs, and oversized sneaker-like robot feet.
  for (const [s, leg] of [[1, legL], [-1, legR]] as const) {
    b.sweep(leg, [0.105, 0.08], {
      color: cardPaint,
      section: "box",
      sides: 6,
      caps: "flat",
      name: s > 0 ? "legLCardboard" : "legRCardboard",
    });
    box([0.24, 0.12, 0.34], CARDBOARD_DARK, [s * 0.105, 0.08, 0.12], leg.tip, s > 0 ? "bootL" : "bootR");
    box([0.25, 0.045, 0.36], TAPE, [s * 0.105, 0.145, 0.12], leg.joints[2], s > 0 ? "bootTapeL" : "bootTapeR");
  }

  // Arms are visibly cardboard sleeves with mitten hands.
  for (const [s, arm] of [[1, armL], [-1, armR]] as const) {
    b.sweep(arm, [0.105, 0.075], {
      color: cardPaint,
      section: "box",
      caps: "flat",
      name: s > 0 ? "armLSleeve" : "armRSleeve",
    });
    box([0.22, 0.18, 0.22], CARDBOARD_LIGHT, [s * 0.61, 0.70, 0.10], arm.tip, s > 0 ? "mittenL" : "mittenR");
    cylinder(0.055, 0.025, TAPE, [s * 0.61, 0.81, 0.10], arm.joints[2], s > 0 ? "cuffL" : "cuffR");
  }

  // Oversized head carton, offset slightly forward like a helmet.
  box([0.52, 0.47, 0.46], cardPaint, [0, 1.43, 0.05], head, "helmetBox");
  box([0.58, 0.045, 0.49], TAPE, [0, 1.67, 0.05], head, "helmetTopTape");
  box([0.035, 0.48, 0.03], TAPE_DARK, [0, 1.43, 0.285], head, "helmetFrontTape");

  // Front face: two large expressive robot eyes and a grille mouth.
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.145, 0.145), WHITE, {
      at: [s * 0.135, 1.48, 0.293],
      bone: head,
      dir: [0, 0, 1],
      axis: "z",
      texture: eyeTexture,
      name: s > 0 ? "eyeL" : "eyeR",
    });
    box([0.18, 0.025, 0.025], TAPE, [s * 0.135, 1.58, 0.303], head, s > 0 ? "browL" : "browR");
  }
  b.part(new THREE.PlaneGeometry(0.27, 0.09), WHITE, {
    at: [0, 1.32, 0.294],
    bone: jaw,
    dir: [0, 0, 1],
    axis: "z",
    texture: mouthTexture,
    name: "grilleMouth",
  });

  // Side ear discs and a jaunty antenna.
  for (const s of [1, -1]) {
    cylinder(0.095, 0.035, CARDBOARD_DARK, [s * 0.30, 1.45, 0.05], head, s > 0 ? "earL" : "earR");
    cylinder(0.055, 0.04, TAPE, [s * 0.30, 1.45, 0.05], head, s > 0 ? "earCapL" : "earCapR");
  }
  b.rod([0, 1.68, 0.03], [0, 1.82, 0.07], 0.018, { color: EDGE, bone: head, name: "antennaStem" });
  cylinder(0.045, 0.07, RED, [0, 1.85, 0.08], head, "antennaTip", 8);

  // Rivets: small bright fasteners across the costume seams.
  const rivets: THREE.Vector3[] = [];
  for (const x of [-0.25, 0.25]) {
    rivets.push(new THREE.Vector3(x, 1.12, 0.235));
    rivets.push(new THREE.Vector3(x, 0.74, 0.235));
  }
  for (const p of rivets) b.part(new THREE.SphereGeometry(0.018, 6, 4), METAL, { at: p, bone: spine.joints[1], name: "cartonRivet" });

  // A loose cardboard flap behind the head gives the costume a handmade silhouette.
  b.part(new THREE.BoxGeometry(0.36, 0.18, 0.025), CARDBOARD_DARK, {
    at: [0, 1.60, -0.20],
    bone: head,
    rotation: [8, 0, 0],
    name: "backFlap",
  });

  return b.root;
}
```