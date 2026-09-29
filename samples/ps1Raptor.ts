// PS1 raptor: a feathered velociraptor as a late-90s console game would have modelled it. Everything is chunky and
// faceted: the body is one six-sided prism tube from tail tip to skull with flat shading, the head is two hand-built
// tapered boxes (upper head, lower jaw) whose UVs are unwrapped by hand onto one 64x64 texture, and the toes, fingers
// and claws are four- and six-sided rods. Detail is painted, not modelled: eyes, nostrils, ear holes, cheek stripes,
// the mouth roof, tongue and every tooth live in that one head sheet (teeth are an alpha-cut strip hung from each
// jaw), and the coat is a paint that quantises the model into 1.7 cm cells, picks colours from five-step ramps and
// dithers between the steps with a 4x4 Bayer matrix, so belly, back and rust stripes all come out as hard-pixel
// palette gradients. Feathers are 9x14..9x40 pixel sprites on cards: shingles tinted by the coat, striped flight
// feathers along the arms, plumes down the stiff tail and a fan at its tip.
import { Vector3 } from "three";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, rng } from "../src/math";
import { noise, paint, smoothstep } from "../src/paint";
import { bezier, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import type { Joint } from "../src/skeleton";
import type { Hit } from "../src/surface";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "PS1 raptor",
  description:
    "A feathered velociraptor in late-90s PlayStation style: faceted prism body, a hand-unwrapped 64x64 head sheet with painted eyes and teeth, dithered five-step palette coat and pixel-sprite feathers.",
  builtBy: "Claude Sonnet 5.5",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette. Every colour of the coat, the head sheet and the feathers comes from these ramps.

const GREEN = ["#0f1a14", "#1c2e1f", "#2c4526", "#446030", "#6b7d3b"] as const;
const RUST = ["#2a120c", "#5a2410", "#8f3a16", "#c4601e"] as const;
const CREAM = ["#5a4a30", "#8a7448", "#b89f66", "#dcc98e", "#f0e2b0"] as const;
const SCALY = ["#1c1a12", "#3b3a22", "#5c5a30", "#8a8748"] as const;
const CLAW = "#17110d";

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

// ---------------------------------------------------------------------------------------------------------------
// The coat: a paint that works in 1.7 cm cells so the sheet reads as big square texels on every face.

const CELL = 0.017;

/** The two cell axes of the face `n` points at, and the cell they fall in. */
function cellOf(p: Vector3, n: Vector3) {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const [u, v] = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
  return [Math.floor(u / CELL), Math.floor(v / CELL)] as const;
}

const SKIN = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  const t = bayer(iu, iv);
  const q = new Vector3(
    (Math.floor(p.x / CELL) + 0.5) * CELL,
    (Math.floor(p.y / CELL) + 0.5) * CELL,
    (Math.floor(p.z / CELL) + 0.5) * CELL,
  );
  const speck = hash(iu, iv, Math.round(n.x * 2 + n.y * 5)) < 0.07 ? 0.28 : 0;
  const grain = noise(q, 0.11, 5) - 0.5;
  if (smoothstep(-0.1, 0.4, n.y) < t * 0.9 + 0.05)
    return pick(CREAM, 0.52 + 0.55 * grain - speck * 0.6, bayer(iv + 1, iu + 2));
  const along = q.z + 0.55 * q.y;
  const bar = (((along / 0.1) % 1) + 1) % 1;
  const body = q.z > -1.13 && q.z < 0.36;
  const v = 0.42 + 0.3 * Math.max(n.y, 0) + 0.6 * grain - speck;
  if (body && bar < 0.36 && q.z > -0.95) return pick(RUST, v * 1.05 + 0.1, t);
  if (q.z < -0.95) return pick(GREEN, v - 0.12, t);
  return pick(GREEN, v, t);
});

/** Scaly shins, toes and fingers: little brick-laid scales, dark mortar, dithered light. */
const SCALES = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  const t = bayer(iu, iv);
  const bx = (((iu + 2 * (iv >> 1)) % 3) + 3) % 3;
  const by = iv & 1;
  const v = 0.55 + 0.2 * Math.max(n.y, 0) - (bx === 0 ? 0.42 : 0) - (by ? 0.14 : 0) + (hash(iu, iv, 3) - 0.5) * 0.25;
  return pick(SCALY, v, t);
});
/** Thigh and body coat above the knee, scales below it: the paint switches at a cell boundary, hard. */
const LEG = paint((p) => (p.y < 0.44 ? SCALES : SKIN));

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
/** Where each face of the two head boxes sits on the 64x64 head sheet (pixels, y down). */
const SHEET = 64;
const FACE = {
  upSide: [0, 0, 40, 14],
  upTop: [0, 14, 40, 22],
  upBot: [0, 22, 40, 30],
  loSide: [0, 30, 40, 40],
  loTop: [0, 40, 40, 48],
  loBot: [0, 48, 40, 54],
  teeth: [0, 54, 40, 59],
  upFront: [42, 0, 54, 10],
  upBack: [42, 12, 54, 22],
  loFront: [42, 24, 52, 32],
  loBack: [42, 34, 52, 42],
} as const satisfies Record<string, Rect>;

/** The head sheet: skin, mouth, eye, nostril, ear and the tooth strip, all painted on flat faces. */
function headSheet() {
  return pixelTexture(SHEET, SHEET, (g) => {
    const fill = (r: Rect, fn: (lx: number, ly: number, w: number, h: number) => string) => {
      for (let y = r[1]; y < r[3]; y++)
        for (let x = r[0]; x < r[2]; x++) g[y][x] = fn(x - r[0], y - r[1], r[2] - r[0], r[3] - r[1]);
    };
    const put = (r: Rect, lx: number, ly: number, c: string) => {
      if (r[0] + lx < r[2] && r[1] + ly < r[3]) g[r[1] + ly][r[0] + lx] = c;
    };
    const noiseAt = (x: number, y: number, s: number) => hash(Math.floor(x / 2), Math.floor(y / 2), s);

    // Upper side: green cap fading to a cream lip, rust cheek stripes, dark lip line, then the eye and nostril.
    fill(FACE.upSide, (lx, ly) => {
      const t = bayer(lx, ly);
      if (ly === 13) return RUST[0];
      const edge = 9 + (t - 0.5) * 2.2;
      if (ly >= edge) return pick(CREAM, 0.55 + (ly - 9) * 0.07 + (noiseAt(lx, ly, 1) - 0.5) * 0.25, t);
      const v = 0.2 + ly * 0.04 + (noiseAt(lx, ly, 2) - 0.5) * 0.3 + (lx > 30 ? 0.1 : 0);
      if (lx > 15 && (lx * 2 + ly * 3) % 13 < 3) return pick(RUST, v + 0.35, t);
      return pick(GREEN, v, t);
    });
    for (let x = 8; x <= 16; x++) put(FACE.upSide, x, 2, x % 2 ? RUST[2] : RUST[1]); // brow ridge
    for (let y = 3; y <= 7; y++) for (let x = 9; x <= 15; x++) put(FACE.upSide, x, y, "#0a0806"); // eye socket
    for (let y = 4; y <= 6; y++) for (let x = 10; x <= 14; x++) put(FACE.upSide, x, y, y === 5 ? "#f2c21a" : "#c98a12"); // iris
    for (let y = 4; y <= 6; y++) put(FACE.upSide, 12, y, "#050403"); // slit pupil
    put(FACE.upSide, 10, 4, "#fff3b0"); // glint
    put(FACE.upSide, 34, 5, "#0a0806"); // nostril
    put(FACE.upSide, 35, 5, "#0a0806");
    put(FACE.upSide, 34, 6, RUST[1]);
    put(FACE.upSide, 5, 6, "#0a0806"); // ear hole
    put(FACE.upSide, 5, 7, "#0a0806");
    put(FACE.upSide, 4, 6, RUST[1]);
    for (let x = 18; x < 40; x++) put(FACE.upSide, x, 12, x % 2 ? CREAM[1] : CREAM[2]); // gum line

    // Upper top: dark cap, rust dorsal streak, the two nostrils on the snout.
    fill(FACE.upTop, (lx, ly) => {
      const t = bayer(lx, ly);
      const centre = 1 - Math.abs(ly - 3.5) / 3.5;
      const v = 0.22 + 0.16 * centre + (noiseAt(lx, ly, 3) - 0.5) * 0.3;
      if (lx > 6 && Math.abs(ly - 3.5) < 1.2 && lx % 6 < 4) return pick(RUST, v + 0.4, t);
      return pick(GREEN, v, t);
    });
    for (const y of [1, 6]) for (const x of [34, 35]) put(FACE.upTop, x, y, "#0a0806");

    // Upper bottom: the roof of the mouth, gum-pink with ridges.
    fill(FACE.upBot, (lx, ly) => {
      const t = bayer(lx, ly);
      const edge = ly === 0 || ly === 7;
      if (edge) return "#d08a80";
      const ridge = lx % 5 === 2 ? -0.16 : 0;
      return pick(["#4a1c1c", "#8a3a3a", "#b05a55", "#d08a80"], 0.5 + ridge + (noiseAt(lx, ly, 4) - 0.5) * 0.2, t);
    });
    fill(FACE.upFront, (lx, ly) => pick(GREEN, 0.22 + ly * 0.03 + (noiseAt(lx, ly, 5) - 0.5) * 0.3, bayer(lx, ly)));
    for (const x of [3, 8]) put(FACE.upFront, x, 6, "#0a0806");
    fill(FACE.upBack, () => GREEN[0]);

    // Lower side: green over cream, a rust stripe run, dark lip line above the tooth line.
    fill(FACE.loSide, (lx, ly) => {
      const t = bayer(lx, ly);
      if (ly === 0) return RUST[0];
      const edge = 4 + (t - 0.5) * 2.2;
      if (ly >= edge) return pick(CREAM, 0.5 + (ly - 4) * 0.08 + (noiseAt(lx, ly, 6) - 0.5) * 0.25, t);
      const v = 0.32 + ly * 0.04 + (noiseAt(lx, ly, 7) - 0.5) * 0.3;
      if (lx > 12 && (lx * 2 + ly * 3) % 13 < 3) return pick(RUST, v + 0.3, t);
      return pick(GREEN, v, t);
    });
    // Lower top: mouth floor with a pink tongue down the middle.
    fill(FACE.loTop, (lx, ly) => {
      const t = bayer(lx, ly);
      const tongue = Math.abs(ly - 3.5) < 2.2 && lx > 4 && lx < 34;
      if (tongue)
        return pick(
          ["#6a2020", "#a03a3a", "#c85a58", "#e08a80"],
          0.6 - Math.abs(ly - 3.5) * 0.08 + (noiseAt(lx, ly, 8) - 0.5) * 0.2,
          t,
        );
      return pick(["#2a0c0c", "#4a1c1c", "#7a3232"], 0.45 + (noiseAt(lx, ly, 9) - 0.5) * 0.3, t);
    });
    fill(FACE.loBot, (lx, ly) =>
      pick(CREAM, 0.6 + (noiseAt(lx, ly, 10) - 0.5) * 0.4 - (ly > 4 ? 0.08 : 0), bayer(lx, ly)),
    );
    fill(FACE.loFront, (lx, ly) => pick(CREAM, 0.55 + (noiseAt(lx, ly, 11) - 0.5) * 0.3, bayer(lx, ly)));
    fill(FACE.loBack, () => "#2a0c0c");

    // Teeth: a gum row and eight triangles, four to one pixel wide; transparent everywhere else.
    const heights = [4, 3, 4, 4, 3, 4, 3, 4];
    fill(FACE.teeth, (lx, ly) => {
      if (ly === 0) return "#c87a78";
      const tooth = Math.floor(lx / 5);
      const h = heights[tooth] ?? 3;
      const c = lx % 5;
      const half = Math.max(0, (h - ly) / h) * 2;
      if (ly > h) return "";
      const d = Math.abs(c - 1.5);
      if (d > half + 0.01) return "";
      return c >= 2 ? "#c9b98a" : "#f0e6c0";
    });
  });
}

/** A tinted body-feather sprite: lancet with a rachis and diagonal barbs, in greys (the coat paint tints it). */
function bodyFeather() {
  const widths = [1, 3, 5, 5, 7, 7, 7, 7, 7, 7, 5, 5, 3, 3];
  return pixelTexture(7, 14, (g) => {
    widths.forEach((w, y) => {
      for (let k = 0; k < w; k++) {
        const x = 3 - (w - 1) / 2 + k;
        const edge = k === 0 || k === w - 1;
        g[y][x] = x === 3 ? "#9a9a9a" : edge ? "#b4b4b4" : (x + y) % 3 === 0 ? "#d4d4d4" : "#f2f2f2";
      }
    });
  });
}

/** A flight feather: dark green vane, cream shaft, two dithered rust bars and a pale tip. */
function flightFeather() {
  const H = 40;
  return pixelTexture(9, H, (g) => {
    for (let y = 0; y < H; y++) {
      const w = y < 2 ? 1 + y * 2 : y < 8 ? 5 + (y > 5 ? 2 : 0) : y > 34 ? 5 - (y - 34) : 7;
      const wide = Math.min(w, 7);
      for (let k = 0; k < wide; k++) {
        const x = 4 - (wide - 1) / 2 + k;
        const t = bayer(x, y);
        let c: string = (x + y) % 3 === 0 ? GREEN[1] : GREEN[2];
        if (y >= 17 && y < 22) c = y === 17 || y === 21 ? (t > 0.5 ? RUST[2] : c) : RUST[2];
        if (y >= 27 && y < 30) c = y === 27 ? (t > 0.5 ? RUST[3] : c) : RUST[3];
        if (y < 6) c = y > 4 ? (t > 0.5 ? CREAM[3] : c) : CREAM[4];
        if (x === 4) c = CREAM[3];
        else if (k === 0 || k === wide - 1) c = y < 6 ? CREAM[2] : GREEN[0];
        g[y][x] = c;
      }
    }
  });
}

/** A tail plume: rust with dark bars, dithered edges, cream tip. */
function tailFeather() {
  const H = 36;
  return pixelTexture(9, H, (g) => {
    for (let y = 0; y < H; y++) {
      const w = y < 2 ? 1 + y * 2 : y < 6 ? 5 + (y > 3 ? 2 : 0) : y > 31 ? 5 - (y - 31) : 7;
      const wide = Math.min(w, 7);
      for (let k = 0; k < wide; k++) {
        const x = 4 - (wide - 1) / 2 + k;
        const t = bayer(x, y);
        const band = (y + 3) % 9;
        let c: string = (x + y) % 3 === 0 ? RUST[2] : RUST[3];
        if (band < 3) c = band === 0 ? (t > 0.5 ? RUST[0] : c) : RUST[0];
        if (y < 5) c = y > 3 ? (t > 0.5 ? CREAM[3] : c) : CREAM[4];
        if (x === 4) c = CREAM[3];
        else if (k === 0 || k === wide - 1) c = y < 5 ? CREAM[2] : RUST[1];
        g[y][x] = c;
      }
    }
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

/** Piecewise-linear lookup through sorted `[x, y]` keys. */
function interp(keys: readonly (readonly [number, number])[], x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++)
    if (x <= keys[i][0])
      return keys[i - 1][1] + ((keys[i][1] - keys[i - 1][1]) * (x - keys[i - 1][0])) / (keys[i][0] - keys[i - 1][0]);
  return keys[keys.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "ps1Raptor", paintSize: 512 });
  const random = rng(19);

  const HEAD = headSheet();
  const BODY_F = bodyFeather();
  const FLIGHT_F = flightFeather();
  const TAIL_F = tailFeather();

  // ---------------------------------------------------------------- spine, neck, tail: one prism tube
  const DY = -0.05; // the whole animal sits this much lower than it was first drawn
  const stations: V3[] = (
    [
      [0, 0.64, -1.0],
      [0, 0.652, -0.76],
      [0, 0.662, -0.42],
      [0, 0.66, -0.05],
      [0, 0.68, 0.14],
      [0, 0.72, 0.3],
      [0, 0.82, 0.42],
      [0, 0.97, 0.49],
      [0, 1.06, 0.6],
    ] as V3[]
  ).map(([x, y, z]): V3 => [x, y + DY, z]);
  const curve = catmull(stations);
  const hipsT = curve.closestT(stations[3]);
  const neckT = curve.closestT(stations[6]);
  const hips = b.joint("hips", { at: stations[3], role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, neckT), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", curve.slice(neckT, 1), {
    parent: spine.joints[2],
    count: 4,
    names: ["neck1", "neck2", "neck3", "neck4"],
    role: "neck",
    group: "neck",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), {
    parent: hips,
    count: 7,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7"],
    role: "tail",
    group: "tail",
  });
  const zAt = (t: number) => curve.at(t).z;
  const rxKeys = [
    [-1.0, 0.016],
    [-0.8, 0.03],
    [-0.55, 0.05],
    [-0.3, 0.075],
    [-0.1, 0.097],
    [0.1, 0.105],
    [0.28, 0.1],
    [0.4, 0.068],
    [0.49, 0.052],
    [0.6, 0.044],
  ] as const;
  const ryKeys = [
    [-1.0, 0.016],
    [-0.8, 0.03],
    [-0.55, 0.052],
    [-0.3, 0.08],
    [-0.1, 0.105],
    [0.1, 0.115],
    [0.28, 0.108],
    [0.4, 0.076],
    [0.49, 0.06],
    [0.6, 0.052],
  ] as const;
  const body = b.sweep(curve, (t) => [interp(rxKeys, zAt(t)), interp(ryKeys, zAt(t))], {
    bone: [tail, hips, spine, neck],
    color: SKIN,
    section: { ngon: 6 },
    caps: { start: "point", end: "flat" },
    group: "body",
  });

  // ---------------------------------------------------------------- head: two unwrapped boxes
  const headDir: V3 = [0, -0.14, 1];
  const skull = b.joint("head", { parent: neck.joints[3], at: curve.at(1), dir: headDir, role: "head", group: "head" });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  const H = (x: number, y: number, z: number) => head.p([x, y, z]);
  const ring = (z: number, wT: number, yT: number, wB: number, yB: number) => [
    H(wT, yT, z),
    H(-wT, yT, z),
    H(-wB, yB, z),
    H(wB, yB, z),
  ];

  const jaw = b.joint("jaw", {
    parent: skull,
    at: H(0, -0.035, 0.0),
    aim: H(0, -0.03, 0.33),
    role: "jaw",
    group: "jaw",
  });

  const upperRings = [
    ring(-0.03, 0.052, 0.058, 0.048, -0.048),
    ring(0.09, 0.06, 0.064, 0.05, -0.036),
    ring(0.17, 0.036, 0.04, 0.034, -0.028),
    ring(0.34, 0.02, 0.022, 0.02, -0.016),
  ];
  const lowerRings = [
    ring(0.005, 0.045, -0.03, 0.038, -0.062),
    ring(0.1, 0.042, -0.033, 0.032, -0.058),
    ring(0.2, 0.028, -0.026, 0.022, -0.044),
    ring(0.335, 0.017, -0.016, 0.014, -0.03),
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
  // Teeth hang from the bottom edge of the upper head and stand on the top edge of the lower jaw, both sides.
  for (const s of [1, -1]) {
    const edge = (rings: (readonly Vector3[])[], k: number, from: number) => rings.slice(from).map((r) => r[k]);
    const upGum = edge(upperRings, s > 0 ? 3 : 2, 1);
    const upTips = upGum.map((p) => p.clone().addScaledVector(new Vector3(0, -1, 0), 0.03));
    upper.teeth(
      upGum.map((p) => p.clone().addScaledVector(new Vector3(0, 1, 0), 0.006)),
      upTips,
      FACE.teeth,
      false,
    );
    const loGum = edge(lowerRings, s > 0 ? 0 : 1, 1);
    lower.teeth(
      loGum.map((p) => p.clone().add(new Vector3(-s * 0.006, -0.004, 0))),
      loGum.map((p) => p.clone().add(new Vector3(-s * 0.006, 0.026, 0))),
      FACE.teeth,
      true,
    );
  }
  b.part(upper.geometry(), "#ffffff", { texture: HEAD, bone: skull, at: [0, 0, 0], group: "head", name: "upperHead" });
  b.part(lower.geometry(), "#ffffff", { texture: HEAD, bone: jaw, at: [0, 0, 0], group: "jaw", name: "lowerJaw" });

  // ---------------------------------------------------------------- hind legs and feet
  const legTubes: Sweep[] = [];
  const toeKit: Array<{ s: number; ball: Vector3; ankle: Joint; side: string }> = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const points = limb(
      [s * 0.12, 0.61 + DY, -0.06],
      [s * 0.13, 0.04, 0.05],
      [0.25, 0.27, 0.24],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${side}`, points, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [points[3].x, 0, points[3].z + 0.08],
      group: `leg${side}`,
    });
    const midThigh = (leg.ts[0] + leg.ts[1]) / 2;
    const keys = [
      [leg.ts[0], 0.078],
      [midThigh, 0.098],
      [leg.ts[1], 0.06],
      [leg.ts[2], 0.042],
      [1, 0.038],
    ] as const;
    legTubes.push(
      b.sweep(leg, (t) => interp(keys, t), {
        color: LEG,
        section: { ngon: 6 },
        caps: { start: "flat", end: "flat" },
        group: `leg${side}`,
      }),
    );
    toeKit.push({ s, ball: points[3].clone(), ankle: leg.joints[2], side });
  }

  for (const { s, ball, ankle, side } of toeKit) {
    const group = `foot${side}`;
    // Three forward toes; the middle one straight, the outer one splayed, the inner one the raised sickle toe.
    const toes = [
      { n: 3, yaw: 0, len: [0.1, 0.085], r: 0.03 },
      { n: 4, yaw: s * 24, len: [0.085, 0.07], r: 0.027 },
    ] as const;
    for (const toe of toes) {
      const a = (toe.yaw * Math.PI) / 180;
      const dir = new Vector3(Math.sin(a), 0, Math.cos(a));
      const p0 = ball.clone();
      const p1 = p0
        .clone()
        .addScaledVector(dir, toe.len[0])
        .add(new Vector3(0, -0.008, 0));
      const p2 = p1
        .clone()
        .addScaledVector(dir, toe.len[1])
        .add(new Vector3(0, -0.006, 0));
      const chain = b.chain(`toe${toe.n}${side}`, [p0, p1, p2], {
        parent: ankle,
        names: [`toe${toe.n}a${side}`, `toe${toe.n}b${side}`],
        role: "digit",
        group,
      });
      b.sweep(chain, [toe.r, toe.r * 0.55], {
        color: SCALES,
        section: { ngon: 6 },
        caps: { start: "flat", end: "flat" },
        group,
      });
      const tipDir = dir
        .clone()
        .add(new Vector3(0, -0.45, 0))
        .normalize();
      b.spike(frame(p2, tipDir), tipDir, 0.06, toe.r * 0.55, { color: CLAW, sides: 4, bone: chain.joints[1], group });
    }
    // Sickle toe: two short rods angled up and forward, and the big curved claw.
    const q0 = ball.clone().add(new Vector3(-s * 0.02, 0.0, 0.0));
    const q1 = q0.clone().add(new Vector3(-s * 0.01, 0.035, 0.05));
    const q2 = q1.clone().add(new Vector3(-s * 0.005, 0.04, 0.035));
    const sickleChain = b.chain(`toe2${side}`, [q0, q1, q2], {
      parent: ankle,
      names: [`toe2a${side}`, `toe2b${side}`],
      role: "digit",
      group,
    });
    b.sweep(sickleChain, [0.028, 0.018], {
      color: SCALES,
      section: { ngon: 6 },
      caps: { start: "flat", end: "flat" },
      group,
    });
    b.sweep(
      bezier(
        q2,
        q2.clone().add(new Vector3(0, 0.07, 0.05)),
        q2.clone().add(new Vector3(0, 0.1, 0.11)),
        q2.clone().add(new Vector3(0, 0.05, 0.19)),
      ),
      [0.019, 0],
      { color: CLAW, section: { ngon: 4 }, caps: { start: "flat", end: "point" }, bone: sickleChain.joints[1], group },
    );
    // Hallux: a small spur on the back of the foot.
    const h0 = ball.clone().add(new Vector3(0, 0.13, 0));
    const hallux = b.chain(`toe1${side}`, [h0, h0.clone().add(new Vector3(0, -0.02, -0.06))], {
      parent: ankle,
      count: 1,
      names: [`toe1${side}`],
      role: "digit",
      group,
    });
    b.sweep(hallux, [0.014, 0.008], {
      color: SCALES,
      section: { ngon: 4 },
      caps: { start: "flat", end: "flat" },
      group,
    });
    b.spike(frame(h0.clone().add(new Vector3(0, -0.02, -0.06)), [0, -0.5, -1]), [0, -0.5, -1], 0.04, 0.008, {
      color: CLAW,
      sides: 4,
      bone: hallux.joints[0],
      group,
    });
  }

  // ---------------------------------------------------------------- arms and hands
  const armPaths: Record<string, Vector3[]> = {};
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const S = new Vector3(s * 0.095, 0.66 + DY, 0.26);
    const E = new Vector3(s * 0.165, 0.565 + DY, 0.2);
    const W = new Vector3(s * 0.24, 0.555 + DY, 0.35);
    const P = new Vector3(s * 0.26, 0.545 + DY, 0.44);
    armPaths[side] = [S, E, W, P];
    const arm = b.chain(`arm${side}`, [S, E, W, P], {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    b.sweep(arm, [0.046, 0.034, 0.03, 0.024], {
      color: LEG,
      section: { ngon: 6 },
      caps: { start: "flat", end: "flat" },
      group: `arm${side}`,
    });
    const fingers = [
      { n: 1, dx: -0.3, dy: 0.12, len: [0.05, 0.045] },
      { n: 2, dx: 0.02, dy: -0.03, len: [0.058, 0.05] },
      { n: 3, dx: 0.32, dy: -0.2, len: [0.048, 0.04] },
    ] as const;
    for (const f of fingers) {
      const dir = new Vector3(s * f.dx, f.dy, 1).normalize();
      const f0 = P.clone().add(new Vector3(s * f.dx * 0.05, f.dy * 0.05, 0));
      const f1 = f0.clone().addScaledVector(dir, f.len[0]);
      const f2 = f1.clone().addScaledVector(dir, f.len[1]);
      const chain = b.chain(`finger${f.n}${side}`, [f0, f1, f2], {
        parent: arm.joints[2],
        names: [`finger${f.n}a${side}`, `finger${f.n}b${side}`],
        role: "digit",
        group: `arm${side}`,
      });
      b.sweep(chain, [0.014, 0.008], {
        color: SCALES,
        section: { ngon: 4 },
        caps: { start: "flat", end: "flat" },
        group: `arm${side}`,
      });
      const tipDir = dir
        .clone()
        .add(new Vector3(0, -0.55, 0))
        .normalize();
      b.spike(frame(f2, tipDir), tipDir, 0.05, 0.009, {
        color: CLAW,
        sides: 4,
        bone: chain.joints[1],
        group: `arm${side}`,
      });
    }
  }

  // ---------------------------------------------------------------- feathers
  // Body shingles, tinted by the coat so its stripes carry on, over the neck, back, shoulders and tail root.
  const shell = b.surface(body);
  const shingles = shell.scatter(340, {
    rng: random,
    minDist: 0.036,
    filter: (h: Hit) => h.n.y > -0.25 && h.at.z > -0.7 && !(h.at.z > 0.5 && h.n.z > 0.5),
  });
  b.cards(shingles, BODY_F, {
    size: [0.044, 0.075],
    lean: 70,
    vary: 0.2,
    spin: 14,
    rng: rng(3),
    color: SKIN,
    group: "feathers",
    name: "bodyFeathers",
  });
  // Feather trousers hanging off the back of each thigh.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const thigh = b.surface(legTubes[side === "L" ? 0 : 1]);
    const hits = thigh.scatter(30, {
      rng: random,
      minDist: 0.04,
      filter: (h: Hit) => h.at.y > 0.46 && h.n.z < 0.2 && h.n.y > -0.4,
    });
    b.cards(hits, BODY_F, {
      size: [0.055, 0.12],
      lean: 50,
      flow: [0, -1, -0.5],
      vary: 0.2,
      rng: rng(5 + s),
      color: SKIN,
      group: "feathers",
      name: `trousers${side}`,
    });
  }
  // Flight feathers along the trailing edge of each arm, longest at the hand.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const path = polyline(armPaths[side]);
    const frames: Frame[] = [];
    const N = 8;
    for (let i = 0; i < N; i++) {
      const t = 0.3 + (0.7 * i) / (N - 1);
      const p = path.at(t).add(new Vector3(0, 0.006, -0.012));
      const a = ((14 + 30 * t) * Math.PI) / 180;
      frames.push(frame(p, [s * Math.sin(a), -0.06, -Math.cos(a)]));
    }
    b.cards(frames, FLIGHT_F, {
      size: [0.05, 0.11],
      flow: [0, -1, 0],
      lean: 10,
      vary: 0.12,
      rng: rng(11 + s),
      group: "feathers",
      name: `flight${side}`,
    });
    b.cards(
      frames.slice(1).map((f) => frame(f.at.clone().add(new Vector3(0, 0.014, 0.02)), f.axis)),
      BODY_F,
      {
        size: [0.05, 0.075],
        flow: [0, -1, 0],
        lean: 14,
        rng: rng(13),
        color: SKIN,
        group: "feathers",
        name: `coverts${side}`,
      },
    );
  }
  // Tail: a row of plumes down each side of the stiff tail, and a fan at the tip.
  const tailFrames: Frame[] = [];
  const M = 8;
  for (const s of [1, -1])
    for (let i = 0; i < M; i++) {
      const z = -0.3 - (0.62 * i) / (M - 1);
      const c = curve.at(curve.closestT([0, 0.65, z]));
      const r = interp(rxKeys, z);
      tailFrames.push(frame([s * r * 0.8, c.y, z], [s * 0.4, 0, -1]));
    }
  b.cards(tailFrames, TAIL_F, {
    size: [0.05, 0.14],
    flow: [0, -1, 0],
    lean: 6,
    vary: 0.1,
    rng: rng(17),
    group: "feathers",
    name: "tailPlumes",
  });
  const fan: Frame[] = [];
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) * 10 * Math.PI) / 180;
    fan.push(frame([0, 0.641 + DY, -0.99], [Math.sin(a), i % 2 ? 0.05 : 0.0, -Math.cos(a)]));
  }
  b.cards(fan, TAIL_F, {
    size: [0.065, 0.24],
    flow: [0, -1, 0],
    lean: 4,
    vary: 0.08,
    rng: rng(23),
    group: "feathers",
    name: "tailFan",
  });
  // A short crest of feathers on the back of the skull.
  const crest: Frame[] = [];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.018;
    crest.push(frame(H(x, 0.06, 0.0), head.d([x * 5, 0.7, -0.6])));
  }
  b.cards(crest, BODY_F, {
    size: [0.045, 0.1],
    flow: [0, 0, -1],
    lean: 20,
    vary: 0.15,
    rng: rng(29),
    color: SKIN,
    group: "feathers",
    name: "crest",
  });

  // Rest pose: the jaw a little open.
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  return b.root;
}
