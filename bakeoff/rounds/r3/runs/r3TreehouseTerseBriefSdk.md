```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A storybook treehouse: a gabled wooden cabin on a deck around a big trunk, with a ladder, rope bridge to a second tree, a swing, lantern, chimney and flag.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const C = {
    bark: "#6b4a2f", barkDark: "#503520", wood: "#c58f55", woodDark: "#8f5f35",
    plank: "#b9824a", roof: "#b8453a", roofDark: "#8e3030", leaf1: "#3f8f3f",
    leaf2: "#58aa48", leaf3: "#2f7336", grass: "#5a9e48", grassDark: "#46853a",
    glass: "#9fd8ee", frame: "#f2e6cc", door: "#6d3f24", stone: "#8c8c88",
    stoneDark: "#6e6e6a", lantern: "#ffd35a", pink: "#f06ea0", yellow: "#ffd84a",
    white: "#fbf6ea", red: "#d9382f", rope: "#d8c08a", flag: "#3b7dd8",
    teal: "#3f7f6a", smoke: "#e6e8ea", soil: "#7a5a3a",
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const place = (geo: THREE.BufferGeometry, color: string, m: THREE.Matrix4) => {
    geo.applyMatrix4(m);
    return b.part(geo, color, { at: [0, 0, 0], bone: root });
  };
  const add = (
    geo: THREE.BufferGeometry, color: string,
    pos: number[] = [0, 0, 0], rot: number[] = [0, 0, 0], scl: number[] = [1, 1, 1],
  ) =>
    place(
      geo, color,
      new THREE.Matrix4().compose(
        V(pos[0], pos[1], pos[2]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
        V(scl[0], scl[1], scl[2]),
      ),
    );
  const box = (w: number, h: number, d: number, color: string, pos: number[], rot?: number[]) =>
    add(new THREE.BoxGeometry(w, h, d), color, pos, rot);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, pos: number[], rot?: number[]) =>
    add(new THREE.CylinderGeometry(rt, rb, h, seg), color, pos, rot);
  const ico = (r: number, color: string, pos: number[], scl: number[] = [1, 1, 1], detail = 0) =>
    add(new THREE.IcosahedronGeometry(r, detail), color, pos, [0.3, 0.5, 0.1], scl);

  const axisMatrix = (a: number[], bb: number[]) => {
    const A = V(a[0], a[1], a[2]);
    const B = V(bb[0], bb[1], bb[2]);
    const d = B.clone().sub(A);
    const len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
    return { m: new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, V(1, 1, 1)), len };
  };
  const rod = (a: number[], bb: number[], rA: number, rB: number, color: string, seg = 6) => {
    const { m, len } = axisMatrix(a, bb);
    return place(new THREE.CylinderGeometry(rB, rA, len, seg), color, m);
  };
  const beam = (a: number[], bb: number[], t: number, color: string) => {
    const { m, len } = axisMatrix(a, bb);
    return place(new THREE.BoxGeometry(t, len, t), color, m);
  };
  const lerp3 = (a: number[], bb: number[], t: number) => [
    a[0] + (bb[0] - a[0]) * t, a[1] + (bb[1] - a[1]) * t, a[2] + (bb[2] - a[2]) * t,
  ];

  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // ---------- ground ----------
  cyl(10.5, 10.8, 0.12, 14, C.grass, [3.5, -0.05, 0.5]);
  cyl(9.2, 9.6, 0.05, 14, C.grassDark, [3.5, 0.0, 0.5], [0, 0.2, 0]);

  // ---------- main trunk ----------
  cyl(0.7, 0.85, 3.5, 10, C.bark, [0, 1.75, 0]);
  cyl(0.6, 0.7, 3.5, 10, C.bark, [0.04, 5.25, 0]);
  cyl(0.35, 0.6, 3.0, 10, C.bark, [0, 8.5, 0]);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.3;
    rod([Math.sin(a) * 0.45, 0.9, Math.cos(a) * 0.45], [Math.sin(a) * 1.7, -0.05, Math.cos(a) * 1.7], 0.3, 0.08, C.bark, 5);
  }
  for (let k = 0; k < 9; k++) {
    const a = k * 2.4;
    const y = 0.8 + k * 0.95;
    const r = 0.72 - k * 0.02;
    box(0.08, 0.7, 0.05, C.barkDark, [Math.sin(a) * r, y, Math.cos(a) * r], [0, a, 0]);
  }
  ico(0.17, C.barkDark, [-0.1, 2.6, 0.7], [1, 1.2, 0.6]);
  ico(0.15, C.barkDark, [0.5, 7.0, -0.45], [1, 1.2, 0.6]);

  // ---------- main canopy ----------
  const clumps: [number, number, number, number, string][] = [
    [0, 10.3, 0, 2.4, C.leaf1], [1.9, 9.4, 0.6, 1.8, C.leaf2], [-1.9, 9.6, -0.4, 2.0, C.leaf3],
    [0.5, 9.4, -1.9, 1.9, C.leaf2], [-0.6, 9.5, 1.9, 1.6, C.leaf3], [0.2, 11.5, 0.2, 1.5, C.leaf2],
    [1.4, 11.0, -0.9, 1.2, C.leaf1],
  ];
  clumps.forEach((c) => {
    ico(c[3], c[4], [c[0], c[1], c[2]], [1, 0.85, 1]);
    rod([0, 7.3, 0], [c[0] * 0.7, c[1] - 1.0, c[2] * 0.7], 0.2, 0.1, C.bark, 5);
  });

  // ---------- platform ----------
  const py = 4.0;
  cyl(2.9, 2.9, 0.2, 8, C.wood, [0, py, 0], [0, Math.PI / 8, 0]);
  cyl(2.95, 2.95, 0.08, 8, C.woodDark, [0, py - 0.14, 0], [0, Math.PI / 8, 0]);
  for (let i = -5; i <= 5; i++) box(0.03, 0.02, 4.8, C.woodDark, [i * 0.5, py + 0.11, 0]);
  // braces under the deck
  for (let k = 0; k < 4; k++) {
    const a = k * (Math.PI / 2) + 0.4;
    beam([Math.sin(a) * 0.5, py - 1.5, Math.cos(a) * 0.5], [Math.sin(a) * 2.5, py - 0.1, Math.cos(a) * 2.5], 0.14, C.woodDark);
  }
  // front stilts
  [-2.2, 2.2].forEach((x) => {
    beam([x, -0.05, 2.0], [x, py - 0.05, 2.0], 0.22, C.woodDark);
    box(0.5, 0.12, 0.5, C.stone, [x, 0.04, 2.0]);
  });
  beam([-2.2, 0.4, 2.0], [2.2, 2.6, 2.0], 0.1, C.woodDark);
  beam([2.2, 0.4, 2.0], [-2.2, 2.6, 2.0], 0.1, C.woodDark);

  // railings
  const rp: number[][] = [];
  for (let k = -5; k <= 5; k++) {
    const a = (k * 20 * Math.PI) / 180;
    rp[k + 5] = [Math.sin(a) * 2.75, py + 0.1, Math.cos(a) * 2.75];
    if (k !== 0) beam([rp[k + 5][0], py + 0.1, rp[k + 5][2]], [rp[k + 5][0], py + 1.1, rp[k + 5][2]], 0.1, C.woodDark);
  }
  for (let k = 0; k < 10; k++) {
    if (k === 4 || k === 5) continue;
    const A = rp[k], B = rp[k + 1];
    beam([A[0], py + 1.05, A[2]], [B[0], py + 1.05, B[2]], 0.08, C.wood);
    beam([A[0], py + 0.6, A[2]], [B[0], py + 0.6, B[2]], 0.06, C.wood);
  }
  // back railing arc on rest of deck
  for (let k = 0; k < 6; k++) {
    const a = ((110 + k * 28) * Math.PI) / 180;
    const a2 = ((110 + (k + 1) * 28) * Math.PI) / 180;
    const P = [Math.sin(a) * 2.75, Math.cos(a) * 2.75];
    const Q = [Math.sin(a2) * 2.75, Math.cos(a2) * 2.75];
    beam([P[0], py + 0.1, P[1]], [P[0], py + 1.0, P[1]], 0.1, C.woodDark);
    beam([P[0], py + 0.98, P[1]], [Q[0], py + 0.98, Q[1]], 0.07, C.wood);
  }
  // mirrored left side back railing
  for (let k = 0; k < 6; k++) {
    const a = ((-110 - k * 28) * Math.PI) / 180;
    const a2 = ((-110 - (k + 1) * 28) * Math.PI) / 180;
    const P = [Math.sin(a) * 2.75, Math.cos(a) * 2.75];
    const Q = [Math.sin(a2) * 2.75, Math.cos(a2) * 2.75];
    beam([P[0], py + 0.1, P[1]], [P[0], py + 1.0, P[1]], 0.1, C.woodDark);
    beam([P[0], py + 0.98, P[1]], [Q[0], py + 0.98, Q[1]], 0.07, C.wood);
  }

  // ladder
  [-0.38, 0.38].forEach((x) => beam([x, 0, 4.6], [x, py + 0.9, 2.95], 0.09, C.woodDark));
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.7) / 12.6;
    const p = lerp3([0, 0, 4.6], [0, py + 0.9, 2.95], t);
    box(0.85, 0.07, 0.09, C.wood, [0, p[1], p[2]]);
  }

  // lantern post
  const lx = rp[6][0];
  const lz = rp[6][2];
  beam([lx, py + 1.1, lz], [lx, 6.0, lz], 0.1, C.woodDark);
  beam([lx, 6.0, lz], [lx + 0.35, 6.0, lz], 0.07, C.woodDark);
  cyl(0.01, 0.01, 0.2, 4, C.rope, [lx + 0.35, 5.88, lz]);
  box(0.24, 0.3, 0.24, C.lantern, [lx + 0.35, 5.65, lz]);
  box(0.3, 0.05, 0.3, C.barkDark, [lx + 0.35, 5.83, lz]);
  box(0.3, 0.05, 0.3, C.barkDark, [lx + 0.35, 5.48, lz]);

  // ---------- cabin ----------
  const cz = 0.9;
  box(2.2, 1.8, 1.8, C.plank, [0, py + 0.1 + 0.9, cz]);
  // plank lines
  for (let i = 1; i < 6; i++) {
    const y = py + 0.1 + i * 0.3;
    box(2.22, 0.025, 0.02, C.woodDark, [0, y, cz + 0.905]);
    box(0.02, 0.025, 1.82, C.woodDark, [1.105, y, cz]);
    box(0.02, 0.025, 1.82, C.woodDark, [-1.105, y, cz]);
  }
  // corner posts
  [-1.1, 1.1].forEach((x) => [0.02, 1.8].forEach((z) => box(0.14, 1.85, 0.14, C.woodDark, [x, py + 1.03, z])));
  // gables
  const tri = new THREE.Shape();
  tri.moveTo(-1.1, 0); tri.lineTo(1.1, 0); tri.lineTo(0, 1.0); tri.lineTo(-1.1, 0);
  [1.8, 0.0].forEach((z) => {
    const g = new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false });
    add(g, C.plank, [0, 5.9, z - 0.05]);
  });
  cyl(0.28, 0.28, 0.06, 10, C.frame, [0, 6.3, 1.88], [Math.PI / 2, 0, 0]);
  cyl(0.2, 0.2, 0.08, 10, C.glass, [0, 6.3, 1.88], [Math.PI / 2, 0, 0]);
  box(0.4, 0.04, 0.1, C.frame, [0, 6.3, 1.93]);
  box(0.04, 0.4, 0.1, C.frame, [0, 6.3, 1.93]);
  // roof
  const ang = Math.atan2(1.364, 1.5);
  box(2.05, 0.1, 2.4, C.roof, [0.75, 6.28, cz], [0, 0, -ang]);
  box(2.05, 0.1, 2.4, C.roof, [-0.75, 6.28, cz], [0, 0, ang]);
  for (let i = 0; i < 5; i++) {
    const t = 0.18 + i * 0.17;
    box(0.06, 0.06, 2.42, C.roofDark, [0.75 * (2 * t) * 0 + 1.5 * t, 6.9 - 1.364 * t + 0.1, cz], [0, 0, -ang]);
    box(0.06, 0.06, 2.42, C.roofDark, [-1.5 * t, 6.9 - 1.364 * t + 0.1, cz], [0, 0, ang]);
  }
  box(0.2, 0.14, 2.5, C.roofDark, [0, 6.97, cz]);
  // chimney
  box(0.42, 1.2, 0.42, C.stone, [-0.7, 6.8, 0.6]);
  box(0.54, 0.1, 0.54, C.stoneDark, [-0.7, 7.45, 0.6]);
  ico(0.2, C.smoke, [-0.7, 7.8, 0.6], [1, 0.8, 1]);
  ico(0.26, C.smoke, [-0.6, 8.2, 0.55], [1, 0.8, 1]);
  // door
  box(0.92, 1.5, 0.06, C.frame, [0, py + 0.1 + 0.75, 1.82]);
  box(0.72, 1.35, 0.08, C.door, [0, py + 0.1 + 0.675, 1.83]);
  for (let i = -1; i <= 1; i++) box(0.02, 1.3, 0.09, C.barkDark, [i * 0.22, py + 0.1 + 0.675, 1.84]);
  ico(0.05, C.lantern, [0.25, py + 0.8, 1.9]);
  box(0.8, 0.07, 0.3, C.wood, [0, py + 0.17, 1.95]);
  // side windows
  [-1, 1].forEach((s) => {
    const x = s * 1.12;
    box(0.06, 0.66, 0.66, C.frame, [x, 5.1, cz]);
    box(0.06, 0.52, 0.52, C.glass, [x + s * 0.02, 5.1, cz]);
    box(0.08, 0.04, 0.54, C.frame, [x + s * 0.03, 5.1, cz]);
    box(0.08, 0.54, 0.04, C.frame, [x + s * 0.03, 5.1, cz]);
    [-1, 1].forEach((t) => box(0.05, 0.64, 0.22, C.teal, [x + s * 0.03, 5.1, cz + t * 0.46], [0, 0, 0]));
    box(0.26, 0.15, 0.8, C.woodDark, [s * 1.22, 4.7, cz]);
    for (let i = 0; i < 5; i++) {
      const col = [C.pink, C.yellow, C.white, C.pink, C.yellow][i];
      ico(0.075, col, [s * 1.22, 4.84, cz - 0.3 + i * 0.15]);
    }
  });
  // front windows beside door
  [-0.78, 0.78].forEach((x) => {
    box(0.42, 0.5, 0.05, C.frame, [x, 5.15, 1.82]);
    box(0.32, 0.4, 0.06, C.glass, [x, 5.15, 1.83]);
    box(0.34, 0.03, 0.07, C.frame, [x, 5.15, 1.84]);
  });
  // flag
  rod([0, 6.95, 2.1], [0, 7.9, 2.1], 0.04, 0.03, C.woodDark, 5);
  const fs = new THREE.Shape();
  fs.moveTo(0, 0); fs.lineTo(0, -0.38); fs.lineTo(0.65, -0.19); fs.lineTo(0, 0);
  const fg = new THREE.ExtrudeGeometry(fs, { depth: 0.03, bevelEnabled: false });
  fg.rotateY(-Math.PI / 2);
  add(fg, C.flag, [0, 7.88, 2.1]);
  ico(0.07, C.lantern, [0, 7.93, 2.1]);

  // ---------- branch swing ----------
  const bs = [0, 5.3, 0];
  const be = [-3.3, 6.4, -1.6];
  rod(bs, be, 0.26, 0.09, C.bark, 6);
  ico(1.1, C.leaf2, [-3.3, 6.9, -1.6], [1, 0.8, 1]);
  ico(0.8, C.leaf3, [-2.4, 6.6, -2.3], [1, 0.8, 1]);
  const s1 = lerp3(bs, be, 0.7);
  const s2 = lerp3(bs, be, 0.95);
  [s1, s2].forEach((p) => rod([p[0], p[1] - 0.05, p[2]], [p[0], 0.62, p[2]], 0.025, 0.025, C.rope, 4));
  const sm = [(s1[0] + s2[0]) / 2, 0.58, (s1[2] + s2[2]) / 2];
  const sa = Math.atan2(s2[0] - s1[0], s2[2] - s1[2]);
  box(0.32, 0.07, 1.25, C.wood, sm, [0, sa, 0]);

  // ---------- rope bridge ----------
  const bA = [2.85, 4.1, 0.3];
  const bB = [6.4, 3.7, 0.3];
  const sag = (t: number) => {
    const p = lerp3(bA, bB, t);
    p[1] -= 0.3 * Math.sin(Math.PI * t);
    return p;
  };
  for (let i = 0; i <= 12; i++) {
    const p = sag(i / 12);
    box(0.24, 0.05, 1.0, C.wood, [p[0], p[1] + 0.02, p[2]]);
  }
  const N = 12;
  [-0.5, 0.5].forEach((zz) => {
    for (let i = 0; i < N; i++) {
      const p = sag(i / N), q = sag((i + 1) / N);
      rod([p[0], p[1], p[2] + zz], [q[0], q[1], q[2] + zz], 0.03, 0.03, C.rope, 4);
      rod([p[0], p[1] + 0.9, p[2] + zz], [q[0], q[1] + 0.9, q[2] + zz], 0.03, 0.03, C.rope, 4);
    }
    for (let i = 0; i <= N; i += 3) {
      const p = sag(i / N);
      rod([p[0], p[1], p[2] + zz], [p[0], p[1] + 0.9, p[2] + zz], 0.04, 0.04, C.woodDark, 5);
    }
  });

  // ---------- second tree + hut platform ----------
  const tx = 7.6, tz = 0.3;
  cyl(0.35, 0.6, 7.0, 9, C.bark, [tx, 3.5, tz]);
  for (let k = 0; k < 5; k++) {
    const a = k * 1.3;
    rod([tx + Math.sin(a) * 0.3, 0.7, tz + Math.cos(a) * 0.3], [tx + Math.sin(a) * 1.2, -0.05, tz + Math.cos(a) * 1.2], 0.22, 0.07, C.bark, 5);
  }
  [[0, 7.7, 0, 2.2, C.leaf2], [1.3, 6.9, 0.8, 1.5, C.leaf1], [-1.1, 7.0, -0.8, 1.5, C.leaf3], [0.4, 8.9, -0.2, 1.3, C.leaf1]].forEach((c) =>
    ico(c[3] as number, c[4] as string, [tx + (c[0] as number), c[1] as number, tz + (c[2] as number)], [1, 0.85, 1]),
  );
  cyl(1.35, 1.35, 0.2, 8, C.wood, [tx, 3.55, tz], [0, Math.PI / 8, 0]);
  for (let k = 0; k < 6; k++) {
    const a = 0.8 + k * 0.9;
    beam([tx + Math.sin(a) * 1.25, 3.65, tz + Math.cos(a) * 1.25], [tx + Math.sin(a) * 1.25, 4.5, tz + Math.cos(a) * 1.25], 0.08, C.woodDark);
  }
  cyl(0.3, 0.3, 0.55, 8, C.woodDark, [tx + 0.7, 3.95, tz + 0.7]);
  cyl(0.31, 0.31, 0.04, 8, C.barkDark, [tx + 0.7, 3.8, tz + 0.7]);
  cyl(0.31, 0.31, 0.04, 8, C.barkDark, [tx + 0.7, 4.1, tz + 0.7]);
  cyl(0.26, 0.26, 0.03, 8, C.yellow, [tx + 0.7, 4.22, tz + 0.7]);
  box(0.5, 0.35, 0.4, C.roof, [tx - 0.6, 3.85, tz - 0.8]);

  // ---------- ground details ----------
  [1.3, 2.6, 3.9, 5.2, 6.5].forEach((z, i) => {
    cyl(0.4, 0.45, 0.07, 6, C.stone, [(i % 2 ? 0.25 : -0.25) + rnd() * 0.1, 0.02, z + 4.6 - 0.2], [0, rnd() * 3, 0]);
  });
  for (let i = 0; i < 9; i++) {
    const a = rnd() * Math.PI * 2;
    const d = 3.5 + rnd() * 6;
    const x = Math.sin(a) * d + 3;
    const z = Math.cos(a) * d + 0.5;
    if (Math.abs(x) < 1 && z > 3) continue;
    if (x > 2.5 && x < 6.8 && Math.abs(z - 0.3) < 1.0) continue;
    ico(0.5 + rnd() * 0.4, [C.leaf1, C.leaf3, C.leaf2][i % 3], [x, 0.3, z], [1, 0.7, 1]);
  }
  [[-3.2, 2.5, 0.5], [3.5, 3.2, 0.4], [5.5, -2.5, 0.6], [-4.5, -2.0, 0.45]].forEach((r) =>
    ico(r[2], C.stone, [r[0], r[2] * 0.4, r[1]], [1.2, 0.7, 1]),
  );
  // mushrooms
  [[1.4, 1.1, 1], [1.8, 0.7, 0.7], [-1.3, -1.0, 0.8]].forEach((m) => {
    cyl(0.07 * m[2], 0.09 * m[2], 0.25 * m[2], 6, C.white, [m[0], 0.12 * m[2], m[1]]);
    add(new THREE.ConeGeometry(0.22 * m[2], 0.18 * m[2], 7), C.red, [m[0], 0.3 * m[2], m[1]]);
    ico(0.035 * m[2], C.white, [m[0] + 0.07 * m[2], 0.36 * m[2], m[1] + 0.05]);
    ico(0.03 * m[2], C.white, [m[0] - 0.08 * m[2], 0.33 * m[2], m[1] - 0.04]);
  });
  // flowers + tufts
  for (let i = 0; i < 16; i++) {
    const x = -4 + rnd() * 14;
    const z = -4 + rnd() * 9;
    if (Math.abs(x) < 1.2 && z > 0.5) continue;
    rod([x, 0, z], [x, 0.2, z], 0.012, 0.012, C.leaf3, 3);
    ico(0.06, [C.pink, C.yellow, C.white][i % 3], [x, 0.22, z]);
  }
  for (let i = 0; i < 14; i++) {
    const x = -5 + rnd() * 16;
    const z = -5 + rnd() * 11;
    add(new THREE.ConeGeometry(0.08, 0.3, 4), C.leaf1, [x, 0.14, z]);
  }

  return b.root;
}
```