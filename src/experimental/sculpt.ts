// Sculpting: brushes that reshape built meshes (sweeps, lofts, parts) after a blockout. See the doc comment below.
import { Box3, BufferGeometry, Float32BufferAttribute, Matrix3, Vector3 } from "three";
import type { Mesh } from "three";
import type { Builder } from "../builder";
import { mix, skinMesh, vertexWeights, writeWeights } from "../context";
import type { Ctx, Weights } from "../context";
import { DEG, toDirection, toPoint } from "../math";
import type { DirectionInput, PointInput } from "../math";
import { toPath } from "../path";
import type { PathInput } from "../path";
import { Surface } from "../surface";
import type { SurfaceTarget } from "../surface";

/**
 * # Sculpting
 *
 * `sculpt(b)` reshapes meshes you already built, the way an artist works from a blockout: build the body with
 * sweeps, lofts and parts, then push, flatten, inflate, crease and smooth it with brushes. A brush acts on any built
 * mesh: a `Sweep` (all its pieces), a `Part`, a `Joint` (the meshes on it), a raw `Mesh`, or an array of these.
 *
 * ```ts
 * import { sculpt } from "../src/experimental/sculpt";
 *
 * const sc = sculpt(b); // { mirror: false } turns the default mirroring off
 * const body = [torso, armL, armR, legL, legR];
 * sc.inflate(body, { at: chestPoint, radius: 0.09, amount: 0.02 }); // a pectoral, mirrored to the other side
 * sc.flatten(torso, { at: belly, dir: [0, 0, 1], radius: 0.12 }); // level a stretch of belly toward a plane
 * sc.push(armL, { path: [shoulder, elbow], dir: [0, 0, -1], radius: [0.05, 0.03], amount: 0.01 }); // a stroke
 * sc.crease(torso, { path: [[0, 1.3, 0.1], [0, 1.0, 0.11]], depth: 0.006, radius: 0.012 }); // a groove
 * sc.smooth(armL, { at: elbow, radius: 0.1 });
 * ```
 *
 * ## Brushes
 *
 * Every brush takes a target first, then options. Where it acts is `at` (a Point: a joint, hit, `sweep.at(t)`,
 * `chain.at(t)`, a literal) or `path` (a Path: points, `catmull(...)`, a Chain or a Sweep, `sweep.line(deg)`); a
 * `path` is a stroke, so the brush follows a line and a muscle is one call. Directions and planes (`dir`) are any
 * Direction: a literal, or a frame's facing axis (`dir: hit`). `radius` is the reach in meters; the effect fades
 * smoothly to zero at the edge.
 *
 * | Call                                                        | Effect                                                                    |
 * | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
 * | `sc.push(t, { at \| path, dir, amount, radius })`           | moves the region `amount` meters along `dir` (negative pulls it back)     |
 * | `sc.flatten(t, { at \| path, dir, radius, strength?, side? })` | moves the region onto the plane through `at` (or the nearest stroke point) with normal `dir`; `strength` 0..1, default 1; `side: "front"` moves only what lies on the `dir` side of the plane (shaves), `"back"` only what lies behind it (fills) |
 * | `sc.inflate(t, { at \| path, amount, radius })`             | moves the region along the surface normal: out for positive, in for negative |
 * | `sc.crease(t, { path, depth, radius })`                     | cuts a groove `depth` deep along the path, `radius` wide each side; negative depth raises a ridge |
 * | `sc.smooth(t, { at \| path, radius, strength?, passes? })`  | relaxes the region toward its neighbours (strength 0..1, default 0.5; passes, default 2) |
 *
 * - `radius` and `amount` / `depth` are a number, `[start, end]` (linear along a stroke), a `number[]` (evenly
 *   keyed along it, linear) or `(t) => number` where `t` is the stroke's arc-length fraction: a biceps that swells
 *   in the middle is `amount: [0.004, 0.02, 0.008]`. A point brush is `t = 0`.
 * - `core` (0..1, default 0) is the share of the radius inside which the brush acts at full strength before it fades.
 * - `mirror` (default true) also applies the brush mirrored across x = 0: points, strokes and directions flip
 *   sign in x. Where a brush and its mirror overlap (near the centre line) they blend into one, never double.
 * - `edge` (meters) is the longest triangle edge the brush may leave inside its region, default half its
 *   radius (two thirds for `crease`; at least 4 mm). Where the mesh has longer edges the layer splits them locally, in every target
 *   at once, so meshes that share a boundary stay closed. A larger `edge` keeps the mesh coarse and faceted; a
 *   smaller one gives a brush finer detail and costs triangles.
 *
 * ## Rules
 *
 * - Vertices keep their skin weights (new ones take the mean of their edge's ends), so sculpted skin bends with
 *   the skeleton, and rigid meshes stay rigid on their bone.
 * - Brushes apply in code order and the result is deterministic. `b.surface(...)` queries and `hit`s made after a
 *   brush see the sculpted shape; a `sweep.at(t)` keeps answering with the tube as it was built.
 * - Smooth meshes (sweeps, lofts, three.js geometries) stay smooth-shaded and creased faces stay creased; faceted
 *   meshes stay faceted.
 * - Painted, textured and card meshes can't be sculpted: sculpt first with plain colours (or `bands`/`sectors`).
 * - A brush does nothing to a mesh it doesn't reach. To sculpt a shape that spans several pieces (a torso in
 *   loft segments, both arms), pass all of them in one target so their shared edges stay together.
 */

/** A number, `[start, end]`, evenly keyed numbers, or a function of the stroke's arc-length fraction. */
export type Profile = number | readonly number[] | ((t: number) => number);

type Where = { at: PointInput; path?: undefined } | { path: PathInput; at?: undefined };

/** Options every brush shares. */
export type BrushOptions = {
  radius: Profile;
  /** Fraction of the radius (0..1, default 0) inside which the brush acts at full strength before it fades. */
  core?: number;
  mirror?: boolean;
  edge?: number;
};

export type PushOptions = BrushOptions & Where & { dir: DirectionInput; amount: Profile };
export type FlattenOptions = BrushOptions &
  Where & {
    dir: DirectionInput;
    strength?: number;
    /** "front" moves only what lies on the `dir` side of the plane (it shaves), "back" only what lies behind (it fills). */
    side?: "front" | "back";
  };
export type InflateOptions = BrushOptions & Where & { amount: Profile };
export type CreaseOptions = BrushOptions & { path: PathInput; depth: Profile };
export type SmoothOptions = BrushOptions & Where & { strength?: number; passes?: number };

/** `sculpt(b)`: the brushes, mirrored across x = 0 unless `mirror: false`. */
export function sculpt(b: Builder, options: { mirror?: boolean } = {}) {
  return new Sculpt(b.ctx, options.mirror ?? true);
}

const CREASE_ANGLE = Math.cos(75 * DEG);
const MIN_EDGE = 0.004;
const MAX_TRIANGLES = 200_000;
const WELD = 5e-5;
const CELL = 1e-4;

export class Sculpt {
  constructor(
    private readonly ctx: Ctx,
    private readonly mirror: boolean,
  ) {}

  push(target: SurfaceTarget, o: PushOptions) {
    const dir = toDirection(o.dir).normalize();
    const amount = profile(o.amount);
    this.run(target, o, false, (mirrored) => {
      const d = mirrored ? flip(dir.clone()) : dir;
      return (_p, _n, _q, t, out) => out.copy(d).multiplyScalar(amount(t));
    });
  }

  flatten(target: SurfaceTarget, o: FlattenOptions) {
    const dir = toDirection(o.dir).normalize();
    const strength = o.strength ?? 1;
    const gap = new Vector3();
    this.run(target, o, false, (mirrored) => {
      const d = mirrored ? flip(dir.clone()) : dir;
      return (p, _n, q, _t, out) => {
        const above = gap.subVectors(p, q).dot(d);
        const skip = (o.side === "front" && above < 0) || (o.side === "back" && above > 0);
        out.copy(d).multiplyScalar(skip ? 0 : -strength * above);
      };
    });
  }

  inflate(target: SurfaceTarget, o: InflateOptions) {
    const amount = profile(o.amount);
    this.run(target, o, false, () => (_p, n, _q, t, out) => out.copy(n).multiplyScalar(amount(t)));
  }

  crease(target: SurfaceTarget, o: CreaseOptions) {
    const depth = profile(o.depth);
    this.run(target, o, true, () => (_p, n, _q, t, out) => out.copy(n).multiplyScalar(-depth(t)));
  }

  smooth(target: SurfaceTarget, o: SmoothOptions) {
    const strength = o.strength ?? 0.5;
    const passes = o.passes ?? 2;
    this.run(target, { ...o, edge: Infinity }, false, () => () => {}, { strength, passes });
  }

  private run(
    target: SurfaceTarget,
    o: BrushOptions & { at?: PointInput; path?: PathInput },
    sharp: boolean,
    displace: (mirrored: boolean) => Displace,
    relax?: { strength: number; passes: number },
  ) {
    if ((o.at === undefined) === (o.path === undefined)) throw new Error("sculpt: give either `at` or `path`");
    const radius = profile(o.radius);
    const rs = Array.from({ length: 33 }, (_, i) => radius(i / 32));
    const rMax = Math.max(...rs);
    if (!(rMax > 0)) throw new Error("sculpt: radius must be positive");
    const grain = Math.min(...rs.filter((r) => r > 0));
    const points = o.at !== undefined ? [toPoint(o.at)] : sample(o.path!, rMax);
    const mirrored = o.mirror ?? this.mirror;
    const shape = { radius, rMax, grain, sharp, core: Math.min(Math.max(o.core ?? 0, 0), 0.99) };
    const stamps = [new Stamp(points, shape, displace(false))];
    if (mirrored)
      stamps.push(
        new Stamp(
          points.map((p) => flip(p.clone())),
          shape,
          displace(true),
        ),
      );
    const edge = o.edge ?? Math.max(rMax / (sharp ? 1.5 : 2), MIN_EDGE);
    apply(this.ctx, target, stamps, edge, relax);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Profiles and stamps.

const flip = (v: Vector3) => {
  v.x = -v.x;
  return v;
};

function profile(p: Profile): (t: number) => number {
  if (typeof p === "number") return () => p;
  if (typeof p === "function") return p;
  if (p.length === 0) throw new Error("sculpt: empty profile");
  return (t) => {
    const x = Math.min(Math.max(t, 0), 1) * (p.length - 1);
    const i = Math.min(Math.floor(x), p.length - 1);
    return p[i] + (p[Math.min(i + 1, p.length - 1)] - p[i]) * (x - i);
  };
}

/** A stroke as points, dense enough for a brush of the given reach. */
function sample(path: PathInput, rMax: number) {
  const p = toPath(path);
  const count = Math.min(Math.max(Math.ceil(p.length / Math.max(rMax / 4, 0.002)), 2), 400);
  return Array.from({ length: count + 1 }, (_, i) => p.at(i / count));
}

/** Model-space displacement per unit weight at vertex `p` (normal `n`), given the stroke's point `q` and t. */
type Displace = (p: Vector3, n: Vector3, q: Vector3, t: number, out: Vector3) => void;

type Sample = { w: number; d: Vector3 };

type Shape = {
  radius: (t: number) => number;
  rMax: number;
  /** The smallest radius the brush has. */
  grain: number;
  sharp: boolean;
  core: number;
};

/** One brush: a stroke (or point) with a radius profile, a falloff and a displacement. */
class Stamp {
  readonly box = new Box3();
  readonly grain: number;
  private readonly cum: number[] = [0];
  private readonly q = new Vector3();
  private readonly seg = new Vector3();
  private readonly at = new Vector3();
  private t = 0;

  constructor(
    private readonly pts: Vector3[],
    private readonly shape: Shape,
    private readonly displace: Displace,
  ) {
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    this.box.setFromPoints(pts).expandByScalar(shape.rMax);
    this.grain = shape.grain;
  }

  /** Weight (0..1) and displacement per unit weight at `p`. */
  sample(p: Vector3, n: Vector3, out: Sample) {
    const { radius, sharp, core } = this.shape;
    const d = this.nearest(p);
    const r = radius(this.t);
    out.w = 0;
    if (!(r > 0) || d >= r) return;
    const s = Math.min(1, (1 - d / r) / (1 - core));
    out.w = sharp ? s * s : s * s * (3 - 2 * s);
    this.displace(p, n, this.q, this.t, out.d);
  }

  /** Distance from `p` to the stroke; sets `q` (nearest point) and `t` (arc-length fraction). */
  private nearest(p: Vector3) {
    const { pts, cum, q, seg, at } = this;
    if (pts.length === 1) {
      q.copy(pts[0]);
      this.t = 0;
      return p.distanceTo(q);
    }
    let best = Infinity;
    const total = cum[cum.length - 1] || 1;
    for (let k = 0; k < pts.length - 1; k++) {
      seg.subVectors(pts[k + 1], pts[k]);
      const len2 = seg.lengthSq();
      const f = len2 > 0 ? Math.min(Math.max(at.subVectors(p, pts[k]).dot(seg) / len2, 0), 1) : 0;
      at.copy(pts[k]).addScaledVector(seg, f);
      const d2 = at.distanceToSquared(p);
      if (d2 < best) {
        best = d2;
        q.copy(at);
        this.t = (cum[k] + f * Math.sqrt(len2)) / total;
      }
    }
    return Math.sqrt(best);
  }
}

/** Combined weight and displacement of a brush and its mirror: symmetric, continuous, never doubled. */
function evaluate(stamps: Stamp[], p: Vector3, n: Vector3, out: Sample, tmp: Sample) {
  stamps[0].sample(p, n, out);
  if (stamps.length === 1) return;
  stamps[1].sample(p, n, tmp);
  const sum = out.w + tmp.w;
  if (sum <= 0) return;
  out.d
    .multiplyScalar(out.w)
    .addScaledVector(tmp.d, tmp.w)
    .multiplyScalar(1 / sum);
  out.w = Math.max(out.w, tmp.w);
}

// ---------------------------------------------------------------------------------------------------------------
// Working mesh: welded vertices shared by every target, so a brush moves coincident vertices together.

class Verts {
  readonly pos: Vector3[] = [];
  readonly nrm: Vector3[] = [];
  private readonly cells = new Map<number, number[]>();

  private static key(i: number, j: number, k: number) {
    return Math.imul(i, 73856093) ^ Math.imul(j, 19349663) ^ Math.imul(k, 83492791);
  }

  add(p: Vector3, n?: Vector3) {
    const c = [p.x / CELL, p.y / CELL, p.z / CELL];
    const span = WELD / CELL;
    const axes = c.map((v) => {
      const f = Math.floor(v);
      const r = v - f;
      const cells = [f];
      if (r < span) cells.push(f - 1);
      if (r > 1 - span) cells.push(f + 1);
      return cells;
    });
    for (const i of axes[0])
      for (const j of axes[1])
        for (const k of axes[2])
          for (const id of this.cells.get(Verts.key(i, j, k)) ?? [])
            if (this.pos[id].distanceToSquared(p) < WELD * WELD) return id;
    const id = this.pos.length;
    this.pos.push(p.clone());
    this.nrm.push(n ? n.clone() : new Vector3());
    const home = Verts.key(Math.floor(c[0]), Math.floor(c[1]), Math.floor(c[2]));
    const list = this.cells.get(home);
    if (list) list.push(id);
    else this.cells.set(home, [id]);
    return id;
  }
}

type Work = {
  mesh: Mesh;
  tris: number[];
  /** Weights by vertex for blend-skinned meshes, else null (rigid). */
  weights: Map<number, Weights> | null;
  /** Faceted (not indexed) meshes stay faceted. */
  flat: boolean;
  dirty: boolean;
};

function read(ctx: Ctx, mesh: Mesh, verts: Verts): Work {
  if (ctx.paints.some((p) => p.mesh === mesh))
    throw new Error("sculpt: painted meshes can't be sculpted; sculpt plain-coloured meshes");
  const material = mesh.material as { map?: unknown };
  if (material.map) throw new Error("sculpt: textured meshes can't be sculpted");
  const geometry = mesh.geometry;
  const position = geometry.getAttribute("position");
  const index = geometry.index;
  mesh.updateWorldMatrix(true, false);
  const skinned = Boolean(mesh.userData.skinBones);
  const weights = skinned ? new Map<number, Weights>() : null;
  const ids: number[] = [];
  const v = new Vector3();
  const gid = (i: number) => {
    let id = ids[i];
    if (id === undefined) {
      id = verts.add(v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld));
      ids[i] = id;
      if (weights && !weights.has(id)) weights.set(id, vertexWeights(ctx, mesh, i));
    }
    return id;
  };
  const tris: number[] = [];
  const count = index ? index.count : position.count;
  for (let i = 0; i < count; i += 3) {
    const [a, b, c] = [0, 1, 2].map((k) => gid(index ? index.getX(i + k) : i + k));
    if (a !== b && b !== c && c !== a) tris.push(a, b, c);
  }
  return { mesh, tris, weights, flat: !index, dirty: false };
}

const edgeKey = (a: number, b: number) => (a < b ? a * 67108864 + b : b * 67108864 + a);

// ---------------------------------------------------------------------------------------------------------------
// The brush pass: read, refine, displace, write.

function apply(
  ctx: Ctx,
  target: SurfaceTarget,
  stamps: Stamp[],
  edge: number,
  relax?: { strength: number; passes: number },
) {
  const meshes = new Surface(ctx, target).meshes;
  const verts = new Verts();
  const works = meshes.map((mesh) => read(ctx, mesh, verts));
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const e1 = new Vector3();
  const e2 = new Vector3();
  const box = new Box3();
  for (const w of works)
    for (let i = 0; i < w.tris.length; i += 3) {
      e1.subVectors(verts.pos[w.tris[i + 1]], verts.pos[w.tris[i]]);
      e2.subVectors(verts.pos[w.tris[i + 2]], verts.pos[w.tris[i]]);
      e1.cross(e2);
      for (let k = 0; k < 3; k++) verts.nrm[w.tris[i + k]].add(e1);
    }
  for (const n of verts.nrm)
    if (n.lengthSq() > 0) n.normalize();
    else n.set(0, 1, 0);

  const out: Sample = { w: 0, d: new Vector3() };
  const tmp: Sample = { w: 0, d: new Vector3() };
  const zero = new Vector3(0, 1, 0);
  const inside = (p: Vector3) => {
    evaluate(stamps, p, zero, out, tmp);
    return out.w > 0;
  };
  const grain = stamps[0].grain;
  const p = new Vector3();

  // Refine: split every long edge of every triangle the brush reaches, all meshes agreeing on each shared edge.
  if (Number.isFinite(edge)) {
    const mids = new Map<number, number>();
    // A regular split leaves diagonals a half longer than the edges; only edges beyond that are split again.
    const limit = edge * 1.5;
    for (let round = 0; round < 10; round++) {
      const hot = new Set<number>();
      for (const w of works)
        for (let i = 0; i < w.tris.length; i += 3) {
          const [ia, ib, ic] = [w.tris[i], w.tris[i + 1], w.tris[i + 2]];
          a.copy(verts.pos[ia]);
          b.copy(verts.pos[ib]);
          c.copy(verts.pos[ic]);
          const lens = [a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)];
          const longest = Math.max(...lens);
          if (longest <= limit) continue;
          box.setFromPoints([a, b, c]);
          if (!stamps.some((s) => s.box.intersectsBox(box))) continue;
          const n = Math.min(Math.max(Math.ceil(longest / (grain / 2)), 1), 10);
          let reached = false;
          for (let u = 0; u <= n && !reached; u++)
            for (let v = 0; u + v <= n && !reached; v++) {
              p.copy(a)
                .multiplyScalar(1 - (u + v) / n)
                .addScaledVector(b, u / n)
                .addScaledVector(c, v / n);
              reached = inside(p);
            }
          if (!reached) continue;
          if (lens[0] > limit) hot.add(edgeKey(ia, ib));
          if (lens[1] > limit) hot.add(edgeKey(ib, ic));
          if (lens[2] > limit) hot.add(edgeKey(ic, ia));
        }
      if (!hot.size) break;
      for (const w of works) {
        const mid = (x: number, y: number) => {
          const key = edgeKey(x, y);
          let m = mids.get(key);
          if (m === undefined) {
            p.addVectors(verts.pos[x], verts.pos[y]).multiplyScalar(0.5);
            const n = verts.nrm[x].clone().add(verts.nrm[y]);
            m = verts.add(p, n.lengthSq() > 0 ? n.normalize() : verts.nrm[x]);
            mids.set(key, m);
          }
          if (w.weights && !w.weights.has(m))
            w.weights.set(
              m,
              mix([
                [w.weights.get(x)!, 0.5],
                [w.weights.get(y)!, 0.5],
              ]),
            );
          return m;
        };
        const next: number[] = [];
        for (let i = 0; i < w.tris.length; i += 3) {
          const v = [w.tris[i], w.tris[i + 1], w.tris[i + 2]];
          const cut = [0, 1, 2].filter((k) => hot.has(edgeKey(v[k], v[(k + 1) % 3])));
          if (!cut.length) {
            next.push(...v);
            continue;
          }
          w.dirty = true;
          if (cut.length === 1) {
            const [p0, p1, p2] = [v[cut[0]], v[(cut[0] + 1) % 3], v[(cut[0] + 2) % 3]];
            const m = mid(p0, p1);
            next.push(p0, m, p2, m, p1, p2);
          } else if (cut.length === 2) {
            const j = [0, 1, 2].find((k) => !cut.includes(k))!;
            const [p0, p1, p2] = [v[(j + 1) % 3], v[(j + 2) % 3], v[j]];
            const m01 = mid(p0, p1);
            const m12 = mid(p1, p2);
            next.push(m01, p1, m12);
            if (verts.pos[p0].distanceToSquared(verts.pos[m12]) <= verts.pos[m01].distanceToSquared(verts.pos[p2]))
              next.push(p0, m01, m12, p0, m12, p2);
            else next.push(p0, m01, p2, m01, m12, p2);
          } else {
            const m01 = mid(v[0], v[1]);
            const m12 = mid(v[1], v[2]);
            const m20 = mid(v[2], v[0]);
            next.push(v[0], m01, m20, m01, v[1], m12, m20, m12, v[2], m01, m12, m20);
          }
        }
        w.tris = next;
      }
      if (works.reduce((n, w) => n + w.tris.length / 3, 0) > MAX_TRIANGLES)
        throw new Error("sculpt: this brush would add too many triangles; raise `edge` or shrink `radius`");
    }
  }

  // Displace from the shape as it was before this brush.
  const before = verts.pos.map((v) => v.clone());
  const weight: number[] = new Array(before.length).fill(0);
  const move: Vector3[] = before.map(() => new Vector3());
  for (let g = 0; g < before.length; g++) {
    if (!stamps.some((s) => s.box.containsPoint(before[g]))) continue;
    evaluate(stamps, before[g], verts.nrm[g], out, tmp);
    if (out.w <= 0) continue;
    weight[g] = out.w;
    move[g].copy(out.d).multiplyScalar(out.w);
  }
  if (relax) {
    const near: Set<number>[] = before.map(() => new Set<number>());
    for (const w of works)
      for (let i = 0; i < w.tris.length; i += 3)
        for (let k = 0; k < 3; k++) {
          near[w.tris[i + k]].add(w.tris[i + ((k + 1) % 3)]);
          near[w.tris[i + k]].add(w.tris[i + ((k + 2) % 3)]);
        }
    let current = before;
    for (let pass = 0; pass < relax.passes; pass++) {
      const next = current.map((v) => v.clone());
      for (let g = 0; g < current.length; g++) {
        if (!weight[g] || !near[g].size) continue;
        a.set(0, 0, 0);
        for (const h of near[g]) a.add(current[h]);
        a.multiplyScalar(1 / near[g].size).sub(current[g]);
        next[g].addScaledVector(a, relax.strength * weight[g]);
      }
      current = next;
    }
    for (let g = 0; g < before.length; g++) if (weight[g]) move[g].subVectors(current[g], before[g]);
  }
  const moved = new Set<number>();
  for (let g = 0; g < before.length; g++)
    if (move[g].lengthSq() > 1e-14) {
      verts.pos[g].add(move[g]);
      moved.add(g);
    }
  for (const w of works) if (!w.dirty && w.tris.some((g) => moved.has(g))) w.dirty = true;
  if (!works.some((w) => w.dirty)) return;

  // Normals from the sculpted faces of every mesh (creases kept, seams between meshes healed), then write.
  const faceNormal: Vector3[] = [];
  const faceArea: number[] = [];
  const faceAt = new Map<number, number[]>();
  const starts = works.map((w) => {
    const start = faceNormal.length;
    for (let i = 0; i < w.tris.length; i += 3) {
      e1.subVectors(verts.pos[w.tris[i + 1]], verts.pos[w.tris[i]]);
      e2.subVectors(verts.pos[w.tris[i + 2]], verts.pos[w.tris[i]]);
      e1.cross(e2);
      const area = e1.length();
      faceNormal.push(area > 0 ? e1.clone().multiplyScalar(1 / area) : new Vector3(0, 1, 0));
      faceArea.push(area);
      for (let k = 0; k < 3; k++) {
        const list = faceAt.get(w.tris[i + k]);
        if (list) list.push(faceNormal.length - 1);
        else faceAt.set(w.tris[i + k], [faceNormal.length - 1]);
      }
    }
    return start;
  });
  works.forEach((w, m) => {
    if (w.dirty) write(ctx, w, verts, starts[m], faceNormal, faceArea, faceAt);
  });
  ctx.poses++;
}

function write(
  ctx: Ctx,
  w: Work,
  verts: Verts,
  start: number,
  faceNormal: Vector3[],
  faceArea: number[],
  faceAt: Map<number, number[]>,
) {
  const { mesh } = w;
  const inverse = mesh.matrixWorld.clone().invert();
  const turn = new Matrix3().getNormalMatrix(inverse);
  const positions: number[] = [];
  const normals: number[] = [];
  const index: number[] = [];
  const perVertex: Weights[] = [];
  const seen = new Map<string, number>();
  const p = new Vector3();
  const n = new Vector3();
  for (let i = 0; i < w.tris.length; i++) {
    const face = start + Math.floor(i / 3);
    const g = w.tris[i];
    if (w.flat) n.copy(faceNormal[face]);
    else {
      n.set(0, 0, 0);
      for (const f of faceAt.get(g)!)
        if (faceNormal[f].dot(faceNormal[face]) > CREASE_ANGLE) n.addScaledVector(faceNormal[f], faceArea[f]);
      if (n.lengthSq() === 0) n.copy(faceNormal[face]);
      n.normalize();
    }
    n.applyMatrix3(turn).normalize();
    const key = w.flat ? "" : `${g}:${Math.round(n.x * 256)}:${Math.round(n.y * 256)}:${Math.round(n.z * 256)}`;
    let id = w.flat ? undefined : seen.get(key);
    if (id === undefined) {
      id = positions.length / 3;
      p.copy(verts.pos[g])
        .applyMatrix4(inverse)
        .toArray(positions, id * 3);
      n.toArray(normals, id * 3);
      if (w.weights) perVertex.push(w.weights.get(g)!);
      if (!w.flat) seen.set(key, id);
    }
    index.push(id);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  if (!w.flat) geometry.setIndex(index);
  const bones = w.weights ? writeWeights(geometry, positions.length / 3, (v) => perVertex[v]) : null;
  mesh.geometry.dispose();
  mesh.geometry = geometry;
  if (bones) skinMesh(ctx, mesh, bones);
}
