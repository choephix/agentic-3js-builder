import * as THREE from "three";
import { createBuilder, catmull, svg } from "../../../../src/index";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A playful child wearing a handmade cardboard-box robot costume, with chunky box armor, taped seams, antenna, expressive glowing-style face graphics, and a friendly puppet-like rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = "#b9783f";
  const CARDBOARD_LIGHT = "#d69a5a";
  const CARDBOARD_DARK = "#704126";
  const TAPE = "#e8c47c";
  const TAPE_DARK = "#a8793f";
  const RUBBER = "#29242a";
  const BOOT = "#38343a";
  const EYE_BLUE = "#51d7e8";
  const RED = "#d95443";
  const WHITE = "#fff4d6";

  const faceTexture = svg(
    `<svg viewBox="0 0 256 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="160" fill="#b9783f"/>
      <rect x="8" y="8" width="240" height="144" rx="8" fill="#8c542f" stroke="#e8c47c" stroke-width="5"/>
      <ellipse cx="78" cy="70" rx="27" ry="31" fill="#29242a"/>
      <ellipse cx="178" cy="70" rx="27" ry="31" fill="#29242a"/>
      <ellipse cx="78" cy="70" rx="16" ry="20" fill="#51d7e8"/>
      <ellipse cx="178" cy="70" rx="16" ry="20" fill="#51d7e8"/>
      <circle cx="73" cy="63" r="6" fill="#fff4d6"/>
      <circle cx="173" cy="63" r="6" fill="#fff4d6"/>
      <path d="M62 118 Q128 145 194 118" fill="none" stroke="#29242a" stroke-width="9" stroke-linecap="round"/>
      <path d="M89 122 Q128 136 167 122" fill="none" stroke="#d95443" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 512 },
  );

  const chestTexture = svg(
    `<svg viewBox="0 0 256 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="220" fill="#b9783f"/>
      <path d="M128 18 L145 62 L193 62 L155 89 L170 137 L128 109 L86 137 L101 89 L63 62 L111 62 Z"
        fill="#d95443" stroke="#e8c47c" stroke-width="6"/>
      <path d="M20 190 H236" stroke="#704126" stroke-width="9"/>
      <path d="M20 25 V195 M236 25 V195" stroke="#e8c47c" stroke-width="7"/>
    </svg>`,
    { size: 512 },
  );

  const hips = b.joint("hips", {
    at: [0, 0.82, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, 0],
      [0, 1.08, 0],
      [0, 1.3, 0],
    ]),
    {
      parent: hips,
      names: ["waist", "chest", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 1.52, 0.02],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.42, 0.12],
    dir: [0, 0.05, 1],
    role: "jaw",
    group: "head",
  });

  const leftArm = b.chain(
    "armL",
    [
      [0.27, 1.22, 0],
      [0.47, 1.08, 0],
      [0.62, 0.88, 0.02],
    ],
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "handL"],
      role: "arm",
    },
  );

  const rightArm = b.chain(
    "armR",
    [
      [-0.27, 1.22, 0],
      [-0.47, 1.08, 0],
      [-0.62, 0.88, 0.02],
    ],
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "handR"],
      role: "arm",
    },
  );

  const leftLeg = b.chain(
    "legL",
    [
      [0.14, 0.78, 0],
      [0.16, 0.47, 0.03],
      [0.15, 0.16, 0.08],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.15, 0, 0.12],
    },
  );

  const rightLeg = b.chain(
    "legR",
    [
      [-0.14, 0.78, 0],
      [-0.16, 0.47, 0.03],
      [-0.15, 0.16, 0.08],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.15, 0, 0.12],
    },
  );

  const box = (size: [number, number, number], color: any, at: any, bone: any, name: string, texture?: any) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      texture,
      name,
      flat: true,
    });

  // Main costume boxes.
  box([0.52, 0.54, 0.38], CARDBOARD, [0, 1.04, 0], hips, "torsoBox", chestTexture);
  box([0.44, 0.39, 0.36], CARDBOARD_LIGHT, [0, 1.54, 0.02], head, "headBox", faceTexture);

  // Folded cardboard collar and waist belt.
  box([0.55, 0.08, 0.4], TAPE, [0, 1.30, 0], spine.joints[1], "collarTape");
  box([0.54, 0.10, 0.40], TAPE_DARK, [0, 0.81, 0], hips, "waistTape");

  // Shoulder caps, elbows, forearms, mitten hands.
  for (const side of [1, -1]) {
    const arm = side === 1 ? leftArm : rightArm;
    box([0.20, 0.22, 0.30], CARDBOARD_LIGHT, [side * 0.31, 1.20, 0], arm.joints[0], side === 1 ? "shoulderLBox" : "shoulderRBox");
    box([0.18, 0.22, 0.24], TAPE, [side * 0.48, 1.07, 0], arm.joints[1], side === 1 ? "elbowLGuard" : "elbowRGuard");
    box([0.16, 0.28, 0.22], CARDBOARD, [side * 0.60, 0.89, 0.03], arm.tip, side === 1 ? "handLBox" : "handRBox");
    box([0.19, 0.10, 0.25], RUBBER, [side * 0.60, 0.72, 0.03], arm.tip, side === 1 ? "handLGrip" : "handRGrip");
  }

  // Legs, knee patches, and oversized boots.
  for (const side of [1, -1]) {
    const leg = side === 1 ? leftLeg : rightLeg;
    box([0.22, 0.30, 0.28], CARDBOARD, [side * 0.15, 0.62, 0], leg.joints[0], side === 1 ? "thighLBox" : "thighRBox");
    box([0.24, 0.12, 0.29], TAPE, [side * 0.16, 0.47, 0.045], leg.joints[1], side === 1 ? "kneeLStripe" : "kneeRStripe");
    box([0.20, 0.24, 0.25], CARDBOARD_DARK, [side * 0.15, 0.27, 0.04], leg.tip, side === 1 ? "shinLBox" : "shinRBox");
    box([0.29, 0.16, 0.40], BOOT, [side * 0.15, 0.09, 0.11], leg.tip, side === 1 ? "bootL" : "bootR");
    box([0.23, 0.035, 0.34], TAPE, [side * 0.15, 0.175, 0.16], leg.tip, side === 1 ? "soleL" : "soleR");
  }

  // Face panel border and antenna.
  box([0.38, 0.32, 0.018], TAPE_DARK, [0, 1.54, 0.207], head, "facePanelBorder");
  b.rod([0, 1.76, 0.02], [0, 1.91, 0.02], 0.018, {
    bone: head,
    color: RUBBER,
    caps: "flat",
    name: "antennaStem",
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), RED, {
    at: [0, 1.95, 0.02],
    bone: head,
    name: "antennaLamp",
  });

  // Cardboard side tabs and decorative rivets.
  for (const side of [1, -1]) {
    box([0.035, 0.22, 0.30], TAPE, [side * 0.285, 1.03, 0], hips, side === 1 ? "torsoLeftTape" : "torsoRightTape");
    for (const y of [0.91, 1.08, 1.25]) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), CARDBOARD_DARK, {
        at: [side * 0.273, y, 0.19],
        bone: hips,
        name: side === 1 ? "leftRivet" : "rightRivet",
      });
    }
  }

  // Small cardboard ears / side flaps.
  for (const side of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.07, 0.18, 0.18), CARDBOARD, {
      at: [side * 0.245, 1.57, 0],
      bone: head,
      rotation: [0, 0, side * 18],
      name: side === 1 ? "earFlapL" : "earFlapR",
    });
  }

  // A chunky taped smile / chin piece under the face.
  box([0.24, 0.08, 0.08], RED, [0, 1.385, 0.19], jaw, "mouthBar");
  box([0.30, 0.055, 0.08], TAPE, [0, 1.34, 0.16], jaw, "chinTape");

  // Two little cardboard fingers on each mitten.
  for (const side of [1, -1]) {
    const hand = side === 1 ? leftArm.tip : rightArm.tip;
    for (const z of [-0.045, 0.045]) {
      b.part(new THREE.BoxGeometry(0.07, 0.11, 0.045), CARDBOARD_LIGHT, {
        at: [side * 0.68, 0.86, z],
        bone: hand!,
        name: side === 1 ? "fingerL" : "fingerR",
      });
    }
  }

  return b.root;
}
