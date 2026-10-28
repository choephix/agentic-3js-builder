import * as THREE from "three";
import { createBuilder, frame, rng, catmull } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";
import { grain, mottle } from "../../../../src/index";

export const meta = {
  name: "Alchemist's Workbench",
  description: "Genshin-style alchemy bench with glowing potions, books, balance scales, mortar, alembic and hanging herbs.",
};

export default function build() {
  const b = createBuilder({ name: "alchemist_bench" });
  const R = rng(11);
  const TOP = 0.9;

  // palette
  const WOOD = cel(grain("#9a6641", "#7d4f31", { size: 0.025 }), "#5a3a2c");
  const DARKWOOD = cel(grain("#6b4330", "#573425", { size: 0.025 }), "#3d2740");
  const GOLD = "#f0c85c";
  const GOLD2 = cel("#e8bd4e", "#b5782e");
  const TEAL = cel("#2f9aa0", "#2a6f94");
  const CREAM = cel("#f7ecce", "#e0c79e");
  const STONE = cel(mottle("#b9b4c2", "#9a94aa", { size: 0.04 }), "#7a7396");
  const CORK = cel("#c99a62", "#9b6a4a");
  const GLASS = "#d6f3f7";
  const RED = cel("#b8443f", "#7f2f4a");
  const PURPLE = cel("#6e4aa8", "#46327f");
  const GREEN = cel("#4f9a58", "#2f6a5a");
  const LEAF = cel("#6cc06a", "#3f8d5e");
  const CLOTH = cel("#2f7f8e", "#27587a");

  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { at, ...o });
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (r0: number, r1: number, h: number, seg: number, c: any, at: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(r0, r1, h, seg), c, at, o);
  const lathe = (pts: number[][], at: number[], c: any, seg = 10, o: any = {}) =>
    b.lathe(pts as any, { at, segments: seg, color: c, ...o });
  const loc = (at: number[], yaw: number, l: number[]) => {
    const v = new THREE.Vector3(l[0], l[1], l[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    return [at[0] + v.x, at[1] + v.y, at[2] + v.z];
  };

  // textures
  const RUNE_TAG = b.constructor && ((): THREE.Texture => null as any)();
  void RUNE_TAG;
  const { svg } = require_svg();
  const tag = svg(
    `<svg viewBox="0 0 40 50"><path d="M4 2H36V40L20 48L4 40Z" fill="#f7ecce" stroke="#22112f" stroke-width="3"/>
    <circle cx="20" cy="22" r="9" fill="none" stroke="#b5782e" stroke-width="3"/><path d="M20 10V34M10 22H30" stroke="#2f9aa0" stroke-width="3"/></svg>`,
    { size: 96 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#2f7f8e"/><rect x="3" y="3" width="58" height="58" fill="none" stroke="#f0c85c" stroke-width="3"/>
    <circle cx="32" cy="32" r="16" fill="none" stroke="#f0c85c" stroke-width="3"/><path d="M32 12L40 32L32 52L24 32Z" fill="#f0c85c"/><circle cx="32" cy="32" r="4" fill="#22112f"/></svg>`,
    { size: 128 },
  );
  const circleTex = svg(
    `<svg viewBox="0 0 128 128"><g fill="none" stroke="#7ff3e4" stroke-width="3"><circle cx="64" cy="64" r="58"/><circle cx="64" cy="64" r="46"/>
    <path d="M64 18L100 90L22 44H106L28 90Z"/></g><g fill="#f0c85c"><circle cx="64" cy="6" r="4"/><circle cx="64" cy="122" r="4"/><circle cx="6" cy="64" r="4"/><circle cx="122" cy="64" r="4"/></g></svg>`,
    { size: 256 },
  );
  const sprig = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64V8" stroke="#2f6a3a" stroke-width="3"/>
    <g fill="#5fb860" stroke="#2f6a3a" stroke-width="1.5"><path d="M16 10Q8 2 16 0Q24 2 16 10Z"/><path d="M16 26Q2 18 4 12Q16 14 16 26Z"/><path d="M16 26Q30 18 28 12Q16 14 16 26Z"/><path d="M16 42Q0 34 2 28Q16 30 16 42Z"/><path d="M16 42Q32 34 30 28Q16 30 16 42Z"/></g></svg>`,
    { size: 128 },
  );
  const flower = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64V20" stroke="#2f6a3a" stroke-width="3"/><g fill="#f08ac0" stroke="#7f2f6a" stroke-width="1.5"><circle cx="16" cy="12" r="7"/><circle cx="8" cy="22" r="5"/><circle cx="24" cy="22" r="5"/></g><circle cx="16" cy="12" r="3" fill="#f0c85c"/></svg>`,
    { size: 128 },
  );

  // ---------- table ----------
  box(1.8, 0.07, 0.8, WOOD, [0, TOP - 0.035, 0]);
  box(1.84, 0.02, 0.84, GOLD2, [0, TOP - 0.075, 0]);
  box(1.6, 0.1, 0.04, DARKWOOD, [0, 0.76, 0.34]);
  box(1.6, 0.1, 0.04, DARKWOOD, [0, 0.76, -0.34]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.09, 0.82, 0.09, DARKWOOD, [sx * 0.82, 0.41, sz * 0.34]);
      box(0.11, 0.05, 0.11, GOLD2, [sx * 0.82, 0.04, sz * 0.34]);
      box(0.11, 0.04, 0.11, GOLD2, [sx * 0.82, 0.78, sz * 0.34]);
    }
  box(1.64, 0.04, 0.64, WOOD, [0, 0.24, 0]);
  box(0.04, 0.04, 0.6, DARKWOOD, [0, 0.2, 0]);
  // cloth runner
  box(1.1, 0.008, 0.3, CLOTH, [-0.1, TOP + 0.004, 0.2]);
  box(1.1, 0.01, 0.015, GOLD, [-0.1, TOP + 0.006, 0.345]);
  box(1.1, 0.01, 0.015, GOLD, [-0.1, TOP + 0.006, 0.055]);
  for (let i = 0; i < 9; i++) cyl(0.012, 0.004, 0.06, 5, GOLD, [-0.62 + i * 0.138, TOP - 0.02, 0.37], { rotation: [0, 0, 0] });
  // transmutation circle
  glow(
    P(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [-0.55, TOP + 0.012, 0.02], { dir: [0, 1, 0], axis: "z", texture: circleTex }),
    0.8,
  );

  // ---------- back rack ----------
  box(1.8, 0.8, 0.04, DARKWOOD, [0, 1.3, -0.38]);
  for (const sx of [1, -1]) {
    box(0.07, 0.85, 0.07, WOOD, [sx * 0.88, 1.32, -0.36]);
    cyl(0.05, 0.03, 0.07, 6, GOLD2, [sx * 0.88, 1.78, -0.36]);
  }
  box(1.84, 0.06, 0.1, WOOD, [0, 1.7, -0.34]);
  box(1.84, 0.015, 0.11, GOLD2, [0, 1.735, -0.34]);
  for (const y of [1.2, 1.5]) {
    box(1.72, 0.03, 0.2, WOOD, [0, y, -0.28]);
    box(1.72, 0.012, 0.012, GOLD, [0, y + 0.002, -0.18]);
  }

  // ---------- bottles ----------
  const FLASK = [[0, 0], [0.05, 0], [0.075, 0.03], [0.08, 0.07], [0.06, 0.11], [0.025, 0.14], [0.025, 0.19], [0, 0.19]];
  const VIAL = [[0, 0], [0.035, 0], [0.04, 0.02], [0.04, 0.1], [0.025, 0.13], [0.02, 0.15], [0, 0.15]];
  const bottle = (x: number, y: number, z: number, s: number, liquid: string, shape = FLASK, label = true) => {
    const pts = shape.map(([a, h]) => [a * s, h * s]);
    const top = pts[pts.length - 1][1];
    glow(lathe(pts, [x, y, z], liquid, 8), 0.9);
    const nr = shape === FLASK ? 0.03 * s : 0.024 * s;
    lathe([[0, top - 0.04 * s], [nr * 1.15, top - 0.04 * s], [nr * 1.15, top], [0, top]], [x, y, z], GLASS, 8);
    cyl(nr * 0.9, nr * 0.75, 0.04 * s, 7, CORK, [x, y + top + 0.015 * s, z]);
    cyl(nr * 1.2, nr * 1.2, 0.012 * s, 8, GOLD2, [x, y + top - 0.004 * s, z]);
    if (label && s > 0.8) {
      const rr = (shape === FLASK ? 0.08 : 0.04) * s;
      P(new THREE.PlaneGeometry(0.05 * s, 0.062 * s), "#ffffff", [x, y + 0.075 * s, z + rr + 0.003], { dir: [0, 0, 1], axis: "z", texture: tag });
    }
  };
  bottle(-0.1, TOP, 0.32, 1, "#3de0d0");
  bottle(0.02, TOP, 0.3, 1, "#ff6aa0", VIAL);
  bottle(0.12, TOP, 0.33, 1, "#ffd24a", VIAL);
  bottle(0.24, TOP, 0.3, 1.1, "#9a6aff");
  bottle(-0.22, TOP, 0.28, 0.9, "#7aff7a", VIAL);
  const cols = ["#3de0d0", "#ff8a4a", "#9a6aff", "#7aff7a", "#ff6aa0", "#ffd24a"];
  for (let i = 0; i < 5; i++) bottle(-0.7 + i * 0.3, 1.215, -0.28, 0.75, cols[i], i % 2 ? VIAL : FLASK, false);
  for (let i = 0; i < 4; i++) bottle(-0.6 + i * 0.4, 1.515, -0.28, 0.7, cols[(i + 2) % 6], i % 2 ? FLASK : VIAL, false);
  for (let i = 0; i < 3; i++) bottle(-0.4 + i * 0.3, 0.26, 0.05, 0.9, cols[(i * 2) % 6], i % 2 ? VIAL : FLASK, false);

  // ---------- books ----------
  const book = (at: number[], yaw: number, w: number, h: number, d: number, color: any, decor = false) => {
    const o = { rotation: [0, (yaw * 180) / Math.PI, 0] };
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
    P(new THREE.BoxGeometry(w - 0.012, h - 0.018, d + 0.006), CREAM, loc(at, yaw, [0.004, 0, 0.004]), o);
    P(new THREE.BoxGeometry(w + 0.004, h + 0.004, 0.012), color, loc(at, yaw, [0, 0, d / 2 + 0.003]), o);
    P(new THREE.BoxGeometry(0.014, h + 0.006, d + 0.006), GOLD2, loc(at, yaw, [-w / 2 + 0.002, 0, 0]), o);
    for (const t of [-0.3, 0.3]) P(new THREE.BoxGeometry(w + 0.012, 0.006, d + 0.004), GOLD2, loc(at, yaw, [0, t * h, 0]), o);
    if (decor)
      P(new THREE.PlaneGeometry(w * 0.7, d * 0.7), "#ffffff", loc(at, yaw, [0, h / 2 + 0.002, 0]), { dir: [0, 1, 0], up: [Math.sin(yaw), 0, Math.cos(yaw)], axis: "z", texture: emblem });
  };
  const bx = 0.62, bz = 0.05;
  book([bx, TOP + 0.03, bz], 0.15, 0.26, 0.06, 0.19, RED);
  book([bx + 0.01, TOP + 0.085, bz], -0.1, 0.24, 0.05, 0.18, GREEN);
  book([bx - 0.01, TOP + 0.135, bz], 0.3, 0.22, 0.05, 0.16, PURPLE);
  book([bx, TOP + 0.185, bz], -0.05, 0.2, 0.045, 0.15, TEAL, true);
  book([0.55, TOP + 0.03, 0.3], 1.4, 0.2, 0.05, 0.15, CLOTH);
  for (let i = 0; i < 4; i++) book([0.74 + i * 0.06, 1.215 + 0.1 - 0.1, -0.28].map((v, k) => (k === 1 ? 1.215 + 0.1 : v)), 0, 0.045, 0.2, 0.15, [RED, GREEN, PURPLE, TEAL][i]);
  // open book
  {
    const at = [0.3, TOP + 0.02, 0.22];
    for (const s of [1, -1]) {
      box(0.17, 0.012, 0.22, TEAL, [at[0] + s * 0.09, at[1], at[2]], { rotation: [0, 0, s * -4] });
      box(0.16, 0.02, 0.2, CREAM, [at[0] + s * 0.09, at[1] + 0.012, at[2]], { rotation: [0, 0, s * -6] });
    }
  }
  // candle on books
  cyl(0.02, 0.02, 0.1, 8, CREAM, [bx, TOP + 0.255, bz]);
  cyl(0.035, 0.04, 0.012, 8, GOLD2, [bx, TOP + 0.212, bz]);
  glow(P(new THREE.ConeGeometry(0.012, 0.045, 6), "#ffb040", [bx, TOP + 0.33, bz]), 1.6);

  // ---------- scales ----------
  {
    const sx = -0.08, sz = 0.02, by = 1.22;
    lathe([[0, 0], [0.08, 0], [0.09, 0.015], [0.04, 0.04], [0.02, 0.1], [0, 0.1]], [sx, TOP, sz], GOLD2, 8);
    cyl(0.014, 0.018, 0.32, 6, GOLD2, [sx, TOP + 0.26, sz]);
    P(new THREE.SphereGeometry(0.03, 8, 6), GOLD, [sx, by + 0.02, sz]);
    box(0.5, 0.016, 0.016, GOLD2, [sx, by, sz], { rotation: [0, 0, 2] });
    for (const s of [1, -1]) {
      const ex = sx + s * 0.25, ey = by + s * -0.0087 + 0.0;
      const py = 1.0 + (s > 0 ? -0.02 : 0.02);
      lathe([[0, 0], [0.08, 0.012], [0.105, 0.04], [0.095, 0.04], [0, 0.018]], [ex, py, sz], GOLD2, 10);
      for (const a of [0, 2.1, 4.2]) b.rod([ex, ey, sz], [ex + Math.cos(a) * 0.095, py + 0.04, sz + Math.sin(a) * 0.095], 0.003, GOLD);
      P(new THREE.SphereGeometry(0.012, 5, 4), GOLD, [ex, ey, sz]);
    }
    // weights & gem
    cyl(0.025, 0.03, 0.03, 8, cel("#8a8a96", "#5a5a7a"), [sx + 0.25, 1.0 - 0.02 + 0.03, sz]);
    glow(P(new THREE.OctahedronGeometry(0.03), "#6ae8ff", [sx - 0.25, 1.02 + 0.045, sz], { flat: true }), 1.2);
  }

  // ---------- mortar, alembic ----------
  lathe([[0, 0], [0.07, 0], [0.08, 0.02], [0.1, 0.09], [0.1, 0.1], [0.085, 0.1], [0.07, 0.04], [0, 0.03]], [-0.52, TOP, 0.0], STONE, 10);
  cyl(0.014, 0.022, 0.2, 6, STONE, [-0.5, TOP + 0.13, 0.0], { rotation: [0, 0, -28] });
  P(new THREE.SphereGeometry(0.026, 6, 5), STONE, [-0.56, TOP + 0.21, 0.0]);
  // herbs in mortar
  b.cards([frame([-0.53, TOP + 0.06, 0.0], [0, 1, 0])], sprig, { size: [0.07, 0.09], lean: 20, flow: [1, 0, 0.3], cross: true });
  // alembic flask
  {
    const ax = -0.82, az = 0.12;
    cyl(0.1, 0.12, 0.12, 8, DARKWOOD, [ax, TOP + 0.06, az]);
    cyl(0.1, 0.1, 0.02, 8, GOLD2, [ax, TOP + 0.13, az]);
    glow(P(new THREE.SphereGeometry(0.1, 9, 7), "#8affd0", [ax, TOP + 0.24, az]), 0.7);
    cyl(0.03, 0.04, 0.1, 7, GLASS, [ax, TOP + 0.38, az]);
    b.sweep(catmull([[ax, TOP + 0.43, az], [ax - 0.04, TOP + 0.5, az], [ax - 0.15, TOP + 0.5, az], [ax - 0.22, TOP + 0.4, az], [ax - 0.22, TOP + 0.26, az]]), 0.016, { color: GOLD2, sides: 6 });
    bottle(ax - 0.22, TOP, az, 0.7, "#8affd0", VIAL, false);
  }

  // ---------- potted herbs ----------
  const pot = (x: number, z: number, tex: THREE.Texture, s = 1) => {
    lathe([[0, 0], [0.06 * s, 0], [0.085 * s, 0.1 * s], [0.09 * s, 0.11 * s], [0.07 * s, 0.11 * s], [0, 0.09 * s]], [x, TOP, z], TEAL, 9);
    cyl(0.092 * s, 0.092 * s, 0.014 * s, 9, GOLD2, [x, TOP + 0.1 * s, z]);
    const hits = [0, 1, 2, 3, 4].map((i) => frame([x + Math.cos(i * 1.26) * 0.03 * s, TOP + 0.1 * s, z + Math.sin(i * 1.26) * 0.03 * s], [0, 1, 0]));
    b.cards(hits, tex, { size: [0.1 * s, 0.2 * s], lean: 28, bend: 25, vary: 0.25, rng: R, spin: 180, flow: (_f: any, i: number) => [Math.cos(i * 1.26), 0, Math.sin(i * 1.26)] as any, cross: true });
  };
  pot(0.86, 0.2, flower, 1.1);
  pot(0.74, -0.15, sprig, 1.0);
  pot(-0.62, -0.2, sprig, 0.9);
  // potted herbs on shelf
  for (const x of [0.5, 0.8]) {
    lathe([[0, 0], [0.04, 0], [0.055, 0.07], [0.04, 0.07], [0, 0.06]], [x, 1.215, -0.28], PURPLE, 8);
    b.cards([frame([x, 1.28, -0.28], [0, 1, 0])], sprig, { size: [0.08, 0.15], lean: 20, cross: true, vary: 0.2, rng: R });
  }

  // ---------- hanging herbs & lantern ----------
  [-0.75, -0.45, -0.15, 0.2].forEach((x, i) => {
    b.rod([x, 1.69, -0.3], [x, 1.58, -0.3], 0.006, CORK);
    const fr = [0, 1, 2].map((k) => frame([x + (k - 1) * 0.02, 1.6, -0.3 + (k % 2) * 0.01], [0, 1, 0]));
    b.cards(fr, i % 2 ? flower : sprig, { size: [0.11, 0.3], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.25, rng: R, spin: 40 });
    cyl(0.018, 0.018, 0.015, 6, GOLD, [x, 1.585, -0.3]);
  });
  {
    const lx = 0.62, lz = -0.22, ly = 1.38;
    b.rod([lx, 1.68, -0.32], [lx, ly + 0.18, lz], 0.006, GOLD2);
    glow(lathe([[0, 0], [0.06, 0], [0.075, 0.08], [0.06, 0.15], [0, 0.15]], [lx, ly, lz], "#ffd070", 6), 1.4);
    P(new THREE.ConeGeometry(0.095, 0.06, 6), GOLD2, [lx, ly + 0.18, lz]);
    cyl(0.07, 0.07, 0.016, 6, GOLD2, [lx, ly - 0.005, lz]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.rod([lx + Math.cos(a) * 0.066, ly, lz + Math.sin(a) * 0.066], [lx + Math.cos(a) * 0.066, ly + 0.15, lz + Math.sin(a) * 0.066], 0.004, GOLD2);
    }
  }

  // ---------- sack & crate on shelf ----------
  lathe([[0, 0], [0.12, 0], [0.16, 0.08], [0.12, 0.2], [0.07, 0.25], [0.09, 0.3], [0.03, 0.29], [0, 0.26]], [0.55, 0.26, -0.05], cel("#d8c08a", "#a88a6a"), 8);
  cyl(0.075, 0.075, 0.015, 8, RED, [0.55, 0.26 + 0.24, -0.05]);
  box(0.28, 0.14, 0.2, WOOD, [-0.5, 0.33, 0.0]);
  box(0.3, 0.02, 0.22, GOLD2, [-0.5, 0.41, 0.0]);

  void INK;
  return b.root;
}

// svg helper (kept local so the module imports resolve from the SDK)
import { svg as _svg } from "../../../../src/index";
function require_svg() {
  return { svg: _svg };
}
