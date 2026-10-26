import * as THREE from "three";
import {
  catmull,
  createBuilder,
  grain,
  limb,
  mottle,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "cardboard-box-robot-kid",
  description:
    "A cheerful child wearing a chunky handmade cardboard robot costume, with a box torso, helmet, control panel, taped seams, rivets, glowing screen, and a visible expressive face.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = grain(
    mottle("#b8753e", "#d69a59", { size: 0.18, contrast: 1.15, seed: 11 }),
    "#80502d",
    { size: 0.045, axis: "z", seed: 5 },
  );
  const CARDBOARD_LIGHT = grain(
    mottle("#d49655", "#e6b976", { size: 0.15, contrast: 1.1, seed: 14 }),
    "#9b6235",
    { size: 0.05, axis: "z", seed: 8 },
  );
  const CARDBOARD_DARK = mottle("#714327", "#a86737", {
    size: 0.11,
    contrast: 1.25,
    seed: 22,
  });
  const EDGE = "#5a321f";
  const TAPE = grain("#e7c17b", "#bb8143", {
    size: 0.025,
    axis: "x",
    seed: 17,
  });
  const TAPE_DARK = "#9b5d31";
  const INK = "#2b211b";
  const RUBBER = "#292b2c";
  const METAL = "#7f8784";
  const METAL_DARK = "#48504f";
  const RED = "#c84b32";
  const YELLOW = "#eab74e";
  const BLUE = "#3d87a2";
  const SKIN = mottle("#e7a17d", "#f4c09a", {
    size: 0.12,
    contrast: 1.25,
    seed: 31,
  });
  const HAIR = grain("#5b3528", "#9a5e39", {
    size: 0.035,
    axis: "y",
    seed: 42,
  });

  const CORRUGATION = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#c4874d"/>
      <path d="M-10 14 Q18 2 45 14 T100 14 T150 14
               M-10 34 Q18 22 45 34 T100 34 T150 34
               M-10 54 Q18 42 45 54 T100 54 T150 54
               M-10 74 Q18 62 45 74 T100 74 T150 74
               M-10 94 Q18 82 45 94 T100 94 T150 94
               M-10 114 Q18 102 45 114 T100 114 T150 114"
        fill="none" stroke="#9c6037" stroke-width="2.2" opacity=".7"/>
      <path d="M0 0L128 128M-32 0L128 160M64-32L160 64"
        stroke="#e4b06e" stroke-width="1" opacity=".24"/>
      <circle cx="18" cy="83" r="2" fill="#74452b" opacity=".28"/>
      <circle cx="91" cy="28" r="1.7" fill="#74452b" opacity=".28"/>
      <circle cx="114" cy="102" r="2" fill="#74452b" opacity=".28"/>
    </svg>`,
    { size: 256 },
  );

  const WARNING = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
      <rect width="128" height="64" rx="5" fill="#e6b443" stroke="#34251b" stroke-width="5"/>
      <path d="M-8 62L24 0h18L10 64M48 64L80 0h18L66 64M105 64l31-61"
        stroke="#34251b" stroke-width="12"/>
      <path d="M0 51h128" stroke="#fff0a7" stroke-width="3" opacity=".65"/>
    </svg>`,
    { size: 192 },
  );

  const CONTROL_LABEL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 64">
      <rect width="256" height="64" rx="8" fill="#3d2c20" stroke="#e4b46c" stroke-width="5"/>
      <text x="128" y="43" text-anchor="middle"
        font-family="monospace" font-weight="bold" font-size="31" fill="#f5d28f">ROBO-KID</text>
    </svg>`,
    { size: 256 },
  );

  const SCREEN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 80">
      <rect x="3" y="3" width="122" height="74" rx="9" fill="#122b2d" stroke="#e4c27a" stroke-width="5"/>
      <path d="M18 47h19l8-20 12 31 10-22 7 11h22"
        fill="none" stroke="#65e7d1" stroke-width="5" stroke-linecap="square"/>
      <circle cx="25" cy="20" r="4" fill="#91ffe5"/>
      <circle cx="39" cy="20" r="4" fill="#91ffe5"/>
      <circle cx="53" cy="20" r="4" fill="#91ffe5"/>
    </svg>`,
    { size: 256 },
  );

  const EYE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 112">
      <path d="M7 57Q40 10 73 57Q40 103 7 57Z" fill="#fff8e9" stroke="#34251f" stroke-width="7"/>
      <ellipse cx="42" cy="57" rx="16" ry="27" fill="#4e9db1" stroke="#34251f" stroke-width="5"/>
      <ellipse cx="43" cy="61" rx="7" ry="17" fill="#1c2931"/>
      <circle cx="35" cy="45" r="6" fill="#fff"/>
      <circle cx="49" cy="73" r="3" fill="#fff"/>
      <path d="M9 42Q35 5 70 38" fill="none" stroke="#34251f" stroke-width="8" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const CHEEK_STICKER = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="29" fill="#e5bd63" stroke="#51321e" stroke-width="4"/>
      <path d="M32 12l5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1z"
        fill="#c95736" stroke="#51321e" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  const hips = b.joint("hips", {
    at: [0, 0.72, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, 0],
      [0, 0.91, 0],
      [0, 1.09, 0],
    ]),
    {
      parent: hips,
      names: ["pelvis", "chest", "neck"],
      role: "spine",
      count: 3,
    },
  );

  const head = b.joint("head", {
    parent: spine.tip ?? spine.joints[2],
    at: [0, 1.30, 0.035],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.245, 0.18],
    dir: [0, 0.05, 1],
    role: "jaw",
    group: "face",
  });

  const legs: { side: number; chain: ReturnType<typeof b.chain> }[] = [];
  const arms: { side: number; chain: ReturnType<typeof b.chain> }[] = [];

  for (const side of [1, -1]) {
    const hip = [side * 0.17, 0.69, 0] as const;
    const foot = [side * 0.18, 0.16, 0.13] as const;
    const legPts = limb(hip, foot, [0.29, 0.29], [0, 0, 1]);
    const leg = b.chain(`leg${side > 0 ? "L" : "R"}`, legPts, {
      parent: hips,
      names: side > 0 ? ["hipL", "kneeL", "ankleL"] : ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [side * 0.18, 0, 0.13],
    });
    legs.push({ side, chain: leg });

    const shoulder = [side * 0.34, 1.045, 0.005] as const;
    const hand = [side * 0.54, 0.79, 0.075] as const;
    const armPts = limb(shoulder, hand, [0.255, 0.255], [0, 0, -1]);
    const arm = b.chain(`arm${side > 0 ? "L" : "R"}`, armPts, {
      parent: spine.joints[1],
      names: side > 0 ? ["shoulderL", "elbowL", "handL"] : ["shoulderR", "elbowR", "handR"],
      role: "arm",
    });
    arms.push({ side, chain: arm });
  }

  const torsoBone = spine.joints[1];
  const neckBone = spine.joints[2];

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string | typeof CARDBOARD = CARDBOARD,
    bone = torsoBone,
    texture: THREE.Texture | undefined = CORRUGATION,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      texture: typeof color === "string" ? texture : undefined,
      flat: true,
      name,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string | ReturnType<typeof mottle> = CARDBOARD,
    bone = torsoBone,
    scale?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      scale,
      flat: true,
      name,
    });

  const seam = (
    a: [number, number, number],
    z: [number, number, number],
    radius = 0.012,
    color = EDGE,
    bone = torsoBone,
    name?: string,
  ) => b.rod(a, z, radius, { color, bone, caps: "flat", sides: 6, name });

  const rivet = (
    at: [number, number, number],
    color = METAL,
    bone = torsoBone,
    size = 0.018,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(size, 7, 5), color, {
      at,
      bone,
      flat: true,
      name,
    });

  const tapeStrip = (
    size: [number, number, number],
    at: [number, number, number],
    bone = torsoBone,
    name?: string,
  ) => box(size, at, TAPE, bone, undefined, name);

  // Feet and lower costume.
  for (const { side, chain } of legs) {
    const s = side;
    b.sweep(chain, [0.082, 0.075], {
      color: CARDBOARD_DARK,
      section: "box",
      caps: "flat",
      skin: "rigid",
      name: `cardboard-leg-${s > 0 ? "L" : "R"}`,
    });

    box([0.205, 0.145, 0.29], [s * 0.18, 0.082, 0.125], CARDBOARD_DARK, chain.tip ?? chain.joints[2], CORRUGATION, `boot${s > 0 ? "L" : "R"}`);
    box([0.218, 0.035, 0.305], [s * 0.18, 0.014, 0.125], RUBBER, chain.tip ?? chain.joints[2], undefined, `sole${s > 0 ? "L" : "R"}`);
    tapeStrip([0.22, 0.035, 0.035], [s * 0.18, 0.15, 0.125], chain.joints[1], `ankleTape${s > 0 ? "L" : "R"}`);
    tapeStrip([0.18, 0.028, 0.19], [s * 0.18, 0.10, 0.14], chain.tip ?? chain.joints[2], `toeTape${s > 0 ? "L" : "R"}`);

    for (const x of [-0.065, 0.065]) {
      rivet([s * 0.18 + x, 0.158, 0.245], METAL, chain.tip ?? chain.joints[2], 0.012, `bootRivet${s}${x}`);
      rivet([s * 0.18 + x, 0.158, 0.005], METAL_DARK, chain.tip ?? chain.joints[2], 0.009, `soleRivet${s}${x}`);
    }
  }

  // Torso: an oversized shipping box with reinforced corners.
  box([0.64, 0.57, 0.43], [0, 0.875, 0], CARDBOARD, torsoBone, CORRUGATION, "main torso box");
  box([0.57, 0.06, 0.39], [0, 0.875, 0.225], CARDBOARD_LIGHT, torsoBone, undefined, "front face board");

  seam([-0.322, 0.60, -0.19], [-0.322, 1.15, -0.19], 0.014, EDGE, torsoBone, "torso seam back left");
  seam([0.322, 0.60, -0.19], [0.322, 1.15, -0.19], 0.014, EDGE, torsoBone, "torso seam back right");
  seam([-0.322, 0.60, 0.19], [-0.322, 1.15, 0.19], 0.014, EDGE, torsoBone, "torso seam front left");
  seam([0.322, 0.60, 0.19], [0.322, 1.15, 0.19], 0.014, EDGE, torsoBone, "torso seam front right");

  tapeStrip([0.045, 0.59, 0.035], [-0.286, 0.875, 0.225], torsoBone, "front left corner tape");
  tapeStrip([0.045, 0.59, 0.035], [0.286, 0.875, 0.225], torsoBone, "front right corner tape");
  tapeStrip([0.62, 0.04, 0.035], [0, 1.135, 0.225], torsoBone, "top front tape");
  tapeStrip([0.62, 0.04, 0.035], [0, 0.615, 0.225], torsoBone, "bottom front tape");

  for (const x of [-0.285, 0.285]) {
    for (const y of [0.64, 0.865, 1.105]) {
      rivet([x, y, 0.246], METAL, torsoBone, 0.016, `torsoRivet${x}${y}`);
    }
  }

  // Diagonal packing straps across the front.
  seam([-0.27, 0.67, 0.258], [0.27, 1.08, 0.258], 0.018, TAPE_DARK, torsoBone, "left diagonal packing strap");
  seam([0.27, 0.67, 0.258], [-0.27, 1.08, 0.258], 0.018, TAPE_DARK, torsoBone, "right diagonal packing strap");

  // Belt blocks around the lower edge.
  box([0.66, 0.065, 0.045], [0, 0.655, 0], CARDBOARD_DARK, torsoBone, undefined, "waist belt front");
  box([0.66, 0.065, 0.045], [0, 0.655, -0.205], CARDBOARD_DARK, torsoBone, undefined, "waist belt back");
  box([0.045, 0.065, 0.36], [-0.33, 0.655, 0], CARDBOARD_DARK, torsoBone, undefined, "waist belt left");
  box([0.045, 0.065, 0.36], [0.33, 0.655, 0], CARDBOARD_DARK, torsoBone, undefined, "waist belt right");

  // Chest control panel.
  box([0.37, 0.205, 0.035], [0, 0.865, 0.273], "#4e3828", torsoBone, undefined, "control panel housing");
  b.part(new THREE.PlaneGeometry(0.25, 0.062), "#ffffff", {
    at: [0, 0.938, 0.295],
    bone: torsoBone,
    dir: [0, 0, 1],
    axis: "z",
    texture: CONTROL_LABEL,
    name: "ROBO-KID printed label",
  });
  const screen = b.part(new THREE.PlaneGeometry(0.22, 0.135), "#ffffff", {
    at: [0, 0.815, 0.296],
    bone: torsoBone,
    dir: [0, 0, 1],
    axis: "z",
    texture: SCREEN,
    name: "glowing chest screen",
  });
  glow(screen, 1.8);

  for (const x of [-0.125, 0.125]) {
    const button = sphere(0.033, [x, 0.735, 0.302], x > 0 ? RED : YELLOW, torsoBone, undefined, `chest button ${x}`);
    glow(button, 0.35);
    rivet([x, 0.735, 0.342], INK, torsoBone, 0.008, `button rim ${x}`);
  }

  b.extrude(
    [
      [-0.075, -0.06, "sharp"],
      [0.075, -0.06, "sharp"],
      [0, 0.085, "sharp"],
    ],
    {
      at: [0, 0.91, 0.301],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: YELLOW,
      bone: torsoBone,
      name: "cardboard warning triangle",
    },
  );
  b.part(new THREE.PlaneGeometry(0.24, 0.12), "#ffffff", {
    at: [0, 0.91, 0.309],
    bone: torsoBone,
    dir: [0, 0, 1],
    axis: "z",
    texture: WARNING,
    name: "striped warning sticker",
  });

  for (const x of [-0.27, 0.27]) {
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
      at: [x, 0.93, 0.299],
      bone: torsoBone,
      dir: [0, 0, 1],
      axis: "z",
      texture: CHEEK_STICKER,
      name: `star sticker ${x}`,
    });
  }

  // Arms: chunky square sleeves, cuffs, mitten hands, and cardboard shoulder caps.
  for (const { side, chain } of arms) {
    const s = side;
    b.sweep(chain, [0.085, 0.078], {
      color: CARDBOARD,
      section: "box",
      caps: "flat",
      skin: "rigid",
      name: `cardboard arm ${s > 0 ? "L" : "R"}`,
    });

    box([0.145, 0.13, 0.19], [s * 0.37, 1.075, 0.02], CARDBOARD_LIGHT, chain.joints[0], CORRUGATION, `shoulder pad ${s}`);
    box([0.16, 0.15, 0.16], [s * 0.555, 0.775, 0.075], CARDBOARD_DARK, chain.tip ?? chain.joints[2], CORRUGATION, `robot mitten ${s}`);
    box([0.18, 0.035, 0.17], [s * 0.555, 0.75, 0.075], TAPE, chain.tip ?? chain.joints[2], undefined, `mitten cuff ${s}`);

    for (const a of [0.23, 0.50, 0.78]) {
      const p = chain.at(a);
      b.stick(new THREE.CylinderGeometry(0.091, 0.091, 0.026, 8), TAPE, p, {
        embed: 0.05,
        flat: true,
        name: `arm tape band ${s} ${a}`,
      });
    }

    rivet([s * 0.37, 1.09, 0.125], METAL, chain.joints[0], 0.018, `shoulder rivet outer ${s}`);
    rivet([s * 0.37, 1.09, -0.105], METAL, chain.joints[0], 0.018, `shoulder rivet inner ${s}`);
    rivet([s * 0.555, 0.812, 0.16], METAL, chain.tip ?? chain.joints[2], 0.014, `hand rivet ${s}`);
  }

  // Head and face: the child is visible through the helmet's front opening.
  const face = b.part(new THREE.SphereGeometry(0.17, 12, 8), SKIN, {
    at: [0, 1.295, 0.245],
    bone: head,
    scale: [0.83, 0.94, 0.44],
    flat: true,
    name: "child face",
  });
  const faceSurface = b.surface(face);

  b.part(new THREE.PlaneGeometry(0.31, 0.235), "#2b211b", {
    at: [0, 1.30, 0.205],
    bone: head,
    dir: [0, 0, 1],
    axis: "z",
    name: "helmet face opening",
  });

  for (const s of [-1, 1]) {
    b.decal(faceSurface, EYE, {
      at: [s * 0.065, 1.33, 0.303],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.075, 0.105],
      lift: 0.003,
      mirror: s > 0,
      name: `large eye ${s}`,
    });
  }

  sphere(0.025, [0, 1.278, 0.315], "#d47f62", head, [1, 0.7, 0.55], "button nose");
  b.part(new THREE.TorusGeometry(0.052, 0.008, 6, 12, Math.PI), INK, {
    at: [0, 1.235, 0.312],
    bone: jaw,
    dir: [0, 0, 1],
    axis: "z",
    rotation: [0, 0, 180],
    name: "happy mouth",
  });

  for (const s of [-1, 1]) {
    sphere(0.045, [s * 0.155, 1.285, 0.245], SKIN, head, [0.65, 1, 0.45], `child ear ${s}`);
    b.part(new THREE.PlaneGeometry(0.047, 0.047), "#ffffff", {
      at: [s * 0.155, 1.285, 0.274],
      bone: head,
      dir: [0, 0, 1],
      axis: "z",
      texture: CHEEK_STICKER,
      name: `cheek star ${s}`,
    });
  }

  // Hair peeks from underneath the helmet.
  for (const [x, y, z, dx] of [
    [-0.115, 1.44, 0.14, -0.035],
    [-0.055, 1.475, 0.14, -0.018],
    [0.005, 1.49, 0.14, 0],
    [0.065, 1.475, 0.14, 0.018],
    [0.125, 1.44, 0.14, 0.035],
  ] as const) {
    b.spike([x, y, z], [x + dx, y + 0.075, z + 0.008], null, 0.038, HAIR, {
      bone: head,
      caps: { start: "round", end: "point" },
      name: "cardboard helmet hair tuft",
    });
  }

  // Helmet box and its thick face frame.
  box([0.49, 0.39, 0.37], [0, 1.315, 0.035], CARDBOARD, head, CORRUGATION, "helmet box");
  box([0.43, 0.045, 0.08], [0, 1.505, 0.04], CARDBOARD_LIGHT, head, undefined, "helmet top flap");
  box([0.06, 0.33, 0.055], [-0.205, 1.30, 0.245], CARDBOARD_LIGHT, head, undefined, "helmet frame left");
  box([0.06, 0.33, 0.055], [0.205, 1.30, 0.245], CARDBOARD_LIGHT, head, undefined, "helmet frame right");
  box([0.43, 0.055, 0.055], [0, 1.46, 0.245], CARDBOARD_LIGHT, head, undefined, "helmet frame top");
  box([0.43, 0.055, 0.055], [0, 1.145, 0.245], CARDBOARD_LIGHT, head, undefined, "helmet frame chin");

  tapeStrip([0.035, 0.39, 0.03], [-0.245, 1.315, 0.035], head, "helmet left edge tape");
  tapeStrip([0.035, 0.39, 0.03], [0.245, 1.315, 0.035], head, "helmet right edge tape");
  tapeStrip([0.45, 0.035, 0.03], [0, 1.52, 0.035], head, "helmet top tape");

  for (const s of [-1, 1]) {
    rivet([s * 0.222, 1.46, 0.285], METAL, head, 0.017, `helmet top rivet ${s}`);
    rivet([s * 0.222, 1.165, 0.285], METAL, head, 0.017, `helmet chin rivet ${s}`);
    rivet([s * 0.252, 1.315, 0.14], METAL_DARK, head, 0.015, `helmet side rivet ${s}`);
  }

  // Side ear-like cardboard panels make the helmet read as a homemade robot.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [-0.09, -0.075, "sharp"],
        [0.09, -0.075, "sharp"],
        [0.07, 0.09, "sharp"],
        [-0.055, 0.12, "sharp"],
      ],
      {
        at: [s * 0.265, 1.33, 0.03],
        x: [0, 0, 1],
        y: [s * 0.2, 1, 0],
        thickness: 0.025,
        bevel: 0.003,
        color: CARDBOARD_LIGHT,
        bone: head,
        name: `helmet side fin ${s}`,
      },
    );
    rivet([s * 0.27, 1.33, 0.055], METAL, head, 0.018, `side fin rivet ${s}`);
  }

  // Antenna on a folded cardboard crown tab.
  box([0.12, 0.035, 0.13], [0, 1.555, 0.02], CARDBOARD_LIGHT, head, undefined, "antenna base");
  b.rod([0, 1.57, 0.02], [0, 1.67, 0.02], 0.014, {
    color: METAL_DARK,
    bone: head,
    caps: "flat",
    name: "antenna stalk",
  });
  const antenna = sphere(0.035, [0, 1.70, 0.02], RED, head, undefined, "antenna bulb");
  glow(antenna, 1.25);
  rivet([0, 1.566, 0.088], METAL, head, 0.012, "antenna base rivet");

  // Neck collar and exposed cardboard folds beneath the helmet.
  box([0.29, 0.10, 0.27], [0, 1.145, 0], CARDBOARD_DARK, neckBone, CORRUGATION, "neck collar");
  tapeStrip([0.31, 0.028, 0.29], [0, 1.195, 0], neckBone, "neck collar tape front");
  for (const s of [-1, 1]) {
    rivet([s * 0.125, 1.19, 0.145], METAL, neckBone, 0.014, `neck rivet ${s}`);
  }

  // Small hand-made cardboard tabs and folded corners around the costume.
  for (const s of [-1, 1]) {
    box([0.08, 0.12, 0.025], [s * 0.31, 1.085, -0.225], CARDBOARD_LIGHT, torsoBone, undefined, `rear shoulder tab ${s}`);
    box([0.08, 0.10, 0.025], [s * 0.29, 0.625, -0.22], CARDBOARD_LIGHT, torsoBone, undefined, `rear waist tab ${s}`);
    rivet([s * 0.31, 1.09, -0.245], METAL_DARK, torsoBone, 0.012, `rear shoulder rivet ${s}`);
    rivet([s * 0.29, 0.63, -0.24], METAL_DARK, torsoBone, 0.012, `rear waist rivet ${s}`);
  }

  // A few visible corrugated strips along the outer silhouette.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.018, 0.43, 0.018), CARDBOARD_LIGHT, {
      at: [s * 0.34, 0.88, 0.02],
      bone: torsoBone,
      flat: true,
      name: `torso side edge ${s}`,
    });
    b.part(new THREE.BoxGeometry(0.018, 0.43, 0.018), EDGE, {
      at: [s * 0.345, 0.88, 0.19],
      bone: torsoBone,
      flat: true,
      name: `torso front side seam ${s}`,
    });
  }

  // A tail-like loose cable from the control panel, made from cardboard-colored tubing.
  const cablePath = catmull([
    [0.18, 0.75, 0.31],
    [0.28, 0.69, 0.34],
    [0.38, 0.72, 0.31],
    [0.43, 0.63, 0.26],
  ]);
  b.sweep(cablePath, 0.012, {
    color: TAPE_DARK,
    sides: 6,
    caps: "round",
    bone: torsoBone,
    name: "loose control cable",
  });
  sphere(0.025, [0.43, 0.63, 0.26], RED, torsoBone, undefined, "cable plug");
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), RED, {
    at: [0.43, 0.63, 0.285],
    bone: torsoBone,
    name: "cable plug light",
  }), 0.8);

  // A final set of chunky rivets makes the craft construction legible at a distance.
  for (const y of [0.70, 0.86, 1.02]) {
    for (const z of [-0.225, 0.225]) {
      rivet([-0.315, y, z], METAL_DARK, torsoBone, 0.010, `side construction rivet L ${y} ${z}`);
      rivet([0.315, y, z], METAL_DARK, torsoBone, 0.010, `side construction rivet R ${y} ${z}`);
    }
  }

  return b.root;
}
