```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  grain,
  limb,
  mottle,
  stripes,
  svg,
} from "agentic-3js-builder";
import { animeEye } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "cardboard-kid-robot",
  description:
    "A cheerful kid wearing a lovingly improvised cardboard-box robot costume, complete with cut-out face, taped seams, controls, antenna, mitten hands, chunky boots, and corrugated craft details.",
};

const BOARD = grain(
  mottle("#b8783d", "#dca766", { size: 0.15, contrast: 0.85, seed: 12 }),
  "#8b512c",
  { size: 0.035, axis: [0, 0, 1], seed: 21 },
);

const LIGHT_BOARD = grain(
  mottle("#d39a58", "#edc181", { size: 0.12, contrast: 0.8, seed: 15 }),
  "#a96735",
  { size: 0.04, axis: [0, 0, 1], seed: 27 },
);

const EDGE_BOARD = mottle("#704022", "#a15d2c", {
  size: 0.06,
  contrast: 0.9,
  seed: 31,
});

const CORRUGATED_EDGE = stripes(
  EDGE_BOARD,
  "#d08a45",
  {
    size: 0.018,
    axis: "y",
    width: 0.26,
    wobble: 0.12,
    seed: 42,
  },
);

const TAPE = grain("#d8a15b", "#f1d69b", {
  size: 0.022,
  axis: [1, 0, 0],
  seed: 51,
});

const TAPE_LIGHT = mottle("#f1d79e", "#fff0c8", {
  size: 0.04,
  contrast: 0.75,
  seed: 52,
});

const SKIN = countershade(
  mottle("#d7895e", "#ffd0a0", { size: 0.09, contrast: 0.8, seed: 61 }),
  "#a94f45",
  { level: 0.02, soft: 0.28 },
);

const HAIR = grain("#3a211b", "#75412a", {
  size: 0.035,
  axis: [0, 1, 0],
  seed: 72,
});

const DARK = "#211b22";
const INK = "#3b211d";
const RED = "#d94b35";
const RED_DARK = "#7d2e28";
const BLUE = "#3e8bb3";
const BLUE_DARK = "#214b68";
const YELLOW = "#f0bd3d";
const GREEN = "#66a66d";
const STEEL = "#77746d";
const RUBBER = "#302a2b";
const WHITE = "#fff4d6";

const EYE_TEXTURE = animeEye({
  iris: "#4ca4d4",
  irisLight: "#a9e7ff",
  irisDark: "#1b4f78",
  blush: "#ed8a88",
  size: 384,
});

const CHEST_SCREEN = svg(
  `<svg viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#163b47"/>
        <stop offset="1" stop-color="#071b24"/>
      </linearGradient>
      <linearGradient id="cyan" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#5ff2df"/>
        <stop offset="1" stop-color="#b9fff0"/>
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="174" height="84" rx="7" fill="url(#bg)" stroke="#d7b06b" stroke-width="4"/>
    <path d="M14 18 H166 M14 72 H166" stroke="#2a7582" stroke-width="2"/>
    <text x="17" y="34" font-family="monospace" font-size="15" font-weight="bold" fill="#74f2dc">KID-OS 07</text>
    <text x="18" y="57" font-family="monospace" font-size="11" fill="#bdf9e9">BEEP / BOOP</text>
    <path d="M112 51 h13 l6 -13 9 27 8 -15 h14" fill="none" stroke="url(#cyan)" stroke-width="3"/>
    <circle cx="28" cy="76" r="4" fill="#ed6257"/>
    <circle cx="43" cy="76" r="4" fill="#f1c34b"/>
    <circle cx="58" cy="76" r="4" fill="#66d28b"/>
    <path d="M154 20 l9 0 M154 25 l5 0" stroke="#fff4ca" stroke-width="2"/>
  </svg>`,
  { size: 384 },
);

const HAZARD_TEXTURE = svg(
  `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="32" fill="#24202a"/>
    <path d="M-8 32 L16 0 H30 L6 32 Z M30 32 L54 0 H68 L44 32 Z M68 32 L92 0 H106 L82 32 Z M106 32 L130 0 H144 L120 32 Z"
      fill="#efbf3e"/>
    <path d="M0 3 H128 M0 29 H128" stroke="#f5db72" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const SERIAL_TEXTURE = svg(
  `<svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="156" height="60" rx="4" fill="#f4dfad" stroke="#6b3d27" stroke-width="4"/>
    <path d="M12 13 H147" stroke="#bd7a42" stroke-width="2"/>
    <text x="13" y="34" font-family="monospace" font-size="19" font-weight="bold" fill="#532b22">BX-07</text>
    <text x="14" y="51" font-family="monospace" font-size="10" fill="#77452d">PROPERTY OF KID</text>
    <path d="M121 15 v34 M126 15 v34 M132 15 v34 M140 15 v34" stroke="#6d3e2b" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const HEAD_BADGE_TEXTURE = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="60" fill="#e8b869"/>
    <circle cx="50" cy="30" r="24" fill="#375665" stroke="#2d2527" stroke-width="5"/>
    <path d="M36 34 Q50 16 64 34 L58 42 H42 Z" fill="#73d2d0"/>
    <circle cx="44" cy="30" r="3" fill="#fff7c6"/>
    <circle cx="56" cy="30" r="3" fill="#fff7c6"/>
    <path d="M44 39 Q50 43 56 39" fill="none" stroke="#fff7c6" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const TAPE_MARK_TEXTURE = svg(
  `<svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="160" fill="#ebca8a"/>
    <path d="M7 0 v160 M73 0 v160" stroke="#b97d45" stroke-width="3" stroke-dasharray="7 8"/>
    <path d="M18 10 H62 M18 42 H62 M18 74 H62 M18 106 H62 M18 138 H62"
      stroke="#f8e8b8" stroke-width="3" opacity=".8"/>
  </svg>`,
  { size: 256 },
);

const BOOT_TREAD_TEXTURE = svg(
  `<svg viewBox="0 0 120 72" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="72" fill="#3c3434"/>
    <path d="M-10 62 L16 0 H29 L3 72 Z M24 72 L50 0 H63 L37 72 Z M58 72 L84 0 H97 L71 72 Z M92 72 L118 0 H131 L105 72 Z"
      fill="#8a7770"/>
    <path d="M0 12 H120 M0 60 H120" stroke="#b2a18e" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const TORSO_LABEL_TEXTURE = svg(
  `<svg viewBox="0 0 180 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="176" height="44" rx="5" fill="#4a332b" stroke="#eac17a" stroke-width="4"/>
    <text x="90" y="32" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#f7d88e">ROBOT CLUB</text>
  </svg>`,
  { size: 256 },
);

function putBox(
  b: any,
  size: readonly [number, number, number],
  color: any,
  at: any,
  bone: any,
  options: any = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    flat: true,
    ...options,
  });
}

function putPlane(
  b: any,
  size: readonly [number, number],
  texture: any,
  at: any,
  bone: any,
  dir: readonly [number, number, number] = [0, 0, 1],
  up: readonly [number, number, number] = [0, 1, 0],
  options: any = {},
) {
  return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
    at,
    bone,
    dir,
    up,
    axis: "z",
    texture,
    ...options,
  });
}

function putRivet(b: any, at: any, bone: any, color: any = STEEL, radius = 0.012) {
  return b.part(new THREE.SphereGeometry(radius, 7, 5), color, {
    at,
    bone,
    flat: true,
  });
}

function putBolt(
  b: any,
  at: any,
  dir: readonly [number, number, number],
  bone: any,
  color: any = STEEL,
  radius = 0.015,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, 0.014, 8), color, {
    at,
    bone,
    dir,
    flat: true,
  });
}

function addFrontSticker(
  b: any,
  at: any,
  size: readonly [number, number],
  texture: any,
  bone: any,
  dir: readonly [number, number, number] = [0, 0, 1],
  up: readonly [number, number, number] = [0, 1, 0],
) {
  return putPlane(b, size, texture, at, bone, dir, up);
}

function addButtons(b: any, target: any, guesses: readonly [number, number, number][]) {
  const buttonColors = [RED, YELLOW, GREEN, BLUE];
  guesses.forEach((guess, i) => {
    const hit = b.surface(target).nearest(guess);
    if (hit) {
      b.stick(
        new THREE.CylinderGeometry(0.022, 0.022, 0.014, 8),
        buttonColors[i % buttonColors.length],
        hit,
        { embed: 0.3, spin: i % 2 ? 15 : -15 },
      );
      b.stick(
        new THREE.SphereGeometry(0.006, 5, 4),
        WHITE,
        hit.moved([0, 0.009, 0]),
        { embed: 0.2 },
      );
    }
  });
}

export default function build() {
  const b = createBuilder({
    name: "cardboard-kid-robot",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: a compact child-sized humanoid with relaxed, readable costume limbs.

  const hips = b.joint("hips", {
    at: [0, 0.79, 0],
    role: "spine",
    group: "skeleton",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.79, 0],
      [0, 1.02, 0],
      [0, 1.22, 0],
    ]),
    {
      parent: hips,
      names: ["spine", "chest", "neckBase"],
      role: "spine",
      group: "skeleton",
    },
  );

  const chest = spine.joints[1];
  const neckBase = spine.tip;

  const head = b.joint("head", {
    parent: neckBase,
    at: neckBase.at,
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.38, 0.33],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const antenna = b.joint("antenna", {
    parent: head,
    at: [0, 1.7, 0.015],
    dir: [0, 1, 0],
    role: "hinge",
    group: "head",
  });

  const arms: { side: "L" | "R"; s: number; chain: any; fingers: any[] }[] = [];
  const legs: { side: "L" | "R"; s: number; chain: any }[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const shoulder = [s * 0.36, 1.16, 0.01] as [number, number, number];
    const hand = [s * 0.58, 0.75, 0.16] as [number, number, number];
    const armPoints = limb(
      shoulder,
      hand,
      [0.27, 0.28],
      [[0, 0, 1]],
    );

    const arm = b.chain(`arm${side}`, armPoints, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: "arms",
      contact: hand,
    });

    const fingers: any[] = [];
    const wrist = arm.tip.at;
    const fingerData = [
      {
        name: `thumb${side}`,
        tip: [s * 0.68, 0.75, 0.22] as [number, number, number],
      },
      {
        name: `finger${side}`,
        tip: [s * 0.66, 0.69, 0.31] as [number, number, number],
      },
    ];

    for (const finger of fingerData) {
      const fingerChain = b.chain(
        finger.name,
        catmull([wrist, finger.tip]),
        {
          parent: arm.tip,
          names: [finger.name, `${finger.name}Tip`],
          role: "digit",
          group: "fingers",
        },
      );
      fingers.push(fingerChain);
    }

    arms.push({ side, s, chain: arm, fingers });

    const hip = [s * 0.18, 0.78, 0] as [number, number, number];
    const foot = [s * 0.2, 0.105, 0.13] as [number, number, number];
    const legPoints = limb(
      hip,
      foot,
      [0.35, 0.34],
      [[0, 0, 1]],
    );

    const leg = b.chain(`leg${side}`, legPoints, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      group: "legs",
      contact: [foot[0], 0, foot[2]],
    });

    legs.push({ side, s, chain: leg });
  }

  // A slightly open jaw makes the child read as alive inside the robot head.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  // ---------------------------------------------------------------------------------------------------------------
  // Face first: the child is visible through the square robot-head opening.

  const faceCenter = [0, 1.475, 0.16] as [number, number, number];
  const face = b.part(
    new THREE.SphereGeometry(0.205, 14, 10),
    SKIN,
    {
      bone: head,
      at: faceCenter,
      scale: [1, 0.93, 0.9],
      flat: true,
      group: "child-face",
      name: "childFace",
    },
  );

  const faceSurface = b.surface(face);

  for (const s of [1, -1]) {
    const eyeHit = faceSurface.around(faceCenter).at(s * 24, 5);
    if (eyeHit) {
      const eye = b.decal(faceSurface, EYE_TEXTURE, {
        at: eyeHit,
        dir: [0, 0, 1],
        up: [0, 1, 0],
        size: [0.102, 0.13],
        segments: 8,
        lift: 0.003,
        mirror: s > 0,
        name: `brightEye${s > 0 ? "L" : "R"}`,
        group: "child-face",
      });
      glow(eye, 1.15);
    }
  }

  b.part(new THREE.SphereGeometry(0.035, 9, 6), SKIN, {
    bone: head,
    at: [0, 1.425, 0.355],
    flat: true,
    group: "child-face",
    name: "buttonNose",
  });

  putBox(
    b,
    [0.105, 0.025, 0.022],
    INK,
    [0, 1.385, 0.365],
    head,
    { group: "child-face", name: "upperMouth" },
  );

  const lowerLip = jaw.local({ forward: 0.062, down: 0.008 });
  putBox(
    b,
    [0.105, 0.032, 0.032],
    SKIN,
    lowerLip,
    jaw,
    {
      dir: jaw.axis,
      group: "child-face",
      name: "lowerJaw",
    },
  );

  b.part(new THREE.SphereGeometry(0.18, 12, 8), HAIR, {
    bone: head,
    at: [0, 1.625, 0.125],
    scale: [1.04, 0.42, 0.92],
    flat: true,
    group: "child-face",
    name: "hairCap",
  });

  const hairTufts = [
    [-0.14, 1.676, 0.16],
    [-0.07, 1.7, 0.17],
    [0, 1.71, 0.18],
    [0.07, 1.7, 0.17],
    [0.14, 1.676, 0.16],
  ];

  for (const [x, y, z] of hairTufts) {
    b.spike(
      [x, y, z],
      [x * 0.25, 1, 0.1],
      0.075,
      0.027,
      {
        bone: head,
        color: HAIR,
        caps: "point",
        group: "child-face",
        name: "hairTuft",
      },
    );
  }

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.067, 9, 6), SKIN, {
      bone: head,
      at: [s * 0.188, 1.47, 0.15],
      flat: true,
      group: "child-face",
      name: `ear${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.038, 8, 5), RED_DARK, {
      bone: head,
      at: [s * 0.211, 1.47, 0.153],
      flat: true,
      group: "child-face",
      name: `earWarm${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The robot helmet is a shell of cardboard panels rather than a solid box, leaving the face opening readable.

  putBox(b, [0.58, 0.48, 0.06], BOARD, [0, 1.48, -0.18], head, {
    group: "head-shell",
    name: "helmetBack",
  });

  for (const s of [1, -1]) {
    putBox(
      b,
      [0.06, 0.48, 0.38],
      BOARD,
      [s * 0.27, 1.48, 0.015],
      head,
      {
        group: "head-shell",
        name: `helmetSide${s > 0 ? "L" : "R"}`,
      },
    );
  }

  putBox(b, [0.58, 0.06, 0.38], LIGHT_BOARD, [0, 1.705, 0.015], head, {
    group: "head-shell",
    name: "helmetTop",
  });

  putBox(b, [0.58, 0.06, 0.38], EDGE_BOARD, [0, 1.255, 0.015], head, {
    group: "head-shell",
    name: "helmetBottom",
  });

  putBox(b, [0.58, 0.075, 0.06], LIGHT_BOARD, [0, 1.675, 0.255], head, {
    group: "head-shell",
    name: "faceFrameTop",
  });

  putBox(b, [0.58, 0.065, 0.06], BOARD, [0, 1.285, 0.255], head, {
    group: "head-shell",
    name: "faceFrameBottom",
  });

  for (const s of [1, -1]) {
    putBox(
      b,
      [0.075, 0.4, 0.06],
      LIGHT_BOARD,
      [s * 0.25, 1.48, 0.255],
      head,
      {
        group: "head-shell",
        name: `faceFrameSide${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Tape seams around the helmet make the cut-and-fold construction unmistakable.
  putBox(b, [0.024, 0.43, 0.018], TAPE, [-0.293, 1.48, 0.22], head, {
    group: "head-tape",
    name: "helmetTapeL",
  });
  putBox(b, [0.024, 0.43, 0.018], TAPE, [0.293, 1.48, 0.22], head, {
    group: "head-tape",
    name: "helmetTapeR",
  });
  putBox(b, [0.39, 0.024, 0.018], TAPE, [0, 1.48, -0.214], head, {
    group: "head-tape",
    name: "helmetBackTape",
  });

  addFrontSticker(
    b,
    [0, 1.628, 0.291],
    [0.18, 0.06],
    HEAD_BADGE_TEXTURE,
    head,
  );

  for (const s of [1, -1]) {
    addFrontSticker(
      b,
      [s * 0.305, 1.48, 0.04],
      [0.105, 0.075],
      SERIAL_TEXTURE,
      head,
      [s, 0, 0],
      [0, 1, 0],
    );

    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.042, 10), RED_DARK, {
      bone: head,
      at: [s * 0.324, 1.48, 0.02],
      dir: [s, 0, 0],
      flat: true,
      group: "head-ear-controls",
      name: `earDial${s > 0 ? "L" : "R"}`,
    });

    putRivet(b, [s * 0.327, 1.53, 0.02], head, YELLOW, 0.011);
    putRivet(b, [s * 0.327, 1.43, 0.02], head, BLUE, 0.011);
  }

  for (const x of [-0.23, 0.23]) {
    for (const y of [1.32, 1.64]) {
      putRivet(b, [x, y, 0.294], head, STEEL, 0.012);
    }
  }

  // A corrugated paper strip peeks from the helmet crown.
  for (const x of [-0.18, -0.06, 0.06, 0.18]) {
    putBox(b, [0.025, 0.018, 0.31], CORRUGATED_EDGE, [x, 1.742, 0.015], head, {
      group: "head-corrugation",
      name: "helmetCrownRib",
    });
  }

  // Cardboard side ear plates, cut as simple polygonal discs.
  const earOutline: [number, number, "sharp"][] = [
    [0, 0.09, "sharp"],
    [0.075, 0.06, "sharp"],
    [0.095, 0, "sharp"],
    [0.075, -0.06, "sharp"],
    [0, -0.09, "sharp"],
    [-0.075, -0.06, "sharp"],
    [-0.095, 0, "sharp"],
    [-0.075, 0.06, "sharp"],
  ];

  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [s * 0.32, 1.48, 0.02],
      x: [0, 0, s],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.004,
      smoothing: 0,
      color: BOARD,
      bone: head,
      group: "head-ear-plates",
      name: `cardboardEar${s > 0 ? "L" : "R"}`,
    });
  }

  // Antenna with a glowing red toy light.
  b.rod(antenna.at, [0, 1.835, 0.015], 0.018, EDGE_BOARD, {
    bone: antenna,
    caps: "flat",
    group: "antenna",
    name: "antennaStem",
  });

  putBox(b, [0.11, 0.045, 0.11], TAPE, [0, 1.72, 0.015], head, {
    group: "antenna",
    name: "antennaBase",
  });

  const antennaLight = b.part(new THREE.SphereGeometry(0.047, 9, 6), RED, {
    bone: antenna,
    at: [0, 1.88, 0.015],
    flat: true,
    group: "antenna",
    name: "antennaLight",
  });
  glow(antennaLight, 1.7);

  b.part(new THREE.SphereGeometry(0.018, 7, 5), WHITE, {
    bone: antenna,
    at: [0.014, 1.898, 0.038],
    flat: true,
    group: "antenna",
    name: "antennaHighlight",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Main costume box and control panel.

  const torso = putBox(
    b,
    [0.68, 0.57, 0.44],
    BOARD,
    [0, 1.005, 0],
    chest,
    {
      group: "torso",
      name: "mainTorsoBox",
    },
  );

  const frontPanel = putBox(
    b,
    [0.51, 0.35, 0.026],
    LIGHT_BOARD,
    [0, 1.065, 0.232],
    chest,
    {
      group: "torso-panel",
      name: "frontControlPanel",
    },
  );

  putBox(b, [0.54, 0.018, 0.034], TAPE, [0, 1.255, 0.247], chest, {
    group: "torso-tape",
    name: "chestTopTape",
  });
  putBox(b, [0.54, 0.018, 0.034], TAPE, [0, 0.875, 0.247], chest, {
    group: "torso-tape",
    name: "chestBottomTape",
  });

  const screen = addFrontSticker(
    b,
    [0, 1.112, 0.255],
    [0.345, 0.17],
    CHEST_SCREEN,
    chest,
  );
  glow(screen, 1.55);

  addFrontSticker(
    b,
    [0, 0.865, 0.252],
    [0.27, 0.072],
    TORSO_LABEL_TEXTURE,
    chest,
  );

  addButtons(b, frontPanel, [
    [-0.18, 0.945, 0.252],
    [-0.105, 0.945, 0.252],
    [0.105, 0.945, 0.252],
    [0.18, 0.945, 0.252],
  ]);

  // Tiny speaker slots under the display.
  for (let i = -2; i <= 2; i++) {
    putBox(b, [0.012, 0.04, 0.012], DARK, [i * 0.027, 0.976, 0.252], chest, {
      group: "torso-panel",
      name: "speakerSlot",
    });
  }

  // Chest corner reinforcement and vertical packing tape.
  for (const s of [1, -1]) {
    putBox(b, [0.026, 0.51, 0.032], TAPE, [s * 0.334, 1.015, 0.224], chest, {
      group: "torso-tape",
      name: `torsoFrontCornerTape${s > 0 ? "L" : "R"}`,
    });

    putBox(b, [0.032, 0.5, 0.027], EDGE_BOARD, [s * 0.345, 1.015, -0.19], chest, {
      group: "torso-edges",
      name: `torsoBackCorner${s > 0 ? "L" : "R"}`,
    });
  }

  // A belt is swept around the actual box surface; its rivets inherit the surface frame.
  const torsoSurface = b.surface(torso);
  const belt = torsoSurface.loop(chest, { lift: 0.006 });
  b.sweep(belt, 0.014, {
    color: TAPE,
    section: { ngon: 6 },
    caps: "none",
    group: "torso-belt",
    name: "cardboardBelt",
  });

  b.along(belt, 16, (at: any) =>
    b.stick(
      new THREE.SphereGeometry(0.012, 7, 5),
      RED_DARK,
      at,
      { embed: 0.45, group: "torso-belt", name: "beltRivet" },
    ),
  );

  // Lower front flap: a single folded cardboard shape with a slightly playful pointed edge.
  b.extrude(
    [
      [-0.29, 0, "sharp"],
      [0.29, 0, "sharp"],
      [0.26, 0.085, "sharp"],
      [0.12, 0.06, "sharp"],
      [0, 0.095, "sharp"],
      [-0.12, 0.06, "sharp"],
      [-0.26, 0.085, "sharp"],
    ],
    {
      at: [0, 0.715, 0.228],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: LIGHT_BOARD,
      bone: chest,
      group: "torso-flaps",
      name: "lowerFrontFlap",
    },
  );

  for (const x of [-0.25, 0.25]) {
    putRivet(b, [x, 0.755, 0.245], chest, STEEL, 0.011);
  }

  // Simple cardboard backpack visible at the silhouette and peeking over the shoulders.
  const backpack = putBox(
    b,
    [0.45, 0.39, 0.12],
    BOARD,
    [0, 1.025, -0.275],
    chest,
    {
      group: "backpack",
      name: "batteryBackpack",
    },
  );

  putBox(b, [0.032, 0.38, 0.018], TAPE, [-0.18, 1.025, -0.342], chest, {
    group: "backpack",
    name: "backpackTapeL",
  });
  putBox(b, [0.032, 0.38, 0.018], TAPE, [0.18, 1.025, -0.342], chest, {
    group: "backpack",
    name: "backpackTapeR",
  });
  putBox(b, [0.28, 0.025, 0.018], TAPE, [0, 1.195, -0.342], chest, {
    group: "backpack",
    name: "backpackTopTape",
  });

  for (const s of [1, -1]) {
    putBox(b, [0.085, 0.22, 0.11], EDGE_BOARD, [s * 0.255, 1.04, -0.275], chest, {
      group: "backpack",
      name: `backpackSide${s > 0 ? "L" : "R"}`,
    });
    putRivet(b, [s * 0.285, 1.14, -0.275], chest, YELLOW, 0.012);
    putRivet(b, [s * 0.285, 0.94, -0.275], chest, BLUE, 0.012);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Shoulder boxes, rectangular arm tubes, cuffs, control patches, and mitten fingers.

  for (const record of arms) {
    const { s, side, chain: arm, fingers } = record;
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip;

    putBox(b, [0.18, 0.18, 0.32], LIGHT_BOARD, shoulder.at, shoulder, {
      group: "shoulders",
      name: `shoulderArmor${side}`,
    });

    putBox(b, [0.17, 0.018, 0.25], TAPE, [s * 0.36, 1.17, 0.177], shoulder, {
      group: "shoulders",
      name: `shoulderFrontTape${side}`,
    });

    putRivet(b, [s * 0.36, 1.235, 0.18], shoulder, RED_DARK, 0.012);
    putRivet(b, [s * 0.36, 1.105, 0.18], shoulder, RED_DARK, 0.012);

    const armTube = b.sweep(arm, 0.09, {
      section: "box",
      skin: "rigid",
      caps: "flat",
      color: BOARD,
      group: "arms",
      name: `cardboardArm${side}`,
    });

    const elbowBand = b.surface(armTube).loop(elbow, { lift: 0.006 });
    b.sweep(elbowBand, 0.014, {
      section: { ngon: 6 },
      caps: "none",
      color: TAPE,
      group: "arm-cuffs",
      name: `elbowTape${side}`,
    });

    const wristBand = b.surface(armTube).loop(wrist, { lift: 0.006 });
    b.sweep(wristBand, 0.016, {
      section: { ngon: 6 },
      caps: "none",
      color: TAPE_LIGHT,
      group: "arm-cuffs",
      name: `wristTape${side}`,
    });

    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const p = arm.at(t).at;
      putBox(b, [0.018, 0.018, 0.19], EDGE_BOARD, [p.x, p.y, p.z + 0.088], arm.at(t).bone, {
        group: "arm-corrugation",
        name: `armRib${side}`,
      });
    }

    const armMid = arm.at(0.46).at;
    const armHit = b.surface(armTube).nearest([armMid.x, armMid.y, armMid.z + 0.12]);
    if (armHit) {
      addFrontSticker(
        b,
        armHit.at,
        [0.12, 0.085],
        HAZARD_TEXTURE,
        armHit.bone ?? arm.joints[0],
        armHit.n.toArray() as [number, number, number],
      );
    }

    const hand = putBox(
      b,
      [0.19, 0.15, 0.18],
      LIGHT_BOARD,
      wrist.at,
      wrist,
      {
        group: "hands",
        name: `boxMitten${side}`,
      },
    );

    putBox(b, [0.13, 0.018, 0.105], TAPE, [wrist.at.x, wrist.at.y, wrist.at.z + 0.094], wrist, {
      group: "hands",
      name: `mittenPalmTape${side}`,
    });

    putRivet(b, [wrist.at.x - s * 0.055, wrist.at.y + 0.04, wrist.at.z + 0.1], wrist, RED, 0.011);
    putRivet(b, [wrist.at.x + s * 0.055, wrist.at.y + 0.04, wrist.at.z + 0.1], wrist, YELLOW, 0.011);

    for (const finger of fingers) {
      const fingerTube = b.sweep(finger, 0.027, {
        section: "box",
        skin: "rigid",
        caps: "flat",
        color: BOARD,
        group: "fingers",
        name: finger.joints[0].name,
      });

      putBox(
        b,
        [0.05, 0.05, 0.045],
        EDGE_BOARD,
        finger.tip.at,
        finger.tip,
        {
          group: "fingers",
          name: `${finger.joints[0].name}TipCap`,
        },
      );

      putRivet(
        b,
        [finger.tip.at.x, finger.tip.at.y + 0.031, finger.tip.at.z + 0.024],
        finger.tip,
        STEEL,
        0.007,
      );

      void fingerTube;
      void hand;
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Chunky cardboard legs, taped knees, knee hazard patches, and handmade boots.

  for (const record of legs) {
    const { s, side, chain: leg } = record;
    const knee = leg.joints[1];
    const ankle = leg.tip;
    const legTube = b.sweep(leg, 0.105, {
      section: "box",
      skin: "rigid",
      caps: "flat",
      color: BOARD,
      group: "legs",
      name: `cardboardLeg${side}`,
    });

    const kneeBand = b.surface(legTube).loop(knee, { lift: 0.006 });
    b.sweep(kneeBand, 0.016, {
      section: { ngon: 6 },
      caps: "none",
      color: TAPE,
      group: "leg-cuffs",
      name: `kneeTape${side}`,
    });

    const ankleBand = b.surface(legTube).loop(ankle, { lift: 0.006 });
    b.sweep(ankleBand, 0.017, {
      section: { ngon: 6 },
      caps: "none",
      color: TAPE_LIGHT,
      group: "leg-cuffs",
      name: `ankleTape${side}`,
    });

    const kneeGuess = [knee.at.x, knee.at.y, knee.at.z + 0.12] as [
      number,
      number,
      number,
    ];
    const kneeHit = b.surface(legTube).nearest(kneeGuess);
    if (kneeHit) {
      addFrontSticker(
        b,
        kneeHit.at,
        [0.16, 0.105],
        HAZARD_TEXTURE,
        kneeHit.bone ?? knee,
        kneeHit.n.toArray() as [number, number, number],
      );
    }

    for (const t of [0.22, 0.36, 0.5, 0.64]) {
      const p = leg.at(t).at;
      putBox(b, [0.19, 0.019, 0.018], CORRUGATED_EDGE, [p.x, p.y, p.z + 0.105], leg.at(t).bone, {
        group: "leg-corrugation",
        name: `legRib${side}`,
      });
    }

    const footCenter = [s * 0.2, 0.075, 0.145] as [number, number, number];

    putBox(b, [0.23, 0.15, 0.34], LIGHT_BOARD, footCenter, ankle, {
      group: "boots",
      name: `boxBoot${side}`,
    });

    putBox(b, [0.24, 0.026, 0.345], RUBBER, [footCenter[0], 0.013, footCenter[2]], ankle, {
      group: "boots",
      name: `rubberSole${side}`,
    });

    putPlane(
      b,
      [0.18, 0.255],
      BOOT_TREAD_TEXTURE,
      [footCenter[0], 0.091, footCenter[2]],
      ankle,
      [0, 1, 0],
      [0, 0, 1],
      { name: `bootTopTread${side}`, group: "boots" },
    );

    addFrontSticker(
      b,
      [footCenter[0], 0.08, footCenter[2] + 0.176],
      [0.16, 0.085],
      HAZARD_TEXTURE,
      ankle,
    );

    for (const z of [0.035, 0.13, 0.225]) {
      putBox(b, [0.17, 0.017, 0.035], STEEL, [footCenter[0], 0.031, z], ankle, {
        group: "boot-tread",
        name: `bootTreadBlock${side}`,
      });
    }

    putRivet(b, [footCenter[0] - s * 0.08, 0.11, footCenter[2] + 0.183], ankle, RED_DARK, 0.009);
    putRivet(b, [footCenter[0] + s * 0.08, 0.11, footCenter[2] + 0.183], ankle, RED_DARK, 0.009);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Extra construction details: folded tabs, seams, exposed corrugation, and little robot hardware.

  for (const s of [1, -1]) {
    putBox(b, [0.025, 0.19, 0.035], EDGE_BOARD, [s * 0.35, 0.79, 0.01], hips, {
      group: "hip-box",
      name: `hipEdge${s > 0 ? "L" : "R"}`,
    });

    putBox(b, [0.025, 0.17, 0.035], TAPE, [s * 0.35, 0.94, 0.225], chest, {
      group: "torso-tape",
      name: `torsoSideTape${s > 0 ? "L" : "R"}`,
    });

    putRivet(b, [s * 0.34, 0.84, 0.245], chest, STEEL, 0.012);
    putRivet(b, [s * 0.34, 1.18, 0.245], chest, STEEL, 0.012);
  }

  // Two folded side tabs at the lower torso, like a real box that was cut with a blunt pair of scissors.
  const sideTabOutline: [number, number, "sharp"][] = [
    [0, -0.09, "sharp"],
    [0.12, -0.055, "sharp"],
    [0.15, 0.02, "sharp"],
    [0.1, 0.09, "sharp"],
    [0, 0.075, "sharp"],
  ];

  for (const s of [1, -1]) {
    b.extrude(sideTabOutline, {
      at: [s * 0.355, 0.79, -0.02],
      x: [0, 0, s],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.003,
      color: BOARD,
      bone: hips,
      group: "hip-flaps",
      name: `sideHipFlap${s > 0 ? "L" : "R"}`,
    });
  }

  // Corrugated front edge on the lower costume, built from a row of broad, intentionally blocky ribs.
  for (let i = -5; i <= 5; i++) {
    putBox(b, [0.034, 0.045, 0.017], CORRUGATED_EDGE, [i * 0.052, 0.69, 0.231], chest, {
      group: "lower-corrugation",
      name: "lowerBoxRib",
    });
  }

  // A few paper labels on the forearms and shoulders.
  for (const record of arms) {
    const { s, side, chain: arm } = record;
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];

    addFrontSticker(
      b,
      [s * 0.36, 1.17, 0.186],
      [0.12, 0.052],
      SERIAL_TEXTURE,
      shoulder,
    );

    addFrontSticker(
      b,
      [arm.at(0.62).at.x, arm.at(0.62).at.y, arm.at(0.62).at.z + 0.096],
      [0.1, 0.052],
      TAPE_MARK_TEXTURE,
      elbow,
    );

    putRivet(b, [s * 0.36, 1.16, 0.19], shoulder, BLUE, 0.008);
    putRivet(b, [s * 0.36, 1.185, 0.19], shoulder, YELLOW, 0.008);

    void side;
  }

  // Small bolts on the torso panel corners.
  for (const x of [-0.23, 0.23]) {
    for (const y of [0.91, 1.22]) {
      putBolt(b, [x, y, 0.257], [0, 0, 1], chest, STEEL, 0.012);
    }
  }

  // A pair of dangling cardboard "power cables" from the backpack, kept short and attached to the body.
  for (const s of [1, -1]) {
    const cablePath = catmull([
      [s * 0.205, 1.14, -0.34],
      [s * 0.24, 1.0, -0.39],
      [s * 0.22, 0.88, -0.36],
    ]);

    b.sweep(cablePath, 0.012, {
      color: BLUE_DARK,
      bone: chest,
      section: { ngon: 6 },
      caps: "round",
      group: "backpack-cables",
      name: `powerCable${s > 0 ? "L" : "R"}`,
    });

    putBox(b, [0.055, 0.055, 0.045], RED_DARK, [s * 0.22, 0.86, -0.36], chest, {
      group: "backpack-cables",
      name: `cablePlug${s > 0 ? "L" : "R"}`,
    });
  }

  // Keep a tiny visible collar under the helmet so the head does not appear to float above the torso.
  const collar = b.surface(torso).loop(neckBase, { lift: 0.008 });
  b.sweep(collar, 0.022, {
    color: TAPE_LIGHT,
    section: { ngon: 8 },
    caps: "none",
    group: "collar",
    name: "paperCollar",
  });

  b.along(collar, 8, (at: any) =>
    b.stick(
      new THREE.SphereGeometry(0.009, 6, 4),
      RED_DARK,
      at,
      { embed: 0.45, group: "collar", name: "collarRivet" },
    ),
  );

  // A final hand-cut warning triangle on the lower chest gives the silhouette a graphic focal point.
  b.extrude(
    [
      [0, 0.085, "sharp"],
      [0.085, -0.07, "sharp"],
      [-0.085, -0.07, "sharp"],
    ],
    {
      at: [0, 0.79, 0.253],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: YELLOW,
      bone: chest,
      group: "torso-emblem",
      name: "warningTriangle",
    },
  );

  putRivet(b, [0, 0.79, 0.261], chest, RED_DARK, 0.009);

  return b.root;
}
```