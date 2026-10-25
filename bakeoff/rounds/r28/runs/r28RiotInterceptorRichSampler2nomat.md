```ts
import * as THREE from "three";
import { createBuilder, rng, frame, catmull, paint, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with a roof water cannon and neon light bars, Cyberpunk 2077 style.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const R = rng(5);

  const NAVY = "#14192b", HULL = paint((p, n) => {
    const t = noise(p, 0.3, 3);
    const c = mix("#1b2238", "#2c3558", t);
    return mix(c, "#4a5a8a", smoothstep(0.6, 1, n.y) * 0.5);
  });
  const DARK = "#0c0e16", STEEL = "#6d7587", TYRE = "#17181c", CYAN = "#19f0ff", PINK = "#ff2d95", YEL = "#ffd21a", GLASS = "#0f3a4a", WHITE = "#e8ecf4";

  const chassis = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });
  const B = chassis;
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: B, at, ...o });

  // frame & body
  P(box(1.7, 0.2, 5.0), DARK, [0, 0.6, 0]);
  b.frustumBox([0, 0.95, -2.5], [0, 0.95, 2.6], [2.1, 0.7], [1.9, 0.5], { bone: B, color: HULL });
  P(box(2.15, 0.12, 4.6), NAVY, [0, 0.62, 0]); // sill
  // cab
  b.frustumBox([0, 1.5, -1.6], [0, 1.5, 1.0], [1.9, 0.55], [1.7, 0.5], { bone: B, color: HULL });
  P(box(1.76, 0.1, 2.3), NAVY, [0, 1.82, -0.3]); // roof
  P(box(1.74, 0.42, 0.05), GLASS, [0, 1.55, 1.0], { rotation: [-30, 0, 0] });
  P(box(1.74, 0.36, 0.05), GLASS, [0, 1.55, -1.6]);
  for (const s of [1, -1]) {
    P(box(0.04, 0.34, 1.1), GLASS, [s * 0.96, 1.55, 0.4]);
    P(box(0.04, 0.34, 0.8), GLASS, [s * 0.96, 1.55, -0.85]);
    P(box(0.2, 0.5, 4.5), "#0a1c2e", [s * 1.0, 0.9, 0]); // armour skirt
    // armour plates + stripes
    for (let i = 0; i < 4; i++) P(box(0.05, 0.36, 0.95), HULL, [s * 1.04, 1.0, -1.7 + i * 1.1]);
    glow(P(box(0.03, 0.04, 4.3), s > 0 ? CYAN : PINK, [s * 1.08, 0.72, 0]), 1.6);
    // wheels
    for (const z of [-1.55, 1.55]) {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${z > 0 ? "F" : "R"}`, { parent: chassis, at: [s * 0.95, 0.45, z], dir: [0, 1, 0], role: "hinge" });
      b.part(cyl(0.45, 0.4, 14), TYRE, { bone: w, at: [s * 0.95, 0.45, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.27, 0.42, 10), STEEL, { bone: w, at: [s * 0.95, 0.45, z], rotation: [0, 0, 90], flat: true });
      glow(b.part(new THREE.TorusGeometry(0.2, 0.02, 5, 14), PINK, { bone: w, at: [s * (0.95 + 0.22), 0.45, z], rotation: [0, 90, 0] }), 1.4);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(cyl(0.02, 0.05, 6), DARK, { bone: w, at: [s * 1.17, 0.45 + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a)], rotation: [0, 0, 90] });
      }
    }
    // fender arches
    P(box(0.12, 0.1, 1.2), NAVY, [s * 1.06, 1.0, 1.55]);
    P(box(0.12, 0.1, 1.2), NAVY, [s * 1.06, 1.0, -1.55]);
    // headlights
    glow(P(box(0.5, 0.07, 0.05), YEL, [s * 0.65, 1.12, 2.62]), 1.6);
    glow(P(box(0.3, 0.04, 0.03), CYAN, [s * 0.65, 0.98, 2.62]), 1.4);
    // mirrors w/ cameras
    P(box(0.06, 0.06, 0.3), DARK, [s * 1.1, 1.75, 0.9]);
    P(box(0.12, 0.2, 0.08), DARK, [s * 1.2, 1.75, 0.8]);
    // exhaust
    b.rod([s * 0.7, 0.5, -2.4], [s * 0.7, 0.5, -2.75], 0.07, STEEL, { bone: B, sides: 8 });
    // rear lights
    glow(P(box(0.6, 0.08, 0.04), PINK, [s * 0.6, 1.2, -2.52]), 1.6);
  }

  // push bar / ram bumper
  P(box(2.2, 0.38, 0.22), DARK, [0, 0.65, 2.68]);
  for (let i = -5; i <= 5; i++) P(box(0.1, 0.36, 0.08), STEEL, [i * 0.2, 0.9, 2.82]);
  P(box(2.2, 0.08, 0.1), STEEL, [0, 1.09, 2.82]);
  glow(P(box(1.6, 0.05, 0.03), CYAN, [0, 0.48, 2.8]), 1.8);
  // grille
  P(box(1.0, 0.3, 0.05), DARK, [0, 0.95, 2.6]);
  for (let i = 0; i < 5; i++) P(box(0.9, 0.02, 0.03), STEEL, [0, 0.85 + i * 0.06, 2.64]);

  // neon roof light bars (front, rear) alternating red/blue style
  const bar = (z: number, y: number) => {
    P(box(1.8, 0.12, 0.22), DARK, [0, y, z]);
    for (let i = 0; i < 6; i++) glow(P(box(0.28, 0.1, 0.18), i < 3 ? PINK : CYAN, [-0.72 + i * 0.288, y + 0.08, z]), 2);
  };
  bar(0.75, 1.93);
  bar(-1.2, 1.93);
  glow(P(box(1.6, 0.03, 0.03), CYAN, [0, 1.35, 2.5]), 1.8);

  // water cannon on roof
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.9, -0.25], dir: [0, 1, 0], up: [1, 0, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.2, -0.25], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.4, 0.06, 14), STEEL, { bone: chassis, at: [0, 1.9, -0.25], flat: true });
  b.part(cyl(0.3, 0.2, 12), NAVY, { bone: yaw, at: [0, 2.02, -0.25], flat: true });
  for (const s of [1, -1]) b.part(box(0.06, 0.34, 0.4), NAVY, { bone: yaw, at: [s * 0.2, 2.2, -0.25] });
  b.part(cyl(0.2, 0.7, 12), "#c9d3e6", { bone: pitch, at: [0, 2.2, -0.45], rotation: [90, 0, 0], flat: true }); // water tank-barrel
  b.rod([0, 2.2, -0.1], [0, 2.2, 1.3], 0.1, STEEL, { bone: pitch, sides: 10 });
  b.part(cyl(0.15, 0.2, 10), DARK, { bone: pitch, at: [0, 2.2, 1.35], rotation: [90, 0, 0] });
  glow(b.part(cyl(0.09, 0.03, 10), CYAN, { bone: pitch, at: [0, 2.2, 1.46], rotation: [90, 0, 0] }), 1.8);
  b.part(new THREE.TorusGeometry(0.16, 0.03, 5, 12), PINK, { bone: pitch, at: [0, 2.2, 0.4] });
  glow(b.part(new THREE.TorusGeometry(0.2, 0.015, 5, 14), CYAN, { bone: pitch, at: [0, 2.2, -0.6] }), 1.6);
  b.rod([0.25, 2.1, -0.7], [0.55, 1.95, -1.4], 0.04, TYRE, { bone: chassis, sides: 6 }); // hose

  // rear tank with logo
  const logo = svg(`<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#101626"/><rect x="4" y="4" width="120" height="56" fill="none" stroke="#19f0ff" stroke-width="3"/><path d="M20 48 L36 16 L52 48 Z" fill="#ff2d95"/><text x="60" y="40" font-family="sans-serif" font-weight="bold" font-size="22" fill="#ffd21a">PAXCORP</text></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(1.1, 0.55), "#ffffff", { bone: B, at: [0, 1.3, -2.53], dir: [0, 0, -1], axis: "z", texture: logo });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.2, 0.5), "#ffffff", { bone: B, at: [s * 1.071, 1.0, 0.1], dir: [s, 0, 0], axis: "z", texture: logo });
  }
  // roof antennas & sensors
  b.spike([0.75, 1.9, -1.4], [0, 1, 0], 1.0, 0.015, STEEL, { bone: B, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), PINK, { bone: B, at: [0.75, 2.92, -1.4] }), 2);
  b.part(new THREE.SphereGeometry(0.14, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: B, at: [-0.6, 1.9, -0.9], flat: true });
  // rivet greebles on hood
  for (let i = 0; i < 10; i++) P(box(0.1 + R() * 0.1, 0.03, 0.1), i % 2 ? STEEL : DARK, [(R() - 0.5) * 1.4, 1.32, 1.4 + R() * 0.9]);
  // tear gas launchers
  for (const s of [1, -1]) for (let i = 0; i < 3; i++)
    b.rod([s * 0.8 + s * i * 0.07, 1.9, 0.2], [s * 0.85 + s * i * 0.07, 2.1, 0.55], 0.035, STEEL, { bone: B, sides: 7 });

  return b.root;
}
```