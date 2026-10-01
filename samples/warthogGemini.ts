// Warthog · Gemini
// Common warthog (Phacochoerus africanus):
// ~0.75m at the shoulder, ~1.5m from snout to rump.
// Features:
// - Long flat wedge-shaped head with distinctive facial warts
// - Two pairs of curved tusks: massive upper tusks curling up & inward, sharp lower tusks
// - Articulated lower jaw with teeth/lip definition
// - Small watchful eyes set high and back on the skull
// - Bristly dorsal mane running along neck and spine
// - Thin upright tail with bristly tassel/tuft
// - Sparse-haired grey-brown hide with countershading and realistic earthy tones
// - Sturdy legs with cloven hooves planted firmly on the floor at y=0.

import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Warthog · Gemini",
  description:
    "A common warthog with facial warts, curved upper and lower tusks, articulated jaw, bristly dorsal mane, upright tufted tail, and cloven hooves.",
  builtBy: "WarthogGemini (agent)",
};

// Richer, high-contrast African savannah warthog color palette
const HIDE_MAIN = "#6b5d52";       // Warm grey-brown hide
const HIDE_DARK = "#423831";       // Deep earthy mud/dorsal shade
const HIDE_BELLY = "#827466";      // Warm buff belly tone
const SNOUT_PAD = "#27211d";       // Rough leathery snout disc
const TUSK_IVORY = "#e5dfd2";      // Polished ivory tusks
const TUSK_TIP = "#f7f3e8";        // Pale sharp tusk tips
const WART_COLOR = "#50453d";      // Calloused facial warts
const HOOF_COLOR = "#221d19";      // Hard dark keratin hooves
const MANE_DARK = "#1a1614";       // Coarse blackish dorsal bristles
const MANE_ACCENT = "#4a3c31";     // Sun-bleached bristle highlights
const EYE_DARK = "#120f0d";        // Deep glossy black eye
const EYE_WHITE = "#d8cfc4";       // Sub-orbital sclera / eye highlight
const INNER_EAR = "#755e53";       // Warm fleshy inner ear tone

export default function build() {
  const b = createBuilder({ name: "warthogGemini" });

  // ---------------------------------------------------------------------------
  // SKELETON & BODY
  // Shoulder height ~ 0.75m, total length ~ 1.5m from snout to rump.
  // Body trunk from rump (z = -0.65) to chest/shoulder (z = 0.35).
  // ---------------------------------------------------------------------------

  const stations = [
    { at: [0, 0.70, -0.65] as const, w: 0.28, h: 0.30 }, // Rump / pelvic base
    { at: [0, 0.73, -0.42] as const, w: 0.38, h: 0.38 }, // Flank / hip
    { at: [0, 0.75, -0.15] as const, w: 0.44, h: 0.46 }, // Mid-belly / ribcage
    { at: [0, 0.77, 0.12] as const,  w: 0.46, h: 0.50 }, // Massive chest / shoulder hump
    { at: [0, 0.76, 0.32] as const,  w: 0.40, h: 0.46 }, // Front chest / neck base
    { at: [0, 0.73, 0.48] as const,  w: 0.30, h: 0.36 }, // Mid-neck (sloping down-forward)
  ] as const;

  const bodyCurve = catmull(stations.map((s) => s.at));

  // Root joint at hips
  const root = b.joint("root", { at: stations[1].at });

  // Spine running forward
  const spineChain = b.chain("spine", bodyCurve.slice(bodyCurve.knots[1], 1), {
    parent: root,
    names: ["spine1", "spine2", "chest", "neck", "neckEnd"],
    role: "spine",
    group: "body",
  });

  // Pelvis / rear bone for tail attachment
  const pelvis = b.joint("pelvis", {
    parent: root,
    at: stations[0].at,
    role: "spine",
    group: "body",
  });

  // Loft the body trunk with smooth skinning
  b.loft(stations, {
    bone: [pelvis, root, spineChain],
    color: HIDE_MAIN,
    sectors: [
      [-65, 65, HIDE_DARK],    // Darker mud-dorsal ridge
      [125, 235, HIDE_BELLY],  // Lighter belly
    ],
    smooth: true,
  });

  // ---------------------------------------------------------------------------
  // HEAD & ARTICULATED JAW
  // Starts inside the neck collar so there is zero loose gap.
  // ---------------------------------------------------------------------------
  const neckTip = spineChain.tip ?? spineChain.joints[spineChain.joints.length - 1];
  const headOrigin: [number, number, number] = [0, 0.71, 0.45];

  const head = b.joint("head", {
    parent: neckTip,
    at: headOrigin,
    dir: [0, -0.22, 1], // Sloping downward wedge
    role: "head",
    group: "head",
  });

  // Upper skull & snout
  // Deep overlapping cranium to smoothly connect into the neck
  const headStations = [
    { at: head.local([0, -0.05, 0.02]), w: 0.30, h: 0.28 }, // Deep cranial base embedded in neck
    { at: head.local([0, 0.08, 0.02]),  w: 0.28, h: 0.24 }, // Forehead & eye brows
    { at: head.local([0, 0.22, 0.01]),  w: 0.25, h: 0.20 }, // Mid-face
    { at: head.local([0, 0.36, -0.01]), w: 0.21, h: 0.16 }, // Bridge
    { at: head.local([0, 0.46, -0.02]), w: 0.19, h: 0.14 }, // Tusk zone
    { at: head.local([0, 0.54, -0.02]), w: 0.18, h: 0.13 }, // Snout tip
  ];

  b.loft(headStations, {
    bone: head,
    color: HIDE_MAIN,
    sectors: [
      [-75, 75, HIDE_DARK],
    ],
  });

  // Snout terminal disc (rhinarium)
  const snoutDiscAt = head.local([0, 0.55, -0.02]);
  b.part(new CylinderGeometry(0.08, 0.09, 0.03, 10), SNOUT_PAD, {
    bone: head,
    at: snoutDiscAt,
    dir: head.dir([0, 1, 0]),
  });

  // Nostrils on snout disc
  for (const s of [1, -1]) {
    b.part(new BoxGeometry(0.022, 0.012, 0.02), "#110e0c", {
      bone: head,
      at: head.local([s * 0.035, 0.56, -0.015]),
      rotation: [0, 0, s * 15],
    });
  }

  // ---------------------------------------------------------------------------
  // ARTICULATED LOWER JAW
  // ---------------------------------------------------------------------------
  const jawJoint = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.08, -0.08]),
    dir: head.dir([0, 1, -0.08]),
    role: "jaw",
    group: "head",
  });

  const jawStations = [
    { at: jawJoint.local([0, 0.02, 0.00]), w: 0.22, h: 0.08 },
    { at: jawJoint.local([0, 0.18, 0.00]), w: 0.17, h: 0.07 },
    { at: jawJoint.local([0, 0.32, 0.00]), w: 0.14, h: 0.06 },
    { at: jawJoint.local([0, 0.44, 0.00]), w: 0.13, h: 0.06 },
  ];

  b.loft(jawStations, {
    bone: jawJoint,
    color: HIDE_MAIN,
    sectors: [
      [110, 250, HIDE_BELLY],
    ],
  });

  // ---------------------------------------------------------------------------
  // TUSKS
  // Two pairs:
  // 1. Upper tusks: massive, erupting sideways from snout, curving UP and INWARD.
  // 2. Lower tusks: razor-sharp, pointing UP and slightly OUTWARD to hone against upper tusks.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    // Upper tusk base
    const upperTuskBase = head.local([s * 0.09, 0.42, -0.01]);
    const upperTuskMid1 = head.local([s * 0.20, 0.44, 0.04]);
    const upperTuskMid2 = head.local([s * 0.21, 0.48, 0.15]);
    const upperTuskTip  = head.local([s * 0.12, 0.51, 0.21]);

    const upperTuskPath = catmull([upperTuskBase, upperTuskMid1, upperTuskMid2, upperTuskTip]);
    b.sweep(upperTuskPath, (t: number) => 0.028 * (1 - 0.72 * t), {
      bone: head,
      color: TUSK_IVORY,
      caps: { start: "flat", end: "point" },
      bands: [
        [0.7, TUSK_IVORY],
        [1.0, TUSK_TIP],
      ],
    });

    // Lower tusk: rooted on jaw, pointed sharply up and slightly out
    const lowerTuskBase = jawJoint.local([s * 0.065, 0.42, 0.02]);
    const lowerTuskTip  = jawJoint.local([s * 0.11,  0.44, 0.11]);
    const lowerTuskPath = catmull([
      lowerTuskBase,
      jawJoint.local([s * 0.09, 0.43, 0.06]),
      lowerTuskTip,
    ]);
    b.sweep(lowerTuskPath, (t: number) => 0.018 * (1 - 0.78 * t), {
      bone: jawJoint,
      color: TUSK_TIP,
      caps: { start: "flat", end: "point" },
    });
  }

  // ---------------------------------------------------------------------------
  // FACIAL WARTS
  // 1. Upper sub-orbital warts (elongated bumps below eyes)
  // 2. Lower jaw / lateral cheek warts (broad calloused flaps)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    // Upper sub-orbital wart
    const upperWartPos = head.local([s * 0.14, 0.18, 0.03]);
    b.part(new SphereGeometry(0.034, 6, 5), WART_COLOR, {
      bone: head,
      at: upperWartPos,
      scale: [1.3, 1.1, 0.8],
      dir: head.dir([s * 0.8, 0.2, 0.4]),
    });

    // Mid/snout wart
    const midWartPos = head.local([s * 0.11, 0.34, 0.01]);
    b.part(new SphereGeometry(0.024, 6, 5), WART_COLOR, {
      bone: head,
      at: midWartPos,
      scale: [1.1, 1.2, 0.9],
      dir: head.dir([s * 0.9, 0.3, 0.1]),
    });

    // Lower jaw flange / cheek wart
    const lowerWartPos = jawJoint.local([s * 0.10, 0.22, -0.02]);
    b.part(new SphereGeometry(0.028, 6, 5), WART_COLOR, {
      bone: jawJoint,
      at: lowerWartPos,
      scale: [1.4, 0.9, 0.7],
      dir: jawJoint.dir([s * 1, 0, -0.3]),
    });
  }

  // ---------------------------------------------------------------------------
  // EYES & EARS
  // Small dark eyes set high and back on skull, with white/sclera detail.
  // Ears turned alertly sideways.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const eyePos = head.local([s * 0.13, 0.11, 0.09]);
    // Eye socket bulge
    b.part(new SphereGeometry(0.028, 6, 5), HIDE_DARK, {
      bone: head,
      at: eyePos,
      scale: [1.1, 1.0, 0.8],
    });
    // Sclera / eye highlight
    b.part(new SphereGeometry(0.019, 5, 5), EYE_WHITE, {
      bone: head,
      at: head.local([s * 0.138, 0.112, 0.095]),
    });
    // Pupil
    b.part(new SphereGeometry(0.015, 5, 5), EYE_DARK, {
      bone: head,
      at: head.local([s * 0.142, 0.114, 0.098]),
    });

    // Ears: pointed, fringed, set high behind cranium, turned outward
    const earBase = head.local([s * 0.12, 0.04, 0.11]);
    const earTip  = head.local([s * 0.24, 0.02, 0.19]);
    const earMid  = head.local([s * 0.19, 0.04, 0.16]);
    const earPath = catmull([earBase, earMid, earTip]);

    b.sweep(earPath, (t: number) => 0.038 * Math.sin(t * Math.PI) + 0.012, {
      bone: head,
      color: HIDE_DARK,
      caps: { start: "round", end: "point" },
      shift: [0, -0.01],
      bands: [
        [0.7, HIDE_DARK],
        [1.0, MANE_DARK], // Dark bristle fringe on ear tips
      ],
    });

    // Inner ear cone
    b.part(new SphereGeometry(0.024, 5, 5), INNER_EAR, {
      bone: head,
      at: head.local([s * 0.15, 0.04, 0.13]),
      scale: [0.6, 1.2, 0.4],
      dir: head.dir([s * 0.8, 0.5, 0.2]),
    });
  }

  // ---------------------------------------------------------------------------
  // BRISTLY DORSAL MANE
  // Pronounced mohawk-style ridge running along neck, shoulders, and spine.
  // Section: [width, height], well elevated above back.
  // ---------------------------------------------------------------------------
  const maneCurve = catmull([
    head.local([0, 0.04, 0.14]),
    head.local([0, -0.04, 0.17]),
    [0, 0.90, 0.40] as const,
    [0, 0.96, 0.22] as const,
    [0, 0.98, 0.08] as const,
    [0, 0.95, -0.10] as const,
    [0, 0.91, -0.30] as const,
    [0, 0.85, -0.52] as const,
  ]);

  b.sweep(maneCurve, (t: number) => [0.038, 0.16 * (1 - 0.35 * t)], {
    bone: [head, spineChain.joints[3], spineChain.joints[2], spineChain.joints[1], spineChain.joints[0], pelvis],
    color: MANE_DARK,
    smooth: true,
  });

  // Secondary bristly cones embedded along the crest for hair texture
  const crestSpikes: Array<{ at: [number, number, number]; bone: Joint; h: number }> = [
    { at: [0, 0.91, 0.30], bone: spineChain.joints[3], h: 0.18 },
    { at: [0, 0.97, 0.18], bone: spineChain.joints[2], h: 0.21 },
    { at: [0, 0.98, 0.05], bone: spineChain.joints[2], h: 0.19 },
    { at: [0, 0.94, -0.15], bone: spineChain.joints[1], h: 0.16 },
    { at: [0, 0.90, -0.35], bone: spineChain.joints[0], h: 0.14 },
  ];

  for (const cs of crestSpikes) {
    for (const s of [1, -1]) {
      b.part(new ConeGeometry(0.018, cs.h, 4), MANE_ACCENT, {
        bone: cs.bone,
        at: [cs.at[0] + s * 0.022, cs.at[1] + cs.h * 0.25, cs.at[2]],
        rotation: [-25, 0, s * 16],
      });
    }
  }

  // ---------------------------------------------------------------------------
  // LEGS & CLOVEN HOOVES
  // Quadruped limbs with realistic jointing, shoulder ~0.75m high.
  // Front legs placed slightly forward and hind legs slightly back.
  // Hooves planted firmly on the floor at y=0.
  // ---------------------------------------------------------------------------
  const hoofBottomY = 0.022; // Centers the 0.045m tall hooves exactly touching y=0

  // FRONT LEGS
  const frontShoulderX = 0.16;
  const frontShoulderY = 0.65;
  const frontShoulderZ = 0.26;

  const frontFootX = 0.17;
  const frontFootY = hoofBottomY;
  const frontFootZ = 0.22;

  for (const s of [1, -1]) {
    const shoulderPt: [number, number, number] = [s * frontShoulderX, frontShoulderY, frontShoulderZ];
    const footPt: [number, number, number] = [s * frontFootX, frontFootY, frontFootZ];

    const shoulderJoint = b.joint(`shoulder_${s > 0 ? "L" : "R"}`, {
      parent: spineChain.joints[2], // chest
      at: shoulderPt,
      role: "arm",
      group: "legs",
    });

    const legPts = limb(shoulderPt, footPt, [0.33, 0.33], [0, 0, 1]); // Bend knee forward
    const legChain = b.chain(`frontLeg_${s > 0 ? "L" : "R"}`, legPts, {
      parent: shoulderJoint,
      names: [`frontKnee_${s > 0 ? "L" : "R"}`, `frontAnkle_${s > 0 ? "L" : "R"}`, `frontHoof_${s > 0 ? "L" : "R"}`],
      role: "arm",
      group: "legs",
    });

    // Muscle mass sweep along leg
    b.sweep(legPts, (t: number) => {
      return [0.065 * (1 - 0.52 * t), 0.075 * (1 - 0.58 * t)];
    }, {
      bone: legChain,
      color: HIDE_MAIN,
      smooth: true,
    });

    // Cloven hoof at foot
    const footBone = legChain.tip ?? legChain.joints[legChain.joints.length - 1];
    for (const d of [1, -1]) {
      b.part(new BoxGeometry(0.032, 0.045, 0.06), HOOF_COLOR, {
        bone: footBone,
        at: [footPt[0] + d * 0.018, footPt[1], footPt[2] + 0.01],
        rotation: [-10, d * 5, 0],
      });
    }
    // Dewclaws
    b.part(new ConeGeometry(0.01, 0.025, 4), HOOF_COLOR, {
      bone: footBone,
      at: [footPt[0], footPt[1] + 0.025, footPt[2] - 0.03],
      rotation: [45, 0, 0],
    });
  }

  // HIND LEGS
  const hindHipX = 0.16;
  const hindHipY = 0.66;
  const hindHipZ = -0.38;

  const hindFootX = 0.17;
  const hindFootY = hoofBottomY;
  const hindFootZ = -0.42;

  for (const s of [1, -1]) {
    const hipPt: [number, number, number] = [s * hindHipX, hindHipY, hindHipZ];
    const footPt: [number, number, number] = [s * hindFootX, hindFootY, hindFootZ];

    const hipJoint = b.joint(`hip_${s > 0 ? "L" : "R"}`, {
      parent: root,
      at: hipPt,
      role: "leg",
      group: "legs",
    });

    // Digitigrade hind leg
    const legPts = limb(hipPt, footPt, [0.29, 0.27, 0.19], [[0, 0, 1], [0, 0, -1]]);
    const legChain = b.chain(`hindLeg_${s > 0 ? "L" : "R"}`, legPts, {
      parent: hipJoint,
      names: [
        `hindKnee_${s > 0 ? "L" : "R"}`,
        `hindHock_${s > 0 ? "L" : "R"}`,
        `hindAnkle_${s > 0 ? "L" : "R"}`,
        `hindHoof_${s > 0 ? "L" : "R"}`,
      ],
      role: "leg",
      group: "legs",
    });

    // Swept leg contour
    b.sweep(legPts, (t: number) => {
      return [0.075 * (1 - 0.55 * t), 0.085 * (1 - 0.6 * t)];
    }, {
      bone: legChain,
      color: HIDE_MAIN,
      smooth: true,
    });

    // Cloven hoof
    const footBone = legChain.tip ?? legChain.joints[legChain.joints.length - 1];
    for (const d of [1, -1]) {
      b.part(new BoxGeometry(0.032, 0.045, 0.06), HOOF_COLOR, {
        bone: footBone,
        at: [footPt[0] + d * 0.018, footPt[1], footPt[2] + 0.01],
        rotation: [-10, d * 5, 0],
      });
    }
    // Dewclaws
    b.part(new ConeGeometry(0.01, 0.025, 4), HOOF_COLOR, {
      bone: footBone,
      at: [footPt[0], footPt[1] + 0.025, footPt[2] - 0.03],
      rotation: [45, 0, 0],
    });
  }

  // ---------------------------------------------------------------------------
  // TAIL
  // Thin tail held upright like an antenna, tipped with a dark bristly tuft.
  // ---------------------------------------------------------------------------
  const tailBase: [number, number, number] = [0, 0.70, -0.65];
  const tailMid1: [number, number, number] = [0, 0.86, -0.69];
  const tailMid2: [number, number, number] = [0, 1.03, -0.67];
  const tailTip: [number, number, number]  = [0, 1.16, -0.64];

  const tailCurve = catmull([tailBase, tailMid1, tailMid2, tailTip]);
  const tailChain = b.chain("tail", tailCurve, {
    parent: pelvis,
    names: ["tail1", "tail2", "tail3", "tailTipJoint"],
    role: "tail",
    group: "tail",
  });

  // Thin whip-like tail shaft
  b.sweep(tailChain, (t: number) => 0.016 * (1 - 0.4 * t), {
    color: HIDE_MAIN,
    caps: { start: "round", end: "round" },
  });

  // Bristly tuft at tip of tail
  const tailTipBone = tailChain.tip ?? tailChain.joints[tailChain.joints.length - 1];
  b.part(new SphereGeometry(0.035, 6, 5), MANE_DARK, {
    bone: tailTipBone,
    at: tailTip,
    scale: [0.8, 1.6, 0.8],
  });
  // Flare bristles on tuft
  for (let a = 0; a < 6; a++) {
    const angle = (a / 6) * Math.PI * 2;
    b.part(new ConeGeometry(0.012, 0.07, 4), MANE_DARK, {
      bone: tailTipBone,
      at: [
        tailTip[0] + Math.cos(angle) * 0.015,
        tailTip[1] + 0.03,
        tailTip[2] + Math.sin(angle) * 0.015,
      ],
      rotation: [Math.sin(angle) * 20, 0, Math.cos(angle) * 20],
    });
  }

  return b.root;
}
