// `sweep()`: the one tube primitive. A section swept along a path (one mesh on one bone) or a chain (one mesh
// per joint span), with continuous radius, parallel-transported roll, adaptive ring spacing, caps, colour bands
// along the tube and colour sectors around it.
import { Vector3 } from "three";
import type { Mesh } from "three";
import { meshFromWorld, resolveJoint } from "./context";
import type { Ctx, JointRef, Tags } from "./context";
import { DEG, flatten } from "./math";
import type { V3 } from "./math";
import { smoothPath, toPath } from "./path";
import type { Corner, Frames, Path, PathLike, Twist } from "./path";
import { Chain } from "./skeleton";
import type { Joint } from "./skeleton";

export type Cap = "round" | "flat" | "point" | "none";
export type Section = "circle" | "box" | { ngon: number };
/**
 * number | [r0, r1] (linear) | number[] (evenly keyed, smooth) | (t) => number | (t) => [rx, ry].
 * rx runs along the binormal (side), ry along the normal (up). For "box", these are half extents.
 */
export type Radius = number | readonly number[] | ((t: number) => number | readonly [number, number]);

export type SweepOptions = Tags & {
  /** Color of every piece, or per piece from its mid t. Optional when `bands` cover the whole sweep. */
  color?: string | ((t: number) => string);
  /** `[[tEnd, color], ...]` ascending: color bands; each band edge splits the mesh (same bone, no cap). */
  bands?: ReadonlyArray<readonly [number, string]>;
  /**
   * Owner for a Path source: a joint (default: the root joint), or a Chain the path runs along (same direction):
   * one mesh per joint, cut where the path passes each joint. Chain sources always use their own joints.
   */
  bone?: JointRef | Chain;
  /** Range of the source to sweep, in source t. All other t (radius, color, bands, at) run 0..1 over this range. */
  from?: number;
  to?: number;
  section?: Section;
  /** Circle sides (default 8). */
  sides?: number;
  /** Smooth normals (default: circle smooth, box/ngon faceted). */
  smooth?: boolean;
  caps?: Cap | { start?: Cap; end?: Cap };
  /** Instead of round caps at bone cuts, extend each piece past the cut by `overlap` × local radius (flat end). */
  overlap?: number;
  /** Extend straight past the start / end along the end tangent at the end radius, in meters (number = both). */
  extend?: number | readonly [number, number];
  /**
   * Colour sectors around the tube, `[[fromDeg, toDeg, color], ...]` on the dorsal clock of `Sweep.at` (0 = the
   * side facing world up, 180 = belly). Uncovered angles keep the piece colour. One mesh per sector per piece;
   * sector edges get no walls and neighbours share them exactly.
   */
  sectors?: ReadonlyArray<readonly [number, number, string]>;
  /** Section centre offset `[x, y]` in the same (binormal, normal) axes as `(t) => [rx, ry]`: a sagging belly. */
  shift?: readonly [number, number] | ((t: number) => readonly [number, number]);
  /** Path sources: start roll, the section's normal (ry direction) leans toward `up`. */
  up?: V3;
  /** Path sources: roll about the tangent after parallel transport, total degrees or `(t) => deg` (chains: on `chain()`). */
  twist?: Twist;
};

/** A point on a sweep's built surface. */
export type SweepPoint = { t: number; p: Vector3; n: Vector3; tangent: Vector3; radius: number; joint: Joint };

type Shape = { pts: Array<[number, number]>; smooth: boolean };
type Cut = { t: number; kind: "joint" | "corner" | "band" };
/** Everything that places a ring: shared by mesh building and the surface queries of `Sweep`. */
type Tube = {
  path: Path;
  frames: Frames;
  from: number;
  to: number;
  radius: (t: number) => [number, number];
  shift: (t: number) => readonly [number, number];
  shape: Shape;
  corners: Corner[];
  closed: boolean;
  /** Averaged tangent at the seam of a closed tube whose seam is smooth; both end rings use it. */
  seam: Vector3 | null;
};
/** A ring: sweep t, centre, tangent/normal/binormal, radii, polar angle of the dorsal side in (B, N). */
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
};
/** A clock interval in degrees (a0 < a1) with its colour; null = the piece colour. */
type Arc = { a0: number; a1: number; color: string | null };

const CORNER_SPLIT = 20 * (Math.PI / 180);
const MAX_TURN = 10 * (Math.PI / 180);

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

/** The ring at sweep t. `side`: incoming tangent at a corner ("left"), outgoing ("right") or their average. */
function frameAt(tube: Tube, u: number, side: "left" | "right" | "corner", mandatory = false): Frame {
  const t = tube.from + u * (tube.to - tube.from);
  const seamEnd = tube.seam !== null && (u <= 0 || u >= 1);
  let T = seamEnd ? tube.seam!.clone() : tube.path.tangentAt(t, side === "left");
  if (side === "corner") {
    const corner = tube.corners.find((c) => Math.abs(c.t - t) < 1e-9);
    if (corner) T = corner.tin.clone().add(corner.tout).normalize();
  }
  const N = flatten(tube.frames.normalAt(seamEnd ? 0 : t, side === "left"), T).normalize();
  const B = T.clone().cross(N);
  const s = tube.shift(u);
  const c = tube.path.at(t).addScaledVector(B, s[0]).addScaledVector(N, s[1]);
  const up = flatten(new Vector3(0, 1, 0), T);
  const ref = up.lengthSq() > 1e-6 ? up.normalize() : N;
  return { t: u, c, T, N, B, r: tube.radius(u), s, ref: Math.atan2(ref.dot(N), ref.dot(B)), mandatory };
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
    private readonly jointAt: (sourceT: number) => Joint,
    /** Sweep t of the start, every bone cut and the end. */
    private readonly knots: number[],
  ) {}

  get path() {
    return this.tube.path;
  }

  /**
   * A point on the built tube surface at sweep t, pushed out `lift` along the surface normal. `angleDeg` goes
   * around the section: 0 = the side facing world up (the tube's normal side where the tube is vertical),
   * +90 = a quarter turn clockwise seen looking along the tube (for a tube running toward +Z: its -X side).
   */
  at(t: number, angleDeg = 0, lift = 0): SweepPoint {
    const f = frameAt(this.tube, t, "right");
    const { p, q, nSec } = surfacePoint(this.tube, f, angleDeg);
    const ahead = surfacePoint(this.tube, frameAt(this.tube, Math.min(1, t + 1e-3), "right"), angleDeg).p;
    const behind = surfacePoint(this.tube, frameAt(this.tube, Math.max(0, t - 1e-3), "right"), angleDeg).p;
    const along = ahead.sub(behind);
    const lean = f.T.dot(along);
    const n = (Math.abs(lean) > 1e-12 ? nSec.addScaledVector(f.T, -nSec.dot(along) / lean) : nSec).normalize();
    const sourceT = this.tube.from + t * (this.tube.to - this.tube.from);
    return {
      t,
      p: p.addScaledVector(n, lift),
      n,
      tangent: f.T,
      radius: Math.hypot(q.x, q.y),
      joint: this.jointAt(sourceT),
    };
  }

  /**
   * The curve along the built surface at clock `angleDeg` (0 = dorsal ridge), `lift` above it, with knots at the
   * bone cuts: a membrane or sweep edge that lies on the skin. Closed tubes give closed lines.
   */
  line(angleDeg: number, lift = 0) {
    const count = 64;
    const pts = Array.from({ length: count + 1 }, (_, i) => this.at(i / count, angleDeg, lift).p);
    const indices = [...new Set(this.knots.map((u) => Math.round(u * count)))];
    return smoothPath(pts, null, { indices }, this.tube.seam !== null);
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

  constructor(
    readonly color: string,
    readonly joint: Joint,
  ) {}

  vertex(p: Vector3) {
    this.positions.push(p.x, p.y, p.z);
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

export function sweep(ctx: Ctx, source: PathLike | Chain, radius: Radius, options: SweepOptions = {}) {
  const chain = source instanceof Chain ? source : null;
  const path = source instanceof Chain ? source.path : toPath(source);
  const from = options.from ?? 0;
  const to = options.to ?? 1;
  if (!(from < to)) throw new Error(`sweep(): from (${from}) must be less than to (${to})`);
  const toT = (u: number) => from + u * (to - from);
  const toU = (t: number) => (t - from) / (to - from);
  const { twist, shift } = options;
  const frames = chain
    ? chain.frames
    : path.frames(options.up, typeof twist === "function" ? (t) => twist(toU(t)) : twist);
  const shape = sectionShape(options.section ?? "circle", options.sides ?? 8);
  const smooth = options.smooth ?? shape.smooth;
  const sides = shape.pts.length;
  const closed = path.closed && from === 0 && to === 1;
  const seamIn = path.tangentAt(1, true);
  const seamOut = path.tangentAt(0);
  const seamSmooth = closed && seamIn.angleTo(seamOut) <= CORNER_SPLIT;
  const corners = path.corners(from, to);
  const tube: Tube = {
    path,
    frames,
    from,
    to,
    radius: radiusFn(radius),
    shift: typeof shift === "function" ? shift : () => shift ?? [0, 0],
    shape,
    corners,
    closed,
    seam: seamSmooth ? seamIn.add(seamOut).normalize() : null,
  };
  const caps = typeof options.caps === "object" ? options.caps : { start: options.caps, end: options.caps };
  const seamCap: Cap = seamSmooth ? "none" : "round";
  const capStart = closed ? seamCap : (caps.start ?? "round");
  const capEnd = closed ? seamCap : (caps.end ?? "round");
  const [extendStart, extendEnd] = closed
    ? [0, 0]
    : typeof options.extend === "number"
      ? [options.extend, options.extend]
      : (options.extend ?? [0, 0]);

  // Bone boundaries in source t.
  const owner = options.bone;
  const bones = chain ?? (owner instanceof Chain ? owner : null);
  const boneTs = chain ? chain.ts.slice(0, -1) : bones ? bones.joints.map((j) => path.closestT(j.at)) : [0];
  const boneJoints = bones ? bones.joints : [resolveJoint(ctx, owner instanceof Chain ? undefined : owner)];
  const jointAt = (t: number) => {
    let i = 0;
    while (i < boneTs.length - 1 && boneTs[i + 1] <= t) i++;
    return boneJoints[i];
  };

  // Cuts, in sweep t (u), ascending.
  const cuts: Cut[] = [];
  const addCut = (u: number, kind: Cut["kind"]) => {
    if (u <= 1e-6 || u >= 1 - 1e-6) return;
    const existing = cuts.find((c) => Math.abs(c.t - u) < 1e-6);
    if (!existing) cuts.push({ t: u, kind });
    else if (kind === "joint" || (kind === "corner" && existing.kind === "band")) existing.kind = kind;
  };
  for (const t of boneTs.slice(1)) addCut(toU(t), "joint");
  for (const corner of corners) if (corner.angle > CORNER_SPLIT) addCut(toU(corner.t), "corner");
  for (const [tEnd] of options.bands ?? []) addCut(tEnd, "band");
  cuts.sort((a, b) => a.t - b.t);

  const colorAt = (u: number) => {
    for (const [tEnd, color] of options.bands ?? []) if (u <= tEnd) return color;
    const color = typeof options.color === "function" ? options.color(u) : options.color;
    if (!color) throw new Error("sweep(): no color for t=" + u.toFixed(3) + "; pass `color` or cover it with `bands`");
    return color;
  };

  const arcs = clockArcs(options.sectors);
  const full = arcs.length === 1;

  /** Ring vertices of `arc` at frame `f`, scaled toward the centre by `scale` (caps). Full rings are closed. */
  const ring = (buf: MeshBuffer, f: Frame, arc: Arc, scale = 1) => {
    const r: [number, number] = [f.r[0] * scale, f.r[1] * scale];
    const point = (x: number, y: number) => buf.vertex(f.c.clone().addScaledVector(f.B, x).addScaledVector(f.N, y));
    if (Math.max(r[0], r[1]) < 1e-9) return new Array<number>(full ? sides : 2).fill(point(0, 0));
    if (full) return shape.pts.map(([x, y]) => point(x * r[0], y * r[1]));
    // Increasing polar angle (the winding of full rings) runs from the arc's clock end to its clock start.
    const p0 = f.ref - arc.a1 * DEG;
    const p1 = f.ref - arc.a0 * DEG;
    const boundary = (phi: number) => {
      const q = sectionPoint(shape, r, Math.cos(phi), Math.sin(phi));
      return point(q.x, q.y);
    };
    const inside = shape.pts
      .map(([x, y]) => {
        const phi = Math.atan2(y * r[1], x * r[0]);
        return { x: x * r[0], y: y * r[1], phi: p0 + ((((phi - p0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) };
      })
      .filter((c) => c.phi > p0 + 1e-6 && c.phi < p1 - 1e-6)
      .sort((a, b) => a.phi - b.phi);
    return [boundary(p0), ...inside.map((c) => point(c.x, c.y)), boundary(p1)];
  };

  /** Triangles between consecutive rings (open arcs may differ in vertex count). */
  const connect = (buf: MeshBuffer, a: number[], b: number[]) => {
    if (full) {
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
    const span = (to - from) * path.length;
    const dome = (d: number, scale: number): Frame => {
      const c = f.c.clone().addScaledVector(f.T, sign * d);
      if (!inside) return { ...f, c, r: [f.r[0] * scale, f.r[1] * scale] };
      const u = Math.min(Math.max(f.t + (sign * d) / span, 0), 1);
      const [rx, ry] = tube.radius(u);
      const s = tube.shift(u);
      c.addScaledVector(f.B, s[0] - f.s[0]).addScaledVector(f.N, s[1] - f.s[1]);
      return { ...f, c, r: [Math.min(f.r[0] * scale, rx), Math.min(f.r[1] * scale, ry)] };
    };
    if (cap === "point") return [ring(buf, dome(rmax, 0), arc)];
    const steps = Math.max(2, Math.round(sides / 3));
    const rings: number[][] = [];
    for (let k = 1; k <= steps; k++) {
      const alpha = (k / steps) * (Math.PI / 2);
      rings.push(ring(buf, dome(rmax * Math.sin(alpha), k === steps ? 0 : Math.cos(alpha)), arc));
    }
    return rings;
  };

  const flatCap = (buf: MeshBuffer, f: Frame, arc: Arc, sign: number) => {
    if (Math.max(f.r[0], f.r[1]) < 1e-9) return;
    const center = buf.vertex(f.c);
    const rim = ring(buf, f, arc);
    const count = full ? sides : rim.length - 1;
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

  const result = new Sweep(tube, jointAt, [0, ...cuts.filter((c) => c.kind === "joint").map((c) => c.t), 1]);
  const bounds = [0, ...cuts.map((c) => c.t), 1];
  const kinds: string[] = ["start", ...cuts.map((c) => c.kind), "end"];
  const weld = seamSmooth && bounds.length === 2;
  const tags = { name: options.name ?? "sweep", group: options.group };
  let buffers: MeshBuffer[] = [];
  let groupColor = "";
  let groupJoint: Joint | null = null;
  const flush = () => {
    for (const buf of buffers)
      if (buf.index.length)
        result.meshes.push(meshFromWorld(ctx, buf.positions, buf.index, buf.color, buf.joint, smooth, tags));
    buffers = [];
  };

  for (let i = 0; i < bounds.length - 1; i++) {
    let a = bounds[i];
    let b = bounds[i + 1];
    const mid = (a + b) / 2;
    const color = colorAt(mid);
    const joint = jointAt(toT(mid));
    if (kinds[i] !== "corner" || color !== groupColor || joint !== groupJoint) {
      flush();
      groupColor = color;
      groupJoint = joint;
      buffers = arcs.map((arc) => new MeshBuffer(arc.color ?? color, joint));
    }
    const span = (to - from) * path.length;
    if (options.overlap) {
      if (kinds[i] === "joint") a = Math.max(0, a - (options.overlap * Math.max(...tube.radius(a))) / span);
      if (kinds[i + 1] === "joint") b = Math.min(1, b + (options.overlap * Math.max(...tube.radius(b))) / span);
    }

    // Candidate ring positions, then greedy selection by turning, roll and radius/shift linearity.
    const smallCorners = corners
      .filter((c) => c.angle <= CORNER_SPLIT)
      .map((c) => toU(c.t))
      .filter((u) => u > a + 1e-6 && u < b - 1e-6);
    const us = new Set<number>([a, b, ...smallCorners]);
    for (let k = 1; k < 32; k++) us.add(a + ((b - a) * k) / 32);
    for (const t of path.samples(from, to)) {
      const u = toU(t);
      if (u > a + 1e-6 && u < b - 1e-6) us.add(u);
    }
    const cand = [...us]
      .sort((x, y) => x - y)
      .map((u) =>
        u === b
          ? frameAt(tube, u, "left", true)
          : smallCorners.includes(u)
            ? frameAt(tube, u, "corner", true)
            : frameAt(tube, u, "right", u === a),
      );
    const rmax = Math.max(...cand.map((f) => Math.max(...f.r)));
    const tol = 0.03 * rmax + 1e-6;
    const keys = (f: Frame) => [...f.r, ...f.s];
    const fits = (k: number, j: number) => {
      if (cand[k].T.angleTo(cand[j].T) > MAX_TURN || cand[k].N.angleTo(cand[j].N) > MAX_TURN) return false;
      const [ka, kb] = [keys(cand[k]), keys(cand[j])];
      for (let m = k + 1; m < j; m++) {
        const s = (cand[m].t - cand[k].t) / (cand[j].t - cand[k].t);
        const km = keys(cand[m]);
        for (let axis = 0; axis < km.length; axis++)
          if (Math.abs(km[axis] - (ka[axis] + (kb[axis] - ka[axis]) * s)) > tol) return false;
      }
      return true;
    };
    const kept = [cand[0]];
    for (let k = 0; k < cand.length - 1; ) {
      let best = k + 1;
      for (let j = k + 1; j < cand.length && fits(k, j); j++) {
        best = j;
        if (cand[j].mandatory) break;
      }
      kept.push(cand[best]);
      k = best;
    }
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
      for (let j = 0; j < rings.length - 1; j++) connect(buf, rings[j], rings[j + 1]);
      if (startCap === "flat") flatCap(buf, first, arc, -1);
      if (endCap === "flat") flatCap(buf, last, arc, 1);
    });
  }
  flush();
  return result;
}
