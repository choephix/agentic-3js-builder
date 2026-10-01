import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { lerp, mid, offset, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { limb } from "../src/ik";
import { gradient, grain, mottle, paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Ink-wash Crane",
  description:
    "A red-crowned crane in Chinese ink-wash style: graded black washes on rice-paper white, dry-brush strokes, one red crown accent, standing on one leg in shallow water among reeds and a flat rock.",
};

// Palette: rice-paper whites, graded ink greys, black, one cinnabar red.
const PAPER = "#f4f1e6";
const WASH_LIGHT = "#d9d6cb";
const WASH_MID = "#8f8d86";
const WASH_DARK = "#45443f";
const INK = "#1a1917";
const RED = "#c23724";
const REED_GREEN = "#6d7263";
const ROCK = "#b9b6ab";
const WATER = "#ccd5cf";

export default function build() {
  const b = createBuilder({ name: "inkwashCrane", paintSize: 1024 });
  const random = rng(20260930);

  // Ink wash paint shared by the body: pale paper with soft grey clouding,
  // denser toward the back and tail.
  const bodyWash = mottle(PAPER, WASH_MID, { size: 0.16, contrast: 0.55, seed: 11 });
  const bodyShade = paint((p, n, _s) => {
    const back = Math.max(0, n.y * 0.5 + 0.5);
    const tailward = Math.max(0, Math.min(1, (0.05 - p.z) / 0.55));
    const shade = 0.35 * back + 0.4 * tailward * tailward;
    return shade > 0.62 ? WASH_DARK : shade > 0.38 ? WASH_MID : bodyWash;
  });
  const neckWash = gradient(INK, WASH_DARK, [0, 1.32, 0.05], [0, 1.06, 0.02]);
  const reedPaint = grain(REED_GREEN, WASH_DARK, { size: 0.05, axis: "y", seed: 5 });
  const rockPaint = mottle(ROCK, WASH_MID, { size: 0.09, contrast: 0.5, seed: 21 });

  // ---------------------------------------------------------------- skeleton
  // Root low in the body; body axis runs forward (+Z) and slightly up.
  const hips = b.joint("hips", { at: [0, 1.02, -0.08], dir: [0, 0.25, 1], role: "spine" });

  // Body core chain: tail base -> hips -> chest, ending at the neck root.
  const bodyCore = b.chain(
    "spine",
    catmull([
      [0, 1.08, -0.5],
      [0, 1.04, -0.28],
      [0, 1.02, -0.08],
      [0, 1.04, 0.1],
      [0, 1.08, 0.24],
    ]),
    { parent: hips, count: 4, names: ["tailBase", "pelvis", "chest", "neckRoot"], role: "spine" },
  );

  // Neck: S-curve rising from the chest, leaning forward at the top.
  const neckPts = catmull([
    [0, 1.06, 0.24],
    [0, 1.1, 0.33],
    [0, 1.22, 0.33],
    [0, 1.33, 0.24],
    [0, 1.42, 0.24],
    [0, 1.46, 0.33],
  ]);
  const neck = b.chain("neck", neckPts, {
    parent: bodyCore.joints[3],
    count: 5,
    names: ["neck1", "neck2", "neck3", "neck4", "neck5"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.joints[4],
    at: [0, 1.46, 0.35],
    dir: [0, 0.12, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.09, -0.02]),
    aim: head.local([0, 0.32, -0.03]),
    role: "jaw",
  });

  // Tail plume chain: short, lifting up-back from the tail base.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.08, -0.48],
      [0, 1.14, -0.62],
      [0, 1.22, -0.72],
      [0, 1.3, -0.76],
    ]),
    { parent: bodyCore.joints[0], count: 3, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Standing leg (creature's right, -X): hip socket -> knee -> ankle -> foot.
  // Cranes show a reversed-seeming ankle; knee forward, ankle back.
  const footTarget: [number, number, number] = [-0.055, 0.022, 0.1];
  const legPts = limb(
    [-0.055, 0.98, -0.02],
    footTarget,
    [0.52, 0.46, 0.1],
    [
      [0, 0.15, 1],
      [0, 0, -1],
    ],
  );
  if (legPts[legPts.length - 1].distanceTo(new THREE.Vector3(...footTarget)) > 1e-3)
    throw new Error("standing leg cannot reach the floor");
  const legR = b.chain("legR", legPts, {
    parent: bodyCore.joints[1],
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: footTarget,
  });

  // Folded leg (creature's left, +X): thigh tucked up under the belly,
  // cannon folded back, foot hidden in the flank feathers.
  const foldedPts = limb(
    [0.085, 0.98, 0.02],
    [0.115, 0.9, -0.16],
    [0.14, 0.15, 0.1],
    [
      [0.4, 0, -1],
      [0.2, 0, 0.6],
    ],
  );
  const legL = b.chain("legL", foldedPts, {
    parent: bodyCore.joints[1],
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
  });

  // Three front toes on the standing foot (fan role), plus a small rear toe.
  const toeDirs: Array<[number, number, number]> = [
    [0.55, -0.12, 0.83],
    [-0.1, -0.12, 1.0],
    [-0.62, -0.12, 0.78],
  ];
  const toeChains = toeDirs.map((d, i) => {
    const tip = offset(footTarget, d, 0.11).setY(0.012);
    const pts = limb(footTarget, [tip.x, tip.y, tip.z], [0.06, 0.055], [[0, 0, 1]]);
    return b.chain(`toe${i + 1}`, pts, {
      parent: legR.tip ?? legR.joints[legR.joints.length - 1],
      names: [`toe${i + 1}a`, `toe${i + 1}b`],
      role: "digit",
    });
  });
  const backToePts = limb(footTarget, [-0.03, 0.012, -0.07], [0.045, 0.04], [[0, 0, -1]]);
  b.chain("toeBack", backToePts, {
    parent: legR.tip ?? legR.joints[legR.joints.length - 1],
    names: ["toeBackA", "toeBackB"],
    role: "digit",
  });

  // Folded wings: one chain per side along the flank; feathers ride it.
  const wingChains = [1, -1].map((s) => {
    const pts = catmull([
      [s * 0.09, 1.1, 0.14],
      [s * 0.15, 1.1, -0.1],
      [s * 0.12, 1.12, -0.34],
      [s * 0.05, 1.16, -0.52],
    ]);
    return b.chain(s > 0 ? "wingL" : "wingR", pts, {
      parent: bodyCore.joints[2],
      count: 3,
      names: s > 0 ? ["shoulderL", "elbowL", "wristL"] : ["shoulderR", "elbowR", "wristR"],
      role: "wing",
    });
  });

  // ------------------------------------------------------------------- body
  // Body loft: teardrop from tail to chest, wider than tall at the wings.
  const bodySweep = b.sweep(bodyCore, (t) => 0.035 + 0.095 * Math.sin(Math.PI * Math.min(1, 0.1 + t * 0.95)), {
    color: bodyShade,
    detail: 1,
  });
  void bodySweep;

  // Long black tertial plumes draped over the rear back (the crane's bustle).
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const root = frame([s * (0.03 + i * 0.01), 1.12 - i * 0.004, -0.28 - i * 0.04], [s * 0.3, 0.3, -0.7]);
      const bend = offset(root, [s * 0.3, -0.05, -1], 0.15);
      const tip = offset(bend, [s * 0.06, -0.08, -0.85], 0.15);
      b.sweep(bezier(root, bend, tip), [0.016 - i * 0.0012, 0.002], {
        bone: tail.joints[0],
        color: INK,
        caps: { end: "point" },
        detail: 0.6,
      });
    }
  }
  // Tail stub tube joining the rear plumes to the fan.
  b.sweep(tail, [0.035, 0.018], { color: INK, detail: 0.8 });
  // Tail feathers fanning from the actual tail tip, streaming back-down.
  const tailTip = tail.tip ?? tail.joints[tail.joints.length - 1];
  const tailAxis = tailTip.dir([0, 0.35, -1]);
  b.ring(frame(tailTip.at, tailAxis), { count: 7, radius: 0.028, fromDeg: -30, toDeg: 30, tilt: 4 }, (feather) => {
    const fTip = offset(tailTip.at, tailAxis, 0.2);
    b.sweep(bezier(feather, mid(feather, fTip), fTip), [0.015, 0.002], {
      bone: tail.joints[2],
      color: INK,
      caps: { end: "point" },
      detail: 0.6,
    });
  });

  // Neck tube: slim, black, S-curved; white cheeks painted via sectors near head.
  b.sweep(neck, (t) => 0.038 - t * 0.012, {
    color: neckWash,
    sectors: [[-55, 55, PAPER, 0.8, 1]],
    detail: 1,
  });

  // Head: white crown-to-cheek ball with black nape wedge + red crown patch.
  const skull = b.part(new THREE.SphereGeometry(0.052, 12, 9), PAPER, {
    bone: head,
    at: head.local([0, 0.03, 0.015]),
    scale: [0.82, 1.05, 0.9],
  });
  // Black nape wedge sweeping from the neck up the back of the head.
  b.sweep(
    bezier(head.local([0, -0.02, -0.02]), head.local([0, -0.032, 0.02]), head.local([0, -0.036, 0.055])),
    [0.034, 0.012],
    {
      bone: head,
      color: INK,
      caps: { start: "flat", end: "point" },
    },
  );
  // Red crown patch seated on top of the skull.
  const crownHit = b.surface(skull).around(skull.at).at(0, 62);
  if (crownHit)
    b.stick(new THREE.SphereGeometry(0.016, 10, 6), RED, crownHit.moved([0, 0.004, 0.012]), {
      embed: 0.45,
      scale: [1.15, 0.55, 1.35],
    });
  // Eyes: small black beads with a pale ink ring.
  for (const s of [1, -1]) {
    const eyeAt = head.local([s * 0.036, 0.055, 0.03]);
    b.part(new THREE.SphereGeometry(0.0095, 8, 6), INK, { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.003, 6, 4), PAPER, { bone: head, at: offset(eyeAt, [0, 1, 0.4], 0.007) });
    const ringAt = head.local([s * 0.037, 0.047, 0.029]);
    b.part(new THREE.TorusGeometry(0.011, 0.0022, 5, 12), WASH_MID, {
      bone: head,
      at: ringAt,
      dir: head.dir([s * 0.55, 1, 0.1]),
      axis: "z",
    });
  }

  // Bill: upper (head bone) + separate lower bill (jaw bone) so it can open.
  const billBase = head.local([0, 0.08, 0.0]);
  const billTip = head.local([0, 0.28, -0.02]);
  b.sweep(bezier(billBase, mid(billBase, billTip), billTip), [0.013, 0.001], {
    bone: head,
    color: gradient(WASH_DARK, INK, billBase, billTip),
    detail: 0.7,
  });
  const jawBase = jaw.local([0, 0.02, -0.005]);
  const jawTip = jaw.local([0, 0.19, -0.015]);
  b.sweep(bezier(jawBase, mid(jawBase, jawTip), jawTip), [0.008, 0.001], {
    bone: jaw,
    color: WASH_DARK,
    detail: 0.7,
  });

  // Folded wing coverts: layered ink-grey slab feathers along each wing chain.
  for (const [wi, wing] of wingChains.entries()) {
    const s = wi === 0 ? 1 : -1;
    b.sweep(wing, (t) => 0.045 - t * 0.024, {
      color: wi === 0 ? bodyShade : bodyShade,
      detail: 0.8,
    });
    for (let i = 0; i < 5; i++) {
      const t = 0.1 + i * 0.13;
      const c = wing.at(t);
      const root = frame(offset(c.at, [s * 0.9, 0.12, 0], 0.026), [s * 0.2, 0.08, -0.95]);
      const tipP = offset(offset(c.at, [s * 0.06, -0.05, -1], i < 3 ? 0.11 : 0.07), [0, -0.02, 0], i * 0.005);
      b.sweep(bezier(root, mid(root, tipP), tipP), [0.014, 0.002], {
        bone: c.bone,
        color: INK,
        caps: { end: "point" },
        detail: 0.6,
      });
    }
  }

  // Legs: ink-dark standing leg, folded leg tucked under the flank.
  b.sweep(legR, (t) => (t > 0.86 ? 0.011 : 0.017 - t * 0.004), {
    color: gradient(INK, WASH_DARK, legPts[0], legPts[2]),
    detail: 0.8,
  });
  b.sweep(legL, [0.026, 0.011], { color: gradient(WASH_DARK, PAPER, foldedPts[0], foldedPts[1]), detail: 0.8 });
  // Folded foot nub hidden against the belly.
  b.capsule(foldedPts[2], offset(foldedPts[2], [0, 0.5, 1], 0.045), 0.01, { bone: legL.joints[2], color: PAPER });
  // Toes on the standing foot.
  for (const toes of toeChains) b.sweep(toes, [0.008, 0.002], { color: WASH_DARK, detail: 0.6 });

  // ----------------------------------------------------------------- scenery
  // Shallow water: a thin pale disc with ink ripple rings; plain scenery.
  const waterRoot = b.joint("waterRoot", { at: [0, -0.4, 0] });
  const ripplePaint = paint((p, _n, _s) => {
    const r = Math.hypot(p.x - -0.03, p.z - 0.02);
    const ring = Math.abs(((r * 34) % 1) - 0.5);
    if (r > 0.62) return PAPER;
    return ring < 0.1 ? WASH_MID : WATER;
  });
  b.part(new THREE.CylinderGeometry(0.78, 0.78, 0.012, 40), ripplePaint, {
    bone: waterRoot,
    at: [-0.03, 0.006, 0.02],
  });
  // Darker under-wash ellipse beneath the crane (reflection weight).
  const reflectPaint = paint((p, _n, _s) => {
    const d = Math.hypot((p.x + 0.03) * 1.4, (p.z - 0.05) * 2.2);
    return d < 0.3 ? WASH_LIGHT : PAPER;
  });
  b.part(new THREE.CircleGeometry(0.34, 28), reflectPaint, {
    bone: waterRoot,
    at: [-0.03, 0.013, 0.0],
    dir: [0, 1, 0],
    axis: "z",
  });

  // Flat rock: low lathe slab with an ink edge wash, right of the crane.
  const rockAt: [number, number, number] = [-0.42, 0.0, -0.18];
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.23, 0.02],
      [0.19, 0.055],
      [0.1, 0.07],
      [0, 0.075],
    ],
    { at: rockAt, bone: waterRoot, segments: b.segments(18), smoothing: 2, color: rockPaint },
  );
  // Ink edge line around the rock rim.
  b.sweep(
    catmull(
      [
        [rockAt[0] + 0.2, 0.035, rockAt[2]],
        [rockAt[0], 0.045, rockAt[2] + 0.16],
        [rockAt[0] - 0.2, 0.035, rockAt[2]],
        [rockAt[0], 0.045, rockAt[2] - 0.16],
      ],
      { closed: true },
    ),
    0.006,
    { bone: waterRoot, color: WASH_DARK },
  );

  // Reeds: clusters of tapered stems with dry-brush leaves, left and back.
  const reedClusters: Array<{ x: number; z: number; n: number; h: number }> = [
    { x: 0.42, z: -0.28, n: 3, h: 0.72 },
    { x: 0.55, z: 0.12, n: 2, h: 0.55 },
    { x: -0.5, z: 0.3, n: 2, h: 0.5 },
  ];
  const leafTex = svg(
    `<svg viewBox="0 0 32 96"><path d="M16 94 C8 62 6 30 16 4 C26 30 24 62 16 94 Z" fill="#9aa092"/><path d="M16 90 L16 10" stroke="#3a3935" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const seedTex = svg(
    `<svg viewBox="0 0 24 96"><rect x="9" y="6" width="6" height="52" fill="#4a4843"/><rect x="7" y="2" width="10" height="8" fill="#2b2a27"/></svg>`,
    { size: 128 },
  );
  for (const [ci, c] of reedClusters.entries()) {
    for (let i = 0; i < c.n; i++) {
      const rx = c.x + (random() - 0.5) * 0.14;
      const rz = c.z + (random() - 0.5) * 0.14;
      const h = c.h * (0.8 + random() * 0.4);
      const lean = (random() - 0.5) * 0.14;
      const base: [number, number, number] = [rx, 0.0, rz];
      const tip: [number, number, number] = [rx + lean, h, rz + lean * 0.5];
      b.sweep(bezier(base, mid(base, tip), tip), [0.01, 0.003], {
        bone: waterRoot,
        color: reedPaint,
        detail: 0.6,
      });
      const top = new THREE.Vector3(...tip);
      if ((ci + i) % 2 === 0) {
        // Seed head card.
        b.cards([frame(top.toArray(), [0, 1, 0])], seedTex, {
          size: [0.03, 0.13],
          lean: 2,
          flow: [0, 0, 1],
          bone: waterRoot,
        });
      }
      // Two leaves per stem.
      const leafFrames = [0.45, 0.7].map((t) => {
        const p = lerp(base, tip, t);
        return frame([p.x, p.y, p.z], [(rx > 0 ? 1 : -1) * 0.8, 0.5, 0.2]);
      });
      b.cards(leafFrames, leafTex, {
        size: [0.04, 0.15],
        lean: 40,
        bend: 18,
        flow: [rx > 0 ? 1 : -1, -0.2, 0.3],
        mirror: rx < 0,
        rng: rng(100 + ci * 10 + i),
        bone: waterRoot,
      });
    }
  }

  // Dry-brush accents: a few pale cards drifting on the water (empty space kept).
  const driftTex = svg(
    `<svg viewBox="0 0 64 16"><path d="M4 10 C 20 6, 44 6, 60 10" stroke="#8f8d86" stroke-width="4" fill="none"/></svg>`,
    {
      size: 128,
    },
  );
  b.cards([frame([0.18, 0.014, 0.3], [0, 1, 0]), frame([-0.3, 0.014, 0.32], [0, 1, 0])], driftTex, {
    size: [0.16, 0.04],
    lean: 90,
    flow: [1, 0, 0],
    mirror: true,
    bone: waterRoot,
  });

  return b.root;
}
