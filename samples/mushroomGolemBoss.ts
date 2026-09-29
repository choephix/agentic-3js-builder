import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { catmull, polyline } from "../src/path";
import { grain, mottle, spots, stripes } from "../src/paint";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Mushroom Golem",
  builtBy: "Gemini 3.8 Flash",
  description:
    "A lumbering 4 m forest dungeon boss made of a giant toadstool: a spotted scarlet cap forms its head and shoulders, a thick stalk forms the torso, with root-bundle legs, long twisted-root arms with knobbly fists, glowing amber eyes, and a gill-lined gaping mouth with an articulated jaw. A miniature mossy hamlet perches on the cap with doll-sized cottages, chimneys, ladder, and swinging lanterns, while bioluminescent fungal clusters sprout across its back as glowing boss weak points.",
};

// =============================================================================
// COLOR PALETTE & MATERIALS
// =============================================================================
const CAP_RED = "#9b1b1b";
const CAP_RED_DARK = "#620e0e";
const WART_CREAM = "#f4ebd0";
const GILL_BEIGE = "#d8cca6";
const GILL_SHADOW = "#8f8260";
const STALK_PALE = "#d5cca9";
const STALK_BARK = "#a09371";
const ROOT_WOOD = "#453224";
const ROOT_DARK = "#281b12";
const ROOT_MOSS = "#48592c";
const MOSS_GREEN = "#3a5323";
const EYE_GLOW = "#ffaa11";
const EYE_CORE = "#fff1a8";
const WEAKPOINT_CYAN = "#17d8b6";
const WEAKPOINT_GLOW = "#7effec";
const COTTAGE_WOOD = "#5c4028";
const COTTAGE_ROOF = "#3a4d2e";
const COTTAGE_STONE = "#78766e";
const LANTERN_GOLD = "#ffcc33";
const ROPE_FIBER = "#9e885c";

type Vec3Tuple = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "mushroomGolemBoss" });

  // ---------------------------------------------------------------------------
  // PAINTS
  // ---------------------------------------------------------------------------
  // Toadstool Cap: deep crimson with white/cream warty fungal spots and subtle mottling
  const capPaint = spots(
    mottle(CAP_RED, CAP_RED_DARK, { size: 0.35, contrast: 0.4, seed: 12 }),
    WART_CREAM,
    { size: 0.28, amount: 0.45, rosette: true, seed: 44 }
  );

  // Stalk Flesh: fibrous spongy mushroom stipe with vertical grain and mossy staining
  const stalkPaint = grain(
    mottle(STALK_PALE, STALK_BARK, { size: 0.4, contrast: 0.3, seed: 7 }),
    ROOT_MOSS,
    { size: 0.08, axis: [0, 1, 0], seed: 9 }
  );

  // Twisted Root Wood: dark gnarly wood grain mixed with creeping moss
  const rootWoodPaint = grain(
    mottle(ROOT_WOOD, ROOT_DARK, { size: 0.3, contrast: 0.5, seed: 19 }),
    ROOT_MOSS,
    { size: 0.05, axis: [0, 1, 0], seed: 23 }
  );

  // Gills Paint: radial fine striations for the mushroom underside
  const gillsPaint = stripes(GILL_BEIGE, GILL_SHADOW, {
    size: 0.045,
    axis: [1, 0, 0],
    wobble: 0.1,
    seed: 5,
  });

  // Weakpoint Shrooms Paint: bioluminescent gradient spots
  const weakpointPaint = spots(WEAKPOINT_CYAN, WEAKPOINT_GLOW, {
    size: 0.08,
    amount: 0.6,
    seed: 88,
  });

  // ---------------------------------------------------------------------------
  // SKELETON HIERARCHY
  // ---------------------------------------------------------------------------
  // Total boss height is ~4.0m.
  // Hips/pelvis root at y = 1.6m.
  // Spine ascends: pelvis (1.6m) -> spine1 (2.05m) -> spine2 (2.50m) -> chest (2.95m).
  // Head joint sits at y = 3.20m, facing forward (+Z).
  // Jaw joint hinges below the cap rim at y = 2.85m.
  const hips = b.joint("hips", {
    at: [0, 1.6, -0.05],
    role: "spine",
    group: "torso",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.6, -0.05],
      [0, 2.05, -0.02],
      [0, 2.50, 0.03],
      [0, 2.95, 0.08],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "torso",
    }
  );
  const chest = spine.joints[2];

  // Head and Cap Root
  const head = b.joint("head", {
    parent: chest,
    at: [0, 3.2, 0.1],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });

  // Articulated Lower Jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.75, 0.45],
    aim: [0, 2.65, 0.95],
    role: "jaw",
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // LEGS & ROOT FEET (Bipedal lumbering stance)
  // ---------------------------------------------------------------------------
  const legSides = [
    { s: 1, side: "L" },
    { s: -1, side: "R" },
  ] as const;

  for (const { s, side } of legSides) {
    const hipPos: Vec3Tuple = [s * 0.55, 1.55, -0.05];
    const footTarget: Vec3Tuple = [s * 0.65, 0.15, 0.10];

    const legPts = limb(
      hipPos,
      footTarget,
      [0.85, 0.80],
      [[0, 0, 1]], // bend knee forward naturally
      { sole: [0, 0, 1] }
    );

    const legChain = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`],
      role: "leg",
      contact: [s * 0.70, 0, 0.20],
      group: `leg${side}`,
    });

    const kneeJoint = legChain.joints[1];

    // Main structural leg trunk
    b.sweep(legChain, (t) => 0.38 * (1 - t) + 0.28 * t, {
      bone: legChain,
      color: stalkPaint,
      section: "circle",
    });

    // Outer bundle of twisted woody roots wrapping the thigh and shin
    const rootBundlePath1 = catmull([
      [s * 0.62, 1.65, -0.15],
      [s * 0.72, 1.25, 0.10],
      [s * 0.58, 0.85, 0.25],
      [s * 0.65, 0.45, 0.18],
      [s * 0.85, 0.08, 0.35],
    ]);
    b.sweep(rootBundlePath1, (t) => 0.12 * (1 - t) + 0.06 * t, {
      bone: [legChain.joints[0], kneeJoint],
      color: rootWoodPaint,
    });

    const rootBundlePath2 = catmull([
      [s * 0.42, 1.60, 0.10],
      [s * 0.38, 1.15, -0.15],
      [s * 0.68, 0.75, -0.12],
      [s * 0.75, 0.35, -0.05],
      [s * 0.90, 0.08, -0.15],
    ]);
    b.sweep(rootBundlePath2, (t) => 0.10 * (1 - t) + 0.05 * t, {
      bone: [legChain.joints[0], kneeJoint],
      color: rootWoodPaint,
    });

    // Knobbly root foot claw splay resting on floor (y=0)
    // To ensure the lowest surface point touches y=0, we align the underside of the roots to y=0.
    const footBase: Vec3Tuple = [s * 0.70, 0.12, 0.15];
    const toes = [
      { dir: [s * 0.2, -0.06, 0.45] as Vec3Tuple, r0: 0.10, r1: 0.04 }, // main front root toe
      { dir: [s * 0.4, -0.06, 0.25] as Vec3Tuple, r0: 0.09, r1: 0.035 }, // outer front toe
      { dir: [s * -0.25, -0.06, 0.35] as Vec3Tuple, r0: 0.08, r1: 0.035 }, // inner toe
      { dir: [s * 0.15, -0.06, -0.35] as Vec3Tuple, r0: 0.09, r1: 0.035 }, // heel anchor root
    ];
    for (const toe of toes) {
      const tipY = toe.r1 + 0.0041;
      const toeTip: Vec3Tuple = [
        footBase[0] + toe.dir[0],
        tipY,
        footBase[2] + toe.dir[2],
      ];
      const midY = (footBase[1] + tipY) * 0.5;
      b.sweep(
        catmull([
          footBase,
          [
            footBase[0] + toe.dir[0] * 0.5,
            midY,
            footBase[2] + toe.dir[2] * 0.5,
          ],
          toeTip,
        ]),
        [toe.r0, toe.r1],
        {
          bone: kneeJoint,
          color: rootWoodPaint,
          caps: { start: "round", end: "round" },
        }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // TORSO & MASSIVE STALK
  // ---------------------------------------------------------------------------
  // Thick fungal body stalk swept along hips -> chest
  const spineCurve = catmull([
    [0, 1.45, -0.08],
    [0, 1.95, -0.03],
    [0, 2.45, 0.02],
    [0, 2.95, 0.08],
  ]);
  b.sweep(
    spineCurve,
    (t) => [0.68 * (1 - t) + 0.85 * t, 0.55 * (1 - t) + 0.72 * t], // [rx, ry]
    {
      bone: [hips, spine.joints[0], spine.joints[1], chest],
      color: stalkPaint,
      section: "circle",
    }
  );

  // Knobbly bark/root tendrils bracing the stalk
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const rx = Math.cos(angle);
    const rz = Math.sin(angle);
    const ribPath = catmull([
      [rx * 0.65, 1.5 + (i % 2) * 0.2, rz * 0.55],
      [rx * 0.75, 2.2 + ((i + 1) % 2) * 0.15, rz * 0.65],
      [rx * 0.72, 2.85, rz * 0.62],
    ]);
    b.sweep(ribPath, (t) => Math.sin(t * Math.PI) * 0.06 + 0.04, {
      bone: [hips, chest],
      color: rootWoodPaint,
    });
  }

  // Spongy fungal collar/annulus skirt just under the cap
  const collarPath = catmull(
    [
      [0.92, 2.88, 0.0],
      [0.65, 2.85, 0.65],
      [0.0, 2.82, 0.82],
      [-0.65, 2.85, 0.65],
      [-0.92, 2.88, 0.0],
      [-0.65, 2.85, -0.65],
      [0.0, 2.82, -0.82],
      [0.65, 2.85, -0.65],
    ],
    { closed: true }
  );
  b.sweep(collarPath, [0.08, 0.14], {
    bone: chest,
    color: GILL_BEIGE,
  });

  // ---------------------------------------------------------------------------
  // ARMS & KNOBBLY ROOT FISTS (Humanoid rest pose, held out from body)
  // ---------------------------------------------------------------------------
  for (const { s, side } of legSides) {
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.35, 2.98, 0.05],
      aim: [s * 0.95, 2.92, 0.0],
      role: "arm",
      group: `arm${side}`,
    });

    const shoulderPos: Vec3Tuple = [s * 0.95, 2.92, 0.0];
    const elbowPos: Vec3Tuple = [s * 1.55, 2.45, -0.05];
    const wristPos: Vec3Tuple = [s * 2.05, 1.95, 0.15];

    const armChain = b.chain(
      `arm${side}`,
      catmull([shoulderPos, elbowPos, wristPos]),
      {
        parent: clavicle,
        names: [`shoulder${side}`, `elbow${side}`],
        role: "arm",
        group: `arm${side}`,
      }
    );
    const shoulderJoint = armChain.joints[0];
    const elbowJoint = armChain.joints[1];
    const wristJoint = b.joint(`wrist${side}`, {
      parent: elbowJoint,
      at: wristPos,
      aim: [s * 2.25, 1.75, 0.25],
      role: "arm",
      group: `arm${side}`,
    });

    // Core muscular root arm
    b.sweep(armChain, (t) => 0.24 * (1 - t) + 0.18 * t, {
      bone: armChain,
      color: rootWoodPaint,
      section: "circle",
    });

    // Secondary wrapping root tendrils on upper and lower arm for twisted-root look
    const vine1 = catmull([
      [s * 0.85, 3.02, 0.12],
      [s * 1.25, 2.75, -0.18],
      [s * 1.62, 2.38, 0.12],
      [s * 1.95, 2.02, -0.08],
      [s * 2.12, 1.85, 0.22],
    ]);
    b.sweep(vine1, (t) => 0.065 * (1 - t) + 0.04 * t, {
      bone: armChain,
      color: rootWoodPaint,
    });

    const vine2 = catmull([
      [s * 0.92, 2.82, -0.15],
      [s * 1.30, 2.60, 0.18],
      [s * 1.50, 2.40, -0.15],
      [s * 1.80, 2.10, 0.15],
      [s * 2.05, 1.80, -0.12],
    ]);
    b.sweep(vine2, (t) => 0.06 * (1 - t) + 0.035 * t, {
      bone: armChain,
      color: rootWoodPaint,
    });

    // Knobbly root fist (palm base + 4 thick wooden fingers + thumb)
    const fistHand = b.joint(`hand${side}`, {
      parent: wristJoint,
      at: wristPos,
      aim: [s * 2.25, 1.75, 0.25],
      role: "arm",
      group: `arm${side}`,
    });

    // Palm bulb
    b.part(new THREE.DodecahedronGeometry(0.24), rootWoodPaint, {
      bone: fistHand,
      at: [s * 2.15, 1.85, 0.20],
      scale: [1.1, 0.9, 1.2],
    });

    // Fingers: knobby segmented roots curling forward
    const fingerDefs = [
      { name: "thumb", off: [s * 0.12, 0.08, 0.15] as Vec3Tuple, reach: [s * 0.18, -0.06, 0.18] as Vec3Tuple, r: 0.07 },
      { name: "index", off: [s * 0.08, -0.08, 0.16] as Vec3Tuple, reach: [s * 0.15, -0.22, 0.18] as Vec3Tuple, r: 0.07 },
      { name: "middle", off: [s * 0.0, -0.10, 0.15] as Vec3Tuple, reach: [s * 0.02, -0.26, 0.15] as Vec3Tuple, r: 0.075 },
      { name: "ring", off: [s * -0.08, -0.08, 0.12] as Vec3Tuple, reach: [s * -0.12, -0.24, 0.10] as Vec3Tuple, r: 0.065 },
      { name: "pinky", off: [s * -0.14, -0.05, 0.06] as Vec3Tuple, reach: [s * -0.18, -0.18, 0.04] as Vec3Tuple, r: 0.055 },
    ];

    for (const f of fingerDefs) {
      const fBase: Vec3Tuple = [
        wristPos[0] + f.off[0],
        wristPos[1] + f.off[1],
        wristPos[2] + f.off[2],
      ];
      const fMid: Vec3Tuple = [
        fBase[0] + f.reach[0] * 0.55 + s * 0.05,
        fBase[1] + f.reach[1] * 0.45 + 0.04,
        fBase[2] + f.reach[2] * 0.55 + 0.06,
      ];
      const fTip: Vec3Tuple = [
        fBase[0] + f.reach[0],
        fBase[1] + f.reach[1],
        fBase[2] + f.reach[2],
      ];

      const fChain = b.chain(
        `${f.name}${side}`,
        catmull([fBase, fMid, fTip]),
        {
          parent: fistHand,
          names: [`${f.name}1${side}`, `${f.name}2${side}`],
          role: "digit",
          group: `arm${side}`,
        }
      );

      b.sweep(fChain, [f.r, 0.03], {
        bone: fChain,
        color: rootWoodPaint,
        caps: { start: "round", end: "point" },
      });
    }

    // Heavy wooden shoulder boss / pauldron
    b.part(
      new THREE.CylinderGeometry(0.32, 0.18, 0.22, 7),
      stalkPaint,
      {
        bone: shoulderJoint,
        at: [s * 0.98, 3.12, -0.02],
        scale: [1.2, 0.8, 1.1],
      }
    );
    // Shelf fungus sprouting from shoulder
    b.part(
      new THREE.CylinderGeometry(0.24, 0.04, 0.06, 6),
      MOSS_GREEN,
      {
        bone: shoulderJoint,
        at: [s * 1.22, 3.15, -0.05],
        scale: [1.4, 1.0, 0.8],
      }
    );
  }

  // ---------------------------------------------------------------------------
  // GIANT TOADSTOOL CAP (Head & Shoulders)
  // ---------------------------------------------------------------------------
  const capProfile: [number, number][] = [
    [0.0, 4.02],      // peak of the mushroom cap / village plateau center
    [0.75, 3.96],     // village plateau area
    [1.18, 3.82],     // gentle roll
    [1.48, 3.55],     // slope
    [1.62, 3.32],     // rim outer edge
    [1.58, 3.22],     // rim bottom turn
    [1.42, 3.16],     // inner margin
    [1.15, 3.12],     // gills outer boundary
    [0.55, 3.10],     // underside chamber towards stalk
    [0.35, 3.14],     // stalk junction
  ];

  b.lathe(capProfile, {
    at: [0, 0, 0.04],
    segments: 24,
    smoothing: 2,
    color: capPaint,
    bone: head,
    group: "head",
    name: "mushroomCap",
  });

  // Gills lining the underside of the cap
  const gillsProfile: [number, number][] = [
    [0.36, 3.13],
    [0.75, 3.11],
    [1.15, 3.13],
    [1.42, 3.17],
    [1.40, 3.19],
    [0.85, 3.14],
    [0.40, 3.16],
  ];
  b.lathe(gillsProfile, {
    at: [0, 0, 0.04],
    segments: 32,
    smoothing: 1,
    color: gillsPaint,
    bone: head,
    group: "head",
  });

  // Hanging fungal veil frills around the cap perimeter (avoiding front mouth area)
  for (let i = 0; i < 14; i++) {
    const rad = (i / 14) * Math.PI * 2;
    const sinA = Math.sin(rad);
    if (sinA > 0.6) continue; // Leave mouth completely unobstructed in front

    const rimX = Math.cos(rad) * 1.55;
    const rimZ = 0.04 + sinA * 1.55;
    const veilDrop = 0.16 + (i % 3) * 0.06;

    b.sweep(
      catmull([
        [rimX, 3.22, rimZ],
        [rimX * 0.98, 3.22 - veilDrop * 0.5, rimZ * 0.98],
        [rimX * 0.95, 3.22 - veilDrop, rimZ * 0.95],
      ]),
      [0.07, 0.01],
      {
        bone: head,
        color: GILL_BEIGE,
      }
    );
  }

  // ---------------------------------------------------------------------------
  // FACE: GLOWING EYES & GILL-LINED GAPING MOUTH
  // ---------------------------------------------------------------------------
  // Pronounced face protruding forward from upper stalk under cap rim
  const faceBrowArch = catmull([
    [-0.55, 3.02, 0.72],
    [-0.32, 3.14, 0.96],
    [0.0, 3.17, 1.05],
    [0.32, 3.14, 0.96],
    [0.55, 3.02, 0.72],
  ]);
  b.sweep(faceBrowArch, [0.11, 0.08], {
    bone: head,
    color: rootWoodPaint,
    section: "circle",
  });

  // Baleful glowing amber eyes situated boldly on the face under the cap brow
  for (const s of [1, -1]) {
    // Carved eye socket frame
    b.part(
      new THREE.CylinderGeometry(0.14, 0.16, 0.09, 8),
      ROOT_DARK,
      {
        bone: head,
        at: [s * 0.34, 3.12, 1.02],
        aim: [s * 0.36, 3.10, 1.25],
      }
    );

    // Glowing eyeball core
    b.part(
      new THREE.SphereGeometry(0.11, 14, 12),
      EYE_GLOW,
      {
        bone: head,
        at: [s * 0.34, 3.12, 1.08],
      }
    );
    // Bright hot pupil highlight
    b.part(
      new THREE.SphereGeometry(0.055, 10, 10),
      EYE_CORE,
      {
        bone: head,
        at: [s * 0.33, 3.13, 1.16],
      }
    );
  }

  // Upper mouth arch: gaping cavernous maw lined with fungal gills
  const upperMouthArch = catmull([
    [-0.50, 2.92, 0.78],
    [-0.28, 2.98, 0.98],
    [0.0, 3.00, 1.04],
    [0.28, 2.98, 0.98],
    [0.50, 2.92, 0.78],
  ]);
  b.sweep(upperMouthArch, [0.09, 0.08], {
    bone: head,
    color: GILL_SHADOW,
  });

  // Upper fangs / gill teeth hanging from the roof of the mouth
  for (let t = 0.12; t <= 0.88; t += 0.13) {
    const pt = upperMouthArch.at(t);
    b.spike(
      pt,
      [0, -1, 0.2],
      0.16 + Math.sin(t * Math.PI) * 0.09,
      0.035,
      {
        bone: head,
        color: GILL_BEIGE,
      }
    );
  }

  // Articulated Lower Jaw (separate bone)
  // Deep wooden mandibles lined with rows of fungal gill spikes
  const lowerJawArch = catmull([
    [-0.46, 2.82, 0.74],
    [-0.30, 2.68, 1.02],
    [0.0, 2.64, 1.12],
    [0.30, 2.68, 1.02],
    [0.46, 2.82, 0.74],
  ]);

  b.sweep(lowerJawArch, [0.12, 0.09], {
    bone: jaw,
    color: rootWoodPaint,
    section: "circle",
  });

  // Jaw chin plate
  b.part(
    new THREE.DodecahedronGeometry(0.24),
    rootWoodPaint,
    {
      bone: jaw,
      at: [0, 2.60, 1.02],
      scale: [1.3, 0.9, 1.1],
    }
  );

  // Lower teeth spikes
  for (let t = 0.18; t <= 0.82; t += 0.13) {
    const pt = lowerJawArch.at(t);
    b.spike(
      pt,
      [0, 1, 0.2],
      0.14 + Math.sin(t * Math.PI) * 0.08,
      0.03,
      {
        bone: jaw,
        color: GILL_BEIGE,
      }
    );
  }

  // ---------------------------------------------------------------------------
  // WEAK POINTS: BIOLUMINESCENT FUNGAL CLUSTERS SPROUTING ON BACK
  // ---------------------------------------------------------------------------
  const weakpointLocations: { pos: Vec3Tuple; scale: number; boneJoint: Joint }[] = [
    { pos: [0.0, 2.65, -0.62], scale: 1.3, boneJoint: spine.joints[1] },
    { pos: [0.28, 2.85, -0.55], scale: 1.0, boneJoint: chest },
    { pos: [-0.32, 2.75, -0.58], scale: 1.1, boneJoint: chest },
    { pos: [0.45, 2.45, -0.48], scale: 0.85, boneJoint: spine.joints[0] },
    { pos: [-0.38, 2.30, -0.45], scale: 0.9, boneJoint: spine.joints[0] },
    { pos: [0.15, 2.15, -0.52], scale: 1.15, boneJoint: hips },
  ];

  for (let idx = 0; idx < weakpointLocations.length; idx++) {
    const wp = weakpointLocations[idx];
    // Base fungal shelf
    b.part(
      new THREE.CylinderGeometry(0.22 * wp.scale, 0.08 * wp.scale, 0.12 * wp.scale, 8),
      ROOT_DARK,
      {
        bone: wp.boneJoint,
        at: wp.pos,
        dir: [wp.pos[0] * 0.3, 0.2, -1],
      }
    );

    // Cluster of 3-5 glowing weakpoint shrooms per shelf
    const shroomCount = 3 + (idx % 3);
    for (let sIdx = 0; sIdx < shroomCount; sIdx++) {
      const sAngle = (sIdx / shroomCount) * Math.PI * 2;
      const sDist = (0.08 + (sIdx % 2) * 0.05) * wp.scale;
      const shroomStemBase: Vec3Tuple = [
        wp.pos[0] + Math.cos(sAngle) * sDist,
        wp.pos[1] + (sIdx % 2) * 0.04,
        wp.pos[2] + Math.sin(sAngle) * sDist - 0.05,
      ];
      const shroomTip: Vec3Tuple = [
        shroomStemBase[0] + Math.cos(sAngle) * 0.08,
        shroomStemBase[1] + 0.14 * wp.scale,
        shroomStemBase[2] - 0.12 * wp.scale,
      ];

      // Curving stem
      b.sweep(
        catmull([
          shroomStemBase,
          [shroomStemBase[0], shroomStemBase[1] + 0.08, shroomStemBase[2] - 0.05],
          shroomTip,
        ]),
        [0.025 * wp.scale, 0.015 * wp.scale],
        {
          bone: wp.boneJoint,
          color: GILL_BEIGE,
        }
      );

      // Bioluminescent bulbous cap
      b.part(
        new THREE.SphereGeometry(0.075 * wp.scale, 10, 8),
        weakpointPaint,
        {
          bone: wp.boneJoint,
          at: shroomTip,
          scale: [1.1, 1.3, 1.1],
        }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // TINY MOSSY VILLAGE ON TOP OF THE CAP
  // ---------------------------------------------------------------------------
  // Cottage 1: Central Elder Cottage (at x=0.20, z=0.15, y=3.98m)
  const c1Pos: Vec3Tuple = [0.20, 3.98, 0.15];
  b.part(new THREE.BoxGeometry(0.38, 0.24, 0.30), COTTAGE_WOOD, {
    bone: head,
    at: [c1Pos[0], c1Pos[1] + 0.12, c1Pos[2]],
    rotation: [0, 15, 0],
  });
  b.part(new THREE.ConeGeometry(0.32, 0.26, 4), COTTAGE_ROOF, {
    bone: head,
    at: [c1Pos[0], c1Pos[1] + 0.35, c1Pos[2]],
    rotation: [0, 60, 0],
    scale: [1.35, 1.0, 1.15],
  });
  b.part(new THREE.BoxGeometry(0.08, 0.28, 0.08), COTTAGE_STONE, {
    bone: head,
    at: [c1Pos[0] + 0.10, c1Pos[1] + 0.32, c1Pos[2] - 0.07],
  });
  b.part(new THREE.PlaneGeometry(0.06, 0.08), LANTERN_GOLD, {
    bone: head,
    at: [c1Pos[0] + 0.04, c1Pos[1] + 0.12, c1Pos[2] + 0.155],
    axis: "z",
  });

  // Cottage 2: Clifftop Mill / Watch Cottage (at x=-0.45, z=0.28, y=3.92m)
  const c2Pos: Vec3Tuple = [-0.45, 3.92, 0.28];
  b.part(new THREE.BoxGeometry(0.32, 0.20, 0.26), COTTAGE_WOOD, {
    bone: head,
    at: [c2Pos[0], c2Pos[1] + 0.10, c2Pos[2]],
    rotation: [0, -35, 0],
  });
  b.part(new THREE.ConeGeometry(0.26, 0.22, 4), COTTAGE_ROOF, {
    bone: head,
    at: [c2Pos[0], c2Pos[1] + 0.29, c2Pos[2]],
    rotation: [0, 10, 0],
    scale: [1.25, 1.1, 1.05],
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.22, 6), COTTAGE_STONE, {
    bone: head,
    at: [c2Pos[0] - 0.08, c2Pos[1] + 0.28, c2Pos[2] + 0.05],
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.06), LANTERN_GOLD, {
    bone: head,
    at: [c2Pos[0] + 0.02, c2Pos[1] + 0.10, c2Pos[2] + 0.135],
    axis: "z",
  });

  // Cottage 3: Back Hamlet Hut (at x=-0.15, z=-0.38, y=3.94m)
  const c3Pos: Vec3Tuple = [-0.15, 3.94, -0.38];
  b.part(new THREE.BoxGeometry(0.30, 0.18, 0.28), COTTAGE_WOOD, {
    bone: head,
    at: [c3Pos[0], c3Pos[1] + 0.09, c3Pos[2]],
    rotation: [0, 45, 0],
  });
  b.part(new THREE.ConeGeometry(0.25, 0.22, 5), COTTAGE_ROOF, {
    bone: head,
    at: [c3Pos[0], c3Pos[1] + 0.28, c3Pos[2]],
    rotation: [0, 25, 0],
  });

  // Village Lantern Posts with glowing yellow lanterns
  const lanternPosts: Vec3Tuple[] = [
    [0.48, 3.95, 0.22],
    [-0.22, 3.96, 0.40],
    [0.12, 3.92, -0.25],
  ];
  for (const lp of lanternPosts) {
    b.sweep(
      catmull([
        lp,
        [lp[0], lp[1] + 0.25, lp[2]],
        [lp[0] + 0.07, lp[1] + 0.35, lp[2] + 0.04],
      ]),
      [0.02, 0.012],
      {
        bone: head,
        color: COTTAGE_WOOD,
      }
    );
    b.part(new THREE.SphereGeometry(0.04, 8, 6), LANTERN_GOLD, {
      bone: head,
      at: [lp[0] + 0.07, lp[1] + 0.30, lp[2] + 0.04],
    });
  }

  // Wooden Ladder scaling up the side of the cap slope (from rim at y=3.35, r=1.55 to village at y=3.98, r=0.75)
  // Positioned along front-right slope: angle 45 deg, cos=0.707, sin=0.707
  // Path follows 4 points on the arched mushroom dome curve, raised 0.04m above surface
  const ladderCurve = catmull([
    [1.12, 3.42, 1.12],  // near rim (r ≈ 1.58m)
    [0.98, 3.65, 0.98],  // steep slope (r ≈ 1.38m)
    [0.78, 3.88, 0.78],  // crest roll (r ≈ 1.10m)
    [0.55, 4.02, 0.55],  // village plateau entry (r ≈ 0.78m)
  ]);

  // Two ladder side rails separated laterally (normal to direction along cap circumference)
  // Unit vector perpendicular to radial direction: [-sin(45), 0, cos(45)] = [-0.7071, 0, 0.7071]
  for (const railOffset of [-0.08, 0.08]) {
    const railPts: Vec3Tuple[] = [];
    for (let t = 0; t <= 1; t += 0.25) {
      const pt = ladderCurve.at(t);
      railPts.push([
        pt.x - 0.7071 * railOffset,
        pt.y,
        pt.z + 0.7071 * railOffset,
      ]);
    }
    b.sweep(catmull(railPts), 0.022, {
      bone: head,
      color: COTTAGE_WOOD,
    });
  }

  // Ladder rungs
  const rungCount = 8;
  for (let rIdx = 0; rIdx < rungCount; rIdx++) {
    const t = (rIdx + 0.5) / rungCount;
    const pt = ladderCurve.at(t);
    const rA: Vec3Tuple = [pt.x - 0.7071 * 0.08, pt.y, pt.z + 0.7071 * 0.08];
    const rB: Vec3Tuple = [pt.x + 0.7071 * 0.08, pt.y, pt.z - 0.7071 * 0.08];

    b.sweep(polyline([rA, rB]), 0.012, {
      bone: head,
      color: ROPE_FIBER,
    });
  }

  // Stepping stone footpaths connecting the houses
  const pathPoints: Vec3Tuple[] = [
    [-0.22, 3.99, 0.20],
    [-0.10, 4.01, 0.18],
    [0.02, 4.02, 0.12],
    [0.18, 4.01, -0.05],
    [0.08, 4.00, -0.18],
    [-0.04, 3.99, -0.25],
  ];
  for (const pt of pathPoints) {
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.015, 6), COTTAGE_STONE, {
      bone: head,
      at: pt,
      scale: [1.2, 1.0, 0.9],
    });
  }

  // Mini village fence posts
  for (let fIdx = 0; fIdx < 5; fIdx++) {
    const angle = 0.8 + fIdx * 0.25;
    const fx = Math.cos(angle) * 0.72;
    const fz = 0.1 + Math.sin(angle) * 0.72;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 5), COTTAGE_WOOD, {
      bone: head,
      at: [fx, 3.92, fz],
    });
  }

  return b.root;
}
