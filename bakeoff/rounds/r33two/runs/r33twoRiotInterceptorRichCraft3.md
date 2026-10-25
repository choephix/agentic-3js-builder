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

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const root = b.joint("hull", { at: [0, 0.6, 0] });
  const turret = b.joint("turret", { parent: root, at: [0, 1.75, -0.3] });
  const barrel = b.joint("barrel", { parent: turret, at: [0, 0.2, 0.2], dir: [0, 0.15, 1], role: "hinge" });

  const ARMOR = panelled(metal("iron"), { size: 0.4, rivets: 0.06 });
  const WHITE = panelled("#d9dde6", { size: 0.5, rivets: 0 });
  const DARK = "#14131a";
  const YEL = "#ffd400";
  const CYAN = "#19f2ff";
  const PINK = "#ff2a8a";
  const RED = "#ff2030";

  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: root, at, ...o });

  // body
  box(2.0, 0.7, 4.6, WHITE, [0, 0.95, 0]);
  box(2.1, 0.35, 4.7, ARMOR, [0, 0.55, 0]);
  box(1.8, 0.6, 2.2, WHITE, [0, 1.55, -0.5]);
  // hood slope
  b.frustumBox([0, 1.25, 1.7], [0, 1.3, 2.4], [1.9, 0.5], [1.7, 0.3], { bone: root, color: ARMOR });
  // bumper ram
  box(2.2, 0.4, 0.3, ARMOR, [0, 0.55, 2.45]);
  for (const s of [1, -1]) {
    b.spike([s * 0.8, 0.6, 2.55], [0, 0, 1], 0.25, 0.1, { bone: root, color: YEL });
    // wheels
    for (const z of [1.5, -1.5]) {
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.45, 12), "#0c0c10", { bone: root, at: [s * 1.1, 0.0, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.47, 8), metal("steel"), { bone: root, at: [s * 1.1, 0.0, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.3, 0.025, 4, 12), CYAN, { bone: root, at: [s * 1.34, 0.0, z], dir: [1, 0, 0], axis: "z" }), 1.5);
    }
    // windshield side windows
    glow(box(0.04, 0.3, 1.5, "#2a6a8a", [s * 0.92, 1.6, -0.5]), 0.6);
    // neon skirts
    glow(box(0.05, 0.06, 3.6, s > 0 ? CYAN : PINK, [s * 1.07, 0.5, 0]), 2);
    // shield plates
    box(0.08, 0.5, 1.8, ARMOR, [s * 1.05, 1.0, 0]);
    // tail lights
    glow(box(0.5, 0.12, 0.05, RED, [s * 0.6, 1.0, -2.32]), 2);
  }
  // windshield
  glow(box(1.7, 0.4, 0.05, "#1d5a7a", [0, 1.6, 0.62], { rotation: [-20, 0, 0] }), 0.7);
  // roof light bar
  box(1.7, 0.1, 0.35, DARK, [0, 1.9, 0.35]);
  for (let i = 0; i < 8; i++) {
    const c = i < 4 ? RED : "#2a5cff";
    glow(box(0.19, 0.12, 0.3, c, [-0.74 + i * 0.21, 1.98, 0.35]), 2.2);
  }
  // front neon bars
  glow(box(1.7, 0.06, 0.04, CYAN, [0, 0.85, 2.42]), 2.5);
  glow(box(1.2, 0.05, 0.04, PINK, [0, 0.72, 2.5]), 2.5);
  for (const s of [1, -1]) glow(box(0.35, 0.14, 0.05, "#fff6c0", [s * 0.7, 1.05, 2.4]), 2.5);
  // hazard stripe
  const stripe = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffd400"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#14131a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(2.0, 0.3), "#ffffff", { bone: root, at: [0, 0.4, 2.62], dir: [0, 0, 1], axis: "z", texture: stripe });
  // corp emblem on doors
  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#14131a" stroke="#19f2ff" stroke-width="4"/><path d="M18 40 L32 14 L46 40Z" fill="none" stroke="#ff2a8a" stroke-width="5"/><text x="32" y="56" font-size="9" text-anchor="middle" fill="#ffd400" font-family="sans-serif">NCPD-X</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", { bone: root, at: [s * 1.011, 1.0, 0.2], dir: [s, 0, 0], axis: "z", texture: logo });

  // turret base
  b.part(new THREE.CylinderGeometry(0.6, 0.7, 0.25, 10), ARMOR, { bone: root, at: [0, 1.95, -0.3] });
  b.part(new THREE.CylinderGeometry(0.45, 0.5, 0.35, 8), metal("steel"), { bone: turret, at: [0, 0.1, -0.3 + 0] , frame: undefined });
  // cannon body
  b.part(new THREE.BoxGeometry(0.5, 0.4, 0.7), WHITE, { bone: turret, at: [0, 0.3, -0.1] });
  // water tank on rear roof
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 10), "#2a3a55", { bone: root, at: [0, 1.95, -1.4], dir: [0, 0, 1] });
  glow(b.part(new THREE.TorusGeometry(0.5, 0.03, 4, 12), CYAN, { bone: root, at: [0, 1.95, -0.9], axis: "z" }), 2);
  glow(b.part(new THREE.TorusGeometry(0.5, 0.03, 4, 12), CYAN, { bone: root, at: [0, 1.95, -1.9], axis: "z" }), 2);
  // barrel
  b.rod([0, 1.95, -0.1], [0, 2.2, 1.0], 0.12, { bone: barrel, color: metal("steel") });
  b.rod([0, 2.2, 1.0], [0, 2.25, 1.4], [0.17, 0.17], { bone: barrel, color: ARMOR });
  glow(b.part(new THREE.TorusGeometry(0.15, 0.03, 4, 10), PINK, { bone: barrel, at: [0, 2.25, 1.42] }), 2.5);
  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 1.9, -2.0], [s * 0.8, 2.8, -2.0], 0.02, { bone: root, color: DARK });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: root, at: [s * 0.8, 2.82, -2.0] }), 3);
  }
  void rng;
  return b.root;
}
```