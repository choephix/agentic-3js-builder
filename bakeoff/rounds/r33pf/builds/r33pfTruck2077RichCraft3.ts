import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { mottle, paint, svg, rng } from "../../../../src/index";
import { panelled, INK } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Warhog 2077",
  description: "Low-poly cyberpunk militarized six-wheel assault truck with turret, rocket pods and neon trim.",
};

const GUN = "#2b313b", DARK = "#14171d", TIRE = "#0d0e11", STEEL = "#6b7686", OLIVE = "#4a5240";
const CYAN = "#19f2ff", MAG = "#ff2d9a", AMBER = "#ffb02e", RED = "#ff2a3a";

export default function build() {
  const b = createBuilder({ name: "warhog2077", paintSize: 2048 });
  const R = rng(77);

  // ---------- textures ----------
  const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b81c"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 6} 16 l8 -16 l5 0 l-8 16z" fill="#16181d"/>`).join("")}</svg>`, { size: 256 });
  const EMBLEM = svg(`<svg viewBox="0 0 160 80"><rect width="160" height="80" rx="6" fill="#0b0d12" opacity="0.85"/>
    <path d="M8 8 H152 V72 H8Z" fill="none" stroke="${CYAN}" stroke-width="3"/>
    <text x="80" y="48" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="34" fill="${CYAN}">2077</text>
    <path d="M18 62 H142" stroke="${MAG}" stroke-width="4"/><path d="M18 16 h30 M112 16 h30" stroke="${MAG}" stroke-width="3"/></svg>`, { size: 256 });
  const HUD = svg(`<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#052a33"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M0 ${i * 12} H128" stroke="#0a6a7a" stroke-width="1"/>`).join("")}
    <path d="M10 50 L40 20 L70 40 L118 8" stroke="${CYAN}" stroke-width="3" fill="none"/>
    <circle cx="96" cy="34" r="12" fill="none" stroke="${AMBER}" stroke-width="2.5"/><path d="M96 18v32M80 34h32" stroke="${AMBER}" stroke-width="1.5"/></svg>`, { size: 256 });
  const REARDOOR = svg(`<svg viewBox="0 0 100 80"><rect width="100" height="80" fill="#1b2029"/>
    <path d="M50 0V80" stroke="#05060a" stroke-width="3"/><rect x="6" y="6" width="88" height="68" fill="none" stroke="${RED}" stroke-width="2.5"/>
    <path d="M12 20 H44 M56 20 H88 M12 60 H44 M56 60 H88" stroke="${RED}" stroke-width="3"/>
    <circle cx="42" cy="40" r="4" fill="${RED}"/><circle cx="58" cy="40" r="4" fill="${RED}"/></svg>`, { size: 256 });
  const PODS = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#20252d"/>
    ${[0, 1, 2, 3].flatMap((i) => [0, 1].map((j) => `<circle cx="${8 + i * 16}" cy="${8 + j * 16}" r="6" fill="#050608" stroke="${AMBER}" stroke-width="1.5"/>`)).join("")}</svg>`, { size: 256 });
  const VENT = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#0b0d11"/>${[3, 9, 15, 21, 27].map((y) => `<rect x="2" y="${y}" width="28" height="3" fill="#3b4452"/>`).join("")}</svg>`, { size: 128 });

  // ---------- paints ----------
  const HULL = panelled(mottle("#39424f", "#2a303a", { size: 0.6, seed: 3 }), { size: 0.55, rivets: 0.14, seam: INK });
  const CAMO = panelled(mottle(OLIVE, "#363c30", { size: 0.5, seed: 9 }), { size: 0.6, rivets: 0.15 });
  const WEAR = paint((p, n) => (n.y > 0.6 ? "#4b5666" : p.y < 0.9 ? "#17191e" : "#2a303a"));

  // ---------- helpers ----------
  type Opt = Record<string, unknown>;
  const bx = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, x: number, y: number, z: number, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { at: [x, y, z], rotation: rot });
  const gl = (w: number, h: number, d: number, col: string, x: number, y: number, z: number, s = 1.4, o: Opt = {}) =>
    glow(bx(w, h, d, col, x, y, z, o), s);
  const plane = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], up?: number[], g = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });
    if (g) glow(p, g);
    return p;
  };

  // ---------- chassis ----------
  bx(1.9, 0.7, 7.0, DARK, 0, 0.9, -0.2);
  bx(1.2, 0.3, 7.2, GUN, 0, 0.55, -0.2);
  for (const z of [2.5, -0.6, -2.2]) {
    cyl(0.12, 0.12, 2.9, 8, STEEL, 0, 0.62, z, [0, 0, 90]); // axles
    bx(0.9, 0.35, 0.5, GUN, 0, 0.62, z); // diff housings
  }
  // underglow
  for (const s of [1, -1]) gl(0.06, 0.05, 6.4, CYAN, s * 1.0, 0.36, -0.2, 1.6);
  gl(1.8, 0.05, 0.06, MAG, 0, 0.38, 3.45, 1.6);
  gl(1.8, 0.05, 0.06, MAG, 0, 0.38, -3.75, 1.6);

  // ---------- wheels ----------
  for (const s of [1, -1])
    for (const z of [2.5, -0.6, -2.2]) {
      const x = s * 1.3;
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.52, 12), TIRE, { at: [x, 0.62, z], rotation: [0, 0, 90], flat: true });
      b.part(new THREE.CylinderGeometry(0.64, 0.64, 0.16, 12), "#1b1e24", { at: [x, 0.62, z], rotation: [0, 0, 90], flat: true });
      b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.56, 8), STEEL, { at: [x, 0.62, z], rotation: [0, 0, 90], flat: true });
      glow(b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.58, 8), CYAN, { at: [x, 0.62, z], rotation: [0, 0, 90], flat: true }), 1.2);
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.62, 6), DARK, { at: [x, 0.62, z], rotation: [0, 0, 90] });
      for (let i = 0; i < 6; i++) { // lug nuts
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 5), DARK, { at: [x + s * 0.3, 0.62 + Math.sin(a) * 0.29, z + Math.cos(a) * 0.29], rotation: [0, 0, 90] });
      }
      // fender + flap
      bx(0.78, 0.08, 1.45, GUN, s * 1.3, 1.34, z);
      bx(0.78, 0.5, 0.06, DARK, s * 1.3, 0.55, z - 0.75);
    }
  // side skirts armor
  for (const s of [1, -1]) {
    bx(0.12, 0.5, 1.15, WEAR, s * 1.3, 0.95, 0.95);
    bx(0.12, 0.5, 0.8, WEAR, s * 1.3, 0.95, -1.4);
    bx(0.12, 0.25, 1.0, HAZARD && WEAR, s * 1.3, 1.1, -3.2);
    bx(0.08, 0.06, 0.8, HAZARD as any, s * 1.35, 0.8, -1.4, { texture: HAZARD });
  }

  // ---------- cargo body ----------
  bx(2.5, 1.8, 4.5, HULL, 0, 2.2, -1.5);
  bx(2.58, 0.14, 4.6, GUN, 0, 3.15, -1.5); // roof plate
  bx(2.58, 0.14, 4.6, GUN, 0, 1.33, -1.5);
  // armor ribs
  for (let i = 0; i < 6; i++)
    for (const s of [1, -1]) bx(0.08, 1.7, 0.1, DARK, s * 1.27, 2.2, -3.4 + i * 0.85);
  for (const s of [1, -1]) {
    bx(0.06, 0.12, 4.4, DARK, s * 1.27, 1.6, -1.5);
    bx(0.06, 0.12, 4.4, DARK, s * 1.27, 2.85, -1.5);
    gl(0.05, 0.07, 4.2, s > 0 ? CYAN : MAG, s * 1.3, 2.2, -1.5, 1.8);
    plane(EMBLEM, 1.3, 0.65, [s * 1.285, 2.6, -2.2], [s, 0, 0], undefined, 1.0);
    plane(VENT, 0.7, 0.7, [s * 1.285, 1.85, -0.35], [s, 0, 0]);
  }
  // rear
  plane(REARDOOR, 2.2, 1.6, [0, 2.2, -3.77], [0, 0, -1], undefined, 0.8);
  bx(2.6, 0.18, 0.18, HAZARD as any, 0, 1.4, -3.78, { texture: HAZARD });
  for (const s of [1, -1]) {
    gl(0.18, 0.5, 0.1, RED, s * 1.05, 2.9, -3.78, 2);
    cyl(0.28, 0.2, 0.5, 8, DARK, s * 0.7, 0.95, -3.85, [90, 0, 0]);
    glow(b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 8), CYAN, { at: [s * 0.7, 0.95, -4.1], rotation: [90, 0, 0] }), 2); // thrusters
  }
  // roof gear: rocket pods
  for (const s of [1, -1]) {
    bx(0.9, 0.55, 1.5, GUN, s * 0.65, 3.5, -2.2);
    bx(0.88, 0.02, 1.0, "#ffffff", s * 0.65, 3.5, -1.43, { texture: PODS });
    plane(PODS, 0.85, 0.5, [s * 0.65, 3.5, -1.46], [0, 0, 1]);
    for (let i = 0; i < 4; i++) cyl(0.07, 0.07, 0.02, 6, AMBER, s * 0.65 + (i - 1.5) * 0.2, 3.5, -1.44, [90, 0, 0]);
    bx(0.9, 0.08, 1.5, DARK, s * 0.65, 3.2, -2.2);
  }
  // solar / radiator panel + vents on roof
  bx(0.9, 0.06, 1.2, "#16324a", 0, 3.27, -1.0, { rotation: [-8, 0, 0] });
  bx(0.9, 0.02, 1.2, CYAN, 0, 3.31, -1.0, { rotation: [-8, 0, 0] }); glow(b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), CYAN, { at: [0, 3.4, -1] }), 1);
  // antennas
  for (const [x, z, h] of [[1.1, -3.4, 1.4], [-1.1, -3.4, 1.0], [0.6, 0.4, 1.7]] as number[][]) {
    cyl(0.025, 0.04, h, 5, STEEL, x, 3.2 + h / 2, z);
    glow(b.part(new THREE.SphereGeometry(0.06, 5, 4), RED, { at: [x, 3.2 + h, z] }), 2);
  }
  // sensor dish
  b.lathe([[0, 0], [0.42, 0.18], [0.4, 0.2], [0, 0.04]], { at: [-0.7, 3.4, -0.1], axis: [0.3, 0.8, 0.5], color: STEEL, segments: 8 });
  cyl(0.04, 0.04, 0.35, 5, DARK, -0.7, 3.3, -0.1);

  // ---------- cab ----------
  const cabProfile: [number, number][] = [[0.9, 1.3], [0.9, 3.0], [2.3, 3.0], [3.05, 2.3], [3.6, 2.1], [3.6, 1.3]];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.06, color: CAMO });
  // roof plate and hood armor
  bx(2.5, 0.1, 1.5, GUN, 0, 3.05, 1.6);
  bx(2.3, 0.08, 0.6, GUN, 0, 2.18, 3.3, { rotation: [0, 0, 0] });
  for (let i = 0; i < 4; i++) bx(1.9, 0.05, 0.1, DARK, 0, 2.14, 3.0 + i * 0.15);
  // windshield
  glow(b.part(new THREE.BoxGeometry(2.1, 0.05, 1.0), "#0a6f86", { at: [0, 2.65 + 0.03, 2.675 + 0.03], rotation: [45, 0, 0] }), 0.5);
  plane(HUD, 1.9, 0.75, [0, 2.7, 2.72], [0, 0.7, 0.7], [0, 1, -1], 0.9);
  bx(2.2, 0.08, 0.06, DARK, 0, 2.97, 2.35, { rotation: [45, 0, 0] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.04, 0.6, 1.1), "#0a6f86", { at: [s * 1.215, 2.55, 1.7] }), 0.6);
    bx(0.08, 0.7, 0.08, DARK, s * 1.22, 2.55, 2.28);
    bx(0.14, 0.9, 0.9, GUN, s * 1.25, 1.75, 1.7); // door armor
    gl(0.05, 0.05, 0.9, AMBER, s * 1.33, 1.5, 1.7, 1.5);
    // mirrors
    bx(0.3, 0.3, 0.08, DARK, s * 1.55, 2.5, 2.45);
    gl(0.26, 0.2, 0.02, CYAN, s * 1.55, 2.5, 2.5, 1);
    cyl(0.03, 0.03, 0.4, 5, STEEL, s * 1.4, 2.5, 2.4, [0, 0, 90]);
    // headlights
    gl(0.55, 0.14, 0.06, CYAN, s * 0.78, 1.9, 3.64, 2.2);
    gl(0.3, 0.1, 0.06, AMBER, s * 0.78, 1.65, 3.64, 1.6);
    // exhaust stacks
    cyl(0.1, 0.12, 2.2, 8, STEEL, s * 1.0, 2.9, 0.78);
    cyl(0.13, 0.1, 0.12, 8, DARK, s * 1.0, 4.05, 0.78);
    glow(b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8), AMBER, { at: [s * 1.0, 4.1, 0.78] }), 1.5);
    // bumper claws
    bx(0.25, 0.25, 0.7, GUN, s * 1.05, 1.0, 3.75);
    b.spike([s * 1.05, 1.0, 4.1], [0, 0, 1], 0.5, 0.12, { color: STEEL });
    // cab side vents
    plane(VENT, 0.6, 0.6, [s * 1.215, 1.8, 1.2], [s, 0, 0]);
  }
  // grille
  bx(1.4, 0.55, 0.06, DARK, 0, 1.7, 3.64);
  for (let i = 0; i < 5; i++) gl(1.3, 0.025, 0.02, MAG, 0, 1.5 + i * 0.1, 3.68, 1.3);
  // armored ram bumper
  bx(2.6, 0.5, 0.45, "#ffffff", 0, 1.0, 3.7, { texture: HAZARD });
  bx(2.6, 0.12, 0.5, GUN, 0, 1.3, 3.7);
  bx(2.6, 0.08, 0.5, GUN, 0, 0.72, 3.72);
  gl(2.2, 0.05, 0.05, RED, 0, 1.12, 3.96, 1.8);
  // light bar on roof
  bx(2.2, 0.16, 0.2, DARK, 0, 3.17, 2.2);
  for (let i = 0; i < 8; i++) gl(0.22, 0.1, 0.04, i % 2 ? MAG : CYAN, -0.95 + i * 0.27, 3.17, 2.32, 2);

  // ---------- turret ----------
  const tz = 1.6, ty = 3.1;
  b.lathe([[0, 0], [0.55, 0], [0.55, 0.12], [0.4, 0.2], [0, 0.2]], { at: [0, ty, tz], color: GUN, segments: 10 });
  bx(0.9, 0.5, 1.0, HULL, 0, ty + 0.45, tz);
  bx(0.7, 0.2, 0.6, GUN, 0, ty + 0.8, tz - 0.1, { rotation: [-10, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), RED, { at: [0, ty + 0.55, tz + 0.52] }), 2.2); // targeting eye
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 1.6, 6, DARK, s * 0.28, ty + 0.45, tz + 1.2, [90, 0, 0]);
    cyl(0.1, 0.1, 0.3, 6, STEEL, s * 0.28, ty + 0.45, tz + 0.7, [90, 0, 0]);
    glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 6), CYAN, { at: [s * 0.28, ty + 0.45, tz + 2.02], rotation: [90, 0, 0] }), 2);
    bx(0.2, 0.3, 0.5, GUN, s * 0.55, ty + 0.4, tz);
  }
  // ammo drum
  cyl(0.28, 0.28, 0.4, 8, "#3a3f47", -0.65, ty + 0.4, tz - 0.1, [0, 0, 90]);

  // ---------- greeble: rivets/pipes/cables ----------
  for (const s of [1, -1]) {
    cyl(0.035, 0.035, 3.0, 5, AMBER, s * 0.75, 1.5, -0.3, [90, 0, 0]);
    cyl(0.05, 0.05, 2.0, 5, STEEL, s * 0.55, 0.6, 0.6, [90, 0, 0]);
  }
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 2.2, z = -3.3 + R() * 4.0;
    gl(0.07, 0.025, 0.07, R() > 0.5 ? CYAN : MAG, x, 3.235, z, 1.6);
  }
  // fuel tanks
  for (const s of [1, -1]) {
    cyl(0.3, 0.3, 1.1, 8, "#555e6b", s * 1.42, 1.0, -3.0, [90, 0, 0]);
    cyl(0.31, 0.31, 0.06, 8, DARK, s * 1.42, 1.0, -2.6, [90, 0, 0]);
    cyl(0.31, 0.31, 0.06, 8, DARK, s * 1.42, 1.0, -3.4, [90, 0, 0]);
  }
  // tow hitch / rear plate
  bx(0.4, 0.2, 0.3, STEEL, 0, 0.75, -3.8);
  gl(0.5, 0.14, 0.04, "#ffffff", 0, 1.0, -3.76, 1.1);

  return b.root;
}
