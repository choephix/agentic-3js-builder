import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { line } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { countershade, gradient, mottle, spots } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

const COAT_RED = "#a83b43";
const COAT_LIGHT = "#d9684f";
const COAT_DARK = "#4a1f3b";
const BELLY = "#f1b56e";
const MANE = "#301d4d";
const MANE_HI = "#70365f";
const WING = "#3a255a";
const WING_RIM = "#9f5bba";
const GOLD = "#f6b94a";
const GOLD_DARK = "#9b4d36";
const CLAW = "#f4e4c1";
const EYE = "#72f4dc";
const EYE_CORE = "#eaffcf";
const STINGER = "#ff4f9a";
const NOSE = "#251629";

export const meta = {
  name: "Astral Manticore",
  description: "A lion-bodied manticore with bat wings, a scorpion tail, and League of Legends magic accents.",
  style: "League of Legends",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "manticore", detail: 1.15, paintSize: 1024 });

  // Skeleton first: a neutral quadruped stance, spread wings, and an articulated open jaw.
  const hips = b.joint("hips", { at: [0, 1.02, -0.28], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.03, -0.42],
      [0, 1.10, -0.08],
      [0, 1.22, 0.32],
      [0, 1.30, 0.66],
    ]),
    { parent: hips, names: ["spineBase", "spineMid", "spineChest", "spineTip"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      spine.tip!.at,
      [0, 1.42, 0.83],
      [0, 1.60, 0.96],
    ]),
    { parent: spine.tip!, names: ["neckBase", "neckTip", "neckCrown"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.68, 1.08], dir: [0, 0.18, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.22, down: 0.08 }),
    aim: head.local({ forward: 0.50, down: 0.17 }),
    role: "jaw",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: -15 });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.08, -0.60],
      [0, 0.90, -1.00],
      [0, 1.00, -1.38],
      [0, 1.30, -1.70],
      [0, 1.66, -1.87],
      [0, 2.02, -1.78],
      [0, 2.28, -1.54],
      [0, 2.34, -1.25],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tailTip"],
      role: "tail",
    },
  );

  const foreL = b.chain(
    "foreLegL",
    [[0.47, 1.08, 0.48], [0.55, 0.70, 0.63], [0.56, 0.36, 0.72], [0.56, 0.09, 0.79]],
    { parent: spine.joints[2], names: ["shoulderL", "elbowL", "wristL", "pawL"], role: "leg", contact: [0.56, 0, 0.79] },
  );
  const foreR = b.chain(
    "foreLegR",
    [[-0.47, 1.08, 0.48], [-0.55, 0.70, 0.63], [-0.56, 0.36, 0.72], [-0.56, 0.09, 0.79]],
    { parent: spine.joints[2], names: ["shoulderR", "elbowR", "wristR", "pawR"], role: "leg", contact: [-0.56, 0, 0.79] },
  );
  const hindL = b.chain(
    "hindLegL",
    [[0.48, 1.02, -0.35], [0.65, 0.67, -0.44], [0.58, 0.35, -0.60], [0.57, 0.09, -0.69]],
    { parent: spine.joints[0], names: ["hipL", "kneeL", "hockL", "heelL"], role: "leg", contact: [0.57, 0, -0.69] },
  );
  const hindR = b.chain(
    "hindLegR",
    [[-0.48, 1.02, -0.35], [-0.65, 0.67, -0.44], [-0.58, 0.35, -0.60], [-0.57, 0.09, -0.69]],
    { parent: spine.joints[0], names: ["hipR", "kneeR", "hockR", "heelR"], role: "leg", contact: [-0.57, 0, -0.69] },
  );

  const wingL = b.chain(
    "wingL",
    [[0.40, 1.36, 0.35], [1.10, 1.83, 0.20], [1.62, 2.08, -0.02], [2.16, 1.76, -0.24]],
    { parent: spine.joints[3], names: ["wingShoulderL", "wingElbowL", "wingWristL", "wingTipL"], role: "wing" },
  );
  const wingR = b.chain(
    "wingR",
    [[-0.40, 1.36, 0.35], [-1.10, 1.83, 0.20], [-1.62, 2.08, -0.02], [-2.16, 1.76, -0.24]],
    { parent: spine.joints[3], names: ["wingShoulderR", "wingElbowR", "wingWristR", "wingTipR"], role: "wing" },
  );
  const wingRearL = b.chain(
    "wingRearL",
    [[0.40, 1.36, 0.35], [1.03, 1.27, -0.22], [1.55, 1.16, -0.46], [2.16, 1.76, -0.24]],
    { parent: spine.joints[3], names: ["wingRearRootL", "wingRearMidL", "wingRearLowL", "wingRearTipL"], role: "fan" },
  );
  const wingRearR = b.chain(
    "wingRearR",
    [[-0.40, 1.36, 0.35], [-1.03, 1.27, -0.22], [-1.55, 1.16, -0.46], [-2.16, 1.76, -0.24]],
    { parent: spine.joints[3], names: ["wingRearRootR", "wingRearMidR", "wingRearLowR", "wingRearTipR"], role: "fan" },
  );

  const toes = [];
  const paws = [
    { chain: foreL, side: 1, front: true },
    { chain: foreR, side: -1, front: true },
    { chain: hindL, side: 1, front: false },
    { chain: hindR, side: -1, front: false },
  ];
  for (const paw of paws) {
    for (let i = 0; i < 3; i += 1) {
      const spread = (i - 1) * 0.075;
      const toeTip: [number, number, number] = [paw.side * (0.56 + spread), 0.025, (paw.front ? 0.79 : -0.69) + 0.17];
      const name = `${paw.front ? "front" : "hind"}Toe${paw.side > 0 ? "L" : "R"}${i + 1}`;
      const toe = b.chain(name, [paw.chain.tip!.at, toeTip], {
        parent: paw.chain.tip!,
        names: [name, `${name}Tip`],
        role: "digit",
      });
      toes.push(toe);
    }
  }

  const maneTexture = svg(
    `<svg viewBox="0 0 64 128"><path d="M8 124 C18 92 7 70 27 45 C34 35 29 18 40 4 C48 26 43 37 56 52 C39 70 53 92 48 124 Z" fill="#ffffff"/><path d="M18 118 C27 90 21 66 35 49 C42 40 40 24 43 16 C49 40 43 55 50 70 C36 88 43 103 40 118 Z" fill="#bfa5db" opacity=".55"/></svg>`,
    { size: 128 },
  );
  const runeTexture = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4 39 25 60 32 39 39 32 60 25 39 4 32 25 25Z" fill="#ffffff"/><circle cx="32" cy="32" r="8" fill="#d7fff2"/></svg>`,
    { size: 64 },
  );

  const coat = countershade(
    mottle(spots(COAT_RED, COAT_DARK, { size: 0.17, amount: 0.35, rosette: true, seed: 24 }), COAT_LIGHT, { size: 0.28, contrast: 0.28, seed: 8 }),
    BELLY,
    { level: -0.22 },
  );
  const manePaint = mottle(MANE, MANE_HI, { size: 0.16, contrast: 0.4, seed: 12 });
  const tailPaint = gradient(coat, COAT_DARK, [0, 1.1, -0.6], [0, 2.28, -1.54]);

  // Main silhouette: faceted lion torso, neck, haunches, muzzle, and segmented tail.
  const body = b.sweep(spine, (t) => [0.39 - 0.06 * t, 0.34 - 0.05 * t], {
    color: coat,
    section: "circle",
    sides: 10,
    caps: "round",
    name: "lionTorso",
  });
  b.sweep(neck, [0.24, 0.18], { color: coat, sides: 9, name: "neckFur" });
  b.sweep(tail, (t) => 0.16 * (1 - t) + 0.035, {
    color: tailPaint,
    sides: 8,
    bands: [[0.48, GOLD_DARK], [0.55, COAT_RED], [0.72, GOLD_DARK], [0.78, COAT_RED], [0.91, MANE]],
    name: "scorpionTail",
  });
  const foreLSweep = b.sweep(foreL, [0.13, 0.085], { color: coat, sides: 7, name: "forelegL" });
  const foreRSweep = b.sweep(foreR, [0.13, 0.085], { color: coat, sides: 7, name: "forelegR" });
  const hindLSweep = b.sweep(hindL, [0.16, 0.09], { color: coat, sides: 7, name: "hindlegL" });
  const hindRSweep = b.sweep(hindR, [0.16, 0.09], { color: coat, sides: 7, name: "hindlegR" });
  for (const toe of toes) b.sweep(toe, [0.035, 0.006], { color: CLAW, sides: 6, caps: "point", name: `${toe.tip!.name}Claw` });

  // Bat membranes and raised wing bones.
  b.sweep(wingL, [0.045, 0.018], { color: WING_RIM, sides: 6, name: "wingBoneL" });
  b.sweep(wingR, [0.045, 0.018], { color: WING_RIM, sides: 6, name: "wingBoneR" });
  b.sweep(wingRearL, [0.028, 0.012], { color: WING_RIM, sides: 6, name: "wingTrailingL" });
  b.sweep(wingRearR, [0.028, 0.012], { color: WING_RIM, sides: 6, name: "wingTrailingR" });
  b.membrane(wingL, wingRearL, { color: WING, thickness: 0.018, rows: 5, scallop: 0.12, name: "wingMembraneL" });
  b.membrane(wingR, wingRearR, { color: WING, thickness: 0.018, rows: 5, scallop: 0.12, name: "wingMembraneR" });
  for (const side of [1, -1]) {
    const wing = side > 0 ? wingL : wingR;
    for (const t of [0.18, 0.42, 0.66, 0.86]) {
      const at = wing.at(t);
      glow(b.part(new THREE.SphereGeometry(0.022, 7, 5), STINGER, { bone: at.bone, at: at.at }), 1.4);
    }
  }

  // Lion face, open jaws, ears, nose, eyes, and teeth.
  b.loft(
    [
      { at: head.local({ forward: 0.06, down: 0.01 }), w: 0.31, h: 0.26 },
      { at: head.local({ forward: 0.36, down: 0.07 }), w: 0.24, h: 0.18 },
      { at: head.local({ forward: 0.49, down: 0.08 }), w: 0.19, h: 0.14 },
    ],
    { bone: head, color: BELLY, sides: 8, name: "upperMuzzle" },
  );
  b.sweep(
    bezier(jaw.at, jaw.local({ forward: 0.20, down: 0.03 }), jaw.local({ forward: 0.42, down: 0.05 })),
    [0.13, 0.055],
    { bone: jaw, color: BELLY, sides: 8, name: "lowerJaw" },
  );
  b.part(new THREE.BoxGeometry(0.30, 0.035, 0.13), NOSE, { bone: jaw, at: jaw.local({ forward: 0.22, down: 0.01 }) });
  b.part(new THREE.SphereGeometry(0.085, 8, 6), NOSE, { bone: head, at: head.local({ forward: 0.52, down: 0.08 }) });
  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.14, forward: 0.20, up: 0.10 });
    b.part(new THREE.SphereGeometry(0.064, 8, 6), NOSE, { bone: head, at: eyeAt });
    glow(b.part(new THREE.SphereGeometry(0.043, 8, 6), EYE, { bone: head, at: head.local({ left: s * 0.14, forward: 0.235, up: 0.10 }) }), 1.8);
    glow(b.part(new THREE.SphereGeometry(0.017, 6, 4), EYE_CORE, { bone: head, at: head.local({ left: s * 0.13, forward: 0.268, up: 0.105 }) }), 2.2);
    b.spike(eyeAt, [0, 0.2, 1], 0.12, 0.021, { color: MANE, caps: "point" });
    b.spike(head.local({ left: s * 0.20, forward: 0.04, up: 0.23 }), [s * 0.16, 0.15, 0.9], 0.24, 0.055, { color: GOLD, caps: "point" });
    b.spike(head.local({ left: s * 0.24, forward: 0.02, up: 0.13 }), [s * 0.18, 0.18, 0.75], 0.19, 0.045, { color: GOLD_DARK, caps: "point" });
    b.extrude(
      [[0, 0], [0.18, 0], [0.13, 0.26], [0.04, 0.34]],
      { at: head.local({ left: s * 0.22, forward: 0.02, up: 0.14 }), x: [s, 0, 0], y: [0, 0, 1], thickness: 0.035, bevel: 0.008, color: MANE, name: `ear${s > 0 ? "L" : "R"}` },
    );
    b.spike(head.local({ left: s * 0.105, forward: 0.34, down: 0.09 }), [0, 0, -1], 0.13, 0.023, { color: CLAW, caps: "point" });
    b.spike(head.local({ left: s * 0.19, forward: 0.30, down: 0.10 }), [0, 0, -1], 0.11, 0.020, { color: CLAW, caps: "point" });
  }

  // Dense mane silhouette and a gold throat collar.
  const maneRing = b.ring(line(neck.at(0), head), { count: 18, radius: 0.28, fromDeg: 0, toDeg: 360 });
  b.cards(maneRing.items, maneTexture, {
    size: [0.16, 0.42],
    lean: 58,
    bend: 24,
    vary: 0.22,
    rng: rng(42),
    color: manePaint,
    sink: 0.12,
  });
  const collar = b.ring(line(neck.at(0), neck.at(1)), { count: 14, radius: 0.235, fromDeg: 0, toDeg: 360 });
  b.sweep(catmull(collar.items, { closed: true }), 0.025, { color: GOLD, sides: 6, name: "goldThroatCollar" });
  b.along(collar.items, collar.items.length, (at) => b.part(new THREE.SphereGeometry(0.028, 6, 4), GOLD_DARK, { at: at.at }));

  // Armour-like shoulder studs and a warm rosette field break up the large coat planes.
  const coatSurface = b.surface([body, foreLSweep, foreRSweep, hindLSweep, hindRSweep]);
  for (const hit of coatSurface.scatter(42, { rng: rng(77), minDist: 0.11, filter: (h) => h.n.y > -0.15 })) {
    b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.014, 7), GOLD_DARK, hit, { embed: 0.45, name: "coatStud" });
  }
  for (const side of [1, -1]) {
    const shoulder = spine.joints[2].local({ left: side * 0.30, up: 0.02, forward: 0.04 });
    b.part(new THREE.SphereGeometry(0.17, 8, 6), GOLD_DARK, { bone: spine.joints[2], at: shoulder, scale: [1.0, 0.55, 1.15] });
    glow(b.part(new THREE.SphereGeometry(0.032, 7, 5), EYE, { bone: spine.joints[2], at: spine.joints[2].local({ left: side * 0.44, up: 0.08, forward: 0.15 }) }), 1.2);
  }

  // Raised tail plates and the venomous hook.
  let tailSpikeIndex = 0;
  b.along(tail, 9, (at) => {
    b.spike(at, at, tailSpikeIndex % 2 === 0 ? 0.11 : 0.075, 0.028, { color: GOLD, caps: "point", name: "tailSpine" });
    tailSpikeIndex += 1;
  });
  const hook = b.spike(tail.tip!, tail.tip!, 0.30, 0.075, { color: STINGER, caps: "point", name: "venomHook" });
  glow(hook, 1.8);
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), STINGER, { bone: tail.tip!, at: tail.tip!.at }), 1.4);

  // Arcane markings on the wings and forehead make the silhouette read as a spell-infused champion.
  b.cards(
    [wingL.at(0.48), wingL.at(0.70), wingR.at(0.48), wingR.at(0.70)],
    runeTexture,
    { size: [0.18, 0.18], lean: 90, flow: [0, 0, 1], color: EYE, sink: 0.02 },
  );
  b.decal(head, runeTexture, {
    at: head.local({ forward: 0.13, up: 0.20 }),
    dir: [0, 0.5, 1],
    size: [0.12, 0.12],
    segments: 5,
    lift: 0.004,
    color: EYE,
    name: "foreheadRune",
  });

  return b.root;
}
