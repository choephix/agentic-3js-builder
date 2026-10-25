import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const body = b.joint("body", { at: [0, 0.6, 0], role: "spine" });
  const R = rng(5);

  const HULL = "#3b4150", DARK = "#15171f", OLIVE = "#4c5a3a", NEON = "#19f0ff", PINK = "#ff2d95", STEEL = "#8a93a6", YEL = "#ffd23a";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at: [x, y, z], ...o });

  // chassis and body
  box(1.9, 0.28, 4.6, DARK, 0, 0.55, 0);
  box(1.95, 0.4, 1.5, OLIVE, 0, 0.85, 1.45);      // hood
  box(1.9, 0.7, 1.3, HULL, 0, 1.2, 0.3);          // cab
  box(1.7, 0.1, 1.1, DARK, 0, 1.6, 0.3);          // roof
  box(1.95, 0.5, 1.7, OLIVE, 0, 0.9, -1.55);      // bed floor + sides
  box(0.1, 0.4, 1.7, HULL, 0.93, 1.3, -1.55);
  box(0.1, 0.4, 1.7, HULL, -0.93, 1.3, -1.55);
  box(1.9, 0.4, 0.1, HULL, 0, 1.3, -2.35);
  box(1.9, 0.4, 0.1, HULL, 0, 1.3, -0.72);
  // windshield glass
  glow(box(1.6, 0.4, 0.05, NEON, 0, 1.3, 0.97, { rotation: [-20, 0, 0] }), 0.8);
  for (const s of [1, -1]) glow(box(0.04, 0.35, 0.8, NEON, s * 0.96, 1.25, 0.3), 0.6);
  // bull bar and headlights
  box(2.0, 0.25, 0.15, STEEL, 0, 0.6, 2.25);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.14, 0.06, YEL, s * 0.65, 0.95, 2.2), 1.5);
    box(0.08, 0.5, 0.08, STEEL, s * 0.3, 0.8, 2.2);
  }
  // neon underglow strip
  glow(box(1.7, 0.04, 4.2, PINK, 0, 0.38, 0), 1.5);
  // racing stripe
  box(0.3, 0.02, 3.2, YEL, 0, 1.11, 1.45);
  // roof lightbar and antenna
  for (let i = 0; i < 5; i++) glow(box(0.25, 0.1, 0.12, i % 2 ? PINK : NEON, -0.5 + i * 0.25, 1.72, 0.7), 1.4);
  b.rod([0.7, 1.65, -0.5], [0.8, 2.6, -0.7], 0.015, STEEL, { bone: body });

  // turret on bed
  const tur = b.joint("turret", { parent: body, at: [0, 1.2, -1.5], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.4, 0.45, 0.2, 8), STEEL, { bone: tur, at: [0, 1.15, -1.5] });
  b.part(new THREE.BoxGeometry(0.5, 0.35, 0.7), HULL, { bone: tur, at: [0, 1.45, -1.5] });
  for (const s of [1, -1]) b.rod([s * 0.15, 1.45, -1.2], [s * 0.15, 1.45, -0.2], 0.05, DARK, { bone: tur });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), PINK, { bone: tur, at: [0, 1.5, -1.15] }), 1.5);

  // hover thrusters
  for (const sx of [1, -1])
    for (const z of [1.5, -1.5]) {
      const name = `thruster${sx > 0 ? "L" : "R"}${z > 0 ? "F" : "B"}`;
      const t = b.joint(name, { parent: body, at: [sx * 1.15, 0.5, z], role: "hinge" });
      b.part(new THREE.CylinderGeometry(0.5, 0.42, 0.28, 8), HULL, { bone: t, at: [sx * 1.15, 0.5, z] });
      b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 8), STEEL, { bone: t, at: [sx * 1.15, 0.65, z] });
      glow(b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 8), NEON, { bone: t, at: [sx * 1.15, 0.34, z] }), 2);
      glow(b.part(new THREE.CylinderGeometry(0.25, 0.4, 0.06, 8), PINK, { bone: t, at: [sx * 1.15, 0.28, z] }), 1.5);
      b.rod([sx * 0.95, 0.6, z], [sx * 1.15, 0.55, z], 0.07, DARK, { bone: t });
      // fins
      b.part(new THREE.BoxGeometry(0.05, 0.25, 0.7), STEEL, { bone: t, at: [sx * 1.15 + sx * 0.5, 0.6, z] });
    }

  // cargo crates / scrap
  for (let i = 0; i < 3; i++) {
    const c = ["#a33", "#2a6", YEL][i];
    box(0.4, 0.3, 0.4, c, -0.4 + i * 0.4, 1.2, -2.0 + R() * 0.1, { rotation: [0, R() * 30, 0] });
  }

  return b.root;
}
