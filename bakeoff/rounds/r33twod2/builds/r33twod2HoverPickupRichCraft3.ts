import * as THREE from "three";
import { createBuilder, rng, countershade, mottle, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export default function build() {
  const b = createBuilder({ name: "hovertruck" });
  const R = rng(5);
  const hull = b.joint("hull", { at: [0, 0.75, 0] });

  const OLIVE = countershade(mottle("#3c4a38", "#2e3a2c", { size: 0.25, seed: 2 }), "#1c2420", { level: -0.2 });
  const DARK = "#14161c";
  const METAL = "#4a505c";
  const NEON = "#18f0ff";
  const PINK = "#ff2aa8";
  const AMBER = "#ffb020";

  const box = (w: number, h: number, d: number, c: any, at: number[], rot?: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: hull, at, rotation: rot, name });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: hull, at, rotation: rot });

  // chassis
  box(1.9, 0.25, 4.6, DARK, [0, 0.65, 0]);
  box(1.8, 0.45, 1.5, OLIVE, [0, 1.0, 1.55]); // hood
  box(1.8, 0.2, 1.5, OLIVE, [0, 1.3, 1.7], [-12, 0, 0]);
  // cab
  box(1.8, 0.75, 1.3, OLIVE, [0, 1.4, 0.35]);
  box(1.6, 0.4, 1.1, OLIVE, [0, 1.9, 0.2], [0, 0, 0]);
  // windshield and windows
  box(1.5, 0.38, 0.05, "#0a2a3a", [0, 1.9, 0.78], [-25, 0, 0]);
  for (const s of [1, -1]) {
    box(0.04, 0.34, 0.9, "#0a2a3a", [s * 0.81, 1.9, 0.2]);
    box(0.06, 0.6, 1.1, METAL, [s * 0.93, 1.35, 0.35]); // door armor
  }
  // bed
  box(1.8, 0.1, 1.9, DARK, [0, 0.9, -1.55]);
  for (const s of [1, -1]) box(0.1, 0.45, 1.9, OLIVE, [s * 0.9, 1.1, -1.55]);
  box(1.8, 0.45, 0.1, OLIVE, [0, 1.1, -2.5]);
  box(1.8, 0.45, 0.1, OLIVE, [0, 1.1, -0.6]);
  // roll bar + turret gun
  for (const s of [1, -1]) cyl(0.04, 0.04, 0.9, 6, METAL, [s * 0.7, 1.55, -0.7]);
  cyl(0.04, 0.04, 1.4, 6, METAL, [0, 2.0, -0.7], [0, 0, 90]);
  box(0.4, 0.3, 0.5, METAL, [0, 1.35, -1.3]);
  cyl(0.05, 0.05, 1.0, 8, DARK, [0, 1.4, -0.6], [90, 0, 0]);
  cyl(0.08, 0.08, 0.15, 8, AMBER, [0, 1.4, -0.05], [90, 0, 0]);
  // front bumper, grille, lights
  box(1.9, 0.25, 0.2, METAL, [0, 0.75, 2.4]);
  box(1.2, 0.2, 0.05, DARK, [0, 1.05, 2.32]);
  for (const s of [1, -1]) {
    glow(box(0.35, 0.1, 0.05, "#ffffff", [s * 0.65, 1.1, 2.33]), 2);
    glow(box(0.3, 0.08, 0.05, PINK, [s * 0.7, 0.85, -2.52]), 2);
  }
  // light bar
  glow(box(1.4, 0.08, 0.1, NEON, [0, 2.15, 0.7]), 1.8);
  // neon underglow
  glow(box(1.7, 0.04, 4.2, NEON, [0, 0.5, 0]), 1.5);
  glow(box(0.04, 0.3, 3, PINK, [0.96, 0.9, -0.2]), 1.5);
  glow(box(0.04, 0.3, 3, PINK, [-0.96, 0.9, -0.2]), 1.5);

  // decal plate
  const emblem = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#111"/><path d="M4 28 L16 4 L28 28Z" fill="#ff2aa8"/><text x="34" y="22" font-size="16" font-family="monospace" fill="#18f0ff">HX-9</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", {
      bone: hull,
      at: [s * 0.97, 1.4, 0.35],
      dir: [s, 0, 0],
      axis: "z",
      texture: emblem,
    });

  // hover thrusters at four corners
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.25;
      const z = sz * 1.5;
      box(0.45, 0.12, 0.2, METAL, [sx * 1.05, 0.65, z]); // strut
      cyl(0.5, 0.42, 0.28, 8, METAL, [x, 0.4, z]); // shroud
      cyl(0.36, 0.36, 0.3, 8, DARK, [x, 0.38, z]);
      glow(cyl(0.3, 0.3, 0.05, 10, NEON, [x, 0.2, z]), 2.2);
      cyl(0.04, 0.04, 0.4, 6, AMBER, [x, 0.62, z]);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + R() * 0.2;
        box(0.06, 0.2, 0.2, DARK, [x + Math.cos(a) * 0.42, 0.55, z + Math.sin(a) * 0.42], [0, (-a * 180) / Math.PI, 0]);
      }
    }
  // antenna & exhaust stacks
  cyl(0.015, 0.015, 1.0, 5, METAL, [-0.8, 2.4, -0.6]);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), PINK, { bone: hull, at: [-0.8, 2.92, -0.6] }), 2);
  for (const s of [1, -1]) cyl(0.07, 0.07, 0.8, 6, METAL, [s * 0.95, 1.8, -0.1]);

  return b.root;
}
