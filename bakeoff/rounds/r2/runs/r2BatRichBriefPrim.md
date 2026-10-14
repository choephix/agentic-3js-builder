```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Fruit Bat with Fig",
  description:
    "A golden-brown fluffy fruit bat in flight with wings spread wide, clutching a half-eaten fig in its feet.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "fruitBat" });
  const R = rng(7);

  const Y = new THREE.Vector3(0, 1, 0);
  const quatTo = (d: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(Y, d.clone().normalize());

  // ---------- helpers (geometry baked in model space) ----------
  const rod = (a: V, c: V, r0: number, r1: number, color: string, bone: any, seg = 6) => {
    const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), seg);
    g.applyQuaternion(quatTo(d));
    const m = A.clone().add(C).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    b.part(g, color, { bone });
  };
  const blob = (p: V, s: V, color: string, bone: any, seg = 8) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 2));
    g.scale(s[0], s[1], s[2]);
    g.translate(p[0], p[1], p[2]);
    b.part(g, color, { bone });
  };
  const cone = (p: V, dir: V, len: number, r: number, color: string, bone: any, seg = 5) => {
    const d = new THREE.Vector3(...dir).normalize();
    const g = new THREE.ConeGeometry(r, len, seg);
    g.applyQuaternion(quatTo(d));
    const c = new THREE.Vector3(...p).add(d.clone().multiplyScalar(len / 2));
    g.translate(c.x, c.y, c.z);
    b.part(g, color, { bone });
  };
  const disc = (p: V, n: V, r: number, h: number, color: string, bone: any) => {
    const d = new THREE.Vector3(...n).normalize();
    const g = new THREE.CylinderGeometry(r, r, h, 10);
    g.applyQuaternion(quatTo(d));
    g.translate(p[0], p[1], p[2]);
    b.part(g, color, { bone });
  };

  // ---------- palette ----------
  const FUR = "#b87a30", FUR2 = "#d19a48", FUR3 = "#8f5a22", BELLY = "#e0b565";
  const WING = "#34343d", BONE = "#2a2a31", BLACK = "#0f0f12";

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.3, 0] });
  const chest = b.joint("chest", { at: [0, 0.31, 0.05], parent: root });
  const neck = b.joint("neck", { at: [0, 0.325, 0.11], parent: chest });
  const head = b.joint("head", { at: [0, 0.335, 0.15], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.31, 0.19], parent: head });

  // ---------- body ----------
  blob([0, 0.305, 0.0], [0.075, 0.07, 0.12], FUR, root, 9);
  blob([0, 0.318, 0.075], [0.08, 0.072, 0.07], FUR2, chest, 9);
  blob([0, 0.285, 0.02], [0.05, 0.04, 0.09], BELLY, root, 8);
  blob([0, 0.29, -0.08], [0.055, 0.05, 0.05], FUR3, root, 8);
  // neck ruff
  blob([0, 0.33, 0.115], [0.065, 0.06, 0.04], FUR2, neck, 8);
  // fluffy tufts
  for (let i = 0; i < 70; i++) {
    const th = R() * Math.PI * 2, ph = Math.acos(2 * R() - 1);
    const n: V = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    const z = -0.1 + R() * 0.22;
    const ex = z > 0.05 ? 0.08 : 0.072;
    const p: V = [n[0] * ex, 0.305 + n[1] * 0.07, z + n[2] * 0.03];
    const col = R() < 0.4 ? FUR2 : R() < 0.5 ? FUR : FUR3;
    const bn = z > 0.04 ? chest : root;
    cone(p, [n[0], n[1] * 0.6, n[2] * 0.5 - 0.5], 0.03, 0.011, col, bn, 4);
  }
  // chest ruff tufts
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    cone([Math.cos(a) * 0.05, 0.328 + Math.sin(a) * 0.045, 0.125], [Math.cos(a) * 0.5, Math.sin(a) * 0.5, -0.8], 0.035, 0.012, FUR2, neck, 4);
  }

  // ---------- head ----------
  blob([0, 0.337, 0.16], [0.047, 0.045, 0.045], FUR, head, 9);
  blob([0, 0.322, 0.205], [0.027, 0.024, 0.042], FUR2, head, 8); // muzzle
  blob([0, 0.328, 0.246], [0.016, 0.012, 0.01], BLACK, head, 6); // nose
  blob([0.007, 0.33, 0.254], [0.003, 0.003, 0.002], "#5a5a66", head, 4);
  blob([-0.007, 0.33, 0.254], [0.003, 0.003, 0.002], "#5a5a66", head, 4);
  blob([0, 0.292, 0.2], [0.02, 0.01, 0.035], FUR2, jaw, 7); // lower jaw
  blob([0, 0.287, 0.225], [0.01, 0.006, 0.012], BLACK, jaw, 5);
  rod([0, 0.304, 0.185], [0, 0.31, 0.24], 0.005, 0.004, "#5a2a2a", jaw, 4); // tongue hint
  for (const s of [1, -1]) {
    // eyes
    blob([s * 0.03, 0.347, 0.19], [0.015, 0.016, 0.014], BLACK, head, 8);
    blob([s * 0.034, 0.352, 0.2], [0.004, 0.004, 0.003], "#ffffff", head, 4);
    // brow fur
    blob([s * 0.03, 0.364, 0.185], [0.015, 0.006, 0.014], FUR3, head, 5);
    // ears
    const ear = new THREE.ConeGeometry(0.02, 0.07, 4);
    ear.rotateZ(-s * 0.3);
    ear.translate(s * 0.036, 0.4, 0.145);
    b.part(ear, FUR3, { bone: head });
    const inner = new THREE.ConeGeometry(0.012, 0.05, 4);
    inner.rotateZ(-s * 0.3);
    inner.translate(s * 0.036, 0.395, 0.152);
    b.part(inner, "#d98a80", { bone: head });
    // cheek fluff
    cone([s * 0.04, 0.32, 0.17], [s * 0.8, -0.3, -0.3], 0.03, 0.012, FUR2, head, 4);
    // whiskers
    rod([s * 0.015, 0.32, 0.23], [s * 0.05, 0.322, 0.245], 0.001, 0.001, BLACK, head, 3);
  }

  // ---------- wings ----------
  const hipPts: Record<number, V> = { 1: [0.05, 0.27, -0.1], [-1]: [-0.05, 0.27, -0.1] };
  for (const s of [1, -1]) {
    const k = s === 1 ? "L" : "R";
    const sh: V = [s * 0.07, 0.325, 0.06];
    const el: V = [s * 0.21, 0.355, 0.0];
    const wr: V = [s * 0.4, 0.375, 0.04];
    const tips: V[] = [
      [s * 0.6, 0.37, 0.31],
      [s * 0.89, 0.355, 0.18],
      [s * 0.97, 0.34, -0.05],
      [s * 0.8, 0.32, -0.29],
    ];
    const shoulder = b.joint("shoulder" + k, { at: sh, parent: chest });
    const elbow = b.joint("elbow" + k, { at: el, parent: shoulder });
    const wrist = b.joint("wrist" + k, { at: wr, parent: elbow });

    rod(sh, el, 0.014, 0.011, FUR, shoulder, 6);
    rod(el, wr, 0.011, 0.008, BONE, elbow, 6);
    blob(sh, [0.022, 0.02, 0.022], FUR2, shoulder, 6);
    blob(el, [0.013, 0.013, 0.013], BONE, elbow, 6);
    blob(wr, [0.014, 0.014, 0.014], BONE, wrist, 6);

    // fingers
    const fj: any[] = [];
    tips.forEach((t, i) => {
      const w = new THREE.Vector3(...wr), T = new THREE.Vector3(...t);
      const m = w.clone().lerp(T, 0.5);
      const mid: V = [m.x, m.y + 0.008, m.z];
      const f1 = b.joint(`finger${i + 1}${k}_1`, { at: mid, parent: wrist });
      const f2 = b.joint(`finger${i + 1}${k}_2`, { at: t, parent: f1 });
      fj.push(f1);
      rod(wr, mid, 0.0065, 0.005, BONE, wrist, 5);
      rod(mid, t, 0.005, 0.0022, BONE, f1, 5);
      blob(t, [0.004, 0.004, 0.004], BONE, f2, 4);
    });

    // thumb with hooked claw
    const thumbTip: V = [s * 0.425, 0.4, 0.105];
    const thumb = b.joint("thumb" + k, { at: wr, parent: wrist });
    rod(wr, thumbTip, 0.009, 0.007, BONE, thumb, 5);
    blob(thumbTip, [0.009, 0.009, 0.009], BONE, thumb, 5);
    cone(thumbTip, [s * 0.1, 0.5, 0.8], 0.028, 0.007, "#d8d0b8", thumb, 5);
    cone([thumbTip[0] + s * 0.003, thumbTip[1] + 0.014, thumbTip[2] + 0.022], [0, -0.6, 0.8], 0.016, 0.005, "#d8d0b8", thumb, 5);

    // membrane
    const H = hipPts[s];
    const W = new THREE.Vector3(...wr);
    const edge: THREE.Vector3[] = [];
    for (let i = 0; i < tips.length; i++) {
      edge.push(new THREE.Vector3(...tips[i]));
      const nxt = i < tips.length - 1 ? new THREE.Vector3(...tips[i + 1]) : new THREE.Vector3(...H);
      const mp = new THREE.Vector3(...tips[i]).lerp(nxt, 0.5);
      mp.lerp(W, 0.14);
      mp.y -= 0.012;
      edge.push(mp);
    }
    edge.push(new THREE.Vector3(...H));
    const tris: THREE.Vector3[][] = [];
    for (let i = 0; i < edge.length - 1; i++) tris.push([W, edge[i], edge[i + 1]]);
    const Hv = new THREE.Vector3(...H);
    tris.push([W, Hv, new THREE.Vector3(...sh)]);
    tris.push([Hv, new THREE.Vector3(...el), new THREE.Vector3(...sh)]);
    tris.push([Hv, W, new THREE.Vector3(...el)]);
    // forward membrane (propatagium) between shoulder, wrist, first finger
    tris.push([new THREE.Vector3(...sh), new THREE.Vector3(...el), new THREE.Vector3(s * 0.2, 0.37, 0.09)]);
    tris.push([new THREE.Vector3(s * 0.2, 0.37, 0.09), new THREE.Vector3(...el), W]);
    tris.push([new THREE.Vector3(s * 0.2, 0.37, 0.09), W, new THREE.Vector3(s * 0.5, 0.372, 0.17)]);
    tris.push([W, new THREE.Vector3(...tips[0]), new THREE.Vector3(s * 0.5, 0.372, 0.17)]);
    const pos: number[] = [];
    for (const t of tris) {
      const flip = s === 1;
      const [p0, p1, p2] = flip ? [t[0], t[2], t[1]] : t;
      // up-facing side then down-facing side (offset slightly)
      for (const p of [p0, p1, p2]) pos.push(p.x, p.y, p.z);
      for (const p of [p0, p2, p1]) pos.push(p.x, p.y, p.z);
    }
    const mg = new THREE.BufferGeometry();
    mg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    mg.computeVertexNormals();
    b.part(mg, WING, { bone: wrist });
  }

  // ---------- legs & fig ----------
  const figC: V = [0, 0.055, -0.1];
  blob(figC, [0.05, 0.056, 0.05], "#5c2b52", root, 9);
  blob([0, 0.03, -0.1], [0.04, 0.03, 0.04], "#6e3560", root, 8);
  blob([0, 0.105, -0.1], [0.012, 0.01, 0.012], "#4a7a3a", root, 5);
  rod([0, 0.1, -0.1], [0.004, 0.125, -0.098], 0.006, 0.004, "#6b4a28", root, 5);
  // bitten face
  const bn: V = [0, 0.45, 1];
  const bp: V = [0, 0.077, -0.065];
  disc(bp, bn, 0.036, 0.006, "#e6d6a0", root);
  disc([0, 0.079, -0.0625], bn, 0.029, 0.006, "#d4506a", root);
  disc([0, 0.0805, -0.061], bn, 0.016, 0.005, "#e88a98", root);
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + 0.3, rr = 0.012 + (i % 3) * 0.006;
    blob([Math.cos(a) * rr, 0.081 + Math.sin(a) * rr * 0.4, -0.06 + Math.sin(a) * rr * 0.9], [0.0025, 0.0025, 0.0025], "#f2d46a", root, 4);
  }

  for (const s of [1, -1]) {
    const k = s === 1 ? "L" : "R";
    const hip = b.joint("hip" + k, { at: [s * 0.04, 0.27, -0.07], parent: root });
    const knee = b.joint("knee" + k, { at: [s * 0.07, 0.205, -0.115], parent: hip });
    const ankle = b.joint("ankle" + k, { at: [s * 0.05, 0.14, -0.1], parent: knee });
    rod([s * 0.04, 0.27, -0.07], [s * 0.07, 0.205, -0.115], 0.016, 0.01, FUR, hip, 6);
    rod([s * 0.07, 0.205, -0.115], [s * 0.05, 0.14, -0.1], 0.01, 0.007, FUR3, knee, 6);
    blob([s * 0.07, 0.205, -0.115], [0.012, 0.012, 0.012], FUR3, knee, 5);
    blob([s * 0.05, 0.14, -0.1], [0.01, 0.01, 0.01], "#4a3a30", ankle, 5);
    const zs = [-0.032, 0, 0.032];
    zs.forEach((dz, i) => {
      const tipP: V = [s * 0.043, 0.08, -0.1 + dz];
      const toe = b.joint(`toe${i + 1}${k}`, { at: [s * 0.048, 0.115, -0.1 + dz * 0.6], parent: ankle });
      rod([s * 0.05, 0.14, -0.1], [s * 0.048, 0.115, -0.1 + dz * 0.6], 0.005, 0.0045, "#4a3a30", ankle, 4);
      rod([s * 0.048, 0.115, -0.1 + dz * 0.6], tipP, 0.0045, 0.0035, "#4a3a30", toe, 4);
      cone(tipP, [-s * 0.6, -0.5, 0], 0.012, 0.004, "#d8d0b8", toe, 4);
    });
  }

  return b.root;
}
```