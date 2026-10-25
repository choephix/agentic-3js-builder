import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ironwake HX-77 Armored Hauler",
  description:
    "Low-poly cyberpunk 2077 militarized six-wheel truck: armored wedge cab, roof railgun turret, missile rack, neon-lit cargo module, glowing details.",
};

// Palette
const GUN = "#2b303b";
const GUN_D = "#1a1d25";
const GUN_L = "#434a59";
const OLIVE = "#3c4a3e";
const OLIVE_D = "#2a352d";
const OLIVE_L = "#566652";
const TIRE = "#14151a";
const TIRE_L = "#22242c";
const STEEL = "#8d96a6";
const YELLOW = "#f2c318";
const BLACK = "#0c0c10";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const RED = "#ff2a2a";
const AMBER = "#ffa31a";
const WHITE = "#e8fbff";
const GLASS = "#0e3a4a";
const COPPER = "#b5702e";

export default function build() {
  const b = createBuilder({ name: "truck2077" });

  type O = Record<string, unknown>;
  const B = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, o: O = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const C = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: string,
    x: number,
    y: number,
    z: number,
    dir: [number, number, number] = [0, 1, 0],
    o: O = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], dir, ...o });
  const S = (r: number, color: string, x: number, y: number, z: number, o: O = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z], ...o });
  const L = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, k = 1, o: O = {}) =>
    glow(B(w, h, d, color, x, y, z, o), k);

  // ---------- Chassis ----------
  const R = 0.7;
  const axles = [2.9, -2.2, -3.6];
  for (const s of [1, -1]) {
    B(0.32, 0.38, 9.0, GUN_D, s * 0.7, 1.2, -0.15); // main rails
    B(0.1, 0.3, 8.8, GUN_L, s * 0.88, 1.2, -0.15); // rail plate
    L(0.06, 0.06, 3.2, CYAN, s * 0.9, 0.98, 0.2, 1.4); // underglow
    L(0.06, 0.06, 2.4, CYAN, s * 0.9, 0.98, -3.0, 1.4);
  }
  for (let i = 0; i < 7; i++) B(1.5, 0.16, 0.2, GUN, 0, 1.12, -4.2 + i * 1.35); // cross members
  B(1.2, 0.3, 1.2, GUN_D, 0, 1.0, -2.9); // differential housing
  B(1.0, 0.3, 0.9, GUN_D, 0, 1.0, 2.9);

  // ---------- Wheels ----------
  for (const z of axles) {
    C(0.15, 0.15, 2.7, 8, STEEL, 0, R, z, [1, 0, 0]);
    for (const s of [1, -1]) {
      const x = s * 1.3;
      C(R - 0.02, R - 0.02, 0.5, 14, TIRE, x, R, z, [1, 0, 0]);
      C(R - 0.18, R - 0.18, 0.54, 14, TIRE_L, x, R, z, [1, 0, 0]);
      C(0.4, 0.4, 0.6, 10, GUN_L, x, R, z, [1, 0, 0]);
      glow(C(0.3, 0.3, 0.64, 10, CYAN, x, R, z, [1, 0, 0]), 1.3);
      C(0.2, 0.2, 0.7, 8, GUN_D, x, R, z, [1, 0, 0]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        C(0.04, 0.04, 0.08, 6, STEEL, s * 1.62, R + Math.cos(a) * 0.34, z + Math.sin(a) * 0.34, [1, 0, 0]);
      }
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        B(0.52, 0.09, 0.2, TIRE, x, R + Math.cos(a) * 0.7, z + Math.sin(a) * 0.7, {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
    }
  }
  // Fenders & skirts
  for (const z of axles) {
    for (const s of [1, -1]) {
      B(0.8, 0.1, 1.7, OLIVE, s * 1.3, 1.55, z);
      B(0.08, 0.34, 1.7, OLIVE_D, s * 1.66, 1.4, z);
      B(0.06, 0.36, 0.4, BLACK, s * 1.3, 0.6, z - 0.95); // mud flap
    }
  }
  for (const s of [1, -1]) {
    B(0.1, 0.45, 2.0, OLIVE_D, s * 1.5, 1.05, 0.7); // side skirt
    for (let i = 0; i < 4; i++) B(0.12, 0.08, 0.3, YELLOW, s * 1.51, 0.9 + (i % 2) * 0.12, 0.0 + i * 0.4);
    // fuel tanks
    C(0.34, 0.34, 1.4, 10, GUN_L, s * 1.15, 0.95, 0.6, [0, 0, 1]);
    C(0.35, 0.35, 0.08, 10, YELLOW, s * 1.15, 0.95, 0.2, [0, 0, 1]);
    C(0.35, 0.35, 0.08, 10, YELLOW, s * 1.15, 0.95, 1.0, [0, 0, 1]);
  }

  // ---------- Cab ----------
  B(2.8, 1.5, 2.2, OLIVE, 0, 2.35, 2.5); // main cab
  B(2.9, 0.35, 2.3, OLIVE_D, 0, 1.75, 2.5); // lower sill
  B(2.6, 0.9, 1.2, OLIVE, 0, 2.0, 3.9); // hood block
  B(2.5, 0.12, 1.35, OLIVE_L, 0, 2.55, 3.95, { rotation: [-14, 0, 0] }); // sloped hood top
  B(2.3, 0.75, 0.1, GLASS, 0, 2.95, 3.66, { rotation: [-24, 0, 0] }); // windshield
  glow(B(2.1, 0.06, 0.04, CYAN, 0, 3.3, 3.57, { rotation: [-24, 0, 0] }), 1.2); // HUD strip
  B(2.9, 0.14, 2.4, GUN, 0, 3.17, 2.45); // roof plate
  B(2.5, 0.1, 2.0, OLIVE_L, 0, 3.27, 2.4);
  for (const s of [1, -1]) {
    glow(B(0.06, 0.4, 1.0, GLASS, s * 1.41, 2.85, 2.9), 0.8);
    B(0.1, 0.07, 1.2, GUN_D, s * 1.42, 3.1, 2.9);
    B(0.1, 0.07, 1.2, GUN_D, s * 1.42, 2.6, 2.9);
    // armor slat cage on window
    for (let i = 0; i < 4; i++) B(0.1, 0.5, 0.05, GUN_D, s * 1.44, 2.85, 2.5 + i * 0.28);
    // mirror
    B(0.06, 0.4, 0.2, GUN_D, s * 1.6, 2.7, 3.45);
    L(0.04, 0.3, 0.14, CYAN, s * 1.64, 2.7, 3.45, 0.9);
    // door seam + handle
    B(0.04, 1.2, 0.04, GUN_D, s * 1.41, 2.3, 1.85);
    B(0.06, 0.07, 0.3, STEEL, s * 1.43, 2.3, 2.3);
    // angled side armor
    B(0.14, 0.7, 1.1, OLIVE_L, s * 1.46, 2.1, 3.9, { rotation: [0, 0, s * 4] });
    // step
    B(0.4, 0.07, 0.8, GUN_L, s * 1.5, 1.4, 2.7);
    // headlights
    L(0.72, 0.13, 0.05, WHITE, s * 0.92, 2.15, 4.52, 1.6);
    B(0.8, 0.22, 0.08, GUN_D, s * 0.92, 2.15, 4.5);
    L(0.3, 0.05, 0.05, AMBER, s * 1.1, 1.83, 4.54, 1.3);
    // fender flares
    B(0.5, 0.5, 1.2, OLIVE_D, s * 1.3, 1.9, 4.1);
    // roof pods
    B(0.5, 0.2, 0.5, GUN, s * 1.0, 3.42, 1.6);
    S(0.1, MAGENTA, s * 1.0, 3.55, 1.6);
    glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), MAGENTA, { at: [s * 1.0, 3.55, 1.6] }), 1.5);
  }
  // Grille
  B(1.7, 0.7, 0.12, GUN_D, 0, 2.0, 4.52);
  for (let i = 0; i < 9; i++) B(0.06, 0.6, 0.06, GUN_L, -0.64 + i * 0.16, 2.0, 4.6);
  L(1.0, 0.04, 0.04, CYAN, 0, 2.38, 4.6, 1.4);
  // Emblem on hood
  B(0.7, 0.02, 0.5, YELLOW, 0, 2.63, 4.0, { rotation: [-14, 0, 0] });
  B(0.5, 0.025, 0.1, BLACK, 0, 2.645, 4.0, { rotation: [-14, 0, 0] });
  // Bumper / plow
  B(3.0, 0.5, 0.4, GUN, 0, 1.15, 4.55);
  B(3.1, 0.2, 0.5, GUN_D, 0, 0.88, 4.6);
  for (let i = 0; i < 7; i++) B(0.18, 0.2, 0.06, i % 2 ? BLACK : YELLOW, -1.2 + i * 0.4, 1.15, 4.77);
  B(3.0, 0.7, 0.2, OLIVE_D, 0, 1.0, 4.85, { rotation: [-30, 0, 0] }); // plow wedge
  for (const s of [1, -1]) {
    C(0.06, 0.06, 1.4, 6, STEEL, s * 1.2, 1.9, 4.8, [0, 1, 0.15]); // bull bar
    B(0.4, 0.2, 0.5, GUN_D, s * 1.45, 1.1, 4.45);
    L(0.2, 0.1, 0.05, AMBER, s * 1.45, 1.1, 4.72, 1.3);
  }
  C(0.08, 0.08, 0.3, 6, STEEL, 0, 0.95, 4.85, [0, 0, 1]); // tow hook
  // Roof light bar
  B(2.0, 0.14, 0.2, GUN_D, 0, 3.36, 3.35);
  for (let i = 0; i < 8; i++) L(0.2, 0.08, 0.06, i % 2 ? MAGENTA : CYAN, -0.85 + i * 0.245, 3.37, 3.47, 1.6);

  // ---------- Roof turret ----------
  C(0.55, 0.62, 0.22, 10, GUN, 0, 3.4, 2.2);
  C(0.45, 0.5, 0.1, 10, YELLOW, 0, 3.54, 2.2);
  B(1.1, 0.5, 1.2, OLIVE_L, 0, 3.85, 2.2);
  B(0.9, 0.3, 0.8, OLIVE, 0, 4.15, 2.1, { rotation: [8, 0, 0] });
  for (const s of [1, -1]) {
    B(0.2, 0.4, 0.9, GUN_D, s * 0.62, 3.85, 2.3);
    C(0.07, 0.07, 2.0, 8, GUN_D, s * 0.22, 3.88, 3.3, [0, 0, 1]); // barrels
    C(0.12, 0.12, 0.8, 8, GUN_L, s * 0.22, 3.88, 2.7, [0, 0, 1]); // shroud
    for (let i = 0; i < 3; i++) C(0.1, 0.1, 0.05, 8, STEEL, s * 0.22, 3.88, 3.0 + i * 0.3, [0, 0, 1]);
    glow(C(0.08, 0.08, 0.06, 8, CYAN, s * 0.22, 3.88, 4.3, [0, 0, 1]), 1.8);
    C(0.06, 0.06, 0.4, 6, COPPER, s * 0.55, 3.8, 1.6, [0, 0, 1]); // ammo feed
  }
  B(0.5, 0.25, 0.3, GUN_D, 0, 3.95, 2.85); // sensor head
  glow(S(0.09, RED, 0, 3.95, 3.02), 2); // targeting eye
  S(0.28, GUN_L, -0.35, 4.5, 1.9); // radome
  C(0.04, 0.04, 0.3, 6, STEEL, -0.35, 4.35, 1.9);
  // Radar dish
  C(0.4, 0.05, 0.1, 10, STEEL, 0.9, 3.6, 1.2, [0.4, 1, 0.6]);
  C(0.03, 0.03, 0.5, 6, GUN_D, 0.9, 3.4, 1.2);
  glow(S(0.05, CYAN, 0.97, 3.75, 1.35), 1.5);

  // ---------- Behind-cab: exhausts, antennas ----------
  B(2.9, 0.9, 0.12, OLIVE_D, 0, 2.2, 1.28); // cab rear bulkhead
  for (const s of [1, -1]) {
    C(0.14, 0.14, 2.4, 8, GUN_L, s * 1.25, 2.6, 1.15);
    for (let i = 0; i < 4; i++) C(0.17, 0.17, 0.08, 8, GUN_D, s * 1.25, 1.7 + i * 0.55, 1.15);
    C(0.2, 0.15, 0.2, 8, GUN_D, s * 1.25, 3.85, 1.15);
    glow(C(0.12, 0.12, 0.05, 8, AMBER, s * 1.25, 3.97, 1.15), 1.6);
    B(0.1, 0.6, 0.3, STEEL, s * 1.25, 2.5, 1.35); // clamp
    // antennas
    C(0.02, 0.02, 2.2, 5, STEEL, s * 1.35, 4.3, 1.45, [0, 1, s * 0.05]);
    glow(S(0.05, s > 0 ? RED : CYAN, s * 1.35, 5.4, 1.45), 2);
  }

  // ---------- Cargo bed ----------
  B(2.9, 0.2, 5.9, GUN, 0, 1.5, -1.65); // deck
  B(3.0, 0.1, 5.9, GUN_D, 0, 1.38, -1.65);
  for (let i = 0; i < 6; i++) B(0.4, 0.22, 0.1, i % 2 ? BLACK : YELLOW, 1.46, 1.5, -4.4 + i * 0.5);
  for (let i = 0; i < 6; i++) B(0.4, 0.22, 0.1, i % 2 ? BLACK : YELLOW, -1.46, 1.5, -4.4 + i * 0.5);

  // Main container module
  const cz = -1.5;
  B(2.8, 1.4, 2.8, OLIVE, 0, 2.3, cz);
  B(2.7, 0.1, 2.7, OLIVE_L, 0, 3.05, cz);
  B(2.9, 0.12, 2.9, GUN, 0, 3.0, cz);
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) B(0.08, 1.3, 0.1, GUN_D, s * 1.41, 2.3, cz - 1.25 + i * 0.5);
    B(0.1, 0.1, 2.8, GUN_D, s * 1.42, 2.3, cz);
    L(0.06, 0.06, 2.8, CYAN, s * 1.43, 2.95, cz, 1.4);
    L(0.06, 0.06, 2.8, MAGENTA, s * 1.43, 1.65, cz, 1.4);
    for (let i = 0; i < 4; i++) B(0.08, 0.16, 0.5, GUN_D, s * 1.43, 2.65, cz - 1.0 + i * 0.66); // vents
    // hazard corner trim
    for (let i = 0; i < 4; i++) B(0.06, 0.15, 0.2, YELLOW, s * 1.44, 1.75 + i * 0.1, cz + 1.3 - i * 0.02);
  }
  const logo = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="96" height="46" fill="none" stroke="#19f0ff" stroke-width="3"/>
      <text x="50" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#ff2bd6">IRONWAKE</text>
      <text x="50" y="42" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#19f0ff">HX-77 // 2077</text>
    </svg>`,
    { size: 512 },
  );
  for (const s of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(2.0, 1.0), "#ffffff", {
        at: [s * 1.47, 2.28, cz - 0.1],
        dir: [s, 0, 0],
        axis: "z",
        texture: logo,
      }),
      1.2,
    );
  // Roof gear on container
  for (let i = 0; i < 3; i++) {
    B(0.8, 0.12, 0.25, GUN_L, 0, 3.12, cz - 1 + i * 0.9);
    for (let k = 0; k < 4; k++) B(0.8, 0.03, 0.04, GUN_D, 0, 3.2, cz - 1.1 + i * 0.9 + k * 0.07);
  }
  C(0.3, 0.3, 0.25, 10, GUN, 0.8, 3.2, cz + 0.8); // roof fan
  C(0.24, 0.24, 0.05, 10, GUN_D, 0.8, 3.35, cz + 0.8);
  B(0.5, 0.04, 0.08, STEEL, 0.8, 3.39, cz + 0.8);
  B(0.08, 0.04, 0.5, STEEL, 0.8, 3.39, cz + 0.8);
  // Antenna mast array
  C(0.03, 0.03, 1.4, 5, STEEL, -1.0, 3.8, cz - 0.9);
  for (let i = 0; i < 3; i++) B(0.5 - i * 0.1, 0.03, 0.03, STEEL, -1.0, 3.9 + i * 0.25, cz - 0.9);
  glow(S(0.05, RED, -1.0, 4.52, cz - 0.9), 2);

  // Front face of container (toward cab): conduit & ladder
  B(2.6, 1.2, 0.1, GUN_D, 0, 2.3, cz + 1.4);
  for (let i = 0; i < 5; i++) C(0.04, 0.04, 1.2, 5, COPPER, -1.0 + i * 0.12, 2.3, cz + 1.47);
  // Ladder at rear
  const rz = -4.72;
  // Rear missile rack
  const mz = -3.85;
  B(2.6, 0.3, 1.6, GUN, 0, 1.75, mz);
  for (const s of [1, -1]) {
    B(0.15, 0.9, 0.2, GUN_D, s * 1.1, 2.2, mz + 0.5, { rotation: [20, 0, 0] });
    B(0.15, 0.9, 0.2, GUN_D, s * 1.1, 2.2, mz - 0.5, { rotation: [-20, 0, 0] });
  }
  B(2.5, 0.12, 1.5, OLIVE_D, 0, 2.2, mz, { rotation: [0, 0, 0] });
  const launchDir = new THREE.Vector3(0, 1, -0.45).normalize();
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const x = -0.9 + c * 0.45;
      const z = mz + (r ? 0.3 : -0.3);
      const y = 2.55;
      C(0.17, 0.17, 1.3, 8, r ? OLIVE_L : OLIVE, x, y, z, [launchDir.x, launchDir.y, launchDir.z]);
      C(0.13, 0.13, 0.06, 8, BLACK, x + launchDir.x * 0.66, y + launchDir.y * 0.66, z + launchDir.z * 0.66, [
        launchDir.x,
        launchDir.y,
        launchDir.z,
      ]);
      if (c % 2 === 0)
        glow(
          C(0.1, 0.1, 0.05, 8, RED, x + launchDir.x * 0.69, y + launchDir.y * 0.69, z + launchDir.z * 0.69, [
            launchDir.x,
            launchDir.y,
            launchDir.z,
          ]),
          1.6,
        );
      C(0.19, 0.19, 0.1, 8, YELLOW, x - launchDir.x * 0.3, y - launchDir.y * 0.3, z - launchDir.z * 0.3, [
        launchDir.x,
        launchDir.y,
        launchDir.z,
      ]);
    }
  }
  // Rear bumper, lights
  B(3.0, 0.4, 0.3, GUN, 0, 1.15, -4.75);
  for (let i = 0; i < 6; i++) B(0.25, 0.4, 0.05, i % 2 ? BLACK : YELLOW, -1.25 + i * 0.5, 1.15, -4.92);
  for (const s of [1, -1]) {
    L(0.5, 0.2, 0.06, RED, s * 1.1, 1.65, -4.73, 1.6);
    L(0.2, 0.1, 0.06, AMBER, s * 0.65, 1.65, -4.73, 1.3);
    B(0.55, 0.28, 0.05, GUN_D, s * 1.1, 1.65, -4.7);
    C(0.1, 0.1, 0.6, 6, STEEL, s * 0.5, 0.95, -4.75, [0, 0, 1]); // tow pin
  }
  L(1.2, 0.05, 0.05, RED, 0, 1.45, -4.78, 1.4);
  // Side tool boxes
  for (const s of [1, -1]) {
    B(0.4, 0.4, 1.0, GUN, s * 1.65, 1.7, -3.9 + 0.0);
    B(0.42, 0.06, 1.02, YELLOW, s * 1.65, 1.92, -3.9);
    // ammo drums
    C(0.2, 0.2, 0.4, 8, COPPER, s * 1.65, 1.45, -0.2, [0, 0, 1]);
  }

  // ---------- Fine rivets along container top edge ----------
  for (const s of [1, -1])
    for (let i = 0; i < 10; i++) S(0.03, STEEL, s * 1.4, 3.1, cz - 1.3 + i * 0.29);
  // Underbelly pipes
  for (const s of [1, -1]) C(0.05, 0.05, 6.0, 6, COPPER, s * 0.45, 1.0, -0.5, [0, 0, 1]);

  return b.root;
}
