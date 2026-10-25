import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot Interceptor",
  description: "Cyberpunk corporate riot-control interceptor with a roof water cannon, rear tank and neon light bars.",
};

const ARMOR = "#1b2233";
const ARMOR_LT = "#2c3752";
const DARK = "#0b0d13";
const STEEL = "#586075";
const WHITE = "#e8ecf2";
const YELLOW = "#f2c200";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const RED = "#ff2640";
const BLUE = "#2a5cff";
const GLASS = "#0a1a2a";

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });

  const box = (w: number, h: number, d: number, color: string, at: number[], rot?: number[], g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as [number, number, number], rotation: rot as any });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (r: number, len: number, color: string, at: number[], dir: number[], sides = 12, g = 0, r2?: number) => {
    const p = b.part(new THREE.CylinderGeometry(r2 ?? r, r, len, sides), color, {
      at: at as [number, number, number],
      dir: dir as [number, number, number],
    });
    if (g) glow(p, g);
    return p;
  };

  // ---- Hull ----
  b.extrude(
    [[-2.7, 0.5], [2.5, 0.5], [2.85, 0.75], [2.85, 1.0], [2.3, 1.3], [1.3, 1.35], [-2.7, 1.35]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, bevel: 0.03, color: ARMOR },
  );
  // Cabin
  b.extrude([[1.3, 1.3], [0.6, 2.1], [-0.2, 2.1], [-0.8, 1.3]], {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: ARMOR_LT,
  });
  // Windshield
  box(1.75, 1.02, 0.03, GLASS, [0, 1.7, 0.97], [-43, 0, 0]);
  box(1.6, 0.05, 0.03, CYAN, [0, 1.3, 1.22], [-43, 0, 0], 1.2);
  // Rear window of cabin
  box(1.5, 0.5, 0.03, GLASS, [0, 1.75, -0.55], [28, 0, 0]);

  // ---- Under body & neon ----
  box(1.9, 0.12, 5.2, DARK, [0, 0.46, 0]);
  for (const s of [1, -1]) {
    box(0.05, 0.05, 4.6, MAG, [s * 1.02, 0.5, 0], undefined, 1.6);
    box(0.06, 0.18, 1.5, DARK, [s * 1.0, 1.0, 0.0]);
    // side windows
    box(0.03, 0.55, 0.85, GLASS, [s * 0.96, 1.7, 0.2], undefined);
    box(0.03, 0.12, 0.55, CYAN, [s * 0.96, 1.42, 0.2], undefined, 0.5);
    // side skirt
    box(0.1, 0.22, 2.4, STEEL, [s * 1.02, 0.62, 0.0]);
    // door seams
    box(0.02, 0.9, 0.02, DARK, [s * 1.01, 0.95, 0.85]);
    box(0.02, 0.9, 0.02, DARK, [s * 1.01, 0.95, -0.55]);
    // mirrors
    box(0.1, 0.22, 0.25, DARK, [s * 1.12, 1.75, 0.75]);
    box(0.18, 0.04, 0.04, STEEL, [s * 1.04, 1.7, 0.8]);
    // hazard stripes on fender
    for (let i = 0; i < 4; i++) box(0.04, 0.2, 0.12, i % 2 ? DARK : YELLOW, [s * 1.01, 1.18, 1.5 + i * 0.14], [0, 0, 0]);
    // headlights and tail
    box(0.55, 0.14, 0.06, "#fff7d6", [s * 0.72, 1.0, 2.86], undefined, 2);
    box(0.4, 0.05, 0.07, CYAN, [s * 0.72, 0.88, 2.87], undefined, 1.5);
    box(0.5, 0.14, 0.05, RED, [s * 0.7, 1.15, -2.71], undefined, 1.8);
    // fenders
    box(0.3, 0.12, 1.15, ARMOR_LT, [s * 1.1, 1.1, 1.7]);
    box(0.3, 0.12, 1.15, ARMOR_LT, [s * 1.1, 1.1, -1.7]);
    // mud flaps
    box(0.04, 0.3, 0.4, DARK, [s * 1.05, 0.35, -2.25]);
    // wheels
    for (const z of [1.7, -1.7]) {
      const x = s * 1.05;
      cyl(0.55, 0.45, "#0f1014", [x, 0.55, z], [1, 0, 0], 14);
      cyl(0.33, 0.47, STEEL, [x, 0.55, z], [1, 0, 0], 10);
      cyl(0.3, 0.48, CYAN, [x + s * 0.01, 0.55, z], [1, 0, 0], 10, 1.1);
      cyl(0.24, 0.5, DARK, [x + s * 0.01, 0.55, z], [1, 0, 0], 10);
      cyl(0.1, 0.52, STEEL, [x + s * 0.02, 0.55, z], [1, 0, 0], 6);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        cyl(0.025, 0.52, WHITE, [x + s * 0.03, 0.55 + Math.sin(a) * 0.17, z + Math.cos(a) * 0.17], [1, 0, 0], 5);
      }
    }
    // corp marking planes
    const logo = svg(
      `<svg viewBox="0 0 320 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="316" height="76" fill="#0b0d13" stroke="#19f0ff" stroke-width="4"/>
        <path d="M14 66 L34 14 L54 66 Z" fill="#ff2bd6"/>
        <text x="70" y="50" font-family="sans-serif" font-weight="bold" font-size="34" fill="#e8ecf2">RIOT-SEC</text>
        <text x="72" y="70" font-family="sans-serif" font-size="14" fill="#19f0ff">CORP ENFORCEMENT</text></svg>`,
      { size: 512 },
    );
    glow(
      b.part(new THREE.PlaneGeometry(1.5, 0.375), "#ffffff", {
        at: [s * 1.013, 0.92, 0.1], dir: [s, 0, 0], axis: "z", texture: logo,
      }),
      0.8,
    );
  }

  // ---- Front: bull bar, grille, bumper ----
  box(2.1, 0.28, 0.25, DARK, [0, 0.6, 2.85]);
  box(2.0, 0.08, 0.3, YELLOW, [0, 0.78, 2.88]);
  for (const s of [-1, 0, 1]) cyl(0.05, 0.9, STEEL, [s * 0.8, 0.95, 3.0], [0, 1, 0], 6);
  box(2.2, 0.08, 0.1, STEEL, [0, 1.25, 3.0]);
  for (let i = -3; i <= 3; i++) box(0.12, 0.05, 0.04, MAG, [i * 0.2, 0.6, 2.99], undefined, 1.5);
  box(0.9, 0.04, 0.04, CYAN, [0, 1.12, 2.88], undefined, 1.2);
  // hood vents
  for (let i = 0; i < 4; i++) box(0.9, 0.025, 0.08, DARK, [0, 1.34 + i * 0.002, 1.55 - i * 0.2]);
  // plate
  box(0.5, 0.14, 0.02, WHITE, [0, 0.57, 2.99]);
  box(0.4, 0.02, 0.025, RED, [0, 0.57, 3.0]);

  // ---- Roof light bars ----
  box(1.9, 0.12, 0.3, DARK, [0, 2.17, 0.35]);
  const cols = [RED, RED, BLUE, BLUE, RED, RED, BLUE, BLUE];
  cols.forEach((c, i) => {
    box(0.2, 0.1, 0.32, c, [-0.82 + i * 0.235, 2.25, 0.35], undefined, 2.2);
  });
  box(1.9, 0.04, 0.34, WHITE, [0, 2.2, 0.35]);
  // rear light bar
  box(1.6, 0.08, 0.1, DARK, [0, 2.18, -0.35]);
  for (let i = 0; i < 4; i++) box(0.35, 0.06, 0.12, i % 2 ? BLUE : MAG, [-0.58 + i * 0.39, 2.22, -0.35], undefined, 2);

  // ---- Water cannon turret ----
  cyl(0.38, 0.1, STEEL, [0, 2.2, -0.05], [0, 1, 0], 14);
  cyl(0.3, 0.3, ARMOR, [0, 2.38, -0.05], [0, 1, 0], 10);
  box(0.55, 0.3, 0.6, ARMOR_LT, [0, 2.6, -0.05]);
  box(0.58, 0.05, 0.62, YELLOW, [0, 2.78, -0.05]);
  for (const s of [1, -1]) {
    box(0.06, 0.2, 0.3, DARK, [s * 0.31, 2.6, -0.05]);
    box(0.04, 0.05, 0.2, CYAN, [s * 0.34, 2.6, -0.05], undefined, 1.8);
  }
  const bd: [number, number, number] = [0, 0.12, 1];
  const dn = new THREE.Vector3(...bd).normalize();
  const bp = (d: number) => [0, 2.62 + dn.y * d, 0.25 + dn.z * d];
  cyl(0.11, 1.5, STEEL, bp(0.75), bd, 12);
  cyl(0.15, 0.25, DARK, bp(0.45), bd, 12);
  cyl(0.16, 0.12, YELLOW, bp(1.0), bd, 12);
  cyl(0.15, 0.3, DARK, bp(1.62), bd, 12, 0, 0.1);
  cyl(0.09, 0.04, CYAN, bp(1.79), bd, 12, 2);
  // feed hose
  b.sweep([[0, 2.55, -0.45], [0, 2.4, -0.9], [0, 2.2, -1.15]], 0.06, { color: DARK });

  // ---- Rear tank ----
  cyl(0.62, 2.1, ARMOR_LT, [0, 1.97, -1.7], [0, 0, 1], 14);
  for (const z of [-0.85, -1.7, -2.55]) {
    cyl(0.64, 0.1, STEEL, [0, 1.97, z], [0, 0, 1], 14);
    cyl(0.65, 0.04, CYAN, [0, 1.97, z + 0.14], [0, 0, 1], 14, 1.4);
  }
  cyl(0.63, 0.04, YELLOW, [0, 1.97, -2.8 + 0.05], [0, 0, 1], 14);
  box(0.4, 0.15, 0.4, STEEL, [0, 2.62, -1.7]);
  cyl(0.12, 0.08, YELLOW, [0, 2.7, -1.7], [0, 1, 0], 8);
  for (const s of [1, -1]) cyl(0.04, 1.8, STEEL, [s * 0.62, 1.7, -1.7], [0, 0, 1], 6);
  // tank label strips
  box(0.02, 0.2, 1.2, MAG, [0.62, 2.0, -1.7], undefined, 1.2);
  box(0.02, 0.2, 1.2, MAG, [-0.62, 2.0, -1.7], undefined, 1.2);
  // rear bumper & lights
  box(2.0, 0.25, 0.2, DARK, [0, 0.62, -2.75]);
  box(1.8, 0.05, 0.05, RED, [0, 0.82, -2.76], undefined, 1.8);
  // rear ladder
  for (const s of [1, -1]) cyl(0.03, 1.0, STEEL, [s * 0.3, 1.0, -2.78], [0, 1, 0], 6);
  for (let i = 0; i < 4; i++) cyl(0.025, 0.6, STEEL, [0, 0.8 + i * 0.22, -2.78], [1, 0, 0], 6);
  // antennas
  cyl(0.015, 1.1, DARK, [0.75, 2.65, -0.3], [0, 1, 0], 5);
  cyl(0.015, 0.8, DARK, [-0.75, 2.5, -0.3], [0.05, 1, 0], 5);
  b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [0.75, 3.2, -0.3] });
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), RED, { at: [0.75, 3.2, -0.3] }), 2);

  return b.root;
}
