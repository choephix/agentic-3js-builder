```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with a roof water cannon and neon light bars, cyberpunk style.",
};

const HULL = "#1b1f2e";
const DARK = "#0b0c12";
const NEON_C = "#19f3ff";
const NEON_M = "#ff2bd6";
const NEON_Y = "#ffe600";
const RED = "#ff2244";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const R = rng(5);
  const body = b.joint("body", { at: [0, 0.6, 0] });
  const turret = b.joint("turret", { parent: body, at: [0, 1.75, -0.3], dir: [0, 1, 0] });
  const barrel = b.joint("barrel", { parent: turret, at: [0, 0.3, 0.1], dir: [0, 0.1, 1], role: "hinge" });

  const hullPaint = panelled(metal("iron", { tarnish: 0.2 }), { size: 0.3, rivets: 0.06, seam: "#05060a" });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: body, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // lower chassis and upper cabin
  P(box(2.1, 0.55, 5.2), hullPaint, [0, 0.62, 0]);
  P(box(1.9, 0.6, 3.6), hullPaint, [0, 1.2, -0.3]);
  // sloped hood
  P(box(1.9, 0.3, 1.5), hullPaint, [0, 1.0, 1.9], { rotation: [12, 0, 0] });
  // armoured bull bar
  P(box(2.2, 0.5, 0.25), metal("steel"), [0, 0.5, 2.75]);
  for (const x of [-0.7, -0.35, 0, 0.35, 0.7]) P(box(0.08, 0.5, 0.1), DARK, [x, 0.5, 2.9]);
  // windshield + side windows
  const glass = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0a1a2a"/><path d="M0 28L40 0h10L10 32z" fill="#19f3ff" opacity=".35"/><path d="M0 0h64" stroke="#19f3ff" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  P(new THREE.PlaneGeometry(1.7, 0.55), "#ffffff", [0, 1.45, 1.54], { rotation: [-25, 0, 0], texture: glass, axis: "z" });
  for (const s of [1, -1]) {
    P(new THREE.PlaneGeometry(2.4, 0.4), "#ffffff", [s * 0.96, 1.4, -0.3], { dir: [s, 0, 0], axis: "z", texture: glass });
    // armour side skirts and door emblems
    P(box(0.15, 0.4, 4.6), DARK, [s * 1.1, 0.4, 0]);
  }
  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2bd6" stroke-width="5"/><path d="M14 46L32 12l18 34z" fill="#ffe600"/><rect x="29" y="26" width="6" height="12" fill="#0b0c12"/></svg>`,
    { size: 128 },
  );
  const txt = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#e8e8ee"/><text x="64" y="23" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="#111">RIOT-CTRL</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    glow(P(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", [s * 1.056, 0.75, 0.4], { dir: [s, 0, 0], axis: "z", texture: logo }), 0.8);
    P(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", [s * 1.056, 0.75, -0.9], { dir: [s, 0, 0], axis: "z", texture: txt });
  }

  // wheels
  for (const sx of [1, -1])
    for (const z of [-1.7, 1.5]) {
      P(new THREE.CylinderGeometry(0.5, 0.5, 0.45, 14), "#111114", [sx * 1.1, -0.1, z], { dir: [1, 0, 0] });
      P(new THREE.CylinderGeometry(0.28, 0.28, 0.47, 8), metal("steel"), [sx * 1.1, -0.1, z], { dir: [1, 0, 0] });
      glow(P(new THREE.TorusGeometry(0.34, 0.025, 6, 16), NEON_C, [sx * 1.34, -0.1, z], { dir: [1, 0, 0], axis: "z" }), 1.5);
    }

  // neon light bars
  for (const s of [1, -1]) {
    glow(P(box(0.7, 0.14, 0.14), s > 0 ? RED : NEON_C, [s * 0.5, 1.88, 1.2]), 2);
    glow(P(box(0.9, 0.06, 0.05), NEON_M, [s * 0.5, 0.95, 2.62]), 2);
    glow(P(box(0.05, 0.08, 4.2), NEON_C, [s * 1.19, 0.62, 0]), 1.8);
  }
  glow(P(box(1.9, 0.1, 0.1), RED, [0, 1.58, -2.0]), 2);
  glow(P(box(1.7, 0.08, 0.06), RED, [0, 0.8, -2.62]), 2);
  // roof lightbar
  P(box(1.4, 0.12, 0.35), DARK, [0, 1.56, 0.9]);
  for (let i = 0; i < 6; i++) glow(P(box(0.2, 0.1, 0.3), i % 2 ? NEON_C : NEON_M, [-0.55 + i * 0.22, 1.66, 0.9]), 2.2);
  // headlights
  for (const s of [1, -1]) glow(P(box(0.4, 0.14, 0.08), NEON_Y, [s * 0.7, 0.85, 2.71]), 2);

  // water tank (rear) with hazard stripes
  const tankPaint = metal("steel", { polish: 0.3 });
  P(new THREE.CylinderGeometry(0.65, 0.65, 2, 10), tankPaint, [0, 1.8, -1.8], { dir: [0, 0, 1] });
  for (const z of [-2.6, -1.0]) P(new THREE.TorusGeometry(0.66, 0.05, 5, 12), NEON_Y, [0, 1.8, z], { axis: "z" });
  glow(P(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 10), NEON_C, [0, 2.4, -1.8]), 1.5);

  // turret + cannon
  b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.3, 8), metal("iron"), { bone: turret, at: [0, 1.9, -0.3] });
  b.part(box(0.5, 0.35, 0.6), hullPaint, { bone: turret, at: [0, 2.2, -0.3] });
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 1.5, 8), metal("steel"), { bone: barrel, at: [0, 2.3, 0.7], dir: [0, 0.05, 1] });
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.25, 8), DARK, { bone: barrel, at: [0, 2.31, 1.5], dir: [0, 0.05, 1] });
  glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), NEON_C, { bone: barrel, at: [0, 2.31, 1.64], dir: [0, 0.05, 1] }), 2.5);
  b.part(box(0.15, 0.3, 0.9), DARK, { bone: turret, at: [-0.35, 2.15, -0.35] });

  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 1.5, -2.3], [s * 0.9, 2.7, -2.4], 0.015, DARK, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: body, at: [s * 0.9, 2.72, -2.4] }), 2);
  }
  // rivet-ish bolts on hood
  for (let i = 0; i < 8; i++)
    P(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), metal("steel"), [-0.7 + R() * 1.4, 1.17, 1.4 + R() * 1.0]);

  // lift whole model so wheel bottoms touch y=0
  const box3 = new THREE.Box3().setFromObject(b.root, true);
  b.root.position.y -= box3.min.y;
  return b.root;
}
```