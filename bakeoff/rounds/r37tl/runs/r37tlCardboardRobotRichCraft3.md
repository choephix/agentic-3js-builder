```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  rng,
  svg,
  grain,
  mottle,
} from "agentic-3js-builder";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A cheerful child wearing a handmade cardboard robot costume, with boxy armor, taped seams, a glowing-looking face panel, antenna, knobs, and visible hands and sneakers.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = grain(
    mottle("#b9793c", "#d69a57", { size: 0.18, contrast: 1.2, seed: 12 }),
    "#8e542d",
    { size: 0.035, axis: "z", seed: 4 },
  );
  const CARDBOARD_LIGHT = grain("#d79a59", "#a96535", {
    size: 0.045,
    axis: "y",
    seed: 8,
  });
  const EDGE = "#704022";
  const TAPE = "#ead39a";
  const TAPE_DARK = "#b9955d";
  const INK = "#241a18";
  const SCREEN = "#183b3a";
  const SCREEN_GLOW = "#54d5bd";
  const SKIN = "#f0a878";
  const SKIN_SHADOW = "#b9684d";
  const SHOE = "#303b53";
  const SOLE = "#ded7bd";
  const RED = "#c94d3d";
  const YELLOW = "#f1c84b";

  // ------------------------------------------------------------------------------------------------
  // Skeleton: compact child proportions, neutral standing pose.

  const hips = b.joint("hips", {
    at: [0, 0.64, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.64, 0],
      [0, 0.86, 0],
      [0, 1.08, 0],
      [0, 1.27, 0],
    ]),
    {
      parent: hips,
      names: ["waist", "chest", "shoulder", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.53, 0.03],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.43, 0.16],
    dir: [0, 0, 1],
    role: "jaw",
    group: "face",
  });

  const leftLegPts = limb(
    [0.16, 0.67, 0],
    [0.19, 0.18, 0.08],
    [0.27, 0.27, 0.18],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
    { sole: [0, 0, 1] },
  );
  const rightLegPts = limb(
    [-0.16, 0.67, 0],
    [-0.19, 0.18, 0.08],
    [0.27, 0.27, 0.18],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
    { sole: [0, 0, 1] },
  );
  const legL = b.chain("legL", leftLegPts, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.19, 0, 0.08],
  });
  const legR = b.chain("legR", rightLegPts, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.19, 0, 0.08],
  });

  const armL = b.chain(
    "armL",
    [
      [0.29, 1.17, 0],
      [0.48, 1.14, 0],
      [0.66, 0.98, 0],
    ],
    { parent: spine.joints[2], names: ["shoulderL", "elbowL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    [
      [-0.29, 1.17, 0],
      [-0.48, 1.14, 0],
      [-0.66, 0.98, 0],
    ],
    { parent: spine.joints[2], names: ["shoulderR", "elbowR", "handR"], role: "arm" },
  );

  // ------------------------------------------------------------------------------------------------
  // Reusable primitive helpers.

  const box = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: any,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const tape = (
    at: THREE.Vector3 | [number, number, number],
    size: [number, number, number],
    bone: any,
    name: string,
  ) => box(size, at, TAPE, bone, name);

  const rivet = (
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    color = TAPE_DARK,
    name = "rivet",
  ) =>
    b.part(new THREE.SphereGeometry(0.018, 7, 5), color, {
      at,
      bone,
      name,
      flat: true,
    });

  // ------------------------------------------------------------------------------------------------
  // Main costume silhouette.

  const torso = box([0.58, 0.66, 0.40], [0, 0.99, 0.02], CARDBOARD, spine.joints[1], "torsoBox");

  // Broad upper and lower box flaps.
  box([0.62, 0.055, 0.43], [0, 1.335, 0.03], CARDBOARD_LIGHT, spine.joints[2], "topFlap");
  box([0.62, 0.045, 0.43], [0, 0.655, 0.04], CARDBOARD_LIGHT, hips, "bottomFlap");
  tape([0, 0.99, 0.228], [0.075, 0.67, 0.012], spine.joints[1], "frontVerticalTape");
  tape([0, 1.335, 0.235], [0.62, 0.035, 0.018], spine.joints[2], "shoulderTape");
  tape([0, 0.655, 0.24], [0.62, 0.032, 0.018], hips, "waistTape");

  // Chest control panel and colorful controls.
  box([0.34, 0.20, 0.018], [0, 1.06, 0.226], SCREEN, spine.joints[1], "chestPanel");
  box([0.24, 0.035, 0.012], [0, 1.13, 0.24], SCREEN_GLOW, spine.joints[1], "chestDisplay");
  for (const x of [-0.105, 0, 0.105]) {
    rivet([x, 1.01, 0.245], spine.joints[1], x === 0 ? RED : YELLOW, "controlButton");
  }

  // Side armor panels with handmade corner rivets.
  for (const s of [1, -1]) {
    box([0.018, 0.38, 0.29], [s * 0.306, 1.00, 0.01], CARDBOARD_LIGHT, spine.joints[1], "sideArmor");
    for (const y of [0.84, 1.16]) {
      rivet([s * 0.319, y, 0.15], spine.joints[1], TAPE_DARK, "sideRivet");
      rivet([s * 0.319, y, -0.13], spine.joints[1], TAPE_DARK, "sideRivet");
    }
  }

  // Head box: slightly oversized and charmingly rectangular.
  const headBox = box([0.45, 0.39, 0.38], [0, 1.58, 0.04], CARDBOARD_LIGHT, head, "helmetBox");
  box([0.47, 0.055, 0.40], [0, 1.785, 0.05], CARDBOARD, head, "helmetTopFlap");
  tape([0, 1.58, 0.244], [0.055, 0.40, 0.014], head, "helmetFrontTape");
  tape([0, 1.79, 0.05], [0.46, 0.025, 0.40], head, "helmetTopTape");

  // Face opening, with bright graphic robot eyes and a friendly mouth.
  const facePlate = b.part(
    new THREE.PlaneGeometry(0.34, 0.205),
    "#152c2e",
    {
      at: [0, 1.58, 0.239],
      bone: head,
      dir: [0, 0, 1],
      axis: "z",
      name: "faceOpening",
    },
  );

  const faceTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 205">
      <rect width="340" height="205" rx="22" fill="#183b3a"/>
      <path d="M20 26 H320" stroke="#8ee7c8" stroke-width="5" opacity=".7"/>
      <g stroke="#0b1818" stroke-width="9" stroke-linejoin="round">
        <path fill="#8de9d0" d="M45 92 Q82 48 120 92 Q83 132 45 92Z"/>
        <path fill="#8de9d0" d="M220 92 Q258 48 295 92 Q258 132 220 92Z"/>
      </g>
      <circle cx="84" cy="91" r="18" fill="#102225"/>
      <circle cx="256" cy="91" r="18" fill="#102225"/>
      <circle cx="78" cy="84" r="6" fill="#ffffff"/>
      <circle cx="250" cy="84" r="6" fill="#ffffff"/>
      <path d="M122 155 Q170 184 218 155" fill="none" stroke="#65e0bc" stroke-width="9" stroke-linecap="round"/>
      <circle cx="170" cy="36" r="8" fill="#e84f4f"/>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.34, 0.205), "#ffffff", {
    at: [0, 1.58, 0.247],
    bone: head,
    dir: [0, 0, 1],
    axis: "z",
    texture: faceTexture,
    name: "robotFaceDrawing",
  });

  // Ear-like cardboard side flaps.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.17, 0.22), CARDBOARD, {
      at: [s * 0.245, 1.57, 0.03],
      bone: head,
      name: "earFlap",
      flat: true,
    });
    rivet([s * 0.27, 1.57, 0.12], head, TAPE, "earRivet");
  }

  // Antenna stalk, ball, and paper pennant.
  b.rod([0, 1.79, 0.03], [0, 1.98, 0.03], 0.018, {
    color: EDGE,
    bone: head,
    caps: "flat",
    name: "antennaStem",
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), RED, {
    at: [0, 2.02, 0.03],
    bone: head,
    name: "antennaBall",
  });
  b.extrude(
    [
      [0, 0],
      [0.17, -0.04],
      [0.17, 0.10],
      [0, 0.16],
    ],
    {
      at: [0, 1.96, 0.03],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: TAPE,
      bone: head,
      name: "antennaFlag",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Boxy limbs, shoulders, hands, legs, and sneakers.

  b.sweep(legL, (t) => 0.115 - t * 0.025, {
    color: CARDBOARD,
    section: "box",
    sides: 5,
    caps: "round",
    name: "leftCardboardLeg",
  });
  b.sweep(legR, (t) => 0.115 - t * 0.025, {
    color: CARDBOARD,
    section: "box",
    sides: 5,
    caps: "round",
    name: "rightCardboardLeg",
  });

  for (const s of [1, -1]) {
    box([0.18, 0.16, 0.20], [s * 0.16, 0.51, 0.01], CARDBOARD_LIGHT, hips, "hipBox");
    tape([s * 0.16, 0.51, 0.115], [0.19, 0.025, 0.018], hips, "hipTape");
  }

  b.sweep(armL, (t) => 0.105 - t * 0.035, {
    color: CARDBOARD,
    section: "box",
    caps: "round",
    name: "leftCardboardArm",
  });
  b.sweep(armR, (t) => 0.105 - t * 0.035, {
    color: CARDBOARD,
    section: "box",
    caps: "round",
    name: "rightCardboardArm",
  });

  for (const s of [1, -1]) {
    box([0.22, 0.15, 0.25], [s * 0.32, 1.18, 0], CARDBOARD_LIGHT, spine.joints[2], "shoulderPad");
    tape([s * 0.32, 1.18, 0.135], [0.19, 0.025, 0.018], spine.joints[2], "shoulderTape");
  }

  for (const s of [1, -1]) {
    const hand = [s * 0.69, 0.95, 0.01] as [number, number, number];
    b.part(new THREE.SphereGeometry(0.105, 9, 7), SKIN, {
      at: hand,
      bone: s > 0 ? armL.tip : armR.tip,
      name: "smallHand",
      flat: true,
    });
    for (let i = -1; i <= 1; i++) {
      b.part(new THREE.CapsuleGeometry(0.018, 0.075, 4, 6), SKIN_SHADOW, {
        at: [s * (0.70 + i * 0.027), 0.89, 0.045],
        bone: s > 0 ? armL.tip : armR.tip,
        rotation: [0.25, 0, s * 0.15],
        name: "finger",
        flat: true,
      });
    }
  }

  // Rolled cardboard knee bands and chunky sneakers planted on the floor.
  for (const s of [1, -1]) {
    tape([s * 0.18, 0.43, 0.015], [0.20, 0.035, 0.21], s > 0 ? legL.joints[1] : legR.joints[1], "kneeBand");
    box([0.23, 0.16, 0.34], [s * 0.19, 0.12, 0.10], SHOE, s > 0 ? legL.tip : legR.tip, "sneaker");
    box([0.24, 0.045, 0.35], [s * 0.19, 0.035, 0.115], SOLE, s > 0 ? legL.tip : legR.tip, "rubberSole");
    tape([s * 0.19, 0.145, 0.275], [0.16, 0.028, 0.012], s > 0 ? legL.tip : legR.tip, "shoeStripe");
  }

  // A few deliberately hand-cut cardboard tabs along the costume edges.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.10, 0],
        [0.08, 0.13],
        [0.03, 0.19],
        [0, 0.10],
      ],
      {
        at: [s * 0.32, 1.36, 0.02],
        x: [s, 0, 0],
        thickness: 0.018,
        bevel: 0.003,
        color: CARDBOARD_LIGHT,
        bone: spine.joints[2],
        name: "cutCardboardTab",
      },
    );
  }

  // Small bolts around the chest panel reinforce the crafted puppet construction.
  for (const x of [-0.17, 0.17]) {
    for (const y of [0.92, 1.20]) rivet([x, y, 0.25], spine.joints[1], TAPE, "chestRivet");
  }

  return b.root;
}
```