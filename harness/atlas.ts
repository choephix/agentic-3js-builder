// The one texture of an assembled creature, packed like a sprite sheet: a block of flat colour cells (flat parts
// point every UV at their cell's centre), every texture the builder used, each tinted by its material colour, and
// the paint sheet's charts one by one rather than the sheet as a whole. Textures get their edge pixels repeated into
// a gutter so filtering and mip levels never reach a neighbour; charts bring their own dilated padding. The atlas is
// a power-of-two square or a 2:1 rectangle, whichever is smallest. Rows run bottom-up: row 0 is v = 0, which is how
// three reads a texture with flipY off and how glTF stores it.
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
 * rest of the texture is left out.
 */
export type TileSource = { key: string; texture: Texture; tint: string; rects?: Placed[] };
/** A tile's texels in the atlas (x, y from the bottom-left corner). */
export type Placed = { x: number; y: number; w: number; h: number };
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

/** Shelf-pack rectangles, each with its own gutter, into width × height; null when they don't fit. */
function pack(sizes: Array<{ w: number; h: number; gutter: number }>, width: number, height: number) {
  const order = sizes
    .map((_, i) => i)
    .sort((i, j) => sizes[j].h + 2 * sizes[j].gutter - sizes[i].h - 2 * sizes[i].gutter);
  const at: Array<[number, number]> = new Array(sizes.length);
  let x = 0;
  let y = 0;
  let shelf = 0;
  for (const i of order) {
    const { gutter } = sizes[i];
    const w = sizes[i].w + 2 * gutter;
    const h = sizes[i].h + 2 * gutter;
    if (w > width) return null;
    if (x + w > width) {
      y += shelf;
      x = 0;
      shelf = 0;
    }
    if (y + h > height) return null;
    at[i] = [x + gutter, y + gutter];
    x += w;
    shelf = Math.max(shelf, h);
  }
  return at;
}

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
  // Every tile before merging duplicates: a whole texture, or each of its rects. Rects bring their own padding.
  const pieces = sources.flatMap((source, i) =>
    source.rects
      ? source.rects.map((rect) => ({ source: i, tile: crop(whole[i], rect), gutter: 0 }))
      : [{ source: i, tile: whole[i], gutter: GUTTER }],
  );
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
  let placed: Array<[number, number]> | null = null;
  let scaled = tiles.map(({ tile }) => tile);
  for (; !placed; halvings++) {
    scaled = tiles.map(({ tile }) => (halvings ? shrink(tile, halvings) : tile));
    const sizes = [block, ...scaled.map((tile, i) => ({ w: tile.width, h: tile.height, gutter: tiles[i].gutter }))];
    for (const [w, h] of SHAPES) {
      placed = pack(sizes, w, h);
      if (placed) {
        [width, height] = [w, h];
        break;
      }
    }
  }

  const data = new Uint8Array(width * height * 4);
  const [bx, by] = placed[0];
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

  const placedTiles = scaled.map((tile, i) => {
    const [x, y] = placed![i + 1];
    blit(data, width, height, tile, x, y, tile.width, tile.height, tiles[i].gutter);
    return { x, y, w: tile.width, h: tile.height };
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
