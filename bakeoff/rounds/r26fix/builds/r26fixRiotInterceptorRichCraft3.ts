import * as THREE from "three";
import { createBuilder, rng, countershade, paint, svg, noise, smoothstep, mix } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control armored interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

const NEON_C = "#19f3ff";
const NEON_M = "#ff2bd6";
const NEON_Y = "#ffe53a";
const DARK = "#14141c";
const TIRE = "#0d0d11";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const R = rng(5);

  const body = b.joint("body", { at: [0, 0.6, 0] });
  const turret = b.joint("turret", { parent: body, at: [0, 1.9, -0.2], dir: [0, 1, 0] });
  const gun = b.joint("cannon", { parent: turret, at: [0, 2.05, -0.2], dir: [0, 0.1, 1], role: "hinge" });

  const HULL = panelled(
    countershade(metal("iron", { tarnish: 0.2 }), "#0a0a10", { level: -0.5 }),
    { size: 0.35, rivets: 0.07 },
  );
  const STEEL = metal("steel");
  const WARN = paint((p) => (Math.floor((p.x + p.z) / 0.12) % 2 ? NEON_Y : DARK));

  // main hull
  b.part(new THREE.BoxGeometry(2.2, 0.7, 5.0), HULL, { bone: body, at: [0, 0.75, 0], flat: true });
  // lower skirt
  b.part(new THREE.BoxGeometry(2.4, 0.35, 5.2), DARK, { bone: body, at: [0, 0.45, 0], flat: true });
  // cabin

  b.part(new THREE.BoxGeometry(1.9, 0.75, 2.2), HULL, { bone: body, at: [0, 1.5, 0.3], flat: true });
  // sloped windshield
  const wind = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#071a24"/><path d="M0 40 L30 0 L45 0 L15 40Z M55 40 L85 0 L100 0 L100 40Z" fill="#12475a" opacity=".6"/><rect y="30" width="100" height="10" fill="#19f3ff" opacity=".35"/><text x="50" y="22" font-size="9" fill="#19f3ff" text-anchor="middle" font-family="monospace">ARASAKA-PD</text></svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.7, 0.55), "#ffffff", {
      bone: body, at: [0, 1.52, 1.42], dir: [0, 0.35, 1], axis: "z", texture: wind,
    }),
    0.6,
  );
  // hood wedge
  b.part(new THREE.BoxGeometry(2.1, 0.3, 1.5), HULL, { bone: body, at: [0, 1.05, 1.9], rotation: [8, 0, 0], flat: true });
  // front bull bar
  b.part(new THREE.BoxGeometry(2.4, 0.45, 0.3), STEEL, { bone: body, at: [0, 0.55, 2.7], flat: true });
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9])
    b.part(new THREE.BoxGeometry(0.06, 0.5, 0.06), DARK, { bone: body, at: [x, 0.55, 2.88] });
  // warning stripe band
  b.part(new THREE.BoxGeometry(2.25, 0.12, 5.05), WARN, { bone: body, at: [0, 0.62, 0], flat: true });

  // neon light bars
  const bars: [number[], number[], string][] = [
    [[1.9, 0.08, 0.1], [0, 1.95, 1.4], NEON_C],
    [[2.26, 0.06, 0.06], [0, 1.06, 2.76], NEON_M],
    [[0.06, 0.06, 4.6], [1.12, 0.95, 0], NEON_C],
    [[0.06, 0.06, 4.6], [-1.12, 0.95, 0], NEON_M],
    [[1.2, 0.07, 0.07], [0, 1.9, -1.2], NEON_M],
  ];
  for (const [s, at, c] of bars)
    glow(b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { bone: body, at }), 2);
  // roof strobe bar
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const c = s > 0 ? "#ff3030" : "#3060ff";
      glow(b.part(new THREE.BoxGeometry(0.3, 0.14, 0.22), c, { bone: body, at: [s * (0.3 + i * 0.3), 1.93, 0.8] }), 2.2);
    }
  // headlights
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.5, 0.1, 0.06), "#fff6d8", { bone: body, at: [s * 0.75, 1.0, 2.66] }), 2);
    glow(b.part(new THREE.BoxGeometry(0.4, 0.08, 0.06), "#ff1a1a", { bone: body, at: [s * 0.8, 1.05, -2.52] }), 2);
  }

  // wheels
  for (const s of [1, -1])
    for (const z of [-1.7, 1.7]) {
      b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 14), TIRE, {
        bone: body, at: [s * 1.2, 0.0 + 0.55 - 0.6, z], dir: [1, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.52, 8), STEEL, { bone: body, at: [s * 1.2, -0.05, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.33, 0.03, 4, 12), NEON_C, { bone: body, at: [s * 1.47, -0.05, z], dir: [1, 0, 0], axis: "z" }), 1.6);
    }

  // armor plates on sides
  const decal = svg(
    `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#0d0d14"/><text x="60" y="27" font-size="22" font-weight="bold" fill="#ff2bd6" text-anchor="middle" font-family="monospace">RIOT CTRL</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(1.6, 0.4), "#ffffff", {
        bone: body, at: [s * 1.12, 0.78, -0.3], dir: [s, 0, 0], axis: "z", texture: decal,
      }),
      0.9,
    );

  // turret base + water tank
  b.part(new THREE.CylinderGeometry(0.55, 0.65, 0.2, 10), STEEL, { bone: turret, at: [0, 1.95, -0.7] });
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 10), metal("steel", { tarnish: 0.1 }), {
    bone: body, at: [0, 1.5, -1.4], dir: [0, 0, 1], flat: true,
  });
  glow(b.part(new THREE.BoxGeometry(0.9, 0.08, 1.2), NEON_C, { bone: body, at: [0, 2.0, -1.4] }), 1.5);

  // turret head and cannon
  b.part(new THREE.BoxGeometry(0.7, 0.4, 0.8), HULL, { bone: turret, at: [0, 2.2, -0.7], flat: true });
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.2), DARK, { bone: gun, at: [0, 2.25, -0.2] });
  b.rod([0, 2.25, -0.3], [0, 2.3, 1.2], 0.14, STEEL, { bone: gun });
  b.rod([0, 2.3, 1.15], [0, 2.3, 1.55], [0.2, 0.2], DARK, { bone: gun });
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), NEON_C, { bone: gun, at: [0, 2.3, 1.57], dir: [0, 0, 1] }), 2.2);
  for (const z of [0.2, 0.6, 1.0])
    b.part(new THREE.TorusGeometry(0.16, 0.03, 4, 10), NEON_M, { bone: gun, at: [0, 2.28, z], dir: [0, 0, 1], axis: "z" });
  // side gunner handles
  for (const s of [1, -1]) b.rod([s * 0.35, 2.15, -0.9], [s * 0.35, 2.15, -0.4], 0.04, STEEL, { bone: turret });

  // antenna & rear bumper
  b.rod([0.8, 1.9, -1.9], [0.8, 2.9, -2.0], 0.02, DARK, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), NEON_M, { bone: body, at: [0.8, 2.92, -2.0] }), 2);
  b.part(new THREE.BoxGeometry(2.3, 0.3, 0.2), STEEL, { bone: body, at: [0, 0.5, -2.65], flat: true });

  void R; void noise; void smoothstep; void mix;
  const out = b.root;
  // seat on floor: wheel bottoms at y ~ -0.1 relative; lift handled by body joint at 0.6
  return out;
}
