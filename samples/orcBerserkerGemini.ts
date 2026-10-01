import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { noise, paint } from "../src/paint";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Orc Berserker · Gemini",
  description:
    "A hulking green-skinned orc berserker about 2.1 m tall: heavy brow, small fierce eyes, pointed ears, a separate lower jaw with upward tusks, a topknot with braids, war paint. Bare muscular torso with leather belts, a bandolier, a fur loincloth, studded bracers and a spiked shoulder guard; a two-handed axe held in one hand. Humanoid rest pose with arms held out from the body.",
};

export default function build() {
  const b = createBuilder({ name: "orcBerserkerGemini" });

  // ---------------------------------------------------------------------------
  // Color Palette & Materials
  // ---------------------------------------------------------------------------
  const ORC_GREEN = "#44693a";
  const ORC_GREEN_DARK = "#284222";
  const ORC_GREEN_LIGHT = "#5a8a4d";
  const WARPAINT_RED = "#991b1b";
  const WARPAINT_WHITE = "#e5e7eb";
  const TUSK_IVORY = "#fef3c7";
  const MOUTH_INTERIOR = "#3b1414";
  const HAIR_BLACK = "#18181b";
  const LEATHER_DARK = "#2b190e";
  const LEATHER_MED = "#452a18";
  const LEATHER_LIGHT = "#633e22";
  const FUR_BASE = "#382517";
  const FUR_TIP = "#5c3d26";
  const IRON_METAL = "#4b5563";
  const IRON_DARK = "#272e38";
  const IRON_EDGE = "#9ca3af";
  const BRONZE_RIVET = "#d97706";
  const WOOD_DARK = "#452e1b";
  const EYE_YELLOW = "#facc15";
  const EYE_SCLERA = "#d4d4d8";
  const PUPIL_BLACK = "#09090b";

  // Procedural skin with subtle muscle lighting & bold fierce tribal warpaint
  const skinWithWarpaint = paint((p, n) => {
    // Red diagonal tribal slashes across torso
    const slashChest1 = Math.abs(p.x * 0.8 + (p.y - 1.48) * 1.3 + p.z * 0.4) < 0.045 && p.z > 0.08;
    const slashChest2 = Math.abs(p.x * 0.8 + (p.y - 1.48) * 1.3 + p.z * 0.4 + 0.12) < 0.025 && p.z > 0.08;
    // Red slash across face & brow
    const slashFace = Math.abs(p.x * 1.2 + (p.y - 1.84) * 1.8) < 0.03 && p.z > 0.12 && p.y > 1.74;
    // White highlight edge
    const slashWhite = Math.abs(p.x * 0.8 + (p.y - 1.48) * 1.3 + p.z * 0.4 + 0.055) < 0.012 && p.z > 0.08;

    if (slashChest1 || slashFace || slashChest2) return WARPAINT_RED;
    if (slashWhite) return WARPAINT_WHITE;

    // Smooth anatomical shading
    if (n.y < -0.35) return ORC_GREEN_DARK;
    if (n.y > 0.55) return ORC_GREEN_LIGHT;
    return ORC_GREEN;
  });

  // Natural rough fur pattern
  const furPaint = paint((p) => {
    const nVal = noise(p, 0.06);
    return nVal > 0.5 ? FUR_TIP : FUR_BASE;
  });

  // ---------------------------------------------------------------------------
  // Skeleton: Humanoid Rig (Proportions: 2.1 m tall, broad heavy warrior)
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.05, 0], role: "spine", group: "torso" });

  const spine = b.chain(
    "spine",
    [
      [0, 1.05, 0],
      [0, 1.22, 0.01],
      [0, 1.42, 0.03],
      [0, 1.63, 0.02],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    [
      [0, 1.63, 0.02],
      [0, 1.71, 0.05],
      [0, 1.78, 0.08],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck", group: "head" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.78, 0.08],
    aim: [0, 1.95, 0.15],
    role: "head",
    group: "head",
  });

  // Separate lower jaw hinged below & behind mouth
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.77, 0.13],
    aim: [0, 1.74, 0.28],
    role: "jaw",
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // Torso & Pelvis
  // ---------------------------------------------------------------------------
  // Pelvis / Waist
  b.loft(
    [
      { at: [0, 0.94, -0.02], w: 0.38, h: 0.28 },
      { at: [0, 1.05, -0.01], w: 0.42, h: 0.30 },
      { at: [0, 1.18, 0.00], w: 0.40, h: 0.28 },
    ],
    { bone: hips, color: skinWithWarpaint, group: "torso" },
  );

  // Upper Torso / Ribcage / Chest (Powerful V-taper)
  b.loft(
    [
      { at: [0, 1.18, 0.00], w: 0.40, h: 0.28 },
      { at: [0, 1.34, 0.02], w: 0.50, h: 0.33 },
      { at: [0, 1.50, 0.03], w: 0.60, h: 0.37 },
      { at: [0, 1.64, 0.02], w: 0.54, h: 0.35 },
    ],
    { bone: [hips, spine.joints[0], spine.joints[1], chest], color: skinWithWarpaint, group: "torso" },
  );

  // Muscular pecs
  for (const s of [1, -1]) {
    const pecGeo = new THREE.SphereGeometry(0.12, 8, 6);
    pecGeo.scale(1.2, 0.8, 0.65);
    b.part(pecGeo, skinWithWarpaint, {
      bone: chest,
      at: [s * 0.14, 1.48, 0.19],
      dir: [s * 0.2, 0.1, 1],
      group: "torso",
    });

    // Abdominal six-pack definition
    for (let row = 0; row < 3; row++) {
      const abY = 1.33 - row * 0.075;
      const abZ = 0.16 - row * 0.018;
      const abGeo = new THREE.SphereGeometry(0.055, 6, 4);
      abGeo.scale(1.1, 0.65, 0.4);
      b.part(abGeo, skinWithWarpaint, {
        bone: spine.joints[1 - Math.floor(row / 2)],
        at: [s * 0.075, abY, abZ],
        group: "torso",
      });
    }

    // Latissimus dorsi (back muscle flares)
    const latGeo = new THREE.SphereGeometry(0.13, 6, 6);
    latGeo.scale(0.8, 1.3, 0.55);
    b.part(latGeo, skinWithWarpaint, {
      bone: chest,
      at: [s * 0.23, 1.44, -0.05],
      dir: [s * 0.5, 0.8, -0.3],
      group: "torso",
    });

    // Trapezius muscles (sloping shoulders to neck)
    const trapGeo = new THREE.CylinderGeometry(0.05, 0.13, 0.22, 6);
    b.part(trapGeo, skinWithWarpaint, {
      bone: chest,
      at: [s * 0.15, 1.63, 0.01],
      dir: [s * 0.4, 0.8, -0.1],
      group: "torso",
    });
  }

  // Neck tube
  b.sweep(neck, [0.13, 0.12, 0.11], {
    bone: [neck.joints[0], neck.joints[1]],
    color: skinWithWarpaint,
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // Head & Face (Heavy brow, small eyes, pointed ears, separate jaw, tusks)
  // ---------------------------------------------------------------------------
  // Skull / Cranium
  const skullGeo = new THREE.SphereGeometry(0.14, 10, 8);
  skullGeo.scale(1.0, 1.1, 1.05);
  b.part(skullGeo, skinWithWarpaint, {
    bone: head,
    at: [0, 1.88, 0.10],
    group: "head",
  });

  // Heavy Brow ridge (jutting forward aggressively)
  const browGeo = new THREE.BoxGeometry(0.22, 0.055, 0.11);
  b.part(browGeo, skinWithWarpaint, {
    bone: head,
    at: [0, 1.86, 0.22],
    rotation: [15, 0, 0],
    group: "head",
  });

  // Cheekbones
  for (const s of [1, -1]) {
    const cheekGeo = new THREE.SphereGeometry(0.055, 6, 6);
    cheekGeo.scale(1.2, 0.8, 0.85);
    b.part(cheekGeo, skinWithWarpaint, {
      bone: head,
      at: [s * 0.10, 1.80, 0.19],
      group: "head",
    });

    // Small deep-set ferocious eyes
    const eyeSocket = new THREE.SphereGeometry(0.022, 6, 6);
    b.part(eyeSocket, EYE_SCLERA, {
      bone: head,
      at: [s * 0.065, 1.84, 0.215],
      group: "head",
    });
    const eyeIris = new THREE.SphereGeometry(0.014, 6, 6);
    b.part(eyeIris, EYE_YELLOW, {
      bone: head,
      at: [s * 0.065, 1.84, 0.226],
      group: "head",
    });
    const pupilGeo = new THREE.SphereGeometry(0.007, 5, 5);
    b.part(pupilGeo, PUPIL_BLACK, {
      bone: head,
      at: [s * 0.065, 1.84, 0.235],
      group: "head",
    });

    // Pointed Orc Ears (tapered outward, backward and slightly upward)
    const earPath = catmull([
      [s * 0.12, 1.82, 0.09],
      [s * 0.20, 1.87, 0.03],
      [s * 0.27, 1.94, -0.03],
    ]);
    b.sweep(earPath, [0.032, 0.018, 0.004], {
      bone: head,
      caps: "point",
      color: skinWithWarpaint,
      group: "head",
    });
    // Ear piercing / bronze ring on left ear
    if (s === 1) {
      const ringGeo = new THREE.TorusGeometry(0.016, 0.0035, 4, 8);
      b.part(ringGeo, BRONZE_RIVET, {
        bone: head,
        at: [0.23, 1.89, 0.01],
        rotation: [0, 45, 0],
        group: "head",
      });
    }
  }

  // Broad Orc Snout / Flat Nose
  const snoutGeo = new THREE.BoxGeometry(0.08, 0.065, 0.085);
  b.part(snoutGeo, skinWithWarpaint, {
    bone: head,
    at: [0, 1.805, 0.235],
    rotation: [-10, 0, 0],
    group: "head",
  });
  // Nostrils
  for (const s of [1, -1]) {
    const nostrilGeo = new THREE.SphereGeometry(0.011, 5, 5);
    b.part(nostrilGeo, MOUTH_INTERIOR, {
      bone: head,
      at: [s * 0.024, 1.78, 0.27],
      group: "head",
    });
  }

  // Upper lip & mouth cavity
  const upperLipGeo = new THREE.BoxGeometry(0.15, 0.038, 0.075);
  b.part(upperLipGeo, skinWithWarpaint, {
    bone: head,
    at: [0, 1.76, 0.22],
    group: "head",
  });

  // Separate Lower Jaw & Upward Tusks
  // Jaw main body
  const jawMainGeo = new THREE.BoxGeometry(0.17, 0.075, 0.15);
  b.part(jawMainGeo, skinWithWarpaint, {
    bone: jaw,
    at: [0, 1.74, 0.21],
    group: "jaw",
  });
  // Chunky jutting chin
  const chinGeo = new THREE.SphereGeometry(0.065, 6, 6);
  chinGeo.scale(1.2, 0.8, 1.1);
  b.part(chinGeo, skinWithWarpaint, {
    bone: jaw,
    at: [0, 1.72, 0.25],
    group: "jaw",
  });

  // Prominent Upward Lower Tusks & teeth
  for (const s of [1, -1]) {
    // Massive curved lower tusk (pointing up and slightly outward/backward)
    const tuskPath = catmull([
      [s * 0.06, 1.74, 0.26],
      [s * 0.075, 1.82, 0.275],
      [s * 0.085, 1.90, 0.255],
    ]);
    b.sweep(tuskPath, [0.020, 0.013, 0.002], {
      bone: jaw,
      caps: "point",
      color: TUSK_IVORY,
      group: "jaw",
    });

    // Secondary smaller lower incisor
    const smallToothPath = catmull([
      [s * 0.032, 1.75, 0.26],
      [s * 0.038, 1.80, 0.27],
    ]);
    b.sweep(smallToothPath, [0.011, 0.002], {
      bone: jaw,
      caps: "point",
      color: TUSK_IVORY,
      group: "jaw",
    });
  }

  // ---------------------------------------------------------------------------
  // Topknot & Braids (Hair)
  // ---------------------------------------------------------------------------
  // Stubble cap / hair base on top of skull
  const hairBase = new THREE.SphereGeometry(0.115, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.45);
  b.part(hairBase, HAIR_BLACK, {
    bone: head,
    at: [0, 1.93, 0.08],
    group: "head",
  });

  // Topknot tie / bronze clasp
  const claspGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.038, 6);
  b.part(claspGeo, BRONZE_RIVET, {
    bone: head,
    at: [0, 2.01, 0.05],
    rotation: [-20, 0, 0],
    group: "head",
  });

  // Main high ponytail plume flowing backward
  const plumePath = catmull([
    [0, 2.02, 0.05],
    [0, 2.09, 0.01],
    [0.02, 2.05, -0.11],
    [0, 1.94, -0.22],
    [-0.02, 1.78, -0.30],
  ]);
  b.sweep(plumePath, [0.038, 0.048, 0.032, 0.018, 0.004], {
    bone: head,
    caps: "point",
    color: HAIR_BLACK,
    group: "head",
  });

  // Braids hanging down from temples/back of head
  for (const s of [1, -1]) {
    const braidPath = catmull([
      [s * 0.075, 1.96, 0.03],
      [s * 0.11, 1.88, -0.03],
      [s * 0.12, 1.75, -0.06],
      [s * 0.10, 1.60, -0.04],
    ]);
    b.sweep(braidPath, [0.018, 0.015, 0.012, 0.005], {
      bone: head,
      caps: "point",
      color: HAIR_BLACK,
      group: "head",
    });
    // Braid bronze ring bead
    const beadGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.018, 5);
    b.part(beadGeo, BRONZE_RIVET, {
      bone: head,
      at: [s * 0.12, 1.75, -0.06],
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // Legs & Feet (Sturdy, muscular orc legs, leather/fur wraps, iron-reinforced boots)
  // ---------------------------------------------------------------------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const hipAt: [number, number, number] = [s * 0.19, 0.98, -0.02];
    const ankleAt: [number, number, number] = [s * 0.22, 0.16, -0.02];

    const legPts = limb(hipAt, ankleAt, [0.44, 0.44], [[0, 0, 1]]);
    const footBall: [number, number, number] = [s * 0.23, 0.07, 0.12];
    const toeTip: [number, number, number] = [s * 0.23, 0.05, 0.24];

    const legChain = b.chain(`leg${side}`, [...legPts, footBall, toeTip], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.23, 0, 0.10],
      group: `leg${side}`,
    });

    const kneeJoint = legChain.joints[1];
    const ankleJoint = legChain.joints[2];

    // Thigh (massive muscular taper)
    const thighPath = catmull([legPts[0], legPts[1]]);
    b.sweep(thighPath, [0.16, 0.17, 0.135], {
      bone: [legChain.joints[0], kneeJoint],
      color: skinWithWarpaint,
      group: `leg${side}`,
    });

    // Calf / Shin
    const calfPath = catmull([legPts[1], legPts[2]]);
    b.sweep(calfPath, [0.13, 0.145, 0.105], {
      bone: [kneeJoint, ankleJoint],
      color: LEATHER_DARK,
      group: `leg${side}`,
    });

    // Leather greaves / boot shin guard with iron plates
    const greaveGeo = new THREE.CylinderGeometry(0.115, 0.095, 0.26, 6, 1, false, 0, Math.PI * 1.2);
    b.part(greaveGeo, IRON_DARK, {
      bone: kneeJoint,
      at: [s * 0.21, 0.36, 0.02],
      rotation: [0, s * 45, 0],
      group: `leg${side}`,
    });

    // Spiked knee guard
    const kneeCapGeo = new THREE.SphereGeometry(0.085, 6, 5);
    b.part(kneeCapGeo, IRON_METAL, {
      bone: kneeJoint,
      at: [legPts[1].x, legPts[1].y, legPts[1].z + 0.07],
      group: `leg${side}`,
    });
    b.spike(
      [legPts[1].x, legPts[1].y, legPts[1].z + 0.12],
      [0, 0, 1],
      0.08,
      0.024,
      { bone: kneeJoint, color: IRON_EDGE, group: `leg${side}` },
    );

    // Sculpted boot body: fits anatomically
    b.loft(
      [
        { at: [s * 0.22, 0.16, -0.02], w: 0.16, h: 0.16 },
        { at: [s * 0.23, 0.09, 0.05], w: 0.17, h: 0.13 },
        { at: [s * 0.23, 0.06, 0.16], w: 0.16, h: 0.11 },
        { at: [s * 0.23, 0.04, 0.22], w: 0.13, h: 0.08 },
      ],
      { bone: ankleJoint, color: LEATHER_DARK, group: `leg${side}` },
    );

    // Boot sole touching ground at y = 0
    const soleGeo = new THREE.BoxGeometry(0.17, 0.04, 0.32);
    b.part(soleGeo, IRON_DARK, {
      bone: ankleJoint,
      at: [s * 0.23, 0.02, 0.10],
      group: `leg${side}`,
    });

    // Iron toe-cap
    const toeCapGeo = new THREE.SphereGeometry(0.07, 6, 5);
    toeCapGeo.scale(1.2, 0.6, 0.9);
    b.part(toeCapGeo, IRON_METAL, {
      bone: ankleJoint,
      at: [s * 0.23, 0.04, 0.21],
      group: `leg${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Belts, Bandolier & Fur Loincloth
  // ---------------------------------------------------------------------------
  // Heavy double leather waist belt - skinned to hips & spine1 so it flexes cleanly
  b.loft(
    [
      { at: [0, 1.02, 0.00], w: 0.44, h: 0.32 },
      { at: [0, 1.08, 0.01], w: 0.45, h: 0.33 },
      { at: [0, 1.14, 0.01], w: 0.43, h: 0.31 },
    ],
    { bone: [hips, spine.joints[0]], color: LEATHER_DARK, group: "torso" },
  );

  // Massive bronze grotesque belt buckle
  const buckleGeo = new THREE.BoxGeometry(0.13, 0.11, 0.04);
  b.part(buckleGeo, BRONZE_RIVET, {
    bone: hips,
    at: [0, 1.08, 0.19],
    group: "torso",
  });
  const buckleSkull = new THREE.SphereGeometry(0.038, 5, 5);
  b.part(buckleSkull, IRON_METAL, {
    bone: hips,
    at: [0, 1.08, 0.22],
    group: "torso",
  });

  // Fur Loincloth (front flap) - hanging down naturally between legs, skinned to hips
  const loinFront = catmull([
    [0, 1.05, 0.18],
    [0, 0.90, 0.18],
    [0, 0.74, 0.17],
    [0, 0.58, 0.15],
  ]);
  b.sweep(loinFront, [0.15, 0.16, 0.14, 0.09], {
    bone: hips,
    color: furPaint,
    section: "box",
    caps: "flat",
    group: "torso",
  });

  // Fur Loincloth (back flap) - catmull curve only through hips region
  const loinBack = catmull([
    [0, 1.04, -0.17],
    [0, 0.90, -0.17],
    [0, 0.76, -0.16],
    [0, 0.62, -0.14],
  ]);
  b.sweep(loinBack, [0.16, 0.18, 0.15, 0.10], {
    bone: hips,
    color: furPaint,
    section: "box",
    caps: "flat",
    group: "torso",
  });

  // Diagonal Bandolier across chest (from left shoulder to right hip)
  const bandolierPath = catmull([
    [0.24, 1.62, 0.08],
    [0.11, 1.48, 0.20],
    [-0.05, 1.30, 0.19],
    [-0.20, 1.10, 0.13],
    [-0.18, 1.08, -0.11],
    [-0.05, 1.25, -0.17],
    [0.13, 1.45, -0.14],
    [0.24, 1.62, 0.08],
  ], { closed: true });
  b.sweep(bandolierPath, 0.032, {
    bone: [chest, spine.joints[1], spine.joints[0]],
    color: LEATHER_LIGHT,
    section: "box",
    group: "torso",
  });

  // Skulls / trophies and pouches mounted along bandolier
  for (let i = 0; i < 4; i++) {
    const t = 0.12 + i * 0.08;
    const pt = bandolierPath.at(t);
    const pouchGeo = new THREE.BoxGeometry(0.055, 0.075, 0.045);
    b.part(pouchGeo, LEATHER_DARK, {
      bone: chest,
      at: [pt.x, pt.y, pt.z + 0.02],
      group: "torso",
    });
  }

  // ---------------------------------------------------------------------------
  // Arms & Rest Pose (A-pose: arms out and down ~45° clear of body)
  // Right hand holds the two-handed axe; left hand ready in powerful grip
  // ---------------------------------------------------------------------------
  let wristR_joint: Joint | null = null;

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const shoulderAt: [number, number, number] = [s * 0.30, 1.56, 0.03];
    // Rest pose: ~45 degrees out from body
    const elbowAt: [number, number, number] = [s * 0.56, 1.30, 0.08];
    const wristAt: [number, number, number] = [s * 0.80, 1.06, 0.15];

    const armChain = b.chain(
      `arm${side}`,
      [shoulderAt, elbowAt, wristAt],
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
        group: `arm${side}`,
      },
    );

    const shoulderJoint = armChain.joints[0];
    const elbowJoint = armChain.joints[1];
    const wristJoint = armChain.joints[2];

    if (side === "R") {
      wristR_joint = wristJoint;
    }

    // Upper Arm (Biceps & Triceps)
    const upperArmPath = catmull([shoulderAt, elbowAt]);
    b.sweep(upperArmPath, [0.14, 0.16, 0.125], {
      bone: [shoulderJoint, elbowJoint],
      color: skinWithWarpaint,
      group: `arm${side}`,
    });

    // Deltoid muscle cap
    const deltGeo = new THREE.SphereGeometry(0.13, 8, 6);
    deltGeo.scale(1.1, 1.2, 1.1);
    b.part(deltGeo, skinWithWarpaint, {
      bone: shoulderJoint,
      at: [s * 0.33, 1.58, 0.03],
      group: `arm${side}`,
    });

    // Forearm (Heavy muscular taper)
    const forearmPath = catmull([elbowAt, wristAt]);
    b.sweep(forearmPath, [0.125, 0.135, 0.095], {
      bone: [elbowJoint, wristJoint],
      color: skinWithWarpaint,
      group: `arm${side}`,
    });

    // Studded Bracer on forearm
    const bracerGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.22, 8);
    b.part(bracerGeo, LEATHER_DARK, {
      bone: elbowJoint,
      at: [s * 0.68, 1.18, 0.12],
      dir: [s * 0.24, -0.24, 0.07],
      group: `arm${side}`,
    });
    // Bracer metal studs / plates
    for (let r = 0; r < 4; r++) {
      const angle = (r * Math.PI) / 2;
      const studGeo = new THREE.SphereGeometry(0.015, 4, 4);
      b.part(studGeo, BRONZE_RIVET, {
        bone: elbowJoint,
        at: [
          s * 0.68 + Math.cos(angle) * 0.105,
          1.18,
          0.12 + Math.sin(angle) * 0.105,
        ],
        group: `arm${side}`,
      });
    }

    // -------------------------------------------------------------------------
    // Spiked Shoulder Guard (Asymmetrical: massive on left shoulder)
    // -------------------------------------------------------------------------
    if (side === "L") {
      // Tiered curved iron pauldron
      const pauldronGeo = new THREE.SphereGeometry(0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55);
      b.part(pauldronGeo, IRON_DARK, {
        bone: shoulderJoint,
        at: [0.36, 1.68, 0.03],
        rotation: [-15, 0, -35],
        group: "armL",
      });
      // Outer bronze rim
      const rimGeo = new THREE.TorusGeometry(0.20, 0.022, 4, 8);
      b.part(rimGeo, BRONZE_RIVET, {
        bone: shoulderJoint,
        at: [0.36, 1.65, 0.03],
        rotation: [-15, 0, -35],
        group: "armL",
      });

      // Menacing Spikes protruding from shoulder guard
      const spikeDirections = [
        [0.2, 0.8, 0.2],
        [0.6, 0.6, -0.2],
        [0.5, 0.4, 0.5],
        [-0.1, 0.8, -0.4],
      ];
      for (const sDir of spikeDirections) {
        const spikeBase: [number, number, number] = [
          0.36 + sDir[0] * 0.17,
          1.68 + sDir[1] * 0.17,
          0.03 + sDir[2] * 0.17,
        ];
        b.spike(
          spikeBase,
          sDir,
          0.15,
          0.032,
          { bone: shoulderJoint, color: IRON_EDGE, group: "armL" },
        );
      }
    } else {
      // Right shoulder: simple rugged leather strap / small cop
      const copGeo = new THREE.SphereGeometry(0.15, 6, 5, 0, Math.PI * 2, 0, Math.PI * 0.45);
      b.part(copGeo, LEATHER_MED, {
        bone: shoulderJoint,
        at: [-0.34, 1.62, 0.03],
        rotation: [-10, 0, 30],
        group: "armR",
      });
    }

    // -------------------------------------------------------------------------
    // Hands & Fingers (Five digits, powerful clawed humanoid hands)
    // -------------------------------------------------------------------------
    // Palm / Hand core
    const palmGeo = new THREE.BoxGeometry(0.13, 0.09, 0.065);
    b.part(palmGeo, skinWithWarpaint, {
      bone: wristJoint,
      at: [s * 0.87, 0.99, 0.18],
      dir: [s * 0.7, -0.7, 0.2],
      group: `arm${side}`,
    });

    // 5 Fingers
    const fingerDefs = [
      { name: "thumb", offset: [0, 0.035, 0.035], dir: [s * 0.4, -0.3, 0.7], len: 0.085 },
      { name: "index", offset: [s * 0.045, -0.035, 0.025], dir: [s * 0.6, -0.7, 0.2], len: 0.10 },
      { name: "middle", offset: [s * 0.018, -0.045, 0.01], dir: [s * 0.6, -0.7, 0.2], len: 0.11 },
      { name: "ring", offset: [-s * 0.018, -0.045, -0.01], dir: [s * 0.6, -0.7, 0.2], len: 0.10 },
      { name: "pinky", offset: [-s * 0.045, -0.035, -0.025], dir: [s * 0.6, -0.7, 0.2], len: 0.085 },
    ];

    for (const f of fingerDefs) {
      const fBase: [number, number, number] = [
        s * 0.87 + f.offset[0],
        0.99 + f.offset[1],
        0.18 + f.offset[2],
      ];
      const fTip: [number, number, number] = [
        fBase[0] + f.dir[0] * f.len,
        fBase[1] + f.dir[1] * f.len,
        fBase[2] + f.dir[2] * f.len,
      ];
      const fChain = b.chain(
        `${f.name}${side}`,
        [fBase, fTip],
        { parent: wristJoint, names: [`${f.name}1${side}`], role: "digit", group: `arm${side}` },
      );
      b.sweep(fChain, [0.017, 0.011], {
        bone: fChain.joints[0],
        caps: "point",
        color: skinWithWarpaint,
        group: `arm${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Two-Handed Greataxe (held in right hand)
  // Massive brutal orc war weapon: heavy shaft, double-bearded iron blades, spikes
  // ---------------------------------------------------------------------------
  const axeBone = wristR_joint ?? chest;
  const axeCenter: [number, number, number] = [-0.86, 1.00, 0.20];

  // Long sturdy hardwood shaft (~1.6m long, angled aggressively)
  const shaftStart: [number, number, number] = [-0.58, 0.25, -0.15];
  const shaftEnd: [number, number, number] = [-1.12, 1.70, 0.55];
  const shaftPath = catmull([shaftStart, axeCenter, shaftEnd]);

  b.sweep(shaftPath, 0.030, {
    bone: axeBone,
    color: WOOD_DARK,
    section: { ngon: 8 },
    caps: "flat",
    group: "axe",
  });

  // Leather grip wraps around shaft where hand holds it
  const gripPath = catmull([
    [-0.80, 0.85, 0.12],
    [-0.86, 1.00, 0.20],
    [-0.92, 1.15, 0.28],
  ]);
  b.sweep(gripPath, 0.036, {
    bone: axeBone,
    color: LEATHER_LIGHT,
    section: "circle",
    group: "axe",
  });

  // Iron butt cap / spike at base of shaft
  b.spike(shaftStart, [-0.2, -0.8, -0.4], 0.14, 0.032, {
    bone: axeBone,
    color: IRON_METAL,
    group: "axe",
  });

  // Axe Head socket / central iron collar
  const axeHeadAt: [number, number, number] = [-1.06, 1.50, 0.48];
  const collarGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.24, 6);
  b.part(collarGeo, IRON_DARK, {
    bone: axeBone,
    at: axeHeadAt,
    dir: [-0.35, 0.9, 0.4],
    group: "axe",
  });

  // Central Top Thrusting Spike on Axe Head
  b.spike(
    [-1.12, 1.68, 0.54],
    [-0.35, 0.9, 0.4],
    0.28,
    0.042,
    { bone: axeBone, color: IRON_EDGE, group: "axe" },
  );

  // Massive Double-Bearded Iron Axe Blades
  // Primary front blade (huge crescent cleaver with notched edge)
  const frontBladeOutline = [
    [0, 0.08, "sharp"],
    [0.18, 0.12],
    [0.36, 0.28, "sharp"], // upper horn of beard
    [0.34, 0.14],
    [0.35, 0.02, "sharp"], // battle notch
    [0.32, -0.10],
    [0.38, -0.28, "sharp"], // lower beard hook
    [0.16, -0.16],
    [0, -0.08, "sharp"],
  ] as const;
  b.extrude(frontBladeOutline, {
    at: axeHeadAt,
    x: [0.75, 0.35, -0.55],
    y: [-0.35, 0.9, 0.4],
    thickness: [0.05, 0.01],
    bevel: 0.008,
    color: IRON_EDGE,
    bone: axeBone,
    group: "axe",
  });

  // Secondary back blade / armor-piercing war pick
  const backBladeOutline = [
    [0, 0.06, "sharp"],
    [-0.14, 0.08],
    [-0.28, 0.14, "sharp"],
    [-0.24, 0.0],
    [-0.32, -0.12, "sharp"],
    [-0.12, -0.06],
    [0, -0.06, "sharp"],
  ] as const;
  b.extrude(backBladeOutline, {
    at: axeHeadAt,
    x: [0.75, 0.35, -0.55],
    y: [-0.35, 0.9, 0.4],
    thickness: [0.045, 0.01],
    bevel: 0.006,
    color: IRON_DARK,
    bone: axeBone,
    group: "axe",
  });

  // Reinforcing bronze skull emblem on the axe cheek
  const axeSkullGeo = new THREE.SphereGeometry(0.042, 5, 5);
  b.part(axeSkullGeo, BRONZE_RIVET, {
    bone: axeBone,
    at: [axeHeadAt[0] + 0.03, axeHeadAt[1], axeHeadAt[2] + 0.03],
    group: "axe",
  });

  return b.root;
}
