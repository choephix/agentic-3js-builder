import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { cells, grain, mix, mottle, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall arched wizard's bookshelf in cel-shaded high-fantasy anime style: starry back panel, gold rune pilasters, tomes, scroll racks, candles, crystal orbs, potions and an hourglass, with floor clutter on a gilded rug.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------- palette
  const GOLD = "#f0c050";
  const GOLD_D = "#b8862b";
  const PAGE = "#f3e6c4";
  const WAX = ["#f4e7c8", "#cdb6e8", "#f7c8b0"];
  const WICK = "#2a1a12";
  const FLAME_O = "#ffa63d";
  const FLAME_I = "#fff0a8";
  const RIB = ["#b7323f", "#3558a8", "#b8862b"];
  const CORK = "#9a6a3c";
  const SAND = "#f2c46a";
  const INNER = "#c9a468";
  const DOWEL = "#6b4426";

  const WOOD = cel(grain("#9a6035", "#7a4626", { size: 0.012, axis: "y" }));
  const WOOD_H = cel(grain("#9a6035", "#7a4626", { size: 0.012, axis: "x" }));
  const WOOD_D = cel(grain("#6d4125", "#52301a", { size: 0.012, axis: "x" }));
  const PAPER = cel("#f0dcaa");
  const STONE = cel(mottle("#9a9cb0", "#7a7d96", { size: 0.06, contrast: 0.6, seed: 4 }));
  const BARREL = cel(grain("#b88a4a", "#8e6330", { size: 0.01, axis: "y" }));

  const COVERS: Array<[string, string]> = [
    ["#8c2f4f", "#611a36"],
    ["#2d5f93", "#1c3d66"],
    ["#2e8063", "#1b5642"],
    ["#a4402c", "#732616"],
    ["#5a45a0", "#3a2a73"],
    ["#c1822f", "#8c5818"],
    ["#1f7a85", "#12525c"],
    ["#7a2f8a", "#521d5e"],
  ];
  const COVER_P = COVERS.map(([a, c], i) => cel(mottle(a, c, { size: 0.04, contrast: 0.5, seed: i + 1 })));

  const NIGHT = "#1d1f4d";
  const NIGHT2 = "#3a2a72";
  const BACK = paint((p, n) => {
    if (n.z > 0.5) {
      const c = cells(p, 0.09, 3);
      if (c.d1 < 0.07 && c.id > 0.55) return "#ffe9a0";
      if (c.d1 < 0.14 && c.id > 0.93) return "#ffffff";
    }
    return mix(NIGHT, NIGHT2, smoothstep(0, 1.9, p.y));
  });

  const RUG = paint((p, n) => {
    if (n.y < 0.5) return "#4a1018";
    const r = Math.hypot(p.x, p.z - 0.4);
    if (r > 0.94) return "#4a1018";
    if (r > 0.88) return "#e0b050";
    if (r > 0.8 && r < 0.84) return "#e0b050";
    if (r > 0.37 && r < 0.4) return "#e0b050";
    const c = cells(p, 0.18, 5);
    return c.d2 - c.d1 < 0.03 ? "#a03a4a" : "#7a1f2b";
  });

  const PAGE_LINES = paint((p, n) => {
    if (n.y < 0.5) return PAGE;
    const f = (p.z / 0.012) % 1;
    return Math.abs(f < 0 ? f + 1 : f) < 0.22 ? "#6a4a2a" : PAGE;
  });

  // ---------------------------------------------------------------- textures
  const LABEL = svg(
    `<svg viewBox="0 0 40 20"><rect width="40" height="20" rx="2" fill="#efd9a2" stroke="#6b4a22" stroke-width="1.6"/><path d="M6 7 H34 M6 11 H28 M6 15 H31" stroke="#4a3320" stroke-width="1.6" stroke-linecap="round"/><circle cx="34" cy="14" r="2" fill="#b8862b"/></svg>`,
    { size: 160 },
  );
  const MAP = svg(
    `<svg viewBox="0 0 70 90"><rect width="70" height="90" fill="#ecd7a0"/><rect x="3" y="3" width="64" height="84" fill="none" stroke="#7a4a22" stroke-width="2"/><path d="M12 30 Q20 18 32 24 Q40 14 52 26 Q60 34 50 42 Q56 54 42 58 Q34 70 24 60 Q10 54 16 44 Q8 38 12 30Z" fill="#9cc47a" stroke="#4b3a1c" stroke-width="1.6"/><path d="M20 70 Q34 64 48 74" stroke="#b7323f" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/><path d="M52 70 l6 6 m0 -6 l-6 6" stroke="#b7323f" stroke-width="2.4"/><circle cx="54" cy="14" r="7" fill="none" stroke="#4b3a1c" stroke-width="1.4"/><path d="M54 6 L56 14 L54 22 L52 14Z M46 14 L54 12 L62 14 L54 16Z" fill="#b8862b"/><path d="M10 80 H36" stroke="#4b3a1c" stroke-width="1.4"/></svg>`,
    { size: 280 },
  );
  const CHART = svg(
    `<svg viewBox="0 0 70 90"><rect width="70" height="90" fill="#1d2150"/><rect x="3" y="3" width="64" height="84" fill="none" stroke="#e0b050" stroke-width="2"/><circle cx="35" cy="45" r="25" fill="none" stroke="#e0b050" stroke-width="1.6"/><circle cx="35" cy="45" r="16" fill="none" stroke="#8a7acb" stroke-width="1.4"/><path d="M14 30 L26 40 L38 28 L52 38 L58 56 L44 66 L24 62 Z" fill="none" stroke="#b9c8ff" stroke-width="1.2"/><g fill="#ffe9a0"><circle cx="14" cy="30" r="2.4"/><circle cx="26" cy="40" r="2.4"/><circle cx="38" cy="28" r="3"/><circle cx="52" cy="38" r="2.4"/><circle cx="58" cy="56" r="2.4"/><circle cx="44" cy="66" r="3"/><circle cx="24" cy="62" r="2.4"/></g><path d="M35 8 L37 13 L42 13 L38 16 L39 21 L35 18 L31 21 L32 16 L28 13 L33 13Z" fill="#e0b050"/></svg>`,
    { size: 280 },
  );
  const orbTex = (a: string, c: string, s: string) =>
    svg(
      `<svg viewBox="0 0 128 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="128" height="64" fill="url(#g)"/><path d="M0 40 Q16 20 32 38 T64 36 T96 40 T128 38" stroke="${s}" stroke-width="4" fill="none"/><path d="M0 24 Q20 10 40 24 T80 22 T128 24" stroke="${s}" stroke-width="3" fill="none"/><circle cx="20" cy="50" r="3" fill="#ffffff"/><circle cx="70" cy="12" r="2.5" fill="#ffffff"/><circle cx="100" cy="48" r="3" fill="#ffffff"/><circle cx="48" cy="30" r="2" fill="#ffffff"/></svg>`,
      { size: 256 },
    );
  const ORB_CYAN = orbTex("#3fb8e8", "#a8f0ff", "#e8ffff");
  const ORB_VIOLET = orbTex("#6a3fd0", "#d49aff", "#f0d8ff");
  const ORB_AMBER = orbTex("#e86a1c", "#ffd36b", "#fff3c0");

  const runeTex = (cols: number, rows: number, cell: number, color: string, seed: number, px: number) => {
    const r = rng(seed);
    let d = "";
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const x0 = i * cell + cell * 0.2;
        const y0 = j * cell + cell * 0.15;
        const w = cell * 0.6;
        const h = cell * 0.7;
        const k = 2 + Math.floor(r() * 3);
        d += `M${(x0 + w * r()).toFixed(1)} ${y0.toFixed(1)}`;
        for (let m = 0; m < k; m++) d += ` L${(x0 + w * r()).toFixed(1)} ${(y0 + (h * (m + 1)) / k).toFixed(1)}`;
        if (r() > 0.4) d += ` M${(x0 + w * 0.5).toFixed(1)} ${y0.toFixed(1)} L${(x0 + w * 0.5).toFixed(1)} ${(y0 + h).toFixed(1)}`;
      }
    return svg(
      `<svg viewBox="0 0 ${cols * cell} ${rows * cell}"><path d="${d}" stroke="${color}" stroke-width="${cell * 0.1}" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
      { size: px },
    );
  };
  const RUNE_V = runeTex(1, 40, 10, "#ffd870", 11, 1200);
  const RUNE_H = runeTex(44, 1, 10, "#ffd870", 23, 1320);

  // ---------------------------------------------------------------- helpers
  const prof = (pts: Array<[number, number]>): OutlinePoint[] => pts;
  const eul = (x: number, y: number, z: number, order: THREE.EulerOrder = "XYZ") =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, order));
  const D2R = Math.PI / 180;

  class Pl {
    constructor(
      readonly p: THREE.Vector3,
      readonly q: THREE.Quaternion,
    ) {}
    at(x: number, y: number, z: number) {
      return new THREE.Vector3(x, y, z).applyQuaternion(this.q).add(this.p);
    }
  }
  const pl = (x: number, y: number, z: number, q = new THREE.Quaternion()) => new Pl(new THREE.Vector3(x, y, z), q);

  const box = (w: number, h: number, d: number, color: Fill, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: root, at: [x, y, z] });
  const bx = (p: Pl, w: number, h: number, d: number, color: Fill, lx: number, ly: number, lz: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: root, at: p.at(lx, ly, lz), quat: p.q });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: root, at: [x, y, z] });
  const cylQ = (p: Pl, rt: number, rb: number, h: number, seg: number, color: Fill, lx: number, ly: number, lz: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: root, at: p.at(lx, ly, lz), quat: p.q });
  const ball = (r: number, color: Fill, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 3)), color, { bone: root, at: [x, y, z] });

  const studs = (pts: THREE.Vector3[], r: number, color: string) => {
    const gs = pts.map((p) => new THREE.SphereGeometry(r, 5, 3).translate(p.x, p.y, p.z));
    b.part(mergeGeometries(gs)!, color, { bone: root, at: [0, 0, 0] });
  };

  // ---------------------------------------------------------------- books
  function book(p: Pl, w: number, h: number, d: number, pal: number) {
    const P = COVER_P[pal % COVER_P.length];
    bx(p, w, h, 0.008, P, 0, 0, d / 2 - 0.004);
    for (const s of [1, -1]) bx(p, 0.006, h, d - 0.002, P, s * (w / 2 - 0.003), 0, -0.001);
    bx(p, w - 0.012, h - 0.012, d - 0.012, PAGE, 0, 0, -0.004);
    const ys = h > 0.25 ? [0.4, 0.27, -0.4] : [0.4, -0.4];
    for (const y of ys) bx(p, w + 0.004, 0.008, 0.004, GOLD, 0, y * h, d / 2);
    b.part(new THREE.PlaneGeometry(w * 0.72, h * 0.22), "#ffffff", {
      bone: root,
      at: p.at(0, h * 0.05, d / 2 + 0.0035),
      quat: p.q,
      texture: LABEL,
    });
  }

  const ZF = 0.13;
  function bookAt(x: number, T: number, w: number, h: number, d: number, pal: number, lean = 0) {
    const th = lean * D2R;
    const cx = x - Math.sin(th) * (h / 2);
    const cy = T + Math.cos(th) * (h / 2) + Math.abs(Math.sin(th)) * (w / 2);
    book(pl(cx, cy, ZF - d / 2, eul(0, 0, th)), w, h, d, pal);
  }
  function row(x0: number, T: number, specs: Array<[number, number, number, number]>) {
    let x = x0;
    for (const [w, h, d, pal] of specs) {
      bookAt(x + w / 2, T, w, h, d, pal);
      x += w + 0.004;
    }
    return x;
  }
  function stack(x: number, T: number, z: number, items: Array<[number, number, number, number, number]>) {
    let y = T;
    for (const [len, th, d, pal, yaw] of items) {
      book(pl(x, y + th / 2, z, eul(0, yaw * D2R, Math.PI / 2, "YXZ")), th, len, d, pal);
      y += th;
    }
    return y;
  }

  // ---------------------------------------------------------------- scrolls
  function scroll(p: Pl, len: number, r: number, ribbon: string) {
    cylQ(p, r, r, len, 8, PAPER, 0, 0, 0);
    cylQ(p, r * 0.55, r * 0.55, len + 0.006, 6, INNER, 0, 0, 0);
    cylQ(p, r * 1.1, r * 1.1, 0.012, 8, ribbon, 0, len * 0.22, 0);
  }
  function scrollLying(x: number, y: number, z: number, len: number, r: number, yaw: number, ribbon: string) {
    scroll(pl(x, y, z, eul(0, yaw * D2R, Math.PI / 2, "YXZ")), len, r, ribbon);
  }

  // ---------------------------------------------------------------- candles
  const HOLDER = prof([
    [0, 0],
    [0.045, 0],
    [0.045, 0.008],
    [0.016, 0.022],
    [0.014, 0.058],
    [0.028, 0.07],
    [0.028, 0.078],
    [0, 0.078],
  ]);
  const FLAME_OUT = prof([
    [0, 0],
    [0.012, 0.012],
    [0.013, 0.026],
    [0.007, 0.042],
    [0, 0.06],
  ]);
  const FLAME_IN = prof([
    [0, 0],
    [0.006, 0.008],
    [0.007, 0.018],
    [0, 0.034],
  ]);
  function flame(x: number, y: number, z: number) {
    glow(b.lathe(FLAME_OUT, { at: [x, y, z], bone: root, color: FLAME_O, segments: 6 }), 1.4);
    glow(b.lathe(FLAME_IN, { at: [x, y, z], bone: root, color: FLAME_I, segments: 6 }), 1.6);
  }
  function candle(x: number, y: number, z: number, h: number, r: number, wax: string, holder = true) {
    let yy = y;
    if (holder) {
      b.lathe(HOLDER, { at: [x, yy, z], bone: root, color: GOLD, segments: 8 });
      yy += 0.078;
    }
    cyl(r, r * 1.05, h, 8, wax, x, yy + h / 2, z);
    cyl(r * 0.22, r * 0.22, h * 0.38, 5, wax, x + r * 0.95, yy + h - h * 0.19, z);
    ball(r * 0.3, wax, x + r * 0.95, yy + h - h * 0.38, z, 5);
    cyl(0.0015, 0.0015, 0.012, 3, WICK, x, yy + h + 0.006, z);
    flame(x, yy + h + 0.008, z);
  }

  // ---------------------------------------------------------------- orbs, flasks, crystals
  function motes(x: number, y: number, z: number, r: number, n: number, seed: number) {
    const g = rng(seed);
    for (let i = 0; i < n; i++) {
      const a = g() * Math.PI * 2;
      glow(ball(0.007, "#ffffff", x + Math.cos(a) * r, y + 0.02 + g() * r, z + Math.sin(a) * r, 4), 1.5);
    }
  }
  function orb(x: number, y: number, z: number, r: number, tex: THREE.Texture, seed: number) {
    b.lathe(
      prof([
        [0, 0],
        [r * 0.9, 0],
        [r * 0.9, 0.01],
        [r * 0.5, 0.03],
        [r * 0.42, 0.05],
        [r * 0.62, 0.07],
        [0, 0.07],
      ]),
      { at: [x, y, z], bone: root, color: GOLD, segments: 10 },
    );
    const cy = y + 0.07 + r * 0.7;
    glow(b.part(new THREE.SphereGeometry(r, 12, 8), "#ffffff", { bone: root, at: [x, cy, z], texture: tex }), 0.9);
    b.part(new THREE.TorusGeometry(r * 0.72, 0.006, 5, 12), GOLD, {
      bone: root,
      at: [x, y + 0.07 + r * 0.12, z],
      rotation: [90, 0, 0],
    });
    motes(x, cy + r * 0.8, z, r * 0.9, 3, seed);
  }
  function flask(x: number, y: number, z: number, color: string) {
    glow(
      b.lathe(
        prof([
          [0, 0],
          [0.026, 0],
          [0.034, 0.015],
          [0.034, 0.035],
          [0.012, 0.06],
          [0.012, 0.08],
          [0, 0.08],
        ]),
        { at: [x, y, z], bone: root, color, segments: 8 },
      ),
      0.55,
    );
    cyl(0.013, 0.011, 0.02, 6, CORK, x, y + 0.09, z);
    b.part(new THREE.TorusGeometry(0.014, 0.003, 4, 8), GOLD, {
      bone: root,
      at: [x, y + 0.075, z],
      rotation: [90, 0, 0],
    });
    ball(0.006, "#ffffff", x + 0.02, y + 0.03, z + 0.03, 4);
  }
  function crystals(x: number, y: number, z: number) {
    const cs = [
      { dx: 0, dz: 0, h: 0.12, rx: 0, rz: 0, c: "#b98bff" },
      { dx: 0.035, dz: 0.01, h: 0.09, rx: 0, rz: -20, c: "#7fd8ff" },
      { dx: -0.035, dz: 0.0, h: 0.08, rx: 0, rz: 22, c: "#b98bff" },
      { dx: 0.0, dz: 0.035, h: 0.07, rx: 20, rz: 0, c: "#7fd8ff" },
      { dx: 0.01, dz: -0.03, h: 0.07, rx: -22, rz: 0, c: "#b98bff" },
    ];
    for (const c of cs)
      glow(
        b.part(new THREE.ConeGeometry(0.02, c.h, 5), c.c, {
          bone: root,
          at: [x + c.dx, y + c.h / 2 - 0.004, z + c.dz],
          rotation: [c.rx, 0, c.rz],
        }),
        0.8,
      );
  }
  function hourglass(x: number, y: number, z: number) {
    cyl(0.05, 0.052, 0.012, 8, GOLD_D, x, y + 0.006, z);
    cyl(0.05, 0.05, 0.012, 8, GOLD_D, x, y + 0.138, z);
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      cyl(0.004, 0.004, 0.126, 5, DOWEL, x + Math.cos(a) * 0.042, y + 0.075, z + Math.sin(a) * 0.042);
    }
    b.lathe(
      prof([
        [0, 0],
        [0.03, 0.006],
        [0.04, 0.03],
        [0.035, 0.05],
        [0.006, 0.06],
        [0.035, 0.07],
        [0.04, 0.09],
        [0.03, 0.114],
        [0, 0.12],
      ]),
      { at: [x, y + 0.012, z], bone: root, color: "#bfe9f0", segments: 8 },
    );
    glow(
      b.lathe(
        prof([
          [0, 0.004],
          [0.034, 0.012],
          [0.036, 0.024],
          [0.014, 0.044],
          [0, 0.046],
        ]),
        { at: [x, y + 0.012, z], bone: root, color: SAND, segments: 8 },
      ),
      0.7,
    );
    cyl(0.002, 0.002, 0.03, 3, SAND, x, y + 0.075, z);
  }

  // ---------------------------------------------------------------- frame
  const T = [0.13, 0.57, 1.01, 1.45];

  box(1.28, 0.1, 0.4, WOOD_D, 0, 0.05, 0);
  box(1.26, 0.012, 0.004, GOLD, 0, 0.075, 0.202);
  box(1.14, 1.76, 0.02, BACK, 0, 0.98, -0.17);
  for (const s of [1, -1]) {
    box(0.06, 1.76, 0.36, WOOD, s * 0.6, 0.98, 0);
    box(0.08, 0.06, 0.38, WOOD_D, s * 0.6, 0.13, 0);
    box(0.004, 1.72, 0.004, GOLD, s * 0.574, 0.98, 0.182);
    box(0.004, 1.72, 0.004, GOLD, s * 0.626, 0.98, 0.182);
    b.part(new THREE.PlaneGeometry(0.036, 1.6), "#ffffff", {
      bone: root,
      at: [s * 0.6, 0.98, 0.1815],
      texture: RUNE_V,
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.036, 1.6), "#ffffff", { bone: root, at: [s * 0.6, 0.98, 0.1822], texture: RUNE_V }),
      0.8,
    );
  }
  for (const t of T) {
    box(1.14, 0.03, 0.33, WOOD_H, 0, t - 0.015, -0.005);
    box(1.14, 0.008, 0.006, GOLD, 0, t - 0.02, 0.163);
    const pts: THREE.Vector3[] = [];
    for (let x = -0.54; x <= 0.541; x += 0.06) pts.push(new THREE.Vector3(x, t - 0.038, 0.16));
    studs(pts, 0.008, GOLD);
  }
  // top board, cornice, pediment
  box(1.26, 0.05, 0.38, WOOD_D, 0, 1.885, 0);
  box(1.32, 0.04, 0.42, WOOD, 0, 1.93, 0);
  box(1.34, 0.012, 0.43, GOLD, 0, 1.955, 0);
  b.part(new THREE.PlaneGeometry(1.1, 0.04), "#ffffff", { bone: root, at: [0, 1.885, 0.1915], texture: RUNE_H });
  glow(b.part(new THREE.PlaneGeometry(1.1, 0.04), "#ffffff", { bone: root, at: [0, 1.885, 0.1922], texture: RUNE_H }), 0.8);
  {
    const pts: THREE.Vector3[] = [];
    for (let x = -0.62; x <= 0.621; x += 0.05) pts.push(new THREE.Vector3(x, 1.928, 0.212));
    studs(pts, 0.01, GOLD);
  }
  b.extrude(
    prof([
      [-0.36, 0],
      [0.36, 0],
      [0.3, 0.03],
      [0.2, 0.07],
      [0.12, 0.13],
      [0.06, 0.2],
      [0, 0.26],
      [-0.06, 0.2],
      [-0.12, 0.13],
      [-0.2, 0.07],
      [-0.3, 0.03],
    ]),
    { at: [0, 1.961, 0.1], x: [1, 0, 0], thickness: 0.05, bevel: 0.006, color: WOOD_D },
  );
  glow(
    b.part(new THREE.TorusGeometry(0.045, 0.01, 5, 14, 4.4), GOLD, {
      bone: root,
      at: [0, 2.04, 0.128],
      rotation: [0, 0, 40],
    }),
    0.6,
  );
  cyl(0.012, 0.02, 0.03, 6, GOLD, 0, 2.23, 0.1);
  glow(b.part(new THREE.SphereGeometry(0.04, 10, 7), "#ffffff", { bone: root, at: [0, 2.275, 0.1], texture: ORB_CYAN }), 1);
  motes(0, 2.3, 0.1, 0.07, 4, 91);
  // corbels
  for (const t of T.slice(1))
    for (const s of [1, -1])
      b.extrude(
        prof([
          [0, 0],
          [0.07, 0],
          [0, -0.08],
        ]),
        { at: [s * 0.553, t - 0.03, 0.16], x: [0, 0, -1], thickness: 0.012, color: GOLD_D },
      );

  // side maps
  b.part(new THREE.PlaneGeometry(0.28, 0.36), "#ffffff", { bone: root, at: [0.6325, 1.3, 0], dir: [1, 0, 0], axis: "z", texture: MAP });
  b.part(new THREE.PlaneGeometry(0.28, 0.36), "#ffffff", { bone: root, at: [-0.6325, 1.2, 0], dir: [-1, 0, 0], axis: "z", texture: CHART });
  for (const [s, y] of [
    [1, 1.3],
    [-1, 1.2],
  ] as Array<[number, number]>)
    for (const dx of [-0.12, 0.12]) ball(0.012, GOLD, s * 0.636, y + 0.17, dx, 5);

  // rug
  b.part(new THREE.CylinderGeometry(1, 1, 0.012, 32), RUG, { bone: root, at: [0, 0.006, 0.4] });

  // ---------------------------------------------------------------- shelf 1
  {
    const t = T[0];
    const x = row(-0.545, t, [
      [0.07, 0.34, 0.24, 0],
      [0.06, 0.32, 0.22, 1],
      [0.08, 0.36, 0.25, 2],
      [0.05, 0.3, 0.2, 3],
      [0.07, 0.34, 0.24, 4],
      [0.06, 0.31, 0.22, 5],
      [0.08, 0.35, 0.25, 7],
    ]);
    bookAt(x + 0.03 + 0.07, t, 0.06, 0.33, 0.22, 6, 14);
    orb(0.25, t, 0.0, 0.075, ORB_CYAN, 7);
    // scroll barrel
    b.lathe(
      prof([
        [0, 0],
        [0.07, 0],
        [0.085, 0.06],
        [0.085, 0.14],
        [0.07, 0.2],
        [0, 0.2],
      ]),
      { at: [0.45, t, 0.0], bone: root, color: BARREL, segments: 10 },
    );
    for (const y of [0.04, 0.16])
      b.part(new THREE.TorusGeometry(0.081, 0.005, 4, 12), GOLD_D, { bone: root, at: [0.45, t + y, 0], rotation: [90, 0, 0] });
    const sc = [
      { dx: -0.03, dz: 0.02, rx: -10, rz: 12, c: 0 },
      { dx: 0.03, dz: 0.0, rx: 8, rz: -14, c: 1 },
      { dx: 0.0, dz: -0.03, rx: 16, rz: 0, c: 2 },
      { dx: 0.0, dz: 0.03, rx: -18, rz: 4, c: 0 },
      { dx: 0.02, dz: 0.02, rx: -4, rz: -6, c: 1 },
    ];
    for (const s of sc) {
      const p = pl(0.45 + s.dx, t + 0.3, s.dz, eul(s.rx * D2R, 0, s.rz * D2R));
      scroll(p, 0.24, 0.014, RIB[s.c]);
    }
  }

  // ---------------------------------------------------------------- shelf 2
  {
    const t = T[1];
    const top = stack(-0.4, t, 0.0, [
      [0.26, 0.045, 0.2, 0, 4],
      [0.23, 0.04, 0.19, 2, -6],
      [0.2, 0.05, 0.18, 5, 5],
      [0.17, 0.035, 0.16, 1, -3],
    ]);
    candle(-0.4, top, 0.0, 0.09, 0.016, WAX[0]);
    row(-0.24, t, [
      [0.05, 0.31, 0.22, 6],
      [0.07, 0.34, 0.24, 3],
      [0.06, 0.3, 0.2, 0],
      [0.08, 0.33, 0.24, 1],
      [0.05, 0.28, 0.19, 7],
    ]);
    flask(0.18, t, 0.04, "#58e0a8");
    flask(0.255, t, 0.0, "#ff6aa6");
    flask(0.33, t, 0.04, "#7fa8ff");
    hourglass(0.45, t, 0.02);
  }

  // ---------------------------------------------------------------- shelf 3: scroll rack
  {
    const t = T[2];
    for (const x of [-0.45, -0.35, -0.25]) box(0.008, 0.375, 0.2, WOOD_D, x, t + 0.1875, 0.03);
    for (const dy of [0.125, 0.25, 0.375]) box(0.32, 0.01, 0.2, WOOD_D, -0.41, t + dy, 0.03);
    const cellX = [-0.51, -0.4, -0.3];
    let k = 0;
    for (let row3 = 0; row3 < 3; row3++)
      for (let c = 0; c < 3; c++) {
        const base = t + row3 * 0.125 + 0.005;
        const rib = RIB[(k + row3) % 3];
        if ((k + c) % 2 === 0) {
          scroll(pl(cellX[c], base + 0.04, 0.03, eul(Math.PI / 2, 0, 0)), 0.2, 0.04, rib);
        } else {
          scroll(pl(cellX[c] - 0.022, base + 0.026, 0.03, eul(Math.PI / 2, 0, 0)), 0.2, 0.025, rib);
          scroll(pl(cellX[c] + 0.022, base + 0.026, 0.03, eul(Math.PI / 2, 0, 0)), 0.2, 0.025, RIB[(k + 1) % 3]);
        }
        k++;
      }
    row(-0.22, t, [
      [0.06, 0.3, 0.22, 4],
      [0.05, 0.33, 0.24, 0],
      [0.07, 0.28, 0.22, 2],
      [0.06, 0.31, 0.2, 6],
    ]);
    orb(0.14, t, 0.02, 0.06, ORB_VIOLET, 17);
    const top = stack(0.4, t, 0.0, [
      [0.22, 0.05, 0.2, 3, -5],
      [0.2, 0.04, 0.18, 6, 7],
    ]);
    candle(0.34, top, 0.0, 0.1, 0.016, WAX[1]);
    candle(0.46, top, 0.02, 0.07, 0.014, WAX[2], false);
  }

  // ---------------------------------------------------------------- shelf 4
  {
    const t = T[3];
    row(-0.55, t, [
      [0.05, 0.26, 0.2, 1],
      [0.06, 0.28, 0.21, 5],
      [0.05, 0.24, 0.19, 2],
      [0.07, 0.3, 0.22, 7],
      [0.05, 0.26, 0.2, 0],
    ]);
    // tall candlestick
    b.lathe(
      prof([
        [0, 0],
        [0.05, 0],
        [0.05, 0.01],
        [0.02, 0.03],
        [0.015, 0.18],
        [0.03, 0.2],
        [0.03, 0.21],
        [0, 0.21],
      ]),
      { at: [-0.17, t, 0.0], bone: root, color: GOLD, segments: 8 },
    );
    candle(-0.17, t + 0.21 - 0.078, 0.0, 0.1, 0.017, WAX[0], false);
    // open tome
    box(0.25, 0.014, 0.17, COVER_P[0], 0.1, t + 0.007, 0.02);
    for (const s of [-1, 1])
      b.part(new THREE.BoxGeometry(0.11, 0.012, 0.15), PAGE_LINES, {
        bone: root,
        at: [0.1 + s * 0.056, t + 0.02, 0.02],
        rotation: [0, 0, s * 7],
      });
    glow(ball(0.025, "#9fe8ff", 0.1, t + 0.1, 0.02, 8), 1.5);
    b.part(new THREE.TorusGeometry(0.04, 0.003, 4, 12), GOLD, { bone: root, at: [0.1, t + 0.1, 0.02], rotation: [90, 0, 0] });
    motes(0.1, t + 0.1, 0.02, 0.06, 4, 33);
    crystals(0.38, t, 0.0);
    candle(0.5, t, 0.02, 0.08, 0.015, WAX[1]);
  }

  // cornice top clutter
  candle(-0.5, 1.961, 0.0, 0.1, 0.017, WAX[2]);
  {
    const top = stack(0.5, 1.961, 0.0, [
      [0.2, 0.045, 0.18, 7, 8],
      [0.16, 0.04, 0.16, 3, -10],
    ]);
    crystals(0.5, top, 0.0);
  }

  // ---------------------------------------------------------------- floor clutter
  {
    const top = stack(-0.8, 0.012, 0.4, [
      [0.34, 0.07, 0.26, 0, 10],
      [0.3, 0.06, 0.24, 3, -14],
      [0.26, 0.05, 0.22, 6, 20],
    ]);
    candle(-0.8, top, 0.4, 0.12, 0.02, WAX[0]);
    scrollLying(-0.5, 0.012 + 0.02, 0.7, 0.28, 0.02, 15, RIB[0]);
    scrollLying(-0.45, 0.012 + 0.02, 0.76, 0.26, 0.02, -25, RIB[1]);
    scrollLying(-0.48, 0.012 + 0.058, 0.73, 0.24, 0.02, 5, RIB[2]);
    scrollLying(-0.2, 0.012 + 0.02, 0.85, 0.3, 0.02, 40, RIB[1]);
    // pedestal orb
    b.lathe(
      prof([
        [0, 0],
        [0.15, 0],
        [0.15, 0.05],
        [0.09, 0.09],
        [0.075, 0.45],
        [0.11, 0.5],
        [0.12, 0.54],
        [0.13, 0.56],
        [0, 0.56],
      ]),
      { at: [0.8, 0.012, 0.45], bone: root, color: STONE, segments: 8 },
    );
    orb(0.8, 0.572, 0.45, 0.1, ORB_AMBER, 52);
  }

  return b.root;
}
