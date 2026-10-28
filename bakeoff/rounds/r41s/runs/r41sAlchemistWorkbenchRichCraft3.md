```ts
import * as THREE from "three";
import { createBuilder, frame, rng, grain, mottle, countershade, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "alchemist_workbench",
  description: "Genshin-style alchemist's workbench with glowing potions, books, brass scales, mortar, candle and hanging herbs.",
};

const T = 0.94; // table top surface height

export default function build() {
  const b = createBuilder({ name: "alchemist_workbench" });
  const R = rng(11);

  // palette
  const WOOD = cel(grain("#a8703a", "#c48c4e", { size: 0.03, axis: "x", seed: 3 }), "#6e4426");
  const WOOD_D = cel(grain("#7a4c28", "#935d32", { size: 0.03, axis: "y", seed: 5 }), "#4a2c1a");
  const GOLD = "#f2c75a";
  const GOLD_D = "#b8872e";
  const CREAM = "#f6ecd2";
  const TEAL = "#2fb6b0";
  const GLASS = "#d6f1f2";
  const CORK = "#c89a62";
  const BRASS = cel("#e4b64e", "#a1722a");
  const TERRA = cel(mottle("#c8693f", "#b05a36", { size: 0.05 }), "#7a3a28");
  const STONE = cel(mottle("#9aa0a8", "#bfc4ca", { size: 0.04 }), "#5d6478");
  const LEATHER = ["#7b2f3c", "#2d5a7a", "#3f6b45", "#6a4a8a"];

  // helpers
  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, color: any, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z] });
  const lathe = (o: any[], x: number, y: number, z: number, color: any, seg = 10) =>
    b.lathe(o, { at: [x, y, z], color, segments: seg, smoothing: 1 });

  // ---- textures
  const RUNE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#ffe9a0" stroke-width="5"/>
    <circle cx="50" cy="50" r="33" fill="none" stroke="#7fe8e0" stroke-width="3"/>
    <path d="M50 12 L84 68 L16 68Z" fill="none" stroke="#ffe9a0" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 88 L16 32 L84 32Z" fill="none" stroke="#7fe8e0" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="7" fill="#ffffff"/></svg>`, { size: 192 });
  const PAGES = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f3e6c4"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M8 ${10 + i * 5.5} H${30 + ((i * 7) % 24)}" stroke="#6a4a2a" stroke-width="1.6"/>`).join("")}
    <circle cx="44" cy="46" r="9" fill="none" stroke="#2f8f9a" stroke-width="2"/><path d="M44 38 L51 50 H37Z" fill="none" stroke="#b8872e" stroke-width="1.6"/></svg>`, { size: 128 });
  const LEAF = svg(
    `<svg viewBox="0 0 40 80"><path d="M20 78 C2 56 4 20 20 2 C36 20 38 56 20 78Z" fill="#4fae5a" stroke="#1f5a34" stroke-width="2.5"/>
    <path d="M20 76 V10" stroke="#a9e58a" stroke-width="2.5"/><path d="M20 55 L10 42 M20 40 L30 28 M20 28 L12 18" stroke="#a9e58a" stroke-width="1.8" fill="none"/></svg>`, { size: 128 });
  const LAV = svg(
    `<svg viewBox="0 0 30 80"><path d="M15 80 V30" stroke="#4a7a3a" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${i % 2 ? 10 : 20}" cy="${8 + i * 7}" rx="5.5" ry="5" fill="${i % 2 ? "#a47ae0" : "#c79af0"}" stroke="#5a3a8a" stroke-width="1.5"/>`).join("")}</svg>`, { size: 128 });

  // ---- bench
  b.part(new THREE.BoxGeometry(1.7, 0.08, 0.85), WOOD, { at: [0, T - 0.04, 0] });
  box(1.76, 0.03, 0.9, GOLD_D, 0, T - 0.095, 0);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.1, T - 0.1, 0.1), WOOD_D, { at: [sx * 0.76, (T - 0.1) / 2, sz * 0.36] });
      box(0.13, 0.05, 0.13, GOLD, sx * 0.76, 0.04, sz * 0.36);
    }
  box(1.5, 0.05, 0.7, WOOD_D, 0, 0.3, 0); // lower shelf
  box(1.5, 0.12, 0.04, WOOD, 0, T - 0.17, 0.4); // front apron
  box(1.5, 0.12, 0.04, WOOD, 0, T - 0.17, -0.4);
  box(1.62, 0.012, 0.012, GOLD, 0, T + 0.002, 0.43);
  b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", { at: [0, T - 0.17, 0.425], dir: [0, 0, 1], axis: "z", texture: RUNE });
  glow(b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", { at: [0, T - 0.17, 0.426], dir: [0, 0, 1], axis: "z", texture: RUNE }), 1.2);
  // under-shelf goods
  for (let i = 0; i < 3; i++) {
    cyl(0.09, 0.1, 0.2, TERRA, -0.5 + i * 0.22, 0.425, 0.05, 9);
    cyl(0.1, 0.1, 0.03, GOLD_D, -0.5 + i * 0.22, 0.54, 0.05, 9);
  }
  box(0.3, 0.2, 0.2, WOOD, 0.45, 0.425, 0, [0, 12, 0]);
  box(0.32, 0.03, 0.22, GOLD_D, 0.45, 0.54, 0, [0, 12, 0]);

  // ---- back rack
  for (const sx of [1, -1]) {
    box(0.08, 1.95, 0.08, WOOD_D, sx * 0.8, 0.975, -0.38);
    b.part(new THREE.ConeGeometry(0.07, 0.14, 4), GOLD, { at: [sx * 0.8, 1.99, -0.38] });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), TEAL, { at: [sx * 0.8, 1.92, -0.38] });
  }
  box(1.7, 0.06, 0.08, WOOD, 0, 1.82, -0.38); // herb bar
  box(1.7, 0.02, 0.09, GOLD, 0, 1.86, -0.38);
  box(1.56, 0.04, 0.2, WOOD, 0, 1.28, -0.38); // jar shelf
  box(1.56, 0.012, 0.21, GOLD, 0, 1.31, -0.38);
  box(1.56, 0.35, 0.02, WOOD_D, 0, 1.48, -0.43); // back panel

  // jars on shelf
  const jc = ["#ff7a8a", "#7ad8ff", "#ffd45a", "#9af07a", "#c79af0", "#ff9a5a"];
  jc.forEach((c, i) => {
    const x = -0.66 + i * 0.26;
    lathe([[0, 0], [0.07, 0], [0.085, 0.04], [0.085, 0.15], [0.06, 0.18], [0, 0.18]], x, 1.3, -0.38, GLASS, 8);
    glow(lathe([[0, 0.01], [0.062, 0.01], [0.075, 0.04], [0.075, 0.12], [0, 0.12]], x, 1.3, -0.38, c, 8), 0.8);
    cyl(0.055, 0.06, 0.04, CORK, x, 1.5, -0.38, 7);
    cyl(0.062, 0.062, 0.012, GOLD, x, 1.478, -0.38, 8);
  });

  // hanging herbs
  const hang: any[] = [];
  const lav: any[] = [];
  [-0.65, -0.3, 0.1, 0.5, 0.68].forEach((x, k) => {
    const len = 0.28 + (k % 2) * 0.08;
    b.rod([x, 1.8, -0.38], [x, 1.8 - 0.04, -0.38], 0.01, "#6a5030");
    cyl(0.014, 0.014, 0.1, "#7a5c34", x, 1.76, -0.38, 5);
    cyl(0.03, 0.03, 0.02, "#e8d8a8", x, 1.7, -0.38, 6); // twine
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const f = frame([x + Math.cos(a) * 0.015, 1.72, -0.38 + Math.sin(a) * 0.015], [0, 1, 0]);
      (k % 2 ? lav : hang).push({ f, a, len });
    }
  });
  const hangCards = (arr: any[], tex: any, w: number) =>
    b.cards(arr.map((o) => o.f), tex, {
      size: [w, 0.3], lean: 180, flow: (_f: any, i: number) => [Math.cos(arr[i].a) * 0.4, 0, Math.sin(arr[i].a) * 0.4 + 0.01],
      vary: 0.25, rng: R, cross: true,
    });
  hangCards(hang, LEAF, 0.1);
  hangCards(lav, LAV, 0.07);

  // ---- potions on the table
  const flask = (x: number, z: number, s: number, c: string, kind: number) => {
    const body =
      kind === 0
        ? [[0, 0], [0.07, 0.0], [0.11, 0.05], [0.11, 0.1], [0.07, 0.17], [0.03, 0.2], [0.03, 0.26], [0, 0.26]]
        : kind === 1
          ? [[0, 0], [0.12, 0], [0.1, 0.06], [0.04, 0.17], [0.03, 0.25], [0, 0.25]]
          : [[0, 0], [0.045, 0], [0.05, 0.03], [0.05, 0.2], [0.03, 0.22], [0, 0.22]];
    const sc = (a: number[][]) => a.map(([r, h]) => [r * s, h * s]);
    lathe(sc(body), x, T, z, GLASS, kind === 1 ? 6 : 9);
    const liq = kind === 0
      ? [[0, 0.01], [0.062, 0.01], [0.098, 0.05], [0.098, 0.1], [0.06, 0.15], [0, 0.15]]
      : kind === 1
        ? [[0, 0.01], [0.105, 0.01], [0.09, 0.06], [0.05, 0.13], [0, 0.13]]
        : [[0, 0.01], [0.04, 0.01], [0.044, 0.03], [0.044, 0.14], [0, 0.14]];
    glow(lathe(sc(liq), x, T, z, c, kind === 1 ? 6 : 9), 1);
    const top = (kind === 0 ? 0.26 : kind === 1 ? 0.25 : 0.22) * s;
    cyl(0.032 * s, 0.026 * s, 0.05 * s, CORK, x, T + top + 0.005, z, 7);
    cyl(0.036 * s, 0.036 * s, 0.012, GOLD, x, T + top - 0.025 * s, z, 8);
  };
  flask(-0.3, 0.1, 1.15, "#ff5f7a", 0);
  flask(-0.12, 0.18, 1, "#4fd8ff", 1);
  flask(-0.02, 0.0, 0.9, "#a6ff6a", 2);
  flask(0.15, 0.2, 0.8, "#ffd04a", 0);
  flask(0.2, -0.05, 1.1, "#c28aff", 2);
  // tiny vials in rack
  box(0.34, 0.03, 0.09, WOOD_D, -0.3, T + 0.015, -0.2);
  ["#ff9a5a", "#7affd0", "#ff7ad0", "#7aa0ff"].forEach((c, i) => flask(-0.42 + i * 0.08, -0.2, 0.55, c, 2));

  // ---- books stack (left, +X) and open book
  const stack = [[0.46, 0.07, 0.32, 0], [0.4, 0.06, 0.28, 8], [0.34, 0.055, 0.24, -6]];
  let sy = T;
  stack.forEach(([w, h, d, rot], i) => {
    const x = 0.62, z = 0.18;
    const ry = rot as number;
    box(w as number, h as number, d as number, LEATHER[i], x, sy + (h as number) / 2, z, [0, ry, 0]);
    b.part(new THREE.BoxGeometry((w as number) - 0.03, (h as number) - 0.02, (d as number) - 0.02), PAGES.userData ? "#f3e6c4" : "#fff", {
      at: [x + 0.012, sy + (h as number) / 2, z + 0.012], rotation: [0, ry, 0],
    });
    box((w as number) + 0.004, (h as number) + 0.004, 0.02, GOLD_D, x, sy + (h as number) / 2, z - (d as number) / 2 + 0.01, [0, ry, 0]);
    sy += h as number;
  });
  box(0.3, 0.012, 0.012, GOLD, 0.62, sy - 0.03, 0.18 + 0.12, [0, -6, 0]);
  // gem on top book
  glow(b.part(new THREE.OctahedronGeometry(0.035), "#5fe6ff", { at: [0.62, sy + 0.04, 0.18], flat: true }), 1.3);
  // lectern + open book
  box(0.5, 0.04, 0.3, WOOD_D, 0.05, T + 0.02, -0.18);
  box(0.4, 0.03, 0.26, "#7b2f3c", 0.05, T + 0.055, -0.18);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.19, 0.016, 0.24), "#ffffff", { at: [0.05 + s * 0.095, T + 0.085, -0.18], rotation: [0, 0, -s * 8], texture: PAGES });
    b.part(new THREE.BoxGeometry(0.2, 0.01, 0.255), GOLD_D, { at: [0.05 + s * 0.098, T + 0.075, -0.18], rotation: [0, 0, -s * 8] });
  }

  // ---- brass scales (right, -X)
  const sx0 = -0.58, sz0 = 0.15;
  lathe([[0, 0], [0.12, 0], [0.12, 0.025], [0.06, 0.05], [0.03, 0.1], [0, 0.1]], sx0, T, sz0, BRASS, 8);
  b.rod([sx0, T + 0.08, sz0], [sx0, T + 0.4, sz0], 0.016, BRASS);
  b.part(new THREE.OctahedronGeometry(0.035), GOLD, { at: [sx0, T + 0.43, sz0], flat: true });
  b.part(new THREE.BoxGeometry(0.62, 0.025, 0.03), BRASS, { at: [sx0, T + 0.38, sz0], rotation: [0, 0, 4] });
  for (const s of [1, -1]) {
    const ex = sx0 + s * 0.3;
    const ey = T + 0.38 - s * 0.3 * Math.tan((4 * Math.PI) / 180) * -1;
    const py = T + 0.12 + (s > 0 ? 0.02 : -0.0);
    lathe([[0, 0], [0.09, 0.035], [0.1, 0.045], [0.09, 0.05], [0.08, 0.04], [0, 0.015]], ex, py, sz0, BRASS, 9);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      b.rod([ex, ey, sz0], [ex + Math.cos(a) * 0.09, py + 0.045, sz0 + Math.sin(a) * 0.09], 0.004, GOLD_D);
    }
    b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD, { at: [ex, ey, sz0] });
  }
  [0, 1, 2].forEach((i) => cyl(0.018 - i * 0.003, 0.02 - i * 0.003, 0.02 + i * 0.006, GOLD, sx0 - 0.3 + (i - 1) * 0.035, T + 0.17, sz0 + (i % 2) * 0.02, 8));
  glow(b.part(new THREE.IcosahedronGeometry(0.03, 0), "#ff6acb", { at: [sx0 + 0.3, T + 0.175, sz0], flat: true }), 1.3);

  // ---- mortar & pestle
  lathe([[0, 0], [0.06, 0], [0.09, 0.03], [0.11, 0.1], [0.1, 0.1], [0.08, 0.04], [0, 0.03]], -0.38, T, -0.12, STONE, 10);
  b.rod([-0.38, T + 0.06, -0.12], [-0.33, T + 0.2, -0.1], [0.018, 0.026], STONE);
  glow(lathe([[0, 0.04], [0.07, 0.07], [0.09, 0.09], [0, 0.09]], -0.38, T, -0.12, "#8aff8a", 9), 0.7);

  // ---- candle
  lathe([[0, 0], [0.07, 0], [0.08, 0.015], [0.05, 0.02], [0, 0.02]], 0.2, T, -0.12, BRASS, 9);
  cyl(0.03, 0.03, 0.14, CREAM, 0.2, T + 0.09, -0.12, 8);
  cyl(0.034, 0.03, 0.02, "#e8d8b0", 0.2, T + 0.17, -0.12, 8);
  glow(b.part(new THREE.ConeGeometry(0.02, 0.07, 6), "#ffd060", { at: [0.2, T + 0.215, -0.12] }), 1.6);

  // ---- potted plant (front-left)
  lathe([[0, 0], [0.06, 0], [0.09, 0.12], [0.1, 0.12], [0.1, 0.14], [0.07, 0.14], [0, 0.12]], 0.25, T, 0.3, TERRA, 9);
  const pf: any[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    pf.push({ f: frame([0.25 + Math.cos(a) * 0.03, T + 0.13, 0.3 + Math.sin(a) * 0.03], [0, 1, 0]), a });
  }
  b.cards(pf.map((o) => o.f), LEAF, {
    size: [0.09, 0.2], lean: 40, bend: 30, vary: 0.25, rng: R, cross: true,
    flow: (_f: any, i: number) => [Math.cos(pf[i].a), 0, Math.sin(pf[i].a)],
  });
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), "#ffe27a", { at: [0.25, T + 0.3, 0.3] }), 1.2);

  // drying herbs on tabletop
  const bt = [0, 1, 2].map((i) => ({ f: frame([-0.02 + i * 0.02, T + 0.005, 0.38], [0, 1, 0]) }));
  b.cards(bt.map((o) => o.f), LAV, { size: [0.06, 0.16], lean: 90, flow: [1, 0, 0.3], mirror: true, vary: 0.2, rng: R });

  return b.root;
}
```