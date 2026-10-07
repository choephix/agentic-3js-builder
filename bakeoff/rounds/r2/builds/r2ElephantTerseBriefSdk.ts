import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Elephant",
  description: "Stylized African elephant built from primitives with a skeleton rig: trunk, tusks, ears, legs and tail.",
};

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const GRAY = "#8e8e95", DARK = "#74747b", IVORY = "#f2ebd3", PINK = "#d9a3a0", BLACK = "#1b1b1f";

  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  // skeleton
  const hips = b.joint("hips", { at: [0, 2.0, -0.7] });
  const chest = b.joint("chest", { at: [0, 2.1, 0.7], parent: hips });
  const neck = b.joint("neck", { at: [0, 2.3, 1.5], parent: chest });
  const head = b.joint("head", { at: [0, 2.4, 1.8], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.85, 2.15], parent: head });

  const tp = [[0, 2.0, 2.35], [0, 1.55, 2.85], [0, 1.0, 3.05], [0, 0.55, 3.0], [0, 0.25, 2.8]];
  const tj: any[] = [];
  tp.forEach((p, i) => tj.push(b.joint("trunk" + (i + 1), { at: p, parent: i ? tj[i - 1] : head })));

  // helpers
  const ell = (col: string, at: number[], s: number[], bone: any) =>
    b.part(new THREE.SphereGeometry(1, 12, 9).scale(s[0], s[1], s[2]), col, { at, bone });
  const seg = (a: number[], c: number[], r0: number, r1: number, col: string, bone: any, sides = 10) => {
    const A = V(a), C = V(c), d = C.clone().sub(A), len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, sides);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    b.part(g, col, { at: A.clone().add(C).multiplyScalar(0.5).toArray() as number[], bone });
  };

  // body
  ell(GRAY, [0, 2.05, 0], [0.95, 0.95, 1.7], chest);
  ell(GRAY, [0, 2.0, -0.9], [0.9, 0.9, 0.9], hips);
  ell(DARK, [0, 2.75, 0.4], [0.5, 0.2, 1.0], chest); // back ridge
  ell(GRAY, [0, 2.2, 1.45], [0.7, 0.75, 0.65], neck);

  // head
  ell(GRAY, [0, 2.4, 1.95], [0.65, 0.75, 0.7], head);
  ell(DARK, [0, 2.95, 1.85], [0.4, 0.2, 0.4], head); // forehead bump
  ell(GRAY, [0, 2.05, 2.3], [0.42, 0.35, 0.35], head); // upper mouth
  ell(PINK, [0, 1.88, 2.3], [0.3, 0.12, 0.28], jaw); // lower jaw
  for (const s of [1, -1]) {
    ell("#ffffff", [s * 0.5, 2.55, 2.3], [0.1, 0.1, 0.07], head);
    ell(BLACK, [s * 0.55, 2.55, 2.35], [0.06, 0.07, 0.05], head);
    // brow
    ell(DARK, [s * 0.5, 2.67, 2.3], [0.14, 0.05, 0.1], head);
    // tusks
    seg([s * 0.35, 2.0, 2.4], [s * 0.45, 1.65, 2.95], 0.1, 0.07, IVORY, head, 8);
    seg([s * 0.45, 1.65, 2.95], [s * 0.4, 1.55, 3.4], 0.07, 0.025, IVORY, head, 8);
    // ears
    const ej = b.joint(s > 0 ? "earL" : "earR", { at: [s * 0.6, 2.8, 1.5], parent: head });
    ell(DARK, [s * 1.1, 2.4, 1.2], [0.05, 0.85, 0.7], ej);
    ell(PINK, [s * 1.04, 2.35, 1.2], [0.04, 0.65, 0.5], ej);
  }

  // trunk
  const rs = [0.3, 0.25, 0.2, 0.15, 0.11];
  for (let i = 0; i < 4; i++) {
    seg(tp[i], tp[i + 1], rs[i], rs[i + 1], GRAY, tj[i], 10);
    ell(DARK, [(tp[i][0] + tp[i + 1][0]) / 2, (tp[i][1] + tp[i + 1][1]) / 2, (tp[i][2] + tp[i + 1][2]) / 2 + rs[i] * 0.9], [rs[i] * 0.8, 0.03, 0.06], tj[i]);
  }
  ell(PINK, [0, 0.22, 2.8], [0.09, 0.06, 0.09], tj[4]);

  // legs
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const n = (sz > 0 ? "F" : "B") + (sx > 0 ? "L" : "R");
      const x = sx * 0.62, z = sz > 0 ? 1.0 : -1.3;
      const hip = b.joint("hip" + n, { at: [x, 1.6, z], parent: sz > 0 ? chest : hips });
      const knee = b.joint("knee" + n, { at: [x, 0.85, z], parent: hip });
      const ank = b.joint("ankle" + n, { at: [x, 0.22, z], parent: knee });
      seg([x, 1.6, z], [x, 0.85, z], 0.38, 0.3, GRAY, hip, 12);
      seg([x, 0.85, z], [x, 0.22, z], 0.3, 0.3, GRAY, knee, 12);
      ell(DARK, [x, 0.85, z + 0.2], [0.26, 0.2, 0.15], knee);
      b.part(new THREE.CylinderGeometry(0.36, 0.38, 0.22, 12), DARK, { at: [x, 0.11, z], bone: ank });
      for (let k = -1; k <= 1; k++) {
        ell(IVORY, [x + k * 0.2, 0.1, z + 0.33], [0.07, 0.08, 0.05], ank);
      }
    }
  }

  // tail
  const tl = [[0, 2.35, -1.7], [0, 1.85, -1.95], [0, 1.4, -2.0], [0, 1.0, -2.0]];
  const tjn: any[] = [];
  for (let i = 0; i < 3; i++) {
    tjn.push(b.joint("tail" + (i + 1), { at: tl[i], parent: i ? tjn[i - 1] : hips }));
    seg(tl[i], tl[i + 1], 0.09 - i * 0.02, 0.07 - i * 0.02, GRAY, tjn[i], 6);
  }
  ell(BLACK, [0, 0.93, -2.0], [0.08, 0.14, 0.08], tjn[2]);

  return b.root;
}
