// Pixel-art dungeon props: an open treasure chest, two standing torches, three barrels and a bucket, a skeleton
// with loose bones, and a spike trap with an impaled skull, all on a flagstone slab.
// Everything uses one texel family (0.02 m, 0.03 m for the floor, 0.01 m for small metalwork) so the squares match.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { arc, catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { glow } from "../../../../kits/glow";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  snapColor,
  stepped,
  tileBox,
} from "../../../../kits/pixel";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon prop group: open treasure chest with a hinged lid and gold, two iron-banded standing torches with glowing flames, barrels and a bucket, a skeleton with loose bones, and a spike trap with an impaled skull, on a flagstone slab.",
  style: "pixel art",
  commit: "88fc1f0",
};

type V = [number, number, number];

const TEXEL = 0.02;
const F = 0.08; // top of the flagstone slab
const mod = (n: number, m: number) => ((n % m) + m) % m;
const snap = (c: string) => snapColor(c, 64);
const ramp = (list: string[]) => list.map(snap);

// ---------------------------------------------------------------------------------------------------------------
// Palette ramps, dark to light

const STONE = ramp(["#17151f", "#292636", "#3d3a4e", "#56526a", "#76718a", "#9a95ad"]);
const WOODR = ramp(["#1c1008", "#33200f", "#4b2e16", "#69421f", "#8b5a2b", "#ad7740"]);
const IRONR = ramp(["#14151b", "#262833", "#3f4250", "#5f6577", "#8a91a4", "#c0c7d4"]);
const GOLDR = ramp(["#38200a", "#774a12", "#b87c16", "#e8b025", "#ffd84a", "#fff2a0"]);
const BONER = ramp(["#38302a", "#695c4c", "#998b72", "#c8bc9e", "#e6ddc2", "#faf5e4"]);
const MOSS = ramp(["#14240f", "#22401a", "#356629", "#53923a"]);
const RUSTR = ramp(["#34190d", "#63290f", "#8f451b", "#b8662a"]);
const WATERR = ramp(["#0e2118", "#1b4429", "#2c7439", "#58b24a"]);
const BLOODR = ramp(["#2a0608", "#511012", "#7a1a1c"]);
const ROPE = ramp(["#4a3a22", "#7a6238", "#a68a52"]);

const hash2 = (x: number, y: number, s = 0) => {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers

const ONE = new THREE.Vector3(1, 1, 1);
const NOROT = new THREE.Quaternion();
function placed<G extends THREE.BufferGeometry>(
  geo: G,
  pos: THREE.Vector3,
  quat: THREE.Quaternion = NOROT,
  scale: THREE.Vector3 = ONE,
): G {
  geo.applyMatrix4(new THREE.Matrix4().compose(pos, quat, scale));
  return geo;
}
const eq = (x: number, y: number, z: number) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(x * DEG, y * DEG, z * DEG));
function merge(list: THREE.BufferGeometry[]) {
  const m = mergeGeometries(list);
  if (!m) throw new Error("merge failed");
  return m;
}
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

/** Flagstones or blocks in running-bond rows, mortar lines, bevels, a little moss in the joints. */
function stoneTile(w: number, h: number, rowH: number, wMin: number, wVar: number, seed: number) {
  return pixelTexture(w, h, (g) => {
    const rows = Math.ceil(h / rowH);
    for (let row = 0; row < rows; row++) {
      let x = -Math.floor(hash2(row, 0, seed) * wMin);
      let k = 0;
      while (x < w) {
        const bw = wMin + Math.floor(hash2(row, k, seed + 2) * wVar);
        const tone = 0.38 + hash2(row, k, seed + 4) * 0.34;
        for (let yy = 0; yy < rowH; yy++) {
          for (let xx = 0; xx < bw; xx++) {
            const px = x + xx;
            const py = row * rowH + yy;
            let v = tone + (hash2(px, py, seed + 6) - 0.5) * 0.2;
            let c: string;
            if (yy === 0 || xx === 0) c = hash2(px, py, seed + 8) > 0.85 ? MOSS[1] : STONE[0];
            else {
              if (yy === 1 || xx === 1) v += 0.22;
              else if (yy >= rowH - 2 || xx >= bw - 2) v -= 0.16;
              c = pick(STONE, v, bayer(px, py));
            }
            g.set(px, py, c);
          }
        }
        x += bw;
        k++;
      }
    }
    if (w >= 64) {
      for (let n = 0; n < 7; n++) {
        let x = Math.floor(hash2(n, 1, seed + 51) * w);
        let y = Math.floor(hash2(n, 2, seed + 51) * (h - 16));
        for (let s = 0; s < 15; s++) {
          g.set(x, y, STONE[0]);
          const r = hash2(n, s, seed + 52);
          x += r < 0.33 ? -1 : r < 0.66 ? 0 : 1;
          y += 1;
        }
      }
    }
  });
}

const FLOOR_TILE = stoneTile(128, 104, 13, 16, 14, 5);
const PLINTH_TILE = stoneTile(24, 10, 5, 8, 6, 17);

const WOOD_TILE = pixelTexture(48, 30, (g) => {
  for (let row = 0; row < 5; row++) {
    const tone = 0.42 + hash2(row, 0, 21) * 0.24;
    const cut = Math.floor(hash2(row, 1, 22) * 40) + 4;
    for (let yy = 0; yy < 6; yy++) {
      for (let x = 0; x < 48; x++) {
        const y = row * 6 + yy;
        let v = tone + (hash2(x >> 3, y, 23) - 0.5) * 0.16 + (hash2(x, y, 24) - 0.5) * 0.08;
        if (yy === 1) v += 0.14;
        else if (yy === 5) v -= 0.14;
        let c = pick(WOODR, v, bayer(x, y));
        if (yy === 0 || x === cut) c = WOODR[0];
        g.set(x, y, c);
      }
    }
    for (const nx of [cut - 3, cut + 3]) {
      g.set(nx, row * 6 + 2, IRONR[4]);
      g.set(nx, row * 6 + 3, IRONR[1]);
    }
  }
  for (const k of [
    { x: 12, y: 9 },
    { x: 34, y: 20 },
  ]) {
    g.set(k.x, k.y, WOODR[0]);
    g.set(k.x - 1, k.y, WOODR[1]);
    g.set(k.x + 1, k.y, WOODR[1]);
    g.set(k.x, k.y - 1, WOODR[1]);
    g.set(k.x, k.y + 1, WOODR[1]);
  }
});

const IRON_TILE = pixelTexture(24, 36, (g) => {
  g.fill((x, y) => {
    const px = x % 12;
    const py = y % 12;
    let v = 0.42 + (hash2(x, y, 31) - 0.5) * 0.18;
    if (px === 0 || py === 0) v -= 0.22;
    else if (px === 1 || py === 1) v += 0.16;
    if ((px === 3 || px === 9) && (py === 3 || py === 9)) v += 0.4;
    if ((px === 4 || px === 10) && (py === 4 || py === 10)) v -= 0.25;
    return pick(IRONR, v, bayer(x, y));
  });
  g.fill((x, y) => (hash2(x >> 1, y >> 1, 35) > 0.88 ? pick(RUSTR, hash2(x, y, 36), bayer(x, y)) : undefined));
});

const GOLD_TILE = pixelTexture(64, 64, (g) => {
  g.fill((x, y) => {
    const row = Math.floor(y / 5);
    const xo = x + (row % 2) * 2;
    const cx = Math.floor(xo / 5);
    const lx = (xo % 5) - 2;
    const ly = (y % 5) - 2;
    const d = lx * lx + ly * ly;
    if (d > 5) return GOLDR[0];
    const v = 0.55 + hash2(cx, row, 41) * 0.28 - d * 0.05 + (lx < 0 && ly < 0 ? 0.18 : 0) - (lx > 0 && ly > 0 ? 0.2 : 0);
    return pick(GOLDR, v, bayer(x, y));
  });
  g.fill((x, y) => (hash2(x, y, 43) > 0.975 ? GOLDR[5] : undefined));
});

const POLE_TILE = pixelTexture(6, 60, (g) => {
  g.fill((x, y) => {
    let v = 0.4 + hash2(x, y >> 3, 61) * 0.3 + (hash2(x, y, 62) - 0.5) * 0.1;
    if (x === 0) v -= 0.18;
    else if (x === 5) v -= 0.1;
    else if (x === 1) v += 0.1;
    return pick(WOODR, v, bayer(x, y));
  });
  for (const y0 of [8, 30, 46]) {
    for (let k = 0; k < 4; k++) {
      for (let x = 0; x < 6; x++) g.set(x, y0 + k, pick(ROPE, (x + k) % 2 ? 0.8 : 0.3, 0.5));
    }
  }
});

const LOCK_TILE = pixelArt(
  [
    "kkkkkkkkk",
    "khhhhhhdk",
    "khsssssdk",
    "khyYYYydk",
    "khYkkkYdk",
    "khYkkkYdk",
    "khyYkYydk",
    "khyYkYydk",
    "khyYYYydk",
    "khsssssdk",
    "kdddddddk",
    "kkkkkkkkk",
  ],
  { k: "#14161c", s: "#6a7186", h: "#a9b2c6", d: "#444a5c", y: "#c98e1a", Y: "#ffd84a" },
);

const FLAME = pixelArt(
  [
    ".....r......",
    ".....ro.....",
    "....rooo....",
    "....rooor...",
    "...rooyoo...",
    "...roooyor..",
    "..rooyyyoo..",
    "..rooyyyoor.",
    "..rooyywyoo.",
    ".rooyywwyoor",
    ".rooyywwyoor",
    ".rooyywwyoor",
    ".rooyyywyoor",
    "..rooyyyyoo.",
    "..rrooyyoor.",
    "...rrooorr..",
  ],
  { r: "#d2331a", o: "#ff7a1c", y: "#ffc21f", w: "#fff4b0" },
);

const LABEL = pixelArt(
  [
    "..wwwww..",
    ".wwwwwww.",
    ".wkwwwkw.",
    ".wkwwwkw.",
    "..wwkww..",
    "..wwwww..",
    "w.wkwkw.w",
    ".wwwwwww.",
    "w.......w",
  ],
  { w: "#e8dfc4", k: "#2a1a10" },
);

const PLATE = pixelTexture(44, 44, (g) => {
  g.fill((x, y) => {
    let v = 0.3 + (hash2(x, y, 81) - 0.5) * 0.14;
    const e = Math.min(x, y, 43 - x, 43 - y);
    if (e === 0) v -= 0.22;
    else if (e === 1) v += x < 22 && y < 22 ? 0.2 : -0.1;
    return pick(IRONR, v, bayer(x, y));
  });
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const cx = 6 + 8 * i;
      const cy = 6 + 8 * j;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ring = Math.max(Math.abs(dx), Math.abs(dy)) === 2;
          g.set(cx + dx, cy + dy, ring ? (dx > 0 && dy > 0 ? IRONR[3] : IRONR[1]) : "#07070a");
        }
      }
    }
  }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.set(10 + 8 * i, 10 + 8 * j, IRONR[4]);
  g.fill((x, y) => {
    const nearHole = (x % 8 === 6 || x % 8 === 5 || x % 8 === 7) && (y % 8 === 6 || y % 8 === 5 || y % 8 === 7);
    if (nearHole) return undefined;
    return hash2(x >> 1, y >> 1, 83) > 0.9 ? pick(BLOODR, hash2(x, y, 84), 0.5) : undefined;
  });
  for (const p of [
    { x: 3, y: 3 },
    { x: 39, y: 3 },
    { x: 3, y: 39 },
    { x: 39, y: 39 },
  ]) {
    g.set(p.x, p.y, IRONR[5]);
    g.set(p.x + 1, p.y, IRONR[4]);
    g.set(p.x, p.y + 1, IRONR[4]);
    g.set(p.x + 1, p.y + 1, IRONR[1]);
  }
});

const TRAPSTONE = pixelTexture(56, 10, (g) => {
  g.fill((x, y) => {
    const bx = x % 14;
    let v = 0.36 + hash2(Math.floor(x / 14), 0, 91) * 0.2 + (hash2(x, y, 92) - 0.5) * 0.14;
    if (bx === 0) v = 0.05;
    else if (y === 0 || bx === 1) v += 0.2;
    else if (y === 9) v -= 0.18;
    return pick(STONE, v, bayer(x, y));
  });
  for (let k = 0; k < 4; k++) {
    const cx = 7 + 14 * k;
    for (let d = 0; d < 3; d++) {
      g.set(cx - 2 + d, 3 + d, "#6a1c24");
      g.set(cx + 2 - d, 3 + d, "#6a1c24");
    }
  }
});

const PUDDLE = pixelTexture(24, 16, (g) => {
  g.fill((x, y) => {
    const wob = (hash2(x >> 1, y >> 1, 95) - 0.5) * 0.35;
    const d = ((x - 11.5) / 11) ** 2 + ((y - 7.5) / 7) ** 2 + wob;
    if (d > 1) return undefined;
    return pick(WATERR, 0.3 + 0.5 * (1 - d) + (hash2(x, y, 96) > 0.93 ? 0.35 : 0), bayer(x, y));
  });
});

const POOL = pixelTexture(40, 40, (g) => {
  g.fill((x, y) => {
    const v = 1 - Math.hypot(x - 19.5, y - 19.5) / 20;
    if (v <= bayer(x, y) * 0.9) return undefined;
    return pick(["#b85a14", "#e8801e", "#ffb040", "#ffe08a"], v, 0.5);
  });
});

const SK = skinLayout({ cranium: [8, 7, 8], jaw: [6, 3, 6] });
const SKULL_SHEET = pixelTexture(SK.size[0], SK.size[1], (g) => {
  for (const faces of Object.values(SK.faces)) {
    for (const rect of Object.values(faces)) {
      g.fill(
        (x, y, w, h) =>
          pick(
            BONER,
            0.62 + 0.22 * (1 - y / h) - 0.1 * (x / w) + (hash2(x + rect[0], y + rect[1], 71) - 0.5) * 0.16,
            bayer(x + rect[0], y + rect[1]),
          ),
        rect,
      );
    }
  }
  const c = SK.faces.cranium.pz;
  for (const e of [
    [1, 2],
    [2, 2],
    [1, 3],
    [2, 3],
    [5, 2],
    [6, 2],
    [5, 3],
    [6, 3],
    [3, 5],
    [4, 5],
    [3, 4],
  ])
    g.set(c[0] + e[0], c[1] + e[1], "#120c08");
  g.set(c[0] + 4, c[1], BONER[1]);
  g.set(c[0] + 5, c[1] + 1, BONER[1]);
  for (let dx = 1; dx <= 6; dx++) g.set(c[0] + dx, c[1] + 6, dx % 2 ? BONER[5] : BONER[1]);
  const j = SK.faces.jaw.pz;
  for (let dx = 0; dx < 6; dx++) g.set(j[0] + dx, j[1], dx % 2 ? BONER[1] : BONER[5]);
});

// ---------------------------------------------------------------------------------------------------------------
// Paints (square cells)

const IRON_P = cellPaint(
  0.01,
  (c) => {
    if (noise(c.at, 0.09, 5) > 0.72) return c.pick(RUSTR, 0.2 + 0.7 * c.random(6));
    const spark = c.random(4) > 0.97 ? 0.35 : 0;
    return c.pick(IRONR, 0.36 + 0.24 * c.n.y + (c.random(3) - 0.5) * 0.26 + spark);
  },
  { dither: true },
);
const BONE_P = cellPaint(
  0.01,
  (c) =>
    c.pick(
      BONER,
      0.55 + 0.3 * c.n.y + (c.random(2) - 0.5) * 0.22 - (noise(c.at, 0.05, 9) > 0.7 ? 0.2 : 0),
    ),
  { dither: true },
);
const GOLD_P = cellPaint(0.01, (c) => c.pick(GOLDR, 0.5 + 0.3 * c.n.y + (c.random(1) - 0.5) * 0.3), { dither: true });
const STONE_P = cellPaint(0.02, (c) => c.pick(STONE, 0.45 + 0.2 * c.n.y + (c.random(1) - 0.5) * 0.3), {
  dither: true,
});
const WATER_P = cellPaint(
  0.02,
  (c) => c.pick(WATERR, 0.45 + 0.4 * (noise(c.at, 0.1, 2) - 0.5) + (c.random(5) > 0.96 ? 0.4 : 0)),
  { dither: true },
);
const MOSS_P = cellPaint(0.03, (c) => c.pick(MOSS, 0.3 + 0.7 * noise(c.at, 0.2, 3) + (c.random(2) - 0.5) * 0.3), {
  dither: true,
});
const LID_P = cellPaint(
  0.02,
  (c) => {
    if (c.axis !== 0 && mod(c.u, 6) === 0) return c.pick(WOODR, 0.08);
    const plank = Math.floor(c.u / 6);
    return c.pick(
      WOODR,
      0.42 + 0.26 * hash2(plank, 0, 77) + 0.16 * c.n.y + (c.random(2) - 0.5) * 0.2 + (c.axis === 0 ? -0.08 : 0),
    );
  },
  { dither: true },
);

/** Stave and plank wood for anything round about `axis` through `base` (barrels, buckets). */
function woodPaint(base: THREE.Vector3, axis: THREE.Vector3, seed: number, staves: number) {
  const A = axis.clone().normalize();
  const side = Math.abs(A.y) > 0.9 ? v3(1, 0, 0) : v3(0, 1, 0).cross(A).normalize();
  const third = A.clone().cross(side);
  return cellPaint(
    0.02,
    (c) => {
      const v = c.at.clone().sub(base);
      const along = v.dot(A);
      let tone: number;
      if (Math.abs(c.n.dot(A)) > 0.8) {
        const q = Math.round(v.dot(side) / 0.02);
        tone = mod(q, 6) === 0 ? 0.08 : 0.42 + 0.3 * hash2(Math.floor(q / 6), 0, seed) + 0.18 * c.random(1);
      } else {
        const radial = v.clone().addScaledVector(A, -along).normalize();
        const ang = Math.atan2(radial.dot(third), radial.dot(side));
        const f = ((ang + Math.PI) / (2 * Math.PI)) * staves;
        const idx = Math.floor(f);
        const fr = f - idx;
        tone = fr < 0.1 ? 0.06 : 0.45 + 0.28 * hash2(idx, 0, seed) + 0.14 * (c.random(2) - 0.5) + (fr < 0.22 ? 0.08 : 0);
        if (c.n.dot(radial) < -0.2) tone *= 0.5;
        if (along < 0.07) tone -= 0.15;
        if (c.n.y > 0.55 && noise(c.at, 0.12, seed) > 0.64) return c.pick(MOSS, 0.4 + 0.5 * noise(c.at, 0.05, seed + 1));
      }
      return c.pick(WOODR, tone + 0.15 * c.n.y);
    },
    { dither: true },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Layout constants

// Chest (axis-aligned, faces +Z), lid hinged along its back edge.
const CX = -0.55;
const CZ = 0.38;
const CW = 0.92;
const CD = 0.54;
const CH = 0.4;
const CT = 0.05;
const TOP = F + CH;

// Spike trap.
const TX = 0.95;
const TZ = 0.3;

// Skeleton frame (local x runs along the spine, head toward -x).
const SKX = 0.62;
const SKZ = 1.15;
const SKY = 10;
const skc = Math.cos(SKY * DEG);
const sks = Math.sin(SKY * DEG);
const sk = (lx: number, ly: number, lz: number) => v3(SKX + lx * skc + lz * sks, F + ly, SKZ - lx * sks + lz * skc);

// ---------------------------------------------------------------------------------------------------------------
// Builder, joints and part helpers

const b = createBuilder({ name: "pixelDungeonProps", paintSize: 2048 });
const base = b.joint("base", { at: [0, 0, 0] });
const lid = b.joint("chestLid", { parent: base, at: [CX, TOP, CZ - CD / 2], dir: [0, 0, 1], role: "hinge" });

/** A textured tile box whose faces show the tile at `texel` meters per pixel. */
function tbox(
  size: V,
  tile: THREE.Texture,
  texel: number,
  at: V,
  o: { seed?: number; step?: [number, number]; bone?: Joint; rot?: V } = {},
) {
  const geo =
    o.seed !== undefined
      ? tileBox(size, tile, texel, { rand: rng(o.seed), step: o.step ?? [1, 1] })
      : tileBox(size, tile, texel);
  const opts: PartOptions = { texture: tile, bone: o.bone ?? base, at };
  if (o.rot) opts.rotation = o.rot;
  return b.part(geo, "#ffffff", opts);
}

/** A flat-coloured or painted box. */
function pbox(size: V, color: string | Paint, at: V, o: { bone?: Joint; rot?: V } = {}) {
  const opts: PartOptions = { bone: o.bone ?? base, at };
  if (o.rot) opts.rotation = o.rot;
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, opts);
}

/** A bone from `a` to `e`: a shaft with two lobed knobs at each end, as a geometry in model space. */
function boneGeo(a: THREE.Vector3, e: THREE.Vector3, r: number) {
  const dir = e.clone().sub(a);
  const len = dir.length();
  const dn = dir.clone().normalize();
  const q = aim(dn);
  const qx = v3(1, 0, 0).applyQuaternion(q);
  const parts: THREE.BufferGeometry[] = [];
  parts.push(placed(new THREE.BoxGeometry(r * 2, len, r * 2), a.clone().lerp(e, 0.5), q));
  const lobe = 1.7 * r;
  for (const [end, inward] of [
    [a, 1],
    [e, -1],
  ] as const) {
    for (const s of [1, -1]) {
      const p = end.clone().addScaledVector(qx, s * 0.9 * r).addScaledVector(dn, inward * 0.3 * r);
      parts.push(placed(new THREE.BoxGeometry(lobe, lobe, lobe), p, q));
    }
  }
  return parts;
}

// ---------------------------------------------------------------------------------------------------------------
// Floor slab, moss, rubble, light pools

b.part(tileBox([3.6, F, 3.0], FLOOR_TILE, 0.03), "#ffffff", { texture: FLOOR_TILE, bone: base, at: [0, F / 2, 0] });

for (const m of [
  { x: -1.1, z: -1.3, sp: [[0, 4], [0, 6], [1, 8], [1, 7], [2, 5]] },
  { x: 1.05, z: -0.7, sp: [[1, 5], [0, 7], [0, 8], [2, 7], [3, 6]] },
  { x: -1.6, z: 0.95, sp: [[0, 5], [1, 6], [0, 6], [1, 4]] },
]) {
  b.extrude(
    stepped(
      m.sp.map((s): [number, number] => [s[0], s[1]]),
      0.03,
      { rows: true },
    ),
    { at: [m.x, F + 0.004, m.z], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.01, color: MOSS_P, bone: base },
  );
}

const rubR = rng(31);
const rub: THREE.BufferGeometry[] = [];
for (const c of [
  { x: 0.15, z: 0.25 },
  { x: -1.4, z: 0.95 },
  { x: 1.3, z: -0.65 },
  { x: -1.55, z: 0.5 },
]) {
  for (let i = 0; i < 4; i++) {
    const s = 0.03 + rubR() * 0.05;
    rub.push(
      placed(
        new THREE.BoxGeometry(s * 1.4, s, s * 1.2),
        v3(c.x + (rubR() - 0.5) * 0.3, F + s / 2 - 0.004, c.z + (rubR() - 0.5) * 0.3),
        eq(rubR() * 20, rubR() * 360, rubR() * 20),
      ),
    );
  }
}
b.part(merge(rub), STONE_P, { bone: base, at: [0, 0, 0], flat: true });

// ---------------------------------------------------------------------------------------------------------------
// Chest

const Y0 = F;
// Body: floor and four walls.
tbox([CW, 0.04, CD], WOOD_TILE, TEXEL, [CX, Y0 + 0.02, CZ], { seed: 101, step: [1, 6] });
for (const s of [1, -1]) {
  tbox([CW, CH - 0.04, CT], WOOD_TILE, TEXEL, [CX, Y0 + 0.22, CZ + s * (CD / 2 - CT / 2)], {
    seed: 102 + s,
    step: [1, 6],
  });
  tbox([CT, CH - 0.04, CD - 2 * CT], WOOD_TILE, TEXEL, [CX + s * (CW / 2 - CT / 2), Y0 + 0.22, CZ], {
    seed: 110 + s,
    step: [1, 6],
  });
}

// Gold heap in four stepped layers.
const heap: Array<{ size: V; y: number }> = [
  { size: [0.8, 0.1, 0.38], y: Y0 + 0.09 },
  { size: [0.62, 0.08, 0.3], y: Y0 + 0.18 },
  { size: [0.42, 0.07, 0.22], y: Y0 + 0.255 },
  { size: [0.22, 0.05, 0.12], y: Y0 + 0.315 },
];
for (const [i, h] of heap.entries())
  glow(tbox(h.size, GOLD_TILE, 0.012, [CX, h.y, CZ], { seed: 120 + i }), 0.45);

// Gems.
for (const g of [
  { c: "#e0243c", at: [CX - 0.17, Y0 + 0.31, CZ + 0.03] as V, rot: [15, 35, 10] as V },
  { c: "#2a6cf0", at: [CX + 0.16, Y0 + 0.31, CZ - 0.04] as V, rot: [25, 10, 30] as V },
  { c: "#2ad06c", at: [CX - 0.27, Y0 + 0.24, CZ - 0.06] as V, rot: [10, 60, 20] as V },
])
  glow(
    b.part(new THREE.BoxGeometry(0.045, 0.045, 0.045), g.c, { bone: base, at: g.at, rotation: g.rot, flat: true }),
    1.4,
  );

// Chalice on the heap.
b.lathe(
  [
    [0, 0],
    [0.04, 0],
    [0.04, 0.012],
    [0.012, 0.03],
    [0.012, 0.07],
    [0.05, 0.09],
    [0.055, 0.13],
    [0.045, 0.13],
    [0.03, 0.1],
    [0, 0.1],
  ],
  { at: [CX + 0.02, Y0 + 0.34, CZ + 0.01], segments: 8, color: GOLD_P, bone: base },
);

// Coins on the heap and spilled on the floor.
const coinR = rng(7);
const coinsA: THREE.BufferGeometry[] = [];
const coinsB: THREE.BufferGeometry[] = [];
function coin(x: number, y: number, z: number, tilt: number) {
  const g = new THREE.CylinderGeometry(0.034, 0.034, 0.009, 8, 1);
  placed(g, v3(x, y, z), eq((coinR() - 0.5) * tilt, coinR() * 360, (coinR() - 0.5) * tilt));
  (coinR() > 0.5 ? coinsA : coinsB).push(g);
}
for (const [dx, dz] of [
  [-0.05, 0.01],
  [0.06, -0.02],
  [0.01, 0.04],
])
  coin(CX + dx, Y0 + 0.344, CZ + dz, 10);
for (const [dx, dz] of [
  [-0.15, -0.05],
  [0.13, 0.06],
  [0.17, -0.07],
  [-0.12, 0.08],
])
  coin(CX + dx, Y0 + 0.294, CZ + dz, 12);
for (const [dx, dz] of [
  [-0.25, 0.1],
  [0.26, -0.1],
  [0.24, 0.11],
  [-0.27, -0.12],
])
  coin(CX + dx, Y0 + 0.224, CZ + dz, 14);
for (const [dx, dz] of [
  [-0.36, 0.1],
  [0.35, -0.08],
])
  coin(CX + dx, Y0 + 0.144, CZ + dz, 14);
for (let i = 0; i < 16; i++) coin(CX - 0.35 + coinR() * 0.8, F + 0.006, CZ + 0.34 + coinR() * 0.4, 14);
for (let k = 0; k < 4; k++) coin(CX + 0.3, F + 0.005 + k * 0.009, CZ + 0.5, 4);
glow(b.part(merge(coinsA), "#e8b025", { bone: base, at: [0, 0, 0], flat: true }), 0.5);
glow(b.part(merge(coinsB), "#ffe27a", { bone: base, at: [0, 0, 0], flat: true }), 0.5);

// Metalwork on the body: corner posts, front and back straps, lock, handles, hinges.
for (const sx of [1, -1])
  for (const sz of [1, -1])
    tbox([0.07, CH, 0.07], IRON_TILE, 0.01, [CX + sx * (CW / 2 - 0.02), Y0 + CH / 2, CZ + sz * (CD / 2 - 0.02)]);
for (const sz of [1, -1])
  for (const dx of [-0.25, 0.25])
    tbox([0.07, CH - 0.06, 0.012], IRON_TILE, 0.01, [CX + dx, Y0 + 0.2, CZ + sz * (CD / 2 + 0.006)]);
tbox([0.135, 0.18, 0.02], LOCK_TILE, 0.015, [CX, TOP - 0.08, CZ + CD / 2 + 0.01]);
for (const s of [1, -1]) {
  tbox([0.012, 0.07, 0.05], IRON_TILE, 0.01, [CX + s * (CW / 2 + 0.006), Y0 + 0.28, CZ]);
  b.part(new THREE.TorusGeometry(0.04, 0.009, 4, 8), IRON_P, {
    bone: base,
    at: [CX + s * (CW / 2 + 0.018), Y0 + 0.25, CZ],
    rotation: [0, 90, 0],
    flat: true,
  });
}
for (const dx of [-0.3, 0.3]) {
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 6), IRON_P, {
    bone: lid,
    at: [CX + dx, TOP, CZ - CD / 2 - 0.01],
    dir: [1, 0, 0],
  });
  tbox([0.1, 0.09, 0.012], IRON_TILE, 0.01, [CX + dx, TOP - 0.05, CZ - CD / 2 - 0.006]);
}

// Lid: stepped dome with iron bands, hasp.
const LID_COLS = 27;
const lidH = Array.from({ length: LID_COLS }, (_, i) => 5 + Math.round(3 * Math.sin((Math.PI * (i + 0.5)) / LID_COLS)));
const LID_OUTLINE = stepped(
  lidH.map((h): [number, number] => [0, h]),
  0.02,
);
const BAND_OUTLINE = stepped(
  [lidH[0] + 1, ...lidH.map((h) => h + 1), lidH[LID_COLS - 1] + 1].map((h): [number, number] => [0, h]),
  0.02,
  { start: -1 },
);
b.extrude(LID_OUTLINE, {
  at: [CX, TOP, CZ - CD / 2],
  x: [0, 0, 1],
  thickness: CW + 0.02,
  color: LID_P,
  bone: lid,
});
for (const band of [
  { dx: -0.3, w: 0.07 },
  { dx: 0.3, w: 0.07 },
  { dx: -0.445, w: 0.07 },
  { dx: 0.445, w: 0.07 },
])
  b.extrude(BAND_OUTLINE, {
    at: [CX + band.dx, TOP, CZ - CD / 2],
    x: [0, 0, 1],
    thickness: band.w,
    color: IRON_P,
    bone: lid,
  });
tbox([0.07, 0.11, 0.016], IRON_TILE, 0.01, [CX, TOP + 0.05, CZ + CD / 2 + 0.008], { bone: lid });

// ---------------------------------------------------------------------------------------------------------------
// Barrels and bucket

const BARREL_R: Array<[number, number]> = [
  [0, 0.29],
  [0.05, 0.305],
  [0.2, 0.34],
  [0.43, 0.37],
  [0.66, 0.34],
  [0.81, 0.305],
  [0.86, 0.29],
];
function barrelRadius(y: number) {
  for (let k = 0; k < BARREL_R.length - 1; k++) {
    const [y0, r0] = BARREL_R[k];
    const [y1, r1] = BARREL_R[k + 1];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return BARREL_R[BARREL_R.length - 1][1];
}

function barrel(
  bottom: THREE.Vector3,
  axis: THREE.Vector3,
  o: { open?: boolean; deep?: boolean; liquid?: boolean; seed: number },
) {
  const A = axis.clone().normalize();
  const pt = (y: number) => bottom.clone().addScaledVector(A, y);
  const outer = BARREL_R.map(([y, r]): [number, number] => [r, y]);
  let top: Array<[number, number]>;
  if (!o.open)
    top = [
      [0.255, 0.86],
      [0.255, 0.83],
      [0, 0.83],
    ];
  else if (o.deep)
    top = [
      [0.25, 0.86],
      [0.28, 0.6],
      [0.285, 0.3],
      [0.26, 0.1],
      [0, 0.1],
    ];
  else
    top = [
      [0.25, 0.86],
      [0.27, 0.7],
      [0, 0.7],
    ];
  const outline: OutlinePoint[] = [[0, 0], ...outer, ...top];
  const body = b.lathe(outline, {
    at: bottom,
    axis: A,
    segments: 10,
    color: woodPaint(bottom, A, o.seed, 10),
    bone: base,
  });
  for (const y of o.open ? [0.08, 0.3, 0.6] : [0.08, 0.28, 0.58, 0.78]) {
    const r = barrelRadius(y);
    b.lathe(
      [
        [r - 0.025, -0.028],
        [r + 0.012, -0.028],
        [r + 0.012, 0.028],
        [r - 0.025, 0.028],
      ],
      { at: pt(y), axis: A, segments: 10, color: IRON_P, bone: base },
    );
  }
  if (o.liquid)
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.012, 10), WATER_P, { bone: base, at: pt(0.72), dir: A });
  return body;
}

// Closed barrel with a tap and a chalk brand.
const B1 = v3(-1.1, F, -0.45);
const body1 = barrel(B1, v3(0, 1, 0), { seed: 201 });
b.decal(body1, LABEL, { at: [B1.x, F + 0.43, B1.z + 0.38], dir: [0, 0, 1], size: [0.2, 0.2], bone: base });
b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), IRON_P, {
  bone: base,
  at: [B1.x + 0.14, F + 0.2, B1.z + barrelRadius(0.2) + 0.03],
  dir: [0, 0, 1],
});
pbox([0.035, 0.07, 0.02], WOODR[4], [B1.x + 0.14, F + 0.25, B1.z + barrelRadius(0.2) + 0.07]);

// Open barrel brimming with green water.
const B2 = v3(-0.35, F, -0.62);
const body2 = barrel(B2, v3(0, 1, 0), { seed: 202, open: true, liquid: true });
b.decal(body2, LABEL, {
  at: [B2.x, F + 0.43, B2.z + 0.38],
  dir: [0, 0, 1],
  size: [0.2, 0.2],
  mirror: true,
  bone: base,
});

// Tipped barrel spilling a puddle.
const TA = v3(0.5, 0, 0.866).normalize();
const TC = v3(0.5, F + 0.365, -0.85);
barrel(TC.clone().addScaledVector(TA, -0.43), TA, { seed: 203, open: true, deep: true });
b.part(new THREE.PlaneGeometry(0.9, 0.6), "#ffffff", {
  texture: PUDDLE,
  bone: base,
  at: TC.clone().addScaledVector(TA, 0.63).setY(F + 0.004),
  dir: [0, 1, 0],
  up: TA,
  axis: "z",
});
for (const s of [1, -1])
  pbox([0.08, 0.06, 0.1], WOODR[3], TC.clone().add(v3(-TA.z * s * 0.3, 0, TA.x * s * 0.3)).setY(F + 0.03).toArray() as V, {
    rot: [0, Math.atan2(TA.x, TA.z) / DEG, 0],
  });

// Bucket by the chest.
const BK = v3(-0.62, F, -0.1);
const BUCKET: OutlinePoint[] = [
  [0, 0],
  [0.105, 0],
  [0.14, 0.2],
  [0.125, 0.2],
  [0.095, 0.03],
  [0, 0.03],
];
b.lathe(BUCKET, { at: BK, segments: 8, color: woodPaint(BK, v3(0, 1, 0), 204, 8), bone: base });
for (const y of [0.05, 0.15]) {
  const r = 0.105 + 0.035 * (y / 0.2);
  b.lathe(
    [
      [r - 0.015, -0.014],
      [r + 0.008, -0.014],
      [r + 0.008, 0.014],
      [r - 0.015, 0.014],
    ],
    { at: [BK.x, F + y, BK.z], segments: 8, color: IRON_P, bone: base },
  );
}
b.part(new THREE.CylinderGeometry(0.118, 0.118, 0.01, 8), WATER_P, { bone: base, at: [BK.x, F + 0.17, BK.z] });
b.sweep(arc([BK.x, F + 0.2, BK.z], [BK.x + 0.14, F + 0.2, BK.z], [0, 0, 1], 180), 0.009, IRON_P, {
  sides: 4,
  bone: base,
});

// ---------------------------------------------------------------------------------------------------------------
// Torches

const sparkR = rng(55);
function torch(px: number, pz: number, seed: number) {
  const P = (x: number, y: number, z: number): V => [px + x, F + y, pz + z];
  tbox([0.36, 0.1, 0.36], PLINTH_TILE, TEXEL, P(0, 0.05, 0), { seed });
  tbox([0.26, 0.08, 0.26], PLINTH_TILE, TEXEL, P(0, 0.14, 0), { seed: seed + 1 });
  tbox([0.15, 0.07, 0.15], IRON_TILE, 0.01, P(0, 0.215, 0));
  tbox([0.09, 0.85, 0.09], POLE_TILE, 0.015, P(0, 0.675, 0));
  for (const y of [0.32, 0.52, 0.72, 1.04]) tbox([0.115, 0.04, 0.115], IRON_TILE, 0.01, P(0, y, 0));
  for (const [dx, dz] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ])
    b.rod(P(dx * 0.045, 0.66, dz * 0.045), P(dx * 0.13, 0.18, dz * 0.13), 0.013, IRON_P, { sides: 4, bone: base });
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.12, 0.11],
      [0.14, 0.16],
      [0.115, 0.16],
      [0.04, 0.07],
      [0, 0.07],
    ],
    { at: P(0, 1.1, 0), segments: 8, color: IRON_P, bone: base },
  );
  pbox([0.1, 0.2, 0.1], "#2b1d14", P(0, 1.2, 0));
  for (const y of [1.17, 1.24]) pbox([0.108, 0.018, 0.108], "#6a4a2c", P(0, y, 0));
  glow(pbox([0.09, 0.03, 0.09], "#ff6a14", P(0, 1.31, 0)), 1.3);
  pbox([0.05, 0.14, 0.012], "#a8262e", P(0.02, 0.92, 0.05));
  pbox([0.03, 0.1, 0.012], "#7a1a22", P(-0.02, 0.9, 0.052));
  glow(
    b.cards([frame(P(0, 1.3, 0), [0, 1, 0]), frame(P(0.045, 1.29, -0.03), [0, 1, 0]), frame(P(-0.04, 1.29, 0.04), [0, 1, 0])], FLAME, {
      size: [0.24, 0.34],
      vary: 0.25,
      spin: 35,
      cross: true,
      rng: rng(seed + 7),
      bone: base,
    }),
    1.6,
  );
  const sparksA: THREE.BufferGeometry[] = [];
  const sparksB: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const s = 0.014 + sparkR() * 0.012;
    const g = placed(
      new THREE.BoxGeometry(s, s, s),
      v3(px + (sparkR() - 0.5) * 0.3, F + 1.5 + sparkR() * 0.45, pz + (sparkR() - 0.5) * 0.3),
      eq(sparkR() * 90, sparkR() * 90, 0),
    );
    (i % 2 ? sparksA : sparksB).push(g);
  }
  glow(b.part(merge(sparksA), "#ffb030", { bone: base, at: [0, 0, 0], flat: true }), 1.4);
  glow(b.part(merge(sparksB), "#ffe070", { bone: base, at: [0, 0, 0], flat: true }), 1.4);
  glow(
    b.part(new THREE.PlaneGeometry(1.5, 1.5), "#ffffff", {
      texture: POOL,
      bone: base,
      at: [px, F + 0.004, pz],
      dir: [0, 1, 0],
      axis: "z",
    }),
    0.6,
  );
}
torch(-1.55, -1.05, 301);
torch(1.55, -1.05, 303);

// ---------------------------------------------------------------------------------------------------------------
// Skulls

function skull(x: number, ybase: number, z: number, yaw: number, drop: number, eyes: boolean) {
  const yr = yaw * DEG;
  const rot = (lx: number, lz: number): [number, number] => [x + lx * Math.cos(yr) + lz * Math.sin(yr), z - lx * Math.sin(yr) + lz * Math.cos(yr)];
  b.part(skinBox(SKULL_SHEET, SK.faces.cranium, TEXEL), "#ffffff", {
    texture: SKULL_SHEET,
    bone: base,
    at: [x, ybase + 0.125, z],
    rotation: [0, yaw, 0],
  });
  const [jx, jz] = rot(0, 0.012);
  b.part(skinBox(SKULL_SHEET, SK.faces.jaw, TEXEL), "#ffffff", {
    texture: SKULL_SHEET,
    bone: base,
    at: [jx, ybase + 0.03 - drop, jz],
    rotation: [0, yaw, 0],
  });
  if (eyes)
    for (const s of [1, -1]) {
      const [ex, ez] = rot(s * 0.04, 0.083);
      glow(
        b.part(new THREE.BoxGeometry(0.024, 0.024, 0.01), "#ff3018", {
          bone: base,
          at: [ex, ybase + 0.135, ez],
          rotation: [0, yaw, 0],
        }),
        1.6,
      );
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Spike trap

for (const s of [1, -1]) {
  tbox([1.12, 0.06, 0.12], TRAPSTONE, TEXEL, [TX, F + 0.03, TZ + s * 0.5]);
  tbox([0.88, 0.06, 0.12], TRAPSTONE, TEXEL, [TX + s * 0.5, F + 0.03, TZ], { rot: [0, 90, 0] });
  for (const t of [1, -1]) tbox([0.13, 0.09, 0.13], IRON_TILE, 0.01, [TX + s * 0.5, F + 0.045, TZ + t * 0.5]);
}
tbox([0.88, 0.03, 0.88], PLATE, TEXEL, [TX, F + 0.015, TZ]);

const SPIKE_LEN = [
  [0.05, 0.22, 0.3, 0.22, 0.05],
  [0.22, 0.05, 0.22, 0.05, 0.22],
  [0.3, 0.22, 0.42, 0.22, 0.3],
  [0.22, 0.05, 0.22, 0.05, 0.22],
  [0.05, 0.22, 0.3, 0.22, 0.05],
];
const BLOODY = new Set(["1,2", "2,1", "2,3", "3,2"]);
const collars: THREE.BufferGeometry[] = [];
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    const x = TX + (i - 2) * 0.16;
    const z = TZ + (j - 2) * 0.16;
    collars.push(placed(new THREE.BoxGeometry(0.08, 0.012, 0.08), v3(x, F + 0.036, z)));
    const bloody = BLOODY.has(`${i},${j}`);
    b.spike([x, F + 0.03, z], [0, 1, 0], SPIKE_LEN[i][j], 0.03, {
      sides: 4,
      smooth: false,
      bone: base,
      bands: bloody
        ? [
            [0.45, "#50566a"],
            [0.78, "#8a1a1a"],
            [1, "#c93030"],
          ]
        : [
            [0.4, "#3c404c"],
            [0.8, "#7c8498"],
            [1, "#c4ccdc"],
          ],
    });
  }
}
b.part(merge(collars), IRON_P, { bone: base, at: [0, 0, 0], flat: true });
skull(TX, F + 0.33, TZ, 20, 0.04, true);

// ---------------------------------------------------------------------------------------------------------------
// Skeleton and loose bones

skull(sk(-0.62, 0, 0).x, F, sk(-0.62, 0, 0).z, SKY + 25, 0.012, false);

const yawQ = eq(0, SKY, 0);
const vert: THREE.BufferGeometry[] = [];
for (let lx = -0.52; lx <= 0.27; lx += 0.042) {
  vert.push(placed(new THREE.BoxGeometry(0.036, 0.034, 0.04), sk(lx, 0.02, 0), yawQ));
  vert.push(placed(new THREE.BoxGeometry(0.014, 0.024, 0.03), sk(lx, 0.045, 0), yawQ));
  vert.push(placed(new THREE.BoxGeometry(0.014, 0.012, 0.085), sk(lx, 0.02, 0), yawQ));
}
b.part(merge(vert), BONE_P, { bone: base, at: [0, 0, 0], flat: true });

const RIB_K = [0.7, 0.85, 1, 1, 0.95, 0.85, 0.7];
for (let i = 0; i < 7; i++) {
  for (const s of [1, -1]) {
    if (i === 2 && s === 1) continue;
    const lx = -0.37 + i * 0.045;
    const k = RIB_K[i];
    let pts = [
      sk(lx, 0.025, s * 0.03),
      sk(lx, 0.07, s * 0.1 * k),
      sk(lx, 0.125, s * 0.13 * k),
      sk(lx, 0.17, s * 0.09 * k),
      sk(lx, 0.19, s * 0.03 * k),
    ];
    if (i === 5 && s === -1) pts = pts.slice(0, 3);
    b.sweep(catmull(pts), [0.014, 0.01], BONE_P, { sides: 5, bone: base });
  }
}
b.rod(sk(-0.35, 0.2, 0), sk(-0.09, 0.2, 0), [0.02, 0.014], BONE_P, { sides: 5, bone: base });

// Pelvis.
const pel: THREE.BufferGeometry[] = [];
for (const s of [1, -1]) {
  pel.push(placed(new THREE.BoxGeometry(0.09, 0.05, 0.12), sk(0.33, 0.05, s * 0.085), yawQ.clone().multiply(eq(s * 30, 0, 0))));
}
pel.push(placed(new THREE.BoxGeometry(0.07, 0.04, 0.07), sk(0.3, 0.03, 0), yawQ));
pel.push(placed(new THREE.BoxGeometry(0.05, 0.04, 0.1), sk(0.39, 0.025, 0), yawQ));
b.part(merge(pel), BONE_P, { bone: base, at: [0, 0, 0], flat: true });

// Limbs.
const limbs: THREE.BufferGeometry[] = [];
const boneRun: Array<[THREE.Vector3, THREE.Vector3, number]> = [
  [sk(0.34, 0.03, -0.07), sk(0.7, 0.03, -0.1), 0.014],
  [sk(0.7, 0.03, -0.1), sk(0.95, 0.03, -0.2), 0.012],
  [sk(0.34, 0.03, 0.07), sk(0.62, 0.03, 0.17), 0.014],
  [sk(0.62, 0.03, 0.17), sk(0.92, 0.03, 0.1), 0.012],
  [sk(-0.34, 0.03, -0.17), sk(-0.12, 0.03, -0.24), 0.011],
  [sk(-0.12, 0.03, -0.24), sk(0.08, 0.03, -0.2), 0.009],
  [sk(-0.34, 0.03, 0.17), sk(-0.25, 0.03, 0.26), 0.011],
  [sk(-0.25, 0.03, 0.26), sk(0.0, 0.03, 0.3), 0.009],
];
for (const [a, e, r] of boneRun) limbs.push(...boneGeo(a, e, r));
const toeR = rng(66);
for (const end of [sk(0.95, 0.03, -0.2), sk(0.92, 0.03, 0.1), sk(0.08, 0.03, -0.2), sk(0.0, 0.03, 0.3)]) {
  for (let i = 0; i < 5; i++)
    limbs.push(
      placed(
        new THREE.BoxGeometry(0.012, 0.01, 0.034),
        end.clone().add(v3((toeR() - 0.1) * 0.06, -0.015, (toeR() - 0.5) * 0.07)),
        eq(0, toeR() * 90, 0),
      ),
    );
}
b.part(merge(limbs), BONE_P, { bone: base, at: [0, 0, 0], flat: true });

// Loose bones and a small skull by the chest side.
const loose: THREE.BufferGeometry[] = [];
loose.push(...boneGeo(v3(-1.68, F + 0.02, 0.12), v3(-1.3, F + 0.02, 0.3), 0.014));
loose.push(...boneGeo(v3(-1.62, F + 0.02, 0.38), v3(-1.24, F + 0.02, 0.22), 0.013));
loose.push(...boneGeo(v3(-0.1, F + 0.02, 0.82), v3(0.25, F + 0.02, 0.76), 0.012));
b.part(merge(loose), BONE_P, { bone: base, at: [0, 0, 0], flat: true });
skull(-1.5, F, 0.62, 140, 0.01, false);
for (const [r, a0] of [
  [0.07, 0],
  [0.095, 12],
  [0.12, 24],
]) {
  const c = v3(-1.3, F + 0.014, 0.55);
  b.sweep(
    arc(c, v3(c.x + r * Math.cos(a0 * DEG), c.y, c.z + r * Math.sin(a0 * DEG)), [0, 1, 0], 150),
    [0.013, 0.008],
    BONE_P,
    { sides: 5, bone: base },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Open the lid last, so everything built on it opens with it.

b.pose(lid, { axis: [1, 0, 0], deg: -98 });

export default function build() {
  return b.root;
}
