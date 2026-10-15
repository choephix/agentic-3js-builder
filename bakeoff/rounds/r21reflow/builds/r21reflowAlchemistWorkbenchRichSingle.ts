import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull, spiral } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A carved walnut alchemy desk with gold trim, drawers, herb rack, potions, books, brass scales, a distillation rig, glowing crystals and a cushioned stool.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Col = string | Paint;
type V = [number, number, number];

const BRASS = "#e0a93c";
const BRASS_D = "#a8761f";
const BRASS_L = "#ffd877";
const GLASS = "#cdeff0";
const CORK = "#c99a5a";
const CREAM = "#f3e6c4";
const PAPER = "#efe0b8";
const LEATHER = "#7a3e2c";
const LEATHER_D = "#52271c";
const TEAL = "#1d5f57";
const SAGE = "#6c9a58";
const TWINE = "#d9c08a";
const BASEY = 0.906;

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---- paints
  const WOOD_X = cel(grain("#a15f3a", "#86492c", { size: 0.012, axis: "x" }));
  const WOOD_Y = cel(grain("#a15f3a", "#86492c", { size: 0.012, axis: "y" }));
  const DARKW = cel(grain("#6d3a24", "#552b1b", { size: 0.012, axis: "y" }));
  const DARKW_X = cel(grain("#6d3a24", "#552b1b", { size: 0.012, axis: "x" }));
  const WOODTOP = cel(grain("#a96339", "#8c4b2d", { size: 0.015, axis: "x" }));
  const SEAM = "#5a2f1c";
  const TOPP = paint((p, n) => {
    const u = (p.z + 0.43) / 0.17;
    const f = u - Math.floor(u);
    return n.y > 0.6 && (f < 0.025 || f > 0.985) ? SEAM : WOODTOP;
  });
  const MARBLE = cel(mottle("#f6f2ea", "#c4c2c8", { size: 0.04, seed: 3 }));

  // ---- helpers
  const box = (w: number, h: number, d: number, c: Col, x: number, y: number, z: number, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: root, at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const cyl = (rt: number, rb: number, h: number, c: Col, x: number, y: number, z: number, seg = 8, rot?: V) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, {
      bone: root,
      at: [x, y, z],
      ...(rot ? { rotation: rot } : {}),
    });
  const ball = (r: number, c: Col, x: number, y: number, z: number, sc: number | V = 1, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg / 2))), c, {
      bone: root,
      at: [x, y, z],
      scale: sc,
    });
  const tor = (R: number, r: number, c: Col, x: number, y: number, z: number, rot?: V, seg = 10) =>
    b.part(new THREE.TorusGeometry(R, r, 5, seg), c, { bone: root, at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const lathe = (outline: Array<[number, number]>, c: Col, x: number, y: number, z: number, seg = 12, axis?: V) =>
    b.lathe(outline, { at: [x, y, z], color: c, segments: seg, ...(axis ? { axis } : {}) });
  const rod = (a: V, e: V, r: number, c: Col) => b.rod(a, e, r, c, { sides: 6 });
  const deco = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, up: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: root, at, dir, axis: "z", up, texture: tex });

  // ---- textures
  const LAV = svg(
    `<svg viewBox="0 0 24 80"><path d="M12 80 L12 14" stroke="#5b8a4a" stroke-width="2.4" fill="none"/>${Array.from({ length: 10 }, (_, i) => {
      const y = 8 + i * 5.6;
      const c = i % 2 ? "#8a5cd0" : "#a67be6";
      return `<ellipse cx="${i % 2 ? 8.5 : 15.5}" cy="${y}" rx="4.2" ry="3.4" fill="${c}"/>`;
    }).join("")}<ellipse cx="12" cy="5" rx="3.2" ry="4" fill="#b690f0"/><path d="M12 72 Q4 62 3 54 M12 74 Q20 64 21 56" stroke="#5b8a4a" stroke-width="2.4" fill="none"/></svg>`,
    { size: 160 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 40 70"><path d="M20 70 L20 6" stroke="#3f7a3a" stroke-width="2.2" fill="none"/>${[56, 43, 30, 18, 8]
      .map(
        (y, i) =>
          `<ellipse cx="${11 + (i % 2) * 0}" cy="${y}" rx="11" ry="5" fill="${i % 2 ? "#5da64a" : "#7bbf5a"}" transform="rotate(-35 20 ${y})"/><ellipse cx="29" cy="${y}" rx="11" ry="5" fill="${i % 2 ? "#7bbf5a" : "#5da64a"}" transform="rotate(35 20 ${y})"/>`,
      )
      .join("")}</svg>`,
    { size: 160 },
  );
  const WHT = svg(
    `<svg viewBox="0 0 40 70"><path d="M20 70 L20 20 M20 50 L8 30 M20 46 L32 26 M20 34 L14 14 M20 30 L28 12" stroke="#7aa064" stroke-width="2.2" fill="none"/>${[
      [20, 14],
      [8, 28],
      [32, 24],
      [14, 12],
      [28, 10],
      [20, 26],
      [12, 38],
      [28, 38],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fdf6e6" stroke="#d9cba4" stroke-width="1"/>`)
      .join("")}</svg>`,
    { size: 160 },
  );
  const RUNNER = svg(
    `<svg viewBox="0 0 92 160"><rect width="92" height="160" fill="#f1e4c0"/><rect x="6" y="0" width="7" height="160" fill="#1f6b5c"/><rect x="79" y="0" width="7" height="160" fill="#1f6b5c"/><rect x="15" y="0" width="1.5" height="160" fill="#d9a441"/><rect x="75.5" y="0" width="1.5" height="160" fill="#d9a441"/><path d="M46 20 L58 36 L46 52 L34 36Z" fill="none" stroke="#d9a441" stroke-width="1.6"/><path d="M46 28 L52 36 L46 44 L40 36Z" fill="#2fb59a"/><path d="M46 90 L60 108 L46 126 L32 108Z" fill="none" stroke="#d9a441" stroke-width="1.6"/><path d="M46 99 L53 108 L46 117 L39 108Z" fill="#2fb59a"/></svg>`,
    { size: 256 },
  );
  const PENDANT = svg(
    `<svg viewBox="0 0 92 84"><path d="M0 0 H92 V56 L46 84 L0 56Z" fill="#f1e4c0"/><path d="M6 0 H13 V54 L6 50Z" fill="#1f6b5c"/><path d="M79 0 H86 V50 L79 54Z" fill="#1f6b5c"/><path d="M13 54 L46 76 L79 54" stroke="#d9a441" stroke-width="2" fill="none"/><path d="M46 24 L62 44 L46 64 L30 44Z" fill="none" stroke="#d9a441" stroke-width="2"/><path d="M46 34 L54 44 L46 54 L38 44Z" fill="#2fb59a"/></svg>`,
    { size: 256 },
  );
  const CLOTH = svg(
    `<svg viewBox="0 0 50 66"><path d="M0 0 H50 V50 L25 66 L0 50Z" fill="#1d5f57"/><path d="M3 0 V49 L25 62 L47 49 V0" stroke="#e0a93c" stroke-width="1.3" fill="none"/><path d="M25 18 L33 30 L25 42 L17 30Z" fill="none" stroke="#e0a93c" stroke-width="1.2"/><path d="M25 24 L29 30 L25 36 L21 30Z" fill="#35d3b4"/><path d="M8 8 H16 M34 8 H42" stroke="#e0a93c" stroke-width="1.1"/></svg>`,
    { size: 256 },
  );
  const CUSHION = svg(
    `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#1f6b5c"/><rect x="5" y="5" width="90" height="90" fill="none" stroke="#e0a93c" stroke-width="2"/><path d="M50 12 L62 38 L88 50 L62 62 L50 88 L38 62 L12 50 L38 38Z" fill="none" stroke="#e0a93c" stroke-width="2.4"/><circle cx="50" cy="50" r="9" fill="#e0a93c"/><circle cx="50" cy="50" r="4.5" fill="#35d3b4"/></svg>`,
    { size: 192 },
  );

  // ---- reusable builders
  const potion = (x: number, y: number, z: number, r: number, variant: number, col: string, g = 0.5) => {
    let outline: Array<[number, number]>;
    let top: number;
    let seg = 12;
    if (variant === 0) {
      outline = [[0, 0], [0.5 * r, 0], [0.92 * r, 0.25 * r], [r, 0.85 * r], [0.8 * r, 1.5 * r], [0.45 * r, 1.9 * r], [0.3 * r, 2.2 * r], [0.3 * r, 3 * r], [0, 3 * r]];
      top = 3 * r;
    } else if (variant === 1) {
      outline = [[0, 0], [r, 0], [r, 0.12 * r], [0.35 * r, 2.2 * r], [0.3 * r, 2.4 * r], [0.3 * r, 3.1 * r], [0, 3.1 * r]];
      top = 3.1 * r;
    } else {
      outline = [[0, 0], [1.2 * r, 0], [1.2 * r, 2.2 * r], [0.35 * r, 2.6 * r], [0.3 * r, 3 * r], [0, 3 * r]];
      top = 3 * r;
      seg = 4;
    }
    glow(lathe(outline, col, x, y, z, seg), g);
    cyl(0.42 * r, 0.42 * r, 0.25 * r, GLASS, x, y + top, z, 8);
    cyl(0.3 * r, 0.37 * r, 0.8 * r, CORK, x, y + top + 0.4 * r, z, 8);
    ball(0.25 * r, BRASS, x, y + top + 0.85 * r, z, 1, 6);
    if (variant === 0) {
      box(0.8 * r, 0.8 * r, 0.006, PAPER, x, y + 0.85 * r, z + 0.95 * r);
      box(0.5 * r, 0.1 * r, 0.008, "#6a3b2a", x, y + 0.95 * r, z + 0.953 * r);
    }
    if (variant === 2) cyl(1.22 * r, 1.22 * r, 0.12 * r, BRASS_D, x, y + 0.06 * r, z, 4, [0, 45, 0]);
    return top + r;
  };
  const crystal = (x: number, y: number, z: number, h: number, r: number, col: string, axis: V, s = 1.2) =>
    glow(lathe([[0, 0], [r, 0], [r, h * 0.62], [0, h]], col, x, y, z, 6, axis), s);
  const flaskBall = (x: number, y: number, z: number, r: number) => {
    ball(r, GLASS, x, y, z, 1, 12);
    glow(
      b.part(new THREE.SphereGeometry(r * 1.012, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), "#33d1d0", {
        bone: root,
        at: [x, y, z],
      }),
      0.8,
    );
    glow(
      b.part(new THREE.CircleGeometry(r * 1.0, 12), "#5ae6e0", { bone: root, at: [x, y, z], rotation: [-90, 0, 0] }),
      1,
    );
    cyl(0.03, 0.03, 0.2, GLASS, x, y + r + 0.06, z, 8);
    cyl(0.04, 0.04, 0.02, BRASS, x, y + r + 0.16, z, 8);
  };
  const hang = (x: number, y: number, z: number, tex: THREE.Texture, n: number, seed: number, len = 0.3) => {
    const frames = [];
    const dirs: V[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      frames.push(frame([x + Math.cos(a) * 0.014, y, z + Math.sin(a) * 0.014], [0, 1, 0]));
      dirs.push([Math.cos(a), 0, Math.sin(a)]);
    }
    b.cards(frames, tex, {
      size: [0.085, len],
      lean: 172,
      flow: (_f, i) => dirs[i],
      cross: true,
      vary: 0.2,
      spin: 10,
      rng: rng(seed),
      sink: 0,
    });
    cyl(0.026, 0.02, 0.035, TWINE, x, y - 0.012, z, 8);
    tor(0.014, 0.004, TWINE, x, y + 0.03, z, [90, 0, 0], 8);
    ball(0.012, TWINE, x + 0.02, y - 0.02, z + 0.02, 1, 5);
  };
  const leafTuft = (x: number, y: number, z: number, n: number, rad: number, seed: number, size = 0.1) => {
    const fr = [];
    const dirs: V[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      fr.push(frame([x + Math.cos(a) * rad, y, z + Math.sin(a) * rad], [0, 1, 0]));
      dirs.push([Math.cos(a), 0, Math.sin(a)]);
    }
    b.cards(fr, LEAF, { size: [size * 0.7, size], lean: 28, flow: (_f, i) => dirs[i], cross: true, vary: 0.25, spin: 20, rng: rng(seed), bend: 20 });
  };

  // ================= TABLE =================
  // top
  b.part(new THREE.BoxGeometry(1.8, 0.07, 0.85), TOPP, { bone: root, at: [0, 0.865, 0] });
  box(1.84, 0.03, 0.045, DARKW_X, 0, 0.84, 0.425);
  box(1.84, 0.03, 0.045, DARKW_X, 0, 0.84, -0.425);
  box(0.045, 0.03, 0.85, DARKW, -0.9, 0.84, 0);
  box(0.045, 0.03, 0.85, DARKW, 0.9, 0.84, 0);
  box(1.8, 0.012, 0.012, BRASS, 0, 0.9, 0.43);
  for (let i = 0; i < 13; i++) ball(0.009, BRASS_L, -0.84 + i * 0.14, 0.845, 0.452, 1, 5);
  // aprons
  box(1.02, 0.09, 0.04, WOOD_X, -0.25, 0.775, 0.36);
  box(1.56, 0.09, 0.04, WOOD_X, 0, 0.775, -0.36);
  box(0.04, 0.09, 0.68, WOOD_X, -0.78, 0.775, 0);
  box(1.02, 0.01, 0.012, BRASS, -0.25, 0.728, 0.384);
  // legs
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = sx * 0.78;
      const z = sz * 0.33;
      box(0.11, 0.77, 0.11, WOOD_Y, x, 0.455, z);
      box(0.18, 0.07, 0.22, DARKW, x, 0.035, z + sz * 0.015);
      box(0.15, 0.04, 0.17, DARKW, x, 0.09, z + sz * 0.01, [0, 0, 0]);
      box(0.125, 0.022, 0.125, BRASS, x, 0.795, z);
      box(0.125, 0.018, 0.125, BRASS, x, 0.125, z);
      box(0.118, 0.01, 0.118, BRASS_D, x, 0.81, z);
      for (const [dx, dz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) ball(0.009, BRASS_L, x + dx * 0.08, 0.05, z + sz * 0.015 + dz * 0.09, 1, 5);
      box(0.04, 0.04, 0.008, BRASS, x, 0.55, z + sz * 0.056, [0, 0, 45]);
      glow(ball(0.009, "#35e0c0", x, 0.55, z + sz * 0.062, 1, 5), 1.2);
      box(0.04, 0.24, 0.008, BRASS_D, x, 0.3, z + sz * 0.056);
    }
  // diagonal braces
  for (const sx of [-1, 1]) {
    box(0.22, 0.035, 0.035, DARKW, sx * 0.67, 0.73, 0.36, [0, 0, -sx * 40]);
    box(0.22, 0.035, 0.035, DARKW, sx * 0.67, 0.73, -0.36, [0, 0, -sx * 40]);
  }
  // front apron ornaments
  for (const x of [-0.6, -0.25, 0.1]) {
    box(0.06, 0.06, 0.008, BRASS, x, 0.775, 0.383, [0, 0, 45]);
    glow(ball(0.012, "#35e0c0", x, 0.775, 0.39, 1, 5), 1.2);
  }
  // lower shelf
  box(1.52, 0.04, 0.7, WOOD_X, 0, 0.29, 0);
  box(1.52, 0.012, 0.012, BRASS, 0, 0.312, 0.352);
  box(1.52, 0.03, 0.03, DARKW_X, 0, 0.27, 0.34);
  // drawer cabinet
  box(0.5, 0.56, 0.72, DARKW, 0.52, 0.55, 0);
  box(0.52, 0.02, 0.74, BRASS_D, 0.52, 0.84, 0);
  box(0.52, 0.02, 0.74, BRASS_D, 0.52, 0.27, 0);
  for (const y of [0.72, 0.55, 0.38]) {
    box(0.43, 0.15, 0.03, WOOD_X, 0.52, y, 0.375);
    box(0.4, 0.012, 0.006, BRASS_D, 0.52, y + 0.065, 0.392);
    box(0.4, 0.012, 0.006, BRASS_D, 0.52, y - 0.065, 0.392);
    box(0.06, 0.06, 0.008, BRASS, 0.52, y + 0.005, 0.392, [0, 0, 45]);
    glow(ball(0.008, "#35e0c0", 0.52, y + 0.045, 0.397, 1, 5), 1);
    tor(0.026, 0.006, BRASS_L, 0.52, y - 0.012, 0.4, undefined, 12);
    ball(0.01, BRASS, 0.52, y + 0.016, 0.396, 1, 6);
  }
  // ================= RISER & HERB RACK =================
  box(1.7, 0.09, 0.03, DARKW_X, 0, 0.95, -0.405);
  box(1.7, 0.012, 0.035, BRASS, 0, 0.997, -0.405);
  for (const x of [-0.78, -0.18]) {
    box(0.07, 0.8, 0.07, DARKW, x, 1.3, -0.36);
    box(0.088, 0.022, 0.088, BRASS, x, 1.62, -0.36);
    box(0.088, 0.022, 0.088, BRASS, x, 0.94, -0.36);
    box(0.08, 0.04, 0.08, BRASS, x, 1.715, -0.36);
    ball(0.03, BRASS_L, x, 1.76, -0.36, 1, 8);
    box(0.04, 0.04, 0.008, BRASS, x, 1.45, -0.32, [0, 0, 45]);
    box(0.012, 0.3, 0.008, BRASS_D, x, 1.2, -0.322);
  }
  rod([-0.83, 1.67, -0.36], [-0.13, 1.67, -0.36], 0.012, BRASS);
  ball(0.02, BRASS_L, -0.84, 1.67, -0.36, 1, 6);
  ball(0.02, BRASS_L, -0.12, 1.67, -0.36, 1, 6);
  box(0.82, 0.03, 0.24, WOOD_X, -0.48, 1.12, -0.3);
  box(0.82, 0.014, 0.012, BRASS, -0.48, 1.135, -0.18);
  for (const x of [-0.7, -0.26]) box(0.16, 0.035, 0.035, DARKW, x, 1.06, -0.37, [0, 0, x < -0.5 ? 45 : -45]);
  hang(-0.66, 1.655, -0.36, LAV, 9, 21);
  hang(-0.48, 1.655, -0.36, LEAF, 9, 22);
  hang(-0.3, 1.655, -0.36, WHT, 9, 23);
  // potions on the shelf
  potion(-0.72, 1.135, -0.27, 0.03, 0, "#6fd36a");
  potion(-0.64, 1.135, -0.27, 0.028, 1, "#4aa3ff");
  potion(-0.54, 1.135, -0.27, 0.036, 0, "#b35cff");
  potion(-0.44, 1.135, -0.27, 0.03, 2, "#ffb347");
  potion(-0.34, 1.135, -0.27, 0.03, 1, "#35e0c0");
  potion(-0.255, 1.135, -0.27, 0.022, 0, "#ff6f91");

  // ================= LEFT CLOTH, CRYSTALS, CANDLE, MORTAR =================
  box(0.62, 0.006, 0.7, TEAL, -0.59, 0.903, 0);
  box(0.62, 0.007, 0.014, BRASS, -0.59, 0.904, 0.35);
  box(0.62, 0.007, 0.014, BRASS, -0.59, 0.904, -0.35);
  deco(CLOTH, 0.5, 0.65, [-0.915, 0.575, 0.05], [-1, 0, 0], [0, 1, 0]);
  rod([-0.918, 0.25, 0.05], [-0.918, 0.2, 0.05], 0.006, BRASS);
  ball(0.012, BRASS_L, -0.918, 0.19, 0.05, 1, 6);
  cyl(0.002, 0.014, 0.06, CREAM, -0.918, 0.15, 0.05, 6);
  // crystal bowl
  cyl(0.03, 0.045, 0.06, BRASS, -0.74, BASEY + 0.03, 0.04, 8);
  lathe([[0, 0], [0.03, 0], [0.04, 0.03], [0.07, 0.06], [0.075, 0.07], [0.06, 0.07], [0, 0.045]], BRASS, -0.74, BASEY + 0.06, 0.04, 10);
  tor(0.074, 0.006, BRASS_L, -0.74, BASEY + 0.13, 0.04, [90, 0, 0], 10);
  crystal(-0.74, BASEY + 0.1, 0.04, 0.21, 0.03, "#7be0ff", [0, 1, 0]);
  crystal(-0.76, BASEY + 0.1, 0.05, 0.17, 0.026, "#8aa8ff", [-0.5, 1, 0.2]);
  crystal(-0.72, BASEY + 0.1, 0.03, 0.16, 0.025, "#b58cff", [0.5, 1, -0.2]);
  crystal(-0.73, BASEY + 0.1, 0.06, 0.12, 0.02, "#6fd0ff", [0.1, 1, 0.6]);
  crystal(-0.75, BASEY + 0.1, 0.02, 0.13, 0.02, "#a0b8ff", [-0.3, 1, -0.5]);
  // candle
  lathe([[0, 0], [0.04, 0], [0.055, 0.015], [0.06, 0.02], [0.05, 0.02], [0, 0.012]], BRASS, -0.62, BASEY, 0.3, 10);
  cyl(0.014, 0.014, 0.06, CREAM, -0.62, BASEY + 0.045, 0.3, 8);
  glow(ball(0.01, "#ffd25a", -0.62, BASEY + 0.095, 0.3, [1, 1.7, 1], 6), 1.6);
  tor(0.04, 0.004, BRASS_L, -0.62, BASEY + 0.015, 0.3, [90, 0, 0], 10);
  // mortar and pestle
  b.lathe([[0, 0], [0.04, 0], [0.05, 0.02], [0.075, 0.06], [0.08, 0.1], [0.065, 0.1], [0, 0.085]], {
    at: [-0.45, BASEY, 0.12],
    color: MARBLE,
    segments: 12,
  });
  cyl(0.034, 0.034, 0.016, "#d8d4d0", -0.45, BASEY + 0.008, 0.12, 12);
  cyl(0.013, 0.02, 0.2, MARBLE, -0.44, BASEY + 0.17, 0.12, 8, [0, 0, 20]);
  ball(0.024, MARBLE, -0.474, BASEY + 0.265, 0.12, 1, 8);
  tor(0.078, 0.005, BRASS, -0.45, BASEY + 0.1, 0.12, [90, 0, 0], 12);
  leafTuft(-0.45, BASEY + 0.07, 0.12, 6, 0.02, 41, 0.09);
  // loose herb sprigs and scroll
  {
    const spots: V[] = [
      [-0.75, 0.908, 0.28],
      [-0.58, 0.908, 0.2],
      [-0.55, 0.908, 0.05],
      [-0.33, 0.908, 0.22],
      [-0.28, 0.908, 0.12],
      [-0.65, 0.908, -0.1],
      [-0.35, 0.908, 0.32],
      [0.1, 0.907, 0.3],
      [0.2, 0.907, 0.25],
      [-0.2, 0.908, 0.3],
    ];
    b.cards(spots.map((p) => frame(p, [0, 1, 0])), LEAF, {
      size: [0.06, 0.1],
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
      mirror: true,
      vary: 0.2,
      rng: rng(51),
    });
    b.cards([frame([-0.5, 0.909, 0.3], [0, 1, 0]), frame([-0.42, 0.909, 0.25], [0, 1, 0])], LAV, {
      size: [0.03, 0.12],
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 1.3 + 2), 0, Math.sin(i * 1.3 + 2)],
      mirror: true,
    });
  }
  cyl(0.02, 0.02, 0.2, PAPER, -0.3, 0.93, 0.36, 10, [0, 0, 90]);
  cyl(0.024, 0.024, 0.012, "#6a3b2a", -0.2, 0.93, 0.36, 8, [0, 0, 90]);
  cyl(0.024, 0.024, 0.012, "#6a3b2a", -0.4, 0.93, 0.36, 8, [0, 0, 90]);
  tor(0.021, 0.004, "#b03a3a", -0.3, 0.93, 0.36, [0, 90, 0], 8);
  // ink pot and quill
  lathe([[0, 0], [0.026, 0], [0.032, 0.02], [0.022, 0.04], [0.014, 0.046], [0, 0.046]], "#2a2f6a", -0.18, BASEY, 0.32, 8);
  rod([-0.18, BASEY + 0.04, 0.32], [-0.1, BASEY + 0.17, 0.3], 0.003, CREAM);
  b.spike([-0.12, BASEY + 0.15, 0.3], [0.5, 1, -0.1], 0.1, 0.012, { color: "#f6f0e0", sides: 4 });

  // ================= RUNNER =================
  deco(RUNNER, 0.46, 0.84, [0.2, 0.9045, 0], [0, 1, 0], [0, 0, -1]);
  deco(PENDANT, 0.46, 0.42, [0.2, 0.69, 0.434], [0, 0, 1], [0, 1, 0]);
  rod([0.2, 0.484, 0.434], [0.2, 0.46, 0.434], 0.005, BRASS);
  ball(0.013, BRASS_L, 0.2, 0.452, 0.434, 1, 6);
  cyl(0.003, 0.017, 0.07, CREAM, 0.2, 0.41, 0.434, 6);
  for (const x of [-0.02, 0.42]) {
    rod([x, 0.5, 0.434], [x, 0.47, 0.434], 0.004, BRASS);
    cyl(0.002, 0.012, 0.05, CREAM, x, 0.44, 0.434, 6);
  }
  // spoons
  for (const [x, z, a] of [[0.12, 0.12, 20], [0.2, 0.22, -15]] as Array<[number, number, number]>) {
    const dx = Math.cos((a * Math.PI) / 180);
    const dz = Math.sin((a * Math.PI) / 180);
    ball(0.03, BRASS, x, 0.912, z, [1, 0.35, 1], 8);
    rod([x + dx * 0.03, 0.915, z + dz * 0.03], [x + dx * 0.22, 0.915, z + dz * 0.22], 0.006, BRASS_D);
    ball(0.008, BRASS_L, x + dx * 0.22, 0.915, z + dz * 0.22, 1, 5);
  }
  glow(ball(0.006, "#c58bff", 0.12, 0.918, 0.12, 1, 4), 1);

  // ================= SCALES =================
  {
    const sx = -0.1;
    const sz = -0.2;
    lathe([[0, 0], [0.07, 0], [0.08, 0.015], [0.045, 0.04], [0.03, 0.07], [0.018, 0.1], [0, 0.1]], BRASS, sx, BASEY, sz, 10);
    rod([sx, BASEY + 0.1, sz], [sx, 1.24, sz], 0.012, BRASS);
    tor(0.02, 0.006, BRASS_L, sx, BASEY + 0.2, sz, [90, 0, 0], 8);
    ball(0.02, BRASS_L, sx, 1.265, sz, 1, 8);
    box(0.03, 0.03, 0.01, BRASS, sx, 1.295, sz, [0, 0, 45]);
    const L: V = [sx - 0.18, 1.248, sz];
    const Rr: V = [sx + 0.18, 1.222, sz];
    rod(L, Rr, 0.008, BRASS);
    ball(0.012, BRASS_L, L[0], L[1], L[2], 1, 6);
    ball(0.012, BRASS_L, Rr[0], Rr[1], Rr[2], 1, 6);
    for (const e of [L, Rr]) {
      const py = e[1] - 0.2;
      lathe([[0, 0], [0.045, 0.012], [0.06, 0.034], [0.052, 0.034], [0.038, 0.022], [0, 0.018]], BRASS, e[0], py, sz, 10);
      for (const a of [90, 210, 330]) {
        const ar = (a * Math.PI) / 180;
        rod(e, [e[0] + Math.cos(ar) * 0.055, py + 0.034, sz + Math.sin(ar) * 0.055], 0.0025, BRASS_D);
      }
    }
    crystal(L[0], L[1] - 0.18, sz, 0.07, 0.016, "#7be0ff", [0, 1, 0]);
    crystal(L[0] + 0.02, L[1] - 0.18, sz + 0.01, 0.05, 0.012, "#b58cff", [0.4, 1, 0]);
    leafTuft(Rr[0], Rr[1] - 0.175, sz, 6, 0.012, 61, 0.06);
  }
  // ================= BOOKS =================
  {
    const spec: Array<[string, number, number, number]> = [
      ["#1f5f4a", 0.27, 0.19, 4],
      ["#8a2a3a", 0.26, 0.2, -3],
      ["#a83a45", 0.265, 0.19, 5],
      ["#2e4f93", 0.27, 0.2, -2],
      ["#1f5f4a", 0.25, 0.185, 3],
    ];
    let y = BASEY;
    spec.forEach(([col, w, d, rot], i) => {
      const h = 0.042 + (i % 2) * 0.004;
      const x = 0.32;
      const z = -0.2;
      const yc = y + h / 2;
      b.part(new THREE.BoxGeometry(w, h, d), col, { bone: root, at: [x, yc, z], rotation: [0, rot, 0] });
      b.part(new THREE.BoxGeometry(w + 0.004, h * 0.72, d - 0.02), CREAM, { bone: root, at: [x, yc, z - 0.008], rotation: [0, rot, 0] });
      const c = Math.cos((rot * Math.PI) / 180);
      const s = Math.sin((rot * Math.PI) / 180);
      for (const ox of [-0.09, -0.05, 0.05, 0.09]) {
        const lx = ox;
        const lz = d / 2 + 0.002;
        b.part(new THREE.BoxGeometry(0.01, h + 0.002, 0.004), BRASS, {
          bone: root,
          at: [x + lx * c + lz * s, yc, z - lx * s + lz * c],
          rotation: [0, rot, 0],
        });
      }
      const lz = d / 2 + 0.003;
      b.part(new THREE.BoxGeometry(0.06, h * 0.5, 0.004), BRASS_L, {
        bone: root,
        at: [x + lz * s, yc, z + lz * c],
        rotation: [0, rot, 0],
      });
      y += h;
    });
    box(0.03, 0.012, 0.2, "#c04a55", 0.32, y + 0.006, -0.2);
  }
  // ================= DISTILLATION RIG =================
  {
    const fx = 0.66;
    const fz = -0.2;
    lathe([[0, 0], [0.05, 0], [0.06, 0.02], [0.04, 0.06], [0.02, 0.09], [0, 0.09]], BRASS, fx, BASEY, fz, 10);
    glow(ball(0.025, "#ff9a30", fx, BASEY + 0.12, fz, [1, 1.8, 1], 6), 1.6);
    for (const dx of [-0.07, 0.07])
      for (const dz of [-0.07, 0.07]) rod([fx + dx, BASEY, fz + dz], [fx + dx, 1.13, fz + dz], 0.007, BRASS);
    box(0.19, 0.02, 0.19, BRASS, fx, 1.13, fz);
    tor(0.07, 0.01, BRASS_L, fx, 1.145, fz, [90, 0, 0], 12);
    flaskBall(fx, 1.23, fz, 0.09);
    rod([0.53, BASEY, fz], [0.53, 1.5, fz], 0.014, BRASS);
    cyl(0.05, 0.065, 0.03, BRASS, 0.53, BASEY + 0.015, fz, 8);
    b.sweep(bezier([0.53, 1.5, fz], [0.53, 1.74, fz], [0.64, 1.76, fz]), 0.012, { color: BRASS, sides: 6 });
    ball(0.016, BRASS_L, 0.645, 1.765, fz, 1, 6);
    ball(0.016, BRASS_L, 0.53, 1.5, fz, 1, 6);
    rod([0.58, 1.745, fz], [0.58, 1.64, fz], 0.003, BRASS_D);
    cyl(0.018, 0.018, 0.02, BRASS, 0.58, 1.63, fz, 6);
    glow(ball(0.035, "#c06bff", 0.58, 1.595, fz, 1, 8), 1);
    b.sweep(catmull([[fx, 1.48, fz], [fx, 1.56, fz], [0.74, 1.58, fz], [0.82, 1.54, fz], [0.82, 1.38, fz]]), 0.011, { color: GLASS, sides: 6 });
    b.sweep(spiral([0.78, 1.38, fz], [0.82, 1.38, fz], [0, -1, 0], { turns: 3, pitch: 0.035 }), 0.006, { color: GLASS, sides: 5 });
    rod([0.82, 1.275, fz], [0.8, 1.11, fz], 0.008, GLASS);
    for (const y of [1.34, 1.3]) tor(0.045, 0.003, BRASS_D, 0.78, y, fz, [90, 0, 0], 8);
    potion(0.8, BASEY, fz, 0.055, 0, "#5ee07a", 0.7);
  }
  // test tube rack
  box(0.3, 0.025, 0.07, WOOD_X, 0.6, 0.9185, 0.08);
  for (const x of [0.46, 0.74]) box(0.015, 0.17, 0.015, BRASS, x, 0.996, 0.08);
  box(0.3, 0.012, 0.06, DARKW_X, 0.6, 1.04, 0.08);
  ["#35e0c0", "#c06bff", "#ffb347", "#4aa3ff", "#ff6f91"].forEach((col, i) => {
    const x = 0.51 + 0.045 * i;
    cyl(0.014, 0.014, 0.15, GLASS, x, 1.005, 0.08, 8);
    glow(cyl(0.0145, 0.0145, 0.085, col, x, 0.975, 0.08, 8), 0.7);
    cyl(0.012, 0.014, 0.02, CORK, x, 1.09, 0.08, 6);
  });
  // amethyst bowl
  lathe([[0, 0], [0.03, 0], [0.04, 0.03], [0.07, 0.06], [0.075, 0.07], [0.06, 0.07], [0, 0.045]], BRASS, 0.78, BASEY, 0.28, 10);
  tor(0.074, 0.006, BRASS_L, 0.78, BASEY + 0.07, 0.28, [90, 0, 0], 10);
  crystal(0.78, BASEY + 0.04, 0.28, 0.12, 0.024, "#b06bff", [0, 1, 0]);
  crystal(0.8, BASEY + 0.04, 0.29, 0.09, 0.02, "#d08bff", [0.5, 1, 0.1]);
  crystal(0.76, BASEY + 0.04, 0.27, 0.09, 0.02, "#8f5bff", [-0.5, 1, 0]);
  // lone potions on the table
  potion(0.05, BASEY, 0.02, 0.03, 1, "#ff6f91");
  potion(0.15, BASEY, 0.0, 0.028, 0, "#ffd25a", 0.6);
  // ================= UNDER-SHELF =================
  potion(-0.14, 0.31, 0.0, 0.07, 0, "#3fa66b", 0.2);
  box(0.28, 0.14, 0.2, DARKW_X, 0.1, 0.38, -0.1);
  box(0.3, 0.02, 0.22, BRASS_D, 0.1, 0.455, -0.1);
  box(0.03, 0.14, 0.205, BRASS, 0.1, 0.38, -0.1);
  box(0.05, 0.05, 0.008, BRASS, 0.1, 0.38, 0.0, [0, 0, 45]);
  leafTuft(0.1, 0.46, -0.1, 7, 0.06, 71, 0.16);
  ball(0.075, "#b9a27a", -0.45, 0.36, 0.05, [1, 0.9, 1], 8);
  cyl(0.02, 0.03, 0.04, "#b9a27a", -0.45, 0.45, 0.05, 6);
  tor(0.028, 0.006, TWINE, -0.45, 0.43, 0.05, [90, 0, 0], 8);
  potion(0.03, 0.31, 0.22, 0.022, 0, "#4aa3ff", 0.6);
  potion(0.12, 0.31, 0.22, 0.018, 1, "#ffb347", 0.6);
  leafTuft(-0.3, 0.31, -0.2, 5, 0.03, 72, 0.12);
  // ================= POUCH & LANTERN =================
  box(0.06, 0.2, 0.2, LEATHER, -0.96, 0.63, 0.22);
  box(0.07, 0.08, 0.205, LEATHER_D, -0.96, 0.7, 0.22, [0, 0, 8]);
  box(0.012, 0.03, 0.03, BRASS, -0.998, 0.67, 0.22);
  box(0.012, 0.33, 0.05, LEATHER_D, -0.925, 0.77, 0.22);
  for (const z of [0.15, 0.22, 0.29]) {
    cyl(0.022, 0.022, 0.13, PAPER, -0.96, 0.78, z, 8);
    tor(0.022, 0.004, "#8a5a3a", -0.96, 0.8, z, [90, 0, 0], 8);
  }
  box(0.08, 0.015, 0.02, BRASS, -0.935, 0.885, -0.1);
  rod([-0.97, 0.88, -0.1], [-0.97, 0.64, -0.1], 0.004, BRASS);
  glow(ball(0.05, "#ffb247", -0.97, 0.58, -0.1, 1, 8), 1.2);
  tor(0.058, 0.005, BRASS, -0.97, 0.58, -0.1, [0, 0, 0], 12);
  tor(0.058, 0.005, BRASS, -0.97, 0.58, -0.1, [0, 90, 0], 12);
  tor(0.058, 0.005, BRASS, -0.97, 0.58, -0.1, [90, 0, 0], 12);
  cyl(0.005, 0.03, 0.03, BRASS, -0.97, 0.64, -0.1, 8);
  cyl(0.02, 0.005, 0.03, BRASS, -0.97, 0.525, -0.1, 8);
  crystal(-0.97, 0.515, -0.1, 0.07, 0.014, "#35e0c0", [0, -1, 0]);

  // ================= STOOL =================
  {
    const sx = 0.45;
    const sz = 0.95;
    for (const dx of [-1, 1])
      for (const dz of [-1, 1]) {
        box(0.045, 0.4, 0.045, WOOD_Y, sx + dx * 0.16, 0.2, sz + dz * 0.16);
        box(0.058, 0.02, 0.058, BRASS, sx + dx * 0.16, 0.012, sz + dz * 0.16);
        box(0.055, 0.02, 0.055, BRASS, sx + dx * 0.16, 0.39, sz + dz * 0.16);
      }
    for (const d of [-1, 1]) {
      box(0.32, 0.025, 0.025, WOOD_X, sx, 0.15, sz + d * 0.16);
      box(0.025, 0.025, 0.32, WOOD_X, sx + d * 0.16, 0.15, sz);
      box(0.28, 0.06, 0.02, WOOD_X, sx, 0.355, sz + d * 0.16);
      box(0.02, 0.06, 0.28, WOOD_X, sx + d * 0.16, 0.355, sz);
      box(0.04, 0.04, 0.006, BRASS, sx, 0.355, sz + d * 0.172, [0, 0, 45]);
    }
    box(0.4, 0.05, 0.4, DARKW_X, sx, 0.425, sz);
    box(0.42, 0.012, 0.42, BRASS, sx, 0.455, sz);
    box(0.36, 0.035, 0.36, "#1f6b5c", sx, 0.4775, sz);
    for (const d of [-1, 1]) {
      box(0.36, 0.008, 0.008, BRASS, sx, 0.485, sz + d * 0.18);
      box(0.008, 0.008, 0.36, BRASS, sx + d * 0.18, 0.485, sz);
    }
    deco(CUSHION, 0.34, 0.34, [sx, 0.4965, sz], [0, 1, 0], [0, 0, -1]);
    ball(0.012, BRASS_L, sx, 0.5, sz, [1, 0.6, 1], 6);
  }
  return b.root;
}
