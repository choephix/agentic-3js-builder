// Cyborg support medic with a healing staff: Overwatch-style polished stylized sci-fi hero.
// Clean bold armour shapes with panel lines and bevels, cream/white colour block, one strong accent (cyan glow),
// supported by coral and gold trims.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { lerp } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { countershade, grain, mix, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { bezier, catmull, polyline, spiral } from "../../../../src/path";
import type { Chain, Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg medic: cream long coat with coral lining and gold trim, teal bodysuit, white armoured cyber arm and legs with cyan glow rings, and a winged healing staff with a glowing orb.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type Col = string | Paint;
type Bone = Joint | Chain;

// ---- palette -------------------------------------------------------------------------------------------------
const WHITE = "#f3f0e8";
const WHITE_SH = "#cfcabd";
const CREAM = "#f1e7d2";
const CREAM_SH = "#d8c6a2";
const TEAL = "#2a9a9c";
const TEAL_D = "#1b6a74";
const CORAL = "#e8604c";
const GOLD = "#dca93a";
const GOLD_D = "#a97a22";
const GRAPH = "#343b43";
const GRAPH_L = "#535b64";
const CYAN = "#5ff3f0";
const SKIN = "#e9b99c";
const SKIN_SH = "#c98f78";
const HAIR = "#d4cdc2";
const HAIR_D = "#a8a094";
const TAN = "#cdb9a3";
const LIP = "#c8625f";

const ARMOR = countershade(WHITE, WHITE_SH, { level: -0.1, soft: 0.6 });
const SUIT = countershade(TEAL, TEAL_D, { level: 0, soft: 0.5 });
const HAIR_P = grain(HAIR, HAIR_D, { size: 0.012, axis: "y", seed: 3 });
const COAT = paint((_p, _n, s) => {
  const k = s[0] - s[1] * 0.55;
  if (s[0] < 0.045) return GOLD;
  if (s[1] < -0.16 && k > 0.4 && k < 0.47) return CORAL;
  if (s[1] < -0.16 && k > 0.5 && k < 0.52) return GOLD;
  return mix(CREAM, CREAM_SH, smoothstep(0, -0.6, s[1]) * 0.7);
});
const APRON = paint((_p, _n, s) => {
  if (Math.abs(s[0]) > 0.055) return GOLD;
  return mix(TEAL, TEAL_D, smoothstep(0, -0.45, s[1]));
});

// ---- outlines ------------------------------------------------------------------------------------------------
const FRONT: OutlinePoint[] = [
  [0.03, 0],
  [0.17, 0],
  [0.25, -0.24],
  [0.3, -0.42],
  [0.26, -0.52],
  [0.14, -0.47],
  [0.05, -0.35],
  [0.03, -0.18],
];
const BACK: OutlinePoint[] = [
  [0.0, 0],
  [0.2, 0],
  [0.34, -0.3],
  [0.42, -0.55],
  [0.36, -0.72],
  [0.18, -0.62],
  [0.08, -0.7],
  [0.0, -0.55],
];
const APRON_O: OutlinePoint[] = [
  [-0.065, 0],
  [0.065, 0],
  [0.062, -0.3],
  [0.0, -0.46],
  [-0.062, -0.3],
];
const BOOT: OutlinePoint[] = [
  [-0.075, 0],
  [0.15, 0],
  [0.21, 0.015],
  [0.225, 0.045],
  [0.17, 0.075],
  [0.09, 0.095],
  [0.06, 0.15],
  [0.06, 0.24],
  [-0.06, 0.24],
  [-0.08, 0.1],
];
const CRESCENT: OutlinePoint[] = [
  [0.03, -0.02],
  [0.1, 0.02],
  [0.19, 0.1],
  [0.26, 0.22],
  [0.28, 0.36],
  [0.23, 0.5, "sharp"],
  [0.2, 0.36],
  [0.16, 0.24],
  [0.1, 0.16],
  [0.03, 0.14],
];
const CRESCENT_IN: OutlinePoint[] = CRESCENT.map(([x, y, k]) =>
  k ? ([x * 0.72, y * 0.72, k] as OutlinePoint) : ([x * 0.72, y * 0.72] as OutlinePoint),
);
const SPEAR: OutlinePoint[] = [
  [-0.032, 0],
  [0.032, 0],
  [0.04, 0.1],
  [0.0, 0.34, "sharp"],
  [-0.04, 0.1],
];
const SPEAR_IN: OutlinePoint[] = [
  [-0.016, 0.02],
  [0.016, 0.02],
  [0.02, 0.1],
  [0.0, 0.26, "sharp"],
  [-0.02, 0.1],
];
const FLANGE: OutlinePoint[] = [
  [0.0, -0.02],
  [0.04, 0.0],
  [0.07, 0.1],
  [0.0, 0.07],
];
const plusOutline = (a: number): OutlinePoint[] => {
  const w = a * 0.36;
  return [
    [-a, -w],
    [-w, -w],
    [-w, -a],
    [w, -a],
    [w, -w],
    [a, -w],
    [a, w],
    [w, w],
    [w, a],
    [-w, a],
    [-w, w],
    [-a, w],
  ];
};

// ---- textures ------------------------------------------------------------------------------------------------
const EYE = svg(
  `<svg viewBox="0 0 64 36">
  <defs>
    <clipPath id="e"><path d="M3 21 Q32 -3 61 21 Q32 34 3 21Z"/></clipPath>
    <radialGradient id="g" cx="50%" cy="62%" r="62%"><stop offset="0" stop-color="#a6dcc0"/><stop offset="1" stop-color="#2f6f62"/></radialGradient>
  </defs>
  <path d="M3 21 Q32 -3 61 21 Q32 34 3 21Z" fill="#fbf6f0"/>
  <g clip-path="url(#e)">
    <circle cx="34" cy="17" r="13" fill="url(#g)"/>
    <circle cx="34" cy="17" r="6" fill="#1b1f24"/>
    <ellipse cx="34" cy="3" rx="22" ry="9" fill="#000" opacity="0.2"/>
  </g>
  <circle cx="29" cy="12" r="3.2" fill="#ffffff"/>
  <circle cx="39" cy="22" r="1.6" fill="#ffffff"/>
  <path d="M2 21 Q32 -5 62 21" fill="none" stroke="#2a1f1c" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M4 21 Q-1 18 0 12" fill="none" stroke="#2a1f1c" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 26 Q32 36 56 26" fill="none" stroke="#b78a78" stroke-width="1.6" stroke-linecap="round"/>
</svg>`,
  { size: 512 },
);
const CROSS = svg(
  `<svg viewBox="0 0 40 40"><path d="M14 2h12v12h12v12H26v12H14V26H2V14h12z" fill="${CORAL}" stroke="#ffffff" stroke-width="2"/></svg>`,
  { size: 128 },
);
const CHEST = svg(
  `<svg viewBox="0 0 100 130">
  <path d="M6 4 L50 118 L94 4 L76 4 L50 72 L24 4Z" fill="${CORAL}"/>
  <path d="M18 4 L50 92 L82 4" fill="none" stroke="${GOLD}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M0 30 H100" stroke="${TEAL_D}" stroke-width="3"/>
  <path d="M10 62 H90" stroke="${TEAL_D}" stroke-width="3"/>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- helpers -----------------------------------------------------------------------------------------------
  const P = (geo: THREE.BufferGeometry, color: Col, bone: Bone, at: V3, opts: PartOptions = {}) =>
    b.part(geo, color, { ...opts, bone, at });
  const S = (r: number, color: Col, bone: Bone, at: V3, scale?: V3 | number, opts: PartOptions = {}) =>
    P(new THREE.SphereGeometry(r, 10, 7), color, bone, at, { ...opts, scale });
  const BOX = (w: number, h: number, d: number, color: Col, bone: Bone, at: V3, opts: PartOptions = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, bone, at, opts);
  const RING = (at: V3, dir: V3, r: number, tube: number, color: string, bone: Bone, lit = 0) => {
    const part = b.part(new THREE.TorusGeometry(r, tube, 5, 14), color, { at, dir, axis: "z", bone });
    return lit ? glow(part, lit) : part;
  };
  const studs = (pts: Array<[number, number, number]>, r: number, color: string, bone: Bone) =>
    b.part(
      mergeGeometries(pts.map((q) => new THREE.SphereGeometry(r, 6, 4).translate(q[0], q[1], q[2])))!,
      color,
      { bone, at: [0, 0, 0] },
    );
  const arcPts = (cx: number, cy: number, cz: number, r: number, n: number, from = 0, to = Math.PI * 2) =>
    Array.from({ length: n }, (_, i): [number, number, number] => {
      const a = from + ((to - from) * i) / Math.max(n - 1, 1);
      return [cx + Math.sin(a) * r, cy, cz + Math.cos(a) * r];
    });

  // ---- skeleton ----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.93, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.93, 0],
      [0, 1.08, 0.01],
      [0, 1.24, 0.015],
      [0, 1.38, 0.005],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chestJ = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.38, 0.005],
      [0, 1.455, 0.018],
      [0, 1.53, 0.03],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.53, 0.03], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.6, 0.03], aim: [0, 1.58, 0.12], role: "jaw" });

  const ARM = {
    L: [V(0.19, 1.34, 0), V(0.37, 1.12, 0.04), V(0.48, 0.9, 0.13)],
    R: [V(-0.19, 1.34, 0), V(-0.34, 1.1, 0.06), V(-0.4, 0.99, 0.26)],
  };
  const armL = b.chain("armL", polyline(ARM.L), {
    parent: chestJ,
    names: ["shoulderL", "elbowL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", polyline(ARM.R), {
    parent: chestJ,
    names: ["shoulderR", "elbowR", "handR"],
    role: "arm",
  });

  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.09, 0.92, 0],
        [s * 0.095, 0.5, 0.03],
        [s * 0.095, 0.115, -0.005],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg", contact: [s * 0.095, 0, 0.05] },
    );
    return { s, leg, hipJ: leg.joints[0], kneeJ: leg.joints[1], ankleJ: leg.joints[2] };
  });

  // ---- torso -------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.93, 0], w: 0.27, h: 0.17 },
      { at: [0, 1.08, 0.01], w: 0.23, h: 0.16 },
      { at: [0, 1.24, 0.015], w: 0.29, h: 0.19 },
      { at: [0, 1.37, 0.005], w: 0.33, h: 0.18 },
    ],
    { bone: spine, color: SUIT },
  );
  const torsoSkin = b.surface(torso);
  b.decal(torsoSkin, CHEST, { at: [0, 1.19, 0.11], dir: [0, 0, 1], size: [0.2, 0.24] });
  b.part(new THREE.SphereGeometry(1, 10, 7), GRAPH, { bone: hips, at: [0, 0.92, 0], scale: [0.14, 0.1, 0.11] });

  // belt
  const beltLoop = torsoSkin.loop([0, 1.03, 0], { lift: 0.012 });
  b.sweep(beltLoop, 0.016, { color: GRAPH_L, sides: 6 });
  P(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 12), GOLD, hips, [0, 1.03, 0.108], { dir: [0, 0, 1] });
  P(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 10), CYAN, hips, [0, 1.03, 0.112], { dir: [0, 0, 1] });
  glow(
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 10), CYAN, { bone: hips, at: [0, 1.03, 0.114], dir: [0, 0, 1] }),
    1.4,
  );
  studs(
    [-0.12, -0.085, 0.085, 0.12].map((x): [number, number, number] => [x, 1.03, 0.085 - Math.abs(x) * 0.25]),
    0.007,
    GOLD,
    hips,
  );

  // chest armour
  for (const s of [1, -1]) {
    S(0.07, ARMOR, chestJ, [s * 0.065, 1.3, 0.07], [1.15, 0.85, 0.85]);
    RING([s * 0.065, 1.3, 0.118], [0, 0.1, 1], 0.036, 0.005, GOLD, chestJ);
  }
  RING([0, 1.255, 0.114], [0, 0, 1], 0.02, 0.005, GOLD, chestJ);
  glow(
    b.part(new THREE.CircleGeometry(0.015, 8), CYAN, { bone: chestJ, at: [0, 1.255, 0.117], dir: [0, 0, 1], axis: "z" }),
    1.6,
  );
  // collar
  const collar = b.lathe(
    [
      [0.044, 0],
      [0.064, 0],
      [0.07, 0.04],
      [0.058, 0.075],
      [0.046, 0.06],
    ],
    { at: [0, 1.395, 0.005], bone: neck, color: TEAL, segments: 10 },
  );
  RING([0, 1.398, 0.006], [0, 1, 0], 0.066, 0.006, GOLD, neck.joints[0]);
  void collar;
  // neck
  b.sweep(neck, [0.036, 0.032], { color: SKIN, sides: 8 });
  glow(b.rod([0.025, 1.43, 0.045], [0.025, 1.47, 0.05], 0.004, CYAN, { bone: neck.joints[0] }), 1.2);

  // back pack
  BOX(0.2, 0.22, 0.09, ARMOR, chestJ, [0, 1.22, -0.14]);
  BOX(0.205, 0.03, 0.095, TEAL_D, chestJ, [0, 1.13, -0.14]);
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    bone: chestJ,
    at: [0, 1.235, -0.1862],
    dir: [0, 0, -1],
    axis: "z",
    texture: CROSS,
  });
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.022, 0.026, 0.1, 8), GRAPH_L, chestJ, [s * 0.075, 1.12, -0.16], { dir: [0, -1, -0.3] });
    glow(P(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 8), CYAN, chestJ, [s * 0.078, 1.07, -0.175], { dir: [0, -1, -0.3] }), 1.4);
    glow(BOX(0.004, 0.12, 0.004, CYAN, chestJ, [s * 0.098, 1.22, -0.186]), 1);
  }

  // ---- hips: coat, apron, pouches ---------------------------------------------------------------------------
  const lining = (o: OutlinePoint[]): OutlinePoint[] =>
    o.map(([x, y]) => [x * 1.05 + 0.005, y * 1.08] as OutlinePoint);
  for (const s of [1, -1]) {
    b.extrude(FRONT, {
      at: [0, 1.0, 0.118],
      x: [s, 0, 0],
      y: [-s * 0.2, 1, -0.12],
      thickness: 0.016,
      bevel: 0.004,
      color: COAT,
      bone: hips,
      name: `coatFront${s > 0 ? "L" : "R"}`,
    });
    b.extrude(lining(FRONT), {
      at: [0, 1.0, 0.1],
      x: [s, 0, 0],
      y: [-s * 0.2, 1, -0.12],
      thickness: 0.012,
      color: CORAL,
      bone: hips,
    });
    b.extrude(BACK, {
      at: [0, 1.0, -0.118],
      x: [s, 0, 0],
      y: [-s * 0.28, 1, 0.2],
      thickness: 0.016,
      bevel: 0.004,
      color: COAT,
      bone: hips,
      name: `coatBack${s > 0 ? "L" : "R"}`,
    });
    b.extrude(lining(BACK), {
      at: [0, 1.0, -0.1],
      x: [s, 0, 0],
      y: [-s * 0.28, 1, 0.2],
      thickness: 0.012,
      color: CORAL,
      bone: hips,
    });
    // hip armour plate with gold ring
    S(0.07, ARMOR, hips, [s * 0.145, 0.97, 0.01], [0.7, 1.0, 1.1]);
    RING([s * 0.175, 0.97, 0.01], [s, 0, 0], 0.03, 0.005, GOLD, hips);
  }
  b.extrude(APRON_O, {
    at: [0, 1.0, 0.134],
    x: [1, 0, 0],
    y: [0, 1, -0.08],
    thickness: 0.012,
    bevel: 0.003,
    color: APRON,
    bone: hips,
    name: "apron",
  });
  studs(
    [-0.04, 0, 0.04].map((x): [number, number, number] => [x, 0.94, 0.14]),
    0.007,
    GOLD,
    hips,
  );
  BOX(0.03, 0.03, 0.006, CORAL, hips, [-0.025, 0.7, 0.152]);
  BOX(0.03, 0.03, 0.006, CORAL, hips, [0.025, 0.66, 0.152]);
  // medical vial at left hip
  const vialAt: V3 = [0.17, 1.0, 0.05];
  glow(P(new THREE.CylinderGeometry(0.026, 0.026, 0.1, 10), "#7be8dc", hips, vialAt, { rotation: [0, 0, -8] }), 0.9);
  P(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 10), GOLD, hips, [0.175, 1.058, 0.05]);
  P(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 10), GOLD, hips, [0.165, 0.944, 0.05]);
  b.sweep(
    catmull([
      [0.14, 1.04, 0.04],
      [0.17, 1.0, 0.085],
      [0.2, 1.0, 0.05],
    ]),
    0.006,
    { color: GRAPH, bone: hips },
  );
  // pouch at right hip
  BOX(0.07, 0.07, 0.05, ARMOR, hips, [-0.17, 0.98, 0.04]);
  BOX(0.074, 0.02, 0.054, GRAPH_L, hips, [-0.17, 1.005, 0.04]);
  studs([[-0.17, 0.965, 0.067]], 0.008, GOLD, hips);

  // ---- legs --------------------------------------------------------------------------------------------------
  for (const { s, leg, hipJ, kneeJ, ankleJ } of legs) {
    b.sweep(leg, [0.08, 0.07, 0.056, 0.06, 0.047, 0.04], { color: GRAPH });
    // thigh armour
    b.capsule([s * 0.097, 0.84, 0.035], [s * 0.097, 0.57, 0.04], [0.088, 0.07], { color: ARMOR, bone: hipJ });
    RING([s * 0.172, 0.7, 0.037], [s, 0.05, 0], 0.03, 0.007, CYAN, hipJ, 1.4);
    RING([s * 0.172, 0.7, 0.037], [s, 0.05, 0], 0.043, 0.006, GOLD, hipJ);
    // knee guard
    S(0.05, ARMOR, kneeJ, [s * 0.097, 0.505, 0.07], [1.0, 1.15, 0.85]);
    RING([s * 0.097, 0.505, 0.105], [0, 0, 1], 0.03, 0.006, GOLD, kneeJ);
    glow(
      b.part(new THREE.CircleGeometry(0.02, 8), CYAN, { bone: kneeJ, at: [s * 0.097, 0.505, 0.108], dir: [0, 0, 1], axis: "z" }),
      1.4,
    );
    // shin
    b.capsule([s * 0.097, 0.45, 0.04], [s * 0.095, 0.2, 0.0], [0.066, 0.052], { color: ARMOR, bone: kneeJ });
    BOX(0.03, 0.14, 0.008, TEAL, kneeJ, [s * 0.097, 0.33, 0.1], { rotation: [-8, 0, 0] });
    glow(BOX(0.006, 0.12, 0.004, CYAN, kneeJ, [s * 0.097, 0.33, 0.106], { rotation: [-8, 0, 0] }), 1.2);
    RING([s * 0.096, 0.215, 0.0], [0, 1, 0], 0.056, 0.007, GOLD, kneeJ);
    // boot
    b.extrude(BOOT, {
      at: [s * 0.095, 0, 0],
      x: [0, 0, 1],
      thickness: 0.1,
      bevel: 0.01,
      color: ARMOR,
      bone: ankleJ,
      name: `boot${s > 0 ? "L" : "R"}`,
    });
    BOX(0.106, 0.02, 0.3, TEAL_D, ankleJ, [s * 0.095, 0.01, 0.07]);
    S(0.05, GOLD, ankleJ, [s * 0.095, 0.03, 0.2], [1.0, 0.6, 1.0]);
    RING([s * 0.095, 0.235, 0.0], [0, 1, 0], 0.058, 0.007, GOLD, ankleJ);
    RING([s * 0.095, 0.125, 0.045], [0, 0.5, 1], 0.04, 0.006, GOLD, ankleJ);
    glow(BOX(0.01, 0.1, 0.006, CYAN, ankleJ, [s * 0.095, 0.175, 0.064]), 1.2);
    BOX(0.1, 0.05, 0.03, GOLD_D, ankleJ, [s * 0.095, 0.05, -0.08]);
    studs(
      [
        [s * 0.095 + 0.04, 0.2, 0.04],
        [s * 0.095 - 0.04, 0.2, 0.04],
        [s * 0.095 + 0.04, 0.2, -0.04],
        [s * 0.095 - 0.04, 0.2, -0.04],
      ],
      0.006,
      GOLD,
      ankleJ,
    );
  }

  // ---- head --------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, {
    bone: head,
    at: [0, 1.63, 0.035],
    scale: [0.082, 0.097, 0.093],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    bone: jaw,
    at: [0, 1.572, 0.07],
    scale: [0.058, 0.045, 0.055],
  });
  const eyeSkin = b.surface(skull);
  for (const s of [1, -1])
    b.decal(eyeSkin, EYE, {
      at: [s * 0.035, 1.642, 0.12],
      dir: [0, 0, 1],
      size: [0.046, 0.026],
      mirror: s > 0,
    });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.018, 1.674, 0.119],
        [s * 0.04, 1.679, 0.11],
        [s * 0.06, 1.676, 0.09],
      ]),
      [0.005, 0.003],
      { color: HAIR_D, bone: head, sides: 5 },
    );
    S(0.019, SKIN, head, [s * 0.085, 1.63, 0.02], [0.5, 1.0, 0.8]);
    // blush
    S(0.016, "#f2a592", head, [s * 0.05, 1.605, 0.1], [1.0, 0.6, 0.35]);
  }
  P(new THREE.ConeGeometry(0.014, 0.034, 5), SKIN, head, [0, 1.612, 0.125], { dir: [0, -0.2, 1] });
  S(0.011, SKIN_SH, head, [0, 1.6, 0.142]);
  b.capsule([-0.016, 1.578, 0.114], [0.016, 1.578, 0.114], 0.006, { color: LIP, bone: head });
  b.capsule([-0.014, 1.563, 0.117], [0.014, 1.563, 0.117], 0.0065, { color: LIP, bone: jaw });
  // cyber details on the face and ears
  RING([0.09, 1.628, 0.02], [1, 0, 0], 0.016, 0.004, GOLD, head);
  glow(BOX(0.004, 0.012, 0.04, CYAN, head, [0.084, 1.66, 0.055]), 1.3);
  BOX(0.006, 0.03, 0.05, ARMOR, head, [0.08, 1.658, 0.052], { rotation: [0, 0, -4] });
  glow(BOX(0.004, 0.012, 0.04, CYAN, head, [0.085, 1.66, 0.055]), 1.3);

  // hair
  b.part(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), HAIR_P, {
    bone: head,
    at: [0, 1.64, 0.02],
    scale: [0.093, 0.106, 0.104],
    rotation: [-32, 0, 0],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), HAIR_P, {
    bone: head,
    at: [0, 1.66, -0.07],
    scale: [0.085, 0.085, 0.07],
  });
  const strand = (pts: number[][], r: [number, number], color: Col) =>
    b.sweep(catmull(pts), r, { color, bone: head, sides: 6, caps: { start: "round", end: "point" } });
  for (const s of [1, -1]) {
    strand(
      [
        [s * 0.02, 1.725, 0.085],
        [s * 0.07, 1.69, 0.085],
        [s * 0.093, 1.62, 0.065],
        [s * 0.088, 1.55, 0.05],
      ],
      [0.02, 0.004],
      s > 0 ? HAIR : HAIR_D,
    );
    strand(
      [
        [s * 0.04, 1.73, 0.0],
        [s * 0.09, 1.67, -0.03],
        [s * 0.09, 1.6, -0.06],
        [s * 0.07, 1.54, -0.07],
      ],
      [0.022, 0.005],
      HAIR,
    );
  }
  strand(
    [
      [0.04, 1.727, 0.075],
      [-0.01, 1.712, 0.105],
      [-0.06, 1.69, 0.098],
      [-0.09, 1.64, 0.06],
    ],
    [0.022, 0.003],
    HAIR,
  );
  strand(
    [
      [-0.02, 1.73, 0.08],
      [0.035, 1.715, 0.105],
      [0.075, 1.69, 0.092],
      [0.092, 1.66, 0.06],
    ],
    [0.018, 0.003],
    HAIR_D,
  );
  // ponytail
  for (const [dx, tipZ, tipY, c] of [
    [0, -0.28, 1.58, HAIR],
    [0.025, -0.25, 1.62, HAIR_D],
    [-0.025, -0.26, 1.64, HAIR],
  ] as const)
    b.sweep(bezier([dx * 0.4, 1.72, -0.08], [dx * 1.5, 1.82, -0.17], [dx * 3, 1.78, tipZ - 0.02], [dx * 3.5, tipY, tipZ]), [0.04, 0.008], {
      color: c,
      bone: head,
      sides: 6,
      caps: { start: "round", end: "point" },
    });
  // headband and gem
  b.sweep(
    catmull([
      [-0.094, 1.66, 0.03],
      [-0.07, 1.724, 0.05],
      [0, 1.752, 0.07],
      [0.07, 1.724, 0.05],
      [0.094, 1.66, 0.03],
    ]),
    0.0075,
    { color: GOLD, bone: head, sides: 6 },
  );
  glow(S(0.012, CYAN, head, [0, 1.752, 0.078]), 1.5);

  // ---- arms --------------------------------------------------------------------------------------------------
  const [shL, elL, wrL] = ARM.L;
  const upL = armL.joints[0];
  const foreL = armL.joints[1];
  const handL = armL.joints[2];
  b.sweep(armL, [0.052, 0.046, 0.038], { color: GRAPH, bands: [[0.54, GRAPH], [1, WHITE]], sides: 8 });
  S(0.05, GRAPH_L, foreL, elL);
  RING(elL, [0.5, -0.5, 0.4], 0.05, 0.006, CYAN, foreL, 1.4);
  b.capsule(lerp(elL, wrL, 0.15), lerp(elL, wrL, 0.9), [0.054, 0.04], { color: ARMOR, bone: foreL });
  RING(lerp(elL, wrL, 0.3), wrL.clone().sub(elL), 0.0535, 0.005, CYAN, foreL, 1.3);
  RING(lerp(elL, wrL, 0.65), wrL.clone().sub(elL), 0.047, 0.005, CYAN, foreL, 1.3);
  RING(lerp(elL, wrL, 0.92), wrL.clone().sub(elL), 0.043, 0.007, GOLD, foreL);
  b.capsule(lerp(shL, elL, 0.5), lerp(shL, elL, 0.88), [0.057, 0.05], { color: TEAL, bone: upL });
  RING(lerp(shL, elL, 0.5), elL.clone().sub(shL), 0.058, 0.006, GOLD, upL);
  studs(
    arcPts(0.215, 1.337, 0.0, 0.078, 8).map((q): [number, number, number] => q),
    0.007,
    GOLD,
    upL,
  );
  // pauldrons
  const padL = S(0.085, ARMOR, upL, [0.215, 1.365, 0.0], [1.0, 0.75, 1.05]);
  RING([0.215, 1.335, 0.0], [0, 1, 0], 0.082, 0.007, GOLD, upL);
  b.decal(padL, CROSS, { at: [0.298, 1.385, 0.0], dir: [1, 0.3, 0], size: [0.075, 0.075] });
  S(0.085, ARMOR, armR.joints[0], [-0.215, 1.365, 0.0], [1.0, 0.75, 1.05]);
  RING([-0.215, 1.335, 0.0], [0, 1, 0], 0.082, 0.007, GOLD, armR.joints[0]);
  BOX(0.02, 0.012, 0.1, CORAL, armR.joints[0], [-0.26, 1.405, 0.0], { rotation: [0, 0, 18] });
  studs(
    arcPts(-0.215, 1.337, 0.0, 0.078, 8).map((q): [number, number, number] => q),
    0.007,
    GOLD,
    armR.joints[0],
  );

  // left cyborg hand (open, palm forward)
  const dH = V(0.06, -0.14, 0.1).normalize();
  const pn = V(0.2, 0.45, 0.85);
  pn.addScaledVector(dH, -pn.dot(dH)).normalize();
  const sd = new THREE.Vector3().crossVectors(dH, pn).normalize();
  if (sd.x < 0) sd.negate();
  const palmC = wrL.clone().addScaledVector(dH, 0.04);
  b.part(new THREE.BoxGeometry(0.078, 0.078, 0.022), ARMOR, { bone: handL, at: palmC, dir: dH, up: pn });
  RING(palmC.clone().addScaledVector(pn, 0.012), pn, 0.018, 0.004, GOLD, handL);
  glow(
    b.part(new THREE.CircleGeometry(0.012, 8), CYAN, { bone: handL, at: palmC.clone().addScaledVector(pn, 0.0125), dir: pn, axis: "z" }),
    1.6,
  );
  RING(wrL.clone().addScaledVector(dH, 0.004), dH, 0.04, 0.007, GOLD, handL);
  b.part(new THREE.BoxGeometry(0.07, 0.03, 0.026), GRAPH, { bone: handL, at: wrL.clone().addScaledVector(dH, 0.008), dir: dH, up: pn });
  const palmBase = wrL.clone().addScaledVector(dH, 0.072);
  const digit = (name: string, start: THREE.Vector3, dirOf: (k: number) => THREE.Vector3, lens: number[], r: number) => {
    const pts = [start.clone()];
    let cur = start.clone();
    lens.forEach((len, k) => {
      cur = cur.clone().addScaledVector(dirOf(k).normalize(), len);
      pts.push(cur);
    });
    const ch = b.chain(name, polyline(pts), {
      parent: handL,
      names: lens.map((_, k) => `${name}${k + 1}`),
      role: "digit",
    });
    b.sweep(ch, [r, r * 0.7], { color: WHITE, sides: 6, caps: { start: "round", end: "round" } });
    S(r * 0.82, GRAPH, ch.joints[1], pts[1]);
    if (lens.length > 2) S(r * 0.75, GRAPH, ch.joints[2], pts[2]);
    glow(S(r * 0.5, CYAN, ch.joints[lens.length - 1], pts[lens.length]), 1.3);
    return ch;
  };
  (
    [
      ["indexL", 0.025, [0.032, 0.024, 0.02]],
      ["middleL", 0.008, [0.035, 0.027, 0.022]],
      ["ringL", -0.009, [0.032, 0.025, 0.02]],
      ["pinkyL", -0.026, [0.025, 0.019, 0.016]],
    ] as const
  ).forEach(([nm, off, lens]) =>
    digit(
      nm,
      palmBase.clone().addScaledVector(sd, off),
      (k) => dH.clone().addScaledVector(sd, off * 2.5).addScaledVector(pn, 0.22 * (k + 1)),
      [...lens],
      0.0095,
    ),
  );
  digit(
    "thumbL",
    wrL.clone().addScaledVector(dH, 0.025).addScaledVector(sd, 0.036),
    (k) => sd.clone().multiplyScalar(0.9).addScaledVector(dH, 0.5 - 0.15 * k).addScaledVector(pn, 0.3),
    [0.03, 0.026, 0.022],
    0.011,
  );

  // right arm (holds staff): sleeve, wrap, glove
  const [shR, elR, wrR] = ARM.R;
  const upR = armR.joints[0];
  const foreR = armR.joints[1];
  const handR = armR.joints[2];
  b.sweep(armR, [0.052, 0.046, 0.038], {
    color: GRAPH,
    bands: [
      [0.5, GRAPH],
      [0.86, TAN],
      [1, GRAPH],
    ],
    sides: 8,
  });
  S(0.048, GRAPH_L, foreR, elR);
  b.capsule(lerp(shR, elR, 0.55), lerp(shR, elR, 0.9), [0.056, 0.05], { color: CREAM, bone: upR });
  RING(lerp(shR, elR, 0.55), elR.clone().sub(shR), 0.057, 0.006, GOLD, upR);
  b.capsule(lerp(elR, wrR, 0.2), lerp(elR, wrR, 0.7), [0.05, 0.043], { color: ARMOR, bone: foreR });
  RING(lerp(elR, wrR, 0.45), wrR.clone().sub(elR), 0.048, 0.005, CYAN, foreR, 1.2);
  RING(lerp(elR, wrR, 0.88), wrR.clone().sub(elR), 0.04, 0.008, GOLD, foreR);
  b.part(new THREE.BoxGeometry(0.032, 0.03, 0.018), CORAL, {
    bone: foreR,
    at: lerp(elR, wrR, 0.72).add(V(0, 0.04, 0)),
    dir: wrR.clone().sub(elR),
  });

  // staff
  const SX = -0.42;
  const SZ = 0.31;
  const staffJ = b.joint("staff", { parent: armR, at: [SX, 1.0, SZ], dir: [0, 1, 0], role: "hinge" });
  const sp = (y: number): V3 => [SX, y, SZ];
  b.rod(sp(0.12), sp(1.9), 0.017, GRAPH_L, { bone: staffJ, sides: 8 });
  b.spike(sp(0.16), [0, -1, 0], 0.16, 0.026, GOLD, { bone: staffJ, sides: 8 });
  glow(P(new THREE.OctahedronGeometry(0.03, 0), CYAN, staffJ, sp(0.235), { scale: [1, 1.5, 1] }), 1.5);
  for (const dir of [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 0, 1],
    [0, 0, -1],
  ])
    b.extrude(FLANGE, { at: sp(0.2), x: dir, thickness: 0.01, bevel: 0.002, color: GOLD, bone: staffJ });
  const sleeve = (y0: number, y1: number, r: number, color: Col) => {
    const h = y1 - y0;
    return b.lathe(
      [
        [0, 0],
        [r * 0.9, 0],
        [r, 0.015],
        [r, h - 0.015],
        [r * 0.9, h],
        [0, h],
      ],
      { at: sp(y0), bone: staffJ, color, segments: 8 },
    );
  };
  sleeve(0.3, 0.56, 0.029, ARMOR);
  sleeve(0.28, 0.3, 0.032, GOLD);
  sleeve(0.56, 0.58, 0.032, GOLD);
  glow(BOX(0.008, 0.16, 0.006, CYAN, staffJ, [SX, 0.43, SZ + 0.028]), 1.3);
  sleeve(0.72, 0.76, 0.027, GOLD);
  sleeve(1.14, 1.46, 0.031, ARMOR);
  sleeve(1.12, 1.14, 0.034, GOLD);
  sleeve(1.46, 1.48, 0.034, GOLD);
  glow(BOX(0.008, 0.2, 0.006, CYAN, staffJ, [SX, 1.3, SZ + 0.03]), 1.3);
  sleeve(1.58, 1.62, 0.03, GOLD);
  sleeve(1.64, 1.86, 0.035, ARMOR);
  glow(BOX(0.008, 0.12, 0.006, CYAN, staffJ, [SX, 1.75, SZ + 0.035]), 1.3);
  for (const s of [1, -1])
    b.extrude(FLANGE, { at: sp(1.52), x: [s, 0, 0], thickness: 0.012, color: GOLD, bone: staffJ });
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.045, 0.02],
      [0.05, 0.06],
      [0.03, 0.075],
      [0, 0.075],
    ],
    { at: sp(1.86), bone: staffJ, color: GOLD, segments: 8 },
  );
  // staff head
  glow(S(0.045, CYAN, staffJ, sp(1.995)), 1.6);
  RING(sp(1.995), [0, 0, 1], 0.062, 0.005, GOLD, staffJ);
  RING(sp(1.995), [1, 0, 0], 0.062, 0.005, GOLD, staffJ);
  for (const s of [1, -1]) {
    b.extrude(CRESCENT, { at: sp(1.95), x: [s, 0, 0], thickness: 0.014, bevel: 0.004, color: ARMOR, bone: staffJ });
    b.extrude(CRESCENT_IN, {
      at: [SX, 1.95, SZ + 0.009],
      x: [s, 0, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: TEAL,
      bone: staffJ,
    });
    b.spike([SX + s * 0.23, 2.42 - 0.0, SZ], [0, 1, 0], 0.0, 0.0, GOLD, { bone: staffJ });
  }
  b.extrude(SPEAR, { at: sp(1.97), x: [1, 0, 0], thickness: 0.016, bevel: 0.004, color: ARMOR, bone: staffJ });
  b.extrude(SPEAR_IN, {
    at: [SX, 1.97, SZ + 0.009],
    x: [1, 0, 0],
    thickness: 0.02,
    color: TEAL,
    bone: staffJ,
  });
  // healing ribbons
  for (const turns of [1.3, -1.3]) {
    glow(
      b.sweep(
        spiral(sp(1.9), [SX + (turns > 0 ? 0.2 : -0.2), 1.95, SZ], [0, 1, 0], { turns, r1: 0.08, pitch: 0.1 }),
        [0.006, 0.002],
        { color: CYAN, bone: staffJ, sides: 5 },
      ),
      1.3,
    );
  }
  // floating plus signs
  (
    [
      [-0.22, 2.12, 0.05, 0.03],
      [0.2, 2.18, -0.02, 0.025],
      [0.08, 2.32, 0.04, 0.02],
      [-0.12, 1.84, 0.12, 0.018],
      [0.22, 1.9, 0.1, 0.022],
    ] as const
  ).forEach(([dx, y, dz, a]) =>
    glow(
      b.extrude(plusOutline(a), { at: [SX + dx, y, SZ + dz], x: [1, 0, 0], thickness: 0.008, color: CYAN, bone: staffJ }),
      1.5,
    ),
  );

  // right fist gripping the staff
  BOX(0.085, 0.1, 0.05, GRAPH, handR, [SX, 0.99, SZ - 0.025]);
  for (const y of [0.95, 0.972, 0.994, 1.016])
    P(new THREE.TorusGeometry(0.03, 0.0115, 5, 12), SKIN, handR, [SX, y, SZ], { rotation: [90, 0, 0] });
  b.capsule([SX + 0.045, 0.985, SZ - 0.01], [SX + 0.02, 1.06, SZ + 0.035], 0.012, { color: SKIN, bone: handR });
  BOX(0.07, 0.014, 0.03, GOLD, handR, [SX, 1.045, SZ - 0.025]);

  return b.root;
}
