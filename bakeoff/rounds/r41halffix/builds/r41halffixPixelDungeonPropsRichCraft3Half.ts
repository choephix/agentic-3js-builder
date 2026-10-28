import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { pixelArt, pixelTexture, tileBox, cellPaint, pick, bayer } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "dungeon_props",
  description: "Pixel-art dungeon prop group: iron-banded chest, standing torches, barrels, bone pile and a spike trap.",
};

const TEXEL = 0.02;

export default function build() {
  const b = createBuilder({ name: "dungeon_props" });
  const r = rng(11);

  // ---- palettes & textures
  const WOODS = ["#2e1b0e", "#4a2c15", "#6b4220", "#8a5a2c"];
  const BONES = ["#9c9378", "#c9c0a4", "#e8e0c8", "#f7f1dc"];
  const IRONS = ["#1c1d26", "#2f313f", "#4a4d60", "#6c7088"];
  const STONES = ["#2a2a33", "#3b3b47", "#51515f", "#6a6a78"];
  const STEEL = ["#4d5263", "#8d95ab", "#c8cfe0", "#f0f4ff"];

  const PLANKS = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const row = y % 8;
      if (row === 0) return WOODS[0];
      if (row === 1) return WOODS[3];
      const v = 0.35 + 0.35 * r() + (((x + Math.floor(y / 8) * 7) % 13 === 0) ? -0.2 : 0);
      return pick(WOODS, v, bayer(x, y));
    });
    g.stamp(3, 3, ["n"], { n: "#1a0e06" });
    g.stamp(22, 12, ["n"], { n: "#1a0e06" });
  });

  const wood = cellPaint(TEXEL, (c) => {
    if (c.axis !== 1 && c.u % 4 === 0) return WOODS[0];
    return c.pick(WOODS, 0.3 + 0.5 * c.random(2) + 0.1 * c.n.y);
  }, { dither: true });
  const iron = cellPaint(TEXEL, (c) => c.pick(IRONS, 0.25 + 0.5 * c.random(3) + 0.2 * c.n.y), { dither: true });
  const bone = cellPaint(TEXEL / 2, (c) => c.pick(BONES, 0.45 + 0.5 * c.random(4) * 0.8 + 0.2 * c.n.y), { dither: true });
  const stone = cellPaint(TEXEL, (c) => {
    if ((c.u + (c.v % 2) * 2) % 5 === 0 || c.v % 4 === 0) return STONES[0];
    return c.pick(STONES, 0.3 + 0.6 * c.random(5));
  });
  const steel = cellPaint(TEXEL / 2, (c) => c.pick(STEEL, 0.4 + 0.5 * c.random(6) + 0.2 * c.n.x));

  const FLAME = pixelArt(
    [
      "....y...",
      "...yy...",
      "...yyo..",
      "..oyyo..",
      "..oyyyo.",
      ".ooyyyo.",
      ".ooyyyoo",
      ".orryyoo",
      ".orrrroo",
      "..orrro.",
      "..oorro.",
      "...oo...",
    ],
    { y: "#fff3a0", o: "#ffa21f", r: "#e8441a" },
  );
  const KEYHOLE = pixelArt(
    ["..kkkk..", ".kkkkkk.", ".kkkkkk.", "..kkkk..", "...kk...", "...kk...", "..kkkk..", "..kkkk.."],
    { k: "#14100a" },
  );

  // ---- helpers
  const box = (size: [number, number, number], color: any, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: rot });
  const woodBox = (size: [number, number, number], at: [number, number, number]) =>
    b.part(tileBox(size, PLANKS, TEXEL, { rand: r, step: [1, 8] }), "#ffffff", { at, texture: PLANKS });
  const cyl = (rt: number, rb: number, h: number, sides: number, color: any, at: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color, { at });

  // ---- chest (centre back)
  const CX = 0, CZ = -0.35;
  woodBox([0.9, 0.44, 0.56], [CX, 0.22, CZ]);
  woodBox([0.92, 0.12, 0.58], [CX, 0.5, CZ]);
  woodBox([0.8, 0.1, 0.48], [CX, 0.61, CZ]);
  woodBox([0.64, 0.06, 0.38], [CX, 0.69, CZ]);
  for (const x of [-0.3, 0.3]) {
    box([0.09, 0.45, 0.6], iron, [CX + x, 0.225, CZ]);
    box([0.09, 0.13, 0.6], iron, [CX + x, 0.5, CZ]);
    box([0.09, 0.11, 0.5], iron, [CX + x, 0.61, CZ]);
    box([0.09, 0.07, 0.4], iron, [CX + x, 0.69, CZ]);
  }
  box([0.96, 0.07, 0.62], iron, [CX, 0.435, CZ]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box([0.1, 0.5, 0.1], iron, [CX + sx * 0.43, 0.25, CZ + sz * 0.27]);
      glow(box([0.04, 0.04, 0.04], "#ffd24a", [CX + sx * 0.43, 0.54, CZ + sz * 0.31 + (sz > 0 ? 0.02 : -0.02)]), 0.4);
    }
  const LZ = CZ + 0.3;
  box([0.2, 0.22, 0.04], "#d9a52a", [CX, 0.46, LZ + 0.01]);
  box([0.16, 0.18, 0.02], "#f2cf55", [CX, 0.46, LZ + 0.035]);
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [CX, 0.45, LZ + 0.05], texture: KEYHOLE });

  // ---- barrels (left)
  const barrel = (x: number, z: number, s: number) => {
    cyl(0.29 * s, 0.26 * s, 0.26 * s, 10, wood, [x, 0.13 * s, z]);
    cyl(0.33 * s, 0.33 * s, 0.3 * s, 10, wood, [x, 0.41 * s, z]);
    cyl(0.26 * s, 0.33 * s, 0.26 * s, 10, wood, [x, 0.69 * s, z]);
    for (const y of [0.1, 0.36, 0.5, 0.74]) {
      const rad = y === 0.36 || y === 0.5 ? 0.345 : y === 0.1 ? 0.285 : 0.28;
      cyl(rad * s, rad * s, 0.045 * s, 10, iron, [x, y * s + 0.0, z]);
    }
    cyl(0.25 * s, 0.25 * s, 0.03 * s, 10, "#3a2411", [x, 0.82 * s, z]);
    box([0.34 * s, 0.025 * s, 0.05 * s], "#2a180b", [x, 0.84 * s, z]);
  };
  barrel(-1.05, -0.35, 1);
  barrel(-0.75, 0.3, 0.85);
  // toppled little keg
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.4, 8), wood, { at: [-1.35, 0.17, 0.35], rotation: [0, 20, 90] });
  b.part(new THREE.CylinderGeometry(0.175, 0.175, 0.04, 8), iron, { at: [-1.35, 0.17, 0.35], rotation: [0, 20, 90] });

  // ---- torches
  const torch = (x: number, z: number) => {
    box([0.5, 0.12, 0.5], stone, [x, 0.06, z]);
    box([0.36, 0.1, 0.36], stone, [x, 0.17, z]);
    woodBox([0.1, 1.1, 0.1], [x, 0.77, z]);
    box([0.18, 0.05, 0.18], iron, [x, 0.9, z]);
    box([0.2, 0.2, 0.04], iron, [x, 1.38, z + 0.07]);
    box([0.04, 0.2, 0.2], iron, [x + 0.07, 1.38, z]);
    cyl(0.12, 0.07, 0.2, 6, iron, [x, 1.4, z]);
    cyl(0.1, 0.1, 0.03, 6, "#3a1a0a", [x, 1.5, z]);
    glow(box([0.14, 0.05, 0.14], "#e8441a", [x, 1.52, z]), 1.2);
    for (const ry of [0, 90, 180, 270])
      glow(
        b.part(new THREE.PlaneGeometry(0.28, 0.42), "#ffffff", {
          at: [x, 1.74, z],
          rotation: [0, ry, 0],
          texture: FLAME,
        }),
        1.5,
      );
  };
  torch(-1.55, -0.95);
  torch(1.55, -0.95);

  // ---- bones (right)
  const longBone = (x: number, z: number, len: number, yaw: number, y = 0.03) => {
    const rot: [number, number, number] = [0, yaw, 0];
    const dx = Math.sin((yaw * Math.PI) / 180) * len * 0.5;
    const dz = Math.cos((yaw * Math.PI) / 180) * len * 0.5;
    b.part(new THREE.BoxGeometry(0.04, 0.04, len), bone, { at: [x, y, z], rotation: rot });
    for (const k of [-1, 1])
      for (const o of [-1, 1]) {
        const px = x + k * dx;
        const pz = z + k * dz;
        const nx = Math.cos((yaw * Math.PI) / 180) * 0.03 * o;
        const nz = -Math.sin((yaw * Math.PI) / 180) * 0.03 * o;
        b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), bone, { at: [px + nx, y, pz + nz], rotation: rot });
      }
  };
  const BX = 1.0, BZ = 0.35;
  box([0.7, 0.04, 0.6], "#2b2418", [BX, 0.02, BZ]);
  longBone(BX - 0.1, BZ + 0.2, 0.4, 25);
  longBone(BX + 0.12, BZ + 0.22, 0.36, -70, 0.075);
  longBone(BX + 0.2, BZ - 0.15, 0.4, 100);
  longBone(BX - 0.25, BZ - 0.1, 0.3, 160, 0.075);
  // ribcage
  for (let i = 0; i < 4; i++) {
    const z = BZ - 0.05 + i * 0.07;
    b.part(new THREE.BoxGeometry(0.2, 0.025, 0.03), bone, { at: [BX + 0.05, 0.12 - i * 0.012, z], rotation: [0, 0, 20] });
    b.part(new THREE.BoxGeometry(0.2, 0.025, 0.03), bone, { at: [BX + 0.05, 0.12 - i * 0.012, z], rotation: [0, 0, -20] });
  }
  box([0.03, 0.04, 0.3], bone, [BX + 0.05, 0.06, BZ + 0.08]);
  // skull
  const SX = BX - 0.05, SY = 0.17, SZ = BZ + 0.05;
  box([0.2, 0.17, 0.2], bone, [SX, SY, SZ], [0, -15, 0]);
  box([0.16, 0.06, 0.06], bone, [SX, SY - 0.1, SZ], [0, -15, 0]);
  const dir = [Math.sin((-15 * Math.PI) / 180), Math.cos((-15 * Math.PI) / 180)];
  const side = [dir[1], -dir[0]];
  for (const s of [-1, 1]) {
    box([0.05, 0.05, 0.03], "#120d08", [SX + dir[0] * 0.1 + side[0] * s * 0.05, SY + 0.01, SZ + dir[1] * 0.1 + side[1] * s * 0.05], [0, -15, 0]);
    glow(box([0.015, 0.015, 0.01], "#ff4a2a", [SX + dir[0] * 0.112 + side[0] * s * 0.05, SY + 0.01, SZ + dir[1] * 0.112 + side[1] * s * 0.05], [0, -15, 0]), 1);
  }
  box([0.025, 0.04, 0.03], "#120d08", [SX + dir[0] * 0.1, SY - 0.05, SZ + dir[1] * 0.1], [0, -15, 0]);
  for (let i = -2; i <= 2; i++)
    box([0.02, 0.025, 0.02], "#f7f1dc", [SX + dir[0] * 0.105 + side[0] * i * 0.03, SY - 0.115, SZ + dir[1] * 0.105 + side[1] * i * 0.03], [0, -15, 0]);

  // ---- spike trap (front)
  const TX = 0.1, TZ = 1.0;
  box([0.9, 0.08, 0.9], stone, [TX, 0.04, TZ]);
  box([0.8, 0.03, 0.8], "#34343f", [TX, 0.095, TZ]);
  const heights = [
    [0.3, 0.06, 0.34, 0.06],
    [0.06, 0.38, 0.06, 0.28],
    [0.34, 0.06, 0.4, 0.06],
    [0.06, 0.3, 0.06, 0.36],
  ];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const x = TX - 0.27 + i * 0.18;
      const z = TZ - 0.27 + j * 0.18;
      box([0.09, 0.012, 0.09], "#0c0c10", [x, 0.113, z]);
      const h = heights[i][j];
      b.part(new THREE.ConeGeometry(0.04, h, 4), steel, { at: [x, 0.11 + h / 2, z], rotation: [0, 45, 0] });
      if (h > 0.2) b.part(new THREE.ConeGeometry(0.018, h * 0.28, 4), "#a4161a", { at: [x, 0.11 + h * 0.86, z], rotation: [0, 45, 0] });
    }
  box([0.14, 0.02, 0.1], "#7a1014", [TX + 0.1, 0.112, TZ + 0.42]);

  return b.root;
}
