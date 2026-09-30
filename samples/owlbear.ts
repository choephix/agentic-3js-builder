// Owlbear. A fantasy creature combining the massive, powerful body and limbs of a brown bear
// with the feathered head, facial disc, ear tufts, round forward eyes and hooked beak of an owl.
// Stands on all fours at ~1.6 m at the shoulder, with heavy clawed paws, feathered ruff/mantle
// blending into shaggy brown bear fur, and a stubby feathered tail.
import { SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import type { V3 } from "../src/math";
import { catmull } from "../src/path";
import { countershade, mottle } from "../src/paint";

export const meta = {
  name: "Owlbear",
  description:
    "A massive fantasy owlbear standing on all fours at 1.6 m shoulder height, with a feathered owl head, heart-shaped facial disc, hooked beak, ear tufts, shaggy ruff, powerful bear limbs with heavy claws, and stubby tail.",
  builtBy: "Gemini 3.8 Flash",
};

// --- Palette ---
const BEAR_BROWN = "#4a321e";
const BEAR_DARK = "#342214";
const BEAR_BELLY = "#6e4d30";
const RUFF_MANTLE = "#5c4028";
const FEATHER_BASE = "#7a5b3e";
const FEATHER_LIGHT = "#9c7752";
const FEATHER_CREAM = "#cbb292";
const DISC_RIM = "#3b2818";
const DISC_FACE = "#dfceb7";
const DISC_INNER = "#f4ebd9";
const BEAK_BASE = "#382e25";
const BEAK_HORN = "#d69836";
const BEAK_TIP = "#1d1712";
const EYE_GOLD = "#f0a218";
const EYE_PUPIL = "#110e0c";
const EYE_RING = "#241912";
const EYE_GLINT = "#ffffff";
const CLAW_COLOR = "#1c1714";

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

export default function build() {
  const b = createBuilder({ name: "owlbear" });

  // =========================================================================
  // 1. SKELETON: Core, Spine, Neck, Head, Tail
  // =========================================================================
  // Bear stance: 1.6m at withers/shoulder. Powerful, compact spine.
  const hips = b.joint("hips", { at: [0, 1.44, -0.65], role: "spine", group: "body" });

  const spine = b.chain(
    "spine",
    [
      [0, 1.44, -0.65],
      [0, 1.46, -0.25],
      [0, 1.54, 0.15],
      [0, 1.60, 0.55], // withers
    ],
    { parent: hips, role: "spine", group: "body" }
  );

  const withers = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.60, 0.55],
      [0, 1.62, 0.85],
      [0, 1.63, 1.15],
    ]),
    { parent: withers, count: 2, role: "neck", group: "neck" }
  );

  // Head joint sits at neck end, aimed forward (+Z) and slightly tilted down
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neck.at(1),
    dir: [0, -0.05, 1],
    role: "head",
    group: "head",
  });

  // Jaw joint attached to head, nestled under the upper beak
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.36, -0.16]),
    dir: head.dir([0, 0.30, -0.28]),
    role: "jaw",
    group: "jaw",
  });

  // Stubby feathered tail from hips backwards and down
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.42, -0.68],
      [0, 1.34, -0.92],
      [0, 1.23, -1.15],
    ]),
    { parent: hips, count: 2, role: "tail", group: "tail" }
  );

  // =========================================================================
  // 2. TORSO & BODY LOFT
  // =========================================================================
  // Muscular bear anatomy: rounded rump, deep chest, massive shoulder withers
  const bodyStations = [
    { at: [0, 1.26, -1.12] as const, w: 0.22, h: 0.18 }, // tail tip
    { at: [0, 1.36, -0.92] as const, w: 0.32, h: 0.28 }, // tail base
    { at: [0, 1.43, -0.65] as const, w: 0.80, h: 0.76 }, // rump / hips
    { at: [0, 1.45, -0.25] as const, w: 0.90, h: 0.84 }, // mid-flank
    { at: [0, 1.50, 0.18] as const, w: 1.02, h: 0.98 },  // massive deep chest
    { at: [0, 1.60, 0.55] as const, w: 0.98, h: 1.00 },  // huge withers
    { at: [0, 1.62, 0.85] as const, w: 0.82, h: 0.86 },  // thick feathered neck
    { at: [0, 1.63, 1.15] as const, w: 0.62, h: 0.68 },  // throat / nape
  ];

  const furPaint = countershade(
    mottle(BEAR_BROWN, BEAR_DARK, { size: 0.18 }),
    BEAR_BELLY,
    { level: -0.2, soft: 0.3 }
  );

  b.loft(bodyStations, {
    bone: [tail, hips, spine, neck],
    color: furPaint,
    sides: 12,
    caps: { start: "round", end: "none" },
    group: "body",
  });

  // Layered tail feathers
  for (let s of [-1, 0, 1]) {
    b.sweep(
      catmull([
        [s * 0.08, 1.34, -0.98],
        [s * 0.14, 1.26, -1.22],
        [s * 0.18, 1.16, -1.34],
      ]),
      [0.055, 0.035, 0.005],
      {
        bone: tail.joints[1],
        color: s === 0 ? FEATHER_LIGHT : FEATHER_BASE,
        caps: { start: "round", end: "point" },
        group: "tail",
      }
    );
  }

  // =========================================================================
  // 3. LIMBS & HEAVY PAWS (Bear legs with realistic joint angles)
  // =========================================================================
  for (const [s, side] of SIDES) {
    // Front leg: shoulder -> elbow -> wrist -> pawBase -> pawToe
    const fShoulder: V3 = [s * 0.44, 1.48, 0.52];
    const fElbow: V3 = [s * 0.46, 1.02, 0.44];
    const fWrist: V3 = [s * 0.44, 0.52, 0.52];
    const fPawBase: V3 = [s * 0.44, 0.20, 0.58];
    const fPawToe: V3 = [s * 0.44, 0.13, 0.72];

    const fLeg = b.chain(
      `legF${side}`,
      [fShoulder, fElbow, fWrist, fPawBase, fPawToe],
      {
        parent: withers,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `frontPaw${side}`],
        role: "leg",
        contact: [s * 0.44, 0, 0.65],
        group: `legF${side}`,
      }
    );

    // Front leg heavy muscular tube
    b.sweep(fLeg, [0.25, 0.21, 0.17, 0.14, 0.11], {
      color: furPaint,
      sides: 10,
      group: `legF${side}`,
    });

    // Hind leg: hip -> knee (forward) -> hock (backward) -> pawBase -> pawToe
    const hHip: V3 = [s * 0.38, 1.40, -0.62];
    const hKnee: V3 = [s * 0.42, 0.98, -0.42]; // angled forward
    const hHock: V3 = [s * 0.38, 0.54, -0.66]; // angled backward
    const hPawBase: V3 = [s * 0.38, 0.20, -0.56];
    const hPawToe: V3 = [s * 0.38, 0.13, -0.42];

    const hLeg = b.chain(
      `legH${side}`,
      [hHip, hKnee, hHock, hPawBase, hPawToe],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
        role: "leg",
        contact: [s * 0.38, 0, -0.49],
        group: `legH${side}`,
      }
    );

    b.sweep(hLeg, [0.26, 0.22, 0.18, 0.14, 0.11], {
      color: furPaint,
      sides: 10,
      group: `legH${side}`,
    });

    // Paws & Claws
    const paws = [
      { joint: fLeg.joints[3], pos: fPawBase, toePos: fPawToe, group: `legF${side}` },
      { joint: hLeg.joints[3], pos: hPawBase, toePos: hPawToe, group: `legH${side}` },
    ];

    for (const { joint, pos, toePos, group } of paws) {
      // Main paw pad / foot mass
      b.part(
        new SphereGeometry(1, b.segments(10), b.segments(8)),
        BEAR_DARK,
        {
          bone: joint,
          at: [pos[0], 0.12, (pos[2] + toePos[2]) * 0.5],
          scale: [0.19, 0.10, 0.22],
          group,
        }
      );

      // 4 heavy curved bear claws on each paw
      const clawOffsets = [-0.11, -0.04, 0.04, 0.11];
      for (let i = 0; i < clawOffsets.length; i++) {
        const dx = clawOffsets[i];
        const clawBase: V3 = [
          pos[0] + dx * 1.1,
          0.09,
          toePos[2] + 0.06,
        ];
        const clawMid: V3 = [
          pos[0] + dx * 1.2,
          0.06,
          toePos[2] + 0.14,
        ];
        const clawTip: V3 = [
          pos[0] + dx * 1.25,
          0.003, // rested cleanly right above 0
          toePos[2] + 0.20,
        ];

        b.sweep(
          catmull([clawBase, clawMid, clawTip]),
          [0.024, 0.016, 0.003],
          {
            bone: joint,
            color: CLAW_COLOR,
            caps: { start: "round", end: "point" },
            group,
          }
        );
      }
    }
  }

  // =========================================================================
  // 4. OWL HEAD, FACIAL DISC, EYES, BEAK & EAR TUFTS
  // =========================================================================
  // Main owl cranium
  b.part(
    new SphereGeometry(1, b.segments(12), b.segments(10)),
    RUFF_MANTLE,
    {
      bone: head,
      at: head.local([0, 0.04, 0.04]),
      scale: [0.38, 0.36, 0.36],
      group: "head",
    }
  );

  // Facial disc using b.slab on the front face (forward = +Y)
  // Heart-shaped concave indentation at the top center
  // Outer disc rim
  b.slab(
    [
      head.local([0, 0.34, 0.16]),       // cleft of the heart
      head.local([0.18, 0.33, 0.25]),     // top-right lobe
      head.local([0.34, 0.31, 0.14]),     // upper-right side
      head.local([0.36, 0.30, -0.08]),    // mid-right side
      head.local([0.26, 0.31, -0.24]),    // lower-right cheek
      head.local([0.12, 0.32, -0.32]),    // chin right
      head.local([0, 0.33, -0.35]),       // bottom chin tip
      head.local([-0.12, 0.32, -0.32]),   // chin left
      head.local([-0.26, 0.31, -0.24]),   // lower-left cheek
      head.local([-0.36, 0.30, -0.08]),   // mid-left side
      head.local([-0.34, 0.31, 0.14]),    // upper-left side
      head.local([-0.18, 0.33, 0.25]),    // top-left lobe
    ],
    { thickness: 0.03, color: DISC_RIM, bone: head, group: "head" }
  );

  // Mid facial disc
  b.slab(
    [
      head.local([0, 0.36, 0.15]),
      head.local([0.15, 0.35, 0.22]),
      head.local([0.30, 0.33, 0.12]),
      head.local([0.31, 0.32, -0.07]),
      head.local([0.22, 0.33, -0.21]),
      head.local([0.10, 0.34, -0.28]),
      head.local([0, 0.35, -0.31]),
      head.local([-0.10, 0.34, -0.28]),
      head.local([-0.22, 0.33, -0.21]),
      head.local([-0.31, 0.32, -0.07]),
      head.local([-0.30, 0.33, 0.12]),
      head.local([-0.15, 0.35, 0.22]),
    ],
    { thickness: 0.02, color: DISC_FACE, bone: head, group: "head" }
  );

  // Inner pale facial disc
  b.slab(
    [
      head.local([0, 0.38, 0.14]),
      head.local([0.13, 0.37, 0.20]),
      head.local([0.25, 0.35, 0.10]),
      head.local([0.26, 0.34, -0.06]),
      head.local([0.18, 0.35, -0.18]),
      head.local([0.08, 0.36, -0.24]),
      head.local([0, 0.37, -0.27]),
      head.local([-0.08, 0.36, -0.24]),
      head.local([-0.18, 0.35, -0.18]),
      head.local([-0.26, 0.34, -0.06]),
      head.local([-0.25, 0.35, 0.10]),
      head.local([-0.13, 0.37, 0.20]),
    ],
    { thickness: 0.02, color: DISC_INNER, bone: head, group: "head" }
  );

  // Eyes, tufts, and brow detail per side
  for (const [s] of SIDES) {
    // Large round owl eye socket / dark surround
    b.part(
      new SphereGeometry(1, b.segments(12), b.segments(10)),
      EYE_RING,
      {
        bone: head,
        at: head.local([s * 0.15, 0.37, 0.05]),
        scale: [0.088, 0.055, 0.088],
        group: "head",
      }
    );

    // Glowing golden iris - big and fully circular
    b.part(
      new SphereGeometry(1, b.segments(12), b.segments(10)),
      EYE_GOLD,
      {
        bone: head,
        at: head.local([s * 0.15, 0.40, 0.05]),
        scale: [0.076, 0.040, 0.076],
        group: "head",
      }
    );

    // Large circular black pupil - centered in iris
    b.part(
      new SphereGeometry(1, b.segments(10), b.segments(8)),
      EYE_PUPIL,
      {
        bone: head,
        at: head.local([s * 0.15, 0.435, 0.05]),
        scale: [0.046, 0.020, 0.046],
        group: "head",
      }
    );

    // White eye glint (slightly up and out)
    b.part(
      new SphereGeometry(1, b.segments(6), b.segments(6)),
      EYE_GLINT,
      {
        bone: head,
        at: head.local([s * 0.15 + s * 0.016, 0.450, 0.068]),
        scale: [0.014, 0.010, 0.014],
        group: "head",
      }
    );

    // Prominent owl ear tufts ("horns") sweeping up, back and outwards
    const tuftBase = head.local([s * 0.18, 0.12, 0.28]);
    const tuftMid = head.local([s * 0.25, 0.02, 0.46]);
    const tuftTip = head.local([s * 0.32, -0.10, 0.60]);

    b.sweep(
      catmull([tuftBase, tuftMid, tuftTip]),
      [0.06, 0.035, 0.005],
      {
        bone: head,
        color: DISC_RIM,
        caps: { start: "round", end: "point" },
        group: "head",
      }
    );

    const tuftInnerBase = head.local([s * 0.14, 0.15, 0.26]);
    const tuftInnerTip = head.local([s * 0.20, 0.06, 0.48]);
    b.sweep(
      catmull([tuftInnerBase, tuftInnerTip]),
      [0.035, 0.005],
      {
        bone: head,
        color: FEATHER_CREAM,
        caps: { start: "round", end: "point" },
        group: "head",
      }
    );

    // Feathery brow ridge framing top of eye
    b.sweep(
      catmull([
        head.local([s * 0.25, 0.35, 0.17]),
        head.local([s * 0.15, 0.38, 0.18]),
        head.local([s * 0.05, 0.38, 0.14]),
      ]),
      [0.020, 0.010],
      { bone: head, color: FEATHER_LIGHT, group: "head" }
    );
  }

  // Hooked Beak: upper beak (on head) and separate lower beak (on jaw)
  // Starts between the eyes, smoothly curved and strongly hooked
  const uBeakBase = head.local([0, 0.37, 0.02]);
  const uBeakMid = head.local([0, 0.45, -0.06]);
  const uBeakHook = head.local([0, 0.46, -0.17]);
  const uBeakTip = head.local([0, 0.40, -0.26]);

  b.sweep(
    catmull([uBeakBase, uBeakMid, uBeakHook, uBeakTip]),
    (t) => [0.052 * (1 - 0.60 * t), 0.082 * (1 - 0.65 * t)],
    {
      bone: head,
      color: BEAK_HORN,
      caps: { start: "round", end: "point" },
      group: "head",
    }
  );

  // Dark tip on upper beak
  b.sweep(
    catmull([uBeakHook, uBeakTip]),
    (t) => [0.022 * (1 - 0.8 * t), 0.036 * (1 - 0.8 * t)],
    {
      bone: head,
      color: BEAK_TIP,
      caps: { start: "round", end: "point" },
      group: "head",
    }
  );

  // Cere at upper beak base
  b.part(
    new SphereGeometry(1, b.segments(8), b.segments(6)),
    BEAK_BASE,
    {
      bone: head,
      at: head.local([0, 0.375, 0.03]),
      scale: [0.042, 0.036, 0.042],
      group: "head",
    }
  );

  // Lower beak on jaw joint: sits inside and under the upper hook
  b.spike(jaw, jaw, 0.12, 0.026, {
    color: BEAK_HORN,
    caps: { start: "round", end: "point" },
    group: "jaw",
  });
  b.pose(jaw, { axis: jaw.dir([1, 0, 0]), deg: -8 });

  // =========================================================================
  // 5. SHAGGY FEATHER RUFF & MANTLE (More organic, downward cascading)
  // =========================================================================
  // Feather ruff collar around neck and throat
  for (let angle = -140; angle <= 140; angle += 20) {
    const rad = (angle * Math.PI) / 180;
    const ruffX = Math.sin(rad) * 0.40;
    const ruffY = Math.cos(rad) * 0.36;
    const ruffBase = neck.joints[1].local([ruffX, 0.05, ruffY]);
    // Cascade downward and slightly outward along body
    const ruffTip = neck.joints[1].local([ruffX * 1.25, -0.32, ruffY * 1.2 - 0.15]);

    b.sweep(
      catmull([ruffBase, ruffTip]),
      [0.06, 0.01],
      {
        bone: neck.joints[1],
        color: Math.abs(angle) < 60 ? FEATHER_CREAM : (Math.abs(angle) < 100 ? FEATHER_LIGHT : FEATHER_BASE),
        caps: { start: "round", end: "point" },
        group: "neck",
      }
    );
  }

  // Feather mantle cascades down withers and shoulders
  for (let z = 0.25; z <= 0.85; z += 0.14) {
    for (const [s] of SIDES) {
      const mantleBase: V3 = [s * 0.32, 1.66, z];
      const mantleTip: V3 = [s * 0.44, 1.54, z - 0.24];
      b.sweep(
        catmull([mantleBase, mantleTip]),
        [0.065, 0.012],
        {
          bone: withers,
          color: FEATHER_BASE,
          caps: { start: "round", end: "point" },
          group: "body",
        }
      );

      // Flank tufts lower on shoulder
      const flankBase: V3 = [s * 0.46, 1.48, z];
      const flankTip: V3 = [s * 0.54, 1.28, z - 0.20];
      b.sweep(
        catmull([flankBase, flankTip]),
        [0.055, 0.01],
        {
          bone: withers,
          color: RUFF_MANTLE,
          caps: { start: "round", end: "point" },
          group: "body",
        }
      );
    }
  }

  return b.root;
}
