import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { patches } from "../../../../src/index";

export const meta = {
  name: "Hover Pickup HV-7",
  description: "Militarized pickup truck converted to four hover thrusters, low-poly cyberpunk, with a bed-mounted minigun and missile pod.",
};

// ---------- palette ----------
const OLIVE = "#3b4234";
const HULL = panelled(patches(OLIVE, ["#2e3529", "#474f3b", "#343b30", "#3f4636"], { size: 0.55, gap: 0.03, seed: 4 }), { size: 0.45, rivets: 0.12 });
const ARMOR = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.3, rivets: 0.08 });
const STEEL = metal("steel", { tarnish: 0.4 });
const DARK = "#14161c";
const BLACK = "#0a0b0f";
const AMBER = "#e0a21c";
const CYAN = "#22f0ff";
const MAGENTA = "#ff2fb0";
const RED = "#ff2a3a";
const BLUE = "#2a6bff";
const WHITE = "#f4fbff";

// ---------- textures ----------
const WINDSHIELD = svg(`<svg viewBox="0 0 150 78"><rect width="150" height="78" rx="6" fill="#0c1a26"/>
<rect x="4" y="4" width="142" height="70" rx="4" fill="#12394a"/>
<path d="M0 78 L50 0 L72 0 L22 78Z" fill="#7fe8ff" opacity="0.25"/><path d="M80 78 L120 0 L130 0 L90 78Z" fill="#7fe8ff" opacity="0.18"/>
<path d="M10 62 H60 M10 66 H40" stroke="#ff2fb0" stroke-width="1.6" opacity="0.8"/>
<rect x="100" y="52" width="36" height="14" fill="none" stroke="#22f0ff" stroke-width="1.2"/><path d="M104 60 H120 L124 56 H132" stroke="#22f0ff" stroke-width="1.2" fill="none"/></svg>`, { size: 256 });

const SIDEWIN = svg(`<svg viewBox="110 0 110 40"><rect width="220" height="40" rx="5" fill="#0c1a26"/>
<rect x="3" y="3" width="214" height="34" rx="3" fill="#12394a"/>
<path d="M20 40 L45 0 L62 0 L37 40Z" fill="#7fe8ff" opacity="0.28"/><path d="M80 40 L95 0 L102 0 L87 40Z" fill="#7fe8ff" opacity="0.2"/></svg>`, { size: 192 });

const GRILLE = svg(`<svg viewBox="0 0 150 36"><rect width="150" height="36" fill="#0d0e13"/>
${Array.from({ length: 9 }, (_, i) => `<rect x="${8 + i * 15.5}" y="4" width="9" height="28" fill="#2a2d38"/><rect x="${8 + i * 15.5}" y="4" width="9" height="4" fill="#ff2fb0"/>`).join("")}
<rect x="2" y="2" width="146" height="32" fill="none" stroke="#e0a21c" stroke-width="2"/></svg>`, { size: 256 });

const FLANK = svg(`<svg viewBox="0 0 140 50"><rect width="140" height="50" fill="none"/>
<path d="M0 0 H24 L10 50 H0Z M30 0 H54 L40 50 H30Z" fill="#e0a21c"/>
<g fill="none" stroke="#000" stroke-width="3" opacity="0.7"><path d="M0 0 H24 L10 50 H0Z"/></g>
<text x="64" y="34" font-family="monospace" font-weight="bold" font-size="30" fill="#0a0b0f" stroke="#0a0b0f" stroke-width="3">HV-7</text>
<text x="64" y="34" font-family="monospace" font-weight="bold" font-size="30" fill="#22f0ff">HV-7</text>
<path d="M118 6 l4 10 10 0 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 0Z" fill="#ff2fb0" transform="translate(-6,-2) scale(0.9)"/></svg>`, { size: 256 });

const HOODMARK = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#22f0ff" stroke-width="4"/>
<circle cx="50" cy="50" r="34" fill="#0a0b0f" opacity="0.75"/>
<path d="M50 20 L74 70 L50 58 L26 70Z" fill="#ff2fb0"/><path d="M50 30 L62 60 L50 54 L38 60Z" fill="#0a0b0f"/>
<path d="M8 50 H20 M80 50 H92 M50 4 V14" stroke="#e0a21c" stroke-width="5"/></svg>`, { size: 192 });

const PLATE = svg(`<svg viewBox="0 0 60 20"><rect width="60" height="20" rx="2" fill="#e8eef2"/><rect x="1.5" y="1.5" width="57" height="17" rx="1.5" fill="none" stroke="#111" stroke-width="1"/>
<text x="30" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#111">NX-2077</text></svg>`, { size: 128 });

const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e0a21c"/>
${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 H${i * 10 + 7} L${i * 10 + 1} 16Z" fill="#0a0b0f"/>`).join("")}</svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "hover_pickup" });

  const bx = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], dir: number[] = [0, 1, 0], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir, flat: true, ...o });
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });

  // ---------- main hull ----------
  b.extrude(
    [[-2.6, 0.55], [2.4, 0.55], [2.7, 0.75], [2.7, 1.15], [1.2, 1.3], [-1.0, 1.3], [-1.0, 1.1], [-2.6, 1.1]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: HULL, name: "hull" },
  );
  // cab
  b.extrude(
    [[1.05, 1.2], [0.3, 1.85], [-0.85, 1.85], [-1.0, 1.2]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.04, color: HULL, name: "cab" },
  );
  // skid plate and lift core
  bx(1.7, 0.1, 4.6, ARMOR, 0, 0.52, 0);
  bx(0.9, 0.08, 3.4, DARK, 0, 0.45, 0);
  glow(bx(0.5, 0.03, 3.0, CYAN, 0, 0.405, 0), 1.6);

  // ---------- windows ----------
  decal(WINDSHIELD, 1.5, 0.78, [0, 1.525 + 0.757 * 0.012, 0.675 + 0.657 * 0.012], [0, 0.757, 0.657]);
  for (const s of [1, -1]) {
    decal(SIDEWIN, 1.1, 0.4, [s * 0.905, 1.52, -0.15], [s, 0, 0]);
    // door seams + handle
    for (const z of [0.45, -0.72]) bx(0.012, 0.46, 0.014, BLACK, s * 0.902, 1.5, z);
    bx(0.03, 0.04, 0.16, STEEL, s * 0.915, 1.36, 0.28);
    // mirror
    bx(0.14, 0.03, 0.03, DARK, s * 0.97, 1.5, 0.52);
    bx(0.05, 0.2, 0.14, ARMOR, s * 1.04, 1.5, 0.52);
    // flank markings
    decal(FLANK, 1.5, 0.52, [s * 0.955, 0.88, 0.2], [s, 0, 0]);
    // side armour rails and neon strip
    bx(0.05, 0.12, 4.4, ARMOR, s * 0.97, 0.66, 0);
    glow(bx(0.03, 0.04, 4.2, s > 0 ? CYAN : MAGENTA, s * 0.995, 0.6, 0), 1.6);
    // bed rails
    bx(0.12, 0.45, 1.6, HULL, s * 0.9, 1.33, -1.8);
    bx(0.14, 0.05, 1.6, ARMOR, s * 0.9, 1.57, -1.8);
    decal(HAZARD, 1.5, 0.12, [s * 0.9 + s * 0.061, 1.4, -1.8], [s, 0, 0]);
    // roof rails
    bx(0.05, 0.05, 1.0, STEEL, s * 0.55, 1.9, -0.25);
    // headlights
    glow(bx(0.42, 0.12, 0.04, WHITE, s * 0.68, 1.0, 2.71), 2);
    bx(0.5, 0.2, 0.03, DARK, s * 0.68, 1.0, 2.695);
    // taillights
    glow(bx(0.4, 0.1, 0.04, RED, s * 0.65, 1.36, -2.62), 1.8);
    // tow hooks
    bx(0.08, 0.08, 0.2, AMBER, s * 0.6, 0.62, 2.8);
    // exhaust boosters
    cyl(0.16, 0.18, 0.35, 8, ARMOR, [s * 0.5, 0.8, -2.72], [0, 0, 1]);
    glow(cyl(0.12, 0.12, 0.04, 8, MAGENTA, [s * 0.5, 0.8, -2.9], [0, 0, 1]), 1.8);
    // hood vents
    for (let i = 0; i < 3; i++) bx(0.35, 0.02, 0.05, BLACK, s * 0.5, 1.255 - i * 0.004, 1.5 + i * 0.12, { rotation: [5.7, 0, 0] });
  }
  decal(HOODMARK, 0.8, 0.8, [0, 1.25, 1.85], [0, 0.99, 0.1], { up: [0, 0, 1] });
  bx(1.4, 0.05, 0.7, ARMOR, 0, 1.275, 1.2, { rotation: [-0.1, 0, 0] });

  // ---------- front ----------
  decal(GRILLE, 1.5, 0.36, [0, 0.95, 2.703], [0, 0, 1]);
  bx(2.0, 0.22, 0.22, ARMOR, 0, 0.72, 2.78);
  bx(0.14, 0.5, 0.14, ARMOR, 0.55, 0.9, 2.78);
  bx(0.14, 0.5, 0.14, ARMOR, -0.55, 0.9, 2.78);
  bx(1.4, 0.09, 0.09, ARMOR, 0, 1.0, 2.8);
  decal(HAZARD, 1.9, 0.12, [0, 0.72, 2.895], [0, 0, 1]);
  decal(PLATE, 0.42, 0.14, [0, 0.55 + 0.02, 2.86 - 0.0], [0, 0, 1]);

  // ---------- roof gear ----------
  bx(1.3, 0.07, 0.25, DARK, 0, 1.9, 0.0);
  for (let i = 0; i < 6; i++) glow(bx(0.19, 0.06, 0.2, i < 3 ? RED : BLUE, -0.55 + i * 0.22, 1.95, 0.0), 2);
  cyl(0.02, 0.025, 0.7, 5, STEEL, [-0.7, 2.2, -0.7]);
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), MAGENTA, { at: [-0.7, 2.58, -0.7] }), 2);
  cyl(0.14, 0.18, 0.1, 8, ARMOR, [0.5, 1.93, -0.6]);
  b.part(new THREE.SphereGeometry(0.12, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0.5, 1.98, -0.6], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), CYAN, { at: [0.5, 2.1, -0.52] }), 2);

  // ---------- bed: tailgate, front wall, cargo ----------
  bx(1.7, 0.45, 0.1, HULL, 0, 1.33, -2.55);
  bx(1.7, 0.05, 0.12, ARMOR, 0, 1.57, -2.55);
  glow(bx(1.2, 0.05, 0.04, MAGENTA, 0, 1.2, -2.62), 1.5);
  bx(1.7, 0.55, 0.1, ARMOR, 0, 1.38, -1.08);
  decal(PLATE, 0.4, 0.13, [0, 1.1, -2.605], [0, 0, -1]);
  // crate
  bx(0.55, 0.4, 0.55, AMBER, -0.5, 1.3, -1.6);
  bx(0.57, 0.05, 0.57, DARK, -0.5, 1.5, -1.6);
  bx(0.55, 0.06, 0.04, BLACK, -0.5, 1.3, -1.32);
  // missile pod
  bx(0.55, 0.4, 0.7, DARK, 0.5, 1.3, -2.15);
  bx(0.58, 0.05, 0.74, ARMOR, 0.5, 1.5, -2.15);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      cyl(0.07, 0.07, 0.05, 8, BLACK, [0.35 + i * 0.15, 1.22 + j * 0.17, -1.79], [0, 0, 1]);
      glow(cyl(0.035, 0.0, 0.07, 6, RED, [0.35 + i * 0.15, 1.22 + j * 0.17, -1.76], [0, 0, 1]), 1.5);
    }
  // minigun on pedestal
  cyl(0.12, 0.16, 0.7, 8, ARMOR, [0, 1.45, -1.9]);
  cyl(0.22, 0.22, 0.06, 10, STEEL, [0, 1.12, -1.9]);
  bx(0.34, 0.3, 0.5, ARMOR, 0, 1.95, -1.9);
  bx(0.4, 0.08, 0.2, AMBER, 0, 2.14, -1.95);
  bx(0.06, 0.3, 0.3, STEEL, 0.2, 1.95, -1.9);
  bx(0.06, 0.3, 0.3, STEEL, -0.2, 1.95, -1.9);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cyl(0.025, 0.025, 1.1, 5, STEEL, [Math.cos(a) * 0.07, 1.95 + Math.sin(a) * 0.07, -1.0], [0, 0, 1]);
  }
  cyl(0.12, 0.12, 0.04, 8, STEEL, [0, 1.95, -0.7], [0, 0, 1]);
  glow(cyl(0.05, 0.05, 0.02, 6, CYAN, [0, 1.95, -0.69], [0, 0, 1]), 1.5);

  // ---------- hover thrusters ----------
  const podProfile: [number, number][] = [[0, 0.04], [0.38, 0.04], [0.46, 0.12], [0.5, 0.4], [0.46, 0.66], [0.34, 0.66], [0.3, 0.5], [0, 0.5]];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.5;
      const z = sz * 1.55;
      b.lathe(podProfile, { at: [x, 0, z], segments: 10, color: ARMOR, name: "pod" });
      glow(cyl(0.32, 0.32, 0.05, 10, CYAN, [x, 0.025, z]), 1.8);
      cyl(0.505, 0.5, 0.07, 10, AMBER, [x, 0.3, z]);
      glow(b.part(new THREE.TorusGeometry(0.42, 0.025, 5, 12), MAGENTA, { at: [x, 0.66, z], rotation: [90, 0, 0] }), 1.8);
      cyl(0.06, 0.06, 0.1, 6, STEEL, [x, 0.5, z]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        bx(0.3, 0.015, 0.07, STEEL, x + Math.cos(a) * 0.17, 0.53, z - Math.sin(a) * 0.17, { rotation: [0, (a * 180) / Math.PI, 8] });
      }
      // outer fins
      for (const dx of [sx, 0]) {
        void dx;
      }
      bx(0.04, 0.36, 0.28, HULL, x + sx * 0.52, 0.3, z);
      bx(0.28, 0.36, 0.04, HULL, x, 0.3, z + sz * 0.52);
      // struts
      bx(0.75, 0.16, 0.5, ARMOR, sx * 1.2, 0.82, z);
      b.rod([sx * 0.95, 0.58, z], [sx * 1.42, 0.4, z], 0.06, STEEL);
      bx(0.12, 0.12, 0.12, AMBER, sx * 1.5, 0.82, z);
    }

  // under-glow strips front and rear
  glow(bx(1.6, 0.03, 0.05, CYAN, 0, 0.57, 2.55), 1.4);
  glow(bx(1.6, 0.03, 0.05, MAGENTA, 0, 0.57, -2.6), 1.4);

  return b.root;
}
