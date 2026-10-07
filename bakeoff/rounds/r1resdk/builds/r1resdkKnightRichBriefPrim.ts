import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Battle-worn Knight",
  description: "Plate-armoured knight with crimson-plumed great helm, griffin surcoat, kite shield, broadsword and torn cape.",
};

export default function build() {
  const b = createBuilder({ name: "knight" });
  const R = rng(7);

  const STEEL = "#9aa3ad", DARK = "#5f6872", GOLD = "#d4a520", BLUE = "#1d3a8c",
    RED = "#a3141e", SILVER = "#e1e5ea", LEATHER = "#4a3020", BLACK = "#14161a", DENT = "#7f8892";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, 0] });
  const spine = b.joint("spine", { at: [0, 1.15, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.38, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.58, 0], parent: chest });
  const head = b.joint("head", { at: [0, 1.66, 0], parent: neck });
  b.joint("jaw", { at: [0, 1.7, 0.02], parent: head });
  const sides: [string, number][] = [["L", 1], ["R", -1]];
  for (const [n, s] of sides) {
    const sh = b.joint("shoulder" + n, { at: [0.27 * s, 1.5, 0], parent: chest });
    const el = b.joint("elbow" + n, { at: [0.40 * s, 1.22, 0.03], parent: sh });
    b.joint("wrist" + n, { at: [0.46 * s, 0.97, 0.1], parent: el });
    const hp = b.joint("hip" + n, { at: [0.12 * s, 0.95, 0], parent: hips });
    const kn = b.joint("knee" + n, { at: [0.13 * s, 0.52, 0.03], parent: hp });
    b.joint("ankle" + n, { at: [0.13 * s, 0.09, 0], parent: kn });
  }

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, c: string, at: number[], dir?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, dir ? { at, dir } : { at });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, dir ? { at, dir } : { at });
  const sph = (r: number, c: string, at: number[], sc?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, sc ? { at, scale: sc } : { at });
  const seg = (a: number[], z: number[], r0: number, r1: number, c: string, n = 8) => {
    const d = [z[0] - a[0], z[1] - a[1], z[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    return cyl(r0, r1, len, n, c, [(a[0] + z[0]) / 2, (a[1] + z[1]) / 2, (a[2] + z[2]) / 2], d);
  };

  // ---------- legs ----------
  for (const [, s] of sides) {
    seg([0.12 * s, 0.97, 0], [0.13 * s, 0.54, 0.03], 0.085, 0.07, STEEL);         // thigh
    sph(0.085, DARK, [0.13 * s, 0.52, 0.04]);                                      // knee
    box(0.14, 0.1, 0.07, GOLD, [0.13 * s, 0.52, 0.1]);                              // poleyn
    seg([0.13 * s, 0.5, 0.03], [0.13 * s, 0.12, 0], 0.07, 0.055, STEEL);           // shin
    box(0.12, 0.3, 0.03, DARK, [0.13 * s, 0.3, 0.05]);                               // greave plate
    box(0.14, 0.07, 0.26, DARK, [0.13 * s, 0.035, 0.07]);                           // sabaton
    cyl(0.0, 0.065, 0.1, 6, STEEL, [0.13 * s, 0.05, 0.2], [0, 0.3, 1]);             // toe
  }

  // ---------- torso ----------
  box(0.34, 0.2, 0.2, DARK, [0, 0.98, 0]);                  // pelvis
  box(0.38, 0.1, 0.24, LEATHER, [0, 1.08, 0]);              // belt
  box(0.06, 0.07, 0.02, GOLD, [0, 1.08, 0.125]);            // buckle
  box(0.36, 0.26, 0.22, STEEL, [0, 1.25, 0]);               // abdomen
  box(0.46, 0.3, 0.27, STEEL, [0, 1.44, 0]);                // chest
  box(0.4, 0.04, 0.02, GOLD, [0, 1.56, 0.14]);              // gorget trim
  cyl(0.09, 0.1, 0.1, 8, DARK, [0, 1.6, 0]);                // neck
  box(0.2, 0.06, 0.2, STEEL, [0, 1.57, 0]);                 // gorget

  // surcoat
  box(0.4, 0.62, 0.02, BLUE, [0, 1.2, 0.145]);
  box(0.4, 0.5, 0.02, BLUE, [0, 1.1, -0.145]);
  box(0.4, 0.04, 0.025, GOLD, [0, 0.9, 0.15]);
  for (let i = 0; i < 3; i++) box(0.1 + i * 0.1, 0.03, 0.022, BLUE, [0, 0.89 - i * 0.0, 0.147]);
  box(0.2, 0.3, 0.02, BLUE, [0.11, 0.78, 0.1], [0.05, -1, 0.2]);   // tassets/skirt
  box(0.2, 0.3, 0.02, BLUE, [-0.11, 0.78, 0.1], [-0.05, -1, 0.2]);
  box(0.14, 0.3, 0.02, BLUE, [0, 0.8, 0.15], [0, -1, 0.15]);

  // griffin emblem builder (flat, silver)
  const griffin = (cx: number, cy: number, z: number, k: number) => {
    sph(0.07 * k, SILVER, [cx, cy, z], [1.1, 0.8, 0.25]);                       // body
    sph(0.035 * k, SILVER, [cx + 0.07 * k, cy + 0.08 * k, z], [1, 1, 0.3]);     // head
    b.part(new THREE.ConeGeometry(0.018 * k, 0.06 * k, 4), GOLD, { at: [cx + 0.12 * k, cy + 0.075 * k, z], dir: [1, -0.2, 0] }); // beak
    box(0.02 * k, 0.09 * k, 0.012, SILVER, [cx + 0.02 * k, cy + 0.13 * k, z], [0.5, 1, 0]);   // wing
    box(0.02 * k, 0.12 * k, 0.012, SILVER, [cx - 0.03 * k, cy + 0.14 * k, z], [-0.1, 1, 0]);
    box(0.02 * k, 0.1 * k, 0.012, SILVER, [cx - 0.08 * k, cy + 0.12 * k, z], [-0.7, 1, 0]);
    box(0.02 * k, 0.08 * k, 0.012, SILVER, [cx - 0.12 * k, cy + 0.0, z], [-1, -0.6, 0]);       // tail
    box(0.02 * k, 0.07 * k, 0.012, SILVER, [cx + 0.03 * k, cy - 0.08 * k, z], [0.2, -1, 0]);   // legs
    box(0.02 * k, 0.07 * k, 0.012, SILVER, [cx - 0.03 * k, cy - 0.08 * k, z], [-0.2, -1, 0]);
  };
  griffin(0, 1.22, 0.162, 1.6);

  // dents and scratches
  sph(0.04, DENT, [0.14, 1.4, 0.135], [1, 1, 0.3]);
  sph(0.03, DENT, [-0.15, 1.5, 0.135], [1, 1, 0.3]);
  for (let i = 0; i < 5; i++)
    box(0.004, 0.08 + R() * 0.05, 0.004, DARK, [-0.18 + i * 0.045 + R() * 0.02, 1.5 - R() * 0.1, 0.14], [0.6, 1, 0]);

  // ---------- arms & shoulders ----------
  for (const [, s] of sides) {
    // layered pauldrons
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.15 - i * 0.012, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
        i === 1 ? DARK : STEEL, { at: [0.31 * s, 1.55 - i * 0.06, 0], dir: [s * 0.15, 1, 0] });
      box(0.2 - i * 0.015, 0.012, 0.012, GOLD, [0.31 * s, 1.54 - i * 0.06, 0.13 - i * 0.01]);
    }
    for (let i = 0; i < 4; i++) sph(0.01, GOLD, [(0.25 + i * 0.035) * s, 1.64 - i * 0.012, 0.08], [1, 1, 1]);
    seg([0.28 * s, 1.46, 0], [0.4 * s, 1.24, 0.03], 0.062, 0.055, STEEL);   // upper arm
    sph(0.065, DARK, [0.4 * s, 1.22, 0.03]);                                  // elbow
    cyl(0.0, 0.07, 0.09, 6, GOLD, [0.4 * s, 1.22, 0.1], [0, 0.2, 1]);       // elbow spike
    seg([0.4 * s, 1.21, 0.03], [0.46 * s, 0.99, 0.1], 0.057, 0.05, STEEL);   // forearm
    box(0.03, 0.18, 0.06, DARK, [0.43 * s, 1.1, 0.095], [s * 0.25, 1, 0.3]);
    sph(0.055, DARK, [0.46 * s, 0.93, 0.11]);                                 // gauntlet
  }

  // ---------- helm ----------
  box(0.27, 0.3, 0.29, STEEL, [0, 1.76, 0]);                     // skull
  cyl(0.14, 0.14, 0.04, 8, DARK, [0, 1.92, 0]);
  b.part(new THREE.SphereGeometry(0.15, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0, 1.9, 0] });
  box(0.2, 0.025, 0.012, BLACK, [0, 1.8, 0.148]);                // eye slit
  box(0.03, 0.2, 0.014, DARK, [0, 1.72, 0.15]);                  // nasal ridge
  box(0.26, 0.015, 0.012, GOLD, [0, 1.87, 0.148]);               // brow trim
  box(0.26, 0.015, 0.012, GOLD, [0, 1.73, 0.148]);
  for (let i = 0; i < 4; i++) box(0.012, 0.018, 0.012, BLACK, [0.05 + i * 0.025, 1.68, 0.15]);   // breaths
  for (let i = 0; i < 4; i++) box(0.012, 0.018, 0.012, BLACK, [-0.05 - i * 0.025, 1.68, 0.15]);
  box(0.25, 0.1, 0.27, STEEL, [0, 1.63, 0.01]);                  // lower jaw plate
  box(0.02, 0.02, 0.3, RED, [0, 2.04, 0]);                       // crest base
  // plume
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const y = 2.06 + Math.sin(t * Math.PI) * 0.17 + 0.0;
    const z = 0.1 - t * 0.38;
    sph(0.05 - 0.01 * t, i % 2 ? RED : "#7d0f18", [0, y - t * 0.1 + 0.02, z], [0.5, 1.2, 1.3]);
  }
  box(0.02, 0.2, 0.03, RED, [0, 1.95, -0.2], [0, -1, -0.3]);
  box(0.02, 0.18, 0.03, "#7d0f18", [0, 1.92, -0.26], [0, -1, -0.5]);

  // ---------- cape (torn) ----------
  const strips = 8;
  for (let i = 0; i < strips; i++) {
    const x = -0.28 + (i / (strips - 1)) * 0.56;
    const len = 1.0 + R() * 0.35 - Math.abs(x) * 0.2;
    const top = [x, 1.58, -0.17];
    const bot = [x * 1.15, 1.58 - len, -0.3 - R() * 0.05];
    const mid = [(top[0] + bot[0]) / 2, (top[1] + bot[1]) / 2, (top[2] + bot[2]) / 2];
    box(0.075, len, 0.015, i % 2 ? RED : "#8c1119", mid, [bot[0] - top[0], bot[1] - top[1], bot[2] - top[2]]);
  }
  box(0.6, 0.05, 0.03, GOLD, [0, 1.6, -0.17]);                    // cape clasp band
  sph(0.03, GOLD, [0.0, 1.58, 0.1]);                                // clasp

  // ---------- shield (left, +X) ----------
  const sx = 0.55, sz = 0.2;
  const widths = [0.46, 0.44, 0.38, 0.3, 0.2, 0.1];
  const ys = [1.35, 1.17, 0.99, 0.81, 0.65, 0.52];
  const hs = [0.2, 0.2, 0.2, 0.2, 0.16, 0.12];
  widths.forEach((w, i) => {
    box(w + 0.03, hs[i], 0.03, GOLD, [sx, ys[i], sz - 0.005]);
    box(w - 0.02, hs[i] - 0.02, 0.04, i % 2 ? "#17307a" : BLUE, [sx, ys[i], sz + 0.002]);
  });
  box(0.04, 0.9, 0.025, STEEL, [sx, 0.95, sz + 0.025]);
  sph(0.05, GOLD, [sx, 1.12, sz + 0.03], [1, 1, 0.6]);
  griffin(sx, 1.0, sz + 0.03, 1.3);
  box(0.01, 0.12, 0.01, DARK, [sx - 0.12, 1.25, sz + 0.03], [0.5, 1, 0]);   // scratches
  box(0.01, 0.1, 0.01, DARK, [sx - 0.09, 1.22, sz + 0.03], [0.5, 1, 0]);
  sph(0.03, DENT, [sx + 0.1, 0.8, sz + 0.03], [1, 1, 0.3]);

  // ---------- sword (right, -X) ----------
  const wx = -0.46, wy = 0.93, wz = 0.12;
  cyl(0.018, 0.018, 0.14, 6, LEATHER, [wx, wy, wz]);              // grip
  sph(0.03, GOLD, [wx, wy - 0.09, wz]);                           // pommel
  box(0.3, 0.035, 0.04, GOLD, [wx, wy + 0.09, wz]);               // crossguard
  sph(0.02, GOLD, [wx - 0.15, wy + 0.09, wz]);
  sph(0.02, GOLD, [wx + 0.15, wy + 0.09, wz]);
  box(0.065, 0.95, 0.012, SILVER, [wx, wy + 0.59, wz]);           // blade
  box(0.012, 0.95, 0.016, "#b8bec6", [wx, wy + 0.59, wz]);        // fuller
  b.part(new THREE.ConeGeometry(0.0325, 0.14, 4), SILVER, { at: [wx, wy + 1.13, wz], scale: [1, 1, 0.37] });
  box(0.012, 0.03, 0.016, DARK, [wx + 0.03, wy + 0.7, wz]);       // nick

  return b.root;
}
