```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Alder House",
  description:
    "Raw board-marked concrete brutalist housing slab: egg-crate balcony facade on tapered piloti, access galleries, slit-lit stair towers, a mural gable and a plant-room roof.",
};

// ---------------------------------------------------------------------------------------------
// Dimensions (meters)
const L = 48; // length of the slab (x)
const D = 11; // depth of the slab body (z)
const FLOORS = 8;
const FH = 3.1; // storey height
const G = 4.5; // underside of first floor (piloti height)
const TOP = G + FLOORS * FH; // roof level
const BAYS = 12;
const BAY = L / BAYS;
const PTOP = TOP + 0.375; // top of roof slab

const PAL = ["#c9722f", "#3f7f86", "#b8453a", "#d6aa3a", "#6e8f4e", "#e0d6bd"];

type Rgb3 = [number, number, number];
const tmp = new THREE.Vector3();

// A weathered, board-marked concrete paint: tone drift, pour lines, rain streaks, ground grime.
function concrete(tone: number, seed: number, warm = 0) {
  return paint((p, n): Rgb3 => {
    const big = noise(p, 5, seed);
    const mid = noise(p, 0.9, seed + 3);
    let v = tone + 0.1 * (big - 0.5) + 0.05 * (mid - 0.5);
    const vert = 1 - Math.abs(n.y);
    tmp.set(p.x * 2.5, p.y * 0.2, p.z * 2.5);
    const streak = smoothstep(0.55, 0.8, noise(tmp, 1.6, seed + 9));
    v *= 1 - 0.24 * streak * vert;
    const f = p.y / 1.55 - Math.floor(p.y / 1.55);
    if (vert > 0.5 && f < 0.045) v *= 0.84;
    v *= 0.78 + 0.22 * smoothstep(0, 2.5, p.y);
    v *= 0.9 + 0.12 * smoothstep(-0.8, 0.9, n.y);
    return [Math.min(1, v * (1 + warm)), Math.min(1, v * 0.985), Math.min(1, v * (0.94 - warm))];
  });
}

const CONC = concrete(0.6, 3);
const CONC_D = concrete(0.5, 7, 0.02);
const CONC_L = concrete(0.67, 11);
const DARK = "#1c1d20";
const METAL = "#7b8590";

const b = createBuilder({ name: "alder-house", paintSize: 2048 });

function box(w: number, h: number, d: number, x: number, y: number, z: number, color: any) {
  return b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
}
function plane(w: number, h: number, at: number[], dir: number[], texture: any) {
  return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: at as any, dir: dir as any, axis: "z", texture });
}

// Merge small repeated details by colour.
const groups = new Map<string, THREE.BufferGeometry[]>();
function add(color: string, geo: THREE.BufferGeometry, x: number, y: number, z: number, rotX = 0) {
  if (rotX) geo.rotateX(rotX);
  geo.translate(x, y, z);
  if (!groups.has(color)) groups.set(color, []);
  groups.get(color)!.push(geo);
}

// ---------------------------------------------------------------------------------------------
// Textures
function facadeTex(seed: number) {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < BAYS; i++) {
    const x = i * 100;
    const panel = PAL[Math.floor(r() * PAL.length)];
    const lit = r() < 0.14;
    const curtain = r() < 0.45;
    const cc = PAL[Math.floor(r() * PAL.length)];
    s += `<rect x="${x + 3}" y="2" width="94" height="56" fill="#1f2125"/>`;
    s += `<rect x="${x + 8}" y="6" width="42" height="52" fill="${lit ? "#ffd98a" : "#587280"}"/>`;
    if (!lit) s += `<path d="M${x + 8} 58 L${x + 8} 30 L${x + 36} 6 L${x + 50} 6 L${x + 50} 12 L${x + 20} 58Z" fill="#8fa9b5" opacity="0.45"/>`;
    if (curtain) s += `<rect x="${x + 9}" y="7" width="18" height="50" fill="${cc}" opacity="0.9"/>`;
    s += `<rect x="${x + 28}" y="6" width="2.5" height="52" fill="#17181b"/>`;
    s += `<rect x="${x + 54}" y="8" width="38" height="50" fill="${panel}"/>`;
    s += `<rect x="${x + 59}" y="14" width="28" height="22" fill="#17181b"/>`;
    s += `<rect x="${x + 61}" y="16" width="24" height="18" fill="${lit ? "#ffe3a0" : "#34505c"}"/>`;
    s += `<rect x="${x + 72}" y="16" width="2" height="18" fill="#17181b"/>`;
    s += `<rect x="${x + 54}" y="44" width="38" height="2" fill="#000" opacity="0.25"/>`;
  }
  return svg(`<svg viewBox="0 0 1200 60" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 2048 });
}

function backTex(seed: number) {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < BAYS; i++) {
    const x = i * 100;
    const door = PAL[Math.floor(r() * PAL.length)];
    const cc = PAL[Math.floor(r() * PAL.length)];
    s += `<rect x="${x + 6}" y="3" width="88" height="55" fill="#26282c"/>`;
    s += `<rect x="${x + 10}" y="6" width="30" height="52" fill="${door}"/>`;
    s += `<rect x="${x + 16}" y="14" width="18" height="16" fill="#2b3a42"/>`;
    s += `<rect x="${x + 15}" y="44" width="20" height="2" fill="#000" opacity="0.3"/>`;
    s += `<rect x="${x + 48}" y="14" width="42" height="32" fill="#34505c"/>`;
    if (r() < 0.5) s += `<rect x="${x + 49}" y="15" width="18" height="30" fill="${cc}" opacity="0.85"/>`;
    s += `<rect x="${x + 68}" y="14" width="2.5" height="32" fill="#17181b"/>`;
    s += `<rect x="${x + 46}" y="46" width="46" height="3" fill="#b7b3a8"/>`;
  }
  return svg(`<svg viewBox="0 0 1200 60" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 2048 });
}

function slitTex(w: number, floors: number) {
  const W = w * 10;
  const H = floors * 31;
  const cols = w > 6 ? 3 : 2;
  let s = "";
  for (let i = 0; i < floors; i++) {
    for (let c = 0; c < cols; c++) {
      const cx = (W / (cols + 1)) * (c + 1);
      const y = i * 31 + 4 + (c % 2) * 5;
      s += `<rect x="${cx - 3.5}" y="${y}" width="7" height="15" fill="#ffe9b0" stroke="#17181b" stroke-width="2"/>`;
    }
  }
  return svg(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, {
    size: Math.min(2048, H * 4),
  });
}

const lobbyTex = svg(
  `<svg viewBox="0 0 200 68" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a0"/><stop offset="1" stop-color="#e9a54a"/></linearGradient></defs>
  <rect width="200" height="68" fill="url(#g)"/>
  <rect x="20" y="40" width="60" height="28" fill="#3a2a1c"/>
  <rect x="130" y="30" width="6" height="38" fill="#5a3b22"/><circle cx="133" cy="26" r="9" fill="#4f7a3a"/>
  <circle cx="40" cy="6" r="4" fill="#fff"/><circle cx="100" cy="6" r="4" fill="#fff"/><circle cx="160" cy="6" r="4" fill="#fff"/>
  <rect x="92" y="14" width="16" height="54" fill="#2a2d31" opacity="0.5"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<rect x="${i * 25 - 1}" y="0" width="3" height="68" fill="#1a1b1e"/>`).join("")}
  <rect x="0" y="0" width="200" height="3" fill="#1a1b1e"/><rect x="0" y="12" width="200" height="2.5" fill="#1a1b1e"/>
  </svg>`,
  { size: 512 },
);

const signTex = svg(
  `<svg viewBox="0 0 280 56" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="56" fill="#1d1f22"/><rect width="280" height="5" fill="#c9722f"/>
  <text x="14" y="38" font-family="sans-serif" font-weight="bold" font-size="30" fill="#efe6cf" letter-spacing="3">ALDER HOUSE</text>
  <text x="196" y="50" font-family="sans-serif" font-size="9" fill="#d6aa3a" letter-spacing="2">FLATS 1 – 96</text>
  </svg>`,
  { size: 1024 },
);

const muralTex = svg(
  `<svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0 L100 0 L100 40 L0 70Z" fill="#3f7f86"/>
  <path d="M0 78 L100 48 L100 62 L0 92Z" fill="#d6aa3a"/>
  <circle cx="50" cy="150" r="46" fill="#efe6cf"/>
  <circle cx="50" cy="150" r="36" fill="#e8a33d"/>
  <circle cx="50" cy="150" r="26" fill="#c4532d"/>
  <circle cx="50" cy="150" r="14" fill="#7a2a1c"/>
  <rect x="0" y="196" width="100" height="24" fill="#1d1f22"/>
  <text transform="translate(14,214) " font-family="sans-serif" font-weight="bold" font-size="13" fill="#efe6cf" letter-spacing="3">ALDER HOUSE</text>
  </svg>`,
  { size: 1024 },
);

// ---------------------------------------------------------------------------------------------
// Structure
box(L, FLOORS * FH, D, 0, G + (FLOORS * FH) / 2, 0, CONC); // main body
box(L + 0.4, 0.9, D + 1.2, 0, G - 0.45, 0, CONC_D); // transfer slab
box(L + 0.8, 0.55, 14.6, 0, TOP + 0.1, 0, CONC_L); // roof slab with overhang

// piloti
for (const x of [-21, -14, -7, 7, 14, 21])
  for (const z of [-4.2, 4.2])
    b.frustumBox([x, 0, z], [x, G - 0.9, z], [1.1, 2.0], [1.7, 2.4], { color: CONC_D });
b.frustumBox([0, 0, -4.2], [0, G - 0.9, -4.2], [1.1, 2.0], [1.7, 2.4], { color: CONC_D });
for (const s of [-1, 1]) box(1.2, G - 0.9, 10, s * 23.4, (G - 0.9) / 2, 0, CONC_D); // gable shear walls

// egg-crate front: fins, slabs, parapets
const finH = TOP - (G - 0.35);
for (let i = 0; i <= BAYS; i++) box(0.3, finH, 1.6, -L / 2 + i * BAY, G - 0.35 + finH / 2, 5.5 + 0.8, CONC_D);

const facade = facadeTex(5);
const back = backTex(9);
const r = rng(21);
const panelColors = ["#c9722f", "#3f7f86", "#b8453a", "#d6aa3a"];

for (let f = 0; f < FLOORS; f++) {
  const y0 = G + FH * f;
  box(L, 0.35, 1.6, 0, y0 - 0.175, 6.3, CONC_L); // front balcony slab
  box(L, 1.0, 0.2, 0, y0 + 0.5, 7.0, CONC); // front parapet
  box(L, 0.35, 1.8, 0, y0 - 0.175, -6.4, CONC_L); // back gallery deck
  box(L, 1.1, 0.2, 0, y0 + 0.55, -7.2, CONC); // gallery parapet
  plane(L, 2.4, [0, y0 + 1.5, 5.53], [0, 0, 1], facade);
  plane(L, 2.4, [0, y0 + 1.5, -5.53], [0, 0, -1], back);

  for (let i = 0; i < BAYS; i++) {
    const cx = -L / 2 + i * BAY + BAY / 2;
    if (r() < 0.4) {
      const c = panelColors[Math.floor(r() * panelColors.length)];
      add(c, new THREE.BoxGeometry(BAY - 0.7, 0.7, 0.06), cx, y0 + 0.5, 7.13);
    }
    const k = r();
    const bx = cx + (r() - 0.5) * 2;
    const bz = 5.9 + r() * 0.8;
    if (k < 0.12) {
      add("#b5603a", new THREE.BoxGeometry(0.4, 0.45, 0.4), bx, y0 + 0.225, bz);
      add("#4f7a3a", new THREE.BoxGeometry(0.5, 0.35, 0.5), bx, y0 + 0.6, bz);
    } else if (k < 0.2) {
      add("#26282c", new THREE.BoxGeometry(0.5, 0.45, 0.5), bx, y0 + 0.225, bz);
    } else if (k < 0.27) {
      add("#d8d4c4", new THREE.BoxGeometry(0.9, 0.8, 0.5), bx, y0 + 0.4, bz);
    }
    add("#6f6d67", new THREE.BoxGeometry(0.3, 1.1, 0.3), -L / 2 + i * BAY, y0 + 0.55, -7.2);
  }
}
// satellite dishes on front parapets
for (let k = 0; k < 14; k++) {
  const f = Math.floor(r() * FLOORS);
  const i = Math.floor(r() * BAYS);
  const x = -L / 2 + i * BAY + 0.9 + r() * 2.2;
  const y = G + FH * f + 1.45;
  add("#dcdad2", new THREE.CylinderGeometry(0.4, 0.4, 0.06, 10), x, y, 7.0, 1.05);
  add("#55575c", new THREE.BoxGeometry(0.05, 0.4, 0.05), x, y - 0.3, 6.95);
}
// downpipes on the gallery side
for (const x of [-22, -10, 4, 16]) add("#2b2d30", new THREE.CylinderGeometry(0.09, 0.09, TOP, 6), x, TOP / 2, -7.45);

// roof parapets
for (const z of [-7, 7]) box(L + 0.8, 0.9, 0.3, 0, PTOP + 0.45, z, CONC);
for (const x of [-L / 2 - 0.25, L / 2 + 0.25]) box(0.3, 0.9, 14.6, x, PTOP + 0.45, 0, CONC);

// ---------------------------------------------------------------------------------------------
// Ground-floor lobby, canopy, steps
box(9.6, 3.4, 6.5, 0, 1.7, 0.25, DARK);
glow(plane(9.4, 3.2, [0, 1.75, 3.52], [0, 0, 1], lobbyTex), 0.9);
box(11, 0.4, 3.6, 0, 3.85, 5.3, CONC_L);
for (const x of [-5.1, 5.1]) box(0.35, 3.65, 0.35, x, 1.82, 6.9, CONC_D);
box(9.6, 0.15, 1.8, 0, 0.075, 4.4, CONC);
box(9.6, 0.15, 1.0, 0, 0.225, 3.9, CONC);
// sign wall
box(6, 1.4, 0.35, -9, 0.7, 9, CONC_D);
plane(5.6, 1.12, [-9, 0.75, 9.18], [0, 0, 1], signTex);
// planters and bollards
for (const x of [-19, -14, 13, 19]) {
  box(2.4, 0.6, 1.1, x, 0.3, 8.6, CONC_D);
  add("#55703a", new THREE.BoxGeometry(2.2, 0.2, 0.9), x, 0.7, 8.6);
  add("#6c8a46", new THREE.BoxGeometry(1.2, 0.3, 0.6), x, 0.9, 8.6);
}
for (let i = 0; i < 10; i++) add("#5d5b56", new THREE.CylinderGeometry(0.11, 0.11, 0.85, 6), -4.5 + i, 0.425, 9.8);

// ---------------------------------------------------------------------------------------------
// Stair towers
// Tower A: east end
const TA = 34;
box(5.5, TA, 7, 26.75, TA / 2, 0, CONC_D);
box(6.9, 0.8, 8.4, 26.75, TA + 0.4, 0, CONC_L);
box(3.4, 1.8, 4.6, 26.75, TA + 1.7, 0, CONC);
const slitA5 = slitTex(5.5, 9);
const slitA7 = slitTex(7, 9);
glow(plane(5.5, 9 * FH, [26.75, G + (9 * FH) / 2, 3.52], [0, 0, 1], slitA5), 1.1);
glow(plane(5.5, 9 * FH, [26.75, G + (9 * FH) / 2, -3.52], [0, 0, -1], slitA5), 1.1);
glow(plane(7, 9 * FH, [29.52, G + (9 * FH) / 2, 0], [1, 0, 0], slitA7), 1.1);
// Tower B: back stair core
const TB = 32;
box(5, TB, 5, -9, TB / 2, -8, CONC_D);
box(6.2, 0.8, 6.2, -9, TB + 0.4, -8, CONC_L);
const slitB = slitTex(5, 8);
glow(plane(5, 8 * FH, [-9, G + (8 * FH) / 2, -10.52], [0, 0, -1], slitB), 1.1);
for (const s of [-1, 1]) glow(plane(5, 8 * FH, [-9 + s * 2.52, G + (8 * FH) / 2, -8], [s, 0, 0], slitB), 1.1);
// bridge deck between tower B and the gallery
box(1.6, 0.3, 2.4, -9, G + FH * 3 - 0.15, -6.4, CONC_L);

// gable mural
plane(10, 22, [-L / 2 - 0.03, 16.5, 0], [-1, 0, 0], muralTex);

// ---------------------------------------------------------------------------------------------
// Roof: plant room, tanks, chimneys, aerials
box(14, 3.2, 6, -6, PTOP + 1.6, 0, CONC_D);
box(14.8, 0.3, 6.8, -6, PTOP + 3.35, 0, CONC_L);
for (let k = 0; k < 7; k++) add(DARK, new THREE.BoxGeometry(10, 0.12, 0.1), -6, PTOP + 0.7 + k * 0.3, 3.05);
box(1.6, 2.2, 0.2, -6 + 5.5, PTOP + 1.1, 3.05, "#3a3d42");

for (const x of [13, 18]) {
  box(3.2, 0.7, 3.2, x, PTOP + 0.35, 0, CONC_D);
  b.part(new THREE.CylinderGeometry(1.3, 1.3, 2.4, 10), METAL, { at: [x, PTOP + 1.9, 0] });
  b.part(new THREE.ConeGeometry(1.3, 0.55, 10), "#5f6872", { at: [x, PTOP + 3.37, 0] });
  add("#3a3d42", new THREE.CylinderGeometry(1.34, 1.34, 0.12, 10), x, PTOP + 1.5, 0);
  add("#3a3d42", new THREE.CylinderGeometry(1.34, 1.34, 0.12, 10), x, PTOP + 2.4, 0);
}
for (const [x, z] of [[-20, 2.5], [-18.4, -2], [-21.5, -2.5]] as const) {
  box(0.9, 4.5, 0.9, x, PTOP + 2.25, z, CONC_D);
  box(1.3, 0.3, 1.3, x, PTOP + 4.65, z, CONC_L);
}
// tower aerial and warning light
b.part(new THREE.CylinderGeometry(0.04, 0.05, 4.5, 6), "#4a4d52", { at: [26.75, TA + 4.4, 0] });
add("#4a4d52", new THREE.BoxGeometry(1.6, 0.05, 0.05), 26.75, TA + 5.5, 0);
add("#4a4d52", new THREE.BoxGeometry(1.0, 0.05, 0.05), 26.75, TA + 6.2, 0);
glow(b.part(new THREE.SphereGeometry(0.2, 8, 6), "#ff3a2a", { at: [26.75, TA + 6.8, 0] }), 2);

// flush merged detail
for (const [color, list] of groups) b.part(mergeGeometries(list)!, color, { at: [0, 0, 0] });

export default function build() {
  return b.root;
}
```