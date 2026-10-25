```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nyx-77 Warhauler",
  description: "Low-poly cyberpunk 8x8 militarized truck from 2077: armored cab, railgun turret, missile pods, neon underglow.",
};

const OLIVE = "#2f3a34", DARK = "#15171c", STEEL = "#4b5260", TIRE = "#0e0e11", CYAN = "#19f0ff", MAG = "#ff2d9a";
const AMBER = "#ffb02e", RED = "#ff2a3a", GLASS = "#0a2a3a", BRASS = "#8a7040", TAN = "#8c7f5a";

const HULL = paint((p, n) => {
  const g = noise(p, 0.5, 3);
  let c = mix("#2a342f", "#3f4d44", g);
  c = mix(c, "#5a6a5e", smoothstep(0.5, 1, n.y) * 0.4);
  c = mix(c, "#171a1a", smoothstep(1.7, 1.0, p.y) * 0.8);
  c = mix(c, "#4a3f2c", smoothstep(1.5, 0.9, p.y) * smoothstep(0.55, 0.8, noise(p, 0.25, 8)) * 0.8);
  const seam = Math.abs(((p.z * 1.2) % 1 + 1) % 1 - 0.5) > 0.485 ? 0.6 : 1;
  return [c[0] * seam, c[1] * seam, c[2] * seam];
});
const PLATE = paint((p) => mix("#3a423e", "#56605a", noise(p, 0.3, 5)));
const METAL = paint((p) => mix("#30343c", "#5b6270", noise(p, 0.12, 2)));

const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffb02e"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#111"/>`).join("")}</svg>`, { size: 128 });
const EMBLEM = svg(`<svg viewBox="0 0 100 50"><rect x="1" y="1" width="98" height="48" rx="4" fill="#101418" stroke="#19f0ff" stroke-width="2"/><path d="M12 38 L28 10 L44 38 L36 38 L28 24 L20 38Z" fill="#ff2d9a"/><path d="M48 12 h8 l12 18 v-18 h8 v26 h-8 l-12 -18 v18 h-8z" fill="#19f0ff"/><text x="80" y="43" font-family="monospace" font-size="9" fill="#ffb02e" text-anchor="middle">2077</text><path d="M10 45 H90" stroke="#ffb02e" stroke-width="1.5" stroke-dasharray="4 2"/></svg>`, { size: 256 });
const GRILLE = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0b0c10"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${3 + i * 7.6}" y="3" width="4.5" height="18" fill="#2a2f3a"/><rect x="${3 + i * 7.6}" y="${3 + (i % 3) * 6}" width="4.5" height="2" fill="#19f0ff"/>`).join("")}</svg>`, { size: 192 });
const HUD = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#06202c"/><path d="M0 24 L10 18 L20 22 L32 8 L44 16 L54 6 L64 12" stroke="#19f0ff" stroke-width="1.5" fill="none"/><circle cx="50" cy="22" r="6" stroke="#ff2d9a" stroke-width="1.2" fill="none"/><path d="M4 4 h20 M4 8 h14" stroke="#19f0ff" stroke-width="1"/></svg>`, { size: 128 });
const PLATE_TX = svg(`<svg viewBox="0 0 48 16"><rect width="48" height="16" rx="2" fill="#e8e8d0"/><text x="24" y="12" font-family="monospace" font-weight="bold" font-size="11" fill="#111" text-anchor="middle">NX-077</text></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "warhauler" });
  const P = (g: THREE.BufferGeometry, c: any, x: number, y: number, z: number, o: any = {}) => b.part(g, c, { at: [x, y, z], ...o });
  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, o: any = {}) => P(new THREE.BoxGeometry(w, h, d), c, x, y, z, o);
  const cylX = (r: number, l: number, c: any, x: number, y: number, z: number, seg = 8, o: any = {}) => P(new THREE.CylinderGeometry(r, r, l, seg), c, x, y, z, { rotation: [0, 0, 90], ...o });
  const cylZ = (r: number, l: number, c: any, x: number, y: number, z: number, seg = 8, o: any = {}) => P(new THREE.CylinderGeometry(r, r, l, seg), c, x, y, z, { rotation: [90, 0, 0], ...o });
  const cylY = (r: number, l: number, c: any, x: number, y: number, z: number, seg = 8, o: any = {}) => P(new THREE.CylinderGeometry(r, r, l, seg), c, x, y, z, o);
  const decal = (tx: THREE.Texture, w: number, h: number, x: number, y: number, z: number, dir: number[], o: any = {}) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", x, y, z, { dir, axis: "z", texture: tx, ...o });

  // ---- chassis
  box(2.2, 0.4, 9.2, DARK, 0, 1.05, -0.4);
  for (const s of [1, -1]) {
    box(0.2, 0.3, 9.0, STEEL, s * 1.0, 0.9, -0.4);
    box(0.08, 0.06, 8.6, MAG, s * 1.4, 0.88, -0.3, { });
    glow(box(0.06, 0.08, 8.6, MAG, s * 1.34, 0.86, -0.3), 2);
  }
  for (let i = 0; i < 6; i++) box(2.6, 0.18, 0.3, METAL, 0, 0.82, -4 + i * 1.5);
  // axles + wheels
  const wz = [3.2, 1.9, -1.6, -2.9];
  wz.forEach((z, wi) => {
    cylX(0.14, 3.0, METAL, 0, 0.7, z, 8);
    box(0.5, 0.35, 0.5, STEEL, 0, 0.95, z);
    for (const s of [1, -1]) {
      cylX(0.7, 0.62, TIRE, s * 1.4, 0.7, z, 10);
      cylX(0.5, 0.66, "#1b1d22", s * 1.4, 0.7, z, 10);
      cylX(0.36, 0.7, METAL, s * 1.4, 0.7, z, 8);
      glow(cylX(0.14, 0.74, CYAN, s * 1.4, 0.7, z, 6), 1.6);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        box(0.06, 0.07, 0.07, BRASS, s * 1.76, 0.7 + Math.sin(a) * 0.26, z + Math.cos(a) * 0.26);
      }
      // fender + flap
      box(0.8, 0.14, 1.7, HULL, s * 1.4, 1.52, z);
      box(0.8, 0.5, 0.1, HULL, s * 1.4, 1.3, z + 0.82, { rotation: [-20, 0, 0] });
      box(0.7, 0.4, 0.06, DARK, s * 1.4, 0.45, z - 0.9);
      box(0.06, 0.1, 1.5, AMBER, s * 1.78, 1.52, z);
      glow(box(0.04, 0.06, 0.4, AMBER, s * 1.82, 1.52, z + 0.55), 1.5);
    }
  });

  // ---- cab
  const cabOutline: [number, number][] = [[1.6, 1.25], [4.5, 1.25], [4.55, 1.95], [4.0, 2.25], [3.35, 3.15], [2.0, 3.25], [1.6, 3.1]];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.5, bevel: 0.06, color: HULL });
  // hood armour
  box(2.3, 0.1, 1.0, PLATE, 0, 2.28, 4.0, { rotation: [-12, 0, 0] });
  box(2.4, 0.5, 0.3, STEEL, 0, 1.35, 4.62);
  decal(GRILLE, 1.7, 0.6, 0, 1.85, 4.58, [0, 0, 1]);
  glow(box(2.0, 0.07, 0.06, CYAN, 0, 2.1, 4.6), 2);
  glow(box(0.5, 0.12, 0.06, AMBER, 0, 1.35, 4.8), 1.5);
  decal(PLATE_TX, 0.6, 0.2, 0, 1.3, 4.79, [0, 0, 1]);
  // bumper wedge
  box(2.7, 0.35, 0.5, DARK, 0, 1.2, 4.7);
  box(2.8, 0.2, 0.1, HAZARD, "#ffffff" as any, 0, 0, 0);
  decal(HAZARD, 2.7, 0.3, 0, 1.2, 4.96, [0, 0, 1]);
  for (const s of [1, -1]) {
    box(0.6, 0.3, 0.12, AMBER, s * 1.0, 1.8, 4.57);
    glow(box(0.5, 0.18, 0.06, "#fff2c0", s * 1.0, 1.8, 4.64), 2.2);
    box(0.2, 0.8, 0.3, STEEL, s * 1.35, 1.7, 4.45, { rotation: [0, 0, s * 8] });
    box(0.12, 0.12, 0.4, RED, s * 1.1, 1.0, 5.0);
  }
  // windscreen
  box(2.2, 1.12, 0.06, GLASS, 0, 2.7, 3.7, { rotation: [-33.7, 0, 0] });
  glow(box(2.0, 0.05, 0.05, CYAN, 0, 2.2, 4.03, { }), 1.5);
  decal(HUD, 1.0, 0.5, 0.5, 2.95, 3.55, [0, 0.55, 0.83], { up: [0, 1, 0] });
  // side windows, doors
  for (const s of [1, -1]) {
    box(0.06, 0.75, 1.2, GLASS, s * 1.27, 2.7, 2.75);
    box(0.08, 0.06, 1.3, CYAN, s * 1.27, 3.1, 2.75);
    glow(box(0.04, 0.04, 1.2, CYAN, s * 1.3, 3.1, 2.75), 1.5);
    box(0.08, 1.4, 0.05, DARK, s * 1.27, 2.15, 3.4);
    box(0.08, 0.1, 0.35, STEEL, s * 1.3, 2.2, 2.4);
    box(0.5, 0.35, 0.1, DARK, s * 1.55, 2.7, 3.6); // mirror
    box(0.06, 0.06, 0.4, STEEL, s * 1.38, 2.65, 3.5);
    glow(box(0.4, 0.2, 0.04, MAG, s * 1.55, 2.7, 3.66), 1.3);
    // armor skirts
    box(0.12, 0.5, 2.6, PLATE, s * 1.3, 1.5, 3.05);
    decal(EMBLEM, 1.0, 0.5, s * 1.37, 1.95, 2.55, [s, 0, 0]);
  }
  // roof gear
  box(2.4, 0.12, 1.5, PLATE, 0, 3.32, 2.65);
  cylY(0.3, 0.2, METAL, 0.5, 3.5, 2.6, 8);
  P(new THREE.SphereGeometry(0.3, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, 0.5, 3.6, 2.6);
  glow(cylY(0.06, 0.04, RED, 0.5, 3.9, 2.6, 6), 2);
  for (const [x, h] of [[-0.9, 1.6], [-1.1, 1.1], [1.0, 1.3]]) {
    cylY(0.02, h, DARK, x, 3.4 + h / 2, 2.0, 5);
    glow(P(new THREE.SphereGeometry(0.04, 5, 4), RED, x, 3.4 + h, 2.0), 2);
  }
  box(2.2, 0.14, 0.2, DARK, 0, 3.45, 3.3);
  for (let i = 0; i < 5; i++) glow(box(0.3, 0.1, 0.22, i % 2 ? RED : "#2a6bff", -0.8 + i * 0.4, 3.45, 3.3), 2);
  // exhaust stacks
  for (const s of [1, -1]) {
    cylY(0.12, 2.4, STEEL, s * 1.15, 2.6, 1.45, 8);
    cylY(0.16, 0.2, DARK, s * 1.15, 3.85, 1.45, 8);
    for (let k = 0; k < 3; k++) cylY(0.14, 0.05, BRASS, s * 1.15, 1.8 + k * 0.7, 1.45, 8);
    glow(cylY(0.1, 0.04, AMBER, s * 1.15, 3.96, 1.45, 8), 1.4);
  }

  // ---- cargo / armored bay
  b.extrude([[-4.7, 1.25], [1.45, 1.25], [1.45, 2.6], [1.1, 2.95], [-4.2, 2.95], [-4.7, 2.5]], { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.7, bevel: 0.05, color: HULL });
  box(2.9, 0.08, 6.0, PLATE, 0, 3.0, -1.6);
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      box(0.1, 1.0, 1.0, PLATE, s * 1.37, 2.05, 0.8 - i * 1.25);
      box(0.12, 0.06, 0.3, i % 2 ? CYAN : MAG, s * 1.4, 2.5, 0.8 - i * 1.25);
      glow(box(0.04, 0.05, 0.6, i % 2 ? CYAN : MAG, s * 1.42, 2.7, 0.8 - i * 1.25), 1.6);
      for (let r = 0; r < 4; r++) box(0.04, 0.05, 0.05, BRASS, s * 1.43, 1.65 + (r % 2) * 0.8, 0.45 + (r < 2 ? 0 : 0.6) - i * 1.25);
    }
    decal(HAZARD, 3.0, 0.2, s * 1.42, 1.4, -1.6, [s, 0, 0]);
    // missile pods
    box(0.7, 0.7, 1.6, DARK, s * 0.95, 3.45, -3.2);
    for (let m = 0; m < 4; m++) {
      const mx = s * 0.95 + (m % 2 ? 0.16 : -0.16), my = 3.45 + (m < 2 ? 0.16 : -0.16);
      cylZ(0.11, 0.1, METAL, mx, my, -2.38, 8);
      glow(cylZ(0.06, 0.04, RED, mx, my, -2.43, 6), 1.6);
    }
    box(0.8, 0.1, 1.7, STEEL, s * 0.95, 3.82, -3.2);
    box(0.6, 0.6, 0.2, STEEL, s * 0.95, 3.35, -3.9, { rotation: [0, 0, 0] });
    // fuel / battery tanks
    cylZ(0.22, 1.5, TAN, s * 1.55, 0.95, 0.4, 8);
    cylZ(0.2, 1.5, DARK, s * 1.55, 0.95, -4.3 + 0, 8);
    box(0.1, 0.22, 0.2, AMBER, s * 1.55, 0.95, 0.0);
  }
  // railgun turret
  cylY(0.95, 0.25, STEEL, 0, 3.2, -1.6, 10);
  cylY(0.8, 0.2, METAL, 0, 3.4, -1.6, 10);
  box(1.4, 0.7, 1.7, HULL, 0, 3.85, -1.6);
  box(1.0, 0.25, 0.9, PLATE, 0, 4.3, -1.8, { rotation: [8, 0, 0] });
  for (const s of [1, -1]) {
    box(0.3, 0.45, 0.9, PLATE, s * 0.45, 3.85, -0.65);
    box(0.12, 0.5, 1.0, DARK, s * 0.8, 3.9, -1.7);
    box(0.5, 0.18, 0.1, MAG, s * 0.6, 4.1, -0.72);
  }
  for (const s of [1, -1]) box(0.1, 0.1, 3.8, STEEL, s * 0.26, 3.95, 0.4);
  cylZ(0.12, 4.6, DARK, 0, 3.95, 0.7, 8);
  for (let i = 0; i < 6; i++) {
    cylZ(0.2, 0.12, METAL, 0, 3.95, -0.1 + i * 0.6, 8);
    glow(cylZ(0.205, 0.04, CYAN, 0, 3.95, -0.1 + i * 0.6 + 0.08, 8), 2);
  }
  cylZ(0.17, 0.3, STEEL, 0, 3.95, 3.0, 8);
  glow(cylZ(0.06, 0.05, CYAN, 0, 3.95, 3.18, 6), 2.5);
  // turret sensor eye
  box(0.4, 0.3, 0.4, DARK, 0.45, 4.55, -1.4);
  glow(P(new THREE.SphereGeometry(0.1, 6, 4), RED, 0.45, 4.55, -1.2), 2.5);
  // rear
  box(2.4, 0.5, 0.25, DARK, 0, 1.55, -4.8);
  decal(HAZARD, 2.4, 0.4, 0, 1.55, -4.93, [0, 0, -1]);
  decal(PLATE_TX, 0.6, 0.2, 0, 2.2, -4.82, [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.2, 0.06, RED, s * 0.9, 2.5, -4.78), 2);
    cylZ(0.1, 0.6, STEEL, s * 0.6, 1.0, -4.95, 6);
    box(0.4, 0.04, 6.4, AMBER, s * 0.0 + s * 1.25, 3.02, -1.6);
  }
  // roof antenna array behind turret
  for (let i = 0; i < 3; i++) {
    cylY(0.025, 1.2 + i * 0.4, DARK, -0.8 + i * 0.5, 3.6 + (1.2 + i * 0.4) / 2, -4.2, 5);
    glow(P(new THREE.SphereGeometry(0.05, 5, 4), i === 1 ? MAG : CYAN, -0.8 + i * 0.5, 3.6 + 1.2 + i * 0.4, -4.2), 2.5);
  }
  // cab hose/cable between cab and bay
  cylX(0.07, 2.0, DARK, 0, 1.45, 1.55, 6);
  return b.root;
}
```