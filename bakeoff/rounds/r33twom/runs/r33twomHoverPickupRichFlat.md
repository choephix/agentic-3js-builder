```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Low-poly cyberpunk militarized pickup converted to four hover thrusters, with a bed-mounted twin railgun.",
};

const BODY = "#3a4252";
const BODY_HI = "#4d586b";
const BODY_LO = "#262c38";
const DARK = "#12141b";
const STEEL = "#7b8494";
const MAG = "#ff2bd6";
const CYAN = "#19f0ff";
const YEL = "#ffd21f";
const RED = "#ff3040";
const GLASS = "#0c4a5c";
const OLIVE = "#4a5240";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, rot?: [number, number, number], seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });
  const lit = (p: ReturnType<typeof box>, s = 1) => glow(p, s);

  // ---------- chassis & body ----------
  box(1.7, 0.28, 4.8, DARK, 0, 0.62, 0); // underbody
  box(1.2, 0.1, 4.4, STEEL, 0, 0.45, 0); // skid plate
  box(2.0, 0.5, 5.0, BODY, 0, 0.98, 0); // main lower body
  box(2.02, 0.08, 5.02, BODY_LO, 0, 0.72, 0); // sill
  box(1.9, 0.3, 1.25, BODY, 0, 1.28, 1.85); // hood
  box(1.9, 0.12, 0.8, BODY_HI, 0, 1.38, 2.0, [0, 0, 0]); // hood top plate
  box(1.9, 0.16, 0.7, BODY, 0, 1.18, 2.4, [14, 0, 0]); // sloped nose
  // cab
  box(1.88, 0.7, 1.55, BODY, 0, 1.6, 0.4);
  box(1.96, 0.1, 1.6, BODY_HI, 0, 1.98, 0.38); // roof
  box(1.7, 0.85, 0.05, GLASS, 0, 1.65, 1.2, [-30, 0, 0]); // windshield
  lit(box(1.5, 0.4, 0.05, GLASS, 0, 1.68, -0.4), 0.4);
  box(1.92, 0.08, 0.1, DARK, 0, 1.42, 1.18);

  // bed
  box(1.8, 0.08, 2.3, BODY_LO, 0, 1.24, -1.35); // floor
  box(1.9, 0.5, 0.1, BODY, 0, 1.45, -2.5); // tailgate
  box(1.9, 0.6, 0.1, BODY, 0, 1.5, -0.55); // bulkhead
  for (const s of [1, -1]) {
    box(0.1, 0.5, 2.3, BODY, s * 0.95, 1.5, -1.5);
    box(0.14, 0.06, 2.34, BODY_HI, s * 0.95, 1.77, -1.5);
    box(0.02, 0.1, 2.0, YEL, s * 1.01, 1.45, -1.5);
  }
  box(1.94, 0.06, 0.14, BODY_HI, 0, 1.77, -2.5);

  // roll bar
  for (const s of [1, -1]) {
    box(0.07, 0.8, 0.07, STEEL, s * 0.8, 1.7, -0.7);
    box(0.07, 0.07, 0.9, STEEL, s * 0.8, 2.1, -0.28);
  }
  box(1.67, 0.07, 0.07, STEEL, 0, 2.1, -0.7);

  // side details per side
  for (const s of [1, -1]) {
    // windows
    lit(box(0.04, 0.36, 1.15, GLASS, s * 0.95, 1.65, 0.45), 0.5);
    // door lines & handles
    box(0.03, 0.55, 0.03, DARK, s * 0.96, 1.15, 0.9);
    box(0.03, 0.55, 0.03, DARK, s * 0.96, 1.15, -0.2);
    box(0.04, 0.05, 0.2, STEEL, s * 0.97, 1.25, 0.65);
    // armor plating, angular
    box(0.1, 0.4, 1.1, OLIVE, s * 1.03, 1.0, 0.35);
    box(0.1, 0.2, 0.8, OLIVE, s * 1.0, 1.3, 2.0, [0, 0, s * 10]);
    // neon strip
    lit(box(0.04, 0.05, 4.4, MAG, s * 1.03, 0.76, 0), 1.2);
    // yellow stripe on armor
    box(0.02, 0.06, 1.0, YEL, s * 1.09, 1.0, 0.35);
    // mirror
    box(0.06, 0.06, 0.2, DARK, s * 1.08, 1.7, 1.0);
    box(0.05, 0.2, 0.14, BODY_LO, s * 1.14, 1.7, 1.0);
    // vents on fender
    for (let i = 0; i < 3; i++) box(0.03, 0.05, 0.22, DARK, s * 1.02, 1.1 + i * 0.07, 1.9);
    // number digits "07": 0 at x door
    const dx = s * 1.1;
    box(0.02, 0.3, 0.05, STEEL, dx, 1.12, -0.05 + 0.0);
    // headlight
    lit(box(0.42, 0.1, 0.06, "#e8ffff", s * 0.7, 1.12, 2.5), 1.6);
    lit(box(0.12, 0.1, 0.06, MAG, s * 0.95, 1.12, 2.5), 1.2);
    // tail light
    lit(box(0.4, 0.1, 0.06, RED, s * 0.7, 1.5, -2.57), 1.4);
    // hazard bumper blocks
    for (let i = 0; i < 3; i++) box(0.14, 0.1, 0.06, i % 2 ? DARK : YEL, s * (0.35 + i * 0.28), 0.85, 2.55, [0, 0, 20]);
  }

  // front: grille, bull bar
  box(1.1, 0.3, 0.06, DARK, 0, 1.0, 2.52);
  for (let i = 0; i < 4; i++) lit(box(0.9, 0.025, 0.02, CYAN, 0, 0.92 + i * 0.07, 2.56), 1);
  box(1.8, 0.18, 0.2, STEEL, 0, 0.78, 2.5);
  for (const s of [1, -1]) {
    box(0.07, 0.6, 0.07, STEEL, s * 0.75, 1.1, 2.62);
    box(0.07, 0.07, 0.3, STEEL, s * 0.75, 1.38, 2.5);
  }
  box(1.6, 0.07, 0.07, STEEL, 0, 1.38, 2.64);
  // hood emblem
  cyl(0.22, 0.22, 0.02, DARK, 0, 1.46, 1.9, undefined, 8);
  lit(cyl(0.15, 0.15, 0.03, MAG, 0, 1.47, 1.9, undefined, 8), 1.2);
  lit(cyl(0.06, 0.06, 0.04, CYAN, 0, 1.48, 1.9, undefined, 6), 1.2);
  // hood scoop / intake vents
  box(0.6, 0.1, 0.5, BODY_LO, 0, 1.46, 1.5);
  for (let i = 0; i < 4; i++) lit(box(0.5, 0.02, 0.04, CYAN, 0, 1.52, 1.35 + i * 0.1), 0.8);

  // number "07" on hood sides-ish: roof stencil
  box(0.3, 0.02, 0.05, YEL, -0.25, 2.04, 0.1);
  box(0.05, 0.02, 0.3, YEL, -0.4, 2.04, 0.25);
  box(0.05, 0.02, 0.3, YEL, -0.1, 2.04, 0.25);
  box(0.3, 0.02, 0.05, YEL, -0.25, 2.04, 0.4);
  box(0.3, 0.02, 0.05, YEL, 0.3, 2.04, 0.1);
  box(0.05, 0.02, 0.3, YEL, 0.45, 2.04, 0.25);
  box(0.05, 0.02, 0.3, YEL, 0.2, 2.04, 0.25, [0, 0, 0]);

  // roof light bar & antennas & dish
  box(1.2, 0.1, 0.18, DARK, 0, 2.08, 0.9);
  for (let i = 0; i < 4; i++) lit(box(0.26, 0.08, 0.2, i % 2 ? CYAN : MAG, -0.45 + i * 0.3, 2.14, 0.9), 1.4);
  for (const s of [1, -1]) {
    cyl(0.015, 0.015, 1.0, DARK, s * 0.85, 2.55, -0.55, undefined, 5);
    lit(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [s * 0.85, 3.06, -0.55] }), 1.5);
  }
  cyl(0.02, 0.02, 0.25, STEEL, 0.3, 2.2, -0.1, undefined, 5);
  b.part(new THREE.ConeGeometry(0.22, 0.14, 8, 1, true), STEEL, { at: [0.3, 2.35, -0.05], rotation: [-60, 0, 0] });
  lit(b.part(new THREE.SphereGeometry(0.03, 6, 4), CYAN, { at: [0.3, 2.35, 0.08] }), 1.2);

  // ---------- twin railgun turret ----------
  const TZ = -1.5;
  cyl(0.36, 0.42, 0.14, STEEL, 0, 1.35, TZ, undefined, 8);
  cyl(0.18, 0.2, 0.3, DARK, 0, 1.55, TZ, undefined, 8);
  box(0.7, 0.34, 0.8, OLIVE, 0, 1.85, TZ);
  box(0.74, 0.08, 0.5, BODY_HI, 0, 2.06, TZ - 0.05, [8, 0, 0]);
  for (const s of [1, -1]) {
    box(0.1, 0.34, 0.24, DARK, s * 0.4, 1.85, TZ + 0.05);
    cyl(0.055, 0.055, 1.5, STEEL, s * 0.2, 1.88, TZ + 1.0, [90, 0, 0], 8);
    cyl(0.08, 0.08, 0.2, DARK, s * 0.2, 1.88, TZ + 1.8, [90, 0, 0], 8); // muzzle brake
    lit(cyl(0.03, 0.03, 1.2, CYAN, s * 0.2, 1.88, TZ + 0.95, [90, 0, 0], 6), 1.4);
    lit(cyl(0.07, 0.07, 0.03, CYAN, s * 0.2, 1.88, TZ + 1.91, [90, 0, 0], 8), 1.6);
    box(0.2, 0.2, 0.3, YEL, s * 0.55, 1.4, TZ - 0.3); // ammo/cap boxes
    box(0.22, 0.04, 0.32, DARK, s * 0.55, 1.5, TZ - 0.3);
  }
  lit(box(0.3, 0.1, 0.06, CYAN, 0, 1.9, TZ + 0.42), 1.4); // sensor
  box(0.5, 0.2, 0.4, BODY_LO, 0, 1.36, -2.15); // battery/cap cases
  lit(box(0.4, 0.04, 0.04, MAG, 0, 1.47, -1.94), 1.2);

  // ---------- hover thrusters ----------
  const podAt: [number, number][] = [];
  for (const s of [1, -1]) for (const z of [1.6, -1.5]) podAt.push([s * 1.35, z]);
  for (const [x, z] of podAt) {
    const s = Math.sign(x);
    box(0.5, 0.18, 0.5, DARK, s * 1.12, 0.78, z); // strut arm
    box(0.12, 0.32, 0.12, STEEL, s * 1.3, 0.68, z);
    cyl(0.4, 0.46, 0.34, BODY_LO, x, 0.34, z, undefined, 8); // nacelle
    cyl(0.5, 0.5, 0.06, STEEL, x, 0.52, z, undefined, 8); // top collar
    lit(cyl(0.44, 0.44, 0.05, MAG, x, 0.14, z, undefined, 8), 1.1); // ring
    cyl(0.5, 0.5, 0.06, DARK, x, 0.08, z, undefined, 8); // lower lip
    lit(cyl(0.36, 0.36, 0.04, CYAN, x, 0.03, z, undefined, 8), 1.8); // thrust face
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      box(0.05, 0.28, 0.16, OLIVE, x + Math.sin(a) * 0.5, 0.36, z + Math.cos(a) * 0.5, [0, (a * 180) / Math.PI, 0]);
    }
    box(0.8, 0.05, 0.1, YEL, x, 0.56, z + 0.0); // hazard marking
  }
  // rear main thrusters
  for (const s of [1, -1]) {
    cyl(0.3, 0.34, 0.5, BODY_LO, s * 0.55, 0.95, -2.72, [90, 0, 0], 8);
    cyl(0.36, 0.36, 0.08, STEEL, s * 0.55, 0.95, -2.5, [90, 0, 0], 8);
    cyl(0.4, 0.4, 0.08, DARK, s * 0.55, 0.95, -2.95, [90, 0, 0], 8);
    lit(cyl(0.26, 0.26, 0.04, CYAN, s * 0.55, 0.95, -2.97, [90, 0, 0], 8), 1.8);
    lit(cyl(0.34, 0.34, 0.04, MAG, s * 0.55, 0.95, -2.8, [90, 0, 0], 8), 1.1);
    box(0.4, 0.1, 0.3, OLIVE, s * 0.55, 1.28, -2.72);
  }
  // underglow
  lit(box(1.3, 0.03, 3.8, MAG, 0, 0.42, 0), 1.0);
  lit(box(0.9, 0.03, 0.04, CYAN, 0, 0.44, 2.3), 1.2);

  return b.root;
}
```