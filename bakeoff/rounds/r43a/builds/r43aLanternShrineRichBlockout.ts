import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Roadside Shrine",
  description: "Blockout of a small roadside shrine with a torii gate, stone lanterns and offering table.",
};

export default function build() {
  const b = createBuilder({ name: "shrine" });
  const STONE = "#a9a69a";
  const DARK = "#6f6c66";
  const RED = "#c8372d";
  const BLACK = "#2a2426";
  const WOOD = "#8a5a36";
  const ROOF = "#4d6b6a";
  const GOLD = "#e8c25a";
  const PINK = "#f0a9b8";
  const WHITE = "#f2ead8";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });

  // ground base (steps and platform)
  box(5.0, 0.1, 6.5, DARK, 0, 0.05, 0.5);
  box(3.0, 0.2, 2.2, STONE, 0, 0.1, -1.0);
  box(1.4, 0.1, 0.5, STONE, 0, 0.05, 2.2);

  // torii gate at front
  for (const s of [1, -1]) {
    cyl(0.14, 0.17, 3.2, RED, s * 1.4, 1.7, 2.8);
    cyl(0.2, 0.2, 0.2, BLACK, s * 1.4, 0.2, 2.8);
  }
  box(4.2, 0.2, 0.28, BLACK, 0, 3.5, 2.8);
  box(3.6, 0.16, 0.2, RED, 0, 3.05, 2.8);
  box(0.3, 0.5, 0.2, GOLD, 0, 3.28, 2.8);
  box(4.6, 0.12, 0.4, BLACK, 0, 3.66, 2.8);

  // shrine building
  box(2.0, 1.4, 1.5, WOOD, 0, 1.0, -1.1);
  for (const s of [1, -1]) cyl(0.08, 0.08, 1.4, RED, s * 1.0, 1.0, -0.35);
  box(0.8, 1.0, 0.1, BLACK, 0, 0.8, -0.33);
  b.part(new THREE.ConeGeometry(1.9, 0.9, 4), ROOF, { at: [0, 2.15, -1.1], rotation: [0, 45, 0] });
  b.part(new THREE.ConeGeometry(0.1, 0.4, 6), GOLD, { at: [0, 2.8, -1.1] });

  // stone lanterns
  for (const s of [1, -1]) {
    const x = s * 1.8;
    cyl(0.2, 0.25, 0.2, STONE, x, 0.2, 0.9, 6);
    cyl(0.1, 0.1, 0.8, STONE, x, 0.7, 0.9, 6);
    box(0.5, 0.4, 0.5, STONE, x, 1.3, 0.9);
    box(0.3, 0.24, 0.3, GOLD, x, 1.3, 0.9);
    b.part(new THREE.ConeGeometry(0.45, 0.3, 4), DARK, { at: [x, 1.65, 0.9], rotation: [0, 45, 0] });
    cyl(0.04, 0.04, 0.12, GOLD, x, 1.86, 0.9, 6);
  }

  // offering table with offerings
  box(1.0, 0.5, 0.5, WOOD, 0, 0.45, 0.2);
  box(1.1, 0.06, 0.6, BLACK, 0, 0.73, 0.2);
  b.part(new THREE.SphereGeometry(0.1, 8, 6), PINK, { at: [-0.3, 0.86, 0.2] });
  cyl(0.1, 0.12, 0.1, WHITE, 0.0, 0.79, 0.2, 8);
  b.part(new THREE.SphereGeometry(0.09, 8, 6), GOLD, { at: [0.3, 0.85, 0.2] });

  // small hanging lanterns on torii
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.17, 8, 6), RED, { at: [s * 0.9, 2.7, 2.8], scale: [1, 1.3, 1] });
  }

  return b.root;
}
