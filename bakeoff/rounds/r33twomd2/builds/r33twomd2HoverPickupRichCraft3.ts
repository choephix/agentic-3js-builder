import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { mottle, stripes } from "../../../../src/index";

export const meta = {
  name: "hover-technical",
  description:
    "Militarized pickup truck with its wheels replaced by four ducted hover thrusters: armored low-poly cyberpunk technical with a roof light bar, bed-mounted twin gun, rocket pods and neon underglow.",
};

// ---------- palette ----------
const MAG = "#ff2e97";
const CYAN = "#19e6ff";
const WHITE = "#eaf6ff";
const RED = "#ff2a2a";
const AMBER = "#ffb02e";
const DARK = "#14181d";
const BLACK = "#08090c";
const YEL = "#e8c020";

const HULL = panelled(mottle("#2d3b34", "#3d4c3e", { size: 0.6, seed: 4 }), { size: 0.45, rivets: 0.06 });
const ARMOR = panelled(metal("iron", { tarnish: 0.5, seed: 2 }), { size: 0.25 });
const IRON = metal("iron", { seed: 7 });
const STEEL = metal("steel", { tarnish: 0.35 });
const HAZARD = stripes(YEL, "#15151a", { size: 0.16, axis: "x", width: 0.5, wobble: 0 });

// ---------- textures ----------
let blades = "";
for (let i = 0; i < 9; i++)
  blades += `<g transform="rotate(${i * 40} 50 50)"><path d="M50 50 L44 12 Q52 4 60 14 Z" fill="#19e6ff" stroke="#c9fbff" stroke-width="1"/></g>`;
const FAN = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#06141c"/><circle cx="50" cy="50" r="44" fill="none" stroke="#19e6ff" stroke-width="2"/>${blades}<circle cx="50" cy="50" r="9" fill="#ff2e97"/><circle cx="50" cy="50" r="4" fill="#fff"/></svg>`,
  { size: 128 },
);

let slats = "";
for (let i = 0; i < 9; i++) slats += `<rect x="${8 + i * 23}" y="8" width="9" height="44" fill="#050608"/>`;
const GRILLE = svg(
  `<svg viewBox="0 0 220 60"><rect width="220" height="60" fill="#1a2026"/><rect x="2" y="2" width="216" height="56" fill="none" stroke="#4a5560" stroke-width="3"/>${slats}<path d="M10 30 L110 8 L210 30" stroke="#ff2e97" stroke-width="4" fill="none"/><path d="M10 40 L110 18 L210 40" stroke="#19e6ff" stroke-width="2" fill="none"/></svg>`,
  { size: 256 },
);

const DOOR = svg(
  `<svg viewBox="0 0 240 110">
  <rect x="3" y="3" width="234" height="104" rx="6" fill="none" stroke="#0a0d10" stroke-width="3"/>
  <path d="M120 3 V107" stroke="#0a0d10" stroke-width="3"/>
  <rect x="104" y="40" width="12" height="5" fill="#0a0d10"/>
  <rect x="3" y="84" width="234" height="20" fill="#e8c020"/>
  <path d="M10 104 L30 84 M40 104 L60 84 M70 104 L90 84 M100 104 L120 84 M130 104 L150 84 M160 104 L180 84 M190 104 L210 84 M220 104 L236 88" stroke="#15151a" stroke-width="9"/>
  <circle cx="45" cy="45" r="26" fill="#0a0d10"/><circle cx="45" cy="45" r="22" fill="none" stroke="#ff2e97" stroke-width="3"/>
  <path d="M45 28 L50 41 L64 41 L53 49 L57 62 L45 54 L33 62 L37 49 L26 41 L40 41 Z" fill="#19e6ff"/>
  <text x="134" y="58" font-family="monospace" font-weight="bold" font-size="42" fill="#eaf6ff" stroke="#0a0d10" stroke-width="2">07</text>
  <text x="134" y="76" font-family="monospace" font-size="12" fill="#ff2e97">HOVER CORPS</text>
</svg>`,
  { size: 384 },
);

const HOODMARK = svg(
  `<svg viewBox="0 0 200 120">
  <circle cx="100" cy="60" r="46" fill="none" stroke="#eaf6ff" stroke-width="5" opacity="0.85"/>
  <text x="100" y="78" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="52" fill="#eaf6ff" opacity="0.9">H7</text>
  <path d="M20 30 L40 15 L60 30 M20 50 L40 35 L60 50" stroke="#e8c020" stroke-width="7" fill="none"/>
  <path d="M140 30 L160 15 L180 30 M140 50 L160 35 L180 50" stroke="#e8c020" stroke-width="7" fill="none"/>
  <path d="M10 108 H190" stroke="#ff2e97" stroke-width="4"/>
</svg>`,
  { size: 256 },
);

const GLASS = svg(
  `<svg viewBox="0 0 100 50"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d3c4e"/><stop offset="1" stop-color="#05121c"/></linearGradient></defs>
  <rect width="100" height="50" fill="url(#g)"/>
  <path d="M10 50 L38 0 L48 0 L20 50 Z" fill="#19e6ff" opacity="0.35"/><path d="M52 50 L80 0 L84 0 L56 50 Z" fill="#ff2e97" opacity="0.3"/>
  <rect x="3" y="3" width="94" height="44" fill="none" stroke="#050a10" stroke-width="3"/></svg>`,
  { size: 192 },
);

const PLATE = svg(
  `<svg viewBox="0 0 120 60"><rect width="120" height="60" rx="5" fill="#e9e2a8"/><rect x="4" y="4" width="112" height="52" rx="3" fill="none" stroke="#1a1a1a" stroke-width="3"/><text x="60" y="40" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#1a1a1a">NEO-77</text><rect x="8" y="8" width="104" height="6" fill="#ff2e97"/></svg>`,
  { size: 192 },
);

let holes = "";
for (let i = 0; i < 3; i++)
  for (let j = 0; j < 3; j++)
    holes += `<circle cx="${20 + i * 30}" cy="${20 + j * 30}" r="12" fill="#050607" stroke="#6a727c" stroke-width="3"/><circle cx="${20 + i * 30}" cy="${20 + j * 30}" r="5" fill="#ff7a1a"/>`;
const PODFACE = svg(`<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#2a3036"/>${holes}</svg>`, { size: 160 });

// ---------- builder ----------
export default function build() {
  const b = createBuilder({ name: "hover-technical" });

  const B = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const G = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, s = 1.3) =>
    glow(B(w, h, d, c, x, y, z), s);
  const Cy = (r: number, h: number, c: any, x: number, y: number, z: number, dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z], dir });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

  // ----- chassis -----
  B(1.9, 0.3, 5.2, IRON, 0, 0.75, 0);
  B(1.2, 0.18, 3.4, DARK, 0, 0.58, 0); // battery / reactor pack
  for (let i = 0; i < 6; i++) B(1.3, 0.04, 0.1, STEEL, 0, 0.47, -1.5 + i * 0.6);
  for (const s of [1, -1]) {
    B(0.1, 0.3, 2.1, ARMOR, s * 0.97, 0.78, 0.2); // side skirt armour
    G(0.03, 0.04, 2.0, CYAN, s * 1.03, 0.66, 0.2, 1.5); // underglow
    G(0.03, 0.04, 1.2, MAG, s * 1.03, 0.66, -1.9, 1.5);
  }

  // ----- hood -----
  b.frustumBox([0, 1.1, 0.9], [0, 1.1, 2.55], [1.9, 0.5], [1.8, 0.5], { color: HULL });
  B(1.0, 0.08, 0.7, ARMOR, 0, 1.38, 1.3); // scoop
  B(0.9, 0.12, 0.1, DARK, 0, 1.36, 1.68);
  for (let i = 0; i < 4; i++) B(0.7, 0.02, 0.05, BLACK, 0, 1.355, 1.85 + i * 0.1);
  for (const s of [1, -1]) G(0.04, 0.02, 1.4, MAG, s * 0.7, 1.355, 1.7, 1.4);
  plane(0.9, 0.54, HOODMARK, [0, 1.357, 2.0], [0, 1, 0], [0, 0, 1]);
  plane(1.1, 0.3, GRILLE, [0, 1.2, 2.56], [0, 0, 1]);
  for (const s of [1, -1]) {
    G(0.34, 0.16, 0.06, WHITE, s * 0.75, 1.2, 2.58, 1.6);
    G(0.34, 0.03, 0.07, AMBER, s * 0.75, 1.08, 2.58, 1.4);
    B(0.42, 0.24, 0.04, DARK, s * 0.75, 1.2, 2.555);
  }
  // bumper / bull bar
  B(2.0, 0.35, 0.25, HAZARD, 0, 0.8, 2.68);
  G(1.8, 0.03, 0.05, MAG, 0, 0.62, 2.8, 1.6);
  for (const s of [1, -1]) b.rod([s * 0.55, 0.9, 2.75], [s * 0.55, 1.28, 2.78], 0.04, IRON);
  b.rod([-0.55, 1.28, 2.78], [0.55, 1.28, 2.78], 0.04, IRON);
  Cy(0.1, 0.18, STEEL, 0, 0.8, 2.84, [0, 0, 1], 8);

  // ----- cab -----
  const cab: [number, number][] = [
    [-0.95, 0.9], [0.95, 0.9], [0.95, 1.5], [0.55, 2.05], [-0.7, 2.05], [-0.95, 1.9],
  ];
  b.extrude(cab, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.85, bevel: 0.04, color: HULL });
  glow(
    b.extrude(
      [[-0.6, 1.6], [0.5, 1.6], [0.25, 1.95], [-0.6, 1.95]],
      { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, color: "#0e3a4a" },
    ),
    0.35,
  );
  for (const s of [1, -1]) {
    B(0.02, 0.4, 0.06, ARMOR, s * 0.96, 1.78, -0.05);
    plane(1.2, 0.55, DOOR, [s * 0.935, 1.2, 0.15], [s, 0, 0]);
    // mirror
    b.rod([s * 0.93, 1.5, 0.7], [s * 1.08, 1.6, 0.72], 0.02, IRON);
    B(0.05, 0.2, 0.14, ARMOR, s * 1.1, 1.62, 0.72);
    G(0.01, 0.12, 0.08, CYAN, s * 1.13, 1.62, 0.72, 0.8);
  }
  const wn = new THREE.Vector3(0, 0.4, 0.55).normalize();
  plane(1.62, 0.66, GLASS, [0 + wn.x * 0.012, 1.775 + wn.y * 0.012, 0.75 + wn.z * 0.012], [wn.x, wn.y, wn.z]);
  plane(1.5, 0.4, GLASS, [0, 1.7, -0.962], [0, 0, -1]);
  B(1.5, 0.06, 1.2, ARMOR, 0, 2.07, -0.08); // roof plate
  for (const s of [1, -1]) B(0.06, 0.07, 1.2, STEEL, s * 0.7, 2.13, -0.08); // rails

  // roof light bar
  B(1.1, 0.07, 0.2, DARK, 0, 2.14, 0.25);
  G(0.5, 0.08, 0.16, CYAN, 0.28, 2.2, 0.25, 1.8);
  G(0.5, 0.08, 0.16, MAG, -0.28, 2.2, 0.25, 1.8);
  // antennas & dish
  b.rod([-0.7, 2.1, -0.5], [-0.9, 3.05, -0.7], 0.012, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [-0.9, 3.07, -0.7] }), 2);
  b.rod([0.55, 2.1, -0.45], [0.55, 2.4, -0.45], 0.025, IRON);
  b.lathe([[0, 0], [0.24, 0.1], [0.24, 0.13], [0, 0.04]], { at: [0.55, 2.4, -0.45], axis: [0.35, 1, 0.45], color: STEEL });
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), AMBER, { at: [0.62, 2.55, -0.38] }), 1.6);

  // ----- bed -----
  B(1.9, 0.1, 1.75, ARMOR, 0, 0.95, -1.825);
  for (const s of [1, -1]) B(0.08, 0.45, 1.75, HULL, s * 0.91, 1.2, -1.825);
  B(1.9, 0.45, 0.08, HULL, 0, 1.2, -2.66); // tailgate
  B(1.74, 0.5, 0.08, ARMOR, 0, 1.25, -0.99); // bulkhead
  for (const s of [1, -1]) {
    G(0.35, 0.12, 0.05, RED, s * 0.62, 1.3, -2.71, 1.6);
    Cy(0.08, 0.3, DARK, s * 0.6, 0.78, -2.72, [0, 0, 1]);
    glow(b.part(new THREE.CircleGeometry(0.065, 8), MAG, { at: [s * 0.6, 0.78, -2.875], dir: [0, 0, -1], axis: "z" }), 2);
  }
  plane(0.4, 0.2, PLATE, [0, 1.12, -2.705], [0, 0, -1]);
  // cargo
  for (const s of [1, -1]) Cy(0.22, 0.6, HAZARD, s * 0.55, 1.3, -2.25, [0, 1, 0], 8);
  B(0.6, 0.4, 0.5, IRON, -0.55, 1.2, -1.45);
  G(0.3, 0.06, 0.3, CYAN, -0.55, 1.43, -1.45, 1.6);
  B(0.4, 0.3, 0.4, ARMOR, 0.55, 1.15, -1.5);
  // rocket pods
  for (const s of [1, -1]) {
    B(0.36, 0.36, 1.0, ARMOR, s * 0.85, 1.63, -1.6);
    plane(0.34, 0.34, PODFACE, [s * 0.85, 1.63, -1.095], [0, 0, 1]);
    B(0.38, 0.04, 0.2, HAZARD, s * 0.85, 1.83, -1.9);
  }
  // gun mount
  Cy(0.14, 1.3, STEEL, 0, 1.6, -1.85, [0, 1, 0], 8);
  for (const s of [1, -1]) b.rod([s * 0.1, 1.9, -1.85], [s * 0.75, 1.0, -1.85 - s * 0.0], 0.03, IRON);
  Cy(0.32, 0.12, ARMOR, 0, 2.25, -1.85, [0, 1, 0], 10);
  B(0.5, 0.3, 0.55, ARMOR, 0, 2.45, -1.85);
  for (const s of [1, -1]) {
    Cy(0.04, 1.1, DARK, s * 0.13, 2.45, -1.15, [0, 0, 1], 6);
    Cy(0.065, 0.14, STEEL, s * 0.13, 2.45, -0.57, [0, 0, 1], 6);
    glow(b.part(new THREE.CircleGeometry(0.05, 6), AMBER, { at: [s * 0.13, 2.45, -0.495], dir: [0, 0, 1], axis: "z" }), 1.4);
  }
  B(0.9, 0.5, 0.05, HULL, 0, 2.45, -1.55, { rotation: [-12, 0, 0] }); // gun shield
  G(0.5, 0.03, 0.04, MAG, 0, 2.72, -1.55, 1.6);
  B(0.18, 0.22, 0.26, IRON, 0.36, 2.4, -1.9);

  // ----- hover pods -----
  const profile: [number, number][] = [[0.36, 0], [0.5, 0], [0.52, 0.18], [0.5, 0.5], [0.4, 0.55], [0.36, 0.4]];
  for (const s of [1, -1])
    for (const z of [1.65, -1.65]) {
      const x = s * 1.3;
      b.lathe(profile, { at: [x, 0, z], color: ARMOR, segments: 12 });
      glow(b.part(new THREE.TorusGeometry(0.45, 0.02, 4, 16), MAG, { at: [x, 0.52, z], rotation: [90, 0, 0] }), 1.6);
      glow(plane(0.72, 0.72, FAN, [x, 0.3, z], [0, 1, 0]), 1.3);
      glow(plane(0.72, 0.72, FAN, [x, 0.12, z], [0, -1, 0]), 1.6);
      Cy(0.06, 0.28, STEEL, x, 0.2, z, [0, 1, 0], 6);
      for (const k of [-1, 1]) {
        b.rod([s * 0.9, 0.78, z + k * 0.25], [x - s * 0.05, 0.45, z + k * 0.28], 0.065, IRON);
        B(0.12, 0.1, 0.14, HAZARD, x, 0.55, z + k * 0.46);
      }
      // wing stub / intake cover
      B(0.7, 0.1, 1.15, HULL, s * 1.18, 0.8, z);
      G(0.7, 0.025, 0.04, CYAN, s * 1.18, 0.86, z + 0.55, 1.4);
      for (let i = 0; i < 3; i++) B(0.4, 0.02, 0.06, BLACK, s * 1.18, 0.862, z - 0.2 + i * 0.15);
    }

  return b.root;
}
