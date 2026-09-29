// Flying Fox (Pteropus) - a large fruit bat with ~1.5m wingspan.
// Features:
// - Fox-like canine head with large nocturnal eyes, pointed ears, separate articulated jaw with teeth and tongue
// - Golden-russet mantle (fur collar) over shoulders and nape
// - Dark slate/brown body and belly fur
// - Wingspan ~1.5m in spread rest pose: clavicle -> shoulder -> humerus -> elbow -> forearm (radius) -> wrist
// - Thumb claw (digit I) on leading edge of wrist
// - 4 elongated wing finger bones (digits II, III, IV, V) supporting leathery membranes
// - Leathery wing membrane (patagium: propatagium, dactylopatagium between fingers, plagiopatagium to body and hind legs)
// - Hind limbs: hip -> knee -> ankle -> foot with 5 sharp curved grasping claws
// - Lowest point rests on y = 0

import {
  SphereGeometry,
  Vector3,
} from "three";
import { createBuilder } from "../src/builder";
import { offset } from "../src/math";
import { catmull, polyline } from "../src/path";

export const meta = {
  name: "Flying Fox",
  description: "A large fruit bat with a 1.5 m wingspan, fox-like head, golden-russet mantle, leathery wing membranes, thumb claws, and clawed hind feet.",
  builtBy: "Gemini 3.8 Flash",
};

// Color palette
const BODY_DARK = "#201b18"; // Dark charcoal/brown body fur
const BODY_BELLY = "#2c2420"; // Slightly lighter belly
const MANTLE_GOLD = "#b86f1e"; // Golden-russet mantle
const MANTLE_BRIGHT = "#cf8126"; // Bright amber highlights on mantle
const WING_MEMBRANE = "#191514"; // Dark leathery wing membrane
const WING_STRUT = "#29211c"; // Finger and wing bone color
const BONE_CLAW = "#110e0d"; // Dark sharp claws
const HEAD_FUR = "#32241b"; // Russet-brown head fur
const SNOUT_DARK = "#1f1713"; // Dark snout
const NOSE_BLACK = "#0d0b0a"; // Wet black nose
const EYE_DARK = "#0f0c0a"; // Deep dark mammalian fruit bat eye
const EYE_PUPIL = "#050404";
const EYE_SPEC = "#ffffff";
const EAR_OUTER = "#221914";
const EAR_INNER = "#443024";
const TONGUE = "#b04b60";
const TOOTH_IVORY = "#ede6db";

export default function build() {
  const b = createBuilder({ name: "flyingFox", detail: 0.85 });

  // ---------------------------------------------------------------------------
  // 1. SKELETON
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.24, -0.06], role: "spine", group: "body" });

  const spine = b.chain(
    "spine",
    [
      [0, 0.24, -0.06], // Hips/pelvis
      [0, 0.31, -0.04], // Lower back
      [0, 0.38, -0.02], // Mid back / chest
      [0, 0.45, 0.0],   // Shoulders / upper thorax
    ],
    { parent: hips, role: "spine", group: "body" }
  );

  const chestJoint = spine.joints[2];
  const shoulderJoint = spine.joints[3];

  // Neck and Head
  const neck = b.chain(
    "neck",
    [
      [0, 0.45, 0.0],
      [0, 0.50, 0.03],
      [0, 0.54, 0.07],
    ],
    { parent: shoulderJoint, role: "neck", group: "neck" }
  );

  // Head joint: +Y points along dir [0, -0.1, 1] (forward and slightly down).
  // Under the roll convention without `up`, +Y forward means local +Z is up, local +X is right (s*x is model X).
  // So:
  // - local +Y is forward along snout
  // - local +Z is up (dorsal / crown / forehead)
  // - local -Z is down (ventral / throat / chin)
  // - local +X is right, -X is left
  const headJoint = b.joint("head", {
    parent: neck.joints[1],
    at: neck.at(1),
    dir: [0, -0.1, 1],
    role: "head",
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // 2. TORSO & MANTLE
  // ---------------------------------------------------------------------------
  // Lower body (dark brown/charcoal)
  const lowerTorsoPath = catmull([
    [0, 0.20, -0.07],
    [0, 0.26, -0.06],
    [0, 0.34, -0.04],
    [0, 0.40, -0.02],
  ]);

  b.sweep(lowerTorsoPath, (t) => [0.065 + 0.02 * Math.sin(t * Math.PI), 0.06 + 0.02 * Math.sin(t * Math.PI)], {
    bone: [hips, spine.joints[0], spine.joints[1]],
    color: BODY_DARK,
    sectors: [
      [110, 250, BODY_BELLY], // Ventral belly tone
    ],
    caps: { start: "round", end: "none" },
    group: "body",
  });

  // Upper Torso & Golden-Russet Mantle (fur cape covering shoulders, nape, upper chest)
  const mantlePath = catmull([
    [0, 0.38, -0.025],
    [0, 0.44, -0.01],
    [0, 0.50, 0.02],
    [0, 0.54, 0.06],
  ]);

  b.sweep(mantlePath, (t) => [0.088 * (1 - 0.25 * t), 0.082 * (1 - 0.25 * t)], {
    bone: [spine.joints[2], shoulderJoint, neck.joints[0]],
    color: MANTLE_GOLD,
    sectors: [
      [-90, 90, MANTLE_BRIGHT], // Dorsal cape brighter golden-orange
    ],
    caps: { start: "none", end: "round" },
    group: "body",
  });

  // Realistic fur ruff along collar / mantle perimeter
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const radX = Math.cos(angle) * 0.082;
    const radZ = Math.sin(angle) * 0.075;
    const yPos = 0.44 + Math.sin(angle * 2) * 0.02;
    b.spike(
      [radX, yPos, radZ],
      [radX * 1.25, -0.04, radZ * 1.25],
      0.035,
      0.010,
      {
        bone: shoulderJoint,
        color: MANTLE_GOLD,
        sides: 4,
        group: "body",
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 3. FOX-LIKE HEAD, BIG EYES, POINTED EARS, SEPARATE JAW
  // ---------------------------------------------------------------------------
  // Cranium (main skull)
  b.capsule(
    headJoint.local([0, 0.01, 0.01]),
    headJoint.local([0, 0.08, 0.01]),
    [0.046, 0.042],
    {
      bone: headJoint,
      color: HEAD_FUR,
      group: "head",
    }
  );

  // Upper Snout / Muzzle tapering forward
  const snoutTip = headJoint.local([0, 0.165, -0.005]);
  b.sweep(
    [
      headJoint.local([0, 0.06, 0.012]),
      headJoint.local([0, 0.11, 0.006]),
      snoutTip,
    ],
    (t) => [0.034 * (1 - 0.5 * t), 0.028 * (1 - 0.45 * t)],
    {
      bone: headJoint,
      color: SNOUT_DARK,
      caps: { start: "round", end: "round" },
      group: "head",
    }
  );

  // Black rhinarium (nose) at tip of snout
  const nosePos = headJoint.local([0, 0.172, -0.003]);
  b.part(new SphereGeometry(0.011, 6, 5), NOSE_BLACK, {
    bone: headJoint,
    at: nosePos,
    scale: [1.1, 0.85, 0.9],
    group: "head",
  });

  // Large nocturnal fruit bat eyes with warm iris and shine
  for (const s of [1, -1]) {
    // Eye placed on lateral side of snout at brow level
    const eyeCenter = headJoint.local([s * 0.036, 0.088, 0.016]);
    const eyeGaze = headJoint.dir([s * 0.75, 0.55, 0.35]);

    // Eye socket / dark eyelid rim
    b.part(new SphereGeometry(0.019, 8, 6), SNOUT_DARK, {
      bone: headJoint,
      at: eyeCenter,
      scale: [1.0, 1.15, 1.15],
      group: "head",
    });

    // Dark glossy eyeball / iris
    b.part(new SphereGeometry(0.016, 8, 6), EYE_DARK, {
      bone: headJoint,
      at: eyeCenter,
      dir: eyeGaze,
      axis: "z",
      scale: [1.0, 1.0, 0.85],
      group: "head",
    });

    // Deep black pupil
    b.part(new SphereGeometry(0.011, 6, 4), EYE_PUPIL, {
      bone: headJoint,
      at: offset(eyeCenter, eyeGaze, 0.007),
      scale: [0.95, 0.95, 0.4],
      group: "head",
    });

    // Crisp white specular catchlight
    b.part(new SphereGeometry(0.0035, 4, 3), EYE_SPEC, {
      bone: headJoint,
      at: offset(eyeCenter, eyeGaze, 0.013).add(new Vector3(s * 0.002, 0.004, 0)),
      group: "head",
    });

    // Pointed vulpine ears (upright, oval, cupped)
    // In local coords: +Z is up, +Y is forward, ±X is side
    const earBase = headJoint.local([s * 0.032, 0.03, 0.04]);
    const earOuter = headJoint.local([s * 0.052, 0.025, 0.085]);
    const earTip = headJoint.local([s * 0.045, 0.035, 0.14]);
    const earInner = headJoint.local([s * 0.018, 0.04, 0.09]);

    // Outer ear shell
    b.slab(
      [
        earBase,
        earInner,
        earTip,
        earOuter,
      ],
      {
        thickness: 0.005,
        color: EAR_OUTER,
        bone: headJoint,
        group: "head",
      }
    );

    // Inner ear cavity (lighter contrast)
    b.slab(
      [
        headJoint.local([s * 0.030, 0.034, 0.05]),
        headJoint.local([s * 0.022, 0.040, 0.085]),
        headJoint.local([s * 0.038, 0.038, 0.125]),
        headJoint.local([s * 0.044, 0.032, 0.085]),
      ],
      {
        thickness: 0.003,
        color: EAR_INNER,
        bone: headJoint,
        group: "head",
      }
    );
  }

  // Articulated Lower Jaw
  // In local coords: -Z is down (jaw)
  const jaw = b.joint("jaw", {
    parent: headJoint,
    at: headJoint.local([0, 0.03, -0.022]),
    aim: headJoint.local([0, 0.16, -0.035]), // Aiming forward and slightly open
    role: "jaw",
    group: "jaw",
  });

  // Lower jaw sweep
  b.sweep(
    [
      jaw.at,
      headJoint.local([0, 0.09, -0.025]),
      headJoint.local([0, 0.155, -0.030]),
    ],
    (t) => [0.028 * (1 - 0.45 * t), 0.018 * (1 - 0.4 * t)],
    {
      bone: jaw,
      color: SNOUT_DARK,
      caps: { start: "round", end: "point" },
      group: "jaw",
    }
  );

  // Pink tongue nestled in jaw
  b.capsule(
    headJoint.local([0, 0.06, -0.018]),
    headJoint.local([0, 0.12, -0.016]),
    [0.011, 0.008],
    {
      bone: jaw,
      color: TONGUE,
      group: "jaw",
    }
  );

  // Sharp fruit-bat canine teeth
  for (const s of [1, -1]) {
    // Upper canines pointing down (-Z)
    b.spike(
      headJoint.local([s * 0.016, 0.13, -0.012]),
      headJoint.local([s * 0.015, 0.132, -0.032]),
      null,
      0.003,
      {
        bone: headJoint,
        color: TOOTH_IVORY,
        sides: 4,
        group: "head",
      }
    );

    // Lower canines pointing up (+Z)
    b.spike(
      headJoint.local([s * 0.013, 0.125, -0.026]),
      headJoint.local([s * 0.012, 0.123, -0.008]),
      null,
      0.0026,
      {
        bone: jaw,
        color: TOOTH_IVORY,
        sides: 4,
        group: "jaw",
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 4. WINGS & LEATHERY MEMBRANES (1.5 m Wingspan)
  // ---------------------------------------------------------------------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Arm skeleton: shoulder -> elbow -> wrist
    const shoulderPt: [number, number, number] = [s * 0.08, 0.44, 0.0];
    const elbowPt: [number, number, number] = [s * 0.22, 0.45, -0.08];
    const wristPt: [number, number, number] = [s * 0.46, 0.48, -0.02];

    const arm = b.chain(
      `arm${side}`,
      [shoulderPt, elbowPt, wristPt],
      {
        parent: shoulderJoint,
        names: [`shoulder${side}`, `elbow${side}`],
        role: "wing",
        group: `wing${side}`,
      }
    );

    // Upper arm (humerus) with golden mantle fur blend, forearm (radius) slender
    b.sweep(arm, (t) => (t < 0.5 ? 0.032 - 0.012 * t : 0.018 - 0.006 * (t - 0.5)), {
      color: MANTLE_GOLD,
      bands: [[0.45, MANTLE_GOLD], [1.0, WING_STRUT]],
      group: `wing${side}`,
    });

    const wristJoint = arm.joints[1];

    // Thumb (Digit I) on leading edge of wrist with sharp climbing claw
    const thumbRoot: [number, number, number] = [s * 0.47, 0.50, 0.01];
    const thumbTip: [number, number, number] = [s * 0.49, 0.53, 0.03];
    const thumbClawTip: [number, number, number] = [s * 0.51, 0.55, 0.02];

    const thumb = b.chain(
      `thumb${side}`,
      [thumbRoot, thumbTip],
      {
        parent: wristJoint,
        role: "digit",
        group: `wing${side}`,
      }
    );
    b.sweep(thumb, [0.009, 0.006], { color: WING_STRUT, group: `wing${side}` });

    // Thumb claw
    b.spike(thumbTip, thumbClawTip, null, 0.005, {
      bone: thumb.joints[0],
      color: BONE_CLAW,
      sides: 4,
      group: `wing${side}`,
    });

    // Elongated Wing Fingers (Digits II, III, IV, V)
    // Wingspan reaches x = ±0.75m at tip of Digit III (1.5 m total span)
    const fingerConfigs = [
      {
        id: `finger2${side}`,
        names: [`f2_${1}${side}`, `f2_${2}${side}`],
        pts: [
          wristPt,
          [s * 0.58, 0.47, -0.04] as [number, number, number],
          [s * 0.70, 0.45, -0.07] as [number, number, number],
        ],
        radius: [0.008, 0.004] as [number, number],
      },
      {
        id: `finger3${side}`,
        names: [`f3_${1}${side}`, `f3_${2}${side}`],
        pts: [
          wristPt,
          [s * 0.60, 0.45, -0.07] as [number, number, number],
          [s * 0.75, 0.42, -0.13] as [number, number, number], // Wing tip at 0.75 m (1.5 m span)
        ],
        radius: [0.008, 0.0035] as [number, number],
      },
      {
        id: `finger4${side}`,
        names: [`f4_${1}${side}`, `f4_${2}${side}`],
        pts: [
          wristPt,
          [s * 0.56, 0.35, -0.15] as [number, number, number],
          [s * 0.65, 0.23, -0.24] as [number, number, number],
        ],
        radius: [0.008, 0.0035] as [number, number],
      },
      {
        id: `finger5${side}`,
        names: [`f5_${1}${side}`, `f5_${2}${side}`],
        pts: [
          wristPt,
          [s * 0.48, 0.28, -0.17] as [number, number, number],
          [s * 0.52, 0.13, -0.27] as [number, number, number],
        ],
        radius: [0.008, 0.004] as [number, number],
      },
    ];

    const fingers = fingerConfigs.map((cfg) => {
      const ch = b.chain(
        cfg.id,
        polyline(cfg.pts),
        {
          parent: wristJoint,
          names: cfg.names,
          role: "digit",
          group: `wing${side}`,
        }
      );
      b.sweep(ch, cfg.radius, { color: WING_STRUT, group: `wing${side}` });
      return ch;
    });

    // Propatagium (leading edge membrane from shoulder to wrist)
    b.membrane(
      polyline([
        shoulderPt,
        [s * 0.25, 0.47, 0.01],
        wristPt,
      ]),
      polyline([
        shoulderPt,
        elbowPt,
        wristPt,
      ]),
      {
        thickness: 0.004,
        color: WING_MEMBRANE,
        bone: shoulderJoint,
        group: `wing${side}`,
      }
    );

    // Dactylopatagium (interdigital membranes between fingers)
    b.membrane(fingers[0], fingers[1], {
      thickness: 0.004,
      color: WING_MEMBRANE,
      scallop: 0.04,
      group: `wing${side}`,
    });

    b.membrane(fingers[1], fingers[2], {
      thickness: 0.004,
      color: WING_MEMBRANE,
      scallop: 0.10,
      group: `wing${side}`,
    });

    b.membrane(fingers[2], fingers[3], {
      thickness: 0.004,
      color: WING_MEMBRANE,
      scallop: 0.12,
      group: `wing${side}`,
    });

    // Plagiopatagium (main wing membrane from Digit V to torso flank and ankle)
    const anklePt: [number, number, number] = [s * 0.08, 0.07, -0.15];
    const flankPt: [number, number, number] = [s * 0.065, 0.32, -0.05];

    b.membrane(
      fingers[3],
      polyline([
        wristPt,
        [s * 0.30, 0.22, -0.16],
        flankPt,
        anklePt,
      ]),
      {
        thickness: 0.004,
        color: WING_MEMBRANE,
        scallop: 0.14,
        bone: chestJoint,
        group: `wing${side}`,
      }
    );

    // -------------------------------------------------------------------------
    // 5. HIND LIMBS & CLAWED FEET (Resting on y = 0)
    // -------------------------------------------------------------------------
    const hipPt: [number, number, number] = [s * 0.055, 0.24, -0.08];
    const kneePt: [number, number, number] = [s * 0.09, 0.17, -0.14];
    const ankleJointPt: [number, number, number] = anklePt;
    const footBasePt: [number, number, number] = [s * 0.08, 0.035, -0.16];

    const leg = b.chain(
      `leg${side}`,
      [hipPt, kneePt, ankleJointPt, footBasePt],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        group: `leg${side}`,
      }
    );

    b.sweep(leg, (t) => 0.022 - 0.01 * t, {
      color: BODY_DARK,
      group: `leg${side}`,
    });

    const footJoint = leg.joints[2]; // ankle/foot joint

    // Metatarsus pad
    b.capsule(footBasePt, [footBasePt[0], 0.02, footBasePt[2] + 0.02], 0.012, {
      bone: footJoint,
      color: BODY_DARK,
      group: `leg${side}`,
    });

    // 5 grasping toes with sharp curved claws touching down to y = 0
    for (let toeIdx = 0; toeIdx < 5; toeIdx++) {
      const toeSpread = (toeIdx - 2) * 0.009;
      const toeRoot: [number, number, number] = [footBasePt[0] + toeSpread * s, 0.02, footBasePt[2] + 0.015];
      const toeMid: [number, number, number] = [toeRoot[0] + toeSpread * 0.5 * s, 0.012, toeRoot[2] + 0.025];
      const toeTip: [number, number, number] = [toeMid[0], 0.003, toeMid[2] + 0.018];
      const clawEnd: [number, number, number] = [toeTip[0], 0.0, toeTip[2] + 0.015]; // Touches y = 0

      b.sweep([toeRoot, toeMid, toeTip], [0.004, 0.0028], {
        bone: footJoint,
        color: BODY_DARK,
        group: `leg${side}`,
      });

      b.spike(toeTip, clawEnd, null, 0.003, {
        bone: footJoint,
        color: BONE_CLAW,
        sides: 4,
        group: `leg${side}`,
      });
    }

    // Interfemoral membrane ribbon along inner leg / tail area
    const innerAnkle: [number, number, number] = [s * 0.04, 0.09, -0.13];
    b.membrane(
      polyline([
        [0, 0.20, -0.07],
        [s * 0.03, 0.16, -0.10],
        innerAnkle,
      ]),
      polyline([
        [0, 0.20, -0.07],
        [0, 0.17, -0.09],
        [s * 0.01, 0.12, -0.11],
      ]),
      {
        thickness: 0.003,
        color: WING_MEMBRANE,
        bone: hips,
        group: `leg${side}`,
      }
    );
  }

  return b.root;
}
