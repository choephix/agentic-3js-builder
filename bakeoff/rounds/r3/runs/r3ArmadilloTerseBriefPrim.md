```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Armadillo",
  description: "Nine-banded armadillo with a banded shell, pointed snout, tall ears, clawed paws and a ringed tail, rigged with spine, jaw, ears, legs and tail joints.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo" });
  const SHELL = "#8b7a68", BAND = "#6b5d50", PLATE = "#a8957e", SKIN = "#c9a392",
    DARK = "#2e2523", CLAW = "#e8dcc8";

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.17, -0.1] });
  const chest = b.joint("chest", { at: [0, 0.17, 0.12], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.17, 0.27], parent: chest });
  const head = b.joint("head", { at: [0, 0.165, 0.33], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.135, 0.38], parent: head });
  const earL = b.joint("earL", { at: [0.045, 0.21, 0.31], parent: head });
  const earR = b.joint("earR", { at: [-0.045, 0.21, 0.31], parent: head });

  const tailPts = [[0, 0.16, -0.27], [0, 0.145, -0.37], [0, 0.12, -0.46], [0, 0.09, -0.55], [0, 0.06, -0.62]];
  const tails: any[] = [];
  tailPts.forEach((p, i) => {
    tails.push(b.joint("tail" + (i + 1), { at: p, parent: i ? tails[i - 1] : hips }));
  });

  const legs: any = {};
  const defs: [string, number, number][] = [["fL", 1, 0.15], ["fR", -1, 0.15], ["hL", 1, -0.15], ["hR", -1, -0.15]];
  for (const [n, s, z] of defs) {
    const par = z > 0 ? chest : hips;
    const hip = b.joint("hip" + n, { at: [0.1 * s, 0.13, z], parent: par });
    const knee = b.joint("knee" + n, { at: [0.12 * s, 0.07, z + 0.02], parent: hip });
    const ankle = b.joint("ankle" + n, { at: [0.12 * s, 0.025, z + 0.01], parent: knee });
    legs[n] = { hip, knee, ankle, s, z };
  }

  const seg = (a: number[], c: number[], r0: number, r1: number, col: string, bone: any, sides = 6) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    b.part(new THREE.CylinderGeometry(r1, r0, len, sides), col, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      dir: [d.x, d.y, d.z], bone,
    } as any);
  };
  const ell = (at: number[], sc: number[], col: string, bone: any, seg1 = 10) =>
    b.part(new THREE.SphereGeometry(1, seg1, 7), col, { at, scale: sc, bone } as any);

  // Belly and body
  ell([0, 0.115, 0], [0.15, 0.095, 0.29], SKIN, hips);
  // Shell: front shield, rear shield, nine bands
  ell([0, 0.185, 0.17], [0.16, 0.125, 0.11], SHELL, chest);
  ell([0, 0.18, -0.2], [0.155, 0.12, 0.1], SHELL, hips);
  for (let i = 0; i < 9; i++) {
    const z = 0.1 - i * 0.026;
    const f = Math.sqrt(Math.max(0.05, 1 - (z / 0.3) ** 2));
    const bone = z > 0.0 ? chest : hips;
    ell([0, 0.19, z], [0.172 * f + 0.004, 0.145 * f + 0.004, 0.02], i % 2 ? PLATE : BAND, bone, 12);
  }
  // Studs on shields
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const front = i % 2 === 0;
    const zc = front ? 0.17 : -0.2;
    const x = Math.cos(a) * 0.1, y = 0.19 + Math.abs(Math.sin(a)) * 0.1;
    ell([x, Math.min(y, 0.3), zc + Math.sin(a) * 0.04], [0.012, 0.008, 0.012], PLATE, front ? chest : hips, 5);
  }

  // Head
  ell([0, 0.165, 0.34], [0.058, 0.052, 0.07], SKIN, head);
  ell([0, 0.185, 0.35], [0.06, 0.04, 0.075], SHELL, head); // head shield
  b.part(new THREE.ConeGeometry(0.04, 0.12, 7), SKIN, { at: [0, 0.155, 0.43], dir: [0, 0, 1], bone: head } as any);
  ell([0, 0.153, 0.49], [0.016, 0.014, 0.014], DARK, head, 6);
  b.part(new THREE.BoxGeometry(0.04, 0.012, 0.09), SKIN, { at: [0, 0.133, 0.42], bone: jaw } as any);
  for (const s of [1, -1]) {
    ell([0.043 * s, 0.19, 0.385], [0.009, 0.009, 0.009], DARK, head, 6);
    // ears
    const ear = s > 0 ? earL : earR;
    ell([0.05 * s, 0.235, 0.31], [0.016, 0.045, 0.03], SKIN, ear, 7);
    ell([0.052 * s, 0.235, 0.318], [0.008, 0.032, 0.015], "#a77d70", ear, 6);
  }

  // Legs
  for (const n of Object.keys(legs)) {
    const { hip, knee, ankle, s, z } = legs[n];
    const front = z > 0;
    const h = [0.1 * s, 0.13, z], k = [0.12 * s, 0.07, z + 0.02], a = [0.12 * s, 0.03, z + 0.01];
    ell([0.1 * s, 0.13, z], [0.05, 0.05, 0.07], SKIN, hip, 8);
    seg(h, k, 0.035, 0.026, SKIN, hip);
    seg(k, a, 0.026, 0.022, SKIN, knee);
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.07), SKIN, { at: [0.12 * s, 0.015, z + 0.035], bone: ankle } as any);
    const cl = front ? 0.04 : 0.025;
    for (let c = -1; c <= 1; c++) {
      b.part(new THREE.ConeGeometry(0.008, cl, 5), CLAW, {
        at: [0.12 * s + c * 0.016, 0.014, z + 0.07 + cl / 2], dir: [0, -0.1, 1], bone: ankle,
      } as any);
    }
  }

  // Tail
  const rs = [0.05, 0.04, 0.03, 0.02, 0.008];
  for (let i = 0; i < 4; i++) {
    seg(tailPts[i], tailPts[i + 1], rs[i], rs[i + 1], i % 2 ? BAND : SHELL, tails[i], 7);
    const m = [0, (tailPts[i][1] + tailPts[i + 1][1]) / 2, (tailPts[i][2] + tailPts[i + 1][2]) / 2];
    if (i < 3) b.part(new THREE.TorusGeometry((rs[i] + rs[i + 1]) / 2 + 0.003, 0.006, 4, 8), PLATE, {
      at: m, dir: [0, 0.3, 1], bone: tails[i],
    } as any);
  }

  return b.root;
}
```