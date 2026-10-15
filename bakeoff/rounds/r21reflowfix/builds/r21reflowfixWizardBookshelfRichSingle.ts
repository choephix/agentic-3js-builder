import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { grain, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "An indigo, gold-trimmed wizard's bookshelf with a moon-and-star crest, spellbooks, scrolls, glowing orbs, an armillary, an astrolabe, a potion and flickering candles, plus hanging charms and a heap of books on the floor.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type Col = string | Paint;
type Tf = { x: number; y: number; z: number; ry: number; rz: number };

const DEG = Math.PI / 180;
const Yax = new THREE.Vector3(0, 1, 0);
const Zax = new THREE.Vector3(0, 0, 1);

const GOLD = "#e6b445";
const GOLDD = "#b5852a";
const CREAM = "#f3e8cc";
const PARCH = "#e9d7a8";
const PARCHD = "#b99a5e";
const RIBBON = "#b32a40";
const CORD = "#5b3a9a";
const INDIGO = "#2a2d6a";

const out = (pts: Array<[number, number]>): OutlinePoint[] => pts;

function starPts(r: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.3;
    pts.push([Math.cos(a) * rad, Math.sin(a) * rad, "sharp"]);
  }
  return pts;
}

function moonPts(R: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  const a0 = 51.3;
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const a = (a0 + ((360 - 2 * a0) * i) / N) * DEG;
    pts.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  for (let i = 1; i < N; i++) {
    const a = (282.6 - ((282.6 - 77.4) * i) / N) * DEG;
    pts.push([(0.45 + 0.8 * Math.cos(a)) * R, 0.8 * R * Math.sin(a)]);
  }
  return pts;
}

function spineTex(base: string, dark: string, emblem: "star" | "moon" | "diamond") {
  const g = "#ecbc4c";
  const em =
    emblem === "star"
      ? `<path d="M20 68 L24.5 92 L38 100 L24.5 108 L20 132 L15.5 108 L2 100 L15.5 92Z" fill="${g}"/>`
      : emblem === "moon"
        ? `<path d="M27 70 A30 30 0 1 0 27 130 A40 40 0 0 1 27 70Z" fill="${g}"/>`
        : `<path d="M20 66 L31 100 L20 134 L9 100Z" fill="${g}"/><circle cx="20" cy="100" r="4" fill="${dark}"/>`;
  return svg(
    `<svg viewBox="0 0 40 200">
      <rect width="40" height="200" fill="${base}"/>
      <rect width="4" height="200" fill="${dark}"/><rect x="36" width="4" height="200" fill="${dark}"/>
      <rect x="8" width="4" height="200" fill="#ffffff" opacity="0.18"/>
      <rect y="10" width="40" height="7" fill="${g}"/><rect y="22" width="40" height="3" fill="${g}"/>
      <rect y="175" width="40" height="3" fill="${g}"/><rect y="183" width="40" height="7" fill="${g}"/>
      <rect y="44" width="40" height="3" fill="${g}"/><rect y="153" width="40" height="3" fill="${g}"/>
      ${em}
    </svg>`,
    { size: 256 },
  );
}

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 2048 });
  b.joint("root", { at: [0, 0.8, 0] });

  // ---- palette (paints)
  const GOLDP = cel(GOLD, GOLDD);
  const woodPost = cel(grain("#3d3a7a", "#2e2b62", { size: 0.02, axis: "y", seed: 3 }));
  const woodShelf = cel(grain("#46428a", "#322e66", { size: 0.02, axis: "x", seed: 5 }));
  const backW = cel(grain("#2b2756", "#201c45", { size: 0.02, axis: "y", seed: 9 }));
  const planks = paint((p) => {
    const f = ((p.x / 0.1) % 1 + 1) % 1;
    return f < 0.04 || f > 0.96 ? "#14112b" : backW;
  });
  const WAX = cel(CREAM, "#d9c79c");
  const COVER: Record<string, Paint> = {
    r: cel("#b3293f"),
    b: cel("#2f5fb8"),
    g: cel("#2f7a4a"),
    p: cel("#7a3aa8"),
  };
  const TEX: Record<string, THREE.Texture> = {
    r1: spineTex("#b3293f", "#7a1c2c", "star"),
    r2: spineTex("#a02438", "#6a1626", "moon"),
    b1: spineTex("#2f5fb8", "#1f3f86", "diamond"),
    b2: spineTex("#2a56a8", "#1b3a7a", "star"),
    g1: spineTex("#2f7a4a", "#1f5535", "diamond"),
    g2: spineTex("#2b7045", "#1c4d30", "moon"),
    p1: spineTex("#7a3aa8", "#552a7a", "star"),
    p2: spineTex("#6c3498", "#4a2470", "moon"),
  };

  // ---- placement helpers
  const at = (x: number, y: number, z: number, ry = 0, rz = 0): Tf => ({ x, y, z, ry, rz });
  const T0 = at(0, 0, 0);
  const tq = (t: Tf) =>
    new THREE.Quaternion()
      .setFromAxisAngle(Yax, t.ry * DEG)
      .multiply(new THREE.Quaternion().setFromAxisAngle(Zax, t.rz * DEG));
  const wp = (t: Tf, l: readonly number[]): [number, number, number] => {
    const v = new THREE.Vector3(l[0], l[1], l[2]).applyQuaternion(tq(t));
    return [t.x + v.x, t.y + v.y, t.z + v.z];
  };
  const P = (
    t: Tf,
    geo: THREE.BufferGeometry,
    color: Col,
    l: readonly number[],
    rot: readonly number[] = [0, 0, 0],
    o: { texture?: THREE.Texture; flat?: boolean } = {},
  ) => {
    const ql = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG));
    return b.part(geo, color, { at: wp(t, l), quat: tq(t).multiply(ql), texture: o.texture, flat: o.flat });
  };
  const bg = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cy = (r1: number, r2: number, h: number, s: number) => new THREE.CylinderGeometry(r1, r2, h, s);
  const sp = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const tor = (R: number, r: number, rs: number, ts: number) => new THREE.TorusGeometry(R, r, rs, ts);
  const cone = (r: number, h: number, s: number) => new THREE.ConeGeometry(r, h, s);

  const star = (t: Tf, lx: number, ly: number, lz: number, r: number, th = 0.012, color: Col = GOLD) =>
    b.extrude(starPts(r), {
      at: wp(t, [lx, ly, lz]),
      x: [Math.cos(t.ry * DEG), 0, -Math.sin(t.ry * DEG)],
      thickness: th,
      color,
    });
  const moon = (t: Tf, lx: number, ly: number, lz: number, R: number, th = 0.012, color: Col = GOLD) =>
    b.extrude(moonPts(R), {
      at: wp(t, [lx, ly, lz]),
      x: [Math.cos(t.ry * DEG), 0, -Math.sin(t.ry * DEG)],
      thickness: th,
      color,
    });

  // ================= FRAME =================
  for (const s of [1, -1]) {
    const x = s * 0.72;
    P(T0, bg(0.18, 0.12, 0.42), cel("#2c3170"), [x, 0.06, 0]);
    P(T0, bg(0.2, 0.026, 0.44), GOLDP, [x, 0.133, 0]);
    P(T0, bg(0.2, 0.02, 0.44), GOLDP, [x, 0.01, 0]);
    star(T0, x, 0.07, 0.217, 0.045, 0.01);
    P(T0, bg(0.15, 1.315, 0.4), woodPost, [x, 0.8025, 0]);
    P(T0, bg(0.09, 0.95, 0.01), cel("#2a2858"), [x, 0.82, 0.203]);
    P(T0, bg(0.17, 0.045, 0.42), GOLDP, [x, 1.3, 0]);
    P(T0, bg(0.17, 0.012, 0.42), GOLDP, [x, 1.235, 0]);
    star(T0, x, 1.385, 0.203, 0.04, 0.012);
    star(T0, x, 0.27, 0.203, 0.04, 0.012);
    P(T0, bg(0.17, 0.04, 0.17), GOLDP, [x, 1.53, 0]);
    P(T0, bg(0.12, 0.06, 0.12), cel(INDIGO), [x, 1.58, 0]);
    P(T0, bg(0.14, 0.015, 0.14), GOLDP, [x, 1.617, 0]);
    P(T0, cone(0.055, 0.15, 4), GOLDP, [x, 1.70, 0], [0, 45, 0], { flat: true });
    // mini finials on the cornice
    const mx = s * 0.45;
    P(T0, bg(0.07, 0.05, 0.07), cel(INDIGO), [mx, 1.535, 0.1]);
    P(T0, cone(0.035, 0.1, 4), GOLDP, [mx, 1.61, 0.1], [0, 45, 0], { flat: true });
    star(T0, s * 0.33, 1.625, -0.075, 0.04, 0.02);
    star(T0, s * 0.55, 1.575, -0.075, 0.028, 0.02);
  }

  // cornice and shelves
  P(T0, bg(1.74, 0.05, 0.44), woodShelf, [0, 1.485, 0]);
  P(T0, bg(1.7, 0.01, 0.006), GOLD, [0, 1.469, 0.222]);
  P(T0, bg(1.3, 1.32, 0.02), planks, [0, 0.8, -0.19]);
  for (const y of [0.16, 0.6, 1.02]) {
    P(T0, bg(1.3, 0.04, 0.38), woodShelf, [0, y, 0.01]);
    P(T0, bg(1.3, 0.014, 0.01), "#6a62b8", [0, y, 0.205]);
  }
  // apron
  b.extrude(
    out([
      [-0.64, 0],
      [-0.46, 0],
      [-0.3, 0.04],
      [-0.15, 0.065],
      [0.15, 0.065],
      [0.3, 0.04],
      [0.46, 0],
      [0.64, 0],
      [0.64, 0.14],
      [-0.64, 0.14],
    ]),
    { at: [0, 0, 0.175], x: [1, 0, 0], thickness: 0.03, color: woodPost },
  );
  star(T0, 0, 0.09, 0.195, 0.026, 0.01);
  b.sweep(
    catmull([
      [-0.15, 0.1, 0.193],
      [0, 0.123, 0.193],
      [0.15, 0.1, 0.193],
    ]),
    0.005,
    GOLD,
    { sides: 5 },
  );

  // crest
  b.extrude(
    out([
      [-0.7, 0, "sharp"] as unknown as [number, number],
      [0.7, 0, "sharp"] as unknown as [number, number],
      [0.7, 0.07],
      [0.5, 0.1],
      [0.34, 0.2],
      [0.18, 0.31],
      [0, 0.37],
      [-0.18, 0.31],
      [-0.34, 0.2],
      [-0.5, 0.1],
      [-0.7, 0.07],
    ]),
    { at: [0, 1.51, -0.1], x: [1, 0, 0], thickness: 0.04, smoothing: 1, color: woodPost },
  );
  const trim: number[][] = [
    [-0.62, 0.055],
    [-0.5, 0.07],
    [-0.34, 0.17],
    [-0.18, 0.28],
    [0, 0.34],
    [0.18, 0.28],
    [0.34, 0.17],
    [0.5, 0.07],
    [0.62, 0.055],
  ];
  b.sweep(
    catmull(trim.map((p) => [p[0], 1.51 + p[1], -0.077])),
    0.006,
    GOLD,
    { sides: 5 },
  );
  P(T0, tor(0.12, 0.012, 5, 24), GOLD, [0, 1.7, -0.075]);
  moon(T0, -0.015, 1.7, -0.075, 0.075, 0.02);
  star(T0, 0.065, 1.705, -0.075, 0.04, 0.02);

  // stars on the back panel
  for (const [sx, sy, sr] of [
    [-0.14, 1.34, 0.022],
    [0.12, 1.38, 0.02],
    [-0.2, 0.93, 0.02],
    [0.2, 0.9, 0.022],
    [0.1, 0.5, 0.02],
    [-0.12, 0.46, 0.018],
  ])
    star(T0, sx, sy, -0.168, sr, 0.006);

  // ================= PROP BUILDERS =================
  const bookUp = (t: Tf, w: number, h: number, d: number, k: string) => {
    P(t, bg(w, h, d), COVER[k[0]], [0, h / 2, 0]);
    P(t, bg(w - 0.012, 0.004, d - 0.014), CREAM, [0, h + 0.0015, 0.004]);
    P(t, new THREE.PlaneGeometry(w - 0.004, h - 0.01), "#ffffff", [0, h / 2, d / 2 + 0.002], [0, 0, 0], {
      texture: TEX[k],
    });
  };

  const bookLie = (t: Tf, L: number, Th: number, D: number, k: string, clasp: boolean) => {
    const cov = COVER[k[0]];
    P(t, bg(0.012, Th, D), cov, [-L / 2 + 0.006, Th / 2, 0]);
    P(t, bg(L, 0.008, D), cov, [0, Th - 0.004, 0]);
    P(t, bg(L, 0.008, D), cov, [0, 0.004, 0]);
    P(t, bg(L - 0.016, Th - 0.014, D - 0.006), CREAM, [0.004, Th / 2, 0]);
    for (const o of [0.035, 0.075]) P(t, bg(0.01, Th + 0.004, D + 0.004), GOLD, [-L / 2 + o, Th / 2, 0]);
    if (clasp) {
      P(t, bg(0.034, Th * 0.8, 0.008), GOLD, [0.02, Th / 2, D / 2 + 0.001]);
      P(t, cy(0.007, 0.007, 0.006, 8), GOLDD, [0.02, Th / 2, D / 2 + 0.006], [90, 0, 0]);
    }
  };

  const scroll = (t: Tf, len: number, r: number, lx: number, ly: number, lz: number, ties: number[]) => {
    P(t, cy(r, r, len, 10), cel(PARCH), [lx, ly, lz], [0, 0, 90]);
    P(t, cy(r * 0.72, r * 0.72, len + 0.006, 8), PARCHD, [lx, ly, lz], [0, 0, 90]);
    P(t, cy(r * 0.35, r * 0.35, len + 0.034, 6), GOLD, [lx, ly, lz], [0, 0, 90]);
    for (const o of ties) P(t, tor(r + 0.003, 0.004, 5, 12), RIBBON, [lx + o, ly, lz], [0, 90, 0]);
  };

  const scrollStack = (t: Tf) => {
    scroll(t, 0.22, 0.034, 0.0, 0.034, -0.045, [0.06, -0.07]);
    scroll(t, 0.2, 0.034, 0.012, 0.034, 0.03, [0.07, -0.06]);
    scroll(t, 0.23, 0.034, -0.01, 0.092, -0.008, [0.06, -0.07]);
    P(t, cy(0.014, 0.014, 0.006, 8), GOLD, [0.07, 0.034, 0.068], [90, 0, 0]);
    P(t, cy(0.006, 0.006, 0.007, 6), GOLDD, [0.07, 0.034, 0.072], [90, 0, 0]);
    b.spike(wp(t, [0.07, 0.022, 0.07]), [0, -1, 0], 0.06, 0.012, CORD, { sides: 6 });
    P(t, sp(0.008, 6, 4), GOLD, [0.07, 0.026, 0.07]);
    P(t, sp(0.007, 6, 4), GOLD, [0.07, -0.04, 0.07]);
  };

  const BASE = out([
    [0, 0],
    [0.055, 0],
    [0.055, 0.01],
    [0.03, 0.025],
    [0.02, 0.045],
    [0.045, 0.055],
    [0, 0.055],
  ]);

  const orbStand = (x: number, y0: number, z: number, r: number, color: string, lighter: string) => {
    const t = at(x, y0, z);
    b.lathe(BASE, { at: wp(t, [0, 0, 0]), color: GOLDP, segments: 10 });
    for (let k = 0; k < 3; k++) {
      const a = (k * 2 * Math.PI) / 3 + 0.5;
      b.rod(
        wp(t, [0.03 * Math.cos(a), 0.05, 0.03 * Math.sin(a)]),
        wp(t, [0.075 * Math.cos(a), 0.0, 0.075 * Math.sin(a)]),
        0.007,
        GOLD,
        { sides: 5 },
      );
    }
    const cyy = 0.05 + r * 0.78;
    const ringY = 0.07;
    const rr = Math.sqrt(Math.max(r * r - (cyy - ringY) ** 2, 0.0001)) + 0.004;
    P(t, tor(rr, 0.008, 5, 14), GOLD, [0, ringY, 0], [90, 0, 0]);
    for (let k = 0; k < 3; k++) {
      const a = (k * 2 * Math.PI) / 3 + 1.0;
      P(t, cone(0.008, 0.045, 5), GOLD, [rr * Math.cos(a), ringY + 0.02, rr * Math.sin(a)]);
    }
    glow(P(t, sp(r, 14, 10), color, [0, cyy, 0]), 0.7);
    glow(P(t, sp(r * 0.3, 6, 4), lighter, [r * 0.55, cyy - r * 0.1, r * 0.8]), 0.7);
    glow(P(t, sp(r * 0.22, 6, 4), lighter, [-r * 0.6, cyy - r * 0.4, r * 0.65]), 0.7);
    glow(P(t, sp(r * 0.13, 6, 4), "#ffffff", [-r * 0.36, cyy + r * 0.44, r * 0.83]), 1);
  };

  const armillary = (x: number, y0: number, z: number, R: number, ball: string) => {
    const t = at(x, y0, z);
    b.lathe(BASE, { at: wp(t, [0, 0, 0]), color: GOLDP, segments: 10 });
    const c = 0.07 + R * 1.05;
    b.rod(wp(t, [0, 0.05, 0]), wp(t, [0, c - R * 0.7, 0]), 0.008, GOLD, { sides: 5 });
    P(t, tor(R, 0.006, 5, 20), GOLD, [0, c, 0], [75, 0, 15]);
    P(t, tor(R, 0.006, 5, 20), GOLD, [0, c, 0], [0, 0, 15]);
    P(t, tor(R, 0.006, 5, 20), GOLD, [0, c, 0], [0, 90, 15]);
    P(t, cy(0.004, 0.004, R * 2.3, 4), GOLDD, [0, c, 0], [0, 0, 15]);
    P(t, sp(R * 0.36, 10, 7), ball, [0, c, 0]);
    P(t, sp(R * 0.1, 6, 4), "#ffffff", [-R * 0.12, c + R * 0.14, R * 0.3]);
  };

  const astrolabe = (x: number, y0: number, z: number, R: number) => {
    const t = at(x, y0, z);
    b.lathe(BASE, { at: wp(t, [0, 0, 0]), color: GOLDP, segments: 10 });
    const c = 0.06 + R + 0.01;
    b.rod(wp(t, [0, 0.05, 0]), wp(t, [0, c, 0]), 0.009, GOLD, { sides: 5 });
    P(t, tor(R, 0.008, 5, 22), GOLD, [0, c, 0]);
    P(t, tor(R * 0.68, 0.005, 5, 18), GOLD, [0, c, 0]);
    P(t, cy(R * 0.96, R * 0.96, 0.006, 16), "#1d2a66", [0, c, -0.002], [90, 0, 0]);
    P(t, bg(R * 1.8, 0.006, 0.006), GOLDD, [0, c, 0.004]);
    P(t, bg(0.006, R * 1.8, 0.006), GOLDD, [0, c, 0.004]);
    for (let k = 0; k < 12; k++) {
      const a = (k * 30 * DEG);
      P(t, bg(0.005, 0.014, 0.005), GOLD, [R * 0.84 * Math.cos(a), c + R * 0.84 * Math.sin(a), 0.004], [0, 0, k * 30 - 90]);
    }
    star(t, 0, c, 0.005, R * 0.5, 0.008);
  };

  const FLAME = [
    [0, 0],
    [0.01, 0.006],
    [0.0125, 0.016],
    [0.009, 0.03],
    [0.0035, 0.044],
    [0, 0.054],
  ] as Array<[number, number]>;

  const candle = (x: number, y0: number, z: number, ped: number, h: number, r: number) => {
    const t = at(x, y0, z);
    b.lathe(
      out([
        [0, 0],
        [0.05, 0],
        [0.05, 0.012],
        [0.03, 0.026],
        [0.02, 0.038],
        [0.02, ped - 0.02],
        [0.04, ped - 0.01],
        [0.04, ped],
        [0, ped],
      ]),
      { at: wp(t, [0, 0, 0]), color: GOLDP, segments: 10 },
    );
    star(t, 0, 0.018, 0.05, 0.016, 0.008);
    const top = ped + h;
    P(t, cy(r, r, h, 9), WAX, [0, ped + h / 2, 0]);
    P(t, cy(r * 0.8, r * 0.8, 0.006, 9), "#e8d3a0", [0, top + 0.002, 0]);
    P(t, cy(0.007, 0.005, 0.035, 5), WAX, [r * 0.92, top - 0.017, r * 0.12]);
    P(t, cy(0.002, 0.002, 0.014, 4), "#2a1a12", [0, top + 0.01, 0]);
    glow(b.lathe(out(FLAME), { at: wp(t, [0, top + 0.012, 0]), color: "#ff9a1f", segments: 8 }), 1.4);
    glow(
      b.lathe(
        out(FLAME.map(([fx, fy]) => [fx * 0.55, fy * 0.55] as [number, number])),
        { at: wp(t, [0, top + 0.014, 0.002]), color: "#ffe9a0", segments: 6 },
      ),
      1.4,
    );
  };

  const potion = (x: number, y0: number, z: number) => {
    const t = at(x, y0, z);
    glow(
      b.lathe(
        out([
          [0, 0],
          [0.04, 0],
          [0.05, 0.015],
          [0.052, 0.04],
          [0.04, 0.07],
          [0.018, 0.095],
          [0.016, 0.12],
          [0.02, 0.125],
          [0, 0.125],
        ]),
        { at: wp(t, [0, 0, 0]), color: "#2a3fd0", segments: 10 },
      ),
      0.5,
    );
    P(t, cy(0.022, 0.022, 0.012, 8), GOLD, [0, 0.12, 0]);
    P(t, cy(0.014, 0.012, 0.022, 7), "#8a5a34", [0, 0.137, 0]);
    P(t, cy(0.016, 0.016, 0.006, 8), GOLD, [0, 0.15, 0]);
    star(t, 0, 0.04, 0.054, 0.022, 0.008);
    glow(P(t, sp(0.008, 6, 4), "#ffffff", [-0.022, 0.07, 0.034]), 1);
    P(t, bg(0.05, 0.008, 0.008), GOLD, [0, 0.0045, 0.04]);
  };

  // ================= BAY 1 (y0 = 0.18) =================
  const zc = 0.02;
  scrollStack(at(-0.5, 0.18, 0.03));
  bookUp(at(-0.335, 0.18, zc), 0.055, 0.3, 0.22, "g1");
  bookUp(at(-0.27, 0.18, zc), 0.05, 0.28, 0.21, "b2");
  bookUp(at(-0.205, 0.18, zc), 0.058, 0.31, 0.22, "r1");
  potion(0.0, 0.18, 0.06);
  bookLie(at(0.3, 0.18, zc, 3), 0.3, 0.05, 0.22, "r2", true);
  bookLie(at(0.3, 0.232, zc, -4), 0.28, 0.045, 0.21, "g2", true);
  bookLie(at(0.3, 0.277, zc, 2), 0.26, 0.055, 0.2, "p1", true);
  star(at(0.3, 0.332, zc, 2), 0.0, 0.0, 0.0, 0.03, 0.006);
  armillary(0.575, 0.18, 0.04, 0.058, "#e8dcc0");

  // ================= BAY 2 (y0 = 0.62) =================
  armillary(-0.56, 0.62, 0.04, 0.058, "#33b6b0");
  bookUp(at(-0.4, 0.62, zc), 0.05, 0.3, 0.22, "b1");
  bookUp(at(-0.335, 0.62, zc), 0.055, 0.29, 0.21, "p2");
  bookUp(at(-0.268, 0.62, zc), 0.06, 0.31, 0.22, "r2");
  bookLie(at(-0.02, 0.62, zc, -3), 0.34, 0.05, 0.23, "g1", true);
  bookLie(at(-0.02, 0.672, zc, 4), 0.36, 0.055, 0.22, "b2", true);

  orbStand(0.36, 0.62, 0.04, 0.068, "#1fa9b3", "#7ff0ea");
  candle(0.49, 0.62, 0.05, 0.07, 0.08, 0.034);
  candle(0.585, 0.62, 0.0, 0.11, 0.1, 0.04);

  // ================= BAY 3 (y0 = 1.04) =================
  astrolabe(-0.57, 1.04, 0.04, 0.062);
  bookUp(at(-0.46, 1.04, zc), 0.055, 0.32, 0.22, "r1");
  bookUp(at(-0.395, 1.04, zc), 0.05, 0.3, 0.21, "b1");
  bookUp(at(-0.33, 1.04, zc), 0.058, 0.3, 0.22, "g2");
  bookUp(at(-0.255, 1.046, zc, 0, 10), 0.052, 0.29, 0.21, "p1");
  orbStand(-0.04, 1.04, 0.04, 0.078, "#6a2fc0", "#b88af0");
  scrollStack(at(0.27, 1.04, 0.03));
  candle(0.575, 1.04, 0.0, 0.12, 0.12, 0.042);

  // ================= HANGING CHARMS =================
  for (const hx of [-0.76, -0.68]) {
    b.rod([hx, 1.295, 0.218], [hx, hx < -0.7 ? 1.14 : 1.2, 0.225], 0.004, GOLD, { sides: 4 });
    P(T0, sp(0.008, 6, 4), GOLD, [hx, 1.295, 0.218]);
  }
  moon(T0, -0.76, 1.095, 0.228, 0.045, 0.01);
  b.rod([-0.76, 1.055, 0.228], [-0.76, 1.03, 0.228], 0.004, GOLD, { sides: 4 });
  star(T0, -0.76, 1.0, 0.228, 0.035, 0.01);
  glow(P(T0, new THREE.OctahedronGeometry(0.022, 0).scale(1, 1.9, 1), "#5ad8ff", [-0.68, 1.172, 0.226]), 1);

  // lantern on the other post
  b.rod([0.75, 1.295, 0.218], [0.75, 1.2, 0.235], 0.004, GOLD, { sides: 4 });
  P(T0, sp(0.008, 6, 4), GOLD, [0.75, 1.295, 0.218]);
  P(T0, cone(0.04, 0.04, 4), GOLDP, [0.75, 1.18, 0.235], [0, 45, 0], { flat: true });
  glow(P(T0, bg(0.05, 0.07, 0.05), "#ffb347", [0.75, 1.125, 0.235]), 1.2);
  for (const [cx, cz] of [
    [0.025, 0.025],
    [-0.025, 0.025],
    [0.025, -0.025],
    [-0.025, -0.025],
  ])
    P(T0, bg(0.007, 0.075, 0.007), GOLD, [0.75 + cx, 1.125, 0.235 + cz]);
  P(T0, bg(0.062, 0.01, 0.062), GOLD, [0.75, 1.085, 0.235]);
  star(T0, 0.75, 1.125, 0.264, 0.018, 0.004);
  P(T0, sp(0.009, 6, 4), GOLD, [0.75, 1.075, 0.235]);
  b.spike([0.75, 1.07, 0.235], [0, -1, 0], 0.09, 0.016, CORD, { sides: 6 });

  // ================= FLOOR CLUTTER =================
  bookLie(at(-0.58, 0, 0.4, 12), 0.38, 0.05, 0.25, "r2", true);
  bookLie(at(-0.56, 0.05, 0.4, -7), 0.34, 0.055, 0.24, "b2", true);
  moon(at(-0.56, 0.105, 0.4, -7), -0.04, 0.003, 0.0, 0.0, 0.0, GOLD === "" ? GOLD : GOLD);
  scroll(at(-0.46, 0, 0.62, -10), 0.26, 0.03, 0, 0.03, 0, [0.07, -0.07]);
  P(at(-0.46, 0, 0.62, -10), cy(0.013, 0.013, 0.006, 8), GOLD, [0.07, 0.03, 0.033], [90, 0, 0]);
  b.spike(wp(at(-0.46, 0, 0.62, -10), [0.07, 0.02, 0.035]), [0.3, -1, 0.5], 0.05, 0.01, CORD, { sides: 4 });

  return b.root;
}
