import * as THREE from "three";
import { createBuilder, rng, countershade, paint, noise, smoothstep, mix, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "riot-interceptor",
  description: "Corporate riot-control interceptor truck with roof water cannon and neon light bars, cyberpunk style.",
};

const NEON_C = "#19f3ff";
const NEON_M = "#ff2bd6";
const NEON_Y = "#ffe84a";
const DARK = "#14161f";
const BLACK = "#08090d";
const WHITE = "#e9edf5";

export default function build() {
  const b = createBuilder({ name: "riot-interceptor" });
  const R = rng(5);
  const root = b.joint("hull", { at: [0, 0.8, 0] });
  const turret = b.joint("turretBase", { parent: root, at: [0, 2.0, -0.4], dir: [0, 1, 0] });
  const cannon = b.joint("cannon", { parent: turret, at: [0, 2.25, -0.4], dir: [0, 0, 1], role: "hinge" });

  const hullPaint = panelled(
    countershade(mix("#2b3142", "#4a5268", 0.3), "#10121a", { level: -0.2 }),
    { size: 0.5, rivets: 0.1 },
  );
  const dirt = paint((p, n) => {
    const d = smoothstep(0.7, 0.2, p.y) * noise(p, 0.25, 3);
    return mix(hullPaint.at(p, n), "#0a0a0c", d * 0.7);
  });

  // Lower chassis
  b.part(new THREE.BoxGeometry(2.3, 0.7, 5.6), dirt, { bone: root, at: [0, 0.75, 0], flat: true });
  // Cab
  b.part(new THREE.BoxGeometry(2.2, 0.9, 1.8), dirt, { bone: root, at: [0, 1.5, 1.3], flat: true });
  // Sloped windshield wedge
  b.extrude([[0, 0], [1.1, 0], [0.5, 0.6], [0, 0.6]], {
    at: [0, 1.95, 1.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, color: dirt, bone: root,
  });
  // Rear box
  b.part(new THREE.BoxGeometry(2.3, 1.1, 3.0), dirt, { bone: root, at: [0, 1.65, -1.3], flat: true });
  // Armour plates on flanks
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.8, 2.8), "#3a4258", { bone: root, at: [s * 1.2, 1.55, -1.3], flat: true });
    b.part(new THREE.BoxGeometry(0.1, 0.5, 1.4), "#3a4258", { bone: root, at: [s * 1.15, 1.35, 1.3], flat: true });
  }
  // Ram bumper
  b.part(new THREE.BoxGeometry(2.5, 0.55, 0.4), BLACK, { bone: root, at: [0, 0.6, 2.95], flat: true });
  b.part(new THREE.BoxGeometry(2.3, 0.15, 0.45), NEON_Y, { bone: root, at: [0, 0.9, 2.95] });
  for (let i = -4; i <= 4; i++)
    b.part(new THREE.BoxGeometry(0.1, 0.5, 0.12), i % 2 ? NEON_Y : BLACK, { bone: root, at: [i * 0.27, 0.6, 3.2] });

  // Windshield glow
  const wind = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#0a2a3a"/><path d="M0 40L30 0H50L20 40Z" fill="#19f3ff" opacity=".35"/><path d="M50 40L80 0H90L60 40Z" fill="#19f3ff" opacity=".25"/><rect width="100" height="40" fill="none" stroke="#08090d" stroke-width="4"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.0, 0.7), "#ffffff", {
    bone: root, at: [0, 2.2, 2.0], dir: [0, 0.65, 1], axis: "z", texture: wind,
  });
  // Side windows
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.2, 0.45), "#0c3040", { bone: root, at: [s * 1.12, 1.7, 1.3], dir: [s, 0, 0], axis: "z" });

  // Corporate logo decal
  const logo = svg(
    `<svg viewBox="0 0 100 60"><rect width="100" height="60" rx="6" fill="#0a0c12" stroke="#ff2bd6" stroke-width="3"/><path d="M15 45L35 12L50 35L65 12L85 45" fill="none" stroke="#19f3ff" stroke-width="6"/><text x="50" y="57" font-size="9" fill="#e9edf5" text-anchor="middle" font-family="sans-serif" font-weight="bold">ARASAKA PEACE DIV</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.6, 0.96), "#ffffff", { bone: root, at: [s * 1.17, 1.75, -1.3], dir: [s, 0, 0], axis: "z", texture: logo });
  const stripe = svg(
    `<svg viewBox="0 0 80 10"><path d="M0 10L10 0H25L15 10ZM30 10L40 0H55L45 10ZM60 10L70 0H85L75 10Z" fill="#ffe84a"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(2.0, 0.25), "#ffffff", { bone: root, at: [0, 1.0, 3.18], dir: [0, 0, 1], axis: "z", texture: stripe });

  // Neon strips
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 5.2), NEON_C, { bone: root, at: [s * 1.17, 0.5, 0] }), 2);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.05, 2.6), NEON_M, { bone: root, at: [s * 1.2, 2.15, -1.3] }), 2);
  }
  // Roof light bars
  b.part(new THREE.BoxGeometry(2.1, 0.12, 0.35), BLACK, { bone: root, at: [0, 2.0, 0.55] });
  for (let i = 0; i < 6; i++)
    glow(b.part(new THREE.BoxGeometry(0.32, 0.14, 0.3), i < 3 ? "#ff2040" : "#2a5cff", { bone: root, at: [-0.85 + i * 0.34, 2.1, 0.55] }), 2.5);
  glow(b.part(new THREE.BoxGeometry(2.0, 0.08, 0.08), NEON_M, { bone: root, at: [0, 2.3, 2.3], }), 2);
  // Headlights
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.5, 0.14, 0.1), WHITE, { bone: root, at: [s * 0.8, 1.2, 3.18] }), 2);
    glow(b.part(new THREE.BoxGeometry(0.4, 0.1, 0.06), "#ff1030", { bone: root, at: [s * 0.8, 1.2, -2.83] }), 2);
  }

  // Wheels
  const tire = paint((p, n) => (noise(p, 0.05, 2) > 0.55 ? "#1a1a1e" : "#0b0b0e"));
  for (const sx of [1, -1])
    for (const z of [2.0, 0.6, -1.9]) {
      b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 12), tire, {
        bone: root, at: [sx * 1.15, 0.0 + 0.55 - 0.8 + 0.8, z], dir: [1, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.48, 8), metal("steel"), { bone: root, at: [sx * 1.15, 0.55, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.33, 0.02, 4, 12), NEON_C, { bone: root, at: [sx * 1.4, 0.55, z], dir: [1, 0, 0], axis: "z" }), 2);
    }

  // Turret
  b.part(new THREE.CylinderGeometry(0.6, 0.7, 0.2, 10), metal("iron"), { bone: root, at: [0, 2.3, -0.4] });
  b.part(new THREE.CylinderGeometry(0.45, 0.5, 0.45, 8), "#2b3142", { bone: turret, at: [0, 2.6, -0.4], flat: true });
  // Water tank on rear
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 2.2, 10), "#3a4258", { bone: root, at: [0, 2.35, -2.0], dir: [0, 0, 1] });
  glow(b.part(new THREE.BoxGeometry(0.4, 0.05, 1.8), NEON_C, { bone: root, at: [0, 2.86, -2.0] }), 2);
  // Cannon barrel
  b.part(new THREE.BoxGeometry(0.5, 0.45, 0.7), "#232838", { bone: cannon, at: [0, 2.8, -0.2], flat: true });
  b.rod([0, 2.8, 0.1], [0, 2.8, 1.9], 0.15, metal("steel"), { bone: cannon, sides: 8 });
  b.rod([0, 2.8, 1.8], [0, 2.8, 2.3], [0.22, 0.2], metal("blued"), { bone: cannon, sides: 8 });
  glow(b.part(new THREE.TorusGeometry(0.2, 0.03, 4, 10), NEON_C, { bone: cannon, at: [0, 2.8, 2.3] }), 2.5);
  glow(b.part(new THREE.CircleGeometry(0.14, 8), "#7ff6ff", { bone: cannon, at: [0, 2.8, 2.31], dir: [0, 0, 1], axis: "z" }), 2);
  // Hoses
  b.sweep([[0, 2.55, -1.6], [0.3, 2.9, -1.0], [0.1, 3.0, -0.4], [0, 2.8, -0.2]], 0.05, { bone: cannon, color: "#14161f" });
  // Antennas
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 2.3, -2.7], [s * 0.9, 3.6, -2.7], 0.02, BLACK, { bone: root });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), NEON_M, { bone: root, at: [s * 0.9, 3.62, -2.7] }), 3);
  }
  // Rear details
  for (let i = 0; i < 6; i++)
    b.part(new THREE.BoxGeometry(0.3, 0.1, 0.05), i % 2 ? NEON_Y : BLACK, { bone: root, at: [-0.75 + i * 0.3, 0.9, -2.83] });
  void R;
  return b.root;
}
