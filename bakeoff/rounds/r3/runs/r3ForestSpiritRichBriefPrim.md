```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Moss Stone Forest Spirit",
  description:
    "A small deer-like forest spirit with a river-stone body covered in moss, slender wooden legs with hooves, flowering antlers, a pale wooden mask face with glowing green eyes, and circling fireflies.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });
  const R = rng(7);
  const Y = new THREE.Vector3(0, 1, 0);
  type V = [number, number, number];

  // palette
  const STONE = "#8a9096", STONE2 = "#757c83", STONE3 = "#9aa0a4";
  const MOSS = "#4f8a3a", MOSS2 = "#6aa64a", MOSS3 = "#3a6b2e";
  const WOOD = "#7a5532", WOOD_D = "#5a3d24", MASK = "#e8d9b5", MASK_D = "#c9b88e";
  const DARK = "#1d1a16", GLOW = "#7dff6a", WHITE = "#fbfbf4", YEL = "#ffd54a", FLY = "#f6ff9a";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.8, -0.2] });
  const chest = b.joint("chest", { at: [0, 0.85, 0.3], parent: hips });
  const neck = b.joint("neck", { at: [0, 1.0, 0.45], parent: chest });
  const head = b.joint("head", { at: [0, 1.2, 0.62], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.14, 0.74], parent: head });
  const tail = b.joint("tail1", { at: [0, 0.9, -0.62], parent: hips });

  const legs: Record<string, THREE.Object3D | any> = {};
  const legDefs: [string, number, number, number, number, any][] = [
    ["frontL", 1, 0.3, 0.3, 0.3, chest],
    ["frontR", -1, 0.3, 0.3, 0.3, chest],
    ["backL", 1, -0.35, -0.42, -0.3, hips],
    ["backR", -1, -0.35, -0.42, -0.3, hips],
  ];
  for (const [n, sx, hz, kz, az, par] of legDefs) {
    const x = sx * 0.16;
    const hip = b.joint("hip_" + n, { at: [x, 0.72, hz], parent: par });
    const knee = b.joint("knee_" + n, { at: [x, 0.44, kz], parent: hip });
    const ank = b.joint("ankle_" + n, { at: [x, 0.17, az], parent: knee });
    legs[n] = { hip, knee, ank, x, hz, kz, az };
  }

  // helpers
  function seg(a: V, c: V, r0: number, r1: number, color: string, bone: any, sides = 6) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), sides);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d.clone().normalize()));
    g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
    return b.part(g, color, { at: [0, 0, 0], bone });
  }
  function blob(p: V, s: V, color: string, bone: any, rotY = 0, detail = 0) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    g.scale(s[0], s[1], s[2]);
    g.rotateY(rotY);
    g.translate(p[0], p[1], p[2]);
    return b.part(g, color, { at: [0, 0, 0], bone });
  }
  function box(p: V, s: V, color: string, bone: any) {
    const g = new THREE.BoxGeometry(s[0], s[1], s[2]);
    g.translate(p[0], p[1], p[2]);
    return b.part(g, color, { at: [0, 0, 0], bone });
  }

  // stone body
  blob([0, 0.85, 0.0], [0.27, 0.27, 0.55], STONE, hips, 0.3, 1);
  blob([0, 0.9, 0.3], [0.25, 0.26, 0.28], STONE3, chest, 0.8, 1);
  blob([0, 0.82, -0.35], [0.26, 0.26, 0.3], STONE2, hips, 1.2, 1);
  blob([0.12, 0.7, 0.0], [0.15, 0.14, 0.25], STONE2, hips, 0.5);
  blob([-0.12, 0.7, 0.05], [0.14, 0.13, 0.22], STONE3, hips, 2.0);

  // moss on top
  const mossC = [MOSS, MOSS2, MOSS3];
  const zones: { c: V; r: V; bone: any }[] = [
    { c: [0, 0.85, 0.0], r: [0.27, 0.27, 0.55], bone: hips },
    { c: [0, 0.9, 0.3], r: [0.25, 0.26, 0.28], bone: chest },
    { c: [0, 0.82, -0.35], r: [0.26, 0.26, 0.3], bone: hips },
  ];
  for (let i = 0; i < 34; i++) {
    const z = zones[i % 3];
    const th = R() * Math.PI * 2;
    const el = 0.15 + R() * 1.3;
    const dx = Math.cos(el) * Math.cos(th), dy = Math.sin(el), dz = Math.cos(el) * Math.sin(th);
    const s = 0.05 + R() * 0.07;
    blob(
      [z.c[0] + dx * z.r[0] * 0.95, z.c[1] + dy * z.r[1] * 0.95, z.c[2] + dz * z.r[2] * 0.95],
      [s * 1.3, s * 0.6, s * 1.3],
      mossC[Math.floor(R() * 3)],
      z.bone,
      R() * 3
    );
  }
  // tufts of moss on the side
  for (let i = 0; i < 6; i++) {
    const sx = i % 2 ? 1 : -1;
    blob([sx * 0.27, 0.78 + R() * 0.1, -0.3 + R() * 0.6], [0.04, 0.05, 0.06], MOSS2, hips, R() * 3);
  }

  // legs
  for (const n of Object.keys(legs)) {
    const L = legs[n];
    const x = L.x;
    const hipP: V = [x, 0.72, L.hz], kneeP: V = [x, 0.44, L.kz], ankP: V = [x, 0.17, L.az];
    seg(hipP, kneeP, 0.045, 0.032, WOOD, L.hip);
    seg(kneeP, ankP, 0.032, 0.024, WOOD_D, L.knee);
    blob(kneeP, [0.045, 0.045, 0.045], WOOD, L.knee, 0, 0);
    // hoof
    const hg = new THREE.CylinderGeometry(0.03, 0.04, 0.09, 6);
    hg.translate(x, 0.04, L.az + 0.008);
    b.part(hg, DARK, { at: [0, 0, 0], bone: L.ank });
    seg([x, 0.1, L.az], [x, 0.17, L.az], 0.034, 0.026, WOOD_D, L.ank);
    // mossy sock at top
    blob([x, 0.74, L.hz], [0.075, 0.06, 0.085], MOSS, L.hip, R() * 3);
  }

  // tail: small stone-moss tuft
  blob([0, 0.92, -0.64], [0.06, 0.06, 0.08], MOSS2, tail, 0.4);
  blob([0, 0.97, -0.72], [0.04, 0.05, 0.05], WHITE, tail, 0.2);

  // neck
  seg([0, 0.96, 0.4], [0, 1.2, 0.6], 0.1, 0.07, WOOD, neck, 7);
  blob([0, 1.02, 0.47], [0.12, 0.08, 0.12], MOSS, neck, 0.4);
  blob([0.07, 1.1, 0.5], [0.05, 0.04, 0.05], MOSS2, neck, 1);

  // head: wooden mask
  box([0, 1.26, 0.64], [0.2, 0.26, 0.2], MASK_D, head);
  box([0, 1.26, 0.755], [0.22, 0.3, 0.035], MASK, head);
  seg([0, 1.2, 0.76], [0, 1.17, 0.9], 0.085, 0.06, MASK, head, 6);
  blob([0, 1.165, 0.91], [0.035, 0.03, 0.03], DARK, head, 0);
  // brow ridge and cheek marks
  box([0, 1.37, 0.775], [0.24, 0.035, 0.04], WOOD, head);
  for (const sx of [1, -1]) {
    box([sx * 0.065, 1.305, 0.775], [0.07, 0.06, 0.02], DARK, head);
    blob([sx * 0.065, 1.305, 0.79], [0.03, 0.03, 0.02], GLOW, head, 0, 1);
    box([sx * 0.08, 1.2, 0.775], [0.012, 0.09, 0.012], WOOD, head);
    box([sx * 0.045, 1.22, 0.775], [0.012, 0.07, 0.012], WOOD, head);
    // ears
    seg([sx * 0.1, 1.37, 0.6], [sx * 0.26, 1.44, 0.56], 0.05, 0.008, WOOD, head, 5);
    seg([sx * 0.11, 1.375, 0.6], [sx * 0.23, 1.43, 0.57], 0.028, 0.005, MASK, head, 5);
  }
  // forehead moss
  blob([0, 1.4, 0.65], [0.1, 0.04, 0.09], MOSS, head, 0.3);
  blob([0.06, 1.42, 0.7], [0.04, 0.025, 0.04], MOSS2, head, 1);

  // jaw
  box([0, 1.12, 0.83], [0.1, 0.035, 0.13], MASK_D, jaw);
  blob([0, 1.12, 0.9], [0.035, 0.02, 0.03], DARK, jaw, 0);

  // antlers
  function flower(p: V) {
    const petals = 5;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      blob([p[0] + Math.cos(a) * 0.022, p[1] + 0.004, p[2] + Math.sin(a) * 0.022], [0.016, 0.01, 0.016], WHITE, head, a);
    }
    blob([p[0], p[1] + 0.008, p[2]], [0.012, 0.012, 0.012], YEL, head);
  }
  function leaf(p: V, rot: number) {
    blob([p[0], p[1], p[2]], [0.014, 0.006, 0.04], R() > 0.5 ? MOSS2 : MOSS, head, rot);
  }
  for (const s of [1, -1]) {
    const P: V[] = [
      [s * 0.06, 1.38, 0.6],
      [s * 0.12, 1.56, 0.54],
      [s * 0.22, 1.73, 0.5],
      [s * 0.27, 1.9, 0.5],
    ];
    for (let i = 0; i < 3; i++) seg(P[i], P[i + 1], 0.024 - i * 0.005, 0.02 - i * 0.005, WOOD_D, head, 5);
    const tines: [V, V][] = [
      [P[1], [s * 0.3, 1.68, 0.64]],
      [P[2], [s * 0.4, 1.88, 0.4]],
      [P[2], [s * 0.14, 1.92, 0.62]],
      [P[3], [s * 0.4, 2.04, 0.54]],
      [P[1], [s * 0.04, 1.74, 0.42]],
    ];
    for (const [a, c] of tines) {
      seg(a, c, 0.014, 0.006, WOOD, head, 5);
      flower([c[0], c[1] + 0.01, c[2]]);
      leaf([c[0] - s * 0.03, c[1] - 0.02, c[2] + 0.02], R() * 3);
    }
    flower([P[3][0], P[3][1] + 0.01, P[3][2]]);
    leaf([P[3][0], P[3][1] - 0.03, P[3][2] - 0.04], 1.2);
    // flowers and leaves along beam
    flower([P[2][0] - s * 0.025, P[2][1] + 0.02, P[2][2] - 0.02]);
    leaf([P[1][0] + s * 0.03, P[1][1] + 0.03, P[1][2] - 0.03], 0.6);
    leaf([P[2][0] + s * 0.03, P[2][1] - 0.04, P[2][2] + 0.03], 2.2);
    blob([P[0][0], P[0][1] + 0.01, P[0][2]], [0.04, 0.025, 0.04], MOSS, head, 0.5);
  }

  // fireflies circling the head
  const fc: V = [0, 1.4, 0.6];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const rad = 0.5 + (i % 3) * 0.08;
    const p: V = [fc[0] + Math.cos(a) * rad, fc[1] + Math.sin(i * 1.7) * 0.22 + 0.05, fc[2] + Math.sin(a) * rad];
    blob(p, [0.014, 0.014, 0.014], FLY, head, 0, 1);
    blob([p[0], p[1] + 0.012, p[2]], [0.008, 0.004, 0.012], WHITE, head, a);
  }

  return b.root;
}
```