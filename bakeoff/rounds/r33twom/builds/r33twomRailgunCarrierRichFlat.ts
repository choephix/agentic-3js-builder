import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with an elevated twin-rail coilgun on a turret ring, braced on four hydraulic stabiliser legs.",
};

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // palette
  const OLIVE = "#56674a", OLIVE_D = "#36422f", OLIVE_L = "#7b8c60", TAN = "#bda868";
  const STEEL = "#3b4149", STEEL_L = "#6d747d", BLACK = "#16181b", TIRE = "#1e1f23";
  const COPPER = "#b06a3a", COPPER_D = "#7a4528", CYAN = "#46f0ff", GLASS = "#1f5f7c";
  const YEL = "#e8c02e", RED = "#b8342a", WHITE = "#e6e6dc", LAMP = "#fff1b0";

  // helpers
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], rotation: rot as any, flat: true });
  const cyl = (r1: number, r2: number, len: number, c: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r1, r2, len, seg), c, {
      at: at as [number, number, number],
      dir: dir as [number, number, number],
      flat: true,
    });
  const ball = (r: number, c: string, at: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: at as [number, number, number], flat: true });
  const X: [number, number, number] = [1, 0, 0];
  const Y: [number, number, number] = [0, 1, 0];
  const Z: [number, number, number] = [0, 0, 1];

  // ---------- wheels ----------
  const WR = 0.75;
  const wheelZ = [3.4, 0, -3.4];
  for (const s of [1, -1]) {
    for (const z of wheelZ) {
      const wx = s * 1.85;
      cyl(WR, WR, 0.7, TIRE, [wx, WR, z], X, 14);
      // tread blocks
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        box(0.72, 0.1, 0.22, BLACK, [wx, WR + Math.cos(a) * (WR + 0.02), z + Math.sin(a) * (WR + 0.02)], [
          (-a * 180) / Math.PI + 90 - 90,
          0,
          0,
        ]);
      }
      const ox = s * (1.85 + 0.36);
      cyl(0.45, 0.45, 0.12, STEEL_L, [ox, WR, z], X, 10);
      cyl(0.2, 0.2, 0.18, STEEL, [ox + s * 0.05, WR, z], X, 8);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.045, 0.045, 0.1, BLACK, [ox + s * 0.07, WR + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3], X, 6);
      }
      // fender
      box(0.95, 0.12, 1.9, OLIVE_D, [wx, 1.66, z]);
      box(0.95, 0.12, 0.5, OLIVE_D, [wx, 1.52, z + 1.0], [-30, 0, 0]);
      box(0.95, 0.12, 0.5, OLIVE_D, [wx, 1.52, z - 1.0], [30, 0, 0]);
      // mud splash
      box(0.96, 0.12, 1.6, "#5a4a36", [wx, 0.2, z], [0, 0, 0]).mesh.scale.set(1, 0.4, 0.001 + 0.0);
      // suspension arm
      box(0.25, 0.25, 0.25, STEEL, [s * 1.62, WR, z]);
      cyl(0.09, 0.09, 1.0, STEEL, [s * 1.45, 1.1, z + 0.5], [0, 1, 0.1], 6);
    }
    // axles
  }
  for (const z of wheelZ) cyl(0.12, 0.12, 3.7, STEEL, [0, WR, z], X, 8);

  // ---------- hull ----------
  box(3.0, 0.7, 10.0, OLIVE, [0, 1.25, 0]); // lower chassis
  box(2.6, 0.3, 9.4, STEEL, [0, 0.82, 0]); // belly pan
  box(2.9, 0.65, 1.3, OLIVE, [0, 1.3, 5.45], [0, 0, 0]); // nose
  box(2.7, 0.5, 0.8, OLIVE_L, [0, 1.35, 5.95], [-22, 0, 0]); // glacis
  box(3.1, 0.22, 0.5, STEEL, [0, 0.95, 6.1]); // bumper
  for (let i = -3; i <= 3; i++) box(0.22, 0.22, 0.52, i % 2 ? YEL : BLACK, [i * 0.4, 0.95, 6.12]);
  box(3.1, 0.22, 0.5, STEEL, [0, 0.95, -5.15]); // rear bumper
  for (let i = -3; i <= 3; i++) box(0.22, 0.22, 0.52, i % 2 ? YEL : BLACK, [i * 0.4, 0.95, -5.17]);
  box(3.0, 0.7, 0.2, OLIVE_D, [0, 1.25, -5.05]);

  // rear deck
  box(2.8, 0.7, 7.2, OLIVE, [0, 1.95, -1.2]);
  box(2.9, 0.1, 7.3, OLIVE_L, [0, 2.33, -1.2]);
  for (let i = 0; i < 3; i++) box(0.5, 0.02, 6.6, TAN, [-0.9 + i * 0.9, 2.4, -1.2]);
  // side armor plates with vents
  for (const s of [1, -1]) {
    box(0.12, 0.55, 6.8, OLIVE_D, [s * 1.46, 1.95, -1.2]);
    for (let i = 0; i < 6; i++) box(0.04, 0.3, 0.45, BLACK, [s * 1.54, 2.0, -3.6 + i * 0.7]);
    box(0.14, 0.12, 6.9, TAN, [s * 1.47, 2.28, -1.2]);
    // chevron emblem
    box(0.04, 0.5, 0.1, RED, [s * 1.54, 1.55, 3.0], [0, 0, 0]);
    box(0.05, 0.1, 0.45, RED, [s * 1.55, 1.2, 2.3]);
    // tool box
    box(0.35, 0.3, 1.0, STEEL, [s * 1.7, 1.35, 1.7 + 2.35]);
    box(0.36, 0.05, 1.02, YEL, [s * 1.7, 1.52, 4.05]);
  }
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.13, 0.15, 1.2, STEEL, [s * 1.2, 3.1, 2.15], Y, 8);
    cyl(0.17, 0.17, 0.1, BLACK, [s * 1.2, 3.72, 2.15], Y, 8);
  }
  // rear engine grille & lights
  box(2.0, 0.45, 0.1, BLACK, [0, 1.35, -5.18]);
  for (let i = 0; i < 6; i++) box(1.9, 0.04, 0.05, STEEL_L, [0, 1.17 + i * 0.07, -5.22]);
  for (const s of [1, -1]) glow(box(0.3, 0.14, 0.06, RED, [s * 1.2, 1.7, -5.18]), 1.2);

  // ---------- cab ----------
  box(2.6, 1.3, 2.4, OLIVE, [0, 2.25, 3.6]);
  box(2.7, 0.14, 2.5, OLIVE_D, [0, 2.95, 3.6]);
  box(2.2, 0.7, 0.1, GLASS, [0, 2.45, 4.85], [-24, 0, 0]);
  box(2.3, 0.08, 0.14, BLACK, [0, 2.8, 4.8], [-24, 0, 0]);
  box(2.3, 0.08, 0.14, BLACK, [0, 2.1, 4.9], [-24, 0, 0]);
  box(2.0, 0.55, 0.05, OLIVE_L, [0, 2.0, 4.82]);
  for (const s of [1, -1]) {
    box(0.06, 0.55, 1.2, GLASS, [s * 1.31, 2.5, 3.8]);
    box(0.08, 0.7, 0.06, BLACK, [s * 1.31, 2.5, 3.1]);
    // headlights
    glow(box(0.4, 0.2, 0.08, LAMP, [s * 0.95, 1.45, 5.95], [-22, 0, 0]), 1.6);
    box(0.5, 0.3, 0.05, BLACK, [s * 0.95, 1.45, 5.92], [-22, 0, 0]);
    // mirrors
    rod(s);
  }
  function rod(s: number) {
    b.rod([s * 1.35, 2.2, 4.4], [s * 1.75, 2.55, 4.5], 0.03, STEEL);
    box(0.08, 0.3, 0.2, BLACK, [s * 1.78, 2.55, 4.5]);
  }
  // roof gear: radar dish and masts
  cyl(0.05, 0.05, 0.4, STEEL, [0.8, 3.2, 3.0], Y, 6);
  b.part(new THREE.SphereGeometry(0.42, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL_L, {
    at: [0.8, 3.5, 3.1],
    rotation: [-100, 0, 0],
    flat: true,
  });
  cyl(0.03, 0.03, 0.4, STEEL, [0.8, 3.65, 3.25], [0, 0.4, 1], 5);
  ball(0.06, RED, [0.8, 3.85, 3.4]);
  b.rod([-1.1, 2.95, 2.6], [-1.3, 4.6, 2.2], 0.02, BLACK);
  b.rod([-0.9, 2.95, 2.6], [-0.8, 4.0, 2.3], 0.02, BLACK);
  glow(ball(0.05, CYAN, [-1.3, 4.62, 2.2]), 1.5);
  box(2.0, 0.1, 0.1, YEL, [0, 3.04, 4.65]);

  // ---------- turret & gun ----------
  const TZ = -1.6;
  cyl(1.35, 1.35, 0.22, BLACK, [0, 2.48, TZ], Y, 12);
  cyl(1.2, 1.2, 0.12, STEEL_L, [0, 2.62, TZ], Y, 12);
  box(2.2, 0.9, 2.6, OLIVE, [0, 3.1, TZ]);
  box(2.0, 0.12, 2.4, OLIVE_L, [0, 3.62, TZ]);
  box(2.3, 0.3, 2.7, OLIVE_D, [0, 2.78, TZ]);
  for (const s of [1, -1]) {
    box(0.12, 0.6, 1.8, OLIVE_L, [s * 1.14, 3.2, TZ], [0, 0, 0]);
    box(0.14, 0.12, 2.0, TAN, [s * 1.15, 3.55, TZ]);
    glow(box(0.04, 0.1, 1.2, CYAN, [s * 1.22, 3.1, TZ]), 1.4);
    // trunnion
    cyl(0.28, 0.28, 0.3, STEEL, [s * 0.85, 3.6, TZ + 0.2], X, 8);
  }
  // capacitor banks (side canisters)
  for (const s of [1, -1]) {
    for (let k = 0; k < 2; k++) {
      const cx = s * (0.45 + k * 0.55);
      cyl(0.24, 0.24, 1.8, STEEL, [cx, 3.9, TZ - 1.0], Z, 8);
      for (const dz of [-0.6, 0.0, 0.6]) {
        glow(cyl(0.25, 0.25, 0.1, CYAN, [cx, 3.9, TZ - 1.0 + dz], Z, 8), 1.5);
      }
      cyl(0.18, 0.18, 0.1, BLACK, [cx, 3.9, TZ - 1.95], Z, 8);
    }
  }
  box(1.8, 0.2, 2.0, STEEL, [0, 3.76, TZ - 1.0]);
  // ladder + hatch
  box(0.6, 0.06, 0.6, STEEL, [0.7, 3.7, TZ + 0.7]);
  cyl(0.28, 0.28, 0.08, BLACK, [0.7, 3.76, TZ + 0.7], Y, 8);

  // gun frame
  const ang = (8 * Math.PI) / 180;
  const D = new THREE.Vector3(0, Math.sin(ang), Math.cos(ang));
  const N = new THREE.Vector3(0, Math.cos(ang), -Math.sin(ang));
  const G = new THREE.Vector3(0, 4.15, TZ + 1.0);
  const gp = (s: number, x = 0, y = 0) => {
    const p = G.clone().addScaledVector(D, s).addScaledVector(N, y);
    p.x += x;
    return [p.x, p.y, p.z];
  };
  const gbox = (w: number, h: number, d: number, c: string, s: number, x = 0, y = 0) =>
    box(w, h, d, c, gp(s, x, y), [-8, 0, 0]);
  const dd: [number, number, number] = [D.x, D.y, D.z];

  // cradle
  gbox(1.7, 0.25, 3.2, STEEL, 0.6, 0, -0.62);
  gbox(0.25, 0.7, 1.0, STEEL, 0.2, 0.55, -0.35);
  gbox(0.25, 0.7, 1.0, STEEL, 0.2, -0.55, -0.35);
  // breech
  gbox(1.3, 1.1, 1.8, OLIVE_D, -0.8);
  gbox(1.1, 0.12, 1.6, OLIVE_L, -0.8, 0, 0.6);
  glow(box(0.9, 0.12, 0.05, CYAN, gp(-1.7, 0, 0.1), [-8, 0, 0]), 1.3);
  // rails
  const RL = 9.5;
  for (const s of [1, -1]) {
    gbox(0.24, 0.4, RL, COPPER, 4.9, s * 0.27, 0);
    gbox(0.26, 0.06, RL, COPPER_D, 4.9, s * 0.27, 0.22);
    gbox(0.26, 0.06, RL, COPPER_D, 4.9, s * 0.27, -0.22);
  }
  gbox(0.3, 0.3, RL, BLACK, 4.9, 0, 0);
  // coil rings
  for (let i = 0; i < 8; i++) {
    const s = 1.0 + i * 1.15;
    gbox(1.3, 0.14, 0.34, STEEL, s, 0, 0.5);
    gbox(1.3, 0.14, 0.34, STEEL, s, 0, -0.5);
    gbox(0.14, 1.0, 0.34, STEEL, s, 0.58, 0);
    gbox(0.14, 1.0, 0.34, STEEL, s, -0.58, 0);
    glow(box(0.04, 0.55, 0.2, CYAN, gp(s, 0.66, 0), [-8, 0, 0]), 1.4);
    glow(box(0.04, 0.55, 0.2, CYAN, gp(s, -0.66, 0), [-8, 0, 0]), 1.4);
    gbox(0.5, 0.08, 0.3, YEL, s, 0, 0.58);
    if (i % 2 === 0) {
      gbox(0.3, 0.24, 0.5, OLIVE_D, s + 0.5, 0, 0.7);
    }
  }
  // muzzle
  gbox(1.1, 0.95, 0.6, STEEL, 10.2);
  gbox(1.25, 0.12, 0.7, BLACK, 10.2, 0, 0.5);
  glow(box(0.5, 0.2, 0.05, CYAN, gp(10.53, 0, 0), [-8, 0, 0]), 1.8);
  for (const s of [1, -1]) gbox(0.1, 0.5, 0.64, YEL, 10.2, s * 0.6, 0);
  // gun hydraulic elevators
  b.rod([0.5, 3.7, TZ + 1.0], gp(1.6, 0.5, -0.6) as any, 0.08, STEEL_L);
  b.rod([-0.5, 3.7, TZ + 1.0], gp(1.6, -0.5, -0.6) as any, 0.08, STEEL_L);
  // power cables
  for (const s of [1, -1]) {
    b.rod([s * 0.45, 3.9, TZ - 1.9], gp(-0.6, s * 0.5, -0.4) as any, 0.05, BLACK);
  }
  // gun markings
  gbox(0.5, 0.02, 0.9, WHITE, 2.0, 0, 0.55);
  gbox(0.3, 0.02, 0.3, RED, 3.2, 0, 0.55);

  // ---------- stabiliser legs ----------
  for (const s of [1, -1]) {
    for (const z of [1.8, -1.8]) {
      const fx = s * 3.3;
      // outrigger beam
      box(1.9, 0.4, 0.55, STEEL, [s * 2.3, 1.45, z]);
      box(1.7, 0.08, 0.45, YEL, [s * 2.3, 1.68, z]);
      box(0.4, 0.7, 0.8, OLIVE_D, [s * 1.5, 1.4, z]);
      // diagonal strut
      b.rod([s * 1.5, 0.95, z], [s * 3.1, 0.75, z], 0.1, STEEL_L);
      // piston
      cyl(0.22, 0.22, 0.7, STEEL, [fx, 1.2, z], Y, 8);
      for (let k = 0; k < 2; k++) cyl(0.235, 0.235, 0.09, k ? YEL : BLACK, [fx, 1.0 + k * 0.3, z], Y, 8);
      cyl(0.13, 0.13, 0.9, STEEL_L, [fx, 0.55, z], Y, 6);
      ball(0.2, STEEL, [fx, 0.28, z]);
      // pad
      cyl(0.6, 0.7, 0.18, OLIVE_D, [fx, 0.09, z], Y, 8);
      cyl(0.62, 0.62, 0.04, YEL, [fx, 0.17, z], Y, 8);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        cyl(0.05, 0.05, 0.12, BLACK, [fx + Math.cos(a) * 0.45, 0.2, z + Math.sin(a) * 0.45], Y, 6);
      }
      // status light
      glow(ball(0.07, CYAN, [fx, 1.5, z + 0.3]), 1.5);
    }
  }

  // underside details: driveshaft
  cyl(0.1, 0.1, 9, BLACK, [0, 0.95, 0], Z, 6);
  // number plate
  box(0.9, 0.3, 0.04, WHITE, [0, 1.15, 6.18], [-22, 0, 0]);
  box(0.3, 0.12, 0.05, RED, [-0.2, 1.15, 6.2], [-22, 0, 0]);

  return b.root;
}
