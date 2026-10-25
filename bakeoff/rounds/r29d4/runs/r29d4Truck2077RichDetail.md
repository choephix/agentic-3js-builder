```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Warhauler 2077",
  description: "Low-poly cyberpunk armored 6x6 military truck with neon trim, turret, missile pods and stencilled decals.",
};

// ---------- palette ----------
const DARK = "#0d0f14";
const GUN = "#2a2f38";
const GLASS = "#0f2a35";
const RUBBER = "#15161a";
const CYAN = "#19f0ff";
const MAG = "#ff2bb8";
const AMBER = "#ffb21a";
const RED = "#ff2a2a";
const WARN = "#e8c21a";
const OLIVE = "#4a5238";

// ---------- paints ----------
const ARMOR = panelled(
  paint((p, n) => {
    const base = mix("#2c323b", "#3d4652", noise(p, 0.5, 4));
    const dirt = smoothstep(0.5, 0.0, p.y) * 0.5 + smoothstep(0.62, 0.8, noise(p, 0.12, 9)) * 0.25;
    const top = smoothstep(0.3, 1, n.y) * 0.18;
    const c = mix(mix(base, "#4a3b2c", dirt), "#7f8fa3", top);
    return c;
  }),
  { size: 0.55, aspect: 0.8, rivets: 0.1 },
);
const PLATE = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.4, rivets: 0.08 });
const STEEL = metal("steel", { tarnish: 0.5 });
const BLUED = metal("blued");
const CAMO = paint((p, n) => {
  const v = noise(p, 0.7, 21);
  const base = v > 0.62 ? "#2b3322" : v > 0.45 ? OLIVE : "#343b3f";
  return mix(base, "#1a1d22", smoothstep(0.1, -0.7, n.y) * 0.6);
});

// ---------- textures ----------
const HAZARD = svg(
  `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#e8c21a"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 16 - 16} 32 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16 - 8} 32Z" fill="#111"/>`).join("")}<rect x="0" y="0" width="128" height="32" fill="none" stroke="#111" stroke-width="3"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><path d="M50 4 L92 28 L92 72 L50 96 L8 72 L8 28Z" fill="#10131a" stroke="${CYAN}" stroke-width="4"/><path d="M50 16 L80 33 L80 67 L50 84 L20 67 L20 33Z" fill="none" stroke="${MAG}" stroke-width="3"/><path d="M30 60 L50 25 L70 60 L50 50Z" fill="${CYAN}"/><circle cx="50" cy="62" r="6" fill="${MAG}"/><path d="M50 10 V20 M12 30 L22 36 M88 30 L78 36" stroke="${CYAN}" stroke-width="3"/></svg>`,
  { size: 256 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 200 60"><text x="100" y="44" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="42" fill="#d8dde6" stroke="#05060a" stroke-width="3" paint-order="stroke">KX-2077</text><rect x="4" y="4" width="192" height="52" fill="none" stroke="#d8dde6" stroke-width="2" stroke-dasharray="10 5"/></svg>`,
  { size: 512 },
);
const NEON = svg(
  `<svg viewBox="0 0 240 70"><rect width="240" height="70" rx="8" fill="#07090d"/><rect x="4" y="4" width="232" height="62" rx="6" fill="none" stroke="${MAG}" stroke-width="3"/><text x="120" y="45" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="${CYAN}">NEO-TAC //</text><path d="M14 58 H80 M160 58 H226" stroke="${AMBER}" stroke-width="3"/></svg>`,
  { size: 512 },
);
const HUD = svg(
  `<svg viewBox="0 0 120 70"><rect width="120" height="70" fill="#031318"/><circle cx="36" cy="35" r="26" fill="none" stroke="${CYAN}" stroke-width="2"/><circle cx="36" cy="35" r="14" fill="none" stroke="${CYAN}" stroke-width="1.5"/><path d="M36 35 L56 18" stroke="${CYAN}" stroke-width="2"/><circle cx="46" cy="42" r="3" fill="${RED}"/><path d="M70 12 H112 M70 24 H100 M70 36 H108 M70 48 H90" stroke="${CYAN}" stroke-width="3"/><path d="M8 64 L28 54 L48 60 L72 50 L112 58" stroke="${MAG}" stroke-width="2" fill="none"/></svg>`,
  { size: 256 },
);
const WARNING = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 4 L62 58 H2Z" fill="${WARN}" stroke="#111" stroke-width="4" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="20" fill="#111"/><rect x="29" y="46" width="6" height="6" fill="#111"/></svg>`,
  { size: 128 },
);
const CIRCUIT = svg(
  `<svg viewBox="0 0 128 128"><rect width="128" height="128" fill="#fff"/><g stroke="#555" stroke-width="3" fill="none"><path d="M8 20 H50 L62 32 H120 M8 60 H30 L44 74 H100 M20 120 V90 L36 80 M80 8 V50 L96 66 H124 M70 120 V100 H120"/></g><g fill="#333"><circle cx="50" cy="20" r="4"/><circle cx="120" cy="32" r="4"/><circle cx="100" cy="74" r="4"/><circle cx="36" cy="80" r="4"/><rect x="60" y="86" width="14" height="10"/></g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "warhauler2077" });

  // ---------- helpers ----------
  const box = (sx: number, sy: number, sz: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: at as any, dir: dir as any });
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], tint = "#ffffff", lit = false) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), tint, { at: at as any, dir: dir as any, axis: "z", texture: tex });
    return lit ? glow(p, 1.1) : p;
  };
  const bolts = (pts: number[][], r = 0.03, color: any = STEEL) =>
    pts.forEach((p) => b.part(new THREE.CylinderGeometry(r, r, r * 1.2, 6), color, { at: p as any, dir: [0, 0, 1] }));
  const S = [1, -1];
  const DEG = 180 / Math.PI;

  // ---------- chassis ----------
  for (const s of S) {
    box(0.22, 0.28, 6.6, PLATE, [s * 0.7, 0.82, 0]);
    box(0.06, 0.2, 6.5, BLUED, [s * 0.82, 0.82, 0]);
    // underglow
    glow(box(0.06, 0.05, 5.4, CYAN, [s * 0.95, 0.5, 0.0]), 1.2);
    // fuel tank with straps
    cyl(0.26, 0.26, 1.3, 10, STEEL, [s * 0.92, 0.55, 0.45], [0, 0, 1]);
    for (const z of [-0.1, 1.0]) box(0.56, 0.06, 0.07, DARK, [s * 0.92, 0.55, z]);
    glow(box(0.04, 0.04, 0.5, AMBER, [s * 1.2, 0.3, 0.45]), 1);
  }
  for (const z of [-3.0, -1.8, -0.4, 0.8, 2.0, 3.0]) box(1.5, 0.18, 0.2, GUN, [0, 0.8, z]);
  box(1.0, 0.3, 1.2, DARK, [0, 0.62, 1.2]); // transfer case
  cyl(0.07, 0.07, 6.0, 8, STEEL, [0, 0.55, 0], [0, 0, 1]); // driveshaft

  // ---------- wheels ----------
  const axles = [2.3, -1.0, -2.5];
  for (const z of axles) {
    cyl(0.1, 0.1, 2.9, 8, DARK, [0, 0.62, z], [1, 0, 0]);
    box(0.5, 0.3, 0.3, BLUED, [0, 0.62, z]); // diff
    for (const s of S) {
      const x = s * 1.3;
      cyl(0.62, 0.62, 0.5, 14, RUBBER, [x, 0.62, z], [1, 0, 0]);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        box(0.52, 0.05, 0.16, DARK, [x, 0.62 + 0.63 * Math.cos(a), z + 0.63 * Math.sin(a)], [a * DEG, 0, 0]);
      }
      cyl(0.4, 0.4, 0.06, 12, STEEL, [s * 1.56, 0.62, z], [s, 0, 0]);
      cyl(0.36, 0.36, 0.05, 12, GUN, [s * 1.59, 0.62, z], [s, 0, 0]);
      cyl(0.14, 0.14, 0.12, 8, BLUED, [s * 1.62, 0.62, z], [s, 0, 0]);
      glow(cyl(0.08, 0.08, 0.05, 8, CYAN, [s * 1.68, 0.62, z], [s, 0, 0]), 1.2);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.07, 6, STEEL, [s * 1.62, 0.62 + 0.24 * Math.cos(a), z + 0.24 * Math.sin(a)], [s, 0, 0]);
      }
      // spokes
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        box(0.04, 0.3, 0.07, STEEL, [s * 1.6, 0.62 + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)], [a * DEG, 0, 0]);
      }
      // wheel arch + fender
      cyl(0.72, 0.72, 0.04, 14, DARK, [s * 1.19, 0.65, z], [s, 0, 0]);
      box(0.5, 0.07, 1.4, GUN, [s * 1.3, 1.34, z]);
      box(0.5, 0.2, 0.07, GUN, [s * 1.3, 1.25, z + 0.72], [30, 0, 0]);
      box(0.5, 0.2, 0.07, GUN, [s * 1.3, 1.25, z - 0.72], [-30, 0, 0]);
      glow(box(0.05, 0.04, 0.4, AMBER, [s * 1.56, 1.38, z]), 1.2);
    }
  }
  // mud flaps
  for (const s of S) box(0.4, 0.4, 0.04, RUBBER, [s * 1.3, 0.4, -3.15]);

  // ---------- cab ----------
  b.extrude(
    [
      [0.9, 1.0],
      [3.3, 1.0],
      [3.4, 1.5],
      [3.25, 1.85],
      [2.5, 1.95],
      [1.75, 3.0],
      [0.9, 3.0],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.05, color: ARMOR },
  );
  // roof armour and rails
  box(2.4, 0.1, 0.95, PLATE, [0, 3.05, 1.35]);
  for (const s of S) box(0.08, 0.12, 0.95, STEEL, [s * 1.1, 3.1, 1.35]);
  // windshield
  box(2.0, 1.28, 0.05, GLASS, [0, 2.48, 2.13], [-35.5, 0, 0]);
  for (const s of S) box(0.07, 1.3, 0.09, GUN, [s * 1.02, 2.48, 2.12], [-35.5, 0, 0]);
  box(2.1, 0.07, 0.12, GUN, [0, 2.97, 1.78]);
  box(2.1, 0.07, 0.12, GUN, [0, 1.97, 2.52]);
  // armoured shutters on windshield top
  box(2.0, 0.12, 0.2, DARK, [0, 2.9, 1.86], [-35.5, 0, 0]);
  // glowing dash HUD seen through glass
  decal(HUD, 0.9, 0.5, [0.0, 2.1, 2.1], [0, 0.5, 0.85], "#ffffff", true);
  for (const s of S) {
    box(0.05, 0.75, 0.95, GLASS, [s * 1.17, 2.5, 1.5]);
    box(0.1, 0.07, 1.05, GUN, [s * 1.17, 2.9, 1.5]);
    box(0.1, 0.07, 1.05, GUN, [s * 1.17, 2.1, 1.5]);
    box(0.1, 0.8, 0.07, GUN, [s * 1.17, 2.5, 2.0]);
    box(0.12, 0.1, 0.35, DARK, [s * 1.2, 1.7, 1.55]); // door handle
    bolts([[s * 1.18, 2.1, 1.0], [s * 1.18, 2.9, 1.0]].map((p) => [p[0], p[1], p[2]]));
    // mirrors
    box(0.05, 0.05, 0.4, DARK, [s * 1.35, 2.45, 2.25]);
    box(0.08, 0.34, 0.22, GUN, [s * 1.48, 2.45, 2.25]);
    glow(box(0.02, 0.28, 0.16, CYAN, [s * 1.5, 2.45, 2.25]), 0.8);
    // side plate with stencil & warning
    decal(WARNING, 0.3, 0.3, [s * 1.175, 1.4, 1.15], [s, 0, 0]);
    // headlights
    box(0.5, 0.28, 0.14, DARK, [s * 0.85, 1.6, 3.38]);
    glow(box(0.42, 0.2, 0.06, CYAN, [s * 0.85, 1.6, 3.43]), 1.6);
    box(0.5, 0.05, 0.2, GUN, [s * 0.85, 1.78, 3.42]);
    // hood vents
    for (let i = 0; i < 5; i++) box(0.55, 0.03, 0.06, DARK, [s * 0.6, 1.93 - i * 0.0, 2.75 - i * 0.12 + 0.1]);
    // shoulder armour
    box(0.18, 0.5, 1.0, PLATE, [s * 1.2, 1.4, 2.95], [0, 0, 0]);
    // exhaust stack
    cyl(0.1, 0.1, 2.6, 8, STEEL, [s * 1.0, 2.3, 0.72]);
    for (const y of [1.3, 2.0, 2.7]) cyl(0.13, 0.13, 0.08, 8, GUN, [s * 1.0, y, 0.72]);
    cyl(0.14, 0.1, 0.2, 8, DARK, [s * 1.0, 3.62, 0.72]);
    glow(cyl(0.08, 0.08, 0.04, 8, AMBER, [s * 1.0, 3.7, 0.72]), 1.5);
    // antenna
    cyl(0.015, 0.015, 1.1, 5, DARK, [s * 0.5, 3.6, 1.0]);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [s * 0.5, 4.15, 1.0] }), 2);
    // pneumatic tank on side of bed
  }
  // hood centre scoop & grille
  box(0.9, 0.16, 0.9, PLATE, [0, 2.05, 2.7], [8, 0, 0]);
  box(0.7, 0.06, 0.7, DARK, [0, 2.15, 2.75], [8, 0, 0]);
  box(1.3, 0.55, 0.1, DARK, [0, 1.3, 3.38]);
  for (let i = 0; i < 6; i++) box(1.3, 0.025, 0.04, STEEL, [0, 1.1 + i * 0.09, 3.45]);
  glow(box(1.9, 0.05, 0.05, MAG, [0, 1.8, 3.42]), 1.5);
  decal(EMBLEM, 0.34, 0.34, [0, 1.48, 3.44], [0, 0, 1], "#ffffff", true);
  // bull bar bumper
  box(2.9, 0.38, 0.35, PLATE, [0, 0.72, 3.4]);
  box(2.95, 0.12, 0.38, GUN, [0, 0.95, 3.4]);
  for (let i = -3; i <= 3; i++)
    b.part(new THREE.ConeGeometry(0.07, 0.3, 5), STEEL, { at: [i * 0.4, 0.72, 3.7], dir: [0, 0, 1] });
  decal(HAZARD, 1.0, 0.25, [0, 0.72, 3.585], [0, 0, 1]);
  for (const s of S) {
    box(0.1, 0.9, 0.12, GUN, [s * 0.6, 1.35, 3.5], [0, 0, 0]);
    glow(box(0.3, 0.06, 0.06, AMBER, [s * 1.2, 0.95, 3.6]), 1.4);
  }
  // winch
  cyl(0.12, 0.12, 0.7, 8, BLUED, [0, 0.62, 3.58], [1, 0, 0]);
  // roof light bar
  box(1.8, 0.1, 0.2, DARK, [0, 3.18, 1.7]);
  for (let i = 0; i < 6; i++)
    glow(box(0.26, 0.07, 0.1, i % 2 ? MAG : CYAN, [-0.75 + i * 0.3, 3.2, 1.78]), 1.6);
  // sensor dome + radar
  b.part(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), BLUED, { at: [0.55, 3.1, 1.15] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), CYAN, { at: [0.55, 3.28, 1.35] }), 1.5);
  cyl(0.03, 0.03, 0.4, 5, DARK, [-0.55, 3.3, 1.1]);
  box(0.5, 0.3, 0.04, STEEL, [-0.55, 3.55, 1.1], [0, 0, 0]);

  // ---------- cargo container ----------
  const cz = -1.35;
  box(2.4, 1.9, 3.9, ARMOR, [0, 1.95, cz]);
  box(2.5, 0.12, 4.0, PLATE, [0, 2.95, cz]);
  box(2.5, 0.14, 4.0, GUN, [0, 0.98, cz]);
  b.part(new THREE.PlaneGeometry(2.0, 3.4), "#9aa7b8", { at: [0, 3.02, cz], dir: [0, 1, 0], axis: "z", texture: CIRCUIT });
  for (const s of S) {
    for (let i = 0; i < 6; i++) {
      const z = cz - 1.75 + i * 0.7;
      box(0.1, 1.9, 0.14, PLATE, [s * 1.23, 1.95, z]);
      bolts([[s * 1.3, 1.2, z], [s * 1.3, 2.7, z]].map((p) => [p[0], p[1], p[2]]));
    }
    box(0.12, 0.1, 4.0, GUN, [s * 1.24, 2.88, cz]);
    box(0.12, 0.1, 4.0, GUN, [s * 1.24, 1.05, cz]);
    glow(box(0.04, 0.05, 3.7, s > 0 ? CYAN : MAG, [s * 1.3, 1.15, cz]), 1.5);
    glow(box(0.04, 0.05, 3.7, s > 0 ? MAG : CYAN, [s * 1.3, 2.8, cz]), 1.5);
    decal(STENCIL, 1.3, 0.4, [s * 1.285, 2.45, cz - 0.6], [s, 0, 0]);
    decal(EMBLEM, 0.75, 0.75, [s * 1.285, 1.8, cz + 0.55], [s, 0, 0], "#ffffff", true);
    decal(NEON, 1.2, 0.35, [s * 1.285, 1.75, cz - 1.0], [s, 0, 0], "#ffffff", true);
    decal(WARNING, 0.3, 0.3, [s * 1.285, 1.3, cz - 1.6], [s, 0, 0]);
    // service hatch
    box(0.06, 0.6, 0.5, GUN, [s * 1.26, 1.45, cz - 0.1]);
    box(0.08, 0.1, 0.12, STEEL, [s * 1.3, 1.45, cz]);
    // armour skirts and cable conduit
    cyl(0.04, 0.04, 3.5, 6, DARK, [s * 1.32, 2.65, cz], [0, 0, 1]);
    // missile pods on the roof
    box(0.7, 0.5, 1.4, PLATE, [s * 0.6, 3.3, cz + 0.8], [-8, 0, 0]);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const px = s * 0.6 - 0.22 + c * 0.22;
        const py = 3.2 + r * 0.22;
        b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 8), DARK, { at: [px, py + 0.03, cz + 1.5], dir: [0, 0.14, 1] });
        glow(b.part(new THREE.ConeGeometry(0.05, 0.1, 6), RED, { at: [px, py + 0.04, cz + 1.46], dir: [0, 0.14, 1] }), 0.8);
      }
    decal(WARNING, 0.2, 0.2, [s * 0.6, 3.56, cz + 0.4], [0, 1, 0]);
    // cooling radiators on sides of roof
    for (let i = 0; i < 4; i++) box(0.05, 0.14, 0.9, STEEL, [s * 1.0, 3.12 + i * 0.0, cz - 1.0 - i * 0.0 - 0 + (i - 1.5) * 0.0]);
  }
  // rear door
  box(2.3, 1.7, 0.12, PLATE, [0, 1.95, cz - 1.97]);
  box(0.06, 1.7, 0.16, DARK, [0, 1.95, cz - 2.0]);
  for (const s of S) {
    for (const y of [1.3, 2.6]) box(0.14, 0.14, 0.2, STEEL, [s * 1.1, y, cz - 2.05]);
    box(0.08, 0.5, 0.12, STEEL, [s * 0.15, 1.95, cz - 2.08]);
    glow(box(0.35, 0.22, 0.08, RED, [s * 1.0, 1.3, cz - 2.04]), 1.6);
  }
  decal(HAZARD, 2.0, 0.4, [0, 2.65, cz - 2.04], [0, 0, -1]);
  decal(EMBLEM, 0.8, 0.8, [0, 1.9, cz - 2.04], [0, 0, -1], "#ffffff", true);
  decal(STENCIL, 1.0, 0.3, [0, 1.3, cz - 2.04], [0, 0, -1]);
  // rear bumper & tow
  box(2.8, 0.35, 0.3, PLATE, [0, 0.75, -3.45]);
  decal(HAZARD, 2.4, 0.2, [0, 0.75, -3.605], [0, 0, -1]);
  cyl(0.06, 0.06, 0.3, 8, STEEL, [0, 0.95, -3.6], [0, 0, 1]);
  b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), STEEL, { at: [0, 0.95, -3.78] });
  // coupling gap
  box(1.8, 0.5, 0.35, BLUED, [0, 1.25, 0.75]);
  cyl(0.05, 0.05, 1.8, 6, DARK, [0, 1.6, 0.75], [1, 0, 0]);
  // rear antenna / dish
  b.part(new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
    at: [-0.3, 3.4, cz - 1.5],
    rotation: [-60, 0, 0],
  });
  cyl(0.03, 0.03, 0.5, 5, DARK, [-0.3, 3.2, cz - 1.5]);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), MAG, { at: [-0.3, 3.65, cz - 1.7] }), 2);

  // ---------- roof turret ----------
  const tz = cz + 0.2;
  cyl(0.45, 0.5, 0.15, 10, GUN, [0.0, 3.1, tz + 0.0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.025, 0.025, 0.06, 5, STEEL, [Math.cos(a) * 0.4, 3.2, tz + Math.sin(a) * 0.4]);
  }
  cyl(0.32, 0.32, 0.22, 8, CAMO, [0, 3.3, tz]);
  box(0.62, 0.34, 0.7, PLATE, [0, 3.58, tz]);
  box(0.64, 0.1, 0.4, GUN, [0, 3.78, tz - 0.05], [-6, 0, 0]);
  for (const s of S) {
    cyl(0.045, 0.045, 1.3, 6, DARK, [s * 0.18, 3.58, tz + 0.95], [0, 0, 1]);
    cyl(0.07, 0.07, 0.3, 6, STEEL, [s * 0.18, 3.58, tz + 0.5], [0, 0, 1]);
    cyl(0.065, 0.065, 0.12, 6, GUN, [s * 0.18, 3.58, tz + 1.63], [0, 0, 1]);
    box(0.28, 0.3, 0.3, OLIVE, [s * 0.46, 3.55, tz - 0.1]);
    glow(box(0.03, 0.03, 0.03, AMBER, [s * 0.18, 3.58, tz + 1.7]), 2);
  }
  box(0.2, 0.2, 0.2, BLUED, [0, 3.82, tz + 0.25]);
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { at: [0, 3.82, tz + 0.36] }), 1.8);

  // ---------- tail lights ----------
  for (const s of S) {
    glow(box(0.5, 0.12, 0.06, RED, [s * 0.95, 0.75, -3.62]), 1.6);
    glow(box(0.1, 0.5, 0.05, RED, [s * 1.22, 1.5, -3.34]), 1.3);
  }

  b.root.name = "warhauler2077";
  return b.root;
}
```