import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot-Control Interceptor RCU-7",
  description:
    "Corporate armored riot-suppression interceptor with a roof water cannon, hazard bumper, light bars and neon underglow. Cyberpunk style.",
};

const ARMOR = "#232a3a";
const ARMOR_LT = "#3a4458";
const PANEL = "#c4cad6";
const DARK = "#0d1018";
const GLASS = "#0a1826";
const TIRE = "#121318";
const SIDEWALL = "#252830";
const RIM = "#7b8497";
const HAZ = "#f2c200";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const RED = "#ff1f3d";
const BLUE = "#2a5bff";
const WHITE = "#d6fcff";
const WATER = "#58c8ff";

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  type Opt = Record<string, unknown>;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const cyl = (r1: number, r2: number, len: number, c: string, x: number, y: number, z: number, dir: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r1, r2, len, seg), c, { at: [x, y, z], dir });
  const X = [1, 0, 0];
  const Y = [0, 1, 0];
  const Z = [0, 0, 1];

  // ---------- Logo texture ----------
  const LOGO = svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="196" height="96" rx="6" fill="#0b0f1a" stroke="#19f0ff" stroke-width="4"/>
      <polygon points="40,14 62,26 62,50 40,62 18,50 18,26" fill="none" stroke="#ff2bd6" stroke-width="5"/>
      <polygon points="40,26 52,33 52,45 40,52 28,45 28,33" fill="#19f0ff"/>
      <text x="78" y="42" font-family="sans-serif" font-weight="bold" font-size="30" fill="#ffffff">RCU-7</text>
      <rect x="78" y="50" width="108" height="5" fill="#f2c200"/>
      <text x="78" y="75" font-family="sans-serif" font-weight="bold" font-size="14" fill="#19f0ff">CIVIL ORDER DIV.</text>
      <text x="20" y="90" font-family="sans-serif" font-size="9" fill="#ff2bd6">NO LOITERING // COMPLY</text>
    </svg>`,
    { size: 512 },
  );

  // ---------- Hull ----------
  box(2.1, 0.7, 5.2, ARMOR, 0, 0.9, 0); // main hull
  box(1.9, 0.18, 4.8, DARK, 0, 0.5, 0); // chassis pan
  box(2.0, 0.28, 1.5, ARMOR_LT, 0, 1.39, 1.85); // hood
  box(1.7, 0.04, 0.9, DARK, 0, 1.55, 1.9); // hood vent insert
  for (let i = 0; i < 5; i++) box(1.5, 0.02, 0.05, MAG, 0, 1.57, 1.55 + i * 0.18); // hood vent slits
  glow(box(0.05, 0.05, 0.05, MAG, 0, 0, 0)); // tiny placeholder removed visually below
  box(2.0, 0.75, 1.9, ARMOR, 0, 1.62, 0.5); // cabin
  box(2.15, 1.0, 2.4, ARMOR_LT, 0, 1.75, -1.4); // rear equipment box
  box(2.05, 0.06, 2.3, PANEL, 0, 2.27, -1.4); // rear roof plate

  // windshield + pillars
  box(1.8, 0.62, 0.05, GLASS, 0, 1.75, 1.68, { rotation: [-35, 0, 0] });
  box(1.8, 0.02, 0.04, CYAN, 0, 2.02, 1.5, {});
  for (const s of [1, -1]) {
    b.extrude(
      [
        [1.45, 1.5],
        [1.95, 1.5],
        [1.45, 2.0],
      ],
      { at: [s * 0.95, 0, 0], x: [0, 0, 1], thickness: 0.1, color: ARMOR },
    );
    // side windows with riot bars
    box(0.04, 0.4, 1.2, GLASS, s * 1.01, 1.7, 0.6);
    box(0.03, 0.02, 1.2, CYAN, s * 1.03, 1.5, 0.6);
    for (let i = 0; i < 5; i++) box(0.04, 0.42, 0.04, DARK, s * 1.04, 1.7, 0.1 + i * 0.25);
    // door seam & handle
    box(0.02, 0.7, 0.03, DARK, s * 1.06, 0.92, 0.1);
    box(0.02, 0.7, 0.03, DARK, s * 1.06, 0.92, 1.1);
    box(0.04, 0.05, 0.22, RIM, s * 1.07, 1.1, 0.25);
    // logo plate
    b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", {
      at: [s * 1.075, 0.88, 0.6],
      dir: [s, 0, 0],
      axis: "z",
      texture: LOGO,
    });
    // neon strips
    glow(box(0.04, 0.05, 4.4, CYAN, s * 1.08, 0.54, 0), 2);
    glow(box(0.03, 0.05, 4.7, MAG, s * 1.08, 1.17, 0), 1.6);
    // rear box armor slats and water gauge
    for (let i = 0; i < 6; i++) box(0.07, 0.8, 0.12, ARMOR, s * 1.1, 1.75, -0.6 - i * 0.38);
    glow(box(0.04, 0.7, 0.1, WATER, s * 1.14, 1.75, -2.5), 1.4);
    box(0.05, 0.78, 0.2, DARK, s * 1.12, 1.75, -2.5);
    // skirts with hazard stripes
    for (let i = 0; i < 9; i++) box(0.06, 0.13, 0.17, i % 2 ? DARK : HAZ, s * 1.07, 0.66, -0.75 + i * 0.2);
    // mirrors
    box(0.3, 0.04, 0.04, DARK, s * 1.15, 1.75, 1.25);
    box(0.06, 0.26, 0.18, ARMOR_LT, s * 1.3, 1.75, 1.25);
    glow(box(0.02, 0.2, 0.12, CYAN, s * 1.33, 1.75, 1.25));
    // spotlights on cabin sides
    cyl(0.07, 0.07, 0.1, DARK, s * 1.0, 2.07, 1.15, Z);
    glow(cyl(0.055, 0.055, 0.02, WHITE, s * 1.0, 2.07, 1.21, Z), 2);
  }

  // ---------- Wheels ----------
  for (const zc of [1.6, -1.5])
    for (const s of [1, -1]) {
      cyl(0.5, 0.5, 0.4, TIRE, s * 1.1, 0.5, zc, X, 18);
      cyl(0.41, 0.41, 0.41, SIDEWALL, s * 1.1, 0.5, zc, X, 18);
      cyl(0.3, 0.3, 0.43, RIM, s * 1.1, 0.5, zc, X, 10);
      glow(cyl(0.2, 0.2, 0.02, CYAN, s * 1.32, 0.5, zc, X, 12), 1.5);
      cyl(0.1, 0.1, 0.05, DARK, s * 1.33, 0.5, zc, X, 8);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        cyl(0.025, 0.025, 0.06, ARMOR, s * 1.34, 0.5 + Math.cos(a) * 0.25, zc + Math.sin(a) * 0.25, X, 6);
      }
      box(0.62, 0.1, 1.25, ARMOR_LT, s * 1.1, 1.06, zc); // fender flare
      box(0.08, 0.3, 1.25, ARMOR_LT, s * 1.4, 0.92, zc); // outer lip
      glow(box(0.02, 0.03, 1.0, MAG, s * 1.45, 1.06, zc), 1.4);
    }

  // ---------- Front end ----------
  box(2.3, 0.35, 0.35, ARMOR, 0, 0.66, 2.7); // bumper
  for (let i = 0; i < 10; i++) box(0.2, 0.36, 0.02, i % 2 ? DARK : HAZ, -1.0 + i * 0.222, 0.66, 2.885);
  box(1.8, 0.45, 0.12, DARK, 0, 1.0, 2.62); // grille
  for (let i = 0; i < 4; i++) glow(box(1.7, 0.02, 0.03, MAG, 0, 0.88 + i * 0.1, 2.69), 1.5);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.08, 0.05, WHITE, s * 0.72, 1.25, 2.62), 2.2); // headlights
    glow(box(0.2, 0.05, 0.04, CYAN, s * 0.72, 1.17, 2.63), 2);
    cyl(0.06, 0.06, 0.1, DARK, s * 1.0, 0.65, 2.8, Z);
    glow(cyl(0.045, 0.045, 0.02, HAZ, s * 1.0, 0.65, 2.86, Z), 1.5);
    box(0.08, 0.5, 0.08, ARMOR_LT, s * 0.35, 0.9, 2.9); // ram posts
  }
  box(1.0, 0.1, 0.1, ARMOR_LT, 0, 1.05, 2.92);
  box(2.0, 0.06, 0.4, DARK, 0, 0.36, 2.5); // skid plate
  glow(box(1.6, 0.03, 0.03, CYAN, 0, 0.46, 2.88), 2);

  // ---------- Roof light bar ----------
  box(1.7, 0.1, 0.28, DARK, 0, 2.06, 0.95);
  for (let i = 0; i < 8; i++) glow(box(0.19, 0.08, 0.26, i < 4 ? RED : BLUE, -0.74 + i * 0.211, 2.14, 0.95), 2.4);
  glow(box(1.7, 0.03, 0.03, WHITE, 0, 2.12, 1.1), 1.8);
  // sensor dome
  b.part(new THREE.SphereGeometry(0.16, 8, 6), ARMOR_LT, { at: [0, 2.0, 0.2] });
  glow(cyl(0.05, 0.05, 0.06, RED, 0, 2.08, 0.34, Z, 8), 2.5);
  // antennas
  for (const s of [1, -1]) {
    cyl(0.012, 0.012, 0.8, DARK, s * 0.8, 2.65, -0.3, Y, 5);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [s * 0.8, 3.05, -0.3] }), 2);
  }

  // ---------- Water cannon turret ----------
  const tz = -1.3;
  cyl(0.6, 0.6, 0.12, ARMOR, 0, 2.36, tz, Y, 14);
  glow(cyl(0.62, 0.62, 0.03, CYAN, 0, 2.31, tz, Y, 14), 2);
  box(0.9, 0.5, 1.0, ARMOR_LT, 0, 2.68, tz);
  box(0.92, 0.1, 1.02, HAZ, 0, 2.5, tz);
  for (const s of [1, -1]) {
    box(0.06, 0.34, 0.6, DARK, s * 0.47, 2.7, tz);
    glow(box(0.02, 0.1, 0.4, WATER, s * 0.5, 2.7, tz), 1.5);
  }
  box(0.5, 0.14, 0.5, DARK, 0, 2.99, tz - 0.1);
  // barrel
  const bd = [0, 0.1, 1];
  cyl(0.15, 0.15, 0.8, ARMOR, 0, 2.78, tz + 0.7, bd, 10);
  cyl(0.1, 0.1, 1.6, DARK, 0, 2.84, tz + 1.2, bd, 10);
  cyl(0.17, 0.17, 0.12, HAZ, 0, 2.83, tz + 0.55, bd, 10);
  cyl(0.17, 0.17, 0.08, HAZ, 0, 2.9, tz + 1.5, bd, 10);
  cyl(0.15, 0.1, 0.3, ARMOR_LT, 0, 2.98, tz + 2.0, bd, 10);
  glow(cyl(0.085, 0.085, 0.05, WATER, 0, 3.0, tz + 2.17, bd, 10), 2.2);
  // hose
  b.sweep(
    catmull([
      [0.2, 2.55, tz - 0.5],
      [0.45, 2.45, tz - 0.9],
      [0.35, 2.35, tz - 1.0],
    ]),
    0.04,
    { color: DARK },
  );
  // roof spotlight rack at tail of rear box
  box(1.6, 0.1, 0.2, DARK, 0, 2.33, -2.45);
  for (let i = 0; i < 6; i++) glow(box(0.2, 0.06, 0.04, i % 2 ? MAG : CYAN, -0.65 + i * 0.26, 2.33, -2.56), 2);

  // ---------- Rear ----------
  box(2.1, 0.3, 0.3, ARMOR, 0, 0.7, -2.7);
  for (let i = 0; i < 10; i++) box(0.2, 0.31, 0.02, i % 2 ? DARK : HAZ, -1.0 + i * 0.222, 0.7, -2.86);
  glow(box(1.8, 0.1, 0.04, RED, 0, 1.95, -2.62), 2.2);
  for (const s of [1, -1]) {
    glow(box(0.25, 0.3, 0.04, RED, s * 0.9, 1.15, -2.62), 2);
    cyl(0.07, 0.07, 0.4, RIM, s * 0.6, 0.55, -2.75, Z, 8);
    glow(cyl(0.05, 0.05, 0.02, MAG, s * 0.6, 0.55, -2.96, Z, 8), 1.5);
  }
  box(0.04, 1.0, 0.04, DARK, 0, 1.6, -2.63);
  box(1.0, 0.6, 0.03, DARK, 0, 1.55, -2.62);
  b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
    at: [0, 1.55, -2.64],
    dir: [0, 0, -1],
    axis: "z",
    texture: LOGO,
  });
  // ladder
  for (const s of [1, -1]) box(0.04, 1.0, 0.04, RIM, s * 0.95, 1.7, -2.66);
  for (let i = 0; i < 5; i++) box(1.9, 0.03, 0.03, RIM, 0, 1.3 + i * 0.2, -2.67);

  return b.root;
}
