import * as THREE from "three";
import {
  createBuilder,
  catmull,
  grain,
  mottle,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A charming child in a handmade cardboard robot costume, with taped box armor, a friendly glowing face, chunky limbs, antenna, chest controls, and corrugated craft details.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = grain("#b9783d", "#9c572e", {
    size: 0.028,
    axis: "y",
    seed: 12,
  });
  const CARDBOARD_LIGHT = grain("#d59655", "#b96831", {
    size: 0.035,
    axis: "z",
    seed: 5,
  });
  const EDGE = "#6f391e";
  const TAPE = "#d8a15e";
  const TAPE_LIGHT = "#f0c47e";
  const DARK = "#241b20";
  const RUBBER = "#332c35";
  const METAL = "#777d78";
  const METAL_DARK = "#41484a";
  const RED = "#c94d35";
  const BLUE = "#438ca0";
  const GREEN = "#71aa58";
  const YELLOW = "#e4b548";
  const SKIN = "#e8a77c";
  const SHIRT = "#35658a";
  const SHORTS = "#354455";
  const SOLE = "#201d24";

  const torsoPaint = mottle(CARDBOARD, CARDBOARD_LIGHT, {
    size: 0.13,
    contrast: 1.35,
    seed: 22,
  });

  // -------------------------------------------------------------------------
  // Skeleton first: a compact, neutral child pose with broad separated limbs.
  // -------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.79, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.79, 0],
      [0, 1.08, 0],
      [0, 1.38, 0],
    ]),
    {
      parent: hips,
      names: ["waist", "chest", "shoulder"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
    at: [0, 1.62, 0.035],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.53, 0.205],
    dir: [0, -0.02, 1],
    role: "jaw",
    group: "face",
  });

  const armL = b.chain(
    "armL",
    [
      [0.31, 1.28, 0],
      [0.51, 1.18, 0.01],
      [0.66, 0.94, 0.04],
      [0.68, 0.77, 0.12],
    ],
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
      contact: [0.68, 0.77, 0.12],
    },
  );

  const armR = b.chain(
    "armR",
    [
      [-0.31, 1.28, 0],
      [-0.51, 1.18, 0.01],
      [-0.66, 0.94, 0.04],
      [-0.68, 0.77, 0.12],
    ],
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
      contact: [-0.68, 0.77, 0.12],
    },
  );

  const legL = b.chain(
    "legL",
    [
      [0.16, 0.78, 0],
      [0.17, 0.51, 0.015],
      [0.18, 0.23, 0.045],
      [0.18, 0.10, 0.14],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.18, 0, 0.18],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.16, 0.78, 0],
      [-0.17, 0.51, 0.015],
      [-0.18, 0.23, 0.045],
      [-0.18, 0.10, 0.14],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.18, 0, 0.18],
    },
  );

  const antenna = b.chain(
    "antenna",
    [
      [0, 1.83, -0.01],
      [0, 1.99, -0.01],
      [0, 2.10, -0.01],
    ],
    {
      parent: head,
      names: ["antennaBase", "antennaStem", "antennaTip"],
      role: "fan",
    },
  );

  // -------------------------------------------------------------------------
  // Handmade texture drawings.
  // -------------------------------------------------------------------------

  const eyeTexture = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 62 Q50 12 92 62 Q50 108 8 62Z" fill="#17151c" stroke="#08070a" stroke-width="5"/>
      <ellipse cx="51" cy="63" rx="25" ry="34" fill="#58b7c1"/>
      <ellipse cx="51" cy="63" rx="13" ry="27" fill="#121923"/>
      <ellipse cx="42" cy="48" rx="9" ry="12" fill="#fff7d7"/>
      <circle cx="60" cy="78" r="4" fill="#fff7d7"/>
      <path d="M11 45 Q40 12 86 38" fill="none" stroke="#25151b" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const dialTexture = svg(
    `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="72" fill="#e9d9a8" stroke="#402b20" stroke-width="7"/>
      <path d="M26 92 A58 58 0 0 1 135 48" fill="none" stroke="#5f3924" stroke-width="5" stroke-dasharray="3 8"/>
      <path d="M80 80 L112 43" stroke="#c94435" stroke-width="8" stroke-linecap="round"/>
      <circle cx="80" cy="80" r="11" fill="#403238"/>
      <text x="80" y="126" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="#38251d">POWER</text>
    </svg>`,
    { size: 256 },
  );

  const warningTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 7 L94 88 Q97 94 89 94 H11 Q3 94 6 88Z" fill="#e4b548" stroke="#42251b" stroke-width="6"/>
      <path d="M50 29 V61" stroke="#42251b" stroke-width="10" stroke-linecap="round"/>
      <circle cx="50" cy="77" r="6" fill="#42251b"/>
    </svg>`,
    { size: 192 },
  );

  const nameBadge = svg(
    `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="234" height="66" rx="10" fill="#f0c47e" stroke="#55321f" stroke-width="6"/>
      <text x="120" y="49" text-anchor="middle" font-family="sans-serif" font-size="31" font-weight="bold" fill="#55321f">ROBO-KID</text>
    </svg>`,
    { size: 256 },
  );

  const cardboardStamp = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 12H69V68H11Z" fill="none" stroke="#7b4326" stroke-width="5"/>
      <path d="M18 54 L31 27 L42 45 L52 32 L64 54" fill="none" stroke="#7b4326" stroke-width="5"/>
      <circle cx="25" cy="23" r="4" fill="#7b4326"/>
    </svg>`,
    { size: 128 },
  );

  // -------------------------------------------------------------------------
  // Reusable primitive helpers.
  // -------------------------------------------------------------------------

  const box = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: any,
    bone?: any,
    extra: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      flat: true,
      ...extra,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: THREE.Vector3 | [number, number, number],
    color: any,
    bone?: any,
    segments = 8,
    extra: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone,
      flat: true,
      ...extra,
    });

  const tapeStrip = (
    at: THREE.Vector3 | [number, number, number],
    size: [number, number, number],
    bone?: any,
    rotation?: [number, number, number],
  ) =>
    box(size, at, TAPE_LIGHT, bone, {
      rotation,
      name: "paper-tape",
    });

  // -------------------------------------------------------------------------
  // Torso box and lower cardboard armor.
  // -------------------------------------------------------------------------

  const torso = box([0.62, 0.68, 0.38], [0, 1.10, 0.015], torsoPaint, spine.joints[1], {
    name: "large-cardboard-torso",
    scale: [1, 1, 1],
  });

  // Strong folded edges and packing-tape seams.
  box([0.025, 0.70, 0.018], [0.31, 1.10, 0.212], EDGE, spine.joints[1], {
    name: "torso-right-edge",
  });
  box([0.025, 0.70, 0.018], [-0.31, 1.10, 0.212], EDGE, spine.joints[1], {
    name: "torso-left-edge",
  });
  tapeStrip([0, 1.10, 0.214], [0.07, 0.70, 0.012], spine.joints[1]);
  tapeStrip([0, 1.445, 0.214], [0.62, 0.055, 0.012], spine.joints[1]);
  tapeStrip([0, 0.755, 0.214], [0.62, 0.055, 0.012], spine.joints[1]);

  // Bottom hip carton, visible beneath the torso.
  box([0.48, 0.22, 0.32], [0, 0.76, 0.01], CARDBOARD_LIGHT, hips, {
    name: "hip-carton",
  });
  tapeStrip([0, 0.76, 0.176], [0.50, 0.035, 0.012], hips);
  box([0.02, 0.20, 0.018], [0.24, 0.76, 0.18], EDGE, hips);
  box([0.02, 0.20, 0.018], [-0.24, 0.76, 0.18], EDGE, hips);

  // -------------------------------------------------------------------------
  // Chest control panel, dial, switches, badge, and rivets.
  // -------------------------------------------------------------------------

  box([0.39, 0.28, 0.026], [0, 1.16, 0.218], "#5b382b", spine.joints[1], {
    name: "recessed-chest-panel",
  });
  box([0.35, 0.24, 0.012], [0, 1.16, 0.235], "#243039", spine.joints[1], {
    name: "dark-control-panel",
  });

  const dial = b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.018, 16), TAPE_LIGHT, {
    bone: spine.joints[1],
    at: [0.115, 1.20, 0.251],
    dir: [0, 0, 1],
    name: "power-dial",
  });
  b.part(new THREE.CircleGeometry(0.069, 16), "#ffffff", {
    bone: spine.joints[1],
    at: [0.115, 1.20, 0.262],
    dir: [0, 0, 1],
    axis: "z",
    texture: dialTexture,
    name: "power-dial-face",
  });

  for (let i = 0; i < 3; i++) {
    cylinder(0.018, 0.04, [-0.11 + i * 0.055, 1.20, 0.255], i === 0 ? RED : i === 1 ? GREEN : BLUE, spine.joints[1], 8, {
      dir: [0, 0, 1],
      name: `switch-${i}`,
    });
  }

  b.part(new THREE.PlaneGeometry(0.27, 0.078), "#ffffff", {
    bone: spine.joints[1],
    at: [0, 0.99, 0.225],
    dir: [0, 0, 1],
    axis: "z",
    texture: nameBadge,
    name: "name-badge",
  });

  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    bone: spine.joints[1],
    at: [0.245, 1.33, 0.229],
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
    name: "warning-sticker",
  });

  for (const x of [-0.255, 0.255]) {
    for (const y of [0.86, 1.37]) {
      b.part(new THREE.SphereGeometry(0.018, 8, 5), METAL, {
        bone: spine.joints[1],
        at: [x, y, 0.226],
        name: "torso-rivet",
      });
    }
  }

  // Little cardboard stamp on the back/side-facing left panel.
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    bone: spine.joints[1],
    at: [0.319, 1.17, -0.07],
    dir: [1, 0, 0],
    axis: "z",
    texture: cardboardStamp,
    name: "shipping-stamp",
  });

  // -------------------------------------------------------------------------
  // Head box, folded crown flaps, face, jaw, ears, and antenna.
  // -------------------------------------------------------------------------

  const helmet = box([0.47, 0.43, 0.37], [0, 1.68, 0.04], CARDBOARD_LIGHT, head, {
    name: "helmet-box",
  });

  box([0.02, 0.43, 0.018], [0.235, 1.68, 0.235], EDGE, head);
  box([0.02, 0.43, 0.018], [-0.235, 1.68, 0.235], EDGE, head);
  tapeStrip([0, 1.68, 0.236], [0.055, 0.43, 0.013], head);
  tapeStrip([0, 1.895, 0.04], [0.47, 0.045, 0.28], head);

  // Crown flaps laid out like folded cardboard.
  b.extrude(
    [
      [-0.21, 0],
      [0.21, 0],
      [0.16, 0.12],
      [0.04, 0.18],
      [-0.12, 0.14],
    ],
    {
      at: [0, 1.90, -0.12],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.018,
      bevel: 0.004,
      color: CARDBOARD,
      bone: head,
      name: "folded-top-flap",
    },
  );

  // Eye panels: oversized and friendly.
  for (const s of [1, -1]) {
    const eye = b.part(new THREE.PlaneGeometry(0.13, 0.16), "#ffffff", {
      bone: head,
      at: [s * 0.105, 1.70, 0.238],
      dir: [0, 0, 1],
      axis: "z",
      texture: eyeTexture,
      name: s > 0 ? "left-glowing-eye" : "right-glowing-eye",
    });
    glow(eye, 1.25);

    box([0.145, 0.025, 0.018], [s * 0.105, 1.80, 0.246], DARK, head, {
      name: "cardboard-eyebrow",
    });

    // Ear-like side flaps, intentionally asymmetric like a kid's costume.
    b.extrude(
      [
        [0, 0],
        [0.10, 0.02],
        [0.13, 0.16],
        [0.045, 0.22],
        [0, 0.12],
      ],
      {
        at: [s * 0.235, 1.61, 0.04],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        bevel: 0.004,
        color: CARDBOARD,
        bone: head,
        name: "side-ear-flap",
      },
    );
  }

  // Open mouth: separate upper lip and hinged lower jaw.
  box([0.25, 0.075, 0.028], [0, 1.585, 0.247], DARK, head, {
    name: "upper-mouth-slot",
  });
  box([0.24, 0.09, 0.08], [0, 1.535, 0.245], CARDBOARD, jaw, {
    name: "hinged-lower-jaw",
  });
  for (const x of [-0.075, 0, 0.075]) {
    box([0.018, 0.055, 0.012], [x, 1.55, 0.29], TAPE_LIGHT, jaw, {
      name: "mouth-grille",
    });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: -9 });

  // Antenna: cardboard tube, metal cap, and bright red beacon.
  b.sweep(antenna, [0.034, 0.022], {
    color: CARDBOARD,
    section: "box",
    sides: 6,
    name: "antenna-stem",
  });
  cylinder(0.052, 0.045, [0, 2.13, -0.01], METAL_DARK, antenna.tip, 8, {
    name: "antenna-cap",
  });
  const beacon = b.part(new THREE.SphereGeometry(0.047, 10, 7), RED, {
    bone: antenna.joints[antenna.joints.length - 1],
    at: [0, 2.17, -0.01],
    name: "red-beacon",
  });
  glow(beacon, 1.8);

  // -------------------------------------------------------------------------
  // Arms: cardboard sleeves, exposed elbow joints, mitten hands, fingers.
  // -------------------------------------------------------------------------

  for (const [side, arm] of [
    [1, armL],
    [-1, armR],
  ] as const) {
    b.sweep(arm, [0.115, 0.085], {
      bone: arm,
      color: CARDBOARD,
      section: "box",
      sides: 6,
      name: side > 0 ? "left-cardboard-arm" : "right-cardboard-arm",
    });

    cylinder(0.105, 0.035, arm.joints[1].at, METAL_DARK, arm.joints[1], 8, {
      name: "elbow-cap",
    });

    box([0.19, 0.17, 0.15], arm.joints[arm.joints.length - 1].at, CARDBOARD_LIGHT, arm.joints[arm.joints.length - 1], {
      name: "square-mitten",
    });
    tapeStrip(
      [arm.joints[arm.joints.length - 1].at.x, arm.joints[arm.joints.length - 1].at.y + 0.04, arm.joints[arm.joints.length - 1].at.z + 0.078],
      [0.19, 0.035, 0.012],
      arm.tip,
    );

    // Three chunky cardboard finger tabs separated by dark gaps.
    for (let i = 0; i < 3; i++) {
      box(
        [0.045, 0.095, 0.075],
        [
          arm.joints[arm.joints.length - 1].at.x + side * (-0.055 + i * 0.055),
          arm.joints[arm.joints.length - 1].at.y - 0.13,
          arm.joints[arm.joints.length - 1].at.z + 0.025,
        ],
        CARDBOARD,
        arm.joints[arm.joints.length - 1],
        { name: "mitten-finger-tab" },
      );
    }

    // Shoulder cap and a folded tape patch.
    b.part(new THREE.SphereGeometry(0.14, 8, 5), CARDBOARD_LIGHT, {
      bone: arm.joints[0],
      at: arm.joints[0].at,
      scale: [1, 0.72, 0.8],
      name: "shoulder-cap",
    });
    tapeStrip(
      [arm.joints[0].at.x, arm.joints[0].at.y, arm.joints[0].at.z + 0.11],
      [0.16, 0.045, 0.014],
      arm.joints[0],
      [0, 0, side * 12],
    );
  }

  // -------------------------------------------------------------------------
  // Legs: visible blue shorts, cardboard shin cartons, shoes with soles.
  // -------------------------------------------------------------------------

  for (const [side, leg] of [
    [1, legL],
    [-1, legR],
  ] as const) {
    box([0.19, 0.25, 0.24], leg.joints[0].at, SHORTS, leg.joints[0], {
      name: "shorts-leg",
    });

    b.sweep(leg, [0.105, 0.075], {
      from: 0.18,
      color: CARDBOARD,
      section: "box",
      sides: 6,
      name: side > 0 ? "left-cardboard-leg" : "right-cardboard-leg",
    });

    cylinder(0.097, 0.035, leg.joints[1].at, METAL_DARK, leg.joints[1], 8, {
      name: "knee-cap",
    });

    box([0.20, 0.14, 0.31], leg.joints[leg.joints.length - 1].at, CARDBOARD_LIGHT, leg.joints[leg.joints.length - 1], {
      name: "boxy-shoe-upper",
    });
    box(
      [0.215, 0.045, 0.33],
      [leg.joints[leg.joints.length - 1].at.x, 0.025, 0.17],
      SOLE,
      leg.joints[leg.joints.length - 1],
      {
      name: "rubber-shoe-sole",
    });
    tapeStrip(
      [leg.joints[leg.joints.length - 1].at.x, 0.105, 0.323],
      [0.20, 0.035, 0.012],
      leg.joints[leg.joints.length - 1],
    );

    // Lace / panel marks.
    for (let i = 0; i < 3; i++) {
      box(
        [0.11, 0.012, 0.018],
        [leg.joints[leg.joints.length - 1].at.x, 0.08 + i * 0.035, 0.328],
        TAPE,
        leg.joints[leg.joints.length - 1],
        { name: "shoe-lace-mark" },
      );
    }
  }

  // -------------------------------------------------------------------------
  // Corrugated exposed seams, rivets, and tiny craft imperfections.
  // -------------------------------------------------------------------------

  for (let i = 0; i < 7; i++) {
    const z = -0.16 + i * 0.052;
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.52, 5), EDGE, {
      bone: spine.joints[1],
      at: [0, 1.10, z],
      dir: [1, 0, 0],
      name: "corrugation-rib",
    });
  }

  // A few oversized paper fasteners make the silhouette playful.
  const rivetPoints: [number, number, number][] = [
    [0.28, 1.40, 0.23],
    [-0.28, 1.40, 0.23],
    [0.28, 0.83, 0.23],
    [-0.28, 0.83, 0.23],
    [0.23, 1.84, 0.23],
    [-0.23, 1.84, 0.23],
  ];
  for (const p of rivetPoints) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.014, 8), TAPE_LIGHT, {
      bone: p[1] > 1.5 ? head : spine.joints[1],
      at: p,
      dir: [0, 0, 1],
      name: "paper-fastener",
    });
  }

  // Loose hanging tape tail on the right side, kept above the floor.
  b.extrude(
    [
      [0, 0],
      [0.07, 0],
      [0.06, 0.19],
      [0.025, 0.25],
      [0, 0.17],
    ],
    {
      at: [0.325, 1.35, 0.02],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.01,
      bevel: 0.003,
      color: TAPE,
      bone: spine.joints[1],
      name: "loose-tape-tab",
    },
  );

  // Ensure the returned object is the builder root, including its rig metadata.
  return b.root;
}
