import * as THREE from "three";
import { createBuilder, svg, paint, countershade } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Warhog",
  description:
    "Militarized pickup truck converted to four-thruster hover propulsion, low-poly cyberpunk with neon underglow, roof turret and rocket pods.",
};

const NEON_C = "#19f2ff";
const NEON_M = "#ff2bd6";
const NEON_Y = "#ffd21f";
const RED = "#ff2840";
const DARK = "#14161d";
const STEEL = "#2a2f3a";
const PLATE = "#3b4552";

// textures
const GLASS = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#0a2a3c"/>
  <rect width="100" height="25" fill="#0f3d57"/>
  <path d="M10 50 L40 0 L52 0 L22 50Z" fill="#19f2ff" opacity="0.55"/>
  <path d="M60 50 L80 0 L86 0 L66 50Z" fill="#19f2ff" opacity="0.4"/>
  <rect x="4" y="44" width="30" height="2" fill="#ff2bd6"/><rect x="4" y="40" width="18" height="2" fill="#19f2ff"/></svg>`,
  { size: 256 },
);
const FAN = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#0b0d12" stroke="#19f2ff" stroke-width="3"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M50 50 L${50 + 44 * Math.cos((i * Math.PI) / 4)} ${50 + 44 * Math.sin((i * Math.PI) / 4)} L${50 + 44 * Math.cos((i * Math.PI) / 4 + 0.45)} ${50 + 44 * Math.sin((i * Math.PI) / 4 + 0.45)}Z" fill="#46506a" stroke="#1a1f2b" stroke-width="1.5"/>`).join("")}
  <circle cx="50" cy="50" r="9" fill="#ff2bd6"/><circle cx="50" cy="50" r="4" fill="#14161d"/></svg>`,
  { size: 192 },
);
const NOZZLE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#19f2ff"/>
  <circle cx="50" cy="50" r="38" fill="#0b1c2a"/><circle cx="50" cy="50" r="30" fill="#19f2ff"/>
  <circle cx="50" cy="50" r="20" fill="#0b1c2a"/><circle cx="50" cy="50" r="12" fill="#e8ffff"/></svg>`,
  { size: 128 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 90 20"><rect width="90" height="20" fill="#ffd21f"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 14 - 4} 20 L${i * 14 + 6} 0 L${i * 14 + 14} 0 L${i * 14 + 4} 20Z" fill="#111"/>`).join("")}</svg>`,
  { size: 256 },
);
const TAG = svg(
  `<svg viewBox="0 0 100 30"><rect width="100" height="30" fill="#0b0d12"/>
  <rect x="1" y="1" width="98" height="28" fill="none" stroke="#ff2bd6" stroke-width="2"/>
  <path d="M10 6 h14 a7 7 0 0 1 0 14 h-14z" fill="#19f2ff"/><circle cx="14" cy="13" r="2" fill="#0b0d12"/><circle cx="21" cy="13" r="2" fill="#0b0d12"/>
  <text x="34" y="21" font-family="monospace" font-weight="bold" font-size="15" fill="#ff2bd6">HV-07</text>
  <text x="34" y="27" font-family="monospace" font-size="5" fill="#19f2ff">WARHOG // RECON</text></svg>`,
  { size: 256 },
);
const CHEVRON = svg(
  `<svg viewBox="0 0 60 60"><path d="M30 4 L56 30 L46 30 L30 14 L14 30 L4 30Z" fill="#ff2bd6"/>
  <path d="M30 24 L56 50 L46 50 L30 34 L14 50 L4 50Z" fill="#19f2ff"/></svg>`,
  { size: 128 },
);
const SIGN = svg(
  `<svg viewBox="0 0 100 24"><rect width="100" height="24" fill="#0b0d12"/>
  <text x="50" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#19f2ff">WARDOG</text>
  <rect x="2" y="21" width="96" height="2" fill="#ff2bd6"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hoverWarhog" });

  const HULL = panelled(countershade("#3d4a45", "#1d2326", { level: -0.2 }), {
    size: 0.5,
    aspect: 0.6,
    rivets: 0.08,
    seam: "#0c0e12",
  });
  const GREY = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.35, rivets: 0.07 });

  type V = [number, number, number];
  const box = (w: number, h: number, d: number, color: any, at: V, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const cyl = (rt: number, rb: number, h: number, sides: number, color: any, at: V, dir: V = [0, 1, 0], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color, { at, dir, up: [0, 0, 1], ...opts });
  const flatTex = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, up: V = [0, 1, 0], circle = false) =>
    b.part(circle ? new THREE.CircleGeometry(w / 2, 16) : new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir,
      up,
      axis: "z",
      texture: tex,
    });

  // ---------- chassis ----------
  box(1.9, 0.38, 5.2, HULL, [0, 0.6, 0]);
  box(1.5, 0.12, 4.6, DARK, [0, 0.36, 0]);
  // hood
  b.extrude(
    [
      [0.9, 0.79],
      [2.55, 0.79],
      [2.6, 0.95],
      [2.2, 1.08],
      [0.9, 1.1],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: HULL },
  );
  box(0.9, 0.08, 0.6, DARK, [0, 1.12, 1.7]); // intake scoop
  for (const s of [1, -1]) {
    glow(box(0.04, 0.02, 1.2, NEON_M, [s * 0.5, 1.1, 1.55]), 1);
    glow(box(0.4, 0.1, 0.06, NEON_C, [s * 0.68, 0.93, 2.62]), 1.4); // headlights
    glow(box(0.25, 0.1, 0.05, RED, [s * 0.75, 0.95, -2.62]), 1.2); // tail lights
    box(0.1, 0.5, 0.1, STEEL, [s * 0.5, 0.65, 2.8]); // bull bar posts
  }
  flatTex(0.5, 0.5, CHEVRON, [0, 1.095, 1.35], [0, 1, 0], [0, 0, 1]);
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [0, 1.101, 1.35], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: CHEVRON }), 1.2);
  // front bumper + bull bar
  box(2.0, 0.28, 0.28, PLATE, [0, 0.62, 2.68]);
  box(1.2, 0.08, 0.1, STEEL, [0, 0.9, 2.86]);
  box(1.2, 0.08, 0.1, STEEL, [0, 0.55, 2.86]);
  box(0.1, 0.4, 0.1, STEEL, [0, 0.72, 2.86]);
  glow(box(1.5, 0.04, 0.04, NEON_C, [0, 0.4, 2.84]), 1.2);
  box(1.2, 0.2, 0.05, DARK, [0, 0.85, 2.64]); // grille

  // ---------- cab ----------
  b.extrude(
    [
      [-0.7, 0.79],
      [1.0, 0.79],
      [1.0, 1.0],
      [0.55, 1.68],
      [-0.45, 1.68],
      [-0.7, 1.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.03, color: HULL },
  );
  box(1.9, 0.07, 1.2, GREY, [0, 1.71, 0.05]); // roof armor
  glow(b.part(new THREE.PlaneGeometry(1.5, 0.79), "#ffffff", { at: [0, 1.337, 0.78], dir: [0, 0.57, 0.82], up: [0, 1, 0], axis: "z", texture: GLASS }), 0.6);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", { at: [s * 0.905, 1.35, 0.15], dir: [s, 0, 0], axis: "z", texture: GLASS }), 0.6);
    b.part(new THREE.PlaneGeometry(1.0, 0.18), "#ffffff", { at: [s * 0.906, 0.98, 0.15], dir: [s, 0, 0], axis: "z", texture: HAZARD });
    box(0.06, 0.05, 0.2, STEEL, [s * 0.92, 1.12, 0.5]); // handle
    // slit armor over side windows
    box(0.04, 0.05, 1.0, PLATE, [s * 0.92, 1.6, 0.1]);
    box(0.04, 0.05, 0.8, PLATE, [s * 0.92, 1.12, -0.1]);
    // mirror
    box(0.18, 0.12, 0.06, DARK, [s * 1.0, 1.35, 0.7]);
    // rocket pods on roof
    box(0.32, 0.26, 0.8, PLATE, [s * 0.6, 1.9, 0.0]);
    for (const [ox, oy] of [[-0.07, 0.05], [0.07, 0.05], [-0.07, -0.06], [0.07, -0.06]])
      cyl(0.045, 0.045, 0.06, 6, DARK, [s * 0.6 + ox, 1.9 + oy, 0.4], [0, 0, 1]);
    box(0.06, 0.14, 0.06, STEEL, [s * 0.6, 1.8, 0.2]);
  }
  // roof light bar + sensors
  box(1.2, 0.06, 0.12, DARK, [0, 1.78, 0.45]);
  glow(box(1.1, 0.04, 0.04, NEON_Y, [0, 1.8, 0.52]), 1.4);
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0, 1.75, -0.35] });
  glow(box(0.1, 0.03, 0.1, NEON_M, [0, 1.93, -0.35]), 1.2);
  b.rod([0.5, 1.75, -0.6], [0.55, 2.7, -0.75], 0.012, DARK);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), NEON_M, { at: [0.55, 2.7, -0.75] }), 1.5);
  b.rod([-0.55, 1.75, -0.6], [-0.7, 2.2, -0.7], 0.01, DARK);

  // ---------- bed ----------
  box(1.9, 0.06, 2.0, GREY, [0, 0.82, -1.6]);
  for (const s of [1, -1]) {
    box(0.1, 0.4, 2.0, HULL, [s * 0.9, 1.02, -1.6]);
    box(0.14, 0.04, 2.0, DARK, [s * 0.9, 1.24, -1.6]);
    b.part(new THREE.PlaneGeometry(1.0, 0.3), "#ffffff", { at: [s * 0.951, 1.02, -1.7], dir: [s, 0, 0], axis: "z", texture: TAG });
    box(0.08, 0.6, 0.08, STEEL, [s * 0.8, 1.5, -0.7]); // roll bar
    box(0.4, 0.22, 0.3, PLATE, [s * 0.65, 1.0, -2.3]); // ammo crate
  }
  box(1.9, 0.4, 0.1, HULL, [0, 1.02, -2.6]);
  box(1.9, 0.04, 0.14, DARK, [0, 1.24, -2.6]);
  glow(b.part(new THREE.PlaneGeometry(1.2, 0.29), "#ffffff", { at: [0, 1.02, -2.655], dir: [0, 0, -1], axis: "z", texture: SIGN }), 1.2);
  box(1.7, 0.08, 0.08, STEEL, [0, 1.8, -0.7]);
  glow(box(1.6, 0.03, 0.03, NEON_M, [0, 1.85, -0.7]), 1.4);

  // ---------- turret ----------
  cyl(0.38, 0.4, 0.1, 10, STEEL, [0, 0.88, -1.4]);
  glow(cyl(0.4, 0.4, 0.02, 10, NEON_C, [0, 0.95, -1.4]), 1);
  cyl(0.1, 0.12, 0.45, 6, PLATE, [0, 1.15, -1.4]);
  box(0.4, 0.28, 0.6, GREY, [0, 1.48, -1.4]);
  box(0.8, 0.5, 0.05, PLATE, [0, 1.5, -1.05]); // shield
  glow(box(0.5, 0.03, 0.02, NEON_Y, [0, 1.65, -1.02]), 1);
  for (const s of [1, -1]) {
    cyl(0.04, 0.04, 1.1, 6, DARK, [s * 0.11, 1.5, -0.65], [0, 0, 1]);
    cyl(0.06, 0.06, 0.16, 6, STEEL, [s * 0.11, 1.5, -0.1], [0, 0, 1]);
    glow(cyl(0.025, 0.025, 0.02, 5, NEON_M, [s * 0.11, 1.5, -0.01], [0, 0, 1]), 1.5);
  }
  box(0.14, 0.14, 0.14, STEEL, [0.3, 1.42, -1.6]);

  // ---------- skirts & underglow ----------
  for (const s of [1, -1]) {
    box(0.1, 0.3, 3.1, PLATE, [s * 1.0, 0.58, 0]);
    glow(box(0.04, 0.04, 3.0, NEON_M, [s * 1.0, 0.4, 0]), 1.4);
    glow(box(0.02, 0.06, 2.4, NEON_C, [s * 1.055, 0.6, 0]), 1);
  }
  glow(box(1.2, 0.02, 3.8, "#0d6a78", [0, 0.295, 0]), 0.8);

  // ---------- rear boosters ----------
  for (const s of [1, -1]) {
    cyl(0.17, 0.2, 0.4, 8, STEEL, [s * 0.55, 0.62, -2.8], [0, 0, 1]);
    cyl(0.2, 0.2, 0.05, 8, DARK, [s * 0.55, 0.62, -3.0], [0, 0, 1]);
    glow(b.part(new THREE.CircleGeometry(0.14, 10), "#ffffff", { at: [s * 0.55, 0.62, -3.03], dir: [0, 0, -1], axis: "z", texture: NOZZLE }), 1.5);
  }

  // ---------- hover thrusters ----------
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.3;
      const z = sz * 1.7;
      box(0.5, 0.2, 0.55, STEEL, [sx * 1.08, 0.6, z]); // pylon
      cyl(0.46, 0.5, 0.55, 8, HULL, [x, 0.275, z]);
      cyl(0.52, 0.52, 0.07, 8, PLATE, [x, 0.6, z]);
      glow(b.part(new THREE.TorusGeometry(0.49, 0.02, 4, 12), NEON_C, { at: [x, 0.28, z], dir: [0, 1, 0], up: [0, 0, 1], axis: "z" }), 1.3);
      b.part(new THREE.CircleGeometry(0.42, 16), "#ffffff", { at: [x, 0.64, z], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: FAN });
      glow(b.part(new THREE.CircleGeometry(0.4, 14), "#ffffff", { at: [x, 0.012, z], dir: [0, -1, 0], up: [0, 0, 1], axis: "z", texture: NOZZLE }), 1.6);
      box(0.05, 0.4, 0.6, PLATE, [sx * 1.78, 0.35, z]); // outer fin
      glow(box(0.02, 0.05, 0.5, NEON_M, [sx * 1.81, 0.45, z]), 1.3);
      // braces
      box(0.08, 0.08, 0.5, DARK, [sx * 1.3, 0.6, z + sz * 0.45]);
    }

  return b.root;
}
