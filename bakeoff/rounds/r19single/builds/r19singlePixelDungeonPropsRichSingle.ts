// Dungeon props in pixel art: a ruined flagstone corner with an open treasure chest, wall torches and a brazier,
// three barrels, a pile of bones and a bloody spike trap. Everything stays on the world pixel grid (cellPaint cells
// and pixel textures), so texels read as hard squares from every side.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { arc } from "../../../../src/path";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, stepped } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dungeon Props",
  description:
    "A flagstone dungeon corner in pixel art: open treasure chest with gold and gems, wall torches and a standing brazier, chained manacles, three barrels (one oozing, one tipped and spilling), a pile of bones with skulls, and an armed, bloody spike trap.",
  style: "pixel art",
  commit: "88fc1f0",
};

const D = Math.PI / 180;
/** Thickness of the floor slab: every prop stands on y = FL. */
const FL = 0.08;
/** Pixel (cell) sizes in meters: big surfaces, mid props, fine details. */
const TEXEL = 0.02;
const CH = 0.0125;
const FINE = 0.01;

type V3t = [number, number, number];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const mod = (n: number, m: number) => ((n % m) + m) % m;
const hash = (a: number, b: number, s = 0) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const eul = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * D, y * D, z * D));

/** A local frame (origin + rotation) in model space: props are drawn in their own axes and placed through it. */
class Frm {
  constructor(
    readonly o: THREE.Vector3,
    readonly q: THREE.Quaternion = new THREE.Quaternion(),
  ) {}

  p(x: number, y: number, z: number) {
    return new THREE.Vector3(x, y, z).applyQuaternion(this.q).add(this.o);
  }

  dir(x: number, y: number, z: number) {
    return new THREE.Vector3(x, y, z).applyQuaternion(this.q);
  }

  sub(x: number, y: number, z: number, q?: THREE.Quaternion) {
    return new Frm(this.p(x, y, z), q ? this.q.clone().multiply(q) : this.q.clone());
  }
}

// Palettes (dark to light).
const STONE = ["#1b1c25", "#2a2c3a", "#3a3d4f", "#4c5068", "#61667f", "#7b819b"];
const MOSS = ["#14261a", "#1f3c22", "#2e5a2a", "#477f36"];
const MORTAR = "#121319";
const WOOD = ["#28160b", "#3c2210", "#553218", "#6f4520", "#8c5d2c", "#ab7a3e"];
const CHESTW = ["#2a1009", "#451d0f", "#652f16", "#8a4821", "#ad6832"];
const IRON = ["#14161d", "#242832", "#383d4b", "#525869", "#79819a"];
const RUSTR = ["#4a2a1c", "#6e3d24", "#94552e"];
const BONE_R = ["#5d5444", "#8e856a", "#bdb393", "#e0d8bc", "#f6f0d8"];
const GOLD_R = ["#5e3a0c", "#96640f", "#cf9a1e", "#f4c93a", "#fff0a0"];
const CLOTH = ["#33080f", "#560f1d", "#7c1a2c", "#a02a40"];
const CHAR = ["#0d0907", "#201510", "#38251a", "#5a3a22"];
const BLOODR = ["#3a0a10", "#6a1018", "#9c1c24"];
const SACK = ["#4d3b22", "#6a5230", "#876c40", "#a88a52"];
const AMBER = ["#5a380c", "#85560f", "#b47f1c", "#dfa83a", "#ffe08a"];

const BAR: [number, number][] = [
  [0, 0.19],
  [0.14, 0.235],
  [0.31, 0.25],
  [0.48, 0.235],
  [0.62, 0.19],
];
const rAt = (y: number) => {
  for (let i = 0; i < BAR.length - 1; i++) {
    const [y0, r0] = BAR[i];
    const [y1, r1] = BAR[i + 1];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return BAR[BAR.length - 1][1];
};

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const W = new Frm(V(0, 0, 0));

  // ---------------------------------------------------------------------------------------------------------------
  // Placement helpers

  const put = (geo: THREE.BufferGeometry, color: Fill, F: Frm, p: V3t, rot?: V3t, opts: PartOptions = {}) =>
    b.part(geo, color, {
      bone: root,
      at: F.p(...p),
      quat: rot ? F.q.clone().multiply(eul(...rot)) : F.q.clone(),
      flat: true,
      ...opts,
    });
  const box = (F: Frm, p: V3t, s: V3t, color: Fill, rot?: V3t, opts?: PartOptions) =>
    put(new THREE.BoxGeometry(...s), color, F, p, rot, opts);
  const cyl = (
    F: Frm,
    p: V3t,
    rTop: number,
    rBot: number,
    h: number,
    seg: number,
    color: Fill,
    rot?: V3t,
    opts?: PartOptions,
  ) => put(new THREE.CylinderGeometry(rTop, rBot, h, seg), color, F, p, rot, opts);

  // ---------------------------------------------------------------------------------------------------------------
  // Paints (square cells on the world grid)

  const floorPaint = cellPaint(TEXEL, (c) => {
    if (c.axis !== 1) {
      if (mod(c.v, 5) === 0) return MORTAR;
      return c.pick(STONE, 0.22 + 0.2 * c.random(2) - (c.random(3) < 0.06 ? 0.15 : 0));
    }
    const row = Math.floor(c.v / 8);
    const x = c.u + Math.floor(hash(row, 0, 2) * 14);
    const col = Math.floor(x / 14);
    const lx = mod(x, 14);
    const ly = mod(c.v, 8);
    if (lx === 0 || ly === 0) return MORTAR;
    if (noise(c.at, 0.45, 11) > 0.66 && c.random(8) < 0.65) return c.pick(MOSS, 0.15 + 0.85 * c.random(9));
    let v = 0.4 + 0.3 * hash(col, row, 3);
    if (ly === 7 || lx === 1) v += 0.16;
    else if (ly === 1 || lx === 13) v -= 0.14;
    if (c.random(5) < 0.06) v -= 0.18;
    else if (c.random(6) < 0.03) v += 0.2;
    return c.pick(STONE, v);
  });

  const TORCH_X = [-0.62, 0.62];
  const TORCH_Y = FL + 1.0;
  const wallPaint = cellPaint(TEXEL, (c) => {
    if (c.axis === 1) return c.pick(STONE, 0.45 + 0.35 * c.random(1));
    if (c.axis === 0) return c.pick(STONE, 0.18 + 0.25 * c.random(2));
    const row = Math.floor(c.v / 7);
    const w = 13 + Math.floor(hash(row, 1, 4) * 7);
    const x = c.u + Math.floor(hash(row, 2, 5) * w);
    const col = Math.floor(x / w);
    const lx = mod(x, w);
    const ly = mod(c.v, 7);
    if (lx === 0 || ly === 0) return MORTAR;
    if (c.at.y < FL + 0.45 && noise(c.at, 0.3, 5) > 0.55 && c.random(6) < 0.6) return c.pick(MOSS, c.random(7));
    let v = 0.38 + 0.3 * hash(col, row, 6);
    if (ly === 6 || lx === 1) v += 0.15;
    else if (ly === 1 || lx === w - 1) v -= 0.13;
    if (noise(V(c.at.x * 2.5, c.at.y * 0.5, c.at.z), 0.5, 3) > 0.62) v -= 0.12;
    for (const tx of TORCH_X) {
      const dx = Math.abs(c.at.x - tx);
      if (dx < 0.15 && c.at.y > TORCH_Y + 0.2 && c.random(9) < 0.9 - dx * 4) v -= 0.22;
    }
    if (c.random(8) < 0.05) v -= 0.2;
    return c.pick(STONE, v);
  });

  const ironPaint = (size: number, seed: number) =>
    cellPaint(
      size,
      (c) => {
        if (c.random(seed + 1) < 0.09) return c.pick(RUSTR, c.random(seed + 2));
        return c.pick(IRON, 0.32 + 0.28 * c.n.y + 0.12 * c.n.z - 0.08 * c.n.x + 0.3 * (c.random(seed + 3) - 0.5));
      },
      { dither: true },
    );
  const ironB = ironPaint(FINE, 1);
  const ironC = ironPaint(CH, 5);

  const bonePaint = cellPaint(
    FINE,
    (c) => c.pick(BONE_R, 0.55 + 0.25 * c.n.y + 0.12 * c.n.z + 0.3 * (c.random(1) - 0.5)),
    { dither: true },
  );

  const goldPaint = cellPaint(
    FINE,
    (c) => {
      if (c.random(1) < 0.07) return "#fff4b0";
      return c.pick(GOLD_R, 0.5 + 0.3 * c.n.y + 0.45 * (c.random(2) - 0.5));
    },
    { dither: true },
  );

  const barrelPaint = (ctr: THREE.Vector3, ax: THREE.Vector3, seed: number) =>
    cellPaint(
      TEXEL,
      (c) => {
        const rel = c.at.clone().sub(ctr);
        const along = rel.dot(ax);
        const radial = rel.clone().addScaledVector(ax, -along);
        if (Math.abs(c.n.dot(ax)) > 0.9) {
          if (radial.length() > 0.158) return c.pick(WOOD, 0.45 + 0.12 * c.random(1));
          if (mod(c.u, 4) === 0) return WOOD[0];
          const plank = Math.floor(c.u / 4);
          return c.pick(WOOD, 0.35 + 0.3 * hash(plank, seed, 7) + 0.1 * (c.random(2) - 0.5));
        }
        const n = c.n;
        const e1 = Math.abs(ax.y) > 0.9 ? V(0, 0, 1) : V(0, 1, 0);
        e1.addScaledVector(ax, -e1.dot(ax)).normalize();
        const e2 = ax.clone().cross(e1);
        const k = Math.round((Math.atan2(n.dot(e2), n.dot(e1)) * 8) / (2 * Math.PI));
        const apothem = Math.max(radial.dot(n), 0.05);
        const t = radial.dot(ax.clone().cross(n).normalize());
        if (Math.abs(t) > 0.414 * apothem - 0.011) return WOOD[0];
        const a = Math.floor(along / TEXEL);
        if (mod(a + k * 5, 15) === 0) return WOOD[1];
        if (along < -0.2 && noise(c.at, 0.2, 9) > 0.62 && c.random(3) < 0.6) return c.pick(MOSS, c.random(4));
        let base = 1 + Math.floor(hash(k, seed, 1) * 3);
        if (hash(k, Math.floor(t / TEXEL), 3 + seed) < 0.1) base -= 0.7;
        const g = Math.max(-1, Math.min(1, along / 0.31));
        return c.pick(WOOD, (base + 0.9 * g * 0.5) / 5);
      },
      { dither: true },
    );

  const CX = -0.62;
  const CZ = -0.3;
  const chestPaint = cellPaint(CH, (c) => {
    if (c.n.y < -0.6) return c.pick(CLOTH, 0.35 + 0.25 * c.random(1));
    if (c.axis === 1 && c.n.y > 0.6 && c.at.y < FL + 0.38) {
      const dx = Math.abs(c.at.x - CX);
      const dz = Math.abs(c.at.z - CZ);
      if (dx < 0.285 && dz < 0.165)
        return mod(c.u + c.v, 2) === 0 ? c.pick(CLOTH, 0.3 + 0.4 * c.random(2)) : c.pick(CLOTH, 0.15 + 0.2 * c.random(3));
    }
    const row = Math.floor(c.v / 6);
    const ly = mod(c.v, 6);
    if (ly === 0) return CHESTW[0];
    const x = c.u + Math.floor(hash(row, 3, 1) * 30);
    if (mod(x, 34) === 0) return CHESTW[0];
    let v = 0.42 + 0.25 * hash(Math.floor(x / 34), row, 2);
    if (ly === 5) v += 0.2;
    if (c.random(3) < 0.12) v -= 0.18;
    return c.pick(CHESTW, v);
  });

  const sackPaint = cellPaint(FINE, (c) => {
    const weave = mod(c.u + c.v, 2) === 0 ? 0.08 : -0.06;
    if (c.random(2) < 0.04) return SACK[0];
    return c.pick(SACK, 0.45 + 0.25 * c.n.y + weave + 0.3 * (c.random(1) - 0.5));
  });

  const charPaint = cellPaint(FINE, (c) => {
    if (c.random(1) < 0.08) return "#d9541a";
    return c.pick(CHAR, 0.35 + 0.5 * c.random(2));
  });

  const woodPaint = cellPaint(FINE, (c) => {
    if (mod(c.v, 9) === 0 && c.random(3) < 0.5) return WOOD[0];
    return c.pick(WOOD, 0.3 + 0.4 * c.random(1) + 0.15 * c.n.y);
  });

  const amberPaint = cellPaint(FINE, (c) => {
    if (c.random(1) < 0.06) return AMBER[4];
    return c.pick(AMBER, 0.45 + 0.4 * noise(c.at, 0.12, 4) + 0.15 * (c.random(2) - 0.5));
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Textures

  const flameA = pixelArt(
    [
      "....r....",
      "...rr....",
      "...ror...",
      "..roor...",
      "..rooor..",
      ".roooor..",
      ".rooyor..",
      ".rooyoor.",
      "rooyyyor.",
      "rooyywyor",
      "rooyywyor",
      ".rooywor.",
      ".rooyoor.",
      "..roooor.",
    ],
    { r: "#d8321c", o: "#f5821f", y: "#ffd23c", w: "#fff3b0" },
  );
  const flameB = pixelArt(
    [
      "....r....",
      "....rr...",
      "...rrr...",
      "..rorr...",
      "..roor...",
      ".rooor...",
      ".rooyor..",
      ".roooyor.",
      "rooyyyor.",
      "rooyywor.",
      "rooyywyor",
      ".rooyyyor",
      ".rooyoor.",
      "..roooor.",
    ],
    { r: "#d8321c", o: "#f5821f", y: "#ffd23c", w: "#fff3b0" },
  );
  const coalTex = pixelArt(
    ["kkrkkrkk", "krokkork", "kkkryrkk", "rkkkkkok", "orkrkkrk", "kkoyokkk", "kkkrkkrk", "krkkrokk"],
    { k: "#1a0c08", r: "#8a1a0c", o: "#e4571a", y: "#ffb43a" },
  );
  const oozeTex = pixelArt(
    ["aabbbbaa", "abbbccba", "bbbccdcb", "bbcbbcbb", "bcbbbbcb", "bbbcdcbb", "abbbbbba", "aabbbbaa"],
    { a: "#0e5a2a", b: "#25a844", c: "#6eea6c", d: "#d5ffb0" },
  );
  const labelTex = pixelArt(
    [
      "dddddddddddd",
      "dppppppppppd",
      "dpppwwwwpppd",
      "dppwwwwwwppd",
      "dppwkwwkwppd",
      "dppwkwwkwppd",
      "dpppwwwwpppd",
      "dpppwkkwpppd",
      "dprpwwwwprpd",
      "dpprpppprppd",
      "dppppppppppd",
      "dddddddddddd",
    ],
    { p: "#d4c08a", d: "#3a2814", w: "#f1ead0", k: "#15110d", r: "#a02424" },
  );
  const webTex = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      const d = Math.hypot(x + 0.5, y + 0.5);
      const radial = x === 0 || y === 0 || x === y || x === 2 * y || y === 2 * x;
      const ring = [4, 8, 12].some((r) => Math.abs(d - r) < 0.75) && hash(x, y, 4) < 0.85;
      return (radial && d < 15) || ring ? "#d7dbe6" : undefined;
    });
  });

  const layout = skinLayout({ head: [8, 8, 8], jaw: [6, 3, 6] }, 32);
  const skullTex = pixelTexture(layout.size[0], layout.size[1], (g) => {
    for (const faces of Object.values(layout.faces))
      for (const [k, rect] of Object.entries(faces))
        g.fill(
          (x, y, _w, h) => pick(BONE_R, 0.82 - 0.35 * (y / h) - (k === "ny" ? 0.2 : 0), bayer(x, y)),
          rect,
        );
    const hf = layout.faces.head.pz;
    g.stamp(
      hf[0],
      hf[1],
      ["........", "........", ".kk..kk.", ".kk..kk.", "...kk...", "........", "tktktktk", "........"],
      { k: "#15110d", t: "#f3edd2" },
    );
    const jf = layout.faces.jaw.pz;
    g.stamp(jf[0], jf[1], ["tktktk", "......", "......"], { k: "#15110d", t: "#f3edd2" });
    g.set(hf[0] + 5, hf[1] + 1, "#3a3226");
    g.set(hf[0] + 6, hf[1] + 2, "#3a3226");
    const px = layout.faces.head.px;
    g.set(px[0] + 3, px[1] + 2, "#3a3226");
    g.set(px[0] + 4, px[1] + 3, "#3a3226");
    g.set(px[0] + 4, px[1] + 4, "#3a3226");
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Floor, wall, pillars

  box(W, [0, FL / 2, 0], [2.6, FL, 2.0], floorPaint);

  const heights = [14, 14, 13, 15, 15, 14, 12, 12, 13, 14, 15, 15, 14, 13, 12, 11, 12, 13, 14, 14, 15, 15, 14, 13, 13, 14];
  b.extrude(
    stepped(
      heights.map((h) => [0, h] as [number, number]),
      0.1,
    ),
    { at: [-1.3, FL, -0.9], x: [1, 0, 0], thickness: 0.2, color: wallPaint, bone: root },
  );
  box(W, [0, FL + 0.06, -0.77], [2.6, 0.12, 0.06], wallPaint);
  // left pillar with a corbel cap, right pillar broken, with rubble
  box(W, [-1.19, FL + 0.675, -0.76], [0.22, 1.35, 0.08], wallPaint);
  box(W, [-1.19, FL + 1.375, -0.76], [0.26, 0.05, 0.12], wallPaint);
  box(W, [1.19, FL + 0.6, -0.76], [0.22, 1.2, 0.08], wallPaint);
  box(W, [1.19, FL + 1.2, -0.76], [0.14, 0.06, 0.08], wallPaint);
  box(W, [1.12, FL + 0.03, -0.62], [0.12, 0.06, 0.1], wallPaint);
  box(W, [1.22, FL + 0.025, -0.6], [0.08, 0.05, 0.08], wallPaint);

  // cobwebs in the pillar corners
  put(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", W, [-1.19 + 0.0, FL + 1.34 - 0.11, -0.715], undefined, {
    texture: webTex,
  });
  put(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", W, [1.19, FL + 1.2 - 0.1, -0.715], [0, 0, -90], {
    texture: webTex,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Wall torches

  const flameFrames = (at: THREE.Vector3) => [frame(at, [0, 1, 0])];
  const wallTorch = (tx: number, seed: number) => {
    const F = new Frm(V(tx, TORCH_Y, -0.8));
    box(F, [0, 0, 0.012], [0.1, 0.18, 0.024], ironB);
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) box(F, [sx * 0.034, sy * 0.07, 0.027], [0.014, 0.014, 0.012], "#8a91a8");
    box(F, [0, 0.04, 0.075], [0.032, 0.03, 0.1], ironB);
    const T = F.sub(0, 0.1, 0.12, eul(16, 0, 0));
    cyl(T, [0, 0.1, 0], 0.02, 0.017, 0.4, 6, woodPaint);
    cyl(T, [0, 0, 0], 0.04, 0.04, 0.035, 8, ironB);
    cyl(T, [0, 0.25, 0], 0.037, 0.026, 0.13, 8, charPaint);
    cyl(T, [0, 0.21, 0], 0.04, 0.04, 0.012, 8, "#7a5632");
    cyl(T, [0, 0.27, 0], 0.04, 0.04, 0.012, 8, "#7a5632");
    const base = T.p(0, 0.3, 0);
    glow(
      b.cards(flameFrames(base), [flameA, flameB], {
        size: [0.15, 0.24],
        cross: true,
        bone: root,
        rng: rng(seed),
      }),
      1.3,
    );
    glow(
      b.cards(flameFrames(base.clone().add(V(0.01, 0, 0.012))), [flameB, flameA], {
        size: [0.09, 0.15],
        cross: true,
        spin: 25,
        bone: root,
        rng: rng(seed + 3),
      }),
      1.3,
    );
    for (let i = 0; i < 4; i++) {
      const e = base.clone().add(V(0.05 * Math.sin(i * 2.3 + seed), 0.2 + 0.05 * i, 0.04 * Math.cos(i * 1.7 + seed)));
      glow(put(new THREE.BoxGeometry(0.012, 0.012, 0.012), "#ff9a2a", W, [e.x, e.y, e.z]), 1.2);
    }
  };
  wallTorch(TORCH_X[0], 3);
  wallTorch(TORCH_X[1], 8);

  // ---------------------------------------------------------------------------------------------------------------
  // Hanging chains and manacles

  const hangChain = (x: number, yTop: number, n: number) => {
    const link = new THREE.TorusGeometry(0.017, 0.005, 4, 6);
    box(W, [x, yTop + 0.02, -0.765], [0.05, 0.03, 0.05], ironB);
    for (let i = 0; i < n; i++) put(link, "#4a4f5e", W, [x, yTop - i * 0.03, -0.75], [0, i % 2 ? 90 : 0, 0]);
    const yc = yTop - n * 0.03 - 0.045;
    put(new THREE.TorusGeometry(0.036, 0.009, 4, 8), "#5a6074", W, [x, yc, -0.75]);
    box(W, [x, yc + 0.034, -0.75], [0.03, 0.026, 0.03], "#6d748a");
    box(W, [x, yc - 0.036, -0.75], [0.026, 0.02, 0.026], "#3b3f4c");
  };
  hangChain(0.0, FL + 1.28, 14);
  hangChain(0.17, FL + 1.28, 10);

  // ---------------------------------------------------------------------------------------------------------------
  // Treasure chest (open lid on a hinge joint)

  const lid = b.joint("lidHinge", { parent: root, at: [CX, FL + 0.36, CZ - 0.2], dir: [1, 0, 0], role: "hinge" });
  const CF = new Frm(V(CX, FL, CZ));
  box(CF, [0, 0.18, 0], [0.64, 0.36, 0.4], chestPaint);
  // iron fittings: corner posts, rim bands, straps
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box(CF, [sx * 0.305, 0.18, sz * 0.185], [0.05, 0.36, 0.05], ironC);
      for (const h of [0.06, 0.18, 0.3]) {
        box(CF, [sx * 0.305, h, sz * 0.212], [0.016, 0.016, 0.01], "#9aa2ba");
        box(CF, [sx * 0.332, h, sz * 0.185], [0.01, 0.016, 0.016], "#9aa2ba");
      }
    }
  box(CF, [0, 0.03, 0], [0.66, 0.04, 0.42], ironC);
  box(CF, [0, 0.345, 0], [0.66, 0.03, 0.42], ironC);
  for (const sx of [-1, 1]) {
    box(CF, [sx * 0.18, 0.18, 0.2], [0.05, 0.36, 0.02], ironC);
    box(CF, [sx * 0.18, 0.18, -0.2], [0.05, 0.36, 0.02], ironC);
    for (const h of [0.1, 0.26]) box(CF, [sx * 0.18, h, 0.212], [0.016, 0.016, 0.008], "#9aa2ba");
  }
  // lock plate with keyhole
  box(CF, [0, 0.27, 0.208], [0.09, 0.11, 0.012], goldPaint);
  box(CF, [0, 0.285, 0.215], [0.018, 0.018, 0.004], "#15110d");
  box(CF, [0, 0.265, 0.215], [0.01, 0.03, 0.004], "#15110d");
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(CF, [sx * 0.036, 0.27 + sy * 0.045, 0.215], [0.01, 0.01, 0.004], "#fff0a0");

  // lid: a pixel-stepped arch, two iron bands, hasp and hinge plates
  const archCols = 32;
  const arch = stepped(
    Array.from({ length: archCols }, (_, i) => {
      const u = (i + 0.5 - archCols / 2) / (archCols / 2);
      return [0, 4 + Math.round(10 * Math.sqrt(1 - u * u))] as [number, number];
    }),
    CH,
  );
  b.extrude(arch, {
    at: [CX, FL + 0.36, CZ - 0.2],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.64,
    color: chestPaint,
    bone: lid,
  });
  const g = 0.01;
  const mid = (archCols * CH) / 2;
  const bandOutline = arch.map(
    ([x, y]) => [x < mid ? x - g : x + g, y > 0 ? y + g : y, "sharp"] as [number, number, "sharp"],
  );
  for (const sx of [-1, 1]) {
    b.extrude(bandOutline, {
      at: [CX + sx * 0.18, FL + 0.36, CZ - 0.2],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.05,
      color: ironC,
      bone: lid,
    });
    box(CF, [sx * 0.2, 0.37, -0.205], [0.07, 0.05, 0.02], "#6d748a", undefined, { bone: lid });
  }
  box(CF, [0, 0.36, 0.207], [0.07, 0.15, 0.014], ironC, undefined, { bone: lid });
  box(CF, [0, 0.4, 0.216], [0.03, 0.03, 0.006], "#9aa2ba", undefined, { bone: lid });

  // gold, gems and coins in the chest
  box(CF, [0, 0.38, 0], [0.54, 0.04, 0.28], goldPaint);
  box(CF, [0.02, 0.4125, 0], [0.42, 0.035, 0.22], goldPaint);
  box(CF, [-0.03, 0.4425, 0], [0.28, 0.03, 0.14], goldPaint);
  const rnd = rng(7);
  for (let i = 0; i < 16; i++) {
    const px = (rnd() - 0.5) * 0.4;
    const pz = (rnd() - 0.5) * 0.2;
    const py = px < 0.12 && px > -0.2 && Math.abs(pz) < 0.06 ? 0.468 : 0.44;
    cyl(CF, [px, py + 0.004 * i * 0.2, pz], 0.03, 0.03, 0.008, 8, i % 2 ? "#f2c43a" : "#cf9a22", [
      (rnd() - 0.5) * 50,
      rnd() * 90,
      (rnd() - 0.5) * 50,
    ]);
  }
  const gems: [number, number, string][] = [
    [0.07, 0.03, "#e83a4a"],
    [-0.1, -0.04, "#3ab0f0"],
    [0.18, -0.06, "#4be08a"],
  ];
  gems.forEach(([gx, gz, col]) => {
    glow(put(new THREE.OctahedronGeometry(0.024, 0), col, CF, [gx, 0.475, gz], [10, 30, 0]), 0.9);
  });
  // coins spilled over the lip and onto the floor
  const spill: [number, number, number, boolean][] = [
    [0.1, 0.01, 0.26, true],
    [0.16, 0.004, 0.33, false],
    [-0.12, 0.004, 0.31, true],
    [0.28, 0.004, 0.24, false],
    [-0.02, 0.004, 0.4, true],
    [0.04, 0.004, 0.3, false],
  ];
  spill.forEach(([x, y, z, tone], i) => {
    cyl(CF, [x, y + 0.004, z], 0.03, 0.03, 0.008, 8, tone ? "#f2c43a" : "#cf9a22", [0, i * 40, i % 3 === 0 ? 14 : 0]);
  });
  for (let i = 0; i < 4; i++) cyl(CF, [-0.4, 0.004 + i * 0.008, 0.3], 0.03, 0.03, 0.008, 8, i % 2 ? "#f2c43a" : "#cf9a22", [0, i * 25, 0]);

  // a key on the floor
  const KF = new Frm(V(-0.12, FL + 0.005, -0.12), eul(0, 40, 0));
  put(new THREE.TorusGeometry(0.018, 0.006, 4, 8), "#e0a828", KF, [0, 0, 0], [90, 0, 0]);
  box(KF, [0.05, 0, 0], [0.07, 0.008, 0.008], "#e0a828");
  box(KF, [0.075, 0, 0.011], [0.008, 0.008, 0.014], "#e0a828");
  box(KF, [0.06, 0, 0.011], [0.008, 0.008, 0.01], "#e0a828");

  // ---------------------------------------------------------------------------------------------------------------
  // Barrels

  const barrel = (F: Frm, seed: number, kind: "closed" | "open" | "lying") => {
    const paintB = barrelPaint(F.p(0, 0.31, 0), F.dir(0, 1, 0), seed);
    for (let i = 0; i < 4; i++) {
      const [y0, r0] = BAR[i];
      const [y1, r1] = BAR[i + 1];
      put(new THREE.CylinderGeometry(r1, r0, y1 - y0, 8, 1, i === 1 || i === 2), paintB, F, [0, (y0 + y1) / 2, 0]);
    }
    for (const y of [0.07, 0.21, 0.42, 0.55]) {
      const r = rAt(y) + 0.016;
      cyl(F, [0, y, 0], r, r, 0.04, 8, ironB);
      if (y === 0.07 || y === 0.55)
        for (let k = 0; k < 8; k++) {
          const th = k * 45 * D;
          box(F, [r * Math.sin(th), y, r * Math.cos(th)], [0.022, 0.022, 0.022], "#8a91a8", [0, k * 45, 0]);
        }
    }
    if (kind === "closed") {
      cyl(F, [0, 0.626, 0], 0.172, 0.172, 0.012, 8, paintB);
      box(F, [0.07, 0.634, 0.04], [0.03, 0.006, 0.03], "#15110d");
      const ap = rAt(0.31) * Math.cos(Math.PI / 8) + 0.004;
      put(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", F, [ap * Math.sin(Math.PI / 8), 0.32, ap * Math.cos(Math.PI / 8)], [0, 22.5, 0], {
        texture: labelTex,
      });
    } else if (kind === "open") {
      glow(
        put(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 8), "#ffffff", F, [0, 0.626, 0], undefined, { texture: oozeTex }),
        0.8,
      );
    } else {
      cyl(F, [0, 0.626, 0], 0.15, 0.15, 0.01, 8, "#1c1008");
    }
  };
  barrel(new Frm(V(1.02, FL, -0.45)), 1, "closed");
  barrel(new Frm(V(0.5, FL, -0.55)), 2, "open");
  barrel(new Frm(V(1.05, FL + 0.231, 0.06), eul(0, 0, 90).multiply(eul(0, 22.5, 0))), 3, "lying");

  // spilled ale
  const puddles: [number, number, number, number, number][] = [
    [0.22, 0.06, 0.36, 0.2, 0.007],
    [0.08, 0.11, 0.2, 0.12, 0.0075],
    [0.36, -0.0, 0.14, 0.1, 0.008],
    [-0.0, 0.03, 0.1, 0.07, 0.0072],
  ];
  puddles.forEach(([x, z, w, d, h]) => box(W, [x, FL + h / 2, z], [w, h, d], amberPaint));

  // sack
  const SF = new Frm(V(-0.05, FL, -0.55));
  box(SF, [0, 0.09, 0], [0.28, 0.18, 0.22], sackPaint);
  box(SF, [0, 0.21, 0], [0.24, 0.06, 0.2], sackPaint);
  box(SF, [0, 0.265, 0], [0.14, 0.05, 0.12], sackPaint);
  box(SF, [0.01, 0.31, 0], [0.09, 0.05, 0.09], sackPaint, [0, 0, 12]);
  box(SF, [0.005, 0.292, 0], [0.11, 0.014, 0.11], "#8a6a3a");
  box(SF, [0.03, 0.34, 0.01], [0.07, 0.03, 0.05], sackPaint, [0, 0, -22]);
  box(SF, [-0.1, 0.185, 0.113], [0.06, 0.012, 0.004], "#2a1a0c");

  // ---------------------------------------------------------------------------------------------------------------
  // Standing brazier

  const BF = new Frm(V(1.0, FL, 0.72));
  const legAngles = [90, 210, 330].map((a) => a * D);
  const legAt = (a: number, h: number) => {
    const r = 0.2 - 0.11 * (h / 0.4);
    return BF.p(r * Math.sin(a), h, r * Math.cos(a));
  };
  legAngles.forEach((a, i) => {
    b.rod(legAt(a, 0), legAt(a, 0.42), 0.015, { color: ironB, bone: root, sides: 6 });
    b.rod(legAt(a, 0.16), legAt(legAngles[(i + 1) % 3], 0.16), 0.01, { color: "#383d4b", bone: root, sides: 4 });
    const f = legAt(a, 0);
    put(new THREE.BoxGeometry(0.05, 0.016, 0.05), "#2a2e3a", W, [f.x, FL + 0.008, f.z]);
  });
  cyl(BF, [0, 0.475, 0], 0.24, 0.13, 0.15, 8, ironB);
  cyl(BF, [0, 0.535, 0], 0.256, 0.256, 0.03, 8, ironB);
  cyl(BF, [0, 0.43, 0], 0.17, 0.17, 0.014, 8, "#2a2e3a");
  for (let k = 0; k < 8; k++) {
    const th = (k * 45 + 22.5) * D;
    box(BF, [0.256 * Math.sin(th), 0.535, 0.256 * Math.cos(th)], [0.02, 0.02, 0.02], "#8a91a8", [0, k * 45 + 22.5, 0]);
  }
  glow(put(new THREE.CylinderGeometry(0.215, 0.215, 0.012, 8), "#ffffff", BF, [0, 0.548, 0], undefined, { texture: coalTex }), 1.1);
  for (let i = 0; i < 3; i++) {
    box(BF, [-0.08 + i * 0.08, 0.562, 0.05 - i * 0.06], [0.06, 0.03, 0.05], "#1a0c08", [0, 30 * i, 0]);
  }
  const bbase = BF.p(0, 0.55, 0);
  glow(b.cards(flameFrames(bbase), [flameA, flameB], { size: [0.34, 0.54], cross: true, bone: root, rng: rng(21) }), 1.3);
  for (const [dx, dz, s, sd] of [
    [0.1, 0.06, 0.2, 5],
    [-0.1, -0.05, 0.22, 6],
    [0.02, -0.12, 0.16, 7],
  ] as [number, number, number, number][])
    glow(
      b.cards(flameFrames(bbase.clone().add(V(dx, 0, dz))), [flameB, flameA], {
        size: [s * 0.62, s],
        cross: true,
        spin: 20,
        bone: root,
        rng: rng(sd),
      }),
      1.3,
    );
  for (let i = 0; i < 7; i++) {
    const e = bbase.clone().add(V(0.14 * Math.sin(i * 2.1), 0.3 + 0.07 * i, 0.12 * Math.cos(i * 1.3)));
    glow(put(new THREE.BoxGeometry(0.013, 0.013, 0.013), i % 2 ? "#ff9a2a" : "#ffd23c", W, [e.x, e.y, e.z]), 1.2);
  }

  // fallen, burnt-out torch
  const FT = new Frm(V(0.7, FL + 0.021, 0.45), eul(0, 25, 0));
  cyl(FT, [0, 0, 0], 0.02, 0.017, 0.42, 6, woodPaint, [0, 0, -90]);
  cyl(FT, [0.25, 0.008, 0], 0.037, 0.026, 0.13, 8, charPaint, [0, 0, -90]);
  cyl(FT, [0.2, 0.008, 0], 0.04, 0.04, 0.012, 8, "#7a5632", [0, 0, -90]);
  cyl(FT, [0.28, 0.008, 0], 0.04, 0.04, 0.012, 8, "#7a5632", [0, 0, -90]);
  glow(box(FT, [0.318, 0.01, 0.006], [0.01, 0.012, 0.012], "#e4571a"), 1.0);

  // ---------------------------------------------------------------------------------------------------------------
  // Spike trap

  const TX = 0.0;
  const TZ = 0.5;
  const plateTop = FL + 0.035;
  const gx = [-0.25, -0.15, -0.05, 0.05, 0.15, 0.25];
  const gz = [-0.15, -0.05, 0.05, 0.15];
  const platePaint = cellPaint(FINE, (c) => {
    if (c.axis === 1 && c.n.y > 0.5) {
      const rx = c.at.x - TX;
      const rz = c.at.z - TZ;
      const ix = Math.min(5, Math.max(0, Math.round((rx + 0.25) / 0.1)));
      const iz = Math.min(3, Math.max(0, Math.round((rz + 0.15) / 0.1)));
      const dx = Math.abs(rx - (ix * 0.1 - 0.25));
      const dz = Math.abs(rz - (iz * 0.1 - 0.15));
      if (dx < 0.025 && dz < 0.025) return "#07070a";
      if (dx < 0.036 && dz < 0.036) return IRON[0];
      if (c.random(2) < 0.07) return c.pick(BLOODR, c.random(3));
    }
    if (c.random(1) < 0.1) return c.pick(RUSTR, c.random(4));
    return c.pick(IRON, 0.3 + 0.25 * c.n.y + 0.3 * (c.random(5) - 0.5));
  });
  const TF = new Frm(V(TX, FL, TZ));
  box(TF, [0, 0.0225, 0.29], [0.84, 0.045, 0.06], floorPaint);
  box(TF, [0, 0.0225, -0.29], [0.84, 0.045, 0.06], floorPaint);
  box(TF, [-0.39, 0.0225, 0], [0.06, 0.045, 0.52], floorPaint);
  box(TF, [0.39, 0.0225, 0], [0.06, 0.045, 0.52], floorPaint);
  box(TF, [0, 0.025, 0], [0.72, 0.02, 0.52], platePaint);
  for (let i = 0; i < 9; i++) {
    const x = -0.32 + i * 0.08;
    for (const sz of [-1, 1]) box(TF, [x, 0.039, sz * 0.235], [0.016, 0.008, 0.016], "#8a91a8");
  }
  for (let i = 0; i < 5; i++)
    for (const sx of [-1, 1]) box(TF, [sx * 0.335, 0.039, -0.19 + i * 0.095], [0.016, 0.008, 0.016], "#8a91a8");

  const spikePaint = cellPaint(
    FINE,
    (c) => {
      const h = c.at.y - plateTop;
      if (h > 0.12 && c.random(1) < Math.min(0.9, (h - 0.1) * 5)) return c.pick(BLOODR, c.random(2));
      return c.pick(IRON, 0.35 + 0.2 * c.n.z - 0.1 * c.n.x + 0.3 * (c.random(3) - 0.5) + h * 0.8);
    },
    { dither: true },
  );
  for (let i = 0; i < gx.length; i++)
    for (let j = 0; j < gz.length; j++) {
      const len = i === 4 && j === 1 ? 0.36 : 0.14 + 0.1 * hash(i, j, 31);
      b.spike([TX + gx[i], plateTop - 0.012, TZ + gz[j]], [0, 1, 0], len, 0.021, {
        color: spikePaint,
        bone: root,
        sides: 4,
      });
    }

  // ---------------------------------------------------------------------------------------------------------------
  // Bones

  const skull = (F: Frm, p: V3t, rot: V3t) => {
    const S = F.sub(p[0], p[1], p[2], eul(...rot));
    put(skinBox(skullTex, layout.faces.head, 0.0125), "#ffffff", S, [0, 0, 0], undefined, { texture: skullTex });
    put(skinBox(skullTex, layout.faces.jaw, 0.0125), "#ffffff", S, [0, -0.058, 0.008], undefined, { texture: skullTex });
  };
  const femur = (F: Frm, p: V3t, len: number) => {
    const S = F.sub(...p);
    cyl(S, [0, 0, 0], 0.011, 0.011, len - 0.03, 6, bonePaint, [0, 0, 90]);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) box(S, [sx * (len / 2 - 0.012), 0, sz * 0.012], [0.028, 0.028, 0.028], bonePaint);
  };

  // skull on the tallest spike
  const tipY = plateTop - 0.012 + 0.36;
  skull(W, [TX + gx[4], tipY - 0.03, TZ + gz[1]], [-8, 25, 6]);

  // bone pile at the left
  skull(W, [-0.78, FL + 0.06, 0.3], [-40, 30, 0]);
  put(skinBox(skullTex, layout.faces.jaw, 0.0125), "#ffffff", W, [-0.66, FL + 0.019, 0.38], [0, -40, 0], { texture: skullTex });
  femur(new Frm(V(0, 0, 0), eul(0, 20, 0)), [-0.64 * Math.cos(20 * D) - 0.74 * Math.sin(20 * D) * 0 - 0.0, FL + 0.016, 0.74], 0.3);
  femur(new Frm(V(0, 0, 0), eul(0, -30, 0)), [-0.66 * Math.cos(-30 * D) + 0.74 * Math.sin(-30 * D), FL + 0.048, -0.66 * Math.sin(-30 * D) + 0.74 * Math.cos(-30 * D)], 0.28);
  femur(new Frm(V(-1.06, 0, 0.8), eul(0, 70, 0)), [0, FL + 0.016, 0], 0.2);

  // ribcage: a spine along x with ribs arching over it
  const ribZ = 0.58;
  for (let i = 0; i < 7; i++) {
    const x = -1.0 + i * 0.034;
    const r = 0.05 + 0.04 * Math.sin((i / 6) * Math.PI);
    const cy = FL + 0.012;
    b.sweep(arc([x, cy, ribZ], [x, cy, ribZ - r], [1, 0, 0], 170), 0.006, {
      color: "#d9d0b0",
      bone: root,
      sides: 4,
    });
    box(W, [x, cy, ribZ], [0.022, 0.022, 0.026], "#bdb393");
  }
  // pelvis, hand and finger bones
  box(W, [-1.05, FL + 0.008, 0.4], [0.07, 0.016, 0.05], "#d9d0b0", [0, 20, 0]);
  box(W, [-0.99, FL + 0.01, 0.36], [0.05, 0.02, 0.05], "#bdb393", [0, -15, 0]);
  box(W, [-1.1, FL + 0.01, 0.37], [0.05, 0.02, 0.05], "#bdb393", [0, 40, 0]);
  const fingers: [number, number, number][] = [
    [-1.14, 0.6, 12],
    [-1.12, 0.64, 70],
    [-1.16, 0.55, 140],
    [-0.9, 0.86, 30],
    [-0.88, 0.9, 100],
    [-0.5, 0.35, 55],
    [-0.54, 0.31, 10],
  ];
  fingers.forEach(([x, z, yaw]) => box(W, [x, FL + 0.008, z], [0.04, 0.014, 0.012], "#cbc2a2", [0, yaw, 0]));

  // ---------------------------------------------------------------------------------------------------------------
  // Rubble

  const blocked = (x: number, z: number) =>
    z < -0.74 ||
    x < -1.2 ||
    x > 1.2 ||
    z > 0.95 ||
    (x > -1.02 && x < -0.22 && z > -0.58 && z < 0.2) ||
    Math.hypot(x - 1.02, z + 0.45) < 0.34 ||
    Math.hypot(x - 0.5, z + 0.55) < 0.34 ||
    (x > 0.3 && x < 1.12 && z > -0.26 && z < 0.34) ||
    Math.hypot(x + 0.05, z + 0.55) < 0.24 ||
    (x > -0.5 && x < 0.5 && z > 0.12 && z < 0.9) ||
    (x > -1.25 && x < -0.5 && z > 0.22 && z < 0.95) ||
    Math.hypot(x - 1.0, z - 0.72) < 0.36 ||
    (x > 0.42 && x < 0.98 && z > 0.3 && z < 0.62) ||
    (x > -0.05 && x < 0.45 && z > -0.1 && z < 0.2);
  const rr = rng(11);
  const rocks = ["#4c5068", "#5f647c", "#383b4d"];
  let placed = 0;
  for (let tries = 0; tries < 200 && placed < 18; tries++) {
    const x = (rr() * 2 - 1) * 1.2;
    const z = -0.74 + rr() * 1.69;
    const sx = 0.025 + 0.04 * rr();
    const sy = 0.02 + 0.025 * rr();
    const sz = 0.025 + 0.04 * rr();
    if (blocked(x, z)) continue;
    box(W, [x, FL + sy / 2 - 0.003, z], [sx, sy, sz], rocks[placed % 3]);
    placed++;
  }

  // open the chest lid about its hinge: the front edge swings up and back
  b.pose(lid, { axis: [1, 0, 0], deg: -100 });

  return b.root;
}
