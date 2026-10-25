```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "NovaGuard RC-7 Riot Interceptor",
  description:
    "Corporate armored riot-control truck with a roof water cannon, tank, neon light bars, underglow and hazard ram bumper. Cyberpunk style.",
};

// ---------- palette ----------
const CYAN = "#19f3ff";
const MAG = "#ff2bd6";
const RED = "#ff2a3c";
const BLUE = "#2a62ff";
const YEL = "#ffc81f";
const DARK = "#0c0f16";
const STEEL = "#7d8799";
const GUN = "#1b2230";
const WHITE = "#f2f6ff";

// ---------- paints ----------
const BODY = paint((p, n) => {
  let c = mix("#1f2735", "#2e3a50", noise(p, 0.6, 3));
  if (n.y > 0.6) c = mix(c, "#4b5a74", 0.5);
  if (p.y < 0.95) c = mix(c, "#10131a", 0.55 * (1 - p.y / 0.95));
  const sz = (((p.z + 20) % 1.15) + 1.15) % 1.15;
  if (sz < 0.014 && Math.abs(n.x) > 0.5) c = mix(c, "#07090d", 0.85);
  if (Math.abs(n.x) > 0.7 && p.y > 0.98 && p.y < 1.07) c = mix(c, YEL, 0.9);
  if (noise(p, 0.12, 8) > 0.72) c = mix(c, "#0a0c11", 0.4);
  return c;
});
const ARMOR = paint((p, n) => {
  let c = mix("#262f42", "#3a4760", noise(p, 0.4, 5));
  if (n.y > 0.6) c = mix(c, "#5a6a88", 0.45);
  const sz = (((p.z + 20) % 0.9) + 0.9) % 0.9;
  if (sz < 0.012) c = mix(c, "#06080c", 0.85);
  return c;
});
const TIRE = paint((p) => mix("#0b0b0e", "#1d1d24", noise(p, 0.08, 2)));
const METAL = paint((p, n) => mix("#5c6577", "#a4adbf", noise(p, 0.1, 4) * 0.7 + (n.y > 0.5 ? 0.25 : 0)));

// ---------- textures ----------
const LOGO = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="45" cy="50" r="36" fill="#0b0e14" stroke="${WHITE}" stroke-width="5"/>
  <path d="M45 22 L72 68 L18 68 Z" fill="none" stroke="${CYAN}" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="45" cy="52" r="7" fill="${MAG}"/>
  <text x="92" y="48" font-family="Arial Black, Impact, sans-serif" font-weight="bold" font-size="30" fill="${WHITE}" stroke="#05070b" stroke-width="1.5">NOVA</text>
  <text x="92" y="76" font-family="Arial Black, Impact, sans-serif" font-weight="bold" font-size="26" fill="${CYAN}" stroke="#05070b" stroke-width="1.2">GUARD</text>
  <rect x="92" y="83" width="100" height="4" fill="${MAG}"/>
</svg>`,
  { size: 512 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="32" fill="${YEL}"/>
  <g fill="#0b0d12"><path d="M0 32 L16 0 L28 0 L12 32Z"/><path d="M24 32 L40 0 L52 0 L36 32Z"/><path d="M48 32 L64 0 L64 14 L58 32Z"/><path d="M-8 32 L4 8 L-8 8Z"/></g>
  <rect x="0" y="0" width="64" height="2" fill="#0b0d12"/><rect x="0" y="30" width="64" height="2" fill="#0b0d12"/>
</svg>`,
  { size: 256 },
);
const LED = svg(
  `<svg viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="50" rx="4" fill="#07050d"/>
  <text x="80" y="24" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="20" font-weight="bold" fill="${MAG}" stroke="#ff9cf0" stroke-width="0.8">STAND DOWN</text>
  <text x="80" y="42" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="${CYAN}">// COMPLY OR BE CLEARED //</text>
  <rect x="2" y="2" width="156" height="46" rx="4" fill="none" stroke="${CYAN}" stroke-width="1.5"/>
</svg>`,
  { size: 512 },
);
const SIDETEXT = svg(
  `<svg viewBox="0 0 200 30" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="22" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="bold" font-size="22" fill="${YEL}" stroke="#05070b" stroke-width="1.6" paint-order="stroke">RIOT CONTROL · UNIT 07</text>
</svg>`,
  { size: 512 },
);
const GLASS = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b4a63"/><stop offset="1" stop-color="#070d18"/></linearGradient></defs>
  <rect width="64" height="64" fill="url(#g)"/>
  <path d="M6 64 L30 0 L38 0 L14 64Z" fill="#7fe9ff" opacity="0.25"/>
  <path d="M34 64 L50 14 L54 14 L40 64Z" fill="#ff5de6" opacity="0.2"/>
</svg>`,
  { size: 128 },
);
const TANK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#2f6bd0"/>
  <rect y="0" width="64" height="10" fill="#1c3f86"/><rect y="54" width="64" height="10" fill="#1c3f86"/>
  <text x="32" y="38" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="bold" font-size="18" fill="${WHITE}">H₂O</text>
  <rect x="6" y="44" width="52" height="3" fill="${CYAN}"/>
</svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 80 28" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="28" rx="3" fill="#e9e9ee" stroke="#0b0d12" stroke-width="2"/>
  <text x="40" y="21" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#0b0d12">RC-2077</text>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  const bx = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at, ...o });
  const cyl = (r1: number, r2: number, h: number, col: any, at: number[], dir: number[], seg = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, seg), col, { at, dir, ...o });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });

  // ---------- hull ----------
  b.extrude(
    [
      [-2.8, 0.5],
      [2.55, 0.5],
      [2.9, 0.62],
      [2.95, 1.1],
      [2.6, 1.45],
      [1.3, 1.5],
      [-2.8, 1.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, bevel: 0.03, color: BODY },
  );
  b.extrude(
    [
      [-2.5, 1.5],
      [1.25, 1.5],
      [0.6, 2.4],
      [-2.4, 2.5],
      [-2.6, 2.2],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: ARMOR },
  );

  // windshield
  bx(1.7, 1.1, 0.04, "#ffffff", [0, 1.95 + 0.017, 0.925 + 0.024], { rotation: [-35.9, 0, 0], texture: GLASS });
  bx(1.8, 0.07, 0.07, DARK, [0, 1.52, 1.2]);
  bx(1.8, 0.07, 0.06, DARK, [0, 2.42, 0.58]);

  // hood vents & details
  for (let i = 0; i < 4; i++) bx(0.9, 0.025, 0.07, DARK, [0, 1.515, 1.55 + i * 0.22]);
  bx(0.02, 0.26, 2.9, DARK, [0, 1.65, -1.25], { }); // roof-center seam hidden slightly
  b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), DARK, { at: [0, 0, 0] });

  for (const s of [1, -1]) {
    // side windows with cage bars
    bx(0.03, 0.4, 1.2, "#ffffff", [s * 0.955, 1.98, 0.1], { texture: GLASS });
    for (let i = 0; i < 4; i++) bx(0.03, 0.42, 0.03, STEEL, [s * 0.97, 1.98, -0.4 + i * 0.33]);
    bx(0.04, 0.04, 1.26, STEEL, [s * 0.97, 2.2, 0.1]);
    bx(0.04, 0.04, 1.26, STEEL, [s * 0.97, 1.78, 0.1]);
    // logos and text
    plane(1.5, 0.75, LOGO, [s * 0.955, 1.95, -1.55], [s, 0, 0], { mirror: false });
    plane(1.5, 0.22, SIDETEXT, [s * 1.005, 1.33, -0.92], [s, 0, 0]);
    // door seams
    bx(0.02, 0.9, 0.025, DARK, [s * 0.96, 1.95, 0.85]);
    bx(0.02, 0.9, 0.025, DARK, [s * 0.96, 1.95, -0.65]);
    bx(0.03, 0.05, 0.22, STEEL, [s * 0.97, 1.7, 0.7]); // handle
    // mirrors
    bx(0.04, 0.04, 0.35, STEEL, [s * 1.05, 2.05, 0.8]);
    bx(0.07, 0.36, 0.22, GUN, [s * 1.2, 2.02, 0.78]);
    bx(0.01, 0.3, 0.17, CYAN, [s * 1.2, 2.02, 0.78 + 0.0], { });
    // spotlights on pillars
    glow(cyl(0.09, 0.09, 0.12, WHITE, [s * 0.95, 2.28, 0.65], [0, 0.2, 1], 8), 2);
    cyl(0.12, 0.12, 0.1, GUN, [s * 0.95, 2.27, 0.6], [0, 0.2, 1], 8);

    // wheel arches/fenders
    for (const z of [1.85, 0, -1.85]) {
      bx(0.62, 0.07, 1.4, ARMOR, [s * 1.2, 1.17, z]);
      bx(0.07, 0.3, 1.4, ARMOR, [s * 1.5, 1.04, z]);
      // wheel
      cyl(0.55, 0.55, 0.46, TIRE, [s * 1.2, 0.54, z], [1, 0, 0], 14);
      cyl(0.34, 0.34, 0.5, METAL, [s * 1.2, 0.54, z], [1, 0, 0], 10);
      glow(b.part(new THREE.TorusGeometry(0.37, 0.03, 5, 16), CYAN, { at: [s * 1.45, 0.54, z], dir: [1, 0, 0], axis: "z" }), 1.8);
      cyl(0.12, 0.12, 0.54, GUN, [s * 1.2, 0.54, z], [1, 0, 0], 8);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.025, 0.025, 0.06, STEEL, [s * 1.46, 0.54 + Math.sin(a) * 0.21, z + Math.cos(a) * 0.21], [1, 0, 0], 5);
      }
    }
    // side steps
    bx(0.22, 0.05, 0.7, STEEL, [s * 1.08, 0.66, 0.95]);
    // underglow strips
    for (const z of [0.92, -0.92]) glow(bx(0.05, 0.05, 0.75, MAG, [s * 0.98, 0.5, z]), 2.2);
    // rear neon stripes
    glow(bx(0.04, 0.7, 0.04, CYAN, [s * 1.012, 1.0, -2.45]), 2);
    // headlights
    glow(bx(0.7, 0.13, 0.05, "#e9fdff", [s * 0.62, 1.28, 2.77], { rotation: [-45, 0, 0] }), 2.5);
    glow(bx(0.7, 0.03, 0.05, CYAN, [s * 0.62, 1.12, 2.93], { rotation: [-45, 0, 0] }), 2);
    // bumper posts & bolts
    bx(0.14, 0.5, 0.2, GUN, [s * 1.0, 0.75, 3.0]);
    for (let k = 0; k < 5; k++) cyl(0.025, 0.025, 0.03, STEEL, [s * (0.15 + k * 0.2), 0.88, 3.115], [0, 0, 1], 6);
    // rear exhaust stacks
    cyl(0.08, 0.08, 1.9, "#4a3b2f", [s * 0.88, 1.55, -2.9], [0, 1, 0], 8);
    cyl(0.1, 0.1, 0.1, STEEL, [s * 0.88, 2.52, -2.9], [0, 1, 0], 8);
    cyl(0.1, 0.1, 0.08, STEEL, [s * 0.88, 1.0, -2.9], [0, 1, 0], 8);
    // rear tail lights
    glow(bx(0.5, 0.12, 0.04, RED, [s * 0.55, 1.28, -2.82]), 2.2);
    // roof strobe pods
    glow(bx(0.3, 0.12, 0.16, s > 0 ? BLUE : RED, [s * 0.78, 2.53, -2.35]), 2.4);
    // loudspeaker horns
    cyl(0.17, 0.07, 0.32, STEEL, [s * 0.55, 2.62, -0.2], [0, 0.15, 1], 8);
    bx(0.12, 0.2, 0.12, GUN, [s * 0.55, 2.52, -0.35]);
    // smoke grenade launchers on cabin front corners
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++)
        cyl(0.045, 0.045, 0.28, GUN, [s * (0.45 + c * 0.11), 1.56 + r * 0.0, 1.5 - r * 0.12 - 0.0], [0, 0.35, 1], 6);
  }

  // ---------- front bumper / ram ----------
  bx(2.3, 0.4, 0.18, "#ffffff", [0, 0.72, 3.02], { texture: HAZARD });
  bx(2.0, 0.12, 0.3, GUN, [0, 0.46 + 0.1, 3.03]);
  for (let i = -5; i <= 5; i++) cyl(0.028, 0.028, 0.5, STEEL, [i * 0.2, 0.7, 3.2], [0, 1, 0], 6);
  bx(2.1, 0.05, 0.05, STEEL, [0, 0.96, 3.2]);
  bx(2.1, 0.05, 0.05, STEEL, [0, 0.46, 3.2]);
  glow(bx(1.9, 0.05, 0.04, CYAN, [0, 0.95, 3.125]), 2.4);
  bx(0.36, 0.13, 0.02, "#ffffff", [0, 0.55, 3.34], { texture: PLATE });
  // winch
  cyl(0.1, 0.1, 0.5, STEEL, [0, 0.52, 3.0], [1, 0, 0], 8);

  // ---------- rear ----------
  plane(1.7, 0.55, LED, [0, 2.0, -2.81], [0, 0, -1]);
  glow(b.part(new THREE.PlaneGeometry(1.7, 0.55), "#ffffff", { at: [0, 2.0, -2.805], dir: [0, 0, -1], axis: "z", texture: LED }), 1.6);
  bx(1.9, 0.5, 0.08, "#ffffff", [0, 0.8, -2.83], { texture: HAZARD });
  bx(0.03, 1.0, 0.04, DARK, [0, 1.0, -2.81]);
  bx(0.16, 0.05, 0.05, STEEL, [0.15, 1.5, -2.84]);
  glow(bx(1.6, 0.06, 0.04, RED, [0, 1.62, -2.82]), 2.0);
  bx(0.32, 0.12, 0.02, "#ffffff", [0, 1.12, -2.83], { texture: PLATE });

  // ---------- neon light bars ----------
  bx(1.8, 0.16, 0.3, GUN, [0, 2.5, 0.45]);
  const cols = [CYAN, MAG, CYAN, MAG];
  for (let i = 0; i < 4; i++) {
    const x = -0.6 + i * 0.4;
    glow(bx(0.37, 0.1, 0.03, cols[i], [x, 2.5, 0.61]), 2.6);
    glow(bx(0.37, 0.03, 0.2, cols[i], [x, 2.595, 0.45]), 2.6);
  }
  glow(bx(0.05, 0.1, 0.24, RED, [-0.93, 2.5, 0.45]), 2.4);
  glow(bx(0.05, 0.1, 0.24, BLUE, [0.93, 2.5, 0.45]), 2.4);
  // rear roof bar
  bx(1.5, 0.1, 0.18, GUN, [0, 2.57, -2.45]);
  for (let i = 0; i < 5; i++) glow(bx(0.26, 0.06, 0.02, i % 2 ? BLUE : RED, [-0.6 + i * 0.3, 2.57, -2.545]), 2.4);
  // underbody glow
  glow(bx(1.7, 0.03, 4.8, MAG, [0, 0.485, 0]), 1.4);
  // roof sensor ball + antennas
  b.part(new THREE.SphereGeometry(0.15, 8, 6), GUN, { at: [-0.7, 2.58, 0.05] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [-0.7, 2.6, 0.18] }), 3);
  b.rod([0.75, 2.5, -1.75], [0.8, 3.7, -1.9], 0.012, STEEL);
  b.rod([-0.75, 2.5, -1.75], [-0.85, 3.4, -1.9], 0.012, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), RED, { at: [0.8, 3.72, -1.9] }), 3);

  // ---------- water cannon ----------
  const TZ = -0.85;
  b.lathe(
    [
      [0, 0],
      [0.45, 0],
      [0.45, 0.1],
      [0.32, 0.18],
      [0.3, 0.3],
      [0, 0.3],
    ],
    { at: [0, 2.49, TZ], segments: 12, color: METAL },
  );
  glow(b.part(new THREE.TorusGeometry(0.44, 0.02, 4, 18), CYAN, { at: [0, 2.6, TZ], dir: [0, 1, 0], axis: "z", rotation: [90, 0, 0] }), 2);
  bx(0.8, 0.5, 0.9, ARMOR, [0, 2.95, TZ]);
  bx(0.84, 0.1, 0.6, GUN, [0, 3.22, TZ]);
  for (const s of [1, -1]) {
    bx(0.04, 0.3, 0.5, "#ffffff", [s * 0.42, 2.95, TZ], { texture: HAZARD });
    cyl(0.09, 0.09, 0.14, STEEL, [s * 0.46, 3.0, TZ - 0.1], [1, 0, 0], 8);
  }
  const d = new THREE.Vector3(0, 0.1, 1).normalize();
  const t0 = new THREE.Vector3(0, 3.0, TZ + 0.2);
  const t1 = t0.clone().addScaledVector(d, 1.6);
  b.rod(t0, t1, 0.13, METAL);
  for (let i = 0; i < 4; i++) {
    const c = t0.clone().addScaledVector(d, 0.3 + i * 0.4);
    cyl(0.16, 0.16, 0.07, i % 2 ? GUN : YEL, [c.x, c.y, c.z], [d.x, d.y, d.z], 10);
  }
  const nz = t1.clone().addScaledVector(d, 0.14);
  cyl(0.2, 0.14, 0.28, GUN, [nz.x, nz.y, nz.z], [d.x, d.y, d.z], 10);
  const tip = t1.clone().addScaledVector(d, 0.3);
  glow(cyl(0.12, 0.12, 0.04, CYAN, [tip.x, tip.y, tip.z], [d.x, d.y, d.z], 10), 3);
  glow(cyl(0.2, 0.2, 0.03, MAG, [nz.x, nz.y, nz.z], [d.x, d.y, d.z], 10), 1.5);
  // sights
  bx(0.1, 0.12, 0.3, GUN, [0.22, 3.33, TZ + 0.2]);
  glow(bx(0.06, 0.06, 0.02, RED, [0.22, 3.33, TZ + 0.36]), 3);

  // ---------- water tank ----------
  const TKZ = -2.05;
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 1.6, 12), "#ffffff", { at: [0, 2.85, TKZ], dir: [1, 0, 0], texture: TANK });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.34, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
      at: [s * 0.8, 2.85, TKZ],
      dir: [s, 0, 0],
    });
    glow(cyl(0.355, 0.355, 0.05, CYAN, [s * 0.55, 2.85, TKZ], [1, 0, 0], 12), 1.8);
  }
  for (const x of [-0.4, 0.4]) bx(0.08, 0.28, 0.5, GUN, [x, 2.62, TKZ]);
  // hoses
  b.sweep(
    [
      [0.55, 2.85, TKZ + 0.3],
      [0.62, 2.9, -1.5],
      [0.5, 3.0, -1.1],
      [0.3, 3.0, TZ - 0.4],
    ],
    0.04,
    { color: "#16181f" },
  );
  b.sweep(
    [
      [-0.55, 2.85, TKZ + 0.3],
      [-0.65, 2.7, -1.5],
      [-0.5, 2.8, -1.1],
      [-0.3, 2.9, TZ - 0.4],
    ],
    0.04,
    { color: "#16181f" },
  );

  return b.root;
}
```