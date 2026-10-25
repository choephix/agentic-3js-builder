import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Vanguard 2077 War Truck",
  description: "Low-poly cyberpunk armoured pickup with neon underglow, roof railgun turret, thrusters and plated hull.",
};

type V = [number, number, number];
const NEON = "#19f2ff", PINK = "#ff2bd6", AMBER = "#ffb02e", RED = "#ff2a3c";
const DARK = "#17181f", STEEL = "#5b6070", TYRE = "#101014", GLASS = "#0c2a3a", OLIVE = "#3d4a3a";
const HULL = panelled(metal("iron", { tarnish: 0.5, seed: 4 }), { size: 0.16, rivets: 0.04, seam: "#08080c" });
const PLATE = panelled(metal("blued", { tarnish: 0.3 }), { size: 0.12, rivets: 0.035 });
const CAMO = panelled(OLIVE, { size: 0.2, rivets: 0 });

const hazard = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffc400"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#111"/>`).join("")}</svg>`, { size: 128 });
const emblem = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#0a0a12" stroke="#19f2ff" stroke-width="4"/>
<path d="M32 10 L50 44 L32 36 L14 44Z" fill="#ff2bd6" stroke="#19f2ff" stroke-width="2"/><path d="M20 52 H44" stroke="#19f2ff" stroke-width="3"/></svg>`, { size: 128 });
const tag = svg(`<svg viewBox="0 0 96 32"><rect width="96" height="32" fill="#0a0a12"/><text x="48" y="23" font-size="20" font-weight="bold" text-anchor="middle" font-family="monospace" fill="#ff2bd6">VG-2077</text></svg>`, { size: 192 });
const screen = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#032028"/>
${[6, 14, 22, 30].map((y) => `<path d="M4 ${y} H${20 + ((y * 7) % 36)}" stroke="#19f2ff" stroke-width="2"/>`).join("")}
<path d="M4 36 L16 24 L28 30 L44 12 L60 18" fill="none" stroke="#ff2bd6" stroke-width="2"/></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const ch = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
  const P = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: ch, at, flat: true, ...o });
  const L = (g: THREE.BufferGeometry, c: string, at: V, o: any = {}) => glow(P(g, c, at, o), 1.6);
  const rod = (a: V, e: V, r: number, c: any, o: any = {}) => b.rod(a, e, r, c, { bone: ch, sides: 6, ...o });

  // frame & underbody
  for (const s of [1, -1]) {
    P(box(0.12, 0.18, 4.9), DARK, [s * 0.5, 0.58, 0]);
    P(box(0.06, 0.05, 4.4), NEON, [s * 0.9, 0.38, 0]); glow(b.parts?.length ? (undefined as any) : P(box(0.02, 0.02, 0.02), NEON, [0, 0, 0]), 0);
    L(box(0.05, 0.04, 4.2), NEON, [s * 0.95, 0.33, 0]);
    rod([s * 0.95, 0.5, -1], [s * 0.95, 0.5, 1.2], 0.04, STEEL);
  }
  for (const z of [-2.3, -1, 0.3, 1.3, 2.25]) P(box(1.1, 0.1, 0.08), DARK, [0, 0.58, z]);
  rod([0, 0.5, 0.9], [0, 0.5, -1.5], 0.035, STEEL, { sides: 8 });
  P(box(1.9, 0.3, 4.6), HULL, [0, 0.85, 0]); // sill body

  // cab
  P(box(1.9, 0.5, 1.5), HULL, [0, 1.25, 0.5]);
  b.frustumBox([0, 1.52, 0.5], [0, 1.95, 0.35], [1.9, 0.1], [1.6, 0.1], { bone: ch, color: PLATE });
  P(box(1.7, 0.1, 1.1), PLATE, [0, 2.0, 0.3]);
  b.frustumBox([0, 1.5, 1.2], [0, 1.15, 2.5], [1.9, 0.45], [1.8, 0.3], { bone: ch, color: HULL }); // sloped nose
  P(box(1.5, 0.05, 1.1), PLATE, [0, 1.42, 1.75], { rotation: [8, 0, 0] });
  P(box(1.7, 0.5, 0.05), GLASS, [0, 1.75, 1.15], { rotation: [-38, 0, 0] });
  P(box(1.7, 0.4, 0.05), GLASS, [0, 1.75, -0.28]);
  for (const s of [1, -1]) {
    P(box(0.05, 0.38, 1.0), GLASS, [s * 0.96, 1.75, 0.55]);
    P(box(0.07, 0.5, 0.08), DARK, [s * 0.95, 1.75, 1.0]);
    P(box(0.07, 0.5, 0.08), DARK, [s * 0.95, 1.75, 0.05]);
    // front fenders with wheel arches covers
    P(box(0.3, 0.2, 1.1), PLATE, [s * 0.98, 1.0, 1.55]);
    P(box(0.06, 0.12, 0.9), NEON, [s * 1.1, 0.8, 1.55]);
    // door decals
    b.part(new THREE.PlaneGeometry(0.5, 0.125), "#ffffff", { bone: ch, at: [s * 0.955, 1.0, 0.5], dir: [s, 0, 0], axis: "z", texture: hazard });
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: ch, at: [s * 0.955, 1.35, 0.5], dir: [s, 0, 0], axis: "z", texture: emblem });
    b.part(new THREE.PlaneGeometry(0.4, 0.13), "#ffffff", { bone: ch, at: [s * 1.121, 1.0, -1.7], dir: [s, 0, 0], axis: "z", texture: tag });
    // mirrors
    rod([s * 0.95, 1.7, 1.0], [s * 1.2, 1.78, 1.05], 0.015, STEEL);
    P(box(0.05, 0.22, 0.16), DARK, [s * 1.22, 1.78, 1.05]);
    // headlights
    L(box(0.5, 0.07, 0.03), "#ffffcc", [s * 0.6, 1.2, 2.52]);
    L(box(0.3, 0.04, 0.03), PINK, [s * 0.65, 1.08, 2.5]);
    // exhaust stacks
    rod([s * 0.9, 0.9, -0.3], [s * 0.9, 2.4, -0.3], 0.06, STEEL, { sides: 8 });
    P(cyl(0.085, 0.5, 8), DARK, [s * 0.9, 1.6, -0.3]);
    P(cyl(0.08, 0.04, 8), AMBER, [s * 0.9, 2.42, -0.3]);
    // smoke launchers
    for (let i = 0; i < 3; i++) rod([s * 0.9, 1.1, 1.3 + i * 0.1], [s * 0.95, 1.4, 1.5 + i * 0.1], 0.035, OLIVE);
    // thrusters
    b.lathe([[0, 0], [0.2, 0], [0.16, 0.1], [0.3, 0.55], [0.26, 0.55], [0.12, 0.12], [0, 0.14]], { at: [s * 0.6, 0.95, -2.5], axis: [0, 0, -1], segments: 10, bone: ch, color: STEEL });
    L(cyl(0.11, 0.03, 10), NEON, [s * 0.6, 0.95, -2.62], { rotation: [90, 0, 0] });
    P(new THREE.TorusGeometry(0.25, 0.02, 5, 10), DARK, [s * 0.6, 0.95, -2.8]);
    // taillights
    L(box(0.4, 0.08, 0.03), RED, [s * 0.7, 1.2, -2.55]);
    // side skirt plates with rivet-bolts
    for (let i = 0; i < 4; i++) {
      P(box(0.06, 0.34, 0.5), CAMO, [s * 0.98, 0.7, -0.9 + i * 0.6]);
      P(cyl(0.02, 0.03, 6), AMBER, [s * 1.02, 0.78, -0.9 + i * 0.6], { rotation: [0, 0, 90] });
    }
  }
  // grille & bumpers
  P(box(1.2, 0.35, 0.06), DARK, [0, 1.0, 2.5]);
  for (let i = 0; i < 6; i++) L(box(1.1, 0.015, 0.02), i % 2 ? PINK : NEON, [0, 0.88 + i * 0.05, 2.54]);
  P(box(2.1, 0.3, 0.3), PLATE, [0, 0.6, 2.55]);
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.55, 2.7], [0, 0, 1], 0.22, 0.04, STEEL, { bone: ch, sides: 5 });
  P(box(2.1, 0.25, 0.2), PLATE, [0, 0.6, -2.65]);
  b.part(new THREE.PlaneGeometry(0.5, 0.125), "#ffffff", { bone: ch, at: [0, 0.6, -2.76], dir: [0, 0, -1], axis: "z", texture: hazard });
  // dash screen visible through windscreen
  b.part(new THREE.PlaneGeometry(0.4, 0.25), "#ffffff", { bone: ch, at: [0.4, 1.58, 1.0], dir: [0, 0.6, -0.8], axis: "z", texture: screen });

  // bed: armoured cargo with plates and crates
  P(box(1.95, 0.08, 2.2), DARK, [0, 1.0, -1.45]);
  P(box(1.95, 0.55, 0.12), PLATE, [0, 1.3, -0.4]);
  P(box(1.95, 0.5, 0.1), PLATE, [0, 1.28, -2.52]);
  for (const s of [1, -1]) {
    P(box(0.1, 0.55, 2.2), CAMO, [s * 0.93, 1.3, -1.45]);
    P(box(0.14, 0.06, 2.2), STEEL, [s * 0.93, 1.6, -1.45]);
    for (let i = 0; i < 4; i++) L(box(0.03, 0.12, 0.05), AMBER, [s * 1.0, 1.35, -0.7 - i * 0.5]);
  }
  P(box(0.7, 0.4, 0.8), OLIVE, [-0.4, 1.25, -1.2]);
  P(box(0.72, 0.05, 0.82), STEEL, [-0.4, 1.47, -1.2]);
  P(box(0.5, 0.35, 0.6), DARK, [0.45, 1.22, -1.9]);
  L(box(0.3, 0.06, 0.03), NEON, [0.45, 1.3, -1.58]);
  // antennas
  b.spike([-0.8, 2.05, 0.1], [0, 1, 0], 1.3, 0.02, STEEL, { bone: ch, sides: 5 });
  P(new THREE.SphereGeometry(0.04, 6, 4), RED, [-0.8, 3.37, 0.1]);
  P(cyl(0.3, 0.04, 8), STEEL, [0.7, 2.15, -0.1], { rotation: [50, 0, 0] });
  rod([0.7, 2.05, -0.1], [0.7, 2.3, 0.1], 0.012, STEEL);
  // light bar
  P(box(1.2, 0.08, 0.12), DARK, [0, 2.1, 1.0]);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) L(cyl(0.05, 0.03, 8), x < 0 ? PINK : NEON, [x, 2.1, 1.07], { rotation: [90, 0, 0] });

  // roof railgun turret
  P(new THREE.TorusGeometry(0.34, 0.035, 6, 14), STEEL, [0, 2.08, 0.1], { rotation: [90, 0, 0] });
  const yaw = b.joint("turretYaw", { parent: ch, at: [0, 2.1, 0.1], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 2.4, 0.1], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.3, 0.15, 10), PLATE, { bone: yaw, at: [0, 2.2, 0.1], flat: true });
  for (const s of [1, -1]) b.part(box(0.06, 0.3, 0.4), PLATE, { bone: yaw, at: [s * 0.2, 2.38, 0.1], flat: true });
  b.part(box(0.3, 0.26, 0.5), STEEL, { bone: pitch, at: [0, 2.4, 0.1], flat: true });
  for (const s of [1, -1]) {
    b.rod([s * 0.07, 2.4, 0.3], [s * 0.07, 2.4, 1.9], 0.05, STEEL, { bone: pitch, section: "box", caps: "flat" });
    b.part(box(0.1, 0.1, 0.1), DARK, { bone: pitch, at: [s * 0.07, 2.4, 1.92], flat: true });
  }
  glow(b.part(box(0.06, 0.03, 1.5), NEON, { bone: pitch, at: [0, 2.4, 1.1], flat: true }), 1.8);
  for (let i = 0; i < 4; i++) b.part(cyl(0.07, 0.3, 8), DARK, { bone: pitch, at: [0.22, 2.4, 0.5 + i * 0.35], rotation: [90, 0, 0], flat: true });

  // wheels
  for (const [k, s, z] of [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]] as const) {
    const hub: V = [s * 0.86, 0.42, z];
    const susp = b.joint(`susp${k}`, { parent: ch, at: [s * 0.5, 0.58, z], dir: [0, 1, 0], role: "hinge" });
    const par = z > 0 ? b.joint(`steer${k}`, { parent: susp, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : susp;
    const w = b.joint(`wheel${k}`, { parent: par, at: hub, dir: [0, 1, 0], role: "hinge" });
    const W = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: w, at, flat: true, ...o });
    W(cyl(0.36, 0.3, 12), TYRE, hub, { rotation: [0, 0, 90] });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      W(box(0.15, 0.1, 0.13), TYRE, [hub[0] + (i % 2 ? 0.075 : -0.075), 0.42 + 0.37 * Math.cos(a), z + 0.37 * Math.sin(a)], { rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    W(cyl(0.22, 0.32, 8), STEEL, hub, { rotation: [0, 0, 90] });
    W(cyl(0.12, 0.34, 6), DARK, hub, { rotation: [0, 0, 90] });
    L(new THREE.TorusGeometry(0.26, 0.015, 5, 14), PINK, [hub[0] + s * 0.17, 0.42, z], { rotation: [0, 90, 0], bone: w });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      W(cyl(0.025, 0.04, 6), AMBER, [hub[0] + s * 0.18, 0.42 + 0.17 * Math.cos(a), z + 0.17 * Math.sin(a)], { rotation: [0, 0, 90] });
    }
    // suspension
    b.rod([s * 0.5, 0.5, z], hub, 0.05, DARK, { bone: susp, sides: 6 });
    b.rod([s * 0.55, 0.9, z + 0.1], [s * 0.7, 0.45, z + 0.1], 0.04, STEEL, { bone: susp, sides: 6 });
  }
  return b.root;
}
