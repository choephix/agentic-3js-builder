```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "riot-interceptor",
  description: "Corporate riot-control interceptor truck with roof water cannon, armour plating and neon light bars, Cyberpunk 2077 style.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const NAVY = "#1b2230";
const STEEL = "#4a5360";
const DARK = "#0d0f14";
const GLASS = "#2bd8ff";
const YELLOW = "#f2d21b";
const PINK = "#ff2bd6";
const CYAN = "#2bf0ff";
const TYRE = "#15171b";

const hull = paint((p, n) => {
  const base = mix("#232b3a", "#34405a", smoothstep(0.3, 0.7, noise(p, 0.3, 3)));
  const seam = Math.abs(((p.z / 0.5) % 1) - 0.5) > 0.485 && Math.abs(n.y) < 0.7;
  if (seam) return "#0a0c10";
  if (noise(p, 0.04, 9) > 0.8 && n.y > 0) return "#7a8594";
  return mix(base, "#10141c", smoothstep(0.5, 0.0, p.y) * 0.6);
});
const chev = paint((p) => ((((p.x + p.y) / 0.12) % 1) + 1) % 1 < 0.5 ? YELLOW : "#15161a");

const logo = svg(
  `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#0d0f14"/><rect x="3" y="3" width="122" height="58" fill="none" stroke="#2bf0ff" stroke-width="3"/><text x="64" y="30" font-family="Arial Black,Arial" font-weight="900" font-size="24" fill="#f2f2f2" text-anchor="middle">NCPD</text><text x="64" y="52" font-family="Arial" font-weight="900" font-size="14" fill="#ff2bd6" text-anchor="middle">RIOT CONTROL</text></svg>`,
  { size: 256 },
);
const scr = svg(
  `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><circle cx="80" cy="50" r="24" fill="none" stroke="#2bf0ff" stroke-width="3"/><line x1="40" y1="50" x2="120" y2="50" stroke="#2bf0ff" stroke-width="2"/><line x1="80" y1="14" x2="80" y2="86" stroke="#2bf0ff" stroke-width="2"/><rect x="8" y="88" width="80" height="6" fill="#ff2bd6"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "riot-interceptor" });
  const r = rng(5);
  const chassis = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at: at as any, ...o });
  const neon = (a: number[], d: number[], c: string, rad = 0.02) =>
    glow(b.rod(a as any, d as any, rad, c, { bone: chassis, sides: 6, caps: "flat" }), 1.7);

  // frame and body
  for (const s of [1, -1]) P(box(0.1, 0.16, 4.9), DARK, [s * 0.5, 0.58, 0]);
  P(box(1.9, 0.5, 5.2), hull, [0, 0.95, 0]); // lower slab
  b.frustumBox([0, 1.2, 1.3], [0, 1.0, 2.7], [1.9, 0.5], [1.8, 0.4], { bone: chassis, color: hull }); // nose
  P(box(1.9, 0.95, 2.3), hull, [0, 1.65, -0.2]); // cab/trooper box
  P(box(2.0, 0.12, 2.4), STEEL, [0, 2.17, -0.2]); // roof
  P(box(1.96, 0.7, 2.0), hull, [0, 1.55, -2.1]); // rear box
  // sloped glass
  P(box(1.7, 0.5, 0.05), GLASS, [0, 1.8, 0.98], { rotation: [-25, 0, 0] });
  glow(P(box(1.7, 0.5, 0.05), GLASS, [0, 1.8, 0.99], { rotation: [-25, 0, 0] }), 0.3);
  for (const s of [1, -1]) {
    P(box(0.04, 0.3, 1.5), "#0b1a22", [s * 0.97, 1.85, -0.2]); // armoured slit window
    P(box(0.05, 0.7, 0.2), STEEL, [s * 0.97, 1.5, 0.35]);
    // side plates with yellow chevrons
    P(box(0.06, 0.28, 1.6), chev, [s * 0.97, 1.1, -0.1]);
    P(box(0.12, 0.5, 1.2), hull, [s * 0.98, 0.95, 1.9]); // fender
    // skirts
    P(box(0.06, 0.3, 2.4), STEEL, [s * 1.0, 0.62, 0]);
    // mirrors
    b.rod([s * 0.95, 1.9, 0.9], [s * 1.2, 1.95, 0.95], 0.02, STEEL, { bone: chassis });
    P(box(0.05, 0.22, 0.15), DARK, [s * 1.22, 1.95, 0.95]);
    // headlights
    glow(P(box(0.4, 0.1, 0.05), "#e6ffff", [s * 0.65, 1.15, 2.72]), 1.5);
    // cage over rear lights
    glow(P(box(0.3, 0.08, 0.04), "#ff1f3d", [s * 0.7, 1.7, -3.12]), 1.5);
    // exhaust stacks
    P(cyl(0.05, 0.9, 6), STEEL, [s * 0.8, 2.0, -1.1]);
  }
  // front ram bumper with teeth
  P(box(2.1, 0.4, 0.3), chev, [0, 0.7, 2.75]);
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.55, 2.9], [0, 0, 1], 0.2, 0.05, STEEL, { bone: chassis, sides: 5 });
  P(box(1.1, 0.34, 0.06), DARK, [0, 1.0, 2.72]); // grille
  for (let i = 0; i < 5; i++) P(box(1.0, 0.02, 0.03), STEEL, [0, 0.89 + i * 0.07, 2.76]);
  // push plow plates
  P(box(2.1, 0.25, 0.4), STEEL, [0, 0.5, -2.75]);
  // roof light bar
  P(box(1.8, 0.14, 0.25), DARK, [0, 2.3, 0.7]);
  for (let i = 0; i < 6; i++) glow(P(box(0.26, 0.08, 0.04), i % 2 ? "#ff1f3d" : "#2b6bff", [-0.75 + i * 0.3, 2.31, 0.84]), 1.8);
  const flash = b.joint("beacon", { parent: chassis, at: [0.7, 2.25, -1.2], dir: [0, 1, 0], role: "hinge" });
  glow(b.part(new THREE.SphereGeometry(0.12, 8, 5, 0, 7, 0, 1.6), PINK, { bone: flash, at: [0.7, 2.25, -1.2] }), 1.8);
  // neon
  for (const s of [1, -1]) {
    neon([s * 1.02, 1.36, -3.0], [s * 1.02, 1.36, 1.2], s > 0 ? PINK : CYAN);
    neon([s * 0.97, 0.45, -2.2], [s * 0.97, 0.45, 2.2], CYAN, 0.025);
  }
  neon([-0.95, 2.1, 1.0], [0.95, 2.1, 1.0], PINK);
  neon([-0.9, 1.1, -3.1], [0.9, 1.1, -3.1], PINK);
  // decals & screen
  b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", { bone: chassis, at: [1.005, 1.55, -0.6], dir: [1, 0, 0], axis: "z", texture: logo });
  b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", { bone: chassis, at: [-1.005, 1.55, -0.6], dir: [-1, 0, 0], axis: "z", texture: logo });
  glow(b.part(new THREE.PlaneGeometry(0.6, 0.38), "#ffffff", { bone: chassis, at: [0, 1.6, -3.12], dir: [0, 0, -1], axis: "z", texture: scr }), 1.4);
  // rivets along roof edge
  for (let i = 0; i < 12; i++) for (const s of [1, -1])
    P(cyl(0.02, 0.03, 6), "#9aa3b0", [s * 0.95, 2.25, -1.3 + i * 0.2]);

  // water cannon turret on the roof rear
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.23, -1.0], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.7, -1.0], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.45, 0.1, 14), STEEL, { bone: chassis, at: [0, 2.28, -1.0] });
  b.part(cyl(0.35, 0.3, 12), NAVY, { bone: yaw, at: [0, 2.45, -1.0], flat: true });
  for (const s of [1, -1]) b.part(box(0.06, 0.4, 0.5), STEEL, { bone: yaw, at: [s * 0.25, 2.65, -1.0] });
  b.part(cyl(0.22, 0.5, 10), "#2a4a66", { bone: pitch, at: [0, 2.7, -1.15], rotation: [90, 0, 0], flat: true }); // tank breech
  b.rod([0, 2.7, -1.0], [0, 2.7, 0.55], 0.1, STEEL, { bone: pitch, sides: 10 });
  b.part(cyl(0.15, 0.3, 10), YELLOW, { bone: pitch, at: [0, 2.7, 0.1], rotation: [90, 0, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.15, 0.09, 0.18, 10), DARK, { bone: pitch, at: [0, 2.7, 0.62], rotation: [90, 0, 0] });
  glow(b.part(cyl(0.055, 0.03, 8), "#8fe8ff", { bone: pitch, at: [0, 2.7, 0.72], rotation: [90, 0, 0] }), 1.6);
  b.rod([0.2, 2.6, -1.2], [0.5, 2.3, -1.6], 0.03, DARK, { bone: pitch, sides: 6 }); // hose
  // side tank with hazard stripe
  P(cyl(0.3, 1.3, 12), "#2a4a66", [0, 2.55, -2.1], { rotation: [90, 0, 0], flat: true });
  glow(P(box(0.5, 0.04, 0.02), "#7df9ff", [0, 2.58, -2.78]), 1.3);

  // wheels
  for (const [k, s, z] of [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]] as const) {
    const susp = b.joint(`susp${k}`, { parent: chassis, at: [s * 0.5, 0.58, z], dir: [0, 1, 0], role: "hinge" });
    const hub = [s * 0.9, 0.42, z];
    const spin = b.joint(`wheel${k}`, { parent: susp, at: hub as any, dir: [0, 1, 0], role: "hinge" });
    b.rod([s * 0.5, 0.45, z], hub as any, 0.05, DARK, { bone: susp, sides: 6 });
    b.part(cyl(0.42, 0.32, 14), TYRE, { bone: spin, at: hub as any, rotation: [0, 0, 90], flat: true });
    b.part(cyl(0.26, 0.34, 8), STEEL, { bone: spin, at: hub as any, rotation: [0, 0, 90], flat: true });
    glow(b.part(new THREE.TorusGeometry(0.3, 0.015, 5, 16), k[1] === "L" ? PINK : CYAN, { bone: spin, at: [s * 1.08, 0.42, z], rotation: [0, 90, 0] }), 1.6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(cyl(0.02, 0.04, 6), "#9aa3b0", { bone: spin, at: [s * 1.09, 0.42 + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a)], rotation: [0, 0, 90] });
    }
    // arch
    b.part(box(0.1, 0.1, 1.0), hull, { bone: chassis, at: [s * 1.0, 0.9 + r() * 0, z] });
  }
  return b.root;
}
```