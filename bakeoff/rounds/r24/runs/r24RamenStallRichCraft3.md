```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  paint,
  mix,
  noise,
  smoothstep,
  resolve,
  svg,
  patches,
  mottle,
  grain,
} from "agentic-3js-builder";
import type { ColorInput, Rgb, Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Night Ramen Stall",
  description:
    "A Ghibli-style yatai ramen stall on a mossy cobbled diorama base: tiled roof, noren curtains, glowing paper lanterns, round stools, steaming pot and bowls, a nobori banner, crates and a barrel.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Constants and palette

const FLOOR = 0.14; // top of the diorama base
const CY = 0.98; // counter top surface
const WARM: Rgb = [1.0, 0.68, 0.36];
const MOON: Rgb = [0.5, 0.62, 0.95];

const DARK = "#2a1c14";
const IRON = "#3a3a42";
const STONE = "#6d747a";
const CAP = "#1e1612";
const LANTERN_RED = "#e2492b";
const ORANGE = "#ffb347";
const YELLOW = "#ffe08a";
const RIB = "#7a1f14";
const TASSEL = "#e8c25a";
const CUSHION = "#a8321f";
const BROTH = "#b5772f";
const NOODLE = "#efcf6f";
const NOODLE2 = "#e6bd52";
const CHASHU = "#9c5a3c";
const CHASHU2 = "#d9958a";
const EGG = "#f6f0e2";
const YOLK = "#f0a22a";
const NORI = "#1b3328";
const SCALL = "#7ccf55";
const MENMA = "#c9a05a";
const CHOP = "#d7b061";
const GLASS_BROWN = "#7a3d1a";
const GLASS_GREEN = "#2f6b4a";
const LID = "#e8d8b0";
const MISO = "#c97a3a";
const CHILI = "#b5322a";
const SAGE = "#587b66";
const FIRE = "#ff7a2a";
const PAPER = "#ffd88a";
const WHITE = "#ffffff";
const ROPE = "#9a7b4a";
const TILE_END = "#bccdc8";
const STEEL = "#a5aeb8";

// Lamp positions (x, y, z, strength) that warm every painted surface near them.
const LAMPS: [number, number, number, number][] = [
  [-1.3, 1.72, 0.8, 1],
  [1.3, 1.72, 0.8, 1],
  [0, 1.9, 0.9, 0.7],
  [1.0, 1.1, -0.2, 0.6],
  [-0.7, 1.1, 0.1, 0.6],
];

function lampLight(p: THREE.Vector3) {
  let a = 0;
  for (const [x, y, z, k] of LAMPS) {
    const d2 = (p.x - x) ** 2 + (p.y - y) ** 2 + (p.z - z) ** 2;
    a += k / (1 + d2 * 2.2);
  }
  return Math.min(a * 0.5, 0.75);
}

function pool(p: THREE.Vector3) {
  let a = 0;
  for (const [x, , z, k] of LAMPS) a += k * smoothstep(2.1, 0.1, Math.hypot(p.x - x, p.z - z));
  return Math.min(a * 0.55, 0.7);
}

/** Warm lamplight near the lanterns, cool moonlight on upward faces far from them. */
const lit = (base: ColorInput, k = 0.5): Paint =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const g = lampLight(p);
    const m = 0.2 * smoothstep(0.2, 1, n.y) * (1 - g);
    return mix(mix(c, MOON, m), WARM, g * k);
  });

const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Planks (seams and grain) on any box-like surface. */
const planks = (a: string, b2: string, w: number, seed = 1, k = 0.5): Paint =>
  lit(
    paint((p, n) => {
      const u = Math.abs(n.x) > 0.6 ? p.z : p.x;
      const q = u / w;
      const i = Math.floor(q);
      const f = q - i;
      const c = mix(a, b2, hash2(i, seed) * 0.8 + 0.2 * noise(p, 0.07, seed));
      const gp = Math.abs(n.y) > 0.6 ? new THREE.Vector3(p.x * 3, p.y * 3, p.z * 0.4) : new THREE.Vector3(p.x * 3, p.y * 0.4, p.z * 3);
      const s = 0.82 + 0.3 * noise(gp, 0.12, seed + 3);
      const col: Rgb = [c[0] * s, c[1] * s, c[2] * s];
      if (f < 0.035 || f > 0.965) return mix(col, "#1c110b", 0.7);
      return col;
    }),
    k,
  );

// Wood paints
const woodPost = lit(grain("#5a3822", "#7b4d2b", { size: 0.03, axis: "y", seed: 3 }));
const woodDark = lit(grain("#3e2a1d", "#573a28", { size: 0.035, axis: "y", seed: 2 }));
const woodTop = lit(grain("#7a4d2c", "#a8703f", { size: 0.04, axis: "x", seed: 4 }), 0.6);
const woodStool = lit(grain("#8a5a35", "#b27a46", { size: 0.03, axis: "y", seed: 6 }), 0.6);
const cabinetPaint = planks("#6a4328", "#85552f", 0.15, 5, 0.6);
const wallPaint = planks("#40302a", "#5a4638", 0.17, 8, 0.7);
const cratePaint = planks("#8a6a3a", "#a98648", 0.1, 12, 0.6);
const floorPaint = planks("#6b4a2e", "#8a643c", 0.12, 14, 0.5);
const ironPaint = lit(mottle("#25242a", "#3b3a43", { size: 0.05, seed: 4 }), 0.6);
const steelPaint = lit(mottle("#8a95a1", "#bcc4ce", { size: 0.05, seed: 9 }), 0.6);
const plasterPaint = lit(mottle("#d8c9a8", "#c2ae86", { size: 0.2, seed: 2 }), 0.6);
const ridgePaint = lit(mottle("#2c4655", "#3f6070", { size: 0.2, seed: 3 }), 0.4);

const roofPaint = lit(
  paint((p, n) => {
    if (n.y < 0.2) return woodDark;
    const v = p.z / 0.075;
    const row = Math.floor(v);
    const u = p.x / 0.11 + (((row % 2) + 2) % 2) * 0.5;
    const col = Math.floor(u);
    const fu = u - col;
    const fv = v - row;
    let c: Rgb = mix("#3d5b6b", "#5a7d86", hash2(col, row) * 0.7);
    if (fv < 0.22) c = mix(c, "#86a6a8", 0.35);
    if (fv > 0.86 || fu < 0.05) c = mix(c, "#1d2e3a", 0.7);
    const moss = smoothstep(0.6, 0.78, noise(p, 0.22, 9));
    c = mix(c, "#5f8f55", moss * 0.65);
    return c;
  }),
  0.45,
);

// Ground
const onPath = (p: THREE.Vector3) => {
  const wob = 0.22 * (noise(p, 0.9, 3) - 0.5) * 2;
  return Math.abs(p.x) < 1.78 + wob && p.z > -0.95 + wob && p.z < 1.55 + wob;
};
const COBBLE = patches("#222d3b", ["#6a7986", "#5a6a79", "#7d8892", "#4a5868", "#707b72"], { size: 0.21, gap: 0.13, seed: 11 });
const GRASS = mottle("#35633f", "#5b8c4e", { size: 0.28, seed: 5 });
const groundPaint = paint((p, n) => {
  if (n.y < 0.55) {
    return p.y > 0.115
      ? mix("#2f5a38", "#3f6d41", noise(p, 0.2, 2))
      : mix("#3b2b22", "#5d4535", noise(p, 0.25, 8) * 0.8 + 0.2 * Math.sin(p.y * 90));
  }
  const on = onPath(p);
  let c: Rgb = resolve(on ? COBBLE : GRASS, p, n);
  c = mix(c, "#4f8a4a", 0.55 * smoothstep(0.62, 0.8, noise(p, 0.35, 6)) * (on ? 1 : 0.3));
  c = mix(c, WARM, pool(p) * 0.55);
  c = mix(c, MOON, 0.12 * (1 - pool(p)));
  return c;
});
const puddlePaint = paint((p, n) => {
  const base = mix("#2a4a70", "#4e7aa6", noise(p, 0.3, 4));
  const streak = smoothstep(0.55, 1, noise(new THREE.Vector3(p.x * 8, 0, p.z), 0.1, 7));
  void n;
  return mix(mix(base, WARM, Math.min(pool(p) * 1.2, 0.8)), "#ffe6b0", streak * 0.2);
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const GLY = [
  "M30 22H72M24 44H76M76 44Q74 76 30 92", // ra
  "M16 58H84", // long vowel mark
  "M70 18Q52 56 28 92M26 46Q58 54 78 90", // me
  "M24 28L38 40M22 88Q70 76 80 26", // n
];
const GLY_V = [GLY[0], "M50 14V90", GLY[2], GLY[3]];

const norenTex = (i: number) =>
  svg(
    `<svg viewBox="0 0 100 92" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="92" fill="#22386a"/>
    ${[12, 28, 44, 60, 76, 90].map((x) => `<path d="M${x} 9V92" stroke="#2c4880" stroke-width="1.6"/>`).join("")}
    <path d="M0 0H100V9H0Z" fill="#14234a"/>
    <path d="M0 9H100" stroke="#e8dcc0" stroke-width="1.5"/>
    <g transform="translate(11,12) scale(0.78)" fill="none" stroke="#f3ead2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="${GLY[i]}"/></g>
    <rect y="84" width="100" height="8" fill="#e8dcc0"/>
    <path d="M0 84H100" stroke="#b9a77c" stroke-width="1.2"/>
  </svg>`,
    { size: 160 },
  );

const flagTex = svg(
  `<svg viewBox="0 0 100 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="400" fill="#c3322a"/>
  <rect width="100" height="14" fill="#8f1f1a"/>
  <rect x="5" y="20" width="90" height="374" fill="none" stroke="#f3ead2" stroke-width="2"/>
  ${GLY_V.map((g, i) => `<g transform="translate(14,${28 + i * 92}) scale(0.72)" fill="none" stroke="#f6efdc" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"><path d="${g}"/></g>`).join("")}
</svg>`,
  { size: 400 },
);

const lanternGlyphTex = svg(
  `<svg viewBox="0 0 40 160" xmlns="http://www.w3.org/2000/svg">
  ${GLY_V.map((g, i) => `<g transform="translate(3,${4 + i * 39}) scale(0.34)" fill="none" stroke="#1a0d0a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="${g}"/></g>`).join("")}
</svg>`,
  { size: 256 },
);

const emblemTex = svg(
  `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="58" fill="#a82e25"/>
  <circle cx="60" cy="60" r="52" fill="none" stroke="#e6c067" stroke-width="3"/>
  <path d="M44 44Q36 34 44 26Q50 18 44 10M62 40Q54 30 62 22Q68 14 62 8" stroke="#f4eee0" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M20 60H100Q98 98 60 102Q22 98 20 60Z" fill="#f4eee0" stroke="#3a1a14" stroke-width="3"/>
  <path d="M25 76H95" stroke="#2f5a8a" stroke-width="4"/>
  <path d="M30 88Q60 96 90 88" stroke="#2f5a8a" stroke-width="3" fill="none"/>
  <path d="M26 58Q38 44 50 58Q62 44 74 58Q86 46 94 58" stroke="#f0cf6a" stroke-width="7" fill="none" stroke-linecap="round"/>
  <circle cx="44" cy="55" r="7" fill="#f7f1e8" stroke="#e0607e" stroke-width="2"/>
  <path d="M82 22L100 56M92 18L106 52" stroke="#e6c067" stroke-width="3.5" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const menuTex = svg(
  `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="120" rx="6" fill="#2e2018"/>
  <rect x="6" y="6" width="188" height="108" rx="4" fill="#5a3c28" stroke="#c99a4a" stroke-width="2"/>
  <text x="100" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#f2dfae" letter-spacing="3">MENU</text>
  <path d="M30 36H170" stroke="#c99a4a" stroke-width="1.5"/>
  ${[
    ["Shoyu Ramen", "800"],
    ["Miso Ramen", "850"],
    ["Gyoza", "400"],
    ["Green Tea", "200"],
  ]
    .map(
      ([n, pr], i) =>
        `<text x="22" y="${58 + i * 17}" font-family="Georgia, serif" font-size="12" fill="#f2dfae">${n}</text><text x="178" y="${58 + i * 17}" text-anchor="end" font-family="Georgia, serif" font-size="12" fill="#f2dfae">${pr}</text><path d="M${60 + n.length * 3} ${55 + i * 17}H150" stroke="#c99a4a" stroke-width="0.8" stroke-dasharray="1 3"/>`,
    )
    .join("")}
</svg>`,
  { size: 320 },
);

const narutoTex = (() => {
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 4.2;
    const r = 2 + t * 1.9;
    d += `${i ? "L" : "M"}${(30 + Math.cos(t) * r).toFixed(1)} ${(30 + Math.sin(t) * r).toFixed(1)}`;
  }
  return svg(
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="28" fill="#f7f1e8" stroke="#e2d2bb" stroke-width="3"/><path d="${d}" stroke="#e0607e" stroke-width="3.4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 96 },
  );
})();

const grassTex = (a: string, c: string, d: string) =>
  svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 64Q16 30 4 6Q24 26 26 64Z" fill="${a}"/>
    <path d="M22 64Q26 34 38 12Q30 34 30 64Z" fill="${c}"/>
    <path d="M14 64Q14 40 12 24Q22 40 20 64Z" fill="${d}"/>
  </svg>`,
    { size: 128 },
  );

const steamTex = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg"><g ${flip ? 'transform="translate(40,0) scale(-1,1)"' : ""}><path d="M20 80C4 62 36 52 20 36C8 24 28 14 18 2C34 14 14 26 26 38C40 54 8 62 28 80Z" fill="#f4f7ff"/></g></svg>`,
    { size: 128 },
  );
const smokeTex = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg"><path d="M16 80C2 60 34 54 22 38C12 26 30 14 20 2C36 14 18 28 28 40C38 56 12 62 26 80Z" fill="#b4bccb"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "ramen_stall", paintSize: 2048 });
  const R = rng(7);

  type Opt = { rotation?: V; scale?: V | number; dir?: V; axis?: "x" | "y" | "z"; texture?: THREE.Texture; up?: V; flat?: boolean };
  const put = (geo: THREE.BufferGeometry, color: ColorInput, at: V, o: Opt = {}) =>
    b.part(geo, color as never, { at, flat: true, ...o } as never);
  const box = (w: number, h: number, d: number, color: ColorInput, at: V, o: Opt = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, { flat: false, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: ColorInput, at: V, o: Opt = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const ball = (r: V | number, color: ColorInput, at: V, seg = 8, o: Opt = {}) =>
    put(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2)), color, at, { scale: r, ...o });
  const ring = (r: number, tube: number, color: ColorInput, at: V, seg = 14, o: Opt = {}) =>
    put(new THREE.TorusGeometry(r, tube, 4, seg), color, at, { rotation: [90, 0, 0], ...o });

  // -------------------------------------------------------------------------------------------------------------
  // Diorama base: a mossy cobbled slab with a soil edge

  {
    const hx = 2.1;
    const hz = 1.65;
    const outline: [number, number][] = [];
    const N = 36;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const wob = 1 + 0.025 * Math.sin(3 * a + 1) + 0.02 * Math.sin(5 * a + 2);
      outline.push([hx * Math.sign(c) * Math.pow(Math.abs(c), 0.5) * wob, hz * Math.sign(s) * Math.pow(Math.abs(s), 0.5) * wob]);
    }
    b.extrude(outline, { at: [0, FLOOR / 2, 0.25], x: [1, 0, 0], y: [0, 0, 1], thickness: FLOOR, bevel: 0.012, color: groundPaint, name: "base" });
  }

  // puddles
  for (const [x, z, w, d] of [
    [0.5, 1.45, 0.42, 0.22],
    [-1.35, 0.9, 0.3, 0.18],
    [1.5, 1.2, 0.22, 0.14],
  ] as const) {
    const pts: [number, number][] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const w2 = 1 + 0.18 * Math.sin(3 * a + x * 4);
      pts.push([Math.cos(a) * w * w2, Math.sin(a) * d * w2]);
    }
    b.extrude(pts, { at: [x, FLOOR + 0.003, z], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.006, color: puddlePaint, name: "puddle" });
  }

  // wooden floor of the stall
  box(2.5, 0.04, 1.25, floorPaint, [0, FLOOR + 0.02, -0.05]);
  // stone feet
  for (const sx of [-1, 1])
    for (const z of [0.45, -0.62]) box(0.17, 0.05, 0.17, STONE, [sx * 1.1, FLOOR + 0.045, z]);

  // -------------------------------------------------------------------------------------------------------------
  // Frame: posts, beams, back wall

  for (const sx of [-1, 1]) {
    box(0.09, 2.08, 0.09, woodPost, [sx * 1.1, FLOOR + 1.04 + 0.03, 0.45]); // front: top 2.25
    box(0.09, 2.16, 0.09, woodPost, [sx * 1.1, FLOOR + 1.08 + 0.03, -0.62]);
    box(0.07, 0.07, 1.14, woodPost, [sx * 1.1, 1.98, -0.085]); // side tie beam
  }
  box(2.3, 0.07, 0.07, woodPost, [0, 1.98, 0.45]);
  box(2.3, 0.07, 0.07, woodPost, [0, 1.98, -0.62]);
  box(2.2, 0.05, 0.05, woodPost, [0, 1.3, 0.455]); // low rail behind noren
  // back wall
  box(2.16, 2.14, 0.04, wallPaint, [0, FLOOR + 1.07, -0.58]);
  // darker wainscot band
  box(2.16, 0.05, 0.06, woodDark, [0, 0.62, -0.57]);

  // -------------------------------------------------------------------------------------------------------------
  // Roof

  const RIDGE_Y = 2.6;
  const RIDGE_Z = -0.15;
  const RUN = 1.0;
  const DROP = 0.55;
  const ANG = (Math.atan2(DROP, RUN) * 180) / Math.PI;
  const ANGR = (ANG * Math.PI) / 180;
  const SLOPE = Math.hypot(RUN, DROP);
  for (const s of [1, -1]) {
    const cz = RIDGE_Z + (s * RUN) / 2;
    const cy = RIDGE_Y - DROP / 2;
    box(3.04, 0.06, SLOPE + 0.04, roofPaint, [0, cy, cz], { rotation: [s * ANG, 0, 0] });
    const ny = Math.cos(ANGR);
    const nz = s * Math.sin(ANGR);
    for (let x = -1.4; x <= 1.401; x += 0.28)
      box(0.05, 0.06, SLOPE + 0.02, woodDark, [x, cy - ny * 0.055, cz - nz * 0.055], { rotation: [s * ANG, 0, 0] });
    // round tile ends along the eave
    const ey = RIDGE_Y - DROP;
    const ez = RIDGE_Z + s * RUN;
    for (let x = -1.46; x <= 1.461; x += 0.125)
      cyl(0.042, 0.042, 0.05, 6, TILE_END, [x, ey - 0.005, ez - s * 0.03], { rotation: [s * (90 + ANG), 0, 0] });
    // fascia board
    box(3.04, 0.05, 0.03, woodDark, [0, ey - 0.055, ez - s * 0.06], { rotation: [s * ANG, 0, 0] });
  }
  b.rod([-1.5, RIDGE_Y + 0.04, RIDGE_Z], [1.5, RIDGE_Y + 0.04, RIDGE_Z], 0.075, ridgePaint, { sides: 6 });
  for (const sx of [-1, 1]) {
    cyl(0.1, 0.1, 0.05, 8, TILE_END, [sx * 1.53, RIDGE_Y + 0.04, RIDGE_Z], { rotation: [0, 0, 90] });
    put(new THREE.ConeGeometry(0.05, 0.12, 6), ridgePaint, [sx * 1.5, RIDGE_Y + 0.14, RIDGE_Z]);
  }
  // gable plaster and emblem
  for (const sx of [-1, 1]) {
    b.extrude(
      [
        [-0.97, 0],
        [0.97, 0],
        [0, 0.5, "sharp"],
      ],
      { at: [sx * 1.47, RIDGE_Y - DROP, RIDGE_Z], x: [0, 0, 1], thickness: 0.04, color: plasterPaint, name: "gable" },
    );
    put(new THREE.CircleGeometry(0.15, 16), WHITE, [sx * 1.495, 2.22, RIDGE_Z], { dir: [sx, 0, 0], axis: "z", texture: emblemTex, flat: false });
    // gable frame boards
    box(0.04, 0.05, 1.98, woodDark, [sx * 1.49, 2.04, RIDGE_Z]);
  }

  // chimney from the stove
  b.rod([-0.78, FLOOR + 1.05, -0.26], [-0.78, 2.9, -0.26], 0.04, ironPaint, { sides: 8 });
  cyl(0.075, 0.075, 0.03, 8, IRON, [-0.78, 2.9, -0.26]);
  cyl(0.06, 0.1, 0.06, 8, IRON, [-0.78, 2.6, -0.26]);
  cyl(0.1, 0.1, 0.03, 8, IRON, [-0.78, 2.55, -0.26]);

  // -------------------------------------------------------------------------------------------------------------
  // Counter

  box(2.1, 0.78, 0.62, cabinetPaint, [0, 0.57, -0.01]);
  box(2.3, 0.06, 0.9, woodTop, [0, CY - 0.03, 0.05]);
  box(2.3, 0.05, 0.04, woodDark, [0, CY - 0.085, 0.49]); // apron
  box(2.12, 0.07, 0.64, woodDark, [0, 0.21, -0.01]); // plinth
  // front battens and plaque frame
  for (const x of [-0.95, -0.55, 0.55, 0.95]) box(0.04, 0.7, 0.02, woodDark, [x, 0.58, 0.305]);
  box(0.58, 0.58, 0.02, woodDark, [0, 0.58, 0.305]);
  put(new THREE.PlaneGeometry(0.5, 0.5), WHITE, [0, 0.58, 0.318], { dir: [0, 0, 1], axis: "z", texture: emblemTex, flat: false });
  // a lantern-lit paper strip with prices under counter edge
  for (const x of [-0.95, 0.95]) box(0.05, 0.3, 0.012, "#e8dcc0", [x, 0.78, 0.318]);

  // -------------------------------------------------------------------------------------------------------------
  // Noren curtain

  b.rod([-1.1, 1.9, 0.5], [1.1, 1.9, 0.5], 0.018, woodPost, { sides: 6 });
  [-0.765, -0.255, 0.255, 0.765].forEach((x, i) =>
    put(new THREE.BoxGeometry(0.5, 0.46, 0.014), WHITE, [x, 1.65, 0.5], { texture: norenTex(i), rotation: [-2 + i * 0.7, 0, 0], flat: false }),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Lanterns

  const prof = (R0: number, H: number) => {
    const r = (t: number) => R0 * (0.5 + 0.5 * Math.sqrt(1 - t * t));
    const pts: [number, number][] = [
      [0, -H / 2],
      [r(-1), -H / 2],
    ];
    for (const t of [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75]) pts.push([r(t), (t * H) / 2]);
    pts.push([r(1), H / 2], [0, H / 2]);
    return { pts, r };
  };

  function lantern(cx: number, cy: number, cz: number, R0: number, H: number, strength: number) {
    const { pts, r } = prof(R0, H);
    const body = glow(b.lathe(pts, { at: [cx, cy, cz], segments: 12, color: LANTERN_RED, name: "lantern" }), strength);
    cyl(R0 * 0.52, R0 * 0.52, 0.035, 12, CAP, [cx, cy + H / 2 + 0.012, cz]);
    cyl(R0 * 0.52, R0 * 0.52, 0.035, 12, CAP, [cx, cy - H / 2 - 0.012, cz]);
    cyl(R0 * 0.2, R0 * 0.2, 0.03, 8, CAP, [cx, cy + H / 2 + 0.04, cz]);
    for (const t of [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75]) ring(r(t) + 0.003, 0.005, RIB, [cx, cy + (t * H) / 2, cz], 14);
    b.rod([cx, cy + H / 2 + 0.05, cz], [cx, 2.07, cz], 0.005, DARK);
    b.spike([cx, cy - H / 2 - 0.03, cz], [0, -1, 0], 0.13, 0.014, { color: TASSEL });
    ball(0.02, TASSEL, [cx, cy - H / 2 - 0.035, cz], 6);
    b.decal(body, lanternGlyphTex, { at: [cx, cy, cz + R0], dir: [0, 0, 1], size: [0.11, 0.4] });
  }
  for (const sx of [-1, 1]) lantern(sx * 1.3, 1.72, 0.8, 0.2, 0.5, 1.3);

  // string of small lanterns along the eave
  {
    const path = catmull([
      [-1.5, 2.03, 0.88],
      [-0.75, 1.97, 0.9],
      [0, 1.95, 0.91],
      [0.75, 1.97, 0.9],
      [1.5, 2.03, 0.88],
    ]);
    b.sweep(path, 0.004, { color: DARK });
    const cols = [LANTERN_RED, ORANGE, YELLOW];
    let k = 0;
    b.along(
      path,
      7,
      (at) => {
        const p = at.at;
        const c = cols[k++ % 3];
        b.rod([p.x, p.y, p.z], [p.x, p.y - 0.04, p.z], 0.003, DARK);
        glow(ball([0.065, 0.085, 0.065], c, [p.x, p.y - 0.12, p.z], 8, { flat: true }), 1.3);
        cyl(0.03, 0.03, 0.015, 8, CAP, [p.x, p.y - 0.035, p.z]);
        cyl(0.03, 0.03, 0.015, 8, CAP, [p.x, p.y - 0.205, p.z]);
      },
      { from: 0.2, to: 0.8 },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Stools

  function stool(x: number, z: number, rot: number) {
    const top = FLOOR + 0.5;
    cyl(0.19, 0.18, 0.07, 10, woodStool, [x, top - 0.035, z]);
    cyl(0.175, 0.175, 0.04, 10, CUSHION, [x, top + 0.02, z]);
    ring(0.176, 0.01, "#7a2218", [x, top + 0.005, z], 10);
    for (let k = 0; k < 4; k++) {
      const a = ((k * 90 + 45 + rot) * Math.PI) / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);
      b.rod([x + c * 0.12, top - 0.07, z + s * 0.12], [x + c * 0.2, FLOOR, z + s * 0.2], [0.026, 0.02], woodPost, { sides: 6 });
    }
    ring(0.163, 0.012, woodPost, [x, FLOOR + 0.2, z], 12);
  }
  stool(-0.9, 1.0, 10);
  stool(-0.3, 1.05, 30);
  stool(0.3, 1.0, 0);
  stool(0.9, 1.16, 20);

  // -------------------------------------------------------------------------------------------------------------
  // Bowls

  const bowlPaint = paint((_p, n, s) => {
    if (s[0] > 0.093) return "#d9a93a";
    if (n.y > 0.45) return "#f1e6cf";
    if (s[0] > 0.04 && s[0] < 0.058) return "#f1e6cf";
    return "#b5392b";
  });
  const bowlProfile: [number, number][] = [
    [0, 0],
    [0.05, 0],
    [0.055, 0.012],
    [0.115, 0.07],
    [0.13, 0.105],
    [0.12, 0.105],
    [0.105, 0.075],
    [0.05, 0.025],
    [0, 0.025],
  ];

  function bowl(x: number, y0: number, z: number, kind: 0 | 1 | 2) {
    b.lathe(bowlProfile, { at: [x, y0, z], segments: 14, smoothing: 1, color: bowlPaint, name: "bowl" });
    if (kind === 2) return;
    cyl(0.108, 0.108, 0.004, 12, BROTH, [x, y0 + 0.088, z]);
    ball([0.078, 0.032, 0.078], NOODLE, [x, y0 + 0.09, z], 10);
    for (const dz of [-0.03, 0, 0.03]) {
      const pts: number[][] = [];
      for (let i = 0; i < 7; i++) pts.push([x - 0.07 + i * 0.0233, y0 + 0.118 - Math.abs(dz) * 0.4, z + dz + (i % 2 ? 0.01 : -0.01)]);
      b.sweep(catmull(pts), 0.0045, { color: NOODLE2, sides: 5 });
    }
    // chashu
    for (const [dx, dz] of kind === 0 ? [[-0.045, -0.035], [-0.02, -0.05]] : [[-0.05, 0.0]]) {
      cyl(0.04, 0.04, 0.008, 10, CHASHU, [x + dx, y0 + 0.108, z + dz], { rotation: [-24, 0, 14] });
      cyl(0.034, 0.034, 0.004, 10, CHASHU2, [x + dx, y0 + 0.114, z + dz], { rotation: [-24, 0, 14] });
    }
    put(new THREE.CircleGeometry(0.03, 12), WHITE, [x + 0.01, y0 + 0.118, z + 0.04], { dir: [0.2, 1, 0.5], axis: "z", texture: narutoTex, flat: false });
    ball([0.034, 0.022, 0.028], EGG, [x + 0.05, y0 + 0.103, z - 0.02], 8);
    ball(0.014, YOLK, [x + 0.05, y0 + 0.112, z - 0.02], 6);
    box(0.055, 0.075, 0.003, NORI, [x + 0.02, y0 + 0.14, z + 0.075], { rotation: [-18, 8, 6] });
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4;
      cyl(0.011, 0.011, 0.005, 6, SCALL, [x + Math.cos(a) * 0.045 + 0.01, y0 + 0.113 + (i % 2) * 0.003, z + Math.sin(a) * 0.04 + 0.01], { rotation: [R() * 30, 0, R() * 30] });
    }
    for (let i = 0; i < 3; i++) box(0.03, 0.004, 0.008, MENMA, [x - 0.01 + i * 0.015, y0 + 0.116, z + 0.045 - i * 0.012], { rotation: [0, i * 40, 0] });
  }

  function steam(x: number, y: number, z: number, n: number, w: number, h: number, tex: THREE.Texture[]) {
    const fr = Array.from({ length: n }, () => frame([x + (R() - 0.5) * w * 0.7, y + R() * 0.03, z + (R() - 0.5) * w * 0.7], [0, 1, 0]));
    b.cards(fr, tex, { size: [w, h], bend: 18, vary: 0.3, spin: 180, rng: R, cross: true });
  }
  const STEAM = [steamTex(false), steamTex(true)];

  bowl(0.3, CY, 0.17, 0);
  bowl(0.9, CY, 0.2, 1);
  bowl(-0.2, CY, 0.22, 2);
  bowl(-0.2, CY + 0.032, 0.22, 2);
  bowl(-0.2, CY + 0.064, 0.22, 2);
  steam(0.3, CY + 0.15, 0.17, 3, 0.1, 0.22, STEAM);
  steam(0.9, CY + 0.15, 0.2, 2, 0.08, 0.18, STEAM);
  // chopsticks
  for (const [x, z] of [[0.46, 0.18], [1.06, 0.2]]) {
    b.rod([x, CY + 0.005, z - 0.08], [x + 0.02, CY + 0.005, z + 0.1], 0.004, CHOP);
    b.rod([x + 0.017, CY + 0.005, z - 0.08], [x + 0.037, CY + 0.005, z + 0.1], 0.004, CHOP);
  }
  // wooden tray under the second bowl
  box(0.34, 0.012, 0.28, woodDark, [0.9, CY + 0.006, 0.2]);

  // condiments
  cyl(0.045, 0.04, 0.1, 8, "#5b4a3a", [0.6, CY + 0.05, -0.1]);
  for (let i = 0; i < 8; i++) {
    const a = i * 0.8;
    b.rod([0.6 + Math.cos(a) * 0.015, CY + 0.1, -0.1 + Math.sin(a) * 0.015], [0.6 + Math.cos(a) * 0.04, CY + 0.2, -0.1 + Math.sin(a) * 0.04], 0.004, CHOP);
  }
  cyl(0.03, 0.03, 0.1, 8, GLASS_BROWN, [0.72, CY + 0.05, -0.12]);
  cyl(0.012, 0.018, 0.04, 8, GLASS_BROWN, [0.72, CY + 0.12, -0.12]);
  cyl(0.014, 0.014, 0.012, 8, CHILI, [0.72, CY + 0.146, -0.12]);
  cyl(0.026, 0.026, 0.08, 8, "#e8d8b0", [0.5, CY + 0.04, -0.14]);
  cyl(0.028, 0.028, 0.02, 8, CHILI, [0.5, CY + 0.09, -0.14]);

  // paper andon lamp
  {
    const ax = 1.0;
    const az = -0.18;
    box(0.17, 0.035, 0.17, CAP, [ax, CY + 0.018, az]);
    glow(box(0.14, 0.22, 0.14, PAPER, [ax, CY + 0.145, az]), 1.1);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.014, 0.22, 0.014, CAP, [ax + dx * 0.07, CY + 0.145, az + dz * 0.07]);
    box(0.18, 0.025, 0.18, CAP, [ax, CY + 0.268, az]);
    box(0.06, 0.03, 0.06, CAP, [ax, CY + 0.295, az]);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Stove and pot

  {
    const sx = -0.7;
    const sz = -0.1;
    box(0.5, 0.2, 0.44, ironPaint, [sx, CY + 0.1, sz]);
    box(0.54, 0.03, 0.48, IRON, [sx, CY + 0.205, sz]);
    glow(box(0.22, 0.08, 0.01, FIRE, [sx, CY + 0.09, sz + 0.222]), 1.8);
    box(0.26, 0.12, 0.012, CAP, [sx, CY + 0.09, sz + 0.218]);
    glow(box(0.2, 0.06, 0.012, FIRE, [sx, CY + 0.09, sz + 0.226]), 1.8);
    for (const dx of [-0.2, 0.2]) box(0.04, 0.04, 0.02, IRON, [sx + dx, CY + 0.17, sz + 0.225]);
    const py = CY + 0.22;
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.205, 0.26],
        [0.22, 0.27],
        [0.22, 0.278],
        [0.195, 0.278],
        [0.19, 0.012],
        [0, 0.012],
      ],
      { at: [sx, py, sz + 0.03], segments: 14, smoothing: 0, color: steelPaint, name: "pot" },
    );
    cyl(0.19, 0.19, 0.004, 14, BROTH, [sx, py + 0.245, sz + 0.03]);
    for (const dx of [-1, 1]) box(0.035, 0.022, 0.04, CAP, [sx + dx * 0.225, py + 0.22, sz + 0.03]);
    // lid ajar, leaning on the rim
    b.lathe(
      [
        [0, 0],
        [0.215, 0],
        [0.215, 0.012],
        [0.14, 0.04],
        [0.06, 0.062],
        [0.03, 0.07],
        [0, 0.07],
      ],
      { at: [sx + 0.06, py + 0.285, sz + 0.03], axis: [0.28, 1, 0], segments: 14, color: steelPaint, name: "lid" },
    );
    ball(0.022, CAP, [sx + 0.12, py + 0.36, sz + 0.03], 6);
    steam(sx - 0.08, py + 0.3, sz + 0.03, 4, 0.16, 0.34, STEAM);
    // ladle leaning on pot
    b.rod([sx + 0.28, CY + 0.215, sz + 0.2], [sx + 0.2, py + 0.4, sz + 0.12], 0.008, woodPost);
    put(new THREE.SphereGeometry(0.035, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, [sx + 0.2, py + 0.4, sz + 0.12], { rotation: [150, 0, 0] });
    // smoke from the chimney
    steam(-0.78, 2.95, -0.26, 3, 0.2, 0.4, [smokeTex]);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Back wall: shelf, jars, menu, hanging tools

  box(0.95, 0.03, 0.15, woodDark, [0.65, 1.1, -0.51]);
  for (const x of [0.28, 1.02]) box(0.03, 0.08, 0.13, woodDark, [x, 1.06, -0.51]);
  // jars and bottles
  cyl(0.05, 0.05, 0.12, 10, MISO, [0.35, 1.175, -0.5]);
  cyl(0.052, 0.052, 0.03, 10, LID, [0.35, 1.25, -0.5]);
  cyl(0.04, 0.04, 0.14, 8, GLASS_BROWN, [0.48, 1.185, -0.5]);
  cyl(0.014, 0.022, 0.05, 8, GLASS_BROWN, [0.48, 1.28, -0.5]);
  cyl(0.016, 0.016, 0.016, 8, CAP, [0.48, 1.313, -0.5]);
  cyl(0.045, 0.045, 0.1, 10, SAGE, [0.62, 1.165, -0.5]);
  cyl(0.047, 0.047, 0.025, 10, LID, [0.62, 1.23, -0.5]);
  box(0.1, 0.12, 0.08, STEEL, [0.77, 1.175, -0.5]);
  box(0.105, 0.02, 0.085, CHILI, [0.77, 1.245, -0.5]);
  cyl(0.04, 0.04, 0.13, 8, GLASS_GREEN, [0.9, 1.18, -0.5]);
  cyl(0.013, 0.02, 0.05, 8, GLASS_GREEN, [0.9, 1.27, -0.5]);
  // menu board
  put(new THREE.BoxGeometry(0.62, 0.37, 0.02), WHITE, [-0.05, 1.5, -0.55], { texture: menuTex, flat: false });
  box(0.66, 0.41, 0.015, woodDark, [-0.05, 1.5, -0.565]);
  // hanging ladles / strainers
  for (const x of [0.3, 0.45, 0.6]) {
    box(0.03, 0.03, 0.03, woodDark, [x, 1.52, -0.55]);
    b.rod([x, 1.5, -0.54], [x, 1.28, -0.52], 0.007, woodPost);
  }
  put(new THREE.SphereGeometry(0.04, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, [0.3, 1.28, -0.52], { rotation: [-100, 0, 0] });
  ring(0.04, 0.005, STEEL, [0.45, 1.26, -0.52], 10, { rotation: [90, 0, 0] });
  put(new THREE.CircleGeometry(0.045, 10), STEEL, [0.45, 1.26, -0.52], { dir: [0, 0.3, 1], axis: "z" });
  put(new THREE.SphereGeometry(0.05, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, [0.6, 1.27, -0.52], { rotation: [-100, 0, 0] });

  // -------------------------------------------------------------------------------------------------------------
  // Nobori banner

  {
    const x = 1.88;
    const z = 0.85;
    cyl(0.28, 0.3, 0.1, 8, STONE, [x, FLOOR + 0.05, z]);
    b.rod([x, FLOOR + 0.05, z], [x, 2.72, z], 0.022, woodPost, { sides: 6 });
    b.rod([x - 0.28, 2.66, z], [x + 0.28, 2.66, z], 0.016, woodPost, { sides: 6 });
    ball(0.03, TASSEL, [x, 2.76, z], 6);
    put(new THREE.BoxGeometry(0.42, 1.5, 0.012), WHITE, [x, 1.9, z + 0.02], { texture: flagTex, rotation: [0, -8, 0], flat: false });
    for (const dx of [-0.17, 0, 0.17]) b.rod([x + dx, 2.66, z], [x + dx, 2.62, z + 0.02], 0.005, ROPE);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Crates with bottles (right) and barrel with bucket (left)

  {
    const cx = 1.72;
    const cz = -0.3;
    box(0.5, 0.3, 0.34, cratePaint, [cx, FLOOR + 0.15, cz], { rotation: [0, 8, 0] });
    box(0.46, 0.3, 0.32, cratePaint, [cx - 0.02, FLOOR + 0.45, cz + 0.01], { rotation: [0, -6, 0] });
    for (const dy of [0.15, 0.45]) {
      box(0.52, 0.03, 0.36, woodDark, [cx - (dy > 0.3 ? 0.02 : 0), FLOOR + dy + 0.12, cz], { rotation: [0, dy > 0.3 ? -6 : 8, 0] });
    }
    const cols = [GLASS_BROWN, GLASS_GREEN, GLASS_BROWN, GLASS_BROWN, GLASS_GREEN, GLASS_BROWN];
    cols.forEach((c, i) => {
      const bx = cx - 0.16 + (i % 3) * 0.14;
      const bz = cz - 0.06 + Math.floor(i / 3) * 0.13;
      cyl(0.04, 0.04, 0.17, 8, c, [bx, FLOOR + 0.6 + 0.085 + 0.015, bz]);
      cyl(0.014, 0.034, 0.06, 8, c, [bx, FLOOR + 0.6 + 0.2, bz]);
      cyl(0.017, 0.017, 0.015, 8, TASSEL, [bx, FLOOR + 0.6 + 0.24, bz]);
    });

    const bx = -1.72;
    const bz = -0.25;
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.235, 0.1],
        [0.255, 0.27],
        [0.235, 0.44],
        [0.2, 0.54],
        [0, 0.54],
      ],
      { at: [bx, FLOOR, bz], segments: 12, smoothing: 1, color: lit(grain("#6a4328", "#85552f", { size: 0.03, axis: "y", seed: 21 }), 0.6), name: "barrel" },
    );
    for (const [y, r] of [[0.09, 0.225], [0.27, 0.268], [0.45, 0.235]] as const) ring(r, 0.012, IRON, [bx, FLOOR + y, bz], 14);
    cyl(0.19, 0.19, 0.012, 12, woodDark, [bx, FLOOR + 0.545, bz]);
    // bucket + ladle on the lid
    b.lathe(
      [
        [0, 0],
        [0.08, 0],
        [0.1, 0.15],
        [0.09, 0.15],
        [0.07, 0.02],
        [0, 0.02],
      ],
      { at: [bx + 0.03, FLOOR + 0.55, bz], segments: 10, color: lit(grain("#8a6a3a", "#a98648", { size: 0.03, axis: "y", seed: 22 }), 0.6), name: "bucket" },
    );
    put(new THREE.TorusGeometry(0.09, 0.006, 4, 10, Math.PI), IRON, [bx + 0.03, FLOOR + 0.7, bz]);
    b.rod([bx - 0.12, FLOOR + 0.56, bz + 0.1], [bx - 0.02, FLOOR + 0.57, bz + 0.2], 0.01, woodPost);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Grass tufts around the edge of the paving

  {
    const tex = [grassTex("#4f8a4a", "#6fa65a", "#3d7040"), grassTex("#5a9650", "#86b865", "#456f44"), grassTex("#3f7a48", "#5c9a58", "#2f5f3c")];
    const fr: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 600 && fr.length < 90; i++) {
      const x = (R() - 0.5) * 4.2;
      const z = -1.4 + R() * 3.3;
      if (Math.pow(Math.abs(x / 1.95), 3) + Math.pow(Math.abs((z - 0.25) / 1.5), 3) > 1) continue;
      if (onPath(new THREE.Vector3(x, FLOOR, z))) continue;
      fr.push(frame([x, FLOOR, z], [0, 1, 0]));
    }
    b.cards(fr, tex, { size: [0.11, 0.17], vary: 0.4, spin: 180, bend: 12, cross: true, rng: R });
  }

  return b.root;
}
```