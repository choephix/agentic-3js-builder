import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A stylized armadillo with a banded pinkish-tan shell, pointy snout, tall ears, clawed feet, a tapering armoured tail and coarse pale hairs between the bands.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  const SHELL = "#c49a86";
  const DARK = "#a9786a";
  const BELLY = "#e3c4b0";
  const SKIN = "#d9a894";
  const HAIR = "#f1e6d4";
  const CLAW = "#5b4a40";
  const EYE = "#150f0d";
  const INNER = "#e8a9a0";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.2, -0.15] });
  const chest = b.joint("chest", { at: [0, 0.21, 0.12], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.21, 0.3], parent: chest });
  const head = b.joint("head", { at: [0, 0.2, 0.38], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.16, 0.44], parent: head });
  const earL = b.joint("earL", { at: [0.055, 0.25, 0.37], parent: head });
  const earR = b.joint("earR", { at: [-0.055, 0.25, 0.37], parent: head });

  const tp = [
    [0, 0.19, -0.33],
    [0, 0.16, -0.48],
    [0, 0.12, -0.62],
    [0, 0.08, -0.76],
  ];
  const t1 = b.joint("tail1", { at: tp[0], parent: hips });
  const t2 = b.joint("tail2", { at: tp[1], parent: t1 });
  const t3 = b.joint("tail3", { at: tp[2], parent: t2 });
  const t4 = b.joint("tail4", { at: tp[3], parent: t3 });

  const legs: Record<string, any> = {};
  for (const [sn, s] of [["L", 1], ["R", -1]] as const) {
    for (const [fn, z, par] of [["front", 0.2, chest], ["rear", -0.25, hips]] as const) {
      const p = fn === "front" ? "F" : "R";
      const hip = b.joint(`${fn === "front" ? "shoulder" : "hip"}${sn}${p === "F" ? "" : ""}`, { at: [0.1 * s, 0.17, z], parent: par });
      const knee = b.joint(`${fn === "front" ? "elbow" : "knee"}${sn}`, { at: [0.11 * s, 0.09, z + 0.01], parent: hip });
      const foot = b.joint(`${fn === "front" ? "wrist" : "ankle"}${sn}`, { at: [0.11 * s, 0.03, z + 0.02], parent: knee });
      legs[`${fn}${sn}`] = { hip, knee, foot, s, z };
    }
  }

  // ---------- helpers ----------
  const seg = (a: number[], c: number[], r1: number, r2: number, color: string, bone: any, sides = 6) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    return b.part(new THREE.CylinderGeometry(r2, r1, len, sides), color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      dir: [d.x, d.y, d.z],
      bone,
    });
  };
  const ball = (at: number[], sc: number[], color: string, bone: any, seg_ = 8) =>
    b.part(new THREE.SphereGeometry(1, seg_, 6), color, { at, scale: sc, bone } as any);

  // ---------- body ----------
  ball([0, 0.15, 0.0], [0.1, 0.075, 0.3], BELLY, hips);
  ball([0, 0.19, 0.0], [0.12, 0.1, 0.3], SKIN, hips);

  // front scapular shield and rear pelvic shield
  ball([0, 0.2, 0.2], [0.145, 0.12, 0.1], SHELL, chest);
  ball([0, 0.2, -0.26], [0.14, 0.12, 0.1], SHELL, hips);

  // armour bands
  const r = rng(7);
  const prof = (z: number) => 0.15 * Math.sqrt(Math.max(0.35, 1 - (z / 0.38) ** 2));
  for (let i = 0; i < 9; i++) {
    const z = 0.13 - i * 0.043;
    const w = prof(z);
    const col = i % 2 === 0 ? DARK : SHELL;
    const bone = z > -0.02 ? chest : hips;
    ball([0, 0.19, z], [w, w * 0.82, 0.04], col, bone);
    // hairs poking out between bands
    for (const s of [1, -1]) {
      for (let k = 0; k < 2; k++) {
        const y = 0.17 + r() * 0.07;
        const hz = z - 0.02 + r() * 0.01;
        const out = [s * (0.7 + r() * 0.5), -0.3 + r() * 0.4, -0.2 - r() * 0.3];
        b.part(new THREE.ConeGeometry(0.003, 0.04 + r() * 0.02, 3), HAIR, {
          at: [s * (w * 0.88), y, hz],
          dir: out,
          bone,
        });
      }
    }
  }
  // central ridge of studs
  for (let i = 0; i < 10; i++) {
    const z = 0.2 - i * 0.045;
    b.part(new THREE.BoxGeometry(0.02, 0.012, 0.02), "#d8b4a2", {
      at: [0, 0.315 - Math.abs(z) * 0.12, z],
      bone: z > -0.02 ? chest : hips,
    });
  }

  // ---------- head ----------
  ball([0, 0.2, 0.37], [0.065, 0.06, 0.08], SKIN, head);
  // snout (upper) and lower jaw
  b.part(new THREE.ConeGeometry(0.052, 0.17, 6), SKIN, { at: [0, 0.195, 0.46], dir: [0, -0.1, 1], bone: head });
  b.part(new THREE.ConeGeometry(0.03, 0.1, 5), BELLY, { at: [0, 0.158, 0.46], dir: [0, 0, 1], bone: jaw });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), "#7a4a4a", { at: [0, 0.19, 0.55], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 6, 5), EYE, { at: [s * 0.055, 0.215, 0.41], bone: head });
    // ears
    const ej = s === 1 ? earL : earR;
    b.part(new THREE.BoxGeometry(0.05, 0.12, 0.014), SKIN, { at: [s * 0.07, 0.31, 0.365], dir: [s * 0.35, 1, -0.2], bone: ej });
    b.part(new THREE.BoxGeometry(0.03, 0.08, 0.016), INNER, { at: [s * 0.068, 0.305, 0.372], dir: [s * 0.35, 1, -0.2], bone: ej });
  }
  // neck
  seg([0, 0.2, 0.27], [0, 0.2, 0.36], 0.07, 0.06, SKIN, neck);

  // ---------- tail ----------
  const radii = [0.065, 0.05, 0.034, 0.018, 0.002];
  const tails = [hips, t1, t2, t3];
  const pts = [[0, 0.19, -0.3], ...tp];
  for (let i = 0; i < 4; i++) {
    seg(pts[i], pts[i + 1], radii[i], radii[i + 1], i % 2 ? SHELL : DARK, tails[i], 6);
    const m = [
      (pts[i][0] + pts[i + 1][0]) / 2,
      (pts[i][1] + pts[i + 1][1]) / 2,
      (pts[i][2] + pts[i + 1][2]) / 2,
    ];
    ball(m, [radii[i] * 1.05, radii[i] * 1.05, 0.02], DARK, tails[i], 6);
  }

  // ---------- legs ----------
  for (const key of Object.keys(legs)) {
    const { hip, knee, foot, s, z } = legs[key];
    const hp = [0.1 * s, 0.17, z];
    const kp = [0.11 * s, 0.09, z + 0.01];
    const fp = [0.11 * s, 0.03, z + 0.02];
    ball(hp, [0.055, 0.06, 0.06], SKIN, hip);
    seg(hp, kp, 0.04, 0.032, SKIN, hip);
    seg(kp, fp, 0.032, 0.028, SKIN, knee);
    // paw
    b.part(new THREE.BoxGeometry(0.06, 0.03, 0.08), SKIN, { at: [0.11 * s, 0.015, z + 0.045], bone: foot });
    for (let c = -1; c <= 1; c++) {
      b.part(new THREE.ConeGeometry(0.01, 0.045, 4), CLAW, {
        at: [0.11 * s + c * 0.02, 0.012, z + 0.1],
        dir: [c * 0.15, -0.2, 1],
        bone: foot,
      });
    }
  }

  return b.root;
}
