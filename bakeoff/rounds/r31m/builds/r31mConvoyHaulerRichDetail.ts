import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { svg } from "../../../../src/index";
import { mottle } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler KR-7",
  description:
    "Low-poly cyberpunk armoured convoy hauler: 8-wheel armoured cab with roof turret and neon trim, guarding a riveted, sealed cargo pod.",
};

// ---------- palette ----------
const DARK = "#12141b";
const STEEL = "#2a2f3c";
const STEEL2 = "#3b4254";
const RUBBER = "#0d0d11";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd0";
const AMBER = "#ffb21a";
const RED = "#ff2a2a";
const WARM = "#fff1c0";
const YELLOW = "#f2c200";
const BONE = "#c9ccd6";

// ---------- paints ----------
const CAB_PAINT = panelled(mottle("#1d2a3a", "#2b3b52", { size: 0.5, seed: 4 }), { size: 0.6, rivets: 0.1 });
const POD_PAINT = panelled(metal("blued", { tarnish: 0.35, size: 0.4 }), { size: 0.75, aspect: 0.8, rivets: 0.12 });
const IRON = metal("iron", { tarnish: 0.5 });
const SKIRT = panelled(metal("iron", { seed: 9 }), { size: 0.5, rivets: 0.1 });

// ---------- textures ----------
function hazard(w: number, h: number, n: number) {
  let s = `<rect width="${w}" height="${h}" fill="${YELLOW}"/>`;
  const step = w / n;
  for (let i = -1; i < n; i += 2)
    s += `<polygon points="${i * step},${h} ${(i + 1) * step},${h} ${(i + 1) * step + h},0 ${i * step + h},0" fill="#111"/>`;
  return s;
}
const HAZARD = svg(`<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg">${hazard(64, 8, 16)}</svg>`, { size: 256 });
const VISOR = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="40" fill="#03141a"/>
  <rect x="2" y="2" width="96" height="36" fill="none" stroke="${CYAN}" stroke-width="1.6"/>
  <path d="M6 30 L30 30 L36 22 L64 22 L70 30 L94 30" stroke="${CYAN}" stroke-width="1.4" fill="none"/>
  <rect x="8" y="8" width="22" height="3" fill="${CYAN}"/><rect x="70" y="8" width="22" height="3" fill="${MAGENTA}"/>
  <circle cx="50" cy="14" r="7" fill="none" stroke="${CYAN}" stroke-width="1.2"/><circle cx="50" cy="14" r="2" fill="${CYAN}"/>
  <path d="M4 36 l8 0 M88 36 l8 0" stroke="${MAGENTA}" stroke-width="1.5"/>
  </svg>`,
  { size: 384 },
);
const LOGO = svg(
  `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="64" rx="4" fill="#0a0c12" stroke="${MAGENTA}" stroke-width="3"/>
  <path d="M10 14 L30 32 L10 50 M24 14 L44 32 L24 50" stroke="${CYAN}" stroke-width="5" fill="none"/>
  <text x="52" y="30" font-family="monospace" font-weight="bold" font-size="17" fill="#fff">KURO</text>
  <text x="52" y="50" font-family="monospace" font-weight="bold" font-size="13" fill="${MAGENTA}">TECH</text>
  </svg>`,
  { size: 256 },
);
const PODDOOR = svg(
  `<svg viewBox="0 0 100 62" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="62" fill="#2b3550"/>
  <rect x="1.5" y="1.5" width="97" height="59" fill="none" stroke="#0b0e16" stroke-width="3"/>
  <svg x="0" y="0" width="100" height="6" viewBox="0 0 64 8" preserveAspectRatio="none">${hazard(64, 8, 16)}</svg>
  <svg x="0" y="56" width="100" height="6" viewBox="0 0 64 8" preserveAspectRatio="none">${hazard(64, 8, 16)}</svg>
  <line x1="50" y1="6" x2="50" y2="56" stroke="#0b0e16" stroke-width="2"/>
  <circle cx="50" cy="30" r="16" fill="#101420" stroke="${RED}" stroke-width="3"/>
  <circle cx="50" cy="30" r="4" fill="${RED}"/>
  <path d="M50 30 L50 16 A14 14 0 0 1 62 37 Z M50 30 L62 37 A14 14 0 0 1 38 37 Z M50 30 L38 37 A14 14 0 0 1 50 16 Z" fill="none" stroke="${RED}" stroke-width="1.6"/>
  <rect x="14" y="26" width="14" height="8" fill="#0b0e16" stroke="${AMBER}" stroke-width="1"/>
  <rect x="72" y="26" width="14" height="8" fill="#0b0e16" stroke="${AMBER}" stroke-width="1"/>
  <text x="50" y="54" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="6" fill="#fff">SEALED // 封印</text>
  </svg>`,
  { size: 512 },
);
const SIDE = svg(
  `<svg viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="70" fill="#1a2236" stroke="${CYAN}" stroke-width="2.5"/>
  <text x="12" y="30" font-family="monospace" font-weight="bold" font-size="22" fill="#fff">CARGO POD 07</text>
  <text x="12" y="50" font-family="monospace" font-weight="bold" font-size="12" fill="${AMBER}">SEALED // DO NOT OPEN</text>
  <text x="150" y="58" font-family="serif" font-weight="bold" font-size="34" fill="${RED}">危険</text>
  <path d="M12 58 h4 v6 h-4z M20 58 h2 v6 h-2z M26 58 h5 v6 h-5z M35 58 h2 v6 h-2z M41 58 h4 v6 h-4z M50 58 h2 v6 h-2z M56 58 h6 v6 h-6z" fill="#fff"/>
  <path d="M150 8 l12 8 l-12 8 z M168 8 l12 8 l-12 8 z" fill="${MAGENTA}"/>
  </svg>`,
  { size: 768 },
);
const PLATE = svg(
  `<svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="20" fill="#e8e8ea" stroke="#111" stroke-width="2"/><text x="30" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#111">KR-7·2077</text></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  const R = rng(11);

  // ---------- helpers ----------
  const box = (size: [number, number, number], at: [number, number, number], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, ...o });
  const cyl = (r1: number, r2: number, h: number, seg: number, at: [number, number, number], color: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, seg), color, { at, flat: true, ...o });
  const plane = (w: number, h: number, at: any, dir: any, texture: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture, ...o });
  const lamp = (size: [number, number, number], at: [number, number, number], color: string, k = 1.4) =>
    glow(box(size, at, color), k);
  const bolt = (at: [number, number, number], dir: [number, number, number], r = 0.035) =>
    cyl(r, r, 0.03, 6, at, BONE, { dir });

  // ---------- chassis ----------
  box([2.2, 0.34, 8.7], [0, 0.95, 0], IRON);
  box([2.4, 0.2, 5.6], [0, 1.22, -1.5], STEEL); // deck
  for (const s of [1, -1]) {
    box([0.12, 0.2, 8.7], [s * 1.0, 0.8, 0], STEEL2); // rails
    glow(box([0.04, 0.05, 6.4], [s * 1.12, 0.72, -0.3], CYAN), 1.6); // underglow
    box([0.08, 0.5, 1.9], [s * 1.15, 0.97, -0.4], SKIRT); // skirt
    plane(1.7, 0.2, [s * 1.2, 0.97, -0.4], [s, 0, 0], HAZARD);
    // fuel tank
    cyl(0.34, 0.34, 1.9, 10, [s * 0.7, 0.62, -0.4], STEEL2, { dir: [0, 0, 1] });
    for (const z of [-1.05, 0.25]) cyl(0.36, 0.36, 0.08, 10, [s * 0.7, 0.62, z], DARK, { dir: [0, 0, 1] });
    glow(box([0.2, 0.06, 0.2], [s * 0.7, 0.28, -0.4], AMBER), 1);
  }

  // ---------- axles + wheels ----------
  const WR = 0.62;
  const axleZ = [3.0, 1.4, -2.2, -3.6];
  for (const z of axleZ) {
    cyl(0.09, 0.09, 3.0, 8, [0, WR, z], DARK, { dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), STEEL2, { at: [0, WR, z], flat: true });
    for (const s of [1, -1]) {
      const x = s * 1.35;
      cyl(WR, WR, 0.5, 12, [x, WR, z], RUBBER, { dir: [1, 0, 0] });
      // tread blocks
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        box([0.52, 0.1, 0.16], [x, WR + Math.cos(a) * (WR + 0.02), z + Math.sin(a) * (WR + 0.02)], "#1b1b22", {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      // rim and hub
      cyl(0.4, 0.4, 0.06, 12, [s * 1.6, WR, z], STEEL2, { dir: [1, 0, 0] });
      cyl(0.33, 0.33, 0.04, 12, [s * 1.63, WR, z], DARK, { dir: [1, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.36, 0.022, 4, 16), CYAN, { at: [s * 1.65, WR, z], dir: [s, 0, 0], axis: "z", flat: true }), 1.6);
      cyl(0.1, 0.1, 0.08, 8, [s * 1.67, WR, z], STEEL, { dir: [1, 0, 0] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.05, 6, [s * 1.68, WR + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2], BONE, { dir: [1, 0, 0] });
      }
      // fender
      box([0.62, 0.08, 1.5], [x, WR + 0.76, z], z > 0 ? CAB_PAINT : STEEL);
      box([0.62, 0.3, 0.08], [x, WR + 0.65, z + 0.75], STEEL2, { rotation: [25, 0, 0] });
      box([0.62, 0.3, 0.08], [x, WR + 0.65, z - 0.75], STEEL2, { rotation: [-25, 0, 0] });
    }
  }
  // mudflaps
  for (const s of [1, -1]) {
    box([0.5, 0.45, 0.05], [s * 1.35, 0.5, -4.35], RUBBER);
    plane(0.4, 0.06, [s * 1.35, 0.7, -4.378], [0, 0, -1], HAZARD);
  }

  // ---------- cab ----------
  const cabProfile: [number, number][] = [
    [1.4, 1.15], [4.4, 1.15], [4.4, 1.95], [3.5, 2.1], [3.0, 2.85], [1.4, 2.85],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.5, bevel: 0.08, color: CAB_PAINT });
  // windshield visor (sloped)
  glow(plane(2.2, 0.9, [0, 2.48 + 0.006, 3.25 + 0.009], [0, 0.5, 0.75], VISOR), 1.3);
  box([2.3, 0.08, 0.1], [0, 2.9, 3.0], STEEL2); // visor brow
  // roof plate
  box([2.3, 0.1, 1.5], [0, 2.9, 2.1], STEEL);
  for (const [x, z] of [[-1, 1.5], [1, 1.5], [-1, 2.7], [1, 2.7]] as [number, number][]) bolt([x, 2.97, z], [0, 1, 0]);
  // side windows, doors
  for (const s of [1, -1]) {
    glow(box([0.03, 0.45, 1.0], [s * 1.26, 2.3, 2.25], "#0b3a44"), 0.8);
    box([0.04, 0.04, 1.5], [s * 1.26, 1.45, 2.2], DARK); // door seam
    box([0.04, 1.5, 0.04], [s * 1.26, 2.0, 1.55], DARK);
    box([0.06, 0.08, 0.3], [s * 1.28, 1.95, 2.8], BONE); // handle
    plane(0.8, 0.5, [s * 1.265, 1.7, 2.2], [s, 0, 0], LOGO);
    // mirror
    box([0.04, 0.4, 0.25], [s * 1.55, 2.3, 3.1], DARK);
    box([0.5, 0.04, 0.04], [s * 1.38, 2.25, 3.05], STEEL2, { rotation: [0, 0, 0] });
    // exhaust
    cyl(0.1, 0.1, 2.2, 8, [s * 1.34, 2.3, 1.65], STEEL2);
    cyl(0.14, 0.1, 0.12, 8, [s * 1.34, 3.4, 1.65], DARK);
    for (const y of [1.5, 2.3, 3.0]) box([0.2, 0.08, 0.12], [s * 1.28, y, 1.65], BONE);
    glow(box([0.1, 0.05, 0.1], [s * 1.34, 3.47, 1.65], AMBER), 1.4);
  }
  // hood vents
  for (let i = 0; i < 5; i++) box([1.4, 0.03, 0.06], [0, 2.14 - 0.0, 3.55 - i * 0.0 + 0.0 + i * -0.0 + (i - 2) * 0.16 - 0.05], DARK, { rotation: [-14, 0, 0] });
  // front: grille + lights
  plane(0.9, 0.56, [0, 1.52, 4.412], [0, 0, 1], LOGO);
  for (const s of [1, -1]) {
    glow(box([0.5, 0.2, 0.06], [s * 0.82, 1.7, 4.42], WARM), 1.5);
    glow(box([0.5, 0.06, 0.06], [s * 0.82, 1.48, 4.42], CYAN), 1.5);
    box([0.56, 0.26, 0.04], [s * 0.82, 1.7, 4.4], DARK);
  }
  // bumper + bull bar
  box([2.9, 0.38, 0.45], [0, 0.95, 4.55], STEEL);
  plane(2.7, 0.3, [0, 0.95, 4.783], [0, 0, 1], HAZARD);
  plane(0.5, 0.16, [0, 1.2, 4.785], [0, 0, 1], PLATE);
  for (const x of [-1.1, -0.55, 0, 0.55, 1.1]) b.spike([x, 1.0, 4.75], [0, 0, 1], 0.4, 0.07, { color: BONE, sides: 4 } as any);
  box([2.6, 0.12, 0.12], [0, 1.45, 4.8], STEEL2);
  for (const s of [1, -1]) box([0.1, 0.6, 0.1], [s * 1.2, 1.2, 4.7], STEEL2);
  // cab roof: light bar
  box([1.9, 0.14, 0.24], [0, 3.02, 2.9], DARK);
  for (let i = 0; i < 4; i++) glow(box([0.4, 0.1, 0.2], [-0.72 + i * 0.48, 3.06, 2.92], i < 2 ? RED : "#2a5cff"), 1.7);

  // ---------- turret ----------
  const TY = 2.95;
  b.lathe([[0, 0], [0.55, 0], [0.5, 0.12], [0.35, 0.18], [0, 0.18]], { at: [0, TY + 0.0, 2.0], segments: 8, color: STEEL2 });
  box([0.85, 0.42, 0.95], [0, TY + 0.4, 2.0], STEEL);
  box([0.7, 0.1, 0.8], [0, TY + 0.66, 2.0], DARK);
  for (const s of [1, -1]) {
    cyl(0.05, 0.05, 1.3, 8, [s * 0.2, TY + 0.4, 2.95], DARK, { dir: [0, 0, 1] });
    cyl(0.09, 0.09, 0.2, 8, [s * 0.2, TY + 0.4, 2.55], STEEL2, { dir: [0, 0, 1] });
    cyl(0.08, 0.08, 0.14, 6, [s * 0.2, TY + 0.4, 3.62], STEEL2, { dir: [0, 0, 1] });
    box([0.12, 0.25, 0.3], [s * 0.5, TY + 0.4, 2.3], STEEL2); // ammo box
    glow(box([0.04, 0.04, 0.18], [s * 0.5, TY + 0.55, 2.3], AMBER), 1.4);
  }
  b.part(new THREE.SphereGeometry(0.17, 8, 6), STEEL2, { at: [0.0, TY + 0.78, 1.8], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), MAGENTA, { at: [0, TY + 0.8, 1.95], flat: true }), 2);

  // ---------- cargo pod ----------
  const oct = (w: number, y0: number, y1: number, ch: number): [number, number][] => [
    [-w, y0], [w, y0], [w, y1 - ch * 1.6], [w - ch, y1], [-(w - ch), y1], [-w, y1 - ch * 1.6],
  ];
  b.extrude(oct(1.2, 0, 2.1, 0.35), { at: [0, 1.3, -1.7], x: [1, 0, 0], thickness: 5.2, bevel: 0.05, color: POD_PAINT });
  for (const z of [-4.1, -3.05, -2.0, -0.95, 0.1, 0.8]) {
    b.extrude(oct(1.26, -0.04, 2.14, 0.37), { at: [0, 1.3, z], x: [1, 0, 0], thickness: 0.12, bevel: 0.03, color: STEEL });
  }
  // side labels
  for (const s of [1, -1]) {
    plane(2.4, 0.84, [s * 1.215, 2.2, -1.9], [s, 0, 0], SIDE);
    plane(2.0, 0.2, [s * 1.215, 1.55, -1.9], [s, 0, 0], HAZARD);
    for (let i = 0; i < 6; i++) glow(box([0.05, 0.1, 0.28], [s * 1.23, 2.85, -3.7 + i * 0.85], AMBER), 1.4);
    // chamfer strip lights
    glow(box([0.04, 0.05, 5.0], [s * 1.0, 3.05, -1.7], MAGENTA, { rotation: [0, 0, -s * 40] }), 1.3);
    // latch bars
    for (const z of [-3.5, -0.3]) {
      box([0.06, 0.9, 0.12], [s * 1.28, 2.2, z], BONE);
      bolt([s * 1.32, 1.8, z], [s, 0, 0]);
      bolt([s * 1.32, 2.6, z], [s, 0, 0]);
    }
  }
  // rear door
  plane(2.3, 1.43, [0, 2.1, -4.312], [0, 0, -1], PODDOOR);
  for (const s of [1, -1]) {
    glow(box([0.3, 0.14, 0.08], [s * 1.0, 1.5, -4.33], RED), 1.8);
    for (const y of [1.5, 2.4]) box([0.1, 0.26, 0.1], [s * 0.04 + (s > 0 ? 0.05 : -0.05), y + 0.1, -4.36], DARK);
  }
  // top hatch
  box([1.3, 0.12, 1.3], [0, 3.43, -1.7], STEEL);
  cyl(0.45, 0.45, 0.06, 8, [0, 3.52, -1.7], DARK);
  glow(b.part(new THREE.TorusGeometry(0.4, 0.04, 4, 12), RED, { at: [0, 3.56, -1.7], dir: [0, 1, 0], axis: "z", flat: true }), 1.8);
  for (const x of [-0.55, 0.55]) for (const z of [-1.25, -2.15]) bolt([x, 3.5, z], [0, 1, 0]);
  // top sensors / antenna
  b.rod([0.8, 3.4, -3.8], [0.8, 4.7, -3.8], 0.02, BONE);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0.8, 4.72, -3.8], flat: true }), 2);
  b.rod([-0.8, 3.4, -0.4], [-0.9, 4.2, -0.5], 0.015, BONE);
  cyl(0.25, 0.25, 0.1, 8, [-0.7, 3.45, -3.2], STEEL2);
  b.part(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL2, { at: [-0.7, 3.5, -3.2], flat: true });
  // corner crash guards
  for (const s of [1, -1]) {
    box([0.2, 0.2, 0.5], [s * 1.2, 1.3, -4.3], STEEL);
    box([0.2, 0.2, 0.5], [s * 1.2, 1.3, 0.85], STEEL);
  }
  // tail lights & bumper
  box([2.6, 0.3, 0.3], [0, 1.0, -4.45], STEEL);
  plane(2.4, 0.22, [0, 1.0, -4.605], [0, 0, -1], HAZARD);
  plane(0.5, 0.16, [0, 1.28, -4.45], [0, 0, -1], PLATE);
  for (const s of [1, -1]) glow(box([0.3, 0.12, 0.06], [s * 1.0, 1.0, -4.62], RED), 1.8);

  // ---------- cab-to-pod coupling ----------
  cyl(0.3, 0.3, 0.2, 8, [0, 1.35, 1.1], DARK);
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 1.3, 1.3], [s * 0.4, 2.6, 0.95], 0.04, STEEL2);
    glow(box([0.05, 0.4, 0.05], [s * 0.6, 3.05, 1.2 + R() * 0.0], CYAN), 1.4);
  }

  return b.root;
}
