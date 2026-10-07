```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Old Lion",
  description: "A proud old lion lying with his head held high, with a huge gradient mane, a scarred brow and a tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(7);

  const TAWNY = "#c98f4a", CREAM = "#ecd9a8", GOLD = "#d9a441", DARK = "#3a2314";
  const hips = b.joint("hips", { at: [0, 0.42, -0.7] });
  const chest = b.joint("chest", { at: [0, 0.5, 0.2], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.8, 0.5], parent: chest });
  const head = b.joint("head", { at: [0, 1.0, 0.7], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.9, 0.78], parent: head });
  const shL = b.joint("shoulderL", { at: [0.25, 0.5, 0.35], parent: chest });
  const shR = b.joint("shoulderR", { at: [-0.25, 0.5, 0.35], parent: chest });
  const hipL = b.joint("hipL", { at: [0.3, 0.38, -0.8], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.3, 0.38, -0.8], parent: hips });

  const S = (sx: number, sy: number, sz: number) => [sx, sy, sz] as any;
  const ball = (r: number, seg = 10) => new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2));

  // Body
  b.part(ball(1, 12), TAWNY, { at: [0, 0.5, 0.15], scale: S(0.38, 0.4, 0.62), bone: chest } as any);
  b.part(ball(1, 12), TAWNY, { at: [0, 0.48, -0.65], scale: S(0.38, 0.4, 0.5), bone: hips } as any);
  b.part(ball(1, 10), CREAM, { at: [0, 0.26, -0.15], scale: S(0.3, 0.16, 0.8), bone: chest } as any);
  // Haunches
  for (const [s, j] of [[1, hipL], [-1, hipR]] as const) {
    b.part(ball(1, 10), TAWNY, { at: [0.36 * s, 0.3, -0.8], scale: S(0.2, 0.28, 0.4), bone: j } as any);
    b.part(ball(1, 8), CREAM, { at: [0.36 * s, 0.09, -0.4], scale: S(0.14, 0.09, 0.28), bone: j } as any);
    b.part(ball(1, 8), TAWNY, { at: [0.3 * s, 0.1, -0.35], scale: S(0.15, 0.1, 0.16), bone: j } as any);
  }
  // Front legs extended forward
  for (const [s, j] of [[1, shL], [-1, shR]] as const) {
    const x = 0.25 * s;
    b.sweep([[x, 0.45, 0.35], [x, 0.2, 0.7], [x, 0.13, 1.0]], 0.11, { color: TAWNY, bone: j } as any);
    b.part(ball(1, 10), CREAM, { at: [x, 0.1, 1.08], scale: S(0.13, 0.1, 0.18), bone: j } as any);
    for (const t of [-1, 0, 1]) {
      b.part(ball(1, 6), CREAM, { at: [x + t * 0.055, 0.07, 1.22], scale: S(0.04, 0.04, 0.05), bone: j } as any);
    }
  }
  // Neck + chest ruff
  b.part(new THREE.CylinderGeometry(0.23, 0.3, 0.5, 8), TAWNY, { at: [0, 0.78, 0.5], dir: [0, 0.4, 0.2], bone: neck } as any);

  // Mane: gold at face to dark chocolate at edges
  const layers = [
    { r: 0.34, c: "#d9a441", n: 14, s: 0.17 },
    { r: 0.42, c: "#b9782c", n: 18, s: 0.19 },
    { r: 0.5, c: "#8a5222", n: 22, s: 0.21 },
    { r: 0.58, c: "#5e3519", n: 24, s: 0.22 },
    { r: 0.66, c: "#3a2314", n: 26, s: 0.22 },
  ];
  const mc = [0, 0.98, 0.5];
  for (const L of layers) {
    for (let i = 0; i < L.n; i++) {
      const az = (i / L.n) * Math.PI * 2 + R() * 0.3;
      const el = (R() - 0.35) * 2.2;
      let dx = Math.cos(az) * Math.cos(el), dy = Math.sin(el) * 0.9, dz = Math.sin(az) * Math.cos(el);
      if (dz > 0.45) dz = 0.45 - R() * 0.2; // open face to front
      const len = Math.hypot(dx, dy, dz);
      const k = L.r / len;
      const y = Math.max(mc[1] + dy * k, 0.16);
      b.part(new THREE.IcosahedronGeometry(L.s, 0), L.c, {
        at: [mc[0] + dx * k * 0.95, y, mc[2] + dz * k],
        scale: S(1, 1.2, 1.1), bone: head,
      } as any);
    }
  }
  // Chest/chin beard hanging
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.08;
    b.part(new THREE.IcosahedronGeometry(0.15, 0), i % 2 ? "#8a5222" : "#b9782c", {
      at: [x, 0.5 - Math.abs(i - 4) * 0.02, 0.7 + R() * 0.05], scale: S(1, 1.4, 1), bone: neck,
    } as any);
  }

  // Head
  b.part(ball(1, 12), TAWNY, { at: [0, 1.0, 0.72], scale: S(0.25, 0.23, 0.26), bone: head } as any);
  b.part(new THREE.BoxGeometry(0.22, 0.14, 0.24), CREAM, { at: [0, 0.95, 0.94], bone: head } as any);
  b.part(new THREE.BoxGeometry(0.1, 0.08, 0.06), "#111111", { at: [0, 1.02, 1.07], bone: head } as any);
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.2), CREAM, { at: [0, 0.86, 0.94], bone: jaw } as any);
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.014, 0.04, 4), "#ffffff", { at: [0.06 * s, 0.875, 1.02], bone: head } as any);
    // eyes
    b.part(ball(0.04, 8), "#f0a81c", { at: [0.1 * s, 1.05, 0.93], bone: head } as any);
    b.part(ball(0.02, 6), "#1a0d05", { at: [0.1 * s, 1.05, 0.965], bone: head } as any);
    // brow
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.06), "#a86f34", { at: [0.1 * s, 1.1, 0.92], bone: head } as any);
    // ears
    b.part(ball(0.07, 7), TAWNY, { at: [0.2 * s, 1.2, 0.62], scale: S(0.7, 1, 0.5), bone: head } as any);
    b.part(ball(0.04, 6), "#5e3519", { at: [0.2 * s, 1.2, 0.65], scale: S(0.7, 1, 0.4), bone: head } as any);
    // whisker pads
    b.part(ball(0.05, 6), "#f6e6bd", { at: [0.07 * s, 0.94, 1.0], bone: head } as any);
  }
  // Scar across left brow (+X)
  const scar = b.part(new THREE.BoxGeometry(0.018, 0.17, 0.012), "#8c3b34", { at: [0.11, 1.09, 0.945], bone: head } as any);
  scar; 
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.01), "#8c3b34", { at: [0.11, 1.08, 0.95], bone: head } as any);

  // Tail along the ground, curling out
  const tail = b.chain("tail", [[0, 0.4, -1.15], [0.1, 0.3, -1.5], [0.35, 0.15, -1.7], [0.6, 0.1, -1.55]], { role: "tail", parent: hips } as any);
  b.sweep(tail, 0.05, { color: TAWNY } as any);
  b.part(ball(1, 8), DARK, { at: [0.68, 0.11, -1.5], scale: S(0.09, 0.09, 0.2), dir: [1, 0, 0.3] } as any);

  return b.root;
}
```