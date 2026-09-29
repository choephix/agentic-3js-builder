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
