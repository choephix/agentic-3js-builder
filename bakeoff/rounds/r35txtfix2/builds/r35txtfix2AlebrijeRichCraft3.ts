import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  frame,
  grain,
  limb,
  paint,
  rng,
  spots,
  stripes,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Oaxacan Alebrije Jaguar-Eagle",
  description:
    "A brightly painted wooden alebrije that combines a powerful spotted jaguar body with an eagle's beak, crest, talons, and enormous fanned wings.",
};

export default function build() {
  const b = createBuilder({
    name: "alebrije-jaguar-eagle",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Palette and painted-wood surfaces

  const TURQUOISE = "#16b7a7";
  const TURQUOISE_DARK = "#075e71";
  const AQUA = "#42e0bd";
  const ORANGE = "#f26a32";
  const ORANGE_DARK = "#9b3041";
  const GOLD = "#ffd04b";
  const GOLD_DARK = "#c86a2e";
  const MAGENTA = "#e93f86";
  const MAGENTA_DARK = "#76205f";
  const CREAM = "#fff0b8";
  const CREAM_DARK = "#c87c7c";
  const PURPLE = "#57275f";
  const PURPLE_DARK = "#281936";
  const BLUE = "#4269d6";
  const BLUE_DARK = "#26367f";
  const TEAL_INK = "#063e52";
  const CLAW = "#321a38";
  const WOOD_LINE = "#24122d";

  const TURQUOISE_WOOD = grain(TURQUOISE, AQUA, {
    size: 0.055,
    axis: [0, 0, 1],
    seed: 17,
  });

  const JAGUAR_SPOTS = spots(
    stripes(TURQUOISE_WOOD, [ORANGE, GOLD, MAGENTA], {
      size: 0.34,
      axis: "z",
      width: 0.16,
      wobble: 0.35,
      seed: 8,
    }),
    [GOLD, ORANGE, MAGENTA],
    {
      size: 0.17,
      amount: 0.72,
      rosette: true,
      seed: 21,
    },
  );

  const COAT = cel(
    furEdge(JAGUAR_SPOTS, cel(CREAM, CREAM_DARK), {
      by: "position",
      level: 0.86,
      teeth: 0.12,
      period: 0.11,
      along: [0, 0, 1],
      ink: WOOD_LINE,
      inkWidth: 0.006,
    }),
    TURQUOISE_DARK,
  );

  const LEG_PAINT = cel(
    stripes(JAGUAR_SPOTS, [MAGENTA, GOLD, AQUA], {
      size: 0.22,
      axis: "y",
      width: 0.24,
      wobble: 0.2,
      seed: 37,
    }),
    "#064e61",
  );

  const NECK_PAINT = cel(
    stripes(JAGUAR_SPOTS, [GOLD, MAGENTA, CREAM], {
      size: 0.24,
      axis: "z",
      width: 0.2,
      wobble: 0.22,
      seed: 42,
    }),
    "#075568",
  );

  const WING_PAINT = cel(
    stripes(
      grain(MAGENTA, "#ff6b9c", {
        size: 0.06,
        axis: [0, 1, 0],
        seed: 51,
      }),
      [GOLD, AQUA, ORANGE],
      {
        size: 0.25,
        axis: "x",
        width: 0.3,
        wobble: 0.18,
        seed: 52,
      },
    ),
    MAGENTA_DARK,
  );

  const WING_EDGE = cel(
    stripes(GOLD, [ORANGE, CREAM, MAGENTA], {
      size: 0.18,
      axis: "z",
      width: 0.38,
      wobble: 0.1,
      seed: 61,
    }),
    GOLD_DARK,
  );

  const BEAK_PAINT = cel(
    grain(GOLD, ORANGE, {
      size: 0.045,
      axis: [0, 0, 1],
      seed: 71,
    }),
    GOLD_DARK,
  );

  const LOWER_BEAK_PAINT = cel(
    stripes(ORANGE, [GOLD, MAGENTA], {
      size: 0.11,
      axis: "z",
      width: 0.36,
      wobble: 0.05,
      seed: 72,
    }),
    ORANGE_DARK,
  );

  const CREAM_PAINT = cel(CREAM, CREAM_DARK);
  const ORANGE_PAINT = cel(ORANGE, ORANGE_DARK);
  const GOLD_PAINT = cel(GOLD, GOLD_DARK);
  const MAGENTA_PAINT = cel(MAGENTA, MAGENTA_DARK);
  const AQUA_PAINT = cel(AQUA, TURQUOISE_DARK);
  const BLUE_PAINT = cel(BLUE, BLUE_DARK);
  const PURPLE_PAINT = cel(PURPLE, PURPLE_DARK);

  const BODY_PATTERN = paint((p, n) => {
    const warmChest = p.z > 0.46 && p.y > 0.95 && n.z > 0.2;
    return warmChest ? CREAM_PAINT : COAT;
  });

  const FEATHER_PATTERN = paint((p, n) => {
    const high = n.y > 0.35;
    const front = n.z > 0.1;
    if (high && front) return GOLD_PAINT;
    if (high) return AQUA_PAINT;
    return WING_PAINT;
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Surface drawings

  const EYE_TEXTURE = animeEye({
    iris: "#1de0d4",
    irisLight: "#d5fff0",
    irisDark: "#126a9e",
    ink: INK,
    blush: "#ff6d9b",
    size: 512,
  });

  const ROSETTE_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="r" cx="38%" cy="32%">
          <stop offset="0" stop-color="#fff5a3"/>
          <stop offset="0.48" stop-color="#ffd04b"/>
          <stop offset="1" stop-color="#d94b6f"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="59" fill="#24122d"/>
      <circle cx="64" cy="64" r="52" fill="#e93f86" stroke="#ffd04b" stroke-width="4"/>
      <path d="M64 16 L76 48 L111 42 L84 65 L105 94 L73 80 L64 113 L53 80 L22 96 L44 66 L17 42 L52 48Z"
        fill="url(#r)" stroke="#24122d" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="64" cy="64" r="19" fill="#16b7a7" stroke="#24122d" stroke-width="4"/>
      <circle cx="57" cy="56" r="5" fill="#fff0b8"/>
      <circle cx="70" cy="70" r="4" fill="#ff6b9c"/>
    </svg>`,
    { size: 256 },
  );

  const FEATHER_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
      <path d="M32 124 C16 107 8 82 16 49 C20 30 27 14 32 4 C39 17 49 31 52 51 C58 84 47 108 32 124Z"
        fill="#e93f86" stroke="#24122d" stroke-width="4" stroke-linejoin="round"/>
      <path d="M32 116 L32 16" stroke="#ffd04b" stroke-width="5"/>
      <path d="M28 96 L13 80 M28 78 L12 62 M29 60 L16 45 M36 95 L51 78 M36 77 L53 59 M36 59 L49 43"
        stroke="#42e0bd" stroke-width="5" stroke-linecap="round"/>
      <path d="M18 106 Q31 113 44 106" fill="none" stroke="#fff0b8" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const CREST_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 160">
      <path d="M40 156 C16 130 14 87 28 44 L40 6 L52 44 C66 87 64 130 40 156Z"
        fill="#ffd04b" stroke="#24122d" stroke-width="5"/>
      <path d="M40 145 L40 22" stroke="#e93f86" stroke-width="6"/>
      <path d="M35 105 L22 89 M35 83 L20 65 M45 105 L58 89 M45 83 L60 64"
        stroke="#16b7a7" stroke-width="6" stroke-linecap="round"/>
      <circle cx="40" cy="48" r="8" fill="#f26a32" stroke="#24122d" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const CHEST_MARK_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="75" fill="#fff0b8" stroke="#24122d" stroke-width="6"/>
      <path d="M80 18 L91 62 L137 80 L91 91 L80 139 L69 91 L23 80 L69 62Z"
        fill="#e93f86" stroke="#24122d" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="80" cy="80" r="19" fill="#16b7a7" stroke="#24122d" stroke-width="5"/>
      <circle cx="73" cy="73" r="6" fill="#fff0b8"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one root, a central body chain, head and jaw, wings, tail, and four articulated legs

  const hips = b.joint("hips", {
    at: [0, 1.02, -0.3],
    dir: [0, 0, 1],
    role: "spine",
    group: "skeleton",
  });

  const spinePath = catmull([
    [0, 0.98, -0.62],
    [0, 1.0, -0.28],
    [0, 1.06, 0.04],
    [0, 1.15, 0.34],
    [0, 1.27, 0.6],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineBase", "spineMid", "chest", "withers", "neckBase"],
    role: "spine",
    group: "skeleton",
  });

  const neckPath = catmull([
    spine.tip!.at,
    [0, 1.34, 0.72],
    [0, 1.45, 0.83],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.tip!,
    names: ["neck1", "neck2", "neckTip"],
    role: "neck",
    group: "skeleton",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: neck.tip!.at,
    dir: [0, 0, 1],
    role: "head",
    group: "skeleton",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.31, 1.0],
    aim: [0, 1.23, 1.36],
    role: "jaw",
    group: "skeleton",
  });

  const tailPath = catmull([
    [0, 1.0, -0.58],
    [0.02, 1.01, -0.88],
    [0.02, 1.08, -1.18],
    [0.08, 1.2, -1.47],
    [0.2, 1.34, -1.68],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tailBase", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    group: "skeleton",
  });

  const wingLPath = catmull([
    [0.27, 1.3, 0.18],
    [0.55, 1.48, 0.1],
    [0.88, 1.67, -0.02],
    [1.2, 1.72, -0.14],
    [1.48, 1.62, -0.27],
  ]);

  const wingRPath = catmull([
    [-0.27, 1.3, 0.18],
    [-0.55, 1.48, 0.1],
    [-0.88, 1.67, -0.02],
    [-1.2, 1.72, -0.14],
    [-1.48, 1.62, -0.27],
  ]);

  const wingL = b.chain("wingL", wingLPath, {
    parent: spine.joints[2],
    names: ["wingL", "wingL2", "wingL3", "wingL4", "wingLTip"],
    role: "wing",
    group: "skeleton",
  });

  const wingR = b.chain("wingR", wingRPath, {
    parent: spine.joints[2],
    names: ["wingR", "wingR2", "wingR3", "wingR4", "wingRTip"],
    role: "wing",
    group: "skeleton",
  });

  const hindLTarget = [0.34, 0.14, -0.56] as const;
  const hindRTarget = [-0.34, 0.14, -0.56] as const;
  const foreLTarget = [0.34, 0.14, 0.56] as const;
  const foreRTarget = [-0.34, 0.14, 0.56] as const;

  const hindL = b.chain(
    "hindL",
    limb(
      [0.28, 0.96, -0.4],
      hindLTarget,
      [0.38, 0.34, 0.25],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    ),
    {
      parent: spine.joints[0],
      names: ["hipHL", "kneeHL", "ankleHL", "pawHL"],
      role: "leg",
      contact: hindLTarget,
      group: "skeleton",
    },
  );

  const hindR = b.chain(
    "hindR",
    limb(
      [-0.28, 0.96, -0.4],
      hindRTarget,
      [0.38, 0.34, 0.25],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    ),
    {
      parent: spine.joints[0],
      names: ["hipHR", "kneeHR", "ankleHR", "pawHR"],
      role: "leg",
      contact: hindRTarget,
      group: "skeleton",
    },
  );

  const foreL = b.chain(
    "foreL",
    limb(
      [0.27, 1.12, 0.4],
      foreLTarget,
      [0.38, 0.35, 0.29],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    ),
    {
      parent: spine.joints[3],
      names: ["shoulderFL", "elbowFL", "wristFL", "pawFL"],
      role: "leg",
      contact: foreLTarget,
      group: "skeleton",
    },
  );

  const foreR = b.chain(
    "foreR",
    limb(
      [-0.27, 1.12, 0.4],
      foreRTarget,
      [0.38, 0.35, 0.29],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    ),
    {
      parent: spine.joints[3],
      names: ["shoulderFR", "elbowFR", "wristFR", "pawFR"],
      role: "leg",
      contact: foreRTarget,
      group: "skeleton",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Main body, neck, tail, wings, and legs

  const body = b.sweep(
    spine,
    (t) => [0.3 + 0.04 * Math.sin(t * Math.PI), 0.31 + 0.055 * Math.sin(t * Math.PI)],
    {
      color: BODY_PATTERN,
      sides: 10,
      caps: "round",
      section: "circle",
      name: "paintedJaguarBody",
      group: "body",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [0.22 - 0.025 * t, 0.25 - 0.025 * t],
    {
      color: NECK_PAINT,
      sides: 9,
      caps: "round",
      section: "circle",
      name: "paintedEagleNeck",
      group: "body",
    },
  );

  const tailPaint = cel(
    stripes(COAT, [MAGENTA, GOLD, CREAM], {
      size: 0.21,
      axis: "z",
      width: 0.34,
      wobble: 0.12,
      seed: 77,
    }),
    TURQUOISE_DARK,
  );

  const tailTube = b.sweep(
    tail,
    (t) => 0.145 * (1 - t) + 0.025,
    {
      color: tailPaint,
      sides: 8,
      section: "circle",
      caps: { start: "round", end: "point" },
      bands: [
        [0.7, GOLD_PAINT],
        [0.84, MAGENTA_PAINT],
        [0.94, CREAM_PAINT],
      ],
      name: "ringedJaguarTail",
      group: "tail",
    },
  );

  const wingLTube = b.sweep(wingL, (t) => 0.06 - 0.018 * t, {
    color: WING_PAINT,
    sides: 8,
    section: "circle",
    caps: "round",
    name: "wingLArm",
    group: "wings",
  });

  const wingRTube = b.sweep(wingR, (t) => 0.06 - 0.018 * t, {
    color: WING_PAINT,
    sides: 8,
    section: "circle",
    caps: "round",
    name: "wingRArm",
    group: "wings",
  });

  function wingMembrane(
    side: number,
    chain: typeof wingL,
    bone: typeof wingL.joints[0],
    label: string,
  ) {
    const leading = catmull([
      chain.at(0).at,
      chain.at(0.28).at.clone().add(new THREE.Vector3(0, 0.07, 0.025)),
      chain.at(0.55).at.clone().add(new THREE.Vector3(0, 0.08, 0.02)),
      chain.at(0.8).at.clone().add(new THREE.Vector3(0, 0.05, 0)),
      chain.at(1).at.clone().add(new THREE.Vector3(0, 0.02, 0)),
    ]);

    const trailing = catmull([
      chain.at(0).at.clone().add(new THREE.Vector3(0, -0.08, -0.12)),
      chain.at(0.28).at.clone().add(new THREE.Vector3(0, -0.13, -0.15)),
      chain.at(0.55).at.clone().add(new THREE.Vector3(0, -0.17, -0.16)),
      chain.at(0.8).at.clone().add(new THREE.Vector3(0, -0.18, -0.18)),
      chain.at(1).at.clone().add(new THREE.Vector3(0, -0.17, -0.18)),
    ]);

    b.membrane(leading, trailing, {
      color: FEATHER_PATTERN,
      thickness: 0.018,
      rows: 5,
      cols: 12,
      scallop: 0.08,
      bone,
      name: `${label}ColorMembrane`,
      group: "wings",
    });

    const edge = b.sweep(leading, 0.018, {
      color: WING_EDGE,
      sides: 7,
      caps: "round",
      bone,
      name: `${label}LeadingEdge`,
      group: "wings",
    });

    let quillIndex = 0;
    b.along(edge, 7, (at) => {
      const i = quillIndex++;
      const color = i % 3 === 0 ? ORANGE_PAINT : i % 3 === 1 ? GOLD_PAINT : CREAM_PAINT;
      b.spike(at, [0, 1, 0], 0.08 + (i % 2) * 0.018, 0.014, {
        color,
        name: `${label}Quill${i}`,
        group: "wings",
      });
    });

    const cardFrames = [0.32, 0.5, 0.68, 0.84].map((t) =>
      frame(chain.at(t).at, [0, 1, 0]),
    );

    b.cards(cardFrames, FEATHER_TEXTURE, {
      size: [0.14, 0.3],
      lean: 66,
      flow: [side * 0.75, -0.08, -0.45],
      bend: 22,
      vary: 0.16,
      spin: 10,
      mirror: side < 0,
      sink: 0.08,
      color: "#ffffff",
      bone,
      group: "wing-feather-cards",
    });
  }

  wingMembrane(1, wingL, wingL.joints[0], "wingL");
  wingMembrane(-1, wingR, wingR.joints[0], "wingR");

  function addPrimaryFeathers(side: number, chain: typeof wingL, label: string) {
    const featherColors = [GOLD_PAINT, ORANGE_PAINT, CREAM_PAINT, MAGENTA_PAINT, AQUA_PAINT, GOLD_PAINT];

    for (let i = 0; i < 6; i++) {
      const t = 0.22 + i * 0.115;
      const base = chain.at(t).at.clone();
      const tip = new THREE.Vector3(
        side * (0.82 + i * 0.17),
        1.58 + 0.035 * Math.sin(i * 1.4),
        -0.26 - i * 0.135,
      );
      const control = base
        .clone()
        .lerp(tip, 0.48)
        .add(new THREE.Vector3(0, 0.1 + 0.015 * i, -0.08));

      b.sweep(bezier(base, control, tip), [0.045 - i * 0.003, 0], {
        color: featherColors[i],
        sides: 7,
        caps: { start: "round", end: "point" },
        bone: chain.joints[Math.min(i + 1, chain.joints.length - 1)],
        name: `${label}Primary${i + 1}`,
        group: "wings",
      });

      const lowerBase = base.clone().add(new THREE.Vector3(0, -0.035, -0.035));
      const lowerTip = tip.clone().add(new THREE.Vector3(0, -0.055, -0.045));
      b.sweep(
        bezier(
          lowerBase,
          lowerBase.clone().lerp(lowerTip, 0.55).add(new THREE.Vector3(0, 0.045, -0.04)),
          lowerTip,
        ),
        [0.022, 0],
        {
          color: i % 2 === 0 ? PURPLE_PAINT : BLUE_PAINT,
          sides: 6,
          caps: { start: "round", end: "point" },
          bone: chain.joints[Math.min(i + 1, chain.joints.length - 1)],
          name: `${label}ShadowFeather${i + 1}`,
          group: "wings",
        },
      );
    }
  }

  addPrimaryFeathers(1, wingL, "wingL");
  addPrimaryFeathers(-1, wingR, "wingR");

  function addLeg(
    chain: typeof hindL,
    label: string,
    front: boolean,
  ) {
    const tube = b.sweep(
      chain,
      (t) => (front ? 0.095 : 0.115) - 0.04 * t,
      {
        color: LEG_PAINT,
        sides: 8,
        section: "circle",
        caps: "round",
        bands: [
          [0.42, MAGENTA_PAINT],
          [0.67, GOLD_PAINT],
          [0.86, CREAM_PAINT],
        ],
        name: `${label}PaintedLeg`,
        group: "legs",
      },
    );

    const jointRadius = front ? 0.085 : 0.1;
    b.part(new THREE.SphereGeometry(1, 8, 6), MAGENTA_PAINT, {
      frame: chain.joints[1],
      scale: [jointRadius, jointRadius * 0.95, jointRadius],
      name: `${label}KneeCap`,
      group: "legs",
    });

    b.part(new THREE.SphereGeometry(1, 8, 6), GOLD_PAINT, {
      frame: chain.joints[2],
      scale: [jointRadius * 0.72, jointRadius * 0.72, jointRadius * 0.72],
      name: `${label}AnkleCap`,
      group: "legs",
    });

    b.part(new THREE.SphereGeometry(1, 10, 7), COAT, {
      frame: chain.tip!,
      scale: front ? [0.13, 0.11, 0.17] : [0.15, 0.12, 0.19],
      name: `${label}Paw`,
      group: "legs",
    });

    const padAt = chain.tip.at.clone().add(new THREE.Vector3(0, -0.055, 0.075));
    b.part(new THREE.SphereGeometry(1, 8, 6), MAGENTA_PAINT, {
      bone: chain.tip,
      at: padAt,
      scale: [0.075, 0.026, 0.055],
      name: `${label}Pad`,
      group: "legs",
    });

    const cuff = b.surface(tube).loop(chain.joints[1], {
      lift: 0.009,
    });
    b.sweep(cuff, 0.019, {
      color: GOLD_PAINT,
      sides: 7,
      caps: "none",
      name: `${label}KneeCuff`,
      group: "legs",
    });

    for (let i = 0; i < 3; i++) {
      const toeBase = chain.tip!.at.clone().add(
        new THREE.Vector3((i - 1) * 0.055, -0.005, 0.08),
      );
      b.spike(toeBase, [0, -0.02, 1], front ? 0.13 : 0.15, 0.022, {
        color: CLAW,
        bone: chain.tip!,
        name: `${label}Talon${i + 1}`,
        group: "talons",
      });
    }

    return tube;
  }

  const hindLTube = addLeg(hindL, "hindL", false);
  const hindRTube = addLeg(hindR, "hindR", false);
  const foreLTube = addLeg(foreL, "foreL", true);
  const foreRTube = addLeg(foreR, "foreR", true);

  // ---------------------------------------------------------------------------------------------------------------
  // Face: skull, muzzle, eye decals, open beak, ears, and painted head ornaments

  const skull = b.part(
    new THREE.SphereGeometry(1, 16, 12),
    BODY_PATTERN,
    {
      frame: head,
      scale: [0.35, 0.34, 0.36],
      name: "JaguarEagleSkull",
      group: "face",
    },
  );

  const muzzleAt = new THREE.Vector3(0, 1.47, 1.08);
  const muzzle = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    CREAM_PAINT,
    {
      frame: head.moved(muzzleAt),
      scale: [0.235, 0.2, 0.16],
      name: "CreamMuzzle",
      group: "face",
    },
  );

  const skullSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const eyeHit = skullSurface.around(head.at).at(side * 27, 7);
    if (eyeHit) {
      b.decal(skull, EYE_TEXTURE, {
        at: eyeHit,
        dir: eyeHit.n,
        up: [0, 1, 0],
        size: [0.145, 0.19],
        segments: 9,
        lift: 0.005,
        mirror: side > 0,
        name: side > 0 ? "LeftAnimeEye" : "RightAnimeEye",
        group: "face",
      });
    }
  }

  const foreheadHit = skullSurface.around(head.at).at(0, 35);
  if (foreheadHit) {
    b.decal(skull, ROSETTE_TEXTURE, {
      at: foreheadHit,
      dir: foreheadHit.n,
      up: [0, 1, 0],
      size: [0.15, 0.15],
      segments: 8,
      lift: 0.006,
      name: "ForeheadRosette",
      group: "face",
    });
  }

  const upperBeak = b.extrude(
    [
      [0, 0, "sharp"],
      [0.16, 0.055],
      [0.34, 0.025],
      [0.47, -0.055, "sharp"],
      [0.29, -0.125],
      [0.03, -0.075],
    ],
    {
      at: [0, 1.55, 1.08],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.14, 0.085],
      bevel: 0.009,
      smoothing: 1,
      color: BEAK_PAINT,
      bone: head,
      name: "UpperEagleBeak",
      group: "beak",
    },
  );

  const lowerBeak = b.extrude(
    [
      [0, 0.015, "sharp"],
      [0.14, 0.035],
      [0.35, -0.02],
      [0.43, -0.095, "sharp"],
      [0.22, -0.145],
      [0.02, -0.095],
    ],
    {
      at: jaw.at,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.12, 0.075],
      bevel: 0.007,
      smoothing: 1,
      color: LOWER_BEAK_PAINT,
      bone: jaw,
      name: "LowerOpenJawBeak",
      group: "beak",
    },
  );

  b.extrude(
    [
      [0, 0.015, "sharp"],
      [0.13, 0.04],
      [0.36, 0.0],
      [0.42, -0.035, "sharp"],
      [0.18, -0.06],
      [0, -0.04],
    ],
    {
      at: [0, 1.445, 1.105],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      smoothing: 0,
      color: PURPLE_DARK,
      bone: head,
      name: "OpenMouthInterior",
      group: "face",
    },
  );

  b.sweep(
    bezier(
      [0, 1.445, 1.11],
      [0, 1.42, 1.28],
      [0, 1.41, 1.45],
    ),
    0.011,
    {
      color: INK,
      sides: 6,
      caps: "round",
      bone: head,
      name: "MouthInkLine",
      group: "face",
    },
  );

  const tongue = b.sweep(
    bezier(
      [0, 1.4, 1.14],
      [0, 1.365, 1.26],
      [0, 1.35, 1.38],
    ),
    [0.026, 0.006],
    {
      color: MAGENTA_PAINT,
      sides: 7,
      caps: { start: "round", end: "point" },
      bone: jaw,
      name: "PaintedTongue",
      group: "face",
    },
  );

  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 5), INK, {
      bone: head,
      at: [side * 0.085, 1.57, 1.27],
      name: side > 0 ? "LeftBeakNostril" : "RightBeakNostril",
      group: "face",
    });
  }

  const earOutline: ([number, number] | [number, number, "sharp"])[] = [
    [0, 0, "sharp"],
    [0.18, 0.035],
    [0.14, 0.14],
    [0.075, 0.25, "sharp"],
    [0.015, 0.15],
  ];

  const innerEarOutline: ([number, number] | [number, number, "sharp"])[] = [
    [0.015, 0.035],
    [0.13, 0.055],
    [0.095, 0.13],
    [0.07, 0.19, "sharp"],
    [0.04, 0.12],
  ];

  for (const side of [1, -1]) {
    b.extrude(earOutline, {
      at: [side * 0.255, 1.57, 0.77],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.008,
      smoothing: 1,
      color: COAT,
      bone: head,
      name: side > 0 ? "LeftJaguarEar" : "RightJaguarEar",
      group: "head-ornaments",
    });

    b.extrude(innerEarOutline, {
      at: [side * 0.27, 1.59, 0.795],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: MAGENTA_PAINT,
      bone: head,
      name: side > 0 ? "LeftEarInner" : "RightEarInner",
      group: "head-ornaments",
    });

    b.part(new THREE.SphereGeometry(0.025, 7, 5), GOLD_PAINT, {
      bone: head,
      at: [side * 0.31, 1.69, 0.86],
      name: side > 0 ? "LeftEarJewel" : "RightEarJewel",
      group: "head-ornaments",
    });
  }

  // A row of chunky, hand-carved crest cones makes the jaguar head read as an eagle hybrid.
  const crestBases = [
    [0, 1.7, 0.67],
    [0, 1.76, 0.58],
    [0, 1.82, 0.49],
    [0, 1.87, 0.39],
    [0, 1.91, 0.29],
  ] as const;

  const crestColors = [MAGENTA_PAINT, GOLD_PAINT, AQUA_PAINT, ORANGE_PAINT, CREAM_PAINT];

  crestBases.forEach((base, i) => {
    b.spike(base, [0, 1, -0.1], 0.22 + i * 0.018, 0.055 - i * 0.004, {
      color: crestColors[i],
      bone: head,
      name: `CrestBlade${i + 1}`,
      group: "head-ornaments",
    });
  });

  const crestFrames = [
    [0, 1.71, 0.59],
    [0, 1.79, 0.5],
    [0, 1.86, 0.41],
  ].map((at) => frame(at, [0, 1, 0]));

  b.cards(crestFrames, CREST_TEXTURE, {
    size: [0.13, 0.3],
    lean: 8,
    flow: [0, 0, -1],
    bend: 20,
    vary: 0.12,
    spin: 12,
    sink: 0.06,
    color: "#ffffff",
    bone: head,
    group: "head-ornaments",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Chest bib and painted body emblems

  b.extrude(
    [
      [-0.2, 0, "sharp"],
      [0.2, 0, "sharp"],
      [0.17, 0.16],
      [0.1, 0.32, "sharp"],
      [-0.1, 0.32, "sharp"],
      [-0.17, 0.16],
    ],
    {
      at: [0, 1.08, 0.72],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.018, 0.01],
      bevel: 0.006,
      smoothing: 1,
      color: CREAM_PAINT,
      bone: spine.joints[3],
      name: "CreamChestBib",
      group: "body-ornaments",
    },
  );

  const bodySurface = b.surface(body);
  const combinedSurface = b.surface([body, neckTube]);

  const chestHit = combinedSurface.around([0, 1.12, 0.2]).at(0, 7);
  if (chestHit) {
    b.decal(body, CHEST_MARK_TEXTURE, {
      at: chestHit,
      dir: chestHit.n,
      up: [0, 1, 0],
      size: [0.2, 0.2],
      segments: 9,
      lift: 0.008,
      name: "ChestSunEmblem",
      group: "body-ornaments",
    });
  }

  const sideRosettes = [
    { side: 1, azimuth: 90, elevation: 18, name: "LeftShoulderRosette" },
    { side: -1, azimuth: -90, elevation: 18, name: "RightShoulderRosette" },
    { side: 1, azimuth: 76, elevation: -6, name: "LeftFlankRosette" },
    { side: -1, azimuth: -76, elevation: -6, name: "RightFlankRosette" },
  ];

  for (const ornament of sideRosettes) {
    const hit = bodySurface.around([0, 1.05, -0.05]).at(
      ornament.azimuth,
      ornament.elevation,
    );

    if (!hit) continue;

    b.decal(body, ROSETTE_TEXTURE, {
      at: hit,
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.17, 0.17],
      segments: 8,
      lift: 0.006,
      mirror: ornament.side < 0,
      name: ornament.name,
      group: "body-ornaments",
    });

    b.stick(
      new THREE.CylinderGeometry(0.078, 0.078, 0.018, 10),
      GOLD_PAINT,
      hit,
      {
        embed: 0.42,
        spin: ornament.side * 17,
        name: `${ornament.name}Raised`,
        group: "body-ornaments",
      },
    );

    const centerPoint = hit.at.clone().addScaledVector(hit.n, 0.011);
    const centerHit = hit.moved(centerPoint);

    b.stick(
      new THREE.CylinderGeometry(0.03, 0.03, 0.022, 8),
      AQUA_PAINT,
      centerHit,
      {
        embed: 0.35,
        name: `${ornament.name}Center`,
        group: "body-ornaments",
      },
    );

    b.ring(
      hit,
      {
        count: 6,
        radius: 0.067,
        tilt: 22,
        fromDeg: 0,
        toDeg: 360,
      },
      (item) => {
        b.stick(new THREE.SphereGeometry(0.013, 7, 5), MAGENTA_PAINT, item, {
          embed: 0.25,
          name: `${ornament.name}Petal`,
          group: "body-ornaments",
        });
      },
    );
  }

  // Small raised rosettes scattered over the visible painted wood make the creature feel hand-decorated.
  const scatteredRosettes = bodySurface.scatter(15, {
    rng: rng(404),
    minDist: 0.17,
    filter: (hit) => hit.n.y > -0.45 && hit.at.z > -0.55,
  });

  scatteredRosettes.forEach((hit, i) => {
    const diskColor = i % 3 === 0 ? GOLD_PAINT : i % 3 === 1 ? ORANGE_PAINT : MAGENTA_PAINT;

    b.stick(
      new THREE.CylinderGeometry(0.038 + (i % 2) * 0.009, 0.038 + (i % 2) * 0.009, 0.009, 8),
      diskColor,
      hit,
      {
        embed: 0.5,
        spin: i * 29,
        name: `RaisedSpot${i + 1}`,
        group: "body-ornaments",
      },
    );

    if (i < 8) {
      b.ring(
        hit,
        {
          count: 5,
          radius: 0.043,
          tilt: 28,
        },
        (item) => {
          b.stick(
            new THREE.SphereGeometry(0.009, 6, 4),
            i % 2 === 0 ? CREAM_PAINT : AQUA_PAINT,
            item,
            {
              embed: 0.2,
              name: `RaisedSpot${i + 1}Petal`,
              group: "body-ornaments",
            },
          );
        },
      );
    }
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Neck collar, tail tuft, and decorative feathers

  const collarLoop = b.surface(neckTube).loop(neck.joints[1], {
    lift: 0.012,
  });

  b.sweep(collarLoop, 0.026, {
    color: MAGENTA_PAINT,
    sides: 8,
    caps: "none",
    name: "PaintedNeckCollar",
    group: "body-ornaments",
  });

  const collarStuds = b.along(collarLoop, 10, (at) => {
    const i = Math.round(at.t * 9);
    b.stick(
      new THREE.SphereGeometry(0.014, 7, 5),
      i % 2 === 0 ? GOLD_PAINT : AQUA_PAINT,
      at,
      {
        embed: 0.18,
        name: `CollarStud${i + 1}`,
        group: "body-ornaments",
      },
    );
  });

  const tailTuftPoint = tail.at(0.91);
  const tailTuft = b.ring(
    tailTuftPoint,
    {
      count: 9,
      radius: 0.075,
      fromDeg: 20,
      toDeg: 340,
      tilt: -18,
      name: "tailTuft",
      role: "fan",
      group: "tail",
    },
    (item) => {
      b.spike(
        item,
        item,
        0.12 + (item.i % 3) * 0.022,
        0.019,
        {
          color: [GOLD_PAINT, MAGENTA_PAINT, CREAM_PAINT][item.i % 3],
          name: `TailTuftFeather${item.i + 1}`,
          group: "tail",
        },
      );
    },
  );

  // A few shorter fan feathers rise from the tail root, echoing the eagle wing language.
  for (let i = 0; i < 5; i++) {
    const root = tail.at(0.62 + i * 0.045).at.clone();
    const tip = root.clone().add(
      new THREE.Vector3(
        (i - 2) * 0.045,
        0.14 + (i % 2) * 0.045,
        -0.08 - i * 0.025,
      ),
    );

    b.sweep(
      bezier(
        root,
        root.clone().lerp(tip, 0.5).add(new THREE.Vector3(0, 0.06, -0.04)),
        tip,
      ),
      [0.025, 0],
      {
        color: i % 2 === 0 ? AQUA_PAINT : MAGENTA_PAINT,
        sides: 7,
        caps: { start: "round", end: "point" },
        bone: tail.joints[Math.min(3, tail.joints.length - 1)],
        name: `TailCrownFeather${i + 1}`,
        group: "tail",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Painted wooden pins and small highlights along the wings

  function addWingPins(side: number, chain: typeof wingL, label: string) {
    const colors = [GOLD_PAINT, AQUA_PAINT, ORANGE_PAINT, CREAM_PAINT, MAGENTA_PAINT];

    for (let i = 0; i < 5; i++) {
      const t = 0.18 + i * 0.16;
      const at = chain.at(t);

      b.part(new THREE.SphereGeometry(1, 7, 5), colors[i], {
        bone: at.bone ?? chain.joints[Math.min(i, chain.joints.length - 1)],
        at: at.at.clone().add(new THREE.Vector3(0, 0.025, 0)),
        scale: [0.035, 0.035, 0.035],
        name: `${label}PaintedPin${i + 1}`,
        group: "wings",
      });

      b.spike(at, [0, 1, 0], 0.065 + i * 0.008, 0.012, {
        color: colors[(i + 2) % colors.length],
        name: `${label}UpwardQuill${i + 1}`,
        group: "wings",
      });
    }
  }

  addWingPins(1, wingL, "wingL");
  addWingPins(-1, wingR, "wingR");

  // A few bold ink-like rods emphasize the carved, graphic silhouette around the shoulders.
  b.sweep(
    catmull([
      [0.25, 1.34, 0.2],
      [0.55, 1.51, 0.105],
      [0.88, 1.69, -0.02],
      [1.2, 1.74, -0.14],
    ]),
    0.012,
    {
      color: INK,
      sides: 6,
      caps: "round",
      bone: wingL.joints[0],
      name: "LeftWingInkEdge",
      group: "wings",
    },
  );

  b.sweep(
    catmull([
      [-0.25, 1.34, 0.2],
      [-0.55, 1.51, 0.105],
      [-0.88, 1.69, -0.02],
      [-1.2, 1.74, -0.14],
    ]),
    0.012,
    {
      color: INK,
      sides: 6,
      caps: "round",
      bone: wingR.joints[0],
      name: "RightWingInkEdge",
      group: "wings",
    },
  );

  return b.root;
}
