```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler Mk-VII",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler with a roof turret, missile pod and a sealed, glowing cargo pod on the back.",
};

const BODY = "#2b3038", DARK = "#101216", STEEL = "#5d6670", NEON_M = "#ff2bd6", NEON_C = "#2bf0ff";
const HAZ = "#e9c32a", RED = "#ff2a3a", GLASS = "#1a4a66";

// painted armour: panel seams, cool top light, warm underside, grime at the bottom
const HULL = paint((p, n) => {
  const f = (v: number, s: number) => Math.abs(((v / s) % 1 + 1) % 1 - 0.5);
  const seam = f(p.z + 0.2, 0.9) > 0.485 || f(p.y, 0.55) > 0.485;
  let c = mix("#2b3038", "#3b4452", smoothstep(0.2, 0.9, n.y) * 0.8 + noise(p, 0.3, 2) * 0.3);
  c = mix(c, "#15171b", smoothstep(1.2, 0.2, p.y) * 0.5);
  return seam ? mix(c, "#0a0b0d", 0.8) : c;
});
const PODP = paint((p, n) => {
  const ring = Math.abs(((p.z / 0.7) % 1 + 1) % 1 - 0.5) > 0.47;
  const stripe = Math.abs(p.y - 2.45) < 0.05 && Math.abs(n.x) > 0.8;
  if (stripe) return NEON_M;
  if (ring) return "#0b0d12";
  return mix("#1c2230", "#2a3347", noise(p, 0.4, 5)) ;
});
const HAZP = paint((p) => ((((p.x + p.y) / 0.16) % 1 + 1) % 1 < 0.5 ? HAZ : "#15161a"));

const sealTex = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#0b0d12" stroke="#2bf0ff" stroke-width="5"/>
  <g fill="#ff2bd6"><path d="M50 50 L50 12 A38 38 0 0 1 83 69Z"/><path d="M50 50 L83 69 A38 38 0 0 1 17 69Z" fill="#2bf0ff"/><path d="M50 50 L17 69 A38 38 0 0 1 50 12Z"/></g>
  <circle cx="50" cy="50" r="12" fill="#0b0d12" stroke="#fff" stroke-width="3"/></svg>`,
  { size: 256 });
const unitTex = svg(
  `<svg viewBox="0 0 200 70"><rect x="3" y="3" width="194" height="64" rx="6" fill="#0b0d12cc" stroke="#e9c32a" stroke-width="4"/>
  <text x="100" y="33" font-family="Arial Black,Arial" font-size="24" font-weight="900" fill="#e9c32a" text-anchor="middle">SEALED CARGO</text>
  <text x="100" y="58" font-family="monospace" font-size="20" fill="#2bf0ff" text-anchor="middle">UNIT 07 // KURO</text></svg>`,
  { size: 384 });
const hudTex = svg(
  `<svg viewBox="0 0 120 60"><rect width="120" height="60" fill="#06131a"/><circle cx="40" cy="30" r="18" fill="none" stroke="#2bf0ff" stroke-width="2"/>
  <line x1="18" y1="30" x2="62" y2="30" stroke="#2bf0ff"/><line x1="40" y1="8" x2="40" y2="52" stroke="#2bf0ff"/>
  <rect x="72" y="12" width="40" height="6" fill="#ff2bd6"/><rect x="72" y="26" width="28" height="6" fill="#2bf0ff"/><rect x="72" y="40" width="34" height="6" fill="#2bf0ff"/></svg>`,
  { size: 256 });
const warnTex = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#e9c32a" stroke="#111" stroke-width="5"/><rect x="44" y="34" width="8" height="30" fill="#111"/><rect x="44" y="70" width="8" height="8" fill="#111"/></svg>`,
  { size: 128 });

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const R = rng(7);
  const chassis = b.joint("chassis", { at: [0, 1, 0], role: "spine" });

  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: chassis, at, ...o });
  const cyl = (r: number, h: number, sides: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), col, { bone: chassis, at, flat: true, ...o });
  const lamp = (w: number, h: number, d: number, col: string, at: number[], k = 1.4, o: any = {}) =>
    glow(box(w, h, d, col, at, o), k);

  // ---------- frame & underbody
  for (const s of [1, -1]) {
    box(0.18, 0.28, 7.6, DARK, [s * 0.6, 0.85, -0.2]);
    glow(b.rod([s * 0.95, 0.62, -3.6], [s * 0.95, 0.62, 3.0], 0.025, NEON_M, { bone: chassis, sides: 6 }), 1.6);
  }
  for (const z of [-3.2, -1.8, -0.4, 1.2, 2.8]) box(1.5, 0.16, 0.2, DARK, [0, 0.88, z]);
  box(1.4, 0.3, 7.2, "#1a1c20", [0, 0.8, -0.2]);

  // ---------- wheels
  const axles = [2.35, -1.45, -2.75];
  for (const z of axles)
    for (const s of [1, -1]) {
      const front = z > 0;
      const name = `wheel${front ? "F" : z > -2 ? "M" : "R"}${s > 0 ? "L" : "R"}`;
      const hub: [number, number, number] = [s * 1.2, 0.55, z];
      const j = b.joint(name, { parent: chassis, at: hub, dir: [s, 0, 0], role: "hinge" });
      b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.55, 12), "#16171a", { bone: j, at: hub, rotation: [0, 0, 90], flat: true });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.58, 0.1, 0.16), "#0c0d0f", {
          bone: j, at: [hub[0], hub[1] + 0.56 * Math.cos(a), hub[2] + 0.56 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0], flat: true,
        });
      }
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.58, 8), STEEL, { bone: j, at: hub, rotation: [0, 0, 90], flat: true });
      b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.64, 6), DARK, { bone: j, at: [hub[0] + s * 0.02, hub[1], hub[2]], rotation: [0, 0, 90], flat: true });
      glow(b.part(new THREE.TorusGeometry(0.27, 0.015, 5, 16), NEON_C, { bone: j, at: [hub[0] + s * 0.3, hub[1], hub[2]], rotation: [0, 90, 0] }), 1.6);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), "#9aa2ab", {
          bone: j, at: [hub[0] + s * 0.3, hub[1] + 0.2 * Math.cos(a), hub[2] + 0.2 * Math.sin(a)], rotation: [0, 0, 90],
        });
      }
      // armoured fender arch
      box(0.12, 0.08, 1.5, HULL, [s * 1.0, 1.2, z]);
      box(0.5, 0.14, 1.4, HULL, [s * 1.22, 1.17, z], { rotation: [0, 0, s * -8] });
    }

  // ---------- cab
  box(2.5, 1.2, 2.2, HULL, [0, 1.8, 1.9]); // lower cab
  box(2.3, 0.9, 1.7, HULL, [0, 2.7, 1.6]); // upper cab
  b.frustumBox([0, 1.65, 3.0], [0, 1.5, 3.75], [2.5, 1.0], [2.2, 0.7], { bone: chassis, color: HULL }); // nose
  box(2.3, 0.16, 1.9, "#1d2026", [0, 3.2, 1.55]); // roof plate
  box(2.34, 0.7, 0.14, GLASS, [0, 2.75, 2.5], { rotation: [-18, 0, 0] }); // raked screen
  lamp(2.0, 0.06, 0.04, NEON_C, [0, 3.07, 2.45], 1.3, { rotation: [-18, 0, 0] });
  for (const s of [1, -1]) {
    box(0.05, 0.4, 1.1, GLASS, [s * 1.17, 2.75, 1.6]); // side slit
    box(0.14, 0.16, 1.2, STEEL, [s * 1.22, 2.3, 1.6]);
    // door
    const door = b.joint(`door${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 1.26, 1.9, 2.25], dir: [0, 1, 0], role: "hinge" });
    b.part(new THREE.BoxGeometry(0.06, 0.9, 1.1), "#353c48", { bone: door, at: [s * 1.27, 1.9, 1.7] });
    b.part(new THREE.BoxGeometry(0.08, 0.06, 0.3), STEEL, { bone: door, at: [s * 1.3, 1.95, 1.3] });
    // side armour plates with hazard chevrons
    box(0.1, 0.5, 2.0, HAZP, [s * 1.28, 1.35, 1.9]);
    // mirror cams
    b.rod([s * 1.2, 2.5, 2.7], [s * 1.55, 2.6, 2.8], 0.025, STEEL, { bone: chassis, sides: 6 });
    cyl(0.07, 0.12, 8, DARK, [s * 1.58, 2.6, 2.8], { rotation: [90, 0, 0] });
    glow(cyl(0.04, 0.02, 8, NEON_C, [s * 1.58, 2.6, 2.87], { rotation: [90, 0, 0] }), 1.5);
    // headlights
    lamp(0.55, 0.1, 0.06, NEON_C, [s * 0.8, 1.55, 3.55], 1.6, { rotation: [-8, 0, 0] });
    box(0.65, 0.04, 0.12, DARK, [s * 0.8, 1.64, 3.5]);
    // exhaust stacks behind cab
    b.rod([s * 1.2, 1.4, 0.8], [s * 1.2, 3.5, 0.75], 0.09, STEEL, { bone: chassis, sides: 8 });
    cyl(0.12, 0.12, 8, DARK, [s * 1.2, 3.55, 0.75]);
    cyl(0.14, 0.4, 8, "#7a7f86", [s * 1.2, 1.9, 0.78]);
  }
  // grille & ram bumper
  box(1.5, 0.5, 0.1, DARK, [0, 1.3, 3.72]);
  for (let i = 0; i < 6; i++) box(1.5, 0.03, 0.06, NEON_M, [0, 1.12 + i * 0.07, 3.78]);
  box(2.7, 0.45, 0.35, HAZP, [0, 0.85, 3.7]);
  for (let i = 0; i < 7; i++)
    b.spike([-1.2 + i * 0.4, 0.8, 3.88], [0, -0.1, 1], 0.28, 0.07, STEEL, { bone: chassis, sides: 5 });
  // cab hud / sensor
  b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", { bone: chassis, at: [0, 2.2, 2.76], dir: [0, 0.2, 1], axis: "z", texture: hudTex });
  box(0.9, 0.04, 0.14, DARK, [0, 2.42, 2.7]);
  // roof light bar & antennas
  box(1.6, 0.1, 0.18, DARK, [0, 3.35, 2.3]);
  for (const x of [-0.6, -0.2, 0.2, 0.6]) lamp(0.3, 0.06, 0.04, x < 0 ? NEON_M : NEON_C, [x, 3.35, 2.4], 1.7);
  b.spike([-1.0, 3.28, 0.9], [0, 1, 0], 1.7, 0.022, STEEL, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: chassis, at: [-1.0, 5.0, 0.9] }), 1.8);
  b.rod([1.0, 3.28, 0.9], [1.0, 3.9, 0.9], 0.03, STEEL, { bone: chassis, sides: 6 });
  cyl(0.28, 0.06, 10, DARK, [1.0, 3.95, 0.9]);
  b.part(new THREE.SphereGeometry(0.26, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { bone: chassis, at: [1.0, 3.95, 0.9], rotation: [-35, 0, 0], flat: true });

  // ---------- turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.3, 1.25], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.75, 1.25], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.55, 0.05, 5, 14), STEEL, { bone: chassis, at: [0, 3.31, 1.25], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.5, 0.55, 0.3, 10), "#353c48", { bone: yaw, at: [0, 3.5, 1.25], flat: true });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.1, 0.5, 0.7), HULL, { bone: yaw, at: [s * 0.4, 3.78, 1.25] });
  b.part(new THREE.BoxGeometry(0.7, 0.36, 0.9), "#3b4452", { bone: pitch, at: [0, 3.75, 1.35] });
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.3), DARK, { bone: pitch, at: [0, 3.75, 0.75] });
  for (const s of [1, -1]) {
    b.rod([s * 0.14, 3.75, 1.7], [s * 0.14, 3.75, 3.1], 0.055, STEEL, { bone: pitch, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.3, 8), DARK, { bone: pitch, at: [s * 0.14, 3.75, 2.2], rotation: [90, 0, 0], flat: true });
    b.part(new THREE.BoxGeometry(0.16, 0.16, 0.16), DARK, { bone: pitch, at: [s * 0.14, 3.75, 3.12] });
    // missile pods
    b.part(new THREE.BoxGeometry(0.34, 0.34, 0.7), "#262a30", { bone: pitch, at: [s * 0.62, 3.8, 1.3] });
    for (const dx of [-0.07, 0.07]) for (const dy of [-0.07, 0.07])
      b.spike([s * 0.62 + dx, 3.8 + dy, 1.62], [0, 0, 1], 0.12, 0.05, RED, { bone: pitch, sides: 6 });
  }
  glow(b.part(new THREE.BoxGeometry(0.2, 0.08, 0.04), NEON_C, { bone: pitch, at: [0, 3.9, 1.82] }), 1.6);

  // ---------- cargo pod
  box(2.5, 0.2, 4.6, "#1a1c20", [0, 1.35, -1.6]); // deck
  for (const z of [-3.4, -1.9, -0.3]) {
    box(2.4, 0.5, 0.25, DARK, [0, 1.6, z]);
    for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.2, 0.6, 0.3), STEEL, { bone: chassis, at: [s * 1.1, 1.75, z], rotation: [0, 0, s * 30] });
  }
  b.lathe(
    [[0, 0], [0.7, 0], [1.05, 0.3], [1.12, 0.65], [1.12, 3.65], [1.05, 4.0], [0.7, 4.3], [0, 4.3]],
    { at: [0, 2.55, -4.0], axis: [0, 0, 1], segments: 12, bone: chassis, color: PODP },
  );
  for (const z of [-3.6, -2.5, -1.4, -0.3]) // retaining straps
    b.part(new THREE.TorusGeometry(1.15, 0.06, 5, 12), STEEL, { bone: chassis, at: [0, 2.55, z], flat: true });
  // top hatch
  const hatch = b.joint("podHatch", { parent: chassis, at: [0, 3.66, -3.1], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  b.part(new THREE.BoxGeometry(0.9, 0.08, 1.0), "#353c48", { bone: hatch, at: [0, 3.7, -2.6] });
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 8), HAZ, { bone: hatch, at: [0, 3.76, -2.6], flat: true });
  // top light spine
  for (let i = 0; i < 5; i++) lamp(0.12, 0.05, 0.3, i % 2 ? NEON_M : NEON_C, [0.0, 3.72, -1.0 - i * 0.55 - 1.2 + 0.2], 1.4);
  // rear seal door
  b.part(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 12), "#232a38", { bone: chassis, at: [0, 2.55, -4.05], rotation: [90, 0, 0], flat: true });
  glow(b.part(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", { bone: chassis, at: [0, 2.55, -4.12], dir: [0, 0, -1], axis: "z", texture: sealTex }), 1.2);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6), STEEL, { bone: chassis, at: [0.95 * Math.cos(a), 2.55 + 0.95 * Math.sin(a), -4.08], rotation: [90, 0, 0] });
  }
  // side decals on pod
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.7, 0.6), "#ffffff", { bone: chassis, at: [s * 1.135, 2.9, -2.0], dir: [s, 0, 0], up: [0, 1, 0], axis: "z", texture: unitTex });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: chassis, at: [s * 1.135, 2.1, -0.9], dir: [s, 0, 0], axis: "z", texture: warnTex });
  }
  // rear bumper, taillights, thrusters
  box(2.7, 0.4, 0.3, HAZP, [0, 0.9, -4.1]);
  for (const s of [1, -1]) {
    lamp(0.4, 0.14, 0.06, RED, [s * 0.95, 1.35, -4.2], 1.6);
    cyl(0.14, 0.5, 8, STEEL, [s * 0.4, 0.6, -4.0], { rotation: [90, 0, 0] });
    cyl(0.1, 0.1, 8, DARK, [s * 0.4, 0.6, -4.28], { rotation: [90, 0, 0] });
    // side fuel tanks and cable bundles
    cyl(0.22, 1.1, 10, "#3a4048", [s * 1.0, 0.95, -0.2 + 0 ], { rotation: [90, 0, 0] });
    glow(b.rod([s * 1.25, 1.4, -3.6], [s * 1.25, 1.4, -0.4], 0.02, s > 0 ? NEON_M : NEON_C, { bone: chassis, sides: 6 }), 1.6);
  }
  // sensor spines scattered on pod flanks
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1;
    box(0.1, 0.1, 0.14, DARK, [s * 1.12, 3.3 - (i % 3) * 0.2, -3.4 + i * 0.5 + R() * 0.1]);
  }

  return b.root;
}
```