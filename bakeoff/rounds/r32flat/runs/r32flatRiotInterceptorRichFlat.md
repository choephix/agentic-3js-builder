```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "NovaSec RC-9 Riot Interceptor",
  description:
    "Cyberpunk corporate riot-control interceptor: armored wedge hull, roof-mounted water cannon, tanks, neon light bars and underglow.",
};

const HULL = "#1b2132";
const HULL2 = "#2a3148";
const PLATE = "#0f121c";
const STEEL = "#5b6479";
const GLASS = "#0a1a26";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const RED = "#ff2a3c";
const YEL = "#ffd21a";
const WATER = "#2f86e0";

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  const box = (
    w: number, h: number, d: number, color: any,
    x: number, y: number, z: number,
    rot: [number, number, number] = [0, 0, 0],
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const neon = (
    w: number, h: number, d: number, color: string,
    x: number, y: number, z: number, s = 1.4,
    rot: [number, number, number] = [0, 0, 0],
  ) => glow(box(w, h, d, color, x, y, z, rot), s);
  const cyl = (
    r: number, len: number, color: any, at: [number, number, number],
    dir: [number, number, number], sides = 12, r2?: number,
  ) => b.part(new THREE.CylinderGeometry(r2 ?? r, r, len, sides), color, { at, dir });

  // ---------- chassis ----------
  b.part(new THREE.BoxGeometry(2.0, 0.7, 4.9), panelled(HULL, { size: 0.55, rivets: 0.06 }), { at: [0, 0.85, 0] });
  box(1.7, 0.12, 4.6, PLATE, 0, 0.45, 0); // skid plate
  box(1.9, 0.08, 4.8, STEEL, 0, 1.22, 0); // beltline trim

  // cabin: side-profile extrude (z, y)
  b.extrude(
    [
      [-2.45, 1.2], [2.45, 1.2], [2.52, 1.35], [1.5, 1.6],
      [1.0, 2.05], [-1.6, 2.1], [-2.45, 1.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.05, color: HULL2 },
  );

  // hood armor ribs
  for (let i = 0; i < 4; i++) box(1.7, 0.05, 0.14, STEEL, 0, 1.42 + 0 * i + 0.06 - i * 0.0, 1.95 - i * 0.12 + 0.0, [0, 0, 0]).position.y += 0;
  // windshield + cage
  box(1.6, 0.62, 0.04, GLASS, 0, 1.82, 1.27, [-45, 0, 0]);
  for (let i = -3; i <= 3; i++) box(0.03, 0.78, 0.03, PLATE, i * 0.24, 1.86, 1.31, [-45, 0, 0]);
  for (let j = 0; j < 3; j++) box(1.7, 0.03, 0.03, PLATE, 0, 1.68 + j * 0.16, 1.4 - j * 0.16, [-45, 0, 0]);

  // rear window
  box(1.5, 0.35, 0.04, GLASS, 0, 1.75, -2.22, [20, 0, 0]);

  // roof details
  box(1.5, 0.05, 2.2, PLATE, 0, 2.12, -0.5);
  for (const s of [1, -1]) {
    // side windows with bars
    box(0.04, 0.4, 1.7, GLASS, s * 0.96, 1.7, -0.4);
    for (let i = 0; i < 5; i++) box(0.05, 0.4, 0.03, PLATE, s * 0.97, 1.7, -1.1 + i * 0.4);
    // fenders
    box(0.55, 0.1, 1.35, PLATE, s * 1.12, 1.07, 1.6);
    box(0.55, 0.1, 1.35, PLATE, s * 1.12, 1.07, -1.6);
    // wheels
    for (const z of [1.6, -1.6]) {
      cyl(0.5, 0.4, "#111317", [s * 1.1, 0.5, z], [1, 0, 0], 14);
      cyl(0.3, 0.42, STEEL, [s * 1.1, 0.5, z], [1, 0, 0], 8);
      glow(cyl(0.2, 0.05, CYAN, [s * 1.32, 0.5, z], [1, 0, 0], 10), 1.5);
      cyl(0.05, 0.06, PLATE, [s * 1.34, 0.5, z], [1, 0, 0], 6);
    }
    // neon side stripes
    neon(0.03, 0.05, 2.1, CYAN, s * 1.015, 0.62, 0, 1.5);
    neon(0.03, 0.04, 4.4, MAG, s * 1.015, 1.17, 0, 1.3);
    // mirrors
    box(0.25, 0.14, 0.1, PLATE, s * 1.1, 1.75, 0.9);
    box(0.04, 0.05, 0.1, STEEL, s * 1.0, 1.7, 0.9);
    // headlights
    neon(0.55, 0.09, 0.05, "#ffffff", s * 0.7, 1.12, 2.5, 1.6);
    neon(0.2, 0.05, 0.05, CYAN, s * 0.7, 1.02, 2.51, 1.5);
    // tail lights
    neon(0.6, 0.1, 0.05, RED, s * 0.65, 1.1, -2.47, 1.5);
    // bumper hazard blocks
    for (let i = 0; i < 4; i++) box(0.22, 0.34, 0.32, i % 2 ? YEL : PLATE, s * (0.12 + i * 0.26) , 0.68, 2.62);
    // water tanks
    cyl(0.3, 1.4, WATER, [s * 0.55, 2.45, -1.0], [0, 0, 1], 10);
    for (const z of [-1.55, -0.45]) cyl(0.32, 0.07, STEEL, [s * 0.55, 2.45, z], [0, 0, 1], 10);
    glow(cyl(0.12, 0.05, CYAN, [s * 0.55, 2.45, -0.28], [0, 0, 1], 8), 1.4);
    // door seams
    box(0.03, 0.62, 0.03, PLATE, s * 1.012, 0.85, -0.8);
    box(0.03, 0.62, 0.03, PLATE, s * 1.012, 0.85, 1.25);
  }
  box(1.0, 0.1, 1.2, STEEL, 0, 2.0, 0.0); // dummy cover under turret
  for (let i = -3; i <= 3; i++) box(0.06, 0.38, 0.3, PLATE, i * 0.15, 1.0, -2.5);
  neon(1.9, 0.1, 0.05, RED, 0, 1.45, -2.5, 1.5);
  box(0.5, 0.2, 0.04, "#d8d8e0", 0, 1.18, -2.5);

  // front grille + bumper
  box(2.1, 0.36, 0.3, PLATE, 0, 0.68, 2.6);
  box(1.4, 0.3, 0.06, STEEL, 0, 0.95, 2.52);
  for (let i = -4; i <= 4; i++) box(0.04, 0.26, 0.04, PLATE, i * 0.15, 0.95, 2.56);
  neon(1.9, 0.06, 0.04, CYAN, 0, 0.8, 2.78, 1.5);

  // underglow
  neon(1.7, 0.04, 4.0, MAG, 0, 0.36, 0, 1.4);

  // roof light bar (rear edge)
  box(1.9, 0.12, 0.3, PLATE, 0, 2.2, -1.65);
  for (let i = 0; i < 8; i++) neon(0.2, 0.14, 0.26, i < 4 ? CYAN : MAG, -0.8 + i * 0.228, 2.28, -1.65, 1.8);
  // front mini bar on windshield header
  box(1.4, 0.08, 0.14, PLATE, 0, 2.12, 0.98);
  for (let i = 0; i < 6; i++) neon(0.2, 0.06, 0.1, i % 2 ? MAG : CYAN, -0.55 + i * 0.22, 2.15, 1.0, 1.6);

  // ---------- water cannon turret ----------
  cyl(0.38, 0.14, STEEL, [0, 2.2, 0.15], [0, 1, 0], 12);
  cyl(0.3, 0.3, HULL2, [0, 2.4, 0.15], [0, 1, 0], 8);
  box(0.5, 0.36, 0.6, HULL, 0, 2.62, 0.2);
  for (const s of [1, -1]) {
    box(0.06, 0.4, 0.5, STEEL, s * 0.3, 2.62, 0.2);
    neon(0.03, 0.05, 0.3, CYAN, s * 0.34, 2.7, 0.2, 1.5);
  }
  const bd: [number, number, number] = [0, 0.05, 1];
  cyl(0.15, 0.7, STEEL, [0, 2.65, 0.65], bd, 10);
  cyl(0.1, 1.6, HULL2, [0, 2.7, 1.2], bd, 10);
  for (const z of [0.9, 1.4, 1.9]) cyl(0.125, 0.07, YEL, [0, 2.7 + (z - 1.2) * 0.05, z], bd, 10);
  cyl(0.1, 0.3, PLATE, [0, 2.75, 2.1], bd, 10, 0.14);
  glow(cyl(0.08, 0.05, CYAN, [0, 2.77, 2.27], bd, 10), 1.8);
  cyl(0.04, 0.06, WATER, [0, 2.77, 2.3], bd, 8);
  // hose to tanks
  b.rod([0.1, 2.3, 0.0], [0.45, 2.45, -0.6], 0.04, "#161a24");
  b.rod([-0.1, 2.3, 0.0], [-0.45, 2.45, -0.6], 0.04, "#161a24");

  // ---------- logo and text ----------
  const logo = svg(
    `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
      <polygon points="4,36 20,4 36,36 28,36 20,18 12,36" fill="#ff2bd6"/>
      <circle cx="20" cy="26" r="4" fill="#19f0ff"/>
      <text x="46" y="20" font-family="sans-serif" font-weight="bold" font-size="17" fill="#19f0ff">NOVASEC</text>
      <text x="46" y="35" font-family="sans-serif" font-weight="bold" font-size="10" fill="#ffd21a">RIOT CTRL // RC-9</text>
    </svg>`,
    { size: 512 },
  );
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(1.6, 0.4), "#ffffff", {
        at: [s * 1.022, 0.9, 0.1], dir: [s, 0, 0], axis: "z", texture: logo,
      }),
      1.2,
    );
  }
  // roof marking number
  box(0.9, 0.01, 0.5, "#e8e8f0", 0, 2.15, -0.9);
  neon(0.5, 0.012, 0.08, RED, 0, 2.16, -0.9, 1.3);

  // antenna
  b.rod([0.8, 2.1, -1.0], [0.85, 3.0, -1.1], 0.015, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [0.85, 3.02, -1.1] }), 2);

  return b.root;
}
```