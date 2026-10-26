```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  grain,
  mottle,
  paint,
  polyline,
  spots,
  stripes,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "cardboard-box-robot-kid",
  description:
    "A cheerful kid wearing a chunky handmade cardboard robot costume, complete with taped seams, corrugated panels, control lights, antenna, cardboard boots, mitten hands, and a smiling face peeking through the robot visor.",
};

// -------------------------------------------------------------------------------------------------
// Handmade cardboard materials and printed craft textures

const CARD_BROWN = "#a96538";
const CARD_LIGHT = "#c9874b";
const CARD_DARK = "#67371f";
const CARD_EDGE = "#7b4325";
const TAPE = "#d8b875";
const TAPE_LIGHT = "#f0d99c";
const TAPE_DARK = "#9b7542";
const INK = "#38251e";
const RUBBER = "#302b2a";
const RED = "#d54d3c";
const GREEN = "#78d66d";
const CYAN = "#54d8dc";
const YELLOW = "#f0c84c";
const SKIN = "#e7a578";
const HAIR = "#4a2b21";
const SHOE = "#4b3930";
const SILVER = "#a7a29a";

const cardboardTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#a96538"/>
    <path d="M0 10L128 4M0 32L128 38M0 57L128 51M0 82L128 88M0 108L128 103"
      stroke="#d08a4f" stroke-width="3" opacity=".55"/>
    <path d="M-20 18L50 0M10 128L128 65M65 128L128 92M-16 74L72 0"
      stroke="#70401f" stroke-width="2" opacity=".3"/>
    <path d="M7 19h3M42 72h5M93 27h3M106 113h6M22 98h2M77 57h4"
      stroke="#e1a467" stroke-width="2" stroke-linecap="round" opacity=".6"/>
    <path d="M0 124L128 120" stroke="#4b2819" stroke-width="2" opacity=".32"/>
  </svg>`,
  { size: 256 },
);

const lightCardTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#c9874b"/>
    <path d="M0 15L128 6M0 45L128 55M0 80L128 70M0 112L128 120"
      stroke="#efb26d" stroke-width="4" opacity=".5"/>
    <path d="M0 27L128 35M0 92L128 84" stroke="#82451f" stroke-width="2" opacity=".35"/>
    <circle cx="21" cy="36" r="2" fill="#f1c17b" opacity=".7"/>
    <circle cx="91" cy="99" r="2" fill="#81502c" opacity=".7"/>
  </svg>`,
  { size: 256 },
);

const tapeTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
    <rect width="128" height="64" fill="#d8b875"/>
    <path d="M-20 64L40 0M10 64L70 0M40 64L100 0M70 64L130 4M100 64L160 4"
      stroke="#f1daa0" stroke-width="8" opacity=".55"/>
    <path d="M0 12L128 12M0 51L128 51" stroke="#9d7641" stroke-width="2" opacity=".38"/>
    <path d="M0 31L128 31" stroke="#fff0b8" stroke-width="1" opacity=".5"/>
  </svg>`,
  { size: 192 },
);

const faceTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 230">
    <defs>
      <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f0bc8f"/>
        <stop offset="1" stop-color="#d98c65"/>
      </linearGradient>
    </defs>
    <ellipse cx="140" cy="125" rx="92" ry="91" fill="#38251e" opacity=".35"/>
    <path d="M53 116 Q49 52 103 27 Q147 4 194 29 Q239 53 227 124
             Q220 202 140 216 Q61 203 53 116Z" fill="url(#skin)" stroke="#38251e" stroke-width="8"/>
    <path d="M51 92 Q48 34 103 15 Q157 -5 208 29 Q225 42 229 83
             Q195 65 177 68 Q140 75 109 59 Q80 55 51 92Z" fill="#4a2b21" stroke="#38251e" stroke-width="7"/>
    <path d="M72 67 Q96 44 120 50" stroke="#70422b" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M160 51 Q194 43 212 70" stroke="#70422b" stroke-width="8" fill="none" stroke-linecap="round"/>
    <ellipse cx="98" cy="119" rx="22" ry="28" fill="#fff8e8" stroke="#38251e" stroke-width="7"/>
    <ellipse cx="182" cy="119" rx="22" ry="28" fill="#fff8e8" stroke="#38251e" stroke-width="7"/>
    <ellipse cx="101" cy="123" rx="10" ry="16" fill="#3d5367"/>
    <ellipse cx="179" cy="123" rx="10" ry="16" fill="#3d5367"/>
    <circle cx="104" cy="117" r="4.5" fill="#fff"/>
    <circle cx="182" cy="117" r="4.5" fill="#fff"/>
    <path d="M132 126 Q140 113 148 126 L145 145 Q140 151 132 145Z"
      fill="#d48763" stroke="#9c5b48" stroke-width="3"/>
    <path d="M108 167 Q140 194 173 167" fill="none" stroke="#7d332f" stroke-width="8" stroke-linecap="round"/>
    <path d="M121 174 Q140 182 159 174" fill="none" stroke="#fff2d7" stroke-width="4" stroke-linecap="round"/>
    <circle cx="74" cy="159" r="14" fill="#ef8a86" opacity=".35"/>
    <circle cx="206" cy="159" r="14" fill="#ef8a86" opacity=".35"/>
  </svg>`,
  { size: 512 },
);

const warningTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="8" fill="#d8b875" stroke="#38251e" stroke-width="7"/>
    <path d="M64 13L116 108H12Z" fill="#f0c84c" stroke="#38251e" stroke-width="7" stroke-linejoin="round"/>
    <path d="M64 39V73" stroke="#38251e" stroke-width="11" stroke-linecap="round"/>
    <circle cx="64" cy="91" r="7" fill="#38251e"/>
    <path d="M21 21L34 34M94 94L107 107" stroke="#fff1bc" stroke-width="3" opacity=".65"/>
  </svg>`,
  { size: 256 },
);

const screenTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128">
    <rect x="3" y="3" width="250" height="122" rx="13" fill="#142326" stroke="#0a1112" stroke-width="6"/>
    <path d="M16 94H241" stroke="#52d8c9" stroke-width="3" opacity=".35"/>
    <path d="M25 83 L55 66 L80 75 L111 41 L142 61 L170 29 L205 56 L233 36"
      fill="none" stroke="#78f7dd" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="55" cy="66" r="6" fill="#fff4b0"/>
    <circle cx="170" cy="29" r="6" fill="#fff4b0"/>
    <text x="24" y="31" font-family="monospace" font-size="19" font-weight="bold" fill="#8bffe2">KID-BOT // OK</text>
    <text x="183" y="111" font-family="monospace" font-size="16" fill="#54d8dc">07</text>
  </svg>`,
  { size: 256 },
);

const labelTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 96">
    <rect x="3" y="3" width="250" height="90" rx="9" fill="#e9d3a0" stroke="#38251e" stroke-width="6"/>
    <text x="128" y="42" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="900" fill="#38251e">MADE BY</text>
    <text x="128" y="72" text-anchor="middle" font-family="sans-serif" font-size="25" font-weight="900" fill="#d54d3c">A KID!</text>
  </svg>`,
  { size: 256 },
);

const serialTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 72">
    <rect width="256" height="72" fill="#6b3a22"/>
    <text x="128" y="30" text-anchor="middle" font-family="monospace" font-size="18" fill="#efc981">CARDBOARD-9000</text>
    <text x="128" y="54" text-anchor="middle" font-family="monospace" font-size="12" fill="#f4e2aa">ASSEMBLED WITH TAPE</text>
  </svg>`,
  { size: 256 },
);

const cardPaint = grain(
  mottle(CARD_BROWN, CARD_LIGHT, { size: 0.18, contrast: 1.15, seed: 17 }),
  CARD_DARK,
  { size: 0.032, axis: "z", seed: 8 },
);

const paleCardPaint = grain(
  mottle("#bd7943", "#e0a15c", { size: 0.15, contrast: 1.2, seed: 21 }),
  "#814622",
  { size: 0.028, axis: "x", seed: 11 },
);

const tapePaint = stripes(TAPE, TAPE_LIGHT, {
  size: 0.045,
  axis: "z",
  width: 0.28,
  wobble: 0.08,
  seed: 5,
});

const darkCardPaint = mottle(CARD_DARK, CARD_EDGE, {
  size: 0.08,
  contrast: 1.5,
  seed: 31,
});

const dottedCardPaint = spots(cardPaint, [CARD_LIGHT, "#d49a5a"], {
  size: 0.1,
  amount: 0.34,
  seed: 23,
});

// -------------------------------------------------------------------------------------------------
// Builder helpers

export default function build() {
  const b = createBuilder({
    name: "cardboard-box-robot-kid",
    detail: 1,
    paintSize: 2048,
  });

  const box = (
    size: readonly [number, number, number],
    at: THREE.Vector3 | readonly [number, number, number],
    color: any,
    bone: any,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      ...extra,
    });

  const sphere = (
    radius: number,
    at: THREE.Vector3 | readonly [number, number, number],
    color: any,
    bone: any,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      flat: true,
      ...extra,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: THREE.Vector3 | readonly [number, number, number],
    color: any,
    bone: any,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 10, 1), color, {
      at,
      bone,
      flat: true,
      ...extra,
    });

  const frontPlate = (
    size: readonly [number, number],
    at: readonly [number, number, number],
    color: any,
    bone: any,
    texture?: THREE.Texture,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      texture,
      ...extra,
    });

  const button = (
    at: readonly [number, number, number],
    color: string,
    bone: any,
    radius = 0.023,
  ) =>
    cylinder(radius, 0.018, at, color, bone, {
      dir: [0, 0, 1],
      axis: "y",
      name: "controlButton",
    });

  const rivet = (
    at: readonly [number, number, number],
    bone: any,
    color: any = TAPE_LIGHT,
    radius = 0.014,
  ) =>
    sphere(radius, at, color, bone, {
      name: "cardboardRivet",
    });

  const tapeRod = (
    a: readonly [number, number, number] | THREE.Vector3,
    c: readonly [number, number, number] | THREE.Vector3,
    radius: number,
    bone?: any,
  ) =>
    b.rod(a, c, radius, {
      color: tapePaint,
      bone,
      section: { ngon: 6 },
      caps: "flat",
      name: "foldedTape",
    });

  // -----------------------------------------------------------------------------------------------
  // Skeleton first: a compact child-sized humanoid puppet rig

  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.9, 0],
      [0, 1.12, 0],
      [0, 1.42, 0],
      [0, 1.69, 0],
    ]),
    {
      names: ["pelvis", "spine", "chest", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.78, 0.05],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.91, 0.28],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const antenna = b.joint("antenna", {
    parent: head,
    at: [0, 2.31, 0.08],
    dir: [0, 1, 0],
    role: "hinge",
    group: "head",
  });

  const legPoints = (s: number) =>
    polyline([
      [s * 0.22, 0.88, 0],
      [s * 0.25, 0.57, 0.035],
      [s * 0.23, 0.27, 0.09],
      [s * 0.23, 0.15, 0.13],
    ]);

  const legL = b.chain("legL", legPoints(1), {
    parent: spine.joints[0],
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.23, 0, 0.18],
  });

  const legR = b.chain("legR", legPoints(-1), {
    parent: spine.joints[0],
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.23, 0, 0.18],
  });

  const armPoints = (s: number) =>
    polyline([
      [s * 0.40, 1.53, 0.01],
      [s * 0.61, 1.37, 0.035],
      [s * 0.73, 1.14, 0.09],
      [s * 0.76, 1.06, 0.13],
    ]);

  const armL = b.chain("armL", armPoints(1), {
    parent: spine.joints[2],
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });

  const armR = b.chain("armR", armPoints(-1), {
    parent: spine.joints[2],
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  const digitChains: Array<{ side: number; chain: any; name: string }> = [];

  for (const side of [1, -1]) {
    const hand = side > 0 ? armL.tip : armR.tip;
    const sideName = side > 0 ? "L" : "R";
    const fingers = [
      ["thumb", -0.055, -0.02],
      ["index", 0.0, 0.018],
      ["pinky", 0.058, 0.042],
    ] as const;

    for (const [finger, xOff, zOff] of fingers) {
      const name = `${finger}${sideName}`;
      const chain = b.chain(
        name,
        polyline([
          [side * (0.77 + xOff), 1.07, 0.14 + zOff],
          [side * (0.79 + xOff * 1.12), 0.96, 0.18 + zOff],
        ]),
        {
          parent: hand,
          names: [name, `${name}Tip`],
          role: "digit",
          group: "hands",
        },
      );
      digitChains.push({ side, chain, name });
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Main costume volumes

  const pelvisBone = spine.joints[0];
  const torsoBone = spine.joints[2];
  const neckBone = spine.joints[3];

  // Wide torso box: intentionally too large for a normal child, like a real costume.
  box([0.82, 0.73, 0.50], [0, 1.29, 0.0], dottedCardPaint, torsoBone, {
    texture: cardboardTexture,
    name: "largeCardboardTorso",
    group: "costume",
  });

  box([0.70, 0.17, 0.43], [0, 0.91, -0.005], paleCardPaint, pelvisBone, {
    texture: lightCardTexture,
    name: "waistBox",
    group: "costume",
  });

  // Lower front and rear folded flaps.
  box([0.64, 0.07, 0.035], [0, 0.91, 0.238], tapePaint, pelvisBone, {
    texture: tapeTexture,
    name: "waistFrontFold",
  });
  box([0.62, 0.06, 0.03], [0, 0.91, -0.23], CARD_EDGE, pelvisBone, {
    name: "waistBackFold",
  });

  // Four broad torso corner strips.
  box([0.035, 0.73, 0.025], TAPE_LIGHT, [0.393, 1.29, 0.255], torsoBone, {
    texture: tapeTexture,
    name: "torsoSeamL",
  });
  box([0.035, 0.73, 0.025], TAPE_LIGHT, [-0.393, 1.29, 0.255], torsoBone, {
    texture: tapeTexture,
    name: "torsoSeamR",
  });
  box([0.82, 0.035, 0.027], TAPE_LIGHT, [0, 1.625, 0.255], torsoBone, {
    texture: tapeTexture,
    name: "torsoTopSeam",
  });
  box([0.82, 0.035, 0.027], TAPE_DARK, [0, 0.955, 0.255], torsoBone, {
    texture: tapeTexture,
    name: "torsoBottomSeam",
  });

  // Diagonal crossed packing straps.
  tapeRod([-0.35, 1.61, 0.268], [0.35, 0.97, 0.268], 0.018, torsoBone);
  tapeRod([0.35, 1.61, 0.27], [-0.35, 0.97, 0.27], 0.018, torsoBone);

  // -----------------------------------------------------------------------------------------------
  // Chest control console

  frontPlate([0.49, 0.39, 0.026], [0, 1.27, 0.263], CARD_DARK, torsoBone, undefined, {
    name: "darkChestConsole",
    group: "controls",
  });

  box([0.53, 0.025, 0.025], TAPE_LIGHT, [0, 1.475, 0.281], torsoBone, {
    texture: tapeTexture,
    name: "consoleTopTape",
  });
  box([0.53, 0.025, 0.025], TAPE_LIGHT, [0, 1.065, 0.281], torsoBone, {
    texture: tapeTexture,
    name: "consoleBottomTape",
  });
  box([0.025, 0.39, 0.025], TAPE_LIGHT, [-0.265, 1.27, 0.281], torsoBone, {
    texture: tapeTexture,
    name: "consoleLeftTape",
  });
  box([0.025, 0.39, 0.025], TAPE_LIGHT, [0.265, 1.27, 0.281], torsoBone, {
    texture: tapeTexture,
    name: "consoleRightTape",
  });

  const screen = b.part(new THREE.PlaneGeometry(0.29, 0.145), "#ffffff", {
    at: [0, 1.345, 0.285],
    bone: torsoBone,
    dir: [0, 0, 1],
    axis: "z",
    texture: screenTexture,
    name: "glowingStatusScreen",
    group: "controls",
  });
  glow(screen, 1.55);

  const warning = b.part(new THREE.PlaneGeometry(0.105, 0.105), "#ffffff", {
    at: [-0.165, 1.155, 0.286],
    bone: torsoBone,
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
    name: "warningSticker",
    group: "controls",
  });

  button([-0.16, 1.405, 0.294], RED, torsoBone);
  button([-0.08, 1.405, 0.294], YELLOW, torsoBone);
  button([0.0, 1.405, 0.294], GREEN, torsoBone);
  button([0.08, 1.405, 0.294], CYAN, torsoBone);

  for (const x of [-0.205, 0.205]) {
    for (const y of [1.105, 1.435]) {
      rivet([x, y, 0.299], torsoBone, SILVER, 0.013);
    }
  }

  const label = b.part(new THREE.PlaneGeometry(0.22, 0.082), "#ffffff", {
    at: [0.13, 1.14, 0.287],
    bone: torsoBone,
    dir: [0, 0, 1],
    axis: "z",
    texture: labelTexture,
    name: "handmadeLabel",
    group: "controls",
  });

  // Tiny cardboard toggle lever.
  cylinder(0.016, 0.09, [0.145, 1.225, 0.30], TAPE_DARK, torsoBone, {
    dir: [0, 1, 0],
    name: "toggleLever",
  });
  sphere(0.027, [0.145, 1.275, 0.30], RED, torsoBone, {
    name: "toggleTip",
  });

  // Side labels and a serial number on the rear-facing side of the torso.
  for (const side of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.21, 0.078), "#ffffff", {
      at: [side * 0.414, 1.30, 0.02],
      bone: torsoBone,
      dir: [side, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: labelTexture,
      name: side > 0 ? "leftSideLabel" : "rightSideLabel",
      group: "labels",
    });
  }

  b.part(new THREE.PlaneGeometry(0.31, 0.085), "#ffffff", {
    at: [0, 1.30, -0.257],
    bone: torsoBone,
    dir: [0, 0, -1],
    axis: "z",
    texture: serialTexture,
    name: "backSerialLabel",
    group: "labels",
  });

  // Torso rivets, six visible hand-fastened bumps.
  for (const x of [-0.34, 0.34]) {
    for (const y of [1.57, 1.28, 1.0]) {
      rivet([x, y, 0.27], torsoBone, TAPE_LIGHT, 0.015);
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Head box, opening, face and handmade robot details

  const headBox = box([0.63, 0.54, 0.50], [0, 2.04, 0.08], cardPaint, head, {
    texture: cardboardTexture,
    name: "cardboardRobotHead",
    group: "head",
  });

  // Head top flap and a deliberate folded side tab.
  box([0.66, 0.035, 0.52], [0, 2.322, 0.08], paleCardPaint, head, {
    texture: lightCardTexture,
    name: "headTopFlap",
    group: "head",
  });
  box([0.035, 0.24, 0.025], tapePaint, [0.327, 2.08, 0.08], head, {
    texture: tapeTexture,
    name: "headSideFoldL",
  });
  box([0.035, 0.24, 0.025], tapePaint, [-0.327, 2.08, 0.08], head, {
    texture: tapeTexture,
    name: "headSideFoldR",
  });
  box([0.63, 0.035, 0.025], TAPE_LIGHT, [0, 1.795, 0.338], head, {
    texture: tapeTexture,
    name: "headLowerSeam",
  });

  // Dark visor opening.
  frontPlate([0.45, 0.31, 0.018], RUBBER, [0, 2.075, 0.338], head, undefined, {
    name: "visorOpening",
    group: "face",
  });

  // Four tape strips frame the opening like an actual box costume.
  box([0.49, 0.038, 0.026], tapePaint, [0, 2.245, 0.354], head, {
    texture: tapeTexture,
    name: "visorTapeTop",
    group: "face",
  });
  box([0.49, 0.038, 0.026], tapePaint, [0, 1.905, 0.354], head, {
    texture: tapeTexture,
    name: "visorTapeBottom",
    group: "face",
  });
  box([0.038, 0.31, 0.026], tapePaint, [-0.228, 2.075, 0.354], head, {
    texture: tapeTexture,
    name: "visorTapeLeft",
    group: "face",
  });
  box([0.038, 0.31, 0.026], tapePaint, [0.228, 2.075, 0.354], head, {
    texture: tapeTexture,
    name: "visorTapeRight",
    group: "face",
  });

  // Child's face peeking from inside the square visor.
  const face = b.part(new THREE.PlaneGeometry(0.285, 0.235), "#ffffff", {
    at: [0, 2.075, 0.369],
    bone: head,
    dir: [0, 0, 1],
    axis: "z",
    texture: faceTexture,
    name: "kidFaceInVisor",
    group: "face",
  });

  // Lower jaw flap, intentionally a separate hinged cardboard piece.
  box([0.34, 0.075, 0.035], paleCardPaint, [0, 1.875, 0.365], jaw, {
    texture: lightCardTexture,
    name: "lowerCardboardJaw",
    group: "face",
  });
  box([0.24, 0.018, 0.018], CARD_DARK, [0, 1.91, 0.389], jaw, {
    name: "jawSmileShadow",
    group: "face",
  });

  // Ear-like robot side discs.
  for (const side of [1, -1]) {
    cylinder(0.095, 0.042, [side * 0.355, 2.06, 0.08], tapePaint, head, {
      dir: [side, 0, 0],
      axis: "y",
      texture: tapeTexture,
      name: side > 0 ? "leftEarDial" : "rightEarDial",
      group: "head",
    });
    cylinder(0.044, 0.052, [side * 0.385, 2.06, 0.08], CARD_DARK, head, {
      dir: [side, 0, 0],
      axis: "y",
      name: side > 0 ? "leftEarHub" : "rightEarHub",
      group: "head",
    });
    rivet([side * 0.414, 2.06, 0.08], head, RED, 0.018);
  }

  // Head corner rivets.
  for (const x of [-0.285, 0.285]) {
    for (const y of [1.82, 2.27]) {
      rivet([x, y, 0.355], head, TAPE_LIGHT, 0.014);
    }
  }

  // Neck collar made from stacked cardboard rings.
  cylinder(0.235, 0.075, [0, 1.735, 0.04], CARD_DARK, neckBone, {
    name: "neckShadowCollar",
  });
  cylinder(0.265, 0.045, [0, 1.705, 0.04], tapePaint, neckBone, {
    texture: tapeTexture,
    name: "neckTapeCollar",
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rivet([Math.cos(a) * 0.238, 1.735, 0.04 + Math.sin(a) * 0.238], neckBone, TAPE_LIGHT, 0.011);
  }

  // Antenna stem, bent slightly like a straw taped into the box.
  const antennaPath = catmull([
    antenna.at,
    [0, 2.43, 0.09],
    [0.018, 2.54, 0.10],
    [0, 2.625, 0.105],
  ]);
  b.sweep(antennaPath, [0.025, 0.022], {
    bone: antenna,
    color: tapePaint,
    section: { ngon: 6 },
    caps: "round",
    name: "bentCardboardAntenna",
    group: "head",
  });
  sphere(0.055, [0, 2.64, 0.105], RED, antenna, {
    name: "antennaWarningLight",
    group: "head",
  });
  const antennaGlow = sphere(0.027, [0, 2.64, 0.145], "#ff7862", antenna, {
    name: "antennaGlowCore",
    group: "head",
  });
  glow(antennaGlow, 1.8);

  // -----------------------------------------------------------------------------------------------
  // Boxy arms and mitten hands

  const armSweeps: any[] = [];
  for (const side of [1, -1]) {
    const arm = side > 0 ? armL : armR;
    const armSweep = b.sweep(arm, (t: number) => [0.105 - t * 0.018, 0.115 - t * 0.02], {
      color: cardPaint,
      section: "box",
      caps: "round",
      name: side > 0 ? "leftCardboardArm" : "rightCardboardArm",
      group: "arms",
    });
    armSweeps.push(armSweep);

    // Shoulder armor plates and tape bands.
    box([0.24, 0.22, 0.18], paleCardPaint, [side * 0.445, 1.52, 0.025], arm.joints[0], {
      texture: lightCardTexture,
      name: side > 0 ? "leftShoulderShell" : "rightShoulderShell",
      group: "arms",
    });
    box([0.25, 0.035, 0.20], tapePaint, [side * 0.445, 1.625, 0.025], arm.joints[0], {
      texture: tapeTexture,
      name: side > 0 ? "leftShoulderTape" : "rightShoulderTape",
    });

    box([0.20, 0.07, 0.21], tapePaint, [side * 0.675, 1.22, 0.09], arm.joints[1], {
      texture: tapeTexture,
      name: side > 0 ? "leftElbowTape" : "rightElbowTape",
      group: "arms",
    });

    box([0.22, 0.08, 0.22], paleCardPaint, [side * 0.745, 1.075, 0.13], arm.joints[2], {
      texture: lightCardTexture,
      name: side > 0 ? "leftWristCuff" : "rightWristCuff",
      group: "arms",
    });

    // Oversized square mitten.
    box([0.21, 0.18, 0.23], cardPaint, [side * 0.775, 1.015, 0.15], arm.tip, {
      texture: cardboardTexture,
      name: side > 0 ? "leftMitten" : "rightMitten",
      group: "hands",
    });

    // Palm patch and rivets.
    box([0.12, 0.09, 0.022], TAPE_LIGHT, [side * 0.775, 1.015, 0.272], arm.tip, {
      texture: tapeTexture,
      name: side > 0 ? "leftPalmPatch" : "rightPalmPatch",
    });
    rivet([side * 0.72, 1.075, 0.28], arm.tip, RED, 0.014);
    rivet([side * 0.83, 0.955, 0.28], arm.tip, TAPE_LIGHT, 0.014);
  }

  // Three separated cardboard fingers per hand.
  for (const d of digitChains) {
    const isLeft = d.side > 0;
    const digit = d.chain;
    b.sweep(digit, [0.027, 0.024], {
      color: paleCardPaint,
      section: "box",
      caps: "round",
      name: `${d.name}CardboardDigit`,
      group: "hands",
    });
    sphere(0.029, digit.tip.at, tapePaint, digit.tip, {
      name: `${d.name}FingerTip`,
      group: "hands",
    });
  }

  // -----------------------------------------------------------------------------------------------
  // Boxy legs, knees, boots and soles

  for (const side of [1, -1]) {
    const leg = side > 0 ? legL : legR;

    b.sweep(leg, (t: number) => [0.135 - t * 0.018, 0.145 - t * 0.025], {
      color: cardPaint,
      section: "box",
      caps: "round",
      name: side > 0 ? "leftCardboardLeg" : "rightCardboardLeg",
      group: "legs",
    });

    // Hip socket gusset.
    box([0.25, 0.20, 0.28], paleCardPaint, [side * 0.23, 0.84, 0.025], leg.joints[0], {
      texture: lightCardTexture,
      name: side > 0 ? "leftHipGusset" : "rightHipGusset",
      group: "legs",
    });

    // Knee plate with a bright folded edge.
    box([0.27, 0.17, 0.035], CARD_DARK, [side * 0.25, 0.59, 0.14], leg.joints[1], {
      name: side > 0 ? "leftKneeShadow" : "rightKneeShadow",
      group: "legs",
    });
    box([0.23, 0.13, 0.045], tapePaint, [side * 0.25, 0.60, 0.164], leg.joints[1], {
      texture: tapeTexture,
      name: side > 0 ? "leftKneePatch" : "rightKneePatch",
      group: "legs",
    });
    rivet([side * 0.17, 0.60, 0.19], leg.joints[1], RED, 0.013);
    rivet([side * 0.33, 0.60, 0.19], leg.joints[1], TAPE_LIGHT, 0.013);

    // Ankle cuff.
    box([0.25, 0.09, 0.24], tapePaint, [side * 0.23, 0.235, 0.10], leg.joints[2], {
      texture: tapeTexture,
      name: side > 0 ? "leftAnkleTape" : "rightAnkleTape",
      group: "legs",
    });

    // Big cardboard boot, with a forward toe and dark sole.
    box([0.29, 0.18, 0.43], cardPaint, [side * 0.23, 0.13, 0.17], leg.tip, {
      texture: cardboardTexture,
      name: side > 0 ? "leftCardboardBoot" : "rightCardboardBoot",
      group: "feet",
    });
    box([0.30, 0.045, 0.44], SHOE, [side * 0.23, 0.035, 0.17], leg.tip, {
      name: side > 0 ? "leftRubberSole" : "rightRubberSole",
      group: "feet",
    });
    box([0.255, 0.105, 0.045], tapePaint, [side * 0.23, 0.175, 0.385], leg.tip, {
      texture: tapeTexture,
      name: side > 0 ? "leftToeCap" : "rightToeCap",
      group: "feet",
    });
    rivet([side * 0.15, 0.17, 0.40], leg.tip, TAPE_LIGHT, 0.013);
    rivet([side * 0.31, 0.17, 0.40], leg.tip, TAPE_LIGHT, 0.013);
  }

  // -----------------------------------------------------------------------------------------------
  // Loose cardboard craft details: tabs, corners, patches, and visible fasteners

  // Side waist tabs.
  for (const side of [1, -1]) {
    box([0.04, 0.12, 0.15], tapePaint, [side * 0.365, 0.94, 0.04], pelvisBone, {
      texture: tapeTexture,
      name: side > 0 ? "leftWaistTab" : "rightWaistTab",
      group: "costume",
    });
    rivet([side * 0.39, 0.96, 0.04], pelvisBone, RED, 0.012);
  }

  // Four little folded corners on the torso, like tabs from a shipping box.
  const foldedTabs = [
    [-0.34, 1.58, 0.29],
    [0.34, 1.58, 0.29],
    [-0.34, 1.00, 0.29],
    [0.34, 1.00, 0.29],
  ] as const;
  for (const p of foldedTabs) {
    b.part(
      new THREE.ConeGeometry(0.055, 0.075, 4),
      tapePaint,
      {
        at: p,
        bone: torsoBone,
        dir: [0, 0, 1],
        axis: "y",
        texture: tapeTexture,
        name: "foldedCornerTab",
        group: "costume",
      },
    );
  }

  // Cardboard "vent" slats on each side of the head.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      box([0.018, 0.045, 0.14], CARD_DARK, [side * 0.36, 1.96 + i * 0.075, -0.02], head, {
        name: side > 0 ? "leftHeadVent" : "rightHeadVent",
        group: "head",
      });
    }
  }

  // A small printed robot badge beneath the console.
  b.part(new THREE.CircleGeometry(0.055, 10), "#ffffff", {
    at: [0.0, 0.985, 0.278],
    bone: torsoBone,
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
    name: "tinyRobotBadge",
    group: "controls",
  });

  // A few exposed corrugated cardboard edge bars on the costume sides.
  for (const side of [1, -1]) {
    for (const y of [1.12, 1.32, 1.52]) {
      box([0.022, 0.11, 0.018], CARD_EDGE, [side * 0.416, y, -0.10], torsoBone, {
        name: side > 0 ? "leftCorrugationEdge" : "rightCorrugationEdge",
        group: "costume",
      });
    }
  }

  // A raised rear handle makes the silhouette unmistakably box-built.
  box([0.18, 0.035, 0.035], tapePaint, [0, 1.70, -0.30], torsoBone, {
    texture: tapeTexture,
    name: "backHandleTop",
    group: "costume",
  });
  tapeRod([-0.09, 1.70, -0.30], [-0.09, 1.55, -0.30], 0.018, torsoBone);
  tapeRod([0.09, 1.70, -0.30], [0.09, 1.55, -0.30], 0.018, torsoBone);
  box([0.22, 0.035, 0.035], tapePaint, [0, 1.55, -0.30], torsoBone, {
    texture: tapeTexture,
    name: "backHandleBottom",
    group: "costume",
  });

  // Two chest-side blinking indicator lamps.
  for (const side of [1, -1]) {
    const lamp = sphere(0.035, [side * 0.32, 1.48, 0.285], side > 0 ? CYAN : RED, torsoBone, {
      name: side > 0 ? "cyanIndicator" : "redIndicator",
      group: "controls",
    });
    glow(lamp, 1.15);
  }

  // A thin cardboard cable from the chest to each shoulder.
  tapeRod([-0.25, 1.53, 0.285], [-0.39, 1.50, 0.14], 0.012, torsoBone);
  tapeRod([0.25, 1.53, 0.285], [0.39, 1.50, 0.14], 0.012, torsoBone);

  // Small knuckle blocks keep the mitten hands readable from a distance.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      box([0.055, 0.055, 0.025], TAPE_LIGHT, [side * (0.72 + i * 0.055), 1.095, 0.282], armL.tip, {
        texture: tapeTexture,
        name: side > 0 ? "leftKnucklePatch" : "rightKnucklePatch",
        group: "hands",
      });
    }
  }

  // A tiny pair of side wheels suggests the child added "robot mobility" after finishing the box.
  for (const side of [1, -1]) {
    cylinder(0.072, 0.034, [side * 0.43, 1.02, -0.10], RUBBER, torsoBone, {
      dir: [side, 0, 0],
      axis: "y",
      name: side > 0 ? "leftSideWheel" : "rightSideWheel",
      group: "costume",
    });
    cylinder(0.032, 0.040, [side * 0.455, 1.02, -0.10], RED, torsoBone, {
      dir: [side, 0, 0],
      axis: "y",
      name: side > 0 ? "leftWheelHub" : "rightWheelHub",
      group: "costume",
    });
  }

  return b.root;
}
```