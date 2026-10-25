```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { mottle } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Hover Technical",
  description: "A militarized pickup truck converted to four hover thrusters, with a pintle gun, rocket pods, neon underglow and rear jets, in low-poly cyberpunk style.",
};

type V = [number, number, number];

const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const DARK = "#14161c";
const GLASS = "#0b2a36";
const RED = "#c8321e";
const AMBER = "#ffb02e";
const BONE = "#cfd6c8";

const HULL = panelled(mottle("#4b5436", "#313a26", { size: 0.55, seed: 3 }), { size: 0.5, aspect: 0.8, rivets: 0.14 });
const PLATE = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.3, rivets: 0.08 });
const STEEL = metal("steel", { tarnish: 0.4 });
const IRON = metal("iron");
const OLIVE2 = mottle("#5a6540", "#3e472c", { size: 0.3, seed: 8 });

const HEAD = svg(`<svg viewBox="0 0 64 16"><rect x="0" y="0" width="64" height="16" rx="3" fill="#0a0c12"/>
<rect x="3" y="3" width="58" height="10" rx="2" fill="#19f0ff"/><rect x="6" y="6" width="52" height="4" fill="#e8ffff"/>
<path d="M16 3v10M32 3v10M48 3v10" stroke="#0a0c12" stroke-width="2"/></svg>`, { size: 128 });
const TAIL = svg(`<svg viewBox="0 0 48 16"><rect width="48" height="16" rx="3" fill="#220606"/>
<rect x="3" y="3" width="42" height="10" rx="2" fill="#ff2a2a"/><rect x="6" y="6" width="36" height="4" fill="#ffb0a0"/></svg>`, { size: 128 });
const GRILLE = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0a0c12"/>
${[0, 1, 2, 3, 4].map((i) => `<rect x="4" y="${3 + i * 4}" width="56" height="2" fill="${i % 2 ? "#ff2bd6" : "#3a3f4c"}"/>`).join("")}
<rect x="1" y="1" width="62" height="22" fill="none" stroke="#19f0ff" stroke-width="1.2"/></svg>`, { size: 128 });
const HAZARD = svg(`<svg viewBox="0 0 80 10"><rect width="80" height="10" fill="#e8b82a"/>
${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 8 - 4} 10 l6 -10 h4 l-6 10z" fill="#14161c"/>`).join("")}</svg>`, { size: 256 });
const STAR = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#e8e8d8" stroke-width="4"/>
<path d="M32 10 L38 27 L56 27 L42 38 L47 55 L32 45 L17 55 L22 38 L8 27 L26 27Z" fill="#e8e8d8"/>
<path d="M4 32h10M50 32h10" stroke="#ff2bd6" stroke-width="3"/></svg>`, { size: 128 });
const NUMBER = svg(`<svg viewBox="0 0 80 40"><rect x="1" y="1" width="78" height="38" fill="none" stroke="#e8e8d8" stroke-width="2" stroke-dasharray="10 3"/>
<text x="40" y="31" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#e8e8d8">H-07</text></svg>`, { size: 192 });
const CIRCUIT = svg(`<svg viewBox="0 0 64 48"><g fill="none" stroke="#19f0ff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
<path d="M4 40 H20 L26 30 H44 L50 20 H60"/><path d="M4 24 H14 L20 14 H34 L40 6 H58"/><path d="M30 46 V36 H40 L46 44 H62"/></g>
<g fill="#ff2bd6"><circle cx="20" cy="40" r="2"/><circle cx="44" cy="30" r="2"/><circle cx="34" cy="14" r="2"/><circle cx="60" cy="20" r="2"/><circle cx="62" cy="44" r="2"/></g></svg>`, { size: 192 });

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const box = (s: V, at: V, c: any, o: any = {}) => b.part(new THREE.BoxGeometry(...s), c, { at, ...o });
  const cyl = (r: number, h: number, at: V, c: any, dir: V = [0, 1, 0], seg = 8, r2 = r) =>
    b.part(new THREE.CylinderGeometry(r, r2, h, seg), c, { at, dir, flat: true });
  const dec = (tex: any, w: number, h: number, at: V, dir: V, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

  // ---- body: one side-profile extrude (z, y), 2 m wide
  const profile: [number, number][] = [
    [-2.7, 0.62], [2.7, 0.62], [2.78, 0.7], [2.78, 1.1], [2.55, 1.27], [1.5, 1.3],
    [1.15, 1.38], [0.6, 1.9], [-0.3, 1.9], [-0.45, 1.45], [-0.5, 1.0], [-2.7, 1.0],
  ];
  b.extrude(profile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.04, color: HULL });

  // skid plate under
  box([1.8, 0.08, 4.8], [0, 0.6, 0], PLATE);
  // underglow
  glow(b.part(new THREE.PlaneGeometry(1.7, 4.6), MAG, { at: [0, 0.55, 0], dir: [0, -1, 0], axis: "z" }), 1.6);

  // ---- glass
  b.part(new THREE.BoxGeometry(1.7, 0.74, 0.03), GLASS, { at: [0, 1.657, 0.893], rotation: [-43, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(1.7, 0.05, 0.035), CYAN, { at: [0, 1.88, 0.66], rotation: [-43, 0, 0] }), 1.2);
  box([1.7, 0.06, 0.8], [0, 1.93, 0.15], PLATE); // roof plate
  box([1.55, 0.3, 0.02], [0, 1.65, -0.43], GLASS, { rotation: [-18, 0, 0] }); // rear window

  for (const s of [1, -1]) {
    // side windows, door seams, handles
    box([0.02, 0.3, 0.9], [s * 1.004, 1.65, 0.15], GLASS);
    for (const z of [-0.22, 0.62, 1.1]) box([0.012, 0.62, 0.02], [s * 1.003, 1.12, z], DARK);
    box([0.012, 0.02, 0.84], [s * 1.003, 0.82, 0.4], DARK);
    box([0.03, 0.05, 0.2], [s * 1.012, 1.33, 0.45], BONE);
    box([0.02, 0.1, 0.32], [s * 1.006, 1.0, -0.05], DARK, { rotation: [0, 0, 0] });
    dec(STAR, 0.34, 0.34, [s * 1.014, 1.08, 0.2], [s, 0, 0]);
    // mirrors
    box([0.2, 0.025, 0.025], [s * 1.1, 1.52, 0.8], DARK);
    box([0.05, 0.2, 0.14], [s * 1.2, 1.5, 0.8], HULL);
    glow(box([0.01, 0.04, 0.1], [s * 1.226, 1.45, 0.8], AMBER), 1);
    // bed walls and trim
    box([0.1, 0.4, 2.2], [s * 0.95, 1.2, -1.6], HULL);
    box([0.14, 0.05, 2.24], [s * 0.95, 1.42, -1.6], PLATE);
    dec(NUMBER, 0.7, 0.35, [s * 1.014, 1.2, -1.6], [s, 0, 0]);
    // exhaust stacks
    cyl(0.07, 1.1, [s * 0.86, 1.55, -0.65], IRON);
    cyl(0.09, 0.06, [s * 0.86, 2.1, -0.65], DARK);
    for (const y of [1.25, 1.6]) cyl(0.09, 0.05, [s * 0.86, y, -0.65], STEEL);
    // roll bar
    b.rod([s * 0.9, 1.0, -1.25], [s * 0.9, 1.95, -1.25], 0.04, STEEL);
    b.rod([s * 0.9, 1.95, -1.25], [s * 0.9, 1.85, -0.5], 0.035, STEEL);
    // side rocket pods
    box([0.34, 0.44, 0.95], [s * 1.17, 1.28, -1.8], PLATE);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const p: V = [s * (1.07 + j * 0.18), 1.16 + i * 0.13, -1.31];
      cyl(0.055, 0.1, p, DARK, [0, 0, 1]);
      glow(cyl(0.035, 0.02, [p[0], p[1], -1.26], AMBER, [0, 0, 1]), 1.3);
    }
    box([0.06, 0.2, 0.5], [s * 1.0, 1.1, -1.8], DARK);
    // taillights
    glow(dec(TAIL, 0.4, 0.14, [s * 0.7, 1.2, -2.712], [0, 0, -1]), 1.4);
    // headlights
    glow(dec(HEAD, 0.5, 0.125, [s * 0.68, 0.98, 2.79], [0, 0, 1]), 1.4);
    // brush guard
    b.rod([s * 0.78, 0.7, 2.86], [s * 0.78, 1.2, 2.86], 0.03, STEEL);
    b.rod([s * 0.4, 0.7, 2.86], [s * 0.4, 1.2, 2.86], 0.03, STEEL);
    // hover pods
    const px = s * 1.32;
    for (const pz of [1.75, -1.75]) {
      box([0.45, 0.3, 0.7], [s * 1.02, 0.5, pz], DARK);
      cyl(0.6, 0.5, [px, 0.25, pz], PLATE, [0, 1, 0], 8, 0.52);
      cyl(0.62, 0.06, [px, 0.5, pz], STEEL, [0, 1, 0], 8);
      cyl(0.5, 0.04, [px, 0.46, pz], DARK, [0, 1, 0], 8);
      for (let k = 0; k < 3; k++)
        box([0.92, 0.02, 0.1], [px, 0.49, pz], STEEL, { rotation: [0, k * 60 + (pz > 0 ? 10 : 30), 0] });
      cyl(0.09, 0.08, [px, 0.51, pz], AMBER);
      glow(b.part(new THREE.CircleGeometry(0.42, 8), CYAN, { at: [px, 0.015, pz], dir: [0, -1, 0], axis: "z" }), 1.8);
      b.part(new THREE.TorusGeometry(0.45, 0.025, 4, 8), MAG, { at: [px, 0.02, pz], dir: [0, 1, 0], axis: "z" });
      glow(box([0.04, 0.03, 0.4], [px, 0.52, pz + 0.0], MAG), 0.001 + 1);
      // pod stripes
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2 + Math.PI / 4;
        glow(box([0.05, 0.3, 0.02], [px + Math.cos(a) * 0.57, 0.28, pz + Math.sin(a) * 0.57], CYAN, { rotation: [0, -a * 57.3 + 90, 0] }), 1.2);
      }
    }
    // rear jets
    cyl(0.2, 0.6, [s * 0.55, 0.82, -2.95], IRON, [0, 0, 1], 8, 0.24);
    cyl(0.25, 0.08, [s * 0.55, 0.82, -3.2], STEEL, [0, 0, 1], 8);
    glow(b.part(new THREE.CircleGeometry(0.19, 8), MAG, { at: [s * 0.55, 0.82, -3.225], dir: [0, 0, -1], axis: "z" }), 1.8);
    // antenna
    b.rod([s * 0.7, 1.9, -0.1], [s * 0.7, 2.9 - (s > 0 ? 0 : 0.4), -0.1], 0.015, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), MAG, { at: [s * 0.7, 2.9 - (s > 0 ? 0 : 0.4), -0.1] }), 1.5);
    // fender flares / vents on hood
    box([0.36, 0.04, 0.5], [s * 0.55, 1.315, 2.25], PLATE, { rotation: [-1.5, 0, 0] });
    for (let i = 0; i < 4; i++) box([0.3, 0.02, 0.03], [s * 0.55, 1.34, 2.1 + i * 0.1], DARK);
    // door bolts
    for (let i = 0; i < 3; i++) cyl(0.018, 0.02, [s * 1.012, 0.75, -0.1 + i * 0.5], BONE, [s, 0, 0], 6);
    // side-skirt neon
    glow(box([0.03, 0.04, 4.5], [s * 1.012, 0.68, 0], MAG), 1.6);
  }

  // hood decal and armour
  dec(CIRCUIT, 1.2, 0.9, [0, 1.312, 2.05], [0, 1, 0.03], [0, 0, 1]);
  glow(dec(CIRCUIT, 1.2, 0.9, [0, 1.314, 2.05], [0, 1, 0.03], [0, 0, 1]), 1.2);
  box([0.5, 0.06, 0.5], [0, 1.34, 1.55], PLATE);
  cyl(0.09, 0.05, [0, 1.38, 1.55], AMBER);
  // grille & bumper
  dec(GRILLE, 0.9, 0.34, [0, 0.9, 2.79], [0, 0, 1]);
  box([2.14, 0.22, 0.26], [0, 0.68, 2.84], IRON);
  dec(HAZARD, 1.9, 0.14, [0, 0.68, 2.975], [0, 0, 1]);
  b.rod([-0.78, 1.2, 2.86], [0.78, 1.2, 2.86], 0.03, STEEL);
  cyl(0.09, 0.4, [0, 0.66, 2.98], DARK, [1, 0, 0]); // winch
  // rear bumper & tailgate
  box([2.1, 0.2, 0.2], [0, 0.72, -2.78], IRON);
  box([2.0, 0.4, 0.1], [0, 1.2, -2.65], HULL);
  box([2.04, 0.05, 0.14], [0, 1.42, -2.65], PLATE);
  box([0.3, 0.06, 0.04], [0, 1.28, -2.72], BONE);

  // roof: light bar, dish
  box([1.5, 0.1, 0.2], [0, 2.0, 0.58], DARK);
  for (let i = 0; i < 6; i++) glow(box([0.2, 0.07, 0.04], [-0.625 + i * 0.25, 2.0, 0.69], i % 2 ? CYAN : MAG), 1.8);
  cyl(0.03, 0.4, [0, 2.1, -0.1], STEEL);
  b.lathe([[0, 0], [0.25, 0.12], [0.25, 0.14], [0.02, 0.04], [0, 0.04]], { at: [0, 2.28, -0.1], color: BONE, segments: 8, bone: undefined });
  glow(cyl(0.025, 0.1, [0, 2.4, -0.1], MAG), 1.5);

  // bed cargo
  box([0.7, 0.45, 0.5], [0.55, 1.22, -2.25], OLIVE2);
  box([0.72, 0.04, 0.52], [0.55, 1.46, -2.25], PLATE);
  dec(HAZARD, 0.6, 0.07, [0.55, 1.3, -1.998], [0, 0, 1]);
  for (const x of [-0.65, -0.3]) {
    box([0.3, 0.46, 0.2], [x, 1.23, -2.4], RED);
    box([0.1, 0.05, 0.05], [x, 1.5, -2.4], DARK);
    box([0.04, 0.2, 0.2], [x - 0.12, 1.25, -2.4], "#8a2412");
  }

  // pintle gun
  cyl(0.22, 0.3, [0, 1.15, -1.25], IRON, [0, 1, 0], 8, 0.16);
  cyl(0.06, 0.4, [0, 1.5, -1.25], STEEL);
  box([0.24, 0.26, 0.7], [0, 1.72, -1.3], PLATE);
  cyl(0.05, 1.1, [0, 1.74, -0.85], DARK, [0, 0, 1], 6);
  cyl(0.075, 0.2, [0, 1.74, -0.35], STEEL, [0, 0, 1], 6);
  box([0.4, 0.4, 0.04], [0, 1.78, -0.98], PLATE);
  box([0.3, 0.24, 0.2], [0.28, 1.6, -1.35], "#3c4a2c"); // ammo box
  glow(box([0.2, 0.02, 0.02], [0, 1.88, -0.99], AMBER), 1.2);

  return b.root;
}
```