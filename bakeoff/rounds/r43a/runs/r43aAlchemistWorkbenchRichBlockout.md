```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Alchemist's Workbench",
  description: "Blockout of a wooden workbench with potions, books, scales and herbs.",
};

export default function build() {
  const b = createBuilder({ name: "workbench" });
  const WOOD = "#8a5a34";
  const DARK = "#5a3a22";
  const BRASS = "#d9a93f";
  const GLASS1 = "#5ad6c8";
  const GLASS2 = "#e0647a";
  const GLASS3 = "#a98af0";
  const CORK = "#c9a36a";
  const LEAF = "#5aa84a";
  const B1 = "#b03a3a";
  const B2 = "#2f5fa8";
  const B3 = "#e8d9a8";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const sph = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z] });

  // table top and legs
  box(1.8, 0.07, 0.8, WOOD, 0, 0.86, 0);
  box(1.84, 0.03, 0.84, DARK, 0, 0.815, 0);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.09, 0.8, 0.09, DARK, sx * 0.82, 0.4, sz * 0.33);
  box(1.6, 0.05, 0.06, DARK, 0, 0.25, 0.33);
  box(1.6, 0.05, 0.06, DARK, 0, 0.25, -0.33);
  box(1.5, 0.04, 0.6, WOOD, 0, 0.3, 0);

  // lower shelf items
  cyl(0.12, 0.14, 0.2, GLASS3, -0.5, 0.42, 0);
  box(0.3, 0.12, 0.22, B1, 0.4, 0.38, 0);

  // back shelf
  box(1.8, 0.04, 0.2, WOOD, 0, 1.55, -0.45);
  box(0.06, 0.7, 0.06, DARK, 0.85, 1.2, -0.45);
  box(0.06, 0.7, 0.06, DARK, -0.85, 1.2, -0.45);
  const top = 0.895;

  // potions
  const potion = (x: number, z: number, c: string, h: number) => {
    sph(0.07, c, x, top + 0.07, z);
    cyl(0.025, 0.03, h, c, x, top + 0.14 + h / 2 - 0.02, z, 6);
    cyl(0.03, 0.03, 0.03, CORK, x, top + 0.14 + h, z, 6);
  };
  potion(-0.55, 0.15, GLASS1, 0.1);
  potion(-0.4, -0.05, GLASS2, 0.08);
  potion(-0.7, -0.15, GLASS3, 0.12);
  cyl(0.05, 0.05, 0.2, GLASS1, -0.25, top + 0.1, 0.2, 8);
  // shelf potions
  potion(-0.5, -0.45, GLASS2, 0.1);
  potion(0.3, -0.45, GLASS1, 0.12);
  potion(0.55, -0.45, GLASS3, 0.08);
  cyl(0.07, 0.07, 0.04, B3, 0, 1.59, -0.45, 8);

  // books stack
  box(0.32, 0.06, 0.24, B1, 0.5, top + 0.03, 0.1);
  box(0.28, 0.05, 0.22, B2, 0.5, top + 0.085, 0.1);
  box(0.3, 0.05, 0.2, B3, 0.5, top + 0.135, 0.1);
  box(0.02, 0.12, 0.2, B2, 0.15, top + 0.06, -0.2);
  box(0.2, 0.04, 0.26, B1, 0.75, top + 0.02, -0.15);

  // scales
  cyl(0.07, 0.09, 0.03, BRASS, 0.05, top + 0.015, 0.15);
  cyl(0.012, 0.012, 0.3, BRASS, 0.05, top + 0.18, 0.15, 6);
  box(0.4, 0.02, 0.02, BRASS, 0.05, top + 0.33, 0.15);
  for (const s of [1, -1]) {
    cyl(0.07, 0.01, 0.03, BRASS, 0.05 + s * 0.19, top + 0.2, 0.15, 8);
    box(0.005, 0.12, 0.005, BRASS, 0.05 + s * 0.19, top + 0.27, 0.15);
  }

  // herbs bundle and pot
  cyl(0.06, 0.05, 0.1, "#a8552f", -0.05, top + 0.05, -0.2);
  for (let i = 0; i < 4; i++) sph(0.06, LEAF, -0.05 + (i - 1.5) * 0.03, top + 0.15 + (i % 2) * 0.03, -0.2);
  box(0.3, 0.03, 0.08, LEAF, 0.3, top + 0.015, 0.3);
  box(0.06, 0.03, 0.09, "#a85a3a", 0.12, top + 0.015, 0.3);
  // hanging herbs on shelf
  for (let i = 0; i < 3; i++) b.part(new THREE.ConeGeometry(0.04, 0.2, 6), LEAF, { at: [-0.2 + i * 0.1, 1.42, -0.45], rotation: [180, 0, 0] });

  // mortar
  cyl(0.08, 0.05, 0.07, "#8a8f99", 0.85, top + 0.035, 0.2);

  return b.root;
}
```