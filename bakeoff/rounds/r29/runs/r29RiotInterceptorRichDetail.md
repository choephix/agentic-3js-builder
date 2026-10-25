```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "NeoGard Riot Interceptor",
  description: "Armored corporate riot-control truck with a roof water cannon, neon light bars and glowing visors, in a Cyberpunk 2077 style.",
};

const CYAN = "#00f0ff";
const MAG = "#ff2a9d";
const YEL = "#fcee0a";
const DARK = "#0d0f16";
const GUN = "#232836";
const STEEL = "#5a6274";

// Textures
const LOGO = svg(`<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#0a0c14" stroke="#00f0ff" stroke-width="5"/><path d="M30 70 V30 L70 70 V30" fill="none" stroke="#ff2a9d" stroke-width="9" stroke-linejoin="miter"/><path d="M30 70 V30 L70 70 V30" fill="none" stroke="#fff" stroke-width="2"/></svg>`, { size: 128 });
const STENCIL = svg(`<svg viewBox="0 0 400 90"><text x="200" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#0b0b10" stroke="#0b0b10" stroke-width="6">RIOT CONTROL</text><text x="200" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#f2f6ff">RIOT CONTROL</text><text x="200" y="80" text-anchor="middle" font-family="monospace" font-size="26" fill="#00f0ff">NEOGARD // UNIT 07</text></svg>`, { size: 512 });
const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#fcee0a"/><g fill="#0b0b10"><polygon points="0,16 8,0 16,0 8,16"/><polygon points="16,16 24,0 32,0 24,16"/><polygon points="32,16 40,0 48,0 40,16"/><polygon points="48,16 56,0 64,0 56,16"/></g></svg>`, { size: 256 });
const PLATE = svg(`<svg viewBox="0 0 60 30"><rect width="60" height="30" rx="3" fill="#e8e8f0" stroke="#111" stroke-width="2"/><text x="30" y="21" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#111">NG-2077</text></svg>`, { size: 128 });
const VISOR = svg(`<svg viewBox="0 0 100 30"><rect width="100" height="30" fill="#05070c"/><rect x="6" y="9" width="36" height="12" rx="3" fill="#00f0ff"/><rect x="58" y="9" width="36" height="12" rx="3" fill="#00f0ff"/><rect x="10" y="12" width="28" height="3" fill="#e8ffff"/><rect x="62" y="12" width="28" height="3" fill="#e8ffff"/></svg>`, { size: 256 });
const CIRCUIT = svg(`<svg viewBox="0 0 100 40"><path d="M0 30 H30 L40 20 H70 L80 10 H100 M0 10 H20 L30 4 H50 M50 36 H90" fill="none" stroke="#00f0ff" stroke-width="2.5"/><circle cx="30" cy="30" r="3" fill="#ff2a9d"/><circle cx="70" cy="20" r="3" fill="#ff2a9d"/></svg>`, { size: 256 });
const TANK = svg(`<svg viewBox="0 0 20 60"><rect width="20" height="60" fill="#04121c"/><rect y="18" width="20" height="42" fill="#27b8ff"/><rect y="18" width="20" height="4" fill="#e8ffff"/><g stroke="#fff" stroke-width="1"><path d="M0 10H8M0 30H8M0 50H8"/></g></svg>`, { size: 128 });

const BODY = paint((p, n) => {
  const grime = noise(p, 0.3, 4);
  let c = p.y > 1.38 ? mix("#d4d9e4", "#9aa3b6", grime * 0.6) : mix("#232836", "#141824", grime);
  if (Math.abs(p.y - 1.38) < 0.03) c = mix(c, "#00f0ff", 0.9);
  if (p.y < 0.9) c = mix(c, "#2a2620", 0.5 * smoothstep(0.9, 0.6, p.y));
  const k = 0.82 + 0.18 * smoothstep(-0.8, 0.5, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});
const ARMOR = paint((p, n) => {
  const c = mix("#2c3242", "#171b26", noise(p, 0.2, 9));
  const k = 0.8 + 0.2 * smoothstep(-0.8, 0.6, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});

export default function build() {
  const b = createBuilder({ name: "interceptor" });

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: any, opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...opt });
  const cyl = (r0: number, r1: number, h: number, seg: number, at: number[], dir: number[], color: any) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, dir });
  const plane = (w: number, h: number, at: number[], dir: number[], tex: any, g = 0, up?: number[]) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });
    if (g) glow(p, g);
    return p;
  };

  // Main body: side profile extruded across the width
  b.extrude(
    [
      [-2.7, 0.6], [-2.7, 2.1], [0.3, 2.15], [1.5, 1.65], [2.7, 1.5], [2.78, 1.1], [2.7, 0.6],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.03, color: BODY },
  );
  // chassis & skirts
  box(2.0, 0.3, 5.2, 0, 0.5, 0, DARK);
  for (const s of [1, -1]) {
    box(0.08, 0.28, 2.0, s * 1.12, 0.72, -0.2, ARMOR);
    box(0.06, 0.05, 4.4, s * 1.12, 0.66, 0, CYAN, {}).mesh && glow(box(0.04, 0.04, 4.2, s * 1.14, 0.62, 0, CYAN), 1.6);
  }

  // Windshield & windows
  const ang = (Math.atan2(0.5, 1.2) * 180) / Math.PI;
  const wl = Math.hypot(1.2, 0.5) - 0.2;
  glow(b.part(new THREE.BoxGeometry(1.9, 0.03, wl), "#0a2a3a", { at: [0, 1.93 + 0.02, 0.9 + 0.01], rotation: [ang, 0, 0] }), 0.5);
  box(2.0, 0.06, 0.06, 0, 2.08, 0.38, DARK);
  for (const s of [1, -1]) {
    glow(box(0.03, 0.4, 1.0, s * 1.11, 1.82, 0.45, "#0a2a3a"), 0.4);
    box(0.05, 0.46, 0.06, s * 1.11, 1.82, -0.1, DARK);
    plane(1.6, 0.45, [s * 1.12, 1.62, -1.1], [s, 0, 0], STENCIL, 0.0);
    plane(0.5, 0.5, [s * 1.12, 1.0, 0.55], [s, 0, 0], LOGO, 1.0);
    plane(1.4, 0.55, [s * 1.12, 0.95, -1.3], [s, 0, 0], CIRCUIT, 1.4);
    box(0.05, 0.5, 0.9, s * 1.12, 1.25, 0.55, ARMOR); // door armor
    box(0.06, 0.04, 0.2, s * 1.14, 1.25, 0.25, STEEL); // handle
    // mirror
    box(0.18, 0.2, 0.08, s * 1.25, 1.85, 0.9, DARK);
    box(0.04, 0.04, 0.3, s * 1.2, 1.78, 0.85, STEEL);
  }

  // Front: bumper ram, grille visor, headlights
  box(2.4, 0.4, 0.35, 0, 0.8, 2.85, ARMOR);
  plane(2.2, 0.35, [0, 0.8, 3.035], [0, 0, 1], HAZARD);
  for (const s of [1, -1]) {
    box(0.14, 0.7, 0.3, s * 0.9, 1.0, 2.9, STEEL);
    box(0.3, 0.3, 0.3, s * 1.15, 0.55, 2.7, ARMOR);
    glow(box(0.5, 0.08, 0.04, s * 0.8, 1.32, 2.8, "#e8ffff"), 2);
    glow(box(0.14, 0.14, 0.04, s * 1.05, 0.95, 2.97, YEL), 1.5);
  }
  plane(1.5, 0.45, [0, 1.15, 2.81], [0, 0, 1], VISOR, 1.2);
  box(1.6, 0.06, 0.1, 0, 1.4, 2.78, DARK);
  for (let i = -3; i <= 3; i++) box(0.04, 0.2, 0.05, i * 0.08, 0.9 + 0.0, 2.8, DARK); // vents
  plane(0.5, 0.25, [0, 0.62, 3.04], [0, 0, 1], PLATE);
  // hood detail
  box(1.2, 0.04, 0.9, 0, 1.52, 2.0, DARK);
  glow(box(1.0, 0.03, 0.04, 0, 1.55, 2.5, CYAN), 1.8);

  // Rear
  box(2.1, 0.5, 0.3, 0, 0.75, -2.8, ARMOR);
  plane(2.0, 0.4, [0, 0.75, -2.96], [0, 0, -1], HAZARD);
  box(2.0, 1.0, 0.06, 0, 1.45, -2.72, DARK);
  box(0.05, 0.95, 0.07, 0, 1.45, -2.74, STEEL);
  glow(box(1.9, 0.08, 0.05, 0, 1.95, -2.73, MAG), 2);
  for (const s of [1, -1]) {
    glow(box(0.25, 0.25, 0.05, s * 0.9, 1.1, -2.74, MAG), 1.6);
    box(0.1, 0.1, 0.1, s * 0.5, 1.5, -2.76, STEEL);
  }
  plane(0.9, 0.9, [0, 1.5, -2.77], [0, 0, -1], LOGO, 0.8);

  // Wheels
  const wheel = (s: number, z: number) => {
    const x = s * 1.1;
    cyl(0.52, 0.52, 0.4, 14, [x, 0.52, z], [1, 0, 0], "#111218");
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      box(0.42, 0.1, 0.12, x, 0.52 + Math.sin(a) * 0.54, z + Math.cos(a) * 0.54, "#181a22", { rotation: [(-a * 180) / Math.PI, 0, 0] });
    }
    cyl(0.32, 0.32, 0.44, 12, [x, 0.52, z], [1, 0, 0], STEEL);
    glow(b.part(new THREE.TorusGeometry(0.36, 0.025, 5, 20), CYAN, { at: [x + s * 0.22, 0.52, z], dir: [s, 0, 0], axis: "z" }), 1.8);
    cyl(0.08, 0.08, 0.5, 8, [x, 0.52, z], [1, 0, 0], DARK);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.025, 0.025, 0.06, 6, [x + s * 0.24, 0.52 + Math.sin(a) * 0.17, z + Math.cos(a) * 0.17], [1, 0, 0], "#c9ced9");
    }
    // arch
    box(0.12, 0.1, 1.3, s * 1.14, 1.08, z, ARMOR);
  };
  for (const s of [1, -1]) for (const z of [1.7, -1.7]) wheel(s, z);

  // Roof: light bars
  box(2.0, 0.08, 0.5, 0, 2.2, 0.0, DARK);
  const cols = [CYAN, MAG, CYAN, MAG, CYAN, MAG, CYAN, MAG];
  cols.forEach((c, i) => glow(box(0.23, 0.12, 0.42, -0.87 + i * 0.25, 2.3, 0.0, c), 2.4));
  for (const s of [1, -1]) box(0.06, 0.14, 0.5, s * 1.0, 2.27, 0, ARMOR);
  // front visor-bar
  glow(box(1.9, 0.04, 0.05, 0, 1.72, 1.68, MAG), 2);
  // side beacons
  for (const s of [1, -1]) glow(box(0.1, 0.1, 0.5, s * 1.1, 2.1, -0.4, YEL), 1.5);

  // Water tank on rear roof
  cyl(0.5, 0.5, 1.6, 12, [0, 2.45, -1.35], [1, 0, 0], GUN);
  for (const z of [-0.65, -2.05]) box(1.9, 0.12, 0.1, 0, 2.15, z, STEEL);
  for (const s of [1, -1]) {
    cyl(0.5, 0.5, 0.06, 12, [s * 0.82, 2.45, -1.35], [1, 0, 0], STEEL);
    plane(0.16, 0.5, [s * 0.86, 2.45, -1.35], [s, 0, 0], TANK, 1.2);
  }
  for (const x of [-0.5, 0, 0.5]) box(0.08, 1.05, 0.04, x, 2.45, -1.0, STEEL, { rotation: [0, 0, 0] });
  plane(1.2, 0.3, [0, 2.8, -1.35], [0, 1, 0], HAZARD, 0, [0, 0, 1]);

  // Water cannon turret
  cyl(0.3, 0.36, 0.2, 12, [0, 2.4, -0.45], [0, 1, 0], STEEL);
  cyl(0.22, 0.22, 0.4, 10, [0, 2.65, -0.45], [0, 1, 0], ARMOR);
  box(0.5, 0.3, 0.4, 0, 2.95, -0.45, GUN);
  glow(box(0.3, 0.05, 0.04, 0, 3.0, -0.24, CYAN), 2);
  cyl(0.11, 0.11, 1.6, 10, [0, 2.97, 0.5], [0, 0, 1], STEEL);
  cyl(0.15, 0.15, 0.3, 10, [0, 2.97, 0.1], [0, 0, 1], ARMOR);
  cyl(0.15, 0.1, 0.25, 10, [0, 2.97, 1.4], [0, 0, 1], GUN);
  glow(b.part(new THREE.TorusGeometry(0.11, 0.025, 5, 12), CYAN, { at: [0, 2.97, 1.55], dir: [0, 0, 1], axis: "z" }), 2);
  glow(cyl(0.06, 0.06, 0.05, 8, [0, 2.97, 1.54], [0, 0, 1], "#27b8ff"), 1.5);
  for (let i = 0; i < 4; i++) box(0.06, 0.06, 0.12, 0.0, 3.1, 0.2 + i * 0.3, i % 2 ? MAG : CYAN, {}).mesh && glow(box(0.05, 0.05, 0.1, 0, 3.12, 0.2 + i * 0.3, i % 2 ? MAG : CYAN), 1.6);
  // hose
  b.sweep([[0, 2.4, -0.7], [0.3, 2.2, -0.8], [0.4, 2.5, -0.5], [0.12, 2.9, -0.45]], 0.035, { color: DARK });
  // turret shield
  box(0.7, 0.45, 0.06, 0, 3.0, 0.0, ARMOR, { rotation: [-15, 0, 0] });

  // antennas & sensor
  for (const [x, h] of [[0.9, 0.9], [-0.95, 0.6]] as number[][]) {
    cyl(0.012, 0.012, h, 5, [x, 2.2 + h / 2, -2.3], [0, 1, 0], STEEL);
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), MAG, { at: [x, 2.2 + h, -2.3] }), 2);
  }
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0.6, 2.2, 0.7] });
  glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), CYAN, { at: [0.6, 2.3, 0.78] }), 2);

  // Rooftop handrail
  for (const s of [1, -1]) b.rod([s * 1.0, 2.2, -2.5], [s * 1.0, 2.2, -2.0], 0.025, { color: STEEL });

  return b.root;
}
```