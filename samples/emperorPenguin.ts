import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { catmull } from "../src/path";
import { mix, paint, smoothstep } from "../src/paint";
import type { Chain } from "../src/skeleton";

export const meta = {
  name: "Emperor Penguin",
  description:
    "An adult emperor penguin (Aptenodytes forsteri) standing 1.15 m tall in upright posture: dense midnight-black coat, lustrous white belly, golden-yellow auroral ear patches flowing into a delicate pale-primrose upper breast, slender decurved bill with vivid coral-pink mandibular plates, rigid hydrofoil flippers abducted in display rest pose, robust short tarsi with webbed clawed feet planted on ice, and a stiff retroverted prop tail.",
  builtBy: "Gemini 3.8 Flash",
};

// =============================================================================
// COLOR PALETTE
// =============================================================================
const BLACK = "#121418"; // Dense midnight black dorsal plumage and hood
const CHARCOAL = "#20232a"; // Slate-charcoal flipper margins and keel accents
const WHITE = "#f7f8fa"; // Pure snow white ventral plumage
const BREAST_YELLOW = "#fee57e"; // Soft primrose yellow upper chest
const AURORA_GOLD = "#ffb01e"; // Rich vibrant golden auricular patch
const AURORA_ORANGE = "#ff5b00"; // Fiery orange crescent at posterior ear patch
const BEAK_BLACK = "#0f1013"; // Culmen and upper beak keratin
const MANDIBLE_STRIPE = "#ff3b68"; // Vivid coral-pink mandibular plate
const EYE_DARK = "#1a120b"; // Deep dark brown iris
const EYE_HIGHLIGHT = "#ffffff"; // Specular highlight
const LEG_SKIN = "#2a2c32"; // Dark slate scaled leg skin and webbing
const CLAW = "#0a0a0d"; // Black keratin claws

export default function build() {
  const b = createBuilder({ name: "emperorPenguin", detail: 0.88 });

  // ---------------------------------------------------------------------------
  // SKELETON
  // ---------------------------------------------------------------------------
  // Penguin stands upright. Total height ~1.15m. Lowest point touches y = 0.
  const hips = b.joint("hips", { at: [0, 0.28, -0.02], role: "spine", group: "body" });

  const spineStations = [
    [0, 0.28, -0.02],
    [0, 0.46, 0.01],
    [0, 0.67, 0.02],
    [0, 0.83, -0.01],
  ] as const;

  const spine = b.chain("spine", spineStations, {
    parent: hips,
    role: "spine",
    names: ["lumbar", "chest", "shoulders"],
    group: "body",
  });

  const neckStations = [
    [0, 0.83, -0.01],
    [0, 0.94, -0.005],
    [0, 1.02, 0.01],
  ] as const;

  const neck = b.chain("neck", catmull(neckStations), {
    parent: spine.joints[2], // shoulders
    role: "neck",
    names: ["neckLower", "neckUpper"],
    group: "neck",
  });

  // Head joint: aimed FORWARD (+Z)
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.02, 0.01],
    dir: [0, 0.04, 1.0],
    role: "head",
    group: "head",
  });

  // Jaw (lower mandible) separate joint aimed forward
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.08, -0.022]),
    dir: head.dir([0, 0.99, -0.08]),
    role: "jaw",
    group: "head",
  });

  // Tail: short, stiff wedge resting firmly on ice at y = 0
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.25, -0.12],
      [0, 0.14, -0.22],
      [0, 0.035, -0.32], // Centerline ends at y = 0.035; with radius 0.035 bottom touches y = 0.000m!
    ]),
    {
      parent: hips,
      role: "tail",
      names: ["tailBase", "tailTip"],
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // BODY AND TORSO LOFT
  // ---------------------------------------------------------------------------
  const bodyStations = [
    { at: [0, 0.20, -0.04] as const, w: 0.38, h: 0.38 }, // Lower rump / abdomen base
    { at: [0, 0.33, -0.02] as const, w: 0.45, h: 0.46 }, // Lower belly
    { at: [0, 0.49, 0.02] as const, w: 0.48, h: 0.49 },  // Mid belly - maximum girth
    { at: [0, 0.67, 0.03] as const, w: 0.44, h: 0.46 },  // Pectoral chest
    { at: [0, 0.83, -0.01] as const, w: 0.34, h: 0.36 }, // Mantle / shoulders
    { at: [0, 0.94, -0.005] as const, w: 0.24, h: 0.26 },// Neck
    { at: [0, 1.02, 0.01] as const, w: 0.17, h: 0.18 },  // Base of skull
  ];

  // Emperor penguin plumage:
  // - Midnight black dorsal cowl and cape
  // - High black bib/chin wrapping under throat: above y = 0.96 and under chin is BLACK
  // - Primrose golden yellow upper chest from y = 0.70 to y = 0.93
  // - Auroral golden-orange feather glow ascending both sides of the neck toward ears
  // - Pure white belly below y = 0.72
  const bodyPaint = paint((p, n) => {
    const isFront = n.z;
    const height = p.y;
    const lat = Math.abs(n.x);

    // Ventral vs dorsal division
    const bellyBlend = smoothstep(-0.15, 0.22, isFront);

    // Black throat bib / chin under throat
    const isBlackBib = smoothstep(0.96, 1.02, height) * smoothstep(0.0, 0.5, isFront);

    // Golden yellow chest gradient: sits on anterior upper breast
    const chestYellowFactor = smoothstep(0.68, 0.82, height) * (1 - smoothstep(0.92, 0.97, height));
    const frontYellow = chestYellowFactor * smoothstep(0.2, 0.6, isFront);

    // Auroral glow running up lateral neck towards the ear patches
    const neckSideAuroral = smoothstep(0.82, 0.98, height) * smoothstep(0.25, 0.65, lat) * smoothstep(-0.1, 0.4, isFront);

    let ventralCol = WHITE;
    if (frontYellow > 0.01) {
      ventralCol = mix(ventralCol, BREAST_YELLOW, frontYellow) as unknown as string;
    }
    if (neckSideAuroral > 0.01) {
      ventralCol = mix(ventralCol, AURORA_GOLD, neckSideAuroral * 0.9) as unknown as string;
    }
    if (isBlackBib > 0.01) {
      ventralCol = mix(ventralCol, BLACK, isBlackBib) as unknown as string;
    }

    return mix(BLACK, ventralCol, bellyBlend);
  });

  b.loft(bodyStations, {
    bone: [tailChain, hips, spine, neck],
    color: bodyPaint,
    group: "body",
  });

  // ---------------------------------------------------------------------------
  // HEAD: Sleek avian skull + iconic crescent ear patches
  // ---------------------------------------------------------------------------
  const skullStations = [
    { at: head.local([0, -0.05, 0.0]), w: 0.16, h: 0.17 }, // Occiput
    { at: head.local([0, 0.03, 0.01]), w: 0.15, h: 0.16 },  // Mid crown & temples
    { at: head.local([0, 0.09, 0.005]), w: 0.12, h: 0.13 }, // Forehead / base of beak
    { at: head.local([0, 0.14, -0.008]), w: 0.07, h: 0.07 },// Beak base junction
  ];

  const headInvQuat = head.quat.clone().invert();
  const headPaint = paint((p) => {
    const lp = p.clone().sub(head.at).applyQuaternion(headInvQuat);
    const lateralDist = Math.abs(lp.x);
    const fwd = lp.y;
    const up = lp.z;

    // Distinct comma/crescent shape on the sides of the head
    const dy = (fwd - 0.01) / 0.055;
    const dz = (up - -0.005) / 0.045;
    const dist = Math.sqrt(dy * dy + dz * dz);

    if (lateralDist > 0.040 && dist < 1.0) {
      const edge = smoothstep(1.0, 0.65, dist);
      const yellowToOrange = smoothstep(0.02, -0.03, fwd);
      const patchCol = mix(AURORA_GOLD, AURORA_ORANGE, yellowToOrange);
      return mix(BLACK, patchCol, edge);
    }

    return BLACK;
  });

  b.loft(skullStations, {
    bone: head,
    color: headPaint,
    group: "head",
  });

  // Eyes (detail 0.88 with segments 7 and 5)
  for (const s of [1, -1]) {
    const eyePos = head.local([s * 0.056, 0.075, 0.015]);
    b.part(new THREE.SphereGeometry(0.011, 7, 5), EYE_DARK, {
      bone: head,
      at: eyePos,
      scale: [0.7, 1, 1],
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.003, 5, 4), EYE_HIGHLIGHT, {
      bone: head,
      at: head.local([s * 0.061, 0.080, 0.018]),
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // BEAK: Long, slender, downcurved bill with pink mandibular stripe
  // ---------------------------------------------------------------------------
  const upperBeakPath = catmull([
    head.local([0, 0.12, -0.002]),
    head.local([0, 0.19, -0.005]),
    head.local([0, 0.25, -0.012]),
    head.local([0, 0.31, -0.025]),
  ]);

  b.sweep(upperBeakPath, (t) => [0.024 * (1 - 0.78 * t), 0.022 * (1 - 0.78 * t)], {
    bone: head,
    color: BEAK_BLACK,
    caps: { end: "point" },
    group: "head",
  });

  const lowerBeakPath = catmull([
    jaw.local([0, 0.05, -0.002]),
    jaw.local([0, 0.12, -0.004]),
    jaw.local([0, 0.18, -0.010]),
    jaw.local([0, 0.23, -0.021]),
  ]);

  const mandiblePaint = paint((_p, n) => {
    const isSide = Math.abs(n.x);
    const sidePlate = smoothstep(0.35, 0.75, isSide);
    return mix(BEAK_BLACK, MANDIBLE_STRIPE, sidePlate);
  });

  b.sweep(lowerBeakPath, (t) => [0.021 * (1 - 0.75 * t), 0.017 * (1 - 0.75 * t)], {
    bone: jaw,
    color: mandiblePaint,
    caps: { end: "point" },
    group: "head",
  });

  // Pose jaw slightly open in dignified call/rest pose
  b.pose(jaw, { axis: jaw.dir([1, 0, 0]), deg: -4.5 });

  // ---------------------------------------------------------------------------
  // FLIPPERS (WINGS)
  // ---------------------------------------------------------------------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const shoulderPt: [number, number, number] = [s * 0.22, 0.81, 0.02];
    const elbowPt: [number, number, number] = [s * 0.38, 0.70, -0.05];
    const wristPt: [number, number, number] = [s * 0.52, 0.52, -0.10];
    const tipPt: [number, number, number] = [s * 0.62, 0.35, -0.14];

    const flipperArm = b.chain(
      `flipper${side}`,
      [shoulderPt, elbowPt, wristPt],
      {
        parent: spine.joints[2], // shoulders
        role: "wing",
        names: [`flipperShoulder${side}`, `flipperElbow${side}`],
        group: `wing${side}`,
      },
    );

    const flipperTip = b.chain(
      `flipperTip${side}`,
      [wristPt, tipPt],
      {
        parent: flipperArm.joints[1],
        role: "digit",
        names: [`flipperWrist${side}`],
        group: `wing${side}`,
      },
    );

    const wingStations = [
      { at: shoulderPt, w: 0.09, h: 0.045 },
      { at: elbowPt, w: 0.08, h: 0.032 },
      { at: wristPt, w: 0.065, h: 0.022 },
      { at: tipPt, w: 0.03, h: 0.012 },
    ];

    const flipperPaint = paint((p, n) => {
      const isVentral = n.z * 0.6 - n.y * 0.4;
      const distFromShoulder = Math.sqrt((p.x - shoulderPt[0]) ** 2 + (p.y - shoulderPt[1]) ** 2);
      const isTip = smoothstep(0.35, 0.46, distFromShoulder);

      const ventralCol = mix(WHITE, CHARCOAL, isTip);
      const isUnder = smoothstep(-0.2, 0.3, isVentral);
      return mix(BLACK, ventralCol, isUnder);
    });

    b.loft(wingStations, {
      bone: [flipperArm, flipperTip],
      color: flipperPaint,
      group: `wing${side}`,
    });

    b.sweep(
      catmull([shoulderPt, elbowPt, wristPt, tipPt]),
      (t) => 0.014 * (1 - 0.6 * t),
      {
        bone: [flipperArm, flipperTip],
        color: CHARCOAL,
        group: `wing${side}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // TAIL: Stiff retroverted prop tail touching the ice
  // ---------------------------------------------------------------------------
  b.sweep(tailChain, (t) => [0.11 * (1 - 0.45 * t), 0.035], {
    bone: tailChain,
    color: BLACK,
    caps: { end: "flat" },
    group: "tail",
  });

  for (const dx of [-0.05, -0.025, 0, 0.025, 0.05]) {
    b.spike(
      tailChain.at(0.4).moved([dx, 0.01, 0]),
      [dx * 0.7, -0.3, -0.8],
      0.15,
      0.012,
      {
        bone: tailChain.joints[1],
        color: BLACK,
        group: "tail",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // LEGS & FEET: Short feathered thighs, scaled tarsi, webbed clawed toes
  // ---------------------------------------------------------------------------
  const toeR = 0.012;
  const footBaseY = toeR; // 0.012m

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const hipPt: [number, number, number] = [s * 0.14, 0.28, -0.02];
    const kneePt: [number, number, number] = [s * 0.14, 0.16, 0.01];
    const footTarget: [number, number, number] = [s * 0.14, footBaseY + 0.025, 0.08];

    // Feathered thigh sheath
    b.capsule(
      hipPt,
      kneePt,
      [0.085, 0.05],
      {
        bone: hips,
        color: WHITE,
        group: "body",
      },
    );

    const legChain = b.chain(
      `leg${side}`,
      limb(
        kneePt,
        footTarget,
        [0.08, 0.07],
        [
          [0, 0, 1], // Knee bends forward
          [0, 0, -1], // Ankle bends back
        ],
        { sole: [0, 1, 0] },
      ),
      {
        parent: hips,
        role: "leg",
        names: [`knee${side}`, `ankle${side}`],
        contact: [s * 0.14, 0.0, 0.12], // Ground contact on ice!
        group: `leg${side}`,
      },
    );

    b.sweep(legChain, [0.032, 0.025], {
      color: LEG_SKIN,
      group: `leg${side}`,
    });

    const ankleJoint = legChain.joints[1];
    const footBasePt: [number, number, number] = [s * 0.14, footBaseY, 0.06];

    const toeAngles = [-20, 0, 20];
    const toeLengths = [0.10, 0.12, 0.10];
    const toeChains: Chain[] = [];

    for (let i = 0; i < 3; i++) {
      const angleRad = (toeAngles[i] * Math.PI) / 180;
      const toeLen = toeLengths[i];
      const toeEndPt: [number, number, number] = [
        s * 0.14 + Math.sin(angleRad) * toeLen * s,
        toeR,
        0.06 + Math.cos(angleRad) * toeLen,
      ];

      const toe = b.chain(
        `toe${side}${i + 1}`,
        [footBasePt, toeEndPt],
        {
          parent: ankleJoint,
          role: "digit",
          names: [`toe${side}${i + 1}`],
          contact: [toeEndPt[0], 0.0, toeEndPt[2]],
          group: `leg${side}`,
        },
      );
      toeChains.push(toe);

      b.sweep(toe, toeR, {
        color: LEG_SKIN,
        sides: 6,
        group: `leg${side}`,
      });

      b.spike(
        toe.at(1),
        [s * Math.sin(angleRad) * 0.3, 0.0, 0.95],
        0.026,
        0.007,
        {
          bone: toe.joints[0],
          color: CLAW,
          group: `leg${side}`,
        },
      );
    }

    // Interdigital swimming webs with controlled rows/cols
    for (let i = 0; i < 2; i++) {
      b.membrane(toeChains[i], toeChains[i + 1], {
        thickness: 0.006,
        rows: 2,
        cols: 4,
        color: LEG_SKIN,
        group: `leg${side}`,
      });
    }

    // Small hallux
    b.spike(
      footBasePt,
      [0, 0.1, -0.9],
      0.022,
      0.007,
      {
        bone: ankleJoint,
        color: CLAW,
        group: `leg${side}`,
      },
    );
  }

  return b.root;
}
