```ts
import * as THREE from "three";
import { createBuilder, paint, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Vault Warden Hauler",
  description:
    "Low-poly cyberpunk armoured convoy hauler: a six-wheel ram-nosed cab with roof and rear gun turrets, guarding a sealed, neon-banded cargo pod.",
};

type V = [number, number, number];
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);

const STEEL = "#3a4150", DARK = "#14161b", PLATE = "#4a5365", GUN = "#262a32", RIM = "#8a93a3";
const MAG = "#ff2bd6", CYAN = "#2bf0ff", AMBER = "#ffb02e", YEL = "#e9c32a", GLASS = "#0c2a38";

const HULL = paint((p, n) => {
  const seam = (v: number, s: number) => {
    const f = ((v / s) % 1 + 1) % 1;
    return Math.min(f, 1 - f) * s < 0.012;
  };
  if ((Math.abs(n.x) > 0.7 && (seam(p.z + 0.2, 0.9) || seam(p.y, 0.6))) || (Math.abs(n.y) > 0.7 && seam(p.z, 1.0)))
    return "#1a1d24";
  if (noise(p, 0.06, 3) > 0.8) return "#8791a3";
  if (p.y < 0.9) return "#23262d";
  return n.y > 0.6 ? PLATE : STEEL;
});
const CHEV = paint((p) => ((((p.x + p.y) / 0.16) % 1 + 1) % 1 < 0.5 ? YEL : DARK));
const PODSKIN = paint((p, n) => {
  const f = ((p.z / 0.5) % 1 + 1) % 1;
  if (Math.min(f, 1 - f) * 0.5 < 0.01) return "#171a20";
  if (noise(p, 0.05, 8) > 0.82) return "#a5aebd";
  return n.y > 0.5 ? "#c9ced8" : "#8a93a3";
});

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#111419" stroke="#ff2bd6" stroke-width="5"/>
  <g fill="#ffb02e"><circle cx="50" cy="50" r="9"/>
  <path d="M50 38 A12 12 0 0 1 61 44 L78 34 A32 32 0 0 0 50 18Z"/>
  <path d="M61 56 A12 12 0 0 1 50 62 L50 82 A32 32 0 0 0 78 66Z" transform="rotate(0 50 50)"/>
  <path d="M39 44 A12 12 0 0 0 39 56 L22 66 A32 32 0 0 1 22 34Z"/></g>
  <text x="50" y="96" font-family="Arial" font-weight="bold" font-size="12" fill="#2bf0ff" text-anchor="middle">SEALED</text></svg>`,
  { size: 256 },
);
const UNIT = svg(
  `<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="#111419" stroke="#2bf0ff" stroke-width="5"/>
  <text x="64" y="54" font-family="Arial Black, Arial" font-weight="900" font-size="44" fill="#2bf0ff" text-anchor="middle">C-07</text></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#e9c32a" stroke="#111" stroke-width="5"/>
  <polygon points="52,28 36,56 48,56 42,78 62,46 50,46 56,28" fill="#111"/></svg>`,
  { size: 192 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/>
  <g stroke="#0f4b5a">${[20, 40, 60, 80, 100, 120, 140].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`).join("")}</g>
  <path d="M10 80 C40 60 60 90 90 60 S140 40 155 20" fill="none" stroke="#2bf0ff" stroke-width="3"/>
  <circle cx="96" cy="46" r="6" fill="#ff2bd6"/><text x="8" y="16" font-family="monospace" font-size="12" fill="#2bf0ff">CARGO LOCK OK</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: chassis, at, ...o });
  const R = (a: V, d: V, r: number, c: any, o: any = {}) => b.rod(a, d, r, c, { bone: chassis, sides: 6, ...o });
  const neon = (a: V, d: V, c: string, r = 0.035) => glow(R(a, d, r, c, { caps: "flat" }), 1.6);

  // ---------- frame and running gear
  for (const s of [1, -1]) P(box(0.22, 0.3, 7.8), DARK, [s * 0.7, 0.8, -0.25]);
  for (const z of [3.2, 1.0, -1.2, -3.2]) P(box(1.9, 0.14, 0.2), DARK, [0, 0.82, z]);
  P(box(2.3, 0.1, 6.4), PLATE, [0, 1.0, -0.7]); // deck
  const axles = [2.6, -1.9, -3.2];
  const wheelJoints: any[] = [];
  for (const z of axles) {
    R([-1.35, 0.55, z], [1.35, 0.55, z], 0.09, DARK);
    for (const s of [1, -1]) {
      const sp = b.joint(`wheel${s > 0 ? "L" : "R"}${axles.indexOf(z)}`, {
        parent: chassis, at: [s * 1.35, 0.55, z], dir: [0, 1, 0], role: "hinge",
      });
      wheelJoints.push(sp);
      const W = (g: THREE.BufferGeometry, c: any, x: number, o: any = {}) =>
        b.part(g, c, { bone: sp, at: [s * (1.35 + x), 0.55, z], rotation: [0, 0, 90], flat: true, ...o });
      W(cyl(0.55, 0.5, 12), "#16181c", 0);
      W(cyl(0.58, 0.14, 12), "#1d2026", 0);
      W(cyl(0.3, 0.54, 10), RIM, 0);
      W(cyl(0.12, 0.6, 8), DARK, 0);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(cyl(0.025, 0.05, 6), STEEL, {
          bone: sp, at: [s * (1.35 + 0.28), 0.55 + 0.19 * Math.cos(a), z + 0.19 * Math.sin(a)], rotation: [0, 0, 90],
        });
      }
      glow(b.part(new THREE.TorusGeometry(0.4, 0.025, 5, 16), s > 0 ? CYAN : MAG, {
        bone: sp, at: [s * (1.35 + 0.27), 0.55, z], rotation: [0, 90, 0],
      }), 1.5);
    }
    for (const s of [1, -1]) {
      P(box(0.8, 0.1, 1.5), HULL, [s * 1.35, 1.2, z]); // fender
      P(box(0.8, 0.22, 0.08), STEEL, [s * 1.35, 1.1, z + 0.75]);
    }
  }
  // side skirts
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const z = 1.3 - i * 1.05;
      P(box(0.08, 0.5, 0.95), HULL, [s * 1.22, 0.8, z]);
      for (const dz of [-0.35, 0.35]) P(cyl(0.025, 0.04, 6), RIM, [s * 1.27, 0.8, z + dz], { rotation: [0, 0, 90] });
    }
  for (const s of [1, -1]) neon([s * 1.28, 0.5, -1.0], [s * 1.28, 0.5, 2.0], s > 0 ? CYAN : MAG, 0.025);
  neon([-0.9, 0.45, -3.9], [0.9, 0.45, -3.9], MAG, 0.025);

  // ---------- cab
  P(box(2.4, 0.95, 2.0), HULL, [0, 1.55, 2.3]);
  P(box(2.2, 0.7, 1.2), HULL, [0, 2.35, 2.0]);
  P(box(2.35, 0.08, 1.5), PLATE, [0, 2.74, 1.95]);
  b.frustumBox([0, 1.45, 3.3], [0, 1.35, 3.85], [2.4, 0.95], [2.2, 0.7], { bone: chassis, color: HULL });
  P(box(2.0, 0.5, 0.05), GLASS, [0, 2.4, 2.66], { rotation: [-18, 0, 0] }); // windscreen
  glow(P(box(1.9, 0.05, 0.03), CYAN, [0, 2.62, 2.7], { rotation: [-18, 0, 0] }), 1.4);
  P(box(1.8, 0.1, 0.06), DARK, [0, 2.14, 2.6]);
  for (const s of [1, -1]) {
    P(box(0.05, 0.42, 0.9), GLASS, [s * 1.11, 2.38, 2.0]);
    P(box(0.05, 0.42, 0.04), DARK, [s * 1.11, 2.38, 2.0]);
    P(box(0.14, 0.9, 0.06), DARK, [s * 1.2, 1.6, 2.45]); // door seam
    P(box(0.08, 0.9, 1.6), STEEL, [s * 1.24, 1.5, 2.0]); // door armour
    b.part(new THREE.PlaneGeometry(0.7, 0.4), "#ffffff", {
      bone: chassis, at: [s * 1.29, 1.5, 2.0], dir: [s, 0, 0], axis: "z", texture: UNIT,
    });
    R([s * 1.15, 2.4, 2.65], [s * 1.5, 2.3, 2.75], 0.02, DARK);
    P(box(0.05, 0.3, 0.2), DARK, [s * 1.52, 2.3, 2.75]);
    for (let k = 0; k < 4; k++) P(box(0.06, 0.04, 0.5), YEL, [s * 1.3, 1.1, 2.0 + 0.0], { scale: [1, 1, 1] });
    // headlights + intake
    glow(P(box(0.45, 0.14, 0.06), AMBER, [s * 0.85, 1.55, 3.62]), 1.6);
    P(box(0.55, 0.22, 0.04), DARK, [s * 0.85, 1.55, 3.6]);
    // exhaust stacks behind cab
    R([s * 1.3, 1.1, 1.45], [s * 1.3, 3.3, 1.45], 0.1, STEEL, { sides: 8 });
    P(cyl(0.15, 0.1, 8), DARK, [s * 1.3, 3.35, 1.45]);
    P(cyl(0.13, 0.5, 8), RIM, [s * 1.3, 1.6, 1.45], { scale: [1, 1, 1] });
  }
  // grille
  P(box(1.5, 0.5, 0.05), DARK, [0, 1.3, 3.8], { rotation: [-8, 0, 0] });
  for (let i = 0; i < 5; i++) glow(P(box(1.3, 0.03, 0.03), MAG, [0, 1.12 + i * 0.1, 3.84]), 1.3);
  // ram bumper
  b.frustumBox([0, 0.95, 3.75], [0, 0.95, 4.2], [2.5, 0.55], [2.7, 0.7], { bone: chassis, color: CHEV });
  for (let i = -3; i <= 3; i++) b.spike([i * 0.38, 0.95, 4.2], [0, 0, 1], 0.25, 0.07, STEEL, { bone: chassis, sides: 4 });
  P(box(1.5, 0.12, 0.5), PLATE, [0, 1.12, 3.9]);
  // roof lightbar, antenna, screen
  P(box(1.6, 0.1, 0.18), DARK, [0, 2.85, 2.5]);
  for (const [i, x] of [-0.6, -0.2, 0.2, 0.6].entries()) glow(P(box(0.3, 0.1, 0.12), i % 2 ? CYAN : MAG, [x, 2.93, 2.52]), 1.6);
  R([0.9, 2.78, 1.3], [0.9, 4.0, 1.25], 0.02, STEEL);
  P(new THREE.SphereGeometry(0.05, 6, 4), MAG, [0.9, 4.02, 1.25]);
  glow(b.part(new THREE.PlaneGeometry(0.6, 0.38), "#ffffff", {
    bone: chassis, at: [0, 2.38, 1.38], dir: [0, 0, -1], axis: "z", texture: SCREEN,
  }), 1.4);

  // ---------- turret helper
  const turret = (tag: string, x: number, y: number, z: number, d: number) => {
    const yaw = b.joint(`yaw${tag}`, { parent: chassis, at: [x, y + 0.08, z], dir: [0, 1, 0], role: "hinge" });
    b.part(new THREE.TorusGeometry(0.4, 0.04, 5, 12), STEEL, { bone: chassis, at: [x, y + 0.04, z], rotation: [90, 0, 0] });
    b.part(cyl(0.34, 0.2, 10), GUN, { bone: yaw, at: [x, y + 0.2, z], flat: true });
    for (const s of [1, -1]) b.part(box(0.06, 0.34, 0.5), GUN, { bone: yaw, at: [x + s * 0.24, y + 0.45, z] });
    const pitch = b.joint(`pitch${tag}`, { parent: yaw, at: [x, y + 0.5, z], dir: [0, 0, d], role: "hinge" });
    b.part(box(0.4, 0.28, 0.6), GUN, { bone: pitch, at: [x, y + 0.5, z + d * 0.1] });
    for (const s of [1, -1]) {
      b.rod([x + s * 0.12, y + 0.5, z + d * 0.3], [x + s * 0.12, y + 0.5, z + d * 1.4], 0.035, STEEL, { bone: pitch, sides: 6 });
      b.part(cyl(0.065, 0.14, 6), DARK, { bone: pitch, at: [x + s * 0.12, y + 0.5, z + d * 1.4], rotation: [90, 0, 0] });
      glow(b.part(cyl(0.03, 0.02, 6), MAG, { bone: pitch, at: [x + s * 0.12, y + 0.5, z + d * 1.48], rotation: [90, 0, 0] }), 1.6);
    }
    b.part(box(0.22, 0.2, 0.3), DARK, { bone: pitch, at: [x + 0.32, y + 0.45, z] });
    glow(b.part(box(0.1, 0.05, 0.02), CYAN, { bone: pitch, at: [x, y + 0.6, z + d * 0.42] }), 1.5);
  };
  turret("Roof", 0, 2.78, 2.1, 1);

  // ---------- cargo pod
  for (const z of [0.4, -1.3, -3.0]) {
    P(box(1.9, 0.2, 0.5), DARK, [0, 1.1, z]);
  }
  P(cyl(1.2, 5.0, 12), PODSKIN, [0, 2.3, -1.25], { rotation: [90, 0, 0], flat: true });
  P(new THREE.CylinderGeometry(0.8, 1.2, 0.5, 12), PODSKIN, [0, 2.3, 1.5], { rotation: [90, 0, 0], flat: true });
  P(new THREE.CylinderGeometry(0.8, 1.2, 0.5, 12), PODSKIN, [0, 2.3, -4.0], { rotation: [-90, 0, 0], flat: true });
  [0.7, -0.5, -1.7, -2.9].forEach((z, i) => {
    glow(P(new THREE.TorusGeometry(1.2, 0.05, 5, 24), i % 2 ? CYAN : MAG, [0, 2.3, z]), 1.5);
    for (const a of [30, 150, 210, 330]) {
      const r = (a * Math.PI) / 180;
      P(box(0.2, 0.16, 0.2), DARK, [1.2 * Math.sin(r), 2.3 + 1.2 * Math.cos(r), z], { rotation: [0, 0, -a] }); // clamps
    }
  });
  neon([0, 3.52, 0.8], [0, 3.52, -3.4], CYAN, 0.04);
  for (const s of [1, -1]) {
    P(box(0.06, 0.9, 1.7), STEEL, [s * 1.17, 2.3, -1.1]);
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      bone: chassis, at: [s * 1.215, 2.3, -1.1], dir: [s, 0, 0], axis: "z", texture: EMBLEM,
    });
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: chassis, at: [s * 1.215, 2.7, -2.4], dir: [s, 0, 0], axis: "z", texture: WARN,
    });
    P(cyl(0.12, 0.2, 8), DARK, [s * 0.8, 3.5, 0.2]); // vents
    P(box(0.5, 0.5, 0.25), PLATE, [s * 1.15, 1.55, -3.6]); // rear armour saddle
  }
  P(cyl(0.7, 0.06, 12), DARK, [0, 2.3, -4.32], { rotation: [90, 0, 0] });
  b.part(new THREE.CircleGeometry(0.62, 16), "#ffffff", {
    bone: chassis, at: [0, 2.3, -4.36], dir: [0, 0, -1], axis: "z", texture: EMBLEM,
  });
  for (const s of [1, -1]) {
    P(box(0.14, 0.5, 0.1), STEEL, [s * 0.85, 2.3, -4.3]);
    glow(P(box(0.06, 0.1, 0.04), AMBER, [s * 0.85, 2.3, -4.36]), 1.5);
  }
  turret("Rear", 0, 3.45, -3.0, -1);
  // rear bumper and tail lights
  P(box(2.5, 0.35, 0.3), CHEV, [0, 0.95, -4.15]);
  for (const s of [1, -1]) {
    glow(P(box(0.5, 0.1, 0.05), "#ff2a2a", [s * 0.9, 1.3, -4.3]), 1.6);
    R([s * 0.6, 0.7, -3.9], [s * 0.6, 0.7, -4.4], 0.07, STEEL, { sides: 8 });
  }
  void wheelJoints;
  return b.root;
}
```