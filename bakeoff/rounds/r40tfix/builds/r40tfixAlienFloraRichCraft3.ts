import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  spiral,
  paint,
  mix,
  noise,
  smoothstep,
  gradient,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lumen Bloom",
  description:
    "A Pandora-style bioluminescent alien plant: a knobby stalk with a glowing lantern pod and spiral light-vein, a layered lotus bloom with stamen spores and dripping vines, hanging bell-flowers, glowing-vein blade leaves, helicoradian coils and spore pods.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours). Glow colours are the bright ones.
const CYAN = "#38f0ff";
const AQUA = "#2cffc4";
const MAG = "#ff4fd8";
const LILAC = "#b07cff";
const PALE = "#d6fffb";
const PINK_PALE = "#ffc6f0";
const VIOLET = "#5b2fa8";
const VIOLET_D = "#2a1450";
const RIB = "#3a2486";
const THREAD = "#8fe9ff";
const STEM = "#c9e6f5";
const CAP = "#2b1d6e";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const rand = rng(5);

// ---------------------------------------------------------------------------------------------------------------
// Paints: lit by place, mossy on top, dark below.
const STALK = paint((p, n, s) => {
  const k = noise(p, 0.12, 3);
  let c = mix("#10284a", "#1d4a6c", k);
  c = mix(c, "#2f6f94", smoothstep(0.2, 0.9, n.y) * 0.45);
  const ridge = Math.abs((((s[1] % 60) + 60) % 60) - 30) / 30;
  c = mix(c, "#060e1c", smoothstep(0.7, 1, ridge) * 0.6);
  c = mix(c, "#4cf0e0", smoothstep(0.74, 0.82, noise(p, 0.03, 7)) * 0.75);
  return c;
});

const ROOT = paint((p, n) => {
  const base = mix("#1b1136", "#2f1b58", noise(p, 0.07, 4));
  return mix(base, "#1f9a86", smoothstep(0.3, 0.8, n.y) * smoothstep(0.35, 0.6, noise(p, 0.08, 2)));
});

const MOUND = paint((p, n) => {
  const base = mix("#140d2a", "#26174a", noise(p, 0.1, 9));
  const moss = mix("#14705f", "#35c9a0", noise(p, 0.06, 12));
  let c = mix(base, moss, smoothstep(0.1, 0.8, n.y) * (0.55 + 0.45 * noise(p, 0.15, 6)));
  c = mix(c, "#8cffd8", smoothstep(0.78, 0.86, noise(p, 0.025, 31)) * 0.6 * smoothstep(0.3, 0.8, n.y));
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const FROND = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1a1650"/><stop offset="0.5" stop-color="#0b3a50"/><stop offset="1" stop-color="#0f6a70"/></linearGradient></defs>
  <path d="M32 126 C14 104 8 70 14 40 C18 22 26 8 32 2 C38 8 46 22 50 40 C56 70 50 104 32 126Z" fill="url(#g)" stroke="#2de8ff" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M32 122 L32 8" stroke="#8ffcff" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M32 100 Q22 92 15 78 M32 100 Q42 92 49 78 M32 78 Q24 70 17 56 M32 78 Q40 70 47 56 M32 56 Q26 48 21 38 M32 56 Q38 48 43 38 M32 36 Q28 30 25 22 M32 36 Q36 30 39 22" stroke="#22d5e6" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  <circle cx="14" cy="60" r="2.2" fill="#ff4fd8"/><circle cx="50" cy="60" r="2.2" fill="#ff4fd8"/><circle cx="19" cy="34" r="2" fill="#ff4fd8"/><circle cx="45" cy="34" r="2" fill="#ff4fd8"/><circle cx="12" cy="86" r="2" fill="#ff4fd8"/><circle cx="52" cy="86" r="2" fill="#ff4fd8"/>
  </svg>`,
  { size: 256 },
);

const FAN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><radialGradient id="g" cx="0.5" cy="1" r="1"><stop offset="0" stop-color="#3a1e8a"/><stop offset="0.55" stop-color="#0d4a62"/><stop offset="1" stop-color="#128a86"/></radialGradient></defs>
  <path d="M50 98 L10 60 Q2 40 14 28 Q18 12 34 12 Q42 2 50 6 Q58 2 66 12 Q82 12 86 28 Q98 40 90 60Z" fill="url(#g)" stroke="#31f0ff" stroke-width="2" stroke-linejoin="round"/>
  <g stroke="#7ffcf0" stroke-width="1.9" stroke-linecap="round" fill="none">
  <path d="M50 96 L50 12"/><path d="M50 96 Q34 70 16 36"/><path d="M50 96 Q40 60 32 16"/><path d="M50 96 Q60 60 68 16"/><path d="M50 96 Q66 70 84 36"/><path d="M50 96 L14 62"/><path d="M50 96 L86 62"/>
  </g>
  <g fill="#ff4fd8"><circle cx="16" cy="34" r="2.4"/><circle cx="33" cy="14" r="2.4"/><circle cx="50" cy="8" r="2.4"/><circle cx="67" cy="14" r="2.4"/><circle cx="84" cy="34" r="2.4"/></g>
  </svg>`,
  { size: 256 },
);

const petalSvg = (c0: string, c1: string, c2: string, edge: string, vein: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c0}"/><stop offset="0.55" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <path d="M32 126 C10 100 6 56 20 28 C26 14 30 6 32 2 C34 6 38 14 44 28 C58 56 54 100 32 126Z" fill="url(#g)" stroke="${edge}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M32 118 L32 14 M32 100 Q22 80 18 52 M32 100 Q42 80 46 52 M32 78 Q26 62 25 40 M32 78 Q38 62 39 40" stroke="${vein}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 256 },
  );
const PETAL_A = petalSvg("#6a2cf0", "#2bd4d8", "#c8fff8", "#9afcff", "#e8ffff");
const PETAL_B = petalSvg("#5a1a9a", "#e03ccc", "#ffd6f6", "#ffe8fa", "#fff0fb");

const BURST = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g stroke="#bffcff" stroke-width="1.8" stroke-linecap="round" fill="none">
  <path d="M50 98 Q50 60 50 10"/><path d="M50 98 Q42 60 30 16"/><path d="M50 98 Q58 60 70 16"/><path d="M50 98 Q34 70 14 36"/><path d="M50 98 Q66 70 86 36"/><path d="M50 98 Q30 84 6 62"/><path d="M50 98 Q70 84 94 62"/>
  </g>
  <g fill="#ffffff"><circle cx="50" cy="9" r="4.2"/><circle cx="30" cy="15" r="3.8"/><circle cx="70" cy="15" r="3.8"/><circle cx="14" cy="35" r="3.6"/><circle cx="86" cy="35" r="3.6"/><circle cx="7" cy="62" r="3.4"/><circle cx="93" cy="62" r="3.4"/></g>
  </svg>`,
  { size: 256 },
);

let coreCells = "";
for (let row = 0; row < 6; row++)
  for (let col = 0; col < 10; col++) {
    const cx = col * 14 + (row % 2) * 7 + 4;
    const cy = row * 11 + 6;
    coreCells += `<circle cx="${cx}" cy="${cy}" r="7.2" fill="none" stroke="#06706c" stroke-width="2.2"/><circle cx="${cx}" cy="${cy}" r="2" fill="#eafff8"/>`;
  }
const CORE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8ffea"/><stop offset="1" stop-color="#1ed6a0"/></linearGradient></defs>
  <rect width="128" height="64" fill="url(#g)"/>${coreCells}</svg>`,
  { size: 256 },
);

let fernLeaves = "";
for (let i = 0; i < 10; i++) {
  const y = 90 - i * 8.2;
  const len = 17 * (1 - i / 12);
  fernLeaves += `<path d="M24 ${y} L${24 - len} ${y - 9} M24 ${y} L${24 + len} ${y - 9}" stroke="#3dffd0" stroke-width="3" stroke-linecap="round"/>`;
  fernLeaves += `<circle cx="${24 - len}" cy="${y - 9}" r="2.2" fill="#ff4fd8"/><circle cx="${24 + len}" cy="${y - 9}" r="2.2" fill="#ff4fd8"/>`;
}
const FERN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 96"><path d="M24 96 L24 8" stroke="#9afff0" stroke-width="3" stroke-linecap="round"/>${fernLeaves}<circle cx="24" cy="6" r="3" fill="#ffffff"/></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
// Builder and helpers
export default function build() {
const b = createBuilder({ name: "lumenBloom" });

const bead = (at: number[] | THREE.Vector3, r: number, color: string, strength = 1.3) =>
  glow(b.part(new THREE.IcosahedronGeometry(r, 0), color, { at, flat: true }), strength);

const scaleOutline = (o: number[][], s: number): OutlinePoint[] => o.map(([x, y]) => [x * s, y * s] as OutlinePoint);

// ---- Root mat ------------------------------------------------------------------------------------------------
const mound = b.lathe(
  [
    [0, 0],
    [0.44, 0],
    [0.42, 0.025],
    [0.32, 0.08],
    [0.2, 0.13],
    [0.1, 0.16],
    [0, 0.17],
  ],
  { at: [0, 0, 0], segments: 11, color: MOUND },
);
{
  const hits = b.surface(mound).scatter(26, { rng: rng(41), minDist: 0.06, filter: (h) => h.n.y > 0.2 });
  const cols = [CYAN, MAG, AQUA, LILAC];
  hits.forEach((h, i) => {
    glow(b.stick(new THREE.IcosahedronGeometry(0.011, 0), cols[i % 4], h, { embed: 0.4 }), 1.2);
  });
}

// ---- Main stalk ----------------------------------------------------------------------------------------------
const stalkPath = catmull([
  [0, -0.02, 0],
  [0.035, 0.3, 0.02],
  [-0.04, 0.7, -0.025],
  [0.025, 1.1, 0.03],
  [0.0, 1.32, 0.05],
]);
const stalkR = (t: number) =>
  0.048 +
  0.09 * Math.pow(1 - t, 2) +
  0.01 * Math.pow(Math.abs(Math.sin(t * Math.PI * 7)), 6) +
  0.025 * Math.pow(Math.max(0, (t - 0.88) / 0.12), 1.5);
const stalk = b.sweep(stalkPath, stalkR, {
  section: { ngon: 7 },
  caps: { start: "flat", end: "flat" },
  color: STALK,
});

// glowing spiral vein round the stalk
{
  const pts: number[][] = [];
  for (let i = 0; i <= 56; i++) {
    const t = 0.05 + 0.85 * (i / 56);
    const c = stalkPath.at(t);
    const a = t * TAU * 5.5;
    const r = stalkR(t) + 0.006;
    pts.push([c.x + Math.cos(a) * r, c.y, c.z + Math.sin(a) * r]);
  }
  glow(b.sweep(catmull(pts), 0.007, { color: CYAN, sides: 5 }), 1.2);
}
// violet node rings
for (const t of [0.18, 0.36, 0.7, 0.86]) {
  const c = stalkPath.at(t);
  const T = stalkPath.tangentAt(t);
  const items = b.ring(frame(c, T), { count: 10, radius: stalkR(t) * 1.07 }).items;
  b.sweep(catmull(items, { closed: true }), 0.014, { color: VIOLET, sides: 5 });
}
// small leaves up the stalk
{
  const hits = b
    .surface(stalk)
    .scatter(14, {
      rng: rng(21),
      minDist: 0.12,
      filter: (h) => h.n.y > -0.2 && h.at.y > 0.25 && h.at.y < 1.2 && Math.abs(h.at.y - 0.72) > 0.22,
    });
  glow(b.cards(hits, FROND, { size: [0.08, 0.2], lean: 50, bend: 25, flow: [0, 1, 0], vary: 0.25, rng: rand }), 0.9);
}

// ---- Lantern pod on the stalk ----------------------------------------------------------------------------------
{
  const c = stalkPath.at(0.52);
  const R = 0.15;
  const Ry = 0.195;
  glow(
    b.part(new THREE.SphereGeometry(R, 12, 9), "#ffffff", {
      at: c,
      texture: CORE,
      scale: [1, Ry / R, 1],
    }),
    1.1,
  );
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * TAU;
    const pts: number[][] = [];
    for (let j = 0; j <= 8; j++) {
      const phi = (j / 8 - 0.5) * Math.PI * 0.96;
      pts.push([
        c.x + R * 1.12 * Math.cos(phi) * Math.sin(a),
        c.y + Ry * 1.12 * Math.sin(phi),
        c.z + R * 1.12 * Math.cos(phi) * Math.cos(a),
      ]);
    }
    b.sweep(catmull(pts), (t: number) => 0.007 + 0.012 * Math.sin(Math.PI * t), { color: RIB, sides: 5 });
  }
  for (const phi of [-0.5, 0.5]) {
    const pts: number[][] = [];
    for (let j = 0; j < 12; j++) {
      const a = (j / 12) * TAU;
      pts.push([
        c.x + R * 1.13 * Math.cos(phi) * Math.sin(a),
        c.y + Ry * 1.13 * Math.sin(phi),
        c.z + R * 1.13 * Math.cos(phi) * Math.cos(a),
      ]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.011, { color: VIOLET, sides: 5 });
  }
}

// ---- Buttress roots --------------------------------------------------------------------------------------------
for (let i = 0; i < 7; i++) {
  const a = (i / 7) * TAU + 0.3;
  const sx = Math.sin(a);
  const cz = Math.cos(a);
  const reach = 0.58 + 0.1 * ((i * 3) % 3);
  const path = bezier(
    [sx * 0.04, 0.3, cz * 0.04],
    [sx * 0.2, 0.22, cz * 0.2],
    [sx * reach * 0.62, 0.08, cz * reach * 0.62],
    [sx * reach, 0.0, cz * reach],
  );
  const root = b.sweep(path, (t: number) => 0.012 + 0.05 * Math.pow(1 - t, 1.5), { sides: 6, color: ROOT });
  glow(b.sweep(root.line(0, 0.004), 0.005, { color: i % 2 ? MAG : CYAN, sides: 4 }), 1.1);
}

// ---- Bloom -----------------------------------------------------------------------------------------------------
const top = stalkPath.at(1);

// calyx cup
b.lathe(
  [
    [0, 0],
    [0.075, 0],
    [0.1, 0.02],
    [0.16, 0.07],
    [0.17, 0.1],
    [0.145, 0.095],
    [0.1, 0.06],
    [0.05, 0.05],
    [0, 0.05],
  ],
  {
    at: [top.x, top.y - 0.01, top.z],
    segments: 10,
    color: gradient(VIOLET_D, VIOLET, [top.x, top.y, top.z], [top.x, top.y + 0.1, top.z]),
  },
);

// solid sepals
const SEPAL_PAINT = paint((_p, _n, s) => mix(mix("#2a1450", "#5b2fa8", Math.min(1, s[1] / 0.2)), "#ff4fd8", smoothstep(0.24, 0.34, s[1])));
const sepalOutline: OutlinePoint[] = [
  [-0.06, 0],
  [-0.075, 0.12],
  [-0.04, 0.26],
  [0, 0.34, "sharp"],
  [0.04, 0.26],
  [0.075, 0.12],
  [0.06, 0],
];
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * TAU + 0.26;
  const sx = Math.sin(a);
  const cz = Math.cos(a);
  const d = new THREE.Vector3(sx * 0.6, 0.8, cz * 0.6).normalize();
  b.extrude(sepalOutline, {
    at: [top.x + sx * 0.1, top.y + 0.05, top.z + cz * 0.1],
    x: [cz, 0, -sx],
    y: d,
    thickness: [0.022, 0.006],
    bevel: 0.004,
    color: SEPAL_PAINT,
  });
}

// petal rings (glowing cards)
function petalRing(
  count: number,
  phase: number,
  elevDeg: number,
  r0: number,
  y0: number,
  tex: typeof PETAL_A,
  size: [number, number],
  bend: number,
) {
  const frames = [];
  const flows: number[][] = [];
  for (let i = 0; i < count; i++) {
    const a = phase + (i / count) * TAU;
    const e = elevDeg * DEG;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    frames.push(
      frame([top.x + sx * r0, top.y + y0, top.z + cz * r0], [sx * Math.cos(e), Math.sin(e), cz * Math.cos(e)]),
    );
    flows.push([sx, 0, cz]);
  }
  glow(b.cards(frames, tex, { size, lean: 0, bend, vary: 0.12, rng: rand, flow: (_f, i) => flows[i] }), 1.1);
}
petalRing(6, 0.0, 25, 0.14, 0.08, PETAL_A, [0.2, 0.42], 55);
petalRing(9, 0.3, 48, 0.1, 0.1, PETAL_B, [0.17, 0.36], 45);
petalRing(7, 0.1, 72, 0.045, 0.1, PETAL_A, [0.13, 0.34], 30);

// pistil + stamens
{
  const pistil = catmull([
    [top.x, top.y + 0.03, top.z],
    [top.x + 0.01, top.y + 0.16, top.z + 0.01],
    [top.x, top.y + 0.3, top.z + 0.03],
  ]);
  glow(b.sweep(pistil, [0.028, 0.012], { color: "#ff7ae8", sides: 6, caps: { start: "flat", end: "round" } }), 1.2);
  bead([top.x, top.y + 0.34, top.z + 0.03], 0.034, PALE, 1.6);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + 0.2;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const start = [top.x + sx * 0.03, top.y + 0.05, top.z + cz * 0.03];
    const rr = 0.12 + 0.05 * (i % 3);
    const hh = 0.26 + 0.07 * (((i * 7) % 4) / 3);
    const end = [top.x + sx * rr, top.y + hh, top.z + cz * rr];
    const ctrl = [start[0] + sx * 0.02, start[1] + 0.18, start[2] + cz * 0.02];
    glow(b.sweep(bezier(start, ctrl, end), [0.006, 0.003], { color: THREAD, sides: 4 }), 0.8);
    bead(end, 0.016, i % 2 ? CYAN : PINK_PALE, 1.5);
  }
  glow(
    b.cards([frame([top.x, top.y + 0.36, top.z + 0.03], [0, 1, 0])], BURST, { size: 0.3, cross: true, lean: 0 }),
    1.2,
  );
}

// dripping vines
for (let i = 0; i < 7; i++) {
  const a = (i / 7) * TAU + 0.4;
  const sx = Math.sin(a);
  const cz = Math.cos(a);
  const sy = top.y + 0.07;
  const len = 0.28 + 0.12 * (((i * 5) % 3) / 2);
  const p0 = [top.x + sx * 0.16, sy, top.z + cz * 0.16];
  const path = bezier(
    p0,
    [p0[0] + sx * 0.07, sy - 0.05, p0[2] + cz * 0.07],
    [p0[0] + sx * 0.11, sy - len * 0.6, p0[2] + cz * 0.11],
    [p0[0] + sx * 0.09, sy - len, p0[2] + cz * 0.09],
  );
  b.sweep(path, [0.011, 0.004], { color: "#3a2a7a", sides: 5 });
  bead(path.at(1), 0.02, AQUA, 1.5);
  bead(path.at(0.55), 0.011, MAG, 1.3);
}

// ---- Hanging bell flowers --------------------------------------------------------------------------------------
const BELL_OUTLINE = [
  [0, 0.06],
  [0.03, 0.055],
  [0.06, 0.02],
  [0.075, -0.04],
  [0.085, -0.09],
  [0.07, -0.095],
  [0.055, -0.07],
  [0.04, -0.04],
  [0.02, -0.01],
  [0, 0],
];
const bells = [
  { a: 1.05, d: 0.42, h: 0.95, s: 1.3, c: CYAN },
  { a: 3.1, d: 0.38, h: 0.72, s: 1.0, c: MAG },
  { a: 4.2, d: 0.44, h: 0.88, s: 1.2, c: AQUA },
  { a: 5.2, d: 0.34, h: 0.6, s: 0.9, c: LILAC },
];
for (const cfg of bells) {
  const sx = Math.sin(cfg.a);
  const cz = Math.cos(cfg.a);
  const at = (r: number, y: number) => [sx * r, y, cz * r];
  const path = catmull([
    at(0.1, 0.08),
    at(0.18, cfg.h * 0.45),
    at(cfg.d * 0.75, cfg.h + 0.02),
    at(cfg.d, cfg.h - 0.04),
    at(cfg.d + 0.03, cfg.h - 0.17),
  ]);
  const sw = b.sweep(path, [0.042, 0.016], {
    section: { ngon: 6 },
    color: STALK,
    caps: { start: "flat", end: "round" },
  });
  glow(b.cards(b.surface(sw).scatter(3, { rng: rand, minDist: 0.1, filter: (h) => h.at.y > 0.2 }), FROND, { size: [0.06, 0.14], lean: 55, bend: 25, flow: [0, 1, 0], rng: rand }), 0.9);

  const end = path.at(1);
  const T = path.tangentAt(1);
  const s = cfg.s;
  const bellAt = end.clone().addScaledVector(T, 0.05 * s);
  const topP = bellAt.clone().addScaledVector(T, -0.06 * s);
  const rimP = bellAt.clone().addScaledVector(T, 0.09 * s);
  b.lathe(scaleOutline(BELL_OUTLINE, s), {
    at: bellAt,
    axis: [-T.x, -T.y, -T.z],
    segments: 9,
    color: gradient("#2c1a66", "#27c8e0", topP, rimP),
  });
  bead(bellAt.clone().addScaledVector(T, 0.045 * s), 0.032 * s, cfg.c, 1.6);
  const clapperEnd = bellAt.clone().addScaledVector(T, 0.17 * s);
  glow(b.rod(bellAt, clapperEnd, 0.005 * s, { color: THREAD, sides: 4 }), 0.9);
  bead(clapperEnd, 0.014 * s, PALE, 1.7);
  const rimC = bellAt.clone().addScaledVector(T, 0.093 * s);
  const rim = b.ring(frame(rimC, T), { count: 9, radius: 0.083 * s }).items;
  glow(b.sweep(catmull(rim, { closed: true }), 0.008 * s, { color: cfg.c, sides: 4 }), 1.3);
}

// ---- Blade leaves ---------------------------------------------------------------------------------------------
function leafOutline(f0: number, f1: number, Ltot: number, W: number, steps: number): OutlinePoint[] {
  const w = (f: number) => W * Math.pow(Math.sin(Math.PI * Math.pow(f, 0.75)), 0.8) + 0.03 * (1 - f);
  const left: OutlinePoint[] = [];
  const right: OutlinePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = f0 + ((f1 - f0) * i) / steps;
    const y = (f - f0) * Ltot;
    if (i === steps && f1 >= 1) left.push([0, y, "sharp"]);
    else {
      const ww = w(f);
      left.push([-ww, y]);
      right.unshift([ww, y]);
    }
  }
  return [...left, ...right];
}

function blade(a: number, baseR: number, baseY: number, e1: number, e2: number, L1: number, L2: number, W: number) {
  const sx = Math.sin(a);
  const cz = Math.cos(a);
  const tang = [cz, 0, -sx];
  const dirOf = (e: number) => [sx * Math.cos(e * DEG), Math.sin(e * DEG), cz * Math.cos(e * DEG)];
  const d1 = dirOf(e1);
  const d2 = dirOf(e2);
  const base = [sx * baseR, baseY, cz * baseR];
  const p1 = base.map((v, i) => v + d1[i] * L1);
  const p2 = p1.map((v, i) => v + d2[i] * L2);
  const Ltot = L1 + L2;
  const fm = L1 / Ltot;
  const mk = (v0: number) =>
    paint((_p, _n, s) => {
      const u = s[0] / W;
      const v = v0 + s[1];
      const vt = v / Ltot;
      const edge = Math.abs(u);
      let c = mix("#0a2f45", "#14a0a0", smoothstep(0, 1, vt) * 0.8);
      const vv = (((v + edge * 0.15) % 0.075) + 0.075) % 0.075;
      if (vv < 0.009 && edge > 0.06) c = mix(c, "#2fd8d4", 0.8);
      if (edge < 0.07) c = mix(c, "#b8fff6", 0.9);
      if (edge > 0.9) c = mix(c, "#e046d0", smoothstep(0.9, 0.97, edge));
      return c;
    });
  b.extrude(leafOutline(0, fm, Ltot, W, 4), { at: base, x: tang, y: d1, thickness: [0.02, 0.012], bevel: 0.003, color: mk(0) });
  b.extrude(leafOutline(fm, 1, Ltot, W, 5), { at: p1, x: tang, y: d2, thickness: [0.012, 0.006], bevel: 0.002, color: mk(L1) });
  // glowing midrib, lifted to the upper face
  const up = (d: number[]) => {
    const n = new THREE.Vector3(...tang).cross(new THREE.Vector3(...d)).normalize();
    return n.y < 0 ? n.negate() : n;
  };
  const n1 = up(d1).multiplyScalar(0.011);
  const n2 = up(d2).multiplyScalar(0.008);
  const rib = polylineLift([base, p1, p2], [n1, n1, n2]);
  glow(b.sweep(catmull(rib), [0.006, 0.003], { color: AQUA, sides: 4 }), 1.1);
}
function polylineLift(pts: number[][], lifts: THREE.Vector3[]) {
  return pts.map((p, i) => [p[0] + lifts[i].x, p[1] + lifts[i].y, p[2] + lifts[i].z]);
}
for (let i = 0; i < 6; i++) {
  const a = i * (Math.PI / 3) + 0.5;
  blade(a, 0.18, 0.14, 52 + 6 * (i % 2), 4 - 8 * (i % 3), 0.38 + 0.04 * (i % 3), 0.42, 0.13);
}

// fan-leaf cards between the blades
{
  const frames = [];
  const flows: number[][] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.2;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const e = 38 * DEG;
    frames.push(frame([sx * 0.28, 0.1, cz * 0.28], [sx * Math.cos(e), Math.sin(e), cz * Math.cos(e)]));
    flows.push([sx, 0, cz]);
  }
  glow(b.cards(frames, [FAN, FROND, FAN], { size: [0.42, 0.55], lean: 0, bend: 50, vary: 0.2, rng: rand, flow: (_f, i) => flows[i] }), 0.9);
}

// ---- Helicoradian coils ---------------------------------------------------------------------------------------
function helix(x: number, z: number, h: number) {
  b.sweep(
    catmull([
      [x, 0, z],
      [x + 0.02, h * 0.5, z],
      [x, h, z + 0.01],
    ]),
    [0.02, 0.008],
    { sides: 5, color: STALK, caps: { start: "flat", end: "round" } },
  );
  const coilPath = spiral([x, 0.04, z], [x + 0.09, 0.04, z], [0, 1, 0], { turns: 3, r1: 0.025, pitch: h * 0.28 });
  b.sweep(coilPath, [0.011, 0.006], { color: "#6a3cd0", sides: 5 });
  b.along(coilPath, 8, (at) => bead(at.at, 0.014, MAG, 1.4));
  bead([x, h + 0.02, z + 0.01], 0.03, AQUA, 1.6);
}
helix(0.62, 0.45, 0.5);
helix(-0.62, 0.35, 0.42);
helix(0.35, -0.66, 0.6);
helix(-0.38, -0.6, 0.38);
helix(0.05, 0.82, 0.34);

// ---- Spore pods -----------------------------------------------------------------------------------------------
function pod(x: number, z: number, s: number, col: string) {
  b.rod([x, 0, z], [x, 0.07 * s, z], [0.014 * s, 0.01 * s], { color: STEM, sides: 6 });
  const cap = b.lathe(
    scaleOutline(
      [
        [0, 0],
        [0.075, 0],
        [0.075, 0.01],
        [0.06, 0.04],
        [0.03, 0.065],
        [0, 0.07],
      ],
      s,
    ),
    { at: [x, 0.065 * s, z], segments: 8, color: CAP },
  );
  glow(b.part(new THREE.CylinderGeometry(0.068 * s, 0.068 * s, 0.006, 8), col, { at: [x, 0.063 * s, z] }), 1.2);
  const hits = b.surface(cap).scatter(3, { rng: rand, minDist: 0.03 * s, filter: (h) => h.n.y > 0.3 });
  for (const h of hits) glow(b.stick(new THREE.SphereGeometry(0.009 * s, 5, 4), col, h, { embed: 0.4 }), 1.4);
}
const podSpots = [
  [0.48, 0.3, 1.2, CYAN],
  [-0.5, 0.1, 1.0, MAG],
  [0.1, 0.52, 0.9, AQUA],
  [-0.3, 0.45, 1.3, LILAC],
  [0.45, -0.25, 1.1, MAG],
  [-0.45, -0.3, 1.2, CYAN],
  [0.0, -0.55, 1.0, AQUA],
  [0.78, 0.05, 0.9, LILAC],
  [-0.8, -0.1, 1.1, MAG],
] as [number, number, number, string][];
for (const [x, z, s, c] of podSpots) pod(x, z, s, c);

// ---- Ground ferns ---------------------------------------------------------------------------------------------
{
  const frames = [];
  for (let i = 0; i < 16; i++) {
    const a = i * 2.399;
    const r = 0.5 + 0.4 * (((i * 7) % 5) / 4);
    frames.push(frame([Math.sin(a) * r, 0.01, Math.cos(a) * r], [0, 1, 0]));
  }
  glow(
    b.cards(frames, FERN, {
      size: [0.12, 0.26],
      lean: 30,
      bend: 45,
      vary: 0.3,
      rng: rand,
      cross: true,
      flow: (f) => [f.at.x, 0, f.at.z],
    }),
    1.0,
  );
}

return b.root;
}
