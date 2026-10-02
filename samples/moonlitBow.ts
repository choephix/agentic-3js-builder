import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { rng } from "../src/math";
import { cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

const LIMB = cel("#8c5bc7", "#4b2b88");
const LIMB_EDGE = cel("#c795ff", "#7440b0");
const GOLD = cel("#f8d37a", "#a85d2c");
const GRIP = cel("#3b244e", "#1b1230");
const STRING = cel("#e8ecff", "#9299c8");
const MOON = "#a6e7ff";
const RUNE = "#78f6ff";
const BASE = cel("#293050", "#15192f");
const BASE_TRIM = cel("#5568a3", "#293463");

export const meta = {
  name: "Moonlit Elven Longbow",
  description: "A moonlit elven longbow with violet limbs, gold filigree, luminous runes, and a carved stone display plinth.",
  style: "high-fantasy anime",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "moonlitBow", detail: 1 });
  const random = rng(9555);
  const root = b.joint("bowRoot", { at: [0, 0.05, 0], aim: [0, 1, 0], role: "fan" });

  const bowPoints = [
    [0.13, 0.18, 0],
    [0.23, 0.34, 0],
    [0.38, 0.57, 0],
    [0.48, 0.80, 0],
    [0.47, 0.96, 0],
    [0.49, 1.12, 0],
    [0.42, 1.37, 0],
    [0.27, 1.65, 0],
    [0.13, 1.84, 0],
  ] as number[][];
  const bowPath = catmull(bowPoints, { tension: 0.35 });
  const limbPaint = furEdge(LIMB, LIMB_EDGE, {
    axis: [0, 0, 1],
    level: 0.02,
    teeth: 0.10,
    period: 0.20,
    along: [0, 1, 0],
    ink: INK,
    inkWidth: 0.035,
  });
  const bow = b.sweep(bowPath, (t) => 0.052 - 0.014 * Math.abs(t - 0.5), {
    bone: root,
    color: limbPaint,
    section: { ngon: 6 },
    caps: "round",
    name: "violetBowLimb",
    group: "bow",
  });

  const lowerFiligree = catmull([
    [0.15, 0.22, 0.060],
    [0.27, 0.43, 0.060],
    [0.40, 0.67, 0.060],
    [0.46, 0.86, 0.060],
  ]);
  const upperFiligree = catmull([
    [0.48, 1.07, 0.060],
    [0.43, 1.31, 0.060],
    [0.29, 1.59, 0.060],
    [0.15, 1.80, 0.060],
  ]);
  b.sweep(lowerFiligree, 0.010, { bone: root, color: GOLD, section: { ngon: 5 }, caps: "point", name: "goldFiligreeLower", group: "filigree" });
  b.sweep(upperFiligree, 0.010, { bone: root, color: GOLD, section: { ngon: 5 }, caps: "point", name: "goldFiligreeUpper", group: "filigree" });

  const stringPath = polyline([
    [0.13, 0.18, 0.018],
    [0.25, 0.99, 0.018],
    [0.13, 1.84, 0.018],
  ]);
  b.sweep(stringPath, 0.009, {
    bone: root,
    color: STRING,
    section: { ngon: 5 },
    caps: "round",
    name: "moonstring",
    group: "string",
  });

  const gripPath = polyline([
    [0.47, 0.83, 0.0],
    [0.48, 1.16, 0.0],
  ]);
  const grip = b.sweep(gripPath, 0.070, {
    bone: root,
    color: GRIP,
    section: { ngon: 6 },
    caps: "round",
    name: "leatherGrip",
    group: "grip",
  });
  for (let i = 0; i < 6; i += 1) {
    const y = 0.85 + i * 0.057;
    b.rod([0.415, y, 0.045], [0.535, y, 0.045], 0.009, {
      bone: root,
      color: GOLD,
      name: `gripWrap${i}`,
      group: "grip-wraps",
    });
  }
  b.part(new THREE.OctahedronGeometry(0.105, 0), GOLD, {
    bone: root,
    at: [0.48, 0.995, 0.065],
    scale: [1.0, 1.18, 0.65],
    flat: true,
    name: "gripGemMount",
    group: "grip",
  });

  const tipGeometry = new THREE.OctahedronGeometry(0.075, 0);
  for (const [name, at] of [
    ["lowerTipCap", [0.13, 0.18, 0.0]],
    ["upperTipCap", [0.13, 1.84, 0.0]],
  ] as [string, number[]][]) {
    b.part(tipGeometry.clone(), GOLD, {
      bone: root,
      at,
      scale: [0.75, 1.25, 0.75],
      flat: true,
      name,
      group: "tips",
    });
  }

  const crescentPath = catmull([
    [0.34, 0.45, 0.09],
    [0.25, 0.50, 0.09],
    [0.20, 0.60, 0.09],
    [0.23, 0.71, 0.09],
    [0.31, 0.78, 0.09],
  ]);
  glow(b.sweep(crescentPath, 0.022, {
    bone: root,
    color: MOON,
    section: { ngon: 6 },
    caps: "point",
    name: "hangingCrescent",
    group: "moon-charm",
  }), 1.6);
  b.rod([0.32, 0.45, 0.065], [0.40, 0.54, 0.065], 0.010, {
    bone: root,
    color: GOLD,
    name: "crescentCord",
    group: "moon-charm",
  });

  const runePositions = [
    [0.31, 0.51, 0.070],
    [0.40, 0.69, 0.070],
    [0.445, 1.28, 0.070],
    [0.35, 1.50, 0.070],
    [0.22, 1.69, 0.070],
  ];
  for (let i = 0; i < runePositions.length; i += 1) {
    const jitter = (random() - 0.5) * 0.008;
    const [x, y, z] = runePositions[i];
    const rune = b.part(new THREE.OctahedronGeometry(0.026, 0), RUNE, {
      bone: root,
      at: [x + jitter, y, z],
      scale: [0.75, 1.25, 0.30],
      flat: true,
      name: `moonRune${i}`,
      group: "runes",
    });
    glow(rune, 2.0);
  }
  const nock = b.part(new THREE.SphereGeometry(0.035, 8, 6), RUNE, {
    bone: root,
    at: [0.25, 0.99, 0.028],
    name: "nockingJewel",
    group: "runes",
  });
  glow(nock, 1.8);

  const base = b.part(new THREE.CylinderGeometry(0.37, 0.43, 0.10, 8), BASE, {
    bone: root,
    at: [0.08, 0.05, 0],
    flat: true,
    name: "stonePlinth",
    group: "plinth",
  });
  b.part(new THREE.CylinderGeometry(0.29, 0.33, 0.045, 8), BASE_TRIM, {
    bone: root,
    at: [0.08, 0.122, 0],
    flat: true,
    name: "plinthTop",
    group: "plinth",
  });
  b.part(new THREE.CylinderGeometry(0.085, 0.11, 0.105, 8), GOLD, {
    bone: root,
    at: [0.13, 0.185, 0],
    flat: true,
    name: "bowSocket",
    group: "plinth",
  });
  const frontRunes = [-0.10, 0.02, 0.14, 0.26];
  for (let i = 0; i < frontRunes.length; i += 1) {
    const rune = b.part(new THREE.OctahedronGeometry(0.018, 0), RUNE, {
      bone: root,
      at: [frontRunes[i], 0.155, 0.18],
      scale: [1.0, 0.55, 0.25],
      flat: true,
      name: `plinthRune${i}`,
      group: "plinth-runes",
    });
    glow(rune, 1.4);
  }
  void bow;
  void grip;
  void base;
  return b.root;
}
