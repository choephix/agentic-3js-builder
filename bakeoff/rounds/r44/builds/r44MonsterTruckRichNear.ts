import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { pixelTexture, pixelArt, tileBox, cellPaint, bayer, pick, snapColor } from "../../../../kits/pixel";

export const meta = {
  name: "Pixel Monster Truck",
  description: "Pixel-art monster truck with huge chunky tyres, lifted body, cab, roll bar and light bar.",
};

const TEXEL = 0.04;
const RED = ["#4a0c12", "#8a1620", "#c8262e", "#ee4a3c", "#ff8a6a"].map((c) => snapColor(c, 64));
const RUB = ["#08080c", "#14141c", "#22222c", "#34343e"];
const STEEL = ["#2a2e3a", "#4a5060", "#7a8296", "#aab2c4"];

const bodyPaint = cellPaint(TEXEL, (c) => c.pick(RED, 0.5 + 0.4 * c.n.y + 0.2 * (c.random(1) - 0.5)), { dither: true });
const tirePaint = cellPaint(TEXEL, (c) => c.pick(RUB, 0.3 + 0.4 * c.random(2) + 0.2 * c.n.y), { dither: true });
const steelPaint = cellPaint(TEXEL * 0.5, (c) => c.pick(STEEL, 0.4 + 0.4 * c.n.y + 0.2 * c.random(3)), { dither: true });

const GRILLE = pixelArt(
  ["kkkkkkkk", "kgkgkgkg", "kkkkkkkk", "kgkgkgkg", "kkkkkkkk"],
  { k: "#0a0a10", g: "#8a92a8" },
);
const WINDOW = pixelArt(
  ["bbbbbbbb", "bwbbbbbb", "bbwbbbbb", "bbbbbbbb", "bbbbbbbb"],
  { b: "#2a4a7a", w: "#9ad0ff" },
);
const FLAME = pixelTexture(24, 8, (g) => {
  g.fill((x, y) => (y > 1 + Math.abs(((x * 5) % 8) - 4) * 0.6 ? (y > 4 ? "#ffd23a" : "#ff7a1a") : ""));
});
const LAMP = pixelArt(["yy", "yy"], { y: "#fff3a0" });

export default function build() {
  const b = createBuilder({ name: "monsterTruck" });
  const chassis = b.joint("chassis", { at: [0, 1.2, 0], dir: [0, 0, 1], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: any, o: any = {}) => b.part(g, c, { bone: chassis, flat: true, ...o });

  const R = 0.8; // tyre radius
  const WZ = 1.25;
  const WX = 1.15;
  const wheels: Record<string, any> = {};
  for (const [n, sx, z] of [["FL", 1, WZ], ["FR", -1, WZ], ["RL", 1, -WZ], ["RR", -1, -WZ]] as const) {
    const j = b.joint(`wheel${n}`, { parent: chassis, at: [sx * WX, R, z], dir: [sx, 0, 0], role: "hinge" });
    wheels[n] = j;
    const at: [number, number, number] = [sx * WX, R, z];
    b.part(new THREE.CylinderGeometry(R, R, 0.75, 14), tirePaint, { bone: j, at, dir: [1, 0, 0], flat: true });
    // chunky tread blocks
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const blk = new THREE.BoxGeometry(0.8, 0.14, 0.26);
      b.part(blk, tirePaint, {
        bone: j,
        at: [at[0], R + Math.sin(a) * (R + 0.04), z + Math.cos(a) * (R + 0.04)],
        rotation: [(-a * 180) / Math.PI + 90 + 0, 0, 0].map((v, k) => (k === 0 ? 90 - (a * 180) / Math.PI : v)),
        flat: true,
      });
    }
    b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 8), steelPaint, { bone: j, at: [at[0] + sx * 0.36, R, z], dir: [1, 0, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 6), "#ffc83a", { bone: j, at: [at[0] + sx * 0.4, R, z], dir: [1, 0, 0], flat: true });
    // axle stub
    P(new THREE.BoxGeometry(0.5, 0.16, 0.16), steelPaint, { at: [sx * 0.7, R, z] });
  }
  // axles
  for (const z of [WZ, -WZ]) P(new THREE.BoxGeometry(2.0, 0.2, 0.22), steelPaint, { at: [0, R, z] });
  // shocks
  for (const sx of [1, -1]) for (const z of [WZ, -WZ]) P(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), "#ffc83a", { at: [sx * 0.65, 1.2, z + 0.2] });

  // frame
  P(new THREE.BoxGeometry(1.3, 0.2, 3.4), steelPaint, { at: [0, 1.15, 0] });
  // lower body
  P(tileBox([1.7, 0.5, 3.6], FLAME, TEXEL), bodyPaint, { at: [0, 1.55, 0], texture: undefined });
  P(new THREE.BoxGeometry(1.74, 0.5, 3.64), bodyPaint, { at: [0, 1.55, 0] });
  // hood
  P(new THREE.BoxGeometry(1.6, 0.3, 1.3), bodyPaint, { at: [0, 1.95, 1.1] });
  P(new THREE.BoxGeometry(0.5, 0.14, 0.7), "#22222c", { at: [0, 2.17, 1.2] });
  // cab
  P(new THREE.BoxGeometry(1.6, 0.9, 1.4), bodyPaint, { at: [0, 2.35, -0.3] });
  P(new THREE.BoxGeometry(1.5, 0.1, 1.3), bodyPaint, { at: [0, 2.85, -0.3] });
  // windows
  const win = (w: number, h: number, at: number[], dir: number[]) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: WINDOW, flat: false });
  win(1.3, 0.5, [0, 2.45, 0.42], [0, 0.25, 1]);
  for (const sx of [1, -1]) win(1.0, 0.45, [sx * 0.81, 2.45, -0.3], [sx, 0, 0]);
  win(1.3, 0.5, [0, 2.45, -1.01], [0, 0, -1]);
  // grille + headlights
  P(new THREE.PlaneGeometry(1.2, 0.45), "#ffffff", { at: [0, 1.6, 1.84], dir: [0, 0, 1], axis: "z", texture: GRILLE, flat: false });
  for (const sx of [1, -1]) {
    P(new THREE.PlaneGeometry(0.32, 0.32), "#ffffff", { at: [sx * 0.62, 1.95, 1.76], dir: [0, 0, 1], axis: "z", texture: LAMP, flat: false });
    P(new THREE.BoxGeometry(0.3, 0.2, 0.1), "#ff2a2a", { at: [sx * 0.65, 1.6, -1.85] });
  }
  // bumpers
  P(new THREE.BoxGeometry(1.9, 0.2, 0.2), steelPaint, { at: [0, 1.3, 1.95] });
  P(new THREE.BoxGeometry(1.9, 0.2, 0.2), steelPaint, { at: [0, 1.3, -1.95] });
  // fender flames side decal
  for (const sx of [1, -1])
    P(new THREE.PlaneGeometry(2.0, 0.5), "#ffffff", { at: [sx * 0.88, 1.58, 0.55], dir: [sx, 0, 0], axis: "z", texture: FLAME, flat: false });
  // light bar
  P(new THREE.BoxGeometry(1.4, 0.14, 0.14), "#22222c", { at: [0, 2.98, -0.1] });
  for (let i = 0; i < 5; i++) P(new THREE.BoxGeometry(0.2, 0.14, 0.16), "#fff3a0", { at: [-0.5 + i * 0.25, 2.98, -0.1] });
  // roll bar / rear bed
  P(new THREE.BoxGeometry(1.6, 0.3, 1.0), bodyPaint, { at: [0, 1.85, -1.4] });
  for (const sx of [1, -1]) P(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), steelPaint, { at: [sx * 0.7, 2.3, -1.6] });
  P(new THREE.BoxGeometry(1.5, 0.1, 0.1), steelPaint, { at: [0, 2.7, -1.6] });
  // exhaust stacks
  for (const sx of [1, -1]) P(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 6), steelPaint, { at: [sx * 0.55, 2.7, 0.35] });
  // antenna
  P(new THREE.BoxGeometry(0.04, 0.8, 0.04), "#aab2c4", { at: [0.7, 3.2, -0.9] });

  void bayer; void pick;
  return b.root;
}
