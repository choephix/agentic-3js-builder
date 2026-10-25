import * as THREE from "three";
import { createBuilder, svg, paint, countershade } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "NCPD-style Riot Interceptor",
  description:
    "Armoured corporate riot-control truck with a roof water cannon, tank, strobe bars and neon accents, in a Cyberpunk 2077 style.",
};

// ---- palette ----
const YELLOW = "#f5e800";
const CYAN = "#19f2ff";
const MAGENTA = "#ff2bd6";
const RED = "#ff1744";
const BLUE = "#2979ff";
const DARK = "#14161f";
const NAVY = "#222838";
const BLACK = "#0a0b10";
const WHITE = "#e8f7ff";

// ---- textures ----
const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#f5e800"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#0a0b10"/>`).join("")}</svg>`,
  { size: 128 },
);
const SIDE_TEXT = svg(
  `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="240" height="60" rx="5" fill="#12141c" stroke="#f5e800" stroke-width="3"/>
  <text x="120" y="34" text-anchor="middle" font-family="Impact, sans-serif" font-weight="bold" font-size="28" fill="#f5e800" letter-spacing="3">RIOT CONTROL</text>
  <rect x="14" y="42" width="212" height="4" fill="#ff2bd6"/>
  <text x="120" y="55" text-anchor="middle" font-family="monospace" font-size="8" fill="#19f2ff">CIVIL ORDER DIVISION // UNIT 77</text>
  </svg>`,
  { size: 512 },
);
const LOGO = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#12141c" stroke="#19f2ff" stroke-width="4"/>
  <path d="M50 12 L84 31 L84 69 L50 88 L16 69 L16 31Z" fill="none" stroke="#f5e800" stroke-width="4"/>
  <path d="M30 34 H70 L38 66 H70" fill="none" stroke="#ff2bd6" stroke-width="8" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="5" fill="#19f2ff"/></svg>`,
  { size: 256 },
);
const CAGE = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="64" height="2.5" fill="#2a2f40"/><rect x="0" y="29.5" width="64" height="2.5" fill="#2a2f40"/>
  <rect x="0" y="0" width="2.5" height="32" fill="#2a2f40"/><rect x="61.5" y="0" width="2.5" height="32" fill="#2a2f40"/>
  ${[1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 8 - 1}" y="0" width="2.4" height="32" fill="#2a2f40"/>`).join("")}
  ${[1, 2, 3].map((i) => `<rect x="0" y="${i * 8 - 1}" width="64" height="2.4" fill="#2a2f40"/>`).join("")}</svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" rx="4" fill="#f5e800"/>
  <text x="50" y="28" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#12141c">RC-2077</text></svg>`,
  { size: 128 },
);
const TANK_LABEL = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" fill="#12141c" stroke="#19f2ff" stroke-width="3"/>
  <text x="50" y="27" text-anchor="middle" font-family="Impact, sans-serif" font-size="20" fill="#19f2ff">H2O // HP</text></svg>`,
  { size: 128 },
);

// ---- paints ----
const plating = panelled(countershade("#323a50", "#171a26"), { size: 0.5, aspect: 0.8, rivets: 0.08, seam: BLACK });
const BODY = paint((p, n) => {
  if (p.y > 0.86 && p.y < 1.0 && Math.abs(n.y) < 0.6) return YELLOW;
  return plating;
});
const STEEL = metal("steel", { tarnish: 0.4 });
const IRON = metal("iron");
const BLUED = metal("blued");

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  const box = (w: number, h: number, d: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: number[], dir: number[], color: any) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir });
  const plane = (w: number, h: number, at: number[], dir: number[], color: any, texture?: any, up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", texture, up });

  // ---- main hull ----
  const hull: [number, number][] = [
    [-2.6, 0.45], [2.5, 0.45], [2.75, 0.75], [2.7, 1.25], [2.2, 1.5],
    [1.3, 1.55], [0.75, 2.35], [-0.7, 2.45], [-2.6, 2.45],
  ];
  b.extrude(hull, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: BODY });

  // underbody
  box(1.9, 0.25, 4.8, [0, 0.4, 0], IRON);
  // windshield
  const wn = [0, 0.5, 0.8];
  glow(plane(1.95, 0.94, [0, 1.95, 1.02], wn, "#0f4a5c", undefined, [0, 0.8, -0.5]), 0.55);
  // visor frame
  box(2.05, 0.08, 0.1, [0, 2.38, 0.74], BLACK, { rotation: [-32, 0, 0] });
  // hood vents + armor
  for (let i = 0; i < 4; i++) box(1.5, 0.03, 0.08, [0, 1.56, 1.5 + i * 0.18], BLACK);
  // front fascia
  box(2.1, 0.5, 0.1, [0, 1.0, 2.74], DARK);
  for (const y of [0.88, 1.0, 1.12]) glow(box(1.0, 0.04, 0.03, [0, y, 2.8], CYAN), 1.4);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.12, 0.05, [s * 0.85, 1.1, 2.78], WHITE), 1.8);
    box(0.62, 0.2, 0.04, [s * 0.85, 1.1, 2.76], BLACK);
    glow(box(0.2, 0.08, 0.05, [s * 0.85, 0.82, 2.78], YELLOW), 1.2);
  }
  // hazard plow bumper
  box(2.5, 0.38, 0.32, [0, 0.63, 2.85], "#ffffff", { texture: HAZARD });
  b.part(new THREE.BoxGeometry(2.4, 0.22, 0.5), IRON, { at: [0, 0.4, 2.95], rotation: [-25, 0, 0] });
  for (const s of [1, -1]) {
    box(0.18, 0.5, 0.4, [s * 1.2, 0.7, 2.75], BLACK);
    glow(box(0.08, 0.06, 0.42, [s * 1.26, 0.9, 2.75], MAGENTA), 1.6);
  }
  glow(box(2.2, 0.04, 0.04, [0, 0.46, 3.03], MAGENTA), 1.8);

  // ---- side details ----
  for (const s of [1, -1]) {
    const ox = s * 1.16;
    // armour skirt
    box(0.1, 0.4, 3.6, [s * 1.17, 0.68, -0.3], IRON);
    glow(box(0.04, 0.05, 3.4, [s * 1.23, 0.62, -0.3], MAGENTA), 1.8);
    // side text and logo
    plane(1.7, 0.43, [ox + s * 0.01, 1.35, -1.35], [s, 0, 0], "#ffffff", SIDE_TEXT);
    plane(0.5, 0.5, [ox + s * 0.01, 1.35, -0.1], [s, 0, 0], "#ffffff", LOGO);
    glow(plane(0.5, 0.5, [ox + s * 0.012, 1.35, -0.1], [s, 0, 0], "#ffffff", LOGO), 0.8);
    // caged side window
    glow(plane(1.1, 0.55, [ox + s * 0.01, 1.95, 0.4], [s, 0, 0], "#0e3a4a"), 0.5);
    plane(1.15, 0.58, [ox + s * 0.03, 1.95, 0.4], [s, 0, 0], "#ffffff", CAGE);
    // roof-edge neon bar
    box(0.08, 0.08, 2.2, [s * 1.12, 2.5, -1.5], DARK);
    glow(box(0.05, 0.05, 2.1, [s * 1.14, 2.5, -1.5], CYAN), 1.8);
    // door handle & hinges
    box(0.05, 0.05, 0.25, [ox + s * 0.03, 1.6, 0.9], STEEL);
    // wheel arches/fenders
    for (const z of [1.75, -0.55, -1.9]) {
      box(0.66, 0.16, 1.4, [s * 1.3, 1.17, z], BLACK);
      box(0.66, 0.3, 0.1, [s * 1.3, 1.0, z + 0.7], BLACK);
      box(0.66, 0.3, 0.1, [s * 1.3, 1.0, z - 0.7], BLACK);
    }
    // grab-rail
    b.rod([s * 1.2, 1.25, 1.25], [s * 1.2, 1.25, 0.5], 0.025, STEEL);
    // wing mirror
    b.rod([s * 1.1, 1.8, 1.08], [s * 1.55, 1.95, 1.2], 0.03, DARK);
    box(0.08, 0.35, 0.22, [s * 1.6, 1.95, 1.2], DARK);
    glow(box(0.02, 0.28, 0.16, [s * 1.65, 1.95, 1.2], CYAN), 0.8);
  }

  // ---- wheels ----
  for (const s of [1, -1])
    for (const z of [1.75, -0.55, -1.9]) {
      cyl(0.55, 0.55, 0.5, 12, [s * 1.3, 0.54, z], [1, 0, 0], BLACK);
      cyl(0.36, 0.36, 0.53, 10, [s * 1.3, 0.54, z], [1, 0, 0], BLUED);
      b.part(new THREE.TorusGeometry(0.4, 0.03, 5, 16), CYAN, { at: [s * 1.57, 0.54, z], dir: [s, 0, 0], axis: "z" });
      glow(b.part(new THREE.TorusGeometry(0.4, 0.03, 5, 16), CYAN, { at: [s * 1.575, 0.54, z], dir: [s, 0, 0], axis: "z" }), 2);
      cyl(0.1, 0.1, 0.56, 6, [s * 1.3, 0.54, z], [1, 0, 0], STEEL);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        cyl(0.025, 0.025, 0.06, 5, [s * 1.585, 0.54 + Math.sin(a) * 0.2, z + Math.cos(a) * 0.2], [1, 0, 0], STEEL);
      }
    }

  // ---- roof strobe bar ----
  box(2.0, 0.1, 0.28, [0, 2.5, 0.5], DARK);
  for (let i = 0; i < 8; i++) {
    const c = i % 2 ? BLUE : RED;
    glow(box(0.2, 0.12, 0.22, [-0.85 + i * 0.243, 2.58, 0.5], c), 2.4);
  }
  box(2.05, 0.04, 0.3, [0, 2.65, 0.5], BLACK);
  // grille cage over the windshield top
  for (let i = 0; i < 6; i++) b.rod([-0.9 + i * 0.36, 2.48, 0.62], [-0.9 + i * 0.36, 2.46, 0.9], 0.02, DARK);

  // ---- water tank ----
  b.part(new THREE.CylinderGeometry(0.52, 0.52, 2.3, 12), STEEL, { at: [0, 2.97, -1.5], dir: [0, 0, 1] });
  for (const z of [-0.35, -1.5, -2.55]) cyl(0.54, 0.54, 0.1, 12, [0, 2.97, z], [0, 0, 1], BLUED);
  b.part(new THREE.SphereGeometry(0.52, 10, 6), STEEL, { at: [0, 2.97, -2.65], scale: [1, 1, 0.5] });
  b.part(new THREE.SphereGeometry(0.52, 10, 6), STEEL, { at: [0, 2.97, -0.35], scale: [1, 1, 0.5] });
  for (const s of [1, -1]) {
    plane(0.6, 0.24, [s * 0.5, 3.0, -1.5], [s, 0, 0], "#ffffff", TANK_LABEL);
    glow(box(0.04, 0.5, 0.1, [s * 0.52, 3.0, -2.1], CYAN), 1.6);
    box(0.08, 0.6, 0.18, [s * 0.5, 3.0, -2.1], BLACK);
  }
  // tank cradle
  box(1.5, 0.12, 2.2, [0, 2.5, -1.5], DARK);
  // roof hatch
  cyl(0.2, 0.2, 0.08, 8, [0, 3.5, -1.5], [0, 1, 0], IRON);
  // pipe to turret
  b.rod([0, 2.6, -0.4], [0, 2.65, -0.15], 0.07, STEEL);

  // ---- water cannon turret ----
  cyl(0.45, 0.5, 0.18, 10, [0, 2.57, -0.2], [0, 1, 0], IRON);
  glow(b.part(new THREE.TorusGeometry(0.46, 0.025, 4, 14), MAGENTA, { at: [0, 2.67, -0.2], dir: [0, 1, 0], axis: "z" }), 2);
  cyl(0.3, 0.34, 0.3, 8, [0, 2.8, -0.2], [0, 1, 0], BLUED);
  for (const s of [1, -1]) {
    box(0.1, 0.4, 0.4, [s * 0.22, 3.05, -0.1], IRON);
    cyl(0.08, 0.08, 0.1, 6, [s * 0.3, 3.08, -0.1], [1, 0, 0], STEEL);
  }
  const A: [number, number, number] = [0, 3.08, -0.3];
  const B: [number, number, number] = [0, 3.28, 1.5];
  const C: [number, number, number] = [0, 3.36, 2.1];
  b.rod(A, B, 0.15, STEEL);
  b.rod(B, C, [0.17, 0.24], BLUED);
  for (let i = 0; i < 4; i++) {
    const t = 0.15 + i * 0.22;
    cyl(0.19, 0.19, 0.07, 8, [0, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t], [0, 0.11, 1], YELLOW);
  }
  glow(b.part(new THREE.CircleGeometry(0.2, 10), CYAN, { at: [0, 3.365, 2.105], dir: [0, 0.12, 1], axis: "z" }), 2.5);
  // spot lamp & sensor
  box(0.2, 0.2, 0.3, [0.28, 3.3, 0.7], DARK);
  glow(box(0.15, 0.15, 0.04, [0.28, 3.3, 0.86], WHITE), 2);
  cyl(0.05, 0.05, 0.14, 6, [-0.25, 3.3, 0.5], [0, 1, 0], BLUED);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [-0.25, 3.4, 0.5] }), 2);
  // water droplets leaving nozzle
  for (let i = 0; i < 6; i++)
    glow(b.part(new THREE.SphereGeometry(0.05 - i * 0.004, 5, 4), "#8fe8ff", { at: [0, 3.4 + i * 0.01 - i * i * 0.004, 2.3 + i * 0.22] }), 1.3);

  // ---- antennas ----
  b.rod([0.8, 2.45, -2.4], [0.8, 3.7, -2.4], [0.02, 0.01], STEEL);
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), MAGENTA, { at: [0.8, 3.72, -2.4] }), 2);
  b.rod([-0.8, 2.45, -2.3], [-0.9, 3.3, -2.3], [0.025, 0.01], STEEL);
  b.part(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
    at: [-0.85, 3.25, -2.3], dir: [0.3, 0.5, 0.8],
  });

  // ---- rear ----
  box(2.3, 0.3, 0.2, [0, 0.62, -2.7], DARK);
  box(2.2, 0.12, 0.05, [0, 0.9, -2.62], YELLOW);
  glow(box(2.0, 0.1, 0.04, [0, 1.15, -2.62], RED), 2);
  for (const s of [1, -1]) {
    glow(box(0.14, 0.9, 0.04, [s * 1.1, 1.65, -2.62], RED), 1.4);
    glow(box(0.06, 1.4, 0.06, [s * 1.14, 1.5, -2.64], CYAN), 1.6);
  }
  plane(0.5, 0.2, [0, 0.62, -2.81], [0, 0, -1], "#ffffff", PLATE);
  box(0.03, 1.1, 0.03, [0, 1.8, -2.62], BLACK);
  plane(0.8, 0.8, [0, 1.85, -2.62], [0, 0, -1], "#ffffff", LOGO);
  // ladder
  for (const s of [1, -1]) b.rod([s * 0.5, 0.9, -2.68], [s * 0.5, 2.4, -2.68], 0.025, STEEL);
  for (let i = 0; i < 6; i++) b.rod([-0.5, 1.0 + i * 0.25, -2.68], [0.5, 1.0 + i * 0.25, -2.68], 0.02, STEEL);
  // exhaust
  for (const s of [1, -1]) {
    cyl(0.07, 0.09, 0.6, 7, [s * 0.95, 0.42, -2.5], [0, 0, 1], BLACK);
    glow(b.part(new THREE.CircleGeometry(0.06, 6), "#ff7a1a", { at: [s * 0.95, 0.42, -2.81], dir: [0, 0, -1], axis: "z" }), 1.2);
  }

  // ---- underglow ----
  for (const s of [1, -1]) glow(box(0.1, 0.04, 4.2, [s * 0.9, 0.4, 0], MAGENTA), 1.8);
  glow(box(1.6, 0.04, 0.1, [0, 0.4, 2.2], MAGENTA), 1.8);
  glow(box(1.6, 0.04, 0.1, [0, 0.4, -2.2], CYAN), 1.8);

  // ---- front roof corner searchlight bars ----
  for (const s of [1, -1]) {
    box(0.4, 0.14, 0.14, [s * 0.95, 2.52, 0.3], DARK);
    glow(box(0.32, 0.08, 0.04, [s * 0.95, 2.52, 0.38], YELLOW), 2);
  }

  return b.root;
}
