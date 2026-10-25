import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot-Control Interceptor",
  description: "Corporate armored riot-suppression truck with a roof water cannon, tank and neon light bars, in a Cyberpunk 2077 style.",
};

const HULL = "#1a1e2c";
const HULL2 = "#252b3f";
const PLATE = "#323a55";
const DARK = "#0b0d14";
const TIRE = "#121218";
const STEEL = "#6b7490";
const YELLOW = "#f5c400";
const PINK = "#ff2a8a";
const CYAN = "#19f0ff";
const RED = "#ff2233";
const BLUE = "#2b63ff";
const WATER = "#3ad2ff";
const GLASS = "#0c2a38";

export default function build() {
  const b = createBuilder({ name: "interceptor" });

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, len: number, color: string, at: [number, number, number], dir: [number, number, number], seg = 12) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, { at, dir });
  const neon = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, s = 1.6) =>
    glow(box(w, h, d, color, x, y, z), s);

  // ---------- Lower hull ----------
  box(2.3, 0.85, 5.5, HULL, 0, 0.98, -0.05);
  box(2.0, 0.25, 5.3, DARK, 0, 0.5, -0.05); // chassis
  box(2.34, 0.12, 5.54, PLATE, 0, 1.42, -0.05); // top rim
  box(2.34, 0.1, 5.4, PLATE, 0, 0.58, -0.05); // sill
  // hazard stripes on skirts
  for (const s of [1, -1])
    for (let i = 0; i < 16; i++) {
      const z = -2.55 + i * 0.33;
      box(0.03, 0.2, 0.14, i % 2 ? YELLOW : DARK, s * 1.17, 0.78, z, [0, 0, 0]);
    }

  // ---------- Cab ----------
  b.extrude(
    [[0, 1.4], [0, 2.55], [1.5, 2.55], [2.3, 1.75], [2.55, 1.6], [2.55, 1.4]],
    { at: [0, 0, 0.2], x: [0, 0, 1], thickness: 2.2, bevel: 0.04, color: HULL2 },
  );
  // windshield
  box(1.95, 1.05, 0.05, GLASS, 0, 2.17, 2.12 + 0.2 - 0.2 + 0.0, [-47, 0, 0]);
  glow(box(1.9, 0.04, 0.03, CYAN, 0, 2.62, 1.75), 1.4);
  // side windows
  for (const s of [1, -1]) {
    box(0.04, 0.6, 1.0, GLASS, s * 1.11, 2.1, 1.1);
    box(0.04, 0.5, 0.5, GLASS, s * 1.11, 2.12, 0.35);
    box(0.06, 0.05, 1.7, PINK, s * 1.12, 1.72, 0.9).mesh.material = (glow(box(0.06, 0.05, 1.7, PINK, s * 1.12, 1.72, 0.9), 1.8) as any).mesh.material;
    box(0.08, 0.12, 0.3, STEEL, s * 1.15, 1.9, 1.8); // door handle plate
    // mirror
    box(0.06, 0.3, 0.2, DARK, s * 1.3, 2.0, 1.85);
    box(0.04, 0.05, 0.4, DARK, s * 1.2, 1.9, 1.8);
  }
  // cab front grille & bumper
  box(2.2, 0.7, 0.1, DARK, 0, 1.0, 2.78);
  for (let i = 0; i < 7; i++) box(1.8, 0.04, 0.05, STEEL, 0, 0.78 + i * 0.09, 2.85);
  box(2.5, 0.35, 0.35, PLATE, 0, 0.7, 2.85); // bumper
  for (const s of [1, -1]) {
    box(0.18, 0.5, 0.45, YELLOW, s * 1.0, 0.7, 3.0, [0, 0, 0]);
    box(0.3, 0.6, 0.12, PLATE, s * 0.6, 1.0, 2.9, [0, 0, 18 * s]); // push bar struts
  }
  box(2.1, 0.12, 0.3, STEEL, 0, 1.38, 2.95); // ram bar top
  // headlights
  for (const s of [1, -1]) {
    neon(0.5, 0.14, 0.06, "#e8fcff", s * 0.78, 1.25, 2.8, 2);
    neon(0.42, 0.04, 0.07, CYAN, s * 0.78, 1.12, 2.82, 2);
    box(0.56, 0.2, 0.05, DARK, s * 0.78, 1.25, 2.77);
  }
  // front hood neon bar
  neon(2.2, 0.05, 0.05, PINK, 0, 1.52, 2.76, 2);
  box(2.0, 0.1, 0.8, PLATE, 0, 1.47, 2.4);

  // ---------- Roof light bar ----------
  box(2.1, 0.12, 0.45, DARK, 0, 2.62, 1.2);
  for (let i = 0; i < 6; i++) neon(0.3, 0.14, 0.4, i < 3 ? RED : BLUE, -0.8 + i * 0.32, 2.72, 1.2, 2.2);
  for (const s of [1, -1]) box(0.2, 0.16, 0.4, STEEL, s * 1.0, 2.62, 1.2);

  // ---------- Water tank ----------
  cyl(0.88, 0.88, 3.0, PLATE, [0, 2.3, -1.4], [0, 0, 1], 16);
  for (let i = 0; i < 5; i++) cyl(0.93, 0.93, 0.12, STEEL, [0, 2.3, -2.6 + i * 0.6], [0, 0, 1], 16);
  cyl(0.9, 0.4, 0.2, STEEL, [0, 2.3, -3.0], [0, 0, -1], 16);
  // tank water gauge glow
  for (const s of [1, -1]) {
    neon(0.05, 0.9, 0.12, WATER, s * 0.9, 2.2, -0.4, 1.8);
    box(0.08, 1.0, 0.2, DARK, s * 0.89, 2.2, -0.4);
    neon(0.05, 0.7, 0.12, WATER, s * 0.9, 2.2, -0.4, 1.8);
  }
  // hatch
  cyl(0.28, 0.28, 0.1, STEEL, [0, 3.2, -1.8], [0, 1, 0], 10);
  cyl(0.1, 0.1, 0.12, YELLOW, [0, 3.26, -1.8], [0, 1, 0], 8);
  // tank cradle
  box(2.0, 0.3, 3.3, HULL, 0, 1.55, -1.4);

  // ---------- Turret & water cannon ----------
  cyl(0.45, 0.55, 0.25, STEEL, [0, 2.7, 0.55], [0, 1, 0], 10);
  box(0.8, 0.5, 0.8, HULL2, 0, 3.0, 0.55);
  glow(box(0.5, 0.05, 0.05, CYAN, 0, 3.0, 0.97), 2);
  for (const s of [1, -1]) {
    box(0.12, 0.6, 0.6, PLATE, s * 0.45, 3.1, 0.55);
    cyl(0.06, 0.06, 0.1, STEEL, [s * 0.52, 3.1, 0.55], [1, 0, 0], 8);
  }
  const tilt: [number, number, number] = [0, 0.08, 1];
  cyl(0.15, 0.17, 1.4, HULL, [0, 3.15, 1.3], tilt, 10);
  cyl(0.2, 0.2, 0.12, YELLOW, [0, 3.17, 0.95], tilt, 10);
  cyl(0.2, 0.2, 0.12, YELLOW, [0, 3.18, 1.5], tilt, 10);
  cyl(0.22, 0.14, 0.3, STEEL, [0, 3.2, 2.1], tilt, 10);
  glow(cyl(0.09, 0.09, 0.05, WATER, [0, 3.2, 2.27], tilt, 10), 2.5);
  // feed pipe
  b.sweep([[0, 2.95, 0.1], [0, 3.1, -0.4], [0, 2.9, -0.9]], 0.06, { color: STEEL });
  cyl(0.08, 0.08, 0.5, STEEL, [0, 2.6, -0.25], [0, 0, 1], 8);
  // secondary mini-nozzles on bumper
  for (const s of [1, -1]) {
    cyl(0.06, 0.08, 0.3, STEEL, [s * 0.4, 0.95, 3.0], [0, 0, 1], 8);
    glow(cyl(0.04, 0.04, 0.04, WATER, [s * 0.4, 0.95, 3.16], [0, 0, 1], 8), 2);
  }

  // ---------- Sensors & antennas ----------
  const dome = (x: number, y: number, z: number) => {
    b.part(new THREE.SphereGeometry(0.14, 8, 6), DARK, { at: [x, y, z] });
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [x, y, z + 0.1] }), 2.5);
  };
  dome(0.7, 2.7, 1.7);
  dome(-0.7, 2.7, 1.7);
  dome(0, 3.0, -3.0);
  for (const s of [1, -1]) {
    cyl(0.015, 0.02, 1.4, DARK, [s * 0.95, 3.2, 0.1], [s * 0.05, 1, 0], 6);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), PINK, { at: [s * 0.97, 3.9, 0.1] }), 2.5);
    // spotlights
    box(0.3, 0.2, 0.25, DARK, s * 1.0, 2.8, 0.9);
    neon(0.22, 0.14, 0.04, "#e8fcff", s * 1.0, 2.8, 1.03, 2);
  }

  // ---------- Neon strips ----------
  for (const s of [1, -1]) {
    neon(0.04, 0.06, 5.2, CYAN, s * 1.17, 1.3, -0.05, 2);
    neon(0.04, 0.05, 2.6, PINK, s * 1.17, 0.64, -1.2, 2);
    neon(0.05, 0.05, 3.1, PINK, s * 0.93, 3.2 - 0.65, -1.4, 1.5);
  }
  neon(1.9, 0.06, 0.05, CYAN, 0, 0.42, 2.78, 2);
  neon(1.9, 0.06, 0.05, PINK, 0, 0.42, -2.78, 2);
  neon(1.6, 0.08, 0.06, RED, 0, 1.15, -2.78, 2);

  // ---------- Rear ----------
  box(2.3, 0.7, 0.2, PLATE, 0, 1.0, -2.85);
  box(2.4, 0.3, 0.3, DARK, 0, 0.62, -2.9);
  for (const s of [1, -1]) {
    neon(0.3, 0.3, 0.06, RED, s * 0.9, 1.1, -2.97, 2);
    for (let i = 0; i < 5; i++) box(0.04, 0.04, 0.7, STEEL, s * (0.85 + i * 0.01), 2.0 + i * 0.2, -3.0 - 0.0);
  }
  // ladder
  for (const s of [1, -1]) cyl(0.025, 0.025, 1.6, STEEL, [s * 0.25, 2.1, -3.06], [0, 1, 0], 6);
  for (let i = 0; i < 6; i++) cyl(0.02, 0.02, 0.5, STEEL, [0, 1.45 + i * 0.26, -3.06], [1, 0, 0], 6);

  // ---------- Wheels ----------
  for (const s of [1, -1])
    for (const z of [1.75, -0.2, -2.0]) {
      const x = s * 1.25;
      cyl(0.55, 0.55, 0.45, TIRE, [x, 0.55, z], [1, 0, 0], 14);
      cyl(0.33, 0.33, 0.48, STEEL, [x, 0.55, z], [1, 0, 0], 10);
      cyl(0.36, 0.36, 0.04, CYAN, [x + s * 0.24, 0.55, z], [1, 0, 0], 14).mesh.name = "ring";
      glow(cyl(0.38, 0.38, 0.03, CYAN, [x + s * 0.235, 0.55, z], [1, 0, 0], 14), 2);
      cyl(0.3, 0.3, 0.05, DARK, [x + s * 0.25, 0.55, z], [1, 0, 0], 10);
      cyl(0.1, 0.1, 0.07, YELLOW, [x + s * 0.27, 0.55, z], [1, 0, 0], 6);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        cyl(0.03, 0.03, 0.06, STEEL, [x + s * 0.28, 0.55 + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2], [1, 0, 0], 6);
      }
      // fender
      box(0.6, 0.08, 1.35, PLATE, x, 1.17, z);
      box(0.6, 0.3, 0.08, PLATE, x, 1.05, z + 0.66);
      box(0.6, 0.3, 0.08, PLATE, x, 1.05, z - 0.66);
    }

  // ---------- Corporate emblem & text ----------
  const hexShape: [number, number][] = [[0, 0.3], [0.26, 0.15], [0.26, -0.15], [0, -0.3], [-0.26, -0.15], [-0.26, 0.15]];
  const inner: [number, number][] = [[0, 0.2], [0.17, 0.1], [0.17, -0.1], [0, -0.2], [-0.17, -0.1], [-0.17, 0.1]];
  for (const s of [1, -1]) {
    b.extrude(hexShape, { at: [s * 1.17, 1.1, 0.1 + 0], x: [0, 0, s], thickness: 0.03, color: YELLOW });
    glow(b.extrude(inner, { at: [s * 1.19, 1.1, 0.1], x: [0, 0, s], thickness: 0.03, color: PINK }), 1.8);
  }
  const label = svg(
    `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="40" fill="#0b0d14"/><rect x="2" y="2" width="196" height="36" fill="none" stroke="#19f0ff" stroke-width="2"/><text x="100" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#f5c400">CIVIL SUPPRESSION</text></svg>`,
    { size: 512 },
  );
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(1.5, 0.3), "#ffffff", { at: [s * 1.18, 1.1, -1.6], dir: [s, 0, 0], axis: "z", texture: label }), 0.9);
  const rearLabel = svg(
    `<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="20" fill="#0b0d14"/><text x="50" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#ff2a8a">ARASAKA-SEC</text></svg>`,
    { size: 512 },
  );
  glow(b.part(new THREE.PlaneGeometry(1.1, 0.22), "#ffffff", { at: [0, 1.0, -2.96], dir: [0, 0, -1], axis: "z", texture: rearLabel }), 1.2);

  return b.root;
}
