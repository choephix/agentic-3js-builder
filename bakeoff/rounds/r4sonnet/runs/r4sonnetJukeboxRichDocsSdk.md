```ts
import * as THREE from "three";
import { catmull, createBuilder, frame, grain, paint, polyline, svg } from "agentic-3js-builder";

export const meta = {
  name: "Starlite Hi-Fi Jukebox",
  description:
    "A 1950s diner jukebox: mahogany cabinet with a tall arch of red, amber and teal glowing tubes, chrome trim and marquee bulbs, " +
    "a domed glass window showing a spindle stack of records, a picker arm lifting one and a tonearm on a turntable, " +
    "a slanted deck with two rows of chrome selection buttons and title cards, a coin slot, and a starburst speaker grille.",
};

type V3 = [number, number, number];
type RGB = [number, number, number];

const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const mixc = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const sstep = (e0: number, e1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ---- layout constants (meters) ----
const HW = 0.42; // cabinet half width, also the arch radius
const YC = 1.13; // arch centre height
const WIN_HW = 0.24; // window half width
const WIN_BOT = 0.9; // window floor
const ZF = 0.3; // cabinet front face

// ---- palette ----
const NAVY = "#1d1428";
const CREAM = "#f3e7c6";
const RED = "#e32b2b";
const AMBER = "#ffae1f";
const TEAL = "#1ccfbd";
const TEAL_D = "#117c7b";
const CHROME_F = "#d2dae2";
const BLACK = "#17151b";
const FILL = "#0b090e";
const BULB = "#fff0c4";
const RUBBER = "#2c2a31";
const VIN_RED = "#a8232c";
const VIN_TEAL = "#1b8a89";
const VIN_AMBER = "#d8921c";

// ---- outlines and paths ----
const archOutline = (hw: number, yBottom: number, steps = 16): [number, number][] => {
  const pts: [number, number][] = [
    [-hw, yBottom],
    [hw, yBottom],
    [hw, YC],
  ];
  for (let i = 1; i < steps; i++) {
    const a = (Math.PI * i) / steps;
    pts.push([hw * Math.cos(a), YC + hw * Math.sin(a)]);
  }
  pts.push([-hw, YC]);
  return pts;
};

const archPath = (r: number, yBottom: number, z: number, steps = 14) => {
  const pts: V3[] = [
    [-r, yBottom, z],
    [-r, (yBottom + YC) / 2, z],
  ];
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI - (Math.PI * i) / steps;
    pts.push([r * Math.cos(a), YC + r * Math.sin(a), z]);
  }
  pts.push([r, (YC + yBottom) / 2, z], [r, yBottom, z]);
  return catmull(pts);
};

const rrPath = (cx: number, cy: number, hw: number, hh: number, r: number, z: number): V3[] => {
  const pts: V3[] = [];
  const corners: [number, number, number][] = [
    [hw - r, -(hh - r), -90],
    [hw - r, hh - r, 0],
    [-(hw - r), hh - r, 90],
    [-(hw - r), -(hh - r), 180],
  ];
  for (const [ox, oy, a0] of corners) {
    for (let i = 0; i <= 4; i++) {
      const a = ((a0 + (i * 90) / 4) * Math.PI) / 180;
      pts.push([cx + ox + r * Math.cos(a), cy + oy + r * Math.sin(a), z]);
    }
  }
  return pts;
};

const rrect = (w: number, h: number, r: number): [number, number][] => [
  [-w / 2 + r, -h / 2],
  [w / 2 - r, -h / 2],
  [w / 2, -h / 2 + r],
  [w / 2, h / 2 - r],
  [w / 2 - r, h / 2],
  [-w / 2 + r, h / 2],
  [-w / 2, h / 2 - r],
  [-w / 2, -h / 2 + r],
];

const half = (rx: number, ry: number) => (): [number, number] => [rx, ry];

// ---- the slanted selection deck ----
const FRONT_LIP: [number, number] = [0.44, 0.52]; // [z, y]
const TOP_EDGE: [number, number] = [0.335, 0.8];
const slopeLen = Math.hypot(FRONT_LIP[0] - TOP_EDGE[0], TOP_EDGE[1] - FRONT_LIP[1]);
const vy = (TOP_EDGE[1] - FRONT_LIP[1]) / slopeLen;
const vz = (TOP_EDGE[0] - FRONT_LIP[0]) / slopeLen;
const V: V3 = [0, vy, vz]; // up the slope
const N: V3 = [0, -vz, vy]; // out of the slope
/** point on the deck: u across (+X is the model's left), v up the slope, lift out of the face */
const D = (u: number, v: number, lift = 0): V3 => [
  u,
  FRONT_LIP[1] + vy * v + N[1] * lift,
  FRONT_LIP[0] + vz * v + N[2] * lift,
];

// ---- SVG drawings ----
const grilleMarkup = (): string => {
  const W = 640;
  const H = 300;
  const cx = 320;
  const cy = 150;
  const f = (n: number) => n.toFixed(1);
  const ray = (ang: number, len: number, hf: number, fill: string) => {
    const a1 = ang - hf;
    const a2 = ang + hf;
    return `<polygon points="${cx},${cy} ${f(cx + len * Math.cos(a1))},${f(cy + len * Math.sin(a1))} ${f(cx + len * Math.cos(a2))},${f(cy + len * Math.sin(a2))}" fill="${fill}"/>`;
  };
  const star = (x: number, y: number, fill: string) =>
    `<polygon points="${x},${y - 16} ${x + 4},${y - 4} ${x + 16},${y} ${x + 4},${y + 4} ${x},${y + 16} ${x - 4},${y + 4} ${x - 16},${y} ${x - 4},${y - 4}" fill="${fill}"/>`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">`;
  s += `<rect width="${W}" height="${H}" fill="#c99a38"/>`;
  for (let y = 3; y < H; y += 8) s += `<rect x="0" y="${y}" width="${W}" height="3" fill="#bb8b2c"/>`;
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    s += ray(a, 480, i % 2 === 0 ? 0.085 : 0.055, i % 2 === 0 ? "#34181b" : "#8c2b1d");
  }
  for (let i = 0; i < 24; i++) {
    const a = ((i + 0.5) * Math.PI * 2) / 24;
    s += ray(a, i % 2 === 0 ? 175 : 125, 0.034, "#f6e8bb");
  }
  for (let i = 0; i < 24; i += 2) {
    const a = (i * Math.PI * 2) / 24;
    const x = cx + 112 * Math.cos(a);
    const y = cy + 112 * Math.sin(a);
    s += `<polygon points="${f(x)},${f(y - 9)} ${f(x + 6)},${f(y)} ${f(x)},${f(y + 9)} ${f(x - 6)},${f(y)}" fill="#1ccfbd"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="92" fill="none" stroke="#34181b" stroke-width="4"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="68" fill="none" stroke="#f6e8bb" stroke-width="5"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="46" fill="#dfe6ec"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="36" fill="#c4161c"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="18" fill="#f6e8bb"/>`;
  s += star(46, 40, "#f6e8bb") + star(594, 40, "#f6e8bb") + star(46, 260, "#f6e8bb") + star(594, 260, "#f6e8bb");
  s += `<rect x="4" y="4" width="632" height="292" fill="none" stroke="#34181b" stroke-width="6"/>`;
  return s + `</svg>`;
};

const nameplateMarkup = (): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 65">` +
  `<rect width="340" height="65" rx="12" fill="#eef2f6"/>` +
  `<rect x="5" y="5" width="330" height="55" rx="9" fill="#aab4be"/>` +
  `<rect x="9" y="9" width="322" height="47" rx="7" fill="#f6efd8"/>` +
  `<text x="170" y="43" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="bold" font-size="36" fill="#c4161c">Starlite</text>` +
  `<polygon points="30,32 34,22 38,32 48,32 40,38 43,48 34,42 25,48 28,38 20,32" fill="#1ccfbd"/>` +
  `<polygon points="310,32 314,22 318,32 328,32 320,38 323,48 314,42 305,48 308,38 300,32" fill="#1ccfbd"/>` +
  `</svg>`;

const glassMarkup = (): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<polygon points="9,74 24,24 33,24 18,74" fill="#ffffff"/>` +
  `<polygon points="37,68 45,36 49,36 41,68" fill="#e4f8ff"/>` +
  `<polygon points="62,22 70,9 74,9 66,22" fill="#ffffff"/>` +
  `<polygon points="14,90 32,85 33,88 16,93" fill="#ffffff"/>` +
  `<circle cx="84" cy="80" r="2.6" fill="#ffffff"/>` +
  `<circle cx="90" cy="71" r="1.5" fill="#e4f8ff"/>` +
  `</svg>`;

const coinMarkup = (): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36">` +
  `<rect width="60" height="36" fill="#a3141c"/>` +
  `<rect x="2" y="2" width="56" height="32" fill="none" stroke="#f6e8bb" stroke-width="1.6"/>` +
  `<text x="30" y="21" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="17" fill="#f6e8bb">5&#162;</text>` +
  `<text x="30" y="31" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="7" fill="#f6e8bb">PLAY</text>` +
  `</svg>`;

const headerMarkup = (): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 11">` +
  `<rect width="250" height="11" rx="3" fill="#117c7b"/>` +
  `<text x="125" y="8.4" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="7.6" fill="#f6e8bb" letter-spacing="1.6">SELECT YOUR RECORD</text>` +
  `</svg>`;

const cardMarkup = (code: string, i: number): string => {
  const accents = [RED, AMBER, TEAL];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 34">` +
    `<rect width="62" height="34" fill="#f8f0d8"/>` +
    `<rect width="62" height="7" fill="${accents[i % 3]}"/>` +
    `<rect x="0" y="31" width="62" height="3" fill="#d9c9a0"/>` +
    `<text x="4" y="22" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="12" fill="#2a1a1c">${code}</text>` +
    `<rect x="27" y="12" width="${24 + (i % 4) * 4}" height="3" fill="#4a3a30"/>` +
    `<rect x="27" y="18" width="${18 + ((i * 3) % 5) * 4}" height="2.5" fill="#8a7a62"/>` +
    `<rect x="27" y="23.5" width="${12 + ((i * 7) % 4) * 5}" height="2.5" fill="#8a7a62"/>` +
    `</svg>`
  );
};

// ---- the model ----
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "jukebox", paintSize: 2048 });

  // skeleton: a root plus the few parts that would move
  const root = b.joint("root", { at: [0, 0, 0] });
  type Joint = typeof root;
  const pickerPivot = b.joint("pickerPivot", { parent: root, at: [0, 1.108, 0.1], dir: [0, 1, 0], role: "hinge" });
  const toneArm = b.joint("toneArm", { parent: root, at: [-0.205, 0.97, 0.265], dir: [0, 1, 0], role: "hinge" });
  const platter = b.joint("platter", { parent: root, at: [-0.115, 0.918, 0.17], dir: [0, 1, 0], role: "hinge" });

  type Col = string | ReturnType<typeof paint>;
  type Extra = { rotation?: V3; dir?: V3; up?: V3; axis?: "x" | "y" | "z" };
  const P = (geo: THREE.BufferGeometry, color: Col, at: V3, extra: Extra = {}, bone: Joint = root) =>
    b.part(geo, color, { bone, at, ...extra });
  const T = (geo: THREE.BufferGeometry, tex: ReturnType<typeof svg>, at: V3, extra: Extra = {}) =>
    b.part(geo, "#ffffff", { bone: root, at, texture: tex, ...extra });

  // ---- paints ----
  const WOOD = grain("#4a1e13", "#74351f", { size: 0.04, axis: "y", seed: 5 });

  const HOR = hex("#34404f");
  const SKY1 = hex("#9cc2e4");
  const SKY2 = hex("#f6fafd");
  const GRD1 = hex("#d7c8a8");
  const GRD2 = hex("#7d6a52");
  const env = (ry: number): RGB =>
    ry >= 0
      ? mixc(HOR, mixc(SKY1, SKY2, sstep(0.2, 0.8, ry)), sstep(0, 0.12, ry))
      : mixc(HOR, mixc(GRD1, GRD2, sstep(-0.25, -0.9, ry)), sstep(0, -0.12, ry));
  // painted chrome: a fake room reflection with a dark horizon band
  const CHROME = paint((p, n) => env(2 * n.z * n.y + 0.3 * n.x + 0.45 * (p.y - 0.75)));

  const neon = (edge: string, mid: string, core: string) => {
    const e = hex(edge);
    const m = hex(mid);
    const c = hex(core);
    return paint((_p, n) => mixc(mixc(e, m, sstep(-0.1, 0.55, n.z)), c, sstep(0.8, 0.97, n.z)));
  };
  const NEON_RED = neon("#8f0c1b", "#ff3328", "#ffe0d2");
  const NEON_AMBER = neon("#a85e00", "#ffae1a", "#fff3c4");
  const NEON_TEAL = neon("#05666b", "#1fe0d0", "#e2fffb");

  const SUN_A = hex("#ffb82e");
  const SUN_B = hex("#f0661f");
  const SUN_C = hex("#fff0b0");
  const SUN_D = hex("#b92a1c");
  const SUN = paint((p) => {
    const dx = p.x;
    const dy = p.y - 0.9;
    const a = Math.atan2(dx, dy);
    const k = Math.floor((a + Math.PI) / (Math.PI / 16));
    const r = Math.hypot(dx, dy);
    const base = k % 2 === 0 ? SUN_A : SUN_B;
    return mixc(mixc(SUN_C, base, sstep(0.05, 0.3, r)), SUN_D, sstep(0.3, 0.52, r));
  });

  const recordPaint = (cx: number, cz: number, vinyl: string, label: string, ringc: string) => {
    const v = hex(vinyl);
    const vDark = mixc(v, [0, 0, 0], 0.3);
    const l = hex(label);
    const rc = hex(ringc);
    return paint((p, n): RGB => {
      if (n.y < 0.5) return v;
      const dx = p.x - cx;
      const dz = p.z - cz;
      const r = Math.hypot(dx, dz);
      if (r < 0.005) return [0.08, 0.08, 0.08];
      if (r < 0.03) return l;
      if (r < 0.034) return rc;
      const groove = r > 0.08 || Math.floor(r / 0.003) % 2 === 0 ? v : vDark;
      const ang = Math.atan2(dz, dx);
      const sheen = Math.pow(Math.max(0, Math.cos(2 * (ang - 0.7))), 10) * 0.22;
      return mixc(groove, [1, 1, 1], sheen);
    });
  };

  // ---- textures ----
  const grilleTex = svg(grilleMarkup(), { size: 1024 });
  const nameTex = svg(nameplateMarkup(), { size: 680 });
  const glassTex = svg(glassMarkup(), { size: 512 });
  const coinTex = svg(coinMarkup(), { size: 240 });
  const headerTex = svg(headerMarkup(), { size: 1000 });

  // ================= CABINET SHELL =================
  P(new THREE.BoxGeometry(0.78, 0.1, 0.54), NAVY, [0, 0.05, 0]); // plinth
  P(new THREE.BoxGeometry(0.78, 0.012, 0.01), CHROME, [0, 0.094, 0.272]);
  for (let i = -3; i <= 3; i++) P(new THREE.BoxGeometry(0.05, 0.012, 0.004), FILL, [i * 0.09, 0.04, 0.272]);

  b.extrude(
    [
      [-HW, 0.1],
      [HW, 0.1],
      [HW, 0.8],
      [-HW, 0.8],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.6, bevel: 0.014, color: WOOD, bone: root },
  );
  b.extrude(archOutline(HW, 0.8), {
    at: [0, 0, -0.125],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.35,
    bevel: 0.014,
    color: WOOD,
    bone: root,
  });

  // chrome corner posts and side speed-lines
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.024, 0.7, 0.024), CHROME, [s * 0.41, 0.45, 0.295]);
    const x = s * 0.4195;
    b.capsule([x, 0.3, 0.25], [x, 0.3, -0.12], 0.0045, { color: CHROME_F, bone: root });
    b.capsule([x, 0.34, 0.25], [x, 0.34, -0.02], 0.0045, { color: CHROME_F, bone: root });
    b.capsule([x, 0.38, 0.25], [x, 0.38, 0.08], 0.0045, { color: CHROME_F, bone: root });
  }

  // ================= ARCH FACADE =================
  const boxSweep = (path: ReturnType<typeof archPath>, rx: number, ry: number, color: Col) =>
    b.sweep(path, half(rx, ry), { section: "box", up: [0, 0, 1], caps: "flat", color, bone: root });

  boxSweep(archPath(0.335, 0.8, 0.175), 0.085, 0.125, NAVY); // dark face of the arch
  boxSweep(archPath(0.25, WIN_BOT, 0.175), 0.01, 0.125, CHROME); // window tunnel lining
  boxSweep(archPath(0.416, 0.8, 0.175), 0.006, 0.125, CHROME); // outer wrap trim
  boxSweep(archPath(0.255, WIN_BOT, 0.304), 0.0125, 0.005, CHROME); // front bezel
  boxSweep(archPath(0.4075, 0.84, 0.303), 0.0125, 0.005, CHROME); // outer front rim
  boxSweep(archPath(0.308, 0.82, 0.3), 0.005, 0.004, CHROME); // ribs between the tubes
  boxSweep(archPath(0.354, 0.82, 0.3), 0.005, 0.004, CHROME);

  // the glowing tubes
  const tubes: [number, Col][] = [
    [0.285, NEON_TEAL],
    [0.331, NEON_AMBER],
    [0.377, NEON_RED],
  ];
  for (const [r, col] of tubes) {
    b.sweep(archPath(r, 0.845, 0.296), 0.018, { sides: 10, caps: "flat", color: col, bone: root });
    for (const s of [1, -1]) P(new THREE.CylinderGeometry(0.0225, 0.0225, 0.03, 10), CHROME, [s * r, 0.835, 0.296]);
  }

  // marquee studs round the outer rim
  b.along(archPath(0.4075, 0.84, 0.309), 32, (at) =>
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), BULB, { at, bone: root }),
  );

  // bottom band, rail and nameplate
  P(new THREE.BoxGeometry(0.49, 0.1, 0.25), NAVY, [0, 0.85, 0.175]);
  P(new THREE.BoxGeometry(0.84, 0.018, 0.012), CHROME, [0, 0.809, 0.306]);
  T(new THREE.PlaneGeometry(0.34, 0.065), nameTex, [0, 0.857, 0.3025], { dir: [0, 0, 1], axis: "z" });

  // crown finial
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.032, 0.006],
      [0.02, 0.012],
      [0.02, 0.018],
      [0.026, 0.024],
      [0.012, 0.038],
      [0, 0.046],
    ],
    { at: [0, 1.546, 0.17], axis: [0, 1, 0], segments: 12, color: CHROME, bone: root },
  );
  P(new THREE.SphereGeometry(0.012, 8, 5), RED, [0, 1.59, 0.17]);

  // ================= WINDOW INTERIOR =================
  b.extrude(archOutline(0.245, WIN_BOT), {
    at: [0, 0, 0.052],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.004,
    color: SUN,
    bone: root,
  });
  // marquee bulbs inside the arch
  for (let i = 0; i < 9; i++) {
    const a = ((20 + i * 17.5) * Math.PI) / 180;
    P(new THREE.SphereGeometry(0.013, 6, 4), BULB, [0.205 * Math.cos(a), YC + 0.205 * Math.sin(a), 0.075]);
  }

  // floor plate
  P(new THREE.BoxGeometry(0.47, 0.012, 0.23), TEAL_D, [0, 0.906, 0.17]);
  P(new THREE.BoxGeometry(0.47, 0.016, 0.012), CHROME, [0, 0.908, 0.285]);

  // record stack on a spindle (x = +0.115, the model's left)
  const SX = 0.115;
  const SZ = 0.17;
  P(new THREE.CylinderGeometry(0.098, 0.098, 0.01, 24), CHROME, [SX, 0.917, SZ]);
  P(new THREE.CylinderGeometry(0.08, 0.08, 0.098, 20), FILL, [SX, 0.9715, SZ]);
  const stackCols = [BLACK, BLACK, VIN_RED, BLACK, BLACK, BLACK, VIN_TEAL, BLACK, BLACK, VIN_AMBER, BLACK, BLACK, VIN_RED, BLACK];
  const jit = (i: number, k: number) => (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
  stackCols.forEach((c, i) => {
    P(new THREE.CylinderGeometry(0.086, 0.086, 0.0044, 28), c, [
      SX + jit(i, 1) * 0.0022,
      0.9247 + i * 0.0072,
      SZ + jit(i, 2) * 0.0022,
    ]);
  });
  P(new THREE.CylinderGeometry(0.0035, 0.0035, 0.13, 8), CHROME_F, [SX, 0.985, SZ]);
  for (const deg of [20, 140, 260]) {
    const a = (deg * Math.PI) / 180;
    b.rod([SX + 0.093 * Math.cos(a), 0.922, SZ + 0.093 * Math.sin(a)], [SX + 0.093 * Math.cos(a), 1.035, SZ + 0.093 * Math.sin(a)], 0.0035, {
      color: CHROME_F,
      bone: root,
    });
  }

  // the picker arm, lifting a cherry-red record off the stack
  P(new THREE.CylinderGeometry(0.011, 0.011, 0.184, 10), CHROME, [0, 1.004, 0.1]);
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.024, 14), CHROME, [0, 1.108, 0.1], {}, pickerPivot);
  b.rod([0, 1.108, 0.1], [SX, 1.108, SZ], [0.009, 0.006], { color: CHROME_F, bone: pickerPivot });
  b.capsule([0, 1.108, 0.1], [-0.03, 1.108, 0.082], 0.011, { color: RED, bone: pickerPivot });
  P(new THREE.CylinderGeometry(0.017, 0.017, 0.02, 12), CHROME, [SX, 1.108, SZ], {}, pickerPivot);
  b.rod([SX, 1.098, SZ], [SX, 1.07, SZ], 0.0045, { color: CHROME_F, bone: pickerPivot });
  P(new THREE.CylinderGeometry(0.015, 0.015, 0.004, 12), RUBBER, [SX, 1.0675, SZ], {}, pickerPivot);
  P(
    new THREE.CylinderGeometry(0.086, 0.086, 0.0035, 28),
    recordPaint(SX, SZ, VIN_RED, CREAM, "#d9c9a0"),
    [SX, 1.0625, SZ],
    {},
    pickerPivot,
  );

  // turntable with a playing record and its tonearm (x = -0.115)
  const PX = -0.115;
  P(new THREE.CylinderGeometry(0.098, 0.098, 0.012, 24), CHROME, [PX, 0.918, SZ], {}, platter);
  P(new THREE.CylinderGeometry(0.09, 0.09, 0.002, 24), RUBBER, [PX, 0.925, SZ], {}, platter);
  P(
    new THREE.CylinderGeometry(0.087, 0.087, 0.0035, 28),
    recordPaint(PX, SZ, BLACK, RED, "#d9c9a0"),
    [PX, 0.9278, SZ],
    {},
    platter,
  );
  P(new THREE.CylinderGeometry(0.0035, 0.0035, 0.014, 8), CHROME_F, [PX, 0.936, SZ], {}, platter);

  P(new THREE.CylinderGeometry(0.012, 0.012, 0.056, 10), CHROME, [-0.205, 0.94, 0.265]);
  P(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 10), CHROME, [-0.205, 0.97, 0.265], {}, toneArm);
  b.sweep(
    catmull([
      [-0.205, 0.972, 0.265],
      [-0.196, 0.974, 0.248],
      [-0.18, 0.962, 0.238],
      [-0.165, 0.94, 0.228],
    ]),
    [0.0045, 0.0035],
    { color: CHROME_F, bone: toneArm },
  );
  P(new THREE.BoxGeometry(0.014, 0.006, 0.022), FILL, [-0.164, 0.935, 0.231], {}, toneArm);
  b.capsule([-0.205, 0.972, 0.265], [-0.213, 0.974, 0.281], 0.0085, { color: RED, bone: toneArm });

  // domed glass: only the glare streaks are opaque
  const glass = new THREE.PlaneGeometry(1, 1, 14, 16);
  {
    const pos = glass.attributes.position as THREE.BufferAttribute;
    const yTop = YC + WIN_HW;
    const yMid = (WIN_BOT + yTop) / 2;
    const halfH = (yTop - WIN_BOT) / 2;
    for (let k = 0; k < pos.count; k++) {
      const u = pos.getX(k) + 0.5;
      const v = pos.getY(k) + 0.5;
      const y = WIN_BOT + v * (yTop - WIN_BOT);
      let shrink = 1;
      if (y > YC) shrink = Math.max(0.04, Math.sqrt(Math.max(0, 1 - ((y - YC) / WIN_HW) ** 2)));
      const x = (u - 0.5) * 2 * WIN_HW * shrink;
      const yn = (y - yMid) / halfH;
      const xn = x / WIN_HW;
      const bump = Math.max(0, 1 - xn * xn) * Math.max(0, 1 - yn * yn);
      pos.setXYZ(k, x, y, ZF + 0.065 * Math.pow(bump, 0.8));
    }
    glass.computeVertexNormals();
  }
  T(glass, glassTex, [0, 0, 0]);

  // ================= SELECTION DECK =================
  b.extrude(
    [
      [0.28, 0.46],
      [FRONT_LIP[0], 0.46],
      [FRONT_LIP[0], FRONT_LIP[1]],
      [TOP_EDGE[0], TOP_EDGE[1]],
      [0.28, 0.8],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.8, bevel: 0.006, color: WOOD, bone: root },
  );
  P(new THREE.BoxGeometry(0.8, 0.07, 0.008), CHROME, [0, 0.49, 0.443]); // chrome lip

  P(new THREE.BoxGeometry(0.76, 0.006, 0.28), CREAM, D(0, 0.15, 0.002), { dir: N, up: V });
  P(new THREE.BoxGeometry(0.79, 0.014, 0.012), CHROME, D(0, 0.292, 0.005), { dir: N, up: V });
  P(new THREE.BoxGeometry(0.79, 0.014, 0.012), CHROME, D(0, 0.006, 0.005), { dir: N, up: V });
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.012, 0.014, 0.29), CHROME, D(s * 0.386, 0.15, 0.005), { dir: N, up: V });

  T(new THREE.PlaneGeometry(0.5, 0.02), headerTex, D(0, 0.274, 0.0065), { dir: N, up: V, axis: "z" });

  const capColors = [RED, AMBER, TEAL];
  for (let row = 0; row < 2; row++) {
    const vB = row === 0 ? 0.192 : 0.1;
    const vC = row === 0 ? 0.238 : 0.146;
    P(new THREE.BoxGeometry(0.72, 0.004, 0.042), NAVY, D(0, vC, 0.0075), { dir: N, up: V });
    for (let c = 0; c < 10; c++) {
      const i = row * 10 + c;
      const u = (c - 4.5) * 0.07;
      const tex = svg(cardMarkup(`${row === 0 ? "A" : "B"}${c + 1}`, i), { size: 186 });
      T(new THREE.PlaneGeometry(0.062, 0.034), tex, D(u, vC, 0.0115), { dir: N, up: V, axis: "z" });
      P(new THREE.CylinderGeometry(0.0245, 0.0245, 0.008, 12), CHROME, D(u, vB, 0.009), { dir: N });
      const cap = new THREE.SphereGeometry(0.0185, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2);
      cap.scale(1, 0.55, 1);
      P(cap, capColors[(c + row) % 3], D(u, vB, 0.011), { dir: N });
    }
  }

  // coin mechanism band
  const CV = 0.042;
  P(new THREE.BoxGeometry(0.76, 0.0062, 0.0595), TEAL_D, D(0, CV, 0.0052), { dir: N, up: V });
  b.extrude(rrect(0.15, 0.046, 0.012), {
    at: D(0, CV, 0.0115),
    x: [1, 0, 0],
    y: V,
    thickness: 0.01,
    bevel: 0.002,
    smoothing: 1,
    color: CHROME,
    bone: root,
  });
  b.extrude(rrect(0.026, 0.036, 0.008), {
    at: D(0, CV, 0.017),
    x: [1, 0, 0],
    y: V,
    thickness: 0.005,
    color: CHROME,
    bone: root,
  });
  b.extrude(rrect(0.007, 0.026, 0.003), {
    at: D(0, CV, 0.0185),
    x: [1, 0, 0],
    y: V,
    thickness: 0.003,
    color: FILL,
    bone: root,
  });
  T(new THREE.PlaneGeometry(0.05, 0.03), coinTex, D(-0.05, CV, 0.0172), { dir: N, up: V, axis: "z" });
  P(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10), CHROME, D(0.052, CV, 0.0185), { dir: N });
  P(new THREE.CylinderGeometry(0.011, 0.011, 0.008, 10), RED, D(0.052, CV, 0.0205), { dir: N });

  // volume knob and coin-return cup
  P(new THREE.CylinderGeometry(0.026, 0.029, 0.018, 14), CHROME, D(-0.27, CV, 0.0173), { dir: N });
  const knobCap = new THREE.SphereGeometry(0.02, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2);
  knobCap.scale(1, 0.5, 1);
  P(knobCap, RED, D(-0.27, CV, 0.0263), { dir: N });
  P(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 14), CHROME, D(0.27, CV, 0.0143), { dir: N });
  P(new THREE.CylinderGeometry(0.018, 0.018, 0.0125, 12), FILL, D(0.27, CV, 0.0145), { dir: N });

  // pilot lamps
  const lamps: [number, string][] = [
    [-0.17, RED],
    [0.17, TEAL],
  ];
  for (const [u, col] of lamps) {
    P(new THREE.CylinderGeometry(0.015, 0.015, 0.008, 10), CHROME, D(u, CV, 0.0123), { dir: N });
    const lens = new THREE.SphereGeometry(0.0105, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2);
    lens.scale(1, 0.7, 1);
    P(lens, col, D(u, CV, 0.0163), { dir: N });
  }

  // ================= SPEAKER GRILLE =================
  T(new THREE.PlaneGeometry(0.64, 0.3), grilleTex, [0, 0.28, 0.303], { dir: [0, 0, 1], axis: "z" });
  b.sweep(polyline(rrPath(0, 0.28, 0.33, 0.15, 0.03, 0.306), { closed: true }), half(0.01, 0.006), {
    section: "box",
    up: [0, 0, 1],
    color: CHROME,
    bone: root,
  });
  b.ring(frame([0, 0.28, 0.31], [0, 0, 1]), { count: 24, radius: 0.052 }, (it) => {
    const a = (it.i * Math.PI * 2) / 24;
    const dx = Math.abs(Math.sin(a));
    const dy = Math.abs(Math.cos(a));
    const ext = Math.min(dy > 1e-6 ? 0.135 / dy : 9, dx > 1e-6 ? 0.305 / dx : 9);
    const want = it.i % 4 === 0 ? 0.3 : it.i % 2 === 0 ? 0.19 : 0.1;
    const len = Math.max(0.03, Math.min(want, ext) - 0.052);
    return b.spike(it, it, len, 0.0085, { color: CHROME_F, bone: root });
  });
  const boss = new THREE.SphereGeometry(0.045, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  boss.scale(1, 0.45, 1);
  P(boss, CHROME, [0, 0.28, 0.31], { dir: [0, 0, 1] });
  const jewel = new THREE.SphereGeometry(0.02, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  jewel.scale(1, 0.6, 1);
  P(jewel, RED, [0, 0.28, 0.329], { dir: [0, 0, 1] });

  return b.root;
}
```