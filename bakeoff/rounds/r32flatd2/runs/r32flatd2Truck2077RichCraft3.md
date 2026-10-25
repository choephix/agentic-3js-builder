```ts
import * as THREE from "three";
import { createBuilder, paint, patches, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Cyber Hauler 2077",
  description:
    "Low-poly cyberpunk armoured six-wheel military truck: camo-plated cab with plough bumper, neon underglow, armoured container bed with twin-cannon turret and missile pods, sensor mast, and decals.",
};

// ---------- palette ----------
const DARK = "#14171c", GUN = "#252a32", PLATE = "#39404a", OLIVE = "#3f4a40";
const ORANGE = "#ff8a1c", MAG = "#ff2fd0", CYAN = "#26f0ff", RED = "#ff2a3a";
const YEL = "#ffd21a", WHITE = "#e9f4ff", RUBBER = "#101215", STEEL = "#6a7482", LUG = "#1b1e23";
const HOSE = "#0d0e11", BLACKGLASS = "#0a1018";

// ---------- paints ----------
const camo = patches("#2b3038", ["#2f353d", "#3d4650", "#36443f", "#2a2f3a"], { size: 0.6, gap: 0.03, seed: 4 });
const HULL = paint((p, n) => {
  const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
  const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
  const fu = (((u / 0.9) % 1) + 1) % 1;
  const fv = (((v / 0.6) % 1) + 1) % 1;
  if (fu * 0.9 < 0.012 || fv * 0.6 < 0.012) return "#0c0e12";
  if (p.y < 1.5 + 0.3 * noise(p, 0.5, 3)) return "#4b4337";
  return camo;
});
const ARMOR = paint((p, n) => {
  const m = noise(p, 0.3, 9);
  if (n.y > 0.6 && m > 0.6) return "#4a5560";
  return m > 0.5 ? "#2c323b" : "#343b45";
});
const STEELP = metal("steel", { tarnish: 0.4 });
const IRONP = metal("iron");

// ---------- textures ----------
let stripes = "";
for (let i = 0; i < 17; i++) stripes += `<polygon points="${i * 10},16 ${i * 10 + 5},16 ${i * 10 + 13},0 ${i * 10 + 8},0" fill="#111"/>`;
const HAZARD = svg(`<svg viewBox="0 0 128 16"><rect width="128" height="16" fill="${YEL}"/>${stripes}<rect width="128" height="16" fill="none" stroke="#111" stroke-width="2"/></svg>`, { size: 256 });
const EMBLEM = svg(`<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#11141a" stroke="${ORANGE}" stroke-width="5"/>
<path d="M22 40 L50 22 L78 40" stroke="${CYAN}" stroke-width="5" fill="none"/><path d="M22 54 L50 36 L78 54" stroke="${MAG}" stroke-width="5" fill="none"/>
<text x="50" y="82" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="${WHITE}">77</text></svg>`, { size: 256 });
const SIGN = svg(`<svg viewBox="0 0 256 64"><rect x="2" y="2" width="252" height="60" rx="8" fill="#0b0d14" stroke="${MAG}" stroke-width="4"/>
<text x="128" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="${CYAN}">NOVA//ARMS</text>
<text x="128" y="56" text-anchor="middle" font-family="monospace" font-size="14" fill="${MAG}">HEAVY LOGISTICS 2077</text></svg>`, { size: 512 });
const WINDSHIELD = svg(`<svg viewBox="0 0 256 128"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2f44"/><stop offset="1" stop-color="#050a12"/></linearGradient></defs>
<rect width="256" height="128" rx="10" fill="url(#g)" stroke="#05080c" stroke-width="6"/><polygon points="20,0 60,0 20,128 0,128" fill="#7fe8ff" opacity="0.18"/><polygon points="80,0 100,0 60,128 40,128" fill="#7fe8ff" opacity="0.1"/>
<path d="M60 100 A70 70 0 0 1 196 100" stroke="${CYAN}" stroke-width="3" fill="none"/><path d="M80 100 A50 50 0 0 1 176 100" stroke="#38ff9a" stroke-width="2" fill="none"/>
<line x1="128" y1="40" x2="128" y2="60" stroke="${CYAN}" stroke-width="2"/><rect x="170" y="18" width="50" height="8" fill="${ORANGE}" opacity="0.8"/><rect x="36" y="18" width="40" height="8" fill="#38ff9a" opacity="0.7"/></svg>`, { size: 256 });
const SIDEWIN = svg(`<svg viewBox="0 0 128 80"><polygon points="0,78 50,2 118,2 122,78" fill="${BLACKGLASS}" stroke="#05080c" stroke-width="5"/><polygon points="20,70 56,12 70,12 34,70" fill="#7fe8ff" opacity="0.2"/></svg>`, { size: 128 });
const DOOR = svg(`<svg viewBox="0 0 128 64"><text x="64" y="40" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="34" fill="${WHITE}">07-X</text>
<path d="M8 54 H120" stroke="${ORANGE}" stroke-width="4"/><path d="M8 8 H40 L48 16" stroke="${ORANGE}" stroke-width="4" fill="none"/></svg>`, { size: 256 });
const PLATE_TEX = svg(`<svg viewBox="0 0 96 32"><rect x="1" y="1" width="94" height="30" rx="4" fill="#e8e2c0" stroke="#111" stroke-width="2"/>
<text x="48" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#111">NX-2077</text></svg>`, { size: 192 });

// ---------- builder + helpers ----------
const b = createBuilder({ name: "cyber_hauler_2077" });
type V = [number, number, number];
const P = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(geo, color, { at, flat: true, ...o });
const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) => P(new THREE.BoxGeometry(w, h, d), color, at, o);
const cyl = (rt: number, rb: number, len: number, seg: number, color: any, at: V, dir: V, o: any = {}) =>
  P(new THREE.CylinderGeometry(rt, rb, len, seg), color, at, { dir, ...o });
const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, o: any = {}) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
const lamp = (w: number, h: number, d: number, color: string, at: V, s = 1.6) => glow(box(w, h, d, color, at), s);

const R = 0.62;
const AX = [2.4, -1.1, -2.4];

export default function build() {
  // ---------- chassis ----------
  for (const s of [1, -1]) box(0.22, 0.32, 6.8, GUN, [s * 0.75, 0.95, -0.1]);
  for (const z of [3.0, 1.6, 0.4, -0.8, -1.8, -3.0]) box(1.5, 0.2, 0.2, PLATE, [0, 0.95, z]);
  cyl(0.08, 0.08, 5.6, 8, IRONP, [0, 0.72, -0.2], [0, 0, 1]);
  for (const z of AX) {
    cyl(0.12, 0.12, 2.7, 8, GUN, [0, R, z], [1, 0, 0]);
    if (z < 0) P(new THREE.SphereGeometry(0.3, 8, 6), PLATE, [0, R, z], { scale: [1, 0.9, 1] });
  }
  // underglow
  for (const s of [1, -1]) {
    lamp(0.05, 0.05, 5.4, MAG, [s * 0.95, 0.68, -0.2], 1.8);
    lamp(0.05, 0.05, 1.0, CYAN, [s * 0.95, 0.68, 3.1], 1.8);
  }
  lamp(1.7, 0.04, 0.05, CYAN, [0, 0.55, 3.0], 1.8);

  // ---------- wheels ----------
  for (const z of AX)
    for (const s of [1, -1]) {
      const x = s * 1.3, y = R;
      cyl(R, R, 0.5, 12, RUBBER, [x, y, z], [1, 0, 0]);
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6;
        box(0.54, 0.1, 0.12, LUG, [x, y + Math.sin(a) * R, z + Math.cos(a) * R], { rotation: [90 - (a * 180) / Math.PI, 0, 0] });
      }
      cyl(0.36, 0.36, 0.56, 8, STEELP, [x, y, z], [1, 0, 0]);
      glow(P(new THREE.TorusGeometry(0.28, 0.025, 5, 16), CYAN, [x + s * 0.29, y, z], { dir: [1, 0, 0], axis: "z" }), 1.4);
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        cyl(0.025, 0.025, 0.08, 5, DARK, [x + s * 0.3, y + Math.sin(a) * 0.19, z + Math.cos(a) * 0.19], [1, 0, 0]);
      }
      cyl(0.12, 0.12, 0.64, 6, ORANGE, [x, y, z], [1, 0, 0]);
    }
  // fenders, skirts, mudflaps
  const fend = (z: number, len: number) => {
    for (const s of [1, -1]) {
      box(0.7, 0.08, len, ARMOR, [s * 1.3, 1.32, z]);
      box(0.08, 0.4, len, ARMOR, [s * 1.6, 1.1, z]);
      lamp(0.03, 0.04, len * 0.9, ORANGE, [s * 1.65, 1.0, z], 1.2);
    }
  };
  fend(2.4, 1.5);
  fend(-1.75, 2.9);
  for (const s of [1, -1]) box(0.5, 0.5, 0.04, RUBBER, [s * 1.3, 0.55, -3.12]);

  // fuel tanks
  for (const s of [1, -1]) {
    cyl(0.32, 0.32, 1.6, 8, OLIVE, [s * 1.0, 0.8, 0.45], [0, 0, 1]);
    for (const z of [-0.1, 1.0]) cyl(0.34, 0.34, 0.06, 8, DARK, [s * 1.0, 0.8, z], [0, 0, 1]);
  }

  // ---------- cab ----------
  const outline: [number, number][] = [[0, 1.15], [2.15, 1.15], [2.32, 1.6], [2.25, 1.95], [1.7, 2.15], [1.0, 3.0], [0.1, 3.05], [0, 2.9]];
  b.extrude(outline, { at: [0, 0, 1.2], x: [0, 0, 1], thickness: 2.1, bevel: 0.04, color: HULL });
  plane(1.85, 1.0, WINDSHIELD, [0, 2.585, 2.565], [0, 0.64, 0.77]);
  glow(plane(1.85, 1.0, WINDSHIELD, [0, 2.59, 2.57], [0, 0.64, 0.77]), 0.5);
  for (const s of [1, -1]) {
    plane(1.2, 0.8, SIDEWIN, [s * 1.07, 2.58, 2.0], [s, 0, 0]);
    plane(0.8, 0.4, DOOR, [s * 1.07, 1.75, 1.7], [s, 0, 0]);
    box(0.08, 0.08, 0.3, STEEL, [s * 1.09, 2.2, 2.45]);
    box(0.08, 0.5, 1.7, ARMOR, [s * 1.09, 1.55, 1.95]);
    box(0.04, 0.04, 2.1, ORANGE, [s * 1.12, 1.3, 2.2]);
    box(0.3, 0.05, 0.5, GUN, [s * 1.2, 1.0, 1.9]);
    // mirrors
    cyl(0.02, 0.02, 0.3, 5, GUN, [s * 1.2, 2.5, 2.7], [s, 0, 0]);
    box(0.08, 0.4, 0.22, DARK, [s * 1.38, 2.5, 2.7]);
    lamp(0.02, 0.3, 0.1, CYAN, [s * 1.43, 2.5, 2.7], 1.2);
    // headlights, fog lights
    lamp(0.45, 0.14, 0.06, WHITE, [s * 0.8, 1.78, 3.57], 2.2);
    lamp(0.2, 0.1, 0.06, YEL, [s * 0.9, 1.32, 3.52], 1.6);
    // roof ribs
    box(0.08, 0.1, 1.9, PLATE, [s * 0.85, 3.08, 0.8 + 1.0]);
    // exhausts
    cyl(0.09, 0.09, 1.6, 8, IRONP, [s * 0.9, 2.3, 0.9], [0, 1, 0]);
    box(0.28, 0.8, 0.03, PLATE, [s * 0.9, 2.0, 0.76]);
    lamp(0.14, 0.06, 0.14, ORANGE, [s * 0.9, 3.12, 0.9], 2);
    // hoses
    b.sweep([[s * 0.8, 1.6, 1.15], [s * 0.85, 1.4, 0.95], [s * 0.85, 1.55, 0.6]], 0.035, { color: HOSE, sides: 6 });
  }
  // hood plates
  box(1.6, 0.06, 0.8, ARMOR, [0, 2.1, 3.15], { rotation: [20, 0, 0] });
  for (let k = 0; k < 5; k++) box(1.2, 0.03, 0.04, DARK, [0, 2.15 - 0.0, 3.0 + k * 0.1 - 0.1], { rotation: [20, 0, 0] });
  // nose, grille
  box(1.8, 0.7, 0.08, GUN, [0, 1.45, 3.5]);
  for (let k = 0; k < 5; k++) lamp(1.5, 0.04, 0.03, RED, [0, 1.2 + k * 0.12, 3.56], 1.8);
  lamp(2.0, 0.04, 0.04, CYAN, [0, 1.12, 3.52], 1.8);
  // bumper and plough
  box(2.5, 0.5, 0.45, GUN, [0, 0.8, 3.45]);
  b.extrude(
    [[-1.3, 0.55], [-1.0, 0.55], [-0.85, 0.28], [-0.7, 0.55], [-0.15, 0.55], [0, 0.28], [0.15, 0.55], [0.7, 0.55], [0.85, 0.28], [1.0, 0.55], [1.3, 0.55], [1.3, 1.0], [0.9, 1.1], [-0.9, 1.1], [-1.3, 1.0]],
    { at: [0, 0, 3.55], x: [1, 0, 0], thickness: 0.35, bevel: 0.03, color: ARMOR },
  );
  lamp(1.2, 0.03, 0.03, ORANGE, [0, 0.95, 3.74], 1.4);
  for (const s of [1, -1]) b.spike([s * 1.25, 1.0, 3.7], [0, 0, 1], 0.4, 0.08, { color: STEEL });
  // roof gear
  box(1.7, 0.1, 0.18, DARK, [0, 3.13, 2.0]);
  for (let k = 0; k < 6; k++) lamp(0.25, 0.06, 0.03, k % 2 ? CYAN : RED, [-0.7 + k * 0.28, 3.14, 2.11], 2);
  cyl(0.03, 0.03, 0.5, 6, GUN, [-0.55, 3.3, 1.6], [0, 1, 0]);
  cyl(0.4, 0.05, 0.12, 10, STEEL, [-0.55, 3.62, 1.7], [0, 0.6, 0.8]);
  cyl(0.015, 0.015, 0.4, 5, GUN, [-0.55, 3.75, 1.9], [0, 0.6, 0.8]);
  P(new THREE.SphereGeometry(0.25, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), PLATE, [0.6, 3.05, 1.5]);
  glow(P(new THREE.SphereGeometry(0.06, 5, 4), CYAN, [0.6, 3.3, 1.5]), 2);
  for (const [x, z, h] of [[0.9, 1.4, 1.2], [-0.95, 1.35, 0.9]] as [number, number, number][]) {
    b.rod([x, 3.05, z], [x, 3.05 + h, z], 0.015, GUN);
    glow(P(new THREE.SphereGeometry(0.035, 5, 4), RED, [x, 3.07 + h, z]), 2.5);
  }

  // ---------- container ----------
  box(2.3, 1.4, 3.9, HULL, [0, 2.2, -1.35]);
  box(2.2, 0.08, 3.8, PLATE, [0, 2.94, -1.35]);
  box(2.3, 0.1, 0.1, GUN, [0, 2.9, 0.62]);
  for (const s of [1, -1]) {
    box(0.1, 0.1, 3.9, ARMOR, [s * 1.17, 1.55, -1.35]);
    box(0.1, 0.1, 3.9, ARMOR, [s * 1.17, 2.85, -1.35]);
    plane(3.2, 0.4, HAZARD, [s * 1.162, 1.8, -1.6], [s, 0, 0]);
    lamp(0.03, 0.04, 3.0, MAG, [s * 1.17, 2.08, -1.6], 1.8);
    glow(plane(1.7, 0.43, SIGN, [s * 1.164, 2.5, -0.9], [s, 0, 0]), 1.5);
    glow(plane(0.6, 0.6, EMBLEM, [s * 1.164, 2.5, -2.45], [s, 0, 0]), 0.9);
    // antennas
    b.rod([s * 1.0, 2.95, -3.1], [s * 1.0, 4.0, -3.1], 0.015, GUN);
    glow(P(new THREE.SphereGeometry(0.04, 5, 4), RED, [s * 1.0, 4.03, -3.1]), 2.5);
    // tail lights
    lamp(0.5, 0.14, 0.04, RED, [s * 0.8, 1.9, -3.34], 2);
    lamp(0.12, 0.5, 0.04, ORANGE, [s * 1.05, 2.3, -3.34], 1.6);
    // gun-ports along flank
    for (let k = 0; k < 3; k++) box(0.04, 0.12, 0.3, DARK, [s * 1.16, 1.7, -2.9 + k * 0.0 + 0.0 + (k - 1) * 0.0]);
  }
  // top hatches, vents
  for (const z of [-2.4, -3.0]) box(0.8, 0.1, 0.4, GUN, [0.55, 3.03, z]);
  for (let k = 0; k < 6; k++) box(0.8, 0.12, 0.04, DARK, [-0.6, 3.05, -2.0 - k * 0.12]);
  for (let k = 0; k < 8; k++) box(0.04, 0.2, 0.3, PLATE, [-1.0 + k * 0.28, 3.1, -3.15]);
  // rear
  box(2.2, 1.3, 0.04, GUN, [0, 2.2, -3.32]);
  box(0.04, 1.3, 0.06, DARK, [0, 2.2, -3.35]);
  for (const s of [1, -1]) box(0.08, 0.3, 0.06, STEEL, [s * 0.15, 2.2, -3.36]);
  box(2.4, 0.35, 0.3, GUN, [0, 1.0, -3.5]);
  plane(0.5, 0.17, PLATE_TEX, [0, 1.0, -3.66], [0, 0, -1]);
  cyl(0.06, 0.06, 0.4, 6, STEEL, [0, 0.85, -3.7], [0, 0, 1]);

  // ---------- turret ----------
  cyl(0.6, 0.6, 0.12, 12, IRONP, [0, 3.06, -0.55], [0, 1, 0]);
  box(1.0, 0.45, 1.2, HULL, [0, 3.38, -0.55]);
  box(0.9, 0.35, 0.3, GUN, [0, 3.4, 0.1]);
  P(new THREE.SphereGeometry(0.17, 8, 6), ARMOR, [0, 3.75, -0.7]);
  lamp(0.14, 0.05, 0.05, RED, [0, 3.76, -0.54], 3);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 1.9, 8, STEELP, [s * 0.28, 3.4, 0.95], [0, 0, 1]);
    cyl(0.11, 0.11, 0.9, 8, GUN, [s * 0.28, 3.4, 0.55], [0, 0, 1]);
    box(0.2, 0.2, 0.3, DARK, [s * 0.28, 3.4, 1.95]);
    // missile pod
    box(0.55, 0.55, 0.9, GUN, [s * 0.9, 3.4, -0.5]);
    box(0.4, 0.2, 0.4, PLATE, [s * 0.65, 3.3, -0.5]);
    box(0.5, 0.5, 0.03, DARK, [s * 0.9, 3.4, -0.04]);
    for (const dx of [-0.13, 0.13])
      for (const dy of [-0.13, 0.13]) cyl(0, 0.09, 0.22, 8, RED, [s * 0.9 + dx, 3.4 + dy, 0.06], [0, 0, 1]);
    lamp(0.5, 0.03, 0.03, ORANGE, [s * 0.9, 3.7, -0.5], 1.4);
  }
  box(0.4, 0.3, 0.3, OLIVE, [0, 3.2, -1.3]);
  box(0.03, 0.03, 0.03, WHITE, [0, 0, 0]); // origin marker kept tiny and inside chassis
  return b.root;
}
```