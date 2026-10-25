```ts
import * as THREE from "three";
import { createBuilder, rng, mix, noise, paint, smoothstep, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aegis Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured convoy hauler: a hardened 8x6 cab with roof turret and light bar, towing a sealed octagonal cargo pod with neon straps, status screens and a glowing rear seal.",
};

// ---------- palette ----------
const DARK = "#14161d";
const STEEL = "#3a4152";
const ARMOR = "#252a36";
const TIRE = "#101116";
const CYAN = "#19e6ff";
const MAGENTA = "#ff2fa8";
const YELLOW = "#ffd21f";
const ORANGE = "#ff7a1a";
const RED = "#ff2b3a";
const WHITE = "#e9fbff";

// ---------- paints ----------
const plating = (base: string, hi: string, size = 0.8) =>
  paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const fu = ((u / size) % 1 + 1) % 1;
    const fv = ((v / (size * 0.7)) % 1 + 1) % 1;
    const e = Math.min(fu * size, (1 - fu) * size, fv * size * 0.7, (1 - fv) * size * 0.7);
    let c = mix(base, hi, smoothstep(-0.3, 1, n.y) * 0.55 + noise(p, 0.5, 5) * 0.3);
    c = mix(c, "#0a0c12", smoothstep(0.6, 0.0, p.y) * 0.5);
    if (e < 0.02) c = mix(c, "#07080c", 0.9);
    else if (e < 0.045) c = mix(c, "#7f8db0", 0.2);
    return c;
  });
const HULL = plating("#2a3040", "#4d5a78");
const PLATE = plating("#1f2430", "#3c455c", 0.55);
const POD = paint((p, n) => {
  let c = mix("#d3dae3", "#a3afbf", noise(p, 0.7, 3));
  c = mix(c, "#4b5360", smoothstep(2.3, 1.55, p.y) * 0.75);
  c = mix(c, "#6f7a8c", smoothstep(0.2, -0.8, n.y) * 0.5);
  const fz = ((p.z % 1.5) + 1.5) % 1.5;
  if (fz < 0.03) c = mix(c, "#10131a", 0.85);
  return c;
});

// ---------- textures ----------
const stripePoly = (n: number, w: number, h: number) => {
  let s = "";
  for (let i = -1; i < n; i++) s += `<polygon points="${i * w},${h} ${i * w + w / 2},${h} ${i * w + w},0 ${i * w + w / 2},0" fill="#111"/>`;
  return s;
};
import { svg } from "agentic-3js-builder";
const HAZARD = svg(
  `<svg viewBox="0 0 36 8" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" fill="${YELLOW}"/>${stripePoly(5, 8, 8)}<rect width="36" height="8" fill="none" stroke="#111" stroke-width="1"/></svg>`,
  { size: 288 },
);
const VISOR = svg(
  `<svg viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a3a"/><stop offset="1" stop-color="#03070d"/></linearGradient></defs>
  <rect width="120" height="48" rx="5" fill="url(#g)" stroke="#05080c" stroke-width="3"/>
  <path d="M6 36 H44 M6 30 H30 M76 14 H114 M90 20 H114" stroke="${CYAN}" stroke-width="1.6" fill="none"/>
  <polygon points="60,10 70,28 50,28" fill="none" stroke="${MAGENTA}" stroke-width="2"/>
  <circle cx="60" cy="22" r="2.4" fill="${MAGENTA}"/>
  <text x="8" y="14" font-family="monospace" font-size="7" fill="${CYAN}">CONVOY 07 // ARMED</text>
  <path d="M0 48 L30 0 L38 0 L8 48Z" fill="#ffffff" opacity="0.08"/></svg>`,
  { size: 384 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 60 36" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="36" rx="4" fill="#06141f" stroke="#05080c" stroke-width="3"/>
  <path d="M10 36 L30 0 M22 36 L42 0" stroke="${CYAN}" stroke-width="2" opacity="0.55"/><path d="M6 8 H24" stroke="${MAGENTA}" stroke-width="1.8"/></svg>`,
  { size: 192 },
);
const LOGO = svg(
  `<svg viewBox="0 0 90 45" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 6 H26 L30 22 L16 38 L2 22Z" fill="#0a0f18" stroke="${CYAN}" stroke-width="2.5"/>
  <path d="M16 12 L24 28 H8Z" fill="${MAGENTA}"/>
  <text x="36" y="25" font-family="sans-serif" font-weight="bold" font-size="17" fill="${WHITE}">AEGIS</text>
  <text x="37" y="38" font-family="monospace" font-size="7.5" fill="${CYAN}">ARMOURED LOGISTICS</text></svg>`,
  { size: 320 },
);
const LABEL = svg(
  `<svg viewBox="0 0 110 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="110" height="80" rx="4" fill="#e8c21a" stroke="#111" stroke-width="4"/>
  <rect x="6" y="6" width="98" height="20" fill="#111"/>
  <text x="55" y="21" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="${YELLOW}">SEALED CARGO</text>
  <polygon points="22,32 40,62 4,62" fill="none" stroke="#111" stroke-width="4"/><rect x="21" y="42" width="3" height="10" fill="#111"/><rect x="21" y="55" width="3" height="3" fill="#111"/>
  <text x="48" y="46" font-family="monospace" font-weight="bold" font-size="12" fill="#111">CLASS-9</text>
  <text x="48" y="58" font-family="monospace" font-size="8" fill="#111">DO NOT OPEN</text>
  <path d="M8 68 h2 v8 h-2z M12 68 h1 v8 h-1z M15 68 h3 v8 h-3z M20 68 h1 v8 h-1z M23 68 h2 v8 h-2z M28 68 h1 v8 h-1z M31 68 h3 v8 h-3z M36 68 h2 v8 h-2z M41 68 h1 v8 h-1z M44 68 h3 v8 h-3z M50 68 h1 v8 h-1z M53 68 h2 v8 h-2z" fill="#111"/></svg>`,
  { size: 320 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 110 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="110" height="80" rx="4" fill="#041016" stroke="#05080c" stroke-width="4"/>
  <text x="8" y="16" font-family="monospace" font-size="9" fill="${CYAN}">SEAL: LOCKED</text>
  <text x="8" y="28" font-family="monospace" font-size="8" fill="#39ff88">PRESSURE OK</text>
  <rect x="10" y="60" width="9" height="12" fill="${CYAN}"/><rect x="24" y="50" width="9" height="22" fill="${CYAN}"/><rect x="38" y="42" width="9" height="30" fill="${MAGENTA}"/>
  <rect x="52" y="54" width="9" height="18" fill="${CYAN}"/><rect x="66" y="46" width="9" height="26" fill="${CYAN}"/><rect x="80" y="38" width="9" height="34" fill="${ORANGE}"/>
  <path d="M8 36 H100" stroke="${CYAN}" stroke-width="1" opacity="0.5"/></svg>`,
  { size: 320 },
);
const SEAL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#0a0612" stroke="${MAGENTA}" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="${CYAN}" stroke-width="2" stroke-dasharray="6 4"/>
  <circle cx="50" cy="50" r="7" fill="${MAGENTA}"/>
  <g fill="none" stroke="${MAGENTA}" stroke-width="5"><circle cx="50" cy="30" r="12"/><circle cx="33" cy="60" r="12"/><circle cx="67" cy="60" r="12"/></g>
  <path d="M50 4 V14 M50 86 V96 M4 50 H14 M86 50 H96" stroke="${YELLOW}" stroke-width="4"/></svg>`,
  { size: 256 },
);
const NUMPLATE = svg(
  `<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="24" rx="3" fill="#dfe6ee" stroke="#111" stroke-width="2"/>
  <rect x="2" y="2" width="56" height="5" fill="${MAGENTA}"/><text x="30" y="20" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#111">NX-4471</text></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  const r = rng(11);

  // ---------- helpers ----------
  const bx = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cy = (rad: number, h: number, seg: number, color: any, x: number, y: number, z: number, dir?: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rad, rad, h, seg), color, { at: [x, y, z], dir, flat: true, ...o });
  const pic = (tex: any, w: number, h: number, x: number, y: number, z: number, dir: number[], g = 0, o: any = {}) => {
    const pt = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: tex, ...o });
    if (g) glow(pt, g);
    return pt;
  };
  const lit = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, g = 1.2, o: any = {}) =>
    glow(bx(w, h, d, color, x, y, z, o), g);

  const WY = 0.72; // wheel radius = axle height
  const AXLES = [3.2, 0.9, -1.0, -2.9];

  // ---------- chassis ----------
  bx(2.2, 0.36, 8.8, DARK, 0, 1.0, 0);
  bx(1.6, 0.2, 8.6, STEEL, 0, 0.82, 0);
  for (const s of [1, -1]) {
    lit(0.05, 0.06, 8.2, MAGENTA, s * 1.12, 0.88, 0, 1.4); // underglow
    bx(0.12, 0.2, 8.6, ARMOR, s * 1.1, 1.0, 0);
  }

  // ---------- wheels ----------
  for (const z of AXLES) {
    cy(0.14, 3.3, 8, DARK, 0, WY, z, [1, 0, 0]);
    cy(0.3, 1.6, 8, STEEL, 0, WY, z, [1, 0, 0]); // diff
    for (const s of [1, -1]) {
      const x = s * 1.62;
      cy(WY, 0.5, 10, TIRE, x, WY, z, [1, 0, 0]);
      // tread blocks
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        bx(0.54, 0.07, 0.2, "#0a0a0e", x, WY + Math.cos(a) * (WY + 0.01), z + Math.sin(a) * (WY + 0.01), {
          rotation: [(-a * 180) / Math.PI + 90, 0, 0],
        });
      }
      cy(0.42, 0.54, 8, STEEL, x, WY, z, [1, 0, 0]);
      glow(cy(0.28, 0.04, 12, CYAN, s * 1.9, WY, z, [1, 0, 0]), 1.3);
      cy(0.14, 0.07, 6, DARK, s * 1.92, WY, z, [1, 0, 0]);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        cy(0.03, 0.06, 5, WHITE, s * 1.92, WY + Math.cos(a) * 0.35, z + Math.sin(a) * 0.35, [1, 0, 0]);
      }
      // mudguard
      bx(0.7, 0.08, 1.75, ARMOR, s * 1.62, 1.6, z);
      bx(0.08, 0.38, 1.75, PLATE, s * 1.94, 1.43, z);
    }
  }

  // ---------- cab ----------
  const CAB: [number, number][] = [
    [1.9, 0], [4.6, 0], [4.6, 0.85], [4.3, 1.1], [3.7, 1.15], [3.3, 1.95], [1.9, 1.95],
  ];
  b.extrude(CAB, { at: [0, 1.45, 0], x: [0, 0, 1], thickness: 2.6, bevel: 0.07, color: HULL });
  // windshield
  pic(VISOR, 2.15, 0.84, 0, 3.01, 3.52, [0, 0.447, 0.894], 0.7);
  bx(2.3, 0.08, 0.1, DARK, 0, 3.43, 3.3);
  // front face
  bx(1.5, 0.62, 0.1, DARK, 0, 1.95, 4.62);
  for (let k = 0; k < 4; k++) lit(1.2, 0.035, 0.04, k % 2 ? MAGENTA : CYAN, 0, 1.76 + k * 0.14, 4.68, 1.3);
  for (const s of [1, -1]) {
    lit(0.5, 0.2, 0.08, WHITE, s * 0.98, 2.05, 4.63, 1.8);
    bx(0.6, 0.06, 0.12, DARK, s * 0.98, 2.2, 4.64);
    lit(0.4, 0.05, 0.05, ORANGE, s * 0.98, 1.74, 4.64, 1.2);
  }
  for (let k = 0; k < 3; k++) for (const s of [1, -1]) lit(0.5, 0.025, 0.12, k === 1 ? MAGENTA : CYAN, s * 0.6, 2.58 + k * 0.0, 3.85 + k * 0.15, 1.0);
  // doors
  for (const s of [1, -1]) {
    bx(0.1, 0.9, 1.5, PLATE, s * 1.35, 2.0, 2.7);
    pic(LOGO, 1.05, 0.52, s * 1.41, 2.0, 2.7, [s, 0, 0], 0.5);
    pic(SIDEWIN, 1.1, 0.6, s * 1.31, 2.87, 2.75, [s, 0, 0], 0.5);
    bx(0.06, 0.08, 1.2, DARK, s * 1.31, 3.2, 2.75);
    // mirror cam
    b.rod([s * 1.3, 3.0, 3.45], [s * 1.72, 3.1, 3.5], 0.03, DARK);
    bx(0.14, 0.3, 0.2, ARMOR, s * 1.76, 3.1, 3.5);
    lit(0.05, 0.1, 0.1, CYAN, s * 1.76, 3.15, 3.6, 1.6);
    // hood side armour
    bx(0.1, 0.55, 0.9, ARMOR, s * 1.33, 1.95, 4.1);
    // brush guard
    b.rod([s * 1.0, 1.4, 5.1], [s * 0.95, 2.45, 4.62], 0.06, STEEL);
  }
  b.rod([-1.0, 1.9, 5.05], [1.0, 1.9, 5.05], 0.05, STEEL);
  // bumper + ram
  bx(3.0, 0.7, 0.6, ARMOR, 0, 1.15, 4.85);
  for (let k = 0; k < 6; k++) pic(HAZARD, 0.9, 0.2, -1.2 + k * 0.48 * 0 + (k - 2.5) * 0.45, 1.0, 5.155, [0, 0, 1], 0).scale.set(0.5, 1, 1);
  for (const x of [-1.2, -0.4, 0.4, 1.2]) b.part(new THREE.ConeGeometry(0.14, 0.42, 6), STEEL, { at: [x, 1.3, 5.3], dir: [0, 0, 1], flat: true });
  lit(0.3, 0.08, 0.05, ORANGE, 0, 0.95, 5.17, 1.4);
  // roof
  bx(2.4, 0.12, 1.5, ARMOR, 0, 3.46, 2.65);
  bx(2.0, 0.1, 0.2, DARK, 0, 3.58, 3.15);
  for (let k = 0; k < 6; k++) lit(0.3, 0.1, 0.18, k % 2 ? MAGENTA : CYAN, -0.85 + k * 0.34, 3.66, 3.15, 2);
  // turret
  cy(0.55, 0.2, 8, STEEL, 0, 3.62, 2.3);
  bx(0.95, 0.42, 1.05, HULL, 0, 3.95, 2.3);
  bx(0.7, 0.2, 0.5, ARMOR, 0, 4.2, 2.1);
  b.part(new THREE.SphereGeometry(0.16, 8, 6), STEEL, { at: [0, 4.38, 2.1], flat: true });
  lit(0.12, 0.08, 0.04, RED, 0, 4.38, 2.26, 2);
  for (const s of [1, -1]) {
    cy(0.06, 1.5, 8, DARK, s * 0.22, 3.98, 3.4, [0, 0, 1]);
    cy(0.1, 0.35, 8, STEEL, s * 0.22, 3.98, 2.95, [0, 0, 1]);
    cy(0.09, 0.16, 6, STEEL, s * 0.22, 3.98, 4.12, [0, 0, 1]);
    lit(0.07, 0.07, 0.03, MAGENTA, s * 0.22, 3.98, 4.21, 2);
  }
  // exhausts + antennas
  for (const s of [1, -1]) {
    cy(0.12, 1.7, 8, STEEL, s * 1.0, 3.45, 1.72);
    cy(0.17, 0.2, 8, DARK, s * 1.0, 4.35, 1.72);
    glow(cy(0.11, 0.04, 8, ORANGE, s * 1.0, 4.46, 1.72), 1.5);
    bx(0.3, 0.12, 0.12, DARK, s * 1.0, 2.7, 1.78);
    cy(0.015, 1.5, 5, DARK, s * 1.15, 4.2, 2.0);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [s * 1.15, 4.97, 2.0] }), 2);
  }

  // ---------- flatbed ----------
  bx(2.8, 0.2, 5.9, DARK, 0, 1.35, -1.25);
  const RZ = [-3.7, -2.2, -0.7, 0.8];
  for (const s of [1, -1]) {
    bx(0.12, 0.3, 5.9, ARMOR, s * 1.4, 1.5, -1.25);
    for (let k = 0; k < 6; k++) pic(HAZARD, 0.9, 0.2, s * 1.466, 1.5, 1.35 - k * 0.97 + 0.05 - 0.5, [s, 0, 0]);
    for (let k = 0; k < 5; k++) bx(0.14, 0.34, 0.1, STEEL, s * 1.4, 1.55, -3.9 + k * 1.3);
  }
  // hoses cab -> pod
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.6, 2.1, 1.92], [s * 0.6, 1.75, 1.76], [s * 0.6, 2.2, 1.6]]), 0.05, { color: "#0c0d12", sides: 6 });
    glow(cy(0.065, 0.05, 6, CYAN, s * 0.6, 2.1, 1.88, [0, 0, 1]), 1.5);
  }

  // ---------- cargo pod ----------
  b.sweep([[0, 2.75, -4.1], [0, 2.75, 1.6]], 1.25, { color: POD, sides: 8, smooth: false, caps: "flat" });
  for (const z of RZ) {
    b.lathe([[1.2, -0.14], [1.5, -0.14], [1.5, 0.14], [1.2, 0.14]], { at: [0, 2.75, z], axis: [0, 0, 1], segments: 8, spin: 22.5, color: ARMOR });
    for (const d of [-0.17, 0.17])
      glow(b.lathe([[1.38, -0.035], [1.54, -0.035], [1.54, 0.035], [1.38, 0.035]], { at: [0, 2.75, z + d], axis: [0, 0, 1], segments: 8, spin: 22.5, color: CYAN }), 1.4);
  }
  // top ridge + vents
  lit(0.16, 0.04, 5.2, CYAN, 0, 4.02, -1.25, 1.1);
  for (const z of [-2.95, -1.45, 0.05]) {
    bx(1.0, 0.14, 0.6, DARK, 0, 4.07, z);
    for (let k = 0; k < 4; k++) lit(0.8, 0.02, 0.05, ORANGE, 0, 4.15, z - 0.2 + k * 0.13, 1.0);
  }
  // side panels
  for (const s of [1, -1]) {
    bx(0.04, 0.92, 1.25, DARK, s * 1.27, 2.75, -3.0);
    pic(SCREEN, 1.15, 0.84, s * 1.295, 2.75, -3.0, [s, 0, 0], 0.9);
    bx(0.04, 0.92, 1.25, DARK, s * 1.27, 2.75, -1.45);
    pic(LABEL, 1.15, 0.84, s * 1.295, 2.75, -1.45, [s, 0, 0]);
    bx(0.04, 0.92, 1.25, DARK, s * 1.27, 2.75, 0.05);
    pic(SEAL, 0.8, 0.8, s * 1.295, 2.75, 0.05, [s, 0, 0], 1.0);
    // lower hazard skirt
    for (let k = 0; k < 4; k++) pic(HAZARD, 0.9, 0.2, s * 1.2 + s * 0.12, 1.75, -3.3 + k * 1.3, [s, 0, 0]).scale.set(1.2, 1, 1);
  }
  // rear door
  cy(1.15, 0.12, 8, ARMOR, 0, 2.75, -4.16, [0, 0, 1]);
  cy(1.0, 0.06, 8, DARK, 0, 2.75, -4.22, [0, 0, 1]);
  pic(SEAL, 1.5, 1.5, 0, 2.75, -4.26, [0, 0, -1], 1.0);
  for (const s of [1, -1]) bx(0.12, 0.7, 0.14, STEEL, s * 0.95, 2.75, -4.25);
  // rear chassis lights + plate
  for (const s of [1, -1]) {
    lit(0.5, 0.18, 0.06, RED, s * 0.95, 1.05, -4.43, 2);
    lit(0.3, 0.06, 0.06, ORANGE, s * 1.25, 1.55, -4.15, 1.4);
  }
  bx(0.9, 0.5, 0.12, ARMOR, 0, 1.05, -4.42);
  pic(NUMPLATE, 0.7, 0.28, 0, 1.05, -4.5, [0, 0, -1]);
  // tow hooks
  for (const s of [1, -1]) b.part(new THREE.TorusGeometry(0.12, 0.035, 5, 8), STEEL, { at: [s * 0.7, 0.9, -4.5], dir: [0, 0, 1], axis: "z" });

  // scattered rivet studs on cab roof & pod top (deterministic)
  for (let i = 0; i < 14; i++) {
    const x = (r() - 0.5) * 2.0, z = 1.95 + r() * 0.6;
    if (Math.abs(x) < 0.6 && z < 2.7) continue;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 5), WHITE, { at: [x, 3.53, z] });
  }

  return b.root;
}
```