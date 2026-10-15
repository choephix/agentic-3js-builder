import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { DEG, lerp } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { gradient, paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A tall, graceful elven ranger in a green tunic, leather vest and teal cloak, with a gold-trimmed recurve bow, a quiver of fletched arrows, a circlet and a long silver ponytail. Cel-shaded anime look with big shiny eyes, gold filigree and emerald glow gems.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// Palette --------------------------------------------------------------------------------------------------------
const GOLD = "#f0bf4a";
const GOLD_DK = "#9a6a1e";
const GEM = "#5dffc8";
const DARK = "#2a1a14";
const WOOD = "#8a5a32";
const STRING = "#efe6cf";
const FEATHER_A = "#2fb89a";
const FEATHER_B = "#f4efe0";

const SKINC = cel("#ffe1cc", "#f0b0a6");
const HAIRP = cel(stripes("#f7f1de", "#dcd2b4", { size: 0.02, axis: [1, 0, 0], width: 0.4, wobble: 0.7, seed: 3 }));
const HAIR_TAIL = cel(gradient("#f7f1de", "#5adbb8", [0, 1.72, 0], [0, 1.52, 0]));
const TUNIC = cel("#2d7a56");
const SHIRT = cel("#f0f2dc");
const VEST = cel("#7b4b2a");
const LEATHER = cel("#6a3f22");
const LEATHER_LT = cel("#9a6236");
const BOOT = cel("#74482a");
const PANTS = cel("#b99a68");
const TEALP = cel("#2a8f86");
const SOLE = "#3a2418";

// Textures -------------------------------------------------------------------------------------------------------
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64">
  <path d="M32 4 C50 18 50 44 32 60 C14 44 14 18 32 4Z" fill="#f0bf4a" stroke="#8a5a1c" stroke-width="3"/>
  <path d="M32 12 L32 54" stroke="#8a5a1c" stroke-width="3" fill="none"/>
  <path d="M32 24 L42 16 M32 34 L44 26 M32 44 L40 38 M32 24 L22 16 M32 34 L20 26 M32 44 L24 38" stroke="#8a5a1c" stroke-width="3" fill="none"/>
  </svg>`,
  { size: 128 },
);

const VINE = svg(
  `<svg viewBox="0 0 40 80">
  <path d="M20 2 C8 20 32 34 20 50 C10 62 26 70 20 78" stroke="#f0bf4a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M20 14 C6 8 2 18 5 24 C14 26 19 21 20 14Z" fill="#f0bf4a" stroke="#8a5a1c" stroke-width="1.5"/>
  <path d="M24 28 C36 22 40 32 36 38 C28 40 24 35 24 28Z" fill="#f0bf4a" stroke="#8a5a1c" stroke-width="1.5"/>
  <path d="M18 44 C6 40 2 50 6 56 C14 58 18 52 18 44Z" fill="#f0bf4a" stroke="#8a5a1c" stroke-width="1.5"/>
  <path d="M22 60 C32 56 38 64 34 70 C28 72 22 68 22 60Z" fill="#f0bf4a" stroke="#8a5a1c" stroke-width="1.5"/>
  </svg>`,
  { size: 256 },
);

const EYE = animeEye({ iris: "#2fd9a6", irisLight: "#c9ffe6" });

export default function build() {
  const b = createBuilder({ name: "elvenArcher" });

  // Skeleton -----------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.97, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.99, 0],
      [0, 1.14, 0],
      [0, 1.3, 0.005],
      [0, 1.47, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.47, 0],
      [0, 1.57, 0.012],
      [0, 1.68, 0.03],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.68, 0.03], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.76, 0.035], aim: [0, 1.745, 0.13], role: "jaw" });

  // Torso --------------------------------------------------------------------------------------------------------
  const torsoPaint = paint((p, n) => {
    if (p.y < 1.12) return TUNIC;
    const front = n.z > 0.15;
    if (front && p.y > 1.2) {
      const half = 0.01 + (p.y - 1.22) * 0.28;
      const d = Math.abs(p.x);
      if (Math.abs(d - half) < 0.007) return GOLD;
      if (d < half) return SHIRT;
    }
    if (Math.abs(p.y - 1.12) < 0.006) return GOLD;
    return VEST;
  });
  const torso = b.loft(
    [
      { at: [0, 0.95, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.15, 0], w: 0.25, h: 0.18 },
      { at: [0, 1.33, 0.005], w: 0.31, h: 0.22 },
      { at: [0, 1.46, 0], w: 0.3, h: 0.18 },
    ],
    { bone: [hips, spine], color: torsoPaint },
  );
  const bodySkin = b.surface(torso);

  // Belt, buckle, straps
  b.sweep(bodySkin.loop([0, 1.08, 0], { lift: 0.008 }), 0.016, { color: LEATHER });
  b.part(new THREE.BoxGeometry(0.055, 0.05, 0.014), GOLD, { bone: hips, at: [0, 1.08, 0.117] });
  glow(b.part(new THREE.OctahedronGeometry(0.012), GEM, { bone: hips, at: [0, 1.08, 0.127] }));
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: hips, at: [s * 0.1, 1.08, 0.1] });

  const strapLoop = catmull(
    [
      [-0.13, 1.5, 0.02],
      [-0.03, 1.34, 0.14],
      [0.14, 1.12, 0.1],
      [0.12, 1.1, -0.12],
      [-0.05, 1.32, -0.13],
      [-0.13, 1.5, -0.02],
    ],
    { closed: true },
  );
  b.sweep(bodySkin.drape(strapLoop, { lift: 0.01 }), 0.014, { color: LEATHER_LT });

  // Tunic skirt panels with gold trim and leaf emblem
  const panelOutline: OutlinePoint[] = [
    [-0.1, 0],
    [0.1, 0],
    [0.12, -0.3],
    [0, -0.42, "sharp"],
    [-0.12, -0.3],
  ];
  const panelPaint = paint((_p, n, s) => {
    if (Math.abs(n.z) < 0.5) return GOLD;
    if (Math.abs(s[0]) < 0.005) return GOLD;
    if (s[1] > -0.03) return GOLD;
    return TUNIC;
  });
  for (const z of [0.105, -0.105]) {
    b.extrude(panelOutline, { at: [0, 1.07, z], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: panelPaint, bone: hips });
  }
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    bone: hips,
    at: [0, 0.9, 0.1175],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
  });

  // Hip pouch and dagger
  b.part(new THREE.BoxGeometry(0.075, 0.09, 0.055), LEATHER, { bone: hips, at: [0.175, 1.0, 0.0] });
  b.part(new THREE.BoxGeometry(0.08, 0.035, 0.06), LEATHER_LT, { bone: hips, at: [0.175, 1.045, 0.0] });
  b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: hips, at: [0.175, 1.02, 0.03] });
  b.rod([-0.19, 1.0, 0.0], [-0.235, 0.8, 0.05], [0.02, 0.012], LEATHER, {
    bone: hips,
    caps: { start: "flat", end: "point" },
  });
  b.rod([-0.19, 1.0, 0.0], [-0.236, 0.9, 0.05], 0.022, GOLD, { bone: hips, from: 0.0, to: 0.15 });
  b.rod([-0.185, 1.0, 0.0], [-0.17, 1.09, -0.02], 0.014, LEATHER_LT, { bone: hips });
  b.part(new THREE.BoxGeometry(0.07, 0.01, 0.016), GOLD, { bone: hips, at: [-0.187, 1.005, 0.0], rotation: [0, 0, 8] });
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), GEM, { bone: hips, at: [-0.168, 1.1, -0.022] }));

  // Cloak --------------------------------------------------------------------------------------------------------
  const cloakOutline: OutlinePoint[] = [
    [-0.17, 0],
    [-0.06, 0.02],
    [0.06, 0.02],
    [0.17, 0],
    [0.23, -0.3],
    [0.2, -0.55],
    [0.12, -0.62],
    [0.07, -0.78, "sharp"],
    [0, -0.64],
    [-0.07, -0.8, "sharp"],
    [-0.12, -0.62],
    [-0.21, -0.56],
    [-0.24, -0.3],
  ];
  const cloakPaint = paint((_p, n, s) => {
    if (Math.abs(n.z) < 0.5) return GOLD;
    if (s[1] < -0.5 + 0.04 * zigzag(s[0] / 0.06)) return cel("#1f6a68");
    if (Math.sin(s[0] * 60) > 0.85) return cel("#1f6a68");
    return cel(gradient("#2fa095", "#1f6a68", [0, 1.5, 0], [0, 0.75, 0]));
  });
  b.extrude(cloakOutline, { at: [0, 1.5, -0.13], x: [1, 0, 0], thickness: 0.024, bevel: 0.004, color: cloakPaint, bone: chest });
  b.part(new THREE.PlaneGeometry(0.22, 0.44), "#ffffff", {
    bone: chest,
    at: [0, 1.15, -0.1425],
    dir: [0, 0, -1],
    axis: "z",
    texture: VINE,
  });

  // Quiver and arrows --------------------------------------------------------------------------------------------
  const qb: P3 = [0.12, 1.0, -0.205];
  const qt: P3 = [-0.1, 1.5, -0.205];
  const qd = new THREE.Vector3(qt[0] - qb[0], qt[1] - qb[1], qt[2] - qb[2]).normalize();
  b.rod(qb, qt, [0.058, 0.068], LEATHER, { bone: chest, caps: { start: "round", end: "flat" } });
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.006, 10), DARK, {
    bone: chest,
    at: [qt[0] + qd.x * 0.002, qt[1] + qd.y * 0.002, qt[2]],
    dir: qd,
  });
  for (const t of [0.25, 0.55, 0.9]) {
    const a = lerp(qb, qt, t - 0.025);
    const c = lerp(qb, qt, t + 0.025);
    b.rod(a, c, 0.06 + 0.006 * t + 0.005, GOLD, { bone: chest });
  }
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: chest, at: [0.0, 1.25, -0.145] });
  const arrowOffsets: Array<[number, number]> = [
    [-0.025, 0.02],
    [0.02, 0.025],
    [0, -0.025],
    [0.03, -0.015],
    [-0.03, -0.02],
  ];
  arrowOffsets.forEach(([ox, oz], i) => {
    const base: P3 = [qt[0] + ox, qt[1] - 0.05, qt[2] + oz];
    const tip: P3 = [base[0] + qd.x * 0.3 + ox * 1.5, base[1] + qd.y * 0.3, base[2] + qd.z * 0.3 + oz * 1.5];
    b.rod(base, tip, 0.005, WOOD, { bone: chest });
    const f0 = lerp(base, tip, 0.76);
    b.rod(f0, tip, 0.011, i % 2 ? FEATHER_A : FEATHER_B, { bone: chest, caps: { start: "flat", end: "point" } });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), GOLD, { bone: chest, at: tip });
  });

  // Neck, collar -------------------------------------------------------------------------------------------------
  b.sweep(neck, [0.04, 0.036, 0.034], { color: SKINC });
  const collarPts: P3[] = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    collarPts.push([0.058 * Math.cos(a), 1.545, 0.012 + 0.058 * Math.sin(a)]);
  }
  b.sweep(catmull(collarPts, { closed: true }), 0.02, { color: TEALP, bone: neck.joints[0] });
  glow(b.part(new THREE.OctahedronGeometry(0.014), GEM, { bone: chest, at: [0, 1.51, 0.088] }));
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: chest, at: [0, 1.51, 0.082] });
  for (const [x, len] of [
    [0.03, 0.28],
    [-0.025, 0.22],
  ] as Array<[number, number]>) {
    b.extrude(
      [
        [-0.02, 0],
        [0.02, 0],
        [0.026, -len + 0.04],
        [0, -len, "sharp"],
        [-0.026, -len + 0.04],
      ],
      { at: [x, 1.5, 0.098], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: TEALP, bone: chest },
    );
  }

  // Head ---------------------------------------------------------------------------------------------------------
  const SK: P3 = [0, 1.805, 0.02];
  const SR: P3 = [0.088, 0.092, 0.09];
  const hp = (az: number, el: number, k = 1): P3 => {
    const a = az * DEG;
    const e = el * DEG;
    return [
      SR[0] * k * Math.cos(e) * Math.sin(a),
      SK[1] + SR[1] * k * Math.sin(e),
      SK[2] + SR[2] * k * Math.cos(e) * Math.cos(a),
    ];
  };
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKINC, { bone: head, at: SK, scale: SR });
  const jawFace = b.part(new THREE.SphereGeometry(1, 12, 8), SKINC, {
    bone: jaw,
    at: [0, 1.752, 0.035],
    scale: [0.07, 0.058, 0.072],
  });
  const chin = b.part(new THREE.ConeGeometry(0.044, 0.07, 8), SKINC, {
    bone: jaw,
    at: [0, 1.713, 0.055],
    dir: [0, -1, 0.45],
  });
  const skin = b.surface(skull);
  const faceSkin = b.surface([skull, jawFace, chin]);
  for (const s of [1, -1]) {
    const hit = skin.around(SK).at(s * 24, -8);
    if (!hit) continue;
    b.decal(skin, EYE, { at: hit, dir: [0, 0, 1], size: [0.052, 0.07], mirror: s > 0 });
  }
  const nose = faceSkin.ray([0, 1.762, 0.5], [0, 0, -1]);
  if (nose) b.stick(new THREE.ConeGeometry(0.009, 0.02, 5), "#f0b8a4", nose);
  const mouthHits = [-0.02, -0.01, 0, 0.01, 0.02]
    .map((x) => faceSkin.ray([x, 1.732 + 0.005 * (x / 0.02) ** 2, 0.5], [0, 0, -1]))
    .filter((h) => h !== null);
  if (mouthHits.length === 5) {
    b.sweep(catmull(mouthHits.map((h) => h.moved([0, 0.0015, 0]))), 0.0025, { color: "#b0525a", bone: head });
  }

  // Ears
  for (const s of [1, -1]) {
    const earPath = bezier([s * 0.082, 1.8, 0.0], [s * 0.17, 1.82, -0.05], [s * 0.26, 1.9, -0.1]);
    b.sweep(earPath, (t) => 0.024 * (1 - t) + 0.002, { color: SKINC, bone: head, caps: { start: "flat", end: "point" } });
    b.sweep(bezier([s * 0.092, 1.8, 0.002], [s * 0.17, 1.82, -0.045], [s * 0.23, 1.875, -0.088]), (t) => 0.012 * (1 - t) + 0.001, {
      color: "#f6a9a0",
      bone: head,
      caps: { start: "flat", end: "point" },
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: head, at: [s * 0.12, 1.76, -0.005] });
  }

  // Hair cap, bangs, locks
  b.part(new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, 1.75), HAIRP, {
    bone: head,
    at: [0, 1.81, 0.012],
    scale: [0.097, 0.1, 0.1],
    rotation: [-35, 0, 0],
  });
  const bangs: Array<[number, number, number]> = [
    [-38, 0.04, -1],
    [-22, 0.05, -1],
    [-7, 0.035, -1],
    [8, 0.04, 1],
    [23, 0.05, 1],
    [38, 0.04, 1],
  ];
  for (const [az, len, dir] of bangs) {
    const base = hp(az, 28, 1.07);
    const mid: P3 = [base[0] + dir * 0.008, base[1] - len * 0.5, base[2] + 0.025];
    const tip: P3 = [base[0] + dir * 0.02, base[1] - len, base[2] + 0.03];
    b.sweep(bezier(base, mid, tip), [0.017, 0.001], { color: HAIRP, bone: head, caps: { start: "flat", end: "point" } });
  }
  for (const s of [1, -1]) {
    b.sweep(
      catmull([hp(s * 78, 14, 1.08), [s * 0.1, 1.74, 0.04], [s * 0.115, 1.64, 0.05], [s * 0.1, 1.56, 0.07]]),
      [0.022, 0.016, 0.002],
      { color: HAIRP, bone: head, caps: { start: "flat", end: "point" } },
    );
  }
  // Circlet
  const circletPts: P3[] = [];
  for (let k = 0; k < 12; k++) circletPts.push(hp((k / 12) * 360, 26, 1.1));
  b.sweep(catmull(circletPts, { closed: true }), 0.006, { color: GOLD, bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.014), GEM, { bone: head, at: hp(0, 27, 1.13) }));
  b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: head, at: hp(0, 33, 1.1) });

  // Ponytail
  const hair = b.chain(
    "hair",
    catmull([
      [0, 1.87, -0.075],
      [0, 1.91, -0.15],
      [0, 1.84, -0.23],
      [0, 1.69, -0.28],
      [0, 1.53, -0.29],
    ]),
    { parent: head, names: ["hair1", "hair2", "hair3", "hair4"], role: "tail" },
  );
  b.sweep(hair, [0.03, 0.04, 0.034, 0.022, 0.006], { color: HAIR_TAIL });
  b.part(new THREE.TorusGeometry(0.032, 0.01, 5, 10), GOLD, { bone: head, at: [0, 1.866, -0.082], dir: [0, 0.45, -1], axis: "z" });

  // Legs ---------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.09, 0.97, 0], [s * 0.1, 0.08, 0.01], [0.46, 0.45], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.06],
    });
    b.sweep(leg, [0.085, 0.072, 0.057, 0.058, 0.054, 0.043], {
      color: PANTS,
      bands: [
        [0.58, PANTS],
        [1, BOOT],
      ],
    });
    b.rod(leg.at(0.57), leg.at(0.66), 0.068, LEATHER_LT);
    b.rod(leg.at(0.655), leg.at(0.67), 0.07, GOLD);
    for (const t of [0.78, 0.88]) {
      const cp = leg.at(t);
      b.part(new THREE.TorusGeometry(0.058 - 0.004 * (t - 0.78) * 10, 0.006, 5, 10), GOLD, { at: cp.at, dir: cp.tangent, axis: "z" });
    }
    const ankle = leg.joints[leg.joints.length - 1];
    b.frustumBox([s * 0.1, 0.05, -0.035], [s * 0.1, 0.04, 0.17], [0.085, 0.1], [0.07, 0.07], { color: BOOT, bone: ankle });
    b.part(new THREE.BoxGeometry(0.095, 0.02, 0.27), SOLE, { bone: ankle, at: [s * 0.1, 0.01, 0.05] });
    b.spike([s * 0.1, 0.045, 0.19], [0, 0.25, 1], 0.08, 0.03, LEATHER_LT, { bone: ankle });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), GOLD, { bone: ankle, at: [s * 0.1, 0.075, 0.06] });
  }

  // Arms, hands --------------------------------------------------------------------------------------------------
  const handJoints: Array<typeof head> = [];
  const X = 0.45;
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hand: P3 = [s * X, 0.98, 0.05];
    const pts = limb([s * 0.2, 1.44, 0], hand, [0.3, 0.28], [0, 0, -1]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.048, 0.042, 0.034, 0.03], {
      color: TUNIC,
      bands: [
        [0.5, TUNIC],
        [1, SKINC],
      ],
    });
    b.rod(arm.at(0.47), arm.at(0.55), 0.052, GOLD);
    b.rod(arm.at(0.6), arm.at(0.9), 0.04, LEATHER);
    b.rod(arm.at(0.6), arm.at(0.63), 0.043, GOLD);
    b.rod(arm.at(0.87), arm.at(0.9), 0.04, GOLD);
    b.rod(arm.at(0.69), arm.at(0.72), 0.042, LEATHER_LT);
    b.rod(arm.at(0.78), arm.at(0.81), 0.041, LEATHER_LT);
    const hj = arm.joints[arm.joints.length - 1];
    handJoints.push(hj);
    b.part(new THREE.SphereGeometry(0.04, 8, 6), SKINC, { bone: hj, at: hand, scale: [1, 1.1, 0.8] });
    if (s > 0) {
      for (let i = 0; i < 4; i++) {
        const y = hand[1] + (i - 1.5) * 0.024;
        b.capsule([hand[0] + 0.022, y, 0.095], [hand[0] - 0.022, y, 0.095], 0.011, SKINC, { bone: hj });
      }
      b.capsule([hand[0] - 0.015, hand[1] + 0.03, 0.03], [hand[0] + 0.02, hand[1] + 0.045, 0.085], 0.012, SKINC, { bone: hj });
    } else {
      for (let i = 0; i < 4; i++) {
        const x = hand[0] + (i - 1.5) * 0.016;
        b.capsule([x, 0.955, 0.05], [x - s * 0.002, 0.89 - Math.abs(i - 1.5) * 0.008, 0.06], 0.009, SKINC, { bone: hj });
      }
      b.capsule([hand[0] - s * 0.03, 0.99, 0.07], [hand[0] - s * 0.04, 0.94, 0.09], 0.011, SKINC, { bone: hj });
    }
    // Pauldrons
    const armJ0 = arm.joints[0];
    b.part(new THREE.SphereGeometry(0.075, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER, {
      bone: armJ0,
      at: [s * 0.205, 1.47, 0],
      dir: [s, 0.55, 0],
    });
    b.part(new THREE.TorusGeometry(0.074, 0.007, 5, 12), GOLD, { bone: armJ0, at: [s * 0.205, 1.47, 0], dir: [s, 0.55, 0], axis: "z" });
    b.part(new THREE.SphereGeometry(0.085, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER_LT, {
      bone: armJ0,
      at: [s * 0.22, 1.43, 0],
      dir: [s, 0.2, 0],
    });
    b.part(new THREE.TorusGeometry(0.084, 0.007, 5, 12), GOLD, { bone: armJ0, at: [s * 0.22, 1.43, 0], dir: [s, 0.2, 0], axis: "z" });
    glow(b.part(new THREE.OctahedronGeometry(0.012), GEM, { bone: armJ0, at: [s * 0.24, 1.5, 0.035] }));
  }

  // Bow ----------------------------------------------------------------------------------------------------------
  const hjL = handJoints[0];
  const bowPath = catmull([
    [X, 1.74, -0.06],
    [X, 1.58, 0.03],
    [X, 1.3, 0.075],
    [X, 1.05, 0.065],
    [X, 0.91, 0.065],
    [X, 0.66, 0.075],
    [X, 0.38, 0.03],
    [X, 0.22, -0.06],
  ]);
  b.sweep(bowPath, [0.006, 0.012, 0.017, 0.021, 0.021, 0.017, 0.012, 0.006], {
    color: WOOD,
    bone: hjL,
    caps: "point",
  });
  b.along(bowPath, 7, (at) => b.stick(new THREE.SphereGeometry(0.014, 6, 4), GOLD, at, { bone: hjL }));
  b.rod([X, 0.93, 0.065], [X, 1.03, 0.065], 0.026, LEATHER, { bone: hjL });
  for (const y of [0.915, 1.045]) b.rod([X, y - 0.012, 0.065], [X, y + 0.012, 0.065], 0.025, GOLD, { bone: hjL });
  glow(b.part(new THREE.OctahedronGeometry(0.016), GEM, { bone: hjL, at: [X, 1.1, 0.085] }));
  glow(b.part(new THREE.OctahedronGeometry(0.012), GEM, { bone: hjL, at: [X, 0.86, 0.085] }));
  b.spike([X, 1.74, -0.06], [0, 1, -0.5], 0.055, 0.008, GOLD, { bone: hjL });
  b.spike([X, 0.22, -0.06], [0, -1, -0.5], 0.055, 0.008, GOLD, { bone: hjL });
  b.rod([X, 1.74, -0.06], [X, 0.22, -0.06], 0.003, STRING, { bone: hjL });
  b.rod([X, 1.0, -0.06], [X, 1.08, -0.06], 0.006, GOLD_DK, { bone: hjL });

  return b.root;
}
