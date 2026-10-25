```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, rgb, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured convoy hauler: six-wheel cab with roof turret, ram bumper, neon underglow, and a strapped, sealed cargo pod on the flatbed.",
};

// ---------- palette ----------
const MAG = "#ff2fa0";
const CYAN = "#27f2ff";
const YEL = "#f6c21c";
const ORANGE = "#ff7a1a";
const GLASS = "#0b2a3a";
const RUBBER = "#15161c";
const STEEL = "#7d8696";
const DARK = "#1a1c24";

// ---------- paints ----------
function plated(lo: string, hi: string, cell: number, seed: number) {
  const L = rgb(lo);
  const H = rgb(hi);
  const seam = rgb("#07080b");
  const edge = rgb("#8f9bb0");
  return paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = (((u / cell) % 1) + 1) % 1 * cell;
    const dv = (((v / (cell * 0.7)) % 1) + 1) % 1 * cell * 0.7;
    let c = mix(L, H, noise(p, 0.7, seed) * 0.8);
    c = mix(c, H, smoothstep(0.3, 1, n.y) * 0.35);
    c = mix(c, L, smoothstep(-0.2, -1, n.y) * 0.5);
    c = mix(c, "#07080b", 0.5 * smoothstep(1.7, 0.6, p.y) * (0.5 + noise(p, 0.3, seed + 4)));
    if (du < 0.014 || dv < 0.014) return mix(c, seam, 0.9);
    if (du < 0.03 || dv < 0.03) return mix(c, edge, 0.18);
    return c;
  });
}
const CAB = plated("#1b2838", "#36506b", 0.7, 3);
const ARMOR = plated("#262a33", "#434a59", 0.6, 7);
const POD = plated("#98a0ad", "#dde1e8", 1.1, 5);
const CHASSIS = plated("#16181e", "#2c303a", 0.5, 11);

// ---------- textures ----------
const HAZARD = (() => {
  let s = `<svg viewBox="0 0 96 16" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="16" fill="#101014"/>`;
  for (let i = -2; i < 12; i++) s += `<polygon points="${i * 10},16 ${i * 10 + 5},16 ${i * 10 + 13},0 ${i * 10 + 8},0" fill="${YEL}"/>`;
  return svg(s + `</svg>`, { size: 384 });
})();
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#14161d" stroke="#ff2fa0" stroke-width="5"/>
  <polygon points="50,18 82,34 82,66 50,82 18,66 18,34" fill="none" stroke="#27f2ff" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="9" fill="#ff2fa0"/>
  <path d="M50 41 L50 22 A28 28 0 0 1 74 36 Z" fill="#27f2ff"/>
  <path d="M41 55 L24 64 A28 28 0 0 1 24 36 Z" fill="#27f2ff" transform="rotate(120 50 50)"/>
  <path d="M41 55 L24 64 A28 28 0 0 1 24 36 Z" fill="#27f2ff" transform="rotate(240 50 50)"/>
  <circle cx="50" cy="50" r="4" fill="#14161d"/>
  </svg>`,
  { size: 256 },
);
const BADGE = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="56" rx="6" fill="#0d1017" stroke="#27f2ff" stroke-width="3"/>
  <path d="M10 14 L24 30 L10 46 M24 14 L38 30 L24 46" stroke="#ff2fa0" stroke-width="5" fill="none" stroke-linejoin="round"/>
  <text x="48" y="28" font-family="monospace" font-weight="bold" font-size="17" fill="#27f2ff">GUARD</text>
  <text x="48" y="48" font-family="monospace" font-weight="bold" font-size="16" fill="#f6c21c">CV-07</text>
  </svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="40" fill="#04141c"/>
  <rect x="2" y="2" width="76" height="36" fill="none" stroke="#27f2ff" stroke-width="1.5"/>
  <text x="8" y="16" font-family="monospace" font-weight="bold" font-size="9" fill="#ff2fa0">SEAL: OK</text>
  <text x="8" y="28" font-family="monospace" font-size="8" fill="#27f2ff">PD-0417 // 4.2t</text>
  <rect x="8" y="32" width="50" height="3" fill="#27f2ff"/><rect x="58" y="32" width="12" height="3" fill="#ff2fa0"/>
  </svg>`,
  { size: 256 },
);
const CARGOID = (() => {
  let bars = "";
  for (let i = 0; i < 26; i++) bars += `<rect x="${40 + i * 3}" y="6" width="${i % 3 === 0 ? 2 : 1}" height="18" fill="#111"/>`;
  return svg(
    `<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="30" rx="3" fill="#e9e6da"/>
    <rect x="3" y="3" width="30" height="24" fill="${YEL}"/><path d="M18 7 L30 25 L6 25Z" fill="#111"/><rect x="16.5" y="12" width="3" height="7" fill="${YEL}"/>${bars}
    <text x="40" y="29" font-family="monospace" font-size="5" fill="#111">SEALED // DO NOT OPEN</text></svg>`,
    { size: 256 },
  );
})();

export default function build() {
  const b = createBuilder({ name: "convoy-hauler", paintSize: 2048 });

  // ---------- helpers ----------
  type Rot = [number, number, number];
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: any, rot?: Rot) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], flat: true, ...(rot ? { rotation: rot } : {}) });
  const cylZ = (r: number, len: number, seg: number, x: number, y: number, z: number, color: any) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z], rotation: [90, 0, 0], flat: true });
  const cylX = (r: number, len: number, seg: number, x: number, y: number, z: number, color: any) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z], rotation: [0, 0, 90], flat: true });
  const cylY = (r0: number, r1: number, h: number, seg: number, x: number, y: number, z: number, color: any) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), color, { at: [x, y, z], flat: true });
  const ball = (r: number, x: number, y: number, z: number, color: any, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 10, 6), color, { at: [x, y, z], scale: sc, flat: true });
  const lamp = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, s = 1.6) =>
    glow(box(w, h, d, x, y, z, color), s);

  // ---------- chassis ----------
  box(2.4, 0.5, 9.0, 0, 1.05, -0.1, CHASSIS);
  box(2.0, 0.25, 9.2, 0, 0.78, -0.1, DARK);
  // axles + differentials
  for (const z of [2.9, -1.6, -3.0]) {
    cylX(0.11, 2.8, 8, 0, 0.65, z, DARK);
    ball(0.3, 0, 0.65, z, STEEL, [1, 0.9, 1]);
  }
  // wheels
  for (const s of [1, -1])
    for (const z of [2.9, -1.6, -3.0]) {
      const x = s * 1.35;
      cylX(0.65, 0.55, 12, x, 0.65, z, RUBBER);
      cylX(0.4, 0.58, 8, x, 0.65, z, STEEL);
      cylX(0.47, 0.5, 8, x, 0.65, z, "#232731");
      glow(cylX(0.2, 0.62, 8, x, 0.65, z, MAG), 1.4);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.64, 5), "#c8cdd8", {
          at: [x, 0.65 + Math.sin(a) * 0.3, z + Math.cos(a) * 0.3],
          rotation: [0, 0, 90],
          flat: true,
        });
      }
      // tread blocks
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.13;
        box(0.57, 0.1, 0.16, x, 0.65 + Math.sin(a) * 0.66, z + Math.cos(a) * 0.66, "#0c0d11", [(-a * 180) / Math.PI + 90 - 90, 0, 0]);
      }
      // mudguard
      box(0.95, 0.1, 1.6, x, 1.38, z, ARMOR);
      box(0.95, 0.12, 0.1, x, 1.3, z + 0.82, DARK, [-30, 0, 0]);
    }

  // ---------- cab ----------
  const cab = b.extrude(
    [
      [1.4, 1.5], [4.3, 1.5], [4.3, 2.4], [3.6, 2.5], [3.15, 3.45], [1.4, 3.45],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, bevel: 0.06, color: CAB, name: "cab" },
  );
  box(2.0, 0.35, 2.9, 0, 1.45, 2.85, ARMOR); // lower frame
  // windshield + cage
  const wsC = [0, 2.975, 3.375];
  const nrm = [0, 0.429, 0.903];
  box(2.2, 0.95, 0.04, wsC[0], wsC[1] + nrm[1] * 0.03, wsC[2] + nrm[2] * 0.03, GLASS, [-25, 0, 0]);
  glow(box(2.15, 0.06, 0.05, 0, 3.2, 3.27, CYAN, [-25, 0, 0]), 1.2);
  for (let i = -2; i <= 2; i++)
    box(0.05, 1.0, 0.05, i * 0.5, wsC[1] + nrm[1] * 0.11, wsC[2] + nrm[2] * 0.11, ARMOR, [-25, 0, 0]);
  box(2.4, 0.07, 0.07, 0, wsC[1] - 0.2, wsC[2] + 0.1, ARMOR, [-25, 0, 0]);
  // hood details
  for (const z of [3.8, 3.95, 4.1]) glow(box(1.2, 0.03, 0.07, 0, 2.43, z, MAG), 1.3);
  box(2.3, 0.14, 0.7, 0, 2.43, 3.25, ARMOR, [8, 0, 0]);
  // grille + headlights
  box(1.0, 0.7, 0.05, 0, 1.95, 4.31, "#08090c");
  for (let i = 0; i < 4; i++) glow(box(0.9, 0.04, 0.03, 0, 1.75 + i * 0.16, 4.34, CYAN), 1.0);
  for (const s of [1, -1]) {
    lamp(0.55, 0.22, 0.05, s * 0.95, 2.0, 4.31, CYAN, 2);
    box(0.65, 0.05, 0.08, s * 0.95, 2.16, 4.32, DARK);
    box(0.18, 0.5, 0.05, s * 1.2, 1.9, 4.32, YEL);
  }
  // bumper + ram teeth
  box(2.9, 0.5, 0.5, 0, 1.2, 4.45, ARMOR);
  b.part(new THREE.PlaneGeometry(2.6, 0.43), "#ffffff", { at: [0, 1.2, 4.705], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  for (let i = -2; i <= 2; i++)
    b.part(new THREE.ConeGeometry(0.15, 0.5, 4), STEEL, { at: [i * 0.55, 1.0, 4.9], rotation: [90, 45, 0], flat: true });
  box(2.9, 0.12, 0.6, 0, 1.52, 4.45, DARK);
  // roof
  box(2.7, 0.12, 1.85, 0, 3.5, 2.3, ARMOR);
  for (let i = -2; i <= 2; i++) box(0.12, 0.1, 1.85, i * 0.55, 3.58, 2.3, DARK);
  lamp(2.0, 0.12, 0.2, 0, 3.62, 3.1, CYAN, 1.8);
  lamp(0.3, 0.14, 0.22, 1.1, 3.62, 3.1, MAG, 1.8);
  lamp(0.3, 0.14, 0.22, -1.1, 3.62, 3.1, MAG, 1.8);
  // turret
  cylY(0.5, 0.45, 0.2, 10, 0, 3.66, 2.1, STEEL);
  box(0.8, 0.42, 0.9, 0, 3.95, 2.1, ARMOR);
  box(0.6, 0.12, 0.7, 0, 4.2, 2.05, DARK, [-8, 0, 0]);
  for (const s of [1, -1]) {
    cylZ(0.06, 1.5, 6, s * 0.2, 3.95, 3.0, "#2a2d36");
    cylZ(0.1, 0.25, 6, s * 0.2, 3.95, 3.7, STEEL);
    box(0.22, 0.3, 0.3, s * 0.52, 3.92, 2.0, "#3a3f4b");
    glow(box(0.04, 0.04, 0.2, s * 0.2, 3.95, 3.86, ORANGE), 1.5);
  }
  glow(box(0.3, 0.1, 0.04, 0, 4.0, 2.58, MAG), 2);
  // antennas, dish, lidar
  for (const s of [1, -1]) {
    cylY(0.02, 0.02, 1.7, 5, s * 1.18, 4.35, 1.55, STEEL);
    glow(ball(0.06, s * 1.18, 5.22, 1.55, s > 0 ? MAG : CYAN), 2);
  }
  b.lathe([[0, 0], [0.4, 0.02], [0.45, 0.1], [0.38, 0.12], [0, 0.07]], {
    at: [-0.7, 3.8, 1.8], axis: [0.3, 0.8, -0.5], segments: 9, color: STEEL, name: "dish",
  });
  cylY(0.03, 0.03, 0.4, 5, -0.7, 3.75, 1.8, DARK);
  cylY(0.28, 0.28, 0.1, 10, 0.75, 3.62, 1.7, DARK);
  ball(0.22, 0.75, 3.8, 1.7, "#1d2230", [1, 0.9, 1]);
  glow(cylY(0.235, 0.235, 0.05, 10, 0.75, 3.78, 1.7, CYAN), 1.6);
  // exhaust
  for (const s of [1, -1]) {
    cylY(0.11, 0.11, 2.3, 8, s * 1.2, 2.5, 1.2, "#2b2e38");
    cylY(0.14, 0.14, 0.18, 8, s * 1.2, 3.62, 1.2, STEEL);
    b.part(new THREE.ConeGeometry(0.12, 0.2, 8), DARK, { at: [s * 1.2, 3.8, 1.2], flat: true });
    glow(cylY(0.145, 0.145, 0.05, 8, s * 1.2, 3.45, 1.2, ORANGE), 1.5);
    box(0.08, 0.1, 0.2, s * 1.2, 1.9, 1.35, STEEL);
    box(0.08, 0.1, 0.2, s * 1.2, 3.0, 1.35, STEEL);
  }
  // doors, windows, badges, mirrors, steps
  for (const s of [1, -1]) {
    box(0.04, 0.72, 1.05, s * 1.31, 2.95, 2.4, GLASS);
    glow(box(0.045, 0.05, 1.05, s * 1.315, 3.33, 2.4, CYAN), 1.0);
    box(0.03, 1.5, 0.03, s * 1.31, 2.45, 1.75, "#05060a");
    box(0.03, 1.5, 0.03, s * 1.31, 2.45, 3.1, "#05060a");
    box(0.06, 0.06, 0.22, s * 1.32, 2.55, 2.9, STEEL);
    glow(b.decal(cab, BADGE, { at: [s * 1.3, 2.05, 2.5], dir: [s, 0, 0], size: [1.1, 0.55] }), 0.8);
    // armour shoulder plate
    box(0.14, 0.5, 1.4, s * 1.36, 2.2, 3.55, ARMOR, [0, 0, -s * 8]);
    // mirror
    box(0.5, 0.05, 0.05, s * 1.55, 3.0, 3.2, DARK);
    box(0.08, 0.45, 0.26, s * 1.8, 3.0, 3.2, ARMOR);
    glow(box(0.02, 0.1, 0.1, s * 1.85, 3.1, 3.2, CYAN), 1.6);
    // step
    box(0.4, 0.07, 0.8, s * 1.45, 1.35, 2.3, STEEL);
    // fuel tanks
    cylZ(0.33, 2.2, 8, s * 1.3, 0.95, 0.6, "#2e3340");
    for (const z of [-0.2, 0.6, 1.4]) box(0.7, 0.07, 0.12, s * 1.3, 0.95, z, DARK).scale.set(1, 1, 1);
    glow(box(0.05, 0.07, 0.4, s * 1.64, 1.0, 0.6, YEL), 1.0);
  }

  // ---------- flatbed ----------
  box(2.9, 0.2, 5.8, 0, 1.5, -1.6, ARMOR);
  box(2.9, 0.07, 5.8, 0, 1.38, -1.6, DARK);
  for (const s of [1, -1]) {
    box(0.12, 0.55, 5.8, s * 1.4, 1.9, -1.6, ARMOR);
    for (const z of [-4.2, -3.0, -1.8, -0.6, 0.6]) box(0.16, 0.6, 0.1, s * 1.4, 1.9, z, DARK);
    glow(box(0.05, 0.05, 5.8, s * 1.4, 2.2, -1.6, CYAN), 1.6);
    box(0.12, 0.9, 0.3, s * 1.4, 2.1, -4.45, ARMOR);
    // underglow
    glow(box(0.05, 0.06, 8.4, s * 1.22, 0.76, -0.1, MAG), 1.8);
    // rear floodlight posts
    cylY(0.04, 0.04, 1.4, 6, s * 1.35, 2.75, -4.4, STEEL);
    lamp(0.22, 0.16, 0.12, s * 1.35, 3.5, -4.42, CYAN, 2);
    box(0.28, 0.04, 0.2, s * 1.35, 3.6, -4.4, DARK);
    // taillights
    lamp(0.5, 0.18, 0.05, s * 1.0, 1.55, -4.56, MAG, 2);
  }
  // front bulkhead behind cab
  box(2.9, 1.6, 0.16, 0, 2.3, 1.2, ARMOR);
  glow(box(2.5, 0.05, 0.05, 0, 3.05, 1.13, MAG), 1.4);
  // rear bumper
  box(2.8, 0.4, 0.3, 0, 1.2, -4.65, ARMOR);
  b.part(new THREE.PlaneGeometry(2.4, 0.4), "#ffffff", { at: [0, 1.2, -4.805], dir: [0, 0, -1], axis: "z", texture: HAZARD });
  cylX(0.07, 0.4, 6, 0, 1.0, -4.85, STEEL);

  // ---------- cargo pod ----------
  const R = 1.1;
  const PY = 2.7;
  for (const z of [-3.4, -1.7, -0.1]) {
    box(2.3, 0.22, 0.5, 0, 1.7, z, DARK);
    box(0.25, 0.5, 0.5, 1.05, 1.85, z, ARMOR, [0, 0, -25]);
    box(0.25, 0.5, 0.5, -1.05, 1.85, z, ARMOR, [0, 0, 25]);
  }
  const pod = b.part(new THREE.CylinderGeometry(R, R, 4.6, 10), POD, {
    at: [0, PY, -1.7], rotation: [90, 0, 0], flat: true, name: "pod",
  });
  b.part(new THREE.SphereGeometry(R, 10, 6), POD, { at: [0, PY, 0.6], scale: [1, 1, 0.55], flat: true });
  cylZ(1.0, 0.2, 10, 0, PY, -4.05, "#2a2e38");
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cylZ(0.06, 0.06, 5, Math.sin(a) * 0.85, PY + Math.cos(a) * 0.85, -4.18, STEEL);
  }
  box(1.5, 0.9, 0.05, 0, PY, -4.14, "#05080c");
  glow(b.part(new THREE.PlaneGeometry(1.4, 0.7), "#ffffff", { at: [0, PY, -4.18], dir: [0, 0, -1], axis: "z", texture: SCREEN }), 1.2);
  // straps and neon rings
  for (const z of [-3.7, -2.5, -0.9, 0.3])
    b.part(new THREE.TorusGeometry(R + 0.02, 0.07, 4, 10), "#20232c", { at: [0, PY, z], flat: true });
  for (const z of [-3.1, -1.7, -0.3])
    glow(b.part(new THREE.TorusGeometry(R + 0.01, 0.03, 4, 10), MAG, { at: [0, PY, z], flat: true }), 1.8);
  // clamps joining straps to the cradle
  for (const s of [1, -1])
    for (const z of [-3.7, -2.5, -0.9, 0.3]) {
      box(0.2, 0.2, 0.22, s * 1.12, 2.05, z, STEEL);
      glow(box(0.04, 0.07, 0.07, s * 1.23, 2.05, z, YEL), 1.4);
    }
  // decals
  for (const s of [1, -1]) {
    glow(b.decal(pod, EMBLEM, { at: [s * R, PY, -1.2], dir: [s, 0, 0], size: [1.4, 1.4] }), 0.9);
    b.decal(pod, CARGOID, { at: [s * R, PY - 0.2, -3.0], dir: [s, 0, 0], size: [1.2, 0.3] });
    b.decal(pod, HAZARD, { at: [s * R, PY - 0.75, -2.0], dir: [s, 0, 0], size: [3.4, 0.28] });
  }
  // top hatch + status lights
  box(0.9, 0.07, 1.3, 0, PY + R - 0.02, -2.3, "#2a2e38");
  box(0.7, 0.05, 0.08, 0, PY + R + 0.03, -2.3, STEEL);
  for (let i = 0; i < 4; i++) lamp(0.12, 0.06, 0.12, -0.3 + i * 0.2, PY + R + 0.04, -1.6, i === 3 ? MAG : CYAN, 2);
  cylY(0.04, 0.04, 0.7, 5, 0.5, PY + R + 0.3, -3.2, STEEL);
  glow(ball(0.06, 0.5, PY + R + 0.68, -3.2, ORANGE), 2);

  // ---------- tow & detail ----------
  cylZ(0.04, 0.9, 5, 0.6, 1.0, 4.9, STEEL);
  box(2.0, 0.08, 3.4, 0, 0.55, -0.1, DARK);

  return b.root;
}
```