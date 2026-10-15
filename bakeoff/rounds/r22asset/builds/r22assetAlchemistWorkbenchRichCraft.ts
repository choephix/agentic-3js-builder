import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded alchemist's bench with gold-trimmed drawers, glowing elemental potions, a bubbling cauldron, brass scales, an alembic, open grimoire, shelves of books and jars, and hanging herb bundles.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Col = string | Paint;

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench" });
  const root = b.joint("base", { at: [0, 0, 0] });
  const rnd = rng(11);
  const Y = 0.9; // bench top surface

  // ---- palette ----
  const WOOD = cel(grain("#a0704a", "#885836", { size: 0.02, axis: "x" }));
  const WOOD_D = cel(grain("#744a2c", "#603a20", { size: 0.02, axis: "y" }));
  const GOLD = cel("#f6c94c", "#c98a1e");
  const BRASS = cel("#e3ad3f", "#a8721f");
  const TEAL = cel("#2f93a0");
  const NAVY = cel("#2e3f72");
  const CREAM = cel("#fbf0d2", "#e3cfa5");
  const RED = cel("#c9484e");
  const PURPLE = cel("#7d58bd");
  const GREEN = cel("#4f9e4a");
  const TAN = cel("#d9a95a");
  const STONE = cel(mottle("#bdb7aa", "#a09a8d", { size: 0.03 }));
  const IRON = cel("#3d435c", "#282c42");
  const GLASS = cel("#d3f0f6", "#a7cbe2");
  const STRAW = cel(grain("#dcb56b", "#bb8f46", { size: 0.012, axis: "y" }));
  const CLAY = cel("#c9703f", "#9c4a2c");
  const CRYO = "#5ee6ff";
  const PYRO = "#ff7a3d";
  const DENDRO = "#7dff6a";
  const ELECTRO = "#c27bff";
  const GEO = "#ffd75e";
  const PINK = "#ff6fa8";

  // ---- textures ----
  const LABEL = svg(
    `<svg viewBox="0 0 40 40"><rect x="2" y="2" width="36" height="36" rx="6" fill="#fbf0d2" stroke="#c98a1e" stroke-width="3"/><path d="M20 9 L28 22 L20 31 L12 22 Z" fill="none" stroke="#7a3d2b" stroke-width="2.5"/><circle cx="20" cy="21" r="3" fill="#7a3d2b"/></svg>`,
    { size: 128 },
  );
  const LEAF_T = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 L16 8" stroke="#3f7a32" stroke-width="2.4" fill="none"/><ellipse cx="16" cy="9" rx="5" ry="9" fill="#6bbf55"/><ellipse cx="7" cy="26" rx="6" ry="10" fill="#5aa84a" transform="rotate(-30 7 26)"/><ellipse cx="25" cy="30" rx="6" ry="10" fill="#79cc60" transform="rotate(30 25 30)"/><ellipse cx="8" cy="44" rx="5" ry="9" fill="#6bbf55" transform="rotate(-28 8 44)"/><ellipse cx="24" cy="48" rx="5" ry="9" fill="#5aa84a" transform="rotate(28 24 48)"/></svg>`,
    { size: 128 },
  );
  const LAV_T = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 L16 12" stroke="#5c8a3c" stroke-width="2.4" fill="none"/><ellipse cx="16" cy="9" rx="4" ry="7" fill="#a87be0"/><ellipse cx="12" cy="20" rx="4" ry="6" fill="#9468d4"/><ellipse cx="20" cy="22" rx="4" ry="6" fill="#b08ae8"/><ellipse cx="12" cy="32" rx="4" ry="6" fill="#a87be0"/><ellipse cx="20" cy="34" rx="4" ry="6" fill="#9468d4"/><ellipse cx="16" cy="44" rx="4" ry="6" fill="#b08ae8"/></svg>`,
    { size: 128 },
  );
  const PAGE_L = svg(
    `<svg viewBox="0 0 60 80"><rect width="60" height="80" fill="#fbf0d2"/><circle cx="9" cy="9" r="5" fill="none" stroke="#b5412f" stroke-width="1.6"/><path d="M18 8 H54 M18 14 H50 M6 24 H54 M6 30 H52 M6 36 H54 M6 42 H46 M6 48 H54 M6 54 H50 M6 60 H54 M6 66 H44" stroke="#6b4a2b" stroke-width="1.6" fill="none"/></svg>`,
    { size: 240 },
  );
  const PAGE_R = svg(
    `<svg viewBox="0 0 60 80"><rect width="60" height="80" fill="#fbf0d2"/><circle cx="30" cy="26" r="17" fill="none" stroke="#c98a1e" stroke-width="2"/><path d="M30 10 L43 33 L17 33 Z" fill="none" stroke="#7d58bd" stroke-width="1.8"/><path d="M30 42 L17 19 L43 19 Z" fill="none" stroke="#2f93a0" stroke-width="1.8"/><circle cx="30" cy="26" r="3" fill="#b5412f"/><path d="M30 76 V58" stroke="#3f7a32" stroke-width="2"/><ellipse cx="25" cy="62" rx="5" ry="3" fill="#5aa84a"/><ellipse cx="35" cy="66" rx="5" ry="3" fill="#6bbf55"/><path d="M6 52 H54 M6 72 H20 M40 72 H54" stroke="#6b4a2b" stroke-width="1.6" fill="none"/></svg>`,
    { size: 240 },
  );
  const BACK_T = svg(
    `<svg viewBox="0 0 200 100"><rect width="200" height="100" fill="#4f3220"/><path d="M0 0 L200 100 M0 100 L200 0 M0 50 L100 0 L200 50 L100 100 Z M50 25 L50 75 M150 25 L150 75" stroke="#d9a63a" stroke-width="0.9" fill="none" opacity="0.55"/><circle cx="100" cy="50" r="12" fill="none" stroke="#f6c94c" stroke-width="1.1"/><circle cx="100" cy="50" r="4" fill="#f6c94c"/><circle cx="25" cy="50" r="6" fill="none" stroke="#f6c94c" stroke-width="1"/><circle cx="175" cy="50" r="6" fill="none" stroke="#f6c94c" stroke-width="1"/></svg>`,
    { size: 1024 },
  );
  const CLOTH_T = svg(
    `<svg viewBox="0 0 100 32"><rect width="100" height="32" fill="#2f93a0"/><path d="M0 4 H100 M0 28 H100" stroke="#f6c94c" stroke-width="1.6"/><path d="M10 16 L20 8 L30 16 L20 24 Z M40 16 L50 8 L60 16 L50 24 Z M70 16 L80 8 L90 16 L80 24 Z" fill="none" stroke="#f6c94c" stroke-width="1.4"/><circle cx="20" cy="16" r="2" fill="#f6c94c"/><circle cx="50" cy="16" r="2" fill="#f6c94c"/><circle cx="80" cy="16" r="2" fill="#f6c94c"/></svg>`,
    { size: 512 },
  );

  // ---- helpers ----
  const P = (g: THREE.BufferGeometry, c: Col, at: number[], o: PartOptions = {}) =>
    b.part(g, c, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, c: Col, at: number[], rot?: number[]) =>
    P(new THREE.BoxGeometry(w, h, d), c, at, rot ? { rotation: rot } : {});
  const cyl = (rt: number, rb: number, h: number, c: Col, at: number[], seg = 8, rot?: number[]) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, rot ? { rotation: rot } : {});
  const sph = (r: number, c: Col, at: number[], scale?: number[]) =>
    P(new THREE.SphereGeometry(r, 8, 6), c, at, scale ? { scale } : {});
  const cone = (r: number, h: number, c: Col, at: number[], seg = 6, rot?: number[]) =>
    P(new THREE.ConeGeometry(r, h, seg), c, at, rot ? { rotation: rot } : {});
  const label = (w: number, at: number[]) =>
    P(new THREE.PlaneGeometry(w, w), "#ffffff", at, { texture: LABEL });
  const thin = (a: number[], c2: number[], r: number, c: Col) =>
    b.rod(a, c2, r, c, { bone: root, sides: 4 });

  // ================= BENCH =================
  box(1.8, 0.06, 0.72, WOOD, [0, 0.87, 0]);
  box(1.86, 0.014, 0.78, GOLD, [0, 0.843, 0]);
  box(1.8, 0.022, 0.012, GOLD, [0, 0.87, 0.363]);
  box(1.8, 0.022, 0.012, GOLD, [0, 0.87, -0.363]);
  for (const sx of [1, -1]) {
    box(0.012, 0.022, 0.72, GOLD, [sx * 0.906, 0.87, 0]);
    for (const sz of [1, -1]) {
      const lx = sx * 0.82;
      const lz = sz * 0.3;
      box(0.09, 0.82, 0.09, WOOD_D, [lx, 0.41, lz]);
      box(0.108, 0.04, 0.108, GOLD, [lx, 0.02, lz]);
      box(0.108, 0.03, 0.108, GOLD, [lx, 0.805, lz]);
      box(0.094, 0.012, 0.094, GOLD, [lx, 0.6, lz]);
    }
  }
  // lower shelf and stretchers
  box(1.64, 0.04, 0.6, WOOD, [0, 0.28, 0]);
  for (const sz of [1, -1]) box(1.64, 0.06, 0.035, WOOD_D, [0, 0.5, sz * 0.3]);
  for (const sx of [1, -1]) box(0.035, 0.06, 0.6, WOOD_D, [sx * 0.82, 0.5, 0]);
  // apron with drawers
  box(1.64, 0.11, 0.03, WOOD_D, [0, 0.785, 0.315]);
  for (const x of [-0.55, 0, 0.55]) {
    box(0.5, 0.095, 0.012, GOLD, [x, 0.785, 0.34]);
    box(0.47, 0.075, 0.02, WOOD, [x, 0.785, 0.347]);
    sph(0.016, GOLD, [x, 0.785, 0.364], [1, 1, 0.6]);
    box(0.06, 0.012, 0.004, GOLD, [x - 0.17, 0.785, 0.358]);
    box(0.06, 0.012, 0.004, GOLD, [x + 0.17, 0.785, 0.358]);
  }

  // lower shelf items: barrel, jug, books
  cyl(0.13, 0.13, 0.26, WOOD_D, [-0.5, 0.43, 0.0], 10);
  for (const dy of [-0.08, 0.08]) cyl(0.138, 0.138, 0.02, GOLD, [-0.5, 0.43 + dy, 0.0], 10);
  cyl(0.11, 0.11, 0.012, WOOD, [-0.5, 0.566, 0.0], 10);
  sph(0.02, GOLD, [-0.5, 0.58, 0.0]);
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.09, 0.08],
      [0.07, 0.18],
      [0.03, 0.22],
      [0.04, 0.25],
      [0, 0.25],
    ],
    { at: [0.42, 0.3, 0.0], color: TEAL, bone: root, segments: 8 },
  );
  cyl(0.042, 0.042, 0.02, WOOD, [0.42, 0.56, 0.0]);
  P(new THREE.TorusGeometry(0.06, 0.012, 5, 10, Math.PI), GOLD, [0.42, 0.43, 0.0], { rotation: [0, 90, -90] });
  label(0.07, [0.42, 0.4, 0.092]);

  const book = (x: number, y: number, z: number, t: number, h: number, d: number, col: Col, lean = 0) => {
    const a = (lean * Math.PI) / 180;
    const loc = (dx: number, dy: number, dz: number) => [
      x + dx * Math.cos(a) - dy * Math.sin(a),
      y + h / 2 + dx * Math.sin(a) + dy * Math.cos(a),
      z + dz,
    ];
    const r = [0, 0, lean];
    box(t, h, d, col, loc(0, 0, 0), r);
    box(t * 0.7, 0.005, d * 0.9, CREAM, loc(0, h / 2 + 0.0005, -0.004), r);
    box(t + 0.004, 0.01, 0.005, GOLD, loc(0, h * 0.38, d / 2 + 0.001), r);
    box(t + 0.004, 0.01, 0.005, GOLD, loc(0, -h * 0.38, d / 2 + 0.001), r);
    box(t * 0.8, h * 0.2, 0.004, CREAM, loc(0, 0, d / 2 + 0.001), r);
    box(t * 0.3, h * 0.08, 0.005, RED, loc(0, 0, d / 2 + 0.002), r);
  };
  const lieBook = (x: number, y: number, z: number, w: number, h: number, d: number, col: Col, rotY = 0) => {
    const a = (rotY * Math.PI) / 180;
    const loc = (dx: number, dz: number) => [x + dx * Math.cos(a) + dz * Math.sin(a), y + h / 2, z - dx * Math.sin(a) + dz * Math.cos(a)];
    const r = [0, rotY, 0];
    box(w, h, d, col, loc(0, 0), r);
    box(w + 0.006, h * 0.62, d - 0.014, CREAM, loc(0, 0), r);
    box(0.01, h + 0.002, d + 0.002, GOLD, loc(-w / 2, 0), r);
    box(w * 0.5, 0.004, d * 0.5, GOLD, [loc(0.0, 0)[0], y + h + 0.0005, loc(0, 0)[2]], r);
  };
  lieBook(0.0, 0.3, 0.0, 0.3, 0.05, 0.2, NAVY);
  lieBook(0.0, 0.35, 0.0, 0.27, 0.045, 0.19, RED, 12);
  lieBook(0.0, 0.395, 0.0, 0.24, 0.04, 0.17, GREEN, -8);

  // ================= BACK SHELF UNIT =================
  for (const sx of [1, -1]) {
    box(0.07, 1.8, 0.07, WOOD_D, [sx * 0.93, 0.9, -0.31]);
    box(0.09, 0.03, 0.09, GOLD, [sx * 0.93, 1.815, -0.31]);
    box(0.09, 0.03, 0.09, GOLD, [sx * 0.93, 0.915, -0.31]);
    cone(0.03, 0.06, GOLD, [sx * 0.93, 1.86, -0.31], 6);
    box(0.05, 0.05, 0.26, WOOD_D, [sx * 0.9, 1.78, -0.19]);
  }
  P(new THREE.BoxGeometry(1.8, 0.9, 0.02), "#ffffff", [0, 1.35, -0.34], { texture: BACK_T });
  box(1.96, 0.06, 0.24, WOOD, [0, 1.835, -0.24]);
  box(1.98, 0.014, 0.26, GOLD, [0, 1.8, -0.24]);
  for (const sy of [1.15, 1.5]) {
    box(1.8, 0.035, 0.22, WOOD, [0, sy, -0.24]);
    box(1.8, 0.022, 0.012, GOLD, [0, sy, -0.133]);
    for (const x of [-0.6, 0, 0.6]) box(0.03, 0.06, 0.18, WOOD_D, [x, sy - 0.045, -0.24]);
  }
  // herb rail
  b.rod([-0.9, 1.78, -0.06], [0.9, 1.78, -0.06], 0.012, GOLD, { bone: root, sides: 6 });
  for (const sx of [1, -1]) sph(0.02, GOLD, [sx * 0.9, 1.78, -0.06]);

  // ---- shelf 1 contents ----
  const shelf1 = 1.1675;
  const covers: Col[] = [RED, NAVY, TEAL, PURPLE, GREEN, TAN];
  let bx = -0.86;
  for (let i = 0; i < 12; i++) {
    const t = 0.032 + rnd() * 0.022;
    const h = 0.18 + rnd() * 0.09;
    const leaning = i === 11;
    book(bx + t / 2, shelf1, -0.25, t, h, 0.15, covers[i % covers.length], leaning ? -12 : 0);
    bx += t + 0.004;
  }
  const jar = (x: number, y: number, z: number, content: Col, h: number) => {
    cyl(0.05, 0.05, h, content, [x, y + h / 2, z], 8);
    cyl(0.053, 0.053, 0.012, GOLD, [x, y + 0.01, z], 8);
    cyl(0.053, 0.053, 0.012, GOLD, [x, y + h - 0.01, z], 8);
    cyl(0.055, 0.055, 0.02, WOOD_D, [x, y + h + 0.01, z], 8);
    sph(0.014, GOLD, [x, y + h + 0.028, z]);
    label(0.055, [x, y + h / 2, z + 0.053]);
  };
  jar(0.1, shelf1, -0.24, GREEN, 0.13);
  jar(0.22, shelf1, -0.24, TAN, 0.11);
  jar(0.34, shelf1, -0.24, RED, 0.14);
  jar(0.46, shelf1, -0.24, PURPLE, 0.12);
  // orb on stand
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.06, 0.01],
      [0.025, 0.03],
      [0.025, 0.05],
      [0.045, 0.065],
      [0, 0.065],
    ],
    { at: [0.7, shelf1, -0.24], color: GOLD, bone: root, segments: 8 },
  );
  glow(sph(0.05, CRYO, [0.7, shelf1 + 0.11, -0.24]), 1.1);
  P(new THREE.TorusGeometry(0.068, 0.006, 5, 14), GOLD, [0.7, shelf1 + 0.11, -0.24], { rotation: [70, 0, 20] });
  P(new THREE.TorusGeometry(0.075, 0.005, 5, 14), GOLD, [0.7, shelf1 + 0.11, -0.24], { rotation: [20, 0, -50] });

  // ---- shelf 2 contents ----
  const shelf2 = 1.5175;
  // hourglass
  const hgx = -0.62;
  cyl(0.045, 0.045, 0.012, GOLD, [hgx, shelf2 + 0.006, -0.24], 6);
  cyl(0.045, 0.045, 0.012, GOLD, [hgx, shelf2 + 0.174, -0.24], 6);
  for (let k = 0; k < 3; k++) {
    const an = (k * Math.PI * 2) / 3;
    thin([hgx + Math.cos(an) * 0.038, shelf2 + 0.01, -0.24 + Math.sin(an) * 0.038], [hgx + Math.cos(an) * 0.038, shelf2 + 0.17, -0.24 + Math.sin(an) * 0.038], 0.004, GOLD);
  }
  glow(cone(0.036, 0.07, GEO, [hgx, shelf2 + 0.045, -0.24], 8), 0.7);
  glow(cone(0.036, 0.07, GEO, [hgx, shelf2 + 0.135, -0.24], 8, [180, 0, 0]), 0.7);
  cyl(0.006, 0.006, 0.05, GLASS, [hgx, shelf2 + 0.09, -0.24], 5);
  // potions on shelf 2
  const potion = (x: number, z: number, col: string, s: number, kind: number, y = Y) => {
    const shapes: Array<Array<[number, number]>> = [
      [[0, 0], [0.045, 0], [0.06, 0.02], [0.065, 0.055], [0.05, 0.095], [0.022, 0.12], [0, 0.12]],
      [[0, 0], [0.03, 0], [0.034, 0.02], [0.034, 0.13], [0.022, 0.15], [0, 0.15]],
      [[0, 0], [0.06, 0], [0.066, 0.02], [0.066, 0.09], [0.03, 0.12], [0, 0.12]],
    ];
    const tops = [0.12, 0.15, 0.12];
    const necks = [0.022, 0.02, 0.026];
    const rads = [0.066, 0.035, 0.067];
    const segs = [10, 8, 6];
    const top = tops[kind] * s;
    const nr = necks[kind] * s;
    const pts = shapes[kind].map(([a, c]): [number, number] => [a * s, c * s]);
    glow(b.lathe(pts, { at: [x, y, z], color: col, bone: root, segments: segs[kind] }), 1);
    cyl(nr, nr * 1.15, 0.07 * s, GLASS, [x, y + top + 0.015 * s, z], 8);
    cyl(nr * 1.3, nr * 1.3, 0.012 * s, GOLD, [x, y + top + 0.035 * s, z], 8);
    cyl(nr * 0.95, nr * 1.15, 0.035 * s, WOOD_D, [x, y + top + 0.062 * s, z], 8);
    label(rads[kind] * s * 1.1, [x, y + top * 0.45, z + rads[kind] * s + 0.003]);
  };
  potion(-0.35, -0.24, ELECTRO, 1.1, 0, shelf2);
  potion(-0.22, -0.25, DENDRO, 1.0, 1, shelf2);
  potion(-0.1, -0.24, PYRO, 1.1, 2, shelf2);
  potion(0.03, -0.25, CRYO, 1.0, 0, shelf2);
  potion(0.14, -0.24, PINK, 0.9, 1, shelf2);
  // stacked books on shelf 2
  lieBook(0.55, shelf2, -0.24, 0.28, 0.055, 0.2, PURPLE, 8);
  lieBook(0.55, shelf2 + 0.055, -0.24, 0.25, 0.05, 0.18, TEAL, -10);
  lieBook(0.55, shelf2 + 0.105, -0.24, 0.22, 0.045, 0.16, RED, 6);
  // a small crystal on top of the stack
  glow(cone(0.025, 0.07, GEO, [0.55, shelf2 + 0.185, -0.24], 5), 1);
  // small book row end
  book(0.82, shelf2, -0.24, 0.04, 0.22, 0.15, NAVY);
  book(0.865, shelf2, -0.24, 0.04, 0.2, 0.15, GREEN, 8);

  // ---- hanging herbs ----
  const bundles: Array<[number, number]> = [
    [-0.78, 0],
    [-0.52, 1],
    [-0.28, 0],
    [0.12, 1],
    [0.34, 0],
    [0.8, 1],
  ];
  for (const [hx, kind] of bundles) {
    const frames = Array.from({ length: 5 }, (_, k) =>
      frame([hx + (k - 2) * 0.012, 1.775, -0.06 + ((k % 2) - 0.5) * 0.02], [0, 1, 0]),
    );
    b.cards(frames, kind ? LAV_T : LEAF_T, {
      size: [0.07, 0.27],
      lean: 165,
      flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
      vary: 0.2,
      rng: rnd,
      bone: root,
      cross: true,
    });
    cyl(0.02, 0.02, 0.02, "#c9a96a", [hx, 1.745, -0.06], 6);
    thin([hx, 1.775, -0.06], [hx, 1.745, -0.06], 0.006, "#c9a96a");
  }
  // hanging lantern
  const lx = 0.58;
  thin([lx, 1.78, -0.06], [lx, 1.66, -0.06], 0.004, GOLD);
  cone(0.058, 0.04, GOLD, [lx, 1.64, -0.06], 6);
  sph(0.014, GOLD, [lx, 1.665, -0.06]);
  glow(cyl(0.042, 0.042, 0.09, "#ffd27a", [lx, 1.575, -0.06], 6), 1.3);
  cyl(0.05, 0.05, 0.014, GOLD, [lx, 1.522, -0.06], 6);
  cone(0.015, 0.03, GOLD, [lx, 1.5, -0.06], 6, [180, 0, 0]);
  for (let k = 0; k < 6; k++) {
    const an = (k * Math.PI) / 3 + Math.PI / 6;
    thin([lx + Math.cos(an) * 0.046, 1.53, -0.06 + Math.sin(an) * 0.046], [lx + Math.cos(an) * 0.046, 1.62, -0.06 + Math.sin(an) * 0.046], 0.004, GOLD);
  }

  // ================= BENCH TOP =================
  // cloth runner with tassels
  box(0.5, 0.006, 0.72, TEAL, [-0.28, Y + 0.003, 0]);
  P(new THREE.BoxGeometry(0.5, 0.16, 0.008), "#ffffff", [-0.28, 0.82, 0.373], { texture: CLOTH_T });
  box(0.5, 0.012, 0.012, GOLD, [-0.28, 0.742, 0.373]);
  for (let k = 0; k < 6; k++) {
    const tx = -0.28 - 0.225 + k * 0.09;
    thin([tx, 0.742, 0.378], [tx, 0.69, 0.378], 0.004, GOLD);
    sph(0.012, GOLD, [tx, 0.685, 0.378]);
    cone(0.012, 0.035, RED, [tx, 0.655, 0.378], 5, [180, 0, 0]);
  }

  // cauldron
  const cx = -0.65;
  const cz = 0.08;
  b.lathe(
    [
      [0, 0.06],
      [0.09, 0.06],
      [0.14, 0.12],
      [0.15, 0.2],
      [0.13, 0.27],
      [0.14, 0.285],
      [0.14, 0.3],
      [0.115, 0.3],
      [0.115, 0.285],
      [0, 0.285],
    ],
    { at: [cx, Y, cz], color: IRON, bone: root, segments: 10 },
  );
  cyl(0.153, 0.153, 0.016, GOLD, [cx, Y + 0.13, cz], 10);
  cyl(0.147, 0.147, 0.016, GOLD, [cx, Y + 0.275, cz], 10);
  glow(cyl(0.113, 0.113, 0.01, DENDRO, [cx, Y + 0.29, cz], 10), 1.2);
  for (const sx of [1, -1]) P(new THREE.TorusGeometry(0.03, 0.007, 5, 8), GOLD, [cx + sx * 0.15, Y + 0.24, cz], { rotation: [0, 90, 0] });
  for (let k = 0; k < 3; k++) {
    const an = (k * Math.PI * 2) / 3 + 0.4;
    thin([cx + Math.cos(an) * 0.11, Y, cz + Math.sin(an) * 0.11], [cx + Math.cos(an) * 0.07, Y + 0.075, cz + Math.sin(an) * 0.07], 0.012, IRON);
  }
  glow(sph(0.035, PYRO, [cx, Y + 0.035, cz], [1.3, 0.7, 1.3]), 1.4);
  for (const [dx, dy, dz, r] of [[0.03, 0.31, 0.02, 0.018], [-0.05, 0.33, -0.03, 0.013], [0.06, 0.34, -0.05, 0.01], [-0.02, 0.36, 0.05, 0.009]] as number[][])
    glow(sph(r, DENDRO, [cx + dx, Y + dy, cz + dz]), 1.2);
  // wooden spoon
  thin([cx - 0.04, Y + 0.3, cz + 0.02], [cx - 0.13, Y + 0.46, cz + 0.1], 0.008, WOOD_D);
  sph(0.018, WOOD_D, [cx - 0.04, Y + 0.3, cz + 0.02], [1, 0.5, 1]);

  // open grimoire
  const gx = -0.28;
  const gz = 0.17;
  box(0.37, 0.02, 0.25, NAVY, [gx, Y + 0.013, gz]);
  box(0.376, 0.02, 0.012, GOLD, [gx, Y + 0.013, gz + 0.126]);
  box(0.376, 0.02, 0.012, GOLD, [gx, Y + 0.013, gz - 0.126]);
  for (const sx of [1, -1]) {
    box(0.17, 0.03, 0.22, CREAM, [gx + sx * 0.088, Y + 0.037, gz]);
    P(new THREE.PlaneGeometry(0.15, 0.2), "#ffffff", [gx + sx * 0.088, Y + 0.0525, gz], {
      texture: sx > 0 ? PAGE_R : PAGE_L,
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
    });
    box(0.03, 0.03, 0.03, GOLD, [gx + sx * 0.18, Y + 0.025, gz + 0.115]);
    box(0.03, 0.03, 0.03, GOLD, [gx + sx * 0.18, Y + 0.025, gz - 0.115]);
  }
  box(0.01, 0.034, 0.23, BRASS, [gx, Y + 0.037, gz]);
  box(0.01, 0.003, 0.1, RED, [gx + 0.005, Y + 0.055, gz + 0.19]);

  // inkwell and quill
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.04, 0.02],
      [0.03, 0.045],
      [0.015, 0.05],
      [0, 0.05],
    ],
    { at: [-0.05, Y, 0.3], color: NAVY, bone: root, segments: 8 },
  );
  cyl(0.02, 0.02, 0.006, INK, [-0.05, Y + 0.052, 0.3], 8);
  cyl(0.036, 0.036, 0.008, GOLD, [-0.05, Y + 0.047, 0.3], 8);
  b.rod([-0.05, Y + 0.04, 0.3], [-0.0, Y + 0.17, 0.27], 0.003, CREAM, { bone: root, sides: 4 });
  P(new THREE.ConeGeometry(0.016, 0.12, 5), TEAL, [-0.013, Y + 0.145, 0.282], {
    dir: [0.4, 1.2, -0.3],
    scale: [1, 1, 0.25],
  });

  // brass balance scales
  const sx0 = 0.0;
  const sz0 = -0.02;
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.1, 0.015],
      [0.05, 0.03],
      [0.03, 0.05],
      [0, 0.05],
    ],
    { at: [sx0, Y, sz0], color: BRASS, bone: root, segments: 10 },
  );
  cyl(0.014, 0.018, 0.3, BRASS, [sx0, Y + 0.2, sz0], 8);
  sph(0.022, GOLD, [sx0, Y + 0.36, sz0]);
  box(0.44, 0.015, 0.02, GOLD, [sx0, Y + 0.34, sz0], [0, 0, 3]);
  sph(0.016, BRASS, [sx0, Y + 0.34, sz0 + 0.012]);
  box(0.006, 0.07, 0.004, INK, [sx0, Y + 0.29, sz0 + 0.022]);
  const pan = (px: number, py: number, content: number) => {
    b.lathe(
      [
        [0, 0],
        [0.06, 0.012],
        [0.09, 0.04],
        [0.083, 0.042],
        [0.055, 0.022],
        [0, 0.016],
      ],
      { at: [px, py, sz0], color: GOLD, bone: root, segments: 10 },
    );
    for (let k = 0; k < 3; k++) {
      const an = (k * Math.PI * 2) / 3 + 0.5;
      thin([px, py + 0.2, sz0], [px + Math.cos(an) * 0.088, py + 0.04, sz0 + Math.sin(an) * 0.088], 0.0025, GOLD);
    }
    sph(0.012, GOLD, [px, py + 0.2, sz0]);
    if (content === 0) {
      cyl(0.016, 0.02, 0.026, BRASS, [px - 0.02, py + 0.03, sz0], 8);
      cyl(0.012, 0.016, 0.022, BRASS, [px + 0.025, py + 0.028, sz0 + 0.015], 8);
      cyl(0.01, 0.013, 0.018, BRASS, [px + 0.01, py + 0.026, sz0 - 0.03], 8);
    } else glow(P(new THREE.OctahedronGeometry(0.03), PINK, [px, py + 0.045, sz0]), 1.2);
  };
  pan(sx0 - 0.22, Y + 0.34 - 0.0115 - 0.2, 0);
  pan(sx0 + 0.22, Y + 0.34 + 0.0115 - 0.2 + 0.02, 1);

  // mortar and pestle
  const mx = 0.3;
  const mz = 0.2;
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.075, 0.03],
      [0.09, 0.075],
      [0.095, 0.09],
      [0.08, 0.09],
      [0.065, 0.07],
      [0, 0.045],
    ],
    { at: [mx, Y, mz], color: STONE, bone: root, segments: 10 },
  );
  cyl(0.06, 0.06, 0.005, GREEN, [mx, Y + 0.058, mz], 10);
  b.rod([mx - 0.01, Y + 0.055, mz], [mx - 0.08, Y + 0.17, mz + 0.04], [0.012, 0.02], STONE, { bone: root, sides: 6 });
  sph(0.024, STONE, [mx - 0.085, Y + 0.18, mz + 0.043]);

  // mushrooms
  const mush = (x: number, z: number, r: number) => {
    cyl(r * 0.35, r * 0.45, r * 1.2, CREAM, [x, Y + r * 0.6, z], 6);
    P(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), RED, [x, Y + r * 1.15, z]);
    for (const [dx, dz] of [[0.4, 0.2], [-0.3, 0.4], [0.0, -0.5], [-0.4, -0.2]])
      sph(r * 0.14, "#ffffff", [x + dx * r, Y + r * 1.15 + r * 0.82, z + dz * r], [1, 0.5, 1]);
  };
  mush(0.07, 0.3, 0.035);
  mush(0.13, 0.26, 0.026);
  mush(0.1, 0.22, 0.02);

  // alembic
  const ax = 0.58;
  const az = -0.05;
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.02],
      [0.04, 0.05],
      [0.04, 0.08],
      [0.06, 0.1],
      [0, 0.1],
    ],
    { at: [ax, Y, az], color: BRASS, bone: root, segments: 8 },
  );
  glow(cone(0.025, 0.05, PYRO, [ax, Y + 0.125, az], 6), 1.4);
  glow(sph(0.085, ELECTRO, [ax, Y + 0.22, az], [1, 0.95, 1]), 1);
  cyl(0.025, 0.032, 0.1, GLASS, [ax, Y + 0.33, az], 8);
  cyl(0.036, 0.036, 0.012, GOLD, [ax, Y + 0.3, az], 8);
  sph(0.045, GLASS, [ax, Y + 0.41, az], [1, 0.9, 1]);
  cyl(0.02, 0.02, 0.012, GOLD, [ax, Y + 0.455, az], 8);
  b.sweep(
    catmull([
      [ax + 0.03, Y + 0.42, az],
      [ax + 0.12, Y + 0.43, az],
      [ax + 0.2, Y + 0.37, az],
      [ax + 0.26, Y + 0.25, az],
      [ax + 0.26, Y + 0.2, az],
    ]),
    0.012,
    { color: GLASS, bone: root, sides: 6 },
  );
  potion(ax + 0.26, az, PINK, 1.0, 0);
  for (const [dy] of [[0.12], [0.24]]) P(new THREE.TorusGeometry(0.03, 0.006, 5, 8), GOLD, [ax + 0.01, Y + 0.3 + dy * 0.1, az], { rotation: [90, 0, 0] });

  // ---- back row on the bench ----
  potion(-0.82, -0.26, CRYO, 1.0, 0);
  potion(-0.7, -0.22, PYRO, 0.9, 1);
  potion(-0.58, -0.27, ELECTRO, 1.1, 2);
  potion(0.16, -0.26, DENDRO, 1.0, 0);
  potion(0.76, -0.27, GEO, 1.2, 2);
  potion(0.88 - 0.0, -0.1, PYRO, 0.8, 1);

  // crystals
  const kx = -0.38;
  const kz = -0.25;
  sph(0.08, STONE, [kx, Y + 0.02, kz], [1.2, 0.5, 1]);
  for (const [dx, dz, h, tx, tz, col] of [
    [0, 0, 0.2, 0, 0, CRYO],
    [0.06, 0.02, 0.13, 0, -18, CRYO],
    [-0.06, 0.0, 0.11, 0, 20, ELECTRO],
    [0.01, -0.05, 0.14, -15, 0, CRYO],
  ] as Array<[number, number, number, number, number, string]>) {
    glow(cyl(0.026, 0.03, h * 0.6, col, [kx + dx, Y + 0.03 + h * 0.3, kz + dz], 6, [tx, 0, tz]), 1.1);
    glow(cone(0.026, h * 0.4, col, [kx + dx - Math.sin((tz * Math.PI) / 180) * h * 0.5, Y + 0.03 + h * 0.8, kz + dz], 6, [tx, 0, tz]), 1.1);
  }

  // scrolls
  const scx = -0.12;
  const scz = -0.27;
  for (const [dy, dz, len] of [[0.03, -0.03, 0.3], [0.03, 0.03, 0.28], [0.075, 0, 0.3]]) {
    cyl(0.026, 0.026, len, CREAM, [scx, Y + dy, scz + dz], 8, [0, 0, 90]);
    for (const sx of [1, -1]) cyl(0.03, 0.03, 0.012, GOLD, [scx + (sx * len) / 2, Y + dy, scz + dz], 8, [0, 0, 90]);
    cyl(0.029, 0.029, 0.012, RED, [scx, Y + dy, scz + dz], 8, [0, 0, 90]);
  }

  // candle
  const dx0 = 0.4;
  const dz0 = -0.26;
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.06, 0.012],
      [0.02, 0.03],
      [0.02, 0.06],
      [0.04, 0.07],
      [0.04, 0.078],
      [0, 0.078],
    ],
    { at: [dx0, Y, dz0], color: BRASS, bone: root, segments: 8 },
  );
  cyl(0.016, 0.018, 0.1, CREAM, [dx0, Y + 0.128, dz0], 8);
  box(0.012, 0.03, 0.01, CREAM, [dx0 + 0.016, Y + 0.14, dz0]);
  glow(cone(0.012, 0.04, GEO, [dx0, Y + 0.198, dz0], 6), 1.5);

  // ================= FLOOR DRESSING =================
  // sack
  sph(0.2, CREAM, [-1.12, 0.18, 0.1], [1, 0.9, 1]);
  cone(0.07, 0.1, CREAM, [-1.12, 0.38, 0.1], 6);
  cyl(0.058, 0.058, 0.014, RED, [-1.12, 0.33, 0.1], 6);
  box(0.12, 0.1, 0.004, TAN, [-1.12, 0.17, 0.3]);
  // herb basket
  const hbx = 1.08;
  const hbz = 0.12;
  b.lathe(
    [
      [0, 0],
      [0.16, 0],
      [0.2, 0.2],
      [0.185, 0.205],
      [0.15, 0.04],
      [0, 0.04],
    ],
    { at: [hbx, 0, hbz], color: STRAW, bone: root, segments: 10 },
  );
  cyl(0.2, 0.2, 0.014, BRASS, [hbx, 0.2, hbz], 10);
  b.sweep(
    catmull([
      [hbx - 0.19, 0.2, hbz],
      [hbx - 0.1, 0.36, hbz],
      [hbx + 0.1, 0.36, hbz],
      [hbx + 0.19, 0.2, hbz],
    ]),
    0.012,
    { color: STRAW, bone: root, sides: 6 },
  );
  const basketFrames = Array.from({ length: 14 }, (_, k) => {
    const an = k * 2.4;
    const rr = 0.04 + 0.1 * ((k * 0.37) % 1);
    return frame([hbx + Math.cos(an) * rr, 0.2, hbz + Math.sin(an) * rr], [0, 1, 0]);
  });
  b.cards(basketFrames, [LEAF_T, LAV_T, LEAF_T], {
    size: [0.08, 0.26],
    lean: 25,
    flow: (_f, i) => [Math.cos(i * 2.4), -0.1, Math.sin(i * 2.4)],
    vary: 0.25,
    rng: rnd,
    bone: root,
    cross: true,
  });
  // potted herb on the bench front-right
  const px = 0.75;
  const pz = 0.22;
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.08, 0.02],
      [0.1, 0.1],
      [0.105, 0.115],
      [0.09, 0.115],
      [0.085, 0.1],
      [0, 0.1],
    ],
    { at: [px, Y, pz], color: CLAY, bone: root, segments: 10 },
  );
  cyl(0.106, 0.106, 0.016, GOLD, [px, Y + 0.095, pz], 10);
  cyl(0.085, 0.085, 0.01, "#4a3020", [px, Y + 0.105, pz], 10);
  const potFrames = Array.from({ length: 9 }, (_, k) =>
    frame([px + Math.cos(k * 2.4) * 0.04, Y + 0.108, pz + Math.sin(k * 2.4) * 0.04], [0, 1, 0]),
  );
  b.cards(potFrames, LEAF_T, {
    size: [0.07, 0.2],
    lean: 30,
    flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    vary: 0.25,
    rng: rnd,
    bone: root,
    cross: true,
  });

  return b.root;
}
