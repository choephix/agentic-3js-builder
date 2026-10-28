```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { pixelArt, pixelTexture, tileBox, pick, bayer } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Monster Truck",
  description: "Pixel-art monster truck with huge knobbly tyres, lifted red body, roll bar and light bar.",
};

export default function build() {
  const b = createBuilder({ name: "monsterTruck" });
  const chassis = b.joint("chassis", { at: [0, 1.2, 0] });
  const T = 0.1;

  const RED = "#d02a2a", DARK = "#1a1a22", STEEL = "#8a909c", YEL = "#ffd23a", GLASS = "#5ec8ff";

  const bodyTile = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => pick(["#8f1818", "#b82222", "#d02a2a", "#e84a3a"], 0.6 + 0.25 * Math.sin(x * 0.7 + y) - y / 40, bayer(x, y)));
  });
  const tireTile = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => ((x + (y % 2) * 2) % 4 < 2 ? "#15151a" : "#2a2a32"));
  });
  const hub = pixelArt(["yyyy", "ysyy", "yyyy", "yyyy"], { y: "#cfd4dc", s: "#555b66" });

  const P = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => b.part(g, c, { bone: chassis, at, ...o });

  // frame rails and axles
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.2, 0.2, 4.2), DARK, [s * 0.55, 0.0, 0]);
  for (const z of [1.5, -1.5]) {
    P(new THREE.BoxGeometry(2.6, 0.18, 0.2), STEEL, [0, -0.1, z]);
    P(new THREE.BoxGeometry(0.4, 0.4, 0.4), DARK, [0, -0.1, z]);
  }

  // body
  P(tileBox([1.7, 0.55, 3.6], bodyTile, T), "#ffffff", [0, 0.45, -0.1], { texture: bodyTile });
  P(tileBox([1.6, 0.5, 1.5], bodyTile, T), "#ffffff", [0, 1.0, -0.6], { texture: bodyTile });
  P(new THREE.BoxGeometry(1.62, 0.36, 0.05), GLASS, [0, 1.02, 0.17]);
  P(new THREE.BoxGeometry(1.64, 0.3, 0.9), GLASS, [0, 1.05, -0.6]);
  P(new THREE.BoxGeometry(1.7, 0.06, 1.55), RED, [0, 1.28, -0.6]);
  P(new THREE.BoxGeometry(1.74, 0.08, 3.64), YEL, [0, 0.22, -0.1]);
  P(new THREE.BoxGeometry(1.2, 0.35, 0.1), DARK, [0, 0.4, 1.75]);
  P(new THREE.BoxGeometry(1.8, 0.14, 0.2), STEEL, [0, 0.18, 1.85]);
  P(new THREE.BoxGeometry(1.8, 0.14, 0.2), STEEL, [0, 0.18, -2.0]);

  // headlights and light bar
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.3, 0.2, 0.06), YEL, [s * 0.6, 0.6, 1.72]);
  for (let i = 0; i < 4; i++) P(new THREE.BoxGeometry(0.26, 0.14, 0.14), i % 2 ? YEL : "#ffffff", [-0.45 + i * 0.3, 1.4, 0.0]);

  // roll bar, exhaust stacks
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.08, 0.5, 0.08), STEEL, [s * 0.7, 1.55, -1.3]);
  P(new THREE.BoxGeometry(1.5, 0.08, 0.08), STEEL, [0, 1.8, -1.3]);
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.12, 0.9, 0.12), STEEL, [s * 0.5, 1.25, 0.35]);

  // tyres
  for (const sx of [1, -1])
    for (const z of [1.5, -1.5]) {
      const id = `${sx > 0 ? "L" : "R"}${z > 0 ? "F" : "R"}`;
      const w = b.joint(`wheel${id}`, { parent: chassis, at: [sx * 1.35, -0.1, z], dir: [sx, 0, 0], role: "hinge" });
      b.part(new THREE.CylinderGeometry(0.85, 0.85, 0.7, 14), "#ffffff", {
        bone: w, at: [sx * 1.35, -0.1, z], dir: [sx, 0, 0], texture: tireTile, flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.45, 0.45, 0.74, 8), STEEL, { bone: w, at: [sx * 1.35, -0.1, z], dir: [sx, 0, 0], flat: true });
      b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
        bone: w, at: [sx * 1.73, -0.1, z], dir: [sx, 0, 0], axis: "z", texture: hub,
      });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.72, 0.16, 0.16), "#0c0c10", {
          bone: w, at: [sx * 1.35, -0.1 + Math.sin(a) * 0.85, z + Math.cos(a) * 0.85], rotation: [(-a * 180) / Math.PI, 0, 0],
        });
      }
    }

  return b.root;
}
```