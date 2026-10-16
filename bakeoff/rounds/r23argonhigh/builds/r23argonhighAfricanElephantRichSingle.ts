import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { lerp, offset } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Low-poly adult African bush elephant with faceted slate hide, continent-shaped flared ears, curved ivory tusks, saddle-backed dorsal ridge, and two-fingered prehensile trunk.",
  style: "low-poly",
  commit: "88fc1f0",
};

// Palette: sun-baked savannah slate greys, warm dust, red-earth mud, and natural ivory
const HIDE_MAIN = "#6d7075";
const HIDE_DORSAL = "#52555a";
const HIDE_LIGHT = "#83868b";
const HIDE_BELLY = "#797678";
const HIDE_DUST = "#7d736b";
const HIDE_MUD = "#68584d";
const HIDE_DARK = "#3e4044";
const HIDE_CREVICE = "#2a2b2e";
const INNER_PINK = "#9c7270";
const TUSK_BASE = "#b89b72";
const TUSK_IVORY = "#e8dec5";
const TUSK_TIP = "#f6f0de";
const NAIL_IVORY = "#cbbca0";
const EYE_AMBER = "#b8762c";
const EYE_PUPIL = "#18171a";
const TAIL_HAIR = "#1f1d1b";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "africanElephant", detail: 0.75 });

  // ============================================================================
  // 1. SKELETON: Pelvis root, saddle spine, croup rump, neck, head, jaw, ears, trunk, tail
  // ============================================================================
  const hips = b.joint("hips", {
    at: [0, 2.3, -0.55],
    dir: [0, 0.02, 1],
    role: "spine",
    group: "torso",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.3, -0.55],
      [0, 2.26, 0.0],
      [0, 2.38, 0.55],
      [0, 2.48, 0.98],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3"],
      role: "spine",
      group: "torso",
    },
  );

  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.48, 0.98],
      [0, 2.52, 1.25],
      [0, 2.56, 1.48],
    ]),
    {
      parent: spine,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "neck",
    },
  );

  const rump = b.chain(
    "rump",
    polyline([
      [0, 2.3, -0.55],
      [0, 2.34, -1.08],
      [0, 2.12, -1.62],
    ]),
    {
      parent: hips,
      names: ["pelvis", "rump"],
      role: "spine",
      group: "torso",
    },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.56, 1.48],
    dir: [0, -0.18, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.14, 1.62],
    aim: [0, 1.94, 2.08],
    role: "jaw",
    group: "head",
  });

  // Trunk chain: 6 joints in a natural resting S-curve with raised two-fingered tip
  const trunkPath = catmull([
    [0, 2.48, 1.96],
    [0, 2.22, 2.22],
    [0, 1.8, 2.36],
    [0, 1.32, 2.42],
    [0, 0.88, 2.48],
    [0, 0.64, 2.66],
    [0, 0.74, 2.86],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    count: 6,
    role: "tentacle",
    group: "trunk",
  });

  const trunkFingerTop = b.joint("trunkFingerTop", {
    parent: trunk,
    at: [0, 0.82, 2.84],
    dir: [0, 0.35, 0.94],
    role: "digit",
    group: "trunk",
  });

  const trunkFingerBot = b.joint("trunkFingerBot", {
    parent: trunk,
    at: [0, 0.66, 2.84],
    dir: [0, -0.1, 0.99],
    role: "digit",
    group: "trunk",
  });

  // Tail chain: 4 joints hanging down from the high rump
  const tailPath = catmull([
    [0, 2.12, -1.62],
    [0, 1.82, -1.82],
    [0, 1.44, -1.9],
    [0, 1.08, -1.88],
    [0, 0.82, -1.83],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: rump,
    count: 4,
    role: "tail",
    group: "tail",
  });

  // ============================================================================
  // 2. TORSO & ANATOMICAL BODY MASSES (African bush elephant saddle-back profile)
  // ============================================================================
  const bodyLoft = b.loft(
    [
      { at: [0, 2.02, -1.72], w: 0.62, h: 0.68 }, // tail base
      { at: [0, 2.18, -1.42], w: 1.18, h: 1.24 }, // rear haunches
      { at: [0, 2.3, -0.96], w: 1.48, h: 1.64 }, // croup / pelvic hump (top y = 3.12)
      { at: [0, 2.22, -0.45], w: 1.56, h: 1.6 }, // concave saddle dip (top y = 3.02)
      { at: [0, 2.22, 0.12], w: 1.64, h: 1.72 }, // barrel ribcage & belly (bot y = 1.36)
      { at: [0, 2.42, 0.78], w: 1.52, h: 1.76 }, // towering shoulder peak (top y = 3.30)
      { at: [0, 2.42, 1.18], w: 1.28, h: 1.48 }, // chest & front shoulders
      { at: [0, 2.48, 1.5], w: 1.02, h: 1.16 }, // neck junction
    ],
    {
      bone: [rump, hips, spine, neck],
      sides: 10,
      smooth: false,
      color: HIDE_MAIN,
      sectors: [
        [-52, 52, HIDE_DORSAL],
        [135, 225, HIDE_BELLY],
      ],
      group: "torso",
      name: "bodyLoft",
    },
  );

  // Dorsal spine ridge: faceted vertebral plates running along the back
  b.along(
    bodyLoft,
    11,
    (at) => {
      b.frustumBox(
        offset(at, [0, -1, 0], 0.04),
        offset(at, [0, 1, -0.15], 0.07),
        [0.22, 0.24],
        [0.1, 0.14],
        {
          color: HIDE_DORSAL,
          smooth: false,
          group: "torso",
        },
      );
    },
    { from: 0.08, to: 0.88 },
  );

  // Sternum / briskets and throat dewlap fold under neck & chest
  b.frustumBox([0, 2.25, 1.52], [0, 1.76, 1.18], [0.58, 0.36], [0.74, 0.44], {
    bone: neck.joints[0],
    color: HIDE_BELLY,
    smooth: false,
    group: "neck",
    name: "throatDewlap",
  });

  b.frustumBox([0, 1.84, 1.26], [0, 1.54, 0.82], [0.78, 0.38], [0.96, 0.42], {
    bone: spine.joints[2],
    color: HIDE_DUST,
    smooth: false,
    group: "torso",
    name: "chestBrisket",
  });

  // Heavy neck skin fold collars behind skull and at shoulder junction
  for (const [idx, zPos, yTop, yBot, wSpan] of [
    [0, 1.36, 3.12, 1.88, 0.62],
    [1, 1.14, 3.2, 1.76, 0.72],
  ] as const) {
    const foldBone = neck.joints[idx];
    for (const s of [1, -1] as const) {
      const side = s > 0 ? "L" : "R";
      const foldCurve = catmull([
        [0, yTop, zPos - 0.04],
        [s * wSpan, (yTop + yBot) * 0.54, zPos + 0.04],
        [s * (wSpan * 0.72), yBot, zPos - 0.02],
      ]);
      b.sweep(foldCurve, [0.065, 0.085, 0.055], {
        bone: foldBone,
        sides: 6,
        smooth: false,
        color: idx === 0 ? HIDE_DARK : HIDE_DORSAL,
        group: "neck",
        name: `neckFold${idx + 1}${side}`,
      });
    }
  }

  // Bilateral shoulder blade humps (scapula) & pelvic iliac crests & flank skin folds
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Prominent scapula ridge rising at the shoulder
    b.frustumBox(
      [s * 0.36, 2.52, 0.86],
      [s * 0.24, 3.34, 0.74],
      [0.44, 0.64],
      [0.24, 0.46],
      {
        bone: spine.joints[2],
        color: HIDE_DORSAL,
        smooth: false,
        group: "torso",
        name: `scapulaHump${side}`,
      },
    );

    // Upper deltoid / lateral shoulder armor facet
    b.frustumBox(
      [s * 0.58, 2.18, 0.84],
      [s * 0.48, 2.88, 0.8],
      [0.38, 0.62],
      [0.28, 0.5],
      {
        bone: spine.joints[2],
        color: HIDE_LIGHT,
        smooth: false,
        group: "torso",
        name: `shoulderPlate${side}`,
      },
    );

    // Pelvic iliac crest hump on the croup
    b.frustumBox(
      [s * 0.42, 2.48, -0.96],
      [s * 0.26, 3.14, -0.98],
      [0.42, 0.58],
      [0.24, 0.42],
      {
        bone: rump.joints[0],
        color: HIDE_DORSAL,
        smooth: false,
        group: "torso",
        name: `pelvicCrest${side}`,
      },
    );

    // Broad haunch plate over upper thigh
    b.frustumBox(
      [s * 0.56, 2.08, -1.08],
      [s * 0.48, 2.74, -1.04],
      [0.38, 0.62],
      [0.28, 0.48],
      {
        bone: rump.joints[0],
        color: HIDE_MAIN,
        smooth: false,
        group: "torso",
        name: `haunchPlate${side}`,
      },
    );

    // Diagonal rib/flank wrinkle ridges along the barrel torso
    for (const [k, zFlank, boneOwner] of [
      [1, 0.38, spine.joints[1]],
      [2, 0.02, spine.joints[0]],
      [3, -0.34, hips],
    ] as const) {
      const creasePath = polyline([
        [s * 0.64, 2.66, zFlank - 0.08],
        [s * 0.8, 2.16, zFlank + 0.04],
        [s * 0.68, 1.66, zFlank - 0.04],
      ]);
      b.sweep(creasePath, [0.045, 0.07, 0.045], {
        bone: boneOwner,
        sides: 5,
        smooth: false,
        color: k % 2 === 1 ? HIDE_DARK : HIDE_LIGHT,
        group: "torso",
        name: `flankFold${k}${side}`,
      });
    }
  }

  // ============================================================================
  // 3. FOUR COLUMNAR LEGS & CUSHIONED FEET (5 front nails, 4 hind nails)
  // ============================================================================
  const frontNailAngles = [-54, -27, 0, 27, 54];
  const hindNailAngles = [-42, -14, 14, 42];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // --- FRONT LEG ---
    const fRoot: [number, number, number] = [s * 0.5, 2.22, 0.82];
    const fTarget: [number, number, number] = [s * 0.48, 0.16, 0.86];
    const fPts = limb(
      fRoot,
      fTarget,
      [0.76, 0.78, 0.58],
      [
        [s * 0.04, 0, -1],
        [0, 0, 1],
      ],
    );

    const legF = b.chain(`legF${side}`, fPts, {
      parent: spine.joints[2],
      names: [`hipF${side}`, `kneeF${side}`, `ankleF${side}`, `footF${side}`],
      role: "leg",
      contact: [s * 0.48, 0, 0.88],
      group: `legF${side}`,
    });

    b.sweep(
      legF,
      (t) => [
        0.31 * (1 - t) + 0.22 * t + (t < 0.4 ? 0.03 : 0),
        0.36 * (1 - t) + 0.23 * t + (t < 0.4 ? 0.04 : 0),
      ],
      {
        sides: 8,
        smooth: false,
        caps: { start: "round", end: "flat" },
        bands: [
          [0.54, HIDE_MAIN],
          [0.8, HIDE_DUST],
          [1.0, HIDE_MUD],
        ],
        group: `legF${side}`,
        name: `sweepLegF${side}`,
      },
    );

    // Baggy elbow & wrist skin folds on front leg
    const elbowF = legF.at(0.38);
    b.frustumBox(
      offset(elbowF.at, [0, 1, 0], 0.08),
      offset(elbowF.at, [0, -1, -0.15], 0.1),
      [0.54, 0.58],
      [0.48, 0.52],
      {
        bone: legF.joints[1],
        color: HIDE_DARK,
        smooth: false,
        group: `legF${side}`,
        name: `elbowFoldF${side}`,
      },
    );

    const wristF = legF.at(0.74);
    b.frustumBox(
      offset(wristF.at, [0, 1, 0], 0.06),
      offset(wristF.at, [0, -1, 0.1], 0.07),
      [0.48, 0.5],
      [0.45, 0.47],
      {
        bone: legF.joints[2],
        color: HIDE_DUST,
        smooth: false,
        group: `legF${side}`,
        name: `wristFoldF${side}`,
      },
    );

    // Front foot pad resting flat on y = 0
    const footFBone = legF.tip!;
    const fFootCenter: [number, number, number] = [s * 0.48, 0, 0.88];
    b.lathe(
      [
        [0, 0],
        [0.27, 0, "sharp"],
        [0.285, 0.055, "sharp"],
        [0.255, 0.15, "sharp"],
        [0.215, 0.24, "sharp"],
        [0, 0.24],
      ],
      {
        at: fFootCenter,
        axis: [0, 1, 0],
        segments: 8,
        bone: footFBone,
        color: HIDE_MUD,
        group: `legF${side}`,
        name: `footPadF${side}`,
      },
    );

    // 5 front toenails (anatomical hallmark of African bush elephant)
    frontNailAngles.forEach((deg, idx) => {
      const rad = ((deg + s * 6) * Math.PI) / 180;
      const nx = Math.sin(rad);
      const nz = Math.cos(rad);
      const nailBase: [number, number, number] = [
        fFootCenter[0] + nx * 0.255,
        0.008,
        fFootCenter[2] + nz * 0.255,
      ];
      const nailTop: [number, number, number] = [
        fFootCenter[0] + nx * 0.235,
        0.105,
        fFootCenter[2] + nz * 0.235,
      ];
      b.frustumBox(nailBase, nailTop, [0.095, 0.065], [0.07, 0.05], {
        bone: footFBone,
        up: [nx, 0, nz],
        color: NAIL_IVORY,
        smooth: false,
        group: `legF${side}`,
        name: `nailF${side}${idx + 1}`,
      });
    });

    // --- HIND LEG ---
    const hRoot: [number, number, number] = [s * 0.48, 2.18, -1.02];
    const hTarget: [number, number, number] = [s * 0.46, 0.16, -1.06];
    const hPts = limb(
      hRoot,
      hTarget,
      [0.78, 0.74, 0.56],
      [
        [s * 0.04, 0, 1],
        [0, 0, -1],
      ],
    );

    const legH = b.chain(`legH${side}`, hPts, {
      parent: rump.joints[0],
      names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`, `footH${side}`],
      role: "leg",
      contact: [s * 0.46, 0, -1.05],
      group: `legH${side}`,
    });

    b.sweep(
      legH,
      (t) => [
        0.31 * (1 - t) + 0.21 * t + (t < 0.42 ? 0.04 : 0),
        0.38 * (1 - t) + 0.23 * t + (t < 0.42 ? 0.05 : 0),
      ],
      {
        sides: 8,
        smooth: false,
        caps: { start: "round", end: "flat" },
        bands: [
          [0.54, HIDE_MAIN],
          [0.8, HIDE_DUST],
          [1.0, HIDE_MUD],
        ],
        group: `legH${side}`,
        name: `sweepLegH${side}`,
      },
    );

    // Stifle & hock skin folds on hind leg
    const kneeH = legH.at(0.39);
    b.frustumBox(
      offset(kneeH.at, [0, 1, 0], 0.08),
      offset(kneeH.at, [0, -1, 0.12], 0.1),
      [0.52, 0.58],
      [0.46, 0.5],
      {
        bone: legH.joints[1],
        color: HIDE_DARK,
        smooth: false,
        group: `legH${side}`,
        name: `kneeFoldH${side}`,
      },
    );

    const hockH = legH.at(0.74);
    b.frustumBox(
      offset(hockH.at, [0, 1, 0], 0.06),
      offset(hockH.at, [0, -1, -0.1], 0.07),
      [0.46, 0.5],
      [0.43, 0.46],
      {
        bone: legH.joints[2],
        color: HIDE_DUST,
        smooth: false,
        group: `legH${side}`,
        name: `hockFoldH${side}`,
      },
    );

    // Hind foot pad resting flat on y = 0
    const footHBone = legH.tip!;
    const hFootCenter: [number, number, number] = [s * 0.46, 0, -1.05];
    b.lathe(
      [
        [0, 0],
        [0.25, 0, "sharp"],
        [0.265, 0.055, "sharp"],
        [0.24, 0.15, "sharp"],
        [0.205, 0.24, "sharp"],
        [0, 0.24],
      ],
      {
        at: hFootCenter,
        axis: [0, 1, 0],
        segments: 8,
        bone: footHBone,
        color: HIDE_MUD,
        group: `legH${side}`,
        name: `footPadH${side}`,
      },
    );

    // 4 hind toenails (anatomical hallmark of African bush elephant)
    hindNailAngles.forEach((deg, idx) => {
      const rad = ((deg + s * 5) * Math.PI) / 180;
      const nx = Math.sin(rad);
      const nz = Math.cos(rad);
      const nailBase: [number, number, number] = [
        hFootCenter[0] + nx * 0.238,
        0.008,
        hFootCenter[2] + nz * 0.238,
      ];
      const nailTop: [number, number, number] = [
        hFootCenter[0] + nx * 0.22,
        0.098,
        hFootCenter[2] + nz * 0.22,
      ];
      b.frustumBox(nailBase, nailTop, [0.092, 0.062], [0.068, 0.048], {
        bone: footHBone,
        up: [nx, 0, nz],
        color: NAIL_IVORY,
        smooth: false,
        group: `legH${side}`,
        name: `nailH${side}${idx + 1}`,
      });
    });
  }

  // ============================================================================
  // 4. HEAD, SKULL DOME, JAW, TUSK SHEATHS, IVORY TUSKS, EYES & TEMPORAL GLANDS
  // ============================================================================
  b.loft(
    [
      { at: [0, 2.66, 1.32], w: 0.92, h: 0.88 }, // occiput
      { at: [0, 2.78, 1.56], w: 1.04, h: 1.02 }, // single rounded-angular African cranial crown
      { at: [0, 2.62, 1.82], w: 0.9, h: 0.86 }, // brow & orbital region
      { at: [0, 2.42, 2.04], w: 0.66, h: 0.62 }, // rostrum / nasal bridge
    ],
    {
      bone: head,
      sides: 8,
      smooth: false,
      color: HIDE_MAIN,
      sectors: [[-55, 55, HIDE_DORSAL]],
      group: "head",
      name: "craniumLoft",
    },
  );

  // Characteristic flat-angled African elephant frontal forehead shield
  b.frustumBox([0, 3.04, 1.62], [0, 2.54, 1.98], [0.74, 0.28], [0.54, 0.22], {
    bone: head,
    color: HIDE_LIGHT,
    smooth: false,
    group: "head",
    name: "foreheadShield",
  });

  // Crown boss plate
  b.frustumBox([0, 3.12, 1.44], [0, 3.24, 1.62], [0.68, 0.22], [0.58, 0.18], {
    bone: head,
    color: HIDE_DORSAL,
    smooth: false,
    group: "head",
    name: "crownBoss",
  });

  // Articulated lower jaw, chin spout, inner mouth cavity & tongue
  b.frustumBox([0, 2.18, 1.56], [0, 1.95, 2.08], [0.54, 0.28], [0.24, 0.16], {
    bone: jaw,
    color: HIDE_BELLY,
    smooth: false,
    group: "head",
    name: "lowerJaw",
  });

  b.frustumBox([0, 2.02, 1.86], [0, 1.9, 2.12], [0.3, 0.18], [0.14, 0.12], {
    bone: jaw,
    color: HIDE_DARK,
    smooth: false,
    group: "head",
    name: "lowerLipSpout",
  });

  b.frustumBox([0, 2.2, 1.66], [0, 2.02, 2.02], [0.38, 0.12], [0.18, 0.08], {
    bone: jaw,
    color: INNER_PINK,
    smooth: false,
    group: "head",
    name: "tongue",
  });

  // Upper palate / inner mouth recess under head
  b.frustumBox([0, 2.28, 1.68], [0, 2.18, 2.0], [0.42, 0.1], [0.24, 0.08], {
    bone: head,
    color: HIDE_CREVICE,
    smooth: false,
    group: "head",
    name: "upperPalate",
  });

  // Bilateral facial structures: cheekbones, tusk alveoli sheaths, ivory tusks, eyes, brows, temporal glands
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Zygomatic cheekbone arch
    b.frustumBox(
      [s * 0.42, 2.4, 1.52],
      [s * 0.38, 2.34, 1.86],
      [0.24, 0.3],
      [0.2, 0.26],
      {
        bone: head,
        color: HIDE_LIGHT,
        smooth: false,
        group: "head",
        name: `cheekArch${side}`,
      },
    );

    // Muscular tusk sheath (alveolus) flanking the trunk base
    const sheathStart: [number, number, number] = [s * 0.27, 2.46, 1.8];
    const sheathEnd: [number, number, number] = [s * 0.32, 2.04, 2.14];
    b.rod(sheathStart, sheathEnd, [0.19, 0.155], {
      bone: head,
      sides: 7,
      smooth: false,
      color: HIDE_MAIN,
      group: "head",
      name: `tuskSheath${side}`,
    });

    // Dark wrinkled cuff at tusk sheath opening
    b.rod(
      lerp(sheathStart, sheathEnd, 0.78),
       offset(sheathEnd, [s * 0.1, -0.6, 0.5], 0.05),
      [0.165, 0.145],
      {
        bone: head,
        sides: 7,
        smooth: false,
        color: HIDE_DARK,
        group: "head",
        name: `tuskCuff${side}`,
      },
    );

    // Sweeping curved ivory tusk
    const tuskCurve = catmull([
      [s * 0.3, 2.18, 1.98], // buried inside sheath
      [s * 0.33, 1.98, 2.18], // emerging from cuff
      [s * 0.37, 1.68, 2.48], // sweeping down and forward
      [s * 0.35, 1.54, 2.8], // lowest curve point
      [s * 0.27, 1.64, 3.06], // curving up and slightly inward to tip
    ]);

    b.sweep(tuskCurve, [0.115, 0.105, 0.088, 0.062, 0.016], {
      bone: head,
      sides: 7,
      smooth: false,
      caps: { start: "flat", end: "point" },
      bands: [
        [0.24, TUSK_BASE],
        [0.78, TUSK_IVORY],
        [1.0, TUSK_TIP],
      ],
      group: "head",
      name: `tusk${side}`,
    });

    // Heavy angular supraorbital brow ridge
    b.frustumBox(
      [s * 0.42, 2.66, 1.66],
      [s * 0.39, 2.62, 1.88],
      [0.2, 0.14],
      [0.16, 0.12],
      {
        bone: head,
        color: HIDE_DARK,
        smooth: false,
        group: "head",
        name: `browRidge${side}`,
      },
    );

    // Wrinkled lower eyelid pouch
    b.frustumBox(
      [s * 0.43, 2.45, 1.68],
      [s * 0.4, 2.43, 1.86],
      [0.16, 0.1],
      [0.14, 0.09],
      {
        bone: head,
        color: HIDE_DORSAL,
        smooth: false,
        group: "head",
        name: `lowerLid${side}`,
      },
    );

    // Eyeball (amber iris), dark pupil, and specular highlight
    b.part(new THREE.OctahedronGeometry(0.058, 1), EYE_AMBER, {
      bone: head,
      at: [s * 0.435, 2.535, 1.77],
      scale: [0.75, 1, 1],
      flat: true,
      group: "head",
      name: `eye${side}`,
    });

    b.part(new THREE.OctahedronGeometry(0.036, 0), EYE_PUPIL, {
      bone: head,
      at: [s * 0.468, 2.535, 1.785],
      flat: true,
      group: "head",
      name: `pupil${side}`,
    });

    // Protective upper eyelashes (3 faceted spikes per eye)
    for (const [lIdx, zOff] of [
      [1, -0.035],
      [2, 0.0],
      [3, 0.035],
    ] as const) {
      b.spike(
        [s * 0.44, 2.58, 1.77 + zOff],
        [s * 0.9, -0.25, 0.25],
        0.075,
        0.018,
        {
          bone: head,
          sides: 4,
          smooth: false,
          color: TAIL_HAIR,
          group: "head",
          name: `eyelash${side}${lIdx}`,
        },
      );
    }

    // Temporal gland dark patch behind the eye (signature elephant detail)
    b.frustumBox(
      [s * 0.45, 2.62, 1.54],
      [s * 0.46, 2.44, 1.5],
      [0.12, 0.14],
      [0.09, 0.1],
      {
        bone: head,
        color: HIDE_CREVICE,
        smooth: false,
        group: "head",
        name: `temporalGland${side}`,
      },
    );
  }

  // ============================================================================
  // 5. CONTINENT-SHAPED FLARED AFRICAN EARS (hinged on earL / earR)
  // ============================================================================
  // Y-monotone polygon outline shaped like the continent of Africa
  const earOutline: OutlinePoint[] = [
    [-0.08, -0.22, "sharp"],
    [-0.08, 0.38, "sharp"],
    [0.08, 0.64, "sharp"],
    [0.34, 0.76, "sharp"],
    [0.66, 0.7, "sharp"],
    [0.88, 0.48, "sharp"],
    [0.95, 0.18, "sharp"],
    [0.82, -0.04, "sharp"],
    [0.86, -0.22, "sharp"],
    [0.68, -0.52, "sharp"],
    [0.52, -0.66, "sharp"],
    [0.42, -0.92, "sharp"],
    [0.22, -0.98, "sharp"],
    [0.06, -0.68, "sharp"],
  ];

  const innerEarOutline: OutlinePoint[] = [
    [0.02, -0.18, "sharp"],
    [0.02, 0.32, "sharp"],
    [0.14, 0.52, "sharp"],
    [0.36, 0.6, "sharp"],
    [0.6, 0.54, "sharp"],
    [0.76, 0.36, "sharp"],
    [0.8, 0.14, "sharp"],
    [0.7, -0.2, "sharp"],
    [0.54, -0.46, "sharp"],
    [0.34, -0.76, "sharp"],
    [0.22, -0.8, "sharp"],
    [0.1, -0.52, "sharp"],
  ];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const earJoint = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.42, 2.56, 1.44],
      dir: [s * 0.82, 0.05, -0.57],
      up: [0, 1, 0],
      role: "hinge",
      group: `ear${side}`,
    });

    const earX: [number, number, number] = [s * 0.78, 0, -0.62];
    const earY: [number, number, number] = [s * 0.06, 0.99, -0.04];

    // Main continent-shaped pinna slab
    const earPart = b.extrude(earOutline, {
      at: earJoint.at,
      x: earX,
      y: earY,
      thickness: [0.045, 0.085],
      bevel: 0.014,
      smoothing: 0,
      detail: 0.5,
      bone: earJoint,
      color: HIDE_MAIN,
      group: `ear${side}`,
      name: `earPinna${side}`,
    });

    // Determine front (+Z facing) offset along earPart's thickness axis
    const frontSign = earPart.axis.z >= 0 ? 1 : -1;

    // Paler inner ear recession plate on the front face
    b.extrude(innerEarOutline, {
      at: earPart.local([0, 0, frontSign * 0.022]),
      x: earX,
      y: earY,
      thickness: 0.028,
      smoothing: 0,
      bone: earJoint,
      color: HIDE_BELLY,
      group: `ear${side}`,
      name: `earInner${side}`,
    });

    // Warm pinkish acoustic meatus / tragus fold at ear root
    b.frustumBox(
      earPart.local([0.08, 0.16, frontSign * 0.036]),
      earPart.local([0.16, -0.26, frontSign * 0.036]),
      [0.18, 0.08],
      [0.12, 0.06],
      {
        bone: earJoint,
        color: INNER_PINK,
        smooth: false,
        group: `ear${side}`,
        name: `earTragus${side}`,
      },
    );

    // Thickened rolled dorsal ear rim along the top arch
    const topRimPath = polyline([
      earPart.local([-0.04, 0.38, frontSign * 0.025]),
      earPart.local([0.1, 0.64, frontSign * 0.03]),
      earPart.local([0.36, 0.75, frontSign * 0.03]),
      earPart.local([0.66, 0.68, frontSign * 0.025]),
      earPart.local([0.86, 0.46, frontSign * 0.015]),
    ]);
    b.sweep(topRimPath, [0.055, 0.065, 0.06, 0.05, 0.035], {
      bone: earJoint,
      sides: 5,
      smooth: false,
      color: HIDE_DORSAL,
      group: `ear${side}`,
      name: `earTopRim${side}`,
    });

    // 5 radiating cartilage ridges/veins across the ear fan
    const veinTargets: Array<[number, number]> = [
      [0.62, 0.56],
      [0.82, 0.24],
      [0.76, -0.14],
      [0.58, -0.48],
      [0.3, -0.82],
    ];
    veinTargets.forEach(([vu, vv], vIdx) => {
      b.spike(
        earPart.local([0.06, 0.04, frontSign * 0.028]),
        earPart.local([vu, vv, frontSign * 0.024]),
        null,
        0.036,
        {
          bone: earJoint,
          sides: 5,
          smooth: false,
          color: HIDE_LIGHT,
          group: `ear${side}`,
          name: `earVein${side}${vIdx + 1}`,
        },
      );
    });
  }

  // ============================================================================
  // 6. PREHENSILE TRUNK, ANNULAR RING FOLDS & TWO TIP FINGERS
  // ============================================================================
  const trunkSweep = b.sweep(
    trunk,
    (t) => [
      0.22 * (1 - t) + 0.095 * t,
      0.24 * (1 - t) + 0.105 * t,
    ],
    {
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "flat" },
      extend: [0.18, 0],
      color: HIDE_MAIN,
      sectors: [
        [-60, 60, HIDE_DORSAL],
        [135, 225, HIDE_BELLY],
      ],
      group: "trunk",
      name: "trunkSweep",
    },
  );

  // Transverse annular trunk ridges along the dorsal/anterior bridge of the trunk
  b.along(
    trunkSweep,
    13,
    (at) => {
      const wRing = at.radius * 1.95;
      const hRing = at.radius * 0.95;
      b.frustumBox(
        offset(at.at, at.tangent, -0.028),
        offset(at.at, at.tangent, 0.028),
        [wRing, hRing],
        [wRing * 0.92, hRing * 0.88],
        {
          color: at.t < 0.5 ? HIDE_DARK : HIDE_DORSAL,
          smooth: false,
          group: "trunk",
        },
      );
    },
    { from: 0.07, to: 0.92 },
  );

  // African bush elephant's two prehensile trunk fingers (dorsal and ventral)
  b.spike([0, 0.8, 2.81], [0, 0.91, 2.98], null, 0.052, {
    bone: trunkFingerTop,
    sides: 6,
    smooth: false,
    color: HIDE_DORSAL,
    group: "trunk",
    name: "trunkFingerDorsal",
  });

  b.spike([0, 0.67, 2.81], [0, 0.65, 2.97], null, 0.048, {
    bone: trunkFingerBot,
    sides: 6,
    smooth: false,
    color: HIDE_BELLY,
    group: "trunk",
    name: "trunkFingerVentral",
  });

  // Nostril rim & twin dark nostrils at trunk tip
  const tipJoint = trunk.joints[trunk.joints.length - 1];
  b.frustumBox([0, 0.74, 2.8], [0, 0.74, 2.89], [0.17, 0.16], [0.14, 0.13], {
    bone: tipJoint,
    color: INNER_PINK,
    smooth: false,
    group: "trunk",
    name: "nostrilSeptum",
  });

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.frustumBox(
      [s * 0.042, 0.74, 2.82],
      [s * 0.042, 0.74, 2.91],
      [0.055, 0.075],
      [0.045, 0.06],
      {
        bone: tipJoint,
        color: HIDE_CREVICE,
        smooth: false,
        group: "trunk",
        name: `nostrilCavity${side}`,
      },
    );
  }

  // ============================================================================
  // 7. TAIL & COARSE BRISTLE TUFT SWITCH
  // ============================================================================
  b.sweep(tail, [0.08, 0.06, 0.045, 0.036, 0.03], {
    sides: 6,
    smooth: false,
    caps: { start: "round", end: "flat" },
    extend: [0.1, 0],
    bands: [
      [0.75, HIDE_DORSAL],
      [1.0, HIDE_DARK],
    ],
    group: "tail",
    name: "tailSweep",
  });

  const tailTipBone = tail.joints[tail.joints.length - 1];
  // Central flattened bristle switch at tail end
  b.frustumBox([0, 0.88, -1.84], [0, 0.62, -1.81], [0.075, 0.09], [0.13, 0.16], {
    bone: tailTipBone,
    color: TAIL_HAIR,
    smooth: false,
    group: "tail",
    name: "tailSwitchCore",
  });

  b.spike([0, 0.65, -1.81], [0, 0.48, -1.78], null, 0.075, {
    bone: tailTipBone,
    sides: 6,
    smooth: false,
    color: TAIL_HAIR,
    group: "tail",
    name: "tailSwitchTip",
  });

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.spike(
      [s * 0.025, 0.78, -1.83],
      [s * 0.075, 0.54, -1.8],
      null,
      0.048,
      {
        bone: tailTipBone,
        sides: 5,
        smooth: false,
        color: TAIL_HAIR,
        group: "tail",
        name: `tailBristle${side}`,
      },
    );
  }

  return b.root;
}
