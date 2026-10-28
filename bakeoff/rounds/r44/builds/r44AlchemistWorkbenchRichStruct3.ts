import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng } from "../../../../src/index";
import { grain, mix, noise, paint, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description: "A cel-painted alchemist's workbench with glowing potions, stacked books, brass scales, a bubbling flask and hanging herbs.",
};

type V = [number, number, number];

const WOOD = grain("#8a5a34", "#b98350", { size: 0.08, axis: "x", seed: 4 });
const WOOD_D = grain("#5a3a22", "#7a4e2c", { size: 0.08, axis: "y", seed: 5 });
const BRASS = "#e2b04a";
const BRASS_D = "#a8782a";
const CREAM = "#f4e6c4";
const TEAL = "#2f8f8a";
const GOLD = "#ffd36a";
const IRON = "#3a3f4c";
const CLOTH = paint((p, n) => {
  const s = Math.sin(p.x * 60) * Math.sin(p.z * 60);
  let c = mix("#3d5fa8", "#6f8fd8", smoothstep(0.3, 0.9, noise(p, 0.2, 3)));
  if (s > 0.6) c = mix(c, "#f4e6c4", 0.3);
  return mix(c, "#22305a", (1 - Math.max(0, n.y)) * 0.4);
});

const runeTex = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#ffd36a" stroke-width="5"/><path d="M50 18 L78 66 H22 Z" fill="none" stroke="#ffd36a" stroke-width="4"/><circle cx="50" cy="52" r="7" fill="#fff4c0"/><path d="M50 8V20M50 80V92M8 50H20M80 50H92" stroke="#ffd36a" stroke-width="4"/></svg>`,
  { size: 192 },
);
const labelTex = svg(
  `<svg viewBox="0 0 60 80"><rect x="3" y="3" width="54" height="74" rx="6" fill="#f4e6c4" stroke="#7a4e2c" stroke-width="4"/><path d="M30 18 L42 40 L30 62 L18 40Z" fill="none" stroke="#a8782a" stroke-width="4"/><circle cx="30" cy="40" r="4" fill="#a8782a"/></svg>`,
  { size: 128 },
);
const leafTex = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 C0 40 2 16 16 2 C30 16 32 40 16 62Z" fill="#6cb04a"/><path d="M16 62 C32 40 30 16 16 2Z" fill="#4a9040"/><path d="M16 60V8" stroke="#2f6a30" stroke-width="2.5"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "alchemistBench", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(9);

  const box = (n: string, s: V, at: V, c: any, rot?: V) =>
    b.part(new THREE.BoxGeometry(...s), c, { name: n, bone: root, at, rotation: rot, flat: true });
  const cyl = (n: string, rt: number, rb: number, h: number, at: V, c: any, seg = 10, rot?: V) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { name: n, bone: root, at, rotation: rot, flat: true });
  const sph = (n: string, r: number, at: V, c: any, sc?: V) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), c, { name: n, bone: root, at, scale: sc });

  // bench
  const TOP = 0.9;
  box("top", [2.0, 0.1, 0.9], [0, TOP - 0.05, 0], WOOD);
  box("topEdge", [2.04, 0.04, 0.94], [0, TOP - 0.12, 0], WOOD_D);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box("leg", [0.12, 0.78, 0.12], [sx * 0.9, 0.39, sz * 0.38], WOOD_D);
      box("legCap", [0.15, 0.06, 0.15], [sx * 0.9, 0.05, sz * 0.38], IRON);
    }
  box("stretcher", [1.8, 0.07, 0.07], [0, 0.25, 0.38], WOOD_D);
  box("stretcherB", [1.8, 0.07, 0.07], [0, 0.25, -0.38], WOOD_D);
  box("shelf", [1.7, 0.05, 0.7], [0, 0.3, 0], WOOD);
  // cloth runner
  box("runner", [0.8, 0.012, 0.5], [-0.35, TOP + 0.006, 0.1], CLOTH, [0, 4, 0]);
  box("runnerTrim", [0.8, 0.014, 0.03], [-0.35, TOP + 0.007, 0.36], BRASS, [0, 4, 0]);

  // back panel with shelf
  box("back", [2.0, 1.0, 0.08], [0, TOP + 0.6, -0.45], WOOD_D);
  box("backShelf", [1.9, 0.06, 0.24], [0, TOP + 0.62, -0.33], WOOD);
  for (const sx of [-1, 1]) box("shelfBracket", [0.05, 0.2, 0.2], [sx * 0.7, TOP + 0.5, -0.33], BRASS_D);
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: root, at: [0, TOP + 0.95, -0.402], dir: [0, 0, 1], axis: "z", texture: runeTex, name: "runeSeal" }), 1.2);

  // books stack
  const bookCols = ["#a8362e", "#2f6f8f", "#d9a43a", "#4a7a3a"];
  let y = TOP;
  bookCols.forEach((c, i) => {
    const h = 0.07 + (i % 2) * 0.02;
    const w = 0.42 - i * 0.03;
    const rot = (R() - 0.5) * 20;
    box(`bookCover${i}`, [w, h, 0.3], [-0.75, y + h / 2, -0.15], c, [0, rot, 0]);
    box(`bookPages${i}`, [w - 0.03, h - 0.025, 0.3 + 0.012], [-0.75, y + h / 2, -0.15], CREAM, [0, rot, 0]);
    box(`bookBand${i}`, [0.04, h + 0.004, 0.31], [-0.75 - w / 2 + 0.02, y + h / 2, -0.15], BRASS, [0, rot, 0]);
    y += h;
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: root, at: [-0.75, y + 0.004, -0.15], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: runeTex, name: "bookEmblem" });
  // open book
  box("openL", [0.3, 0.03, 0.4], [-0.15, TOP + 0.02, 0.15], "#7a2a2a", [0, 10, 4]);
  box("openR", [0.3, 0.03, 0.4], [0.15, TOP + 0.02, 0.12], "#7a2a2a", [0, 10, -4]);
  box("pagesL", [0.27, 0.02, 0.37], [-0.14, TOP + 0.04, 0.15], CREAM, [0, 10, 4]);
  box("pagesR", [0.27, 0.02, 0.37], [0.14, TOP + 0.04, 0.12], CREAM, [0, 10, -4]);

  // potions
  const flaskGeo = (r: number, h: number) =>
    new THREE.LatheGeometry(
      [[0, 0], [r, 0.01], [r * 1.05, h * 0.3], [r * 0.5, h * 0.55], [r * 0.25, h * 0.7], [r * 0.3, h], [0, h]].map(([x, yy]) => new THREE.Vector2(x, yy)),
      10,
    );
  const potion = (id: string, x: number, yb: number, z: number, r: number, h: number, col: string) => {
    b.part(flaskGeo(r, h), "#bfe8f0", { bone: root, at: [x, yb, z], name: id + "Glass" });
    glow(b.part(new THREE.SphereGeometry(r * 0.88, 9, 6), col, { bone: root, at: [x, yb + r * 0.9, z], scale: [1, 0.95, 1], name: id + "Liquid" }), 1.1);
    cyl(id + "Cork", r * 0.3, r * 0.26, h * 0.14, [x, yb + h * 1.02, z], "#c89a5e", 7);
    b.part(new THREE.PlaneGeometry(r * 1.0, r * 1.3), "#ffffff", { bone: root, at: [x, yb + r * 0.9, z + r * 1.02], dir: [0, 0, 1], axis: "z", texture: labelTex, name: id + "Label" });
  };
  potion("pA", 0.55, TOP, 0.25, 0.09, 0.26, "#ff5a8a");
  potion("pB", 0.75, TOP, 0.05, 0.07, 0.22, "#5ae8ff");
  potion("pC", 0.38, TOP, -0.15, 0.06, 0.2, "#9aff5a");
  potion("pD", 0.2, TOP + 0.62 + 0.03, -0.33, 0.06, 0.2, "#ffd34a");
  potion("pE", 0.45, TOP + 0.65, -0.33, 0.07, 0.22, "#b46aff");
  potion("pF", -0.3, TOP + 0.65, -0.33, 0.06, 0.2, "#ff9a3a");

  // alembic: brass stand, flask, tube
  cyl("burnerBase", 0.12, 0.14, 0.05, [0.85, TOP + 0.025, -0.1], IRON, 8);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    box("tripod", [0.02, 0.2, 0.02], [0.85 + Math.cos(a) * 0.09, TOP + 0.15, -0.1 + Math.sin(a) * 0.09], BRASS_D);
  }
  glow(b.part(new THREE.ConeGeometry(0.04, 0.1, 6), "#ff9a2a", { bone: root, at: [0.85, TOP + 0.1, -0.1], name: "burnerFlame" }), 1.6);
  b.part(new THREE.SphereGeometry(0.13, 10, 8), "#cfeef0", { bone: root, at: [0.85, TOP + 0.37, -0.1], name: "alembicFlask" });
  glow(b.part(new THREE.SphereGeometry(0.11, 9, 6), "#7aff9a", { bone: root, at: [0.85, TOP + 0.34, -0.1], scale: [1, 0.7, 1], name: "alembicLiquid" }), 1.0);
  cyl("alembicNeck", 0.035, 0.05, 0.14, [0.85, TOP + 0.54, -0.1], "#cfeef0", 8);
  b.sweep([[0.85, TOP + 0.6, -0.1], [0.95, TOP + 0.66, -0.1], [1.0, TOP + 0.5, -0.1]], 0.02, { color: BRASS, bone: root, sides: 6, name: "alembicTube" });
  for (let i = 0; i < 4; i++) sph("bubble", 0.014, [0.85 + (R() - 0.5) * 0.08, TOP + 0.62 + i * 0.05, -0.1], "#e8ffff");

  // scales
  const sx = 0.05;
  const sz = -0.2;
  cyl("scaleBase", 0.1, 0.12, 0.04, [sx, TOP + 0.02, sz], BRASS, 8);
  cyl("scalePost", 0.016, 0.02, 0.4, [sx, TOP + 0.24, sz], BRASS, 6);
  box("scaleBeam", [0.5, 0.025, 0.03], [sx, TOP + 0.44, sz], BRASS);
  sph("scaleTop", 0.03, [sx, TOP + 0.47, sz], GOLD);
  for (const s of [-1, 1]) {
    const px = sx + s * 0.24;
    const py = TOP + (s > 0 ? 0.2 : 0.26);
    for (const c of [-1, 1]) b.rod([px, TOP + 0.43, sz], [px + c * 0.06, py + 0.02, sz + c * 0.02], 0.004, { color: BRASS_D, bone: root, sides: 4 });
    b.lathe([[0, 0], [0.08, 0.02], [0.09, 0.03], [0, 0.015]], { at: [px, py, sz], segments: 10, color: BRASS, bone: root, name: "pan" });
  }
  sph("weight", 0.03, [sx - 0.24, TOP + 0.3, sz], IRON, [1, 0.8, 1]);
  sph("gem", 0.025, [sx + 0.24, TOP + 0.24, sz], "#ff5a8a");

  // mortar & pestle
  b.lathe([[0, 0], [0.07, 0], [0.1, 0.04], [0.11, 0.1], [0.095, 0.1], [0.08, 0.04], [0, 0.03]], { at: [-0.45, TOP, -0.2], segments: 10, color: "#8d93a0", bone: root, name: "mortar" });
  b.rod([-0.45, TOP + 0.04, -0.2], [-0.38, TOP + 0.22, -0.2], 0.018, { color: "#8d93a0", bone: root, sides: 6, name: "pestle" });
  sph("herbPaste", 0.07, [-0.45, TOP + 0.07, -0.2], "#6cb04a", [1, 0.3, 1]);

  // candle
  cyl("candle", 0.025, 0.028, 0.14, [-1.0, TOP + 0.07, 0.25], CREAM, 8);
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 5), "#ffb44a", { bone: root, at: [-1.0, TOP + 0.17, 0.25], scale: [0.7, 1.7, 0.7], name: "candleFlame" }), 1.5);

  // herbs hanging from the back shelf and bundles
  const bundle: THREE.BufferGeometry[] = [];
  for (const x of [-0.9, -0.6, 0.9]) {
    b.rod([x, TOP + 0.59, -0.3], [x, TOP + 0.98, -0.3], 0.005, { color: "#c9a468", bone: root, sides: 4, name: "herbString" });
  }
  void bundle;
  const frames = [] as ReturnType<typeof import("../../../../src/index").frame>[];
  const { frame } = require_frame();
  for (const x of [-0.9, -0.6, 0.9]) for (let k = 0; k < 7; k++) frames.push(frame([x + (R() - 0.5) * 0.05, TOP + 0.58, -0.3 + (R() - 0.5) * 0.05], [0, 1, 0]));
  b.cards(frames, leafTex, { size: [0.07, 0.3], lean: 180, flow: [0, 0, 1], vary: 0.3, spin: 180, rng: rng(2), bone: root, sink: 0 });
  // potted herb
  cyl("pot", 0.1, 0.07, 0.13, [1.0, TOP + 0.065, 0.25], "#c0623c", 9);
  sph("soil", 0.08, [1.0, TOP + 0.12, 0.25], "#4a2c18", [1, 0.25, 1]);
  const pf = [] as typeof frames;
  for (let k = 0; k < 9; k++) pf.push(frame([1.0 + (R() - 0.5) * 0.1, TOP + 0.13, 0.25 + (R() - 0.5) * 0.1], [0, 1, 0]));
  b.cards(pf, leafTex, { size: [0.08, 0.2], lean: 25, cross: true, vary: 0.3, spin: 180, rng: rng(3), bone: root });

  // teal trim on bench
  box("trimFront", [1.9, 0.03, 0.02], [0, TOP - 0.1, 0.47], TEAL);
  return b.root;
}

import { frame as _frame } from "../../../../src/index";
function require_frame() {
  return { frame: _frame };
}
void mergeGeometries;
