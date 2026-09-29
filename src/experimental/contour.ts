// Contoured sections: a sweep whose cross-section is drawn along its length (see the doc comment below).
import type { Contour } from "../sweep";

/**
 * # Contoured sections
 *
 * `contour(shape)` is a `radius` for `b.sweep` (and `b.sprout`) that draws the cross-section instead of scaling a
 * circle: a torso is deep at the chest and flat at the waist, a thigh is fuller at the front, a calf bulges behind,
 * a foot is a box with a rounded toe. Everything a sweep does still works with it: chains and paths, smooth and rigid
 * skin, `caps`, `extend`, `from`/`to`, `color` functions, `bands`, `sectors`, paints, `shift`, `twist`, `sweep.at`,
 * `sweep.line`, `sweep.curve()` and `b.surface(sweep)`.
 *
 * ```ts
 * import { contour } from "../src/experimental/contour";
 *
 * const thigh = b.sweep(
 *   leg,
 *   contour({
 *     front: [[0, 0.075], [0.3, 0.1], [0.6, 0.075], [1, 0.05]], // quadriceps bulge, then the knee cap
 *     back: [0.07, 0.09, 0.06, 0.045], // hamstring, evenly spaced over t 0..1
 *     side: (t) => 0.085 - 0.04 * t,
 *     round: 0.9,
 *   }),
 *   { from: 0, to: 0.5, color: SKIN, caps: { start: "round", end: "none" } },
 * );
 * ```
 *
 * ## The section
 *
 * At every source t the section is a closed shape around the path point, set by four reaches in meters, measured
 * along the section axes (the axes of a sweep's `[rx, ry]`):
 *
 * - `front`: along +ry, the ring's normal. The normal is where the path's `up` leans: pass `up: [0, 0, 1]` to a
 *   `chain` or path and `front` is the model's +Z along the whole tube (a chest, a shin), `up: [0, 1, 0]` on a foot
 *   path running forward makes `front` the top of the foot and `back` the sole.
 * - `back`: along −ry.
 * - `right` and `left`: along +rx and −rx, the binormal `T × N` (tangent × normal): looking along the path with the
 *   front on top, `right` is on your right. `side` sets both (default for both); `left` and `right` override it.
 * - `round`: the fullness of the corners, 1 = an ellipse, 0.5 = a soft box, 0.2 = a box with softened corners, up
 *   to 2 = pinched into a lens and then a diamond (a shin's crest, a nose ridge). Default 1.
 *
 * The reaches are the built surface: a `front` of 0.1 puts the flat face exactly 0.1 in front of the path (like a
 * circle's `r`). They are not radii around the centre, so `front` ≠ `back` moves the body's visible middle off the
 * bones (a chest in front of the spine) without `shift`. Keep every reach above zero except at a `caps: "point"` tip.
 *
 * ## Keys
 *
 * `front`, `back`, `side`, `left`, `right` and `round` each take, in source t (the `t` of the path or chain, the same
 * t as `sweep.at`, `from`, `to`, colour functions and bands):
 *
 * | Key                 | Reads as                                                                                            |
 * | ------------------- | --------------------------------------------------------------------------------------------------- |
 * | `0.1`               | constant                                                                                            |
 * | `[0.1, 0.12, 0.09]` | evenly spaced over t 0..1, smooth                                                                   |
 * | `[[t, v], ...]`     | keyed at those t, smooth and never overshooting between keys; a ring always stands at every key    |
 * | `(t) => v`          | a function                                                                                          |
 *
 * A key can change slowly (few keys) or over a short distance: `[[0.5, 0.09], [0.53, 0.13]]` is a shelf 3 % of the
 * source long (the lower edge of a chest muscle, a knee cap, the ridge of a heel). Between two keys the value follows
 * a monotone cubic, so a shelf steps up and stays level after; two keys with the same value hold it.
 *
 * ## Options
 *
 * - `sides`: vertices per ring (default 12, rounded to a multiple of 4, at least 8; the sweep's `sides` and `detail`
 *   apply as they do to circles). Two vertices straddle every axis, so the flat faces sit on the reaches.
 * - `smooth`: shade smooth (default) or faceted (a hard box, a low-poly look).
 * - `mirror`: swap `left` and `right`. A chain built for the left side and its mirror image on the right run with the
 *   same `T × N`, so their binormals point to opposite sides of the body; `mirror: s < 0` on the second makes one
 *   description shape both (`right` stays the medial side of a leg, the thumb side of a hand).
 *
 * Rings follow the section: a straight tube whose section is constant has 2, rings are added where the reaches or
 * `round` change and at every keyed t.
 *
 * ```ts
 * b.sweep(spine, contour({ front: [[0, 0.1], [0.55, 0.11], [0.62, 0.15], [1, 0.14]], back: 0.09, side: [0.14, 0.16] }), {
 *   up: [0, 0, 1], // front is +Z
 *   color: SKIN,
 * });
 * b.sweep(footPath, contour({ front: 0.03, back: 0.02, side: [0.035, 0.05, 0.04], round: 0.5 }), { up: [0, 1, 0] });
 * ```
 */
export type ContourKey =
  | number
  | readonly number[]
  | ReadonlyArray<readonly [number, number]>
  | ((t: number) => number);

export type ContourShape = {
  /** Reach along +ry, the section's normal (the way `up` leans): the chest side of a torso. */
  front?: ContourKey;
  /** Reach along −ry. */
  back?: ContourKey;
  /** Reach along ±rx (default for both `left` and `right`). */
  side?: ContourKey;
  /** Reach along −rx. */
  left?: ContourKey;
  /** Reach along +rx, the binormal `T × N`. */
  right?: ContourKey;
  /** 1 = ellipse, 0.5 soft box, 0.2 box with softened corners, up to 2 = lens/diamond. Default 1. */
  round?: ContourKey;
  /** Vertices per ring, a multiple of 4 (default 12). */
  sides?: number;
  /** Smooth shading (default true). */
  smooth?: boolean;
  /** Swap `left` and `right`: the second of a mirrored pair, so one description shapes both sides. */
  mirror?: boolean;
};

/** Monotone cubic (Fritsch-Carlson) through keys sorted by x: smooth, and no overshoot between neighbours. */
function monotone(xs: readonly number[], ys: readonly number[]) {
  const n = xs.length;
  if (n === 1) return () => ys[0];
  const h = xs.slice(1).map((x, i) => x - xs[i]);
  const d = h.map((step, i) => (ys[i + 1] - ys[i]) / step);
  const m = ys.map((_, i) => {
    if (i === 0) return d[0];
    if (i === n - 1) return d[n - 2];
    if (d[i - 1] * d[i] <= 0) return 0;
    const w1 = 2 * h[i] + h[i - 1];
    const w2 = h[i] + 2 * h[i - 1];
    return (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
  });
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let k = 0;
    while (k < n - 2 && xs[k + 1] <= x) k++;
    const s = (x - xs[k]) / h[k];
    const s2 = s * s;
    const s3 = s2 * s;
    return (
      (2 * s3 - 3 * s2 + 1) * ys[k] +
      (s3 - 2 * s2 + s) * h[k] * m[k] +
      (-2 * s3 + 3 * s2) * ys[k + 1] +
      (s3 - s2) * h[k] * m[k + 1]
    );
  };
}

/** A key as a function of source t, plus the source t it is keyed at (pairs only): rings always stand there. */
function keyed(key: ContourKey): { at: (t: number) => number; knots: number[] } {
  if (typeof key === "number") return { at: () => key, knots: [] };
  if (typeof key === "function") return { at: key, knots: [] };
  if (!key.length) throw new Error("contour(): a key needs at least one value");
  if (typeof key[0] === "number") {
    const ys = key as readonly number[];
    return {
      at: monotone(
        ys.map((_, i) => i / Math.max(ys.length - 1, 1)),
        ys,
      ),
      knots: [],
    };
  }
  const pairs = [...(key as ReadonlyArray<readonly [number, number]>)].sort((a, b) => a[0] - b[0]);
  return {
    at: monotone(
      pairs.map((p) => p[0]),
      pairs.map((p) => p[1]),
    ),
    knots: pairs.map((p) => p[0]),
  };
}

/** A contoured section for `b.sweep(source, contour({...}), options)`; see the doc comment above. */
export function contour(shape: ContourShape): Contour {
  const { front, back, side, round = 1 } = shape;
  const [left, right] = shape.mirror ? [shape.right, shape.left] : [shape.left, shape.right];
  const first = front ?? back ?? side ?? left ?? right;
  if (first === undefined) throw new Error("contour(): give at least one of front, back, side, left, right");
  const key = {
    front: keyed(front ?? back ?? first),
    back: keyed(back ?? front ?? first),
    right: keyed(right ?? side ?? front ?? first),
    left: keyed(left ?? side ?? front ?? first),
    round: keyed(round),
  };
  const knots = [...new Set(Object.values(key).flatMap((k) => k.knots.filter((t) => t > 1e-6 && t < 1 - 1e-6)))].sort(
    (a, b) => a - b,
  );
  const reach = (t: number) =>
    [
      Math.max(key.right.at(t), 0),
      Math.max(key.left.at(t), 0),
      Math.max(key.front.at(t), 0),
      Math.max(key.back.at(t), 0),
    ] as const;
  const roundAt = (t: number) => Math.min(Math.max(key.round.at(t), 0.15), 2);
  return {
    sides: shape.sides ?? 12,
    smooth: shape.smooth ?? true,
    knots,
    reach,
    keys: (t) => {
      const r = reach(t);
      return [...r, 0.5 * roundAt(t) * ((r[0] + r[1] + r[2] + r[3]) / 4)];
    },
    polygon: (t, sides) => {
      // A superellipse |x|^e + |y|^e = 1 with e = 2 / round, `sides` vertices from the upper left with two straddling
      // every axis, scaled so the flat faces on the axes sit exactly on the reaches (circumscribed, like a circle).
      const n = Math.max(8, Math.round(sides / 4) * 4);
      const [rr, rl, rf, rb] = reach(t);
      const power = roundAt(t);
      const face = Math.cos(Math.PI / n) ** power;
      return Array.from({ length: n }, (_, k) => {
        const theta = Math.PI / 2 + Math.PI / n + (2 * Math.PI * k) / n;
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const x = (Math.sign(c) * Math.abs(c) ** power) / face;
        const y = (Math.sign(s) * Math.abs(s) ** power) / face;
        return [x * (x > 0 ? rr : rl), y * (y > 0 ? rf : rb)] as [number, number];
      });
    },
  };
}
