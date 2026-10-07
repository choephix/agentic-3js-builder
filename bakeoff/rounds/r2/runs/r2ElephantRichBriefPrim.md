```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Elephant Calf",
  description: "Gentle African elephant calf with dusty slate skin, big pink-flushed ears, curling trunk, baby tusks and lashes.",
};

export default function build() {
  const b = createBuilder({ name: "elephantCalf" });
  const SKIN = "#7b7d85", DUST = "#8d7a72", DARK = "#686a72", PINK = "#d99a9a", EAR = "#858289";
  const NAIL = "#d9d0c0", IVORY = "#efe6cf", EYE = "#4a2c1a", LASH = "#2a2224", TUFT = "#4a4448";

  const J: Record<string, any> = {};
  const j = (name: string, at: number[], parent?: string) => {
    J[name] = parent ? b.joint(name, { at, parent: J[parent] }) : b.joint(name, { at });
    return J[name];
  };
  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: string, dir?: number[]) => {
    const o: any = { at, bone: J[bone] };
    if (dir) o.dir = dir;
    return b.part(geo, color, o);
  };
  const ell = (rx: number, ry: number, rz: number, seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3));
    g.scale(rx, ry, rz);
    return g;
  };

  // skeleton
  j("hips", [0, 0.72, -0.3]);
  j("spine", [0, 0.8, 0.1], "hips");
  j("neck", [0, 0.88, 0.45], "spine");
  j("head", [0, 0.92, 0.6], "neck");
  j("jaw", [0, 0.68, 0.78], "head");
  const tp = [[0, 0.76, 0.88], [0, 0.55, 0.98], [0, 0.37, 1.06], [0, 0.22, 1.17], [0, 0.17, 1.32], [0, 0.25, 1.44]];
  tp.forEach((p, i) => j("trunk" + (i + 1), p, i === 0 ? "head" : "trunk" + i));
  j("tail1", [0, 0.82, -0.82], "hips");
  j("tail2", [0, 0.62, -0.88], "tail1");
  j("tail3", [0, 0.44, -0.9], "tail2");
  const sides: [string, number][] = [["L", 1], ["R", -1]];
  for (const [s, k] of sides) {
    j("shoulder" + s, [0.2 * k, 0.55, 0.3], "spine");
    j("elbow" + s, [0.2 * k, 0.32, 0.3], "shoulder" + s);
    j("hipJ" + s, [0.2 * k, 0.55, -0.4], "hips");
    j("knee" + s, [0.2 * k, 0.32, -0.4], "hipJ" + s);
    j("ear" + s, [0.28 * k, 1.0, 0.48], "head");
    j("eye" + s, [0.2 * k, 1.0, 0.82], "head");
  }

  // body
  P(ell(0.38, 0.42, 0.6), SKIN, [0, 0.78, -0.1], "hips");
  P(ell(0.4, 0.4, 0.4), SKIN, [0, 0.82, 0.2], "spine");
  P(ell(0.3, 0.3, 0.45, 8), DUST, [0, 1.0, -0.1], "hips"); // dusty back
  P(ell(0.18, 0.12, 0.2, 7), DUST, [0.2, 0.98, 0.2], "spine");
  P(ell(0.16, 0.1, 0.22, 7), DUST, [-0.22, 0.95, -0.25], "hips");
  P(ell(0.3, 0.2, 0.35, 8), "#9a9096", [0, 0.5, 0.0], "spine"); // pale belly
  // skin folds around the body
  for (let i = 0; i < 5; i++) {
    const g = new THREE.TorusGeometry(0.37, 0.018, 4, 12);
    g.scale(1, 1.1, 1);
    g.rotateY(Math.PI / 2);
    P(g, DARK, [0, 0.78, -0.4 + i * 0.16], i < 2 ? "hips" : "spine");
  }

  // neck and head
  P(ell(0.3, 0.3, 0.3), SKIN, [0, 0.9, 0.42], "neck");
  P(ell(0.3, 0.32, 0.32), SKIN, [0, 0.95, 0.62], "head");
  P(ell(0.2, 0.18, 0.18, 8), SKIN, [0, 1.17, 0.66], "head"); // forehead dome
  P(ell(0.14, 0.12, 0.12, 8), DUST, [0, 1.2, 0.62], "head");
  P(ell(0.12, 0.1, 0.12, 7), SKIN, [0, 0.74, 0.8], "head"); // trunk base
  P(new THREE.BoxGeometry(0.16, 0.05, 0.14), SKIN, [0, 0.66, 0.76], "jaw");
  // cheeks
  for (const [s, k] of sides) P(ell(0.1, 0.12, 0.12, 7), DARK, [0.22 * k, 0.82, 0.72], "head");

  // trunk
  const seg = (a: number[], c: number[], r1: number, r2: number, bone: string) => {
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const g = new THREE.CylinderGeometry(r2, r1, len, 8);
    P(g, SKIN, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], bone, d);
    P(new THREE.SphereGeometry(r2, 8, 6), SKIN, c, bone);
  };
  const tr = [0.12, 0.105, 0.09, 0.075, 0.062, 0.05];
  for (let i = 0; i < 5; i++) {
    seg(tp[i], tp[i + 1], tr[i], tr[i + 1], "trunk" + (i + 1));
    const m = [(tp[i][0] + tp[i + 1][0]) / 2, (tp[i][1] + tp[i + 1][1]) / 2, (tp[i][2] + tp[i + 1][2]) / 2];
    const d = [tp[i + 1][0] - tp[i][0], tp[i + 1][1] - tp[i][1], tp[i + 1][2] - tp[i][2]];
    const t = new THREE.TorusGeometry((tr[i] + tr[i + 1]) / 2 + 0.01, 0.012, 4, 8);
    t.rotateX(Math.PI / 2);
    P(t, DARK, m, "trunk" + (i + 1), d);
  }
  // trunk tip finger and nostril
  P(new THREE.ConeGeometry(0.03, 0.07, 6), "#a68a8a", [0, 0.31, 1.46], "trunk6" in J ? "trunk6" : "trunk5", [0, 1, 0.3]);
  P(new THREE.BoxGeometry(0.06, 0.02, 0.05), "#4a3a40", [0, 0.27, 1.46], "trunk5");

  // eyes, lashes, tusks, ears
  for (const [s, k] of sides) {
    const e = "eye" + s;
    P(new THREE.SphereGeometry(0.045, 8, 6), EYE, [0.2 * k, 1.0, 0.82], e);
    P(new THREE.SphereGeometry(0.012, 5, 4), "#ffffff", [0.22 * k, 1.015, 0.855], e);
    P(ell(0.05, 0.03, 0.05, 6), DARK, [0.2 * k, 1.045, 0.81], e); // upper lid
    for (let i = 0; i < 5; i++) {
      const a = -0.8 + i * 0.4;
      const dir = [k * 0.5 + Math.sin(a) * 0.1, 1, 0.5 + Math.cos(a) * 0.3];
      P(new THREE.ConeGeometry(0.007, 0.07, 4), LASH, [0.2 * k + Math.sin(a) * 0.03 * k, 1.07, 0.84 + a * 0.03], e, dir);
    }
    P(new THREE.ConeGeometry(0.035, 0.2, 6), IVORY, [0.14 * k, 0.7, 0.9], "head", [0.2 * k, -0.6, 0.8]);
    // ears: back plate, pink inner
    const ear = ell(0.025, 0.4, 0.34, 9);
    ear.translate(0.04 * k, -0.2, -0.05);
    ear.rotateZ(-0.3 * k);
    P(ear, EAR, [0.3 * k, 1.1, 0.5], "ear" + s);
    const inner = ell(0.02, 0.32, 0.26, 9);
    inner.translate(0.0 * k, -0.2, -0.04);
    inner.rotateZ(-0.3 * k);
    P(inner, PINK, [0.3 * k, 1.1, 0.5], "ear" + s);
    const rim = new THREE.TorusGeometry(0.01, 0.01, 3, 3);
    rim.scale(1, 1, 1);
    P(ell(0.03, 0.08, 0.1, 6), DARK, [0.33 * k, 1.17, 0.47], "ear" + s);
  }

  // legs
  const legs: [string, number, number, string, string][] = [
    ["L", 1, 0.3, "shoulderL", "elbowL"], ["R", -1, 0.3, "shoulderR", "elbowR"],
    ["L", 1, -0.4, "hipJL", "kneeL"], ["R", -1, -0.4, "hipJR", "kneeR"],
  ];
  for (const [, k, z, top, low] of legs) {
    const x = 0.2 * k;
    P(new THREE.CylinderGeometry(0.15, 0.16, 0.3, 8), SKIN, [x, 0.5, z], top);
    P(new THREE.CylinderGeometry(0.135, 0.15, 0.28, 8), SKIN, [x, 0.27, z], low);
    const w = new THREE.TorusGeometry(0.145, 0.014, 4, 9);
    w.rotateX(Math.PI / 2);
    P(w, DARK, [x, 0.38, z], low);
    P(w.clone(), DARK, [x, 0.22, z], low);
    P(new THREE.CylinderGeometry(0.145, 0.16, 0.1, 9), DUST, [x, 0.06, z], low);
    for (let i = -1; i <= 1; i++) {
      P(new THREE.BoxGeometry(0.05, 0.05, 0.03), NAIL, [x + i * 0.05, 0.045, z + 0.15 - Math.abs(i) * 0.015], low);
    }
  }

  // tail
  const tl = [[0, 0.82, -0.82], [0, 0.62, -0.88], [0, 0.44, -0.9]];
  seg(tl[0], tl[1], 0.04, 0.03, "tail1");
  seg(tl[1], tl[2], 0.03, 0.022, "tail2");
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    P(new THREE.ConeGeometry(0.014, 0.12, 4), TUFT, [Math.sin(a) * 0.025, 0.4, -0.9 + Math.cos(a) * 0.025], "tail3", [Math.sin(a) * 0.4, -1, Math.cos(a) * 0.4]);
  }
  P(new THREE.SphereGeometry(0.03, 6, 5), TUFT, [0, 0.42, -0.9], "tail3");

  return b.root;
}
```