import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  paint,
  noise,
  cells,
  mix,
  smoothstep,
  mottle,
  spots,
  grain,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Moss & Mushroom Terrarium",
  description:
    "A Ghibli-style glass geo-house terrarium on a wooden plinth: a miniature camphor tree, a mossy hillside, a stone lantern with a glowing flame, spotted and bioluminescent mushrooms, ferns, tiny flowers and a shy soot sprite.",
};

type Col = string | ReturnType<typeof paint>;
type P2 = [number, number];
type P3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RED = "#d8402c";
const CREAM = "#fff0d2";
const DEEP = "#2d5a34";

// Two-sided glass geometry from a convex polygon (fan) with explicit UVs.
function glassGeo(pts: P3[], uvs: P2[]) {
  const n = pts.length;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let side = 0; side < 2; side++)
    for (let i = 0; i < n; i++) {
      pos.push(...pts[i]);
      uv.push(...uvs[i]);
    }
  for (let i = 1; i < n - 1; i++) {
    idx.push(0, i, i + 1);
    idx.push(n, n + i + 1, n + i);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Glass drawn as streaks, edge tint, condensation and corner glints; everything else is cut away.
function glassTex(w: number, h: number, seed: number) {
  const r = rng(seed);
  const W = Math.round(w * 500);
  const H = Math.round(h * 500);
  let s = `<rect x="1.2" y="1.2" width="${W - 2.4}" height="${H - 2.4}" fill="none" stroke="#b6e3d6" stroke-width="1.5"/>`;
  const k = H * 0.55;
  for (const f of [0.14 + r() * 0.1, 0.58 + r() * 0.12]) {
    const x = W * f;
    const a = W * 0.04;
    const c = W * 0.011;
    s += `<polygon points="${x},${H} ${x + a},${H} ${x + a + k},0 ${x + k},0" fill="#eefcf7"/>`;
    s += `<polygon points="${x + W * 0.07},${H} ${x + W * 0.07 + c},${H} ${x + W * 0.07 + c + k},0 ${x + W * 0.07 + k},0" fill="#eefcf7"/>`;
  }
  for (let i = 0; i < 16; i++) {
    const cx = 6 + r() * (W - 12);
    const cy = 5 + r() * H * 0.5;
    const rr = 0.9 + r() * 1.5;
    s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(2)}" fill="#d4f1e7"/>`;
    s += `<circle cx="${(cx - rr * 0.3).toFixed(1)}" cy="${(cy - rr * 0.3).toFixed(1)}" r="${(rr * 0.35).toFixed(2)}" fill="#ffffff"/>`;
    s += `<path d="M${(cx - rr * 0.8).toFixed(1)} ${(cy + rr * 0.4).toFixed(1)} Q${cx.toFixed(1)} ${(cy + rr * 1.15).toFixed(1)} ${(cx + rr * 0.8).toFixed(1)} ${(cy + rr * 0.4).toFixed(1)}" stroke="#86c8b8" stroke-width="0.9" fill="none"/>`;
  }
  const star = (x: number, y: number, z: number) =>
    `<path d="M${x} ${y - z} L${x + z * 0.18} ${y - z * 0.18} L${x + z} ${y} L${x + z * 0.18} ${y + z * 0.18} L${x} ${y + z} L${x - z * 0.18} ${y + z * 0.18} L${x - z} ${y} L${x - z * 0.18} ${y - z * 0.18}Z" fill="#ffffff"/>`;
  s += star(9, 9, 6) + star(W - 10, H - 12, 4);
  return svg(`<svg viewBox="0 0 ${W} ${H}">${s}</svg>`, { size: 512 });
}

function tuftSvg(tip: string, mid: string, base: string) {
  const blades: [number, number, number, number][] = [
    [6, 2, 10, -3],
    [10, 7, 3, -2],
    [14, 12, 6, -1],
    [16, 17, 1, 1],
    [19, 22, 8, 2],
    [23, 26, 4, 3],
    [12, 9, 13, -2],
    [20, 24, 13, 2],
    [27, 30, 14, 2],
  ];
  const paths = blades
    .map(
      ([bx, tx, ty, bend]) =>
        `<path d="M${bx - 1.9},32 Q${bx + bend},${(32 + ty) / 2} ${tx},${ty} Q${bx + bend + 3},${(32 + ty) / 2 + 1} ${bx + 1.9},32Z" fill="url(#g)"/>`,
    )
    .join("");
  return svg(
    `<svg viewBox="0 0 32 32"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="32" x2="0" y2="0"><stop offset="0" stop-color="${base}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${tip}"/></linearGradient></defs>${paths}</svg>`,
    { size: 128 },
  );
}

function fernSvg() {
  let s = `<path d="M20 64 Q23 34 20 4" stroke="#3b7a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 11; i++) {
    const y = 58 - i * 5;
    const len = 16 * (1 - i * 0.075) + 2;
    const col = i % 2 ? "#6fb04a" : "#8fcb5a";
    for (const d of [-1, 1]) {
      const tx = 20 + d * len;
      s += `<path d="M20 ${y} Q${20 + d * len * 0.5} ${y - 6} ${tx} ${y - 8} Q${20 + d * len * 0.55} ${y + 1} 20 ${y + 2}Z" fill="${col}"/>`;
    }
  }
  s += `<path d="M20 4 Q17 0 20 -1 Q23 0 20 4Z" fill="#8fcb5a"/>`;
  return svg(`<svg viewBox="0 0 40 64">${s}</svg>`, { size: 192 });
}

function leafSvg() {
  const cols = ["#3a7a45", "#5aa24a", "#7bbd55", "#4a9048", "#9ad060", "#68b04e"];
  let s = "";
  [-62, -36, -12, 12, 36, 62].forEach((a, i) => {
    s += `<g transform="rotate(${a} 24 44)"><ellipse cx="24" cy="24" rx="7.5" ry="19" fill="${cols[i]}"/><path d="M24 44 L24 8" stroke="#b6e07a" stroke-width="1.2" opacity="1"/></g>`;
  });
  return svg(`<svg viewBox="0 0 48 48">${s}</svg>`, { size: 128 });
}

function flowerSvg() {
  let s = `<rect x="11" y="13" width="2.2" height="19" fill="#4d8a3e"/>`;
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    s += `<circle cx="${(12 + Math.sin(a) * 4.6).toFixed(2)}" cy="${(9 - Math.cos(a) * 4.6).toFixed(2)}" r="4.1" fill="#fff8ee" stroke="#e9d5c0" stroke-width="0.6"/>`;
  }
  s += `<circle cx="12" cy="9" r="2.5" fill="#f2c53d"/>`;
  return svg(`<svg viewBox="0 0 24 32">${s}</svg>`, { size: 128 });
}

function fuzzSvg() {
  let s = "";
  [
    [6, 4, -3],
    [10, 8, 6],
    [14, 16, 3],
    [18, 12, 4],
    [22, 26, 0],
  ].forEach(([bx, tx, ty]) => {
    s += `<path d="M${bx} 24 Q${(bx + tx) / 2 + 2} ${12 + ty} ${tx} ${3 + Math.abs(ty)}" stroke="#17151e" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  });
  return svg(`<svg viewBox="0 0 24 24">${s}</svg>`, { size: 96 });
}

function plaqueSvg() {
  return svg(
    `<svg viewBox="0 0 200 40">
    <rect x="1" y="1" width="198" height="38" rx="6" fill="#d9ad55" stroke="#6e4d1c" stroke-width="2"/>
    <rect x="6" y="6" width="188" height="28" rx="3" fill="none" stroke="#8a6224" stroke-width="1.4"/>
    <path d="M14 26 Q14 12 24 12 Q34 12 34 26Z" fill="#c8402c"/>
    <circle cx="20" cy="18" r="1.6" fill="#fff0d2"/><circle cx="27" cy="16" r="1.3" fill="#fff0d2"/>
    <rect x="21" y="26" width="6" height="6" fill="#f3e4c4"/>
    <text x="100" y="25" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="13" letter-spacing="1" fill="#3b2810">moss &amp; mushrooms</text>
    <path d="M166 31 Q164 14 184 10 Q186 28 166 31Z" fill="#4f8a3c"/>
    <path d="M166 31 Q174 22 184 10" stroke="#d9e8a0" stroke-width="1.2" fill="none"/>
  </svg>`,
    { size: 512 },
  );
}

export default function build() {
  const b = createBuilder({ name: "terrarium" });
  const R = rng(2024);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const box = (at: P3, size: P3, color: Col) => b.part(new THREE.BoxGeometry(...size), color, { at });

  // ---- measurements
  const HW = 0.17; // half width of glass
  const HD = 0.11; // half depth
  const Y0 = 0.04; // glass floor
  const EAVE = 0.24;
  const RIDGE = 0.33;
  const SOIL_TOP = 0.084;

  // ---- paints
  const WOOD = grain("#7f4f2c", "#a56d3c", { size: 0.006, axis: "x", seed: 3 });
  const WOOD_LIP = grain("#a2693a", "#c48a52", { size: 0.006, axis: "x", seed: 4 });
  const WOOD_FOOT = grain("#55361f", "#6e4729", { size: 0.004, axis: "y", seed: 5 });
  const FRAME = mottle("#2f5b4c", "#417862", { size: 0.04, seed: 5 });
  const BRASS = mottle("#cf9f44", "#f1cf7e", { size: 0.02, seed: 6 });
  const BARK = grain("#5e4029", "#8b6440", { size: 0.004, axis: "y", seed: 2 });
  const STONE = paint((p, n) => {
    const base = mix("#8d9187", "#b4b4a4", noise(p, 0.012, 9));
    const m = noise(p, 0.02, 12);
    return n.y > 0.55 && m > 0.45 ? mix(base, "#6f9a48", smoothstep(0.45, 0.6, m)) : base;
  });
  const MOSS_P = paint((p, n) => {
    const t = smoothstep(-0.2, 1, n.y) * 0.55 + noise(p, 0.03, 2) * 0.45 + (noise(p, 0.008, 6) - 0.5) * 0.22;
    if (noise(p, 0.05, 15) > 0.7 && t > 0.5) return "#d4dc72";
    return t > 0.8 ? "#b5da64" : t > 0.62 ? "#8cc458" : t > 0.45 ? "#5f9b45" : t > 0.3 ? "#3f7a3e" : DEEP;
  });
  const LEAF_P = paint((p, n) => {
    const t = smoothstep(-0.5, 0.95, n.y) * 0.7 + noise(p, 0.012, 4) * 0.3;
    return t > 0.74 ? "#cfe87a" : t > 0.56 ? "#98cf5c" : t > 0.38 ? "#5aa04a" : "#2f6b43";
  });
  const SOIL_P = paint((p) => {
    const y = p.y + (noise(p, 0.03, 1) - 0.5) * 0.008;
    if (y < 0.058) {
      const c = cells(p, 0.011, 4);
      const cols = ["#b9b3a2", "#8f9a94", "#d8c9a4", "#a68f78", "#6f7a78"];
      return c.d2 - c.d1 < 0.12 ? "#4a463f" : cols[Math.floor(c.id * cols.length) % cols.length];
    }
    if (y < 0.066) return mix("#202024", "#3d3a38", noise(p, 0.008, 7));
    return mix("#54361f", "#7b5336", noise(p, 0.01, 3));
  });

  // ---- textures
  const GW = glassTex(0.34, 0.2, 11);
  const GS = glassTex(0.22, 0.2, 12);
  const GR = glassTex(0.34, 0.142, 13);
  const GG = glassTex(0.22, 0.09, 14);
  const TUFT_L = tuftSvg("#d3e87c", "#8cc458", "#3f7a3e");
  const TUFT_D = tuftSvg("#8cc458", "#4f9444", "#2d5a34");
  const FERN = fernSvg();
  const LEAF = leafSvg();
  const FLOWER = flowerSvg();
  const FUZZ = fuzzSvg();
  const PLAQUE = plaqueSvg();

  // =============================================================================================================
  // Wooden plinth
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.013, 0.017, 0.012, 8), WOOD_FOOT, { at: [sx * 0.15, 0.006, sz * 0.095] });
  box([0, 0.021, 0], [0.372, 0.022, 0.252], WOOD);
  box([0, 0.036, 0], [0.384, 0.008, 0.264], WOOD_LIP);
  b.part(new THREE.PlaneGeometry(0.1, 0.02), "#ffffff", { at: [0, 0.021, 0.1269], texture: PLAQUE });
  for (const s of [1, -1]) box([s * 0.19, 0.02, 0], [0.002, 0.014, 0.24], BRASS);

  // =============================================================================================================
  // Soil layers and moss hills
  b.part(new THREE.BoxGeometry(0.326, SOIL_TOP - Y0, 0.206), SOIL_P, { at: [0, (Y0 + SOIL_TOP) / 2, 0] });

  const mounds: ReturnType<typeof b.part>[] = [];
  const mound = (x: number, z: number, rx: number, ry: number, rz: number) =>
    mounds.push(
      b.part(new THREE.SphereGeometry(1, 16, 10), MOSS_P, { at: [x, 0.086, z], scale: [rx, ry, rz] }),
    );
  mound(0, 0, 0.162, 0.016, 0.102);
  mound(-0.07, -0.045, 0.09, 0.045, 0.055);
  mound(0.095, -0.04, 0.065, 0.032, 0.06);
  mound(0.11, 0.055, 0.05, 0.022, 0.045);
  mound(-0.1, 0.06, 0.06, 0.025, 0.04);
  mound(-0.01, 0.065, 0.07, 0.02, 0.038);
  mound(0, -0.075, 0.07, 0.03, 0.028);

  const moss = b.surface(mounds);
  const ground = (x: number, z: number) => {
    const h = moss.ray([x, 0.5, z], [0, -1, 0]);
    if (!h) throw new Error(`no ground at ${x}, ${z}`);
    return h;
  };
  const avoid: P3[] = [];

  // =============================================================================================================
  // Mushrooms
  type Kind = {
    cap: (r: number, seed: number) => Col;
    stem: string;
    gill: string;
    shape: "dome" | "bell" | "flat";
    ring?: boolean;
    glow?: boolean;
  };
  const GLOW_CAPS = ["#8ff5d4", "#c9f56a", "#9fe8ff"];
  const KINDS: Record<string, Kind> = {
    amanita: { cap: (r, sd) => spots(RED, CREAM, { size: r * 0.42, amount: 0.55, seed: sd }), stem: "#f6ead0", gill: "#f2dcae", shape: "dome", ring: true },
    amanitaS: { cap: (r, sd) => spots("#e2503a", CREAM, { size: Math.max(r * 0.5, 0.005), amount: 0.5, seed: sd }), stem: "#f6ead0", gill: "#f2dcae", shape: "dome" },
    tan: { cap: (_r, sd) => mottle("#c88a4c", "#a86a38", { size: 0.01, seed: sd }), stem: "#efdcb6", gill: "#e9c98f", shape: "dome" },
    pink: { cap: (r, sd) => spots("#e8a7b8", "#fff4ea", { size: r * 0.4, amount: 0.4, seed: sd }), stem: "#fbeee2", gill: "#f6d7cc", shape: "flat" },
    bell: { cap: (_r, sd) => mottle("#dcb560", "#b98a3a", { size: 0.008, seed: sd }), stem: "#f0e6c8", gill: "#d8b878", shape: "bell" },
    glow: { cap: () => "#8ff5d4", stem: "#d5fff0", gill: "#d5fff0", shape: "dome", glow: true },
  };
  const capOutline = (shape: Kind["shape"], r: number, ch: number): P2[] =>
    shape === "bell"
      ? [[0, 0], [r, 0], [r * 0.97, ch * 0.3], [r * 0.72, ch * 0.7], [r * 0.32, ch * 0.95], [0, ch]]
      : shape === "flat"
        ? [[0, 0], [r, 0], [r, ch * 0.3], [r * 0.82, ch * 0.75], [r * 0.45, ch * 0.97], [0, ch]]
        : [[0, 0], [r, 0], [r, ch * 0.18], [r * 0.9, ch * 0.52], [r * 0.58, ch * 0.86], [0, ch]];

  let shroomCount = 0;
  function shroom(x: number, z: number, r: number, h: number, kind: string, lx = 0, lz = 0) {
    const k = KINDS[kind];
    const g = ground(x, z);
    const up = V(0, 1, 0).lerp(g.n, 0.35).add(V(lx, 0, lz)).normalize();
    const base = g.at.clone().addScaledVector(up, -0.004);
    const rs = Math.max(r * 0.26, 0.0028);
    const seed = 3 + shroomCount++;
    const stemCol: Col = k.glow
      ? k.stem
      : paint((_p, _n, s) => mix("#d8c39a", k.stem, smoothstep(0, h * 0.5, s[0])));
    const stem = b.lathe(
      [[0, 0], [rs * 1.7, 0], [rs * 1.25, h * 0.14], [rs, h * 0.5], [rs * 0.92, h], [0, h]] as P2[],
      { at: base, axis: up, segments: 8, color: stemCol },
    );
    if (k.glow) glow(stem, 0.7);
    if (k.ring) {
      b.lathe(
        [[0, 0], [rs * 1.05, 0], [rs * 2.3, -h * 0.2], [rs * 2.1, -h * 0.24], [rs * 0.95, -h * 0.07], [0, -h * 0.07]] as P2[],
        { at: base.clone().addScaledVector(up, h * 0.62), axis: up, segments: 8, color: "#fff4de" },
      );
    }
    const ch = r * (k.shape === "bell" ? 1.5 : k.shape === "flat" ? 0.55 : 0.8);
    const capPos = base.clone().addScaledVector(up, h * 0.93);
    let capCol: Col;
    if (k.glow) capCol = GLOW_CAPS[seed % GLOW_CAPS.length];
    else {
      const body = k.cap(r, seed);
      capCol = paint((_p, _n, s) => (s[0] < 0.0008 ? k.gill : body));
    }
    const cap = b.lathe(capOutline(k.shape, r, ch), {
      at: capPos,
      axis: up,
      segments: r < 0.01 ? 8 : 12,
      color: capCol,
    });
    if (k.glow) glow(cap, 1.35);
    avoid.push([x, z, r * 1.15 + 0.003]);
  }

  const SH: [number, number, number, number, string, number, number][] = [
    [0.02, 0.045, 0.03, 0.055, "amanita", 0.04, -0.02],
    [0.065, 0.077, 0.02, 0.036, "amanita", -0.1, 0.05],
    [0.045, 0.012, 0.012, 0.024, "amanitaS", 0.1, -0.04],
    [0.082, 0.095, 0.008, 0.016, "amanitaS", -0.05, 0.1],
    [-0.035, 0.062, 0.018, 0.03, "pink", 0.05, 0.03],
    [-0.058, 0.084, 0.011, 0.02, "pink", -0.1, 0.0],
    [-0.11, 0.062, 0.022, 0.035, "tan", 0.1, 0.0],
    [-0.138, 0.04, 0.014, 0.026, "tan", 0.2, -0.1],
    [-0.095, 0.09, 0.012, 0.02, "tan", -0.05, 0.1],
    [0.135, -0.075, 0.008, 0.03, "bell", 0.1, 0.0],
    [0.15, -0.058, 0.006, 0.024, "bell", -0.12, 0.05],
    [0.12, -0.09, 0.006, 0.02, "bell", 0.0, 0.1],
    [-0.1, -0.02, 0.012, 0.022, "glow", 0.1, 0.1],
    [-0.118, 0.0, 0.008, 0.016, "glow", 0.0, 0.15],
    [-0.04, -0.078, 0.01, 0.02, "glow", -0.1, 0.0],
    [-0.105, -0.082, 0.014, 0.026, "glow", 0.05, 0.1],
    [-0.145, -0.06, 0.008, 0.016, "glow", 0.2, 0.0],
    [0.0, 0.03, 0.005, 0.01, "amanitaS", 0, 0],
    [-0.075, 0.04, 0.005, 0.012, "tan", 0.1, 0],
    [0.035, 0.098, 0.005, 0.01, "pink", 0, 0],
    [-0.02, 0.098, 0.004, 0.009, "amanitaS", 0, 0],
    [0.15, 0.09, 0.005, 0.01, "bell", 0, 0],
  ];
  for (const [x, z, r, h, kind, lx, lz] of SH) shroom(x, z, r, h, kind, lx, lz);

  // =============================================================================================================
  // Miniature camphor tree
  {
    const g = ground(-0.07, -0.045);
    const T0 = g.at.clone().add(V(0, -0.004, 0));
    avoid.push([T0.x, T0.z, 0.03]);
    const tp = [[0, 0, 0], [0.005, 0.025, 0.004], [-0.005, 0.05, 0], [0.002, 0.072, -0.005], [0, 0.09, -0.002]].map(
      ([x, y, z]) => T0.clone().add(V(x, y, z)),
    );
    const trunk = catmull(tp);
    b.sweep(trunk, [0.017, 0.011, 0.008, 0.0055, 0.004], { color: BARK, sides: 7, caps: { start: "flat", end: "round" } });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      const c = Math.cos(a);
      const s = Math.sin(a);
      b.sweep(
        catmull([
          T0.clone().add(V(c * 0.003, 0.014, s * 0.003)),
          T0.clone().add(V(c * 0.013, 0.004, s * 0.013)),
          T0.clone().add(V(c * 0.026, -0.003, s * 0.026)),
        ]),
        [0.007, 0.0018],
        { color: BARK, sides: 5 },
      );
    }
    const lobes: [number, number, number, number][] = [
      [0, 0.088, 0, 0.036],
      [-0.032, 0.07, 0.008, 0.027],
      [0.034, 0.074, -0.006, 0.028],
      [0.008, 0.07, 0.03, 0.025],
      [-0.006, 0.068, -0.03, 0.026],
      [-0.012, 0.115, 0.004, 0.026],
      [0.02, 0.108, 0.015, 0.022],
    ];
    const start = trunk.at(0.58);
    for (const [x, y, z] of lobes.slice(1, 5)) {
      const end = T0.clone().add(V(x * 0.9, y - 0.012, z * 0.9));
      const midp = start.clone().lerp(end, 0.5).add(V(0, 0.004, 0));
      b.sweep(catmull([start, midp, end]), [0.0042, 0.0016], { color: BARK, sides: 5 });
    }
    const blobs = lobes.map(([x, y, z, r]) =>
      b.part(new THREE.IcosahedronGeometry(1, 1), LEAF_P, {
        at: T0.clone().add(V(x, y, z)),
        scale: [r, r * 0.82, r],
        flat: true,
      }),
    );
    const hits = b.surface(blobs).scatter(110, { rng: rng(31), minDist: 0.012, filter: (h) => h.n.y > -0.1 });
    b.cards(hits, LEAF, { size: [0.03, 0.03], lean: 55, bend: 20, vary: 0.3, spin: 30, rng: rng(32) });
  }

  // =============================================================================================================
  // Stone lantern with a glowing flame
  {
    const LX = 0.098;
    const LZ = -0.042;
    const LY = ground(LX, LZ).at.y - 0.003;
    const LS = 0.85;
    avoid.push([LX, LZ, 0.036]);
    const lh = (o: P2[], y: number) =>
      b.lathe(o.map(([x, yy]) => [x * LS, yy * LS] as P2), { at: [LX, LY + y * LS, LZ], segments: 6, color: STONE });
    lh([[0, 0], [0.022, 0], [0.022, 0.005], [0.017, 0.008], [0, 0.008]], 0);
    b.part(new THREE.CylinderGeometry(0.0075 * LS, 0.009 * LS, 0.022 * LS, 6), STONE, {
      at: [LX, LY + 0.019 * LS, LZ],
    });
    lh([[0, 0], [0.02, 0], [0.022, 0.003], [0.018, 0.006], [0, 0.006]], 0.03);
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        box([LX + sx * 0.0085 * LS, LY + 0.044 * LS, LZ + sz * 0.0085 * LS], [0.004 * LS, 0.016 * LS, 0.004 * LS], STONE);
    glow(
      b.part(new THREE.BoxGeometry(0.012 * LS, 0.012 * LS, 0.012 * LS), "#ffd070", {
        at: [LX, LY + 0.044 * LS, LZ],
      }),
      1.7,
    );
    box([LX, LY + 0.0535 * LS, LZ], [0.028 * LS, 0.003 * LS, 0.028 * LS], STONE);
    lh([[0, 0], [0.036, 0], [0.036, 0.002], [0.012, 0.013], [0, 0.016]], 0.055);
    b.part(new THREE.SphereGeometry(0.004 * LS, 6, 5), STONE, { at: [LX, LY + 0.073 * LS, LZ] });
  }

  // Stepping stones and pebbles
  for (const [x, z, r] of [[0.12, 0.088, 0.013], [0.098, 0.066, 0.012], [0.112, 0.04, 0.013], [0.094, 0.018, 0.011], [0.104, -0.004, 0.012]] as P3[]) {
    const g = ground(x, z);
    b.part(new THREE.CylinderGeometry(r, r * 1.1, 0.008, 7), STONE, {
      at: g.at.clone().addScaledVector(g.n, -0.0015),
      dir: g.n,
      flat: true,
    });
    avoid.push([x, z, r + 0.003]);
  }
  for (const [x, z, r] of [[-0.15, 0.095, 0.007], [-0.02, 0.1, 0.006], [0.14, 0.1, 0.006], [0.045, -0.095, 0.008], [-0.15, -0.095, 0.007], [0.055, 0.052, 0.005], [-0.065, 0.1, 0.005]] as P3[]) {
    const g = ground(x, z);
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      at: g.at.clone().addScaledVector(g.n, -0.001),
      scale: [r, r * 0.65, r * 0.9],
      flat: true,
    });
    avoid.push([x, z, r + 0.002]);
  }

  // Ferns
  const fern = (x: number, z: number, count: number, len: number, off: number) => {
    const g = ground(x, z);
    const fr = [];
    for (let i = 0; i < count; i++) {
      const a = (i * Math.PI * 2) / count + off;
      fr.push(frame(g.at.clone().add(V(Math.cos(a) * 0.004, 0, Math.sin(a) * 0.004)), [Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35]));
    }
    b.cards(fr, FERN, {
      size: [len * 0.55, len],
      lean: 40,
      bend: 50,
      flow: (_f, i) => [Math.cos((i * Math.PI * 2) / count + off), 0, Math.sin((i * Math.PI * 2) / count + off)],
      vary: 0.25,
      rng: R,
    });
    avoid.push([x, z, 0.02]);
  };
  fern(-0.142, 0.083, 7, 0.06, 0.2);
  fern(0.145, 0.086, 6, 0.05, 1.1);
  fern(0.02, -0.088, 7, 0.058, 0.7);

  // Moss tufts and flowers
  const free = (x: number, z: number) => avoid.every(([ax, az, ar]) => Math.hypot(x - ax, z - az) > ar);
  const tufts = moss.scatter(240, {
    rng: rng(11),
    minDist: 0.011,
    filter: (h) => h.n.y > 0.3 && h.at.y > 0.092 && free(h.at.x, h.at.z),
  });
  b.cards(tufts, [TUFT_L, TUFT_D, TUFT_L], {
    size: [0.018, 0.016],
    lean: 15,
    bend: 20,
    cross: true,
    vary: 0.35,
    spin: 180,
    rng: rng(12),
  });
  const flowers = moss.scatter(22, {
    rng: rng(21),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.5 && h.at.y > 0.092 && free(h.at.x, h.at.z),
  });
  b.cards(flowers, FLOWER, { size: [0.011, 0.015], cross: true, vary: 0.3, rng: rng(22) });

  // =============================================================================================================
  // Soot sprite peeking from behind the pink mushrooms
  {
    const SR = 0.0085;
    const g = ground(-0.012, 0.088);
    const c = g.at.clone().add(V(0, SR * 0.8, 0));
    const body = b.part(new THREE.SphereGeometry(1, 10, 8), "#17151e", { at: c, scale: [SR, SR * 0.95, SR] });
    const hair = b.surface(body).scatter(40, { rng: rng(41), minDist: 0.003 });
    b.cards(hair, FUZZ, { size: [0.009, 0.008], lean: 20, cross: true, vary: 0.3, rng: rng(42) });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.0033, 8, 6), "#ffffff", { at: c.clone().add(V(s * 0.0036, 0.002, 0.0066)) });
      b.part(new THREE.SphereGeometry(0.0016, 6, 5), "#111111", { at: c.clone().add(V(s * 0.0034, 0.0018, 0.0094)) });
    }
  }

  // =============================================================================================================
  // Frame: verdigris-green metal with brass fittings
  for (const s of [1, -1]) {
    box([0, Y0 + 0.006, s * HD], [0.352, 0.012, 0.01], FRAME);
    box([s * HW, Y0 + 0.006, 0], [0.01, 0.012, 0.23], FRAME);
    box([0, EAVE, s * HD], [0.352, 0.008, 0.009], FRAME);
    box([s * HW, EAVE, 0], [0.009, 0.008, 0.232], FRAME);
    for (const t of [1, -1]) {
      box([s * HW, (Y0 + EAVE) / 2 + 0.003, t * HD], [0.01, EAVE - Y0 - 0.006, 0.01], FRAME);
      box([s * HW, Y0 + 0.009, t * HD], [0.015, 0.018, 0.015], BRASS);
      box([s * HW, EAVE + 0.002, t * HD], [0.013, 0.012, 0.013], BRASS);
    }
  }
  // rivets along the bottom rails
  for (const s of [1, -1])
    for (let i = 0; i < 11; i++)
      b.part(new THREE.SphereGeometry(0.0022, 6, 4), BRASS, { at: [-0.15 + i * 0.03, Y0 + 0.006, s * (HD + 0.0048)] });

  // roof structure
  for (const sx of [1, -1]) {
    for (const sz of [1, -1])
      b.rod([sx * HW, EAVE, sz * HD], [sx * HW, RIDGE, 0], 0.0033, { color: FRAME, sides: 6 });
    b.rod([sx * HW, EAVE, 0], [sx * HW, RIDGE, 0], 0.0028, { color: FRAME, sides: 6 });
    b.part(new THREE.SphereGeometry(0.0065, 8, 6), BRASS, { at: [sx * HW, RIDGE, 0] });
    b.spike([sx * HW, RIDGE, 0], [sx, 0, 0], 0.03, 0.006, { color: BRASS, sides: 6 });
  }
  for (const sz of [1, -1]) b.rod([0, EAVE, sz * HD], [0, RIDGE, 0], 0.003, { color: FRAME, sides: 6 });
  box([0, RIDGE, 0], [0.352, 0.01, 0.012], BRASS);
  b.part(new THREE.TorusGeometry(0.016, 0.0028, 6, 14), BRASS, { at: [0, RIDGE + 0.0185, 0] });

  // =============================================================================================================
  // Glass
  const Q: P2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const QF: P2[] = [[1, 0], [0, 0], [0, 1], [1, 1]];
  const glass = (pts: P3[], uvs: P2[], tex: ReturnType<typeof svg>) =>
    b.part(glassGeo(pts, uvs), "#ffffff", { at: [0, 0, 0], texture: tex });

  glass([[-HW, Y0, HD], [HW, Y0, HD], [HW, EAVE, HD], [-HW, EAVE, HD]], Q, GW);
  glass([[HW, Y0, -HD], [-HW, Y0, -HD], [-HW, EAVE, -HD], [HW, EAVE, -HD]], QF, GW);
  glass([[HW, Y0, HD], [HW, Y0, -HD], [HW, EAVE, -HD], [HW, EAVE, HD]], Q, GS);
  glass([[-HW, Y0, -HD], [-HW, Y0, HD], [-HW, EAVE, HD], [-HW, EAVE, -HD]], QF, GS);
  glass([[-HW, EAVE, HD], [HW, EAVE, HD], [HW, RIDGE, 0], [-HW, RIDGE, 0]], Q, GR);
  glass([[HW, EAVE, -HD], [-HW, EAVE, -HD], [-HW, RIDGE, 0], [HW, RIDGE, 0]], QF, GR);
  glass([[HW, EAVE, HD], [HW, EAVE, -HD], [HW, RIDGE, 0]], [[1, 0], [0, 0], [0.5, 1]], GG);
  glass([[-HW, EAVE, -HD], [-HW, EAVE, HD], [-HW, RIDGE, 0]], [[1, 0], [0, 0], [0.5, 1]], GG);

  return b.root;
}
