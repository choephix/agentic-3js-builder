```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Wraithback 2077 Armored Truck",
  description:
    "Low-poly cyberpunk 8x8 militarized truck with a roof railgun turret, missile pods, neon underglow, armor plating and a lit sensor suite.",
};

// ---------- palette ----------
const HULL = "#2c3440";
const HULL2 = "#232a34";
const ARMOR = "#394152";
const ARMOR2 = "#4c576c";
const OLIVE = "#3b4a3f";
const DARK = "#14161c";
const BLACK = "#0a0b0e";
const TIRE = "#17181c";
const TIRE2 = "#23252b";
const STEEL = "#7a8496";
const YEL = "#f2c200";
const MAG = "#ff2a8a";
const CYAN = "#22e6ff";
const ORANGE = "#ff7a1a";
const RED = "#ff2433";
const GLASS = "#0b4a66";
const D2R = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "truck2077" });

  // ---------- helpers ----------
  type R = number[] | undefined;
  const rot = (r: R) => (r ? { rotation: r } : {});
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, r?: R) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...rot(r) });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, r?: R) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], flat: true, ...rot(r) });
  const cone = (r: number, h: number, seg: number, c: string, x: number, y: number, z: number, rr?: R) =>
    b.part(new THREE.ConeGeometry(r, h, seg), c, { at: [x, y, z], flat: true, ...rot(rr) });
  const sph = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z], flat: true });
  const gbox = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, k = 1.4, r?: R) =>
    glow(box(w, h, d, c, x, y, z, r), k);
  const gcyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, k = 1.4, r?: R) =>
    glow(cyl(rt, rb, h, seg, c, x, y, z, r), k);
  const SIDES = [1, -1];

  // ---------- chassis & underbody ----------
  box(2.0, 0.35, 7.9, DARK, 0, 1.1, -0.1);
  for (const s of SIDES) {
    box(0.12, 0.2, 7.6, STEEL, s * 0.85, 0.9, -0.1);
  }
  // driveshaft + transfer
  cyl(0.06, 0.06, 6.6, 8, STEEL, 0, 0.78, -0.2, [90, 0, 0]);
  for (let i = 0; i < 6; i++) cyl(0.09, 0.09, 0.08, 8, ORANGE, 0, 0.78, -3.0 + i * 1.2, [90, 0, 0]);

  // axles, diffs, shocks
  const AXLES = [2.6, 1.0, -1.6, -3.2];
  for (const z of AXLES) {
    cyl(0.1, 0.1, 2.6, 8, STEEL, 0, 0.62, z, [0, 0, 90]);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), ARMOR2, { at: [0, 0.62, z], flat: true, scale: [1, 0.9, 1] });
    cyl(0.12, 0.12, 0.1, 8, DARK, 0, 0.62, z + 0.28);
    for (const s of SIDES) {
      cyl(0.05, 0.05, 0.55, 6, ORANGE, s * 0.85, 0.98, z + 0.2, [0, 0, s * 12]);
      cyl(0.07, 0.07, 0.3, 6, DARK, s * 0.85, 0.85, z + 0.2, [0, 0, s * 12]);
      box(0.12, 0.05, 1.1, STEEL, s * 0.9, 0.82, z); // leaf spring
    }
  }

  // ---------- wheels ----------
  const WY = 0.62;
  const WX = 1.3;
  function wheel(s: number, zc: number) {
    const x = s * WX;
    cyl(0.56, 0.56, 0.5, 16, TIRE, x, WY, zc, [0, 0, 90]);
    cyl(0.44, 0.44, 0.52, 12, TIRE2, x, WY, zc, [0, 0, 90]);
    for (let i = 0; i < 12; i++) {
      const a = i * 30;
      box(0.54, 0.1, 0.22, TIRE, x, WY + 0.58 * Math.cos(a * D2R), zc + 0.58 * Math.sin(a * D2R), [a, 0, 0]);
    }
    cyl(0.34, 0.34, 0.06, 10, STEEL, x + s * 0.26, WY, zc, [0, 0, 90]);
    cyl(0.25, 0.25, 0.04, 12, CYAN, x + s * 0.29, WY, zc, [0, 0, 90]);
    glow(cyl(0.22, 0.22, 0.045, 12, CYAN, x + s * 0.3, WY, zc, [0, 0, 90]), 1.6);
    cyl(0.12, 0.12, 0.08, 8, DARK, x + s * 0.32, WY, zc, [0, 0, 90]);
    for (let i = 0; i < 6; i++) {
      const a = i * 60 * D2R;
      cyl(0.035, 0.035, 0.07, 6, STEEL, x + s * 0.3, WY + 0.29 * Math.cos(a), zc + 0.29 * Math.sin(a), [0, 0, 90]);
    }
    // brake disc and caliper (inner)
    cyl(0.3, 0.3, 0.04, 10, STEEL, x - s * 0.22, WY, zc, [0, 0, 90]);
    box(0.1, 0.16, 0.12, MAG, x - s * 0.22, WY + 0.28, zc);
    // fender + flare + mudflap
    box(0.7, 0.08, 1.45, ARMOR, s * 1.3, 1.31, zc);
    box(0.07, 0.38, 1.35, ARMOR2, s * 1.64, 1.2, zc);
    box(0.05, 0.4, 0.5, BLACK, s * 1.5, 0.55, zc - 0.78);
    box(0.06, 0.1, 0.3, YEL, s * 1.5, 0.42, zc - 0.78);
    gbox(0.04, 0.04, 1.2, s > 0 ? CYAN : MAG, s * 1.675, 1.12, zc, 1.3);
  }
  for (const z of AXLES) for (const s of SIDES) wheel(s, z);

  // underglow
  for (const s of SIDES) gbox(0.06, 0.04, 5.6, MAG, s * 0.75, 0.84, -0.4, 1.6);
  gbox(1.6, 0.04, 0.06, MAG, 0, 0.84, 3.2, 1.6);
  gbox(1.6, 0.04, 0.06, MAG, 0, 0.84, -3.8, 1.6);

  // side fuel/battery tanks
  for (const s of SIDES) {
    cyl(0.28, 0.28, 1.3, 10, STEEL, s * 1.12, 0.98, -0.3, [90, 0, 0]);
    for (const dz of [-0.85, 0.25]) cyl(0.3, 0.3, 0.06, 10, YEL, s * 1.12, 0.98, dz - 0.1, [90, 0, 0]);
    gbox(0.06, 0.06, 0.6, CYAN, s * 1.4, 0.98, -0.3, 1.5);
  }

  // ---------- cab ----------
  const cabOutline: [number, number, "sharp"][] = [
    [1.5, 1.3, "sharp"],
    [3.6, 1.3, "sharp"],
    [3.6, 1.85, "sharp"],
    [3.2, 2.0, "sharp"],
    [2.8, 2.75, "sharp"],
    [1.5, 2.75, "sharp"],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.1, color: HULL });
  // windshield & side glass
  glow(box(1.75, 0.04, 0.88, GLASS, 0, 2.39, 3.03, [62, 0, 0]), 0.8);
  box(1.85, 0.08, 0.08, DARK, 0, 2.77, 2.8);
  for (const s of SIDES) {
    glow(box(0.04, 0.42, 0.85, GLASS, s * 1.055, 2.4, 2.15), 0.8);
    box(0.05, 0.05, 0.95, DARK, s * 1.06, 2.64, 2.15);
    box(0.05, 0.05, 0.95, DARK, s * 1.06, 2.17, 2.15);
    box(0.03, 0.7, 0.03, DARK, s * 1.06, 2.4, 1.62);
    box(0.03, 0.7, 0.03, DARK, s * 1.06, 2.4, 2.72);
    box(0.06, 0.05, 0.18, STEEL, s * 1.07, 2.05, 2.55); // handle
    // armor slab on cab lower
    box(0.08, 0.55, 1.3, ARMOR, s * 1.09, 1.62, 2.55);
    for (let i = 0; i < 3; i++) box(0.04, 0.1, 0.35, YEL, s * 1.14, 1.62, 2.1 + i * 0.45 + 0.0, [s * 35, 0, 0]);
    box(0.1, 0.4, 0.8, OLIVE, s * 1.1, 2.05, 1.9, [0, 0, 0]);
    // mirrors
    box(0.3, 0.04, 0.04, DARK, s * 1.2, 2.45, 2.85);
    box(0.06, 0.3, 0.2, DARK, s * 1.38, 2.45, 2.85);
    gbox(0.02, 0.22, 0.14, CYAN, s * 1.42, 2.45, 2.85, 0.9);
    // smoke dischargers
    for (let i = 0; i < 3; i++) {
      cyl(0.06, 0.06, 0.32, 6, DARK, s * 1.13, 2.25 + i * 0.14, 1.62, [90, 0, 0]);
      cyl(0.04, 0.04, 0.02, 6, ORANGE, s * 1.13, 2.25 + i * 0.14, 1.79, [90, 0, 0]);
    }
    // headlights + brows
    gbox(0.4, 0.14, 0.05, "#bff6ff", s * 0.85, 1.68, 3.63, 1.8);
    box(0.5, 0.06, 0.1, DARK, s * 0.85, 1.8, 3.64, [0, 0, s * -12]);
    gbox(0.12, 0.1, 0.05, ORANGE, s * 0.95, 1.46, 3.63, 1.4);
    // front fenders above bumper
    box(0.3, 0.3, 0.3, ARMOR2, s * 1.05, 1.5, 3.55);
    // bumper stripes
    for (let i = 0; i < 4; i++) box(0.16, 0.36, 0.04, YEL, s * (0.35 + i * 0.22), 1.0, 4.0, [0, 0, 25]);
    // roof spot lamps
    gbox(0.2, 0.12, 0.12, "#fff2c0", s * 0.95, 2.93, 2.8, 1.6);
    box(0.25, 0.16, 0.08, DARK, s * 0.95, 2.93, 2.72);
    // exhaust stacks
    cyl(0.1, 0.1, 1.8, 8, STEEL, s * 1.26, 2.5, 1.15);
    cyl(0.13, 0.11, 0.12, 8, DARK, s * 1.26, 3.43, 1.15);
    gcyl(0.115, 0.115, 0.05, 8, ORANGE, s * 1.26, 3.2, 1.15, 1.6);
    gcyl(0.115, 0.115, 0.05, 8, ORANGE, s * 1.26, 2.1, 1.15, 1.6);
    box(0.2, 0.1, 0.2, DARK, s * 1.2, 1.9, 1.15);
    box(0.2, 0.1, 0.2, DARK, s * 1.2, 2.9, 1.15);
    box(0.04, 1.2, 0.3, ARMOR2, s * 1.38, 2.45, 1.15); // heat shield
  }
  // front fascia
  box(1.8, 0.5, 0.05, DARK, 0, 1.6, 3.61);
  for (let i = 0; i < 5; i++) gbox(1.5, 0.045, 0.04, MAG, 0, 1.4 + i * 0.1, 3.64, 1.5);
  box(0.06, 0.5, 0.06, STEEL, 0, 1.6, 3.65);
  // hood plate + ridges
  box(1.9, 0.06, 0.5, ARMOR2, 0, 1.98, 3.4, [20, 0, 0]);
  for (const s of SIDES) {
    box(0.1, 0.07, 0.5, DARK, s * 0.55, 2.02, 3.4, [20, 0, 0]);
    gbox(0.03, 0.03, 0.4, CYAN, s * 0.55, 2.06, 3.4, 1.4, [20, 0, 0]);
  }
  // bumper & plow & winch
  box(2.5, 0.4, 0.5, ARMOR, 0, 1.0, 3.8);
  box(2.4, 0.55, 0.1, ARMOR2, 0, 0.82, 4.12, [-28, 0, 0]);
  cyl(0.12, 0.12, 0.9, 8, STEEL, 0, 1.0, 4.08, [0, 0, 90]);
  gbox(0.5, 0.05, 0.05, RED, 0, 1.22, 4.06, 1.4);
  // cab roof
  box(2.2, 0.1, 1.5, ARMOR, 0, 2.8, 2.15);
  for (const s of SIDES) box(0.08, 0.1, 1.5, ARMOR2, s * 1.05, 2.86, 2.15);
  for (let i = 0; i < 8; i++) gbox(0.2, 0.08, 0.1, i % 2 ? CYAN : MAG, -0.7 + i * 0.2, 2.9, 2.62, 1.6);
  // lidar
  cyl(0.14, 0.18, 0.1, 8, DARK, -0.6, 2.9, 1.9);
  cyl(0.12, 0.12, 0.22, 8, STEEL, -0.6, 3.05, 1.9);
  gcyl(0.125, 0.125, 0.05, 8, CYAN, -0.6, 3.07, 1.9, 1.8);
  // radar dish
  cyl(0.04, 0.04, 0.3, 6, DARK, 0.6, 2.97, 1.9);
  cyl(0.28, 0.05, 0.1, 10, ARMOR2, 0.6, 3.17, 1.95, [-30, 0, 0]);
  gbox(0.05, 0.05, 0.05, RED, 0.6, 3.25, 2.1, 1.5);
  sph(0.1, GLASS, 0.1, 2.9, 1.7);
  // antennas
  for (const s of SIDES) {
    cyl(0.015, 0.02, 1.6, 6, STEEL, s * 0.95, 3.6, 1.65);
    glow(sph(0.035, RED, s * 0.95, 4.42, 1.65), 2);
  }
  // door numbers
  const TAG = svg(
    `<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="212" height="102" fill="none" stroke="#ff2a8a" stroke-width="5"/>
      <text x="110" y="70" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="66" fill="#ff2a8a">2077</text>
      <text x="110" y="98" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#22e6ff">WRAITHBACK</text>
    </svg>`,
    { size: 256 },
  );

  // ---------- rear hull ----------
  const rearOutline: [number, number, "sharp"][] = [
    [1.3, 1.3, "sharp"],
    [1.3, 2.5, "sharp"],
    [-3.4, 2.5, "sharp"],
    [-3.9, 2.0, "sharp"],
    [-3.9, 1.3, "sharp"],
  ];
  b.extrude(rearOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, color: HULL2 });
  box(2.1, 0.06, 4.4, HULL, 0, 2.53, -1.1);
  for (const s of SIDES) {
    for (let i = 0; i < 8; i++) {
      const z = -3.4 + i * 0.6;
      if (z > -1.95 && z < -0.65) continue;
      box(0.08, 0.95, 0.1, ARMOR2, s * 1.17, 1.9, z);
      if (i % 2 === 0) box(0.03, 0.5, 0.45, OLIVE, s * 1.165, 1.85, z + 0.3);
    }
    gbox(0.04, 0.05, 4.6, MAG, s * 1.16, 1.45, -1.3, 1.5);
    gbox(0.04, 0.05, 3.2, CYAN, s * 1.16, 2.38, -1.3, 1.4);
    // lower skirt plates
    box(0.06, 0.18, 4.5, ARMOR, s * 1.17, 1.38, -1.3);
    // cargo tag
    glow(b.part(new THREE.PlaneGeometry(1.1, 0.55), "#ffffff", { at: [s * 1.156, 1.92, -1.3], dir: [s, 0, 0], axis: "z", texture: TAG }), 1.2);
    // missile pods
    box(0.55, 0.72, 1.2, ARMOR, s * 0.9, 2.92, -2.6);
    box(0.6, 0.06, 1.25, ARMOR2, s * 0.9, 3.3, -2.6);
    for (let cx = 0; cx < 2; cx++)
      for (let cy = 0; cy < 3; cy++) {
        const px = s * (0.9 + (cx - 0.5) * 0.26);
        const py = 2.7 + cy * 0.22;
        cyl(0.09, 0.09, 0.05, 8, BLACK, px, py, -1.99, [90, 0, 0]);
        cone(0.065, 0.16, 8, cy === 1 ? ORANGE : RED, px, py, -1.96, [90, 0, 0]);
      }
    gbox(0.4, 0.04, 0.04, YEL, s * 0.9, 3.25, -2.02, 1.3);
    // tail lights
    gbox(0.9, 0.09, 0.04, RED, s * 0.5, 1.65, -3.93, 1.8);
    gbox(0.25, 0.09, 0.04, ORANGE, s * 1.0, 1.45, -3.93, 1.4);
    // rear stripes
    for (let i = 0; i < 3; i++) box(0.12, 0.4, 0.04, YEL, s * (0.2 + i * 0.4), 1.4, -3.94, [0, 0, 25]);
  }
  // rear details
  box(2.3, 0.35, 0.3, ARMOR, 0, 1.1, -4.1);
  box(1.4, 0.7, 0.05, DARK, 0, 1.75, -3.93);
  gbox(1.2, 0.04, 0.04, CYAN, 0, 1.95, -3.96, 1.4);
  cyl(0.1, 0.1, 0.2, 8, STEEL, 0, 0.95, -4.3, [90, 0, 0]); // hitch
  for (let i = 0; i < 4; i++) gbox(0.4, 0.05, 0.04, ORANGE, -0.6 + i * 0.4, 2.2, -3.65, 1.3, [38, 0, 0]);
  // hatch + sat dish on deck
  cyl(0.4, 0.4, 0.08, 10, ARMOR2, 0, 2.6, -3.0);
  gcyl(0.08, 0.08, 0.04, 8, CYAN, 0, 2.66, -3.0, 1.6);
  cyl(0.04, 0.04, 0.5, 6, DARK, 0, 2.85, -3.35);
  cyl(0.4, 0.06, 0.1, 10, STEEL, 0, 3.15, -3.35, [-35, 0, 0]);
  cyl(0.015, 0.015, 0.4, 6, STEEL, 0, 3.3, -3.2, [-55, 0, 0]);
  glow(sph(0.04, MAG, 0, 3.45, -3.1), 2);

  // ---------- turret & railgun ----------
  cyl(0.8, 0.85, 0.14, 12, DARK, 0, 2.62, -0.6);
  const turretOutline: [number, number, "sharp"][] = [
    [-1.5, 2.65, "sharp"],
    [0.3, 2.65, "sharp"],
    [0.3, 3.0, "sharp"],
    [0.0, 3.45, "sharp"],
    [-0.8, 3.5, "sharp"],
    [-1.5, 3.3, "sharp"],
  ];
  b.extrude(turretOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.3, color: ARMOR, bevel: 0.03 });
  box(0.9, 0.42, 0.3, DARK, 0, 3.25, 0.42);
  box(0.6, 0.5, 0.7, ARMOR2, 0, 3.25, 0.7);
  for (const s of SIDES) {
    box(0.1, 0.6, 1.0, ARMOR2, s * 0.7, 3.1, -0.5, [0, s * 15, 0]);
    gbox(0.03, 0.05, 0.7, CYAN, s * 0.76, 3.2, -0.45, 1.4, [0, s * 15, 0]);
    box(0.1, 0.08, 0.1, YEL, s * 0.74, 3.0, -0.9);
    // rails
    box(0.1, 0.12, 3.4, STEEL, s * 0.14, 3.25, 2.1);
    box(0.04, 0.04, 3.4, DARK, s * 0.14, 3.33, 2.1);
  }
  for (let i = 0; i < 7; i++) {
    const z = 1.0 + i * 0.42;
    cyl(0.26, 0.26, 0.08, 8, DARK, 0, 3.25, z, [90, 0, 0]);
    gcyl(0.22, 0.22, 0.12, 8, CYAN, 0, 3.25, z + 0.18, 1.8, [90, 0, 0]);
  }
  box(0.5, 0.32, 0.25, DARK, 0, 3.25, 3.9);
  gbox(0.3, 0.1, 0.05, MAG, 0, 3.25, 4.04, 2);
  // turret rear bustle
  box(1.2, 0.5, 0.6, DARK, 0, 3.1, -1.8);
  for (let i = 0; i < 4; i++) gbox(0.9, 0.03, 0.04, ORANGE, 0, 2.95 + i * 0.1, -2.11, 1.3);
  // cupola
  cyl(0.25, 0.3, 0.2, 8, ARMOR2, 0.35, 3.58, -1.0);
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * D2R;
    gbox(0.1, 0.05, 0.03, CYAN, 0.35 + 0.28 * Math.sin(a), 3.6, -1.0 + 0.28 * Math.cos(a), 1.5, [0, i * 60, 0]);
  }
  cyl(0.02, 0.02, 0.5, 6, STEEL, -0.45, 3.8, -1.2);
  glow(sph(0.035, MAG, -0.45, 4.07, -1.2), 2);
  // coax cam
  glow(sph(0.07, RED, 0.2, 3.5, 0.25), 2);

  // ---------- undercarriage extras ----------
  for (const s of SIDES) {
    box(0.1, 0.25, 0.5, ARMOR2, s * 0.7, 1.35, 3.55);
    cyl(0.04, 0.04, 0.3, 6, STEEL, s * 0.9, 1.18, 3.0, [90, 0, 0]);
  }
  // roof side railings along rear deck
  for (const s of SIDES) {
    cyl(0.025, 0.025, 4.2, 6, STEEL, s * 1.05, 2.68, -1.2, [90, 0, 0]);
    for (let i = 0; i < 5; i++) cyl(0.025, 0.025, 0.14, 6, STEEL, s * 1.05, 2.6, -3.1 + i * 1.0);
  }

  return b.root;
}
```