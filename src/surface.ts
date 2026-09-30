// Surface queries on the REAL built triangles (no analytic stand-ins) and `stick()` to seat parts on any frame.
import { Box3, Quaternion, Triangle, Vector3 } from "three";
import type { BufferGeometry, Mesh, Object3D, Texture } from "three";
import { mix, rigid, vertexWeights } from "./context";
import type { Ctx, Fill, JointRef, Tags, Weights } from "./context";
import { Spot } from "./frame";
import { aim, DEG, flatten, rng as makeRng, toDirection, toFrame, toPoint, vec } from "./math";
import type { DirectionInput, FrameInput, PointInput, V3 } from "./math";
import { part, Part } from "./parts";
import { smoothPath, toPath } from "./path";
import type { Path, PathInput } from "./path";
import { Joint } from "./skeleton";
import { Sweep } from "./sweep";

/** A frame on a surface: +Y = the outward face normal `n`, with the skin's weights there (the mesh's bone if rigid). */
export class Hit extends Spot {
  constructor(
    at: Vector3,
    n: Vector3,
    readonly mesh: Mesh,
    weights: Weights,
  ) {
    super(at, aim(n), weights);
  }

  get n() {
    return this.axis;
  }
}

export type SurfaceTarget = Mesh | Part | Sweep | Joint | readonly SurfaceTarget[];

export type ScatterOptions = {
  /** Random source in [0, 1) (e.g. `rng(7)` or `kit.rng(7)`); default `rng(1)`. */
  rng?: () => number;
  /** Minimum distance between accepted points. */
  minDist?: number;
  /** Reject points where this returns true. */
  keepOut?: (p: Vector3) => boolean;
  /** Keep only hits where this returns true. */
  filter?: (hit: Hit) => boolean;
};

export type LoopOptions = {
  /** The cutting plane's normal. Default: `on`'s facing axis when it is a Frame (a joint cuts across its bone), else world up. */
  dir?: DirectionInput;
  /** Distance out along the surface normal (default 0). */
  lift?: number;
};

const PERTURB = new Vector3(0.0123, 0.0321, 0.0231);

export class Surface {
  readonly meshes: Mesh[] = [];
  private readonly joints: Joint[] = [];
  /** World triangles, 9 floats each, as of pose `version`. */
  private tris: number[] = [];
  private normals: Vector3[] = [];
  private owner: number[] = [];
  /** Vertex ids of each triangle's corners in its mesh, 3 per triangle. */
  private corners: number[] = [];
  private cumArea: number[] = [];
  private box = new Box3();
  private eps = 0;
  private version = -1;

  constructor(
    private readonly ctx: Ctx,
    targets: SurfaceTarget,
  ) {
    const add = (target: SurfaceTarget) => {
      if (target instanceof Sweep) target.meshes.forEach(add);
      else if (target instanceof Part) add(target.mesh);
      else if (target instanceof Joint) (ctx.meshes.get(target) ?? []).forEach(add);
      else if ("isMesh" in target) {
        if (!this.meshes.includes(target)) {
          this.meshes.push(target);
          this.joints.push(ctx.owner.get(target) ?? ownerJoint(ctx, target));
        }
      } else (target as readonly SurfaceTarget[]).forEach(add);
    };
    add(targets);
    if (!this.meshes.length) throw new Error("surface(): no meshes in targets");
  }

  /** Re-read the meshes' world triangles when a `pose()` happened since the last query. */
  private sync() {
    if (this.version === this.ctx.poses) return;
    this.version = this.ctx.poses;
    this.tris = [];
    this.normals = [];
    this.owner = [];
    this.corners = [];
    this.cumArea = [];
    this.box = new Box3();
    const a = new Vector3();
    const b = new Vector3();
    const c = new Vector3();
    let total = 0;
    this.meshes.forEach((mesh, m) => {
      const geometry = mesh.geometry as BufferGeometry;
      const position = geometry.getAttribute("position");
      const index = geometry.index;
      const count = index ? index.count : position.count;
      const id = (i: number) => (index ? index.getX(i) : i);
      const corner = (i: number, v: Vector3) => v.fromBufferAttribute(position, id(i)).applyMatrix4(mesh.matrixWorld);
      for (let i = 0; i < count; i += 3) {
        corner(i, a);
        corner(i + 1, b);
        corner(i + 2, c);
        const n = b.clone().sub(a).cross(c.clone().sub(a));
        const area = n.length() / 2;
        if (area < 1e-14) continue;
        this.tris.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        this.normals.push(n.normalize());
        this.owner.push(m);
        this.corners.push(id(i), id(i + 1), id(i + 2));
        total += area;
        this.cumArea.push(total);
        this.box.expandByPoint(a).expandByPoint(b).expandByPoint(c);
      }
    });
    this.eps = this.box.getSize(new Vector3()).length() * 1e-5;
  }

  private triangle(i: number) {
    const t = this.tris;
    const o = i * 9;
    return new Triangle(
      new Vector3(t[o], t[o + 1], t[o + 2]),
      new Vector3(t[o + 3], t[o + 4], t[o + 5]),
      new Vector3(t[o + 6], t[o + 7], t[o + 8]),
    );
  }

  /** A hit on triangle `i`; on a blend-skinned mesh its weights interpolate the corners' weights. */
  private hit(i: number, p: Vector3) {
    const mesh = this.meshes[this.owner[i]];
    let weights = rigid(this.joints[this.owner[i]]);
    if (mesh.userData.skinBones) {
      const bary = this.triangle(i).getBarycoord(p, new Vector3()) ?? new Vector3(1, 0, 0);
      const c = this.corners.slice(i * 3, i * 3 + 3);
      weights = mix(c.map((vertex, k) => [vertexWeights(this.ctx, mesh, vertex), bary.getComponent(k)] as const));
    }
    return new Hit(p, this.normals[i].clone(), mesh, weights);
  }

  /** All ray intersections (distance, triangle), any facing, excluding triangle `skip`. */
  private intersections(origin: Vector3, dir: Vector3, skip = -1) {
    const found: Array<{ dist: number; i: number }> = [];
    const t = this.tris;
    const e1 = new Vector3();
    const e2 = new Vector3();
    const h = new Vector3();
    const s = new Vector3();
    const q = new Vector3();
    for (let i = 0; i < this.normals.length; i++) {
      if (i === skip) continue;
      const o = i * 9;
      e1.set(t[o + 3] - t[o], t[o + 4] - t[o + 1], t[o + 5] - t[o + 2]);
      e2.set(t[o + 6] - t[o], t[o + 7] - t[o + 1], t[o + 8] - t[o + 2]);
      h.crossVectors(dir, e2);
      const det = e1.dot(h);
      if (Math.abs(det) < 1e-14) continue;
      const inv = 1 / det;
      s.set(origin.x - t[o], origin.y - t[o + 1], origin.z - t[o + 2]);
      const u = s.dot(h) * inv;
      if (u < 0 || u > 1) continue;
      q.crossVectors(s, e1);
      const v = dir.dot(q) * inv;
      if (v < 0 || u + v > 1) continue;
      const dist = e2.dot(q) * inv;
      if (dist > 1e-9) found.push({ dist, i });
    }
    return found;
  }

  /** Closest surface point to `p`. */
  nearest(p: PointInput): Hit {
    this.sync();
    const q = toPoint(p, "nearest()");
    let best = -1;
    let bestD = Infinity;
    const closest = new Vector3();
    const point = new Vector3();
    for (let i = 0; i < this.normals.length; i++) {
      this.triangle(i).closestPointToPoint(q, closest);
      const d = closest.distanceToSquared(q);
      if (d < bestD) {
        bestD = d;
        best = i;
        point.copy(closest);
      }
    }
    return this.hit(best, point);
  }

  /** First surface hit along the ray, or null. */
  ray(origin: PointInput, dir: DirectionInput): Hit | null {
    this.sync();
    const o = toPoint(origin, "ray()");
    const d = toDirection(dir, "ray()").normalize();
    const found = this.intersections(o, d);
    if (!found.length) return null;
    const first = found.reduce((x, y) => (y.dist < x.dist ? y : x));
    return this.hit(first.i, o.addScaledVector(d, first.dist));
  }

  /**
   * Spherical addressing around `center` (default: bounding-box centre). `at(azimuthDeg, elevationDeg)` returns
   * the OUTERMOST surface point in that direction (ray cast inward from outside). Azimuth 0 = +Z (front),
   * 90 = +X (left); elevation 90 = straight up.
   */
  around(center?: PointInput) {
    this.sync();
    const c = center ? toPoint(center, "around()") : this.box.getCenter(new Vector3());
    const far = this.box.getSize(new Vector3()).length() * 2 + this.box.distanceToPoint(c);
    return {
      at: (azimuthDeg: number, elevationDeg: number) => {
        const az = azimuthDeg * DEG;
        const el = elevationDeg * DEG;
        const dir = new Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
        return this.ray(c.clone().addScaledVector(dir, far), dir.negate());
      },
    };
  }

  /**
   * `path` pulled onto the built surface: every sample moves to its nearest surface point, then `lift` out along
   * the face normal. Knots and closedness carry over, so a loop drawn roughly around a body becomes a strap.
   */
  drape(path: PathInput, options: { lift?: number } = {}) {
    this.sync();
    const source = toPath(path);
    const step = this.box.getSize(new Vector3()).length() / 150;
    const count = Math.max(32, Math.ceil(source.length / step));
    const hits = Array.from({ length: count + 1 }, (_, i) => this.nearest(source.at(i / count)));
    const pts = hits.map((hit) => hit.at.addScaledVector(hit.n, options.lift ?? 0));
    const indices = [...new Set(source.knots.map((t) => Math.round(t * count)))];
    return smoothPath(pts, null, { indices }, source.closed, hits[0].weights);
  }

  /**
   * The loop where a plane cuts the built surface. The plane passes through `on`'s point and faces `dir`
   * (default: `on`'s facing axis when it is a Frame, so a joint cuts across its bone; world up for a literal
   * point). Of the loops the plane cuts, it returns the smallest one around the point, else the nearest one. The
   * path starts at angle 0 as on `ring` (the direction closest to world up; world +Z when `dir` is vertical), runs
   * counter-clockwise about `dir`, sits `lift` out along the surface and carries the average skin weights along it.
   */
  loop(on: PointInput, options: LoopOptions = {}): Path {
    this.sync();
    const center = toPoint(on, "loop()");
    const framed = !Array.isArray(on) && !("isVector3" in on) && !("isMesh" in on);
    const axis =
      options.dir !== undefined
        ? toDirection(options.dir, "loop()")
        : framed
          ? toFrame(on as FrameInput).axis.clone()
          : new Vector3(0, 1, 0);
    if (axis.lengthSq() < 1e-12) throw new Error("loop(): `dir` has no length");
    axis.normalize();
    let u = flatten(new Vector3(0, 1, 0), axis);
    if (u.lengthSq() < 1e-8) u = flatten(new Vector3(0, 0, 1), axis);
    u.normalize();
    const v = axis.clone().cross(u);

    // Cut every triangle; welded crossing points (per mesh) become nodes linked into chains.
    const level = axis.dot(center);
    const tol = this.eps * 10;
    const nodes: Array<{ p: Vector3; mesh: number; tris: number[]; links: number[] }> = [];
    const grid = new Map<string, number[]>();
    const nodeAt = (p: Vector3, mesh: number, tri: number) => {
      const cell = [Math.round(p.x / tol), Math.round(p.y / tol), Math.round(p.z / tol)];
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          for (let dz = -1; dz <= 1; dz++)
            for (const id of grid.get(`${mesh}:${cell[0] + dx},${cell[1] + dy},${cell[2] + dz}`) ?? [])
              if (nodes[id].p.distanceTo(p) <= tol) {
                if (!nodes[id].tris.includes(tri)) nodes[id].tris.push(tri);
                return id;
              }
      const key = `${mesh}:${cell[0]},${cell[1]},${cell[2]}`;
      grid.set(key, [...(grid.get(key) ?? []), nodes.length]);
      nodes.push({ p, mesh, tris: [tri], links: [] });
      return nodes.length - 1;
    };
    const corner = [new Vector3(), new Vector3(), new Vector3()];
    const dist = [0, 0, 0];
    for (let i = 0; i < this.normals.length; i++) {
      for (let k = 0; k < 3; k++) dist[k] = axis.dot(corner[k].fromArray(this.tris, i * 9 + k * 3)) - level;
      const cut: Vector3[] = [];
      for (let k = 0; k < 3; k++) {
        const j = (k + 1) % 3;
        if (dist[k] >= 0 === dist[j] >= 0) continue;
        // Always from the corner below the plane, so both triangles on an edge compute the same point.
        const [lo, hi] = dist[k] < 0 ? [k, j] : [j, k];
        cut.push(corner[lo].clone().lerp(corner[hi], dist[lo] / (dist[lo] - dist[hi])));
      }
      if (cut.length !== 2) continue;
      const a = nodeAt(cut[0], this.owner[i], i);
      const b = nodeAt(cut[1], this.owner[i], i);
      if (a === b || nodes[a].links.includes(b)) continue;
      nodes[a].links.push(b);
      nodes[b].links.push(a);
    }
    const seen = new Set<number>();
    const chains: Array<{ ids: number[]; closed: boolean }> = [];
    const walk = (start: number) => {
      const ids = [start];
      seen.add(start);
      for (let cur = start, prev = -1; ; ) {
        const next = nodes[cur].links.find((n) => n !== prev && !seen.has(n));
        if (next === undefined) {
          chains.push({ ids, closed: ids.length > 2 && nodes[cur].links.includes(start) });
          return;
        }
        seen.add(next);
        ids.push(next);
        prev = cur;
        cur = next;
      }
    };
    nodes.forEach((node, i) => node.links.length === 1 && !seen.has(i) && walk(i));
    nodes.forEach((_, i) => !seen.has(i) && walk(i));

    // In-plane coordinates about the point: pick the smallest loop around it, else the nearest chain.
    const flat = (p: Vector3): [number, number] => {
      const d = p.clone().sub(center);
      return [d.dot(u), d.dot(v)];
    };
    const signedArea = (q: Array<[number, number]>) =>
      q.reduce((s, [x, y], i) => s + (x * q[(i + 1) % q.length][1] - q[(i + 1) % q.length][0] * y), 0) / 2;
    const encloses = (q: Array<[number, number]>) => {
      let inside = false;
      for (let i = 0, j = q.length - 1; i < q.length; j = i++)
        if (q[i][1] > 0 !== q[j][1] > 0 && 0 < q[j][0] + ((q[i][0] - q[j][0]) * (0 - q[j][1])) / (q[i][1] - q[j][1]))
          inside = !inside;
      return inside;
    };
    const reach = (q: Array<[number, number]>, closed: boolean) => {
      let best = Infinity;
      for (let i = 0; i < (closed ? q.length : q.length - 1); i++) {
        const [ax, ay] = q[i];
        const [bx, by] = q[(i + 1) % q.length];
        const len2 = (bx - ax) ** 2 + (by - ay) ** 2;
        const s = len2 > 0 ? Math.min(1, Math.max(0, -(ax * (bx - ax) + ay * (by - ay)) / len2)) : 0;
        best = Math.min(best, Math.hypot(ax + (bx - ax) * s, ay + (by - ay) * s));
      }
      return best;
    };
    let chosen: { ids: number[]; closed: boolean } | null = null;
    let bestArea = Infinity;
    let bestReach = Infinity;
    for (const chain of chains) {
      if (chain.ids.length < (chain.closed ? 3 : 2)) continue;
      const q = chain.ids.map((id) => flat(nodes[id].p));
      const area = chain.closed ? Math.abs(signedArea(q)) : 0;
      if (chain.closed && encloses(q)) {
        if (bestArea === Infinity || area < bestArea) [chosen, bestArea] = [chain, area];
      } else if (bestArea === Infinity) {
        const r = reach(q, chain.closed);
        if (r < bestReach) [chosen, bestReach] = [chain, r];
      }
    }
    if (!chosen) {
      const fmt = (p: Vector3) => `[${p.toArray().map((x) => +x.toFixed(3))}]`;
      throw new Error(`loop(): the plane through ${fmt(center)} facing ${fmt(axis)} misses the surface`);
    }

    // Points with their triangle and normal, dropping near-duplicates, counter-clockwise about `dir`.
    let pts: Array<{ p: Vector3; n: Vector3; tris: number[] }> = [];
    const gap = this.eps * 50;
    for (const id of chosen.ids) {
      const node = nodes[id];
      if (!pts.length || pts[pts.length - 1].p.distanceTo(node.p) > gap)
        pts.push({
          p: node.p,
          n: node.tris.reduce((sum, i) => sum.add(this.normals[i]), new Vector3()).normalize(),
          tris: node.tris,
        });
    }
    const closed = chosen.closed && pts.length > 2;
    if (closed && pts[pts.length - 1].p.distanceTo(pts[0].p) <= gap) pts.pop();
    if (closed && signedArea(pts.map(({ p }) => flat(p))) < 0) pts.reverse();
    if (closed) {
      // Start where the ray from the loop's centre along angle 0 leaves it.
      const q = pts.map(({ p }) => flat(p));
      const cu = q.reduce((s, [x]) => s + x, 0) / q.length;
      const cv = q.reduce((s, [, y]) => s + y, 0) / q.length;
      let at = -1;
      let s = 0;
      let far = -Infinity;
      for (let i = 0; i < q.length; i++) {
        const [au, av] = [q[i][0] - cu, q[i][1] - cv];
        const [bu, bv] = [q[(i + 1) % q.length][0] - cu, q[(i + 1) % q.length][1] - cv];
        if (av > 0 === bv > 0) continue;
        const f = av / (av - bv);
        const cross = au + (bu - au) * f;
        if (cross > 0 && cross > far) [at, s, far] = [i, f, cross];
      }
      if (at >= 0) {
        const a = pts[at];
        const b = pts[(at + 1) % pts.length];
        let first = (at + 1) % pts.length;
        if (s < 1e-6) first = at;
        else if (s <= 1 - 1e-6) {
          // The segment between two crossing points lies in the triangle both came from.
          const tri = a.tris.find((i) => b.tris.includes(i)) ?? a.tris[0];
          pts.splice(at + 1, 0, { p: a.p.clone().lerp(b.p, s), n: a.n.clone().lerp(b.n, s).normalize(), tris: [tri] });
          first = at + 1;
        }
        pts = [...pts.slice(first), ...pts.slice(0, first)];
      }
    }

    const lift = options.lift ?? 0;
    const shares = pts.map((_, k) => {
      const prev = k > 0 ? pts[k - 1].p.distanceTo(pts[k].p) : closed ? pts[pts.length - 1].p.distanceTo(pts[0].p) : 0;
      const next = k < pts.length - 1 ? pts[k].p.distanceTo(pts[k + 1].p) : closed ? pts[k].p.distanceTo(pts[0].p) : 0;
      return (prev + next) / 2;
    });
    const weights = mix(pts.map(({ p, tris }, k) => [this.hit(tris[0], p).weights, shares[k]] as const));
    const out = pts.map(({ p, n }) => p.clone().addScaledVector(n, lift));
    return smoothPath(out, null, { spans: 1 }, closed, weights);
  }

  /** True when `p` (on triangle `i`) lies inside another closed part of this surface. */
  private buried(p: Vector3, i: number) {
    const dir = this.normals[i].clone().add(PERTURB).normalize();
    return this.intersections(p.clone().addScaledVector(this.normals[i], this.eps), dir, i).length % 2 === 1;
  }

  /**
   * Up to `count` area-weighted random points, deterministic for a given `rng`. Points buried inside other
   * target meshes are rejected, as are points failing `keepOut`, `filter` or `minDist`.
   */
  scatter(count: number, options: ScatterOptions = {}) {
    this.sync();
    const random = options.rng ?? makeRng(1);
    const total = this.cumArea[this.cumArea.length - 1];
    const hits: Hit[] = [];
    for (let attempt = 0; attempt < count * 60 && hits.length < count; attempt++) {
      const target = random() * total;
      let lo = 0;
      let hi = this.cumArea.length - 1;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (this.cumArea[m] < target) lo = m + 1;
        else hi = m;
      }
      let u = random();
      let v = random();
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }
      const tri = this.triangle(lo);
      const p = tri.a.clone().addScaledVector(tri.b.clone().sub(tri.a), u).addScaledVector(tri.c.clone().sub(tri.a), v);
      if (options.keepOut?.(p)) continue;
      if (options.minDist && hits.some((h) => h.at.distanceTo(p) < options.minDist!)) continue;
      const hit = this.hit(lo, p);
      if (options.filter && !options.filter(hit)) continue;
      if (this.buried(p, lo)) continue;
      hits.push(hit);
    }
    return hits;
  }
}

function ownerJoint(ctx: Ctx, object: Object3D) {
  for (let o: Object3D | null = object; o; o = o.parent) {
    const name = (o.userData.bone as string | undefined) ?? (o.userData.joint as string | undefined);
    const joint = name ? ctx.joints.get(name) : undefined;
    if (joint) return joint;
  }
  throw new Error(`surface(): mesh "${object.name}" does not resolve to a joint`);
}

export type StickOptions = Tags & {
  /** Penetration as a fraction of the part's own height along the normal (default 0.2). */
  embed?: number;
  /** Preferred direction for the part's +Z along the surface (scales, shingles); default per `aim()`. */
  flow?: DirectionInput;
  /** Degrees about the normal. */
  spin?: number;
  /** Rigid on this bone. Default: the frame's weights (a hit on a bend bends with it), else the nearest joint. */
  bone?: JointRef;
  scale?: number | V3;
  /** An image mapped by the geometry's UVs: a colour drawing as drawn, a grey one tinted by `color`; see `part`. */
  texture?: Texture;
  /** Faceted shading; see `part`. */
  flat?: boolean;
};

/**
 * Seat a part on any frame (a surface hit, a tube point, a ring item, a joint...): local +Y along the frame's
 * facing axis (a hit's normal), sunk by `embed` × the part's own height. The part faces that axis.
 */
export function stick(ctx: Ctx, geometry: BufferGeometry, color: Fill, on: FrameInput, options: StickOptions = {}) {
  const base = toFrame(on);
  const n = base.axis;
  const flow = options.flow ? flatten(toDirection(options.flow, "stick()"), n) : null;
  const quat = aim(n, flow && flow.lengthSq() > 1e-10 ? flow : undefined);
  if (options.spin) quat.premultiply(new Quaternion().setFromAxisAngle(n, options.spin * DEG));
  const scale =
    options.scale === undefined
      ? 1
      : typeof options.scale === "number"
        ? options.scale
        : vec(options.scale, "stick()").y;
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox!;
  const height = (max.y - min.y) * scale;
  const embed = options.embed ?? 0.2;
  const at = base.at.addScaledVector(n, -(min.y * scale + embed * height));
  return part(ctx, geometry, color, { ...options, frame: base, at, quat });
}
