```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { mottle, grain } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description:
    "A cel-shaded roadside shrine: vermilion torii, hokora with shimenawa and shide, stone lanterns, glowing paper lanterns, kitsune guardians, offering box, sake and dango offerings.",
};

export default function build() {
  const b = createBuilder({ name: "roadside_shrine" });
  const R = rng(11);

  // ---------- palette ----------
  const VERM = cel("#d9402e", "#a82a35");
  const BLACK = cel("#2b2536", "#1a1524");
  const GOLD = cel("#f0c04a", "#c08a2e");
  const PLASTER = cel("#f3ead6", "#cdbfd0");
  const ROOF = cel("#54467a", "#352c58");
  const WOOD = cel(grain("#7a5236", "#5a3a28", { size: 0.03, axis: "y" }), "#3e2a2c");
  const STONE = cel(mottle("#bdb9b0", "#8e9a98", { size: 0.18, seed: 4 }), "#6d7284");
  const STONE_DARK = cel(mottle("#9a978f", "#76847f", { size: 0.14, seed: 8 }), "#555b70");
  const STRAW = cel(grain("#e2c982", "#b99a52", { size: 0.012, axis: "x" }), "#a07c48");
  const PAD = cel(mottle("#a9a59c", "#857f78", { size: 0.25, seed: 2 }), "#60607a");
  const PAPER = "#fbf7ec";
  const FLAME = "#ffc65a";

  // ---------- helpers ----------
  const G = 0.1; // pad top
  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { at: [x, y, z], rotation: rot });
  const ball = (r: number, col: any, x: number, y: number, z: number, sc: [number, number, number] = [1, 1, 1], ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), col, { at: [x, y, z], scale: sc });

  // ---------- textures ----------
  const SIGIL = svg(
    `<svg viewBox="0 0 64 80"><rect x="2" y="2" width="60" height="76" rx="4" fill="#23202e" stroke="#f0c04a" stroke-width="4"/>
    <circle cx="32" cy="40" r="20" fill="none" stroke="#f0c04a" stroke-width="3"/>
    <path d="M36 14 L22 44 L32 44 L26 66 L44 34 L33 34 Z" fill="#b48cff" stroke="#f0c04a" stroke-width="2" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
  const LANTERN_TEX = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#ff5a3a"/>
    <rect y="0" width="128" height="9" fill="#ffb15a"/><rect y="55" width="128" height="9" fill="#ffb15a"/>
    <g fill="none" stroke="#ffe9b0" stroke-width="2.5" opacity=".6"><path d="M0 18H128M0 46H128"/></g>
    <g transform="translate(32 32)"><circle r="17" fill="#fff0c8"/><path d="M4 -14 L-8 3 L0 3 L-4 14 L9 -4 L1 -4 Z" fill="#c0392b"/></g>
    <g transform="translate(96 32)"><circle r="17" fill="#fff0c8"/><path d="M4 -14 L-8 3 L0 3 L-4 14 L9 -4 L1 -4 Z" fill="#c0392b"/></g></svg>`,
    { size: 256 },
  );
  const SHOJI = svg(
    `<svg viewBox="0 0 64 80"><rect width="64" height="80" fill="#fff6dc"/>
    <g stroke="#6a4630" stroke-width="2.2"><path d="M0 0H64M0 20H64M0 40H64M0 60H64M0 79H64"/><path d="M1 0V80M16 0V80M32 0V80M48 0V80M63 0V80"/></g>
    <circle cx="32" cy="40" r="9" fill="#d9402e" opacity=".85"/></svg>`,
    { size: 192 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 L30 10 L12 20 L28 30 L8 42 L24 54 L10 64 L6 50 L20 40 L4 30 L18 20 L2 10 Z" fill="#ffffff" stroke="#cfc6dc" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    { size: 96 },
  );
  const PETAL = svg(`<svg viewBox="0 0 32 32"><path d="M16 30 Q2 18 8 4 Q16 10 16 14 Q16 10 24 4 Q30 18 16 30Z" fill="#ffb7cf"/></svg>`, { size: 64 });
  const EMA = svg(
    `<svg viewBox="0 0 48 56"><path d="M24 2 L46 14 V54 H2 V14Z" fill="#c99a62" stroke="#5a3a28" stroke-width="3"/>
    <circle cx="24" cy="32" r="12" fill="#fff0c8"/><path d="M26 22 L17 34 L24 34 L21 44 L32 30 L25 30Z" fill="#8a5cd0"/></svg>`,
    { size: 96 },
  );
  const TAG = svg(`<svg viewBox="0 0 32 48"><rect x="1" y="1" width="30" height="46" rx="3" fill="#f6efe0" stroke="#2b2536" stroke-width="2"/><circle cx="16" cy="24" r="8" fill="#d9402e"/></svg>`, { size: 64 });

  // ---------- ground pad and path ----------
  box(5.0, G, 4.2, PAD, 0, G / 2, 0.3);
  for (let i = 0; i < 5; i++) box(0.9 + (i % 2) * 0.08, 0.04, 0.45, STONE, (i % 2) * 0.05 - 0.02, G + 0.02, 1.0 + i * 0.28 + (i > 0 ? 0.0 : 0), [0, 0, 0]);

  // ---------- torii ----------
  const TZ = 2.0;
  for (const s of [1, -1]) {
    cyl(0.17, 0.2, 0.22, 8, BLACK, s * 1.1, G + 0.11, TZ);
    cyl(0.115, 0.14, 3.0, 10, VERM, s * 1.1, G + 1.6, TZ);
    cyl(0.125, 0.125, 0.12, 10, BLACK, s * 1.1, G + 2.36, TZ);
    cyl(0.15, 0.15, 0.08, 10, GOLD, s * 1.1, G + 0.24, TZ);
  }
  box(3.0, 0.16, 0.16, VERM, 0, G + 2.35, TZ); // nuki
  box(2.5, 0.22, 0.2, VERM, 0, G + 2.97, TZ); // lower beam
  box(0.5, 0.5, 0.06, "#ffffff", 0, G + 2.62, TZ + 0.0);
  b.extrude(
    [[-1.9, 0.1], [-1, 0], [1, 0], [1.9, 0.1], [2.15, 0.34, "sharp"], [1, 0.18], [-1, 0.18], [-2.15, 0.34, "sharp"]],
    { at: [0, G + 3.1, TZ], x: [1, 0, 0], thickness: 0.34, color: BLACK },
  );
  box(3.9, 0.07, 0.3, VERM, 0, G + 3.08, TZ);
  b.part(new THREE.PlaneGeometry(0.4, 0.5), "#ffffff", { at: [0, G + 2.68, TZ + 0.11], dir: [0, 0, 1], axis: "z", texture: SIGIL });
  b.part(new THREE.PlaneGeometry(0.4, 0.5), "#ffffff", { at: [0, G + 2.68, TZ - 0.11], dir: [0, 0, -1], axis: "z", texture: SIGIL });
  box(0.46, 0.56, 0.18, GOLD, 0, G + 2.68, TZ);
  // hanging paper lanterns on the torii
  const paperLantern = (x: number, y: number, z: number, sc = 1) => {
    cyl(0.01, 0.01, 0.2 * sc, 4, BLACK, x, y + 0.3 * sc, z);
    cyl(0.1 * sc, 0.13 * sc, 0.05 * sc, 8, BLACK, x, y + 0.2 * sc, z);
    glow(
      b.part(new THREE.SphereGeometry(0.19 * sc, 10, 8), "#ffffff", {
        at: [x, y, z], scale: [1, 1.25, 1], rotation: [0, -90, 0], texture: LANTERN_TEX,
      }),
      1.1,
    );
    cyl(0.13 * sc, 0.1 * sc, 0.05 * sc, 8, BLACK, x, y - 0.22 * sc, z);
    const tf = [frame([x, y - 0.24 * sc, z], [0, 1, 0])];
    b.cards(tf, TAG, { size: [0.05 * sc, 0.12 * sc], lean: 180, flow: [0, 0, 1], color: "#ffffff" });
  };
  paperLantern(0.62, G + 2.0, TZ, 1);
  paperLantern(-0.62, G + 2.0, TZ, 1);
  paperLantern(0, G + 2.0, TZ - 0.0, 0.0001 + 0.001);

  // ---------- shrine ----------
  const SZ = -0.8;
  const P = G + 0.3;
  box(2.1, 0.3, 1.8, STONE, 0, G + 0.15, SZ);
  box(2.2, 0.06, 1.9, STONE_DARK, 0, G + 0.03 + 0.0, SZ - 0.0, [0, 0, 0]);
  box(1.3, 0.15, 0.4, STONE, 0, G + 0.075, SZ + 1.15);
  box(1.35, 0.9, 0.95, PLASTER, 0, P + 0.5, SZ);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.11, 1.05, 0.11, VERM, sx * 0.7, P + 0.52, SZ + sz * 0.48);
  box(1.55, 0.1, 1.2, VERM, 0, P + 1.05, SZ);
  box(1.5, 0.06, 1.1, GOLD, 0, P + 1.12, SZ);
  b.part(new THREE.PlaneGeometry(0.8, 0.78), "#ffffff", { at: [0, P + 0.46, SZ + 0.48], dir: [0, 0, 1], axis: "z", texture: SHOJI });
  box(0.9, 0.06, 0.06, VERM, 0, P + 0.89, SZ + 0.5);
  box(0.9, 0.06, 0.06, VERM, 0, P + 0.04, SZ + 0.5);
  for (const s of [1, -1]) box(0.06, 0.85, 0.06, VERM, s * 0.43, P + 0.46, SZ + 0.5);
  // roof
  b.extrude(
    [[-1.3, 0, "sharp"], [1.3, 0, "sharp"], [0.95, 0.1], [0.45, 0.36], [0.13, 0.66, "sharp"], [-0.13, 0.66, "sharp"], [-0.45, 0.36], [-0.95, 0.1]],
    { at: [0, P + 1.14, SZ], x: [0, 0, 1], thickness: 2.0, color: ROOF },
  );
  box(2.1, 0.06, 1.65, GOLD, 0, P + 1.14, SZ);
  cyl(0.07, 0.07, 2.1, 8, GOLD, 0, P + 1.82, SZ, [0, 0, 90]);
  for (const s of [1, -1]) {
    ball(0.1, GOLD, s * 1.05, P + 1.82, SZ, [1, 1, 1]);
    for (const sz of [1, -1]) cyl(0.025, 0.025, 0.5, 5, GOLD, s * 0.0 + 0.0, P + 1.98, SZ + sz * 0.85, [sz * 30 + 0, 0, s * 25]);
  }
  for (let i = 0; i < 3; i++) cyl(0.03, 0.03, 0.34, 6, WOOD, -0.5 + i * 0.5, P + 1.9, SZ, [90, 0, 0]);
  // shimenawa across the front
  const rope = catmull([[-0.85, P + 0.98, SZ + 0.6], [-0.4, P + 0.88, SZ + 0.64], [0, P + 0.86, SZ + 0.65], [0.4, P + 0.88, SZ + 0.64], [0.85, P + 0.98, SZ + 0.6]]);
  b.sweep(rope, 0.04, { color: STRAW, sides: 6 });
  const fr: any[] = [];
  for (let i = 0; i < 6; i++) fr.push(frame(rope.at(0.1 + i * 0.16), [0, 1, 0]));
  b.cards(fr, SHIDE, { size: [0.1, 0.24], lean: 180, flow: [0, 0, 1], color: "#ffffff" });
  for (const s of [1, -1]) cyl(0.05, 0.05, 0.08, 6, STRAW, s * 0.88, P + 0.98, SZ + 0.6, [0, 0, 90]);
  // lanterns on the eaves
  paperLantern(0.62, P + 0.6, SZ + 0.9, 0.8);
  paperLantern(-0.62, P + 0.6, SZ + 0.9, 0.8);
  // inner shrine glow
  glow(box(0.5, 0.5, 0.02, FLAME, 0, P + 0.46, SZ + 0.46), 0.8);

  // ---------- offering box ----------
  const OZ = 1.15;
  box(0.8, 0.46, 0.42, WOOD, 0, G + 0.23, OZ);
  for (const sx of [1, -1]) box(0.06, 0.5, 0.46, BLACK, sx * 0.4, G + 0.25, OZ);
  for (let i = 0; i < 7; i++) box(0.08, 0.04, 0.4, BLACK, -0.3 + i * 0.1, G + 0.5, OZ);
  box(0.84, 0.05, 0.08, GOLD, 0, G + 0.5, OZ + 0.2);
  b.part(new THREE.PlaneGeometry(0.3, 0.2), "#ffffff", { at: [0, G + 0.25, OZ + 0.215], dir: [0, 0, 1], axis: "z", texture: SIGIL });
  for (let i = 0; i < 3; i++) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 8), GOLD, { at: [-0.1 + i * 0.1, G + 0.525 + i * 0.006, OZ + 0.1], rotation: [0, 0, 0] });

  // ---------- stone lanterns ----------
  const stoneLantern = (x: number, z: number) => {
    b.lathe([[0, 0], [0.3, 0], [0.3, 0.06], [0.22, 0.1], [0, 0.1]], { at: [x, G, z], segments: 6, color: STONE_DARK });
    cyl(0.07, 0.08, 0.5, 6, STONE, x, G + 0.35, z);
    b.lathe([[0, 0], [0.26, 0], [0.18, 0.06], [0.1, 0.06], [0, 0.06]], { at: [x, G + 0.6, z], segments: 6, color: STONE });
    b.lathe([[0, 0], [0.2, 0], [0.2, 0.04], [0.22, 0.06], [0, 0.06]], { at: [x, G + 0.66, z], segments: 6, color: STONE_DARK });
    glow(box(0.21, 0.2, 0.21, FLAME, x, G + 0.8, z), 1.2);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) cyl(0.025, 0.025, 0.22, 5, STONE, x + sx * 0.11, G + 0.8, z + sz * 0.11);
    b.lathe([[0, 0], [0.34, 0], [0.34, 0.03], [0.14, 0.2], [0.05, 0.3], [0, 0.3]], { at: [x, G + 0.9, z], segments: 6, color: STONE_DARK });
    ball(0.06, STONE, x, G + 1.24, z);
    cyl(0.01, 0.045, 0.1, 6, GOLD, x, G + 1.32, z);
  };
  stoneLantern(1.6, 1.0);
  stoneLantern(-1.6, 1.0);
  stoneLantern(1.75, -1.0);
  stoneLantern(-1.75, -1.0);

  // ---------- fox guardians ----------
  const fox = (x: number, z: number) => {
    const Y = G + 0.3;
    box(0.46, 0.3, 0.46, STONE_DARK, x, G + 0.15, z);
    box(0.5, 0.05, 0.5, STONE, x, G + 0.3, z);
    const Z = z - 0.02;
    ball(0.17, STONE, x, Y + 0.18, Z - 0.08, [1, 1.1, 1.2]);
    ball(0.13, STONE, x, Y + 0.3, Z + 0.06, [1, 1.2, 1]);
    for (const s of [1, -1]) box(0.06, 0.28, 0.07, STONE, s * 0.06 + x, Y + 0.17, Z + 0.15);
    cyl(0.08, 0.1, 0.18, 7, STONE, x, Y + 0.45, Z + 0.07);
    ball(0.1, STONE, x, Y + 0.58, Z + 0.1, [1, 0.95, 1], 8, 6);
    b.part(new THREE.ConeGeometry(0.06, 0.12, 5), STONE, { at: [x, Y + 0.57, Z + 0.22], rotation: [90, 0, 0] });
    ball(0.016, BLACK, x, Y + 0.57, Z + 0.285);
    for (const s of [1, -1]) {
      b.part(new THREE.ConeGeometry(0.045, 0.14, 4), STONE, { at: [x + s * 0.06, Y + 0.7, Z + 0.07], rotation: [0, 0, -s * 8] });
      b.part(new THREE.SphereGeometry(0.018, 5, 4), "#f2b630", { at: [x + s * 0.045, Y + 0.6, Z + 0.185] });
    }
    b.part(new THREE.TorusGeometry(0.095, 0.025, 5, 9), VERM, { at: [x, Y + 0.42, Z + 0.07], rotation: [90, 0, 0] });
    ball(0.035, GOLD, x, Y + 0.38, Z + 0.17);
    const tail = catmull([[x, Y + 0.1, Z - 0.22], [x, Y + 0.12, Z - 0.4], [x, Y + 0.35, Z - 0.42], [x, Y + 0.55, Z - 0.3]]);
    b.sweep(tail, [0.08, 0.02], { color: STONE, sides: 6 });
  };
  fox(1.0, 0.55);
  fox(-1.0, 0.55);

  // ---------- offerings: stone table with sake, fruit, dango ----------
  const TXc = -1.85, TZc = 0.1;
  box(0.9, 0.06, 0.55, WOOD, TXc, G + 0.5, TZc);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.06, 0.5, 0.06, WOOD, TXc + sx * 0.38, G + 0.25, TZc + sz * 0.2);
  box(0.8, 0.02, 0.45, "#fff3da", TXc, G + 0.54, TZc);
  // sake bottle
  cyl(0.06, 0.07, 0.22, 8, "#6fa6a0", TXc - 0.28, G + 0.66, TZc);
  cyl(0.025, 0.04, 0.12, 8, "#6fa6a0", TXc - 0.28, G + 0.83, TZc);
  b.part(new THREE.CylinderGeometry(0.0725, 0.0725, 0.09, 8), PAPER, { at: [TXc - 0.28, G + 0.66, TZc] });
  cyl(0.03, 0.03, 0.03, 8, VERM, TXc - 0.28, G + 0.9, TZc);
  for (const dx of [-0.08, 0.04]) {
    cyl(0.04, 0.025, 0.04, 8, "#f6efe0", TXc + dx, G + 0.58, TZc - 0.12);
    glow(cyl(0.034, 0.034, 0.004, 8, "#f6dd8a", TXc + dx, G + 0.6, TZc - 0.12), 0.4);
  }
  // oranges on a stand
  cyl(0.12, 0.09, 0.05, 8, BLACK, TXc + 0.2, G + 0.58, TZc + 0.05);
  for (const [dx, dz, dy] of [[-0.05, 0, 0], [0.05, 0.02, 0], [0, -0.06, 0], [0, 0, 0.09]] as number[][]) {
    ball(0.055, "#f58a2a", TXc + 0.2 + dx, G + 0.66 + dy, TZc + 0.05 + dz);
    ball(0.012, "#4c8a3a", TXc + 0.2 + dx, G + 0.715 + dy, TZc + 0.05 + dz);
  }
  // dango sticks
  for (let k = 0; k < 2; k++) {
    const dx = TXc + 0.32 + k * 0.05, dz = TZc - 0.14;
    cyl(0.006, 0.006, 0.3, 4, WOOD, dx, G + 0.7, dz);
    ["#f5a6c4", "#fbf7ec", "#8fd08a"].forEach((c, i) => ball(0.038, c, dx, G + 0.6 + i * 0.07, dz, [1, 0.9, 1]));
  }
  // rice mound
  b.part(new THREE.ConeGeometry(0.07, 0.08, 7), "#ffffff", { at: [TXc - 0.05, G + 0.62, TZc + 0.14] });
  cyl(0.08, 0.06, 0.04, 8, "#c0392b", TXc - 0.05, G + 0.58, TZc + 0.14);

  // ---------- ema rack ----------
  const EXc = 1.85, EZc = -0.35;
  for (const s of [1, -1]) cyl(0.04, 0.045, 1.1, 6, WOOD, EXc + s * 0.5, G + 0.55, EZc);
  box(1.2, 0.06, 0.08, BLACK, EXc, G + 1.12, EZc);
  box(1.14, 0.04, 0.05, WOOD, EXc, G + 0.6, EZc);
  b.part(new THREE.BoxGeometry(1.0, 0.45, 0.02), ROOF, { at: [EXc, G + 0.85, EZc - 0.03] });
  const emaPos = [-0.4, -0.2, 0, 0.2, 0.4];
  emaPos.forEach((dx, i) => {
    cyl(0.003, 0.003, 0.08, 3, STRAW, EXc + dx, G + 1.07, EZc + 0.02);
    b.part(new THREE.PlaneGeometry(0.15, 0.17), "#ffffff", { at: [EXc + dx, G + 0.94 - (i % 2) * 0.03, EZc + 0.03], dir: [0, 0, 1], axis: "z", texture: EMA });
    b.part(new THREE.PlaneGeometry(0.15, 0.17), "#ffffff", { at: [EXc + dx, G + 0.94 - (i % 2) * 0.03, EZc + 0.025], dir: [0, 0, -1], axis: "z", texture: EMA });
  });

  // ---------- fallen petals ----------
  const pf: any[] = [];
  for (let i = 0; i < 40; i++) pf.push(frame([(R() - 0.5) * 4.4, G + 0.003, -1.4 + R() * 3.4], [0, 1, 0]));
  b.cards(pf, PETAL, { size: 0.07, lean: 90, mirror: true, flow: (_f: any, i: number) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)], vary: 0.3, rng: rng(5) });
  void INK;

  return b.root;
}
```