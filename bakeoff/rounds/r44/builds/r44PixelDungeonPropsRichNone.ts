import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { pixelTexture, tileBox, cellPaint, pick, bayer } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "dungeon_props",
  description: "Pixel-art dungeon props: iron-banded chest, two floor torches, barrels, a bone pile and a spike trap.",
};

const TEXEL = 0.02;
const WOODS = ["#2a160c", "#47260f", "#5e3716", "#7a4a20", "#966030"];
const STONE = ["#23222b", "#3a3945", "#515062", "#6a6979"];
const IRON = "#3b3f4d";
const IRON_L = "#7d8498";
const GOLD = "#e8b83a";
const BONE = "#e9e2c8";
const BONE_D = "#b9ad8c";

export default function build() {
  const b = createBuilder({ name: "dungeon_props" });
  const r = rng(11);

  const PLANKS = pixelTexture(32, 30, (g) => {
    g.fill((x, y) => {
      if (y % 6 === 0) return "#1e0f08";
      if (y % 6 === 1) return "#8a5626";
      if (x === ((Math.floor(y / 6) * 11 + 5) % 32)) return "#2a160c";
      return pick(WOODS, 0.35 + 0.4 * r(), bayer(x, y));
    });
    for (let i = 0; i < 10; i++) g.set(Math.floor(r() * 32), Math.floor(r() * 30), "#24120a");
  });
  const STONES = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if (y % 8 === 0 || x === ((Math.floor(y / 8) % 2) * 8 + 16 * Math.floor(x / 16)) % 32 + 0 && false) return "#14131a";
      const off = (Math.floor(y / 8) % 2) * 8;
      if ((x + off) % 16 === 0) return "#14131a";
      return pick(STONE, 0.3 + 0.5 * r(), bayer(x, y));
    });
  });
  const BAND = pixelTexture(8, 8, (g) => {
    g.fill((x, y) => (x === 0 || y === 0 ? IRON_L : x === 7 || y === 7 ? "#22242e" : pick([IRON, "#4a4f62"], r(), bayer(x, y))));
    g.set(3, 3, "#9aa2b8");
  });

  const wood = (size: [number, number, number], at: [number, number, number], rot?: [number, number, number]) =>
    b.part(tileBox(size, PLANKS, TEXEL, { rand: r, step: [1, 6] }), "#ffffff", { texture: PLANKS, at, rotation: rot });
  const iron = (size: [number, number, number], at: [number, number, number]) =>
    b.part(tileBox(size, BAND, TEXEL * 0.5), "#ffffff", { texture: BAND, at });
  const solid = (size: [number, number, number], c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), c, { at, rotation: rot });

  // ---------- Chest ----------
  const CX = 0, CZ = -0.45;
  wood([0.84, 0.4, 0.52], [CX, 0.2, CZ]);
  wood([0.84, 0.1, 0.52], [CX, 0.45, CZ]);
  wood([0.84, 0.08, 0.4], [CX, 0.54, CZ]);
  wood([0.84, 0.06, 0.26], [CX, 0.61, CZ]);
  for (const s of [-1, 1]) {
    iron([0.07, 0.42, 0.56], [CX + s * 0.3, 0.2, CZ]);
    iron([0.07, 0.12, 0.56], [CX + s * 0.3, 0.45, CZ]);
    iron([0.07, 0.1, 0.44], [CX + s * 0.3, 0.54, CZ]);
    iron([0.07, 0.07, 0.3], [CX + s * 0.3, 0.615, CZ]);
    for (const sz of [-1, 1]) for (const y of [0.04, 0.38]) iron([0.1, 0.08, 0.08], [CX + s * 0.4, y, CZ + sz * 0.26]);
  }
  iron([0.86, 0.04, 0.54], [CX, 0.4, CZ]);
  solid([0.14, 0.16, 0.04], GOLD, [CX, 0.4, CZ + 0.28]);
  solid([0.04, 0.06, 0.05], "#2a1a05", [CX, 0.4, CZ + 0.3]);
  solid([0.1, 0.02, 0.05], "#fff0a0", [CX, 0.47, CZ + 0.3]);
  // gold glint peeking
  solid([0.12, 0.02, 0.02], GOLD, [CX + 0.15, 0.64, CZ + 0.08]);

  // ---------- Barrels ----------
  const BARREL = cellPaint(TEXEL, (c) => {
    const stave = Math.floor((Math.atan2(c.at.z, c.at.x) + Math.PI) / (Math.PI / 4));
    return c.pick(WOODS, 0.3 + 0.12 * (stave % 3) + 0.3 * c.random(2));
  }, { dither: true });
  const barrel = (x: number, z: number, h: number, s: number) => {
    const prof: [number, number][] = [[0, 0], [0.26 * s, 0], [0.3 * s, 0.2 * h], [0.33 * s, 0.4 * h], [0.3 * s, 0.6 * h], [0.26 * s, 0.8 * h * 1], [0.25 * s, 0.8 * h], [0, 0.8 * h]];
    b.lathe(prof, { at: [x, 0, z], segments: 8, color: BARREL });
    for (const [y, rad] of [[0.1, 0.285], [0.4, 0.34], [0.7, 0.285]] as const) {
      const rr = rad * s;
      b.part(new THREE.CylinderGeometry(rr, rr, 0.05 * h, 8), IRON, { at: [x, y * h, z] });
    }
    b.part(new THREE.CylinderGeometry(0.22 * s, 0.22 * s, 0.02, 8), "#2a160c", { at: [x, 0.8 * h + 0.001, z] });
    b.part(new THREE.CylinderGeometry(0.12 * s, 0.12 * s, 0.02, 8), "#5e3716", { at: [x, 0.8 * h + 0.012, z] });
  };
  barrel(-1.0, -0.35, 1, 1);
  barrel(-1.0, 0.35, 0.85, 0.9);
  barrel(-1.45, 0.0, 0.95, 0.95);
  // tipped small cask lid on top
  solid([0.3, 0.04, 0.3], "#5e3716", [-1.0, 0.82, -0.35]);

  // ---------- Torches ----------
  const torch = (x: number, z: number) => {
    solid([0.34, 0.06, 0.06], "#2a160c", [x, 0.03, z]);
    solid([0.06, 0.06, 0.34], "#2a160c", [x, 0.03, z]);
    wood([0.1, 1.2, 0.1], [x, 0.66, z]);
    b.lathe([[0, 0], [0.07, 0], [0.12, 0.14], [0.12, 0.17], [0.1, 0.17], [0.1, 0.1], [0, 0.04]], {
      at: [x, 1.2, z], segments: 6, color: IRON,
    });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 6), "#ff7a1a", { at: [x, 1.36, z] });
    glow(solid([0.14, 0.16, 0.14], "#ff6a14", [x, 1.45, z]), 1.5);
    glow(solid([0.1, 0.18, 0.1], "#ffb02e", [x, 1.52, z]), 1.8);
    glow(solid([0.06, 0.14, 0.06], "#fff0a0", [x, 1.6, z]), 2);
    glow(solid([0.04, 0.04, 0.04], "#ff8a20", [x + 0.07, 1.74, z - 0.02]), 1.6);
    glow(solid([0.03, 0.03, 0.03], "#ffd060", [x - 0.06, 1.8, z + 0.03]), 1.6);
  };
  torch(-0.8, -0.95);
  torch(0.8, -0.95);

  // ---------- Bones ----------
  const femur = (x: number, z: number, yaw: number, len = 0.38) => {
    const y = 0.035;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, len, 5), BONE, { at: [x, y, z], rotation: [0, yaw, 90] });
    for (const e of [-1, 1]) for (const k of [-1, 1]) {
      const a = (yaw * Math.PI) / 180;
      const ex = x + Math.cos(a) * e * (len / 2) * 1 , ez = z - Math.sin(a) * e * (len / 2);
      const off = k * 0.025;
      solid([0.06, 0.05, 0.06], BONE_D, [ex + Math.sin(a) * off, y, ez + Math.cos(a) * off], [0, yaw, 0]);
    }
  };
  const BX = 1.15, BZ = 0.5;
  femur(BX, BZ, 20);
  femur(BX + 0.12, BZ + 0.1, -50, 0.32);
  femur(BX - 0.2, BZ - 0.2, 80, 0.3);
  // skull
  const SX = BX + 0.12, SZ = BZ - 0.3;
  solid([0.2, 0.17, 0.2], BONE, [SX, 0.115, SZ], [0, 25, 0]);
  solid([0.16, 0.06, 0.16], BONE_D, [SX, 0.02, SZ + 0.02], [0, 25, 0]);
  b.part(new THREE.BoxGeometry(0.17, 0.05, 0.12), BONE, { at: [SX + 0.04, 0.045, SZ + 0.1], rotation: [0, 25, 0] });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.03), "#120c0c", {
      at: [SX + 0.04 * s * Math.cos(0.44) + 0.045, 0.13, SZ + 0.11 - 0.04 * s * Math.sin(0.44) + 0.03],
      rotation: [0, 25, 0],
    });
  }
  // ribs
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.TorusGeometry(0.1, 0.014, 4, 6, Math.PI), BONE, {
      at: [BX - 0.25 + i * 0.07, 0.015, BZ + 0.45], rotation: [90, 0, 0],
    });
  }
  solid([0.03, 0.03, 0.3], BONE_D, [BX - 0.07, 0.02, BZ + 0.45]);

  // ---------- Spike trap ----------
  const TX = 0.1, TZ = 1.0;
  b.part(tileBox([0.9, 0.08, 0.9], STONES, TEXEL, { rand: r }), "#ffffff", { texture: STONES, at: [TX, 0.04, TZ] });
  solid([0.96, 0.04, 0.96], "#14131a", [TX, 0.02, TZ]);
  solid([0.78, 0.01, 0.78], "#1a1822", [TX, 0.085, TZ]);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    const x = TX + i * 0.24, z = TZ + j * 0.24;
    solid([0.1, 0.012, 0.1], "#07060a", [x, 0.09, z]);
    b.part(new THREE.ConeGeometry(0.04, 0.3, 4), IRON_L, { at: [x, 0.23, z] });
    b.part(new THREE.ConeGeometry(0.018, 0.08, 4), "#b3261e", { at: [x, 0.34, z] });
  }
  // a fallen femur on the trap
  femur(TX - 0.15, TZ + 0.42, 100, 0.28);

  return b.root;
}
