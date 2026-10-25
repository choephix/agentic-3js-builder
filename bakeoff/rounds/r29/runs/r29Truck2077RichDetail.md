```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Warden MX-2077",
  description: "Low-poly cyberpunk militarized 6x6 truck with turret, missile pods, neon trim and armored cargo box.",
};

const BLACK = "#14151c";
const GUN = "#2b2e3a";
const DARK = "#1a1c26";
const CYAN = "#2ef2ff";
const MAG = "#ff2d95";
const ORANGE = "#ff8a1c";
const RED = "#ff2a2a";
const YEL = "#ffd21a";
const RUBBER = "#0e0e12";

const HULL = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.55, rivets: 0.09 });
const CAB = panelled(metal("blued", { tarnish: 0.35, polish: 0.2 }), { size: 0.5, rivets: 0.08, seam: "#0a0a12" });
const STEEL = metal("steel", { tarnish: 0.4 });
const BRASS = metal("brass", { tarnish: 0.5 });

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 3 L58 12 V34 Q58 52 32 61 Q6 52 6 34 V12Z" fill="#101018" stroke="#ff2d95" stroke-width="3"/>
  <path d="M32 12 L50 18 V33 Q50 45 32 52 Q14 45 14 33 V18Z" fill="none" stroke="#2ef2ff" stroke-width="2"/>
  <path d="M18 30 L32 20 L46 30 M18 38 L32 28 L46 38" stroke="#ffd21a" stroke-width="4" fill="none"/>
  <circle cx="32" cy="44" r="3" fill="#ff2d95"/></svg>`,
  { size: 192 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffd21a"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 8} 0 L${i * 10 + 2} 16Z" fill="#14151c"/>`).join("")}
  <rect width="64" height="16" fill="none" stroke="#14151c" stroke-width="2"/></svg>`,
  { size: 256 },
);
const DECAL = svg(
  `<svg viewBox="0 0 128 40"><rect width="128" height="40" rx="4" fill="#0c0d14" stroke="#2ef2ff" stroke-width="2"/>
  <text x="64" y="19" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#2ef2ff">WARDEN</text>
  <text x="64" y="34" text-anchor="middle" font-family="monospace" font-size="11" fill="#ff2d95">MX-2077 // 6x6</text></svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#06202e"/>
  <path d="M0 40 L100 30 M0 25 L100 20 M10 0 L30 50 M90 0 L70 50" stroke="#2ef2ff" stroke-opacity="0.5" stroke-width="1"/>
  <rect x="38" y="10" width="24" height="12" fill="none" stroke="#2ef2ff" stroke-width="1.5"/>
  <path d="M44 16 H56 M50 12 V20" stroke="#ff2d95" stroke-width="1.5"/>
  <path d="M0 0 L100 0 L100 8 L0 14Z" fill="#0a5a78" fill-opacity="0.6"/></svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0a0a10"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<rect x="${3 + i * 7.6}" y="3" width="4.4" height="18" fill="#2ef2ff"/>`)
    .join("")}<rect width="64" height="24" fill="none" stroke="#3a3d4c" stroke-width="2"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "warden" });
  const R = rng(7);
  const D2R = 180 / Math.PI;

  const box = (s: number[], c: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at: at as any, rotation: rot as any });
  const cyl = (r1: number, r2: number, h: number, seg: number, c: any, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, seg), c, { at: at as any, dir: dir as any });
  const tex = (w: number, h: number, t: any, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: at as any, dir: dir as any, axis: "z", texture: t });

  // ---- chassis
  for (const s of [1, -1]) {
    box([0.3, 0.28, 7.8], GUN, [s * 0.55, 0.98, -0.1]);
    box([0.06, 0.2, 7.7], STEEL, [s * 0.72, 0.98, -0.1]);
    cyl(0.3, 0.3, 1.4, 8, GUN, [s * 0.85, 0.82, 0.25], [0, 0, 1]); // fuel tank
    cyl(0.31, 0.31, 0.08, 8, BRASS, [s * 0.85, 0.82, 0.7], [0, 0, 1]);
    cyl(0.31, 0.31, 0.08, 8, BRASS, [s * 0.85, 0.82, -0.2], [0, 0, 1]);
  }
  for (let i = 0; i < 6; i++) box([1.2, 0.18, 0.2], GUN, [0, 0.98, -3.6 + i * 1.45]);
  cyl(0.07, 0.07, 7, 6, STEEL, [0, 0.85, -0.2], [0, 0, 1]); // drive shaft

  const axles = [2.5, -1.5, -3.0];
  for (const z of axles) {
    cyl(0.1, 0.1, 2.8, 8, STEEL, [0, 0.62, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.28, 8, 6), GUN, { at: [0, 0.62, z] });
    box([0.5, 0.1, 0.1], MAG, [0, 0.9, z + 0.3]);
    for (const s of [1, -1]) {
      const x = s * 1.33;
      cyl(0.62, 0.62, 0.56, 12, RUBBER, [x, 0.62, z], [1, 0, 0]);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 + 0.26;
        box([0.58, 0.1, 0.18], BLACK, [x, 0.62 + Math.cos(a) * 0.65, z + Math.sin(a) * 0.65], [a * D2R, 0, 0]);
      }
      cyl(0.38, 0.38, 0.6, 10, STEEL, [x, 0.62, z], [1, 0, 0]);
      cyl(0.3, 0.3, 0.64, 10, DARK, [x, 0.62, z], [1, 0, 0]);
      glow(cyl(0.34, 0.34, 0.03, 16, CYAN, [x + s * 0.3, 0.62, z], [1, 0, 0]), 1.4);
      cyl(0.16, 0.16, 0.1, 8, BRASS, [x + s * 0.34, 0.62, z], [1, 0, 0]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.025, 0.025, 0.06, 5, "#cfd6e4", [x + s * 0.38, 0.62 + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2], [1, 0, 0]);
      }
      // fender
      box([0.8, 0.1, 1.6], CAB, [s * 1.33, 1.34, z]);
      box([0.8, 0.22, 0.1], CAB, [s * 1.33, 1.24, z + 0.8], [30, 0, 0]);
      box([0.8, 0.22, 0.1], CAB, [s * 1.33, 1.24, z - 0.8], [-30, 0, 0]);
      glow(box([0.7, 0.03, 0.03], MAG, [s * 1.33, 1.3, z + 0.74]), 1.4);
    }
  }

  // ---- cab
  const prof: [number, number][] = [
    [0, 0.9], [2.7, 0.9], [2.75, 1.5], [2.25, 1.8], [1.5, 1.88], [0.9, 2.9], [0.1, 2.9], [0, 2.6],
  ];
  b.extrude(prof, { at: [0, 0, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: CAB });
  // windshield
  tex(2.0, 1.1, HUD, [0, 2.42, 2.24], [0, 0.5, 0.87]);
  glow(box([1.8, 0.03, 0.03], CYAN, [0, 1.96, 2.38], [-30, 0, 0]), 1.2);
  for (const s of [1, -1]) {
    box([0.06, 1.15, 0.08], BLACK, [s * 1.0, 2.4, 2.22], [-30, 0, 0]);
    // side windows + doors
    box([0.05, 0.75, 0.9], "#0b2f44", [s * 1.17, 2.35, 1.7]);
    glow(box([0.03, 0.04, 0.9], CYAN, [s * 1.19, 2.76, 1.7]), 1.2);
    box([0.05, 1.5, 0.05], BLACK, [s * 1.17, 1.75, 1.2]);
    box([0.05, 1.5, 0.05], BLACK, [s * 1.17, 1.75, 2.2]);
    box([0.05, 0.06, 0.3], STEEL, [s * 1.18, 1.85, 1.5]); // handle
    tex(0.9, 0.28, DECAL, [s * 1.18, 1.35, 1.7], [s, 0, 0]);
    tex(0.5, 0.5, EMBLEM, [s * 1.18, 1.55, 2.9 - 0.1], [s, 0, 0]);
    // mirrors
    box([0.1, 0.45, 0.06], BLACK, [s * 1.35, 2.2, 2.3]);
    box([0.3, 0.1, 0.1], GUN, [s * 1.22, 2.3, 2.3]);
    // step
    box([0.35, 0.06, 0.8], STEEL, [s * 1.3, 1.0, 1.7]);
    // headlights
    glow(box([0.5, 0.2, 0.1], "#e8ffff", [s * 0.9, 1.45, 3.7]), 1.8);
    box([0.56, 0.05, 0.12], BLACK, [s * 0.9, 1.6, 3.7]);
    // armor wing on hood
    box([0.2, 0.3, 1.6], HULL, [s * 1.1, 1.65, 3.0], [0, 0, s * 20]);
    // exhaust stacks
    cyl(0.1, 0.1, 2.3, 8, STEEL, [s * 1.0, 2.35, 0.85], [0, 1, 0]);
    cyl(0.14, 0.12, 0.2, 8, BRASS, [s * 1.0, 3.5, 0.85], [0, 1, 0]);
    cyl(0.14, 0.14, 0.08, 8, BRASS, [s * 1.0, 1.9, 0.85], [0, 1, 0]);
    glow(cyl(0.08, 0.08, 0.02, 8, ORANGE, [s * 1.0, 3.61, 0.85], [0, 1, 0]), 1.5);
    // bull bar spikes
    for (let k = 0; k < 3; k++) b.spike([s * (0.3 + k * 0.45), 0.9, 3.95], [0, 0, 1], 0.3, 0.07, { color: STEEL });
  }
  // hood vents, grille, bumper
  for (let k = 0; k < 5; k++) box([1.6, 0.03, 0.1], BLACK, [0, 1.84 - k * 0.0, 2.7 - k * 0.2 - 0.0], [-8, 0, 0]);
  tex(1.4, 0.52, GRILLE, [0, 1.15, 3.77], [0, 0, 1]);
  box([2.7, 0.4, 0.4], HULL, [0, 0.82, 3.82]);
  tex(2.0, 0.3, HAZARD, [0, 0.82, 4.03], [0, 0, 1]);
  box([1.6, 0.12, 0.12], STEEL, [0, 0.52, 3.9]);
  glow(box([0.9, 0.05, 0.05], MAG, [0, 0.64, 4.05]), 1.5);
  // roof gear
  box([2.0, 0.1, 0.5], GUN, [0, 2.97, 1.72]);
  for (let k = 0; k < 8; k++) glow(box([0.2, 0.1, 0.16], k % 2 ? MAG : CYAN, [-0.88 + k * 0.25, 3.06, 1.82]), 1.6);
  cyl(0.015, 0.015, 1.6, 4, BLACK, [0.9, 3.7, 1.2], [0, 1, 0]);
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [0.9, 4.5, 1.2] }), 2);
  cyl(0.2, 0.2, 0.15, 8, GUN, [-0.6, 3.0, 1.3], [0, 1, 0]);
  b.part(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GUN, { at: [-0.6, 3.06, 1.3] });

  // ---- cargo box
  box([2.4, 1.7, 4.7], HULL, [0, 2.05, -1.65]);
  for (let i = 0; i < 7; i++) {
    const z = -3.8 + i * 0.7;
    box([2.5, 1.74, 0.1], GUN, [0, 2.05, z]);
    glow(box([2.52, 0.04, 0.06], i % 2 ? CYAN : MAG, [0, 1.3, z]), 1.3);
  }
  box([2.5, 0.12, 4.8], STEEL, [0, 2.95, -1.65]);
  box([2.5, 0.2, 4.8], GUN, [0, 1.15, -1.65]);
  for (const s of [1, -1]) {
    glow(box([0.05, 0.06, 4.5], MAG, [s * 1.23, 1.45, -1.65]), 1.5);
    box([0.12, 0.8, 1.6], HULL, [s * 1.28, 2.0, -0.9], [0, 0, s * 8]);
    box([0.12, 0.8, 1.6], HULL, [s * 1.28, 2.0, -2.6], [0, 0, s * 8]);
    tex(1.0, 0.3, DECAL, [s * 1.36, 2.2, -0.9], [s, 0, 0]);
    tex(0.7, 0.7, EMBLEM, [s * 1.36, 2.0, -2.6], [s, 0, 0]);
    // rear lights
    glow(box([0.3, 0.2, 0.08], RED, [s * 0.95, 1.4, -4.05]), 1.6);
    // missile pods
    box([0.8, 0.5, 1.4], GUN, [s * 0.75, 3.25, -2.6]);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const px = s * 0.75 - 0.27 + c * 0.27;
        const py = 3.15 + r * 0.22;
        cyl(0.09, 0.09, 0.1, 8, BLACK, [px, py, -1.88], [0, 0, 1]);
        glow(cyl(0.05, 0.05, 0.02, 6, ORANGE, [px, py, -1.9], [0, 0, 1]), 1.5);
        b.spike([px, py, -1.9], [0, 0, 1], 0.2, 0.05, { color: "#c9ccd6" });
      }
    box([0.82, 0.05, 1.42], MAG, [s * 0.75, 3.52, -2.6]);
  }
  // rear
  box([2.2, 1.4, 0.12], DARK, [0, 2.0, -4.0]);
  box([0.06, 1.4, 0.14], BLACK, [0, 2.0, -4.0]);
  tex(1.6, 0.4, HAZARD, [0, 1.25, -4.08], [0, 0, -1]);
  tex(0.5, 0.5, EMBLEM, [0, 2.2, -4.08], [0, 0, -1]);
  box([2.6, 0.3, 0.3], HULL, [0, 0.9, -4.1]);
  box([2.2, 0.06, 0.8], STEEL, [0, 1.0, -4.5], [-20, 0, 0]);
  // roof hatches and vents
  for (let k = 0; k < 3; k++) {
    box([0.7, 0.1, 0.5], GUN, [-0.6 + k * 0.6, 3.05, -3.6]);
    for (let j = 0; j < 3; j++) box([0.6, 0.02, 0.04], CYAN, [-0.6 + k * 0.6, 3.11, -3.7 + j * 0.1]);
  }
  for (let k = 0; k < 6; k++) cyl(0.03, 0.03, 0.4 + R() * 0.5, 4, BLACK, [-1 + k * 0.4, 3.2, -3.1], [0, 1, 0]);

  // ---- turret
  cyl(0.55, 0.6, 0.18, 8, STEEL, [0, 3.1, -0.15], [0, 1, 0]);
  cyl(0.45, 0.45, 0.1, 8, BRASS, [0, 3.22, -0.15], [0, 1, 0]);
  box([0.9, 0.45, 1.0], HULL, [0, 3.5, -0.15]);
  box([0.96, 0.08, 1.06], MAG, [0, 3.76, -0.15]);
  box([0.5, 0.3, 0.5], GUN, [0, 3.85, -0.4]);
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 5), RED, { at: [0, 3.85, 0.0] }), 2);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 1.6, 8, STEEL, [s * 0.25, 3.5, 1.05], [0, 0, 1]);
    cyl(0.1, 0.1, 0.25, 8, GUN, [s * 0.25, 3.5, 1.8], [0, 0, 1]);
    cyl(0.1, 0.1, 0.4, 8, BLACK, [s * 0.25, 3.5, 0.45], [0, 0, 1]);
    box([0.1, 0.3, 0.3], BRASS, [s * 0.5, 3.4, 0.0]);
    glow(box([0.05, 0.05, 0.4], CYAN, [s * 0.46, 3.62, 0.1]), 1.5);
  }

  return b.root;
}
```