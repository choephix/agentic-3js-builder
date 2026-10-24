```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  gradient,
  line,
  mix,
  noise,
  paint,
  polyline,
  rng,
  scales,
  smoothstep,
  stripes,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragon Boat",
  description:
    "Festival dragon boat in red-and-gold lacquer: carved dragon head and curled tail, a drummer beating a swirl-painted drum, a standing steersman and sixteen synchronised paddlers.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RED = "#c4161c";
const RED_DEEP = "#7e0c14";
const GOLD = "#e8b53a";
const GOLD_DEEP = "#b07a1c";
const BLACK = "#17100f";
const CREAM = "#f4e7c3";
const JADE = "#1d8a6e";
const TEAL = "#14323c";
const YELLOW = "#f0b92a";
const WOOD = "#8a5a30";
const STICK = "#e9d3a0";
const HAIR = "#15100d";
const INKC = "#0c0807";
const SKINS = ["#d9a36e", "#c58a5a", "#e6b88a"];

type P = [number, number, number];
const unit = (a: P): P => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const add = (a: P, d: P, k = 1): P => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
const lerp3 = (a: P, c: P, t: number): P => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

// ---------------------------------------------------------------------------------------------------------------
// Hull profile (z runs stern -5.3 .. bow +5.3)
const rise = (z: number) =>
  z > 3 ? ((z - 3) / 2.3) ** 2 * 0.6 : z < -3 ? ((-3 - z) / 2.2) ** 2 * 0.5 : 0;
const halfW = (z: number) => 0.12 + 0.43 * (1 - Math.min(Math.abs(z) / 5.3, 1) ** 3);
const floorTop = (z: number) => rise(z) + 0.12;

// ---------------------------------------------------------------------------------------------------------------
// Paints
const lacquer = (base: string, hi: string, seed = 1) =>
  paint((p, n) => {
    const g = smoothstep(0.1, 1, n.y) * 0.5 + noise(p, 0.6, seed) * 0.3;
    const c = mix(base, hi, g);
    return mix(c, "#240406", smoothstep(-0.1, -1, n.y) * 0.45);
  });
const RED_LAC = lacquer(RED, "#ee4a3a", 1);
const DEEP_LAC = lacquer("#8a0f18", "#c42a2a", 2);
const BLACK_LAC = lacquer("#150f0e", "#4b3b38", 3);
const GOLD_LAC = lacquer("#c8932a", "#ffe58a", 4);

const wallPaint = paint((p, n) => {
  const h = p.y - rise(p.z);
  if (n.y > 0.8) return BLACK_LAC;
  if (n.y < -0.8) return DEEP_LAC;
  const inner = n.x * Math.sign(p.x) < -0.5;
  if (inner) return h > 0.5 ? GOLD_LAC : DEEP_LAC;
  if (h > 0.5) return GOLD_LAC;
  if (h > 0.46) return BLACK_LAC;
  if (h < 0.13) return TEAL;
  if (h < 0.15) return CREAM;
  return RED_LAC;
});
const FLOOR_BOARDS = stripes("#3a1511", "#27100d", { size: 0.16, axis: "x", width: 0.45, wobble: 0.05 });
const floorPaint = paint((p, n) => {
  if (n.y > 0.7) return FLOOR_BOARDS;
  if (n.y < -0.7) return DEEP_LAC;
  return p.y - rise(p.z) < 0.14 ? TEAL : DEEP_LAC;
});
const RAIL = stripes(BLACK, GOLD, { size: 0.32, axis: "z", width: 0.35, wobble: 0 });
const SCALE_RED = scales([RED, "#d4241e", "#b0121a"], GOLD_DEEP, { size: 0.07, width: 0.14 });
const HORN_PAINT = gradient("#f1d9a0", "#d88a2a", [0, 1.9, 0], [0, 2.5, 0]);
const BLADE_PAINT = paint((_p, _n, s) => (s[1] > 0.3 ? GOLD : s[1] < 0.05 ? BLACK : RED_LAC));
const JERSEY_Y = paint((p, n) => (p.y > 0.985 ? RED : mix(YELLOW, "#ffe27a", smoothstep(0, 1, n.y) * 0.5)));
const JERSEY_J = paint((p, n) => (p.y > 0.985 ? CREAM : mix(JADE, "#3cc29a", smoothstep(0, 1, n.y) * 0.5)));
const JACKET = paint((p, n) =>
  p.y < 0.86
    ? RED
    : Math.abs(p.x) < 0.018 && n.z < -0.2
      ? GOLD
      : mix("#1c1414", "#3b2c2a", smoothstep(0, 1, n.y)),
);
const STEER_JACKET = paint((p, n) =>
  Math.abs(p.x) < 0.02 && n.z > 0.2 ? GOLD : p.y < 1.12 ? RED_DEEP : mix("#10242c", "#26444e", smoothstep(0, 1, n.y)),
);

// flame blades (mane, fins): root red to gold tips
const FLAME: [number, number][] = [
  [0, 0],
  [-0.02, 0.1],
  [0.03, 0.2],
  [0.12, 0.34],
  [0.13, 0.22],
  [0.17, 0.12],
  [0.15, 0],
];
const flamePaints = new Map<number, ReturnType<typeof paint>>();
const flameFor = (k: number) => {
  let f = flamePaints.get(k);
  if (!f) {
    f = paint((_p, _n, s) => {
      const t = smoothstep(0.02, 0.32 * k, s[1]);
      return mix(mix("#b3101a", "#f2561e", Math.min(t * 1.6, 1)), "#ffd45a", smoothstep(0.6, 1, t));
    });
    flamePaints.set(k, f);
  }
  return f;
};

// ---------------------------------------------------------------------------------------------------------------
// Textures
const cloudShape = `
<path d="M14 44 C10 30 28 24 38 32 C42 16 68 14 74 32 C86 26 100 36 94 46 Z"/>
<path d="M38 32 C32 42 44 48 50 42 C54 36 46 33 43 37"/>
<path d="M74 32 C70 40 80 44 85 39"/>
<path d="M94 46 C112 54 126 40 146 46 C156 49 160 44 164 40"/>`;
const cloudLayer = (stroke: string, w: number) =>
  `<g transform="translate(8 0) scale(1.38 1)" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${cloudShape}</g>`;
const CLOUD = svg(
  `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">${cloudLayer("#2a0608", 9)}${cloudLayer("#f0c14a", 5)}${cloudLayer("#fff1b0", 1.6)}</svg>`,
  { size: 512 },
);
let waveMarks = "";
for (let i = 0; i < 10; i++)
  waveMarks += `<g transform="translate(${i * 24} 0)"><path d="M0 24 C2 8 12 3 20 8 C15 9 14 15 17 18"/><path d="M0 24 Q12 30 24 24"/></g>`;
const WAVE = svg(
  `<svg viewBox="0 0 240 30" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#0b2a31" stroke-width="7">${waveMarks}</g><g stroke="#f4e7c3" stroke-width="3.2">${waveMarks}</g></g></svg>`,
  { size: 512 },
);
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="e"><path d="M6 36 Q40 8 94 56 Q48 96 6 36Z"/></clipPath></defs>
  <path d="M6 36 Q40 8 94 56 Q48 96 6 36Z" fill="#fff0b8"/>
  <g clip-path="url(#e)"><circle cx="52" cy="52" r="27" fill="#e8861c"/><circle cx="52" cy="60" r="19" fill="#f6c038"/>
  <ellipse cx="52" cy="52" rx="7" ry="22" fill="#1a0a06"/></g>
  <circle cx="45" cy="44" r="5" fill="#ffffff"/>
  <path d="M6 36 Q40 8 94 56 Q48 96 6 36Z" fill="none" stroke="#1a0a06" stroke-width="6" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);
let rimDots = "";
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2;
  rimDots += `<circle cx="${(50 + 47.2 * Math.cos(a)).toFixed(2)}" cy="${(50 + 47.2 * Math.sin(a)).toFixed(2)}" r="1.7" fill="#f0c14a"/>`;
}
const SWIRL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#8e0f16"/>${rimDots}
  <circle cx="50" cy="50" r="44" fill="#f4e7c3" stroke="#e8b53a" stroke-width="2"/>
  <path d="M50 12 A38 38 0 0 1 50 88 A19 19 0 0 1 50 50 A19 19 0 0 0 50 12Z" fill="#c4161c"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#2a0608" stroke-width="2"/>
  <circle cx="50" cy="31" r="5" fill="#f4e7c3"/><circle cx="50" cy="69" r="5" fill="#c4161c"/>
  </svg>`,
  { size: 256 },
);
const PEARL = svg(
  `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M40 4 C46 22 62 28 56 46 C50 40 46 38 40 42 C34 38 30 40 24 46 C18 28 34 22 40 4Z" fill="#f0c14a" stroke="#2a0608" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="40" cy="68" r="22" fill="#d6221e" stroke="#2a0608" stroke-width="3.5"/>
  <circle cx="40" cy="68" r="14" fill="none" stroke="#f0c14a" stroke-width="2.5"/>
  <circle cx="33" cy="60" r="4.5" fill="#fff4d0"/>
  </svg>`,
  { size: 256 },
);
const LANTERN = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="50" fill="#e8321e"/>
  <g stroke="#f0b52a" stroke-width="2">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${6 + i * 12.5} 0V50"/>`).join("")}</g>
  <g fill="#ffd96a"><circle cx="12" cy="25" r="6"/><circle cx="62" cy="25" r="6"/></g>
  <g fill="#e8321e"><circle cx="12" cy="25" r="2.6"/><circle cx="62" cy="25" r="2.6"/></g>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "dragon-boat", paintSize: 2048 });
  const R = rng(7);

  // ----- helpers -----
  const stick = (a: P, c: P, r = 0.014, color = STICK) => b.rod(a, c, r, color, { sides: 5 });
  const box = (size: P, color: string | ReturnType<typeof paint>, at: P) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at });
  const ball = (r: number, color: string, at: P, scale: P = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, scale, flat: true });
  const flame = (at: P, lean: P, up: P, k: number, thick = 0.03) =>
    b.extrude(
      FLAME.map(([x, y]) => [x * k, y * k] as [number, number]),
      { at, x: unit(lean), y: unit(up), thickness: thick * Math.max(k, 0.7), color: flameFor(k) },
    );
  const outward = (path: { tangentAt(t: number): THREE.Vector3 }, t: number): P => {
    const a = path.tangentAt(Math.max(t - 0.04, 0));
    const c = path.tangentAt(Math.min(t + 0.04, 1));
    return unit([a.x - c.x, a.y - c.y, a.z - c.z]);
  };
  const band = (path: { at(t: number): THREE.Vector3 }, t: number, radius: number, r: number, color: string) => {
    const a = path.at(t);
    const c = path.at(Math.min(t + 0.02, 1));
    const ring = b.ring(line([a.x, a.y, a.z], [c.x, c.y, c.z]), { count: 12, radius });
    return b.sweep(catmull(ring.items, { closed: true }), r, { color, sides: 5 });
  };
  const head = (c: P, f: number, skin: string, bandColor: string) => {
    b.part(new THREE.SphereGeometry(0.092, 9, 7), skin, { at: c, flat: true });
    b.part(new THREE.SphereGeometry(0.1, 9, 5, 0, Math.PI * 2, 0, 1.55), HAIR, { at: add(c, [0, 0.02, -0.012 * f]), flat: true });
    b.part(new THREE.CylinderGeometry(0.108, 0.108, 0.03, 10, 1, true), bandColor, { at: add(c, [0, 0.036, -0.008 * f]) });
    box([0.035, 0.035, 0.07], bandColor, add(c, [0, 0.032, -0.118 * f]));
    for (const e of [-1, 1]) {
      ball(0.013, INKC, add(c, [e * 0.036, 0.002, 0.085 * f]));
      box([0.045, 0.01, 0.012], HAIR, add(c, [e * 0.036, 0.028, 0.083 * f]));
    }
  };

  // ===== HULL =====
  const zs = [-5.3, -4.8, -4.2, -3.6, -3.0, -2.0, -1.0, 0, 1.0, 2.0, 3.0, 3.6, 4.2, 4.8, 5.3];
  const track = (dy: number, dx: (z: number) => number = () => 0) =>
    catmull(zs.map((z): P => [dx(z), rise(z) + dy, z]));
  const zOf = (path: { at(t: number): THREE.Vector3 }) => (t: number) => path.at(t).z;

  const fp = track(0.06);
  const fz = zOf(fp);
  b.sweep(fp, (t) => [halfW(fz(t)) - 0.01, 0.06], { section: "box", caps: "flat", color: floorPaint, name: "floor" });

  const walls = new Map<number, ReturnType<typeof b.sweep>>();
  for (const s of [1, -1]) {
    const wp = track(0.27, (z) => s * (halfW(z) - 0.03));
    walls.set(s, b.sweep(wp, [0.03, 0.27], { section: "box", caps: "flat", color: wallPaint, name: `wall${s > 0 ? "L" : "R"}` }));
    const rp = track(0.565, (z) => s * (halfW(z) - 0.02));
    b.sweep(rp, [0.055, 0.026], { section: "box", caps: "flat", color: RAIL, name: "rail" });
  }
  const block = (zl: number[]) => {
    const path = catmull(zl.map((z): P => [0, rise(z) + 0.27, z]));
    const zf = zOf(path);
    b.sweep(path, (t) => [halfW(zf(t)) - 0.02, 0.262], { section: "box", caps: "flat", color: wallPaint, name: "block" });
  };
  block([4.45, 4.75, 5.0, 5.2, 5.3]);
  block([-5.3, -5.1, -4.9, -4.7, -4.55]);

  // painted bands on the hull flanks
  for (const s of [1, -1]) {
    const wall = walls.get(s)!;
    for (const z of [-3, -1.5, 0, 1.5, 3]) {
      const x = s * halfW(z);
      b.decal(wall, CLOUD, { at: [x, rise(z) + 0.29, z], dir: [s, 0, 0], size: [1.5, 0.375] });
      b.decal(wall, WAVE, { at: [x, rise(z) + 0.075, z], dir: [s, 0, 0], size: [1.5, 0.15] });
    }
  }

  // ===== BENCHES =====
  const SEAT = 0.425;
  const rows = [-3.2, -2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4];
  for (const z of rows) {
    const w = 2 * (halfW(z) - 0.045);
    box([w, 0.05, 0.2], DEEP_LAC, [0, 0.4, z]);
    box([w - 0.02, 0.012, 0.215], GOLD_LAC, [0, 0.43, z]);
    box([0.12, 0.26, 0.16], RED_LAC, [0, 0.25, z]);
  }

  // ===== PADDLERS =====
  const paddler = (s: number, z: number, row: number) => {
    const jersey = row % 2 ? JERSEY_J : JERSEY_Y;
    const shirt = row % 2 ? JADE : YELLOW;
    const skin = SKINS[(row + (s > 0 ? 1 : 0)) % 3];
    const band = row % 2 ? RED : "#e8321e";
    const sx = s * 0.27;
    box([0.3, 0.15, 0.23], "#26303a", [sx, SEAT + 0.075, z]);
    b.frustumBox([sx, SEAT + 0.14, z - 0.01], [sx, SEAT + 0.6, z + 0.07], [0.27, 0.17], [0.34, 0.2], { color: jersey });
    b.rod([sx, SEAT + 0.58, z + 0.06], [sx, SEAT + 0.7, z + 0.1], 0.04, skin, { sides: 5 });
    head([sx, SEAT + 0.76, z + 0.11], 1, skin, band);

    // legs
    for (const lx of [-0.085, 0.085]) {
      const x = sx + lx;
      b.sweep(
        polyline([
          [x, SEAT + 0.07, z + 0.02],
          [x + lx * 0.2, SEAT + 0.11, z + 0.34],
          [x + lx * 0.3, 0.16, z + 0.42],
        ]),
        [0.065, 0.045],
        { color: (t: number) => (t < 0.4 ? "#26303a" : skin), sides: 6 },
      );
      box([0.09, 0.06, 0.2], BLACK, [x + lx * 0.3, 0.15, z + 0.5]);
    }

    // paddle and arms
    const j = (R() - 0.5) * 0.06;
    const sy = SEAT + 0.56;
    const shIn: P = [sx - s * 0.15, sy, z + 0.06];
    const shOut: P = [sx + s * 0.15, sy, z + 0.06];
    const G: P = [s * 0.2, SEAT + 0.82, z + 0.3];
    const T: P = [s * 1.0, 0.3, z + 0.55 + j];
    const dv = new THREE.Vector3(T[0] - G[0], T[1] - G[1], T[2] - G[2]).normalize();
    const d: P = [dv.x, dv.y, dv.z];
    const nv = new THREE.Vector3(0, 0, 1).addScaledVector(dv, -dv.z).normalize();
    const wv = new THREE.Vector3().crossVectors(dv, nv).normalize();
    const H2 = add(G, d, 0.42);
    const mIn = lerp3(shIn, G, 0.5);
    const mOut = lerp3(shOut, H2, 0.5);
    const sleeve = (t: number) => (t < 0.45 ? shirt : skin);
    b.sweep(polyline([shIn, add(mIn, [s * 0.1, -0.07, -0.03]), G]), [0.05, 0.036], { color: sleeve, sides: 6 });
    b.sweep(polyline([shOut, add(mOut, [s * 0.05, -0.09, -0.04]), H2]), [0.05, 0.036], { color: sleeve, sides: 6 });
    const P0 = add(G, d, -0.12);
    const Bs = add(G, d, 0.9);
    b.rod(P0, Bs, 0.02, WOOD, { sides: 6 });
    b.rod(add(P0, [wv.x, wv.y, wv.z], -0.07), add(P0, [wv.x, wv.y, wv.z], 0.07), 0.02, WOOD, { sides: 5 });
    b.extrude(
      [
        [-0.02, 0],
        [0.02, 0],
        [0.05, 0.06],
        [0.085, 0.2],
        [0.07, 0.3],
        [0, 0.36],
        [-0.07, 0.3],
        [-0.085, 0.2],
        [-0.05, 0.06],
      ],
      { at: Bs, x: [wv.x, wv.y, wv.z], y: d, thickness: 0.02, bevel: 0.004, color: BLADE_PAINT },
    );
  };
  rows.forEach((z, i) => {
    paddler(1, z, i);
    paddler(-1, z, i);
  });

  // ===== DRUM + DRUMMER =====
  const DZ = 3.55;
  const DY = 0.95;
  b.lathe(
    [
      [0, -0.27],
      [0.235, -0.27],
      [0.285, -0.13],
      [0.3, 0],
      [0.285, 0.13],
      [0.235, 0.27],
      [0, 0.27],
    ],
    { at: [0, DY, DZ], axis: [0, 0, 1], segments: 16, color: RED_LAC, name: "drum" },
  );
  for (const f of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.236, 20), "#ffffff", {
      at: [0, DY, DZ + f * 0.273],
      dir: [0, 0, f],
      axis: "z",
      texture: SWIRL,
    });
    b.part(new THREE.TorusGeometry(0.24, 0.014, 5, 18), GOLD_LAC, { at: [0, DY, DZ + f * 0.265] });
    b.ring(
      frame([0, DY, DZ + f * 0.2], [0, 0, 1]),
      { count: 14, radius: 0.262 },
      (item) => b.stick(new THREE.SphereGeometry(0.016, 6, 4), GOLD, item, { embed: 0.4 }),
    );
  }
  b.part(new THREE.TorusGeometry(0.3, 0.012, 5, 20), BLACK_LAC, { at: [0, DY, DZ] });
  for (const s of [1, -1]) {
    b.decal(b.surface(b.root), CLOUD, { at: [s * 0.3, DY, DZ], dir: [s, 0, 0], size: [0.5, 0.125] });
    b.rod([s * 0.2, DY - 0.2, DZ], [s * 0.3, 0.14, DZ - 0.22], 0.03, DEEP_LAC, { sides: 5 });
    b.rod([s * 0.2, DY - 0.2, DZ], [s * 0.3, 0.14, DZ + 0.22], 0.03, DEEP_LAC, { sides: 5 });
    b.rod([s * 0.3, 0.14, DZ - 0.22], [s * 0.3, 0.14, DZ + 0.22], 0.025, BLACK, { sides: 5 });
  }

  // drummer
  const dFloor = floorTop(4.2);
  const stoolTop = dFloor + 0.3;
  box([0.34, 0.3, 0.3], DEEP_LAC, [0, dFloor + 0.15, 4.2]);
  box([0.36, 0.03, 0.32], GOLD_LAC, [0, stoolTop - 0.012, 4.2]);
  const dHip = stoolTop + 0.09;
  box([0.32, 0.16, 0.24], RED_DEEP, [0, dHip, 4.2]);
  b.frustumBox([0, dHip + 0.06, 4.2], [0, dHip + 0.58, 4.15], [0.3, 0.2], [0.38, 0.22], { color: JACKET });
  b.rod([0, dHip + 0.56, 4.15], [0, dHip + 0.7, 4.12], 0.045, SKINS[0], { sides: 5 });
  head([0, dHip + 0.8, 4.1], -1, SKINS[0], GOLD);
  // shouting mouth and a black cap crest
  ball(0.02, "#4a0a10", [0, dHip + 0.745, 4.1 - 0.083], [1.4, 0.8, 0.6]);
  box([0.05, 0.1, 0.05], RED, [0, dHip + 0.93, 4.1]);
  ball(0.04, RED, [0, dHip + 0.99, 4.1]);
  for (const lx of [-0.09, 0.09]) {
    b.sweep(
      polyline([
        [lx, dHip + 0.03, 4.15],
        [lx, dHip + 0.1, 3.92],
        [lx, dFloor + 0.05, 3.97],
      ]),
      [0.065, 0.045],
      { color: (t: number) => (t < 0.5 ? RED_DEEP : SKINS[0]), sides: 6 },
    );
    box([0.09, 0.06, 0.2], BLACK, [lx, dFloor + 0.04, 3.9]);
  }
  const dSh = dHip + 0.52;
  // right (-x) arm striking, left (+x) arm raised
  const strike = (s: number, hand: P, elbowOff: P) => {
    const sh: P = [s * 0.19, dSh, 4.15];
    b.sweep(polyline([sh, add(lerp3(sh, hand, 0.5), elbowOff), hand]), [0.05, 0.036], {
      color: (t: number) => (t < 0.45 ? RED : SKINS[0]),
      sides: 6,
    });
  };
  strike(-1, [-0.14, dSh - 0.14, 3.92], [-0.12, -0.1, 0.1]);
  strike(1, [0.205, dSh + 0.1, 3.99], [0.1, -0.05, 0.08]);
  stick([-0.15, dSh - 0.07, 4.08], [-0.11, dSh - 0.24, 3.83]);
  stick([0.19, dSh + 0.05, 4.03], [0.23, dSh + 0.39, 3.84]);
  ball(0.022, RED, [-0.11, dSh - 0.24, 3.83]);
  ball(0.022, RED, [0.23, dSh + 0.39, 3.84]);

  // ===== STEERSMAN =====
  {
    const z = -4.0;
    const fl = floorTop(z);
    for (const lx of [-0.08, 0.08]) {
      b.sweep(
        polyline([
          [lx, fl + 0.85, z],
          [lx * 1.2, fl + 0.45, z + 0.02],
          [lx * 1.3, fl + 0.05, z + 0.02],
        ]),
        [0.07, 0.05],
        { color: (t: number) => (t < 0.7 ? "#10242c" : SKINS[1]), sides: 6 },
      );
      box([0.1, 0.06, 0.22], BLACK, [lx * 1.3, fl + 0.03, z + 0.06]);
    }
    box([0.32, 0.14, 0.22], "#10242c", [0, fl + 0.88, z]);
    b.frustumBox([0, fl + 0.92, z], [0, fl + 1.42, z + 0.02], [0.3, 0.2], [0.37, 0.22], { color: STEER_JACKET });
    b.rod([0, fl + 1.4, z + 0.02], [0, fl + 1.52, z + 0.03], 0.045, SKINS[1], { sides: 5 });
    head([0, fl + 1.6, z + 0.04], 1, SKINS[1], RED);
    b.part(new THREE.ConeGeometry(0.3, 0.16, 12), "#e0c070", { at: [0, fl + 1.77, z + 0.04], flat: true });
    b.part(new THREE.TorusGeometry(0.2, 0.01, 4, 14), RED, { at: [0, fl + 1.72, z + 0.04], rotation: [90, 0, 0] });
    // steering oar
    const G: P = [0.05, 1.3, -4.15];
    const T: P = [0.9, 0.2, -5.7];
    const dv = new THREE.Vector3(T[0] - G[0], T[1] - G[1], T[2] - G[2]).normalize();
    const d: P = [dv.x, dv.y, dv.z];
    const nv = new THREE.Vector3(0, 0, 1).addScaledVector(dv, -dv.z).normalize();
    const wv = new THREE.Vector3().crossVectors(dv, nv).normalize();
    const H2 = add(G, d, 0.35);
    const shL: P = [0.15, fl + 1.32, z];
    const shR: P = [-0.15, fl + 1.32, z];
    b.sweep(polyline([shR, add(lerp3(shR, G, 0.5), [-0.05, -0.1, -0.02]), G]), [0.05, 0.036], {
      color: (t: number) => (t < 0.45 ? "#10242c" : SKINS[1]),
      sides: 6,
    });
    b.sweep(polyline([shL, add(lerp3(shL, H2, 0.5), [0.07, -0.08, 0.03]), H2]), [0.05, 0.036], {
      color: (t: number) => (t < 0.45 ? "#10242c" : SKINS[1]),
      sides: 6,
    });
    b.rod(add(G, d, -0.15), add(G, d, 1.45), 0.025, WOOD, { sides: 6 });
    b.extrude(
      [
        [-0.03, 0],
        [0.03, 0],
        [0.09, 0.1],
        [0.13, 0.35],
        [0.1, 0.55],
        [0, 0.62],
        [-0.1, 0.55],
        [-0.13, 0.35],
        [-0.09, 0.1],
      ],
      { at: add(G, d, 1.45), x: [wv.x, wv.y, wv.z], y: d, thickness: 0.025, bevel: 0.005, color: BLADE_PAINT },
    );
  }

  // ===== DRAGON HEAD =====
  const neckPath = catmull([
    [0, 0.8, 4.95],
    [0, 1.05, 5.12],
    [0, 1.32, 5.3],
    [0, 1.55, 5.48],
  ]);
  b.sweep(neckPath, [0.15, 0.15, 0.16, 0.19], { color: SCALE_RED, sides: 10, name: "neck" });
  band(neckPath, 0.12, 0.17, 0.028, GOLD);
  band(neckPath, 0.8, 0.185, 0.022, GOLD);
  [0.12, 0.3, 0.48, 0.66, 0.84].forEach((t, i) => {
    const c = neckPath.at(t);
    flame([c.x, c.y + 0.06, c.z - 0.15], [0, -0.5, -0.8], [0, 0.8, -0.5], i % 2 ? 1.3 : 0.9);
  });

  const HC: P = [0, 1.72, 5.58];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SCALE_RED, { at: HC, scale: [0.23, 0.21, 0.26], flat: true });
  // snout + upper jaw
  b.frustumBox([0, 1.7, 5.74], [0, 1.74, 6.28], [0.36, 0.22], [0.32, 0.17], { color: RED_LAC, name: "upperJaw" });
  ball(0.1, "#d6221e", [0, 1.8, 6.3], [1.5, 1, 1.1]);
  for (const s of [1, -1]) {
    ball(0.02, INKC, [s * 0.07, 1.84, 6.38], [1, 1.2, 1]);
    // golden lip curls
    b.sweep(bezier([s * 0.17, 1.62, 5.75], [s * 0.21, 1.6, 6.05], [s * 0.16, 1.7, 6.3]), [0.035, 0.015], {
      color: GOLD_LAC,
      sides: 5,
    });
    // cheeks
    ball(0.12, "#d6221e", [s * 0.17, 1.6, 5.7], [1, 0.9, 1.1]);
  }
  // dark mouth interior, lower jaw and tongue
  b.frustumBox([0, 1.57, 5.7], [0, 1.62, 6.1], [0.26, 0.06], [0.22, 0.05], { color: "#4a0a10" });
  b.frustumBox([0, 1.5, 5.66], [0, 1.38, 6.1], [0.3, 0.12], [0.26, 0.1], { color: RED_LAC, name: "lowerJaw" });
  b.frustumBox([0, 1.56, 5.72], [0, 1.47, 5.99], [0.14, 0.03], [0.1, 0.025], { color: "#e5557a" });
  for (const s of [1, -1]) {
    for (const z of [5.88, 6.0, 6.12, 6.24]) {
      const t = (z - 5.74) / 0.54;
      const bottom = 1.7 + 0.04 * t - (0.22 - 0.05 * t) / 2;
      b.spike([s * 0.14, bottom + 0.01, z], [0, -1, 0], 0.06, 0.016, { color: CREAM, sides: 5 });
      const tl = (z - 5.66) / 0.44;
      if (tl < 1) {
        const top = 1.5 - 0.12 * tl + (0.12 - 0.02 * tl) / 2;
        b.spike([s * 0.1, top - 0.01, z], [0, 1, 0], 0.045, 0.013, { color: CREAM, sides: 5 });
      }
    }
    b.spike([s * 0.07, 1.665, 6.28], [0, -1, 0.1], 0.1, 0.02, { color: CREAM, sides: 5 });
  }
  // eyes, brows
  for (const s of [1, -1]) {
    const ec: P = [s * 0.165, 1.84, 5.72];
    const eye = b.part(new THREE.SphereGeometry(0.072, 10, 8), "#f3d98a", { at: ec });
    const dir = unit([s * 0.55, 0.15, 0.82]);
    glow(b.decal(eye, EYE, { at: add(ec, dir, 0.072), dir, size: [0.13, 0.13], mirror: s > 0 }), 0.8);
    b.sweep(bezier([s * 0.07, 1.94, 5.62], [s * 0.2, 2.02, 5.8], [s * 0.27, 1.92, 6.0]), [0.05, 0.018], {
      color: GOLD_LAC,
      sides: 6,
    });
  }
  // forehead pearl
  const fdir = unit([0, 0.6, 0.8]);
  glow(b.decal(skull, PEARL, { at: add(HC, [0, 0.13, 0.2]), dir: fdir, size: [0.1, 0.125] }), 0.6);

  // antlers
  for (const s of [1, -1]) {
    const hp = bezier(
      [s * 0.1, 1.9, 5.5],
      [s * 0.16, 2.1, 5.55],
      [s * 0.2, 2.3, 5.2],
      [s * 0.15, 2.5, 4.8],
    );
    b.sweep(hp, [0.05, 0.012], { color: HORN_PAINT, caps: { start: "flat", end: "point" }, sides: 6 });
    for (const [t, k] of [
      [0.42, 1],
      [0.7, 0.75],
    ] as [number, number][]) {
      const t1 = hp.at(t);
      b.sweep(
        bezier(t1, [t1.x + s * 0.1 * k, t1.y + 0.1 * k, t1.z + 0.12 * k], [t1.x + s * 0.2 * k, t1.y + 0.24 * k, t1.z + 0.1 * k]),
        [0.032, 0.006],
        { color: HORN_PAINT, caps: { start: "flat", end: "point" }, sides: 5 },
      );
    }
    // cheek fin
    flame([s * 0.2, 1.68, 5.53], [-0.7, 0, -0.7 * s], [0.7 * s, 0, -0.7], 1.3);
    // whiskers
    b.sweep(bezier([s * 0.17, 1.7, 6.2], [s * 0.55, 1.78, 6.15], [s * 0.7, 1.55, 5.65], [s * 0.85, 1.15, 5.3]), [0.016, 0.004], {
      color: CREAM,
      sides: 4,
    });
    b.sweep(bezier([s * 0.15, 1.76, 6.1], [s * 0.4, 1.95, 6.0], [s * 0.55, 1.95, 5.7], [s * 0.7, 1.75, 5.35]), [0.013, 0.004], {
      color: GOLD,
      sides: 4,
    });
  }
  // skull-back flames
  flame([0, HC[1] + 0.19, HC[2] - 0.12], [0, -0.5, -0.8], [0, 0.8, -0.5], 1.3);
  flame([0, HC[1] + 0.1, HC[2] - 0.22], [0, -0.5, -0.8], [0, 0.8, -0.5], 1.7);
  // beard
  for (let i = -2; i <= 2; i++) {
    b.sweep(
      bezier(
        [i * 0.02, 1.4, 6.05],
        [i * 0.05, 1.28, 6.02],
        [i * 0.09, 1.05, 5.98],
        [i * 0.12, 0.85 + Math.abs(i) * 0.04, 5.78],
      ),
      [0.03, 0.006],
      { color: i % 2 ? CREAM : "#fff6e0", sides: 5 },
    );
  }
  ball(0.035, RED, [0, 1.34, 6.06]);

  // ===== DRAGON TAIL =====
  const tailPath = catmull([
    [0, 0.78, -4.8],
    [0, 0.9, -5.3],
    [0, 1.2, -5.7],
    [0, 1.7, -5.75],
    [0, 2.1, -5.4],
    [0, 2.25, -4.95],
  ]);
  b.sweep(tailPath, [0.17, 0.15, 0.12, 0.09, 0.06, 0.03], { color: SCALE_RED, sides: 9, name: "tail" });
  band(tailPath, 0.1, 0.18, 0.025, GOLD);
  [0.14, 0.28, 0.42, 0.56, 0.7, 0.84].forEach((t, i) => {
    const c = tailPath.at(t);
    const o = outward(tailPath, t);
    const T = tailPath.tangentAt(t);
    const r = 0.17 * (1 - t) + 0.03 * t;
    flame(add([c.x, c.y, c.z], o, r * 0.8), [T.x, T.y, T.z], o, i % 2 ? 0.9 : 1.3);
  });
  const E = tailPath.at(1);
  flame([E.x, E.y, E.z], [0, 0.4, -0.2], [0, 0.5, 0.85], 1.7);
  flame([E.x, E.y, E.z], [0, 0.3, -0.95], [0, 0.95, 0.3], 1.7);
  flame([E.x, E.y, E.z], [0, 0.35, 0.9], [0, 0.9, -0.4], 1.3);

  // ===== PENNANTS + LANTERNS =====
  for (const s of [1, -1]) {
    const px = s * 0.36;
    const pz = -3.7;
    const base = rise(pz) + 0.58;
    b.rod([px, base, pz], [px, 2.4, pz], 0.02, GOLD_LAC, { sides: 6 });
    ball(0.035, GOLD, [px, base + 0.02, pz]);
    b.extrude(
      [
        [0, 0],
        [0.9, 0.04],
        [0.7, 0.17],
        [0.9, 0.3],
        [0, 0.34],
      ],
      {
        at: [px, 1.95, pz - 0.02],
        x: [0, 0, -1],
        thickness: 0.012,
        color: paint((_p, _n, st) => (st[1] < 0.03 || st[1] > 0.31 ? GOLD : st[0] > 0.8 ? RED : YELLOW)),
      },
    );
    for (const f of [1, -1])
      b.part(new THREE.CircleGeometry(0.13, 14), "#ffffff", {
        at: [px + f * 0.009, 2.12, pz - 0.18],
        dir: [f, 0, 0],
        axis: "z",
        texture: SWIRL,
      });
    // lantern
    const ly = 2.55;
    glow(
      b.part(new THREE.SphereGeometry(1, 10, 8), "#ffffff", { at: [px, ly, pz], scale: [0.13, 0.16, 0.13], texture: LANTERN }),
      1.1,
    );
    b.part(new THREE.CylinderGeometry(0.065, 0.075, 0.035, 8), GOLD, { at: [px, ly + 0.16, pz] });
    b.part(new THREE.CylinderGeometry(0.075, 0.065, 0.035, 8), GOLD, { at: [px, ly - 0.16, pz] });
    b.spike([px, ly + 0.17, pz], [0, 1, 0], 0.09, 0.018, { color: GOLD, sides: 5 });
    b.sweep(polyline([[px, ly - 0.17, pz], [px, ly - 0.3, pz]]), 0.006, { color: RED, sides: 4 });
    b.spike([px, ly - 0.42, pz], [0, 1, 0], 0.12, 0.03, { color: RED, sides: 6 });
  }

  return b.root;
}
```