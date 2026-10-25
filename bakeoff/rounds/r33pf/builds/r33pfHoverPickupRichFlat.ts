import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

const HULL = "#3b4a3c";
const HULL_D = "#2a352c";
const DARK = "#14161c";
const METAL = "#6b707c";
const CYAN = "#34f0ff";
const PINK = "#ff2d95";
const YEL = "#ffcc33";
const GLASS = "#1b3a55";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const body = b.joint("body", { at: [0, 0.6, 0] });

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at: [x, y, z], rotation: rot });

  // chassis
  box(1.9, 0.25, 4.6, DARK, 0, 0.45, 0);
  box(1.85, 0.4, 4.4, HULL, 0, 0.78, 0);
  // hood
  box(1.8, 0.3, 1.4, HULL, 0, 1.05, 1.5, [-6, 0, 0]);
  box(1.4, 0.06, 0.9, HULL_D, 0, 1.22, 1.5);
  // cab
  box(1.8, 0.75, 1.5, HULL, 0, 1.3, 0.2);
  box(1.6, 0.1, 1.3, HULL_D, 0, 1.7, 0.2);
  // windshield and windows
  box(1.55, 0.5, 0.05, GLASS, 0, 1.35, 0.98, [-18, 0, 0]);
  for (const s of [1, -1]) box(0.05, 0.4, 1.0, GLASS, s * 0.91, 1.38, 0.25);
  box(1.5, 0.35, 0.05, GLASS, 0, 1.4, -0.56);
  // bed
  box(1.8, 0.1, 1.9, DARK, 0, 0.98, -1.4);
  for (const s of [1, -1]) {
    box(0.1, 0.4, 1.9, HULL, s * 0.9, 1.15, -1.4);
    box(0.1, 0.12, 1.9, YEL, s * 0.9, 1.4, -1.4);
  }
  box(1.8, 0.4, 0.1, HULL, 0, 1.15, -2.35);
  // roll bar
  for (const s of [1, -1]) cyl(0.04, 0.04, 0.8, METAL, s * 0.7, 1.45, -0.5);
  box(1.5, 0.08, 0.08, METAL, 0, 1.85, -0.5);

  // bumper, grille, lights
  box(1.9, 0.25, 0.25, METAL, 0, 0.6, 2.3);
  box(1.0, 0.25, 0.06, DARK, 0, 0.95, 2.22);
  for (let i = -2; i <= 2; i++) box(0.04, 0.2, 0.04, CYAN, i * 0.18, 0.95, 2.26);
  for (const s of [1, -1]) glow(box(0.3, 0.14, 0.06, YEL, s * 0.7, 0.98, 2.22), 1.5);
  glow(box(1.7, 0.04, 0.04, PINK, 0, 0.42, 2.28), 1.5);
  for (const s of [1, -1]) glow(box(0.3, 0.1, 0.05, PINK, s * 0.7, 0.95, -2.38), 1.4);

  // roof light bar
  box(1.2, 0.1, 0.2, DARK, 0, 1.78, 0.9);
  for (let i = -3; i <= 3; i++) glow(box(0.14, 0.07, 0.22, i % 2 ? CYAN : PINK, i * 0.16, 1.8, 0.9), 1.5);

  // armor plates and stripe
  for (const s of [1, -1]) {
    box(0.06, 0.3, 1.3, HULL_D, s * 0.95, 0.8, 0.6);
    box(0.04, 0.06, 3.8, CYAN, s * 0.96, 0.95, 0);
  }

  // roof-mounted gun on bed
  cyl(0.25, 0.3, 0.3, METAL, 0, 1.2, -1.5, 8);
  box(0.4, 0.3, 0.5, HULL_D, 0, 1.5, -1.5);
  cyl(0.05, 0.05, 1.2, DARK, 0.1, 1.55, -0.85, 6, [90, 0, 0]);
  cyl(0.05, 0.05, 1.2, DARK, -0.1, 1.55, -0.85, 6, [90, 0, 0]);
  glow(cyl(0.04, 0.04, 0.05, CYAN, 0.1, 1.55, -0.22, 6, [90, 0, 0]), 1.5);
  glow(cyl(0.04, 0.04, 0.05, CYAN, -0.1, 1.55, -0.22, 6, [90, 0, 0]), 1.5);

  // antenna
  cyl(0.015, 0.015, 1.0, METAL, -0.7, 2.2, -0.2, 5);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), PINK, { bone: body, at: [-0.7, 2.7, -0.2] }), 2);

  // hover thrusters at four corners
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.25;
      const z = sz * 1.5;
      box(0.5, 0.12, 0.3, METAL, sx * 1.0, 0.55, z); // strut
      cyl(0.5, 0.42, 0.35, HULL_D, x, 0.45, z, 10); // nacelle
      cyl(0.52, 0.52, 0.06, YEL, x, 0.62, z, 10);
      cyl(0.4, 0.3, 0.2, DARK, x, 0.2, z, 10);
      glow(cyl(0.3, 0.3, 0.05, CYAN, x, 0.08, z, 10), 2);
      glow(cyl(0.18, 0.18, 0.04, "#ffffff", x, 0.05, z, 8), 2);
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        box(0.06, 0.2, 0.06, METAL, x + Math.cos(a) * 0.45, 0.78, z + Math.sin(a) * 0.45);
      }
    }

  // underglow plate
  glow(box(1.4, 0.04, 3.2, CYAN, 0, 0.3, 0), 0.8);

  return b.root;
}
