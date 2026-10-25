```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Riot Interceptor",
  description: "Armored corporate riot-control van with roof water cannon, water tank and neon light bars, Cyberpunk style.",
};

const GUN = "#1b1e27";
const PANEL = "#2b3040";
const PANEL2 = "#3a4156";
const DARK = "#0b0c11";
const WHITE = "#e8ecf5";
const MAG = "#ff2a8a";
const CYAN = "#19e6ff";
const YEL = "#ffd400";
const TIRE = "#101116";
const GLASS = "#0a2a3a";

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, rotation: rot });

  // ---- hull
  box(2.2, 0.8, 5.2, PANEL, 0, 0.85, 0); // lower hull
  box(2.3, 0.12, 5.3, DARK, 0, 0.47, 0); // skid plate
  box(2.0, 0.85, 2.2, GUN, 0, 1.72, 0.85); // cab
  box(2.0, 1.0, 2.5, PANEL, 0, 1.8, -1.35); // rear box
  box(2.1, 0.35, 1.1, PANEL2, 0, 1.4, 2.05, [8, 0, 0]); // hood
  box(2.05, 0.1, 2.3, PANEL2, 0, 2.18, 0.85); // cab roof plate
  // windshield + side windows + visor slits
  box(1.8, 0.62, 0.05, GLASS, 0, 1.82, 1.98, [-28, 0, 0]);
  box(1.9, 0.1, 0.06, CYAN, 0, 1.52, 2.08, [-28, 0, 0]);
  for (const s of [1, -1]) {
    box(0.04, 0.45, 1.3, GLASS, s * 1.02, 1.85, 0.9);
    box(0.05, 0.05, 1.4, CYAN, s * 1.03, 2.1, 0.9);
    box(0.05, 0.08, 2.0, DARK, s * 1.12, 1.9, -1.35); // rear slit
    // door seams
    box(0.03, 0.8, 0.03, DARK, s * 1.12, 1.0, 0.3);
    box(0.03, 0.8, 0.03, DARK, s * 1.12, 1.0, -0.5);
    // armour plates
    box(0.08, 0.45, 1.5, PANEL2, s * 1.13, 0.95, 1.5);
    box(0.08, 0.45, 1.8, PANEL2, s * 1.13, 0.95, -1.5);
    // neon side strips
    glow(box(0.05, 0.07, 4.4, s > 0 ? MAG : CYAN, s * 1.13, 0.68, -0.1), 1.6);
    glow(box(0.05, 0.05, 4.2, s > 0 ? CYAN : MAG, s * 1.13, 1.3, -0.1), 1.4);
    // mirrors
    box(0.25, 0.3, 0.1, DARK, s * 1.25, 1.9, 1.7);
    glow(box(0.2, 0.04, 0.02, CYAN, s * 1.25, 1.9, 1.76), 1.2);
    // headlights
    glow(box(0.5, 0.12, 0.06, "#eaffff", s * 0.7, 1.28, 2.62), 2);
    glow(box(0.2, 0.1, 0.06, MAG, s * 0.98, 1.0, 2.62), 1.6);
    // tail lights
    glow(box(0.4, 0.14, 0.06, "#ff2030", s * 0.75, 1.15, -2.62), 1.8);
    // siren domes
    cyl(0.14, 0.16, 0.14, 8, s > 0 ? MAG : CYAN, [s * 0.85, 2.31, 0.2]).mesh;
    glow(cyl(0.12, 0.14, 0.12, 8, s > 0 ? MAG : CYAN, [s * 0.85, 2.38, 0.2]), 2);
  }

  // ---- wheels
  const axles = [1.75, -0.85, -1.95];
  for (const z of axles)
    for (const s of [1, -1]) {
      cyl(0.52, 0.52, 0.5, 14, TIRE, [s * 1.05, 0.52, z], [0, 0, 90]);
      cyl(0.3, 0.3, 0.52, 10, PANEL2, [s * 1.05, 0.52, z], [0, 0, 90]);
      glow(cyl(0.2, 0.2, 0.54, 10, CYAN, [s * 1.05, 0.52, z], [0, 0, 90]), 1.3);
      cyl(0.1, 0.1, 0.58, 6, DARK, [s * 1.05, 0.52, z], [0, 0, 90]);
      // fender arch
      box(0.2, 0.15, 1.2, GUN, s * 1.15, 1.08, z);
    }

  // ---- front: grille, bumper, push bar
  box(1.8, 0.45, 0.12, DARK, 0, 0.95, 2.6);
  for (let i = -4; i <= 4; i++) box(0.05, 0.38, 0.05, PANEL2, i * 0.2, 0.95, 2.68);
  box(2.4, 0.22, 0.35, GUN, 0, 0.62, 2.62);
  glow(box(2.0, 0.06, 0.05, MAG, 0, 0.62, 2.82), 2);
  for (let i = 0; i < 9; i++) box(0.22, 0.28, 0.12, i % 2 ? YEL : DARK, -1.0 + i * 0.25, 0.38 + 0.5, 2.9 - 0.55 + 0.05 - 0.3);
  box(2.4, 0.08, 0.12, YEL, 0, 1.2, 2.78);
  box(0.12, 0.7, 0.12, GUN, 1.0, 0.95, 2.72);
  box(0.12, 0.7, 0.12, GUN, -1.0, 0.95, 2.72);

  // ---- roof light bar (alternating neon)
  box(1.9, 0.08, 0.35, DARK, 0, 2.28, 1.45);
  for (let i = 0; i < 8; i++) glow(box(0.2, 0.1, 0.28, i % 2 ? CYAN : MAG, -0.8 + i * 0.228, 2.34, 1.45), 2);
  // rear bumper & bar
  box(2.3, 0.3, 0.3, GUN, 0, 0.7, -2.7);
  glow(box(2.0, 0.07, 0.05, "#ff2030", 0, 0.95, -2.62), 1.6);

  // ---- water tank on rear roof
  cyl(0.55, 0.55, 2.3, 12, "#d7dce8", [0, 2.8, -1.35], [90, 0, 0]);
  for (const z of [-0.5, -1.0, -1.7, -2.2]) cyl(0.57, 0.57, 0.1, 12, PANEL2, [0, 2.8, z - 0.0], [90, 0, 0]);
  glow(box(0.06, 0.08, 1.9, CYAN, 0.0, 3.36, -1.35), 1.5);
  for (const s of [1, -1]) {
    glow(box(0.04, 0.5, 1.4, s > 0 ? CYAN : MAG, s * 0.56, 2.8, -1.35), 0.9);
    box(0.1, 0.2, 2.0, GUN, s * 0.5, 2.38, -1.35);
  }
  // water drop emblem on tank ends
  box(0.9, 0.9, 0.05, DARK, 0, 2.8, -2.55);
  glow(cyl(0.05, 0.3, 0.55, 3, CYAN, [0, 2.82, -2.6], [0, 0, 180]), 1.3);

  // ---- water cannon turret
  cyl(0.45, 0.5, 0.15, 12, PANEL2, [0, 2.31, 0.15]);
  cyl(0.32, 0.38, 0.4, 10, GUN, [0, 2.6, 0.15]);
  box(0.6, 0.35, 0.7, PANEL, 0, 2.95, 0.2);
  glow(box(0.62, 0.05, 0.05, MAG, 0, 3.12, 0.55), 1.8);
  for (const s of [1, -1]) box(0.1, 0.4, 0.5, GUN, s * 0.36, 2.95, 0.2);
  // barrel
  cyl(0.15, 0.15, 1.8, 10, DARK, [0, 3.1, 1.15], [84, 0, 0]);
  cyl(0.22, 0.22, 0.5, 10, PANEL2, [0, 3.0, 0.75], [84, 0, 0]);
  cyl(0.19, 0.19, 0.1, 10, YEL, [0, 3.14, 1.7], [84, 0, 0]);
  cyl(0.19, 0.19, 0.1, 10, YEL, [0, 3.2, 2.2], [84, 0, 0]);
  glow(cyl(0.17, 0.17, 0.08, 10, CYAN, [0, 3.27, 2.65], [84, 0, 0]), 2.2);
  cyl(0.11, 0.11, 0.1, 8, "#bfefff", [0, 3.28, 2.72], [84, 0, 0]);
  // hose to tank
  for (let i = 0; i < 6; i++) cyl(0.06, 0.06, 0.28, 6, "#222630", [0.35, 2.6 - i * 0.0, 0.0 - i * 0.25], [90, 0, 0]);

  // ---- antenna, camera, roof extras
  cyl(0.015, 0.015, 1.1, 5, DARK, [-0.8, 2.8, 0.2]);
  glow(cyl(0.04, 0.04, 0.06, 6, MAG, [-0.8, 3.36, 0.2]), 2);
  box(0.25, 0.15, 0.2, DARK, 0.8, 2.3, 0.2);
  glow(box(0.1, 0.06, 0.02, "#ff2030", 0.8, 2.3, 0.31), 2);

  // ---- corporate emblem & lettering on doors/flanks
  const emblem = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="none"/>
    <circle cx="30" cy="32" r="22" fill="none" stroke="#19e6ff" stroke-width="5"/>
    <path d="M30 14 L46 40 L14 40Z" fill="#ff2a8a"/>
    <text x="58" y="30" font-family="sans-serif" font-weight="bold" font-size="20" fill="#ffffff">ARASAKO</text>
    <text x="58" y="52" font-family="sans-serif" font-weight="bold" font-size="15" fill="#ffd400">RIOT UNIT</text></svg>`,
    { size: 512 },
  );
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(1.6, 0.8), "#ffffff", {
        at: [s * 1.185, 1.0, -1.45],
        dir: [s, 0, 0],
        axis: "z",
        texture: emblem,
      }),
      1.1,
    );
  }
  // hazard stripes on rear doors
  for (let i = 0; i < 8; i++) box(0.22, 0.2, 0.04, i % 2 ? YEL : DARK, -0.77 + i * 0.22, 1.5, -2.64);
  box(1.9, 0.9, 0.04, PANEL2, 0, 1.9, -2.6);
  box(0.04, 0.9, 0.05, DARK, 0, 1.9, -2.63);

  // underglow
  glow(box(1.8, 0.04, 4.4, MAG, 0, 0.4, 0), 1.2);

  return b.root;
}
```