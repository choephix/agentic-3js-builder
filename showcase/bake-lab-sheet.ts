// Bake lab (experiment): src/bake.ts's bakeSheet split into steps so a host can schedule it. `pack` lays the charts
// out and writes every painted mesh's uv; `bake` paints the full sheet as a generator that yields between batches of
// triangles and rows of dilation; `preview` paints the same layout at 1/k resolution. With k = 1 the arithmetic is
// bakeSheet's, so the page checks the final sheets byte for byte against a normal build.
import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  Vector3,
} from "three";
import type { BufferAttribute } from "three";
import type { Painted } from "../src/bake";

const PAD = 4;
const MAX_DENSITY = 4000;

type Chart = Painted["charts"][number];
export type Layout = {
  charts: Array<{ entry: Painted; chart: Chart }>;
  at: Array<[number, number]>;
  density: number;
  width: number;
  height: number;
};
export type Sheet = { data: Uint8Array; width: number; height: number };

type Packing = { at: Array<[number, number]>; used: number };

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

/** bakeSheet's packing: places every chart and writes each painted mesh's `uv`. */
export function pack(painted: readonly Painted[], side: number): Layout {
  const charts = painted.flatMap((entry) => entry.charts.map((chart) => ({ entry, chart })));
  const area = charts.reduce(
    (sum, { chart }) => sum + Math.max(chart.size[0], 1e-4) * Math.max(chart.size[1], 1e-4),
    0,
  );
  let density = Math.min(Math.sqrt((0.7 * side * side) / Math.max(area, 1e-9)), MAX_DENSITY);
  let packed: Packing | null = null;
  for (let attempt = 0; attempt < 60 && !packed; attempt++) {
    const sizes = charts.map(({ chart }): [number, number] => [
      Math.ceil(chart.size[0] * density) + 1 + 2 * PAD,
      Math.ceil(chart.size[1] * density) + 1 + 2 * PAD,
    ]);
    packed = shelfPack(sizes, side, side);
    if (!packed) density *= 0.92;
  }
  if (!packed) throw new Error("paint: the painted parts could not be packed into one sheet");
  const width = side;
  const height = Math.max(4, Math.ceil(packed.used / 4) * 4);
  charts.forEach(({ entry, chart }, ci) => {
    const [ox, oy] = packed.at[ci];
    const uv = entry.mesh.geometry.getAttribute("uv") as BufferAttribute;
    for (const id of new Set(chart.tris))
      uv.setXY(
        id,
        (ox + PAD + 0.5 + (entry.flat[id * 2] - chart.min[0]) * density) / width,
        (oy + PAD + 0.5 + (entry.flat[id * 2 + 1] - chart.min[1]) * density) / height,
      );
    uv.needsUpdate = true;
  });
  return { charts, at: packed.at, density, width, height };
}

/** bakeSheet's texel loop, with every texel coordinate scaled by `scale`; yields every few thousand texels. */
function* raster(layout: Layout, scale: number, width: number, height: number, data: Uint8Array, filled: Uint8Array) {
  const { density } = layout;
  const p = new Vector3();
  const n = new Vector3();
  let since = 0;
  for (let ci = 0; ci < layout.charts.length; ci++) {
    const { entry, chart } = layout.charts[ci];
    const [ox, oy] = layout.at[ci];
    const { world, normal } = entry;
    const px = (id: number) => (ox + PAD + 0.5 + (entry.flat[id * 2] - chart.min[0]) * density) * scale;
    const py = (id: number) => (oy + PAD + 0.5 + (entry.flat[id * 2 + 1] - chart.min[1]) * density) * scale;
    for (let t = 0; t < chart.tris.length; t += 3) {
      const ids = [chart.tris[t], chart.tris[t + 1], chart.tris[t + 2]];
      const [a, b, c] = [ids[0] * 3, ids[1] * 3, ids[2] * 3];
      const xs = ids.map(px);
      const ys = ids.map(py);
      const ss = entry.surface ? ids.map((id) => [entry.surface![id * 2], entry.surface![id * 2 + 1]]) : null;
      if (ss && entry.wrap) for (let k = 1; k < 3; k++) ss[k][1] += 360 * Math.round((ss[0][1] - ss[k][1]) / 360);
      const det = (ys[1] - ys[2]) * (xs[0] - xs[2]) + (xs[2] - xs[1]) * (ys[0] - ys[2]);
      if (Math.abs(det) < 1e-9) continue;
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
          p.x += (world[a] * w0) / sum;
          p.y += (world[a + 1] * w0) / sum;
          p.z += (world[a + 2] * w0) / sum;
          p.x += (world[b] * w1) / sum;
          p.y += (world[b + 1] * w1) / sum;
          p.z += (world[b + 2] * w1) / sum;
          p.x += (world[c] * w2) / sum;
          p.y += (world[c + 1] * w2) / sum;
          p.z += (world[c + 2] * w2) / sum;
          n.x += normal[a] * w0;
          n.y += normal[a + 1] * w0;
          n.z += normal[a + 2] * w0;
          n.x += normal[b] * w1;
          n.y += normal[b + 1] * w1;
          n.z += normal[b + 2] * w1;
          n.x += normal[c] * w2;
          n.y += normal[c + 1] * w2;
          n.z += normal[c + 2] * w2;
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
      since += (x1 - x0 + 1) * (y1 - y0 + 1);
      if (since >= 4096) {
        since = 0;
        yield;
      }
    }
  }
}

/** src/bake.ts's dilate, yielding every 64 rows (a pass reads only texels filled before it). */
function* dilate(data: Uint8Array, filled: Uint8Array, width: number, height: number, passes: number) {
  for (let pass = 0; pass < passes; pass++) {
    const grown: number[] = [];
    for (let y = 0; y < height; y++) {
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
      if (y % 64 === 63) yield;
    }
    if (!grown.length) return;
    for (const i of grown) filled[i] = 1;
  }
}

function* paintSheet(layout: Layout, k: number): Generator<void, Sheet> {
  const width = layout.width / k;
  const height = layout.height / k;
  const data = new Uint8Array(width * height * 4);
  const filled = new Uint8Array(width * height);
  yield* raster(layout, 1 / k, width, height, data, filled);
  yield* dilate(data, filled, width, height, Math.ceil(PAD / k) + (k > 1 ? 1 : 0));
  for (let i = 3; i < data.length; i += 4) data[i] = 255;
  return { data, width, height };
}

/** The full sheet, step by step: drive it with `next()` until done. */
export const bake = (layout: Layout) => paintSheet(layout, 1);

/** The same layout at 1/k resolution; k is 2 or 4, which divide every sheet side. */
export const preview = (layout: Layout, k: number) => drain(paintSheet(layout, k));

export function drain<T>(steps: Generator<void, T>): T {
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

/** A sheet as bakeSheet's texture. */
export function sheetTexture({ data, width, height }: Sheet) {
  const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
  texture.name = "paint";
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
