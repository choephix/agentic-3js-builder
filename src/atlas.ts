// Atlas for the SDK's pack step, used by apps, the harness and GLB export.
// The one texture of an assembled creature, packed like a sprite sheet: a block of flat colour cells (flat parts
// point every UV at their cell's centre), every texture the builder used, each tinted by its material colour, and
// the paint sheet's charts one by one rather than the sheet as a whole. Textures get their edge pixels repeated into
// a gutter so filtering and mip levels never reach a neighbour; charts bring their own dilated padding. A chart is
// stored at the lowest resolution its content survives (a flat chart as one texel). Tiles are packed with MaxRects,
// turned a quarter where that fits better, into the smallest power-of-two square or 2:1 rectangle. Rows run
// bottom-up: row 0 is v = 0, which is how three reads a texture with flipY off and how glTF stores it.
import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NearestFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import type { Texture } from "three";

/**
 * A texture as a material uses it: tinted by the material colour. `key` is unique per (texture, tint). With
 * `rects` (a paint sheet's charts, already padded), each rectangle of the texture is packed as its own tile and the
 * rest of the texture is left out; `triangles` (u, v pairs, three per triangle) are the parts' triangles on it, which
 * say which texels of a chart are ever sampled.
 */
export type TileSource = { key: string; texture: Texture; tint: string; rects?: Placed[]; triangles?: number[] };
/**
 * A tile's texels in the atlas (x, y from the bottom-left corner, w × h as placed). A `rotated` tile is its source
 * turned a quarter clockwise: the source's bottom edge runs down its left side.
 */
export type Placed = { x: number; y: number; w: number; h: number; rotated?: boolean };

/**
 * The atlas UV of a point inside `tile`, given as fractions (fx, fy) of its source texture or rect, for an atlas of
 * width × height texels.
 */
export function tileUv(tile: Placed, fx: number, fy: number, width: number, height: number): [number, number] {
  const [u, v] = tile.rotated ? [fy, 1 - fx] : [fx, fy];
  return [(tile.x + u * tile.w) / width, (tile.y + v * tile.h) / height];
}
export type Atlas = {
  texture: DataTexture;
  width: number;
  height: number;
  /** UV of each flat colour's cell centre. */
  colorUv: Map<string, [number, number]>;
  /**
   * Every source key's tiles: one for a whole texture, one per rectangle for a source with `rects`, in order.
   * Sources whose tinted pixels are identical share one tile (aliases, as in TexturePacker).
   */
  tiles: Map<string, Placed[]>;
  /** Tiles actually packed, after duplicates are merged. */
  packed: number;
  /** The flat colour cells. */
  block: Placed;
  /** Some tile has transparent texels, so the material cuts them away (alphaTest). */
  alpha: boolean;
};

const CELL = 16;
const GUTTER = 8;
const MIN_SIZE = 256;
const MAX_SIZE = 4096;

type Pixels = { data: Uint8ClampedArray; width: number; height: number; alpha: boolean };

const toLinear = Array.from({ length: 256 }, (_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});
const toSrgb = (l: number) => Math.round(255 * (l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055));

/** The texture's RGBA, bottom-up rows, multiplied by `tint` the way three multiplies map and colour (in linear). */
async function pixels(texture: Texture, tint: string): Promise<Pixels> {
  await (texture.userData.ready as Promise<unknown> | undefined);
  const image = texture.image as
    | ({ data?: ArrayLike<number>; width: number; height: number } & Partial<CanvasImageSource>)
    | null;
  if (!image || !image.width || !image.height)
    throw new Error(`Texture "${texture.name || texture.uuid}" has no image`);
  const { width, height } = image;
  let data: Uint8ClampedArray;
  if (image.data) {
    if (texture.format !== RGBAFormat || texture.type !== UnsignedByteType || image.data.length !== width * height * 4)
      throw new Error(`Texture "${texture.name || texture.uuid}": data textures must be RGBA, 8 bits per channel`);
    data = Uint8ClampedArray.from(image.data);
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    context.drawImage(image as CanvasImageSource, 0, 0, width, height);
    data = context.getImageData(0, 0, width, height).data;
  }
  // With flipY, the first stored row is the top of the texture (v = 1).
  if (texture.flipY) {
    const row = width * 4;
    const flipped = new Uint8ClampedArray(data.length);
    for (let y = 0; y < height; y++) flipped.set(data.subarray((height - 1 - y) * row, (height - y) * row), y * row);
    data = flipped;
  }
  const hex = Number.parseInt(tint.slice(1), 16);
  const tints = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map((c) => toLinear[c]);
  if (tints.some((t) => t < 0.9999)) {
    for (let i = 0; i < data.length; i += 4)
      for (let k = 0; k < 3; k++) data[i + k] = toSrgb(toLinear[data[i + k]] * tints[k]);
  }
  let alpha = false;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) alpha = true;
  if (alpha) dilate(data, width, height, GUTTER);
  return { data, width, height, alpha };
}

/** Spread opaque colours into fully transparent texels, `passes` deep, so filtered cut-out edges keep their colour. */
function dilate(data: Uint8ClampedArray, width: number, height: number, passes: number) {
  const filled = new Uint8Array(width * height);
  for (let i = 0; i < filled.length; i++) filled[i] = data[i * 4 + 3] > 0 ? 1 : 0;
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
            if (xx < 0 || yy < 0 || xx >= width || yy >= height || !filled[yy * width + xx]) continue;
            const j = (yy * width + xx) * 4;
            r += data[j];
            g += data[j + 1];
            b += data[j + 2];
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

/** The `rect` of `tile` as a tile of its own. */
function crop(tile: Pixels, rect: Placed): Pixels {
  const data = new Uint8ClampedArray(rect.w * rect.h * 4);
  for (let y = 0; y < rect.h; y++) {
    const from = ((rect.y + y) * tile.width + rect.x) * 4;
    data.set(tile.data.subarray(from, from + rect.w * 4), y * rect.w * 4);
  }
  let alpha = false;
  for (let i = 3; i < data.length && !alpha; i += 4) if (data[i] < 255) alpha = true;
  return { data, width: rect.w, height: rect.h, alpha };
}

/** Halve a tile `times` times by averaging 2×2 blocks. */
function shrink(tile: Pixels, times: number): Pixels {
  let { data, width, height } = tile;
  for (let k = 0; k < times && (width > 1 || height > 1); k++) {
    const w = Math.max(1, width >> 1);
    const h = Math.max(1, height >> 1);
    const out = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        for (let c = 0; c < 4; c++) {
          let sum = 0;
          let n = 0;
          for (let dy = 0; dy < 2; dy++)
            for (let dx = 0; dx < 2; dx++) {
              const sx = Math.min(x * 2 + dx, width - 1);
              const sy = Math.min(y * 2 + dy, height - 1);
              sum += data[(sy * width + sx) * 4 + c];
              n++;
            }
          out[(y * w + x) * 4 + c] = sum / n;
        }
    data = out;
    width = w;
    height = h;
  }
  return { data, width, height, alpha: tile.alpha };
}

/** Largest difference, per channel out of 255, a chart may show when stored smaller and stretched back. */
const CHART_TOLERANCE = 2;
/** The gutter a chart stored smaller gets back: the 4 texels of padding it had on the paint sheet. */
const CHART_GUTTER = 4;

/**
 * Whether `small`, stretched over `full` the way the UVs stretch it (bilinear, texel centres mapped proportionally),
 * stays within CHART_TOLERANCE of `full` at every texel where `covered` is set.
 */
function survives(full: Pixels, small: Pixels, covered: Uint8Array) {
  const sx = small.width / full.width;
  const sy = small.height / full.height;
  const s = small.data;
  for (let y = 0; y < full.height; y++) {
    const fy = Math.min(Math.max((y + 0.5) * sy - 0.5, 0), small.height - 1);
    const y0 = Math.floor(fy);
    const ty = fy - y0;
    const row0 = y0 * small.width;
    const row1 = Math.min(y0 + 1, small.height - 1) * small.width;
    for (let x = 0; x < full.width; x++) {
      if (!covered[y * full.width + x]) continue;
      const fx = Math.min(Math.max((x + 0.5) * sx - 0.5, 0), small.width - 1);
      const x0 = Math.floor(fx);
      const tx = fx - x0;
      const x1 = Math.min(x0 + 1, small.width - 1);
      const a = (row0 + x0) * 4;
      const b = (row0 + x1) * 4;
      const c = (row1 + x0) * 4;
      const d = (row1 + x1) * 4;
      const at = (y * full.width + x) * 4;
      for (let k = 0; k < 4; k++) {
        const value = (s[a + k] * (1 - tx) + s[b + k] * tx) * (1 - ty) + (s[c + k] * (1 - tx) + s[d + k] * tx) * ty;
        if (Math.abs(value - full.data[at + k]) > CHART_TOLERANCE) return false;
      }
    }
  }
  return true;
}

/**
 * The texels of a width × height texture that `triangles` (u, v pairs, three per triangle) can sample at full
 * resolution: each triangle rasterised at texel centres, grown by 2 texels for bilinear filtering and for edge
 * texels whose centre falls just outside. Mip levels sample the stored tile's own smaller levels, so they need nothing
 * more.
 */
function coverage(triangles: number[], width: number, height: number) {
  const mask = new Uint8Array(width * height);
  for (let t = 0; t < triangles.length; t += 6) {
    const [ax, ay, bx, by, cx, cy] = [0, 1, 2, 3, 4, 5].map((k) => triangles[t + k] * (k % 2 ? height : width));
    const det = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    const x0 = Math.max(Math.floor(Math.min(ax, bx, cx)), 0);
    const x1 = Math.min(Math.ceil(Math.max(ax, bx, cx)), width - 1);
    const y0 = Math.max(Math.floor(Math.min(ay, by, cy)), 0);
    const y1 = Math.min(Math.ceil(Math.max(ay, by, cy)), height - 1);
    // Triangles thinner than a texel cover no texel centre: their corners and centre still sample.
    for (const [px, py] of [
      [ax, ay],
      [bx, by],
      [cx, cy],
      [(ax + bx + cx) / 3, (ay + by + cy) / 3],
    ])
      mask[
        Math.min(Math.max(Math.floor(py), 0), height - 1) * width + Math.min(Math.max(Math.floor(px), 0), width - 1)
      ] = 1;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        // A degenerate triangle marks its bounding box; the growth below covers the rest.
        if (Math.abs(det) > 1e-9) {
          const px = x + 0.5;
          const py = y + 0.5;
          const w0 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / det;
          const w1 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / det;
          if (w0 < 0 || w1 < 0 || w0 + w1 > 1) continue;
        }
        mask[y * width + x] = 1;
      }
  }
  // Grow by a square of 2 texels: rows, then columns.
  const reach = 2;
  const rows = new Uint8Array(mask.length);
  for (let y = 0; y < height; y++)
    for (let x = 0, last = -Infinity; x < width + reach; x++) {
      if (x < width && mask[y * width + x]) last = x;
      const at = x - reach;
      if (at >= 0 && at < width && x - last <= 2 * reach) rows[y * width + at] = 1;
    }
  const grown = new Uint8Array(mask.length);
  for (let x = 0; x < width; x++)
    for (let y = 0, last = -Infinity; y < height + reach; y++) {
      if (y < height && rows[y * width + x]) last = y;
      const at = y - reach;
      if (at >= 0 && at < height && y - last <= 2 * reach) grown[at * width + x] = 1;
    }
  return grown;
}

/**
 * A chart at the lowest resolution its content survives where it is sampled (`covered`, one byte per texel):
 * halved while the result stays within CHART_TOLERANCE of the original there, down to one texel for a flat colour.
 * Texels never sampled take the chart's mean colour first, so halving doesn't pull in the sheet's empty black.
 * Returns the tile and whether it shrank.
 */
function adapt(chart: Pixels, covered: Uint8Array): { tile: Pixels; shrunk: boolean } {
  const sum = [0, 0, 0];
  let count = 0;
  let flat = true;
  let first = -1;
  for (let i = 0; i < covered.length; i++) {
    if (!covered[i]) continue;
    if (first < 0) first = i * 4;
    for (let k = 0; k < 3; k++) {
      sum[k] += chart.data[i * 4 + k];
      flat &&= chart.data[i * 4 + k] === chart.data[first + k];
    }
    count++;
  }
  // A chart nothing samples is left as it is.
  if (!count) return { tile: chart, shrunk: false };
  if (flat) {
    const colour = Array.from(chart.data.subarray(first, first + 3));
    return {
      tile: { data: Uint8ClampedArray.from([...colour, 255]), width: 1, height: 1, alpha: false },
      shrunk: true,
    };
  }
  const filled: Pixels = { ...chart, data: Uint8ClampedArray.from(chart.data) };
  for (let i = 0; i < covered.length; i++)
    if (!covered[i]) for (let k = 0; k < 3; k++) filled.data[i * 4 + k] = sum[k] / count;
  let tile = filled;
  while (tile.width > 1 || tile.height > 1) {
    const next = shrink(tile, 1);
    if (!survives(filled, next, covered)) break;
    tile = next;
  }
  return tile === filled ? { tile: chart, shrunk: false } : { tile, shrunk: true };
}

/** The tile turned a quarter clockwise (see `Placed`). */
function rotate(tile: Pixels): Pixels {
  const { width, height } = tile;
  const data = new Uint8ClampedArray(tile.data.length);
  // Placed texel (px, py) shows source texel (width - 1 - py, px).
  for (let py = 0; py < width; py++)
    for (let px = 0; px < height; px++) {
      const from = (px * width + (width - 1 - py)) * 4;
      data.set(tile.data.subarray(from, from + 4), (py * height + px) * 4);
    }
  return { data, width: height, height: width, alpha: tile.alpha };
}

type Rect = { x: number; y: number; w: number; h: number };
type Rule = "shortSide" | "area" | "bottomLeft";

/**
 * MaxRects (Jylänki, "A Thousand Ways to Pack the Bin"): keep every maximal free rectangle, put each footprint where
 * `rule` scores best, turned a quarter when that scores better, and split the free rectangles it overlaps. Returns
 * each footprint's corner and turn, or null when one doesn't fit.
 */
function maxRects(sizes: Array<{ w: number; h: number }>, order: number[], width: number, height: number, rule: Rule) {
  let free: Rect[] = [{ x: 0, y: 0, w: width, h: height }];
  const at: Array<{ x: number; y: number; rotated: boolean }> = new Array(sizes.length);
  for (const i of order) {
    let best: { x: number; y: number; rotated: boolean } | null = null;
    let bestScore = [Infinity, Infinity];
    for (const f of free)
      for (const rotated of sizes[i].w === sizes[i].h ? [false] : [false, true]) {
        const [w, h] = rotated ? [sizes[i].h, sizes[i].w] : [sizes[i].w, sizes[i].h];
        if (w > f.w || h > f.h) continue;
        const short = Math.min(f.w - w, f.h - h);
        const long = Math.max(f.w - w, f.h - h);
        const score =
          rule === "shortSide" ? [short, long] : rule === "area" ? [f.w * f.h - w * h, short] : [f.y + h, f.x];
        if (score[0] < bestScore[0] || (score[0] === bestScore[0] && score[1] < bestScore[1])) {
          bestScore = score;
          best = { x: f.x, y: f.y, rotated };
        }
      }
    if (!best) return null;
    at[i] = best;
    const [w, h] = best.rotated ? [sizes[i].h, sizes[i].w] : [sizes[i].w, sizes[i].h];
    const placed = { x: best.x, y: best.y, w, h };
    const kept: Rect[] = [];
    const added: Rect[] = [];
    for (const f of free) {
      if (placed.x >= f.x + f.w || placed.x + placed.w <= f.x || placed.y >= f.y + f.h || placed.y + placed.h <= f.y) {
        kept.push(f);
        continue;
      }
      if (placed.x > f.x) added.push({ x: f.x, y: f.y, w: placed.x - f.x, h: f.h });
      if (placed.x + placed.w < f.x + f.w)
        added.push({ x: placed.x + placed.w, y: f.y, w: f.x + f.w - placed.x - placed.w, h: f.h });
      if (placed.y > f.y) added.push({ x: f.x, y: f.y, w: f.w, h: placed.y - f.y });
      if (placed.y + placed.h < f.y + f.h)
        added.push({ x: f.x, y: placed.y + placed.h, w: f.w, h: f.y + f.h - placed.y - placed.h });
    }
    // The free rectangles that didn't touch the placement contain none of each other already; only the new ones
    // can sit inside another rectangle.
    const inside = (a: Rect, b: Rect) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
    const fresh = added.filter(
      (a, k) =>
        !kept.some((b) => inside(a, b)) && !added.some((b, j) => j !== k && inside(a, b) && (!inside(b, a) || j < k)),
    );
    free = kept.concat(fresh);
  }
  return at;
}

/** The ways tried for each atlas shape, in order: three sort orders by three placement rules. */
const TRIES: Array<{ sort: (a: { w: number; h: number }, b: { w: number; h: number }) => number; rule: Rule }> = [];
for (const sort of [
  (a: { w: number; h: number }, b: { w: number; h: number }) => b.w * b.h - a.w * a.h,
  (a: { w: number; h: number }, b: { w: number; h: number }) => Math.max(b.w, b.h) - Math.max(a.w, a.h),
  (a: { w: number; h: number }, b: { w: number; h: number }) => b.h - a.h,
])
  for (const rule of ["shortSide", "area", "bottomLeft"] as const) TRIES.push({ sort, rule });

/** Atlas shapes from smallest to largest: power-of-two squares and 2:1 rectangles, MIN_SIZE to MAX_SIZE a side. */
const SHAPES: Array<[number, number]> = [];
for (let side = MIN_SIZE; side <= MAX_SIZE; side *= 2) {
  if (side / 2 >= MIN_SIZE) SHAPES.push([side, side / 2]);
  SHAPES.push([side, side]);
}

/** FNV-1a over a tile's size and texels, to find candidate duplicates; equal hashes are confirmed byte by byte. */
function hashOf(tile: Pixels) {
  let h = (2166136261 ^ tile.width ^ (tile.height << 16)) >>> 0;
  for (let i = 0; i < tile.data.length; i++) h = Math.imul(h ^ tile.data[i], 16777619) >>> 0;
  return h;
}

export async function buildAtlas(colors: string[], sources: TileSource[]): Promise<Atlas> {
  const whole = await Promise.all(sources.map((source) => pixels(source.texture, source.tint)));
  // Every tile before merging duplicates: a whole texture, or each of its rects. A rect at full size brings its own
  // padding; one stored smaller gets a gutter back.
  const pieces = sources.flatMap((source, i) => {
    if (!source.rects) return [{ source: i, tile: whole[i], gutter: GUTTER }];
    const mask = coverage(source.triangles ?? [], whole[i].width, whole[i].height);
    return source.rects.map((rect) => {
      const covered = new Uint8Array(rect.w * rect.h);
      for (let y = 0; y < rect.h; y++)
        covered.set(
          mask.subarray((rect.y + y) * whole[i].width + rect.x, (rect.y + y) * whole[i].width + rect.x + rect.w),
          y * rect.w,
        );
      const { tile, shrunk } = adapt(crop(whole[i], rect), covered);
      return { source: i, tile, gutter: shrunk ? CHART_GUTTER : 0 };
    });
  });
  // Identical tinted pixels pack once: `slot[i]` is piece i's index into `tiles`.
  const tiles: Array<{ tile: Pixels; gutter: number }> = [];
  const byHash = new Map<number, number[]>();
  const slot = pieces.map(({ tile, gutter }) => {
    const hash = hashOf(tile);
    const candidates = byHash.get(hash) ?? [];
    const found = candidates.find((index) => {
      const other = tiles[index];
      return (
        other.gutter === gutter &&
        other.tile.width === tile.width &&
        other.tile.height === tile.height &&
        other.tile.data.every((v, i) => v === tile.data[i])
      );
    });
    if (found !== undefined) return found;
    candidates.push(tiles.push({ tile, gutter }) - 1);
    byHash.set(hash, candidates);
    return tiles.length - 1;
  });
  const cells = Math.max(1, Math.ceil(Math.sqrt(colors.length)));
  const block = { w: cells * CELL, h: cells * CELL, gutter: GUTTER };
  let halvings = 0;
  let [width, height] = SHAPES[0];
  let placed: Array<{ x: number; y: number; rotated: boolean }> | null = null;
  let scaled = tiles.map(({ tile }) => tile);
  // Footprints: each tile with its gutter on every side; entry 0 is the colour block.
  let footprints: Array<{ w: number; h: number; gutter: number }> = [];
  for (; !placed; halvings++) {
    scaled = tiles.map(({ tile }) => (halvings ? shrink(tile, halvings) : tile));
    footprints = [block, ...scaled.map((tile, i) => ({ w: tile.width, h: tile.height, gutter: tiles[i].gutter }))].map(
      ({ w, h, gutter }) => ({ w: w + 2 * gutter, h: h + 2 * gutter, gutter }),
    );
    const area = footprints.reduce((sum, { w, h }) => sum + w * h, 0);
    for (const [w, h] of SHAPES) {
      if (w * h < area) continue;
      for (const { sort, rule } of TRIES) {
        const order = footprints.map((_, i) => i).sort((i, j) => sort(footprints[i], footprints[j]));
        placed = maxRects(footprints, order, w, h, rule);
        if (placed) break;
      }
      if (placed) {
        [width, height] = [w, h];
        break;
      }
    }
  }

  const data = new Uint8Array(width * height * 4);
  // Each footprint's content starts one gutter in from its corner; the colour block is square, so never turned.
  const corner = (i: number) => [placed![i].x + footprints[i].gutter, placed![i].y + footprints[i].gutter];
  const [bx, by] = corner(0);
  const colorUv = new Map<string, [number, number]>();
  colors.forEach((color, index) => {
    const hex = Number.parseInt(color.slice(1), 16);
    const x0 = bx + (index % cells) * CELL;
    const y0 = by + Math.floor(index / cells) * CELL;
    for (let y = y0; y < y0 + CELL; y++)
      for (let x = x0; x < x0 + CELL; x++)
        data.set([(hex >> 16) & 255, (hex >> 8) & 255, hex & 255, 255], (y * width + x) * 4);
    colorUv.set(color, [(x0 + CELL / 2) / width, (y0 + CELL / 2) / height]);
  });
  // The block's gutter repeats its edge cells.
  const empty = { data: new Uint8ClampedArray(0), width: 0, height: 0, alpha: false };
  blit(data, width, height, empty, bx, by, block.w, block.h, GUTTER);

  const placedTiles = scaled.map((source, i): Placed => {
    const [x, y] = corner(i + 1);
    const { rotated } = placed![i + 1];
    const tile = rotated ? rotate(source) : source;
    blit(data, width, height, tile, x, y, tile.width, tile.height, tiles[i].gutter);
    return rotated ? { x, y, w: tile.width, h: tile.height, rotated } : { x, y, w: tile.width, h: tile.height };
  });
  const tilesAt = new Map<string, Placed[]>(sources.map((source) => [source.key, []]));
  pieces.forEach((piece, i) => tilesAt.get(sources[piece.source].key)!.push(placedTiles[slot[i]]));

  const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
  texture.name = "atlas";
  texture.colorSpace = SRGBColorSpace;
  // One sampler for the whole atlas: a pixelated source texture (nearest magnification) makes it all pixelated.
  texture.magFilter = sources.some((source) => source.texture.magFilter === NearestFilter)
    ? NearestFilter
    : LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return {
    texture,
    width,
    height,
    colorUv,
    tiles: tilesAt,
    packed: tiles.length,
    block: { x: bx, y: by, w: block.w, h: block.h },
    alpha: tiles.some(({ tile }) => tile.alpha),
  };
}

/**
 * Copy `tile` to (x, y) and repeat its edge texels `gutter` deep around it. With an empty tile, only the gutter is
 * written, from the w × h texels already in the atlas at (x, y).
 */
function blit(
  data: Uint8Array,
  width: number,
  height: number,
  tile: Pixels,
  x: number,
  y: number,
  w: number,
  h: number,
  gutter: number,
) {
  const read = (sx: number, sy: number) =>
    tile.width ? (sy * tile.width + sx) * 4 : ((y + sy) * width + (x + sx)) * 4;
  const source = tile.width ? tile.data : data;
  for (let dy = -gutter; dy < h + gutter; dy++)
    for (let dx = -gutter; dx < w + gutter; dx++) {
      const inside = dx >= 0 && dy >= 0 && dx < w && dy < h;
      if (inside && !tile.width) continue;
      const tx = x + dx;
      const ty = y + dy;
      if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;
      const from = read(Math.min(Math.max(dx, 0), w - 1), Math.min(Math.max(dy, 0), h - 1));
      data.set(source.subarray(from, from + 4), (ty * width + tx) * 4);
    }
}
