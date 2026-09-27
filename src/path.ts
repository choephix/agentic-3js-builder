// Arc-length parametrised curves. Every curve is stored as a dense polyline with per-sample tangents, so
// polylines, beziers, catmull splines and arcs share one evaluation, slicing, concatenation and framing path.
import { CatmullRomCurve3, CubicBezierCurve3, QuadraticBezierCurve3, Quaternion, Vector3 } from "three";
import type { Curve } from "three";
import { aim, DEG, flatten, vec } from "./math";
import type { V3 } from "./math";

/** A `Path`, or a point array (read as a polyline). */
export type PathLike = Path | readonly V3[];

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
   */
  constructor(
    private readonly pts: Vector3[],
    private readonly tin: Vector3[],
    private readonly tout: Vector3[],
    private readonly straight: boolean[],
    private readonly knotS: number[],
  ) {
    if (pts.length < 2) throw new Error("Path needs at least 2 distinct points");
    this.cum = [0];
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    this.length = this.cum[this.cum.length - 1];
  }

  /** Arc-length t (0..1) of every defining point: polyline/catmull points, bezier and arc quarter/45° marks. */
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
    const found: Array<{ t: number; tin: Vector3; tout: Vector3; angle: number }> = [];
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
  closestT(p: V3) {
    const q = vec(p);
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

  /** This path followed by `other` (joined by a straight segment if they don't touch). */
  concat(other: PathLike) {
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
    return new Path(pts, tin, tout, straight, knotS);
  }

  /** The part between t0 and t1; t1 < t0 gives it reversed (for chains growing both ways from a mid-body root). */
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
    if (t1 >= t0) return new Path(pts, tin, tout, straight, knotS);
    return new Path(
      pts.reverse(),
      tout.reverse().map((v) => v.negate()),
      tin.reverse().map((v) => v.negate()),
      straight.reverse(),
      knotS.map((s) => total - s).reverse(),
    );
  }

  /** Rotation-minimising (parallel transport) frames along the path, starting from `aim(tangent0, up)`'s +Z. */
  frames(up?: V3) {
    return new Frames(this, this.pts, this.tin, this.tout, this.cum, up);
  }
}

/** Normal field along a path: the start "up" carried along the curve with no twist. */
export class Frames {
  private readonly normals: Vector3[] = [];

  constructor(
    private readonly path: Path,
    pts: Vector3[],
    tin: Vector3[],
    private readonly tout: Vector3[],
    private readonly cum: number[],
    up?: V3,
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
  }

  /** Unit normal (transported up) at t, perpendicular to the tangent; `left` = incoming side of a corner. */
  normalAt(t: number, left = false) {
    const s = Math.min(Math.max(t, 0), 1) * this.path.length;
    let k = 0;
    while (k < this.cum.length - 2 && (left ? this.cum[k + 1] < s : this.cum[k + 1] <= s)) k++;
    const tangent = this.path.tangentAt(t, left);
    const n = this.normals[k].clone().applyQuaternion(new Quaternion().setFromUnitVectors(this.tout[k], tangent));
    return flatten(n, tangent).normalize();
  }
}

/** A path from curve samples: smooth segments, analytic tangents, knots at sample indices or `spans` even spans. */
function smoothPath(pts: Vector3[], tangents: Vector3[], knots: { indices: number[] } | { spans: number }) {
  const keep = [0];
  for (let i = 1; i < pts.length; i++) if (pts[i].distanceTo(pts[keep[keep.length - 1]]) > 1e-7) keep.push(i);
  const p = keep.map((i) => pts[i]);
  const t = keep.map((i) => tangents[i].clone().normalize());
  const cum = [0];
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + p[i].distanceTo(p[i - 1]));
  const total = cum[cum.length - 1];
  const knotS =
    "spans" in knots
      ? Array.from({ length: knots.spans + 1 }, (_, i) => (i / knots.spans) * total)
      : knots.indices.map(
          (i) =>
            cum[
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
    new Array(p.length - 1).fill(false),
    knotS,
  );
}

function sampleCurve(curve: Curve<Vector3>, count: number) {
  const pts: Vector3[] = [];
  const tangents: Vector3[] = [];
  for (let i = 0; i <= count; i++) {
    pts.push(curve.getPoint(i / count));
    tangents.push(curve.getTangent(i / count));
  }
  return { pts, tangents };
}

export function polyline(points: readonly V3[]) {
  const pts: Vector3[] = [];
  for (const p of points) {
    const v = vec(p);
    if (!pts.length || v.distanceTo(pts[pts.length - 1]) > EPS) pts.push(v);
  }
  if (pts.length < 2) throw new Error("polyline() needs at least 2 distinct points");
  const dirs = pts.slice(1).map((p, i) => p.clone().sub(pts[i]).normalize());
  const tin = pts.map((_, i) => (i === 0 ? dirs[0] : dirs[i - 1]).clone());
  const tout = pts.map((_, i) => (i === pts.length - 1 ? dirs[i - 1] : dirs[i]).clone());
  const knotS = [0];
  for (let i = 1; i < pts.length; i++) knotS.push(knotS[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return new Path(pts, tin, tout, new Array(pts.length - 1).fill(true), knotS);
}

/** Quadratic (3 points) or cubic (4 points) bezier. Knots: 4 equal arc-length spans. */
export function bezier(p0: V3, p1: V3, p2: V3, p3?: V3) {
  const curve = p3
    ? new CubicBezierCurve3(vec(p0), vec(p1), vec(p2), vec(p3))
    : new QuadraticBezierCurve3(vec(p0), vec(p1), vec(p2));
  const { pts, tangents } = sampleCurve(curve, 48);
  return smoothPath(pts, tangents, { spans: 4 });
}

/** Smooth spline through `points` (centripetal, or classic catmull-rom with `tension`). Knots: the points. */
export function catmull(points: readonly V3[], tension?: number) {
  const vs = points.map(vec);
  if (vs.length === 2) return polyline(vs);
  const curve = new CatmullRomCurve3(vs, false, tension === undefined ? "centripetal" : "catmullrom", tension);
  const perSpan = 16;
  const { pts, tangents } = sampleCurve(curve, (vs.length - 1) * perSpan);
  return smoothPath(pts, tangents, { indices: vs.map((_, i) => i * perSpan) });
}

/** Circular arc around `axis` through `center`, starting at `from`, sweeping `angleDeg` (right-hand rule). */
export function arc(center: V3, from: V3, axis: V3, angleDeg: number) {
  const c = vec(center);
  const r0 = vec(from).sub(c);
  const ax = vec(axis).normalize();
  const count = Math.max(8, Math.ceil(Math.abs(angleDeg) / 4));
  const pts: Vector3[] = [];
  const tangents: Vector3[] = [];
  for (let i = 0; i <= count; i++) {
    const r = r0.clone().applyAxisAngle(ax, angleDeg * DEG * (i / count));
    pts.push(c.clone().add(r));
    tangents.push(ax.clone().cross(r).multiplyScalar(Math.sign(angleDeg)));
  }
  return smoothPath(pts, tangents, { spans: Math.max(1, Math.ceil(Math.abs(angleDeg) / 45)) });
}

export function toPath(source: PathLike) {
  return source instanceof Path ? source : polyline(source);
}
