import * as THREE from "three";
import { createBuilder, rng, paint, mottle, countershade, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters: low-poly cyberpunk, neon underglow, roof cannon, bed turret.",
};

const OLIVE = "#4b5a3c", DARK = "#16181f", STEEL = "#5d6574", PLATE = "#39424d";
const CYAN = "#37f2ff", MAG = "#ff2d95", AMBER = "#ffb02e", GLASS = "#0c2a38";

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const chassis = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });
  const R = rng(5);

  const hull = countershade(
    mottle(OLIVE, "#3a472f", { size: 0.3, seed: 2 }),
    "#232a22",
    { level: -0.4 },
  );
  const bx = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: chassis, at: [x, y, z], ...o });
  const cy = (r: number, h: number, sides: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), col, { bone: chassis, at, flat: true, ...o });

  // textures
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#1a1a1a"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<polygon points="${i * 10},16 ${i * 10 + 5},16 ${i * 10 + 13},0 ${i * 10 + 8},0" fill="#ffc21a"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#10131a" stroke="#37f2ff" stroke-width="3"/>
    <polygon points="32,10 52,48 12,48" fill="none" stroke="#ff2d95" stroke-width="4"/>
    <circle cx="32" cy="36" r="6" fill="#37f2ff"/><path d="M8 32h10M46 32h10" stroke="#ffb02e" stroke-width="3"/></svg>`,
    { size: 192 },
  );
  const sign = svg(
    `<svg viewBox="0 0 96 32"><rect width="96" height="32" rx="3" fill="#0b0d14"/>
    <text x="48" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#ff2d95">HVR-07</text>
    <rect x="2" y="2" width="92" height="28" rx="3" fill="none" stroke="#37f2ff" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone: chassis, at, dir, axis: "z", texture: tex });

  // frame & body
  bx(1.7, 0.22, 4.7, PLATE, 0, 0.78, 0);
  bx(1.9, 0.3, 3.6, hull, 0, 0.98, -0.2);
  bx(1.95, 0.08, 4.0, DARK, 0, 0.82, -0.1);
  // cab
  bx(1.88, 0.62, 1.5, hull, 0, 1.45, 0.3);
  bx(1.74, 0.1, 1.3, hull, 0, 2.0, 0.2);
  bx(1.6, 0.05, 1.1, PLATE, 0, 2.07, 0.2);
  decal(svg(`<svg viewBox="0 0 8 4"><rect width="8" height="4" fill="#0c2a38"/><path d="M0 4L4 0H8" stroke="#37f2ff" stroke-width=".3" fill="none"/></svg>`, { size: 128 }), 1.7, 0.5, [0, 1.72, 1.07], [0, 0.35, 1]);
  bx(1.7, 0.45, 0.04, GLASS, 0, 1.75, 1.06, { rotation: [-28, 0, 0] });
  bx(1.7, 0.4, 0.04, GLASS, 0, 1.72, -0.47);
  for (const s of [1, -1]) {
    bx(0.04, 0.4, 1.0, GLASS, s * 0.95, 1.72, 0.3);
    bx(0.08, 0.5, 0.08, PLATE, s * 0.93, 1.72, 0.85);
    bx(0.04, 0.5, 0.04, PLATE, s * 0.96, 1.5, 0.3);
    bx(0.1, 0.05, 0.22, STEEL, s * 0.97, 1.5, 0.05); // handle
    decal(emblem, 0.5, 0.5, [s * 0.965, 1.5, 0.5], [s, 0, 0]);
    // side armour plate with bolts
    bx(0.06, 0.4, 1.4, PLATE, s * 0.97, 1.05, 0.2);
    for (let i = 0; i < 5; i++) cy(0.025, 0.04, 6, STEEL, [s * 1.0, 1.05, -0.35 + i * 0.3], { rotation: [0, 0, 90] });
    // mirror
    b.rod([s * 0.95, 1.65, 0.9], [s * 1.2, 1.7, 0.95], 0.015, STEEL, { bone: chassis });
    bx(0.06, 0.2, 0.14, DARK, s * 1.22, 1.7, 0.95);
    // underglow strips
    glow(bx(0.05, 0.05, 3.4, CYAN, s * 0.98, 0.72, 0), 1.5);
    // fender
    bx(0.3, 0.12, 1.2, hull, s * 0.85, 1.2, 1.7);
  }
  // hood
  bx(1.8, 0.35, 1.6, hull, 0, 1.15, 1.7);
  bx(1.7, 0.06, 1.5, hull, 0, 1.36, 1.7, { rotation: [-5, 0, 0] });
  bx(0.5, 0.08, 0.7, PLATE, 0, 1.43, 1.5); // intake
  for (let i = 0; i < 4; i++) bx(0.4, 0.02, 0.05, DARK, 0, 1.48, 1.25 + i * 0.15);
  glow(bx(1.2, 0.05, 0.03, CYAN, 0, 1.2, 2.51), 2); // front light strip
  bx(1.6, 0.4, 0.1, PLATE, 0, 1.0, 2.5);
  for (const s of [1, -1]) {
    bx(0.3, 0.14, 0.06, "#fff6c0", s * 0.62, 1.18, 2.55);
    glow(bx(0.26, 0.1, 0.04, "#fff3a8", s * 0.62, 1.18, 2.58), 2);
    for (let i = 0; i < 3; i++) bx(0.04, 0.3, 0.06, STEEL, s * (0.2 + i * 0.12), 1.0, 2.56); // grille
  }
  // bumper with hazard
  bx(2.0, 0.22, 0.2, STEEL, 0, 0.78, 2.55);
  b.part(new THREE.PlaneGeometry(1.8, 0.2), "#ffffff", { bone: chassis, at: [0, 0.78, 2.66], dir: [0, 0, 1], axis: "z", texture: hazard });
  for (const s of [1, -1]) b.spike([s * 0.8, 0.7, 2.62], [0, 0, 1], 0.2, 0.05, STEEL, { bone: chassis, sides: 5 });
  // bed
  bx(1.9, 0.08, 2.0, PLATE, 0, 1.1, -1.5);
  for (const s of [1, -1]) {
    bx(0.08, 0.45, 2.0, hull, s * 0.95, 1.35, -1.5);
    bx(0.12, 0.05, 2.0, STEEL, s * 0.95, 1.6, -1.5);
    for (let i = 0; i < 4; i++) bx(0.1, 0.4, 0.06, PLATE, s * 0.99, 1.35, -0.7 - i * 0.5);
  }
  bx(1.9, 0.45, 0.08, hull, 0, 1.35, -2.5);
  bx(1.9, 0.45, 0.08, hull, 0, 1.35, -0.55);
  bx(1.4, 0.04, 0.5, PLATE, 0, 1.12, -2.45);
  decal(sign, 0.9, 0.3, [0, 1.38, -2.55], [0, 0, -1]);
  // ammo crates
  for (const s of [1, -1]) {
    bx(0.5, 0.3, 0.5, "#6a5a2c", s * 0.5, 1.3, -2.1);
    bx(0.52, 0.04, 0.12, AMBER, s * 0.5, 1.46, -2.1);
  }
  // bed turret
  cy(0.35, 0.14, 12, STEEL, [0, 1.22, -1.35]);
  cy(0.25, 0.3, 8, PLATE, [0, 1.45, -1.35]);
  bx(0.4, 0.3, 0.5, PLATE, 0, 1.75, -1.3);
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 1.75, -1.1], [s * 0.1, 1.78, 0.0 - 0.2], 0.04, DARK, { bone: chassis, sides: 6 });
    cy(0.06, 0.15, 6, STEEL, [s * 0.1, 1.78, -0.1], { rotation: [90, 0, 0] });
  }
  glow(bx(0.2, 0.04, 0.02, MAG, 0, 1.85, -1.05), 2);
  // roof gear
  bx(1.4, 0.1, 0.18, DARK, 0, 2.15, 0.7);
  for (const x of [-0.5, -0.17, 0.17, 0.5]) glow(cy(0.06, 0.04, 8, x < 0 ? MAG : CYAN, [x, 2.16, 0.8], { rotation: [90, 0, 0] }), 2);
  b.rod([-0.7, 2.05, -0.3], [-0.7, 3.0, -0.35], 0.015, STEEL, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), MAG, { bone: chassis, at: [-0.7, 3.02, -0.35] }), 2);
  cy(0.25, 0.04, 10, STEEL, [0.5, 2.1, -0.2]);
  b.part(new THREE.SphereGeometry(0.3, 10, 4, 0, 6.3, 0, 1.2), PLATE, { bone: chassis, at: [0.5, 2.1, -0.2], rotation: [-55, 0, 0], flat: true });
  // tail lights & exhaust-less rear
  for (const s of [1, -1]) {
    glow(bx(0.4, 0.1, 0.04, MAG, s * 0.7, 1.0, -2.55), 2);
    cy(0.1, 0.2, 8, DARK, [s * 0.55, 0.9, -2.5], { rotation: [90, 0, 0] });
  }
  // hover thrusters
  for (const sx of [1, -1])
    for (const z of [1.5, -1.5]) {
      const x = sx * 1.15;
      cy(0.4, 0.45, 10, hull, [x, 0.75, z]);
      cy(0.43, 0.06, 10, STEEL, [x, 0.97, z]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cy(0.025, 0.05, 5, STEEL, [x + 0.34 * Math.cos(a), 0.95, z + 0.34 * Math.sin(a)]);
      }
      b.lathe([[0.18, 0], [0.28, 0], [0.4, 0.3], [0.35, 0.3], [0.22, 0.06], [0.18, 0.06]], {
        at: [x, 0.55, z], axis: [0, -1, 0], segments: 10, bone: chassis, color: PLATE,
      });
      glow(cy(0.2, 0.03, 10, CYAN, [x, 0.4, z]), 2.5);
      glow(b.part(new THREE.TorusGeometry(0.33, 0.015, 5, 12), CYAN, { bone: chassis, at: [x, 0.5, z], rotation: [90, 0, 0] }), 2);
      // strut to body, landing leg
      b.rod([sx * 0.9, 0.85, z], [x - sx * 0.2, 0.8, z], 0.06, STEEL, { bone: chassis, sides: 6 });
      b.rod([x + sx * 0.35, 0.8, z], [x + sx * 0.5, 0.03, z], 0.04, STEEL, { bone: chassis, sides: 6 });
      bx(0.35, 0.05, 0.6, DARK, x + sx * 0.5, 0.025, z);
      bx(0.36, 0.01, 0.2, AMBER, x + sx * 0.5, 0.055, z + 0.1);
    }
  // cables
  for (const s of [1, -1]) b.sweep([[s * 0.9, 0.88, 1.5], [s * 0.7, 0.62, 0.5], [s * 0.7, 0.62, -0.5], [s * 0.9, 0.88, -1.5]], 0.025, { bone: chassis, color: DARK, sides: 5 });
  void R;
  return b.root;
}
