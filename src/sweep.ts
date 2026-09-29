// `sweep()`: the one tube primitive. A section swept along a path or a chain, with continuous radius,
// parallel-transported roll, adaptive ring spacing, caps, colour bands along the tube and colour sectors around it.
// On a chain, or on a path given the chains and joints it runs through, the tube is one continuous blend-skinned mesh
// by default ("smooth": each ring blends the two bones either side of a joint over about ±1 local radius, and corners
// are rounded); `skin: "rigid"` cuts it into one round-capped piece per bone instead.
import { Matrix3, Matrix4, Quaternion, Vector3 } from "three";
import type { Mesh } from "three";
import { Capture, meshFromWorld, resolveJoint, rigid, spanWeights, weightsFor } from "./context";
import type { Ctx, Fill, JointRef, Tags, Weights } from "./context";
import { Spot } from "./frame";
import { aim, DEG, flatten } from "./math";
import type { DirectionInput } from "./math";
import { smoothPath, toPath } from "./path";
import type { Corner, Frames, Path, PathInput, Twist } from "./path";
import { Chain } from "./skeleton";
import type { Joint } from "./skeleton";

/** "smooth": one continuous mesh that bends across joints. "rigid": one piece per bone, hinged like a puppet. */
export type Skin = "smooth" | "rigid";

export type Cap = "round" | "flat" | "point" | "none";
export type Section = "circle" | "box" | { ngon: number };
/**
 * number | [r0, r1] (linear) | number[] (evenly keyed over the swept range, smooth) | (t) => number | (t) => [rx, ry]
 * with t in source t (see `from`). rx runs along the binormal (side), ry along the normal (up). For "box", these are
 * half extents.
 */
export type Radius = number | readonly number[] | ((t: number) => number | readonly [number, number]);

export type SweepOptions = Tags & {
  /**
   * Colour or Paint, or `(t) => colour`: the tube is split exactly where the colour changes. Optional when `bands`
   * cover it.
   */
  color?: Fill | ((t: number) => Fill);
  /** `[[tEnd, color], ...]` ascending, in source t: color bands; each band edge splits the mesh (same bone, no cap). */
  bands?: ReadonlyArray<readonly [number, Fill]>;
  /**
   * Bones for a Path source: a joint (rigid), or the chains and joints the path runs through, as one Chain or a list
   * in any order (a body drawn from tail tip to snout: `[tail, hips, spine, neck, head]`). The tube is then one mesh
   * skinned like a chain source, whichever way each chain runs along the path. Default: the weights of the path's
   * first built input, else the joint nearest the path's start. Chain sources always use their own joints.
   */
  bone?: JointRef | Chain | ReadonlyArray<JointRef | Chain>;
  /** "smooth" (default): one continuous mesh bending across joints. "rigid": one round-capped piece per bone. */
  skin?: Skin;
  /**
   * Range of the source to sweep, in source t. It only crops: every other t (radius and shift functions, `color`,
   * `bands`, sector ranges, twist, `Sweep.at`) is source t too, so sweeping [0, 0.4] and [0.4, 1] with the same
   * options gives the two halves of the one tube. Radius arrays spread over the swept range.
   */
  from?: number;
  to?: number;
  section?: Section;
  /** Circle sides (default 8 × `detail`). */
  sides?: number;
  /**
   * This tube's own tessellation multiplier (default: the builder's `detail`): default sides, ring spacing along
   * the tube and radius tolerance. 0.5 on a small horn or toe; explicit `sides` still wins.
   */
  detail?: number;
  /** Smooth normals (default: circle smooth, box/ngon faceted). */
  smooth?: boolean;
  caps?: Cap | { start?: Cap; end?: Cap };
  /** Rigid only: instead of round caps at bone cuts, extend each piece past the cut by `overlap` × radius (flat end). */
  overlap?: number;
  /** Extend straight past the start / end along the end tangent at the end radius, in meters (number = both). */
  extend?: number | readonly [number, number];
  /**
   * Colour sectors around the tube, `[[fromDeg, toDeg, color], ...]` on the dorsal clock of `Sweep.at` (0 = the
   * side facing world up, 180 = belly). Uncovered angles keep the piece colour. One mesh per sector per piece;
   * sector edges get no walls and neighbours share them exactly. Add `fromT, toT` (source t) to limit a sector to
   * that stretch of the tube: `[-60, 60, DARK, 0.2, 1]` darkens the back of all but the tip. Sectors only have to
   * avoid overlapping where their stretches meet.
   */
  sectors?: ReadonlyArray<Sector>;
  /** Section centre offset `[x, y]` in the same (binormal, normal) axes as `(t) => [rx, ry]`: a sagging belly. */
  shift?: readonly [number, number] | ((t: number) => readonly [number, number]);
  /** Path sources: start roll, the section's normal (ry direction) leans toward `up`. */
  up?: DirectionInput;
  /** Path sources: roll about the tangent after parallel transport, total degrees or `(t) => deg` (chains: on `chain()`). */
  twist?: Twist;
};

export type Sector = readonly [number, number, Fill] | readonly [number, number, Fill, number, number];

/** A frame on a sweep's built surface: +Y = the outward surface normal `n`, +Z = along the tube (`tangent`). */
export class SweepPoint extends Spot {
  constructor(
    readonly t: number,
    at: Vector3,
    n: Vector3,
    tangent: Vector3,
    /** Distance from the section centre. */
    readonly radius: number,
    weights: Weights,
    capture: Capture,
  ) {
    super(at, aim(n, tangent), weights, undefined, capture);
  }

  get n() {
    return this.axis;
  }

  get tangent() {
    return this.dir([0, 0, 1]);
  }
}

type Shape = { pts: Array<[number, number]>; smooth: boolean };
type Cut = { t: number; kind: "joint" | "corner" | "band" };
/** Everything that places a ring: shared by mesh building and the surface queries of `Sweep`. */
type Tube = {
  path: Path;
  frames: Frames;
  from: number;
  to: number;
  /** Radii at source t. */
  radius: (t: number) => [number, number];
  /** Section centre offset at source t. */
  shift: (t: number) => readonly [number, number];
  shape: Shape;
  corners: Corner[];
  closed: boolean;
  /** Averaged tangent at the seam of a closed tube whose seam is smooth; both end rings use it. */
  seam: Vector3 | null;
  /** Smooth skin: rounded corners, a quadratic bezier over source arc length [s0, s1] around each corner c. */
  fillets: Array<{ s0: number; s1: number; p0: Vector3; c: Vector3; p1: Vector3 }>;
  /** The bones when the curve was taken: rings follow their later poses. */
  capture: Capture;
  /** World-up reference angle at source t, continuous along the whole path (`continuousRef`); null while built. */
  refAt: ((t: number, raw: number) => number) | null;
};
/** A ring: sweep t, centre, tangent/normal/binormal, radii, polar angle of the dorsal side in (B, N), weights. */
type Frame = {
  t: number;
  c: Vector3;
  T: Vector3;
  N: Vector3;
  B: Vector3;
  r: [number, number];
  s: readonly [number, number];
  ref: number;
  mandatory: boolean;
  w: Weights;
};
/** A clock interval in degrees (a0 < a1) with its colour; null = the piece colour. */
type Arc = { a0: number; a1: number; color: Fill | null };

const CORNER_SPLIT = 20 * (Math.PI / 180);
/** Ring spacing: at most one step round the section (360° / sides, 8 sides at least) of turn or roll between rings. */
const turnLimit = (sides: number) => (2 * Math.PI) / Math.max(sides, 8);
/** Closest spacing of rings along a tube, as a share of the edge length around it (unless a joint or cut needs one). */
const RING_GAP = 0.7;

/** Smooth interpolation through (xs[i], ys[i]); linear for 2 keys. */
export function interpolate(xs: readonly number[], ys: readonly number[], x: number) {
  if (ys.length === 1) return ys[0];
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let k = 0;
  while (k < n - 2 && xs[k + 1] <= x) k++;
  const h = xs[k + 1] - xs[k];
  const slope = (i: number) =>
    i === 0
      ? (ys[1] - ys[0]) / (xs[1] - xs[0])
      : i === n - 1
        ? (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2])
        : (ys[i + 1] - ys[i - 1]) / (xs[i + 1] - xs[i - 1]);
  const s = (x - xs[k]) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * ys[k] +
    (s3 - 2 * s2 + s) * h * slope(k) +
    (-2 * s3 + 3 * s2) * ys[k + 1] +
    (s3 - s2) * h * slope(k + 1)
  );
}

export function radiusFn(radius: Radius): (t: number) => [number, number] {
  if (typeof radius === "number") return () => [radius, radius];
  if (typeof radius === "function")
    return (t) => {
      const r = radius(t);
      return typeof r === "number" ? [Math.max(r, 0), Math.max(r, 0)] : [Math.max(r[0], 0), Math.max(r[1], 0)];
    };
  const xs = radius.map((_, i) => i / Math.max(radius.length - 1, 1));
  return (t) => {
    const r = Math.max(interpolate(xs, radius, t), 0);
    return [r, r];
  };
}

function sectionShape(section: Section, sides: number): Shape {
  if (section === "box")
    return {
      pts: [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
      ],
      smooth: false,
    };
  const circle = section === "circle";
  const n = circle ? Math.max(3, sides) : Math.max(3, section.ngon);
  // Circles have a flat top and bottom (vertices symmetric about the normal) and are circumscribed, so every flat
  // face sits exactly at the radius: a tube of radius r whose axis is at height r touches the floor. Ngons
  // point a vertex along the normal, at the radius.
  const phase = Math.PI / 2 + (circle ? Math.PI / n : 0);
  const scale = circle ? 1 / Math.cos(Math.PI / n) : 1;
  return {
    pts: Array.from({ length: n }, (_, k) => [
      scale * Math.cos(phase + (2 * Math.PI * k) / n),
      scale * Math.sin(phase + (2 * Math.PI * k) / n),
    ]),
    smooth: circle,
  };
}

/** Where a ray from the section centre along (dx, dy) (binormal, normal components) meets the built polygon. */
function sectionPoint(shape: Shape, r: [number, number], dx: number, dy: number) {
  if (Math.max(r[0], r[1]) < 1e-9) return { x: 0, y: 0, nx: dx, ny: dy };
  const pts = shape.pts;
  for (let k = 0; k < pts.length; k++) {
    const vx = pts[k][0] * r[0];
    const vy = pts[k][1] * r[1];
    const ex = pts[(k + 1) % pts.length][0] * r[0] - vx;
    const ey = pts[(k + 1) % pts.length][1] * r[1] - vy;
    const denom = dx * ey - dy * ex;
    if (Math.abs(denom) < 1e-12) continue;
    const lambda = (vx * ey - vy * ex) / denom;
    const mu = (vx * dy - vy * dx) / denom;
    if (lambda <= 0 || mu < -1e-9 || mu > 1 + 1e-9) continue;
    const x = dx * lambda;
    const y = dy * lambda;
    let nx = ey;
    let ny = -ex;
    if (shape.smooth) {
      nx = x / (r[0] * r[0] || 1e-12);
      ny = y / (r[1] * r[1] || 1e-12);
    }
    const len = Math.hypot(nx, ny);
    return { x, y, nx: nx / len, ny: ny / len };
  }
  return { x: 0, y: 0, nx: dx, ny: dy };
}

/**
 * The ring at sweep t as the curve was captured (bind pose). `side`: incoming tangent at a corner ("left"),
 * outgoing ("right") or their average. Rounded corners (smooth skin) replace the path there.
 */
function frameAt(tube: Tube, u: number, side: "left" | "right" | "corner", mandatory = false): Frame {
  const t = tube.from + u * (tube.to - tube.from);
  const seamEnd = tube.seam !== null && (u <= 0 || u >= 1);
  let T = seamEnd ? tube.seam!.clone() : tube.path.tangentAt(t, side === "left");
  let centre = tube.path.at(t);
  if (side === "corner") {
    const corner = tube.corners.find((c) => Math.abs(c.t - t) < 1e-9);
    if (corner) T = corner.tin.clone().add(corner.tout).normalize();
  }
  const arc = t * tube.path.length;
  const fillet = tube.fillets.find((f) => arc > f.s0 && arc < f.s1);
  if (fillet) {
    const g = (arc - fillet.s0) / (fillet.s1 - fillet.s0);
    const { p0, c, p1 } = fillet;
    centre = p0
      .clone()
      .multiplyScalar((1 - g) ** 2)
      .addScaledVector(c, 2 * g * (1 - g))
      .addScaledVector(p1, g * g);
    T = c
      .clone()
      .sub(p0)
      .multiplyScalar(1 - g)
      .addScaledVector(p1.clone().sub(c), g)
      .normalize();
  }
  const N = flatten(tube.frames.normalAt(seamEnd ? 0 : t, side === "left"), T).normalize();
  const B = T.clone().cross(N);
  const s = tube.shift(t);
  const up = flatten(new Vector3(0, 1, 0), T);
  const ref = up.lengthSq() > 1e-6 ? up.normalize() : N;
  const raw = Math.atan2(ref.dot(N), ref.dot(B));
  return {
    t: u,
    c: centre.addScaledVector(B, s[0]).addScaledVector(N, s[1]),
    T,
    N,
    B,
    r: tube.radius(t),
    s,
    ref: tube.refAt ? tube.refAt(t, raw) : raw,
    mandatory,
    w: [],
  };
}

/**
 * World up projected into the section flips to the other side wherever the tube passes vertical (every half turn
 * of a coil), which would jump sectors and `at()` points across the tube. Sample it along the whole source path,
 * keep it continuous across those flips, then pick the overall side that agrees with world up where the path lies
 * most level. Sampling the whole path, not the swept range, keeps range splits of one path on the same side.
 * Returns the continuous angle for any source t, given that ring's raw angle.
 */
function continuousRef(tube: Tube) {
  const whole: Tube = { ...tube, from: 0, to: 1, refAt: null };
  const count = 256;
  const angles: number[] = [];
  let agreement = 0;
  for (let i = 0; i <= count; i++) {
    const f = frameAt(whole, i / count, "right");
    const angle = i === 0 ? f.ref : f.ref + Math.PI * Math.round((angles[i - 1] - f.ref) / Math.PI);
    angles.push(angle);
    agreement += flatten(new Vector3(0, 1, 0), f.T).length() * Math.cos(angle - f.ref);
  }
  const flip = agreement < 0 ? Math.PI : 0;
  return (t: number, raw: number) => {
    const x = Math.min(Math.max(t, 0), 1) * count;
    const i = Math.min(Math.floor(x), count - 1);
    const expected = angles[i] + (angles[i + 1] - angles[i]) * (x - i) + flip;
    return raw + Math.PI * Math.round((expected - raw) / Math.PI);
  };
}

/** A bind frame moved into the current pose by its weights (linear blend skinning of the ring). */
function posed(tube: Tube, f: Frame, w: Weights): Frame {
  const m = tube.capture.blend(w);
  const r = new Matrix3().setFromMatrix4(m);
  const move = (v: Vector3) => v.clone().applyMatrix3(r);
  return { ...f, w, c: f.c.clone().applyMatrix4(m), T: move(f.T), N: move(f.N), B: move(f.B) };
}

/** The built surface point at clock `angleDeg` (0 = dorsal, +90 = clockwise looking along the tube). */
function surfacePoint(tube: Tube, f: Frame, angleDeg: number) {
  const phi = f.ref - angleDeg * DEG;
  const q = sectionPoint(tube.shape, f.r, Math.cos(phi), Math.sin(phi));
  const p = f.c.clone().addScaledVector(f.B, q.x).addScaledVector(f.N, q.y);
  return { p, q, nSec: f.B.clone().multiplyScalar(q.nx).addScaledVector(f.N, q.ny) };
}

export class Sweep {
  readonly meshes: Mesh[] = [];

  constructor(
    private readonly tube: Tube,
    /** The weights of the ring at sweep t. */
    private readonly weightAt: (u: number) => Weights,
    /** Sweep t of the start, every joint and the end. */
    private readonly knots: number[],
  ) {}

  /** The heaviest bone at the start of the tube. */
  get bone() {
    return this.weightAt(0)[0][0];
  }

  /** The swept range, in source t. */
  get from() {
    return this.tube.from;
  }

  get to() {
    return this.tube.to;
  }

  /** The centreline frame at the start (+Y along the tube, +Z its normal), in the current pose: a Point/Line/Frame. */
  get frame() {
    const f = frameAt(this.tube, 0, "right");
    const quat = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(f.B, f.T, f.N));
    return new Spot(f.c, quat, this.weightAt(0), undefined, this.tube.capture);
  }

  /** The centreline (section centres) in the current pose, with knots at the joints. */
  curve() {
    const count = 64;
    const pts = Array.from(
      { length: count + 1 },
      (_, i) => posed(this.tube, frameAt(this.tube, i / count, "right"), this.weightAt(i / count)).c,
    );
    const indices = [...new Set(this.knots.map((u) => Math.round(u * count)))];
    return smoothPath(pts, null, { indices }, this.tube.seam !== null, this.weightAt(0));
  }

  /**
   * A point on the built tube surface at source t (the same t as `from`/`to`), pushed out `lift` along the surface
   * normal. `angleDeg` goes around the section: 0 = the side facing world up (the tube's normal side where the tube
   * is vertical), +90 = a quarter turn clockwise seen looking along the tube (for a tube running toward +Z: its -X
   * side).
   */
  at(t: number, angleDeg = 0, lift = 0): SweepPoint {
    return this.atU((t - this.tube.from) / (this.tube.to - this.tube.from), angleDeg, lift);
  }

  /** `at()` by sweep t: 0..1 over the swept range. */
  private atU(u: number, angleDeg: number, lift: number): SweepPoint {
    const f = frameAt(this.tube, u, "right");
    const { p, q, nSec } = surfacePoint(this.tube, f, angleDeg);
    const ahead = surfacePoint(this.tube, frameAt(this.tube, Math.min(1, u + 1e-3), "right"), angleDeg).p;
    const behind = surfacePoint(this.tube, frameAt(this.tube, Math.max(0, u - 1e-3), "right"), angleDeg).p;
    const along = ahead.sub(behind);
    const lean = f.T.dot(along);
    const n = (Math.abs(lean) > 1e-12 ? nSec.addScaledVector(f.T, -nSec.dot(along) / lean) : nSec).normalize();
    const radius = Math.hypot(q.x, q.y);
    const t = this.tube.from + u * (this.tube.to - this.tube.from);
    return new SweepPoint(t, p.addScaledVector(n, lift), n, f.T, radius, this.weightAt(u), this.tube.capture);
  }

  /**
   * The curve along the built surface at clock `angleDeg` (0 = dorsal ridge), `lift` above it, with knots at the
   * bone cuts: a membrane or sweep edge that lies on the skin. Closed tubes give closed lines.
   */
  line(angleDeg: number, lift = 0) {
    const count = 64;
    const pts = Array.from({ length: count + 1 }, (_, i) => this.atU(i / count, angleDeg, lift).at);
    const indices = [...new Set(this.knots.map((u) => Math.round(u * count)))];
    return smoothPath(pts, null, { indices }, this.tube.seam !== null, this.weightAt(0));
  }
}

/** Sectors → clock arcs covering one full turn, gaps filled with the piece colour. */
function clockArcs(sectors: SweepOptions["sectors"]): Arc[] {
  if (!sectors?.length) return [{ a0: 0, a1: 360, color: null }];
  const list = sectors
    .map(([a, b, color]) => {
      if (!(b > a) || b - a > 360) throw new Error(`sweep(): sector [${a}, ${b}] must have from < to <= from + 360`);
      const a0 = ((a % 360) + 360) % 360;
      return { a0, a1: a0 + b - a, color };
    })
    .sort((x, y) => x.a0 - y.a0);
  const arcs: Arc[] = [];
  list.forEach((sector, i) => {
    const next = i + 1 < list.length ? list[i + 1].a0 : list[0].a0 + 360;
    if (sector.a1 > next + 1e-9) throw new Error("sweep(): sectors overlap");
    arcs.push(sector);
    if (next - sector.a1 > 1e-9) arcs.push({ a0: sector.a1, a1: next, color: null });
  });
  return arcs;
}

/** Vertex and triangle list of one output mesh. */
class MeshBuffer {
  readonly positions: number[] = [];
  readonly index: number[] = [];
  readonly weights: Weights[] = [];
  /** [source t, clock degrees] per vertex, for paints. */
  readonly surface: number[] = [];

  constructor(readonly color: Fill) {}

  vertex(p: Vector3, w: Weights, t: number, deg: number) {
    this.positions.push(p.x, p.y, p.z);
    this.weights.push(w);
    this.surface.push(t, deg);
    return this.positions.length / 3 - 1;
  }

  tri(i: number, j: number, l: number) {
    if (i !== j && j !== l && i !== l) this.index.push(i, j, l);
  }

  /** Cumulative distance fractions along a vertex run (index fractions if it has no length). */
  fractions(run: number[]) {
    const out = [0];
    const v = new Vector3();
    const w = new Vector3();
    for (let k = 1; k < run.length; k++)
      out.push(
        out[k - 1] + v.fromArray(this.positions, run[k] * 3).distanceTo(w.fromArray(this.positions, run[k - 1] * 3)),
      );
    const total = out[out.length - 1];
    return out.map((d, k) => (total > 1e-12 ? d / total : k / Math.max(run.length - 1, 1)));
  }
}

const isBoneList = (x: SweepOptions["bone"]): x is ReadonlyArray<JointRef | Chain> => Array.isArray(x);

/**
 * A `bone` list laid onto the path, in path order: each joint owns source t from its span start to the next one. A
 * chain running with the path owns forward from each joint; one running against it (a tail on a curve drawn from
 * the tail tip) owns the stretch behind each joint, from its child or the chain tip. A lone joint owns from its
 * own position. Of several spans starting at one t, the last listed keeps it. A span that would start beyond the
 * path's end owns none of it and is left out (a chain longer than a feather swept along it), so the tip keeps the
 * last bone it reaches.
 */
function boneSpans(ctx: Ctx, path: Path, items: ReadonlyArray<JointRef | Chain>) {
  const slack = 1e-3 * path.length;
  const past = (p: Vector3, t: number) =>
    t >= 1 - 1e-6 && p.clone().sub(path.at(1)).dot(path.tangentAt(1, true)) > slack;
  const spans: Array<{ joint: Joint; t: number; past: boolean }> = [];
  for (const item of items) {
    if (!(item instanceof Chain)) {
      const joint = resolveJoint(ctx, item);
      const t = path.closestT(joint.at);
      spans.push({ joint, t, past: past(joint.at, t) });
      continue;
    }
    const points = [...item.joints.map((joint) => joint.at), item.at(1).at];
    const ends = points.map((p) => path.closestT(p));
    const forward = ends[ends.length - 1] >= ends[0];
    item.joints.forEach((joint, i) => {
      const k = forward ? i : i + 1;
      spans.push({ joint, t: ends[k], past: past(points[k], ends[k]) });
    });
  }
  if (!spans.length) throw new Error("sweep(): the `bone` list is empty");
  const kept = spans.some((span) => !span.past) ? spans.filter((span) => !span.past) : spans;
  kept.sort((a, b) => a.t - b.t);
  return kept.filter((span, i) => i === kept.length - 1 || kept[i + 1].t - span.t > 1e-6);
}

export function sweep(ctx: Ctx, source: PathInput | Chain, radius: Radius, options: SweepOptions = {}) {
  const chain = source instanceof Chain ? source : null;
  const path = source instanceof Chain ? source.path : toPath(source);
  const from = options.from ?? 0;
  const to = options.to ?? 1;
  if (!(from < to)) throw new Error(`sweep(): from (${from}) must be less than to (${to})`);
  const toT = (u: number) => from + u * (to - from);
  const toU = (t: number) => (t - from) / (to - from);
  const L = path.length;
  const { twist, shift } = options;
  const rigidSkin = options.skin === "rigid";
  const frames = chain ? chain.frames : path.frames(options.up, twist);
  const detail = ctx.detailOf("sweep()", options.detail);
  const shape = sectionShape(options.section ?? "circle", options.sides ?? ctx.segments(8, detail));
  const sides = shape.pts.length;
  const maxTurn = turnLimit(sides);
  const smooth = options.smooth ?? shape.smooth;
  const closed = path.closed && from === 0 && to === 1;
  const seamIn = path.tangentAt(1, true);
  const seamOut = path.tangentAt(0);
  const seamSmooth = closed && seamIn.angleTo(seamOut) <= CORNER_SPLIT;
  const corners = path.corners(from, to);
  const keyed = radiusFn(radius);
  const rOf = typeof radius === "function" ? keyed : (t: number) => keyed(toU(t));
  const rMaxAt = (t: number) => Math.max(...rOf(Math.min(Math.max(t, from), to)));

  // Bones: joint spans in source t (a chain source's own joints, or `bone` as chains and joints laid onto the path),
  // else one fixed set of weights for the whole tube (the path's own, or `bone`).
  const owner = options.bone;
  const spans = chain
    ? chain.joints.map((joint, i) => ({ joint, t: chain.ts[i] }))
    : owner instanceof Chain || isBoneList(owner)
      ? boneSpans(ctx, path, owner instanceof Chain ? [owner] : owner)
      : null;
  const boneJoints = spans?.map((span) => span.joint) ?? null;
  const boneTs = spans ? spans.map((span) => span.t) : [0];
  const starts = boneTs.map((t) => t * L);
  const uniform = spans ? null : weightsFor(ctx, owner as JointRef | undefined, [path], path.at(from));
  const jointAt = (t: number) => {
    let i = 0;
    while (i < boneTs.length - 1 && boneTs[i + 1] <= t) i++;
    return boneJoints![i];
  };
  // Smooth blend window around joint k: ±1 local radius, at most 45% of either neighbouring span.
  const half = (k: number) =>
    Math.min(rMaxAt(boneTs[k]), 0.45 * (starts[k] - starts[k - 1]), 0.45 * ((starts[k + 1] ?? L) - starts[k]));
  const weightAt = (u: number): Weights =>
    uniform
      ? rigidSkin
        ? rigid(uniform[0][0])
        : uniform
      : rigidSkin
        ? rigid(jointAt(toT(u)))
        : spanWeights(boneJoints!, starts, toT(u) * L, half);

  // Smooth skin rounds every corner inside the range with a bezier over ±1 local radius.
  const fillets: Tube["fillets"] = [];
  if (!rigidSkin) {
    const sharp = corners.filter((c) => c.angle > 1e-3);
    sharp.forEach((corner, i) => {
      const s = corner.t * L;
      const before = s - (i > 0 ? sharp[i - 1].t * L : from * L);
      const after = (i + 1 < sharp.length ? sharp[i + 1].t * L : to * L) - s;
      const d = Math.min(rMaxAt(corner.t), 0.45 * before, 0.45 * after);
      const c = path.at(corner.t);
      fillets.push({
        s0: s - d,
        s1: s + d,
        p0: c.clone().addScaledVector(corner.tin, -d),
        c,
        p1: c.clone().addScaledVector(corner.tout, d),
      });
    });
  }

  const tube: Tube = {
    path,
    frames,
    from,
    to,
    radius: rOf,
    shift: typeof shift === "function" ? shift : () => shift ?? [0, 0],
    shape,
    corners: rigidSkin ? corners : [],
    closed,
    seam: seamSmooth ? seamIn.add(seamOut).normalize() : null,
    fillets,
    capture: chain ? chain.capture : new Capture(boneJoints ?? uniform!.map(([joint]) => joint)),
    refAt: null,
  };
  tube.refAt = continuousRef(tube);
  const caps = typeof options.caps === "object" ? options.caps : { start: options.caps, end: options.caps };
  const seamCap: Cap = seamSmooth ? "none" : "round";
  const capStart = closed ? seamCap : (caps.start ?? "round");
  const capEnd = closed ? seamCap : (caps.end ?? "round");
  const [extendStart, extendEnd] = closed
    ? [0, 0]
    : typeof options.extend === "number"
      ? [options.extend, options.extend]
      : (options.extend ?? [0, 0]);

  // Cuts, in sweep t (u), ascending: colour changes always; joints and sharp corners only for rigid skin.
  const cuts: Cut[] = [];
  const addCut = (u: number, kind: Cut["kind"]) => {
    if (u <= 1e-6 || u >= 1 - 1e-6) return;
    const existing = cuts.find((c) => Math.abs(c.t - u) < 1e-6);
    if (!existing) cuts.push({ t: u, kind });
    else if (kind === "joint" || (kind === "corner" && existing.kind === "band")) existing.kind = kind;
  };
  const jointUs = boneTs.slice(1).map(toU);
  if (rigidSkin) {
    for (const u of jointUs) addCut(u, "joint");
    for (const corner of corners) if (corner.angle > CORNER_SPLIT) addCut(toU(corner.t), "corner");
  }
  for (const [tEnd] of options.bands ?? []) addCut(toU(tEnd), "band");
  const colorFn = options.color;
  const colorOf = typeof colorFn === "function" ? (u: number) => colorFn(toT(u)) : null;
  if (colorOf) {
    const steps = 256;
    for (let k = 1; k <= steps; k++) {
      let lo = (k - 1) / steps;
      let hi = k / steps;
      const before = colorOf(lo);
      if (colorOf(hi) === before) continue;
      for (let n = 0; n < 30; n++) {
        const m = (lo + hi) / 2;
        if (colorOf(m) === before) lo = m;
        else hi = m;
      }
      addCut(hi, "band");
    }
  }
  const sectors = options.sectors ?? [];
  for (const sector of sectors) {
    if (sector.length !== 5) continue;
    if (!(sector[3] < sector[4])) throw new Error(`sweep(): sector t range [${sector[3]}, ${sector[4]}] must ascend`);
    addCut(toU(sector[3]), "band");
    addCut(toU(sector[4]), "band");
  }
  cuts.sort((a, b) => a.t - b.t);

  const colorAt = (u: number) => {
    const t = toT(u);
    for (const [tEnd, color] of options.bands ?? []) if (t <= tEnd) return color;
    const color = colorOf ? colorOf(u) : (colorFn as Fill | undefined);
    if (!color) throw new Error("sweep(): no color for t=" + t.toFixed(3) + "; pass `color` or cover it with `bands`");
    return color;
  };
  /** Clock arcs of the sectors covering sweep t `u` (ranged sectors only inside their stretch). */
  const arcsAt = (u: number) => {
    const t = toT(u);
    return clockArcs(sectors.filter((s) => s.length === 3 || (t >= s[3] && t <= s[4])));
  };
  const isFull = (arc: Arc) => arc.a1 - arc.a0 >= 360 - 1e-9;
  // With ranged sectors, pieces either side of a range edge carry different arcs. Every ring then gets a vertex at
  // every sector edge angle, so neighbouring rings share their vertices and the cut has no T-junction cracks.
  const mod360 = (a: number) => ((a % 360) + 360) % 360;
  const splitDegs = sectors.some((s) => s.length === 5)
    ? [...new Set(sectors.flatMap(([a0, a1]) => [mod360(a0), mod360(a1)]))].sort((x, y) => x - y)
    : [];
  /** Full rings without edge vertices: the polygon itself, connected index by index. */
  const indexed = (arc: Arc) => isFull(arc) && !splitDegs.length;

  /** Ring vertices of `arc` at frame `f`, scaled toward the centre by `scale` (caps). Full rings are closed. */
  const ring = (buf: MeshBuffer, f: Frame, arc: Arc, scale = 1) => {
    const r: [number, number] = [f.r[0] * scale, f.r[1] * scale];
    // Surface coordinates for paints: source t, and the dorsal clock angle of the point round the centre.
    const deg = (x: number, y: number) => ((((f.ref - Math.atan2(y, x)) / DEG) % 360) + 360) % 360;
    const point = (x: number, y: number) =>
      buf.vertex(f.c.clone().addScaledVector(f.B, x).addScaledVector(f.N, y), f.w, toT(f.t), deg(x, y));
    if (Math.max(r[0], r[1]) < 1e-9) return new Array<number>(indexed(arc) ? sides : 2).fill(point(0, 0));
    if (indexed(arc)) return shape.pts.map(([x, y]) => point(x * r[0], y * r[1]));
    // A full ring with edge vertices runs once round from the first edge angle and closes on its first vertex.
    const full = isFull(arc);
    const [a0, a1] = full ? [splitDegs[0], splitDegs[0] + 360] : [arc.a0, arc.a1];
    // Increasing polar angle (the winding of full rings) runs from the arc's clock end to its clock start.
    const p0 = f.ref - a1 * DEG;
    const p1 = f.ref - a0 * DEG;
    const wrap = (phi: number) => p0 + ((((phi - p0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
    const boundary = (phi: number) => {
      const q = sectionPoint(shape, r, Math.cos(phi), Math.sin(phi));
      return point(q.x, q.y);
    };
    const inside = [
      ...shape.pts.map(([x, y]) => ({
        phi: wrap(Math.atan2(y * r[1], x * r[0])),
        make: () => point(x * r[0], y * r[1]),
      })),
      ...splitDegs.map((d) => ({ phi: wrap(f.ref - d * DEG), make: () => boundary(f.ref - d * DEG) })),
    ]
      .filter((c) => c.phi > p0 + 1e-6 && c.phi < p1 - 1e-6)
      .sort((a, b) => a.phi - b.phi);
    const first = boundary(p0);
    return [first, ...inside.map((c) => c.make()), full ? first : boundary(p1)];
  };

  /** Triangles between consecutive rings (open arcs may differ in vertex count). */
  const connect = (buf: MeshBuffer, arc: Arc, a: number[], b: number[]) => {
    if (indexed(arc)) {
      for (let k = 0; k < sides; k++) {
        const k1 = (k + 1) % sides;
        buf.tri(a[k], b[k], b[k1]);
        buf.tri(a[k], b[k1], a[k1]);
      }
      return;
    }
    const fa = buf.fractions(a);
    const fb = buf.fractions(b);
    for (let i = 0, j = 0; i < a.length - 1 || j < b.length - 1; ) {
      if (j === b.length - 1 || (i < a.length - 1 && fa[i + 1] <= fb[j + 1])) buf.tri(a[i], b[j], a[++i]);
      else buf.tri(a[i], b[j], b[++j]);
    }
  };

  /**
   * Cap rings beyond `f` in direction `sign` (+1 = end, -1 = start), ordered away from the tube. At a cut
   * (`inside`) the dome is also kept within the continuing tube's radius and centre offset at each depth, so it
   * stays hidden on a fast taper while straight and still fills the gap when the joint bends.
   */
  const capRings = (buf: MeshBuffer, f: Frame, arc: Arc, cap: Cap, sign: number, inside: boolean) => {
    const rmax = Math.max(f.r[0], f.r[1]);
    if (rmax < 1e-9 || cap === "none" || cap === "flat") return [];
    const span = (to - from) * L;
    const dome = (d: number, scale: number): Frame => {
      const c = f.c.clone().addScaledVector(f.T, sign * d);
      if (!inside) return { ...f, c, r: [f.r[0] * scale, f.r[1] * scale] };
      const u = Math.min(Math.max(f.t + (sign * d) / span, 0), 1);
      const [rx, ry] = tube.radius(toT(u));
      const s = tube.shift(toT(u));
      c.addScaledVector(f.B, s[0] - f.s[0]).addScaledVector(f.N, s[1] - f.s[1]);
      return { ...f, c, r: [Math.min(f.r[0] * scale, rx), Math.min(f.r[1] * scale, ry)] };
    };
    if (cap === "point") return [ring(buf, dome(rmax, 0), arc)];
    // A quarter circle in as many steps as a quarter of the way round: square quads, like the tube.
    const steps = Math.max(2, Math.round(sides / 4));
    const rings: number[][] = [];
    for (let k = 1; k <= steps; k++) {
      const alpha = (k / steps) * (Math.PI / 2);
      rings.push(ring(buf, dome(rmax * Math.sin(alpha), k === steps ? 0 : Math.cos(alpha)), arc));
    }
    return rings;
  };

  const flatCap = (buf: MeshBuffer, f: Frame, arc: Arc, sign: number) => {
    if (Math.max(f.r[0], f.r[1]) < 1e-9) return;
    const center = buf.vertex(f.c, f.w, toT(f.t), 0);
    const rim = ring(buf, f, arc);
    const count = indexed(arc) ? sides : rim.length - 1;
    for (let k = 0; k < count; k++) {
      const k1 = (k + 1) % rim.length;
      if (sign > 0) buf.tri(center, rim[k1], rim[k]);
      else buf.tri(center, rim[k], rim[k1]);
    }
  };

  const capFor = (kind: string): Cap =>
    kind === "start"
      ? capStart
      : kind === "end"
        ? capEnd
        : kind === "band"
          ? "none"
          : kind === "joint" && options.overlap
            ? "flat"
            : "round";

  const result = new Sweep(tube, weightAt, [0, ...jointUs.filter((u) => u > 1e-6 && u < 1 - 1e-6), 1]);
  const bounds = [0, ...cuts.map((c) => c.t), 1];
  const kinds: string[] = ["start", ...cuts.map((c) => c.kind), "end"];
  const weld = seamSmooth && bounds.length === 2;
  const tags = { name: options.name ?? "sweep", group: options.group };
  const span = (to - from) * L;
  // Smooth skin: rings at the edges and centre of every joint's blend window, so the bend has a middle.
  const windowUs = rigidSkin ? [] : jointUs.flatMap((u, i) => [-1, 0, 1].map((f) => u + (f * half(i + 1)) / span));
  const filletUs = fillets.flatMap((f) =>
    Array.from({ length: 7 }, (_, k) => toU((f.s0 + ((f.s1 - f.s0) * (k + 1)) / 8) / L)),
  );
  let buffers: MeshBuffer[] = [];
  let groupColor: Fill = "";
  let groupJoint: Joint | null = null;
  let groupArcs = "";
  const flush = () => {
    for (const buf of buffers)
      if (buf.index.length)
        result.meshes.push(
          meshFromWorld(ctx, buf.positions, buf.index, buf.color, (v) => buf.weights[v], smooth, tags, {
            surface: buf.surface,
            wrap: true,
          }),
        );
    buffers = [];
  };

  for (let i = 0; i < bounds.length - 1; i++) {
    let a = bounds[i];
    let b = bounds[i + 1];
    const mid = (a + b) / 2;
    const color = colorAt(mid);
    // Rigid: the whole piece rides one joint. Smooth: every ring has its own weights.
    const pieceWeights = rigidSkin ? weightAt(mid) : null;
    const pieceJoint = pieceWeights?.[0][0] ?? null;
    const arcs = arcsAt(mid);
    const arcKey = arcs.map((arc) => `${arc.a0}:${arc.a1}:${arc.color}`).join();
    if (kinds[i] !== "corner" || color !== groupColor || pieceJoint !== groupJoint || arcKey !== groupArcs) {
      flush();
      groupColor = color;
      groupJoint = pieceJoint;
      groupArcs = arcKey;
      buffers = arcs.map((arc) => new MeshBuffer(arc.color ?? color));
    }
    if (options.overlap && rigidSkin) {
      if (kinds[i] === "joint") a = Math.max(0, a - (options.overlap * Math.max(...tube.radius(toT(a)))) / span);
      if (kinds[i + 1] === "joint") b = Math.min(1, b + (options.overlap * Math.max(...tube.radius(toT(b)))) / span);
    }
    const inPiece = (u: number) => u > a + 1e-6 && u < b - 1e-6;

    // Candidate ring positions, then greedy selection by turning, roll and radius/shift linearity.
    const smallCorners = tube.corners
      .filter((c) => c.angle <= CORNER_SPLIT)
      .map((c) => toU(c.t))
      .filter(inPiece);
    const mandatory = new Set([...smallCorners, ...windowUs.filter(inPiece)]);
    const us = new Set<number>([a, b, ...mandatory, ...filletUs.filter(inPiece)]);
    const steps = Math.ceil(32 * Math.max(1, detail));
    for (let k = 1; k < steps; k++) us.add(a + ((b - a) * k) / steps);
    for (const t of path.samples(from, to)) if (inPiece(toU(t))) us.add(toU(t));
    const cand = [...us]
      .sort((x, y) => x - y)
      .map((u) =>
        u === b
          ? frameAt(tube, u, "left", true)
          : smallCorners.includes(u)
            ? frameAt(tube, u, "corner", true)
            : frameAt(tube, u, "right", u === a || mandatory.has(u)),
      );
    const rmax = Math.max(...cand.map((f) => Math.max(...f.r)));
    const tol = (0.03 / detail) * rmax + 1e-6;
    const keys = (f: Frame) => [...f.r, ...f.s];
    // Rings are never closer than about the edge length around the tube, so bends, tapers and joints don't clump.
    const gap = (f: Frame) => (RING_GAP * 2 * Math.PI * Math.max(...f.r)) / sides;
    const fits = (k: number, j: number) => {
      if ((cand[j].t - cand[k].t) * span < gap(cand[k])) return true;
      if (cand[k].T.angleTo(cand[j].T) > maxTurn || cand[k].N.angleTo(cand[j].N) > maxTurn) return false;
      const [ka, kb] = [keys(cand[k]), keys(cand[j])];
      for (let m = k + 1; m < j; m++) {
        const s = (cand[m].t - cand[k].t) / (cand[j].t - cand[k].t);
        const km = keys(cand[m]);
        for (let axis = 0; axis < km.length; axis++)
          if (Math.abs(km[axis] - (ka[axis] + (kb[axis] - ka[axis]) * s)) > tol) return false;
      }
      return true;
    };
    const chosen = [cand[0]];
    for (let k = 0; k < cand.length - 1; ) {
      let best = k + 1;
      for (let j = k + 1; j < cand.length && fits(k, j); j++) {
        best = j;
        if (cand[j].mandatory) break;
      }
      chosen.push(cand[best]);
      k = best;
    }
    const kept = chosen.map((f) => posed(tube, f, pieceWeights ?? weightAt(f.t)));
    const pushed = (f: Frame, d: number) => ({ ...f, c: f.c.clone().addScaledVector(f.T, d) });
    if (i === 0 && extendStart > 0) kept.unshift(pushed(kept[0], -extendStart));
    if (i === bounds.length - 2 && extendEnd > 0) kept.push(pushed(kept[kept.length - 1], extendEnd));

    const first = kept[0];
    const last = kept[kept.length - 1];
    const startCap = capFor(kinds[i]);
    const endCap = capFor(kinds[i + 1]);
    arcs.forEach((arc, k) => {
      const buf = buffers[k];
      const body: number[][] = [];
      for (const [j, f] of kept.entries()) body.push(weld && j === kept.length - 1 ? body[0] : ring(buf, f, arc));
      const rings = [
        ...capRings(buf, first, arc, startCap, -1, kinds[i] !== "start").reverse(),
        ...body,
        ...capRings(buf, last, arc, endCap, 1, kinds[i + 1] !== "end"),
      ];
      for (let j = 0; j < rings.length - 1; j++) connect(buf, arc, rings[j], rings[j + 1]);
      if (startCap === "flat") flatCap(buf, first, arc, -1);
      if (endCap === "flat") flatCap(buf, last, arc, 1);
    });
  }
  flush();
  return result;
}
