import * as THREE from "three";
import { createBuilder, frame, rng, paint, mottle } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "riot_interceptor",
  description: "Corporate riot-control interceptor truck with roof water cannon and neon light bars, cyberpunk style.",
};

const BODY = "#1d2230";
const BODY2 = "#2b3347";
const DARK = "#0b0d12";
const STEEL = "#6d7587";
const GLASS = "#25e6ff";
const NEON_M = "#ff2fa8";
const NEON_C = "#18f0ff";
const AMBER = "#ffb02e";
const TYRE = "#111114";
const RED = "#ff2a3a";

const hull = paint((p, n) => {
  const base = n.y > 0.5 ? "#2a3248" : "#1d2230";
  return Math.abs(((p.z * 3) % 1)) < 0.03 ? DARK : base;
});

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const R = rng(5);
  const chassis = b.joint("chassis", { at: [0, 0.6, 0] });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 10) => new THREE.CylinderGeometry(r, r, h, s);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at, ...o });

  // Lower body
  P(box(2.0, 0.5, 5.2), hull, [0, 0.85, 0]);
  P(box(1.8, 0.12, 5.0), DARK, [0, 0.55, 0]);
  // Hood sloping
  b.frustumBox([0, 1.15, 1.2], [0, 1.2, 2.55], [1.9, 0.3], [1.7, 0.18], { bone: chassis, color: BODY2 });
  // Cab
  P(box(1.9, 0.75, 1.7), BODY2, [0, 1.5, 0.2]);
  P(box(1.7, 0.1, 1.5), BODY, [0, 1.93, 0.15]);
  // Windscreen & side windows (glow glass)
  glow(P(box(1.7, 0.5, 0.05), GLASS, [0, 1.52, 1.07], { rotation: [-22, 0, 0] }), 0.6);
  for (const s of [1, -1]) {
    glow(P(box(0.04, 0.4, 1.2), GLASS, [s * 0.96, 1.55, 0.2]), 0.5);
    P(box(0.05, 0.3, 0.9), DARK, [s * 0.98, 1.05, 0.1]);
  }
  // Rear hull / equipment box
  P(box(1.95, 0.9, 2.2), hull, [0, 1.3, -1.5]);
  P(box(1.8, 0.12, 2.0), STEEL, [0, 1.8, -1.5]);
  // Armour ribs
  for (let i = 0; i < 5; i++) for (const s of [1, -1]) P(box(0.06, 0.6, 0.12), STEEL, [s * 1.0, 1.3, -0.7 - i * 0.4]);

  // Bumper with ram
  P(box(2.2, 0.35, 0.3), STEEL, [0, 0.6, 2.7]);
  for (let i = -4; i <= 4; i++) P(new THREE.ConeGeometry(0.06, 0.18, 6), DARK, [i * 0.24, 0.6, 2.9], { rotation: [90, 0, 0] });
  // Grille & headlights
  P(box(1.0, 0.3, 0.05), DARK, [0, 0.95, 2.57]);
  for (const s of [1, -1]) {
    glow(P(box(0.4, 0.1, 0.06), AMBER, [s * 0.7, 1.0, 2.58]), 1.6);
    P(box(0.9, 0.04, 0.04), NEON_C, [s * 0.1, 0.9, 2.6]);
  }
  glow(P(box(1.4, 0.04, 0.04), NEON_C, [0, 0.85, 2.6]), 2);

  // Roof light bar
  P(box(1.5, 0.12, 0.25), DARK, [0, 2.05, 0.6]);
  for (let i = 0; i < 6; i++)
    glow(P(box(0.2, 0.08, 0.2), i % 2 ? RED : NEON_C, [-0.62 + i * 0.25, 2.12, 0.6]), 2.2);

  // Neon flank strips
  for (const s of [1, -1]) {
    glow(P(box(0.04, 0.05, 4.8), NEON_M, [s * 1.02, 0.78, 0]), 2);
    glow(P(box(0.04, 0.05, 2.0), NEON_C, [s * 1.0, 1.7, -1.5]), 2);
    glow(P(box(0.05, 0.05, 0.8), NEON_M, [s * 0.97, 1.4, 0.2]), 1.5);
  }
  // Underglow
  glow(P(box(1.6, 0.04, 4.6), NEON_M, [0, 0.52, 0]), 1.5);

  // Water cannon turret on rear roof
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.95, -1.4], dir: [0, 1, 0] });
  b.part(cyl(0.45, 0.2, 12), STEEL, { bone: yaw, at: [0, 1.95, -1.4] });
  b.part(cyl(0.3, 0.35, 10), BODY2, { bone: yaw, at: [0, 2.2, -1.4] });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.45, -1.4], dir: [0, 0, 1] });
  for (const s of [1, -1]) b.part(box(0.08, 0.35, 0.4), STEEL, { bone: pitch, at: [s * 0.2, 2.45, -1.4] });
  b.part(cyl(0.14, 0.5, 10), DARK, { bone: pitch, at: [0, 2.5, -1.15], dir: [0, 0, 1] });
  b.part(cyl(0.11, 1.5, 10), STEEL, { bone: pitch, at: [0, 2.55, -0.4], dir: [0, 0, 1] });
  b.part(cyl(0.16, 0.1, 10), AMBER, { bone: pitch, at: [0, 2.55, 0.3], dir: [0, 0, 1] });
  b.part(cyl(0.13, 0.08, 10), DARK, { bone: pitch, at: [0, 2.55, 0.37], dir: [0, 0, 1] });
  glow(b.part(cyl(0.08, 0.06, 10), NEON_C, { bone: pitch, at: [0, 2.55, 0.4], dir: [0, 0, 1] }), 2);
  // Water tank bands and hose
  for (const z of [-1.0, -1.5, -2.0]) P(box(2.0, 0.08, 0.1), NEON_C, [0, 1.76, z], {});
  b.sweep([[0.3, 1.9, -1.9], [0.5, 2.3, -1.7], [0.1, 2.45, -1.4]], 0.04, { bone: chassis, color: DARK });

  // Emblem decal on tailgate
  const emblem = svg(`<svg viewBox="0 0 64 64"><polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="#0b0d12" stroke="#ff2fa8" stroke-width="4"/><path d="M18 40 L32 16 L46 40 Z" fill="#18f0ff"/><text x="32" y="54" font-size="9" fill="#fff" text-anchor="middle" font-family="sans-serif">RIOT</text></svg>`, { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { bone: chassis, at: [0, 1.3, -2.62], dir: [0, 0, -1], axis: "z", texture: emblem }), 1);
  for (const s of [1, -1]) {
    glow(P(box(0.3, 0.1, 0.05), RED, [s * 0.75, 0.95, -2.62]), 2);
    // doors
    const door = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="none"/><path d="M0 28 L24 4 M10 28 L34 4 M20 28 L44 4" stroke="#ffb02e" stroke-width="5"/></svg>`, { size: 128 });
    b.part(new THREE.PlaneGeometry(1.0, 0.4), "#ffffff", { bone: chassis, at: [s * 1.015, 0.95, 0.4], dir: [s, 0, 0], axis: "z", texture: door });
  }

  // Wheels
  for (const sx of [1, -1])
    for (const z of [1.55, -1.55]) {
      const w = b.joint(`wheel${sx > 0 ? "L" : "R"}${z > 0 ? "F" : "R"}`, { parent: chassis, at: [sx * 0.86, 0.45, z], dir: [sx, 0, 0] });
      b.part(cyl(0.45, 0.4, 14), TYRE, { bone: w, at: [sx * 0.86, 0.45, z], dir: [1, 0, 0] });
      b.part(cyl(0.28, 0.42, 10), STEEL, { bone: w, at: [sx * 0.88, 0.45, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.3, 0.025, 5, 16), NEON_C, { bone: w, at: [sx * 1.08, 0.45, z], dir: [1, 0, 0], axis: "z" }), 2);
      b.part(cyl(0.1, 0.46, 8), DARK, { bone: w, at: [sx * 0.88, 0.45, z], dir: [1, 0, 0] });
      // fender
      P(box(0.45, 0.1, 1.1), BODY2, [sx * 0.93, 0.95, z]);
    }
  void R; void mottle; void frame;
  return b.root;
}
