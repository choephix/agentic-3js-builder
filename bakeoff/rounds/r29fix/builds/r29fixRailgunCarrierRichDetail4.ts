import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four hydraulic stabiliser legs, low-poly sci-fi military.",
};

const OLIVE = "#5d6d49", OLIVE2 = "#4a5839", DARK = "#2a2e2b", STEEL = "#8b9197", TYRE = "#1c1e1e";
const WARN = "#e2b422", CYAN = "#6ff0ff", GLASS = "#2d5662", RED = "#b3342b", SAND = "#b9a57a";

const STRIPES = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e2b422"/>${[0, 1, 2, 3, 4, 5]
    .map((i) => `<path d="M${i * 14 - 6} 16 L${i * 14 + 2} 0 L${i * 14 + 9} 0 L${i * 14 + 1} 16Z" fill="#1d1f1f"/>`)
    .join("")}</svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1d1f1f" stroke="#e2b422" stroke-width="4"/>
  <path d="M10 32 H54" stroke="#6ff0ff" stroke-width="5"/><path d="M32 12 L40 32 L32 52 L24 32Z" fill="#e2b422"/>
  <circle cx="32" cy="32" r="5" fill="#b3342b"/></svg>`,
  { size: 128 },
);
const NUMBER = svg(
  `<svg viewBox="0 0 64 32"><text x="32" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="#e8e4d0" stroke="#1d1f1f" stroke-width="1.5">RG-6</text></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const chassis = b.joint("chassis", { at: [0, 1.1, 0], role: "spine" });
  const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cy = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
  const P = (g: THREE.BufferGeometry, c: string, bone: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at: at as any, ...o });

  // ---- hull
  P(bx(2.5, 0.8, 8.6), OLIVE, chassis, [0, 1.25, -0.3]);
  P(bx(2.2, 0.3, 8.4), DARK, chassis, [0, 0.8, -0.3]); // belly
  b.frustumBox([0, 1.65, 2.1], [0, 1.75, 4.3], [2.5, 0.7], [2.3, 0.45], { bone: chassis, color: OLIVE2 }); // nose
  // cab
  b.frustumBox([0, 1.95, 1.3], [0, 2.5, 3.2], [2.3, 0.9], [2.1, 0.55], { bone: chassis, color: OLIVE });
  P(bx(1.9, 0.5, 0.06), GLASS, chassis, [0, 2.45, 3.22], { rotation: [-35, 0, 0] });
  for (const s of [1, -1]) {
    P(bx(0.06, 0.4, 1.0), GLASS, chassis, [s * 1.1, 2.4, 2.2]);
    P(bx(0.04, 0.5, 0.8), STEEL, chassis, [s * 1.27, 1.5, 0.9]); // side door
    P(bx(0.4, 0.25, 0.02), STEEL, chassis, [s * 1.27, 1.55, 3.7]);
  }
  // roof gear: light bar, antenna, sensor dome
  P(bx(1.3, 0.1, 0.18), DARK, chassis, [0, 2.8, 2.5]);
  glow(P(bx(1.2, 0.05, 0.04), WARN, chassis, [0, 2.82, 2.61]));
  b.spike([-1.0, 2.0, 0.2], [0, 1, 0], 2.0, 0.025, STEEL, { bone: chassis, sides: 5 });
  P(new THREE.SphereGeometry(0.22, 8, 4, 0, 6.28, 0, 1.57), STEEL, chassis, [0.8, 2.4, 1.6], { flat: true });
  // headlights, tow hooks, bumper
  P(bx(2.6, 0.3, 0.3), DARK, chassis, [0, 1.0, 4.35]);
  for (const s of [1, -1]) {
    glow(P(bx(0.4, 0.18, 0.05), CYAN, chassis, [s * 0.9, 1.45, 4.4]), 1.4);
    glow(P(bx(0.2, 0.1, 0.04), RED, chassis, [s * 1.0, 1.45, -4.62]));
    P(new THREE.TorusGeometry(0.1, 0.03, 5, 8), STEEL, chassis, [s * 0.6, 1.0, 4.55]);
  }
  P(bx(2.6, 0.12, 0.1), "#ffffff", chassis, [0, 1.0, 4.52], { texture: STRIPES });
  // side skirts & hull details
  for (const s of [1, -1]) {
    P(bx(0.12, 0.6, 8.4), OLIVE2, chassis, [s * 1.3, 1.2, -0.3]);
    for (let i = 0; i < 6; i++) P(bx(0.05, 0.4, 0.5), STEEL, chassis, [s * 1.38, 1.2, -3.2 + i * 1.1]);
    P(new THREE.PlaneGeometry(1.6, 0.8), "#ffffff", chassis, [s * 1.39, 1.3, 0.3], { dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    P(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", chassis, [s * 1.39, 1.35, -1.6], { dir: [s, 0, 0], axis: "z", texture: NUMBER });
  }
  // rear deck, ladder, exhaust, crates
  P(bx(2.3, 0.15, 5.4), DARK, chassis, [0, 1.72, -1.9]);
  for (let i = 0; i < 9; i++) P(bx(2.1, 0.04, 0.12), STEEL, chassis, [0, 1.82, -4.2 + i * 0.55]);
  for (const s of [1, -1]) {
    P(cy(0.12, 1.1, 8), STEEL, chassis, [s * 1.1, 2.2, 1.0]); // exhaust
    P(cy(0.15, 0.08, 8), DARK, chassis, [s * 1.1, 2.78, 1.0]);
    P(bx(0.7, 0.45, 0.9), OLIVE2, chassis, [s * 0.85, 2.05, -4.0]); // crates
    P(bx(0.72, 0.06, 0.2), WARN, chassis, [s * 0.85, 2.3, -4.0]);
  }
  for (const dy of [0, 0.3, 0.6]) b.rod([0.3, 1.5 + dy, -4.62], [-0.3, 1.5 + dy, -4.62], 0.03, STEEL, { bone: chassis, sides: 5 });
  // power core + cables at the rear
  P(cy(0.4, 0.9, 8), DARK, chassis, [0, 2.35, -3.6], { flat: true });
  glow(P(cy(0.28, 0.6, 8), CYAN, chassis, [0, 2.4, -3.6]), 1.2);

  // ---- wheels (3 axles, 6 wheels)
  const axles = [3.0, 1.6, -2.4];
  axles.forEach((z, ai) => {
    P(bx(2.9, 0.18, 0.2), DARK, chassis, [0, 0.75, z]);
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hub = [s * 1.65, 0.6, z];
      const spin = b.joint(`wheel${side}${ai}`, { parent: chassis, at: hub as any, dir: [s, 0, 0], role: "hinge" });
      const R: [number, number, number] = [0, 0, 90];
      P(cy(0.5, 0.5, 14), TYRE, spin, hub, { rotation: R, flat: true });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * 6.283;
        P(bx(0.5, 0.1, 0.14), TYRE, spin, [hub[0], 0.6 + 0.58 * Math.cos(a), z + 0.58 * Math.sin(a)], {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      P(cy(0.3, 0.52, 10), STEEL, spin, hub, { rotation: R, flat: true });
      P(cy(0.16, 0.6, 8), DARK, spin, [hub[0] + s * 0.02, 0.6, z], { rotation: R });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.283;
        P(cy(0.025, 0.06, 6), STEEL, spin, [hub[0] + s * 0.3, 0.6 + 0.22 * Math.cos(a), z + 0.22 * Math.sin(a)], { rotation: R });
      }
      // fender + mud flap + axle half
      P(bx(0.6, 0.1, 1.5), OLIVE2, chassis, [s * 1.65, 1.3, z], { rotation: [0, 0, 0] });
      P(bx(0.5, 0.35, 0.05), TYRE, chassis, [s * 1.65, 0.95, z - 0.75]);
      b.rod([s * 0.4, 0.75, z], [s * 1.5, 0.62, z], 0.07, DARK, { bone: chassis, sides: 6 });
    }
  });

  // ---- stabiliser legs, deployed
  for (const [nm, x, z] of [["FL", 1, 2.3], ["FR", -1, 2.3], ["RL", 1, -3.6], ["RR", -1, -3.6]] as const) {
    const s = x;
    const root = [s * 1.3, 1.2, z];
    const leg = b.joint(`stab${nm}`, { parent: chassis, at: root as any, dir: [s, -0.25, 0], role: "leg" });
    const kx = s * 2.35;
    b.rod(root as any, [kx, 1.0, z], 0.12, STEEL, { bone: leg, sides: 6 }); // outrigger arm
    P(bx(0.4, 0.3, 0.4), DARK, leg, [kx, 1.1, z]);
    b.rod([kx, 1.0, z], [kx, 0.2, z], 0.1, WARN, { bone: leg, sides: 8 }); // leg
    b.rod([kx, 0.9, z], [kx, 0.25, z], 0.06, STEEL, { bone: leg, sides: 6 }); // piston
    P(cy(0.28, 0.1, 8), DARK, leg, [kx, 0.07, z], { flat: true }); // foot pad
    P(cy(0.2, 0.06, 8), STEEL, leg, [kx, 0.13, z]);
    b.rod([s * 1.3, 0.85, z + 0.4], [kx, 0.8, z], 0.045, STEEL, { bone: leg, sides: 5 }); // brace
    P(bx(0.3, 0.06, 0.3), "#ffffff", leg, [kx, 1.27, z], { texture: STRIPES });
  }

  // ---- turret + railgun
  const deck = [0, 1.8, -1.2];
  const yaw = b.joint("yaw", { parent: chassis, at: deck as any, dir: [0, 1, 0], up: [1, 0, 0], role: "hinge" });
  const py = 3.0;
  const pitch = b.joint("pitch", { parent: yaw, at: [0, py, -1.2], dir: [0, 0, 1], role: "hinge" });
  P(new THREE.TorusGeometry(1.0, 0.07, 6, 16), STEEL, chassis, [0, 1.85, -1.2], { rotation: [90, 0, 0] });
  P(cy(0.95, 0.5, 12), OLIVE, yaw, [0, 2.1, -1.2], { flat: true });
  P(bx(2.2, 0.5, 1.9), OLIVE2, yaw, [0, 2.55, -1.2]);
  for (const s of [1, -1]) {
    P(bx(0.2, 1.1, 1.6), OLIVE, yaw, [s * 0.7, 3.0, -1.2]); // cheeks
    P(bx(0.22, 0.2, 1.0), "#ffffff", yaw, [s * 0.82, 3.0, -1.2], { texture: STRIPES });
    P(bx(0.5, 0.5, 0.9), DARK, yaw, [s * 1.25, 2.6, -1.5]); // ammo/cap
    glow(P(bx(0.4, 0.08, 0.06), CYAN, yaw, [s * 1.25, 2.7, -1.0]));
  }
  b.rod([-0.8, py, -1.2], [0.8, py, -1.2], 0.08, STEEL, { bone: pitch, sides: 8 });
  const z0 = -1.2;
  P(bx(0.8, 0.8, 1.6), OLIVE, pitch, [0, py, z0 - 0.5]); // breech
  P(bx(0.9, 0.12, 1.0), WARN, pitch, [0, py + 0.46, z0 - 0.5]);
  for (const s of [1, -1]) {
    P(bx(0.16, 0.34, 6.4), STEEL, pitch, [s * 0.26, py, z0 + 3.6]); // rails
    P(bx(0.06, 0.4, 6.4), DARK, pitch, [s * 0.36, py, z0 + 3.6]);
    for (let i = 0; i < 4; i++) P(cy(0.17, 0.7, 10), DARK, pitch, [s * 0.65, py - 0.15, z0 + 0.7 + i * 1.5], { rotation: [90, 0, 0], flat: true });
    for (let i = 0; i < 4; i++) glow(P(cy(0.12, 0.04, 8), CYAN, pitch, [s * 0.65, py - 0.15, z0 + 1.06 + i * 1.5], { rotation: [90, 0, 0] }));
  }
  glow(P(bx(0.2, 0.06, 6.3), CYAN, pitch, [0, py, z0 + 3.6]), 1.5);
  for (let i = 0; i < 6; i++) {
    P(bx(0.9, 0.55, 0.12), OLIVE2, pitch, [0, py, z0 + 1.2 + i * 1.0]); // clamps
    glow(P(new THREE.TorusGeometry(0.34, 0.025, 4, 10), CYAN, pitch, [0, py, z0 + 1.27 + i * 1.0], { flat: true }));
  }
  P(bx(1.0, 0.7, 0.4), DARK, pitch, [0, py, z0 + 7.0]); // muzzle block
  glow(P(bx(0.2, 0.2, 0.05), CYAN, pitch, [0, py, z0 + 7.22]), 1.6);
  b.pose(pitch, { axis: [1, 0, 0], deg: -10 });
  return b.root;
}
