import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Armoured Convoy Hauler",
  description:
    "Low-poly cyberpunk six-wheel armoured hauler with a roof turret, plow bumper, neon underglow and a sealed, banded cargo pod.",
};

// ---------------------------------------------------------------- palette
const GUN = "#2a2e3a";
const GUN_HI = "#4a5164";
const PODC = "#39465a";
const PODC_HI = "#6c7f9c";
const DARK = "#0d0f15";
const TIRE = "#15161c";
const STEEL = "#7b8497";
const CYAN = "#19e6ff";
const MAGENTA = "#ff2a8a";
const YELLOW = "#ffc21a";
const RED = "#ff2438";
const BLUE = "#2a5cff";
const ORANGE = "#ff8a1c";

// ---------------------------------------------------------------- paints
// Panelled plating with seams, bevel, grime near the ground and warm/cool lighting.
function plate(base: string, hi: string, size: number, seed: number) {
  return paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = (((u / size) % 1) + 1) % 1 * size;
    const dv = (((v / (size * 0.7)) % 1) + 1) % 1 * size * 0.7;
    let c = mix(base, hi, noise(p, 0.8, seed) * 0.8);
    const light = 0.82 + 0.22 * Math.max(n.y, 0) - 0.1 * Math.max(-n.y, 0);
    c = [c[0] * light, c[1] * light * 0.98, c[2] * light * 1.04];
    if (du < 0.022 || dv < 0.022) return mix(c, "#07080c", 0.85);
    if (du < 0.05 || dv < 0.05) return mix(c, "#9fb3d6", 0.16);
    const mud = smoothstep(1.2, 0.4, p.y) * (0.4 + 0.6 * noise(p, 0.3, seed + 4));
    c = mix(c, "#3b3024", mud * 0.75);
    const soot = smoothstep(0.55, 0.9, noise(p, 0.5, seed + 9)) * 0.25;
    return mix(c, "#0a0a0d", soot);
  });
}
const HULL = plate(GUN, GUN_HI, 0.55, 3);
const PODP = plate(PODC, PODC_HI, 0.7, 11);
const ARMOUR = plate("#1c1f29", "#3a4152", 0.4, 21);
const HAZARD = paint((_p, _n, s) =>
  (Math.floor(s[1] / 15) + Math.floor(s[0] / 0.16)) % 2 === 0 ? YELLOW : "#14141a");

// ---------------------------------------------------------------- textures
const WINDSHIELD = svg(
  `<svg viewBox="0 0 210 110" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a44"/><stop offset="1" stop-color="#050912"/></linearGradient></defs>
  <rect width="210" height="110" rx="6" fill="url(#g)" stroke="#071018" stroke-width="6"/>
  <path d="M0 80 L70 30 L110 55 L210 10" stroke="#19e6ff" stroke-width="2" fill="none" opacity="0.5"/>
  <path d="M105 15 v12 M105 83 v12 M60 55 h14 M136 55 h14" stroke="#19e6ff" stroke-width="3"/>
  <circle cx="105" cy="55" r="22" fill="none" stroke="#19e6ff" stroke-width="2.5" stroke-dasharray="8 5"/>
  <rect x="14" y="14" width="40" height="6" fill="#ff2a8a"/><rect x="156" y="90" width="40" height="6" fill="#19e6ff"/>
  <path d="M10 100 L60 100" stroke="#ff2a8a" stroke-width="3"/>
  </svg>`, { size: 384 });
const SIDEWIN = svg(
  `<svg viewBox="0 0 130 70" xmlns="http://www.w3.org/2000/svg">
  <rect width="130" height="70" rx="5" fill="#07121e" stroke="#05070c" stroke-width="5"/>
  <path d="M10 60 L50 8 M40 62 L85 8 M75 62 L115 8" stroke="#19e6ff" stroke-width="5" opacity="0.28"/>
  <rect x="96" y="50" width="22" height="5" fill="#ff2a8a"/>
  </svg>`, { size: 256 });
const GRILLE = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="50" rx="4" fill="#0a0b10" stroke="#3a4152" stroke-width="4"/>
  ${[8, 16, 24, 32, 40].map((y) => `<rect x="10" y="${y}" width="100" height="3.5" fill="#ff2a8a"/>`).join("")}
  <path d="M60 4 v42" stroke="#0a0b10" stroke-width="6"/>
  </svg>`, { size: 256 });
const EMBLEM = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 6 H58 L66 14 V36 L58 44 H6 Z" fill="#101218" stroke="#19e6ff" stroke-width="3"/>
  <path d="M14 14 L28 25 L14 36 M30 14 L44 25 L30 36" stroke="#ff2a8a" stroke-width="4" fill="none"/>
  <text x="72" y="32" font-family="monospace" font-weight="bold" font-size="24" fill="#ffc21a">07</text>
  </svg>`, { size: 256 });
const CHEVRON = svg(
  `<svg viewBox="0 0 240 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="240" height="50" fill="#14141a"/>
  ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 32} 50 L${i * 32 + 16} 0 L${i * 32 + 32} 0 L${i * 32 + 16} 50Z" fill="#ffc21a"/>`).join("")}
  </svg>`, { size: 384 });
const LABEL = svg(
  `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="232" height="112" rx="8" fill="none" stroke="#19e6ff" stroke-width="4"/>
  <path d="M40 24 L70 76 L10 76 Z" fill="none" stroke="#ffc21a" stroke-width="6" stroke-linejoin="round"/>
  <path d="M40 40 v16 M40 63 v2" stroke="#ffc21a" stroke-width="6"/>
  <text x="90" y="52" font-family="monospace" font-weight="bold" font-size="30" fill="#ff2a8a">SEALED</text>
  <text x="90" y="80" font-family="monospace" font-size="18" fill="#19e6ff">CARGO-X 4471</text>
  ${Array.from({ length: 22 }, (_, i) => `<rect x="${20 + i * 9}" y="92" width="${i % 3 === 0 ? 5 : 3}" height="16" fill="#19e6ff"/>`).join("")}
  </svg>`, { size: 512 });
const SEAL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="#0b0d14" stroke="#ffc21a" stroke-width="5"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="#ff2a8a" stroke-width="3" stroke-dasharray="10 6"/>
  ${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M50 50 L50 18 L66 24Z" fill="#19e6ff" transform="rotate(${a} 50 50)"/>`).join("")}
  <circle cx="50" cy="50" r="9" fill="#ff2438"/>
  </svg>`, { size: 256 });

// ---------------------------------------------------------------- builder & helpers
export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (r: number, len: number, color: any, at: number[], dir: number[], seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir, ...o });
  const rod = (a: number[], c: number[], r: number, color: any) => b.rod(a, c, r, color, { sides: 6 } as any);
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], str = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
    return str ? glow(p, str) : p;
  };

  // ---- chassis
  box(2.2, 0.6, 8.8, ARMOUR, 0, 1.15, 0);
  box(2.0, 0.14, 8.6, DARK, 0, 0.8, 0); // belly pan
  glow(box(1.9, 0.03, 7.4, MAGENTA, 0, 0.72, 0), 1.4); // underglow slab
  for (const s of [1, -1]) {
    glow(box(0.04, 0.06, 2.0, MAGENTA, s * 1.12, 0.95, 0.9), 1.2);
    glow(box(0.04, 0.06, 1.6, MAGENTA, s * 1.12, 0.95, -4.1 + 0.0), 1.2);
    box(0.08, 0.34, 2.3, HULL, s * 1.14, 1.0, 0.9); // side skirt
    for (let i = 0; i < 3; i++) glow(box(0.05, 0.05, 0.12, ORANGE, s * 1.19, 1.1, 0.2 + i * 0.7), 1.2);
  }
  // axles
  for (const z of [2.9, -1.2, -3.0]) cyl(0.12, 2.8, DARK, [0, 0.7, z], [1, 0, 0], 8);

  // ---- wheels
  const AX = [2.9, -1.2, -3.0];
  for (const s of [1, -1])
    for (const z of AX) {
      const x = s * 1.35;
      cyl(0.66, 0.5, TIRE, [x, 0.7, z], [1, 0, 0], 16);
      for (let k = 0; k < 12; k++) {
        const a = (k * 30 * Math.PI) / 180;
        box(0.5, 0.08, 0.2, TIRE, x, 0.7 + 0.68 * Math.cos(a), z + 0.68 * Math.sin(a), { rotation: [k * 30, 0, 0] });
      }
      cyl(0.42, 0.56, STEEL, [x, 0.7, z], [1, 0, 0], 8);
      glow(cyl(0.3, 0.04, CYAN, [s * 1.635, 0.7, z], [1, 0, 0], 12), 1.2);
      cyl(0.17, 0.08, DARK, [s * 1.65, 0.7, z], [1, 0, 0], 8);
      for (let k = 0; k < 6; k++) {
        const a = (k * 60 * Math.PI) / 180;
        cyl(0.035, 0.07, STEEL, [s * 1.62, 0.7 + 0.36 * Math.cos(a), z + 0.36 * Math.sin(a)], [1, 0, 0], 6);
      }
      // fender
      box(0.8, 0.14, 1.7, ARMOUR, x, 1.52, z);
      box(0.8, 0.1, 0.34, ARMOUR, x, 1.4, z + 0.95, { rotation: [-25, 0, 0] });
      box(0.8, 0.1, 0.34, ARMOUR, x, 1.4, z - 0.95, { rotation: [25, 0, 0] });
    }

  // ---- cab
  const cabOutline: [number, number][] = [
    [1.4, 1.4], [4.45, 1.4], [4.45, 2.1], [3.7, 2.3], [3.0, 3.35], [1.5, 3.4], [1.4, 3.3],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.08, color: HULL });
  // windows
  plane(2.1, 1.1, WINDSHIELD, [0, 2.84, 3.375], [0, 0.555, 0.832], 0.55);
  for (const s of [1, -1]) {
    plane(1.3, 0.7, SIDEWIN, [s * 1.215, 2.85, 2.35], [s, 0, 0], 0.4);
    plane(1.0, 0.5, EMBLEM, [s * 1.215, 1.95, 2.5], [s, 0, 0]);
    // mirrors
    rod([s * 1.2, 2.5, 3.0], [s * 1.5, 2.7, 3.15], 0.025, STEEL);
    box(0.08, 0.38, 0.22, DARK, s * 1.52, 2.7, 3.15);
    // exhaust stacks
    cyl(0.13, 2.9, STEEL, [s * 1.3, 2.95, 1.55], [0, 1, 0], 8);
    for (const y of [2.0, 2.8, 3.6]) cyl(0.17, 0.08, DARK, [s * 1.3, y, 1.55], [0, 1, 0], 8);
    glow(cyl(0.1, 0.05, ORANGE, [s * 1.3, 4.42, 1.55], [0, 1, 0], 8), 1.6);
    box(0.2, 0.1, 0.3, DARK, s * 1.25, 1.7, 1.55);
    // fuel tanks
    cyl(0.32, 2.0, STEEL, [s * 1.32, 1.02, 0.8], [0, 0, 1], 8);
    for (const z of [0.1, 1.5]) cyl(0.345, 0.1, DARK, [s * 1.32, 1.02, z], [0, 0, 1], 8);
    // headlights
    glow(box(0.55, 0.2, 0.07, "#e6fbff", s * 0.85, 1.85, 4.47), 1.8);
    box(0.65, 0.3, 0.05, DARK, s * 0.85, 1.85, 4.45);
    // cab side armour plate
    box(0.06, 0.5, 1.4, ARMOUR, s * 1.23, 1.75, 2.4);
  }
  plane(1.0, 0.45, GRILLE, [0, 1.85, 4.465], [0, 0, 1], 0.7);
  // hood vents
  for (const z of [4.2, 3.95])
    glow(box(1.7, 0.05, 0.12, MAGENTA, 0, 2.2 + (4.45 - z) * -0.0 + (z === 4.2 ? 0.0 : 0.05), z, { rotation: [15, 0, 0] }), 1.0);

  // plow bumper
  b.extrude(
    [[4.3, 0.6], [4.95, 0.55], [5.0, 1.1], [4.45, 1.55], [4.3, 1.4]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, bevel: 0.05, color: ARMOUR },
  );
  plane(2.4, 0.5, CHEVRON, [0, 0.83, 5.012], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(box(0.3, 0.1, 0.06, YELLOW, s * 1.0, 1.35, 4.98), 1.3);
    b.spike([s * 1.25, 0.8, 4.9], [0, 0, 1], 0.4, 0.09, { color: STEEL, sides: 4 } as any); // tow spikes
  }

  // roof: light bar, turret, antennas
  for (let i = 0; i < 6; i++)
    glow(box(0.26, 0.12, 0.2, i % 2 ? RED : BLUE, -0.65 + i * 0.26, 3.5, 1.75), 1.8);
  box(1.8, 0.06, 0.28, DARK, 0, 3.44, 1.75);
  cyl(0.42, 0.2, STEEL, [0, 3.5, 2.3], [0, 1, 0], 10);
  box(0.62, 0.36, 0.7, ARMOUR, 0, 3.8, 2.3);
  for (const s of [1, -1]) {
    rod([s * 0.14, 3.8, 2.6], [s * 0.14, 3.8, 3.5], 0.05, DARK);
    cyl(0.075, 0.2, STEEL, [s * 0.14, 3.8, 3.2], [0, 0, 1], 6);
    glow(cyl(0.05, 0.03, ORANGE, [s * 0.14, 3.8, 3.52], [0, 0, 1], 6), 1.8);
    rod([s * 1.1, 3.4, 1.6], [s * 1.1, 4.9, 1.6], 0.022, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [s * 1.1, 4.92, 1.6] }), 2);
  }
  glow(box(0.3, 0.06, 0.04, CYAN, 0, 3.82, 2.66), 1.5);

  // ---- cargo pod
  const POD_C = [0, 2.85, -1.6];
  const pod = b.lathe(
    [
      [0, -2.9], [0.95, -2.9], [1.2, -2.65], [1.35, -2.2], [1.35, 2.2], [1.12, 2.65], [0.6, 2.9], [0, 2.9],
    ],
    { at: POD_C, axis: [0, 0, 1], segments: 8, spin: 22.5, color: PODP },
  );
  // cradle
  for (const z of [-3.6, -2.0, -0.4]) box(2.3, 0.2, 0.5, ARMOUR, 0, 1.55, z);
  // hazard bands + latches
  for (const z of [-3.7, -2.4, -0.8, 0.5]) {
    b.lathe([[1.31, -0.14], [1.42, -0.1], [1.42, 0.1], [1.31, 0.14]], {
      at: [0, 2.85, z], axis: [0, 0, 1], segments: 8, spin: 22.5, color: HAZARD,
    });
    for (const s of [1, -1]) box(0.16, 0.34, 0.3, STEEL, s * 1.4, 2.85, z);
  }
  // roof strips & rails
  for (const s of [1, -1]) {
    glow(box(0.12, 0.07, 3.8, MAGENTA, s * 0.4, 4.16, -1.6), 1.2);
    glow(box(0.05, 0.05, 3.9, CYAN, s * 1.27, 2.15, -1.6), 1.3);
    glow(box(0.05, 0.05, 3.9, CYAN, s * 1.27, 3.55, -1.6), 1.0);
    b.decal(pod, LABEL, { at: [s * 1.35, 2.85, -1.7], dir: [s, 0, 0], size: [2.6, 1.3] }).mesh &&
      glow(b.decal(pod, LABEL, { at: [s * 1.35, 2.85, -1.7], dir: [s, 0, 0], size: [2.6, 1.3], lift: 0.012 }), 0.6);
    // missile pods
    box(0.55, 0.5, 1.0, ARMOUR, s * 1.0, 3.95, -0.4);
    for (let i = 0; i < 6; i++)
      cyl(0.075, 0.08, DARK, [s * 1.0 + ((i % 3) - 1) * 0.16, 3.95 + (i < 3 ? 0.11 : -0.11), 0.12], [0, 0, 1], 6);
    for (const x of [-0.18, 0.18]) glow(cyl(0.03, 0.02, RED, [s * 1.0 + x, 3.95, 0.15], [0, 0, 1], 6), 1.2);
  }
  // rear seal door
  cyl(0.98, 0.1, ARMOUR, [0, 2.85, -4.5], [0, 0, 1], 10);
  glow(b.part(new THREE.CircleGeometry(0.85, 16), "#ffffff", { at: [0, 2.85, -4.565], dir: [0, 0, -1], axis: "z", texture: SEAL }), 1.2);
  for (const s of [1, -1]) box(0.14, 0.5, 0.2, STEEL, s * 1.0, 2.85, -4.5);
  // radar mast + dish
  rod([0, 4.15, -3.3], [0, 4.55, -3.3], 0.05, STEEL);
  b.lathe([[0, 0], [0.45, 0.18], [0.45, 0.21], [0, 0.06]], { at: [0, 4.55, -3.3], axis: [0, 0.85, 0.5], segments: 8, color: STEEL });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), CYAN, { at: [0, 4.78, -3.15] }), 2);
  // umbilical hoses cab → pod
  for (const s of [1, -1])
    b.sweep(catmull([[s * 0.5, 2.2, 1.42], [s * 0.7, 1.9, 1.3], [s * 0.7, 1.75, 1.05]]), 0.04, { color: DARK, sides: 6 } as any);

  // ---- rear
  box(2.4, 0.3, 0.3, ARMOUR, 0, 1.0, -4.55);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.18, 0.06, RED, s * 0.8, 1.2, -4.43), 1.6);
    glow(box(0.12, 0.12, 0.05, ORANGE, s * 1.0, 1.55, -4.43), 1.2);
  }
  cyl(0.1, 0.3, STEEL, [0, 0.95, -4.8], [0, 0, 1], 8); // hitch

  // mud flaps
  for (const s of [1, -1]) for (const z of [-1.9, -3.75]) box(0.06, 0.4, 0.5, DARK, s * 1.12, 0.6, z - 0.0);

  return b.root;
}
