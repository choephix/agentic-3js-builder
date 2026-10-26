import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  limb,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "baku",
  description:
    "A stylized baku, the dream-eating tapir spirit, built as a low-poly ukiyo-e woodblock puppet with indigo mane, vermilion seals, carved cloud motifs, a curling trunk, and expressive ink-black eyes.",
};

const INK = "#211a28";
const INK_SOFT = "#302335";
const BODY = "#49333a";
const BODY_LIGHT = "#76504b";
const BODY_WARM = "#9b604c";
const BELLY = "#d8c39b";
const BELLY_LIGHT = "#f0dcae";
const INDIGO = "#2f4665";
const INDIGO_LIGHT = "#496b82";
const VERMILION = "#b64d3e";
const VERMILION_DARK = "#71333a";
const GOLD = "#c59b4c";
const MOSS = "#66745f";
const MOUTH = "#140e19";
const EYE_GOLD = "#d89b42";
const EYE_GOLD_LIGHT = "#f2c96b";

const EYE_TEXTURE = svg(
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 80">
    <path d="M5 42 Q25 7 52 11 Q78 14 92 40 Q69 70 42 69 Q18 67 5 42Z"
      fill="#211a28" stroke="#211a28" stroke-width="5" stroke-linejoin="round"/>
    <path d="M16 43 Q31 19 51 20 Q70 21 83 41 Q66 61 46 61 Q27 59 16 43Z"
      fill="#d89b42" stroke="#49333a" stroke-width="3"/>
    <path d="M18 43 Q32 21 51 21 Q68 22 81 39 Q65 34 49 34 Q31 34 18 43Z"
      fill="#9b604c"/>
    <ellipse cx="49" cy="43" rx="9" ry="18" fill="#211a28"/>
    <ellipse cx="37" cy="31" rx="8" ry="7" fill="#fff3ce"/>
    <circle cx="60" cy="52" r="4" fill="#fff3ce"/>
    <path d="M10 29 Q17 13 30 8" fill="none" stroke="#211a28" stroke-width="6" stroke-linecap="round"/>
    <path d="M74 15 Q86 18 92 26" fill="none" stroke="#211a28" stroke-width="4" stroke-linecap="round"/>
  </svg>
  `,
  { size: 256 },
);

const SMALL_EYE_TEXTURE = svg(
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 52">
    <path d="M4 27 Q19 5 33 7 Q49 9 60 26 Q46 46 30 45 Q14 44 4 27Z"
      fill="#211a28"/>
    <ellipse cx="32" cy="27" rx="11" ry="14" fill="#d89b42"/>
    <ellipse cx="32" cy="29" rx="4" ry="10" fill="#211a28"/>
    <circle cx="27" cy="21" r="3.5" fill="#fff3ce"/>
  </svg>
  `,
  { size: 192 },
);

const EAR_OUTER: [number, number, "sharp"][] = [
  [-0.035, 0, "sharp"],
  [0.16, 0.035, "sharp"],
  [0.255, 0.15, "sharp"],
  [0.235, 0.31, "sharp"],
  [0.145, 0.43, "sharp"],
  [0.045, 0.35, "sharp"],
  [-0.04, 0.18, "sharp"],
];

const EAR_INNER: [number, number, "sharp"][] = [
  [-0.015, 0.025, "sharp"],
  [0.115, 0.065, "sharp"],
  [0.19, 0.16, "sharp"],
  [0.17, 0.285, "sharp"],
  [0.115, 0.35, "sharp"],
  [0.04, 0.285, "sharp"],
  [-0.015, 0.16, "sharp"],
];

const MANE_OUTLINE: [number, number, "sharp"][] = [
  [0, 0, "sharp"],
  [0.15, 0.055, "sharp"],
  [0.23, 0.19, "sharp"],
  [0.37, 0.095, "sharp"],
  [0.47, 0.28, "sharp"],
  [0.61, 0.13, "sharp"],
  [0.76, 0.34, "sharp"],
  [0.9, 0.17, "sharp"],
  [1.05, 0.38, "sharp"],
  [1.2, 0.18, "sharp"],
  [1.35, 0.31, "sharp"],
  [1.52, 0.1, "sharp"],
  [1.7, 0.18, "sharp"],
  [1.7, 0, "sharp"],
];

const MANE_INNER: [number, number, "sharp"][] = [
  [0.05, 0.025, "sharp"],
  [0.21, 0.09, "sharp"],
  [0.29, 0.17, "sharp"],
  [0.42, 0.1, "sharp"],
  [0.54, 0.21, "sharp"],
  [0.66, 0.12, "sharp"],
  [0.79, 0.26, "sharp"],
  [0.93, 0.14, "sharp"],
  [1.07, 0.3, "sharp"],
  [1.21, 0.14, "sharp"],
  [1.36, 0.24, "sharp"],
  [1.51, 0.09, "sharp"],
  [1.65, 0.13, "sharp"],
  [1.65, 0.025, "sharp"],
];

const FOREHEAD_STRIPE: [number, number, "sharp"][] = [
  [-0.07, 0, "sharp"],
  [0.07, 0, "sharp"],
  [0.045, 0.23, "sharp"],
  [0, 0.31, "sharp"],
  [-0.045, 0.23, "sharp"],
];

const FOREHEAD_STRIPE_INNER: [number, number, "sharp"][] = [
  [-0.032, 0.015, "sharp"],
  [0.032, 0.015, "sharp"],
  [0.02, 0.2, "sharp"],
  [0, 0.255, "sharp"],
  [-0.02, 0.2, "sharp"],
];

const CLOUD_RIBBON: [number, number, "sharp"][] = [
  [-0.25, 0, "sharp"],
  [-0.18, 0.045, "sharp"],
  [-0.1, 0.08, "sharp"],
  [-0.015, 0.045, "sharp"],
  [0.065, 0.01, "sharp"],
  [0.15, 0.055, "sharp"],
  [0.24, 0.13, "sharp"],
  [0.24, 0.19, "sharp"],
  [0.14, 0.12, "sharp"],
  [0.055, 0.08, "sharp"],
  [-0.03, 0.115, "sharp"],
  [-0.12, 0.16, "sharp"],
  [-0.2, 0.12, "sharp"],
];

const CLOUD_RIBBON_SMALL: [number, number, "sharp"][] = [
  [-0.18, 0, "sharp"],
  [-0.1, 0.04, "sharp"],
  [-0.015, 0.015, "sharp"],
  [0.07, 0.055, "sharp"],
  [0.16, 0.115, "sharp"],
  [0.16, 0.15, "sharp"],
  [0.07, 0.1, "sharp"],
  [-0.015, 0.09, "sharp"],
  [-0.1, 0.13, "sharp"],
];

const WAVE_MARK: [number, number, "sharp"][] = [
  [-0.21, 0, "sharp"],
  [-0.14, 0.045, "sharp"],
  [-0.07, 0.012, "sharp"],
  [0, 0.065, "sharp"],
  [0.08, 0.02, "sharp"],
  [0.16, 0.07, "sharp"],
  [0.23, 0.025, "sharp"],
  [0.23, 0.075, "sharp"],
  [0.16, 0.13, "sharp"],
  [0.08, 0.08, "sharp"],
  [0, 0.135, "sharp"],
  [-0.08, 0.085, "sharp"],
  [-0.16, 0.13, "sharp"],
  [-0.23, 0.075, "sharp"],
];

function build() {
  const b = createBuilder({
    name: "baku",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: a heavy tapir body, four planted legs, a curling trunk, a separate lower jaw, and a spirit tail.

  const hips = b.joint("hips", {
    at: [0, 0.98, -0.38],
    dir: [0, 0.02, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.98, -0.38],
    [0, 1.02, -0.05],
    [0, 1.04, 0.3],
    [0, 1.06, 0.62],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineBase", "spineMid", "shoulder", "chest"],
    role: "spine",
    group: "body",
  });

  const neckPath = catmull([
    [0, 1.06, 0.62],
    [0, 1.16, 0.78],
    [0, 1.34, 0.96],
    [0, 1.47, 1.09],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neckBase", "neckMid", "neckTip"],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.5, 1.14],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const upperJawPath = catmull([
    [0, 1.48, 1.31],
    [0, 1.46, 1.49],
    [0, 1.34, 1.68],
    [0, 1.12, 1.79],
    [0, 0.99, 1.72],
  ]);

  const upperJaw = b.chain("upperJaw", upperJawPath, {
    parent: head,
    names: ["upperJaw", "muzzle", "trunkMid", "trunkTip", "nose"],
    role: "jaw",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.37, 1.32],
    aim: [0, 1.21, 1.72],
    role: "jaw",
    group: "face",
  });

  const lowerJawPath = catmull([
    [0, 1.37, 1.32],
    [0, 1.28, 1.5],
    [0, 1.18, 1.68],
    [0, 1.08, 1.73],
  ]);

  const lowerJaw = b.chain("lowerJaw", lowerJawPath, {
    parent: jaw,
    names: ["lowerJaw", "jawMiddle", "jawTip"],
    role: "jaw",
    group: "face",
  });

  // A small open resting pose makes the two jaws legible without turning the creature into an aggressive pose.
  b.pose(jaw, {
    axis: [1, 0, 0],
    deg: -8,
  });

  const tailPath = catmull([
    [0, 0.99, -0.74],
    [0, 1.02, -0.98],
    [0, 1.11, -1.2],
    [0, 1.2, -1.36],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tailBase", "tailMid", "tailTip", "tailEnd"],
    role: "tail",
    group: "body",
  });

  const hindRootL: [number, number, number] = [0.34, 0.94, -0.37];
  const hindFootL: [number, number, number] = [0.39, 0.16, -0.54];
  const hindPointsL = limb(
    hindRootL,
    hindFootL,
    [0.34, 0.36, 0.24],
    [
      [0, 0, -1],
      [0, 0, 1],
    ],
  );
  const hindL = b.chain("hindL", hindPointsL, {
    parent: hips,
    names: ["hipL", "kneeL", "hockL", "footL"],
    role: "leg",
    contact: hindFootL,
    group: "legs",
  });

  const hindRootR: [number, number, number] = [-0.34, 0.94, -0.37];
  const hindFootR: [number, number, number] = [-0.39, 0.16, -0.54];
  const hindPointsR = limb(
    hindRootR,
    hindFootR,
    [0.34, 0.36, 0.24],
    [
      [0, 0, -1],
      [0, 0, 1],
    ],
  );
  const hindR = b.chain("hindR", hindPointsR, {
    parent: hips,
    names: ["hipR", "kneeR", "hockR", "footR"],
    role: "leg",
    contact: hindFootR,
    group: "legs",
  });

  const foreRootL: [number, number, number] = [0.34, 1.03, 0.5];
  const foreFootL: [number, number, number] = [0.38, 0.16, 0.62];
  const forePointsL = limb(
    foreRootL,
    foreFootL,
    [0.36, 0.34, 0.24],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );
  const foreL = b.chain("foreL", forePointsL, {
    parent: spine.tip,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "leg",
    contact: foreFootL,
    group: "legs",
  });

  const foreRootR: [number, number, number] = [-0.34, 1.03, 0.5];
  const foreFootR: [number, number, number] = [-0.38, 0.16, 0.62];
  const forePointsR = limb(
    foreRootR,
    foreFootR,
    [0.36, 0.34, 0.24],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );
  const foreR = b.chain("foreR", forePointsR, {
    parent: spine.tip,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "leg",
    contact: foreFootR,
    group: "legs",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Main carved volumes.

  const body = b.sweep(spine, (t) => {
    const breadth = 0.46 - 0.045 * Math.abs(t - 0.45);
    const height = 0.42 - 0.025 * Math.abs(t - 0.45);
    return [breadth, height];
  }, {
    color: BODY,
    section: "circle",
    sides: 8,
    smooth: false,
    sectors: [
      [-52, 52, BODY_LIGHT],
      [122, 238, BELLY],
    ],
    group: "body",
    name: "carved_body",
  });

  const neckTube = b.sweep(neck, (t) => {
    const radius = 0.27 - t * 0.045;
    return [radius, radius * 0.92];
  }, {
    color: BODY,
    section: "circle",
    sides: 8,
    smooth: false,
    sectors: [
      [-55, 55, BODY_LIGHT],
      [124, 236, BELLY],
    ],
    group: "head",
    name: "carved_neck",
  });

  const trunk = b.sweep(upperJaw, (t) => {
    if (t < 0.35) return 0.2 - t * 0.025;
    if (t < 0.75) return 0.175 - (t - 0.35) * 0.12;
    return 0.127 - (t - 0.75) * 0.08;
  }, {
    color: BODY_WARM,
    section: { ngon: 8 },
    smooth: false,
    sectors: [
      [-45, 45, BODY_LIGHT],
      [120, 240, BODY],
    ],
    group: "face",
    name: "curling_trunk",
  });

  const lowerMuzzle = b.sweep(lowerJaw, (t) => {
    if (t < 0.4) return 0.145 - t * 0.02;
    return 0.125 - (t - 0.4) * 0.07;
  }, {
    color: BODY_WARM,
    section: { ngon: 8 },
    smooth: false,
    group: "face",
    name: "lower_jaw",
  });

  const tailTube = b.sweep(tail, (t) => 0.14 - 0.105 * t, {
    color: BODY,
    section: { ngon: 8 },
    smooth: false,
    sectors: [
      [-55, 55, BODY_LIGHT],
      [125, 235, INK_SOFT],
    ],
    group: "body",
    name: "spirit_tail",
  });

  const legOptions = {
    color: BODY,
    section: { ngon: 6 as const },
    smooth: false,
    group: "legs",
  };

  const hindLegL = b.sweep(hindL, [0.13, 0.092], {
    ...legOptions,
    name: "hind_leg_L",
    bands: [[0.74, BODY_LIGHT]],
  });

  const hindLegR = b.sweep(hindR, [0.13, 0.092], {
    ...legOptions,
    name: "hind_leg_R",
    bands: [[0.74, BODY_LIGHT]],
  });

  const foreLegL = b.sweep(foreL, [0.125, 0.09], {
    ...legOptions,
    name: "fore_leg_L",
    bands: [[0.74, BODY_LIGHT]],
  });

  const foreLegR = b.sweep(foreR, [0.125, 0.09], {
    ...legOptions,
    name: "fore_leg_R",
    bands: [[0.74, BODY_LIGHT]],
  });

  const skull = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    BODY_LIGHT,
    {
      bone: head,
      at: head.at,
      scale: [0.39, 0.36, 0.43],
      flat: true,
      group: "head",
      name: "round_tapir_skull",
    },
  );

  const cheekL = b.part(
    new THREE.SphereGeometry(1, 8, 6),
    BODY_WARM,
    {
      bone: head,
      at: [0.275, 1.39, 1.27],
      scale: [0.18, 0.17, 0.16],
      flat: true,
      group: "face",
      name: "cheek_L",
    },
  );

  const cheekR = b.part(
    new THREE.SphereGeometry(1, 8, 6),
    BODY_WARM,
    {
      bone: head,
      at: [-0.275, 1.39, 1.27],
      scale: [0.18, 0.17, 0.16],
      flat: true,
      group: "face",
      name: "cheek_R",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Legs, hoof blocks, and three-toed woodcut claws.

  function addHoof(
    foot: [number, number, number],
    bone: typeof hindL.tip,
    side: number,
    label: string,
  ) {
    b.part(
      new THREE.BoxGeometry(0.24, 0.13, 0.27),
      INK,
      {
        bone,
        at: foot,
        flat: true,
        group: "legs",
        name: `${label}_hoof`,
      },
    );

    const toeBaseY = foot[1] + 0.005;
    const toeZ = foot[2] + 0.1;

    for (let i = -1; i <= 1; i++) {
      const x = foot[0] + i * 0.065;
      b.spike(
        [x, toeBaseY, toeZ],
        [0, -0.06, 1],
        0.105,
        0.026,
        {
          bone,
          color: BELLY_LIGHT,
          caps: "point",
          group: "legs",
          name: `${label}_claw_${i + 2}`,
        },
      );
    }
  }

  addHoof(hindFootL, hindL.joints[hindL.joints.length - 1], 1, "hind_L");
  addHoof(hindFootR, hindR.joints[hindR.joints.length - 1], -1, "hind_R");
  addHoof(foreFootL, foreL.joints[foreL.joints.length - 1], 1, "fore_L");
  addHoof(foreFootR, foreR.joints[foreR.joints.length - 1], -1, "fore_R");

  function addCuff(chain: typeof hindL, t: number, radius: number, color: string, name: string) {
    const ring = b.ring(chain.at(t), {
      count: 12,
      radius,
      name,
      role: "fan",
      group: "trim",
    });
    b.sweep(catmull(ring.items, { closed: true }), 0.018, {
      color,
      section: { ngon: 6 },
      smooth: false,
      group: "trim",
      name: `${name}_band`,
    });
    for (let i = 0; i < ring.items.length; i += 3) {
      b.stick(
        new THREE.SphereGeometry(0.025, 6, 4),
        GOLD,
        ring.items[i],
        {
          embed: 0.45,
          group: "trim",
          name: `${name}_stud_${i}`,
        },
      );
    }
  }

  addCuff(hindL, 0.56, 0.116, VERMILION, "hindL_red_cuff");
  addCuff(hindR, 0.56, 0.116, VERMILION, "hindR_red_cuff");
  addCuff(foreL, 0.58, 0.112, INDIGO, "foreL_blue_cuff");
  addCuff(foreR, 0.58, 0.112, INDIGO, "foreR_blue_cuff");

  // ---------------------------------------------------------------------------------------------------------------
  // Ears: thick black silhouette, pale inner cut, and small vermilion seal marks.

  for (const side of [1, -1]) {
    const outerEar = b.extrude(EAR_OUTER, {
      at: [side * 0.24, 1.63, 1.12],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.006,
      smoothing: 0,
      color: INK,
      bone: head,
      group: "head",
      name: `ink_ear_${side > 0 ? "L" : "R"}`,
    });

    const innerEar = b.extrude(EAR_INNER, {
      at: [side * 0.248, 1.65, 1.14],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.004,
      smoothing: 0,
      color: BELLY,
      bone: head,
      group: "head",
      name: `cream_ear_${side > 0 ? "L" : "R"}`,
    });

    b.stick(
      new THREE.SphereGeometry(0.035, 6, 4),
      VERMILION,
      innerEar.moved(innerEar.local([0.09, 0.22, 0.02])),
      {
        embed: 0.35,
        group: "head",
        name: `ear_seal_${side > 0 ? "L" : "R"}`,
      },
    );

    // A dark root wedge makes each ear appear to grow from the skull instead of floating beside it.
    b.part(
      new THREE.ConeGeometry(0.12, 0.2, 6),
      INK_SOFT,
      {
        bone: head,
        at: [side * 0.21, 1.62, 1.15],
        dir: [side * 0.5, 0.5, 0],
        flat: true,
        group: "head",
        name: `ear_root_${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Dorsal lion-like spirit mane, cut as a jagged woodblock silhouette.

  b.extrude(MANE_OUTLINE, {
    at: [0, 1.33, -0.66],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.1,
    bevel: 0.008,
    smoothing: 0,
    color: INK,
    bone: hips,
    group: "mane",
    name: "ink_dorsal_mane",
  });

  b.extrude(MANE_INNER, {
    at: [0.012, 1.35, -0.64],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.055,
    bevel: 0.004,
    smoothing: 0,
    color: INDIGO,
    bone: hips,
    group: "mane",
    name: "indigo_dorsal_mane",
  });

  b.along(body, 7, (at) => {
    b.spike(at, at, 0.115, 0.035, {
      color: INDIGO_LIGHT,
      group: "mane",
      name: "mane_ridge",
    });
  });

  // A few broad shoulder tufts break the smooth neck silhouette.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const base: [number, number, number] = [
        side * (0.28 + i * 0.035),
        1.26 + i * 0.09,
        0.65 + i * 0.13,
      ];
      b.spike(
        base,
        [side * 0.25, 0.58, 0.22],
        0.18 - i * 0.018,
        0.045,
        {
          bone: neck.joints[Math.min(i, neck.joints.length - 1)],
          color: INDIGO,
          caps: "point",
          group: "mane",
          name: `shoulder_tuft_${side > 0 ? "L" : "R"}_${i}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Face: forehead stripe, eyes, brow ridges, mouth, nose, nostrils, tusk-like teeth, and whisker strokes.

  b.extrude(FOREHEAD_STRIPE, {
    at: [0, 1.38, 1.505],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.018,
    bevel: 0.003,
    color: INK,
    bone: head,
    group: "face",
    name: "forehead_ink_stripe",
  });

  b.extrude(FOREHEAD_STRIPE_INNER, {
    at: [0, 1.39, 1.518],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    color: BELLY_LIGHT,
    bone: head,
    group: "face",
    name: "forehead_cream_stripe",
  });

  const skullSurface = b.surface(skull);
  for (const side of [1, -1]) {
    const eyeHit = skullSurface.nearest([
      side * 0.275,
      1.57,
      1.43,
    ]);

    b.decal(skullSurface, EYE_TEXTURE, {
      at: eyeHit,
      size: [0.16, 0.13],
      mirror: side > 0,
      segments: 7,
      lift: 0.007,
      group: "face",
      name: `woodblock_eye_${side > 0 ? "L" : "R"}`,
    });

    b.part(
      new THREE.CapsuleGeometry(0.018, 0.13, 4, 6),
      INK,
      {
        bone: head,
        at: [side * 0.27, 1.72, 1.425],
        dir: [side * 0.25, 0.18, 1],
        axis: "z",
        flat: true,
        group: "face",
        name: `brow_${side > 0 ? "L" : "R"}`,
      },
    );
  }

  const mouthLine = b.sweep(
    bezier(
      [0, 1.39, 1.43],
      [0, 1.31, 1.58],
      [0, 1.2, 1.72],
    ),
    0.026,
    {
      bone: jaw,
      color: MOUTH,
      section: { ngon: 6 },
      caps: "round",
      group: "face",
      name: "open_mouth_line",
    },
  );

  for (const side of [1, -1]) {
    b.spike(
      [side * 0.105, 1.32, 1.54],
      [side * 0.16, -0.14, 0.18],
      0.12,
      0.025,
      {
        bone: lowerJaw.joints[lowerJaw.joints.length - 1],
        color: BELLY_LIGHT,
        caps: "point",
        group: "face",
        name: `small_tusk_${side > 0 ? "L" : "R"}`,
      },
    );
  }

  const trunkSurface = b.surface(trunk);
  const noseHit = trunkSurface.nearest([0, 0.99, 1.72]);

  b.stick(
    new THREE.SphereGeometry(0.105, 8, 5),
    INK_SOFT,
    noseHit,
    {
      embed: 0.42,
      group: "face",
      name: "nose_ink_patch",
    },
  );

  for (const side of [1, -1]) {
    const nostrilHit = trunkSurface.nearest([
      side * 0.055,
      1.025,
      1.77,
    ]);

    b.stick(
      new THREE.SphereGeometry(0.034, 7, 5),
      MOUTH,
      nostrilHit,
      {
        embed: 0.3,
        group: "face",
        name: `nostril_${side > 0 ? "L" : "R"}`,
      },
    );
  }

  for (const side of [1, -1]) {
    const whiskerBone = upperJaw.tip;
    const baseY = 1.12;
    const baseZ = 1.69;

    b.rod(
      [side * 0.085, baseY + 0.03, baseZ],
      [side * 0.27, baseY + 0.055, baseZ + 0.04],
      0.008,
      {
        bone: whiskerBone,
        color: INK,
        caps: "round",
        group: "face",
        name: `whisker_${side > 0 ? "L" : "R"}_top`,
      },
    );

    b.rod(
      [side * 0.09, baseY - 0.01, baseZ + 0.02],
      [side * 0.3, baseY - 0.02, baseZ + 0.09],
      0.007,
      {
        bone: whiskerBone,
        color: INK,
        caps: "round",
        group: "face",
        name: `whisker_${side > 0 ? "L" : "R"}_middle`,
      },
    );

    b.rod(
      [side * 0.08, baseY - 0.045, baseZ + 0.01],
      [side * 0.245, baseY - 0.08, baseZ - 0.015],
      0.006,
      {
        bone: whiskerBone,
        color: INK,
        caps: "round",
        group: "face",
        name: `whisker_${side > 0 ? "L" : "R"}_bottom`,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Neck collar: a vermilion print band with gold registration studs.

  const collar = b.ring(neck.at(0.62), {
    count: 16,
    radius: 0.235,
    fromDeg: 0,
    toDeg: 360,
    name: "spirit_collar",
    role: "fan",
    group: "trim",
  });

  b.sweep(catmull(collar.items, { closed: true }), 0.022, {
    color: VERMILION,
    section: { ngon: 6 },
    smooth: false,
    group: "trim",
    name: "vermilion_neck_collar",
  });

  for (let i = 0; i < collar.items.length; i += 2) {
    b.stick(
      new THREE.CylinderGeometry(0.027, 0.027, 0.018, 8),
      GOLD,
      collar.items[i],
      {
        embed: 0.42,
        group: "trim",
        name: `collar_rivet_${i}`,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ukiyo-e flank ornaments: side-facing cloud ribbons, wave marks, and stamped red seals.

  function addSideMark(
    side: number,
    z: number,
    y: number,
    outline: [number, number, "sharp"][],
    color: string,
    label: string,
  ) {
    const mark = b.extrude(outline, {
      at: [side * 0.475, y, z],
      x: [0, 0, -side],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.002,
      smoothing: 0,
      color,
      bone: spine.joints[1],
      group: "woodblock_marks",
      name: `${label}_${side > 0 ? "L" : "R"}`,
    });

    b.part(
      new THREE.SphereGeometry(0.034, 6, 4),
      INK,
      {
        bone: spine.joints[1],
        at: [side * 0.486, y + 0.02, z + 0.07],
        scale: [1, 1, 0.35],
        flat: true,
        group: "woodblock_marks",
        name: `${label}_registration_${side > 0 ? "L" : "R"}`,
      },
    );

    return mark;
  }

  for (const side of [1, -1]) {
    addSideMark(side, -0.18, 1.03, CLOUD_RIBBON, BELLY_LIGHT, "cream_cloud");
    addSideMark(side, 0.27, 1.08, WAVE_MARK, INDIGO_LIGHT, "blue_wave");
    addSideMark(side, -0.46, 1.07, CLOUD_RIBBON_SMALL, VERMILION, "red_cloud");

    const seal = b.extrude(
      [
        [-0.055, 0, "sharp"],
        [0.055, 0, "sharp"],
        [0.055, 0.11, "sharp"],
        [-0.055, 0.11, "sharp"],
      ],
      {
        at: [side * 0.486, 1.27, -0.18],
        x: [0, 0, -side],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.002,
        color: VERMILION,
        bone: spine.joints[1],
        group: "woodblock_marks",
        name: `artist_seal_${side > 0 ? "L" : "R"}`,
      },
    );

    b.stick(
      new THREE.BoxGeometry(0.04, 0.012, 0.01),
      BELLY_LIGHT,
      seal.moved(seal.local([0, 0.04, 0.01])),
      {
        embed: 0.1,
        group: "woodblock_marks",
        name: `seal_line_${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // A pale belly bib follows the lower front of the body as a separate carved piece.
  const bellyBib = b.extrude(
    [
      [-0.23, 0, "sharp"],
      [0.23, 0, "sharp"],
      [0.18, 0.18, "sharp"],
      [0.1, 0.31, "sharp"],
      [0, 0.37, "sharp"],
      [-0.1, 0.31, "sharp"],
      [-0.18, 0.18, "sharp"],
    ],
    {
      at: [0, 0.8, 0.47],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.004,
      smoothing: 0,
      color: BELLY_LIGHT,
      bone: spine.joints[2],
      group: "body_marks",
      name: "belly_bib",
    },
  );

  for (let i = 0; i < 4; i++) {
    b.rod(
      bellyBib.local([-0.13 + i * 0.085, 0.04, 0.018]),
      bellyBib.local([-0.105 + i * 0.07, 0.22, 0.018]),
      0.009,
      {
        bone: spine.joints[2],
        color: INDIGO,
        caps: "round",
        group: "body_marks",
        name: `bib_fold_${i}`,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Tail fan and spirit ribbons.

  const tailFan = b.ring(tail.at(1), {
    count: 9,
    radius: 0.035,
    fromDeg: 120,
    toDeg: 240,
    tilt: -12,
    name: "tail_fan",
    names: (i) => `tailFan${i}`,
    joints: 3,
    parent: tail.joints[tail.joints.length - 1],
    role: "fan",
    group: "tail",
  });

  tailFan.items.forEach((item, i) => {
    b.spike(item, item, 0.15 + (i % 3) * 0.018, 0.026, {
      color: i % 2 === 0 ? INDIGO : INK,
      caps: "point",
      group: "tail",
      name: `tail_fan_feather_${i}`,
    });
  });

  const spiritRibbonA = b.sweep(
    bezier(
      [0.02, 1.12, -0.88],
      [0.28, 1.38, -1.05],
      [0.35, 1.55, -0.76],
    ),
    0.018,
    {
      bone: hips,
      color: INDIGO_LIGHT,
      section: { ngon: 6 },
      caps: "round",
      group: "spirit",
      name: "spirit_ribbon_L",
    },
  );

  const spiritRibbonB = b.sweep(
    bezier(
      [-0.02, 1.08, -0.92],
      [-0.27, 1.32, -1.09],
      [-0.31, 1.49, -0.78],
    ),
    0.018,
    {
      bone: hips,
      color: INDIGO_LIGHT,
      section: { ngon: 6 },
      caps: "round",
      group: "spirit",
      name: "spirit_ribbon_R",
    },
  );

  b.spike(
    spiritRibbonA.at(1),
    spiritRibbonA.at(1),
    0.11,
    0.025,
    {
      color: VERMILION,
      caps: "point",
      group: "spirit",
      name: "spirit_ribbon_tassel_L",
    },
  );

  b.spike(
    spiritRibbonB.at(1),
    spiritRibbonB.at(1),
    0.11,
    0.025,
    {
      color: VERMILION,
      caps: "point",
      group: "spirit",
      name: "spirit_ribbon_tassel_R",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Small carved dots on the upper flanks, deliberately sparse like registration marks in a print.

  const bodySurface = b.surface(body);
  const dotHits = bodySurface.scatter(18, {
    rng: rng(41),
    minDist: 0.12,
    filter: (hit) =>
      hit.n.y > -0.15 &&
      Math.abs(hit.at.x) > 0.24 &&
      hit.at.z > -0.4 &&
      hit.at.z < 0.48,
  });

  dotHits.forEach((hit, i) => {
    b.stick(
      new THREE.CylinderGeometry(
        i % 3 === 0 ? 0.042 : 0.03,
        i % 3 === 0 ? 0.042 : 0.03,
        0.012,
        8,
      ),
      i % 4 === 0 ? VERMILION : INDIGO,
      hit,
      {
        embed: 0.44,
        group: "body_marks",
        name: `ink_stamp_${i}`,
      },
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Additional print-like trim: little shoulder medallions and a nose bridge mark.

  for (const side of [1, -1]) {
    const medallion = b.part(
      new THREE.CylinderGeometry(0.075, 0.075, 0.018, 10),
      VERMILION,
      {
        bone: spine.joints[2],
        at: [side * 0.45, 1.19, 0.49],
        dir: [side, 0, 0],
        flat: true,
        group: "trim",
        name: `shoulder_medallion_${side > 0 ? "L" : "R"}`,
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.038, 0.038, 0.02, 8),
      GOLD,
      {
        bone: spine.joints[2],
        at: [side * 0.466, 1.19, 0.49],
        dir: [side, 0, 0],
        flat: true,
        group: "trim",
        name: `shoulder_medallion_center_${side > 0 ? "L" : "R"}`,
      },
    );

    b.rod(
      [side * 0.17, 1.53, 1.48],
      [side * 0.12, 1.6, 1.53],
      0.009,
      {
        bone: head,
        color: VERMILION,
        caps: "round",
        group: "face",
        name: `forehead_brush_${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // Two restrained gold bars at the base of the trunk read like a woodblock registration ornament.
  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.04, 0.105, 0.025),
      GOLD,
      {
        bone: upperJaw.joints[1],
        at: [side * 0.15, 1.41, 1.54],
        rotation: [0, side * 12, side * 8],
        flat: true,
        group: "face",
        name: `trunk_gold_bar_${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // A few pale hoof bands echo the cream flank marks and keep all four contacts readable.
  for (const [chain, point, side, name] of [
    [hindL, hindFootL, 1, "hindL"],
    [hindR, hindFootR, -1, "hindR"],
    [foreL, foreFootL, 1, "foreL"],
    [foreR, foreFootR, -1, "foreR"],
  ] as const) {
    b.part(
      new THREE.BoxGeometry(0.245, 0.026, 0.285),
      BELLY,
      {
        bone: chain.joints[chain.joints.length - 1],
        at: [point[0], point[1] + 0.06, point[2] - 0.015],
        flat: true,
        group: "legs",
        name: `${name}_cream_ankle_mark`,
      },
    );
  }

  // Keep the unused texture referenced in the finished module as a deliberately tiny spirit seal.
  // It is placed on the rear of the skull, where it reads as a hidden printmaker's stamp from a rear view.
  b.decal(skullSurface, SMALL_EYE_TEXTURE, {
    at: skullSurface.nearest([0, 1.56, 0.76]),
    dir: [0, 0, -1],
    up: [0, 1, 0],
    size: [0.07, 0.055],
    segments: 4,
    lift: 0.004,
    group: "spirit",
    name: "hidden_dream_seal",
  });

  return b.root;
}

export default build;
