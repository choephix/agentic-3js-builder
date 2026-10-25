```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { catmull } from "agentic-3js-builder";

export const meta = {
  name: "Vault Runner Convoy Hauler",
  description:
    "Low-poly cyberpunk six-wheel armoured hauler with a ram nose, roof turret, neon trim and a sealed, clamped cargo pod on the bed.",
};

const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb02e";
const DARK = "#14161e";
const PLATE = "#2c3140";
const STEEL = "#6b7385";
const RUBBER = "#0e0f13";
const GLASS = "#0f3a4a";
const POD = "#d9dde6";

// ---- paints: lit from above, grimy near the ground, scuffed edges
const HULL = paint((p, n) => {
  const base = mix("#2a3040", "#46506a", smoothstep(0.2, 0.9, noise(p, 0.5, 3)));
  const top = mix(base, "#69738f", smoothstep(0.4, 1, n.y) * 0.5);
  const grime = smoothstep(1.2, 0.3, p.y) * (0.4 + 0.4 * noise(p, 0.18, 8));
  return mix(top, "#0c0d12", grime * 0.7);
});
const POD_PAINT = paint((p, n) => {
  const c = mix("#c9ced9", "#eef1f6", smoothstep(0.3, 1, n.y));
  const streak = noise([p.x * 8, p.y * 0.6, p.z * 0.6] as unknown as THREE.Vector3, 0.4, 5);
  const dirty = smoothstep(2.0, 1.2, p.y) * 0.5 + (streak > 0.62 ? 0.15 : 0);
  return mix(c, "#6a6f7a", dirty);
});
const RUST = paint((p) => mix("#3a3f4e", "#6b4a3a", smoothstep(0.45, 0.75, noise(p, 0.15, 12)) * 0.6));

// ---- textures
const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#111"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#ffc400"/>`).join("")}
  <rect width="64" height="16" fill="none" stroke="#000" stroke-width="1.5"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#0b1018" stroke="#19f0ff" stroke-width="4"/>
  <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="none" stroke="#ff2bd6" stroke-width="2"/>
  <rect x="34" y="44" width="32" height="26" rx="3" fill="#19f0ff"/>
  <path d="M39 44 V34 a11 11 0 0 1 22 0 V44" fill="none" stroke="#19f0ff" stroke-width="5"/>
  <rect x="47" y="52" width="6" height="11" fill="#0b1018"/>
  <text x="50" y="80" font-family="monospace" font-weight="bold" font-size="9" text-anchor="middle" fill="#ff2bd6">SEALED</text></svg>`,
  { size: 256 },
);
const PLATE_TEX = svg(
  `<svg viewBox="0 0 80 30" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="30" rx="3" fill="#0b1018" stroke="#ffb02e" stroke-width="2"/>
  <text x="40" y="21" font-family="monospace" font-weight="bold" font-size="17" text-anchor="middle" fill="#ffb02e">CV-77</text></svg>`,
  { size: 256 },
);
const GLYPH = svg(
  `<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#ff2bd6" stroke-width="6" fill="none" stroke-linecap="round">
  <path d="M10 14 H50 M30 14 V54 M10 54 H50"/><path d="M12 80 L30 66 L48 80 M30 80 V110 M14 100 H46"/></g></svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" fill="#04181c"/>
  <path d="M4 30 L14 20 L24 26 L36 10 L48 18 L60 6" stroke="#19f0ff" stroke-width="2" fill="none"/>
  <rect x="4" y="34" width="30" height="3" fill="#ff2bd6"/><circle cx="54" cy="32" r="4" fill="#19f0ff"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const R = rng(5);

  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, color: any = PLATE, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at: [x, y, z], ...o });
  const cy = (r: number, h: number, sides: number, x: number, y: number, z: number, color: any, rot: [number, number, number] = [0, 0, 0], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone: chassis, at: [x, y, z], rotation: rot, flat: true, ...o });
  const bolt = (x: number, y: number, z: number, rot: [number, number, number]) =>
    cy(0.035, 0.03, 6, x, y, z, STEEL, rot);

  // ---------------- frame & underbody
  for (const s of [1, -1]) {
    bx(0.22, 0.3, 7.2, s * 0.8, 0.85, 0, DARK);
    bx(0.12, 0.5, 7.0, s * 1.3, 0.8, 0, PLATE); // side skirt armour
    for (let i = 0; i < 6; i++) bolt(s * 1.37, 0.85, -3 + i * 1.2, [0, 0, 90]);
    glow(bx(0.05, 0.06, 6.0, s * 1.38, 0.6, 0, MAG), 1.4); // underglow strip
  }
  for (const z of [-3.2, -1.6, 0, 1.6, 3]) bx(1.9, 0.18, 0.2, 0, 0.85, z, DARK);
  glow(bx(1.6, 0.04, 5.5, 0, 0.62, 0, MAG), 1.2);
  cy(0.12, 4, 8, 0, 0.7, 0, STEEL, [90, 0, 0]); // driveshaft

  // ---------------- wheels (3 axles)
  const wheelZ = [2.4, -0.3, -2.5];
  const WY = 0.6;
  wheelZ.forEach((z, ai) => {
    bx(2.7, 0.18, 0.2, 0, 0.7, z, STEEL); // axle beam
    cy(0.2, 1.8, 8, 0, 0.62, z, DARK, [0, 0, 90]);
    for (const s of [1, -1]) {
      const x = s * 1.25;
      const j = b.joint(`wheel${s > 0 ? "L" : "R"}${ai}`, { parent: chassis, at: [x, WY, z], dir: [0, 1, 0], role: "hinge" });
      const W = (g: THREE.BufferGeometry, c: any, at: number[], rot: number[] = [0, 0, 0]) =>
        b.part(g, c, { bone: j, at: at as any, rotation: rot as any, flat: true });
      W(new THREE.CylinderGeometry(0.52, 0.52, 0.5, 12), RUBBER, [x, WY, z], [0, 0, 90]);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        W(new THREE.BoxGeometry(0.5, 0.1, 0.16), "#1b1c22", [x, WY + 0.54 * Math.cos(a), z + 0.54 * Math.sin(a)], [(a * 180) / Math.PI, 0, 0]);
      }
      W(new THREE.CylinderGeometry(0.32, 0.32, 0.54, 10), "#3b4254", [x, WY, z], [0, 0, 90]);
      W(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 10), DARK, [x + s * 0.28, WY, z], [0, 0, 90]);
      glow(b.part(new THREE.TorusGeometry(0.27, 0.025, 5, 14), CYAN, { bone: j, at: [x + s * 0.28, WY, z], rotation: [0, 90, 0] }), 1.5);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        W(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), STEEL, [x + s * 0.3, WY + 0.15 * Math.cos(a), z + 0.15 * Math.sin(a)], [0, 0, 90]);
      }
      W(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 6), STEEL, [x + s * 0.33, WY, z], [0, 0, 90]);
      // fender + mud flap
      bx(0.5, 0.1, 1.5, s * 1.3, 1.22, z, HULL);
      bx(0.5, 0.5, 0.08, s * 1.3, 1.0, z - 0.75, HULL);
      bx(0.5, 0.5, 0.08, s * 1.3, 1.0, z + 0.75, HULL);
      bx(0.45, 0.4, 0.04, s * 1.3, 0.55, z - 0.82, RUBBER);
    }
  });

  // ---------------- cab
  const CZ = 2.15;
  bx(2.5, 1.05, 2.1, 0, 1.75, CZ, HULL); // lower cab
  bx(2.3, 0.78, 1.5, 0, 2.62, CZ - 0.2, HULL); // upper cabin
  bx(2.4, 0.12, 1.7, 0, 3.05, CZ - 0.2, PLATE); // roof plate
  bx(2.2, 0.06, 1.5, 0, 3.14, CZ - 0.2, STEEL);
  b.frustumBox([0, 1.7, 3.05], [0, 1.55, 3.55], [2.5, 1.0], [2.3, 0.8], { bone: chassis, color: HULL }); // sloped nose
  bx(2.7, 0.55, 0.32, 0, 0.95, 3.7, PLATE); // ram bumper
  b.part(new THREE.PlaneGeometry(2.5, 0.42), "#ffffff", { bone: chassis, at: [0, 0.95, 3.87], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  for (let i = -3; i <= 3; i++) b.spike([i * 0.36, 0.7, 3.8], [0, -0.3, 1], 0.3, 0.07, STEEL, { bone: chassis, sides: 4 });
  // windscreen: armoured slit with bars
  bx(2.0, 0.44, 0.06, 0, 2.62, CZ + 0.56, GLASS, { rotation: [-14, 0, 0] });
  for (let i = -2; i <= 2; i++) bx(0.05, 0.5, 0.08, i * 0.4, 2.62, CZ + 0.58, DARK, { rotation: [-14, 0, 0] });
  bx(2.1, 0.12, 0.14, 0, 2.9, CZ + 0.6, DARK);
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.3), "#ffffff", { bone: chassis, at: [-0.5, 2.4, CZ + 0.4], dir: [0, 0, 1], axis: "z", texture: SCREEN }), 1.2);
  // headlights & grille
  for (const s of [1, -1]) {
    glow(bx(0.5, 0.1, 0.05, s * 0.85, 1.85, 3.5, AMBER), 1.6);
    bx(0.6, 0.18, 0.1, s * 0.85, 1.85, 3.46, DARK);
    glow(bx(0.1, 0.34, 0.04, s * 1.25, 1.72, CZ + 1.05, CYAN), 1.6);
  }
  for (let i = 0; i < 5; i++) bx(1.0, 0.04, 0.05, 0, 1.45 + i * 0.08, 3.58, STEEL, { rotation: [-8, 0, 0] });
  // side doors, windows, plates
  for (const s of [1, -1]) {
    bx(0.08, 0.7, 1.1, s * 1.27, 2.62, CZ - 0.2, GLASS);
    bx(0.12, 0.08, 1.2, s * 1.27, 2.98, CZ - 0.2, DARK);
    bx(0.12, 0.08, 1.2, s * 1.27, 2.26, CZ - 0.2, DARK);
    bx(0.1, 0.9, 1.4, s * 1.28, 1.7, CZ + 0.1, PLATE);
    for (const dz of [-0.55, 0.65]) for (const dy of [1.35, 2.05]) bolt(s * 1.34, dy, CZ + 0.1 + dz * 0.9, [0, 0, 90]);
    bx(0.12, 0.08, 0.3, s * 1.34, 1.75, CZ - 0.4, STEEL); // handle
    b.part(new THREE.PlaneGeometry(0.5, 0.19), "#ffffff", { bone: chassis, at: [s * 1.345, 1.45, CZ + 0.5], dir: [s, 0, 0], axis: "z", texture: PLATE_TEX });
    // mirror
    b.rod([s * 1.3, 2.7, CZ + 0.7], [s * 1.65, 2.9, CZ + 0.85], 0.03, STEEL, { bone: chassis, sides: 5 });
    bx(0.08, 0.34, 0.2, s * 1.68, 2.9, CZ + 0.85, DARK);
    glow(bx(0.02, 0.28, 0.14, s * 1.64, 2.9, CZ + 0.85, CYAN), 0.8);
    // neon glyph stripe
    glow(b.part(new THREE.PlaneGeometry(0.3, 0.6), "#ffffff", { bone: chassis, at: [s * 1.345, 2.0, CZ - 0.55], dir: [s, 0, 0], axis: "z", texture: GLYPH }), 1.4);
    // exhaust stacks behind cab
    cy(0.1, 1.9, 8, s * 1.15, 2.3, CZ - 1.25, STEEL);
    cy(0.14, 0.5, 8, s * 1.15, 1.65, CZ - 1.25, DARK);
    cy(0.13, 0.05, 8, s * 1.15, 3.28, CZ - 1.25, DARK);
    for (const y of [1.6, 2.6]) cy(0.125, 0.06, 8, s * 1.15, y, CZ - 1.25, "#8a5a2a");
    // steps
    bx(0.4, 0.06, 0.5, s * 1.55, 0.95, CZ + 0.1, STEEL);
  }
  // roof: light bar, antennas, turret
  bx(1.8, 0.12, 0.22, 0, 3.26, CZ + 0.5, DARK);
  [-0.7, -0.25, 0.25, 0.7].forEach((x, i) => glow(bx(0.34, 0.07, 0.04, x, 3.27, CZ + 0.62, i % 2 ? MAG : CYAN), 1.8));
  b.spike([-0.95, 3.2, CZ - 0.8], [0, 1, 0], 1.6, 0.025, STEEL, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), MAG, { bone: chassis, at: [-0.95, 4.82, CZ - 0.8] }), 2);
  cy(0.3, 0.1, 10, 0.8, 3.25, CZ - 0.7, STEEL);
  b.part(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#9aa5bd", { bone: chassis, at: [0.8, 3.3, CZ - 0.7], rotation: [-30, 0, 0], flat: true });
  // turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.2, CZ - 0.4], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.55, CZ - 0.3], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.42, 0.48, 0.2, 10), PLATE, { bone: yaw, at: [0, 3.3, CZ - 0.4], flat: true });
  b.part(new THREE.BoxGeometry(0.7, 0.35, 0.8), HULL, { bone: yaw, at: [0, 3.5, CZ - 0.4] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.4, 0.5), PLATE, { bone: pitch, at: [s * 0.4, 3.58, CZ - 0.3] });
    b.rod([s * 0.1, 3.58, CZ - 0.1], [s * 0.1, 3.58, CZ + 1.1], 0.05, DARK, { bone: pitch, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8), STEEL, { bone: pitch, at: [s * 0.1, 3.58, CZ + 1.05], rotation: [90, 0, 0], flat: true });
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 0.7), CYAN, { bone: pitch, at: [s * 0.1, 3.64, CZ + 0.6] }), 1.5);
  }
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.5), PLATE, { bone: pitch, at: [0, 3.58, CZ - 0.4] });
  glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), MAG, { bone: pitch, at: [0, 3.6, CZ - 0.14], rotation: [90, 0, 0], flat: true }), 1.8);

  // ---------------- bed deck & cradles
  bx(2.5, 0.2, 4.6, 0, 1.2, -1.3, PLATE);
  b.part(new THREE.PlaneGeometry(2.4, 0.3), "#ffffff", { bone: chassis, at: [0, 1.0, -3.62], dir: [0, 0, -1], axis: "z", texture: HAZARD });
  bx(2.6, 0.5, 0.15, 0, 1.0, -3.58, DARK);
  for (const s of [1, -1]) {
    glow(bx(0.1, 0.06, 0.4, s * 1.1, 0.95, -3.66, "#ff2020"), 1.8); // tail lights
    bx(0.12, 0.5, 4.6, s * 1.25, 1.55, -1.3, HULL); // bed side wall
    bx(0.2, 0.08, 4.6, s * 1.25, 1.82, -1.3, STEEL);
    for (let i = 0; i < 5; i++) bx(0.14, 0.5, 0.08, s * 1.28, 1.55, -3.4 + i * 0.95, DARK);
    // handrail
    b.rod([s * 1.35, 1.95, -3.2], [s * 1.35, 1.95, 0.7], 0.025, AMBER, { bone: chassis, sides: 5 });
    for (const z of [-3.2, -1.2, 0.7]) b.rod([s * 1.35, 1.82, z], [s * 1.35, 1.95, z], 0.02, STEEL, { bone: chassis, sides: 5 });
    // toolbox
    bx(0.3, 0.45, 1.0, s * 1.5, 1.2, -1.8, PLATE);
    bx(0.04, 0.2, 0.6, s * 1.67, 1.2, -1.8, STEEL);
  }
  for (const z of [-2.8, -0.2]) {
    b.extrude([[-1.0, 0], [1.0, 0], [0.9, 0.8], [-0.9, 0.8]], { at: [0, 1.3, z], x: [1, 0, 0], thickness: 0.2, bevel: 0.03, bone: chassis, color: DARK });
  }

  // ---------------- sealed cargo pod
  const PZ = -1.4;
  const PY = 2.42;
  const pod = b.part(new THREE.CylinderGeometry(1.08, 1.08, 4.2, 10), POD_PAINT, { bone: chassis, at: [0, PY, PZ], rotation: [90, 0, 0], flat: true });
  for (const e of [1, -1]) {
    b.part(new THREE.SphereGeometry(1.08, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), POD_PAINT, {
      bone: chassis, at: [0, PY, PZ + e * 2.1], rotation: [e * 90, 0, 0], scale: [1, 0.5, 1], flat: true });
  }
  // armour bands with hazard + glow seal rings
  for (let i = 0; i < 5; i++) {
    const z = PZ - 1.8 + i * 0.9;
    b.part(new THREE.TorusGeometry(1.1, 0.07, 5, 10), i % 2 ? STEEL : PLATE, { bone: chassis, at: [0, PY, z], flat: true });
    glow(b.part(new THREE.TorusGeometry(1.1, 0.02, 4, 10), i === 2 ? MAG : CYAN, { bone: chassis, at: [0, PY, z + 0.08] }), 1.6);
  }
  // top seal spine
  glow(bx(0.12, 0.05, 3.8, 0, PY + 1.12, PZ, CYAN), 1.8);
  bx(0.4, 0.1, 3.9, 0, PY + 1.07, PZ, DARK);
  for (let i = 0; i < 6; i++) bx(0.5, 0.06, 0.2, 0, PY + 1.12, PZ - 1.6 + i * 0.65, STEEL);
  for (const s of [1, -1]) {
    // clamp latches and straps
    for (let i = 0; i < 4; i++) {
      const z = PZ - 1.35 + i * 0.9;
      const a = s * 55 * Math.PI / 180;
      bx(0.14, 0.3, 0.3, s * 0.95, PY - 0.55, z, PLATE, { rotation: [0, 0, -s * 40] });
      bx(0.1, 0.14, 0.22, s * 1.12, PY - 0.82, z, AMBER, { rotation: [0, 0, -s * 40] });
      void a;
    }
    // emblem decals
    b.decal(pod, EMBLEM, { at: [s * 1.08, PY + 0.05, PZ - 0.45], dir: [s, 0, 0], size: [1.0, 1.0], segments: 8 });
    glow(b.decal(pod, GLYPH, { at: [s * 1.06, PY + 0.2, PZ + 1.0], dir: [s, 0, 0], size: [0.4, 0.8], segments: 6 }), 1.3);
    // cradle brackets
    for (const z of [-2.8, -0.2]) bx(0.2, 0.55, 0.3, s * 0.95, 1.55, z, STEEL);
  }
  // front warning plate and rear seal door
  b.part(new THREE.PlaneGeometry(1.4, 0.35), "#ffffff", { bone: chassis, at: [0, PY - 0.5, PZ - 2.55], dir: [0, 0, -1], axis: "z", texture: HAZARD });
  glow(b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 8), MAG, { bone: chassis, at: [0, PY + 0.2, PZ - 2.58], rotation: [90, 0, 0], flat: true }), 1.8);
  b.part(new THREE.TorusGeometry(0.32, 0.04, 5, 8), STEEL, { bone: chassis, at: [0, PY + 0.2, PZ - 2.55] });
  // pressure gauge & vents on pod front shoulder
  cy(0.1, 0.1, 10, 0.45, PY + 0.5, PZ + 2.5, STEEL, [90, 0, 0]);
  glow(cy(0.075, 0.03, 10, 0.45, PY + 0.5, PZ + 2.56, AMBER, [90, 0, 0]), 1.4);
  // coolant lines pod->cab
  for (const s of [1, -1]) {
    const path = catmull([[s * 0.5, 1.6, CZ - 1.0], [s * 0.7, 2.0, CZ - 1.5], [s * 0.6, 2.5, PZ + 2.0]]);
    b.sweep(path, 0.04, s > 0 ? MAG : CYAN, { bone: chassis, sides: 6 });
  }

  // scattered greeble studs on cab roof & nose (deterministic)
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 2.0;
    const z = CZ - 0.9 + R() * 1.4;
    cy(0.04, 0.04, 6, x, 3.2, z, STEEL);
  }
  for (let i = 0; i < 6; i++) bx(0.22, 0.04, 0.22, -0.8 + i * 0.32, 2.05 + 0.01, 3.2, RUST);

  return b.root;
}
```