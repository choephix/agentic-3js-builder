// Shapes over `sweep()` (and `chain()` for sprout). None of these has its own geometry code.
import type { Ctx } from "./context";
import { offset, vec } from "./math";
import type { V3 } from "./math";
import { catmull, Path, polyline, toPath } from "./path";
import type { PathLike } from "./path";
import { createChain } from "./skeleton";
import type { ChainOptions } from "./skeleton";
import type { Hit } from "./surface";
import { interpolate, radiusFn, sweep } from "./sweep";
import type { Radius, SweepOptions } from "./sweep";

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
 * `bone: chain` splits it into one mesh per joint of that chain (cut where the body passes each joint).
 */
export function loft(ctx: Ctx, stations: readonly Station[], options: SweepOptions = {}) {
  const path = catmull(stations.map((s) => s.at));
  const ts = path.knots;
  const ws = stations.map((s) => s.w / 2);
  const hs = stations.map((s) => s.h / 2);
  const from = options.from ?? 0;
  const to = options.to ?? 1;
  return sweep(
    ctx,
    path,
    (u) => {
      const t = from + u * (to - from);
      return [interpolate(ts, ws, t), interpolate(ts, hs, t)];
    },
    options,
  );
}

export type SproutOptions = Omit<SweepOptions, "bone" | "extend"> &
  Pick<ChainOptions, "names" | "twist"> & {
    /** Joints along the appendage (default: one per knot span); 0 = no joints, the tube rides on `hit.joint`. */
    count?: number;
    /** How far the root runs back into the parent volume, along the start tangent (default: the root radius). */
    bury?: number;
  };

/**
 * An appendage (limb, horn, tentacle, neck) rooted on another volume at a surface hit. `pathOrTip` is a tip point
 * (straight out) or a path / points (prefixed with the hit point when it starts elsewhere). The first joint sits
 * at the hit, parented to `hit.joint`; the tube's root continues `bury` into the parent so it never floats.
 */
export function sprout(
  ctx: Ctx,
  name: string,
  hit: Hit,
  pathOrTip: PathLike | V3,
  radius: Radius,
  options: SproutOptions = {},
) {
  const { count, bury, names, ...rest } = options;
  const tip = !(pathOrTip instanceof Path) && ("isVector3" in pathOrTip || typeof pathOrTip[0] === "number");
  const given = tip ? polyline([hit.p, pathOrTip as V3]) : toPath(pathOrTip as PathLike);
  const path = given.at(0).distanceTo(hit.p) > 1e-6 ? polyline([hit.p, given.at(0)]).concat(given) : given;
  const chain =
    count === 0
      ? null
      : createChain(ctx, name, path, {
          parent: hit.joint,
          count,
          names,
          twist: rest.twist,
          up: rest.up,
          group: rest.group,
        });
  const sweepOptions = {
    name,
    ...rest,
    bone: hit.joint,
    extend: [bury ?? Math.max(...radiusFn(radius)(0)), 0] as const,
  };
  return { chain, sweep: sweep(ctx, chain ?? path, radius, sweepOptions) };
}
