```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler with a roof turret, missile racks and a sealed, locked cargo pod.",
};

// ---------- palette ----------
const HULL = "#3a4154";
const DARK = "#12141b";
const STEEL = "#7d8799";
const TIRE = "#17181d";
const CYAN = "#19e6ff";
const MAG = "#ff2d95";
const YEL = "#ffc400";
const RED = "#ff2a3a";

// ---------- textures ----------
const WIND = svg(
  `<svg viewBox="0 0 100 57" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a3c"/><stop offset="1" stop-color="#05121f"/></linearGradient></defs>
  <rect width="100" height="57" fill="url(#g)"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="0" y="${i * 5 + 2}" width="100" height="0.8" fill="#19e6ff" opacity="0.18"/>`).join("")}
  <path d="M8 46 Q50 24 92 46" stroke="#19e6ff" stroke-width="1.6" fill="none" opacity="0.8"/>
  <path d="M20 46 Q50 32 80 46" stroke="#ff2d95" stroke-width="1.2" fill="none" opacity="0.8"/>
  <circle cx="50" cy="30" r="6" stroke="#19e6ff" stroke-width="1" fill="none"/>
  <path d="M44 30h-8M56 30h8M50 24v-5M50 36v5" stroke="#19e6ff" stroke-width="1"/>
  <text x="6" y="10" font-family="monospace" font-size="6" fill="#19e6ff">ESC:ON  SPD 072</text>
  <text x="70" y="10" font-family="monospace" font-size="6" fill="#ff2d95">PODLOCK OK</text>
  <path d="M0 0 L100 57" stroke="#ffffff" stroke-width="0.8" opacity="0.12"/>
</svg>`,
  { size: 256 },
);

const SIDEWIN = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="40" rx="4" fill="#06101a" stroke="#19e6ff" stroke-width="2.5"/>
  ${[18, 36, 54, 72].map((x) => `<rect x="${x}" y="3" width="3" height="34" fill="#2a3040"/>`).join("")}
  <path d="M6 34 L30 6" stroke="#9ff6ff" stroke-width="1.5" opacity="0.5"/>
  <path d="M20 36 L40 12" stroke="#9ff6ff" stroke-width="1" opacity="0.35"/>
</svg>`,
  { size: 256 },
);

const HAZARD = svg(
  `<svg viewBox="0 0 100 14" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="14" fill="#ffc400"/>
  ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 14 - 14} 14 L${i * 14} 0 L${i * 14 + 7} 0 L${i * 14 - 7} 14Z" fill="#14151a"/>`).join("")}
  <rect width="100" height="14" fill="none" stroke="#14151a" stroke-width="2"/>
</svg>`,
  { size: 256 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 100 35" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="35" fill="#0c0e14" stroke="#ff2d95" stroke-width="2"/>
  ${Array.from({ length: 9 }, (_, i) => `<rect x="${6 + i * 10.5}" y="5" width="6" height="25" fill="#222736"/><rect x="${6 + i * 10.5}" y="5" width="2" height="25" fill="#19e6ff" opacity="0.6"/>`).join("")}
  <path d="M38 12 L50 22 L62 12 L62 17 L50 27 L38 17Z" fill="#ff2d95"/>
</svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M25 2 L46 12 L46 32 L25 48 L4 32 L4 12Z" fill="#12141b" stroke="#ff2d95" stroke-width="3"/>
  <path d="M25 12 L37 24 L25 20 L13 24Z" fill="#19e6ff"/>
  <path d="M25 24 L37 36 L25 32 L13 36Z" fill="#ffc400"/>
</svg>`,
  { size: 128 },
);

const PODSIDE = svg(
  `<svg viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="158" height="58" rx="3" fill="#1a1e2b" stroke="#19e6ff" stroke-width="2"/>
  <rect x="4" y="4" width="152" height="6" fill="#ffc400"/>
  ${Array.from({ length: 19 }, (_, i) => `<path d="M${4 + i * 8} 10 L${8 + i * 8} 4 L${12 + i * 8} 4 L${8 + i * 8} 10Z" fill="#14151a"/>`).join("")}
  <path d="M22 18 L38 14 L54 18 L54 38 L38 48 L22 38Z" fill="none" stroke="#ff2d95" stroke-width="3"/>
  <path d="M30 28 L38 22 L46 28 L38 40Z" fill="#19e6ff"/>
  <text x="64" y="30" font-family="sans-serif" font-weight="bold" font-size="16" fill="#e8f4ff">SEALED CARGO</text>
  <text x="64" y="44" font-family="monospace" font-size="8" fill="#ff2d95">NOVA-7 // CLASS A // BONDED</text>
  ${Array.from({ length: 24 }, (_, i) => `<rect x="${64 + i * 3.6}" y="49" width="${i % 3 ? 1.4 : 2.4}" height="7" fill="#e8f4ff"/>`).join("")}
</svg>`,
  { size: 512 },
);

const DOOR = svg(
  `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="110" fill="#242a3a" stroke="#0c0e14" stroke-width="3"/>
  <rect x="6" y="6" width="88" height="98" fill="none" stroke="#5b6785" stroke-width="2"/>
  <line x1="50" y1="6" x2="50" y2="104" stroke="#0c0e14" stroke-width="2.5"/>
  <circle cx="50" cy="52" r="20" fill="#12141b" stroke="#ff2d95" stroke-width="3"/>
  <circle cx="50" cy="52" r="12" fill="none" stroke="#19e6ff" stroke-width="2"/>
  <path d="M50 40v24M38 52h24" stroke="#19e6ff" stroke-width="2"/>
  <rect x="6" y="84" width="88" height="10" fill="#ffc400"/>
  ${Array.from({ length: 12 }, (_, i) => `<path d="M${6 + i * 8} 94 L${10 + i * 8} 84 L${14 + i * 8} 84 L${10 + i * 8} 94Z" fill="#14151a"/>`).join("")}
  <text x="50" y="102" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="7" fill="#ff2a3a">DO NOT OPEN</text>
  <text x="50" y="20" text-anchor="middle" font-family="monospace" font-size="7" fill="#19e6ff">SEAL 0xA7F3</text>
</svg>`,
  { size: 256 },
);

// ---------- paints ----------
const podPaint = paint((p, n) => {
  let c = mix("#2f3a4f", "#4a5870", noise(p, 0.8, 3));
  c = mix(c, "#6c7c98", smoothstep(0.5, 1, n.y) * 0.5);
  const sz = Math.abs((((p.z + 9) / 0.9) % 1) - 0.5);
  if (sz > 0.488 && Math.abs(n.z) < 0.5) c = mix(c, "#0c0e14", 0.8);
  c = mix(c, "#2a2218", smoothstep(1.9, 1.3, p.y) * 0.7 * noise(p, 0.3, 5));
  return c;
});
const cabPaint = paint((p, n) => {
  let c = mix("#383f55", "#4d5875", noise(p, 0.6, 7));
  c = mix(c, "#7a88a8", smoothstep(0.6, 1, n.y) * 0.5);
  const sy = Math.abs((((p.y + 5) / 0.7) % 1) - 0.5);
  if (sy > 0.485 && Math.abs(n.y) < 0.5) c = mix(c, "#0c0e14", 0.8);
  c = mix(c, "#2a2218", smoothstep(1.7, 1.1, p.y) * 0.7 * noise(p, 0.25, 9));
  return c;
});
const chassisPaint = paint((p) => mix("#1a1c24", "#2c2f3b", noise(p, 0.3, 11)));

// ---------- builder + helpers ----------
export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  type V = [number, number, number];
  const P = (g: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(g, color, { at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: V, dir: V = [0, 1, 0], o: any = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, { dir, ...o });
  const decal = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, o: any = {}) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, ...o });
  const sides = [1, -1];

  // ---- chassis ----
  box(2.4, 0.5, 8.8, chassisPaint, [0, 0.85, -0.3]);
  box(1.6, 0.3, 8.4, DARK, [0, 0.55, -0.3]);
  glow(box(2.1, 0.05, 7.6, CYAN, [0, 0.38, -0.3]), 1.4);
  // axles
  for (const z of [3.0, -2.2, -3.4]) cyl(0.09, 0.09, 3.2, 8, STEEL, [0, 0.6, z], [1, 0, 0]);
  // side skirts with neon
  for (const s of sides) {
    box(0.08, 0.55, 4.0, HULL, [s * 1.25, 0.95, 0.3]);
    glow(box(0.04, 0.06, 3.8, MAG, [s * 1.3, 0.78, 0.3]), 1.4);
    P(new THREE.PlaneGeometry(1.0, 0.14), "#ffffff", [s * 1.3, 1.1, 0.3], { dir: [s, 0, 0], axis: "z", texture: HAZARD });
    // angled armour gussets
    box(0.1, 0.5, 0.9, HULL, [s * 1.25, 0.95, 2.45], { rotation: [0, 0, 0] });
    // fuel tanks
    cyl(0.28, 0.28, 1.6, 8, STEEL, [s * 1.1, 0.55, -0.9], [0, 0, 1]);
    cyl(0.29, 0.29, 0.1, 8, YEL, [s * 1.1, 0.55, -0.1], [0, 0, 1]);
    cyl(0.29, 0.29, 0.1, 8, YEL, [s * 1.1, 0.55, -1.7], [0, 0, 1]);
  }

  // ---- wheels ----
  const wheels: [number, number][] = [];
  for (const z of [3.0, -2.2, -3.4]) for (const s of sides) wheels.push([s, z]);
  for (const [s, z] of wheels) {
    cyl(0.6, 0.6, 0.55, 12, TIRE, [s * 1.5, 0.6, z], [1, 0, 0]);
    // tread lugs
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      box(0.57, 0.1, 0.16, "#0c0d11", [s * 1.5, 0.6 + Math.sin(a) * 0.6, z + Math.cos(a) * 0.6], {
        rotation: [(-a * 180) / Math.PI, 0, 0],
      });
    }
    cyl(0.34, 0.34, 0.62, 6, metalLike(), [s * 1.5, 0.6, z], [1, 0, 0]);
    glow(cyl(0.14, 0.14, 0.68, 8, CYAN, [s * 1.5, 0.6, z], [1, 0, 0]), 1.5);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      cyl(0.03, 0.03, 0.66, 5, DARK, [s * 1.5, 0.6 + Math.sin(a) * 0.25, z + Math.cos(a) * 0.25], [1, 0, 0]);
    }
  }
  function metalLike() {
    return STEEL;
  }
  // fenders
  for (const z of [3.0]) for (const s of sides) {
    box(0.8, 0.1, 1.5, HULL, [s * 1.52, 1.3, z]);
    box(0.8, 0.1, 0.5, HULL, [s * 1.52, 1.18, z + 0.85], { rotation: [-35, 0, 0] });
  }
  for (const s of sides) {
    box(0.8, 0.1, 2.6, HULL, [s * 1.52, 1.3, -2.8]);
    box(0.5, 0.6, 0.06, DARK, [s * 1.5, 0.7, -4.25]); // mud flap
  }
  // ---- cab ----
  const cab = b.extrude(
    [
      [1.2, 1.1],
      [4.2, 1.1],
      [4.2, 2.0],
      [3.5, 2.9],
      [1.2, 2.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.04, color: cabPaint },
  );
  void cab;
  box(2.0, 0.12, 2.0, DARK, [0, 2.97, 2.4]); // roof plate
  glow(box(1.9, 0.1, 0.14, MAG, [0, 2.98, 3.5]), 1.6);
  glow(box(1.9, 0.1, 0.14, CYAN, [0, 2.98, 1.45]), 1.6);
  // windscreen
  decal(1.9, 1.14, WIND, [0, 2.462, 3.866], [0, 0.6, 0.8]);
  // blast visor over windscreen
  box(2.05, 0.1, 0.5, DARK, [0, 2.88, 3.62], { rotation: [-37, 0, 0] });
  for (const s of sides) {
    decal(1.5, 0.6, SIDEWIN, [s * 1.162, 2.4, 2.7], [s, 0, 0]);
    decal(0.6, 0.6, EMBLEM, [s * 1.162, 1.9, 1.7], [s, 0, 0]);
    // door seam + handle
    box(0.04, 1.4, 0.04, DARK, [s * 1.16, 2.0, 3.45]);
    box(0.05, 0.1, 0.3, STEEL, [s * 1.18, 1.95, 3.1]);
    // mirrors
    box(0.05, 0.05, 0.4, DARK, [s * 1.3, 2.5, 3.55]);
    box(0.08, 0.5, 0.3, HULL, [s * 1.45, 2.5, 3.6]);
    glow(box(0.02, 0.4, 0.2, CYAN, [s * 1.495, 2.5, 3.6]), 1);
    // headlights
    glow(box(0.5, 0.16, 0.05, "#e8fcff", [s * 0.85, 1.7, 4.21]), 1.8);
    // fog lights
    glow(cyl(0.09, 0.09, 0.06, 8, YEL, [s * 1.0, 1.25, 4.62], [0, 0, 1]), 1.5);
    // exhaust stacks
    cyl(0.1, 0.1, 2.0, 8, STEEL, [s * 1.45, 2.3, 1.05]);
    cyl(0.14, 0.1, 0.18, 8, DARK, [s * 1.45, 3.35, 1.05]);
    box(0.1, 1.0, 0.1, DARK, [s * 1.3, 1.75, 1.05]);
    glow(box(0.04, 0.8, 0.05, MAG, [s * 1.47, 1.8, 1.0]), 1.3);
    // roof missile racks
    box(0.42, 0.42, 1.0, HULL, [s * 0.8, 3.2, 1.75], { rotation: [-18, 0, 0] });
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      cyl(0.075, 0.075, 0.06, 8, DARK, [s * 0.8 - 0.1 + i * 0.2, 3.2 + j * 0.18 - 0.07, 2.26], [0, 0.3, 1]);
    }
    glow(box(0.3, 0.03, 0.03, RED, [s * 0.8, 3.45, 1.55]), 1.2);
    // antennas
    cyl(0.012, 0.02, 1.8, 5, DARK, [s * 1.0, 3.9, 1.35], [s * 0.15, 1, -0.1]);
    glow(P(new THREE.SphereGeometry(0.04, 6, 4), RED, [s * 1.15, 4.8, 1.3]), 1.6);
  }
  // grille + bumper
  decal(2.0, 0.7, GRILLE, [0, 1.55, 4.215], [0, 0, 1]);
  box(2.7, 0.45, 0.5, HULL, [0, 0.8, 4.3]);
  decal(2.5, 0.35, HAZARD, [0, 0.82, 4.555], [0, 0, 1]);
  box(2.6, 0.25, 0.4, DARK, [0, 1.12, 4.38], { rotation: [25, 0, 0] });
  for (let i = -2; i <= 2; i++) {
    cyl(0.0, 0.1, 0.4, 5, STEEL, [i * 0.5, 0.8, 4.75], [0, 0, 1], {});
  }
  glow(box(2.5, 0.05, 0.06, CYAN, [0, 0.52, 4.5]), 1.6);

  // ---- roof turret ----
  cyl(0.55, 0.6, 0.2, 8, DARK, [0, 3.12, 2.3]);
  box(1.0, 0.45, 1.0, HULL, [0, 3.5, 2.3]);
  box(1.0, 0.18, 0.6, DARK, [0, 3.38, 2.8], { rotation: [-20, 0, 0] });
  for (const s of sides) {
    cyl(0.07, 0.07, 1.4, 8, DARK, [s * 0.25, 3.55, 3.2], [0, 0, 1]);
    cyl(0.1, 0.1, 0.35, 8, STEEL, [s * 0.25, 3.55, 3.75], [0, 0, 1]);
    glow(cyl(0.05, 0.05, 0.04, 6, MAG, [s * 0.25, 3.55, 3.95], [0, 0, 1]), 1.5);
    box(0.2, 0.3, 0.5, STEEL, [s * 0.6, 3.5, 2.2]); // ammo boxes
  }
  P(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), DARK, [0, 3.72, 2.0]);
  glow(P(new THREE.SphereGeometry(0.09, 6, 4), CYAN, [0, 3.76, 2.15]), 1.6);

  // ---- cargo pod ----
  const OX = 2.55;
  const pod: [number, number][] = [
    [-0.8, 1.3], [0.8, 1.3], [1.3, 1.8], [1.3, 3.3], [0.8, 3.8], [-0.8, 3.8], [-1.3, 3.3], [-1.3, 1.8],
  ];
  b.extrude(pod, { at: [0, 0, -1.85], x: [1, 0, 0], thickness: 5.5, bevel: 0.04, color: podPaint });
  // coupling
  box(1.6, 0.9, 0.5, DARK, [0, 2.0, 1.05]);
  cyl(0.06, 0.06, 0.9, 6, MAG, [0.5, 2.8, 1.05], [0, 0, 1], { rotation: [0, 0, 0] });
  // reinforcing ribs
  const scaleO = (k: number) => pod.map(([x, y]) => [x * k, OX + (y - OX) * k] as [number, number]);
  for (const z of [0.55, -0.7, -1.9, -3.1, -4.35]) {
    b.extrude(scaleO(1.05), { at: [0, 0, z], x: [1, 0, 0], thickness: 0.16, color: "#262b3a" });
    glow(box(0.04, 0.04, 0.04, CYAN, [0, 3.84, z]), 1);
  }
  // top seal strip + vents
  glow(box(0.12, 0.05, 5.2, MAG, [0, 3.83, -1.85]), 1.3);
  for (let i = 0; i < 4; i++) box(0.9, 0.08, 0.3, DARK, [0, 3.84, -0.5 - i * 0.9], { });
  // side labels
  for (const s of sides) {
    decal(3.2, 1.2, PODSIDE, [s * 1.312, 2.55, -1.85], [s, 0, 0]);
    // cargo lock clamps on chamfers
    for (const z of [0.2, -3.9]) {
      box(0.18, 0.5, 0.3, STEEL, [s * 1.1, 3.55, z], { rotation: [0, 0, s * 40] });
      glow(box(0.06, 0.12, 0.2, MAG, [s * 1.2, 3.6, z]), 1.3);
    }
    glow(box(0.04, 1.2, 0.05, CYAN, [s * 1.31, 2.55, 0.4]), 1.4);
    glow(box(0.04, 1.2, 0.05, CYAN, [s * 1.31, 2.55, -4.1]), 1.4);
    // pod running lights
    glow(box(0.06, 0.08, 0.3, YEL, [s * 1.3, 1.5, -0.4]), 1.2);
  }
  // rear door
  decal(2.0, 2.2, DOOR, [0, 2.55, -4.61], [0, 0, -1]);
  for (const s of sides) {
    box(0.12, 2.3, 0.12, STEEL, [s * 0.95, 2.55, -4.66]);
    glow(box(0.08, 0.3, 0.05, MAG, [s * 0.95, 3.4, -4.73]), 1.6);
  }
  // rear chassis + lights
  box(2.7, 0.3, 0.35, HULL, [0, 0.9, -4.8]);
  decal(2.5, 0.28, HAZARD, [0, 0.9, -4.98], [0, 0, -1]);
  for (const s of sides) glow(box(0.5, 0.18, 0.05, RED, [s * 0.9, 1.2, -4.99]), 1.6);

  // ---- rear gun on pod ----
  cyl(0.35, 0.4, 0.15, 8, DARK, [0, 3.92, -4.05]);
  box(0.5, 0.3, 0.6, HULL, [0, 4.1, -4.05]);
  for (const s of sides) cyl(0.05, 0.05, 0.9, 8, DARK, [s * 0.12, 4.12, -4.7], [0, 0, 1]);
  glow(box(0.2, 0.06, 0.04, RED, [0, 4.2, -3.76]), 1.4);

  // ---- sensor mast on pod top ----
  cyl(0.04, 0.04, 0.7, 6, STEEL, [0.6, 4.15, -0.2]);
  b.lathe(
    [[0, 0], [0.3, 0.12], [0.3, 0.15], [0, 0.04]],
    { at: [0.6, 4.55, -0.2], axis: [0.3, 1, 0.5], color: STEEL, segments: 8 },
  );
  glow(P(new THREE.SphereGeometry(0.05, 6, 4), CYAN, [0.62, 4.62, -0.15]), 1.6);

  return b.root;
}
```