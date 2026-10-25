import * as THREE from "three";
import { createBuilder, paint, mix, resolve, smoothstep, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Wraith-6 Armored Truck 2077",
  description:
    "Low-poly cyberpunk militarized 6x6 truck: wedge-armored cab, neon-lit cargo module, roof turret, missile pods, drone and underglow.",
};

const NEON_C = "#19f0ff";
const NEON_M = "#ff2bd6";
const AMBER = "#ffae1a";
const RED = "#ff2a2a";
const DARK = "#14161c";
const GUN = "#2a2f38";
const STEEL = "#59606c";
const TIRE = "#101114";
const GLASS = "#0a2f44";
const YEL = "#e8c61a";

// ---------- textures ----------
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8c61a"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#111"/>`).join("")}</svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke-linejoin="round" stroke-linecap="round">
  <path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28Z" stroke="#19f0ff" stroke-width="5"/>
  <path d="M50 20 L76 35 L76 65 L50 80 L24 65 L24 35Z" stroke="#ff2bd6" stroke-width="3.5"/>
  <path d="M30 40 L50 30 L70 40 L62 62 L50 70 L38 62Z" stroke="#19f0ff" stroke-width="4"/>
  <circle cx="41" cy="48" r="4" fill="#ff2bd6" stroke="none"/><circle cx="59" cy="48" r="4" fill="#ff2bd6" stroke="none"/>
  <path d="M44 60 L56 60 M47 56 L47 63 M53 56 L53 63" stroke="#19f0ff" stroke-width="2.5"/></g></svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 120 60"><rect x="2" y="2" width="116" height="56" rx="4" fill="none" stroke="#19f0ff" stroke-width="3"/>
  <path d="M10 45 L25 30 L40 38 L58 14 L76 30 L95 20 L110 26" fill="none" stroke="#ff2bd6" stroke-width="3"/>
  <rect x="10" y="50" width="30" height="4" fill="#19f0ff"/><rect x="46" y="50" width="18" height="4" fill="#ffae1a"/><rect x="70" y="50" width="40" height="4" fill="#19f0ff"/>
  <text x="10" y="14" font-family="monospace" font-size="9" font-weight="bold" fill="#19f0ff">WRAITH-6 // ARMED</text></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 80 30"><rect width="80" height="30" rx="3" fill="#10131a" stroke="#19f0ff" stroke-width="2"/>
  <text x="40" y="21" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#ffae1a">NX-2077</text></svg>`,
  { size: 192 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#16181e"/>${Array.from({ length: 8 }, (_, i) => `<rect x="3" y="${3 + i * 3.6}" width="58" height="1.8" fill="#4a505c"/>`).join("")}<rect x="0" y="0" width="64" height="32" fill="none" stroke="#2c3038" stroke-width="3"/></svg>`,
  { size: 192 },
);
const NAME = svg(
  `<svg viewBox="0 0 200 40"><text x="100" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" letter-spacing="6" fill="#ff2bd6" stroke="#19f0ff" stroke-width="1">WRAITH</text></svg>`,
  { size: 384 },
);

// ---------- paints ----------
const camo = paint((p, n) => {
  const base = metal("iron", { tarnish: 0.2, seed: 4 });
  const c = resolve(base, p, n);
  const mud = smoothstep(1.9, 1.3, p.y) * 0.45;
  return mix(mix(c, "#2c3746", 0.35), "#3b3228", mud);
});
const CAB = panelled(camo, { size: 0.5, rivets: 0.06 });
const CARGO = panelled(paint((p, n) => mix(resolve(metal("iron", { seed: 9 }), p, n), "#252c3a", 0.4)), {
  size: 0.6,
  aspect: 0.8,
  rivets: 0.06,
});
const PLATE_M = metal("steel", { tarnish: 0.5, seed: 2 });

export default function build() {
  const b = createBuilder({ name: "wraith6" });

  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, col: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z], rotation: rot as any });
  const cy = (r: number, h: number, x: number, y: number, z: number, col: any, dir: number[] = [0, 1, 0], seg = 8, r2 = r) =>
    b.part(new THREE.CylinderGeometry(r2, r, h, seg), col, { at: [x, y, z], dir, flat: true });
  const pl = (tex: any, w: number, h: number, x: number, y: number, z: number, dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: tex });

  // ---------- chassis ----------
  bx(1.9, 0.4, 7.0, 0, 1.1, 0, DARK);
  bx(1.4, 0.18, 6.4, 0, 0.88, 0, GUN);
  for (const z of [2.3, -1.0, -2.4]) {
    cy(0.1, 2.6, 0, 0.62, z, STEEL, [1, 0, 0], 8);
    b.part(new THREE.SphereGeometry(0.22, 6, 5), GUN, { at: [0, 0.62, z] });
    bx(1.2, 0.08, 0.3, 0, 0.9, z, STEEL);
  }
  // underglow
  for (const s of [1, -1]) {
    glow(bx(0.05, 0.05, 6.4, s * 0.97, 0.8, 0, NEON_M), 1.4);
  }
  glow(bx(1.6, 0.05, 0.05, 0, 0.8, 3.2, NEON_M), 1.4);
  glow(bx(1.6, 0.05, 0.05, 0, 0.8, -3.2, NEON_M), 1.4);

  // ---------- wheels ----------
  const wheel = (s: number, z: number) => {
    const x = s * 1.28;
    cy(0.62, 0.5, x, 0.62, z, TIRE, [1, 0, 0], 14);
    cy(0.64, 0.12, x, 0.62, z, "#1c1e24", [1, 0, 0], 14, 0.64);
    cy(0.4, 0.54, x, 0.62, z, GUN, [1, 0, 0], 10);
    glow(cy(0.32, 0.02, s * 1.55, 0.62, z, NEON_C, [1, 0, 0], 12), 1.3);
    cy(0.2, 0.08, s * 1.55, 0.62, z, DARK, [1, 0, 0], 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cy(0.035, 0.07, s * 1.57, 0.62 + Math.sin(a) * 0.27, z + Math.cos(a) * 0.27, STEEL, [1, 0, 0], 5);
    }
    // arch plates
    for (const k of [1, -1]) bx(0.6, 0.05, 0.5, x, 1.22, z + k * 0.55, DARK, [k * -30, 0, 0]);
    bx(0.5, 0.4, 0.05, x, 0.4, z - 0.8, DARK); // mud flap
  };
  for (const s of [1, -1]) for (const z of [2.3, -1.0, -2.4]) wheel(s, z);

  // fuel tanks between axles
  for (const s of [1, -1]) {
    cy(0.3, 1.3, s * 1.2, 0.9, 0.65, STEEL, [0, 0, 1], 10);
    for (const z of [0.15, 1.15]) cy(0.32, 0.07, s * 1.2, 0.9, z, DARK, [0, 0, 1], 10);
    glow(bx(0.04, 0.04, 0.5, s * 1.2, 1.22, 0.65, AMBER), 1);
    bx(0.04, 0.4, 0.04, s * 1.2, 1.1, 0.0, YEL);
  }

  // ---------- cab ----------
  const cabOutline: any = [
    [0.9, 1.3],
    [3.4, 1.3],
    [3.5, 1.75],
    [3.3, 2.05],
    [2.6, 2.15],
    [1.9, 2.9],
    [0.9, 2.9],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.04, color: CAB });
  // windshield & windows
  bx(2.0, 1.0, 0.05, 0, 2.55, 2.27, GLASS, [-43, 0, 0]);
  glow(bx(1.9, 0.08, 0.04, 0, 2.28, 2.43, NEON_C, [-43, 0, 0]), 0.9);
  for (const s of [1, -1]) {
    glow(bx(0.04, 0.5, 1.0, s * 1.21, 2.55, 1.5, GLASS), 0.6);
    bx(0.03, 0.5, 0.04, s * 1.22, 2.55, 1.5, DARK);
    // mirrors
    cy(0.015, 0.25, s * 1.3, 2.35, 2.1, STEEL, [1, 0, 0], 4);
    bx(0.1, 0.38, 0.2, s * 1.42, 2.3, 2.1, DARK);
    glow(bx(0.02, 0.3, 0.14, s * 1.37, 2.3, 2.1, NEON_C), 0.8);
    // door seam + handle
    bx(0.03, 1.1, 0.03, s * 1.205, 1.85, 1.9, DARK);
    bx(0.04, 0.05, 0.25, s * 1.21, 2.0, 1.45, STEEL);
    // side armor plate
    bx(0.06, 0.45, 1.0, s * 1.22, 1.62, 1.35, GUN, [0, 0, 0]);
    pl(HAZARD, 0.9, 0.16, s * 1.26, 1.62, 1.35, [s, 0, 0]);
    // headlights
    glow(bx(0.7, 0.1, 0.06, s * 0.82, 1.62, 3.5, "#d8fbff"), 1.6);
    glow(bx(0.2, 0.07, 0.06, s * 1.1, 1.45, 3.52, AMBER), 1.3);
    // hood vents
    glow(bx(0.5, 0.03, 0.4, s * 0.55, 2.12, 3.0, AMBER), 1.0);
    // wedge arm
    bx(0.14, 0.14, 0.7, s * 1.15, 1.0, 3.7, GUN);
    // bumper spikes
    for (const k of [0.4, 0.95]) b.part(new THREE.ConeGeometry(0.08, 0.35, 5), STEEL, { at: [s * k, 0.85, 4.0], dir: [0, 0, 1], flat: true });
    // exhaust stacks
    cy(0.1, 1.9, s * 1.3, 2.05, 0.82, STEEL, [0, 1, 0], 8);
    cy(0.115, 0.1, s * 1.3, 1.6, 0.82, DARK, [0, 1, 0], 8);
    cy(0.115, 0.1, s * 1.3, 2.3, 0.82, DARK, [0, 1, 0], 8);
    glow(cy(0.085, 0.04, s * 1.3, 3.0, 0.82, RED, [0, 1, 0], 8), 1.4);
    bx(0.12, 0.05, 0.3, s * 1.25, 1.5, 0.82, STEEL);
  }
  // grille, bumper
  pl(GRILLE, 1.1, 0.4, 0, 1.52, 3.51, [0, 0, 1]);
  bx(2.5, 0.5, 0.35, 0, 1.05, 3.6, GUN);
  bx(2.3, 0.7, 0.1, 0, 1.08, 3.85, DARK, [-25, 0, 0]);
  glow(bx(2.0, 0.06, 0.04, 0, 1.0, 3.92, NEON_C, [-25, 0, 0]), 1.5);
  pl(PLATE, 0.5, 0.19, 0, 1.2, 3.8, [0, 0.4, 1]);
  // roof light bar & sensors
  bx(1.9, 0.12, 0.2, 0, 3.0, 1.2, DARK);
  glow(bx(0.9, 0.08, 0.22, -0.48, 3.02, 1.2, NEON_C), 1.6);
  glow(bx(0.9, 0.08, 0.22, 0.48, 3.02, 1.2, RED), 1.6);
  b.lathe(
    [
      [0, 0],
      [0.28, 0.1],
      [0.28, 0.12],
      [0, 0.03],
    ],
    { at: [0.55, 3.06, 1.55], axis: [0, 0.8, 0.6], color: STEEL, segments: 10 },
  );
  cy(0.02, 0.2, 0.55, 3.12, 1.58, DARK, [0, 1, 0.5], 4);
  b.rod([-0.7, 2.9, 1.0], [-0.8, 4.0, 0.9], 0.012, DARK);
  b.rod([-0.5, 2.9, 1.0], [-0.45, 3.6, 0.95], 0.01, DARK);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), RED, { at: [-0.8, 4.02, 0.9] }), 2);
  // chin grille ribs
  for (let i = 0; i < 4; i++) bx(0.9 - i * 0.05, 0.03, 0.06, 0, 1.4 + i * 0.07, 3.54, STEEL);
  // fill between chassis and cab/cargo
  bx(2.0, 0.35, 5.8, 0, 1.2, -0.4, DARK);

  // ---------- cargo module ----------
  b.part(new THREE.BoxGeometry(2.4, 1.4, 4.3), CARGO, { at: [0, 2.0, -1.35] });
  bx(2.5, 0.1, 4.4, 0, 2.77, -1.35, GUN);
  bx(2.5, 0.1, 4.4, 0, 1.28, -1.35, GUN);
  for (let i = 0; i < 6; i++) bx(2.5, 1.5, 0.09, 0, 2.02, 0.6 - i * 0.85, DARK);
  for (const s of [1, -1]) {
    for (const z of [0.78, -3.48]) glow(bx(0.07, 1.5, 0.07, s * 1.23, 2.02, z, NEON_C), 1.3);
    glow(bx(0.03, 0.05, 4.2, s * 1.22, 1.5, -1.35, NEON_M), 1.4);
    glow(bx(0.03, 0.05, 4.2, s * 1.22, 2.55, -1.35, NEON_C), 1.2);
    glow(pl(EMBLEM, 1.15, 1.15, s * 1.23, 2.05, -0.65, [s, 0, 0]), 1.3);
    glow(pl(HUD, 1.0, 0.5, s * 1.23, 2.0, -2.1, [s, 0, 0]), 1.2);
    glow(pl(NAME, 1.2, 0.24, s * 1.23, 1.7, -3.0, [s, 0, 0]), 1.2);
    pl(GRILLE, 0.7, 0.35, s * 1.23, 2.4, -2.1, [s, 0, 0]);
    pl(HAZARD, 1.0, 0.14, s * 1.24, 1.38, -2.6, [s, 0, 0]);
    // tool lockers
    bx(0.15, 0.4, 0.6, s * 1.3, 1.75, -1.6, STEEL);
    bx(0.17, 0.05, 0.3, s * 1.31, 1.75, -1.6, YEL);
    // missile pods
    const pod = (z: number) => {
      const rot = new THREE.Euler((-30 * Math.PI) / 180, 0, 0);
      const c = new THREE.Vector3(s * 0.75, 3.0, z);
      bx(0.6, 0.55, 1.1, c.x, c.y, c.z, GUN, [-30, 0, 0]);
      bx(0.64, 0.05, 1.1, c.x, c.y + 0.28, c.z, DARK, [-30, 0, 0]);
      for (const ox of [-0.15, 0.15])
        for (const oy of [-0.12, 0.12]) {
          const o = new THREE.Vector3(ox, oy, 0.56).applyEuler(rot).add(c);
          cy(0.09, 0.14, o.x, o.y, o.z, DARK, [0, 0.5, 0.866], 8);
          b.part(new THREE.ConeGeometry(0.07, 0.14, 6), AMBER, {
            at: [o.x, o.y + 0.04, o.z + 0.06],
            dir: [0, 0.5, 0.866],
            flat: true,
          });
        }
    };
    pod(-2.3);
    bx(0.5, 0.3, 0.5, s * 0.75, 2.9, -2.4, STEEL);
  }
  // ribs of vents on roof
  for (let i = 0; i < 4; i++) bx(1.0, 0.04, 0.08, 0.6, 2.84, -1.8 - i * 0.2, DARK);
  glow(bx(0.9, 0.03, 0.6, -0.7, 2.84, -0.2, AMBER), 0.9);

  // ---------- turret ----------
  const TZ = -0.5;
  cy(0.55, 0.18, 0, 2.88, TZ, STEEL, [0, 1, 0], 10);
  cy(0.42, 0.1, 0, 2.99, TZ, DARK, [0, 1, 0], 10);
  bx(0.95, 0.45, 1.1, 0, 3.25, TZ, GUN);
  bx(0.95, 0.12, 0.6, 0, 3.5, TZ - 0.1, DARK, [0, 0, 0]);
  bx(0.6, 0.35, 0.3, 0, 3.22, TZ + 0.65, STEEL);
  for (const s of [1, -1]) {
    cy(0.055, 1.8, s * 0.22, 3.22, TZ + 1.4, DARK, [0, 0, 1], 8);
    cy(0.09, 0.2, s * 0.22, 3.22, TZ + 2.3, STEEL, [0, 0, 1], 8);
    bx(0.3, 0.5, 0.4, s * 0.55, 3.3, TZ + 0.1, GUN);
    glow(bx(0.04, 0.3, 0.02, s * 0.5, 3.3, TZ + 0.32, NEON_C), 1.3);
    // ammo belts
    b.sweep(catmull([[s * 0.4, 3.2, TZ - 0.3], [s * 0.7, 3.0, TZ - 0.6], [s * 0.8, 2.85, TZ - 0.9]]), 0.04, { color: YEL, section: "box" });
  }
  glow(bx(0.4, 0.14, 0.05, 0, 3.4, TZ + 0.56, RED), 2);
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 5), NEON_C, { at: [0.0, 3.62, TZ - 0.2] }), 1.6);
  b.rod([0.4, 3.45, TZ - 0.4], [0.5, 4.3, TZ - 0.5], 0.012, DARK);

  // ---------- drone on roof ----------
  const DZ = -3.0;
  cy(0.2, 0.12, 0, 2.95, DZ, DARK, [0, 1, 0], 8);
  bx(0.45, 0.05, 0.9, 0, 2.86, DZ, YEL);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.rod([sx * 0.1, 2.97, DZ + sz * 0.1], [sx * 0.5, 3.0, DZ + sz * 0.5], 0.02, GUN);
      glow(cy(0.2, 0.015, sx * 0.5, 3.03, DZ + sz * 0.5, NEON_C, [0, 1, 0], 10), 0.8);
    }
  glow(b.part(new THREE.SphereGeometry(0.06, 5, 4), RED, { at: [0, 2.95, DZ + 0.2] }), 2);

  // ---------- rear ----------
  bx(2.5, 0.35, 0.3, 0, 1.0, -3.65, GUN);
  pl(HAZARD, 2.2, 0.3, 0, 1.0, -3.81, [0, 0, -1]);
  for (const s of [1, -1]) glow(bx(0.4, 0.25, 0.06, s * 0.95, 1.72, -3.52, RED), 1.7);
  glow(bx(2.0, 0.05, 0.05, 0, 2.5, -3.52, NEON_M), 1.3);
  pl(PLATE, 0.6, 0.22, 0, 1.4, -3.52, [0, 0, -1]);
  bx(1.8, 1.0, 0.04, 0, 2.0, -3.52, DARK); // door
  glow(pl(EMBLEM, 0.7, 0.7, 0, 2.05, -3.55, [0, 0, -1]), 1.2);
  bx(0.05, 1.0, 0.05, 0, 2.0, -3.54, STEEL);

  // cables
  b.sweep(catmull([[0.5, 2.9, 0.95], [0.4, 2.6, 0.75], [0.6, 2.7, 0.5], [0.7, 2.8, 0.2]]), 0.025, { color: DARK });
  glow(b.sweep(catmull([[-0.5, 2.9, 0.95], [-0.5, 2.65, 0.8], [-0.7, 2.75, 0.5]]), 0.015, { color: NEON_C }), 1.2);

  return b.root;
}
