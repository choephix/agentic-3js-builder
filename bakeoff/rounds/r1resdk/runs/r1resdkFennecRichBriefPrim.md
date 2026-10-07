```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Fennec Fox Kit on a Dune",
  description:
    "Alert fennec fox kit with huge peach-lined ears, gold-and-cream fur, black-tipped tail, oversized paws and a woven leather collar with a brass bell, standing on a sand dune.",
};

export default function build() {
  const b = createBuilder({ name: "fennec" });
  const g = 0.08; // dune top height

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, g + 0.15, -0.06] });
  const spine = b.joint("spine", { at: [0, g + 0.16, 0.03], parent: hips, role: "spine" });
  const neck = b.joint("neck", { at: [0, g + 0.2, 0.1], parent: spine, role: "neck" });
  const head = b.joint("head", { at: [0, g + 0.24, 0.14], parent: neck, role: "head" });
  const jaw = b.joint("jaw", { at: [0, g + 0.215, 0.17], parent: head, role: "jaw" });
  const earL = b.joint("earL", { at: [0.05, g + 0.28, 0.12], parent: head });
  const earR = b.joint("earR", { at: [-0.05, g + 0.28, 0.12], parent: head });
  const tail1 = b.joint("tail1", { at: [0, g + 0.15, -0.16], parent: hips, role: "tail" });
  const tail2 = b.joint("tail2", { at: [0, g + 0.13, -0.24], parent: tail1, role: "tail" });
  const tail3 = b.joint("tail3", { at: [0, g + 0.09, -0.32], parent: tail2, role: "tail" });
  const legs: Record<string, THREE.Object3D | any> = {};
  for (const [s, sx] of [["L", 1], ["R", -1]] as const) {
    legs["arm" + s] = b.joint("shoulder" + s, { at: [0.045 * sx, g + 0.14, 0.07], parent: spine, role: "arm" });
    legs["hind" + s] = b.joint("hip" + s, { at: [0.05 * sx, g + 0.13, -0.1], parent: hips, role: "leg" });
  }

  // ---------- helpers ----------
  const sph = new THREE.SphereGeometry(1, 12, 8);
  const cone = new THREE.ConeGeometry(1, 1, 10);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 8);
  const torus = new THREE.TorusGeometry(1, 0.2, 6, 16);
  torus.rotateX(Math.PI / 2);
  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any, o: any = {}) =>
    b.part(geo, color, { at, bone, ...o });

  const cream = "#f6e6c8", gold = "#dfb06a", peach = "#f2b79a", black = "#241c1a";
  const leather = "#6a4025", brass = "#cf9a2c", sand = "#d8b27c";

  // ---------- dune ----------
  P(sph, sand, [0, 0, 0], hips, { scale: [0.6, g, 0.6] });
  P(sph, "#c9a06a", [0.25, 0, -0.3], hips, { scale: [0.3, 0.05, 0.2] });
  P(sph, "#e6c48f", [-0.3, 0, 0.25], hips, { scale: [0.25, 0.04, 0.18] });
  for (let i = 0; i < 4; i++)
    P(torus, "#c4995f", [0.0, g * 0.55 - i * 0.004, 0.32 + i * 0.04], hips, { scale: [0.12 + i * 0.04, 0.2, 0.05] });

  // ---------- body ----------
  P(sph, cream, [0, g + 0.145, 0.0], spine, { scale: [0.07, 0.07, 0.13] });
  P(sph, gold, [0, g + 0.16, -0.02], spine, { scale: [0.068, 0.062, 0.125] });
  P(sph, cream, [0, g + 0.165, 0.09], spine, { scale: [0.055, 0.065, 0.05] }); // chest fluff
  P(sph, gold, [0, g + 0.15, -0.1], hips, { scale: [0.07, 0.07, 0.07] });

  // ---------- legs ----------
  for (const [s, sx] of [["L", 1], ["R", -1]] as const) {
    // front
    const fj = legs["arm" + s];
    P(cyl, cream, [0.045 * sx, g + 0.07, 0.085], fj, { scale: [0.017, 0.14, 0.017] });
    P(sph, cream, [0.045 * sx, g + 0.02, 0.1], fj, { scale: [0.03, 0.022, 0.044] });
    for (const t of [-1, 0, 1])
      P(sph, "#e8cfa6", [(0.045 + t * 0.013) * sx, g + 0.012, 0.135], fj, { scale: [0.009, 0.008, 0.012] });
    // hind
    const hj = legs["hind" + s];
    P(sph, gold, [0.058 * sx, g + 0.1, -0.1], hj, { scale: [0.04, 0.06, 0.07] }); // thigh
    P(cyl, cream, [0.055 * sx, g + 0.05, -0.1], hj, { scale: [0.016, 0.1, 0.016] });
    P(sph, cream, [0.055 * sx, g + 0.02, -0.08], hj, { scale: [0.03, 0.022, 0.048] });
    for (const t of [-1, 0, 1])
      P(sph, "#e8cfa6", [(0.055 + t * 0.013) * sx, g + 0.012, -0.04], hj, { scale: [0.009, 0.008, 0.012] });
  }

  // ---------- tail ----------
  P(sph, gold, [0, g + 0.145, -0.2], tail1, { scale: [0.05, 0.05, 0.08] });
  P(sph, gold, [0, g + 0.125, -0.28], tail2, { scale: [0.06, 0.06, 0.09] });
  P(sph, cream, [0, g + 0.108, -0.27], tail2, { scale: [0.04, 0.035, 0.07] });
  P(sph, "#d9a95c", [0, g + 0.09, -0.35], tail3, { scale: [0.058, 0.058, 0.08] });
  P(sph, black, [0, g + 0.075, -0.41], tail3, { scale: [0.05, 0.05, 0.05] });

  // ---------- head ----------
  P(sph, gold, [0, g + 0.245, 0.135], head, { scale: [0.07, 0.058, 0.065] });
  P(sph, cream, [0, g + 0.23, 0.17], head, { scale: [0.05, 0.04, 0.05] }); // cheeks/muzzle top
  P(cone, cream, [0, g + 0.235, 0.215], head, { scale: [0.034, 0.07, 0.034], dir: [0, -0.15, 1] });
  P(sph, black, [0, g + 0.24, 0.255], head, { scale: [0.014, 0.011, 0.012] }); // nose
  // lower jaw
  P(cone, cream, [0, g + 0.212, 0.2], jaw, { scale: [0.026, 0.06, 0.022], dir: [0, -0.05, 1] });
  // eyes
  for (const sx of [1, -1]) {
    P(sph, black, [0.032 * sx, g + 0.255, 0.188], head, { scale: [0.017, 0.021, 0.014] });
    P(sph, "#ffffff", [0.037 * sx, g + 0.262, 0.2], head, { scale: [0.0045, 0.0045, 0.0045] });
    // dark eye line
    P(sph, black, [0.04 * sx, g + 0.246, 0.18], head, { scale: [0.008, 0.005, 0.02] });
  }

  // ---------- ears ----------
  for (const [s, sx, ej] of [["L", 1, earL], ["R", -1, earR]] as const) {
    P(cone, gold, [0.075 * sx, g + 0.36, 0.1], ej, { scale: [0.05, 0.22, 0.014], dir: [0.4 * sx, 1, -0.1] });
    P(cone, peach, [0.073 * sx, g + 0.355, 0.112], ej, { scale: [0.038, 0.18, 0.008], dir: [0.4 * sx, 1, -0.1] });
    P(cone, cream, [0.062 * sx, g + 0.3, 0.115], ej, { scale: [0.03, 0.05, 0.012], dir: [0.4 * sx, 1, 0] });
  }

  // ---------- collar & bell ----------
  P(torus, leather, [0, g + 0.2, 0.1], neck, { scale: [0.06, 0.06, 0.06], dir: [0, 0.6, 1] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    P(sph, "#8a5a36", [Math.cos(a) * 0.06, g + 0.2 + Math.sin(a) * 0.06 * 0.85, 0.1 + Math.sin(a) * 0.06 * 0.5], neck, {
      scale: [0.007, 0.007, 0.007],
    });
  }
  P(sph, brass, [0, g + 0.15, 0.16], neck, { scale: [0.016, 0.016, 0.016] });
  P(cyl, "#8a6218", [0, g + 0.143, 0.173], neck, { scale: [0.008, 0.003, 0.002], dir: [0, 0, 1] });
  P(torus, brass, [0, g + 0.172, 0.155], neck, { scale: [0.007, 0.007, 0.007], dir: [0, 0, 1] });

  return b.root;
}
```