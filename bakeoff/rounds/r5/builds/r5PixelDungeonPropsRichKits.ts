import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, frame, noise, rng } from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelTexture, skinBox, skinLayout, stepped, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "dungeon_props",
  description:
    "Pixel-art dungeon corner: flagstone floor and brick wall, an open treasure chest with glowing gems, two wall torches with pixel flames, three barrels (one holding green slime), a pile of bones with skulls, and a hazard-striped spike trap with an impaled skull.",
};

type Col = string | Paint;
type V3 = [number, number, number];

const TEXEL = 0.02;
const FY = 0.1; // floor top
const WZ = -1.08; // wall front face
const DEG = Math.PI / 180;

// ---------- palettes (dark to light) ----------
const STONE = ["#1c1b24", "#2d2c38", "#43414f", "#5c596a", "#78748a"];
const BRICK = ["#1a1620", "#2c2430", "#473a42", "#6a5650", "#8a7366"];
const WOOD = ["#24130a", "#3f2410", "#5b3818", "#7a4e24", "#9c6c34"];
const IRON = ["#101018", "#20202c", "#35364a", "#52546c", "#7a7d98"];
const BONE = ["#4d4436", "#8a7d68", "#bfb298", "#e2d8bd", "#f6f0e0"];
const GOLD = ["#6b3f0c", "#a8650f", "#e0a21c", "#ffd23f", "#fff2a0"];
const SLIME = ["#16360f", "#2b5e17", "#4a9a22", "#8ad43a"];
const VELVET = ["#2a0610", "#4a0c1a", "#70142a", "#962038"];
const CLOTHR = ["#17110d", "#2f2218", "#4e3826", "#6e5238"];
const BLOOD = ["#3a0508", "#6a0a10", "#a01018", "#d02428"];

const hash = (a: number, b: number, s = 0) => {
  let t = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(s | 0, 1274126177);
  t = Math.imul(t ^ (t >>> 13), 1274126177);
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
};

// ---------- paints ----------
const WOODP = cellPaint(
  TEXEL,
  (c) => c.pick(WOOD, 0.42 + (c.n.y > 0.5 ? 0.14 : 0) + (noise(c.at, 0.12, 3) - 0.5) * 0.4 + (c.random(1) - 0.5) * 0.22),
  { dither: true },
);
const IRONP = cellPaint(
  TEXEL,
  (c) => c.pick(IRON, 0.36 + (c.n.y > 0.5 ? 0.16 : 0) + (noise(c.at, 0.2, 2) - 0.5) * 0.4 + (c.random(1) - 0.5) * 0.16),
  { dither: true },
);
const BONEP = cellPaint(
  TEXEL,
  (c) => c.pick(BONE, 0.5 + c.n.y * 0.25 + (noise(c.at, 0.1, 6) - 0.5) * 0.4 + (c.random(1) - 0.5) * 0.15),
  { dither: true },
);
const GOLDP = cellPaint(
  TEXEL,
  (c) =>
    c.random(2) < 0.1
      ? GOLD[4]
      : c.pick(GOLD, 0.48 + (noise(c.at, 0.08, 4) - 0.5) * 0.6 + (c.n.y > 0.5 ? 0.2 : -0.05) + (c.random(5) - 0.5) * 0.3),
  { dither: true },
);
const VELVETP = cellPaint(TEXEL, (c) => c.pick(VELVET, 0.45 + (noise(c.at, 0.1, 8) - 0.5) * 0.7 + (c.random(1) - 0.5) * 0.2), {
  dither: true,
});
const CLOTHP = cellPaint(TEXEL, (c) => {
  if (c.n.y > 0.5) return "#14100e";
  if (Math.floor(c.at.y / 0.025) % 2 === 0) return CLOTHR[0];
  return c.pick(CLOTHR, 0.35 + 0.45 * c.random(1));
});
const SPIKEP = cellPaint(
  TEXEL / 2,
  (c) => c.pick(IRON, 0.3 + c.s[1] * 0.55 + (c.random(1) - 0.5) * 0.2),
  { dither: true },
);
const BLOODP = cellPaint(
  TEXEL / 2,
  (c) => (c.s[1] > 0.5 ? c.pick(BLOOD, 0.3 + (c.s[1] - 0.5) * 1.2 + (c.random(1) - 0.5) * 0.3) : c.pick(IRON, 0.3 + c.s[1] * 0.5)),
  { dither: true },
);

// ---------- textures ----------
function floorTile(seed: number) {
  return pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if (x === 0 || y === 0) return STONE[0];
      if (x === 31 || y === 31) return STONE[1];
      if (x === 1 || y === 1) return STONE[4];
      const v = 0.42 + 0.14 * Math.sin(x * 0.31 + y * 0.17 + seed) + (hash(x, y, seed) - 0.5) * 0.28;
      return pick(STONE, v, bayer(x, y));
    });
    let cx = 6 + Math.floor(hash(seed, 1) * 18);
    let cy = 4 + Math.floor(hash(seed, 2) * 6);
    for (let k = 0; k < 12; k++) {
      g.set(cx, cy, STONE[0]);
      cy++;
      if (hash(seed, k + 5) < 0.5) cx++;
    }
    if (seed % 2 === 0)
      for (let k = 0; k < 7; k++) g.set(2 + Math.floor(hash(seed, k + 20) * 8), 2 + (k % 2), k % 2 ? "#3a6a28" : "#23401c");
  });
}

function wallTile(seed: number) {
  return pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 8);
      const xx = (x + (row % 2) * 8) % 32;
      if (y % 8 === 0 || xx % 16 === 0) return BRICK[0];
      let v = 0.3 + hash(Math.floor(xx / 16), row, seed) * 0.4 + (hash(x, y, seed + 9) - 0.5) * 0.2;
      if (y % 8 === 1 || xx % 16 === 1) v += 0.22;
      if (y % 8 === 7 || xx % 16 === 15) v -= 0.18;
      return pick(BRICK, v, bayer(x, y));
    });
    for (let k = 0; k < 5; k++) {
      const x = Math.floor(hash(seed, k + 40) * 32);
      const y = Math.floor(hash(seed, k + 50) * 32);
      if (y % 8 > 1) g.set(x, y, k % 2 ? "#3a6a28" : "#23401c");
    }
  });
}

const woodTile = pixelTexture(48, 32, (g) =>
  g.fill((x, y) => {
    const row = Math.floor(y / 8);
    const ly = y % 8;
    if (ly === 0) return WOOD[0];
    const seam = row % 2 ? 17 : 33;
    if (x === seam) return WOOD[0];
    if (ly === 4 && (x === seam - 2 || x === seam + 2 || x === 2 || x === 45)) return IRON[3];
    let v = 0.42 + hash(row, x > seam ? 1 : 0, 3) * 0.18 + (hash(x >> 2, y, 4) < 0.18 ? -0.16 : 0) + (hash(x, y, 5) - 0.5) * 0.1;
    if (ly === 1) v += 0.2;
    if (ly === 7) v -= 0.12;
    return pick(WOOD, v, bayer(x, y));
  }),
);

const plateTile = pixelTexture(50, 50, (g) => {
  g.fill((x, y) => {
    const e = Math.min(x, y, 49 - x, 49 - y);
    if (e < 3) return ((x + y) >> 2) % 2 ? "#d9a41c" : "#1a1620";
    if (e === 3) return IRON[4];
    return pick(IRON, 0.3 + (hash(x, y, 6) - 0.5) * 0.3 + 0.08 * Math.sin(x * 0.4), bayer(x, y));
  });
  for (const px of [10, 20, 30, 40])
    for (const py of [10, 20, 30, 40])
      for (let dx = -2; dx < 2; dx++) for (let dy = -2; dy < 2; dy++) g.set(px + dx, py + dy, "#05040a");
  for (const [rx, ry] of [[6, 6], [43, 6], [6, 43], [43, 43], [25, 6], [25, 43], [6, 25], [43, 25]]) {
    g.set(rx, ry, IRON[4]);
    g.set(rx + 1, ry, IRON[4]);
    g.set(rx, ry + 1, IRON[1]);
    g.set(rx + 1, ry + 1, IRON[1]);
  }
});

const FLAME = pixelTexture(14, 20, (g) => {
  const tongues = [[7, 0, 6.2], [3.5, 7, 3.4], [10.5, 5, 3.6]];
  for (let y = 0; y < 20; y++)
    for (let x = 0; x < 14; x++) {
      let best = 9;
      for (const [cx, tip, hw] of tongues) {
        if (y < tip) continue;
        const w = hw * Math.pow((y - tip) / (19 - tip), 0.65);
        if (w <= 0.3) continue;
        const d = Math.abs(x + 0.5 - cx) / w;
        if (d <= 1) best = Math.min(best, d);
      }
      if (best > 1) continue;
      g.set(x, y, best < 0.3 && y > 9 ? "#fff3b0" : best < 0.55 && y > 5 ? "#ffd64a" : best < 0.82 ? "#ff8a1e" : "#d8381c");
    }
});

const HALO = pixelTexture(28, 28, (g) => {
  for (let y = 0; y < 28; y++)
    for (let x = 0; x < 28; x++) {
      const v = 1 - Math.hypot(x + 0.5 - 14, y + 0.5 - 14) / 14;
      if (v <= 0 || v * 1.3 <= bayer(x, y)) continue;
      g.set(x, y, v > 0.5 ? "#d9822b" : "#8a3f1a");
    }
});

// skull sheet
const SK = skinLayout({ cran: [8, 7, 8], jaw: [6, 3, 7] });
const SKULL = pixelTexture(SK.size[0], SK.size[1], (g) => {
  const base = { py: 0.88, ny: 0.3, pz: 0.7, px: 0.55, nx: 0.55, nz: 0.5 };
  for (const name of ["cran", "jaw"] as const)
    for (const face of ["px", "nx", "py", "ny", "pz", "nz"] as const)
      g.fill(
        (x, y, _w, h) => pick(BONE, base[face] + (hash(x, y, face.charCodeAt(1) + name.length) - 0.5) * 0.25 - (y / h) * 0.08, bayer(x, y)),
        SK.faces[name][face],
      );
  const [fx, fy] = SK.faces.cran.pz;
  for (const [ex, ey] of [[1, 2], [2, 2], [1, 3], [2, 3], [5, 2], [6, 2], [5, 3], [6, 3]]) g.set(fx + ex, fy + ey, "#140d14");
  g.set(fx + 2, fy + 3, "#9c1c2c");
  g.set(fx + 5, fy + 3, "#9c1c2c");
  g.set(fx + 3, fy + 4, "#1c1418");
  g.set(fx + 4, fy + 4, "#1c1418");
  for (let x = 0; x < 8; x++) g.set(fx + x, fy + 6, x % 2 ? "#2a2024" : "#f4eedd");
  const [tx, ty] = SK.faces.cran.py;
  for (const [ex, ey] of [[3, 1], [3, 2], [4, 2], [4, 3]]) g.set(tx + ex, ty + ey, "#2a2024");
  const [jx, jy] = SK.faces.jaw.pz;
  for (let x = 0; x < 6; x++) g.set(jx + x, jy, x % 2 ? "#2a2024" : "#f4eedd");
});

// ---------- helpers ----------
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const rotY = (x: number, z: number, deg: number): [number, number] => {
  const a = deg * DEG;
  return [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
};
const Q = (yaw: number, pitch: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * DEG, yaw * DEG, 0, "YXZ"));

export default function build() {
  const b = createBuilder({ name: "dungeon_props" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(21);
  const PY = FY - 0.004;

  const P = (geo: THREE.BufferGeometry, color: Col, at: V3, extra: object = {}) => b.part(geo, color, { bone: root, at, ...extra });
  const TX = (geo: THREE.BufferGeometry, tex: THREE.Texture, at: V3) => P(geo, "#ffffff", at, { texture: tex });

  // ---------- floor ----------
  const floors = [0, 1, 2, 3].map(floorTile);
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 4; j++) {
      const h = 0.1 + hash(i, j, 3) * 0.006;
      const tex = floors[Math.floor(hash(i, j, 8) * 4)];
      TX(tileBox([0.64, h, 0.64], tex, TEXEL), tex, [(i - 2) * 0.64, h / 2, (j - 1.5) * 0.64]);
    }

  // ---------- wall ----------
  const walls = [0, 1, 2].map(wallTile);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 5; c++) {
      const tex = walls[Math.floor(hash(c, r, 4) * 3)];
      TX(tileBox([0.64, 0.64, 0.2], tex, TEXEL), tex, [(c - 2) * 0.64, PY + 0.32 + r * 0.64, WZ - 0.1]);
    }

  // hanging chain with manacle
  {
    const links: THREE.BufferGeometry[] = [];
    const cx = -0.3;
    const top = FY + 1.82;
    for (let i = 0; i < 9; i++) {
      const g = i % 2 === 0 ? box(0.05, 0.075, 0.016) : box(0.016, 0.075, 0.05);
      links.push(g.translate(cx, top - i * 0.062, WZ + 0.03));
    }
    links.push(box(0.09, 0.05, 0.04).translate(cx, top + 0.05, WZ + 0.02));
    links.push(box(0.14, 0.07, 0.06).translate(cx, top - 9 * 0.062 - 0.02, WZ + 0.035));
    links.push(box(0.04, 0.12, 0.05).translate(cx - 0.085, top - 9 * 0.062 - 0.02, WZ + 0.035));
    links.push(box(0.04, 0.12, 0.05).translate(cx + 0.085, top - 9 * 0.062 - 0.02, WZ + 0.035));
    P(mergeGeometries(links)!, IRONP, [0, 0, 0]);
  }

  // ---------- torches ----------
  const TILT = 20 * DEG;
  const torch = (tx: number) => {
    const yS = FY + 1.05;
    const ring = new THREE.Vector3(tx, yS - 0.02, WZ + 0.17);
    const U = new THREE.Vector3(0, Math.cos(TILT), Math.sin(TILT));
    const along = (d: number): V3 => {
      const v = ring.clone().addScaledVector(U, d);
      return [v.x, v.y, v.z];
    };
    const tilt = { rotation: [20, 0, 0] as V3 };
    // halo on the wall
    P(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", [tx, yS + 0.3, WZ + 0.006], { dir: [0, 0, 1], axis: "z", texture: HALO });
    // mount
    P(box(0.12, 0.24, 0.03), IRONP, [tx, yS, WZ + 0.015]);
    P(box(0.05, 0.045, 0.15), IRONP, [tx, yS - 0.02, WZ + 0.1]);
    for (const s of [1, -1]) {
      P(box(0.025, 0.05, 0.1), IRONP, [tx + s * 0.0425, ring.y, ring.z]);
      P(box(0.11, 0.05, 0.025), IRONP, [tx, ring.y, ring.z + s * 0.0425]);
    }
    P(box(0.05, 0.5, 0.05), WOODP, along(0.17), tilt);
    P(box(0.12, 0.04, 0.12), IRONP, along(0.41), tilt);
    P(box(0.1, 0.13, 0.1), CLOTHP, along(0.47), tilt);
    glow(P(box(0.08, 0.05, 0.08), "#ffb02e", along(0.54), tilt), 1);
    glow(b.cards([frame(along(0.56), [0, 1, 0])], FLAME, { size: [0.26, 0.36], cross: true, flow: [0, 0, 1], bone: root }), 1.3);
  };
  torch(-1.0);
  torch(0.45);

  // ---------- chest ----------
  const CX = -0.55;
  const CZ = -0.6;
  const CY = PY;
  TX(tileBox([0.8, 0.3, 0.5], woodTile, TEXEL), woodTile, [CX, CY + 0.15, CZ]);
  for (const s of [1, -1]) {
    P(box(0.06, 0.06, 0.5), WOODP, [CX + s * 0.37, CY + 0.33, CZ]);
    P(box(0.68, 0.06, 0.06), WOODP, [CX, CY + 0.33, CZ + s * 0.22]);
    P(box(0.07, 0.31, 0.53), IRONP, [CX + s * 0.33, CY + 0.155, CZ]);
  }
  P(box(0.82, 0.05, 0.52), IRONP, [CX, CY + 0.025, CZ]);
  // gold hoard
  P(box(0.68, 0.06, 0.38), GOLDP, [CX, CY + 0.33, CZ]);
  P(box(0.52, 0.05, 0.3), GOLDP, [CX - 0.03, CY + 0.385, CZ + 0.01]);
  P(box(0.34, 0.04, 0.2), GOLDP, [CX + 0.05, CY + 0.43, CZ - 0.01]);
  P(box(0.18, 0.03, 0.12), GOLDP, [CX - 0.04, CY + 0.465, CZ + 0.01]);
  // coins
  {
    const spots: V3[] = [
      [CX + 0.2, CY + 0.365, CZ + 0.12], [CX - 0.2, CY + 0.365, CZ - 0.1], [CX - 0.15, CY + 0.415, CZ + 0.08],
      [CX + 0.12, CY + 0.455, CZ - 0.02], [CX + 0.03, CY + 0.485, CZ + 0.01], [CX - 0.08, CY + 0.485, CZ - 0.02],
      [CX + 0.15, FY + 0.012, CZ + 0.5], [CX + 0.27, FY + 0.012, CZ + 0.63], [CX - 0.1, FY + 0.012, CZ + 0.58], [CX + 0.42, FY + 0.012, CZ + 0.45],
    ];
    const geos = spots.map(([x, y, z], i) => {
      const g = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 8);
      g.rotateX((hash(i, 1) - 0.5) * 0.5);
      g.rotateZ((hash(i, 2) - 0.5) * 0.5);
      return g.translate(x, y, z);
    });
    P(mergeGeometries(geos)!, GOLDP, [0, 0, 0]);
  }
  // gems
  glow(P(new THREE.OctahedronGeometry(0.045), "#e8283c", [CX - 0.2, CY + 0.41, CZ + 0.05]), 1);
  glow(P(new THREE.OctahedronGeometry(0.04), "#38e0ff", [CX + 0.18, CY + 0.47, CZ + 0.03]), 1);
  glow(P(new THREE.OctahedronGeometry(0.035), "#4cff7a", [CX + 0.02, CY + 0.52, CZ - 0.03]), 1);
  // lock
  P(box(0.12, 0.14, 0.03), GOLDP, [CX, CY + 0.25, CZ + 0.262]);
  P(box(0.03, 0.05, 0.01), "#0a070c", [CX, CY + 0.25, CZ + 0.28]);
  // lid on a hinge
  const hy = CY + 0.36;
  const hz = CZ - 0.25;
  const lid = b.joint("lid", { parent: root, at: [CX, hy, hz], dir: [0, 0, 1], role: "hinge" });
  const LID_ROWS: [number, number][] = [[0, 10], [0, 10], [0, 10], [1, 9], [2, 8]];
  b.extrude(stepped(LID_ROWS, [0.05, 0.045], { rows: true }), {
    at: [CX, hy, hz], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.8, color: WOODP, bone: lid, name: "lidWood",
  });
  const bandOutline = stepped(LID_ROWS.map(([a, c]) => [a - 0.25, c] as [number, number]), [0.0525, 0.0475], { rows: true });
  for (const x of [-0.37, -0.12, 0.12, 0.37])
    b.extrude(bandOutline, { at: [CX + x, hy, hz], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, color: IRONP, bone: lid, name: "lidBand" });
  b.part(box(0.72, 0.012, 0.44), VELVETP, { bone: lid, at: [CX, hy - 0.004, hz + 0.26] });
  b.pose(lid, { axis: [1, 0, 0], deg: -55 });

  // ---------- barrels ----------
  const barrel = (bx: number, bz: number, h: number, open: boolean) => {
    const prof: [number, number][] = [[0.25, 0], [0.29, 0.15 * h], [0.33, 0.5 * h], [0.29, 0.85 * h], [0.25, h]];
    const rAt = (y: number) => {
      for (let k = 0; k < prof.length - 1; k++) {
        const [r0, y0] = prof[k];
        const [r1, y1] = prof[k + 1];
        if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
      }
      return prof[prof.length - 1][0];
    };
    const outline: [number, number][] = [[0, 0], ...prof];
    if (open) outline.push([0.22, h], [0.22, h - 0.12], [0, h - 0.12]);
    else outline.push([0, h]);
    const paintB = cellPaint(
      TEXEL,
      (c) => {
        const y = c.at.y - PY;
        const rad = Math.hypot(c.at.x - bx, c.at.z - bz);
        if (c.n.y > 0.6) {
          if (open && y < h - 0.04) return c.pick(SLIME, 0.35 + 0.5 * noise(c.at, 0.12, 3) + (c.random(4) - 0.5) * 0.2);
          const px = (c.at.x - bx) / 0.06;
          if (!open && px - Math.floor(px) < 0.15) return WOOD[0];
          return c.pick(WOOD, 0.5 + (c.random(1) - 0.5) * 0.3);
        }
        if (open && y > h - 0.12 && rad < 0.235) return c.pick(WOOD, 0.1 + c.random(2) * 0.2);
        const a = (Math.atan2(c.at.x - bx, c.at.z - bz) + Math.PI) / (Math.PI / 8);
        const st = Math.floor(a);
        if (a - st < 0.12) return WOOD[0];
        return c.pick(WOOD, 0.3 + hash(st, 0, 2) * 0.35 + (c.random(1) - 0.5) * 0.2 + (noise(c.at, 0.1, 5) - 0.5) * 0.2);
      },
      { dither: true },
    );
    b.lathe(outline, { at: [bx, PY, bz], segments: 8, color: paintB, bone: root });
    for (const f of [0.1, 0.5, 0.88]) {
      const y0 = f * h - 0.03;
      const y1 = f * h + 0.03;
      const ro = Math.max(rAt(y0), rAt(y1)) + 0.016;
      const ri = Math.min(rAt(y0), rAt(y1)) - 0.03;
      b.lathe([[ri, y0], [ro, y0], [ro, y1], [ri, y1]], { at: [bx, PY, bz], segments: 8, color: IRONP, bone: root });
    }
  };
  barrel(1.2, -0.72, 0.92, false);
  barrel(0.52, -0.72, 0.8, false);
  barrel(1.22, -0.02, 0.78, true);

  // ---------- bones ----------
  const femurGeo = (len: number) => {
    const parts: THREE.BufferGeometry[] = [box(0.034, 0.034, len)];
    for (const e of [1, -1]) for (const s of [1, -1]) parts.push(box(0.032, 0.04, 0.05).translate(s * 0.014, 0, e * (len / 2)));
    return mergeGeometries(parts)!;
  };
  P(femurGeo(0.42), BONEP, [-0.4, FY + 0.02, 0.55], { quat: Q(40, 0) });
  P(femurGeo(0.4), BONEP, [-0.4, FY + 0.055, 0.55], { quat: Q(-40, 6) });
  P(femurGeo(0.34), BONEP, [-1.3, FY + 0.02, 1.0], { quat: Q(75, 0) });

  // ribcage
  {
    const cx = -1.0;
    const cz = 0.5;
    const yaw = 8;
    const lx = (i: number) => -0.24 + i * 0.08;
    const verts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 7; i++) verts.push(box(0.05, 0.04, 0.045).translate(lx(i), 0.03, 0));
    P(mergeGeometries(verts)!, BONEP, [cx, FY, cz], { rotation: [0, yaw, 0] });
    for (let i = 0; i < 7; i++)
      for (const s of [1, -1]) {
        const f = 0.65 + 0.35 * Math.sin((Math.PI * (i + 0.8)) / 7.6);
        const loc: [number, number][] = [
          [0.035, 0.02], [0.02 + 0.09 * f, 0.08 * f], [0.015 + 0.085 * f, 0.15 * f], [0.045 * f + 0.01, 0.205 * f], [0.016, 0.22 * f],
        ];
        const pts = loc.map(([y, z]) => {
          const [rx, rz] = rotY(lx(i), s * z, yaw);
          return [cx + rx, FY + y, cz + rz];
        });
        b.sweep(catmull(pts), [0.013, 0.008], { color: BONEP, bone: root, section: "box" });
      }
  }

  // skulls
  const skull = (x: number, z: number, yaw: number) => {
    P(skinBox(SKULL, SK.faces.cran, 0.025), "#ffffff", [x, FY + 0.0875, z], { texture: SKULL, rotation: [0, yaw, 0] });
    const [ox, oz] = rotY(0, 0.19, yaw);
    P(skinBox(SKULL, SK.faces.jaw, 0.025), "#ffffff", [x + ox, FY + 0.0375, z + oz], { texture: SKULL, rotation: [0, yaw + 12, 0] });
  };
  skull(-0.85, 1.0, 20);

  // scattered small bones
  for (let i = 0; i < 7; i++) {
    const x = -1.4 + R() * 1.3;
    const z = 0.2 + R() * 1.0;
    P(box(0.02, 0.018, 0.06 + R() * 0.03), BONEP, [x, FY + 0.012, z], { rotation: [0, R() * 180, 0] });
  }

  // ---------- spike trap ----------
  const TRX = 0.65;
  const TRZ = 0.7;
  TX(tileBox([1.0, 0.05, 1.0], plateTile, TEXEL), plateTile, [TRX, PY + 0.025, TRZ]);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const sx = TRX + (i - 1.5) * 0.2;
      const sz = TRZ + (j - 1.5) * 0.2;
      const stake = i === 3 && j === 0;
      const h = stake ? 0.3 : 0.06 + (0.22 * ((i + 2 * j) % 4)) / 3;
      P(new THREE.ConeGeometry(0.05, h, 4), (i + j) % 3 === 0 && !stake ? BLOODP : SPIKEP, [sx, PY + 0.03 + h / 2, sz], { rotation: [0, 45, 0] });
      if (stake) P(skinBox(SKULL, SK.faces.cran, 0.025), "#ffffff", [sx, PY + 0.03 + h - 0.0125, sz], { texture: SKULL, rotation: [0, -15, 0] });
    }

  return b.root;
}
