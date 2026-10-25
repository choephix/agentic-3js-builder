import * as THREE from "three";
import { createBuilder, mix, paint, rng, smoothstep, svg } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Warhound-77 Armoured Transport",
  description: "A 2077 militarised cargo truck: armoured cab, riveted cargo box, roof gun, neon trim and hazard striping.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const HULL = panelled(metal("iron", { polish: 0.25 }), { size: 0.32, rivets: 0.05 });
const GUN = "#2a2e38";
const DARK = "#15171d";
const CHROME = metal("steel");
const RUBBER = paint((p) => (Math.sin(p.x * 150) > 0.4 ? "#0b0c10" : "#23252c"));
const HAZ = paint((p) => ((Math.floor((p.x + p.y) / 0.1) & 1) ? "#f0b400" : "#16161c"));
const GLASS = paint((_p, n) => mix("#07141c", "#2f7593", 0.5 + 0.5 * n.y));
const NEON_C = "#2ff3ff";
const NEON_M = "#ff2fa8";
const AMBER = "#ffb040";
const WHITE_LIGHT = "#e8fbff";
const RED_LIGHT = "#ff2a2a";

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="#15171d" stroke="#2ff3ff" stroke-width="5"/>
    <polygon points="50,20 74,34 74,66 50,80 26,66 26,34" fill="none" stroke="#ff2fa8" stroke-width="3"/>
    <path d="M36 50 L50 36 L64 50 L50 64Z" fill="#2ff3ff"/>
    <path d="M14 50 H28 M72 50 H86" stroke="#2ff3ff" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const HUD = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="196" height="96" rx="8" fill="#05121a" stroke="#2ff3ff" stroke-width="3"/>
    <path d="M20 70 A60 60 0 0 1 180 70" fill="none" stroke="#1d4a57" stroke-width="8"/>
    <path d="M20 70 A60 60 0 0 1 150 26" fill="none" stroke="#2ff3ff" stroke-width="8"/>
    <text x="100" y="66" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="#2ff3ff">94%</text>
    <rect x="30" y="80" width="60" height="6" fill="#ff2fa8"/>
    <rect x="96" y="80" width="40" height="6" fill="#2ff3ff"/>
  </svg>`,
  { size: 384 },
);

const LOGO = svg(
  `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="74" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="66" fill="#e8ecf2" stroke="#15171d" stroke-width="3">WH-77</text>
  </svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------------------------------------------------------
// Model

export default function build() {
  const b = createBuilder({ name: "warhound-77" });
  const R = rng(77);

  const bx = (w: number, h: number, d: number, at: V, color: ColorInput) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at });
  const lit = (w: number, h: number, d: number, at: V, color: string, strength = 1.4) =>
    glow(bx(w, h, d, at, color), strength);

  // Chassis: two rails, a cross-plate and a cyan underglow.
  for (const s of [1, -1]) bx(0.25, 0.22, 7.6, [s * 0.7, 0.85, -0.6], DARK);
  bx(2.2, 0.12, 7.4, [0, 0.72, -0.6], GUN);
  lit(2.0, 0.03, 6.2, [0, 0.66, -0.6], NEON_C, 0.7);

  // Wheels: tyre, rim, glowing hub cap, five bolts, mudguard.
  const wheel = (x: number, z: number, s: number) => {
    const c: V = [x, 0.55, z];
    b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.42, 18), RUBBER, { at: c, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.44, 10), GUN, { at: c, dir: [1, 0, 0] });
    glow(b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.46, 8), NEON_C, { at: c, dir: [1, 0, 0] }), 1.4);
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), CHROME, {
        at: [x + s * 0.24, 0.55 + 0.22 * Math.cos(a), z + 0.22 * Math.sin(a)],
        dir: [1, 0, 0],
      });
    }
    bx(0.62, 0.08, 1.0, [x, 1.16, z], GUN);
  };
  for (const z of [2.5, 0, -2.5]) for (const s of [1, -1]) wheel(s * 1.3, z, s);

  // Armoured cab: side profile extruded across the width.
  b.extrude(
    [
      [1.5, 1.0],
      [3.1, 1.0],
      [3.1, 1.6],
      [2.7, 2.7],
      [1.5, 2.7],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: HULL },
  );
  bx(2.3, 0.1, 1.6, [0, 2.75, 2.2], GUN);
  bx(1.9, 0.08, 0.12, [0, 2.86, 2.85], DARK);
  lit(1.7, 0.04, 0.05, [0, 2.84, 2.92], NEON_C, 1.6);

  for (const s of [1, -1]) {
    // Side glass and door seams.
    b.extrude(
      [
        [1.7, 1.85],
        [2.95, 1.8],
        [2.58, 2.55],
        [1.7, 2.55],
      ],
      { at: [s * 1.115, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, color: GLASS },
    );
    bx(0.02, 1.1, 0.02, [s * 1.113, 1.6, 1.85], DARK);
    bx(0.02, 0.02, 1.2, [s * 1.113, 1.6, 2.45], DARK);
    bx(0.1, 0.03, 0.04, [s * 1.13, 1.9, 2.2], CHROME);
    // Faction emblem on each door.
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", {
      at: [s * 1.117, 1.25, 2.3],
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
    });
    // Twin exhaust stacks with glowing amber caps.
    b.part(new THREE.CylinderGeometry(0.07, 0.09, 2.2, 8), GUN, { at: [s * 1.05, 2.1, 1.7] });
    glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 8), AMBER, { at: [s * 1.05, 3.2, 1.7] }), 1.2);
    // Chassis side skirt.
    bx(0.08, 0.36, 6.0, [s * 1.56, 0.95, -0.5], HULL);
  }

  // Front: grille with neon slats, headlights, plough bar with spikes.
  bx(1.6, 0.5, 0.06, [0, 1.25, 3.11], DARK);
  for (let i = 0; i < 4; i++) lit(1.5, 0.02, 0.04, [0, 1.02 + i * 0.12, 3.14], NEON_C, 1.0);
  for (const s of [1, -1]) lit(0.3, 0.12, 0.05, [s * 0.85, 1.6, 3.11], WHITE_LIGHT, 1.8);
  bx(2.5, 0.22, 0.3, [0, 0.85, 3.2], DARK);
  bx(2.3, 0.06, 0.02, [0, 0.85, 3.36], HAZ);
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) b.spike([x, 0.85, 3.3], [0, 0, 1], 0.3, 0.035, { color: CHROME });

  // Cab-to-cargo bridge.
  bx(1.9, 0.9, 0.5, [0, 1.5, 1.4], GUN);

  // Cargo box: riveted hull, hazard band, neon strips, logo decals, greebles.
  bx(2.5, 2.0, 4.4, [0, 2.0, -1.0], HULL);
  bx(2.56, 0.08, 4.3, [0, 3.04, -1.0], GUN);
  for (const s of [1, -1]) {
    bx(0.02, 0.22, 4.0, [s * 1.255, 1.15, -1.0], HAZ);
    lit(0.03, 0.04, 4.1, [s * 1.262, 2.6, -1.0], NEON_C, 1.6);
    lit(0.03, 0.03, 4.1, [s * 1.262, 1.55, -1.0], NEON_M, 1.2);
    b.part(new THREE.PlaneGeometry(2.0, 0.5), "#ffffff", {
      at: [s * 1.263, 2.25, -1.4],
      dir: [s, 0, 0],
      axis: "z",
      texture: LOGO,
    });
    for (let i = 0; i < 26; i++) {
      const z = -3.0 + R() * 4.0;
      const y = 1.4 + R() * 0.5;
      const pick = [GUN, AMBER, NEON_M, DARK][Math.floor(R() * 4)];
      bx(0.06, 0.1, 0.06, [s * 1.268, y, z], pick);
    }
  }
  for (let i = 0; i < 8; i++) bx(0.3, 0.1, 0.3, [-1 + R() * 2, 3.14, -3 + R() * 4], R() > 0.5 ? GUN : DARK);

  // Cargo side glow channels: recessed behind the neon strips so they sit flush on the box face.
  for (const s of [1, -1]) {
    bx(0.02, 0.1, 4.2, [s * 1.27, 2.6, -1.0], DARK);
    bx(0.02, 0.06, 4.2, [s * 1.27, 1.55, -1.0], DARK);
  }

  // Grille bezel and mesh behind the neon slats.
  bx(1.7, 0.08, 0.06, [0, 1.52, 3.12], GUN);
  bx(1.7, 0.08, 0.06, [0, 0.98, 3.12], GUN);
  for (const s of [1, -1]) bx(0.06, 0.56, 0.06, [s * 0.85, 1.25, 3.12], GUN);

  // Breech collar and muzzle ring on the roof gun.
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 10), GUN, { at: [0, 3.6, -0.25], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 10), CHROME, { at: [0, 3.6, 0.95], dir: [0, 0, 1] });

  // Roof sensor pod with a glowing lens, seated on the cab roof.
  bx(0.5, 0.14, 0.5, [0.6, 2.9, 2.2], GUN);
  glow(b.part(new THREE.SphereGeometry(0.11, 8, 6), NEON_C, { at: [0.6, 3.02, 2.2] }), 1.5);

  // Hazard-stripe bumper caps at the rear corners.
  for (const s of [1, -1]) bx(0.12, 0.2, 0.2, [s * 1.2, 0.8, -3.3], HAZ);

  // Cable bundle from the mast to the cargo roof, with clamps at each end.
  for (let i = 0; i < 3; i++) {
    b.rod([0.5 + i * 0.04, 3.1, 1.0], [0.5 + i * 0.04, 3.1, -3.0], 0.015, DARK);
  }
  for (const z of [1.0, -3.0]) bx(0.12, 0.08, 0.12, [0.5, 3.12, z], CHROME);

  // Rear: status screen, rear lights, bumper with hazard stripe, plate.
  b.part(new THREE.PlaneGeometry(1.2, 0.6), "#ffffff", {
    at: [0, 2.1, -3.26],
    dir: [0, 0, -1],
    axis: "z",
    texture: HUD,
  });
  for (const s of [1, -1]) lit(0.3, 0.14, 0.05, [s * 0.9, 1.5, -3.25], RED_LIGHT, 1.3);
  bx(2.5, 0.22, 0.25, [0, 0.8, -3.3], DARK);
  bx(2.3, 0.06, 0.02, [0, 0.8, -3.43], HAZ);
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.34], "#f2f2f2");

  // Roof turret: lathed ring, head, barrel with muzzle brake.
  b.lathe(
    [
      [0, 0],
      [0.55, 0],
      [0.55, 0.08],
      [0.4, 0.18],
      [0.3, 0.3],
      [0, 0.3],
    ],
    { at: [0, 3.1, -0.6], axis: [0, 1, 0], color: GUN },
  );
  bx(0.5, 0.3, 0.5, [0, 3.55, -0.6], GUN);
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 8), GUN, { at: [0, 3.6, 0.2], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), DARK, { at: [0, 3.6, 0.98], dir: [0, 0, 1] });
  lit(0.1, 0.1, 0.05, [0, 3.6, 0.2], NEON_M, 0.6);

  // Cyber mast: two antennas with glowing tips, a satellite dish, neural cables.
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 3.1, -2.6], [s * 0.9, 3.9, -2.6], 0.025, GUN);
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), NEON_M, { at: [s * 0.9, 3.92, -2.6] }), 1.5);
    b.rod([s * 0.5, 3.1, 1.0], [s * 0.5, 3.1, -3.0], 0.02, NEON_M);
  }
  b.lathe(
    [
      [0, 0],
      [0.3, 0.02],
      [0.36, 0.12],
      [0.24, 0.12],
      [0, 0.08],
    ],
    { at: [0.5, 3.14, -2.5], axis: [0, 1, 0], color: CHROME },
  );

  return b.root;
}
