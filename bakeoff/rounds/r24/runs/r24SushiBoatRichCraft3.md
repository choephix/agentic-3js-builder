```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  rng,
  polyline,
  catmull,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  grain,
  mottle,
  stripes,
  countershade,
  svg,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Sushi Boat Platter",
  description:
    "A lacquered wooden sushi boat with gold bands and seigaiha waves, a black lacquer tray bearing nigiri, gunkan, maki, a sashimi fan on daikon, wasabi and pickled ginger, plus a soy dish and chopsticks.",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)

const L = 0.3; // half length of the boat
const W = 0.11; // half beam
const TOP0 = 0.085; // rim height amidships
const LIFT = 0.09; // how far the prow and stern rise
const BOT0 = 0.014; // hull bottom amidships
const BLIFT = 0.08; // how far the keel rises toward the ends
const TH = 0.012; // wall thickness
const T0 = 0.995;
const N = 36;
const M = 12;
const BY = 0.056; // top of the serving board

const hw = (t: number) => W * Math.pow(Math.max(1 - Math.pow(Math.abs(t), 2.6), 0), 0.55);
const topY = (t: number) => TOP0 + LIFT * Math.pow(Math.abs(t), 2.4);
const botY = (t: number) => BOT0 + BLIFT * Math.pow(Math.abs(t), 4);
const tAt = (i: number) => -T0 + (2 * T0 * i) / N;
const angAt = (j: number) => -Math.PI / 2 + (Math.PI * j) / M;

type V = [number, number, number];
const P = (x: number, y: number, z: number): V => [x, y, z];

function section(t: number, a: number, inset: number) {
  const w = hw(t);
  const h = Math.max(w - inset * Math.min(1, w / 0.04), 0);
  const top = topY(t);
  const bot = botY(t) + inset;
  const sn = Math.sin(a);
  const lat = h * Math.sign(sn) * Math.pow(Math.abs(sn), 0.8);
  const y = top - (top - bot) * Math.pow(Math.abs(Math.cos(a)), 0.6);
  return new THREE.Vector3(L * t, y, lat);
}

function shell(inset: number, outward: boolean) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= M; j++) {
      const v = section(tAt(i), angAt(j), inset);
      pos.push(v.x, v.y, v.z);
      uv.push(i / N, j / M);
    }
  for (let i = 0; i < N; i++)
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j;
      const b2 = (i + 1) * (M + 1) + j;
      const c = a + 1;
      const d = b2 + 1;
      if (outward) idx.push(a, b2, c, b2, d, c);
      else idx.push(a, c, b2, b2, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function rimGeometry() {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (const side of [0, 1]) {
    const a = side ? Math.PI / 2 : -Math.PI / 2;
    const base = pos.length / 3;
    for (let i = 0; i <= N; i++) {
      const o = section(tAt(i), a, 0);
      const n = section(tAt(i), a, TH);
      pos.push(o.x, o.y, o.z, n.x, n.y, n.z);
      uv.push(i / N, side, i / N, side);
    }
    for (let i = 0; i < N; i++) {
      const o0 = base + 2 * i;
      const i0 = o0 + 1;
      const o1 = base + 2 * (i + 1);
      const i1 = o1 + 1;
      if (side === 1) idx.push(o0, o1, i0, o1, i1, i0);
      else idx.push(o0, i0, o1, o1, i0, i1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

const shade = (c: Rgb, k: number): Rgb => [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)];

function placed(geo: THREE.BufferGeometry, pos: V, rot: V, sc: V) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(pos[0], pos[1], pos[2]),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
    new THREE.Vector3(sc[0], sc[1], sc[2]),
  );
  return geo.clone().applyMatrix4(m);
}

function riceGrains(seed: number, count: number, rMin: number, rMax: number, fill: string, stroke: string) {
  const r = rng(seed);
  let s = "";
  for (let k = 0; k < count; k++) {
    const a = r() * Math.PI * 2;
    const d = rMin + Math.sqrt(r()) * (rMax - rMin);
    const x = 50 + Math.cos(a) * d;
    const y = 50 + Math.sin(a) * d;
    const rot = Math.floor(r() * 180);
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="1.9" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${fill}" stroke="${stroke}" stroke-width="0.5" opacity="0.85"/>`;
  }
  return s;
}

function sesameDots(seed: number, count: number) {
  const r = rng(seed);
  let s = "";
  for (let k = 0; k < count; k++) {
    const a = r() * Math.PI * 2;
    const d = 34 + Math.sqrt(r()) * 14;
    const x = 50 + Math.cos(a) * d;
    const y = 50 + Math.sin(a) * d;
    const dark = r() < 0.45;
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="1.9" ry="1.1" transform="rotate(${Math.floor(r() * 180)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${dark ? "#241b17" : "#efe0b0"}"/>`;
  }
  return s;
}

// ---------------------------------------------------------------------------------------------------------------
// Textures

const NORI_C = "#16231a";
const RICE_C = "#f8f4e6";

const KAPPA_TOP = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49.5" fill="${NORI_C}"/>
    <circle cx="50" cy="50" r="49.5" fill="none" stroke="#2f4631" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="44.5" fill="${RICE_C}"/>
    ${riceGrains(3, 90, 8, 42, "#fffdf6", "#d8cfb4")}
    <circle cx="50" cy="50" r="16" fill="#2f6a22"/>
    <circle cx="50" cy="50" r="13.5" fill="#79b04a"/>
    <circle cx="50" cy="50" r="8" fill="#c9e59b"/>
    <circle cx="50" cy="50" r="4.5" fill="#e6f3bf"/>
    <ellipse cx="46" cy="48" rx="1.4" ry="2.2" fill="#a8d173"/>
    <ellipse cx="54" cy="52" rx="1.4" ry="2.2" fill="#a8d173"/>
    <ellipse cx="53" cy="45" rx="1.2" ry="2" fill="#a8d173"/>
  </svg>`,
  { size: 192 },
);

const TEKKA_TOP = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49.5" fill="${NORI_C}"/>
    <circle cx="50" cy="50" r="49.5" fill="none" stroke="#2f4631" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="44.5" fill="${RICE_C}"/>
    ${riceGrains(8, 90, 17, 42, "#fffdf6", "#d8cfb4")}
    <circle cx="50" cy="50" r="17" fill="#8e1a2f"/>
    <circle cx="50" cy="50" r="14.5" fill="#c43249"/>
    <path d="M38 46 Q50 38 62 47" stroke="#e8808c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M40 56 Q50 61 60 55" stroke="#e8808c" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="45" cy="45" r="2.6" fill="#f6b1b6" opacity="0.7"/>
  </svg>`,
  { size: 192 },
);

const URA_TOP = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49.5" fill="#f1e8cf"/>
    ${riceGrains(12, 60, 30, 46, "#fffdf6", "#d8cfb4")}
    ${sesameDots(5, 120)}
    <circle cx="50" cy="50" r="33" fill="${NORI_C}"/>
    <circle cx="50" cy="50" r="30.5" fill="${RICE_C}"/>
    ${riceGrains(14, 40, 4, 29, "#fffdf6", "#d8cfb4")}
    <circle cx="41" cy="52" r="12" fill="#e9622f"/>
    <circle cx="41" cy="52" r="9.5" fill="#f58a52"/>
    <path d="M32 50 Q41 44 50 51 M33 57 Q41 52 49 58" stroke="#ffe3cf" stroke-width="1.6" fill="none"/>
    <path d="M52 40 A12 12 0 1 1 53 63 A8 8 0 1 0 52 40 Z" fill="#8cb64a"/>
    <path d="M56 45 A8 8 0 0 1 56 58" stroke="#d3e8a0" stroke-width="2" fill="none"/>
    <circle cx="52" cy="35" r="5.5" fill="#3f8a2c"/>
    <circle cx="52" cy="35" r="3.5" fill="#bfe08a"/>
  </svg>`,
  { size: 192 },
);

const DAIKON = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 64 C3 46 19 30 9 3" stroke="#f8f7ef" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M14 64 C20 48 6 26 15 5" stroke="#e9eddf" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M12 64 C9 50 15 40 12 20" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

function waves() {
  let s = "";
  const rows = [6, 13, 20, 27];
  rows.forEach((y, r) => {
    for (let c = -1; c < 9; c++) {
      const cx = c * 20 + (r % 2 ? 10 : 0);
      s += `<circle cx="${cx}" cy="${y}" r="10" fill="#d4ad55"/>
        <circle cx="${cx}" cy="${y}" r="7.8" fill="#3a1511"/>
        <circle cx="${cx}" cy="${y}" r="5.6" fill="#e9c878"/>
        <circle cx="${cx}" cy="${y}" r="3.4" fill="#3a1511"/>
        <circle cx="${cx}" cy="${y}" r="1.4" fill="#d4ad55"/>`;
    }
  });
  return svg(`<svg viewBox="0 0 160 30" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 640 });
}
const WAVES = waves();

// ---------------------------------------------------------------------------------------------------------------
// Paints

const ricePaint = paint((p, n) => {
  const c = cells(p, 0.0045, 11);
  const e = c.d2 - c.d1;
  let col: Rgb = mix("#f1ead7", "#fffdf5", c.id);
  col = mix(col, "#d4caae", 0.55 * (1 - smoothstep(0.04, 0.2, e)));
  return shade(col, 0.86 + 0.14 * smoothstep(-0.9, 0.3, n.y));
});

function salmonPaint(seed: number) {
  return paint((p, n) => {
    const w = noise(p, 0.03, seed);
    const base = mix("#ff7b47", "#f35a2b", noise(p, 0.018, seed + 2));
    const u = (p.x * 0.55 + p.z * 0.95 + p.y * 0.8) / 0.0105 + 3 * w;
    const f = Math.abs(u - Math.floor(u) - 0.5);
    const line = smoothstep(0.17, 0.06, f) * smoothstep(0.35, 0.6, noise(p, 0.02, seed + 7));
    let c: Rgb = mix(base, "#ffe3cf", 0.9 * line);
    c = mix(c, "#ffb394", 0.22 * smoothstep(0.55, 1, n.y));
    return c;
  });
}

const tunaPaint = paint((p, n) => {
  let c: Rgb = mix("#a8203a", "#cf3f57", noise(p, 0.02, 5));
  const u = (p.z * 1.0 + p.y * 0.7 + p.x * 0.3) / 0.006 + 2 * noise(p, 0.02, 6);
  const f = Math.abs(u - Math.floor(u) - 0.5);
  c = mix(c, "#e9818c", 0.5 * smoothstep(0.1, 0.03, f) * smoothstep(0.4, 0.65, noise(p, 0.02, 9)));
  return mix(c, "#f6a8b0", 0.28 * smoothstep(0.6, 1, n.y));
});

const whiteFishPaint = paint((p, n) => {
  let c: Rgb = mix("#f6e6dc", "#fcf3ec", noise(p, 0.015, 12));
  const u = (p.z + p.y * 0.8) / 0.007 + 2 * noise(p, 0.02, 13);
  const f = Math.abs(u - Math.floor(u) - 0.5);
  c = mix(c, "#f3c7c0", 0.45 * smoothstep(0.09, 0.03, f));
  return mix(c, "#ffffff", 0.25 * smoothstep(0.6, 1, n.y));
});

const SHRIMP = countershade(
  stripes("#f6ecdd", "#f0743c", { size: 0.0075, axis: "x", width: 0.55, wobble: 0.25, seed: 2 }),
  "#f8eee2",
  { level: -0.3 },
);

const EGG_TOP = mottle("#f0bd3a", "#dc9a2a", { size: 0.008, seed: 4 });
const EGG_SIDE = stripes("#f7d255", "#e3a52c", { size: 0.0045, axis: "y", width: 0.35, wobble: 0.3, seed: 6 });
const EGG = paint((_p, n) => (n.y > 0.6 ? EGG_TOP : EGG_SIDE));

const NORI = mottle("#121b14", "#2d3b2b", { size: 0.004, seed: 8 });

const SESAME_RICE = paint((p, _n) => {
  const c = cells(p, 0.0032, 31);
  if (c.id < 0.1 && c.d1 < 0.45) return "#2a211c";
  if (c.id < 0.42 && c.d1 < 0.4) return "#e9d6a0";
  return ricePaint;
});

function beadPaint(seed: number, a: string, b2: string, c3: string) {
  return paint((p, _n) => {
    const c = cells(p, 0.0036, seed);
    const pal = c.id < 0.33 ? a : c.id < 0.66 ? b2 : c3;
    let col: Rgb = mix(pal, "#ffffff", 0.0);
    col = shade(col, 1 - 0.5 * smoothstep(0.35, 0.8, c.d1));
    col = mix(col, "#fff4d0", 0.55 * smoothstep(0.2, 0.05, c.d1));
    return col;
  });
}

const WASABI = mottle("#6f9f2f", "#aad25c", { size: 0.008, seed: 2 });

const BOARD = mottle("#16100f", "#2e211d", { size: 0.02, seed: 3 });

const LEAF_P = paint((p, _n, s) => {
  if (Math.abs(s[1]) < 0.0012) return "#c3e08e";
  const d = Math.abs(((Math.abs(s[0]) + Math.abs(s[1]) * 0.9) / 0.013) % 1 - 0.5);
  const base: Rgb = mix("#2f7a2e", "#4fa43c", noise(p, 0.03, 4));
  return d < 0.05 ? mix(base, "#9fd276", 0.5) : base;
});

const WOOD_DK = grain("#6a3a1f", "#8a5530", { size: 0.011, axis: "x", seed: 3 });
const WOOD_LT = grain("#cfa468", "#e6c58c", { size: 0.008, axis: "x", seed: 5 });
const HULL_OUT = paint((_p, _n, s) => {
  const e = Math.min(s[1], 1 - s[1]);
  if (e < 0.035) return "#2a0e0c";
  if (e < 0.05) return "#c9a24c";
  for (const l of [0.3, 0.7]) if (Math.abs(s[1] - l) < 0.005) return "#3e2312";
  return WOOD_DK;
});
const HULL_IN = paint((_p, _n, s) => {
  const e = Math.min(s[1], 1 - s[1]);
  if (e < 0.03) return "#2a0e0c";
  return WOOD_LT;
});

const DISH_P = paint((p, n) => {
  const y = p.y;
  if (y > 0.0125 && y < 0.0145 && n.y < 0.85) return "#2b4f9a";
  if (y > 0.0182) return "#2b4f9a";
  return "#f6f4ee";
});

const CHOP = paint((p, _n) => {
  if (p.x < -0.135) return "#7a1f1a";
  if (p.x < -0.128) return "#d1a94f";
  return mix("#dcbb86", "#c79d62", noise(p, 0.01, 2));
});

// ---------------------------------------------------------------------------------------------------------------
// Build

export default function build() {
  const b = createBuilder({ name: "sushiBoat", paintSize: 2048 });

  // ---- Boat -----------------------------------------------------------------------------------------------------
  const hullOut = b.part(shell(0, true), HULL_OUT, { at: [0, 0, 0], flat: true, name: "hullOuter" });
  b.part(shell(TH, false), HULL_IN, { at: [0, 0, 0], flat: true, name: "hullInner" });
  b.part(rimGeometry(), "#3a120f", { at: [0, 0, 0], flat: true, name: "hullRim" });

  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.075, 0.02, 0.08), "#3a2113", { at: [sx * 0.12, 0.01, 0], flat: true, name: "foot" });

  // Gold bands wrapped over the hull
  for (const t of [-0.56, -0.5, 0.5, 0.56]) {
    const pts: V[] = [];
    for (let j = 0; j <= M; j++) {
      const v = section(t, angAt(j), -0.003);
      pts.push([v.x, v.y, v.z]);
    }
    b.sweep(catmull(pts), Math.abs(t) > 0.52 ? 0.0022 : 0.0036, {
      color: "#d1a94f",
      sides: 6,
      smooth: false,
      caps: "round",
      name: "goldBand",
    });
    for (const sz of [-1, 1]) {
      const v = section(t, sz * Math.PI * 0.5, -0.003);
      b.part(new THREE.SphereGeometry(0.0048, 6, 4), "#e6c571", { at: [v.x, v.y, v.z], name: "rivet" });
    }
  }

  // Seigaiha wave decals on both flanks
  for (const s of [1, -1])
    b.decal(hullOut, WAVES, {
      at: [0, 0.055, s * 0.109],
      dir: [0, 0, s],
      size: [0.22, 0.0413],
      segments: 28,
      name: "waves",
    });

  // ---- Serving board --------------------------------------------------------------------------------------------
  const boardOutline: [number, number][] = [];
  for (let k = 0; k < 28; k++) {
    const th = (Math.PI * 2 * k) / 28;
    boardOutline.push([0.2 * Math.cos(th), 0.08 * Math.sin(th)]);
  }
  b.extrude(boardOutline, {
    at: [0, 0.042, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.028,
    bevel: 0.0025,
    color: BOARD,
    name: "board",
  });

  // Bamboo leaf bed under the sashimi
  b.extrude(
    [
      [-0.12, 0, "sharp"],
      [-0.06, 0.027],
      [0.06, 0.027],
      [0.12, 0, "sharp"],
      [0.06, -0.027],
      [-0.06, -0.027],
    ],
    {
      at: [0, BY + 0.0012, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0024,
      smoothing: 1,
      color: LEAF_P,
      name: "leaf",
    },
  );

  // ---- Nigiri ---------------------------------------------------------------------------------------------------
  const FZ = 0.04;
  const riceY = BY + 0.0115;
  const netaY = BY + 0.0215;

  function nigiriRice(x: number, z: number) {
    b.sweep(polyline([P(x - 0.0135, riceY, z), P(x + 0.0135, riceY, z)]), (): [number, number] => [0.0135, 0.0115], {
      color: ricePaint,
      caps: "round",
      sides: 10,
      smooth: false,
      name: "nigiriRice",
    });
  }

  function neta(x: number, z: number, color: typeof tunaPaint) {
    b.sweep(
      catmull([P(x - 0.012, netaY - 0.003, z), P(x, netaY + 0.0005, z), P(x + 0.012, netaY - 0.003, z)]),
      (): [number, number] => [0.0175, 0.0065],
      { color, caps: "round", sides: 10, smooth: false, name: "neta" },
    );
  }

  // salmon
  nigiriRice(-0.105, FZ);
  neta(-0.105, FZ, salmonPaint(3));
  // tuna
  nigiriRice(-0.035, FZ);
  neta(-0.035, FZ, tunaPaint);

  // shrimp
  {
    const x = 0.035;
    nigiriRice(x, FZ);
    b.sweep(
      catmull([
        P(x - 0.017, netaY - 0.003, FZ),
        P(x - 0.006, netaY + 0.0015, FZ),
        P(x + 0.008, netaY + 0.0015, FZ),
        P(x + 0.019, netaY - 0.0035, FZ),
      ]),
      (t): [number, number] => {
        const k = 1 - 0.4 * Math.pow(2 * t - 1, 2);
        return [0.0165 * k, 0.0062 * k + 0.001];
      },
      { color: SHRIMP, caps: "round", sides: 10, smooth: false, name: "shrimp" },
    );
    for (const dz of [-0.35, 0, 0.35])
      b.spike(P(x + 0.02, netaY - 0.0045, FZ), [1, -0.12, dz], 0.012, 0.0032, { color: "#e8452c", sides: 5, name: "tail" });
  }

  // tamago with nori band
  {
    const x = 0.105;
    nigiriRice(x, FZ);
    b.part(new THREE.BoxGeometry(0.05, 0.014, 0.031), EGG, { at: [x, BY + 0.0255, FZ], flat: true, name: "tamago" });
    b.part(new THREE.BoxGeometry(0.012, 0.0016, 0.033), NORI, { at: [x, BY + 0.0334, FZ], name: "noriBand" });
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.012, 0.028, 0.0016), NORI, {
        at: [x, BY + 0.0185, FZ + sz * 0.0158],
        name: "noriBand",
      });
  }

  // ---- Gunkan ---------------------------------------------------------------------------------------------------
  const BZ = -0.036;
  function gunkanBase(x: number) {
    b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.022, 12), ricePaint, {
      at: [x, BY + 0.011, BZ],
      flat: true,
      name: "gunkanRice",
    });
    b.lathe(
      [
        [0.0165, 0],
        [0.0188, 0],
        [0.0188, 0.03],
        [0.0165, 0.03],
      ],
      { at: [x, BY, BZ], color: NORI, name: "gunkanNori" },
    );
  }

  // ikura
  {
    const x = -0.12;
    gunkanBase(x);
    const r = rng(41);
    const A: THREE.BufferGeometry[] = [];
    const B: THREE.BufferGeometry[] = [];
    const H: THREE.BufferGeometry[] = [];
    const R = 0.0125;
    const base = BY + 0.0215;
    for (let k = 0; k < 36; k++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * R;
      const yy = base + 0.0035 + Math.sqrt(Math.max(0, 1 - Math.pow(d / (R + 0.003), 2))) * 0.007;
      const px = x + Math.cos(a) * d;
      const pz = BZ + Math.sin(a) * d;
      (k % 2 ? A : B).push(new THREE.SphereGeometry(0.0036, 6, 4).translate(px, yy, pz));
      H.push(new THREE.SphereGeometry(0.0009, 4, 3).translate(px - 0.0009, yy + 0.0024, pz + 0.0012));
    }
    b.part(mergeGeometries(A)!, "#ff5b1f", { at: [0, 0, 0], flat: true, name: "ikuraA" });
    b.part(mergeGeometries(B)!, "#ff7d2b", { at: [0, 0, 0], flat: true, name: "ikuraB" });
    b.part(mergeGeometries(H)!, "#fff0d0", { at: [0, 0, 0], name: "ikuraGlint" });
  }

  // tobiko
  {
    const x = -0.06;
    gunkanBase(x);
    b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), beadPaint(21, "#8cc63f", "#a8d84e", "#6fae35"), {
      at: [x, BY + 0.0215, BZ],
      scale: [0.0172, 0.0115, 0.0172],
      name: "tobiko",
    });
  }

  // ---- Maki -----------------------------------------------------------------------------------------------------
  function maki(x: number, top: THREE.Texture, side: typeof NORI | typeof SESAME_RICE) {
    const r = 0.0185;
    const h = 0.028;
    b.part(new THREE.CylinderGeometry(r, r, h, 14, 1, true), side, { at: [x, BY + h / 2, BZ], flat: true, name: "makiSide" });
    b.part(new THREE.CircleGeometry(r * 0.995, 20), "#ffffff", {
      at: [x, BY + h + 0.0006, BZ],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: top,
      name: "makiTop",
    });
  }
  maki(0, KAPPA_TOP, NORI);
  maki(0.06, TEKKA_TOP, NORI);
  maki(0.12, URA_TOP, SESAME_RICE);

  // ---- Sashimi fan on daikon ------------------------------------------------------------------------------------
  const mound = b.part(new THREE.SphereGeometry(1, 12, 6), mottle("#f7f5ec", "#e6e9da", { size: 0.01, seed: 2 }), {
    at: [0, BY + 0.002, -0.004],
    scale: [0.085, 0.012, 0.02],
    name: "daikonMound",
  });
  const hits = b.surface(mound).scatter(80, { rng: rng(5), minDist: 0.007, filter: (h) => h.n.y > 0.15 });
  b.cards(hits, DAIKON, {
    size: [0.014, 0.03],
    lean: 55,
    bend: 30,
    vary: 0.3,
    spin: 25,
    rng: rng(6),
    flow: (f): [number, number, number] => [f.axis.x, -0.15, f.axis.z - 0.05],
  });

  {
    const th = (28 * Math.PI) / 180;
    const SL: [number, number][] = [
      [-0.019, 0],
      [0.019, 0],
      [0.019, 0.032],
      [-0.019, 0.032],
    ];
    const kinds = [salmonPaint(7), tunaPaint, whiteFishPaint];
    for (let i = 0; i < 9; i++)
      b.extrude(SL, {
        at: [-0.07 + i * 0.0175, BY + 0.009, 0],
        x: [0, 0, 1],
        y: [Math.sin(th), Math.cos(th), 0],
        thickness: 0.008,
        bevel: 0.0015,
        smoothing: 1,
        color: kinds[i % 3],
        name: "sashimi",
      });
  }

  // ---- Wasabi ---------------------------------------------------------------------------------------------------
  {
    const xw = -0.172;
    const lumps: [number, number, number, number][] = [
      [0, 0.007, 0, 0.011],
      [0.008, 0.005, 0.004, 0.008],
      [-0.008, 0.005, -0.003, 0.008],
      [0.002, 0.004, 0.009, 0.007],
      [-0.003, 0.013, 0.001, 0.007],
      [0.004, 0.011, -0.006, 0.006],
    ];
    for (const [dx, dy, dz, r] of lumps)
      b.part(new THREE.SphereGeometry(1, 8, 5), WASABI, {
        at: [xw + dx, BY + dy, dz],
        scale: [r, r * 0.85, r],
        name: "wasabi",
      });
  }

  // ---- Pickled ginger -------------------------------------------------------------------------------------------
  {
    const xg = 0.172;
    const r = rng(61);
    const groups: THREE.BufferGeometry[][] = [[], [], []];
    for (let k = 0; k < 20; k++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 0.018;
      const y = BY + 0.003 + r() * 0.012;
      groups[k % 3].push(
        placed(
          new THREE.SphereGeometry(1, 6, 4),
          [xg + Math.cos(a) * d, y, Math.sin(a) * d * 0.9],
          [(r() - 0.5) * 1.0, r() * Math.PI * 2, (r() - 0.5) * 1.0],
          [0.011 + r() * 0.004, 0.0032, 0.007 + r() * 0.003],
        ),
      );
    }
    const cols = ["#f2a3a0", "#f7c3bb", "#ea8c8d"];
    groups.forEach((g, i) => b.part(mergeGeometries(g)!, cols[i], { at: [0, 0, 0], flat: true, name: "ginger" }));
  }

  // ---- Loose grains and a few sesame seeds ----------------------------------------------------------------------
  {
    const r = rng(77);
    const gr: THREE.BufferGeometry[] = [];
    const se: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 12; k++)
      gr.push(
        placed(
          new THREE.SphereGeometry(1, 5, 4),
          [(r() - 0.5) * 0.28, BY + 0.0012, (r() - 0.5) * 0.12],
          [0, r() * Math.PI, 0],
          [0.0035, 0.0017, 0.0017],
        ),
      );
    for (let k = 0; k < 8; k++)
      se.push(
        placed(
          new THREE.SphereGeometry(1, 4, 3),
          [(r() - 0.5) * 0.26, BY + 0.0008, (r() - 0.5) * 0.1],
          [0, r() * Math.PI, 0],
          [0.0016, 0.0007, 0.0009],
        ),
      );
    b.part(mergeGeometries(gr)!, "#fbf7ea", { at: [0, 0, 0], name: "looseRice" });
    b.part(mergeGeometries(se)!, "#241b17", { at: [0, 0, 0], name: "sesame" });
  }

  // ---- Soy dish -------------------------------------------------------------------------------------------------
  {
    const xD = 0.13;
    const zD = 0.178;
    b.lathe(
      [
        [0, 0],
        [0.02, 0],
        [0.042, 0.017],
        [0.04, 0.019],
        [0.018, 0.005],
        [0, 0.005],
      ],
      { at: [xD, 0, zD], color: DISH_P, name: "dish" },
    );
    b.part(new THREE.CylinderGeometry(0.0255, 0.0255, 0.0012, 14), "#24110a", { at: [xD, 0.0105, zD], name: "soy" });
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.0006, 8), "#6b3d22", { at: [xD - 0.007, 0.0113, zD - 0.006], name: "soyGlint" });
  }

  // ---- Chopsticks and rest --------------------------------------------------------------------------------------
  for (const zc of [0.186, 0.199])
    b.rod(P(-0.21, 0.0038, zc), P(0.03, 0.0183, zc), [0.0036, 0.002], { color: CHOP, sides: 6, name: "chopstick" });
  b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.034, 8), "#e9e4d8", {
    at: [-0.05, 0.005, 0.1925],
    dir: [0, 0, 1],
    name: "chopstickRest",
  });

  return b.root;
}
```