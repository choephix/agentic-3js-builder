// `extrude()` and `lathe()`: a flat 2D outline, drawn point by point, pushed into a slab or spun into a solid.
// Outlines always close, can be corner-cut smooth with "sharp" corners kept, and throw on a loop that crosses itself.
// Extrudes taper across the outline's height and take a bevel that shrinks itself until it fits.
import { Matrix4, Quaternion, ShapeUtils, Vector2, Vector3 } from "three";
import { meshFromWorld, weightsFor } from "./context";
import type { Ctx, Fill, JointRef, Tags } from "./context";
import { aim, DEG, toDirection, toPoint } from "./math";
import type { DirectionInput, PointInput } from "./math";
import { Part } from "./parts";

/** An outline corner `[x, y]` in meters; `[x, y, "sharp"]` keeps that corner pointed through smoothing. */
export type OutlinePoint = readonly [number, number] | readonly [number, number, "sharp"];

type Vec2 = [number, number];

export type ExtrudeOptions = Tags & {
  color: Fill;
  /** Outline origin in model space. Default bone: `at`'s bones when it came from something built, else the nearest joint. */
  at: PointInput;
  /** Model-space direction of the outline's +x (default [0, 0, 1], forward: a side-view drawing). */
  x?: DirectionInput;
  /** Model-space direction of the outline's +y, made square to `x` (default [0, 1, 0], up). */
  y?: DirectionInput;
  /**
   * Total thickness, centred on the outline's plane. `[atLowest, atHighest]` tapers linearly from the outline's
   * lowest y to its highest y; either end may be 0 for a knife edge.
   */
  thickness: number | readonly [number, number];
  /**
   * Rounds the front and back rims inward by this much; shrinks itself to fit the outline and half the thickness.
   * Drawn in 3 × `detail` steps (at least 1, a plain chamfer).
   */
  bevel?: number;
  /** Corner-cutting rounds, 0 to 3 (default 0). Each round cuts every corner not marked "sharp". */
  smoothing?: number;
  bone?: JointRef;
  /** This part's own tessellation multiplier for its bevel steps (default: the builder's `detail`). */
  detail?: number;
};

export type LatheOptions = Tags & {
  color: Fill;
  /** Where the outline's origin sits on the axis. Default bone: as for `extrude`. */
  at: PointInput;
  /** Model-space spin axis, the outline's +y (default [0, 1, 0], up). */
  axis?: DirectionInput;
  /** Steps around the axis, 3 to 64 (default 12 × `detail`). Below 12 the sides shade flat: 6 is a hex column. */
  segments?: number;
  /** This part's own tessellation multiplier for its default `segments` (default: the builder's `detail`). */
  detail?: number;
  /** Degrees about the axis for the first step, to turn the flats of a low-segment lathe. */
  spin?: number;
  /** Corner-cutting rounds, 0 to 3 (default 0). */
  smoothing?: number;
  bone?: JointRef;
};

const MAX_SMOOTHING = 3;
const MAX_CORNERS = 512;
const MIN_EDGE = 1e-5;
const BEVEL_STEPS = 3;
const SMOOTH_LATHE_SEGMENTS = 12;
/** Profile corners turning less than this shade smooth on a lathe. */
const LATHE_CREASE_DEG = 35;

const dist = (a: Vec2, b: Vec2) => Math.hypot(b[0] - a[0], b[1] - a[1]);

function orient(a: Vec2, b: Vec2, c: Vec2) {
  const v = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  return Math.abs(v) <= 1e-14 ? 0 : Math.sign(v);
}

function within(a: Vec2, b: Vec2, c: Vec2) {
  return (
    Math.min(a[0], b[0]) <= c[0] &&
    c[0] <= Math.max(a[0], b[0]) &&
    Math.min(a[1], b[1]) <= c[1] &&
    c[1] <= Math.max(a[1], b[1])
  );
}

/** Crossing, touching and collinear overlap all count. */
function meet(a: Vec2, b: Vec2, c: Vec2, d: Vec2) {
  const [o1, o2, o3, o4] = [orient(a, b, c), orient(a, b, d), orient(c, d, a), orient(c, d, b)];
  if (o1 * o2 < 0 && o3 * o4 < 0) return true;
  return (
    (o1 === 0 && within(a, b, c)) ||
    (o2 === 0 && within(a, b, d)) ||
    (o3 === 0 && within(c, d, a)) ||
    (o4 === 0 && within(c, d, b))
  );
}

/** The first two edges (by start index) that meet anywhere but their shared corner, or undefined. */
function crossing(points: readonly Vec2[]): [number, number] | undefined {
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const [a, b, c] = [points[i], points[(i + 1) % n], points[(i + 2) % n]];
    // An edge that doubles straight back over the previous one.
    if (orient(a, b, c) === 0 && (c[0] - b[0]) * (a[0] - b[0]) + (c[1] - b[1]) * (a[1] - b[1]) > 0)
      return [i, (i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (meet(a, b, points[j], points[(j + 1) % n])) return [i, j];
    }
  }
  return undefined;
}

function area(points: readonly Vec2[]) {
  let doubled = 0;
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    doubled += a[0] * b[1] - b[0] * a[1];
  });
  return doubled / 2;
}

type Outline = { points: Vec2[]; minY: number; maxY: number };

/** Closed, checked, smoothed and counter-clockwise; throws with the authored point numbers when it can't be built. */
function prepare(call: string, authored: readonly OutlinePoint[], smoothing = 0): Outline {
  if (!Number.isInteger(smoothing) || smoothing < 0 || smoothing > MAX_SMOOTHING)
    throw new Error(`${call}: smoothing is a whole number from 0 to ${MAX_SMOOTHING}, got ${smoothing}`);
  let points = authored.map((p): Vec2 => [p[0], p[1]]);
  let sharp = authored.map((p) => p[2] === "sharp");
  if (points.length > 1 && dist(points[0], points[points.length - 1]) < MIN_EDGE) {
    points = points.slice(0, -1);
    sharp = sharp.slice(0, -1);
  }
  if (points.length < 3) throw new Error(`${call}: an outline needs at least 3 distinct points`);
  points.forEach((p, i) => {
    const j = (i + 1) % points.length;
    if (dist(p, points[j]) < MIN_EDGE) throw new Error(`${call}: points ${i} and ${j} are the same spot`);
  });
  const hit = crossing(points);
  if (hit) {
    const [a, b] = hit.map((i) => `${i}→${(i + 1) % points.length}`);
    throw new Error(`${call}: the outline crosses itself: edge ${a} meets edge ${b}`);
  }
  if (Math.abs(area(points)) < MIN_EDGE * MIN_EDGE) throw new Error(`${call}: the outline encloses no area`);

  let loop = { points, sharp, sources: points.map((_, i) => i) };
  for (let round = 0; round < smoothing; round++) {
    const next = { points: [] as Vec2[], sharp: [] as boolean[], sources: [] as number[] };
    const n = loop.points.length;
    loop.points.forEach((c, i) => {
      if (loop.sharp[i]) {
        next.points.push(c);
        next.sharp.push(true);
        next.sources.push(loop.sources[i]);
        return;
      }
      for (const nb of [loop.points[(i + n - 1) % n], loop.points[(i + 1) % n]]) {
        next.points.push([c[0] + (nb[0] - c[0]) * 0.25, c[1] + (nb[1] - c[1]) * 0.25]);
        next.sharp.push(false);
        next.sources.push(loop.sources[i]);
      }
    });
    loop = next;
  }
  if (loop.points.length > MAX_CORNERS)
    throw new Error(`${call}: smoothing grows the outline to ${loop.points.length} corners (limit ${MAX_CORNERS})`);
  if (smoothing > 0) {
    const cut = crossing(loop.points);
    if (cut) {
      const near = [...new Set(cut.flatMap((i) => [loop.sources[i], loop.sources[(i + 1) % loop.points.length]]))].sort(
        (a, b) => a - b,
      );
      throw new Error(
        `${call}: smoothing makes the outline cross itself near points ${near.join(", ")}; ` +
          `lower smoothing, mark one of them "sharp" or widen the gap there`,
      );
    }
  }
  const ys = points.map((p) => p[1]);
  return {
    points: area(loop.points) < 0 ? loop.points.reverse() : loop.points,
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/** Every edge of a counter-clockwise loop moved `inset` inward; corners travel along their mitred bisector. */
function inset(points: readonly Vec2[], d: number): Vec2[] {
  const n = points.length;
  return points.map((c, i) => {
    const [p, q] = [points[(i + n - 1) % n], points[(i + 1) % n]];
    const [l1, l2] = [dist(p, c), dist(c, q)];
    const n1: Vec2 = [-(c[1] - p[1]) / l1, (c[0] - p[0]) / l1];
    const n2: Vec2 = [-(q[1] - c[1]) / l2, (q[0] - c[0]) / l2];
    const miter = Math.max(1 + n1[0] * n2[0] + n1[1] * n2[1], 1e-9);
    return [c[0] + (d * (n1[0] + n2[0])) / miter, c[1] + (d * (n1[1] + n2[1])) / miter];
  });
}

/** Shrinking by `d` keeps every edge's direction and leaves a simple loop. */
function insetFits(points: readonly Vec2[], d: number) {
  const shrunk = inset(points, d);
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const along =
      (shrunk[j][0] - shrunk[i][0]) * (points[j][0] - points[i][0]) +
      (shrunk[j][1] - shrunk[i][1]) * (points[j][1] - points[i][1]);
    if (along <= 0) return false;
  }
  return area(shrunk) > 0 && !crossing(shrunk);
}

/** The largest bevel up to `requested` that fits half the thickness and the outline. */
function fitBevel(outline: Outline, requested: number, thickest: number) {
  const limit = Math.min(requested, thickest / 2);
  if (limit <= 0) return 0;
  if (insetFits(outline.points, limit)) return limit;
  let [fits, tooBig] = [0, limit];
  for (let step = 0; step < 24; step++) {
    const m = (fits + tooBig) / 2;
    if (insetFits(outline.points, m)) fits = m;
    else tooBig = m;
  }
  return fits;
}

/** `local` vertices (x, y, z in the part frame) placed at `at` with `quat`, flattened for `meshFromWorld`. */
function toWorld(local: number[], at: Vector3, quat: Quaternion) {
  const out: number[] = [];
  const v = new Vector3();
  for (let i = 0; i < local.length; i += 3) {
    v.set(local[i], local[i + 1], local[i + 2])
      .applyQuaternion(quat)
      .add(at);
    out.push(v.x, v.y, v.z);
  }
  return out;
}

/**
 * An outline in the plane of `x` and `y` pushed along their normal (x × y) into a closed slab. Returns a Part at
 * `at` whose local x, y and z are the outline's x, y and the thickness axis, so `part.local([u, v, 0])` is a point
 * of the drawing and `part.local([u, v, t / 2])` sits on its front face.
 */
export function extrude(ctx: Ctx, points: readonly OutlinePoint[], options: ExtrudeOptions) {
  const outline = prepare("extrude()", points, options.smoothing);
  const [t0, t1] = typeof options.thickness === "number" ? [options.thickness, options.thickness] : options.thickness;
  if (!(t0 >= 0 && t1 >= 0 && Math.max(t0, t1) > 0))
    throw new Error("extrude(): thickness is positive, or [atLowest, atHighest] with at least one end above 0");
  const full = Math.max(t0, t1);
  const thicknessAt = (y: number) => {
    const span = outline.maxY - outline.minY;
    const t = span > 0 ? Math.min(1, Math.max(0, (y - outline.minY) / span)) : 0;
    return t0 + (t1 - t0) * t;
  };
  const bevel = fitBevel(outline, options.bevel ?? 0, full);
  const steps = bevel > 0 ? Math.max(1, Math.round(BEVEL_STEPS * ctx.detailOf("extrude()", options.detail))) : 0;
  const rings = Array.from({ length: steps + 1 }, (_, s) => {
    const angle = steps === 0 ? 0 : (s / steps) * (Math.PI / 2);
    return {
      points: inset(outline.points, bevel * (1 - Math.cos(angle))),
      z: full / 2 - bevel + bevel * Math.sin(angle),
    };
  });

  const local: number[] = [];
  const index: number[] = [];
  // The taper scales each vertex's z by the thickness at its own y, so both faces stay planar.
  const vertex = (p: Vec2, z: number) => {
    index.push(local.length / 3);
    local.push(p[0], p[1], (z * thicknessAt(p[1])) / full);
  };
  // `lower` sits at the smaller z; on a counter-clockwise loop this winding faces outward.
  const band = (lower: Vec2[], lz: number, upper: Vec2[], uz: number) => {
    for (let i = 0; i < lower.length; i++) {
      const j = (i + 1) % lower.length;
      vertex(lower[i], lz);
      vertex(lower[j], lz);
      vertex(upper[j], uz);
      vertex(lower[i], lz);
      vertex(upper[j], uz);
      vertex(upper[i], uz);
    }
  };
  if (rings[0].z > 0) band(rings[0].points, -rings[0].z, rings[0].points, rings[0].z);
  for (let s = 0; s < steps; s++) {
    band(rings[s].points, rings[s].z, rings[s + 1].points, rings[s + 1].z);
    band(rings[s + 1].points, -rings[s + 1].z, rings[s].points, -rings[s].z);
  }
  const cap = rings[steps];
  for (const [a, b, c] of ShapeUtils.triangulateShape(
    cap.points.map((p) => new Vector2(p[0], p[1])),
    [],
  )) {
    const [pa, pb, pc] = [cap.points[a], cap.points[b], cap.points[c]];
    const [second, third] = orient(pa, pb, pc) > 0 ? [pb, pc] : [pc, pb];
    vertex(pa, cap.z);
    vertex(second, cap.z);
    vertex(third, cap.z);
    vertex(pa, -cap.z);
    vertex(third, -cap.z);
    vertex(second, -cap.z);
  }

  const at = toPoint(options.at);
  const xDir = toDirection(options.x ?? [0, 0, 1]).normalize();
  const yRaw = toDirection(options.y ?? [0, 1, 0]);
  const yDir = yRaw.addScaledVector(xDir, -yRaw.dot(xDir));
  if (yDir.length() < 1e-6) throw new Error("extrude(): x and y point the same way");
  yDir.normalize();
  const quat = new Quaternion().setFromRotationMatrix(
    new Matrix4().makeBasis(xDir, yDir, new Vector3().crossVectors(xDir, yDir)),
  );
  const weights = weightsFor(ctx, options.bone, [options.at], at);
  const mesh = meshFromWorld(
    ctx,
    toWorld(local, at, quat),
    index,
    options.color,
    () => weights,
    false,
    { name: options.name ?? "extrude", group: options.group },
    { surface: local.flatMap((value, i) => (i % 3 === 2 ? [] : [value])) },
  );
  return new Part(mesh, at, quat, weights, [0, 0, 1]);
}

/**
 * Half a cross-section spun around `axis` through `at`: the outline's x is the distance from the axis (never
 * negative) and its y the height along it. Returns a Part at `at` facing `axis`.
 */
export function lathe(ctx: Ctx, points: readonly OutlinePoint[], options: LatheOptions) {
  const negative = points.findIndex((p) => p[0] < 0);
  if (negative >= 0) throw new Error(`lathe(): point ${negative} has x < 0; x is the distance from the axis`);
  const outline = prepare("lathe()", points, options.smoothing);
  const segments = options.segments ?? ctx.segments(12, ctx.detailOf("lathe()", options.detail));
  if (!Number.isInteger(segments) || segments < 3 || segments > 64)
    throw new Error(`lathe(): segments is a whole number from 3 to 64, got ${segments}`);
  const smooth = segments >= SMOOTH_LATHE_SEGMENTS;
  const pts = outline.points;
  const n = pts.length;

  // Each profile corner is one column of vertices around the axis, or two where the profile creases.
  const edgeDir = (i: number) => {
    const [a, b] = [pts[i], pts[(i + 1) % n]];
    const l = dist(a, b);
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  };
  const creased = pts.map((_, i) => {
    const [d0, d1] = [edgeDir((i + n - 1) % n), edgeDir(i)];
    return d0[0] * d1[0] + d0[1] * d1[1] < Math.cos(LATHE_CREASE_DEG * DEG);
  });
  const local: number[] = [];
  const surface: number[] = [];
  const index: number[] = [];
  const spin = (options.spin ?? 0) * DEG;
  const column = (p: Vec2) => {
    const start = local.length / 3;
    for (let s = 0; s < segments; s++) {
      const angle = spin + (s / segments) * Math.PI * 2;
      local.push(p[0] * Math.sin(angle), p[1], p[0] * Math.cos(angle));
      surface.push(p[1], (((angle / DEG) % 360) + 360) % 360);
    }
    return start;
  };
  // The column an edge uses at its start and at its end.
  const starts: number[] = [];
  const ends: number[] = [];
  pts.forEach((p, i) => {
    const shared = column(p);
    starts[i] = shared;
    ends[(i + n - 1) % n] = creased[i] ? column(p) : shared;
  });
  for (let i = 0; i < n; i++) {
    const [a, b] = [starts[i], ends[i]];
    for (let s = 0; s < segments; s++) {
      const s1 = (s + 1) % segments;
      index.push(a + s, b + s1, b + s, a + s, a + s1, b + s1);
    }
  }

  const at = toPoint(options.at);
  const quat = aim(toDirection(options.axis ?? [0, 1, 0]), undefined, "y");
  const weights = weightsFor(ctx, options.bone, [options.at], at);
  const mesh = meshFromWorld(
    ctx,
    toWorld(local, at, quat),
    index,
    options.color,
    () => weights,
    smooth,
    { name: options.name ?? "lathe", group: options.group },
    { surface, wrap: true },
  );
  return new Part(mesh, at, quat, weights, [0, 1, 0]);
}
