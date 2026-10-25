/*
BUILD SHEET — "Warhound MTV-77", armored 8x8 militarized truck, 2077
Proportions: length 9.8 m (z -5.0..4.8), width 3.6 m over tyres, height ~3.9 m to turret top.
Masses: wedge cab 2.5 m long x 2.8 wide x 1.5 tall (extruded side profile); armored cargo bed 7.0 x 3.0 x 1.0;
 chamfer bars on top edges; dual-railgun turret on the bed; 8 tyres r=0.72 on 4 axles; ladder chassis.
Parts: wheels (tyre, 12 tread lugs, hub, glow ring, bolts) x8, axles + diffs, rails, belly plate, fenders,
 side tanks with straps, cab with windshield/side glass/grille/headlights/bumper plow, roof radar, light bar,
 antennas, smoke launchers, mirrors, reactive-armor tiles, decals, turret + barrels + coils + missile pods,
 rear ramp, tail lights, hitch, cables.
Palette: hull olive-black #2c3326/#232a22 (mottled panelled paint), iron metal frames, gunmetal #3a3f47 barrels,
 tyre #16181c, hazard yellow #f2c400, neon cyan #19f0ff (glow rings, underglow, coils), neon magenta #ff2bd6
 (side strips), red #ff2a2a (tail, sensors), amber #ffb040 (headlights).
Signature features: wedge angular cab with HUD windshield texture; twin railgun with glowing coil rings;
 neon underglow + side strips; hazard stripes, unit stencil and wolf emblem decals; reactive armor tile rows.
*/
import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { mottle } from "../../../../src/index";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Warhound MTV-77",
  description: "Low-poly cyberpunk armored 8x8 military truck from 2077 with railgun turret, neon trim and decals.",
};

const DEG = Math.PI / 180;
const CYAN = "#19f0ff", MAG = "#ff2bd6", RED = "#ff2a2a", AMBER = "#ffb040", YEL = "#f2c400";
const TYRE = "#16181c", GUN = "#3a3f47", DARK = "#101216", PLATE = "#4a5240";

// ---- textures
const stripesSvg = () => {
  let s = "";
  for (let i = -2; i < 14; i++) s += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="#111"/>`;
  return `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${YEL}"/>${s}<rect width="64" height="16" fill="none" stroke="#111" stroke-width="2"/></svg>`;
};
const HAZARD = svg(stripesSvg(), { size: 256 });
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14181a" stroke="${CYAN}" stroke-width="3"/>
  <polygon points="12,16 24,24 32,20 40,24 52,16 48,36 38,50 32,56 26,50 16,36" fill="#d9dde0" stroke="#000" stroke-width="2"/>
  <polygon points="22,32 29,35 27,39" fill="${RED}"/><polygon points="42,32 35,35 37,39" fill="${RED}"/>
  <polygon points="32,44 28,50 36,50" fill="#111"/>
  <path d="M6 32 A26 26 0 0 1 32 6" stroke="${MAG}" stroke-width="2" fill="none"/></svg>`, { size: 256 });
const UNIT = svg(
  `<svg viewBox="0 0 160 40"><text x="80" y="31" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="34" fill="#e8e8d8" stroke="#111" stroke-width="1.5">MTV-77</text></svg>`,
  { size: 512 });
const GRILLE = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0c0e11"/>${Array.from({ length: 16 }, (_, i) => `<rect x="${2 + i * 3.8}" y="3" width="2" height="18" fill="${i % 4 === 0 ? CYAN : "#2b3038"}"/>`).join("")}<rect x="1" y="1" width="62" height="22" fill="none" stroke="#555c66" stroke-width="2"/></svg>`,
  { size: 256 });
const GLASS = svg(
  `<svg viewBox="0 0 128 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a34"/><stop offset="1" stop-color="#03080c"/></linearGradient></defs>
  <rect width="128" height="40" fill="url(#g)"/><polygon points="10,0 30,0 14,40 -6,40" fill="#6ff" opacity="0.15"/>
  <polygon points="40,0 48,0 32,40 24,40" fill="#6ff" opacity="0.1"/>
  <g stroke="${CYAN}" stroke-width="0.9" fill="none"><path d="M70 28 h28 M70 24 h20 M104 12 h14 M104 16 h10"/><circle cx="64" cy="20" r="9"/><path d="M64 8 v5 M64 27 v5 M52 20 h5 M71 20 h5"/></g>
  <rect x="2" y="2" width="124" height="36" fill="none" stroke="#1d2328" stroke-width="3"/></svg>`, { size: 512 });
const SIDEWIN = svg(
  `<svg viewBox="0 0 64 32"><polygon points="2,30 10,2 62,2 62,30" fill="#06161c" stroke="#222831" stroke-width="3"/><polygon points="14,28 20,6 28,6 22,28" fill="#6ff" opacity="0.15"/></svg>`,
  { size: 256 });
const WARN = svg(
  `<svg viewBox="0 0 32 32"><polygon points="16,2 30,28 2,28" fill="${YEL}" stroke="#111" stroke-width="2"/><rect x="14.5" y="10" width="3" height="10" fill="#111"/><rect x="14.5" y="22" width="3" height="3" fill="#111"/></svg>`,
  { size: 128 });

export default function build() {
  const b = createBuilder({ name: "warhound" });
  const r = rng(11);
  const HULL = panelled(mottle("#303a2a", "#222921", { size: 0.7, contrast: 1.2 }), { size: 0.55, rivets: 0.07 });
  const HULL2 = panelled(mottle("#3a4332", "#2a3126", { size: 0.5 }), { size: 0.4, rivets: 0.06 });
  const IRON = metal("iron"), STEEL = metal("steel", { polish: 0.2 });

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir, ...o });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });

  // ---- chassis
  for (const s of [1, -1]) {
    box(0.3, 0.5, 9.4, IRON, s * 0.75, 1.4, -0.1);
    box(0.08, 0.3, 8.6, CYAN, s * 0.93, 1.1, -0.1, { color: undefined });
    glow(box(0.06, 0.06, 8.4, CYAN, s * 1.0, 1.12, -0.1), 1.6);
  }
  box(1.8, 0.1, 8.8, DARK, 0, 1.12, -0.1);
  for (const z of [3.3, 1.75, -2.2, -3.75]) {
    cyl(0.12, 0.12, 3.1, 8, STEEL, [0, 0.72, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), IRON, { at: [0, 0.72, z] });
    box(1.1, 0.12, 0.16, GUN, 0, 1.1, z); // leaf spring
  }
  // ---- wheels
  for (const s of [1, -1]) {
    for (const z of [3.3, 1.75, -2.2, -3.75]) {
      const cx = s * 1.5, cy = 0.72;
      cyl(0.72, 0.72, 0.62, 14, TYRE, [cx, cy, z], [1, 0, 0]);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        box(0.66, 0.1, 0.2, "#0b0c0e", cx, cy + Math.cos(a) * 0.74, z + Math.sin(a) * 0.74, { rotation: [a / DEG, 0, 0] });
      }
      cyl(0.44, 0.44, 0.66, 10, IRON, [cx, cy, z], [1, 0, 0]);
      cyl(0.36, 0.36, 0.05, 10, GUN, [cx + s * 0.33, cy, z], [s, 0, 0]);
      glow(b.part(new THREE.TorusGeometry(0.3, 0.03, 5, 16), CYAN, { at: [cx + s * 0.37, cy, z], dir: [s, 0, 0], axis: "z" }), 1.5);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.06, 6, STEEL, [cx + s * 0.38, cy + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2], [s, 0, 0]);
      }
      // fender
      box(0.95, 0.1, 1.7, HULL2, cx, 1.55, z);
      box(0.1, 0.34, 1.7, HULL2, s * 1.93, 1.4, z, { rotation: [0, 0, s * -12] });
      box(0.95, 0.1, 0.4, PLATE, cx, 1.5, z + 0.95, { rotation: [-18, 0, 0] });
      box(0.95, 0.1, 0.4, PLATE, cx, 1.5, z - 0.95, { rotation: [18, 0, 0] });
      box(0.06, 0.5, 0.55, DARK, s * 1.85, 0.5, z - 0.9); // mud flap
    }
    // fuel/battery tanks between axles
    cyl(0.3, 0.3, 2.3, 10, HULL, [s * 1.3, 1.0, -0.22], [0, 0, 1]);
    for (const z of [-1.0, -0.2, 0.6]) {
      box(0.1, 0.7, 0.1, IRON, s * 1.3, 1.0, z, { scale: [1, 1, 1] });
      glow(box(0.04, 0.12, 0.12, AMBER, s * 1.6, 1.0, z), 1.4);
    }
    box(0.5, 0.06, 2.3, DARK, s * 1.3, 0.7, -0.22);
  }
  // ---- cab
  const cabOutline: [number, number][] = [[2.3, 1.7], [2.3, 3.2], [3.5, 3.25], [4.2, 2.6], [4.75, 2.35], [4.8, 1.7]];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.8, bevel: 0.04, color: HULL });
  // windshield
  plane(2.3, 0.86, GLASS, [0, 2.925 + 0.01, 3.85 + 0.009], [0, 0.7, 0.65]);
  glow(plane(2.3, 0.86, GLASS, [0, 2.925 + 0.013, 3.85 + 0.012], [0, 0.7, 0.65]), 0.45);
  box(2.45, 0.08, 0.08, DARK, 0, 3.27, 3.52, { rotation: [-43, 0, 0] });
  for (const s of [1, -1]) {
    plane(1.3, 0.65, SIDEWIN, [s * 1.405, 2.62, 3.1], [s, 0, 0]);
    box(0.05, 0.8, 0.05, DARK, s * 1.41, 2.4, 2.45); // door seam
    box(0.05, 0.05, 0.9, DARK, s * 1.41, 1.95, 2.9); // sill line
    box(0.08, 0.06, 0.3, STEEL, s * 1.43, 2.3, 2.55); // handle
    // mirrors
    box(0.05, 0.05, 0.45, IRON, s * 1.55, 2.75, 3.65, { rotation: [0, s * 40, 0] });
    box(0.1, 0.4, 0.22, GUN, s * 1.78, 2.7, 3.85);
    glow(box(0.02, 0.3, 0.16, CYAN, s * 1.73, 2.7, 3.86), 0.8);
    // smoke launchers
    for (let i = 0; i < 3; i++)
      cyl(0.07, 0.07, 0.45, 6, GUN, [s * 1.5, 3.0 + 0.05, 2.5 + i * 0.17], [s * 0.5, 0.8, 0]);
    box(0.2, 0.2, 0.6, IRON, s * 1.45, 2.85, 2.68);
    // headlights
    glow(box(0.7, 0.14, 0.06, AMBER, s * 0.95, 2.12, 4.82), 1.6);
    glow(box(0.3, 0.08, 0.06, CYAN, s * 1.2, 1.88, 4.84), 1.4);
    // tow hooks & plow teeth
    box(0.12, 0.12, 0.3, YEL, s * 1.0, 1.4, 5.0);
    // cab side armor tiles
    for (let i = 0; i < 4; i++)
      box(0.06, 0.28, 0.36, r() > 0.5 ? PLATE : "#2a3126", s * 1.43, 2.05, 2.55 + i * 0.5);
    // side step
    box(0.3, 0.06, 0.9, STEEL, s * 1.55, 1.55, 3.0);
  }
  plane(2.3, 0.45, GRILLE, [0, 2.0, 4.81], [0, 0, 1]);
  // bumper plow
  box(3.0, 0.5, 0.4, HULL2, 0, 1.45, 4.95);
  box(3.2, 0.3, 0.3, IRON, 0, 1.2, 5.0, { rotation: [-15, 0, 0] });
  for (let i = -5; i <= 5; i++) b.part(new THREE.ConeGeometry(0.1, 0.3, 4), GUN, { at: [i * 0.28, 1.2, 5.25], dir: [0, -0.2, 1] });
  plane(1.2, 0.3, HAZARD, [0, 1.48, 5.16], [0, 0, 1]);
  cyl(0.15, 0.15, 0.4, 8, STEEL, [0, 1.45, 5.15], [0, 0, 1]); // winch
  // hood vents
  for (let i = 0; i < 4; i++) box(1.2, 0.02, 0.07, DARK, 0, 2.52 - i * 0.03 + 0.0, 4.25 + i * 0.12, { rotation: [-24, 0, 0] });
  glow(box(1.0, 0.03, 0.05, CYAN, 0, 2.58, 4.2, { rotation: [-24, 0, 0] }), 1.2);
  // roof gear
  box(2.4, 0.12, 1.1, HULL2, 0, 3.3, 2.9);
  for (let i = 0; i < 5; i++) glow(box(0.4, 0.1, 0.12, i % 2 ? "#2a6bff" : RED, -0.8 + i * 0.4, 3.42, 3.3), 1.8);
  b.lathe([[0, 0], [0.3, 0], [0.3, 0.05], [0.15, 0.22], [0, 0.25]], { at: [0.65, 3.36, 2.6], color: GUN });
  cyl(0.03, 0.03, 0.2, 6, IRON, [0.65, 3.42, 2.6], [0, 1, 0]);
  for (let i = 0; i < 3; i++) {
    cyl(0.015, 0.015, 1.4 + i * 0.5, 5, DARK, [-0.9 + i * 0.12, 3.3 + (0.7 + i * 0.25), 2.5 - i * 0.15], [0, 1, 0]);
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [-0.9 + i * 0.12, 3.3 + 1.4 + i * 0.5, 2.5 - i * 0.15] }), 1.5);
  }
  box(0.4, 0.25, 0.4, GUN, -0.6, 3.5, 2.4);
  glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), RED, { at: [-0.6, 3.5, 2.62] }), 2);
  for (const s of [1, -1]) { // spotlights
    box(0.3, 0.2, 0.3, DARK, s * 1.0, 3.45, 3.2);
    glow(box(0.22, 0.14, 0.04, "#e8ffff", s * 1.0, 3.45, 3.36), 1.8);
  }

  // ---- cargo bed
  box(3.0, 1.0, 7.0, HULL, 0, 2.2, -1.45);
  for (const s of [1, -1]) {
    box(0.5, 0.5, 7.0, HULL2, s * 1.28, 2.78, -1.45, { rotation: [0, 0, s * 45] });
    glow(box(0.04, 0.08, 6.7, MAG, s * 1.52, 1.82, -1.45), 1.6);
    // armor tile rows
    for (let i = 0; i < 12; i++) {
      const z = -4.5 + i * 0.55;
      const c = r() > 0.5 ? PLATE : "#262b22";
      box(0.06, 0.26, 0.46, c, s * 1.52, 2.5, z);
      if (i > 5 || i < 3) box(0.06, 0.26, 0.46, r() > 0.5 ? PLATE : "#262b22", s * 1.52, 1.95, z);
    }
    // vents
    for (let i = 0; i < 4; i++) box(0.04, 0.05, 0.9, DARK, s * 1.52, 2.1 + i * 0.07, -2.7 - 0.0);
    // decals
    plane(1.1, 1.1, EMBLEM, [s * 1.54, 2.2, 0.7], [s, 0, 0]);
    plane(1.8, 0.45, UNIT, [s * 1.54, 2.2, -1.1], [s, 0, 0]);
    plane(0.4, 0.4, WARN, [s * 1.54, 2.2, -2.5], [s, 0, 0]);
    plane(0.4, 0.4, WARN, [s * 1.54, 2.2, 1.6], [s, 0, 0]);
    plane(1.4, 0.35, HAZARD, [s * 1.54, 2.2, -4.0], [s, 0, 0]);
    // bed grab rails
    for (let i = 0; i < 4; i++) cyl(0.025, 0.025, 0.4, 5, STEEL, [s * 1.46, 3.0, -4 + i * 1.8], [0, 1, 0]);
  }
  box(2.4, 0.1, 6.6, GUN, 0, 2.75, -1.45);
  // roof hatches & crates
  cyl(0.35, 0.35, 0.12, 8, IRON, [0.0, 2.85, 1.2], [0, 1, 0]);
  box(0.8, 0.3, 0.6, PLATE, 0.0, 2.95, -4.1);
  box(0.8, 0.3, 0.6, PLATE, 0.0, 2.95, -3.4);
  glow(box(0.6, 0.04, 0.4, CYAN, 0, 3.12, -3.75), 1.2);
  // rear
  plane(3.0, 0.5, HAZARD, [0, 2.25, -4.96], [0, 0, -1]);
  box(2.6, 0.7, 0.1, DARK, 0, 2.3, -4.98);
  box(3.1, 0.35, 0.4, IRON, 0, 1.4, -5.0);
  for (const s of [1, -1]) {
    glow(box(0.6, 0.12, 0.05, RED, s * 1.0, 1.4, -5.22), 1.8);
    glow(box(0.5, 0.1, 0.05, RED, s * 1.0, 2.7, -5.0), 1.5);
  }
  cyl(0.1, 0.1, 0.35, 8, STEEL, [0, 1.35, -5.3], [0, 0, 1]);
  glow(box(1.5, 0.06, 0.05, RED, 0, 2.0, -5.0), 1.6);
  for (const s of [1, -1]) cyl(0.18, 0.18, 0.5, 8, GUN, [s * 1.1, 1.0, -4.7], [0, 0, 1]); // exhaust-less coolant drums
  // ---- turret
  b.lathe([[0, 0], [0.95, 0], [0.95, 0.12], [0.8, 0.16], [0, 0.16]], { at: [0, 2.8, -1.2], color: IRON, segments: 12 });
  b.extrude([[-1.0, 0], [-1.0, 0.75], [0.5, 0.75], [1.1, 0.35], [1.1, 0]], {
    at: [0, 2.96, -1.2], x: [0, 0, 1], thickness: 1.6, bevel: 0.03, color: HULL2,
  });
  glow(box(1.2, 0.04, 0.05, MAG, 0, 3.3, -0.12, { rotation: [-0, 0, 0] }), 1.4);
  box(1.2, 0.3, 0.3, GUN, 0, 3.0, -0.0);
  for (const s of [1, -1]) {
    box(0.36, 0.34, 1.6, GUN, s * 0.35, 3.3, 0.35);
    cyl(0.08, 0.08, 3.0, 8, STEEL, [s * 0.35, 3.3, 1.8], [0, 0, 1]);
    for (let i = 0; i < 5; i++)
      glow(b.part(new THREE.TorusGeometry(0.14, 0.025, 5, 12), CYAN, { at: [s * 0.35, 3.3, 0.5 + i * 0.35], dir: [0, 0, 1], axis: "z" }), 1.8);
    box(0.2, 0.2, 0.3, DARK, s * 0.35, 3.3, 3.35);
    // missile pods
    box(0.5, 0.55, 1.2, HULL, s * 1.15, 3.35, -0.8);
    for (const dx of [-0.12, 0.12]) for (const dy of [-0.13, 0.13]) {
      cyl(0.07, 0.07, 0.1, 6, DARK, [s * 1.15 + dx, 3.35 + dy, -0.2], [0, 0, 1]);
      b.part(new THREE.ConeGeometry(0.065, 0.2, 6), RED, { at: [s * 1.15 + dx, 3.35 + dy, -0.18], dir: [0, 0, 1] });
    }
  }
  box(0.4, 0.3, 0.5, GUN, 0, 3.8, -1.5);
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), RED, { at: [0, 3.8, -1.22] }), 2);
  glow(box(0.2, 0.05, 0.03, CYAN, 0, 3.7, -1.24), 1.5);
  cyl(0.02, 0.02, 1.0, 5, DARK, [-0.5, 4.2, -1.9], [0, 1, 0]);
  // ---- cables
  for (const s of [1, -1])
    b.sweep(catmull([[s * 0.3, 3.2, 2.3], [s * 0.4, 3.0, 1.5], [s * 0.6, 3.0, -0.5], [s * 0.4, 2.95, -1.0]]), 0.025, { color: DARK });
  // underglow
  glow(box(1.8, 0.04, 0.05, CYAN, 0, 0.5, 4.5), 1.4);
  glow(box(1.8, 0.04, 0.05, CYAN, 0, 0.5, -4.7), 1.4);

  return b.root;
}
