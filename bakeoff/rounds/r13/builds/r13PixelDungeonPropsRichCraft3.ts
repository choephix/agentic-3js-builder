import * as THREE from "three";
import { createBuilder, rng, noise } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  stepped,
} from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dungeon Props (pixel art)",
  description:
    "A pixel-art dungeon prop group: an open treasure chest with a hinged lid and glowing hoard, three hooped barrels, two flaming standing torches and a fallen one, a bloody spike trap with glowing runes, and scattered bones with skulls.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants and tiny helpers

type V3 = [number, number, number];
const TEXEL = 0.02;
const TAU = Math.PI * 2;
const mod = (a: number, m: number) => ((a % m) + m) % m;
const hash3 = (a: number, b: number, c: number) => {
  let h = Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------------------------------------------------------
// Palettes (dark to light)

const CHEST_WOOD = ["#26130b", "#3a1f11", "#552f19", "#744425", "#935d32"];
const BARREL_WOOD = ["#33200f", "#513215", "#744a22", "#94662f", "#b78545"];
const POLE_WOOD = ["#241910", "#3a2918", "#543c23", "#6f5230"];
const STONE_RAMP = ["#13151d", "#252935", "#394050", "#505870", "#6c7590"];
const MOSS = ["#14260f", "#21401a", "#34602a", "#4f8a38"];
const IRON_RAMP = ["#101015", "#1f2029", "#363847", "#545870", "#7c819b"];
const RUST = ["#33160c", "#592a13", "#85421d"];
const GOLD_RAMP = ["#6c400d", "#a8701a", "#e3ab2c", "#ffd45a", "#fff2a6"];
const BONE_RAMP = ["#6b6049", "#928669", "#bfb496", "#e5ddc2"];
const BLOOD = ["#33080a", "#6a1010", "#a21c1a"];
const CLOTH_RED = ["#3a0a16", "#5e1224", "#82203a", "#a23450"];
const DARK_WOOD_IN = ["#0b0705", "#1a100a", "#2a1a10"];

// ---------------------------------------------------------------------------------------------------------------
// Paints

const woodPaint = (ramp: string[], seed: number, plank = 3, nails = true) =>
  cellPaint(
    TEXEL,
    (c) => {
      const row = Math.floor(c.v / plank);
      let v =
        0.52 +
        (hash3(row, seed, c.axis) - 0.5) * 0.3 +
        (c.random(seed) - 0.5) * 0.22 +
        0.1 * c.n.y +
        (noise(c.at, 0.3, seed) - 0.5) * 0.2;
      const m = mod(c.v, plank);
      if (m === 0) v -= 0.32;
      else if (m === plank - 1) v += 0.08;
      if (c.random(seed + 5) < 0.04) v -= 0.25;
      if (nails && m === 1 && mod(c.u, 10) === 2) return "#a3a9bd";
      return c.pick(ramp, v);
    },
    { dither: true },
  );

const stonePaint = (seed: number) =>
  cellPaint(
    TEXEL,
    (c) => {
      const row = Math.floor(c.v / 4);
      const off = mod(row, 2) * 4;
      const col = Math.floor((c.u + off) / 8);
      const seam = mod(c.v, 4) === 0 || mod(c.u + off, 8) === 0;
      if (!seam && c.n.y > 0.7 && noise(c.at, 0.35, seed) > 0.64) return c.pick(MOSS, 0.3 + c.random(seed + 3) * 0.6);
      let v =
        0.5 + (hash3(col, row, seed + c.axis) - 0.5) * 0.35 + (c.random(seed) - 0.5) * 0.2 + 0.12 * c.n.y;
      if (seam) v -= 0.32;
      else if (mod(c.v, 4) === 3) v += 0.08;
      return c.pick(STONE_RAMP, v);
    },
    { dither: true },
  );

const ironPaint = (seed: number) =>
  cellPaint(
    0.01,
    (c) => {
      if (noise(c.at, 0.2, seed + 4) > 0.7) return c.pick(RUST, 0.2 + c.random(seed + 1) * 0.7);
      const v = 0.45 + 0.25 * c.n.y + (noise(c.at, 0.12, seed) - 0.5) * 0.5 + (c.random(seed) - 0.5) * 0.15;
      return c.pick(IRON_RAMP, v);
    },
    { dither: true },
  );

const goldPaint = cellPaint(
  0.01,
  (c) => {
    const sparkle = c.random(4) > 0.93 ? 0.4 : 0;
    const v = 0.5 + 0.3 * c.n.y + (noise(c.at, 0.08, 6) - 0.5) * 0.8 + sparkle;
    return c.pick(GOLD_RAMP, v);
  },
  { dither: true },
);

const bonePaint = cellPaint(
  0.01,
  (c) => {
    const v = 0.55 + 0.3 * c.n.y + (noise(c.at, 0.1, 3) - 0.5) * 0.5 + (c.random(2) - 0.5) * 0.15;
    if (noise(c.at, 0.25, 8) > 0.72) return c.pick(["#3a2c18", "#5b4727", "#7e6a40"], c.random(5));
    return c.pick(BONE_RAMP, v);
  },
  { dither: true },
);

const clothPaint = cellPaint(
  TEXEL,
  (c) => {
    const weave = mod(c.u + c.v, 2) === 0 ? 0.06 : 0;
    return c.pick(CLOTH_RED, 0.5 + weave + (c.random(1) - 0.5) * 0.2, );
  },
  { dither: true },
);

const polePaint = cellPaint(
  0.01,
  (c) => {
    const streak = mod(c.u, 3) === 0 ? -0.2 : 0;
    return c.pick(POLE_WOOD, 0.5 + streak + (c.random(3) - 0.5) * 0.4 + 0.15 * c.n.y);
  },
  { dither: true },
);

const wrapLit = cellPaint(
  0.01,
  (c) =>
    c.random(2) < 0.12
      ? "#ff7a1c"
      : c.pick(["#0e0907", "#241812", "#3a2a1c", "#54402a"], 0.4 + (c.random(1) - 0.5) * 0.6 + 0.3 * c.n.y),
  { dither: true },
);
const wrapDead = cellPaint(
  0.01,
  (c) => c.pick(["#050404", "#0e0a08", "#1c1410", "#2c2018"], 0.45 + (c.random(1) - 0.5) * 0.6 + 0.3 * c.n.y),
  { dither: true },
);

const pitPaint = cellPaint(
  TEXEL,
  (c) => {
    if (noise(c.at, 0.3, 12) > 0.6) return c.pick(BLOOD, 0.3 + c.random(2) * 0.5);
    return c.pick(["#05050a", "#0b0b14", "#15151f"], 0.4 + c.random(1) * 0.5);
  },
  { dither: true },
);

const spikePaint = cellPaint(
  0.01,
  (c) => {
    const hgt = c.at.y - 0.08;
    if (hgt > 0.12 && noise(c.at, 0.18, 3) > 0.5 - hgt * 0.45) return c.pick(BLOOD, 0.2 + c.random(7) * 0.8);
    const v = 0.5 + 0.2 * c.n.y + (c.random(3) - 0.5) * 0.2 + (hgt > 0.3 ? 0.15 : 0);
    return c.pick(IRON_RAMP, v);
  },
  { dither: true },
);

function barrelPaint(base: V3, axis: V3, rTop: number, H: number, open: boolean, seed: number) {
  const a = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
  const s1 = Math.abs(a.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  s1.addScaledVector(a, -s1.dot(a)).normalize();
  const s2 = new THREE.Vector3().crossVectors(a, s1);
  return cellPaint(
    TEXEL,
    (c) => {
      const dx = c.at.x - base[0];
      const dy = c.at.y - base[1];
      const dz = c.at.z - base[2];
      const h = dx * a.x + dy * a.y + dz * a.z;
      const q1 = dx * s1.x + dy * s1.y + dz * s1.z;
      const q2 = dx * s2.x + dy * s2.y + dz * s2.z;
      const r = Math.hypot(q1, q2);
      const nd = c.n.x * a.x + c.n.y * a.y + c.n.z * a.z;
      if (open && h < H - 0.02 && h > H - 0.2 && r < rTop - 0.028) return c.pick(DARK_WOOD_IN, c.random(seed));
      if (nd > 0.6) {
        const i = Math.floor(q1 / TEXEL + 200);
        let v = 0.55 + (hash3(Math.floor(i / 4), seed, 1) - 0.5) * 0.3 + (c.random(seed) - 0.5) * 0.2;
        if (mod(i, 4) === 0) v -= 0.3;
        if (r < rTop * 0.92 - 0.03) v -= 0.1;
        return c.pick(BARREL_WOOD, v);
      }
      if (nd < -0.6) return c.pick(BARREL_WOOD, 0.25);
      const stave = (Math.atan2(q2, q1) / TAU + 0.5) * 20;
      const f = stave - Math.floor(stave);
      let v =
        0.52 +
        (hash3(Math.floor(stave), seed, 2) - 0.5) * 0.32 +
        (c.random(seed + 1) - 0.5) * 0.2 +
        (noise(c.at, 0.25, seed) - 0.5) * 0.25;
      if (f < 0.2) v -= 0.3;
      if (h < 0.1) v -= 0.14;
      if (h < 0.06 && noise(c.at, 0.2, seed + 9) > 0.55) return c.pick(["#1f2a12", "#33441c"], c.random(4));
      return c.pick(BARREL_WOOD, v);
    },
    { dither: true },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Textures

const LOCK = pixelArt(
  [
    "kkkkkkkk",
    "kYYyyyyk",
    "kYyyyyyk",
    "kyyyyyyk",
    "kyykkyyk",
    "kyykkyyk",
    "kyykkyyk",
    "kyyyyyyk",
    "kyyyyyys",
    "kkkkkkkk",
  ],
  { k: "#2a1a0a", Y: "#fff0a0", y: "#e0a830", s: "#a8741c" },
);

const RUNE = pixelArt(
  [
    "....r....",
    "...rrr...",
    "..r.r.r..",
    ".r..y..r.",
    "rrrryrrrr",
    ".r..y..r.",
    "..r.r.r..",
    "...rrr...",
    "....r....",
  ],
  { r: "#ff3a22", y: "#ffc04a" },
);

const BRAND_X = pixelArt(
  [
    "..rrrrr..",
    ".rrrrrrr.",
    "rr.rrr.rr",
    "rrr.r.rrr",
    "rrrr.rrrr",
    "rrr.r.rrr",
    "rr.rrr.rr",
    ".rrrrrrr.",
    "..rrrrr..",
  ],
  { r: "#a8281c" },
);

const BRAND_SKULL = pixelArt(
  [
    ".wwwwwww.",
    "wwwwwwwww",
    "wwkwwwkww",
    "wwkwwwkww",
    "wwwwkwwww",
    ".wwwwwww.",
    "..wkwkw..",
    "..wwwww..",
  ],
  { w: "#e8dfc8", k: "#1b1410" },
);

const SK = skinLayout({ cran: [10, 8, 10], jaw: [8, 3, 8] }, 64);
const SKULL = pixelTexture(SK.size[0], SK.size[1], (g) => {
  const ramp = ["#6f634e", "#968a72", "#c4baa0", "#e6dfc6"];
  for (const faces of Object.values(SK.faces))
    for (const rect of Object.values(faces))
      g.fill(
        (x, y, _w, h) => pick(ramp, 0.78 - (y / h) * 0.3 + ((x * 5 + y * 3) % 4) * 0.02, bayer(x, y)),
        rect,
      );
  const f = SK.faces.cran.pz;
  g.stamp(f[0], f[1] + 2, [".kkk..kkk.", ".kkk..kkk.", "..........", "....kk....", "....kk...."], {
    k: "#1f1810",
  });
  g.set(f[0] + 7, f[1], "#3a2c18");
  g.set(f[0] + 7, f[1] + 1, "#3a2c18");
  g.set(f[0] + 6, f[1] + 1, "#3a2c18");
  const j = SK.faces.jaw.pz;
  g.stamp(j[0], j[1], ["wkwkwkwk", "wwwwwwww"], { w: "#eee6cc", k: "#2a2218" });
});

// Flame silhouettes (rows bottom to top, cells of 2 cm)
const FLAME_OUT = stepped(
  [[-3, 3], [-3, 3], [-3, 3], [-2, 3], [-2, 2], [-2, 2], [-1, 2], [-1, 1], [-1, 1], [0, 1]],
  0.02,
  { rows: true },
);
const FLAME_MID = stepped([[-2, 2], [-2, 2], [-2, 2], [-1, 2], [-1, 1], [-1, 1], [0, 1]], 0.02, { rows: true });
const FLAME_CORE = stepped([[-1, 1], [-1, 1], [-1, 1], [0, 1], [0, 1]], 0.02, { rows: true });

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "dungeon_props", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });

  const box = (size: V3, color: ColorInput, at: V3, o: Record<string, any> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: root, at, ...o });

  const frameAt = (ox: number, oz: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return {
      p: (x: number, y: number, z: number): V3 => [ox + x * c + z * s, y, oz - x * s + z * c],
      rot: [0, deg, 0] as V3,
    };
  };

  const R = rng(11);

  // =========================================================================================================
  // CHEST (open, lid on a hinge joint, hoard inside)
  // =========================================================================================================
  {
    const WOOD = woodPaint(CHEST_WOOD, 1, 3);
    const IRON = ironPaint(2);
    // walls
    box([0.9, 0.34, 0.06], WOOD, [0, 0.17, 0.245]);
    box([0.9, 0.34, 0.06], WOOD, [0, 0.17, -0.245]);
    for (const s of [1, -1]) box([0.06, 0.34, 0.43], WOOD, [s * 0.42, 0.17, 0]);
    box([0.78, 0.1, 0.43], WOOD, [0, 0.05, 0]);
    // hoard
    box([0.78, 0.2, 0.43], goldPaint, [0, 0.2, 0]);
    box([0.7, 0.05, 0.38], goldPaint, [0, 0.325, 0]);
    box([0.5, 0.05, 0.28], goldPaint, [0.02, 0.375, 0.01]);
    box([0.3, 0.04, 0.18], goldPaint, [-0.02, 0.42, 0]);
    // iron: corner brackets, front and back bands
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box([0.07, 0.36, 0.07], IRON, [sx * 0.44, 0.18, sz * 0.265]);
    for (const x of [-0.28, 0.28])
      for (const sz of [1, -1]) {
        box([0.09, 0.35, 0.02], IRON, [x, 0.175, sz * 0.286]);
        box([0.09, 0.015, 0.06], IRON, [x, 0.3475, sz * 0.245]);
      }
    // lock plate
    b.part(new THREE.BoxGeometry(0.16, 0.2, 0.03), "#ffffff", {
      bone: root,
      at: [0, 0.2, 0.29],
      texture: LOCK,
    });
    // stone feet
    for (const sx of [1, -1]) for (const sz of [1, -1]) box([0.08, 0.02, 0.08], stonePaint(3), [sx * 0.4, 0.01, sz * 0.23]);

    // lid
    const lid = b.joint("lid", { parent: root, at: [0, 0.34, -0.275], dir: [0, 0, 1], role: "hinge" });
    const HEIGHTS = [4, 5, 6, 6, 7, 7, 7, 6, 6, 5, 4];
    const lidOut = stepped(
      HEIGHTS.map((h) => [0, h] as [number, number]),
      [0.05, 0.04],
    );
    b.extrude(lidOut, {
      at: [0, 0.34, -0.275],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.9,
      color: woodPaint(CHEST_WOOD, 4, 3),
      bone: lid,
    });
    const bandOut = stepped(
      HEIGHTS.map((h) => [0, h] as [number, number]),
      [0.0545, 0.0425],
    );
    for (const x of [-0.28, 0.28])
      b.extrude(bandOut, {
        at: [x, 0.336, -0.29975],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.1,
        color: IRON,
        bone: lid,
      });
    box([0.1, 0.13, 0.02], IRON, [0, 0.42, 0.286], { bone: lid });
    box([0.82, 0.012, 0.47], clothPaint, [0, 0.334, 0], { bone: lid });
    for (const sx of [1, -1]) box([0.07, 0.03, 0.07], IRON, [sx * 0.44, 0.355, 0.26], { bone: lid });
    b.pose(lid, { axis: [1, 0, 0], deg: -100 });

    // coins and gems
    const coinColors = ["#ffd23c", "#f2b72a", "#ffe680"];
    for (let i = 0; i < 18; i++) {
      const x = (R() - 0.5) * 0.66;
      const z = (R() - 0.5) * 0.34;
      const level = Math.abs(x) < 0.15 && Math.abs(z) < 0.09 ? 0.44 : Math.abs(x) < 0.25 && Math.abs(z) < 0.14 ? 0.4 : 0.35;
      glow(
        b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), coinColors[i % 3], {
          bone: root,
          at: [x, level + 0.004, z],
          rotation: [(R() - 0.5) * 50, R() * 360, (R() - 0.5) * 50],
        }),
        0.4,
      );
    }
    const gems: [string, V3][] = [
      ["#e8253c", [-0.17, 0.455, 0.04]],
      ["#3aa0ff", [0.13, 0.425, -0.07]],
      ["#3cdc78", [0.2, 0.37, 0.1]],
    ];
    for (const [c, at] of gems)
      glow(box([0.05, 0.05, 0.05], c, at, { rotation: [30, 45, 20] }), 1.1);
  }

  // =========================================================================================================
  // BARRELS
  // =========================================================================================================
  const BH = 0.84;
  const BN = 14;
  const lvl = BH / BN;
  const Rof = (y: number) => {
    const t = (y / BH) * 2 - 1;
    return Math.round((0.25 + 0.06 * (1 - t * t)) / 0.01) * 0.01;
  };
  const Rlevel = (y: number) => Rof((Math.min(Math.floor(y / lvl), BN - 1) + 0.5) * lvl);

  function barrel(
    base: V3,
    axisIn: V3,
    o: { seed: number; open?: boolean; brand?: THREE.Texture; brandDir?: V3 },
  ) {
    const al = Math.hypot(...axisIn);
    const axis: V3 = [axisIn[0] / al, axisIn[1] / al, axisIn[2] / al];
    const rTop = Rof(BH);
    const pts: Array<[number, number]> = [[0, 0]];
    for (let i = 0; i < BN; i++) {
      const r = Rof((i + 0.5) * lvl);
      pts.push([r, i * lvl], [r, (i + 1) * lvl]);
    }
    if (o.open) pts.push([rTop - 0.035, BH], [rTop - 0.035, BH - 0.14], [0, BH - 0.14]);
    else pts.push([rTop - 0.04, BH], [rTop - 0.04, BH - 0.025], [0, BH - 0.025]);
    const body = b.lathe(pts, {
      at: base,
      axis,
      segments: 8,
      spin: 22.5,
      color: barrelPaint(base, axis, rTop, BH, !!o.open, o.seed),
      bone: root,
    });
    for (const f of [0.08, 0.27, 0.62, 0.8]) {
      const y0 = f * BH;
      const y1 = y0 + 0.05;
      const rr = Math.max(Rlevel(y0), Rlevel(y1));
      b.lathe(
        [
          [rr - 0.03, y0],
          [rr + 0.025, y0],
          [rr + 0.025, y1],
          [rr - 0.03, y1],
        ],
        { at: base, axis, segments: 8, spin: 22.5, color: ironPaint(o.seed + 20), bone: root },
      );
    }
    if (o.brand && o.brandDir) {
      const d = o.brandDir;
      b.decal(body, o.brand, {
        at: [base[0] + d[0] * 0.3, base[1] + 0.42, base[2] + d[2] * 0.3],
        dir: d,
        size: [0.2, 0.2],
        bone: root,
      });
    }
    return body;
  }

  barrel([-1.0, 0, -0.45], [0, 1, 0], { seed: 1, brand: BRAND_SKULL, brandDir: [0, 0, 1] });
  barrel([-1.62, 0, 0.05], [0, 1, 0], { seed: 2, open: true, brand: BRAND_X, brandDir: [0, 0, 1] });
  glow(
    b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.01, 8), "#52c85a", {
      bone: root,
      at: [-1.62, BH - 0.1, 0.05],
      rotation: [0, 22.5, 0],
    }),
    0.6,
  );
  {
    // lying, open barrel rolled on its side
    const ax: V3 = [0.2, 0, 1];
    const l = Math.hypot(...ax);
    const center: V3 = [1.35, 0.3, -0.3];
    const half = BH / 2;
    barrel(
      [center[0] - (ax[0] / l) * half, center[1], center[2] - (ax[2] / l) * half],
      ax,
      { seed: 3, open: true },
    );
  }

  // =========================================================================================================
  // TORCHES
  // =========================================================================================================
  function torch(x: number, z: number, seed: number) {
    const stone = stonePaint(seed);
    box([0.46, 0.12, 0.46], stone, [x, 0.06, z]);
    box([0.36, 0.12, 0.36], stone, [x, 0.18, z]);
    box([0.26, 0.12, 0.26], stone, [x, 0.3, z]);
    box([0.07, 1.0, 0.07], polePaint, [x, 0.86, z]);
    const iron = ironPaint(seed + 30);
    for (const y of [0.5, 0.9, 1.25]) box([0.095, 0.04, 0.095], iron, [x, y, z]);
    box([0.15, 0.03, 0.15], iron, [x, 1.375, z]);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box([0.03, 0.17, 0.03], iron, [x + sx * 0.06, 1.475, z + sz * 0.06]);
    box([0.15, 0.025, 0.03], iron, [x, 1.55, z + 0.06]);
    box([0.15, 0.025, 0.03], iron, [x, 1.55, z - 0.06]);
    box([0.1, 0.16, 0.1], wrapLit, [x, 1.46, z]);
    // flame: crossed pixel silhouettes, outer to core
    for (const xd of [[1, 0, 0], [0, 0, 1]] as V3[]) {
      glow(b.extrude(FLAME_OUT, { at: [x, 1.52, z], x: xd, y: [0, 1, 0], thickness: 0.07, color: "#ff5a14", bone: root }), 1.3);
      glow(b.extrude(FLAME_MID, { at: [x, 1.53, z], x: xd, y: [0, 1, 0], thickness: 0.084, color: "#ffa520", bone: root }), 1.4);
      glow(b.extrude(FLAME_CORE, { at: [x, 1.54, z], x: xd, y: [0, 1, 0], thickness: 0.098, color: "#fff0a0", bone: root }), 1.5);
    }
    const r2 = rng(seed);
    for (let i = 0; i < 5; i++)
      glow(
        box([0.014, 0.014, 0.014], i % 2 ? "#ffcf5a" : "#ff8a1c", [
          x + (r2() - 0.5) * 0.24,
          1.72 + r2() * 0.22,
          z + (r2() - 0.5) * 0.24,
        ]),
        1.4,
      );
    // soot stain on stone lip
    box([0.12, 0.004, 0.12], "#0b0a10", [x, 0.362, z]);
  }
  torch(-2.3, -0.4, 5);
  torch(2.3, -0.5, 6);

  // fallen, burnt-out torch
  {
    const fr = frameAt(-0.15, 1.45, 14);
    const put = (size: V3, color: ColorInput, at: V3) => box(size, color, fr.p(...at), { rotation: fr.rot });
    put([0.8, 0.07, 0.07], polePaint, [0, 0.035, 0]);
    put([0.16, 0.1, 0.1], wrapDead, [0.43, 0.05, 0]);
    put([0.15, 0.03, 0.15], ironPaint(41), [0.33, 0.04, 0]);
    put([0.095, 0.075, 0.095], ironPaint(42), [-0.1, 0.037, 0]);
    put([0.2, 0.004, 0.16], "#0b0a10", [0.5, 0.002, 0]);
    for (const [ex, ez] of [[0.5, 0.05], [0.55, -0.04], [0.46, 0.0]])
      glow(box([0.015, 0.015, 0.015], "#ff7a1c", fr.p(ex, 0.025, ez), { rotation: fr.rot }), 1.2);
  }

  // =========================================================================================================
  // SPIKE TRAP
  // =========================================================================================================
  {
    const tx = 1.25;
    const tz = 1.45;
    const stone = stonePaint(7);
    box([1.1, 0.12, 0.16], stone, [tx, 0.06, tz + 0.47]);
    box([1.1, 0.12, 0.16], stone, [tx, 0.06, tz - 0.47]);
    for (const s of [1, -1]) box([0.16, 0.12, 0.78], stone, [tx + s * 0.47, 0.06, tz]);
    box([0.8, 0.04, 0.8], pitPaint, [tx, 0.02, tz]);
    box([0.76, 0.04, 0.76], ironPaint(8), [tx, 0.06, tz]);
    // corner runes (glowing)
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        glow(
          b.part(new THREE.PlaneGeometry(0.135, 0.135), "#ffffff", {
            bone: root,
            at: [tx + sx * 0.47, 0.123, tz + sz * 0.47],
            dir: [0, 1, 0],
            axis: "z",
            up: [0, 0, -1],
            texture: RUNE,
          }),
          1.2,
        );
    // spikes on their own joint (can be lowered by an animator)
    const sj = b.joint("spikes", { parent: root, at: [tx, 0.08, tz], dir: [0, 1, 0] });
    const grid = [-0.3, -0.1, 0.1, 0.3];
    let idx = 0;
    for (const gx of grid)
      for (const gz of grid) {
        const n = idx === 5 ? 3 : idx === 10 ? 4 : 5;
        idx++;
        const pts: Array<[number, number]> = [[0, 0]];
        for (let k = 0; k < n; k++) {
          const r = 0.07 * (1 - k / 5);
          pts.push([r, k * 0.08], [r, (k + 1) * 0.08]);
        }
        if (n < 5) pts.push([0.07 * (1 - (n - 1) / 5) - 0.012, n * 0.08]);
        pts.push([0, n * 0.08]);
        b.lathe(pts, {
          at: [tx + gx, 0.08, tz + gz],
          axis: [0, 1, 0],
          segments: 4,
          spin: 45,
          color: spikePaint,
          bone: sj,
        });
      }
  }

  // =========================================================================================================
  // BONES
  // =========================================================================================================
  function skull(ox: number, oy: number, oz: number, deg: number, eyes: string | null) {
    const fr = frameAt(ox, oz, deg);
    b.part(skinBox(SKULL, SK.faces.cran, TEXEL), "#ffffff", {
      bone: root,
      at: fr.p(0, oy + 0.14, 0),
      rotation: fr.rot,
      texture: SKULL,
    });
    b.part(skinBox(SKULL, SK.faces.jaw, TEXEL), "#ffffff", {
      bone: root,
      at: fr.p(0, oy + 0.03, 0.01),
      rotation: fr.rot,
      texture: SKULL,
    });
    if (eyes)
      for (const s of [-1, 1])
        glow(box([0.05, 0.03, 0.006], eyes, fr.p(s * 0.05, oy + 0.16, 0.102), { rotation: fr.rot }), 1.4);
  }

  function femur(ox: number, oz: number, deg: number, len = 0.4) {
    const fr = frameAt(ox, oz, deg);
    const put = (size: V3, at: V3) => box(size, bonePaint, fr.p(...at), { rotation: fr.rot });
    put([len, 0.04, 0.04], [0, 0.02, 0]);
    for (const s of [-1, 1]) {
      put([0.06, 0.05, 0.04], [s * (len / 2 + 0.01), 0.025, 0.022]);
      put([0.06, 0.05, 0.04], [s * (len / 2 + 0.01), 0.025, -0.022]);
    }
  }

  function ribcage(ox: number, oz: number, deg: number) {
    const fr = frameAt(ox, oz, deg);
    for (let i = 0; i < 7; i++)
      box([0.045, 0.04, 0.05], bonePaint, fr.p(0, 0.02, (i - 3) * 0.075), { rotation: fr.rot });
    for (let i = 1; i <= 6; i++) {
      const z = (i - 3.5) * 0.075;
      const W = 0.24 - Math.abs(i - 3.5) * 0.03;
      for (const s of [1, -1]) {
        const pts = (
          [
            [0.03, 0.035],
            [0.1, 0.09],
            [W * 0.85, 0.095],
            [W, 0.05],
            [W - 0.01, 0.012],
          ] as Array<[number, number]>
        ).map(([x, y]) => fr.p(s * x, y, z));
        b.sweep(pts, [0.017, 0.011], { color: bonePaint, sides: 4, bone: root });
      }
    }
  }

  ribcage(-1.1, 1.3, 20);
  skull(-1.45, 0, 1.55, 35, "#ff3030");
  skull(1.25, 0.12, 1.95, 22, null);
  femur(-0.75, 1.75, 70);
  femur(-1.5, 0.95, -25, 0.36);
  femur(0.45, 1.95, 100, 0.34);
  for (const [bx, bz, d] of [
    [-0.8, 1.05, 30],
    [-1.75, 1.35, -50],
    [0.2, 2.15, 10],
    [-0.45, 0.8, 70],
  ] as Array<[number, number, number]>) {
    box([0.07, 0.03, 0.03], bonePaint, [bx, 0.015, bz], { rotation: [0, d, 0] });
  }

  return b.root;
}
