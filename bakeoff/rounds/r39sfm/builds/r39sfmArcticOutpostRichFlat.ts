import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "Firewatch-style flat-colour diorama: a red-orange stilted research cabin with glowing windows, radio mast, weather station, dish, sled, snowmobile, drums, pines and layered violet mountains on a snowy base.",
};

// Palette
const SNOW = "#f6ecef";
const SNOW_SH = "#d3c0d8";
const ICE = "#86b4c8";
const ICE_DK = "#5f8fae";
const WALL = "#dd5a30";
const WALL_DK = "#b8412a";
const TRIM = "#f4dfb4";
const ROOF = "#3f4a68";
const DARK = "#2b2338";
const GLOW = "#ffc860";
const BRICK = "#8c4a48";
const MOUNT = "#6d5a8e";
const MOUNT2 = "#9b6b92";
const MOUNT3 = "#c4777f";
const PINE = "#2e5b5c";
const PINE2 = "#407a6c";
const WOOD = "#a9703c";
const WOOD_DK = "#7a4c2e";
const TEAL = "#2f6370";
const ORANGE = "#e8772e";
const METAL = "#8e93a8";
const METAL_DK = "#5c6178";
const RED = "#c8402c";
const SMOKE = "#ebd6e0";
const SMOKE2 = "#d9c2d6";

export default function build() {
  const b = createBuilder({ name: "arctic_outpost" });

  type V = [number, number, number];

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (r: number, h: number, c: string, x: number, y0: number, z: number, seg = 8, rot?: V, rt?: number) =>
    b.part(new THREE.CylinderGeometry(rt ?? r, r, h, seg), c, { at: [x, y0 + h / 2, z], rotation: rot, flat: seg < 12 });
  const cone = (r: number, h: number, c: string, x: number, y0: number, z: number, seg = 6, rot?: V) =>
    b.part(new THREE.ConeGeometry(r, h, seg), c, { at: [x, y0 + h / 2, z], rotation: rot, flat: true });
  const sph = (r: number, c: string, x: number, y: number, z: number, sc: V = [1, 1, 1], seg = 7) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), c, { at: [x, y, z], scale: sc, flat: true });
  const rock = (r: number, c: string, x: number, y: number, z: number, sc: V = [1, 0.7, 1], rotY = 0) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), c, { at: [x, y, z], scale: sc, rotation: [0, rotY, 0], flat: true });
  const rod = (a: V, e: V, r: number, c: string) => b.rod(a, e, r, c, { sides: 4 } as any);

  // ---------- base ----------
  cyl(7.3, 0.35, ICE, 0, 0, 0, 28);
  cyl(7.0, 0.12, ICE_DK, 0, 0.0, 0, 28);
  cyl(7.5, 0.28, SNOW, 0, 0.35, 0, 28);
  // snow shadow ring (lilac) near the rim
  cyl(7.52, 0.05, SNOW_SH, 0, 0.35, 0, 28);
  // gentle drifts
  const drifts: [number, number, number, number, number][] = [
    [-3.4, 0.62, -3.3, 1.6, 0.35],
    [3.6, 0.62, 3.8, 1.3, 0.3],
    [-5.0, 0.6, 3.0, 1.2, 0.3],
    [5.8, 0.6, -1.2, 1.0, 0.3],
    [0.5, 0.6, -3.6, 1.5, 0.28],
  ];
  for (const [x, y, z, r, h] of drifts) sph(r, SNOW, x, y, z, [1.4, h, 1], 8);
  // lilac shade drifts
  for (const [x, z] of [[-2.2, -2.3], [2.8, -2.4], [-4.5, 1.0]]) sph(0.9, SNOW_SH, x, 0.6, z, [1.5, 0.2, 1], 7);

  // ---------- mountains ----------
  const mountain = (x: number, z: number, r: number, h: number, c: string, rotY: number, capC = SNOW) => {
    b.part(new THREE.ConeGeometry(r, h, 6), c, { at: [x, 0.6 + h / 2 - 0.1, z], rotation: [0, rotY, 0], flat: true });
    const f = 0.38;
    b.part(new THREE.ConeGeometry(r * f * 1.04, h * f, 6), capC, {
      at: [x, 0.5 + h - (h * f) / 2, z],
      rotation: [0, rotY, 0],
      flat: true,
    });
  };
  mountain(-3.3, -4.5, 2.2, 3.8, MOUNT, 10);
  mountain(0.9, -5.2, 2.4, 5.0, MOUNT2, 25);
  mountain(4.2, -3.7, 2.0, 3.3, MOUNT3, 40);
  mountain(-5.2, -2.2, 1.5, 2.2, MOUNT2, 0);

  // ---------- cabin ----------
  const FLOOR = 1.1;
  const WALL_H = 2.2;
  const TOP = FLOOR + WALL_H;
  // stilts
  for (const x of [-1.9, 0, 1.9])
    for (const z of [-1.4, 1.4]) {
      cyl(0.11, 0.55, WOOD_DK, x, 0.55, z, 6);
      box(0.4, 0.1, 0.4, METAL_DK, x, 0.6, z);
    }
  box(4.5, 0.14, 3.5, WOOD_DK, 0, FLOOR - 0.07, 0);
  // walls
  box(4.4, WALL_H, 3.4, WALL, 0, FLOOR + WALL_H / 2, 0);
  // board lines
  for (let i = 1; i < 6; i++) box(4.43, 0.03, 3.43, WALL_DK, 0, FLOOR + i * 0.36, 0);
  // lower skirt
  box(4.46, 0.3, 3.46, WALL_DK, 0, FLOOR + 0.15, 0);
  // corner trim
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.16, WALL_H, 0.16, TRIM, sx * 2.2, FLOOR + WALL_H / 2, sz * 1.7);
  // eave band
  box(4.5, 0.12, 3.5, TRIM, 0, TOP - 0.06, 0);
  // gables
  const gable = [[-2.2, 0], [2.2, 0], [0, 1.0, "sharp"]] as any;
  b.extrude(gable, { at: [0, TOP, 0], x: [1, 0, 0], thickness: 3.3, color: WALL_DK });
  // roof
  const ang = 24.6;
  for (const s of [1, -1]) {
    box(2.7, 0.12, 3.9, ROOF, s * 1.2, TOP + 0.55, 0, [0, 0, -s * ang]);
    box(2.55, 0.16, 3.7, SNOW, s * 1.26, TOP + 0.68, 0, [0, 0, -s * ang]);
    // lilac underside shadow strip on snow
    box(2.5, 0.03, 3.72, SNOW_SH, s * 1.3, TOP + 0.575, 0, [0, 0, -s * ang]);
    // icicles
    for (let i = 0; i < 7; i++) {
      const z = -1.65 + i * 0.55;
      cone(0.045, 0.2 + (i % 3) * 0.08, ICE, s * 2.38, TOP - 0.28 - (i % 3) * 0.08, z, 5, [180, 0, 0]);
    }
  }
  box(0.28, 0.12, 3.9, SNOW, 0, TOP + 1.12, 0);

  // chimney
  box(0.5, 1.8, 0.5, BRICK, -1.3, TOP + 0.6, -0.5);
  for (let i = 0; i < 4; i++) box(0.52, 0.03, 0.52, DARK, -1.3, TOP + 0.1 + i * 0.4, -0.5);
  box(0.64, 0.1, 0.64, DARK, -1.3, TOP + 1.55, -0.5);
  box(0.6, 0.06, 0.6, SNOW, -1.3, TOP + 1.63, -0.5);
  const puffs: [number, number, number, number, string][] = [
    [-1.3, TOP + 2.0, -0.5, 0.2, SMOKE],
    [-1.15, TOP + 2.5, -0.55, 0.3, SMOKE],
    [-0.9, TOP + 3.1, -0.6, 0.4, SMOKE2],
    [-0.55, TOP + 3.8, -0.7, 0.5, SMOKE],
  ];
  for (const [x, y, z, r, c] of puffs) rock(r, c, x, y, z, [1, 0.85, 1]);

  // door
  const DX = 0.9;
  box(1.0, 1.8, 0.07, TRIM, DX, FLOOR + 0.9, 1.72);
  box(0.8, 1.65, 0.1, TEAL, DX, FLOOR + 0.85, 1.74);
  box(0.62, 0.55, 0.11, DARK, DX, FLOOR + 1.0, 1.745);
  glow(box(0.5, 0.42, 0.115, GLOW, DX, FLOOR + 1.1, 1.75), 1.2);
  box(0.04, 0.42, 0.12, DARK, DX, FLOOR + 1.1, 1.752);
  box(0.12, 0.05, 0.12, TRIM, DX + 0.28, FLOOR + 0.8, 1.8);
  // awning
  box(1.4, 0.08, 0.7, ROOF, DX, FLOOR + 2.0, 2.05, [14, 0, 0]);
  box(1.3, 0.07, 0.6, SNOW, DX, FLOOR + 2.08, 2.05, [14, 0, 0]);
  // lantern
  rod([DX - 0.7, FLOOR + 1.95, 1.75], [DX - 0.7, FLOOR + 1.7, 1.9], 0.015, DARK);
  glow(sph(0.1, GLOW, DX - 0.7, FLOOR + 1.6, 1.92, [1, 1.2, 1], 6), 1.8);
  cyl(0.07, 0.05, DARK, DX - 0.7, FLOOR + 1.72, 1.92, 6);
  // porch
  box(1.9, 0.12, 1.1, WOOD, DX, FLOOR - 0.06, 2.25);
  for (const x of [DX - 0.88, DX + 0.88]) {
    cyl(0.05, 0.9, WOOD_DK, x, FLOOR, 2.75, 5);
  }
  box(1.85, 0.06, 0.08, WOOD_DK, DX, FLOOR + 0.9, 2.75);
  box(0.08, 0.06, 1.0, WOOD_DK, DX - 0.88, FLOOR + 0.9, 2.25);
  box(1.85, 0.05, 0.06, WOOD_DK, DX, FLOOR + 0.5, 2.75);
  for (let i = 0; i < 3; i++) {
    box(1.3, 0.12, 0.32, WOOD, DX, FLOOR - 0.2 - i * 0.16, 3.0 + i * 0.3);
    box(1.3, 0.06, 0.3, SNOW, DX, FLOOR - 0.13 - i * 0.16, 3.0 + i * 0.3);
  }

  // windows
  const frontWin = (x: number) => {
    box(1.1, 0.95, 0.06, TRIM, x, FLOOR + 1.3, 1.72);
    glow(box(0.9, 0.75, 0.07, GLOW, x, FLOOR + 1.3, 1.74), 1.1);
    box(0.05, 0.75, 0.08, DARK, x, FLOOR + 1.3, 1.745);
    box(0.9, 0.05, 0.08, DARK, x, FLOOR + 1.3, 1.745);
    box(0.4, 0.55, 0.075, "#ffb045", x - 0.22, FLOOR + 1.35, 1.745); // warm curtain tint
    box(1.25, 0.08, 0.2, SNOW, x, FLOOR + 0.8, 1.8);
    for (const s of [1, -1]) box(0.32, 0.95, 0.05, ROOF, x + s * 0.72, FLOOR + 1.3, 1.73);
  };
  frontWin(-1.1);
  for (const z of [-0.7, 0.7])
    for (const sx of [1, -1]) {
      const X = sx * 2.2;
      box(0.06, 0.95, 1.0, TRIM, X, FLOOR + 1.3, z);
      glow(box(0.07, 0.75, 0.8, GLOW, X + sx * 0.02, FLOOR + 1.3, z), 1.0);
      box(0.08, 0.75, 0.05, DARK, X + sx * 0.03, FLOOR + 1.3, z);
      box(0.08, 0.05, 0.8, DARK, X + sx * 0.03, FLOOR + 1.3, z);
      box(0.2, 0.08, 1.15, SNOW, X + sx * 0.06, FLOOR + 0.8, z);
    }
  // hazard sign on wall
  box(0.5, 0.35, 0.03, TRIM, -1.1, FLOOR + 2.0, 1.72);
  box(0.4, 0.06, 0.04, RED, -1.1, FLOOR + 2.06, 1.725);
  box(0.4, 0.04, 0.04, DARK, -1.1, FLOOR + 1.94, 1.725);

  // snow skirt
  sph(1.0, SNOW, -2.3, 0.65, 1.5, [1.3, 0.35, 1.1]);
  sph(1.1, SNOW, 2.8, 0.65, -0.6, [1.2, 0.3, 1.5]);
  sph(1.0, SNOW, -2.4, 0.65, -1.0, [1.1, 0.35, 1.6]);

  // firewood stack under back edge
  box(1.6, 0.08, 0.9, ROOF, -0.2, 2.0, -2.45, [-12, 0, 0]);
  for (const x of [-1.0, 0.6]) cyl(0.04, 1.4, WOOD_DK, x, 0.6, -2.7, 5);
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 4 - row; i++) {
      const x = -0.9 + i * 0.4 + row * 0.2 + 0.1;
      cyl(0.1, 1.0, i % 2 ? WOOD : "#c08a4e", x, 0.6 + row * 0.19 - 0.0, -2.35, 6, [90, 0, 0]);
    }

  // ---------- radio mast ----------
  const MX = 3.0;
  const MZ = -1.4;
  box(0.6, 0.25, 0.6, METAL_DK, MX, 0.72, MZ);
  cyl(0.07, 6.2, METAL, MX, 0.6, MZ, 6);
  for (let i = 0; i < 6; i++) cyl(0.085, 0.07, RED, MX, 1.2 + i * 1.0, MZ, 6);
  for (const [y, w] of [[3.4, 1.2], [4.6, 0.9], [5.5, 0.6]] as [number, number][]) {
    box(w, 0.04, 0.04, METAL, MX, y, MZ);
    box(0.04, 0.04, w * 0.8, METAL, MX, y + 0.08, MZ);
  }
  cyl(0.02, 1.1, METAL, MX + 0.2, 6.6, MZ, 4);
  glow(sph(0.1, "#ff4a3a", MX, 6.85, MZ, [1, 1, 1], 6), 2);
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 + 30) * (Math.PI / 180);
    rod([MX, 5.0, MZ], [MX + Math.cos(a) * 2.4, 0.65, MZ + Math.sin(a) * 2.4], 0.012, METAL_DK);
    box(0.14, 0.14, 0.14, ORANGE, MX + Math.cos(a) * 2.4, 0.68, MZ + Math.sin(a) * 2.4);
  }
  // equipment box at mast base
  box(0.7, 0.5, 0.5, TEAL, MX + 0.9, 0.85, MZ + 0.2);
  box(0.74, 0.06, 0.54, SNOW, MX + 0.9, 1.13, MZ + 0.2);
  glow(box(0.1, 0.1, 0.03, "#7affc0", MX + 0.75, 0.9, MZ + 0.46), 1.5);
  rod([MX + 0.5, 1.0, MZ], [MX + 0.1, 0.9, MZ], 0.02, DARK);

  // ---------- satellite dish ----------
  const DXp = 3.9;
  const DZp = 2.2;
  cyl(0.12, 0.8, METAL_DK, DXp, 0.6, DZp, 6);
  box(0.8, 0.1, 0.8, METAL_DK, DXp, 0.65, DZp);
  const dd = new THREE.Vector3(0, 0.85, 0.5).normalize();
  const dc: V = [DXp, 1.7, DZp];
  b.lathe(
    [[0, 0], [0.25, 0.02], [0.5, 0.08], [0.75, 0.18], [1.0, 0.32], [1.0, 0.36], [0.75, 0.22], [0.5, 0.12], [0.25, 0.06], [0, 0.04]],
    { at: dc, axis: [dd.x, dd.y, dd.z], color: "#ece4ee", segments: 12 },
  );
  const feed: V = [dc[0] + dd.x * 0.75, dc[1] + dd.y * 0.75, dc[2] + dd.z * 0.75];
  rod(dc, feed, 0.02, METAL_DK);
  sph(0.07, ORANGE, feed[0], feed[1], feed[2], [1, 1, 1], 6);

  // ---------- weather station ----------
  const WX = -3.6;
  const WZ = 2.1;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) cyl(0.04, 0.9, WOOD_DK, WX + sx * 0.26, 0.6, WZ + sz * 0.2, 5);
  box(0.7, 0.5, 0.5, TRIM, WX, 1.75, WZ);
  for (let i = 0; i < 4; i++) box(0.62, 0.03, 0.04, "#cdbf9a", WX, 1.6 + i * 0.1, WZ + 0.26);
  box(0.82, 0.1, 0.62, SNOW, WX, 2.05, WZ);
  box(0.8, 0.04, 0.6, METAL_DK, WX, 1.48, WZ);
  // anemometer
  const AX = -4.7;
  const AZ = 0.4;
  cyl(0.04, 3.2, METAL, AX, 0.6, AZ, 6);
  box(0.3, 0.2, 0.2, TEAL, AX, 1.7, AZ);
  for (let i = 0; i < 3; i++) {
    const a = i * 120;
    const ar = (a * Math.PI) / 180;
    box(0.5, 0.03, 0.03, METAL, AX, 3.85, AZ, [0, a, 0]);
    sph(0.07, RED, AX + Math.cos(ar) * 0.25, 3.85, AZ - Math.sin(ar) * 0.25, [1, 1.2, 1], 5);
  }
  cyl(0.03, 0.1, METAL, AX, 3.8, AZ, 5);
  box(0.6, 0.03, 0.03, METAL, AX, 3.5, AZ);
  box(0.02, 0.18, 0.2, ORANGE, AX - 0.3, 3.5, AZ);

  // ---------- fuel drums ----------
  const drum = (x: number, z: number, c: string) => {
    cyl(0.28, 0.85, c, x, 0.6, z, 10);
    for (const y of [0.78, 1.15]) cyl(0.295, 0.04, DARK, x, y, z, 10);
    cyl(0.2, 0.03, METAL_DK, x, 1.45, z, 8);
    cyl(0.04, 0.05, DARK, x + 0.1, 1.47, z, 5);
  };
  drum(-3.1, -1.6, ORANGE);
  drum(-3.7, -1.3, TEAL);
  drum(-3.3, -2.2, ORANGE);
  box(0.55, 0.06, 0.5, SNOW, -3.1, 1.48, -1.6);
  // fuel-line drum on its side
  cyl(0.26, 0.8, RED, -2.3, 0.86, -2.4, 10, [0, 0, 90]);
  box(0.9, 0.12, 0.7, WOOD_DK, -2.3, 0.66, -2.4);

  // ---------- flag ----------
  const FX = -3.9;
  const FZ = -0.4;
  cyl(0.04, 4.2, METAL, FX, 0.6, FZ, 6);
  sph(0.07, GLOW, FX, 4.85, FZ, [1, 1, 1], 5);
  box(0.03, 0.62, 1.0, RED, FX, 4.4, FZ + 0.52);
  box(0.035, 0.1, 1.0, TRIM, FX, 4.4, FZ + 0.52);
  box(0.035, 0.62, 0.1, TRIM, FX, 4.4, FZ + 0.35);

  // ---------- sled with cargo ----------
  const SX = -1.9;
  const SZ = 3.7;
  for (const s of [-1, 1]) {
    box(0.09, 0.09, 2.1, WOOD_DK, SX + s * 0.5, 0.67, SZ);
    box(0.09, 0.09, 0.3, WOOD_DK, SX + s * 0.5, 0.74, SZ + 1.1, [-30, 0, 0]);
    box(0.06, 0.2, 0.06, WOOD_DK, SX + s * 0.5, 0.78, SZ + 0.6);
    box(0.06, 0.2, 0.06, WOOD_DK, SX + s * 0.5, 0.78, SZ - 0.6);
  }
  box(1.2, 0.07, 1.8, WOOD, SX, 0.9, SZ);
  box(0.55, 0.42, 0.55, "#c98a3c", SX - 0.2, 1.15, SZ - 0.35);
  box(0.58, 0.06, 0.58, TRIM, SX - 0.2, 1.35, SZ - 0.35);
  box(0.5, 0.35, 0.5, TEAL, SX + 0.25, 1.1, SZ - 0.1);
  box(0.52, 0.05, 0.12, TRIM, SX + 0.25, 1.15, SZ - 0.1);
  cyl(0.18, 0.9, RED, SX, 1.1, SZ + 0.45, 8, [0, 0, 90]);
  rod([SX - 0.5, 1.0, SZ + 0.9], [SX + 0.5, 1.0, SZ + 0.9], 0.015, TRIM);
  rod([SX - 0.5, 0.75, SZ + 1.1], [SX - 0.5, 0.98, SZ + 0.1], 0.015, TRIM);
  // tow rope
  rod([SX, 0.8, SZ + 1.1], [SX + 1.0, 0.7, SZ + 1.8], 0.02, WOOD_DK);

  // ---------- snowmobile ----------
  const NX = 2.3;
  const NZ = 4.7;
  for (const s of [-1, 1]) {
    box(0.12, 0.05, 1.2, DARK, NX + s * 0.42, 0.66, NZ + 0.45);
    box(0.1, 0.05, 0.3, DARK, NX + s * 0.42, 0.76, NZ + 1.15, [-35, 0, 0]);
    box(0.06, 0.3, 0.06, METAL_DK, NX + s * 0.42, 0.82, NZ + 0.6);
  }
  box(0.5, 0.25, 1.4, DARK, NX, 0.78, NZ - 0.5);
  for (let i = 0; i < 6; i++) box(0.52, 0.04, 0.06, METAL_DK, NX, 0.9, NZ - 1.1 + i * 0.22);
  box(0.8, 0.45, 1.2, RED, NX, 1.15, NZ + 0.05);
  box(0.7, 0.35, 0.7, RED, NX, 1.05, NZ + 0.75, [-15, 0, 0]);
  box(0.74, 0.04, 0.5, TRIM, NX, 1.4, NZ + 0.2);
  box(0.6, 0.12, 0.9, DARK, NX, 1.43, NZ - 0.55);
  glow(box(0.5, 0.12, 0.05, GLOW, NX, 1.15, NZ + 1.1), 1.5);
  box(0.5, 0.35, 0.04, ICE, NX, 1.6, NZ + 0.45, [-30, 0, 0]);
  box(0.7, 0.04, 0.04, METAL_DK, NX, 1.5, NZ + 0.3);
  box(0.9, 0.05, 0.05, DARK, NX, 1.55, NZ + 0.25);

  // ---------- pines ----------
  const pine = (x: number, z: number, s: number) => {
    cyl(0.1 * s, 0.6 * s, WOOD_DK, x, 0.6, z, 5);
    const tiers: [number, number, number][] = [[0.95, 1.1, 0.9], [0.75, 1.0, 1.7], [0.52, 0.9, 2.4]];
    tiers.forEach(([r, h, y], i) => {
      cone(r * s, h * s, i % 2 ? PINE2 : PINE, x, 0.6 + y * s, z, 7);
      cone(r * s * 0.62, h * s * 0.5, SNOW, x, 0.6 + (y + h * 0.5) * s + 0.02, z, 7);
    });
    cone(0.12 * s, 0.4 * s, PINE2, x, 0.6 + 3.1 * s, z, 6);
    sph(0.35 * s, SNOW, x + 0.3 * s, 0.62, z + 0.2 * s, [1.4, 0.3, 1], 6);
  };
  pine(-5.2, -0.9, 1.1);
  pine(-5.7, 1.6, 0.85);
  pine(5.4, -1.0, 1.2);
  pine(5.9, 1.3, 0.8);
  pine(-4.1, -3.2, 1.0);
  pine(3.3, -3.6, 0.9);
  pine(5.2, 3.2, 0.7);
  pine(-4.4, 4.0, 0.7);

  // ---------- rocks ----------
  rock(0.5, "#5a4f78", 4.6, 0.8, -2.4, [1, 0.8, 1], 20);
  rock(0.3, "#74678f", 4.1, 0.7, -2.1, [1, 0.8, 1], 50);
  sph(0.45, SNOW, 4.6, 1.1, -2.4, [1, 0.3, 1], 6);
  rock(0.4, "#5a4f78", -2.6, 0.75, 4.9, [1.2, 0.7, 1], 10);
  rock(0.6, "#6a5e86", -5.6, 0.85, 3.4, [1, 0.8, 1.1], 70);
  sph(0.5, SNOW, -5.6, 1.2, 3.4, [1, 0.28, 1], 6);

  // ---------- paths: trodden snow patches ----------
  for (let i = 0; i < 5; i++) {
    box(0.55, 0.02, 0.4, SNOW_SH, DX + 0.1 - i * 0.05, 0.605, 4.0 + i * 0.5, [0, i * 8 - 10, 0]);
  }

  return b.root;
}
