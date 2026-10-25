import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured 8-wheel hauler guarding a sealed, neon-seamed cargo pod.",
};

const HULL = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.5, rivets: 0.1 });
const PLATE = panelled(metal("steel", { tarnish: 0.4 }), { size: 0.45, rivets: 0.09 });
const POD = panelled(metal("steel", { polish: 0.6, tarnish: 0.2 }), { size: 0.7, rivets: 0.12 });
const DARK = "#14121c";
const TIRE = "#0c0b10";
const CYAN = "#2ef3ff";
const MAG = "#ff2ea6";
const YEL = "#ffc800";
const RUST = "#7a3b22";

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#111"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#ffc800"/>`)
    .join("")}</svg>`,
  { size: 256 },
);
const SIGN = svg(
  `<svg viewBox="0 0 128 48"><rect width="128" height="48" fill="#12101c"/><rect x="2" y="2" width="124" height="44" fill="none" stroke="#ff2ea6" stroke-width="3"/>
  <text x="64" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#2ef3ff">SEALED</text>
  <text x="64" y="40" text-anchor="middle" font-family="monospace" font-size="13" fill="#ffc800">CONVOY 07-K</text></svg>`,
  { size: 256 },
);
const PLATE_TX = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#e8e0c0"/><rect x="1" y="1" width="62" height="22" fill="none" stroke="#222" stroke-width="2"/>
  <text x="32" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#222">NX-4471</text></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#0a0a14"/><circle cx="32" cy="32" r="22" fill="none" stroke="#2ef3ff" stroke-width="4"/>
  <path d="M32 14 L32 50 M18 26 L46 26 M20 42 L44 42" stroke="#ff2ea6" stroke-width="4" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const box = (s: [number, number, number], c: any, at: [number, number, number], o: any = {}) =>
    b.part(new THREE.BoxGeometry(...s), c, { at, ...o });
  const cyl = (r: number, h: number, seg: number, c: any, at: [number, number, number], rot: [number, number, number], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, rotation: rot, ...o });
  const decal = (tx: any, w: number, h: number, at: [number, number, number], dir: [number, number, number], g = false) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tx });
    if (g) glow(p, 0.9);
    return p;
  };

  // chassis
  box([2.3, 0.5, 8.6], HULL, [0, 1.15, 0.6]);
  box([2.5, 0.2, 8.8], PLATE, [0, 0.82, 0.6]);
  for (const s of [1, -1]) {
    box([0.12, 0.6, 8.4], DARK, [s * 1.2, 0.95, 0.6]);
    glow(box([0.05, 0.08, 7.6], s > 0 ? CYAN : MAG, [s * 1.27, 0.75, 0.6]), 1.6); // underglow strips
    decal(HAZARD, 3.0, 0.3, [s * 1.27, 1.2, -1.5], [s, 0, 0]);
  }
  // front bumper ram
  box([2.7, 0.7, 0.5], PLATE, [0, 1.0, 5.0]);
  for (let i = -2; i <= 2; i++) b.part(new THREE.ConeGeometry(0.12, 0.35, 4), YEL, { at: [i * 0.5, 1.0, 5.4], rotation: [90, 45, 0] });
  decal(PLATE_TX, 0.7, 0.26, [0, 1.0, 5.27], [0, 0, 1]);
  box([2.5, 0.12, 0.7], DARK, [0, 0.62, 5.0]);

  // hood and cab
  box([2.5, 0.9, 1.7], HULL, [0, 1.95, 4.0]);
  box([2.3, 0.15, 1.5], PLATE, [0, 2.45, 4.0], { rotation: [-4, 0, 0] });
  for (const s of [1, -1]) {
    box([0.1, 0.5, 1.4], PLATE, [s * 1.28, 2.0, 4.0]);
    for (let i = 0; i < 4; i++) box([0.05, 0.42, 0.06], DARK, [s * 1.34, 2.0, 3.5 + i * 0.28]);
    glow(box([0.7, 0.2, 0.08], "#fff6c0", [s * 0.8, 1.85, 4.88]), 2); // headlights
    box([0.82, 0.3, 0.05], DARK, [s * 0.8, 1.85, 4.86]);
  }
  box([1.0, 0.5, 0.06], DARK, [0, 1.95, 4.88]); // grille
  for (let i = -2; i <= 2; i++) box([0.04, 0.46, 0.04], MAG, [i * 0.18, 1.95, 4.92]);
  box([2.5, 1.7, 2.0], HULL, [0, 2.25, 2.55]);
  box([2.3, 0.2, 1.8], PLATE, [0, 3.2, 2.55]);
  glow(box([2.1, 0.75, 0.08], CYAN, [0, 2.7, 3.57]), 1.1); // visor
  for (let i = -3; i <= 3; i++) box([0.04, 0.78, 0.05], DARK, [i * 0.3, 2.7, 3.6]);
  for (const s of [1, -1]) {
    box([0.08, 0.6, 1.2], DARK, [s * 1.27, 2.7, 2.7]);
    glow(box([0.04, 0.5, 1.0], CYAN, [s * 1.31, 2.7, 2.7]), 0.8);
    box([0.1, 0.5, 0.2], PLATE, [s * 1.4, 2.7, 3.4]); // mirror arm
    box([0.1, 0.4, 0.3], DARK, [s * 1.5, 2.7, 3.4]);
  }
  // roof light bar, antenna, turret
  box([1.8, 0.14, 0.3], DARK, [0, 3.37, 3.2]);
  for (let i = 0; i < 6; i++) glow(box([0.26, 0.1, 0.22], i % 2 ? MAG : CYAN, [-0.75 + i * 0.3, 3.4, 3.2]), 1.8);
  cyl(0.02, 1.4, 5, DARK, [-1.0, 3.9, 1.8], [0, 0, 0]);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), MAG, { at: [-1.0, 4.6, 1.8] }), 2);
  cyl(0.35, 0.2, 8, PLATE, [0.6, 3.4, 2.3], [0, 0, 0]);
  box([0.5, 0.35, 0.8], HULL, [0.6, 3.7, 2.35]);
  cyl(0.05, 1.0, 6, DARK, [0.6, 3.72, 3.0], [90, 0, 0]);
  cyl(0.09, 0.25, 6, PLATE, [0.6, 3.72, 2.7], [90, 0, 0]);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), MAG, { at: [0.6, 3.72, 3.52] }), 2);
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.1, 2.2, 8, metal("steel"), [s * 1.2, 2.6, 1.35], [0, 0, 0]);
    cyl(0.13, 0.12, 8, RUST, [s * 1.2, 3.7, 1.35], [0, 0, 0]);
    cyl(0.14, 0.1, 8, DARK, [s * 1.2, 1.7, 1.35], [0, 0, 0]);
  }

  // wheels
  const axles = [3.6, 2.3, -1.9, -3.2];
  for (const z of axles) {
    cyl(0.1, 2.9, 8, DARK, [0, 0.6, z], [0, 0, 90]);
    for (const s of [1, -1]) {
      cyl(0.6, 0.55, 10, TIRE, [s * 1.3, 0.6, z], [0, 0, 90]);
      cyl(0.62, 0.12, 10, "#1c1a26", [s * 1.3, 0.6, z], [0, 0, 90]);
      cyl(0.36, 0.6, 10, metal("steel"), [s * 1.3, 0.6, z], [0, 0, 90]);
      cyl(0.14, 0.66, 8, YEL, [s * 1.3, 0.6, z], [0, 0, 90]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.03, 0.05, 6, DARK, [s * 1.6, 0.6 + Math.sin(a) * 0.25, z + Math.cos(a) * 0.25], [0, 0, 90]);
      }
      for (let k = 0; k < 8; k++) { // tread blocks
        const a = (k / 8) * Math.PI * 2 + 0.2;
        box([0.58, 0.1, 0.16], "#1a1822", [s * 1.3, 0.6 + Math.sin(a) * 0.6, z + Math.cos(a) * 0.6], { rotation: [(-a * 180) / Math.PI + 90, 0, 0] });
      }
    }
  }
  for (const s of [1, -1]) {
    for (const z of [3.0, -2.55]) {
      box([0.45, 0.14, 2.0], PLATE, [s * 1.3, 1.3, z + (z > 0 ? 0.6 : 0)], {});
      box([0.45, 0.14, 1.6], PLATE, [s * 1.3, 1.3, z], {});
    }
  }

  // cargo cradle
  for (const z of [1.0, -0.9, -2.8]) {
    box([2.3, 0.2, 0.35], PLATE, [0, 1.5, z]);
    for (const s of [1, -1]) box([0.2, 0.7, 0.35], HULL, [s * 0.9, 1.8, z], { rotation: [0, 0, s * 20] });
  }
  // sealed pod
  const pz = -0.9;
  cyl(1.05, 5.0, 12, POD, [0, 2.65, pz], [90, 0, 0]);
  for (const e of [1, -1]) {
    b.part(new THREE.SphereGeometry(1.05, 12, 8), POD, { at: [0, 2.65, pz + e * 2.5], scale: [1, 1, 0.55] });
    cyl(0.4, 0.1, 8, DARK, [0, 2.65, pz + e * 3.05], [90, 0, 0]);
  }
  decal(RUNE, 0.6, 0.6, [0, 2.65, pz - 3.1], [0, 0, -1], true);
  for (const z of [-2.5, -1.2, 0.0, 0.7]) {
    cyl(1.1, 0.28, 12, DARK, [0, 2.65, pz + z + 0.5], [90, 0, 0]);
    cyl(1.12, 0.06, 12, YEL, [0, 2.65, pz + z + 0.5], [90, 0, 0]);
  }
  glow(box([0.14, 0.06, 4.6], CYAN, [0, 3.72, pz]), 1.8);
  for (const s of [1, -1]) {
    glow(box([0.05, 0.12, 4.4], MAG, [s * 1.06, 2.65, pz]), 1.5);
    decal(SIGN, 1.8, 0.68, [s * 1.07, 3.0, pz + 0.4 - 0.2], [s, 0, 0], true);
    for (const z of [-2.0, 1.4]) { // locking clamps
      box([0.18, 0.4, 0.3], PLATE, [s * 1.0, 2.0, pz + z], { rotation: [0, 0, s * -25] });
      cyl(0.05, 0.1, 6, YEL, [s * 1.12, 1.95, pz + z], [0, 0, 90]);
    }
  }
  box([0.5, 0.15, 0.5], DARK, [0, 3.75, pz + 1.6]); // hatch
  cyl(0.18, 0.06, 8, YEL, [0, 3.84, pz + 1.6], [0, 0, 0]);

  // rear
  box([2.4, 0.5, 0.2], PLATE, [0, 1.0, -4.0]);
  for (const s of [1, -1]) glow(box([0.4, 0.16, 0.06], "#ff2030", [s * 0.8, 1.15, -4.12]), 2);
  decal(PLATE_TX, 0.6, 0.22, [0, 0.95, -4.12], [0, 0, -1]);

  return b.root;
}
