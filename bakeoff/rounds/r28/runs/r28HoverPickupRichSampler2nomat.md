```ts
import * as THREE from "three";
import { createBuilder, rng, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "hoverTech",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk, neon trim and roof turret.",
};

const BODY = "#3b4350";
const BODY2 = "#59624f";
const DARK = "#14161d";
const STEEL = "#7b8591";
const NEON = "#18f0e0";
const PINK = "#ff2d8a";
const AMBER = "#ffb02e";
const GLASS = "#2a6f86";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hoverTech" });
  const R = rng(5);
  const chassis = b.joint("chassis", { at: [0, 0.7, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at: at as any, ...o });

  // lower hull
  P(box(2.0, 0.35, 5.2), DARK, [0, 0.62, 0]);
  P(box(1.9, 0.3, 5.0), BODY, [0, 0.9, 0], {});
  // cab
  P(box(1.9, 0.6, 1.6), BODY2, [0, 1.35, 0.5]);
  P(box(1.7, 0.1, 1.4), BODY, [0, 1.95, 0.4]);
  P(box(1.8, 0.5, 0.05), GLASS, [0, 1.65, 1.3], { rotation: [-25, 0, 0] });
  P(box(1.8, 0.4, 0.05), GLASS, [0, 1.65, -0.3]);
  for (const s of [1, -1]) {
    P(box(0.05, 0.4, 1.0), GLASS, [s * 0.95, 1.65, 0.5]);
    P(box(0.1, 0.5, 0.1), DARK, [s * 0.9, 1.65, 1.15], { rotation: [-25, 0, 0] });
  }
  // sloped hood
  b.frustumBox([0, 1.15, 1.3], [0, 1.0, 2.55], [1.9, 0.5], [1.8, 0.3], { bone: chassis, color: BODY });
  P(box(0.3, 0.04, 1.0), AMBER, [0, 1.3, 1.9]);
  // bed with armour plates
  P(box(1.95, 0.08, 2.2), DARK, [0, 1.08, -1.45]);
  for (const s of [1, -1]) {
    P(box(0.08, 0.55, 2.2), BODY, [s * 0.95, 1.38, -1.45]);
    P(box(0.12, 0.06, 2.2), STEEL, [s * 0.95, 1.68, -1.45]);
    glow(P(box(0.02, 0.05, 2.0), s > 0 ? NEON : PINK, [s * 1.0, 1.2, -1.45]), 1.4);
    glow(P(box(0.02, 0.04, 4.4), s > 0 ? PINK : NEON, [s * 1.0, 0.75, 0]), 1.4);
    for (let i = 0; i < 4; i++) P(box(0.04, 0.35, 0.4), STEEL, [s * 1.0, 1.4, -0.7 - i * 0.5]);
  }
  P(box(1.95, 0.55, 0.08), BODY, [0, 1.38, -2.55]);
  P(box(1.95, 0.5, 0.08), BODY, [0, 1.38, -0.35]);
  // front bumper + ram
  P(box(2.1, 0.3, 0.2), STEEL, [0, 0.8, 2.65]);
  for (let i = -3; i <= 3; i++) b.spike([i * 0.28, 0.8, 2.75], [0, 0, 1], 0.25, 0.05, STEEL, { bone: chassis, sides: 5 });
  // headlights
  for (const s of [1, -1]) {
    glow(P(box(0.4, 0.1, 0.04), "#fffbd0", [s * 0.65, 1.0, 2.7]), 1.6);
    glow(P(box(0.3, 0.06, 0.04), PINK, [s * 0.65, 0.9, -2.62]), 1.5);
  }
  P(box(0.9, 0.3, 0.05), DARK, [0, 0.95, 2.72]);
  for (let i = 0; i < 4; i++) P(box(0.8, 0.02, 0.03), STEEL, [0, 0.85 + i * 0.07, 2.76]);
  // light bar + antenna
  P(box(1.2, 0.08, 0.12), DARK, [0, 2.05, 0.9]);
  for (let i = 0; i < 4; i++) glow(P(cyl(0.05, 0.04, 8), AMBER, [-0.45 + i * 0.3, 2.1, 0.95]), 1.5);
  b.spike([-0.8, 1.98, -0.1], [0, 1, 0], 1.3, 0.02, STEEL, { bone: chassis, sides: 5 });
  glow(P(new THREE.SphereGeometry(0.04, 6, 4), PINK, [-0.8, 3.3, -0.1]), 2);

  // turret in bed
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.75, -1.4], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.1, -1.4], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.4, 0.3, 10), STEEL, { bone: yaw, at: [0, 1.85, -1.4], flat: true });
  b.part(box(0.6, 0.35, 0.7), BODY2, { bone: yaw, at: [0, 2.1, -1.4] });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 2.1, -1.3], [s * 0.1, 2.1, -0.2], 0.05, STEEL, { bone: pitch, sides: 8 });
    b.part(cyl(0.09, 0.2, 8), DARK, { bone: pitch, at: [s * 0.1, 2.1, -0.2], rotation: [90, 0, 0] });
    glow(b.part(cyl(0.03, 0.03, 6), NEON, { bone: pitch, at: [s * 0.1, 2.1, -0.08], rotation: [90, 0, 0] }), 1.6);
  }
  b.part(box(0.2, 0.15, 0.3), DARK, { bone: pitch, at: [0.4, 2.1, -1.4] });

  // hover thrusters at four corners
  for (const sx of [1, -1])
    for (const z of [1.55, -1.55]) {
      const k = `${sx > 0 ? "L" : "R"}${z > 0 ? "F" : "R"}`;
      const th = b.joint(`thruster${k}`, { parent: chassis, at: [sx * 1.15, 0.6, z], dir: [0, 1, 0], role: "hinge" });
      b.part(box(0.4, 0.2, 0.8), DARK, { bone: chassis, at: [sx * 1.0, 0.7, z] });
      b.part(cyl(0.45, 0.3, 12), BODY, { bone: th, at: [sx * 1.3, 0.55, z], flat: true });
      b.part(new THREE.TorusGeometry(0.46, 0.05, 5, 14), STEEL, { bone: th, at: [sx * 1.3, 0.4, z], rotation: [90, 0, 0] });
      glow(b.part(cyl(0.36, 0.04, 12), NEON, { bone: th, at: [sx * 1.3, 0.2, z], flat: true }), 1.8);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(box(0.05, 0.03, 0.34), DARK, { bone: th, at: [sx * 1.3 + Math.sin(a) * 0.18, 0.17, z + Math.cos(a) * 0.18], rotation: [0, (a * 180) / Math.PI, 0] });
      }
      b.part(cyl(0.08, 0.3, 6), STEEL, { bone: th, at: [sx * 1.3, 0.8, z] });
    }
  // rear main thrusters
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.22, 0], [0.17, 0.1], [0.3, 0.5], [0.26, 0.5], [0.13, 0.12], [0, 0.14]], { at: [s * 0.5, 1.0, -2.65], axis: [0, 0, -1], segments: 10, bone: chassis, color: STEEL });
    glow(P(cyl(0.12, 0.03, 10), AMBER, [s * 0.5, 1.0, -2.8], { rotation: [90, 0, 0] }), 2);
  }
  // cables / hoses
  for (const s of [1, -1]) {
    const path = catmull([[s * 0.7, 1.9, 0.1], [s * 0.9, 1.7, -0.3], [s * 1.0, 1.25, -0.9]]);
    b.sweep(path, 0.02, DARK, { bone: chassis, sides: 6 });
  }
  // underside glow strip
  glow(P(box(1.2, 0.03, 3.5), NEON, [0, 0.42, 0]), 1.2);
  // mirrors
  for (const s of [1, -1]) {
    P(box(0.05, 0.05, 0.25), STEEL, [s * 1.05, 1.7, 1.2]);
    P(box(0.05, 0.22, 0.14), DARK, [s * 1.12, 1.7, 1.3]);
  }
  // panel greebles on hood
  for (let i = 0; i < 12; i++) {
    const s = R() < 0.5 ? 1 : -1;
    P(box(0.06 + R() * 0.1, 0.03, 0.06 + R() * 0.1), i % 2 ? STEEL : DARK, [s * (0.3 + R() * 0.5), 1.33, 1.6 + R() * 0.9]);
  }

  return b.root;
}
```