import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description: "Stylized low-poly male lion with a full mane, rigged in a standing rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(7);

  const TAN = "#c99a5b", LIGHT = "#e3c493", MANE = "#6b3d1e", MANE2 = "#8a5428",
    DARK = "#3b2326", EYE = "#e8b02a", WHITE = "#f3ead8", TUFT = "#3f2412", PINK = "#c9707a";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.98, -0.6] });
  const spine = b.joint("spine", { at: [0, 1.02, -0.05], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.05, 0.5], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.12, 0.75], parent: chest });
  const head = b.joint("head", { at: [0, 1.15, 1.05], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.04, 1.28], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.98, -0.95], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.9, -1.35], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.72, -1.7], parent: tail2 });
  const tail4 = b.joint("tail4", { at: [0, 0.52, -1.9], parent: tail3 });

  const legs: Record<string, THREE.Object3D | any> = {};
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const x = 0.26 * s;
    const sh = b.joint("shoulder" + n, { at: [x, 0.88, 0.55], parent: chest });
    const el = b.joint("elbow" + n, { at: [x, 0.5, 0.5], parent: sh });
    const wr = b.joint("wrist" + n, { at: [x, 0.2, 0.56], parent: el });
    const paw = b.joint("paw" + n, { at: [x, 0.06, 0.66], parent: wr });
    const hp = b.joint("hip" + n, { at: [x + 0.02 * s, 0.9, -0.65], parent: hips });
    const kn = b.joint("knee" + n, { at: [x + 0.02 * s, 0.55, -0.4], parent: hp });
    const an = b.joint("ankle" + n, { at: [x, 0.3, -0.78], parent: kn });
    const toe = b.joint("toes" + n, { at: [x, 0.06, -0.58], parent: an });
    legs[n] = { sh, el, wr, paw, hp, kn, an, toe };
  }

  // ---------- helpers ----------
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const ell = (c: number[], sc: number[], color: string, bone: any, seg = 8) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 2));
    g.scale(sc[0], sc[1], sc[2]);
    g.translate(c[0], c[1], c[2]);
    return b.part(g, color, { at: [0, 0, 0], bone });
  };
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, rs = 7) => {
    const va = V(a), vc = V(c);
    const len = va.distanceTo(vc);
    const g = new THREE.CylinderGeometry(r1, r0, len, rs, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vc.clone().sub(va).normalize());
    g.applyQuaternion(q);
    const m = va.clone().add(vc).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return b.part(g, color, { at: [0, 0, 0], bone });
  };
  const box = (c: number[], sz: number[], color: string, bone: any, rot: number[] = [0, 0, 0]) => {
    const g = new THREE.BoxGeometry(sz[0], sz[1], sz[2]);
    g.rotateX(rot[0]); g.rotateY(rot[1]); g.rotateZ(rot[2]);
    g.translate(c[0], c[1], c[2]);
    return b.part(g, color, { at: [0, 0, 0], bone });
  };

  // ---------- body ----------
  ell([0, 1.0, 0.25], [0.36, 0.4, 0.62], TAN, spine, 10);       // chest/ribs
  ell([0, 0.98, -0.4], [0.33, 0.36, 0.55], TAN, hips, 10);       // loins
  ell([0, 0.82, 0.0], [0.28, 0.25, 0.7], LIGHT, spine, 8);       // belly
  ell([0, 0.78, 0.7], [0.26, 0.3, 0.2], LIGHT, chest, 8);        // chest front
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const L = legs[n];
    ell([0.26 * s, 0.95, -0.68], [0.2, 0.34, 0.36], TAN, L.hp, 8); // haunch
    ell([0.27 * s, 0.85, 0.52], [0.17, 0.3, 0.26], TAN, L.sh, 8);  // shoulder
    // front leg
    seg([0.26 * s, 0.85, 0.55], [0.26 * s, 0.48, 0.5], 0.13, 0.1, TAN, L.sh);
    seg([0.26 * s, 0.48, 0.5], [0.26 * s, 0.2, 0.56], 0.1, 0.085, TAN, L.el);
    ell([0.26 * s, 0.07, 0.65], [0.1, 0.07, 0.15], LIGHT, L.paw, 7);
    for (const t of [-1, 0, 1]) ell([(0.26 + 0.045 * t) * s, 0.04, 0.78], [0.032, 0.03, 0.04], WHITE, L.paw, 5);
    ell([0.26 * s, 0.5, 0.42], [0.06, 0.07, 0.06], MANE, L.el, 6); // elbow tuft
    // hind leg
    seg([0.27 * s, 0.7, -0.62], [0.27 * s, 0.55, -0.4], 0.16, 0.11, TAN, L.hp);
    seg([0.27 * s, 0.55, -0.4], [0.27 * s, 0.3, -0.78], 0.11, 0.075, TAN, L.kn);
    seg([0.27 * s, 0.3, -0.78], [0.27 * s, 0.08, -0.62], 0.075, 0.07, LIGHT, L.an);
    ell([0.27 * s, 0.05, -0.55], [0.1, 0.06, 0.17], LIGHT, L.toe, 7);
    for (const t of [-1, 0, 1]) ell([(0.27 + 0.045 * t) * s, 0.04, -0.4], [0.032, 0.03, 0.04], WHITE, L.toe, 5);
  }

  // ---------- tail ----------
  seg([0, 0.98, -0.95], [0, 0.9, -1.35], 0.07, 0.055, TAN, tail1);
  seg([0, 0.9, -1.35], [0, 0.72, -1.7], 0.055, 0.045, TAN, tail2);
  seg([0, 0.72, -1.7], [0, 0.52, -1.9], 0.045, 0.04, TAN, tail3);
  ell([0, 0.4, -1.95], [0.09, 0.2, 0.09], TUFT, tail4, 7);
  ell([0, 0.28, -1.97], [0.06, 0.1, 0.06], TUFT, tail4, 6);

  // ---------- neck & mane ----------
  seg([0, 1.05, 0.6], [0, 1.15, 1.0], 0.24, 0.2, TAN, neck);
  const clumps = 54;
  for (let i = 0; i < clumps; i++) {
    const a = (i / clumps) * Math.PI * 2 + R() * 0.3;
    const ring = i % 2;
    const rx = (0.3 + 0.12 * ring) * (0.9 + R() * 0.2);
    const ry = (0.32 + 0.1 * ring) * (0.9 + R() * 0.2);
    const y = 1.1 + Math.sin(a) * ry - (Math.sin(a) < 0 ? 0.04 : 0);
    const x = Math.cos(a) * rx;
    const z = 0.88 - ring * 0.12 + (R() - 0.5) * 0.12;
    const g = new THREE.IcosahedronGeometry(0.1 + R() * 0.07, 0);
    g.scale(1, 1.2, 1.5);
    g.rotateZ(a + Math.PI / 2);
    g.translate(x, y, z);
    b.part(g, ring ? MANE : MANE2, { at: [0, 0, 0], bone: neck });
  }
  for (let i = 0; i < 10; i++) { // chest beard
    const x = (i / 9 - 0.5) * 0.5;
    const g = new THREE.IcosahedronGeometry(0.1 + R() * 0.04, 0);
    g.scale(1, 1.4, 1.2);
    g.translate(x, 0.78 - Math.abs(x) * 0.3, 0.88 + R() * 0.05);
    b.part(g, i % 2 ? MANE : MANE2, { at: [0, 0, 0], bone: neck });
  }
  ell([0, 1.2, 0.8], [0.3, 0.32, 0.18], MANE2, neck, 7);

  // ---------- head ----------
  ell([0, 1.16, 1.15], [0.2, 0.19, 0.2], TAN, head, 9);          // skull
  box([0, 1.1, 1.36], [0.19, 0.12, 0.2], LIGHT, head);           // muzzle upper
  box([0, 1.13, 1.28], [0.1, 0.1, 0.14], TAN, head);             // bridge
  box([0, 1.16, 1.47], [0.12, 0.06, 0.05], DARK, head);          // nose
  box([0, 1.21, 1.25], [0.07, 0.04, 0.2], TAN, head, [-0.2, 0, 0]);
  // brows
  for (const s of [1, -1]) {
    box([0.1 * s, 1.26, 1.28], [0.08, 0.035, 0.08], MANE2, head);
    ell([0.1 * s, 1.21, 1.28], [0.032, 0.032, 0.02], EYE, head, 6);
    ell([0.1 * s, 1.21, 1.298], [0.012, 0.022, 0.01], DARK, head, 5);
    // ears
    ell([0.17 * s, 1.33, 1.05], [0.07, 0.07, 0.035], TAN, head, 7);
    ell([0.17 * s, 1.33, 1.07], [0.045, 0.045, 0.02], PINK, head, 6);
    // whisker pads
    ell([0.07 * s, 1.07, 1.43], [0.05, 0.035, 0.05], WHITE, head, 6);
    for (const k of [0, 1, 2]) ell([0.07 * s, 1.07, 1.43], [0.0, 0.0, 0.0], WHITE, head, 3);
    for (const k of [-1, 0, 1]) {
      seg([0.1 * s, 1.08 + 0.015 * k, 1.44], [0.24 * s, 1.08 + 0.05 * k, 1.42], 0.004, 0.003, WHITE, head, 3);
    }
    box([0.045 * s, 1.0, 1.44], [0.015, 0.02, 0.015], DARK, head); // upper fangs base
    box([0.05 * s, 1.03, 1.44], [0.018, 0.05, 0.018], WHITE, head);
  }

  // ---------- lower jaw ----------
  box([0, 1.01, 1.36], [0.15, 0.05, 0.2], LIGHT, jaw);
  box([0, 1.03, 1.45], [0.1, 0.04, 0.04], DARK, jaw);
  ell([0, 1.04, 1.36], [0.06, 0.012, 0.1], PINK, jaw, 6);
  for (const s of [1, -1]) box([0.04 * s, 1.06, 1.45], [0.016, 0.04, 0.016], WHITE, jaw);

  return b.root;
}
