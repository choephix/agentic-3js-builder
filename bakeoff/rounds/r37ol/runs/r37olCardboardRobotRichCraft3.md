```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  mottle,
  grain,
  paint,
  svg,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A charming child wearing a handmade cardboard-box robot costume, with chunky limbs, taped seams, antenna, glowing-looking drawn eyes, and craft-paper details.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = mottle("#b8783c", "#d99a58", {
    size: 0.18,
    contrast: 1.2,
    seed: 12,
  });
  const CARDBOARD_LIGHT = grain("#d8a062", "#9c5d31", {
    size: 0.035,
    axis: "y",
    seed: 9,
  });
  const EDGE = "#60351f";
  const TAPE = "#e8c477";
  const TAPE_DARK = "#b88b4a";
  const DARK = "#211c25";
  const WHITE = "#fff4d5";
  const RED = "#d94d3d";
  const BLUE = "#4c87a6";
  const YELLOW = "#f0bd42";
  const SKIN = "#f0a56c";
  const SHOE = "#49352d";

  const hips = b.joint("hips", {
    at: [0, 0.88, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.88, 0],
      [0, 1.18, 0],
      [0, 1.47, 0],
    ]),
    { parent: hips, names: ["waist", "chest", "neck"], role: "spine" },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.55, 0.02],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.46, 0.18],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const leftArm = b.chain(
    "armL",
    catmull([
      [0.37, 1.37, 0],
      [0.58, 1.28, 0.01],
      [0.75, 1.05, 0.04],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "handL"],
      role: "arm",
      contact: [0.75, 1.05, 0.04],
    },
  );

  const rightArm = b.chain(
    "armR",
    catmull([
      [-0.37, 1.37, 0],
      [-0.58, 1.28, 0.01],
      [-0.75, 1.05, 0.04],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "handR"],
      role: "arm",
      contact: [-0.75, 1.05, 0.04],
    },
  );

  const leftLeg = b.chain(
    "legL",
    catmull([
      [0.17, 0.83, 0],
      [0.19, 0.52, 0.02],
      [0.19, 0.2, 0.09],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.19, 0, 0.13],
    },
  );

  const rightLeg = b.chain(
    "legR",
    catmull([
      [-0.17, 0.83, 0],
      [-0.19, 0.52, 0.02],
      [-0.19, 0.2, 0.09],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.19, 0, 0.13],
    },
  );

  const box = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: any,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    length: number,
    at: THREE.Vector3 | [number, number, number],
    color: any,
    bone: any,
    dir: [number, number, number],
    name: string,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, length, 8, 1),
      color,
      { at, bone, dir, name, flat: true },
    );

  // Main costume: oversized corrugated-looking carton torso.
  box([0.72, 0.68, 0.48], [0, 1.16, 0], CARDBOARD, spine.joints[1], "torsoBox");
  box([0.54, 0.18, 0.12], [0, 1.30, 0.255], TAPE, spine.joints[1], "frontTape");
  box([0.10, 0.68, 0.025], [0, 1.16, 0.255], TAPE_DARK, spine.joints[1], "verticalTape");
  box([0.18, 0.07, 0.018], [0, 0.93, 0.255], EDGE, spine.joints[1], "controlSlot");

  // Chest control panel and buttons.
  box([0.34, 0.19, 0.018], [0, 1.13, 0.263], EDGE, spine.joints[1], "controlPanel");
  cylinder(0.035, 0.024, [-0.105, 1.14, 0.281], RED, spine.joints[1], [0, 0, 1], "redButton");
  cylinder(0.035, 0.024, [0, 1.14, 0.281], YELLOW, spine.joints[1], [0, 0, 1], "yellowButton");
  cylinder(0.035, 0.024, [0.105, 1.14, 0.281], BLUE, spine.joints[1], [0, 0, 1], "blueButton");

  // Shoulder collars.
  for (const s of [1, -1]) {
    cylinder(
      0.13,
      0.12,
      [s * 0.39, 1.38, 0],
      TAPE,
      spine.joints[1],
      [s, 0, 0],
      s > 0 ? "shoulderPadL" : "shoulderPadR",
    );
  }

  // Cardboard arms, with taped elbows.
  b.sweep(leftArm, [0.105, 0.085], {
    color: CARDBOARD_LIGHT,
    section: "box",
    sides: 6,
    name: "cardboardArmL",
  });
  b.sweep(rightArm, [0.105, 0.085], {
    color: CARDBOARD_LIGHT,
    section: "box",
    sides: 6,
    name: "cardboardArmR",
  });
  for (const s of [1, -1]) {
    box(
      [0.23, 0.10, 0.19],
      [s * 0.59, 1.27, 0.01],
      TAPE,
      s > 0 ? leftArm.joints[0] : rightArm.joints[0],
      s > 0 ? "elbowTapeL" : "elbowTapeR",
    );
    b.part(
      new THREE.SphereGeometry(0.115, 8, 6),
      SKIN,
      {
        at: [s * 0.77, 1.04, 0.055],
        bone: s > 0 ? leftArm.tip : rightArm.tip,
        name: s > 0 ? "smallHandL" : "smallHandR",
      },
    );
    // Three square cardboard finger marks.
    for (let i = -1; i <= 1; i++) {
      box(
        [0.035, 0.06, 0.025],
        [s * (0.77 + i * 0.045), 1.00, 0.15],
        SKIN,
        s > 0 ? leftArm.tip : rightArm.tip,
        `${s > 0 ? "fingerL" : "fingerR"}${i}`,
      );
    }
  }

  // Boxy legs, cuffs, and oversized shoes touching the floor.
  b.sweep(leftLeg, [0.13, 0.105], {
    color: CARDBOARD,
    section: "box",
    name: "cardboardLegL",
  });
  b.sweep(rightLeg, [0.13, 0.105], {
    color: CARDBOARD,
    section: "box",
    name: "cardboardLegR",
  });
  for (const s of [1, -1]) {
    box(
      [0.28, 0.12, 0.22],
      [s * 0.19, 0.18, 0.07],
      TAPE,
      s > 0 ? leftLeg.tip : rightLeg.tip,
      s > 0 ? "ankleTapeL" : "ankleTapeR",
    );
    box(
      [0.30, 0.16, 0.42],
      [s * 0.19, 0.08, 0.14],
      SHOE,
      s > 0 ? leftLeg.tip : rightLeg.tip,
      s > 0 ? "shoeL" : "shoeR",
    );
    box(
      [0.24, 0.045, 0.025],
      [s * 0.19, 0.11, 0.355],
      TAPE_DARK,
      s > 0 ? leftLeg.tip : rightLeg.tip,
      s > 0 ? "shoeStripeL" : "shoeStripeR",
    );
  }

  // Head: a second, slightly smaller carton with a taped crown.
  box([0.62, 0.53, 0.52], [0, 1.72, 0.04], CARDBOARD_LIGHT, head, "headBox");
  box([0.68, 0.07, 0.55], [0, 2.00, 0.04], TAPE, head, "headTopTape");
  box([0.055, 0.50, 0.025], [0, 1.72, 0.315], TAPE_DARK, head, "faceTape");
  box([0.40, 0.10, 0.025], [0, 1.49, 0.315], EDGE, jaw, "mouthSlot");

  // Face decal texture: oversized friendly robot eyes and a little pixel grin.
  const faceArt = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="128" fill="none"/>
      <g stroke="#211c25" stroke-width="7" stroke-linejoin="round">
        <rect x="22" y="22" width="72" height="65" rx="13" fill="#fff4d5"/>
        <rect x="162" y="22" width="72" height="65" rx="13" fill="#fff4d5"/>
      </g>
      <circle cx="61" cy="55" r="18" fill="#4c87a6"/>
      <circle cx="198" cy="55" r="18" fill="#4c87a6"/>
      <circle cx="61" cy="57" r="9" fill="#211c25"/>
      <circle cx="198" cy="57" r="9" fill="#211c25"/>
      <circle cx="54" cy="48" r="5" fill="#ffffff"/>
      <circle cx="191" cy="48" r="5" fill="#ffffff"/>
      <path d="M94 103 h12 v10 h12 v-10 h12 v10 h12 v-10 h12" fill="none" stroke="#211c25" stroke-width="6"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(head, faceArt, {
    at: [0, 1.72, 0.315],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.52, 0.26],
    lift: 0.006,
    segments: 6,
    name: "robotFace",
  });

  // Ear bolts and side warning marks.
  for (const s of [1, -1]) {
    cylinder(
      0.07,
      0.06,
      [s * 0.34, 1.75, 0.05],
      RED,
      head,
      [s, 0, 0],
      s > 0 ? "earBoltL" : "earBoltR",
    );
    box(
      [0.12, 0.10, 0.018],
      [s * 0.315, 1.88, 0.30],
      YELLOW,
      head,
      s > 0 ? "warningL" : "warningR",
    );
  }

  // Springy antenna, warning flag, and tiny top cap.
  cylinder(0.07, 0.035, [0, 2.02, 0.04], EDGE, head, [0, 1, 0], "antennaBase");
  const antennaPath = catmull([
    [0, 2.03, 0.04],
    [0, 2.14, 0.04],
    [0.025, 2.25, 0.04],
  ]);
  b.sweep(antennaPath, 0.018, {
    color: TAPE_DARK,
    caps: "round",
    name: "antennaSpring",
  });
  b.part(
    new THREE.SphereGeometry(0.055, 8, 6),
    RED,
    { at: [0.025, 2.27, 0.04], bone: head, name: "antennaLamp" },
  );
  b.extrude(
    [
      [0, 0],
      [0.18, 0],
      [0.14, 0.11],
      [0.02, 0.14],
    ],
    {
      at: [0.04, 2.13, 0.035],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: TAPE,
      bone: head,
      name: "antennaFlag",
    },
  );

  // Little cardboard tabs at the costume corners.
  for (const x of [-0.29, 0.29]) {
    box([0.06, 0.15, 0.025], [x, 1.47, 0.255], TAPE, spine.joints[1], "torsoTab");
  }

  return b.root;
}
```