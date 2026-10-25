```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup converted to ducted hover thrusters: armoured olive hull, roll-cage turret in the bed, neon underglow, low-poly cyberpunk.",
};

const OLIVE = "#3b4a36";
const OLIVE_D = "#27311f";
const OLIVE_L = "#566a4a";
const TAN = "#8a7a52";
const GUN = "#2a2d36";
const GUN_L = "#4a4f5e";
const BLACK = "#14151b";
const GLASS = "#10303d";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const AMBER = "#ffb52e";
const RED = "#ff2840";
const HAZ = "#e8c21e";
const ORANGE = "#ff7a1a";

export default function build() {
  const b = createBuilder({ name: "hover_technical" });

  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cy = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, color: string, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], rotation: rot });
  const neon = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, k = 1.5, rot?: [number, number, number]) =>
    glow(bx(w, h, d, x, y, z, color, rot), k);

  // ---------- Hull: side profile (z, y) extruded across the width ----------
  const cabProfile: [number, number][] = [
    [-0.3, 0.6], [2.7, 0.6], [2.7, 1.05], [2.55, 1.2], [1.15, 1.25], [0.55, 1.85], [-0.2, 1.85], [-0.3, 1.7],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: OLIVE });

  // Chassis skid plate and bed block
  bx(1.5, 0.18, 5.3, 0, 0.56, 0, GUN);
  bx(1.9, 0.5, 2.45, 0, 0.8, -1.52, OLIVE);
  bx(1.7, 0.06, 2.3, 0, 1.06, -1.52, GUN); // bed floor
  // Bed walls
  for (const s of [1, -1]) {
    bx(0.1, 0.45, 2.45, s * 0.9, 1.28, -1.52, OLIVE);
    bx(0.12, 0.08, 2.5, s * 0.9, 1.54, -1.52, OLIVE_D);
  }
  bx(1.9, 0.45, 0.1, 0, 1.28, -2.72, OLIVE);
  bx(1.9, 0.08, 0.12, 0, 1.54, -2.72, OLIVE_D);
  bx(1.7, 0.45, 0.08, 0, 1.28, -0.33, OLIVE_D);

  // ---------- Glass ----------
  bx(1.6, 0.85, 0.03, 0, 1.55, 0.87, GLASS, [-45, 0, 0]);
  neon(1.6, 0.02, 0.02, 0, 1.2, 1.2, CYAN, 1.2);
  for (const s of [1, -1]) {
    b.extrude([[-0.15, 1.4], [1.0, 1.4], [0.6, 1.78], [-0.15, 1.78]], {
      at: [s * 0.955, 0, 0], x: [0, 0, 1], thickness: 0.04, color: GLASS,
    });
    // door seams, handles
    bx(0.03, 0.62, 0.03, s * 0.96, 1.08, 1.05, BLACK);
    bx(0.03, 0.62, 0.03, s * 0.96, 1.08, -0.05, BLACK);
    bx(0.04, 0.04, 0.2, s * 0.97, 1.28, 0.2, GUN_L);
    // side armour plates
    bx(0.05, 0.4, 0.9, s * 0.97, 0.92, 0.5, OLIVE_L);
    bx(0.06, 0.06, 0.9, s * 0.97, 1.14, 0.5, OLIVE_D);
    // camo patches
    bx(0.03, 0.2, 0.35, s * 0.96, 1.5, 0.15, TAN);
    bx(0.03, 0.15, 0.3, s * 0.965, 0.75, -1.0, TAN);
    bx(0.03, 0.18, 0.4, s * 0.965, 0.95, -2.0, OLIVE_D);
    bx(0.03, 0.12, 0.3, s * 0.965, 1.25, 1.9, OLIVE_D);
    // underglow strips
    neon(0.05, 0.05, 4.4, s * 0.93, 0.6, -0.1, CYAN, 2);
    // magenta door stripe
    neon(0.03, 0.05, 1.2, s * 0.975, 1.2, 0.5, MAGENTA, 1.6);
    // mirrors
    bx(0.25, 0.04, 0.04, s * 1.05, 1.5, 0.95, GUN);
    bx(0.07, 0.2, 0.14, s * 1.18, 1.5, 0.95, GUN_L);
    neon(0.02, 0.1, 0.1, s * 1.145, 1.5, 0.95, CYAN, 1.2);
  }

  // ---------- Roof ----------
  bx(1.7, 0.05, 0.9, 0, 1.88, 0.15, OLIVE_D);
  bx(1.2, 0.1, 0.14, 0, 1.94, 0.45, GUN);
  neon(1.1, 0.05, 0.06, 0, 1.97, 0.5, AMBER, 2);
  cy(0.02, 0.02, 0.7, 6, -0.7, 2.2, -0.1, GUN); // antenna
  neon(0.06, 0.06, 0.06, -0.7, 2.57, -0.1, MAGENTA, 2);
  // sensor dish
  b.part(new THREE.ConeGeometry(0.2, 0.12, 8), GUN_L, { at: [0.55, 2.0, 0.0], rotation: [-30, 0, 0] });
  cy(0.02, 0.02, 0.15, 6, 0.55, 1.94, 0.0, GUN);
  neon(0.04, 0.04, 0.04, 0.55, 2.0, 0.0, RED, 2);

  // ---------- Hood and nose ----------
  bx(0.6, 0.06, 0.8, 0, 1.27, 1.9, OLIVE_D);
  for (let i = 0; i < 4; i++) bx(0.5, 0.02, 0.03, 0, 1.31, 1.6 + i * 0.12, BLACK);
  bx(1.95, 0.32, 0.22, 0, 0.78, 2.76, GUN); // bumper
  bx(1.5, 0.3, 0.06, 0, 0.98, 2.71, BLACK); // grille
  neon(1.4, 0.05, 0.03, 0, 1.0, 2.745, MAGENTA, 2);
  for (let i = 0; i < 5; i++) bx(0.03, 0.22, 0.02, -0.5 + i * 0.25, 0.96, 2.76, GUN_L);
  for (const s of [1, -1]) {
    neon(0.42, 0.08, 0.04, s * 0.7, 1.12, 2.7, CYAN, 2.2);
    neon(0.3, 0.05, 0.04, s * 0.78, 0.82, 2.88, AMBER, 1.8);
    for (let i = 0; i < 4; i++) bx(0.12, 0.34, 0.03, s * (0.2 + i * 0.1) * 1 + s * 0.52, 0.78, 2.89, i % 2 ? HAZ : BLACK);
  }
  // ram spikes
  for (const x of [-0.7, 0, 0.7]) b.part(new THREE.ConeGeometry(0.06, 0.24, 6), GUN_L, { at: [x, 0.7, 2.98], rotation: [90, 0, 0] });

  // ---------- Rear ----------
  bx(1.95, 0.3, 0.2, 0, 0.78, -2.8, GUN);
  for (const s of [1, -1]) {
    neon(0.3, 0.14, 0.04, s * 0.7, 1.1, -2.79, RED, 2);
    cy(0.17, 0.2, 0.34, 8, s * 0.45, 0.78, -2.96, GUN_L, [90, 0, 0]);
    cy(0.13, 0.13, 0.03, 8, s * 0.45, 0.78, -3.14, ORANGE, [90, 0, 0]);
    glow(cy(0.13, 0.13, 0.03, 8, s * 0.45, 0.78, -3.15, ORANGE, [90, 0, 0]), 2.2);
  }
  neon(1.0, 0.04, 0.03, 0, 0.7, -2.91, MAGENTA, 1.8);

  // ---------- Hover thrusters ----------
  const podRing = [[0.38, 0], [0.5, 0], [0.5, 0.52], [0.42, 0.52], [0.42, 0.1], [0.38, 0.1]] as [number, number][];
  const pods: [number, number][] = [];
  for (const s of [1, -1]) for (const z of [1.75, -1.75]) pods.push([s * 1.18, z]);
  for (const [px, pz] of pods) {
    const s = Math.sign(px);
    b.lathe(podRing, { at: [px, 0, pz], segments: 8, color: GUN_L });
    // top rim accent
    b.lathe([[0.42, 0.52], [0.52, 0.52], [0.52, 0.56], [0.42, 0.56]], { at: [px, 0, pz], segments: 8, color: GUN });
    glow(cy(0.38, 0.38, 0.03, 8, px, 0.04, pz, CYAN), 2.2);
    // fan
    cy(0.07, 0.07, 0.12, 8, px, 0.3, pz, GUN);
    cy(0.015, 0.015, 0.3, 6, px, 0.2, pz, GUN);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      bx(0.26, 0.015, 0.07, px + Math.cos(a) * 0.18, 0.3, pz + Math.sin(a) * 0.18, GUN_L, [0, (-a * 180) / Math.PI, 12]);
    }
    // neon ring around the rim
    glow(b.lathe([[0.5, 0.2], [0.515, 0.2], [0.515, 0.25], [0.5, 0.25]], { at: [px, 0, pz], segments: 8, color: MAGENTA }), 1.8);
    // strut to hull
    bx(0.55, 0.22, 0.7, s * 1.0, 0.68, pz, GUN);
    bx(0.3, 0.1, 0.5, s * 1.18, 0.62, pz, OLIVE_D);
    // hazard chevrons
    bx(0.06, 0.1, 0.18, s * 1.06, 0.76, pz + 0.38, HAZ);
    bx(0.06, 0.1, 0.18, s * 1.06, 0.76, pz - 0.38, HAZ);
    // vents on the pod top
    for (let i = 0; i < 3; i++) bx(0.04, 0.08, 0.2, px + s * 0.52, 0.42, pz - 0.2 + i * 0.2, BLACK);
  }

  // ---------- Bed: turret on roll cage ----------
  const tz = -1.5;
  cy(0.32, 0.36, 0.14, 8, 0, 1.16, tz, GUN);
  cy(0.2, 0.24, 0.3, 8, 0, 1.36, tz, GUN_L);
  bx(0.55, 0.3, 0.6, 0, 1.68, tz, OLIVE_L);
  bx(0.58, 0.06, 0.62, 0, 1.85, tz, OLIVE_D);
  for (const s of [1, -1]) {
    cy(0.05, 0.05, 1.1, 8, s * 0.14, 1.68, tz + 0.8, GUN, [90, 0, 0]);
    cy(0.075, 0.075, 0.22, 8, s * 0.14, 1.68, tz + 1.36, BLACK, [90, 0, 0]);
    glow(cy(0.035, 0.035, 0.02, 6, s * 0.14, 1.68, tz + 1.48, MAGENTA, [90, 0, 0]), 2);
    bx(0.12, 0.2, 0.3, s * 0.34, 1.62, tz - 0.05, GUN_L); // ammo drums
    bx(0.04, 0.05, 0.3, s * 0.4, 1.62, tz - 0.05, HAZ);
  }
  neon(0.2, 0.08, 0.04, 0, 1.72, tz + 0.32, CYAN, 2); // targeting eye
  // roll cage
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 1.1, -0.4], [s * 0.8, 1.95, -0.4], 0.035, GUN);
    b.rod([s * 0.8, 1.1, -2.6], [s * 0.8, 1.7, -2.6], 0.035, GUN);
    b.rod([s * 0.8, 1.95, -0.4], [s * 0.8, 1.7, -2.6], 0.035, GUN);
    b.rod([s * 0.8, 1.95, -0.4], [s * 0.8, 1.6, -1.5], 0.03, GUN_L);
  }
  b.rod([-0.8, 1.95, -0.4], [0.8, 1.95, -0.4], 0.035, GUN);
  b.rod([-0.8, 1.7, -2.6], [0.8, 1.7, -2.6], 0.035, GUN);
  neon(0.6, 0.04, 0.04, 0, 1.95, -0.4, AMBER, 1.8);
  // cargo
  bx(0.5, 0.35, 0.5, 0.5, 1.28, -2.3, TAN);
  bx(0.52, 0.04, 0.52, 0.5, 1.47, -2.3, OLIVE_D);
  neon(0.3, 0.12, 0.02, 0.5, 1.3, -2.04, CYAN, 1.8);
  cy(0.13, 0.13, 0.38, 8, -0.55, 1.3, -2.3, OLIVE_L); // fuel can
  cy(0.14, 0.14, 0.04, 8, -0.55, 1.5, -2.3, HAZ);
  cy(0.06, 0.06, 0.06, 6, -0.55, 1.55, -2.3, GUN);

  // ---------- Emblem on tailgate ----------
  neon(0.5, 0.04, 0.02, 0, 1.4, -2.78, MAGENTA, 1.6);
  neon(0.04, 0.2, 0.02, -0.2, 1.3, -2.78, CYAN, 1.6);
  neon(0.04, 0.2, 0.02, 0.2, 1.3, -2.78, CYAN, 1.6);
  neon(0.4, 0.04, 0.02, 0, 1.2, -2.78, CYAN, 1.6);

  return b.root;
}
```