import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden",
  description:
    "A stylized Japanese garden: raked gravel with rocks, a koi pond with an arched red bridge, a stone lantern, a cloud-pruned pine, a maple, bamboo, a fence and stepping stones.",
};

export default function build() {
  const b = createBuilder({ name: "japanese_garden" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);

  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const place = (
    geo: THREE.BufferGeometry,
    color: string,
    pos: number[],
    rot: number[] = [0, 0, 0],
    sc: number[] = [1, 1, 1],
  ) => {
    e.set(rot[0], rot[1], rot[2]);
    q.setFromEuler(e);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      q,
      new THREE.Vector3(sc[0], sc[1], sc[2]),
    );
    geo.applyMatrix4(m);
    b.part(geo, color, { bone: root });
  };
  const box = (w: number, h: number, d: number, c: string, p: number[], r?: number[]) =>
    place(new THREE.BoxGeometry(w, h, d), c, p, r);
  const cyl = (r0: number, r1: number, h: number, seg: number, c: string, p: number[], r?: number[], s?: number[]) =>
    place(new THREE.CylinderGeometry(r1, r0, h, seg), c, p, r, s);
  const rock = (c: string, p: number[], s: number[], detail = 0) =>
    place(new THREE.IcosahedronGeometry(1, detail), c, p, [R() * 3, R() * 3, R() * 3], s);
  const rod = (a: number[], bb: number[], r0: number, r1: number, c: string, seg = 6) => {
    const va = new THREE.Vector3(...(a as [number, number, number]));
    const vb = new THREE.Vector3(...(bb as [number, number, number]));
    const d = vb.clone().sub(va);
    const len = d.length();
    const qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    const ee = new THREE.Euler().setFromQuaternion(qq);
    const mid = va.clone().add(vb).multiplyScalar(0.5);
    cyl(r0, r1, len, seg, c, [mid.x, mid.y, mid.z], [ee.x, ee.y, ee.z]);
  };

  // ---------- ground ----------
  box(10, 0.13, 10, "#5f8f45", [0, 0.035, 0]);
  // moss patches
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 9, z = (R() - 0.5) * 9;
    rock(i % 2 ? "#6fa34f" : "#4f7d3a", [x, 0.1, z], [0.5 + R() * 0.5, 0.04, 0.4 + R() * 0.4]);
  }

  // gravel field with raking
  box(4.4, 0.04, 5.6, "#e6dfcc", [-2.8, 0.12, 2.0]);
  for (let i = 0; i < 22; i++) {
    box(0.05, 0.03, 5.4, i % 2 ? "#cfc6ae" : "#f3eedf", [-4.8 + i * 0.2, 0.145, 2.0]);
  }
  // gravel border stones
  box(4.6, 0.1, 0.12, "#8a8478", [-2.8, 0.14, 4.85]);
  box(4.6, 0.1, 0.12, "#8a8478", [-2.8, 0.14, -0.85]);
  box(0.12, 0.1, 5.8, "#8a8478", [-5.05, 0.14, 2.0]);
  box(0.12, 0.1, 5.8, "#8a8478", [-0.55, 0.14, 2.0]);

  // rocks in the gravel with ripple rings
  const rocks: [number, number, number][] = [
    [-3.2, 2.4, 0.5],
    [-2.5, 2.9, 0.3],
    [-3.8, 1.2, 0.25],
  ];
  rocks.forEach(([x, z, s], i) => {
    place(new THREE.TorusGeometry(s + 0.45, 0.025, 4, 20), "#bdb49a", [x, 0.17, z], [Math.PI / 2, 0, 0]);
    place(new THREE.TorusGeometry(s + 0.8, 0.025, 4, 24), "#bdb49a", [x, 0.17, z], [Math.PI / 2, 0, 0]);
    rock(i % 2 ? "#6e6d6b" : "#7c7a76", [x, 0.12 + s * 0.45, z], [s, s * 0.9, s * 0.8], 1);
    rock("#5f8f45", [x + s * 0.2, 0.12 + s * 0.95, z], [s * 0.45, s * 0.14, s * 0.4]);
  });

  // ---------- pond ----------
  const px = 2.3, pz = 1.6;
  cyl(1.95, 1.95, 0.06, 18, "#2f6f7c", [px, 0.12, pz]);
  cyl(1.8, 1.8, 0.05, 18, "#4aa0ad", [px, 0.15, pz]);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const s = 0.25 + R() * 0.18;
    rock(i % 3 ? "#7a7873" : "#66655f", [px + Math.cos(a) * 1.98, 0.12 + s * 0.5, pz + Math.sin(a) * 1.98], [s * 1.2, s, s], 1);
  }
  // lily pads and lotus
  const pads: number[][] = [[1.6, 2.4], [3.3, 2.5], [3.4, 0.8], [1.5, 0.7], [2.9, 1.1]];
  pads.forEach(([x, z], i) => {
    cyl(0.22, 0.22, 0.015, 8, "#3f8f43", [x, 0.185, z]);
    if (i % 2 === 0) {
      cyl(0.04, 0.04, 0.05, 6, "#f4a6c0", [x, 0.22, z]);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        place(new THREE.ConeGeometry(0.05, 0.12, 4), "#f7b8cf", [x + Math.cos(a) * 0.06, 0.24, z + Math.sin(a) * 0.06], [Math.cos(a + 1.57) * 0.5, 0, Math.sin(a) * 0.5]);
      }
    }
  });
  // koi
  const koi: [number, number, number, string, string][] = [
    [1.9, 1.9, 0.6, "#ee6a2a", "#ffffff"],
    [2.9, 1.9, 2.3, "#f4f1ea", "#e04a2a"],
    [2.4, 1.0, -0.5, "#f0a020", "#f4f1ea"],
  ];
  koi.forEach(([x, z, ang, c1, c2]) => {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    place(new THREE.IcosahedronGeometry(1, 1), c1, [x, 0.18, z], [0, -ang + Math.PI / 2, 0], [0.09, 0.05, 0.28]);
    place(new THREE.IcosahedronGeometry(1, 0), c2, [x + sa * 0.04, 0.21, z + ca * 0.04], [0, -ang + Math.PI / 2, 0], [0.06, 0.03, 0.12]);
    place(new THREE.ConeGeometry(0.1, 0.2, 3), c1, [x - sa * 0.34, 0.18, z - ca * 0.34], [Math.PI / 2, 0, 0].map((v, i) => (i === 1 ? 0 : v)), [1, 1, 0.2]);
  });

  // ---------- bridge ----------
  const bz = pz;
  const bx0 = 0.2, bx1 = 4.4, N = 14;
  const bp: number[][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    bp.push([bx0 + (bx1 - bx0) * t, 0.2 + 0.7 * Math.sin(Math.PI * t) * 0.9, bz]);
  }
  for (let i = 0; i < N; i++) {
    const a = bp[i], c = bp[i + 1];
    const mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
    const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
    box(0.34, 0.07, 1.0, i % 2 ? "#b8402a" : "#c4472e", [mx, my, bz], [0, 0, ang]);
    // beams
    box(0.34, 0.06, 0.08, "#7a2a1c", [mx, my - 0.07, bz - 0.45], [0, 0, ang]);
    box(0.34, 0.06, 0.08, "#7a2a1c", [mx, my - 0.07, bz + 0.45], [0, 0, ang]);
    // rails
    for (const s of [-1, 1]) {
      rod([a[0], a[1] + 0.55, bz + s * 0.5], [c[0], c[1] + 0.55, bz + s * 0.5], 0.03, 0.03, "#d8553a");
      rod([a[0], a[1] + 0.3, bz + s * 0.5], [c[0], c[1] + 0.3, bz + s * 0.5], 0.02, 0.02, "#d8553a");
    }
  }
  for (let i = 0; i <= N; i += 2) {
    for (const s of [-1, 1]) {
      cyl(0.045, 0.045, 0.6, 6, "#a53a26", [bp[i][0], bp[i][1] + 0.3, bz + s * 0.5]);
      place(new THREE.SphereGeometry(0.07, 6, 5), "#e8c14a", [bp[i][0], bp[i][1] + 0.64, bz + s * 0.5]);
    }
  }
  // abutments
  box(0.4, 0.2, 1.2, "#7a7873", [bx0 - 0.1, 0.17, bz]);
  box(0.4, 0.2, 1.2, "#7a7873", [bx1 + 0.1, 0.17, bz]);

  // ---------- stepping stones ----------
  const steps: number[][] = [[-0.1, 4.6], [0.2, 3.9], [-0.1, 3.3], [0.35, 2.8], [4.9, 1.6], [5.0, 0.7]];
  steps.forEach(([x, z], i) => {
    cyl(0.28, 0.25, 0.09, 7, i % 2 ? "#9a968c" : "#858279", [x, 0.14, z], [0, R() * 3, 0], [1, 1, 0.85]);
  });

  // ---------- stone lantern ----------
  const lx = -1.0, lz = -2.0, gr = "#a8a69c";
  cyl(0.38, 0.34, 0.12, 6, gr, [lx, 0.16, lz]);
  cyl(0.11, 0.11, 0.55, 6, "#97958b", [lx, 0.5, lz]);
  cyl(0.28, 0.2, 0.1, 6, gr, [lx, 0.82, lz]);
  box(0.36, 0.34, 0.36, gr, [lx, 1.04, lz]);
  for (const [dx, dz, ry] of [[0, 0.185, 0], [0, -0.185, 0], [0.185, 0, Math.PI / 2], [-0.185, 0, Math.PI / 2]] as number[][]) {
    box(0.16, 0.18, 0.02, "#ffd36a", [lx + dx, 1.04, lz + dz], [0, ry, 0]);
  }
  cyl(0.5, 0.2, 0.08, 4, gr, [lx, 1.25, lz], [0, Math.PI / 4, 0]);
  place(new THREE.ConeGeometry(0.62, 0.34, 4), "#8f8d84", [lx, 1.46, lz], [0, Math.PI / 4, 0]);
  place(new THREE.SphereGeometry(0.1, 6, 5), "#a8a69c", [lx, 1.7, lz]);
  rock("#5f8f45", [lx, 1.62, lz + 0.2], [0.18, 0.04, 0.12]);

  // ---------- pine ----------
  const trunk: number[][] = [[-3.6, 0.1, -3], [-3.75, 0.8, -3], [-3.4, 1.5, -3.05], [-3.55, 2.2, -3], [-3.5, 2.7, -3]];
  for (let i = 0; i < trunk.length - 1; i++) rod(trunk[i], trunk[i + 1], 0.2 - i * 0.03, 0.17 - i * 0.03, i % 2 ? "#5b4636" : "#6a5240", 7);
  place(new THREE.IcosahedronGeometry(0.28, 0), "#4a392c", [-3.6, 0.15, -3], [0, 0, 0], [1.2, 0.5, 1.2]);
  const pads2: [number[], number[]][] = [
    [[-3.75, 0.9, -3], [-4.6, 1.3, -3.1]],
    [[-3.4, 1.5, -3.05], [-2.5, 1.75, -3.2]],
    [[-3.55, 2.0, -3], [-4.1, 2.45, -3.6]],
    [[-3.5, 2.5, -3], [-3.0, 2.75, -2.6]],
  ];
  pads2.forEach(([a, c]) => {
    rod(a, c, 0.06, 0.04, "#5b4636", 5);
    rock("#2f5f33", [c[0], c[1] + 0.1, c[2]], [0.85, 0.28, 0.8], 1);
    rock("#3d7a3d", [c[0], c[1] + 0.3, c[2]], [0.6, 0.18, 0.55], 1);
  });
  rock("#2f5f33", [-3.5, 2.95, -3], [0.7, 0.26, 0.7], 1);
  rock("#3d7a3d", [-3.5, 3.15, -3], [0.45, 0.16, 0.45], 1);
  // support pole
  rod([-4.6, 0.1, -3.1], [-4.6, 1.2, -3.1], 0.04, 0.04, "#8a6a42");

  // ---------- maple ----------
  rod([3.6, 0.1, -3.2], [3.5, 1.2, -3.2], 0.16, 0.1, "#4f3d33", 6);
  const mb: [number[], number[]][] = [
    [[3.5, 1.2, -3.2], [3.0, 1.9, -3.0]],
    [[3.5, 1.2, -3.2], [4.1, 1.85, -3.3]],
    [[3.5, 1.2, -3.2], [3.6, 2.3, -3.2]],
    [[3.5, 1.2, -3.2], [3.5, 1.8, -2.6]],
  ];
  mb.forEach(([a, c], i) => {
    rod(a, c, 0.06, 0.04, "#4f3d33", 5);
    rock(i % 2 ? "#c8321f" : "#d9481f", [c[0], c[1] + 0.35, c[2]], [0.75, 0.55, 0.7], 1);
    rock("#e8802a", [c[0] + 0.2, c[1] + 0.6, c[2] + 0.1], [0.4, 0.3, 0.4], 1);
  });
  for (let i = 0; i < 16; i++) {
    const a = R() * 6.28, d = 0.4 + R() * 1.2;
    box(0.09, 0.01, 0.09, i % 2 ? "#c8321f" : "#e8802a", [3.5 + Math.cos(a) * d, 0.11, -3.2 + Math.sin(a) * d], [0, R() * 3, 0]);
  }

  // ---------- bamboo ----------
  for (let i = 0; i < 9; i++) {
    const x = -4.6 + (R() - 0.5) * 0.9 + (i % 3) * 0.25, z = -4.2 + (R() - 0.5) * 0.7;
    const h = 2.6 + R() * 1.0;
    const segs = 5;
    for (let k = 0; k < segs; k++) {
      const sh = h / segs;
      cyl(0.045, 0.045, sh * 0.94, 6, k % 2 ? "#6fa83c" : "#7fb847", [x, 0.1 + sh * (k + 0.5), z]);
      cyl(0.055, 0.055, 0.025, 6, "#4f7f2a", [x, 0.1 + sh * (k + 1), z]);
    }
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + i;
      place(new THREE.ConeGeometry(0.1, 0.55, 4), "#4f9a3a", [x + Math.cos(a) * 0.25, 0.1 + h - 0.1 - k * 0.2, z + Math.sin(a) * 0.25], [Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2]);
    }
  }

  // ---------- fence (bamboo, back) ----------
  for (let i = 0; i < 28; i++) {
    const x = -2.7 + i * 0.2;
    cyl(0.045, 0.045, 1.1 + (i % 2) * 0.04, 6, "#cdb86a", [x, 0.65, -4.8]);
  }
  for (const y of [0.35, 0.8]) box(5.7, 0.05, 0.05, "#5a4632", [0.15, y, -4.72]);
  for (let i = 0; i < 4; i++) cyl(0.07, 0.07, 1.3, 6, "#5a4632", [-2.7 + i * 1.9, 0.75, -4.7]);

  // ---------- small shrine gate (torii) at front-right ----------
  const tx = 4.9, tz = 3.6;
  for (const s of [-1, 1]) cyl(0.11, 0.11, 1.9, 8, "#c4472e", [tx, 1.05, tz + s * 0.75], [0, 0, 0]);
  box(0.28, 0.14, 2.3, "#2b2b2b", [tx, 2.05, tz]);
  box(0.2, 0.1, 1.9, "#c4472e", [tx, 1.8, tz]);
  box(0.2, 0.08, 2.0, "#c4472e", [tx, 2.14, tz]);
  for (const s of [-1, 1]) cyl(0.13, 0.13, 0.1, 8, "#2b2b2b", [tx, 0.15, tz + s * 0.75]);

  // ---------- shrub/azalea clumps ----------
  [[-0.2, -1.2, "#2f6a3a"], [0.8, -2.8, "#2f6a3a"], [1.4, -1.0, "#3d7a3d"], [-4.5, 4.4, "#3d7a3d"]].forEach(([x, z, c], i) => {
    rock(c as string, [x as number, 0.3, z as number], [0.45, 0.28, 0.42], 1);
    if (i % 2 === 0) rock("#e85a9a", [(x as number) + 0.1, 0.5, (z as number) + 0.05], [0.14, 0.1, 0.14]);
  });

  return b.root;
}
