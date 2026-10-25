import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

const HULL = "#3b4a45";
const HULL_D = "#2a3532";
const HULL_L = "#56685f";
const DARK = "#14171c";
const METAL = "#6b7280";
const NEON = "#18e6ff";
const PINK = "#ff2d95";
const GLASS = "#1b3a55";
const WARN = "#f5c518";
const RUST = "#7a4a2a";

export default function build() {
  const b = createBuilder({ name: "hover_pickup" });
  const H = 0.55; // hover height of underside

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], rotation: rot });
  const lit = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, s = 1.6) =>
    glow(box(w, h, d, color, x, y, z), s);

  // chassis
  box(1.9, 0.18, 4.6, DARK, 0, H + 0.1, 0);
  box(1.7, 0.1, 4.2, METAL, 0, H + 0.02, 0);
  // cab lower body
  box(2.0, 0.55, 1.9, HULL, 0, H + 0.45, 0.85);
  // hood
  box(1.9, 0.3, 1.3, HULL, 0, H + 0.5, 1.9);
  box(1.0, 0.06, 0.9, HULL_D, 0, H + 0.68, 1.95);
  // hood scoop
  box(0.5, 0.12, 0.5, DARK, 0, H + 0.74, 1.8);
  // front bumper/ram
  box(2.1, 0.3, 0.25, DARK, 0, H + 0.35, 2.65);
  box(1.6, 0.14, 0.12, WARN, 0, H + 0.35, 2.79);
  lit(1.2, 0.05, 0.05, NEON, 0, H + 0.5, 2.8);
  // headlights
  for (const s of [1, -1]) {
    lit(0.32, 0.14, 0.06, "#fff6c8", s * 0.72, H + 0.58, 2.57, 2);
    box(0.4, 0.2, 0.05, DARK, s * 0.72, H + 0.58, 2.54);
  }
  // cabin
  box(1.8, 0.6, 1.3, HULL_L, 0, H + 1.0, 0.55);
  box(1.85, 0.05, 1.35, HULL_D, 0, H + 1.33, 0.55);
  // windshield & windows
  box(1.6, 0.45, 0.05, GLASS, 0, H + 1.02, 1.22, [-20, 0, 0]);
  for (const s of [1, -1]) {
    box(0.04, 0.38, 0.9, GLASS, s * 0.91, H + 1.02, 0.55);
    box(0.04, 0.5, 0.1, HULL_D, s * 0.93, H + 0.5, 0.85);
  }
  box(1.5, 0.35, 0.05, GLASS, 0, H + 1.05, -0.12);
  // roll bar & roof lights
  for (const s of [1, -1]) cyl(0.04, 0.04, 0.7, 6, METAL, s * 0.85, H + 1.65, -0.2, [0, 0, 0]);
  box(1.8, 0.07, 0.07, METAL, 0, H + 1.98, -0.2);
  for (let i = -2; i <= 2; i++) lit(0.18, 0.1, 0.1, i % 2 ? PINK : NEON, i * 0.3, H + 1.99, 0.0, 1.8);
  // cargo bed
  box(1.9, 0.12, 1.8, HULL_D, 0, H + 0.28, -1.5);
  for (const s of [1, -1]) {
    box(0.1, 0.45, 1.9, HULL, s * 0.98, H + 0.5, -1.5);
    box(0.12, 0.05, 1.9, WARN, s * 0.98, H + 0.75, -1.5);
  }
  box(2.0, 0.45, 0.1, HULL, 0, H + 0.5, -2.45);
  // pintle-mounted gun
  cyl(0.08, 0.1, 0.45, 8, METAL, 0, H + 0.55, -1.4);
  box(0.3, 0.25, 0.5, DARK, 0, H + 0.9, -1.4);
  cyl(0.04, 0.04, 1.1, 6, METAL, 0, H + 0.92, -0.75, [90, 0, 0]);
  cyl(0.07, 0.07, 0.2, 6, DARK, 0, H + 0.92, -0.15, [90, 0, 0]);
  box(0.4, 0.2, 0.3, RUST, 0.4, H + 0.45, -1.8);
  box(0.4, 0.2, 0.3, HULL_L, -0.4, H + 0.45, -1.2);
  // armor plates on sides
  for (const s of [1, -1]) {
    box(0.08, 0.35, 1.1, HULL_L, s * 1.03, H + 0.42, 0.85, [0, 0, 0]);
    box(0.06, 0.06, 3.6, NEON, s * 1.02, H + 0.2, 0, [0, 0, 0]);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.05, 3.6), NEON, { at: [s * 1.03, H + 0.22, 0] }), 1.8);
  }
  // antennas
  cyl(0.015, 0.015, 1.2, 4, DARK, -0.9, H + 2.3, -2.3);
  lit(0.06, 0.06, 0.06, PINK, -0.9, H + 2.92, -2.3, 2);
  // hover thrusters at 4 corners
  for (const sx of [1, -1])
    for (const sz of [1.6, -1.6]) {
      const x = sx * 1.25;
      box(0.5, 0.12, 0.3, DARK, sx * 1.1, H + 0.05, sz); // strut
      cyl(0.5, 0.42, 0.28, 8, HULL_D, x, H - 0.05, sz);
      cyl(0.52, 0.52, 0.06, 8, WARN, x, H + 0.1, sz);
      cyl(0.36, 0.3, 0.12, 8, DARK, x, H - 0.22, sz);
      glow(b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8), NEON, { at: [x, H - 0.3, sz] }), 2);
      glow(b.part(new THREE.CylinderGeometry(0.15, 0.2, 0.05, 8), "#ffffff", { at: [x, H - 0.34, sz] }), 2);
      // fins
      for (const f of [1, -1]) box(0.05, 0.2, 0.5, METAL, x + f * 0.4, H, sz);
    }
  // underside glow
  lit(1.3, 0.04, 3.4, PINK, 0, H - 0.02, 0, 1.2);
  // plate number / emblem
  lit(0.5, 0.12, 0.03, PINK, 0, H + 0.82, -2.52, 1.4);
  box(0.3, 0.1, 0.02, WARN, 0.55, H + 0.7, 2.58);

  // sink slightly: lowest = thruster glow bottom
  b.root.position.y = 0;
  const bb = new THREE.Box3().setFromObject(b.root, true);
  b.root.position.y = -bb.min.y;
  return b.root;
}
