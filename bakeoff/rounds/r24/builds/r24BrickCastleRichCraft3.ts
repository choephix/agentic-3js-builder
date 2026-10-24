import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, paint, mix, noise, smoothstep, rgb, svg, rng, grain } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Toy Brick Castle",
  description:
    "An interlocking-toy-brick castle on a studded baseplate: four round corner towers with blue cone roofs, a crenellated curtain wall, a gatehouse with a raised portcullis, a keep with lit windows, a moat, and a lowered drawbridge held by links of chain.",
};

// ---------------------------------------------------------------------------------------------
// Brick units: one stud = U metres, one brick course = CH, one plate = PLATE.
const U = 0.04;
const CH = 0.048;
const PLATE = 0.016;
const Y0 = 0.02; // top of the baseplate
const Y = (n: number) => Y0 + n * CH;
const S = (v: number) => v * U;
const SH = 0.0095; // stud height

// Palette
const STONE = "#aeb3ba";
const STONE_D = "#6b7280";
const STONE_STUD = "#c3c7cd";
const GREEN = "#3aa84a";
const GREEN_STUD = "#48bb58";
const GREEN_D = "#2a7f38";
const FLOOR_STUD = "#9a9ea6";
const ROYAL = "#2d62cf";
const ROYAL_D = "#2250b0";
const GOLD = "#f2c230";
const GOLD_BRICK = "#e3b53a";
const RED = "#d6322b";
const IRON = "#3d4048";
const LINK = "#7b8090";
const WOOD_STUD = "#a56c37";
const DARK_WOOD = "#5b3a1c";
const SLIT = "#14151c";

const hash2 = (a: number, b: number, c = 0) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------------------------------------
// Paints

const R_TOWER = (16 * U) / (2 * Math.PI); // a round tower's circumference is exactly 16 studs

type BrickOpts = { center?: [number, number]; bands?: Record<number, string> };

/** Courses of 4-stud bricks, staggered each course, with bevelled edges, per-brick tint, damp and moss at the feet. */
function bricks(base: string, o: BrickOpts = {}) {
  return paint((p, n) => {
    const h = (p.y - Y0) / CH;
    const course = Math.floor(h + 1e-4);
    const fy = h - course;
    let col = rgb(o.bands?.[course] ?? base);
    if (n.y > 0.7) return mix(col, "#ffffff", 0.1);
    if (n.y < -0.7) return mix(col, "#000000", 0.45);
    const horizontal = Math.abs(n.x) > Math.abs(n.z);
    const u = o.center
      ? (Math.atan2(p.x - o.center[0], p.z - o.center[1]) * R_TOWER) / U
      : (horizontal ? p.z : p.x) / U;
    const t = (u + (((course % 2) + 2) % 2) * 2) / 4;
    const k = Math.floor(t);
    const fx = (t - k) * 4;
    const face = o.center ? 0 : Math.round((horizontal ? p.x : p.z) / U);
    const shade = (hash2(k, course, face) - 0.5) * 0.1;
    col = shade > 0 ? mix(col, "#ffffff", shade) : mix(col, "#000000", -shade);
    if (h < 2.2) col = mix(col, "#5d6e66", 0.35 * (1 - h / 2.2));
    const mo = noise(p, 0.06, 4);
    if (h < 3.5 && mo > 0.55) col = mix(col, "#5aa34a", smoothstep(0.55, 0.7, mo) * (1 - h / 3.5) * 0.8);
    if (fx < 0.1 || fy < 0.07) return mix(col, "#20242e", 0.6);
    if (fy > 0.9 || (fx > 0.1 && fx < 0.2)) col = mix(col, "#ffffff", 0.14);
    return col;
  });
}

const WATER = paint((p) => {
  const w = noise(p, 0.05, 3);
  let c = mix("#2a79d6", "#3f9bee", w);
  const r = Math.sin(p.x * 70 + p.z * 50 + w * 7) * 0.5 + 0.5;
  c = mix(c, "#cfe9ff", smoothstep(0.9, 0.98, r) * 0.55);
  const q = Math.max(Math.abs(p.x), Math.abs(p.z)) / U;
  if (Math.abs(q - 8) < 0.35 || Math.abs(q - 12) < 0.25) c = mix(c, "#ffffff", 0.4);
  return c;
});
const BASEPAINT = paint((_p, n) => (n.y > 0.5 ? GREEN : GREEN_D));
const FLOOR = paint((p) => ((Math.floor(p.x / (2 * U)) + Math.floor(p.z / (2 * U))) & 1 ? "#8f939b" : "#82868e"));
const CARPET = paint((p) => {
  if (Math.abs(p.x) > 0.032) return GOLD;
  return Math.floor(p.z / U) & 1 ? "#b82620" : "#c92c25";
});
const PLANK_A = grain("#a8703a", "#8a5a2b", { size: 0.03, axis: "x", seed: 1 });
const PLANK_B = grain("#955f30", "#7a4d25", { size: 0.03, axis: "x", seed: 2 });

function roofPaint(cx: number, cz: number, yBase: number) {
  return paint((p) => {
    if (p.y < yBase + 0.03) return GOLD;
    const th = Math.atan2(p.x - cx, p.z - cz);
    const k = Math.floor((th + Math.PI) / (Math.PI / 6));
    return mix(k % 2 ? ROYAL : ROYAL_D, "#ffffff", Math.max(0, (p.y - yBase) * 0.35));
  });
}

// ---------------------------------------------------------------------------------------------
// Textures (SVG)

const CREST = svg(
  `<svg viewBox="0 0 80 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H76V52Q76 82 40 93Q4 82 4 52Z" fill="#1c1f3a"/>
    <path d="M8 8H72V51Q72 78 40 88Q8 78 8 51Z" fill="#2459c9"/>
    <path d="M8 8H40V88Q8 78 8 51Z" fill="#2f6bde"/>
    <path d="M8 60 L40 40 L72 60 V72 L40 52 L8 72Z" fill="#f2c230" stroke="#1c1f3a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M22 34 L25 17 L32 26 L40 12 L48 26 L55 17 L58 34Z" fill="#f2c230" stroke="#1c1f3a" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="40" cy="73" r="5.5" fill="#d6322b" stroke="#1c1f3a" stroke-width="2"/>
    <circle cx="22" cy="46" r="3" fill="#ffffff"/><circle cx="58" cy="46" r="3" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);

const BANNER = svg(
  `<svg viewBox="0 0 50 130" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H48V126L25 106L2 126Z" fill="#3a0f12"/>
    <path d="M6 6H44V116L25 98L6 116Z" fill="#cf2f2a"/>
    <path d="M6 6H44V13H6Z" fill="#f2c230"/>
    <path d="M13 42L16 24L21 33L25 21L29 33L34 24L37 42Z" fill="#f2c230" stroke="#3a0f12" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="13" y="62" width="24" height="26" fill="#f2c230" stroke="#3a0f12" stroke-width="1.5"/>
    <rect x="13" y="54" width="6" height="9" fill="#f2c230" stroke="#3a0f12" stroke-width="1.5"/>
    <rect x="22" y="54" width="6" height="9" fill="#f2c230" stroke="#3a0f12" stroke-width="1.5"/>
    <rect x="31" y="54" width="6" height="9" fill="#f2c230" stroke="#3a0f12" stroke-width="1.5"/>
    <path d="M21 88V76Q25 69 29 76V88Z" fill="#3a0f12"/>
    <circle cx="25" cy="100" r="2.6" fill="#f2c230"/>
  </svg>`,
  { size: 256 },
);

const WINDOW = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 58V22Q2 2 20 2Q38 2 38 22V58Z" fill="#3a2a1c"/>
    <path d="M6 54V22Q6 6 20 6Q34 6 34 22V54Z" fill="#ffd25e"/>
    <path d="M10 50V22Q10 11 20 11Q30 11 30 22V50Z" fill="#fff0a8"/>
    <path d="M20 6V54M6 30H34" stroke="#3a2a1c" stroke-width="3"/>
    <path d="M0 58H40" stroke="#6b5a48" stroke-width="4"/>
  </svg>`,
  { size: 128 },
);

const DOOR = svg(
  `<svg viewBox="0 0 60 84" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 84V30Q1 1 30 1Q59 1 59 30V84Z" fill="#2a1a10"/>
    <path d="M6 84V30Q6 6 30 6Q54 6 54 30V84Z" fill="#8a5a2c"/>
    <path d="M18 12V84M30 8V84M42 12V84" stroke="#5b3a1c" stroke-width="2.2"/>
    <rect x="6" y="34" width="48" height="7" fill="#3b3f48"/>
    <rect x="6" y="62" width="48" height="7" fill="#3b3f48"/>
    <circle cx="11" cy="37.5" r="1.6" fill="#9aa0ad"/><circle cx="49" cy="37.5" r="1.6" fill="#9aa0ad"/>
    <circle cx="11" cy="65.5" r="1.6" fill="#9aa0ad"/><circle cx="49" cy="65.5" r="1.6" fill="#9aa0ad"/>
    <circle cx="40" cy="52" r="4.2" fill="none" stroke="#f2c230" stroke-width="2"/>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "toy_brick_castle", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const bridge = b.joint("bridge", { parent: base, at: [0, 0.034, S(8)], dir: [0, 0, 1], role: "hinge" });
  const portcullis = b.joint("portcullis", { parent: base, at: [0, 0.17, S(6)], dir: [0, 1, 0], role: "hinge" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const P = (geo: THREE.BufferGeometry, color: any, o: any = {}) => b.part(geo, color, { bone: base, ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Bone = any;

  // Studs and other small repeated bits are merged per colour and bone.
  const buckets = new Map<string, { color: string; bone: Bone; geos: THREE.BufferGeometry[] }>();
  const add = (color: string, geo: THREE.BufferGeometry, bone: Bone = base) => {
    const key = `${color}|${bone.name}`;
    let e = buckets.get(key);
    if (!e) buckets.set(key, (e = { color, bone, geos: [] }));
    e.geos.push(geo);
  };
  const STUD = new THREE.CylinderGeometry(0.0125, 0.0125, SH, 6, 1, false);
  const stud = (cx: number, cz: number, y: number, color: string, bone: Bone = base) =>
    add(color, STUD.clone().translate(S(cx), y + SH / 2 - 0.0008, S(cz)), bone);
  const studRect = (
    x0: number,
    x1: number,
    z0: number,
    z1: number,
    y: number,
    color: string,
    skip?: (cx: number, cz: number) => boolean,
    bone: Bone = base,
  ) => {
    for (let i = x0; i < x1; i++)
      for (let j = z0; j < z1; j++) {
        const cx = i + 0.5;
        const cz = j + 0.5;
        if (skip && skip(cx, cz)) continue;
        stud(cx, cz, y, color, bone);
      }
  };

  /** Box between stud coordinates and brick courses. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const block = (x0: number, x1: number, z0: number, z1: number, n0: number, n1: number, color: any, o: any = {}) => {
    const h = (n1 - n0) * CH;
    return P(new THREE.BoxGeometry(S(x1 - x0), h, S(z1 - z0)), color, {
      at: [S((x0 + x1) / 2), Y(n0) + h / 2, S((z0 + z1) / 2)],
      ...o,
    });
  };

  const towers: [number, number][] = [
    [7, 7],
    [-7, 7],
    [7, -7],
    [-7, -7],
  ];
  const nearTower = (cx: number, cz: number, r = 2.9) => towers.some(([tx, tz]) => Math.hypot(cx - tx, cz - tz) < r);
  const inGate = (cx: number, cz: number) => Math.abs(cx) < 4 && cz > 4;
  const inKeep = (cx: number, cz: number) => Math.abs(cx) < 3 && cz < 0 && cz > -6;

  const WALL = bricks(STONE);
  const GATE = bricks(STONE, { bands: { 10: GOLD_BRICK } });
  const KEEP = bricks("#b9bdc4", { bands: { 5: ROYAL, 16: GOLD_BRICK } });

  // ---------------------------------------------------------------- baseplate, moat, floors
  P(new THREE.BoxGeometry(S(28), Y0, S(28)), BASEPAINT, { at: [0, Y0 / 2, 0] });
  const water = (x0: number, x1: number, z0: number, z1: number) =>
    P(new THREE.BoxGeometry(S(x1 - x0), 0.016, S(z1 - z0)), WATER, {
      at: [S((x0 + x1) / 2), 0.02, S((z0 + z1) / 2)],
    });
  water(-12, 12, 8, 12);
  water(-12, 12, -12, -8);
  water(-12, -8, -8, 8);
  water(8, 12, -8, 8);

  // grass studs on the rim (leaving the entrance path)
  studRect(-14, 14, -14, 14, Y0, GREEN_STUD, (cx, cz) => {
    const m = Math.max(Math.abs(cx), Math.abs(cz));
    return m < 12 || (cz > 12 && Math.abs(cx) < 2);
  });

  // courtyard and gate-passage floor, carpet, path
  P(new THREE.BoxGeometry(S(12), PLATE, S(12)), FLOOR, { at: [0, Y0 + PLATE / 2, 0] });
  P(new THREE.BoxGeometry(S(4), PLATE, S(2)), FLOOR, { at: [0, Y0 + PLATE / 2, S(7)] });
  P(new THREE.BoxGeometry(S(4), PLATE, S(2)), FLOOR, { at: [0, Y0 + PLATE / 2, S(13)] });
  studRect(-2, 2, 12, 14, Y0 + PLATE, FLOOR_STUD);
  studRect(
    -6,
    6,
    -6,
    6,
    Y0 + PLATE,
    FLOOR_STUD,
    (cx, cz) => nearTower(cx, cz, 2.7) || inGate(cx, cz) || inKeep(cx, cz) || (Math.abs(cx) < 1 && cz > 0),
  );
  P(new THREE.BoxGeometry(S(2), 0.004, S(8)), CARPET, { at: [0, Y0 + PLATE + 0.002, S(4)] });

  // ---------------------------------------------------------------- curtain walls
  block(-8, -4, 6, 8, 0, 8, WALL);
  block(4, 8, 6, 8, 0, 8, WALL);
  block(-8, 8, -8, -6, 0, 8, WALL);
  block(-8, -6, -6, 6, 0, 8, WALL);
  block(6, 8, -6, 6, 0, 8, WALL);

  // crenellations: 1x2 merlons alternating with studded gaps, mirrored about the wall's centre
  const yW = Y(8);
  const merlon = (cx: number, cz: number, alongX: boolean) => {
    P(new THREE.BoxGeometry(alongX ? U : 2 * U, CH, alongX ? 2 * U : U), WALL, {
      at: [S(cx), yW + CH / 2, S(cz)],
    });
    const a = alongX ? [0, 0] : [-0.5, 0.5];
    const c = alongX ? [-0.5, 0.5] : [0, 0];
    for (let k = 0; k < 2; k++) stud(cx + (alongX ? a[k] : a[k]), cz + (alongX ? c[k] : c[k]), yW + CH, STONE_STUD);
  };
  const gapStuds = (cx: number, cz: number, alongX: boolean) => {
    for (let k = -0.5; k <= 0.5; k += 1) stud(alongX ? cx : cx + k, alongX ? cz + k : cz, yW, STONE_STUD);
  };
  for (let i = -8; i < 8; i++) {
    const k = i >= 0 ? i : -1 - i;
    for (const z0 of [-8, 6]) {
      const cx = i + 0.5;
      const cz = z0 + 1;
      if (nearTower(cx, cz) || inGate(cx, cz)) continue;
      if (k % 2 === 0) merlon(cx, cz, true);
      else gapStuds(cx, cz, true);
    }
  }
  for (let j = -6; j < 6; j++) {
    const k = j >= 0 ? j : -1 - j;
    for (const x0 of [-8, 6]) {
      const cx = x0 + 1;
      const cz = j + 0.5;
      if (nearTower(cx, cz)) continue;
      if (k % 2 === 0) merlon(cx, cz, false);
      else gapStuds(cx, cz, false);
    }
  }

  // arrow slits on the outer faces of the walls
  const slit = (x: number, y: number, z: number, dx: number, dz: number) =>
    P(new THREE.BoxGeometry(0.013, 0.052, 0.006), SLIT, { at: [x, y, z], dir: [dx, 0, dz], axis: "z" });
  for (const x of [-3, 0, 3]) slit(S(x), Y(5), -S(8) - 0.0015, 0, -1);
  for (const z of [-3, 0, 3]) {
    slit(S(8) + 0.0015, Y(5), S(z), 1, 0);
    slit(-S(8) - 0.0015, Y(5), S(z), -1, 0);
  }

  // parapet helper: border checker of 1x1 merlons, studs everywhere else
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parapet = (x0: number, x1: number, z0: number, z1: number, yTop: number, merlonPaint: any, studColor: string) => {
    for (let i = x0; i < x1; i++)
      for (let j = z0; j < z1; j++) {
        const border = i === x0 || i === x1 - 1 || j === z0 || j === z1 - 1;
        const cx = i + 0.5;
        const cz = j + 0.5;
        if (border && (((i + j) % 2) + 2) % 2 === 0) {
          P(new THREE.BoxGeometry(U, CH, U), merlonPaint, { at: [S(cx), yTop + CH / 2, S(cz)] });
          stud(cx, cz, yTop + CH, studColor);
        } else stud(cx, cz, yTop, studColor);
      }
  };

  // ---------------------------------------------------------------- corner towers
  const flagFor = (x: number, y: number, z: number, color: string, dir: number) => {
    b.rod([x, y, z], [x, y + 0.1, z], 0.0028, "#c9ccd3", { bone: base });
    b.extrude(
      [
        [0, 0],
        [0.1, 0],
        [0.078, 0.022],
        [0.1, 0.044],
        [0, 0.044],
      ],
      { at: [x, y + 0.055, z], x: [dir, 0, 0], thickness: 0.004, color, bone: base },
    );
  };
  const rivets: THREE.BufferGeometry[] = [];
  towers.forEach(([tx, tz], idx) => {
    const cx = S(tx);
    const cz = S(tz);
    const sx = Math.sign(tx);
    const sz = Math.sign(tz);
    const tp = bricks(STONE, { center: [cx, cz], bands: { 8: ROYAL } });
    P(new THREE.CylinderGeometry(0.113, 0.113, 2 * CH, 12), bricks(STONE_D, { center: [cx, cz] }), {
      at: [cx, Y(1), cz],
      flat: true,
    });
    P(new THREE.CylinderGeometry(0.1, 0.1, 14 * CH, 12), tp, { at: [cx, Y(7), cz], flat: true });
    // corbel + gold rivets
    const yCor = Y(14);
    P(new THREE.CylinderGeometry(0.118, 0.104, 0.028, 12), "#59606d", { at: [cx, yCor + 0.014, cz], flat: true });
    for (let k = 0; k < 12; k++) {
      const th = ((15 + 30 * k) * Math.PI) / 180;
      const r = 0.111 * Math.cos(Math.PI / 12) + 0.003;
      rivets.push(
        new THREE.CylinderGeometry(0.0065, 0.0065, 0.008, 6)
          .rotateX(Math.PI / 2)
          .rotateY(th)
          .translate(cx + Math.sin(th) * r, yCor + 0.014, cz + Math.cos(th) * r),
      );
    }
    // cone roof
    const yBase = yCor + 0.028;
    P(new THREE.ConeGeometry(0.126, 0.22, 12), roofPaint(cx, cz, yBase), { at: [cx, yBase + 0.11, cz], flat: true });
    const apex = yBase + 0.22;
    P(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [cx, apex, cz] });
    flagFor(cx, apex, cz, idx < 2 ? RED : GOLD, sx);
    // slits
    const dd = (Math.atan2(sx, sz) * 180) / Math.PI;
    const place = (deg: number, y: number) => {
      const th = (deg * Math.PI) / 180;
      const r = 0.1 * Math.cos(Math.PI / 12) + 0.0015;
      slit(cx + Math.sin(th) * r, y, cz + Math.cos(th) * r, Math.sin(th), Math.cos(th));
    };
    place(dd, Y(4.5));
    place(dd, Y(11.5));
    place(dd + 30, Y(8));
    place(dd - 30, Y(8));
    place(dd + 30, Y(12.8));
    place(dd - 30, Y(12.8));
  });
  add(GOLD, mergeGeometries(rivets)!, base);

  // ---------------------------------------------------------------- gatehouse
  block(-4, -2, 4, 8, 0, 11, GATE);
  block(2, 4, 4, 8, 0, 11, GATE);
  block(-2, 2, 4, 8, 6, 11, GATE);
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [-s * U, 0],
        [0, -U],
      ],
      { at: [s * S(2), Y(6), S(6)], x: [1, 0, 0], thickness: S(4), color: GATE, bone: base },
    );
  parapet(-4, 4, 4, 8, Y(11), GATE, STONE_STUD);

  // crest on the lintel, banners and torches on the pillars
  P(new THREE.PlaneGeometry(0.088, 0.105), "#ffffff", { at: [0, Y(8.8), S(8) + 0.002], dir: [0, 0, 1], axis: "z", texture: CREST });
  for (const s of [1, -1]) {
    const bx = s * S(3);
    P(new THREE.BoxGeometry(0.058, 0.007, 0.01), DARK_WOOD, { at: [bx, Y(10.2), S(8) + 0.005] });
    P(new THREE.PlaneGeometry(0.05, 0.13), "#ffffff", { at: [bx, Y(10.2) - 0.07, S(8) + 0.004], dir: [0, 0, 1], axis: "z", texture: BANNER });
    // torch
    const tz = S(8);
    const ty = Y(4);
    P(new THREE.BoxGeometry(0.02, 0.008, 0.016), IRON, { at: [bx, ty - 0.012, tz + 0.008] });
    P(new THREE.CylinderGeometry(0.0055, 0.0045, 0.05, 6), DARK_WOOD, { at: [bx, ty + 0.008, tz + 0.016] });
    glow(P(new THREE.ConeGeometry(0.014, 0.036, 6), "#ff9a1f", { at: [bx, ty + 0.047, tz + 0.016], flat: true }), 1.4);
    glow(P(new THREE.ConeGeometry(0.0075, 0.024, 5), "#ffe27a", { at: [bx, ty + 0.045, tz + 0.016], flat: true }), 2);
  }

  // portcullis, raised half way
  {
    const pb = (w: number, h: number, d: number, x: number, y: number, z: number) =>
      P(new THREE.BoxGeometry(w, h, d), "#3c3f48", { at: [x, y, z], bone: portcullis });
    for (const x of [-1.5, -0.5, 0.5, 1.5]) {
      pb(0.007, 0.2, 0.007, S(x), 0.17 + 0.09, S(6) - 0.004);
      P(new THREE.ConeGeometry(0.0055, 0.02, 5), "#3c3f48", {
        at: [S(x), 0.17 - 0.008, S(6) - 0.004],
        rotation: [180, 0, 0],
        bone: portcullis,
        flat: true,
      });
    }
    for (const y of [0.2, 0.245, 0.29]) pb(0.152, 0.007, 0.007, 0, y, S(6) + 0.004);
  }

  // ---------------------------------------------------------------- keep
  block(-3, 3, -6, 0, 0, 17, KEEP);
  const yT = Y(17) + 0.024;
  P(new THREE.BoxGeometry(S(8), 0.024, S(7)), "#5d636f", { at: [0, Y(17) + 0.012, S(-2.5)] });
  parapet(-4, 4, -6, 1, yT, KEEP, "#c4c8ce");
  // door, banner, windows
  P(new THREE.PlaneGeometry(0.085, 0.119), "#ffffff", { at: [0, Y0 + 0.06, 0.002], dir: [0, 0, 1], axis: "z", texture: DOOR });
  P(new THREE.BoxGeometry(0.058, 0.006, 0.01), DARK_WOOD, { at: [0, Y(7.6), 0.005] });
  P(new THREE.PlaneGeometry(0.052, 0.135), "#ffffff", { at: [0, Y(7.6) - 0.07, 0.003], dir: [0, 0, 1], axis: "z", texture: BANNER });
  for (const s of [1, -1]) {
    glow(P(new THREE.PlaneGeometry(0.05, 0.075), "#ffffff", { at: [s * S(1.9), Y(12.5), 0.002], dir: [0, 0, 1], axis: "z", texture: WINDOW }), 0.9);
    glow(P(new THREE.PlaneGeometry(0.05, 0.075), "#ffffff", { at: [s * (S(3) + 0.002), Y(10), S(-3)], dir: [s, 0, 0], axis: "z", texture: WINDOW }), 0.9);
    glow(P(new THREE.PlaneGeometry(0.05, 0.075), "#ffffff", { at: [s * (S(3) + 0.002), Y(14), S(-3)], dir: [s, 0, 0], axis: "z", texture: WINDOW }), 0.9);
  }
  glow(P(new THREE.PlaneGeometry(0.04, 0.06), "#ffffff", { at: [0, Y(14.6), 0.002], dir: [0, 0, 1], axis: "z", texture: WINDOW }), 0.9);
  // keep flag: tall pole with a big swallow-tail flag and gold stripe
  {
    const fx = 0;
    const fz = S(-2.5);
    const top = yT;
    b.rod([fx, top, fz], [fx, top + 0.24, fz], 0.0035, "#c9ccd3", { bone: base });
    P(new THREE.SphereGeometry(0.0085, 6, 4), GOLD, { at: [fx, top + 0.245, fz] });
    const outline: [number, number][] = [
      [0, 0],
      [0.15, 0],
      [0.115, 0.03],
      [0.15, 0.06],
      [0, 0.06],
    ];
    b.extrude(outline, { at: [fx, top + 0.17, fz], x: [1, 0, 0], thickness: 0.005, color: RED, bone: base });
    b.extrude(
      [
        [0.004, 0.024],
        [0.13, 0.024],
        [0.124, 0.036],
        [0.004, 0.036],
      ],
      { at: [fx, top + 0.17, fz + 0.0035], x: [1, 0, 0], thickness: 0.003, color: GOLD, bone: base },
    );
  }

  // ---------------------------------------------------------------- drawbridge
  for (let i = 0; i < 4; i++) {
    const zc = 8.5 + i;
    P(new THREE.BoxGeometry(S(4) - 0.0006, PLATE, U - 0.0006), i % 2 ? PLANK_B : PLANK_A, {
      at: [0, 0.034, S(zc)],
      bone: bridge,
    });
    studRect(-2, 2, zc - 0.5, zc + 0.5, 0.042, WOOD_STUD, undefined, bridge);
  }
  P(new THREE.CylinderGeometry(0.007, 0.007, 0.17, 8), IRON, { at: [0, 0.034, S(8)], rotation: [0, 0, 90], bone: bridge });
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.012, 0.026, S(4)), DARK_WOOD, { at: [s * 0.074, 0.055, S(10)], bone: bridge });
    P(new THREE.BoxGeometry(0.016, 0.052, 0.016), DARK_WOOD, { at: [s * 0.074, 0.068, S(11.5)], bone: bridge });
    P(new THREE.CylinderGeometry(0.0085, 0.0085, 0.004, 8), IRON, {
      at: [s * 0.07, Y(8), S(8) + 0.002],
      dir: [0, 0, 1],
    });
    // chain links from bridge post to the gatehouse
    const a = new THREE.Vector3(s * 0.074, 0.098, S(11.5));
    const z = new THREE.Vector3(s * 0.07, Y(8), S(8) + 0.006);
    const tan = z.clone().sub(a).normalize();
    const side = new THREE.Vector3(1, 0, 0);
    const n2 = tan.clone().cross(side).normalize();
    const N = 22;
    for (let i = 0; i <= N; i++) {
      const pos = a.clone().lerp(z, i / N);
      const nrm = i % 2 ? n2 : side;
      P(new THREE.TorusGeometry(0.0075, 0.0026, 4, 6), LINK, {
        at: [pos.x, pos.y, pos.z],
        dir: [nrm.x, nrm.y, nrm.z],
        axis: "z",
        up: [tan.x, tan.y, tan.z],
        scale: [0.75, 1.25, 1],
      });
    }
  }

  // ---------------------------------------------------------------- tiny flowers on the grass rim
  {
    const r = rng(11);
    const petals = ["#ff7bb0", "#ffffff", "#ffd23f", "#ff7bb0", "#c9a4ff", "#ffffff", "#ff7bb0", "#ffd23f"];
    const cells: [number, number][] = [
      [-13.5, 10.5],
      [13.5, -11.5],
      [-12.5, -13.5],
      [12.5, 13.5],
      [-13.5, -5.5],
      [13.5, 4.5],
      [-10.5, 13.5],
      [6.5, 13.5],
    ];
    cells.forEach(([cx, cz], i) => {
      const y = Y0 + SH;
      add("#2f8f3f", new THREE.CylinderGeometry(0.0025, 0.0025, 0.022, 5).translate(S(cx), y + 0.011, S(cz)), base);
      const col = petals[i % petals.length];
      const ph = r() * Math.PI;
      for (let k = 0; k < 5; k++) {
        const a = ph + (k * Math.PI * 2) / 5;
        add(col, new THREE.CylinderGeometry(0.006, 0.006, 0.004, 5).translate(S(cx) + Math.cos(a) * 0.008, y + 0.024, S(cz) + Math.sin(a) * 0.008), base);
      }
      add(GOLD, new THREE.CylinderGeometry(0.0055, 0.0055, 0.005, 5).translate(S(cx), y + 0.0255, S(cz)), base);
    });
  }

  // ---------------------------------------------------------------- flush merged studs
  for (const e of buckets.values()) {
    const merged = mergeGeometries(e.geos, false);
    if (!merged) continue;
    P(merged, e.color, { bone: e.bone, at: [0, 0, 0], flat: true });
  }

  return b.root;
}
