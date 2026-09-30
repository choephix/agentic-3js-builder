// Shapes over `sweep()` (and `chain()` for sprout). None of these has its own geometry code. Every endpoint is a
// Point input, so a rod can run from an eye to a joint; the tube belongs to the first endpoint's bone.
import { boneFor } from "./context";
import type { Ctx } from "./context";
import { toDirection, toFrame, toPoint } from "./math";
import type { DirectionInput, FrameInput, PointInput } from "./math";
import { catmull, Path, polyline, toPath } from "./path";
import type { PathInput } from "./path";
import { createChain } from "./skeleton";
import type { ChainOptions } from "./skeleton";
import { interpolate, radiusFn, sweep } from "./sweep";
import type { Radius, SweepOptions } from "./sweep";

/** Straight tube with flat ends. `r` = radius or [r0, r1] taper. */
export function rod(
  ctx: Ctx,
  a: PointInput,
  b: PointInput,
  r: number | readonly [number, number],
  options: SweepOptions = {},
) {
  return sweep(ctx, [a, b], r, { caps: "flat", ...options });
}

/** Straight tube with round ends (a tapered capsule when r = [r0, r1]). */
export function capsule(
  ctx: Ctx,
  a: PointInput,
  b: PointInput,
  r: number | readonly [number, number],
  options: SweepOptions = {},
) {
  return sweep(ctx, [a, b], r, { caps: "round", ...options });
}

/**
 * Cone from `base` (radius r) to a point. `len` number: `dirOrTip` is a direction (a frame gives its facing axis,
 * so `spike(hit, hit, len, r)` stands on a surface); `len` null: `dirOrTip` is the tip point.
 */
export function spike(
  ctx: Ctx,
  base: PointInput,
  dirOrTip: PointInput,
  len: number | null,
  r: number,
  options: SweepOptions = {},
) {
  const tip =
    len === null
      ? toPoint(dirOrTip, "spike()")
      : toPoint(base, "spike()").addScaledVector(toDirection(dirOrTip as DirectionInput, "spike()").normalize(), len);
  return sweep(ctx, [base, tip], [r, 0], { caps: { start: "flat", end: "point" }, ...options });
}

/** Box tube from a to b: full width (side) × height (up) going from [w0, h0] to [w1, h1]. Roll from `up`. */
export function frustumBox(
  ctx: Ctx,
  a: PointInput,
  b: PointInput,
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

export type Station = { at: PointInput; w: number; h: number };

/**
 * Smooth body through station centres (catmull), full width/height interpolated between stations.
 * `bone` (a chain, or a list of chains and joints the body runs through) skins it as one mesh bending at each joint.
 */
export function loft(ctx: Ctx, stations: readonly Station[], options: SweepOptions = {}) {
  const path = catmull(stations.map((s) => s.at));
  const ts = path.knots;
  const ws = stations.map((s) => s.w / 2);
  const hs = stations.map((s) => s.h / 2);
  return sweep(ctx, path, (t) => [interpolate(ts, ws, t), interpolate(ts, hs, t)], options);
}

export type SproutOptions = Omit<SweepOptions, "bone" | "extend"> &
  Pick<ChainOptions, "names" | "twist" | "role" | "contact"> & {
    /** Joints along the appendage (default: one per knot span); 0 = no joints, the tube rides on the root's bone. */
    count?: number;
    /** How far the root runs back into the parent volume, along the start tangent (default: the root radius). */
    bury?: number;
  };

/**
 * An appendage (limb, horn, tentacle, neck) rooted on another volume at a frame: a surface hit, a tube point, a
 * part, a joint. `pathOrTip` is a tip point (straight out) or a path (prefixed with the frame's point when it starts
 * elsewhere). The first joint sits at the frame's point, parented to its bone (else the nearest joint); the tube's
 * root continues `bury` back into the parent so it never floats. A single joint takes the sprout's own name.
 */
export function sprout(
  ctx: Ctx,
  name: string,
  on: FrameInput,
  pathOrTip: PathInput | PointInput,
  radius: Radius,
  options: SproutOptions = {},
) {
  const { count, bury, names, role, contact, ...rest } = options;
  const root = toFrame(on);
  const start = root.at;
  const parent = boneFor(ctx, undefined, [root], start);
  const isPath =
    pathOrTip instanceof Path ||
    (Array.isArray(pathOrTip) ? typeof pathOrTip[0] !== "number" : "curve" in (pathOrTip as object));
  const given = isPath
    ? toPath(pathOrTip as PathInput)
    : polyline([start, toPoint(pathOrTip as PointInput, "sprout()")]);
  const path = given.at(0).distanceTo(start) > 1e-6 ? polyline([start, given.at(0)]).concat(given) : given;
  const joints = count ?? path.knots.length - 1;
  const chain =
    count === 0
      ? null
      : createChain(ctx, name, path, {
          parent,
          count,
          names: names ?? (joints === 1 ? [name] : undefined),
          role,
          contact,
          twist: rest.twist,
          up: rest.up,
          group: rest.group,
        });
  const sweepOptions = {
    name,
    ...rest,
    bone: parent,
    extend: [bury ?? Math.max(...radiusFn(radius)(0)), 0] as const,
  };
  return { chain, sweep: sweep(ctx, chain ?? path, radius, sweepOptions) };
}
