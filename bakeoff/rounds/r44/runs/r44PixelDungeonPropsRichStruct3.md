```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { pixelArt, tileBox, pixelTexture, bayer, pick, snapColor, cellPaint } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Dungeon Props",
  description: "Pixel-art dungeon prop group: iron-banded chest, wall torches, barrels, scattered bones and a spike trap on a flagstone floor.",
};

const TEXEL = 0.02;

export default function build() {
  const b = createBuilder({ name: "dungeonProps", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const part = (g: THREE.BufferGeometry, c: any, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone: root, at, ...o });
  const box = (s: [number, number, number], c: any, at: [number, number, number], o: any = {}) =>
    part(new THREE.BoxGeometry(...s), c, at, o);

  const STONE = ["#23222c", "#383746", "#4f4e63", "#6d6c84"].map((c) => snapColor(c, 32));
  const WOODR = ["#2a160b", "#4a2a14", "#74451f", "#9a6330"];
  const floorPaint = cellPaint(
    TEXEL * 2,
    (c) => {
      const tile = (Math.floor(c.u / 8) + Math.floor(c.v / 8)) % 2;
      const edge = c.u % 8 === 0 || c.v % 8 === 0;
      if (edge) return STONE[0];
      return c.pick(STONE, 0.45 + 0.2 * tile + 0.25 * (c.random(1) - 0.5));
    },
    { dither: true },
  );
  const woodPaint = cellPaint(TEXEL, (c) => c.pick(WOODR, 0.5 + 0.3 * Math.sin(c.u * 0.9 + c.random(2)) + 0.1 * c.n.y), {
    dither: true,
  });
  const IRON = cellPaint(TEXEL, (c) => c.pick(["#15151c", "#2c2e3a", "#4a4e60", "#7a8098"], 0.4 + 0.3 * c.n.y + 0.2 * (c.random(3) - 0.5)), { dither: true });
  const BONE = cellPaint(TEXEL * 0.7, (c) => c.pick(["#8a7e66", "#c9bd9c", "#efe6cc"], 0.5 + 0.4 * c.n.y), { dither: true });

  // floor
  box([3.2, 0.1, 3.2], floorPaint, [0, 0.05, 0]);

  // chest
  const cx = -0.8, cz = 0.2;
  box([0.9, 0.4, 0.6], woodPaint, [cx, 0.3, cz]);
  const lid = b.joint("chestLid", { parent: root, at: [cx, 0.5, cz - 0.3], dir: [1, 0, 0], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 8, 1, false, 0, Math.PI), woodPaint, {
    bone: lid, at: [cx, 0.5, cz], rotation: [0, 0, 90], scale: [1, 1, 1], flat: true,
  });
  for (const x of [-0.3, 0.3]) {
    box([0.09, 0.42, 0.64], IRON, [cx + x, 0.3, cz]);
    b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.09, 8, 1, false, 0, Math.PI), IRON, {
      bone: lid, at: [cx + x, 0.5, cz], rotation: [0, 0, 90], flat: true,
    });
  }
  box([0.14, 0.16, 0.05], "#e0b030", [cx, 0.46, cz + 0.33]);
  box([0.04, 0.06, 0.06], "#15151c", [cx, 0.45, cz + 0.35]);
  b.pose(lid, { axis: [1, 0, 0], deg: -25 });
  // coins
  for (let i = 0; i < 5; i++) glow(part(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 8), "#ffd24a", [cx - 0.2 + i * 0.1, 0.51, cz + 0.05 + (i % 2) * 0.08]), 0.8);

  // barrels
  const barrel = (x: number, z: number, h: number) => {
    b.lathe(
      [[0, 0], [0.26, 0], [0.32, h / 2], [0.26, h], [0, h]],
      { at: [x, 0.1, z], segments: 8, color: woodPaint, bone: root },
    );
    for (const f of [0.18, 0.82])
      b.lathe(
        [[0.25 + 0.07 * (1 - Math.abs(2 * f - 1) ** 2) * 1.0, 0], [0.31 + 0.06 * (1 - Math.abs(2 * f - 1)), 0], [0.31 + 0.06 * (1 - Math.abs(2 * f - 1)), 0.05], [0.25, 0.05]],
        { at: [x, 0.1 + h * f - 0.025, z], segments: 8, color: IRON, bone: root },
      );
  };
  barrel(0.5, -0.9, 0.8);
  barrel(1.1, -0.8, 0.8);
  barrel(0.8, -0.35, 0.8);
  box([0.3, 0.3, 0.3], woodPaint, [0.85, 0.95, -0.7]);

  // wall torches on posts
  const flame = new THREE.ConeGeometry(0.1, 0.3, 4);
  for (const x of [-1.4, 1.4]) {
    const z = -1.35;
    box([0.4, 0.5, 0.4], floorPaint, [x, 0.35, z]);
    box([0.1, 1.0, 0.1], woodPaint, [x, 1.1, z]);
    box([0.2, 0.1, 0.2], IRON, [x, 1.62, z]);
    glow(part(flame, "#ff7a1c", [x, 1.82, z]), 1.5);
    glow(part(new THREE.ConeGeometry(0.06, 0.2, 4), "#ffe060", [x, 1.78, z]), 1.8);
    for (let i = 0; i < 3; i++) glow(part(new THREE.BoxGeometry(0.03, 0.03, 0.03), "#ffb030", [x + (i - 1) * 0.1, 2.1 + i * 0.07, z + 0.03]), 1.8);
  }

  // spike trap
  const sx = 0.2, sz = 0.9;
  box([1.0, 0.04, 1.0], IRON, [sx, 0.12, sz]);
  box([1.04, 0.06, 0.06], "#15151c", [sx, 0.13, sz + 0.5]);
  box([1.04, 0.06, 0.06], "#15151c", [sx, 0.13, sz - 0.5]);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const h = 0.35 + ((i * 3 + j * 5) % 3) * 0.08;
      b.spike([sx - 0.36 + i * 0.24, 0.14, sz - 0.36 + j * 0.24], [0, 1, 0], h, 0.05, { color: IRON, bone: root, sides: 4, caps: "point" });
    }
  box([0.07, 0.07, 0.07], "#a01818", [sx + 0.1, 0.3, sz + 0.1]);

  // bones
  const bone = (a: [number, number, number], c: [number, number, number]) => {
    b.rod(a, c, 0.035, BONE, { bone: root, sides: 5 });
    for (const p of [a, c]) part(new THREE.SphereGeometry(0.06, 5, 4), BONE, p);
  };
  bone([-0.2, 0.15, 0.9], [-0.6, 0.15, 1.0]);
  bone([-0.4, 0.15, 1.2], [-0.1, 0.15, 1.3]);
  bone([-1.3, 0.15, -0.7], [-1.0, 0.15, -0.4]);
  part(new THREE.BoxGeometry(0.28, 0.24, 0.28), BONE, [-0.9, 0.22, -0.9], { rotation: [0, 25, 0] });
  part(new THREE.BoxGeometry(0.2, 0.1, 0.16), BONE, [-0.88, 0.1, -0.7], { rotation: [0, 25, 0] });
  const eye = pixelArt(["kk", "kk"], { k: "#0a0a10" });
  for (const s of [-1, 1])
    part(new THREE.BoxGeometry(0.07, 0.07, 0.03), "#ffffff", [-0.9 + s * 0.06, 0.25, -0.75], { texture: eye, rotation: [0, 25, 0] });
  // rib cage
  for (let i = 0; i < 4; i++)
    part(new THREE.TorusGeometry(0.12, 0.018, 4, 6, Math.PI), BONE, [1.3, 0.16, 0.6 + i * 0.1], { rotation: [0, 90, 0] });
  box([0.03, 0.03, 0.5], BONE, [1.3, 0.1, 0.75]);

  return b.root;
}
```