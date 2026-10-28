```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description:
    "A grimy 1979 Nostromo-style spaceship galley: steel counter with stove and sink, fridge, mess table with benches, hanging lamp, CRT menu screen, hatch and ceiling pipes.",
};

const WALL = "#b8b09a";
const WALL_D = "#8d8774";
const GREY = "#5a5e60";
const DARK = "#26282a";
const STEEL = "#a5abae";
const STEEL_D = "#737a7e";
const ORANGE = "#d9822b";
const AMBER = "#ffb347";
const GREEN = "#6dff9a";
const CREAM = "#ddd6bf";
const RED = "#b3402a";
const YEL = "#d8b52a";
const GRIME = "#6b6350";
const BLACK = "#141516";

export default function build() {
  const b = createBuilder({ name: "nostromo_galley" });

  const box = (x: number, y: number, z: number, w: number, h: number, d: number, c: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (
    x: number, y: number, z: number, r: number, h: number, c: string,
    dir: [number, number, number] = [0, 1, 0], seg = 12, r2 = r,
  ) => b.part(new THREE.CylinderGeometry(r2, r, h, seg), c, { at: [x, y, z], dir });
  const pipe = (a: number[], e: number[], r: number, c: string) => b.rod(a, e, r, c);

  // ---------- shell ----------
  box(0, 0.025, 0, 3.4, 0.05, 2.8, GREY); // floor
  for (let i = 0; i < 15; i++) box(-1.4 + i * 0.2, 0.052, 0, 0.03, 0.006, 2.8, DARK); // grating lines
  for (let i = 0; i < 12; i++) box(0, 0.052, -1.3 + i * 0.24, 3.4, 0.006, 0.03, DARK);
  for (let i = 0; i < 14; i++) box(-1.62 + i * 0.25, 0.054, 1.36, 0.12, 0.006, 0.07, i % 2 ? DARK : YEL); // hazard edge

  box(0, 1.2, -1.4, 3.5, 2.4, 0.1, WALL); // back wall
  box(1.75, 1.2, 0, 0.1, 2.4, 2.8, WALL); // side wall (+X)
  box(0, 0.5, -1.345, 3.4, 0.9, 0.01, WALL_D); // dado
  box(0, 1.25, -1.34, 3.4, 0.09, 0.02, ORANGE); // stripe
  box(0, 1.14, -1.34, 3.4, 0.02, 0.02, DARK);
  for (let i = 0; i < 6; i++) box(-1.5 + i * 0.6, 1.5, -1.345, 0.02, 1.8, 0.012, STEEL_D); // seams
  for (let i = 0; i < 5; i++) box(1.695, 1.3, -1.0 + i * 0.6, 0.012, 2.2, 0.02, STEEL_D);
  box(1.695, 1.25, 0, 0.02, 0.09, 2.8, ORANGE);
  // grime streaks
  for (let i = 0; i < 7; i++) box(-1.4 + i * 0.5, 1.75, -1.34, 0.12, 0.5 - (i % 3) * 0.1, 0.004, GRIME);

  // vent grille
  box(-0.4, 2.1, -1.33, 0.6, 0.25, 0.03, DARK);
  for (let i = 0; i < 6; i++) box(-0.4, 2.02 + i * 0.035, -1.31, 0.56, 0.01, 0.02, STEEL_D);
  // warning plate
  box(-1.3, 2.1, -1.335, 0.3, 0.2, 0.012, YEL);
  box(-1.3, 2.1, -1.325, 0.26, 0.04, 0.01, DARK);
  box(-1.3, 2.04, -1.325, 0.2, 0.02, 0.01, DARK);

  // ---------- ceiling ----------
  for (let i = 0; i < 4; i++) box(-1.2 + i * 0.8, 2.38, 0, 0.1, 0.1, 2.8, STEEL_D);
  box(0, 2.42, -1.2, 3.4, 0.12, 0.3, GREY);
  pipe([-1.7, 2.25, -1.1], [1.7, 2.25, -1.1], 0.07, STEEL);
  pipe([-1.7, 2.25, -0.9], [1.7, 2.25, -0.9], 0.04, ORANGE);
  pipe([-1.7, 2.18, -1.25], [1.7, 2.18, -1.25], 0.035, RED);
  for (let i = 0; i < 7; i++) cyl(-1.5 + i * 0.5, 2.25, -1.1, 0.085, 0.05, STEEL_D, [0, 0, 1]); // pipe clamps
  // hanging cables
  for (let i = 0; i < 4; i++) {
    const x = 1.1 + i * 0.12;
    pipe([x, 2.2, -0.6], [x + 0.05, 1.85, -0.55 + i * 0.05], 0.012, BLACK);
  }

  // ---------- counter ----------
  box(-0.55, 0.45, -1.05, 2.2, 0.9, 0.6, GREY);
  box(-0.55, 0.92, -1.05, 2.24, 0.045, 0.64, STEEL);
  box(-0.55, 0.06, -0.74, 2.2, 0.1, 0.02, DARK); // kick plate
  const doorX = [-1.375, -0.825, -0.275, 0.275];
  doorX.forEach((x, i) => {
    box(x, 0.48, -0.745, 0.5, 0.74, 0.02, i % 2 ? STEEL_D : STEEL);
    box(x, 0.48, -0.733, 0.42, 0.66, 0.006, i % 2 ? STEEL : STEEL_D);
    cyl(x + 0.18, 0.6, -0.72, 0.012, 0.1, DARK, [0, 1, 0], 6);
    box(x, 0.12, -0.735, 0.3, 0.03, 0.01, DARK);
    box(x, 0.88, -0.735, 0.1, 0.03, 0.01, ORANGE);
  });
  // stove
  const sx = -0.825;
  for (const [dx, dz] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) {
    const ring = b.part(new THREE.TorusGeometry(0.07, 0.014, 6, 12), DARK, { at: [sx + dx, 0.96, -1.05 + dz], dir: [0, 1, 0], axis: "z" });
    void ring;
    cyl(sx + dx, 0.95, -1.05 + dz, 0.035, 0.02, STEEL_D, [0, 1, 0], 8);
  }
  glow(cyl(sx - 0.12, 0.964, -1.17, 0.05, 0.004, RED, [0, 1, 0], 10), 1.2);
  for (let i = 0; i < 4; i++) cyl(sx - 0.15 + i * 0.1, 0.84, -0.725, 0.022, 0.03, DARK, [0, 0, 1], 8);
  // pot
  cyl(sx + 0.12, 1.03, -1.17, 0.09, 0.14, STEEL_D, [0, 1, 0], 12);
  cyl(sx + 0.12, 1.11, -1.17, 0.095, 0.02, STEEL, [0, 1, 0], 12);
  box(sx + 0.27, 1.07, -1.17, 0.12, 0.02, 0.025, DARK);
  // hood
  b.frustumBox([sx, 1.95, -1.1], [sx, 1.62, -1.1], [0.32, 0.3], [0.8, 0.55], { color: STEEL_D });
  box(sx, 1.57, -0.85, 0.7, 0.04, 0.03, DARK);
  glow(box(sx, 1.55, -0.87, 0.5, 0.02, 0.15, AMBER), 1.2);
  box(sx, 2.2, -1.1, 0.3, 0.45, 0.3, STEEL_D);
  // sink
  const kx = 0.275;
  box(kx, 0.945, -1.05, 0.46, 0.012, 0.42, DARK);
  box(kx, 0.953, -1.05, 0.38, 0.01, 0.34, STEEL_D);
  b.sweep([[kx, 0.95, -1.3], [kx, 1.2, -1.3], [kx, 1.25, -1.2], [kx, 1.18, -1.1]], 0.014, STEEL_D);
  cyl(kx - 0.07, 0.98, -1.3, 0.02, 0.05, RED, [0, 1, 0], 8);
  cyl(kx + 0.07, 0.98, -1.3, 0.02, 0.05, STEEL, [0, 1, 0], 8);
  // coffee machine
  const cx = -1.4;
  box(cx, 1.12, -1.15, 0.3, 0.4, 0.3, CREAM);
  box(cx, 1.28, -1.0, 0.3, 0.1, 0.03, ORANGE);
  box(cx, 1.04, -1.0, 0.2, 0.025, 0.12, DARK);
  glow(box(cx + 0.09, 1.2, -0.995, 0.04, 0.03, 0.01, GREEN), 1.5);
  cyl(cx, 0.99, -1.0, 0.055, 0.1, "#3a2a1c", [0, 1, 0], 8);
  cyl(cx, 1.04, -1.0, 0.058, 0.02, DARK, [0, 1, 0], 8);
  // bread bin & jars
  box(-0.3, 1.0, -1.15, 0.28, 0.14, 0.22, ORANGE);
  box(-0.3, 1.075, -1.15, 0.28, 0.02, 0.22, STEEL_D);
  cyl(-0.05, 1.02, -1.2, 0.05, 0.18, CREAM, [0, 1, 0], 8);
  cyl(-0.05, 1.12, -1.2, 0.055, 0.03, RED, [0, 1, 0], 8);

  // upper shelf
  box(-0.9, 1.5, -1.23, 1.6, 0.03, 0.25, STEEL_D);
  box(-0.9, 1.43, -1.32, 1.6, 0.14, 0.03, DARK);
  for (const x of [-1.65, -0.15]) pipe([x, 1.5, -1.35], [x, 1.5, -1.15], 0.015, DARK);
  for (let i = 0; i < 5; i++) {
    const x = -1.5 + i * 0.12;
    cyl(x, 1.58, -1.22, 0.04, 0.1, i % 2 ? CREAM : ORANGE, [0, 1, 0], 8);
    box(x + 0.04, 1.6, -1.18, 0.012, 0.045, 0.012, DARK);
  }
  for (let i = 0; i < 3; i++) {
    cyl(-0.75 + i * 0.1, 1.58, -1.2, 0.04, 0.12, STEEL, [0, 1, 0], 8);
    cyl(-0.75 + i * 0.1, 1.58, -1.16, 0.041, 0.04, i === 1 ? RED : YEL, [0, 1, 0], 8);
  }
  box(-0.3, 1.6, -1.22, 0.2, 0.14, 0.16, GREY);
  box(-0.3, 1.6, -1.138, 0.14, 0.05, 0.005, YEL);

  // ---------- fridge ----------
  const fx = 1.2;
  box(fx, 0.97, -1.0, 0.7, 1.84, 0.7, STEEL);
  box(fx, 0.06, -0.64, 0.7, 0.1, 0.02, DARK);
  box(fx, 1.45, -0.645, 0.62, 0.7, 0.02, STEEL_D);
  box(fx, 0.62, -0.645, 0.62, 1.0, 0.02, STEEL_D);
  box(fx, 0.97, -0.64, 0.7, 0.025, 0.02, DARK);
  box(fx + 0.27, 1.45, -0.62, 0.025, 0.4, 0.03, DARK);
  box(fx + 0.27, 0.7, -0.62, 0.025, 0.5, 0.03, DARK);
  box(fx - 0.1, 1.7, -0.635, 0.3, 0.1, 0.01, DARK);
  glow(box(fx - 0.1, 1.7, -0.628, 0.26, 0.05, 0.005, GREEN), 1.3);
  glow(box(fx + 0.2, 1.7, -0.63, 0.04, 0.04, 0.01, RED), 1.4);
  box(fx - 0.2, 1.2, -0.635, 0.16, 0.12, 0.004, YEL);
  for (let i = 0; i < 4; i++) box(fx - 0.2, 1.17 + i * 0.03, -0.632, 0.12, 0.008, 0.004, DARK);

  // ---------- side wall: screen + hatch ----------
  const MENU = svg(
    `<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="110" fill="#06200f"/>
      <text x="8" y="22" font-family="monospace" font-weight="bold" font-size="14" fill="#6dff9a">NOSTROMO</text>
      <text x="8" y="38" font-family="monospace" font-size="10" fill="#6dff9a">GALLEY STATUS: OK</text>
      <rect x="8" y="46" width="144" height="2" fill="#6dff9a"/>
      <text x="8" y="62" font-family="monospace" font-size="10" fill="#6dff9a">COFFEE ..... READY</text>
      <text x="8" y="76" font-family="monospace" font-size="10" fill="#6dff9a">CRYO-STORE . -18C</text>
      <text x="8" y="90" font-family="monospace" font-size="10" fill="#6dff9a">MEAL 04:00  CREW 7</text>
      <rect x="8" y="98" width="8" height="9" fill="#6dff9a"/>
    </svg>`,
    { size: 256 },
  );
  box(1.62, 1.55, -0.1, 0.16, 0.5, 0.56, CREAM);
  box(1.545, 1.55, -0.1, 0.02, 0.4, 0.46, DARK);
  glow(
    b.part(new THREE.PlaneGeometry(0.4, 0.3), "#ffffff", { at: [1.532, 1.55, -0.1], dir: [-1, 0, 0], axis: "z", texture: MENU }),
    1.2,
  );
  box(1.55, 1.3, -0.1, 0.1, 0.03, 0.4, DARK);
  for (let i = 0; i < 4; i++) cyl(1.5, 1.3, -0.25 + i * 0.1, 0.018, 0.04, i === 0 ? RED : ORANGE, [1, 0, 0], 8);
  box(1.66, 1.88, -0.1, 0.1, 0.08, 0.56, DARK); // cable duct to ceiling
  pipe([1.64, 1.9, -0.1], [1.64, 2.38, -0.1], 0.04, BLACK);

  // hatch
  box(1.675, 1.0, 0.95, 0.06, 1.95, 0.95, DARK);
  box(1.65, 1.0, 0.95, 0.04, 1.8, 0.8, STEEL_D);
  box(1.625, 1.0, 0.95, 0.02, 1.7, 0.7, STEEL);
  cyl(1.615, 1.45, 0.95, 0.15, 0.03, DARK, [1, 0, 0], 12);
  glow(cyl(1.6, 1.45, 0.95, 0.12, 0.02, "#9ad8c0", [1, 0, 0], 12), 0.6);
  b.part(new THREE.TorusGeometry(0.15, 0.015, 5, 12), STEEL_D, { at: [1.6, 1.45, 0.95], dir: [1, 0, 0], axis: "z" });
  cyl(1.6, 0.95, 0.68, 0.04, 0.05, RED, [1, 0, 0], 8);
  box(1.61, 0.95, 0.68, 0.03, 0.2, 0.025, DARK);
  for (let i = 0; i < 6; i++) box(1.612, 0.1 + i * 0.03, 0.95, 0.01, 0.015, 0.6, i % 2 ? YEL : DARK);

  // ---------- mess table ----------
  const tx = -0.3, tz = 0.5;
  box(tx, 0.74, tz, 1.7, 0.05, 0.85, STEEL);
  box(tx, 0.705, tz, 1.74, 0.025, 0.89, DARK);
  box(tx, 0.76, tz, 1.5, 0.004, 0.65, STEEL_D);
  for (const x of [-0.55, 0.55]) {
    cyl(tx + x, 0.38, tz, 0.05, 0.69, STEEL_D, [0, 1, 0], 8);
    cyl(tx + x, 0.07, tz, 0.17, 0.04, DARK, [0, 1, 0], 10, 0.2);
  }
  box(tx, 0.4, tz, 1.1, 0.04, 0.05, STEEL_D);
  // trays & food
  const trays: [number, number, number][] = [[-0.55, -0.15, 1], [-0.1, 0.18, -1], [0.4, -0.15, 1]];
  trays.forEach(([dx, dz]) => {
    box(tx + dx, 0.77, tz + dz, 0.4, 0.015, 0.3, CREAM);
    box(tx + dx - 0.1, 0.785, tz + dz, 0.14, 0.015, 0.22, ORANGE);
    box(tx + dx + 0.07, 0.785, tz + dz - 0.06, 0.18, 0.015, 0.1, "#8a6a3a");
    box(tx + dx + 0.07, 0.785, tz + dz + 0.07, 0.18, 0.015, 0.1, "#9a4a32");
    box(tx + dx, 0.775, tz + dz + 0.155, 0.4, 0.02, 0.012, GRIME);
  });
  for (const [dx, dz] of [[-0.2, 0.15], [0.25, 0.12], [0.62, 0.05]]) {
    cyl(tx + dx, 0.82, tz + dz, 0.04, 0.08, dx > 0.3 ? ORANGE : CREAM, [0, 1, 0], 8);
    box(tx + dx + 0.05, 0.82, tz + dz, 0.02, 0.04, 0.012, DARK);
  }
  cyl(tx - 0.7, 0.8, tz + 0.1, 0.1, 0.05, STEEL_D, [0, 1, 0], 10, 0.07); // bowl
  cyl(tx + 0.7, 0.81, tz - 0.05, 0.018, 0.07, STEEL, [0, 1, 0], 8);
  cyl(tx + 0.74, 0.81, tz - 0.05, 0.018, 0.07, RED, [0, 1, 0], 8);

  // benches
  for (const dz of [-0.78, 0.78]) {
    box(tx, 0.44, tz + dz, 1.6, 0.06, 0.32, STEEL_D);
    box(tx, 0.485, tz + dz, 1.54, 0.04, 0.28, ORANGE);
    box(tx, 0.51, tz + dz, 1.5, 0.01, 0.01, DARK);
    for (const x of [-0.7, 0.7]) {
      box(tx + x, 0.21, tz + dz, 0.06, 0.4, 0.28, GREY);
      box(tx + x, 0.02, tz + dz, 0.12, 0.04, 0.34, DARK);
    }
  }

  // hanging lamp
  const lx = tx, lz = tz;
  pipe([lx - 0.4, 2.3, lz], [lx - 0.4, 1.7, lz], 0.01, DARK);
  pipe([lx + 0.4, 2.3, lz], [lx + 0.4, 1.7, lz], 0.01, DARK);
  box(lx, 1.7, lz, 1.0, 0.06, 0.3, STEEL_D);
  box(lx, 1.66, lz, 1.0, 0.02, 0.32, DARK);
  glow(box(lx, 1.64, lz, 0.9, 0.02, 0.22, AMBER), 1.6);
  for (const x of [-0.5, 0.5]) box(lx + x, 1.68, lz, 0.03, 0.1, 0.32, DARK);

  // floor details: stray mug, bin, crate
  cyl(0.9, 0.1, 0.1, 0.0, 0.0, DARK); // (no-op placeholder removed visually)
  cyl(1.45, 0.25, 0.0, 0.16, 0.4, GREY, [0, 1, 0], 10);
  cyl(1.45, 0.46, 0.0, 0.17, 0.03, STEEL_D, [0, 1, 0], 10);
  box(1.45, 0.3, 0.17, 0.12, 0.08, 0.01, YEL);
  box(-1.45, 0.17, 0.9, 0.5, 0.24, 0.4, ORANGE);
  box(-1.45, 0.3, 0.9, 0.52, 0.03, 0.42, STEEL_D);
  box(-1.45, 0.17, 1.105, 0.3, 0.1, 0.01, DARK);
  box(-1.45, 0.17, 1.108, 0.2, 0.03, 0.01, YEL);

  return b.root;
}
```