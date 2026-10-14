import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Clockwork Dog",
  description: "A brass wind-up toy dog with exposed gears, a winding key, a spring tail and a hinged jaw.",
};

export default function build() {
  const b = createBuilder({ name: "clockwork_dog" });

  const BRASS = "#c8963e", DARK = "#8a6428", COPPER = "#b8602e";
  const STEEL = "#8e99a3", BLACK = "#2b2b30", RED = "#b3342a", WHITE = "#f4efe0";

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.32, -0.16] });
  const spine = b.joint("spine", { at: [0, 0.34, 0.06], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.4, 0.2], parent: spine });
  const head = b.joint("head", { at: [0, 0.46, 0.27], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.41, 0.34], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.38, -0.27], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.44, -0.33], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.5, -0.37], parent: tail2 });

  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);

  const seg = (p: number[], q: number[], r: number, color: string, bone: any) => {
    const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    b.part(cyl(r, len), color, {
      at: [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2],
      dir: d,
      bone,
    });
  };

  // ---- torso ----
  b.part(box(0.2, 0.19, 0.24), BRASS, { at: [0, 0.34, -0.16], bone: hips });
  b.part(box(0.22, 0.22, 0.22), BRASS, { at: [0, 0.35, 0.05], bone: spine });
  b.part(box(0.225, 0.02, 0.5), DARK, { at: [0, 0.255, -0.05], bone: spine }); // belly plate
  // seam bands and rivets
  for (const z of [-0.2, -0.04, 0.1]) {
    b.part(box(0.215, 0.205, 0.016), COPPER, { at: [0, 0.345, z], bone: z < -0.1 ? hips : spine });
    for (const x of [-0.08, 0.08]) {
      b.part(sph(0.009), STEEL, { at: [x, 0.445, z], bone: z < -0.1 ? hips : spine });
    }
  }
  // back plate
  b.part(box(0.14, 0.012, 0.3), COPPER, { at: [0, 0.452, -0.04], bone: spine });

  // winding key
  seg([0, 0.45, -0.05], [0, 0.55, -0.05], 0.01, STEEL, spine);
  b.part(box(0.1, 0.045, 0.012), STEEL, { at: [0.055, 0.575, -0.05], bone: spine });
  b.part(box(0.1, 0.045, 0.012), STEEL, { at: [-0.055, 0.575, -0.05], bone: spine });
  b.part(sph(0.016), STEEL, { at: [0, 0.555, -0.05], bone: spine });

  // gears on both flanks
  const gear = (x: number, y: number, z: number, r: number, teeth: number, color: string, bone: any) => {
    const s = Math.sign(x);
    b.part(cyl(r, 0.014, 10), color, { at: [x, y, z], dir: [1, 0, 0], bone });
    b.part(cyl(r * 0.35, 0.022, 6), BLACK, { at: [x + s * 0.003, y, z], dir: [1, 0, 0], bone });
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const dy = Math.cos(a), dz = Math.sin(a);
      b.part(box(0.014, r * 0.4, r * 0.38), color, {
        at: [x, y + dy * (r + r * 0.12), z + dz * (r + r * 0.12)],
        dir: [0, dy, dz],
        bone,
      });
    }
  };
  for (const s of [1, -1]) {
    gear(s * 0.108, 0.35, -0.02, 0.055, 10, STEEL, spine);
    gear(s * 0.108, 0.33, -0.13, 0.04, 8, COPPER, hips);
    gear(s * 0.108, 0.39, -0.1, 0.025, 7, DARK, hips);
  }

  // ---- neck, collar ----
  b.part(box(0.13, 0.13, 0.12), BRASS, { at: [0, 0.42, 0.2], bone: neck });
  b.part(cyl(0.085, 0.035, 10), RED, { at: [0, 0.42, 0.205], dir: [0, 0.3, 1], bone: neck });
  b.part(cyl(0.028, 0.012, 8), "#e8c547", { at: [0, 0.37, 0.265], dir: [0, 0, 1], bone: neck }); // tag

  // ---- head ----
  b.part(box(0.17, 0.15, 0.15), BRASS, { at: [0, 0.48, 0.29], bone: head });
  b.part(box(0.11, 0.07, 0.13), BRASS, { at: [0, 0.455, 0.4], bone: head }); // upper snout
  b.part(box(0.045, 0.035, 0.03), BLACK, { at: [0, 0.482, 0.47], bone: head }); // nose
  b.part(box(0.1, 0.012, 0.02), STEEL, { at: [0, 0.42, 0.45], bone: head }); // teeth
  b.part(box(0.175, 0.012, 0.01), COPPER, { at: [0, 0.52, 0.365], bone: head }); // brow band
  // lower jaw
  b.part(box(0.095, 0.03, 0.12), DARK, { at: [0, 0.4, 0.4], bone: jaw });
  b.part(box(0.02, 0.012, 0.03), RED, { at: [0, 0.418, 0.4], bone: jaw }); // tongue
  // eyes and ears
  for (const s of [1, -1]) {
    b.part(sph(0.032), WHITE, { at: [s * 0.062, 0.51, 0.35], bone: head });
    b.part(sph(0.016), BLACK, { at: [s * 0.065, 0.51, 0.378], bone: head });
    b.part(cyl(0.038, 0.01, 8), STEEL, { at: [s * 0.063, 0.51, 0.345], dir: [0.3 * s, 0, 1], bone: head }); // rim
    b.part(box(0.015, 0.11, 0.07), COPPER, { at: [s * 0.1, 0.56, 0.26], dir: [s * 0.6, 1, -0.3], bone: head });
    b.part(sph(0.012), STEEL, { at: [s * 0.095, 0.5, 0.29], bone: head });
  }

  // ---- tail: spring ----
  const tj = [tail1, tail2, tail3];
  const tp = [[0, 0.38, -0.27], [0, 0.44, -0.33], [0, 0.5, -0.37], [0, 0.57, -0.38]];
  for (let i = 0; i < 3; i++) {
    seg(tp[i], tp[i + 1], 0.009, STEEL, tj[i]);
    for (let k = 0; k < 3; k++) {
      const t = (k + 0.5) / 3;
      const p = tp[i].map((v, j) => v + (tp[i + 1][j] - v) * t);
      const d = [tp[i + 1][0] - tp[i][0], tp[i + 1][1] - tp[i][1], tp[i + 1][2] - tp[i][2]];
      b.part(new THREE.TorusGeometry(0.03 - i * 0.004, 0.006, 4, 8), STEEL, { at: p, dir: d, bone: tj[i] });
    }
  }
  b.part(sph(0.02), COPPER, { at: [0, 0.585, -0.385], bone: tail3 });

  // ---- legs ----
  const leg = (name: string, x: number, zTop: number, zKnee: number, zFoot: number, rootBone: any, kneeBend: number) => {
    const top = [x, 0.29, zTop], knee = [x, 0.17, zKnee], ank = [x, 0.06, zFoot];
    const hip = b.joint("hip" + name, { at: top, parent: rootBone });
    const kn = b.joint("knee" + name, { at: knee, parent: hip });
    const an = b.joint("ankle" + name, { at: ank, parent: kn });
    b.part(box(0.07, 0.1, 0.09), BRASS, { at: [x, 0.25, zTop], bone: hip });
    b.part(sph(0.032), STEEL, { at: knee, bone: kn });
    seg(top, knee, 0.026, COPPER, hip);
    seg(knee, ank, 0.02, BRASS, kn);
    b.part(cyl(0.03, 0.075, 8), STEEL, { at: knee, dir: [1, 0, 0], bone: kn });
    b.part(box(0.07, 0.04, 0.12), DARK, { at: [x, 0.02, zFoot + 0.025], bone: an });
    b.part(box(0.075, 0.012, 0.125), BLACK, { at: [x, 0.006, zFoot + 0.025], bone: an });
  };
  for (const [n, s] of [["L", 1], ["R", -1]] as const) {
    leg("Back" + n, s * 0.08, -0.2, -0.24, -0.2, hips, 1);
    leg("Front" + n, s * 0.08, 0.1, 0.1, 0.1, spine, 1);
  }

  return b.root;
}
