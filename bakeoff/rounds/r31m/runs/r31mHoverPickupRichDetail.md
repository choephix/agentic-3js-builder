```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { mottle } from "agentic-3js-builder";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup truck with its wheels replaced by four ducted hover thrusters, in low-poly cyberpunk style, with a missile rack, neon trim and glowing lights.",
};

const MAG = "#ff2fa0";
const CYAN = "#27f0ff";
const AMBER = "#ffb02e";
const RED = "#ff2a3a";
const DARK = "#14161c";
const ARMOR = "#262b34";
const GLASS = "#0b4a5c";
const YELLOW = "#f2c418";

const BODY = panelled(mottle("#3f4d3e", "#2f3b35", { size: 0.6, seed: 4 }), { size: 0.55, rivets: 0.12 });
const PLATE = panelled(metal("iron"), { size: 0.35, rivets: 0.08 });
const STEEL = metal("steel", { tarnish: 0.4 });
const PODMETAL = metal("blued", { tarnish: 0.3 });

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c418"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#15151a"/>`).join("")}
  <rect width="64" height="16" fill="none" stroke="#15151a" stroke-width="2"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#14161c" stroke="#ff2fa0" stroke-width="5"/>
  <path d="M50 14 L82 70 L18 70Z" fill="none" stroke="#27f0ff" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="50" cy="52" r="9" fill="#ff2fa0"/><circle cx="50" cy="52" r="3.5" fill="#fff"/>
  <path d="M20 84 H80" stroke="#27f0ff" stroke-width="4"/><path d="M30 90 H70" stroke="#ff2fa0" stroke-width="3"/></svg>`,
  { size: 256 },
);
const NUMBER = svg(
  `<svg viewBox="0 0 120 60"><rect x="2" y="2" width="116" height="56" rx="6" fill="none" stroke="#e8e8e8" stroke-width="3" opacity="0.9"/>
  <text x="60" y="44" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#e8e8e8" stroke="#14161c" stroke-width="1.5">MX-7</text>
  <path d="M8 52 H30 M90 52 H112" stroke="#ff2fa0" stroke-width="3"/></svg>`,
  { size: 256 },
);
const KANJI = svg(
  `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#14161c"/>
  <text x="60" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#27f0ff">RZ-4419</text>
  <rect x="2" y="2" width="116" height="36" fill="none" stroke="#ff2fa0" stroke-width="2"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const bx = (w: number, h: number, d: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rot as any });
  const cz = (r: number, len: number, color: any, at: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: at as any, rotation: [90, 0, 0] });
  const cy = (r: number, h: number, color: any, at: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at: at as any });
  const L = (part: any, s = 1) => glow(part, s);

  // ---------- chassis ----------
  bx(1.8, 0.16, 4.9, PLATE, [0, 0.7, 0]);
  bx(1.5, 0.06, 4.4, DARK, [0, 0.6, 0]);
  L(bx(0.05, 0.03, 3.9, MAG, [0.93, 0.62, -0.1]), 1.4);
  L(bx(0.05, 0.03, 3.9, MAG, [-0.93, 0.62, -0.1]), 1.4);
  L(bx(1.2, 0.02, 3.6, CYAN, [0, 0.56, 0]), 0.8);
  // ---------- main body (cab + hood) ----------
  b.extrude(
    [[-1.1, 0.78], [2.7, 0.78], [2.7, 1.2], [1.0, 1.4], [0.4, 2.0], [-0.9, 2.0], [-1.1, 1.8]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.05, color: BODY },
  );
  // roof plate + rails
  bx(1.6, 0.06, 1.2, ARMOR, [0, 2.03, -0.25]);
  for (const s of [1, -1]) {
    bx(0.06, 0.08, 1.3, STEEL, [s * 0.8, 2.1, -0.25]);
    for (const z of [-0.8, -0.25, 0.3]) bx(0.05, 0.1, 0.05, STEEL, [s * 0.8, 2.06, z]);
  }
  // roof light bar
  bx(1.4, 0.1, 0.2, DARK, [0, 2.14, 0.25]);
  L(bx(0.66, 0.07, 0.16, MAG, [0.36, 2.14, 0.255]), 1.6);
  L(bx(0.66, 0.07, 0.16, CYAN, [-0.36, 2.14, 0.255]), 1.6);
  // antenna + dome sensor
  cy(0.012, 1.0, DARK, [-0.7, 2.55, -0.75], 5);
  L(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [-0.7, 3.07, -0.75] }), 2);
  b.part(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), ARMOR, { at: [0.45, 2.06, -0.6] });
  L(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { at: [0.45, 2.2, -0.52] }), 1.5);
  // windshield
  bx(1.74, 0.82, 0.03, GLASS, [0, 1.71, 0.71], [-45, 0, 0]);
  L(bx(1.6, 0.04, 0.03, CYAN, [0, 1.99, 0.43], [-45, 0, 0]), 0.9);
  // rear window
  bx(1.5, 0.3, 0.03, GLASS, [0, 1.8, -1.015], [10, 0, 0]);
  // side windows, doors
  for (const s of [1, -1]) {
    b.extrude([[-0.85, 1.55], [0.8, 1.55], [0.5, 1.9], [-0.8, 1.9]], {
      at: [s * 0.955, 0, 0], x: [0, 0, 1], thickness: 0.03, color: GLASS,
    });
    bx(0.02, 0.82, 0.015, DARK, [s * 0.955, 1.15, 0.85]);
    bx(0.02, 0.82, 0.015, DARK, [s * 0.955, 1.15, -0.9]);
    bx(0.02, 0.015, 1.75, DARK, [s * 0.955, 0.8, -0.02]);
    bx(0.04, 0.05, 0.22, STEEL, [s * 0.97, 1.35, 0.55]);
    b.part(new THREE.PlaneGeometry(0.62, 0.31), "#ffffff", { at: [s * 0.962, 1.08, -0.02], dir: [s, 0, 0], axis: "z", texture: NUMBER });
    // armor door plate
    bx(0.04, 0.4, 1.0, ARMOR, [s * 0.965, 0.98, -0.02]);
    for (const z of [-0.45, 0.4]) for (const y of [0.85, 1.1]) cy(0.025, 0.03, STEEL, [s * 0.99, y, z], 6).rotation.z = Math.PI / 2;
    // mirrors
    bx(0.06, 0.08, 0.1, DARK, [s * 1.0, 1.62, 0.78]);
    bx(0.22, 0.16, 0.05, ARMOR, [s * 1.14, 1.68, 0.82]);
    L(bx(0.16, 0.1, 0.02, CYAN, [s * 1.14, 1.68, 0.86]), 0.6);
    // side skirts + neon
    bx(0.12, 0.2, 3.2, ARMOR, [s * 1.0, 0.78, 0.4]);
    L(bx(0.03, 0.03, 3.0, s > 0 ? MAG : CYAN, [s * 1.065, 0.74, 0.4]), 1.6);
    // fender flares at front over hood
    bx(0.1, 0.34, 1.3, ARMOR, [s * 0.98, 1.04, 1.8]);
    for (let i = 0; i < 4; i++) bx(0.025, 0.05, 0.12, DARK, [s * 1.035, 1.0 + (i % 2) * 0.12, 1.45 + i * 0.2]);
  }
  // ---------- hood ----------
  bx(0.9, 0.08, 1.2, ARMOR, [0, 1.33, 1.75], [-7, 0, 0]);
  for (let i = 0; i < 5; i++) bx(0.7, 0.015, 0.05, DARK, [0, 1.385 - i * 0.003, 1.35 + i * 0.12], [-7, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", { at: [0, 1.31, 2.3], dir: [0, 1, 0.118], axis: "z", up: [0, 0, 1], texture: EMBLEM });
  L(bx(1.6, 0.02, 0.03, CYAN, [0, 1.27, 2.68]), 1.4);
  // hood bolts
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) cy(0.025, 0.03, STEEL, [s * 0.42, 1.36 - i * 0.012, 1.3 + i * 0.3], 6);
  // ---------- front end ----------
  bx(1.5, 0.4, 0.06, DARK, [0, 1.0, 2.71]);
  for (let i = 0; i < 5; i++) bx(1.2, 0.025, 0.04, STEEL, [0, 0.88 + i * 0.07, 2.74]);
  for (const s of [1, -1]) {
    bx(0.5, 0.2, 0.08, ARMOR, [s * 0.68, 1.1, 2.7]);
    L(bx(0.4, 0.1, 0.04, "#e8fdff", [s * 0.68, 1.1, 2.74]), 2);
  }
  bx(2.1, 0.32, 0.3, ARMOR, [0, 0.86, 2.85]);
  b.part(new THREE.PlaneGeometry(1.9, 0.2), "#ffffff", { at: [0, 0.86, 3.007], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  for (const s of [1, -1]) {
    bx(0.08, 0.8, 0.08, STEEL, [s * 0.5, 1.0, 3.0]);
    cy(0.045, 0.6, STEEL, [s * 0.5, 1.42, 3.0], 6);
  }
  bx(1.1, 0.07, 0.09, STEEL, [0, 1.22, 3.0]);
  cz(0.08, 0.8, DARK, [0, 0.62, 2.95], 8);
  bx(0.4, 0.14, 0.02, "#ffffff", [0.75, 0.72, 3.0]);
  b.part(new THREE.PlaneGeometry(0.4, 0.13), "#ffffff", { at: [0.7, 0.62, 3.008], dir: [0, 0, 1], axis: "z", texture: KANJI });
  // ---------- bed ----------
  bx(1.9, 0.1, 1.6, ARMOR, [0, 1.0, -1.9]);
  for (const s of [1, -1]) {
    bx(0.1, 0.5, 1.7, BODY, [s * 0.9, 1.25, -1.9]);
    bx(0.14, 0.05, 1.74, STEEL, [s * 0.9, 1.52, -1.9]);
    for (let i = 0; i < 4; i++) cy(0.025, 0.03, STEEL, [s * 0.96, 1.25, -1.35 - i * 0.35], 6).rotation.z = Math.PI / 2;
    L(bx(0.03, 0.03, 1.4, s > 0 ? CYAN : MAG, [s * 0.96, 1.08, -1.9]), 1.2);
  }
  bx(1.9, 0.5, 0.1, BODY, [0, 1.25, -1.1]); // front bed wall
  bx(1.9, 0.5, 0.1, BODY, [0, 1.25, -2.75]); // tailgate
  bx(1.5, 0.06, 0.04, DARK, [0, 1.3, -2.81]);
  bx(0.42, 0.14, 0.02, "#d8d8d8", [0, 1.12, -2.81]);
  for (const s of [1, -1]) L(bx(0.3, 0.12, 0.03, RED, [s * 0.65, 1.38, -2.81]), 1.6);
  // rear thrust nozzles
  for (const s of [1, -1]) {
    cz(0.17, 0.4, DARK, [s * 0.45, 0.9, -2.88], 8);
    L(cz(0.12, 0.05, AMBER, [s * 0.45, 0.9, -3.08], 8), 2);
    cz(0.2, 0.06, STEEL, [s * 0.45, 0.9, -2.7], 8);
  }
  // cargo crates
  bx(0.5, 0.35, 0.5, "#4a5240", [0.45, 1.23, -2.4]);
  bx(0.52, 0.04, 0.52, YELLOW, [0.45, 1.42, -2.4]);
  bx(0.4, 0.3, 0.4, "#3a4a60", [-0.55, 1.2, -2.5]);
  // ---------- missile rack ----------
  const O = new THREE.Vector3(0, 1.62, -1.7);
  const Q = new THREE.Quaternion().setFromEuler(new THREE.Euler((-32 * Math.PI) / 180, 0, 0));
  const place = (geo: THREE.BufferGeometry, color: any, loc: number[], rot: number[] = [0, 0, 0]) => {
    const pos = new THREE.Vector3(...loc).applyQuaternion(Q).add(O);
    const lq = new THREE.Quaternion().setFromEuler(new THREE.Euler((rot[0] * Math.PI) / 180, (rot[1] * Math.PI) / 180, (rot[2] * Math.PI) / 180));
    return b.part(geo, color, { at: pos, quat: Q.clone().multiply(lq) });
  };
  for (const s of [1, -1]) bx(0.1, 0.5, 0.1, STEEL, [s * 0.35, 1.27, -1.75], [0, 0, 0]);
  place(new THREE.BoxGeometry(1.1, 0.7, 1.3), PLATE, [0, 0, 0]);
  place(new THREE.BoxGeometry(1.14, 0.06, 1.34), ARMOR, [0, 0.38, 0]);
  place(new THREE.BoxGeometry(0.06, 0.72, 1.34), ARMOR, [0.58, 0, 0]);
  place(new THREE.BoxGeometry(0.06, 0.72, 1.34), ARMOR, [-0.58, 0, 0]);
  place(new THREE.BoxGeometry(1.0, 0.04, 0.04), YELLOW, [0, 0.2, 0.67]);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      const lx = (i - 1) * 0.34;
      const ly = (j - 0.5) * 0.33;
      place(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 8), DARK, [lx, ly, 0.66], [90, 0, 0]);
      L(place(new THREE.ConeGeometry(0.09, 0.2, 6), j ? AMBER : RED, [lx, ly, 0.6], [90, 0, 0]), 1.6);
    }
  place(new THREE.PlaneGeometry(0.5, 0.16), "#ffffff", [0, -0.36, 0.2], [90, 0, 0]);
  place(new THREE.BoxGeometry(0.4, 0.05, 0.3), CYAN, [0, 0.42, -0.3]);
  glow(b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), CYAN, { at: [0, 0.1, 0] }), 1);

  // ---------- hover thrusters ----------
  const pod = (s: number, z: number) => {
    const x = s * 1.3;
    b.lathe([[0.36, 0], [0.54, 0], [0.57, 0.5], [0.52, 0.64], [0.36, 0.5]], { at: [x, 0, z], segments: 10, color: PODMETAL });
    cy(0.36, 0.05, DARK, [x, 0.1, z], 10);
    L(cy(0.33, 0.03, CYAN, [x, 0.06, z], 10), 1.8);
    for (let k = 0; k < 3; k++)
      b.part(new THREE.BoxGeometry(0.66, 0.015, 0.08), DARK, { at: [x, 0.22, z], rotation: [0, k * 60, 0] });
    cy(0.08, 0.14, STEEL, [x, 0.22, z], 6);
    b.part(new THREE.TorusGeometry(0.55, 0.025, 4, 12), MAG, { at: [x, 0.04, z], rotation: [90, 0, 0] });
    glow(b.root.children.length ? b.part(new THREE.TorusGeometry(0.46, 0.015, 4, 12), CYAN, { at: [x, 0.58, z], rotation: [90, 0, 0] }) : (null as any), 1.4);
    cy(0.5, 0.05, ARMOR, [x, 0.64, z], 10);
    bx(0.6, 0.14, 0.5, PLATE, [s * 1.02, 0.68, z]);
    for (const a of [0, 1, 2, 3]) {
      const ang = (a * Math.PI) / 2 + Math.PI / 4;
      cy(0.02, 0.03, STEEL, [x + Math.cos(ang) * 0.5, 0.67, z + Math.sin(ang) * 0.5], 6);
    }
    bx(0.05, 0.22, 0.2, YELLOW, [x + s * 0.5, 0.45, z]);
  };
  for (const s of [1, -1]) for (const z of [1.75, -1.75]) pod(s, z);

  // ---------- underbody details ----------
  cz(0.08, 4.0, DARK, [0.4, 0.5, 0], 6);
  cz(0.06, 4.0, STEEL, [-0.4, 0.5, 0], 6);
  bx(0.6, 0.16, 0.5, ARMOR, [0, 0.55, 0.3]);

  return b.root;
}
```