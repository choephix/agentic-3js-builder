```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Sleepy Koala",
  description: "A drowsy ash-grey koala hugging a eucalyptus branch, munching a leaf sprig.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(7);

  const GREY = "#8d9096", DGREY = "#6f7278", CREAM = "#efe6d2", PINK = "#c9a9a4";
  const NOSE = "#16130f", EYE = "#4a2c1a", CLAW = "#2b2623", BARK = "#7a5a3c";
  const LEAF1 = "#6f9f94", LEAF2 = "#85b3a4", LEAF3 = "#5a8a82";

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.22, -0.02] });
  const spine = b.joint("spine1", { at: [0, 0.36, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.48, 0.03], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.58, 0.05], parent: chest });
  const head = b.joint("head", { at: [0, 0.66, 0.06], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.6, 0.12], parent: head });

  const side = (s: number) => (s > 0 ? "L" : "R");
  const arm: Record<string, any> = {};
  const leg: Record<string, any> = {};
  const armPts: Record<string, number[][]> = {
    R: [[-0.2, 0.46, 0.08], [-0.25, 0.4, 0.22], [-0.12, 0.42, 0.3]],
    L: [[0.2, 0.46, 0.08], [0.27, 0.5, 0.2], [0.09, 0.6, 0.27]],
  };
  for (const s of [1, -1]) {
    const n = side(s);
    const p = armPts[n];
    const sh = b.joint("shoulder" + n, { at: p[0], parent: chest });
    const el = b.joint("elbow" + n, { at: p[1], parent: sh });
    const wr = b.joint("hand" + n, { at: p[2], parent: el });
    arm[n] = { sh, el, wr, p };
    const hp = b.joint("hip" + n, { at: [0.13 * s, 0.2, 0.0], parent: hips });
    const kn = b.joint("knee" + n, { at: [0.18 * s, 0.13, 0.17], parent: hp });
    const ft = b.joint("foot" + n, { at: [0.14 * s, 0.05, 0.28], parent: kn });
    leg[n] = { hp, kn, ft };
  }

  // ---- helpers ----
  const ell = (color: string, at: number[], sc: number[], bone: any, rot: number[] = [0, 0, 0], seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3));
    g.scale(sc[0], sc[1], sc[2]);
    g.rotateX(rot[0]); g.rotateY(rot[1]); g.rotateZ(rot[2]);
    return b.part(g, color, { at, bone });
  };
  const seg = (a: number[], c: number[], r1: number, r2: number, color: string, bone: any) => {
    const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const g = new THREE.CylinderGeometry(r2, r1, d.length(), 8, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    g.applyQuaternion(q);
    const m = A.clone().add(C).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return b.part(g, color, { at: [0, 0, 0], bone });
  };
  const claw = (at: number[], bone: any, tilt = 0) => {
    const g = new THREE.ConeGeometry(0.011, 0.05, 5);
    g.rotateX(Math.PI / 2 + tilt);
    return b.part(g, CLAW, { at, bone });
  };
  const leaf = (at: number[], bone: any, len: number, rot: number[], col: string) =>
    ell(col, at, [len * 0.38, 0.006, len], bone, rot, 8);

  // ---- body ----
  ell(GREY, [0, 0.27, -0.02], [0.2, 0.25, 0.19], spine, [0, 0, 0], 12);
  ell(GREY, [0, 0.16, -0.03], [0.21, 0.13, 0.2], hips, [0, 0, 0], 12);
  ell(CREAM, [0, 0.33, 0.1], [0.14, 0.2, 0.1], chest, [0, 0, 0], 12);
  ell(CREAM, [0, 0.46, 0.09], [0.12, 0.09, 0.07], chest);
  ell(DGREY, [0, 0.4, -0.15], [0.14, 0.2, 0.05], spine); // back shading
  ell(GREY, [0, 0.55, 0.04], [0.14, 0.09, 0.12], neck);

  // ---- head ----
  ell(GREY, [0, 0.67, 0.06], [0.2, 0.165, 0.17], head, [0, 0, 0], 14);
  ell(CREAM, [0, 0.62, 0.15], [0.12, 0.08, 0.07], head); // cheeks/muzzle
  ell("#a3a6ab", [0, 0.655, 0.18], [0.08, 0.09, 0.06], head);
  ell(NOSE, [0, 0.69, 0.235], [0.052, 0.075, 0.032], head, [0.25, 0, 0]); // big nose
  ell("#2e2a27", [0, 0.67, 0.255], [0.03, 0.03, 0.01], head);
  ell("#a3a6ab", [0, 0.745, 0.12], [0.08, 0.04, 0.06], head); // brow
  // lower jaw
  ell(CREAM, [0, 0.595, 0.155], [0.075, 0.035, 0.075], jaw);
  ell("#3a2326", [0, 0.618, 0.16], [0.05, 0.008, 0.05], jaw);
  // eyes, drowsy
  for (const s of [1, -1]) {
    ell(EYE, [0.085 * s, 0.7, 0.19], [0.026, 0.026, 0.015], head);
    ell("#ffffff", [0.09 * s, 0.704, 0.203], [0.007, 0.007, 0.004], head);
    ell(DGREY, [0.085 * s, 0.717, 0.195], [0.037, 0.02, 0.022], head, [0, 0, 0.1 * s]); // heavy lid
    ell(DGREY, [0.085 * s, 0.678, 0.19], [0.032, 0.008, 0.018], head); // bag
    // ears
    const ex = 0.19 * s;
    ell(GREY, [ex, 0.76, 0.0], [0.1, 0.1, 0.035], head, [0, 0.35 * s, 0], 12);
    ell(CREAM, [ex * 1.02, 0.76, 0.02], [0.082, 0.082, 0.03], head, [0, 0.35 * s, 0], 12);
    ell(PINK, [ex * 0.99, 0.76, 0.035], [0.05, 0.055, 0.02], head, [0, 0.35 * s, 0]);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ell(CREAM, [ex * 1.02 + Math.cos(a) * 0.09, 0.76 + Math.sin(a) * 0.09, 0.02 + Math.cos(a) * 0.015 * s], [0.026, 0.026, 0.02], head, [0, 0, 0], 6);
    }
  }

  // ---- arms ----
  for (const s of [1, -1]) {
    const n = side(s);
    const { sh, el, wr, p } = arm[n];
    ell(GREY, [p[0][0], p[0][1], p[0][2]], [0.075, 0.08, 0.075], sh);
    seg(p[0], p[1], 0.06, 0.05, GREY, sh);
    ell(GREY, p[1], [0.052, 0.052, 0.052], el);
    seg(p[1], p[2], 0.05, 0.042, DGREY, el);
    ell(DGREY, p[2], [0.06, 0.05, 0.06], wr);
    for (let i = -1; i <= 1; i++) {
      const fx = p[2][0] + i * 0.028, fy = p[2][1] + (n === "L" ? 0.03 : 0.0), fz = p[2][2] + 0.055;
      ell(DGREY, [fx, fy, fz - 0.015], [0.016, 0.016, 0.03], wr);
      claw([fx, fy - 0.005, fz + 0.03], wr, 0.3);
    }
  }

  // ---- legs ----
  for (const s of [1, -1]) {
    const n = side(s);
    const { hp, kn, ft } = leg[n];
    ell(GREY, [0.15 * s, 0.17, 0.03], [0.1, 0.1, 0.12], hp);
    seg([0.13 * s, 0.2, 0.0], [0.18 * s, 0.13, 0.17], 0.09, 0.06, GREY, hp);
    ell(GREY, [0.18 * s, 0.13, 0.17], [0.06, 0.06, 0.06], kn);
    seg([0.18 * s, 0.13, 0.17], [0.14 * s, 0.06, 0.27], 0.06, 0.045, DGREY, kn);
    ell(DGREY, [0.14 * s, 0.045, 0.3], [0.06, 0.045, 0.07], ft);
    for (let i = -1; i <= 1; i++) {
      ell(DGREY, [(0.14 + i * 0.026) * s, 0.04, 0.35], [0.014, 0.014, 0.025], ft);
      claw([(0.14 + i * 0.026) * s, 0.04, 0.385], ft, 0.1);
    }
  }

  // ---- eucalyptus branch (vertical) ----
  const bg = new THREE.CylinderGeometry(0.04, 0.055, 1.15, 8);
  b.part(bg, BARK, { at: [-0.12, 0.575, 0.33], bone: hips });
  const bg2 = new THREE.CylinderGeometry(0.058, 0.062, 0.1, 8);
  b.part(bg2, "#6a4c32", { at: [-0.12, 0.05, 0.33], bone: hips });
  const cols = [LEAF1, LEAF2, LEAF3];
  for (let i = 0; i < 14; i++) {
    const y = 0.75 + i * 0.03;
    const a = R() * Math.PI * 2;
    const l = 0.09 + R() * 0.04;
    leaf([-0.12 + Math.cos(a) * 0.11, y, 0.33 + Math.sin(a) * 0.11], hips, l,
      [(R() - 0.5) * 0.6, -a + Math.PI / 2, (R() - 0.5) * 0.5], cols[i % 3]);
  }
  // upper bare twig
  seg([-0.12, 1.1, 0.33], [-0.02, 1.25, 0.3], 0.02, 0.012, BARK, hips);
  for (let i = 0; i < 4; i++)
    leaf([-0.02 + i * 0.02, 1.25 + i * 0.01, 0.3 + i * 0.015], hips, 0.1, [0.2, i * 0.8, 0.3], cols[i % 3]);

  // ---- sprig in left hand, near mouth ----
  seg([0.09, 0.6, 0.27], [0.06, 0.66, 0.33], 0.009, 0.007, BARK, arm.L.wr);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    leaf([0.06 + Math.cos(a) * 0.05, 0.66 + Math.sin(a) * 0.03 + 0.02, 0.33 + Math.sin(a) * 0.04],
      arm.L.wr, 0.08, [Math.sin(a) * 0.5, a, Math.cos(a) * 0.4], cols[i % 3]);
  }
  // leaf bit in mouth
  leaf([0.015, 0.615, 0.225], jaw, 0.04, [0.1, 0.9, 0.2], LEAF2);

  return b.root;
}
```