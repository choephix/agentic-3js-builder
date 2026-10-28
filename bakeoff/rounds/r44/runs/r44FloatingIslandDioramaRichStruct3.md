```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, mottle, grain, paint, noise, svg, aim } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Skyreach Island",
  description: "A floating sky island with a stone ruin arch and glowing crystal, a waterfall pouring off the edge, blossom trees, hanging roots and drifting glow motes.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "skyIsland", paintSize: 1024 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(7);

  const GRASS = cel(mottle("#86dc5a", "#b4f06c", { size: 0.18, seed: 2 }), "#3f9a5a");
  const ROCK = cel(
    paint((p, n) => {
      const layer = Math.floor((p.y + (noise(p, 0.3, 3) - 0.5) * 0.08) / 0.07);
      if (n.y > 0.6 && p.y > 0.55) return "#7ccf5a";
      return ["#a89cc4", "#9488b4", "#bcb0d6", "#8a7fa8"][((layer % 4) + 4) % 4];
    }),
    "#5e5488",
  );
  const STONE = cel("#e2dac8", "#a69cae");
  const STONE_DK = cel("#bdb4a6", "#857c92");
  const GOLD = cel("#ffd35a", "#d9902f");
  const TEAL = cel("#3fd0c8", "#2a8aa8");
  const BARK = cel(grain("#7a5160", "#563a49", { size: 0.02, axis: "y" }), "#3a2638");
  const PINK = [cel(mottle("#ffc2dc", "#ffa6cb", { size: 0.1, seed: 4 })), cel("#ffdcea", "#e8a6c4")];
  const LEAF = cel("#4fbf6a", "#2a8a5a");
  const WATER = cel(
    paint((p) => (Math.sin(p.y * 70 + p.x * 9) > 0.55 ? "#f4feff" : "#6fd6f2")),
    "#3a9ed0",
  );

  const put = (g: THREE.BufferGeometry, m: any, at: V, rot?: V, scale?: V) =>
    b.part(g, m, { bone: base, at, rotation: rot, scale });

  // Island: stacked faceted rock tapering downward
  const layers: [number, number, number, number][] = [
    [0.9, 0.0, 0.52, 0.0],
    [0.78, -0.2, 0.5, 20],
    [0.6, -0.42, 0.45, 40],
    [0.42, -0.65, 0.42, 10],
    [0.26, -0.9, 0.4, 30],
    [0.12, -1.15, 0.35, 0],
  ];
  layers.forEach(([r, y, h, ry], i) => {
    put(new THREE.CylinderGeometry(r, i + 1 < layers.length ? layers[i + 1][0] : 0.02, h, 7, 1), ROCK, [0, 1.0 + y - h / 2 + 0.1, 0], [0, ry, 0], [1, 1, 0.9]);
  });
  // grass cap
  put(new THREE.CylinderGeometry(0.88, 0.95, 0.12, 9), GRASS, [0, 1.08, 0]);
  put(new THREE.CylinderGeometry(0.95, 0.9, 0.05, 9), cel("#5ab04a", "#2f7a4a"), [0, 1.0, 0]);
  // boulders at rim
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7;
    const s = 0.06 + R() * 0.05;
    put(new THREE.IcosahedronGeometry(s, 0), STONE_DK, [Math.cos(a) * 0.9, 1.0, Math.sin(a) * 0.9], [R() * 90, R() * 90, 0]);
  }

  // Hanging roots / crystals underneath
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05;
    const x = Math.cos(a) * 0.45, z = Math.sin(a) * 0.45;
    b.sweep(catmull([[x, 0.75, z], [x * 1.1, 0.5, z * 1.1], [x * 0.9, 0.3 - R() * 0.1, z * 0.9]]), [0.025, 0.004], { color: BARK, bone: base, sides: 5, caps: "point" });
  }
  for (const [x, z, h] of [[0.0, 0.0, 0.55], [0.12, 0.08, 0.3], [-0.1, 0.06, 0.25]] as V[]) {
    glow(put(new THREE.ConeGeometry(0.07, h, 5), "#7af0ff", [x, -0.15 - h / 2 + 0.28 + 0.0, z], [180, 0, 0]), 1.3);
  }

  // Ruins: broken arch, pillars, steps
  const rx = -0.2, rz = -0.1, gy = 1.06;
  put(new THREE.BoxGeometry(0.62, 0.05, 0.4), STONE, [rx, gy + 0.02, rz]);
  put(new THREE.BoxGeometry(0.5, 0.05, 0.3), STONE_DK, [rx, gy + 0.065, rz]);
  for (const s of [1, -1]) {
    put(new THREE.CylinderGeometry(0.045, 0.055, 0.5, 8), STONE, [rx + s * 0.2, gy + 0.35, rz]);
    put(new THREE.BoxGeometry(0.12, 0.04, 0.12), STONE_DK, [rx + s * 0.2, gy + 0.62, rz]);
    put(new THREE.BoxGeometry(0.11, 0.04, 0.11), GOLD, [rx + s * 0.2, gy + 0.11, rz]);
  }
  put(new THREE.BoxGeometry(0.28, 0.06, 0.1), STONE, [rx - 0.1, gy + 0.67, rz], [0, 0, 6]);
  put(new THREE.BoxGeometry(0.1, 0.05, 0.1), STONE_DK, [rx + 0.12, gy + 0.66, rz], [0, 20, -12]);
  // broken pillar & rubble
  put(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8), STONE_DK, [0.15, gy + 0.12, 0.3]);
  put(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8), STONE, [0.28, gy + 0.05, 0.38], [0, 0, 80]);
  for (let i = 0; i < 6; i++) put(new THREE.BoxGeometry(0.06, 0.04, 0.05), STONE_DK, [rx + (R() - 0.5) * 0.7, gy + 0.03, rz + 0.25 + R() * 0.2], [R() * 40, R() * 90, R() * 40]);
  // glowing rune orb in the arch
  glow(put(new THREE.IcosahedronGeometry(0.07, 1), "#9af4ff", [rx, gy + 0.4, rz]), 1.5);
  put(new THREE.TorusGeometry(0.1, 0.012, 4, 10), GOLD, [rx, gy + 0.4, rz]);
  const RUNE = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#6fe8f0" stroke-width="3"/><path d="M20 6V34M8 20H32M11 11L29 29" stroke="#6fe8f0" stroke-width="3" fill="none"/></svg>`, { size: 96 });
  glow(b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", { bone: base, at: [rx, gy + 0.075 + 0.0, rz + 0.0], dir: [0, 1, 0], axis: "z", texture: RUNE }), 1.2);

  // Waterfall at the +X edge
  const wx = 0.88;
  b.sweep(catmull([[0.4, gy + 0.05, 0.1], [0.65, gy + 0.04, 0.12], [wx, gy + 0.03, 0.12]]), [0.06, 0.05], { color: WATER, bone: base, sides: 6, section: "box" });
  put(new THREE.BoxGeometry(0.02, 1.0, 0.14), WATER, [wx + 0.04, 0.55, 0.12]);
  put(new THREE.BoxGeometry(0.02, 0.5, 0.1), WATER, [wx + 0.06, -0.2, 0.12]);
  for (let i = 0; i < 5; i++) put(new THREE.IcosahedronGeometry(0.06 + 0.01 * (i % 2), 0), cel("#ffffff", "#c6d8f0"), [wx + 0.12 + R() * 0.05, 0.9 - i * 0.55, 0.12 + (R() - 0.5) * 0.08]);

  // Trees
  const tree = (x: number, z: number, h: number, m: any) => {
    b.sweep(catmull([[x, gy, z], [x + 0.03, gy + h * 0.5, z], [x - 0.02, gy + h, z + 0.02]]), [0.045, 0.02], { color: BARK, bone: base, sides: 6 });
    const cs: V[] = [[0, h + 0.05, 0], [0.1, h - 0.02, 0.05], [-0.1, h, -0.03], [0.02, h + 0.14, -0.04]];
    cs.forEach(([dx, dy, dz], i) => put(new THREE.IcosahedronGeometry(0.14 - i * 0.012, 1), i % 2 ? PINK[1] : m, [x + dx, gy + dy, z + dz]));
  };
  tree(0.45, -0.35, 0.5, PINK[0]);
  tree(-0.6, 0.35, 0.4, PINK[0]);
  tree(0.3, 0.45, 0.3, PINK[1]);
  // pines
  for (const [x, z, h] of [[-0.65, -0.35, 0.4], [-0.45, -0.5, 0.3], [0.05, -0.6, 0.35]] as V[]) {
    put(new THREE.CylinderGeometry(0.015, 0.02, 0.1, 5), BARK, [x, gy + 0.05, z]);
    for (let k = 0; k < 3; k++) put(new THREE.ConeGeometry(0.1 - k * 0.025, h * 0.45, 7), LEAF, [x, gy + 0.15 + k * h * 0.28, z]);
  }

  // Grass tufts and blossom petals
  const TUFT = svg(`<svg viewBox="0 0 32 32"><path d="M4 32L8 4L12 32Z" fill="#5cc44a"/><path d="M12 32L18 0L22 32Z" fill="#8ae060"/><path d="M20 32L28 8L30 32Z" fill="#4ab048"/></svg>`, { size: 64 });
  const tufts: any[] = [];
  for (let i = 0; i < 40; i++) {
    const a = R() * 6.28, r = Math.sqrt(R()) * 0.8;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x - rx) < 0.35 && Math.abs(z - rz) < 0.25) continue;
    tufts.push(frame([x, gy + 0.05, z], [0, 1, 0]));
  }
  b.cards(tufts, TUFT, { size: [0.07, 0.07], cross: true, vary: 0.3, rng: R, bone: base });
  const PETAL = svg(`<svg viewBox="0 0 24 32"><path d="M12 31C2 24 0 12 6 2L12 8L18 2C24 12 22 24 12 31Z" fill="#ffc0da"/></svg>`, { size: 64 });
  const motes: any[] = [];
  for (let i = 0; i < 30; i++) motes.push(frame([(R() - 0.5) * 2.2, 0.2 + R() * 1.6, (R() - 0.5) * 2.2], [0, 1, 0]));
  glow(b.cards(motes, PETAL, { size: 0.05, lean: 60, vary: 0.3, rng: R, bone: base, cross: true }), 1.1);

  // Clouds
  for (const [x, y, z] of [[-1.0, 0.1, 0.5], [1.1, 0.3, -0.5]] as V[])
    for (let i = 0; i < 4; i++) put(new THREE.IcosahedronGeometry(0.1 + 0.03 * (i % 2), 1), cel("#ffffff", "#c9d2f4"), [x + i * 0.1, y + (i % 2) * 0.03, z], [0, 0, 0], [1.2, 0.6, 1]);

  void TEAL; void aim;
  return b.root;
}
```