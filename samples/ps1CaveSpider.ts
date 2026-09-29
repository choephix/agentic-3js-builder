// PS1 cave spider: a giant cave spider as a late-90s survival-horror game would have modelled it. Everything is a
// faceted prism: the abdomen is an eight-sided tube, the carapace a six-sided one, every leg segment a five-sided rod
// that ends in a hard point. Detail is painted, not modelled. The coat is a paint that quantises the whole animal into
// 1.8 cm cells, picks colours from a few short ramps and dithers between the steps with a 4x4 Bayer matrix; the skull
// on the abdomen is a 15x16-cell bitmap projected down onto its back, the legs carry ochre rings between the joints.
// The eyes sit on a hand-built tilted block whose top face is one 32x24 texture with a dithered green glow painted
// round each of the eight bulbs. Hair is sprites: 3x12-pixel bristles scattered over legs, abdomen and palps, and
// the webbing is 32x32 alpha-cut cobweb fans hung from the abdomen and knees plus thin three-sided silk strands.
import { BufferGeometry, Float32BufferAttribute, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { paint } from "../src/paint";
import { bezier, polyline } from "../src/path";
import { svg } from "../src/texture";
import type { Joint } from "../src/skeleton";
import type { Hit } from "../src/surface";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "PS1 cave spider",
  description:
    "A giant cave spider in late-90s PlayStation style: faceted prism body, dithered palette coat with a bitmap skull on the abdomen, a tilted eye block with a painted green glow, sprite bristles, alpha-cut cobwebs, egg sacs and eight four-joint legs.",
  builtBy: "Claude Sonnet 5.5",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette. Every ramp is dark to light.

const AUBERGINE = ["#08050c", "#140c1c", "#22142c", "#331f40", "#4a2c58"] as const;
const RUSTY = ["#2a0e08", "#5a1e0e", "#8c3414", "#c05a20"] as const;
const BONE = ["#4a4030", "#7a6c4a", "#b0a072", "#d8cc9a", "#f2ecc6"] as const;
const CARA_R = ["#1c0e0a", "#3c1c12", "#62321a", "#8c4c24", "#b8743a"] as const;
const LEG_R = ["#160e18", "#2c1c30", "#48304e", "#684670"] as const;
const OCHRE = ["#3a2a14", "#6a4e22", "#a07a34", "#d0a850"] as const;
const FANG_R = ["#2a0c10", "#5a1c18", "#8e3a24", "#d8c088", "#f4ecc0"] as const;
const BELLY = ["#2a2018", "#4a3c2c", "#6e5e46", "#948462"] as const;
const SILK = "#d6dce6";
const SPINE = "#150c10";
const EYE = "#c4f52e";
const SPINNER = "#5a3a30";

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
/** Ordered-dither threshold (0..1) at integer cell (i, j). */
const bayer = (i: number, j: number) => (BAYER[((j % 4) + 4) % 4][((i % 4) + 4) % 4] + 0.5) / 16;
/** The ramp step for value v (0..1), dithered between neighbouring steps by threshold t. */
function pick(ramp: readonly string[], v: number, t: number) {
  const x = Math.min(Math.max(v, 0), 1) * (ramp.length - 1);
  const i = Math.min(Math.floor(x), ramp.length - 2);
  return x - i > t ? ramp[i + 1] : ramp[i];
}
const hash = (x: number, y: number, seed = 0) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
/** Piecewise-linear lookup through sorted `[x, y]` keys. */
function interp(keys: readonly (readonly [number, number])[], x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++)
    if (x <= keys[i][0])
      return keys[i - 1][1] + ((keys[i][1] - keys[i - 1][1]) * (x - keys[i - 1][0])) / (keys[i][0] - keys[i - 1][0]);
  return keys[keys.length - 1][1];
}

// ---------------------------------------------------------------------------------------------------------------
// Coat paints, all in 1.8 cm cells so the sheet reads as big square texels on every face.

const CELL = 0.018;

/** The two cell axes of the face `n` points at, and the cell they fall in. */
function cellOf(p: Vector3, n: Vector3) {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const [u, v] = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
  return [Math.floor(u / CELL), Math.floor(v / CELL)] as const;
}

/** The skull on the abdomen's back: # bone, o socket, v nose, t tooth gap. Cranium forward, jaw toward the spinnerets. */
const SKULL = [
  "....#######....",
  "..###########..",
  ".#############.",
  ".#############.",
  "###############",
  "###oooo#oooo###",
  "###oooo#oooo###",
  "###oooo#oooo###",
  ".###ooo#ooo###.",
  ".####oo#oo####.",
  "..#####v#####..",
  "...####v####...",
  "....#######....",
  "...#t#t#t#t#...",
  "...#t#t#t#t#...",
  "...#########...",
];
const SKULL_REAR = -0.65;
const skullCell = (c: number, r: number) => (r < 0 || r >= SKULL.length || c < 0 || c > 14 ? "." : SKULL[r][c]);

const ABDOMEN = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  const t = bayer(iu, iv);
  if (n.y < -0.3) {
    const g = hash(iu, iv, 9);
    return pick(BELLY, 0.5 + 0.35 * (g - 0.5) - 0.1, t);
  }
  if (n.y > 0.3) {
    const c = Math.floor(p.x / CELL + 7.5);
    const r = Math.floor((p.z - SKULL_REAR) / CELL);
    const k = skullCell(c, r);
    if (k !== ".") {
      const shade = 0.62 + (hash(c, r, 5) - 0.5) * 0.3 - (r / SKULL.length) * 0.22;
      if (k === "#") return pick(BONE, shade, bayer(c, r));
      if (k === "o") return r === 7 && (c === 5 || c === 9) ? "#c22a18" : "#07030a";
      if (k === "v") return "#07030a";
      return "#3a2a1c";
    }
    // A dark red outline round the skull so it pops off the coat.
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ])
      if (skullCell(c + dc, r + dr) !== ".") return pick(RUSTY, 0.2, t);
  }
  // Rust chevrons behind the skull, then dithered hair with a few lighter flecks.
  const ax = Math.abs(p.x);
  const chev = ((((p.z + 1.4 * ax) / 0.075) % 1) + 1) % 1;
  const speck = hash(iu, iv, Math.round(n.y * 3 + n.x * 5)) < 0.09 ? 0.22 : 0;
  const q = 0.36 + 0.28 * Math.max(n.y, 0) + (hash(iu, iv, 2) - 0.5) * 0.3 + speck;
  if (p.z < -0.7 && chev < 0.34) return pick(RUSTY, 0.45 + 0.4 * Math.max(n.y, 0) + (hash(iu, iv, 4) - 0.5) * 0.2, t);
  if (p.z > -0.3 && ax > 0.05 && ((iu + iv) & 3) === 0) return pick(RUSTY, 0.35, t);
  return pick(AUBERGINE, q, t);
});

const CARAPACE = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  const t = bayer(iu, iv);
  const ix = Math.floor(p.x / CELL);
  const iz = Math.floor(p.z / CELL);
  const ax = Math.abs(ix + 0.5);
  const top = n.y > 0.3;
  let v = 0.42 + 0.32 * Math.max(n.y, 0) + (hash(iu, iv, 3) - 0.5) * 0.28;
  if (top) {
    // Fovea groove and the two furrows running forward from it to the eyes.
    if (iz >= -4 && iz <= 0 && ax < 1) return pick(CARA_R, 0.05, t);
    if (iz > 0 && iz < 9 && Math.abs(ax - 0.4 - iz * 0.55) < 0.6) return pick(CARA_R, 0.1, t);
    if (iz < 0 && iz > -8 && Math.abs(ax - 1 + iz * 0.5) < 0.6) return pick(CARA_R, 0.1, t);
    if (ax < 2.1) v += 0.16;
  }
  return pick(CARA_R, v, t);
});

/** A leg paint: charcoal hair with ochre rings at the joints (t is source t along the chain, `ts` the joint t's). */
function legPaint(ts: readonly number[]) {
  return paint((p, n, s) => {
    const [iu, iv] = cellOf(p, n);
    const t = bayer(iu, iv);
    const along = s[0];
    let ring = 0;
    for (let k = 1; k < ts.length - 1; k++) ring = Math.max(ring, 1 - Math.abs(along - ts[k]) / 0.045);
    const speck = hash(iu, iv, 12);
    const v =
      0.4 + 0.3 * Math.max(n.y, 0) + (hash(iu, iv, 7) - 0.5) * 0.35 + (speck < 0.12 ? -0.28 : speck > 0.9 ? 0.3 : 0);
    if (along > ts[ts.length - 2] + 0.02) return pick(OCHRE, 0.35 + v * 0.7, t);
    if (ring > 0.3 + t * 0.5) return pick(OCHRE, 0.25 + v * 0.7, t);
    return pick(LEG_R, v, t);
  });
}

/** Chelicera bases: charcoal above, rust toward the fang. */
const CHELICERA = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  const v = 0.35 + 0.3 * Math.max(n.y, 0) + (hash(iu, iv, 8) - 0.5) * 0.3 + Math.max(0, 0.3 - p.y) * 1.3;
  return pick(CARA_R, v, bayer(iu, iv));
});
/** Fangs: dark rust root, ivory tip, dithered between. */
const FANG = paint((_p, n, s) => {
  const t = bayer(Math.round(s[0] * 60), Math.round(s[1] / 18));
  return pick(FANG_R, 0.15 + s[0] * 1.05 + n.y * 0.05, t);
});

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures.

/** A pixel grid ("" = transparent) as an `svg()` drawing: one rect per horizontal run, rasterised 1:1. */
function pixelTexture(w: number, h: number, draw: (g: string[][]) => void) {
  const g = Array.from({ length: h }, () => Array<string>(w).fill(""));
  draw(g);
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = g[y][x];
      let n = 1;
      while (x + n < w && g[y][x + n] === c) n++;
      if (c) rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${c}"/>`);
      x += n;
    }
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}

/** The eight eyes as [x, z, radius] on the block's top face, meters (x across, z forward). */
const EYES: readonly (readonly [number, number, number])[] = [
  [0.028, 0.05, 0.03],
  [-0.028, 0.05, 0.03],
  [0.084, 0.04, 0.019],
  [-0.084, 0.04, 0.019],
  [0.05, -0.02, 0.023],
  [-0.05, -0.02, 0.023],
  [0.095, -0.045, 0.014],
  [-0.095, -0.045, 0.014],
].map(([x, z, r]) => [x * 1.15, z * 1.15, r * 1.2] as const);
const BLOCK = { w: 0.27, l: 0.2 };
const MASK_W = 32;
const MASK_H = 24;

/** The eye block's top face: near-black hide, and a dithered acid-green glow round each eye. */
function eyeMask() {
  return pixelTexture(MASK_W, MASK_H, (g) => {
    for (let y = 0; y < MASK_H; y++)
      for (let x = 0; x < MASK_W; x++) {
        const mx = ((x + 0.5) / MASK_W - 0.5) * BLOCK.w;
        const mz = (0.5 - (y + 0.5) / MASK_H) * BLOCK.l;
        const t = bayer(x, y);
        let glow = 0;
        for (const [ex, ez, er] of EYES) {
          const d = Math.hypot(mx - ex, mz - ez) - er;
          glow = Math.max(glow, 1 - Math.max(d, 0) / 0.026);
        }
        const edge = x < 1 || y < 1 || x > MASK_W - 2 || y > MASK_H - 2;
        const base = pick(["#0a0606", "#160c0c", "#241410"], 0.35 + (hash(x, y, 4) - 0.5) * 0.5, t);
        if (edge) g[y][x] = "#0a0606";
        else if (glow > 0.72) g[y][x] = "#3c7a18";
        else if (glow > 0.4 + t * 0.3) g[y][x] = t > 0.5 ? "#2c5a18" : "#1c3a14";
        else g[y][x] = base;
      }
  });
}

/** A hair sprite: tip, shaft and root colours from the ramp given; three pixels wide at the root. */
function bristle(tip: string, shaft: string, side: string, root: string) {
  return pixelTexture(3, 12, (g) => {
    for (let y = 0; y < 12; y++) {
      g[y][1] = y < 3 ? tip : y < 8 ? shaft : root;
      if (y >= 7) {
        g[y][0] = y > 9 ? root : side;
        g[y][2] = y > 9 ? root : side;
      }
    }
  });
}

/** A cobweb fan: rays from the root at the bottom, three dithered chord rings, a ragged edge. */
function cobweb() {
  const S = 32;
  return pixelTexture(S, S, (g) => {
    const px = (x: number, y: number, c: string) => {
      const xi = Math.round(x);
      const yi = Math.round(y);
      if (xi >= 0 && xi < S && yi >= 0 && yi < S) g[yi][xi] = c;
    };
    const line = (x0: number, y0: number, x1: number, y1: number, c: string) => {
      const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 1.6);
      for (let i = 0; i <= n; i++) px(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
    };
    const rootX = 15.5;
    const rootY = 31;
    const rays = 7;
    const reach = (k: number) => 27 + Math.round(hash(k, 3, 11) * 5) - 2;
    const pts = (r: number) =>
      Array.from({ length: rays }, (_, k) => {
        const a = ((-66 + (132 * k) / (rays - 1)) * Math.PI) / 180;
        const len = Math.min(r, reach(k));
        return [rootX + Math.sin(a) * len, rootY - Math.cos(a) * len] as const;
      });
    const tip = pts(99);
    for (const [x, y] of tip) line(rootX, rootY, x, y, "#eef2f8");
    for (const [ri, r] of [8, 15, 22].entries()) {
      const p = pts(r);
      for (let k = 0; k + 1 < rays; k++) {
        if (hash(k, ri, 21) < 0.22) continue;
        // sag: the chord bows toward the root, like silk under its own weight
        const mx = (p[k][0] + p[k + 1][0]) / 2;
        const my = (p[k][1] + p[k + 1][1]) / 2 + 1.5;
        line(p[k][0], p[k][1], mx, my, ri % 2 ? "#c2cad8" : "#eef2f8");
        line(mx, my, p[k + 1][0], p[k + 1][1], ri % 2 ? "#c2cad8" : "#eef2f8");
      }
    }
    for (let k = 0; k < 9; k++) px(3 + hash(k, 5, 2) * 26, 8 + hash(k, 6, 2) * 14, "#9aa4b6");
  });
}

/** The egg sac: cream parchment, a dithered pebble of eggs under it, and criss-cross silk. */
function eggSac() {
  return pixelTexture(16, 16, (g) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const t = bayer(x, y);
        const egg = (x + (y & 1) * 2) % 4 === 0 || y % 4 === 0;
        const v = 0.55 + (hash(x >> 1, y >> 1, 14) - 0.5) * 0.4 - (egg ? 0.22 : 0) + (y < 8 ? 0.1 : -0.08);
        g[y][x] = pick(["#6a5a3e", "#a89870", "#d8cc9c", "#efe8c8"], v, t);
        if ((x + y) % 8 === 0 || (x - y + 16) % 8 === 0) g[y][x] = "#f8f8ee";
      }
  });
}

// ---------------------------------------------------------------------------------------------------------------
// The eye block: a hand-built hexahedron whose top face carries the whole mask texture (one dark texel for the rest).

/** A tapered block from two rings of corners (top-left, top-right, bottom-right, bottom-left), rear ring first. */
function eyeBlock(rings: readonly (readonly Vector3[])[]) {
  const pos: number[] = [];
  const uv: number[] = [];
  const centre = new Vector3();
  for (const r of rings) for (const p of r) centre.add(p);
  centre.divideScalar(8);
  const quad = (p: readonly Vector3[], t: readonly (readonly [number, number])[]) => {
    const n = new Vector3().subVectors(p[1], p[0]).cross(new Vector3().subVectors(p[2], p[0]));
    const mid = new Vector3().add(p[0]).add(p[1]).add(p[2]).add(p[3]).multiplyScalar(0.25);
    const order = n.dot(mid.sub(centre)) < 0 ? [0, 3, 2, 1] : [0, 1, 2, 3];
    for (const k of [order[0], order[1], order[2], order[0], order[2], order[3]]) {
      pos.push(p[k].x, p[k].y, p[k].z);
      uv.push(t[k][0], t[k][1]);
    }
  };
  const [r0, r1] = rings;
  const dark: [number, number][] = [
    [0.02, 0.03],
    [0.03, 0.03],
    [0.03, 0.04],
    [0.02, 0.04],
  ];
  quad(
    [r0[0], r0[1], r1[1], r1[0]],
    [
      [0.02, 0.02],
      [0.98, 0.02],
      [0.98, 0.98],
      [0.02, 0.98],
    ],
  );
  quad([r0[3], r0[2], r1[2], r1[3]], dark);
  quad([r0[0], r0[3], r1[3], r1[0]], dark);
  quad([r0[1], r0[2], r1[2], r1[1]], dark);
  quad([r0[0], r0[1], r0[2], r0[3]], dark);
  quad([r1[0], r1[1], r1[2], r1[3]], dark);
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------------------------------------------

/** Legs, front to back. `r` is the distance from the hip along the leg's heading, `y` its height, per joint + tip. */
const LEGS = [
  { z: 0.11, deg: 56, r: [0, 0.28, 0.56, 0.76, 0.88], y: [0.31, 0.88, 0.46, 0.13, 0] },
  { z: 0.04, deg: 22, r: [0, 0.3, 0.6, 0.79, 0.89], y: [0.31, 0.84, 0.42, 0.12, 0] },
  { z: -0.04, deg: -18, r: [0, 0.29, 0.58, 0.78, 0.88], y: [0.31, 0.8, 0.4, 0.11, 0] },
  { z: -0.11, deg: -52, r: [0, 0.32, 0.66, 0.85, 0.96], y: [0.31, 0.76, 0.36, 0.1, 0] },
] as const;

export default function build() {
  const b = createBuilder({ name: "ps1CaveSpider", paintSize: 512 });
  const random = rng(31);

  const EYEMASK = eyeMask();
  const BRISTLE = bristle("#d9b26a", "#a06c3a", "#7a4a28", "#4a2a1a");
  const LEG_BRISTLE = bristle("#c8a668", "#8a6a48", "#5e4438", "#2e1c22");
  const WEB = cobweb();
  const EGG = eggSac();

  // ---------------------------------------------------------------- body root and abdomen chain
  const body = b.joint("body", { at: [0, 0.33, 0.0], dir: [0, 0, 1], role: "spine", group: "body" });

  const abdPath = polyline([
    [0, 0.36, -0.14],
    [0, 0.42, -0.34],
    [0, 0.44, -0.56],
    [0, 0.4, -0.76],
    [0, 0.32, -0.92],
  ]);
  const abdomen = b.chain("abdomen", abdPath, {
    parent: body,
    count: 3,
    names: ["abdomen1", "abdomen2", "abdomen3"],
    role: "spine",
    group: "abdomen",
  });
  const abdKeys: [number, number][] = [
    [0, 0.05],
    [0.1, 0.15],
    [0.33, 0.25],
    [0.58, 0.285],
    [0.82, 0.2],
    [1, 0.025],
  ];
  const abd = b.sweep(abdomen, (t) => interp(abdKeys, t), {
    color: ABDOMEN,
    section: { ngon: 8 },
    caps: { start: "flat", end: "point" },
    group: "abdomen",
    name: "abdomen",
  });

  // ---------------------------------------------------------------- carapace
  const caraPath = polyline([
    [0, 0.31, -0.17],
    [0, 0.33, -0.02],
    [0, 0.34, 0.1],
    [0, 0.33, 0.22],
  ]);
  const caraKeys: [number, number][] = [
    [0, 0.08],
    [0.35, 0.155],
    [0.65, 0.14],
    [1, 0.1],
  ];
  const caraKeysY: [number, number][] = [
    [0, 0.06],
    [0.35, 0.105],
    [0.65, 0.1],
    [1, 0.075],
  ];
  const carapace = b.sweep(caraPath, (t) => [interp(caraKeys, t), interp(caraKeysY, t)], {
    bone: body,
    color: CARAPACE,
    section: { ngon: 6 },
    caps: { start: "point", end: "flat" },
    group: "body",
    name: "carapace",
  });

  // ---------------------------------------------------------------- eye block and eyes
  const blockDir: V3 = [0, -0.5, 1];
  const eyes = b.region({ at: [0, 0.44, 0.115], quat: aim(blockDir, [0, 1, 0], "z"), bone: body });
  const E = (x: number, y: number, z: number) => eyes.p([x, y, z]);
  const hw = BLOCK.w / 2;
  const hl = BLOCK.l / 2;
  const ringAt = (z: number) => [E(hw, 0.028, z), E(-hw, 0.028, z), E(-hw - 0.03, -0.05, z), E(hw + 0.03, -0.05, z)];
  b.part(eyeBlock([ringAt(-hl), ringAt(hl)]), "#ffffff", {
    texture: EYEMASK,
    bone: body,
    at: [0, 0, 0],
    group: "eyes",
    name: "eyeBlock",
  });
  for (const [i, [x, z, r]] of EYES.entries()) {
    const dir = eyes.d([x * 2, 1, z * 2 + 0.6]);
    b.part(new SphereGeometry(r, 6, 4), EYE, {
      bone: body,
      at: E(x, 0.028 + r * 0.25, z),
      dir,
      group: "eyes",
      name: `eye${i}`,
    });
    b.part(new SphereGeometry(r * 0.45, 5, 3), "#0c1404", {
      bone: body,
      at: E(x, 0.028 + r * 0.95, z + r * 0.15),
      dir,
      group: "eyes",
      name: `pupil${i}`,
    });
  }

  // ---------------------------------------------------------------- chelicerae: base + fang, both open a little
  const jawJoints: Joint[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const c0: V3 = [s * 0.06, 0.335, 0.2];
    const c1: V3 = [s * 0.075, 0.23, 0.27];
    const tip: V3 = [s * 0.045, 0.06, 0.335];
    const chel = b.chain(`chelicera${side}`, [c0, c1, tip], {
      parent: body,
      names: [`jaw${side}`, `fang${side}`],
      role: "jaw",
      up: [1, 0, 0],
      group: `jaw${side}`,
    });
    b.sweep([c0, c1], [0.05, 0.042], {
      bone: chel.joints[0],
      color: CHELICERA,
      section: { ngon: 5 },
      caps: { start: "flat", end: "flat" },
      group: `jaw${side}`,
      name: `chelicera${side}`,
    });
    b.sweep(bezier(c1, [s * 0.085, 0.14, 0.325], tip), [0.042, 0], {
      bone: chel.joints[1],
      color: FANG,
      section: { ngon: 5 },
      caps: { start: "flat", end: "point" },
      group: `jaw${side}`,
      name: `fang${side}`,
    });
    jawJoints.push(chel.joints[0], chel.joints[1]);
  }

  // ---------------------------------------------------------------- pedipalps
  const palpSweeps: Sweep[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const pts: V3[] = [
      [s * 0.11, 0.31, 0.16],
      [s * 0.2, 0.32, 0.34],
      [s * 0.17, 0.24, 0.47],
      [s * 0.14, 0.15, 0.5],
    ];
    const palp = b.chain(`palp${side}`, pts, {
      parent: body,
      names: [`palpBase${side}`, `palpMid${side}`, `palpTip${side}`],
      role: "arm",
      group: `palp${side}`,
    });
    const ts = palp.ts;
    palpSweeps.push(
      b.sweep(
        palp,
        (t) =>
          interp(
            [
              [0, 0.032],
              [ts[1], 0.03],
              [ts[2], 0.024],
              [1, 0.018],
            ],
            t,
          ),
        {
          color: legPaint(ts),
          section: { ngon: 5 },
          caps: { start: "flat", end: "flat" },
          group: `palp${side}`,
          name: `palp${side}`,
        },
      ),
    );
    // The palp's bulb.
    b.part(new SphereGeometry(0.036, 6, 4), CARA_R[3], {
      bone: palp.joints[2],
      at: [s * 0.14, 0.13, 0.505],
      group: `palp${side}`,
      name: `palpBulb${side}`,
    });
  }

  // ---------------------------------------------------------------- eight legs

  const kneeSurface: { s: number; n: number; sweep: Sweep; tip: Vector3; knee: Frame; shin: Frame }[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    for (const [i, spec] of LEGS.entries()) {
      const n = i + 1;
      const a = (spec.deg * Math.PI) / 180;
      const hip = new Vector3(s * 0.1, spec.y[0], spec.z);
      const heading = new Vector3(s * Math.cos(a), 0, Math.sin(a));
      const pts = spec.r.map((r, k) => hip.clone().addScaledVector(heading, r).setY(spec.y[k]));
      const leg = b.chain(`leg${side}${n}`, pts, {
        parent: body,
        names: [`hip${side}${n}`, `knee${side}${n}`, `ankle${side}${n}`, `toe${side}${n}`],
        role: "leg",
        contact: [pts[4].x, 0, pts[4].z],
        group: `leg${side}${n}`,
      });
      const ts = leg.ts;
      const keys: [number, number][] = [
        [0, 0.05],
        [ts[1] * 0.5, 0.048],
        [ts[1], 0.042],
        [(ts[1] + ts[2]) / 2, 0.033],
        [ts[2], 0.026],
        [ts[3], 0.019],
        [1, 0.004],
      ];
      const sweep = b.sweep(leg, (t) => interp(keys, t), {
        color: legPaint(ts),
        section: { ngon: 5 },
        caps: { start: "flat", end: "point" },
        group: `leg${side}${n}`,
        name: `leg${side}${n}`,
      });

      kneeSurface.push({
        s,
        n,
        sweep,
        tip: pts[4],
        knee: sweep.at(ts[1], 0),
        shin: sweep.at((ts[1] + ts[2]) / 2, 0),
      });
      // Spines up the tibia and the end of the femur.
      for (const t of [ts[1] + 0.05, ts[1] + (ts[2] - ts[1]) * 0.45, ts[2] - 0.05])
        for (const ang of [55, -55, 180])
          b.spike(sweep.at(t, ang), sweep.at(t, ang), 0.048, 0.008, {
            color: SPINE,
            sides: 3,
            group: `leg${side}${n}`,
            name: "spine",
          });
    }
  }

  // ---------------------------------------------------------------- spinnerets and silk to the floor
  for (const s of [1, -1])
    b.spike(frame([s * 0.03, 0.33, -0.9], [s * 0.15, -0.55, -1]), [s * 0.15, -0.55, -1], 0.09, 0.03, {
      color: SPINNER,
      sides: 4,
      bone: abdomen.joints[2],
      group: "abdomen",
      name: "spinneret",
    });
  const spin0 = new Vector3(0, 0.29, -0.98);
  const strand = (a: Frame | V3 | Vector3, m: V3, c: V3, r = 0.006) =>
    b.sweep(bezier(a, m, c), [r, r * 0.8], {
      color: SILK,
      section: { ngon: 3 },
      caps: { start: "flat", end: "point" },
      ...(Array.isArray(a) || a instanceof Vector3 ? { bone: abdomen.joints[2] } : {}),
      group: "silk",
      name: "silk",
    });
  strand(spin0, [0.03, 0, -1.08], [0.26, 0, -1.3]);
  strand(spin0, [-0.03, 0, -1.06], [-0.2, 0, -1.28], 0.005);

  // ---------------------------------------------------------------- egg sacs clinging under and behind the abdomen
  const around = b.surface(abd).around([0, 0.38, -0.55]);
  const sacSpots: { az: number; el: number; r: number }[] = [
    { az: 180, el: -25, r: 0.085 },
    { az: 152, el: -42, r: 0.07 },
    { az: -152, el: -42, r: 0.07 },
    { az: 120, el: -52, r: 0.06 },
    { az: -122, el: -55, r: 0.065 },
    { az: 165, el: -8, r: 0.055 },
  ];
  const sacHits: Hit[] = [];
  for (const { az, el, r } of sacSpots) {
    const hit = around.at(az, el);
    if (!hit) continue;
    sacHits.push(hit);
    const sac = new SphereGeometry(r, 7, 5);
    const suv = sac.getAttribute("uv");
    for (let k = 0; k < suv.count; k++)
      suv.setXY(k, Math.min(Math.max(suv.getX(k), 0.01), 0.99), Math.min(Math.max(suv.getY(k), 0.01), 0.99));
    b.stick(sac, "#ffffff", hit, {
      texture: EGG,
      embed: 0.32,
      group: "eggs",
      name: "eggSac",
    });
  }
  // Silk lashing the sacs to each other and to the belly.
  for (let i = 0; i + 1 < sacHits.length; i++) {
    const a = sacHits[i];
    const c = sacHits[i + 1];
    const m = a.at.clone().add(c.at).multiplyScalar(0.5).addScaledVector(a.n, 0.06);
    b.sweep(bezier(a, m, c), [0.007, 0.007], {
      color: SILK,
      section: { ngon: 3 },
      caps: { start: "flat", end: "flat" },
      group: "silk",
      name: "sacSilk",
    });
  }

  // ---------------------------------------------------------------- bristles
  const hair = (
    surf: Sweep | Sweep[],
    count: number,
    minDist: number,
    size: [number, number],
    seed: number,
    f?: (h: Hit) => boolean,
    texture = BRISTLE,
    flow?: (h: Frame) => Vector3,
  ) => {
    const hits = b.surface(surf).scatter(count, { rng: random, minDist, filter: f });
    b.cards(hits, texture, {
      size,
      lean: 62,
      bend: 20,
      vary: 0.25,
      spin: 20,
      ...(flow ? { flow } : {}),
      rng: rng(seed),
      group: "hair",
      name: "bristles",
    });
  };
  hair(abd, 260, 0.05, [0.045, 0.11], 3, (h) => {
    // Keep the skull clear.
    const onSkull = h.n.y > 0.3 && Math.abs(h.at.x) < 0.16 && h.at.z < -0.3 && h.at.z > -0.68;
    return !onSkull && h.at.y > 0.2;
  });
  for (const { sweep, tip } of kneeSurface)
    hair(
      sweep,
      30,
      0.05,
      [0.035, 0.075],
      5,
      (h) => h.at.y > 0.14,
      LEG_BRISTLE,
      (h) => tip.clone().sub(h.at),
    );
  hair(carapace, 40, 0.055, [0.04, 0.09], 7, (h) => h.n.y < 0.75 && h.at.z < 0.1);
  hair(palpSweeps, 14, 0.05, [0.035, 0.07], 9);

  // ---------------------------------------------------------------- webbing
  const web = (h: Frame, size: number, mirror: boolean, flow: V3) =>
    b.cards([h], WEB, {
      size: [size, size],
      lean: 82,
      flow,
      bend: 30,
      mirror,
      color: "#ffffff",
      group: "webs",
      name: "cobweb",
    });
  const back = b.surface(abd).around([0, 0.38, -0.55]);
  for (const [az, el, size, flow] of [
    [178, 45, 0.34, [0, -1, -0.6]],
    [140, 35, 0.3, [0.5, -1, -0.5]],
    [-140, 35, 0.3, [-0.5, -1, -0.5]],
    [80, 30, 0.28, [0.7, -1, -0.1]],
    [-80, 35, 0.28, [-0.7, -1, -0.1]],
    [110, 58, 0.24, [0.4, -1, -0.8]],
  ] as const) {
    const hit = back.at(az, el);
    if (hit) web(hit, size, az < 0, [...flow]);
  }
  // Curtains hanging from the hind and front knees.
  for (const { s, n, knee } of kneeSurface) {
    if (n !== 4 && !(n === 1 && s > 0)) continue;
    web(knee, n === 4 ? 0.3 : 0.24, s < 0, [s * 0.4, -1, n === 4 ? -0.6 : 0.5]);
  }
  // Strands from the hind shins to the abdomen.
  for (const { s, n, shin } of kneeSurface) {
    if (n !== 4) continue;
    const to = b.surface(abd).nearest([s * 0.22, 0.4, -0.55]);
    b.sweep(bezier(shin, [s * 0.34, 0.45, -0.5], to), [0.006, 0.006], {
      color: SILK,
      section: { ngon: 3 },
      caps: { start: "flat", end: "flat" },
      group: "silk",
      name: "hindSilk",
    });
  }

  // Rest pose: the fangs a little open.
  for (const j of jawJoints) {
    const s = j.at.x > 0 ? 1 : -1;
    b.pose(j, { axis: [0, 0, 1], deg: s * (j.name.startsWith("fang") ? 16 : 10) });
  }
  return b.root;
}
