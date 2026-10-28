import * as THREE from "three";
import { createBuilder, rng, grain, paint, mix, noise, cells, svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall gothic-arched wizard's bookcase in high-fantasy anime style: gilt-spined tomes, scroll pyramids, glowing orbs, candles, potions, crystals, an hourglass, an open spellbook with floating glyphs and a little owl in a wizard hat.",
};

const GOLD = "#e9bd57";
const GOLD_D = "#b8862b";
const PAPER = "#f1e2bd";

export default function build() {
  const b = createBuilder({ name: "wizard_bookshelf" });

  // ---------- paints ----------
  const GILT = metal("gilt");
  const BRASS = metal("brass", { tarnish: 0.2 });
  const WOOD_Y = grain("#4a2a22", "#74432f", { size: 0.012, axis: "y", seed: 3 });
  const WOOD_X = grain("#4a2a22", "#74432f", { size: 0.012, axis: "x", seed: 4 });
  const WOOD_TRIM = grain("#3a2019", "#5d3526", { size: 0.01, axis: "x", seed: 5 });
  const BACK = paint((p, _n) => {
    const c = cells(p, 0.055, 3);
    if (c.id > 0.6 && c.d1 < 0.06 + 0.06 * (c.id - 0.6)) return "#fff2b8";
    return mix("#1f1640", "#40307c", noise(p, 0.35, 2));
  });

  // ---------- textures ----------
  const spineSvg = (inner: string) =>
    svg(`<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`, { size: 192 });
  const band = (y: number, h = 3) => `<rect x="2" y="${y}" width="36" height="${h}" fill="${GOLD}"/>`;
  const SP_A = spineSvg(
    band(6) + band(12, 2) + band(104, 2) + band(110) +
      `<path d="M20 38 L32 60 L20 82 L8 60Z" fill="none" stroke="${GOLD}" stroke-width="3"/><circle cx="20" cy="60" r="4" fill="${GOLD_D}"/>`,
  );
  const SP_B = spineSvg(
    band(5, 5) + band(110, 5) + band(30, 2) + band(36, 2) + band(82, 2) + band(88, 2) +
      `<path d="M20 44 V76 M10 60 H30 M12 52 L28 68 M28 52 L12 68" stroke="${GOLD}" stroke-width="2.5" fill="none"/>`,
  );
  const SP_C = spineSvg(
    band(8, 2) + band(14, 2) + band(104, 2) + band(110, 2) +
      `<circle cx="20" cy="60" r="14" fill="none" stroke="${GOLD}" stroke-width="3"/><path d="M20 49 L23 58 L32 58 L25 64 L27 72 L20 67 L13 72 L15 64 L8 58 L17 58Z" fill="${GOLD_D}"/>`,
  );
  const SPINES = [SP_A, SP_B, SP_C];

  let fr = `<rect x="0" y="3" width="600" height="3" fill="${GOLD}"/><rect x="0" y="54" width="600" height="3" fill="${GOLD}"/>`;
  for (let i = 0; i < 12; i++) {
    const cx = 25 + i * 50;
    fr += `<path d="M${cx} 12 L${cx + 14} 30 L${cx} 48 L${cx - 14} 30Z" fill="none" stroke="${GOLD}" stroke-width="3"/><circle cx="${cx}" cy="30" r="4" fill="${GOLD}"/>`;
    if (i < 11)
      fr += `<path d="M${cx + 25} 18 v24 M${cx + 19} 24 l12 12 M${cx + 31} 24 l-12 12" stroke="#c99a3c" stroke-width="2.5" fill="none"/>`;
  }
  const FRIEZE = svg(`<svg viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg">${fr}</svg>`, { size: 1024 });

  let sp = "";
  for (let t = 0; t < 12.5; t += 0.3) sp += `${t === 0 ? "M" : "L"}${(32 + (3 + t * 2) * Math.cos(t)).toFixed(1)} ${(32 + (3 + t * 2) * Math.sin(t)).toFixed(1)}`;
  const SPIRAL = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#f1dfb5" stroke="#c9a25e" stroke-width="3"/><path d="${sp}" stroke="#9c6f3a" stroke-width="3" fill="none"/></svg>`,
    { size: 96 },
  );

  const orbTex = (top: string, mid: string, bot: string, seed: number) => {
    const r = rng(seed);
    let s = "";
    for (let i = 0; i < 5; i++) {
      const y = 8 + i * 12;
      s += `<path d="M0 ${y} Q32 ${y - 14} 64 ${y} T128 ${y}" stroke="#ffffff" stroke-opacity="0.45" stroke-width="2.5" fill="none"/>`;
    }
    for (let i = 0; i < 26; i++)
      s += `<circle cx="${(r() * 128).toFixed(1)}" cy="${(r() * 64).toFixed(1)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#ffffff"/>`;
    return svg(
      `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect width="128" height="64" fill="url(#g)"/>${s}</svg>`,
      { size: 256 },
    );
  };
  const ORB_V = orbTex("#3b1c8a", "#9a5cff", "#ff9bf0", 11);
  const ORB_C = orbTex("#0f4d9a", "#35d6ff", "#c8fff4", 12);
  const ORB_A = orbTex("#a8330a", "#ff9a2e", "#fff0a0", 13);

  const rr = rng(77);
  let pg = `<rect width="60" height="84" rx="4" fill="#f4e6c2"/>`;
  for (let row = 0; row < 9; row++)
    for (let g = 0; g < 6; g++) {
      const x = 6 + g * 8.5, y = 8 + row * 8.5;
      pg += `<path d="M${x} ${y} l${(rr() * 5).toFixed(1)} ${(rr() * 6).toFixed(1)} M${x + 2} ${y} v6" stroke="#6b3f17" stroke-width="1.4" fill="none"/>`;
    }
  pg += `<circle cx="30" cy="42" r="16" fill="none" stroke="#a8332a" stroke-width="1.6"/>`;
  const PAGE = svg(`<svg viewBox="0 0 60 84" xmlns="http://www.w3.org/2000/svg">${pg}</svg>`, { size: 192 });

  let gl = `<circle cx="50" cy="50" r="46" fill="none" stroke="#7fe8ff" stroke-width="3.5"/><circle cx="50" cy="50" r="37" fill="none" stroke="#bff6ff" stroke-width="2"/>`;
  gl += `<path d="M50 16 L79.4 67 L20.6 67Z M50 84 L20.6 33 L79.4 33Z" fill="none" stroke="#7fe8ff" stroke-width="3"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    gl += `<path d="M${50 + 38 * Math.cos(a)} ${50 + 38 * Math.sin(a)} L${50 + 44 * Math.cos(a)} ${50 + 44 * Math.sin(a)}" stroke="#ffffff" stroke-width="3"/>`;
  }
  gl += `<circle cx="50" cy="50" r="5" fill="#ffffff"/>`;
  const GLYPH = svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${gl}</svg>`, { size: 256 });

  const EYE = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="19" fill="#ffd34a" stroke="#3a2412" stroke-width="3"/><circle cx="20" cy="21" r="9" fill="#1b1020"/><circle cx="16" cy="16" r="4.5" fill="#ffffff"/><circle cx="24" cy="26" r="2" fill="#ffffff"/></svg>`,
    { size: 96 },
  );

  // ---------- primitive helpers ----------
  const part = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { at, ...o });
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (rt: number, rb: number, h: number, c: any, at: number[], seg = 8, o: any = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, o);
  const ell = (rx: number, ry: number, rz: number, c: any, at: number[], seg = 8, o: any = {}) =>
    part(new THREE.SphereGeometry(1, seg, Math.max(4, seg >> 1)), c, at, { scale: [rx, ry, rz], ...o });

  const BOOKCOL = ["#b3203a", "#2d3fa8", "#1f7a54", "#6a2fa0", "#1d8a9a", "#7a1830", "#c98a22", "#1b2250"];

  // ---------- book helpers ----------
  const book = (
    x: number, base: number, zFront: number, w: number, h: number, d: number,
    col: string, tex: THREE.Texture, o: { lean?: number; flat?: boolean; yaw?: number } = {},
  ) => {
    const lean = o.lean ?? 0, yaw = o.yaw ?? 0, flat = !!o.flat;
    const la = (lean * Math.PI) / 180, ya = (yaw * Math.PI) / 180;
    const zc = zFront - d / 2;
    const y0 = base + (flat ? 0 : (w / 2) * Math.abs(Math.sin(la)));
    const put = (lx: number, ly: number, lz: number) => {
      const x1 = lx * Math.cos(la) - ly * Math.sin(la);
      const y1 = lx * Math.sin(la) + ly * Math.cos(la);
      return [x + x1 * Math.cos(ya) + lz * Math.sin(ya), y0 + y1, zc - x1 * Math.sin(ya) + lz * Math.cos(ya)];
    };
    const rot = { rotation: [0, yaw, lean] };
    box(w, h, 0.014, col, put(0, h / 2, d / 2 - 0.007), rot);
    if (!flat) {
      for (const s of [1, -1]) box(0.007, h, d - 0.014, col, put(s * (w / 2 - 0.0035), h / 2, -0.007), rot);
      box(w, h, 0.008, col, put(0, h / 2, -d / 2 + 0.004), rot);
      box(w - 0.014, h - 0.014, d - 0.02, PAPER, put(0, h / 2, -0.004), rot);
      part(new THREE.PlaneGeometry(w * 0.96, h * 0.94), "#ffffff", put(0, h / 2, d / 2 + 0.0008), { ...rot, texture: tex });
    } else {
      box(w, 0.007, d - 0.014, col, put(0, 0.0035, -0.007), rot);
      box(w, 0.007, d - 0.014, col, put(0, h - 0.0035, -0.007), rot);
      box(w - 0.012, h - 0.012, d - 0.016, PAPER, put(0.002, h / 2, -0.007), rot);
      part(new THREE.PlaneGeometry(h * 0.94, w * 0.96).rotateZ(Math.PI / 2), "#ffffff", put(0, h / 2, d / 2 + 0.0008), { ...rot, texture: tex });
    }
    return base + h;
  };
  const ZF = 0.12;
  const rowRand = (x0: number, base: number, n: number, hMin: number, hMax: number, seed: number) => {
    const r = rng(seed);
    let x = x0;
    for (let i = 0; i < n; i++) {
      const w = 0.04 + r() * 0.035, h = hMin + r() * (hMax - hMin), d = 0.2 + r() * 0.08;
      book(x + w / 2, base, ZF, w, h, d, BOOKCOL[(i + seed) % BOOKCOL.length], SPINES[(i + seed) % 3]);
      x += w + 0.002;
    }
    return x;
  };
  const stack = (x: number, base: number, items: [number, number, number, string, number, number][]) => {
    let y = base;
    for (const [w, h, d, c, t, yaw] of items) y = book(x, y, ZF, w, h, d, c, SPINES[t], { flat: true, yaw });
    return y;
  };

  // ---------- props ----------
  const candle = (x: number, y: number, z: number, h: number, r = 0.016) => {
    cyl(r * 2.4, r * 2.6, 0.008, BRASS, [x, y + 0.004, z], 10);
    cyl(r, r * 1.05, h, "#f4ead2", [x, y + 0.008 + h / 2, z], 8);
    const top = y + 0.008 + h;
    cyl(r * 0.85, r * 0.85, 0.003, "#e8c987", [x, top, z], 8);
    ell(r * 0.5, r * 1.4, r * 0.5, "#f4ead2", [x + r * 0.95, top - 0.014, z], 5);
    cyl(0.0015, 0.0015, 0.012, "#2a1a10", [x, top + 0.006, z], 4);
    glow(ell(r * 0.7, r * 2.0, r * 0.7, "#ff9a2e", [x, top + r * 1.9, z], 6), 1);
    glow(ell(r * 0.38, r * 1.2, r * 0.38, "#fff1a0", [x, top + r * 1.5, z], 6), 1);
  };
  const orb = (x: number, base: number, z: number, r: number, tex: THREE.Texture, strength = 1) => {
    cyl(r * 0.55, r * 0.75, 0.02, GILT, [x, base + 0.01, z], 10);
    cyl(r * 0.18, r * 0.3, r * 0.5, GILT, [x, base + 0.02 + r * 0.25, z], 8);
    const cy = base + 0.02 + r * 1.3;
    part(new THREE.TorusGeometry(r * 0.68, r * 0.07, 5, 12), GILT, [x, cy - r * 0.75, z], { rotation: [90, 0, 0] });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      cyl(r * 0.02, r * 0.07, r * 0.7, GILT, [x + Math.cos(a) * r * 0.66, cy - r * 0.45, z + Math.sin(a) * r * 0.66], 5);
    }
    glow(part(new THREE.SphereGeometry(r, 12, 8), "#ffffff", [x, cy, z], { texture: tex }), strength);
  };
  const scrollZ = (x: number, y: number, zf: number, len: number, r: number, col: string, rib: string) => {
    const zc = zf - len / 2;
    cyl(r, r, len, col, [x, y, zc], 8, { rotation: [90, 0, 0] });
    cyl(r * 1.12, r * 1.12, 0.014, rib, [x, y, zc + len * 0.18], 8, { rotation: [90, 0, 0] });
    part(new THREE.CircleGeometry(r * 0.97, 10), "#ffffff", [x, y, zf + 0.001], { texture: SPIRAL });
  };
  const pyramid = (xc: number, base: number) => {
    const r = 0.03, cols = ["#ead8a8", "#e3cf98", "#f0e0b4", "#dcc78e", "#efdcaa", "#e6d3a0"];
    const ribs = ["#b3203a", "#2d3fa8", "#1f7a54", "#6a2fa0", "#c98a22", "#1d8a9a"];
    let i = 0;
    for (let row = 0; row < 3; row++) {
      const n = 3 - row;
      for (let k = 0; k < n; k++) {
        scrollZ(xc + (k - (n - 1) / 2) * 0.062, base + r + row * 0.0537, ZF, 0.22, r, cols[i % 6], ribs[i % 6]);
        i++;
      }
    }
  };
  const jar = (x: number, base: number, z: number) => {
    b.lathe(
      [[0, 0], [0.06, 0], [0.078, 0.05], [0.07, 0.14], [0.085, 0.165], [0.08, 0.175], [0, 0.175]],
      { at: [x, base, z], color: BRASS, segments: 10 },
    );
    const ribs = ["#b3203a", "#2d3fa8", "#c98a22", "#1f7a54"];
    [[-0.035, -0.02, 6], [0.03, 0.025, -8], [0.0, -0.035, 3], [0.04, -0.03, -4], [-0.02, 0.035, 10]].forEach(([dx, dz, tilt], i) => {
      const hgt = 0.26 + (i % 3) * 0.03;
      cyl(0.02, 0.02, hgt, i % 2 ? "#e6d3a0" : "#efdcaa", [x + dx, base + 0.17 + hgt / 2 - 0.03, z + dz], 7, { rotation: [0, 0, tilt] });
      cyl(0.023, 0.023, 0.012, ribs[i % 4], [x + dx + Math.sin((-tilt * Math.PI) / 180) * 0.06, base + 0.17 + hgt * 0.65 - 0.03, z + dz], 7, { rotation: [0, 0, tilt] });
    });
  };
  const hourglass = (x: number, base: number, z: number) => {
    cyl(0.062, 0.066, 0.014, GILT, [x, base + 0.007, z], 10);
    cyl(0.062, 0.058, 0.014, GILT, [x, base + 0.257, z], 10);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      cyl(0.005, 0.005, 0.25, GILT, [x + Math.cos(a) * 0.052, base + 0.132, z + Math.sin(a) * 0.052], 5);
    }
    const y0 = base + 0.014;
    b.lathe([[0, 0.12], [0.008, 0.12], [0.032, 0.145], [0.045, 0.19], [0.035, 0.226], [0, 0.236]], { at: [x, y0, z], color: "#cfeff5", segments: 10 });
    glow(b.lathe([[0, 0], [0.035, 0.012], [0.045, 0.04], [0.032, 0.085], [0.008, 0.12], [0, 0.12]], { at: [x, y0, z], color: "#f0b84a", segments: 10 }), 0.8);
    glow(ell(0.025, 0.012, 0.025, "#f0b84a", [x, y0 + 0.16, z], 6), 0.8);
  };
  const potion = (x: number, base: number, z: number, col: string, k = 1) => {
    glow(
      b.lathe([[0, 0], [0.04 * k, 0], [0.05 * k, 0.03 * k], [0.05 * k, 0.07 * k], [0.028 * k, 0.11 * k], [0.018 * k, 0.15 * k], [0.02 * k, 0.17 * k], [0, 0.17 * k]], { at: [x, base, z], color: col, segments: 9 }),
      0.8,
    );
    cyl(0.024 * k, 0.024 * k, 0.012, GILT, [x, base + 0.155 * k, z], 8);
    cyl(0.016 * k, 0.02 * k, 0.035, "#7a4a2a", [x, base + 0.19 * k, z], 7);
  };
  const crystal = (x: number, y: number, z: number, s: number, col: string) => {
    ell(0.05 * s, 0.012 * s, 0.045 * s, "#3b2f55", [x, y + 0.006 * s, z], 6);
    ([[0, 0, 1, 0], [0.04, 0.01, 0.7, 18], [-0.035, -0.01, 0.55, -22]] as number[][]).forEach(([dx, dz, h, tilt]) => {
      glow(
        part(new THREE.OctahedronGeometry(0.03 * s, 0), col, [x + dx * s, y + 0.012 * s + 0.03 * s * 1.9 * h, z + dz * s], { scale: [1, 1.9 * h, 1], rotation: [0, 25, tilt], flat: true }),
        0.9,
      );
    });
  };
  const sconce = (side: number, y: number) => {
    const x = side * 0.75;
    box(0.012, 0.1, 0.05, GILT, [x + side * 0.006, y, 0]);
    cyl(0.007, 0.007, 0.09, GILT, [x + side * 0.05, y - 0.01, 0], 6, { rotation: [0, 0, 90] });
    part(new THREE.TorusGeometry(0.02, 0.005, 5, 8), GILT, [x + side * 0.03, y - 0.03, 0], { rotation: [0, 90, 0] });
    candle(x + side * 0.085, y, 0, 0.09, 0.014);
  };

  // ---------- cabinet ----------
  const SY = [0.14, 0.6, 1.06, 1.52];
  const SURF = [0.16, 0.62, 1.08, 1.54];
  box(1.56, 0.1, 0.46, WOOD_TRIM, [0, 0.05, 0]);
  box(1.4, 0.07, 0.02, WOOD_TRIM, [0, 0.055, 0.225]);
  box(1.46, 0.02, 0.01, GILT, [0, 0.105, 0.232]);
  for (const s of [1, -1]) {
    box(0.06, 1.98, 0.42, WOOD_Y, [s * 0.72, 1.01, 0]);
    box(0.012, 1.9, 0.014, GILT, [s * 0.69, 1.05, 0.213]);
    box(0.012, 1.9, 0.014, GILT, [s * 0.75, 1.05, 0.213]);
    cyl(0.026, 0.034, 0.035, GILT, [s * 0.72, 2.02, 0.17], 8);
    ell(0.034, 0.034, 0.034, GILT, [s * 0.72, 2.07, 0.17], 8);
    b.spike([s * 0.72, 2.09, 0.17], [0, 1, 0], 0.1, 0.022, { color: GILT, sides: 6 });
    for (const z of [0.15, -0.15]) {
      cyl(0.03, 0.04, 0.05, GILT, [s * 0.72, 0.025, z * 1.4], 8);
    }
  }
  box(1.38, 2.0, 0.03, BACK, [0, 1.01, -0.195]);
  SY.forEach((y) => {
    box(1.38, 0.04, 0.42, WOOD_X, [0, y, 0]);
    box(1.38, 0.016, 0.006, GILT, [0, y, 0.213]);
  });
  box(1.62, 0.05, 0.46, WOOD_TRIM, [0, 2.0, 0]);
  box(1.64, 0.012, 0.48, GILT, [0, 2.031, 0]);
  box(1.38, 0.1, 0.03, WOOD_TRIM, [0, 1.925, 0.2]);
  part(new THREE.PlaneGeometry(1.34, 0.09), "#ffffff", [0, 1.925, 0.2155], { texture: FRIEZE });
  const TOP = 2.037;

  // arched crest panel with moon & stars
  const archPts = (hw: number, h0: number, hTop: number) => {
    const pts: number[][] = [[-hw, 0], [hw, 0], [hw, h0]];
    for (let k = 1; k <= 8; k++) {
      const t = k / 8;
      pts.push([hw * (1 - t), h0 + (hTop - h0) * (2 * t - t * t)]);
    }
    for (let k = 1; k < 8; k++) {
      const t = 1 - k / 8;
      pts.push([-hw * (1 - t), h0 + (hTop - h0) * (2 * t - t * t)]);
    }
    pts.push([-hw, h0]);
    return pts;
  };
  const crestOutline = archPts(0.68, 0.3, 0.75).map((p) => [p[0], p[1]] as [number, number]);
  b.extrude(crestOutline, { at: [0, TOP, -0.17], x: [1, 0, 0], thickness: 0.05, bevel: 0.006, color: WOOD_Y });
  const border = archPts(0.62, 0.3, 0.68).slice(2).map((p) => [p[0], TOP + p[1] + 0.0, -0.138]);
  border.unshift([-0.62, TOP + 0.0, -0.138]);
  border.push([0.62, TOP, -0.138]);
  b.sweep(border.slice(0, -0), 0.008, { color: GILT, sides: 4, caps: "flat" });
  part(new THREE.TorusGeometry(0.2, 0.011, 6, 22), GILT, [0, TOP + 0.52, -0.138]);
  const R = 0.13;
  const moon: [number, number][] = [];
  for (let k = 0; k <= 12; k++) {
    const a = ((49.5 + (k / 12) * 261) * Math.PI) / 180;
    moon.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  for (let k = 1; k < 12; k++) {
    const a = ((288.2 - (k / 12) * 216.4) * Math.PI) / 180;
    moon.push([0.4 * R + 0.8 * R * Math.cos(a), 0.8 * R * Math.sin(a)]);
  }
  glow(b.extrude(moon, { at: [-0.01, TOP + 0.52, -0.128], x: [1, 0, 0], thickness: 0.02, color: "#ffe08a" }), 0.9);
  const starOutline = (Rs: number): [number, number][] =>
    Array.from({ length: 10 }, (_, i) => {
      const a = Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? Rs * 0.45 : Rs;
      return [rad * Math.cos(a), rad * Math.sin(a)] as [number, number];
    });
  for (const [sx, sy, sr] of [[-0.42, 0.55, 0.055], [0.42, 0.5, 0.06], [-0.5, 0.3, 0.035], [0.52, 0.28, 0.04], [0.27, 0.68, 0.03], [-0.28, 0.66, 0.035]]) {
    glow(b.extrude(starOutline(sr), { at: [sx, TOP + sy, -0.128], x: [1, 0, 0], thickness: 0.016, color: "#fff3b0" }), 1);
  }

  // ---------- compartment 0 ----------
  let x = rowRand(-0.67, SURF[0], 8, 0.3, 0.4, 1);
  book(x + 0.03, SURF[0], ZF, 0.05, 0.36, 0.26, "#6a2fa0", SP_B, { lean: -14 });
  const top0 = stack(0.12, SURF[0], [
    [0.36, 0.06, 0.27, "#7a1830", 0, 2],
    [0.32, 0.05, 0.25, "#1b2250", 1, -4],
    [0.3, 0.045, 0.24, "#1f7a54", 2, 3],
    [0.26, 0.04, 0.22, "#c98a22", 0, -2],
  ]);
  candle(0.1, top0, 0.0, 0.08);
  crystal(0.45, SURF[0], 0.0, 1.4, "#b36bff");
  potion(0.59, SURF[0], 0.02, "#ff6fb4", 1.15);

  // ---------- compartment 1 ----------
  pyramid(-0.5, SURF[1]);
  x = rowRand(-0.36, SURF[1], 6, 0.28, 0.38, 4);
  book(x + 0.035, SURF[1], ZF, 0.055, 0.34, 0.25, "#2d3fa8", SP_C, { lean: -16 });
  orb(0.34, SURF[1], 0.0, 0.1, ORB_V);
  const top1 = stack(0.6, SURF[1], [[0.18, 0.045, 0.2, "#b3203a", 2, 5], [0.15, 0.035, 0.18, "#1d8a9a", 1, -6]]);
  candle(0.6, top1, 0.0, 0.1);

  // ---------- compartment 2 ----------
  jar(-0.55, SURF[2], -0.03);
  x = rowRand(-0.42, SURF[2], 7, 0.3, 0.4, 7);
  hourglass(0.12, SURF[2], 0.0);
  potion(0.31, SURF[2], 0.0, "#5fe38a", 1.2);
  potion(0.42, SURF[2], 0.03, "#5fc8ff", 0.95);
  const top2 = stack(0.58, SURF[2], [[0.2, 0.05, 0.22, "#c98a22", 1, -5], [0.17, 0.04, 0.2, "#7a1830", 0, 4]]);
  candle(0.58, top2, 0.0, 0.09);

  // ---------- compartment 3 ----------
  const top3 = stack(-0.5, SURF[3], [
    [0.3, 0.055, 0.26, "#1f7a54", 0, 3],
    [0.27, 0.05, 0.24, "#6a2fa0", 2, -4],
    [0.24, 0.045, 0.22, "#b3203a", 1, 2],
  ]);
  candle(-0.5, top3, 0.0, 0.08);
  x = rowRand(-0.3, SURF[3], 7, 0.22, 0.3, 9);
  orb(0.3, SURF[3], 0.0, 0.07, ORB_C);
  crystal(0.52, SURF[3], 0.0, 1.1, "#5fe8ff");
  candle(0.64, SURF[3], 0.02, 0.1);

  // ---------- top ----------
  // open spellbook
  const bx = -0.38;
  box(0.36, 0.012, 0.25, "#7a1830", [bx, TOP + 0.006, 0.03]);
  for (const s of [1, -1]) {
    const th = (s * 6 * Math.PI) / 180;
    const cx = bx - s * 0.083, cy = TOP + 0.023;
    box(0.165, 0.022, 0.23, PAPER, [cx, cy, 0.03], { rotation: [0, 0, s * 6] });
    const nrm = [Math.sin(th), Math.cos(th), 0];
    part(new THREE.PlaneGeometry(0.15, 0.21), "#ffffff", [cx + nrm[0] * 0.0125, cy + nrm[1] * 0.0125, 0.03], {
      dir: nrm, up: [0, 0, -1], axis: "z", texture: PAGE,
    });
  }
  box(0.012, 0.03, 0.25, "#5a1020", [bx, TOP + 0.015, 0.03]);
  for (const [gx, gy, gz, gs] of [[bx, 0.3, 0.05, 0.13], [bx - 0.13, 0.4, 0.02, 0.08], [bx + 0.11, 0.42, 0.03, 0.07]]) {
    glow(part(new THREE.PlaneGeometry(gs, gs), "#ffffff", [gx, TOP + gy, gz], { texture: GLYPH }), 1);
  }
  // big orb
  orb(0.0, TOP, 0.02, 0.12, ORB_A);
  // candles on small stacks
  const t5 = stack(0.24, TOP, [[0.16, 0.04, 0.18, "#2d3fa8", 0, 6]]);
  candle(0.24, t5, 0.03, 0.12);
  const t6 = stack(-0.17, TOP, [[0.14, 0.035, 0.16, "#1f7a54", 2, -8]]);
  candle(-0.17, t6, 0.04, 0.08);

  // owl in a wizard hat
  const ox = 0.52, oz = 0.02, oy = TOP;
  const OWL = "#8b6b4f", CREAM = "#f3e3c3";
  ell(0.075, 0.1, 0.07, OWL, [ox, oy + 0.1, oz], 8);
  ell(0.055, 0.08, 0.045, CREAM, [ox, oy + 0.095, oz + 0.03], 8);
  ell(0.07, 0.06, 0.065, OWL, [ox, oy + 0.215, oz], 8);
  for (const s of [1, -1]) {
    part(new THREE.CircleGeometry(0.022, 10), "#ffffff", [ox + s * 0.03, oy + 0.222, oz + 0.0635], { texture: EYE });
    ell(0.018, 0.08, 0.05, "#6b4f38", [ox + s * 0.075, oy + 0.1, oz - 0.01], 6, { rotation: [0, 0, s * 8] });
    box(0.02, 0.008, 0.035, "#e8892e", [ox + s * 0.025, oy + 0.004, oz + 0.04]);
    cyl(0.004, 0.012, 0.04, OWL, [ox + s * 0.075, oy + 0.255, oz], 5, { rotation: [0, 0, -s * 70] });
  }
  cyl(0.0, 0.011, 0.032, "#e8892e", [ox, oy + 0.203, oz + 0.07], 5, { rotation: [90, 0, 0] });
  cyl(0.08, 0.082, 0.007, "#1b2250", [ox, oy + 0.268, oz], 12);
  cyl(0.05, 0.062, 0.1, "#1b2250", [ox, oy + 0.32, oz], 10);
  cyl(0.052, 0.053, 0.016, GOLD, [ox, oy + 0.282, oz], 10);
  cyl(0.0, 0.034, 0.08, "#1b2250", [ox + 0.012, oy + 0.4, oz - 0.005], 8, { rotation: [0, 0, -22] });
  glow(ell(0.011, 0.011, 0.011, "#fff3b0", [ox + 0.052, oy + 0.436, oz - 0.005], 5), 1);

  // sconces on the sides
  sconce(1, 1.4);
  sconce(-1, 1.4);

  return b.root;
}
