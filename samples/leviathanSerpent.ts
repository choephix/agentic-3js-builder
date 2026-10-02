import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { countershade, paint, scales, stripes } from "../src/paint";
import { rng } from "../src/math";
import { catmull } from "../src/path";

const DEEP = "#123248";
const COAT = "#236b78";
const HIGHLIGHT = "#4bb7aa";
const BELLY = "#c7b978";
const BELLY_DARK = "#756139";
const RIDGE = "#8b3d32";
const RIDGE_LIGHT = "#d06b3f";
const HORN = "#d7c795";
const HORN_DARK = "#58482f";
const EYE_GOLD = "#f3b52f";
const PUPIL = "#171c24";
const TOOTH = "#f2e6bd";
const GILL = "#a94347";
const FIN = "#2c8790";

export const meta = {
  name: "Leviathan Serpent",
  description: "A coiled Warcraft-style sea serpent leviathan breaching from the ground, with plated scales, fins, horns, teeth, and a painted reef palette.",
  style: "Blizzard/Warcraft",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "leviathanSerpent", detail: 1.1, paintSize: 2048 });

  const core = b.joint("core", { at: [0, 0.41, 0], dir: [0, 0, 1], role: "spine" });

  const coilPath = catmull([
    [0, 0.41, 0],
    [0.72, 0.36, -0.22],
    [1.36, 0.31, -0.82],
    [1.42, 0.27, -1.55],
    [0.97, 0.24, -2.12],
    [0.18, 0.23, -2.38],
    [-0.68, 0.23, -2.25],
    [-1.28, 0.26, -1.72],
    [-1.49, 0.29, -1.02],
    [-1.26, 0.32, -0.42],
    [-0.76, 0.36, -0.06],
  ]);
  const coil = b.chain("coil", coilPath, {
    parent: core,
    count: 11,
    names: ["coil0", "coil1", "coil2", "coil3", "coil4", "coil5", "coil6", "coil7", "coil8", "coil9", "coilTip"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 0.41, 0],
    [0.02, 0.61, 0.46],
    [0.02, 1.06, 0.83],
    [0.02, 1.65, 1.04],
    [0.02, 2.16, 1.17],
    [0.02, 2.55, 1.30],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: core,
    count: 6,
    names: ["neckBase", "neckLow", "neckMid", "neckHigh", "neckCrown", "neckTip", "neckEnd"],
    role: "neck",
  });

  const coat = countershade(scales(COAT, HIGHLIGHT, { size: 0.20, width: 0.18, seed: 31 }), BELLY, { level: -0.18 });
  const coilSweep = b.sweep(coil, (t) => 0.34 - 0.25 * t, {
    color: coat,
    section: { ngon: 8 },
    caps: { start: "round", end: "point" },
    group: "body",
    name: "coiled_body",
  });
  const neckSweep = b.sweep(neck, (t) => 0.34 - 0.07 * t, {
    color: coat,
    section: { ngon: 8 },
    caps: { start: "round", end: "flat" },
    group: "body",
    name: "rising_neck",
  });

  const bellyPaint = countershade(stripes(BELLY, BELLY_DARK, { size: 0.32, axis: "z", width: 0.48, wobble: 0.2, seed: 17 }), BELLY, { level: 0.65, soft: 0.7 });
  b.sweep(coil, (t) => 0.34 - 0.25 * t, {
    color: bellyPaint,
    section: { ngon: 8 },
    sectors: [[112, 248, bellyPaint]],
    group: "belly_plates",
    name: "coiled_belly",
  });
  b.sweep(neck, (t) => 0.34 - 0.07 * t, {
    color: bellyPaint,
    section: { ngon: 8 },
    sectors: [[112, 248, bellyPaint]],
    group: "belly_plates",
    name: "neck_belly",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0.02, 2.55, 1.30],
    dir: [0, 0.06, 1],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.46, 10, 7), coat, {
    bone: head,
    at: head.at,
    scale: [1.08, 0.92, 1.22],
    group: "head",
    name: "heavy_skull",
  });
  b.frustumBox(head.local({ back: 0.12, down: 0.14 }), head.local({ forward: 0.62, down: 0.18 }), [0.62, 0.50], [0.48, 0.34], {
    bone: head,
    color: coat,
    section: "box",
    group: "head",
    name: "muzzle_block",
  });

  const upperJaw = b.joint("jawUpper", {
    parent: head,
    at: head.local({ forward: 0.34, down: 0.12 }),
    dir: [0, -0.01, 1],
    role: "jaw",
  });
  const lowerJaw = b.joint("jawLower", {
    parent: head,
    at: head.local({ forward: 0.30, down: 0.22 }),
    dir: [0, -0.18, 1],
    role: "jaw",
  });
  b.frustumBox(upperJaw.at, upperJaw.local({ forward: 0.46, down: 0.02 }), [0.47, 0.20], [0.34, 0.13], {
    bone: upperJaw,
    color: coat,
    group: "jaws",
    name: "upper_jaw",
  });
  b.frustumBox(lowerJaw.at, lowerJaw.local({ forward: 0.43, down: 0.08 }), [0.39, 0.16], [0.27, 0.10], {
    bone: lowerJaw,
    color: BELLY_DARK,
    group: "jaws",
    name: "lower_jaw",
  });

  b.sweep(catmull([
    lowerJaw.at,
    lowerJaw.local({ forward: 0.14, down: 0.06 }),
    head.local({ back: 0.20, down: 0.27 }),
  ]), [0.23, 0.15], { bone: lowerJaw, color: GILL, section: { ngon: 6 }, caps: "round", group: "jaws", name: "red_throat" });

  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.27, up: 0.14, forward: 0.30 });
    b.part(new THREE.SphereGeometry(0.105, 8, 6), EYE_GOLD, { bone: head, at: eyeAt, group: "face", name: s === 1 ? "eyeL" : "eyeR" });
    b.part(new THREE.SphereGeometry(0.052, 7, 5), PUPIL, {
      bone: head,
      at: head.local({ left: s * 0.277, up: 0.145, forward: 0.387 }),
      group: "face",
      name: s === 1 ? "pupilL" : "pupilR",
    });
    b.spike(eyeAt, head.local({ left: s * 0.34, up: 0.29, forward: 0.28 }), 0.16, 0.045, { bone: head, color: HORN_DARK, group: "brow", name: s === 1 ? "browL" : "browR" });
    b.spike(head.local({ left: s * 0.20, up: 0.08, forward: 0.48 }), head.local({ left: s * 0.20, up: 0.01, forward: 0.48 }), 0.15, 0.018, { bone: head, color: HORN, group: "whiskers", name: s === 1 ? "whiskerL" : "whiskerR" });
  }

  const toothLines = [upperJaw, lowerJaw];
  toothLines.forEach((jaw, jawIndex) => {
    for (const s of [1, -1]) {
      for (let i = 0; i < 4; i += 1) {
        const forward = 0.08 + i * 0.105;
        const base = jaw.local({ left: s * (0.17 - i * 0.018), forward, down: jawIndex === 0 ? 0.12 : -0.005 });
        b.spike(base, [0, jawIndex === 0 ? -1 : 1, 0.03], jawIndex === 0 ? 0.15 - i * 0.012 : 0.10 - i * 0.008, 0.025, {
          bone: jaw,
          color: TOOTH,
          group: "teeth",
          name: `${jawIndex === 0 ? "upper" : "lower"}_tooth_${s}_${i}`,
        });
      }
    }
  });

  const dorsal = (tube: typeof coilSweep | typeof neckSweep, count: number, start = 0, end = 1) => {
    b.along(tube, count, (at) => {
      const size = 0.17 + 0.18 * (1 - at.t);
      b.spike(at, at, size, size * 0.34, { color: RIDGE, group: "dorsal_spines", name: `dorsal_${Math.round(at.t * 1000)}` });
      b.spike(at.moved([0, 0.012, 0]), at, size * 0.62, size * 0.17, { color: RIDGE_LIGHT, group: "dorsal_highlight", name: `dorsal_highlight_${Math.round(at.t * 1000)}` });
    }, { from: start, to: end });
  };
  dorsal(coilSweep, 15, 0.03, 0.96);
  dorsal(neckSweep, 7, 0.04, 0.96);

  const neckFin = paint((_p, n, s) => n.y > 0.35 && s[0] > 0.18 ? RIDGE_LIGHT : FIN);
  b.membrane(neckSweep.line(0, 0.015).slice(0.12, 0.95), neckSweep.line(0, 0.28).slice(0.12, 0.95), {
    color: neckFin,
    thickness: 0.025,
    rows: 5,
    cols: 18,
    scallop: 0.15,
    group: "neck_fin",
    name: "crown_fin",
  });

  const scaleHits = b.surface([coilSweep, neckSweep]).scatter(38, {
    minDist: 0.16,
    rng: rng(31),
    filter: (hit) => hit.n.y > 0.18,
  });
  for (let i = 0; i < scaleHits.length; i += 1) {
    const hit = scaleHits[i];
    b.stick(new THREE.ConeGeometry(0.075, 0.045, 6), i % 3 === 0 ? HORN_DARK : RIDGE, hit, {
      embed: 0.7,
      group: "armor_scales",
      name: `armor_scale_${i}`,
    });
  }

  for (const s of [1, -1]) {
    b.extrude([
      [0, 0, "sharp"],
      [0.35, 0.12],
      [0.23, 0.34],
      [0.06, 0.52, "sharp"],
    ], {
      at: head.local({ left: s * 0.31, down: 0.03, back: 0.02 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: [0.045, 0.012],
      bevel: 0.014,
      color: FIN,
      bone: head,
      group: "cheek_fins",
      name: s === 1 ? "cheek_fin_L" : "cheek_fin_R",
    });
  }

  const hornBaseL = head.local({ left: 0.23, up: 0.28, back: 0.04 });
  const hornBaseR = head.local({ left: -0.23, up: 0.28, back: 0.04 });
  for (const [s, base] of [[1, hornBaseL], [-1, hornBaseR]] as const) {
    b.sprout(`horn${s === 1 ? "L" : "R"}`, frame(base, [s * 0.28, 0.65, -0.12]), catmull([
      base,
      head.local({ left: s * 0.34, up: 0.50, back: 0.16 }),
      head.local({ left: s * 0.18, up: 0.76, back: 0.10 }),
    ]), [0.10, 0.012], {
      count: 2,
      names: [`horn${s === 1 ? "L" : "R"}Base`, `horn${s === 1 ? "L" : "R"}Tip`],
      role: "fan",
      color: HORN,
      caps: { end: "point" },
      group: "horns",
    });
    b.spike(base, head.local({ left: s * 0.34, up: 0.50, back: 0.16 }), 0.22, 0.06, { bone: head, color: HORN_DARK, group: "horn_bases" });
  }

  for (const s of [1, -1]) {
    const gillOrigin = head.local({ left: s * 0.39, down: 0.05, forward: 0.03 });
    for (let i = 0; i < 3; i += 1) {
      b.rod(
        gillOrigin,
        head.local({ left: s * (0.42 + i * 0.018), down: 0.12 + i * 0.075, forward: 0.10 + i * 0.035 }),
        0.018,
        { bone: head, color: GILL, group: "gills", name: `gill_${s}_${i}` },
      );
    }
  }

  const tailTip = coil.at(1);
  b.spike(tailTip, tailTip.dir([0, -1, 0]), 0.30, 0.12, { color: DEEP, group: "tail_tip", name: "tail_tip" });

  return b.root;
}
