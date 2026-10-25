import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler escorting a sealed, glowing cargo pod.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });

  const HULL = "#2b3040", HULL2 = "#3d4458", DARK = "#12141c", PLATE = "#566078";
  const NEON = "#19f0ff", PINK = "#ff2d8a", AMBER = "#ffb02e", WARN = "#e8c020", TIRE = "#0c0d12", RIM = "#8a93a8";

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, rotation: rot });

  // chassis
  box(2.6, 0.35, 9, DARK, 0, 0.85, 0);
  box(2.3, 0.2, 8.6, PLATE, 0, 0.65, 0);

  // wheels: 3 axles
  const axles = [3.2, 0.6, -2.6, -3.7];
  for (const z of axles) {
    for (const s of [1, -1]) {
      cyl(0.62, 0.62, 0.55, 10, TIRE, [s * 1.4, 0.62, z], [0, 0, 90]);
      cyl(0.36, 0.36, 0.58, 8, RIM, [s * 1.4, 0.62, z], [0, 0, 90]);
      cyl(0.12, 0.12, 0.62, 6, NEON, [s * 1.4, 0.62, z], [0, 0, 90]);
      // fender
      box(0.7, 0.12, 1.5, HULL2, s * 1.4, 1.3, z);
    }
  }

  // cab
  box(2.5, 1.2, 2.6, HULL, 0, 1.75, 3.1);
  box(2.3, 0.9, 1.6, HULL2, 0, 2.7, 3.4);
  // sloped windshield
  const ws = box(2.1, 0.7, 0.08, "#0a2a3a", 0, 2.75, 4.22);
  ws.mesh.rotation.x = -0.35;
  glow(b.part(new THREE.BoxGeometry(1.9, 0.12, 0.06), NEON, { at: [0, 2.55, 4.3] }), 1.2);
  // hood and bumper
  box(2.4, 0.7, 1.4, HULL, 0, 1.45, 4.4);
  box(2.9, 0.5, 0.5, PLATE, 0, 0.95, 5.2);
  for (let i = -3; i <= 3; i++) box(0.22, 0.4, 0.1, i % 2 ? WARN : DARK, i * 0.4, 0.95, 5.5);
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.5, 0.18, 0.1, AMBER, s * 0.9, 1.55, 5.12), 1.5);
    glow(box(0.3, 0.1, 0.1, NEON, s * 1.25, 1.1, 5.2), 1.3);
    // exhaust stacks
    cyl(0.1, 0.12, 2.2, 6, RIM, [s * 1.38, 2.9, 2.2]);
    cyl(0.14, 0.1, 0.12, 6, DARK, [s * 1.38, 4.03, 2.2]);
    // side armour plates
    box(0.14, 0.8, 2.4, PLATE, s * 1.3, 1.8, 3.1);
    // mirrors
    box(0.1, 0.4, 0.25, DARK, s * 1.45, 2.6, 4.1);
  }
  // roof light bar
  box(1.8, 0.14, 0.3, DARK, 0, 3.2, 3.6);
  glow(box(0.7, 0.1, 0.32, PINK, -0.5, 3.3, 3.6), 1.4);
  glow(box(0.7, 0.1, 0.32, NEON, 0.5, 3.3, 3.6), 1.4);

  // turret on roof rear of cab
  cyl(0.5, 0.6, 0.3, 8, PLATE, [0, 3.0, 2.3]);
  box(0.7, 0.45, 0.9, HULL2, 0, 3.35, 2.3);
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6), DARK, { at: [s * 0.2, 3.35, 3.1], rotation: [90, 0, 0] });

  // cargo bed frame
  box(2.8, 0.2, 5.4, PLATE, 0, 1.12, -2.2);
  for (const z of [-4.6, -2.2, 0.2]) for (const s of [1, -1]) box(0.2, 1.7, 0.2, HULL2, s * 1.3, 2.0, z);
  for (const s of [1, -1]) box(0.14, 0.14, 5.2, HULL2, s * 1.3, 2.85, -2.2);
  box(2.6, 0.14, 0.14, HULL2, 0, 2.85, -4.6);
  box(2.6, 0.14, 0.14, HULL2, 0, 2.85, 0.2);

  // cargo pod: octagonal capsule
  const pod = b.part(new THREE.CylinderGeometry(1.0, 1.0, 4.4, 8), "#d8dde8", {
    at: [0, 2.15, -2.2], rotation: [90, 0, 0], flat: true,
  });
  void pod;
  for (const e of [1, -1]) {
    b.part(new THREE.ConeGeometry(1.0, 0.7, 8), "#aab2c4", { at: [0, 2.15, -2.2 + e * 2.55], rotation: [e * 90, 0, 0], flat: true });
  }
  // pod bands + glow seams
  for (const z of [-3.6, -2.2, -0.8]) {
    cyl(1.04, 1.04, 0.22, 8, DARK, [0, 2.15, z], [90, 0, 0]);
    glow(b.part(new THREE.CylinderGeometry(1.06, 1.06, 0.05, 8), NEON, { at: [0, 2.15, z + 0.14], rotation: [90, 0, 0] }), 1.4);
  }
  // hazard stripe top
  for (let i = 0; i < 6; i++) box(0.5, 0.05, 0.3, i % 2 ? WARN : DARK, 0, 3.17, -4.0 + i * 0.7);
  // seal lock on rear cap
  box(0.8, 0.8, 0.12, DARK, 0, 2.15, -5.1);
  glow(box(0.4, 0.4, 0.06, PINK, 0, 2.15, -5.18), 1.6);
  // pod side window slits
  for (const s of [1, -1]) glow(box(0.05, 0.2, 2.2, PINK, s * 1.0, 2.3, -2.2), 1.0);

  // rear: bumper, tail lights
  box(2.8, 0.4, 0.3, PLATE, 0, 0.95, -4.8);
  for (const s of [1, -1]) glow(box(0.5, 0.15, 0.08, PINK, s * 1.0, 1.1, -4.98), 1.5);

  // side skirts with neon underglow
  for (const s of [1, -1]) {
    box(0.12, 0.3, 6, HULL, s * 1.35, 0.75, -0.2);
    glow(box(0.06, 0.06, 5.6, NEON, s * 1.38, 0.55, -0.2), 1.4);
  }

  // antenna
  cyl(0.02, 0.03, 1.4, 5, DARK, [0.9, 3.9, 3.0]);
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), PINK, { at: [0.9, 4.62, 3.0] }), 1.6);

  return b.root;
}
