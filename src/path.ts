// Arc-length parametrised curves. Every curve is stored as a dense polyline with per-sample tangents, so
// polylines, beziers, catmull splines, arcs, spirals and draped curves share one evaluation, slicing,
// concatenation and framing path.
import { CatmullRomCurve3, CubicBezierCurve3, QuadraticBezierCurve3, Quaternion, Vector3 } from "three";
import type { Curve } from "three";
import { weightsOf } from "./context";
import type { Weights } from "./context";
import { aim, DEG, flatten, toDirection, toPoint } from "./math";
import type { DirectionInput, PointInput } from "./math";

/** Something that can give its curve in the current pose: a Chain, a Sweep (its centreline). */
export type Curved = { curve(): Path };
/** A Path input: a `Path`, a point array (read as a polyline; any point inputs), a Chain or a Sweep. */
export type PathInput = Path | readonly PointInput[] | Curved;
/** A corner of a path: where the incoming and outgoing tangents differ, with the turn in radians. */
export type Corner = { t: number; tin: Vector3; tout: Vector3; angle: number };
/** Roll about the tangent in degrees after parallel transport: total from start to end (even), or per path t. */
export type Twist = number | ((t: number) => number);

const EPS = 1e-9;

export class Path {
  readonly length: number;
  /** Cumulative arc length at each sample. */
  private readonly cum: number[];

  /**
   * @param pts samples along the curve
   * @param tin tangent arriving at each sample, @param tout tangent leaving it (they differ only at corners)
   * @param straight per segment: true = a polyline segment (constant tangent), false = interpolate tangents
   * @param knotS arc-length positions of the defining points (chains default to one joint per knot span)
   * @param closed the last sample equals the first and the curve continues through it (loops, rims, straps)
   * @param weights the bone weights of the first defining input that came from something built (for inheritance)
   */
  constructor(
    private readonly pts: Vector3[],
    private readonly tin: Vector3[],
    private readonly tout: Vector3[],
    private readonly straight: boolean[],
    private readonly knotS: number[],
    readonly closed = false,
    readonly weights: Weights | null = null,
  ) {
    if (pts.length < 2) throw new Error("Path needs at least 2 distinct points");
    this.cum = [0];
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    this.length = this.cum[this.cum.length - 1];
  }

  /** Arc-length t (0..1) of every defining point: polyline/catmull points, bezier quarters, arc 45° and spiral 90° marks. */
  get knots() {
    return this.knotS.map((s) => s / this.length);
  }

  /** Segment index containing arc length `s`. `left` picks the segment ending at a sample instead of starting there. */
  private segment(s: number, left = false) {
    let lo = 0;
    let hi = this.pts.length - 2;
    while (lo < hi) {
      const m = (lo + hi + 1) >> 1;
      if (left ? this.cum[m] < s : this.cum[m] <= s) lo = m;
      else hi = m - 1;
    }
    return lo;
  }

  at(t: number) {
    const s = Math.min(Math.max(t, 0), 1) * this.length;
    const k = this.segment(s);
    const f = (s - this.cum[k]) / (this.cum[k + 1] - this.cum[k]);
    return this.pts[k].clone().lerp(this.pts[k + 1], Math.min(Math.max(f, 0), 1));
  }

  /** Unit tangent. At a corner it is the outgoing direction; `left` gives the incoming one. */
  tangentAt(t: number, left = false) {
    const s = Math.min(Math.max(t, 0), 1) * this.length;
    const k = this.segment(s, left);
    if (this.straight[k]) return this.pts[k + 1].clone().sub(this.pts[k]).normalize();
    const f = Math.min(Math.max((s - this.cum[k]) / (this.cum[k + 1] - this.cum[k]), 0), 1);
    return this.tout[k]
      .clone()
      .lerp(this.tin[k + 1], f)
      .normalize();
  }

  /** Interior samples in (t0, t1) whose incoming and outgoing tangents differ, with the turn angle in radians. */
  corners(t0: number, t1: number) {
    const found: Corner[] = [];
    for (let i = 1; i < this.pts.length - 1; i++) {
      const t = this.cum[i] / this.length;
      if (t <= t0 + EPS || t >= t1 - EPS) continue;
      const angle = this.tin[i].angleTo(this.tout[i]);
      if (angle > 1e-4) found.push({ t, tin: this.tin[i].clone(), tout: this.tout[i].clone(), angle });
    }
    return found;
  }

  /** t of every internal sample strictly inside (t0, t1). */
  samples(t0: number, t1: number) {
    return this.cum.map((s) => s / this.length).filter((t) => t > t0 + EPS && t < t1 - EPS);
  }

  /** t of the point on the path closest to `p`. */
  closestT(p: PointInput) {
    const q = toPoint(p, "closestT()");
    let best = 0;
    let bestD = Infinity;
    const seg = new Vector3();
    for (let k = 0; k < this.pts.length - 1; k++) {
      seg.subVectors(this.pts[k + 1], this.pts[k]);
      const f = Math.min(Math.max(q.clone().sub(this.pts[k]).dot(seg) / seg.lengthSq(), 0), 1);
      const d = this.pts[k].clone().addScaledVector(seg, f).distanceToSquared(q);
      if (d < bestD) {
        bestD = d;
        best = (this.cum[k] + f * (this.cum[k + 1] - this.cum[k])) / this.length;
      }
    }
    return best;
  }

  /** This path followed by `other` (joined by a straight segment if they don't touch). The result is open. */
  concat(other: PathInput) {
    const b = toPath(other);
    const pts = [...this.pts];
    const tin = [...this.tin];
    const tout = [...this.tout];
    const straight = [...this.straight];
    const knotS = [...this.knotS];
    const last = pts.length - 1;
    const gap = b.pts[0].distanceTo(pts[last]);
    if (gap > 1e-6) {
      const dir = b.pts[0].clone().sub(pts[last]).normalize();
      tout[last] = dir;
      straight.push(true);
      pts.push(b.pts[0].clone());
      tin.push(dir.clone());
      tout.push(b.tout[0].clone());
    } else tout[last] = b.tout[0].clone();
    const base = this.length + gap;
    for (let i = 1; i < b.pts.length; i++) {
      pts.push(b.pts[i].clone());
      tin.push(b.tin[i].clone());
      tout.push(b.tout[i].clone());
    }
    straight.push(...b.straight);
    for (const s of b.knotS) if (s > EPS || gap > 1e-6) knotS.push(base + s);
    return new Path(pts, tin, tout, straight, knotS, false, this.weights ?? b.weights);
  }

  /** The open part between t0 and t1; t1 < t0 gives it reversed (chains growing both ways from a mid-body root). */
  slice(t0: number, t1: number) {
    const a = Math.min(Math.max(Math.min(t0, t1), 0), 1);
    const b = Math.min(Math.max(Math.max(t0, t1), 0), 1);
    const start = this.at(a);
    const end = this.at(b);
    const pts = [start];
    const tin = [this.tangentAt(a)];
    const tout = [this.tangentAt(a)];
    const straight = [this.straight[this.segment(a * this.length)]];
    for (let i = 1; i < this.pts.length - 1; i++) {
      if (this.cum[i] <= a * this.length || this.cum[i] >= b * this.length) continue;
      if (this.pts[i].distanceTo(start) < 1e-7 || this.pts[i].distanceTo(end) < 1e-7) continue;
      pts.push(this.pts[i].clone());
      tin.push(this.tin[i].clone());
      tout.push(this.tout[i].clone());
      straight.push(this.straight[i]);
    }
    pts.push(end);
    tin.push(this.tangentAt(b, true));
    tout.push(this.tangentAt(b, true));
    const s0 = a * this.length;
    const total = (b - a) * this.length;
    const inner = this.knotS.filter((s) => s > s0 + 1e-7 && s < s0 + total - 1e-7).map((s) => s - s0);
    const knotS = [0, ...inner, total];
    if (t1 >= t0) return new Path(pts, tin, tout, straight, knotS, false, this.weights);
    return new Path(
      pts.reverse(),
      tout.reverse().map((v) => v.negate()),
      tin.reverse().map((v) => v.negate()),
      straight.reverse(),
      knotS.map((s) => total - s).reverse(),
      false,
      this.weights,
    );
  }

  /**
   * Rotation-minimising (parallel transport) frames along the path, starting from `aim(tangent0, up)`'s +Z, then
   * rolled by `twist`. On a closed path the transport's leftover rotation is spread along the loop so the
   * frame meets itself at the seam (a twist should total a multiple of 360° there).
   */
  frames(up?: DirectionInput, twist?: Twist) {
    return new Frames(this, this.pts, this.tin, this.tout, this.cum, up, twist);
  }
}

/** Normal field along a path: the start "up" carried along the curve with no twist of its own. */
export class Frames {
  private readonly normals: Vector3[] = [];
  /** Radians of seam correction per unit arc length (closed paths). */
  private readonly holonomy: number = 0;
  private readonly twist: (t: number) => number;

  constructor(
    private readonly path: Path,
    pts: Vector3[],
    tin: Vector3[],
    private readonly tout: Vector3[],
    private readonly cum: number[],
    up?: DirectionInput,
    twist: Twist = 0,
  ) {
    let n = new Vector3(0, 0, 1).applyQuaternion(aim(tout[0], up));
    const q = new Quaternion();
    for (let i = 0; i < pts.length; i++) {
      if (i > 0) {
        n.applyQuaternion(q.setFromUnitVectors(tout[i - 1], tin[i]));
        n.applyQuaternion(q.setFromUnitVectors(tin[i], tout[i]));
      }
      n = flatten(n, tout[i]).normalize();
      this.normals.push(n.clone());
    }
    if (path.closed) {
      const t0 = tout[0];
      const back = flatten(n.applyQuaternion(q.setFromUnitVectors(tout[pts.length - 1], t0)), t0).normalize();
      this.holonomy = Math.atan2(back.clone().cross(this.normals[0]).dot(t0), back.dot(this.normals[0])) / path.length;
    }
    this.twist = typeof twist === "number" ? (t) => twist * t : twist;
  }

  /** Unit normal (transported up, twisted) at t, perpendicular to the tangent; `left` = incoming side of a corner. */
  normalAt(t: number, left = false) {
    const s = Math.min(Math.max(t, 0), 1) * this.path.length;
    let k = 0;
    while (k < this.cum.length - 2 && (left ? this.cum[k + 1] < s : this.cum[k + 1] <= s)) k++;
    const tangent = this.path.tangentAt(t, left);
    const n = this.normals[k].clone().applyQuaternion(new Quaternion().setFromUnitVectors(this.tout[k], tangent));
    return flatten(n, tangent)
      .normalize()
      .applyAxisAngle(tangent, this.holonomy * s + this.twist(t) * DEG);
  }
}

/**
 * A smooth path through dense samples. Tangents default to central differences; knots sit at sample `indices`
 * or split the length into `spans` equal parts. `closed`: the last sample is (or becomes) the first.
 */
export function smoothPath(
  pts: Vector3[],
  tangents: Vector3[] | null,
  knots: { indices: number[] } | { spans: number },
  closed = false,
  weights: Weights | null = null,
) {
  const keep = [0];
  for (let i = 1; i < pts.length; i++) if (pts[i].distanceTo(pts[keep[keep.length - 1]]) > 1e-7) keep.push(i);
  const p = keep.map((i) => pts[i]);
  if (closed && p[p.length - 1].distanceTo(p[0]) > 1e-7) p.push(p[0].clone());
  if (closed) p[p.length - 1] = p[0].clone();
  const last = p.length - 1;
  const diff = (i: number) => {
    const a = closed && i === 0 ? p[last - 1] : p[Math.max(i - 1, 0)];
    const b = closed && i === last ? p[1] : p[Math.min(i + 1, last)];
    return b.clone().sub(a).normalize();
  };
  const t = tangents ? keep.map((i) => tangents[i].clone().normalize()) : p.map((_, i) => diff(i));
  if (t.length < p.length) t.push(t[0].clone());
  const cum = [0];
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + p[i].distanceTo(p[i - 1]));
  const total = cum[last];
  const knotS =
    "spans" in knots
      ? Array.from({ length: knots.spans + 1 }, (_, i) => (i / knots.spans) * total)
      : knots.indices.map((i) =>
          i >= pts.length - 1
            ? total
            : cum[
                Math.max(
                  0,
                  keep.findIndex((k) => k >= i),
                )
              ],
        );
  return new Path(
    p,
    t,
    t.map((v) => v.clone()),
    new Array(last).fill(false),
    knotS,
    closed,
    weights,
  );
}

/** The weights of the first input that came from something built. */
const firstOwner = (inputs: readonly unknown[]) => inputs.map(weightsOf).find((weights) => weights) ?? null;

function sampleCurve(curve: Curve<Vector3>, count: number) {
  const pts: Vector3[] = [];
  const tangents: Vector3[] = [];
  for (let i = 0; i <= count; i++) {
    pts.push(curve.getPoint(i / count));
    tangents.push(curve.getTangent(i / count));
  }
  return { pts, tangents };
}

/** Straight segments through `points`; knots at the points. `closed` adds the segment back to the first point. */
export function polyline(points: readonly PointInput[], options: { closed?: boolean } = {}) {
  const pts: Vector3[] = [];
  for (const [i, p] of points.entries()) {
    const v = toPoint(p, `polyline() point ${i}`);
    if (!pts.length || v.distanceTo(pts[pts.length - 1]) > EPS) pts.push(v);
  }
  const closed = options.closed ?? false;
  if (closed && pts[pts.length - 1].distanceTo(pts[0]) > EPS) pts.push(pts[0].clone());
  if (pts.length < (closed ? 4 : 2)) throw new Error("polyline() needs at least 2 distinct points (3 when closed)");
  const dirs = pts.slice(1).map((p, i) => p.clone().sub(pts[i]).normalize());
  const last = pts.length - 1;
  const tin = pts.map((_, i) => (i === 0 ? dirs[closed ? last - 1 : 0] : dirs[i - 1]).clone());
  const tout = pts.map((_, i) => (i === last ? dirs[closed ? 0 : i - 1] : dirs[i]).clone());
  const knotS = [0];
  for (let i = 1; i < pts.length; i++) knotS.push(knotS[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return new Path(pts, tin, tout, new Array(last).fill(true), knotS, closed, firstOwner(points));
}

/** Quadratic (3 points) or cubic (4 points) bezier. Knots: 4 equal arc-length spans. */
export function bezier(p0: PointInput, p1: PointInput, p2: PointInput, p3?: PointInput) {
  const [a, b, c] = [p0, p1, p2].map((p) => toPoint(p, "bezier()"));
  const curve = p3 ? new CubicBezierCurve3(a, b, c, toPoint(p3, "bezier()")) : new QuadraticBezierCurve3(a, b, c);
  const { pts, tangents } = sampleCurve(curve, 48);
  return smoothPath(pts, tangents, { spans: 4 }, false, firstOwner([p0, p1, p2, p3]));
}

/**
 * Smooth spline through `points` (centripetal, or classic catmull-rom with `tension`). Knots: the points.
 * `closed` continues smoothly from the last point back to the first (rims, collars, straps).
 */
export function catmull(points: readonly PointInput[], options: { tension?: number; closed?: boolean } = {}) {
  const vs = points.map((p, i) => toPoint(p, `catmull() point ${i}`));
  const closed = options.closed ?? false;
  if (vs.length === 2 && !closed) return polyline(points);
  const type = options.tension === undefined ? "centripetal" : "catmullrom";
  const curve = new CatmullRomCurve3(vs, closed, type, options.tension);
  const perSpan = 16;
  const spans = closed ? vs.length : vs.length - 1;
  const { pts, tangents } = sampleCurve(curve, spans * perSpan);
  const indices = Array.from({ length: spans + 1 }, (_, i) => i * perSpan);
  return smoothPath(pts, tangents, { indices }, closed, firstOwner(points));
}

/** Circular arc around `axis` through `center`, starting at `from`, sweeping `angleDeg` (right-hand rule). */
export function arc(center: PointInput, from: PointInput, axis: DirectionInput, angleDeg: number) {
  const c = toPoint(center, "arc()");
  const r0 = toPoint(from, "arc()").sub(c);
  const ax = toDirection(axis, "arc()").normalize();
  const count = Math.max(8, Math.ceil(Math.abs(angleDeg) / 4));
  const pts: Vector3[] = [];
  const tangents: Vector3[] = [];
  for (let i = 0; i <= count; i++) {
    const r = r0.clone().applyAxisAngle(ax, angleDeg * DEG * (i / count));
    pts.push(c.clone().add(r));
    tangents.push(ax.clone().cross(r).multiplyScalar(Math.sign(angleDeg)));
  }
  const spans = Math.max(1, Math.ceil(Math.abs(angleDeg) / 45));
  return smoothPath(pts, tangents, { spans }, false, firstOwner([from, center]));
}

/**
 * Coil around `axis` through `center`, starting at `from` (like `arc`), for `turns` turns (right-hand rule, may be
 * fractional or negative). The radius goes from |from − axis| to `r1` geometrically (a log spiral: ram horns,
 * shells); `pitch` is the advance along `axis` per turn (0 = planar coil, else a helix). Knots every 90°.
 */
export function spiral(
  center: PointInput,
  from: PointInput,
  axis: DirectionInput,
  options: { turns: number; r1?: number; pitch?: number },
) {
  const c = toPoint(center, "spiral()");
  const ax = toDirection(axis, "spiral()").normalize();
  const rel = toPoint(from, "spiral()").sub(c);
  const h0 = rel.dot(ax);
  const u = flatten(rel, ax);
  const r0 = u.length();
  if (r0 < EPS) throw new Error("spiral(): `from` must lie off the axis");
  u.normalize();
  const v = ax.clone().cross(u);
  const r1 = options.r1 ?? r0;
  const { turns } = options;
  const pitch = options.pitch ?? 0;
  const point = (f: number) => {
    const angle = 2 * Math.PI * turns * f;
    const r = r0 > 0 && r1 > 0 ? r0 * (r1 / r0) ** f : r0 + (r1 - r0) * f;
    return c
      .clone()
      .addScaledVector(ax, h0 + pitch * Math.abs(turns) * f)
      .addScaledVector(u, r * Math.cos(angle))
      .addScaledVector(v, r * Math.sin(angle));
  };
  const count = Math.max(16, Math.ceil(Math.abs(turns) * 72));
  const pts: Vector3[] = [];
  const tangents: Vector3[] = [];
  for (let i = 0; i <= count; i++) {
    pts.push(point(i / count));
    tangents.push(point(i / count + 1e-5).sub(point(i / count - 1e-5)));
  }
  const spans = Math.max(1, Math.ceil(Math.abs(turns) * 4));
  return smoothPath(pts, tangents, { spans }, false, firstOwner([from, center]));
}

/** The Path of any path input (a Chain or Sweep in its current pose). */
export function toPath(source: PathInput) {
  return source instanceof Path ? source : "curve" in source ? source.curve() : polyline(source);
}
