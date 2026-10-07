import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Armadillo",
  description: "Stylized nine-banded armadillo with a banded shell, pointed snout, big ears, claws and a segmented tail, rigged with jaw, legs and tail joints.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  const SHELL = "#8b7967", BAND_A = "#6e5f51", BAND_B = "#a08e79", STUD = "#c2b29a";
  const SKIN = "#d3a995", SKIN_D = "#b88873", DARK = "#241c1a", CLAW = "#efe6d2";

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.15, 0] });
  const spine = b.joint("spine", { at: [0, 0.15, 0.05], parent: root });
  const neck = b.joint("neck", { at: [0, 0.16, 0.22], parent: spine });
  const head = b.joint("head", { at: [0, 0.16, 0.26], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.135, 0.3], parent: head });

  const legs: Record<string, { hip: any; knee: any; foot: any }> = {};
  const legDefs: [string, number, number][] = [
    ["FL", 0.095, 0.14], ["FR", -0.095, 0.14], ["BL", 0.095, -0.14], ["BR", -0.095, -0.14],
  ];
  for (const [n, x, z] of legDefs) {
    const hip = b.joint("hip" + n, { at: [x, 0.12, z], parent: spine });
    const knee = b.joint("knee" + n, { at: [x * 1.12, 0.065, z + (z > 0 ? 0.01 : -0.01)], parent: hip });
    const foot = b.joint("foot" + n, { at: [x * 1.15, 0.015, z + (z > 0 ? 0.03 : -0.01)], parent: knee });
    legs[n] = { hip, knee, foot };
  }
  const tailPts: [number, number, number][] = [
    [0, 0.13, -0.22], [0, 0.115, -0.31], [0, 0.092, -0.4], [0, 0.065, -0.48], [0, 0.04, -0.55],
  ];
  const tails: any[] = [];
  tailPts.slice(0, 4).forEach((p, i) => {
    tails.push(b.joint("tail" + (i + 1), { at: p, parent: i === 0 ? spine : tails[i - 1] }));
  });

  // ---------- helpers ----------
  const place = (geo: THREE.BufferGeometry, p: number[], s: number[] = [1, 1, 1], rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(p[0], p[1], p[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
      new THREE.Vector3(s[0], s[1], s[2]),
    );
    geo.applyMatrix4(m);
    return geo;
  };
  const ell = (p: number[], s: number[], color: string, bone: any, seg = 10) =>
    b.part(place(new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3)), p, s), color, { bone });
  const rod = (a: number[], c: number[], r1: number, r2: number, color: string, bone: any, seg = 7) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...c);
    const len = A.distanceTo(B);
    const g = new THREE.CylinderGeometry(r2, r1, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    return b.part(g, color, { bone });
  };
  const cone = (base: number[], tip: number[], r: number, color: string, bone: any, seg = 6) =>
    rod(base, tip, r, 0.001, color, bone, seg);

  // ---------- shell ----------
  const cy = 0.15, L = 0.25, cz = -0.02;
  const prof = (z: number) => Math.sqrt(Math.max(0.05, 1 - Math.pow((z - cz) / L, 2)));
  const band = (z: number, len: number, color: string) => {
    const f = prof(z);
    const g = new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, 0.42 * Math.PI, 1.16 * Math.PI);
    g.rotateX(Math.PI / 2);
    place(g, [0, cy, z], [0.165 * f, 0.155 * f, len]);
    b.part(g, color, { bone: spine });
    // studs along the band's crest
    for (let k = -3; k <= 3; k++) {
      const a = k * 0.36;
      ell([0.165 * f * Math.sin(a) * 1.0, cy + 0.155 * f * Math.cos(a) * 1.0, z], [0.011, 0.007, 0.012], STUD, spine, 5);
    }
  };
  // shoulder shield
  band(0.17, 0.085, SHELL);
  band(0.115, 0.05, SHELL);
  // movable middle bands
  const mids = [0.07, 0.03, -0.01, -0.05, -0.09];
  mids.forEach((z, i) => band(z, 0.046, i % 2 ? BAND_B : BAND_A));
  // pelvic shield
  band(-0.135, 0.06, SHELL);
  band(-0.19, 0.07, SHELL);
  band(-0.235, 0.04, BAND_A);

  // belly
  ell([0, 0.125, -0.01], [0.115, 0.06, 0.225], SKIN, spine, 10);
  // shield rims (skin edge showing between plates)
  ell([0, 0.2, 0.225], [0.12, 0.06, 0.03], SKIN_D, spine, 8);

  // ---------- head ----------
  ell([0, 0.165, 0.265], [0.062, 0.058, 0.075], SKIN, head, 10);
  // cap plate
  const cap = new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(place(cap, [0, 0.172, 0.26], [0.066, 0.052, 0.07]), SHELL, { bone: head });
  // snout
  rod([0, 0.158, 0.285], [0, 0.145, 0.375], 0.04, 0.016, SKIN, head, 7);
  ell([0, 0.143, 0.378], [0.017, 0.015, 0.014], DARK, head, 6);
  // jaw
  rod([0, 0.133, 0.3], [0, 0.128, 0.355], 0.026, 0.011, SKIN_D, jaw, 6);
  // eyes
  for (const s of [1, -1]) {
    ell([s * 0.05, 0.178, 0.29], [0.011, 0.013, 0.011], DARK, head, 6);
    ell([s * 0.054, 0.182, 0.294], [0.004, 0.004, 0.004], "#ffffff", head, 4);
    // ears: tall rounded flaps
    const ear = new THREE.SphereGeometry(1, 7, 5);
    b.part(place(ear, [s * 0.052, 0.225, 0.235], [0.015, 0.042, 0.026], 0, 0, -s * 0.35), SKIN_D, { bone: head });
    const inner = new THREE.SphereGeometry(1, 6, 4);
    b.part(place(inner, [s * 0.052, 0.224, 0.245], [0.009, 0.03, 0.012], 0, 0, -s * 0.35), "#e6bfae", { bone: head });
  }
  // neck skin
  ell([0, 0.16, 0.22], [0.075, 0.07, 0.04], SKIN, neck, 8);

  // ---------- legs ----------
  for (const [n, x, z] of legDefs) {
    const { hip, knee, foot } = legs[n];
    const front = z > 0;
    const kx = x * 1.12, fx = x * 1.15, fz = z + (front ? 0.03 : -0.01);
    ell([x, 0.115, z], [0.04, 0.045, 0.05], SKIN_D, hip, 7);
    rod([x, 0.115, z], [kx, 0.065, z + (front ? 0.01 : -0.01)], 0.032, 0.024, SKIN, hip, 6);
    rod([kx, 0.065, z + (front ? 0.01 : -0.01)], [fx, 0.02, fz], 0.024, 0.02, SKIN, knee, 6);
    ell([fx, 0.012, fz + 0.012], [0.026, 0.014, 0.04], SKIN_D, foot, 6);
    const nClaws = front ? 4 : 3;
    for (let c = 0; c < nClaws; c++) {
      const o = (c - (nClaws - 1) / 2) * 0.013;
      cone([fx + o, 0.012, fz + 0.04], [fx + o * 1.3, 0.004, fz + (front ? 0.095 : 0.08)], 0.006, CLAW, foot, 5);
    }
  }

  // ---------- tail ----------
  for (let i = 0; i < 4; i++) {
    const A = tailPts[i], B = tailPts[i + 1];
    const r1 = 0.045 - i * 0.009, r2 = 0.036 - i * 0.009 + (i === 3 ? 0.006 : 0);
    rod(A, B, r1, Math.max(0.008, r2), i % 2 ? BAND_B : SHELL, tails[i], 8);
    const m = [0, (A[1] + B[1]) / 2 + r1 * 0.85, (A[2] + B[2]) / 2];
    ell(m, [0.012, 0.008, 0.016], STUD, tails[i], 5);
    // ring plate
    ell([0, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2 + 0.01], [r1 * 1.05, r1 * 1.0, 0.012], BAND_A, tails[i], 8);
  }
  cone([0, 0.04, -0.55], [0, 0.03, -0.6], 0.016, SKIN_D, tails[3], 6);

  return b.root;
}
