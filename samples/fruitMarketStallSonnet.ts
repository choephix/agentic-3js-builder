// Fruit market stall: a wonky teal-and-cream stall with a scalloped striped awning, a gingham counter, crates,
// baskets, a barrel, a wheelbarrow of melons, a chalkboard, a hanging apple sign, a lamppost with bunting and a
// handful of small story details (a sparrow, a sleeping cat, a snail, a worm in the apple on the roof).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, grain, paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Fruit Market Stall",
  description:
    "A whimsical fruit market stall: scalloped striped awning, gingham counter, crates of fruit, wicker baskets, a barrel, a wheelbarrow of watermelons, a chalkboard, a swinging apple sign and a sleeping cat.",
  style: "whimsical",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// ---------------------------------------------------------------- palette
const TEAL = "#3fb0a6";
const TEAL_L = "#8adccd";
const TEAL_D = "#23807d";
const TEAL_XD = "#17585a";
const CREAM = "#fff1cf";
const BUTTER = "#ffd966";
const CORAL = "#ff6f61";
const CORAL_D = "#d9473f";
const WOOD = "#d79a58";
const WOOD_L = "#efc384";
const WOOD_D = "#a0653a";
const WOOD_XD = "#6f4326";
const IRON = "#5d6074";
const IRON_L = "#cfd6e4";
const BRASS = "#eab33a";
const WICKER_A = "#dca760";
const STRAW_C = "#e8c46a";
const WICKER_B = "#b97a3d";
const STONE_SIDE = "#9a8f86";
const RED = "#e63a47";
const GREEN_A = "#9ed443";
const YELLOW_A = "#f6d84a";
const ORANGE = "#ff9a1f";
const LEMON = "#ffe347";
const PEAR = "#cbd94b";
const PLUM = "#7c3f9f";
const GRAPE = "#6a3a94";
const GRAPE_G = "#bde66c";
const BANANA = "#ffd83a";
const STRAWB = "#ff3c55";
const CHERRY = "#c3122f";
const PEACH = "#ffae85";
const LEAF = "#53b64f";
const LEAF_D = "#2f8f48";
const STEM = "#6b4a2b";
const PINK = "#ff9db0";
const BLACK = "#2a1d2e";
const WHITE = "#fffaf0";
const JAM_R = "#c82a3c";
const JAM_P = "#6b2f7d";
const HONEY = "#f0a81e";
const GLASS = "#cfeee8";
const SACK = "#d8b98a";
const CAT = "#f29a4b";
const CAT_L = "#ffe2b8";
const CAT_D = "#c9692a";
const BIRD = "#9a6b45";
const BIRD_L = "#f3dcb5";
const DARK_FILL = "#5b3a2a";
const LAMP = "#2f6a68";
const BULB = "#fff0a0";
const MELON_FLESH = "#ff4d5e";
const MELON_G1 = "#3fa34d";
const MELON_G2 = "#1f6f3c";
const PINE = "#f2b632";
const PINE_D = "#a8691f";
const SNAIL = "#e7c9a5";

// ---------------------------------------------------------------- drawings
const FONT = "Georgia, 'Times New Roman', serif";
const CHALK_FONT = "'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive";

const fruitIcon = (kind: string) => {
  switch (kind) {
    case "apples":
      return `<path d="M50 20 C60 8 80 16 76 36 C73 48 60 54 50 49 C40 54 27 48 24 36 C20 16 40 8 50 20Z" fill="#e63a47" stroke="#9c1f2f" stroke-width="2.5"/><path d="M50 20 C50 11 55 6 62 6 C62 13 57 18 50 20Z" fill="#53b64f" stroke="#2f8f48" stroke-width="2"/><path d="M38 24 C34 28 33 33 35 38" stroke="#ffd0c8" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    case "pears":
      return `<path d="M50 6 C59 6 58 22 62 31 C71 44 63 56 50 56 C37 56 29 44 38 31 C42 22 41 6 50 6Z" fill="#cbd94b" stroke="#7c9a22" stroke-width="2.5"/><path d="M52 8 C58 2 66 4 68 10 C62 14 56 12 52 8Z" fill="#53b64f" stroke="#2f8f48" stroke-width="2"/><path d="M40 36 C38 42 40 47 43 50" stroke="#f6fbb0" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    case "oranges":
      return `<circle cx="50" cy="31" r="22" fill="#ff9a1f" stroke="#c46a00" stroke-width="2.5"/><path d="M50 9 C50 3 56 2 62 5 C60 11 54 12 50 9Z" fill="#53b64f" stroke="#2f8f48" stroke-width="2"/><circle cx="40" cy="22" r="4" fill="#ffd08a"/><circle cx="58" cy="40" r="1.8" fill="#c46a00"/><circle cx="44" cy="44" r="1.8" fill="#c46a00"/>`;
    case "plums":
      return `<circle cx="50" cy="32" r="20" fill="#7c3f9f" stroke="#4a1f66" stroke-width="2.5"/><path d="M50 12 C48 22 48 40 50 52" stroke="#4a1f66" stroke-width="2.5" fill="none"/><path d="M50 12 C52 6 60 4 64 8 C60 14 54 14 50 12Z" fill="#53b64f" stroke="#2f8f48" stroke-width="2"/><ellipse cx="40" cy="25" rx="4" ry="6" fill="#b88bd0"/>`;
    default:
      return `<ellipse cx="50" cy="31" rx="26" ry="19" fill="#ffe347" stroke="#c9a400" stroke-width="2.5"/><path d="M22 31 L16 28 M78 31 L84 28" stroke="#c9a400" stroke-width="4" stroke-linecap="round"/><path d="M40 20 C46 17 52 17 58 19" stroke="#fff9b8" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M60 12 C64 6 72 6 74 10 C70 16 64 16 60 12Z" fill="#53b64f" stroke="#2f8f48" stroke-width="2"/>`;
  }
};
const crateLabel = (kind: string, accent: string) =>
  svg(
    `<svg viewBox="0 0 100 72"><rect x="2" y="2" width="96" height="68" rx="12" fill="#fff1cf" stroke="${accent}" stroke-width="4"/><rect x="8" y="8" width="84" height="56" rx="8" fill="none" stroke="${accent}" stroke-width="1.6" stroke-dasharray="4 3"/><g transform="translate(0,2) scale(1,0.92)">${fruitIcon(kind)}</g><text x="50" y="64" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="14" fill="${accent}">${kind.toUpperCase()}</text></svg>`,
    { size: 256 },
  );
const LABELS: Record<string, THREE.Texture> = {
  apples: crateLabel("apples", "#b8283a"),
  pears: crateLabel("pears", "#5c8a1c"),
  oranges: crateLabel("oranges", "#c46a00"),
  plums: crateLabel("plums", "#5b2a7a"),
  lemons: crateLabel("lemons", "#a88a00"),
};

const BANNER = svg(
  `<svg viewBox="0 0 320 100"><rect x="3" y="3" width="314" height="94" rx="24" fill="#fff1cf" stroke="#ff6f61" stroke-width="6"/><rect x="14" y="14" width="292" height="72" rx="16" fill="none" stroke="#3fb0a6" stroke-width="2.5" stroke-dasharray="7 5"/><text x="160" y="63" text-anchor="middle" textLength="168" lengthAdjust="spacingAndGlyphs" font-family="${FONT}" font-weight="bold" font-style="italic" font-size="40" fill="#d9473f" stroke="#7a2020" stroke-width="1">Fresh Fruit!</text><g transform="translate(22,24) scale(0.56)">${fruitIcon("apples")}</g><g transform="translate(242,24) scale(0.56)">${fruitIcon("pears")}</g></svg>`,
  { size: 640 },
);

const CHALK = svg(
  `<svg viewBox="0 0 240 340"><rect width="240" height="340" rx="14" fill="#2d4a43"/><rect x="9" y="9" width="222" height="322" rx="10" fill="none" stroke="#f7efd8" stroke-width="3"/><text x="120" y="52" text-anchor="middle" font-family="${CHALK_FONT}" font-size="26" fill="#fff8e1">Today's</text><text x="120" y="98" text-anchor="middle" font-family="${CHALK_FONT}" font-weight="bold" font-size="46" fill="#ffd966">FRUIT!</text><path d="M42 112 C70 122 90 104 120 112 C150 120 170 104 198 112" stroke="#ffd966" stroke-width="3.5" fill="none" stroke-linecap="round"/><g stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#ff8a7a"><circle cx="46" cy="154" r="15"/><path d="M46 139 C46 132 50 130 54 130"/></g><g stroke="#d6e86a"><path d="M46 190 C52 190 52 200 55 205 C60 213 54 222 46 222 C38 222 32 213 37 205 C40 200 40 190 46 190Z"/></g><g stroke="#ffb347"><circle cx="46" cy="262" r="15"/><circle cx="46" cy="262" r="2"/></g><g stroke="#c9a4e8"><circle cx="46" cy="304" r="12"/></g></g><g font-family="${CHALK_FONT}" font-size="25" fill="#fff8e1"><text x="76" y="162">apples</text><text x="76" y="212">pears</text><text x="76" y="270">oranges</text><text x="76" y="312">plums</text></g><g font-family="${CHALK_FONT}" font-size="25" fill="#ffd966" text-anchor="end"><text x="214" y="162">3/1</text><text x="214" y="212">2/1</text><text x="214" y="270">4/1</text><text x="214" y="312">5/1</text></g><path d="M156 36 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4z" fill="#fff8e1"/><path d="M200 70 l2.5 -6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5z" fill="#ffd966"/></svg>`,
  { size: 512 },
);

const SIGN_FACE = svg(
  `<svg viewBox="0 0 200 110"><text x="100" y="78" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="66" fill="#fff1cf" stroke="#7a1d2b" stroke-width="7" paint-order="stroke" stroke-linejoin="round">Fruit</text></svg>`,
  { size: 512 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="#fff1cf" stroke="#ff6f61" stroke-width="8"/><circle cx="100" cy="100" r="80" fill="none" stroke="#3fb0a6" stroke-width="3.5" stroke-dasharray="9 6"/><g transform="translate(40,28) scale(1.2)"><path d="M50 20 C60 8 80 16 76 36 C73 48 60 54 50 49 C40 54 27 48 24 36 C20 16 40 8 50 20Z" fill="#e63a47" stroke="#9c1f2f" stroke-width="3"/><path d="M50 20 C50 11 55 6 62 6 C62 13 57 18 50 20Z" fill="#53b64f" stroke="#2f8f48" stroke-width="2.5"/><path d="M38 24 C34 28 33 33 35 38" stroke="#ffd0c8" stroke-width="4" fill="none" stroke-linecap="round"/></g><path d="M20 128 L180 128 L168 160 L180 192 L20 192 L32 160 Z" transform="translate(0,-22)" fill="#d9473f" stroke="#7a2020" stroke-width="4"/><text x="100" y="152" text-anchor="middle" textLength="116" lengthAdjust="spacingAndGlyphs" font-family="${FONT}" font-weight="bold" font-style="italic" font-size="30" fill="#fff1cf">Fresh Daily</text></svg>`,
  { size: 512 },
);
const RUG = paint((_p, _n, s) => {
  const ex = Math.abs(s[0]) > 0.74 || Math.abs(s[1]) > 0.24;
  if (ex) return TEAL_D;
  if (Math.abs(s[0]) > 0.68 || Math.abs(s[1]) > 0.18) return BUTTER;
  const k = Math.floor((s[1] + 0.3) / 0.045);
  return k % 3 === 0 ? CORAL : k % 3 === 1 ? CREAM : TEAL_L;
});

const GRASS = svg(
  `<svg viewBox="0 0 48 48"><path d="M8 48 C8 30 6 20 2 8 C12 18 15 32 16 48Z" fill="#3fa34d"/><path d="M18 48 C18 28 20 14 24 2 C30 16 30 32 30 48Z" fill="#53b64f"/><path d="M32 48 C34 34 38 22 46 12 C44 26 42 38 40 48Z" fill="#2f8f48"/></svg>`,
  { size: 128 },
);
const DAISY = svg(
  `<svg viewBox="0 0 40 56"><path d="M20 56 C20 44 21 34 20 24" stroke="#3fa34d" stroke-width="3.5" fill="none"/><path d="M20 46 C28 44 31 38 31 34 C25 36 21 40 20 46Z" fill="#53b64f"/><g fill="#fffaf0"><ellipse cx="20" cy="10" rx="4.2" ry="8"/><ellipse cx="20" cy="26" rx="4.2" ry="8"/><ellipse cx="10" cy="18" rx="8" ry="4.2"/><ellipse cx="30" cy="18" rx="8" ry="4.2"/><ellipse cx="13" cy="11" rx="4.2" ry="7.5" transform="rotate(-45 13 11)"/><ellipse cx="27" cy="11" rx="4.2" ry="7.5" transform="rotate(45 27 11)"/><ellipse cx="13" cy="25" rx="4.2" ry="7.5" transform="rotate(45 13 25)"/><ellipse cx="27" cy="25" rx="4.2" ry="7.5" transform="rotate(-45 27 25)"/></g><circle cx="20" cy="18" r="5.5" fill="#ffc21a"/></svg>`,
  { size: 128 },
);
const POPPY = svg(
  `<svg viewBox="0 0 40 56"><path d="M20 56 C20 44 19 34 20 24" stroke="#3fa34d" stroke-width="3.5" fill="none"/><path d="M20 44 C12 42 9 36 9 32 C15 34 19 38 20 44Z" fill="#53b64f"/><circle cx="20" cy="18" r="14" fill="#ff5a4d"/><circle cx="20" cy="18" r="5" fill="#2a1d2e"/><circle cx="12" cy="12" r="2.4" fill="#ffd2c8"/></svg>`,
  { size: 128 },
);
const PATCH = svg(
  `<svg viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="7" fill="#ffd966"/><rect x="9" y="9" width="46" height="46" rx="4" fill="none" stroke="#a0653a" stroke-width="3" stroke-dasharray="6 4"/><path d="M22 24 L42 40 M42 24 L22 40" stroke="#d9473f" stroke-width="4" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const JAM_LABELS = [
  svg(
    `<svg viewBox="0 0 40 40"><rect x="1" y="1" width="38" height="38" rx="9" fill="#fff1cf" stroke="#c82a3c" stroke-width="3"/><circle cx="20" cy="22" r="9" fill="#ff3c55"/><path d="M20 13 C20 9 24 8 27 9 C26 13 22 14 20 13Z" fill="#53b64f"/></svg>`,
    { size: 96 },
  ),
  svg(
    `<svg viewBox="0 0 40 40"><rect x="1" y="1" width="38" height="38" rx="9" fill="#fff1cf" stroke="#c46a00" stroke-width="3"/><circle cx="20" cy="21" r="10" fill="#ff9a1f"/><path d="M20 11 C20 7 24 6 27 7 C26 11 22 12 20 11Z" fill="#53b64f"/></svg>`,
    { size: 96 },
  ),
];
const TAGS = [3, 5, 2].map((n) =>
  svg(
    `<svg viewBox="0 0 40 40"><path d="M3 3 H37 V37 H3 Z" fill="#fff1cf" stroke="#d9473f" stroke-width="3"/><text x="20" y="31" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="30" fill="#d9473f">${n}</text></svg>`,
    { size: 96 },
  ),
);

// ---------------------------------------------------------------- geometry kit
const DEG = Math.PI / 180;
const I = new THREE.Matrix4();
const xf = (p: P3 = [0, 0, 0], r: P3 = [0, 0, 0], s: number | P3 = 1) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(...p),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG)),
    typeof s === "number" ? new THREE.Vector3(s, s, s) : new THREE.Vector3(...s),
  );
const at = (w: THREE.Matrix4, p: P3, r: P3 = [0, 0, 0]) => w.clone().multiply(xf(p, r));
const world = (w: THREE.Matrix4, p: P3): P3 => {
  const v = new THREE.Vector3(...p).applyMatrix4(w);
  return [v.x, v.y, v.z];
};

const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
const cyl = (rt: number, rb: number, h: number, seg = 6) => new THREE.CylinderGeometry(rt, rb, h, seg, 1);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cone = (r: number, h: number, seg = 5) => new THREE.ConeGeometry(r, h, seg, 1);
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);

type Bag = { color: string; bone: string; texture?: THREE.Texture; glow?: number; geos: THREE.BufferGeometry[] };
const bag = new Map<string, Bag>();
type PutOpts = { bone?: string; texture?: THREE.Texture; glow?: number };
let curBone = "base";
const put = (color: string, geo: THREE.BufferGeometry, local: THREE.Matrix4, w: THREE.Matrix4 = I, o: PutOpts = {}) => {
  const bone = o.bone ?? curBone;
  const key = `${bone}|${color}|${o.texture?.uuid ?? ""}|${o.glow ?? ""}`;
  let entry = bag.get(key);
  if (!entry) {
    entry = { color, bone, texture: o.texture, glow: o.glow, geos: [] };
    bag.set(key, entry);
  }
  geo.applyMatrix4(w.clone().multiply(local));
  entry.geos.push(geo);
};
const rodAB = (color: string, a: P3, c: P3, r: number, w: THREE.Matrix4 = I, o: PutOpts = {}, sides = 5) => {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...c);
  const d = B.clone().sub(A);
  const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), aim(d), new THREE.Vector3(1, 1, 1));
  put(color, cyl(r, r, d.length(), sides), m, w, o);
};

// ---------------------------------------------------------------- fruit
type FruitFn = (m: THREE.Matrix4) => void;
const apple =
  (color: string, s = 1): FruitFn =>
  (m) => {
    put(color, ball(0.05 * s, 7, 5), xf([0, 0, 0], [0, 0, 0], [1, 0.92, 1]), m);
    put(STEM, new THREE.CylinderGeometry(0.004, 0.005, 0.026 * s, 4, 1, true), xf([0, 0.047 * s, 0]), m);
    put(LEAF, ball(0.017 * s, 4, 2), xf([0.017 * s, 0.05 * s, 0], [0, 0, 25], [1.5, 0.35, 0.9]), m);
  };
const orange =
  (s = 1): FruitFn =>
  (m) => {
    put(ORANGE, ball(0.052 * s, 7, 5), I, m);
    put(LEAF_D, new THREE.CylinderGeometry(0.009, 0.011, 0.006, 5, 1, true), xf([0, 0.051 * s, 0]), m);
  };
const lemon: FruitFn = (m) => {
  put(LEMON, ball(0.04, 8, 5), xf([0, 0, 0], [0, 0, 0], [1.35, 0.95, 1]), m);
  put(LEMON, cone(0.012, 0.022, 4), xf([0.054, 0, 0], [0, 0, -90]), m);
  put(LEMON, cone(0.012, 0.022, 4), xf([-0.054, 0, 0], [0, 0, 90]), m);
};
const pearGeo = new THREE.LatheGeometry(
  [
    [0.0, 0.0],
    [0.034, 0.006],
    [0.054, 0.04],
    [0.046, 0.082],
    [0.03, 0.115],
    [0.022, 0.142],
    [0.0, 0.15],
  ].map(([x, y]) => new THREE.Vector2(x, y)),
  8,
);
const pear: FruitFn = (m) => {
  put(PEAR, pearGeo.clone(), xf([0, -0.055, 0]), m);
  put(STEM, cyl(0.004, 0.005, 0.03, 4), xf([0.004, 0.115, 0], [0, 0, -12]), m);
  put(LEAF_D, ball(0.016, 5, 3), xf([0.022, 0.108, 0], [0, 0, 20], [1.5, 0.35, 0.9]), m);
};
const plum: FruitFn = (m) => {
  put(PLUM, ball(0.037, 7, 5), I, m);
  put(STEM, cyl(0.003, 0.003, 0.018, 4), xf([0, 0.038, 0]), m);
};
const peach: FruitFn = (m) => {
  put(PEACH, ball(0.05, 8, 6), I, m);
  put(CORAL, ball(0.03, 6, 4), xf([0.02, 0.012, 0.025], [0, 0, 0], [1, 0.9, 0.5]), m);
  put(LEAF, ball(0.016, 5, 3), xf([0.012, 0.05, 0], [0, 0, 25], [1.5, 0.35, 0.9]), m);
};
const berry: FruitFn = (m) => {
  put(STRAWB, ball(0.029, 6, 4), xf([0, 0, 0], [0, 0, 0], [1, 1.2, 1]), m);
  put(LEAF, cone(0.02, 0.012, 5), xf([0, 0.037, 0], [180, 0, 0]), m);
  put(STEM, cyl(0.002, 0.002, 0.014, 3), xf([0, 0.048, 0]), m);
  for (const p of [
    [0.02, 0.01, 0.019],
    [-0.012, -0.012, 0.025],
    [0.014, -0.02, 0.019],
    [-0.022, 0.012, 0.014],
  ] as P3[])
    put(BUTTER, box(0.006, 0.006, 0.004), xf(p, [0, Math.atan2(p[0], p[2]) / DEG, 0]), m);
};
const cherries: FruitFn = (m) => {
  for (const s of [1, -1]) {
    put(CHERRY, ball(0.02, 6, 4), xf([s * 0.024, -0.02, 0]), m);
    rodAB(LEAF_D, [0, 0.03, 0], [s * 0.022, -0.005, 0], 0.0022, m, {}, 3);
  }
  put(LEAF, ball(0.012, 4, 3), xf([0, 0.032, 0], [0, 0, 0], [1.4, 0.4, 0.9]), m);
};
const grapeCluster = (color: string): FruitFn => (m) => {
  const rows = [1, 2, 3, 3, 2, 1];
  rows.forEach((n, ri) => {
    const y = -ri * 0.026;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ri;
      const rr = n === 1 ? 0 : 0.02 + ri * 0.002;
      put(color, ball(0.021, 6, 4), xf([rr * Math.cos(a), y, rr * Math.sin(a)]), m);
    }
  });
  put(STEM, cyl(0.004, 0.004, 0.04, 4), xf([0, 0.035, 0]), m);
  put(LEAF, ball(0.03, 5, 3), xf([0.02, 0.03, 0], [0, 0, 15], [1.6, 0.3, 1.2]), m);
};
const lemonLeafy = lemon;

const mound = (w: THREE.Matrix4, c: P3, rad: number, n: number, rise: number, fns: FruitFn[], seed: number) => {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const rr = rad * Math.sqrt((i + 0.5) / n);
    const th = i * 2.39996 + R() * 0.25;
    const y = rise * (1 - (rr / rad) ** 2);
    const f = fns[Math.floor(R() * fns.length)];
    f(at(w, [c[0] + rr * Math.cos(th), c[1] + y, c[2] + rr * Math.sin(th)], [R() * 24 - 12, R() * 360, R() * 24 - 12]));
  }
};

// ---------------------------------------------------------------- crates
type CratePal = { slat: [string, string]; post: string };
const PAL_NAT: CratePal = { slat: [WOOD, WOOD_L], post: WOOD_D };
const PAL_TEAL: CratePal = { slat: [TEAL_L, CREAM], post: TEAL_D };
const PAL_CORAL: CratePal = { slat: [CORAL, CREAM], post: CORAL_D };

type CrateOpts = {
  w?: number;
  h?: number;
  d?: number;
  pal?: CratePal;
  label?: string;
  fill?: FruitFn[];
  r?: number;
  seed?: number;
  closed?: boolean;
  lidBone?: string;
};
const crate = (w: THREE.Matrix4, o: CrateOpts) => {
  const cw = o.w ?? 0.62;
  const ch = o.h ?? 0.34;
  const cd = o.d ?? 0.42;
  const pal = o.pal ?? PAL_NAT;
  const R = rng(o.seed ?? 3);
  const sh = (ch - 0.05) / 3 - 0.01;
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      put(pal.post, box(0.05, ch, 0.05), xf([sx * (cw / 2 - 0.025), ch / 2, sz * (cd / 2 - 0.025)]), w);
  for (let i = 0; i < 3; i++) {
    const y = 0.03 + sh / 2 + i * (sh + 0.012);
    const c0 = pal.slat[(i + (R() > 0.7 ? 1 : 0)) % 2];
    for (const sz of [1, -1]) {
      put(c0, box(cw - 0.02, sh, 0.02), xf([0, y, sz * (cd / 2 - 0.01)]), w);
      for (const sx of [1, -1]) put(IRON, box(0.011, 0.011, 0.006), xf([sx * (cw / 2 - 0.03), y, sz * (cd / 2 + 0.002)]), w);
    }
    for (const sx of [1, -1]) put(c0, box(0.02, sh, cd - 0.02), xf([sx * (cw / 2 - 0.01), y, 0]), w);
  }
  put(WOOD_D, box(cw - 0.04, 0.025, cd - 0.04), xf([0, 0.0125, 0]), w);
  for (const sz of [1, -1]) put(pal.slat[1], box(cw + 0.01, 0.03, 0.035), xf([0, ch - 0.015, sz * (cd / 2 - 0.0175)]), w);
  for (const sx of [1, -1]) {
    put(pal.slat[1], box(0.035, 0.03, cd - 0.07), xf([sx * (cw / 2 - 0.0175), ch - 0.015, 0]), w);
    put(WOOD_XD, box(0.006, 0.03, 0.1), xf([sx * (cw / 2 + 0.001), ch * 0.62, 0]), w);
  }
  if (o.label)
    put("#ffffff", plane(0.22, 0.157), xf([0.04, ch * 0.5, cd / 2 + 0.0035], [0, 0, (R() - 0.5) * 7]), w, {
      texture: LABELS[o.label],
    });
  if (o.fill) {
    const r = o.r ?? 0.05;
    put(DARK_FILL, box(cw - 0.06, ch - 0.08, cd - 0.06), xf([0, 0.03 + (ch - 0.08) / 2, 0]), w);
    const nx = Math.floor((cw - 0.07) / (2 * r));
    const nz = Math.floor((cd - 0.07) / (2 * r));
    const y1 = ch - r * 0.55;
    const place = (cx: number, cz: number, y: number) => {
      const f = o.fill![Math.floor(R() * o.fill!.length)];
      f(at(w, [cx, y, cz], [R() * 20 - 10, R() * 360, R() * 20 - 10]));
    };
    for (let i = 0; i < nx; i++)
      for (let k = 0; k < nz; k++) place((i - (nx - 1) / 2) * 2.05 * r, (k - (nz - 1) / 2) * 2.05 * r, y1);
    for (let i = 0; i < nx - 1; i++)
      for (let k = 0; k < nz - 1; k++) place((i - (nx - 2) / 2) * 2.05 * r, (k - (nz - 2) / 2) * 2.05 * r, y1 + 1.55 * r);
  }
  if (o.closed || o.lidBone) {
    // lid: three planks across, two battens, built flat on top of the crate (hinged at the back edge when lidBone)
    const bone = o.lidBone;
    const lid = (c: string, geo: THREE.BufferGeometry, p: P3) => put(c, geo, xf(p), w, { bone });
    for (let i = 0; i < 3; i++)
      lid(pal.slat[i % 2], box(cw + 0.02, 0.022, (cd + 0.02) / 3 - 0.008), [0, ch + 0.011, (i - 1) * ((cd + 0.02) / 3)]);
    for (const sx of [1, -1]) lid(pal.post, box(0.04, 0.02, cd - 0.02), [sx * (cw / 2 - 0.08), ch + 0.032, 0]);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) lid(IRON, ball(0.009, 4, 3), [sx * (cw / 2 - 0.08), ch + 0.043, sz * (cd / 2 - 0.06)]);
  }
};

// ---------------------------------------------------------------- paints
const frac = (x: number) => x - Math.floor(x);
const gingham = (a: string, c1: string, c2: string, size: number) =>
  paint((p) => {
    const cx = Math.floor(p.x / size) & 1;
    const cy = Math.floor((p.y + p.z) / size) & 1;
    return cx && cy ? c2 : cx || cy ? c1 : a;
  });
const dots = (base: string, dot: string, size: number, r: number) =>
  paint((p) => {
    const u = (p.x + p.z) / size;
    const row = Math.floor(p.y / size);
    const fx = frac(u + (row & 1) * 0.5) - 0.5;
    const fy = frac(p.y / size) - 0.5;
    return Math.hypot(fx, fy) < r ? dot : base;
  });
const COBBLES = [STONE_SIDE, "#b3a79a", "#a5a0a8", "#bfb4a3", "#9c9a96"];
const COBBLE = paint((p, n) => {
  if (Math.abs(n.y) < 0.5) return STONE_SIDE;
  const c = cells(p, 0.17, 4);
  if (c.d2 - c.d1 < 0.02) return "#6f6a6c";
  return COBBLES[Math.floor(frac(c.id * 0.6180339) * COBBLES.length)];
});
const WOOD_GRAIN_A = grain(TEAL, TEAL_D, { size: 0.045, axis: "y", seed: 2 });
const WOOD_GRAIN_B = grain(TEAL_L, TEAL, { size: 0.045, axis: "y", seed: 5 });
const WALL = paint((p, n) => {
  if (Math.abs(n.z) < 0.5) return TEAL_XD;
  const u = (p.x + 1.3) / 0.3;
  const f = frac(u);
  if (f < 0.04 || f > 0.96) return TEAL_XD;
  if (p.y > 2.0 && p.y < 2.42) {
    if (p.y < 2.035 || p.y > 2.385) return BUTTER;
    return (Math.floor((p.x + p.y) / 0.14) + Math.floor((p.x - p.y) / 0.14)) & 1 ? CORAL : CREAM;
  }
  return Math.floor(u) % 2 ? WOOD_GRAIN_A : WOOD_GRAIN_B;
});
const CNT_GRAIN = grain(TEAL, TEAL_D, { size: 0.06, axis: "x", seed: 9 });
const CNT_GRAIN2 = grain(TEAL_L, TEAL, { size: 0.06, axis: "x", seed: 11 });
const COUNTER = paint((p, n) => {
  if (n.z < 0.5) return Math.abs(n.x) > 0.5 ? WOOD : WOOD_D;
  const f = frac(p.y / 0.2);
  if (f < 0.05) return TEAL_XD;
  return Math.floor(p.y / 0.2) % 2 ? CNT_GRAIN : CNT_GRAIN2;
});
const TOP_WOOD = grain(WOOD_L, WOOD, { size: 0.05, axis: "x", seed: 4 });
const BARREL = paint((_p, n, s) => {
  const h = s[0];
  if (Math.abs(n.y) > 0.6) return WOOD_D;
  if ((h > 0.1 && h < 0.15) || (h > 0.52 && h < 0.57)) return IRON;
  const f = frac(s[1] / 22.5);
  if (f < 0.06) return WOOD_XD;
  return Math.floor(s[1] / 22.5) % 2 ? WOOD : WOOD_L;
});
const WEAVE = paint((_p, n, s) => {
  if (n.y > 0.6) return WICKER_B;
  return (Math.floor(s[0] / 0.028) + Math.floor(s[1] / 14)) & 1 ? WICKER_A : WICKER_B;
});
const POST_SPIRAL = paint((_p, _n, s) => (frac(s[1] / 360 + s[0] * 5) < 0.5 ? TEAL_D : CREAM));
const MELON = paint((_p, _n, s) => {
  const w = Math.sin(s[0] * Math.PI * 2 * 7 + Math.sin(s[1] * Math.PI * 4) * 1.2);
  return w > 0.2 ? MELON_G2 : MELON_G1;
});
const PINEAPPLE = paint((p) => {
  const c = cells(p, 0.042, 8);
  return c.d2 - c.d1 < 0.011 ? PINE_D : PINE;
});
const SLICE_R = 0.13;
const SLICE = paint((_p, n, s) => {
  if (Math.abs(n.dot(new THREE.Vector3(0, 1, 0))) < 0.5) return MELON_G1;
  const r = Math.hypot(s[0], s[1]);
  if (r > SLICE_R - 0.014) return MELON_G1;
  if (r > SLICE_R - 0.028) return WHITE;
  for (const [sx, sy] of [
    [0.03, -0.04],
    [-0.03, -0.04],
    [0.065, -0.07],
    [-0.065, -0.07],
    [0.0, -0.085],
    [0.04, -0.015],
    [-0.04, -0.015],
  ])
    if (Math.hypot(s[0] - sx, s[1] - sy) < 0.0085) return BLACK;
  return MELON_FLESH;
});
const APPLE_BIG = paint((_p, n) => {
  const t = n.y * 0.5 + 0.5;
  return t > 0.8 ? "#ff6a74" : t > 0.35 ? RED : "#b82336";
});

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "fruitMarketStall", paintSize: 2048 });
  bag.clear();
  curBone = "base";
  const base = b.joint("base", { at: [0, 0, 0] });
  const signHinge = b.joint("signHinge", { parent: base, at: [-1.85, 2.0, 0.64], dir: [0, -1, 0], role: "hinge" });
  const scalePivot: P3 = [0.1, 1.31, 0.7];
  const scaleBeam = b.joint("scaleBeam", { parent: base, at: scalePivot, dir: [1, 0, 0], role: "hinge" });
  const tilt = -4 * DEG;
  const beamEnd = (s: number): P3 => [
    scalePivot[0] + s * 0.28 * Math.cos(tilt),
    scalePivot[1] + s * 0.28 * Math.sin(tilt),
    scalePivot[2],
  ];
  const panL = b.joint("panL", { parent: scaleBeam, at: beamEnd(1), dir: [0, -1, 0], role: "hinge" });
  const panR = b.joint("panR", { parent: scaleBeam, at: beamEnd(-1), dir: [0, -1, 0], role: "hinge" });
  const wbm = xf([1.12, 0.06, 1.5], [0, -32, 0]);
  const wheelAt = world(wbm, [0, 0.19, 0.52]);
  const wheelHinge = b.joint("wheelHinge", { parent: base, at: wheelAt, dir: [-1, 0, 0], role: "hinge" });
  const lidPivot: P3 = [2.42, 0.06 + 0.34 + 0.34, 0.3 - 0.21];
  const lidHinge = b.joint("lidHinge", { parent: base, at: lidPivot, dir: [-1, 0, 0], role: "hinge" });
  const bones: Record<string, typeof base> = { base, signHinge, scaleBeam, panL, panR, wheelHinge, lidHinge };
  const S = { bone: base };
  const GY = 0.06;
  const CT = 0.882;
  const R = rng(21);

  // -------- ground: a wobbly cobbled plaza
  const slab: OutlinePoint[] = [];
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const k = 1 / Math.pow(Math.pow(Math.abs(c), 4) + Math.pow(Math.abs(s), 4), 0.25);
    const wob = 1 + 0.03 * Math.sin(a * 5 + 1) + 0.018 * Math.sin(a * 9);
    slab.push([3.2 * c * k * wob, 0.5 + 1.7 * s * k * wob]);
  }
  b.extrude(slab, { at: [0, GY / 2, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: GY, bevel: 0.02, color: COBBLE, ...S });
  // grass tufts and flowers along the rim
  const rimFrames = slab
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => i % 2 === 0 || R() > 0.5)
    .map(({ p }) => {
      const dx = p[0] * 0.985;
      const dz = 0.5 + (p[1] - 0.5) * 0.985;
      return frame([dx + (R() - 0.5) * 0.1, GY - 0.005, dz + (R() - 0.5) * 0.1], [0, 1, 0]);
    });
  b.cards(rimFrames, GRASS, { size: [0.17, 0.13], vary: 0.4, cross: true, lean: 0, flow: [0, 0, 1], rng: rng(5), ...S });
  const flowerFrames = slab
    .filter((_p, i) => i % 3 === 1)
    .map((p) => frame([p[0] * 0.97 + (R() - 0.5) * 0.08, GY, 0.5 + (p[1] - 0.5) * 0.97], [0, 1, 0]));
  b.cards(flowerFrames, [DAISY, POPPY, DAISY], { size: [0.1, 0.14], vary: 0.3, cross: true, lean: 0, flow: [0, 0, 1], rng: rng(6), ...S });

  // -------- awning geometry
  const AZ0 = -0.8;
  const AZ1 = 1.0;
  const AY0 = 2.65;
  const AY1 = 2.28;
  const SAG = 0.07;
  const awnY = (z: number) => {
    const u = (z - AZ0) / (AZ1 - AZ0);
    return AY0 + (AY1 - AY0) * u + SAG * Math.sin(Math.PI * u);
  };
  const awnNormal = (z: number): P3 => {
    const dz = 0.01;
    const dy = (awnY(z + dz) - awnY(z - dz)) / (2 * dz);
    const l = Math.hypot(dy, 1);
    return [0, 1 / l, -dy / l];
  };
  const AW = 1.55; // half width
  const NS = 10;
  const sw = (AW * 2) / NS;
  const stripeColor = (i: number) => (i % 2 ? CREAM : CORAL);

  // -------- posts, feet, knobs, beam and rafters
  const frontTop = (z: number) => awnY(z) - 0.06;
  for (const sx of [1, -1]) {
    for (const [sz, lean] of [
      [0.62, 0.012],
      [-0.62, -0.01],
    ] as const) {
      const top = frontTop(sz);
      b.rod([sx * 1.2, GY, sz], [sx * (1.2 + lean), top, sz], [0.058, 0.05], { sides: 8, color: POST_SPIRAL, ...S });
      put(STONE_SIDE, cyl(0.1, 0.12, 0.1, 8), xf([sx * 1.2, GY + 0.05, sz]));
      put(BUTTER, ball(0.07, 8, 6), xf([sx * (1.2 + lean), top + 0.02, sz]));
      put(BRASS, cyl(0.055, 0.055, 0.025, 8), xf([sx * (1.2 + lean), top - 0.03, sz]));
    }
  }
  // front beam and rafters
  b.rod([-1.34, frontTop(0.62) - 0.005, 0.62], [1.34, frontTop(0.62) - 0.005, 0.62], 0.04, { sides: 8, color: TEAL_D, ...S });
  for (const x of [-1.2, -0.4, 0.4, 1.2]) {
    const zs = [-0.78, -0.3, 0.3, 0.8, 0.97];
    b.sweep(
      catmull(zs.map((z) => [x, awnY(z) - 0.04, z])),
      0.026,
      { sides: 6, color: TEAL_D, caps: "flat", ...S },
    );
  }
  // back beam
  b.rod([-1.34, awnY(-0.62) - 0.05, -0.62], [1.34, awnY(-0.62) - 0.05, -0.62], 0.04, { sides: 8, color: TEAL_D, ...S });

  // -------- awning canvas, stripe by stripe, with a scalloped valance and pompoms
  for (let i = 0; i < NS; i++) {
    const xc = -AW + sw * (i + 0.5);
    const zs = [AZ0, -0.35, 0.1, 0.55, AZ1 - 0.0];
    b.loft(
      zs.map((z) => ({ at: [xc, awnY(z), z] as P3, w: sw - 0.004, h: 0.03 })),
      { section: "box", caps: "flat", color: stripeColor(i), ...S },
    );
    // valance flap hanging off the front edge
    const hw = sw / 2 - 0.002;
    const flap: OutlinePoint[] = [
      [-hw, 0.01, "sharp"],
      [hw, 0.01, "sharp"],
      [hw, -0.1, "sharp"],
      [hw * 0.55, -0.18],
      [0, -0.205],
      [-hw * 0.55, -0.18],
      [-hw, -0.1, "sharp"],
    ];
    b.extrude(flap, {
      at: [xc, awnY(AZ1) - 0.012, AZ1 + 0.002],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.005,
      smoothing: 1,
      color: i % 2 ? dots(CREAM, CORAL, 0.07, 0.2) : dots(CORAL, CREAM, 0.07, 0.2),
      ...S,
    });
    put(BUTTER, ball(0.03, 6, 4), xf([xc, awnY(AZ1) - 0.012 - 0.215, AZ1 + 0.002]));
    put(BRASS, cyl(0.004, 0.004, 0.02, 3), xf([xc, awnY(AZ1) - 0.012 - 0.19, AZ1 + 0.002]));
  }
  // piping along the front edge (a coral cord) and the back edge
  b.rod([-AW, awnY(AZ1) + 0.01, AZ1 + 0.012], [AW, awnY(AZ1) + 0.01, AZ1 + 0.012], 0.014, { sides: 6, color: BUTTER, ...S });
  b.rod([-AW, awnY(AZ0) + 0.012, AZ0 - 0.005], [AW, awnY(AZ0) + 0.012, AZ0 - 0.005], 0.018, { sides: 6, color: TEAL_D, ...S });
  // side flaps (scalloped) following the sag
  for (const sx of [1, -1]) {
    const zsS = [AZ0 + 0.02, -0.4, 0.1, 0.6, AZ1];
    const topLine: P3[] = [];
    for (let k = 0; k <= 8; k++) {
      const z = AZ0 + 0.02 + ((AZ1 - AZ0 - 0.02) * k) / 8;
      topLine.push([z, awnY(z) - 0.012, 0]);
    }
    void zsS;
    const outline: OutlinePoint[] = topLine.map(([z, y]) => [z - AZ0, y - awnY(AZ0), "sharp"] as OutlinePoint);
    const ns = 6;
    const dropStart = awnY(AZ1) - awnY(AZ0);
    for (let k = ns - 1; k >= 0; k--) {
      const z0 = AZ0 + 0.02 + ((AZ1 - AZ0 - 0.02) * (k + 1)) / ns;
      const z1 = AZ0 + 0.02 + ((AZ1 - AZ0 - 0.02) * k) / ns;
      const zm = (z0 + z1) / 2;
      outline.push([z0 - AZ0, awnY(z0) - awnY(AZ0) - 0.1, "sharp"]);
      outline.push([zm - AZ0, awnY(zm) - awnY(AZ0) - 0.195]);
      if (k === 0) outline.push([z1 - AZ0, awnY(z1) - awnY(AZ0) - 0.1, "sharp"]);
    }
    void dropStart;
    b.extrude(outline, {
      at: [sx * (AW - 0.012), awnY(AZ0), AZ0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.004,
      smoothing: 1,
      color: dots(CREAM, CORAL, 0.07, 0.2),
      ...S,
    });
  }

  // -------- back wall with painted diamond band, shelves and the stuff on them
  b.part(new THREE.BoxGeometry(2.4, 2.45, 0.06), WALL, { at: [0, 1.225 + GY * 0.5, -0.68], ...S });
  const shelfYs = [1.2, 1.72];
  for (const sy of shelfYs) {
    put(WOOD_L, box(2.1, 0.04, 0.3), xf([0, sy, -0.5]));
    put(WOOD_D, box(2.1, 0.03, 0.025), xf([0, sy - 0.03, -0.35]));
    put(BRASS, box(2.14, 0.012, 0.01), xf([0, sy + 0.026, -0.349]));
    for (const sx of [-0.95, -0.3, 0.3, 0.95])
      b.extrude(
        [
          [0, 0],
          [0.24, 0],
          [0, -0.2],
        ],
        { at: [sx, sy - 0.02, -0.65], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bevel: 0.006, color: TEAL_D, ...S },
      );
  }
  // jars of jam on the lower shelf
  const jarCols = [JAM_R, ORANGE, JAM_P, HONEY, JAM_R, JAM_P, ORANGE, HONEY, JAM_R, ORANGE];
  jarCols.forEach((c, i) => {
    const x = -0.95 + i * 0.205;
    const z = -0.5 + (i % 2 ? 0.02 : -0.02);
    const sy = shelfYs[0] + 0.02;
    put(GLASS, cyl(0.052, 0.052, 0.12, 8), xf([x, sy + 0.06, z]));
    put(c, cyl(0.045, 0.045, 0.1, 8), xf([x, sy + 0.055, z]));
    put(CREAM, cyl(0.056, 0.056, 0.016, 8), xf([x, sy + 0.128, z]));
    put(i % 2 ? CORAL : TEAL, cyl(0.058, 0.058, 0.012, 8), xf([x, sy + 0.14, z], [0, 0, 0], [1, 0.8, 1]));
    put(BRASS, new THREE.TorusGeometry(0.05, 0.004, 3, 8), xf([x, sy + 0.122, z], [90, 0, 0]));
    put("#ffffff", plane(0.065, 0.065), xf([x, sy + 0.06, z + 0.0525]), I, { texture: JAM_LABELS[i % 2] });
  });
  // bottles, a honey pot and baskets on the upper shelf
  const bottleCols = [CORAL, GREEN_A, "#ffb347", PLUM, TEAL_L, CORAL, GREEN_A];
  bottleCols.forEach((c, i) => {
    const x = -0.95 + i * 0.16;
    const z = -0.5;
    const sy = shelfYs[1] + 0.02;
    put(c, new THREE.LatheGeometry([[0, 0], [0.04, 0], [0.045, 0.05], [0.04, 0.13], [0.018, 0.17], [0.016, 0.24], [0, 0.24]].map(([a, h]) => new THREE.Vector2(a, h)), 8), xf([x, sy, z]));
    put(WOOD_L, cyl(0.02, 0.016, 0.03, 6), xf([x, sy + 0.255, z]));
    put(CREAM, plane(0.06, 0.07), xf([x, sy + 0.07, z + 0.043]));
    put(CORAL_D, ball(0.012, 5, 4), xf([x, sy + 0.07, z + 0.045]));
  });
  for (const [x, c] of [
    [0.52, [berry]],
    [0.85, [cherries]],
  ] as [number, FruitFn[]][]) {
    put(WICKER_B, cyl(0.12, 0.09, 0.09, 8), xf([x + 0.28, shelfYs[1] + 0.065, -0.5]));
    mound(xf([x + 0.28, shelfYs[1] + 0.11, -0.5]), [0, 0, 0], 0.09, 9, 0.025, c, 41 + x * 10);
  }

  // dried apple garland on the wall
  const garland = catmull([
    [-1.1, 2.18, -0.64],
    [-0.55, 2.0, -0.64],
    [0, 2.15, -0.64],
    [0.55, 2.0, -0.64],
    [1.1, 2.18, -0.64],
  ]);
  b.sweep(garland, 0.006, { sides: 4, color: STEM, ...S });
  for (let k = 0; k < 11; k++) {
    const p = garland.at((k + 0.5) / 11);
    const f: FruitFn = k % 3 === 0 ? orange(0.55) : k % 3 === 1 ? apple(RED, 0.6) : apple(GREEN_A, 0.6);
    f(xf([p.x, p.y - 0.04, p.z + 0.03]));
  }

  // -------- counter: cabinet, gingham cloth, banner
  b.part(new THREE.BoxGeometry(2.6, 0.82, 0.38), COUNTER, { at: [0, 0.41 + GY * 0.4, 0.7], ...S });
  b.part(new THREE.BoxGeometry(2.74, 0.075, 0.6), TOP_WOOD, { at: [0, 0.8375 + GY * 0.4, 0.7], ...S });
  put(WOOD_D, box(2.7, 0.06, 0.04), xf([0, 0.05, 0.9]));
  put("#ffffff", plane(1.15, 0.36), xf([0, 0.4, 0.8915]), I, { texture: BANNER });
  b.part(new THREE.BoxGeometry(2.66, 0.012, 0.52), gingham(CREAM, "#ffc9c2", CORAL, 0.055), { at: [0, CT - 0.006, 0.7], ...S });
  const cloth: OutlinePoint[] = [[-1.31, 0.01, "sharp"], [1.31, 0.01, "sharp"]];
  const nsc = 12;
  for (let k = nsc - 1; k >= 0; k--) {
    const x0 = -1.31 + (2.62 * (k + 1)) / nsc;
    const x1 = -1.31 + (2.62 * k) / nsc;
    cloth.push([x0, -0.1, "sharp"]);
    cloth.push([(x0 + x1) / 2, -0.17]);
    if (k === 0) cloth.push([x1, -0.1, "sharp"]);
  }
  b.extrude(cloth, {
    at: [0, CT - 0.004, 0.985],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    smoothing: 1,
    color: gingham(CREAM, "#ffc9c2", CORAL, 0.055),
    ...S,
  });
  // brass corner caps and a little footrail
  for (const sx of [1, -1]) put(BRASS, ball(0.03, 6, 4), xf([sx * 1.37, 0.84 + GY * 0.4, 0.98]));

  // -------- counter-top: tilted apple tray
  const trayW = xf([-0.84, CT, 0.68], [14, 3, 0]);
  put(WOOD_D, box(0.6, 0.1, 0.08), xf([-0.84, CT + 0.04, 0.5]));
  crate(trayW, {
    w: 0.7,
    h: 0.14,
    d: 0.46,
    pal: PAL_CORAL,
    r: 0.048,
    fill: [apple(RED), apple(RED), apple(RED, 1.05), apple(GREEN_A), apple(YELLOW_A)],
    seed: 71,
  });
  // price tag on a stick in the apples
  put("#ffffff", plane(0.07, 0.07), xf([-0.62, CT + 0.2, 0.84], [-16, -8, 8]), I, { texture: TAGS[0] });
  rodAB(WOOD_L, [-0.62, CT + 0.07, 0.83], [-0.62, CT + 0.17, 0.835], 0.004);
  // ladybug on an apple
  put(CORAL_D, ball(0.014, 6, 4), xf([-0.95, CT + 0.2, 0.74], [0, 0, 0], [1, 0.7, 1.2]));
  put(BLACK, ball(0.007, 4, 3), xf([-0.95, CT + 0.2, 0.756]));

  // -------- scale
  put(IRON, cyl(0.1, 0.12, 0.03, 8), xf([0.1, CT + 0.015, 0.7]));
  put(IRON, cyl(0.016, 0.022, 0.4, 6), xf([0.1, CT + 0.23, 0.7]));
  put(BRASS, ball(0.035, 7, 5), xf([...scalePivot], [0, 0, 0]), I, { bone: "scaleBeam" });
  put(IRON, box(0.58, 0.02, 0.018), xf([...scalePivot], [0, 0, -4]), I, { bone: "scaleBeam" });
  for (const s of [1, -1]) {
    const e = beamEnd(s);
    put(BRASS, ball(0.016, 5, 4), xf(e), I, { bone: "scaleBeam" });
    const bn = s > 0 ? "panL" : "panR";
    const pc: P3 = [e[0], e[1] - 0.2, e[2]];
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.6;
      rodAB(BRASS, e, [pc[0] + 0.1 * Math.cos(a), pc[1] + 0.01, pc[2] + 0.1 * Math.sin(a)], 0.0035, I, { bone: bn }, 3);
    }
    put(
      BRASS,
      new THREE.LatheGeometry([[0, 0], [0.09, 0.008], [0.118, 0.04], [0.11, 0.043], [0.085, 0.022], [0, 0.016]].map(([a, h]) => new THREE.Vector2(a, h)), 10),
      xf([pc[0], pc[1] - 0.01, pc[2]]),
      I,
      { bone: bn },
    );
    if (s > 0) {
      curBone = bn;
      pear(xf([pc[0], pc[1] + 0.045, pc[2]], [0, 20, 0]));
      curBone = "base";
    }
    else {
      for (const [dx, hh, rr] of [
        [-0.03, 0.035, 0.036],
        [0.04, 0.03, 0.03],
      ] as P3[]) {
        put(IRON, cyl(rr * 0.8, rr, hh, 8), xf([pc[0] + dx, pc[1] + 0.006 + hh / 2, pc[2]]), I, { bone: bn });
        put(IRON_L, ball(0.01, 4, 3), xf([pc[0] + dx, pc[1] + 0.012 + hh, pc[2]]), I, { bone: bn });
      }
    }
  }
  // pear on the left pan was placed on the base bone: re-seat it on its pan below
  // -------- counter-top: strawberries, cutting board, melon slices, pineapples
  put(WICKER_B, cyl(0.15, 0.115, 0.1, 9), xf([0.52, CT + 0.05, 0.7]));
  put(WICKER_A, cyl(0.155, 0.15, 0.02, 9), xf([0.52, CT + 0.105, 0.7]));
  mound(xf([0.52, CT + 0.105, 0.7]), [0, 0.02, 0], 0.12, 22, 0.05, [berry], 51);
  for (const s of [1, -1]) rodAB(WICKER_B, [0.52 + s * 0.15, CT + 0.1, 0.7], [0.52, CT + 0.28, 0.7], 0.008, I, {}, 4);
  // cutting board with apple halves and a knife
  put(WOOD_L, box(0.34, 0.022, 0.24), xf([0.95, CT + 0.011, 0.62], [0, 12, 0]));
  put(BRASS, ball(0.014, 5, 4), xf([0.95 - 0.13, CT + 0.022, 0.62 - 0.1], [0, 0, 0], [1, 0.4, 1]));
  for (const [dx, dz] of [
    [-0.06, 0.02],
    [0.04, 0.0],
  ] as [number, number][]) {
    const m = xf([0.95 + dx, CT + 0.022, 0.62 + dz], [0, 12, 0]);
    put(RED, ball(0.046, 8, 5), xf([0, 0.03, 0], [0, 0, 0], [1, 0.8, 1]), m);
    put(CREAM, cyl(0.04, 0.04, 0.004, 8), xf([0, 0.043, 0.0], [-90, 0, 0]), m);
    put(STEM, ball(0.004, 3, 3), xf([0.006, 0.047, 0.003]), m);
  }
  put(IRON_L, box(0.14, 0.004, 0.026), xf([0.88, CT + 0.026, 0.72], [0, 28, 0]));
  put(WOOD_D, box(0.07, 0.016, 0.02), xf([0.97, CT + 0.026, 0.775], [0, 28, 0]));
  // pineapples at the back corners of the counter
  for (const [x, ry] of [
    [-1.15, 20],
    [1.17, -15],
  ] as [number, number][]) {
    b.part(new THREE.SphereGeometry(0.08, 10, 8), PINEAPPLE, { at: [x, CT + 0.1, 0.52], rotation: [0, ry, 0], scale: [1, 1.3, 1], ...S });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * 360 + ry;
      put(k % 2 ? LEAF : LEAF_D, cone(0.022, 0.15, 4), xf([x, CT + 0.27, 0.52], [18 * Math.cos(a * DEG) * 1.4, 0, 18 * Math.sin(a * DEG) * 1.4 - 0]));
    }
    put(LEAF, cone(0.02, 0.14, 4), xf([x, CT + 0.3, 0.52]));
  }
  // melon pair at the middle back
  for (const [x, z, r, ry] of [
    [0.28, 0.5, 0.11, 40],
    [-0.4, 0.5, 0.1, -25],
  ] as number[][])
    b.part(new THREE.SphereGeometry(r, 12, 9), MELON, { at: [x, CT + r * 0.9, z], rotation: [20, ry, 10], scale: [1, 0.92, 1.12], ...S });
  // watermelon slices on a plate
  put(CREAM, cyl(0.15, 0.1, 0.02, 10), xf([1.0, CT + 0.01, 0.9]));
  put(TEAL, new THREE.TorusGeometry(0.14, 0.006, 3, 10), xf([1.0, CT + 0.02, 0.9], [90, 0, 0]));
  const sliceOutline: OutlinePoint[] = [];
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI + (k * Math.PI) / 12;
    const px = SLICE_R * Math.cos(a);
    const py = SLICE_R * Math.sin(a);
    sliceOutline.push(k === 0 || k === 12 ? [px, py, "sharp"] : [px, py]);
  }
  for (const [dx, dz, ry] of [
    [-0.02, 0.0, 10],
    [0.0, 0.05, -8],
  ] as number[][]) {
    b.extrude(sliceOutline, {
      at: [1.0 + dx, CT + 0.04 + dz * 0.2, 0.88 + dz],
      x: [Math.cos(ry * DEG), 0, -Math.sin(ry * DEG)],
      y: [-Math.sin(ry * DEG) * 0 + 0, 0, -1],
      thickness: 0.035,
      bevel: 0.008,
      color: SLICE,
      ...S,
    });
  }
  // honey dipper jar + coin dish near the scale
  put(BRASS, cyl(0.07, 0.055, 0.035, 8), xf([-0.45, CT + 0.0175, 0.82]));
  for (let k = 0; k < 5; k++) put(BRASS, cyl(0.022, 0.022, 0.006, 8), xf([-0.45 + (k % 2) * 0.018 - 0.01, CT + 0.04 + k * 0.006, 0.82 + (k % 3) * 0.01]));

  // -------- hanging things under the front beam
  const beamY = frontTop(0.62) - 0.005;
  const hang = (x: number, drop: number) => {
    put(BRASS, new THREE.TorusGeometry(0.014, 0.0035, 3, 7), xf([x, beamY - 0.045, 0.62], [0, 90, 0]));
    rodAB(BRASS, [x, beamY - 0.02, 0.62], [x, beamY - 0.03 - drop, 0.62], 0.004, I, {}, 3);
  };
  for (const [x, c] of [
    [-0.95, "L"],
    [0.95, "R"],
  ] as [number, string][]) {
    hang(x, 0.2);
    const top: P3 = [x, beamY - 0.24, 0.62];
    for (let k = 0; k < 5; k++) {
      const f = (k - 2) / 2;
      const lean = f * 0.045;
      b.sweep(
        catmull([
          [top[0] + lean * 0.3, top[1], top[2]],
          [top[0] + lean, top[1] - 0.09, top[2] + 0.005],
          [top[0] + lean * 1.4, top[1] - 0.2, top[2] + 0.03],
          [top[0] + lean * 1.5, top[1] - 0.29, top[2] + 0.1],
        ]),
        [0.027, 0.018],
        { section: { ngon: 5 }, color: BANANA, bands: [[0.93, BANANA], [1, STEM]], caps: "flat", ...S },
      );
    }
    put(STEM, cyl(0.011, 0.013, 0.07, 5), xf([top[0], top[1] + 0.01, top[2]], [0, 0, 90]));
    void c;
  }
  hang(-0.3, 0.2);
  grapeCluster(GRAPE)(xf([-0.3, beamY - 0.3, 0.62]));
  hang(0.4, 0.2);
  grapeCluster(GRAPE_G)(xf([0.4, beamY - 0.3, 0.62]));

  // -------- string lights under the awning
  const lightPath = catmull([
    [-1.3, 2.12, 0.95],
    [-0.65, 1.96, 0.95],
    [0, 2.04, 0.95],
    [0.65, 1.96, 0.95],
    [1.3, 2.12, 0.95],
  ]);
  b.sweep(lightPath, 0.004, { sides: 4, color: BLACK, ...S });
  for (let k = 0; k < 9; k++) {
    const p = lightPath.at((k + 0.5) / 9);
    put(BULB, ball(0.026, 6, 4), xf([p.x, p.y - 0.035, p.z]), I, { glow: 1.4 });
    put(IRON, cyl(0.011, 0.011, 0.016, 5), xf([p.x, p.y - 0.007, p.z]));
  }

  // -------- hanging apple sign on a scrolled iron arm
  b.rod([-1.2, 2.0, 0.64], [-2.2, 2.0, 0.64], 0.016, { sides: 6, color: LAMP, ...S });
  rodAB(LAMP, [-1.2, 1.78, 0.64], [-1.8, 1.99, 0.64], 0.012, I, {}, 5);
  b.sweep(
    catmull([
      [-2.2, 2.0, 0.64],
      [-2.26, 2.06, 0.64],
      [-2.22, 2.13, 0.64],
      [-2.14, 2.1, 0.64],
      [-2.16, 2.04, 0.64],
    ]),
    0.011,
    { sides: 5, color: LAMP, ...S },
  );
  put(BRASS, ball(0.03, 6, 4), xf([-2.2, 2.0, 0.64]));
  const SIGN_Y = 1.58;
  const apple_o: OutlinePoint[] = [];
  for (let k = 0; k < 28; k++) {
    const t = (k / 28) * Math.PI * 2;
    const tw = Math.atan2(Math.sin(t), Math.cos(t));
    let y = 0.215 * Math.cos(t);
    y -= 0.075 * Math.exp(-((tw / 0.28) ** 2));
    y += 0.02 * Math.exp(-(((Math.abs(tw) - Math.PI) / 0.3) ** 2));
    apple_o.push([0.26 * Math.sin(t), y]);
  }
  b.extrude(apple_o, {
    at: [-1.85, SIGN_Y, 0.64],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.055,
    bevel: 0.014,
    color: APPLE_BIG,
    bone: signHinge,
  });
  b.extrude(
    [[0, 0, "sharp"], [0.1, 0.06], [0.2, 0.05, "sharp"], [0.12, -0.03]],
    { at: [-1.85 + 0.01, SIGN_Y + 0.19, 0.64], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, smoothing: 1, color: LEAF, bone: signHinge },
  );
  put(STEM, cyl(0.011, 0.014, 0.07, 5), xf([-1.85, SIGN_Y + 0.2, 0.64], [0, 0, 12]), I, { bone: "signHinge" });
  put("#ffffff", plane(0.38, 0.209), xf([-1.85, SIGN_Y - 0.02, 0.64 + 0.0285]), I, { bone: "signHinge", texture: SIGN_FACE });
  for (const s of [1, -1]) {
    rodAB(BRASS, [-1.85 + s * 0.11, 2.0, 0.64], [-1.85 + s * 0.11, SIGN_Y + 0.18, 0.64], 0.005, I, { bone: "signHinge" }, 3);
    put(BRASS, ball(0.012, 4, 3), xf([-1.85 + s * 0.11, SIGN_Y + 0.18, 0.64]), I, { bone: "signHinge" });
  }

  // -------- crate stack on the right
  crate(xf([1.78, GY, 0.2], [0, 4, 0]), { pal: PAL_NAT, label: "apples", fill: [apple(GREEN_A), apple(GREEN_A, 1.05), apple(RED, 0.9)], seed: 8 });
  crate(xf([2.42, GY, 0.3], [0, -7, 0]), { pal: PAL_TEAL, label: "oranges", fill: [orange(), orange(1.05), orange(0.95)], seed: 9 });
  crate(xf([1.8, GY + 0.34, 0.18], [0, -9, 0]), { pal: PAL_CORAL, label: "plums", fill: [plum], r: 0.037, seed: 10 });
  crate(xf([2.4, GY + 0.34, 0.28], [0, 0, 0]), {
    pal: PAL_NAT,
    label: "lemons",
    fill: [lemon, lemonLeafy],
    r: 0.05,
    seed: 12,
    lidBone: "lidHinge",
  });
  crate(xf([1.75, GY + 0.68, 0.2], [0, 14, 0]), { w: 0.5, h: 0.28, d: 0.36, pal: PAL_TEAL, label: "pears", closed: true, seed: 13 });
  // sleeping cat on the top crate
  const catM = xf([1.75, GY + 0.68 + 0.28 + 0.022, 0.2], [0, 14 + 30, 0]);
  put(CAT, ball(0.13, 9, 6), xf([0, 0.085, 0], [0, 0, 0], [1.25, 0.8, 1]), catM);
  put(CAT_L, ball(0.1, 7, 5), xf([0.0, 0.05, 0.075], [0, 0, 0], [1.25, 0.5, 0.7]), catM);
  put(CAT, ball(0.085, 8, 6), xf([0.17, 0.09, 0.06], [0, 0, 0], [1, 0.9, 1]), catM);
  put(CAT_D, cone(0.032, 0.06, 4), xf([0.2, 0.17, 0.06], [0, 0, -12]), catM);
  put(CAT_D, cone(0.032, 0.06, 4), xf([0.15, 0.17, 0.075], [0, 0, 12]), catM);
  put(PINK, cone(0.016, 0.034, 4), xf([0.2, 0.17, 0.062], [0, 0, -12]), catM);
  put(PINK, cone(0.016, 0.034, 4), xf([0.15, 0.17, 0.077], [0, 0, 12]), catM);
  put(CAT_L, ball(0.04, 6, 4), xf([0.2, 0.06, 0.1], [0, 0, 0], [1, 0.7, 1.1]), catM);
  put(PINK, ball(0.01, 4, 3), xf([0.248, 0.082, 0.085]), catM);
  for (const dz of [0.112, 0.04]) put(BLACK, box(0.003, 0.003, 0.018), xf([0.245, 0.1, dz]), catM);
  put(BLACK, cyl(0.001, 0.001, 0.001, 3), xf([0.1, 0.1, 0.1]), catM);
  for (const k of [0, 1, 2]) put(CAT_D, box(0.03, 0.004, 0.08), xf([-0.04 + k * 0.05, 0.16 - Math.abs(k - 1) * 0.015, -0.0], [0, 0, 0]), catM);
  b.sweep(
    catmull([
      [-0.14, 0.05, -0.02],
      [-0.2, 0.05, -0.1],
      [-0.1, 0.05, -0.17],
      [0.06, 0.05, -0.15],
    ].map((p) => world(catM, p as P3))),
    [0.032, 0.022],
    { sides: 6, color: CAT, bands: [[0.8, CAT], [1, CAT_L]], caps: "round", ...S },
  );
  put(CAT_L, ball(0.032, 5, 4), xf([0.25, 0.04, 0.0]), catM);
  // snail climbing the orange crate
  const snM = xf([2.42 + 0.31, GY + 0.2, 0.3 + 0.12], [0, 70, 0]);
  put(SNAIL, new THREE.CapsuleGeometry(0.014, 0.07, 3, 6), xf([0, 0, 0], [0, 0, 90]), snM);
  put(SNAIL, new THREE.CapsuleGeometry(0.008, 0.02, 2, 5), xf([0.05, 0.02, 0], [0, 0, 20]), snM);
  put(ORANGE, ball(0.03, 7, 5), xf([-0.01, 0.03, 0]), snM);
  put(CORAL_D, new THREE.TorusGeometry(0.018, 0.005, 3, 8), xf([-0.01, 0.03, 0.026]), snM);
  for (const dz of [0.006, -0.006]) rodAB(SNAIL, [0.05, 0.03, dz], [0.062, 0.058, dz * 1.8], 0.002, snM, {}, 3);

  // -------- left side: barrel of apples, chalkboard
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.285, 0.2],
      [0.3, 0.36],
      [0.285, 0.52],
      [0.255, 0.7],
      [0.235, 0.7],
      [0.235, 0.62],
      [0, 0.62],
    ],
    { at: [-1.95, GY, 0.2], segments: 16, color: BARREL, ...S },
  );
  mound(xf([-1.95, GY + 0.62, 0.2]), [0, 0, 0], 0.2, 14, 0.07, [apple(RED), apple(YELLOW_A), apple(RED, 1.05)], 77);
  put(IRON, new THREE.TorusGeometry(0.236, 0.008, 3, 12), xf([-1.95, GY + 0.7, 0.2], [90, 0, 0]));
  // chalkboard on an A-frame
  const cbM = xf([-2.35, GY, 1.3], [0, 18, 0]);
  const tiltM = at(cbM, [0, 0.46, 0], [-11, 0, 0]);
  put(WOOD_D, box(0.66, 0.9, 0.05), xf([0, 0, 0]), tiltM);
  put(WOOD_XD, box(0.7, 0.05, 0.06), xf([0, 0.43, 0]), tiltM);
  put(WOOD_XD, box(0.7, 0.05, 0.06), xf([0, -0.43, 0]), tiltM);
  put("#ffffff", plane(0.54, 0.763), xf([0, 0.0, 0.0275]), tiltM, { texture: CHALK });
  put(WOOD_L, box(0.6, 0.03, 0.08), xf([0, -0.4, 0.06]), tiltM);
  put(CREAM, cyl(0.007, 0.007, 0.05, 5), xf([-0.15, -0.375, 0.08], [0, 0, 90]), tiltM);
  rodAB(WOOD_D, world(tiltM, [-0.28, 0.4, -0.03]), world(cbM, [-0.3, 0, -0.55]), 0.022, I, {}, 5);
  rodAB(WOOD_D, world(tiltM, [0.28, 0.4, -0.03]), world(cbM, [0.3, 0, -0.55]), 0.022, I, {}, 5);
  put(BRASS, ball(0.022, 5, 4), xf(world(tiltM, [0, 0.46, 0])));

  // -------- baskets on the cobbles
  const basket = (x: number, z: number, r: number, fns: FruitFn[], n: number, seed: number) => {
    b.lathe(
      [
        [0, 0],
        [r * 0.8, 0],
        [r, r * 0.9],
        [r * 1.06, r * 1.05],
        [r * 0.98, r * 1.05],
        [r * 0.92, r * 0.95],
        [0, r * 0.95],
      ],
      { at: [x, GY, z], segments: 12, color: WEAVE, ...S },
    );
    put(WICKER_B, new THREE.TorusGeometry(r * 1.02, 0.015, 3, 12), xf([x, GY + r * 1.05, z], [90, 0, 0]));
    mound(xf([x, GY + r * 0.95, z]), [0, 0, 0], r * 0.92, n, r * 0.45, fns, seed);
    put(WICKER_B, new THREE.TorusGeometry(r * 0.95, 0.016, 3, 12, Math.PI), xf([x, GY + r * 1.0, z], [0, 90, 0]));
  };
  basket(-0.55, 1.5, 0.22, [orange(), orange(0.95)], 20, 31);
  basket(0.25, 1.65, 0.17, [peach, peach, apple(YELLOW_A, 0.9)], 12, 32);
  for (const [x, z, n] of [
    [-0.4, 1.66, 1],
    [0.4, 1.78, 2],
  ] as P3[]) {
    rodAB(WOOD_L, [x, GY + 0.2, z], [x, GY + 0.36, z], 0.004, I, {}, 3);
    put("#ffffff", plane(0.08, 0.08), xf([x, GY + 0.4, z + 0.006], [-10, 0, n * 6]), I, { texture: TAGS[n] });
  }
  // crate of pears on the cobbles + sack
  crate(xf([-1.35, GY, 1.45], [0, 12, 0]), { pal: PAL_NAT, label: "pears", fill: [pear], r: 0.05, seed: 14 });
  put(SACK, new THREE.SphereGeometry(0.2, 8, 6), xf([-1.0, GY + 0.16, 1.1], [0, 20, 0], [1, 1.1, 0.85]));
  put(SACK, cyl(0.07, 0.1, 0.12, 6), xf([-1.0, GY + 0.36, 1.1], [0, 20, 0]));
  put(STEM, new THREE.TorusGeometry(0.075, 0.008, 3, 8), xf([-1.0, GY + 0.3, 1.1], [90, 0, 0]));
  put(CORAL_D, plane(0.1, 0.07), xf([-1.0, GY + 0.16, 1.1 + 0.18], [0, 20, 0]));
  // fallen fruit on the cobbles
  apple(RED)(xf([0.7, GY + 0.045, 1.95], [0, 40, 70]));
  orange()(xf([-0.2, GY + 0.05, 2.0]));
  lemon(xf([0.3, GY + 0.04, 2.05], [0, 30, 0]));
  apple(GREEN_A)(xf([2.1, GY + 0.045, 1.3], [10, 0, 80]));

  // -------- wheelbarrow of watermelons
  const wb = (c: string, geo: THREE.BufferGeometry, p: P3, r: P3 = [0, 0, 0]) => put(c, geo, xf(p, r), wbm);
  const trayShape: OutlinePoint[] = [
    [-0.4, 0, "sharp"],
    [0.4, 0, "sharp"],
    [0.5, 0.26, "sharp"],
    [-0.46, 0.26, "sharp"],
  ];
  for (const s of [1, -1]) {
    b.extrude(trayShape, {
      at: world(wbm, [s * 0.27, 0.34, -0.02]),
      x: [Math.sin(-32 * DEG), 0, Math.cos(-32 * DEG)],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      color: s > 0 ? TEAL : TEAL_L,
      ...S,
    });
  }
  wb(TEAL_D, box(0.54, 0.03, 0.82), [0, 0.35, -0.02]);
  wb(CORAL, box(0.56, 0.2, 0.03), [0, 0.45, -0.46], [-8, 0, 0]);
  wb(CORAL, box(0.56, 0.24, 0.03), [0, 0.47, 0.5], [18, 0, 0]);
  wb(WOOD_D, box(0.5, 0.02, 0.16), [0, 0.32, 0.1]);
  for (const s of [1, -1]) {
    wb(WOOD_D, box(0.045, 0.045, 1.5), [s * 0.2, 0.33, -0.05], [-3, 0, 0]);
    wb(WOOD_L, new THREE.CapsuleGeometry(0.03, 0.14, 3, 6), [s * 0.2, 0.42, -0.86], [90, 0, 0]);
    wb(WOOD_D, box(0.045, 0.3, 0.045), [s * 0.2, 0.17, -0.5]);
    wb(WOOD_XD, cyl(0.06, 0.06, 0.03, 6), [s * 0.2, 0.02, -0.5]);
    wb(WOOD_D, box(0.035, 0.035, 0.35), [s * 0.195, 0.23, 0.47], [-30, 0, 0]);
    wb(IRON, ball(0.012, 4, 3), [s * 0.2, 0.352, 0.15]);
  }
  put(IRON, cyl(0.012, 0.012, 0.44, 6), xf([0, 0.19, 0.52], [0, 0, 90]), wbm);
  // wheel parts ride the wheel joint
  const wheelBone = { bone: "wheelHinge" };
  put(WOOD_XD, new THREE.TorusGeometry(0.17, 0.034, 5, 14), xf([0, 0.19, 0.52], [0, 90, 0]), wbm, wheelBone);
  put(BRASS, cyl(0.045, 0.045, 0.06, 8), xf([0, 0.19, 0.52], [0, 0, 90]), wbm, wheelBone);
  for (let k = 0; k < 6; k++)
    put(WOOD_L, box(0.016, 0.3, 0.014), xf([0, 0.19, 0.52], [k * 30, 0, 0]), wbm, wheelBone);
  // melons
  const melonSpots: [number, number, number, number][] = [
    [-0.1, 0.55, -0.22, 0.15],
    [0.14, 0.58, -0.02, 0.16],
    [-0.12, 0.54, 0.22, 0.14],
    [0.05, 0.74, -0.15, 0.13],
    [0.0, 0.66, 0.34, 0.12],
  ];
  melonSpots.forEach(([x, y, z, r], i) => {
    const p = world(wbm, [x, y, z]);
    b.part(new THREE.SphereGeometry(r, 12, 9), MELON, { at: p, rotation: [i * 37, i * 71 - 32, i * 19], scale: [1, 0.93, 1.12], ...S });
    put(STEM, cyl(0.006, 0.01, 0.025, 4), xf(world(wbm, [x, y + r * 0.9, z])));
  });

  // -------- potted sunflower by the front-left post
  const flowerM = xf([-1.58, GY, 0.95]);
  put("#c7603a", cyl(0.13, 0.09, 0.2, 8), xf([0, 0.1, 0]), flowerM);
  put("#e0794a", cyl(0.14, 0.14, 0.04, 8), xf([0, 0.2, 0]), flowerM);
  put(DARK_FILL, cyl(0.115, 0.115, 0.02, 8), xf([0, 0.215, 0]), flowerM);
  b.sweep(
    catmull([
      [-1.58, GY + 0.2, 0.95],
      [-1.57, GY + 0.6, 0.95],
      [-1.55, GY + 0.95, 0.96],
      [-1.53, GY + 1.2, 0.99],
    ]),
    0.017,
    { sides: 5, color: LEAF_D, ...S },
  );
  const fh = xf([-1.53, GY + 1.22, 1.01], [75, 0, 0]);
  for (let k = 0; k < 14; k++)
    put(k % 2 ? BANANA : BUTTER, ball(0.045, 5, 3), xf([0.1 * Math.cos((k / 14) * Math.PI * 2), 0, 0.1 * Math.sin((k / 14) * Math.PI * 2)], [0, -(k / 14) * 360, 0], [1.6, 0.25, 0.7]), fh);
  put(WOOD_XD, cyl(0.075, 0.075, 0.03, 9), xf([0, 0.01, 0]), fh);
  for (const [x, y, r] of [
    [-1.64, GY + 0.45, 30],
    [-1.5, GY + 0.7, -30],
  ])
    put(LEAF, ball(0.07, 5, 3), xf([x, y, 0.95], [0, 0, r], [1.6, 0.18, 0.9]));

  // -------- lamppost with lantern and bunting
  const LPX = -2.85;
  const LPZ = 0.5;
  put(STONE_SIDE, cyl(0.15, 0.19, 0.18, 8), xf([LPX, GY + 0.09, LPZ]));
  const pole = b.sweep(
    catmull([
      [LPX, GY, LPZ],
      [LPX, 1.4, LPZ],
      [LPX, 2.4, LPZ],
      [LPX + 0.08, 2.58, LPZ],
      [LPX + 0.3, 2.62, LPZ],
      [LPX + 0.42, 2.52, LPZ],
    ]),
    [0.05, 0.026],
    { sides: 6, color: LAMP, ...S },
  );
  void pole;
  put(BRASS, cyl(0.06, 0.06, 0.03, 6), xf([LPX, 0.5, LPZ]));
  put(BRASS, cyl(0.055, 0.055, 0.03, 6), xf([LPX, 1.6, LPZ]));
  const lx = LPX + 0.42;
  put(LAMP, cone(0.14, 0.1, 6), xf([lx, 2.19, LPZ]));
  put(BRASS, ball(0.02, 5, 4), xf([lx, 2.25, LPZ]));
  put(LAMP, cyl(0.1, 0.07, 0.03, 6), xf([lx, 1.97, LPZ]));
  put(BULB, new THREE.CylinderGeometry(0.11, 0.075, 0.16, 6), xf([lx, 2.08, LPZ]), I, { glow: 1.5 });
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    rodAB(LAMP, [lx + 0.112 * Math.cos(a), 2.16, LPZ + 0.112 * Math.sin(a)], [lx + 0.076 * Math.cos(a), 2.0, LPZ + 0.076 * Math.sin(a)], 0.006, I, {}, 3);
  }
  // bunting: lamppost to the awning's front-left corner, and awning right corner to a bamboo pole
  const bunt = (a: P3, c: P3, sag: number, seed: number, n: number) => {
    const m: P3 = [(a[0] + c[0]) / 2, Math.min(a[1], c[1]) - sag, (a[2] + c[2]) / 2];
    const path = catmull([a, [(a[0] + m[0]) / 2, (a[1] + m[1]) / 2 - sag * 0.1, (a[2] + m[2]) / 2], m, [(m[0] + c[0]) / 2, (m[1] + c[1]) / 2 - sag * 0.1, (m[2] + c[2]) / 2], c]);
    b.sweep(path, 0.0045, { sides: 4, color: STEM, ...S });
    const Rb = rng(seed);
    const cols = [CORAL, BUTTER, TEAL, CREAM, GREEN_A, PINK];
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const p = path.at(t);
      const tg = path.tangentAt(t);
      const ry = -Math.atan2(tg.z, tg.x) / DEG;
      const tri = new THREE.Shape();
      tri.moveTo(-0.07, 0);
      tri.lineTo(0.07, 0);
      tri.lineTo(0, -0.17);
      put(cols[(k + Math.floor(Rb() * 2)) % cols.length], new THREE.ExtrudeGeometry(tri, { depth: 0.008, bevelEnabled: false }), xf([p.x, p.y - 0.004, p.z - 0.004], [0, ry, 0]));
    }
  };
  bunt([lx + 0.02, 2.5, LPZ], [-AW, awnY(AZ1) - 0.02, AZ1], 0.28, 4, 11);
  // bamboo pole at the right with a pennant
  const BPX = 3.0;
  const BPZ = 0.9;
  b.rod([BPX, GY, BPZ], [BPX + 0.04, 2.5, BPZ], [0.04, 0.026], { sides: 6, color: "#d8c46a", ...S });
  for (const y of [0.5, 1.0, 1.5, 2.0]) put("#b8a24a", cyl(0.044, 0.044, 0.022, 6), xf([BPX + 0.04 * (y / 2.5), y, BPZ]));
  put(CORAL, ball(0.05, 6, 4), xf([BPX + 0.04, 2.55, BPZ]));
  const pen = new THREE.Shape();
  pen.moveTo(0, 0);
  pen.lineTo(0.36, -0.07);
  pen.lineTo(0.3, -0.12);
  pen.lineTo(0.36, -0.17);
  pen.lineTo(0, -0.2);
  put(CORAL, new THREE.ExtrudeGeometry(pen, { depth: 0.012, bevelEnabled: false }), xf([BPX + 0.035, 2.45, BPZ - 0.006], [0, 180, 0]));
  put(BUTTER, ball(0.03, 5, 4), xf([BPX - 0.15, 2.4, BPZ + 0.0]));
  bunt([AW, awnY(AZ1) - 0.02, AZ1], [BPX + 0.03, 2.35, BPZ], 0.3, 9, 13);

  // -------- on the roof: apple topper, sparrow, patches
  const topP: P3 = [0, awnY(-0.5) + 0.02, -0.5];
  put(WOOD_D, box(0.3, 0.05, 0.22), xf([0, topP[1] + 0.02, topP[2]]));
  b.part(new THREE.SphereGeometry(0.17, 12, 9), APPLE_BIG, { at: [0, topP[1] + 0.2, topP[2]], scale: [1, 0.9, 1], ...S });
  put(STEM, cyl(0.014, 0.018, 0.1, 5), xf([0.0, topP[1] + 0.38, topP[2]], [0, 0, -12]));
  b.extrude(
    [[0, 0, "sharp"], [0.1, 0.07], [0.22, 0.05, "sharp"], [0.12, -0.04]],
    { at: [0.01, topP[1] + 0.4, topP[2]], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, smoothing: 1, color: LEAF, ...S },
  );
  // worm popping out of the apple wearing a tiny cap
  b.sweep(
    catmull([
      [-0.1, topP[1] + 0.18, topP[2] + 0.15],
      [-0.12, topP[1] + 0.27, topP[2] + 0.19],
      [-0.1, topP[1] + 0.34, topP[2] + 0.2],
      [-0.06, topP[1] + 0.37, topP[2] + 0.2],
    ]),
    [0.032, 0.026],
    { sides: 6, color: GREEN_A, ...S },
  );
  put(GREEN_A, ball(0.032, 6, 5), xf([-0.06, topP[1] + 0.38, topP[2] + 0.2]));
  put(WHITE, ball(0.011, 4, 3), xf([-0.045, topP[1] + 0.39, topP[2] + 0.228]));
  put(WHITE, ball(0.011, 4, 3), xf([-0.075, topP[1] + 0.39, topP[2] + 0.228]));
  put(BLACK, ball(0.006, 4, 3), xf([-0.045, topP[1] + 0.39, topP[2] + 0.236]));
  put(BLACK, ball(0.006, 4, 3), xf([-0.075, topP[1] + 0.39, topP[2] + 0.236]));
  put(CORAL, cone(0.026, 0.05, 6), xf([-0.06, topP[1] + 0.42, topP[2] + 0.2]));
  put(BUTTER, ball(0.009, 4, 3), xf([-0.06, topP[1] + 0.45, topP[2] + 0.2]));
  // canvas patches
  for (const [x, z, ry] of [
    [-0.7, 0.2, 8],
    [0.95, -0.2, -12],
    [0.5, 0.65, 4],
  ] as P3[]) {
    const n = awnNormal(z);
    b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
      at: [x, awnY(z) + 0.0175, z],
      dir: n,
      axis: "z",
      up: [Math.sin(ry * DEG), 0.2, Math.cos(ry * DEG)],
      texture: PATCH,
      ...S,
    });
  }
  // sparrow on the front edge of the roof
  const spZ = 0.78;
  const spM = xf([0.8, awnY(spZ) + 0.0, spZ], [-6, 40, 0]);
  put(BIRD, ball(0.07, 8, 6), xf([0, 0.07, 0], [-18, 0, 0], [1, 0.95, 1.25]), spM);
  put(BIRD_L, ball(0.055, 7, 5), xf([0, 0.055, 0.04], [-18, 0, 0], [1, 0.85, 1.1]), spM);
  put(BIRD, ball(0.05, 7, 5), xf([0, 0.135, 0.065]), spM);
  put(BIRD_L, ball(0.04, 6, 4), xf([0, 0.12, 0.085]), spM);
  put(ORANGE, cone(0.014, 0.035, 4), xf([0, 0.135, 0.12], [90, 0, 0]), spM);
  for (const s of [1, -1]) {
    put(BLACK, ball(0.008, 4, 3), xf([s * 0.032, 0.148, 0.095]), spM);
    put(WHITE, ball(0.003, 3, 3), xf([s * 0.034, 0.151, 0.102]), spM);
    put(CAT_D, ball(0.05, 6, 4), xf([s * 0.06, 0.08, -0.01], [0, 0, s * -15], [0.4, 0.8, 1.4]), spM);
    rodAB(ORANGE, [s * 0.02, 0.02, 0.01], [s * 0.02, 0.0, 0.015], 0.003, spM, {}, 3);
  }
  put(BIRD, box(0.045, 0.012, 0.11), xf([0, 0.07, -0.13], [18, 0, 0]), spM);
  // bee over the strawberries
  const beeM = xf([0.62, CT + 0.34, 0.9], [0, 30, 0]);
  put(BUTTER, ball(0.026, 6, 4), xf([0, 0, 0], [0, 0, 0], [0.8, 0.8, 1.25]), beeM);
  put(BLACK, ball(0.019, 5, 3), xf([0, 0, -0.012], [0, 0, 0], [1.1, 1.1, 0.3]), beeM);
  put(BLACK, ball(0.017, 5, 3), xf([0, 0, 0.016], [0, 0, 0], [1.1, 1.1, 0.3]), beeM);
  put(WHITE, ball(0.02, 5, 3), xf([0.02, 0.022, 0], [0, 0, -20], [1, 0.2, 0.6]), beeM);
  put(WHITE, ball(0.02, 5, 3), xf([-0.02, 0.022, 0], [0, 0, 20], [1, 0.2, 0.6]), beeM);
  put(BLACK, ball(0.006, 3, 3), xf([0.01, 0.007, 0.035]), beeM);
  put(BLACK, ball(0.006, 3, 3), xf([-0.01, 0.007, 0.035]), beeM);

  // -------- back of the stall: emblem, ladder, broom, sacks, empty crates, straw hat
  put("#ffffff", plane(0.62, 0.62), xf([0, 1.28, -0.7125], [0, 180, 0]), I, { texture: EMBLEM });
  for (const sx of [1, -1]) {
    rodAB(WOOD_D, [0.6 + sx * 0.17, GY, -1.08], [0.6 + sx * 0.17, 2.0, -0.74], 0.022, I, {}, 5);
  }
  for (let k = 0; k < 8; k++) {
    const y = GY + 0.18 + k * 0.23;
    const z = -1.08 + ((y - GY) / (2.0 - GY)) * 0.34;
    rodAB(WOOD_L, [0.6 - 0.17, y, z], [0.6 + 0.17, y, z], 0.014, I, {}, 5);
  }
  // broom leaning on the wall
  rodAB(WOOD_D, [-0.7, GY, -1.03], [-0.62, 1.55, -0.74], 0.016, I, {}, 5);
  put(STRAW_C, new THREE.CylinderGeometry(0.03, 0.075, 0.28, 7), xf([-0.7, GY + 0.14, -1.03], [-14, 0, 4]));
  put(CORAL, new THREE.CylinderGeometry(0.034, 0.034, 0.03, 7), xf([-0.69, GY + 0.3, -1.02], [-14, 0, 4]));
  // sacks of fruit
  for (const [x, z, ry] of [
    [1.05, -1.0, 15],
    [1.28, -0.88, -10],
  ] as P3[]) {
    const m = xf([x, GY, z], [0, ry, 0]);
    put(SACK, new THREE.SphereGeometry(0.2, 8, 6), xf([0, 0.17, 0], [0, 0, 0], [1, 1.05, 0.85]), m);
    put(SACK, cyl(0.08, 0.11, 0.12, 6), xf([0, 0.38, 0]), m);
    put(CORAL_D, new THREE.TorusGeometry(0.085, 0.009, 3, 8), xf([0, 0.32, 0], [90, 0, 0]), m);
    put(CORAL_D, plane(0.1, 0.07), xf([0, 0.17, 0.18]), m);
    orange(0.9)(at(m, [0.0, 0.44, 0.0]));
    apple(RED)(at(m, [0.04, 0.45, -0.03]));
  }
  // empty crates stacked behind the left side
  crate(xf([-1.3, GY, -1.05], [0, 8, 0]), { pal: PAL_TEAL, seed: 22 });
  crate(xf([-1.25, GY + 0.34, -1.02], [0, -12, 0]), { pal: PAL_NAT, seed: 23 });
  crate(xf([-0.7, GY, -1.28], [0, 25, 0]), { w: 0.5, h: 0.28, d: 0.36, pal: PAL_CORAL, seed: 24 });
  // hat on a peg on the front-left post
  const hatM = xf([-1.2, 1.62, 0.7], [-55, 0, 12]);
  rodAB(WOOD_D, [-1.2, 1.62, 0.66], [-1.2, 1.62, 0.76], 0.011, I, {}, 5);
  put(
    STRAW_C,
    new THREE.LatheGeometry(
      [[0, 0], [0.1, 0], [0.19, 0.012], [0.2, 0.026], [0.1, 0.024], [0.085, 0.1], [0.0, 0.105]].map(([a, h]) => new THREE.Vector2(a, h)),
      10,
    ),
    xf([0, 0, 0.0]),
    hatM,
  );
  put(CORAL, new THREE.CylinderGeometry(0.087, 0.09, 0.03, 10), xf([0, 0.045, 0]), hatM);
  put(BUTTER, ball(0.015, 5, 3), xf([0.09, 0.05, 0.0]), hatM);
  // rug in front of the counter
  b.extrude(
    [[-0.8, -0.26, "sharp"], [0.8, -0.26, "sharp"], [0.8, 0.26, "sharp"], [-0.8, 0.26, "sharp"]],
    { at: [-0.1, GY + 0.007, 1.28], x: [Math.cos(4 * DEG), 0, -Math.sin(4 * DEG)], y: [Math.sin(4 * DEG), 0, Math.cos(4 * DEG)], thickness: 0.014, bevel: 0.004, color: RUG, ...S },
  );
  // loose straw, leaves and a couple of cherries on the ground
  const Rs = rng(99);
  for (let k = 0; k < 40; k++) {
    const a = Rs() * Math.PI * 2;
    const rr = Math.sqrt(Rs());
    const px = 2.9 * rr * Math.cos(a);
    const pz = 0.5 + 1.5 * rr * Math.sin(a);
    if (Math.abs(px) < 1.15 && pz < 0.9) continue;
    put(k % 4 === 0 ? LEAF : STRAW_C, box(0.1, 0.004, 0.012), xf([px, GY + 0.004, pz], [0, Rs() * 180, 0]));
  }
  cherries(xf([0.1, GY + 0.02, 1.0], [90, 30, 0]));
  cherries(xf([-0.9, GY + 0.02, 1.2], [90, -40, 0]));

  // -------- flush merged pieces
  for (const g of bag.values()) {
    const geos = g.geos.map((x) => (x.index ? x.toNonIndexed() : x));
    for (const x of geos) for (const name of Object.keys(x.attributes)) if (!["position", "normal", "uv"].includes(name)) x.deleteAttribute(name);
    const merged = mergeGeometries(geos, false);
    if (!merged) throw new Error(`merge failed for ${g.bone} ${g.color}`);
    const p = b.part(merged, g.color, { bone: bones[g.bone], at: [0, 0, 0], texture: g.texture, name: `${g.bone}.${g.color.slice(1)}${g.texture ? ".tex" : ""}` });
    if (g.glow) glow(p, g.glow);
  }
  // open the lid of the lemon crate
  b.pose(lidHinge, { axis: [1, 0, 0], deg: -108 });
  // barrow wheel gets a slight roll so the spokes aren't axis-aligned
  b.pose(wheelHinge, { axis: [1, 0, 0], deg: 12 });
  return b.root;
}
