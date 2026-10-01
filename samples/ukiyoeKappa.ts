import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { catmull } from "../src/path";
import { gradient, mottle, paint, scales, stripes } from "../src/paint";
import { svg } from "../src/texture";

// Ukiyo-e Kappa — a river spirit as a Japanese woodblock print in 3D.
// Flat unshaded colours (indigo, vermilion, pale green, bone), dark
// contour rings, and printed wave / scute / scale patterns baked as paints.
const INK = "#232033";
const INDIGO = "#2f4470";
const INDIGO_DARK = "#22314f";
const VERMILION = "#d84028";
const SKIN = "#8fb37a";
const SKIN_DARK = "#6d8f5c";
const BONE = "#f2e7cd";
const WATER = "#4fa3b8";
const SHELL = "#3a4a68";
const CUCUMBER = "#4c7a3d";

export const meta = {
  name: "Ukiyo-e Kappa",
  description:
    "A kappa river spirit as a Japanese woodblock print in 3D: beaked face with separate jaw, water dish ringed by lank hair, turtle shell and plastron, webbed clawed limbs, holding a cucumber.",
};

export default function build() {
  const b = createBuilder({ name: "ukiyoeKappa" });

  // ---- flat woodblock paints (hard pattern edges, no shading) ----
  const skinPaint = mottle(SKIN, SKIN_DARK, { size: 0.09, contrast: 0.35, seed: 11 });
  const headPaint = mottle(SKIN, SKIN_DARK, { size: 0.05, contrast: 0.3, seed: 21 });
  const shellPaint = scales(SHELL, INK, { size: 0.055, width: 0.16, seed: 5 });
  const wavePaint = paint((p, _n, _s) => {
    const w = Math.sin(p.x * 130 + Math.sin(p.y * 150) * 1.4) + Math.sin(p.y * 170 + p.x * 40 + 1.7);
    return w > 0.5 ? INDIGO : BONE;
  });
  const limbPaint = stripes(SKIN, INDIGO_DARK, { size: 0.06, axis: [0, 1, 0], width: 0.14, seed: 3 });

  // ---- skeleton: crouched-upright humanoid, ~1.2 m ----
  const hips = b.joint("hips", { at: [0, 0.62, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, 0],
      [0, 0.78, -0.015],
      [0, 0.9, 0.0],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.93, 0.015],
    dir: [0, 0.35, 1],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.0, 0.055],
    dir: [0, 0.35, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.962, 0.1],
    aim: [0, 0.92, 0.3],
    role: "jaw",
  });

  // ---- torso ----
  b.sweep(spine, (t) => 0.155 - 0.035 * t, {
    color: skinPaint,
    shift: (t) => [0, -0.02 - 0.02 * Math.sin(t * Math.PI)],
  });
  b.sweep(
    catmull([
      [0, 0.66, 0],
      [0, 0.58, -0.02],
      [0, 0.5, -0.02],
    ]),
    [0.15, 0.11],
    { bone: spine.joints[0], color: skinPaint },
  );
  b.sweep(
    catmull([
      [0, 0.9, 0.0],
      [0, 0.95, 0.03],
      [0, 0.99, 0.05],
    ]),
    [0.075, 0.085],
    { bone: [chest, neck, head], color: skinPaint },
  );

  // ---- plastron (front plate) with printed wave pattern + vermilion rim ----
  b.extrude(
    [
      [-0.085, -0.13],
      [0.085, -0.13],
      [0.105, 0.02, "sharp"],
      [0.075, 0.14],
      [-0.075, 0.14],
      [-0.105, 0.02, "sharp"],
    ],
    {
      at: [0, 0.72, 0.15],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      smoothing: 2,
      color: wavePaint,
      bone: spine.joints[0],
    },
  );
  // vermilion studs pinning the plastron corners (woodblock seal-marks)
  for (const sx of [1, -1]) {
    for (const py of [0.6, 0.86]) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), VERMILION, {
        bone: spine.joints[0],
        at: [sx * 0.085, py, 0.168],
      });
    }
  }

  // ---- turtle shell on the back ----
  b.lathe(
    [
      [0, 0.075],
      [0.1, 0.07],
      [0.17, 0.03],
      [0.2, -0.02],
      [0.185, -0.035],
      [0.1, -0.045],
      [0, -0.045],
    ],
    {
      at: [0, 0.78, -0.08],
      axis: [0, 0.25, -1],
      segments: 14,
      smoothing: 2,
      color: shellPaint,
      bone: spine.joints[0],
    },
  );
  // vermilion cord round the shell rim
  b.sweep(
    catmull(
      [
        [0.18, 0.72, -0.1],
        [0.11, 0.62, -0.1],
        [0, 0.58, -0.11],
        [-0.11, 0.62, -0.1],
        [-0.18, 0.72, -0.1],
        [-0.13, 0.84, -0.1],
        [0, 0.9, -0.1],
        [0.13, 0.84, -0.1],
      ],
      { closed: true },
    ),
    0.016,
    { bone: spine.joints[0], color: VERMILION },
  );

  // ---- head: skull, beak, eyes ----
  const skull = b.part(new THREE.SphereGeometry(0.1, 12, 9), headPaint, {
    bone: head,
    at: head.local([0, 0.03, 0.02]),
    scale: [1, 0.95, 1.0],
  });
  // upper beak (turned cone pointing forward-down)
  b.lathe(
    [
      [0, 0.06],
      [0.05, 0.035],
      [0.062, -0.005],
      [0.028, -0.05],
      [0, -0.058],
    ],
    {
      at: head.local([0, 0.1, 0.0]),
      axis: [0, -0.25, 1],
      segments: 8,
      color: BONE,
      bone: head,
    },
  );
  // ink contour ring where beak meets face
  b.sweep(
    catmull([
      [0.055, 1.0, 0.12],
      [0.03, 0.975, 0.14],
      [0, 0.965, 0.145],
      [-0.03, 0.975, 0.14],
      [-0.055, 1.0, 0.12],
    ]),
    0.008,
    { bone: head, color: INK },
  );
  // lower jaw: separate beak on the jaw joint
  b.frustumBox([0, 0.958, 0.1], [0, 0.952, 0.19], [0.07, 0.035], [0.032, 0.02], {
    bone: jaw,
    color: BONE,
  });
  // eyes: bone-white balls with big ink pupils (woodblock dots)
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(head.local([0, 0.03, 0.02])).at(s * 42, 10);
    if (eyeHit) {
      const white = b.stick(new THREE.SphereGeometry(0.03, 8, 6), BONE, eyeHit, { embed: 0.5 });
      const pupilHit = b
        .surface(white.mesh)
        .around(white.at)
        .at(s * 20, 20);
      if (pupilHit) b.stick(new THREE.SphereGeometry(0.014, 6, 4), INK, pupilHit, { embed: 0.45 });
      const lidHit = b
        .surface(white.mesh)
        .around(white.at)
        .at(s * 10, 55);
      if (lidHit) b.stick(new THREE.SphereGeometry(0.006, 5, 4), INK, lidHit, { embed: 0.3 });
    }
  }

  // ---- water dish on the crown, ringed by lank hair ----
  const dishC = head.local([0, -0.01, 0.1]);
  b.lathe(
    [
      [0.055, 0.014],
      [0.08, 0.014],
      [0.09, 0.0],
      [0.087, -0.022],
      [0.06, -0.03],
      [0.05, -0.022],
    ],
    { at: dishC, segments: 16, color: INDIGO, bone: head },
  );
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 16), WATER, {
    bone: head,
    at: head.local([0, -0.01, 0.103]),
  });
  // vermilion ring round the dish foot
  b.sweep(
    catmull(
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const p = head.local([Math.cos(a) * 0.062, Math.sin(a) * 0.062, 0.073]);
        return [p.x, p.y, p.z] as [number, number, number];
      }),
      { closed: true },
    ),
    0.007,
    { bone: head, color: VERMILION },
  );
  // lank hair: dark strands hanging down round the dish
  const dishLine = frame(dishC, [0, -1, 0]);
  b.ring(dishLine, { count: 12, radius: 0.075, tilt: 25 }, (strand) => {
    b.spike(strand, strand, 0.1, 0.012, { color: INK });
  });
  // printed hair-strand cards between the spikes
  const hairTex = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 2 C10 22 10 42 14 62 L18 62 C15 42 15 22 20 4 Z" fill="#232033"/><path d="M16 6 L16 58" stroke="#f2e7cd" stroke-width="1"/></svg>`,
    { size: 128 },
  );
  b.cards(b.ring(dishLine, { count: 8, radius: 0.082 }).items, hairTex, {
    size: [0.035, 0.1],
    lean: 20,
    bend: 12,
  });

  // ---- arms, held out from the body ----
  let handRbone: import("../src/skeleton").Joint | null = null;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.19, 0.87, 0.0],
      [s * 0.4, 0.6, 0.2],
      [0.19, 0.19, 0.12],
      [
        [s * 1, -0.2, 0.3],
        [s * 1, 0.2, 0.3],
      ],
    );
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.05, 0.038], { color: limbPaint });
    const hand = arm.tip ?? arm.joints[arm.joints.length - 1];
    // webbed fingers: three digit chains fanning forward
    const tips: [number, number, number][] = [
      [s * 0.4, 0.575, 0.32],
      [s * 0.425, 0.565, 0.33],
      [s * 0.45, 0.56, 0.32],
    ];
    const digits = tips.map((tip, i) => {
      const d = b.chain(`dig${side}${i}`, [hand.at, tip], {
        parent: hand,
        count: 1,
        role: "digit",
      });
      b.sweep(d, [0.013, 0.006], { color: skinPaint });
      b.spike(d.at(1), d.at(1), 0.025, 0.007, { color: INK });
      return d;
    });
    b.membrane(digits[0], digits[1], { thickness: 0.006, color: skinPaint });
    b.membrane(digits[1], digits[2], { thickness: 0.006, color: skinPaint });
    // thumb
    const thumb = b.chain(`thumb${side}`, [hand.at, [s * 0.37, 0.585, 0.28]], {
      parent: hand,
      count: 1,
      role: "digit",
    });
    b.sweep(thumb, [0.012, 0.006], { color: skinPaint });
    void thumb;
    if (s < 0) handRbone = hand;
  }

  // ---- cucumber held in the creature's right hand (-X) ----
  const cukePaint = stripes(CUCUMBER, "#2f5c26", { size: 0.03, axis: [0, 0, 1], width: 0.4, seed: 9 });
  const handR = handRbone ?? chest;
  b.capsule([-0.405, 0.585, 0.28], [-0.385, 0.62, 0.46], 0.032, {
    bone: handR,
    color: gradient(cukePaint, BONE, [-0.405, 0.585, 0.28], [-0.385, 0.62, 0.46]),
  });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), BONE, {
    bone: handR,
    at: [-0.385, 0.62, 0.46],
  });

  // ---- legs: deep crouch, webbed clawed feet ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.11, 0.58, 0.0], [s * 0.155, 0.05, 0.1], [0.3, 0.3, 0.12], [[0, 0.2, 1]], {
      sole: [0, -0.15, 1],
    });
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.075, 0.05], { color: limbPaint });
    const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
    const toeTips: [number, number, number][] = [
      [s * 0.12, 0.012, 0.26],
      [s * 0.155, 0.012, 0.28],
      [s * 0.19, 0.012, 0.26],
    ];
    const toes = toeTips.map((tip, i) => {
      const d = b.chain(`toe${side}${i}`, [foot.at, tip], {
        parent: foot,
        count: 1,
        role: "digit",
      });
      b.sweep(d, [0.02, 0.01], { color: skinPaint });
      b.spike(d.at(1), d.at(1), 0.03, 0.009, { color: INK });
      return d;
    });
    b.membrane(toes[0], toes[1], { thickness: 0.008, color: skinPaint });
    b.membrane(toes[1], toes[2], { thickness: 0.008, color: skinPaint });
  }

  return b.root;
}
