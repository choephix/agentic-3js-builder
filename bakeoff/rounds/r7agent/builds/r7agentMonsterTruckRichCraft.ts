// Mud Goblin: a pixel-art monster truck. A goblin-faced fibreglass pickup shell (flames, number roundel, mascot
// doors) on a tubular chassis, 1.8 m lugged tyres, nitrogen shocks, open net windows and a helmeted driver.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { lerp } from "../../../../src/math";
import { cellPaint, pixelTexture, skinBox, skinLayout, tileBox, type Cell } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Mud Goblin Monster Truck",
  description:
    "Pixel-art monster truck: goblin-faced green pickup shell with flame job, 1.8 m lugged tyres, nitrogen shocks, four-link axles, net windows and a helmeted driver. Wheels, steering, doors, hood, tailgate and wheel hinge.",
  style: "pixel art",
  commit: "88fc1f0",
};

type V = [number, number, number];

const T = 0.04; // one texel, meters
const WX = 1.3; // wheel centre x
const WY = 0.895; // wheel centre y (tyre radius 0.9)
const ZF = 1.55;
const ZR = -1.55;

// ---------------------------------------------------------------------------------------------------------------
// Pixel font and helpers

const FONT: Record<string, string[]> = {
  M: ["X...X", "XX.XX", "X.X.X", "X...X", "X...X"],
  U: ["X.X", "X.X", "X.X", "X.X", "XXX"],
  D: ["XX.", "X.X", "X.X", "X.X", "XX."],
  G: [".XX", "X..", "X.X", "X.X", ".XX"],
  O: ["XXX", "X.X", "X.X", "X.X", "XXX"],
  B: ["XX.", "X.X", "XX.", "X.X", "XXX"],
  L: ["X..", "X..", "X..", "X..", "XXX"],
  I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
  N: ["X..X", "XX.X", "X.XX", "X..X", "X..X"],
  "1": [".X.", "XX.", ".X.", ".X.", "XXX"],
  "3": ["XX.", "..X", ".X.", "..X", "XX."],
  " ": ["..", "..", "..", "..", ".."],
};

type Bitmap = { w: number; h: number; on: boolean[][] };

function textBitmap(text: string, scale: number, gap: number): Bitmap {
  const glyphs = [...text].map((ch) => FONT[ch]);
  const w = glyphs.reduce((a, g) => a + g[0].length * scale, 0) + gap * (glyphs.length - 1);
  const h = 5 * scale;
  const on = Array.from({ length: h }, () => Array<boolean>(w).fill(false));
  let x0 = 0;
  for (const g of glyphs) {
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < g[0].length; x++)
        if (g[y][x] === "X")
          for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) on[y * scale + dy][x0 + x * scale + dx] = true;
    x0 += g[0].length * scale + gap;
  }
  return { w, h, on };
}

const bitAt = (bm: Bitmap, col: number, row: number) =>
  col >= 0 && col < bm.w && row >= 0 && row < bm.h && bm.on[row][col];

/** 1 on a glyph pixel, 2 on its one-pixel outline, 0 elsewhere. */
function textPix(bm: Bitmap, col: number, row: number): 0 | 1 | 2 {
  if (bitAt(bm, col, row)) return 1;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (bitAt(bm, col + dx, row + dy)) return 2;
  return 0;
}

const h01 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const idx = (v: number) => Math.floor(v / T + 1e-6);

const GOBLIN = textBitmap("GOBLIN", 2, 1);
const MUDGOB = textBitmap("MUD GOBLIN", 1, 1);
const NUM13 = textBitmap("13", 3, 2);

const MASCOT = [
  "kk........kk",
  "kgk.kkkk.kgk",
  ".kgkggggkgk.",
  "..kggggggk..",
  "..kyykkyyk..",
  "..kggggggk..",
  "..kgdggdgk..",
  "..kggggggk..",
  "..kwrrrrwk..",
  "...kkrrkk...",
  "....kkkk....",
];
const MASCOT_PAL: Record<string, string> = {
  k: "#1a1230",
  g: "#7be03a",
  d: "#2f8f22",
  y: "#ffe14a",
  w: "#ffffff",
  r: "#d4302a",
};

// ---------------------------------------------------------------------------------------------------------------
// Paints

const GREEN = ["#14461a", "#1f6d22", "#2f9a2c", "#55c935", "#9bef5a"];
const MUDS = ["#4a3320", "#6b4a2b", "#8a6238"];
const PURPLE = "#2a1344";
const CREAM = "#fff0b8";

function flame(d: number, lat: number, seed: number): string | null {
  const laneW = 0.2;
  const lane = Math.floor(lat / laneW);
  const ph = lat / laneW - lane;
  const edge = Math.abs(2 * ph - 1);
  const L = (0.9 + 2.0 * h01(lane * 3.7 + seed)) * (1 - Math.pow(edge, 1.4));
  if (d < 0 || d > L) return null;
  if (L - d < 0.07) return "#4a1456";
  const k = d / Math.max(L, 0.001);
  if (k > 0.65) return "#ff4d1f";
  if (k > 0.35) return "#ffa11f";
  return "#ffe45a";
}

function mud(c: Cell, top: number, seed: number) {
  const y = c.at.y;
  if (y >= top) return null;
  const p = ((top - y) / top) * 0.7;
  const r = c.random(seed);
  return r < p ? MUDS[Math.floor((r / p) * 3)] : null;
}

const BODY = cellPaint(T, (c) => {
  const { x, y, z } = c.at;
  const n = c.n;
  const ax = Math.abs(x);
  const s = x >= 0 ? 1 : -1;
  const outer = c.axis === 0 && Math.sign(n.x) === s;
  if (n.y < -0.6) return c.pick(["#0f0d16", "#1c1830"], c.random(1) * 0.8);
  const exteriorZ = c.axis === 2 && ((n.z > 0 && (z > 2.4 || y > 3.0)) || (n.z < 0 && (z < -2.4 || y > 3.0)));
  // interior liner
  if ((c.axis === 0 && !outer) || (c.axis === 2 && !exteriorZ) || (n.y > 0.5 && y < 2.02 && ax < 1.06)) {
    if (n.y > 0.5) return (c.axis === 1 ? c.v : 0) % 4 === 0 || c.u % 6 === 0 ? "#1b1d23" : "#2a2d34";
    return c.pick(["#10281a", "#173a22", "#1f4a2b"], 0.3 + 0.4 * c.random(4));
  }
  // fascia: goblin mouth
  if (c.axis === 2 && n.z > 0 && z > 2.4 && y < 3.0) {
    const k = c.u + 13;
    const ry = idx(y) - idx(2.0);
    if (ax <= 0.52 && ry >= 0 && ry <= 12) {
      const mt = k % 4;
      const mb = (k + 2) % 4;
      if ((ry === 12) || (ry === 11 && (mt === 1 || mt === 2)) || (ry === 10 && mt === 1)) return mt === 1 ? CREAM : "#e8d08a";
      if ((ry === 0) || (ry === 1 && (mb === 1 || mb === 2)) || (ry === 2 && mb === 1)) return mb === 1 ? CREAM : "#e8d08a";
      return k % 6 === 0 ? "#5a1414" : ry > 6 ? "#2a0a0a" : "#3c1010";
    }
    if (ax <= 0.56 && y >= 1.98 && y < 2.54) return "#14141a";
  }
  // tailgate lettering
  if (c.axis === 2 && n.z < 0 && z < -2.4 && y > 2.0 && y < 2.6) {
    const col = idx(0.78) - idx(x);
    const row = idx(2.45) - idx(y);
    const px = textPix(MUDGOB, col, row);
    if (px === 1) return "#fff6d8";
    if (px === 2) return PURPLE;
    if (ax < 0.84 && ax > 0.8 && row >= -1 && row < 6) return "#ffd02a";
  }
  // roof roundel and number
  if (c.axis === 1 && n.y > 0.5 && y > 3.1) {
    if (ax < 0.64 && z > -0.42 && z < 0.46) {
      const col = c.u - idx(-0.4);
      const row = idx(z) - idx(-0.3);
      if (ax >= 0.6 || z <= -0.38 || z >= 0.42) return "#ffd02a";
      const px = textPix(NUM13, col, row);
      if (px === 1) return "#fff6d8";
      return PURPLE;
    }
  }
  if (outer && ax > 1.0) {
    // bed name
    if (z < -0.55 && z > -2.5 && y >= 2.1 && y < 2.6) {
      const idxA = idx(-0.62);
      const col = s > 0 ? idxA - idx(z) : idx(z) - (idxA - GOBLIN.w + 1);
      const row = idx(2.54) - idx(y);
      const px = textPix(GOBLIN, col, row);
      if (px === 1) return "#fff6d8";
      if (px === 2) return PURPLE;
    }
    // door mascot
    if (z > 0.1 && z < 0.8 && y > 1.97 && y < 2.56) {
      const idxM = idx(0.78);
      const col = s > 0 ? idxM - idx(z) : idx(z) - (idxM - 13);
      const row = idx(2.54) - idx(y);
      if (col >= 0 && col <= 13 && row >= 0 && row <= 12) {
        if (col === 0 || col === 13 || row === 0 || row === 12) return "#ffd02a";
        const ch = MASCOT[row - 1][col - 1];
        return ch === "." ? PURPLE : MASCOT_PAL[ch];
      }
    }
    // panel seams
    if (y < 2.56 && (Math.abs(z - 0.85) < T / 2 || Math.abs(z + 0.05) < T / 2 || Math.abs(z + 0.55) < T / 2) && y > 1.97)
      return "#0e3512";
    // flames licking back from the nose
    if (y >= 1.97 && y < 2.56 && z < 2.56 && z > -0.6) {
      const d = 2.56 - z;
      const f = flame(d, y - 1.97 - 0.12 * d + 1.0, 3);
      if (f) return f;
    }
    if (y >= 2.51 && y < 2.56) return PURPLE;
    if (y < 2.01 && y >= 1.97) return PURPLE;
  }
  // hood top flames and seams
  if (c.axis === 1 && n.y > 0.5 && y > 2.5 && y < 2.6 && z > 0.8) {
    if (Math.abs(z - 0.85) < T / 2 || Math.abs(ax - 1.05) < T / 2) return "#0e3512";
    const d = 2.56 - z;
    const f = flame(d, ax - 0.07 * d, 11);
    if (f) return f;
  }
  // body shading
  let v = n.y > 0.5 ? 0.92 : n.y > 0.2 ? 0.78 : c.axis === 0 ? (n.x > 0 ? 0.62 : 0.52) : 0.56;
  v += (c.random(2) - 0.5) * 0.14;
  if (y < 2.1) v -= (2.1 - y) * 1.1;
  if (y > 2.5 && c.axis !== 1) v += 0.12;
  const m = y < 2.2 ? mud(c, 2.2, 5) : null;
  return m ?? c.pick(GREEN, Math.min(Math.max(v, 0), 1));
});

const FLARE = cellPaint(T, (c) => {
  const n = c.n;
  const m = mud(c, 1.9, 9);
  if (m) return m;
  const v = (n.y > 0.5 ? 0.85 : n.y > 0 ? 0.6 : 0.3) + (c.random(3) - 0.5) * 0.18 + (c.axis === 0 ? 0.05 : 0);
  return c.pick(["#1a0f2e", "#2a1344", "#3d2063", "#5a3490"], Math.min(Math.max(v, 0), 1));
});

const STEEL = cellPaint(0.03, (c) => {
  if (c.random(7) > 0.975) return "#8b94a3";
  const m = mud(c, 1.3, 2);
  if (m) return m;
  const v = 0.45 + 0.3 * c.n.y + 0.08 * c.n.x + (c.random(3) - 0.5) * 0.22;
  return c.pick(["#14161b", "#232730", "#343a46", "#4c5463", "#6a7488"], Math.min(Math.max(v, 0), 1));
});

const CHROME = cellPaint(0.03, (c) => {
  if (c.random(1) > 0.97) return "#ffffff";
  const t = c.n.y * 0.8 + c.n.x * 0.25 + c.n.z * 0.25;
  const glint = (c.u + c.v) % 9 === 0 ? 1 : 0;
  const base = t > 0.55 ? "#f4fbff" : t > 0.2 ? "#bcd4e6" : t > -0.1 ? "#5f7488" : t > -0.35 ? "#2a3441" : "#8b7a63";
  return glint && t > -0.1 ? "#ffffff" : base;
});

const RUBBER = cellPaint(T, (c) => {
  const m = mud(c, 1.0, 6);
  if (m) return m;
  return c.pick(["#0e0e12", "#17171c", "#222229"], 0.15 + 0.7 * c.random(1));
});

const SEAT = cellPaint(T, (c) => {
  const edge = c.u % 6 === 0 && c.axis !== 1 ? 1 : 0;
  return c.pick(["#15151a", "#24242c", "#34343e"], 0.35 + 0.45 * c.random(2) + (edge ? 0.2 : 0));
});

const SUIT = cellPaint(T, (c) => {
  if (c.axis === 2 && c.n.z > 0 && c.at.y > 2.44 && c.at.y < 2.5) return "#fff6d8";
  return c.pick(["#8a1a22", "#d4302a", "#ff5a3a"], 0.3 + 0.4 * c.random(3) + 0.2 * c.n.y);
});

const BLUE = cellPaint(0.03, (c) => {
  const t = c.n.y * 0.7 + c.n.x * 0.3 + c.n.z * 0.2;
  return c.pick(["#142a6a", "#1f44b0", "#2a56d6", "#6a90ff"], 0.5 + 0.45 * t + (c.random(1) - 0.5) * 0.15);
});

const ORANGE = cellPaint(0.03, (c) => {
  const t = c.n.y * 0.7 + c.n.x * 0.3 + c.n.z * 0.2;
  return c.pick(["#a03c06", "#d86a10", "#ff8a1c", "#ffc060"], 0.5 + 0.45 * t + (c.random(1) - 0.5) * 0.12);
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const SIDEWALL = pixelTexture(38, 38, (g) => {
  const cx = 19;
  g.fill((x, y) => {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cx;
    const r = Math.hypot(dx, dy) / cx;
    const a = Math.atan2(dy, dx);
    const sector = (a + Math.PI) / (2 * Math.PI);
    if (r > 1) return "";
    if (dy > 0.3 * cx && h01(x * 13.1 + y * 7.7) > 0.55 + (1 - dy / cx) * 0.4 && r > 0.64) return "#5a3d22";
    if (r < 0.06) return "#ff8a1c";
    if (r < 0.13) return "#2c2f38";
    if (r < 0.2) return "#14141a";
    if (r < 0.56) {
      const slot = (sector * 8) % 1;
      if (r > 0.3 && r < 0.5 && slot > 0.3 && slot < 0.7) return "#14141a";
      const lum = 0.5 - (0.5 * (dx + dy)) / cx;
      return lum > 0.62 ? "#ffb347" : lum > 0.3 ? "#ff8a1c" : "#c25a0c";
    }
    if (r < 0.64) {
      const bolt = (sector * 16) % 1;
      if (r > 0.58 && r < 0.62 && bolt > 0.35 && bolt < 0.65) return "#2a3441";
      return -(dx + dy) > 0 ? "#f4fbff" : "#8fa6ba";
    }
    if (r > 0.95) return "#0c0c10";
    if (r > 0.7 && r < 0.74) return "#2e2e38";
    if (r > 0.9 && r < 0.93) return "#2e2e38";
    const tick = (sector * 24) % 1;
    if (r > 0.78 && r < 0.88 && tick < 0.2) return "#2a2a33";
    const dash = Math.floor(sector * 40);
    if (r > 0.78 && r < 0.86 && [3, 4, 6, 9, 10, 12].includes(dash)) return "#d8d4c4";
    return "#1c1c22";
  });
});

const LUGTEX = pixelTexture(8, 8, (g) => {
  g.fill((x, y) => {
    const r = h01(x * 9.1 + y * 17.3);
    return r > 0.8 ? "#34343c" : r < 0.25 ? "#101014" : "#202026";
  });
});

function netTexture(w: number, h: number) {
  return pixelTexture(w, h, (g) => {
    g.fill((x, y) => {
      const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      if (x % 4 === 0 && y % 4 === 0) return "#4a4b58";
      return edge || x % 4 === 0 || y % 4 === 0 ? "#1f2026" : "";
    });
  });
}
const NET_DOOR = netTexture(19, 12);
const NET_REAR = netTexture(47, 12);
const NET_QUARTER = netTexture(11, 12);

const WINDSHIELD = pixelTexture(52, 13, (g) => {
  g.fill((x, y, w, h) => {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return "#15151a";
    if (y < 3) return y === 1 ? "#0e2c46" : "#17466e";
    const d = (x + y * 3) % 26;
    if (d < 3) return "#b4e8f8";
    if (d >= 13 && d < 15) return "#78bcd8";
    return y < 7 ? "#2a7aa0" : "#246a8c";
  });
});

const DASH = pixelTexture(50, 8, (g) => {
  g.fill((x, y) => (y === 0 || y === 7 ? "#2a2d34" : "#15151a"));
  for (const cx of [10, 18, 26]) {
    for (let y = -2; y <= 2; y++)
      for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) <= 3) g.set(cx + x, 3 + y, Math.abs(x) + Math.abs(y) === 3 ? "#aab4c0" : "#0e1a24");
    g.set(cx, 3, "#ff4d1f");
    g.set(cx + 1, 2, "#ff4d1f");
  }
  const sw = ["#ffd02a", "#d4302a", "#2a56d6", "#7be03a", "#ff8a1c", "#fff6d8"];
  sw.forEach((col, i) => {
    g.set(34 + i * 2, 3, col);
    g.set(34 + i * 2, 4, col);
  });
});

const FLAG = pixelTexture(8, 5, (g) => g.fill((x, y) => ((x + y) % 2 === 0 ? "#fff6d8" : "#15151a")));

const PLATE = pixelTexture(14, 7, (g) => {
  g.fill((x, y, w, h) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#2a56d6" : "#fff6d8"));
  const bm = textBitmap("G13", 1, 1);
  for (let y = 0; y < bm.h; y++) for (let x = 0; x < bm.w; x++) if (bm.on[y][x]) g.set(2 + x, 1 + y, "#1a1230");
  g.set(1, 6, "#fff6d8");
});

const HL = skinLayout({ head: [7, 7, 7] });
const HELM = pixelTexture(HL.size[0], HL.size[1], (g) => {
  const f = HL.faces.head;
  for (const r of Object.values(f)) g.fill((_x, y, _w, h) => (y < h * 0.55 ? "#f4efe0" : "#d6cdb8"), r);
  g.fill((x) => (x === 3 ? "#ff8a1c" : undefined), f.py);
  g.fill((_x, y) => (y === 3 ? "#2a1344" : undefined), f.px);
  g.fill((_x, y) => (y === 3 ? "#2a1344" : undefined), f.nx);
  g.fill((x, y) => {
    if (y >= 2 && y <= 3 && x >= 1 && x <= 5) return y === 2 ? "#3a7fb0" : "#12263a";
    if (y === 5 && x >= 2 && x <= 4) return "#8a8474";
    return undefined;
  }, f.pz);
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "mudGoblin", paintSize: 2048 });
  type Bone = ReturnType<typeof b.joint>;

  // ---- skeleton ----------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 1.4, 0], dir: [0, 0, 1], role: "spine" });
  const axleF = b.joint("axleF", { parent: chassis, at: [0, WY, ZF], dir: [1, 0, 0], role: "hinge" });
  const axleR = b.joint("axleR", { parent: chassis, at: [0, WY, ZR], dir: [1, 0, 0], role: "hinge" });
  const steer: Record<number, Bone> = {};
  const wheelJ: Record<string, Bone> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    steer[s] = b.joint(`steer${S}`, { parent: axleF, at: [s * WX, WY, ZF], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
    wheelJ[`F${S}`] = b.joint(`wheelF${S}`, { parent: steer[s], at: [s * WX, WY, ZF], dir: [0, 0, 1], role: "hinge" });
    wheelJ[`R${S}`] = b.joint(`wheelR${S}`, { parent: axleR, at: [s * WX, WY, ZR], dir: [0, 0, 1], role: "hinge" });
  }
  const door: Record<number, Bone> = {};
  for (const s of [1, -1])
    door[s] = b.joint(`door${s > 0 ? "L" : "R"}`, {
      parent: chassis,
      at: [s * 1.1, 2.26, 0.85],
      dir: [0, 0, -1],
      up: [1, 0, 0],
      role: "hinge",
    });
  const hood = b.joint("hood", { parent: chassis, at: [0, 2.55, 0.85], dir: [0, 0, 1], role: "hinge" });
  const tailgate = b.joint("tailgate", { parent: chassis, at: [0, 2.0, -2.5], dir: [0, 0, -1], role: "hinge" });
  const wheelCol = b.joint("steeringWheel", { parent: chassis, at: [0.45, 2.5, 0.3], dir: [0, 0.35, -1], role: "hinge" });
  const driverHead = b.joint("driverHead", { parent: chassis, at: [0.45, 2.88, -0.2], dir: [0, 0, 1], role: "head" });
  const antenna = b.joint("antenna", { parent: chassis, at: [-1.0, 3.15, -0.45], dir: [0, 1, 0], role: "hinge" });

  // ---- tiny helpers ------------------------------------------------------------------------------------------
  const box = (
    size: V,
    at: V,
    color: Parameters<typeof b.part>[1],
    bone: Bone,
    o: { rot?: V; texture?: THREE.Texture; name?: string } = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { bone, at, rotation: o.rot, texture: o.texture, name: o.name });
  const cyl = (
    r: number,
    h: number,
    segs: number,
    at: V,
    color: Parameters<typeof b.part>[1],
    bone: Bone,
    axis: "x" | "y" | "z" = "y",
  ) => {
    const g = new THREE.CylinderGeometry(r, r, h, segs);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    if (axis === "z") g.rotateX(Math.PI / 2);
    return b.part(g, color, { bone, at, flat: true });
  };
  const rod = (a: V | THREE.Vector3, c: V | THREE.Vector3, r: number | [number, number], color: Parameters<typeof b.part>[1], bone: Bone, sides = 8) =>
    b.rod(a, c, r, { color, bone, sides, smooth: false });
  const merged = (geos: THREE.BufferGeometry[], color: Parameters<typeof b.part>[1], bone: Bone, texture?: THREE.Texture) =>
    b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0], texture, flat: texture ? false : true });
  const cube = (size: V, at: V) => new THREE.BoxGeometry(...size).translate(...at);

  // ---- wheels ------------------------------------------------------------------------------------------------
  function wheel(s: number, zc: number, bone: Bone) {
    const cx = s * WX;
    const ctr: V = [cx, WY, zc];
    const tread = new THREE.CylinderGeometry(0.83, 0.83, 0.94, 16, 1, true).rotateZ(Math.PI / 2);
    b.part(tread, RUBBER, { bone, at: ctr, flat: true });
    const shoulder = new THREE.CylinderGeometry(0.79, 0.79, 1.1, 16).rotateZ(Math.PI / 2);
    b.part(shoulder, RUBBER, { bone, at: ctr, flat: true });
    // lugs: staggered blocks, shoulders and centre row
    const lugs: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 24; k++) {
      for (const [xo, w, off] of [
        [-0.34, 0.28, 0],
        [0.34, 0.28, 0],
        [0, 0.36, 7.5],
      ] as const) {
        const phi = ((k * 15 + off) * Math.PI) / 180;
        const g = tileBox([w, 0.1, 0.17], LUGTEX, T);
        g.rotateX(phi);
        g.translate(cx + xo, WY + 0.85 * Math.cos(phi), zc + 0.85 * Math.sin(phi));
        lugs.push(g);
      }
    }
    merged(lugs, "#ffffff", bone, LUGTEX);
    // sidewall discs
    const bolts: THREE.BufferGeometry[] = [];
    const nuts: THREE.BufferGeometry[] = [];
    for (const sd of [1, -1]) {
      b.part(new THREE.CircleGeometry(0.76, 16), "#ffffff", {
        bone,
        at: [cx + sd * 0.554, WY, zc],
        dir: [sd, 0, 0],
        axis: "z",
        texture: SIDEWALL,
      });
      cyl(0.14, 0.1, 8, [cx + sd * 0.6, WY, zc], "#3b3f48", bone, "x");
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        bolts.push(cube([0.05, 0.07, 0.07], [cx + sd * 0.565, WY + 0.455 * Math.cos(a), zc + 0.455 * Math.sin(a)]));
      }
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        nuts.push(cube([0.06, 0.06, 0.06], [cx + sd * 0.66, WY + 0.1 * Math.cos(a), zc + 0.1 * Math.sin(a)]));
      }
    }
    merged(bolts, "#c9d4e0", bone);
    merged(nuts, "#e6edf5", bone);
  }
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    wheel(s, ZF, wheelJ[`F${S}`]);
    wheel(s, ZR, wheelJ[`R${S}`]);
  }

  // ---- chassis and suspension --------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 1.66, -2.45], [s * 0.5, 1.66, 2.65], () => [0.075, 0.125], { section: "box", color: STEEL, bone: chassis, caps: "flat" });
  }
  for (const z of [-2.1, -0.6, 0.6, 2.2]) box([1.0, 0.14, 0.14], [0, 1.62, z], STEEL, chassis);
  box([0.42, 0.3, 0.55], [0, 1.5, 0], STEEL, chassis); // transfer case
  const mounts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) for (const z of [-2.2, -1.0, 0.2, 1.4, 2.4]) mounts.push(cube([0.16, 0.08, 0.16], [s * 0.5, 1.81, z]));
  merged(mounts, "#3a2a22", chassis);
  box([1.9, 0.16, 0.4], [0, 1.72, 2.58], STEEL, chassis); // skid plate nose
  rod([0, 1.45, 0.3], [0, 1.0, ZF - 0.15], 0.06, STEEL, axleF === chassis ? chassis : chassis);
  rod([0, 1.45, -0.3], [0, 1.0, ZR + 0.15], 0.06, STEEL, chassis);

  const shock = (bot: V, top: V, bone: Bone) => {
    const m = lerp(bot, top, 0.5);
    b.rod(bot, m, 0.085, { color: BLUE, bone, sides: 8, smooth: false, caps: "flat" });
    b.rod(m, top, 0.05, { color: CHROME, bone, sides: 8, smooth: false, caps: "flat" });
    b.rod(lerp(bot, top, 0.47), lerp(bot, top, 0.53), 0.11, { color: STEEL, bone, sides: 8, smooth: false, caps: "flat" });
    box([0.2, 0.1, 0.2], bot, STEEL, bone);
    box([0.2, 0.1, 0.2], top, STEEL, bone);
    const dir = new THREE.Vector3(top[0] - bot[0], top[1] - bot[1], top[2] - bot[2]).normalize();
    const side = new THREE.Vector3(0, 0, 0);
    side.x = bot[0] > 0 ? 1 : -1;
    const rb = lerp(bot, top, 0.3).add(side.clone().multiplyScalar(0.0));
    const rt = lerp(bot, top, 0.7);
    b.rod(rb.clone().add(new THREE.Vector3(side.x * 0.15, 0, 0)), rt.clone().add(new THREE.Vector3(side.x * 0.15, 0, 0)), 0.045, {
      color: ORANGE,
      bone,
      sides: 6,
      smooth: false,
      caps: "flat",
    });
    void dir;
  };

  for (const [zc, axle, sgn] of [
    [ZF, axleF, 1],
    [ZR, axleR, -1],
  ] as const) {
    rod([-0.78, WY, zc], [0.78, WY, zc], 0.12, STEEL, axle);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), STEEL, { bone: axle, at: [0, WY, zc], flat: true, scale: [1, 0.95, 1] });
    cyl(0.18, 0.1, 8, [0, WY, zc + sgn * 0.28], CHROME, axle, "z");
    const dbolts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      dbolts.push(cube([0.04, 0.04, 0.04], [0.14 * Math.cos(a), WY + 0.14 * Math.sin(a), zc + sgn * 0.34]));
    }
    merged(dbolts, "#e6edf5", axle);
    for (const s of [1, -1]) {
      const sb = zc === ZF ? steer[s] : axle;
      box([0.3, 0.55, 0.5], [s * 0.64, WY, zc], STEEL, sb); // portal housing
      box([0.12, 0.24, 0.3], [s * 0.82, WY - 0.3, zc - sgn * 0.0], STEEL, sb);
      // four-link: lower and upper bars
      const back = -sgn;
      rod([s * 0.42, WY - 0.12, zc], [s * 0.52, 1.5, zc + back * 1.0], [0.045, 0.045], STEEL, chassis, 6);
      rod([s * 0.3, WY + 0.14, zc], [s * 0.52, 1.74, zc + back * 0.78], [0.045, 0.045], STEEL, chassis, 6);
      b.part(new THREE.SphereGeometry(0.06, 6, 4), CHROME, { bone: chassis, at: [s * 0.42, WY - 0.12, zc], flat: true });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), CHROME, { bone: chassis, at: [s * 0.3, WY + 0.14, zc], flat: true });
      box([0.14, 0.16, 0.14], [s * 0.52, 1.5, zc + back * 1.0], STEEL, chassis);
      // nitrogen shocks in a V
      shock([s * 0.6, 1.0, zc + 0.16], [s * 0.6, 1.8, zc + 0.58], chassis);
      shock([s * 0.6, 1.0, zc - 0.16], [s * 0.6, 1.8, zc - 0.58], chassis);
    }
    // panhard bar
    rod([-0.5, WY - 0.05, zc - sgn * 0.3], [0.5, 1.45, zc - sgn * 0.3], 0.04, STEEL, chassis, 6);
  }
  // steering: steer arms, tie rod, drag link
  for (const s of [1, -1]) box([0.1, 0.1, 0.3], [s * 0.92, WY - 0.2, ZF - 0.2], STEEL, steer[s]);
  rod([-0.92, WY - 0.2, ZF - 0.34], [0.92, WY - 0.2, ZF - 0.34], 0.04, CHROME, axleF, 6);
  rod([0.5, 1.45, 1.0], [0.9, WY - 0.15, ZF - 0.3], 0.045, STEEL, chassis, 6);

  // ---- body: pan, hood, fascia, fenders ----------------------------------------------------------------------
  box([2.3, 0.12, 5.12], [0, 1.91, 0], BODY, chassis, { name: "pan" });
  box([2.1, 0.55, 1.6], [0, 2.275, 1.65], BODY, hood, { name: "hoodPanel" });
  box([2.3, 0.58, 0.12], [0, 2.26, 2.5], BODY, chassis, { name: "fascia" });
  for (const s of [1, -1]) {
    box([0.1, 0.5, 1.6], [s * 1.1, 2.22, 1.65], BODY, chassis, { name: "fender" });
    // cab: quarter panel, door
    box([0.1, 0.58, 0.5], [s * 1.1, 2.26, -0.3], BODY, chassis, { name: "quarter" });
    box([0.1, 0.58, 0.9], [s * 1.1, 2.26, 0.4], BODY, door[s], { name: "doorPanel" });
    box([0.1, 0.06, 0.9], [s * 1.1, 2.575, 0.4], STEEL, door[s]); // window sill cap
    box([0.1, 0.5, 0.08], [s * 1.1, 2.8, -0.01], STEEL, door[s]); // rear door post
    b.part(new THREE.BoxGeometry(0.02, 0.48, 0.76), "#ffffff", { bone: door[s], at: [s * 1.1, 2.82, 0.36], texture: NET_DOOR });
    box([0.07, 0.04, 0.14], [s * 1.2, 2.5, 0.07], CHROME, door[s]); // handle
    // mirror
    box([0.04, 0.04, 0.2], [s * 1.19, 2.85, 0.78], STEEL, door[s], { rot: [0, 0, 0] });
    box([0.12, 0.2, 0.26], [s * 1.28, 2.9, 0.82], STEEL, door[s]);
    box([0.02, 0.16, 0.22], [s * 1.345, 2.9, 0.82], CHROME, door[s]);
    // bed walls and caps
    box([0.1, 0.65, 1.95], [s * 1.1, 2.295, -1.525], BODY, chassis, { name: "bedWall" });
    box([0.18, 0.06, 1.99], [s * 1.1, 2.65, -1.525], PURPLE, chassis);
    // C pillar, A pillar
    box([0.1, 0.5, 0.12], [s * 1.1, 2.8, -0.55], STEEL, chassis);
    b.rod([s * 1.1, 2.55, 0.85], [s * 1.1, 3.06, 0.7], [0.06, 0.06], { section: "box", color: STEEL, bone: chassis, caps: "flat" });
    b.part(new THREE.BoxGeometry(0.02, 0.48, 0.44), "#ffffff", { bone: chassis, at: [s * 1.1, 2.82, -0.3], texture: NET_QUARTER });
    // roll cage inside the cab
    rod([s * 0.95, 2.0, 0.42], [s * 0.95, 3.04, 0.42], 0.04, STEEL, chassis, 6);
    rod([s * 0.95, 2.0, -0.48], [s * 0.95, 3.04, -0.48], 0.04, STEEL, chassis, 6);
    rod([s * 0.95, 3.0, 0.42], [s * 0.95, 3.0, -0.48], 0.04, STEEL, chassis, 6);
    rod([s * 0.95, 2.1, 0.42], [s * 0.95, 2.95, -0.48], 0.035, STEEL, chassis, 6);
    // seats
    box([0.5, 0.2, 0.5], [s * 0.45, 2.13, -0.1], SEAT, chassis);
    box([0.52, 0.72, 0.12], [s * 0.45, 2.57, -0.4], SEAT, chassis);
    box([0.3, 0.18, 0.1], [s * 0.45, 3.0, -0.4], SEAT, chassis);
    box([0.06, 0.4, 0.02], [s * 0.45, 2.5, -0.31], "#d4302a", chassis);
    // step bars under the doors
    rod([s * 1.22, 1.76, -0.55], [s * 1.22, 1.76, 0.6], 0.05, CHROME, chassis, 6);
    box([0.12, 0.1, 0.12], [s * 1.2, 1.81, -0.45], STEEL, chassis);
    box([0.12, 0.1, 0.12], [s * 1.2, 1.81, 0.5], STEEL, chassis);
    // mud flaps
    box([0.6, 0.5, 0.03], [s * 1.3, 1.6, -2.6], "#14141a", chassis);
    box([0.5, 0.06, 0.04], [s * 1.3, 1.45, -2.6], "#d4302a", chassis);
    // headlights, brows
    box([0.46, 0.34, 0.1], [s * 0.82, 2.28, 2.58], CHROME, chassis);
    glow(box([0.38, 0.26, 0.04], [s * 0.82, 2.28, 2.65], "#fff3b0", chassis), 1.4);
    box([0.52, 0.09, 0.12], [s * 0.82, 2.5, 2.62], PURPLE, chassis, { rot: [0, 0, s * 22] });
    // fog lamps
    cyl(0.07, 0.08, 8, [s * 0.58, 2.08, 2.58], "#e6edf5", chassis, "z");
    // tail lights
    glow(box([0.3, 0.2, 0.04], [s * 0.88, 2.35, -2.56], "#ff2a2a", tailgate), 1.2);
    box([0.34, 0.24, 0.03], [s * 0.88, 2.35, -2.53], "#14141a", tailgate);
    // exhaust stacks with flames
    rod([s * 0.85, 2.0, -0.85], [s * 0.85, 3.3, -0.85], 0.075, CHROME, chassis);
    rod([s * 0.85, 3.2, -0.85], [s * 0.85, 3.4, -0.85], [0.075, 0.115], CHROME, chassis);
    for (const y of [2.3, 2.7]) rod([s * 0.85, y - 0.03, -0.85], [s * 0.85, y + 0.03, -0.85], 0.1, STEEL, chassis);
    glow(b.part(new THREE.ConeGeometry(0.1, 0.4, 6), "#ff9d1f", { bone: chassis, at: [s * 0.85, 3.6, -0.85], flat: true }), 1.3);
    glow(b.part(new THREE.ConeGeometry(0.05, 0.26, 6), "#ffe45a", { bone: chassis, at: [s * 0.85, 3.53, -0.85], flat: true }), 1.5);
    // roll hoop behind the cab (orange)
    rod([s * 0.95, 1.97, -0.68], [s * 0.95, 3.0, -0.68], 0.05, ORANGE, chassis, 6);
    // bumper hoops
    rod([s * 0.95, 1.95, 2.78], [s * 0.95, 2.3, 2.78], 0.045, CHROME, chassis, 6);
    rod([s * 0.95, 1.95, 2.6], [s * 0.95, 1.95, 2.78], 0.045, CHROME, chassis, 6);
  }
  rod([-0.95, 3.0, -0.68], [0.95, 3.0, -0.68], 0.05, ORANGE, chassis, 6);
  rod([-0.95, 2.1, -0.68], [0.95, 2.9, -0.68], 0.04, ORANGE, chassis, 6);
  rod([-0.95, 2.9, -0.68], [0.95, 2.1, -0.68], 0.04, ORANGE, chassis, 6);
  rod([-0.95, 1.95, 2.78], [0.95, 1.95, 2.78], 0.06, CHROME, chassis, 8);
  rod([-0.95, 2.3, 2.78], [0.95, 2.3, 2.78], 0.045, CHROME, chassis, 6);
  box([0.5, 0.22, 0.3], [0, 1.74, 2.78], STEEL, chassis); // winch
  cyl(0.09, 0.4, 8, [0, 1.74, 2.78], CHROME, chassis, "x");
  b.part(new THREE.TorusGeometry(0.06, 0.015, 4, 8), CHROME, { bone: chassis, at: [0, 1.62, 2.95], rotation: [90, 0, 0], flat: true });
  // grille mouth eyes glow: inner mouth bar
  box([1.06, 0.03, 0.03], [0, 2.54, 2.575], "#14141a", chassis);

  // ---- fender flares ------------------------------------------------------------------------------------------
  const flareRivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const zc of [ZF, ZR]) {
      const outline: [number, number][] = [];
      const steps = 9;
      for (let i = 0; i <= steps; i++) {
        const a = ((15 + (150 * i) / steps) * Math.PI) / 180;
        outline.push([1.14 * Math.cos(a), 1.14 * Math.sin(a)]);
      }
      for (let i = steps; i >= 0; i--) {
        const a = ((15 + (150 * i) / steps) * Math.PI) / 180;
        outline.push([0.98 * Math.cos(a), 0.98 * Math.sin(a)]);
      }
      b.extrude(outline, { at: [s * 1.27, WY, zc], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.24, color: FLARE, bone: chassis, name: "flare" });
      for (let a = 25; a <= 155; a += 10) {
        const r = (a * Math.PI) / 180;
        flareRivets.push(cube([0.04, 0.04, 0.04], [s * 1.395, WY + 1.06 * Math.sin(r), zc + 1.06 * Math.cos(r)]));
      }
    }
  merged(flareRivets, "#c9d4e0", chassis);

  // ---- cab shell ---------------------------------------------------------------------------------------------
  box([2.1, 0.58, 0.1], [0, 2.26, -0.5], BODY, chassis, { name: "cabBack" });
  box([2.3, 0.1, 1.35], [0, 3.1, 0.07], BODY, chassis, { name: "roof" });
  box([2.1, 0.06, 0.3], [0, 3.12, 0.85], PURPLE, chassis, { rot: [-12, 0, 0] }); // sun visor
  b.part(new THREE.BoxGeometry(2.08, 0.52, 0.04), "#ffffff", {
    bone: chassis,
    at: [0, 2.8, 0.775],
    rotation: [-16.7, 0, 0],
    texture: WINDSHIELD,
  });
  b.part(new THREE.BoxGeometry(1.88, 0.48, 0.02), "#ffffff", { bone: chassis, at: [0, 2.82, -0.55], texture: NET_REAR });
  box([2.1, 0.3, 0.35], [0, 2.4, 0.62], "#1b1d23", chassis); // dash
  b.part(new THREE.PlaneGeometry(1.96, 0.3), "#ffffff", { bone: chassis, at: [0, 2.42, 0.44], dir: [0, 0, -1], axis: "z", texture: DASH });
  // light bar on the roof
  box([1.9, 0.2, 0.2], [0, 3.27, 0.3], STEEL, chassis);
  for (const x of [-0.7, -0.42, -0.14, 0.14, 0.42, 0.7]) {
    box([0.24, 0.16, 0.05], [x, 3.27, 0.42], "#e6edf5", chassis);
    glow(box([0.2, 0.12, 0.03], [x, 3.27, 0.455], "#fffbe0", chassis), 1.5);
  }
  for (const x of [-0.8, 0.8]) box([0.1, 0.1, 0.2], [x, 3.2, 0.3], STEEL, chassis);

  // ---- hood: blower, intakes ---------------------------------------------------------------------------------
  box([0.86, 0.28, 0.86], [0, 2.69, 1.5], CHROME, chassis, { name: "blowerBase" });
  box([0.62, 0.1, 0.62], [0, 2.88, 1.5], "#14141a", chassis);
  for (const dx of [-0.2, 0.2])
    for (const dz of [-0.2, 0.2]) {
      cyl(0.1, 0.3, 8, [dx, 3.02, 1.5 + dz], CHROME, chassis);
      cyl(0.075, 0.04, 8, [dx, 3.18, 1.5 + dz], "#0b0b0f", chassis);
    }
  cyl(0.22, 0.1, 10, [0, 2.69, 2.0], STEEL, chassis, "z"); // belt pulley
  const pins: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) for (const z of [0.95, 2.35]) pins.push(cube([0.08, 0.05, 0.08], [s * 0.98, 2.58, z]));
  merged(pins, "#c9d4e0", hood);
  // bed contents: fuel cell, nitrous bottles, toolbox
  box([0.7, 0.42, 0.5], [-0.5, 2.18, -1.1], CHROME, chassis);
  cyl(0.07, 0.06, 8, [-0.5, 2.42, -1.1], "#d4302a", chassis);
  rod([-0.5, 2.18, -0.86], [-0.5, 2.18, -0.86], 0.001, STEEL, chassis, 4);
  for (const x of [0.4, 0.68]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8).rotateX(Math.PI / 2), BLUE, { bone: chassis, at: [x, 2.1, -1.1], flat: true });
    cyl(0.04, 0.12, 6, [x, 2.2, -0.72], CHROME, chassis);
    cyl(0.03, 0.03, 6, [x, 2.2, -0.65], "#d4302a", chassis);
  }
  for (const z of [-0.95, -1.25]) box([0.5, 0.04, 0.06], [0.54, 2.12, z], "#14141a", chassis);
  box([0.45, 0.22, 0.3], [0.6, 2.08, -1.95], "#d4302a", chassis);
  box([0.47, 0.04, 0.32], [0.6, 2.2, -1.95], "#8a1a22", chassis);
  box([0.18, 0.03, 0.04], [0.6, 2.24, -1.95], CHROME, chassis);

  // ---- tailgate, bumper, plate -------------------------------------------------------------------------------
  box([2.1, 0.6, 0.1], [0, 2.3, -2.5], BODY, tailgate, { name: "tailgatePanel" });
  box([2.0, 0.18, 0.2], [0, 1.78, -2.66], STEEL, chassis);
  b.part(new THREE.PlaneGeometry(0.56, 0.28), "#ffffff", { bone: chassis, at: [0, 1.8, -2.77], dir: [0, 0, -1], axis: "z", texture: PLATE });
  for (const s of [1, -1]) {
    box([0.1, 0.1, 0.18], [s * 0.7, 1.7, -2.78], CHROME, chassis);
    box([0.14, 0.06, 0.1], [s * 0.7, 1.9, -2.7], STEEL, chassis);
  }

  // ---- driver ------------------------------------------------------------------------------------------------
  box([0.42, 0.5, 0.26], [0.45, 2.47, -0.22], SUIT, chassis);
  for (const dx of [-0.1, 0.1]) {
    rod([0.45 + dx * 2.1, 2.62, -0.2], [0.45 + dx * 1.4, 2.52, 0.22], 0.05, "#d4302a", chassis, 6);
    box([0.09, 0.09, 0.09], [0.45 + dx * 1.4, 2.52, 0.24], "#14141a", chassis);
    rod([0.45 + dx, 2.3, -0.2], [0.45 + dx, 2.3, 0.28], 0.07, "#8a1a22", chassis, 6);
    rod([0.45 + dx, 2.3, 0.28], [0.45 + dx, 2.05, 0.46], 0.06, "#8a1a22", chassis, 6);
    box([0.1, 0.07, 0.18], [0.45 + dx, 2.0, 0.5], "#14141a", chassis);
  }
  for (const dx of [-0.12, 0.12]) box([0.07, 0.5, 0.02], [0.45 + dx, 2.47, -0.085], "#ffd02a", chassis, { rot: [0, 0, dx > 0 ? -18 : 18] });
  b.part(skinBox(HELM, HL.faces.head, T), "#ffffff", { bone: driverHead, at: [0.45, 2.88, -0.2] });
  box([0.1, 0.06, 0.08], [0.45, 2.7, -0.2], "#14141a", driverHead);
  // steering wheel and column
  b.part(new THREE.TorusGeometry(0.17, 0.03, 4, 8), "#14141a", {
    bone: wheelCol,
    at: [0.45, 2.5, 0.3],
    dir: [0, 0.35, -1],
    axis: "z",
    flat: true,
  });
  rod([0.45, 2.5, 0.3], [0.45, 2.3, 0.55], 0.04, STEEL, chassis, 6);
  box([0.1, 0.1, 0.06], [0.45, 2.5, 0.3], "#ffd02a", wheelCol);
  // passenger seat belts hang
  for (const dx of [-0.1, 0.1]) box([0.06, 0.45, 0.02], [-0.45 + dx, 2.5, -0.31], "#d4302a", chassis);

  // ---- antenna and flag --------------------------------------------------------------------------------------
  rod([-1.0, 3.15, -0.45], [-1.0, 3.9, -0.45], 0.012, "#14141a", antenna, 6);
  b.part(new THREE.BoxGeometry(0.32, 0.2, 0.012), "#ffffff", { bone: antenna, at: [-1.0, 3.78, -0.29], texture: FLAG });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), "#ffd02a", { bone: antenna, at: [-1.0, 3.91, -0.45], flat: true });
  box([0.06, 0.1, 0.06], [-1.0, 3.18, -0.45], STEEL, antenna);

  return b.root;
}
