import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, mottle, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Wraith-77 Armored Hauler",
  description:
    "Six-wheeled militarized cyberpunk truck from 2077: armored cab with HUD windshield, plow bumper, neon-ringed wheels, rail-gun turret, missile pods, radar and a stencilled, panelled cargo container.",
};

type V = [number, number, number];
const DEG = 180 / Math.PI;

// ---------------------------------------------------------------- palette
const BLACK = "#0d0f14";
const DARK = "#1b2028";
const DARK2 = "#262d38";
const RUBBER = "#16181d";
const SIDEWALL = "#0f1115";
const CYAN = "#19f5ff";
const MAG = "#ff2bd6";
const AMBER = "#ffae1a";
const RED = "#ff2a3a";
const WHITE = "#f2f0e6";
const YEL = "#ffd51a";
const GREEN = "#39ff88";
const ORANGE = "#ff6a1a";
const STRAP = "#3a3f2a";
const STEEL = metal("steel");
const GILT = metal("gilt");
const IRON = metal("iron");
const BLUED = metal("blued");
const TIRE = mottle("#14161b", "#24272f", { size: 0.2, seed: 5 });

// ---------------------------------------------------------------- paints
const hullPaint = (lo: string, hi: string, seed: number, stripe = false) =>
  paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const cu = 0.85, cv = 0.6;
    const iu = Math.floor(u / cu), iv = Math.floor(v / cv);
    const du = u - iu * cu, dv = v - iv * cv;
    const du2 = Math.min(du, cu - du), dv2 = Math.min(dv, cv - dv);
    const id = Math.abs(Math.sin(iu * 12.9898 + iv * 78.233 + seed) * 43758.5453) % 1;
    let c = mix(lo, hi, 0.25 * id + 0.55 * noise(p, 0.9, seed));
    c = mix(c, hi, smoothstep(0.4, 1, n.y) * 0.3);
    if (stripe && n.y > 0.4 && Math.abs(p.x) > 0.5 && Math.abs(p.x) < 0.66) c = mix(c, "#c4177f", 0.9);
    c = mix(c, "#3b3228", smoothstep(1.4, 0.5, p.y) * smoothstep(0.35, 0.75, noise(p, 0.3, seed + 4)) * 0.8);
    c = mix(c, "#0c0e12", smoothstep(0.66, 0.8, noise(p, 0.12, seed + 8)) * 0.35);
    if (du2 < 0.013 || dv2 < 0.013) return mix(c, "#07090c", 0.9);
    if (du2 < 0.03 || dv2 < 0.03) c = mix(c, "#9fb4cc", 0.12);
    if (Math.hypot(du2 - 0.05, dv2 - 0.05) < 0.013) c = mix(c, "#c9d6e4", 0.7);
    return c;
  });
const CAB = hullPaint("#33404e", "#5a6c82", 3, true);
const CARGO = hullPaint("#343f3b", "#566b60", 11);
const ARMOR = hullPaint("#1a1f27", "#323b48", 21);

// ---------------------------------------------------------------- textures
const hazardStripes = () => {
  let s = "";
  for (let i = -1; i < 7; i++)
    s += `<polygon points="${i * 20},20 ${i * 20 + 10},20 ${i * 20 + 20},0 ${i * 20 + 10},0" fill="#111"/>`;
  return svg(`<svg viewBox="0 0 120 20"><rect width="120" height="20" fill="#ffd51a"/>${s}</svg>`, { size: 256 });
};
const HAZARD = hazardStripes();

const WIND = svg(
  `<svg viewBox="0 0 200 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b4455"/><stop offset="1" stop-color="#061a26"/></linearGradient></defs>
  <rect width="200" height="100" fill="url(#g)"/>
  <polygon points="10,0 60,0 30,100 -20,100" fill="#ffffff" opacity="0.09"/>
  <polygon points="90,0 105,0 75,100 60,100" fill="#ffffff" opacity="0.07"/>
  <g stroke="#19f5ff" stroke-width="1.2" fill="none" opacity="0.9">
   <circle cx="100" cy="48" r="14"/><path d="M100 28v10M100 58v10M80 48h10M110 48h10"/>
   <path d="M10 12h30l6 6M190 12h-30l-6 6M10 90h30M190 90h-30"/>
   <path d="M20 40h28M20 46h20M20 52h28" stroke="#ff2bd6"/>
  </g>
  <g fill="#19f5ff" font-family="monospace" font-size="7"><text x="14" y="26">SPD 084 KPH</text><text x="140" y="26">HEAT 61%</text><text x="140" y="84">LINK:NOVA-7</text></g>
  <rect x="150" y="40" width="6" height="30" fill="#39ff88" opacity="0.8"/><rect x="160" y="50" width="6" height="20" fill="#39ff88" opacity="0.8"/><rect x="170" y="35" width="6" height="35" fill="#ffae1a" opacity="0.8"/>
  <path d="M0 70 L50 62 L100 66 L150 60 L200 68" stroke="#ff2bd6" stroke-width="1.2" fill="none" opacity="0.6"/>
 </svg>`,
  { size: 512 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 100 65"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#103a4a"/><stop offset="1" stop-color="#050f16"/></linearGradient></defs>
  <rect width="100" height="65" fill="url(#g)"/><polygon points="10,0 30,0 10,65 -10,65" fill="#fff" opacity="0.12"/><polygon points="40,0 48,0 28,65 20,65" fill="#fff" opacity="0.08"/>
  <rect x="2" y="2" width="96" height="61" fill="none" stroke="#19f5ff" stroke-width="1" opacity="0.5"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="94" fill="#10141b" stroke="#ffae1a" stroke-width="6"/>
  <circle cx="100" cy="100" r="82" fill="none" stroke="#19f5ff" stroke-width="2.5" stroke-dasharray="8 5"/>
  <polygon points="100,28 162,64 162,136 100,172 38,136 38,64" fill="#1d2430" stroke="#ff2bd6" stroke-width="4"/>
  <path d="M38 112 L100 74 L162 112 L162 128 L100 92 L38 128Z" fill="#19f5ff"/>
  <path d="M38 138 L100 100 L162 138 L162 148 L100 112 L38 148Z" fill="#ffae1a"/>
  <path d="M100 34 L118 62 L100 56 L82 62Z" fill="#ffae1a"/>
  <text x="100" y="92" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="40" fill="#f2f0e6" stroke="#10141b" stroke-width="2">77</text>
  <text x="100" y="188" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="15" letter-spacing="3" fill="#ffae1a">NOVA-ARMS</text>
 </svg>`,
  { size: 512 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 240 80"><g font-family="monospace" font-weight="bold" paint-order="stroke" stroke="#0a0c10" stroke-width="5" fill="#e8e4d0">
  <text x="6" y="40" font-size="38">TRK-2077</text><text x="8" y="72" font-size="24" fill="#ffae1a">UNIT 07 / HVY</text></g></svg>`,
  { size: 512 },
);
const WARN = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,6 96,90 4,90" fill="#ffd51a" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
  <path d="M56 28 L38 58 H50 L44 78 L64 46 H52Z" fill="#111"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 200 130"><rect width="200" height="130" fill="#03120f"/>
  <g stroke="#0f5a4a" stroke-width="0.6">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 25} 0V130"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 26}H200"/>`).join("")}</g>
  <path d="M0 80 L25 70 L40 90 L60 50 L85 95 L110 40 L135 85 L160 60 L200 75" stroke="#39ff88" stroke-width="2.4" fill="none"/>
  <circle cx="150" cy="40" r="28" fill="none" stroke="#19f5ff" stroke-width="1.5"/><path d="M150 40 L172 28" stroke="#19f5ff" stroke-width="1.5"/>
  <circle cx="160" cy="48" r="3" fill="#ff2a3a"/>
  <text x="8" y="16" font-family="monospace" font-size="11" fill="#39ff88">LINK OK // ARMED</text>
  <text x="8" y="122" font-family="monospace" font-size="9" fill="#ffae1a">AMMO 0412  CORE 98%</text></svg>`,
  { size: 384 },
);
const PLATE = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" rx="5" fill="#eceadc" stroke="#222" stroke-width="3"/><rect x="4" y="4" width="92" height="9" fill="#19a7c8"/>
  <text x="50" y="40" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#16181d">N77-2077</text></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- builder & helpers
const b = createBuilder({ name: "truck2077", paintSize: 2048 });

const P = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(geo, color, { at, ...o });
const box = (w: number, h: number, d: number, color: any, at: V, rot?: V, o: any = {}) =>
  P(new THREE.BoxGeometry(w, h, d), color, at, rot ? { rotation: rot, ...o } : o);
const cyl = (r: number, h: number, seg: number, color: any, at: V, dir: V = [0, 1, 0], o: any = {}) =>
  P(new THREE.CylinderGeometry(r, r, h, seg), color, at, { dir, flat: true, ...o });
const cone = (r: number, h: number, seg: number, color: any, at: V, dir: V = [0, 1, 0]) =>
  P(new THREE.ConeGeometry(r, h, seg), color, at, { dir, flat: true });
const card = (tex: any, w: number, h: number, at: V, dir: V, o: any = {}) =>
  P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, ...o });
const lit = (part: any, k = 1.3) => glow(part, k);
const bolts = (pts: V[], dir: V = [0, 1, 0], r = 0.022) =>
  pts.forEach((p) => cyl(r, 0.03, 6, STEEL, p, dir));

// ---------------------------------------------------------------- wheels
function wheel(x: number, z: number, neon: string) {
  const s = Math.sign(x), R = 0.74;
  cyl(0.7, 0.5, 16, TIRE, [x, R, z], [1, 0, 0]);
  cyl(0.64, 0.56, 16, SIDEWALL, [x, R, z], [1, 0, 0]);
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 12; i++) {
      const a = ((i + row * 0.5) / 12) * Math.PI * 2;
      box(0.24, 0.13, 0.22, RUBBER, [x + (row ? 0.14 : -0.14), R + Math.cos(a) * 0.7, z + Math.sin(a) * 0.7], [a * DEG, 0, 0]);
    }
  cyl(0.44, 0.58, 12, BLUED, [x, R, z], [1, 0, 0]);
  const xf = x + s * 0.295;
  lit(P(new THREE.RingGeometry(0.36, 0.43, 16), neon, [xf, R, z], { dir: [s, 0, 0], axis: "z" }), 1.7);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    box(0.045, 0.3, 0.07, DARK2, [xf + s * 0.01, R + Math.cos(a) * 0.23, z + Math.sin(a) * 0.23], [a * DEG, 0, 0]);
    const a2 = a + Math.PI / 6;
    cyl(0.026, 0.045, 6, STEEL, [xf + s * 0.02, R + Math.cos(a2) * 0.3, z + Math.sin(a2) * 0.3], [1, 0, 0]);
  }
  cyl(0.17, 0.1, 8, GILT, [xf + s * 0.03, R, z], [1, 0, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cyl(0.025, 0.04, 6, STEEL, [xf + s * 0.09, R + Math.cos(a) * 0.1, z + Math.sin(a) * 0.1], [1, 0, 0]);
  }
  lit(cyl(0.05, 0.03, 8, neon, [xf + s * 0.09, R, z], [1, 0, 0]), 1.8);
  cyl(0.012, 0.07, 5, STEEL, [xf, R + 0.0, z + 0.395], [1, 0, 0]); // valve
  // mud flap
  box(0.55, 0.45, 0.04, DARK, [x, 0.72, z - 0.86]);
  box(0.4, 0.05, 0.045, YEL, [x, 0.5, z - 0.86]);
}
const WHEELS: [number, number][] = [[2.5, 0], [-1.2, 1], [-2.7, 1]];
for (const s of [1, -1])
  WHEELS.forEach(([z, rear]) => wheel(s * 1.4, z, rear ? MAG : CYAN));

// axles, diffs, shocks
WHEELS.forEach(([z]) => {
  cyl(0.1, 2.8, 8, IRON, [0, 0.74, z], [1, 0, 0]);
  P(new THREE.SphereGeometry(0.28, 8, 6), IRON, [0, 0.74, z]);
  box(0.5, 0.1, 0.5, DARK2, [0, 1.0, z]);
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 0.8, z], [s * 0.8, 1.2, z + 0.12], 0.05, STEEL);
    cyl(0.07, 0.3, 8, ORANGE, [s * 0.8, 0.95, z + 0.05]);
    box(1.0, 0.07, 0.2, IRON, [s * 0.75, 0.95, z]);
  }
});
// chassis
for (const s of [1, -1]) {
  box(0.28, 0.36, 8.0, DARK2, [s * 0.7, 1.17, -0.1]);
  box(0.08, 0.3, 7.9, IRON, [s * 0.86, 1.17, -0.1]);
}
for (let z = -3.6; z <= 3.4; z += 0.9) box(1.4, 0.14, 0.2, DARK2, [0, 1.12, z]);
cyl(0.07, 5.5, 8, STEEL, [0, 0.95, -0.6], [0, 0, 1]);
cyl(0.1, 1.2, 8, IRON, [0, 1.0, 1.4], [0, 0, 1]);

// fuel tanks (between axles)
for (const s of [1, -1]) {
  cyl(0.32, 1.7, 10, IRON, [s * 1.15, 0.9, 0.5], [0, 0, 1]);
  for (const z of [-0.2, 0.5, 1.2]) cyl(0.335, 0.07, 10, STRAP, [s * 1.15, 0.9, z], [0, 0, 1]);
  lit(cyl(0.325, 0.05, 10, ORANGE, [s * 1.15, 0.9, 0.85], [0, 0, 1]), 1.2);
  cyl(0.1, 0.09, 8, STEEL, [s * 1.15, 1.2, 0.5]);
  box(0.12, 0.2, 0.5, DARK, [s * 1.0, 0.9, 0.5]);
  card(WARN, 0.2, 0.2, [s * 1.48, 0.92, 0.1], [s, 0, 0]);
}

// ---------------------------------------------------------------- fenders
const fender = (x: number, zc: number, len: number) => {
  const s = Math.sign(x);
  box(0.66, 0.08, len, ARMOR, [x, 1.62, zc]);
  box(0.66, 0.08, 0.5, ARMOR, [x, 1.52, zc + len / 2 + 0.08], [-35, 0, 0]);
  box(0.66, 0.08, 0.5, ARMOR, [x, 1.52, zc - len / 2 - 0.08], [35, 0, 0]);
  box(0.06, 0.24, len + 0.5, ARMOR, [x + s * 0.34, 1.52, zc]);
  lit(box(0.025, 0.04, len + 0.4, CYAN, [x + s * 0.375, 1.64, zc]), 1.3);
  for (let i = 0; i < 5; i++) bolts([[x, 1.67, zc - len / 2 + 0.15 + (i * (len - 0.3)) / 4]]);
};
for (const s of [1, -1]) {
  fender(s * 1.4, 2.5, 1.2);
  fender(s * 1.4, -1.95, 2.8);
}

// ---------------------------------------------------------------- cab
const cabOutline: [number, number][] = [
  [1.5, 1.0], [3.8, 1.0], [3.8, 1.75], [3.55, 2.0], [2.8, 2.1], [2.25, 2.85], [1.5, 2.85],
];
b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.1, bevel: 0.05, color: CAB });
// windshield
lit(card(WIND, 1.9, 0.93, [0, 2.49, 2.54], [0, 0.807, 0.59]), 0.7);
for (const s of [1, -1]) {
  box(0.1, 0.97, 0.09, ARMOR, [s * 1.0, 2.49, 2.54], [-54, 0, 0]);
  lit(card(SIDEWIN, 0.85, 0.55, [s * 1.058, 2.3, 2.0], [s, 0, 0]), 0.5);
  // door
  box(0.02, 1.4, 0.03, BLACK, [s * 1.055, 1.75, 2.52]);
  box(0.02, 1.8, 0.03, BLACK, [s * 1.055, 1.95, 1.62]);
  box(0.02, 0.03, 0.9, BLACK, [s * 1.055, 1.07, 2.07]);
  box(0.03, 0.04, 0.2, STEEL, [s * 1.07, 1.95, 2.35]);
  box(0.05, 0.45, 0.85, ARMOR, [s * 1.07, 1.4, 2.07]);
  bolts([[s * 1.1, 1.58, 1.75], [s * 1.1, 1.58, 2.4], [s * 1.1, 1.22, 1.75], [s * 1.1, 1.22, 2.4]], [s, 0, 0]);
  card(EMBLEM, 0.34, 0.34, [s * 1.062, 1.58 + 0.0, 2.07], [s, 0, 0]);
  // mirror
  box(0.4, 0.05, 0.05, DARK, [s * 1.2, 2.3, 2.62], [0, 0, 0]);
  box(0.08, 0.42, 0.26, ARMOR, [s * 1.4, 2.3, 2.62]);
  lit(box(0.02, 0.3, 0.18, CYAN, [s * 1.44, 2.3, 2.62]), 0.9);
  // A-pillar armour & visor
  box(0.14, 0.5, 0.5, ARMOR, [s * 1.0, 2.15, 3.0], [-8, 0, 0]);
  // front corner cameras
  cyl(0.05, 0.1, 8, BLACK, [s * 1.05, 1.9, 3.7], [s, 0, 0]);
  lit(cyl(0.03, 0.03, 8, RED, [s * 1.1, 1.9, 3.7], [s, 0, 0]), 1.6);
  // side-step / vent on side behind door
  for (let i = 0; i < 4; i++) box(0.03, 0.04, 0.4, BLACK, [s * 1.055, 2.0 - i * 0.1 - 0.0, 1.62 + 0.0 - 0.0].map((v, k) => (k === 2 ? 1.78 : v)) as V);
}
box(2.2, 0.06, 0.4, ARMOR, [0, 2.92, 2.15], [-8, 0, 0]); // visor
box(2.2, 0.08, 1.2, ARMOR, [0, 2.89, 1.95]); // roof plate
// hood
const hy = (z: number) => 2.0 + (3.55 - z) * 0.1333;
for (let i = 0; i < 5; i++) for (const s of [1, -1]) box(0.7, 0.03, 0.06, BLACK, [s * 0.55, hy(3.4 - i * 0.12) + 0.02, 3.4 - i * 0.12]);
lit(box(0.06, 0.03, 0.75, MAG, [0, 2.06, 3.1], [-4, 0, 0]), 1.3);
box(0.4, 0.1, 0.5, ARMOR, [0, 2.12, 3.45], [-4, 0, 0]);
bolts([[-0.15, 2.18, 3.45], [0.15, 2.18, 3.45]]);
// front fascia
box(1.5, 0.36, 0.06, BLACK, [0, 1.2, 3.82]);
for (let i = -3; i <= 3; i++) lit(box(0.04, 0.28, 0.02, i % 2 ? CYAN : MAG, [i * 0.2, 1.2, 3.86]), 1.2);
for (const s of [1, -1]) {
  box(0.5, 0.18, 0.08, ARMOR, [s * 0.72, 1.62, 3.82]);
  lit(box(0.42, 0.1, 0.05, "#fff2c0", [s * 0.72, 1.62, 3.86]), 1.9);
  lit(box(0.4, 0.04, 0.05, CYAN, [s * 0.72, 1.47, 3.84]), 1.5);
  box(0.08, 0.7, 0.08, ARMOR, [s * 1.0, 1.4, 3.92]);
  box(0.16, 0.12, 0.12, STEEL, [s * 0.9, 0.85, 4.15]);
}
box(2.1, 0.07, 0.08, ARMOR, [0, 1.78, 3.92]);
// bumper, plow, winch
box(2.7, 0.4, 0.36, ARMOR, [0, 0.88, 3.95]);
card(HAZARD, 2.6, 0.2, [0, 0.88, 4.135], [0, 0, 1]);
b.extrude([[0, 0], [0.5, 0.05], [0.5, 0.25], [0, 0.45]], { at: [0, 0.3, 4.05], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, bevel: 0.02, color: ARMOR });
for (let i = -3; i <= 3; i++) b.spike([i * 0.38, 0.45, 4.5], [0, 0, 1], 0.3, 0.07, { color: STEEL, sides: 6 });
cyl(0.12, 0.7, 8, IRON, [0, 1.17, 3.95], [1, 0, 0]);
lit(cyl(0.13, 0.04, 8, ORANGE, [0.0, 1.17, 3.95], [1, 0, 0]), 1.2);
// roof gear
for (let i = 0; i < 6; i++) lit(box(0.3, 0.07, 0.14, i % 2 ? CYAN : MAG, [-0.75 + i * 0.3, 3.0, 2.2]), 1.6);
box(1.9, 0.07, 0.2, BLACK, [0, 2.96, 2.2]);
for (const s of [1, -1]) {
  cyl(0.02, 1.5, 5, STEEL, [s * 1.0, 3.65, 1.6]);
  P(new THREE.SphereGeometry(0.04, 5, 4), RED, [s * 1.0, 4.42, 1.6]);
}
cyl(0.2, 0.1, 10, DARK2, [0.5, 2.98, 1.85]);
cyl(0.12, 0.28, 8, BLACK, [0.5, 3.17, 1.85]);
lit(cyl(0.125, 0.04, 8, CYAN, [0.5, 3.2, 1.85]), 1.6);
cyl(0.3, 0.05, 10, STEEL, [-0.45, 2.94, 1.9]);
lit(cyl(0.25, 0.02, 10, GREEN, [-0.45, 2.96, 1.9]), 0.8);
// dish
cyl(0.03, 0.4, 6, IRON, [-0.9, 3.1, 1.75]);
b.lathe([[0, 0], [0.1, 0.01], [0.22, 0.05], [0.3, 0.12], [0.29, 0.13], [0.21, 0.06], [0.1, 0.03], [0, 0.02]], {
  at: [-0.9, 3.3, 1.75], axis: [0, 0.7, 0.7], segments: 10, color: STEEL,
});
b.spike([-0.9, 3.36, 1.82], [0, 0.7, 0.7], 0.3, 0.012, { color: AMBER });

// ---------------------------------------------------------------- cargo container
box(2.5, 1.45, 5.25, CARGO, [0, 2.275, -1.275]);
box(2.56, 0.12, 5.3, ARMOR, [0, 1.6, -1.275]);
box(2.3, 0.05, 5.0, ARMOR, [0, 3.0, -1.275]);
for (const s of [1, -1]) {
  for (const z of [-3.78, -2.12, -0.38, 1.3]) {
    box(0.07, 1.35, 0.14, ARMOR, [s * 1.275, 2.3, z]);
    bolts([[s * 1.32, 1.8, z], [s * 1.32, 2.3, z], [s * 1.32, 2.8, z]], [s, 0, 0]);
  }
  lit(box(0.04, 0.05, 5.0, CYAN, [s * 1.27, 1.76, -1.3]), 1.4);
  lit(box(0.04, 0.04, 5.0, MAG, [s * 1.27, 2.92, -1.3]), 1.4);
  lit(box(0.03, 0.05, 5.2, MAG, [s * 1.287, 1.575, -1.3]), 1.2);
  card(EMBLEM, 1.35, 1.35, [s * 1.255, 2.3, -1.25], [s, 0, 0]);
  card(STENCIL, 1.2, 0.4, [s * 1.255, 2.6, -2.95], [s, 0, 0]);
  card(WARN, 0.4, 0.4, [s * 1.255, 2.62, 0.45], [s, 0, 0]);
  card(HAZARD, 1.0, 0.1, [s * 1.255, 2.15, 0.45], [s, 0, 0], { up: [0, 1, 0] });
  // hatch
  box(0.04, 0.5, 0.7, ARMOR, [s * 1.27, 2.0, 0.45]);
  box(0.06, 0.05, 0.2, STEEL, [s * 1.3, 2.0, 0.65]);
  bolts([[s * 1.3, 2.2, 0.15], [s * 1.3, 2.2, 0.75], [s * 1.3, 1.8, 0.15], [s * 1.3, 1.8, 0.75]], [s, 0, 0]);
  // vent louvers
  for (let i = 0; i < 5; i++) box(0.03, 0.035, 0.9, BLACK, [s * 1.26, 2.5 + i * 0.07, -3.0].map((v, k) => (k === 1 ? 2.05 + i * 0.07 : v)) as V);
  // armour corner wedges rear top
  box(0.2, 0.5, 0.2, ARMOR, [s * 1.2, 2.8, -3.9], [0, 0, 0]);
  // exhaust stacks
  cyl(0.1, 2.1, 8, DARK2, [s * 1.15, 2.4, 1.45]);
  cyl(0.14, 0.7, 8, IRON, [s * 1.15, 1.9, 1.45]);
  for (let i = 0; i < 4; i++) box(0.05, 0.06, 0.05, BLACK, [s * 1.15 + 0.0, 1.7 + i * 0.15, 1.6]);
  lit(cyl(0.105, 0.04, 8, ORANGE, [s * 1.15, 3.46, 1.45]), 1.6);
  box(0.3, 0.05, 0.05, STEEL, [s * 1.12, 2.8, 1.5]);
}
// cargo roof: hatches
for (const s of [1, -1]) {
  box(0.7, 0.07, 0.7, ARMOR, [s * 0.6, 3.06, 0.7]);
  lit(box(0.5, 0.02, 0.5, s > 0 ? CYAN : MAG, [s * 0.6, 3.1, 0.7]), 0.7);
  for (let i = 0; i < 4; i++) box(0.5, 0.025, 0.04, BLACK, [s * 0.6, 3.115, 0.55 + i * 0.1]);
}
// turret
const TY = 3.04, TZ = -0.6;
cyl(0.62, 0.14, 12, ARMOR, [0, TY + 0.05, TZ]);
P(new THREE.TorusGeometry(0.6, 0.025, 6, 16), CYAN, [0, TY + 0.13, TZ], { dir: [0, 1, 0], axis: "z" });
glow(b.root.children[b.root.children.length - 1] as any, 1); // no-op safe guard
box(1.05, 0.5, 1.2, ARMOR, [0, TY + 0.4, TZ]);
box(0.9, 0.2, 0.5, ARMOR, [0, TY + 0.5, TZ + 0.75], [-20, 0, 0]);
box(1.0, 0.1, 0.8, DARK2, [0, TY + 0.7, TZ - 0.1]);
for (const s of [1, -1]) {
  box(0.35, 0.4, 0.55, DARK2, [s * 0.72, TY + 0.4, TZ - 0.1]);
  card(WARN, 0.2, 0.2, [s * 0.9, TY + 0.4, TZ - 0.1], [s, 0, 0]);
  // rail barrels
  box(0.3, 0.26, 1.7, IRON, [s * 0.2, TY + 0.55, TZ + 1.45]);
  for (const y of [0.13, -0.13]) lit(box(0.05, 0.04, 2.2, CYAN, [s * 0.2, TY + 0.55 + y * 1.0, TZ + 1.6]), 1.8);
  for (let i = 0; i < 4; i++) cyl(0.16, 0.06, 8, STEEL, [s * 0.2, TY + 0.55, TZ + 0.9 + i * 0.4], [0, 0, 1]);
  cyl(0.12, 0.3, 8, BLACK, [s * 0.2, TY + 0.55, TZ + 2.6], [0, 0, 1]);
  for (const y of [0.08, -0.08]) lit(box(0.04, 0.03, 0.2, MAG, [s * 0.2, TY + 0.55 + y, TZ + 2.7]), 1.5);
}
// sensor ball
P(new THREE.SphereGeometry(0.17, 8, 6), BLACK, [0.0, TY + 0.95, TZ + 0.25]);
lit(cyl(0.1, 0.04, 10, RED, [0, TY + 0.97, TZ + 0.4], [0, 0.2, 1]), 1.8);
cyl(0.025, 0.7, 5, STEEL, [0.3, TY + 1.1, TZ - 0.4]);
// missile pods
function pod(sx: number) {
  const e = new THREE.Euler(-0.6, 0, 0);
  const T = (x: number, y: number, z: number): V => new THREE.Vector3(x, y, z).applyEuler(e).add(new THREE.Vector3(sx * 0.85, 3.5, -2.5)).toArray() as V;
  const d = new THREE.Vector3(0, 0, 1).applyEuler(e).toArray() as V;
  box(0.8, 0.7, 1.0, ARMOR, T(0, 0, 0), [-0.6 * DEG, 0, 0]);
  box(0.84, 0.74, 0.06, DARK2, T(0, 0, 0.5), [-0.6 * DEG, 0, 0]);
  for (const x of [-0.22, 0, 0.22]) for (const y of [-0.17, 0.17]) {
    cyl(0.1, 0.05, 8, BLACK, T(x, y, 0.53), d);
    lit(cone(0.065, 0.14, 6, [ORANGE, AMBER][y > 0 ? 0 : 1], T(x, y, 0.56), d), 1.4);
  }
  box(0.7, 0.5, 0.3, DARK2, [sx * 0.85, 3.2, -2.55]);
  lit(box(0.04, 0.5, 0.04, RED, T(sx * 0.41, 0, 0.0), [-0.6 * DEG, 0, 0]), 1.2);
}
pod(1); pod(-1);
// radar
cyl(0.06, 0.5, 6, IRON, [0, 3.25, -3.3]);
box(1.3, 0.5, 0.06, ARMOR, [0, 3.65, -3.3]);
lit(box(1.2, 0.4, 0.02, GREEN, [0, 3.65, -3.34]), 0.6);
for (let i = 0; i < 5; i++) box(0.02, 0.4, 0.03, BLACK, [-0.5 + i * 0.25, 3.65, -3.36]);
// antennas rear
for (const s of [1, -1]) {
  cyl(0.02, 1.7, 5, STEEL, [s * 1.1, 3.9, -3.7]);
  lit(P(new THREE.SphereGeometry(0.045, 5, 4), s > 0 ? RED : GREEN, [s * 1.1, 4.78, -3.7]), 2);
  cyl(0.05, 0.3, 6, DARK2, [s * 1.1, 3.1, -3.7]);
}
// cable harness
b.sweep(catmull([[-0.9, 3.04, -0.2], [-0.9, 3.12, 0.4], [-0.6, 3.06, 0.9], [-0.6, 3.0, 1.35]]), 0.03, { color: BLACK, sides: 6 });
b.sweep(catmull([[0.9, 3.04, -0.2], [0.9, 3.12, 0.4], [0.7, 3.06, 0.9], [0.5, 3.0, 1.35]]), 0.03, { color: DARK2, sides: 6 });

// ---------------------------------------------------------------- rear
box(2.9, 0.38, 0.4, ARMOR, [0, 1.2, -4.1]);
card(HAZARD, 2.8, 0.24, [0, 1.2, -4.31], [0, 0, -1]);
box(0.03, 1.35, 0.04, BLACK, [0, 2.28, -3.91]);
box(2.3, 0.03, 0.04, BLACK, [0, 2.0, -3.91]);
lit(card(SCREEN, 0.9, 0.58, [-0.55, 2.55, -3.915], [0, 0, -1]), 0.9);
card(PLATE, 0.5, 0.25, [0.0, 1.45, -3.92], [0, 0, -1]);
for (const s of [1, -1]) {
  box(0.28, 0.8, 0.1, ARMOR, [s * 1.05, 1.95, -3.93]);
  for (let i = 0; i < 4; i++) lit(box(0.2, 0.15, 0.04, RED, [s * 1.05, 1.68 + i * 0.19, -3.99]), 1.6);
  box(0.12, 0.2, 0.3, STEEL, [s * 0.6, 1.1, -4.4]);
  lit(cyl(0.04, 0.04, 6, AMBER, [s * 1.3, 1.2, -4.31], [0, 0, 1]), 1.5);
}
// ladder
for (const x of [0.5, 0.95]) box(0.05, 1.3, 0.05, STEEL, [x, 2.3, -3.97]);
for (let i = 0; i < 6; i++) box(0.5, 0.04, 0.04, STEEL, [0.72, 1.75 + i * 0.22, -3.97]);
// tow hitch
cyl(0.07, 0.4, 8, IRON, [0, 1.15, -4.4], [0, 0, 1]);
P(new THREE.TorusGeometry(0.1, 0.03, 6, 10), STEEL, [0, 1.15, -4.65], { dir: [0, 0, 1], axis: "z" });

// underglow
for (const s of [1, -1]) lit(box(0.04, 0.03, 6.0, s > 0 ? MAG : CYAN, [s * 0.92, 0.98, -0.1]), 1.4);

return_model();
function return_model() {}
export default function build() {
  return b.root;
}
