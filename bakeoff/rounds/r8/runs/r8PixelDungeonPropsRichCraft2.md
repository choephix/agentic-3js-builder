```ts
import * as THREE from "three";
import { createBuilder, frame, rng, paint } from "agentic-3js-builder";
import { pixelArt, pixelTexture, tileBox, pick, bayer, cellPaint } from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon vignette on a flagstone slab: an open treasure chest spilling glowing gold, two skull-trophy brazier torches, three barrels (one with glowing slime), a bone-strewn skeleton, and an armed spike trap with a warning glyph.",
};

const D = Math.PI / 180;
type V3 = [number, number, number];
const WHITE = "#ffffff";

const hsh = (x: number, y: number, s = 0) => {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ------------------------------------------------------------------ palettes
const WOOD = ["#24130a", "#46250f", "#683b19", "#8a5628", "#a97238"];
const IRONR = ["#15161d", "#2a2d3a", "#454a5e", "#6b7189", "#9aa1bd"];
const STONER = ["#1d1b24", "#33313f", "#4a4858", "#625f72", "#7d7a8c"];
const GOLDR = ["#6b4410", "#a8701a", "#e0a626", "#ffd34a", "#fff0a0"];
const BONER = ["#8a7a5e", "#b9a984", "#d8caa6", "#efe6cc"];
const BONE = "#e0d4b4";
const STEEL = "#b4bdd2";
const BLOOD = "#a3151b";

// ------------------------------------------------------------------ placement rigs
const qe = (pitch: number, yaw: number, roll: number) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * D, yaw * D, roll * D, "YXZ"));

class Rig {
  constructor(
    readonly o: THREE.Vector3,
    readonly q: THREE.Quaternion,
  ) {}
  p(l: V3): V3 {
    const v = new THREE.Vector3(l[0], l[1], l[2]).applyQuaternion(this.q).add(this.o);
    return [v.x, v.y, v.z];
  }
  sub(l: V3, yaw = 0, pitch = 0, roll = 0): Rig {
    const w = this.p(l);
    return new Rig(new THREE.Vector3(w[0], w[1], w[2]), this.q.clone().multiply(qe(pitch, yaw, roll)));
  }
}
const rig = (x: number, y: number, z: number, yaw = 0, pitch = 0, roll = 0) =>
  new Rig(new THREE.Vector3(x, y, z), qe(pitch, yaw, roll));

export default function build() {
  const b = createBuilder({ name: "dungeon_props" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const FY = 0.12;
  let sd = 500;
  const nsd = () => sd++;

  // ================================================================== textures
  const PLANKS = pixelTexture(64, 30, (g) => {
    for (let row = 0; row < 5; row++) {
      const j1 = 8 + Math.floor(hsh(row, 1, 2) * 48);
      const base = 0.32 + 0.4 * hsh(row, 0, 1);
      g.fill(
        (x, y) => {
          if (y === 0) return WOOD[0];
          if (y === 1) return WOOD[3];
          if (x === j1) return WOOD[0];
          const seg = x < j1 ? 0 : 1;
          const t =
            base +
            0.25 * (hsh(row, seg, 3) - 0.5) +
            0.22 * (hsh(x >> 3, row * 6 + y, 4) - 0.5) +
            (y === 5 ? -0.15 : 0);
          return pick(WOOD, t, bayer(x, y));
        },
        [0, row * 6, 64, 6],
      );
      for (const nx of [2, 61]) {
        g.set(nx, row * 6 + 3, IRONR[4]);
        g.set(nx + 1, row * 6 + 3, IRONR[0]);
      }
    }
  });

  const POST = pixelTexture(16, 64, (g) => {
    g.fill((x, y) => {
      if (x === 0 || x === 8) return WOOD[0];
      const t = 0.42 + 0.3 * (hsh(x, 0, 3) - 0.5) + 0.2 * (hsh(x, y >> 3, 2) - 0.5) + (x % 8 === 1 ? 0.12 : 0);
      return pick(WOOD, t, bayer(x, y));
    });
    g.set(4, 20, WOOD[0]);
    g.set(5, 20, WOOD[0]);
    g.set(4, 21, WOOD[1]);
    g.set(12, 44, WOOD[0]);
    g.set(12, 45, WOOD[1]);
  });

  const IRON = pixelTexture(16, 16, (g) => {
    g.fill((x, y) =>
      pick(
        IRONR,
        0.4 + 0.25 * (hsh(x, y, 3) - 0.5) + (y < 2 ? 0.2 : 0) - (y > 13 ? 0.2 : 0) + (x < 1 ? 0.1 : 0),
        bayer(x, y),
      ),
    );
    for (const [rx, ry] of [
      [3, 3],
      [11, 3],
      [3, 11],
      [11, 11],
    ]) {
      g.set(rx, ry, IRONR[4]);
      g.set(rx + 1, ry + 1, IRONR[0]);
    }
  });

  const STONE = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      let t = 0.45 + 0.35 * (hsh(x >> 1, y >> 1, 1) - 0.5) + 0.25 * (hsh(x >> 3, y >> 3, 2) - 0.5);
      if (y < 2 || x < 2) t += 0.22;
      if (y > 29 || x > 29) t -= 0.25;
      return pick(STONER, t, bayer(x, y));
    });
    let cx = 9;
    for (let i = 0; i < 16; i++) {
      g.set(cx, 4 + i, STONER[0]);
      if (hsh(i, 0, 5) < 0.5) cx++;
    }
    for (let x = 0; x < 32; x++)
      for (let y = 0; y < 5; y++)
        if (hsh(x >> 1, y, 9) > 0.8 - y * 0.05 && hsh(x >> 3, 0, 4) > 0.55) g.set(x, y + 2, hsh(x, y, 6) < 0.5 ? "#2f5a20" : "#4a7a2a");
  });

  const GOLD = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const row = y >> 2;
      const off = (row & 1) * 2;
      const cx = (x + off) >> 2;
      const lx = (x + off) & 3;
      const ly = y & 3;
      if (lx === 0 || ly === 3) return GOLDR[0];
      if (lx === 1 && ly === 0) return GOLDR[4];
      return pick(GOLDR, 0.45 + 0.4 * hsh(cx, row, 7), bayer(x, y));
    });
  });

  const BONETEX = pixelTexture(8, 8, (g) => {
    g.fill((x, y) => pick(BONER, 0.6 + 0.3 * (hsh(x, y, 8) - 0.5) + (y < 2 ? 0.15 : 0) - (y > 5 ? 0.2 : 0), bayer(x, y)));
  });

  const SKULLFACE = pixelArt(
    [
      "..bbbbbbbb..",
      ".bbbbbbbbbb.",
      "bbbbbbbbbbbs",
      "bbkkkbbkkkbs",
      "bkkkkbbkkkks",
      "bkkkkbbkkkks",
      "bskkbbbbkksb",
      "bbbbbkkbbbbb",
      ".bbbbkkbbbbs",
      "..bsbbbbsb..",
    ],
    { b: "#e6dabb", s: "#b7a784", k: "#1b1410" },
  );
  const TEETH = pixelArt(["bbbbbbbb", "bwkwwkwb", "bwkwwkwb"], { b: "#cbbf9c", w: "#f6f0dc", k: "#1b1410" });

  const FLAME = pixelArt(
    [
      ".....rr.....",
      ".....rr.....",
      "....rorr....",
      "....roor....",
      "...rooor.r..",
      "..rrooyor.r.",
      "..rooyyoor..",
      ".rooyyyyoor.",
      ".rooyyyyyor.",
      ".roooyyyyor.",
      ".rooyywyyor.",
      ".rooyywyyor.",
      "..rooyyyor..",
      "..rrooyoorr.",
      "...rrooorr..",
      "....rrrrr...",
    ],
    { r: "#e0341c", o: "#ff8a1c", y: "#ffd23a", w: "#fff4b0" },
  );

  const KEYHOLE = pixelArt(
    ["gggggggg", "ghhhhhhg", "ghhkkhhg", "ghkkkkhg", "ghhkkhhg", "ghhkkhhg", "ghhhhhhg", "gggggggg"],
    { g: "#f0c24a", h: "#9a6a14", k: "#120c08" },
  );

  const SLIME = pixelTexture(16, 16, (g) => {
    const GR = ["#1d5a1a", "#2f8a22", "#58c83a", "#a6f26a"];
    g.fill((x, y) => pick(GR, 0.4 + 0.45 * (hsh(x >> 1, y >> 1, 3) - 0.3), bayer(x, y)));
    for (const [x, y] of [
      [3, 4],
      [10, 9],
      [6, 12],
    ]) {
      g.set(x, y, "#d8ffb0");
      g.set(x + 1, y, "#8be05a");
    }
  });

  const COALS = pixelTexture(8, 8, (g) => {
    const C = ["#2a0e08", "#6b1a0c", "#d4380f", "#ff8a1c", "#ffd23a"];
    g.fill((x, y) => pick(C, 0.15 + 0.7 * hsh(x, y, 4), bayer(x, y)));
  });

  const TRAPPLATE = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      let t = 0.35 + 0.25 * (hsh(x, y, 5) - 0.5);
      if (x < 1 || y < 1) t += 0.25;
      if (x > 30 || y > 30) t -= 0.2;
      return pick(IRONR, t, bayer(x, y));
    });
    for (const cx of [4, 12, 20, 28])
      for (const cy of [4, 12, 20, 28])
        for (let dx = -2; dx <= 2; dx++)
          for (let dy = -2; dy <= 2; dy++) {
            const edge = Math.abs(dx) === 2 || Math.abs(dy) === 2;
            g.set(cx + dx, cy + dy, edge ? (dx < 0 || dy < 0 ? IRONR[3] : IRONR[0]) : "#07070a");
          }
    for (let i = 0; i < 12; i++) g.set(8 + (i % 5), 18 + (i >> 2), "#5a1010");
  });

  const GLYPH = pixelTexture(16, 16, (g) => {
    const R = "#b3261e";
    for (let i = 0; i < 16; i++) {
      g.set(i, i, R);
      g.set(Math.min(i + 1, 15), i, R);
      g.set(15 - i, i, R);
      g.set(Math.max(14 - i, 0), i, R);
    }
    g.fill(() => R, [4, 2, 8, 8]);
    g.fill(() => R, [5, 10, 6, 3]);
    g.set(4, 2, "");
    g.set(11, 2, "");
    for (const [x, y] of [
      [5, 5],
      [6, 5],
      [5, 6],
      [6, 6],
      [9, 5],
      [10, 5],
      [9, 6],
      [10, 6],
      [7, 8],
      [8, 8],
      [6, 11],
      [8, 11],
    ])
      g.set(x, y, "");
  });

  const POISON = pixelArt(
    [
      "kkkkkkkkkkkk",
      "kggggggggggk",
      "kggwwwwwwggk",
      "kgwwwwwwwwgk",
      "kgwkkwwkkwgk",
      "kgwkkwwkkwgk",
      "kgwwwkkwwwgk",
      "kggwwwwwwggk",
      "kggwkwkwkggk",
      "kggggggggggk",
      "kggggggggggk",
      "kkkkkkkkkkkk",
    ],
    { k: "#12240c", g: "#4e9a34", w: "#e8f0d0" },
  );

  const BRAND = pixelTexture(10, 10, (g) => {
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++) {
        const d = Math.hypot(x - 4.5, y - 4.5);
        if ((d > 3.3 && d < 4.7) || (d < 3.5 && (x === y || x + y === 9))) g.set(x, y, "#a3261e");
      }
  });

  const SPARKLE = pixelArt([".y.", "yWy", ".y."], { y: "#ffe27a", W: "#ffffff" });

  // ================================================================== paints
  const IRONP = cellPaint(0.02, (c) => c.pick(IRONR, 0.25 + 0.3 * c.random(2) + 0.2 * Math.max(0, c.n.y)), {
    dither: true,
  });

  const barrelPaint = (seed: number, ctr?: THREE.Vector3) =>
    paint((p, n, s) => {
      const h = s[0];
      if (h > 0.795 || h < 0.005 || (ctr && Math.abs(n.y) > 0.9)) {
        const u = (p.x + p.z * 0.8 + p.y * 0.6) / 0.05;
        const k = Math.floor(u);
        if (u - k < 0.1) return WOOD[0];
        return pick(WOOD, 0.3 + 0.25 * hsh(k, seed, 1), bayer(Math.floor(p.x / 0.02), Math.floor(p.z / 0.02)));
      }
      if (ctr && h > 0.58 && Math.hypot(p.x - ctr.x, p.z - ctr.z) < 0.27)
        return pick(WOOD, 0.08 + 0.2 * hsh(Math.floor(h / 0.03), seed, 2), 0.5);
      const deg = ((s[1] % 360) + 360) % 360;
      const st = Math.floor(deg / 45);
      const within = deg / 45 - st;
      if (within < 0.06 || within > 0.94) return WOOD[0];
      const q = Math.floor(h / 0.03);
      const t = 0.38 + 0.3 * hsh(st, seed, 5) + 0.14 * (hsh(q, st + seed * 3, 6) - 0.5);
      return pick(WOOD, t, bayer(st * 3, q));
    });

  // ================================================================== helpers
  function tb(
    R: Rig,
    size: V3,
    tex: THREE.Texture,
    texel: number,
    local: V3,
    o: { tint?: string; seed?: number; step?: number | [number, number]; q?: THREE.Quaternion } = {},
  ) {
    const geo = tileBox(size, tex, texel, {
      ...(o.seed !== undefined ? { rand: rng(o.seed) } : {}),
      ...(o.step !== undefined ? { step: o.step } : {}),
    });
    return b.part(geo, o.tint ?? WHITE, {
      at: R.p(local),
      quat: o.q ? R.q.clone().multiply(o.q) : R.q,
      bone: root,
      texture: tex,
    });
  }
  function gp(
    R: Rig,
    geo: THREE.BufferGeometry,
    color: string,
    local: V3,
    o: { q?: THREE.Quaternion; scale?: V3; tex?: THREE.Texture; flat?: boolean } = {},
  ) {
    return b.part(geo, color, {
      at: R.p(local),
      quat: o.q ? R.q.clone().multiply(o.q) : R.q,
      bone: root,
      ...(o.scale ? { scale: o.scale } : {}),
      ...(o.tex ? { texture: o.tex } : {}),
      ...(o.flat ? { flat: true } : {}),
    });
  }
  const cb = (R: Rig, size: V3, color: string, local: V3, q?: THREE.Quaternion) =>
    gp(R, new THREE.BoxGeometry(size[0], size[1], size[2]), color, local, { q });

  function skull(R: Rig, s: number, eye?: string) {
    tb(R, [0.17 * s, 0.15 * s, 0.17 * s], BONETEX, 0.012 * s, [0, 0.105 * s, 0]);
    gp(R, new THREE.PlaneGeometry(0.17 * s, 0.142 * s), WHITE, [0, 0.105 * s, 0.0865 * s], { tex: SKULLFACE });
    tb(R, [0.12 * s, 0.05 * s, 0.12 * s], BONETEX, 0.012 * s, [0, 0.02 * s, -0.01 * s]);
    gp(R, new THREE.PlaneGeometry(0.12 * s, 0.045 * s), WHITE, [0, 0.025 * s, 0.0515 * s], { tex: TEETH });
    if (eye)
      for (const sx of [1, -1])
        glow(cb(R, [0.022 * s, 0.022 * s, 0.006 * s], eye, [sx * 0.042 * s, 0.112 * s, 0.0895 * s]), 1.4);
  }

  function longBone(R: Rig, local: V3, len: number, yaw = 0) {
    const S = R.sub(local, yaw);
    tb(S, [0.03, 0.026, len], BONETEX, 0.01, [0, 0, 0]);
    for (const e of [1, -1])
      for (const sx of [1, -1]) cb(S, [0.028, 0.032, 0.034], BONE, [sx * 0.014, 0.003, (e * len) / 2]);
  }

  // ================================================================== floor
  cb(rig(0, 0, 0), [3.2, 0.08, 2.6], "#0e0d14", [0, 0.04, 0]);
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 4; j++)
      tb(rig(-1.28 + i * 0.64, 0, -0.975 + j * 0.65), [0.62, FY, 0.63], STONE, 0.02, [0, FY / 2, 0], {
        seed: 100 + i * 7 + j,
      });
  for (const [x, z, yaw, w] of [
    [-1.45, 1.15, 20, 0.09],
    [1.5, 1.05, 70, 0.07],
    [-0.15, 1.18, 40, 0.06],
    [1.55, -0.2, 10, 0.08],
    [-0.1, 0.1, 55, 0.05],
    [-1.5, -1.1, 30, 0.1],
    [0.95, -1.15, 80, 0.06],
  ] as [number, number, number, number][])
    tb(rig(x, FY, z, yaw), [w, w * 0.6, w * 0.75], STONE, 0.01, [0, (w * 0.6) / 2, 0], { seed: nsd() });

  // ================================================================== treasure chest
  const CX = -0.35,
    CZ = -0.45,
    CW = 0.95,
    CD = 0.6,
    WT = 0.06,
    OPEN = 42;
  const C = rig(CX, FY, CZ);
  tb(C, [CW + 0.04, 0.04, CD + 0.04], IRON, 0.015, [0, 0.02, 0], { seed: nsd() });
  tb(C, [CW, 0.32, WT], PLANKS, 0.02, [0, 0.2, CD / 2 - WT / 2], { seed: nsd(), step: [1, 6] });
  tb(C, [CW, 0.32, WT], PLANKS, 0.02, [0, 0.2, -CD / 2 + WT / 2], { seed: nsd(), step: [1, 6] });
  tb(C, [WT, 0.32, CD - 2 * WT], PLANKS, 0.02, [CW / 2 - WT / 2, 0.2, 0], { seed: nsd(), step: [1, 6] });
  tb(C, [WT, 0.32, CD - 2 * WT], PLANKS, 0.02, [-CW / 2 + WT / 2, 0.2, 0], { seed: nsd(), step: [1, 6] });
  tb(C, [CW - 2 * WT, 0.03, CD - 2 * WT], PLANKS, 0.02, [0, 0.055, 0], { seed: nsd() });
  cb(C, [CW - 2 * WT - 0.004, 0.012, CD - 2 * WT - 0.004], "#7a1e2c", [0, 0.076, 0]);

  // gold heap
  const heap = [
    tb(C, [0.76, 0.12, 0.42], GOLD, 0.012, [0, 0.142, 0], { seed: nsd() }),
    tb(C, [0.56, 0.09, 0.3], GOLD, 0.012, [0.05, 0.247, 0], { seed: nsd() }),
    tb(C, [0.34, 0.09, 0.2], GOLD, 0.012, [-0.04, 0.33, 0.02], { seed: nsd() }),
  ];
  for (const h of heap) glow(h, 0.7);
  const gems: [V3, string, V3][] = [
    [[-0.06, 0.4, 0.04], "#e0243a", [30, 45, 20]],
    [[0.2, 0.31, 0.06], "#2c8cff", [20, 30, 40]],
    [[-0.22, 0.3, -0.05], "#2fd36a", [40, 20, 10]],
    [[0.1, 0.395, -0.03], "#e8e0ff", [10, 50, 30]],
  ];
  for (const [l, col, r] of gems) glow(cb(C, [0.04, 0.04, 0.04], col, l, qe(r[0], r[1], r[2])), 1.6);
  for (const [l, r] of [
    [[0.12, 0.385, 0.05], [70, 0, 20]],
    [[-0.12, 0.292, 0.12], [20, 0, 80]],
    [[0.28, 0.296, -0.06], [60, 30, 0]],
    [[0.0, 0.42, 0.01], [10, 0, 60]],
  ] as [V3, V3][])
    glow(gp(C, new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", l, { q: qe(r[0], r[1], r[2]) }), 0.8);

  // straps, corners, lock, handles
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      tb(C, [0.09, 0.34, 0.02], IRON, 0.015, [sx * 0.3, 0.2, sz * 0.31], { seed: nsd() });
      for (const y of [0.08, 0.32]) cb(C, [0.018, 0.018, 0.016], STEEL, [sx * 0.3, y, sz * 0.325]);
    }
    for (const sz of [1, -1]) tb(C, [0.06, 0.4, 0.06], IRON, 0.015, [sx * (CW / 2), 0.2, sz * (CD / 2)], { seed: nsd() });
    cb(C, [0.02, 0.06, 0.1], "#2f3345", [sx * (CW / 2 + 0.01), 0.2, 0]);
    gp(C, new THREE.TorusGeometry(0.05, 0.008, 4, 8), "#8a90a8", [sx * (CW / 2 + 0.028), 0.17, 0], {
      q: qe(0, 90, 0),
      flat: true,
    });
  }
  tb(C, [0.14, 0.17, 0.03], IRON, 0.015, [0, 0.24, 0.315], { seed: nsd() });
  cb(C, [0.1, 0.12, 0.024], "#e0a626", [0, 0.24, 0.342]);
  gp(C, new THREE.PlaneGeometry(0.08, 0.1), WHITE, [0, 0.24, 0.3555], { tex: KEYHOLE });

  // lid, open on its hinge
  const L = rig(CX, FY + 0.36, CZ - CD / 2, 0, -OPEN);
  tb(L, [CW, 0.12, CD], PLANKS, 0.02, [0, 0.06, CD / 2], { seed: nsd(), step: [1, 6] });
  tb(L, [CW, 0.07, 0.38], PLANKS, 0.02, [0, 0.155, CD / 2], { seed: nsd(), step: [1, 6] });
  for (const sx of [1, -1]) {
    tb(L, [0.09, 0.125, CD + 0.02], IRON, 0.015, [sx * 0.3, 0.0625, CD / 2], { seed: nsd() });
    tb(L, [0.09, 0.08, 0.4], IRON, 0.015, [sx * 0.3, 0.158, CD / 2], { seed: nsd() });
    for (const z of [0.2, 0.4]) cb(L, [0.018, 0.012, 0.018], STEEL, [sx * 0.3, 0.2, z]);
  }
  tb(L, [CW + 0.02, 0.05, 0.03], IRON, 0.015, [0, 0.025, CD + 0.005], { seed: nsd() });
  cb(L, [0.07, 0.1, 0.02], "#e0a626", [0, 0.05, CD + 0.03]);
  const H = rig(CX, FY + 0.36, CZ - CD / 2);
  for (const sx of [1, -1]) gp(H, new THREE.CylinderGeometry(0.022, 0.022, 0.09, 6), "#6b7189", [sx * 0.3, 0.0, -0.01], { q: qe(0, 0, 90) });

  // sparkles above the hoard
  glow(
    b.cards(
      [
        [-0.45, 0.82, -0.3],
        [-0.2, 1.0, -0.4],
        [0.05, 0.78, -0.35],
        [-0.3, 0.68, -0.15],
      ].map((p) => frame(p as V3, [0, 1, 0])),
      SPARKLE,
      { size: 0.1, cross: true, flow: [0, 0, 1], bone: root, sink: 0 },
    ),
    1.6,
  );

  // coins on the floor
  for (const [x, z] of [
    [-0.7, -0.08],
    [-0.52, 0.0],
    [-0.3, -0.04],
    [-0.12, 0.02],
    [0.0, -0.1],
  ])
    glow(gp(rig(x, FY, z), new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", [0, 0.005, 0]), 0.6);
  for (let i = 1; i < 4; i++)
    glow(gp(rig(-0.4, FY, -0.1, i * 25), new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", [0, 0.005 + i * 0.01, 0]), 0.6);

  // ================================================================== torches
  const BOWL: [number, number][] = [
    [0, 0],
    [0.07, 0],
    [0.17, 0.1],
    [0.2, 0.2],
    [0, 0.2],
  ];
  const RIMP: [number, number][] = [
    [0.17, 0.2],
    [0.21, 0.2],
    [0.22, 0.26],
    [0.18, 0.26],
  ];
  function torch(tx: number, tz: number) {
    const R = rig(tx, FY, tz);
    tb(R, [0.42, 0.1, 0.42], STONE, 0.02, [0, 0.05, 0], { seed: nsd() });
    tb(R, [0.3, 0.08, 0.3], STONE, 0.02, [0, 0.14, 0], { seed: nsd() });
    tb(R, [0.14, 1.0, 0.14], POST, 0.0175, [0, 0.68, 0]);
    for (const y of [0.22, 0.62, 1.08]) tb(R, [0.19, 0.06, 0.19], IRON, 0.015, [0, y, 0], { seed: nsd() });
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        b.rod(R.p([sx * 0.095, 1.08, sz * 0.095]), R.p([sx * 0.14, 1.34, sz * 0.14]), 0.012, "#3a3f52", {
          bone: root,
          sides: 4,
        });
    b.lathe(BOWL, { at: R.p([0, 1.2, 0]), segments: 8, color: IRONP, bone: root });
    b.lathe(RIMP, { at: R.p([0, 1.2, 0]), segments: 8, color: IRONP, bone: root });
    glow(gp(R, new THREE.CylinderGeometry(0.17, 0.17, 0.05, 8), WHITE, [0, 1.405, 0], { tex: COALS }), 1.1);
    glow(
      b.cards([frame(R.p([0, 1.43, 0]), [0, 1, 0])], FLAME, {
        size: [0.34, 0.5],
        cross: true,
        flow: [0, 0, 1],
        bone: root,
        sink: 0,
      }),
      1.3,
    );
    glow(
      b.cards([frame(R.p([0.07, 1.43, -0.05]), [0, 1, 0])], FLAME, {
        size: [0.2, 0.32],
        cross: true,
        flow: [0, 0, 1],
        bone: root,
        sink: 0,
        spin: 30,
      }),
      1.3,
    );
    const embers: V3[] = [
      [0.05, 1.98, 0.03],
      [-0.07, 2.05, -0.02],
      [0.02, 2.12, 0.06],
      [-0.03, 1.92, -0.07],
      [0.09, 2.02, -0.05],
    ];
    embers.forEach((e, i) => glow(cb(R, [0.018, 0.018, 0.018], i % 2 ? "#ffb02a" : "#ffe27a", e, qe(20 * i, 30 * i, 10)), 1.6));
    skull(rig(tx, FY + 0.5, tz + 0.09, 0), 0.5, "#ff7a1c");
  }
  torch(-1.25, -0.85);
  torch(1.25, -0.85);

  // ================================================================== barrels
  const BARREL: [number, number][] = [
    [0, 0],
    [0.25, 0],
    [0.3, 0.14],
    [0.32, 0.4],
    [0.3, 0.66],
    [0.25, 0.8],
    [0, 0.8],
  ];
  const BARREL_OPEN: [number, number][] = [
    [0, 0],
    [0.25, 0],
    [0.3, 0.14],
    [0.32, 0.4],
    [0.3, 0.66],
    [0.25, 0.8],
    [0.205, 0.8],
    [0.255, 0.6],
    [0, 0.6],
  ];
  const PR: [number, number][] = [
    [0, 0.25],
    [0.14, 0.3],
    [0.4, 0.32],
    [0.66, 0.3],
    [0.8, 0.25],
  ];
  const barrelR = (y: number) => {
    for (let i = 0; i < PR.length - 1; i++)
      if (y <= PR[i + 1][0]) {
        const t = (y - PR[i][0]) / (PR[i + 1][0] - PR[i][0]);
        return PR[i][1] + t * (PR[i + 1][1] - PR[i][1]);
      }
    return 0.25;
  };
  const HOOPS = [0.1, 0.26, 0.54, 0.7];

  // A: closed, branded, skull on top
  const AX = 0.55,
    AZ = -0.55;
  const barrelA = b.lathe(BARREL, { at: [AX, FY, AZ], segments: 8, color: barrelPaint(1), bone: root });
  for (const y of HOOPS) {
    const r = barrelR(y) * 1.1;
    b.part(new THREE.CylinderGeometry(r, r, 0.05, 8), IRONP, { at: [AX, FY + y, AZ], bone: root });
  }
  b.decal(barrelA, BRAND, { at: [AX, FY + 0.4, AZ + 0.33], dir: [0, 0, 1], size: [0.2, 0.2], segments: 6 });
  skull(rig(AX, FY + 0.8, AZ, 15), 0.9, "#ff3a2a");

  // B: open, glowing slime
  const BX = 1.15,
    BZ = -0.12;
  const bc = new THREE.Vector3(BX, FY, BZ);
  const barrelB = b.lathe(BARREL_OPEN, { at: [BX, FY, BZ], segments: 8, color: barrelPaint(2, bc), bone: root });
  for (const y of HOOPS) {
    const r = barrelR(y) * 1.1;
    b.part(new THREE.CylinderGeometry(r, r, 0.05, 8), IRONP, { at: [BX, FY + y, BZ], bone: root });
  }
  b.decal(barrelB, POISON, { at: [BX, FY + 0.4, BZ + 0.33], dir: [0, 0, 1], size: [0.2, 0.2], segments: 6 });
  glow(b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 8), WHITE, { at: [BX, FY + 0.715, BZ], bone: root, texture: SLIME }), 1.3);
  for (const [dx, dz] of [
    [0.05, 0.03],
    [-0.07, -0.05],
    [0.0, -0.08],
  ])
    glow(b.part(new THREE.BoxGeometry(0.035, 0.035, 0.035), "#a6f26a", { at: [BX + dx, FY + 0.74, BZ + dz], bone: root }), 1.5);

  // C: lying on its side
  const CBX = -1.2,
    CBZ = -0.1,
    CBY = FY + 0.31;
  b.lathe(BARREL, { at: [CBX, CBY, CBZ - 0.4], axis: [0, 0, 1], segments: 8, color: barrelPaint(3), bone: root });
  const CBR = rig(CBX, CBY, CBZ);
  for (const y of HOOPS) {
    const r = barrelR(y) * 1.1;
    b.part(new THREE.CylinderGeometry(r, r, 0.05, 8), IRONP, {
      at: CBR.p([0, 0, y - 0.4]),
      quat: qe(90, 0, 0),
      bone: root,
    });
  }
  for (const sx of [1, -1]) tb(rig(CBX + sx * 0.18, FY, CBZ), [0.06, 0.05, 0.5], POST, 0.0125, [0, 0.025, 0], { seed: nsd() });

  // ================================================================== spike trap
  const T = rig(0.5, FY, 0.55);
  tb(T, [0.8, 0.07, 0.08], STONE, 0.02, [0, 0.035, -0.36], { seed: nsd() });
  tb(T, [0.8, 0.07, 0.08], STONE, 0.02, [0, 0.035, 0.36], { seed: nsd() });
  tb(T, [0.08, 0.07, 0.64], STONE, 0.02, [-0.36, 0.035, 0], { seed: nsd() });
  tb(T, [0.08, 0.07, 0.64], STONE, 0.02, [0.36, 0.035, 0], { seed: nsd() });
  tb(T, [0.64, 0.04, 0.64], TRAPPLATE, 0.02, [0, 0.02, 0]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) tb(T, [0.05, 0.02, 0.05], IRON, 0.015, [sx * 0.37, 0.08, sz * 0.37], { seed: nsd() });
  cb(T, [0.1, 0.002, 0.07], "#6b1414", [-0.12, 0.041, 0.2]);
  cb(T, [0.07, 0.002, 0.12], "#6b1414", [0.2, 0.041, -0.1]);
  const offs = [-0.24, -0.08, 0.08, 0.24];
  const q45 = qe(0, 45, 0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const h = 0.2 + 0.16 * hsh(i, j, 21);
      const x = offs[i],
        z = offs[j];
      cb(T, [0.085, 0.02, 0.085], "#2c2f3d", [x, 0.05, z]);
      gp(T, new THREE.ConeGeometry(0.04, h, 4), STEEL, [x, 0.04 + h / 2, z], { q: q45, flat: true });
      if (hsh(i, j, 22) > 0.62) {
        const f = 0.32;
        gp(T, new THREE.ConeGeometry(0.04 * f * 1.08, h * f, 4), BLOOD, [x, 0.04 + h - (f * h) / 2, z], {
          q: q45,
          flat: true,
        });
      }
    }
  glow(
    b.part(new THREE.PlaneGeometry(0.26, 0.26), WHITE, {
      at: [0.5, FY + 0.003, 1.12],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      bone: root,
      texture: GLYPH,
    }),
    0.7,
  );

  // ================================================================== skeleton
  const S = rig(-0.55, FY, 0.5, 8);
  skull(S.sub([0, 0.05, -0.3], 0, -35), 1.0, "#ff3a2a");
  for (let i = 0; i < 9; i++) cb(S, [0.032, 0.03, 0.04], BONE, [0, 0.015, -0.2 + i * 0.05]);
  const ribZ = [-0.13, -0.08, -0.03, 0.02, 0.07, 0.12];
  const ribR = [0.07, 0.09, 0.1, 0.1, 0.09, 0.075];
  ribZ.forEach((z, i) =>
    gp(S, new THREE.TorusGeometry(ribR[i], 0.009, 4, 7, Math.PI), BONE, [0, 0, z], { scale: [1, 0.7, 1], flat: true }),
  );
  for (const sx of [1, -1]) cb(S, [0.1, 0.016, 0.016], BONE, [sx * 0.055, 0.02, -0.17], qe(0, sx * 20, 0));
  cb(S, [0.15, 0.03, 0.07], BONE, [0, 0.02, 0.26]);
  for (const sx of [1, -1]) cb(S, [0.06, 0.04, 0.08], BONE, [sx * 0.075, 0.02, 0.24], qe(0, 0, sx * 20));
  for (const sx of [1, -1]) {
    const hip = S.sub([sx * 0.07, 0.013, 0.27], sx * 28);
    longBone(hip, [0, 0, 0.11], 0.22);
    const knee = hip.sub([0, 0, 0.22], sx * -40);
    longBone(knee, [0, 0, 0.1], 0.2);
    const sho = S.sub([sx * 0.06, 0.013, -0.17], sx * 70);
    longBone(sho, [0, 0, 0.09], 0.18);
    const elb = sho.sub([0, 0, 0.18], sx * -40);
    longBone(elb, [0, 0, 0.08], 0.16);
    cb(elb, [0.05, 0.014, 0.05], BONE, [0, 0.007, 0.185]);
  }

  // loose bones and a second skull
  longBone(rig(1.45, FY, 0.5, 70), [0, 0.013, 0], 0.3);
  longBone(rig(-1.0, FY, 0.6, -30), [0, 0.013, 0], 0.26);
  longBone(rig(-0.1, FY, 1.05, 100), [0, 0.013, 0], 0.22);
  skull(rig(1.28, FY, 0.75, -150, -10), 0.9);
  for (let i = 0; i < 3; i++)
    gp(rig(-0.95, FY, 0.2, 20), new THREE.TorusGeometry(0.06 - i * 0.008, 0.008, 4, 7, Math.PI), BONE, [0, 0, i * 0.04], {
      scale: [1, 0.7, 1],
      flat: true,
    });

  // ================================================================== unlit hand torch
  const HT = rig(-0.85, FY, 0.95, 30);
  tb(HT, [0.045, 0.045, 0.6], POST, 0.0125, [0, 0.0225, 0], { seed: nsd() });
  cb(HT, [0.075, 0.075, 0.14], "#1e1612", [0, 0.0375, 0.32]);
  cb(HT, [0.082, 0.082, 0.03], "#5a4a32", [0, 0.041, 0.26]);
  cb(HT, [0.082, 0.082, 0.03], "#5a4a32", [0, 0.041, 0.33]);

  return b.root;
}
```