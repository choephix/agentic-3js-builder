import * as THREE from "three";
import { createBuilder, mix, paint, rng, smoothstep, svg } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { gaugeTexture } from "../../../../kits/clockwork";

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

  // Front: grille with neon slats, headlights, plough bar with spikes. The grille is set into the front plate.
  bx(1.6, 0.5, 0.04, [0, 1.25, 2.98], DARK);
  // Grille sits above the plough bar so its slats show clear of it.
  bx(1.6, 0.06, 0.06, [0, 1.36, 3.0], GUN);
  // Plough bar: a chunky bar with a hazard face and spikes that stand off it.
  bx(2.6, 0.32, 0.36, [0, 0.82, 3.2], HULL);
  for (const s of [1, -1]) bx(0.14, 0.5, 0.5, [s * 1.2, 0.75, 3.0], DARK);
  bx(2.7, 0.08, 0.42, [0, 0.64, 3.18], GUN);
  for (let i = 0; i < 4; i++) lit(1.5, 0.02, 0.03, [0, 1.02 + i * 0.12, 3.0], NEON_C, 1.0);
  for (const s of [1, -1]) lit(0.3, 0.12, 0.05, [s * 0.85, 1.6, 3.11], WHITE_LIGHT, 1.8);
  bx(2.5, 0.22, 0.3, [0, 0.85, 3.2], DARK);
  bx(2.3, 0.06, 0.02, [0, 0.85, 3.3], HAZ);
  // Centre skid plate and two tow hooks on the plough bar.
  bx(0.7, 0.14, 0.06, [0, 0.62, 3.36], CHROME);
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.07, 0.018, 6, 10), CHROME, { at: [s * 0.55, 0.7, 3.36], dir: [0, 0, 1] });
  }
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) b.spike([x, 0.85, 3.2], [0, 0, 1], 0.22, 0.035, { color: CHROME });

  // Cab-to-cargo bridge.
  bx(1.9, 0.9, 0.5, [0, 1.5, 1.4], GUN);

  // Cargo box: riveted hull, hazard band, neon strips, logo decals, greebles.
  bx(2.5, 2.0, 4.4, [0, 2.0, -1.0], HULL);
  bx(2.56, 0.08, 4.3, [0, 3.04, -1.0], GUN);
  for (const s of [1, -1]) {
    bx(0.02, 0.22, 4.0, [s * 1.255, 1.15, -1.0], HAZ);
    lit(0.03, 0.04, 4.1, [s * 1.262, 2.7, -1.0], NEON_C, 1.6);
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
      bx(0.06, 0.1, 0.06, [s * 1.27, y, z], pick);
    }
  }
  for (let i = 0; i < 8; i++) bx(0.3, 0.1, 0.3, [-1 + R() * 2, 3.09, -3 + R() * 4], R() > 0.5 ? GUN : DARK);
  // Corner guards and hazard panels on the lower rear of the cargo box.
  for (const s of [1, -1]) {
    bx(0.04, 0.5, 0.5, [s * 1.27, 1.0, -3.15], HAZ);
    bx(0.06, 0.6, 0.08, [s * 1.27, 1.2, -3.2], CHROME);
  }
  bx(0.9, 0.12, 0.06, [0, 1.15, -3.38], CHROME);
  // Roof gun mounting ring and ammo feed boxes on the turret base.
  b.part(new THREE.TorusGeometry(0.58, 0.03, 6, 16), CHROME, { at: [0, 3.14, -0.6], dir: [0, 1, 0] });
  for (const s of [1, -1]) bx(0.22, 0.2, 0.3, [s * 0.6, 3.2, -0.6], GUN);
  b.part(new THREE.TorusGeometry(0.08, 0.02, 6, 10), CHROME, { at: [0, 1.0, -3.4], dir: [0, 0, 1] });

  // Cargo side glow channels: recessed behind the neon strips so they sit flush on the box face.
  for (const s of [1, -1]) {
    bx(0.02, 0.1, 4.2, [s * 1.25, 2.6, -1.0], DARK);
    bx(0.02, 0.06, 4.2, [s * 1.25, 1.55, -1.0], DARK);
    // Raised hazard-striped door frame with bolt heads along the lower edge.
    bx(0.03, 0.12, 2.2, [s * 1.26, 0.6, -1.4], HAZ);
    for (let i = 0; i < 6; i++) bx(0.03, 0.03, 0.03, [s * 1.27, 0.95, -2.7 + i * 0.4], CHROME);
  }

  // Grille bezel and mesh behind the neon slats, recessed into the front plate.
  bx(1.7, 0.08, 0.05, [0, 1.52, 2.99], GUN);
  bx(1.7, 0.08, 0.05, [0, 0.98, 2.99], GUN);
  for (const s of [1, -1]) bx(0.06, 0.56, 0.05, [s * 0.85, 1.25, 2.99], GUN);

  // Breech collar and muzzle ring on the roof gun.
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 10), GUN, { at: [0, 3.6, -0.25], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 10), CHROME, { at: [0, 3.6, 0.98], dir: [0, 0, 1] });
  // Ammo drum on the cab roof rear, seated on the hatch deck, with a glowing amber ring.
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12), GUN, { at: [-0.9, 2.95, 2.2], dir: [0, 1, 0] });
  glow(b.part(new THREE.TorusGeometry(0.2, 0.03, 6, 14), AMBER, { at: [-0.9, 3.1, 2.2], dir: [0, 1, 0] }), 1.3);

  // Roof sensor pod seated on the cab roof (roof top is at y 2.8), with a glowing lens in a dark housing.
  bx(0.6, 0.16, 0.6, [0.6, 2.88, 2.2], GUN);
  bx(0.42, 0.1, 0.42, [0.6, 2.97, 2.2], DARK);
  glow(b.part(new THREE.SphereGeometry(0.14, 8, 6), NEON_C, { at: [0.6, 3.04, 2.2] }), 1.5);

  // Cab roof hatch: a raised bevelled lid with a seam and a status lamp on its rim.
  bx(0.7, 0.06, 0.7, [-0.45, 2.79, 1.7], GUN);
  bx(0.56, 0.04, 0.56, [-0.45, 2.84, 1.7], DARK);
  bx(0.5, 0.04, 0.05, [-0.45, 2.88, 1.42], CHROME);
  bx(0.02, 0.02, 0.56, [-0.45, 2.9, 1.7], CHROME);
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), AMBER, { at: [-0.45, 2.86, 1.98] }), 1.3);
  // Sensor lens on the hatch rim and a small antenna base beside it.
  bx(0.14, 0.05, 0.14, [-0.2, 2.84, 1.7], GUN);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), NEON_C, { at: [-0.2, 2.9, 1.7] }), 1.4);
  b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.4, 6), CHROME, { at: [-0.2, 3.04, 1.42], dir: [0, 1, 0] });

  // Riveted fuel-cell pod on the lower rear flank, with an amber gauge face.
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 12), HULL, { at: [s * 1.45, 1.55, -2.6], dir: [0, 0, 1] });
    for (const z of [-2.2, -3.0]) bx(0.06, 0.5, 0.06, [s * 1.45, 1.55, z], CHROME);
    bx(0.1, 0.42, 0.42, [s * 1.36, 1.55, -2.6], GUN);
    b.part(new THREE.CircleGeometry(0.14, 14), "#ffffff", {
      at: [s * 1.82, 1.55, -2.6],
      dir: [s, 0, 0],
      axis: "z",
      texture: gaugeTexture(),
    });
    glow(bx(0.05, 0.05, 0.05, [s * 1.82, 1.8, -2.6], AMBER), 1.2);
    // Hazard collar and amber status lamp seated on each pod.
    b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.12, 12), HAZ, { at: [s * 1.45, 1.55, -2.45], dir: [0, 0, 1] });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), AMBER, { at: [s * 1.45, 1.78, -2.6] }), 1.2);
  }

  // Emblem plate on the rear bumper, above the number plate.
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    at: [0, 1.22, -3.37],
    dir: [0, 0, -1],
    axis: "z",
    texture: LOGO,
  });

  // Hazard-stripe bumper caps at the rear corners, flush with the box corner.
  for (const s of [1, -1]) bx(0.08, 0.2, 0.2, [s * 1.22, 0.8, -3.22], HAZ);
  bx(2.5, 0.14, 0.04, [0, 0.8, -3.36], HAZ);
  // Rear corner guards seated flush on the box corners, tied to the bumper.
  for (const s of [1, -1]) {
    bx(0.06, 0.6, 0.1, [s * 1.27, 1.2, -3.12], HULL);
    bx(0.1, 0.1, 0.22, [s * 1.2, 0.78, -3.3], CHROME);
    // Reflector strip seated on the corner guard, and a tow shackle on the bumper face.
    bx(0.02, 0.1, 0.04, [s * 1.3, 1.2, -3.12], AMBER);
    b.part(new THREE.TorusGeometry(0.05, 0.015, 6, 10), CHROME, { at: [s * 0.45, 0.78, -3.4], dir: [0, 0, 1] });
  }

  // Cable bundle run along the cargo roof, clamped into the box top at each end.
  for (let i = 0; i < 3; i++) {
    b.rod([0.5 + i * 0.04, 3.0, 1.0], [0.5 + i * 0.04, 3.0, -3.0], 0.015, DARK);
  }
  for (const z of [1.0, -3.0]) bx(0.12, 0.08, 0.12, [0.5, 2.98, z], CHROME);

  // Rear: status screen, rear lights, bumper with hazard stripe, plate.
  b.part(new THREE.PlaneGeometry(1.2, 0.6), "#ffffff", {
    at: [0, 2.1, -3.26],
    dir: [0, 0, -1],
    axis: "z",
    texture: HUD,
  });
  for (const s of [1, -1]) lit(0.3, 0.14, 0.05, [s * 0.9, 1.5, -3.25], RED_LIGHT, 1.3);
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) bx(0.03, 0.03, 0.03, [s * (0.75 + i * 0.12), 1.7, -3.3], CHROME);
  bx(1.4, 0.03, 0.03, [0, 1.75, -3.3], CHROME);
  bx(2.5, 0.22, 0.25, [0, 0.8, -3.3], DARK);
  bx(2.3, 0.06, 0.02, [0, 0.8, -3.43], HAZ);

  // Rear plate sits clear of the cargo doors, so the number reads on the bumper.
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.245], "#f2f2f2");

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
  b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 16), GUN, { at: [0, 3.1, -0.6], dir: [0, 1, 0] });
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI * 2) / 6;
    bx(0.05, 0.05, 0.05, [0.5 * Math.cos(a), 3.14, -0.6 + 0.5 * Math.sin(a)], CHROME);
  }
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
