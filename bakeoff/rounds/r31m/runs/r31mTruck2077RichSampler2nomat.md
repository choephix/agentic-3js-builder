```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, catmull, mottle } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Wraith-7 Militarized Truck",
  description:
    "A 2077 armoured cyberpunk war pickup: panelled hull, ram bumper, twin-barrel bed turret, rocket pods, rear thrusters, neon underglow and sensor mast.",
};

// ---- palette
const NEON_M = "#ff2bd6";
const NEON_C = "#19f3ff";
const NEON_Y = "#ffe14a";
const RED = "#ff2a2a";
const DARK = "#14161c";
const STEEL = "#5b6270";
const GUN = "#2b2f38";
const GLASS = "#0b2230";
const TYRE = "#101216";
const WARN = "#e8b923";

// ---- paints
const HULL_BASE = paint((p, n) => {
  const camo = mix("#232832", "#323b4a", smoothstep(0.35, 0.65, noise(p, 0.45, 3)));
  const camo2 = mix(camo, "#1a1d25", smoothstep(0.6, 0.75, noise(p, 0.25, 8)) * 0.8);
  const mud = smoothstep(1.05, 0.5, p.y) * (0.4 + 0.6 * noise(p, 0.12, 5));
  const top = n.y > 0.6 ? 0.15 : 0;
  const c = mix(camo2, "#4a3c2c", mud * 0.7);
  return mix(c, "#5a6678", top);
});
const HULL = panelled(HULL_BASE, { size: 0.28, aspect: 0.6, rivets: 0.06, seam: "#07080b" });
const PLATE = panelled(metal("iron", { tarnish: 0.5, size: 0.1 }), { size: 0.18, rivets: 0.05 });
const GUNMETAL = metal("blued", { tarnish: 0.4 });
const BRASSY = metal("bronze", { tarnish: 0.6 });

// ---- textures
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#0a0c10" stroke="#19f3ff" stroke-width="5"/>
  <path d="M50 20 L72 50 L50 80 L28 50Z" fill="none" stroke="#ff2bd6" stroke-width="5"/>
  <path d="M30 30 L70 70 M70 30 L30 70" stroke="#19f3ff" stroke-width="4"/>
  <circle cx="50" cy="50" r="9" fill="#ff2bd6"/></svg>`,
  { size: 192 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 120 24"><rect width="120" height="24" fill="#e8b923"/>
  ${Array.from({ length: 10 }, (_, i) => `<polygon points="${i * 14 - 6},24 ${i * 14 + 2},24 ${i * 14 + 14},0 ${i * 14 + 6},0" fill="#101216"/>`).join("")}
  <rect width="120" height="24" fill="none" stroke="#101216" stroke-width="3"/></svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 120 70"><rect width="120" height="70" fill="#03121a"/>
  <path d="M5 50 L25 38 L45 44 L65 20 L85 30 L115 10" stroke="#19f3ff" stroke-width="2.5" fill="none"/>
  <rect x="6" y="6" width="40" height="8" fill="#ff2bd6"/><rect x="6" y="56" width="70" height="6" fill="#19f3ff"/>
  <circle cx="96" cy="50" r="12" fill="none" stroke="#ffe14a" stroke-width="3"/><circle cx="96" cy="50" r="3" fill="#ff2a2a"/>
  <text x="52" y="13" font-family="monospace" font-size="9" font-weight="bold" fill="#19f3ff">TGT LOCK</text></svg>`,
  { size: 256 },
);
const PLATE_TEX = svg(
  `<svg viewBox="0 0 120 60"><rect width="120" height="60" rx="6" fill="#f2f2e8" stroke="#101216" stroke-width="4"/>
  <rect x="4" y="4" width="112" height="12" fill="#ff2bd6"/>
  <text x="60" y="49" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="32" fill="#101216">2077</text></svg>`,
  { size: 192 },
);
const TAG = svg(
  `<svg viewBox="0 0 200 50"><text x="100" y="36" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#19f3ff" stroke="#03121a" stroke-width="1.5">WRAITH//07</text></svg>`,
  { size: 384 },
);
const SLITS = svg(
  `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#07080b"/>${Array.from({ length: 6 }, (_, i) => `<rect x="6" y="${4 + i * 6}" width="88" height="3" fill="#3a404c"/>`).join("")}<rect x="6" y="36" width="88" height="2" fill="#ff2bd6"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "wraith7" });
  const r = rng(77);
  const chassis = b.joint("chassis", { at: [0, 0.8, 0], role: "spine" });

  const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cy = (rad: number, h: number, s = 8) => new THREE.CylinderGeometry(rad, rad, h, s);
  const P = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: chassis, at: at as any, ...o });
  const L = (g: THREE.BufferGeometry, col: string, at: number[], o: any = {}) => glow(P(g, col, at, o));
  const rod = (a: number[], c: number[], rad: number, col: any, o: any = {}) =>
    b.rod(a as any, c as any, rad, col, { bone: chassis, sides: 6, ...o });

  // ---- frame & underbody
  for (const s of [1, -1]) P(bx(0.12, 0.2, 5.3), DARK, [s * 0.55, 0.78, 0]);
  for (const z of [-2.4, -1.2, 0, 1.2, 2.4]) P(bx(1.2, 0.12, 0.1), DARK, [0, 0.78, z]);
  rod([0, 0.7, 1.7], [0, 0.7, -1.7], 0.05, STEEL);
  L(bx(1.7, 0.03, 4.8), NEON_M, [0, 0.6, 0]); // underglow
  L(bx(1.2, 0.03, 3.8), NEON_C, [0, 0.58, 0]);

  // ---- hull
  P(bx(1.9, 0.55, 5.4), HULL, [0, 1.05, 0]); // lower hull
  P(bx(1.96, 0.1, 5.46), PLATE, [0, 0.78, 0]); // belly pan
  for (const s of [1, -1]) {
    P(bx(0.16, 0.5, 2.2), PLATE, [s * 1.0, 0.92, 0]); // side armour
    for (let i = 0; i < 5; i++) P(bx(0.04, 0.4, 0.34), HULL, [s * 1.09, 0.92, -0.85 + i * 0.425]); // skirt plates
    for (let i = 0; i < 5; i++) P(cy(0.025, 0.03, 6), STEEL, [s * 1.12, 1.05, -0.85 + i * 0.425], { rotation: [0, 0, 90] });
    L(bx(0.03, 0.04, 2.0), s > 0 ? NEON_M : NEON_C, [s * 1.12, 0.74, 0]); // rocker neon
    // fender flares
    for (const z of [-1.7, 1.7]) {
      P(bx(0.55, 0.12, 1.3), HULL, [s * 1.08, 1.1, z]);
      P(bx(0.5, 0.05, 1.35), PLATE, [s * 1.1, 1.18, z]);
    }
    // hazard stripes on skirts
    b.part(new THREE.PlaneGeometry(1.2, 0.2), "#ffffff", {
      bone: chassis, at: [s * 1.115, 0.88, 0], dir: [s, 0, 0], axis: "z", texture: HAZARD,
    });
    // emblem on the flank
    glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: chassis, at: [s * 1.12, 1.25, 0.25], dir: [s, 0, 0], axis: "z", texture: EMBLEM,
    }), 0.8);
  }

  // ---- hood and nose
  b.frustumBox([0, 1.5, 0.8], [0, 1.35, 2.65], [1.9, 0.6], [1.76, 0.4], { bone: chassis, color: HULL });
  P(bx(1.2, 0.05, 1.3), PLATE, [0, 1.76, 1.6], { rotation: [-5, 0, 0] });
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) P(bx(0.22, 0.03, 0.04), DARK, [s * 0.42, 1.8, 1.2 + i * 0.12]); // hood vents
    b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
      bone: chassis, at: [s * 0.45, 1.79, 1.55], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: SLITS,
    });
  }
  // grille & headlights
  b.part(new THREE.PlaneGeometry(0.9, 0.36), "#ffffff", { bone: chassis, at: [0, 1.28, 2.87], dir: [0, 0, 1], axis: "z", texture: SLITS });
  for (const s of [1, -1]) {
    P(bx(0.5, 0.14, 0.1), DARK, [s * 0.65, 1.42, 2.66]);
    L(bx(0.44, 0.06, 0.04), "#f4fbff", [s * 0.65, 1.42, 2.72]);
    L(bx(0.36, 0.025, 0.04), NEON_C, [s * 0.65, 1.33, 2.72]);
    P(bx(0.54, 0.03, 0.16), PLATE, [s * 0.65, 1.52, 2.64]);
  }

  // ---- ram bumper
  P(bx(2.2, 0.36, 0.2), PLATE, [0, 0.95, 2.82]);
  for (const s of [1, -1]) {
    P(bx(0.9, 0.34, 0.1), HULL, [s * 0.65, 0.95, 2.93], { rotation: [0, s * -18, 0] });
    P(bx(0.14, 0.4, 0.4), DARK, [s * 1.1, 0.95, 2.7]);
    L(bx(0.1, 0.06, 0.04), NEON_Y, [s * 1.1, 1.1, 2.92]);
  }
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.84, 2.95], [0, 0, 1], 0.28, 0.05, STEEL, { bone: chassis, sides: 5 });
  P(cy(0.12, 0.34, 8), GUNMETAL, [0, 0.9, 2.95], { rotation: [0, 0, 90] }); // winch drum
  rod([0, 0.9, 2.98], [0, 0.7, 3.1], 0.015, DARK);
  P(new THREE.TorusGeometry(0.06, 0.018, 5, 8), STEEL, [0, 0.64, 3.1]);

  // ---- cab
  P(bx(1.9, 0.85, 1.7), HULL, [0, 1.7, 0.0]);
  P(bx(1.7, 0.1, 1.5), PLATE, [0, 2.17, -0.05]); // roof plate
  b.part(bx(1.6, 0.52, 0.05), GLASS, { bone: chassis, at: [0, 1.88, 0.98], rotation: [-30, 0, 0] });
  L(bx(1.55, 0.03, 0.03), NEON_C, [0, 2.12, 0.85]);
  P(bx(1.62, 0.22, 0.05), DARK, [0, 1.72, -0.88]); // rear window
  for (const s of [1, -1]) {
    P(bx(0.06, 0.34, 1.0), GLASS, [s * 0.96, 1.85, 0.1]);
    L(bx(0.02, 0.02, 1.0), s > 0 ? NEON_M : NEON_C, [s * 0.985, 1.65, 0.1]);
    P(bx(0.08, 0.04, 1.1), PLATE, [s * 0.96, 2.04, 0.1]);
    P(bx(0.12, 0.34, 0.12), PLATE, [s * 0.94, 1.85, 0.7]); // A pillar guard
    rod([s * 0.97, 1.5, -0.5], [s * 0.97, 1.5, -0.3], 0.03, STEEL); // door handle
    // door joint
    const door = b.joint(`door${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 0.97, 1.5, 0.7], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
    P(bx(0.05, 0.5, 1.3), PLATE, [s * 0.98, 1.38, 0.05], { bone: door });
    b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", { bone: door, at: [s * 1.008, 1.45, 0.05], dir: [s, 0, 0], axis: "z", texture: TAG });
    // mirrors w/ camera
    rod([s * 0.98, 1.8, 0.78], [s * 1.2, 1.9, 0.85], 0.02, STEEL);
    P(bx(0.12, 0.2, 0.08), DARK, [s * 1.24, 1.9, 0.85]);
    L(cy(0.025, 0.03, 8), RED, [s * 1.24, 1.9, 0.91], { rotation: [90, 0, 0] });
    // rocket pods on cab shoulders
    P(bx(0.3, 0.42, 0.9), GUN, [s * 1.12, 1.78, -0.1]);
    for (const dx of [-0.07, 0.07]) for (const dy of [-0.1, 0.1]) {
      P(cy(0.055, 0.05, 8), DARK, [s * 1.12 + dx, 1.78 + dy, 0.37], { rotation: [90, 0, 0] });
      b.spike([s * 1.12 + dx, 1.78 + dy, 0.35], [0, 0, 1], 0.12, 0.045, RED, { bone: chassis, sides: 6 });
    }
    P(bx(0.2, 0.06, 0.5), WARN, [s * 1.12, 2.02, -0.1]);
  }
  // roof gear
  P(bx(1.3, 0.1, 0.2), DARK, [0, 2.3, 0.65]);
  for (const x of [-0.5, -0.17, 0.17, 0.5]) {
    P(cy(0.07, 0.1, 8), GUN, [x, 2.32, 0.78], { rotation: [90, 0, 0] });
    L(cy(0.055, 0.02, 8), x < 0 ? NEON_M : NEON_C, [x, 2.32, 0.84], { rotation: [90, 0, 0] });
  }
  P(cy(0.04, 0.5, 6), STEEL, [-0.7, 2.45, -0.5]);
  b.spike([-0.7, 2.7, -0.5], [0, 1, 0], 1.2, 0.015, STEEL, { bone: chassis, sides: 5 });
  L(new THREE.SphereGeometry(0.04, 6, 4), RED, [-0.7, 3.9, -0.5]);
  // sensor dome + dish
  P(cy(0.2, 0.06, 10), PLATE, [0.55, 2.25, -0.4]);
  P(new THREE.SphereGeometry(0.18, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, [0.55, 2.28, -0.4], { flat: true });
  L(cy(0.04, 0.02, 8), NEON_C, [0.55, 2.4, -0.4]);
  P(cy(0.03, 0.3, 6), STEEL, [-0.2, 2.35, -0.3]);
  b.part(new THREE.CylinderGeometry(0.3, 0.05, 0.1, 12), GUN, { bone: chassis, at: [-0.2, 2.55, -0.3], rotation: [60, 0, 0], flat: true });
  L(new THREE.SphereGeometry(0.03, 6, 4), NEON_Y, [-0.2, 2.62, -0.1]);
  // dash screen glimpse through windscreen
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.3), "#ffffff", { bone: chassis, at: [0.35, 1.7, 0.9], dir: [0, 0.3, 1], axis: "z", texture: HUD }), 0.9);

  // ---- bed
  P(bx(1.9, 0.12, 2.1), PLATE, [0, 1.3, -1.7]);
  for (const s of [1, -1]) {
    P(bx(0.1, 0.5, 2.1), HULL, [s * 0.95, 1.55, -1.7]);
    P(bx(0.16, 0.05, 2.1), PLATE, [s * 0.95, 1.82, -1.7]);
    for (let i = 0; i < 4; i++) P(bx(0.05, 0.35, 0.1), DARK, [s * 1.02, 1.55, -2.5 + i * 0.55]);
    L(bx(0.03, 0.03, 2.0), s > 0 ? NEON_C : NEON_M, [s * 1.01, 1.74, -1.7]);
    // ammo boxes
    P(bx(0.4, 0.3, 0.55), GUN, [s * 0.65, 1.52, -2.3]);
    P(bx(0.42, 0.04, 0.2), WARN, [s * 0.65, 1.69, -2.3]);
  }
  P(bx(1.9, 0.7, 0.1), PLATE, [0, 1.65, -0.72]); // headboard
  const gate = b.joint("tailgate", { parent: chassis, at: [0, 1.32, -2.75], dir: [0, 1, 0], role: "hinge" });
  P(bx(1.8, 0.5, 0.08), HULL, [0, 1.6, -2.75], { bone: gate });
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", { bone: gate, at: [0, 1.5, -2.795], dir: [0, 0, -1], axis: "z", texture: PLATE_TEX });
  for (const s of [1, -1]) {
    L(bx(0.3, 0.1, 0.04), RED, [s * 0.7, 1.7, -2.8], { bone: gate });
    L(bx(0.3, 0.025, 0.04), NEON_M, [s * 0.7, 1.58, -2.8], { bone: gate });
  }

  // ---- turret in bed
  P(cy(0.42, 0.35, 10), PLATE, [0, 1.5, -1.65], { flat: true });
  P(new THREE.TorusGeometry(0.42, 0.03, 5, 14), STEEL, [0, 1.7, -1.65], { rotation: [90, 0, 0] });
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 1.7, -1.65], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 2.1, -1.65], dir: [0, 0, 1], role: "hinge" });
  P(cy(0.34, 0.2, 10), GUNMETAL, [0, 1.8, -1.65], { bone: yaw, flat: true });
  for (const s of [1, -1]) {
    P(bx(0.08, 0.5, 0.5), HULL, [s * 0.3, 2.0, -1.65], { bone: yaw });
    P(bx(0.26, 0.3, 0.4), GUN, [s * 0.55, 1.95, -1.7], { bone: yaw });
    L(bx(0.2, 0.03, 0.03), NEON_Y, [s * 0.55, 2.06, -1.49], { bone: yaw });
  }
  rod([-0.35, 2.1, -1.65], [0.35, 2.1, -1.65], 0.04, STEEL, { bone: pitch });
  P(bx(0.36, 0.3, 0.55), GUNMETAL, [0, 2.1, -1.7], { bone: pitch });
  for (const s of [1, -1]) {
    rod([s * 0.1, 2.1, -1.5], [s * 0.1, 2.1, -0.35], 0.045, GUN, { bone: pitch, sides: 8 });
    P(cy(0.07, 0.3, 8), GUNMETAL, [s * 0.1, 2.1, -0.75], { bone: pitch, rotation: [90, 0, 0], flat: true });
    P(cy(0.075, 0.12, 8), DARK, [s * 0.1, 2.1, -0.3], { bone: pitch, rotation: [90, 0, 0] });
    L(cy(0.03, 0.02, 6), NEON_M, [s * 0.1, 2.1, -0.235], { bone: pitch, rotation: [90, 0, 0] });
    for (let i = 0; i < 3; i++) P(new THREE.TorusGeometry(0.05, 0.012, 4, 8), STEEL, [s * 0.1, 2.1, -1.2 + i * 0.2], { bone: pitch });
  }
  P(bx(0.16, 0.14, 0.2), DARK, [0.3, 2.3, -1.9], { bone: pitch }); // sensor
  L(cy(0.04, 0.02, 8), RED, [0.3, 2.3, -1.79], { bone: pitch, rotation: [90, 0, 0] });

  // ---- rear thrusters & exhaust
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.2, 0], [0.16, 0.12], [0.3, 0.55], [0.26, 0.55], [0.12, 0.14], [0, 0.16]], {
      at: [s * 0.62, 1.0, -2.78], axis: [0, 0, -1], segments: 10, bone: chassis, color: GUNMETAL,
    });
    L(cy(0.11, 0.03, 10), NEON_C, [s * 0.62, 1.0, -2.93], { rotation: [90, 0, 0] });
    P(new THREE.TorusGeometry(0.2, 0.02, 5, 10), NEON_M, [s * 0.62, 1.0, -3.2]);
    glow(P(new THREE.TorusGeometry(0.28, 0.015, 5, 10), NEON_M, [s * 0.62, 1.0, -3.3]), 1.2);
    // vertical exhaust stacks behind cab
    P(cy(0.06, 1.0, 8), STEEL, [s * 0.88, 2.0, -0.85]);
    P(cy(0.085, 0.4, 8), BRASSY, [s * 0.88, 1.7, -0.85]);
    P(cy(0.075, 0.04, 8), DARK, [s * 0.88, 2.52, -0.85]);
  }
  P(bx(1.2, 0.16, 0.2), PLATE, [0, 0.9, -2.85]);

  // ---- cables
  for (const s of [1, -1])
    b.sweep(catmull([[s * 0.3, 1.35, -0.8], [s * 0.45, 1.5, -1.05], [s * 0.2, 1.8, -1.55]]), 0.018, { color: DARK, bone: chassis });
  b.sweep(catmull([[0.2, 2.35, -0.4], [0.5, 2.2, -0.9], [0.9, 1.9, -1.1]]), 0.015, { color: NEON_Y, bone: chassis });

  // ---- wheels
  const hubs: [string, number, number][] = [["FL", 1, 1.7], ["FR", -1, 1.7], ["RL", 1, -1.7], ["RR", -1, -1.7]];
  const TREAD = paint((p, n) => {
    const a = Math.atan2(p.y - 0.5, p.z) * 9;
    return Math.abs(n.x) < 0.5 && Math.sin(a * 2.3) > 0.2 ? "#07080a" : "#1a1c22";
  });
  for (const [k, s, z] of hubs) {
    const hub: [number, number, number] = [s * 1.05, 0.5, z];
    const front = z > 0;
    const steer = front ? b.joint(`steer${k}`, { parent: chassis, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : chassis;
    const spin = b.joint(`wheel${k}`, { parent: steer, at: hub, dir: [0, 1, 0], role: "hinge" });
    const at = (dx: number, rr = 0, a = 0) => [hub[0] + s * dx, hub[1] + rr * Math.cos(a), hub[2] + rr * Math.sin(a)];
    const R = { bone: spin, rotation: [0, 0, 90] as number[], flat: true };
    P(cy(0.49, 0.4, 14), TREAD, hub, R);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      P(bx(0.42, 0.1, 0.14), TYRE, at(0, 0.5, a), { bone: spin, rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    P(cy(0.3, 0.1, 12), PLATE, at(0.2), R);
    P(cy(0.1, 0.16, 8), STEEL, at(0.24), R);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      P(cy(0.022, 0.04, 6), DARK, at(0.27, 0.2, a), { bone: spin, rotation: [0, 0, 90] });
    }
    glow(P(new THREE.TorusGeometry(0.34, 0.025, 5, 16), s > 0 ? NEON_M : NEON_C, at(0.21), { bone: spin, rotation: [0, 90, 0] }), 1.2);
    // brake disc + calipers + axle
    P(cy(0.22, 0.03, 12), STEEL, at(-0.1), R);
    P(bx(0.1, 0.12, 0.18), WARN, [hub[0] - s * 0.12, 0.74, z + 0.05]);
    rod([hub[0], 0.5, z], [s * 0.5, 0.55, z], 0.05, DARK);
    // mud flaps
    P(bx(0.03, 0.3, 0.4), TYRE, [s * 1.3, 0.78, z - 0.55 * (front ? 1 : 1)]);
    // shocks
    rod([s * 0.9, 0.55, z + 0.1], [s * 0.78, 1.0, z + 0.1], 0.04, "#ff6a00", { sides: 7 });
    for (let i = 0; i < 4; i++) P(new THREE.TorusGeometry(0.06, 0.012, 4, 8), STEEL, [s * (0.88 - i * 0.03), 0.64 + i * 0.1, z + 0.1], { rotation: [90, 0, 0] });
  }

  // ---- sprinkled greeble (rivet studs, small antennas) on hull top
  for (let i = 0; i < 20; i++) {
    const x = (r() - 0.5) * 1.4, z = -2.5 + r() * 1.3;
    if (Math.abs(x) < 0.5 && z > -2.2 && z < -1.1) continue;
    P(cy(0.025 + r() * 0.02, 0.05, 6), i % 2 ? STEEL : DARK, [x, 1.39, z]);
  }
  // roll bars over bed
  for (const s of [1, -1]) {
    rod([s * 0.9, 1.8, -0.85], [s * 0.9, 2.45, -0.85], 0.04, STEEL);
  }
  rod([-0.9, 2.45, -0.85], [0.9, 2.45, -0.85], 0.04, STEEL);
  P(bx(1.5, 0.3, 0.04), GLASS, [0, 2.2, -0.85]); // rear shield
  glow(b.part(new THREE.PlaneGeometry(0.9, 0.22), "#ffffff", { bone: chassis, at: [0, 2.2, -0.87], dir: [0, 0, -1], axis: "z", texture: TAG }), 1);

  return b.root;
}
```