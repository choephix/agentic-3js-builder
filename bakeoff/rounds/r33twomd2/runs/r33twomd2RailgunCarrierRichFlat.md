```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four hydraulic stabiliser legs, low-poly sci-fi military.",
};

const OLIVE = "#5c6b4b";
const OLIVE_D = "#434f37";
const OLIVE_L = "#76865f";
const DARK = "#24282a";
const STEEL = "#8a939b";
const STEEL_D = "#586067";
const ORANGE = "#e8892b";
const CYAN = "#46e3ff";
const TIRE = "#1b1c1f";
const RIM = "#6d7378";
const RED = "#ff3a2a";
const GLASS = "#1d3a4a";
const SAND = "#a79a6a";

export default function build() {
  const b = createBuilder({ name: "railgun-carrier" });

  type V = [number, number, number];
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (r: number, h: number, seg: number, c: string, at: V, dir: V = [0, 1, 0], r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), c, { at, dir });
  const ball = (r: number, c: string, at: V) => b.part(new THREE.SphereGeometry(r, 8, 6), c, { at });

  // ---------- hull ----------
  box(2.6, 1.0, 9.8, OLIVE, 0, 1.5, 0); // main body
  box(2.2, 0.35, 9.4, OLIVE_D, 0, 0.88, 0); // belly plate
  box(2.7, 0.12, 9.9, OLIVE_L, 0, 2.03, 0); // deck plate
  // sloped glacis in front
  box(2.6, 0.9, 1.4, OLIVE, 0, 1.5, 5.35, [-28, 0, 0]);
  box(2.0, 0.22, 0.9, OLIVE_L, 0, 1.95, 5.35, [-28, 0, 0]);
  // rear sloped plate
  box(2.6, 0.8, 0.9, OLIVE_D, 0, 1.45, -5.1, [24, 0, 0]);
  // side skirts and armour panels
  for (const s of [1, -1]) {
    box(0.12, 0.7, 9.0, OLIVE_D, s * 1.36, 1.25, 0.1);
    for (const z of [-3.9, -1.5, 1.6, 3.9]) {
      box(0.08, 0.55, 1.5, OLIVE_L, s * 1.43, 1.5, z);
      for (const dz of [-0.6, 0.6])
        for (const dy of [-0.2, 0.2]) cyl(0.04, 0.05, 6, STEEL, [s * 1.48, 1.5 + dy, z + dz], [1, 0, 0]);
    }
    // hazard stripe on skirt
    for (let i = 0; i < 8; i++) box(0.05, 0.14, 0.3, i % 2 ? DARK : ORANGE, s * 1.44, 0.98, -3.8 + i * 0.5);
    // grab handles
    box(0.06, 0.06, 0.5, STEEL, s * 1.45, 2.0, 2.6);
    box(0.06, 0.06, 0.5, STEEL, s * 1.45, 2.0, -3.2);
  }

  // ---------- wheels ----------
  const wheelZ = [3.5, 0.5, -2.5];
  const WR = 0.75;
  for (const s of [1, -1]) {
    for (const z of wheelZ) {
      const x = s * 1.65;
      cyl(WR, 0.6, 14, TIRE, [x, WR, z], [1, 0, 0]);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        box(0.62, 0.1, 0.24, TIRE, x, WR + Math.cos(a) * (WR + 0.02), z + Math.sin(a) * (WR + 0.02), [
          (a * 180) / Math.PI,
          0,
          0,
        ]);
      }
      cyl(0.48, 0.64, 12, RIM, [x, WR, z], [1, 0, 0]);
      cyl(0.3, 0.72, 10, STEEL_D, [x, WR, z], [1, 0, 0]);
      cyl(0.14, 0.78, 8, ORANGE, [x, WR, z], [1, 0, 0]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.04, 0.07, 6, STEEL, [x + s * 0.34, WR + Math.cos(a) * 0.38, z + Math.sin(a) * 0.38], [1, 0, 0]);
      }
      // fender
      box(0.7, 0.1, 1.7, OLIVE_D, x, 1.58, z);
      box(0.7, 0.34, 0.1, OLIVE_D, x, 1.45, z + 0.85, [-25, 0, 0]);
      box(0.7, 0.34, 0.1, OLIVE_D, x, 1.45, z - 0.85, [25, 0, 0]);
      // axle arm
      box(0.4, 0.2, 0.3, STEEL_D, s * 1.2, 0.75, z);
    }
    // mud flaps
    box(0.5, 0.4, 0.06, DARK, s * 1.65, 0.45, -3.35);
  }

  // ---------- cab ----------
  box(2.4, 1.0, 2.0, OLIVE, 0, 2.6, 3.9);
  box(2.3, 0.14, 1.9, OLIVE_L, 0, 3.15, 3.9); // roof
  box(2.2, 0.7, 0.12, GLASS, 0, 2.7, 4.95, [-18, 0, 0]); // windscreen
  box(2.0, 0.06, 0.08, DARK, 0, 3.08, 4.88);
  for (const s of [1, -1]) {
    box(0.08, 0.5, 1.1, GLASS, s * 1.22, 2.75, 4.0); // side window
    box(0.12, 0.6, 0.06, OLIVE_D, s * 1.22, 2.7, 3.4);
    // mirrors
    box(0.08, 0.04, 0.3, STEEL_D, s * 1.35, 2.9, 4.7);
    box(0.06, 0.4, 0.22, DARK, s * 1.45, 2.9, 4.8);
    // headlights
    glow(box(0.4, 0.2, 0.08, "#fff4c0", s * 0.9, 1.75, 6.0, [-28, 0, 0]), 1.4);
    box(0.5, 0.28, 0.06, DARK, s * 0.9, 1.75, 5.95, [-28, 0, 0]);
    // smoke launchers
    for (let i = 0; i < 3; i++) cyl(0.08, 0.3, 6, STEEL_D, [s * 1.05, 3.28, 3.4 + i * 0.22], [0, 0.7, 0.7]);
    // rear lamps
    glow(box(0.3, 0.12, 0.05, RED, s * 1.0, 1.55, -5.5), 1.2);
  }
  // roof gear
  cyl(0.05, 0.9, 5, STEEL, [-0.9, 3.65, 3.2]);
  ball(0.07, ORANGE, [-0.9, 4.12, 3.2]);
  cyl(0.28, 0.06, 10, STEEL, [0.9, 3.35, 3.4], [0, 1, 0.4]);
  cyl(0.04, 0.3, 6, STEEL_D, [0.9, 3.25, 3.4]);
  box(0.5, 0.18, 0.4, DARK, 0.7, 3.28, 4.35); // sensor block
  glow(box(0.3, 0.1, 0.04, CYAN, 0.7, 3.28, 4.56), 1.2);

  // front bumper & tow hooks
  box(2.7, 0.24, 0.3, DARK, 0, 1.0, 6.0);
  for (let i = 0; i < 9; i++) box(0.3, 0.2, 0.04, i % 2 ? DARK : ORANGE, -1.2 + i * 0.3, 1.0, 6.17);
  for (const s of [1, -1]) box(0.14, 0.14, 0.3, STEEL, s * 0.7, 0.85, 6.2);

  // emblem on hull: star chevron
  for (const s of [1, -1]) {
    box(0.04, 0.5, 0.18, ORANGE, s * 1.47, 1.55, 0.0, [0, 0, 0]);
    box(0.04, 0.5, 0.18, ORANGE, s * 1.47, 1.55, 0.35, [0, 0, 35]);
    box(0.04, 0.5, 0.18, ORANGE, s * 1.47, 1.55, -0.35, [0, 0, -35]);
  }

  // ---------- railgun mount ----------
  const GY = 3.6; // gun axis height
  // turntable
  cyl(1.25, 0.2, 16, STEEL_D, [0, 2.17, -1.4]);
  cyl(1.0, 0.16, 16, DARK, [0, 2.33, -1.4]);
  // cradle pylons
  for (const s of [1, -1]) {
    box(0.22, 1.2, 0.5, OLIVE_D, s * 0.8, 2.95, -2.2);
    box(0.22, 1.2, 0.5, OLIVE_D, s * 0.8, 2.95, 0.2);
    box(0.2, 0.2, 2.9, STEEL_D, s * 0.8, 3.5, -1.0);
    box(0.28, 0.12, 2.9, OLIVE_L, s * 0.8, 3.62, -1.0);
    // capacitor tanks
    cyl(0.32, 2.2, 10, OLIVE_L, [s * 1.0, 2.75, -2.9], [0, 0, 1].map((v) => v) as V);
    for (let i = 0; i < 4; i++) cyl(0.34, 0.1, 10, ORANGE, [s * 1.0, 2.75, -3.7 + i * 0.55], [0, 0, 1]);
    glow(box(0.1, 0.1, 0.1, CYAN, s * 1.0, 3.1, -3.9), 1.5);
  }
  // breech block
  box(1.3, 1.1, 2.2, OLIVE, 0, GY, -2.9);
  box(1.0, 0.2, 1.8, STEEL, 0, GY + 0.65, -2.9);
  box(1.0, 0.7, 0.3, DARK, 0, GY, -4.1);
  glow(box(0.6, 0.08, 0.06, CYAN, 0, GY + 0.2, -4.27), 1.4);
  glow(box(0.6, 0.08, 0.06, CYAN, 0, GY - 0.2, -4.27), 1.4);
  for (const s of [1, -1]) for (const z of [-3.6, -2.2]) cyl(0.05, 0.08, 6, STEEL, [s * 0.66, GY, z], [1, 0, 0]);

  // rails
  const railStart = -1.8;
  const railEnd = 7.4;
  const railLen = railEnd - railStart;
  const railMid = (railStart + railEnd) / 2;
  for (const s of [1, -1]) {
    box(0.26, 0.3, railLen, STEEL, s * 0.3, GY, railMid);
    box(0.1, 0.1, railLen, DARK, s * 0.3, GY + 0.2, railMid);
    box(0.3, 0.06, railLen, STEEL_D, s * 0.3, GY - 0.17, railMid);
    // muzzle tips
    box(0.3, 0.38, 0.2, STEEL_D, s * 0.3, GY, railEnd + 0.05, [0, 0, 0]);
  }
  box(0.34, 0.2, railLen, DARK, 0, GY, railMid); // insulator core
  glow(box(0.05, 0.05, railLen - 0.4, CYAN, 0, GY + 0.12, railMid), 1.5);
  // field coils along barrel
  const coils = 9;
  for (let i = 0; i < coils; i++) {
    const z = -1.2 + (i * 8) / (coils - 1);
    const big = i % 3 === 0;
    box(1.0, 0.62, 0.16, big ? ORANGE : STEEL_D, 0, GY, z);
    glow(box(0.5, 0.06, 0.18, CYAN, 0, GY + 0.33, z), 1.3);
    if (big) {
      box(0.1, 0.5, 0.2, DARK, 0.55, GY, z);
      box(0.1, 0.5, 0.2, DARK, -0.55, GY, z);
    }
  }
  // muzzle brake frame
  box(1.0, 0.1, 0.2, STEEL, 0, GY + 0.3, railEnd - 0.2);
  box(1.0, 0.1, 0.2, STEEL, 0, GY - 0.3, railEnd - 0.2);
  // barrel travel lock on cab roof
  box(0.9, 0.3, 0.5, DARK, 0, 3.35, 4.1);
  box(1.2, 0.08, 0.6, OLIVE_L, 0, 3.22, 4.1);
  // ammo slug rack on the deck
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) cyl(0.1, 0.9, 6, STEEL, [s * 0.9, 2.3, 0.9 + i * 0.28 - 0.2], [0, 1, 0]);
  // vents and hatches rear deck
  for (let i = 0; i < 5; i++) box(1.2, 0.05, 0.1, DARK, 0, 2.12, -4.7 + i * 0.16);
  cyl(0.28, 0.1, 10, STEEL_D, [0.7, 2.14, 1.3]);
  cyl(0.18, 0.12, 10, DARK, [0.7, 2.2, 1.3]);
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.12, 0.8, 8, DARK, [s * 1.1, 2.55, -4.3]);
    cyl(0.14, 0.08, 8, STEEL, [s * 1.1, 2.97, -4.3]);
  }

  // ---------- stabiliser legs ----------
  for (const s of [1, -1]) {
    for (const z of [2.0, -1.0]) {
      const x = s * 2.8;
      // hull mount bracket
      box(0.5, 0.5, 0.7, OLIVE_D, s * 1.5, 1.3, z);
      // horizontal arm
      b.rod([s * 1.5, 1.4, z], [x, 1.4, z], 0.17, OLIVE, { sides: 4 });
      // vertical hydraulics
      cyl(0.2, 0.8, 8, STEEL_D, [x, 1.2, z]);
      cyl(0.12, 0.9, 8, STEEL, [x, 0.55, z]);
      cyl(0.22, 0.12, 8, ORANGE, [x, 1.62, z]);
      // diagonal brace
      b.rod([s * 1.42, 0.95, z + 0.2], [x, 0.8, z + 0.2], 0.07, STEEL_D);
      b.rod([s * 1.42, 0.95, z - 0.2], [x, 0.8, z - 0.2], 0.07, STEEL_D);
      // foot
      cyl(0.2, 0.12, 8, DARK, [x, 0.2, z]);
      box(1.0, 0.16, 1.0, STEEL_D, x, 0.08, z);
      for (let i = 0; i < 5; i++) box(0.12, 0.04, 1.02, i % 2 ? DARK : ORANGE, x - 0.4 + i * 0.2, 0.17, z);
      glow(box(0.08, 0.08, 0.08, CYAN, x, 1.02, z + 0.22), 1.3);
    }
  }
  // rear spade
  box(2.4, 0.9, 0.12, STEEL_D, 0, 0.45, -5.75, [18, 0, 0]);
  box(2.4, 0.12, 0.4, OLIVE_D, 0, 1.0, -5.5);
  for (let i = 0; i < 5; i++) box(0.12, 0.3, 0.1, ORANGE, -0.96 + i * 0.48, 0.2, -5.68);

  // sand dust accents on lower hull
  for (const s of [1, -1]) box(0.06, 0.2, 8.4, SAND, s * 1.4, 0.92, 0.1);

  return b.root;
}
```