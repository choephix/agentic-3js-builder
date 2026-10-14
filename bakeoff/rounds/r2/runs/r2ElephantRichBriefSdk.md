```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Elephant Calf",
  description:
    "A gentle African elephant calf with dusty slate-grey wrinkled skin, big pink-flushed ears, a curling trunk, baby tusks, long lashes and a tufted tail.",
};

const SKIN = "#8a7b78";
const SKIN_D = "#6f6361";
const SKIN_L = "#9d8579";
const PINK = "#d99a9a";
const NAIL = "#e8dccb";
const TUSK = "#f1ead8";
const EYE = "#4a2a17";

function ell(c: number[], r: number[], seg = 12, rot?: [number, number]) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 4));
  g.scale(r[0], r[1], r[2]);
  if (rot) g.rotateY(rot[0]);
  g.translate(c[0], c[1], c[2]);
  return g;
}

function seg(a: number[], bb: number[], r0: number, r1: number, n = 8) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...bb);
  const d = vb.clone().sub(va);
  const len = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, n, 1);
  g.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())
  );
  const m = va.clone().add(vb).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}

function cone(base: number[], tip: number[], r: number, n = 6) {
  return seg(base, tip, r, 0.004, n);
}

function ring(c: number[], dir: number[], R: number, t: number) {
  const g = new THREE.TorusGeometry(R, t, 4, 10);
  g.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(...dir).normalize()
    )
  );
  g.translate(c[0], c[1], c[2]);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "elephant_calf" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.85, -0.3] });
  const spine = b.joint("spine", { at: [0, 0.95, 0.25], parent: hips });
  const head = b.joint("head", { at: [0, 1.05, 0.7], parent: spine });
  const jaw = b.joint("jaw", { at: [0, 0.8, 0.85], parent: head });

  const tr: THREE.Object3D[] = [];
  const tp = [
    [0, 0.85, 1.1],
    [0, 0.6, 1.25],
    [0, 0.38, 1.35],
    [0, 0.25, 1.55],
    [0, 0.33, 1.75],
  ];
  let par: any = head;
  for (let i = 0; i < 4; i++) {
    par = b.joint("trunk" + (i + 1), { at: tp[i] as any, parent: par });
    tr.push(par);
  }

  const earL = b.joint("earL", { at: [0.3, 1.2, 0.62], parent: head });
  const earR = b.joint("earR", { at: [-0.3, 1.2, 0.62], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.95, -1.0], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.78, -1.12], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.6, -1.17], parent: tail2 });

  const legs: Record<string, any> = {};
  const defs: [string, number, number, any][] = [
    ["FL", 0.25, 0.42, spine],
    ["FR", -0.25, 0.42, spine],
    ["BL", 0.25, -0.55, hips],
    ["BR", -0.25, -0.55, hips],
  ];
  for (const [n, x, z, p] of defs) {
    const hip = b.joint("hip" + n, { at: [x, 0.85, z], parent: p });
    const knee = b.joint("knee" + n, { at: [x, 0.45, z], parent: hip });
    const foot = b.joint("foot" + n, { at: [x, 0.1, z], parent: knee });
    legs[n] = { hip, knee, foot, x, z };
  }

  // ---------- body ----------
  b.part(ell([0, 0.9, -0.05], [0.44, 0.46, 0.78], 14), SKIN, { bone: spine });
  b.part(ell([0, 0.78, -0.05], [0.4, 0.34, 0.7], 12), SKIN_L, { bone: spine });
  b.part(ell([0, 0.92, -0.55], [0.4, 0.42, 0.4], 12), SKIN, { bone: hips });
  // dusty back patch
  b.part(ell([0, 1.12, 0.0], [0.34, 0.22, 0.6], 10), "#94766a", { bone: spine });
  // wrinkle ridges around the barrel
  for (let i = 0; i < 6; i++) {
    const z = -0.5 + i * 0.22;
    b.part(ell([0, 0.9, z], [0.455, 0.47, 0.03], 12), SKIN_D, { bone: spine });
  }

  // ---------- head ----------
  b.part(ell([0, 1.05, 0.78], [0.36, 0.4, 0.38], 14), SKIN, { bone: head });
  b.part(ell([0, 1.3, 0.72], [0.26, 0.2, 0.26], 10), SKIN_L, { bone: head }); // forehead dome
  b.part(ell([0, 0.9, 0.95], [0.22, 0.2, 0.2], 10), SKIN, { bone: head }); // muzzle
  // cheeks
  for (const s of [1, -1]) b.part(ell([s * 0.27, 0.9, 0.85], [0.1, 0.14, 0.14], 8), SKIN_L, { bone: head });
  // lower jaw
  b.part(ell([0, 0.78, 0.9], [0.14, 0.07, 0.17], 8), SKIN_D, { bone: jaw });

  // eyes + lashes
  for (const s of [1, -1]) {
    b.part(ell([s * 0.3, 1.1, 0.97], [0.05, 0.05, 0.04], 8), EYE, { bone: head });
    b.part(ell([s * 0.32, 1.12, 1.0], [0.012, 0.012, 0.01], 5), "#ffffff", { bone: head });
    for (let i = 0; i < 6; i++) {
      const a = -0.9 + i * 0.36;
      const from = [s * (0.3 + Math.sin(a) * 0.045), 1.1 + Math.cos(a) * 0.05, 1.0];
      const to = [from[0] + s * Math.sin(a) * 0.05 + s * 0.02, from[1] + Math.cos(a) * 0.06, 1.03];
      b.part(seg(from, to, 0.006, 0.003, 4), "#2a1a12", { bone: head });
    }
    // brow ridge
    b.part(ell([s * 0.29, 1.19, 0.93], [0.08, 0.03, 0.06], 6), SKIN_D, { bone: head });
  }

  // tusks
  for (const s of [1, -1]) {
    b.part(cone([s * 0.15, 0.82, 1.0], [s * 0.19, 0.7, 1.2], 0.035), TUSK, { bone: head });
  }

  // ---------- ears ----------
  for (const [s, ej] of [[1, earL], [-1, earR]] as [number, any][]) {
    const rot = s * 0.55;
    const cx = s * 0.62, cy = 1.12, cz = 0.52;
    b.part(ell([cx, cy, cz], [0.04, 0.4, 0.34], 12, [rot, 0]), SKIN, { bone: ej });
    // pink inner flush (front-facing side)
    const g = new THREE.SphereGeometry(1, 12, 8);
    g.scale(0.03, 0.32, 0.26);
    g.translate(-s * 0.0, 0, 0);
    g.translate(-s * 0.03, -0.02, 0.0);
    g.rotateY(rot);
    g.translate(cx, cy, cz);
    b.part(g, PINK, { bone: ej });
    // rim
    b.part(ell([cx + s * 0.02, cy + 0.01, cz - 0.02], [0.03, 0.41, 0.35], 12, [rot, 0]), SKIN_D, { bone: ej });
    b.part(ell([cx, cy, cz], [0.045, 0.39, 0.33], 12, [rot, 0]), SKIN, { bone: ej });
  }

  // ---------- trunk ----------
  const rads = [0.14, 0.115, 0.09, 0.07, 0.045];
  for (let i = 0; i < 4; i++) {
    b.part(seg(tp[i], tp[i + 1], rads[i], rads[i + 1], 8), i % 2 ? SKIN_L : SKIN, { bone: tr[i] });
    b.part(ell(tp[i + 1], [rads[i + 1], rads[i + 1], rads[i + 1]], 8), SKIN, { bone: tr[i] });
    // wrinkle rings
    for (let k = 0; k < 2; k++) {
      const t = 0.3 + k * 0.4;
      const c = tp[i].map((v, j) => v + (tp[i + 1][j] - tp[i][j]) * t);
      const dir = tp[i + 1].map((v, j) => v - tp[i][j]);
      const r = rads[i] + (rads[i + 1] - rads[i]) * t;
      b.part(ring(c, dir, r, 0.012), SKIN_D, { bone: tr[i] });
    }
  }
  // tip finger and nostril
  b.part(cone([0, 0.35, 1.76], [0, 0.46, 1.8], 0.035), SKIN_L, { bone: tr[3] });
  b.part(ell([0, 0.3, 1.78], [0.025, 0.02, 0.02], 5), "#3b2f2e", { bone: tr[3] });

  // ---------- legs ----------
  for (const n of Object.keys(legs)) {
    const { hip, knee, foot, x, z } = legs[n];
    b.part(seg([x, 0.85, z], [x, 0.45, z], 0.17, 0.14, 8), SKIN, { bone: hip });
    b.part(seg([x, 0.45, z], [x, 0.12, z], 0.14, 0.155, 8), SKIN_L, { bone: knee });
    b.part(ell([x, 0.45, z], [0.15, 0.08, 0.15], 8), SKIN_D, { bone: knee });
    // wrinkles
    for (const y of [0.3, 0.2]) {
      b.part(ring([x, y, z], [0, 1, 0], 0.15, 0.012), SKIN_D, { bone: knee });
    }
    // foot pad
    const pad = new THREE.CylinderGeometry(0.17, 0.18, 0.12, 10);
    pad.translate(x, 0.06, z);
    b.part(pad, SKIN_D, { bone: foot });
    // toenails
    for (let k = -1; k <= 1; k++) {
      const a = k * 0.5;
      const nx = x + Math.sin(a) * 0.165;
      const nz = z + Math.cos(a) * 0.165;
      const g = new THREE.BoxGeometry(0.06, 0.05, 0.04);
      g.rotateY(a);
      g.translate(nx, 0.06, nz);
      b.part(g, NAIL, { bone: foot });
    }
  }

  // ---------- tail ----------
  b.part(seg([0, 0.95, -0.95], [0, 0.78, -1.12], 0.05, 0.035, 6), SKIN, { bone: tail1 });
  b.part(seg([0, 0.78, -1.12], [0, 0.6, -1.17], 0.035, 0.028, 6), SKIN, { bone: tail2 });
  b.part(seg([0, 0.6, -1.17], [0, 0.42, -1.18], 0.028, 0.022, 6), SKIN_D, { bone: tail3 });
  // tuft
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.part(
      cone([0, 0.44, -1.18], [Math.sin(a) * 0.05, 0.28 + (i % 2) * 0.03, -1.18 + Math.cos(a) * 0.05], 0.018, 4),
      "#3a2d2a",
      { bone: tail3 }
    );
  }

  return b.root;
}
```