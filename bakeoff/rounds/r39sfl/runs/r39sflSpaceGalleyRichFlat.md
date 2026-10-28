```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description: "Cramped 1979 retro-industrial spaceship galley: steel counters, mess table, stools, pots, hanging lamps, warning stripes and CRT panel.",
};

export default function build() {
  const b = createBuilder({ name: "galley" });
  const GREY = "#8a8d8a", DARK = "#2b2e2d", STEEL = "#b9bdb8", BEIGE = "#c9c1a5", YEL = "#d9a920",
    BLK = "#111413", GREEN = "#4dff8a", ORANGE = "#d8642a", WHITE = "#e8e6da", RED = "#a8302a", TEAL = "#5f7f78";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });

  // floor deck (thin, sits on y=0) with grating
  box(3.6, 0.04, 3.0, DARK, 0, 0.02, 0);
  for (let i = -8; i <= 8; i++) box(0.02, 0.012, 2.9, GREY, i * 0.2, 0.046, 0);
  for (let i = -7; i <= 7; i++) box(3.5, 0.012, 0.02, GREY, 0, 0.046, i * 0.2);

  // back wall + panels
  box(3.6, 2.4, 0.08, BEIGE, 0, 1.24, -1.46);
  for (let i = 0; i < 6; i++) {
    box(0.54, 0.7, 0.03, i % 2 ? GREY : TEAL, -1.4 + i * 0.56, 1.7, -1.4);
    box(0.5, 0.012, 0.01, DARK, -1.4 + i * 0.56, 1.7, -1.38);
    for (const r of [-0.12, 0.12]) cyl(0.012, 0.012, 0.02, STEEL, -1.4 + i * 0.56, 1.7 + r * 1.5, -1.38, 6, [90, 0, 0]);
  }
  // side wall pipes
  for (const [y, c] of [[2.2, GREY], [2.1, STEEL], [2.3, DARK]] as [number, string][])
    cyl(0.04, 0.04, 3.5, c, 0, y, -1.38, 8, [0, 0, 90]);
  for (let i = -4; i <= 4; i++) box(0.05, 0.3, 0.05, DARK, i * 0.4, 2.2, -1.38);

  // counter run
  box(2.6, 0.82, 0.6, GREY, -0.4, 0.45, -1.1);
  box(2.64, 0.05, 0.64, STEEL, -0.4, 0.88, -1.1);
  for (let i = 0; i < 5; i++) {
    box(0.48, 0.6, 0.02, DARK, -1.45 + i * 0.52, 0.45, -0.79);
    box(0.1, 0.02, 0.02, STEEL, -1.45 + i * 0.52, 0.65, -0.77);
  }
  // hazard stripe along base
  for (let i = 0; i < 26; i++) box(0.05, 0.06, 0.01, i % 2 ? YEL : BLK, -1.65 + i * 0.1, 0.07, -0.785);
  // sink
  box(0.6, 0.02, 0.4, DARK, 0.5, 0.915, -1.1);
  cyl(0.02, 0.02, 0.3, STEEL, 0.5, 1.05, -1.3, 8);
  cyl(0.015, 0.015, 0.2, STEEL, 0.5, 1.2, -1.2, 8, [90, 0, 0]);
  // stove
  box(0.7, 0.03, 0.5, BLK, -1.0, 0.925, -1.1);
  for (const dx of [-0.17, 0.17]) for (const dz of [-0.12, 0.12]) {
    cyl(0.09, 0.09, 0.012, ORANGE, -1.0 + dx, 0.95, -1.1 + dz, 12);
  }
  // pot & kettle
  cyl(0.11, 0.11, 0.16, STEEL, -1.17, 1.03, -1.22, 12);
  cyl(0.115, 0.115, 0.02, GREY, -1.17, 1.12, -1.22, 12);
  box(0.12, 0.02, 0.02, DARK, -1.38, 1.05, -1.22);
  cyl(0.08, 0.1, 0.16, WHITE, -0.83, 1.02, -1.0, 10);
  cyl(0.02, 0.02, 0.04, RED, -0.83, 1.12, -1.0, 6);
  // microwave / oven
  box(0.6, 0.38, 0.4, BEIGE, 1.2, 1.1, -1.2);
  box(0.36, 0.26, 0.02, BLK, 1.12, 1.1, -0.99);
  glow(b.part(new THREE.BoxGeometry(0.34, 0.24, 0.01), "#ffb347", { at: [1.12, 1.1, -0.985] }), 0.8);
  for (let i = 0; i < 3; i++) cyl(0.02, 0.02, 0.02, DARK, 1.42, 1.2 - i * 0.1, -0.99, 8, [90, 0, 0]);
  // wall cabinets
  box(2.0, 0.45, 0.35, GREY, -0.6, 1.95, -1.25);
  for (let i = 0; i < 4; i++) {
    box(0.48, 0.4, 0.02, i % 2 ? TEAL : GREY, -1.35 + i * 0.5, 1.95, -1.07);
    box(0.04, 0.1, 0.02, DARK, -1.2 + i * 0.5, 1.95, -1.05);
  }

  // CRT panel right wall
  box(0.1, 1.5, 1.3, GREY, 1.7, 1.2, 0.2);
  box(0.06, 0.5, 0.6, BLK, 1.62, 1.55, 0.2);
  glow(b.part(new THREE.BoxGeometry(0.02, 0.4, 0.5), "#1c6a3a", { at: [1.59, 1.55, 0.2] }), 1.0);
  for (let i = 0; i < 5; i++) glow(box(0.015, 0.012, 0.36 - i * 0.05, GREEN, 1.575, 1.42 + i * 0.07, 0.2), 1.6);
  for (let i = 0; i < 6; i++) {
    cyl(0.025, 0.025, 0.03, i % 3 ? STEEL : RED, 1.62, 1.0, -0.15 + i * 0.1, 8, [0, 0, 90]);
    glow(box(0.02, 0.02, 0.02, i % 2 ? GREEN : ORANGE, 1.62, 0.88, -0.15 + i * 0.1), 1.5);
  }

  // mess table (center) with pedestal
  cyl(0.14, 0.2, 0.7, GREY, 0.2, 0.39, 0.4, 8);
  cyl(0.3, 0.3, 0.05, DARK, 0.2, 0.04 + 0.01, 0.4, 12);
  box(1.5, 0.05, 0.8, BEIGE, 0.2, 0.77, 0.4);
  box(1.54, 0.03, 0.84, STEEL, 0.2, 0.745, 0.4);
  // trays & cups
  for (const [x, z] of [[-0.3, 0.2], [0.2, 0.2], [0.7, 0.2], [-0.3, 0.62], [0.7, 0.62]] as [number, number][]) {
    box(0.34, 0.02, 0.24, TEAL, x, 0.81, z);
    box(0.28, 0.01, 0.18, GREY, x, 0.825, z);
    cyl(0.04, 0.035, 0.08, WHITE, x + 0.15, 0.86, z - 0.04, 8);
  }
  glow(cyl(0.05, 0.05, 0.14, ORANGE, 0.2, 0.9, 0.5, 8), 0.5);
  cyl(0.02, 0.02, 0.05, RED, 0.2, 0.995, 0.5, 6);

  // stools
  for (const [x, z] of [[-0.55, 0.4], [0.2, 1.05], [0.95, 0.9], [0.95, -0.1]] as [number, number][]) {
    cyl(0.18, 0.18, 0.06, RED, x, 0.5, z, 10);
    cyl(0.03, 0.03, 0.46, STEEL, x, 0.25, z, 6);
    cyl(0.17, 0.17, 0.03, DARK, x, 0.035, z, 10);
  }

  // hanging lamps
  for (const x of [-0.6, 0.2, 1.0]) {
    cyl(0.01, 0.01, 0.6, DARK, x, 2.2, 0.4, 5);
    cyl(0.06, 0.18, 0.12, GREY, x, 1.88, 0.4, 10);
    glow(cyl(0.14, 0.14, 0.02, "#fff2b8", x, 1.81, 0.4, 10), 2.0);
  }

  // ceiling strip lights + vent
  box(3.4, 0.03, 3.0, DARK, 0, 2.42, 0);
  glow(box(1.2, 0.02, 0.12, "#e8f4ff", -0.8, 2.39, -0.8), 1.8);
  glow(box(1.2, 0.02, 0.12, "#e8f4ff", 0.9, 2.39, -0.8), 1.8);
  box(0.5, 0.03, 0.5, BLK, 0.2, 2.395, 1.0);
  for (let i = 0; i < 5; i++) box(0.46, 0.01, 0.025, GREY, 0.2, 2.38, 0.82 + i * 0.09);

  // utensil rack
  box(0.6, 0.02, 0.02, STEEL, 0.5, 1.45, -1.37);
  for (let i = 0; i < 5; i++) {
    cyl(0.012, 0.012, 0.2, i % 2 ? STEEL : DARK, 0.3 + i * 0.1, 1.33, -1.37, 6);
    cyl(0.03, 0.03, 0.01, STEEL, 0.3 + i * 0.1, 1.2, -1.37, 8, [90, 0, 0]);
  }

  // door left with hazard
  box(0.1, 2.0, 1.1, GREY, -1.78, 1.02, 0.3);
  box(0.12, 1.7, 0.8, DARK, -1.79, 1.0, 0.3);
  for (let i = 0; i < 8; i++) box(0.13, 0.08, 0.08, i % 2 ? YEL : BLK, -1.8, 0.2 + i * 0.2, 0.75);
  glow(box(0.13, 0.08, 0.08, GREEN, -1.8, 1.9, 0.0), 1.5);

  return b.root;
}
```