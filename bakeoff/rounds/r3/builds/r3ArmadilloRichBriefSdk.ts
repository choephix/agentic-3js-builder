import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "Standing rest-pose armadillo with a banded pink-tan shell, pointed snout, tall ears, clawed feet, a ringed tapering tail and pale hairs between the bands.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "armadillo" });
  const rand = rng(9);

  const C = {
    plate: "#c9a08a",
    plateAlt: "#b88f7a",
    shield: "#c29a86",
    stud: "#9c7461",
    belly: "#e4c9b4",
    skin: "#a9806c",
    skinDark: "#946b59",
    hair: "#f1e6d2",
    dark: "#1a1210",
    ear: "#b98672",
    earIn: "#d9a99a",
    claw: "#efe2cc",
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.14, -0.08] });
  const chest = b.joint("chest", { at: [0, 0.15, 0.1], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.17, 0.25], parent: chest });
  const head = b.joint("head", { at: [0, 0.18, 0.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.15, 0.35], parent: head });
  const earL = b.joint("earL", { at: [0.04, 0.22, 0.31], parent: head });
  const earR = b.joint("earR", { at: [-0.04, 0.22, 0.31], parent: head });

  const T: V[] = [
    [0, 0.16, -0.2],
    [0, 0.145, -0.33],
    [0, 0.12, -0.45],
    [0, 0.095, -0.56],
    [0, 0.07, -0.66],
  ];
  const tail1 = b.joint("tail1", { at: T[0], parent: hips });
  const tail2 = b.joint("tail2", { at: T[1], parent: tail1 });
  const tail3 = b.joint("tail3", { at: T[2], parent: tail2 });
  const tail4 = b.joint("tail4", { at: T[3], parent: tail3 });
  const tails = [tail1, tail2, tail3, tail4];

  // legs
  const legs: Record<string, any> = {};
  const legDefs = [
    { n: "frontL", s: 1, z: 0.17, p: chest, fz: 0.25 },
    { n: "frontR", s: -1, z: 0.17, p: chest, fz: 0.25 },
    { n: "hindL", s: 1, z: -0.14, p: hips, fz: -0.1 },
    { n: "hindR", s: -1, z: -0.14, p: hips, fz: -0.1 },
  ];
  for (const d of legDefs) {
    const hip: V = [d.s * 0.085, 0.125, d.z];
    const knee: V = [d.s * 0.1, 0.07, d.z + (d.fz > d.z ? 0.03 : -0.03)];
    const foot: V = [d.s * 0.105, 0.025, d.fz];
    const jh = b.joint("hip_" + d.n, { at: hip, parent: d.p });
    const jk = b.joint("knee_" + d.n, { at: knee, parent: jh });
    const jf = b.joint("foot_" + d.n, { at: foot, parent: jk });
    legs[d.n] = { d, hip, knee, foot, jh, jk, jf };
  }

  // ---------- helpers ----------
  const add = (geo: THREE.BufferGeometry, color: string, bone: any, at: V) =>
    b.part(geo, color, { at, bone });

  const seg = (a: V, c: V, r0: number, r1: number, color: string, bone: any, sides = 6) => {
    const dir = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(r1, r0, len, sides);
    geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
    return add(geo, color, bone, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2]);
  };

  const dome = (rx: number, ry: number, rz: number, w = 12, h = 5) => {
    const g = new THREE.SphereGeometry(1, w, h, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(rx, ry, rz);
    return g;
  };
  const ell = (rx: number, ry: number, rz: number, w = 10, h = 7) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(rx, ry, rz);
    return g;
  };

  // ---------- body ----------
  add(ell(0.115, 0.075, 0.28), C.belly, chest, [0, 0.135, 0.0]);
  add(ell(0.1, 0.06, 0.1), C.skin, hips, [0, 0.14, -0.15]);

  const baseY = 0.13;
  const R = (z: number) => 0.15 * Math.sqrt(Math.max(0, 1 - (z / 0.3) ** 2));

  // shoulder and rump shields
  const shields = [
    { z: 0.19, bone: chest, rz: 0.085 },
    { z: -0.2, bone: hips, rz: 0.085 },
  ];
  for (const s of shields) {
    const r = R(s.z - Math.sign(s.z) * 0.06) * 0.95;
    add(dome(r, r * 0.95, s.rz), C.shield, s.bone, [0, baseY, s.z]);
    // studs on the shield
    for (let ai = -3; ai <= 3; ai++) {
      for (let ei = 0; ei < 3; ei++) {
        const az = ai * 0.38;
        const el = 0.35 + ei * 0.42;
        const x = r * Math.cos(el) * Math.sin(az) * 1.0;
        const y = baseY + r * 0.95 * Math.sin(el);
        const zz = s.z + s.rz * Math.cos(el) * Math.cos(az) * 0.2 + Math.sign(s.z) * s.rz * 0.0;
        if (Math.abs(az) > 1.2 && ei === 2) continue;
        const g = new THREE.OctahedronGeometry(0.013, 0);
        g.scale(1, 0.6, 1);
        add(g, C.stud, s.bone, [x * 1.0, y * 1.0 + 0.002, zz + (ei - 1) * 0.0]);
      }
    }
  }

  // nine movable bands
  for (let i = 0; i < 9; i++) {
    const z = -0.125 + i * 0.03125;
    const r = R(z);
    const bone = z > 0.0 ? chest : hips;
    const col = i % 2 === 0 ? C.plate : C.plateAlt;
    add(dome(r, r * 0.93, 0.03, 14, 5), col, bone, [0, baseY, z]);
    // pale hairs poking out of the band edges
    for (const side of [1, -1]) {
      for (let k = 0; k < 3; k++) {
        const a = 0.1 + k * 0.42 + rand() * 0.1;
        const x = side * r * Math.cos(a) * 1.0;
        const y = baseY + r * 0.93 * Math.sin(a);
        const dir = new THREE.Vector3(side * Math.cos(a), Math.sin(a) * 0.8, 0.5 + rand() * 0.4).normalize();
        const g = new THREE.ConeGeometry(0.0035, 0.035, 4);
        g.translate(0, 0.0175, 0);
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
        add(g, C.hair, bone, [x, y, z + 0.022]);
      }
    }
  }
  // hairs on the belly sides
  for (let i = 0; i < 14; i++) {
    const z = -0.2 + i * 0.03;
    for (const side of [1, -1]) {
      const g = new THREE.ConeGeometry(0.003, 0.03, 4);
      g.translate(0, 0.015, 0);
      g.rotateZ(-side * 1.9);
      add(g, C.hair, z > 0 ? chest : hips, [side * 0.1, 0.12, z]);
    }
  }

  // ---------- head ----------
  seg([0, 0.165, 0.22], [0, 0.18, 0.31], 0.06, 0.05, C.skin, neck, 7);
  add(ell(0.055, 0.05, 0.07), C.skin, head, [0, 0.18, 0.33]);
  add(dome(0.058, 0.04, 0.075, 10, 4), C.shield, head, [0, 0.195, 0.33]);
  // snout (upper jaw)
  const snout = new THREE.ConeGeometry(0.046, 0.15, 6);
  snout.rotateX(Math.PI / 2);
  snout.scale(1, 0.7, 1);
  add(snout, C.skin, head, [0, 0.168, 0.43]);
  add(ell(0.014, 0.012, 0.014, 6, 4), C.dark, head, [0, 0.168, 0.505]);
  // lower jaw
  const lj = new THREE.ConeGeometry(0.03, 0.1, 6);
  lj.rotateX(Math.PI / 2);
  lj.scale(1, 0.55, 1);
  add(lj, C.skinDark, jaw, [0, 0.145, 0.4]);
  // eyes
  for (const s of [1, -1]) {
    add(ell(0.011, 0.011, 0.011, 6, 5), C.dark, head, [s * 0.047, 0.2, 0.37]);
    add(ell(0.004, 0.004, 0.004, 4, 3), C.hair, head, [s * 0.054, 0.204, 0.376]);
  }
  // ears
  for (const s of [1, -1]) {
    const bone = s > 0 ? earL : earR;
    const e = ell(0.012, 0.065, 0.036, 8, 6);
    e.rotateZ(-0.35 * s);
    add(e, C.ear, bone, [s * 0.05, 0.265, 0.305]);
    const ei = ell(0.007, 0.05, 0.026, 8, 6);
    ei.rotateZ(-0.35 * s);
    add(ei, C.earIn, bone, [s * 0.05 + s * 0.007, 0.262, 0.31]);
  }

  // ---------- legs ----------
  for (const k of Object.keys(legs)) {
    const L = legs[k];
    const s = L.d.s;
    const front = L.d.fz > L.d.z;
    seg(L.hip, L.knee, 0.036, 0.028, C.skin, L.jh, 6);
    add(ell(0.04, 0.04, 0.04, 6, 5), C.skin, L.jh, L.hip);
    seg(L.knee, L.foot, 0.028, 0.022, C.skinDark, L.jk, 6);
    // paw
    add(ell(0.03, 0.016, 0.035, 7, 5), C.skinDark, L.jf, [L.foot[0], 0.02, L.foot[2] + 0.012]);
    // claws
    const n = front ? 4 : 3;
    for (let c = 0; c < n; c++) {
      const off = (c - (n - 1) / 2) * 0.014;
      const g = new THREE.ConeGeometry(0.006, 0.04, 4);
      g.rotateX(Math.PI / 2 + 0.2);
      add(g, C.claw, L.jf, [L.foot[0] + off, 0.014, L.foot[2] + 0.055]);
    }
    void s;
  }

  // ---------- tail ----------
  const radii = [0.05, 0.039, 0.029, 0.019, 0.006];
  for (let i = 0; i < 4; i++) {
    const a = T[i], c = T[i + 1];
    const parts = 3;
    for (let p = 0; p < parts; p++) {
      const t0 = p / parts, t1 = (p + 1) / parts;
      const pa: V = [a[0], a[1] + (c[1] - a[1]) * t0, a[2] + (c[2] - a[2]) * t0];
      const pb: V = [a[0], a[1] + (c[1] - a[1]) * t1, a[2] + (c[2] - a[2]) * t1];
      const r0 = radii[i] + (radii[i + 1] - radii[i]) * t0;
      const r1 = radii[i] + (radii[i + 1] - radii[i]) * (t1 + 0.12);
      seg(pa, pb, r0 * 1.05, Math.max(0.004, r1), (i + p) % 2 === 0 ? C.plate : C.plateAlt, tails[i], 7);
    }
  }
  // tail ridge studs
  for (let i = 0; i < 4; i++) {
    const a = T[i], c = T[i + 1];
    for (let p = 0; p < 2; p++) {
      const t = 0.25 + p * 0.5;
      const g = new THREE.OctahedronGeometry(radii[i] * 0.3, 0);
      add(g, C.stud, tails[i], [0, a[1] + (c[1] - a[1]) * t + radii[i] * 0.85 * (1 - t * 0.4), a[2] + (c[2] - a[2]) * t]);
    }
  }
  const tip = new THREE.ConeGeometry(0.008, 0.05, 5);
  tip.rotateX(-Math.PI / 2 - 0.15);
  add(tip, C.stud, tail4, [0, 0.063, -0.69]);

  return b.root;
}
