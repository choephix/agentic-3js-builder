```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Penguin with Chick",
  description: "Proud emperor penguin parent with golden ear patches and a fluffy grey chick between its feet.",
};

export default function build() {
  const b = createBuilder({ name: "penguin" });
  const hips = b.joint("hips", { at: [0, 0.4, 0] });
  const spine = b.joint("spine", { at: [0, 0.6, 0], parent: hips, role: "spine" } as any);
  const neck = b.joint("neck", { at: [0, 0.88, 0.03], parent: spine, role: "neck" } as any);
  const head = b.joint("head", { at: [0, 0.98, 0.04], parent: neck, role: "head" } as any);
  const jaw = b.joint("jaw", { at: [0, 0.97, 0.1], parent: head, role: "jaw" } as any);
  const shL = b.joint("shoulderL", { at: [0.24, 0.78, 0], parent: spine, role: "arm" } as any);
  const shR = b.joint("shoulderR", { at: [-0.24, 0.78, 0], parent: spine, role: "arm" } as any);
  const hipL = b.joint("hipL", { at: [0.1, 0.25, 0.02], parent: hips, role: "leg" } as any);
  const hipR = b.joint("hipR", { at: [-0.1, 0.25, 0.02], parent: hips, role: "leg" } as any);
  const tail = b.joint("tail1", { at: [0, 0.3, -0.18], parent: hips, role: "tail" } as any);
  const chick = b.joint("chick", { at: [0, 0.15, 0.22], parent: hips });
  const chickHead = b.joint("chickHead", { at: [0, 0.3, 0.27], parent: chick, role: "head" } as any);

  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any, o: any = {}) =>
    b.part(geo, color, { at, bone, ...o } as any);
  const S = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // body
  P(S(1), "#1b2433", [0, 0.6, -0.03], spine, { scale: [0.27, 0.42, 0.21] });
  P(S(1), "#f6f6f2", [0, 0.58, 0.05], spine, { scale: [0.24, 0.38, 0.2] });
  P(S(1), "#f2dd8a", [0, 0.86, 0.1], spine, { scale: [0.17, 0.11, 0.12] });
  P(S(1), "#f0b830", [0, 0.83, 0.13], spine, { scale: [0.1, 0.08, 0.09] });
  // head
  P(S(1), "#141b28", [0, 1.0, 0.03], head, { scale: [0.11, 0.12, 0.13] });
  for (const s of [1, -1]) {
    P(S(1), "#f3b92a", [s * 0.085, 0.96, 0.02], head, { scale: [0.04, 0.07, 0.07] });
    P(S(1), "#f7dc7a", [s * 0.075, 0.9, 0.04], neck, { scale: [0.05, 0.05, 0.06] });
    P(S(0.017, 6, 5), "#050505", [s * 0.07, 1.02, 0.13], head);
    P(S(0.006, 4, 3), "#ffffff", [s * 0.07, 1.028, 0.145], head);
  }
  // beak
  P(new THREE.ConeGeometry(0.03, 0.2, 5), "#20242c", [0, 0.99, 0.2], head, { dir: [0, -0.22, 1] });
  P(new THREE.ConeGeometry(0.022, 0.17, 5), "#ff9a6a", [0, 0.955, 0.19], jaw, { dir: [0, -0.12, 1] });
  P(new THREE.BoxGeometry(0.012, 0.012, 0.15), "#ff7f50", [0, 0.985, 0.2], head, { dir: [0, -0.22, 1] });
  // flippers
  for (const s of [1, -1]) {
    const j = s > 0 ? shL : shR;
    P(new THREE.BoxGeometry(0.035, 0.38, 0.13), "#1b2433", [s * 0.36, 0.64, 0], j, { dir: [s * 0.6, -1, 0.1] });
    P(new THREE.BoxGeometry(0.02, 0.3, 0.1), "#e8ebef", [s * 0.35, 0.66, 0.02], j, { dir: [s * 0.6, -1, 0.1] });
  }
  // legs and feet
  for (const s of [1, -1]) {
    const j = s > 0 ? hipL : hipR;
    P(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 6), "#111", [s * 0.15, 0.12, 0.02], j);
    P(new THREE.BoxGeometry(0.13, 0.05, 0.26), "#0c0c0f", [s * 0.17, 0.025, 0.12], j);
    for (const t of [-1, 0, 1])
      P(new THREE.BoxGeometry(0.04, 0.04, 0.07), "#0c0c0f", [s * 0.17 + t * 0.045, 0.02, 0.27], j);
  }
  // tail
  P(new THREE.ConeGeometry(0.08, 0.25, 5), "#1b2433", [0, 0.18, -0.25], tail, { dir: [0, -0.5, -1] });

  // chick
  P(S(1), "#a9adb3", [0, 0.15, 0.22], chick, { scale: [0.1, 0.13, 0.1] });
  P(S(1), "#e4e6e8", [0, 0.14, 0.29], chick, { scale: [0.07, 0.1, 0.05] });
  P(S(1), "#7d828a", [0, 0.31, 0.26], chickHead, { scale: [0.075, 0.075, 0.075] });
  P(S(1), "#1a1a1e", [0, 0.31, 0.31], chickHead, { scale: [0.06, 0.06, 0.04] });
  for (const s of [1, -1]) {
    P(S(1), "#f4f4f4", [s * 0.035, 0.325, 0.32], chickHead, { scale: [0.025, 0.03, 0.015] });
    P(S(0.011, 5, 4), "#000", [s * 0.035, 0.325, 0.335], chickHead);
  }
  P(new THREE.ConeGeometry(0.014, 0.05, 4), "#222", [0, 0.295, 0.35], chickHead, { dir: [0, -0.1, 1] });
  const r = rng(7);
  for (let i = 0; i < 24; i++) {
    const a = r() * Math.PI * 2, e = (r() - 0.3) * 1.6;
    const ph = i % 3 === 0;
    const rr = ph ? 0.07 : 0.1;
    const cy = ph ? 0.31 : 0.15;
    const cz = ph ? 0.26 : 0.22;
    P(S(0.025, 5, 4), ph ? "#8e939b" : "#bfc3c8",
      [Math.cos(a) * Math.cos(e) * rr, cy + Math.sin(e) * rr * 1.2, cz + Math.sin(a) * Math.cos(e) * rr + 0.01],
      ph ? chickHead : chick);
  }
  for (const s of [1, -1])
    P(new THREE.BoxGeometry(0.045, 0.02, 0.07), "#111", [s * 0.045, 0.01, 0.3], chick);

  return b.root;
}
```