```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import {
  pixelTexture,
  pixelArt,
  tileBox,
  cellPaint,
  bayer,
  pick,
  snapColor,
} from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dungeon Props",
  description: "Pixel-art dungeon prop group: iron-bound chest, wall torches, barrels, bone pile and a spike trap on flagstones.",
};

const TEXEL = 0.02;
const S = (c: string) => snapColor(c, 32);
const WOODR = ["#2a160c", "#4a2a14", "#6e4220", "#946030"].map(S);
const STONER = ["#22222c", "#3a3a48", "#555568", "#74748a"].map(S);
const IRONC = S("#3c4250");
const GOLD = S("#e8b83a");
const BONE = S("#e8dcc0");

const woodPaint = cellPaint(0.02, (c) => c.pick(WOODR, 0.45 + 0.4 * (c.random(1) - 0.5) + 0.2 * c.n.y + (c.v % 4 === 0 ? -0.3 : 0)), { dither: true });
const stonePaint = cellPaint(0.04, (c) => c.pick(STONER, 0.4 + 0.5 * (c.random(2) - 0.4) + 0.2 * c.n.y), { dither: true });

const PLANKS = pixelTexture(32, 24, (g) => {
  g.fill((x, y) => (y % 6 === 0 ? WOODR[0] : y % 6 === 1 ? WOODR[3] : (x * 7 + y * 3) % 11 === 0 ? WOODR[1] : WOODR[2]));
});
const FLAME = pixelArt(
  [
    "...y...",
    "..yoy..",
    ".yoooy.",
    ".yorry.",
    "yorrrry",
    "yorwrry",
    ".orrro.",
    "..ooo..",
  ],
  { y: "#ffe066", o: "#ff9a1e", r: "#e03a10", w: "#fff6c0" },
);
const SKULL = pixelArt(
  [
    "..wwwww..",
    ".wwwwwww.",
    "wwwwwwwww",
    "wkkwwwkkw",
    "wkkwwwkkw",
    "wwwwkwwww",
    ".wwwwwww.",
    "..wkwkw..",
  ],
  { w: BONE, k: "#14101a" },
);

export default function build() {
  const b = createBuilder({ name: "dungeonProps", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const box = (size: [number, number, number], at: [number, number, number], color: any, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone: root, at, rotation: rot });

  // floor flagstones
  b.part(new THREE.BoxGeometry(3.2, 0.1, 2.4), stonePaint, { bone: root, at: [0, 0.03, 0] });
  for (let i = -3; i <= 3; i++) box([0.02, 0.01, 2.4], [i * 0.45, 0.085, 0], STONER[0]);
  for (let j = -2; j <= 2; j++) box([3.2, 0.01, 0.02], [0, 0.086, j * 0.45], STONER[0]);

  // chest
  const cx = -0.8, cz = 0.1;
  b.part(tileBox([0.8, 0.4, 0.5], PLANKS, TEXEL), woodPaint, { bone: root, at: [cx, 0.3, cz], texture: PLANKS });
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8, 1, false, 0, Math.PI), woodPaint, { bone: root, at: [cx, 0.5, cz], rotation: [0, 0, 90], scale: [1, 1, 1] });
  for (const x of [-0.28, 0.28]) {
    box([0.07, 0.42, 0.52], [cx + x, 0.3, cz], IRONC);
    b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 8, 1, false, 0, Math.PI), IRONC, { bone: root, at: [cx + x, 0.5, cz], rotation: [0, 0, 90] });
  }
  box([0.1, 0.12, 0.04], [cx, 0.46, cz + 0.27], GOLD);
  box([0.03, 0.05, 0.05], [cx, 0.45, cz + 0.29], "#2a2010");
  // gold coins spilling
  for (let i = 0; i < 6; i++) b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), GOLD, { bone: root, at: [cx + 0.45 + i * 0.05, 0.095, cz + 0.35 + (i % 2) * 0.06] });

  // barrels
  const barrel = (x: number, z: number, h: number) => {
    b.part(new THREE.CylinderGeometry(0.26, 0.26, h, 8), woodPaint, { bone: root, at: [x, 0.08 + h / 2, z] });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, h * 0.55, 8), woodPaint, { bone: root, at: [x, 0.08 + h / 2, z] });
    for (const f of [0.18, 0.82]) b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8), IRONC, { bone: root, at: [x, 0.08 + h * f, z] });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 8), WOODR[1], { bone: root, at: [x, 0.08 + h + 0.005, z] });
  };
  barrel(0.6, -0.6, 0.7);
  barrel(1.12, -0.5, 0.7);
  barrel(0.85, -0.95, 0.7);
  b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.7, 8), woodPaint, { bone: root, at: [0.85, 1.1, -0.72] });

  // torches on wall posts
  const torch = (x: number, z: number) => {
    box([0.1, 1.3, 0.1], [x, 0.7, z], WOODR[1]);
    box([0.18, 0.06, 0.18], [x, 1.3, z], IRONC);
    box([0.14, 0.14, 0.14], [x, 1.4, z], IRONC);
    box([0.08, 0.04, 0.08], [x, 0.2, z], IRONC);
    glow(b.part(new THREE.PlaneGeometry(0.3, 0.34), "#ffffff", { bone: root, at: [x, 1.6, z], dir: [0, 0, 1], axis: "z", texture: FLAME }), 1.4);
    glow(b.part(new THREE.PlaneGeometry(0.3, 0.34), "#ffffff", { bone: root, at: [x, 1.6, z], dir: [1, 0, 0], axis: "z", texture: FLAME }), 1.4);
    glow(b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), "#ff9a1e", { bone: root, at: [x, 1.52, z] }), 1.2);
  };
  torch(-1.4, -0.9);
  torch(0.05, -1.05);

  // bones
  const bones = [[-0.3, 0.7, 20], [-0.1, 0.85, -40], [0.1, 0.6, 70], [-0.45, 0.9, 100]];
  for (const [x, z, r] of bones) {
    b.part(new THREE.BoxGeometry(0.34, 0.05, 0.05), BONE, { bone: root, at: [x, 0.11, z], rotation: [0, r, 0] });
    for (const e of [-1, 1]) {
      const a = (r * Math.PI) / 180;
      b.part(new THREE.BoxGeometry(0.08, 0.07, 0.08), BONE, { bone: root, at: [x + Math.cos(a) * e * 0.17, 0.11, z - Math.sin(a) * e * 0.17] });
    }
  }
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.22), BONE, { bone: root, at: [-0.2, 0.2, 0.75] });
  b.part(new THREE.PlaneGeometry(0.23, 0.2), "#ffffff", { bone: root, at: [-0.2, 0.2, 0.862], dir: [0, 0, 1], axis: "z", texture: SKULL });

  // spike trap
  const tx = 0.9, tz = 0.55;
  box([1.0, 0.04, 1.0], [tx, 0.12, tz], IRONC);
  box([1.05, 0.08, 0.05], [tx, 0.14, tz + 0.52], STONER[1]);
  box([1.05, 0.08, 0.05], [tx, 0.14, tz - 0.52], STONER[1]);
  box([0.05, 0.08, 1.05], [tx + 0.52, 0.14, tz], STONER[1]);
  box([0.05, 0.08, 1.05], [tx - 0.52, 0.14, tz], STONER[1]);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const h = 0.3 + ((i * 3 + j * 5) % 3) * 0.04;
      b.part(new THREE.ConeGeometry(0.05, h, 4), S("#c8d0dc"), { bone: root, at: [tx - 0.33 + i * 0.22, 0.14 + h / 2, tz - 0.33 + j * 0.22] });
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 4), "#7a1c1c", { bone: root, at: [tx - 0.33 + i * 0.22, 0.17, tz - 0.33 + j * 0.22] });
    }

  return b.root;
}
```