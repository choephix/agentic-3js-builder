```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Great Horned Owl",
  description: "A great horned owl perched on a gnarled branch, with barred plumage, ear tufts, a facial disc and black talons.",
};

export default function build() {
  const b = createBuilder({ name: "greatHornedOwl" });
  const R = rng(7);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.7, 0] });
  const spine = b.joint("spine", { at: [0, 0.8, 0.02], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.94, 0.05], parent: spine });
  const head = b.joint("head", { at: [0, 1.0, 0.05], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.975, 0.14], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.65, -0.12], parent: hips });
  const sh: Record<string, any> = {};
  const hp: Record<string, any> = {};
  const kn: Record<string, any> = {};
  const an: Record<string, any> = {};
  for (const [s, sx] of [["L", 1], ["R", -1]] as const) {
    sh[s] = b.joint("shoulder" + s, { at: [0.15 * sx, 0.86, 0], parent: spine });
    hp[s] = b.joint("hip" + s, { at: [0.08 * sx, 0.68, 0.03], parent: hips });
    kn[s] = b.joint("knee" + s, { at: [0.08 * sx, 0.62, 0.07], parent: hp[s] });
    an[s] = b.joint("ankle" + s, { at: [0.08 * sx, 0.57, 0.05], parent: kn[s] });
  }

  const ell = (rx: number, ry: number, rz: number, color: string, at: number[], bone: any, rx2 = 0, rz2 = 0, seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 2));
    g.scale(rx, ry, rz);
    if (rx2) g.rotateX(rx2);
    if (rz2) g.rotateZ(rz2);
    return b.part(g, color, { at: at as any, bone });
  };

  // branch
  const wood = "#5a4330", woodD = "#46331f";
  b.part(new THREE.CylinderGeometry(0.075, 0.095, 0.5, 8), woodD, { at: [-0.5, 0.25, 0], bone: hips });
  b.part(new THREE.CylinderGeometry(0.045, 0.058, 1.1, 8).rotateZ(Math.PI / 2), wood, { at: [0, 0.5, 0], bone: hips });
  b.part(new THREE.CylinderGeometry(0.02, 0.035, 0.35, 6).rotateZ(-0.9), wood, { at: [0.5, 0.62, 0], bone: hips });
  b.part(new THREE.CylinderGeometry(0.015, 0.025, 0.25, 6).rotateZ(0.7).rotateX(0.5), woodD, { at: [-0.25, 0.6, -0.1], bone: hips });
  b.part(new THREE.SphereGeometry(0.06, 7, 6), woodD, { at: [0.3, 0.5, 0.03], bone: hips });
  b.part(new THREE.SphereGeometry(0.05, 7, 6), woodD, { at: [-0.3, 0.5, -0.02], bone: hips });

  // body
  const brown = "#6b4a30", buff = "#c9a572", dark = "#2c1f16", bibC = "#efe6d2";
  ell(0.17, 0.25, 0.15, brown, [0, 0.78, 0], spine, 0.1);
  ell(0.15, 0.21, 0.1, buff, [0, 0.76, 0.06], spine, 0.1);
  ell(0.075, 0.075, 0.045, bibC, [0, 0.9, 0.1], spine);
  ell(0.06, 0.05, 0.04, bibC, [0, 0.85, 0.12], spine);

  // barring and mottling on the chest
  for (let i = 0; i < 7; i++) {
    const y = 0.64 + i * 0.03;
    const dy = (y - 0.78) / 0.25;
    for (let k = -2; k <= 2; k++) {
      const x = k * 0.05 + (i % 2) * 0.025;
      const t = 1 - dy * dy - (x / 0.15) * (x / 0.15);
      if (t <= 0.05) continue;
      const z = 0.14 * Math.sqrt(t) + 0.003;
      if (y > 0.82 && Math.abs(x) < 0.07) continue;
      ell(0.022, 0.005, 0.008, dark, [x, y, z], spine, -0.3 + dy * 0.3, x * 3);
    }
  }
  // back mottling
  for (let i = 0; i < 28; i++) {
    const x = (R() - 0.5) * 0.26;
    const y = 0.62 + R() * 0.32;
    const dy = (y - 0.78) / 0.25;
    const t = 1 - dy * dy - (x / 0.17) * (x / 0.17);
    if (t <= 0.05) continue;
    const z = -0.15 * Math.sqrt(t) - 0.002;
    ell(0.02 + R() * 0.015, 0.012, 0.006, i % 2 ? dark : buff, [x, y, z], spine);
  }

  // wings
  for (const [s, sx] of [["L", 1], ["R", -1]] as const) {
    ell(0.045, 0.23, 0.13, "#5b3d27", [0.158 * sx, 0.74, -0.03], sh[s], 0.15, -0.06 * sx);
    ell(0.035, 0.12, 0.1, buff, [0.175 * sx, 0.8, 0.0], sh[s], 0.1, -0.06 * sx);
    for (let i = 0; i < 6; i++)
      ell(0.048, 0.008, 0.11, dark, [0.162 * sx, 0.58 + i * 0.04, -0.04], sh[s], 0.15, -0.06 * sx);
    ell(0.03, 0.1, 0.08, "#4a3220", [0.15 * sx, 0.53, -0.1], sh[s], 0.5, -0.04 * sx);
  }

  // tail
  ell(0.085, 0.02, 0.19, "#6b4a30", [0, 0.6, -0.2], tail1, 0.55);
  for (let i = 0; i < 4; i++) {
    const d = 0.06 + i * 0.07;
    ell(0.08 - i * 0.004, 0.006, 0.014, dark, [0, 0.64 - d * 0.52 - 0.02, -0.1 - d * 0.85], tail1, 0.55);
  }

  // head
  ell(0.165, 0.125, 0.115, brown, [0, 1.03, 0.04], head, 0, 0, 12);
  ell(0.1, 0.05, 0.08, buff, [0, 1.1, 0.03], head);
  // facial disc
  for (const sx of [1, -1]) {
    ell(0.088, 0.095, 0.02, dark, [0.068 * sx, 1.03, 0.135], head, 0, 0.0, 10);
    ell(0.078, 0.085, 0.02, "#d9a468", [0.068 * sx, 1.03, 0.143], head, 0, 0.0, 10);
    ell(0.04, 0.04, 0.02, "#ecc88c", [0.045 * sx, 1.04, 0.15], head);
    // eyes
    ell(0.04, 0.04, 0.03, "#ff9a14", [0.062 * sx, 1.045, 0.152], head, 0, 0, 10);
    ell(0.02, 0.02, 0.02, "#0b0907", [0.062 * sx, 1.045, 0.176], head, 0, 0, 8);
    ell(0.006, 0.006, 0.006, "#ffffff", [0.068 * sx, 1.052, 0.194], head, 0, 0, 5);
    // brow
    ell(0.05, 0.012, 0.02, dark, [0.07 * sx, 1.09, 0.155], head, 0, -0.35 * sx);
    // ear tufts
    b.part(new THREE.ConeGeometry(0.035, 0.17, 6).rotateZ(-0.3 * sx).rotateX(-0.1), brown, { at: [0.095 * sx, 1.18, 0.0], bone: head });
    b.part(new THREE.ConeGeometry(0.02, 0.07, 5).rotateZ(-0.3 * sx).rotateX(-0.1), dark, { at: [0.108 * sx, 1.265, -0.005], bone: head });
    b.part(new THREE.ConeGeometry(0.018, 0.1, 5).rotateZ(-0.3 * sx), buff, { at: [0.09 * sx, 1.17, 0.025], bone: head });
  }
  // beak
  b.part(new THREE.ConeGeometry(0.026, 0.06, 5).rotateX(Math.PI / 2 + 0.5), "#7d8388", { at: [0, 1.0, 0.185], bone: head });
  b.part(new THREE.ConeGeometry(0.012, 0.03, 4).rotateX(Math.PI / 2 + 1.1), "#555b60", { at: [0, 0.98, 0.215], bone: head });
  b.part(new THREE.ConeGeometry(0.02, 0.04, 5).rotateX(Math.PI / 2 + 0.1), "#6d7378", { at: [0, 0.965, 0.175], bone: jaw });
  ell(0.06, 0.03, 0.04, bibC, [0, 0.94, 0.12], head);

  // legs and talons
  for (const [s, sx] of [["L", 1], ["R", -1]] as const) {
    ell(0.055, 0.1, 0.06, "#b99464", [0.085 * sx, 0.66, 0.045], hp[s], 0.1);
    ell(0.04, 0.045, 0.045, "#a78252", [0.085 * sx, 0.6, 0.06], kn[s]);
    for (let i = 0; i < 3; i++) ell(0.052, 0.004, 0.012, dark, [0.085 * sx, 0.62 + i * 0.03, 0.08], kn[s]);
    const toes = [[-0.026, 1], [0, 1.15], [0.026, 1], [0, -1]];
    toes.forEach(([dx, f], idx) => {
      const x = 0.085 * sx + dx * sx * (idx === 3 ? 0 : 1);
      const len = 0.075;
      const zc = f > 0 ? 0.06 + len / 2 : 0.03 - len / 2;
      const ztip = f > 0 ? 0.06 + len : 0.03 - len;
      const ang = f > 0 ? (idx === 1 ? 0 : (idx === 0 ? -0.2 : 0.2) * sx) : 0;
      b.part(new THREE.CylinderGeometry(0.011, 0.013, len, 5).rotateX(Math.PI / 2).rotateY(ang), "#cdb995", { at: [x, 0.568, zc], bone: an[s] });
      b.part(new THREE.SphereGeometry(0.014, 5, 4), "#b39e78", { at: [x, 0.568, ztip - (f > 0 ? 0.012 : -0.012)], bone: an[s] });
      b.part(new THREE.ConeGeometry(0.011, 0.045, 5).rotateX(f > 0 ? Math.PI * 0.85 : Math.PI * 1.15), "#14110f", {
        at: [x, 0.535, ztip + (f > 0 ? 0.012 : -0.012)], bone: an[s],
      });
    });
  }

  return b.root;
}
```