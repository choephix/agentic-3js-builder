import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  mix,
  smoothstep,
  gradient,
  grain,
  mottle,
  rng,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Fennec kit on a dune",
  description:
    "A fennec fox kit standing alert on a little sand dune at dusk: enormous satin ears lined in peach, a cream-to-gold coat, a fluffy tail with a black tip, oversized paws and a woven leather collar with a brass bell.",
};

// ---- palette (flat colours) ------------------------------------------------
const CREAM = "#f5e6cc";
const GOLD = "#d9a060";
const GOLD_DEEP = "#b8743f";
const PEACH = "#f8c9a4";
const EAR_OUT = "#e8b67e";
const EYE = "#21150f";
const DARK = "#2a1b13";
const WHITE = "#fffdf7";
const BRASS = "#d9a845";
const LEATHER = "#6b3d24";
const LEATHER_LIGHT = "#8a5532";
const SAND = "#e3bd86";
const SAND_DEEP = "#c79a63";
const GRASS = "#b48a52";

// ---- outlines ----------------------------------------------------------------
const EAR: OutlinePoint[] = [
  [-0.036, 0],
  [0.036, 0],
  [0.046, 0.05],
  [0.04, 0.11],
  [0, 0.175, "sharp"],
  [-0.04, 0.11],
  [-0.046, 0.05],
];

const BELL: OutlinePoint[] = [
  [0, 0],
  [0.008, 0],
  [0.012, 0.008],
  [0.0135, 0.016],
  [0.011, 0.025],
  [0.005, 0.029],
  [0, 0.03],
];

// ---- paints --------------------------------------------------------------------
// cream belly and flanks warming to sandy gold along the back, with fine fur streaks
const fur = grain(GOLD, GOLD_DEEP, { size: 0.02, axis: "z" });
const coat = paint((_p, n) => mix(CREAM, fur, smoothstep(0.05, 0.75, n.y)));
// the face of each ear that looks forward is the peach lining
const earPaint = paint((_p, n) => (n.z > 0.45 ? PEACH : EAR_OUT));
// a small 3D check reads as woven leather
const weave = paint((p) =>
  Math.abs(Math.floor(p.x / 0.005) + Math.floor(p.y / 0.005) + Math.floor(p.z / 0.005)) % 2 === 1
    ? LEATHER
    : LEATHER_LIGHT,
);
const dune = mottle(SAND, SAND_DEEP, { size: 0.3, seed: 5 });

// ---- textures ----------------------------------------------------------------
const tuft = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64"><path d="M12 64 C4 46 2 20 12 0 C22 20 20 46 12 64Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const grass = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48">
    <path d="M20 48 Q14 26 4 6 Q18 18 21 48Z" fill="#ffffff"/>
    <path d="M22 48 Q24 24 36 10 Q27 26 25 48Z" fill="#ffffff"/>
    <path d="M19 48 Q18 30 17 2 Q24 26 23 48Z" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "fennec-kit" });

  // ---- skeleton ------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.212, -0.1], aim: [0, 0.218, -0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.212, -0.08],
      [0, 0.218, -0.02],
      [0, 0.223, 0.04],
      [0, 0.227, 0.085],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.227, 0.085],
      [0, 0.275, 0.13],
      [0, 0.32, 0.18],
    ]),
    { parent: chest, names: ["neckBase", "neck"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.35, 0.235],
    aim: [0, 0.35, 0.36],
    role: "head",
  });
  // lower jaw hinges at the back of the mouth; the upper jaw is the head
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.327, 0.3], aim: [0, 0.322, 0.36], role: "jaw" });
  // ears are flaps hinged at the top of the skull
  const earL = b.joint("earL", {
    parent: head,
    at: [0.045, 0.355, 0.215],
    aim: [0.096, 0.52, 0.195],
    role: "hinge",
  });
  const earR = b.joint("earR", {
    parent: head,
    at: [-0.045, 0.355, 0.215],
    aim: [-0.096, 0.52, 0.195],
    role: "hinge",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.14],
      [0, 0.19, -0.23],
      [0, 0.165, -0.32],
      [0, 0.125, -0.37],
      [0, 0.11, -0.41],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---- body ------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 0.21, -0.13], w: 0.09, h: 0.1 },
      { at: [0, 0.214, -0.05], w: 0.11, h: 0.118 },
      { at: [0, 0.22, 0.01], w: 0.114, h: 0.126 },
      { at: [0, 0.225, 0.06], w: 0.1, h: 0.13 },
      { at: [0, 0.232, 0.1], w: 0.076, h: 0.1 },
    ],
    { bone: spine, color: coat },
  );

  // ---- legs, paws and haunches -----------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // forelimb: shoulder, elbow, wrist (the tip joint)
    const fore = b.chain(
      `foreLeg${S}`,
      limb([s * 0.052, 0.2, 0.05], [s * 0.055, 0.085, 0.075], [0.072, 0.068], [0, 0, -1]),
      { parent: chest, names: [`shoulderF${S}`, `elbowF${S}`, `wristF${S}`], role: "leg" },
    );
    b.sweep(fore, [0.026, 0.015], { color: coat });
    const wristJ = fore.joints[2];
    // oversized paw sitting in the sand, with three toes
    b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, {
      bone: wristJ,
      at: [s * 0.055, 0.072, 0.092],
      scale: [0.056, 0.036, 0.07],
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.0135, 8, 6), CREAM, {
        bone: wristJ,
        at: [s * 0.055 + k * 0.0195, 0.05, 0.152],
      });
    }
    // shoulder ball to soften the join into the chest
    b.part(new THREE.SphereGeometry(0.03, 10, 8), coat, { bone: chest, at: [s * 0.046, 0.204, 0.05] });

    // hindlimb: hip, stifle (knee, bends forward), hock (tip joint)
    const hind = b.chain(
      `hindLeg${S}`,
      limb([s * 0.046, 0.2, -0.1], [s * 0.046, 0.085, -0.135], [0.078, 0.07], [0, 0, 1]),
      { parent: hips, names: [`hipH${S}`, `kneeH${S}`, `ankleH${S}`], role: "leg" },
    );
    b.sweep(hind, [0.031, 0.016], { color: coat });
    const ankleJ = hind.joints[2];
    b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, {
      bone: ankleJ,
      at: [s * 0.046, 0.072, -0.11],
      scale: [0.056, 0.036, 0.062],
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.0135, 8, 6), CREAM, {
        bone: ankleJ,
        at: [s * 0.046 + k * 0.0195, 0.05, -0.058],
      });
    }
    // the thigh bulge
    b.part(new THREE.SphereGeometry(0.042, 12, 8), coat, {
      bone: hips,
      at: [s * 0.04, 0.212, -0.1],
      scale: [1, 1.1, 1.2],
    });
  }

  // ---- tail: a bushy, tapering tube, gold on top and black at the tip --------
  const tailCoat = gradient(coat, DARK, tail.path.at(0.78), tail.path.at(1));
  const tailSweep = b.sweep(tail, (t) => 0.024 + 0.04 * Math.sin(Math.PI * Math.pow(t, 0.8)), {
    color: tailCoat,
  });

  // ---- neck, collar and bell -------------------------------------------------
  const neckTube = b.sweep(neck, (t) => 0.046 - 0.012 * t, { color: coat });
  // a woven leather band that follows the neck, cut by a plane through the neck joint
  const collar = b.surface(neckTube).loop(neck.joints[1], { lift: 0.004 });
  b.sweep(collar, () => [0.011, 0.006], { color: weave });
  // the bell hangs from the throat of the collar
  const throat = collar.at(0.5);
  b.rod([throat.x, throat.y, throat.z], [throat.x, throat.y - 0.016, throat.z], 0.0025, {
    bone: neck.joints[1],
    color: LEATHER,
  });
  b.lathe(BELL, {
    at: [throat.x, throat.y - 0.045, throat.z],
    bone: neck.joints[1],
    color: BRASS,
    smoothing: 1,
  });

  // ---- head ----------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 0.35, 0.205], w: 0.09, h: 0.094 },
      { at: [0, 0.35, 0.262], w: 0.094, h: 0.09 },
      { at: [0, 0.344, 0.325], w: 0.06, h: 0.058 },
      { at: [0, 0.34, 0.37], w: 0.03, h: 0.03 },
    ],
    { bone: head, color: coat },
  );
  // lower jaw, cream chin
  b.frustumBox([0, 0.322, 0.3], [0, 0.318, 0.36], [0.03, 0.022], [0.02, 0.016], {
    bone: jaw,
    color: CREAM,
  });
  // nose
  b.part(new THREE.SphereGeometry(0.0125, 8, 6), DARK, {
    bone: head,
    at: [0, 0.34, 0.382],
    scale: [1.2, 0.85, 1],
  });

  for (const s of [1, -1]) {
    // ears: satin plates, peach on the forward face
    b.extrude(EAR, {
      at: [s * 0.045, 0.355, 0.215],
      x: [s, 0, 0],
      y: [s * 0.3, 1, -0.12],
      thickness: [0.014, 0.004],
      bevel: 0.003,
      smoothing: 1,
      color: earPaint,
      bone: s > 0 ? earL : earR,
    });

    // big dark eye with a small white sparkle
    b.part(new THREE.SphereGeometry(0.021, 10, 8), EYE, {
      bone: head,
      at: [s * 0.042, 0.353, 0.28],
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 5), WHITE, {
      bone: head,
      at: [s * 0.0508, 0.3628, 0.2944],
    });

    // three fine whiskers a side
    for (const k of [-1, 0, 1]) {
      b.rod([s * 0.027, 0.336, 0.34], [s * 0.1, 0.336 + k * 0.012, 0.4], 0.0013, {
        bone: head,
        color: DARK,
      });
    }
  }

  // ---- the dune and dry grass at its foot -------------------------------------
  const dunePart = b.part(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), dune, {
    bone: hips,
    at: [0, 0, 0],
    scale: [0.36, 0.05, 0.3],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), dune, {
    bone: hips,
    at: [0.32, 0, -0.2],
    scale: [0.16, 0.03, 0.14],
    flat: true,
  });
  const grassHits = b.surface(dunePart).scatter(18, {
    rng: rng(31),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.5 && Math.abs(h.at.x) > 0.18,
  });
  b.cards(grassHits, grass, {
    size: [0.05, 0.07],
    lean: 12,
    vary: 0.3,
    rng: rng(32),
    color: GRASS,
  });

  // ---- fluffy fur on the tail --------------------------------------------------
  const tailHits = b.surface(tailSweep).scatter(90, { rng: rng(11), minDist: 0.018 });
  b.cards(tailHits, tuft, {
    size: [0.03, 0.065],
    lean: 38,
    bend: 20,
    vary: 0.3,
    rng: rng(12),
    color: tailCoat,
  });

  return b.root;
}
