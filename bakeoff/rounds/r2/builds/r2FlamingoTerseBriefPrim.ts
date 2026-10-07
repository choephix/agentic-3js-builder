import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description: "Stylized standing flamingo with an S-curved neck, bent bill, long thin legs and folded wings.",
};

export default function build() {
  const b = createBuilder({ name: "flamingo" });
  const PINK = "#f26b8a", LIGHT = "#f8a0b4", DEEP = "#d9486a", BLACK = "#1c1618";
  const BILL = "#f6d3c6", LEG = "#ee7f95", WHITE = "#fff8f0", YEL = "#f2d046";

  const sph = new THREE.SphereGeometry(1, 10, 8);
  const ell = (c: string, at: number[], sc: number[], bone: any, dir?: number[]) =>
    b.part(sph, c, { at, scale: sc, bone, ...(dir ? { dir } : {}) } as any);

  const seg = (a: number[], c: number[], r0: number, r1: number, col: string, bone: any) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, 7, 1);
    return b.part(g, col, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      dir: [d.x, d.y, d.z], bone,
    } as any);
  };

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.74, -0.05] });
  const chest = b.joint("chest", { at: [0, 0.78, 0.15], parent: hips } as any);
  const np = [[0, 0.86, 0.26], [0, 0.96, 0.37], [0, 1.07, 0.34], [0, 1.18, 0.26], [0, 1.27, 0.29]];
  const necks: any[] = [];
  np.forEach((p, i) => {
    necks.push(b.joint("neck" + (i + 1), { at: p, parent: i ? necks[i - 1] : chest, role: "neck" } as any));
  });
  const headP = [0, 1.32, 0.35];
  const head = b.joint("head", { at: headP, parent: necks[4], role: "head" } as any);
  const jaw = b.joint("jaw", { at: [0, 1.31, 0.4], parent: head, role: "jaw" } as any);
  const tail1 = b.joint("tail1", { at: [0, 0.76, -0.3], parent: hips, role: "tail" } as any);

  // Body
  ell(PINK, [0, 0.76, 0.0], [0.17, 0.19, 0.34], hips);
  ell(LIGHT, [0, 0.8, 0.22], [0.14, 0.15, 0.18], chest);
  ell(LIGHT, [0, 0.72, 0.15], [0.12, 0.12, 0.2], chest);
  ell(PINK, [0, 0.78, -0.3], [0.08, 0.06, 0.18], tail1);
  for (let i = 0; i < 4; i++) ell(LIGHT, [(i - 1.5) * 0.03, 0.74, -0.36 - i * 0.01], [0.03, 0.025, 0.1], tail1);

  // Neck
  const all = [[0, 0.82, 0.22], ...np, headP];
  for (let i = 0; i < all.length - 1; i++) {
    const bone = i === 0 ? chest : necks[Math.min(i - 1, 4)];
    seg(all[i], all[i + 1], 0.05 - i * 0.004, 0.047 - i * 0.004, i % 2 ? PINK : LIGHT, bone);
    ell(PINK, all[i + 1], [0.046 - i * 0.004, 0.046 - i * 0.004, 0.046 - i * 0.004], bone);
  }

  // Head
  ell(PINK, [0, 1.325, 0.37], [0.045, 0.043, 0.055], head);
  // Bill upper
  seg([0, 1.325, 0.4], [0, 1.31, 0.47], 0.03, 0.03, BILL, head);
  seg([0, 1.31, 0.47], [0, 1.255, 0.53], 0.03, 0.018, BLACK, head);
  seg([0, 1.31, 0.47], [0, 1.28, 0.5], 0.03, 0.026, BILL, head);
  // Bill lower
  seg([0, 1.305, 0.4], [0, 1.29, 0.47], 0.024, 0.024, BILL, jaw);
  seg([0, 1.29, 0.47], [0, 1.245, 0.52], 0.024, 0.014, BLACK, jaw);
  // Eyes
  for (const s of [1, -1]) {
    ell(YEL, [s * 0.04, 1.34, 0.385], [0.016, 0.016, 0.016], head);
    ell(BLACK, [s * 0.052, 1.34, 0.39], [0.008, 0.01, 0.01], head);
    ell(BLACK, [s * 0.04, 1.352, 0.405], [0.016, 0.004, 0.02], head);
  }

  // Wings and legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const wing = b.joint("wing" + n, { at: [s * 0.15, 0.86, 0.1], parent: chest, role: "wing" } as any);
    const wing2 = b.joint("wingTip" + n, { at: [s * 0.18, 0.8, -0.2], parent: wing, role: "wing" } as any);
    ell(DEEP, [s * 0.16, 0.8, 0.0], [0.04, 0.12, 0.28], wing, [0, 0.1, -1]);
    ell(PINK, [s * 0.175, 0.78, -0.08], [0.035, 0.1, 0.26], wing);
    ell(LIGHT, [s * 0.19, 0.76, -0.2], [0.03, 0.07, 0.2], wing2);
    ell(BLACK, [s * 0.19, 0.74, -0.38], [0.03, 0.05, 0.14], wing2);

    const hip = b.joint("hip" + n, { at: [s * 0.07, 0.68, -0.03], parent: hips, role: "leg" } as any);
    const knee = b.joint("knee" + n, { at: [s * 0.07, 0.4, 0.0], parent: hip, role: "leg" } as any);
    const ankle = b.joint("ankle" + n, { at: [s * 0.07, 0.03, -0.06], parent: knee, role: "leg" } as any);
    ell(PINK, [s * 0.07, 0.64, -0.03], [0.07, 0.1, 0.09], hip);
    seg([s * 0.07, 0.68, -0.03], [s * 0.07, 0.4, 0.0], 0.016, 0.014, LEG, hip);
    ell(DEEP, [s * 0.07, 0.4, 0.0], [0.024, 0.024, 0.024], knee);
    seg([s * 0.07, 0.4, 0.0], [s * 0.07, 0.03, -0.06], 0.014, 0.011, LEG, knee);
    ell(DEEP, [s * 0.07, 0.04, -0.06], [0.02, 0.02, 0.02], ankle);
    // toes
    const toes = [[0.0, 0.0, 0.15], [-0.07 * s, 0, 0.12], [0.07 * s, 0, 0.12]];
    toes.forEach((t, i) => {
      const tip = [s * 0.07 + t[0], 0.008, -0.06 + t[2]];
      seg([s * 0.07, 0.014, -0.06], tip, 0.009, 0.007, LEG, ankle);
      ell(DEEP, tip, [0.01, 0.008, 0.012], ankle);
    });
    ell(LEG, [s * 0.07, 0.006, 0.0], [0.05, 0.004, 0.06], ankle);
    // back toe
    seg([s * 0.07, 0.016, -0.06], [s * 0.07, 0.008, -0.1], 0.008, 0.006, LEG, ankle);
  }

  return b.root;
}
