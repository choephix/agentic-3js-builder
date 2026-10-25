import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with a roof water cannon and neon light bars, cyberpunk style.",
};

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const body = b.joint("body", { at: [0, 0.5, 0] });
  const turret = b.joint("turret", { parent: body, at: [0, 1.45, -0.2], dir: [0, 0, 1] });
  const barrelJ = b.joint("barrel", { parent: turret, at: [0, 0.2, 0.2], dir: [0, 0, 1] });

  const HULL = panelled(metal("iron"), { size: 0.5, rivets: 0.08 });
  const DARK = "#14141c";
  const NAVY = "#1b2a4a";
  const CYAN = "#19f0ff";
  const PINK = "#ff2d95";
  const YEL = "#ffd21f";
  const WHITE = "#e9eef5";

  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...o });

  // lower chassis + cabin
  box(2.1, 0.6, 5, HULL, [0, 0.75, 0]);
  box(2.0, 0.5, 2.4, NAVY, [0, 1.2, -0.3]);
  b.frustumBox([0, 1.45, 0.9], [0, 1.45, -1.6], [1.5, 0.5], [1.7, 0.5], { bone: body, color: DARK });
  // hood wedge
  b.frustumBox([0, 1.05, 2.5], [0, 1.1, 1.0], [1.7, 0.2], [2.0, 0.35], { bone: body, color: NAVY });
  // bumper ram
  box(2.3, 0.35, 0.3, DARK, [0, 0.55, 2.6]);
  box(2.2, 0.08, 0.32, YEL, [0, 0.62, 2.6]);
  // windshield and side glass
  box(1.6, 0.4, 0.05, "#0a3a55", [0, 1.45, 0.95], { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) {
    box(0.04, 0.35, 1.8, "#0a3a55", [s * 1.0, 1.4, -0.3]);
    box(0.05, 0.05, 4.6, WHITE, [s * 1.06, 0.95, 0]);
    // neon light bars
    glow(box(0.06, 0.07, 4.2, CYAN, [s * 1.07, 0.7, 0]), 1.6);
    glow(box(0.06, 0.07, 0.9, PINK, [s * 1.07, 1.15, -1.8]), 1.6);
    // headlights
    glow(box(0.45, 0.1, 0.06, WHITE, [s * 0.65, 0.9, 2.52]), 1.8);
    // wheels
    for (const z of [1.6, -1.6]) {
      const w = b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.45, 12), DARK, {
        bone: body,
        at: [s * 1.05, 0.0, z],
        dir: [1, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.47, 8), metal("steel"), {
        bone: body,
        at: [s * 1.05, 0.0, z],
        dir: [1, 0, 0],
      });
      glow(b.part(new THREE.TorusGeometry(0.34, 0.025, 4, 12), PINK, { bone: body, at: [s * 1.29, 0, z], dir: [1, 0, 0], axis: "z" }), 1.4);
      void w;
    }
    // mirrors
    box(0.1, 0.12, 0.2, DARK, [s * 1.1, 1.5, 0.8]);
  }
  // front neon bar
  glow(box(1.8, 0.07, 0.06, CYAN, [0, 1.0, 2.56]), 1.6);
  // roof light bar
  box(1.7, 0.12, 0.3, DARK, [0, 1.75, 0.3]);
  for (let i = 0; i < 6; i++) {
    glow(box(0.26, 0.1, 0.32, i % 2 ? "#ff2020" : "#2050ff", [-0.7 + i * 0.28, 1.8, 0.3]), 1.8);
  }
  // rear
  box(2.0, 0.4, 0.2, DARK, [0, 0.95, -2.5]);
  glow(box(1.7, 0.08, 0.06, "#ff2020", [0, 1.0, -2.62]), 1.6);
  // water tank
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 1.5, 10), WHITE, { bone: body, at: [0, 1.6, -1.45], dir: [0, 0, 1] });
  glow(b.part(new THREE.CylinderGeometry(0.4, 0.4, 1.52, 10), "#2aa8ff", { bone: body, at: [0, 1.6, -1.45], dir: [0, 0, 1] }), 0.6);

  // corporate logo
  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2d95" stroke-width="5"/><path d="M18 44 L32 14 L46 44 Z" fill="#19f0ff"/><text x="32" y="58" font-size="9" text-anchor="middle" fill="#ffd21f" font-family="sans-serif">RIOT</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", {
      bone: body,
      at: [s * 1.055, 0.95, -0.4],
      dir: [s, 0, 0],
      axis: "z",
      texture: logo,
    });

  // turret
  b.part(new THREE.CylinderGeometry(0.45, 0.55, 0.25, 10), metal("steel"), { bone: turret, at: [0, 1.7, -0.2] });
  b.part(new THREE.BoxGeometry(0.7, 0.45, 0.8), HULL, { bone: turret, at: [0, 1.98, -0.15] });
  glow(b.part(new THREE.BoxGeometry(0.5, 0.06, 0.06), PINK, { bone: turret, at: [0, 2.05, 0.27] }), 1.6);
  // cannon barrel
  b.part(new THREE.CylinderGeometry(0.14, 0.17, 1.4, 8), metal("steel"), { bone: barrelJ, at: [0, 2.0, 0.75], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8), YEL, { bone: barrelJ, at: [0, 2.0, 1.45], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), "#2aa8ff", { bone: barrelJ, at: [0, 2.0, 1.56], dir: [0, 0, 1] });
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), DARK, { bone: barrelJ, at: [s * 0.25, 1.9, 0.6], dir: [0, 0, 1] });

  // antennas
  for (const s of [1, -1]) b.rod([s * 0.8, 1.75, -0.9], [s * 0.8, 2.6, -1.0], 0.02, DARK, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), PINK, { bone: body, at: [0.8, 2.6, -1.0] }), 2);

  void rng;
  return b.root;
}
