import { BoxGeometry, CylinderGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { aim, rng } from "../src/math";
import type { V3 } from "../src/math";
import { gradient, patches } from "../src/paint";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Reticulated Giraffe",
  description:
    "An adult reticulated giraffe standing 5 m tall: sloping back, long neck with an upright mane, ossicones, dark tongue and a coat of liver-brown patches split by cream lines.",
  builtBy: "Gemini 3.8 Flash",
};

// Colours
const CREAM = "#f6f1df";
const COAT_BROWN = "#6b3318";
const COAT_BROWN_DARK = "#4a210f";
const COAT_BROWN_LIGHT = "#844120";
const MUZZLE_GREY = "#342e2b";
const TONGUE_DARK = "#1a1a2b";
const EYE_DARK = "#120e0d";
const EYE_GLINT = "#ffffff";
const OSSICONE_TUFT = "#1a1410";
const HOOF_DARK = "#1a1715";
const MANE_DARK = "#4e2716";
const TAIL_TUFT = "#16120f";

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  // Reticulated coat pattern: polygon-like liver patches separated by thin cream lines
  const giraffeCoat = patches(CREAM, [COAT_BROWN, COAT_BROWN_DARK, COAT_BROWN_LIGHT], {
    size: 0.16,
    gap: 0.08,
    seed: 42,
  });

  // Gradient paint for legs fading into cream socks
  const legCoat = gradient(giraffeCoat, CREAM, [0, 1.2, 0], [0, 0.45, 0]);

  // Mane SVG card texture
  const maneSvg = svg(
    `<svg viewBox="0 0 40 80">
      <defs>
        <linearGradient id="mg" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#4e2716"/>
          <stop offset="60%" stop-color="#70381e"/>
          <stop offset="100%" stop-color="#2a160d"/>
        </linearGradient>
      </defs>
      <path d="M 5 80 L 7 30 L 10 5 L 14 35 L 18 2 L 23 28 L 27 8 L 31 38 L 35 15 L 37 80 Z" fill="url(#mg)" />
    </svg>`,
    { size: 128 },
  );

  // Tail tuft SVG
  const tuftSvg = svg(
    `<svg viewBox="0 0 60 120">
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3d2215"/>
          <stop offset="100%" stop-color="#140f0c"/>
        </linearGradient>
      </defs>
      <path d="M 25 0 Q 15 50 2 120 Q 30 110 35 120 Q 42 60 35 0 Z" fill="url(#tg)"/>
      <path d="M 28 0 Q 32 40 55 115 Q 40 105 32 120 Q 25 70 28 0 Z" fill="url(#tg)" opacity="0.8"/>
    </svg>`,
    { size: 128 },
  );

  // -----------------------------------------------------------------------------------------------------------------
  // 1. Skeleton: Spine, Hips, Chest, Neck, Head
  // -----------------------------------------------------------------------------------------------------------------
  const pelvisPos: V3 = [0, 2.55, -0.85];
  const hips = b.joint("hips", { at: pelvisPos, role: "spine", group: "body" });

  // Spine curve through torso and up to withers
  const spinePoints: V3[] = [
    pelvisPos,
    [0, 2.75, -0.4],  // lumbar
    [0, 3.0, 0.1],    // mid-back
    [0, 3.25, 0.65],  // withers / base of neck
  ];
  const spine = b.chain("spine", catmull(spinePoints), {
    parent: hips,
    count: 3,
    names: ["lumbar", "back", "withers"],
    role: "spine",
    group: "body",
  });

  const withersJoint = spine.joints[2];

  // Neck chain: starts embedded in withers
  const neckPoints: V3[] = [
    [0, 3.12, 0.52],
    [0, 3.32, 0.70],
    [0, 3.70, 0.98],
    [0, 4.08, 1.28],
    [0, 4.46, 1.58],
    [0, 4.85, 1.85],
  ];
  const neck = b.chain("neck", catmull(neckPoints), {
    parent: withersJoint,
    count: 5,
    names: ["cervical1", "cervical2", "cervical3", "cervical4", "cervical5"],
    role: "neck",
    group: "neck",
  });

  const pollJoint = neck.joints[4];

  // Head: use a Region with quat = aim(headDir, [0, 1, 0], "z") so:
  // +Z is along the snout forward
  // +Y is up (forehead / crown)
  // +X is to creature left (+X world)
  const headPos: V3 = [0, 4.88, 1.88];
  const headDir: V3 = [0, -0.22, 0.98]; // pointing forward and slightly down
  const skull = b.joint("head", {
    parent: pollJoint,
    at: headPos,
    dir: headDir,
    role: "head",
    group: "head",
  });

  const headRegion = b.region({
    at: skull,
    quat: aim(headDir, [0, 1, 0], "z"),
    bone: skull,
  });

  // Jaw joint: hinged at back/under skull, aiming forward along jaw
  const jaw = headRegion.joint("jaw", {
    parent: skull,
    at: [0, -0.09, 0.06],
    aim: [0, -0.12, 0.45],
    role: "jaw",
    group: "jaw",
  });

  // Tail chain: hanging down from pelvis
  const tailPoints: V3[] = [
    [0, 2.5, -0.92],
    [0, 2.1, -0.98],
    [0, 1.7, -1.02],
    [0, 1.35, -1.04],
  ];
  const tail = b.chain("tail", catmull(tailPoints), {
    parent: hips,
    count: 3,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
    group: "tail",
  });

  // -----------------------------------------------------------------------------------------------------------------
  // 2. Torso: Body Loft & Neck Sweep
  // -----------------------------------------------------------------------------------------------------------------
  const torsoStations = [
    { at: [0, 2.52, -0.9] as const, w: 0.62, h: 0.68 },   // rump / pelvis
    { at: [0, 2.68, -0.4] as const, w: 0.68, h: 0.78 },   // loin / belly
    { at: [0, 2.92, 0.15] as const, w: 0.72, h: 0.95 },   // deep mid-chest
    { at: [0, 3.22, 0.65] as const, w: 0.65, h: 0.98 },   // withers & briskets
    { at: [0, 3.38, 0.82] as const, w: 0.54, h: 0.78 },   // neck base transition
  ];

  b.loft(torsoStations, {
    bone: [hips, spine.joints[0], spine.joints[1], withersJoint],
    color: giraffeCoat,
    section: { ngon: 8 },
    caps: { start: "round", end: "round" },
    group: "body",
  });

  // Neck tube: tapered long muscular neck
  const neckSweep = b.sweep(neck, (t) => [0.15 + 0.12 * (1 - t), 0.19 + 0.14 * (1 - t)], {
    color: giraffeCoat,
    section: { ngon: 8 },
    caps: { start: "round", end: "round" },
    group: "neck",
  });

  // Mane: upright crest of short hair running all along the dorsal side of the neck and withers
  const maneCount = 30;
  const maneFrames = [];
  // Start mane from t = 0.15 so it starts above the withers blend
  for (let i = 0; i < maneCount; i++) {
    const t = 0.15 + (i / (maneCount - 1)) * 0.83;
    maneFrames.push(neckSweep.at(t, 0));
  }
  b.cards(maneFrames, maneSvg, {
    size: [0.12, 0.22],
    lean: 12,
    bend: -5,
    vary: 0.15,
    rng: rng(7),
    color: MANE_DARK,
    sink: 0.04,
    group: "neck",
  });

  // -----------------------------------------------------------------------------------------------------------------
  // 3. Head & Face
  // -----------------------------------------------------------------------------------------------------------------
  // Muzzle gradient on head region
  const facePaint = gradient(giraffeCoat, MUZZLE_GREY, headRegion.p([0, 0, 0.25]), headRegion.p([0, 0, 0.48]));

  const headStations = [
    { at: headRegion.p([0, 0.04, -0.06]), w: 0.24, h: 0.22 },  // poll / cranium back
    { at: headRegion.p([0, 0.03, 0.12]), w: 0.23, h: 0.22 },   // eyes / forehead
    { at: headRegion.p([0, 0.00, 0.28]), w: 0.17, h: 0.18 },   // bridge of nose
    { at: headRegion.p([0, -0.03, 0.44]), w: 0.14, h: 0.15 },  // upper muzzle
    { at: headRegion.p([0, -0.05, 0.52]), w: 0.11, h: 0.11 },  // tip of nose
  ];

  b.loft(headStations, {
    bone: skull,
    color: facePaint,
    section: { ngon: 8 },
    caps: { start: "round", end: "round" },
    group: "head",
  });

  // Lower Jaw (separate joint so it can open)
  const jawStations = [
    { at: headRegion.p([0, -0.08, 0.08]), w: 0.16, h: 0.08 },
    { at: headRegion.p([0, -0.09, 0.25]), w: 0.13, h: 0.07 },
    { at: headRegion.p([0, -0.10, 0.42]), w: 0.11, h: 0.06 },
    { at: headRegion.p([0, -0.11, 0.50]), w: 0.08, h: 0.05 },
  ];
  b.loft(jawStations, {
    bone: jaw,
    color: facePaint,
    section: { ngon: 8 },
    caps: { start: "round", end: "round" },
    group: "jaw",
  });

  // Long dark prehensile tongue sticking out slightly
  const tongueCurve = catmull([
    headRegion.p([0, -0.09, 0.38]),
    headRegion.p([0, -0.10, 0.48]),
    headRegion.p([0.02, -0.13, 0.58]),
    headRegion.p([0.03, -0.17, 0.65]),
  ]);
  b.sweep(tongueCurve, [0.032, 0.016], {
    bone: jaw,
    color: TONGUE_DARK,
    section: "circle",
    caps: { start: "none", end: "round" },
    group: "jaw",
  });

  // Eyes (large, brown, laterally placed with white specular glint)
  for (const s of [1, -1] as const) {
    const eyePos = headRegion.p([s * 0.118, 0.048, 0.15]);
    const eyeDir = headRegion.d([s * 0.8, 0.2, 0.4]);
    b.part(new SphereGeometry(0.034, 7, 5), EYE_DARK, {
      bone: skull,
      at: eyePos,
      dir: eyeDir,
      scale: [1, 0.9, 1.1],
      group: "head",
    });
    b.part(new SphereGeometry(0.009, 5, 4), EYE_GLINT, {
      bone: skull,
      at: headRegion.p([s * 0.132, 0.062, 0.175]),
      group: "head",
    });

    // Brow ridge / eyelid arc: curving naturally over upper orbit
    b.part(new BoxGeometry(0.018, 0.018, 0.058), giraffeCoat, {
      bone: skull,
      at: headRegion.p([s * 0.108, 0.075, 0.145]),
      rotation: [0, 0, s * -10],
      group: "head",
    });
  }

  // Ossicones (skin-covered horns with dark tufts on top)
  for (const s of [1, -1] as const) {
    const ossiconeBase = headRegion.p([s * 0.065, 0.14, 0.02]);
    const ossiconeTip = headRegion.p([s * 0.08, 0.36, -0.02]);
    b.rod(ossiconeBase, ossiconeTip, [0.03, 0.024], {
      bone: skull,
      color: giraffeCoat,
      section: { ngon: 6 },
      caps: "flat",
      group: "head",
    });
    // Dark furry tufted knob capping the ossicone
    b.part(new CylinderGeometry(0.036, 0.032, 0.05, 6), OSSICONE_TUFT, {
      bone: skull,
      at: ossiconeTip,
      group: "head",
    });
  }

  // Median bump / forehead lump typical of mature giraffes
  b.part(new SphereGeometry(0.045, 6, 5), giraffeCoat, {
    bone: skull,
    at: headRegion.p([0, 0.09, 0.2]),
    scale: [0.9, 0.6, 1.4],
    group: "head",
  });

  // Large ears: angled backward and outward
  for (const s of [1, -1] as const) {
    const earBase = headRegion.p([s * 0.11, 0.08, -0.04]);
    const earTip = headRegion.p([s * 0.32, 0.16, -0.16]);
    b.slab(
      [
        earBase,
        headRegion.p([s * 0.16, 0.13, -0.02]),
        earTip,
        headRegion.p([s * 0.26, 0.05, -0.12]),
        headRegion.p([s * 0.16, 0.03, -0.06]),
      ],
      {
        bone: skull,
        thickness: 0.016,
        color: giraffeCoat,
        group: "head",
      },
    );
  }

  // Nostrils: dark indentations on snout tip
  for (const s of [1, -1] as const) {
    b.part(new SphereGeometry(0.015, 5, 4), EYE_DARK, {
      bone: skull,
      at: headRegion.p([s * 0.035, -0.03, 0.52]),
      scale: [0.6, 1.2, 0.5],
      group: "head",
    });
  }

  // -----------------------------------------------------------------------------------------------------------------
  // 4. Legs & Hooves
  // -----------------------------------------------------------------------------------------------------------------
  const hoofRadius = 0.08;

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // FRONT LEG
    const fRoot: V3 = [s * 0.28, 3.05, 0.62];
    const fFoot: V3 = [s * 0.32, hoofRadius, 0.66];
    const fPoints = limb(
      fRoot,
      fFoot,
      [0.65, 1.15, 1.1],
      [
        [0, 0, -1], // elbow points back
        [0, 0, 1],  // carpus / knee points forward
      ],
    );

    const fLeg = b.chain(`legF${side}`, fPoints, {
      parent: withersJoint,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      group: `legF${side}`,
    });

    b.sweep(
      fLeg,
      (t) => {
        const r = 0.14 * (1 - t * 0.6);
        return [r * 0.85, r * 1.1];
      },
      {
        section: { ngon: 6 },
        color: legCoat,
        caps: { start: "round", end: "flat" },
        group: `legF${side}`,
      },
    );

    // Front Hoof
    const fHoofJoint = b.joint(`hoofF${side}`, {
      parent: fLeg.joints[2],
      at: fFoot,
      aim: [fFoot[0], 0, fFoot[2] + 0.1],
      role: "leg",
      group: `legF${side}`,
    });

    const fFootV3 = new Vector3(...fFoot);
    b.frustumBox(
      [fFootV3.x, hoofRadius * 1.4, fFootV3.z],
      [fFootV3.x, 0, fFootV3.z],
      [0.12, 0.14],
      [0.15, 0.19],
      {
        bone: fHoofJoint,
        color: HOOF_DARK,
        group: `legF${side}`,
      },
    );

    // HIND LEG
    const hRoot: V3 = [s * 0.25, 2.45, -0.72];
    const hFoot: V3 = [s * 0.28, hoofRadius, -0.82];
    const hPoints = limb(
      hRoot,
      hFoot,
      [0.72, 0.95, 0.9],
      [
        [0, 0, 1],  // stifle / knee points forward
        [0, 0, -1], // hock points backward
      ],
    );

    const hLeg = b.chain(`legH${side}`, hPoints, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`],
      role: "leg",
      group: `legH${side}`,
    });

    b.sweep(
      hLeg,
      (t) => {
        const r = 0.16 * (1 - t * 0.65);
        return [r * 0.9, r * 1.15];
      },
      {
        section: { ngon: 6 },
        color: legCoat,
        caps: { start: "round", end: "flat" },
        group: `legH${side}`,
      },
    );

    // Hind Hoof
    const hHoofJoint = b.joint(`hoofH${side}`, {
      parent: hLeg.joints[2],
      at: hFoot,
      aim: [hFoot[0], 0, hFoot[2] + 0.1],
      role: "leg",
      group: `legH${side}`,
    });

    const hFootV3 = new Vector3(...hFoot);
    b.frustumBox(
      [hFootV3.x, hoofRadius * 1.4, hFootV3.z],
      [hFootV3.x, 0, hFootV3.z],
      [0.11, 0.13],
      [0.14, 0.18],
      {
        bone: hHoofJoint,
        color: HOOF_DARK,
        group: `legH${side}`,
      },
    );
  }

  // -----------------------------------------------------------------------------------------------------------------
  // 5. Tail
  // -----------------------------------------------------------------------------------------------------------------
  b.sweep(tail, [0.032, 0.016], {
    color: giraffeCoat,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    group: "tail",
  });

  // Black tail tuft cards at end of tail
  const tailTipFrame = tail.at(1);
  b.cards([tailTipFrame], tuftSvg, {
    size: [0.18, 0.38],
    lean: 8,
    cross: true,
    color: TAIL_TUFT,
    sink: 0.05,
    group: "tail",
  });

  return b.root;
}
