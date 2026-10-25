```ts
import * as THREE from "three";
import { createBuilder, frame, rng, svg, paint, noise, smoothstep, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Armoured low-poly cyberpunk hauler guarding a sealed glowing cargo pod.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const R = rng(5);
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  const HULL = paint((p, n) => {
    const w = noise(p, 0.12, 3);
    const c = mix("#2b3140", "#4a5266", w * 0.8 + 0.2 * smoothstep(0, 1, n.y));
    return p.y < 0.7 ? mix(c, "#1a1a1f", 0.5) : c;
  });
  const DARK = "#14161c", STEEL = "#7b8498", NEON = "#19f2ff", MAG = "#ff2fb4", AMB = "#ffb02e";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 10) => new THREE.CylinderGeometry(r, r, h, s);
  const put = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at, ...o });

  // Frame and chassis
  put(box(2.0, 0.3, 6.4), DARK, [0, 0.75, -0.2]);
  // Cab
  put(box(2.1, 1.0, 1.9), HULL, [0, 1.55, 1.9]);
  b.frustumBox([0, 1.1, 2.9], [0, 1.15, 3.5], [2.1, 0.6], [1.9, 0.4], { bone: chassis, color: HULL });
  b.frustumBox([0, 2.05, 1.5], [0, 2.4, 2.2], [1.9, 0.12], [1.8, 0.12], { bone: chassis, color: HULL });
  // windscreen
  put(box(1.8, 0.45, 0.06), "#0fb6d0", [0, 1.85, 2.88], { rotation: [-15, 0, 0] });
  glow(put(box(1.0, 0.1, 0.06), "#ff2fb4", [0, 1.15, 3.52]), 1.5);
  // Bumper ram
  put(box(2.3, 0.4, 0.3), STEEL, [0, 0.7, 3.65]);
  for (let i = -4; i <= 4; i++) put(new THREE.ConeGeometry(0.07, 0.25, 5), STEEL, [i * 0.25, 0.55, 3.85], { dir: [0, 0, 1] });
  // Headlights
  for (const s of [1, -1]) {
    glow(put(cyl(0.12, 0.08, 8), NEON, [s * 0.8, 1.2, 3.55], { dir: [0, 0, 1] }), 1.6);
    put(box(0.5, 0.5, 0.4), STEEL, [s * 1.2, 1.2, 1.9]);
  }

  // Wheels
  const spin: any[] = [];
  for (const s of [1, -1])
    for (const z of [2.6, 0.9, -1.4, -2.7]) {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${z}`.replace(".", "_"), {
        parent: chassis, at: [s * 1.1, 0.5, z], dir: [s, 0, 0], role: "leg",
      });
      spin.push(w);
      b.part(cyl(0.5, 0.45, 10), "#101015", { bone: w, at: [s * 1.1, 0.5, z], dir: [1, 0, 0] });
      b.part(cyl(0.28, 0.5, 8), STEEL, { bone: w, at: [s * 1.1 + s * 0.02, 0.5, z], dir: [1, 0, 0] } as any);
      b.part(cyl(0.1, 0.55, 6), NEON, { bone: w, at: [s * 1.1 + s * 0.02, 0.5, z], dir: [1, 0, 0] } as any);
      put(box(0.6, 0.12, 1.0), HULL, [s * 1.1, 1.0, z]);
    }
  // Side armour skirts
  for (const s of [1, -1]) {
    put(box(0.1, 0.55, 5.4), HULL, [s * 1.1, 0.85, -0.3]);
    glow(put(box(0.04, 0.05, 5.0), s > 0 ? NEON : MAG, [s * 1.17, 0.95, -0.3]), 1.4);
  }

  // Cargo pod
  const podY = 2.0;
  put(box(2.3, 0.2, 3.7), DARK, [0, 1.0, -1.7]);
  b.lathe([[0, -1.9], [1.05, -1.9], [1.2, -1.6], [1.2, 1.6], [1.05, 1.9], [0, 1.9]], {
    at: [0, podY, -1.7], axis: [0, 0, 1], segments: 8, bone: chassis, color: HULL,
  });
  for (let i = 0; i < 5; i++) {
    const z = -3.2 + i * 0.75;
    b.lathe([[1.17, -0.06], [1.27, -0.06], [1.27, 0.06], [1.17, 0.06]], { at: [0, podY, z], axis: [0, 0, 1], segments: 8, bone: chassis, color: STEEL });
    glow(put(box(0.5, 0.07, 0.05), AMB, [0, podY + 1.2, z]), 1.3);
  }
  const SEAL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#111" stroke="#ffb02e" stroke-width="4"/><path d="M32 12 L50 44 H14Z" fill="none" stroke="#ffb02e" stroke-width="4"/><rect x="29" y="26" width="6" height="10" fill="#ffb02e"/><rect x="29" y="39" width="6" height="4" fill="#ffb02e"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    glow(put(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", [s * 1.22, podY, -1.7], { dir: [s, 0, 0], axis: "z", texture: SEAL }), 1.2);
  // pod end glowing core
  glow(put(cyl(0.5, 0.1, 8), MAG, [0, podY, -3.62], { dir: [0, 0, 1] }), 1.4);

  // Turret on cab roof
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.15, 1.0], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.4, 1.0], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.4, 0.2, 8), STEEL, { bone: yaw, at: [0, 2.2, 1.0] });
  b.part(box(0.6, 0.3, 0.7), HULL, { bone: pitch, at: [0, 2.45, 1.0] });
  b.part(cyl(0.06, 1.4, 6), DARK, { bone: pitch, at: [0.15, 2.45, 1.9], dir: [0, 0, 1] });
  b.part(cyl(0.06, 1.4, 6), DARK, { bone: pitch, at: [-0.15, 2.45, 1.9], dir: [0, 0, 1] });
  glow(b.part(cyl(0.05, 0.05, 6), NEON, { bone: pitch, at: [0, 2.5, 1.66], dir: [0, 0, 1] }), 1.5);

  // Antennas and roof light bar
  for (const s of [1, -1]) {
    b.sweep([[s * 0.9, 2.1, 0.9], [s * 0.9, 3.2, 0.8]], 0.02, { bone: chassis, color: DARK });
    glow(put(new THREE.SphereGeometry(0.05, 6, 4), s > 0 ? MAG : NEON, [s * 0.9, 3.25, 0.8]), 1.6);
  }
  glow(put(box(1.4, 0.1, 0.12), AMB, [0, 2.1, 2.4]), 1.5);

  // Exhaust stacks
  for (const s of [1, -1]) put(cyl(0.09, 1.6, 8), STEEL, [s * 1.1, 2.0, 0.8]);

  // Rear bumper + thrusters
  put(box(2.2, 0.35, 0.25), STEEL, [0, 0.7, -3.55]);
  for (const s of [1, -1]) glow(put(cyl(0.2, 0.1, 8), NEON, [s * 0.6, 0.9, -3.65], { dir: [0, 0, 1] }), 1.4);

  // Plates scatter on the pod
  const skin = b.surface(b.root);
  void skin; void R; void frame; void spin;
  return b.root;
}
```