// `sweep()`: the one tube primitive. A section swept along a path (one mesh on one bone) or a chain (one mesh
// per joint span), with continuous radius, parallel-transported roll, adaptive ring spacing and caps.
import { Vector3 } from "three";
import type { Mesh } from "three";
import { meshFromWorld, resolveJoint } from "./context";
import type { Ctx, JointRef, Tags } from "./context";
import { flatten } from "./math";
import type { V3 } from "./math";
import { toPath } from "./path";
import type { Frames, Path, PathLike } from "./path";
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
  /** Owning bone for a Path source (default root joint). Ignored for Chain sources. */
  bone?: JointRef;
  /** Split a Path source into one mesh per joint of this chain, cut where the path passes each joint. */
  split?: Chain;
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
  /** Path sources: start roll, the section's normal (ry direction) leans toward `up`. */
  up?: V3;
};

/** A point on a sweep's built surface. */
export type SweepPoint = { t: number; p: Vector3; n: Vector3; tangent: Vector3; radius: number; joint: Joint };

type Shape = { pts: Array<[number, number]>; smooth: boolean };
type Cut = { t: number; kind: "joint" | "corner" | "band" };
type Frame = { t: number; c: Vector3; T: Vector3; N: Vector3; r: [number, number]; mandatory: boolean };

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

function radiusFn(radius: Radius): (t: number) => [number, number] {
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

export class Sweep {
  constructor(
    readonly meshes: Mesh[],
    readonly path: Path,
    private readonly frames: Frames,
    private readonly range: [number, number],
    private readonly radius: (t: number) => [number, number],
    private readonly shape: Shape,
    private readonly jointAt: (sourceT: number) => Joint,
  ) {}

  /**
   * A point on the built tube surface at sweep t, pushed out `lift` along the surface normal. `angleDeg` goes
   * around the section: 0 = the side facing world up (the tube's normal side where the tube is vertical),
   * +90 = a quarter turn clockwise seen looking along the tube (for a tube running toward +Z: its -X side).
   */
  at(t: number, angleDeg = 0, lift = 0): SweepPoint {
    const [from, to] = this.range;
    const st = from + t * (to - from);
    const c = this.path.at(st);
    const T = this.path.tangentAt(st);
    const N = flatten(this.frames.normalAt(st), T).normalize();
    const B = T.clone().cross(N);
    const up = flatten(new Vector3(0, 1, 0), T);
    const ref = up.lengthSq() > 1e-6 ? up.normalize() : N;
    const rb = ref.dot(B);
    const rn = ref.dot(N);
    const a = (angleDeg * Math.PI) / 180;
    const dx = rb * Math.cos(a) + rn * Math.sin(a);
    const dy = rn * Math.cos(a) - rb * Math.sin(a);
    const q = sectionPoint(this.shape, this.radius(t), dx, dy);
    const extent = (u: number) => {
      const e = sectionPoint(this.shape, this.radius(u), dx, dy);
      return Math.hypot(e.x, e.y);
    };
    const t0 = Math.max(0, t - 1e-3);
    const t1 = Math.min(1, t + 1e-3);
    const slope = (extent(t1) - extent(t0)) / ((t1 - t0) * (to - from) * this.path.length);
    const radial = Math.hypot(q.x, q.y);
    const nSec = B.clone().multiplyScalar(q.nx).addScaledVector(N, q.ny);
    const along = radial > 0 ? (q.nx * q.x + q.ny * q.y) / radial : 1;
    const n = nSec.addScaledVector(T, -slope * along).normalize();
    const p = c.addScaledVector(B, q.x).addScaledVector(N, q.y).addScaledVector(n, lift);
    return { t, p, n, tangent: T, radius: radial, joint: this.jointAt(st) };
  }
}

export function sweep(ctx: Ctx, source: PathLike | Chain, radius: Radius, options: SweepOptions = {}) {
  const chain = source instanceof Chain ? source : null;
  const path = source instanceof Chain ? source.path : toPath(source);
  const frames = chain ? chain.frames : path.frames(options.up);
  const from = options.from ?? 0;
  const to = options.to ?? 1;
  const toT = (u: number) => from + u * (to - from);
  const toU = (t: number) => (t - from) / (to - from);
  const rOf = radiusFn(radius);
  const shape = sectionShape(options.section ?? "circle", options.sides ?? 8);
  const smooth = options.smooth ?? shape.smooth;
  const capStart = typeof options.caps === "object" ? (options.caps.start ?? "round") : (options.caps ?? "round");
  const capEnd = typeof options.caps === "object" ? (options.caps.end ?? "round") : (options.caps ?? "round");
  const sides = shape.pts.length;
  if (!(from < to)) throw new Error(`sweep(): from (${from}) must be less than to (${to})`);

  // Bone boundaries in source t.
  const bones = chain ?? options.split ?? null;
  const boneTs = chain ? chain.ts.slice(0, -1) : bones ? bones.joints.map((j) => path.closestT(j.at)) : [0];
  const boneJoints = bones ? bones.joints : [resolveJoint(ctx, options.bone)];
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
  const corners = path.corners(from, to);
  for (const corner of corners) if (corner.angle > CORNER_SPLIT) addCut(toU(corner.t), "corner");
  for (const [tEnd] of options.bands ?? []) addCut(tEnd, "band");
  cuts.sort((a, b) => a.t - b.t);

  const colorAt = (u: number) => {
    for (const [tEnd, color] of options.bands ?? []) if (u <= tEnd) return color;
    const color = typeof options.color === "function" ? options.color(u) : options.color;
    if (!color) throw new Error("sweep(): no color for t=" + u.toFixed(3) + "; pass `color` or cover it with `bands`");
    return color;
  };

  /** Ring frame at sweep t. `side` picks the incoming tangent at a corner ("left") or the averaged one. */
  const frameAt = (u: number, side: "left" | "right" | "corner", mandatory = false): Frame => {
    const t = toT(u);
    const left = side === "left";
    let T = path.tangentAt(t, left);
    if (side === "corner") {
      const corner = corners.find((c) => Math.abs(c.t - t) < 1e-9);
      if (corner) T = corner.tin.clone().add(corner.tout).normalize();
    }
    const N = flatten(frames.normalAt(t, left), T).normalize();
    return { t: u, c: path.at(t), T, N, r: rOf(u), mandatory };
  };

  const meshes: Mesh[] = [];
  const bounds = [0, ...cuts.map((c) => c.t), 1];
  const kinds: string[] = ["start", ...cuts.map((c) => c.kind), "end"];
  let positions: number[] = [];
  let index: number[] = [];
  let groupColor = "";
  let groupJoint: Joint | null = null;

  const flush = () => {
    if (groupJoint && index.length)
      meshes.push(
        meshFromWorld(ctx, positions, index, groupColor, groupJoint, smooth, {
          name: options.name ?? "sweep",
          group: options.group,
        }),
      );
    positions = [];
    index = [];
  };

  const vertex = (p: Vector3) => {
    positions.push(p.x, p.y, p.z);
    return positions.length / 3 - 1;
  };

  const ringVerts = (c: Vector3, T: Vector3, N: Vector3, r: [number, number], scale = 1) => {
    if (Math.max(r[0], r[1]) * scale < 1e-9) return new Array<number>(sides).fill(vertex(c));
    const B = T.clone().cross(N);
    return shape.pts.map(([x, y]) =>
      vertex(
        c
          .clone()
          .addScaledVector(B, x * r[0] * scale)
          .addScaledVector(N, y * r[1] * scale),
      ),
    );
  };

  const connect = (a: number[], b: number[]) => {
    for (let k = 0; k < sides; k++) {
      const k1 = (k + 1) % sides;
      const quad = [a[k], b[k], b[k1], a[k1]];
      for (const [i, j, l] of [
        [quad[0], quad[1], quad[2]],
        [quad[0], quad[2], quad[3]],
      ])
        if (i !== j && j !== l && i !== l) index.push(i, j, l);
    }
  };

  /** Cap rings beyond `f` in direction `sign` (+1 = end, -1 = start), ordered away from the tube. */
  const capRings = (f: Frame, cap: Cap, sign: number) => {
    const rmax = Math.max(f.r[0], f.r[1]);
    if (rmax < 1e-9 || cap === "none" || cap === "flat") return [];
    const dir = f.T.clone().multiplyScalar(sign);
    if (cap === "point") return [ringVerts(f.c.clone().addScaledVector(dir, rmax), f.T, f.N, f.r, 0)];
    const steps = Math.max(2, Math.round(sides / 3));
    const rings: number[][] = [];
    for (let k = 1; k <= steps; k++) {
      const alpha = (k / steps) * (Math.PI / 2);
      rings.push(
        ringVerts(
          f.c.clone().addScaledVector(dir, rmax * Math.sin(alpha)),
          f.T,
          f.N,
          f.r,
          k === steps ? 0 : Math.cos(alpha),
        ),
      );
    }
    return rings;
  };

  const flatCap = (f: Frame, sign: number) => {
    if (Math.max(f.r[0], f.r[1]) < 1e-9) return;
    const center = vertex(f.c);
    const ring = ringVerts(f.c, f.T, f.N, f.r);
    for (let k = 0; k < sides; k++) {
      const k1 = (k + 1) % sides;
      if (sign > 0) index.push(center, ring[k1], ring[k]);
      else index.push(center, ring[k], ring[k1]);
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
    }
    const span = (to - from) * path.length;
    if (options.overlap) {
      if (kinds[i] === "joint") a = Math.max(0, a - (options.overlap * Math.max(...rOf(a))) / span);
      if (kinds[i + 1] === "joint") b = Math.min(1, b + (options.overlap * Math.max(...rOf(b))) / span);
    }

    // Candidate ring positions, then greedy selection by turning angle and radius linearity.
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
    const sorted = [...us].sort((x, y) => x - y);
    const cand = sorted.map((u) =>
      u === b
        ? frameAt(u, "left", true)
        : smallCorners.includes(u)
          ? frameAt(u, "corner", true)
          : frameAt(u, "right", u === a),
    );
    const rmax = Math.max(...cand.map((f) => Math.max(...f.r)));
    const tol = 0.03 * rmax + 1e-6;
    const fits = (k: number, j: number) => {
      if (cand[k].T.angleTo(cand[j].T) > MAX_TURN) return false;
      for (let m = k + 1; m < j; m++) {
        const s = (cand[m].t - cand[k].t) / (cand[j].t - cand[k].t);
        for (const axis of [0, 1])
          if (Math.abs(cand[m].r[axis] - (cand[k].r[axis] + (cand[j].r[axis] - cand[k].r[axis]) * s)) > tol)
            return false;
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

    const first = kept[0];
    const last = kept[kept.length - 1];
    const startCap = capFor(kinds[i]);
    const endCap = capFor(kinds[i + 1]);
    const rings = [
      ...capRings(first, startCap, -1).reverse(),
      ...kept.map((f) => ringVerts(f.c, f.T, f.N, f.r)),
      ...capRings(last, endCap, 1),
    ];
    for (let k = 0; k < rings.length - 1; k++) connect(rings[k], rings[k + 1]);
    if (startCap === "flat") flatCap(first, -1);
    if (endCap === "flat") flatCap(last, 1);
  }
  flush();

  return new Sweep(meshes, path, frames, [from, to], rOf, shape, jointAt);
}
