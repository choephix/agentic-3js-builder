```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description: "A stylized male lion with a layered mane, rigged skeleton, separate jaw and tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(7);

  const TAN = "#d9a45b", LIGHT = "#ecc98a", MANE1 = "#6b3a1a", MANE2 = "#8a4d22",
    MANE3 = "#a8672d", PINK = "#c77b7b", DARK = "#2a1a10", WHITE = "#f4efe4", AMBER = "#e8b030";

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 1.0, -0.6] });
  const spine = b.joint("spine", { at: [0, 1.02, -0.1], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.05, 0.4], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.15, 0.62], parent: chest });
  const head = b.joint("head", { at: [0, 1.22, 0.85], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.1, 0.95], parent: head });

  const tailPts = [[0, 1.05, -1.0], [0, 1.05, -1.3], [0, 0.95, -1.6], [0, 0.78, -1.82], [0, 0.55, -1.9]];
  const tails: THREE.Object3D[] = [];
  let tp: any = hips;
  tailPts.forEach((p, i) => {
    tp = b.joint("tail" + (i + 1), { at: p as [number, number, number], parent: tp });
    tails.push(tp);
  });

  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const sh = b.joint("shoulder" + n, { at: [0.24 * s, 0.92, 0.45], parent: chest });
    const el = b.joint("elbow" + n, { at: [0.25 * s, 0.55, 0.42], parent: sh });
    const wr = b.joint("wrist" + n, { at: [0.25 * s, 0.2, 0.5], parent: el });
    const pw = b.joint("pawF" + n, { at: [0.25 * s, 0.05, 0.6], parent: wr });
    const hp = b.joint("hip" + n, { at: [0.25 * s, 0.95, -0.7], parent: hips });
    const kn = b.joint("knee" + n, { at: [0.26 * s, 0.6, -0.5], parent: hp });
    const hk = b.joint("ankle" + n, { at: [0.25 * s, 0.3, -0.85], parent: kn });
    const pb = b.joint("pawB" + n, { at: [0.25 * s, 0.05, -0.72], parent: hk });
    legs[n] = { sh, el, wr, pw, hp, kn, hk, pb };
  }

  // ---- helpers ----
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const place = (g: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part(g, color, { at: at as [number, number, number], bone });
  const ell = (c: string, at: number[], r: number[], bone: any, seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3));
    g.scale(r[0], r[1], r[2]);
    return place(g, c, at, bone);
  };
  const box = (c: string, at: number[], s: number[], bone: any) =>
    place(new THREE.BoxGeometry(s[0], s[1], s[2]), c, at, bone);
  const seg = (a: number[], bb: number[], r0: number, r1: number, c: string, bone: any) => {
    const A = V(a), B = V(bb), d = B.clone().sub(A), len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, 8);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    return place(g, c, A.add(B).multiplyScalar(0.5).toArray(), bone);
  };
  const cone = (c: string, at: number[], dir: number[], r: number, len: number, bone: any) => {
    const d = V(dir).normalize();
    const g = new THREE.ConeGeometry(r, len, 6);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d));
    return place(g, c, at, bone);
  };

  // ---- torso ----
  ell(TAN, [0, 1.0, -0.1], [0.33, 0.36, 0.75], spine);
  ell(TAN, [0, 1.02, 0.4], [0.36, 0.4, 0.4], chest);
  ell(TAN, [0, 1.0, -0.65], [0.34, 0.36, 0.34], hips);
  ell(LIGHT, [0, 0.76, 0.0], [0.26, 0.17, 0.8], spine);
  ell(LIGHT, [0, 0.74, 0.5], [0.24, 0.2, 0.3], chest);
  // spine ridge
  for (let i = 0; i < 6; i++) box(MANE1, [0, 1.36 - Math.abs(i - 2) * 0.01, -0.7 + i * 0.22], [0.06, 0.04, 0.14], spine);

  // ---- neck & mane ----
  seg([0, 1.1, 0.45], [0, 1.2, 0.85], 0.28, 0.24, TAN, neck);
  const manes = [MANE1, MANE2, MANE3];
  for (let layer = 0; layer < 3; layer++) {
    const count = 16 - layer * 2;
    for (let i = 0; i < count; i++) {
      const th = (i / count) * Math.PI * 2 + layer * 0.3;
      const rad = 0.3 + layer * 0.0 - layer * 0.05 + R() * 0.04;
      const cx = Math.cos(th) * (rad + 0.05), cy = Math.sin(th) * (rad + 0.03);
      const z = 0.62 + layer * 0.12 + (R() - 0.5) * 0.06;
      const at = [cx, 1.2 + cy - (cy < -0.1 ? 0.04 : 0), z];
      const dir = [Math.cos(th), Math.sin(th), -0.5];
      cone(manes[(i + layer) % 3], at, dir, 0.12 - layer * 0.015, 0.3 - layer * 0.04, neck);
      ell(manes[(i + layer + 1) % 3], [at[0] * 0.8, 1.2 + (at[1] - 1.2) * 0.8, z + 0.1], [0.14, 0.14, 0.16], neck, 7);
    }
  }
  // chest fringe
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.075;
    cone(MANE2, [x, 0.85, 0.72], [x * 0.5, -1, 0.3], 0.06, 0.25, chest);
  }

  // ---- head ----
  ell(TAN, [0, 1.22, 0.92], [0.22, 0.2, 0.22], head);
  ell(TAN, [0, 1.14, 1.12], [0.13, 0.09, 0.14], head);
  box(LIGHT, [0, 1.13, 1.2], [0.2, 0.11, 0.14], head);
  ell(LIGHT, [0.06, 1.1, 1.2], [0.07, 0.05, 0.06], head, 6);
  ell(LIGHT, [-0.06, 1.1, 1.2], [0.07, 0.05, 0.06], head, 6);
  box(TAN, [0, 1.3, 1.07], [0.1, 0.1, 0.16], head); // nose bridge
  box(PINK, [0, 1.2, 1.28], [0.12, 0.07, 0.05], head); // nose
  box(DARK, [0, 1.15, 1.285], [0.015, 0.06, 0.02], head);
  box(DARK, [0, 1.3, 0.97], [0.3, 0.03, 0.03], head); // brow shade
  for (const s of [1, -1]) {
    ell(WHITE, [0.1 * s, 1.27, 1.06], [0.05, 0.045, 0.03], head, 6);
    ell(AMBER, [0.1 * s, 1.27, 1.085], [0.03, 0.03, 0.02], head, 6);
    box(DARK, [0.1 * s, 1.27, 1.1], [0.015, 0.03, 0.01], head);
    box(MANE1, [0.1 * s, 1.325, 1.08], [0.11, 0.025, 0.04], head);
    ell(TAN, [0.2 * s, 1.43, 0.85], [0.07, 0.07, 0.045], head, 7);
    ell(PINK, [0.2 * s, 1.43, 0.88], [0.04, 0.04, 0.02], head, 6);
    cone(DARK, [0.07 * s, 1.14, 1.2], [0.3 * s, -1, 0.3], 0.01, 0.06, head);
    for (let w = 0; w < 3; w++) box(WHITE, [0.14 * s, 1.13 - w * 0.015, 1.18], [0.12, 0.004, 0.004], head);
    cone(WHITE, [0.07 * s, 1.07, 1.2], [0, -1, 0.1], 0.015, 0.05, head);
  }
  // ---- jaw ----
  box(LIGHT, [0, 1.06, 1.09], [0.17, 0.05, 0.24], jaw);
  box(PINK, [0, 1.085, 1.1], [0.14, 0.015, 0.2], jaw);
  box(LIGHT, [0, 1.04, 1.2], [0.12, 0.05, 0.05], jaw);
  for (const s of [1, -1]) cone(WHITE, [0.05 * s, 1.09, 1.19], [0, 1, 0], 0.014, 0.05, jaw);

  // ---- legs ----
  for (const n of ["L", "R"]) {
    const L = legs[n];
    const s = n === "L" ? 1 : -1;
    const x = 0.25 * s;
    // front
    ell(TAN, [x, 0.85, 0.42], [0.17, 0.3, 0.2], L.sh);
    seg([x, 0.8, 0.43], [x, 0.22, 0.5], 0.15, 0.11, TAN, L.el);
    ell(MANE2, [x, 0.52, 0.38], [0.07, 0.06, 0.07], L.el, 6);
    ell(TAN, [x, 0.2, 0.52], [0.11, 0.12, 0.12], L.wr);
    box(LIGHT, [x, 0.04, 0.6], [0.18, 0.08, 0.26], L.pw);
    for (let t = -1; t <= 1; t++) box(DARK, [x + t * 0.055, 0.03, 0.735], [0.02, 0.04, 0.012], L.pw);
    // hind
    ell(TAN, [x, 0.8, -0.65], [0.2, 0.34, 0.3], L.hp);
    seg([x + 0.01 * s, 0.7, -0.55], [x, 0.32, -0.82], 0.14, 0.09, TAN, L.kn);
    seg([x, 0.32, -0.82], [x, 0.07, -0.72], 0.08, 0.09, TAN, L.hk);
    box(LIGHT, [x, 0.04, -0.62], [0.17, 0.08, 0.26], L.pb);
    for (let t = -1; t <= 1; t++) box(DARK, [x + t * 0.05, 0.03, -0.49], [0.02, 0.04, 0.012], L.pb);
  }

  // ---- tail ----
  for (let i = 0; i < tailPts.length - 1; i++) {
    seg(tailPts[i], tailPts[i + 1], 0.07 - i * 0.008, 0.06 - i * 0.008, TAN, tails[i]);
  }
  const tl = tailPts[tailPts.length - 1];
  ell(MANE1, [tl[0], tl[1] - 0.05, tl[2]], [0.1, 0.17, 0.1], tails[tails.length - 1]);
  cone(MANE2, [tl[0], tl[1] - 0.15, tl[2]], [0, -1, -0.2], 0.08, 0.14, tails[tails.length - 1]);

  b.root.userData.name = "lion";
  return b.root;
}
```