```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Green Sea Turtle",
  description:
    "A gliding green sea turtle with a heart-shaped scuted shell, long front flippers, a gentle beaked head, and a remora riding under its shell.",
};

export default function build() {
  const b = createBuilder({ name: "seaTurtle" });

  const OLIVE = "#6b6a2e";
  const CARAMEL = "#b9843a";
  const BROWN = "#4a3118";
  const BELLY = "#ecdc8c";
  const SKIN = "#6f8044";
  const SKIN_D = "#566535";
  const CREAM = "#efe3b8";
  const DARK = "#17120e";
  const BEAK = "#c9b274";

  const ell = (rx: number, ry: number, rz: number, ws = 10, hs = 7) => {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(rx, ry, rz);
    return g;
  };
  const dome = (rx: number, ry: number, rz: number) => {
    const g = new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(rx, ry, rz);
    return g;
  };

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.2, 0] });
  const neck = b.joint("neck", { at: [0, 0.2, 0.42], parent: root, role: "neck" });
  const head = b.joint("head", { at: [0, 0.21, 0.6], parent: neck, role: "head" });
  const jaw = b.joint("jaw", { at: [0, 0.185, 0.72], parent: head, role: "jaw" });

  const shoulderL = b.joint("shoulderL", { at: [0.27, 0.2, 0.25], parent: root, role: "arm" });
  const elbowL = b.joint("elbowL", { at: [0.55, 0.14, 0.17], parent: shoulderL, role: "arm" });
  const wristL = b.joint("wristL", { at: [0.85, 0.06, 0.06], parent: elbowL, role: "arm" });
  const shoulderR = b.joint("shoulderR", { at: [-0.27, 0.2, 0.25], parent: root, role: "arm" });
  const elbowR = b.joint("elbowR", { at: [-0.55, 0.14, 0.17], parent: shoulderR, role: "arm" });
  const wristR = b.joint("wristR", { at: [-0.85, 0.06, 0.06], parent: elbowR, role: "arm" });

  const hipL = b.joint("hipL", { at: [0.17, 0.17, -0.38], parent: root, role: "leg" });
  const ankleL = b.joint("ankleL", { at: [0.3, 0.11, -0.52], parent: hipL, role: "leg" });
  const hipR = b.joint("hipR", { at: [-0.17, 0.17, -0.38], parent: root, role: "leg" });
  const ankleR = b.joint("ankleR", { at: [-0.3, 0.11, -0.52], parent: hipR, role: "leg" });

  const tail1 = b.joint("tail1", { at: [0, 0.16, -0.48], parent: root, role: "tail" });
  const tail2 = b.joint("tail2", { at: [0, 0.13, -0.58], parent: tail1, role: "tail" });

  const remora = b.joint("remora", { at: [0, 0.06, 0.02], parent: root });
  const remoraTail = b.joint("remoraTail", { at: [0, 0.06, -0.1], parent: remora, role: "tail" });

  // ---------- shell ----------
  const C = new THREE.Vector3(0, 0.2, 0);
  const R = new THREE.Vector3(0.36, 0.2, 0.5);

  b.part(dome(R.x, R.y, R.z), BROWN, { at: [C.x, C.y, C.z], bone: root });
  // heart shoulders
  b.part(dome(0.27, 0.18, 0.3), BROWN, { at: [0.15, 0.2, 0.17], bone: root });
  b.part(dome(0.27, 0.18, 0.3), BROWN, { at: [-0.15, 0.2, 0.17], bone: root });
  // pointed rear
  b.part(dome(0.2, 0.14, 0.26), BROWN, { at: [0, 0.2, -0.36], bone: root });
  // plastron
  b.part(ell(0.34, 0.09, 0.46, 12, 6), BELLY, { at: [0, 0.18, 0.0], bone: root });
  b.part(ell(0.3, 0.02, 0.4, 10, 4), "#d4c070", { at: [0, 0.095, 0.0], bone: root });

  // stud placed on an ellipsoid surface at (x,z)
  const stud = (
    c: THREE.Vector3,
    r: THREE.Vector3,
    x: number,
    z: number,
    rad: number,
    base: string | null,
    top: string,
    bone: any,
    h = 0.02
  ) => {
    const t = 1 - (x / r.x) ** 2 - (z / r.z) ** 2;
    if (t <= 0.02) return;
    const y = c.y + r.y * Math.sqrt(t);
    const n = new THREE.Vector3(x / (r.x * r.x), (y - c.y) / (r.y * r.y), z / (r.z * r.z)).normalize();
    const p = new THREE.Vector3(x, y, z);
    if (base) {
      const pb = p.clone().addScaledVector(n, 0.002);
      b.part(new THREE.CylinderGeometry(rad * 1.12, rad * 1.12, h, 6), base, {
        at: [pb.x, pb.y, pb.z],
        dir: [n.x, n.y, n.z],
        bone,
      });
    }
    const pt = p.clone().addScaledVector(n, h * 0.5 + 0.002);
    b.part(new THREE.CylinderGeometry(rad * 0.88, rad * 0.88, h, 6), top, {
      at: [pt.x, pt.y, pt.z],
      dir: [n.x, n.y, n.z],
      bone,
    });
  };

  // vertebral scutes
  const vz = [0.33, 0.17, 0.0, -0.16, -0.3];
  const vr = [0.075, 0.085, 0.085, 0.075, 0.06];
  vz.forEach((z, i) => stud(C, R, 0, z, vr[i], BROWN, i % 2 ? CARAMEL : OLIVE, root, 0.025));
  // costal scutes
  const cz = [0.26, 0.07, -0.12, -0.28];
  cz.forEach((z, i) => {
    for (const s of [-1, 1]) {
      stud(C, R, s * 0.18, z, 0.085 - i * 0.006, BROWN, i % 2 ? OLIVE : CARAMEL, root, 0.025);
    }
  });
  // marginal scutes
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const x = R.x * 0.9 * Math.sin(a);
    const z = R.z * 0.9 * Math.cos(a);
    stud(C, R, x, z, 0.05, BROWN, i % 2 ? CARAMEL : OLIVE, root, 0.02);
  }

  // ---------- head & neck ----------
  b.part(ell(0.1, 0.085, 0.14, 10, 7), SKIN, { at: [0, 0.2, 0.5], bone: neck });
  const HC = new THREE.Vector3(0, 0.21, 0.66);
  const HR = new THREE.Vector3(0.1, 0.09, 0.13);
  b.part(ell(HR.x, HR.y, HR.z, 12, 8), SKIN, { at: [HC.x, HC.y, HC.z], bone: head });
  // brow ridge / cheeks
  for (const s of [-1, 1]) {
    b.part(ell(0.04, 0.035, 0.07, 8, 6), SKIN_D, { at: [s * 0.075, 0.18, 0.69], bone: head });
  }
  // head scales cream-edged
  const hs: [number, number, number][] = [
    [0, 0.0, 0.035],
    [0.045, -0.03, 0.028],
    [-0.045, -0.03, 0.028],
    [0.04, 0.045, 0.026],
    [-0.04, 0.045, 0.026],
    [0, 0.07, 0.024],
  ];
  hs.forEach(([x, dz, r]) => stud(HC, HR, x, dz, r, CREAM, SKIN_D, head, 0.012));
  // upper beak
  b.part(ell(0.065, 0.04, 0.07, 8, 6), BEAK, { at: [0, 0.2, 0.775], bone: head });
  b.part(ell(0.045, 0.012, 0.05, 6, 4), "#8f7a40", { at: [0, 0.178, 0.775], bone: head });
  // lower jaw
  b.part(ell(0.052, 0.022, 0.06, 8, 5), BEAK, { at: [0, 0.172, 0.755], bone: jaw });
  // nostrils
  for (const s of [-1, 1]) {
    b.part(ell(0.008, 0.008, 0.008, 5, 4), DARK, { at: [s * 0.02, 0.222, 0.835], bone: head });
  }
  // eyes
  for (const s of [-1, 1]) {
    b.part(ell(0.028, 0.026, 0.028, 8, 6), CREAM, { at: [s * 0.088, 0.235, 0.7], bone: head });
    b.part(ell(0.02, 0.022, 0.02, 8, 6), DARK, { at: [s * 0.101, 0.235, 0.71], bone: head });
    b.part(ell(0.006, 0.006, 0.006, 4, 3), "#ffffff", { at: [s * 0.108, 0.244, 0.724], bone: head });
    // heavy lid
    b.part(ell(0.032, 0.012, 0.034, 8, 4), SKIN_D, { at: [s * 0.09, 0.256, 0.7], bone: head });
  }

  // ---------- flippers ----------
  const seg = (a: number[], c: number[], w: number, t: number, color: string, bone: any) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    const g = new THREE.SphereGeometry(1, 10, 6);
    g.scale(w, len / 2, t);
    b.part(g, color, { at: m, dir: [d.x, d.y, d.z], bone });
  };

  for (const s of [1, -1]) {
    const sh = s > 0 ? shoulderL : shoulderR;
    const el = s > 0 ? elbowL : elbowR;
    const wr = s > 0 ? wristL : wristR;
    const P0 = [s * 0.25, 0.2, 0.27];
    const P1 = [s * 0.55, 0.14, 0.17];
    const P2 = [s * 0.9, 0.04, 0.0];
    b.part(ell(0.06, 0.06, 0.06, 6, 5), SKIN, { at: P0, bone: sh });
    seg(P0, P1, 0.085, 0.028, SKIN, sh);
    seg(P1, P2, 0.075, 0.02, SKIN, el);
    // leading-edge scales
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + i * 0.22;
      const px = P0[0] + (P2[0] - P0[0]) * t;
      const py = P0[1] + (P2[1] - P0[1]) * t + 0.018;
      const pz = P0[2] + (P2[2] - P0[2]) * t + 0.075;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 6), CREAM, {
        at: [px, py, pz],
        dir: [0, 1, 0.2],
        bone: i < 2 ? sh : el,
      });
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 6), SKIN_D, {
        at: [px, py + 0.004, pz],
        dir: [0, 1, 0.2],
        bone: i < 2 ? sh : el,
      });
    }
    // claw tip
    b.part(new THREE.ConeGeometry(0.015, 0.05, 5), BEAK, {
      at: [s * 0.93, 0.03, -0.01],
      dir: [s, -0.2, -0.3],
      bone: wr,
    });
  }

  // rear flippers
  for (const s of [1, -1]) {
    const hp = s > 0 ? hipL : hipR;
    const an = s > 0 ? ankleL : ankleR;
    const Q0 = [s * 0.16, 0.16, -0.36];
    const Q1 = [s * 0.44, 0.04, -0.66];
    seg(Q0, Q1, 0.09, 0.022, SKIN, hp);
    seg([s * 0.3, 0.1, -0.52], [s * 0.5, 0.025, -0.74], 0.07, 0.018, SKIN_D, an);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 6), CREAM, {
      at: [s * 0.3, 0.08, -0.5],
      dir: [0, 1, 0.1],
      bone: hp,
    });
  }

  // tail
  b.part(new THREE.ConeGeometry(0.04, 0.12, 6), SKIN, {
    at: [0, 0.15, -0.55],
    dir: [0, -0.2, -1],
    bone: tail1,
  });
  b.part(new THREE.ConeGeometry(0.022, 0.08, 5), SKIN_D, {
    at: [0, 0.12, -0.64],
    dir: [0, -0.2, -1],
    bone: tail2,
  });

  // ---------- remora ----------
  const RB = "#55697a";
  b.part(ell(0.035, 0.032, 0.12, 8, 6), RB, { at: [0, 0.055, 0.0], bone: remora });
  b.part(ell(0.036, 0.012, 0.12, 8, 4), CREAM, { at: [0, 0.035, 0.0], bone: remora });
  // dark side stripe
  b.part(ell(0.037, 0.008, 0.115, 8, 4), DARK, { at: [0, 0.058, 0.0], bone: remora });
  // sucker disc
  b.part(ell(0.03, 0.01, 0.085, 8, 4), "#2c3640", { at: [0, 0.088, 0.015], bone: remora });
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(0.05, 0.004, 0.008), "#8a9aa8", {
      at: [0, 0.097, -0.01 + i * 0.02],
      bone: remora,
    });
  }
  // eyes
  for (const s of [-1, 1]) {
    b.part(ell(0.007, 0.007, 0.007, 4, 3), DARK, { at: [s * 0.03, 0.065, 0.09], bone: remora });
  }
  // tail fin
  b.part(new THREE.ConeGeometry(0.035, 0.07, 4), RB, {
    at: [0, 0.055, -0.15],
    dir: [0, 0, -1],
    bone: remoraTail,
  });
  // pectoral fins
  for (const s of [-1, 1]) {
    b.part(ell(0.02, 0.004, 0.035, 5, 3), RB, {
      at: [s * 0.045, 0.045, 0.05],
      bone: remora,
    });
  }

  return b.root;
}
```