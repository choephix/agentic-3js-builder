```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description: "Firewatch-style flat colour diorama: red hut, radio mast, snowy ice shelf, sled, dome and lights.",
};

export default function build() {
  const b = createBuilder({ name: "outpost" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const SNOW = "#f3e9e2", SNOW2 = "#e2c9c4", ICE = "#8fb8c9", ICED = "#5f8ea6";
  const RED = "#c8412b", REDD = "#8f2a22", WOOD = "#5a3a2c", DARK = "#2b2230";
  const ORANGE = "#f08a3c", YEL = "#ffd27a", METAL = "#7a7f8c", WHITE = "#fff6ee", TEAL = "#3f6f80";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: root, at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: root, at: [x, y, z] });
  const glowBox = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, s = 1.3) =>
    glow(box(w, h, d, c, x, y, z), s);

  // Base: ice shelf plinth
  cyl(3.2, 3.4, 0.5, SNOW, 0, 0.23, 0, 10);
  cyl(3.3, 3.4, 0.18, ICE, 0, 0.0, 0, 10);
  cyl(3.4, 3.4, 0.1, ICED, 0, -0.01, 0, 10);
  // snow drifts
  const r = rng(5);
  for (let i = 0; i < 12; i++) {
    const a = r() * 6.28, d = 0.8 + r() * 2.2, s = 0.25 + r() * 0.35;
    b.part(new THREE.SphereGeometry(s, 6, 4), i % 2 ? SNOW : SNOW2, {
      bone: root, at: [Math.cos(a) * d, 0.42, Math.sin(a) * d], scale: [1.4, 0.45, 1.1],
    });
  }

  // Main hut
  box(2.0, 1.0, 1.4, RED, 0, 0.98, -0.3);
  box(2.05, 0.08, 1.45, REDD, 0, 0.5, -0.3);
  // pitched roof
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(2.3, 0.07, 0.95), SNOW, {
      bone: root, at: [0, 1.7, -0.3 + s * 0.38], rotation: [s * -28, 0, 0],
    });
    b.part(new THREE.BoxGeometry(2.3, 0.04, 0.2), REDD, {
      bone: root, at: [0, 1.58 - s * 0.0, -0.3 + s * 0.74], rotation: [s * -28, 0, 0],
    });
  }
  // gable triangles
  for (const s of [1, -1]) {
    b.extrude([[-0.72, 0], [0.72, 0], [0, 0.42]], {
      at: [s * 1.0, 1.48, -0.3], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: RED, bone: root,
    });
  }
  // chimney + smoke
  box(0.24, 0.55, 0.24, METAL, 0.6, 1.95, -0.5);
  box(0.3, 0.06, 0.3, DARK, 0.6, 2.25, -0.5);
  for (let i = 0; i < 3; i++)
    b.part(new THREE.SphereGeometry(0.14 + i * 0.05, 6, 5), "#d9d0d6", {
      bone: root, at: [0.65 + i * 0.12, 2.5 + i * 0.28, -0.5], scale: [1, 0.8, 1],
    });
  // door
  box(0.42, 0.75, 0.05, WOOD, -0.45, 0.88, 0.42);
  box(0.5, 0.82, 0.03, DARK, -0.45, 0.89, 0.40);
  cyl(0.025, 0.025, 0.04, YEL, -0.3, 0.88, 0.46, 6);
  // windows (glowing)
  for (const x of [0.25, 0.75]) {
    box(0.4, 0.4, 0.03, DARK, x, 1.08, 0.41);
    glowBox(0.32, 0.32, 0.03, YEL, x, 1.08, 0.43);
    box(0.36, 0.03, 0.04, WOOD, x, 1.08, 0.44);
    box(0.03, 0.34, 0.04, WOOD, x, 1.08, 0.44);
  }
  // side window
  box(0.04, 0.36, 0.5, DARK, 1.01, 1.08, -0.3);
  glowBox(0.04, 0.28, 0.42, YEL, 1.02, 1.08, -0.3);
  // porch
  box(1.1, 0.1, 0.6, WOOD, -0.45, 0.52, 0.75);
  for (const x of [-0.95, 0.05]) box(0.07, 0.6, 0.07, WOOD, x, 0.8, 1.0);
  box(1.15, 0.06, 0.7, REDD, -0.45, 1.12, 0.78);
  for (let i = 0; i < 3; i++) box(0.5, 0.06, 0.12, WOOD, -0.45, 0.46 - i * 0.12, 1.15 + i * 0.12);
  // stilts
  for (const x of [-0.85, 0.85]) for (const z of [-0.85, 0.25]) box(0.12, 0.3, 0.12, WOOD, x, 0.5, z);
  // red stripe and teal trim
  box(2.04, 0.08, 1.44, TEAL, 0, 1.4, -0.3);

  // Radio mast
  cyl(0.05, 0.08, 3.4, METAL, -1.7, 2.0, -1.1, 6);
  for (let i = 0; i < 4; i++) {
    box(0.5 - i * 0.08, 0.04, 0.04, METAL, -1.7, 1.2 + i * 0.6, -1.1);
  }
  glow(b.part(new THREE.SphereGeometry(0.09, 6, 5), "#ff3b3b", { bone: root, at: [-1.7, 3.75, -1.1] }), 2);
  for (const a of [0.6, 2.6, 4.6]) {
    b.rod([-1.7, 3.2, -1.1], [-1.7 + Math.cos(a) * 1.3, 0.45, -1.1 + Math.sin(a) * 1.3], 0.012, DARK, { bone: root });
    cyl(0.05, 0.05, 0.12, ORANGE, -1.7 + Math.cos(a) * 1.3, 0.5, -1.1 + Math.sin(a) * 1.3, 6);
  }

  // Weather station: instrument box on legs
  box(0.4, 0.4, 0.3, WHITE, 1.7, 0.95, 0.9);
  for (let i = 0; i < 4; i++) box(0.34, 0.03, 0.02, METAL, 1.7, 0.82 + i * 0.1, 1.07);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.04, 0.6, 0.04, METAL, 1.7 + x * 0.15, 0.55, 0.9 + z * 0.1);
  // anemometer
  cyl(0.015, 0.015, 0.6, METAL, 1.7, 1.45, 0.9, 5);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.09;
    b.part(new THREE.SphereGeometry(0.06, 6, 4), ORANGE, { bone: root, at: [1.7 + Math.cos(a) * 0.2, 1.78, 0.9 + Math.sin(a) * 0.2] });
  }
  b.rod([1.7, 1.78, 0.9], [1.9, 1.78, 0.9], 0.01, METAL, { bone: root });

  // Dome instrument shelter
  b.lathe([[0, 0], [0.8, 0], [0.8, 0.12], [0.72, 0.5], [0.45, 0.78], [0, 0.9]], {
    at: [1.5, 0.45, -1.5], color: WHITE, bone: root, segments: 10,
  });
  box(0.3, 0.4, 0.04, DARK, 1.5, 0.65, -0.78);
  b.part(new THREE.TorusGeometry(0.6, 0.03, 4, 12), ORANGE, { bone: root, at: [1.5, 0.8, -1.5], rotation: [90, 0, 0] });

  // Fuel drums
  for (let i = 0; i < 3; i++) {
    cyl(0.18, 0.18, 0.45, i === 1 ? TEAL : ORANGE, -1.4 + i * 0.4, 0.7, 1.2 + (i % 2) * 0.25, 8);
    cyl(0.185, 0.185, 0.04, DARK, -1.4 + i * 0.4, 0.78, 1.2 + (i % 2) * 0.25, 8);
  }

  // Sled
  box(0.9, 0.08, 0.4, WOOD, -2.0, 0.55, 0.3, 20);
  for (const z of [-0.18, 0.18]) b.part(new THREE.BoxGeometry(1.0, 0.05, 0.05), METAL, { bone: root, at: [-2.0 + z * -0.35, 0.48, 0.3 + z], rotation: [0, 20, 0] });
  box(0.4, 0.25, 0.3, TEAL, -2.0, 0.72, 0.3, 20);

  // Flag
  cyl(0.02, 0.02, 1.0, WOOD, 0.9, 2.2, -0.9, 5);
  b.extrude([[0, 0], [0.5, 0.05], [0.45, 0.3], [0, 0.3]], { at: [0.9, 2.45, -0.9], x: [1, 0, 0], thickness: 0.02, color: ORANGE, bone: root });

  // Distant ice peaks backdrop
  for (const [x, z, h, c] of [[-2.2, -2.2, 1.6, ICE], [-0.6, -2.7, 2.3, ICED], [1.2, -2.5, 1.5, ICE]] as [number, number, number, string][]) {
    b.part(new THREE.ConeGeometry(0.7 + h * 0.2, h, 5), c, { bone: root, at: [x, 0.4 + h / 2, z] });
    b.part(new THREE.ConeGeometry(0.28 + h * 0.08, h * 0.35, 5), SNOW, { bone: root, at: [x, 0.4 + h * 0.83, z] });
  }

  // Lantern pole
  cyl(0.03, 0.03, 1.2, WOOD, -0.2, 1.0, 1.6, 5);
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 5), YEL, { bone: root, at: [-0.2, 1.65, 1.6] }), 1.8);

  return b.root;
}
```