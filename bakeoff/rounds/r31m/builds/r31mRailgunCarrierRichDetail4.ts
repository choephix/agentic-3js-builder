import * as THREE from "three";
import { createBuilder, rng, paint, mottle, mix, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Heavy 6x6 military carrier with a turret-mounted coil railgun, deployed outrigger stabiliser legs, rear recoil spade, armoured cab and hull greebles. Low-poly sci-fi.",
};

// ------------------------------------------------------------------ palette
const OLIVE = "#5b6a4a";
const OLIVE_D = "#46523a";
const DARK = "#2a2e33";
const STEEL = "#8a9096";
const STEEL_D = "#5d636a";
const YEL = "#e0b92d";
const CYAN = "#6ee7ff";
const RED = "#ff4a3a";
const AMBER = "#ffb347";
const TYRE_C = "#1e2023";
const D2R = Math.PI / 180;

const MUD = mottle("#5a4630", "#3d2f1f", { size: 0.25, seed: 4 });
const HULL_BASE = panelled(mottle(OLIVE, OLIVE_D, { size: 0.9, seed: 2 }), { size: 0.9, aspect: 0.6, rivets: 0.16 });
const HULL = paint((p, n) => (p.y < 0.85 + 0.2 * Math.sin(p.x * 4 + p.z * 3) ? MUD : HULL_BASE));
const ARMOUR = paint((p) => (p.y < 0.5 ? MUD : mottle("#667556", "#4f5c42", { size: 0.5, seed: 9 })));
const TYRE = paint((p) => (p.y < 0.3 ? MUD : TYRE_C));
const GUN = panelled(mottle("#3a4046", "#2c3136", { size: 0.6, seed: 5 }), { size: 0.5, aspect: 0.7, rivets: 0.12 });
const RAIL = mottle("#9aa3ad", "#6a727c", { size: 0.4, seed: 7 });

// ------------------------------------------------------------------ textures
const hazardSvg = (() => {
  let s = `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#15171a"/>`;
  for (let i = -1; i < 5; i++)
    s += `<polygon points="${i * 16},16 ${i * 16 + 8},16 ${i * 16 + 16},0 ${i * 16 + 8},0" fill="#e0b92d"/>`;
  return s + `</svg>`;
})();
const HAZARD = svg(hazardSvg, { size: 256 });
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#15171a" stroke="#e0b92d" stroke-width="5"/>
  <path d="M50 14 L82 28 L78 60 L50 84 L22 60 L18 28 Z" fill="#2b3340" stroke="#e0b92d" stroke-width="3"/>
  <path d="M56 22 L36 54 L48 54 L42 78 L66 44 L52 44 Z" fill="#6ee7ff" stroke="#0b1a20" stroke-width="2"/>
  <rect x="14" y="48" width="72" height="4" fill="#e0b92d"/>
  </svg>`,
  { size: 256 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 240 50" xmlns="http://www.w3.org/2000/svg">
  <text x="6" y="38" font-family="monospace" font-weight="bold" font-size="36" fill="#15171a" stroke="#15171a" stroke-width="4">RG-6 // 07</text>
  <text x="6" y="38" font-family="monospace" font-weight="bold" font-size="36" fill="#ece8d2">RG-6 // 07</text>
  </svg>`,
  { size: 512 },
);
const DANGER = svg(
  `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="96" height="76" rx="6" fill="#e0b92d" stroke="#15171a" stroke-width="4"/>
  <polygon points="50,10 82,52 18,52" fill="#15171a"/>
  <path d="M54 20 L40 42 L49 42 L45 52 L60 32 L51 32 Z" fill="#e0b92d"/>
  <text x="50" y="72" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#15171a">HIGH VOLTAGE</text>
  </svg>`,
  { size: 256 },
);
const RADAR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="8" fill="#08150f"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#3dff9a" stroke-width="2"/>
  <circle cx="50" cy="50" r="26" fill="none" stroke="#3dff9a" stroke-width="1.5"/>
  <circle cx="50" cy="50" r="12" fill="none" stroke="#3dff9a" stroke-width="1.5"/>
  <path d="M50 50 L84 30" stroke="#9dffcb" stroke-width="3"/>
  <circle cx="68" cy="34" r="4" fill="#ff5a4a"/><circle cx="36" cy="62" r="3" fill="#ff5a4a"/>
  </svg>`,
  { size: 128 },
);
const CHEVRON = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#e8e4d0"/>` +
    [0, 1, 2, 3].map((i) => `<polygon points="${i * 16},16 ${i * 16 + 8},16 ${i * 16 + 16},0 ${i * 16 + 8},0" fill="#c9352b"/>`).join("") +
    `</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const R = rng(21);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, n = 8, r2 = r) => new THREE.CylinderGeometry(r, r2, h, n);

  const chassis = b.joint("chassis", { at: [0, 1.2, 0], role: "spine" });
  type V = [number, number, number];
  const P = (g: THREE.BufferGeometry, color: any, at: V, bone: any = chassis, o: any = {}) =>
    b.part(g, color, { bone, at, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, bone: any = chassis, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...(up ? { up } : {}) });
  const ringPts = (n: number, r: number, f: (a: number, c: number, s: number, i: number) => void) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      f(a, Math.cos(a), Math.sin(a), i);
    }
  };
  const bolts = (pts: V[], bone: any, dir: V, color = STEEL_D, r = 0.035) => {
    for (const p of pts) P(cyl(r, 0.04, 6), color, p, bone, { dir });
  };

  // ============================================================ hull
  P(box(2.4, 0.9, 7.4), HULL, [0, 1.25, -0.2]);
  P(box(2.5, 0.12, 5.1), HULL, [0, 1.76, -1.35]);
  b.frustumBox([0, 1.25, 3.4], [0, 1.1, 4.1], [2.4, 0.9], [2.3, 0.55], { bone: chassis, color: HULL });
  // chamfer wedges on hull edges
  for (const s of [1, -1]) {
    P(box(0.14, 0.14, 7.2), ARMOUR, [s * 1.25, 1.72, -0.2], chassis, { rotation: [0, 0, s * 45] });
    P(box(0.1, 0.5, 5.3), OLIVE_D, [s * 1.27, 1.57, -1.35]); // deck side rail
    plane(1.7, 0.36, STENCIL, [s * 1.33, 1.6, -1.35], [s, 0, 0]);
    // fender over each wheel
    for (const z of [2.6, 0, -2.6]) {
      P(box(0.95, 0.07, 1.8), ARMOUR, [s * 1.62, 1.42, z]);
      P(box(0.07, 0.3, 1.8), ARMOUR, [s * 2.07, 1.3, z]);
      P(box(0.8, 0.07, 0.35), ARMOUR, [s * 1.62, 1.36, z + (z > 0 ? 0.95 : -0.95)], chassis, { rotation: [z > 0 ? 30 : -30, 0, 0] });
      for (let i = 0; i < 4; i++) P(cyl(0.025, 0.05, 6), STEEL_D, [s * 1.62 + (i - 1.5) * 0.2, 1.47, z + 0.6], chassis);
      // mud flap
      P(box(0.8, 0.5, 0.05), "#25272a", [s * 1.62, 0.9, z - 0.98]);
    }
    // armour plates between wheels (also outrigger housings)
    for (const z of [1.3, -1.3]) {
      P(box(0.2, 0.75, 0.85), ARMOUR, [s * 1.3, 1.2, z]);
      bolts([[s * 1.41, 1.45, z - 0.3], [s * 1.41, 1.45, z + 0.3], [s * 1.41, 0.95, z - 0.3], [s * 1.41, 0.95, z + 0.3]], chassis, [s, 0, 0]);
    }
    P(box(0.14, 0.7, 0.5), ARMOUR, [s * 1.27, 1.2, -3.55]);
    P(box(0.14, 0.7, 0.5), ARMOUR, [s * 1.27, 1.2, 3.25]);
    // tow hooks & rear tie-downs
    P(new THREE.TorusGeometry(0.1, 0.03, 5, 8), STEEL, [s * 0.8, 0.8, 4.28], chassis);
    // fuel tanks under hull
    P(cyl(0.3, 1.5, 10), STEEL_D, [s * 0.85, 0.62, -1.3], chassis, { rotation: [90, 0, 0], flat: true });
    for (const dz of [-0.55, 0.55]) P(cyl(0.32, 0.08, 10), DARK, [s * 0.85, 0.62, -1.3 + dz], chassis, { rotation: [90, 0, 0], flat: true });
    // radiator/ammo crates on deck
    P(box(0.55, 0.45, 1.0), OLIVE_D, [s * 0.95, 2.05, -2.5]);
    P(box(0.5, 0.05, 0.9), STEEL_D, [s * 0.95, 2.3, -2.5]);
    for (const dz of [-0.3, 0.3]) P(box(0.57, 0.05, 0.08), DARK, [s * 0.95, 2.06, -2.5 + dz]);
    // exhaust stacks
    b.rod([s * 1.0, 1.9, 1.15], [s * 1.0, 3.0, 1.15], 0.09, STEEL_D, { bone: chassis, sides: 8 });
    P(cyl(0.11, 0.35, 8), DARK, [s * 1.0, 2.2, 1.15], chassis);
    P(box(0.22, 0.03, 0.22), DARK, [s * 1.0, 3.08, 1.15], chassis, { rotation: [-20, 0, 0] });
    // antenna whips
    b.spike([s * 1.0, 2.6, 1.45], [s * 0.1, 1, -0.2], 2.2, 0.025, STEEL, { bone: chassis, sides: 5 });
    P(cyl(0.07, 0.1, 8), DARK, [s * 1.0, 2.62, 1.45]);
    // tail lights
    glow(P(box(0.3, 0.14, 0.05), RED, [s * 0.9, 1.35, -3.93]));
    P(box(0.38, 0.22, 0.04), DARK, [s * 0.9, 1.35, -3.91]);
  }

  // underside: axles, diffs, driveshaft, shocks
  b.rod([0, 0.7, 2.6], [0, 0.7, -2.6], 0.07, STEEL_D, { bone: chassis, sides: 8 });
  for (const z of [2.6, 0, -2.6]) {
    b.rod([-1.5, 0.62, z], [1.5, 0.62, z], 0.09, DARK, { bone: chassis, sides: 8 });
    P(new THREE.SphereGeometry(0.3, 8, 6), STEEL_D, [0, 0.62, z], chassis, { flat: true, scale: [1, 0.9, 1] });
    for (const s of [1, -1]) {
      b.rod([s * 1.05, 0.62, z + 0.35], [s * 1.12, 1.0, z + 0.2], 0.04, STEEL, { bone: chassis, sides: 6 });
      b.rod([s * 1.05, 0.62, z - 0.35], [s * 1.12, 1.0, z - 0.2], 0.04, STEEL, { bone: chassis, sides: 6 });
      P(box(0.08, 0.04, 1.0), DARK, [s * 1.0, 0.82, z], chassis);
    }
  }

  // ============================================================ wheels (six, spin joints)
  const wheelNames: Record<string, string> = {};
  for (const [k, z] of [["F", 2.6], ["M", 0], ["R", -2.6]] as const)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hub: V = [s * 1.55, 0.62, z];
      const j = b.joint(`wheel${k}${side}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" });
      wheelNames[`${k}${side}`] = j.name;
      P(cyl(0.6, 0.6, 14), TYRE, hub, j, { rotation: [0, 0, 90], flat: true });
      ringPts(16, 0.62, (a, c, sn, i) => {
        P(box(0.62, 0.1, 0.17), TYRE_C, [hub[0], hub[1] + 0.62 * c, hub[2] + 0.62 * sn], j, { rotation: [a / D2R, 0, 0], flat: true });
      });
      P(cyl(0.36, 0.62, 10), STEEL_D, hub, j, { rotation: [0, 0, 90], flat: true });
      P(cyl(0.28, 0.1, 10), DARK, [hub[0] + s * 0.3, hub[1], hub[2]], j, { rotation: [0, 0, 90] });
      P(cyl(0.13, 0.16, 8), STEEL, [hub[0] + s * 0.36, hub[1], hub[2]], j, { rotation: [0, 0, 90] });
      ringPts(8, 0.2, (a, c, sn) => {
        P(cyl(0.028, 0.05, 6), STEEL, [hub[0] + s * 0.33, hub[1] + 0.21 * c, hub[2] + 0.21 * sn], j, { rotation: [0, 0, 90] });
      });
      P(cyl(0.025, 0.1, 6), DARK, [hub[0] + s * 0.4, hub[1] + 0.3, hub[2]], j, { rotation: [0, 0, 90] }); // valve
      P(new THREE.TorusGeometry(0.58, 0.025, 4, 14), STEEL_D, [hub[0] + s * 0.3, hub[1], hub[2]], j, { rotation: [0, 90, 0] }); // bead ring
    }

  // ============================================================ cab
  P(box(2.3, 0.9, 2.2), HULL, [0, 2.15, 2.35]);
  P(box(2.1, 0.12, 2.0), ARMOUR, [0, 2.64, 2.3]);
  P(box(2.0, 0.5, 0.35), HULL, [0, 2.0, 3.55], chassis, { rotation: [25, 0, 0] }); // sloped nose
  glow(P(box(1.7, 0.22, 0.06), CYAN, [0, 2.3, 3.47]));
  P(box(1.95, 0.08, 0.28), ARMOUR, [0, 2.48, 3.5]);
  P(box(1.95, 0.06, 0.2), DARK, [0, 2.16, 3.5]);
  for (const x of [-0.6, 0, 0.6]) P(box(0.05, 0.26, 0.08), DARK, [x, 2.3, 3.5]); // visor mullions
  for (const s of [1, -1]) {
    glow(P(box(0.06, 0.28, 0.95), CYAN, [s * 1.17, 2.32, 2.35]));
    P(box(0.08, 0.06, 1.05), DARK, [s * 1.17, 2.5, 2.35]);
    P(box(0.08, 0.06, 1.05), DARK, [s * 1.17, 2.14, 2.35]);
    plane(0.55, 0.55, EMBLEM, [s * 1.165, 1.95, 2.9], [s, 0, 0]);
    P(box(0.06, 0.05, 0.22), STEEL, [s * 1.17, 2.05, 1.85]); // door handle
    P(box(0.04, 0.9, 0.04), DARK, [s * 1.16, 2.15, 2.0]); // door seam
    // smoke launchers
    for (let i = 0; i < 4; i++)
      b.rod([s * 1.1, 2.7, 3.0 + i * 0.0 - 0.0 + (i - 1.5) * 0.14], [s * 1.0, 2.92, 3.2 + (i - 1.5) * 0.14], 0.045, STEEL_D, { bone: chassis, sides: 6 });
    P(box(0.2, 0.08, 0.6), DARK, [s * 1.1, 2.68, 3.0]);
    // mirrors
    b.rod([s * 1.15, 2.45, 3.2], [s * 1.5, 2.55, 3.3], 0.025, STEEL, { bone: chassis, sides: 5 });
    P(box(0.05, 0.3, 0.2), DARK, [s * 1.52, 2.55, 3.3]);
    // headlights
    glow(P(cyl(0.12, 0.06, 10), AMBER, [s * 0.9, 1.25, 4.18], chassis, { rotation: [90, 0, 0] }));
    P(new THREE.TorusGeometry(0.13, 0.03, 5, 10), STEEL_D, [s * 0.9, 1.25, 4.17]);
  }
  // roof gear
  P(cyl(0.38, 0.1, 12), STEEL_D, [-0.5, 2.74, 2.0], chassis, { flat: true });
  P(cyl(0.33, 0.06, 12), DARK, [-0.5, 2.8, 2.0], chassis, { flat: true });
  b.rod([-0.62, 2.86, 1.9], [-0.38, 2.86, 1.9], 0.02, STEEL, { bone: chassis, sides: 5 });
  P(new THREE.SphereGeometry(0.25, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#3a566a", [0.55, 2.7, 2.1], chassis, { flat: true });
  P(cyl(0.28, 0.06, 10), DARK, [0.55, 2.7, 2.1], chassis);
  P(box(1.2, 0.1, 0.18), DARK, [0, 2.75, 3.1]);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) glow(P(cyl(0.05, 0.04, 8), AMBER, [x, 2.78, 3.2], chassis, { rotation: [90, 0, 0] }));
  plane(0.5, 0.5, RADAR, [0.0, 2.2, 1.24], [0, 0, -1]); // cab rear display? faces back on bulkhead
  // front bumper / plough
  P(box(2.5, 0.38, 0.3), ARMOUR, [0, 0.72, 4.15]);
  plane(2.3, 0.3, HAZARD, [0, 0.72, 4.31], [0, 0, 1]);
  for (let i = -2; i <= 2; i++) b.spike([i * 0.5, 0.55, 4.3], [0, -0.3, 1], 0.2, 0.08, STEEL_D, { bone: chassis, sides: 4 });
  P(cyl(0.16, 0.5, 10), STEEL_D, [0.0, 0.95, 4.0], chassis, { rotation: [0, 0, 90] }); // winch drum
  P(box(0.5, 0.2, 0.15), DARK, [0, 0.95, 4.2]);

  // ============================================================ rear
  P(box(2.0, 0.9, 1.2), HULL, [0, 2.25, -3.3]);
  for (let i = 0; i < 6; i++) P(box(1.7, 0.05, 0.05), DARK, [0, 1.95 + i * 0.12, -3.93], chassis, { rotation: [30, 0, 0] });
  plane(0.6, 0.45, DANGER, [0.62, 2.45, -3.915], [0, 0, -1]);
  plane(1.6, 0.25, CHEVRON, [0, 1.45, -3.93], [0, 0, -1]);
  // ladder
  for (const x of [-0.85, -0.55]) b.rod([x, 1.0, -3.95], [x, 2.6, -3.95], 0.03, STEEL, { bone: chassis, sides: 5 });
  for (let i = 0; i < 6; i++) b.rod([-0.85, 1.15 + i * 0.26, -3.95], [-0.55, 1.15 + i * 0.26, -3.95], 0.02, STEEL, { bone: chassis, sides: 5 });
  P(cyl(0.1, 0.14, 8), STEEL, [0, 1.0, -3.98], chassis, { rotation: [90, 0, 0] }); // pintle
  // recoil spade
  const spade = b.joint("spade", { parent: chassis, at: [0, 1.0, -3.95], dir: [1, 0, 0], role: "hinge" });
  P(box(2.2, 1.1, 0.1), ARMOUR, [0, 0.52, -4.25], spade, { rotation: [-35, 0, 0] });
  P(box(2.2, 0.1, 0.14), STEEL_D, [0, 0.8, -4.1], spade, { rotation: [-35, 0, 0] });
  for (let i = -2; i <= 2; i++) b.spike([i * 0.45, 0.1, -4.55], [0, -1, -0.3], 0.14, 0.09, STEEL, { bone: spade, sides: 4 });
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 1.0, -3.9], [s * 0.8, 0.5, -4.25], 0.07, STEEL_D, { bone: spade, sides: 6 });
    P(box(0.08, 0.7, 0.08), STEEL_D, [s * 0.95, 0.52, -4.35], spade, { rotation: [-35, 0, 0] });
  }

  // ============================================================ stabiliser outriggers (four)
  for (const [k, z] of [["F", 1.3], ["R", -1.3]] as const)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const beamJ = b.joint(`outrig${k}${side}`, { parent: chassis, at: [s * 1.25, 1.1, z], dir: [s, 0, 0], role: "hinge" });
      const legJ = b.joint(`stab${k}${side}`, { parent: beamJ, at: [s * 2.6, 1.1, z], dir: [0, -1, 0], role: "leg" });
      P(box(1.5, 0.32, 0.42), ARMOUR, [s * 1.95, 1.1, z], beamJ);
      P(box(1.4, 0.06, 0.06), STEEL_D, [s * 1.95, 1.28, z + 0.2], beamJ);
      P(box(1.4, 0.06, 0.06), STEEL_D, [s * 1.95, 1.28, z - 0.2], beamJ);
      b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", { bone: beamJ, at: [s * 1.95, 1.275, z], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: HAZARD });
      P(cyl(0.22, 0.46, 10), DARK, [s * 2.6, 1.1, z], beamJ, { rotation: [90, 0, 0] }); // knuckle
      P(cyl(0.22, 0.7, 8), STEEL_D, [s * 2.6, 0.98, z], legJ, { flat: true }); // sleeve
      P(cyl(0.26, 0.08, 8), DARK, [s * 2.6, 1.3, z], legJ);
      P(cyl(0.26, 0.08, 8), DARK, [s * 2.6, 0.64, z], legJ);
      P(cyl(0.13, 0.7, 8), STEEL, [s * 2.6, 0.38, z], legJ); // piston
      P(new THREE.SphereGeometry(0.18, 7, 5), DARK, [s * 2.6, 0.14, z], legJ, { flat: true });
      P(cyl(0.5, 0.1, 8, 0.56), ARMOUR, [s * 2.6, 0.05, z], legJ, { flat: true }); // pad
      ringPts(4, 0.4, (a, c, sn) => P(box(0.06, 0.08, 0.45), STEEL_D, [s * 2.6 + 0.3 * c, 0.1, z + 0.3 * sn], legJ, { rotation: [0, -a / D2R, 0] }));
      for (const dz of [-0.2, 0.2]) {
        b.rod([s * 1.3, 0.75, z + dz], [s * 2.5, 0.75, z + dz * 1.1], 0.045, STEEL, { bone: legJ, sides: 6 }); // brace ram
        P(cyl(0.07, 0.8, 6), DARK, [s * 1.85, 0.75, z + dz], legJ, { rotation: [0, 0, 90] });
      }
      b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: legJ, at: [s * 2.6, 0.96, z + 0.225], dir: [0, 0, 1], axis: "z", texture: HAZARD });
      glow(P(cyl(0.05, 0.05, 6), AMBER, [s * 2.6, 1.3, z + 0.25], legJ, { rotation: [90, 0, 0] })); // status lamp
    }

  // ============================================================ turret + railgun
  const TX = 0, TZ = -1.2;
  const yaw = b.joint("yaw", { parent: chassis, at: [TX, 1.85, TZ], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [TX, 3.0, TZ], dir: [0, 0, 1], role: "hinge" });
  P(new THREE.TorusGeometry(1.15, 0.06, 5, 16), STEEL_D, [TX, 1.86, TZ], chassis, { rotation: [90, 0, 0] });
  ringPts(12, 1.15, (a, c, s) => P(cyl(0.035, 0.05, 6), STEEL, [1.15 * c, 1.92, TZ + 1.15 * s], chassis));
  P(cyl(1.05, 0.35, 16), GUN, [TX, 2.05, TZ], yaw, { flat: true });
  P(cyl(0.75, 0.15, 12), DARK, [TX, 2.3, TZ], yaw, { flat: true });
  for (const s of [1, -1]) {
    P(box(0.2, 1.7, 1.7), GUN, [s * 0.95, 2.75, TZ], yaw);
    P(box(0.24, 0.2, 1.74), ARMOUR, [s * 0.95, 3.6, TZ], yaw);
    bolts([[s * 1.07, 3.3, TZ - 0.6], [s * 1.07, 3.3, TZ + 0.6], [s * 1.07, 2.3, TZ - 0.6], [s * 1.07, 2.3, TZ + 0.6]], yaw, [s, 0, 0]);
    P(cyl(0.17, 0.5, 10), STEEL, [s * 0.95, 3.0, TZ], pitch, { rotation: [0, 0, 90] }); // trunnion
    // ladder-grab rails
    b.rod([s * 1.1, 2.2, TZ - 0.8], [s * 1.1, 3.5, TZ - 0.8], 0.025, YEL, { bone: yaw, sides: 5 });
    plane(0.45, 0.36, DANGER, [s * 1.065, 2.75, TZ], [s, 0, 0], yaw);
  }
  const rg = (x: number, y: number, z: number): V => [x, 3.0 + y, TZ + z];
  P(box(1.5, 1.2, 1.7), GUN, rg(0, 0, -0.9), pitch); // breech
  P(box(1.2, 0.3, 1.0), ARMOUR, rg(0, 0.7, -0.8), pitch, { rotation: [-8, 0, 0] });
  P(box(1.4, 0.2, 0.3), DARK, rg(0, -0.4, -1.9), pitch);
  for (const s of [1, -1]) {
    P(box(0.06, 0.8, 0.5), STEEL_D, rg(s * 0.78, 0, -0.9), pitch);
    plane(0.5, 0.4, STENCIL, rg(s * 0.785, 0.35, -1.4), [s, 0, 0], pitch);
    P(box(0.22, 0.34, 5.6), RAIL, rg(s * 0.3, 0, 2.6), pitch);
    P(box(0.05, 0.38, 5.6), STEEL, rg(s * 0.42, 0, 2.6), pitch); // bevel
    // capacitor drums
    for (let i = 0; i < 2; i++) {
      const z = 1.6 + i * 1.5;
      P(cyl(0.32, 1.3, 10), GUN, rg(s * 0.95, -0.15, z), pitch, { rotation: [90, 0, 0], flat: true });
      for (const dz of [-0.4, 0.4]) P(cyl(0.34, 0.08, 10), STEEL_D, rg(s * 0.95, -0.15, z + dz), pitch, { rotation: [90, 0, 0] });
      glow(P(cyl(0.3, 0.04, 10), CYAN, rg(s * 0.95, -0.15, z + 0.66), pitch, { rotation: [90, 0, 0] }));
      P(box(0.5, 0.1, 0.2), DARK, rg(s * 0.55, -0.15, z), pitch);
    }
  }
  glow(P(box(0.3, 0.05, 5.5), CYAN, rg(0, 0.03, 2.6), pitch));
  for (let i = 0; i < 7; i++) {
    const z = 0.5 + i * 0.72;
    P(box(1.0, 0.12, 0.3), GUN, rg(0, 0.38, z), pitch);
    P(box(1.0, 0.12, 0.3), GUN, rg(0, -0.38, z), pitch);
    for (const s of [1, -1]) P(box(0.12, 0.88, 0.3), GUN, rg(s * 0.44, 0, z), pitch);
    glow(P(box(0.6, 0.03, 0.12), CYAN, rg(0, 0.45, z), pitch));
    P(box(0.4, 0.14, 0.14), STEEL, rg(0, 0, z + 0.36), pitch); // insulator between rails
  }
  P(box(1.2, 0.95, 0.4), ARMOUR, rg(0, 0, 5.55), pitch); // muzzle block
  glow(P(box(0.34, 0.34, 0.06), CYAN, rg(0, 0, 5.77), pitch));
  for (const s of [1, -1]) b.spike(rg(s * 0.5, 0.5, 5.75), [0, 0, 1], 0.2, 0.06, STEEL, { bone: pitch, sides: 4 });
  P(cyl(0.09, 0.8, 8), DARK, rg(0.35, 0.82, 0.3), pitch, { rotation: [90, 0, 0] }); // scope
  glow(P(cyl(0.07, 0.03, 8), CYAN, rg(0.35, 0.82, 0.72), pitch, { rotation: [90, 0, 0] }));
  // recoil dampers
  for (const s of [1, -1]) {
    b.rod(rg(s * 0.55, -0.45, -1.6), rg(s * 0.55, -0.45, 0.2), 0.07, STEEL, { bone: pitch, sides: 8 });
    b.rod(rg(s * 0.55, -0.45, -1.6), rg(s * 0.55, -0.45, -0.7), 0.1, DARK, { bone: pitch, sides: 8 });
  }
  // power cables (static, from generator to breech)
  for (const [i, x] of [-0.4, 0, 0.4].entries())
    b.sweep(catmull([[x * 0.8, 2.6, -3.0], [x, 2.35, -2.5], [x * 1.1, 2.2, -2.2], [x * 0.9, 2.5, -1.9]]), 0.045, {
      bone: chassis,
      color: i === 1 ? "#a4352b" : "#191b1e",
      sides: 6,
    });
  P(box(0.9, 0.5, 0.5), DARK, [0, 2.0, -2.0], chassis);
  glow(P(box(0.6, 0.08, 0.04), AMBER, [0, 2.1, -1.74], chassis));
  // greeble on rear deck
  for (let i = 0; i < 8; i++) {
    const x = (R() - 0.5) * 1.4;
    const z = -0.2 + R() * 0.8;
    if (Math.abs(x) < 0.15) continue;
    P(box(0.12 + R() * 0.2, 0.08 + R() * 0.1, 0.12 + R() * 0.2), i % 2 ? DARK : STEEL_D, [x, 1.85, z]);
  }

  b.pose(pitch, { axis: [1, 0, 0], deg: -8 });
  return b.root;
}
