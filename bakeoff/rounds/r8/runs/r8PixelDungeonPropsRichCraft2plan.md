```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, noise, rng } from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";
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
    "Pixel-art dungeon corner: iron-banded treasure chest with a half-open lid and glowing gold, two flaming torch stands, standing and lying barrels, a bone pile with skulls, and a spike trap, on a flagstone floor with mossy brick walls.",
};

type V3 = [number, number, number];
type Fill = string | Paint;

const TEXEL = 0.02;
const FY = 0.1; // floor surface height
const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Palettes

const MORTAR = "#14131a";
const STONE_RAMP = ["#1f1e29", "#2f2e3d", "#43425a", "#5a5972", "#76758f"];
const BRICK_RAMP = ["#23212e", "#34324a", "#47455f", "#5d5b76", "#7a7894"];
const MOSS = ["#1b3418", "#2c5420", "#43802b", "#70b240"];
const WOOD_RAMP = ["#20120a", "#37200f", "#52311a", "#6c4423", "#8a5a2e"];
const IRON_RAMP = ["#16161d", "#262731", "#383a49", "#4d5063", "#686c82"];
const BONE_RAMP = ["#8f7f64", "#b9a888", "#d8cba8", "#efe5c8", "#fff8e0"];
const STEEL_RAMP = ["#2c2f3a", "#4a4e5e", "#6e7388", "#9aa0b6", "#c8cddd"];
const GOLD = ["#b8801c", "#e8b830", "#ffe27a"];
const FIRE = { outer: "#e8431a", mid: "#ff9a1f", core: "#ffe45e" };

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

function flagTile(seed: number) {
  const r = rng(seed);
  const tone = [0, 1, 2, 3].map(() => 0.25 + 0.5 * r());
  return pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const row = y < 16 ? 0 : 1;
      const sx = (x + (row ? 8 : 0)) % 32;
      const lx = sx % 16;
      const ly = y % 16;
      if (lx === 0 || ly === 0) return MORTAR;
      if (lx === 1 || ly === 1) return STONE_RAMP[4];
      if (lx === 15 || ly === 15) return STONE_RAMP[0];
      if (r() < 0.015) return STONE_RAMP[0];
      return pick(STONE_RAMP, tone[row * 2 + Math.floor(sx / 16)] + (r() - 0.5) * 0.4, bayer(x, y));
    });
  });
}

function brickTile(seed: number, mossy: boolean) {
  const r = rng(seed);
  const tone = [0, 1, 2, 3].map(() => 0.3 + 0.4 * r());
  return pixelTexture(32, 16, (g) => {
    g.fill((x, y) => {
      const row = y < 8 ? 0 : 1;
      const sx = (x + (row ? 8 : 0)) % 32;
      const lx = sx % 16;
      const ly = y % 8;
      let c: string;
      if (ly === 0 || lx === 0) c = MORTAR;
      else if (ly === 1 || lx === 1) c = BRICK_RAMP[4];
      else if (ly === 7 || lx === 15) c = BRICK_RAMP[1];
      else c = pick(BRICK_RAMP, tone[row * 2 + Math.floor(sx / 16)] + (r() - 0.5) * 0.35, bayer(x, y));
      if (mossy) {
        const d = (y - 3) / 12;
        if (d > 0 && (bayer(x, y) < d * 0.85 || r() < d * 0.15)) c = pick(MOSS, 0.2 + 0.8 * r());
      }
      return c;
    });
  });
}

function woodTile() {
  const r = rng(5);
  const tone = Array.from({ length: 6 }, () => 0.35 + 0.3 * r());
  return pixelTexture(48, 36, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 6);
      const ly = y % 6;
      if (ly === 0) return WOOD_RAMP[0];
      if (ly === 1) return pick(WOOD_RAMP, tone[row] + 0.25, bayer(x, y));
      if (x === (row * 17 + 9) % 48) return WOOD_RAMP[0];
      const grain = 0.12 * Math.sin(x * 0.55 + row * 2.3 + ly * 0.9);
      return pick(WOOD_RAMP, tone[row] + grain + (r() - 0.5) * 0.2, bayer(x, y));
    });
    for (let row = 0; row < 6; row++) {
      g.set(2, row * 6 + 3, "#c8bca0");
      g.set(45, row * 6 + 3, "#c8bca0");
    }
  });
}

function lockTile() {
  return pixelArt(
    [
      "kkkkkkkk",
      "khhhhhgk",
      "khggggdk",
      "khgxxgdk",
      "khxxxxdk",
      "khgxxgdk",
      "khgxxgdk",
      "khggggdk",
      "kgdddddk",
      "kkkkkkkk",
    ],
    { k: "#2a1c08", h: "#fff0a0", g: "#e8b830", d: "#a87818", x: "#140c04" },
  );
}

const SKULL_LAYOUT = skinLayout({ skull: [8, 8, 8] }, 32);
const SKULL_FRONT = [
  "bbbbbbbb",
  "bbbbbbbb",
  "bkkbbkkb",
  "bkkbbkkb",
  "bbbxxbbb",
  "bbbbbbbb",
  "bwkwkwkb",
  "bbwwwwbb",
];

function skullSheet() {
  const r = rng(21);
  const tones = ["#9a8a6c", "#bfae8c", "#ddd0ac", "#f0e6c8"];
  return pixelTexture(SKULL_LAYOUT.size[0], SKULL_LAYOUT.size[1], (g) => {
    const f = SKULL_LAYOUT.faces.skull;
    for (const rect of Object.values(f))
      g.fill((x, y) => pick(tones, 0.6 + (r() - 0.5) * 0.5, bayer(x, y)), rect);
    g.fill((x, y) => pick(tones, 0.3 + (r() - 0.5) * 0.3, bayer(x, y)), f.py);
    g.stamp(f.pz[0], f.pz[1], SKULL_FRONT, {
      b: "#e4d8b4",
      k: "#1a1410",
      x: "#3a2a22",
      w: "#f6f0dc",
    });
  });
}

function webTile() {
  const C = "#d9dfe4";
  return pixelTexture(20, 20, (g) => {
    for (let y = 0; y < 20; y++)
      for (let x = 0; x < 20; x++) {
        const dx = 19 - x;
        const dy = y;
        const d = Math.hypot(dx, dy);
        if (d < 1 || d > 19.5) continue;
        const a = Math.atan2(dy, dx);
        let on = false;
        for (let k = 0; k <= 4; k++) if (Math.abs(a - (k * Math.PI) / 8) * d < 0.6) on = true;
        for (const rr of [5, 9, 13, 17]) {
          const sag = 0.7 * Math.sin(a * 4);
          if (Math.abs(d - rr - sag) < 0.55) on = true;
        }
        if (on) g.set(x, y, C);
      }
  });
}

function sootTile() {
  return pixelTexture(16, 20, (g) => {
    for (let y = 0; y < 20; y++)
      for (let x = 0; x < 16; x++) {
        const dens = Math.max(0, 1 - Math.abs(x - 7.5) / 8.5) * (1 - y / 20) * 0.9;
        if (dens > bayer(x, y)) g.set(x, y, "#0d0b12");
      }
  });
}

function bloodTile() {
  const r = rng(33);
  const RED = ["#3a0808", "#5c0c10", "#7d1216"];
  return pixelTexture(14, 10, (g) => {
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 14; x++) {
        const e = ((x - 6.5) / 6.5) ** 2 + ((y - 4.5) / 4.5) ** 2 + (r() - 0.5) * 0.5;
        if (e < 1) g.set(x, y, pick(RED, 0.2 + 0.8 * r(), bayer(x, y)));
      }
    g.set(0, 8, RED[1]);
    g.set(13, 1, RED[1]);
  });
}

function trapTile() {
  const r = rng(44);
  return pixelTexture(48, 48, (g) => {
    g.fill((x, y) => {
      if (x === 0 || y === 0 || x === 44 || y === 44) return IRON_RAMP[0];
      if (x === 1 || y === 1) return IRON_RAMP[4];
      if (x === 43 || y === 43) return IRON_RAMP[1];
      return pick(IRON_RAMP, 0.42 + 0.2 * r() - y * 0.002, bayer(x, y));
    });
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++) {
        g.fill(() => "#07070a", [5 + 8 * i, 5 + 8 * j, 3, 3]);
      }
    for (const [cx, cy] of [
      [2, 2],
      [41, 2],
      [2, 41],
      [41, 41],
    ])
      g.fill(() => "#a4aabd", [cx, cy, 2, 2]);
    for (let i = 0; i < 18; i++) g.set(Math.floor(r() * 44), Math.floor(r() * 44), IRON_RAMP[4]);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

const IRONP = cellPaint(
  0.02,
  (c) => {
    if (c.random(2) < 0.025) return "#9aa0b6";
    return c.pick(IRON_RAMP, 0.42 + 0.28 * c.n.y + 0.3 * (noise(c.at, 0.14, 3) - 0.5) + (c.random(1) - 0.5) * 0.12);
  },
  { dither: true },
);

const WOODP = cellPaint(
  0.02,
  (c) => {
    if (c.random(4) < 0.03) return WOOD_RAMP[0];
    const stave = (c.u & 1) === 0 ? 0.06 : -0.06;
    return c.pick(WOOD_RAMP, 0.5 + stave + 0.22 * c.n.y + (c.random(1) - 0.5) * 0.22);
  },
  { dither: true },
);

const BONEP = cellPaint(
  0.02,
  (c) => c.pick(BONE_RAMP, 0.55 + 0.3 * c.n.y + 0.4 * (noise(c.at, 0.1, 7) - 0.5) + (c.random(1) - 0.5) * 0.15),
  { dither: true },
);

const STEEL = cellPaint(
  0.02,
  (c) => c.pick(STEEL_RAMP, 0.35 + 0.6 * ((c.at.y - FY - 0.06) / 0.2) + (c.random(1) - 0.5) * 0.12),
  { dither: true },
);

const STEEL_RED = cellPaint(
  0.02,
  (c) => {
    if (c.at.y > FY + 0.06 + 0.08) return c.pick(["#4a0a0c", "#7d1216", "#b3262c"], 0.4 + c.random(1) * 0.6);
    return c.pick(STEEL_RAMP, 0.35 + 0.6 * ((c.at.y - FY - 0.06) / 0.2));
  },
  { dither: true },
);

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers

function spikeGeo(k: number) {
  const ws = [0.06, 0.045, 0.03, 0.015];
  const hs = [0.06, 0.05, 0.05, 0.04];
  let y = 0;
  const gs: THREE.BufferGeometry[] = [];
  ws.forEach((w, i) => {
    const g = new THREE.BoxGeometry(w, hs[i], w);
    g.translate(0, y + hs[i] / 2, 0);
    y += hs[i];
    gs.push(g);
  });
  const m = mergeGeometries(gs)!;
  m.scale(1, k, 1);
  return m;
}

function femurGeo(len: number) {
  const parts: THREE.BufferGeometry[] = [new THREE.BoxGeometry(0.04, 0.04, len)];
  for (const z of [-1, 1])
    for (const x of [-1, 1]) {
      const k = new THREE.BoxGeometry(0.045, 0.045, 0.05);
      k.translate(x * 0.025, 0, (z * len) / 2);
      parts.push(k);
    }
  return mergeGeometries(parts)!;
}

function ribGeo(R: number) {
  const parts: THREE.BufferGeometry[] = [];
  for (const sx of [-1, 1])
    for (let i = 0; i < 6; i++) {
      const a = (6 + i * 17) * DEG;
      const k = new THREE.BoxGeometry(0.03, 0.03, 0.03);
      k.translate(sx * R * Math.sin(a), R * Math.cos(a) + 0.015, 0);
      parts.push(k);
    }
  return mergeGeometries(parts)!;
}

const BARREL: [number, number][] = [
  [0, 0],
  [0.23, 0],
  [0.26, 0.15],
  [0.28, 0.375],
  [0.26, 0.6],
  [0.23, 0.75],
  [0.21, 0.75],
  [0.2, 0.72],
  [0, 0.72],
];
const BARREL_R: [number, number][] = [
  [0, 0.23],
  [0.15, 0.26],
  [0.375, 0.28],
  [0.6, 0.26],
  [0.75, 0.23],
];
function barrelR(y: number) {
  for (let i = 0; i < BARREL_R.length - 1; i++) {
    const [y0, r0] = BARREL_R[i];
    const [y1, r1] = BARREL_R[i + 1];
    if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0.23;
}

const rotY = (x: number, z: number, yaw: number): [number, number] => [
  x * Math.cos(yaw) + z * Math.sin(yaw),
  -x * Math.sin(yaw) + z * Math.cos(yaw),
];

const FLAME_OUT = stepped(
  [[-3, 3], [-4, 4], [-4, 4], [-4, 4], [-3, 4], [-3, 3], [-2, 3], [-2, 2], [-1, 2], [0, 1]],
  TEXEL,
  { rows: true },
);
const FLAME_MID = stepped(
  [[-2, 2], [-3, 3], [-3, 3], [-3, 3], [-2, 2], [-2, 2], [-1, 2], [-1, 1]],
  TEXEL,
  { rows: true },
);
const FLAME_IN = stepped([[-1, 1], [-2, 2], [-2, 2], [-1, 2], [-1, 1], [0, 1]], TEXEL, { rows: true });

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "dungeonProps" });
  const rand = rng(7);

  const FLAG_A = flagTile(3);
  const FLAG_B = flagTile(9);
  const BRICK = brickTile(5, false);
  const BRICK_MOSSY = brickTile(6, true);
  const WOOD = woodTile();
  const LOCK = lockTile();
  const SKULL = skullSheet();
  const WEB = webTile();
  const SOOT = sootTile();
  const BLOOD = bloodTile();
  const TRAP = trapTile();

  // ---- skeleton -------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const chestBody = b.joint("chestBody", { parent: root, at: [0, FY, 0] });
  const BODY_TOP = FY + 0.36;
  const lid = b.joint("lid", { parent: chestBody, at: [0, BODY_TOP, -0.275], role: "hinge" });
  const torchL = b.joint("torchL", { parent: root, at: [0.7, FY, -0.95] });
  const torchR = b.joint("torchR", { parent: root, at: [-0.7, FY, -0.95] });
  const barrel1 = b.joint("barrel1", { parent: root, at: [1.12, FY, -0.72] });
  const barrel2 = b.joint("barrel2", { parent: root, at: [1.12, FY, 0.05] });
  const TX = -0.95;
  const TZ = 0.55;
  const trap = b.joint("trap", { parent: root, at: [TX, FY, TZ] });
  const spikesJ = b.joint("spikes", { parent: trap, at: [TX, FY + 0.06, TZ] });
  const BX0 = 0.9;
  const BZ0 = 0.72;
  const bonesJ = b.joint("bones", { parent: root, at: [BX0, FY, BZ0] });

  // ---- helpers --------------------------------------------------------------------------------------------
  const box = (size: V3, fill: Fill, at: V3, bone: Joint, rotation?: V3) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), fill, { bone, at, rotation });

  const tbox = (size: V3, tile: THREE.Texture, at: V3, bone: Joint, wood = false) =>
    b.part(tileBox(size, tile, TEXEL, wood ? { rand, step: [1, 6] } : {}), "#ffffff", {
      texture: tile,
      bone,
      at,
    });

  const skull = (at: V3, yaw: number, s: number, bone: Joint) => {
    b.part(skinBox(SKULL, SKULL_LAYOUT.faces.skull, s), "#ffffff", {
      texture: SKULL,
      bone,
      at,
      rotation: [0, yaw, 0],
    });
    const [fx, fz] = rotY(0, 1.5 * s, yaw * DEG);
    b.part(new THREE.BoxGeometry(6 * s, 2.4 * s, 5 * s), BONEP, {
      bone,
      at: [at[0] + fx, at[1] - 4 * s - 1.2 * s, at[2] + fz],
      rotation: [0, yaw, 0],
    });
  };

  // ---- floor ----------------------------------------------------------------------------------------------
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 4; j++)
      tbox([0.64, FY, 0.6], (i + j) % 2 ? FLAG_B : FLAG_A, [-1.28 + i * 0.64, FY / 2, -0.9 + j * 0.6], root);

  // ---- walls ----------------------------------------------------------------------------------------------
  for (let row = 0; row < 4; row++) {
    const y = FY + 0.16 + row * 0.32;
    const tile = row === 0 ? BRICK_MOSSY : BRICK;
    for (let i = 0; i < 5; i++) tbox([0.64, 0.32, 0.15], tile, [-1.28 + i * 0.64, y, -1.125], root);
    for (const z of [-0.73, -0.09]) tbox([0.15, 0.32, 0.64], tile, [1.525, y, z], root);
  }
  for (let i = 0; i < 5; i++) tbox([0.64, 0.04, 0.19], FLAG_B, [-1.28 + i * 0.64, FY + 1.3, -1.115], root);
  for (const z of [-0.73, -0.09]) tbox([0.19, 0.04, 0.64], FLAG_B, [1.515, FY + 1.3, z], root);

  // cobweb in the corner, soot behind each torch
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    texture: WEB,
    bone: root,
    at: [1.25, FY + 1.08, -1.046],
    dir: [0, 0, 1],
    axis: "z",
  });
  for (const sx of [0.7, -0.7])
    b.part(new THREE.PlaneGeometry(0.32, 0.4), "#ffffff", {
      texture: SOOT,
      bone: root,
      at: [sx, FY + 1.08, -1.046],
      dir: [0, 0, 1],
      axis: "z",
    });

  // ---- chest ----------------------------------------------------------------------------------------------
  tbox([0.9, 0.36, 0.55], WOOD, [0, FY + 0.18, 0], chestBody, true);
  glow(box([0.82, 0.02, 0.47], GOLD[1], [0, BODY_TOP + 0.002, 0], chestBody), 1.2);

  // vaulted lid: five stacked slabs, same axes
  const R = 0.275;
  const H = 0.055;
  for (let k = 0; k < 5; k++) {
    const ym = H * k + H / 2;
    const d = 2 * Math.sqrt(R * R - ym * ym);
    tbox([0.9, H, d], WOOD, [0, BODY_TOP + ym, 0], lid, true);
    for (const sx of [-0.28, 0.28]) box([0.07, H, d + 0.024], IRONP, [sx, BODY_TOP + ym, 0], lid);
  }
  // hasp on lid front
  glow(box([0.1, 0.06, 0.02], GOLD[1], [0, BODY_TOP + 0.03, 0.2735 + 0.01], lid), 0.5);

  // body straps, trims, corner brackets
  for (const sx of [-0.28, 0.28])
    for (const sz of [-1, 1]) box([0.07, 0.36, 0.024], IRONP, [sx, FY + 0.18, sz * 0.275], chestBody);
  for (const sz of [-1, 1]) {
    box([0.94, 0.05, 0.03], IRONP, [0, FY + 0.025, sz * 0.275], chestBody);
    box([0.94, 0.04, 0.03], IRONP, [0, BODY_TOP - 0.02, sz * 0.275], chestBody);
  }
  for (const sx of [-1, 1]) {
    box([0.03, 0.05, 0.59], IRONP, [sx * 0.45, FY + 0.025, 0], chestBody);
    box([0.03, 0.04, 0.59], IRONP, [sx * 0.45, BODY_TOP - 0.02, 0], chestBody);
  }
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box([0.07, 0.36, 0.07], IRONP, [sx * 0.425, FY + 0.18, sz * 0.25], chestBody);
    }
  for (const sx of [-1, 1])
    for (const ry of [0.08, 0.28])
      box([0.022, 0.022, 0.012], "#b4bacb", [sx * 0.425, FY + ry, 0.29], chestBody);

  // lock plate with keyhole drawing
  glow(
    b.part(new THREE.PlaneGeometry(0.12, 0.15), "#ffffff", {
      texture: LOCK,
      bone: chestBody,
      at: [0, BODY_TOP - 0.1, 0.275 + 0.004],
      dir: [0, 0, 1],
      axis: "z",
    }),
    0.5,
  );

  // gold pile inside
  const goldSizes = [0.05, 0.07, 0.06, 0.09, 0.05, 0.07];
  for (let i = 0; i < 16; i++) {
    const gx = (rand() - 0.5) * 0.62;
    const gz = (rand() - 0.4) * 0.24;
    const sz = goldSizes[i % goldSizes.length];
    const mound = 0.05 * Math.max(0, 1 - Math.hypot(gx / 0.34, gz / 0.16));
    glow(
      box([sz, sz * 0.8, sz], GOLD[i % 3], [gx, BODY_TOP + 0.012 + mound + sz * 0.4, gz], chestBody, [
        0,
        rand() * 60,
        0,
      ]),
      1.2,
    );
  }
  const coinGeo = () => new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8);
  for (const [cx, cz, tilt] of [
    [-0.12, 0.05, 20],
    [0.1, -0.02, -25],
    [0.22, 0.06, 10],
  ] as V3[])
    glow(
      b.part(coinGeo(), GOLD[2], {
        bone: chestBody,
        at: [cx, BODY_TOP + 0.1, cz],
        rotation: [tilt, cz * 200, tilt],
        flat: true,
      }),
      1.4,
    );
  glow(
    b.part(new THREE.OctahedronGeometry(0.04, 0), "#ff3050", {
      bone: chestBody,
      at: [0.17, BODY_TOP + 0.11, 0.03],
      flat: true,
    }),
    1.8,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.035, 0), "#40e0ff", {
      bone: chestBody,
      at: [-0.22, BODY_TOP + 0.09, -0.02],
      flat: true,
    }),
    1.8,
  );

  // spilled coins on the floor
  for (const [cx, cz, tilt] of [
    [-0.05, 0.42, 0],
    [0.18, 0.5, 8],
    [0.32, 0.38, 0],
    [-0.22, 0.52, 12],
    [0.05, 0.58, 0],
    [0.4, 0.56, 6],
  ] as V3[])
    glow(
      b.part(coinGeo(), GOLD[(Math.abs(cz) * 10) % 2 > 1 ? 1 : 2], {
        bone: root,
        at: [cx, FY + 0.008, cz],
        rotation: [tilt, cx * 300, 0],
        flat: true,
      }),
      1.3,
    );

  // ---- torches --------------------------------------------------------------------------------------------
  const torch = (s: number, joint: Joint) => {
    const x = 0.7 * s;
    const z = -0.95;
    box([0.28, 0.05, 0.09], IRONP, [x, FY + 0.025, z], joint);
    box([0.09, 0.05, 0.28], IRONP, [x, FY + 0.025, z], joint);
    box([0.07, 1.05, 0.07], WOODP, [x, FY + 0.575, z], joint);
    for (const by of [0.15, 0.55, 1.0]) box([0.1, 0.035, 0.1], IRONP, [x, FY + by, z], joint);
    const y0 = FY + 1.1;
    for (const px of [-1, 1])
      for (const pz of [-1, 1]) box([0.02, 0.12, 0.02], IRONP, [x + px * 0.075, y0 + 0.07, z + pz * 0.075], joint);
    b.lathe(
      [
        [0, 0],
        [0.045, 0],
        [0.11, 0.13],
        [0.095, 0.13],
        [0.04, 0.06],
        [0, 0.06],
      ],
      { at: [x, y0, z], segments: 8, color: IRONP, bone: joint },
    );
    box([0.1, 0.04, 0.1], "#2a1a10", [x, y0 + 0.1, z], joint, [0, 20, 0]);
    for (const [dx, dh] of [
      [-0.04, 0.07],
      [0.0, 0.1],
      [0.04, 0.05],
    ])
      box([0.025, dh, 0.025], "#e8dfc0", [x + dx, y0 - dh / 2, z + 0.04], joint);

    // flame: three nested stepped layers in two crossed planes
    const fy = y0 + 0.11;
    const layers: [typeof FLAME_OUT, string, number, number, number][] = [
      [FLAME_OUT, FIRE.outer, 0.05, 0, 1.6],
      [FLAME_MID, FIRE.mid, 0.065, 0.02, 1.8],
      [FLAME_IN, FIRE.core, 0.08, 0.02, 2.2],
    ];
    for (const [outline, color, th, dy, k] of layers) {
      glow(
        b.extrude(outline, {
          at: [x, fy + dy, z],
          x: [s, 0, 0],
          y: [0, 1, 0],
          thickness: th,
          color,
          bone: joint,
        }),
        k,
      );
      glow(
        b.extrude(outline, {
          at: [x, fy + dy, z],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: th,
          color,
          bone: joint,
        }),
        k,
      );
    }
    for (let i = 0; i < 6; i++) {
      const ez = 0.014 + rand() * 0.012;
      glow(
        box(
          [ez, ez, ez],
          i % 2 ? FIRE.mid : FIRE.core,
          [x + (rand() - 0.5) * 0.2, fy + 0.12 + rand() * 0.28, z + (rand() - 0.5) * 0.2],
          joint,
          [0, rand() * 80, 0],
        ),
        2,
      );
    }
  };
  torch(1, torchL);
  torch(-1, torchR);

  // ---- barrels --------------------------------------------------------------------------------------------
  const hoops = [0.08, 0.28, 0.5, 0.64];
  const hoopOutline = (y0: number): [number, number][] => {
    const y1 = y0 + 0.05;
    const rO = Math.max(barrelR(y0), barrelR(y1)) + 0.02;
    const rI = Math.min(barrelR(y0), barrelR(y1)) - 0.03;
    return [
      [rI, y0],
      [rO, y0],
      [rO, y1],
      [rI, y1],
    ];
  };
  // standing
  b.lathe(BARREL, { at: [1.12, FY, -0.72], segments: 8, color: WOODP, bone: barrel1 });
  for (const hy of hoops)
    b.lathe(hoopOutline(hy), { at: [1.12, FY, -0.72], segments: 8, color: IRONP, bone: barrel1 });
  box([0.3, 0.02, 0.05], WOOD_RAMP[1], [1.12, FY + 0.725, -0.72], barrel1, [0, 30, 0]);
  // lying
  const yaw = 12 * DEG;
  const axis: V3 = [Math.sin(yaw), 0, Math.cos(yaw)];
  const base: V3 = [1.12 - axis[0] * 0.375, FY + 0.27, 0.05 - axis[2] * 0.375];
  b.lathe(BARREL, { at: base, axis, segments: 8, color: WOODP, bone: barrel2 });
  for (const hy of hoops) b.lathe(hoopOutline(hy), { at: base, axis, segments: 8, color: IRONP, bone: barrel2 });
  // tap on the lying barrel
  box([0.04, 0.04, 0.09], IRONP, [1.12 + axis[0] * 0.38, FY + 0.27, 0.05 + axis[2] * 0.38 + 0.02], barrel2, [
    0,
    12,
    0,
  ]);

  // ---- bones ----------------------------------------------------------------------------------------------
  b.part(femurGeo(0.36), BONEP, { bone: bonesJ, at: [BX0, FY + 0.0225, BZ0], rotation: [0, 20, 0] });
  b.part(femurGeo(0.34), BONEP, { bone: bonesJ, at: [BX0 + 0.02, FY + 0.0675, BZ0], rotation: [0, -55, 0] });
  b.part(femurGeo(0.3), BONEP, { bone: bonesJ, at: [BX0 + 0.15, FY + 0.0225, BZ0 + 0.28], rotation: [0, 85, 0] });

  // ribcage: spine plus five arches
  const RY = 30;
  const RC: V3 = [BX0 + 0.22, FY, BZ0 - 0.2];
  b.part(new THREE.BoxGeometry(0.04, 0.04, 0.4), BONEP, { bone: bonesJ, at: [RC[0], FY + 0.12, RC[2]], rotation: [0, RY, 0] });
  [0.09, 0.105, 0.11, 0.105, 0.09].forEach((rr, i) => {
    const [ox, oz] = rotY(0, -0.15 + i * 0.075, RY * DEG);
    b.part(ribGeo(rr), BONEP, { bone: bonesJ, at: [RC[0] + ox, FY + (0.11 - rr) + 0.0, RC[2] + oz], rotation: [0, RY, 0] });
  });

  // vertebrae
  for (const [vx, vz, vr] of [
    [-0.3, -0.2, 20],
    [-0.12, -0.34, 50],
    [0.52, 0.1, 10],
    [0.28, 0.22, 70],
    [-0.38, 0.32, 35],
  ] as V3[])
    box([0.045, 0.035, 0.045], BONEP, [BX0 + vx, FY + 0.0175, BZ0 + vz], bonesJ, [0, vr, 0]);

  skull([BX0 - 0.2, FY + 6.4 * 0.02, BZ0 + 0.1], -20, 0.02, bonesJ);
  skull([BX0 + 0.38, FY + 6.4 * 0.012, BZ0 + 0.1], 35, 0.012, bonesJ);
  skull([-0.36, FY + 6.4 * 0.012, 0.85], 25, 0.012, root);

  // ---- spike trap -----------------------------------------------------------------------------------------
  tbox([0.9, 0.06, 0.9], TRAP, [TX, FY + 0.03, TZ], trap);
  for (const sz of [-1, 1]) box([0.94, 0.05, 0.04], IRONP, [TX, FY + 0.025, TZ + sz * 0.47], trap);
  for (const sx of [-1, 1]) box([0.04, 0.05, 0.9], IRONP, [TX + sx * 0.47, FY + 0.025, TZ], trap);
  const pattern = ["UUMRU", "UMUUR", "RUUUM", "UUMUU", "MRUUU"];
  const bloody = new Set(["2,2", "1,3", "3,1"]);
  for (let j = 0; j < 5; j++)
    for (let i = 0; i < 5; i++) {
      const state = pattern[j][i];
      const k = state === "U" ? 1 : state === "M" ? 0.55 : 0.2;
      b.part(spikeGeo(k), bloody.has(`${i},${j}`) ? STEEL_RED : STEEL, {
        bone: spikesJ,
        at: [TX + (i - 2) * 0.16, FY + 0.06, TZ + (j - 2) * 0.16],
      });
    }

  // blood stain near the trap
  b.part(new THREE.PlaneGeometry(0.28, 0.2), "#ffffff", {
    texture: BLOOD,
    bone: root,
    at: [-0.2, FY + 0.004, 0.7],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
  });

  // ---- loose pebbles --------------------------------------------------------------------------------------
  const pebbles: V3[] = [
    [-1.4, -0.4, 10],
    [-1.3, 1.1, 40],
    [-0.1, -0.7, 25],
    [0.5, 1.05, 60],
    [1.45, 1.0, 15],
    [-0.7, -0.3, 35],
    [0.62, 0.3, 5],
    [1.5, 0.7, 50],
  ];
  pebbles.forEach(([px, pz, pr], i) => {
    const sz = 0.04 + (i % 3) * 0.015;
    box([sz, sz * 0.7, sz], i % 2 ? "#4a4960" : "#5a5972", [px, FY + sz * 0.3, pz], root, [0, pr, 0]);
  });

  // ---- open the chest -------------------------------------------------------------------------------------
  b.pose(lid, { axis: [1, 0, 0], deg: -25 });

  return b.root;
}
```