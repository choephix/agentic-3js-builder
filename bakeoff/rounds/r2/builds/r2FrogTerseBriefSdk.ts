import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Green Frog",
  description: "A stylized sitting frog in a rest pose, with a separate jaw, folded hind legs, webbed feet and bulging golden eyes.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "frog" });

  const GREEN = "#5aa03c", DARK = "#3c7a2a", LIGHT = "#86c24e", BELLY = "#ece6b4";
  const GOLD = "#e8b52c", BLACK = "#111111", PINK = "#c9605e", SPOT = "#2f5f22";

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.034, -0.03] });
  const chest = b.joint("chest", { at: [0, 0.04, 0.02], parent: hips });
  const head = b.joint("head", { at: [0, 0.048, 0.05], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 0.04, 0.05], parent: head });

  const ell = (c: V, r: V, color: string, bone: any, seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 2));
    g.scale(r[0], r[1], r[2]);
    return b.part(g, color, { at: c, bone });
  };

  const seg = (a: V, c: V, r1: number, r2: number, color: string, bone: any) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const g = new THREE.CylinderGeometry(r2, r1, d.length(), 7);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    g.applyQuaternion(q);
    const m = A.clone().add(B).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return b.part(g, color, { at: [0, 0, 0], bone });
  };

  // ---- body ----
  const bc: V = [0, 0.033, -0.005], br: V = [0.04, 0.03, 0.056];
  ell(bc, br, GREEN, hips, 12);
  ell([0, 0.027, 0.004], [0.034, 0.024, 0.05], BELLY, hips, 10);
  ell([0, 0.04, 0.03], [0.03, 0.022, 0.03], GREEN, chest, 10);
  // dorsal ridges (lighter stripes along the sides)
  for (const s of [-1, 1]) {
    seg([s * 0.03, 0.058, -0.045], [s * 0.026, 0.063, 0.02], 0.004, 0.003, LIGHT, hips);
  }
  // dark back spots
  const spots: [number, number, number][] = [
    [0.0, 0.0, 0.2], [0.018, 0, -0.01], [-0.017, 0, -0.03], [0.012, 0, -0.05],
    [-0.008, 0, 0.0], [0.026, 0, 0.03], [-0.026, 0, 0.015], [0.0, 0, -0.07], [-0.02, 0, -0.06],
  ].map((p) => p as [number, number, number]);
  spots[0] = [0.0, 0, 0.02];
  for (const [x, , z] of spots) {
    const k = 1 - (x / br[0]) ** 2 - ((z + 0.005) / br[2]) ** 2;
    if (k <= 0) continue;
    const y = bc[1] + br[1] * Math.sqrt(k);
    ell([x, y - 0.001, z], [0.0065, 0.0025, 0.0075], SPOT, hips, 6);
  }

  // ---- head ----
  ell([0, 0.052, 0.068], [0.037, 0.017, 0.032], GREEN, head, 12);
  ell([0, 0.05, 0.098], [0.022, 0.011, 0.012], GREEN, head, 8);
  // nostrils
  for (const s of [-1, 1]) ell([s * 0.007, 0.058, 0.108], [0.0018, 0.0015, 0.0018], BLACK, head, 5);
  // lower jaw
  ell([0, 0.038, 0.077], [0.03, 0.007, 0.028], GREEN, jaw, 10);
  ell([0, 0.043, 0.075], [0.027, 0.002, 0.024], PINK, jaw, 8);
  ell([0, 0.032, 0.07], [0.022, 0.012, 0.022], BELLY, jaw, 8); // throat
  // tympanum and eyes
  for (const s of [-1, 1]) {
    ell([s * 0.034, 0.05, 0.05], [0.002, 0.007, 0.007], DARK, head, 7);
    const e: V = [s * 0.023, 0.07, 0.07];
    ell(e, [0.012, 0.012, 0.012], GREEN, head, 8);
    ell([e[0] + s * 0.001, e[1], e[2] + 0.004], [0.0105, 0.0105, 0.0105], GOLD, head, 9);
    ell([e[0] + s * 0.004, e[1] + 0.0005, e[2] + 0.0105], [0.0035, 0.0055, 0.0018], BLACK, head, 6);
    const lid = new THREE.SphereGeometry(0.0125, 9, 4, 0, Math.PI * 2, 0, Math.PI * 0.42);
    b.part(lid, DARK, { at: [e[0], e[1] + 0.001, e[2]], bone: head });
  }

  // ---- legs ----
  for (const s of [-1, 1]) {
    const n = s > 0 ? "L" : "R";
    // hind leg
    const hipP: V = [s * 0.03, 0.03, -0.045];
    const kneeP: V = [s * 0.066, 0.024, -0.005];
    const ankP: V = [s * 0.058, 0.007, -0.075];
    const hipJ = b.joint("hip" + n, { at: hipP, parent: hips });
    const kneeJ = b.joint("knee" + n, { at: kneeP, parent: hipJ });
    const ankJ = b.joint("ankle" + n, { at: ankP, parent: kneeJ });
    ell([s * 0.035, 0.03, -0.045], [0.017, 0.02, 0.025], DARK, hipJ, 8); // thigh muscle
    seg(hipP, kneeP, 0.016, 0.011, GREEN, hipJ);
    ell(kneeP, [0.011, 0.011, 0.011], DARK, kneeJ, 7);
    seg(kneeP, ankP, 0.01, 0.006, GREEN, kneeJ);
    ell([s * 0.06, 0.007, -0.072], [0.008, 0.006, 0.01], GREEN, ankJ, 7);
    // toes + webbing
    const tips: [number, number][] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i - 2) * 0.42;
      const L = 0.036 + (i === 1 || i === 3 ? 0.012 : 0) + (i === 2 ? 0.006 : 0);
      const st: V = [ankP[0], 0.004, -0.068];
      const tp: V = [ankP[0] + Math.sin(a) * L, 0.004, -0.068 + Math.cos(a) * L];
      tips.push([tp[0], tp[2]]);
      seg(st, tp, 0.0042, 0.003, GREEN, ankJ);
      ell(tp, [0.0048, 0.0042, 0.0048], LIGHT, ankJ, 6);
    }
    const sh = new THREE.Shape();
    sh.moveTo(ankP[0], 0.068);
    sh.lineTo(ankP[0], 0.068);
    sh.moveTo(ankP[0], 0.068);
    for (const [x, z] of tips) sh.lineTo(x * 0.98 + ankP[0] * 0.02, -z * 0.9 + 0.068 * 0.1 * 0 );
    sh.lineTo(ankP[0], 0.068);
    const wg = new THREE.ExtrudeGeometry(sh, { depth: 0.0015, bevelEnabled: false });
    wg.rotateX(-Math.PI / 2);
    b.part(wg, DARK, { at: [0, 0.0015, 0], bone: ankJ });

    // front leg
    const shP: V = [s * 0.034, 0.032, 0.035];
    const elP: V = [s * 0.05, 0.016, 0.02];
    const wrP: V = [s * 0.05, 0.006, 0.07];
    const shJ = b.joint("shoulder" + n, { at: shP, parent: chest });
    const elJ = b.joint("elbow" + n, { at: elP, parent: shJ });
    const wrJ = b.joint("wrist" + n, { at: wrP, parent: elJ });
    seg(shP, elP, 0.011, 0.008, GREEN, shJ);
    ell(elP, [0.008, 0.008, 0.008], DARK, elJ, 6);
    seg(elP, wrP, 0.008, 0.006, GREEN, elJ);
    ell(wrP, [0.007, 0.005, 0.008], GREEN, wrJ, 6);
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.42;
      const L = 0.02;
      const st: V = [wrP[0], 0.004, 0.072];
      const tp: V = [wrP[0] + Math.sin(a) * L, 0.004, 0.072 + Math.cos(a) * L];
      seg(st, tp, 0.003, 0.0026, GREEN, wrJ);
      ell(tp, [0.0042, 0.0035, 0.0042], LIGHT, wrJ, 6);
    }
  }

  return b.root;
}
