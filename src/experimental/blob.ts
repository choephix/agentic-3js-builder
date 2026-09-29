// Blended volumes: a body part made of simple ingredients (spheres, ellipsoids, capsules, rounded boxes, tubes along a
// path or chain), each adding volume or carving it away, merged with a blend width into ONE closed mesh with smooth,
// sculpted junctions (armpit, shoulder, hip, neck). Read the doc comment below first.
//
// Implementation: the ingredients form a signed distance field folded in list order with polynomial smooth-min
// (solids) and smooth-max (carves); the field is sampled on a grid of `cell` meters and meshed with naive surface
// nets (one vertex per surface cell, quads split into triangles), vertices are projected onto the exact surface and
// take their normals from the field's gradient. Skin weights fold the same way: at every vertex each ingredient's
// bone weights are mixed by the very factor the smooth-min gave that ingredient there, so a shoulder-to-arm junction
// carries both bones; the weights are then diffused over the mesh (`spread`) so joints bend like skin.
//
// The only thing it takes from the rest of the SDK is the builder's context (`b` carries it privately), the
// mesh/weights primitives of `context.ts` and the `Part` it returns.

/**
 * # Blended volumes
 *
 * ```ts
 * import { blob, box, capsule, carve, ellipsoid, plane, sphere, tube } from "../src/experimental/blob";
 *
 * const torso = blob(
 *   b,
 *   [
 *     ellipsoid(chest.at, [0.17, 0.2, 0.11], { bone: spine2 }), // ribcage
 *     ellipsoid(belly.at, [0.14, 0.14, 0.1], { bone: spine, blend: 0.08 }), // merges into the ribcage over 8 cm
 *     capsule(neckBase, headBase, [0.055, 0.05], { bone: neck }),
 *     carve(sphere(navel, 0.012)), // a dent
 *   ],
 *   { color: SKIN, blend: 0.05, cell: 0.02 },
 * );
 * ```
 *
 * `blob(b, ingredients, { color, blend?, cell?, spread?, bone?, smooth?, name?, group? })` builds one closed mesh
 * and returns a `Part` (a Frame at the blob's centre with `mesh`), so `b.surface(blob)`, `b.stick(geo, color,
 * hit)`, `b.ring` and every paint (`color` takes a colour or a Paint) work on it as on any part.
 *
 * - `blend` (meters, default 0.04) is the width of the smooth junction between ingredients: where two surfaces meet
 *   they merge over about this distance, and a crease gets filled by up to a quarter of it. Small = crisp joins,
 *   large = one lump.
 * - `cell` (meters, default 0.02) is the mesh resolution: one vertex per surface cell, so triangles are about a cell
 *   wide and evenly spread. Features thinner than about two cells vanish; use a finer `cell` for a hand.
 * - `spread` (meters, default twice `blend`) is how far the bone weights are diffused over the surface: 0 keeps
 *   the abrupt weights of the smooth-min, more bends over a longer stretch of skin around each junction.
 * - `bone` is the default bone for ingredients that name none (a Joint, joint name or Chain).
 * - `smooth` (default true) shades with the field's normals; false gives flat facets.
 *
 * Ingredients, in order (later ones merge into the shape so far):
 *
 * | Call                                       | Volume                                                           |
 * | ------------------------------------------ | ---------------------------------------------------------------- |
 * | `sphere(at, r)`                            | ball                                                             |
 * | `ellipsoid(at, [rx, ry, rz], { dir, up })` | stretched ball; `ry` runs along `dir`, `rz` leans toward `up`    |
 * | `capsule(a, b, r \| [r0, r1])`             | round-ended tube from a to b; two radii taper it                 |
 * | `box(at, [hx, hy, hz], { round, dir, up })` | box of half extents (corners rounded by `round`), oriented like an ellipsoid |
 * | `tube(path \| chain, radius)`              | tube along a Path, or a Chain's centreline; `radius` is a number, a `number[]` keyed evenly along it (smooth) or `(t) => r` |
 * | `plane(at, dir)`                           | everything beyond `at` in direction `dir`: use it with `carve`   |
 * | `carve(ingredient, { bone?, blend? })`     | the same volume, taken away instead of added                     |
 * | `grow(ingredient, d)`                      | the same volume, `d` meters bigger all round                     |
 *
 * Every ingredient takes `{ bone?, blend? }`. `at`, `a`, `b` are Points and `dir`, `up` Directions, so joints, hits
 * and frames go straight in.
 *
 * - `bone` says which bone moves the ingredient: a Joint (rigid), or a Chain, whose joints share the ingredient by the
 *   nearest point along the chain (a leg tube that bends at the knee). Without it the ingredient takes the bones of
 *   its `at` when that came from something built, else the blob's `bone`, else the nearest joint. A carve has bones
 *   only when you give it one; otherwise it leaves the weights of the surface it cuts alone.
 * - `blend` overrides the blob's blend for how this ingredient merges into the shape so far: a wide one for the
 *   armpit web, a narrow one for a knuckle.
 *
 * A vertex's skin weights come from how much each ingredient contributes to the surface there, so the blend between
 * a shoulder and an arm bends with both bones. Order matters, as in any smooth union: build big masses first, then
 * the ingredients that grow out of them, then carves.
 */
import { Box3, Quaternion, Vector3 } from "three";
import type { Builder } from "../builder";
import { meshFromWorld, nearestJoint, resolveJoint, rigid, weightsOf } from "../context";
import type { Ctx, Fill, JointRef, Tags, Weights } from "../context";
import { aim, toDirection, toPoint } from "../math";
import type { DirectionInput, PointInput } from "../math";
import { Part } from "../parts";
import { toPath } from "../path";
import type { Path, PathInput } from "../path";
import { Chain } from "../skeleton";
import type { Joint } from "../skeleton";

const FAR = 1e3;

/** Options every ingredient takes. */
export type IngredientOptions = {
  /** Owning bone: a Joint or joint name (rigid), or a Chain (shared along its length). */
  bone?: JointRef | Chain;
  /** Width of this ingredient's junction with the shape so far, in meters (default: the blob's). */
  blend?: number;
};

/** Distance to an ingredient's surface (negative inside) at a point; exact or a lower bound. */
type Dist = (x: number, y: number, z: number) => number;

/** One ingredient of a blob, made by `sphere`, `ellipsoid`, `capsule`, `box`, `tube` or `plane`. */
export type Ingredient = {
  readonly cut: boolean;
  readonly options: IngredientOptions;
  /** Inputs that may carry bones (an `at` that came from a joint). */
  readonly anchors: readonly unknown[];
  /** Model-space bounds; null for an unbounded volume (a plane). */
  readonly bounds: Box3 | null;
  readonly center: Vector3;
  /** The distance function, built for the blob's cell size. */
  readonly make: (cell: number) => Dist;
  /** The chain to share bones along, when the ingredient rides one. */
  readonly chain?: Chain;
};

const box3 = (points: Vector3[], pad = 0) => new Box3().setFromPoints(points).expandByScalar(pad);

/** A ball. */
export function sphere(at: PointInput, r: number, options: IngredientOptions = {}): Ingredient {
  const c = toPoint(at);
  return {
    cut: false,
    options,
    anchors: [at],
    bounds: box3([c], r),
    center: c,
    make: () => (x, y, z) => Math.hypot(x - c.x, y - c.y, z - c.z) - r,
  };
}

/** The axes of a frame aimed along `dir` (local +Y), rolled toward `up`, in model space. */
type Axes = { x: Vector3; y: Vector3; z: Vector3 };

function axes(dir: DirectionInput | undefined, up: DirectionInput | undefined): Axes {
  const q = dir === undefined ? new Quaternion() : aim(dir, up);
  const x = new Vector3(1, 0, 0).applyQuaternion(q);
  const y = new Vector3(0, 1, 0).applyQuaternion(q);
  const z = new Vector3(0, 0, 1).applyQuaternion(q);
  return { x, y, z };
}

/** World half extents of a box-like volume with local half extents `h` under `axes`. */
function extent(a: Axes, h: readonly [number, number, number]) {
  return new Vector3(
    Math.abs(a.x.x) * h[0] + Math.abs(a.y.x) * h[1] + Math.abs(a.z.x) * h[2],
    Math.abs(a.x.y) * h[0] + Math.abs(a.y.y) * h[1] + Math.abs(a.z.y) * h[2],
    Math.abs(a.x.z) * h[0] + Math.abs(a.y.z) * h[1] + Math.abs(a.z.z) * h[2],
  );
}

/** A stretched ball: radii along its own axes, `ry` along `dir` and `rz` leaning toward `up` (default world axes). */
export function ellipsoid(
  at: PointInput,
  radii: readonly [number, number, number],
  options: IngredientOptions & { dir?: DirectionInput; up?: DirectionInput } = {},
): Ingredient {
  const c = toPoint(at);
  const a = axes(options.dir, options.up);
  const [rx, ry, rz] = radii;
  const half = extent(a, radii);
  const smallest = Math.min(rx, ry, rz);
  return {
    cut: false,
    options,
    anchors: [at],
    bounds: new Box3(c.clone().sub(half), c.clone().add(half)),
    center: c,
    make: () => (x, y, z) => {
      const px = x - c.x;
      const py = y - c.y;
      const pz = z - c.z;
      const lx = (px * a.x.x + py * a.x.y + pz * a.x.z) / rx;
      const ly = (px * a.y.x + py * a.y.y + pz * a.y.z) / ry;
      const lz = (px * a.z.x + py * a.z.y + pz * a.z.z) / rz;
      const k0 = Math.hypot(lx, ly, lz);
      const k1 = Math.hypot(lx / rx, ly / ry, lz / rz);
      return k1 < 1e-9 ? -smallest : (k0 * (k0 - 1)) / k1;
    },
  };
}

/** A box of half extents `half`, corners rounded by `round`, oriented like an ellipsoid. */
export function box(
  at: PointInput,
  half: readonly [number, number, number],
  options: IngredientOptions & { round?: number; dir?: DirectionInput; up?: DirectionInput } = {},
): Ingredient {
  const c = toPoint(at);
  const a = axes(options.dir, options.up);
  const round = Math.min(options.round ?? 0, ...half);
  const [hx, hy, hz] = half.map((h) => h - round);
  const ext = extent(a, half);
  return {
    cut: false,
    options,
    anchors: [at],
    bounds: new Box3(c.clone().sub(ext), c.clone().add(ext)),
    center: c,
    make: () => (x, y, z) => {
      const px = x - c.x;
      const py = y - c.y;
      const pz = z - c.z;
      const qx = Math.abs(px * a.x.x + py * a.x.y + pz * a.x.z) - hx;
      const qy = Math.abs(px * a.y.x + py * a.y.y + pz * a.y.z) - hy;
      const qz = Math.abs(px * a.z.x + py * a.z.y + pz * a.z.z) - hz;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - round;
    },
  };
}

/** Distance to the round cone from `a` (radius r1) to `b` (radius r2): a capsule that tapers. */
function roundCone(a: Vector3, b: Vector3, r1: number, r2: number): Dist {
  const bx = b.x - a.x;
  const by = b.y - a.y;
  const bz = b.z - a.z;
  const l2 = bx * bx + by * by + bz * bz;
  const rr = r1 - r2;
  const a2 = l2 - rr * rr;
  if (l2 < 1e-12 || a2 <= 1e-12)
    return (x, y, z) =>
      Math.min(Math.hypot(x - a.x, y - a.y, z - a.z) - r1, Math.hypot(x - b.x, y - b.y, z - b.z) - r2);
  const il2 = 1 / l2;
  return (x, y, z) => {
    const pax = x - a.x;
    const pay = y - a.y;
    const paz = z - a.z;
    const y1 = pax * bx + pay * by + paz * bz;
    const z1 = y1 - l2;
    const cx = pax * l2 - bx * y1;
    const cy = pay * l2 - by * y1;
    const cz = paz * l2 - bz * y1;
    const x2 = cx * cx + cy * cy + cz * cz;
    const y2 = y1 * y1 * l2;
    const z2 = z1 * z1 * l2;
    const k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(z1) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(y1) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + y1 * rr) * il2 - r1;
  };
}

/** A tube with round ends from `a` to `b`, radius `r` or tapering `[r0, r1]`. */
export function capsule(
  a: PointInput,
  b: PointInput,
  r: number | readonly [number, number],
  options: IngredientOptions = {},
): Ingredient {
  const p = toPoint(a);
  const q = toPoint(b);
  const [r0, r1] = typeof r === "number" ? [r, r] : r;
  const bounds = new Box3().setFromPoints([p, q]);
  bounds.min.subScalar(Math.max(r0, r1));
  bounds.max.addScalar(Math.max(r0, r1));
  return {
    cut: false,
    options,
    anchors: [a, b],
    bounds,
    center: p.clone().add(q).multiplyScalar(0.5),
    make: () => roundCone(p, q, r0, r1),
  };
}

type Radii = number | readonly number[] | ((t: number) => number);

/** Radius at t: a number, keys spread evenly along the path (smooth, Catmull-Rom), or a function. */
function radiusAt(radius: Radii): (t: number) => number {
  if (typeof radius === "number") return () => radius;
  if (typeof radius === "function") return radius;
  const keys = radius;
  if (keys.length === 1) return () => keys[0];
  return (t) => {
    const u = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(u), keys.length - 2);
    const f = u - i;
    const p0 = keys[Math.max(i - 1, 0)];
    const p1 = keys[i];
    const p2 = keys[i + 1];
    const p3 = keys[Math.min(i + 2, keys.length - 1)];
    return (
      0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (3 * p1 - p0 - 3 * p2 + p3) * f * f * f)
    );
  };
}

/** A tube along a Path (or a Chain's centreline, which it then rides). */
export function tube(source: PathInput, radius: Radii, options: IngredientOptions = {}): Ingredient {
  const path: Path = toPath(source);
  const radiusOf = radiusAt(radius);
  const samples = Array.from({ length: 65 }, (_, i) => radiusOf(i / 64));
  const rMax = Math.max(...samples);
  const pts = Array.from({ length: 65 }, (_, i) => path.at(i / 64));
  const bounds = new Box3().setFromPoints(pts).expandByScalar(rMax);
  return {
    cut: false,
    options,
    anchors: [source],
    bounds,
    center: bounds.getCenter(new Vector3()),
    chain: source instanceof Chain ? source : undefined,
    make: (cell) => {
      const steps = Math.max(2, Math.ceil(path.length / (cell * 1.5)));
      const cones = Array.from({ length: steps }, (_, i) =>
        roundCone(path.at(i / steps), path.at((i + 1) / steps), radiusOf(i / steps), radiusOf((i + 1) / steps)),
      );
      return (x, y, z) => {
        let d = Infinity;
        for (const cone of cones) d = Math.min(d, cone(x, y, z));
        return d;
      };
    },
  };
}

/** Everything beyond `at` in direction `dir`. Meaningful only inside `carve`: a flat cut. */
export function plane(at: PointInput, dir: DirectionInput, options: IngredientOptions = {}): Ingredient {
  const c = toPoint(at);
  const n = toDirection(dir).normalize();
  return {
    cut: false,
    options,
    anchors: [],
    bounds: null,
    center: c,
    make: () => (x, y, z) => -((x - c.x) * n.x + (y - c.y) * n.y + (z - c.z) * n.z),
  };
}

/** The same volume, taken away from the shape so far instead of added to it. `options` override its `bone` and `blend`. */
export function carve(ingredient: Ingredient, options: IngredientOptions = {}): Ingredient {
  return { ...ingredient, cut: true, options: { ...ingredient.options, ...options } };
}

/** The same volume, `d` meters bigger all round (smaller when negative): a garment over a body part, a thin layer to carve. */
export function grow(ingredient: Ingredient, d: number): Ingredient {
  return {
    ...ingredient,
    bounds: ingredient.bounds && ingredient.bounds.clone().expandByScalar(Math.max(d, 0)),
    make: (cell) => {
      const dist = ingredient.make(cell);
      return (x, y, z) => dist(x, y, z) - d;
    },
  };
}

export type BlobOptions = Tags & {
  /** A colour or a Paint. */
  color: Fill;
  /** Width of the smooth junctions, meters (default 0.04). */
  blend?: number;
  /** Mesh cell size, meters (default 0.02). */
  cell?: number;
  /** How far bone weights are diffused over the surface, meters (default twice `blend`). */
  spread?: number;
  /** Bone for ingredients that name none: a Joint, joint name or Chain. */
  bone?: JointRef | Chain;
  /** Smooth shading from the field's normals (default true); false gives flat facets. */
  smooth?: boolean;
};

/** Bone weights of an ingredient at a point: `[boneIndex, weight]` pairs. */
type Weigh = (x: number, y: number, z: number) => ReadonlyArray<readonly [number, number]>;

type Prepared = {
  cut: boolean;
  k: number;
  dist: Dist;
  weigh: Weigh | null;
  lo: Vector3;
  hi: Vector3;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Merge the ingredients into one closed, skinned mesh. See the module comment. */
export function blob(b: Builder, ingredients: readonly Ingredient[], options: BlobOptions): Part {
  const ctx: Ctx = b["ctx"]; // the builder's context is private; blobs are an extension that needs it
  const blend = options.blend ?? 0.04;
  const cell = options.cell ?? 0.02;
  if (!(blend > 0) || !(cell > 0)) throw new Error("blob(): blend and cell must be positive");
  const spread = options.spread ?? 2 * blend;
  if (!ingredients.some((ing) => !ing.cut)) throw new Error("blob(): needs at least one ingredient that isn't carved");

  // Bones used by the blob, in first-use order.
  const bones: Joint[] = [];
  const boneIndex = (joint: Joint) => {
    let i = bones.indexOf(joint);
    if (i < 0) i = bones.push(joint) - 1;
    return i;
  };
  const constant = (weights: Weights): Weigh => {
    const fixed = weights.map(([joint, w]) => [boneIndex(joint), w] as const);
    return () => fixed;
  };
  const along = (chain: Chain): Weigh => {
    chain.joints.forEach(boneIndex);
    const p = new Vector3();
    return (x, y, z) => chain.weightsAt(chain.path.closestT(p.set(x, y, z))).map(([joint, w]) => [boneIndex(joint), w]);
  };
  const boneWeigh = (bone: JointRef | Chain): Weigh =>
    bone instanceof Chain ? along(bone) : constant(rigid(resolveJoint(ctx, bone)));

  const list: Prepared[] = ingredients.map((ing) => {
    const k = ing.options.blend ?? blend;
    if (!(k > 0)) throw new Error("blob(): blend must be positive");
    let weigh: Weigh | null = null;
    const explicit = ing.options.bone;
    if (explicit !== undefined) weigh = boneWeigh(explicit);
    else if (!ing.cut) {
      const inherited = ing.anchors.map(weightsOf).find((w) => w);
      if (ing.chain) weigh = along(ing.chain);
      else if (inherited) weigh = constant(inherited);
      else if (options.bone !== undefined) weigh = boneWeigh(options.bone);
      else weigh = constant(rigid(nearestJoint(ctx, ing.center)));
    }
    const margin = k + 2 * cell;
    const lo = ing.bounds ? ing.bounds.min.clone().subScalar(margin) : new Vector3().setScalar(-FAR);
    const hi = ing.bounds ? ing.bounds.max.clone().addScalar(margin) : new Vector3().setScalar(FAR);
    return { cut: ing.cut, k, dist: ing.make(cell), weigh, lo, hi };
  });

  // The field at a point, and optionally the folded bone weights (dense over `bones`).
  const fold = (x: number, y: number, z: number, w?: Float64Array) => {
    let d = FAR;
    if (w) w.fill(0);
    for (const q of list) {
      if (x < q.lo.x || x > q.hi.x || y < q.lo.y || y > q.hi.y || z < q.lo.z || z > q.hi.z) continue;
      const e = q.dist(x, y, z);
      let keep: number;
      if (!q.cut) {
        keep = clamp01(0.5 + (0.5 * (e - d)) / q.k);
        d = e * (1 - keep) + d * keep - q.k * keep * (1 - keep);
      } else {
        keep = clamp01(0.5 + (0.5 * (d + e)) / q.k);
        d = -e * (1 - keep) + d * keep + q.k * keep * (1 - keep);
      }
      if (w && q.weigh) {
        for (let i = 0; i < w.length; i++) w[i] *= keep;
        for (const [i, weight] of q.weigh(x, y, z)) w[i] += (1 - keep) * weight;
      }
    }
    return d;
  };
  // Weights are written by `fold` into a dense array over `bones`, which grows while ingredients are prepared: it
  // is fully known by now.
  const nb = bones.length;

  // The grid.
  const bounds = new Box3();
  for (const ing of ingredients) if (!ing.cut && ing.bounds) bounds.union(ing.bounds);
  const pad = Math.max(blend, ...list.map((q) => q.k)) + 3 * cell;
  const ox = Math.floor((bounds.min.x - pad) / cell) * cell;
  const oy = Math.floor((bounds.min.y - pad) / cell) * cell;
  const oz = Math.floor((bounds.min.z - pad) / cell) * cell;
  const nx = Math.ceil((bounds.max.x + pad - ox) / cell) + 1;
  const ny = Math.ceil((bounds.max.y + pad - oy) / cell) + 1;
  const nz = Math.ceil((bounds.max.z + pad - oz) / cell) + 1;
  if (nx * ny * nz > 3e7) throw new Error(`blob(): ${nx}×${ny}×${nz} grid points; use a larger cell or split the blob`);
  const at = (i: number, j: number, k: number) => i + nx * (j + ny * k);
  const field = new Float32Array(nx * ny * nz).fill(FAR);
  for (const q of list) {
    const i0 = Math.max(Math.floor((q.lo.x - ox) / cell), 0);
    const i1 = Math.min(Math.ceil((q.hi.x - ox) / cell), nx - 1);
    const j0 = Math.max(Math.floor((q.lo.y - oy) / cell), 0);
    const j1 = Math.min(Math.ceil((q.hi.y - oy) / cell), ny - 1);
    const k0 = Math.max(Math.floor((q.lo.z - oz) / cell), 0);
    const k1 = Math.min(Math.ceil((q.hi.z - oz) / cell), nz - 1);
    for (let k = k0; k <= k1; k++)
      for (let j = j0; j <= j1; j++)
        for (let i = i0; i <= i1; i++) {
          const e = q.dist(ox + i * cell, oy + j * cell, oz + k * cell);
          const idx = at(i, j, k);
          const d = field[idx];
          if (!q.cut) {
            const keep = clamp01(0.5 + (0.5 * (e - d)) / q.k);
            field[idx] = e * (1 - keep) + d * keep - q.k * keep * (1 - keep);
          } else {
            const keep = clamp01(0.5 + (0.5 * (d + e)) / q.k);
            field[idx] = -e * (1 - keep) + d * keep + q.k * keep * (1 - keep);
          }
        }
  }

  // Surface nets: one vertex per cell whose corners differ in sign, at the mean of its edge crossings.
  const cellVertex = new Int32Array(nx * ny * nz).fill(-1);
  const pos: number[] = [];
  const corner: Array<readonly [number, number, number]> = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ];
  const edges: Array<readonly [number, number]> = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  const values = new Float64Array(8);
  for (let k = 0; k < nz - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          const [di, dj, dk] = corner[c];
          const v = field[at(i + di, j + dj, k + dk)];
          values[c] = v;
          if (v < 0) mask |= 1 << c;
        }
        if (mask === 0 || mask === 255) continue;
        let sx = 0;
        let sy = 0;
        let sz = 0;
        let n = 0;
        for (const [a, c] of edges) {
          const va = values[a];
          const vc = values[c];
          if (va < 0 === vc < 0) continue;
          const f = va / (va - vc);
          sx += corner[a][0] + (corner[c][0] - corner[a][0]) * f;
          sy += corner[a][1] + (corner[c][1] - corner[a][1]) * f;
          sz += corner[a][2] + (corner[c][2] - corner[a][2]) * f;
          n++;
        }
        cellVertex[at(i, j, k)] = pos.length / 3;
        pos.push(ox + (i + sx / n) * cell, oy + (j + sy / n) * cell, oz + (k + sz / n) * cell);
      }

  // Quads around every sign-changing grid edge, wound counter-clockwise seen from outside.
  const index: number[] = [];
  const quad = (a: number, c: number, d: number, e: number, flip: boolean) => {
    const v = flip ? [a, e, d, c] : [a, c, d, e];
    // Split along the shorter diagonal.
    const dist2 = (p: number, q: number) =>
      (pos[p * 3] - pos[q * 3]) ** 2 + (pos[p * 3 + 1] - pos[q * 3 + 1]) ** 2 + (pos[p * 3 + 2] - pos[q * 3 + 2]) ** 2;
    if (dist2(v[0], v[2]) <= dist2(v[1], v[3])) index.push(v[0], v[1], v[2], v[0], v[2], v[3]);
    else index.push(v[0], v[1], v[3], v[1], v[2], v[3]);
  };
  for (let k = 1; k < nz - 1; k++)
    for (let j = 1; j < ny - 1; j++)
      for (let i = 1; i < nx - 1; i++) {
        const here = field[at(i, j, k)] < 0;
        if (field[at(i + 1, j, k)] < 0 !== here)
          quad(
            cellVertex[at(i, j - 1, k - 1)],
            cellVertex[at(i, j, k - 1)],
            cellVertex[at(i, j, k)],
            cellVertex[at(i, j - 1, k)],
            !here,
          );
        if (field[at(i, j + 1, k)] < 0 !== here)
          quad(
            cellVertex[at(i - 1, j, k - 1)],
            cellVertex[at(i - 1, j, k)],
            cellVertex[at(i, j, k)],
            cellVertex[at(i, j, k - 1)],
            !here,
          );
        if (field[at(i, j, k + 1)] < 0 !== here)
          quad(
            cellVertex[at(i - 1, j - 1, k)],
            cellVertex[at(i, j - 1, k)],
            cellVertex[at(i, j, k)],
            cellVertex[at(i - 1, j, k)],
            !here,
          );
      }
  const count = pos.length / 3;
  if (!count) throw new Error("blob(): the shape is empty (nothing crosses zero on the grid)");

  // Surface graph: neighbours of every vertex.
  const neighbours: Set<number>[] = Array.from({ length: count }, () => new Set());
  for (let t = 0; t < index.length; t += 3)
    for (let c = 0; c < 3; c++) {
      const a = index[t + c];
      const e = index[t + ((c + 1) % 3)];
      neighbours[a].add(e);
      neighbours[e].add(a);
    }
  const lists = neighbours.map((s) => [...s]);

  // Move each vertex onto the exact surface, then even the triangles out: two rounds of moving every vertex to the
  // mean of its neighbours and back onto the surface.
  const h = cell * 0.5;
  const gradient = new Vector3();
  const gradientAt = (x: number, y: number, z: number) =>
    gradient.set(
      fold(x + h, y, z) - fold(x - h, y, z),
      fold(x, y + h, z) - fold(x, y - h, z),
      fold(x, y, z + h) - fold(x, y, z - h),
    );
  const settle = (v: number, x: number, y: number, z: number, limit: number) => {
    for (let step = 0; step < 3; step++) {
      const g2 = gradientAt(x, y, z).lengthSq();
      if (g2 < 1e-12) break;
      const s = (fold(x, y, z) * 2 * h) / g2;
      x -= gradient.x * s;
      y -= gradient.y * s;
      z -= gradient.z * s;
      const dx = x - pos[v * 3];
      const dy = y - pos[v * 3 + 1];
      const dz = z - pos[v * 3 + 2];
      const away = Math.hypot(dx, dy, dz);
      if (away > limit) {
        x = pos[v * 3] + (dx * limit) / away;
        y = pos[v * 3 + 1] + (dy * limit) / away;
        z = pos[v * 3 + 2] + (dz * limit) / away;
      }
    }
    return [x, y, z] as const;
  };
  for (let round = 0; round < 3; round++) {
    const moved = new Float64Array(pos.length);
    for (let v = 0; v < count; v++) {
      let x = pos[v * 3];
      let y = pos[v * 3 + 1];
      let z = pos[v * 3 + 2];
      if (round > 0 && lists[v].length) {
        x = y = z = 0;
        for (const u of lists[v]) {
          x += pos[u * 3];
          y += pos[u * 3 + 1];
          z += pos[u * 3 + 2];
        }
        x /= lists[v].length;
        y /= lists[v].length;
        z /= lists[v].length;
      }
      moved.set(settle(v, x, y, z, cell), v * 3);
    }
    for (let i = 0; i < pos.length; i++) pos[i] = moved[i];
  }

  // Normals and bone weights at the final positions.
  const normals: number[] = new Array(count * 3);
  const dense = new Float64Array(count * nb);
  const w = new Float64Array(nb);
  for (let v = 0; v < count; v++) {
    const x = pos[v * 3];
    const y = pos[v * 3 + 1];
    const z = pos[v * 3 + 2];
    gradientAt(x, y, z)
      .normalize()
      .toArray(normals, v * 3);
    fold(x, y, z, w);
    dense.set(w, v * nb);
  }

  // Diffuse the weights over the surface graph, so joints bend over a stretch of skin, not along one seam.
  if (spread > 0 && nb > 1) {
    const rounds = Math.max(1, Math.round(1.25 * (spread / cell) ** 2));
    let cur = dense;
    let next = new Float64Array(dense.length);
    for (let r = 0; r < rounds; r++) {
      for (let v = 0; v < count; v++) {
        const around = lists[v];
        for (let c = 0; c < nb; c++) {
          let sum = 0;
          for (const u of around) sum += cur[u * nb + c];
          next[v * nb + c] = around.length ? 0.5 * cur[v * nb + c] + (0.5 * sum) / around.length : cur[v * nb + c];
        }
      }
      [cur, next] = [next, cur];
    }
    if (cur !== dense) dense.set(cur);
  }

  // At most four bones per vertex, renormalised.
  const weights: Weights[] = Array.from({ length: count }, (_, v) => {
    const row = Array.from({ length: nb }, (_, c) => [c, dense[v * nb + c]] as const)
      .filter(([, x]) => x > 0.02)
      .sort((a, c) => c[1] - a[1])
      .slice(0, 4);
    const total = row.reduce((s, [, x]) => s + x, 0);
    return row.length && total > 0
      ? row.map(([c, x]) => [bones[c], x / total] as const)
      : rigid(nearestJoint(ctx, new Vector3(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2])));
  });

  const mesh = meshFromWorld(
    ctx,
    pos,
    index,
    options.color,
    (v) => weights[v],
    options.smooth === false ? false : true,
    { name: options.name ?? "blob", group: options.group },
    options.smooth === false ? {} : { normals },
  );
  const centre = bounds.getCenter(new Vector3());
  return new Part(mesh, centre, new Quaternion(), rigid(ctx.owner.get(mesh) ?? null), [0, 1, 0]);
}
