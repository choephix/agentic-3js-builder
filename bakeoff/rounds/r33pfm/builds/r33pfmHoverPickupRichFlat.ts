import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "Militarized pickup converted to four hover thrusters, with a bed-mounted gun turret, missile pods and cyberpunk neon trim, in a low-poly style.",
};

const BODY = "#2a3040";
const PLATE = "#3d4a5e";
const DARK = "#14161f";
const STEEL = "#6b7585";
const CYAN = "#19f0ff";
const MAG = "#ff2fb4";
const YEL = "#ffd21a";
const GLASS = "#1a5f7a";
const OLIVE = "#4a5640";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  // axis: "x" | "y" | "z"
  const cyl = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, color: string, axis: "x" | "y" | "z" = "y") =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, {
      at: [x, y, z],
      rotation: axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : undefined,
    });
  const lit = (p: ReturnType<typeof box>, s = 1.4) => glow(p, s);

  // ---------- chassis & body ----------
  box(1.8, 0.3, 5.1, 0, 0.7, -0.05, DARK); // underbody
  box(2.0, 0.5, 5.3, 0, 1.1, -0.05, BODY); // lower body
  box(2.1, 0.18, 5.0, 0, 0.62, -0.05, PLATE); // skirt rail
  for (const s of [1, -1]) {
    box(0.1, 0.38, 3.0, s * 1.03, 1.0, 0.0, PLATE); // side armor
    lit(box(0.04, 0.05, 4.8, s * 1.06, 0.78, -0.05, CYAN), 1.6);
    lit(box(0.04, 0.04, 4.8, s * 1.06, 1.3, -0.05, MAG), 1.4);
    // fender flares over pods
    box(0.4, 0.14, 1.1, s * 1.1, 0.95, 1.75, PLATE, [0, 0, s * 12]);
    box(0.4, 0.14, 1.1, s * 1.1, 0.95, -1.6, PLATE, [0, 0, s * 12]);
    // rivets / bolts on side armor
    for (let i = 0; i < 5; i++) box(0.04, 0.05, 0.05, s * 1.09, 1.12, -1.2 + i * 0.7, STEEL);
  }

  // ---------- hood & front ----------
  box(1.9, 0.25, 1.4, 0, 1.47, 1.95, BODY);
  box(0.7, 0.1, 0.7, 0, 1.64, 1.9, PLATE); // scoop base
  box(0.5, 0.08, 0.1, 0, 1.7, 2.15, DARK);
  for (let i = 0; i < 3; i++) lit(box(0.4, 0.03, 0.05, 0, 1.69, 1.75 + i * 0.12, CYAN), 1.2);
  for (const s of [1, -1]) {
    box(0.08, 0.04, 1.0, s * 0.55, 1.61, 1.9, YEL, [0, s * 8, 0]); // racing stripes
    box(0.35, 0.3, 0.1, s * 0.82, 1.55, 2.62, PLATE); // headlight housings
    lit(box(0.28, 0.12, 0.06, s * 0.82, 1.55, 2.68, CYAN), 2);
  }
  box(1.4, 0.4, 0.1, 0, 1.3, 2.66, DARK); // grille
  for (let i = 0; i < 5; i++) box(1.3, 0.04, 0.04, 0, 1.15 + i * 0.08, 2.72, STEEL);
  box(2.1, 0.32, 0.3, 0, 0.95, 2.7, PLATE); // bumper
  for (let i = 0; i < 8; i++) box(0.24, 0.3, 0.05, -0.9 + i * 0.26, 0.95, 2.86, i % 2 ? DARK : YEL); // hazard
  for (const s of [1, -1]) box(0.08, 0.5, 0.08, s * 0.5, 1.2, 2.85, STEEL); // bull bars
  box(1.2, 0.08, 0.08, 0, 1.45, 2.85, STEEL);
  lit(box(1.8, 0.04, 0.04, 0, 0.8, 2.87, MAG), 1.6);

  // ---------- cab ----------
  box(1.9, 0.9, 1.4, 0, 1.9, 0.5, BODY);
  box(2.0, 0.1, 1.5, 0, 2.4, 0.5, PLATE); // roof
  box(1.7, 0.7, 0.07, 0, 1.97, 1.25, GLASS, [-28, 0, 0]); // windshield
  box(1.7, 0.45, 0.07, 0, 1.95, -0.22, GLASS); // rear window
  box(1.9, 0.12, 0.2, 0, 2.3, 1.38, DARK, [-28, 0, 0]); // visor
  for (const s of [1, -1]) {
    box(0.04, 0.45, 1.0, s * 0.96, 2.0, 0.5, GLASS); // side windows
    box(0.06, 0.04, 1.0, s * 0.97, 1.75, 0.5, DARK);
    box(0.06, 0.5, 0.05, s * 0.97, 1.9, 0.02, DARK); // door seam
    box(0.1, 0.06, 0.25, s * 0.98, 1.65, 0.9, STEEL); // handle
    box(0.35, 0.25, 0.06, s * 1.1, 1.9, 1.15, DARK); // mirror
    box(0.06, 0.06, 0.3, s * 1.0, 1.85, 1.1, STEEL);
    box(0.06, 0.55, 1.0, s * 1.0, 1.75, 0.5, OLIVE); // door armor plate lower
    lit(box(0.04, 0.04, 0.9, s * 1.04, 1.5, 0.5, YEL), 1.2);
  }
  // roof gear
  box(1.5, 0.12, 0.25, 0, 2.52, 0.9, DARK);
  for (let i = 0; i < 6; i++) lit(box(0.22, 0.1, 0.2, -0.55 + i * 0.22, 2.58, 0.9, i % 2 ? MAG : CYAN), 2);
  box(0.9, 0.06, 0.5, 0, 2.48, 0.1, STEEL);
  box(0.25, 0.14, 0.25, 0.4, 2.57, 0.1, OLIVE);
  cyl(0.015, 0.02, 0.9, 6, -0.8, 2.9, 0.0, STEEL);
  lit(b.part(new THREE.SphereGeometry(0.04, 6, 4), MAG, { at: [-0.8, 3.37, 0.0] }), 2);
  cyl(0.012, 0.015, 0.6, 6, 0.8, 2.75, 0.1, STEEL);
  lit(b.part(new THREE.SphereGeometry(0.035, 6, 4), CYAN, { at: [0.8, 3.07, 0.1] }), 2);

  // ---------- bed ----------
  box(1.9, 0.08, 2.4, 0, 1.39, -1.5, DARK); // floor
  box(1.9, 0.5, 0.12, 0, 1.6, -0.35, PLATE); // front wall
  box(1.9, 0.5, 0.1, 0, 1.6, -2.7, PLATE); // tailgate
  lit(box(1.5, 0.05, 0.03, 0, 1.62, -2.76, MAG), 1.6);
  for (const s of [1, -1]) {
    box(0.1, 0.5, 2.4, s * 0.95, 1.6, -1.5, BODY);
    box(0.14, 0.06, 2.45, s * 0.95, 1.88, -1.5, STEEL);
    box(0.1, 0.1, 0.1, s * 0.82, 1.5, -2.5, STEEL);
  }
  // roll cage
  for (const s of [1, -1]) {
    box(0.07, 1.0, 0.07, s * 0.8, 2.3, -0.5, STEEL);
    box(0.07, 0.07, 1.4, s * 0.8, 2.78, -1.2, STEEL);
    box(0.07, 0.07, 0.07, s * 0.8, 2.78, -1.9, STEEL);
    box(0.07, 0.9, 0.07, s * 0.8, 2.3, -1.9, STEEL);
  }
  box(1.67, 0.07, 0.07, 0, 2.78, -0.5, STEEL);
  box(1.67, 0.07, 0.07, 0, 2.78, -1.9, STEEL);
  // turret
  cyl(0.16, 0.2, 0.5, 8, 0, 1.68, -1.35, DARK);
  cyl(0.28, 0.28, 0.08, 10, 0, 1.96, -1.35, STEEL);
  box(0.36, 0.3, 0.5, 0, 2.15, -1.35, OLIVE);
  box(0.22, 0.2, 0.9, 0, 2.2, -0.85, DARK); // gun body
  cyl(0.05, 0.05, 0.9, 8, 0, 2.2, -0.15, STEEL, "z"); // barrel
  cyl(0.075, 0.075, 0.2, 8, 0, 2.2, 0.3, DARK, "z"); // muzzle brake
  lit(b.part(new THREE.SphereGeometry(0.04, 6, 4), MAG, { at: [0, 2.2, 0.41] }), 2);
  box(0.7, 0.5, 0.06, 0, 2.3, -0.62, PLATE, [-8, 0, 0]); // gun shield
  lit(box(0.4, 0.04, 0.02, 0, 2.38, -0.58, CYAN), 1.6);
  box(0.28, 0.2, 0.3, 0.3, 2.0, -1.5, YEL); // ammo box
  box(0.28, 0.04, 0.3, 0.3, 2.11, -1.5, DARK);
  // missile pod (left side)
  box(0.5, 0.42, 0.9, 0.55, 1.62, -2.15, DARK);
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 3; j++) {
      cyl(0.065, 0.065, 0.1, 8, 0.43 + i * 0.24 - 0.12 + 0.12, 1.5 + j * 0.0 + (j - 1) * 0.0 + 0.0 + 0.14 * (j - 1) + 0.12, -2.62, OLIVE, "z");
    }
  // supply crates (right side)
  box(0.55, 0.4, 0.6, -0.5, 1.63, -2.1, OLIVE);
  box(0.57, 0.05, 0.62, -0.5, 1.83, -2.1, DARK);
  lit(box(0.3, 0.05, 0.02, -0.5, 1.65, -2.41, YEL), 1.2);
  box(0.4, 0.3, 0.45, -0.55, 1.58, -1.0, PLATE);
  lit(box(0.2, 0.04, 0.02, -0.55, 1.6, -1.24, CYAN), 1.2);

  // ---------- rear thrusters ----------
  for (const s of [1, -1]) {
    cyl(0.3, 0.34, 0.6, 8, s * 0.55, 1.15, -2.95, DARK, "z");
    cyl(0.36, 0.36, 0.08, 8, s * 0.55, 1.15, -2.65, STEEL, "z");
    lit(cyl(0.24, 0.24, 0.05, 8, s * 0.55, 1.15, -3.27, CYAN, "z"), 2.2);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      box(0.05, 0.16, 0.3, s * 0.55 + Math.cos(a) * 0.34, 1.15 + Math.sin(a) * 0.34, -2.95, STEEL, [0, 0, (a * 180) / Math.PI - 90]);
    }
  }
  box(1.0, 0.1, 0.1, 0, 0.9, -2.72, STEEL);
  for (const s of [1, -1]) lit(box(0.3, 0.1, 0.05, s * 0.75, 1.3, -2.76, MAG), 2); // tail lights

  // ---------- hover pods ----------
  for (const sx of [1, -1])
    for (const z of [1.75, -1.6]) {
      const x = sx * 1.15;
      cyl(0.55, 0.62, 0.3, 8, x, 0.2, z, DARK); // housing
      cyl(0.6, 0.6, 0.06, 8, x, 0.38, z, STEEL); // top collar
      cyl(0.48, 0.48, 0.06, 8, x, 0.03, z, DARK); // bottom lip
      lit(cyl(0.4, 0.4, 0.04, 8, x, 0.02, z, CYAN), 2.4); // thrust glow
      lit(cyl(0.22, 0.22, 0.05, 8, x, 0.025, z, "#e8ffff"), 2.6);
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        box(0.06, 0.05, 0.4, x + Math.cos(a) * 0.2, 0.04, z + Math.sin(a) * 0.2, DARK, [0, -(a * 180) / Math.PI + 90, 0]);
      }
      box(0.3, 0.32, 0.3, sx * 1.02, 0.5, z, PLATE); // strut
      lit(box(0.04, 0.05, 0.5, x + sx * 0.6, 0.2, z, MAG), 1.4); // outer neon
      for (let k = 0; k < 3; k++) box(0.05, 0.05, 0.12, x + sx * 0.6, 0.3, z - 0.2 + k * 0.2, YEL);
    }

  // ---------- underglow plate ----------
  lit(box(1.3, 0.03, 4.0, 0, 0.53, -0.05, CYAN), 1.0);
  box(1.6, 0.05, 1.0, 0, 0.5, 0.0, DARK);

  return b.root;
}
