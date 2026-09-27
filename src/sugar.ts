// One-line shapes over `sweep()`. None of these has its own geometry code.
import type { Ctx } from "./context";
import { offset, vec } from "./math";
import type { V3 } from "./math";
import { catmull } from "./path";
import type { Chain } from "./skeleton";
import { interpolate, sweep } from "./sweep";
import type { SweepOptions } from "./sweep";

/** Straight tube with flat ends. `r` = radius or [r0, r1] taper. */
export function rod(ctx: Ctx, a: V3, b: V3, r: number | readonly [number, number], options: SweepOptions = {}) {
  return sweep(ctx, [a, b], r, { caps: "flat", ...options });
}

/** Straight tube with round ends (a tapered capsule when r = [r0, r1]). */
export function capsule(ctx: Ctx, a: V3, b: V3, r: number | readonly [number, number], options: SweepOptions = {}) {
  return sweep(ctx, [a, b], r, { caps: "round", ...options });
}

/** Cone from `base` (radius r) to a point. `len` number: `dirOrTip` is a direction; `len` null: it is the tip. */
export function spike(ctx: Ctx, base: V3, dirOrTip: V3, len: number | null, r: number, options: SweepOptions = {}) {
  const tip = len === null ? vec(dirOrTip) : offset(base, dirOrTip, len);
  return sweep(ctx, [base, tip], [r, 0], { caps: { start: "flat", end: "point" }, ...options });
}

/** Box tube from a to b: full width (side) × height (up) going from [w0, h0] to [w1, h1]. Roll from `up`. */
export function frustumBox(
  ctx: Ctx,
  a: V3,
  b: V3,
  [w0, h0]: readonly [number, number],
  [w1, h1]: readonly [number, number],
  options: SweepOptions = {},
) {
  return sweep(ctx, [a, b], (t) => [(w0 + (w1 - w0) * t) / 2, (h0 + (h1 - h0) * t) / 2], {
    section: "box",
    caps: "flat",
    ...options,
  });
}

export type Station = { at: V3; w: number; h: number };

/**
 * Smooth body through station centres (catmull), full width/height interpolated between stations.
 * `chain`: split into one mesh per joint of that chain (cut where the body passes each joint).
 */
export function loft(ctx: Ctx, stations: readonly Station[], options: SweepOptions & { chain?: Chain } = {}) {
  const { chain, ...rest } = options;
  const path = catmull(stations.map((s) => s.at));
  const ts = path.knots;
  const ws = stations.map((s) => s.w / 2);
  const hs = stations.map((s) => s.h / 2);
  const from = rest.from ?? 0;
  const to = rest.to ?? 1;
  return sweep(
    ctx,
    path,
    (u) => {
      const t = from + u * (to - from);
      return [interpolate(ts, ws, t), interpolate(ts, hs, t)];
    },
    { split: chain, ...rest },
  );
}
