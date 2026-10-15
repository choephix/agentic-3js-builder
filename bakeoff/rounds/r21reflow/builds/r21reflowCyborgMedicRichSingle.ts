import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { lerp, rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { countershade } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg medic with a healing staff: white armoured coat with teal and coral trim, gold fittings, glowing cyan cybernetic joints and a crescent-bladed caduceus staff.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type C = string | Paint;

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });
  const rand = rng(11);

  // ---------------------------------------------------------------- palette
  const WHITE = countershade("#f5f0e4", "#cbc5b6", { level: -0.1, soft: 0.6 });
  const TEAL = countershade("#2fb5a8", "#1b7a71", { level: -0.1, soft: 0.5 });
  const HAIR = countershade("#e8e1d4", "#a39a8a", { level: 0, soft: 0.6 });
  const SUIT = "#3a3e49";
  const STEEL = "#7b828f";
  const CORAL = "#ec6a58";
  const GOLD = "#e0a93a";
  const CYAN = "#69f3ea";
  const SKIN = "#efbfa5";
  const LIP = "#d9707a";
  const INKC = "#2a2128";

  // ---------------------------------------------------------------- helpers
  const P = (g: THREE.BufferGeometry, c: C, bone: Joint, at: number[] | THREE.Vector3, o: PartOptions = {}) =>
    b.part(g, c, { bone, at, ...o });
  const ell = (c: C, bone: Joint, at: number[] | THREE.Vector3, s: number[], seg = 10) =>
    P(new THREE.SphereGeometry(1, seg, Math.max(4, Math.round(seg * 0.7))), c, bone, at, { scale: s });
  const cyl = (c: C, bone: Joint, at: number[] | THREE.Vector3, r: number[], h: number, o: PartOptions = {}, seg = 12) =>
    P(new THREE.CylinderGeometry(1, 1, h, seg), c, bone, at, { scale: [r[0], 1, r[1]], ...o });
  const box = (c: C, bone: Joint, at: number[] | THREE.Vector3, d: number[], o: PartOptions = {}) =>
    P(new THREE.BoxGeometry(d[0], d[1], d[2]), c, bone, at, o);
  const torus = (c: C, bone: Joint, at: number[] | THREE.Vector3, dir: number[] | THREE.Vector3, R: number, t: number) =>
    P(new THREE.TorusGeometry(R, t, 5, 18), c, bone, at, { dir, axis: "z" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const norm = (a: THREE.Vector3, c: THREE.Vector3) => c.clone().sub(a).normalize();

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.98, 0],
      [0, 1.14, 0.01],
      [0, 1.32, 0.02],
      [0, 1.46, 0.0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.46, 0],
      [0, 1.53, 0.01],
      [0, 1.6, 0.015],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.6, 0.015], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.64, 0.02], aim: [0, 1.6, 0.11], role: "jaw" });

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.1, 0.95, 0], [s * 0.115, 0.095, 0.02], [0.45, 0.44], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.115, 0, 0.06],
    });
    const [hipJ, kneeJ, ankleJ] = leg.joints;
    const [p0, p1, p2] = pts;
    b.sweep(leg, [0.1, 0.088, 0.07, 0.058, 0.045], { color: SUIT });
    // thigh armour
    b.capsule(p0, lerp(p0, p1, 0.82), [0.108, 0.088], WHITE, { bone: hipJ });
    torus(CYAN, hipJ, lerp(p0, p1, 0.2), norm(p0, p1), 0.113, 0.006);
    glow(torus(CYAN, hipJ, lerp(p0, p1, 0.2), norm(p0, p1), 0.113, 0.006), 1.2);
    torus(GOLD, hipJ, lerp(p0, p1, 0.7), norm(p0, p1), 0.097, 0.008);
    // knee
    ell(SUIT, kneeJ, p1, [0.07, 0.07, 0.07], 8);
    ell(WHITE, kneeJ, [p1.x, p1.y + 0.01, p1.z + 0.06], [0.062, 0.07, 0.04], 8);
    torus(GOLD, kneeJ, [p1.x, p1.y + 0.01, p1.z + 0.095], [0, 0, 1], 0.042, 0.007);
    glow(cyl(CYAN, kneeJ, [p1.x, p1.y + 0.01, p1.z + 0.094], [0.03, 0.03], 0.012, { dir: [0, 0, 1] }, 8), 1.3);
    // shin and boot
    b.capsule(lerp(p1, p2, 0.08), lerp(p1, p2, 0.8), [0.082, 0.062], WHITE, { bone: kneeJ });
    b.capsule(lerp(p1, p2, 0.78), [p2.x, p2.y + 0.01, p2.z], [0.066, 0.07], WHITE, { bone: ankleJ });
    torus(GOLD, kneeJ, lerp(p1, p2, 0.52), norm(p1, p2), 0.08, 0.008);
    torus(GOLD, ankleJ, lerp(p1, p2, 0.82), norm(p1, p2), 0.07, 0.007);
    box(TEAL, kneeJ, [p1.x, lerp(p1, p2, 0.4).y, lerp(p1, p2, 0.4).z + 0.074], [0.03, 0.18, 0.012]);
    // foot
    box(WHITE, ankleJ, [s * 0.115, 0.045, 0.06], [0.1, 0.09, 0.27]);
    ell(GOLD, ankleJ, [s * 0.115, 0.04, 0.185], [0.052, 0.042, 0.05], 8);
    box(GOLD, ankleJ, [s * 0.115, 0.028, -0.075], [0.09, 0.056, 0.05]);
    box(TEAL, ankleJ, [s * 0.115, 0.07, 0.12], [0.104, 0.02, 0.08]);
    box(CORAL, ankleJ, [s * 0.115, 0.005, 0.06], [0.104, 0.01, 0.27]);
    // hip joint ball
    ell(STEEL, hipJ, p0, [0.06, 0.06, 0.06], 8);
  }

  // ---------------------------------------------------------------- torso
  ell(SUIT, hips, [0, 0.97, 0], [0.17, 0.11, 0.12]);
  cyl(TEAL, spine1, [0, 1.11, 0], [0.135, 0.095], 0.18, {}, 14);
  cyl(WHITE, chest, [0, 1.32, 0.005], [0.17, 0.115], 0.26, {}, 16);
  ell(WHITE, chest, [0, 1.45, 0.005], [0.17, 0.055, 0.115], 12);
  for (const s of [1, -1]) {
    ell(WHITE, chest, [s * 0.058, 1.335, 0.095], [0.062, 0.058, 0.055], 8);
    torus(GOLD, chest, [s * 0.115, 1.27, 0.122], [0, 0, 1], 0.024, 0.007);
    glow(cyl(CYAN, chest, [s * 0.115, 1.27, 0.121], [0.017, 0.017], 0.012, { dir: [0, 0, 1] }, 8), 1.3);
    // side ribs lines
    box(STEEL, chest, [s * 0.172, 1.3, 0.0], [0.008, 0.2, 0.1]);
  }
  // teal tabard with coral edging
  b.extrude(
    [
      [-0.075, 0],
      [0.075, 0],
      [0.06, -0.15],
      [0, -0.27, "sharp"],
      [-0.06, -0.15],
    ],
    { at: [0, 1.43, 0.119], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: TEAL, bone: chest },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.077, 1.43, 0.127], [s * 0.062, 1.28, 0.127], 0.006, CORAL, { bone: chest });
    b.rod([s * 0.062, 1.28, 0.127], [0, 1.162, 0.127], 0.006, CORAL, { bone: chest });
  }
  glow(cyl(CYAN, chest, [0, 1.385, 0.128], [0.016, 0.016], 0.01, { dir: [0, 0, 1] }, 6), 1.4);
  torus(GOLD, chest, [0, 1.385, 0.129], [0, 0, 1], 0.024, 0.006);
  // belt
  cyl(SUIT, hips, [0, 1.03, 0], [0.152, 0.108], 0.05, {}, 16);
  cyl(GOLD, hips, [0, 1.03, 0.108], [0.036, 0.036], 0.018, { dir: [0, 0, 1] }, 12);
  cyl(SUIT, hips, [0, 1.03, 0.118], [0.02, 0.02], 0.01, { dir: [0, 0, 1] }, 8);
  for (const s of [1, -1]) {
    box(WHITE, hips, [s * 0.14, 1.03, 0.08], [0.06, 0.07, 0.04]);
    box(GOLD, hips, [s * 0.14, 1.03, 0.101], [0.02, 0.02, 0.006]);
  }
  // medical canister on left hip
  cyl(TEAL, hips, [0.19, 1.05, 0.06], [0.034, 0.034], 0.14, {}, 10);
  glow(cyl(CYAN, hips, [0.19, 1.05, 0.06], [0.026, 0.026], 0.146, {}, 8), 1.1);
  cyl(GOLD, hips, [0.19, 1.13, 0.06], [0.038, 0.038], 0.025, {}, 10);
  cyl(GOLD, hips, [0.19, 0.975, 0.06], [0.038, 0.038], 0.025, {}, 10);
  box(SUIT, hips, [0.17, 1.03, 0.06], [0.02, 0.05, 0.06]);
  // collar and neck
  b.sweep(neck, [0.04, 0.036, 0.034], { color: SKIN });
  cyl(WHITE, chest, [0, 1.495, 0], [0.08, 0.072], 0.075, {}, 12);
  torus(GOLD, chest, [0, 1.53, 0], [0, 1, 0], 0.075, 0.006);
  glow(torus(CYAN, chest, [0, 1.462, 0], [0, 1, 0], 0.082, 0.005), 1.2);

  // backpack unit
  box(SUIT, chest, [0, 1.3, -0.14], [0.22, 0.24, 0.07]);
  box(WHITE, chest, [0, 1.3, -0.178], [0.2, 0.2, 0.012]);
  for (let i = 0; i < 4; i++) glow(box(CYAN, chest, [0, 1.38 - i * 0.042, -0.186], [0.14, 0.012, 0.006]), 1.2);
  for (const s of [1, -1]) cyl(STEEL, chest, [s * 0.075, 1.17, -0.14], [0.022, 0.022], 0.06, {}, 8);

  // ---------------------------------------------------------------- arms
  const armR = (() => {
    const pts = limb([-0.2, 1.42, 0], [-0.36, 1.1, 0.16], [0.29, 0.27], [[-0.5, -0.3, -0.8]]);
    return { pts, ch: b.chain("armR", pts, { parent: chest, names: ["shoulderR", "elbowR", "handR"], role: "arm" }) };
  })();
  const armL = (() => {
    const pts = limb([0.2, 1.42, 0], [0.55, 1.12, 0.28], [0.29, 0.27], [[0, -0.6, -0.4]]);
    return { pts, ch: b.chain("armL", pts, { parent: chest, names: ["shoulderL", "elbowL", "handL"], role: "arm" }) };
  })();

  const EMBLEM = svg(
    `<svg viewBox="0 0 40 40"><rect x="2" y="2" width="36" height="36" rx="7" fill="#f5f0e4"/><rect x="2" y="2" width="36" height="36" rx="7" fill="none" stroke="#e0a93a" stroke-width="2.5"/><path d="M16 8h8v8h8v8h-8v8h-8v-8H8v-8h8z" fill="#e8483d"/></svg>`,
    { size: 128 },
  );
  const EMBLEM2 = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#2fb5a8"/><circle cx="20" cy="20" r="18" fill="none" stroke="#e0a93a" stroke-width="2.5"/><path d="M17 9h6v8h8v6h-8v8h-6v-8H9v-6h8z" fill="#f5f0e4"/></svg>`,
    { size: 128 },
  );

  for (const [arm, s] of [
    [armL, 1],
    [armR, -1],
  ] as const) {
    const [shoulder, elbow, hand] = arm.ch.joints;
    const [p0, p1, p2] = arm.pts;
    b.sweep(arm.ch, [0.052, 0.046, 0.04, 0.034, 0.032], { color: SUIT });
    // shoulder pauldron
    ell(WHITE, shoulder, [s * 0.225, 1.455, 0], [0.085, 0.065, 0.095], 10);
    const n = V(s, 0.5, 0).normalize();
    const c = V(s * 0.255, 1.5, 0);
    P(new THREE.CylinderGeometry(0.085, 0.085, 0.045, 12), WHITE, shoulder, c, { dir: n });
    torus(GOLD, shoulder, c, n, 0.088, 0.008);
    b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
      bone: shoulder,
      at: c.clone().addScaledVector(n, 0.0275),
      dir: n,
      axis: "z",
      texture: s > 0 ? EMBLEM : EMBLEM2,
    });
    // upper arm plating
    b.capsule(lerp(p0, p1, 0.18), lerp(p0, p1, 0.6), [0.058, 0.05], WHITE, { bone: shoulder });
    torus(GOLD, shoulder, lerp(p0, p1, 0.66), norm(p0, p1), 0.054, 0.007);
    // elbow
    ell(STEEL, elbow, p1, [0.048, 0.048, 0.048], 8);
    glow(torus(CYAN, elbow, p1, norm(p0, p1), 0.05, 0.006), 1.3);
    // forearm
    if (s > 0) {
      b.capsule(lerp(p1, p2, 0.15), lerp(p1, p2, 0.88), [0.05, 0.04], WHITE, { bone: elbow });
      glow(torus(CYAN, elbow, lerp(p1, p2, 0.55), norm(p1, p2), 0.046, 0.005), 1.3);
      torus(GOLD, elbow, lerp(p1, p2, 0.25), norm(p1, p2), 0.052, 0.006);
      glow(ell(CYAN, elbow, lerp(p1, p2, 0.4).add(V(0, 0.04, 0.0)), [0.012, 0.012, 0.012], 6), 1.5);
    } else {
      b.capsule(lerp(p1, p2, 0.5), lerp(p1, p2, 0.95), [0.046, 0.04], CORAL, { bone: elbow });
      torus(GOLD, elbow, lerp(p1, p2, 0.5), norm(p1, p2), 0.048, 0.006);
      torus(GOLD, elbow, lerp(p1, p2, 0.95), norm(p1, p2), 0.043, 0.006);
    }
    void hand;
  }

  // ---------------------------------------------------------------- open (left) cyborg hand
  {
    const [, elbow, handJ] = armL.ch.joints;
    const w = armL.pts[2];
    const d = norm(armL.pts[1], w);
    const side = V(0, 1, 0).cross(d).normalize();
    const thumb = side.clone().multiplyScalar(side.z >= 0 ? 1 : -1);
    const up = V(0, 1, 0);
    void elbow;
    box(WHITE, handJ, w.clone().addScaledVector(d, 0.05), [0.075, 0.022, 0.09], { dir: d, axis: "z" });
    box(SUIT, handJ, w.clone().addScaledVector(d, 0.04).addScaledVector(up, 0.013), [0.05, 0.006, 0.05], {
      dir: d,
      axis: "z",
    });
    glow(
      cyl(CYAN, handJ, w.clone().addScaledVector(d, 0.05).addScaledVector(up, 0.013), [0.016, 0.016], 0.006, {}, 8),
      1.5,
    );
    ell(STEEL, handJ, w, [0.034, 0.034, 0.034], 8);
    const lens = [0.07, 0.082, 0.076, 0.06];
    for (let i = 0; i < 4; i++) {
      const lat = (1.5 - i) * 0.0165;
      const base = w.clone().addScaledVector(d, 0.095).addScaledVector(thumb, lat);
      const mid = base.clone().addScaledVector(d, lens[i] * 0.6).addScaledVector(thumb, lat * 0.25).addScaledVector(up, 0.006);
      const tip = mid.clone().addScaledVector(d, lens[i] * 0.4).addScaledVector(thumb, lat * 0.2).addScaledVector(up, 0.013);
      const fj = b.joint(`fingerL${i + 1}`, { parent: handJ, at: base, aim: tip, role: "digit" });
      b.capsule(base, mid, [0.0085, 0.0075], WHITE, { bone: fj });
      b.capsule(mid, tip, [0.0075, 0.0055], STEEL, { bone: fj });
      glow(ell(CYAN, fj, mid, [0.006, 0.006, 0.006], 5), 1.4);
    }
    const tb = w.clone().addScaledVector(d, 0.03).addScaledVector(thumb, 0.04);
    const tt = tb.clone().addScaledVector(d, 0.05).addScaledVector(thumb, 0.045).addScaledVector(up, 0.012);
    const tj = b.joint("thumbL", { parent: handJ, at: tb, aim: tt, role: "digit" });
    b.capsule(tb, tt, [0.0095, 0.0065], WHITE, { bone: tj });
  }

  // ---------------------------------------------------------------- staff and the gripping (right) hand
  const handR = armR.ch.joints[2];
  const SX = -0.36;
  const SZ = 0.16;
  b.rod([SX, 0.14, SZ], [SX, 1.9, SZ], 0.02, SUIT, { bone: handR, caps: "flat" });
  b.spike([SX, 0.14, SZ], [0, -1, 0], 0.14, 0.028, GOLD, { bone: handR });
  glow(P(new THREE.OctahedronGeometry(0.032), CYAN, handR, [SX, 0.2, SZ], { scale: [1, 1.5, 1] }), 1.3);
  const sleeve = (y: number, h: number, r: number, c: C) => cyl(c, handR, [SX, y, SZ], [r, r], h, {}, 8);
  sleeve(0.78, 0.2, 0.032, WHITE);
  sleeve(0.5, 0.16, 0.03, WHITE);
  sleeve(1.36, 0.22, 0.032, WHITE);
  sleeve(1.74, 0.2, 0.032, WHITE);
  for (const y of [0.9, 0.66, 0.42, 1.25, 1.49, 1.62, 1.85]) torus(GOLD, handR, [SX, y, SZ], [0, 1, 0], 0.034, 0.006);
  glow(box(CYAN, handR, [SX, 0.32, SZ + 0.02], [0.012, 0.16, 0.008]), 1.3);
  glow(box(CYAN, handR, [SX, 1.38, SZ + 0.033], [0.012, 0.12, 0.008]), 1.3);
  glow(box(CYAN, handR, [SX, 0.78, SZ + 0.033], [0.012, 0.1, 0.008]), 1.3);
  box(TEAL, handR, [SX, 1.74, SZ + 0.033], [0.016, 0.08, 0.008]);
  // head of the staff
  const HX = SX;
  const HY = 1.92;
  cyl(GOLD, handR, [HX, HY, SZ], [0.04, 0.04], 0.05, {}, 8);
  torus(GOLD, handR, [HX, HY + 0.026, SZ], [0, 1, 0], 0.036, 0.008);
  glow(ell(CYAN, handR, [HX, HY + 0.085, SZ], [0.045, 0.045, 0.045], 10), 1.5);
  b.extrude(
    [
      [0, 0],
      [0.04, 0.1],
      [0.035, 0.28],
      [0, 0.4, "sharp"],
      [-0.035, 0.28],
      [-0.04, 0.1],
    ],
    { at: [HX, HY + 0.1, SZ], x: [1, 0, 0], thickness: 0.026, bevel: 0.006, color: WHITE, bone: handR },
  );
  glow(box(CYAN, handR, [HX, HY + 0.3, SZ + 0.015], [0.014, 0.12, 0.006]), 1.3);
  const horn: OutlinePoint[] = [
    [0.03, 0],
    [0.12, 0.05],
    [0.2, 0.2],
    [0.2, 0.4, "sharp"],
    [0.15, 0.3],
    [0.12, 0.18],
    [0.05, 0.1],
  ];
  const wing: OutlinePoint[] = [
    [0.02, 0],
    [0.1, -0.02],
    [0.17, 0.08],
    [0.13, 0.17, "sharp"],
    [0.08, 0.08],
  ];
  for (const s of [1, -1]) {
    b.extrude(horn, {
      at: [HX + s * 0.02, HY + 0.07, SZ],
      x: [s, 0, 0],
      thickness: 0.03,
      bevel: 0.006,
      color: WHITE,
      bone: handR,
    });
    b.extrude(wing, {
      at: [HX + s * 0.02, HY + 0.02, SZ],
      x: [s, 0, 0],
      thickness: 0.022,
      bevel: 0.005,
      color: TEAL,
      bone: handR,
    });
    b.rod([HX + s * 0.04, HY + 0.1, SZ + 0.016], [HX + s * 0.17, HY + 0.28, SZ + 0.016], 0.006, GOLD, { bone: handR });
  }
  const halo = (R: number, rot: number[], t: number) =>
    glow(P(new THREE.TorusGeometry(R, t, 4, 36), CYAN, handR, [HX, HY + 0.1, SZ], { rotation: rot }), 1.2);
  halo(0.17, [72, 0, 18], 0.004);
  halo(0.12, [-60, 0, -25], 0.003);
  const plusBase: Array<[number, number]> = [
    [-0.01, -0.03],
    [0.01, -0.03],
    [0.01, -0.01],
    [0.03, -0.01],
    [0.03, 0.01],
    [0.01, 0.01],
    [0.01, 0.03],
    [-0.01, 0.03],
    [-0.01, 0.01],
    [-0.03, 0.01],
    [-0.03, -0.01],
    [-0.01, -0.01],
  ];
  const plusAt: Array<[number, number, number, number]> = [
    [-0.62, 2.12, 0.2, 0.8],
    [-0.2, 2.3, 0.26, 0.55],
    [-0.58, 1.84, 0.28, 0.6],
    [-0.1, 2.05, 0.3, 0.45],
    [-0.5, 2.3, 0.22, 0.4],
  ];
  for (const [x, y, z, k] of plusAt)
    glow(
      b.extrude(
        plusBase.map(([u, v]): OutlinePoint => [u * k, v * k]),
        { at: [x, y, z], x: [1, 0, 0], thickness: 0.008, color: CYAN, bone: handR },
      ),
      1.4,
    );

  // fist wrapped on the pole
  ell(SUIT, handR, [SX - 0.012, 1.1, SZ - 0.025], [0.05, 0.055, 0.045], 8);
  for (let k = 0; k < 4; k++) ell(SKIN, handR, [SX, 1.135 - k * 0.024, SZ + 0.032], [0.026, 0.012, 0.014], 6);
  ell(SKIN, handR, [SX + 0.03, 1.15, SZ + 0.02], [0.012, 0.012, 0.03], 6);
  box(CORAL, handR, [SX - 0.012, 1.1, SZ - 0.06], [0.05, 0.03, 0.006]);

  // ---------------------------------------------------------------- coat
  const front: OutlinePoint[] = [
    [-0.09, 0],
    [0.09, 0],
    [0.11, -0.42],
    [0, -0.52, "sharp"],
    [-0.11, -0.42],
  ];
  b.extrude(front, { at: [0, 0.99, 0.15], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: WHITE, bone: hips });
  b.extrude(
    [
      [-0.03, 0],
      [0.03, 0],
      [0.045, -0.4],
      [0, -0.48, "sharp"],
      [-0.045, -0.4],
    ],
    { at: [0, 0.985, 0.165], x: [1, 0, 0], thickness: 0.012, color: TEAL, bone: hips },
  );
  b.rod([-0.085, 0.98, 0.162], [-0.1, 0.6, 0.162], 0.005, CORAL, { bone: hips });
  b.rod([0.085, 0.98, 0.162], [0.1, 0.6, 0.162], 0.005, CORAL, { bone: hips });
  for (const [x, y] of [
    [-0.06, 0.62],
    [0.06, 0.62],
  ])
    box(CORAL, hips, [x, y, 0.164], [0.03, 0.04, 0.008]);
  b.extrude(
    [
      [-0.17, 0],
      [0.17, 0],
      [0.3, -0.58],
      [0.15, -0.7],
      [-0.15, -0.7],
      [-0.3, -0.58],
    ],
    { at: [0, 1.0, -0.115], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: WHITE, bone: hips },
  );
  const BACK = svg(
    `<svg viewBox="0 0 60 70"><defs><clipPath id="c"><polygon points="13,0 47,0 60,58 45,70 15,70 0,58"/></clipPath></defs>
<g clip-path="url(#c)"><rect width="60" height="70" fill="#f5f0e4"/>
<path d="M0 42 L30 64 L60 42 L60 54 L30 76 L0 54Z" fill="#ec6a58"/>
<path d="M0 30 L30 52 L60 30 L60 36 L30 58 L0 36Z" fill="#2fb5a8"/>
<path d="M0 22 L30 44 L60 22 L60 25 L30 47 L0 25Z" fill="#e0a93a"/>
<path d="M26 6h8v8h8v8h-8v6h-8v-6h-8v-8h8z" fill="#ec6a58"/></g>
<polygon points="13,0 47,0 60,58 45,70 15,70 0,58" fill="none" stroke="#e0a93a" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.6, 0.7), "#ffffff", {
    bone: hips,
    at: [0, 0.65, -0.1275],
    dir: [0, 0, -1],
    axis: "z",
    texture: BACK,
  });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.1, 0],
        [0.12, 0],
        [0.2, -0.5],
        [0.05, -0.6],
        [-0.08, -0.4],
      ],
      {
        at: [s * 0.24, 0.99, 0.0],
        x: [0, 0, -1],
        y: [s * 0.2, 1, 0],
        thickness: 0.02,
        bevel: 0.004,
        color: WHITE,
        bone: hips,
      },
    );
    b.rod([s * 0.245, 0.985, 0.1], [s * 0.285, 0.5, 0.18], 0.005, CORAL, { bone: hips });
    b.rod([s * 0.245, 0.985, -0.07], [s * 0.3, 0.45, -0.3], 0.005, TEAL, { bone: hips });
  }

  // ---------------------------------------------------------------- head
  ell(SKIN, head, [0, 1.67, 0.02], [0.073, 0.088, 0.082], 12);
  ell(SKIN, jaw, [0, 1.62, 0.052], [0.05, 0.042, 0.05], 10);
  ell(SKIN, head, [0, 1.655, 0.1], [0.012, 0.016, 0.014], 6);
  ell(LIP, jaw, [0, 1.625, 0.096], [0.02, 0.007, 0.01], 6);
  const EYE = svg(
    `<svg viewBox="0 0 40 24"><ellipse cx="20" cy="13" rx="17" ry="9" fill="#ffffff"/><circle cx="20" cy="13" r="8" fill="#4f9a92"/><circle cx="20" cy="13" r="4" fill="#1b1b22"/><circle cx="23" cy="10" r="2.2" fill="#ffffff"/><path d="M2 14 Q20 -3 38 14" stroke="#2a2128" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.036, 0.022), "#ffffff", {
      bone: head,
      at: [s * 0.032, 1.68, 0.104],
      dir: [s * 0.15, 0, 1],
      axis: "z",
      texture: EYE,
    });
    b.rod([s * 0.014, 1.712, 0.1], [s * 0.052, 1.716, 0.088], 0.0035, INKC, { bone: head });
    // ear piece
    ell(GOLD, head, [s * 0.074, 1.67, 0.0], [0.016, 0.028, 0.028], 8);
    glow(ell(CYAN, head, [s * 0.088, 1.67, 0.0], [0.006, 0.014, 0.014], 6), 1.4);
  }
  // hair
  ell(HAIR, head, [0, 1.69, -0.012], [0.08, 0.088, 0.088], 12);
  ell(HAIR, head, [0, 1.745, 0.065], [0.05, 0.03, 0.035], 8);
  for (const s of [1, -1]) {
    ell(HAIR, head, [s * 0.04, 1.738, 0.056], [0.035, 0.03, 0.04], 8);
    ell(HAIR, head, [s * 0.075, 1.68, 0.03], [0.014, 0.05, 0.05], 8);
  }
  ell(HAIR, head, [0, 1.775, -0.085], [0.05, 0.05, 0.05], 8);
  b.sweep(
    catmull([
      [0, 1.78, -0.1],
      [0, 1.8, -0.15],
      [0, 1.76, -0.2],
      [0, 1.68, -0.215],
    ]),
    [0.04, 0.026, 0.006],
    { bone: head, color: HAIR, caps: { start: "round", end: "point" } },
  );
  for (let i = 0; i < 16; i++) {
    const th = i * 2.399;
    const ph = 0.25 + rand() * 0.9;
    const base = V(0.08 * Math.sin(ph) * Math.cos(th), 1.69 + 0.088 * Math.cos(ph), -0.012 + 0.088 * Math.sin(ph) * Math.sin(th));
    const out = base.clone().sub(V(0, 1.69, -0.012)).normalize().add(V(0, 0.15, -0.35)).normalize();
    b.spike(base, out, 0.035 + rand() * 0.025, 0.012, { bone: head, color: HAIR });
  }
  // headband
  P(new THREE.TorusGeometry(1, 0.1, 5, 24), GOLD, head, [0, 1.722, 0], { rotation: [90, 0, 0], scale: [0.078, 0.086, 0.1] });
  glow(ell(CYAN, head, [0, 1.735, 0.093], [0.012, 0.012, 0.006], 6), 1.5);

  return b.root;
}
