```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured 6-wheel convoy hauler with roof turret, guarding a sealed glowing cargo pod.",
};

const DARK = "#14151c";
const TYRE = "#0d0d11";
const RIM = "#8a8fa3";
const NEON_C = "#2ef2ff";
const NEON_M = "#ff2fa8";
const AMBER = "#ffb02e";
const YELLOW = "#f2c516";
const RED = "#d8243a";

const HULL = panelled(metal("iron", { tarnish: 0.5, polish: 0.15 }), { size: 0.5, rivets: 0.12 });
const PLATE = panelled(metal("blued", { tarnish: 0.3 }), { size: 0.4, rivets: 0.1 });
const POD = panelled(metal("steel", { tarnish: 0.25, polish: 0.2 }), { size: 0.6, rivets: 0.15 });

const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#f2c516"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 1} 16Z" fill="#14151c"/>`).join("")}
  <rect width="64" height="16" fill="none" stroke="#14151c" stroke-width="2"/></svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="64" rx="4" fill="#0b0d14" stroke="#2ef2ff" stroke-width="3"/>
  <text x="64" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#2ef2ff">SEALED</text>
  <text x="64" y="46" text-anchor="middle" font-family="monospace" font-size="12" fill="#ff2fa8">POD-07 // KURO-NET</text>
  <path d="M6 56 H122" stroke="#ff2fa8" stroke-width="2" stroke-dasharray="6 3"/></svg>`,
  { size: 384 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="28" fill="#0b0d14" stroke="#ff2fa8" stroke-width="4"/>
  <path d="M32 10 L50 22 L50 42 L32 54 L14 42 L14 22Z" fill="none" stroke="#2ef2ff" stroke-width="3"/>
  <path d="M32 18 V46 M20 28 H44" stroke="#ffb02e" stroke-width="4"/></svg>`,
  { size: 192 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="24" fill="#0a0a0f"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="4" y="${3 + i * 4}" width="56" height="2" fill="#4a4f63"/>`).join("")}
  <rect x="2" y="2" width="60" height="20" fill="none" stroke="#ff2fa8" stroke-width="1.5"/></svg>`,
  { size: 256 },
);
const VISOR = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#041a22"/>
  <rect x="2" y="3" width="60" height="10" fill="#2ef2ff"/><path d="M0 14 L64 2" stroke="#9ffaff" stroke-width="2"/>
  <path d="M10 0 V16 M32 0 V16 M54 0 V16" stroke="#041a22" stroke-width="2"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hauler" });

  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: at as any, rotation: rot as any });
  const decal = (w: number, h: number, tex: any, at: number[], dir: number[], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at: at as any, dir: dir as any, axis: "z", texture: tex });

  // ---------- chassis ----------
  box(2.0, 0.3, 6.9, HULL, [0, 0.85, -0.3]);
  for (const s of [1, -1]) {
    box(0.16, 0.34, 6.9, PLATE, [s * 1.02, 0.85, -0.3]);
    // side skirts with hazard
    box(0.1, 0.5, 5.0, PLATE, [s * 1.3, 0.95, -0.9]);
    decal(4.8, 0.14, HAZARD, [s * 1.36, 0.82, -0.9], [s, 0, 0]);
    // underglow
    glow(box(0.06, 0.05, 4.4, NEON_M, [s * 1.31, 0.62, -0.9]), 1.6);
    // fuel tank
    cyl(0.34, 0.34, 1.6, 10, PLATE, [s * 1.1, 0.5, 0.05], [90, 0, 0]);
    for (const z of [-0.6, 0.7]) box(0.08, 0.7, 0.1, DARK, [s * 1.1, 0.5, z + 0.05]);
  }
  box(0.6, 0.25, 6.0, DARK, [0, 0.55, -0.3]); // driveshaft tunnel

  // ---------- wheels ----------
  const axles = [2.3, -1.1, -2.5];
  for (const z of axles) {
    cyl(0.12, 0.12, 2.5, 8, DARK, [0, 0.55, z], [0, 0, 90]);
    for (const s of [1, -1]) {
      const x = s * 1.15;
      cyl(0.55, 0.55, 0.5, 12, TYRE, [x, 0.55, z], [0, 0, 90]);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        box(0.52, 0.08, 0.16, "#1d1d25", [x, 0.55 + Math.cos(a) * 0.56, z + Math.sin(a) * 0.56], [(a * 180) / Math.PI, 0, 0]);
      }
      cyl(0.34, 0.34, 0.52, 10, RIM, [x, 0.55, z], [0, 0, 90]);
      cyl(0.24, 0.24, 0.1, 10, DARK, [s * 1.43, 0.55, z], [0, 0, 90]);
      cyl(0.1, 0.1, 0.14, 8, AMBER, [s * 1.47, 0.55, z], [0, 0, 90]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.08, 6, "#c9ccd8", [s * 1.46, 0.55 + Math.cos(a) * 0.18, z + Math.sin(a) * 0.18], [0, 0, 90]);
      }
      glow(cyl(0.34, 0.34, 0.02, 12, NEON_C, [s * 1.41, 0.55, z], [0, 0, 90]), 0.4);
      // fender
      box(0.72, 0.1, 1.5, PLATE, [x, 1.2, z]);
      box(0.72, 0.3, 0.1, PLATE, [x, 1.05, z + 0.72], [20, 0, 0]);
      box(0.72, 0.3, 0.1, PLATE, [x, 1.05, z - 0.72], [-20, 0, 0]);
    }
  }

  // ---------- cab ----------
  box(2.5, 1.5, 1.9, HULL, [0, 1.85, 1.75]);
  box(2.3, 0.35, 1.7, PLATE, [0, 2.75, 1.7]); // roof plate
  box(2.0, 0.2, 1.4, DARK, [0, 2.97, 1.6]);
  box(2.4, 0.9, 1.0, HULL, [0, 1.4, 3.1]); // hood
  box(2.2, 0.2, 1.0, PLATE, [0, 1.92, 3.05], [-6, 0, 0]);
  box(2.6, 0.5, 0.35, PLATE, [0, 0.95, 3.65]); // bumper
  box(2.0, 0.3, 0.5, PLATE, [0, 0.8, 3.95], [-20, 0, 0]); // ram
  decal(2.5, 0.25, HAZARD, [0, 0.97, 3.835], [0, 0, 1]);
  decal(1.5, 0.56, GRILLE, [0, 1.45, 3.61], [0, 0, 1]);
  decal(0.5, 0.5, EMBLEM, [0, 1.88, 2.711], [0, 0, 1]);
  decal(2.1, 0.52, VISOR, [0, 2.3, 2.71], [0, 0, 1]);
  glow(box(0.01, 0.01, 0.01, NEON_C, [0, 0, 0]), 0);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.18, 0.06, "#fff6c8", [s * 0.85, 1.55, 3.62]), 2);
    glow(box(0.2, 0.12, 0.06, AMBER, [s * 1.1, 1.2, 3.62]), 1.5);
    box(0.7, 0.28, 0.1, DARK, [s * 0.85, 1.55, 3.58]);
    // side window slit
    glow(box(0.04, 0.3, 0.9, NEON_C, [s * 1.27, 2.35, 1.8]), 1.0);
    box(0.06, 0.9, 1.3, PLATE, [s * 1.27, 1.7, 1.75]); // door armour
    box(0.12, 0.08, 0.5, DARK, [s * 1.3, 1.75, 1.4]); // handle
    // mirror
    box(0.06, 0.06, 0.4, DARK, [s * 1.5, 2.3, 2.5], [0, 0, s * 20]);
    box(0.08, 0.45, 0.25, PLATE, [s * 1.62, 2.3, 2.6]);
    // exhaust stacks
    cyl(0.1, 0.12, 2.4, 8, "#3a3d4c", [s * 1.0, 2.2, 0.55]);
    cyl(0.14, 0.14, 0.12, 8, DARK, [s * 1.0, 3.4, 0.55]);
    glow(cyl(0.07, 0.07, 0.02, 8, RED, [s * 1.0, 3.46, 0.55]), 1.2);
  }
  // light bar and antennae
  box(1.8, 0.14, 0.2, DARK, [0, 3.1, 2.2]);
  for (let i = 0; i < 6; i++) glow(box(0.24, 0.1, 0.22, i % 2 ? NEON_M : NEON_C, [-0.75 + i * 0.3, 3.1, 2.2]), 1.8);
  cyl(0.015, 0.02, 1.2, 5, DARK, [-0.9, 3.5, 1.2]);
  glow(cyl(0.03, 0.03, 0.06, 6, RED, [-0.9, 4.1, 1.2]), 2);
  cyl(0.015, 0.02, 0.8, 5, DARK, [0.9, 3.4, 1.2], [0, 0, -8]);

  // ---------- roof turret ----------
  cyl(0.42, 0.5, 0.2, 10, PLATE, [0, 3.18, 1.0]);
  box(0.6, 0.35, 0.7, HULL, [0, 3.45, 1.0]);
  decal(0.3, 0.3, EMBLEM, [0, 3.45, 1.355], [0, 0, 1]);
  for (const s of [1, -1]) {
    cyl(0.05, 0.05, 1.1, 8, "#2a2c38", [s * 0.17, 3.45, 1.9], [90, 0, 0]);
    cyl(0.08, 0.08, 0.2, 8, DARK, [s * 0.17, 3.45, 2.45], [90, 0, 0]);
    glow(cyl(0.03, 0.03, 0.02, 6, NEON_M, [s * 0.17, 3.45, 2.56], [90, 0, 0]), 1.8);
    box(0.12, 0.3, 0.4, PLATE, [s * 0.38, 3.5, 1.1]);
  }

  // ---------- cargo pod ----------
  box(2.4, 0.18, 3.9, PLATE, [0, 1.09, -1.3]); // cradle
  box(2.3, 1.9, 3.6, POD, [0, 2.1, -1.3]);
  box(2.0, 0.35, 3.3, POD, [0, 3.2, -1.3]);
  box(1.6, 0.18, 2.9, PLATE, [0, 3.45, -1.3]);
  // chamfer plates
  for (const s of [1, -1]) box(0.3, 0.36, 3.5, PLATE, [s * 1.1, 3.05, -1.3], [0, 0, -s * 45]);
  box(2.2, 0.4, 0.3, PLATE, [0, 3.0, 0.55], [-35, 0, 0]);
  box(2.2, 0.4, 0.3, PLATE, [0, 3.0, -3.15], [35, 0, 0]);
  // ribs and glowing seal seams
  for (const z of [-2.6, -1.9, -0.7, 0.0]) {
    box(2.5, 1.95, 0.16, PLATE, [0, 2.1, z - 0.3 + 0.0]);
    glow(box(2.52, 0.06, 0.06, NEON_C, [0, 2.7, z - 0.3 + 0.1]), 1.4);
  }
  // sealing band & lock
  glow(box(2.34, 0.12, 3.62, NEON_M, [0, 1.35, -1.3]), 1.0);
  box(0.7, 0.6, 0.12, DARK, [0, 2.2, -3.15]);
  glow(cyl(0.2, 0.2, 0.05, 10, RED, [0, 2.2, -3.23], [90, 0, 0]), 1.8);
  decal(0.26, 0.26, EMBLEM, [0, 2.2, -3.24], [0, 0, -1]);
  for (const s of [1, -1]) {
    decal(2.2, 1.1, LABEL, [s * 1.16, 2.2, -1.3], [s, 0, 0]);
    decal(3.2, 0.2, HAZARD, [s * 1.16, 1.5, -1.3], [s, 0, 0]);
    decal(3.2, 0.2, HAZARD, [s * 1.16, 2.9, -1.3], [s, 0, 0]);
    // bolts
    for (let i = 0; i < 6; i++) cyl(0.04, 0.04, 0.05, 6, "#c9ccd8", [s * 1.17, 1.3, -2.8 + i * 0.3], [0, 0, 90]);
    // pod clamps down to chassis
    for (const z of [-2.6, -0.1]) box(0.1, 0.7, 0.3, DARK, [s * 1.2, 1.2, z]);
  }

  // ---------- rear ----------
  box(2.4, 0.4, 0.2, PLATE, [0, 0.9, -3.8]);
  decal(2.3, 0.3, HAZARD, [0, 0.9, -3.91], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.2, 0.06, RED, [s * 0.8, 1.2, -3.92]), 1.8);
    box(0.5, 0.5, 0.3, DARK, [s * 0.8, 0.7, -3.85]);
  }
  // roof antenna array on pod
  cyl(0.05, 0.05, 0.5, 6, DARK, [0.7, 3.8, -2.2]);
  box(0.5, 0.05, 0.5, "#3a3d4c", [0.7, 4.05, -2.2], [0, 30, 15]);
  glow(box(0.3, 0.06, 0.06, NEON_C, [-0.5, 3.52, -1.3]), 1.5);

  return b.root;
}
```