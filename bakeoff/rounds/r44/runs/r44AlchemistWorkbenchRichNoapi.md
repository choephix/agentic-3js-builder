```ts
import * as THREE from "three";
import { createBuilder, rng, svg, paint, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A Genshin-style alchemist workbench with glowing potions, stacked books, a brass balance scale, a mortar and hanging herbs.",
};

const CREAM = "#f3e6c4";
const TEAL = "#2e8c8a";
const GOLD = "#e0b64a";
const GOLD_D = "#a8782a";

const wood = (a: string, c: string, seed: number) =>
  paint((p, n) => {
    const g = noise(new THREE.Vector3(p.x * 0.4, p.y * 4, p.z * 4), 0.1, seed);
    const t = mix(a, c, smoothstep(0.35, 0.8, g) * 0.7);
    return mix(t, "#fff0c8", Math.max(0, n.y) * 0.18);
  });
const WOOD = wood("#8a5a34", "#5c3822", 3);
const WOOD_D = wood("#6a4224", "#3e2414", 5);

const potionTex = (c: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="20" fill="${c}"/><path d="M32 18 L38 34 L32 50 L26 34Z" fill="#fff" opacity="0.8"/><circle cx="24" cy="26" r="4" fill="#fff"/></svg>`,
    { size: 128 },
  );
const runeTex = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#a8782a" stroke-width="5"/><circle cx="50" cy="50" r="34" fill="none" stroke="#e0b64a" stroke-width="2.5"/><path d="M50 14 L62 50 L50 86 L38 50Z M14 50 L86 50" fill="none" stroke="#e0b64a" stroke-width="3"/><circle cx="50" cy="50" r="7" fill="#fff0a0"/></svg>`,
  { size: 256 },
);
const bookTex = svg(
  `<svg viewBox="0 0 100 60"><rect x="6" y="6" width="88" height="48" fill="none" stroke="#e0b64a" stroke-width="3"/><path d="M50 14 L58 30 L50 46 L42 30Z" fill="#e0b64a"/><circle cx="50" cy="30" r="4" fill="#7a2a2a"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "alchemistBench", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);
  const box = (s: [number, number, number], at: [number, number, number], c: any, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...s), c, { bone: root, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: [number, number, number], c: any, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: root, at, rotation: rot });
  const sph = (r: number, at: [number, number, number], c: any, sc?: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone: root, at, scale: sc });

  // bench
  const TOP = 0.9;
  box([1.7, 0.08, 0.8], [0, TOP - 0.04, 0], WOOD);
  box([1.76, 0.03, 0.86], [0, TOP - 0.095, 0], WOOD_D);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box([0.1, 0.8, 0.1], [sx * 0.75, 0.4, sz * 0.32], WOOD_D);
      box([0.12, 0.05, 0.12], [sx * 0.75, 0.03, sz * 0.32], GOLD_D);
    }
  box([1.5, 0.06, 0.06], [0, 0.25, 0.32], WOOD);
  box([1.5, 0.06, 0.06], [0, 0.25, -0.32], WOOD);
  box([1.5, 0.04, 0.6], [0, 0.22, 0], WOOD);
  // teal cloth runner with gold trim
  box([0.9, 0.012, 0.5], [-0.25, TOP + 0.006, 0.05], TEAL);
  box([0.9, 0.014, 0.025], [-0.25, TOP + 0.007, 0.28], GOLD);
  box([0.9, 0.014, 0.025], [-0.25, TOP + 0.007, -0.18], GOLD);
  glow(b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: root, at: [-0.25, TOP + 0.015, 0.05], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: runeTex }), 0.9);

  // back shelf
  box([1.7, 0.05, 0.22], [0, 1.55, -0.34], WOOD);
  for (const sx of [-1, 1]) box([0.06, 0.65, 0.06], [sx * 0.8, 1.25, -0.4], WOOD_D);
  box([1.7, 0.7, 0.03], [0, 1.2, -0.43], WOOD_D);

  // potions
  const cols = ["#ff6a8a", "#5ad6ff", "#8aff7a", "#c58aff", "#ffd24a"];
  const flask = (x: number, y: number, z: number, s: number, i: number) => {
    const c = cols[i % 5];
    cyl(0.012 * s, 0.014 * s, 0.07 * s, 6, [x, y + 0.17 * s, z], WOOD_D);
    cyl(0.02 * s, 0.014 * s, 0.07 * s, 8, [x, y + 0.125 * s, z], "#cfeef0");
    glow(sph(0.07 * s, [x, y + 0.07 * s, z], c, [1, 0.95, 1]), 0.8);
    sph(0.078 * s, [x, y + 0.07 * s, z], "#dff6f6", [1, 0.95, 1]).mesh.visible = false;
    b.part(new THREE.PlaneGeometry(0.07 * s, 0.07 * s), "#ffffff", { bone: root, at: [x, y + 0.07 * s, z + 0.075 * s], dir: [0, 0, 1], axis: "z", texture: potionTex("#ffffff") });
    cyl(0.03 * s, 0.03 * s, 0.01, 8, [x, y + 0.005, z], GOLD_D);
  };
  [[-0.6, 0.15], [-0.45, -0.1], [-0.15, 0.0], [0.05, 0.2]].forEach(([x, z], i) => flask(x, TOP, z, 1 + (i % 2) * 0.3, i));
  [[-0.55, -0.34], [-0.3, -0.34], [0.2, -0.34], [0.5, -0.34], [0.7, -0.34]].forEach(([x, z], i) => flask(x, 1.575, z, 0.9 + (i % 3) * 0.15, i + 1));

  // books
  const bcols = ["#7a2a3a", "#2a4a7a", "#3a6a4a", "#8a5a2a"];
  let by = TOP;
  bcols.forEach((c, i) => {
    const h = 0.05 + R() * 0.03;
    box([0.34 - i * 0.02, h, 0.24], [0.45, by + h / 2, 0.05], c, [0, (R() - 0.5) * 20, 0]);
    box([0.32 - i * 0.02, h - 0.012, 0.235], [0.47, by + h / 2, 0.055], CREAM);
    by += h;
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.12), "#ffffff", { bone: root, at: [0.45, by + 0.003, 0.05], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: bookTex });
  for (let i = 0; i < 4; i++) box([0.06, 0.2, 0.14], [-0.74 + i * 0.065, 1.675, -0.34], bcols[i], [0, 0, i === 3 ? 14 : 0]);

  // scales
  const sx = 0.62, sz = -0.12;
  cyl(0.07, 0.09, 0.03, 8, [sx, TOP + 0.015, sz], GOLD_D);
  cyl(0.015, 0.02, 0.4, 6, [sx, TOP + 0.23, sz], GOLD);
  sph(0.03, [sx, TOP + 0.44, sz], GOLD);
  box([0.5, 0.018, 0.018], [sx, TOP + 0.44, sz], GOLD, [0, 0, 4]);
  for (const s of [-1, 1]) {
    const px = sx + s * 0.25, py = TOP + 0.44 - s * 0.0175;
    for (const a of [0.5, 2.6, 4.7]) {
      const ex = px + Math.cos(a) * 0.07, ez = sz + Math.sin(a) * 0.07;
      b.rod([px, py, sz], [ex, py - 0.17, ez], 0.003, { color: GOLD_D, bone: root });
    }
    b.part(new THREE.CylinderGeometry(0.09, 0.03, 0.03, 10), GOLD, { bone: root, at: [px, py - 0.18, sz] });
  }
  glow(sph(0.025, [sx - 0.25, TOP + 0.5 - 0.0 - 0.28 + 0.03, sz], "#ffd24a"), 1.2);
  sph(0.03, [sx + 0.25, TOP + 0.285, sz], "#8a8aa0");

  // mortar and pestle
  const mx = 0.1, mz = -0.2;
  b.lathe([[0, 0], [0.05, 0], [0.09, 0.05], [0.1, 0.09], [0.085, 0.09], [0.07, 0.05], [0, 0.03]], { at: [mx, TOP, mz], segments: 10, color: "#8a9aa0", bone: root });
  b.rod([mx, TOP + 0.05, mz], [mx + 0.08, TOP + 0.2, mz + 0.03], 0.016, { color: "#cfd8d8", bone: root });
  cyl(0.07, 0.07, 0.006, 10, [mx, TOP + 0.05, mz], "#6ac86a");

  // cauldron with glowing brew
  const cx = -0.62, cz = -0.2;
  b.lathe([[0, 0.04], [0.1, 0], [0.16, 0.08], [0.17, 0.16], [0.15, 0.2], [0.13, 0.2], [0.14, 0.15], [0.1, 0.06], [0, 0.06]], { at: [cx, TOP, cz], segments: 10, color: "#3a3a48", bone: root });
  glow(cyl(0.14, 0.14, 0.01, 10, [cx, TOP + 0.17, cz], "#7aff9a"), 1.2);
  for (const a of [0, 2.1, 4.2]) cyl(0.012, 0.012, 0.05, 5, [cx + Math.cos(a) * 0.12, TOP - 0.0 + 0.02, cz + Math.sin(a) * 0.12], "#2a2a34");
  for (const [dx, dz] of [[0.04, 0.03], [-0.05, -0.02], [0.0, -0.06]]) glow(sph(0.02, [cx + dx, TOP + 0.2 + dz, cz + dz], "#b8ffc8", [1, 0.8, 1]), 1.4);

  // hanging herbs
  const herbs = ["#5aa84a", "#7ac85a", "#a8c84a"];
  for (let k = 0; k < 4; k++) {
    const hx = -0.55 + k * 0.3;
    b.rod([hx, 1.52, -0.3], [hx, 1.46, -0.3], 0.004, { color: "#c9a468", bone: root });
    for (let l = 0; l < 6; l++) {
      const a = l * 1.05;
      b.part(new THREE.ConeGeometry(0.02, 0.17, 5), herbs[(k + l) % 3], { bone: root, at: [hx + Math.cos(a) * 0.025, 1.38, -0.3 + Math.sin(a) * 0.025], rotation: [180, 0, 0] });
    }
    sph(0.018, [hx + 0.02, 1.42, -0.28], k % 2 ? "#ff9ad0" : "#fff08a");
  }
  // herb pots on bench
  for (const [x, z, c] of [[-0.85, 0.2, "#c8785a"], [-0.85, -0.1, "#d8a85a"]] as [number, number, string][]) {
    cyl(0.06, 0.045, 0.09, 8, [x, TOP + 0.045, z], c);
    for (let l = 0; l < 5; l++) b.part(new THREE.ConeGeometry(0.02, 0.12, 4), herbs[l % 3], { bone: root, at: [x + Math.cos(l * 1.3) * 0.03, TOP + 0.13, z + Math.sin(l * 1.3) * 0.03], rotation: [Math.sin(l) * 30, 0, Math.cos(l * 1.3) * 30] });
  }
  // lantern
  cyl(0.04, 0.05, 0.02, 6, [0.82, TOP + 0.01, 0.25], GOLD_D);
  glow(cyl(0.035, 0.035, 0.1, 6, [0.82, TOP + 0.07, 0.25], "#ffcf6a"), 1.4);
  cyl(0.001, 0.05, 0.05, 6, [0.82, TOP + 0.145, 0.25], GOLD_D);

  return b.root;
}
```