import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control armored interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

const HULL = "#2a2f3a";
const HULL2 = "#1a1d26";
const PLATE = "#3b4252";
const TIRE = "#0c0c10";
const RIM = "#8a93a6";
const GLASS = "#0b2a3a";
const NEON = "#00f0ff";
const PINK = "#ff2a9d";
const YEL = "#ffd400";
const RED = "#ff2030";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const neon = (w: number, h: number, d: number, c: string, at: [number, number, number], s = 1.5) =>
    glow(b.part(new THREE.BoxGeometry(w, h, d), c, { at }), s);

  // chassis
  box(2.1, 0.5, 4.8, HULL2, [0, 0.55, 0]);
  box(2.2, 0.55, 3.4, HULL, [0, 0.95, -0.2]);
  // hood wedge
  box(2.0, 0.3, 1.5, HULL, [0, 0.85, 1.7], [8, 0, 0]);
  box(1.4, 0.06, 1.0, PLATE, [0, 1.03, 1.7], [8, 0, 0]);
  // cabin
  box(1.9, 0.65, 2.0, PLATE, [0, 1.5, -0.1]);
  box(1.92, 0.4, 0.05, GLASS, [0, 1.55, 0.92], [-25, 0, 0]);
  for (const s of [1, -1]) {
    box(0.05, 0.38, 1.5, GLASS, [s * 0.96, 1.55, -0.1]);
    // armored side skirts and plates
    box(0.12, 0.35, 3.2, PLATE, [s * 1.1, 0.55, -0.1]);
    neon(0.04, 0.05, 3.0, s > 0 ? NEON : PINK, [s * 1.17, 0.5, -0.1]);
    // fenders
    box(0.3, 0.12, 1.1, HULL, [s * 1.0, 1.0, 1.55]);
    box(0.3, 0.12, 1.1, HULL, [s * 1.0, 1.0, -1.7]);
    // headlights
    neon(0.45, 0.1, 0.06, "#e8ffff", [s * 0.65, 0.85, 2.48], 2);
    // tail lights
    neon(0.5, 0.08, 0.05, RED, [s * 0.6, 1.1, -2.42], 2);
    // wheels
    for (const z of [1.55, -1.6]) {
      const w = b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.38, 14), TIRE, {
        at: [s * 1.05, 0.46, z],
        dir: [1, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.4, 8), RIM, { at: [s * 1.05, 0.46, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.42, 8), s > 0 ? NEON : PINK, { at: [s * 1.05, 0.46, z], dir: [1, 0, 0] }), 1.5);
      void w;
    }
    // roof light pods
    box(0.3, 0.14, 0.3, HULL2, [s * 0.6, 1.9, 0.5]);
    neon(0.26, 0.1, 0.26, s > 0 ? "#2a6bff" : RED, [s * 0.6, 2.0, 0.5], 2.5);
    // door stripes
    box(0.02, 0.1, 1.4, YEL, [s * 0.97, 1.2, -0.1]);
    // mirrors
    box(0.18, 0.12, 0.1, HULL2, [s * 1.1, 1.5, 0.8]);
  }
  // roof light bar
  box(1.8, 0.1, 0.25, HULL2, [0, 1.88, 0.85]);
  neon(1.7, 0.06, 0.2, NEON, [0, 1.95, 0.85], 2);
  // front bumper ram bar
  box(2.3, 0.35, 0.35, HULL2, [0, 0.5, 2.5]);
  box(2.0, 0.08, 0.38, YEL, [0, 0.62, 2.5]);
  neon(1.6, 0.05, 0.05, PINK, [0, 0.4, 2.7], 2);
  // grille
  box(1.0, 0.25, 0.05, "#0a0a0f", [0, 0.8, 2.52]);
  // rear bumper
  box(2.2, 0.3, 0.3, HULL2, [0, 0.5, -2.45]);
  neon(1.8, 0.05, 0.05, RED, [0, 0.7, -2.5], 1.8);
  // roof turret base
  b.part(new THREE.CylinderGeometry(0.5, 0.6, 0.18, 10), HULL2, { at: [0, 1.92, -0.7] });
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.45, 10), PLATE, { at: [0, 2.2, -0.7] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), NEON, { at: [0, 2.45, -0.7] });
  // water cannon barrel
  b.part(new THREE.CylinderGeometry(0.13, 0.17, 1.5, 10), HULL, { at: [0, 2.5, -0.1], dir: [0, 0.12, 1], axis: "y" });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.25, 10), YEL, { at: [0, 2.46, -0.55], dir: [0, 0.12, 1] });
  b.part(new THREE.CylinderGeometry(0.17, 0.12, 0.2, 10), HULL2, { at: [0, 2.57, 0.7], dir: [0, 0.12, 1] });
  glow(b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), "#7fe8ff", { at: [0, 2.58, 0.82], dir: [0, 0.12, 1] }), 2);
  // water tank on the back
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 1.5, 12), PLATE, { at: [0, 1.5, -1.6], dir: [1, 0, 0] });
  for (const x of [-0.5, 0, 0.5]) b.part(new THREE.CylinderGeometry(0.58, 0.58, 0.08, 12), YEL, { at: [x, 1.5, -1.6], dir: [1, 0, 0] });
  neon(0.8, 0.08, 0.04, NEON, [0, 1.5, -2.16], 1.8);
  // antenna
  b.rod([-0.8, 1.9, -0.3], [-0.8, 2.6, -0.4], 0.015, HULL2);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [-0.8, 2.62, -0.4] }), 2);
  // corp emblem on hood
  neon(0.5, 0.02, 0.12, PINK, [0, 1.07, 1.9], 1.5);

  return b.root;
}
