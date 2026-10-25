import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { svg } from "../../../../src/index";
import { mottle } from "../../../../src/index";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier with a raised rail cannon, braced on four hydraulic stabiliser legs.",
};

const OLIVE = "#56674a";
const DARK = "#2b2f33";
const STEEL = "#7b838b";
const TYRE = "#1e1f22";
const GLASS = "#66b8d6";
const AMBER = "#ffb02e";
const CYAN = "#5ff3ff";
const YEL = "#e8c21a";
const HULL = panelled(mottle("#56674a", "#4a5a40", { size: 0.8, seed: 3 }), { size: 0.9, aspect: 0.6, rivets: 0.14 });
const ARMOUR = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.7, rivets: 0.12 });
const GUNMETAL = metal("blued", { polish: 0.3 });

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8c21a"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#17171a"/>`)
    .join("")}<rect width="64" height="16" fill="none" stroke="#17171a" stroke-width="1.5"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 60"><rect x="2" y="2" width="96" height="56" rx="6" fill="#1b2218" stroke="#e8e2c0" stroke-width="3"/>
  <circle cx="30" cy="30" r="17" fill="none" stroke="#5ff3ff" stroke-width="4"/><path d="M30 10 V50 M10 30 H50" stroke="#5ff3ff" stroke-width="3"/>
  <path d="M52 22 H92 M52 30 H92 M52 38 H80" stroke="#e8e2c0" stroke-width="4"/><path d="M84 36 L96 38 L84 44Z" fill="#ffb02e"/></svg>`,
  { size: 256 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 80 40"><text x="40" y="32" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="bold" font-size="32" fill="#e8e2c0" stroke="#111" stroke-width="1.5">RG-6</text></svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#06222a"/><path d="M0 28 L10 24 L18 30 L28 14 L38 22 L48 10 L64 18" fill="none" stroke="#5ff3ff" stroke-width="2"/>
  <circle cx="48" cy="10" r="3" fill="#ff5a3a"/><path d="M4 6 H24 M4 11 H18" stroke="#5ff3ff" stroke-width="2"/></svg>`,
  { size: 128 },
);
const WARN = svg(
  `<svg viewBox="0 0 40 40"><path d="M20 3 L38 35 H2Z" fill="#e8c21a" stroke="#111" stroke-width="3" stroke-linejoin="round"/><path d="M22 10 L14 24 H20 L18 32 L28 18 H22Z" fill="#111"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const B = chassis;

  const bx = (bone: any, w: number, h: number, d: number, x: number, y: number, z: number, col: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at: [x, y, z], ...o });
  const cy = (bone: any, r: number, h: number, seg: number, x: number, y: number, z: number, col: any, rot: number[] = [0, 0, 0], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { bone, at: [x, y, z], rotation: rot, flat: true, ...o });
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], bone: any = B) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const AX: number[] = [0, 0, 90];
  const AZ: number[] = [90, 0, 0];

  // ---- frame & hull
  for (const s of [1, -1]) {
    bx(B, 0.22, 0.42, 8.6, s * 0.8, 0.85, 0, DARK);
    bx(B, 0.06, 0.5, 5.4, s * 1.42, 1.5, -1.5, HULL); // side skin
  }
  for (const z of [-4, -2.4, -0.8, 0.8, 2.4, 3.8]) bx(B, 1.9, 0.14, 0.2, 0, 0.8, z, DARK);
  bx(B, 2.8, 0.9, 5.8, 0, 1.45, -1.4, HULL); // main hull
  bx(B, 2.5, 0.12, 5.6, 0, 1.96, -1.4, ARMOUR); // deck plate
  bx(B, 2.9, 0.2, 0.3, 0, 1.2, -4.45, DARK); // rear beam
  bx(B, 2.0, 0.5, 0.2, 0, 1.55, -4.35, ARMOUR);
  cy(B, 0.17, 0.5, 8, 0.7, 0.78, 0.2, STEEL, AZ); // fuel / air tank
  cy(B, 0.17, 0.5, 8, -0.7, 0.78, 0.2, STEEL, AZ);
  for (const s of [1, -1]) {
    // side lockers, ladder, tow
    bx(B, 0.18, 0.5, 1.2, s * 1.5, 1.3, -2.8, ARMOUR);
    bx(B, 0.04, 0.36, 0.5, s * 1.6, 1.3, -2.8, DARK);
    cy(B, 0.03, 0.12, 6, s * 1.62, 1.3, -2.6, STEEL, AX);
    for (let i = 0; i < 4; i++) bx(B, 0.06, 0.04, 0.5, s * 1.46, 0.75 + i * 0.28, 0.35, STEEL, {});
    for (const dz of [0.12, 0.58]) bx(B, 0.05, 1.0, 0.04, s * 1.46, 1.2, dz, STEEL);
    decal(EMBLEM, 1.2, 0.72, [s * 1.43, 1.55, -0.9], [s, 0, 0]);
    decal(STENCIL, 1.0, 0.5, [s * 1.43, 1.55, -2.1], [s, 0, 0]);
    decal(WARN, 0.3, 0.3, [s * 1.43, 1.2, -3.7], [s, 0, 0]);
    // vents on rear deck
    for (let i = 0; i < 4; i++) bx(B, 0.5, 0.03, 0.05, s * 0.9, 2.05, -3.3 + i * 0.1, DARK, { rotation: [25, 0, 0] });
    bx(B, 0.6, 0.03, 0.5, s * 0.9, 2.03, -3.15, DARK);
    // mudguards
  }

  // ---- cab
  bx(B, 2.6, 1.1, 2.7, 0, 1.55, 2.85, HULL);
  bx(B, 2.7, 0.15, 2.8, 0, 1.05, 2.85, DARK);
  bx(B, 2.35, 0.7, 1.9, 0, 2.45, 2.55, ARMOUR);
  bx(B, 2.2, 0.1, 1.9, 0, 2.85, 2.55, HULL);
  bx(B, 2.2, 0.12, 0.2, 0, 2.15, 3.6, ARMOUR, { rotation: [-35, 0, 0] });
  b.part(new THREE.BoxGeometry(1.9, 0.04, 0.55), GLASS, { bone: B, at: [0, 2.42, 3.55], rotation: [-55, 0, 0] });
  for (const s of [1, -1]) {
    bx(B, 0.05, 0.4, 1.3, s * 1.2, 2.5, 2.5, GLASS);
    bx(B, 0.05, 0.1, 1.5, s * 1.2, 2.76, 2.5, DARK);
    bx(B, 0.06, 0.8, 0.9, s * 1.32, 1.65, 2.9, DARK, { });
    cy(B, 0.04, 0.16, 6, s * 1.34, 1.7, 2.6, STEEL, AX);
    bx(B, 0.06, 0.3, 0.5, s * 1.33, 2.0, 3.3, ARMOUR);
    // mirror
    b.rod([s * 1.3, 2.3, 3.5], [s * 1.75, 2.45, 3.6], 0.025, STEEL, { bone: B, sides: 6 });
    bx(B, 0.06, 0.34, 0.2, s * 1.78, 2.45, 3.6, DARK);
    glow(bx(B, 0.3, 0.2, 0.1, s * 0.95, 1.2, 4.22, AMBER));
    glow(bx(B, 0.1, 0.12, 0.06, s * 1.2, 1.2, 4.22, "#ffffff"));
  }
  bx(B, 2.8, 0.3, 0.3, 0, 0.95, 4.35, DARK); // bumper
  for (const s of [1, -1]) cy(B, 0.06, 0.1, 6, s * 0.6, 0.95, 4.54, STEEL, AZ);
  for (let i = 0; i < 5; i++) bx(B, 1.4, 0.05, 0.05, 0, 1.4 + i * 0.1, 4.22, DARK); // grille
  glow(b.part(new THREE.PlaneGeometry(0.7, 0.4), "#ffffff", { bone: B, at: [0, 2.55, 3.48], dir: [0, 0.5, 1], axis: "z", texture: SCREEN }));
  bx(B, 1.4, 0.1, 0.1, 0, 2.95, 3.3, DARK); // light bar
  for (const x of [-0.5, -0.17, 0.17, 0.5]) glow(bx(B, 0.22, 0.08, 0.04, x, 2.95, 3.37, AMBER));
  // radar & antenna
  cy(B, 0.06, 0.3, 6, -0.8, 3.0, 2.0, STEEL);
  b.lathe([[0, 0], [0.32, 0.12], [0.32, 0.14], [0, 0.04]], { at: [-0.8, 3.2, 2.0], axis: [0, 0.8, 0.6], segments: 10, bone: B, color: STEEL });
  b.spike([0.85, 2.9, 1.8], [0, 1, 0], 1.6, 0.02, STEEL, { bone: B, sides: 5 });
  b.part(new THREE.SphereGeometry(0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: B, at: [0.4, 2.9, 1.8], flat: true });

  // ---- wheels (3 axles)
  const axles = [3.1, 0.4, -2.3];
  axles.forEach((z, i) => {
    bx(B, 2.6, 0.14, 0.14, 0, 0.55, z, DARK);
    cy(B, 0.2, 0.5, 8, 0, 0.55, z, STEEL, AX); // diff housing
    for (const s of [1, -1]) {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${i}`, { parent: chassis, at: [s * 1.45, 0.55, z], dir: [1, 0, 0], role: "hinge" });
      cy(w, 0.55, 0.52, 14, s * 1.45, 0.55, z, TYRE, AX);
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        bx(w, 0.54, 0.1, 0.16, s * 1.45, 0.55 + 0.56 * Math.cos(a), z + 0.56 * Math.sin(a), TYRE, { rotation: [(-a * 180) / Math.PI, 0, 0] });
      }
      cy(w, 0.34, 0.54, 10, s * 1.45, 0.55, z, GUNMETAL, AX);
      cy(w, 0.24, 0.1, 10, s * 1.72, 0.55, z, DARK, AX);
      cy(w, 0.1, 0.14, 8, s * 1.76, 0.55, z, STEEL, AX);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        cy(w, 0.025, 0.05, 6, s * 1.77, 0.55 + 0.19 * Math.cos(a), z + 0.19 * Math.sin(a), YEL, AX);
      }
    }
    for (const s of [1, -1]) {
      bx(B, 0.7, 0.1, 1.5, s * 1.5, 1.28, z, ARMOUR); // fender
      bx(B, 0.06, 0.34, 1.5, s * 1.84, 1.1, z, ARMOUR);
      bx(B, 0.05, 0.4, 0.6, s * 1.7, 0.45, z - 0.8, TYRE); // mud flap
    }
  });

  // ---- turret & railgun
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.02, -1.8], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("railPitch", { parent: yaw, at: [0, 3.0, -1.8], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(1.1, 0.07, 6, 18), STEEL, { bone: B, at: [0, 2.1, -1.8], rotation: [90, 0, 0] });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    cy(B, 0.04, 0.05, 6, 1.1 * Math.cos(a), 2.18, -1.8 + 1.1 * Math.sin(a), YEL);
  }
  cy(yaw, 1.0, 0.45, 12, 0, 2.3, -1.8, ARMOUR);
  bx(yaw, 1.7, 0.4, 1.7, 0, 2.7, -1.8, HULL);
  for (const s of [1, -1]) {
    bx(yaw, 0.2, 1.1, 1.5, s * 0.8, 3.0, -1.8, ARMOUR);
    cy(yaw, 0.16, 0.35, 10, s * 0.95, 3.0, -1.8, STEEL, AX);
    bx(yaw, 0.5, 0.5, 0.7, s * 1.15, 2.85, -2.3, DARK); // ammo / capacitor box
    glow(bx(yaw, 0.04, 0.1, 0.4, s * 1.41, 2.9, -2.3, CYAN));
    decal(WARN, 0.25, 0.25, [s * 0.92, 3.3, -1.8], [s, 0, 0], yaw);
  }
  // rail assembly on the pitch bone
  bx(pitch, 1.3, 0.8, 1.6, 0, 3.0, -2.0, GUNMETAL); // breech
  bx(pitch, 1.0, 0.5, 0.2, 0, 3.0, -2.9, DARK);
  for (const s of [1, -1]) {
    bx(pitch, 0.22, 0.36, 7.4, s * 0.3, 3.0, 1.7, GUNMETAL); // rails
    bx(pitch, 0.1, 0.3, 7.0, s * 0.43, 3.0, 1.7, STEEL);
    for (let k = 0; k < 4; k++) cy(pitch, 0.22, 0.7, 8, s * 0.85, 3.0, -1.4 + k * 0.5, DARK, AZ); // capacitor drums
    for (let k = 0; k < 4; k++) cy(pitch, 0.23, 0.06, 8, s * 0.85, 3.0, -1.4 + k * 0.5 + 0.3, YEL, AZ);
    for (let k = 0; k < 6; k++) bx(pitch, 0.1, 0.6, 0.14, s * 0.27, 3.0, 0.2 + k * 1.0, STEEL); // clamps
  }
  glow(bx(pitch, 0.34, 0.12, 7.2, 0, 3.0, 1.7, CYAN));
  for (let k = 0; k < 6; k++) glow(b.part(new THREE.TorusGeometry(0.33, 0.025, 4, 12), CYAN, { bone: pitch, at: [0, 3.0, 0.2 + k * 1.0] }));
  bx(pitch, 1.1, 0.3, 0.3, 0, 3.0, 5.5, DARK); // muzzle block
  for (const s of [1, -1]) {
    bx(pitch, 0.06, 0.5, 0.6, s * 0.55, 3.0, 5.6, STEEL, { rotation: [0, s * 15, 0] });
    b.rod([s * 0.6, 3.25, -1.5], [s * 0.6, 3.25, 4.6], 0.03, DARK, { bone: pitch, sides: 5 }); // cable
  }
  cy(pitch, 0.12, 0.5, 8, 0, 3.55, -2.0, STEEL);
  // elevator hydraulic
  b.rod([0, 2.3, -2.6], [0, 3.0, -1.2], 0.07, STEEL, { bone: yaw, sides: 7 });
  b.pose(pitch, { axis: [1, 0, 0], deg: -24 });

  // ---- stabiliser legs
  for (const s of [1, -1])
    for (const [n, z] of [["F", 1.0], ["R", -3.5]] as const) {
      const sx = s > 0 ? "L" : "R";
      const arm = b.joint(`stab${sx}${n}`, { parent: chassis, at: [s * 1.3, 1.2, z], dir: [s, 0, 0], role: "hinge" });
      const ext = b.joint(`stabExt${sx}${n}`, { parent: arm, at: [s * 2.6, 1.2, z], dir: [0, -1, 0], role: "hinge" });
      bx(arm, 1.4, 0.3, 0.36, s * 1.95, 1.2, z, ARMOUR);
      const zo = z > 0 ? 1 : -1;
      b.part(new THREE.PlaneGeometry(1.3, 0.2), "#ffffff", { bone: arm, at: [s * 1.95, 1.2, z + zo * 0.185], dir: [0, 0, zo], axis: "z", texture: HAZARD });
      cy(arm, 0.24, 1.0, 10, s * 2.6, 0.8, z, STEEL); // sleeve
      cy(arm, 0.3, 0.1, 10, s * 2.6, 1.3, z, DARK);
      cy(ext, 0.14, 0.9, 8, s * 2.6, 0.5, z, metal("steel"));
      cy(ext, 0.19, 0.12, 8, s * 2.6, 0.78, z, YEL);
      b.part(new THREE.CylinderGeometry(0.55, 0.65, 0.16, 10), DARK, { bone: ext, at: [s * 2.6, 0.08, z], flat: true });
      b.part(new THREE.SphereGeometry(0.2, 8, 5), STEEL, { bone: ext, at: [s * 2.6, 0.2, z], flat: true });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cy(ext, 0.035, 0.05, 6, s * 2.6 + 0.5 * Math.cos(a), 0.18, z + 0.5 * Math.sin(a), STEEL);
      }
      b.rod([s * 1.4, 1.0, z], [s * 2.5, 0.45, z], 0.07, DARK, { bone: arm, sides: 6 }); // diagonal brace
      glow(bx(arm, 0.12, 0.08, 0.08, s * 2.6, 1.42, z, AMBER)); // beacon
    }

  // ---- misc hull detail: exhausts, cables, rear lights
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 2.2, -4.0], [s * 1.0, 3.3, -4.0], 0.1, STEEL, { bone: B, sides: 8 });
    cy(B, 0.14, 0.08, 8, s * 1.0, 3.34, -4.0, DARK);
    glow(bx(B, 0.3, 0.14, 0.05, s * 0.9, 1.4, -4.48, "#ff3a2a"));
  }
  const r = rng(5);
  for (let i = 0; i < 8; i++) bx(B, 0.15 + r() * 0.2, 0.08, 0.15 + r() * 0.2, (r() - 0.5) * 0.8, 2.05, -0.1 + r() * 0.4, i % 2 ? DARK : STEEL);

  return b.root;
}
