import * as THREE from "three";
import { catmull, createBuilder, frame, stripes, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Ironclad 77",
  description: "A 2077 armoured cyber-transport: six-wheel chassis, riveted cargo hull, roof turret, neon running lights.",
};

// Palette: one flat colour per glowing or detail part, metal paints for the hull.
const CYAN = "#29f0ff";
const MAGENTA = "#ff3ec8";
const RED = "#ff2a4a";
const AMBER = "#ffb400";
const ORANGE = "#ff7a1a";
const HOT = "#fff3c4";
const TYRE = "#15161b";
const GUN = "#23262f";
const DARK = "#0c0d12";
const SLATE = "#3a3f4d";
const BOLT = "#b9c0cc";
const GLASS = "#0b2230";

const BODY = panelled(metal("iron", { polish: 0.35 }), { size: 0.14, rivets: 0.035 });
const CARGO = panelled(metal("iron", { tarnish: 0.5, verdigris: 0.15 }), { size: 0.18, rivets: 0.045 });
const STEEL = metal("steel");
const RIM = metal("steel", { polish: 0.7 });
const HAZARD = stripes(DARK, "#ffd23f", { size: 0.16, axis: "x" });

// Drawings: the cargo emblem (a crest with a stencilled 7) and the windshield HUD.
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 4 L94 26 L94 62 Q94 86 50 98 Q6 86 6 62 L6 26Z" fill="#07080c"/>
    <path d="M50 12 L86 30 L86 60 Q86 80 50 90 Q14 80 14 60 L14 30Z" fill="#ff2a4a"/>
    <path d="M36 28 H68 V38 H47 V46 H63 V56 H47 V74 H36Z" fill="#ffd23f"/>
  </svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 170 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="170" height="50" fill="#06141c"/>
    <path d="M6 14 H60 M6 22 H48 M6 30 H72 M6 38 H40" stroke="#29f0ff" stroke-width="3"/>
    <path d="M96 8 L160 8 L160 42 L96 42Z" fill="none" stroke="#ff3ec8" stroke-width="2.5"/>
    <text x="104" y="30" font-family="monospace" font-size="14" fill="#29f0ff">ARMOUR 97</text>
  </svg>`,
  { size: 512 },
);

// Wheel layout: three axles, six wheels. x is the model's left (+X).
const AXLES = [
  { tag: "F", z: 2.4 },
  { tag: "M", z: -1.5 },
  { tag: "R", z: -2.7 },
];
const WHEEL_X = 1.2;
const WHEEL_Y = 0.6;
const TYRE_PROFILE: [number, number][] = [
  [0.42, -0.22],
  [0.56, -0.25],
  [0.6, -0.2],
  [0.6, 0.2],
  [0.56, 0.25],
  [0.42, 0.22],
];
const RIM_PROFILE: [number, number][] = [
  [0.2, -0.2],
  [0.42, -0.2],
  [0.42, 0.2],
  [0.2, 0.2],
];
const TURRET_PROFILE: [number, number][] = [
  [0, 0],
  [0.42, 0],
  [0.42, 0.12],
  [0.3, 0.2],
  [0, 0.2],
];
const CAB_PROFILE: [number, number][] = [
  [1.5, 1.1],
  [3.1, 1.1],
  [3.1, 2.5],
  [2.6, 3.25],
  [1.6, 3.25],
  [1.5, 2.6],
];

export default function build() {
  const b = createBuilder({ name: "ironclad-77" });
  const hull = b.joint("hull", { at: [0, 0, 0] });

  // ---- Chassis, underglow and tow hitch -----------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(2.3, 0.32, 6.3), BODY, { bone: hull, at: [0, 1.0, 0.05] });
  glow(b.part(new THREE.BoxGeometry(2.0, 0.03, 5.6), CYAN, { bone: hull, at: [0, 0.8, 0] }), 1.6);
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.4), GUN, { bone: hull, at: [0, 0.95, 3.45] });
  b.sweep(
    catmull([
      [0.7, 1.2, 4.0],
      [0.9, 0.9, 4.1],
      [1.05, 0.6, 3.9],
    ]),
    0.02,
    { color: DARK, bone: hull },
  );

  // ---- Cargo hull --------------------------------------------------------------------------------------------
  const cargo = b.part(new THREE.BoxGeometry(2.4, 2.3, 4.6), CARGO, { bone: hull, at: [0, 2.3, -0.6] });
  b.decal(cargo, EMBLEM, { at: [1.21, 2.3, -0.6], dir: [1, 0, 0], size: [1.1, 1.1] });
  b.decal(cargo, EMBLEM, { at: [-1.21, 2.3, -0.6], dir: [-1, 0, 0], size: [1.1, 1.1], mirror: true });
  for (const z of [-2.4, -2.0, 0.9, 1.35])
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.06, 2.1, 0.07), SLATE, { bone: hull, at: [s * 1.23, 2.3, z] });
  // Rear doors: a centre seam, tail lights and vertical magenta neon at the corners.
  b.part(new THREE.BoxGeometry(0.03, 2.2, 0.03), DARK, { bone: hull, at: [0, 2.3, -2.93] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.28, 0.12, 0.04), RED, { bone: hull, at: [s * 0.85, 2.7, -2.93] }), 1.5);
    glow(b.part(new THREE.BoxGeometry(0.035, 2.1, 0.035), MAGENTA, { bone: hull, at: [s * 1.21, 2.3, -2.92] }), 1.8);
  }
  b.part(new THREE.BoxGeometry(2.3, 0.3, 0.2), DARK, { bone: hull, at: [0, 0.95, -3.15] });
  // Side armour skirts over the wheel tops.
  for (const s of [1, -1])
    b.extrude(
      [
        [-2.9, 1.25],
        [1.5, 1.25],
        [1.5, 1.5],
        [-2.9, 1.5],
      ],
      { at: [s * 1.3, 0, 0], x: [0, 0, 1], thickness: 0.08, bevel: 0.01, color: BODY, bone: hull },
    );

  // ---- Cab ---------------------------------------------------------------------------------------------------
  b.extrude(CAB_PROFILE, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.03, color: BODY, bone: hull });
  b.slab(
    [
      [-1.02, 2.55, 3.1],
      [1.02, 2.55, 3.1],
      [1.02, 3.2, 2.62],
      [-1.02, 3.2, 2.62],
    ],
    { color: GLASS, thickness: 0.03, bone: hull },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.7, 0.5), "#ffffff", {
      bone: hull,
      at: [0, 2.9, 2.88],
      dir: [0, 0.59, 0.8],
      axis: "z",
      texture: HUD,
    }),
    1.2,
  );
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 1.17, 1.9, 2.9],
        [s * 1.17, 2.5, 2.9],
        [s * 1.17, 2.75, 2.6],
        [s * 1.17, 1.9, 2.6],
      ],
      { color: GLASS, thickness: 0.02, bone: hull },
    );
    // Side mirror on a bent arm.
    b.sweep(
      catmull([
        [s * 1.15, 2.75, 2.7],
        [s * 1.42, 2.85, 2.9],
        [s * 1.5, 2.95, 3.0],
      ]),
      0.02,
      { color: GUN, bone: hull },
    );
    b.part(new THREE.BoxGeometry(0.06, 0.2, 0.14), DARK, { bone: hull, at: [s * 1.52, 2.95, 3.05] });
  }
  glow(b.part(new THREE.BoxGeometry(1.9, 0.09, 0.12), AMBER, { bone: hull, at: [0, 3.31, 2.25] }), 1.4);

  // Exhaust stacks with glowing tips.
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.085, 2.4, 10), SLATE, { bone: hull, at: [s * 1.0, 2.4, 1.9] });
    glow(b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), ORANGE, { bone: hull, at: [s * 1.0, 3.62, 1.9] }), 1.2);
  }

  // ---- Front: hood, grille, bumper, headlights, ram spikes ---------------------------------------------------
  b.part(new THREE.BoxGeometry(2.3, 0.45, 0.95), BODY, { bone: hull, at: [0, 1.4, 3.5] });
  b.part(new THREE.BoxGeometry(1.9, 0.35, 0.06), DARK, { bone: hull, at: [0, 1.42, 3.99] });
  for (let i = -4; i <= 4; i++)
    b.part(new THREE.BoxGeometry(0.04, 0.3, 0.02), STEEL, { bone: hull, at: [i * 0.2, 1.42, 4.02] });
  b.part(new THREE.BoxGeometry(2.5, 0.45, 0.3), HAZARD, { bone: hull, at: [0, 0.95, 4.1] });
  for (const x of [-0.95, -0.5, 0, 0.5, 0.95])
    b.spike([x, 0.95, 4.25], [0, 0.2, 1], 0.35, 0.05, { color: STEEL, bone: hull });
  for (const s of [1, -1])
    glow(b.part(new THREE.SphereGeometry(0.12, 10, 8), HOT, { bone: hull, at: [s * 0.85, 1.45, 3.98] }), 1.8);

  // ---- Roof: turret, twin barrel, ammo box, antenna ---------------------------------------------------------
  const turret = b.joint("turret", { parent: hull, at: [0, 3.45, -0.8], dir: [0, 1, 0] });
  b.lathe(TURRET_PROFILE, { at: [0, 3.45, -0.8], axis: [0, 1, 0], bone: turret, color: SLATE, segments: 12 });
  b.part(new THREE.BoxGeometry(0.7, 0.32, 0.8), BODY, { bone: turret, at: [0, 3.7, -0.8] });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.72, -0.5], dir: [0, 0, 1] });
  b.rod([0, 3.72, -0.5], [0, 3.74, 1.1], 0.06, GUN, { bone: gun });
  b.rod([0, 3.72, 0.15], [0, 3.74, 0.5], 0.085, STEEL, { bone: gun });
  glow(b.part(new THREE.SphereGeometry(0.07, 8, 6), MAGENTA, { bone: gun, at: [0, 3.74, 1.12] }), 1.7);
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.4), GUN, { bone: hull, at: [0.6, 3.65, -1.4] });
  b.sweep(
    catmull([
      [-0.8, 3.45, -2.0],
      [-0.8, 4.1, -2.05],
      [-0.82, 4.6, -2.1],
    ]),
    [0.025, 0.012],
    { color: GUN, bone: hull },
  );
  glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), CYAN, { bone: hull, at: [-0.82, 4.62, -2.1] }), 1.6);

  // ---- Wheels: tyre, rim, hub, cyan hub light, bolt ring ----------------------------------------------------
  for (const ax of AXLES)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const center: [number, number, number] = [s * WHEEL_X, WHEEL_Y, ax.z];
      const w = b.joint(`wheel${ax.tag}${side}`, { parent: hull, at: center, dir: [1, 0, 0] });
      b.lathe(TYRE_PROFILE, { at: center, axis: [1, 0, 0], bone: w, color: TYRE, segments: 16 });
      b.lathe(RIM_PROFILE, { at: center, axis: [1, 0, 0], bone: w, color: RIM, segments: 12 });
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10), STEEL, {
        bone: w,
        at: [center[0] + s * 0.2, center[1], center[2]],
        dir: [s, 0, 0],
      });
      glow(
        b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 14), CYAN, {
          bone: w,
          at: [center[0] + s * 0.27, center[1], center[2]],
          dir: [s, 0, 0],
        }),
        1.6,
      );
      b.ring(frame([center[0] + s * 0.265, center[1], center[2]], [s, 0, 0]), { count: 5, radius: 0.14 }, (h) =>
        b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), BOLT, h),
      );
    }

  // Rear bumper plate.
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.04), "#d4d8e0", { bone: hull, at: [0, 1.25, -3.27] });

  return b.root;
}
