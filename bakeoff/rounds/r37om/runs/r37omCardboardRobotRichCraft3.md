```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  svg,
  paint,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A cheerful child wearing a handmade cardboard-box robot costume, with taped seams, corrugated panels, glowing eyes, antenna, control buttons, chunky limbs, and a hinged openable jaw.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const KRAFT = "#a97845";
  const KRAFT_LIGHT = "#c9955c";
  const KRAFT_DARK = "#704326";
  const EDGE = "#5b351f";
  const TAPE = "#d9b978";
  const TAPE_LIGHT = "#f0d99b";
  const INK = "#211820";
  const BLACK = "#17151b";
  const RUBBER = "#34323b";
  const RED = "#d94c39";
  const YELLOW = "#f1bf45";
  const BLUE = "#49a8c4";
  const GREEN = "#75bd65";
  const WHITE = "#fff0c4";
  const GLOW_BLUE = "#64e5ff";

  const cardboard = paint((p, n, s) => {
    const wave =
      0.5 +
      0.5 *
        Math.sin(
          p.x * 105 +
            p.y * 7 +
            p.z * 18 +
            Math.sin(p.z * 31 + p.y * 9) * 0.8,
        );
    const light = 0.88 + 0.12 * Math.max(0, n.y);
    const edgeDark = Math.abs(n.y) < 0.18 ? 0.82 : 1;
    const stripe = s[0] * 0.11;
    const r = 0.58 + wave * 0.08 + stripe;
    const g = 0.34 + wave * 0.055 + stripe * 0.55;
    const bl = 0.17 + wave * 0.035 + stripe * 0.3;
    return [
      Math.min(1, r * light * edgeDark),
      Math.min(1, g * light * edgeDark),
      Math.min(1, bl * light * edgeDark),
    ];
  });

  const darkCardboard = paint((p, n) => {
    const grain =
      0.92 +
      0.08 * Math.sin(p.x * 130 + p.z * 37 + Math.sin(p.y * 20));
    const top = 0.88 + Math.max(0, n.y) * 0.14;
    return [
      0.36 * grain * top,
      0.19 * grain * top,
      0.095 * grain * top,
    ];
  });

  const corrugation = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#ad7948"/>
      <path d="M0 8 Q16 2 32 8 T64 8 T96 8 T128 8
               M0 28 Q16 22 32 28 T64 28 T96 28 T128 28
               M0 48 Q16 42 32 48 T64 48 T96 48 T128 48
               M0 68 Q16 62 32 68 T64 68 T96 68 T128 68
               M0 88 Q16 82 32 88 T64 88 T96 88 T128 88
               M0 108 Q16 102 32 108 T64 108 T96 108 T128 108"
        fill="none" stroke="#d39c62" stroke-width="3" opacity=".6"/>
      <path d="M0 14 Q16 8 32 14 T64 14 T96 14 T128 14
               M0 54 Q16 48 32 54 T64 54 T96 54 T128 54
               M0 94 Q16 88 32 94 T64 94 T96 94 T128 94"
        fill="none" stroke="#754523" stroke-width="1.4" opacity=".52"/>
      <path d="M13 0v128 M47 0v128 M81 0v128 M115 0v128"
        stroke="#8c5b35" stroke-width="1" opacity=".22"/>
    </svg>`,
    { size: 256 },
  );

  const tapeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#dfc486"/>
      <path d="M0 7L64 2M0 19L64 14M0 32L64 27M0 45L64 40M0 58L64 53"
        stroke="#b28c52" stroke-width="2" opacity=".48"/>
      <path d="M7 0L16 64M34 0L43 64M57 0L64 48"
        stroke="#f5dfaa" stroke-width="1.4" opacity=".55"/>
    </svg>`,
    { size: 128 },
  );

  const faceTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 180">
      <rect width="256" height="180" rx="14" fill="#694127"/>
      <rect x="9" y="9" width="238" height="162" rx="9" fill="#87552f"
        stroke="#d6ad70" stroke-width="5"/>
      <path d="M17 39H239M17 141H239" stroke="#5a351f" stroke-width="3"/>
      <path d="M48 25V155M208 25V155" stroke="#a87542" stroke-width="2" opacity=".65"/>
      <rect x="29" y="42" width="78" height="58" rx="9" fill="#17151b"
        stroke="#dcb871" stroke-width="5"/>
      <rect x="149" y="42" width="78" height="58" rx="9" fill="#17151b"
        stroke="#dcb871" stroke-width="5"/>
      <circle cx="68" cy="70" r="18" fill="#64e5ff"/>
      <circle cx="188" cy="70" r="18" fill="#64e5ff"/>
      <circle cx="62" cy="64" r="6" fill="#efffff"/>
      <circle cx="182" cy="64" r="6" fill="#efffff"/>
      <path d="M99 128 Q128 148 157 128" fill="none" stroke="#211820" stroke-width="8"
        stroke-linecap="round"/>
      <path d="M108 132L108 140M124 137L124 146M140 137L140 146M156 132L156 140"
        stroke="#e5be78" stroke-width="4"/>
      <circle cx="24" cy="22" r="5" fill="#f0d99b"/>
      <circle cx="232" cy="22" r="5" fill="#f0d99b"/>
    </svg>`,
    { size: 512 },
  );

  const controlTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128">
      <rect width="256" height="128" rx="12" fill="#3b241b"/>
      <rect x="7" y="7" width="242" height="114" rx="9" fill="#a86d3e"
        stroke="#e0bd79" stroke-width="5"/>
      <circle cx="49" cy="63" r="22" fill="#d94c39" stroke="#351c18" stroke-width="6"/>
      <circle cx="104" cy="63" r="22" fill="#f1bf45" stroke="#45351a" stroke-width="6"/>
      <circle cx="159" cy="63" r="22" fill="#49a8c4" stroke="#183b48" stroke-width="6"/>
      <circle cx="214" cy="63" r="22" fill="#75bd65" stroke="#1e4321" stroke-width="6"/>
      <path d="M29 20H227" stroke="#f3d79c" stroke-width="3" opacity=".6"/>
      <path d="M29 108H227" stroke="#64391f" stroke-width="3" opacity=".7"/>
    </svg>`,
    { size: 256 },
  );

  const warningTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#292020"/>
      <path d="M64 12L118 110H10Z" fill="#efbd3d" stroke="#211820" stroke-width="7"/>
      <path d="M64 39V76" stroke="#211820" stroke-width="11" stroke-linecap="round"/>
      <circle cx="64" cy="94" r="7" fill="#211820"/>
    </svg>`,
    { size: 192 },
  );

  const antennaTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
      <path d="M32 128V4" stroke="#f1d99a" stroke-width="15"/>
      <path d="M32 128V4" stroke="#8b5a32" stroke-width="4" stroke-dasharray="7 8"/>
    </svg>`,
    { size: 128 },
  );

  // Skeleton first: a compact child-like rest pose.
  const hips = b.joint("hips", {
    at: [0, 0.82, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, 0],
      [0, 1.16, 0.01],
      [0, 1.48, 0],
    ]),
    {
      parent: hips,
      names: ["pelvis", "chest"],
      role: "spine",
    },
  );

  const neck = b.joint("neck", {
    parent: spine.tip,
    at: [0, 1.57, 0],
    dir: [0, 1, 0],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.86, 0.01],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.72, 0.17],
    dir: [0, 0.15, 1],
    role: "jaw",
    group: "head",
  });

  const armL = b.chain(
    "armL",
    [
      [0.34, 1.45, 0],
      [0.59, 1.38, 0.01],
      [0.82, 1.23, 0.03],
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
      [-0.34, 1.45, 0],
      [-0.59, 1.38, 0.01],
      [-0.82, 1.23, 0.03],
    ],
    {
      parent: spine.tip,
      names: ["shoulderR", "elbowR", "handR"],
      role: "arm",
    },
  );

  const legL = b.chain(
    "legL",
    [
      [0.19, 0.78, 0],
      [0.2, 0.48, 0.03],
      [0.2, 0.18, 0.08],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.2, 0, 0.1],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.19, 0.78, 0],
      [-0.2, 0.48, 0.03],
      [-0.2, 0.18, 0.08],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.2, 0, 0.1],
    },
  );

  const antenna = b.joint("antenna", {
    parent: head,
    at: [0, 2.12, -0.02],
    dir: [0, 1, 0],
    role: "fan",
  });

  const box = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: any = cardboard,
    options: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...options,
    });

  const roundedBox = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: any,
    options: any = {},
  ) =>
    b.part(
      new THREE.BoxGeometry(size[0], size[1], size[2], 1, 1, 1),
      color,
      {
        at,
        ...options,
      },
    );

  const cylinder = (
    radius: number,
    height: number,
    at: THREE.Vector3 | [number, number, number],
    color: any,
    options: any = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius * 0.94, height, 8, 1),
      color,
      { at, ...options },
    );

  const tapeStrip = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    options: any = {},
  ) => box(size, at, TAPE, { texture: tapeTexture, ...options });

  const button = (
    at: [number, number, number],
    color: string,
    radius = 0.045,
    depth = 0.025,
  ) => {
    const p = cylinder(radius, depth, at, color, {
      dir: [0, 0, 1],
      rotation: [90, 0, 0],
      flat: true,
    });
    cylinder(radius * 0.35, depth + 0.008, [at[0], at[1], at[2] + 0.012], INK, {
      dir: [0, 0, 1],
      rotation: [90, 0, 0],
      flat: true,
    });
    return p;
  };

  // Feet and legs: oversized cardboard boots make the costume read as a child.
  b.sweep(legL, (t) => 0.105 - t * 0.025, {
    color: cardboard,
    section: "box",
    sides: 6,
    caps: "round",
    skin: "smooth",
    group: "limbs",
  });
  b.sweep(legR, (t) => 0.105 - t * 0.025, {
    color: cardboard,
    section: "box",
    sides: 6,
    caps: "round",
    skin: "smooth",
    group: "limbs",
  });

  box([0.29, 0.15, 0.39], [0.2, 0.09, 0.13], RUBBER, {
    bone: legL.tip,
    texture: corrugation,
    name: "bootL",
  });
  box([0.29, 0.15, 0.39], [-0.2, 0.09, 0.13], RUBBER, {
    bone: legR.tip,
    texture: corrugation,
    name: "bootR",
  });
  tapeStrip([0.3, 0.035, 0.4], [0.2, 0.16, 0.13], { bone: legL.tip });
  tapeStrip([0.3, 0.035, 0.4], [-0.2, 0.16, 0.13], { bone: legR.tip });

  // Main costume torso, a large parcel-like box with a proud front panel.
  box([0.72, 0.68, 0.52], [0, 1.17, 0], cardboard, {
    bone: spine.joints[0],
    texture: corrugation,
    name: "torsoBox",
  });
  box([0.58, 0.36, 0.035], [0, 1.18, 0.282], KRAFT_DARK, {
    bone: spine.joints[0],
    texture: faceTexture,
    name: "chestControlPanel",
  });
  box([0.5, 0.04, 0.04], [0, 1.52, 0.285], EDGE, {
    bone: spine.joints[0],
    name: "chestTopSeam",
  });
  box([0.5, 0.04, 0.04], [0, 0.84, 0.285], EDGE, {
    bone: spine.joints[0],
    name: "chestBottomSeam",
  });

  // Crossing packing tape on torso.
  tapeStrip([0.075, 0.7, 0.035], [0, 1.17, 0.287], {
    bone: spine.joints[0],
    texture: tapeTexture,
    name: "verticalTorsoTape",
  });
  tapeStrip([0.74, 0.075, 0.035], [0, 1.17, 0.29], {
    bone: spine.joints[0],
    texture: tapeTexture,
    name: "horizontalTorsoTape",
  });

  // Chest control buttons and tiny status lights.
  button([0.205, 1.18, 0.322], RED, 0.045);
  button([0.07, 1.18, 0.322], YELLOW, 0.045);
  button([-0.07, 1.18, 0.322], BLUE, 0.045);
  button([-0.205, 1.18, 0.322], GREEN, 0.045);
  cylinder(0.016, 0.018, [0.22, 1.36, 0.325], GLOW_BLUE, {
    dir: [0, 0, 1],
    rotation: [90, 0, 0],
  });
  cylinder(0.016, 0.018, [0.18, 1.36, 0.325], RED, {
    dir: [0, 0, 1],
    rotation: [90, 0, 0],
  });
  cylinder(0.016, 0.018, [-0.18, 1.36, 0.325], YELLOW, {
    dir: [0, 0, 1],
    rotation: [90, 0, 0],
  });

  // A little warning placard on the lower torso.
  box([0.15, 0.15, 0.018], [0, 0.96, 0.31], WHITE, {
    bone: spine.joints[0],
    texture: warningTexture,
    dir: [0, 0, 1],
    axis: "z",
    name: "warningBadge",
  });

  // Shoulder collars and arms.
  cylinder(0.17, 0.15, [0.39, 1.44, 0], cardboard, {
    bone: spine.tip,
    dir: [1, 0, 0],
    texture: corrugation,
    name: "shoulderL",
  });
  cylinder(0.17, 0.15, [-0.39, 1.44, 0], cardboard, {
    bone: spine.tip,
    dir: [-1, 0, 0],
    texture: corrugation,
    name: "shoulderR",
  });

  b.sweep(armL, (t) => 0.105 - t * 0.02, {
    color: cardboard,
    section: "box",
    caps: "round",
    skin: "smooth",
    group: "limbs",
  });
  b.sweep(armR, (t) => 0.105 - t * 0.02, {
    color: cardboard,
    section: "box",
    caps: "round",
    skin: "smooth",
    group: "limbs",
  });

  // Elbow tape bands.
  tapeStrip([0.22, 0.18, 0.035], [0.59, 1.38, 0.11], {
    bone: armL.joints[1],
    rotation: [0, 0, 8],
  });
  tapeStrip([0.22, 0.18, 0.035], [-0.59, 1.38, 0.11], {
    bone: armR.joints[1],
    rotation: [0, 0, -8],
  });

  // Square mitts with finger-score lines.
  box([0.23, 0.22, 0.23], [0.84, 1.21, 0.04], cardboard, {
    bone: armL.tip,
    texture: corrugation,
    name: "mittenL",
  });
  box([0.23, 0.22, 0.23], [-0.84, 1.21, 0.04], cardboard, {
    bone: armR.tip,
    texture: corrugation,
    name: "mittenR",
  });
  for (const side of [1, -1]) {
    box([0.018, 0.1, 0.015], [side * 0.79, 1.2, 0.164], EDGE, {
      bone: side > 0 ? armL.tip : armR.tip,
    });
    box([0.018, 0.1, 0.015], [side * 0.84, 1.2, 0.164], EDGE, {
      bone: side > 0 ? armL.tip : armR.tip,
    });
    box([0.018, 0.1, 0.015], [side * 0.89, 1.2, 0.164], EDGE, {
      bone: side > 0 ? armL.tip : armR.tip,
    });
  }

  // Neck gasket and head box.
  cylinder(0.18, 0.12, [0, 1.61, 0], RUBBER, {
    bone: neck,
    name: "neckGasket",
  });
  box([0.55, 0.48, 0.43], [0, 1.88, 0.02], cardboard, {
    bone: head,
    texture: corrugation,
    name: "helmetBox",
  });

  // Helmet flaps and crown tape.
  tapeStrip([0.08, 0.48, 0.035], [0, 1.88, 0.247], {
    bone: head,
    texture: tapeTexture,
    name: "helmetFrontTape",
  });
  tapeStrip([0.58, 0.07, 0.035], [0, 2.10, 0.247], {
    bone: head,
    texture: tapeTexture,
    name: "helmetCrownTape",
  });
  box([0.62, 0.07, 0.48], [0, 1.64, 0.02], cardboard, {
    bone: head,
    texture: corrugation,
    name: "helmetChinFlap",
  });

  // Front robot face panel, mounted just ahead of the helmet.
  box([0.47, 0.34, 0.025], [0, 1.91, 0.245], WHITE, {
    bone: head,
    texture: faceTexture,
    dir: [0, 0, 1],
    axis: "z",
    name: "robotFacePlate",
  });

  // Raised eye rims make the face readable even without the decal.
  for (const side of [1, -1]) {
    cylinder(0.078, 0.018, [side * 0.145, 1.98, 0.274], INK, {
      bone: head,
      dir: [0, 0, 1],
      rotation: [90, 0, 0],
      name: side > 0 ? "eyeRimL" : "eyeRimR",
    });
    cylinder(0.052, 0.021, [side * 0.145, 1.98, 0.288], GLOW_BLUE, {
      bone: head,
      dir: [0, 0, 1],
      rotation: [90, 0, 0],
      name: side > 0 ? "eyeGlowL" : "eyeGlowR",
    });
    cylinder(0.017, 0.024, [side * 0.145, 1.98, 0.305], BLACK, {
      bone: head,
      dir: [0, 0, 1],
      rotation: [90, 0, 0],
      name: side > 0 ? "pupilL" : "pupilR",
    });
    cylinder(0.012, 0.026, [side * 0.128, 2.01, 0.316], WHITE, {
      bone: head,
      dir: [0, 0, 1],
      rotation: [90, 0, 0],
    });
  }

  // Hinged lower jaw, deliberately separate from the helmet.
  box([0.38, 0.15, 0.28], [0, 1.72, 0.22], cardboard, {
    bone: jaw,
    texture: corrugation,
    name: "lowerJawBox",
  });
  box([0.3, 0.035, 0.035], [0, 1.78, 0.37], EDGE, {
    bone: jaw,
    name: "mouthEdge",
  });
  for (const side of [1, -1]) {
    box([0.035, 0.09, 0.025], [side * 0.13, 1.76, 0.38], TAPE, {
      bone: jaw,
      texture: tapeTexture,
    });
  }

  // Side ears / cardboard cheek guards.
  for (const side of [1, -1]) {
    box([0.08, 0.25, 0.28], [side * 0.31, 1.88, 0.01], cardboard, {
      bone: head,
      texture: corrugation,
      name: side > 0 ? "earFlapL" : "earFlapR",
    });
    cylinder(0.045, 0.035, [side * 0.36, 1.98, 0.04], RED, {
      bone: head,
      dir: [side, 0, 0],
      rotation: [0, 0, 90],
    });
  }

  // Antenna: a taped cardboard stalk and a bright ping-pong-like cap.
  box([0.07, 0.25, 0.07], [0, 2.25, -0.02], KRAFT_LIGHT, {
    bone: antenna,
    texture: antennaTexture,
    name: "antennaStem",
  });
  cylinder(0.075, 0.13, [0, 2.39, -0.02], RED, {
    bone: antenna,
    name: "antennaBeacon",
  });
  cylinder(0.043, 0.14, [0, 2.46, -0.02], YELLOW, {
    bone: antenna,
    name: "antennaTip",
  });

  // Back-mounted little exhaust fins, kept simple but silhouette-rich.
  for (const side of [1, -1]) {
    b.part(
      new THREE.ConeGeometry(0.075, 0.2, 5),
      darkCardboard,
      {
        bone: spine.joints[0],
        at: [side * 0.25, 1.26, -0.31],
        dir: [0, 0, -1],
        name: side > 0 ? "backExhaustL" : "backExhaustR",
      },
    );
    cylinder(0.038, 0.08, [side * 0.25, 1.08, -0.34], RUBBER, {
      bone: spine.joints[0],
      dir: [0, -1, 0],
    });
  }

  // A few chunky exposed "rivets" at the costume corners.
  const rivets: [number, number, number][] = [
    [0.31, 1.47, 0.285],
    [-0.31, 1.47, 0.285],
    [0.31, 0.9, 0.285],
    [-0.31, 0.9, 0.285],
    [0.26, 2.08, 0.27],
    [-0.26, 2.08, 0.27],
  ];
  for (const p of rivets) {
    cylinder(0.018, 0.018, p, TAPE_LIGHT, {
      dir: [0, 0, 1],
      rotation: [90, 0, 0],
      flat: true,
    });
  }

  // A little open cardboard "instruction label" on the side of the torso.
  box([0.018, 0.25, 0.22], [0.372, 1.18, -0.02], WHITE, {
    bone: spine.joints[0],
    texture: warningTexture,
    dir: [1, 0, 0],
    axis: "z",
    name: "sideWarningLabel",
  });

  // Fold lines and corner reinforcements on the costume.
  for (const side of [1, -1]) {
    box([0.018, 0.62, 0.018], [side * 0.365, 1.17, 0], EDGE, {
      bone: spine.joints[0],
      name: side > 0 ? "torsoSideCreaseL" : "torsoSideCreaseR",
    });
  }
  box([0.72, 0.018, 0.018], [0, 0.83, 0], EDGE, {
    bone: hips,
    name: "pelvisFold",
  });

  // Pose the jaw slightly open so the hinge and friendly grin are visible.
  b.pose(jaw, { axis: [1, 0, 0], deg: -12 });

  // Add a small number of loose-looking cardboard tabs as flat geometric accents.
  const tabOutline: [number, number, "sharp"][] = [
    [-0.07, 0],
    [0.07, 0],
    [0.055, 0.1],
    [0, 0.14, "sharp"],
    [-0.055, 0.1],
  ];
  b.extrude(tabOutline, {
    at: [0.28, 2.08, 0.28],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.018,
    color: TAPE_LIGHT,
    bone: head,
    name: "helmetFoldTab",
  });

  // A tiny hanging cable from the chest to the right hip, made from a curved tube.
  b.sweep(
    catmull([
      [0.25, 1.04, 0.31],
      [0.32, 0.96, 0.33],
      [0.26, 0.88, 0.32],
    ]),
    0.012,
    {
      color: RUBBER,
      caps: "round",
      bone: spine.joints[0],
      name: "chestCable",
    },
  );

  return b.root;
}
```