import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { countershade, mottle, paint, stripes } from "../src/paint";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Orc Berserker · Sonnet",
  description: "Hulking green orc berserker with tusks, war paint, braided topknot, studded leathers and a two-handed axe.",
};

// palette
const SKIN = "#6f9a3c";
const SKIN_D = "#557d2d";
const SKIN_L = "#93b955";
const LEATHER = "#6a4226";
const LEATHER_D = "#3d2415";
const IVORY = "#eadfbf";
const STEEL = "#b4bbc4";
const IRON = "#59606b";
const IRON_D = "#3a3f48";
const FUR_A = "#8a5a34";
const FUR_B = "#5d3a20";
const HAIR = "#2e2638";
const RED = "#a8281f";
const WHITE = "#ece6d6";
const EYE = "#ffd23a";
const MOUTH = "#4a1a1e";
const WOOD = "#80552f";
const BRASS = "#c39a3f";
const CLAW = "#2a2521";

const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;
function prof(keys: readonly (readonly [number, number])[]) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) return lerpN(keys[i - 1][1], keys[i][1], (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    }
    return keys[keys.length - 1][1];
  };
}

const skinBase = countershade(mottle(SKIN, SKIN_D, { size: 0.13, contrast: 0.55 }), SKIN_L, { level: -0.15 });

// body markings: ab grooves, claw scars across the left pec
const bodySkin = paint((p, n) => {
  if (n.z > 0.15 && p.y > 1.1 && p.y < 1.46) {
    const groove = Math.abs(p.x) < 0.005 && p.y < 1.4;
    const rows = [1.17, 1.26, 1.35].some((y) => Math.abs(p.y - y) < 0.0045 && Math.abs(p.x) < 0.12);
    if (groove || rows) return SKIN_D;
  }
  if (n.z > 0.1 && p.y > 1.4 && p.y < 1.68) {
    for (const c of [0.0, 0.028, 0.056]) {
      const d = p.x * 0.83 + p.y * 0.55 - (0.74 + c);
      if (Math.abs(d) < 0.006 && p.x > 0.02 && p.x < 0.3) return "#c9d68a";
    }
  }
  // red chevrons across the shoulder blades, pale spine line
  if (n.z < -0.2 && p.y > 1.3 && p.y < 1.7 && Math.abs(p.x) < 0.36) {
    const k = (p.y - 0.7 * Math.abs(p.x) - 1.28) / 0.055;
    if (k > 0 && k < 4.2 && k % 1 < 0.45) return RED;
    if (Math.abs(p.x) < 0.007) return "#c9d68a";
  }
  // old claw scars across the left thigh
  if (n.z > 0.3 && p.y > 0.6 && p.y < 0.9 && Math.abs(p.x - 0.22) < 0.1) {
    for (const c of [-0.03, 0, 0.03]) {
      if (Math.abs(p.x * 0.6 + p.y * 0.8 - (0.732 + c)) < 0.0055) return "#c9d68a";
    }
  }
  // red rings on the upper arms
  if (Math.abs(p.x) > 0.56 && Math.abs(p.x) < 0.8 && p.y > 1.3 && p.y < 1.68) {
    const u = Math.abs(p.x) * 0.87 - p.y * 0.5 - (0.5 * 0.87 - 1.6 * 0.5);
    if ((u > 0.1 && u < 0.125) || (u > 0.145 && u < 0.17)) return RED;
  }
  return skinBase;
});

// The head is drawn in a 'raw' frame centred at (0, 1.9, 0.17), then enlarged by HK and moved to (0, 1.88, 0.19).
const HK = 1.25;
const hp = (x: number, y: number, z: number): [number, number, number] => [x * HK, 1.88 + (y - 1.9) * HK, 0.19 + (z - 0.17) * HK];

// war paint, read in the raw head frame
const faceSkin = paint((p, n) => {
  const rx = p.x / HK;
  const ry = 1.9 + (p.y - 1.88) / HK;
  const rz = 0.17 + (p.z - 0.19) / HK;
  if (rz > 0.2 && n.z > -0.1) {
    const ax = Math.abs(rx);
    if (ry > 1.868 && ry < 1.893) return RED;
    if (Math.abs(ax - 0.06) < 0.012 && ry > 1.78 && ry < 1.962) return WHITE;
    if (ry > 1.955 && ax < 0.03 - (ry - 1.955) * 0.9) return WHITE;
  }
  if (rz > 0.2 && ry < 1.8 && Math.abs(Math.abs(rx) - 0.035) < 0.01) return WHITE;
  return skinBase;
});

const furPaint = mottle(FUR_A, FUR_B, { size: 0.07, contrast: 0.7 });
const wrapPaint = stripes(LEATHER, LEATHER_D, { size: 0.045, axis: "y", width: 0.5 });
const hairPaint = stripes(HAIR, "#4d3f5c", { size: 0.022, axis: "y", width: 0.5 });

export default function build() {
  const b = createBuilder({ name: "orcBerserker", paintSize: 2048 });
  const rand = rng(11);

  // ================= skeleton: spine, neck, head =================
  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.1, 0.0],
      [0, 1.3, 0.02],
      [0, 1.5, 0.06],
      [0, 1.68, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.68, 0.1],
      [0, 1.75, 0.135],
      [0, 1.81, 0.17],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.81, 0.17], dir: [0, 1, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, 1.85, 0.12), dir: [0, 0, 1], role: "jaw" });

  // ================= torso =================
  const torso = b.loft(
    [
      { at: [0, 0.99, 0.0], w: 0.6, h: 0.33 },
      { at: [0, 1.14, 0.0], w: 0.54, h: 0.31 },
      { at: [0, 1.3, 0.02], w: 0.46, h: 0.32 },
      { at: [0, 1.48, 0.06], w: 0.76, h: 0.4 },
      { at: [0, 1.62, 0.09], w: 0.9, h: 0.4 },
      { at: [0, 1.7, 0.1], w: 0.6, h: 0.3 },
    ],
    { bone: [hips, spine], color: bodySkin, sides: 10, caps: "flat", name: "torso" },
  );
  const sk = b.surface(torso);
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), bodySkin, {
      bone: chest,
      at: [s * 0.15, 1.52, 0.2],
      scale: [0.17, 0.11, 0.1],
      flat: true,
      name: "pec",
    });
  }
  const trapsPart = b.part(new THREE.SphereGeometry(1, 8, 6), bodySkin, { bone: chest, at: [0, 1.71, -0.03], scale: [0.3, 0.1, 0.12], flat: true, name: "traps" });

  // ================= neck =================
  b.sweep(neck, [0.11, 0.1], { color: bodySkin, sides: 8, name: "neckTube" });

  // ================= legs =================
  const legR = prof([
    [0, 0.155],
    [0.2, 0.15],
    [0.52, 0.108],
    [0.68, 0.115],
    [1, 0.066],
  ]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.19, 1.0, 0.0], [s * 0.25, 0.13, -0.02], [0.47, 0.42], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.25, 0, 0.05],
    });
    const legTube = b.sweep(leg, legR, { color: bodySkin, sides: 8, name: `legTube${side}` });
    const ankle = leg.tip!;
    b.sweep(
      catmull([
        [s * 0.25, 0.058, -0.085],
        [s * 0.25, 0.055, 0.0],
        [s * 0.25, 0.05, 0.12],
      ]),
      () => [0.07, 0.056],
      { bone: ankle, color: bodySkin, sides: 8, name: `foot${side}` },
    );
    // toes
    const ball = b.joint(`ball${side}`, { parent: ankle, at: [s * 0.25, 0.05, 0.11], dir: [0, 0, 1] });
    const toeR = [0.031, 0.026, 0.024, 0.022];
    for (let i = 0; i < 4; i++) {
      const x = s * 0.25 + s * (-0.055 + 0.037 * i);
      const r = toeR[i];
      const toe = b.chain(
        `toe${i + 1}${side}`,
        catmull([
          [x, r, 0.1],
          [x, r, 0.17],
          [x, r * 0.8, 0.22 - i * 0.008],
        ]),
        { parent: ball, names: [`toe${i + 1}${side}a`, `toe${i + 1}${side}b`], role: "digit" },
      );
      b.sweep(toe, [r, r * 0.8], { color: bodySkin, sides: 6, name: "toe" });
      b.spike(toe.at(1), toe.at(1), 0.035, r * 0.75, { color: CLAW, sides: 5 });
    }
    // shin wraps
    for (const t of [0.66, 0.73, 0.8, 0.87]) {
      const band = b.ring(leg.at(t), { count: 8, radius: legR(t) + 0.004 });
      b.sweep(catmull(band.items, { closed: true }), 0.012, { color: LEATHER, sides: 4, name: "shinWrap" });
    }
    // knee pad with a spike, fur anklet, thigh strap
    const kneeHit = b.surface(legTube).around(leg.joints[1].at).at(0, 0);
    if (kneeHit) {
      b.stick(new THREE.SphereGeometry(1, 6, 5), LEATHER, kneeHit, { embed: 0.35, scale: [0.085, 0.05, 0.09], flat: true, name: "kneePad" });
      b.stick(new THREE.ConeGeometry(0.02, 0.06, 5), STEEL, kneeHit.moved([0, 0.03, 0]), { embed: 0.2, name: "kneeSpike" });
    }
    const anklet = b.ring(leg.at(0.93), { count: 8, radius: legR(0.93) + 0.012 });
    b.sweep(catmull(anklet.items, { closed: true }), 0.03, { color: furPaint, sides: 6, name: "anklet" });
    const thighStrap = b.ring(leg.at(0.3), { count: 9, radius: legR(0.3) + 0.004 });
    b.sweep(catmull(thighStrap.items, { closed: true }), 0.014, { color: LEATHER_D, sides: 4, name: "thighStrap" });
  }

  // ================= head =================
  b.part(new THREE.SphereGeometry(1, 10, 8), faceSkin, {
    bone: head,
    at: hp(0, 1.9, 0.17),
    scale: [0.125 * HK, 0.115 * HK, 0.135 * HK],
    flat: true,
    name: "skull",
  });
  for (const s of [1, -1]) {
    // heavy brow ridge, slanting down toward the nose
    b.capsule(hp(s * 0.12, 1.955, 0.2), hp(s * 0.012, 1.922, 0.292), [0.036 * HK, 0.031 * HK], { bone: head, color: faceSkin, sides: 6, name: "brow" });
    // cheekbone
    b.part(new THREE.SphereGeometry(1, 6, 5), faceSkin, {
      bone: head,
      at: hp(s * 0.092, 1.865, 0.225),
      scale: [0.05 * HK, 0.038 * HK, 0.05 * HK],
      flat: true,
      name: "cheek",
    });
    // small deep-set glowing eye
    glow(b.part(new THREE.SphereGeometry(0.0145 * HK, 5, 4), EYE, { bone: head, at: hp(s * 0.058, 1.903, 0.278), name: "eye" }), 0.8);
    b.part(new THREE.SphereGeometry(0.007 * HK, 5, 4), "#1a1016", { bone: head, at: hp(s * 0.058, 1.903, 0.29), scale: [0.55, 1.4, 0.5], name: "pupil" });
    b.part(new THREE.SphereGeometry(0.009 * HK, 5, 4), "#1a1016", { bone: head, at: hp(s * 0.03, 1.846, 0.336), name: "nostril" });
    // pointed ear swept back and up
    b.extrude(
      [
        [0, -0.04 * HK],
        [0.05 * HK, -0.055 * HK],
        [0.11 * HK, -0.01 * HK],
        [0.19 * HK, 0.11 * HK, "sharp"],
        [0.1 * HK, 0.08 * HK],
        [0.02 * HK, 0.065 * HK],
      ],
      { at: hp(s * 0.115, 1.915, 0.135), x: [s * 0.55, 0, -1], y: [0, 1, 0], thickness: 0.03, bevel: 0.008, color: faceSkin, bone: head, name: "ear" },
    );
  }
  // a hoop in the left ear lobe
  b.part(new THREE.TorusGeometry(0.026, 0.006, 3, 7), STEEL, { bone: head, at: [0.176, 1.812, 0.085], rotation: [0, 90, 0], name: "earring" });
  // nose ring
  b.part(new THREE.TorusGeometry(0.024, 0.005, 3, 7), STEEL, { bone: head, at: hp(0, 1.833, 0.346), name: "noseRing" });
  // nose and muzzle
  b.frustumBox(hp(0, 1.9, 0.262), hp(0, 1.853, 0.338), [0.055 * HK, 0.04 * HK], [0.11 * HK, 0.07 * HK], { bone: head, color: faceSkin, name: "nose" });
  b.frustumBox(hp(0, 1.838, 0.205), hp(0, 1.835, 0.318), [0.172 * HK, 0.078 * HK], [0.172 * HK, 0.078 * HK], { bone: head, color: faceSkin, name: "upperJaw" });
  b.part(new THREE.SphereGeometry(1, 7, 5), faceSkin, {
    bone: head,
    at: hp(0, 1.975, 0.2),
    scale: [0.1 * HK, 0.04 * HK, 0.09 * HK],
    flat: true,
    name: "foreheadRidge",
  });

  // lower jaw (separate, hinged at the jaw joint)
  const jawLine = catmull([
    hp(0.104, 1.835, 0.1),
    hp(0.1, 1.79, 0.19),
    hp(0.075, 1.762, 0.28),
    hp(0, 1.754, 0.318),
    hp(-0.075, 1.762, 0.28),
    hp(-0.1, 1.79, 0.19),
    hp(-0.104, 1.835, 0.1),
  ]);
  b.sweep(jawLine, [0.03 * HK, 0.034 * HK, 0.034 * HK], { bone: jaw, color: faceSkin, sides: 6, name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(1, 7, 5), faceSkin, {
    bone: jaw,
    at: hp(0, 1.765, 0.305),
    scale: [0.065 * HK, 0.04 * HK, 0.05 * HK],
    flat: true,
    name: "chin",
  });
  b.part(new THREE.BoxGeometry(0.14 * HK, 0.008, 0.2 * HK), MOUTH, { bone: jaw, at: hp(0, 1.805, 0.21), name: "mouthFloor" });
  for (const s of [1, -1]) {
    // upward tusks
    b.sweep(bezier(hp(s * 0.062, 1.77, 0.3), hp(s * 0.08, 1.83, 0.348), hp(s * 0.066, 1.935, 0.338)), [0.026 * HK, 0.002], {
      bone: jaw,
      color: IVORY,
      sides: 6,
      caps: "point",
      name: "tusk",
    });
    // small lower teeth
    b.spike(hp(s * 0.03, 1.795, 0.305), [0, 1, 0], 0.03, 0.009, { bone: jaw, color: IVORY, sides: 4 });
  }

  // ================= topknot and braids =================
  const knot = b.chain(
    "topknot",
    catmull([hp(0, 2.0, 0.04), hp(0, 2.03, -0.01), hp(0, 2.04, -0.07), hp(0, 1.99, -0.13)]),
    { parent: head, names: ["knot1", "knot2", "knot3"], role: "tail" },
  );
  b.sweep(knot, [0.042, 0.038, 0.028, 0.01], { color: hairPaint, sides: 6, name: "topknot" });
  b.part(new THREE.SphereGeometry(1, 7, 5), hairPaint, { bone: knot.joints[0], at: hp(0, 2.0, 0.045), scale: [0.072, 0.066, 0.072], flat: true, name: "bun" });
  b.part(new THREE.TorusGeometry(0.05, 0.01, 3, 6), RED, { bone: knot.joints[0], at: hp(0, 2.02, -0.005), name: "knotCord" });
  b.part(new THREE.TorusGeometry(0.044, 0.008, 3, 6), IVORY, { bone: knot.joints[1], at: hp(0, 2.04, -0.05), name: "knotRing" });
  const braidStarts: [number, number, number][] = [
    [-0.045, 1.975, 0.03],
    [0.0, 1.965, 0.02],
    [0.045, 1.975, 0.03],
  ];
  braidStarts.forEach(([x, y, z], bi) => {
    const sway = (bi - 1) * 0.06;
    const p0 = hp(x, y, z);
    const braid = b.chain(
      `braid${bi + 1}`,
      catmull([
        p0,
        [p0[0] + sway * 0.4, p0[1] - 0.15, p0[2] - 0.07],
        [p0[0] + sway * 0.9, p0[1] - 0.33, p0[2] - 0.11],
        [p0[0] + sway * 1.3, p0[1] - 0.52 - (bi === 1 ? 0.07 : 0), p0[2] - 0.15],
      ]),
      { parent: head, names: [`braid${bi + 1}a`, `braid${bi + 1}b`, `braid${bi + 1}c`], role: "tail" },
    );
    b.sweep(braid, [0.018, 0.012], { color: HAIR, sides: 5, caps: "round", name: "braidCore" });
    let k = 0;
    b.along(braid, 13, (at) => {
      b.part(new THREE.SphereGeometry(1, 5, 4), HAIR, {
        frame: frame(at.local([k % 2 ? 0.011 : -0.011, 0, 0]), at.dir([0, 1, 0])),
        scale: [0.023, 0.03, 0.023],
        name: "braidLink",
      });
      k++;
    });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), bi === 1 ? IVORY : RED, { frame: braid.at(1), name: "braidTie" });
  });

  // ================= arms =================
  const armR = prof([
    [0, 0.125],
    [0.2, 0.13],
    [0.4, 0.108],
    [0.5, 0.097],
    [0.62, 0.1],
    [0.8, 0.086],
    [1, 0.064],
  ]);
  const FINGER_LEN = [0.052, 0.045, 0.038];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const clav = b.joint(`clavicle${side}`, { parent: chest, at: [s * 0.2, 1.68, 0.07], aim: [s * 0.5, 1.6, 0.03] });
    const S: [number, number, number] = [s * 0.5, 1.6, 0.03];
    const E: [number, number, number] = [s * 0.81, 1.42, 0.07];
    const W: [number, number, number] = [s * 1.11, 1.26, 0.08];
    const arm = b.chain(`arm${side}`, [S, E, W], {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    b.sweep(arm, armR, { color: bodySkin, sides: 8, name: `armTube${side}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), bodySkin, { bone: shoulder, at: [s * 0.52, 1.62, 0.03], scale: [0.14, 0.13, 0.135], flat: true, name: "deltoid" });

    // studded bracer on the forearm
    const fdir = [W[0] - E[0], W[1] - E[1], W[2] - E[2]] as const;
    const fl = Math.hypot(...fdir);
    const fu = [fdir[0] / fl, fdir[1] / fl, fdir[2] / fl] as const;
    const bStart = 0.1;
    const bLen = 0.18;
    const A0: [number, number, number] = [E[0] + fu[0] * bStart, E[1] + fu[1] * bStart, E[2] + fu[2] * bStart];
    const r0 = armR(0.51 + 0.49 * (bStart / fl));
    const r1 = armR(0.51 + 0.49 * ((bStart + bLen) / fl));
    b.lathe(
      [
        [r0 - 0.012, 0],
        [r0 + 0.016, 0],
        [r1 + 0.016, bLen],
        [r1 - 0.012, bLen],
      ],
      { at: A0, axis: fu, segments: 8, bone: elbow, color: LEATHER, name: "bracer" },
    );
    for (const f of [0.22, 0.78]) {
      const ctr: [number, number, number] = [A0[0] + fu[0] * bLen * f, A0[1] + fu[1] * bLen * f, A0[2] + fu[2] * bLen * f];
      const rr = lerpN(r0, r1, f) + 0.016;
      b.ring(frame(ctr, fu), { count: 8, radius: rr }, (item) => {
        b.stick(new THREE.ConeGeometry(0.014, 0.028, 5), STEEL, item, { embed: 0.3, bone: elbow });
      });
    }
    // upper arm band
    const bandC = b.ring(arm.at(0.3), { count: 8, radius: armR(0.3) + 0.004 });
    b.sweep(catmull(bandC.items, { closed: true }), 0.014, { color: LEATHER_D, sides: 4, name: "armBand" });

    // hand: built with the arm so it rides the wrist joint
    const dh = new THREE.Vector3(...fu);
    const Wv = new THREE.Vector3(...W);
    const at = (o: THREE.Vector3, ...terms: [THREE.Vector3, number][]) => {
      const v = o.clone();
      for (const [dir, k] of terms) v.addScaledVector(dir, k);
      return v;
    };
    if (s > 0) {
      // open left hand, palm facing forward, fingers fanned in the vertical plane, thumb up
      const perp = new THREE.Vector3(-dh.y, dh.x, 0).normalize();
      const fwd = new THREE.Vector3(0, 0, 1);
      b.part(new THREE.BoxGeometry(0.06, 0.14, 0.15), bodySkin, { bone: wrist, at: at(Wv, [dh, 0.07]), dir: dh, up: perp, flat: true, name: "palm" });
      const FL = [0.98, 1.08, 1.0, 0.85];
      for (let k = 0; k < 4; k++) {
        const zo = (1.2 - k) * 0.037;
        const base = at(Wv, [dh, 0.138], [perp, zo]);
        let fd = dh.clone().addScaledVector(perp, zo * 3.2).normalize();
        const pts = [base.clone()];
        let cur = base.clone();
        for (const len of FINGER_LEN) {
          cur = at(cur, [fd, len * FL[k]]);
          pts.push(cur.clone());
          fd = fd.clone().addScaledVector(fwd, 0.28).normalize();
        }
        const fing = b.chain(`finger${k + 1}${side}`, catmull(pts), {
          parent: wrist,
          names: [`finger${k + 1}${side}a`, `finger${k + 1}${side}b`, `finger${k + 1}${side}c`],
          role: "digit",
        });
        b.sweep(fing, [0.022, 0.0135], { color: bodySkin, sides: 4, name: "finger" });
        b.spike(fing.at(1), fing.at(1), 0.038, 0.0135, { color: CLAW, sides: 4 });
      }
      const tb = at(Wv, [dh, 0.04], [perp, 0.08]);
      let td = dh.clone().multiplyScalar(0.45).addScaledVector(perp, 0.85).addScaledVector(fwd, 0.2).normalize();
      const tpts = [tb.clone()];
      let tc = tb.clone();
      for (const len of [0.058, 0.05, 0.042]) {
        tc = at(tc, [td, len]);
        tpts.push(tc.clone());
        td = td.clone().addScaledVector(dh, 0.05).addScaledVector(fwd, 0.1).normalize();
      }
      const thumb = b.chain(`thumb${side}`, catmull(tpts), {
        parent: wrist,
        names: [`thumb${side}a`, `thumb${side}b`, `thumb${side}c`],
        role: "digit",
      });
      b.sweep(thumb, [0.027, 0.016], { color: bodySkin, sides: 4, name: "thumb" });
      b.spike(thumb.at(1), thumb.at(1), 0.04, 0.016, { color: CLAW, sides: 4 });
    } else {
      // right fist around the axe haft
      const P = at(Wv, [dh, 0.14]);
      b.part(new THREE.BoxGeometry(0.06, 0.14, 0.17), bodySkin, { bone: wrist, at: at(Wv, [dh, 0.07]), dir: dh, up: [0, 1, 0], flat: true, name: "palm" });
      const arcPts = (y: number, th0: number, step: number, r: number) =>
        [0, 1, 2, 3].map((i) => {
          const th = (th0 + step * i) * (Math.PI / 180);
          return new THREE.Vector3(P.x + r * Math.cos(th), y, P.z + r * Math.sin(th));
        });
      for (let k = 0; k < 4; k++) {
        const fing = b.chain(`finger${k + 1}${side}`, catmull(arcPts(P.y + (1.5 - k) * 0.037, 25, 47, 0.053)), {
          parent: wrist,
          names: [`finger${k + 1}${side}a`, `finger${k + 1}${side}b`, `finger${k + 1}${side}c`],
          role: "digit",
        });
        b.sweep(fing, [0.022, 0.015], { color: bodySkin, sides: 4, name: "finger" });
        b.spike(fing.at(1), fing.at(1), 0.032, 0.0135, { color: CLAW, sides: 4 });
      }
      const thumb = b.chain(`thumb${side}`, catmull(arcPts(P.y + 0.105, -20, -36, 0.054)), {
        parent: wrist,
        names: [`thumb${side}a`, `thumb${side}b`, `thumb${side}c`],
        role: "digit",
      });
      b.sweep(thumb, [0.027, 0.017], { color: bodySkin, sides: 4, name: "thumb" });
      b.spike(thumb.at(1), thumb.at(1), 0.034, 0.016, { color: CLAW, sides: 4 });

      // ---- two-handed axe ----
      const HX = P.x;
      const HZ = P.z;
      b.rod([HX, 0.5, HZ], [HX, 1.94, HZ], 0.034, { bone: wrist, color: WOOD, sides: 8, name: "haft" });
      b.rod([HX, 0.94, HZ], [HX, 1.44, HZ], 0.0385, { bone: wrist, color: wrapPaint, sides: 8, name: "gripWrap" });
      b.rod([HX, 0.5, HZ], [HX, 0.6, HZ], 0.037, { bone: wrist, color: IRON, sides: 8, name: "ferrule" });
      b.spike([HX, 0.52, HZ], [0, -1, 0], 0.13, 0.036, { bone: wrist, color: STEEL, sides: 6 });
      b.rod([HX, 1.6, HZ], [HX, 1.97, HZ], 0.043, { bone: wrist, color: IRON_D, sides: 8, name: "socket" });
      b.spike([HX, 1.96, HZ], [0, 1, 0], 0.11, 0.04, { bone: wrist, color: STEEL, sides: 6 });
      const edge = paint((_p, _n, sc) => (sc[0] > 0.3 ? STEEL : sc[0] < 0.1 ? IRON_D : IRON));
      const axeHead = b.extrude(
        [
          [-0.03, 0.12],
          [0.05, 0.2],
          [0.18, 0.27],
          [0.3, 0.32, "sharp"],
          [0.37, 0.2],
          [0.4, 0.07],
          [0.35, 0.04, "sharp"],
          [0.395, 0.0],
          [0.39, -0.1],
          [0.35, -0.22],
          [0.29, -0.31, "sharp"],
          [0.17, -0.25],
          [0.05, -0.19],
          [-0.03, -0.12],
          [-0.25, -0.01, "sharp"],
        ],
        { at: [HX, 1.78, HZ], x: [-0.34, 0, 0.94], y: [0, 1, 0], thickness: 0.05, bevel: 0.012, color: edge, bone: wrist, name: "axeHead" },
      );
      for (const zz of [0.03, -0.03])
        for (const [u, v] of [
          [0.1, 0.1],
          [0.1, -0.1],
        ])
          b.stick(new THREE.SphereGeometry(0.014, 5, 4), STEEL, axeHead.moved([u, v, zz]), { embed: 0.5, bone: wrist });
      // a glowing blood-red rune on both faces of the blade
      const rune = svg(
        `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ff4a1c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 6 V58"/><path d="M14 18 L32 34 L50 18"/><path d="M18 46 L32 34 L46 46"/></g></svg>`,
        { size: 192 },
      );
      const faceDir = new THREE.Vector3(-0.95, 0, -0.34);
      const slide = new THREE.Vector3(-0.34, 0, 0.94).normalize();
      for (const f of [1, -1]) {
        const n = faceDir.clone().multiplyScalar(f);
        const pos = new THREE.Vector3(HX, 1.78, HZ).addScaledVector(slide, 0.17).addScaledVector(n, 0.0268);
        glow(b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { bone: wrist, at: pos, dir: n, axis: "z", up: [0, 1, 0], texture: rune, name: "rune" }), 1.2);
      }
    }
  }

  // ================= left pauldron with spikes =================
  {
    const a = new THREE.Vector3(0.55, 0.83, 0.02).normalize();
    const S0 = new THREE.Vector3(0.52, 1.62, 0.03);
    const pos1 = S0.clone().addScaledVector(a, 0.03);
    b.lathe(
      [
        [0, 0],
        [0.205, 0],
        [0.2, 0.03],
        [0.165, 0.085],
        [0.09, 0.125],
        [0, 0.135],
      ],
      { at: pos1, axis: a, segments: 8, color: IRON, bone: "shoulderL", name: "pauldron" },
    );
    const pos2 = S0.clone().addScaledVector(a, 0.14);
    b.lathe(
      [
        [0, 0],
        [0.13, 0],
        [0.125, 0.02],
        [0.1, 0.055],
        [0.05, 0.085],
        [0, 0.092],
      ],
      { at: pos2, axis: a, segments: 8, color: IRON_D, bone: "shoulderL", name: "pauldronCap" },
    );
    b.part(new THREE.TorusGeometry(0.2, 0.012, 4, 8), STEEL, { bone: "shoulderL", at: pos1.clone().addScaledVector(a, 0.008), dir: a, axis: "z", name: "pauldronRim" });
    b.ring(frame(pos1.clone().addScaledVector(a, 0.03), a), { count: 7, radius: 0.155, tilt: 38 }, (item) => {
      b.spike(item, item, 0.15, 0.034, { bone: "shoulderL", color: STEEL, sides: 5, name: "pauldronSpike" });
    });
    b.spike(pos2.clone().addScaledVector(a, 0.07), a, 0.18, 0.042, { bone: "shoulderL", color: STEEL, sides: 5, name: "pauldronSpike" });
  }

  // ================= belts, buckle, bandolier =================
  const beltPath = sk.loop([0, 1.14, 0], { lift: 0.012 });
  b.sweep(beltPath, () => [0.014, 0.042], { section: "box", color: LEATHER, name: "belt" });
  b.along(beltPath, 24, (at) => {
    if (Math.abs(at.at.x) < 0.09 && at.at.z > 0) return;
    const h = sk.nearest(at.at);
    b.stick(new THREE.ConeGeometry(0.018, 0.04, 5), BRASS, h.moved([0, 0.03, 0]), { embed: 0.3, name: "beltStud" });
  });
  const furRoll = sk.loop([0, 1.06, 0], { lift: 0.03 });
  b.sweep(furRoll, 0.045, { color: furPaint, sides: 6, name: "furRoll" });
  const buckleHit = sk.ray([0, 1.14, 1], [0, 0, -1]);
  if (buckleHit) {
    b.stick(new THREE.BoxGeometry(0.11, 0.03, 0.09), IRON, buckleHit, { embed: 0.3, name: "buckle" });
    b.stick(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 6), BRASS, buckleHit.moved([0, 0.02, 0]), { embed: 0.2, name: "buckleBoss" });
  }
  // pouch on the left hip and a trophy skull on a strap at the front
  b.part(new THREE.BoxGeometry(0.075, 0.11, 0.13), LEATHER_D, { bone: hips, at: [0.385, 0.98, 0.03], flat: true, name: "pouch" });
  b.part(new THREE.BoxGeometry(0.085, 0.03, 0.14), LEATHER, { bone: hips, at: [0.385, 1.04, 0.03], rotation: [0, 0, -8], flat: true, name: "pouchFlap" });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), BRASS, { bone: hips, at: [0.425, 1.0, 0.03], name: "pouchButton" });
  b.rod([0.33, 1.14, 0.03], [0.385, 1.05, 0.03], 0.01, { bone: hips, color: LEATHER_D, sides: 4 });
  b.rod([0.17, 1.12, 0.22], [0.17, 1.0, 0.26], 0.008, { bone: hips, color: LEATHER_D, sides: 4 });
  b.part(new THREE.SphereGeometry(1, 7, 5), IVORY, { bone: hips, at: [0.17, 0.95, 0.255], scale: [0.05, 0.048, 0.055], flat: true, name: "trophySkull" });
  b.part(new THREE.BoxGeometry(0.05, 0.02, 0.04), IVORY, { bone: hips, at: [0.17, 0.905, 0.273], flat: true, name: "trophyJaw" });
  for (const sx of [-1, 1])
    b.part(new THREE.SphereGeometry(0.0125, 5, 4), "#1a1016", { bone: hips, at: [0.17 + sx * 0.02, 0.96, 0.3], name: "trophyEye" });

  const bandPath = sk.drape(
    catmull(
      [
        [-0.3, 1.66, 0.3],
        [-0.16, 1.55, 0.37],
        [0.0, 1.42, 0.36],
        [0.16, 1.28, 0.33],
        [0.27, 1.16, 0.24],
        [0.32, 1.1, 0.0],
        [0.22, 1.22, -0.22],
        [0.05, 1.42, -0.23],
        [-0.16, 1.58, -0.2],
        [-0.34, 1.69, -0.1],
        [-0.4, 1.7, 0.1],
      ],
      { closed: true },
    ),
    { lift: 0.012 },
  );
  b.sweep(bandPath, () => [0.032, 0.011], { color: LEATHER_D, sides: 6, name: "bandolier" });
  const frontT: number[] = [];
  for (let i = 0; i <= 200; i++) if (bandPath.at(i / 200).z > 0.2) frontT.push(i / 200);
  const ammoN = 7;
  for (let i = 0; i < ammoN; i++) {
    const t = frontT[Math.round(((i + 0.5) / ammoN) * (frontT.length - 1))];
    const hit = sk.nearest(bandPath.at(t));
    const tan = bandPath.tangentAt(t);
    b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 6), BRASS, hit.moved([0, 0.012, 0]), { embed: 0.25, flow: tan, name: "round" });
    b.stick(new THREE.CylinderGeometry(0.0205, 0.0205, 0.016, 6), IRON_D, hit.moved([0, 0.05, 0]), { embed: 0.0, flow: tan, name: "roundCap" });
  }

  // ================= tooth necklace =================
  const skNeck = b.surface([torso, trapsPart]);
  const necklace = skNeck.drape(
    catmull(
      [
        [0, 1.5, 0.42],
        [0.14, 1.58, 0.36],
        [0.25, 1.76, 0.12],
        [0.2, 1.84, -0.02],
        [0, 1.87, -0.08],
        [-0.2, 1.84, -0.02],
        [-0.25, 1.76, 0.12],
        [-0.14, 1.58, 0.36],
      ],
      { closed: true },
    ),
    { lift: 0.014 },
  );
  b.sweep(necklace, 0.011, { color: LEATHER_D, sides: 5, name: "necklace" });
  const teethT: number[] = [];
  for (let i = 0; i <= 200; i++) if (necklace.at(i / 200).z > 0.1) teethT.push(i / 200);
  for (let i = 0; i < 7; i++) {
    const t = teethT[Math.round(((i + 0.5) / 7) * (teethT.length - 1))];
    const big = i === 3;
    const tooth = necklace.at(t);
    b.part(new THREE.ConeGeometry(big ? 0.036 : 0.023, big ? 0.13 : 0.08, 5), IVORY, {
      bone: chest,
      at: [tooth.x, tooth.y - (big ? 0.065 : 0.04), tooth.z + 0.004],
      dir: [0, -1, 0.05],
      name: "necklaceTooth",
    });
  }
  // ================= fur loincloth =================
  const FLAPS = 11;
  for (let i = 0; i < FLAPS; i++) {
    const phi = (i / FLAPS) * Math.PI * 2;
    const sx = Math.sin(phi);
    const cz = Math.cos(phi);
    const ax = 0.36;
    const az = 0.23;
    const tang = new THREE.Vector3(ax * cz, 0, -az * sx).normalize();
    const outward = new THREE.Vector3(sx / ax, 0, cz / az).normalize();
    const L = (cz > 0.6 ? 0.46 : cz < -0.6 ? 0.36 : 0.32) + (rand() - 0.5) * 0.05;
    const w = 0.2;
    const posn = new THREE.Vector3(ax * sx, 1.1, az * cz).addScaledVector(outward, (i % 2) * 0.014);
    b.extrude(
      [
        [-w / 2, 0],
        [w / 2, 0],
        [w / 2, -L * 0.88],
        [w * 0.3, -L],
        [w * 0.1, -L * 0.8],
        [-w * 0.1, -L],
        [-w * 0.3, -L * 0.82],
        [-w / 2, -L * 0.94],
      ],
      { at: posn, x: tang, y: [outward.x * 0.25, 1, outward.z * 0.25], thickness: 0.028, bevel: 0.006, color: furPaint, bone: hips, name: "furFlap" },
    );
  }

  return b.root;
}
