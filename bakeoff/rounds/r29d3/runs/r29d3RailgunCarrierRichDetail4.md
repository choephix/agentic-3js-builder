```ts
import * as THREE from "three";
import { createBuilder, svg, mottle, paint, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four hydraulic stabiliser legs, low-poly sci-fi military.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
type V = [number, number, number];

const HULL = panelled(mottle("#5d6e48", "#4c5c3b", { size: 0.6, seed: 3 }), { size: 0.9, rivets: 0.12 });
const HULL2 = panelled(mottle("#6b7a52", "#56653f", { size: 0.5, seed: 8 }), { size: 0.7, rivets: 0.1 });
const STEEL = metal("steel", { tarnish: 0.3 });
const IRON = metal("iron");
const BLUED = metal("blued");
const BRASS = metal("brass", { tarnish: 0.5 });
const TYRE = "#1f2024";
const DARK = "#2a2d31";
const TAN = "#b9a56b";
const GLASS = "#5fb7c9";
const CYAN = "#5ff3ff";
const AMBER = "#ffb23a";
const RED = "#d8402e";

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b92a"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#1b1b1b"/>`)
    .join("")}<rect width="64" height="16" fill="none" stroke="#1b1b1b" stroke-width="2"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1c2420" stroke="#e8e0c0" stroke-width="3"/>
  <path d="M32 8 L40 30 L32 26 L24 30Z" fill="#e8e0c0"/><rect x="29" y="26" width="6" height="30" fill="#5ff3ff"/>
  <path d="M14 44 L50 44" stroke="#e8e0c0" stroke-width="3"/><path d="M18 50 L46 50" stroke="#d8402e" stroke-width="3"/></svg>`,
  { size: 256 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 96 32"><text x="48" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e8e0c0">RG-06</text></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 40 40"><path d="M20 3 L38 36 L2 36Z" fill="#e8b92a" stroke="#1b1b1b" stroke-width="3" stroke-linejoin="round"/><path d="M21 14 L14 26 L20 26 L18 33 L27 21 L21 21Z" fill="#1b1b1b"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#0b2a2e"/><path d="M4 30 L14 22 L24 26 L36 12 L46 18 L60 6" stroke="#5ff3ff" stroke-width="2.5" fill="none"/><path d="M0 12H64M0 24H64" stroke="#1d5a60" stroke-width="1"/><circle cx="46" cy="18" r="3" fill="#ffb23a"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const chassis = b.joint("chassis", { at: [0, 1.0, 0], role: "spine" });

  const P = (g: THREE.BufferGeometry, c: any, at: V, bone: any = chassis, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, bone: any = chassis) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const bolts = (pts: V[], bone: any, c: any = STEEL, r = 0.04, dir: V = [0, 1, 0]) =>
    pts.forEach((p) => P(cyl(r, 0.04, 6), c, p, bone, { dir }));

  // ---------------- chassis frame
  for (const s of [1, -1]) {
    P(box(0.28, 0.4, 8.6), IRON, [s * 0.9, 0.95, -0.6]); // frame rail
    P(box(0.12, 0.3, 8.0), DARK, [s * 1.12, 0.9, -0.6]);
  }
  for (const z of [-4.3, -2.6, -0.9, 0.9, 2.3, 3.4]) P(box(2.2, 0.3, 0.3), IRON, [0, 0.9, z]);
  b.rod([0, 0.75, 3.2], [0, 0.75, -3.8], 0.12, STEEL, { bone: chassis, sides: 8 }); // driveshaft
  for (const z of [2.8, 0.6, -1.6]) {
    b.rod([-1.5, 0.7, z], [1.5, 0.7, z], 0.14, IRON, { bone: chassis, sides: 8 }); // axle
    P(new THREE.SphereGeometry(0.34, 8, 6), DARK, [0, 0.7, z], chassis, { flat: true }); // differential
    for (const s of [1, -1]) {
      P(box(0.2, 0.3, 0.9), BLUED, [s * 1.0, 0.95, z]); // leaf spring stack
      b.rod([s * 1.0, 1.1, z - 0.3], [s * 1.0, 0.72, z - 0.1], 0.04, STEEL, { bone: chassis, sides: 6 });
    }
  }

  // ---------------- hull body
  P(box(3.0, 0.9, 8.0), HULL, [0, 1.55, -0.5]); // lower hull
  P(box(3.3, 0.18, 6.4), HULL2, [0, 2.08, -1.4]); // deck plate
  for (const s of [1, -1]) {
    P(box(0.14, 0.7, 6.2), DARK, [s * 1.62, 1.55, -1.3]); // side skirt
    P(box(0.2, 0.12, 6.4), TAN, [s * 1.72, 1.92, -1.3]); // trim rail
    for (const z of [-3.6, -2.4, -1.2, 0, 1.2]) P(box(0.04, 0.5, 0.5), DARK, [s * 1.7, 1.55, z]); // access hatches
    decal(WARN, 0.4, 0.4, [s * 1.76, 1.6, -3.7], [s, 0, 0]);
    // sloped rear
  }
  decal(HAZARD, 3.0, 0.45, [0, 1.35, -4.52], [0, 0, -1]);
  decal(STENCIL, 1.1, 0.37, [1.76, 1.65, -1.9], [1, 0, 0]);
  decal(STENCIL, 1.1, 0.37, [-1.76, 1.65, -1.9], [-1, 0, 0]);
  decal(EMBLEM, 0.7, 0.7, [1.76, 1.65, -0.9], [1, 0, 0]);
  decal(EMBLEM, 0.7, 0.7, [-1.76, 1.65, -0.9], [-1, 0, 0]);
  // rear ramp & tow
  P(box(2.6, 0.5, 0.2), HULL2, [0, 1.35, -4.6]);
  for (const s of [1, -1]) {
    P(cyl(0.18, 0.5, 8), STEEL, [s * 1.0, 0.9, -4.55], chassis, { rotation: [90, 0, 0] });
    P(box(0.5, 0.3, 0.12), DARK, [s * 1.0, 0.7, -4.75]);
    glow(P(box(0.4, 0.14, 0.04), RED, [s * 1.1, 1.6, -4.66]));
  }
  // deck details: cable reels, crates, vents
  for (const s of [1, -1]) {
    P(cyl(0.38, 0.6, 12), DARK, [s * 1.2, 2.5, -3.6], chassis, { rotation: [0, 0, 90], flat: true });
    P(cyl(0.28, 0.66, 12), BRASS, [s * 1.2, 2.5, -3.6], chassis, { rotation: [0, 0, 90], flat: true });
    P(box(0.7, 0.5, 0.9), HULL, [s * 1.1, 2.42, -0.6]); // power crate
    P(box(0.5, 0.06, 0.7), DARK, [s * 1.1, 2.7, -0.6]);
    for (let i = 0; i < 4; i++) P(box(0.04, 0.3, 0.7), DARK, [s * 1.46, 2.42, -0.8 + i * 0.02 + i * 0.0]);
  }
  for (let i = 0; i < 5; i++) P(box(1.4, 0.05, 0.08), DARK, [0, 2.2, -4.0 + i * 0.16]); // rear vent louvres
  P(box(1.6, 0.25, 1.0), HULL, [0, 2.3, -3.8]);
  // antenna and beacon
  b.spike([1.3, 2.6, -4.2], [0, 1, 0], 1.8, 0.04, STEEL, { bone: chassis, sides: 5 });
  P(new THREE.SphereGeometry(0.07, 6, 4), AMBER, [1.3, 4.42, -4.2]);
  glow(P(new THREE.SphereGeometry(0.1, 6, 4), AMBER, [-1.3, 2.7, -3.0]));

  // ---------------- cab
  P(box(2.9, 1.0, 2.0), HULL, [0, 1.7, 2.6]); // cab lower
  P(box(2.6, 0.12, 1.5), HULL2, [0, 2.62, 2.35]); // roof
  P(box(2.5, 0.75, 1.6), HULL, [0, 2.2, 2.2]);
  // sloped armoured screen with glass slits
  P(box(2.4, 0.7, 0.1), DARK, [0, 2.3, 3.1], chassis, { rotation: [-28, 0, 0] });
  for (const s of [1, -1]) {
    P(box(1.0, 0.4, 0.06), GLASS, [s * 0.58, 2.34, 3.17], chassis, { rotation: [-28, 0, 0] });
    P(box(0.04, 0.7, 0.14), HULL, [s * 1.26, 2.3, 3.0]);
    P(box(0.06, 0.38, 0.9), GLASS, [s * 1.27, 2.3, 2.5]); // side window
    P(box(0.1, 0.08, 1.0), DARK, [s * 1.3, 2.52, 2.5]); // brow
    P(box(0.08, 0.5, 0.9), HULL2, [s * 1.46, 1.8, 2.5]); // door
    P(box(0.06, 0.06, 0.2), STEEL, [s * 1.51, 1.85, 2.2]); // handle
    // mirror
    b.rod([s * 1.45, 2.3, 3.05], [s * 1.85, 2.4, 3.15], 0.03, STEEL, { bone: chassis, sides: 6 });
    P(box(0.06, 0.34, 0.2), DARK, [s * 1.88, 2.4, 3.15]);
    // headlights
    P(box(0.5, 0.22, 0.12), DARK, [s * 1.0, 1.55, 3.66]);
    glow(P(box(0.4, 0.14, 0.04), "#fff4c0", [s * 1.0, 1.55, 3.72]), 1.4);
    // fenders
    P(box(0.5, 0.1, 1.5), HULL2, [s * 1.7, 1.45, 2.8]);
  }
  P(box(2.9, 0.5, 0.3), HULL, [0, 1.35, 3.72]); // nose block
  for (let i = 0; i < 5; i++) P(box(2.0, 0.04, 0.05), STEEL, [0, 1.25 + i * 0.09, 3.9 - 0.02], chassis); // grille bars
  P(box(2.6, 0.2, 0.3), TAN, [0, 0.95, 3.85]); // bumper
  decal(HAZARD, 2.6, 0.2, [0, 0.95, 4.01], [0, 0, 1]);
  for (const s of [1, -1]) P(cyl(0.12, 0.2, 6), STEEL, [s * 0.6, 0.85, 3.9], chassis, { rotation: [90, 0, 0] }); // tow eyes
  // roof sensors
  P(cyl(0.3, 0.12, 10), DARK, [0.7, 2.74, 2.2], chassis, { flat: true });
  P(new THREE.SphereGeometry(0.25, 8, 5, 0, 6.3, 0, Math.PI / 2), GLASS, [0.7, 2.78, 2.2], chassis, { flat: true });
  P(box(1.0, 0.1, 0.16), DARK, [-0.5, 2.74, 2.8]);
  for (const x of [-0.8, -0.5, -0.2]) glow(P(cyl(0.05, 0.04, 6), CYAN, [x, 2.82, 2.88]));
  decal(SCREEN, 0.5, 0.31, [0, 2.0, 3.25], [0, 0.3, 1]);

  // ---------------- wheels
  for (const [k, z] of [["F", 2.8], ["M", 0.6], ["R", -1.6]] as const)
    for (const s of [1, -1]) {
      const wx = s * 1.78;
      const spin = b.joint(`wheel${k}${s > 0 ? "L" : "R"}`, { parent: chassis, at: [wx, 0.7, z], dir: [s, 0, 0], role: "hinge" });
      const R90: V = [0, 0, 90];
      P(cyl(0.7, 0.56, 14), TYRE, [wx, 0.7, z], spin, { rotation: R90, flat: true });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        P(box(0.58, 0.1, 0.17), "#15161a", [wx, 0.7 + 0.72 * Math.cos(a), z + 0.72 * Math.sin(a)], spin, {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      P(cyl(0.48, 0.6, 10), STEEL, [wx, 0.7, z], spin, { rotation: R90, flat: true });
      P(cyl(0.36, 0.2, 10), DARK, [wx + s * 0.28, 0.7, z], spin, { rotation: R90, flat: true });
      P(cyl(0.16, 0.26, 8), BRASS, [wx + s * 0.34, 0.7, z], spin, { rotation: R90, flat: true });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        P(cyl(0.04, 0.06, 6), IRON, [wx + s * 0.31, 0.7 + 0.27 * Math.cos(a), z + 0.27 * Math.sin(a)], spin, { rotation: R90 });
      }
      P(cyl(0.025, 0.1, 5), STEEL, [wx + s * 0.4, 0.98, z + 0.1], spin, { rotation: R90 }); // valve
      // mudguard
      P(box(0.7, 0.08, 1.7), HULL2, [wx, 1.55, z]);
      P(box(0.7, 0.3, 0.08), HULL2, [wx, 1.4, z + 0.84], chassis, { rotation: [-25, 0, 0] });
      P(box(0.7, 0.3, 0.08), HULL2, [wx, 1.4, z - 0.84], chassis, { rotation: [25, 0, 0] });
      P(box(0.04, 0.35, 0.4), DARK, [wx + s * 0.34, 0.35, z - 0.9]); // mud flap
    }

  // ---------------- stabiliser legs (deployed)
  const padR = 0.5;
  for (const z of [1.6, -3.0])
    for (const s of [1, -1]) {
      const n = `stab${s > 0 ? "L" : "R"}${z > 0 ? "F" : "R"}`;
      const root: V = [s * 1.75, 1.7, z];
      const foot: V = [s * 2.9, 0.3, z];
      const arm = b.joint(n, { parent: chassis, at: root, aim: foot, role: "leg" });
      P(box(0.7, 0.55, 0.7), HULL, [s * 1.7, 1.75, z]); // mount housing
      P(box(0.5, 0.1, 0.9), DARK, [s * 1.7, 2.05, z]);
      b.rod(root, [s * 2.45, 0.85, z], 0.2, IRON, { bone: arm, sides: 8 }); // outer cylinder
      b.rod([s * 2.2, 1.12, z], [s * 2.6, 0.7, z], 0.24, HULL2, { bone: arm, sides: 8 });
      b.rod([s * 2.45, 0.85, z], foot, 0.11, STEEL, { bone: arm, sides: 8 }); // piston
      // brace strut
      b.rod([s * 1.6, 0.9, z + 0.35], [s * 2.5, 0.8, z + 0.05], 0.06, DARK, { bone: arm, sides: 6 });
      for (let i = 0; i < 3; i++) P(cyl(0.26, 0.05, 8), TAN, [s * (2.0 + i * 0.12), 1.2 - i * 0.2, z], arm, { rotation: [0, 0, s * 52] });
      P(new THREE.SphereGeometry(0.2, 8, 6), STEEL, [s * 2.9, 0.3, z], arm, { flat: true }); // ball joint
      P(cyl(padR, 0.16, 10), IRON, [s * 2.9, 0.08, z], arm, { flat: true }); // pad
      P(cyl(padR * 0.7, 0.18, 10), DARK, [s * 2.9, 0.08, z], arm, { flat: true });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        P(box(0.1, 0.1, 0.1), STEEL, [s * 2.9 + 0.4 * Math.cos(a), 0.15, z + 0.4 * Math.sin(a)], arm); // pad studs
      }
      glow(P(cyl(0.05, 0.03, 6), AMBER, [s * 2.55, 0.9, z + 0.26], arm));
      decal(HAZARD, 0.5, 0.12, [s * 2.63, 0.88, z - 0.0], [0, 0, 1], arm);
    }

  // ---------------- turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.17, -1.4], dir: [0, 1, 0], up: [1, 0, 0], role: "hinge" });
  b.part(new THREE.TorusGeometry(1.35, 0.1, 6, 20), STEEL, { bone: chassis, at: [0, 2.2, -1.4], rotation: [90, 0, 0] });
  P(cyl(1.25, 0.3, 14), HULL2, [0, 2.35, -1.4], yaw, { flat: true });
  P(box(2.4, 0.8, 2.6), HULL, [0, 2.9, -1.6], yaw);
  P(box(2.5, 0.1, 2.7), DARK, [0, 3.35, -1.6], yaw);
  for (const s of [1, -1]) {
    P(box(0.16, 0.9, 1.6), HULL2, [s * 1.22, 3.0, -1.4], yaw, { rotation: [0, 0, s * 6] });
    P(box(0.06, 0.4, 0.8), DARK, [s * 1.33, 3.0, -1.5], yaw);
    decal(WARN, 0.34, 0.34, [s * 1.35, 3.0, -2.5], [s, 0, 0], yaw);
    P(cyl(0.2, 0.5, 8), DARK, [s * 0.9, 3.5, -2.4], yaw, { flat: true }); // smoke dischargers
    for (let i = 0; i < 3; i++) P(cyl(0.05, 0.4, 6), STEEL, [s * (0.7 + i * 0.2), 3.7, -2.8], yaw, { rotation: [-30, 0, 0] });
  }
  P(box(2.0, 0.55, 0.9), HULL, [0, 3.0, -3.1], yaw); // rear bustle
  for (let i = 0; i < 4; i++) P(box(1.6, 0.05, 0.05), DARK, [0, 2.85 + i * 0.12, -3.58], yaw);
  // capacitor banks
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      P(cyl(0.2, 0.9, 10), BLUED, [s * 1.0, 3.55, -2.7 + i * 0.7], yaw, { rotation: [0, 0, 0], flat: true });
      P(cyl(0.12, 0.08, 8), BRASS, [s * 1.0, 4.03, -2.7 + i * 0.7], yaw);
      glow(P(cyl(0.16, 0.04, 10), CYAN, [s * 1.0, 4.0, -2.7 + i * 0.7], yaw));
    }
  // sensor head on turret
  P(cyl(0.2, 0.3, 8), DARK, [0.9, 3.5, -0.6], yaw);
  P(new THREE.SphereGeometry(0.22, 8, 5), GLASS, [0.9, 3.7, -0.6], yaw, { flat: true });

  // ---------------- railgun
  const pitch = b.joint("gunPitch", { parent: yaw, at: [0, 3.0, -0.2], dir: [0, 0, 1], role: "hinge" });
  const Y = 3.0;
  P(box(2.0, 0.9, 0.5), IRON, [0, Y, -0.2], pitch); // trunnion block
  for (const s of [1, -1]) P(cyl(0.22, 0.3, 10), STEEL, [s * 1.1, Y, -0.2], pitch, { rotation: [0, 0, 90], flat: true });
  P(box(1.1, 0.7, 1.4), HULL, [0, Y, -1.0], pitch); // breech
  decal(EMBLEM, 0.5, 0.5, [0, Y + 0.0, -1.71], [0, 0, -1], pitch);
  for (const s of [1, -1]) {
    P(box(0.26, 0.3, 7.2), STEEL, [s * 0.27, Y, 2.9], pitch); // rails
    P(box(0.1, 0.1, 7.0), BLUED, [s * 0.27, Y + 0.2, 2.9], pitch);
    P(box(0.12, 0.3, 7.0), DARK, [s * 0.14, Y, 2.9], pitch);
  }
  glow(P(box(0.14, 0.12, 7.0), CYAN, [0, Y, 2.9], pitch), 1.6); // plasma gap
  P(box(0.7, 0.1, 7.0), DARK, [0, Y - 0.22, 2.9], pitch);
  for (let i = 0; i < 8; i++) {
    const z = 0.2 + i * 0.95;
    P(box(1.05, 0.12, 0.14), TAN, [0, Y + 0.24, z], pitch); // clamp bridges
    for (const s of [1, -1]) {
      P(cyl(0.12, 0.34, 8), BRASS, [s * 0.52, Y + 0.0, z], pitch, { rotation: [0, 0, 90], flat: true });
      glow(P(cyl(0.07, 0.04, 8), CYAN, [s * 0.72, Y, z], pitch, { rotation: [0, 0, 90] }));
    }
    b.part(new THREE.TorusGeometry(0.3, 0.04, 5, 8), BLUED, { bone: pitch, at: [0, Y, z + 0.4], rotation: [0, 0, 0] });
  }
  // coolant tubes along the sides
  for (const s of [1, -1]) {
    b.rod([s * 0.62, Y - 0.35, -0.6], [s * 0.62, Y - 0.35, 5.6], 0.06, STEEL, { bone: pitch, sides: 6 });
    b.rod([s * 0.62, Y + 0.38, -0.4], [s * 0.62, Y + 0.38, 4.4], 0.04, BRASS, { bone: pitch, sides: 5 });
  }
  // muzzle: brake and flash guide
  P(box(1.3, 0.8, 0.7), IRON, [0, Y, 6.5], pitch);
  P(box(0.9, 0.5, 0.74), DARK, [0, Y, 6.5], pitch);
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) P(box(0.04, 0.5, 0.1), STEEL, [s * 0.66, Y, 6.3 + i * 0.22], pitch);
  glow(P(box(0.34, 0.2, 0.06), CYAN, [0, Y, 6.87], pitch), 1.8);
  decal(HAZARD, 1.3, 0.2, [0, Y + 0.41, 6.5], [0, 1, 0], pitch);
  b.pose(pitch, { axis: [1, 0, 0], deg: -9 });

  return b.root;
}
```