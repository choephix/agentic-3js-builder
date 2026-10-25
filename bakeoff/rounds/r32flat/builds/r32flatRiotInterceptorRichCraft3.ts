import * as THREE from "three";
import { createBuilder, svg, paint, countershade, mottle } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "ARMADYNE HP-9 Hydro-Pacifier",
  description:
    "Corporate riot-control interceptor: six-wheel armored truck with a roof water cannon, rear water tank, caged windshield and neon light bars. Cyberpunk 2077 style.",
};

// ---------- palette ----------
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const YEL = "#ffe81a";
const RED = "#ff2640";
const DARK = "#0d0f16";
const GRAPH = "#1c202c";
const STEEL = "#8a93a6";

// ---------- textures ----------
const LOGO = svg(
  `<svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 8 H62 V52 Q36 92 10 52 Z" fill="#12121c" stroke="${"#ff2bd6"}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M36 18 L52 52 L36 76 L20 52 Z" fill="#19f0ff"/>
  <path d="M36 18 L36 76" stroke="#12121c" stroke-width="4"/>
  <text x="76" y="44" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="30" fill="#ffffff" stroke="#12121c" stroke-width="2.5" paint-order="stroke">ARMADYNE</text>
  <text x="77" y="68" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#19f0ff" stroke="#12121c" stroke-width="1.5" paint-order="stroke">CIVIL ORDER DIV.</text>
  <rect x="77" y="78" width="150" height="5" fill="#ff2bd6"/>
</svg>`,
  { size: 512 },
);
const TANKLABEL = svg(
  `<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="396" height="116" rx="10" fill="#10121b" opacity="0.92" stroke="#19f0ff" stroke-width="4"/>
  <text x="18" y="46" font-family="Arial Black, Impact, sans-serif" font-size="34" fill="#ffffff">HYDRO-PACIFIER 9</text>
  <text x="18" y="70" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="#ff2bd6">NON-LETHAL* CROWD COMPLIANCE SYSTEM</text>
  <rect x="18" y="80" width="250" height="18" fill="#222638" stroke="#19f0ff" stroke-width="2"/>
  <rect x="20" y="82" width="196" height="14" fill="#19f0ff"/>
  <text x="280" y="95" font-family="monospace" font-weight="bold" font-size="18" fill="#19f0ff">H2O 78%</text>
  <text x="18" y="112" font-family="Arial, sans-serif" font-size="9" fill="#8a93a6">*ARMADYNE ACCEPTS NO LIABILITY FOR PERSONAL INJURY, EVICTION OR LOSS OF CITIZENSHIP</text>
</svg>`,
  { size: 512 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="16" fill="#ffe81a"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<polygon points="${i * 10 - 8},16 ${i * 10},0 ${i * 10 + 5},0 ${i * 10 - 3},16" fill="#14141c"/>`)
    .join("")}
</svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="56" rx="6" fill="#ffe81a" stroke="#14141c" stroke-width="3"/>
  <text x="60" y="38" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="26" fill="#14141c">NC-7734</text>
  <text x="60" y="53" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#14141c">NIGHT CITY · ARMADYNE</text>
</svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="80" fill="#041a22"/>
  ${[8, 20, 32, 44, 56, 68].map((y) => `<rect x="0" y="${y}" width="200" height="1.5" fill="#0b4a5a"/>`).join("")}
  <text x="100" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#19f0ff">CROWD: HOSTILE</text>
  <text x="100" y="52" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#ff2bd6">COMPLIANCE 12%  ▲</text>
  <rect x="20" y="60" width="160" height="6" fill="none" stroke="#19f0ff" stroke-width="1.5"/>
  <rect x="21" y="61" width="20" height="4" fill="#ff2640"/>
</svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,6 96,90 4,90" fill="#ffe81a" stroke="#14141c" stroke-width="6" stroke-linejoin="round"/>
  <rect x="45" y="34" width="10" height="30" fill="#14141c"/><rect x="45" y="70" width="10" height="10" fill="#14141c"/>
</svg>`,
  { size: 128 },
);

// ---------- paints ----------
const CAB = panelled(countershade("#e9edf5", "#98a1b4"), { size: 0.55, rivets: 0.1 });
const BODY = panelled(countershade("#363e52", "#1b1f2b"), { size: 0.6, rivets: 0.1 });
const TANK = panelled(countershade("#f0f3fa", "#a7b0c4"), { size: 0.5, rivets: 0.09 });
const GRIME = mottle("#1c202c", "#10121a", { size: 0.2, seed: 4 });
const STEELP = metal("steel", { tarnish: 0.3 });

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  // helpers
  const bx = (sx: number, sy: number, sz: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at: [x, y, z], ...o });
  const cyl = (r: number, h: number, color: any, x: number, y: number, z: number, axis: "x" | "y" | "z", seg = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, {
      at: [x, y, z],
      rotation: axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0],
      ...o,
    });
  const neon = (sx: number, sy: number, sz: number, color: string, x: number, y: number, z: number, k = 1.6) =>
    glow(bx(sx, sy, sz, color, x, y, z), k);
  const plane = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], tint = "#ffffff", g = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), tint, { at, dir, axis: "z", texture: tex });
    if (g) glow(p, g);
    return p;
  };

  // ---------- chassis & body ----------
  bx(2.0, 0.3, 5.2, GRIME, 0, 0.62, 0);
  const body = bx(2.3, 0.9, 5.4, BODY, 0, 1.2, 0);
  // lower skirt plates
  for (const s of [1, -1]) {
    bx(0.08, 0.3, 4.6, GRAPH, s * 1.18, 0.88, 0);
    neon(0.04, 0.05, 4.4, MAG, s * 1.23, 0.88, 0, 1.8);
    neon(0.04, 0.04, 4.4, CYAN, s * 1.2, 0.5, 0, 1.4); // underglow
    // side plates with rivet trim
    bx(0.06, 0.5, 1.1, CAB, s * 1.17, 1.3, 1.9);
    bx(0.06, 0.5, 1.1, CAB, s * 1.17, 1.3, -1.9);
  }
  neon(1.8, 0.04, 0.04, CYAN, 0, 0.45, 2.55, 1.4);

  // cab (side profile extruded; z forward)
  b.extrude(
    [
      [-0.5, 1.6],
      [2.7, 1.6],
      [2.7, 1.85],
      [1.5, 2.0],
      [0.9, 2.45],
      [-0.5, 2.45],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.1, color: CAB },
  );
  // front fascia
  bx(1.5, 0.5, 0.06, DARK, 0, 1.15, 2.72, { name: "grille" });
  for (let i = 0; i < 5; i++) bx(1.5, 0.03, 0.05, STEELP, 0, 0.98 + i * 0.1, 2.76);
  neon(2.0, 0.04, 0.05, MAG, 0, 1.78, 2.72, 2);
  for (const s of [1, -1]) {
    glow(bx(0.5, 0.15, 0.06, "#b8f6ff", s * 0.88, 1.42, 2.72), 2);
    bx(0.6, 0.04, 0.08, DARK, s * 0.88, 1.52, 2.72);
    glow(bx(0.2, 0.08, 0.05, YEL, s * 1.0, 0.95, 2.74), 1.5); // fog/turn
  }
  // bumper ram
  b.part(new THREE.BoxGeometry(2.6, 0.38, 0.4), "#ffffff", { at: [0, 0.72, 2.78], texture: HAZARD });
  bx(2.4, 0.18, 0.3, GRAPH, 0, 0.5, 2.75);
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.7, 2.9], [s * 0.7, 1.65, 2.9], 0.045, STEELP);
    cyl(0.07, 0.12, STEEL, s * 0.45, 0.5, 2.98, "z", 8); // tow hooks
  }
  b.rod([-0.9, 1.65, 2.9], [0.9, 1.65, 2.9], 0.045, STEELP);
  plane(PLATE, 0.5, 0.25, [0, 0.9, 2.99], [0, 0, 1]);

  // windshield + HUD + cage
  const wsq = new THREE.BoxGeometry(1.9, 0.78, 0.04);
  b.part(wsq, "#ffffff", { at: [0, 2.27, 1.22], rotation: [-50.2, 0, 0], texture: HUD, name: "windshield" });
  glow(
    b.part(new THREE.BoxGeometry(1.9, 0.78, 0.03), "#06202a", { at: [0, 2.25, 1.2], rotation: [-50.2, 0, 0] }),
    0.0,
  );
  for (let i = -4; i <= 4; i++) b.rod([i * 0.22, 2.06, 1.6], [i * 0.22, 2.5, 1.0], 0.016, DARK);
  b.rod([-1.0, 2.1, 1.55], [1.0, 2.1, 1.55], 0.03, DARK);
  b.rod([-1.0, 2.4, 1.0], [1.0, 2.4, 1.0], 0.03, DARK);

  // side windows, doors, mirrors, decals
  for (const s of [1, -1]) {
    bx(0.04, 0.32, 1.1, "#05222c", s * 1.06, 2.2, 0.35, { name: "slitWindow" });
    glow(bx(0.03, 0.04, 1.1, CYAN, s * 1.07, 2.04, 0.35), 1.2);
    bx(0.05, 0.05, 0.3, DARK, s * 1.07, 1.8, 0.3); // door handle
    plane(LOGO, 1.5, 0.62, [s * 1.16, 1.22, 1.0], [s, 0, 0], "#ffffff", 0.5);
    plane(WARN, 0.28, 0.28, [s * 1.16, 1.2, -0.5], [s, 0, 0]);
    // mirrors
    b.rod([s * 1.05, 2.1, 1.1], [s * 1.35, 2.2, 1.3], 0.025, DARK);
    bx(0.08, 0.3, 0.2, DARK, s * 1.38, 2.2, 1.3);
    glow(bx(0.02, 0.05, 0.16, CYAN, s * 1.43, 2.2, 1.3), 1.4);
    // exhaust stacks
    cyl(0.07, 1.5, STEELP, s * 1.0, 2.35, -0.65, "y", 8);
    cyl(0.09, 0.1, DARK, s * 1.0, 3.1, -0.65, "y", 8);
  }

  // ---------- roof gear ----------
  // light bar
  bx(2.0, 0.08, 0.28, DARK, 0, 2.5, 0.62);
  const cols = [CYAN, MAG, CYAN, MAG, MAG, CYAN, MAG, CYAN];
  cols.forEach((c, i) => glow(bx(0.22, 0.12, 0.22, c, -0.84 + i * 0.24, 2.58, 0.62), 2.2));
  // front roof spotlights
  for (let i = -1; i <= 1; i++) {
    cyl(0.07, 0.1, DARK, i * 0.4, 2.52, 0.88, "z", 8);
    glow(cyl(0.055, 0.03, "#eaffff", i * 0.4, 2.52, 0.94, "z", 8), 2.4);
  }
  // antennas and camera dome
  b.rod([-0.9, 2.45, -0.4], [-0.95, 3.3, -0.45], 0.012, DARK);
  b.rod([0.85, 2.45, -0.4], [0.8, 2.9, -0.45], 0.015, DARK);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [-0.95, 3.32, -0.45] }), 2);
  b.part(new THREE.SphereGeometry(0.14, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEELP, { at: [0.55, 2.45, 0.3] });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [0.55, 2.57, 0.4] }), 2);

  // ---------- water cannon turret ----------
  cyl(0.4, 0.14, GRAPH, 0, 2.52, 0.0, "y", 12);
  cyl(0.3, 0.06, STEELP, 0, 2.62, 0.0, "y", 12);
  bx(0.55, 0.32, 0.6, CAB, 0, 2.82, 0.1, { name: "turretBody" });
  for (const s of [1, -1]) {
    bx(0.08, 0.26, 0.5, GRAPH, s * 0.32, 2.82, 0.1);
    neon(0.03, 0.04, 0.4, CYAN, s * 0.37, 2.82, 0.1);
  }
  b.rod([0, 2.85, 0.4], [0, 3.05, 1.7], 0.1, STEELP);
  b.rod([0, 3.05, 1.55], [0, 3.1, 1.92], [0.15, 0.2], GRAPH);
  const dir = [0, 0.152, 0.988];
  glow(b.part(new THREE.TorusGeometry(0.19, 0.03, 6, 14), CYAN, { at: [0, 3.1, 1.93], dir, axis: "z" }), 2.4);
  b.part(new THREE.CircleGeometry(0.15, 12), "#bff8ff", { at: [0, 3.1, 1.935], dir, axis: "z" });
  for (let i = 0; i < 3; i++) b.part(new THREE.TorusGeometry(0.11, 0.02, 5, 10), DARK, { at: [0, 2.95 + i * 0.03, 0.95 + i * 0.3], dir, axis: "z" });
  // ammo/water feed hose to the tank
  b.sweep(
    [
      [0.2, 2.75, -0.15],
      [0.55, 2.95, -0.55],
      [0.55, 2.9, -1.0],
      [0.4, 2.8, -1.4],
    ],
    0.045,
    { color: DARK, sides: 6 },
  );
  glow(cyl(0.05, 0.05, CYAN, 0.4, 2.8, -1.35, "z", 6), 1.5);

  // ---------- water tank ----------
  const tank = cyl(0.72, 1.9, TANK, 0, 2.3, -1.55, "z", 12, { name: "tank" });
  b.part(new THREE.SphereGeometry(0.72, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), TANK, {
    at: [0, 2.3, -2.5],
    rotation: [-90, 0, 0],
    scale: [1, 0.3, 1],
  });
  cyl(0.18, 0.08, GRAPH, 0, 2.3, -2.7, "z", 8);
  for (const z of [-2.3, -1.55, -0.8]) b.part(new THREE.TorusGeometry(0.73, 0.045, 5, 12), GRAPH, { at: [0, 2.3, z] });
  neon(0.06, 0.04, 1.8, CYAN, 0, 3.03, -1.55, 1.8);
  for (const s of [1, -1]) {
    neon(0.04, 0.05, 1.8, MAG, s * 0.73, 2.0, -1.55, 1.8);
    b.decal(tank, TANKLABEL, { at: [s * 0.7, 2.4, -1.55], dir: [s, 0, 0], size: [1.7, 0.5] });
    // saddle supports
    bx(0.12, 0.45, 1.9, GRAPH, s * 0.55, 1.78, -1.55);
    // side equipment lockers
    bx(0.25, 0.55, 1.4, BODY, s * 1.0, 1.95, -1.9);
    glow(bx(0.03, 0.04, 1.2, YEL, s * 1.14, 2.15, -1.9), 1.2);
  }
  // hatch & valve
  cyl(0.16, 0.08, STEELP, 0, 3.04, -1.1, "y", 8);
  cyl(0.04, 0.2, RED, 0.12, 3.12, -1.1, "x", 6);
  // pressure gauge
  cyl(0.1, 0.05, STEELP, 0.45, 2.7, -2.65, "z", 10);
  glow(b.part(new THREE.CircleGeometry(0.085, 10), "#19f0ff", { at: [0.45, 2.7, -2.68], dir: [0, 0, -1], axis: "z" }), 1.4);

  // rear: bumper, lights, step
  bx(2.4, 0.3, 0.3, GRAPH, 0, 0.8, -2.8);
  b.part(new THREE.BoxGeometry(2.2, 0.16, 0.34), "#ffffff", { at: [0, 0.55, -2.85], texture: HAZARD });
  neon(2.0, 0.08, 0.04, RED, 0, 1.25, -2.72, 2);
  for (const s of [1, -1]) neon(0.1, 0.4, 0.04, RED, s * 1.05, 1.3, -2.72, 1.8);
  plane(PLATE, 0.45, 0.22, [0, 0.88, -2.97], [0, 0, -1]);

  // ---------- wheels ----------
  for (const z of [1.85, -0.75, -2.0]) {
    for (const s of [1, -1]) {
      const x = s * 1.2;
      cyl(0.58, 0.52, "#0b0c11", x, 0.58, z, "x", 14, { flat: true, name: "tire" });
      cyl(0.4, 0.54, GRAPH, x, 0.58, z, "x", 12);
      cyl(0.2, 0.06, STEEL, s * 1.47, 0.58, z, "x", 8);
      glow(b.part(new THREE.TorusGeometry(0.34, 0.03, 5, 14), CYAN, { at: [s * 1.47, 0.58, z], rotation: [0, 90, 0] }), 2);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.025, 0.05, DARK, s * 1.5, 0.58 + Math.cos(a) * 0.12, z + Math.sin(a) * 0.12, "x", 5);
      }
      // fender
      bx(0.55, 0.1, 1.35, CAB, s * 1.28, 1.2, z);
      bx(0.1, 0.34, 1.35, GRAPH, s * 1.52, 1.0, z);
    }
    b.rod([-1.2, 0.58, z], [1.2, 0.58, z], 0.07, DARK); // axle
  }

  return b.root;
}
