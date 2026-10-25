```ts
import * as THREE from "three";
import { createBuilder, rng, countershade, mottle, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export default function build() {
  const b = createBuilder({ name: "hovertruck" });
  const body = b.joint("body", { at: [0, 0.6, 0] });

  const HULL = countershade(mottle("#3b4a3a", "#2e3a2f", { size: 0.3, seed: 2 }), "#1c2420", { level: -0.2 });
  const DARK = "#14161c";
  const STEEL = "#5b6270";
  const CYAN = "#22f0ff";
  const PINK = "#ff2d95";
  const YEL = "#ffd400";

  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, bone: any = body) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });

  // chassis and hull
  box(1.9, 0.25, 4.4, DARK, 0, 0.55, 0);
  box(1.95, 0.4, 4.3, HULL, 0, 0.85, 0);
  // hood, wedge style
  b.part(new THREE.BoxGeometry(1.85, 0.3, 1.5), HULL, { bone: body, at: [0, 1.15, 1.35], rotation: [-8, 0, 0] });
  // cabin
  box(1.8, 0.55, 1.5, HULL, 0, 1.45, 0.1);
  b.part(new THREE.BoxGeometry(1.6, 0.5, 1.2), HULL, { bone: body, at: [0, 1.95, -0.05] });
  // windshield and side windows
  const glass = "#0b1d2e";
  b.part(new THREE.BoxGeometry(1.5, 0.4, 0.05), glass, { bone: body, at: [0, 1.95, 0.58], rotation: [-20, 0, 0] });
  for (const s of [1, -1]) box(0.04, 0.35, 1.0, glass, s * 0.82, 1.95, -0.05);
  // bed
  box(1.85, 0.08, 1.9, DARK, 0, 1.08, -1.25);
  for (const s of [1, -1]) box(0.08, 0.35, 1.9, HULL, s * 0.95, 1.3, -1.25);
  box(1.85, 0.35, 0.08, HULL, 0, 1.3, -2.2);
  box(1.85, 0.35, 0.08, HULL, 0, 1.3, -0.3);
  // roll bar and turret mount
  for (const s of [1, -1]) box(0.06, 0.5, 0.06, STEEL, s * 0.7, 1.55, -0.4);
  box(1.5, 0.06, 0.06, STEEL, 0, 1.8, -0.4);
  const ring = b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.12, 8), STEEL, { bone: body, at: [0, 1.17, -1.3] });
  b.part(new THREE.BoxGeometry(0.3, 0.2, 0.6), STEEL, { bone: body, at: [0, 1.4, -1.2] });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), DARK, { bone: body, at: [0, 1.42, -0.75], rotation: [90, 0, 0] });
  void ring;

  // armor plates and stripes
  for (const s of [1, -1]) {
    box(0.06, 0.3, 3.4, STEEL, s * 1.0, 0.85, 0);
    box(0.07, 0.04, 3.4, YEL, s * 1.0, 1.02, 0);
    box(0.06, 0.12, 1.2, PINK, s * 1.0, 0.68, 0.4);
  }
  // front bumper and grille
  box(2.1, 0.3, 0.25, STEEL, 0, 0.75, 2.2);
  box(1.2, 0.2, 0.06, DARK, 0, 1.0, 2.12);
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.4, 0.12, 0.05, "#fff6c0", s * 0.65, 1.05, 2.12), 1.6);
    glow(box(0.4, 0.08, 0.05, "#ff2020", s * 0.65, 1.0, -2.2), 1.4);
  }
  // neon underglow strip
  glow(box(1.7, 0.04, 4.0, CYAN, 0, 0.42, 0), 1.5);
  // light bar on roof
  glow(box(1.3, 0.07, 0.1, PINK, 0, 2.24, 0.45), 1.4);
  // antenna
  b.rod([-0.7, 1.4, -2.0], [-0.7, 2.6, -2.1], 0.015, DARK, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), PINK, { bone: body, at: [-0.7, 2.62, -2.1] }), 2);

  // decal sign
  const sign = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#10131a"/><text x="32" y="22" font-size="18" text-anchor="middle" font-family="monospace" font-weight="bold" fill="#22f0ff">H-07</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", {
      bone: body, at: [s * 0.99, 1.4, 0.55], dir: [s, 0, 0], axis: "z", texture: sign,
    });

  // thrusters: four pods
  const R = rng(5);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.25, z = sz * 1.5;
      const pod = b.joint(`thruster${sx > 0 ? "L" : "R"}${sz > 0 ? "F" : "B"}`, { parent: body, at: [x, 0.5, z] });
      b.rod([sx * 0.95, 0.6, z], [x, 0.5, z], 0.07, STEEL, { bone: pod });
      b.part(new THREE.CylinderGeometry(0.42, 0.34, 0.4, 8), DARK, { bone: pod, at: [x, 0.4, z] });
      b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 8), STEEL, { bone: pod, at: [x, 0.62, z] });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8), "#0a0c10", { bone: pod, at: [x, 0.2, z] });
      glow(b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 8), CYAN, { bone: pod, at: [x, 0.16, z] }), 2);
      glow(b.part(new THREE.ConeGeometry(0.22, 0.14 + R() * 0.04, 8), "#7ff8ff", { bone: pod, at: [x, 0.08, z], rotation: [180, 0, 0] }), 1.8);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        box(0.05, 0.3, 0.05, YEL, x + Math.cos(a) * 0.4, 0.45, z + Math.sin(a) * 0.4, pod);
      }
    }

  return b.root;
}
```