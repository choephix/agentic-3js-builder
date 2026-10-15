```ts
import * as THREE from "three";
import { catmull, createBuilder, rng } from "agentic-3js-builder";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  stepped,
  tileBox,
} from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon vignette: flagstone floor and brick wall with skull banner, an open treasure chest with glowing gold, wall torches with pixel flames, three barrels (one leaking poison), a spike-pit trap with an impaled helmet, and a scatter of bones.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants and palettes

const T = 0.025; // coarse texel (floor, chest lid, barrels)
const F = 0.0125; // fine texel (walls, paints)
const FY = 0.1; // floor top

const STONE = ["#1b1923", "#2d2a3a", "#433f55", "#5c5870", "#7e7a94"];
const MOSS = ["#26401f", "#3c6030", "#5a8a3e"];
const WOOD = ["#22110a", "#3b2113", "#5a341c", "#7c4b27", "#a06b3a"];
const IRON = ["#12121a", "#2a2d3a", "#474c60", "#7a8098", "#b6bccf"];
const BONE = ["#5a503f", "#8a7f66", "#bfb494", "#e4dbbc", "#f8f3dc"];
const BLOOD = ["#3e0a0e", "#6e1216", "#9a1c1f"];
const CLOTH = ["#3d0a12", "#5e1019", "#7f1824", "#a02432"];
const GOLD = "#f5c842";

const hsh = (x: number, y: number, s = 0) => {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const DEGR = Math.PI / 180;
/** Rotate an (x, z) offset about Y by `deg`, matching three's rotation.y. */
const rot = (x: number, z: number, deg: number): [number, number] => {
  const a = deg * DEGR;
  return [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
};

// ---------------------------------------------------------------------------------------------------------------
// Paints (cell based, so every surface shows square pixels)

const woodPaint = (plank: number, seed: number) =>
  cellPaint(
    F,
    (c) => {
      const k = ((c.v % plank) + plank) % plank;
      const row = Math.floor(c.v / plank);
      if (k === 0) return WOOD[0];
      if (k === 3 && (((c.u % 14) + 14) % 14 === 1) && c.axis !== 1) return IRON[3];
      const streak = ((((c.u + row * 7) % 9) + 9) % 9 === 0) ? -0.1 : 0;
      let v = 0.45 + 0.16 * (hsh(row, seed, 5) - 0.5) + 0.12 * c.n.y + 0.2 * (c.random(seed) - 0.5) + streak;
      if (k === 1) v += 0.1;
      return c.pick(WOOD, v);
    },
    { dither: true },
  );

const IRONP = cellPaint(
  F,
  (c) => {
    if (c.random(7) > 0.94) return "#7a3a1c";
    return c.pick(IRON, 0.42 + 0.22 * c.n.y + 0.1 * c.n.x + 0.25 * (c.random(2) - 0.5));
  },
  { dither: true },
);

const STONEP = cellPaint(
  F,
  (c) => {
    if (c.n.y > 0.6 && c.random(5) > 0.86) return MOSS[1];
    return c.pick(STONE, 0.42 + 0.3 * (c.random(1) - 0.5) + 0.18 * c.n.y);
  },
  { dither: true },
);

const BONEP = cellPaint(
  0.01,
  (c) => {
    if (c.random(3) > 0.95) return BONE[0];
    return c.pick(BONE, 0.58 + 0.22 * c.n.y + 0.3 * (c.random(1) - 0.5));
  },
  { dither: true },
);

const HEADP = cellPaint(
  0.01,
  (c) => {
    if (c.random(4) > 0.92) return "#c2431a";
    return c.pick(["#120a07", "#2b1a10", "#4a2e1a"], 0.35 + 0.4 * c.random(3));
  },
  { dither: true },
);

const SPIKEP = cellPaint(
  0.0125,
  (c) => c.pick(IRON, 0.5 + 0.34 * c.n.x - 0.2 * c.n.z + 0.15 * c.n.y + 0.14 * (c.random(1) - 0.5)),
  { dither: true },
);
const SPIKEB = cellPaint(
  0.0125,
  (c) => {
    if (c.at.y > 0.2 && c.random(5) > 0.25) return c.pick(BLOOD, 0.4 + 0.5 * c.random(6));
    return c.pick(IRON, 0.5 + 0.34 * c.n.x - 0.2 * c.n.z + 0.15 * c.n.y);
  },
  { dither: true },
);

const PITP = cellPaint(
  F,
  (c) => {
    if (hsh(Math.floor(c.u / 4), Math.floor(c.v / 4), 6) > 0.62) return c.pick(BLOOD, 0.3 + 0.6 * c.random(2));
    return c.pick(STONE, 0.12 + 0.25 * c.random(1));
  },
  { dither: true },
);

/** Barrel staves: `along` is the barrel axis (1 = upright, 2 = lying along z). */
const barrelPaint = (along: 1 | 2) =>
  cellPaint(
    F,
    (c) => {
      let stave: number;
      if (along === 1) stave = c.u;
      else stave = c.axis === 0 ? c.v : c.u;
      const k = ((stave % 4) + 4) % 4;
      const idx = Math.floor(stave / 4);
      if (k === 0) return WOOD[0];
      const damp = c.at.y < FY + 0.06 ? -0.12 : 0;
      let v = 0.42 + 0.22 * (hsh(idx, 0, 3) - 0.5) + 0.14 * c.n.y + 0.22 * (c.random(4) - 0.5) + damp;
      if (k === 1) v += 0.1;
      return c.pick(WOOD, v);
    },
    { dither: true },
  );

// ---------------------------------------------------------------------------------------------------------------
// Textures

const flagTile = (seed: number) =>
  pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      if (x === 15 || y === 15) return STONE[0];
      if (x === 0 || y === 0) return STONE[3];
      const v = 0.5 + (hsh(x, y, seed) - 0.5) * 0.6 + (x < 8 && y < 8 ? 0.06 : 0);
      return pick(STONE.slice(1, 5), v, bayer(x, y));
    });
    if (seed === 0) {
      g.set(5, 9, STONE[0]);
      g.set(11, 4, STONE[1]);
      g.set(9, 12, STONE[1]);
    }
    if (seed === 1) for (let i = 0; i < 9; i++) g.set(3 + i, 3 + Math.floor(i * 1.1), STONE[0]);
    if (seed === 2) {
      for (let i = 0; i < 7; i++) g.set(12 - i, 2 + i, STONE[0]);
      g.fill((x, y) =>
        hsh(x >> 1, y >> 1, 4) > 0.55 && x + y < 10 ? pick(MOSS, hsh(x, y, 5), bayer(x, y)) : undefined,
      );
    }
  });

const brickTile = () =>
  pixelTexture(80, 48, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 8);
      const off = (row % 2) * 8;
      const bx = Math.floor((x + off) / 16);
      const lx = (x + off) % 16;
      const ly = y % 8;
      if (ly === 7 || lx === 15) return STONE[0];
      if (ly === 0 || lx === 0) return STONE[3];
      const v = 0.3 + 0.35 * hsh(bx, row, 3) + 0.25 * (hsh(x, y, 4) - 0.5);
      return pick(STONE.slice(1, 4), v, bayer(x, y));
    });
    g.fill((x, y) =>
      y % 8 < 4 && hsh(x >> 1, y >> 1, 9) > 0.78 && hsh(x >> 3, y >> 3, 11) > 0.5
        ? pick(MOSS, hsh(x, y, 2), bayer(x, y))
        : undefined,
    );
  });

const SK = skinLayout({ skull: [8, 7, 8], jaw: [6, 3, 6] }, 48);
const skullSheet = () =>
  pixelTexture(SK.size[0], SK.size[1], (g) => {
    for (const faces of Object.values(SK.faces))
      for (const [face, rect] of Object.entries(faces)) {
        const lift = face === "py" ? 0.15 : face === "ny" ? -0.25 : 0;
        g.fill(
          (x, y, w, h) => pick(BONE, 0.58 + lift + 0.28 * (hsh(x + rect[0], y + rect[1], 8) - 0.5) - 0.12 * (y / h), bayer(x, y)),
          rect,
        );
      }
    const [rx, ry] = SK.faces.skull.pz;
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        g.set(rx + 1 + i, ry + 3 + j, "#0d0a10");
        g.set(rx + 5 + i, ry + 3 + j, "#0d0a10");
      }
    g.set(rx + 3, ry + 5, "#0d0a10");
    g.set(rx + 4, ry + 5, "#0d0a10");
    g.set(rx + 3, ry + 6, BONE[1]);
    g.set(rx + 4, ry + 6, BONE[1]);
    for (let x = 0; x < 8; x++) g.set(rx + x, ry + 2, BONE[1]);
    g.set(rx + 3, ry, BONE[0]);
    g.set(rx + 4, ry + 1, BONE[0]);
    const [jx, jy] = SK.faces.jaw.pz;
    for (let x = 0; x < 6; x++) {
      g.set(jx + x, jy, x % 2 === 0 ? BONE[4] : BONE[0]);
      g.set(jx + x, jy + 1, BONE[3]);
      g.set(jx + x, jy + 2, BONE[2]);
    }
  });

const bannerTex = () =>
  pixelTexture(20, 35, (g) => {
    g.fill((x, y) => {
      const cx = Math.abs(x - 9.5);
      if (y >= 26 && cx > (35 - y) * 1.1) return "";
      if (y >= 26 && cx > (35 - y) * 1.1 - 1.4) return "#c98a1c";
      if (y > 20 && hsh(x, y, 13) > 0.97) return "";
      if (y < 2) return y === 0 ? "#7a4a10" : GOLD;
      if (x <= 1 || x >= 18) return y % 2 ? "#c98a1c" : "#7a4a10";
      const fold = (x + 2) % 6 < 3 ? 0.18 : -0.05;
      return pick(CLOTH, 0.45 + fold + (hsh(x, y, 6) - 0.5) * 0.2, bayer(x, y));
    });
    g.stamp(5, 9, [".wwwwwww.", "wwwwwwwww", "wkkwwwkkw", "wkkwwwkkw", "wwwwkwwww", ".wwwwwww.", "..wkwkw..", "..wwwww.."], {
      w: "#e8dfc0",
      k: "#2a0d12",
    });
    g.stamp(4, 19, ["w.......w", ".w.....w.", "..w...w..", "...www..."], { w: "#e8dfc0" });
  });

const goldTex = () =>
  pixelTexture(64, 32, (g) => {
    g.fill((x, y) => {
      const lx = x % 4;
      const ly = y % 4;
      const bx = x >> 2;
      const by = y >> 2;
      if (lx === 3 || ly === 3) return "#7a4a10";
      if (lx === 0 && ly === 0) return "#fff2a0";
      return hsh(bx, by, 5) > 0.5 ? GOLD : "#d6962a";
    });
  });

const lockTex = () =>
  pixelArt(
    [
      "kkkkkkkkkkkk",
      "kyyyyyyyyyyk",
      "kywggggggwyk",
      "kyggggggggyk",
      "kygggddgggyk",
      "kyggddddggyk",
      "kyggddddggyk",
      "kygggddgggyk",
      "kygggddgggyk",
      "kygggddgggyk",
      "kywggggggwyk",
      "kyyyyyyyyyyk",
      "kkkkkkkkkkkk",
    ],
    { k: "#14141c", y: GOLD, g: "#4b5063", w: "#b6bccf", d: "#0b0b12" },
  );

const haloTex = () =>
  pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      const v = 1 - Math.hypot(x - 7.5, y - 7.5) / 8;
      if (v <= 0) return "";
      return v * 0.95 > bayer(x, y) ? (v > 0.55 ? "#ffb347" : "#ff6a1a") : "";
    });
  });

const runeTex = () =>
  pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      const d = Math.hypot(x - 7.5, y - 7.5);
      if (d > 5.6 && d < 7.3) return "#b86bff";
      if (d < 1.6) return "#ffffff";
      if (d < 5.2 && (Math.abs(x - y) < 1 || Math.abs(x + y - 15) < 1)) return "#e0b0ff";
      return "";
    });
  });

const webTex = () =>
  pixelTexture(16, 16, (g) => {
    const W = "#cfd4e4";
    for (let i = 0; i < 16; i++) {
      g.set(i, 0, W);
      g.set(0, i, W);
      g.set(i, i, W);
      g.set(i, Math.floor(i / 2), W);
      g.set(Math.floor(i / 2), i, W);
    }
    for (const r of [4, 8, 12])
      for (let a = 0; a <= 40; a++) {
        const t = (a / 40) * (Math.PI / 2);
        g.set(Math.round(r * Math.cos(t) * 0.95), Math.round(r * Math.sin(t) * 0.95), W);
      }
  });

const iconTex = () =>
  pixelArt(
    [".sssssss.", "sssssssss", "sddsssdds", "sddsssdds", "ssssdssss", ".sssssss.", "..sdsds..", "..sssss.."],
    { s: "#6b6880", d: "#14121c" },
  );

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "dungeon-props" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const put = (geo: THREE.BufferGeometry, color: any, at: any, o: any = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: any, o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const plane = (w: number, h: number, color: any, at: any, o: any = {}) =>
    put(new THREE.PlaneGeometry(w, h), color, at, { dir: [0, 0, 1], axis: "z", ...o });

  const wp = woodPaint(6, 1);
  const R = rng(11);

  // ------------------------------------------------------------------ floor
  const FLAGS = [flagTile(0), flagTile(1), flagTile(2)];
  for (let i = 0; i < 7; i++)
    for (let j = 0; j < 5; j++) {
      if ((i === 3 || i === 4) && (j === 2 || j === 3)) continue; // spike pit hole
      const x = -1.2 + i * 0.4;
      const z = -0.8 + j * 0.4;
      const k = Math.floor(hsh(i, j, 77) * 3);
      put(tileBox([0.4, FY, 0.4], FLAGS[k], T), "#ffffff", [x, FY / 2, z], { texture: FLAGS[k] });
    }

  // ------------------------------------------------------------------ back wall
  const BRICK = brickTile();
  const wallTop = [
    [-0.8, 0.4],
    [0, 0.4],
    [0.8, 0.2],
  ];
  for (let col = 0; col < 3; col++)
    for (let row = 0; row < 3; row++) {
      const x = -0.8 + col * 0.8;
      const h = row === 2 ? wallTop[col][1] : 0.4;
      put(tileBox([0.8, h, 0.2], BRICK, F, { rand: R, step: [8, 16] }), "#ffffff", [x, FY + row * 0.4 + h / 2, -0.9], {
        texture: BRICK,
      });
    }
  // loose stones on the broken wall top
  box(0.28, 0.1, 0.16, STONEP, [0.95, FY + 1.05 + 0.05 - 0.0, -0.9], { rotation: [0, 8, 0] });
  box(0.16, 0.08, 0.14, STONEP, [0.72, FY + 1.04, -0.9], { rotation: [0, -12, 0] });

  // pillars with skull reliefs
  const ICON = iconTex();
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++)
      put(tileBox([0.3, 0.4, 0.3], BRICK, F, { rand: R, step: [8, 16] }), "#ffffff", [s * 1.25, FY + 0.2 + i * 0.4, -0.85], {
        texture: BRICK,
      });
    box(0.32, 0.08, 0.34, STONEP, [s * 1.25, FY + 1.64, -0.83]);
    box(0.34, 0.06, 0.34, STONEP, [s * 1.25, FY + 0.03, -0.83]);
    plane(0.144, 0.128, "#ffffff", [s * 1.25, FY + 0.95, -0.697], { texture: ICON });
  }

  // banner
  const BANNER = bannerTex();
  box(0.5, 0.03, 0.03, wp, [0, FY + 1.12, -0.78]);
  for (const s of [1, -1]) box(0.05, 0.05, 0.05, GOLD, [s * 0.26, FY + 1.12, -0.78]);
  plane(0.4, 0.7, "#ffffff", [0, FY + 0.75, -0.795], { texture: BANNER });

  // cobweb in the corner
  plane(0.28, 0.28, "#ffffff", [-1.0, FY + 1.06, -0.797], { texture: webTex() });

  // hanging chain with a cuff
  box(0.07, 0.04, 0.04, IRONP, [0.95, FY + 1.22, -0.78]);
  for (let i = 0; i < 9; i++) {
    const flat = i % 2 === 0;
    box(flat ? 0.034 : 0.012, 0.055, flat ? 0.012 : 0.034, IRONP, [0.95, FY + 1.17 - i * 0.048, -0.775]);
  }
  box(0.08, 0.05, 0.05, IRONP, [0.95, FY + 1.17 - 9 * 0.048 - 0.02, -0.775]);

  // ------------------------------------------------------------------ torches
  const HALO = haloTex();
  const FLAME_O = stepped([[-2, 2], [-3, 3], [-3, 3], [-3, 2], [-2, 3], [-2, 2], [-1, 2], [-1, 1], [0, 1]], 0.02, { rows: true });
  const FLAME_M = stepped([[-1.5, 1.5], [-2, 2], [-2, 1.5], [-1.5, 2], [-1, 1.5], [-0.5, 1]], 0.02, { rows: true });
  const FLAME_I = stepped([[-1, 1], [-1, 1], [-1, 0.5], [-0.5, 1]], 0.02, { rows: true });

  function torch(name: string, x: number) {
    const tilt = 20 * DEGR;
    const d = new THREE.Vector3(0, Math.cos(tilt), Math.sin(tilt));
    const p0 = new THREE.Vector3(x, FY + 0.6, -0.77);
    const at = (t: number) => p0.clone().addScaledVector(d, t);
    box(0.13, 0.22, 0.03, IRONP, [x, FY + 0.62, -0.785]);
    box(0.016, 0.016, 0.016, IRON[4], [x - 0.045, FY + 0.69, -0.768]);
    box(0.016, 0.016, 0.016, IRON[4], [x + 0.045, FY + 0.55, -0.768]);
    put(new THREE.BoxGeometry(0.05, 0.46, 0.05), wp, at(0.23), { dir: d.clone() });
    put(new THREE.BoxGeometry(0.09, 0.04, 0.09), IRONP, at(0.1), { dir: d.clone() });
    put(new THREE.BoxGeometry(0.09, 0.15, 0.09), HEADP, at(0.5), { dir: d.clone() });
    put(new THREE.BoxGeometry(0.105, 0.03, 0.105), IRONP, at(0.43), { dir: d.clone() });
    put(new THREE.BoxGeometry(0.105, 0.03, 0.105), IRONP, at(0.57), { dir: d.clone() });
    const fb = at(0.58);
    const fj = b.joint(name, { parent: root, at: fb });
    for (const ori of [[1, 0, 0], [0, 0, 1]] as [number, number, number][]) {
      glow(b.extrude(FLAME_O, { at: fb, x: ori, thickness: 0.045, color: "#e8431a", bone: fj }), 1);
      glow(b.extrude(FLAME_M, { at: fb, x: ori, thickness: 0.055, color: "#ff9a2a", bone: fj }), 1.1);
      glow(b.extrude(FLAME_I, { at: fb, x: ori, thickness: 0.065, color: "#fff0a0", bone: fj }), 1.2);
    }
    for (let i = 0; i < 4; i++) {
      const sx = fb.x + (hsh(i, x * 10, 31) - 0.5) * 0.16;
      const sy = fb.y + 0.2 + i * 0.05 + hsh(i, x * 10, 32) * 0.04;
      const sz = fb.z + (hsh(i, x * 10, 33) - 0.5) * 0.1;
      glow(box(0.012, 0.012, 0.012, i % 2 ? "#ffd04a" : "#ff7a1a", [sx, sy, sz], { bone: fj }), 1.2);
    }
    glow(plane(0.55, 0.55, "#ffffff", [x, fb.y + 0.1, -0.79], { texture: HALO }), 0.8);
  }
  torch("flameL", -0.65);
  torch("flameR", 0.65);

  // burnt-out torch on the floor
  {
    const [bx, bz] = [0.85, 0.82];
    box(0.05, 0.05, 0.44, wp, [bx, FY + 0.026, bz], { rotation: [0, 100, 0] });
    const [hx, hz] = rot(0, 0.25, 100);
    box(0.09, 0.09, 0.14, HEADP, [bx + hx, FY + 0.046, bz + hz], { rotation: [0, 100, 0] });
  }

  // ------------------------------------------------------------------ chest
  const cx = -0.65;
  const cz = -0.38;
  const W = 0.8;
  const D = 0.5;
  const H = 0.375;
  box(W, H, 0.04, wp, [cx, FY + H / 2, cz + D / 2 - 0.02]);
  box(W, H, 0.04, wp, [cx, FY + H / 2, cz - D / 2 + 0.02]);
  for (const s of [1, -1]) box(0.04, H, D - 0.08, wp, [cx + s * (W / 2 - 0.02), FY + H / 2, cz]);
  box(W - 0.08, 0.04, D - 0.08, wp, [cx, FY + 0.02, cz]);
  box(W + 0.04, 0.05, D + 0.04, IRONP, [cx, FY + 0.025, cz]);

  // treasure
  const GOLDT = goldTex();
  glow(
    put(tileBox([0.7, 0.3, 0.4], GOLDT, F), "#ffffff", [cx, FY + 0.19, cz], { texture: GOLDT }),
    0.9,
  );
  glow(
    put(tileBox([0.4, 0.06, 0.24], GOLDT, F), "#ffffff", [cx + 0.05, FY + 0.37, cz - 0.02], { texture: GOLDT }),
    0.9,
  );
  glow(box(0.045, 0.045, 0.045, "#ff3355", [cx - 0.18, FY + 0.36, cz + 0.08], { rotation: [0, 25, 0] }), 1.2);
  glow(box(0.04, 0.04, 0.04, "#3aa0ff", [cx + 0.22, FY + 0.43, cz - 0.04], { rotation: [0, 40, 0] }), 1.2);
  glow(box(0.035, 0.035, 0.035, "#3dff8a", [cx - 0.02, FY + 0.43, cz + 0.06], { rotation: [0, 10, 0] }), 1.2);

  // corner brackets, bands and lock
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      box(0.07, H + 0.04, 0.07, IRONP, [cx + sx * (W / 2), FY + H / 2 + 0.02, cz + sz * (D / 2)]);
  for (const dx of [-0.24, 0.24])
    for (const sz of [1, -1]) box(0.08, H, 0.03, IRONP, [cx + dx, FY + H / 2, cz + sz * (D / 2 + 0.005)]);
  box(0.14, 0.15, 0.03, IRONP, [cx, FY + H - 0.11, cz + D / 2 + 0.015]);
  plane(0.12, 0.13, "#ffffff", [cx, FY + H - 0.11, cz + D / 2 + 0.032], { texture: lockTex() });

  // lid on a hinge joint
  const lid = b.joint("lidHinge", { parent: root, at: [cx, FY + H, cz - D / 2], role: "hinge" });
  const LIDS: [number, number][] = [[0, 20], [0, 20], [0, 20], [1, 19], [2, 18], [4, 16]];
  const lidOutline = stepped(LIDS, T, { rows: true });
  const bandOutline = stepped(
    LIDS.map(([a, c]) => [a - 0.4, c + 0.4] as [number, number]),
    [T, T * 1.07],
    { rows: true },
  );
  const lidAt: [number, number, number] = [cx, FY + H, cz - D / 2];
  b.extrude(lidOutline, { at: lidAt, thickness: W + 0.02, color: wp, bone: lid });
  for (const dx of [-0.24, 0.24])
    b.extrude(bandOutline, { at: [cx + dx, FY + H, cz - D / 2], thickness: 0.08, color: IRONP, bone: lid });
  for (const s of [1, -1])
    b.extrude(bandOutline, { at: [cx + s * 0.39, FY + H, cz - D / 2], thickness: 0.04, color: IRONP, bone: lid });
  box(0.07, 0.1, 0.02, IRONP, [cx, FY + H + 0.05, cz + D / 2 + 0.02], { bone: lid });
  b.pose(lid, { axis: [1, 0, 0], deg: -55 });

  // coins spilled in front of the chest
  for (let i = 0; i < 7; i++) {
    const x = cx + (hsh(i, 1, 41) - 0.5) * 0.9;
    const z = cz + D / 2 + 0.1 + hsh(i, 2, 42) * 0.25;
    glow(box(0.045, 0.01, 0.045, i % 3 ? GOLD : "#d6962a", [x, FY + 0.005, z], { rotation: [0, hsh(i, 3, 43) * 90, 0] }), 0.8);
  }

  // ------------------------------------------------------------------ barrels
  const rr = (t: number) => (t < 0.25 ? 0.21 + 0.06 * (t / 0.25) : 0.27 - 0.06 * ((t - 0.25) / 0.25));
  const BY = barrelPaint(1);
  const BZ = barrelPaint(2);
  function barrel(x: number, z: number, kind: "closed" | "open" | "lying") {
    const lying = kind === "lying";
    const a = new THREE.Vector3(0, lying ? 0 : 1, lying ? 1 : 0);
    const o = lying ? new THREE.Vector3(x, FY + 0.27, z - 0.25) : new THREE.Vector3(x, FY, z);
    const P = (t: number, off: [number, number, number] = [0, 0, 0]) =>
      o.clone().addScaledVector(a, t).add(new THREE.Vector3(...off));
    const orient = () => (lying ? { dir: a.clone() } : { rotation: [0, 22.5, 0] });
    const paint = lying ? BZ : BY;
    const cyl = (rt: number, rb: number, h: number, t: number, col: any, off: [number, number, number] = [0, 0, 0]) =>
      put(new THREE.CylinderGeometry(rt, rb, h, 8), col, P(t, off), { ...orient(), flat: true });

    cyl(0.27, 0.21, 0.25, 0.125, paint);
    if (kind === "open") {
      cyl(rr(0.44), 0.27, 0.19, 0.345, paint);
      b.lathe(
        [
          [0.17, 0],
          [rr(0.44), 0],
          [0.21, 0.06],
          [0.17, 0.06],
        ],
        { at: P(0.44), segments: 8, spin: 22.5, color: paint, bone: root },
      );
      glow(cyl(0.17, 0.17, 0.01, 0.48, "#5cff7a"), 0.9);
      glow(box(0.03, 0.03, 0.03, "#b8ffc4", [x - 0.05, FY + 0.55, z + 0.03], { rotation: [0, 20, 0] }), 1.2);
      glow(box(0.02, 0.02, 0.02, "#b8ffc4", [x + 0.07, FY + 0.6, z - 0.04]), 1.2);
    } else {
      cyl(0.21, 0.27, 0.25, 0.375, paint);
    }
    const hoops = kind === "open" ? [0.05, 0.19, 0.31, 0.4] : [0.05, 0.19, 0.31, 0.45];
    for (const t of hoops) {
      const r = rr(t) + 0.016;
      cyl(r, r, 0.04, t, IRONP);
    }
    if (lying) {
      box(0.03, 0.03, 0.07, "#c98a1c", P(0.535, [0, -0.09, 0]));
      box(0.05, 0.02, 0.02, "#c98a1c", P(0.56, [0, -0.075, 0]));
      glow(put(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 8), "#44d65e", [x, FY + 0.004, z + 0.5], { flat: true }), 0.7);
      glow(put(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 8), "#44d65e", [x + 0.12, FY + 0.004, z + 0.58], { flat: true }), 0.7);
    } else if (kind === "closed") {
      box(0.34, 0.012, 0.045, IRONP, P(0.5, [0, 0, 0]), { rotation: [0, 45, 0] });
      box(0.34, 0.012, 0.045, IRONP, P(0.5, [0, 0, 0]), { rotation: [0, -45, 0] });
    }
  }
  barrel(1.1, -0.5, "closed");
  barrel(0.55, -0.52, "open");
  barrel(1.05, 0.3, "lying");

  // ------------------------------------------------------------------ spike trap
  const PX = 0.2;
  const PZ = 0.2;
  box(0.8, 0.03, 0.8, PITP, [PX, 0.015, PZ]);
  for (const s of [1, -1]) {
    box(0.88, 0.04, 0.07, STONEP, [PX, FY + 0.01, PZ + s * 0.4]);
    box(0.07, 0.04, 0.74, STONEP, [PX + s * 0.4, FY + 0.01, PZ]);
  }
  const trap = b.joint("spikeTrap", { parent: root, at: [PX, 0.07, PZ] });
  box(0.76, 0.04, 0.76, IRONP, [PX, 0.05, PZ], { bone: trap });
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const sx = PX + (i - 1.5) * 0.18;
      const sz = PZ + (j - 1.5) * 0.18;
      const tall = i === 2 && j === 1;
      const h = tall ? 0.36 : 0.18 + 0.14 * hsh(i, j, 21);
      put(new THREE.ConeGeometry(0.052, h, 4), (i + j) % 3 === 0 ? SPIKEB : SPIKEP, [sx, 0.07 + h / 2 - 0.005, sz], {
        bone: trap,
        rotation: [0, 45, 0],
        flat: true,
      });
      if (tall) {
        // a rusty helmet impaled on the tallest spike
        const rot3 = { bone: trap, rotation: [8, 20, 5] };
        box(0.14, 0.05, 0.14, IRONP, [sx, 0.3, sz], rot3);
        box(0.115, 0.05, 0.115, IRONP, [sx, 0.35, sz], rot3);
        box(0.08, 0.04, 0.08, IRONP, [sx, 0.395, sz], rot3);
        box(0.18, 0.015, 0.18, IRONP, [sx, 0.275, sz], rot3);
        box(0.02, 0.07, 0.03, "#8a1a1c", [sx, 0.33, sz + 0.075], rot3);
      }
    }
  // warning rune in front of the pit
  glow(
    plane(0.32, 0.32, "#ffffff", [PX, FY + 0.004, 0.82], { texture: runeTex(), dir: [0, 1, 0], up: [0, 0, -1] }),
    0.8,
  );

  // ------------------------------------------------------------------ bones
  const SKP = 0.0175;
  const SKT = skullSheet();
  function skull(x: number, z: number, yaw: number) {
    const jawH = 3 * SKP;
    const crH = 7 * SKP;
    const [jx, jz] = rot(0, 0.02, yaw);
    put(skinBox(SKT, SK.faces.jaw, SKP), "#ffffff", [x + jx, FY + jawH / 2, z + jz], { texture: SKT, rotation: [0, yaw, 0] });
    put(skinBox(SKT, SK.faces.skull, SKP), "#ffffff", [x, FY + jawH + crH / 2 - 0.012, z], {
      texture: SKT,
      rotation: [0, yaw, 0],
    });
    for (const s of [1, -1]) {
      const [ex, ez] = rot(s * 0.035, 0.0715, yaw);
      glow(
        plane(0.02, 0.02, "#ff3b3b", [x + ex, FY + jawH + crH / 2 - 0.012 - 0.00875, z + ez], { dir: undefined, rotation: [0, yaw, 0] }),
        1.2,
      );
    }
  }
  skull(-0.72, 0.8, 18);

  function femur(x: number, z: number, yaw: number, len: number, lift = 0) {
    const [dx, dz] = rot(0, 1, yaw);
    const [px, pz] = rot(1, 0, yaw);
    box(0.032, 0.032, len, BONEP, [x, FY + 0.018 + lift, z], { rotation: [0, yaw, 0] });
    for (const e of [1, -1])
      for (const s of [1, -1])
        box(0.04, 0.04, 0.04, BONEP, [x + e * (len / 2) * dx + s * 0.017 * px, FY + 0.022 + lift, z + e * (len / 2) * dz + s * 0.017 * pz], {
          rotation: [0, yaw, 0],
        });
  }
  femur(-1.12, 0.68, 30, 0.34);
  femur(-1.1, 0.7, -35, 0.32, 0.034);
  femur(-0.38, 0.9, 80, 0.26);

  // ribcage with spine
  const spineX = -0.72;
  for (let i = 0; i < 6; i++) box(0.045, 0.035, 0.04, BONEP, [spineX, FY + 0.02, 0.2 + i * 0.075]);
  for (let i = 1; i < 6; i++) {
    const z = 0.2 + i * 0.075;
    const k = 1 - 0.1 * Math.abs(i - 2.5) / 2.5;
    for (const s of [1, -1]) {
      const pts = [
        [0, 0.02],
        [0.05, 0.075],
        [0.11, 0.1],
        [0.165, 0.065],
        [0.19, 0.015],
      ].map(([u, yy]) => [spineX + s * u * k, FY + yy * k + 0.005, z]);
      b.sweep(catmull(pts), 0.011, { section: "box", caps: "flat", color: BONEP, bone: root });
    }
  }
  // loose fragments
  for (let i = 0; i < 6; i++) {
    const x = -1.25 + hsh(i, 1, 51) * 0.9;
    const z = 0.15 + hsh(i, 2, 52) * 0.8;
    const s = 0.025 + hsh(i, 3, 53) * 0.03;
    box(s, 0.02, s * 1.5, BONEP, [x, FY + 0.01, z], { rotation: [0, hsh(i, 4, 54) * 180, 0] });
  }

  // rubble
  for (let i = 0; i < 9; i++) {
    const x = -1.3 + hsh(i, 5, 61) * 2.6;
    const z = -0.7 + hsh(i, 6, 62) * 0.15;
    const s = 0.04 + hsh(i, 7, 63) * 0.06;
    if (Math.abs(x - 0.55) < 0.28 || Math.abs(x - 1.1) < 0.28 || Math.abs(x + 0.65) < 0.45) continue;
    box(s, s * 0.7, s * 1.1, STONEP, [x, FY + s * 0.35, z], { rotation: [0, hsh(i, 8, 64) * 180, 0] });
  }

  return b.root;
}
```