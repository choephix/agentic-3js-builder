```ts
import * as THREE from "three";
import { createBuilder, paint, grain, mix, noise, svg, rng } from "agentic-3js-builder";

export const meta = {
  name: "gramophone",
  description: "Antique wind-up gramophone with a wooden cabinet, brass flared horn, tonearm and a vinyl record.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const WOOD = grain("#6b3a1e", "#8a5230", { size: 0.02, axis: "x", seed: 3 });
  const DARKWOOD = "#3e2110";
  const BRASS = "#c9962b";
  const BRASS2 = "#e3b84e";
  const BLACK = "#16151a";
  const FELT = "#2c6b3d";
  const LABEL = "#b3262b";
  const STEEL = "#9aa0a6";

  const root = b.joint("base", { at: [0, 0, 0] });
  const tonearmPivot = b.joint("tonearmBase", { parent: root, at: [0.17, 0.99, -0.12], dir: [0, 1, 0], role: "hinge" });
  const turntable = b.joint("turntable", { parent: root, at: [0, 0.94, 0.02], dir: [0, 1, 0], role: "hinge" });
  const crank = b.joint("crank", { parent: root, at: [0.31, 0.5, 0], dir: [1, 0, 0], role: "hinge" });

  // cabinet
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: any, bone = root) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  // feet
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.045, 0.07, 8), DARKWOOD, { bone: root, at: [sx * 0.27, 0.035, sz * 0.25] });
      b.part(new THREE.SphereGeometry(0.035, 6, 4), BRASS, { bone: root, at: [sx * 0.27, 0.01, sz * 0.25] });
    }
  box(0.66, 0.05, 0.62, 0, 0.095, 0, DARKWOOD);
  box(0.62, 0.74, 0.56, 0, 0.5, 0, WOOD);
  box(0.68, 0.04, 0.64, 0, 0.89, 0, DARKWOOD);
  box(0.64, 0.03, 0.58, 0, 0.925, 0, WOOD);
  // front grille panel with slats
  box(0.4, 0.46, 0.02, 0, 0.5, 0.285, DARKWOOD);
  for (let i = 0; i < 7; i++) box(0.34, 0.02, 0.012, 0, 0.32 + i * 0.06, 0.298, BRASS);
  // door frame trim
  box(0.44, 0.02, 0.014, 0, 0.745, 0.292, BRASS2);
  box(0.44, 0.02, 0.014, 0, 0.255, 0.292, BRASS2);
  // side hole for crank
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), BRASS, { bone: root, at: [0.315, 0.5, 0], dir: [1, 0, 0] });
  // crank
  b.rod([0.32, 0.5, 0], [0.42, 0.5, 0], 0.012, { bone: crank, color: STEEL });
  b.rod([0.42, 0.5, 0], [0.42, 0.5, 0.1], 0.012, { bone: crank, color: STEEL });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), DARKWOOD, { bone: crank, at: [0.42, 0.5, 0.11] });

  // turntable
  b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.015, 20), FELT, { bone: turntable, at: [0, 0.94, 0.02] });
  b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.012, 24), BLACK, { bone: turntable, at: [0, 0.953, 0.02] });
  for (const r of [0.2, 0.16, 0.12])
    b.part(new THREE.TorusGeometry(r, 0.003, 4, 24), "#2b2a31", { bone: turntable, at: [0, 0.96, 0.02], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.004, 16), LABEL, { bone: turntable, at: [0, 0.96, 0.02] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), BRASS2, { bone: turntable, at: [0, 0.975, 0.02] });

  // horn support neck: elbow pipe rising at back
  const neck = b.chain("hornNeck", [[0, 0.93, -0.2], [0, 1.1, -0.26], [0, 1.22, -0.2], [0, 1.28, -0.02]].map((p) => p) as any, {
    parent: root, role: "neck", names: ["hornNeck1", "hornNeck2", "hornNeck3"],
  } as any);
  b.sweep(neck, [0.045, 0.06], { color: BRASS, sides: 10 } as any);
  b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 12), BRASS2, { bone: root, at: [0, 0.93, -0.2], rotation: [90, 0, 0] });

  // flared horn built from lathe, aimed forward
  const prof: [number, number][] = [[0, 0]];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    prof.push([0.06 + 0.4 * Math.pow(t, 2.6), t * 0.62]);
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    prof.push([0.06 + 0.4 * Math.pow(t, 2.6) - 0.012, t * 0.62]);
  }
  const hornJ = b.joint("horn", { parent: root, at: [0, 1.28, -0.02], dir: [0, 0.35, 1], role: "hinge" });
  b.lathe(prof.slice(1) as any, {
    at: [0, 1.28, -0.02], axis: [0, 0.35, 1], segments: 16, bone: hornJ,
    color: paint((p, _n, s) => (Math.floor(s[0] / 0.06) % 2 ? BRASS : BRASS2)),
  } as any);
  // horn rim bead
  b.part(new THREE.TorusGeometry(0.46, 0.012, 5, 20), BRASS2, {
    bone: hornJ, at: [0, 1.28 + 0.62 * 0.33, -0.02 + 0.62 * 0.94], dir: [0, 0.35, 1], axis: "z",
  });
  // horn stand ring
  b.part(new THREE.TorusGeometry(0.07, 0.01, 5, 10), BRASS, { bone: root, at: [0, 1.28, -0.02], dir: [0, 0.35, 1], axis: "z" });

  // tonearm
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.05, 10), BRASS, { bone: tonearmPivot, at: [0.17, 0.97, -0.12] });
  const arm = b.joint("tonearm", { parent: tonearmPivot, at: [0.17, 1.0, -0.12], dir: [-0.5, 0, 1], role: "arm" });
  b.rod([0.17, 1.0, -0.12], [0.06, 1.0, 0.1], [0.012, 0.009], { bone: arm, color: BRASS2 });
  b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 8), BRASS, { bone: arm, at: [0.055, 0.995, 0.105] });
  b.spike([0.055, 0.975, 0.105], [0, -1, 0], 0.03, 0.006, { bone: arm, color: STEEL });
  b.part(new THREE.SphereGeometry(0.02, 6, 5), STEEL, { bone: arm, at: [0.19, 1.0, -0.15] });

  // brake knob and speed lever
  b.part(new THREE.SphereGeometry(0.02, 6, 5), BRASS2, { bone: root, at: [-0.28, 0.96, 0.24] });
  b.rod([-0.28, 0.945, 0.24], [-0.22, 0.945, 0.2], 0.006, { bone: root, color: STEEL });

  // label plaque decal
  const plaque = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" rx="6" fill="#d9b04a"/><rect x="4" y="4" width="120" height="32" rx="4" fill="none" stroke="#6b3a1e" stroke-width="3"/><text x="64" y="26" font-size="16" text-anchor="middle" font-family="serif" fill="#3e2110">VICTROLA</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.0625), "#ffffff", { bone: root, at: [0, 0.82, 0.288], dir: [0, 0, 1], axis: "z", texture: plaque } as any);

  void mix; void noise; void rng;
  return b.root;
}
```