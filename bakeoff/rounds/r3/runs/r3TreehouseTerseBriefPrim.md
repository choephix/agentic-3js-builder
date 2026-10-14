```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A stylized low-poly treehouse: a big trunk with roots and a leafy canopy, a plank cabin with a gabled roof on an octagonal platform, a railing, a rope ladder, a chimney, a tire swing, lanterns and a small lookout.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const rand = rng(7);

  const C = {
    bark: "#6b4a2f", bark2: "#4e3522", plank: "#c68c53", plank2: "#a8703f",
    wood: "#8a5a34", roof: "#b8483a", roofD: "#7d2e28", glass: "#ffe08a",
    grass: "#6aa84f", grass2: "#58953f", stone: "#9a9a96", stone2: "#7d7d7a",
    rope: "#d9c18f", tire: "#2b2b2b", white: "#f4efe2", red: "#d93b3b",
    l1: "#3f8f3a", l2: "#2f7a3a", l3: "#5fae45", l4: "#7cc050", flower: "#f2c94c",
  };

  const add = (
    geo: THREE.BufferGeometry, color: string, at: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
  ) => {
    if (rot[0] || rot[1] || rot[2]) {
      geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
    }
    return b.part(geo, color, { at, bone: base });
  };
  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    add(new THREE.BoxGeometry(w, h, d), c, at, rot);

  // beam between two points (tapered cylinder)
  const beam = (a: number[], t: number[], r0: number, r1: number, color: string, seg = 6) => {
    const A = new THREE.Vector3(...(a as [number, number, number]));
    const B = new THREE.Vector3(...(t as [number, number, number]));
    const d = B.clone().sub(A);
    const L = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, L, seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    const m = A.clone().add(B).multiplyScalar(0.5);
    return add(g, color, [m.x, m.y, m.z]);
  };

  // ground
  add(new THREE.CylinderGeometry(7, 7.4, 0.2, 14), C.grass, [0, -0.04, 0]);
  add(new THREE.CylinderGeometry(4.5, 5, 0.2, 12), C.grass2, [0.5, 0.02, -0.5]);

  // trunk
  add(new THREE.CylinderGeometry(0.5, 0.85, 4, 9), C.bark, [0, 2, 0]);
  add(new THREE.CylinderGeometry(0.4, 0.5, 8, 9), C.bark, [0, 8, 0]);
  // roots
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    beam([Math.sin(a) * 0.5, 0.9, Math.cos(a) * 0.5], [Math.sin(a) * 2.0, 0.0, Math.cos(a) * 2.0], 0.3, 0.08, C.bark2, 5);
  }
  // bark knobs and ridges
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const y = 0.8 + rand() * 9;
    const r = y < 4 ? 0.7 : 0.45;
    add(new THREE.BoxGeometry(0.12, 0.5 + rand() * 0.6, 0.12), C.bark2, [Math.sin(a) * r, y, Math.cos(a) * r], [0, a, 0]);
  }

  // platform
  const R = 2.8;
  add(new THREE.CylinderGeometry(R, R, 0.2, 8), C.plank2, [0, 3.5, 0]);
  add(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 0.06, 8), C.plank, [0, 3.62, 0]);
  // plank lines
  for (let i = -4; i <= 4; i++) {
    const w = Math.sqrt(Math.max(0, R * R * 0.85 - (i * 0.6) ** 2)) * 1.7;
    box(w * 0.5, 0.02, 0.03, C.wood, [0, 3.66, i * 0.6]);
  }
  // struts
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    beam([Math.sin(a) * 0.5, 1.7, Math.cos(a) * 0.5], [Math.sin(a) * 2.3, 3.4, Math.cos(a) * 2.3], 0.13, 0.13, C.wood);
  }
  // ring beam under platform
  add(new THREE.CylinderGeometry(R * 0.7, R * 0.7, 0.2, 8), C.wood, [0, 3.3, 0]);

  // railing
  const vert = (k: number) => [Math.sin((k * Math.PI) / 4) * R * 0.97, Math.cos((k * Math.PI) / 4) * R * 0.97];
  for (let k = 0; k < 8; k++) {
    const [x, z] = vert(k);
    add(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 5), C.wood, [x, 4.15, z]);
    add(new THREE.SphereGeometry(0.1, 5, 4), C.plank, [x, 4.7, z]);
  }
  for (let k = 1; k <= 6; k++) {
    const [x1, z1] = vert(k), [x2, z2] = vert(k + 1);
    const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2;
    box(0.07, 0.09, L, C.plank, [mx, 4.55, mz], [0, ang, 0]);
    box(0.05, 0.06, L, C.plank2, [mx, 4.05, mz], [0, ang, 0]);
    for (let s = -1; s <= 1; s += 2) {
      add(new THREE.BoxGeometry(0.04, 0.5, 0.04), C.plank2, [mx + (dx / L) * 0.4 * s, 4.3, mz + (dz / L) * 0.4 * s]);
    }
  }

  // cabin
  const cz = -0.2;
  box(3.2, 2.0, 2.6, C.plank, [0, 4.7, cz]);
  // plank strips on front & back
  for (let i = -7; i <= 7; i++) {
    for (const s of [1, -1]) {
      box(0.03, 1.9, 0.03, C.plank2, [i * 0.2, 4.7, cz + s * 1.31]);
    }
  }
  // corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.16, 2.1, 0.16, C.wood, [sx * 1.6, 4.7, cz + sz * 1.3]);
  // base trim
  box(3.4, 0.12, 2.8, C.wood, [0, 3.68, cz]);
  // door
  box(0.8, 1.5, 0.08, C.wood, [-0.2, 4.4, cz + 1.31]);
  box(0.9, 1.6, 0.05, C.bark2, [-0.2, 4.43, cz + 1.29]);
  add(new THREE.SphereGeometry(0.06, 5, 4), C.glass, [0.1, 4.35, cz + 1.37]);
  box(0.3, 0.3, 0.04, C.glass, [-0.2, 4.85, cz + 1.36]);
  // front window
  box(0.7, 0.7, 0.05, C.wood, [1.0, 4.9, cz + 1.31]);
  box(0.56, 0.56, 0.06, C.glass, [1.0, 4.9, cz + 1.32]);
  box(0.58, 0.05, 0.08, C.wood, [1.0, 4.9, cz + 1.33]);
  box(0.05, 0.58, 0.08, C.wood, [1.0, 4.9, cz + 1.33]);
  box(0.9, 0.08, 0.2, C.wood, [1.0, 4.52, cz + 1.4]);
  // side windows
  for (const s of [-1, 1]) {
    box(0.05, 0.8, 0.8, C.wood, [s * 1.62, 4.9, cz]);
    box(0.06, 0.64, 0.64, C.glass, [s * 1.63, 4.9, cz]);
    box(0.08, 0.05, 0.66, C.wood, [s * 1.65, 4.9, cz]);
    box(0.08, 0.66, 0.05, C.wood, [s * 1.65, 4.9, cz]);
    box(0.2, 0.08, 1.0, C.wood, [s * 1.7, 4.48, cz]);
  }
  // back round window
  add(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 8), C.wood, [0.9, 5.0, cz - 1.31], [Math.PI / 2, 0, 0]);
  add(new THREE.CylinderGeometry(0.27, 0.27, 0.08, 8), C.glass, [0.9, 5.0, cz - 1.32], [Math.PI / 2, 0, 0]);

  // roof prism
  const roofGeo = new THREE.CylinderGeometry(2.4, 2.4, 3.5, 3);
  roofGeo.rotateX(-Math.PI / 2);
  roofGeo.scale(1, 0.5, 1);
  add(roofGeo, C.roof, [0, 6.2, cz]);
  const trim = new THREE.CylinderGeometry(2.5, 2.5, 0.12, 3);
  trim.rotateX(-Math.PI / 2);
  trim.scale(1, 0.5, 1);
  add(trim, C.roofD, [0, 6.19, cz + 1.78]);
  const trimB = trim.clone();
  add(trimB, C.roofD, [0, 6.19, cz - 1.78]);
  // shingle rows
  for (const s of [-1, 1]) {
    for (let r = 0; r < 4; r++) {
      const t = r / 4;
      const x = s * (2.05 - t * 1.5);
      const y = 5.65 + t * 1.15;
      beam([x, y, cz - 1.72], [x, y, cz + 1.72], 0.05, 0.05, C.roofD, 4);
    }
  }
  box(0.14, 0.14, 3.7, C.roofD, [0, 6.82, cz]);
  // gable window
  add(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 8), C.glass, [0, 6.2, cz + 1.76], [Math.PI / 2, 0, 0]);

  // chimney
  box(0.55, 3.6, 0.55, C.stone, [1.95, 5.4, cz - 0.5]);
  box(0.7, 0.14, 0.7, C.stone2, [1.95, 7.25, cz - 0.5]);
  for (let i = 0; i < 6; i++) box(0.58, 0.04, 0.58, C.stone2, [1.95, 3.9 + i * 0.55, cz - 0.5]);
  for (let i = 0; i < 3; i++) add(new THREE.IcosahedronGeometry(0.22 + i * 0.1, 0), C.white, [1.95 + i * 0.25, 7.7 + i * 0.5, cz - 0.5]);

  // ladder
  for (const s of [-1, 1]) beam([s * 0.4, 3.6, 3.0], [s * 0.4, 0.05, 4.0], 0.05, 0.05, C.rope, 5);
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9;
    box(0.8, 0.06, 0.06, C.plank, [0, 3.6 - t * 3.55, 3.0 + t * 1.0]);
  }
  // porch lanterns
  for (const s of [-1, 1]) {
    const [x, z] = vert(s === 1 ? 1 : 7);
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), C.bark2, [x, 5.1, z]);
    add(new THREE.BoxGeometry(0.22, 0.28, 0.22), C.glass, [x, 4.75, z]);
    add(new THREE.ConeGeometry(0.2, 0.15, 4), C.roofD, [x, 4.97, z], [0, Math.PI / 4, 0]);
  }
  // porch crate and bucket
  box(0.5, 0.4, 0.5, C.plank2, [1.4, 3.85, 1.8], [0, 0.4, 0]);
  add(new THREE.CylinderGeometry(0.22, 0.17, 0.35, 8), C.stone2, [-1.5, 3.8, 1.7]);

  // branches
  const br: number[][][] = [
    [[0, 6.2, 0], [-3.6, 7.0, 0.6]],
    [[0, 7.2, 0], [3.2, 9.0, -0.8]],
    [[0, 8.4, 0], [-1.5, 10.8, -1.8]],
    [[0, 9.3, 0], [1.8, 11.5, 1.2]],
    [[0, 7.8, 0], [0.5, 9.6, 3.0]],
  ];
  br.forEach(([a, t]) => beam(a, t, 0.28, 0.1, C.bark));
  // canopy clumps
  const leaves = [C.l1, C.l2, C.l3, C.l4];
  const clumps: [number, number, number, number][] = [
    [0, 11.8, 0, 2.6], [-3.6, 7.7, 0.6, 1.5], [3.2, 9.6, -0.8, 1.9], [-1.5, 11.3, -1.8, 1.9],
    [1.8, 12.2, 1.2, 1.8], [0.5, 10.2, 3.0, 1.5], [-2.6, 10.6, 1.6, 1.8], [2.6, 11.6, -2.0, 1.6],
    [0, 13.0, -0.6, 1.6], [-3.9, 9.0, -1.0, 1.3],
  ];
  clumps.forEach(([x, y, z, r], i) => {
    add(new THREE.IcosahedronGeometry(r, 1), leaves[i % 4], [x, y, z], [rand(), rand(), rand()]);
    for (let k = 0; k < 3; k++) {
      add(new THREE.IcosahedronGeometry(r * 0.5, 0), leaves[(i + k + 1) % 4], [
        x + (rand() - 0.5) * r * 1.5, y + (rand() - 0.2) * r * 0.9, z + (rand() - 0.5) * r * 1.5,
      ], [rand(), rand(), rand()]);
    }
  });

  // lookout platform
  add(new THREE.CylinderGeometry(1.1, 1.1, 0.14, 8), C.plank2, [0, 8.0, 0]);
  add(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 8), C.plank, [0, 8.1, 0]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const x = Math.sin(a) * 0.95, z = Math.cos(a) * 0.95;
    box(0.08, 1.2, 0.08, C.wood, [x, 8.7, z]);
    beam([Math.sin(a) * 0.5, 7.2, Math.cos(a) * 0.5], [x * 0.9, 7.95, z * 0.9], 0.07, 0.07, C.wood, 4);
  }
  add(new THREE.ConeGeometry(1.5, 0.8, 4), C.roof, [0, 9.7, 0], [0, Math.PI / 4, 0]);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4), C.bark2, [0, 10.4, 0]);
  box(0.5, 0.3, 0.02, C.red, [0.27, 10.65, 0]);
  // lookout rails
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const x = Math.sin(a) * 0.95, z = Math.cos(a) * 0.95;
    box(i % 2 === 0 ? 1.4 : 0.06, 0.06, i % 2 === 0 ? 0.06 : 1.4, C.plank, [x * 0.92, 8.55, z * 0.92]);
  }

  // tire swing
  beam([-3.0, 6.9, 0.55], [-3.0, 1.4, 0.55], 0.03, 0.03, C.rope, 4);
  beam([-3.3, 6.95, 0.6], [-3.3, 1.4, 0.55], 0.03, 0.03, C.rope, 4);
  add(new THREE.TorusGeometry(0.4, 0.17, 6, 10), C.tire, [-3.15, 1.0, 0.55], [Math.PI / 2 - 0.2, 0, 0]);

  // flowers, bushes, rocks, mushrooms
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2, d = 3.2 + rand() * 2.8;
    add(new THREE.IcosahedronGeometry(0.4 + rand() * 0.3, 0), leaves[i % 4], [Math.sin(a) * d, 0.35, Math.cos(a) * d], [rand(), rand(), 0]);
  }
  for (let i = 0; i < 5; i++) {
    const a = rand() * Math.PI * 2, d = 2.4 + rand() * 3.5;
    const x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (Math.abs(x) < 1 && z > 2.5) continue;
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4), C.l2, [x, 0.2, z]);
    add(new THREE.IcosahedronGeometry(0.09, 0), i % 2 ? C.flower : C.red, [x, 0.36, z]);
  }
  for (let i = 0; i < 3; i++) {
    const a = 0.6 + i * 1.9;
    add(new THREE.DodecahedronGeometry(0.35 + i * 0.1, 0), i % 2 ? C.stone : C.stone2, [Math.sin(a) * 4.8 + 1, 0.2, Math.cos(a) * 4.8 - 1], [a, 0, a]);
  }
  for (const [x, z] of [[1.2, 1.4], [1.45, 1.1]] as number[][]) {
    add(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 5), C.white, [x, 0.2, z]);
    add(new THREE.ConeGeometry(0.2, 0.15, 7), C.red, [x, 0.34, z]);
  }
  // stepping stones to ladder
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.35, 0.38, 0.1, 6), C.stone, [(i % 2 ? 0.25 : -0.25), 0.1, 4.6 + i * 0.8]);

  return b.root;
}
```