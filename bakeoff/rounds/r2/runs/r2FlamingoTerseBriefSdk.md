```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Flamingo",
  description:
    "A stylized pink flamingo in a rest pose: S-curved neck, bent two-tone beak with a separate lower jaw, long thin legs with webbed feet, and partly opened wings with black flight feathers.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  const PINK = "#f4a0ae";
  const PINK_D = "#e8708a";
  const PINK_L = "#f9c5cc";
  const LEG = "#e4808f";
  const BEAK = "#f6dcd2";
  const BLACK = "#1c1c22";
  const WHITE = "#fffaf0";
  const YELLOW = "#f2d23c";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.97, -0.02], role: "spine" } as any);
  const chest = b.joint("chest", { at: [0, 1.0, 0.18], parent: hips, role: "spine" } as any);

  const N: V[] = [
    [0, 1.02, 0.24],
    [0, 1.17, 0.35],
    [0, 1.31, 0.29],
    [0, 1.45, 0.34],
    [0, 1.6, 0.42],
  ];
  const neck: THREE.Object3D[] = [];
  let par: any = chest;
  for (let i = 0; i < 4; i++) {
    const j = b.joint("neck" + (i + 1), { at: N[i], parent: par, role: "neck" } as any);
    neck.push(j);
    par = j;
  }
  const head = b.joint("head", { at: N[4], parent: par, role: "head" } as any);
  const jaw = b.joint("jaw", { at: [0, 1.625, 0.47], parent: head, role: "jaw" } as any);
  const tail1 = b.joint("tail1", { at: [0, 0.96, -0.28], parent: hips, role: "tail" } as any);

  // ---------- geometry helpers ----------
  const Y = new THREE.Vector3(0, 1, 0);
  const Z = new THREE.Vector3(0, 0, 1);
  const vec = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);

  const seg = (a: V, c: V, r0: number, r1: number, color: string, bone: any, sides = 6, flat = 1) => {
    const A = vec(a), C = vec(c);
    const d = C.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, sides, 1);
    g.scale(1, 1, flat);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()));
    g.translate((A.x + C.x) / 2, (A.y + C.y) / 2, (A.z + C.z) / 2);
    b.part(g, color, { bone });
  };
  const ell = (c: V, r: V, color: string, bone: any, rotX = 0, rotY = 0, w = 8, h = 6) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(r[0], r[1], r[2]);
    g.rotateX(rotX);
    g.rotateY(rotY);
    g.translate(c[0], c[1], c[2]);
    b.part(g, color, { bone });
  };
  const feather = (base: V, dir: V, len: number, w: number, color: string, bone: any) => {
    const g = new THREE.BoxGeometry(w, 0.008, len);
    g.translate(0, 0, len / 2);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Z, vec(dir).normalize()));
    g.translate(base[0], base[1], base[2]);
    b.part(g, color, { bone });
  };

  // ---------- body ----------
  ell([0, 0.98, -0.03], [0.17, 0.17, 0.3], PINK, hips, -0.18);
  ell([0, 1.0, 0.13], [0.14, 0.15, 0.17], PINK, chest, -0.3);
  ell([0, 0.9, 0.02], [0.14, 0.1, 0.25], PINK_L, hips, -0.1); // paler belly
  ell([0, 0.94, -0.3], [0.1, 0.06, 0.17], PINK_D, tail1, 0.25);
  ell([0, 0.9, -0.42], [0.06, 0.035, 0.12], PINK_D, tail1, 0.3);
  // chest ruffle tufts
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.045;
    ell([x, 0.95 - Math.abs(i - 2) * 0.01, 0.27], [0.035, 0.05, 0.05], PINK_L, chest, -0.5);
  }

  // ---------- neck ----------
  for (let i = 0; i < 4; i++) {
    const r0 = 0.047 - i * 0.006;
    const r1 = 0.047 - (i + 1) * 0.006;
    seg(N[i], N[i + 1], r0, r1, PINK, neck[i], 7);
    ell(N[i + 1], [r1 * 1.05, r1 * 1.05, r1 * 1.05], PINK, neck[i], 0, 0, 7, 5);
  }
  ell(N[0], [0.055, 0.055, 0.055], PINK, neck[0], 0, 0, 7, 5);

  // ---------- head ----------
  ell([0, 1.63, 0.44], [0.045, 0.045, 0.06], PINK, head);
  for (const s of [1, -1]) {
    ell([s * 0.036, 1.64, 0.45], [0.016, 0.02, 0.02], YELLOW, head, 0, 0, 6, 5);
    ell([s * 0.045, 1.64, 0.455], [0.008, 0.012, 0.012], BLACK, head, 0, 0, 5, 4);
    // brow
    ell([s * 0.035, 1.665, 0.46], [0.014, 0.006, 0.025], PINK_D, head, 0, 0, 5, 4);
  }
  // upper beak: pale base, bends down, black tip
  seg([0, 1.635, 0.47], [0, 1.635, 0.55], 0.032, 0.026, BEAK, head, 6, 0.9);
  seg([0, 1.635, 0.55], [0, 1.6, 0.6], 0.026, 0.016, BLACK, head, 6, 0.9);
  seg([0, 1.6, 0.6], [0, 1.57, 0.615], 0.016, 0.004, BLACK, head, 5, 0.9);
  // lower beak on the jaw
  seg([0, 1.615, 0.47], [0, 1.608, 0.55], 0.024, 0.02, BEAK, jaw, 6, 0.8);
  seg([0, 1.608, 0.55], [0, 1.588, 0.585], 0.02, 0.01, BLACK, jaw, 5, 0.8);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const sf = s > 0 ? "L" : "R";
    const hipJ = b.joint("hip" + sf, { at: [s * 0.08, 0.88, 0], parent: hips, role: "leg" } as any);
    const kneeJ = b.joint("knee" + sf, { at: [s * 0.08, 0.48, -0.04], parent: hipJ, role: "leg" } as any);
    const ankleJ = b.joint("ankle" + sf, { at: [s * 0.08, 0.045, 0.03], parent: kneeJ, role: "leg" } as any);
    const toeJ = b.joint("toe" + sf, { at: [s * 0.08, 0.02, 0.05], parent: ankleJ, role: "digit" } as any);

    ell([s * 0.08, 0.86, 0], [0.065, 0.08, 0.09], PINK, hipJ);
    seg([s * 0.08, 0.86, 0], [s * 0.08, 0.48, -0.04], 0.026, 0.016, LEG, hipJ, 6);
    ell([s * 0.08, 0.48, -0.04], [0.025, 0.025, 0.025], PINK_D, kneeJ, 0, 0, 6, 5);
    seg([s * 0.08, 0.48, -0.04], [s * 0.08, 0.045, 0.03], 0.014, 0.012, LEG, kneeJ, 6);
    ell([s * 0.08, 0.045, 0.03], [0.022, 0.022, 0.022], PINK_D, ankleJ, 0, 0, 6, 5);

    // toes
    const tips: V[] = [
      [s * 0.08, 0.012, 0.18],
      [s * 0.08 + s * 0.075, 0.012, 0.145],
      [s * 0.08 - s * 0.075, 0.012, 0.145],
    ];
    const base: V = [s * 0.08, 0.016, 0.04];
    tips.forEach((t) => {
      seg(base, t, 0.012, 0.008, LEG, toeJ, 5);
      ell(t, [0.011, 0.01, 0.014], BLACK, toeJ, 0, 0, 5, 4); // claw
    });
    seg([s * 0.08, 0.012, 0.03], [s * 0.08 - s * 0.03, 0.012, -0.03], 0.012, 0.008, LEG, toeJ, 5); // hallux
    // web
    const wg = new THREE.BufferGeometry();
    const pts = [base, tips[1], tips[0], base, tips[0], tips[2]].map((p) => [p[0], 0.008, p[2]]);
    const arr: number[] = [];
    for (let i = 0; i < 6; i += 3) {
      arr.push(...pts[i], ...pts[i + 1], ...pts[i + 2]);
      arr.push(...pts[i], ...pts[i + 2], ...pts[i + 1]);
    }
    wg.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    wg.computeVertexNormals();
    b.part(wg, PINK_D, { bone: toeJ });
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const sf = s > 0 ? "L" : "R";
    const sh: V = [s * 0.16, 1.06, 0.05];
    const el: V = [s * 0.38, 1.05, -0.08];
    const wr: V = [s * 0.6, 1.0, -0.2];
    const shJ = b.joint("shoulder" + sf, { at: sh, parent: chest, role: "wing" } as any);
    const elJ = b.joint("elbow" + sf, { at: el, parent: shJ, role: "wing" } as any);
    const wrJ = b.joint("wrist" + sf, { at: wr, parent: elJ, role: "wing" } as any);

    seg(sh, el, 0.04, 0.032, PINK, shJ, 6);
    seg(el, wr, 0.032, 0.022, PINK, elJ, 6);
    ell(sh, [0.05, 0.05, 0.05], PINK, shJ, 0, 0, 6, 5);

    const back = (x: number, z: number): V => [s * x, 0, z];
    // long black flight feathers
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const bs: V = [s * (0.58 - t * 0.38), 1.0 + 0.01 * t, -0.2 + t * 0.22];
      const dir: V = [s * (0.45 - t * 0.35), -0.04, -0.7];
      feather(bs, dir, 0.36 - t * 0.04, 0.07, BLACK, i < 4 ? wrJ : elJ);
    }
    // pink coverts overlapping
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const bs: V = [s * (0.57 - t * 0.38), 1.03, -0.18 + t * 0.2];
      const dir: V = [s * (0.3 - t * 0.3), -0.02, -0.8];
      feather(bs, dir, 0.2, 0.075, i % 2 ? PINK_D : PINK, i < 3 ? wrJ : elJ);
    }
    // leading edge coverts
    ell([s * 0.5, 1.03, -0.15], [0.09, 0.02, 0.07], PINK_D, elJ, 0, s * -0.4, 6, 4);
    ell([s * 0.3, 1.075, -0.02], [0.1, 0.025, 0.08], PINK, elJ, 0, s * -0.3, 6, 4);
    void back;
  }

  return b.root;
}
```