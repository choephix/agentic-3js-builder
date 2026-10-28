```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { pixelTexture, pixelArt, tileBox, cellPaint, pick, bayer } from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dungeon Props",
  description: "Pixel-art dungeon set: iron-bound chest, standing torches, barrels, bones and a spike trap.",
};

const TEXEL = 0.02;
const WOOD = ["#2a170c", "#3f2412", "#5a3519", "#7a4a24", "#946034"];
const IRON = ["#16161c", "#2a2c36", "#464a5a", "#6e7388"];
const STONE = ["#1c1b22", "#2d2c36", "#43424f", "#5d5c6b", "#777684"];
const BONE = ["#7d7258", "#b0a483", "#d8cfae", "#f1ead2"];
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "dungeon_props" });
  const r = rng(11);

  // ---- textures ----
  const plankTex = pixelTexture(32, 24, (g) => {
    g.fill((x, y) => {
      const row = y % 6;
      if (row === 0) return WOOD[0];
      const streak = (x + Math.floor(y / 6) * 9) % 11 === 0 ? -0.2 : 0;
      const v = 0.45 + 0.25 * r() + streak + (row === 1 ? 0.15 : row === 5 ? -0.1 : 0);
      return pick(WOOD, v, bayer(x, y));
    });
    g.fill(() => WOOD[0], [0, 0, 0, 0]);
    for (let p = 0; p < 4; p++) {
      g.set(1, p * 6 + 2, IRON[3]);
      g.set(30, p * 6 + 2, IRON[3]);
    }
  });
  const ironTex = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => (x % 8 === 3 && y % 8 === 3 ? IRON[3] : pick(IRON, 0.25 + 0.3 * r() + (y < 2 ? 0.3 : 0), bayer(x, y))));
  });
  const stoneTex = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const brickRow = Math.floor(y / 8);
      const off = brickRow % 2 ? 8 : 0;
      if (y % 8 === 0 || (x + off) % 16 === 0) return STONE[0];
      return pick(STONE, 0.35 + 0.35 * r() + (y % 8 === 1 ? 0.15 : 0), bayer(x, y));
    });
  });
  const boneTex = pixelTexture(8, 8, (g) => g.fill((x, y) => pick(BONE, 0.45 + 0.4 * r() - y * 0.03, bayer(x, y))));
  const skullTex = pixelArt(
    ["..wwwww.", ".wwwwwww", "wwwwwwww", "wkkwwkkw", "wkkwwkkw", "wwwwwwww", ".wwkkww.", ".wwwwww.", "..wkwkw."].map((s) => s),
    { w: "#e4dcbc", k: "#0e0c12" },
  );
  const lockTex = pixelArt(
    ["yyyyyy", "yoooy.".replace(".", "y"), "yookoy", "yyokyy", "yyokyy", "yyyyyy"],
    { y: "#f2c230", o: "#b8841a", k: "#1a1008" },
  );
  const holeTex = pixelTexture(8, 8, (g) => g.fill((x, y) => (x === 0 || y === 0 ? "#05050a" : "#0b0b12")));

  const box = (size: [number, number, number], tile: THREE.Texture, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(tileBox(size, tile as any, TEXEL, { rand: rng(size[0] * 100 + at[1] * 10 + 3), step: [1, 6] }), WHITE, { at, texture: tile, rotation: rot });
  const plain = (size: [number, number, number], color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: rot });

  // ---- chest ----
  const cx = 0, cz = -0.2;
  box([0.9, 0.42, 0.55], plankTex, [cx, 0.21, cz]);
  box([0.9, 0.12, 0.55], plankTex, [cx, 0.48, cz]);
  box([0.9, 0.1, 0.45], plankTex, [cx, 0.59, cz]);
  box([0.9, 0.07, 0.33], plankTex, [cx, 0.675, cz]);
  for (const x of [-0.32, 0.32]) {
    box([0.09, 0.44, 0.58], ironTex, [x, 0.22, cz]);
    box([0.09, 0.14, 0.58], ironTex, [x, 0.48, cz]);
    box([0.09, 0.12, 0.48], ironTex, [x, 0.59, cz]);
    box([0.09, 0.08, 0.36], ironTex, [x, 0.675, cz]);
  }
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box([0.08, 0.1, 0.08], ironTex, [sx * 0.43, 0.05, cz + sz * 0.255]);
      box([0.07, 0.07, 0.07], ironTex, [sx * 0.43, 0.38, cz + sz * 0.255]);
    }
  box([0.9, 0.04, 0.58], ironTex, [cx, 0.42, cz]);
  glow(b.part(new THREE.BoxGeometry(0.16, 0.18, 0.04), WHITE, { at: [cx, 0.44, cz + 0.29], texture: lockTex }), 0.6);

  // ---- barrels ----
  const barrelPaint = cellPaint(
    0.02,
    (c) => {
      const h = c.s[0];
      if (c.n.y > 0.9) return c.pick(WOOD, 0.35 + 0.25 * c.random(2), ) as string;
      const hoop = [0.06, 0.2, 0.6, 0.74].some((y) => Math.abs(h - y) < 0.035);
      if (hoop) return c.pick(IRON, 0.3 + 0.4 * c.random(1));
      const stave = Math.floor(c.s[1] / 22.5);
      const edge = Math.abs(((c.s[1] % 22.5) + 22.5) % 22.5) < 3;
      if (edge) return WOOD[0];
      return c.pick(WOOD, 0.4 + 0.12 * (stave % 3) + 0.18 * c.random(stave), ) as string;
    },
    { dither: true },
  );
  const profile: [number, number][] = [[0, 0], [0.22, 0], [0.27, 0.18], [0.3, 0.4], [0.27, 0.62], [0.22, 0.8], [0, 0.8]];
  b.lathe(profile, { at: [-1.1, 0, -0.4], segments: 16, color: barrelPaint });
  b.lathe(profile, { at: [-1.45, 0, 0.25], segments: 16, color: barrelPaint, spin: 20 });
  b.lathe(profile, { at: [1.35, 0.3, 0.0], axis: [0, 0, 1], segments: 16, color: barrelPaint });
  // a lid cracked open on one barrel with glowing green goo
  glow(b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12), "#5fe04a", { at: [-1.45, 0.805, 0.25] }), 1.2);
  plain([0.3, 0.03, 0.16], "#5a3519", [-1.35, 0.84, 0.3], [0, 25, 8]);

  // ---- torches ----
  const torch = (x: number, z: number) => {
    plain([0.5, 0.08, 0.5], "#2d2c36", [x, 0.04, z]);
    box([0.1, 1.15, 0.1], plankTex, [x, 0.65, z]);
    for (const y of [0.25, 0.7]) box([0.14, 0.04, 0.14], ironTex, [x, y, z]);
    box([0.24, 0.05, 0.24], ironTex, [x, 1.25, z]);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) box([0.03, 0.14, 0.03], ironTex, [x + sx * 0.1, 1.33, z + sz * 0.1]);
    glow(plain([0.14, 0.1, 0.14], "#6a2a10", [x, 1.3, z]), 0.4);
    glow(plain([0.18, 0.2, 0.18], "#ff7a1a", [x, 1.43, z]), 1.6);
    glow(plain([0.12, 0.2, 0.12], "#ffc83a", [x, 1.58, z]), 1.8);
    glow(plain([0.06, 0.16, 0.06], "#fff1a0", [x, 1.72, z]), 2);
    glow(plain([0.04, 0.04, 0.04], "#ff5a1a", [x + 0.12, 1.85, z - 0.05]), 1.8);
    glow(plain([0.03, 0.03, 0.03], "#ffc83a", [x - 0.1, 1.95, z + 0.06]), 1.8);
  };
  torch(-0.75, -0.95);
  torch(0.95, -0.9);

  // ---- bones ----
  const femur = (x: number, z: number, yaw: number, len = 0.42) => {
    const q = new THREE.Vector3(Math.sin((yaw * Math.PI) / 180), 0, Math.cos((yaw * Math.PI) / 180));
    const a = new THREE.Vector3(x, 0.03, z).addScaledVector(q, -len / 2);
    const e = new THREE.Vector3(x, 0.03, z).addScaledVector(q, len / 2);
    b.rod(a, e, 0.022, BONE[2], { sides: 4 } as any);
    for (const p of [a, e]) {
      for (const o of [-0.025, 0.025]) {
        b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), BONE[3], { at: [p.x + o * Math.cos((yaw * Math.PI) / 180), 0.035, p.z - o * Math.sin((yaw * Math.PI) / 180)] });
      }
    }
  };
  femur(0.55, 0.75, 30);
  femur(0.75, 0.9, -50, 0.38);
  femur(0.95, 0.65, 100, 0.34);
  femur(1.1, 0.95, 10, 0.3);
  // ribs
  for (let i = 0; i < 4; i++) {
    plain([0.2 - i * 0.02, 0.03, 0.035], BONE[2], [0.6 + i * 0.02, 0.03 + i * 0.015, 1.25 + i * 0.07], [0, 8, 14]);
  }
  // skull
  const sk = [0.8, 0.0, 1.15];
  b.part(new THREE.BoxGeometry(0.2, 0.18, 0.2), WHITE, { at: [sk[0], 0.12, sk[2]], texture: skullTex, rotation: [0, 200, 0] });
  b.part(new THREE.BoxGeometry(0.15, 0.06, 0.15), BONE[1], { at: [sk[0] + 0.03, 0.03, sk[2] + 0.04], rotation: [0, 200, 0] });
  // pile of small bones & a loose skull on chest
  b.part(new THREE.BoxGeometry(0.14, 0.12, 0.14), WHITE, { at: [-0.25, 0.8, cz - 0.05], texture: skullTex, rotation: [0, 160, 8] });
  for (let i = 0; i < 5; i++) plain([0.12, 0.025, 0.025], BONE[2], [-0.5 + i * 0.07, 0.03, 0.55 + (i % 2) * 0.08], [0, i * 37, 0]);

  // ---- spike trap ----
  const tx = -0.2, tz = 1.2;
  box([0.95, 0.06, 0.95], stoneTex, [tx, 0.03, tz]);
  const heights = [0.3, 0.18, 0.3, 0.06, 0.3, 0.22, 0.3, 0.1, 0.3];
  let k = 0;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      const px = tx + i * 0.28, pz = tz + j * 0.28;
      b.part(new THREE.BoxGeometry(0.14, 0.01, 0.14), WHITE, { at: [px, 0.062, pz], texture: holeTex });
      const h = heights[k++];
      b.part(new THREE.ConeGeometry(0.045, h, 4), IRON[3], { at: [px, 0.06 + h / 2, pz], rotation: [0, 45, 0] });
      b.part(new THREE.ConeGeometry(0.022, h * 0.35, 4), "#b01c24", { at: [px, 0.06 + h * 0.85, pz], rotation: [0, 45, 0] });
    }
  for (const [dx, dz] of [[0.2, 0.5], [-0.3, 0.52], [0.45, 0.2]])
    plain([0.12, 0.012, 0.09], "#7a1218", [tx + dx - 0.2, 0.062, tz + dz - 0.1], [0, 20, 0]);

  return b.root;
}
```