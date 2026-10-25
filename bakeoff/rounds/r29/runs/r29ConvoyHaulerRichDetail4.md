```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Convoy Hauler MK-IV",
  description: "Low-poly cyberpunk armoured six-wheel convoy hauler with roof turret and a sealed, glowing cargo pod.",
};

const HULL = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.5, rivets: 0.12 });
const POD = panelled("#2b3f4d", { size: 0.7, aspect: 0.8, rivets: 0.14 });
const PLATE = panelled("#3a3f4c", { size: 0.45, rivets: 0.1 });
const DARK = "#14161d";
const STEEL = "#6b7080";
const TYRE = "#17181c";
const CYAN = "#33f0ff";
const MAG = "#ff2d9a";
const AMBER = "#ffb02e";
const HAZ = "#ffd21f";

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffd21f"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#15151a"/>`)
    .join("")}<rect x="0" y="0" width="64" height="16" fill="none" stroke="#15151a" stroke-width="2"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#10131a" stroke="#33f0ff" stroke-width="5"/>
  <path d="M50 14 L82 32 L82 62 L50 86 L18 62 L18 32Z" fill="none" stroke="#ff2d9a" stroke-width="5"/>
  <path d="M50 28 L50 72 M32 40 L68 40 M36 58 L64 58" stroke="#33f0ff" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="7" fill="#ffb02e"/></svg>`,
  { size: 256 },
);
const SIGN = svg(
  `<svg viewBox="0 0 120 40"><rect width="120" height="40" rx="4" fill="#0b0d14"/>
  <rect x="3" y="3" width="114" height="34" rx="3" fill="none" stroke="#ff2d9a" stroke-width="2"/>
  <text x="60" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#33f0ff">SEALED CARGO</text>
  <text x="60" y="32" text-anchor="middle" font-family="monospace" font-size="10" fill="#ffb02e">DO NOT OPEN // N-7</text></svg>`,
  { size: 512 },
);
const VISOR = svg(
  `<svg viewBox="0 0 100 20"><rect width="100" height="20" fill="#0a2a33"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((i) => `<rect x="${i * 10 + 1}" y="${3 + (i % 3) * 3}" width="8" height="${12 - (i % 3) * 3}" fill="#33f0ff"/>`)
    .join("")}</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const P = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: chassis, at: at as any, ...o });
  const bx = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, o: any = {}) =>
    P(box(w, h, d), col, [x, y, z], o);
  const G = (w: number, h: number, d: number, col: string, x: number, y: number, z: number, k = 1.2) =>
    glow(bx(w, h, d, col, x, y, z), k);
  const rod = (a: number[], c: number[], r: number, col: any, o: any = {}) =>
    b.rod(a as any, c as any, r, col, { bone: chassis, sides: 6, ...o });
  const plane = (g: THREE.BufferGeometry, tex: any, at: number[], dir: number[], o: any = {}) =>
    b.part(g, "#ffffff", { bone: chassis, at: at as any, dir: dir as any, axis: "z", texture: tex, ...o });

  // ---------- frame
  for (const s of [1, -1]) {
    bx(0.22, 0.28, 7.2, DARK, s * 0.75, 0.9, -0.1);
    bx(0.06, 0.2, 7.0, STEEL, s * 0.88, 0.9, -0.1);
  }
  for (const z of [-3.3, -2.0, -0.6, 0.8, 2.2])
    bx(1.7, 0.16, 0.2, DARK, 0, 0.92, z);
  rod([0, 0.85, -3], [0, 0.85, 2.6], 0.07, STEEL, { sides: 8 }); // driveshaft
  P(cyl(0.3, 0.9, 8), STEEL, [0.4, 0.75, 0.2], { rotation: [0, 0, 90], flat: true }); // fuel/battery
  bx(1.9, 0.12, 7.0, DARK, 0, 1.12, -0.1); // deck

  // ---------- wheels
  const wheelSpec: [string, number, number][] = [
    ["FL", 1, 2.5], ["FR", -1, 2.5], ["ML", 1, -1.1], ["MR", -1, -1.1], ["RL", 1, -2.55], ["RR", -1, -2.55],
  ];
  for (const [k, s, z] of wheelSpec) {
    const hub: [number, number, number] = [s * 1.12, 0.55, z];
    const j = b.joint(`wheel${k}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" });
    const W = (g: THREE.BufferGeometry, col: any, dx = 0, o: any = {}) =>
      b.part(g, col, { bone: j, at: [hub[0] + s * dx, hub[1], hub[2]], rotation: [0, 0, 90], ...o });
    W(cyl(0.55, 0.5, 12), TYRE, 0, { flat: true });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.part(box(0.52, 0.08, 0.14), TYRE, {
        bone: j,
        at: [hub[0], hub[1] + 0.56 * Math.cos(a), hub[2] + 0.56 * Math.sin(a)],
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    W(cyl(0.34, 0.54, 10), STEEL, 0, { flat: true });
    W(cyl(0.3, 0.06, 10), DARK, 0.28, { flat: true });
    W(cyl(0.12, 0.1, 8), AMBER, 0.32, { flat: true });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(cyl(0.03, 0.06, 6), "#c9ccd6", {
        bone: j,
        at: [hub[0] + s * 0.3, hub[1] + 0.22 * Math.cos(a), hub[2] + 0.22 * Math.sin(a)],
        rotation: [0, 0, 90],
      });
    }
    // fender + flap
    bx(0.5, 0.08, 1.4, PLATE, s * 1.12, 1.18, z);
    bx(0.5, 0.4, 0.06, DARK, s * 1.12, 0.72 + 0.1, z - 0.7);
    bx(0.06, 0.3, 1.3, PLATE, s * 1.36, 1.05, z);
  }

  // ---------- cab
  bx(2.2, 0.9, 2.1, HULL, 0, 1.7, 1.8); // lower cab
  bx(2.0, 0.7, 1.5, HULL, 0, 2.5, 1.5); // upper
  bx(2.1, 0.12, 1.7, PLATE, 0, 2.9, 1.5); // roof plate
  b.frustumBox([0, 1.5, 2.8], [0, 1.45, 3.5], [2.1, 1.0], [1.9, 0.7], { bone: chassis, color: HULL }); // sloped hood
  bx(2.0, 0.08, 0.7, PLATE, 0, 2.0, 3.1, { rotation: [10, 0, 0] });
  plane(new THREE.PlaneGeometry(1.7, 0.34), VISOR, [0, 2.55, 2.27], [0, 0, 1], {});
  glow(bx(1.72, 0.04, 0.04, CYAN, 0, 2.74, 2.27), 1.5);
  bx(1.8, 0.08, 0.14, DARK, 0, 2.34, 2.3);
  for (const s of [1, -1]) {
    bx(0.08, 0.5, 0.9, DARK, s * 1.05, 2.5, 1.5); // side window
    G(0.04, 0.34, 0.7, "#0e4a55", s * 1.09, 2.5, 1.5, 0.6);
    bx(0.06, 0.1, 0.8, PLATE, s * 1.12, 2.8, 1.5, { rotation: [0, 0, s * -20] });
    // side armour with bolts
    bx(0.1, 0.7, 1.7, PLATE, s * 1.15, 1.65, 1.9);
    for (const dz of [-0.7, 0, 0.7]) for (const dy of [-0.25, 0.25])
      P(cyl(0.04, 0.05, 6), "#c9ccd6", [s * 1.22, 1.65 + dy, 1.9 + dz], { rotation: [0, 0, 90] });
    G(0.03, 0.04, 1.4, s > 0 ? MAG : CYAN, s * 1.22, 1.35, 1.9);
    // headlights
    bx(0.5, 0.2, 0.12, DARK, s * 0.7, 1.6, 3.55);
    G(0.42, 0.1, 0.04, "#fff1b8", s * 0.7, 1.6, 3.62, 1.8);
    // mirrors
    rod([s * 1.1, 2.6, 2.2], [s * 1.55, 2.7, 2.3], 0.03, STEEL);
    bx(0.08, 0.34, 0.2, DARK, s * 1.58, 2.7, 2.3);
    // exhaust stacks
    rod([s * 1.0, 1.4, 0.95], [s * 1.0, 3.5, 0.95], 0.1, STEEL, { sides: 8 });
    P(cyl(0.13, 0.12, 8), DARK, [s * 1.0, 3.52, 0.95]);
    for (const y of [1.8, 2.4, 3.0]) P(cyl(0.125, 0.06, 8), AMBER, [s * 1.0, y, 0.95]);
    bx(0.12, 2.0, 0.3, PLATE, s * 1.0, 2.2, 0.75);
  }
  // grille & ram bumper
  bx(1.5, 0.5, 0.1, DARK, 0, 1.2, 3.55);
  for (let i = 0; i < 6; i++) bx(1.4, 0.03, 0.04, STEEL, 0, 1.0 + i * 0.08, 3.6);
  bx(2.5, 0.4, 0.3, PLATE, 0, 0.85, 3.6);
  for (let i = 0; i < 7; i++)
    b.spike([-1.05 + i * 0.35, 0.8, 3.75] as any, [0, 0, 1] as any, 0.3, 0.07, STEEL, { bone: chassis, sides: 4 });
  plane(new THREE.PlaneGeometry(1.4, 0.2), HAZARD, [0, 0.98, 3.76], [0, 0, 1]);
  // roof: light bar, antenna, turret
  bx(1.5, 0.12, 0.2, DARK, 0, 3.05, 2.2);
  for (let i = 0; i < 5; i++) G(0.22, 0.08, 0.05, i % 2 ? MAG : CYAN, -0.6 + i * 0.3, 3.08, 2.31, 2);
  rod([-0.8, 2.96, 0.9], [-0.8, 4.3, 0.9], 0.02, STEEL, { sides: 4 });
  P(new THREE.SphereGeometry(0.05, 6, 4), MAG, [-0.8, 4.32, 0.9]);
  glow(P(new THREE.SphereGeometry(0.05, 6, 4), MAG, [-0.8, 4.34, 0.9]), 2);
  rod([0.8, 2.96, 0.9], [0.8, 3.7, 0.9], 0.015, STEEL, { sides: 4 });
  b.lathe([[0, 0], [0.3, 0], [0.28, 0.08], [0.05, 0.2], [0, 0.2]], {
    at: [0.8, 3.7, 0.9], axis: [0, 0.7, -0.5], bone: chassis, segments: 8, color: STEEL,
  }); // dish

  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.0, 1.35], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.4, 1.4], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.5, 0.1, 12), STEEL, { bone: chassis, at: [0, 3.0, 1.35], flat: true });
  b.part(cyl(0.42, 0.25, 10), PLATE, { bone: yaw, at: [0, 3.2, 1.35], flat: true });
  for (const s of [1, -1]) {
    b.part(box(0.08, 0.4, 0.6), PLATE, { bone: yaw, at: [s * 0.3, 3.45, 1.35] });
    b.part(box(0.3, 0.3, 0.5), DARK, { bone: yaw, at: [s * 0.6, 3.4, 1.3] }); // ammo box
    b.part(box(0.22, 0.04, 0.3), HAZ, { bone: yaw, at: [s * 0.6, 3.57, 1.3] });
  }
  b.part(box(0.4, 0.3, 0.6), HULL, { bone: pitch, at: [0, 3.4, 1.35] });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 3.4, 1.6], [s * 0.1, 3.4, 3.0], 0.055, STEEL, { bone: pitch, sides: 8 });
    b.part(cyl(0.09, 0.4, 8), PLATE, { bone: pitch, at: [s * 0.1, 3.4, 2.0], rotation: [90, 0, 0] });
    b.part(box(0.14, 0.14, 0.14), DARK, { bone: pitch, at: [s * 0.1, 3.4, 3.0] });
  }
  glow(b.part(box(0.08, 0.06, 0.04), CYAN, { bone: pitch, at: [0, 3.5, 1.67] }), 1.5); // sensor

  // ---------- cargo pod
  const pz = -1.75;
  bx(2.35, 1.5, 4.5, POD, 0, 2.0, pz);
  b.frustumBox([0, 2.75, pz + 2.2], [0, 2.75, pz - 2.2], [2.2, 0.2], [2.2, 0.2], { bone: chassis, color: PLATE });
  for (let i = 0; i < 6; i++) {
    const z = pz - 2.0 + i * 0.8;
    bx(2.5, 1.6, 0.12, PLATE, 0, 2.0, z);
    for (const s of [1, -1]) {
      G(0.04, 0.9, 0.05, i % 2 ? CYAN : MAG, s * 1.2, 2.0, z + 0.2, 1.4);
      P(cyl(0.04, 0.06, 6), "#c9ccd6", [s * 1.27, 2.65, z], { rotation: [0, 0, 90] });
      P(cyl(0.04, 0.06, 6), "#c9ccd6", [s * 1.27, 1.4, z], { rotation: [0, 0, 90] });
    }
  }
  // locking clamps on top
  for (let i = 0; i < 4; i++) {
    const z = pz - 1.6 + i * 1.0;
    bx(2.4, 0.1, 0.22, DARK, 0, 2.82, z);
    G(0.4, 0.04, 0.12, AMBER, 0, 2.9, z, 1.5);
  }
  // pod side vents + panels
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) bx(0.04, 0.05, 0.9, DARK, s * 1.19, 2.55 - i * 0.1, pz + 0.7);
    bx(0.05, 0.5, 1.0, HULL, s * 1.2, 1.55, pz + 0.2);
    plane(new THREE.PlaneGeometry(1.0, 0.33), SIGN, [s * 1.23, 2.1, pz - 0.7], [s, 0, 0]);
    plane(new THREE.CircleGeometry(0.4, 12), EMBLEM, [s * 1.23, 2.3, pz + 1.3], [s, 0, 0]);
  }
  // rear door
  bx(2.1, 1.3, 0.1, DARK, 0, 2.0, pz - 2.28);
  bx(0.06, 1.3, 0.12, STEEL, 0, 2.0, pz - 2.33);
  plane(new THREE.PlaneGeometry(2.1, 0.3), HAZARD, [0, 1.45, pz - 2.4], [0, 0, -1]);
  plane(new THREE.CircleGeometry(0.4, 12), EMBLEM, [0.5, 2.25, pz - 2.4], [0, 0, -1]);
  plane(new THREE.PlaneGeometry(0.9, 0.3), SIGN, [-0.5, 2.25, pz - 2.4], [0, 0, -1]);
  for (const s of [1, -1]) for (const y of [1.6, 2.5]) P(cyl(0.08, 0.12, 8), STEEL, [s * 1.0, y, pz - 2.33], { rotation: [90, 0, 0] });
  bx(0.4, 0.1, 0.1, STEEL, 0, 2.0, pz - 2.4);
  // tail lights, rear bumper, tow hooks
  bx(2.4, 0.3, 0.3, PLATE, 0, 0.95, -3.85);
  for (const s of [1, -1]) {
    G(0.3, 0.12, 0.04, "#ff2030", s * 0.9, 1.3, -3.7, 1.6);
    P(new THREE.TorusGeometry(0.1, 0.03, 5, 8), STEEL, [s * 0.6, 0.9, -4.05]);
  }
  // deck-side tool boxes, cables
  for (const s of [1, -1]) {
    bx(0.4, 0.4, 1.2, PLATE, s * 1.05, 1.4, -1.0);
    bx(0.42, 0.04, 1.0, HAZ, s * 1.05, 1.62, -1.0);
  }
  rod([0.3, 1.9, 0.1], [0.3, 1.4, 0.1], 0.04, DARK);
  rod([-0.3, 2.2, 0.55], [-0.3, 1.5, 0.3], 0.04, MAG);
  rod([0.3, 2.2, 0.55], [0.3, 1.5, 0.3], 0.04, CYAN);
  // under-glow
  G(1.8, 0.04, 6.4, MAG, 0, 0.72, -0.1, 1.2);

  return b.root;
}
```