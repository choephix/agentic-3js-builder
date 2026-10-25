```ts
import * as THREE from "three";
import { createBuilder, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

const BODY = "#4a5240", TRIM = "#2b2f33", DARK = "#16181c", STEEL = "#7b828a", GLASS = "#1b3a4a";
const NEON = "#19f0ff", MAG = "#ff2a9a", AMB = "#ffb02e";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const R = rng(5);
  const hull = b.joint("chassis", { at: [0, 0.7, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: hull, at: at as any, ...o });

  const decal = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0a0a10"/><path d="M4 28 L16 4 L24 4 L12 28Z" fill="${MAG}"/><path d="M26 28 L38 4 L46 4 L34 28Z" fill="${NEON}"/><rect x="50" y="6" width="10" height="4" fill="${AMB}"/><rect x="50" y="14" width="10" height="4" fill="${AMB}"/><rect x="50" y="22" width="10" height="4" fill="${AMB}"/></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#ffb02e"/><path d="M-4 8 L8 -4 M-4 20 L20 -4 M-4 32 L32 -4 M8 36 L36 8 M20 36 L36 20" stroke="#111" stroke-width="5"/></svg>`,
    { size: 64 },
  );

  // lower hull and skids
  P(box(1.9, 0.35, 5.2), TRIM, [0, 0.2, 0]);
  P(box(1.7, 0.1, 5.0), DARK, [0, 0.0, 0]);
  for (const s of [1, -1]) {
    P(box(0.1, 0.1, 4.8), STEEL, [s * 0.98, 0.15, 0]);
    P(box(0.06, 0.3, 4.2), BODY, [s * 0.97, 0.45, 0]);
    for (let i = 0; i < 6; i++) P(box(0.04, 0.12, 0.5), AMB, [s * 1.0, 0.3, -2 + i * 0.8], {});
  }
  // cab
  P(box(1.9, 0.6, 1.5), BODY, [0, 0.8, 0.5]);
  P(box(1.8, 0.1, 1.4), BODY, [0, 1.75, 0.4]);
  P(box(1.7, 0.55, 0.05), GLASS, [0, 1.35, 1.2], { rotation: [-18, 0, 0] });
  P(box(1.7, 0.5, 0.05), GLASS, [0, 1.4, -0.3]);
  for (const s of [1, -1]) {
    P(box(0.04, 0.5, 1.0), GLASS, [s * 0.96, 1.4, 0.45]);
    P(box(0.06, 0.6, 0.06), TRIM, [s * 0.94, 1.4, 0.97]);
    P(box(0.2, 0.2, 0.3), STEEL, [s * 1.0, 1.2, 1.0]);
    P(box(0.03, 0.18, 0.4), BODY, [s * 0.98, 0.9, 0.5]);
  }
  P(box(1.6, 0.45, 1.4), BODY, [0, 0.65, 1.8]); // hood
  P(box(1.64, 0.08, 1.4), BODY, [0, 0.92, 1.8]);
  P(box(0.3, 0.05, 1.2), TRIM, [0, 0.98, 1.8]);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) P(box(0.3, 0.02, 0.05), DARK, [s * 0.5, 0.97, 1.4 + i * 0.12]);
    glow(P(box(0.3, 0.12, 0.05), NEON, [s * 0.6, 0.7, 2.52]));
    P(box(0.4, 0.2, 0.06), DARK, [s * 0.6, 0.7, 2.49]);
  }
  P(box(1.2, 0.3, 0.04), DARK, [0, 0.6, 2.5]);
  for (let i = 0; i < 5; i++) glow(P(box(1.0, 0.015, 0.02), MAG, [0, 0.5 + i * 0.05, 2.53]));
  P(box(2.0, 0.2, 0.3), STEEL, [0, 0.25, 2.55]); // bumper
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    bone: hull, at: [0.5, 0.25, 2.71], dir: [0, 0, 1], axis: "z", texture: warn,
  });
  // roof light bar
  P(box(1.2, 0.08, 0.12), DARK, [0, 1.85, 0.9]);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) glow(P(cyl(0.05, 0.03, 8), AMB, [x, 1.88, 0.97], { rotation: [90, 0, 0] }));
  // bed
  P(box(1.9, 0.08, 2.2), DARK, [0, 0.62, -1.5]);
  P(box(1.95, 0.5, 0.06), BODY, [0, 0.9, -0.42]);
  P(box(1.95, 0.5, 0.06), BODY, [0, 0.9, -2.6]);
  for (const s of [1, -1]) {
    P(box(0.06, 0.5, 2.2), BODY, [s * 0.95, 0.9, -1.5]);
    P(box(0.1, 0.05, 2.2), TRIM, [s * 0.95, 1.17, -1.5]);
  }
  b.part(new THREE.PlaneGeometry(1.4, 0.45), "#ffffff", {
    bone: hull, at: [1.0, 0.92, -1.5], dir: [1, 0, 0], axis: "z", texture: decal,
  });
  b.part(new THREE.PlaneGeometry(1.4, 0.45), "#ffffff", {
    bone: hull, at: [-1.0, 0.92, -1.5], dir: [-1, 0, 0], axis: "z", texture: decal,
  });
  // mounted weapon on pedestal
  P(cyl(0.3, 0.4, 10), STEEL, [0, 0.85, -1.5]);
  const yaw = b.joint("yaw", { parent: hull, at: [0, 1.1, -1.5], dir: [0, 1, 0], up: [1, 0, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 1.3, -1.5], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.36, 0.14, 10), TRIM, { bone: yaw, at: [0, 1.12, -1.5] });
  for (const s of [1, -1]) b.part(box(0.05, 0.3, 0.4), BODY, { bone: yaw, at: [s * 0.2, 1.3, -1.5] });
  b.part(box(0.26, 0.24, 0.5), BODY, { bone: pitch, at: [0, 1.3, -1.45] });
  b.rod([0.08, 1.3, -1.2], [0.08, 1.3, -0.1], 0.035, STEEL, { bone: pitch, sides: 6 });
  b.rod([-0.08, 1.3, -1.2], [-0.08, 1.3, -0.1], 0.035, STEEL, { bone: pitch, sides: 6 });
  glow(b.part(box(0.2, 0.04, 0.04), MAG, { bone: pitch, at: [0, 1.44, -1.2] }));
  // antenna
  b.spike([-0.8, 1.8, 0.0], [0, 1, 0], 1.0, 0.015, STEEL, { bone: hull, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), MAG, { bone: hull, at: [-0.8, 2.85, 0.0] }));
  // hover thrusters at wheel positions
  for (const [k, s, z] of [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]] as const) {
    const pod = b.joint(`thruster${k}`, { parent: hull, at: [s * 1.15, 0.35, z], dir: [0, 1, 0], role: "hinge" });
    const T = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => b.part(g, c, { bone: pod, at: at as any, ...o });
    b.rod([s * 0.95, 0.5, z], [s * 1.15, 0.45, z], 0.06, STEEL, { bone: pod, sides: 6 });
    T(new THREE.CylinderGeometry(0.46, 0.38, 0.3, 10), TRIM, [s * 1.15, 0.38, z], { flat: true });
    T(new THREE.TorusGeometry(0.44, 0.04, 5, 12), STEEL, [s * 1.15, 0.52, z], { rotation: [90, 0, 0] });
    T(new THREE.CylinderGeometry(0.34, 0.4, 0.14, 10), DARK, [s * 1.15, 0.2, z], { flat: true });
    glow(T(cyl(0.3, 0.03, 10), NEON, [s * 1.15, 0.12, z]), 1.5);
    glow(T(new THREE.TorusGeometry(0.2, 0.025, 4, 10), MAG, [s * 1.15, 0.1, z], { rotation: [90, 0, 0] }));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      T(box(0.05, 0.12, 0.05), STEEL, [s * 1.15 + Math.cos(a) * 0.46, 0.38, z + Math.sin(a) * 0.46]);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      T(box(0.22, 0.02, 0.04), DARK, [s * 1.15 + Math.cos(a) * 0.15, 0.55, z + Math.sin(a) * 0.15], { rotation: [0, -a * 57.3, 0] });
    }
  }
  // rear main thruster
  P(box(1.0, 0.5, 0.3), TRIM, [0, 0.85, -2.75]);
  for (const s of [1, -1]) {
    P(cyl(0.2, 0.3, 10), STEEL, [s * 0.3, 0.85, -2.9], { rotation: [90, 0, 0] });
    glow(P(cyl(0.15, 0.03, 10), NEON, [s * 0.3, 0.85, -3.06], { rotation: [90, 0, 0] }), 1.5);
  }
  // underglow strip and cables
  glow(P(box(1.5, 0.03, 4.6), NEON, [0, -0.04, 0]));
  for (let i = 0; i < 4; i++)
    b.rod([0.5, 0.2, 1.5 - i * 0.2], [1.0, 0.4, 1.55], 0.015, DARK, { bone: hull, sides: 4 });
  for (let i = 0; i < 6; i++)
    P(box(0.1 + R() * 0.1, 0.06, 0.1), i % 2 ? DARK : STEEL, [(R() - 0.5) * 1.4, 1.79, -0.1 + R() * 0.5]);

  return b.root;
}
```