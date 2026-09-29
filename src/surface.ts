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
import type { PathInput } from "./path";
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
    const q = toPoint(p);
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
    const o = toPoint(origin);
    const d = toDirection(dir).normalize();
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
    const c = center ? toPoint(center) : this.box.getCenter(new Vector3());
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
  /** An image mapped by the geometry's UVs, tinted by `color`; see `part`. */
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
  const flow = options.flow ? flatten(toDirection(options.flow), n) : null;
  const quat = aim(n, flow && flow.lengthSq() > 1e-10 ? flow : undefined);
  if (options.spin) quat.premultiply(new Quaternion().setFromAxisAngle(n, options.spin * DEG));
  const scale =
    options.scale === undefined ? 1 : typeof options.scale === "number" ? options.scale : vec(options.scale).y;
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox!;
  const height = (max.y - min.y) * scale;
  const embed = options.embed ?? 0.2;
  const at = base.at.addScaledVector(n, -(min.y * scale + embed * height));
  return part(ctx, geometry, color, { ...options, frame: base, at, quat });
}
