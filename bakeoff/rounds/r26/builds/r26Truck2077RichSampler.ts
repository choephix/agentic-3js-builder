import * as THREE from "three";
import { createBuilder, paint, noise, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Wraith-6 Night Hauler",
  description:
    "A 6x6 militarized cyberpunk truck from 2077: panelled armour, railgun turret, missile pods, neon underglow, glowing screens and decals.",
};

const NEON = "#ff2bd6";
const CYAN = "#2bf0ff";
const AMBER = "#ffb000";
const RED = "#ff2a3a";
const DARK = "#101216";
const STEEL = "#6a7079";
const TRIM = "#1c1f24";

const HULL = panelled(metal("iron", { tarnish: 0.35, polish: 0.15, seed: 4 }), { size: 0.5, aspect: 0.7, rivets: 0.1 });
const HULL2 = panelled(metal("blued", { tarnish: 0.4, size: 0.2, seed: 9 }), { size: 0.4, rivets: 0.08 });
const GRIME = paint((p, n) => {
  const g = Math.max(0, 1 - p.y / 1.1) * noise(p, 0.25, 3);
  const base = n.y > 0.6 ? "#3a3f48" : "#272b32";
  return g > 0.3 ? "#1a1713" : base;
});
const HAZARD = paint((p) => ((((p.x + p.y + p.z) / 0.22) % 1) + 1) % 1 < 0.5 ? "#e9c32a" : "#15161a");

const tex = {
  number: svg(
    `<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="none" stroke="#f2f2f2" stroke-width="5"/><text x="64" y="56" font-family="Arial Black,Arial" font-weight="900" font-size="50" fill="#f2f2f2" text-anchor="middle">77</text></svg>`,
    { size: 256 },
  ),
  warn: svg(
    `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="5"/><polygon points="52,26 36,54 48,54 42,76 62,44 50,44 56,26" fill="#111"/></svg>`,
    { size: 192 },
  ),
  brand: svg(
    `<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#15161a" stroke="#ff2bd6" stroke-width="4"/><polyline points="22,60 48,30 74,60" fill="none" stroke="#2bf0ff" stroke-width="9"/><polyline points="32,74 48,54 64,74" fill="none" stroke="#ff2bd6" stroke-width="7"/></svg>`,
    { size: 192 },
  ),
  hud: svg(
    `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><g stroke="#0f4b5a">${[20, 40, 60, 80, 100, 120, 140].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`).join("")}${[20, 40, 60, 80].map((y) => `<line x1="0" y1="${y}" x2="160" y2="${y}"/>`).join("")}</g><circle cx="80" cy="50" r="22" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#ff2bd6"/><rect x="8" y="78" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="78" width="44" height="6" fill="#2bf0ff"/><text x="152" y="18" font-family="monospace" font-size="12" fill="#2bf0ff" text-anchor="end">SYS OK</text></svg>`,
    { size: 256 },
  ),
  sign: svg(
    `<svg viewBox="0 0 160 48"><rect width="160" height="48" fill="#12081a"/><text x="80" y="36" font-family="Arial Black,Arial" font-weight="900" font-size="32" fill="#ff2bd6" text-anchor="middle" stroke="#2bf0ff" stroke-width="1.5">夜 WRAITH</text></svg>`,
    { size: 256 },
  ),
  vent: svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0a0b0d"/>${[4, 10, 16, 22, 28].map((y) => `<rect x="3" y="${y}" width="58" height="3" fill="#444b55"/>`).join("")}</svg>`,
    { size: 128 },
  ),
};

export default function build() {
  const b = createBuilder({ name: "wraith6" });
  const chassis = b.joint("chassis", { at: [0, 0.85, 0], role: "spine" });

  const bx = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at, ...o });
  const cy = (r: number, h: number, sides: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone: chassis, at, flat: true, ...o });
  const rod = (a: number[], c: number[], r: number, color: any, o: any = {}) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const plane = (t: THREE.Texture, w: number, h: number, at: number[], dir: number[], lit = 0, up?: number[]) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: t, up });
    if (lit) glow(p, lit);
    return p;
  };

  // ---------- frame & underbody
  for (const s of [1, -1]) {
    bx(0.14, 0.2, 7.4, DARK, [s * 0.65, 0.78, 0]);
    rod([s * 1.12, 0.62, -2.8], [s * 1.12, 0.62, 2.9], 0.05, STEEL);
  }
  for (const z of [-3.2, -1.8, -0.3, 1.2, 2.8]) bx(1.5, 0.12, 0.12, DARK, [0, 0.76, z]);
  rod([0, 0.7, 2.4], [0, 0.7, -2.2], 0.07, STEEL); // driveshaft
  cy(0.18, 0.9, 10, STEEL, [0, 0.66, 0.8], { rotation: [90, 0, 0] });

  // ---------- lower hull
  bx(2.3, 0.55, 7.0, GRIME, [0, 1.05, 0]);
  bx(2.38, 0.08, 7.1, TRIM, [0, 1.34, 0]);
  // ---------- nose & cab
  b.frustumBox([0, 1.55, 1.2], [0, 1.45, 3.55], [2.4, 0.9], [2.1, 0.55], { bone: chassis, color: HULL });
  bx(1.9, 0.06, 1.6, HULL2, [0, 2.02, 2.3], { rotation: [-8, 0, 0] }); // hood plate
  bx(0.12, 0.08, 1.5, TRIM, [0, 2.07, 2.3]);
  b.frustumBox([0, 2.0, 0.55], [0, 2.1, 1.5], [2.4, 0.8], [2.2, 0.7], { bone: chassis, color: HULL2 }); // cab
  bx(2.0, 0.6, 0.06, CYAN, [0, 2.12, 1.88], { rotation: [-32, 0, 0] }); // windscreen frame glass
  glow(b.part(new THREE.BoxGeometry(1.84, 0.5, 0.04), "#4fdcff", { bone: chassis, at: [0, 2.12, 1.92], rotation: [-32, 0, 0] }), 0.8);
  for (const s of [1, -1]) {
    bx(0.05, 0.4, 0.9, "#4fdcff", [s * 1.17, 2.1, 1.0]);
    glow(b.part(new THREE.BoxGeometry(0.04, 0.34, 0.8), "#2b9cff", { bone: chassis, at: [s * 1.2, 2.1, 1.0] }), 0.7);
    bx(0.08, 0.5, 0.08, TRIM, [s * 1.17, 2.1, 1.5], { rotation: [-30, 0, 0] });
    // doors
    const door = b.joint(`door${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 1.2, 1.8, 1.5], dir: [0, 1, 0], role: "hinge" });
    b.part(new THREE.BoxGeometry(0.06, 0.12, 1.1), TRIM, { bone: door, at: [s * 1.22, 1.78, 1.0] });
    b.part(new THREE.BoxGeometry(0.1, 0.06, 0.2), STEEL, { bone: door, at: [s * 1.25, 1.75, 0.6] });
    // side mirrors with camera
    rod([s * 1.2, 2.1, 1.7], [s * 1.55, 2.2, 1.75], 0.03, STEEL);
    b.part(new THREE.SphereGeometry(0.1, 6, 4), DARK, { bone: chassis, at: [s * 1.6, 2.2, 1.78], flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), CYAN, { bone: chassis, at: [s * 1.6, 2.2, 1.88], rotation: [90, 0, 0] }), 1.3);
    // hood intake decals
    plane(tex.vent, 0.8, 0.4, [s * 0.5, 1.8, 3.02], [0, 0, 1]);
    // headlights slit
    bx(0.7, 0.14, 0.12, DARK, [s * 0.75, 1.55, 3.55]);
    glow(b.part(new THREE.BoxGeometry(0.62, 0.06, 0.04), "#bffcff", { bone: chassis, at: [s * 0.75, 1.55, 3.62] }), 1.8);
    bx(0.7, 0.05, 0.2, TRIM, [s * 0.75, 1.66, 3.55]);
    // fender flares with bolts
    bx(0.3, 0.1, 1.4, TRIM, [s * 1.3, 1.2, 2.4]);
    bx(0.3, 0.1, 1.4, TRIM, [s * 1.3, 1.2, -0.4]);
    bx(0.3, 0.1, 1.4, TRIM, [s * 1.3, 1.2, -2.2]);
    // skirts angled
    for (let i = 0; i < 3; i++) {
      const zc = 1.0 - i * 1.5 + 0.1;
      bx(0.05, 0.45, 1.1, HULL2, [s * 1.35, 0.9, zc - 0.5], { rotation: [0, 0, s * 14] });
      for (const dz of [-0.4, 0.4]) cy(0.03, 0.03, 6, STEEL, [s * 1.42, 1.0, zc - 0.5 + dz], { rotation: [0, 0, 90] });
    }
    // neon underglow & flank strips
    glow(rod([s * 1.0, 0.6, -3.2], [s * 1.0, 0.6, 3.2], 0.025, NEON, { caps: "flat" }), 1.8);
    glow(rod([s * 1.3, 1.42, -3.3], [s * 1.3, 1.42, 1.0], 0.02, CYAN, { caps: "flat" }), 1.6);
    // exhaust stacks behind cab
    rod([s * 1.0, 1.4, 0.3], [s * 1.0, 3.0, 0.3], 0.1, STEEL, { sides: 8 });
    cy(0.14, 0.5, 8, HULL2, [s * 1.0, 1.9, 0.3]);
    cy(0.12, 0.05, 8, DARK, [s * 1.0, 3.03, 0.3]);
    glow(cy(0.07, 0.02, 8, AMBER, [s * 1.0, 3.0, 0.3]), 1.5);
    // cargo-side decals and ribs
    plane(tex.number, 0.9, 0.5, [s * 1.222, 1.95, -1.9], [s, 0, 0]);
    plane(tex.brand, 0.5, 0.5, [s * 1.222, 1.95, -0.6], [s, 0, 0], 1.1);
    plane(tex.sign, 1.2, 0.36, [s * 1.222, 1.55, -1.2], [s, 0, 0], 1.2);
    for (const z of [-3.2, -2.5, -0.1]) bx(0.1, 1.2, 0.12, TRIM, [s * 1.22, 1.9, z]);
    for (let i = 0; i < 4; i++) cy(0.04, 0.1, 6, STEEL, [s * 1.27, 1.2 + i * 0.35, -2.6], { rotation: [0, 0, 90] });
    // missile pods on cargo roof edge
    bx(0.7, 0.55, 1.5, HULL2, [s * 0.85, 2.85, -2.4]);
    for (const dx of [-0.15, 0.15])
      for (const dy of [-0.14, 0.14]) {
        cy(0.1, 0.06, 8, DARK, [s * 0.85 + dx, 2.85 + dy, -1.65], { rotation: [90, 0, 0] });
        b.spike([s * 0.85 + dx, 2.85 + dy, -1.65], [0, 0, 1], 0.2, 0.07, RED, { bone: chassis, sides: 6 });
      }
    // rear thrusters
    b.lathe(
      [[0, 0], [0.24, 0], [0.2, 0.1], [0.36, 0.55], [0.3, 0.55], [0.15, 0.12], [0, 0.14]],
      { at: [s * 0.7, 1.15, -3.5], axis: [0, 0.0, -1], segments: 8, bone: chassis, color: STEEL },
    );
    glow(cy(0.13, 0.03, 8, "#6ab7ff", [s * 0.7, 1.15, -3.55], { rotation: [90, 0, 0] }), 2);
    // tail lights
    glow(bx(0.6, 0.08, 0.04, RED, [s * 0.75, 1.5, -3.52]), 1.8);
  }

  // ---------- front bumper with spikes, winch, hazard stripes
  bx(2.6, 0.32, 0.3, HAZARD, [0, 1.0, 3.7]);
  bx(2.7, 0.1, 0.34, TRIM, [0, 1.2, 3.7]);
  for (let i = 0; i < 7; i++) b.spike([-1.2 + i * 0.4, 1.0, 3.85], [0, 0, 1], 0.32, 0.06, STEEL, { bone: chassis, sides: 5 });
  cy(0.12, 0.7, 8, STEEL, [0, 1.35, 3.55], { rotation: [0, 0, 90] }); // winch drum
  bx(0.9, 0.2, 0.12, DARK, [0, 1.3, 3.62]);
  // grille glow
  bx(1.3, 0.35, 0.08, DARK, [0, 1.62, 3.58]);
  for (let i = 0; i < 5; i++) glow(bx(1.2, 0.025, 0.02, NEON, [0, 1.5 + i * 0.07, 3.63]), 1.4);
  // rear bumper & plates
  bx(2.6, 0.3, 0.25, HAZARD, [0, 0.95, -3.65]);
  plane(tex.warn, 0.5, 0.5, [0, 1.8, -3.52], [0, 0, -1]);
  plane(tex.hud, 0.9, 0.56, [0, 2.35, -3.52], [0, 0, -1], 1.2);
  // tailgate hatch joint
  const gate = b.joint("tailgate", { parent: chassis, at: [0, 1.15, -3.52], dir: [1, 0, 0], up: [0, 1, 0], role: "hinge" });
  bx(1.8, 0.1, 0.06, TRIM, [0, 1.15, -3.54], { bone: gate });

  // ---------- cargo module
  bx(2.5, 1.5, 3.7, HULL, [0, 2.0, -1.65]);
  bx(2.56, 0.1, 3.76, TRIM, [0, 2.8, -1.65]);
  bx(2.56, 0.1, 3.76, TRIM, [0, 1.3, -1.65]);
  for (let i = 0; i < 5; i++) bx(2.0, 0.04, 0.5, i % 2 ? HULL2 : HULL, [0, 2.87, -0.4 - i * 0.7]);
  // roof hatch w/ joint
  const hatch = b.joint("roofHatch", { parent: chassis, at: [0, 2.9, -2.9], dir: [1, 0, 0], up: [0, 1, 0], role: "hinge" });
  cy(0.35, 0.06, 10, HULL2, [0, 2.95, -2.55], { bone: hatch });
  bx(0.3, 0.05, 0.08, STEEL, [0, 3.0, -2.55], { bone: hatch });

  // ---------- roof turret: railgun
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.9, -0.9], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.35, -0.9], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.5, 0.05, 6, 14), STEEL, { bone: chassis, at: [0, 2.93, -0.9], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.25, 10), HULL2, { bone: yaw, at: [0, 3.05, -0.9], flat: true });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.08, 0.5, 0.5), HULL2, { bone: yaw, at: [s * 0.3, 3.35, -0.9] });
  b.part(new THREE.BoxGeometry(0.5, 0.36, 0.8), DARK, { bone: pitch, at: [0, 3.35, -1.1] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.12, 2.2), STEEL, { bone: pitch, at: [s * 0.09, 3.35, 0.4] });
    for (const dz of [-0.2, 0.3]) b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 8), TRIM, { bone: pitch, at: [s * 0.28, 3.3, dz], rotation: [90, 0, 0], flat: true });
  }
  glow(b.part(new THREE.BoxGeometry(0.1, 0.04, 2.1), CYAN, { bone: pitch, at: [0, 3.35, 0.4] }), 2);
  for (let i = 0; i < 4; i++) glow(b.part(new THREE.TorusGeometry(0.16, 0.02, 5, 10), NEON, { bone: pitch, at: [0, 3.35, -0.1 + i * 0.5] }), 1.5);
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.1), STEEL, { bone: pitch, at: [0, 3.35, 1.55] });

  // ---------- roof gear: light bar, antennas, dish, sensor dome
  bx(1.6, 0.1, 0.16, DARK, [0, 2.78, 1.45]);
  for (let i = 0; i < 6; i++) glow(bx(0.2, 0.06, 0.05, i % 2 ? RED : "#3b6bff", [-0.65 + i * 0.26, 2.8, 1.55]), 2);
  for (const [x, z, h] of [[-1.0, -3.1, 2.4], [1.0, -3.1, 1.6]]) {
    b.spike([x, 2.9, z], [0, 1, 0], h, 0.025, STEEL, { bone: chassis, sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: chassis, at: [x, 2.9 + h, z] }), 2);
  }
  rod([0.9, 2.9, -0.2], [0.9, 3.3, -0.2], 0.05, STEEL);
  b.lathe([[0, 0], [0.4, 0.14], [0.4, 0.17], [0, 0.04]], { at: [0.9, 3.3, -0.2], axis: [0.3, 0.8, 0.5], segments: 12, bone: chassis, color: HULL2 });
  b.part(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#4fdcff", { bone: chassis, at: [-0.8, 2.85, 0.4], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { bone: chassis, at: [-0.8, 2.95, 0.4] }), 1.5);
  // cables roof to cab
  b.sweep(catmull([[-0.5, 2.82, 0.1], [-0.3, 2.7, 0.3], [-0.5, 2.45, 0.5]]), 0.02, DARK, { bone: chassis, sides: 5 });

  // ---------- wheels
  const lugGeo = new THREE.BoxGeometry(0.5, 0.12, 0.18);
  for (const [k, s, z] of [["F1", 1, 2.4], ["F2", -1, 2.4], ["M1", 1, -0.4], ["M2", -1, -0.4], ["R1", 1, -2.2], ["R2", -1, -2.2]] as [string, number, number][]) {
    const W = b.joint(`wheel${k}`, { parent: chassis, at: [s * 1.2, 0.55, z], dir: [0, 1, 0], role: "hinge" });
    const at = [s * 1.2, 0.55, z];
    const wp = (g: THREE.BufferGeometry, c: any, o: any = {}) => b.part(g, c, { bone: W, at, flat: true, ...o });
    wp(new THREE.CylinderGeometry(0.5, 0.5, 0.52, 14), "#16181b", { rotation: [0, 0, 90] });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      b.part(lugGeo, "#0e0f11", {
        bone: W,
        at: [at[0] + (i % 2 ? 0.1 : -0.1), at[1] + 0.52 * Math.cos(a), at[2] + 0.52 * Math.sin(a)],
        rotation: [(a * 180) / Math.PI, 0, 0],
        flat: true,
      });
    }
    wp(new THREE.CylinderGeometry(0.3, 0.3, 0.56, 10), "#4b5159", { rotation: [0, 0, 90] });
    wp(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 12), STEEL, { at: [at[0] + s * 0.27, at[1], at[2]], rotation: [0, 0, 90] });
    glow(wp(new THREE.TorusGeometry(0.27, 0.014, 5, 16), k[0] === "M" ? CYAN : NEON, { at: [at[0] + s * 0.31, at[1], at[2]], rotation: [0, 90, 0], flat: false }), 1.8);
    wp(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), DARK, { at: [at[0] + s * 0.33, at[1], at[2]], rotation: [0, 0, 90] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), STEEL, {
        bone: W,
        at: [at[0] + s * 0.32, at[1] + 0.18 * Math.cos(a), at[2] + 0.18 * Math.sin(a)],
        rotation: [0, 0, 90],
      });
    }
    // suspension link
    rod([s * 0.7, 0.8, z], [s * 1.1, 0.58, z], 0.05, STEEL);
    rod([s * 0.7, 0.62, z + 0.25], [s * 1.1, 0.5, z], 0.03, STEEL);
    // mud flap
    bx(0.04, 0.4, 0.5, "#0e0f11", [s * 1.5, 0.75, z - 0.65]);
  }

  // ---------- extra greeble: roof cable, jerrycans, ladder
  for (let i = 0; i < 2; i++) bx(0.22, 0.34, 0.4, "#4b5a2a", [-1.0 + i * 0.3, 3.05, -1.9 - i * 0.0]);
  for (const s of [1, -1]) {
    rod([s * 1.28, 1.4, -3.4], [s * 1.28, 2.8, -3.4], 0.03, STEEL);
  }
  for (let i = 0; i < 8; i++) rod([-1.28, 1.5 + i * 0.17, -3.42], [1.28, 1.5 + i * 0.17, -3.42], 0.008, DARK, { sides: 4 });
  return b.root;
}
