// DOS basilisk: a 3 m serpent-lizard on six splayed legs, drawn as a 1993 VGA dungeon-crawler monster would have been.
// Every colour comes from hand-picked ramps snapped to the 18-bit VGA DAC (6 bits a channel), and every gradient is an
// ordered 4x4 Bayer dither between ramp steps: the body coat is a paint that quantises the model into 2 cm cells, draws
// a diamond-scale lattice with black outlines and dithered shading, dorsal rust saddles, ochre belly plates and ringed
// tail. The head is two hand-unwrapped boxes on one 64x64 sheet (diamond scales, mouth roof, tongue bed, nostrils,
// an alpha-cut tooth strip), the eyes are 10x10 pixel discs on bulbs, the frill is a pair of star-fan plates painted
// per outline pixel, and the crown of horns, brow horns, fangs, dorsal spikes and venom drops are painted chunky
// facets. Six legs, spine, neck and tail chains, a jaw that opens and hinged frill fans give it a full rig.
import {
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Vector3,
} from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim } from "../src/math";
import { paint, smoothstep } from "../src/paint";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "DOS basilisk",
  description:
    "A six-legged basilisk as a 1993 VGA dungeon-crawler monster: 18-bit palette ramps, Bayer-dithered diamond scales, a hand-painted 64x64 head sheet, pixel-disc eyes, a star-fan frill, a crown of horns and dripping venom.",
  builtBy: "Claude Sonnet 5.5",
};

type V3 = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------------
// Palette: ramps of hand-picked hues, each snapped to VGA's 6-bit-per-channel DAC values.

const vga = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  const ch = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => {
    const c6 = Math.round((c / 255) * 63);
    return (c6 << 2) | (c6 >> 4);
  });
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};
const ramp = (...hex: string[]) => hex.map(vga);

const GREEN = ramp("#0c1808", "#1a3010", "#2c5018", "#457c1c", "#6aa42c", "#9ccc4c");
const OCHRE = ramp("#3c2408", "#684010", "#a06c1c", "#d09c34", "#f0d468");
const RUST = ramp("#3c0c08", "#701c10", "#a83418", "#d8601c", "#f8a030");
const MAGENTA = ramp("#240418", "#4c0c34", "#7c1450", "#b02866", "#e0508c", "#f89ab8");
const BONE = ramp("#28201c", "#5c4c3c", "#94805c", "#c8b888", "#f4ecc4");
const MOUTH = ramp("#2c0810", "#5c1420", "#8c2c34", "#c05c58", "#e08c80");
const TOEP = ramp("#181008", "#302010", "#504020", "#786434", "#a08a4c");
const VENOM = ramp("#1c8c14", "#38c828", "#68f048", "#b0ff78");
const TONGUE = ramp("#3c0814", "#701224", "#a82440", "#d84860", "#f88c98");
const BLACK = vga("#0a0806");
const RIB = vga("#e0cc90");
const SPIKE_A = vga("#e0701c");
const SPIKE_B = vga("#f8b030");

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const mod = (a: number, m: number) => ((a % m) + m) % m;
/** Ordered-dither threshold (0..1) at integer cell (i, j). */
const bayer = (i: number, j: number) => (BAYER[mod(j, 4)][mod(i, 4)] + 0.5) / 16;
/** The ramp step for value v (0..1), dithered between neighbouring steps by threshold t. */
function pick(r: readonly string[], v: number, t: number) {
  const x = Math.min(Math.max(v, 0), 1) * (r.length - 1);
  const i = Math.min(Math.floor(x), r.length - 2);
  return x - i > t ? r[i + 1] : r[i];
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
// Body radii by z, shared by the tube and the coat paint (which draws its saddles inside the body's width).

const RX = [
  [-1.45, 0.012],
  [-1.2, 0.04],
  [-0.95, 0.08],
  [-0.7, 0.14],
  [-0.45, 0.22],
  [-0.2, 0.28],
  [0.1, 0.31],
  [0.35, 0.29],
  [0.55, 0.22],
  [0.72, 0.17],
  [0.84, 0.145],
  [0.94, 0.13],
  [1.04, 0.12],
] as const;
const RY = RX.map(([z, r]) => [z, r * 0.92] as const);

// ---------------------------------------------------------------------------------------------------------------
// Paints: everything works in 2 cm cells so the sheet reads as big square texels on every face.

const CELL = 0.02;

/** The two cell axes of the face `n` points at, and the cell they fall in. */
function cellOf(p: Vector3, n: Vector3) {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const [u, v] = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
  return [Math.floor(u / CELL), Math.floor(v / CELL)] as const;
}

/** Diamond-scale lattice value: 0 on the outline diagonals, growing to the diamond's core. */
const lattice = (i: number, j: number, period: number) => {
  const d1 = mod(i + j, period);
  const d2 = mod(i - j, period);
  return Math.min(d1, period - d1, d2, period - d2);
};

/** Green (or any ramp) diamond scales with dark outlines and a bright core, lit from above. */
function scaleCell(r: readonly string[], iu: number, iv: number, light: number, gleam: number) {
  const t = bayer(iu, iv);
  const inner = lattice(iu, iv, 6);
  const grain = hash(iu, iv, 3);
  if (inner === 0) return pick(r, 0.06 + 0.12 * grain + 0.1 * light, t);
  const v = 0.3 + 0.32 * light + 0.09 * (inner - 1) + (inner === 3 ? gleam : 0) - (grain < 0.06 ? 0.2 : 0);
  return pick(r, v, t);
}

const SKIN = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  const t = bayer(iu, iv);
  const qx = (Math.floor(p.x / CELL) + 0.5) * CELL;
  const qy = (Math.floor(p.y / CELL) + 0.5) * CELL;
  const qz = (Math.floor(p.z / CELL) + 0.5) * CELL;
  // Up along the body: world up on the back, leaning back along the neck as it rises.
  const k = smoothstep(0.55, 0.85, qz);
  const ux = 1 - 0.75 * k;
  const uz = -0.75 * k;
  const facing = (n.y * ux + n.z * uz) / Math.hypot(ux, uz);
  const along = qz + Math.max(0, qy - 0.62) * 0.6;
  const grain = hash(iu, iv, 5);

  // Belly and throat: ochre plates in rows three cells deep.
  if (facing < -0.3 + (t - 0.5) * 0.3) {
    const row = mod(Math.floor(along / CELL), 3);
    if (row === 0) return pick(OCHRE, 0.12 + 0.1 * grain, t);
    const v = 0.5 + (row === 1 ? 0.14 : 0) + 0.3 * (-facing - 0.3) + (grain - 0.5) * 0.14;
    return pick(OCHRE, v, t);
  }

  const rx = interp(RX, qz);
  const u = mod(along / 0.3, 1);
  const saddle = facing > 0.25 && qz > -1.1 && qz < 1.0 && Math.abs(qx) < 0.62 * rx * (1 - Math.abs(2 * u - 1));
  const band = qz < -0.6 && mod(Math.floor((-qz - 0.6) / 0.12), 2) === 1;
  const r = band ? OCHRE : saddle ? RUST : GREEN;
  return scaleCell(r, iu, iv, Math.max(facing, -0.2) + 0.2, facing > 0.75 ? 0.22 : 0.08);
});

/** Little brick scales, dark mortar, for toes and the lower shin. */
const TOE = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  const t = bayer(iu, iv);
  const bx = mod(iu + 2 * (iv >> 1), 3);
  const by = iv & 1;
  const v = 0.55 + 0.2 * Math.max(n.y, 0) - (bx === 0 ? 0.42 : 0) - (by ? 0.14 : 0) + (hash(iu, iv, 3) - 0.5) * 0.25;
  return pick(TOEP, v, t);
});
/** Legs wear body scales down to the ankle, then brick scales. */
const LEG = paint((p) => (p.y < 0.2 ? TOE : SKIN));
/** Eyelid bulbs and cheek plates: green diamonds only. */
const LID = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  return scaleCell(GREEN, iu, iv, Math.max(n.y, -0.2) + 0.2, 0.1);
});

/** A horn, spike or claw: dark ridged base to pale tip by distance from `base`, dithered, ringed. */
function boneGrad(base: Vector3, len: number) {
  return paint((p, n) => {
    const [iu, iv] = cellOf(p, n);
    const t = bayer(iu, iv);
    const d = p.distanceTo(base);
    const w = Math.min(d / len, 1);
    const ring = Math.floor(d / 0.045);
    const v = 0.22 + 0.7 * w + 0.12 * Math.max(n.y, 0) - (mod(ring, 2) === 1 ? 0.16 : 0);
    return pick(BONE, v, t);
  });
}

/** A fang: bone at the root, venom green towards the tip, dithered across the change. */
function fangPaint(root: Vector3, len: number) {
  return paint((p, n) => {
    const [iu, iv] = cellOf(p, n);
    const t = bayer(iu, iv);
    const w = p.distanceTo(root) / len;
    if (w + (t - 0.5) * 0.3 > 0.62) return pick(VENOM, 0.35 + 0.5 * Math.max(n.y, 0) + hash(iu, iv, 1) * 0.15, t);
    return pick(BONE, 0.5 + 0.4 * w + 0.12 * Math.max(n.y, 0), t);
  });
}

/** Venom drops: dithered acid green with a bright upper edge. */
const DROP = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  return pick(VENOM, 0.35 + 0.55 * Math.max(n.y, -0.1) + 0.1 * hash(iu, iv, 2), bayer(iu, iv));
});

/** The forked tongue: red with a dark groove down the middle, dithered light. */
const TONGUE_PAINT = paint((_p, _n, s) => {
  const ix = Math.floor(s[0] / CELL);
  const iy = Math.floor(s[1] / CELL);
  const groove = iy === 0 || iy === -1 ? -0.16 : 0;
  return pick(TONGUE, 0.55 + groove + 0.25 * Math.sin(ix * 0.5) * 0.3 + (hash(ix, iy, 4) - 0.5) * 0.2, bayer(ix, iy));
});

// ---------------------------------------------------------------------------------------------------------------
// The frill: a star fan drawn in polar coordinates from the plate's origin.

const FAN_ANG = [-60, -38, -16, 6, 28, 50, 72].map((d) => (d * Math.PI) / 180);
const FAN_R = [0.4, 0.52, 0.6, 0.64, 0.58, 0.5, 0.38];
const FAN_POLAR: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = [[-Math.PI / 2, 0.07]];
  const step = (11 * Math.PI) / 180;
  FAN_ANG.forEach((a, i) => {
    const valley = 0.6 * (i === 0 ? FAN_R[0] : (FAN_R[i - 1] + FAN_R[i]) / 2);
    out.push([a - step, valley], [a, FAN_R[i]]);
  });
  out.push([FAN_ANG[FAN_ANG.length - 1] + step, 0.6 * FAN_R[FAN_R.length - 1]], [Math.PI / 2, 0.09]);
  return out;
})();
const FAN_OUTLINE: Pt[] = FAN_POLAR.map(([a, r]): Pt => [r * Math.cos(a), r * Math.sin(a)]);
/** The plate's edge radius in direction `a`. */
function edgeR(a: number) {
  for (let i = 1; i < FAN_POLAR.length; i++)
    if (a <= FAN_POLAR[i][0]) {
      const [a0, r0] = FAN_POLAR[i - 1];
      const [a1, r1] = FAN_POLAR[i];
      return r0 + ((r1 - r0) * (a - a0)) / (a1 - a0);
    }
  return FAN_POLAR[FAN_POLAR.length - 1][1];
}
const FRILL = paint((_p, _n, s) => {
  const ix = Math.floor(s[0] / CELL);
  const iy = Math.floor(s[1] / CELL);
  const x = (ix + 0.5) * CELL;
  const y = (iy + 0.5) * CELL;
  const t = bayer(ix, iy);
  const r = Math.hypot(x, y);
  const a = Math.atan2(y, x);
  const u = Math.min(r / Math.max(edgeR(a), 0.05), 1);
  let lateral = 9;
  for (const ta of FAN_ANG) if (Math.cos(a - ta) > 0) lateral = Math.min(lateral, Math.abs(Math.sin(a - ta)) * r);
  if (lateral < 0.85 * CELL && u > 0.12) return pick(OCHRE, 0.45 + 0.5 * u, t);
  if (u > 0.9) return pick(OCHRE, 0.55 + (t - 0.5) * 0.3, t);
  let v = 0.18 + 0.7 * Math.pow(u, 1.2) + (hash(ix, iy, 9) - 0.5) * 0.1;
  if (Math.abs(u - 0.6) < 0.035) v -= 0.24;
  return pick(MAGENTA, v, t);
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

type Rect = readonly [number, number, number, number];
const SHEET = 64;
/** Where each face of the two head boxes sits on the 64x64 head sheet (pixels, y down). */
const FACE = {
  upSide: [0, 0, 40, 16],
  upTop: [0, 16, 40, 26],
  upBot: [0, 26, 40, 34],
  loSide: [0, 34, 40, 44],
  loTop: [0, 44, 40, 52],
  loBot: [0, 52, 40, 58],
  teeth: [0, 58, 40, 64],
  upFront: [42, 0, 54, 10],
  upBack: [42, 12, 54, 22],
  loFront: [42, 24, 52, 32],
  loBack: [42, 34, 52, 42],
} as const satisfies Record<string, Rect>;

function headSheet() {
  return pixelTexture(SHEET, SHEET, (g) => {
    const fill = (r: Rect, fn: (lx: number, ly: number, w: number, h: number) => string) => {
      for (let y = r[1]; y < r[3]; y++)
        for (let x = r[0]; x < r[2]; x++) g[y][x] = fn(x - r[0], y - r[1], r[2] - r[0], r[3] - r[1]);
    };
    const put = (r: Rect, lx: number, ly: number, c: string) => {
      if (r[0] + lx < r[2] && r[1] + ly < r[3]) g[r[1] + ly][r[0] + lx] = c;
    };
    const nz = (x: number, y: number, s: number) => hash(Math.floor(x / 2), Math.floor(y / 2), s);

    // Upper side: diamond scales fading to an ochre lip, black mouth line, nostril, cheek pit.
    fill(FACE.upSide, (lx, ly) => {
      const t = bayer(lx, ly);
      if (ly === 15) return BLACK;
      if (ly >= 12) return pick(OCHRE, 0.45 + (ly - 12) * 0.12 + (nz(lx, ly, 1) - 0.5) * 0.2, t);
      const d = lattice(lx, ly, 4);
      if (d === 0) return pick(GREEN, 0.06 + ly * 0.012, t);
      return pick(GREEN, 0.72 - ly * 0.03 + 0.06 * d + (nz(lx, ly, 2) - 0.5) * 0.2, t);
    });
    for (const [x, y] of [
      [36, 5],
      [37, 5],
      [36, 6],
    ])
      put(FACE.upSide, x, y, BLACK);
    put(FACE.upSide, 35, 4, OCHRE[3]);
    for (let y = 3; y <= 6; y++) put(FACE.upSide, 4, y, BLACK); // cheek pit
    for (let x = 14; x < 40; x++) if (x % 3 === 0) put(FACE.upSide, x, 11, OCHRE[1]); // lip studs

    // Upper top: dark cap, rust diamond chain down the middle, two nostrils on the snout.
    fill(FACE.upTop, (lx, ly) => {
      const t = bayer(lx, ly);
      const d = lattice(lx, ly, 4);
      const centre = Math.abs(ly - 4.5) < 1.6 && mod(lx, 8) < 6;
      const r = centre ? RUST : GREEN;
      if (d === 0) return pick(r, 0.08, t);
      return pick(r, 0.45 + 0.08 * d + (nz(lx, ly, 3) - 0.5) * 0.25, t);
    });
    for (const y of [1, 8]) for (const x of [35, 36]) put(FACE.upTop, x, y, BLACK);

    // Upper bottom: the mouth roof, ridged and flushed.
    fill(FACE.upBot, (lx, ly) => {
      const t = bayer(lx, ly);
      if (ly === 0 || ly === 7) return MOUTH[4];
      const ridge = lx % 4 === 2 ? -0.18 : 0;
      return pick(MOUTH, 0.5 + ridge + (nz(lx, ly, 4) - 0.5) * 0.2, t);
    });
    fill(FACE.upFront, (lx, ly) => pick(GREEN, 0.3 + ly * 0.03 + (nz(lx, ly, 5) - 0.5) * 0.3, bayer(lx, ly)));
    for (const x of [3, 8]) put(FACE.upFront, x, 6, BLACK);
    fill(FACE.upBack, () => GREEN[0]);

    // Lower side: green over ochre plates.
    fill(FACE.loSide, (lx, ly) => {
      const t = bayer(lx, ly);
      if (ly === 0) return BLACK;
      if (ly >= 5) return pick(OCHRE, 0.5 + (ly - 5) * 0.06 + (lx % 6 === 0 ? -0.2 : 0), t);
      const d = lattice(lx, ly, 4);
      if (d === 0) return pick(GREEN, 0.06, t);
      return pick(GREEN, 0.5 - ly * 0.02 + 0.06 * d + (nz(lx, ly, 6) - 0.5) * 0.2, t);
    });
    // Lower top: mouth floor.
    fill(FACE.loTop, (lx, ly) => pick(MOUTH, 0.38 + (nz(lx, ly, 8) - 0.5) * 0.3, bayer(lx, ly)));
    // Lower bottom: throat plates.
    fill(FACE.loBot, (lx, ly) => {
      const t = bayer(lx, ly);
      if (lx % 5 === 0) return pick(OCHRE, 0.15, t);
      return pick(OCHRE, 0.6 + (nz(lx, ly, 10) - 0.5) * 0.3 - (ly > 3 ? 0.08 : 0), t);
    });
    fill(FACE.loFront, (lx, ly) => pick(OCHRE, 0.55 + (nz(lx, ly, 11) - 0.5) * 0.3, bayer(lx, ly)));
    fill(FACE.loBack, () => MOUTH[0]);

    // Teeth: a gum row and eight triangles; transparent everywhere else.
    const heights = [4, 3, 4, 4, 3, 4, 3, 4];
    fill(FACE.teeth, (lx, ly) => {
      if (ly === 0) return MOUTH[3];
      const tooth = Math.floor(lx / 5);
      const h = heights[tooth] ?? 3;
      const c = lx % 5;
      const half = Math.max(0, (h - ly) / h) * 2;
      if (ly > h) return "";
      if (Math.abs(c - 1.5) > half + 0.01) return "";
      return c >= 2 ? BONE[3] : BONE[4];
    });
  });
}

/** A 10x10 petrifying eye: dithered gold iris, slit pupil, black rim, a white glint. Cut to a disc by the geometry. */
function eyeTexture() {
  return pixelTexture(10, 10, (g) => {
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 10; x++) {
        const dx = x + 0.5 - 5;
        const dy = y + 0.5 - 5;
        const r = Math.hypot(dx, dy);
        if (r > 5.05) continue;
        const t = bayer(x, y);
        if (r > 4.1) g[y][x] = y < 4 ? RUST[1] : BLACK;
        else if (x === 4 || x === 5) g[y][x] = y === 0 || y === 9 ? BLACK : "#050403";
        else
          g[y][x] = pick(
            ramp("#a06000", "#e0a000", "#fcd800", "#fcfc50"),
            0.5 + 0.5 * (1 - r / 4.1) + (y > 5 ? 0.12 : -0.05),
            t,
          );
      }
    g[2][2] = "#fffce0";
    g[2][3] = "#fff090";
    g[3][2] = "#fff090";
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Hand-unwrapped boxes for the head: rings of four corners (top-left, top-right, bottom-right, bottom-left, left is
// +X), one texture rectangle per face, u running back to front along the box.

class HeadMesh {
  private pos: number[] = [];
  private uv: number[] = [];
  private centre = new Vector3();

  constructor(private rings: readonly (readonly Vector3[])[]) {
    for (const r of rings) for (const p of r) this.centre.add(p);
    this.centre.divideScalar(rings.length * 4);
  }

  private mapU(r: Rect, f: number) {
    return (r[0] + 0.3 + (r[2] - r[0] - 0.6) * f) / SHEET;
  }
  private mapV(r: Rect, f: number) {
    return 1 - (r[1] + 0.3 + (r[3] - r[1] - 0.6) * f) / SHEET;
  }

  /** A quad with per-corner uv; wound to face away from the box centre (or both ways when `both`). */
  private quad(p: readonly Vector3[], t: readonly (readonly [number, number])[], both = false) {
    const n = new Vector3().subVectors(p[1], p[0]).cross(new Vector3().subVectors(p[2], p[0]));
    const mid = new Vector3().add(p[0]).add(p[1]).add(p[2]).add(p[3]).multiplyScalar(0.25);
    const flip = n.dot(mid.sub(this.centre)) < 0;
    const order = flip ? [0, 3, 2, 1] : [0, 1, 2, 3];
    const emit = (o: number[]) => {
      for (const k of [o[0], o[1], o[2], o[0], o[2], o[3]]) {
        this.pos.push(p[k].x, p[k].y, p[k].z);
        this.uv.push(t[k][0], t[k][1]);
      }
    };
    emit(order);
    if (both) emit([order[0], order[3], order[2], order[1]]);
  }

  /** Fractions of the way along the rings, by distance between ring centres. */
  private along() {
    const c = this.rings.map((r) => r.reduce((s, p) => s.add(p), new Vector3()).multiplyScalar(0.25));
    const cum = [0];
    for (let i = 1; i < c.length; i++) cum.push(cum[i - 1] + c[i].distanceTo(c[i - 1]));
    return cum.map((d) => d / cum[cum.length - 1]);
  }

  /** The strip of quads between corner `a` and corner `b` of every ring, textured from `r`. */
  side(a: number, b: number, r: Rect) {
    const f = this.along();
    for (let i = 0; i + 1 < this.rings.length; i++) {
      const [r0, r1] = [this.rings[i], this.rings[i + 1]];
      this.quad(
        [r0[a], r1[a], r1[b], r0[b]],
        [
          [this.mapU(r, f[i]), this.mapV(r, 0)],
          [this.mapU(r, f[i + 1]), this.mapV(r, 0)],
          [this.mapU(r, f[i + 1]), this.mapV(r, 1)],
          [this.mapU(r, f[i]), this.mapV(r, 1)],
        ],
      );
    }
  }

  /** An end face of the box (first or last ring) from a whole rectangle. */
  cap(last: boolean, r: Rect) {
    const ring = this.rings[last ? this.rings.length - 1 : 0];
    this.quad(ring, [
      [this.mapU(r, 0), this.mapV(r, 0)],
      [this.mapU(r, 1), this.mapV(r, 0)],
      [this.mapU(r, 1), this.mapV(r, 1)],
      [this.mapU(r, 0), this.mapV(r, 1)],
    ]);
  }

  /** A double-sided tooth strip hung between two polylines (gum edge, tooth tips), textured from `r`. */
  teeth(gum: readonly Vector3[], tips: readonly Vector3[], r: Rect, flipV: boolean) {
    const cum = [0];
    for (let i = 1; i < gum.length; i++) cum.push(cum[i - 1] + gum[i].distanceTo(gum[i - 1]));
    const [vg, vt] = flipV ? [1, 0] : [0, 1];
    for (let i = 0; i + 1 < gum.length; i++) {
      const [u0, u1] = [cum[i] / cum[cum.length - 1], cum[i + 1] / cum[cum.length - 1]];
      this.quad(
        [gum[i], gum[i + 1], tips[i + 1], tips[i]],
        [
          [this.mapU(r, u0), this.mapV(r, vg)],
          [this.mapU(r, u1), this.mapV(r, vg)],
          [this.mapU(r, u1), this.mapV(r, vt)],
          [this.mapU(r, u0), this.mapV(r, vt)],
        ],
        true,
      );
    }
  }

  geometry() {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.pos, 3));
    g.setAttribute("uv", new Float32BufferAttribute(this.uv, 2));
    g.computeVertexNormals();
    return g;
  }
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "dosBasilisk", paintSize: 1024 });

  const HEAD = headSheet();
  const EYE = eyeTexture();

  // ---------------------------------------------------------------- spine, neck, tail: one octagonal tube
  const stations: V3[] = [
    [0, 0.07, -1.45],
    [0, 0.15, -1.15],
    [0, 0.27, -0.85],
    [0, 0.4, -0.6],
    [0, 0.53, -0.38],
    [0, 0.56, -0.05],
    [0, 0.58, 0.28],
    [0, 0.62, 0.55],
    [0, 0.79, 0.72],
    [0, 1.03, 0.84],
    [0, 1.22, 0.94],
    [0, 1.32, 1.04],
  ];
  const curve = catmull(stations);
  const hipsT = curve.closestT(stations[4]);
  const neckT = curve.closestT(stations[7]);
  const hips = b.joint("hips", { at: stations[4], role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, neckT), {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", curve.slice(neckT, 1), {
    parent: spine.joints[3],
    count: 5,
    names: ["neck1", "neck2", "neck3", "neck4", "neck5"],
    role: "neck",
    group: "neck",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), {
    parent: hips,
    count: 8,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7", "tail8"],
    role: "tail",
    group: "tail",
  });
  const zAt = (t: number) => curve.at(t).z;
  const body = b.sweep(curve, (t) => [interp(RX, zAt(t)), interp(RY, zAt(t))], {
    bone: [tail, hips, spine, neck],
    color: SKIN,
    section: { ngon: 8 },
    caps: { start: "point", end: "flat" },
    group: "body",
  });

  // ---------------------------------------------------------------- head: two unwrapped boxes
  const headDir: V3 = [0, -0.16, 1];
  const skull = b.joint("head", { parent: neck.joints[4], at: curve.at(1), dir: headDir, role: "head", group: "head" });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  const H = (x: number, y: number, z: number) => head.p([x, y, z]);
  const D = (x: number, y: number, z: number) => head.d([x, y, z]).normalize();
  const ring = (z: number, wT: number, yT: number, wB: number, yB: number) => [
    H(wT, yT, z),
    H(-wT, yT, z),
    H(-wB, yB, z),
    H(wB, yB, z),
  ];

  const jaw = b.joint("jaw", {
    parent: skull,
    at: H(0, -0.05, -0.02),
    aim: H(0, -0.06, 0.55),
    role: "jaw",
    group: "jaw",
  });

  const upperRings = [
    ring(-0.05, 0.17, 0.16, 0.15, -0.08),
    ring(0.1, 0.18, 0.15, 0.15, -0.06),
    ring(0.24, 0.12, 0.11, 0.11, -0.05),
    ring(0.4, 0.085, 0.08, 0.085, -0.045),
    ring(0.6, 0.07, 0.065, 0.07, -0.04),
  ];
  const lowerRings = [
    ring(-0.02, 0.13, -0.04, 0.1, -0.14),
    ring(0.12, 0.14, -0.04, 0.1, -0.16),
    ring(0.28, 0.095, -0.035, 0.07, -0.12),
    ring(0.42, 0.075, -0.033, 0.055, -0.095),
    ring(0.59, 0.065, -0.032, 0.048, -0.075),
  ];
  const upper = new HeadMesh(upperRings);
  upper.side(0, 3, FACE.upSide);
  upper.side(1, 2, FACE.upSide);
  upper.side(0, 1, FACE.upTop);
  upper.side(3, 2, FACE.upBot);
  upper.cap(true, FACE.upFront);
  upper.cap(false, FACE.upBack);
  const lower = new HeadMesh(lowerRings);
  lower.side(0, 3, FACE.loSide);
  lower.side(1, 2, FACE.loSide);
  lower.side(0, 1, FACE.loTop);
  lower.side(3, 2, FACE.loBot);
  lower.cap(true, FACE.loFront);
  lower.cap(false, FACE.loBack);
  for (const s of [1, -1]) {
    const edge = (rings: (readonly Vector3[])[], k: number, from: number) => rings.slice(from).map((r) => r[k]);
    const upGum = edge(upperRings, s > 0 ? 3 : 2, 1);
    upper.teeth(
      upGum.map((p) => p.clone().add(new Vector3(0, 0.008, 0))),
      upGum.map((p) => p.clone().add(new Vector3(0, -0.045, 0))),
      FACE.teeth,
      false,
    );
    const loGum = edge(lowerRings, s > 0 ? 0 : 1, 1);
    lower.teeth(
      loGum.map((p) => p.clone().add(new Vector3(-s * 0.008, -0.006, 0))),
      loGum.map((p) => p.clone().add(new Vector3(-s * 0.008, 0.04, 0))),
      FACE.teeth,
      true,
    );
  }
  b.part(upper.geometry(), "#ffffff", { texture: HEAD, bone: skull, at: [0, 0, 0], group: "head", name: "upperHead" });
  b.part(lower.geometry(), "#ffffff", { texture: HEAD, bone: jaw, at: [0, 0, 0], group: "jaw", name: "lowerJaw" });

  // Forked tongue lying on the floor of the mouth, out past the snout.
  const tongue: Pt[] = [
    [0, -0.05],
    [0.2, -0.045],
    [0.5, -0.033],
    [0.73, -0.075, "sharp"],
    [0.62, 0],
    [0.73, 0.075, "sharp"],
    [0.5, 0.033],
    [0.2, 0.045],
    [0, 0.05],
  ];
  b.extrude(tongue, {
    at: H(0, -0.03, 0.02),
    bone: jaw,
    x: D(0, 0, 1),
    y: D(1, 0, 0),
    thickness: 0.018,
    color: TONGUE_PAINT,
    group: "jaw",
    name: "tongue",
  });
  // Lower tusks and cheek spurs on the jaw.
  for (const s of [1, -1]) {
    const tuskAt = H(s * 0.05, -0.04, 0.5);
    b.spike(tuskAt, D(s * 0.05, 1, 0.35), 0.1, 0.028, {
      bone: jaw,
      sides: 4,
      color: boneGrad(new Vector3(...tuskAt.toArray()), 0.1),
      group: "jaw",
    });
    const spurAt = H(s * 0.12, -0.11, 0.02);
    b.spike(spurAt, D(s * 0.7, -0.1, -0.7), 0.16, 0.035, {
      bone: jaw,
      sides: 4,
      color: boneGrad(new Vector3(...spurAt.toArray()), 0.16),
      group: "jaw",
    });
  }

  // ---------------------------------------------------------------- eyes: bulbs with pixel-disc decals
  for (const s of [1, -1]) {
    const c = H(s * 0.14, 0.11, 0.2);
    const gaze = D(s * 0.62, 0.25, 0.72);
    b.part(new CylinderGeometry(0.07, 0.1, 0.1, 8), LID, {
      bone: skull,
      at: new Vector3(...c.toArray()).addScaledVector(gaze, 0.03),
      dir: gaze,
      group: "head",
      name: "eyeSocket",
    });
    b.part(new CircleGeometry(0.062, 8), "#ffffff", {
      texture: EYE,
      bone: skull,
      at: new Vector3(...c.toArray()).addScaledVector(gaze, 0.084),
      dir: gaze,
      axis: "z",
      up: [0, 1, 0],
      group: "head",
      name: "eye",
    });
    // Heavy brow horn over each eye.
    const browAt = H(s * 0.12, 0.14, 0.17);
    b.spike(browAt, D(s * 0.55, 0.6, 0.15), 0.2, 0.038, {
      bone: skull,
      sides: 4,
      color: boneGrad(new Vector3(...browAt.toArray()), 0.2),
      group: "head",
    });
  }
  // Nasal horn.
  const noseAt = H(0, 0.06, 0.5);
  b.spike(noseAt, D(0, 1, 0.6), 0.13, 0.032, {
    bone: skull,
    sides: 4,
    color: boneGrad(new Vector3(...noseAt.toArray()), 0.13),
    group: "head",
  });

  // ---------------------------------------------------------------- crown of horns
  const crownLen = [0.22, 0.3, 0.24, 0.34, 0.42, 0.34, 0.24, 0.3, 0.22];
  crownLen.forEach((len, i) => {
    const th = ((-100 + i * 25) * Math.PI) / 180;
    const base = H(Math.sin(th) * 0.135, 0.13, -0.02 - Math.cos(th) * 0.05);
    const dir = D(Math.sin(th) * 0.55, 0.85, -Math.cos(th) * 0.75 + 0.05);
    const tip = base
      .clone()
      .addScaledVector(dir, len)
      .addScaledVector(D(0, 0, -1), len * 0.3);
    const mid = base.clone().addScaledVector(dir, len * 0.55);
    b.sweep(bezier(base, mid, tip), [0.04, 0], {
      bone: skull,
      color: boneGrad(base, len),
      section: { ngon: 5 },
      caps: { start: "flat", end: "point" },
      group: "crown",
      name: `crownHorn${i}`,
    });
  });

  // ---------------------------------------------------------------- frill: a hinged star fan each side
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const fx = new Vector3(s * 0.82, 0.12, -0.56).normalize();
    const fy = new Vector3(0, 1, 0);
    fy.addScaledVector(fx, -fy.dot(fx)).normalize();
    const fanAt = H(s * 0.14, 0.02, -0.04);
    const crest = b.joint(`crest${side}`, { parent: skull, at: fanAt, dir: fx, role: "hinge", group: "crest" });
    const fan = b.extrude(FAN_OUTLINE, {
      at: fanAt,
      bone: crest,
      x: fx,
      y: fy,
      thickness: 0.022,
      color: FRILL,
      group: "crest",
      name: `frill${side}`,
    });
    for (const [i, a] of FAN_ANG.entries())
      b.rod(
        fan.local([0.03 * Math.cos(a), 0.03 * Math.sin(a), 0]),
        fan.local([0.97 * FAN_R[i] * Math.cos(a), 0.97 * FAN_R[i] * Math.sin(a), 0]),
        [0.018, 0.008],
        { bone: crest, color: RIB, section: { ngon: 4 }, caps: { start: "flat", end: "point" }, group: "crest" },
      );
  }

  // ---------------------------------------------------------------- fangs and venom
  for (const s of [1, -1]) {
    for (const [z, len, xr] of [
      [0.5, 0.22, 0.06],
      [0.32, 0.12, 0.09],
    ] as const) {
      const root = H(s * xr, -0.046, z);
      const dn = D(s * 0.03, -1, 0.1);
      const tip = root
        .clone()
        .addScaledVector(dn, len)
        .addScaledVector(D(0, 0, -1), len * 0.12);
      const mid = root
        .clone()
        .addScaledVector(dn, len * 0.5)
        .addScaledVector(D(0, 0, 1), len * 0.04);
      b.sweep(bezier(root, mid, tip), [len * 0.13, 0], {
        bone: skull,
        color: fangPaint(root, len),
        section: { ngon: 5 },
        caps: { start: "flat", end: "point" },
        group: "head",
        name: "fang",
      });
      if (z > 0.4) {
        // A strand of venom from the tip, a hanging drop, and a falling one.
        const end = tip.clone().add(new Vector3(0, -0.1 - (s > 0 ? 0.04 : 0), 0));
        b.rod(tip, end, [0.009, 0.006], {
          bone: skull,
          color: DROP,
          section: { ngon: 4 },
          caps: { start: "flat", end: "flat" },
          group: "head",
          name: "venomStrand",
        });
        const drops: Array<[Vector3, number]> = [
          [end.clone().add(new Vector3(0, -0.05, 0)), 1],
          [end.clone().add(new Vector3(0, -0.25 - (s > 0 ? 0.08 : 0), 0)), 0.7],
        ];
        for (const [at, sc] of drops)
          b.lathe(
            [
              [0, 0.075 * sc],
              [0.03 * sc, 0.01 * sc],
              [0.03 * sc, -0.03 * sc],
              [0, -0.065 * sc],
            ],
            { at, segments: 6, color: DROP, bone: skull, group: "head", name: "venomDrop" },
          );
      }
    }
  }

  // ---------------------------------------------------------------- six legs
  const PAIRS = [
    { n: 1, z: 0.38, parent: spine.joints[3], hint: -0.5 },
    { n: 2, z: -0.02, parent: spine.joints[2], hint: 0.0 },
    { n: 3, z: -0.42, parent: hips, hint: 0.5 },
  ] as const;
  const toeYaw = [-34, 0, 34];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    for (const pair of PAIRS) {
      const tag = `${side}${pair.n}`;
      const group = `leg${tag}`;
      const root: V3 = [s * 0.14, 0.5, pair.z];
      const ankleAt: V3 = [s * 0.62, 0.063, pair.z + 0.05];
      const pts = limb(root, ankleAt, [0.4, 0.42], [s, 0.5, pair.hint]);
      const ball = new Vector3(ankleAt[0], ankleAt[1], ankleAt[2] + 0.07);
      const leg = b.chain(`leg${tag}`, [...pts, ball], {
        parent: pair.parent,
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
        role: "leg",
        contact: [ball.x, 0, ball.z],
        group,
      });
      b.sweep(leg, [0.13, 0.11, 0.09, 0.072, 0.06], {
        color: LEG,
        section: { ngon: 6 },
        caps: { start: "flat", end: "flat" },
        group,
      });
      const ankle = leg.joints[2];
      const knee = leg.joints[1];
      // Haunch or shoulder bulge over the hip.
      b.part(new IcosahedronGeometry(0.2, 0), SKIN, {
        at: [s * 0.22, 0.52, pair.z],
        bone: leg.joints[0],
        scale: [0.85, 1, 1.1],
        group,
        name: "haunch",
      });
      // Bone spur off each knee.
      b.spike(knee, [s, 0.7, pair.hint * 0.6], 0.12, 0.032, {
        sides: 4,
        bone: knee,
        color: boneGrad(new Vector3(...knee.at.toArray()), 0.12),
        group,
      });
      // Three forward toes with claws, and a rear spur.
      toeYaw.forEach((yaw, k) => {
        const a = (yaw * s * Math.PI) / 180;
        const dir = new Vector3(Math.sin(a), 0, Math.cos(a));
        const p0 = ball.clone();
        const p1 = p0
          .clone()
          .addScaledVector(dir, 0.1)
          .add(new Vector3(0, -0.015, 0));
        const p2 = p1
          .clone()
          .addScaledVector(dir, 0.08)
          .add(new Vector3(0, -0.011, 0));
        const toe = b.chain(`toe${k + 1}${tag}`, [p0, p1, p2], {
          parent: ankle,
          names: [`toe${tag}_${k + 1}a`, `toe${tag}_${k + 1}b`],
          role: "digit",
          group,
        });
        b.sweep(toe, [0.06, 0.045, 0.034], {
          color: TOE,
          section: { ngon: 6 },
          caps: { start: "flat", end: "flat" },
          group,
        });
        const tipDir = dir
          .clone()
          .add(new Vector3(0, -0.12, 0))
          .normalize();
        b.spike(frame(p2, tipDir), tipDir, 0.09, 0.034, {
          color: boneGrad(p2, 0.1),
          sides: 4,
          bone: toe.joints[1],
          group,
        });
      });
      const h1 = new Vector3(ankleAt[0], ankleAt[1] + 0.005, ankleAt[2] - 0.02);
      const h2 = h1.clone().add(new Vector3(0, 0, -0.1));
      const hallux = b.chain(`toe4${tag}`, [h1, h2], {
        parent: ankle,
        count: 1,
        names: [`toe${tag}_4`],
        role: "digit",
        group,
      });
      b.sweep(hallux, [0.04, 0.03], { color: TOE, section: { ngon: 6 }, caps: { start: "flat", end: "flat" }, group });
      b.spike(frame(h2, [0, -0.1, -1]), [0, -0.1, -1], 0.08, 0.024, {
        color: boneGrad(h2, 0.08),
        sides: 4,
        bone: hallux.joints[0],
        group,
      });
    }
  }

  // ---------------------------------------------------------------- dorsal spikes, tail tip to nape
  const spikeLen = [
    [-1.45, 0.03],
    [-1.0, 0.06],
    [-0.3, 0.11],
    [0.4, 0.13],
    [0.7, 0.16],
    [1.0, 0.19],
  ] as const;
  let si = 0;
  b.along(
    body,
    34,
    (at) => {
      if (at.at.z > 0.98) return;
      const len = interp(spikeLen, at.at.z);
      const dir = at.n.clone().addScaledVector(at.tangent, -0.6).normalize();
      b.spike(at, dir, len, len * 0.36, { sides: 4, color: si++ % 2 ? SPIKE_A : SPIKE_B, group: "body" });
    },
    { from: 0.02 },
  );

  // Rest pose: jaw hung open so the mouth, fangs and forked tongue read.
  b.pose(jaw, { axis: [1, 0, 0], deg: 20 });
  return b.root;
}
