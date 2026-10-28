import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Alchemist's Workbench",
  "description": "A stylized Genshin-Impact-style alchemist's workbench: a sturdy carved wooden table with gilded trim, glowing potions, a distillation rig, stacked books, a brass balance scale and hanging and potted herbs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  woodDark: "#5a3a24",
  woodMid: "#8a5a36",
  woodLight: "#b98552",
  gold: "#e8bd4e",
  goldDark: "#a67a2a",
  cream: "#f4e8c8",
  teal: "#2fb8a8",
  tealDark: "#1c6b72",
  glass: "#bfe9ee",
  potionRed: "#ff5a6a",
  potionBlue: "#4aa8ff",
  potionGreen: "#7ae860",
  potionPurple: "#b070ff",
  flame: "#ffb040",
  leafGreen: "#4ea85a",
  leafDark: "#2c6e3c",
  bookRed: "#a83a3a",
  bookBlue: "#35508f",
  bookGreen: "#3b7a55",
  paper: "#efe2bd",
  iron: "#3a3c48",
  ink: "#22112f",
  clay: "#c4703c",
};
const M = {
  tableTop: [0, 0.9, 0] as [number, number, number],
  shelfTop: [0, 0.3, 0] as [number, number, number],
  rearFrameTop: [0, 1.9, -0.4] as [number, number, number],
  herbCorner: [0.75, 0.9, 0.05] as [number, number, number],
  bookStack: [0.8, 0.9, -0.2] as [number, number, number],
  scaleBase: [0, 0.9, -0.05] as [number, number, number],
  mortarSpot: [0.1, 0.9, 0.25] as [number, number, number],
  distillBase: [-0.7, 0.9, -0.05] as [number, number, number],
  potionRack: [-0.3, 0.9, -0.3] as [number, number, number],
  hangRail: [0, 1.65, -0.4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // table
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

function buildTable({ b, P }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const sph = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z] });

  // legs with gold foot caps and tops
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * 1.1, z = sz * 0.35;
    box(0.16, 0.74, 0.16, P.woodMid, x, 0.4, z);
    box(0.19, 0.06, 0.19, P.gold, x, 0.03, z);
    box(0.19, 0.04, 0.19, P.goldDark, x, 0.075, z);
    box(0.19, 0.05, 0.19, P.gold, x, 0.74, z);
    for (const k of [0.15, 0.55]) box(0.17, 0.02, 0.17, P.woodDark, x, k + 0.1, z);
  }
  // top slab and banding
  box(2.4, 0.1, 0.9, P.woodLight, 0, 0.85, 0);
  box(2.44, 0.04, 0.94, P.cream, 0, 0.88, 0);
  box(2.4, 0.03, 0.9, P.woodLight, 0, 0.895, 0);
  box(2.45, 0.015, 0.02, P.gold, 0, 0.9, 0.45);
  box(2.45, 0.015, 0.02, P.gold, 0, 0.9, -0.45);
  for (const sx of [-1, 1]) box(0.02, 0.015, 0.9, P.gold, sx * 1.215, 0.9, 0);
  // plank lines on top
  for (let i = -3; i <= 3; i++) box(0.006, 0.004, 0.86, P.woodMid, 0, 0.9, 0), i;
  for (let i = -3; i <= 3; i++) box(0.006, 0.004, 0.86, P.woodMid, i * 0.3, 0.8995, 0);

  // front apron
  box(2.1, 0.2, 0.06, P.woodDark, 0, 0.71, 0.4);
  box(2.1, 0.02, 0.07, P.gold, 0, 0.815, 0.4);
  box(2.1, 0.02, 0.07, P.gold, 0, 0.605, 0.4);
  const centers = [-0.75, -0.25, 0.25, 0.75];
  for (const cx of centers) {
    box(0.4, 0.13, 0.015, P.cream, cx, 0.71, 0.435);
    box(0.37, 0.1, 0.016, P.tealDark, cx, 0.71, 0.438);
    box(0.33, 0.012, 0.018, P.gold, cx, 0.755, 0.44);
    box(0.33, 0.012, 0.018, P.gold, cx, 0.665, 0.44);
    // swirl emblem: ring of beads
    for (let i = 0; i < 10; i++) {
      const a = i * 0.65, r = 0.008 + i * 0.0048;
      sph(0.0075, i % 2 ? P.teal : P.gold, cx + Math.cos(a) * r, 0.71 + Math.sin(a) * r, 0.448);
    }
    sph(0.012, P.cream, cx, 0.71, 0.449);
  }
  // rivets / brackets
  for (const x of [-1.0, -0.5, 0, 0.5, 1.0]) {
    sph(0.014, P.gold, x, 0.71, 0.436);
    box(0.03, 0.05, 0.02, P.goldDark, x, 0.64, 0.435);
  }
  // rear apron and side aprons
  box(2.1, 0.16, 0.05, P.woodDark, 0, 0.73, -0.4);
  for (const sx of [-1, 1]) {
    box(0.05, 0.2, 0.62, P.woodDark, sx * 1.1, 0.71, 0);
    box(0.06, 0.02, 0.62, P.gold, sx * 1.1, 0.815, 0);
    box(0.012, 0.1, 0.4, P.tealDark, sx * 1.13, 0.71, 0);
    sph(0.03, P.gold, sx * 1.14, 0.71, 0);
  }
  // stretchers and shelf
  for (const sx of [-1, 1]) box(0.06, 0.06, 0.64, P.woodMid, sx * 1.1, 0.3 - 0.04, 0);
  box(2.1, 0.06, 0.06, P.woodMid, 0, 0.26, 0.35);
  box(2.1, 0.06, 0.06, P.woodMid, 0, 0.26, -0.35);
  box(2.1, 0.04, 0.7, P.woodLight, 0, 0.29, 0);
  box(2.1, 0.012, 0.015, P.gold, 0, 0.32, 0.35);
  for (const sx of [-1, 1]) box(0.015, 0.012, 0.7, P.gold, sx * 1.05, 0.32, 0);

  // diagonal brackets
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.2, 0.03), P.goldDark, {
      at: [sx * 1.04, 0.55, sz * 0.3], rotation: [0, 0, sx * 40],
    });
  }

  // stored items on shelf (top at y=0.31)
  const jar = (x: number, z: number, c: string, h: number) => {
    cyl(0.06, 0.06, h, P.glass, x, 0.31 + h / 2, z, 8);
    cyl(0.052, 0.052, h * 0.75, c, x, 0.31 + h * 0.4, z, 8);
    cyl(0.045, 0.05, 0.04, P.woodLight, x, 0.31 + h + 0.02, z, 8);
    box(0.002 + 0.09, 0.04, 0.01, P.cream, x, 0.31 + h * 0.45, z + 0.055);
  };
  jar(-0.9, 0.15, P.potionGreen, 0.2);
  jar(-0.76, 0.12, P.potionPurple, 0.16);
  jar(-0.62, 0.17, P.potionRed, 0.22);
  jar(-0.48, 0.1, P.potionBlue, 0.14);
  // sacks
  for (const [x, z, s] of [[-0.1, 0.1, 1], [0.12, 0.05, 0.85]]) {
    const sk = b.part(new THREE.SphereGeometry(0.13 * s, 8, 6), P.cream, { at: [x, 0.31 + 0.1 * s, z], scale: [1, 1.05, 0.9] });
    cyl(0.045 * s, 0.07 * s, 0.05, P.cream, x, 0.31 + 0.24 * s, z, 8);
    b.part(new THREE.TorusGeometry(0.05 * s, 0.01, 5, 8), P.goldDark, { at: [x, 0.31 + 0.22 * s, z], rotation: [90, 0, 0] });
  }
  // barrel
  cyl(0.15, 0.13, 0.3, P.woodMid, 0.55, 0.46, 0.0, 10);
  for (const y of [0.37, 0.55]) b.part(new THREE.TorusGeometry(0.145, 0.012, 4, 12), P.gold, { at: [0.55, y, 0], rotation: [90, 0, 0] });
  cyl(0.12, 0.12, 0.01, P.woodDark, 0.55, 0.61, 0, 10);
  // crate
  box(0.3, 0.26, 0.3, P.woodLight, 0.92, 0.44, 0.0);
  for (const dx of [-0.14, 0.14]) box(0.03, 0.27, 0.31, P.woodDark, 0.92 + dx, 0.44, 0);
  box(0.31, 0.03, 0.31, P.woodDark, 0.92, 0.5, 0);
  box(0.31, 0.03, 0.31, P.woodDark, 0.92, 0.38, 0);
  sph(0.012, P.gold, 0.92, 0.44, 0.155);
  // small scattered herbs on shelf
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.ConeGeometry(0.02, 0.1, 4), i % 2 ? P.leafGreen : P.leafDark, {
      at: [0.22 + R() * 0.15, 0.36, 0.2 + R() * 0.1], rotation: [R() * 60, 0, R() * 60 - 30],
    });
  }
}
    return buildTable;
  })(),
  // rearFrame
  (() => {
function buildRearFrame({ b, P }: any) {
  const R = rng(11);
  const Z = -0.4;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (r0: number, r1: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), c, { at: [x, y, z] });
  const rotZ = (r0: number, len: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(r0, r0, len, 8), c, { at: [x, y, z], rotation: [0, 0, 90] });

  // posts
  for (const s of [1, -1]) {
    const x = s * 1.0;
    box(0.09, 1.0, 0.09, P.woodMid, x, 1.4, Z);
    box(0.1, 0.05, 0.1, P.woodDark, x, 0.925, Z);
    box(0.012, 0.9, 0.012, P.woodLight, x + 0.05, 1.4, Z + 0.03);
    box(0.12, 0.04, 0.12, P.gold, x, 1.86, Z);
    b.part(new THREE.OctahedronGeometry(0.06, 0), P.gold, { at: [x, 1.92 - 0.02, Z], scale: [1, 1.3, 1] });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.teal, { at: [x, 1.88, Z + 0.065] });
    box(0.1, 0.03, 0.1, P.goldDark, x, 0.96, Z);
  }
  // crossbeam
  box(2.1, 0.09, 0.09, P.woodDark, 0, 1.78, Z);
  box(2.1, 0.015, 0.095, P.gold, 0, 1.826, Z);
  for (let i = -4; i <= 4; i++) b.part(new THREE.OctahedronGeometry(0.02, 0), P.teal, { at: [i * 0.22, 1.78, Z + 0.047] });
  // drying rail
  rotZ(0.02, 2.0, P.woodLight, 0, 1.65, Z + 0.02);
  for (const s of [1, -1]) {
    box(0.03, 0.14, 0.03, P.goldDark, s * 0.97, 1.72, Z + 0.02);
    cyl(0.03, 0.03, 0.02, P.gold, s * 1.0, 1.65, Z + 0.02).rotation.z = Math.PI / 2;
  }
  // herb bundles
  const cols = [P.leafGreen, P.leafDark, "#8aa84a", P.leafGreen];
  const xs = [-0.85, -0.65, -0.45, 0.3, 0.5, 0.7, 0.9];
  xs.forEach((x, i) => {
    const h = 0.18 + R() * 0.12;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 6), P.woodMid, { at: [x, 1.62, Z + 0.02] });
    b.part(new THREE.ConeGeometry(0.05, h, 6), cols[i % 4], { at: [x, 1.6 - h / 2, Z + 0.02], rotation: [180, 0, 0] });
    for (const k of [-1, 1])
      b.part(new THREE.ConeGeometry(0.03, h * 0.8, 5), cols[(i + 1) % 4], {
        at: [x + k * 0.03, 1.6 - h * 0.4, Z + 0.035],
        rotation: [180, 0, k * 14],
      });
    cyl(0.032, 0.032, 0.014, P.cream, x, 1.585, Z + 0.02);
    if (i % 3 === 0) b.part(new THREE.SphereGeometry(0.014, 5, 4), P.potionRed, { at: [x + 0.02, 1.6 - h, Z + 0.05] });
  });
  // lantern
  const lx = 0.0;
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4), P.iron, { at: [lx, 1.69, Z + 0.1] });
  b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 4), P.iron, { at: [lx, 1.72, Z + 0.05], rotation: [90, 0, 0] });
  cyl(0.03, 0.07, 0.04, P.goldDark, lx, 1.61, Z + 0.1, 6);
  cyl(0.065, 0.065, 0.1, P.gold, lx, 1.54, Z + 0.1, 6).scale.set(1, 0.001, 1);
  glow(b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 6), "#ffe08a", { at: [lx, 1.54, Z + 0.1] }), 1.4);
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0), P.flame, { at: [lx, 1.54, Z + 0.1], scale: [1, 1.5, 1] }), 2);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.5;
    box(0.01, 0.11, 0.01, P.goldDark, lx + Math.cos(a) * 0.06, 1.54, Z + 0.1 + Math.sin(a) * 0.06);
  }
  cyl(0.07, 0.04, 0.03, P.goldDark, lx, 1.475, Z + 0.1, 6);
  b.part(new THREE.SphereGeometry(0.015, 5, 4), P.gold, { at: [lx, 1.455, Z + 0.1] });
  // parchment
  box(0.3, 0.38, 0.01, P.paper, -0.45, 1.3, Z + 0.06);
  box(0.32, 0.02, 0.012, P.cream, -0.45, 1.5, Z + 0.06);
  box(0.32, 0.02, 0.012, P.cream, -0.45, 1.11, Z + 0.06);
  for (let i = 0; i < 6; i++) box(0.18 - (i % 3) * 0.03, 0.012, 0.004, P.ink, -0.48 + (i % 3) * 0.015, 1.43 - i * 0.045, Z + 0.067);
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0), P.teal, { at: [-0.45, 1.19, Z + 0.07], scale: [1, 1, 0.3] }), 1.2);
  for (const s of [-1, 1]) b.part(new THREE.SphereGeometry(0.014, 5, 4), P.potionRed, { at: [-0.45 + s * 0.12, 1.48, Z + 0.07] });
  // shelf board with jars
  box(0.5, 0.04, 0.14, P.woodMid, 0.55, 1.2, Z + 0.03);
  box(0.5, 0.015, 0.145, P.gold, 0.55, 1.2 + 0.027, Z + 0.03);
  for (const s of [-1, 1]) box(0.03, 0.1, 0.12, P.woodDark, 0.55 + s * 0.2, 1.14, Z + 0.03);
  const jc = [P.potionGreen, P.potionPurple, P.potionBlue, P.potionRed];
  jc.forEach((c, i) => {
    const x = 0.4 + i * 0.1;
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 8), P.glass, { at: [x, 1.267, Z + 0.03] });
    glow(b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.055, 8), c, { at: [x, 1.255, Z + 0.03] }), 1.2);
    cyl(0.02, 0.02, 0.02, P.woodLight, x, 1.318, Z + 0.03);
    box(0.03, 0.02, 0.005, P.gold, x, 1.26, Z + 0.065);
  });
  // braces
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.3, 0.04), P.woodDark, { at: [s * 0.9, 1.65, Z], rotation: [0, 0, s * 45] });
  }
}
    return buildRearFrame;
  })(),
  // alchemyRig
  (() => {
function buildAlchemyRig({ b, P, M }: any) {
  const R = rng(5);
  const Y = M.tableTop[1];
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // Tripod and burner
  const bx = M.distillBase[0], bz = M.distillBase[2];
  part(cyl(0.11, 0.13, 0.03, 10), P.iron, [bx, Y + 0.015, bz]);
  part(cyl(0.05, 0.07, 0.07, 8), P.goldDark, [bx, Y + 0.065, bz]);
  glow(part(new THREE.ConeGeometry(0.04, 0.12, 7), P.flame, [bx, Y + 0.14, bz]), 1.6);
  glow(part(new THREE.ConeGeometry(0.02, 0.07, 6), "#fff0b0", [bx, Y + 0.13, bz]), 2);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const x = bx + Math.cos(a) * 0.1, z = bz + Math.sin(a) * 0.1;
    b.rod([x, Y, z], [bx + Math.cos(a) * 0.05, Y + 0.3, bz + Math.sin(a) * 0.05], 0.012, P.iron);
  }
  b.part(new THREE.TorusGeometry(0.06, 0.01, 5, 12), P.iron, { at: [bx, Y + 0.3, bz], rotation: [90, 0, 0] });

  // Flask
  const fy = Y + 0.36;
  part(sph(0.15, 12, 9), P.glass, [bx, fy, bz]);
  glow(part(sph(0.125, 10, 8), P.potionGreen, [bx, fy - 0.025, bz]), 1.0);
  part(cyl(0.035, 0.05, 0.12, 8), P.glass, [bx, fy + 0.18, bz]);
  part(cyl(0.045, 0.045, 0.02, 8), P.gold, [bx, fy + 0.25, bz]);
  part(cyl(0.03, 0.03, 0.04, 8), P.woodLight, [bx, fy + 0.27, bz]);

  // Coil tube to receiving bottle
  const rx = bx + 0.45, rz = bz + 0.1;
  b.sweep([[bx, fy + 0.22, bz], [bx + 0.12, fy + 0.24, bz], [bx + 0.25, fy + 0.15, bz + 0.05], [rx, Y + 0.3, rz]], 0.014, { color: P.gold });
  const cp: number[][] = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18, a = t * Math.PI * 6;
    cp.push([bx + 0.2 + t * 0.12 + Math.cos(a) * 0.00, fy + 0.2 - t * 0.2 + Math.sin(a) * 0.04, bz + 0.05 + Math.cos(a) * 0.04]);
  }
  b.sweep(cp, 0.01, { color: P.goldDark });
  part(cyl(0.07, 0.08, 0.2, 8), P.glass, [rx, Y + 0.1, rz]);
  glow(part(cyl(0.062, 0.072, 0.1, 8), P.potionBlue, [rx, Y + 0.055, rz]), 1.0);
  part(cyl(0.03, 0.05, 0.06, 8), P.glass, [rx, Y + 0.23, rz]);

  // Potion rack
  const px = M.potionRack[0], pz = M.potionRack[2];
  part(new THREE.BoxGeometry(0.6, 0.03, 0.14), P.woodMid, [px, Y + 0.2, pz]);
  part(new THREE.BoxGeometry(0.62, 0.015, 0.15), P.gold, [px, Y + 0.218, pz]);
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(0.03, 0.2, 0.14), P.woodDark, [px + s * 0.3, Y + 0.1, pz]);
  const cols = [P.potionRed, P.potionBlue, P.potionGreen, P.potionPurple, P.potionRed, P.potionBlue, P.potionPurple];
  cols.forEach((c, i) => {
    const x = px - 0.27 + i * 0.09, y0 = Y + 0.23;
    const k = i % 3;
    const h = k === 1 ? 0.2 : 0.13;
    if (k === 2) {
      part(new THREE.BoxGeometry(0.07, h, 0.07), P.glass, [x, y0 + h / 2, pz]);
      glow(part(new THREE.BoxGeometry(0.058, h * 0.7, 0.058), c, [x, y0 + h * 0.4, pz]), 1.0);
    } else if (k === 0) {
      part(sph(0.045, 9, 7), P.glass, [x, y0 + 0.045, pz]);
      glow(part(sph(0.036, 8, 6), c, [x, y0 + 0.04, pz]), 1.0);
      h;
    } else {
      part(cyl(0.032, 0.035, h, 8), P.glass, [x, y0 + h / 2, pz]);
      glow(part(cyl(0.025, 0.028, h * 0.65, 8), c, [x, y0 + h * 0.35, pz]), 1.0);
    }
    const top = k === 0 ? y0 + 0.1 : y0 + h;
    part(cyl(0.015, 0.02, 0.03, 6), P.woodLight, [x, top + 0.01, pz]);
    part(new THREE.BoxGeometry(0.03, 0.035, 0.004), P.gold, [x, y0 + 0.05, pz + (k === 2 ? 0.037 : 0.04)]);
  });

  // Droplets and sparkles
  for (let i = 0; i < 12; i++) {
    const x = bx + (R() - 0.5) * 0.5, y = fy + 0.3 + R() * 0.1, z = bz + (R() - 0.5) * 0.4;
    const c = [P.potionGreen, P.gold, P.cream, P.potionPurple][i % 4];
    glow(part(i % 2 ? new THREE.OctahedronGeometry(0.014) : sph(0.012, 6, 4), c, [x, Math.min(y, 1.48), z]), 2);
  }
}
    return buildAlchemyRig;
  })(),
  // scaleAndTools
  (() => {
function buildScaleAndTools({ b, J, P, M }: Ctx) {
  const TOP = 0.9;
  const BRASS = "#d9a53c";
  const mk = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---- balance scale (centre x=0.15) ----
  const sx = 0.15, sz = -0.05;
  mk(cyl(0.11, 0.13, 0.04, 8), P.goldDark, [sx, TOP + 0.02, sz]);
  mk(cyl(0.09, 0.11, 0.03, 8), BRASS, [sx, TOP + 0.055, sz]);
  mk(cyl(0.02, 0.03, 0.5, 8), BRASS, [sx, TOP + 0.31, sz]);
  mk(sph(0.035, 8, 6), P.gold, [sx, TOP + 0.3, sz]);
  mk(sph(0.04, 8, 6), P.gold, [sx, TOP + 0.58, sz]);
  const by = TOP + 0.52;
  mk(box(0.56, 0.025, 0.025), BRASS, [sx, by, sz]);
  mk(box(0.1, 0.05, 0.03), P.gold, [sx, by, sz]);
  for (const s of [1, -1]) {
    const px = sx + s * 0.27;
    mk(sph(0.025, 8, 6), P.gold, [px, by, sz]);
    mk(cyl(0.008, 0.008, 0.02, 6), P.gold, [sx + s * 0.28, by + 0.02, sz]);
    // chains
    for (const dz of [-0.06, 0.06, 0]) {
      const ang = dz === 0 ? 0 : 1;
      if (dz === 0) continue;
      b.rod([px, by, sz], [px, TOP + 0.21, sz + dz], 0.004, P.goldDark);
      void ang;
    }
    b.rod([px, by, sz], [px + 0.0, TOP + 0.21, sz], 0.004, P.goldDark);
    mk(cyl(0.12, 0.05, 0.04, 12), BRASS, [px, TOP + 0.19, sz]);
    mk(cyl(0.125, 0.125, 0.012, 12), P.gold, [px, TOP + 0.21, sz]);
  }
  // pan contents: weights left (+X), crystals right
  const wl = sx + 0.27;
  mk(cyl(0.025, 0.03, 0.035, 8), P.iron, [wl - 0.03, TOP + 0.245, sz]);
  mk(cyl(0.018, 0.022, 0.03, 8), P.goldDark, [wl + 0.04, TOP + 0.24, sz + 0.02]);
  mk(cyl(0.012, 0.015, 0.025, 8), P.iron, [wl, TOP + 0.24, sz - 0.05]);
  const cr = sx - 0.27;
  const cols = [P.potionBlue, P.teal, P.potionPurple, P.glass];
  cols.forEach((c, i) => {
    const a = i * 1.6;
    glow(
      mk(new THREE.OctahedronGeometry(0.03 + (i % 2) * 0.01), c, [cr + Math.cos(a) * 0.04, TOP + 0.255, sz + Math.sin(a) * 0.04], { rotation: [0, i * 30, 15] }),
      1.4,
    );
  });

  // ---- mortar and pestle (0.1,0.25) ----
  const mx = 0.1, mz = 0.25;
  mk(cyl(0.07, 0.045, 0.02, 10), P.iron, [mx, TOP + 0.01, mz]);
  b.lathe([[0, 0], [0.04, 0], [0.075, 0.06], [0.085, 0.07], [0.07, 0.07], [0.0, 0.015]], { at: [mx, TOP + 0.02, mz], color: P.cream, segments: 10 });
  mk(cyl(0.088, 0.088, 0.008, 10), P.gold, [mx, TOP + 0.092, mz]);
  mk(cyl(0.065, 0.065, 0.01, 10), "#6fae4a", [mx, TOP + 0.075, mz]);
  for (let i = 0; i < 5; i++)
    mk(new THREE.TetrahedronGeometry(0.014), i % 2 ? P.leafGreen : P.leafDark, [mx + Math.cos(i * 1.3) * 0.04, TOP + 0.085, mz + Math.sin(i * 1.3) * 0.04], { rotation: [i * 40, i * 70, 0] });
  b.rod([mx - 0.01, TOP + 0.08, mz], [mx + 0.06, TOP + 0.21, mz + 0.02], 0.014, P.woodLight);
  mk(sph(0.022, 8, 6), P.woodMid, [mx + 0.065, TOP + 0.22, mz + 0.02]);
  // scattered loose herbs
  for (let i = 0; i < 4; i++)
    mk(new THREE.TetrahedronGeometry(0.015), P.leafGreen, [mx + 0.14 + i * 0.03, TOP + 0.008, mz + 0.03 - i * 0.02], { rotation: [i * 50, i * 20, 0] });

  // ---- vial tray (0.35,0.28) ----
  const tx = 0.33, tz = 0.27;
  mk(box(0.22, 0.015, 0.1), P.woodDark, [tx, TOP + 0.008, tz]);
  mk(box(0.23, 0.012, 0.012), P.gold, [tx, TOP + 0.02, tz + 0.05]);
  mk(box(0.23, 0.012, 0.012), P.gold, [tx, TOP + 0.02, tz - 0.05]);
  [P.potionRed, P.potionGreen, P.potionBlue, P.potionPurple].forEach((c, i) => {
    const x = tx - 0.08 + i * 0.054;
    mk(cyl(0.015, 0.015, 0.09, 8), P.glass, [x, TOP + 0.06, tz], { flat: true });
    glow(mk(cyl(0.011, 0.011, 0.05, 8), c, [x, TOP + 0.045, tz]), 1.3);
    mk(cyl(0.012, 0.012, 0.02, 6), P.woodLight, [x, TOP + 0.115, tz]);
  });

  // ---- grimoire on stand (0.38,-0.18) ----
  const gx = 0.38, gz = -0.12;
  mk(cyl(0.07, 0.09, 0.03, 6), P.woodDark, [gx, TOP + 0.015, gz]);
  mk(cyl(0.025, 0.035, 0.12, 6), P.woodMid, [gx, TOP + 0.09, gz]);
  mk(box(0.3, 0.02, 0.2), P.woodDark, [gx, TOP + 0.165, gz], { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) {
    mk(box(0.14, 0.012, 0.18), P.bookBlue, [gx + s * 0.075, TOP + 0.185, gz + 0.005], { rotation: [-20, 0, s * -8] });
    mk(box(0.13, 0.014, 0.17), P.paper, [gx + s * 0.073, TOP + 0.195, gz + 0.006], { rotation: [-20, 0, s * -8] });
    for (let i = 0; i < 4; i++)
      glow(mk(box(0.07 - (i % 2) * 0.02, 0.003, 0.008), P.teal, [gx + s * 0.075, TOP + 0.205 + 0.0 - i * 0.0045 + 0.006, gz - 0.05 + i * 0.03 - 0.0], { rotation: [-20, 0, 0] }), 1.6);
  }
  mk(box(0.012, 0.02, 0.19), P.gold, [gx, TOP + 0.188, gz], { rotation: [-20, 0, 0] });
  glow(mk(new THREE.OctahedronGeometry(0.02), P.potionBlue, [gx, TOP + 0.3, gz + 0.02]), 1.8);

  // ---- inkwell and quill (0.0,0.28) ----
  const ix = -0.02, iz = 0.28;
  mk(cyl(0.035, 0.04, 0.05, 8), P.ink, [ix, TOP + 0.025, iz]);
  mk(cyl(0.036, 0.036, 0.008, 8), P.gold, [ix, TOP + 0.054, iz]);
  b.rod([ix, TOP + 0.05, iz], [ix - 0.04, TOP + 0.26, iz + 0.04], 0.004, P.cream);
  b.spike([ix - 0.04, TOP + 0.26, iz + 0.04], [-0.3, 0.9, 0.3], 0.14, 0.03, { color: P.cream });
  b.spike([ix - 0.045, TOP + 0.25, iz + 0.04], [-0.3, 0.9, 0.3], 0.1, 0.012, { color: P.teal });
}
    return buildScaleAndTools;
  })(),
  // booksAndHerbs
  (() => {
function buildBooksAndHerbs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const sph = (r: number, c: string, x: number, y: number, z: number, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z], scale: sc });
  const glowMat = (p: any) => {
    try { p.mesh.material = (p.mesh.material as THREE.MeshStandardMaterial).clone(); (p.mesh.material as any).emissive = new THREE.Color((p.mesh.material as any).color); (p.mesh.material as any).emissiveIntensity = 1.2; } catch (e) {}
    return p;
  };
  const leaf = (x: number, y: number, z: number, len: number, yaw: number, tilt: number, c: string) => {
    const g = new THREE.OctahedronGeometry(1, 0);
    b.part(g, c, { at: [x, y, z], scale: [len * 0.28, len * 0.06, len * 0.5], rotation: [tilt, yaw, 0] });
  };

  // book stack
  const bx = M.bookStack[0], bz = M.bookStack[2];
  const cols = [P.bookRed, P.bookBlue, P.bookGreen, P.bookRed, P.bookBlue];
  let y = M.bookStack[1];
  cols.forEach((c, i) => {
    const w = 0.4 - i * 0.015, d = 0.28 - (i % 2) * 0.015, h = 0.07;
    const ry = (R() - 0.5) * 0.35;
    const cy = y + h / 2;
    box(w, h, d, c, bx, cy, bz, ry);
    box(w - 0.03, h - 0.02, d - 0.02, P.paper, bx, cy, bz + 0.012, ry);
    box(w + 0.01, h + 0.004, 0.015, c, bx, cy, bz + d / 2 - 0.005, ry);
    box(0.02, h + 0.006, d + 0.006, P.gold, bx + Math.cos(ry) * (w / 2 - 0.1), cy, bz, ry);
    box(0.02, h + 0.006, d + 0.006, P.gold, bx - Math.cos(ry) * (w / 2 - 0.1), cy, bz, ry);
    for (const s of [1, -1]) for (const t of [1, -1]) box(0.035, h + 0.008, 0.035, P.gold, bx + s * (w / 2 - 0.01), cy, bz + t * (d / 2 - 0.01), ry);
    glowMat(sph(0.014, P.gold, bx, cy, bz + d / 2 + 0.004, [1, 1, 0.4]));
    y += h;
  });
  // open book on top
  const ty = y;
  box(0.3, 0.015, 0.2, P.bookRed, bx, ty + 0.008, bz);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.14, 0.012, 0.18), P.paper, { at: [bx + s * 0.075, ty + 0.03, bz], rotation: [0, 0, -s * 0.18] });
    for (let k = 0; k < 4; k++) box(0.1, 0.002, 0.008, P.ink, bx + s * 0.08, ty + 0.04 - s * 0, bz - 0.06 + k * 0.04);
  }
  glowMat(sph(0.02, P.teal, bx, ty + 0.05, bz, [1, 0.6, 1]));

  // clay pots with herbs
  const pots: [number, number, number][] = [[0.78, 0.2, 0.09], [1.02, 0.25, 0.08], [0.62, 0.3, 0.07]];
  pots.forEach(([px, pz, pr], pi) => {
    const py = M.herbCorner[1];
    cyl(pr, pr * 0.7, pr * 1.6, P.clay, px, py + pr * 0.8, pz, 10);
    cyl(pr * 1.15, pr * 1.1, 0.02, P.goldDark, px, py + pr * 1.6, pz, 10);
    cyl(pr * 0.95, pr * 0.95, 0.01, P.woodDark, px, py + pr * 1.6, pz, 10);
    const n = 7 + pi * 2;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2, rr = 0.02 + R() * 0.03;
      const ly = py + pr * 1.7 + 0.06 + R() * 0.1;
      leaf(px + Math.cos(a) * rr, ly, pz + Math.sin(a) * rr, 0.12 + R() * 0.05, -a, 0.9, k % 2 ? P.leafGreen : P.leafDark);
    }
    cyl(0.006, 0.008, 0.1, P.leafDark, px, py + pr * 1.7 + 0.05, pz, 5);
  });
  // flower
  const fx = 1.1, fz = -0.05, fy = M.herbCorner[1];
  cyl(0.012, 0.012, 0.2, P.leafDark, fx, fy + 0.1, fz, 5);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    b.part(new THREE.OctahedronGeometry(1, 0), P.cream, { at: [fx + Math.cos(a) * 0.035, fy + 0.21, fz + Math.sin(a) * 0.035], scale: [0.03, 0.012, 0.015], rotation: [0, -a, 0] });
  }
  glowMat(sph(0.022, P.flame, fx, fy + 0.215, fz));
  leaf(fx + 0.03, fy + 0.07, fz, 0.1, 1, 0.5, P.leafGreen);
  leaf(fx - 0.03, fy + 0.09, fz, 0.1, -2, 0.5, P.leafDark);

  // mushrooms
  const mx = 0.58, mz = -0.2, my = M.herbCorner[1];
  [[0, 0, 0.05], [0.07, 0.04, 0.035], [-0.05, 0.05, 0.03]].forEach(([dx, dz, r]) => {
    cyl(r * 0.3, r * 0.4, r * 1.4, P.cream, mx + dx, my + r * 0.7, mz + dz, 6);
    b.part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.potionRed, { at: [mx + dx, my + r * 1.4, mz + dz], scale: [1, 0.7, 1] });
    sph(r * 0.18, P.cream, mx + dx + r * 0.3, my + r * 1.9, mz + dz, [1, 0.5, 1]);
  });

  // cut herb bundle
  for (let k = 0; k < 7; k++) {
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 5), k % 2 ? P.leafGreen : P.leafDark, { at: [0.9, my + 0.02 + k * 0.001, 0.3], rotation: [1.5, 0, 1.4 + (k - 3) * 0.06] });
  }
  for (let k = 0; k < 4; k++) leaf(0.82 + k * 0.01, my + 0.02, 0.3 + (k - 1.5) * 0.02, 0.09, k, 0, P.leafGreen);
  box(0.02, 0.03, 0.05, P.gold, 0.9, my + 0.02, 0.3);
  // loose leaves
  for (let k = 0; k < 4; k++) leaf(0.7 + R() * 0.4, my + 0.004, 0.0 + R() * 0.15, 0.08, R() * 6, 0, k % 2 ? P.leafGreen : P.leafDark);

  // seed jar
  const jx = 1.12, jz = 0.32;
  cyl(0.04, 0.04, 0.09, P.glass, jx, my + 0.045, jz, 8);
  glowMat(cyl(0.034, 0.034, 0.06, P.potionGreen, jx, my + 0.035, jz, 8));
  cyl(0.032, 0.036, 0.025, P.woodMid, jx, my + 0.10, jz, 8);
  cyl(0.042, 0.042, 0.01, P.gold, jx, my + 0.087, jz, 8);
  for (let k = 0; k < 5; k++) glowMat(sph(0.008, P.potionGreen, jx + (R() - 0.5) * 0.05, my + 0.15 + R() * 0.08, jz + (R() - 0.5) * 0.05));
}
    return buildBooksAndHerbs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
