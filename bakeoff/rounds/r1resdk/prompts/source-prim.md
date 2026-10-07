# Your task

You write one three.js model in code: the subject in the user's pitch, built from primitives with the agentic-3js-builder SDK. An application runs your module and shows the model in 3D. You get one reply, so the module you send is the finished model. The quality of the model is the top priority.

## Your reply

Your reply is one TypeScript module in a single ```ts code block. Text outside the block is ignored.

- `import * as THREE from "three";` for three.js (r185).
- Every SDK export comes from one module: `import { createBuilder, frame, rng, ... } from "agentic-3js-builder";`. The reference below may show per-file import paths; all of them are exports of `"agentic-3js-builder"`.
- The module default-exports a function with no arguments that returns a `THREE.Object3D` (the builder's `b.root`), and exports `meta = { name, description }`.
- Randomness comes from `rng(seed)`, so every run builds the same model.
- The module runs as it is: every name it uses is defined or imported.

## The model

- Meters. +Y up, the model faces +Z, its left side is +X, centred on x = 0.
- It stands on y = 0: its lowest points touch the floor or sink into it by up to 2% of the model's height, and nothing hangs above it. A model the pitch places off the ground (a bird in flight, a hanging lantern) keeps that height.
- Real-world size for the subject, unless the pitch says otherwise.
- Creatures are built skeleton first and stand in a rest pose for rigging and animation: a neutral, readable pose, the non-humanoid equivalent of a T-pose, with limbs, digits, wings, tails and tentacles separated and extended, and the mouth built as a separate upper and lower jaw so it can open.
- Joints carry names a rigger recognises (`hipL`, `kneeL`, `jaw`, `tail3`) and chains carry a `role` (`spine neck head jaw hinge tail leg arm wing digit tentacle fan`).
- Props and scenery can be plain objects without joints.
- Limits: 1000 parts, 60k triangles, 160 joints, 64 flat colours.

## Art direction

> By lots of detail I mean mostly a simple base. Each of these is still made out of primitives so they should retain that blocky shape expected of a puppet made out of primitives. The composition, the color and material choice, and the little details on top of those simple shapes should be what give me that wow factor.

The look is stylized: bold, readable shapes and proportions, a clear colour palette, and features shaped with character and emphasised where that helps the subject read. Use as many primitives as you need to make it look good. Surfaces can carry more than flat colour: paints, SVG drawings as textures, decals on curved surfaces, and cards.

The wow comes from creativity, not smoothness. The look is low-poly: facets are part of it, and every part gets only enough segments to read as its shape at the size it is seen. Paints, textures and cards carry the fine detail.

## How to build

Build from simple primitives: boxes, spheres, cylinders, cones, capsules and tori from three.js, each a clear, readable shape placed and aimed with `b.part`, and rigged on the skeleton you make with `b.joint` and `b.chain`. Reach for the SDK's shaping helpers (sweeps, lofts, extrudes, lathes, membranes, surface hits, paints, cards) only for the pieces simple primitives can't express: a tail or neck that must bend as one smooth piece, a wing membrane, a flat fin or blade outline, a pattern across a body.

# SDK source

The complete source of the SDK. `src/index.ts` is the module `"agentic-3js-builder"`.

## src/bake.ts

```ts
// Paint baking. A painted mesh is cut into charts when it is built: triangles facing the same way (±x, ±y, ±z) and
// joined by an edge form one chart, laid flat along that axis, so no chart folds over itself. When the builder's
// root is read, every chart of every painted mesh is packed into one shared sheet at one texel density, and each
// texel gets its paint's colour at the model-space point (and normal) it covers. All painted meshes share one
// material whose map is that sheet.
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  Float32BufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  Matrix3,
  Matrix4,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  Vector3,
} from "three";
import type { Mesh, MeshStandardMaterial, TypedArray } from "three";
import type { Paint } from "./paint";

type Chart = {
  /** Triangle corners, 3 vertex ids per triangle, in the cut geometry. */
  tris: number[];
  min: [number, number];
  size: [number, number];
};

/** A painted mesh waiting for (or holding) its place in the sheet. */
export type Painted = {
  mesh: Mesh;
  paint: Paint;
  charts: Chart[];
  /** Flat chart coordinates in meters, 2 per vertex. */
  flat: Float32Array;
  /** Bind-pose model-space positions and normals, 3 per vertex. */
  world: Float32Array;
  normal: Float32Array;
  /** The part's own surface coordinates, 2 per vertex (`SurfaceCoords`); null when it has none. */
  surface: Float32Array | null;
  /** The second surface coordinate is an angle in degrees that wraps at 360. */
  wrap: boolean;
};

/** The vertex attribute a shape stores its own surface coordinates in, until `chartify` takes them. */
export const SURFACE = "_surface";

/**
 * The geometry cut into charts: vertices shared between charts are split, every attribute is carried over, and a
 * `uv` attribute is added (filled in when the sheet is packed). `toWorld` places the geometry in model space. The
 * shape's surface coordinates come from its `_surface` attribute, else its own `uv`.
 */
export function chartify(source: BufferGeometry, toWorld: Matrix4) {
  if (!source.getAttribute("normal")) source.computeVertexNormals();
  const position = source.getAttribute("position");
  const normal = source.getAttribute("normal");
  const count = position.count;
  const index = source.index ? Array.from(source.index.array) : Array.from({ length: count }, (_, i) => i);
  const normalToWorld = new Matrix3().getNormalMatrix(toWorld);
  const world = new Float32Array(count * 3);
  const worldNormal = new Float32Array(count * 3);
  const v = new Vector3();
  for (let i = 0; i < count; i++) {
    v.fromBufferAttribute(position, i)
      .applyMatrix4(toWorld)
      .toArray(world, i * 3);
    v.fromBufferAttribute(normal, i)
      .applyMatrix3(normalToWorld)
      .normalize()
      .toArray(worldNormal, i * 3);
  }

  // Weld by position so flat-shaded (unindexed) meshes still join along their edges.
  const weldOf = new Map<string, number>();
  const weld = new Int32Array(count);
  const scale = Math.max(...boxSize(world)) || 1;
  const q = 1e5 / scale;
  for (let i = 0; i < count; i++) {
    const key = `${Math.round(world[i * 3] * q)},${Math.round(world[i * 3 + 1] * q)},${Math.round(world[i * 3 + 2] * q)}`;
    let id = weldOf.get(key);
    if (id === undefined) weldOf.set(key, (id = weldOf.size));
    weld[i] = id;
  }

  const triCount = index.length / 3;
  const label = new Int8Array(triCount);
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  for (let t = 0; t < triCount; t++) {
    a.fromArray(world, index[t * 3] * 3);
    b.fromArray(world, index[t * 3 + 1] * 3);
    c.fromArray(world, index[t * 3 + 2] * 3);
    const n = b.sub(a).cross(c.sub(a));
    if (n.lengthSq() < 1e-24)
      for (let k = 0; k < 3; k++) n.add(new Vector3().fromArray(worldNormal, index[t * 3 + k] * 3));
    const ax = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];
    const axis = ax[0] >= ax[1] && ax[0] >= ax[2] ? 0 : ax[1] >= ax[2] ? 1 : 2;
    label[t] = axis * 2 + (n.getComponent(axis) < 0 ? 1 : 0);
  }

  // Union triangles that share an edge and face the same way.
  const parent = Int32Array.from({ length: triCount }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  const edgeOwner = new Map<string, number>();
  for (let t = 0; t < triCount; t++)
    for (let k = 0; k < 3; k++) {
      const p0 = weld[index[t * 3 + k]];
      const p1 = weld[index[t * 3 + ((k + 1) % 3)]];
      const key = p0 < p1 ? `${p0}_${p1}` : `${p1}_${p0}`;
      const other = edgeOwner.get(key);
      if (other === undefined) edgeOwner.set(key, t);
      else if (label[other] === label[t]) parent[find(other)] = find(t);
    }

  // One new vertex per (chart, source vertex).
  const chartOf = new Map<number, number>();
  const charts: Chart[] = [];
  const remap = new Map<string, number>();
  const sourceOf: number[] = [];
  const flatList: number[] = [];
  for (let t = 0; t < triCount; t++) {
    const root = find(t);
    let ci = chartOf.get(root);
    if (ci === undefined) {
      chartOf.set(root, (ci = charts.length));
      charts.push({ tris: [], min: [Infinity, Infinity], size: [0, 0] });
    }
    const chart = charts[ci];
    const axis = label[t] >> 1;
    for (let k = 0; k < 3; k++) {
      const src = index[t * 3 + k];
      const key = `${ci}:${src}`;
      let id = remap.get(key);
      if (id === undefined) {
        remap.set(key, (id = sourceOf.length));
        sourceOf.push(src);
        const x = world[src * 3];
        const y = world[src * 3 + 1];
        const z = world[src * 3 + 2];
        const [fu, fv] = axis === 0 ? [z, y] : axis === 1 ? [x, z] : [x, y];
        flatList.push(fu, fv);
        chart.min[0] = Math.min(chart.min[0], fu);
        chart.min[1] = Math.min(chart.min[1], fv);
        chart.size[0] = Math.max(chart.size[0], fu);
        chart.size[1] = Math.max(chart.size[1], fv);
      }
      chart.tris.push(id);
    }
  }
  for (const chart of charts) chart.size = [chart.size[0] - chart.min[0], chart.size[1] - chart.min[1]];

  const geometry = new BufferGeometry();
  const own = source.getAttribute(SURFACE) ?? source.getAttribute("uv");
  let surface: Float32Array | null = null;
  if (own) {
    surface = new Float32Array(sourceOf.length * 2);
    sourceOf.forEach((src, i) => surface!.set([own.getX(src), own.getY(src)], i * 2));
  }
  for (const [name, attribute] of Object.entries(source.attributes)) {
    if (name === "uv" || name === SURFACE) continue;
    const size = attribute.itemSize;
    const from = attribute.array as TypedArray;
    const to = new (from.constructor as new (n: number) => TypedArray)(sourceOf.length * size);
    sourceOf.forEach((src, i) => {
      for (let k = 0; k < size; k++) to[i * size + k] = from[src * size + k];
    });
    geometry.setAttribute(name, new BufferAttribute(to, size, attribute.normalized));
  }
  geometry.setAttribute("uv", new Float32BufferAttribute(new Float32Array(sourceOf.length * 2), 2));
  geometry.setIndex(charts.flatMap((chart) => chart.tris));
  const pick = (from: Float32Array) => {
    const out = new Float32Array(sourceOf.length * 3);
    sourceOf.forEach((src, i) => out.set(from.subarray(src * 3, src * 3 + 3), i * 3));
    return out;
  };
  return {
    geometry,
    charts,
    flat: Float32Array.from(flatList),
    surface,
    world: pick(world),
    normal: pick(worldNormal),
  };
}

function boxSize(xyz: Float32Array) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < xyz.length; i++) {
    min[i % 3] = Math.min(min[i % 3], xyz[i]);
    max[i % 3] = Math.max(max[i % 3], xyz[i]);
  }
  return max.map((m, k) => m - min[k]);
}

/** Texels of margin around every chart, filled by dilation so filtering and mip levels never reach a neighbour. */
const PAD = 4;
/** No sheet is finer than this, however small the creature. */
const MAX_DENSITY = 4000;

/** Where shelf packing put each rectangle, and the height it used. */
type Packing = { at: Array<[number, number]>; used: number };

/** Shelf-pack rectangles (widths, heights) into `width`; returns their corners and the used height, or null. */
function shelfPack(sizes: Array<[number, number]>, width: number, height: number): Packing | null {
  const order = sizes.map((_, i) => i).sort((i, j) => sizes[j][1] - sizes[i][1]);
  const at: Array<[number, number]> = new Array(sizes.length);
  let x = 0;
  let y = 0;
  let shelf = 0;
  for (const i of order) {
    const [w, h] = sizes[i];
    if (w > width) return null;
    if (x + w > width) {
      y += shelf;
      x = 0;
      shelf = 0;
    }
    if (y + h > height) return null;
    at[i] = [x, y];
    x += w;
    shelf = Math.max(shelf, h);
  }
  return { at, used: y + shelf };
}

/**
 * Pack every chart into one sheet, write each painted mesh's `uv`, paint the texels and set `material.map`.
 * `side` is the sheet width in texels; its height is trimmed to what the charts use.
 */
export function bakeSheet(painted: readonly Painted[], material: MeshStandardMaterial, side: number) {
  const charts = painted.flatMap((entry) => entry.charts.map((chart) => ({ entry, chart })));
  const area = charts.reduce(
    (sum, { chart }) => sum + Math.max(chart.size[0], 1e-4) * Math.max(chart.size[1], 1e-4),
    0,
  );
  let density = Math.min(Math.sqrt((0.7 * side * side) / Math.max(area, 1e-9)), MAX_DENSITY);
  let packed: Packing | null = null;
  let sizes: Array<[number, number]> = [];
  for (let attempt = 0; attempt < 60 && !packed; attempt++) {
    sizes = charts.map(({ chart }) => [
      Math.ceil(chart.size[0] * density) + 1 + 2 * PAD,
      Math.ceil(chart.size[1] * density) + 1 + 2 * PAD,
    ]);
    packed = shelfPack(sizes, side, side);
    if (!packed) density *= 0.92;
  }
  if (!packed) throw new Error("paint: the painted parts could not be packed into one sheet");
  const width = side;
  const height = Math.max(4, Math.ceil(packed.used / 4) * 4);
  const data = new Uint8Array(width * height * 4);
  const filled = new Uint8Array(width * height);

  const p = new Vector3();
  const n = new Vector3();
  charts.forEach(({ entry, chart }, ci) => {
    const [ox, oy] = packed!.at[ci];
    const uv = entry.mesh.geometry.getAttribute("uv") as BufferAttribute;
    const px = (id: number) => ox + PAD + 0.5 + (entry.flat[id * 2] - chart.min[0]) * density;
    const py = (id: number) => oy + PAD + 0.5 + (entry.flat[id * 2 + 1] - chart.min[1]) * density;
    for (const id of new Set(chart.tris)) uv.setXY(id, px(id) / width, py(id) / height);
    for (let t = 0; t < chart.tris.length; t += 3) {
      const ids = [chart.tris[t], chart.tris[t + 1], chart.tris[t + 2]];
      const xs = ids.map(px);
      const ys = ids.map(py);
      // The triangle's surface coordinates, an angle unwrapped so a triangle across 0° doesn't average to 180°.
      const ss = entry.surface ? ids.map((id) => [entry.surface![id * 2], entry.surface![id * 2 + 1]]) : null;
      if (ss && entry.wrap) for (let k = 1; k < 3; k++) ss[k][1] += 360 * Math.round((ss[0][1] - ss[k][1]) / 360);
      const det = (ys[1] - ys[2]) * (xs[0] - xs[2]) + (xs[2] - xs[1]) * (ys[0] - ys[2]);
      if (Math.abs(det) < 1e-9) continue;
      // Half a texel of slack along each edge, so texels straddling an edge are painted from the nearest point.
      const slack = [0, 1, 2].map((k) => {
        const [i, j] = [(k + 1) % 3, (k + 2) % 3];
        return (0.75 * Math.hypot(xs[j] - xs[i], ys[j] - ys[i])) / Math.abs(det);
      });
      const x0 = Math.max(Math.floor(Math.min(...xs) - 1), 0);
      const x1 = Math.min(Math.ceil(Math.max(...xs) + 1), width - 1);
      const y0 = Math.max(Math.floor(Math.min(...ys) - 1), 0);
      const y1 = Math.min(Math.ceil(Math.max(...ys) + 1), height - 1);
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const cx = x + 0.5;
          const cy = y + 0.5;
          let w0 = ((ys[1] - ys[2]) * (cx - xs[2]) + (xs[2] - xs[1]) * (cy - ys[2])) / det;
          let w1 = ((ys[2] - ys[0]) * (cx - xs[2]) + (xs[0] - xs[2]) * (cy - ys[2])) / det;
          let w2 = 1 - w0 - w1;
          if (w0 < -slack[0] || w1 < -slack[1] || w2 < -slack[2]) continue;
          const texel = y * width + x;
          const inside = w0 >= 0 && w1 >= 0 && w2 >= 0;
          if (filled[texel] === 2 || (filled[texel] === 1 && !inside)) continue;
          w0 = Math.max(w0, 0);
          w1 = Math.max(w1, 0);
          w2 = Math.max(w2, 0);
          const sum = w0 + w1 + w2;
          p.set(0, 0, 0);
          n.set(0, 0, 0);
          [w0, w1, w2].forEach((w, k) => {
            const o = ids[k] * 3;
            p.x += (entry.world[o] * w) / sum;
            p.y += (entry.world[o + 1] * w) / sum;
            p.z += (entry.world[o + 2] * w) / sum;
            n.x += entry.normal[o] * w;
            n.y += entry.normal[o + 1] * w;
            n.z += entry.normal[o + 2] * w;
          });
          if (n.lengthSq() < 1e-12) n.set(0, 1, 0);
          let s: [number, number] | undefined;
          if (ss) {
            s = [
              (ss[0][0] * w0 + ss[1][0] * w1 + ss[2][0] * w2) / sum,
              (ss[0][1] * w0 + ss[1][1] * w1 + ss[2][1] * w2) / sum,
            ];
            if (entry.wrap) s[1] = ((s[1] % 360) + 360) % 360;
          }
          const color = entry.paint.at(p, n.normalize(), s);
          data[texel * 4] = Math.round(Math.min(Math.max(color[0], 0), 1) * 255);
          data[texel * 4 + 1] = Math.round(Math.min(Math.max(color[1], 0), 1) * 255);
          data[texel * 4 + 2] = Math.round(Math.min(Math.max(color[2], 0), 1) * 255);
          data[texel * 4 + 3] = 255;
          filled[texel] = inside ? 2 : 1;
        }
    }
    uv.needsUpdate = true;
  });
  dilate(data, filled, width, height, PAD);
  for (let i = 3; i < data.length; i += 4) data[i] = 255;

  material.map?.dispose();
  const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
  texture.name = "paint";
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  material.map = texture;
  material.needsUpdate = true;
  return { texture, density };
}

/**
 * Grow the colours of `filled` texels into their empty neighbours, `passes` texels deep, so bilinear filtering and
 * smaller mip levels at a chart's (or a cut-out's) edge blend with the right colour instead of black.
 */
export function dilate(data: Uint8Array, filled: Uint8Array, width: number, height: number, passes: number) {
  for (let pass = 0; pass < passes; pass++) {
    const grown: number[] = [];
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (filled[i]) continue;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
            const j = yy * width + xx;
            if (!filled[j]) continue;
            r += data[j * 4];
            g += data[j * 4 + 1];
            b += data[j * 4 + 2];
            count++;
          }
        if (!count) continue;
        data[i * 4] = r / count;
        data[i * 4 + 1] = g / count;
        data[i * 4 + 2] = b / count;
        grown.push(i);
      }
    if (!grown.length) return;
    for (const i of grown) filled[i] = 1;
  }
}
```

## src/builder.ts

```ts
// Entry point: `createBuilder()` composes every helper around one shared context. Return `b.root` from a
// creature module; it satisfies the creature-lab contract (joint/bone/group tags, one root joint, no joint scale),
// carries the rig answer key in `userData.rig`, and has every painted part baked into the paint sheet.
import type { BufferGeometry, Texture } from "three";
import { cards } from "./cards";
import type { CardOptions } from "./cards";
import { Ctx } from "./context";
import type { Fill, JointRef } from "./context";
import { decal } from "./decal";
import type { DecalOptions } from "./decal";
import { along, ring } from "./distribute";
import type { RingItem, RingOptions } from "./distribute";
import { membrane, slab } from "./membrane";
import type { MembraneEdge, MembraneOptions, SlabOptions } from "./membrane";
import type { FrameInput, PointInput } from "./math";
import { extrude, lathe } from "./outline";
import type { ExtrudeOptions, LatheOptions, OutlineInput } from "./outline";
import { part } from "./parts";
import type { PartOptions } from "./parts";
import type { PathInput } from "./path";
import { Region } from "./region";
import type { RegionOptions } from "./region";
import { rigBlock } from "./rig";
import { createChain, createJoint, pose } from "./skeleton";
import type { Chain, ChainOptions, JointOptions, PoseRotation } from "./skeleton";
import { capsule, frustumBox, loft, rod, spike, sprout } from "./sugar";
import type { SproutOptions, Station } from "./sugar";
import { stick, Surface } from "./surface";
import type { StickOptions, SurfaceTarget } from "./surface";
import { sweep } from "./sweep";
import type { Radius, SweepOptions } from "./sweep";

export type { OutlinePoint } from "./outline";

export class Builder {
  /** The shared context, for layers built on the SDK (src/experimental/sculpt.ts); samples don't use it. */
  readonly ctx: Ctx;

  constructor(name = "creature", detail = 1, paintSize = 1024) {
    this.ctx = new Ctx(name, detail, paintSize);
  }

  /**
   * The Group to return from the creature module. Reading it (re)writes the rig answer key for the current pose and
   * bakes the paints of parts painted since the last read.
   */
  get root() {
    this.ctx.root.userData.rig = rigBlock(this.ctx.rig);
    this.ctx.bake();
    return this.ctx.root;
  }

  /** The tessellation multiplier given to `createBuilder`. */
  get detail() {
    return this.ctx.detail;
  }

  /**
   * `n` segments scaled by `detail` (at least 3), for your own geometry: `new SphereGeometry(r, b.segments(12),
   * b.segments(8))`. Pass a second `detail` to scale one part on its own: `b.segments(12, 0.5)`.
   */
  segments(n: number, detail?: number) {
    return this.ctx.segments(n, this.ctx.detailOf("segments()", detail));
  }

  /** The shared matte material for `color`. */
  material(color: string) {
    return this.ctx.material(color);
  }

  joint(name: string, options: JointOptions) {
    return createJoint(this.ctx, name, options);
  }

  chain(name: string, path: PathInput, options: ChainOptions = {}) {
    return createChain(this.ctx, name, path, options);
  }

  ring(line: FrameInput, options: RingOptions, fn?: (item: RingItem) => void) {
    return ring(this.ctx, line, options, fn);
  }

  /** Frames along a chain (`chain.at`), a sweep (`sweep.at`, dorsal) or any path input. */
  readonly along = along;

  pose(joint: JointRef, rotation: PoseRotation) {
    return pose(this.ctx, joint, rotation);
  }

  part(geometry: BufferGeometry, color: Fill, options?: PartOptions) {
    return part(this.ctx, geometry, color, options);
  }

  sweep(source: PathInput | Chain, radius: Radius, options?: SweepOptions) {
    return sweep(this.ctx, source, radius, options);
  }

  rod(a: PointInput, b: PointInput, r: number | readonly [number, number], options?: SweepOptions) {
    return rod(this.ctx, a, b, r, options);
  }

  capsule(a: PointInput, b: PointInput, r: number | readonly [number, number], options?: SweepOptions) {
    return capsule(this.ctx, a, b, r, options);
  }

  spike(base: PointInput, dirOrTip: PointInput, len: number | null, r: number, options?: SweepOptions) {
    return spike(this.ctx, base, dirOrTip, len, r, options);
  }

  frustumBox(
    a: PointInput,
    b: PointInput,
    start: readonly [number, number],
    end: readonly [number, number],
    options?: SweepOptions,
  ) {
    return frustumBox(this.ctx, a, b, start, end, options);
  }

  loft(stations: readonly Station[], options?: SweepOptions) {
    return loft(this.ctx, stations, options);
  }

  sprout(name: string, on: FrameInput, pathOrTip: PathInput | PointInput, radius: Radius, options?: SproutOptions) {
    return sprout(this.ctx, name, on, pathOrTip, radius, options);
  }

  surface(targets: SurfaceTarget) {
    return new Surface(this.ctx, targets);
  }

  stick(geometry: BufferGeometry, color: Fill, on: FrameInput, options?: StickOptions) {
    return stick(this.ctx, geometry, color, on, options);
  }

  decal(target: Surface | SurfaceTarget, texture: Texture, options: DecalOptions) {
    return decal(this.ctx, target, texture, options);
  }

  cards(on: readonly FrameInput[], texture: Texture | readonly Texture[], options: CardOptions) {
    return cards(this.ctx, on, texture, options);
  }

  membrane(edgeA: MembraneEdge, edgeB: MembraneEdge, options: MembraneOptions) {
    return membrane(this.ctx, edgeA, edgeB, options);
  }

  slab(points: readonly PointInput[], options: SlabOptions) {
    return slab(this.ctx, points, options);
  }

  extrude(points: OutlineInput, options: ExtrudeOptions) {
    return extrude(this.ctx, points, options);
  }

  lathe(points: OutlineInput, options: LatheOptions) {
    return lathe(this.ctx, points, options);
  }

  region(options: RegionOptions) {
    return new Region(this.ctx, options);
  }
}

/**
 * `detail` scales the SDK's default tessellation (sides, ring spacing, membrane cells): 0.5 halves it. `paintSize`
 * is the paint sheet's width in texels (512, 1024 or 2048; default 1024).
 */
export function createBuilder(options: { name?: string; detail?: number; paintSize?: number } = {}) {
  return new Builder(options.name, options.detail, options.paintSize);
}
```

## src/cards.ts

```ts
// `cards()`: textured quads rooted on frames, for fur, feathers, grass, leaves, scales, bristles and anything else
// that is many small flat cut-outs. Each card is double-sided, may curl and cross, and takes its frame's bones, so
// a coat of cards bends with the skin under it. All cards of one texture are one mesh.
import { Vector3 } from "three";
import type { Mesh, Texture } from "three";
import { meshFromWorld, weightsFor } from "./context";
import type { Ctx, JointRef, Tags, Weights } from "./context";
import type { Frame } from "./frame";
import { DEG, flatten, rng, toDirection, toFrame } from "./math";
import type { DirectionInput, FrameInput } from "./math";
import { Paint } from "./paint";

export type CardOptions = Tags & {
  /** Card width and length in meters (`[w, h]`), or one number for both. */
  size: number | readonly [number, number];
  /**
   * Degrees the card leans from the frame's facing axis (a hit's normal) toward `flow`: 0 stands straight out
   * (grass, bristles, a crest), 90 lies along the surface (scales, shingles). Default 0.
   */
  lean?: number;
  /**
   * The direction cards lean and curl toward, flattened onto the surface; default [0, -0.3, -1] (back and down). A
   * function gives each card its own: `(frame, i) => direction`.
   */
  flow?: DirectionInput | ((frame: Frame, i: number) => DirectionInput);
  /**
   * Extra degrees each card curls toward `flow` from root to tip, one segment per 20° / `detail` (2 at least, 8 at
   * most). Default 0 (flat, one segment).
   */
  bend?: number;
  /** These cards' own tessellation multiplier for their curl segments (default: the builder's `detail`). */
  detail?: number;
  /** Add a second card at right angles through each one: tufts, grass clumps, leaves seen from any side. */
  cross?: boolean;
  /** Random size change, ± this share (0.3 = 70% to 130%). Default 0. */
  vary?: number;
  /** Random turn about the facing axis, ± degrees. Default 0. */
  spin?: number;
  /** Random source for `vary`, `spin` and picking among several textures (e.g. `rng(7)`); default `rng(1)`. */
  rng?: () => number;
  /**
   * Tint multiplied into the texture: a colour string for all cards, or a Paint read at each card's root, so a coat
   * of cards carries the body's pattern. Default "#ffffff" (the texture as drawn).
   */
  color?: string | Paint;
  /** Rigid on this bone. Default: each frame's bones (cards on a bend bend with it), else the nearest joint. */
  bone?: JointRef;
  /** How far each card's root sinks back into the surface, as a share of its length. Default 0.1. */
  sink?: number;
  /** Flip every drawing left to right: the other side of a body, with the same texture. */
  mirror?: boolean;
};

/** Curl drawn per segment at detail 1. */
const SEGMENT_DEG = 20;

/**
 * One card per frame, built from `texture` (or one picked at random per card from a list; list a texture twice to
 * pick it twice as often); returns the meshes, one per distinct texture.
 */
export function cards(
  ctx: Ctx,
  on: readonly FrameInput[],
  texture: Texture | readonly Texture[],
  options: CardOptions,
): Mesh[] {
  const textures = Array.isArray(texture) ? (texture as readonly Texture[]) : [texture as Texture];
  if (!textures.length) throw new Error("cards(): no texture");
  const distinct = [...new Set(textures)];
  const [w0, h0] = typeof options.size === "number" ? [options.size, options.size] : options.size;
  const random = options.rng ?? rng(1);
  const lean = (options.lean ?? 0) * DEG;
  const bend = (options.bend ?? 0) * DEG;
  const detail = ctx.detailOf("cards()", options.detail);
  const segments = bend ? Math.min(8, Math.max(2, Math.ceil((Math.abs(options.bend!) * detail) / SEGMENT_DEG))) : 1;
  const flowFor = (frame: Frame, i: number) =>
    typeof options.flow === "function"
      ? toDirection(options.flow(frame, i), "cards()")
      : options.flow
        ? toDirection(options.flow, "cards()")
        : new Vector3(0, -0.3, -1);
  const [u0, u1] = options.mirror ? [1, 0] : [0, 1];
  const sink = options.sink ?? 0.1;
  const tint = options.color instanceof Paint ? null : (options.color ?? "#ffffff");
  const tags = { name: options.name, kind: "cards", group: options.group };

  type Batch = {
    positions: number[];
    normals: number[];
    uvs: number[];
    colors: number[];
    index: number[];
    weights: Weights[];
  };
  const batches = distinct.map(
    (): Batch => ({ positions: [], normals: [], uvs: [], colors: [], index: [], weights: [] }),
  );

  on.forEach((input, i) => {
    const f = toFrame(input);
    const root = f.at;
    const n = f.axis.normalize();
    const pickT = textures.length > 1 ? Math.min(Math.floor(random() * textures.length), textures.length - 1) : 0;
    const scale = 1 + (options.vary ?? 0) * (2 * random() - 1);
    const turn = (options.spin ?? 0) * (2 * random() - 1) * DEG;
    const w = w0 * scale;
    const h = h0 * scale;
    let t = flatten(flowFor(f, i), n);
    if (t.lengthSq() < 1e-10) t = flatten(new Vector3(0, 0, -1), n);
    if (t.lengthSq() < 1e-10) t = flatten(new Vector3(1, 0, 0), n);
    t.normalize();
    if (turn) t.applyAxisAngle(n, turn).normalize();
    const side = n.clone().cross(t).normalize();
    const weights = weightsFor(ctx, options.bone, [input], root);
    const color = options.color instanceof Paint ? options.color.at(root, n) : null;
    const batch = batches[distinct.indexOf(textures[pickT])];

    // The card's spine: from the sunk root out along the leaning, curling direction.
    const dirAt = (s: number) => {
      const a = lean + bend * s;
      return n.clone().multiplyScalar(Math.cos(a)).addScaledVector(t, Math.sin(a));
    };
    const spine = [
      root
        .clone()
        .addScaledVector(dirAt(0), -sink * h)
        .addScaledVector(n, 0.02 * h),
    ];
    const dirs = [dirAt(0)];
    for (let k = 0; k < segments; k++) {
      const d = dirAt((k + 0.5) / segments);
      spine.push(spine[k].clone().addScaledVector(d, h / segments));
      dirs.push(dirAt((k + 1) / segments));
    }
    const strip = (across: (k: number) => Vector3) => {
      const first = batch.positions.length / 3;
      spine.forEach((p, k) => {
        const half = across(k).multiplyScalar(w / 2);
        for (const [sign, u] of [
          [-1, u0],
          [1, u1],
        ] as const) {
          const q = p.clone().addScaledVector(half, sign);
          batch.positions.push(q.x, q.y, q.z);
          batch.normals.push(n.x, n.y, n.z);
          batch.uvs.push(u, k / segments);
          if (color) batch.colors.push(...linear(color));
          batch.weights.push(weights);
        }
      });
      for (let k = 0; k < segments; k++) {
        const [a, b, c, d] = [first + 2 * k, first + 2 * k + 1, first + 2 * k + 2, first + 2 * k + 3];
        batch.index.push(a, b, d, a, d, c); // front
        batch.index.push(a, d, b, a, c, d); // back
      }
    };
    strip(() => side.clone());
    if (options.cross) strip((k) => dirs[k].clone().cross(side).normalize());
  });

  const meshes: Mesh[] = [];
  batches.forEach((batch, k) => {
    if (!batch.index.length) return;
    meshes.push(
      meshFromWorld(ctx, batch.positions, batch.index, tint ?? "#ffffff", (v) => batch.weights[v], true, tags, {
        normals: batch.normals,
        uvs: batch.uvs,
        colors: tint ? undefined : batch.colors,
        texture: distinct[k],
      }),
    );
  });
  return meshes;
}

/** sRGB 0..1 to the linear values vertex colours hold. */
function linear(c: readonly [number, number, number]) {
  return c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
}
```

## src/context.ts

```ts
// State shared by every builder helper: the root group, the joint registry, mesh ownership, the material cache,
// the detail level, the pose counter, the rig records, the skins to refresh after a pose and the painted meshes to
// bake; bone weights and the inheritance rule (`weightsFor`); `Capture`, which keeps build-time data valid after
// poses; and the placement primitives every helper uses (`setWorld`, `meshFromWorld`, `makeMesh`, `skinMesh`).
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Matrix3,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import type { Object3D, Texture } from "three";
import { bakeSheet, chartify, SURFACE } from "./bake";
import type { Painted } from "./bake";
import type { Frame } from "./frame";
import { Paint } from "./paint";
import type { RigRecord } from "./rig";
import type { Joint } from "./skeleton";

/** What every `color` option takes: a colour string, or a Paint baked into a texture over the surface. */
export type Fill = string | Paint;

/** A joint handle or a joint name. */
export type JointRef = Joint | string;

/**
 * Bone influences, heaviest first, summing to 1: `[[joint, weight], ...]`. One entry = rigid on that bone. Empty =
 * not attached to anything (a point made from nothing).
 */
export type Weights = ReadonlyArray<readonly [Joint, number]>;

/** Rigid on one joint (or on nothing). */
export const rigid = (joint: Joint | null): Weights => (joint ? [[joint, 1]] : []);

/** A weighted sum of weight sets, merged per joint, keeping the `max` heaviest (renormalised). */
export function mix(parts: ReadonlyArray<readonly [Weights, number]>, max = 4): Weights {
  const sum = new Map<Joint, number>();
  for (const [weights, f] of parts) for (const [joint, w] of weights) sum.set(joint, (sum.get(joint) ?? 0) + w * f);
  const kept = [...sum]
    .filter(([, w]) => w > 1e-4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max);
  const total = kept.reduce((acc, [, w]) => acc + w, 0);
  return kept.map(([joint, w]) => [joint, w / total] as const);
}

/**
 * Weights along a run of bones: `joints[k]` owns arc length from `starts[k]` to the next start. Around each start
 * k ≥ 1 the two neighbours blend with a smoothstep over ±`half(k)`; everywhere else one joint has it all.
 */
export function spanWeights(
  joints: readonly Joint[],
  starts: readonly number[],
  s: number,
  half: (k: number) => number,
) {
  let k = 0;
  while (k < joints.length - 1 && starts[k + 1] <= s) k++;
  for (const b of [k, k + 1]) {
    if (b < 1 || b >= joints.length) continue;
    const h = half(b);
    if (!(h > 0) || Math.abs(s - starts[b]) >= h) continue;
    const x = (s - starts[b] + h) / (2 * h);
    const f = x * x * (3 - 2 * x);
    const pair: Weights = [
      [joints[b], f],
      [joints[b - 1], 1 - f],
    ];
    return f >= 0.5 ? pair : [pair[1], pair[0]];
  }
  return rigid(joints[k]);
}

/**
 * Model-space data captured at one moment (a chain's curve, a sweep's rings, a frame). Data owned by joints
 * follows them: `blend(weights)` maps from capture time to the current pose, rigidly for one joint and by linear
 * blend for several, so handles stay valid after `pose()` while the scene graph remains the one source of truth.
 */
export class Capture {
  private readonly inverse = new Map<Joint, Matrix4>();

  constructor(joints: Iterable<Joint>) {
    for (const joint of joints) this.inverse.set(joint, joint.object.matrixWorld.clone().invert());
  }

  /** Rigid transform from capture time to now for data owned by `joint`. */
  motion(joint: Joint) {
    const inverse = this.inverse.get(joint);
    if (!inverse) throw new Error(`Joint "${joint.name}" was not captured`);
    return joint.object.matrixWorld.clone().multiply(inverse);
  }

  /** Σ weight × motion: exact for one joint, linear-blend skinning for several, identity for none. */
  blend(weights: Weights) {
    if (weights.length === 1) return this.motion(weights[0][0]);
    const out = new Matrix4();
    if (!weights.length) return out;
    out.elements.fill(0);
    for (const [joint, w] of weights) {
      const e = this.motion(joint).elements;
      for (let i = 0; i < 16; i++) out.elements[i] += w * e[i];
    }
    return out;
  }

  /** The weighted rotation from capture time to now (normalised quaternion blend). */
  turn(weights: Weights) {
    const out = new Quaternion(0, 0, 0, 0);
    if (!weights.length) return new Quaternion();
    const q = new Quaternion();
    for (const [joint, w] of weights) {
      q.setFromRotationMatrix(this.motion(joint));
      const sign = out.dot(q) < 0 ? -w : w;
      out.set(out.x + q.x * sign, out.y + q.y * sign, out.z + q.z * sign, out.w + q.w * sign);
    }
    return out.normalize();
  }
}

/**
 * `name` and `group` tag a mesh for the report, the preview questions and the GLB. Without `name` it is called after
 * `kind` (what made it: "sweep", "extrude", the geometry for a part, e.g. "box") and its group, else its bone, with a
 * running number from the second on, joined by dots so a shell needs no quotes: "sweep.legL", "sweep.legL.2", "sphere.head".
 */
export type Tags = { name?: string; group?: string; kind?: string };

export class Ctx {
  readonly root = new Group();
  readonly joints = new Map<string, Joint>();
  rootJoint: Joint | null = null;
  readonly meshes = new Map<Joint, Mesh[]>();
  readonly owner = new Map<Mesh, Joint>();
  /** Rig answer-key records, evaluated against the current pose when `b.root` is read. */
  readonly rig: Array<() => RigRecord> = [];
  /** Blend-skinned meshes, re-deformed after every `pose()`. */
  readonly skins: Array<() => void> = [];
  /** Bumped by every `pose()`, so cached world-space data (surfaces) knows to refresh. */
  poses = 0;
  private readonly materials = new Map<string, MeshStandardMaterial>();
  /** Painted meshes, packed into one paint sheet when the root is read. */
  readonly paints: Painted[] = [];
  private baked = 0;
  /** Meshes named so far per default name, for the running number. */
  readonly names = new Map<string, number>();
  private sheet: MeshStandardMaterial | null = null;

  constructor(
    name: string,
    /** Tessellation multiplier: default sides, ring density and membrane cells scale with it. */
    readonly detail: number,
    /** Paint sheet width in texels. */
    readonly paintSize: number,
  ) {
    if (!(detail > 0)) throw new Error(`detail must be positive, got ${detail}`);
    if (![512, 1024, 2048].includes(paintSize)) throw new Error(`paintSize is 512, 1024 or 2048, got ${paintSize}`);
    this.root.name = name;
  }

  /** `n` segments scaled by `detail` (at least 3): for the SDK's defaults and for your own geometry. */
  segments(n: number, detail = this.detail) {
    return Math.max(3, Math.round(n * detail));
  }

  /** A shape's own `detail` option, else the builder's. */
  detailOf(call: string, detail: number | undefined) {
    if (detail === undefined) return this.detail;
    if (!(detail > 0)) throw new Error(`${call}: detail must be positive, got ${detail}`);
    return detail;
  }

  /** One shared matte material per colour, like the creature-lab kit. */
  material(color: string) {
    const key = color.toLowerCase();
    let cached = this.materials.get(key);
    if (!cached) {
      cached = new MeshStandardMaterial({ color: key, roughness: 0.72, metalness: 0.04 });
      this.materials.set(key, cached);
    }
    return cached;
  }

  /** The one material every painted mesh shares; its map is the paint sheet. */
  paintMaterial() {
    this.sheet ??= new MeshStandardMaterial({ color: "#ffffff", roughness: 0.72, metalness: 0.04, name: "paint" });
    return this.sheet;
  }

  /** `texture` tinted by `tint` (and by vertex colours when the mesh has them), cut away where it is transparent. */
  textured(texture: Texture, tint: string, vertexColors: boolean) {
    const key = `${texture.uuid}|${tint.toLowerCase()}|${vertexColors}`;
    let cached = this.materials.get(key);
    if (!cached) {
      cached = new MeshStandardMaterial({
        color: tint.toLowerCase(),
        map: texture,
        alphaTest: 0.5,
        vertexColors,
        roughness: 0.72,
        metalness: 0.04,
      });
      this.materials.set(key, cached);
    }
    return cached;
  }

  /** Paint every painted mesh into the sheet; again only when meshes were painted since the last bake. */
  bake() {
    if (this.paints.length === this.baked) return;
    bakeSheet(this.paints, this.paintMaterial(), this.paintSize);
    this.baked = this.paints.length;
  }
}

/**
 * The joint whose bone passes closest to `p`. A bone runs from a joint to each of its child joints and belongs to
 * the parent (it moves when the parent rotates); a joint without children counts as its point.
 */
export function nearestJoint(ctx: Ctx, p: Vector3) {
  let best: Joint | null = null;
  let bestD = Infinity;
  const consider = (joint: Joint, a: Vector3, b: Vector3) => {
    const seg = b.clone().sub(a);
    const f = Math.min(Math.max(p.clone().sub(a).dot(seg) / Math.max(seg.lengthSq(), 1e-12), 0), 1);
    const d = a.clone().addScaledVector(seg, f).distanceToSquared(p);
    if (d < bestD - 1e-12) [best, bestD] = [joint, d];
  };
  for (const joint of ctx.joints.values()) {
    const at = joint.at;
    consider(joint, at, at);
    if (joint.parent) consider(joint.parent, joint.parent.at, at);
  }
  if (!best) throw new Error("No joints yet: create the root joint with b.joint(name, { at }) first");
  return best as Joint;
}

/** The weights of an input that came from something built (a frame, a sweep, a path made from frames), else null. */
export function weightsOf(x: unknown): Weights | null {
  if (!x || typeof x !== "object") return null;
  if ("weights" in x) {
    const weights = (x as { weights: Weights | null }).weights;
    return weights?.length ? weights : null;
  }
  if ("frame" in x) return weightsOf((x as { frame: Frame }).frame);
  return null;
}

/**
 * The weights for new geometry: explicit `bone` (rigid), else the weights of the first input that came from
 * something built (a joint, part, hit, sweep, tube or chain point, or a path made from them), else rigid on the
 * joint nearest to `at`.
 */
export function weightsFor(ctx: Ctx, explicit: JointRef | undefined, inputs: readonly unknown[], at: Vector3) {
  if (explicit !== undefined) return rigid(resolveJoint(ctx, explicit));
  for (const input of inputs) {
    const mesh = input && typeof input === "object" && "isMesh" in input ? ctx.owner.get(input as Mesh) : undefined;
    const weights = weightsOf(input) ?? (mesh ? rigid(mesh) : null);
    if (weights) return weights;
  }
  return rigid(nearestJoint(ctx, at));
}

/** The bone for new joints: the heaviest bone of `weightsFor`. */
export function boneFor(ctx: Ctx, explicit: JointRef | undefined, inputs: readonly unknown[], at: Vector3) {
  return weightsFor(ctx, explicit, inputs, at)[0][0];
}

/** The joint for `ref`; omitted = the root joint. */
export function resolveJoint(ctx: Ctx, ref?: JointRef) {
  if (ref === undefined) {
    if (!ctx.rootJoint) throw new Error("No root joint yet: create one with b.joint(name, { at }) first");
    return ctx.rootJoint;
  }
  if (typeof ref !== "string") return ref;
  const joint = ctx.joints.get(ref);
  if (!joint) throw new Error(`Unknown joint "${ref}"`);
  return joint;
}

/** Parent `object` under `parent` so its WORLD transform is (position, quat, scale); matrices are left current. */
export function setWorld(
  object: Object3D,
  parent: Object3D,
  position: Vector3,
  quat: Quaternion,
  scale = new Vector3(1, 1, 1),
) {
  const local = parent.matrixWorld
    .clone()
    .invert()
    .multiply(new Matrix4().compose(position, quat, scale));
  local.decompose(object.position, object.quaternion, object.scale);
  parent.add(object);
  object.updateMatrixWorld(true);
}

export function addMesh(ctx: Ctx, mesh: Mesh, joint: Joint, tags: Tags) {
  if (tags.name) mesh.name = tags.name;
  else {
    const kind =
      tags.kind ??
      mesh.geometry.type
        .replace(/Geometry$/, "")
        .replace(/^Buffer$/, "part")
        .toLowerCase();
    const base = `${kind}.${tags.group ?? joint.name}`;
    const count = (ctx.names.get(base) ?? 0) + 1;
    ctx.names.set(base, count);
    mesh.name = count === 1 ? base : `${base}.${count}`;
  }
  if (tags.group) mesh.userData.group = tags.group;
  ctx.owner.set(mesh, joint);
  const list = ctx.meshes.get(joint);
  if (list) list.push(mesh);
  else ctx.meshes.set(joint, [mesh]);
}

/**
 * Per-vertex extras for `meshFromWorld`: model-space normals (else computed), uvs, linear vertex colours, a texture,
 * and the shape's own surface coordinates for paints (2 per vertex; `wrap` when the second is degrees round a loop).
 */
export type MeshExtras = {
  normals?: number[];
  uvs?: number[];
  colors?: number[];
  texture?: Texture;
  surface?: number[];
  wrap?: boolean;
};

/**
 * A mesh from WORLD-space triangles with weights per vertex. It hangs under its heaviest bone with an identity
 * local transform; vertices on other bones are blend-skinned (`skinMesh`). `smooth` shares vertices (smooth
 * normals); otherwise every face is flat shaded.
 */
export function meshFromWorld(
  ctx: Ctx,
  positions: number[],
  index: number[],
  fill: Fill,
  weightAt: (vertex: number) => Weights,
  smooth: boolean,
  tags: Tags,
  extras: MeshExtras = {},
) {
  const count = positions.length / 3;
  const totals = new Map<Joint, number>();
  for (let i = 0; i < count; i++) for (const [j, w] of weightAt(i)) totals.set(j, (totals.get(j) ?? 0) + w);
  const joint = [...totals].sort((a, b) => b[1] - a[1])[0][0];
  const inverse = joint.object.matrixWorld.clone().invert();
  const local = new Float32Array(positions.length);
  const v = new Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    v.fromArray(positions, i).applyMatrix4(inverse).toArray(local, i);
  }
  let geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(local, 3));
  if (extras.normals) {
    const turn = new Matrix3().getNormalMatrix(inverse);
    const normals = new Float32Array(extras.normals.length);
    for (let i = 0; i < normals.length; i += 3)
      v.fromArray(extras.normals, i).applyMatrix3(turn).normalize().toArray(normals, i);
    geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  }
  if (extras.uvs) geometry.setAttribute("uv", new Float32BufferAttribute(extras.uvs, 2));
  if (extras.colors) geometry.setAttribute("color", new Float32BufferAttribute(extras.colors, 3));
  if (extras.surface && fill instanceof Paint)
    geometry.setAttribute(SURFACE, new Float32BufferAttribute(extras.surface, 2));
  geometry.setIndex(index);
  const bones = totals.size > 1 ? writeWeights(geometry, count, weightAt) : null;
  if (!smooth) geometry = geometry.toNonIndexed();
  if (!extras.normals) geometry.computeVertexNormals();
  const mesh = makeMesh(ctx, geometry, fill, joint.object.matrixWorld, extras.texture, extras.wrap);
  joint.object.add(mesh);
  mesh.updateMatrixWorld(true);
  addMesh(ctx, mesh, joint, tags);
  if (bones) skinMesh(ctx, mesh, bones);
  return mesh;
}

/**
 * A mesh with the material its fill asks for. A colour string shares the matte material for that colour (with a
 * `texture`, the textured material tinted by it). A Paint cuts the geometry into charts and registers it for the
 * paint sheet, with the surface coordinates in its `_surface` attribute (else its uv; `wrap` for an angle).
 * `toWorld` is where the mesh will sit in model space.
 */
export function makeMesh(
  ctx: Ctx,
  geometry: BufferGeometry,
  fill: Fill,
  toWorld: Matrix4,
  texture?: Texture,
  wrap = false,
) {
  if (fill instanceof Paint) {
    if (texture) throw new Error("A textured part takes a colour string as its tint, not a paint");
    const { geometry: cut, ...charts } = chartify(geometry, toWorld);
    const mesh = new Mesh(cut, ctx.paintMaterial());
    ctx.paints.push({ mesh, paint: fill, wrap, ...charts });
    return mesh;
  }
  if (!texture) return new Mesh(geometry, ctx.material(fill));
  if (!geometry.getAttribute("uv"))
    throw new Error(
      "`texture` needs geometry with UVs: a three.js geometry, or cards; SDK shapes take a paint instead",
    );
  return new Mesh(geometry, ctx.textured(texture, fill, Boolean(geometry.getAttribute("color"))));
}

/** `skinIndex` / `skinWeight` attributes (indices into the returned bone list), up to 4 influences per vertex. */
export function writeWeights(geometry: BufferGeometry, count: number, weightAt: (vertex: number) => Weights) {
  const bones: Joint[] = [];
  const indices = new Uint16Array(count * 4);
  const weights = new Float32Array(count * 4);
  for (let i = 0; i < count; i++)
    weightAt(i)
      .slice(0, 4)
      .forEach(([joint, w], k) => {
        let b = bones.indexOf(joint);
        if (b < 0) b = bones.push(joint) - 1;
        indices[i * 4 + k] = b;
        weights[i * 4 + k] = w;
      });
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(indices, 4));
  geometry.setAttribute("skinWeight", new Float32BufferAttribute(weights, 4));
  return bones;
}

const skinners = new WeakMap<Mesh, () => void>();

/**
 * Make a mesh with `skinIndex` / `skinWeight` over `bones` follow them: `userData.skinBones` names them for the
 * exporter, and every later `pose()` re-deforms the vertices from their current (bind) positions by linear blend.
 * Skinning a mesh again (after its geometry was replaced) replaces its earlier skin.
 */
export function skinMesh(ctx: Ctx, mesh: Mesh, bones: readonly Joint[]) {
  mesh.userData.skinBones = bones.map((joint) => joint.name);
  const geometry = mesh.geometry;
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const indices = geometry.getAttribute("skinIndex");
  const weights = geometry.getAttribute("skinWeight");
  mesh.updateWorldMatrix(true, false);
  const toWorld = mesh.matrixWorld.clone();
  const normalToWorld = new Matrix3().getNormalMatrix(toWorld);
  const bindPositions = Array.from({ length: position.count }, (_, i) =>
    new Vector3().fromBufferAttribute(position, i).applyMatrix4(toWorld),
  );
  const bindNormals = Array.from({ length: position.count }, (_, i) =>
    new Vector3().fromBufferAttribute(normal, i).applyMatrix3(normalToWorld),
  );
  const capture = new Capture(bones);
  const skin = () => {
    const motions = bones.map((joint) => capture.motion(joint));
    const turns = motions.map((m) => new Matrix3().setFromMatrix4(m));
    const toLocal = mesh.matrixWorld.clone().invert();
    const normalToLocal = new Matrix3().getNormalMatrix(toLocal);
    const p = new Vector3();
    const n = new Vector3();
    const v = new Vector3();
    for (let i = 0; i < position.count; i++) {
      p.set(0, 0, 0);
      n.set(0, 0, 0);
      for (let k = 0; k < 4; k++) {
        const w = weights.getComponent(i, k);
        if (!w) continue;
        const b = indices.getComponent(i, k);
        p.addScaledVector(v.copy(bindPositions[i]).applyMatrix4(motions[b]), w);
        n.addScaledVector(v.copy(bindNormals[i]).applyMatrix3(turns[b]), w);
      }
      position.setXYZ(i, ...p.applyMatrix4(toLocal).toArray());
      normal.setXYZ(i, ...n.applyMatrix3(normalToLocal).normalize().toArray());
    }
    position.needsUpdate = true;
    normal.needsUpdate = true;
    geometry.boundingBox = null;
    geometry.boundingSphere = null;
  };
  const earlier = skinners.get(mesh);
  if (earlier) ctx.skins.splice(ctx.skins.indexOf(earlier), 1);
  skinners.set(mesh, skin);
  ctx.skins.push(skin);
}

/** The weights of one vertex of a built mesh (its skin attributes, else rigid on its bone). */
export function vertexWeights(ctx: Ctx, mesh: Mesh, vertex: number): Weights {
  const names = mesh.userData.skinBones as string[] | undefined;
  const indices = mesh.geometry.getAttribute("skinIndex");
  const weights = mesh.geometry.getAttribute("skinWeight");
  if (!names || !indices || !weights) return rigid(ctx.owner.get(mesh) ?? null);
  const out: Array<readonly [Joint, number]> = [];
  for (let k = 0; k < 4; k++) {
    const w = weights.getComponent(vertex, k);
    if (w > 0) out.push([ctx.joints.get(names[indices.getComponent(vertex, k)])!, w]);
  }
  return out.sort((a, b) => b[1] - a[1]);
}
```

## src/decal.ts

```ts
// `decal()`: a texture conformed onto a curved built surface. A grid of rays shot against the facing direction lands a
// sheet of quads on the surface's real triangles, lifted slightly off it; every vertex takes the skin weights of the
// point it landed on, so the decal bends with the bones under it.
import { Box3, Vector3 } from "three";
import type { Texture } from "three";
import { meshFromWorld, resolveJoint, rigid } from "./context";
import type { Ctx, JointRef, Tags, Weights } from "./context";
import { Frame } from "./frame";
import { aim, DEG, toDirection, toFrame, toPoint } from "./math";
import type { DirectionInput, PointInput } from "./math";
import { Part } from "./parts";
import { Surface } from "./surface";
import type { Hit, SurfaceTarget } from "./surface";

export type DecalOptions = Tags & {
  /** A point on or near the surface where the decal's centre lands (a surface hit works). */
  at: PointInput;
  /**
   * The way the drawing faces, out of the surface toward its viewer (a decal on a face looking forward: `[0, 0, 1]`).
   * Rays travel the opposite way, onto the surface. Default: `at`'s facing axis when `at` is a frame (a hit's normal).
   */
  dir?: DirectionInput;
  /** Which way is up in the drawing, seen from the front (default world +Y, else world +Z when `dir` is vertical). */
  up?: DirectionInput;
  /** Width and height of the drawing in meters, measured on the plane facing `dir`. */
  size: readonly [number, number];
  /** Grid quads across and up (default 10 along the longer side, in proportion along the shorter). */
  segments?: number | readonly [number, number];
  /** Distance the sheet floats off the surface (default 0.0015 m); cells spanning a fold float higher to clear it. */
  lift?: number;
  /** Degrees the drawing turns counter-clockwise, seen from the front. */
  roll?: number;
  /** Flip the drawing left-right (the other eye of a pair). */
  mirror?: boolean;
  /** Tint multiplied into the texture (default "#ffffff": as drawn). */
  color?: string;
  /** Rigid on this bone. Default: every vertex rides the skin weights of the surface point under it. */
  bone?: JointRef;
};

export function decal(ctx: Ctx, target: Surface | SurfaceTarget, texture: Texture, options: DecalOptions) {
  const skin = target instanceof Surface ? target : new Surface(ctx, target);
  const center = toPoint(options.at, "decal()");
  const { at } = options;
  const facing = options.dir
    ? toDirection(options.dir, "decal()")
    : at instanceof Frame || (typeof at === "object" && "frame" in at)
      ? toFrame(at).axis
      : null;
  if (!facing || facing.lengthSq() < 1e-12)
    throw new Error("decal(): give `dir`, the way the drawing faces (out of the surface)");
  // The rays travel against the facing direction, onto the surface; `dir` below is their direction.
  const dir = facing.negate().normalize();

  let up = options.up ? toDirection(options.up, "decal()") : new Vector3(0, 1, 0);
  let right = dir.clone().cross(up);
  if (right.lengthSq() < 1e-10) {
    up = new Vector3(0, 0, 1);
    right = dir.clone().cross(up);
  }
  right.normalize();
  up = right.clone().cross(dir).normalize();
  if (options.roll) {
    right.applyAxisAngle(dir, -options.roll * DEG);
    up.applyAxisAngle(dir, -options.roll * DEG);
  }

  const [w, h] = options.size;
  const [cols, rows] =
    options.segments === undefined
      ? w >= h
        ? [10, Math.max(1, Math.round((10 * h) / w))]
        : [Math.max(1, Math.round((10 * w) / h)), 10]
      : typeof options.segments === "number"
        ? [options.segments, options.segments]
        : options.segments;
  const lift = options.lift ?? 0.0015;

  // Rays start outside everything in the surface, so the first hit is the outermost face along `dir`.
  const box = new Box3();
  for (const mesh of skin.meshes) box.expandByObject(mesh);
  const back = box.distanceToPoint(center) + box.getSize(new Vector3()).length() + Math.max(w, h);

  const uvs: number[] = [];
  const hits: Hit[] = [];
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const v = j / rows;
      const flat = center
        .clone()
        .addScaledVector(right, (u - 0.5) * w)
        .addScaledVector(up, (v - 0.5) * h);
      const hit = skin.ray(flat.clone().addScaledVector(dir, -back), dir) ?? skin.nearest(flat);
      hits.push(hit);
      uvs.push(options.mirror ? 1 - u : u, v);
    }
  const index: number[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      index.push(a, a + 1, a + cols + 2, a, a + cols + 2, a + cols + 1);
    }
  // A sheet edge spanning a convex fold of the surface dips below it by at most (L/2)·tan(φ/2), L the edge length
  // and φ the turn between the end normals: both ends float that much higher so ridges never poke through. Sharp
  // turns (past 60°: a sheet wrapping a silhouette, or a missed ray) keep the plain lift.
  const rise = hits.map(() => lift);
  for (let t = 0; t < index.length; t += 3)
    for (let k = 0; k < 3; k++) {
      const a = index[t + k];
      const b = index[t + ((k + 1) % 3)];
      const turn = hits[a].n.angleTo(hits[b].n);
      if (turn > Math.PI / 3) continue;
      const sag = lift + (hits[a].at.distanceTo(hits[b].at) / 2) * Math.tan(turn / 2);
      rise[a] = Math.max(rise[a], sag);
      rise[b] = Math.max(rise[b], sag);
    }
  const positions: number[] = [];
  hits.forEach((hit, i) => hit.at.addScaledVector(hit.n, rise[i]).toArray(positions, i * 3));

  const fixed = options.bone === undefined ? null : rigid(resolveJoint(ctx, options.bone));
  const weightAt = (vertex: number): Weights => fixed ?? hits[vertex].weights;
  const mesh = meshFromWorld(
    ctx,
    positions,
    index,
    options.color ?? "#ffffff",
    weightAt,
    true,
    { ...options, kind: "decal" },
    {
      uvs,
      texture,
    },
  );
  const middle = hits[Math.floor(rows / 2) * (cols + 1) + Math.floor(cols / 2)];
  return new Part(mesh, middle.at.clone(), aim(dir.clone().negate(), up), fixed ?? middle.weights, [0, 1, 0]);
}
```

## src/distribute.ts

```ts
// Placement helpers: `ring()` around any Line (a bone, an eye's gaze, a horn, a hit normal, a made-up line), with
// optional group joints so many items cost a few bones; `along()` any chain, sweep or path. Callbacks get a Frame
// per item that carries the bone its geometry should default to.
import { Quaternion, Vector3 } from "three";
import { boneFor, rigid } from "./context";
import type { Ctx, JointRef, Weights } from "./context";
import { Spot } from "./frame";
import { aim, DEG, flatten, toFrame } from "./math";
import type { FrameInput } from "./math";
import { toPath } from "./path";
import type { PathInput } from "./path";
import { sideOf, tuple } from "./rig";
import type { Role } from "./rig";
import { Chain, createJoint } from "./skeleton";
import type { ChainPoint, Joint } from "./skeleton";
import { Sweep } from "./sweep";
import type { SweepPoint } from "./sweep";

export type RingOptions = {
  count: number;
  /** Distance of each item from the line (default 0: every item starts on the line). */
  radius?: number;
  /**
   * Angles about the line (right-hand rule). 0 = the direction closest to world up (world +Z when the line is
   * vertical). A full turn (the default, 0..360) spaces items evenly; a partial range puts items on both ends.
   */
  fromDeg?: number;
  toDeg?: number;
  /** Lean every item this many degrees toward the line's direction: a cone (quill rings, a swept-back frill). */
  tilt?: number;
  /**
   * Group joints: create this many joints, each owning a contiguous run of items (so 24 feathers cost 6 bones).
   * They sit `radius` out along their run's centre direction, +Y along it, +Z toward the line's direction, so
   * posing one by +deg about its local X lifts its run toward the line's direction. Needs `name`.
   */
  joints?: number;
  /** Group joint names: `${name}1..K`, or `names`. */
  name?: string;
  names?: readonly string[] | ((i: number) => string);
  /** Parent of the group joints. Default: the line's bone, else the joint nearest the line's point. */
  parent?: JointRef;
  group?: string;
  /** Rig answer key role for the group (default "fan"). */
  role?: Role;
};

/** A ring item: +Y = `outward`, +Z leaning toward the line's direction; on its group joint, else the line's weights. */
export class RingItem extends Spot {
  constructor(
    readonly i: number,
    /** 0..1 across the ring. */
    readonly t: number,
    at: Vector3,
    quat: Quaternion,
    weights: Weights,
  ) {
    super(at, quat, weights);
  }

  get outward() {
    return this.axis;
  }
}

/**
 * `count` frames on a circle around `line` (any Line: a joint's bone, a part's facing axis, a hit normal, a tube
 * point, `line(a, b)`, `frame(at, dir)`). With `joints`, rotating a few joints moves every item (the rigid-skinning
 * tradeoff: items on neighbouring joints separate in steps when they rotate apart; 3-5 items per joint read as
 * one fan for moderate poses, `joints: count` articulates every item).
 */
export function ring(ctx: Ctx, on: FrameInput, options: RingOptions, fn?: (item: RingItem) => void) {
  const line = toFrame(on);
  const center = line.at;
  const axis = line.axis;
  const { count } = options;
  const radius = options.radius ?? 0;
  const from = options.fromDeg ?? 0;
  const to = options.toDeg ?? from + 360;
  const full = Math.abs(to - from) >= 360 - 1e-9;
  const tilt = (options.tilt ?? 0) * DEG;
  let u = flatten(new Vector3(0, 1, 0), axis);
  if (u.lengthSq() < 1e-8) u = flatten(new Vector3(0, 0, 1), axis);
  u.normalize();
  const v = axis.clone().cross(u);
  const angleOf = (i: number) => (from + (to - from) * (full ? i / count : count === 1 ? 0.5 : i / (count - 1))) * DEG;
  const outwardAt = (angle: number) =>
    u
      .clone()
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(v, Math.sin(angle))
      .multiplyScalar(Math.cos(tilt))
      .addScaledVector(axis, Math.sin(tilt));

  const groups = options.joints ?? 0;
  if (groups && !(groups <= count && options.name))
    throw new Error("ring(): `joints` needs a `name` and at most `count` joints");
  const groupOf = (i: number) => Math.floor((i * groups) / count);
  const joints: Joint[] = [];
  if (groups) {
    const parent = boneFor(ctx, options.parent, [line], center);
    const { names } = options;
    for (let k = 0; k < groups; k++) {
      const run = Array.from({ length: count }, (_, i) => i).filter((i) => groupOf(i) === k);
      const dir = outwardAt(run.reduce((sum, i) => sum + angleOf(i), 0) / run.length);
      const name = names === undefined ? `${options.name}${k + 1}` : typeof names === "function" ? names(k) : names[k];
      joints.push(
        createJoint(ctx, name, {
          parent,
          at: center.clone().addScaledVector(dir, radius),
          dir,
          up: axis,
          group: options.group,
        }),
      );
    }
    const pivot = new Spot(center, aim(axis), rigid(parent));
    ctx.rig.push(() => ({
      ring: {
        name: options.name!,
        role: options.role ?? "fan",
        side: sideOf(joints),
        pivot: tuple(pivot.at),
        axis: tuple(pivot.axis),
        joints: joints.map((joint, k) => ({
          joint: joint.name,
          items: Array.from({ length: count }, (_, i) => i).filter((i) => groupOf(i) === k).length,
        })),
      },
    }));
  }

  const items = Array.from({ length: count }, (_, i) => {
    const outward = outwardAt(angleOf(i));
    const t = full ? i / count : count === 1 ? 0.5 : i / (count - 1);
    const weights = groups ? rigid(joints[groupOf(i)]) : line.weights;
    return new RingItem(i, t, center.clone().addScaledVector(outward, radius), aim(outward, axis), weights);
  });
  if (fn) items.forEach(fn);
  return { joints, items };
}

/** A frame on a plain path: +Y = tangent, +Z = the transported normal; takes the path's weights (if any). */
export class PathPoint extends Spot {
  constructor(
    readonly t: number,
    at: Vector3,
    quat: Quaternion,
    weights: Weights,
  ) {
    super(at, quat, weights);
  }

  get tangent() {
    return this.axis;
  }
}

type AlongOptions = { from?: number; to?: number };

/**
 * `count` evenly spaced frames at the centres of equal parts of [from, to] (default 0..1, a Sweep's own swept range):
 * a Chain gives `chain.at(t)`, a Sweep `sweep.at(t)` (on the dorsal surface), any other path input a PathPoint.
 */
export function along(source: Chain, count: number, fn: (at: ChainPoint) => void, options?: AlongOptions): ChainPoint[];
export function along(source: Sweep, count: number, fn: (at: SweepPoint) => void, options?: AlongOptions): SweepPoint[];
export function along(
  source: PathInput,
  count: number,
  fn: (at: PathPoint) => void,
  options?: AlongOptions,
): PathPoint[];
export function along(
  source: Chain | Sweep | PathInput,
  count: number,
  fn: (at: never) => void,
  options: AlongOptions = {},
) {
  const from = options.from ?? (source instanceof Sweep ? source.from : 0);
  const to = options.to ?? (source instanceof Sweep ? source.to : 1);
  const path = source instanceof Chain || source instanceof Sweep ? null : toPath(source);
  const frames = path?.frames();
  const items = Array.from({ length: count }, (_, i) => {
    const t = from + ((to - from) * (i + 0.5)) / count;
    if (!path) return (source as Chain | Sweep).at(t);
    const tangent = path.tangentAt(t);
    return new PathPoint(t, path.at(t), aim(tangent, frames!.normalAt(t)), path.weights ?? []);
  });
  items.forEach(fn as (at: unknown) => void);
  return items;
}
```

## src/frame.ts

```ts
// Frames: a point with a full orientation, a facing axis and the bone weights it moves with. Joints, parts, sweeps
// (at their start), regions, surface hits, chain and tube points, ring and along items are all frames, and so is
// anything made with `frame()` or `line()`. A Line is a frame read as "point + facing axis".
import { Quaternion, Vector3 } from "three";
import { Capture, weightsOf } from "./context";
import type { Weights } from "./context";
import { aim, toDirection, toPoint, vec } from "./math";
import type { DirectionInput, PointInput, V3 } from "./math";

const Y = new Vector3(0, 1, 0);

export abstract class Frame {
  /** Model-space position. */
  abstract get at(): Vector3;
  /** Model-space orientation. */
  abstract get quat(): Quaternion;
  /** The bones this frame moves with, heaviest first: one for a rigid point, two on a smooth bend, none for frames made from nothing. */
  abstract get weights(): Weights;

  /** The heaviest bone; null for frames made from nothing. */
  get bone() {
    return this.weights[0]?.[0] ?? null;
  }

  /** The facing direction (unit): local +Y, unless the frame was aimed along another axis. */
  get axis() {
    return this.dir(Y);
  }

  /**
   * A point near this frame → model space. Numbers `[x, y, z]` are in the frame's own axes (meters). Words are model
   * directions from the frame's point, whichever way the frame is aimed: `head.local({ forward: 0.3, up: 0.05 })` is
   * 0.3 m toward the model's front and 0.05 m up from the head joint. `right` is the model's right (world −X).
   */
  local(p: V3 | Toward) {
    if (!isToward(p)) return vec(p, "local()").applyQuaternion(this.quat).add(this.at);
    const { right = 0, left = 0, up = 0, down = 0, forward = 0, back = 0 } = p;
    return this.at.clone().add(new Vector3(left - right, up - down, forward - back));
  }

  /** A vector given in this frame → model space (length kept). */
  dir(v: V3) {
    return vec(v, "dir()").applyQuaternion(this.quat);
  }

  /**
   * This frame moved to a point given as in `local()` (numbers in its own axes or model-direction words), keeping
   * orientation, facing and weights: a point derived from a frame that still carries the frame's bones
   * (`item.moved([0, 0.12, 0])` = 12 cm out along +Y, `head.moved({ forward: 0.2 })` = 20 cm ahead of the head).
   */
  moved(p: V3 | Toward) {
    const quat = this.quat;
    return new Spot(this.local(p), quat, this.weights, this.axis.applyQuaternion(quat.clone().invert()));
  }
}

/** Model directions in meters, for `local()` and `moved()`: right is the model's right (world −X), forward is +Z. */
export type Toward = {
  right?: number;
  left?: number;
  up?: number;
  down?: number;
  forward?: number;
  back?: number;
};

function isToward(p: V3 | Toward): p is Toward {
  return !Array.isArray(p) && !(p instanceof Vector3);
}

/**
 * A frame stored as a bind transform plus weights, so it follows every later `pose()` of its bones (blended when it
 * has several). Without weights it is fixed in model space. `facing` is the local axis reported as `axis`.
 * `at`/`quat` are given in `capture`'s pose (default: now).
 */
export class Spot extends Frame {
  private readonly bindAt: Vector3;
  private readonly bindQuat: Quaternion;
  private readonly capture: Capture;

  constructor(
    at: Vector3,
    quat: Quaternion,
    readonly weights: Weights = [],
    private readonly facing: V3 = Y,
    capture?: Capture,
  ) {
    super();
    this.bindAt = at.clone();
    this.bindQuat = quat.clone();
    this.capture = capture ?? new Capture(weights.map(([joint]) => joint));
  }

  get at() {
    return this.bindAt.clone().applyMatrix4(this.capture.blend(this.weights));
  }

  get quat() {
    return this.capture.turn(this.weights).multiply(this.bindQuat);
  }

  get axis() {
    return this.dir(this.facing).normalize();
  }
}

/**
 * A frame from nothing: at `at`, facing `dir`, roll from `up` (see `aim`). It takes `at`'s weights when `at` came
 * from something built.
 */
export function frame(at: PointInput, dir: DirectionInput, up?: DirectionInput) {
  const quat = aim(toDirection(dir, "frame()"), up && toDirection(up, "frame()"));
  return new Spot(toPoint(at, "frame()"), quat, weightsOf(at) ?? []);
}

/** A line from `a` to `b`: a frame at `a` facing `b`, with `length` and `end`. Takes `a`'s weights, else `b`'s. */
export class Segment extends Spot {
  constructor(
    a: Vector3,
    b: Vector3,
    weights: Weights,
    readonly length = a.distanceTo(b),
  ) {
    super(a, aim(b.clone().sub(a)), weights);
  }

  /** The far point, in the current pose. */
  get end() {
    return this.at.addScaledVector(this.axis, this.length);
  }
}

export function line(a: PointInput, b: PointInput) {
  return new Segment(toPoint(a, "line()"), toPoint(b, "line()"), weightsOf(a) ?? weightsOf(b) ?? []);
}
```

## src/ik.ts

```ts
// Limb IK: joint positions for a chain of fixed segment lengths that ends exactly on a target (feet planted on
// the floor). One solver for 2-bone arms, digitigrade 3-segment hind legs, 4-segment insect legs and curls.
import { Vector3 } from "three";
import { flatten, toDirection, toPoint } from "./math";
import type { DirectionInput, PointInput } from "./math";

/** In-plane segment angles for equal turns of `k` radians, each joint turning away from its side. */
function turned(sides: readonly number[], k: number) {
  const angles = [0];
  for (const side of sides) angles.push(angles[angles.length - 1] - side * k);
  return angles;
}

/** End of a planar chain with these segment angles, as [along, across]. */
function end(lengths: readonly number[], angles: readonly number[]) {
  let x = 0;
  let y = 0;
  lengths.forEach((l, i) => {
    x += l * Math.cos(angles[i]);
    y += l * Math.sin(angles[i]);
  });
  return [x, y] as const;
}

/**
 * Equal-turn fold: every joint turns by the same angle toward its side, and the whole chain rotates so it ends on
 * the line at `dist`. Too far: straight. Too close: folded as far as equal turns go. Angles are from the line.
 */
function fold(lengths: readonly number[], sides: readonly number[], dist: number) {
  const reach = (k: number) => Math.hypot(...end(lengths, turned(sides, k)));
  let k = 0;
  if (dist < lengths.reduce((sum, l) => sum + l, 0)) {
    let previous = 0;
    let tightest = 0;
    k = NaN;
    for (let i = 1; i <= 90 && Number.isNaN(k); i++) {
      const next = (i / 90) * Math.PI;
      if (reach(next) <= dist) {
        let lo = previous;
        let hi = next;
        for (let n = 0; n < 50; n++) {
          const m = (lo + hi) / 2;
          if (reach(m) > dist) lo = m;
          else hi = m;
        }
        k = (lo + hi) / 2;
      } else if (reach(next) < reach(tightest)) tightest = next;
      previous = next;
    }
    if (Number.isNaN(k)) k = tightest;
  }
  const angles = turned(sides, k);
  const [x, y] = end(lengths, angles);
  const rotation = -Math.atan2(y, x);
  return angles.map((angle) => angle + rotation);
}

/**
 * Joint positions `[root, ..., end]` for segments of exactly `lengths` from `root` to `target`. `bends` is one
 * direction per inner joint (or one for all) saying which way that joint points: alternate them for a digitigrade
 * leg (knee forward, hock back). The limb is planar: the plane holds root, target and the first hint.
 *
 * Rule for the extra freedom of 3+ segments: the last segment runs parallel to root→target (a vertical cannon
 * under a hip) when that respects its hint and reach; otherwise every joint turns by the same angle. Out of reach:
 * straight toward the target. `sole`: the last segment points exactly along `sole` (a flat foot along the floor)
 * and the rest solves to its heel; the joint above the sole segment is set by `sole`, so it takes one bend hint
 * fewer. With two lengths this is classic two-bone IK.
 */
export function limb(
  root: PointInput,
  target: PointInput,
  lengths: readonly number[],
  bends: DirectionInput | readonly DirectionInput[],
  options: { sole?: DirectionInput } = {},
): Vector3[] {
  const n = lengths.length;
  const hints =
    Array.isArray(bends) && typeof bends[0] !== "number"
      ? (bends as readonly DirectionInput[]).map((d) => toDirection(d, "limb()"))
      : lengths.slice(1).map(() => toDirection(bends as DirectionInput, "limb()"));
  const needed = options.sole ? n - 2 : n - 1;
  if (hints.length < needed)
    throw new Error(
      `limb(): ${needed} bend hints needed (one per inner joint${options.sole ? " above the sole segment" : ""}), got ${hints.length}`,
    );
  if (options.sole) {
    const sole = toDirection(options.sole, "limb()").normalize();
    const last = lengths[n - 1];
    const upper = limb(
      root,
      toPoint(target, "limb()").addScaledVector(sole, -last),
      lengths.slice(0, -1),
      hints.slice(0, n - 2),
    );
    return [...upper, upper[upper.length - 1].clone().addScaledVector(sole, last)];
  }
  const a = toPoint(root, "limb()");
  const toTarget = toPoint(target, "limb()").sub(a);
  const d = toTarget.length();
  const dir = d > 1e-9 ? toTarget.normalize() : new Vector3(0, -1, 0);
  let across = flatten(hints[0] ?? new Vector3(0, 0, 1), dir);
  if (across.lengthSq() < 1e-10) across = flatten(new Vector3(0, 0, 1), dir);
  if (across.lengthSq() < 1e-10) across = flatten(new Vector3(1, 0, 0), dir);
  across.normalize();
  const sides = hints.slice(0, n - 1).map((h) => Math.sign(flatten(h, dir).dot(across)) || 1);

  let angles = fold(lengths, sides, d);
  if (n >= 3) {
    const upperLengths = lengths.slice(0, -1);
    const heel = d - lengths[n - 1];
    const upper = fold(upperLengths, sides.slice(0, -1), heel);
    const [x, y] = end(upperLengths, upper);
    const reached = heel > 0 && Math.abs(x - heel) < 1e-6 && Math.abs(y) < 1e-6;
    const lean = upper[upper.length - 1];
    if (reached && (Math.abs(lean) < 1e-9 || Math.sign(lean) === sides[n - 2])) angles = [...upper, 0];
  }
  const points = [a];
  angles.forEach((angle, i) => {
    const step = dir.clone().multiplyScalar(Math.cos(angle)).addScaledVector(across, Math.sin(angle));
    points.push(points[i].clone().addScaledVector(step, lengths[i]));
  });
  return points;
}
```

## src/index.ts

```ts
// The whole SDK from one module, for apps that load a model-written module and map one import name to it.
// `mix` is the paint colour mix; the bone-weight mix stays in "./context".
export * from "./bake";
export * from "./builder";
export * from "./cards";
export * from "./context";
export * from "./decal";
export * from "./distribute";
export * from "./frame";
export * from "./ik";
export * from "./math";
export * from "./membrane";
export * from "./outline";
export * from "./paint";
export * from "./parts";
export * from "./path";
export * from "./region";
export * from "./rig";
export * from "./skeleton";
export * from "./sugar";
export * from "./surface";
export * from "./sweep";
export * from "./texture";
export { mix } from "./paint";
```

## src/math.ts

```ts
// Model-space vector helpers, the geometric input kinds every helper accepts (and their coercions), and the one
// orientation primitive, `aim()`.
import { Box3, Matrix4, Quaternion, Vector3 } from "three";
import type { Mesh } from "three";
import type { Frame } from "./frame";

/**
 * A literal model-space point or direction: `[x, y, z]` or a `THREE.Vector3`. Any number array passes the type check
 * (plain `number[]` data from variables, object fields and `.map` needs no cast); it must hold exactly 3 numbers.
 */
export type V3 = Vector3 | readonly number[];
export type Axis = "x" | "y" | "z";
/** Something with a start frame: a Sweep (and so every rod, capsule, spike, horn...). */
export type HasFrame = { readonly frame: Frame };
/** A Frame (point + orientation + facing axis + owning bone), or something with one. Lines are frames too. */
export type FrameInput = Frame | HasFrame;
/** A point: literal, a raw mesh (its bounding-box centre), or any Frame's position. */
export type PointInput = V3 | Mesh | FrameInput;
/** A direction: literal, or any Frame's facing axis. */
export type DirectionInput = V3 | FrameInput;

export const DEG = Math.PI / 180;

/** A fresh `Vector3` copy of `p` (never aliases the input). `call` names the caller when a literal is malformed. */
export function vec(p: V3, call = "vec()") {
  if ("isVector3" in p) return p.clone();
  if (p.length !== 3 || !p.every(Number.isFinite))
    throw new Error(`${call}: a point or direction is [x, y, z] (3 numbers), got ${JSON.stringify(p)}`);
  return new Vector3(p[0], p[1], p[2]);
}

/** A fresh unit vector for an axis letter or a direction. */
export function axisVector(a: Axis | V3, call: string) {
  if (typeof a !== "string") return vec(a, call).normalize();
  if (a !== "x" && a !== "y" && a !== "z") throw new Error(`${call}: axis is "x", "y", "z" or [x, y, z], got "${a}"`);
  return new Vector3(a === "x" ? 1 : 0, a === "y" ? 1 : 0, a === "z" ? 1 : 0);
}

/** The Frame of a Frame input. */
export function toFrame(x: FrameInput) {
  return "frame" in x ? x.frame : x;
}

/** A fresh model-space point from any point input. `call` names the caller when a literal is malformed. */
export function toPoint(x: PointInput, call = "toPoint()") {
  if (Array.isArray(x) || "isVector3" in x) return vec(x as V3, call);
  if ("isMesh" in x) return new Box3().setFromObject(x as Mesh).getCenter(new Vector3());
  return toFrame(x as FrameInput).at;
}

/** A fresh direction (not normalised) from any direction input: literal, or a Frame's facing axis. */
export function toDirection(x: DirectionInput, call = "toDirection()") {
  return Array.isArray(x) || "isVector3" in x ? vec(x as V3, call) : toFrame(x as FrameInput).axis;
}

export function lerp(a: PointInput, b: PointInput, t: number) {
  return toPoint(a, "lerp()").lerp(toPoint(b, "lerp()"), t);
}

export function mid(a: PointInput, b: PointInput) {
  return toPoint(a, "mid()").lerp(toPoint(b, "mid()"), 0.5);
}

/** `p` moved `dist` along the direction `dir` (normalised). */
export function offset(p: PointInput, dir: DirectionInput, dist: number) {
  return toPoint(p, "offset()").addScaledVector(toDirection(dir, "offset()").normalize(), dist);
}

/** `v` with its component along the unit vector `n` removed. */
export function flatten(v: Vector3, n: Vector3) {
  return v.clone().addScaledVector(n, -v.dot(n));
}

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);
const PARALLEL = 1e-8;

/** The unit secondary axis: `hint` made perpendicular to `d`, or null when they are parallel. */
function perpendicular(hint: Vector3, d: Vector3) {
  const s = flatten(hint, d);
  return s.lengthSq() > PARALLEL ? s.normalize() : null;
}

/**
 * Orientation whose local `axis` points along `dir`.
 *
 * Roll convention (pinned):
 * - axis "y" (bones, tubes, most geometry): local +Z leans toward `up`. Without `up`, the frame is a pure pitch
 *   of "X = creature's right": local +X stays as close to world -X as possible and +Z = X × dir. So in the
 *   mid-plane a bone pointing forward has +Z up, down → +Z forward, up → +Z back, backward → +Z down, and
 *   left/right widths always run along world X. Fallback when `dir` ∥ X (straight sideways): +Z = world up.
 * - axis "z" and "x" (look-at style): local +Y leans toward `up` (default world +Y). Fallback when `dir` ∥ up:
 *   axis "z" keeps local +X = world +X, axis "x" keeps local +Z = world +Z.
 * An explicit `up` parallel to `dir` falls back to the default rule. Deterministic for every input.
 */
export function aim(dir: DirectionInput, up?: DirectionInput, axis: Axis = "y") {
  const d = toDirection(dir, "aim()").normalize();
  if (d.lengthSq() === 0) throw new Error("aim(): zero-length direction");
  let s = up ? perpendicular(toDirection(up, "aim()").normalize(), d) : null;
  if (!s) {
    if (axis === "y") s = perpendicular(d.clone().cross(X), d) ?? perpendicular(Y, d)!;
    else if (axis === "z") s = perpendicular(Y, d) ?? d.clone().cross(X).normalize();
    else s = perpendicular(Y, d) ?? Z.clone().cross(d).normalize();
  }
  const basis = new Matrix4();
  if (axis === "y") basis.makeBasis(d.clone().cross(s), d, s);
  else if (axis === "z") basis.makeBasis(s.clone().cross(d), s, d);
  else basis.makeBasis(d, s, d.clone().cross(s));
  return new Quaternion().setFromRotationMatrix(basis);
}

/** Deterministic PRNG in [0, 1), same algorithm as the creature-lab kit. */
export function rng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

## src/membrane.ts

```ts
// Thin closed skins: `membrane()` between two edges (blend-skinned, or split per bone) and `slab()` from one polygon.
import { ShapeUtils, Vector2, Vector3 } from "three";
import { meshFromWorld, mix, nearestJoint, resolveJoint, rigid, weightsFor } from "./context";
import type { Ctx, Fill, JointRef, Tags, Weights } from "./context";
import { aim, toPoint } from "./math";
import type { PointInput } from "./math";
import { Part } from "./parts";
import { toPath } from "./path";
import type { PathInput } from "./path";
import { Chain } from "./skeleton";
import type { Joint } from "./skeleton";
import type { Skin } from "./sweep";

export type MembraneEdge = Chain | PathInput;

export type MembraneOptions = Tags & {
  color: Fill;
  /** Total thickness; the skin is offset ± thickness/2 along its normal and closed with side walls. */
  thickness: number;
  /** Cells between the edges (default 4 × `detail`). */
  rows?: number;
  /** This membrane's own tessellation multiplier for its default `rows` and `cols` (default: the builder's). */
  detail?: number;
  /** Cells along the edges (default from the aspect ratio); every bone span boundary also gets a column. */
  cols?: number;
  /** Trailing-edge inset between the two edge tips, as a fraction of the edge length (0.25 = a deep scallop). */
  scallop?: number;
  /**
   * "smooth" (default): one mesh whose vertices blend across the width between the two edges' bones and along
   * each edge between neighbouring joints. "rigid": one closed piece per bone.
   */
  skin?: Skin;
  /** Rigid only: which bone owns a cell: "mid" = the nearer edge's joint at that t, "a" / "b" = always that edge. */
  split?: "mid" | "a" | "b";
  /**
   * Bones of Path / point edges. A Chain follows the chain nearest to each cell: a fin on `sweep.line(0)` follows
   * the spine. Default: the edge's own weights (a path made from built inputs), else the other edge's chain
   * joints, else the joint nearest to the cell.
   */
  bone?: JointRef | Chain;
};

/** Grid vertices P[i][j]: `i` along the edges, `j` from edge A (0) to edge B (rows). */
type Grid = Vector3[][];

/**
 * Closed prism triangles for a set of grid cells, appended to positions (world), with the grid vertex [i, j] of
 * every emitted vertex. Cells are [i, j]; `normals` are per-vertex unit normals. Walls are built on every cell edge
 * whose neighbour is not in the set.
 */
function prism(grid: Grid, normals: Grid, cells: Array<[number, number]>, half: number) {
  const positions: number[] = [];
  const index: number[] = [];
  const sources: Array<[number, number]> = [];
  const inSet = new Set(cells.map(([i, j]) => `${i},${j}`));
  const top = (i: number, j: number) => ({ p: grid[i][j].clone().addScaledVector(normals[i][j], half), at: [i, j] });
  const bottom = (i: number, j: number) => ({
    p: grid[i][j].clone().addScaledVector(normals[i][j], -half),
    at: [i, j],
  });
  const tri = (...vs: Array<{ p: Vector3; at: number[] }>) => {
    for (const { p, at } of vs) {
      index.push(positions.length / 3);
      positions.push(p.x, p.y, p.z);
      sources.push([at[0], at[1]]);
    }
  };
  for (const [i, j] of cells) {
    // Counter-clockwise around the cell when seen from +normal: (i,j) → (i+1,j) → (i+1,j+1) → (i,j+1).
    const ring: Array<[number, number]> = [
      [i, j],
      [i + 1, j],
      [i + 1, j + 1],
      [i, j + 1],
    ];
    tri(top(...ring[0]), top(...ring[1]), top(...ring[2]));
    tri(top(...ring[0]), top(...ring[2]), top(...ring[3]));
    tri(bottom(...ring[0]), bottom(...ring[2]), bottom(...ring[1]));
    tri(bottom(...ring[0]), bottom(...ring[3]), bottom(...ring[2]));
    const neighbours = [
      [i, j - 1],
      [i + 1, j],
      [i, j + 1],
      [i - 1, j],
    ];
    for (let e = 0; e < 4; e++) {
      if (inSet.has(`${neighbours[e][0]},${neighbours[e][1]}`)) continue;
      const a = ring[e];
      const b = ring[(e + 1) % 4];
      tri(top(...b), top(...a), bottom(...a));
      tri(top(...b), bottom(...a), bottom(...b));
    }
  }
  return { positions, index, sources };
}

export function membrane(ctx: Ctx, edgeA: MembraneEdge, edgeB: MembraneEdge, options: MembraneOptions) {
  const chainA = edgeA instanceof Chain ? edgeA : null;
  const chainB = edgeB instanceof Chain ? edgeB : null;
  const pathA = chainA ? null : toPath(edgeA as PathInput);
  const pathB = chainB ? null : toPath(edgeB as PathInput);
  // Chain edges are read in their current pose.
  const pointA = (t: number) => (chainA ? chainA.at(t).at : pathA!.at(t));
  const pointB = (t: number) => (chainB ? chainB.at(t).at : pathB!.at(t));
  const detail = ctx.detailOf("membrane()", options.detail);
  const rows = options.rows ?? Math.max(1, Math.round(4 * detail));
  const scallop = options.scallop ?? 0;
  const split = options.split ?? "mid";
  const smooth = (options.skin ?? "smooth") === "smooth";
  const owner = options.bone;
  const ownerCurve = owner instanceof Chain ? owner.curve() : null;
  /** The weights of edge `side` at edge parameter t, near `at`: blended along chains when smooth. */
  const edgeWeights = (side: "a" | "b", t: number, at: Vector3): Weights => {
    const own = side === "a" ? chainA : chainB;
    const other = side === "a" ? chainB : chainA;
    const along = (chain: Chain, u: number) => (smooth ? chain.weightsAt(u) : rigid(chain.jointAt(u)));
    if (own) return along(own, t);
    if (owner instanceof Chain) return along(owner, ownerCurve!.closestT(at));
    if (owner !== undefined) return rigid(resolveJoint(ctx, owner));
    const weights = (side === "a" ? pathA : pathB)!.weights;
    return weights ? (smooth ? weights : rigid(weights[0][0])) : other ? along(other, t) : rigid(nearestJoint(ctx, at));
  };

  let width = 0;
  for (let k = 0; k <= 8; k++) width += pointA(k / 8).distanceTo(pointB(k / 8)) / 9;
  const length = Math.max((chainA ?? pathA!).length, (chainB ?? pathB!).length);
  const cols =
    options.cols ??
    Math.min(ctx.segments(24, detail), Math.max(4, Math.round((length / Math.max(width, 1e-6)) * rows)));
  const us = new Set<number>();
  for (let i = 0; i <= cols; i++) us.add(i / cols);
  for (const chain of [chainA, chainB]) for (const t of chain?.ts ?? []) us.add(t);
  const columns = [...us].sort((x, y) => x - y).filter((u, i, all) => i === 0 || u - all[i - 1] > 1e-4);

  const tMax = (s: number) => 1 - scallop * 4 * s * (1 - s);
  const grid: Grid = columns.map((u) =>
    Array.from({ length: rows + 1 }, (_, j) => {
      const s = j / rows;
      const t = u * tMax(s);
      return pointA(t).lerp(pointB(t), s);
    }),
  );

  // Per-vertex normals: area-weighted cell normals (robust where the two edges meet at a shared root).
  const normals: Grid = grid.map((col) => col.map(() => new Vector3()));
  const total = new Vector3();
  for (let i = 0; i < columns.length - 1; i++)
    for (let j = 0; j < rows; j++) {
      const d1 = grid[i + 1][j + 1].clone().sub(grid[i][j]);
      const d2 = grid[i][j + 1].clone().sub(grid[i + 1][j]);
      const n = new Vector3().crossVectors(d1, d2);
      total.add(n);
      for (const [a, b] of [
        [i, j],
        [i + 1, j],
        [i + 1, j + 1],
        [i, j + 1],
      ])
        normals[a][b].add(n);
    }
  for (const col of normals) for (const n of col) (n.lengthSq() > 1e-16 ? n : n.copy(total)).normalize();
  const tags = { name: options.name, kind: "membrane", group: options.group };
  const cells: Array<[number, number]> = [];
  for (let i = 0; i < columns.length - 1; i++) for (let j = 0; j < rows; j++) cells.push([i, j]);

  if (smooth) {
    // One mesh: each grid vertex blends edge A's weights into edge B's across the width.
    const weights = grid.map((col, i) =>
      col.map((at, j) => {
        const s = j / rows;
        const t = columns[i] * tMax(s);
        return mix([
          [edgeWeights("a", t, at), 1 - s],
          [edgeWeights("b", t, at), s],
        ]);
      }),
    );
    const { positions, index, sources } = prism(grid, normals, cells, options.thickness / 2);
    return [
      meshFromWorld(ctx, positions, index, options.color, (v) => weights[sources[v][0]][sources[v][1]], false, tags, {
        surface: sources.flatMap(([i, j]) => [columns[i], j / rows]),
      }),
    ];
  }

  // Rigid: assign cells to bones and build one closed prism per bone.
  const byJoint = new Map<Joint, Array<[number, number]>>();
  for (const [i, j] of cells) {
    const s = (j + 0.5) / rows;
    const t = ((columns[i] + columns[i + 1]) / 2) * tMax(s);
    const side = split === "mid" ? (s < 0.5 ? "a" : "b") : split;
    const centre = grid[i][j]
      .clone()
      .add(grid[i + 1][j + 1])
      .multiplyScalar(0.5);
    const joint = edgeWeights(side, t, centre)[0][0];
    const list = byJoint.get(joint);
    if (list) list.push([i, j]);
    else byJoint.set(joint, [[i, j]]);
  }
  return [...byJoint].map(([joint, group]) => {
    const { positions, index, sources } = prism(grid, normals, group, options.thickness / 2);
    return meshFromWorld(ctx, positions, index, options.color, () => rigid(joint), false, tags, {
      surface: sources.flatMap(([i, j]) => [columns[i], j / rows]),
    });
  });
}

/** `bone` (rigid) default: the first built point's weights, else the joint nearest the polygon's centre. */
export type SlabOptions = Tags & { color: Fill; thickness: number; bone?: JointRef };

/**
 * A (roughly) planar polygon as a thin closed prism: fins, leaves, plates, ears. Returns a Part whose frame sits at
 * the polygon's centre, facing its normal (counter-clockwise points seen from the front face you).
 */
export function slab(ctx: Ctx, points: readonly PointInput[], options: SlabOptions) {
  const pts = points.map((p, i) => toPoint(p, `slab() point ${i}`));
  if (pts.length < 3) throw new Error("slab() needs at least 3 points");
  // Newell normal.
  const n = new Vector3();
  const center = new Vector3();
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    n.x += (p.y - q.y) * (p.z + q.z);
    n.y += (p.z - q.z) * (p.x + q.x);
    n.z += (p.x - q.x) * (p.y + q.y);
    center.add(p);
  });
  n.normalize();
  center.divideScalar(pts.length);
  // In-plane basis with u × v = n, so the contour is counter-clockwise seen from +n (Newell guarantees it).
  const frame = aim(n, undefined, "z");
  const u = new Vector3(1, 0, 0).applyQuaternion(frame);
  const v = new Vector3(0, 1, 0).applyQuaternion(frame);
  const contour = pts.map((p) => new Vector2(p.clone().sub(center).dot(u), p.clone().sub(center).dot(v)));
  const faces = ShapeUtils.triangulateShape(contour, []);
  const half = options.thickness / 2;
  const top = pts.map((p) => p.clone().addScaledVector(n, half));
  const bottom = pts.map((p) => p.clone().addScaledVector(n, -half));
  const positions: number[] = [];
  const index: number[] = [];
  const tri = (a: Vector3, b: Vector3, c: Vector3) => {
    const base = positions.length / 3;
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    index.push(base, base + 1, base + 2);
  };
  for (const [a, b, c] of faces) {
    const ccw = ShapeUtils.area([contour[a], contour[b], contour[c]]) > 0;
    const [i, j, k] = ccw ? [a, b, c] : [a, c, b];
    tri(top[i], top[j], top[k]);
    tri(bottom[i], bottom[k], bottom[j]);
  }
  for (let i = 0; i < pts.length; i++) {
    const a = i;
    const b = (i + 1) % pts.length;
    tri(top[b], top[a], bottom[a]);
    tri(top[b], bottom[a], bottom[b]);
  }
  const weights = weightsFor(ctx, options.bone, points, center);
  const q = new Vector3();
  const surface: number[] = [];
  for (let i = 0; i < positions.length; i += 3) {
    q.fromArray(positions, i).sub(center);
    surface.push(q.dot(u), q.dot(v));
  }
  const mesh = meshFromWorld(
    ctx,
    positions,
    index,
    options.color,
    () => weights,
    false,
    { name: options.name, kind: "slab", group: options.group },
    { surface },
  );
  return new Part(mesh, center, frame, weights, [0, 0, 1]);
}
```

## src/outline.ts

```ts
// `extrude()` and `lathe()`: a flat 2D outline, drawn point by point, pushed into a slab or spun into a solid.
// Outlines always close, can be corner-cut smooth with "sharp" corners kept, and throw on a loop that crosses itself.
// Extrudes taper across the outline's height and take a bevel that shrinks itself until it fits.
import { Matrix4, Quaternion, ShapeUtils, Vector2, Vector3 } from "three";
import { meshFromWorld, weightsFor } from "./context";
import type { Ctx, Fill, JointRef, Tags } from "./context";
import { aim, DEG, toDirection, toPoint } from "./math";
import type { DirectionInput, PointInput } from "./math";
import { Part } from "./parts";

/**
 * An outline corner `[x, y]` in meters; `[x, y, "sharp"]` keeps that corner pointed through smoothing. Outlines
 * written as plain arrays (a variable inferred as `(string | number)[][]`) are accepted too and checked when built.
 */
export type OutlinePoint = readonly [number, number] | readonly [number, number, "sharp"];
/** What `extrude` and `lathe` take: OutlinePoints, typed or plain. */
export type OutlineInput = readonly (OutlinePoint | readonly (number | string)[])[];

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

/** The authored points, each checked to be `[x, y]` or `[x, y, "sharp"]`. */
function checked(call: string, authored: OutlineInput): readonly OutlinePoint[] {
  authored.forEach((p, i) => {
    const ok =
      (p.length === 2 || (p.length === 3 && p[2] === "sharp")) &&
      typeof p[0] === "number" &&
      typeof p[1] === "number" &&
      Number.isFinite(p[0]) &&
      Number.isFinite(p[1]);
    if (!ok) throw new Error(`${call}: point ${i} is [x, y] or [x, y, "sharp"], got ${JSON.stringify(p)}`);
  });
  return authored as readonly OutlinePoint[];
}

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
export function extrude(ctx: Ctx, points: OutlineInput, options: ExtrudeOptions) {
  const outline = prepare("extrude()", checked("extrude()", points), options.smoothing);
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

  const at = toPoint(options.at, "extrude()");
  const xDir = toDirection(options.x ?? [0, 0, 1], "extrude()").normalize();
  const yRaw = toDirection(options.y ?? [0, 1, 0], "extrude()");
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
    { name: options.name, kind: "extrude", group: options.group },
    { surface: local.flatMap((value, i) => (i % 3 === 2 ? [] : [value])) },
  );
  return new Part(mesh, at, quat, weights, [0, 0, 1]);
}

/**
 * Half a cross-section spun around `axis` through `at`: the outline's x is the distance from the axis (never
 * negative) and its y the height along it. Returns a Part at `at` facing `axis`.
 */
export function lathe(ctx: Ctx, authored: OutlineInput, options: LatheOptions) {
  const points = checked("lathe()", authored);
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

  const at = toPoint(options.at, "lathe()");
  const quat = aim(toDirection(options.axis ?? [0, 1, 0], "lathe()"), undefined, "y");
  const weights = weightsFor(ctx, options.bone, [options.at], at);
  const mesh = meshFromWorld(
    ctx,
    toWorld(local, at, quat),
    index,
    options.color,
    () => weights,
    smooth,
    { name: options.name, kind: "lathe", group: options.group },
    { surface, wrap: true },
  );
  return new Part(mesh, at, quat, weights, [0, 1, 0]);
}
```

## src/paint.ts

```ts
// Paints: colour as a function of model-space position and surface normal (and, where the part has them, its own
// surface coordinates). Any `color` option takes one; the SDK bakes it into a texture over the part's surface, so a
// pattern runs on across body, legs and tail at one size in meters. The ready-made paints below take colours or
// other paints for every colour, so they nest.
import { Color, SRGBColorSpace, Vector3 } from "three";
import { axisVector, toPoint } from "./math";
import type { Axis, PointInput, V3 } from "./math";

/** An sRGB colour, each channel 0..1. */
export type Rgb = readonly [number, number, number];
/** A colour anywhere a paint takes one: `"#rrggbb"` (any CSS colour name works), an `Rgb`, or another paint. */
export type ColorInput = string | Rgb | Paint;
/** One colour or a list; a list gives each spot, patch or scale one of them at random. */
export type Colors = ColorInput | readonly ColorInput[];
/**
 * A part's own coordinates at a surface point: sweeps and lofts `[t, deg]` (source t, and the dorsal clock angle of
 * `sweep.at`), extrude `[x, y]` (the outline's meters), lathe `[height, deg]`, membranes `[along, across]` (0..1),
 * slabs `[x, y]` (meters in the polygon's plane), three.js geometries their `uv`, and `[0, 0]` elsewhere.
 */
export type SurfaceCoords = readonly [number, number];
export type PaintFn = (p: Vector3, n: Vector3, s: SurfaceCoords) => ColorInput;

let nextId = 0;
const NOWHERE: SurfaceCoords = [0, 0];
/** The surface coordinates of the point being painted, so paints nested inside another read them too. */
let current: SurfaceCoords = NOWHERE;

/**
 * A colour at every surface point. `at(p, n, s?)` reads it: `p` a model-space point, `n` the unit outward normal
 * there, `s` the part's own surface coordinates (see `SurfaceCoords`).
 */
export class Paint {
  readonly id = ++nextId;

  constructor(private readonly fn: PaintFn) {}

  at(p: Vector3, n: Vector3, s?: SurfaceCoords): Rgb {
    if (!s) return resolve(this.fn(p, n, current), p, n);
    const outer = current;
    current = s;
    try {
      return resolve(this.fn(p, n, s), p, n);
    } finally {
      current = outer;
    }
  }

  /** Sweeps compare colours as strings when they split a tube; every paint is its own colour. */
  toString() {
    return `paint#${this.id}`;
  }
}

/**
 * Your own paint: `(p, n, s) => colour`, where the colour may be another paint (`p.y < 0.3 ? SOCK : coat`) and `s`
 * is the part's own surface coordinates (on a tube, a stripe that spirals round it depends on both t and angle).
 */
export function paint(fn: PaintFn) {
  return new Paint(fn);
}

const parsed = new Map<string, Rgb>();
const scratch = new Color();

/** The sRGB channels of a colour string, an `Rgb` as it is. */
export function rgb(color: string | Rgb): Rgb {
  if (typeof color !== "string") return color;
  let out = parsed.get(color);
  if (!out) {
    scratch.setStyle(color, SRGBColorSpace);
    const target = { r: 0, g: 0, b: 0 };
    scratch.getRGB(target, SRGBColorSpace);
    out = [target.r, target.g, target.b];
    parsed.set(color, out);
  }
  return out;
}

/** The colour of `c` at a surface point. */
export function resolve(c: ColorInput, p: Vector3, n: Vector3): Rgb {
  return c instanceof Paint ? c.at(p, n) : rgb(c);
}

/** `a` blended toward `b` by `t` (0 = a, 1 = b). */
export function mix(a: string | Rgb, b: string | Rgb, t: number): Rgb {
  const x = rgb(a);
  const y = rgb(b);
  const s = Math.min(Math.max(t, 0), 1);
  return [x[0] + (y[0] - x[0]) * s, x[1] + (y[1] - x[1]) * s, x[2] + (y[2] - x[2]) * s];
}

/** 0 below `e0`, 1 above `e1`, a smooth ramp between. */
export function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------------------------------------------
// Noise

function hash(x: number, y: number, z: number, seed: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/** A deterministic number in [0, 1) for integer coordinates. */
const unit = (x: number, y: number, z: number, seed: number) => hash(x, y, z, seed) / 4294967296;

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

function grad(h: number, x: number, y: number, z: number) {
  switch (h & 15) {
    case 0:
      return x + y;
    case 1:
      return -x + y;
    case 2:
      return x - y;
    case 3:
      return -x - y;
    case 4:
      return x + z;
    case 5:
      return -x + z;
    case 6:
      return x - z;
    case 7:
      return -x - z;
    case 8:
      return y + z;
    case 9:
      return -y + z;
    case 10:
      return y - z;
    case 11:
      return -y - z;
    case 12:
      return x + y;
    case 13:
      return -x + y;
    case 14:
      return -y + z;
    default:
      return -y - z;
  }
}

/** Gradient noise, about -1..1, one feature per unit. */
function perlin(x: number, y: number, z: number, seed: number) {
  const X = Math.floor(x);
  const Y = Math.floor(y);
  const Z = Math.floor(z);
  const fx = x - X;
  const fy = y - Y;
  const fz = z - Z;
  const u = fade(fx);
  const v = fade(fy);
  const w = fade(fz);
  const g = (i: number, j: number, k: number) => grad(hash(X + i, Y + j, Z + k, seed), fx - i, fy - j, fz - k);
  const x00 = g(0, 0, 0) + u * (g(1, 0, 0) - g(0, 0, 0));
  const x10 = g(0, 1, 0) + u * (g(1, 1, 0) - g(0, 1, 0));
  const x01 = g(0, 0, 1) + u * (g(1, 0, 1) - g(0, 0, 1));
  const x11 = g(0, 1, 1) + u * (g(1, 1, 1) - g(0, 1, 1));
  const y0 = x00 + v * (x10 - x00);
  const y1 = x01 + v * (x11 - x01);
  return y0 + w * (y1 - y0);
}

/**
 * Smooth cloudy noise in 0..1 (mean 0.5) with features about `size` meters across: three octaves of gradient noise.
 * The same `seed` gives the same field everywhere, so neighbouring parts continue it.
 */
export function noise(p: Vector3, size: number, seed = 0) {
  let sum = 0;
  let amp = 1;
  let f = 1 / size;
  for (let o = 0; o < 3; o++) {
    sum += amp * perlin(p.x * f + o * 17.1, p.y * f + o * 31.7, p.z * f + o * 11.3, seed + o * 101);
    amp *= 0.5;
    f *= 2;
  }
  return Math.min(Math.max(0.5 + sum * 0.55, 0), 1);
}

/** The nearest scattered feature point to `p`: cells about `size` meters across. */
export type Cell = {
  /** Distance to the nearest feature point, in units of `size`. */
  d1: number;
  /** Distance to the second nearest; `d2 - d1` is 0 on a border between two cells. */
  d2: number;
  /** A random number in [0, 1) that is the same over the whole cell. */
  id: number;
  /** The nearest feature point, model space. */
  center: Vector3;
};

/** Cellular (Worley) noise: which randomly placed cell `p` falls in, and how far it is from the cell border. */
export function cells(p: Vector3, size: number, seed = 0): Cell {
  const x = p.x / size;
  const y = p.y / size;
  const z = p.z / size;
  const X = Math.floor(x);
  const Y = Math.floor(y);
  const Z = Math.floor(z);
  let d1 = Infinity;
  let d2 = Infinity;
  let best = [0, 0, 0];
  let bestC = [0, 0, 0];
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) {
        const cx = X + i;
        const cy = Y + j;
        const cz = Z + k;
        const px = cx + unit(cx, cy, cz, seed);
        const py = cy + unit(cx, cy, cz, seed + 7);
        const pz = cz + unit(cx, cy, cz, seed + 13);
        const d = Math.hypot(px - x, py - y, pz - z);
        if (d < d1) {
          d2 = d1;
          d1 = d;
          best = [cx, cy, cz];
          bestC = [px, py, pz];
        } else if (d < d2) d2 = d;
      }
  return {
    d1,
    d2,
    id: unit(best[0], best[1], best[2], seed + 29),
    center: new Vector3(bestC[0] * size, bestC[1] * size, bestC[2] * size),
  };
}

/** `p` pushed about by smooth noise, up to `amount` meters: ragged, organic edges for any pattern read at it. */
function warp(p: Vector3, size: number, amount: number, seed: number) {
  if (!amount) return p;
  const f = 1 / size;
  return new Vector3(
    p.x + amount * perlin(p.x * f, p.y * f, p.z * f, seed + 1),
    p.y + amount * perlin(p.x * f + 5.2, p.y * f + 1.3, p.z * f, seed + 2),
    p.z + amount * perlin(p.x * f, p.y * f + 9.1, p.z * f + 3.7, seed + 3),
  );
}

/** One colour from a list by `t`; an `[r, g, b]` tuple is one colour, not a list. */
const pick = (colors: Colors, t: number): ColorInput =>
  Array.isArray(colors) && typeof colors[0] !== "number"
    ? (colors as readonly ColorInput[])[Math.min(Math.floor(t * colors.length), colors.length - 1)]
    : (colors as ColorInput);

/** `a` over `b` by coverage `t`, each resolved only when needed. */
function blend(a: ColorInput, b: ColorInput, t: number, p: Vector3, n: Vector3): Rgb {
  if (t <= 0) return resolve(a, p, n);
  if (t >= 1) return resolve(b, p, n);
  return mix(resolve(a, p, n), resolve(b, p, n), t);
}

// ---------------------------------------------------------------------------------------------------------------
// Ready-made paints. Every size is in meters; every colour may be a paint.

/** Two colours in soft cloudy blotches about `size` across: mottled skin, lichen, stone, moss, dappled coats. */
export function mottle(a: ColorInput, b: ColorInput, options: { size: number; seed?: number; contrast?: number }) {
  const { size, seed = 0, contrast = 1 } = options;
  const half = 0.25 / contrast;
  return paint((p, n) => blend(a, b, smoothstep(0.5 - half, 0.5 + half, noise(p, size, seed)), p, n));
}

/**
 * Spots on `base`, spaced about `size` apart: leopard, cheetah, dalmatian, fawn, toadstool. `amount` (0..1, default
 * 0.5) sets how much of the surface they cover. `rosette` draws each as a broken ring with a darker centre. A
 * colour list gives each spot one of them.
 */
export function spots(
  base: ColorInput,
  spot: Colors,
  options: { size: number; amount?: number; rosette?: boolean; seed?: number },
) {
  const { size, amount = 0.5, rosette = false, seed = 0 } = options;
  const edge = 0.06;
  return paint((p, n) => {
    const q = warp(p, size * 0.5, size * 0.12, seed);
    const c = cells(q, size, seed);
    if (unit(Math.floor(c.id * 1e6), 0, 0, seed + 3) > 0.35 + amount) return resolve(base, p, n);
    const r = (0.2 + 0.3 * amount) * (0.7 + 0.6 * unit(Math.floor(c.id * 1e6), 1, 0, seed));
    const color = pick(spot, c.id);
    if (!rosette) return blend(base, color, smoothstep(r + edge, r - edge, c.d1), p, n);
    const ring = smoothstep(r + edge, r - edge, c.d1) * smoothstep(r * 0.5 - edge, r * 0.5 + edge, c.d1);
    const broken = ring * smoothstep(0.38, 0.5, noise(q, size * 0.35, seed + 5));
    const inside = c.d1 < r * 0.5 + edge ? 0.3 * smoothstep(r * 0.5 + edge, r * 0.5 - edge, c.d1) : 0;
    return blend(base, color, Math.max(broken, inside), p, n);
  });
}

/**
 * Bands across `axis` ("x", "y", "z" or a direction; default "z", so they ring a body that runs along z), about `size` apart, with wavy,
 * forking, tapering edges: tiger, zebra, okapi legs, wasp, bands on a tail. `width` (0..1, default 0.35) is the
 * stripe share of each repeat, `wobble` (default 0.5) how far they wander.
 */
export function stripes(
  base: ColorInput,
  stripe: Colors,
  options: { size: number; axis?: Axis | V3; width?: number; wobble?: number; seed?: number },
) {
  const { size, width = 0.35, wobble = 0.5, seed = 0 } = options;
  const axis = axisVector(options.axis ?? "z", "stripes()");
  return paint((p, n) => {
    const s = p.dot(axis) / size + wobble * 2 * (noise(p, size * 1.6, seed) - 0.5);
    const k = Math.floor(s);
    const f = s - k;
    const taper = smoothstep(0.28, 0.5, noise(p, size * 1.2, seed + 9));
    const w = width * (0.6 + 0.8 * unit(k, 0, 0, seed)) * taper;
    const d = Math.abs(f - 0.5);
    return blend(base, pick(stripe, unit(k, 1, 0, seed)), smoothstep(w / 2 + 0.03, w / 2 - 0.03, d), p, n);
  });
}

/**
 * Irregular patches about `size` across, separated by lines of `base` `gap` wide (share of `size`, default 0.1):
 * giraffe, cow, tortoise shell, crazy paving, cracked mud. A colour list varies the patches.
 */
export function patches(base: ColorInput, patch: Colors, options: { size: number; gap?: number; seed?: number }) {
  const { size, gap = 0.1, seed = 0 } = options;
  return paint((p, n) => {
    const c = cells(warp(p, size * 0.6, size * 0.1, seed), size, seed);
    const e = c.d2 - c.d1;
    return blend(base, pick(patch, c.id), smoothstep(gap - 0.03, gap + 0.03, e), p, n);
  });
}

/**
 * Scales or tiles about `size` across, each shaded a little differently, outlined in `edge` (line width `width`
 * as a share of `size`, default 0.12): reptile and fish scales, pangolin plates, cobbles, bark plates.
 */
export function scales(base: Colors, edge: ColorInput, options: { size: number; width?: number; seed?: number }) {
  const { size, width = 0.12, seed = 0 } = options;
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const shade = 0.88 + 0.2 * c.id - 0.12 * Math.min(c.d1, 1);
    const face = resolve(pick(base, unit(Math.floor(c.id * 1e6), 2, 0, seed)), p, n);
    const lit: Rgb = [Math.min(face[0] * shade, 1), Math.min(face[1] * shade, 1), Math.min(face[2] * shade, 1)];
    return mix(resolve(edge, p, n), lit, smoothstep(width * 0.5, width, c.d2 - c.d1));
  });
}

/**
 * Dark back, light belly, by which way the surface faces: `back` where it faces up, `belly` where it faces down,
 * blended over `soft` (default 0.35) around `level` (default 0; −1 faces straight down, 1 straight up).
 */
export function countershade(back: ColorInput, belly: ColorInput, options: { level?: number; soft?: number } = {}) {
  const { level = 0, soft = 0.35 } = options;
  return paint((p, n) => blend(belly, back, smoothstep(level - soft, level + soft, n.y), p, n));
}

/** `a` at `from`, `b` at `to`, blended between along the line joining them: socks, tail tips, sun-faded tops. */
export function gradient(a: ColorInput, b: ColorInput, from: PointInput, to: PointInput) {
  const start = toPoint(from, "gradient()");
  const d = toPoint(to, "gradient()").sub(start);
  const len2 = Math.max(d.lengthSq(), 1e-12);
  const q = new Vector3();
  return paint((p, n) => blend(a, b, q.copy(p).sub(start).dot(d) / len2, p, n));
}

/**
 * Fine streaks running along `axis` ("x", "y", "z" or a direction; default "y"), about `size` apart: wood grain, bark, reeds, hair,
 * brushed metal, sedimentary stone.
 */
export function grain(a: ColorInput, b: ColorInput, options: { size: number; axis?: Axis | V3; seed?: number }) {
  const { size, seed = 0 } = options;
  const axis = axisVector(options.axis ?? "y", "grain()");
  const u = new Vector3(1, 0, 0);
  if (Math.abs(axis.dot(u)) > 0.9) u.set(0, 0, 1);
  const side = u.sub(axis.clone().multiplyScalar(u.dot(axis))).normalize();
  const other = axis.clone().cross(side);
  const q = new Vector3();
  return paint((p, n) => {
    q.set(p.dot(side), p.dot(other), p.dot(axis) / 8);
    const v = noise(q, size * 2, seed);
    const band = 0.5 + 0.5 * Math.sin(v * 40 + noise(q, size * 0.5, seed + 1) * 3);
    return blend(a, b, smoothstep(0.35, 0.85, band), p, n);
  });
}
```

## src/parts.ts

```ts
// `part()`: one mesh placed in model space and parented under its bone, keeping its world transform. It returns a
// `Part`: a Frame (the geometry's origin and orientation, facing the axis it was aimed along) that follows its bone.
// A part placed on a smooth-skinned point (a bend in a tube, a hit on a bend) takes that point's weights and bends
// with the skin under it.
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { BufferGeometry, Mesh, Texture } from "three";
import { addMesh, makeMesh, resolveJoint, rigid, setWorld, skinMesh, weightsFor, writeWeights } from "./context";
import type { Ctx, Fill, JointRef, Tags, Weights } from "./context";
import { Spot } from "./frame";
import { aim, DEG, toDirection, toFrame, toPoint, vec } from "./math";
import type { Axis, DirectionInput, FrameInput, PointInput, V3 } from "./math";

const AXES: Record<Axis, V3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/** A placed mesh as a Frame: `at`/`quat` are its geometry origin and orientation, `axis` its facing axis. */
export class Part extends Spot {
  constructor(
    readonly mesh: Mesh,
    at: Vector3,
    quat: Quaternion,
    weights: Weights,
    facing: V3,
  ) {
    super(at, quat, weights, facing);
  }
}

export type PartOptions = Tags & {
  /**
   * Owning bone (rigid). Default: the weights of `at` / `frame` when they came from something built (a bend in a
   * smooth tube gives two bones), else the nearest joint.
   */
  bone?: JointRef;
  /** Place the geometry on a frame: its position, and its orientation unless another orientation option is given. */
  frame?: FrameInput;
  /** Position of the geometry origin; default `frame`'s position, else the bone's. */
  at?: PointInput;
  /** Orientation, first match wins: `quat`, then `aim` (target point) / `dir`, then `rotation`, then `frame`. */
  quat?: Quaternion;
  aim?: PointInput;
  dir?: DirectionInput;
  up?: DirectionInput;
  /** Geometry axis pointed by `aim`/`dir`, and reported as the part's facing `axis` (default "y"). */
  axis?: Axis;
  /** Euler XYZ in degrees, model space. */
  rotation?: V3;
  scale?: number | V3;
  /**
   * An image mapped by the geometry's own UVs (three.js geometries have them), e.g. from `svg()`. A drawing in
   * colour shows its own colours; a drawing in greys (white to black) is tinted by `color`. Transparent pixels cut
   * the part away.
   */
  texture?: Texture;
  /** Faceted shading: every triangle shades as one flat face (the geometry's vertices are split, normals redone). */
  flat?: boolean;
};

export function part(ctx: Ctx, geometry: BufferGeometry, color: Fill, options: PartOptions = {}) {
  const placed = options.at ?? options.frame;
  const weights = placed
    ? weightsFor(ctx, options.bone, [options.at, options.frame], toPoint(placed))
    : rigid(resolveJoint(ctx, options.bone));
  const joint = weights[0][0];
  const at = placed ? toPoint(placed) : joint.at;
  let quat = new Quaternion();
  if (options.quat) quat = options.quat.clone();
  else if (options.aim || options.dir)
    quat = aim(options.aim ? toPoint(options.aim).sub(at) : toDirection(options.dir!), options.up, options.axis);
  else if (options.rotation) {
    const [x, y, z] = vec(options.rotation).multiplyScalar(DEG).toArray();
    quat.setFromEuler(new Euler(x, y, z));
  } else if (options.frame) quat = toFrame(options.frame).quat;
  const scale =
    options.scale === undefined
      ? new Vector3(1, 1, 1)
      : typeof options.scale === "number"
        ? new Vector3().setScalar(options.scale)
        : vec(options.scale);
  const blended = weights.length > 1;
  const shaped = options.flat
    ? geometry.index
      ? geometry.toNonIndexed()
      : geometry.clone()
    : blended
      ? geometry.clone()
      : geometry;
  if (options.flat) shaped.computeVertexNormals();
  const tint = options.texture?.userData.coloured && typeof color === "string" ? "#ffffff" : color;
  const mesh = makeMesh(ctx, shaped, tint, new Matrix4().compose(at, quat, scale), options.texture);
  setWorld(mesh, joint.object, at, quat, scale);
  addMesh(ctx, mesh, joint, options);
  if (blended)
    skinMesh(
      ctx,
      mesh,
      writeWeights(mesh.geometry, mesh.geometry.getAttribute("position").count, () => weights),
    );
  return new Part(mesh, at, quat, weights, AXES[options.axis ?? "y"]);
}
```

## src/path.ts

```ts
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
```

## src/region.ts

```ts
// `region()`: a movable, scalable authoring frame (not a scene node) for heads, props and other sub-assemblies.
// A region is a Frame; literal points and directions given to its methods are in region units, anything built
// (joints, parts, hits...) and anything `p()`/`d()` returned is already in model space and passes through.
import { Euler, Quaternion, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { resolveJoint, rigid, weightsOf } from "./context";
import type { Ctx, Fill, JointRef } from "./context";
import { Spot } from "./frame";
import { DEG, toDirection, toPoint, vec } from "./math";
import type { DirectionInput, PointInput, V3 } from "./math";
import { part } from "./parts";
import type { PartOptions } from "./parts";
import { createJoint } from "./skeleton";
import type { JointOptions } from "./skeleton";

/** `bone` (default: the weights of `at` when it came from something built): the region rides on that joint. */
export type RegionOptions = { at: PointInput; scale?: number; quat?: Quaternion; bone?: JointRef };

/** A model-space vector from `region.p()`/`region.d()`: region methods pass it through instead of converting again. */
class ModelVector extends Vector3 {}

const literal = (x: PointInput | DirectionInput): x is V3 =>
  Array.isArray(x) || ("isVector3" in x && !(x instanceof ModelVector));

export class Region extends Spot {
  readonly scale: number;

  constructor(
    private readonly ctx: Ctx,
    options: RegionOptions,
  ) {
    const weights = options.bone === undefined ? (weightsOf(options.at) ?? []) : rigid(resolveJoint(ctx, options.bone));
    super(toPoint(options.at), options.quat?.clone() ?? new Quaternion(), weights);
    this.scale = options.scale ?? 1;
  }

  /** Region-local point (scaled, rotated, moved) → model space. Non-literal points pass through. */
  p(local: PointInput): Vector3 {
    return literal(local) ? new ModelVector().copy(this.local(vec(local).multiplyScalar(this.scale))) : toPoint(local);
  }

  /** Region-local direction (rotated) → model space. Non-literal directions pass through. */
  d(dir: DirectionInput): Vector3 {
    return literal(dir) ? new ModelVector().copy(this.dir(dir)) : toDirection(dir);
  }

  /** Region-local length → model space. */
  s(length: number) {
    return length * this.scale;
  }

  /** Region-local orientation → model space. */
  q(local = new Quaternion()) {
    return this.quat.multiply(local);
  }

  /** `b.part` with every option in region units; the region scale is baked into the mesh scale. */
  part(geometry: BufferGeometry, color: Fill, options: PartOptions = {}) {
    let quat: Quaternion | undefined;
    if (options.quat) quat = this.q(options.quat);
    else if (!options.aim && !options.dir && !options.frame) {
      const [x, y, z] = vec(options.rotation ?? [0, 0, 0])
        .multiplyScalar(DEG)
        .toArray();
      quat = this.q(new Quaternion().setFromEuler(new Euler(x, y, z)));
    }
    const scale =
      options.scale === undefined
        ? this.scale
        : typeof options.scale === "number"
          ? options.scale * this.scale
          : vec(options.scale).multiplyScalar(this.scale);
    // Bare positions (literals and `p()` results) take the region's weights (it is passed as the frame); built inputs
    // keep their own.
    const own = !options.frame && (!options.at || literal(options.at) || options.at instanceof ModelVector);
    return part(this.ctx, geometry, color, {
      ...options,
      frame: own ? this : options.frame,
      at:
        options.at && literal(options.at) ? this.p(options.at) : (options.at ?? (options.frame ? undefined : this.at)),
      aim: options.aim && this.p(options.aim),
      dir: options.dir && this.d(options.dir),
      up: options.up && this.d(options.up),
      quat,
      rotation: undefined,
      scale,
    });
  }

  /** `b.joint` with positions/directions in region units. Joints are moved and rotated, never scaled. */
  joint(name: string, options: JointOptions) {
    return createJoint(this.ctx, name, {
      ...options,
      at: this.p(options.at),
      aim: options.aim && this.p(options.aim),
      dir: options.dir && this.d(options.dir),
      up: options.up && this.d(options.up),
    });
  }
}
```

## src/rig.ts

```ts
// The rig answer key: what the SDK knows about the skeleton's semantics (limb kinds, sides, ground contacts,
// hinges, ring joint groups), written to `root.userData.rig` so a benchmark can score auto-riggers against it.
import type { Vector3 } from "three";
import type { Joint } from "./skeleton";

/** What a joint, chain or ring group is. "jaw" and "hinge" (lids, wing cases, flaps) record their hinge axis. */
export type Role =
  | "spine"
  | "neck"
  | "head"
  | "jaw"
  | "hinge"
  | "tail"
  | "leg"
  | "arm"
  | "wing"
  | "digit"
  | "tentacle"
  | "fan";

/** "L" = the creature's left (+X), "R" = right (-X), "C" = on the mid-plane. */
export type Side = "L" | "R" | "C";
type Tuple = [number, number, number];

export type RigChain = { name: string; role: Role; side: Side; joints: string[]; contact?: Tuple };
export type RigJoint = { name: string; role: Role; side: Side; hinge?: Tuple };
/** A `ring(..., { joints })` group: items spread about `axis` through `pivot`, each run owned by one joint. */
export type RigRing = {
  name: string;
  role: Role;
  side: Side;
  pivot: Tuple;
  axis: Tuple;
  joints: Array<{ joint: string; items: number }>;
};
export type RigRecord = { chain: RigChain } | { joint: RigJoint } | { ring: RigRing };

/** `userData.rig` on the root. Model space, meters: +Y up, the creature faces +Z, its left is +X. */
export type RigBlock = { version: 1; chains: RigChain[]; joints: RigJoint[]; rings: RigRing[] };

export const tuple = (v: Vector3): Tuple => [+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)];

/** "L" / "R" when every joint currently sits on that side of the mid-plane (1 mm margin), else "C". */
export function sideOf(joints: readonly Joint[]): Side {
  const xs = joints.map((joint) => joint.at.x);
  return xs.every((x) => x > 1e-3) ? "L" : xs.every((x) => x < -1e-3) ? "R" : "C";
}

/** Evaluate every registered record against the current pose. */
export function rigBlock(records: ReadonlyArray<() => RigRecord>): RigBlock {
  const block: RigBlock = { version: 1, chains: [], joints: [], rings: [] };
  for (const record of records.map((read) => read())) {
    if ("chain" in record) block.chains.push(record.chain);
    else if ("joint" in record) block.joints.push(record.joint);
    else block.rings.push(record.ring);
  }
  return block;
}
```

## src/skeleton.ts

```ts
// Joints and chains: the only helpers that create bones. Also `pose()`, which re-poses a joint after building and
// re-deforms blend-skinned meshes.
import { Group, Matrix4, Quaternion, Vector3 } from "three";
import { boneFor, Capture, resolveJoint, rigid, setWorld, spanWeights } from "./context";
import type { Ctx, JointRef, Weights } from "./context";
import { Frame, Spot } from "./frame";
import { aim, DEG, toDirection, toFrame, toPoint } from "./math";
import type { DirectionInput, FrameInput, PointInput } from "./math";
import { smoothPath, toPath } from "./path";
import type { Frames, Path, PathInput, Twist } from "./path";
import { sideOf, tuple } from "./rig";
import type { Role } from "./rig";

const JOINT_NAME = /^[A-Za-z][A-Za-z0-9_]*$/;

/** A bone: a Frame read live from the scene (its `axis` is the bone's +Y), weighted fully on itself. */
export class Joint extends Frame {
  constructor(
    readonly name: string,
    readonly object: Group,
    readonly parent: Joint | null,
  ) {
    super();
  }

  get at() {
    return new Vector3().setFromMatrixPosition(this.object.matrixWorld);
  }

  get quat() {
    return new Quaternion().setFromRotationMatrix(this.object.matrixWorld);
  }

  get weights(): Weights {
    return [[this, 1]];
  }

  get bone(): Joint {
    return this;
  }
}

export type JointOptions = {
  /**
   * Omitted: the first joint is the root; later joints take the bone of `at` when it came from something built,
   * else the nearest joint.
   */
  parent?: JointRef;
  at: PointInput;
  /** Target point: bone +Y points at it. */
  aim?: PointInput;
  /** Direction: bone +Y points along it. */
  dir?: DirectionInput;
  /** Roll: local +Z leans toward `up` (see `aim()`). */
  up?: DirectionInput;
  group?: string;
  /** Rig answer key: what this joint is. "jaw" / "hinge" record the hinge axis (the bone's local X). */
  role?: Role;
};

export function createJoint(ctx: Ctx, name: string, options: JointOptions) {
  if (!JOINT_NAME.test(name)) throw new Error(`Joint name "${name}" must match ${JOINT_NAME}`);
  if (ctx.joints.has(name)) throw new Error(`Joint "${name}" already exists`);
  const at = toPoint(options.at, "joint()");
  const parent = options.parent === undefined && !ctx.rootJoint ? null : boneFor(ctx, options.parent, [options.at], at);
  const direction = options.aim
    ? toPoint(options.aim, "joint()").sub(at)
    : options.dir
      ? toDirection(options.dir, "joint()")
      : null;
  const quat = direction ? aim(direction, options.up) : (parent?.quat ?? new Quaternion());
  const object = new Group();
  object.name = name;
  object.userData.joint = name;
  if (options.group) object.userData.group = options.group;
  setWorld(object, parent ? parent.object : ctx.root, at, quat);
  const joint = new Joint(name, object, parent);
  ctx.joints.set(name, joint);
  if (!parent) ctx.rootJoint = joint;
  const { role } = options;
  if (role)
    ctx.rig.push(() => ({
      joint: {
        name,
        role,
        side: sideOf([joint]),
        ...(role === "jaw" || role === "hinge" ? { hinge: tuple(joint.dir([1, 0, 0])) } : {}),
      },
    }));
  return joint;
}

/**
 * A rotation for `pose()`, in model space. About the joint's own position: a quaternion, `{ axis, deg }`
 * (right-hand rule; `axis` may be any direction input, e.g. a frame's facing axis), or the smallest swing that
 * points the bone (+Y) along `dir` or at `aim`. About any Line in space: `{ about, deg }` (a made-up hinge).
 */
export type PoseRotation =
  | Quaternion
  | { axis: DirectionInput; deg: number }
  | { about: FrameInput; deg: number }
  | { dir: DirectionInput }
  | { aim: PointInput };

/**
 * Rotate a joint, with everything under it: a new rest pose (open a jaw, raise a tail, fold a ring's joint group)
 * without rebuilding. Joints read the scene, frames are stored on their bones, chains, sweeps and surfaces map
 * their build-time data through each joint's motion, and blend-skinned meshes re-deform, so every handle stays valid.
 */
export function pose(ctx: Ctx, ref: JointRef, rotation: PoseRotation) {
  const joint = resolveJoint(ctx, ref);
  let pivot = joint.at;
  let delta: Quaternion;
  if ("isQuaternion" in rotation) delta = rotation.clone();
  else if ("about" in rotation) {
    const hinge = toFrame(rotation.about);
    pivot = hinge.at;
    delta = new Quaternion().setFromAxisAngle(hinge.axis, rotation.deg * DEG);
  } else if ("axis" in rotation)
    delta = new Quaternion().setFromAxisAngle(toDirection(rotation.axis, "pose()").normalize(), rotation.deg * DEG);
  else {
    const to = "dir" in rotation ? toDirection(rotation.dir, "pose()") : toPoint(rotation.aim, "pose()").sub(pivot);
    delta = new Quaternion().setFromUnitVectors(joint.axis, to.normalize());
  }
  const at = joint.at.sub(pivot).applyQuaternion(delta).add(pivot);
  const world = new Matrix4().compose(at, delta.multiply(joint.quat), new Vector3(1, 1, 1));
  const { object } = joint;
  object
    .parent!.matrixWorld.clone()
    .invert()
    .multiply(world)
    .decompose(object.position, object.quaternion, object.scale);
  object.updateMatrixWorld(true);
  for (const skin of ctx.skins) skin();
  ctx.poses++;
  return joint;
}

export type ChainOptions = {
  /** Default: the bone of the path's start when it came from something built, else the nearest joint. */
  parent?: JointRef;
  /** Start roll: the chain's normal (joint +Z) leans toward `up`, then is parallel-transported along the path. */
  up?: DirectionInput;
  group?: string;
  /** Number of joints, evenly spaced by arc length. Default: one joint per knot span of the path. */
  count?: number;
  /**
   * Joint names, by index from 0 (auto-riggers key on names: hipHL, kneeHL, hockHL). Default `${name}1..N`. One name
   * per span; one more names a tip joint at the path's end (a hand, foot or hoof bone), last in `joints` and `tip`.
   */
  names?: readonly string[] | ((i: number) => string);
  /** Roll about the path after parallel transport: total degrees start→end, or `(t) => deg`. Joints and sweeps follow. */
  twist?: Twist;
  /** Rig answer key: what this chain is (a "leg" also records its ground contact). */
  role?: Role;
  /** Ground contact for the rig answer key (default for legs: the chain's tip, i.e. the `limb` target). */
  contact?: PointInput;
};

/** A frame on a chain, rigid on that span's joint: +Y = tangent, +Z = transported normal, +X = binormal. */
export class ChainPoint extends Spot {
  constructor(
    readonly t: number,
    at: Vector3,
    quat: Quaternion,
    joint: Joint,
    capture: Capture,
  ) {
    super(at, quat, rigid(joint), undefined, capture);
  }

  get tangent() {
    return this.axis;
  }

  get normal() {
    return this.dir([0, 0, 1]);
  }

  get binormal() {
    return this.dir([1, 0, 0]);
  }
}

export class Chain {
  readonly capture: Capture;
  /** Every joint: one per span, then the tip joint when `names` gave one. */
  readonly joints: readonly Joint[];

  constructor(
    readonly name: string,
    /** The curve and frames as built; `at()` gives them in the current pose. */
    readonly path: Path,
    readonly frames: Frames,
    /** Arc-length t of each span joint, plus 1 for the tip. */
    readonly ts: readonly number[],
    /** One joint per span: the joints the chain's tubes and membranes bend with. */
    readonly spanJoints: readonly Joint[],
    /** The joint at the path's end, when `names` has one more entry than there are spans. */
    readonly tip: Joint | null = null,
  ) {
    this.capture = new Capture(spanJoints);
    this.joints = tip ? [...spanJoints, tip] : spanJoints;
  }

  get length() {
    return this.path.length;
  }

  /** The frame at arc-length t in the current pose (each span follows its joint), rigid on that span's joint. */
  at(t: number) {
    const tangent = this.path.tangentAt(t);
    const normal = this.frames.normalAt(t);
    const quat = new Quaternion().setFromRotationMatrix(
      new Matrix4().makeBasis(tangent.clone().cross(normal), tangent, normal),
    );
    return new ChainPoint(t, this.path.at(t), quat, this.jointAt(t), this.capture);
  }

  /**
   * Smooth weights at t: one joint mid-span, the two neighbours blended over ±25% of the shorter span around each
   * joint (how membranes on a chain bend).
   */
  weightsAt(t: number) {
    const L = this.path.length;
    const starts = this.ts.map((s) => s * L);
    return spanWeights(
      this.spanJoints,
      starts,
      t * L,
      (k) => 0.25 * Math.min(starts[k] - starts[k - 1], starts[k + 1] - starts[k]),
    );
  }

  /** The chain's curve in the current pose, with knots at the joints (a Path input: `along`, `membrane`, ...). */
  curve() {
    const count = Math.max(16, this.spanJoints.length * 8);
    const pts = Array.from({ length: count + 1 }, (_, i) => this.at(i / count).at);
    return smoothPath(
      pts,
      null,
      { indices: this.ts.map((t) => Math.round(t * count)) },
      false,
      rigid(this.spanJoints[0]),
    );
  }

  /** The joint whose current bone segment passes closest to `p`. */
  nearestJoint(p: PointInput) {
    const q = toPoint(p, "nearestJoint()");
    const ends = [...this.spanJoints.map((joint) => joint.at), this.at(1).at];
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < this.spanJoints.length; i++) {
      const seg = ends[i + 1].clone().sub(ends[i]);
      const f = Math.min(Math.max(q.clone().sub(ends[i]).dot(seg) / Math.max(seg.lengthSq(), 1e-12), 0), 1);
      const d = ends[i].clone().addScaledVector(seg, f).distanceToSquared(q);
      if (d < bestD) [best, bestD] = [i, d];
    }
    return this.spanJoints[best];
  }

  /** The joint whose span contains t. */
  jointAt(t: number) {
    let i = 0;
    while (i < this.spanJoints.length - 1 && this.ts[i + 1] <= t) i++;
    return this.spanJoints[i];
  }

  /** [t0, t1] of joint i's span. */
  span(i: number) {
    return [this.ts[i], this.ts[i + 1]] as const;
  }
}

export function createChain(ctx: Ctx, name: string, source: PathInput, options: ChainOptions) {
  const path = toPath(source);
  const parent = boneFor(ctx, options.parent, [path], path.at(0));
  const frames = path.frames(options.up, options.twist);
  const { names } = options;
  const nameOf = (i: number) =>
    names === undefined ? `${name}${i + 1}` : typeof names === "function" ? names(i) : names[i];
  const ts = options.count ? Array.from({ length: options.count + 1 }, (_, i) => i / options.count!) : path.knots;
  if (ts.length < 2) throw new Error(`Chain "${name}" needs at least one span`);
  const spans = ts.length - 1;
  if (Array.isArray(names) && names.length !== spans && names.length !== spans + 1)
    throw new Error(
      `Chain "${name}" has ${spans} spans between its ${spans + 1} points, so it takes ${spans} names ` +
        `(one joint per span) or ${spans + 1} (the last one a tip joint at the path's end), not ${names.length}`,
    );
  const joints: Joint[] = [];
  for (let i = 0; i < spans; i++) {
    const at = path.at(ts[i]);
    joints.push(
      createJoint(ctx, nameOf(i), {
        parent: i === 0 ? parent : joints[i - 1],
        at,
        aim: path.at(ts[i + 1]),
        up: frames.normalAt(ts[i]),
        group: options.group,
      }),
    );
  }
  const tip =
    Array.isArray(names) && names.length === spans + 1
      ? createJoint(ctx, names[spans], {
          parent: joints[spans - 1],
          at: path.at(1),
          dir: path.tangentAt(1, true),
          up: frames.normalAt(1),
          group: options.group,
        })
      : null;
  const chain = new Chain(name, path, frames, ts, joints, tip);
  const { role } = options;
  if (role) {
    const contact = options.contact ? toPoint(options.contact, "chain()") : role === "leg" ? path.at(1) : null;
    const last = joints[joints.length - 1];
    ctx.rig.push(() => ({
      chain: {
        name,
        role,
        side: sideOf(joints),
        joints: chain.joints.map((joint) => joint.name),
        ...(contact ? { contact: tuple(contact.clone().applyMatrix4(chain.capture.motion(last))) } : {}),
      },
    }));
  }
  return chain;
}
```

## src/sugar.ts

```ts
// Shapes over `sweep()` (and `chain()` for sprout). None of these has its own geometry code. Every endpoint is a
// Point input, so a rod can run from an eye to a joint; the tube belongs to the first endpoint's bone.
import { boneFor } from "./context";
import type { Ctx } from "./context";
import { toDirection, toFrame, toPoint } from "./math";
import type { DirectionInput, FrameInput, PointInput } from "./math";
import { catmull, Path, polyline, toPath } from "./path";
import type { PathInput } from "./path";
import { createChain } from "./skeleton";
import type { ChainOptions } from "./skeleton";
import { interpolate, radiusFn, sweep } from "./sweep";
import type { Radius, SweepOptions } from "./sweep";

/** Straight tube with flat ends. `r` = radius or [r0, r1] taper. */
export function rod(
  ctx: Ctx,
  a: PointInput,
  b: PointInput,
  r: number | readonly [number, number],
  options: SweepOptions = {},
) {
  return sweep(ctx, [a, b], r, { caps: "flat", ...options });
}

/** Straight tube with round ends (a tapered capsule when r = [r0, r1]). */
export function capsule(
  ctx: Ctx,
  a: PointInput,
  b: PointInput,
  r: number | readonly [number, number],
  options: SweepOptions = {},
) {
  return sweep(ctx, [a, b], r, { caps: "round", ...options });
}

/**
 * Cone from `base` (radius r) to a point. `len` number: `dirOrTip` is a direction (a frame gives its facing axis,
 * so `spike(hit, hit, len, r)` stands on a surface); `len` null: `dirOrTip` is the tip point.
 */
export function spike(
  ctx: Ctx,
  base: PointInput,
  dirOrTip: PointInput,
  len: number | null,
  r: number,
  options: SweepOptions = {},
) {
  const tip =
    len === null
      ? toPoint(dirOrTip, "spike()")
      : toPoint(base, "spike()").addScaledVector(toDirection(dirOrTip as DirectionInput, "spike()").normalize(), len);
  return sweep(ctx, [base, tip], [r, 0], { caps: { start: "flat", end: "point" }, ...options });
}

/** Box tube from a to b: full width (side) × height (up) going from [w0, h0] to [w1, h1]. Roll from `up`. */
export function frustumBox(
  ctx: Ctx,
  a: PointInput,
  b: PointInput,
  [w0, h0]: readonly [number, number],
  [w1, h1]: readonly [number, number],
  options: SweepOptions = {},
) {
  return sweep(ctx, [a, b], (t) => [(w0 + (w1 - w0) * t) / 2, (h0 + (h1 - h0) * t) / 2], {
    section: "box",
    caps: "flat",
    ...options,
  });
}

export type Station = { at: PointInput; w: number; h: number };

/**
 * Smooth body through station centres (catmull), full width/height interpolated between stations.
 * `bone` (a chain, or a list of chains and joints the body runs through) skins it as one mesh bending at each joint.
 */
export function loft(ctx: Ctx, stations: readonly Station[], options: SweepOptions = {}) {
  const path = catmull(stations.map((s) => s.at));
  const ts = path.knots;
  const ws = stations.map((s) => s.w / 2);
  const hs = stations.map((s) => s.h / 2);
  return sweep(ctx, path, (t) => [interpolate(ts, ws, t), interpolate(ts, hs, t)], options);
}

export type SproutOptions = Omit<SweepOptions, "bone" | "extend"> &
  Pick<ChainOptions, "names" | "twist" | "role" | "contact"> & {
    /** Joints along the appendage (default: one per knot span); 0 = no joints, the tube rides on the root's bone. */
    count?: number;
    /** How far the root runs back into the parent volume, along the start tangent (default: the root radius). */
    bury?: number;
  };

/**
 * An appendage (limb, horn, tentacle, neck) rooted on another volume at a frame: a surface hit, a tube point, a
 * part, a joint. `pathOrTip` is a tip point (straight out) or a path (prefixed with the frame's point when it starts
 * elsewhere). The first joint sits at the frame's point, parented to its bone (else the nearest joint); the tube's
 * root continues `bury` back into the parent so it never floats. A single joint takes the sprout's own name.
 */
export function sprout(
  ctx: Ctx,
  name: string,
  on: FrameInput,
  pathOrTip: PathInput | PointInput,
  radius: Radius,
  options: SproutOptions = {},
) {
  const { count, bury, names, role, contact, ...rest } = options;
  const root = toFrame(on);
  const start = root.at;
  const parent = boneFor(ctx, undefined, [root], start);
  const isPath =
    pathOrTip instanceof Path ||
    (Array.isArray(pathOrTip) ? typeof pathOrTip[0] !== "number" : "curve" in (pathOrTip as object));
  const given = isPath
    ? toPath(pathOrTip as PathInput)
    : polyline([start, toPoint(pathOrTip as PointInput, "sprout()")]);
  const path = given.at(0).distanceTo(start) > 1e-6 ? polyline([start, given.at(0)]).concat(given) : given;
  const joints = count ?? path.knots.length - 1;
  const chain =
    count === 0
      ? null
      : createChain(ctx, name, path, {
          parent,
          count,
          names: names ?? (joints === 1 ? [name] : undefined),
          role,
          contact,
          twist: rest.twist,
          up: rest.up,
          group: rest.group,
        });
  const sweepOptions = {
    name,
    ...rest,
    bone: parent,
    extend: [bury ?? Math.max(...radiusFn(radius)(0)), 0] as const,
  };
  return { chain, sweep: sweep(ctx, chain ?? path, radius, sweepOptions) };
}
```

## src/surface.ts

```ts
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
```

## src/sweep.ts

```ts
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
 * A section drawn per ring instead of scaled from a unit shape (see `src/experimental/contour.ts`). The polygon of a
 * ring is its own list of vertices in meters, in the section axes (x along the binormal, y along the normal), around
 * the path point.
 */
export interface Contour {
  /** Vertices per ring by default (`sides` on the sweep wins); the polygon rounds it to a multiple of 4, at least 8. */
  readonly sides: number;
  /** Smooth normals by default. */
  readonly smooth: boolean;
  /** Reach of the section at source t: [right (+x), left (-x), front (+y), back (-y)] in meters. */
  reach(t: number): readonly [number, number, number, number];
  /** Numbers that change linearly where the section does: rings are dropped between rings that agree on them. */
  keys(t: number): readonly number[];
  /** Source t where the section changes fast: a ring always stands there. */
  readonly knots: readonly number[];
  /** The section's vertices at source t: `sides` of them, counter-clockwise from the upper left, faces on the axes. */
  polygon(t: number, sides: number): Array<[number, number]>;
}

/**
 * number | [r0, r1] (linear) | number[] (evenly keyed over the swept range, smooth) | (t) => number | (t) => [rx, ry]
 * with t in source t (see `from`). rx runs along the binormal (side), ry along the normal (up). For "box", these are
 * half extents.
 */
export type Radius = number | readonly number[] | ((t: number) => number | readonly [number, number]) | Contour;

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

type Shape = { pts: Array<[number, number]>; smooth: boolean; contour?: Contour };
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
  /** A contoured section: every ring carries its own polygon. */
  contour: Contour | null;
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
  /** A contour's vertices at this ring (meters, section axes) and its `keys`. */
  poly?: Array<[number, number]>;
  key?: readonly number[];
};
/** A clock interval in degrees (a0 < a1) with its colour; null = the piece colour. */
type Arc = { a0: number; a1: number; color: Fill | null };

const CORNER_SPLIT = 20 * (Math.PI / 180);
/** Ring spacing: at most one step round the section (360° / sides, 8 sides at least) of turn or roll between rings. */
const turnLimit = (sides: number) => (2 * Math.PI) / Math.max(sides, 8);
/** Closest spacing of rings along a tube, as a share of the edge length around it (unless a joint or cut needs one). */
const RING_GAP = 0.7;
/** Farthest a chord between rings may stray from the path, as a share of the local radius (0.15 × the widest at least). */
const SAG = 0.5;

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
  if (isContour(radius))
    return (t) => {
      const [right, left, front, back] = radius.reach(t);
      return [Math.max(right, left), Math.max(front, back)];
    };
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

const isContour = (radius: Radius): radius is Contour => typeof radius === "object" && "polygon" in radius;

/** The shape of a contoured tube: only its vertex count and shading matter, every ring carries its own polygon. */
function contourShape(contour: Contour, sides: number, t: number): Shape {
  return { pts: contour.polygon(t, sides), smooth: contour.smooth, contour };
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

/** A ring's polygon in meters around its centre: a contour's own vertices, else the section shape scaled by the radii. */
function polygonOf(shape: Shape, f: Frame, scale = 1): Array<[number, number]> {
  if (f.poly) return f.poly.map(([x, y]) => [x * scale, y * scale]);
  const r = [f.r[0] * scale, f.r[1] * scale];
  return shape.pts.map(([x, y]) => [x * r[0], y * r[1]]);
}

/** Where a ray from the section centre along (dx, dy) (binormal, normal components) meets the built polygon `pts`. */
function sectionPoint(
  shape: Shape,
  pts: ReadonlyArray<readonly [number, number]>,
  r: [number, number],
  dx: number,
  dy: number,
) {
  if (Math.max(r[0], r[1]) < 1e-9) return { x: 0, y: 0, nx: dx, ny: dy };
  const count = pts.length;
  for (let k = 0; k < count; k++) {
    const vx = pts[k][0];
    const vy = pts[k][1];
    const ex = pts[(k + 1) % count][0] - vx;
    const ey = pts[(k + 1) % count][1] - vy;
    const denom = dx * ey - dy * ex;
    if (Math.abs(denom) < 1e-12) continue;
    const lambda = (vx * ey - vy * ex) / denom;
    const mu = (vx * dy - vy * dx) / denom;
    if (lambda <= 0 || mu < -1e-9 || mu > 1 + 1e-9) continue;
    const x = dx * lambda;
    const y = dy * lambda;
    let nx = ey;
    let ny = -ex;
    if (shape.smooth && shape.contour) {
      // Vertex normals (the mean of the two faces at a vertex), blended along the face.
      const face = (i: number) => {
        const a = pts[(i + count) % count];
        const c = pts[(i + 1 + count) % count];
        const l = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
        return [(c[1] - a[1]) / l, -(c[0] - a[0]) / l];
      };
      const vertex = (i: number) => {
        const [ax, ay] = face(i - 1);
        const [bx, by] = face(i);
        const l = Math.hypot(ax + bx, ay + by) || 1;
        return [(ax + bx) / l, (ay + by) / l];
      };
      const [ax, ay] = vertex(k);
      const [bx, by] = vertex(k + 1);
      nx = ax + (bx - ax) * mu;
      ny = ay + (by - ay) * mu;
    } else if (shape.smooth) {
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
    ...(tube.contour ? { poly: tube.contour.polygon(t, tube.shape.pts.length), key: tube.contour.keys(t) } : {}),
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
  const q = sectionPoint(tube.shape, polygonOf(tube.shape, f), f.r, Math.cos(phi), Math.sin(phi));
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
    const points = [...item.spanJoints.map((joint) => joint.at), item.at(1).at];
    const ends = points.map((p) => path.closestT(p));
    const forward = ends[ends.length - 1] >= ends[0];
    item.spanJoints.forEach((joint, i) => {
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
  const contour = isContour(radius) ? radius : null;
  const shape = contour
    ? contourShape(contour, options.sides ?? ctx.segments(contour.sides, detail), from)
    : sectionShape(options.section ?? "circle", options.sides ?? ctx.segments(8, detail));
  const sides = shape.pts.length;
  const maxTurn = turnLimit(sides);
  const smooth = options.smooth ?? shape.smooth;
  const closed = path.closed && from === 0 && to === 1;
  const seamIn = path.tangentAt(1, true);
  const seamOut = path.tangentAt(0);
  const seamSmooth = closed && seamIn.angleTo(seamOut) <= CORNER_SPLIT;
  const corners = path.corners(from, to);
  const keyed = radiusFn(radius);
  const rOf = typeof radius === "function" || contour ? keyed : (t: number) => keyed(toU(t));
  const rMaxAt = (t: number) => Math.max(...rOf(Math.min(Math.max(t, from), to)));

  // Bones: joint spans in source t (a chain source's own joints, or `bone` as chains and joints laid onto the path),
  // else one fixed set of weights for the whole tube (the path's own, or `bone`).
  const owner = options.bone;
  const spans = chain
    ? chain.spanJoints.map((joint, i) => ({ joint, t: chain.ts[i] }))
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
    contour,
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
    const pts = polygonOf(shape, f, scale);
    if (indexed(arc)) return pts.map(([x, y]) => point(x, y));
    // A full ring with edge vertices runs once round from the first edge angle and closes on its first vertex.
    const full = isFull(arc);
    const [a0, a1] = full ? [splitDegs[0], splitDegs[0] + 360] : [arc.a0, arc.a1];
    // Increasing polar angle (the winding of full rings) runs from the arc's clock end to its clock start.
    const p0 = f.ref - a1 * DEG;
    const p1 = f.ref - a0 * DEG;
    const wrap = (phi: number) => p0 + ((((phi - p0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
    const boundary = (phi: number) => {
      const q = sectionPoint(shape, pts, r, Math.cos(phi), Math.sin(phi));
      return point(q.x, q.y);
    };
    const inside = [
      ...pts.map(([x, y]) => ({
        phi: wrap(Math.atan2(y, x)),
        make: () => point(x, y),
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
    /** A contour's dome polygon: scaled toward the centre, and inside the continuing tube's polygon when given. */
    const shrunk = (scale: number, within?: Array<[number, number]>): Array<[number, number]> =>
      f.poly!.map(([x, y], k) => {
        if (!within) return [x * scale, y * scale];
        const hold = (v: number, limit: number) => Math.sign(v) * Math.min(Math.abs(v), Math.abs(limit));
        return [hold(x * scale, within[k][0]), hold(y * scale, within[k][1])];
      });
    const dome = (d: number, scale: number): Frame => {
      const c = f.c.clone().addScaledVector(f.T, sign * d);
      if (!inside) return { ...f, c, r: [f.r[0] * scale, f.r[1] * scale], ...(f.poly ? { poly: shrunk(scale) } : {}) };
      const u = Math.min(Math.max(f.t + (sign * d) / span, 0), 1);
      const [rx, ry] = tube.radius(toT(u));
      const s = tube.shift(toT(u));
      c.addScaledVector(f.B, s[0] - f.s[0]).addScaledVector(f.N, s[1] - f.s[1]);
      const held = f.poly ? { poly: shrunk(scale, tube.contour!.polygon(toT(u), sides)) } : {};
      return { ...f, c, r: [Math.min(f.r[0] * scale, rx), Math.min(f.r[1] * scale, ry)], ...held };
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
  const tags = { name: options.name, kind: "sweep", group: options.group };
  const span = (to - from) * L;
  // Smooth skin: rings at the edges and centre of every joint's blend window, so the bend has a middle. Where the
  // window is narrower than the ring gap (a thick body on short spans), the middle ring alone.
  const windowUs = rigidSkin
    ? []
    : jointUs.flatMap((u, i) => {
        const w = half(i + 1);
        const wide = w >= (RING_GAP * 2 * Math.PI * rMaxAt(boneTs[i + 1])) / sides;
        return (wide ? [-1, 0, 1] : [0]).map((f) => u + (f * w) / span);
      });
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
    const knotUs = contour ? contour.knots.map(toU) : [];
    const mandatory = new Set([...smallCorners, ...windowUs.filter(inPiece), ...knotUs.filter(inPiece)]);
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
    const keys = (f: Frame) => [...f.r, ...f.s, ...(f.key ?? [])];
    // Rings are never closer than about the edge length around the tube, so bends, tapers and joints don't clump.
    const gap = (f: Frame) => (RING_GAP * 2 * Math.PI * Math.max(...f.r)) / sides;
    const fits = (k: number, j: number) => {
      if ((cand[j].t - cand[k].t) * span < gap(cand[k])) return true;
      if (cand[k].T.angleTo(cand[j].T) > maxTurn || cand[k].N.angleTo(cand[j].N) > maxTurn) return false;
      const [ka, kb] = [keys(cand[k]), keys(cand[j])];
      const chord = cand[j].c.clone().sub(cand[k].c);
      const chordSq = Math.max(chord.lengthSq(), 1e-18);
      for (let m = k + 1; m < j; m++) {
        const s = (cand[m].t - cand[k].t) / (cand[j].t - cand[k].t);
        const km = keys(cand[m]);
        for (let axis = 0; axis < km.length; axis++)
          if (Math.abs(km[axis] - (ka[axis] + (kb[axis] - ka[axis]) * s)) > tol) return false;
        // A thin tube still follows its path: the chord between rings strays at most half its radius from it.
        const off = cand[m].c.clone().sub(cand[k].c);
        const stray = off.addScaledVector(chord, -off.dot(chord) / chordSq).length();
        if (stray > SAG * Math.max(Math.min(...cand[m].r), 0.15 * rmax)) return false;
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
```

## src/texture.ts

```ts
// `svg()`: an SVG drawing as a texture for cards and textured parts. The drawing is rasterised by the browser (the
// showcase and the creature-lab harness both run in one); under Node the texture keeps its size and markup and stays
// blank. Transparent pixels cut the surface away, so a drawn leaf on a card is a leaf.
import {
  Color,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NearestFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import { dilate } from "./bake";

/** Longest side of the raster, in pixels, when `svg()` gets no `size`. */
const DEFAULT_SIZE = 256;

/**
 * A texture drawn from SVG markup. The drawing fills the texture: its left edge is u = 0, its bottom edge v = 0.
 * `size` is the longest side of the raster in pixels (default 256, 8 to 2048); the other side keeps the drawing's
 * aspect (its `viewBox`, else `width`/`height`). Reuse one texture for many cards and parts: each distinct texture
 * takes its own space in the creature's texture atlas. `pixelated` draws the SVG with crisp (unantialiased) edges
 * and magnifies it without smoothing, so every raster pixel shows as a hard-edged square.
 */
export function svg(markup: string, options: { size?: number; pixelated?: boolean } = {}) {
  const open = /<svg\b[^>]*>/i.exec(markup);
  if (!open) throw new Error("svg(): the markup has no <svg> element");
  const attr = (name: string) => new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(open[0])?.[1];
  const box = attr("viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const [w, h] =
    box?.length === 4 && box[2] > 0 && box[3] > 0
      ? [box[2], box[3]]
      : [parseFloat(attr("width") ?? ""), parseFloat(attr("height") ?? "")];
  if (!(w > 0 && h > 0)) throw new Error("svg(): give the <svg> a viewBox (or width and height) so it has a size");
  const side = Math.min(Math.max(Math.round(options.size ?? DEFAULT_SIZE), 8), 2048);
  const width = Math.max(1, Math.round(w >= h ? side : (side * w) / h));
  const height = Math.max(1, Math.round(h >= w ? side : (side * h) / w));
  const tag = open[0]
    .replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, "")
    .replace(
      /^<svg\b/i,
      `<svg width="${width}" height="${height}"${/\sxmlns\s*=/.test(open[0]) ? "" : ' xmlns="http://www.w3.org/2000/svg"'}${options.pixelated && !/\sshape-rendering\s*=/i.test(open[0]) ? ' shape-rendering="crispEdges"' : ""}`,
    );
  const source = markup.replace(open[0], tag);

  const data = new Uint8Array(width * height * 4);
  const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
  texture.name = "svg";
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = options.pixelated ? NearestFilter : LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.userData.svg = markup;
  texture.userData.coloured = inColour(markup);
  if (typeof document === "undefined") return texture;

  const parsed = new DOMParser().parseFromString(source, "image/svg+xml");
  const error = parsed.querySelector("parsererror");
  if (error) throw new Error(`svg(): the markup is not valid SVG: ${error.textContent?.trim().split("\n")[0] ?? ""}`);
  const image = new Image(width, height);
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  texture.userData.ready = image
    .decode()
    .catch(() => {
      throw new Error(`svg(): the browser could not draw this SVG (${markup.slice(0, 80)}…)`);
    })
    .then(() => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      // Texture rows run bottom-up (v = 0 at the bottom); canvas rows run top-down.
      const row = width * 4;
      for (let y = 0; y < height; y++) data.set(pixels.subarray((height - 1 - y) * row, (height - y) * row), y * row);
      const filled = new Uint8Array(width * height);
      for (let i = 0; i < filled.length; i++) filled[i] = data[i * 4 + 3] > 0 ? 1 : 0;
      dilate(data, filled, width, height, 8);
      texture.needsUpdate = true;
    });
  return texture;
}

/**
 * Whether a drawing uses any colour beyond greys (white to black), read from its fill, stroke and stop colours.
 * A textured part tints a grey drawing by its `color` and shows a coloured drawing as drawn.
 */
function inColour(markup: string) {
  const color = new Color();
  for (const [, , value] of markup.matchAll(
    /(fill|stroke|stop-color|flood-color|color)\s*(?:=\s*["']|:)\s*([^"';>]+)/gi,
  )) {
    const token = value.trim().toLowerCase();
    const hex = /^#([0-9a-f]{3,8})$/.exec(token)?.[1];
    const [a = "0", b = "0", c] = token.match(/-?[\d.]+%?/g) ?? [];
    const unit = (v: string, full: number) => (v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v) / full);
    if (hex) {
      const six = hex.length < 6 ? [...hex.slice(0, 3)].map((ch) => ch + ch).join("") : hex.slice(0, 6);
      color.setHex(parseInt(six, 16), SRGBColorSpace);
    } else if (token in Color.NAMES) color.setHex(Color.NAMES[token as keyof typeof Color.NAMES], SRGBColorSpace);
    else if (/^rgba?\(/.test(token) && c) color.setRGB(unit(a, 255), unit(b, 255), unit(c, 255), SRGBColorSpace);
    else if (/^hsla?\(/.test(token) && c)
      color.setHSL((parseFloat(a) / 360) % 1, unit(b, 100), unit(c, 100), SRGBColorSpace);
    else continue;
    const rgb = color.getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
    if (Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b) > 0.03) return true;
  }
  return false;
}
```
