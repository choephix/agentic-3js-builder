// Koala gripping a eucalyptus branch stand, in pixel art. A grey koala sits on a stout branch of a gum tree that
// stands on a log-slice base with a little name plate. Its arms reach up to two forked branches and wrap their
// fingers round them; its hind toes curl round the seat branch. Hard square texels everywhere: one 1.6 cm cell for
// fur, bark and wood, finer cells for small parts, pixel-drawn cards for fur tufts, leaves, blossom and grass.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { catmull, polyline } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { cellPaint, pixelArt, pixelTexture, stepped } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Branch Stand",
  description:
    "A pixel-art koala sitting on a gum-tree branch on a log-slice stand, arms wrapped round a forked branch, toes curled round its seat, a gum leaf in its mouth.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.016;
const FINE = 0.009;

// ---------------------------------------------------------------------------------------------------------------
// Palette (ramps run dark to light)

const FURG = ["#3f3e47", "#5b5963", "#7a7882", "#9b99a2", "#bab8c0", "#d5d3d8"];
const CREAM = ["#a99d88", "#c6bba5", "#ddd4c0", "#efe9da", "#fbf7ec"];
const PAW = ["#1e1d24", "#2d2c35", "#41404b", "#575562"];
const NOSE = ["#08070b", "#15141a", "#272630", "#45444f"];
const BARK = ["#5e5a4e", "#7d7967", "#9d9884", "#bdb69d", "#d9cfb2", "#ebe3c8"];
const PEACH = ["#a5684a", "#bc805a", "#d09a72", "#e2b78f"];
const BARKDARK = "#3d372d";
const WOOD = ["#4f301d", "#6a4228", "#85562f", "#a57341", "#c49660", "#dcb77d"];
const MOSS = ["#26401a", "#38591c", "#4f7a26", "#6f9d35", "#98c24a", "#c0dd70"];
const TWIG = "#7b5a42";
const CLAW = "#d8cfbe";
const PLATE_BASE = "#4a2f1d";
const PLATE_GOLD = "#d6a64a";
const PLATE_TEXT = "#f7e7b4";
const NUT = "#8a6a44";
const NUTLID = "#5d452c";
const STONE = "#8d8a86";
const STONE2 = "#6b6965";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const furColour = (c: { at: THREE.Vector3; n: THREE.Vector3; random: (s?: number) => number }, seed: number, bias = 0) => {
  const fuzz = noise(c.at, 0.09, seed) - 0.5;
  const v = 0.5 + bias + 0.26 * c.n.y + 0.1 * c.n.z + 0.5 * fuzz;
  return v;
};

const BODY = cellPaint(
  TEXEL,
  (c) => {
    const a = c.at;
    const rag = noise(a, 0.05, 3) - 0.5;
    const onChest = c.n.z > 0.22 + 0.2 * rag && a.y > 0.4 && a.y < 0.72 && Math.abs(a.x) < 0.11 + 0.035 * rag;
    if (onChest) return c.pick(CREAM, 0.45 + 0.4 * c.n.y + 0.3 * rag + 0.15 * c.n.z);
    // brownish flecks on the rump and back
    if (a.y < 0.5 && c.n.z < 0.1 && c.random(4) < 0.16) return c.pick(FURG, 0.12 + 0.2 * noise(a, 0.06, 8));
    if (c.random(2) < 0.07) return c.pick(FURG, furColour(c, 5) + 0.18);
    return c.pick(FURG, furColour(c, 5, -0.04));
  },
  { dither: true },
);

const HEAD = cellPaint(
  TEXEL,
  (c) => {
    const a = c.at;
    const rag = noise(a, 0.04, 11) - 0.5;
    const cheek = Math.abs(a.x) > 0.05 + 0.02 * rag && a.y < 0.848 + 0.01 * rag && a.z < 0.14;
    if (cheek) return c.pick(CREAM, 0.55 + 0.25 * c.n.y + 0.4 * rag);
    if (a.z > 0.14 && a.y < 0.815) return c.pick(CREAM, 0.5 + 0.2 * c.n.y + 0.3 * rag);
    if (c.random(6) < 0.08) return c.pick(FURG, furColour(c, 7) + 0.2);
    return c.pick(FURG, furColour(c, 7, 0.02));
  },
  { dither: true },
);

const MUZZLE = cellPaint(
  FINE,
  (c) => {
    const rag = noise(c.at, 0.03, 4) - 0.5;
    if (c.random(1) < 0.1) return c.pick(FURG, 0.7);
    return c.pick(CREAM, 0.4 + 0.3 * c.n.y + 0.3 * rag);
  },
  { dither: true },
);

const LIMB = cellPaint(
  TEXEL,
  (c) => {
    if (c.random(2) < 0.08) return c.pick(FURG, furColour(c, 9) + 0.2);
    return c.pick(FURG, furColour(c, 9, -0.1));
  },
  { dither: true },
);

const THIGH = cellPaint(
  TEXEL,
  (c) => {
    const rag = noise(c.at, 0.05, 13) - 0.5;
    if (c.n.z > 0.3 && c.at.y < 0.44 && c.n.y < 0.5) return c.pick(CREAM, 0.4 + 0.3 * c.n.y + 0.4 * rag);
    if (c.random(3) < 0.1) return c.pick(FURG, 0.22 + 0.2 * rag);
    return c.pick(FURG, furColour(c, 9, -0.08));
  },
  { dither: true },
);

const EARBACK = cellPaint(
  FINE,
  (c) => {
    if (c.random(2) < 0.12) return c.pick(FURG, 0.8);
    return c.pick(FURG, furColour(c, 15, -0.02));
  },
  { dither: true },
);

const EARIN = cellPaint(
  FINE,
  (c) => {
    const rag = noise(c.at, 0.02, 17) - 0.5;
    return c.pick(CREAM, 0.62 + 0.3 * c.n.z * 0 + 0.5 * rag + (c.random(3) < 0.18 ? 0.25 : 0));
  },
  { dither: true },
);

const HANDS = cellPaint(
  FINE,
  (c) => {
    if (c.random(1) < 0.12) return c.pick(PAW, 0.9);
    return c.pick(PAW, 0.25 + 0.4 * c.n.y + 0.2 * (noise(c.at, 0.03, 2) - 0.5));
  },
  { dither: true },
);

const NOSEP = cellPaint(
  0.006,
  (c) => c.pick(NOSE, 0.18 + 0.5 * Math.max(0, c.n.y) + 0.35 * Math.max(0, c.n.z - 0.4) + 0.15 * (c.random(1) - 0.5)),
  { dither: true },
);

const barkPaint = (seed: number, cell = TEXEL, warm = 1) =>
  cellPaint(
    cell,
    (c) => {
      const q = new THREE.Vector3(c.at.x, c.at.y * 0.3, c.at.z);
      const n1 = noise(q, 0.17, seed);
      const n2 = noise(q, 0.06, seed + 5);
      const fine = noise(new THREE.Vector3(c.at.x * 5, c.at.y * 0.7, c.at.z * 5), 0.1, seed + 9);
      if (c.random(3) < 0.01) return BARKDARK;
      if (fine > 0.74) return BARKDARK;
      if (n1 > 0.66 && n2 > 0.46) return c.pick(PEACH, 0.2 + 1.2 * (n1 - 0.66) + 0.3 * c.n.y + 0.3 * warm * (n2 - 0.5));
      return c.pick(BARK, 0.14 + 0.62 * n1 + 0.36 * (n2 - 0.5) + 0.2 * c.n.y + 0.1 * (c.random(2) - 0.5));
    },
    { dither: true },
  );

const TRUNK = barkPaint(21);
const BRANCH = barkPaint(31, 0.013);
const FORKBARK = barkPaint(41, 0.012, 1.4);

const MOSSP = cellPaint(
  TEXEL,
  (c) => c.pick(MOSS, 0.2 + 0.55 * noise(c.at, 0.09, 4) + 0.25 * c.n.y + 0.12 * (c.random(1) - 0.5)),
  { dither: true },
);

const STUMP = cellPaint(
  TEXEL,
  (c) => {
    const a = c.at;
    if (c.axis === 1 && c.n.y > 0.5) {
      const r = Math.hypot(a.x - 0.0, a.z - 0.03) + 0.025 * (noise(a, 0.12, 6) - 0.5);
      const ring = r / 0.042;
      const f = ring - Math.floor(ring);
      const crack = Math.abs(a.x - 0.05 * (a.z - 0.03)) < 0.008 && a.z > 0.1;
      if (crack) return WOOD[0];
      if (f < 0.2) return c.pick(WOOD, 0.14 + 0.1 * c.random(2));
      return c.pick(WOOD, 0.5 + 0.28 * Math.sin(ring * 0.9) + 0.18 * (noise(a, 0.07, 3) - 0.5));
    }
    const streak = noise(new THREE.Vector3(a.x * 6, a.y * 0.5, a.z * 6), 0.1, 2);
    if (c.random(5) < 0.015) return WOOD[0];
    return c.pick(WOOD, 0.1 + 0.42 * streak + 0.16 * c.n.y + 0.1 * (c.random(1) - 0.5));
  },
  { dither: true },
);

const capRings = (axisIdx: 0 | 1 | 2, centre: [number, number, number], spacing: number) =>
  cellPaint(
    FINE,
    (c) => {
      const a = c.at;
      const dx = a.x - centre[0];
      const dy = a.y - centre[1];
      const dz = a.z - centre[2];
      const r = axisIdx === 0 ? Math.hypot(dy, dz) : axisIdx === 1 ? Math.hypot(dx, dz) : Math.hypot(dx, dy);
      const ring = r / spacing;
      const f = ring - Math.floor(ring);
      if (r < 0.006) return WOOD[0];
      return f < 0.24 ? WOOD[1] : c.pick(WOOD, 0.55 + 0.25 * Math.sin(ring * 1.4));
    },
    { dither: false },
  );

const CAP = cellPaint(
  0.006,
  (c) => c.pick(["#b0472f", "#cc5a3c", "#e46f48", "#f0916a"], 0.3 + 0.55 * c.n.y + 0.25 * (c.random(1) - 0.5) - (c.random(4) < 0.16 ? -2 : 0)),
  { dither: true },
);
const CAPDOT = cellPaint(
  0.006,
  (c) => (c.random(7) < 0.17 && c.n.y > 0.2 ? "#fbf1dc" : c.pick(["#a43f2b", "#c9553a", "#e46f48", "#f0916a"], 0.25 + 0.6 * c.n.y)),
  { dither: false },
);

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const TUFT = pixelArt(
  ["..w...", "..ww..", ".wwg..", ".wwgg.", "wwwwg.", "wwwwgg", "wwgwgg", "wgggdd"],
  { w: "#ffffff", g: "#d4d4d4", d: "#a2a2a2" },
);

const leafTexture = (fill: string, dark: string, light: string, rib: string) =>
  pixelTexture(10, 24, (g) => {
    for (let y = 0; y < 24; y++) {
      const d = 1 - y / 23; // 0 at the base (bottom row), 1 at the tip
      const hw = 0.5 + 3.2 * Math.pow(Math.sin(Math.PI * Math.pow(d, 0.7)), 0.85);
      const cx = 3.8 + 1.8 * d * d;
      const lo = Math.round(cx - hw);
      const hi = Math.round(cx + hw);
      for (let x = lo; x <= hi; x++) {
        let col = x < Math.round(cx) ? light : fill;
        if (x === Math.round(cx)) col = rib;
        else if (x === hi && hi - lo > 1) col = dark;
        else if (x === lo && hi - lo > 2) col = fill;
        if (y === 0) col = dark;
        g.set(x, y, col);
      }
    }
  });

const LEAF_A = leafTexture("#4e9378", "#2f6858", "#6bb08f", "#c2dccb");
const LEAF_B = leafTexture("#6aa593", "#3f7a6e", "#8cc2ad", "#d4e8dd");
const LEAF_C = leafTexture("#7b9f6a", "#4e7a45", "#9cc283", "#d3e6bd");

const ROUND = pixelArt(
  [
    "..dddd..",
    ".dllllf.",
    "dllllfff",
    "dlllrfff",
    "dllrrffd",
    "dllrfffd",
    ".dffffd.",
    "..dddd..",
  ],
  { d: "#5f8b88", l: "#a3c6c2", f: "#85aca8", r: "#d9ece6" },
);

const BLOSSOM = pixelArt(
  [
    "..p.p.p..",
    ".pppppp..",
    "pppyypppp",
    ".ppyyyppp",
    "pppyypppp",
    ".pppppp..",
    "..p.p.p..",
  ],
  { p: "#ef7f9a", y: "#fbe9b4" },
);

const PEEL = pixelArt(
  ["..cc", ".cco", ".coo", "ccob", "coob", "coo.", "cob.", "cob.", ".oo.", ".ob.", ".ob.", "..b."],
  { c: "#eadfc1", o: "#d2a070", b: "#8a6a4e" },
);

const GRASS = pixelArt(
  ["..g.g..", ".gg.gg.", ".ggdgg.", "gg.dgg.", "gg.dggg", "gdgdgdg", "ddgddgd", "ddddddd"],
  { g: "#7cb339", d: "#43701f" },
);

const EYE = pixelArt(
  [".ggggg.", "gkkkkkg", "gkwkkkg", "gkkkkkg", "gkkkkkg", ".gkkkg.", "..ggg.."],
  { g: "#47454f", k: "#09080c", w: "#ffffff" },
);

const NAMEPLATE = (() => {
  const GLYPH: Record<string, string[]> = {
    K: ["x.x", "x.x", "xx.", "x.x", "x.x"],
    O: ["xxx", "x.x", "x.x", "x.x", "xxx"],
    A: [".x.", "x.x", "xxx", "x.x", "x.x"],
    L: ["x..", "x..", "x..", "x..", "xxx"],
  };
  const text = "KOALA";
  const w = text.length * 4 - 1 + 6;
  return pixelTexture(w, 9, (g) => {
    g.fill(() => PLATE_BASE);
    for (let x = 0; x < w; x++) {
      g.set(x, 0, PLATE_GOLD);
      g.set(x, 8, PLATE_GOLD);
    }
    for (let y = 0; y < 9; y++) {
      g.set(0, y, PLATE_GOLD);
      g.set(w - 1, y, PLATE_GOLD);
    }
    g.set(1, 1, "#f3d58a");
    g.set(w - 2, 1, "#f3d58a");
    g.set(1, 7, "#f3d58a");
    g.set(w - 2, 7, "#f3d58a");
    [...text].forEach((ch, i) =>
      GLYPH[ch].forEach((row, y) =>
        [...row].forEach((px, x) => {
          if (px === "x") g.set(3 + i * 4 + x, 2 + y, PLATE_TEXT);
        }),
      ),
    );
  });
})();

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "koalaSonnet", paintSize: 1024 });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const Y = V(0, 1, 0);
  const lerpN = (k: number[]) => (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (k.length - 1);
    const i = Math.min(Math.floor(x), k.length - 2);
    return k[i] + (k[i + 1] - k[i]) * (x - i);
  };

  // ---- skeleton --------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, -0.05],
      [0, 0.54, -0.05],
      [0, 0.65, 0.0],
      [0, 0.71, 0.04],
    ]),
    { parent: root, role: "spine", names: ["hips", "spine", "chest"] },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.71, 0.04], aim: [0, 0.77, 0.065], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.77, 0.065], aim: [0, 0.8, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.78, 0.08], aim: [0, 0.762, 0.17], role: "jaw" });

  // ---- the stand: base, trunk, seat branch, forks -----------------------------------------------------------
  const R = 11;
  const CELL = 0.04;
  const discSpans: [number, number][] = [];
  for (let i = 0; i < 2 * R; i++) {
    const x = i + 0.5 - R;
    const h = Math.max(1, Math.round(Math.sqrt(R * R - x * x)));
    discSpans.push([-h, h]);
  }
  b.extrude(stepped(discSpans, CELL, { start: -R }), {
    at: [0, 0.06, 0.03],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.12,
    color: STUMP,
    bone: root,
    name: "stump",
  });
  // a low rim of bark chunks round the stump sides, as the log's rough edge
  for (let k = 0; k < 14; k++) {
    const ang = (k / 14) * Math.PI * 2 + 0.2 * rand();
    const px = 0.425 * Math.sin(ang);
    const pz = 0.03 + 0.425 * Math.cos(ang);
    b.part(new THREE.BoxGeometry(0.05 + 0.03 * rand(), 0.09 + 0.02 * rand(), 0.035), STUMP, {
      bone: root,
      at: [px, 0.06, pz],
      dir: [Math.sin(ang), 0, Math.cos(ang)],
      axis: "z",
      name: "rim",
    });
  }

  // mossy mound round the foot of the trunk
  {
    const MC = 0.03;
    const N = 12;
    const centre = { x: 0, z: -0.14 };
    const inside = (px: number, pz: number) => {
      const dx = px - centre.x;
      const dz = pz - centre.z;
      const th = Math.atan2(dz, dx);
      const r = 0.23 + 0.04 * Math.sin(3 * th + 1) + 0.025 * Math.cos(5 * th);
      return Math.hypot(dx * 0.95, dz) < r;
    };
    const spans: [number, number][] = [];
    let first = 0;
    let started = false;
    for (let i = -N; i < N; i++) {
      const rows: number[] = [];
      for (let j = -N; j < N; j++) if (inside((i + 0.5) * MC, (j + 0.5) * MC)) rows.push(j);
      if (!rows.length) continue;
      if (!started) {
        first = i;
        started = true;
      }
      spans.push([Math.min(...rows), Math.max(...rows) + 1]);
    }
    b.extrude(stepped(spans, MC, { start: first }), {
      at: [centre.x, 0.134, centre.z],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.032,
      color: MOSSP,
      bone: root,
      name: "moss",
    });
  }

  const trunkP = catmull([
    [0, 0.12, -0.27],
    [0.01, 0.5, -0.275],
    [-0.01, 0.95, -0.27],
    [0.0, 1.42, -0.25],
  ]);
  const trunk = b.sweep(trunkP, [0.088, 0.044], { bone: root, color: TRUNK, sides: 8, caps: { start: "flat", end: "round" }, name: "trunk" });
  // buttress roots
  for (let k = 0; k < 5; k++) {
    const ang = (k / 5) * Math.PI * 2 + 0.5;
    const o = V(Math.sin(ang), 0, Math.cos(ang));
    b.sweep(
      catmull([
        [o.x * 0.05, 0.3, -0.27 + o.z * 0.05],
        [o.x * 0.1, 0.17, -0.27 + o.z * 0.1],
        [o.x * 0.19, 0.13, -0.27 + o.z * 0.19],
      ]),
      [0.034, 0.016],
      { bone: root, color: TRUNK, sides: 6, name: "root" },
    );
  }
  // knot-hole and scar high on the trunk
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), "#201a14", {
    bone: root,
    at: [0.0, 1.2, -0.215],
    dir: [0, 0, 1],
    scale: [0.8, 1, 1.3],
    name: "knothole",
  });
  b.part(new THREE.TorusGeometry(0.034, 0.008, 4, 8), "#5b4a36", { bone: root, at: [0, 1.2, -0.213], dir: [0, 0, 1], axis: "z", scale: [0.85, 1.35, 1], name: "knotrim" });

  // seat branch
  const seatP = catmull([
    [0, 0.28, -0.27],
    [0, 0.265, -0.06],
    [0, 0.255, 0.15],
    [0, 0.255, 0.3],
  ]);
  const seat = b.sweep(seatP, [0.062, 0.042], { bone: root, color: BRANCH, sides: 8, caps: { start: "none", end: "flat" }, name: "seat" });
  b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.008, 8), capRings(2, [0, 0.255, 0.3], 0.011), {
    bone: root,
    at: [0, 0.255, 0.304],
    dir: [0, 0, 1],
    name: "seatCut",
  });
  // swelling where the branch leaves the trunk
  b.part(new THREE.SphereGeometry(0.085, 8, 6), TRUNK, { bone: root, at: [0, 0.29, -0.2], scale: [0.9, 0.9, 1.1], name: "seatJoin" });

  const forkPath = (s: number) =>
    catmull([
      [0, 0.95, -0.27],
      [s * 0.05, 0.98, -0.12],
      [s * 0.11, 1.0, 0.04],
      [s * 0.15, 1.012, 0.2],
      [s * 0.22, 1.05, 0.38],
      [s * 0.31, 1.1, 0.52],
    ]);
  const forks = new Map<number, ReturnType<typeof forkPath>>();
  for (const s of [1, -1]) {
    const fp = forkPath(s);
    forks.set(s, fp);
    b.sweep(fp, [0.052, 0.022], { bone: root, color: FORKBARK, sides: 6, caps: { start: "none", end: "round" }, name: "fork" });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), TRUNK, { bone: root, at: [s * 0.03, 0.95, -0.25], scale: [1, 0.8, 1.1], name: "forkJoin" });
  }

  // ---- koala body ------------------------------------------------------------------------------------------
  const rx = lerpN([0.15, 0.172, 0.152, 0.108]);
  const ry = lerpN([0.145, 0.158, 0.135, 0.1]);
  const torso = b.sweep(spine, (t) => [rx(t), ry(t)], { color: BODY, sides: 8, name: "torso" });

  // neck, head
  b.capsule([0, 0.69, 0.04], [0, 0.78, 0.07], 0.085, { bone: neck, color: BODY, sides: 8, name: "neck" });
  const HC = V(0, 0.825, 0.085);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), HEAD, {
    bone: head,
    at: HC,
    scale: [0.097, 0.083, 0.09],
    name: "skull",
  });
  // muzzle and the big spoon nose
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE, { bone: head, at: [0, 0.803, 0.148], scale: [0.058, 0.04, 0.046], name: "muzzle" });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSEP, { bone: head, at: [0, 0.829, 0.188], scale: [0.034, 0.021, 0.03], name: "nose" });
  b.part(new THREE.BoxGeometry(0.014, 0.005, 0.012), "#6a6a78", { bone: head, at: [0.008, 0.848, 0.19], name: "noseShine" });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 5, 4), "#000000", { bone: head, at: [s * 0.014, 0.82, 0.215], scale: [0.005, 0.004, 0.003], name: "nostril" });
  // jaw and mouth line
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE, { bone: jaw, at: [0, 0.762, 0.14], scale: [0.042, 0.022, 0.05], name: "jaw" });
  b.part(new THREE.BoxGeometry(0.058, 0.006, 0.05), "#2a1d24", { bone: head, at: [0, 0.776, 0.145], name: "mouth" });
  // eyes on the skull
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 40, 5);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.04, 0.04], segments: 6, lift: 0.0025, name: "eye" });
    // brow ridge
    b.part(new THREE.BoxGeometry(0.045, 0.01, 0.014), "#4a4852", { bone: head, at: [s * 0.058, 0.868, 0.145], rotation: [-8, s * 38, s * -10], name: "brow" });
  }

  // ears
  for (const s of [1, -1]) {
    const name = s > 0 ? "earL" : "earR";
    const E = V(s * 0.125, 0.862, -0.008);
    const n = V(s * 0.5, 0.12, 0.85).normalize();
    const ear = b.joint(name, { parent: head, at: E, dir: n, role: "hinge" });
    b.part(new THREE.CylinderGeometry(1, 1, 1, 12), EARBACK, {
      bone: ear,
      at: E,
      dir: n,
      scale: [0.072, 0.03, 0.068],
      name: "ear",
    });
    b.part(new THREE.CylinderGeometry(1, 1, 1, 10), EARIN, {
      bone: ear,
      at: E.clone().addScaledVector(n, 0.01),
      dir: n,
      scale: [0.05, 0.026, 0.047],
      name: "earInner",
    });
    const ring = b.ring(frame(E.clone().addScaledVector(n, 0.004), n), { count: 14, radius: 0.066 });
    b.cards(ring.items, TUFT, { size: [0.035, 0.045], lean: 40, flow: n, color: "#f4efe2", bone: ear, vary: 0.2, rng: rng(20 + (s > 0 ? 1 : 2)), sink: 0.25 });
  }

  // leaf held in the mouth
  b.cards([frame([0.008, 0.776, 0.19], [0.5, 0.2, 1])], LEAF_A, { size: [0.045, 0.11], lean: 0, bend: 25, bone: jaw, flow: [0, -0.3, -1], sink: 0.2 });

  // ---- arms and hands --------------------------------------------------------------------------------------
  const armBits: { s: number; arm: ReturnType<typeof b.chain>; wrist: Joint }[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fork = forks.get(s)!;
    const tH = fork.closestT([s * 0.15, 1.012, 0.2]);
    const B = fork.at(tH);
    const T = fork.tangentAt(tH).normalize();
    const up = Y.clone().addScaledVector(T, -Y.dot(T)).normalize();
    const out = V(s, 0, 0);
    out.addScaledVector(T, -out.dot(T)).addScaledVector(up, -out.dot(up)).normalize();
    const wristP = B.clone().addScaledVector(up, -0.075).addScaledVector(T, -0.05);
    const arm = b.chain(
      `arm${L}`,
      catmull([[s * 0.165, 0.67, 0.0], [s * 0.235, 0.775, 0.085], wristP]),
      { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" },
    );
    const wrist = arm.tip as Joint;
    armBits.push({ s, arm, wrist });
    b.sweep(arm, lerpN([0.064, 0.054, 0.042]), { color: LIMB, sides: 8, name: "arm" });
    b.part(new THREE.SphereGeometry(0.068, 8, 6), LIMB, { bone: arm.joints[0], at: [s * 0.165, 0.67, 0.0], name: "shoulder" });
    // palm
    const palmEnd = B.clone().addScaledVector(up, -0.05);
    b.capsule(wristP, palmEnd, [0.036, 0.034], { bone: wrist, color: HANDS, sides: 6, name: "palm" });
    const pt = (rho: number, phi: number, a: number, sign: number) => {
      const r = (phi * Math.PI) / 180;
      return B.clone()
        .addScaledVector(out, sign * rho * Math.cos(r))
        .addScaledVector(up, rho * Math.sin(r))
        .addScaledVector(T, a);
    };
    // 3 fingers on the outside, 2 opposable thumbs on the inside
    const spec: [string, number, number, number][] = [
      ["f1", -0.024, 1, 0.011],
      ["f2", -0.002, 1, 0.011],
      ["f3", 0.02, 1, 0.01],
      ["t1", -0.014, -1, 0.012],
      ["t2", 0.012, -1, 0.012],
    ];
    for (const [nm, a, sign, r] of spec) {
      const path = catmull([pt(0.048, -100, a, sign), pt(0.048, -35, a, sign), pt(0.048, 25, a, sign), pt(0.045, 75, a, sign)]);
      const d = b.chain(`${nm}${L}`, path, { parent: wrist, role: "digit", names: [`${nm}${L}a`, `${nm}${L}b`, `${nm}${L}c`] });
      b.sweep(d, [r, r * 0.7], { color: HANDS, sides: 6, name: "finger" });
      b.spike(d.at(1), d.at(1), 0.026, 0.0075, { color: CLAW, sides: 5, name: "claw" });
    }
  }

  // ---- legs and feet ---------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ankleP = V(s * 0.05, 0.352, 0.2);
    const leg = b.chain(
      `leg${L}`,
      catmull([[s * 0.115, 0.405, -0.01], [s * 0.205, 0.47, 0.125], ankleP]),
      { parent: spine.joints[0], names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg", contact: [s * 0.05, 0.3, 0.2] },
    );
    const ankle = leg.tip as Joint;
    b.sweep(leg, lerpN([0.088, 0.062, 0.04]), { color: THIGH, sides: 8, name: "leg" });
    b.part(new THREE.SphereGeometry(0.058, 8, 6), THIGH, { bone: leg.joints[1], at: [s * 0.205, 0.47, 0.125], name: "knee" });
    // foot pad
    b.capsule(ankleP, [s * 0.03, 0.326, 0.2], [0.038, 0.032], { bone: ankle, color: HANDS, sides: 6, name: "foot" });
    // toes wrap round the seat branch
    const B = V(0, 0.255, 0.2);
    const rho = 0.058;
    const pt = (phi: number, a: number) => {
      const r = (phi * Math.PI) / 180;
      return V(s * rho * Math.cos(r), B.y + rho * Math.sin(r), B.z + a);
    };
    [-0.036, -0.018, 0, 0.018, 0.036].forEach((a, i) => {
      const toe = b.chain(`toe${L}${i + 1}`, catmull([pt(75, a), pt(15, a), pt(-40, a), pt(-95, a)]), {
        parent: ankle,
        role: "digit",
        names: [`toe${L}${i + 1}a`, `toe${L}${i + 1}b`, `toe${L}${i + 1}c`],
      });
      b.sweep(toe, [i === 0 ? 0.012 : 0.0105, 0.008], { color: HANDS, sides: 6, name: "toe" });
      if (i > 0) b.spike(toe.at(1), toe.at(1), 0.022, 0.007, { color: CLAW, sides: 5, name: "claw" });
    });
  }

  // ---- fur tufts -------------------------------------------------------------------------------------------
  const torsoSkin = b.surface(torso);
  const chestHits = torsoSkin.scatter(70, { rng: rng(31), minDist: 0.04, filter: (h) => h.n.z > 0.3 && h.at.y > 0.42 && Math.abs(h.at.x) < 0.12 });
  b.cards(chestHits, TUFT, { size: [0.042, 0.05], lean: 55, flow: [0, -1, 0.2], color: "#f1ecdd", vary: 0.25, rng: rng(32), spin: 15 });
  const bodyHits = torsoSkin.scatter(150, { rng: rng(33), minDist: 0.04, filter: (h) => h.n.y > -0.4 && !(h.n.z > 0.3 && h.at.y > 0.42 && Math.abs(h.at.x) < 0.11) });
  b.cards(bodyHits, TUFT, { size: [0.042, 0.052], lean: 60, flow: [0, -1, -0.3], color: BODY, vary: 0.25, rng: rng(34), spin: 15 });
  const skullHits = b.surface(skull).scatter(80, { rng: rng(35), minDist: 0.03, filter: (h) => !(h.at.z > 0.12 && h.at.y < 0.85) && h.n.z < 0.7 });
  b.cards(
    skullHits.filter((h) => Math.abs(h.at.x) > 0.05 && h.at.y < 0.85),
    TUFT,
    { size: [0.032, 0.04], lean: 70, flow: [0, -1, -0.5], color: "#eee9dc", vary: 0.25, rng: rng(36) },
  );
  b.cards(
    skullHits.filter((h) => !(Math.abs(h.at.x) > 0.05 && h.at.y < 0.85)),
    TUFT,
    { size: [0.032, 0.04], lean: 65, flow: [0, -0.6, -1], color: HEAD, vary: 0.25, rng: rng(37) },
  );
  // chin ruff
  b.cards(
    [-0.04, -0.02, 0, 0.02, 0.04].map((x) => frame([x, 0.745, 0.12 + 0.01 * (1 - Math.abs(x) * 20)], [0, -0.7, 0.7])),
    TUFT,
    { size: [0.03, 0.036], lean: 30, flow: [0, -1, -0.4], color: "#f2eddf", bone: jaw, rng: rng(38) },
  );
  for (const s of [1, -1]) {
    const limbs: [string, number, string | typeof LIMB][] = [];
    void limbs;
    void s;
  }
  // thigh and arm tufts
  for (const bit of armBits) {
    const hits = b.surface(bit.arm.joints[1]).scatter(26, { rng: rng(40 + (bit.s > 0 ? 0 : 1)), minDist: 0.036, filter: (h) => h.n.y > -0.3 });
    b.cards(hits, TUFT, { size: [0.036, 0.046], lean: 60, flow: [0, -1, -0.3], color: LIMB, vary: 0.25, rng: rng(44), spin: 15 });
  }

  // ---- foliage: twigs, gum leaves, blossom, nuts --------------------------------------------------------------
  type F = ReturnType<typeof frame>;
  const leafFrames: F[] = [];
  const roundFrames: F[] = [];
  const blossomPts: THREE.Vector3[] = [];
  const nutPts: THREE.Vector3[] = [];
  const twig = (from: THREE.Vector3, dir: THREE.Vector3, len: number, droop: number, count: number) => {
    const d = dir.clone().normalize();
    const p = catmull([
      from,
      from.clone().addScaledVector(d, len * 0.5).add(V(0, -droop * 0.15, 0)),
      from.clone().addScaledVector(d, len).add(V(0, -droop, 0)),
    ]);
    b.sweep(p, [0.011, 0.004], { bone: root, color: TWIG, sides: 5, name: "twig" });
    for (let k = 0; k < count; k++) {
      const t = 0.3 + (0.7 * k) / Math.max(1, count - 1);
      const P = p.at(t);
      leafFrames.push(frame(P, [0, 1, 0]));
      if (k % 2 === 0) leafFrames.push(frame(P.clone().add(V(0.012, 0, 0.012)), [0, 1, 0]));
      if (k === 1) roundFrames.push(frame(P.clone().add(V(0, 0.004, 0)), [0, 1, 0]));
    }
    const tip = p.at(1);
    leafFrames.push(frame(tip, [0, 1, 0]), frame(tip.clone().add(V(-0.012, 0, 0.01)), [0, 1, 0]));
    if (rand() < 0.5) blossomPts.push(p.at(0.5).add(V(0, -0.012, 0)));
    nutPts.push(p.at(0.62).add(V(0.01, -0.014, 0)), p.at(0.62).add(V(-0.008, -0.016, 0.008)));
  };
  for (const s of [1, -1]) {
    const fp = forks.get(s)!;
    const spec: [number, number[], number, number, number][] = [
      [0.5, [s * 0.9, 0.25, 0.2], 0.2, 0.06, 6],
      [0.62, [s * 0.5, 0.35, 0.9], 0.24, 0.07, 7],
      [0.78, [s * 0.9, 0.2, 0.5], 0.26, 0.07, 7],
      [0.92, [s * 0.4, 0.25, 0.85], 0.28, 0.08, 8],
      [1.0, [s * 0.9, 0.2, 0.4], 0.24, 0.07, 6],
      [1.0, [-s * 0.2, 0.3, 0.9], 0.22, 0.07, 6],
    ];
    for (const [t, d, len, drop, n] of spec) twig(fp.at(t), V(d[0], d[1], d[2]), len, drop, n);
    // dressed fork: a few bark peels
    b.cards(
      [0.08, 0.2, 0.34, 0.46].map((t) => frame(fp.at(t).add(V(0, 0.028, 0)), [0, 1, 0])),
      PEEL,
      { size: [0.025, 0.07], lean: 70, flow: [s, 0.2, 0.3], bone: root, rng: rng(51), vary: 0.2 },
    );
  }
  // upper trunk and leader twigs
  twig(trunkP.at(0.9), V(1, 0.5, 0.3), 0.22, 0.04, 6);
  twig(trunkP.at(0.8), V(-1, 0.4, 0.4), 0.22, 0.05, 6);
  twig(trunkP.at(0.96), V(-0.7, 0.8, -0.2), 0.2, 0.0, 5);
  twig(trunkP.at(1.0), V(0.3, 1, 0.2), 0.16, 0.0, 5);
  twig(trunkP.at(0.7), V(0.9, 0.2, -0.5), 0.2, 0.06, 5);
  twig(trunkP.at(0.72), V(-0.9, 0.2, -0.6), 0.2, 0.06, 5);

  const flowSpin = (_f: unknown, i: number) => [Math.cos(i * 2.399), 0, Math.sin(i * 2.399)] as [number, number, number];
  b.cards(leafFrames, [LEAF_A, LEAF_A, LEAF_B, LEAF_C], { size: [0.04, 0.1], lean: 160, flow: flowSpin, bend: 18, vary: 0.25, rng: rng(61), spin: 20, bone: root, sink: 0.05 });
  b.cards(roundFrames, ROUND, { size: [0.05, 0.05], lean: 120, flow: flowSpin, bone: root, rng: rng(62), vary: 0.2 });
  b.cards(
    blossomPts.map((p) => frame(p, [0, -1, 0.2])),
    BLOSSOM,
    { size: [0.05, 0.04], lean: 0, flow: [0, 0, 1], cross: true, bone: root, sink: 0.1 },
  );
  b.part(
    mergeGeometries(
      nutPts.map((p) => new THREE.SphereGeometry(0.011, 5, 4).translate(p.x, p.y, p.z)),
    )!,
    NUT,
    { bone: root, at: [0, 0, 0], name: "nuts" },
  );
  b.part(
    mergeGeometries(
      nutPts.map((p) => new THREE.CylinderGeometry(0.0085, 0.0085, 0.004, 5).translate(p.x, p.y - 0.01, p.z)),
    )!,
    NUTLID,
    { bone: root, at: [0, 0, 0], name: "nutlids" },
  );

  // bark peels on the trunk
  {
    const hits = b.surface(trunk).scatter(26, { rng: rng(71), minDist: 0.09, filter: (h) => h.at.y > 0.3 && h.n.z > -0.5 && !(h.at.y > 0.35 && h.at.y < 0.8 && h.n.z > 0.2) });
    b.cards(hits, PEEL, { size: [0.03, 0.08], lean: 55, flow: [0, -1, 0], bone: root, rng: rng(72), vary: 0.25, spin: 25 });
  }

  // ---- the base: plate, mushrooms, stones, grass, fallen leaves ---------------------------------------------------
  {
    const tilt = 35;
    const nrm = V(0, Math.cos((tilt * Math.PI) / 180), Math.sin((tilt * Math.PI) / 180));
    const c = V(0, 0.147, 0.375);
    b.part(new THREE.BoxGeometry(0.25, 0.018, 0.105), PLATE_BASE, { bone: root, at: c, rotation: [tilt, 0, 0], name: "plateBase" });
    b.part(new THREE.PlaneGeometry(0.23, 0.0885), "#ffffff", {
      bone: root,
      at: c.clone().addScaledVector(nrm, 0.0095),
      dir: nrm,
      axis: "z",
      up: [0, 1, 0],
      texture: NAMEPLATE,
      name: "plate",
    });
    // plate screws
    for (const sx of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 6), "#e8c978", {
        bone: root,
        at: c.clone().addScaledVector(nrm, 0.011).add(V(sx * 0.12, 0, 0)),
        dir: nrm,
        name: "screw",
      });
  }
  // mushrooms by the roots
  const mush: [number, number, number, number][] = [
    [0.17, 0.15, -0.24, 1],
    [0.21, 0.15, -0.17, 0.7],
    [-0.19, 0.15, -0.3, 0.85],
  ];
  for (const [x, y, z, sc] of mush) {
    b.part(new THREE.CylinderGeometry(0.01 * sc, 0.013 * sc, 0.05 * sc, 6), "#efe6cf", { bone: root, at: [x, y + 0.02 * sc, z], name: "stem" });
    b.part(new THREE.SphereGeometry(0.03 * sc, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), sc > 0.8 ? CAP : CAPDOT, {
      bone: root,
      at: [x, y + 0.042 * sc, z],
      name: "cap",
    });
  }
  // stones
  const stones: [number, number, number, number, number][] = [
    [-0.3, 0.12, 0.2, 0.05, 0.03],
    [-0.35, 0.12, 0.1, 0.035, 0.025],
    [0.33, 0.12, 0.12, 0.045, 0.03],
    [0.28, 0.12, -0.2, 0.03, 0.02],
  ];
  stones.forEach(([x, y, z, w, h], i) => {
    b.part(new THREE.BoxGeometry(w * 1.6, h * 1.4, w * 1.3), i % 2 ? STONE : STONE2, { bone: root, at: [x, y + h * 0.55, z], rotation: [0, 25 * i + 10, 0], name: "stone" });
  });
  // grass tufts and fallen leaves on the stump top
  const grassPts: F[] = [];
  for (let k = 0; k < 26; k++) {
    const ang = rand() * Math.PI * 2;
    const rr = 0.22 + 0.2 * rand();
    const gx = rr * Math.sin(ang) * 0.9;
    const gz = 0.03 + rr * Math.cos(ang) * 0.9;
    if (Math.hypot(gx, gz + 0.02) < 0.34 || gz > 0.3) continue;
    grassPts.push(frame([gx, 0.118, gz], [0, 1, 0]));
  }
  for (let k = 0; k < 10; k++) grassPts.push(frame([0.26 * Math.sin(k * 0.63), 0.15, -0.14 + 0.2 * Math.cos(k * 0.63)], [0, 1, 0]));
  b.cards(grassPts, GRASS, { size: [0.05, 0.06], vary: 0.3, rng: rng(81), cross: true, bone: root, sink: 0.05 });
  const fallen: F[] = [];
  for (let k = 0; k < 7; k++) {
    const ang = rand() * Math.PI * 2;
    const rr = 0.16 + 0.22 * rand();
    const fx = rr * Math.sin(ang);
    const fz = 0.03 + rr * Math.cos(ang);
    if (fz < -0.05 || fz > 0.28 || Math.hypot(fx, fz - 0.03) < 0.15) continue;
    fallen.push(frame([fx, 0.1215, fz], [0, 1, 0]));
  }
  b.cards(fallen, [LEAF_A, LEAF_B, LEAF_C], { size: [0.035, 0.1], lean: 90, flow: flowSpin, mirror: true, bone: root, rng: rng(83), vary: 0.2 });

  // a ladybird on the trunk: the little story detail
  b.part(new THREE.SphereGeometry(0.012, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#d92f2a", { bone: root, at: [-0.04, 1.1, -0.2], dir: [0, 0.3, 1], name: "ladybird" });
  b.part(new THREE.SphereGeometry(0.0055, 5, 4), "#0a0a0a", { bone: root, at: [-0.04, 1.1, -0.188], name: "ladybirdHead" });
  void seat;

  return b.root;
}
