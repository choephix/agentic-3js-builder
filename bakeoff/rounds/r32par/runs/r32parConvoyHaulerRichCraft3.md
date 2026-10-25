```ts
import * as THREE from "three";
import { createBuilder, paint, countershade, mix, noise, smoothstep, resolve, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler HX-7",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler: plated cab with roof turret, neon trim, and a sealed octagonal cargo pod with a glowing lock door.",
};

// ---------- palette ----------
const NAVY = "#23283a";
const STEEL = "#3a4156";
const DARK = "#14172a";
const ORANGE = "#ff7a1a";
const CYAN = "#27f0ff";
const MAGENTA = "#ff2fa8";
const YELLOW = "#ffd22e";
const RED = "#ff2a3a";
const TIRE = "#15171f";
const HUB = "#8d97b8";

// ---------- paints ----------
const SEAM = [0.05, 0.06, 0.1] as const;
function plating(base: any, size: number) {
  return paint((p, n) => {
    const col = resolve(base, p, n);
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const fu = ((u / size) % 1 + 1) % 1 * size;
    const fv = ((v / (size * 0.7)) % 1 + 1) % 1 * size * 0.7;
    const d = Math.min(fu, fv);
    let c = col;
    if (d < 0.012) c = mix(col, SEAM, 0.85);
    else if (d < 0.03) c = mix(col, "#ffffff", 0.1);
    // grime near the ground
    const grime = smoothstep(1.4, 0.2, p.y) * (0.35 + 0.5 * noise(p, 0.5, 4));
    c = mix(c, "#2a2218", Math.min(0.7, grime));
    return c;
  });
}
const HULL = plating(countershade("#4a5575", "#222839", { level: 0 }), 0.6);
const ARMOR = plating(countershade("#363d54", "#1a1f30", { level: 0 }), 0.45);
const PODSKIN = plating(countershade("#59627f", "#262c40", { level: 0.1 }), 0.8);

// ---------- textures ----------
const hazardStripes = (() => {
  let s = "";
  for (let i = -2; i < 14; i++) s += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="${YELLOW}"/>`;
  return `<svg viewBox="0 0 96 16" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="16" fill="#141620"/>${s}</svg>`;
})();
const HAZARD = svg(hazardStripes, { size: 256 });

const VISOR = svg(
  `<svg viewBox="0 0 100 45" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2af0ff"/><stop offset="1" stop-color="#0a2a50"/></linearGradient></defs>
  <rect width="100" height="45" rx="4" fill="url(#g)"/>
  <g stroke="#0a1a38" stroke-width="1.2" opacity="0.5">${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${i * 4 + 2} H100"/>`).join("")}</g>
  <path d="M8 36 L30 18 L50 28 L70 12 L92 24" stroke="#eaffff" stroke-width="1.6" fill="none"/>
  <circle cx="50" cy="22" r="9" fill="none" stroke="#eaffff" stroke-width="1.4"/>
  <path d="M50 8 V14 M50 30 V36 M36 22 H42 M58 22 H64" stroke="#eaffff" stroke-width="1.4"/>
  <rect x="2" y="2" width="96" height="41" rx="3" fill="none" stroke="#06101f" stroke-width="2.5"/>
  </svg>`,
  { size: 384 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="144" height="114" rx="10" fill="#12162a" stroke="${ORANGE}" stroke-width="5"/>
  <polygon points="75,14 106,30 106,64 75,84 44,64 44,30" fill="#1d2440" stroke="${CYAN}" stroke-width="3.5"/>
  <polygon points="75,28 94,38 94,58 75,70 56,58 56,38" fill="${ORANGE}"/>
  <path d="M75 36 L86 42 V54 L75 62 L64 54 V42Z" fill="#12162a"/>
  <rect x="71" y="43" width="8" height="12" fill="${CYAN}"/>
  <text x="75" y="102" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#ffffff">HX-7 CONVOY</text>
  <path d="M14 108 H136" stroke="${MAGENTA}" stroke-width="3"/>
  </svg>`,
  { size: 384 },
);

const IDPLATE = svg(
  `<svg viewBox="0 0 150 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="144" height="74" rx="6" fill="#10131f" stroke="${CYAN}" stroke-width="4"/>
  <text x="75" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="${CYAN}">SEALED</text>
  <text x="75" y="58" text-anchor="middle" font-family="monospace" font-size="14" fill="${ORANGE}">DO NOT OPEN // 0417</text>
  <path d="M10 68 H140" stroke="${MAGENTA}" stroke-width="2.5" stroke-dasharray="8 4"/>
  </svg>`,
  { size: 384 },
);

const DOOR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" fill="#171a2a" stroke="#0c0e18" stroke-width="3"/>
  <polygon points="30,7 70,7 93,30 93,70 70,93 30,93 7,70 7,30" fill="none" stroke="${YELLOW}" stroke-width="7" stroke-dasharray="9 7"/>
  <polygon points="32,18 68,18 82,32 82,68 68,82 32,82 18,68 18,32" fill="#232842" stroke="${ORANGE}" stroke-width="2.5"/>
  <circle cx="50" cy="45" r="19" fill="#12162a" stroke="${CYAN}" stroke-width="3"/>
  <text x="50" y="76" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="${ORANGE}">SEALED</text>
  </svg>`,
  { size: 384 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 40 18" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="18" rx="2" fill="#0c0e18"/>
  ${Array.from({ length: 5 }, (_, i) => `<rect x="3" y="${2 + i * 3}" width="34" height="1.8" fill="${i % 2 ? ORANGE : "#4a5270"}"/>`).join("")}</svg>`,
  { size: 192 },
);

const LENS = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="#0c0e18"/>
  <circle cx="16" cy="16" r="11" fill="${MAGENTA}" stroke="#ffd0ee" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#2a0618"/><circle cx="12" cy="12" r="2.2" fill="#fff"/></svg>`,
  { size: 128 },
);

// ---------- build ----------
export default function build() {
  const b = createBuilder({ name: "convoy_hauler", paintSize: 2048 });

  const box = (w: number, h: number, d: number, color: any, at: number[], rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rotation as any });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: at as any, dir: dir as any, axis: "z", texture: tex });
  const cyl = (rt: number, rb: number, len: number, seg: number, color: any, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, { at: at as any, dir: dir as any });
  const octa = (half: number, ch: number, cy: number): [number, number][] => [
    [-half + ch, cy - half], [half - ch, cy - half], [half, cy - half + ch], [half, cy + half - ch],
    [half - ch, cy + half], [-half + ch, cy + half], [-half, cy + half - ch], [-half, cy - half + ch],
  ];

  // ----- chassis -----
  box(2.2, 0.5, 8.6, ARMOR, [0, 0.95, 0.1]);
  box(1.5, 0.25, 8.0, DARK, [0, 0.62, 0.1]);
  for (const z of [3.2, -1.6, -3.2]) box(2.9, 0.18, 0.3, DARK, [0, 0.64, z]); // axles

  // ----- wheels -----
  for (const z of [3.2, -1.6, -3.2])
    for (const s of [1, -1]) {
      const x = s * 1.3;
      cyl(0.65, 0.65, 0.55, 10, TIRE, [x, 0.64, z], [1, 0, 0]);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + 0.15;
        box(0.57, 0.08, 0.22, "#0b0c12", [x, 0.64 + 0.66 * Math.cos(a), z + 0.66 * Math.sin(a)], [(a * 180) / Math.PI, 0, 0]);
      }
      cyl(0.36, 0.36, 0.6, 8, HUB, [x, 0.64, z], [1, 0, 0]);
      glow(cyl(0.2, 0.2, 0.64, 8, CYAN, [x, 0.64, z], [1, 0, 0]), 1.3);
      // fender
      box(0.8, 0.1, 1.55, HULL, [x, 1.4, z]);
      box(0.12, 0.34, 1.55, ARMOR, [s * 1.62, 1.28, z]);
    }

  // ----- cab -----
  const cabProfile: [number, number][] = [
    [2.0, 1.35], [2.0, 3.1], [3.3, 3.1], [3.95, 2.3], [4.45, 2.2], [4.55, 1.6], [4.45, 1.35],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, color: HULL });
  // armour roof plate + hood plate
  box(2.5, 0.1, 1.5, ARMOR, [0, 3.14, 2.7]);
  // windshield
  glow(b.part(new THREE.PlaneGeometry(2.1, 0.95), "#ffffff", { at: [0, 2.708, 3.634], dir: [0, 0.631, 0.777], axis: "z", texture: VISOR }), 0.9);
  for (const s of [1, -1]) {
    glow(plane(1.1, 0.62, VISOR, [s * 1.212, 2.65, 2.75], [s, 0, 0]), 0.6);
    plane(0.8, 0.64, EMBLEM, [s * 1.212, 1.85, 2.75], [s, 0, 0]);
    // cab side armour strip + neon
    box(0.06, 0.28, 2.3, ARMOR, [s * 1.23, 1.55, 3.15]);
    glow(box(0.04, 0.05, 2.3, MAGENTA, [s * 1.27, 1.7, 3.15]), 1.4);
    // wing mirror
    b.rod([s * 1.2, 2.5, 3.9] as any, [s * 1.55, 2.7, 3.95] as any, 0.025, DARK);
    box(0.08, 0.4, 0.22, NAVY, [s * 1.6, 2.7, 3.95]);
    glow(box(0.02, 0.3, 0.16, CYAN, [s * 1.65, 2.7, 3.95]), 1);
    // exhaust stacks
    cyl(0.1, 0.12, 0.8, 8, "#2b2f40", [s * 0.95, 3.5, 2.2], [0, 1, 0]);
    glow(cyl(0.08, 0.08, 0.04, 8, ORANGE, [s * 0.95, 3.92, 2.2], [0, 1, 0]), 1.5);
    cyl(0.13, 0.13, 0.08, 8, ORANGE, [s * 0.95, 3.3, 2.2], [0, 1, 0]);
    // headlights
    glow(box(0.5, 0.22, 0.12, "#f4fbff", [s * 0.85, 1.75, 4.55]), 1.8);
    box(0.6, 0.06, 0.16, DARK, [s * 0.85, 1.9, 4.52]);
    // antennas
    b.rod([s * 1.0, 3.1, 2.1] as any, [s * 1.05, 4.3, 2.05] as any, 0.02, DARK);
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), s > 0 ? MAGENTA : CYAN, { at: [s * 1.05, 4.32, 2.05] }), 1.6);
    // skirts
    box(0.14, 0.62, 2.0, ARMOR, [s * 1.2, 0.95, 1.3]);
    plane(1.9, 0.3, HAZARD, [s * 1.275, 0.95, 1.3], [s, 0, 0]);
    glow(box(0.05, 0.05, 2.0, CYAN, [s * 1.29, 0.6, 1.3]), 1.5);
    // mud flaps
    box(0.7, 0.6, 0.05, "#0d0f18", [s * 1.3, 0.55, -3.95]);
    // tail lights
    glow(box(0.45, 0.16, 0.06, RED, [s * 0.85, 1.0, -4.58]), 1.6);
    // tow hooks
    box(0.14, 0.1, 0.3, YELLOW, [s * 0.9, 0.75, 4.75]);
  }
  // grille + bumper
  plane(0.95, 0.42, GRILLE, [0, 1.82, 4.535], [0, 0, 1]);
  box(2.7, 0.5, 0.36, ARMOR, [0, 1.05, 4.5]);
  plane(2.5, 0.38, HAZARD, [0, 1.05, 4.685], [0, 0, 1]);
  box(2.8, 0.14, 0.4, DARK, [0, 0.76, 4.45]);
  // ram wedge
  b.extrude([[-1.2, 0], [1.2, 0], [0.9, 0.35], [-0.9, 0.35]], { at: [0, 0.82, 4.7], x: [1, 0, 0], thickness: 0.2, color: ORANGE });
  // hood stripes
  box(0.5, 0.02, 0.5, ORANGE, [0, 2.24, 4.2]);
  glow(box(1.0, 0.03, 0.05, CYAN, [0, 2.25, 3.95]), 1.2);

  // roof light bar
  box(1.9, 0.12, 0.22, DARK, [0, 3.24, 3.15]);
  for (let i = 0; i < 6; i++) glow(box(0.27, 0.08, 0.06, i % 2 ? CYAN : MAGENTA, [-0.78 + i * 0.312, 3.25, 3.275]), 1.8);

  // turret
  cyl(0.5, 0.55, 0.2, 8, STEEL, [0, 3.24, 2.6], [0, 1, 0]);
  b.part(new THREE.BoxGeometry(1.0, 0.5, 0.9), HULL, { at: [0, 3.58, 2.6] });
  box(1.1, 0.12, 0.7, ARMOR, [0, 3.88, 2.55]);
  glow(plane(0.3, 0.3, LENS, [0, 3.6, 3.056], [0, 0, 1]), 1.4);
  for (const s of [1, -1]) {
    box(0.3, 0.3, 0.5, ARMOR, [s * 0.4, 3.56, 3.12]);
    b.rod([s * 0.32, 3.56, 3.1] as any, [s * 0.32, 3.56, 4.35] as any, 0.065, "#242838", { sides: 8 } as any);
    cyl(0.1, 0.1, 0.2, 8, STEEL, [s * 0.32, 3.56, 3.7], [0, 0, 1]);
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), ORANGE, { at: [s * 0.32, 3.56, 4.37] }), 2);
  }

  // ----- cargo pod -----
  const PY = 2.6;
  b.extrude(octa(1.3, 0.55, PY).map(([x, y]) => [x, y] as [number, number]), { at: [0, 0, -1.3], x: [1, 0, 0], thickness: 5.6, color: PODSKIN });
  for (const [z, th] of [[1.75, 0.5], [-4.3, 0.4]] as [number, number][])
    b.extrude(octa(1.15, 0.5, PY), { at: [0, 0, z], x: [1, 0, 0], thickness: th, color: ARMOR });
  // bands
  for (const z of [0.9, -1.3, -3.5]) {
    b.extrude(octa(1.36, 0.58, PY), { at: [0, 0, z], x: [1, 0, 0], thickness: 0.22, color: ORANGE });
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), YELLOW, { at: [s * 1.38, PY, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), YELLOW, { at: [s * 1.0, PY + 1.0, z + 0.0], dir: [s, 1, 0] });
    }
  }
  // side plates
  for (const s of [1, -1]) {
    plane(1.5, 1.1, EMBLEM, [s * 1.312, PY, -0.2], [s, 0, 0]);
    plane(1.5, 0.8, IDPLATE, [s * 1.312, PY, -2.4], [s, 0, 0]);
    // chamfer neon
    glow(box(0.04, 0.3, 4.8, CYAN, [s * 1.04, 3.64, -1.3], [0, 0, s > 0 ? 45 : 135]), 1.4);
    // lower armour rails
    box(0.1, 0.18, 5.4, STEEL, [s * 1.33, 1.5, -1.3]);
    // vents
    for (let i = 0; i < 4; i++) box(0.06, 0.4, 0.1, "#0b0d16", [s * 1.31, 3.35, -3.0 + i * 0.22]);
  }
  // top seal strip and ribs
  glow(box(0.2, 0.05, 5.0, CYAN, [0, 3.91, -1.3]), 1.6);
  for (let i = 0; i < 7; i++) {
    box(1.4, 0.05, 0.1, STEEL, [0, 3.92, 1.0 - i * 0.78]);
  }
  // sensor mast
  cyl(0.05, 0.07, 0.8, 6, DARK, [0.5, 4.3, -3.3], [0, 1, 0]);
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), MAGENTA, { at: [0.5, 4.72, -3.3] }), 2);
  // dish
  b.lathe([[0, 0], [0.35, 0.1], [0.38, 0.14], [0.0, 0.05]], { at: [-0.5, 3.98, -3.0], axis: [0.3, 1, -0.2], color: STEEL, segments: 8 });
  b.rod([-0.5, 3.92, -3.0] as any, [-0.5, 4.1, -3.0] as any, 0.04, DARK);
  // rear door
  plane(2.0, 2.0, DOOR, [0, PY, -4.505], [0, 0, -1]);
  glow(b.part(new THREE.CircleGeometry(0.28, 8), CYAN, { at: [0, PY + 0.07, -4.52], dir: [0, 0, -1], axis: "z" }), 1.8);
  for (const s of [1, -1]) box(0.14, 0.9, 0.12, STEEL, [s * 1.0, PY, -4.55]);
  // rear bumper
  box(2.4, 0.5, 0.3, ARMOR, [0, 0.85, -4.4]);
  plane(2.2, 0.3, HAZARD, [0, 0.85, -4.555], [0, 0, -1]);
  // pod cradle
  box(2.0, 0.12, 6.4, DARK, [0, 1.26, -1.2]);

  return b.root;
}
```