import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { mid } from "../src/math";
import type { V3 } from "../src/math";
import { catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { countershade, scales, stripes } from "../src/paint";
import type { Joint } from "../src/skeleton";
import type { OutlinePoint } from "../src/outline";

export const meta = {
  name: "Lizardfolk Hunter",
  description:
    "A humanoid lizard warrior-hunter from a fantasy swamp tribe, standing upright on digitigrade legs with a heavy counterbalancing tail, head crest, toothy jaws, tribal bone harness and spear.",
  builtBy: "Gemini 3.8 Flash",
};

export default function build() {
  const b = createBuilder({ name: "lizardfolkHunter" });

  // -----------------------------------------------------------------------------------------------
  // Palette & Textures
  const SCALE_GREEN = "#265422";
  const SCALE_MID = "#336b2d";
  const SCALE_DARK = "#153313";
  const BELLY_WARM = "#c7b969";
  const BELLY_LIGHT = "#e3d788";
  const BELLY_DARK = "#8f823e";
  const MOUTH_RED = "#781d1d";
  const TOOTH_IVORY = "#f2eed8";
  const EYE_GOLD = "#f0b41f";
  const PUPIL_BLACK = "#0f120e";
  const CREST_ORANGE = "#d65618";
  const CREST_YELLOW = "#f2a027";
  const LEATHER_DARK = "#2e1c12";
  const LEATHER_MED = "#52321c";
  const BONE_WHITE = "#e8dfcb";
  const WOOD_BROWN = "#422e17";
  const FLINT_STONE = "#2e3436";
  const ROPE_FIBER = "#8c7c56";
  const FEATHER_BLUE = "#166075";
  const FEATHER_TEAL = "#269e93";
  const CLAW_BLACK = "#121411";

  // Hide scale paints: rich swamp countershading with scales pattern
  const bodyPaint = countershade(
    scales([SCALE_GREEN, SCALE_MID], SCALE_DARK, { size: 0.038, width: 0.12, seed: 1 }),
    scales([BELLY_WARM, BELLY_LIGHT], BELLY_DARK, { size: 0.042, width: 0.1, seed: 2 }),
    { level: -0.05, soft: 0.3 }
  );

  const crestPaint = stripes(CREST_ORANGE, CREST_YELLOW, { size: 0.026, axis: [0, 1, 0], wobble: 0.25 });

  // -----------------------------------------------------------------------------------------------
  // Skeleton Root & Spine
  // Hips at y = 0.98m. Head reaches ~1.85m, total height with crest ~1.95m.
  const hips = b.joint("hips", { at: [0, 0.98, -0.06], role: "spine", group: "torso" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.06],
      [0, 1.14, -0.03],
      [0, 1.32, 0.02],
      [0, 1.50, 0.06],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" }
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.50, 0.06],
      [0, 1.62, 0.11],
      [0, 1.70, 0.18],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck", group: "neck" }
  );

  // -----------------------------------------------------------------------------------------------
  // Head & Jaws
  // Lizard skull oriented forward (+Z), slightly sloping down
  const headDir: V3 = [0, -0.04, 1];
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.70, 0.18],
    dir: headDir,
    role: "head",
    group: "head",
  });

  // Jaw hinged at the back lower skull, aiming forward along jawline
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, -0.05, 0.06]),
    aim: head.local([0, -0.07, 0.34]),
    role: "jaw",
    group: "head",
  });

  // -----------------------------------------------------------------------------------------------
  // Counterbalancing Heavy Tail
  // Powerful reptilian tail extending backwards, resting gently off floor
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.95, -0.14],
      [0, 0.88, -0.42],
      [0, 0.74, -0.74],
      [0, 0.56, -1.08],
      [0, 0.40, -1.40],
      [0, 0.28, -1.72],
    ]),
    {
      parent: hips,
      count: 6,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
      role: "tail",
      group: "tail",
    }
  );

  // -----------------------------------------------------------------------------------------------
  // Digitigrade Legs & Clawed Feet
  const legSideData = [
    { s: 1, side: "L" },
    { s: -1, side: "R" },
  ] as const;

  for (const { s, side } of legSideData) {
    const hipPos: V3 = [s * 0.17, 0.95, -0.05];
    const footFloorPos: V3 = [s * 0.21, 0.04, 0.10];

    // Digitigrade joints: thigh (hip to knee), shin (knee to hock), metatarsus (hock to ankle/ball)
    // Reaches 0.36 + 0.34 + 0.28 = 0.98m
    const hindPts = limb(
      hipPos,
      footFloorPos,
      [0.36, 0.34, 0.28],
      [
        [0, 0, 1],   // knee forward
        [0, 0, -1],  // hock backward
      ],
      { sole: [0, 0, 1] }
    );

    const leg = b.chain(`leg${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`],
      role: "leg",
      contact: [s * 0.21, 0, 0.16],
      group: `leg${side}`,
    });

    // Muscular thigh, sinewy shank, digitigrade tarsus
    b.sweep(
      leg,
      (t) => [
        (0.115 - 0.052 * t) * (1 - 0.15 * Math.sin(t * Math.PI)),
        0.125 - 0.058 * t,
      ],
      {
        color: bodyPaint,
        group: `leg${side}`,
      }
    );

    // Foot base / heel ball
    const anklePt = hindPts[hindPts.length - 1];
    const footBall: V3 = [anklePt.x, 0.035, anklePt.z + 0.06];

    b.capsule(anklePt, footBall, [0.034, 0.028], {
      bone: leg.joints[2],
      color: bodyPaint,
      group: `leg${side}`,
    });

    // 3 Forward digitigrade toes with claws
    const toeSpreads = [
      { angle: -22, len: 0.14 },
      { angle: 0, len: 0.16 },
      { angle: 22, len: 0.14 },
    ];

    for (let ti = 0; ti < 3; ti++) {
      const spread = toeSpreads[ti];
      const angRad = (spread.angle * Math.PI) / 180;
      const toeDir: V3 = [
        Math.sin(angRad) * 0.75 + s * 0.08,
        -0.08,
        Math.cos(angRad),
      ];

      const toeMid: V3 = [
        footBall[0] + toeDir[0] * spread.len * 0.55,
        0.026,
        footBall[2] + toeDir[2] * spread.len * 0.55,
      ];
      const toeTip: V3 = [
        footBall[0] + toeDir[0] * spread.len,
        0.016,
        footBall[2] + toeDir[2] * spread.len,
      ];

      const toeChain = b.chain(
        `toe${side}${ti + 1}`,
        catmull([footBall, toeMid, toeTip]),
        {
          parent: leg.joints[2],
          role: "digit",
          group: `leg${side}`,
        }
      );

      b.sweep(toeChain, (t) => 0.024 * (1 - 0.45 * t), {
        color: bodyPaint,
        caps: "round",
        group: `leg${side}`,
      });

      // Sharp curved claw touching y = 0
      const clawEnd: V3 = [
        toeTip[0] + toeDir[0] * 0.045,
        0.005,
        toeTip[2] + toeDir[2] * 0.045,
      ];
      b.sweep(
        catmull([toeTip, clawEnd]),
        (t) => 0.010 * (1 - t),
        {
          bone: toeChain.joints[0],
          color: CLAW_BLACK,
          caps: "point",
          group: `leg${side}`,
        }
      );
    }

    // Small rear spur/dewclaw on hock
    b.spike(
      [anklePt.x, anklePt.y + 0.02, anklePt.z - 0.02],
      [0, -0.4, -0.9],
      0.035,
      0.010,
      {
        bone: leg.joints[2],
        color: CLAW_BLACK,
        group: `leg${side}`,
      }
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Arms and Hands: humanoid rest pose (extended sideways, slightly forward)
  // Right hand holds spear, left arm has bone splint bracer
  let wristR_joint: Joint | null = null;
  for (const { s, side } of legSideData) {
    const shoulderPos: V3 = [s * 0.26, 1.46, 0.06];
    const elbowPos: V3 = [s * 0.52, 1.36, 0.10];
    const wristPos: V3 = [s * 0.76, 1.27, 0.15];
    const palmTip: V3 = [s * 0.84, 1.23, 0.17];

    const arm = b.chain(
      `arm${side}`,
      polyline([shoulderPos, elbowPos, wristPos, palmTip]),
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
        group: `arm${side}`,
      }
    );
    if (side === "R") {
      wristR_joint = arm.joints[2];
    }
    // Muscular reptilian bicep/forearm
    b.sweep(
      arm,
      (t) => [
        0.064 - 0.025 * t,
        0.070 - 0.028 * t,
      ],
      {
        color: bodyPaint,
        group: `arm${side}`,
      }
    );

    const wrist = arm.joints[2];

    // Palm
    b.capsule(wrist.at, palmTip, [0.034, 0.028], {
      bone: wrist,
      color: bodyPaint,
      group: `arm${side}`,
    });

    // 4 clawed fingers (Thumb, Index, Middle, Ring)
    const fingerDefs = [
      { name: "thumb", offX: -0.025, offY: -0.02, offZ: 0.05, dirX: 0.5, dirY: -0.5, dirZ: 0.6, len: 0.075 },
      { name: "index", offX: 0.035, offY: 0.01, offZ: 0.03, dirX: 0.8, dirY: -0.2, dirZ: 0.3, len: 0.095 },
      { name: "middle", offX: 0.045, offY: -0.01, offZ: 0.00, dirX: 0.85, dirY: -0.2, dirZ: 0.0, len: 0.105 },
      { name: "ring", offX: 0.035, offY: -0.03, offZ: -0.03, dirX: 0.8, dirY: -0.2, dirZ: -0.25, len: 0.088 },
    ];

    for (const f of fingerDefs) {
      const fBase: V3 = [
        palmTip[0] + s * f.offX,
        palmTip[1] + f.offY,
        palmTip[2] + f.offZ,
      ];
      const fDir: V3 = [s * f.dirX, f.dirY, f.dirZ];
      const fTip: V3 = [
        fBase[0] + fDir[0] * f.len,
        fBase[1] + fDir[1] * f.len,
        fBase[2] + fDir[2] * f.len,
      ];

      const fChain = b.chain(
        `${f.name}${side}`,
        catmull([fBase, mid(fBase, fTip), fTip]),
        {
          parent: wrist,
          role: "digit",
          group: `arm${side}`,
        }
      );

      b.sweep(fChain, (t) => 0.014 * (1 - 0.45 * t), {
        color: bodyPaint,
        caps: "round",
        group: `arm${side}`,
      });

      // Finger Claw
      b.spike(
        fTip,
        [fTip[0] + fDir[0] * 0.032, fTip[1] + fDir[1] * 0.032, fTip[2] + fDir[2] * 0.032],
        null,
        0.009,
        {
          bone: fChain.joints[0],
          color: CLAW_BLACK,
          group: `arm${side}`,
        }
      );
    }

    // Left Forearm Bracer / Vambrace (Bone splints lashed with dark leather)
    if (side === "L") {
      const bracerElbow: V3 = [elbowPos[0] + 0.02, elbowPos[1] - 0.02, elbowPos[2]];
      const bracerWrist: V3 = [wristPos[0] - 0.02, wristPos[1] + 0.01, wristPos[2]];

      for (let bi = 0; bi < 3; bi++) {
        const ang = (-30 + bi * 30) * (Math.PI / 180);
        const sStart: V3 = [
          bracerElbow[0] + Math.sin(ang) * 0.045,
          bracerElbow[1] - 0.01,
          bracerElbow[2] + Math.cos(ang) * 0.045,
        ];
        const sEnd: V3 = [
          bracerWrist[0] + Math.sin(ang) * 0.038,
          bracerWrist[1] + 0.01,
          bracerWrist[2] + Math.cos(ang) * 0.038,
        ];

        b.capsule(sStart, sEnd, [0.009, 0.007], {
          bone: wrist,
          color: BONE_WHITE,
          group: "gear",
        });
      }

      // Leather binding straps on bracer
      b.sweep(
        catmull([
          [bracerElbow[0] + 0.05, bracerElbow[1] - 0.02, bracerElbow[2]],
          [bracerElbow[0], bracerElbow[1] - 0.02, bracerElbow[2] + 0.05],
          [bracerElbow[0] - 0.04, bracerElbow[1] - 0.02, bracerElbow[2]],
          [bracerElbow[0], bracerElbow[1] - 0.02, bracerElbow[2] - 0.05],
          [bracerElbow[0] + 0.05, bracerElbow[1] - 0.02, bracerElbow[2]],
        ]),
        0.011,
        { section: "box", bone: wrist, color: LEATHER_DARK, group: "gear" }
      );
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Torso Loft & Musculature
  const torsoStations = [
    { at: [0, 0.94, -0.06] as V3, w: 0.32, h: 0.28 }, // Pelvis
    { at: [0, 1.12, -0.03] as V3, w: 0.30, h: 0.27 }, // Mid belly
    { at: [0, 1.30, 0.02] as V3, w: 0.36, h: 0.32 },  // Pectorals / Ribcage
    { at: [0, 1.48, 0.06] as V3, w: 0.34, h: 0.30 },  // Shoulders
  ];

  b.loft(torsoStations, {
    bone: [hips, spine.joints[0], spine.joints[1], chest],
    color: bodyPaint,
    group: "torso",
  });

  // Neck Sweep
  b.sweep(
    neck,
    (t) => [0.125 - 0.03 * t, 0.135 - 0.03 * t],
    {
      color: bodyPaint,
      group: "neck",
    }
  );

  // Tail Sweep
  b.sweep(
    tail,
    (t) => [
      0.155 * (1 - t * 0.88),
      0.165 * (1 - t * 0.85),
    ],
    {
      color: bodyPaint,
      group: "tail",
    }
  );

  // Spiny dorsal scutes along spine and tail
  b.along(spine, 6, (at) => {
    b.spike(
      at.moved([0, 0.13, 0]),
      [0, 1, -0.3],
      0.055,
      0.020,
      {
        bone: at.bone ?? chest,
        color: SCALE_DARK,
        group: "torso",
      }
    );
  });

  b.along(tail, 10, (at) => {
    b.spike(
      at.moved([0, 0.11, 0]),
      [0, 1, -0.5],
      0.048 * (1 - at.t * 0.7),
      0.016 * (1 - at.t * 0.6),
      {
        bone: at.bone ?? hips,
        color: SCALE_DARK,
        group: "tail",
      }
    );
  });

  // -----------------------------------------------------------------------------------------------
  // Head Construction: Snout, Jaws, Teeth, Eyes, Horns & Dramatic Frill
  // Snout & Cranium (oriented forward +Z)
  b.loft(
    [
      { at: head.local([0, 0.02, -0.04]), w: 0.20, h: 0.18 }, // Back of skull
      { at: head.local([0, 0.02, 0.10]), w: 0.18, h: 0.16 },  // Mid skull
      { at: head.local([0, 0.00, 0.24]), w: 0.13, h: 0.11 },  // Bridge of snout
      { at: head.local([0, -0.01, 0.36]), w: 0.08, h: 0.07 }, // Snout tip
    ],
    {
      bone: head,
      color: bodyPaint,
      group: "head",
    }
  );

  // Lower Jaw
  b.loft(
    [
      { at: jaw.local([0, -0.02, 0.00]), w: 0.16, h: 0.09 },
      { at: jaw.local([0, -0.02, 0.12]), w: 0.14, h: 0.08 },
      { at: jaw.local([0, -0.01, 0.22]), w: 0.11, h: 0.06 },
      { at: jaw.local([0, 0.00, 0.30]), w: 0.07, h: 0.045 },
    ],
    {
      bone: jaw,
      color: scales([BELLY_WARM, BELLY_LIGHT], BELLY_DARK, { size: 0.038, width: 0.1, seed: 5 }),
      group: "head",
    }
  );

  // Fleshy red mouth interior & tongue
  b.capsule(jaw.local([0, 0.008, 0.05]), jaw.local([0, 0.008, 0.20]), [0.036, 0.014], {
    bone: jaw,
    color: MOUTH_RED,
    group: "head",
  });

  // Vicious rows of sharp ivory teeth (upper and lower jaws)
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      // Upper teeth
      const utPos = head.local([
        s * (0.035 + 0.045 * (1 - t)),
        -0.032,
        0.12 + 0.20 * t,
      ]);
      b.spike(utPos, [0, -1, 0.1], 0.020 - 0.005 * t, 0.006, {
        bone: head,
        color: TOOTH_IVORY,
        group: "head",
      });

      // Lower teeth
      const ltPos = jaw.local([
        s * (0.030 + 0.038 * (1 - t)),
        0.022,
        0.10 + 0.17 * t,
      ]);
      b.spike(ltPos, [0, 1, 0.1], 0.018 - 0.004 * t, 0.0055, {
        bone: jaw,
        color: TOOTH_IVORY,
        group: "head",
      });
    }
  }

  // Golden predator eyes with vertical black pupils
  for (const s of [1, -1]) {
    const eyeSocket = head.local([s * 0.088, 0.05, 0.12]);
    const eyeDir: V3 = [s * 0.8, 0.1, 0.5];

    // Eyeball
    b.part(new THREE.SphereGeometry(0.026, 12, 10), EYE_GOLD, {
      bone: head,
      at: eyeSocket,
      dir: eyeDir,
      group: "head",
    });

    // Slit Pupil
    b.capsule(
      head.local([s * 0.108, 0.065, 0.13]),
      head.local([s * 0.108, 0.035, 0.13]),
      0.0035,
      {
        bone: head,
        color: PUPIL_BLACK,
        group: "head",
      }
    );

    // Heavy scaly brow ridge
    b.capsule(
      head.local([s * 0.055, 0.075, 0.08]),
      head.local([s * 0.098, 0.075, 0.16]),
      0.015,
      {
        bone: head,
        color: SCALE_DARK,
        group: "head",
      }
    );
  }

  // Head Frill / Crest: sweeping fan of 6 bone struts with webbed membrane
  const crestSpineBases: V3[] = [];
  const crestSpineTips: V3[] = [];
  const crestCount = 6;

  for (let ci = 0; ci < crestCount; ci++) {
    const ct = ci / (crestCount - 1);
    // Angled upward and swept backward
    const angleDeg = -15 + ct * 75; // -15 deg (lower back) to 60 deg (high crown)
    const angleRad = (angleDeg * Math.PI) / 180;
    const len = 0.26 + 0.09 * Math.sin(ct * Math.PI);

    // Local coordinates in head frame: +Y forward, +Z up, +X right
    // Crest roots along the rear midline of the skull
    const rootPos = head.local([0, -0.02 - 0.06 * ct, 0.06 + 0.07 * (1 - ct)]);
    // Tip extends up (+Z) and back (-Y)
    const tipPos = head.local([
      0,
      -0.02 - 0.06 * ct - Math.cos(angleRad) * len,
      0.06 + 0.07 * (1 - ct) + Math.sin(angleRad) * len,
    ]);

    // Bone spine
    b.sweep(
      catmull([rootPos, tipPos]),
      (t) => 0.014 * (1 - 0.65 * t),
      {
        bone: head,
        color: BONE_WHITE,
        group: "head",
      }
    );

    crestSpineBases.push([rootPos.x, rootPos.y, rootPos.z]);
    crestSpineTips.push([tipPos.x, tipPos.y, tipPos.z]);
  }

  // Webbed skin membrane stretched between frill spines
  for (let ci = 0; ci < crestCount - 1; ci++) {
    b.membrane(
      polyline([crestSpineBases[ci], crestSpineTips[ci]]),
      polyline([crestSpineBases[ci + 1], crestSpineTips[ci + 1]]),
      {
        thickness: 0.007,
        color: crestPaint,
        bone: head,
        group: "head",
      }
    );
  }

  // Cheek and Jaw Horns
  for (const s of [1, -1]) {
    b.spike(
      head.local([s * 0.095, 0.01, 0.01]),
      head.dir([s * 0.85, 0.1, -0.4]),
      0.09,
      0.020,
      {
        bone: head,
        color: BONE_WHITE,
        group: "head",
      }
    );
    b.spike(
      head.local([s * 0.085, -0.04, 0.04]),
      head.dir([s * 0.75, -0.3, -0.3]),
      0.065,
      0.015,
      {
        bone: head,
        color: BONE_WHITE,
        group: "head",
      }
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Tribal Hunter Gear
  // 1. Leather chest harness with central bone medallion
  // 2. Dangling necklace of swamp beast fangs and teal feathers
  // 3. Waist belt with hide loincloth flaps (front and back) and skull trophy
  // 4. Swamp spear held firmly in the hunter's right hand

  // Crossed Chest Harness
  const harness1 = catmull([
    [0.15, 1.50, 0.15],
    [0.00, 1.32, 0.19],
    [-0.14, 1.12, 0.14],
    [-0.11, 1.06, -0.14],
    [0.00, 1.28, -0.17],
    [0.13, 1.48, -0.11],
    [0.15, 1.50, 0.15],
  ]);
  b.sweep(harness1, 0.022, {
    section: "box",
    bone: chest,
    color: LEATHER_DARK,
    group: "gear",
  });

  const harness2 = catmull([
    [-0.15, 1.50, 0.15],
    [0.00, 1.32, 0.19],
    [0.14, 1.12, 0.14],
    [0.11, 1.06, -0.14],
    [0.00, 1.28, -0.17],
    [-0.13, 1.48, -0.11],
    [-0.15, 1.50, 0.15],
  ]);
  b.sweep(harness2, 0.022, {
    section: "box",
    bone: chest,
    color: LEATHER_DARK,
    group: "gear",
  });

  // Central Carved Bone Medallion
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.018, 8), BONE_WHITE, {
    bone: chest,
    at: [0, 1.32, 0.20],
    dir: [0, 0, 1],
    group: "gear",
  });

  // Tooth Necklace dangling from neck
  const necklacePts = [
    [-0.13, 1.50, 0.15],
    [-0.08, 1.42, 0.20],
    [-0.04, 1.38, 0.22],
    [0.00, 1.37, 0.225],
    [0.04, 1.38, 0.22],
    [0.08, 1.42, 0.20],
    [0.13, 1.50, 0.15],
  ] as const;

  b.sweep(catmull([...necklacePts]), 0.006, {
    bone: chest,
    color: ROPE_FIBER,
    group: "gear",
  });

  for (let ni = 1; ni < necklacePts.length - 1; ni++) {
    const pt = necklacePts[ni];
    const toothLen = 0.042 + 0.018 * (1 - Math.abs(ni - 3) / 3);
    b.spike(
      [pt[0], pt[1], pt[2]],
      [0, -1, 0.2],
      toothLen,
      0.011,
      {
        bone: chest,
        color: BONE_WHITE,
        group: "gear",
      }
    );

    // Decorative swamp feathers on necklace sides
    if (ni === 1 || ni === 5) {
      b.capsule(
        [pt[0], pt[1] - 0.02, pt[2]],
        [pt[0] * 1.3, pt[1] - 0.11, pt[2] + 0.03],
        [0.015, 0.003],
        {
          bone: chest,
          color: FEATHER_TEAL,
          group: "gear",
        }
      );
    }
  }

  // Waist Belt
  const beltPath = catmull([
    [0.18, 1.01, 0.00],
    [0.15, 1.00, 0.13],
    [0.00, 0.99, 0.16],
    [-0.15, 1.00, 0.13],
    [-0.18, 1.01, 0.00],
    [-0.15, 1.01, -0.13],
    [0.00, 1.02, -0.16],
    [0.15, 1.01, -0.13],
    [0.18, 1.01, 0.00],
  ]);

  b.sweep(beltPath, 0.030, {
    section: "box",
    bone: hips,
    color: LEATHER_DARK,
    group: "gear",
  });

  // Loincloth Front Flap
  const loinclothFront: V3[] = [
    [-0.11, 0.98, 0.16],
    [0.11, 0.98, 0.16],
    [0.09, 0.65, 0.15],
    [0.00, 0.58, 0.15],
    [-0.09, 0.65, 0.15],
  ];

  b.slab(loinclothFront, {
    thickness: 0.010,
    bone: hips,
    color: LEATHER_MED,
    group: "gear",
  });

  // Loincloth Back Flap
  const loinclothBack: V3[] = [
    [0.11, 1.00, -0.16],
    [-0.11, 1.00, -0.16],
    [-0.10, 0.72, -0.21],
    [0.00, 0.66, -0.22],
    [0.10, 0.72, -0.21],
  ];

  b.slab(loinclothBack, {
    thickness: 0.010,
    bone: hips,
    color: LEATHER_MED,
    group: "gear",
  });

  // Belt Skull Trophy
  const trophyPos: V3 = [-0.16, 0.92, 0.08];
  b.part(new THREE.BoxGeometry(0.055, 0.045, 0.075), BONE_WHITE, {
    bone: hips,
    at: trophyPos,
    dir: [-0.6, -0.4, 0.7],
    group: "gear",
  });
  b.spike(
    [trophyPos[0] - 0.02, trophyPos[1] - 0.02, trophyPos[2] + 0.02],
    [-0.5, -0.8, 0.3],
    0.045,
    0.010,
    {
      bone: hips,
      color: BONE_WHITE,
      group: "gear",
    }
  );

  // -----------------------------------------------------------------------------------------------
  // Held in the right hand: shaft runs through right hand grip point [-0.76, 1.25, 0.16]
  // Total length: ~2.4m, rests with bottom near floor (y = 0.05m) and tip high above (y = 2.45m)
  // Attached to wristR bone
  const spearBone = wristR_joint ?? chest;
  const spearBottom: V3 = [-0.78, 0.06, 0.14];
  const spearBladeBase: V3 = [-0.74, 2.10, 0.18];

  // Wooden Spear Shaft
  b.sweep(
    polyline([spearBottom, spearBladeBase]),
    0.016,
    {
      bone: spearBone,
      color: WOOD_BROWN,
      group: "weapon",
    }
  );

  // Leather grip wraps around right hand
  b.sweep(
    polyline([
      [-0.77, 1.15, 0.15],
      [-0.75, 1.35, 0.17],
    ]),
    0.022,
    {
      bone: spearBone,
      color: LEATHER_DARK,
      group: "weapon",
    }
  );

  // Knapped Flint Spearhead
  const flintOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.040, 0.10],
    [0.034, 0.22],
    [0.0, 0.34, "sharp"],
    [-0.034, 0.22],
    [-0.040, 0.10],
  ];

  b.extrude(flintOutline, {
    at: spearBladeBase,
    x: [0.8, 0, -0.6],
    y: [0.02, 1, 0.02],
    thickness: 0.016,
    bevel: 0.004,
    bone: spearBone,
    color: FLINT_STONE,
    group: "weapon",
  });

  // Bone barb tied beneath spearhead
  b.spike(
    [-0.75, 2.06, 0.17],
    [-0.8, -0.4, 0.2],
    0.09,
    0.014,
    {
      bone: spearBone,
      color: BONE_WHITE,
      group: "weapon",
    }
  );

  // Plant fiber rope binding
  b.sweep(
    polyline([
      [-0.75, 2.00, 0.17],
      [-0.74, 2.11, 0.18],
    ]),
    0.022,
    {
      bone: spearBone,
      color: ROPE_FIBER,
      group: "weapon",
    }
  );

  // Decorative feathers tied to spear
  for (let fi = 0; fi < 3; fi++) {
    const fAng = (fi * 120 * Math.PI) / 180;
    const fTipPt: V3 = [
      spearBladeBase[0] + Math.cos(fAng) * 0.07,
      spearBladeBase[1] - 0.16,
      spearBladeBase[2] + Math.sin(fAng) * 0.07,
    ];
    b.capsule(
      [-0.74, 2.04, 0.175],
      fTipPt,
      [0.016, 0.003],
      {
        bone: spearBone,
        color: fi % 2 === 0 ? FEATHER_BLUE : FEATHER_TEAL,
        group: "weapon",
      }
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Posing
  // Rest pose: jaw slightly ajar (15 deg) so the menacing teeth and mouth read clearly
  b.pose(jaw, { axis: [1, 0, 0], deg: 15 });

  return b.root;
}
