import * as THREE from "three";
import { createBuilder, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Sentinel MX-77 Armored Hauler",
  description:
    "Low-poly cyberpunk 2077 militarized six-wheel truck: armored cab, rooftop remote turret, missile rack, neon underglow, hazard bumper and sensor mast.",
};

// Palette
const GUN = "#2a2f39";
const ARMOR = "#3c4553";
const ARMOR_L = "#566274";
const PLATE = "#323a46";
const BLACK = "#101216";
const RUBBER = "#17181c";
const STEEL = "#8a93a3";
const YELLOW = "#f2c418";
const MAG = "#ff2bd6";
const CYAN = "#22f0ff";
const RED = "#ff2a3a";
const ORANGE = "#ff8a1c";
const GLASS = "#0d2a3a";
const OLIVE = "#3b4636";

export default function build() {
  const b = createBuilder({ name: "sentinel_mx77" });

  // ---------- helpers ----------
  type V = [number, number, number];
  const box = (w: number, h: number, d: number, color: string, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, rot ? { at, rotation: rot } : { at });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: V, dir: V = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir });
  const gbox = (w: number, h: number, d: number, color: string, at: V, str = 1, rot?: V) =>
    glow(box(w, h, d, color, at, rot), str);

  // ---------- chassis ----------
  for (const s of [1, -1]) {
    box(0.22, 0.34, 8.2, BLACK, [s * 0.7, 0.98, -0.1]);
    box(0.06, 0.2, 8.0, MAG, [s * 0.55, 0.9, -0.1]);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.05, 6.6), MAG, { at: [s * 1.0, 0.8, -0.2] }), 1.4);
  }
  for (let i = 0; i < 7; i++) box(1.5, 0.16, 0.2, GUN, [0, 0.98, -3.8 + i * 1.15]);
  // axles, diffs, driveshaft
  const axles = [2.7, -0.8, -2.4];
  for (const z of axles) {
    cyl(0.09, 0.09, 3.1, 8, GUN, [0, 0.7, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.28, 8, 6), STEEL, { at: [0, 0.7, z] });
    box(0.5, 0.2, 0.3, PLATE, [0, 0.9, z]);
  }
  cyl(0.07, 0.07, 6.0, 6, STEEL, [0, 0.8, -0.2], [0, 0, 1]);

  // ---------- wheels ----------
  const wheel = (s: number, z: number) => {
    const cx = s * 1.55;
    const cy = 0.7;
    b.part(new THREE.CylinderGeometry(0.68, 0.68, 0.6, 14), RUBBER, { at: [cx, cy, z], dir: [1, 0, 0] });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * 360;
      const r = (a * Math.PI) / 180;
      box(0.62, 0.1, 0.2, "#24262c", [cx, cy + 0.68 * Math.cos(r), z + 0.68 * Math.sin(r)], [a, 0, 0]);
    }
    cyl(0.42, 0.42, 0.06, 12, ARMOR_L, [s * 1.87, cy, z], [1, 0, 0]);
    glow(cyl(0.3, 0.3, 0.05, 12, CYAN, [s * 1.9, cy, z], [1, 0, 0]), 1.2);
    cyl(0.2, 0.2, 0.08, 8, GUN, [s * 1.92, cy, z], [1, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const r = (i / 6) * Math.PI * 2;
      cyl(0.03, 0.03, 0.09, 6, STEEL, [s * 1.93, cy + 0.36 * Math.cos(r), z + 0.36 * Math.sin(r)], [1, 0, 0]);
    }
    // fender + mud flap
    box(0.75, 0.1, 1.7, PLATE, [s * 1.55, 1.48, z]);
    box(0.75, 0.38, 0.1, ARMOR, [s * 1.55, 1.3, z + 0.82], [20, 0, 0]);
    box(0.75, 0.38, 0.1, ARMOR, [s * 1.55, 1.3, z - 0.82], [-20, 0, 0]);
    box(0.06, 0.4, 0.04, YELLOW, [s * 1.55, 0.35, z - 1.0]);
  };
  for (const z of axles) for (const s of [1, -1]) wheel(s, z);

  // ---------- cab ----------
  const cabProfile: [number, number][] = [
    [1.1, 1.2], [1.1, 3.1], [2.6, 3.1], [3.5, 2.3], [3.9, 2.0], [3.9, 1.2],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.05, color: ARMOR });
  // side glass
  b.extrude(
    [[1.9, 2.35], [1.9, 2.95], [2.6, 2.95], [3.3, 2.3]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.44, color: GLASS },
  );
  // windshield
  box(2.1, 1.15, 0.05, GLASS, [0, 2.72, 3.07], [-48.6, 0, 0]);
  glow(box(1.9, 0.03, 0.02, CYAN, [0, 2.6, 3.11], [-48.6, 0, 0]), 0.8);
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    box(2.2, 0.05, 0.05, BLACK, [0, 3.06 - t * 0.7, 2.68 + t * 0.78], [-48.6, 0, 0]);
  }
  // roof armour
  box(2.5, 0.12, 1.7, PLATE, [0, 3.14, 1.9]);
  box(2.5, 0.2, 0.2, ARMOR_L, [0, 3.1, 2.7], [-20, 0, 0]);
  gbox(1.9, 0.1, 0.22, MAG, [0, 3.28, 2.0], 1.5);
  for (const s of [1, -1]) {
    gbox(0.12, 0.12, 0.26, RED, [s * 1.05, 3.28, 2.0], 1.5);
    gbox(0.12, 0.12, 0.26, CYAN, [s * 0.9, 3.28, 2.0], 1.5);
  }
  // hood/front face
  box(2.44, 0.1, 0.1, GUN, [0, 2.0, 3.92]);
  for (let i = 0; i < 6; i++) gbox(1.6, 0.04, 0.05, i % 2 ? MAG : "#a01a8c", [0, 1.35 + i * 0.1, 3.95], 1);
  box(1.8, 0.8, 0.04, BLACK, [0, 1.62, 3.92]);
  for (let i = 0; i < 6; i++) gbox(1.6, 0.04, 0.05, i % 2 ? MAG : "#a01a8c", [0, 1.35 + i * 0.1, 3.96], 1);
  for (const s of [1, -1]) {
    box(0.62, 0.26, 0.1, BLACK, [s * 1.0, 1.82, 3.93]);
    gbox(0.52, 0.12, 0.06, "#e8ffff", [s * 1.0, 1.82, 3.98], 2);
    gbox(0.2, 0.06, 0.05, CYAN, [s * 1.0, 1.62, 3.97], 1.2);
    box(0.1, 0.9, 0.2, ARMOR_L, [s * 1.27, 1.65, 3.85]);
  }
  // doors
  for (const s of [1, -1]) {
    box(0.05, 1.0, 1.3, ARMOR_L, [s * 1.21, 1.7, 2.45]);
    box(0.07, 0.08, 0.3, STEEL, [s * 1.24, 1.9, 2.0]);
    box(0.05, 0.08, 1.3, YELLOW, [s * 1.215, 1.22, 2.45]);
    // rivets
    for (let i = 0; i < 4; i++) {
      cyl(0.025, 0.025, 0.05, 6, STEEL, [s * 1.24, 1.3, 1.9 + i * 0.35], [1, 0, 0]);
      cyl(0.025, 0.025, 0.05, 6, STEEL, [s * 1.24, 2.15, 1.9 + i * 0.35], [1, 0, 0]);
    }
    // mirror
    box(0.5, 0.05, 0.05, GUN, [s * 1.45, 2.7, 3.2]);
    box(0.1, 0.5, 0.26, BLACK, [s * 1.7, 2.7, 3.2]);
    gbox(0.02, 0.1, 0.2, CYAN, [s * 1.755, 2.5, 3.2], 1);
    // step
    box(0.4, 0.06, 1.0, GUN, [s * 1.4, 1.0, 2.45]);
    // exhaust stack
    cyl(0.1, 0.1, 2.2, 8, STEEL, [s * 1.32, 2.4, 0.95]);
    cyl(0.13, 0.13, 0.18, 8, GUN, [s * 1.32, 3.5, 0.95]);
    glow(cyl(0.08, 0.08, 0.04, 8, ORANGE, [s * 1.32, 3.6, 0.95]), 1.5);
    for (const y of [1.6, 2.4, 3.1]) box(0.08, 0.06, 0.28, GUN, [s * 1.25, y, 1.0]);
  }
  // bumper
  box(2.8, 0.55, 0.5, GUN, [0, 1.0, 4.05]);
  box(2.9, 0.1, 0.55, ARMOR_L, [0, 1.3, 4.05]);
  for (let i = 0; i < 12; i++) box(0.11, 0.42, 0.03, YELLOW, [-1.2 + i * 0.22, 1.0, 4.32], [0, 0, 30]);
  gbox(1.0, 0.04, 0.04, CYAN, [0, 0.76, 4.3], 1.2);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 0.3, 6, STEEL, [s * 0.9, 0.85, 4.3], [0, 0, 1]);
    box(0.18, 0.18, 0.3, ARMOR_L, [s * 1.45, 1.0, 4.0]);
  }
  // winch drum
  cyl(0.12, 0.12, 1.2, 8, BLACK, [0, 0.8, 4.2], [1, 0, 0]);

  // roof sensors
  cyl(0.05, 0.05, 1.6, 6, STEEL, [-0.9, 3.9, 1.5]);
  cyl(0.015, 0.015, 1.0, 4, STEEL, [-1.0, 4.6, 1.4]);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [-0.9, 4.72, 1.5] }), 2);
  cyl(0.02, 0.02, 1.4, 4, STEEL, [1.0, 3.9, 1.4], [0.08, 1, 0]);
  cyl(0.04, 0.04, 0.5, 6, STEEL, [0.8, 3.45, 1.6]);
  b.part(new THREE.ConeGeometry(0.4, 0.22, 10), ARMOR_L, { at: [0.8, 3.8, 1.6], dir: [0.3, 0.8, 0.5] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), CYAN, { at: [0.85, 3.9, 1.7] }), 1.5);
  box(0.4, 0.2, 0.4, GUN, [0, 3.3, 1.35]);
  glow(box(0.3, 0.04, 0.02, CYAN, [0, 3.32, 1.56]), 1.2);

  // ---------- cargo container ----------
  b.extrude(
    [[-4.2, 1.25], [-4.2, 3.2], [-3.9, 3.45], [0.5, 3.45], [0.8, 3.2], [0.8, 1.25]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.7, bevel: 0.05, color: OLIVE },
  );
  // lower belt armour & panel seams
  for (const s of [1, -1]) {
    box(0.06, 0.55, 4.9, ARMOR, [s * 1.37, 1.65, -1.7]);
    box(0.06, 0.08, 4.9, YELLOW, [s * 1.39, 1.98, -1.7]);
    gbox(0.05, 0.05, 4.8, CYAN, [s * 1.4, 1.38, -1.7], 1.3);
    for (let i = 0; i < 6; i++) {
      box(0.1, 1.6, 0.12, PLATE, [s * 1.36, 2.55, -4.0 + i * 0.95]);
      box(0.12, 0.16, 0.8, BLACK, [s * 1.38, 3.2, -3.5 + i * 0.95]);
    }
    // vents
    for (let i = 0; i < 5; i++) box(0.04, 0.05, 0.9, BLACK, [s * 1.38, 2.2 + i * 0.1, -1.0]);
    // fuel tanks
    cyl(0.28, 0.28, 1.5, 10, ARMOR_L, [s * 1.45, 0.85, 1.0], [0, 0, 1]);
    for (const dz of [-0.5, 0.5]) cyl(0.3, 0.3, 0.08, 10, YELLOW, [s * 1.45, 0.85, 1.0 + dz], [0, 0, 1]);
    // emblem decal
    const emblem = svg(
      `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
        <polygon points="20,45 45,6 95,6 120,45 95,84 45,84" fill="#101216" stroke="#ff2bd6" stroke-width="6"/>
        <polygon points="45,45 58,24 82,24 95,45 82,66 58,66" fill="none" stroke="#22f0ff" stroke-width="4"/>
        <text x="130" y="42" font-family="monospace" font-weight="bold" font-size="26" fill="#22f0ff">MX-77</text>
        <text x="130" y="72" font-family="monospace" font-weight="bold" font-size="22" fill="#ff2bd6">2077</text>
      </svg>`,
      { size: 512 },
    );
    glow(
      b.part(new THREE.PlaneGeometry(2.0, 0.9), "#ffffff", {
        at: [s * 1.405, 2.55, -1.7],
        rotation: [0, s * 90, 0],
        texture: emblem,
      }),
      1,
    );
  }
  // top deck
  box(2.4, 0.1, 4.3, PLATE, [0, 3.5, -1.8]);
  for (let i = 0; i < 7; i++) box(2.3, 0.04, 0.12, BLACK, [0, 3.57, -3.8 + i * 0.6]);
  // rear
  box(2.6, 0.5, 0.3, GUN, [0, 1.0, -4.25]);
  box(2.2, 1.9, 0.08, ARMOR, [0, 2.3, -4.24]);
  for (let i = 0; i < 3; i++) box(2.0, 0.05, 0.06, BLACK, [0, 1.8 + i * 0.6, -4.3]);
  box(0.06, 1.9, 0.07, BLACK, [0, 2.3, -4.3]);
  for (const s of [1, -1]) {
    gbox(0.4, 0.2, 0.06, RED, [s * 1.0, 1.25, -4.42], 1.6);
    gbox(0.4, 0.12, 0.06, RED, [s * 1.0, 3.1, -4.3], 1.4);
    box(0.12, 0.5, 0.14, YELLOW, [s * 1.2, 1.0, -4.42], [0, 0, 25]);
  }
  cyl(0.08, 0.08, 0.5, 6, STEEL, [0, 0.9, -4.55], [0, 0, 1]);

  // ---------- remote weapon turret ----------
  const tz = -0.9;
  cyl(0.55, 0.6, 0.16, 12, GUN, [0, 3.63, tz]);
  box(0.95, 0.5, 1.0, ARMOR, [0, 3.98, tz]);
  box(1.0, 0.1, 0.6, PLATE, [0, 4.28, tz - 0.1], [8, 0, 0]);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 1.7, 8, BLACK, [s * 0.25, 4.0, tz + 1.25], [0, 0, 1]);
    cyl(0.1, 0.1, 0.2, 8, GUN, [s * 0.25, 4.0, tz + 2.15], [0, 0, 1]);
    cyl(0.12, 0.12, 0.5, 8, ARMOR_L, [s * 0.25, 4.0, tz + 0.7], [0, 0, 1]);
    box(0.1, 0.3, 0.6, PLATE, [s * 0.55, 4.0, tz + 0.1]);
    glow(box(0.07, 0.07, 0.07, ORANGE, [s * 0.25, 4.0, tz + 2.27]), 1.2);
  }
  gbox(0.34, 0.14, 0.1, CYAN, [0, 4.05, tz + 0.55], 2);
  b.part(new THREE.SphereGeometry(0.1, 6, 4), BLACK, { at: [0, 4.05, tz + 0.52] });
  box(0.3, 0.2, 0.5, GUN, [0.65, 4.0, tz - 0.1]); // ammo box
  b.sweep(catmull([[0.6, 3.9, tz + 0.1], [0.45, 4.1, tz + 0.5], [0.3, 4.0, tz + 0.8]]), 0.03, { color: BLACK });

  // ---------- missile rack ----------
  const mz = -3.1;
  box(1.9, 0.18, 1.3, GUN, [0, 3.65, mz]);
  box(1.8, 0.5, 0.14, PLATE, [0, 3.85, mz + 0.55], [-30, 0, 0]);
  const md: V = [0, 0.64, -0.77];
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 4; i++) {
      const bx = -0.66 + i * 0.44;
      const bz = mz + 0.25 - r * 0.45;
      const base: V = [bx, 3.85, bz];
      const c: V = [base[0] + md[0] * 0.55, base[1] + md[1] * 0.55, base[2] + md[2] * 0.55];
      cyl(0.12, 0.12, 1.1, 8, r ? ARMOR_L : ARMOR, c, md);
      const tip: V = [base[0] + md[0] * 1.1, base[1] + md[1] * 1.1, base[2] + md[2] * 1.1];
      cyl(0.1, 0.1, 0.04, 8, ORANGE, tip, md);
      glow(cyl(0.08, 0.08, 0.05, 6, i % 2 ? RED : ORANGE, tip, md), 1.4);
      cyl(0.135, 0.135, 0.08, 8, YELLOW, [base[0] + md[0] * 0.95, base[1] + md[1] * 0.95, base[2] + md[2] * 0.95], md);
    }
  b.sweep(catmull([[0.9, 3.7, mz + 0.3], [0.8, 3.55, mz + 1.0], [0.4, 3.58, tz - 0.6]]), 0.03, { color: MAG });

  // sensor panels on deck sides
  for (const s of [1, -1]) {
    box(0.12, 0.22, 1.2, PLATE, [s * 1.1, 3.62, -2.0]);
    gbox(0.04, 0.05, 1.0, MAG, [s * 1.17, 3.62, -2.0], 1.3);
    box(0.5, 0.4, 0.5, GUN, [s * 0.9, 3.75, -1.9 + 0.0]);
    glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { at: [s * 0.9, 3.98, -1.9] }), 1.5);
  }

  // ---------- door number plates ----------
  const tag = svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="76" height="36" fill="#101216" stroke="#ffcc00" stroke-width="3"/>
      <text x="10" y="30" font-family="monospace" font-weight="bold" font-size="26" fill="#ffcc00">A-07</text>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", {
      at: [s * 1.25, 1.85, 2.9],
      rotation: [0, s * 90, 0],
      texture: tag,
    });

  // underglow
  gbox(0.1, 0.04, 7.0, MAG, [0, 0.62, -0.2], 1.6);
  gbox(2.0, 0.04, 0.1, MAG, [0, 0.62, 2.0], 1.4);
  gbox(2.0, 0.04, 0.1, MAG, [0, 0.62, -2.8], 1.4);

  return b.root;
}
