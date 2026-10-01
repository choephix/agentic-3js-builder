// The one texture of an assembled creature, packed like a sprite sheet: a block of flat colour cells in a corner
// (flat parts point every UV at their cell's centre) and every texture the builder used, each tinted by its
// material colour, with its edge pixels repeated into a gutter so filtering and mip levels never reach a
// neighbour. Rows run bottom-up: row 0 is v = 0, which is how three reads a texture with flipY off and how glTF
// stores it.
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

/** A texture as a material uses it: tinted by the material colour. `key` is unique per (texture, tint). */
export type TileSource = { key: string; texture: Texture; tint: string };
/** A tile's texels in the atlas (x, y from the bottom-left corner). */
export type Placed = { x: number; y: number; w: number; h: number };
export type Atlas = {
  texture: DataTexture;
  size: number;
  /** UV of each flat colour's cell centre. */
  colorUv: Map<string, [number, number]>;
  /** Every source key's tile. Sources whose tinted pixels are identical share one tile (aliases, as in TexturePacker). */
  tiles: Map<string, Placed>;
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

/** Shelf-pack padded rectangles into a size × size square; null when they don't fit. */
function pack(sizes: Array<{ w: number; h: number }>, size: number) {
  const order = sizes.map((_, i) => i).sort((i, j) => sizes[j].h - sizes[i].h);
  const at: Array<[number, number]> = new Array(sizes.length);
  let x = 0;
  let y = 0;
  let shelf = 0;
  for (const i of order) {
    const w = sizes[i].w + 2 * GUTTER;
    const h = sizes[i].h + 2 * GUTTER;
    if (w > size) return null;
    if (x + w > size) {
      y += shelf;
      x = 0;
      shelf = 0;
    }
    if (y + h > size) return null;
    at[i] = [x + GUTTER, y + GUTTER];
    x += w;
    shelf = Math.max(shelf, h);
  }
  return at;
}

/** FNV-1a over a tile's size and texels, to find candidate duplicates; equal hashes are confirmed byte by byte. */
function hashOf(tile: Pixels) {
  let h = (2166136261 ^ tile.width ^ (tile.height << 16)) >>> 0;
  for (let i = 0; i < tile.data.length; i++) h = Math.imul(h ^ tile.data[i], 16777619) >>> 0;
  return h;
}

export async function buildAtlas(colors: string[], sources: TileSource[]): Promise<Atlas> {
  const all = await Promise.all(sources.map((source) => pixels(source.texture, source.tint)));
  // Identical tinted pixels pack once: `slot[i]` is source i's index into `tiles`.
  const tiles: Pixels[] = [];
  const byHash = new Map<number, number[]>();
  const slot = all.map((tile) => {
    const hash = hashOf(tile);
    const candidates = byHash.get(hash) ?? [];
    const found = candidates.find((index) => {
      const other = tiles[index];
      return (
        other.width === tile.width && other.height === tile.height && other.data.every((v, i) => v === tile.data[i])
      );
    });
    if (found !== undefined) return found;
    candidates.push(tiles.push(tile) - 1);
    byHash.set(hash, candidates);
    return tiles.length - 1;
  });
  const cells = Math.max(1, Math.ceil(Math.sqrt(colors.length)));
  const block = { w: cells * CELL, h: cells * CELL };
  let halvings = 0;
  let size = MIN_SIZE;
  let placed: Array<[number, number]> | null = null;
  let scaled = tiles;
  for (; !placed; halvings++) {
    scaled = halvings ? tiles.map((tile) => shrink(tile, halvings)) : tiles;
    const sizes = [block, ...scaled.map((tile) => ({ w: tile.width, h: tile.height }))];
    for (size = MIN_SIZE; size <= MAX_SIZE && !placed; size *= 2) placed = pack(sizes, size);
    size /= 2;
  }

  const data = new Uint8Array(size * size * 4);
  const [bx, by] = placed[0];
  const colorUv = new Map<string, [number, number]>();
  colors.forEach((color, index) => {
    const hex = Number.parseInt(color.slice(1), 16);
    const x0 = bx + (index % cells) * CELL;
    const y0 = by + Math.floor(index / cells) * CELL;
    for (let y = y0; y < y0 + CELL; y++)
      for (let x = x0; x < x0 + CELL; x++)
        data.set([(hex >> 16) & 255, (hex >> 8) & 255, hex & 255, 255], (y * size + x) * 4);
    colorUv.set(color, [(x0 + CELL / 2) / size, (y0 + CELL / 2) / size]);
  });
  // The block's gutter repeats its edge cells.
  blit(data, size, { data: new Uint8ClampedArray(0), width: 0, height: 0, alpha: false }, bx, by, block.w, block.h);

  const placedTiles = scaled.map((tile, i) => {
    const [x, y] = placed![i + 1];
    blit(data, size, tile, x, y, tile.width, tile.height);
    return { x, y, w: tile.width, h: tile.height };
  });
  const tilesAt = new Map<string, Placed>(sources.map((source, i) => [source.key, placedTiles[slot[i]]]));

  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
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
    size,
    colorUv,
    tiles: tilesAt,
    packed: tiles.length,
    block: { x: bx, y: by, w: block.w, h: block.h },
    alpha: tiles.some((tile) => tile.alpha),
  };
}

/**
 * Copy `tile` to (x, y) and repeat its edge texels GUTTER deep around it. With an empty tile, only the gutter is
 * written, from the w × h texels already in the atlas at (x, y).
 */
function blit(data: Uint8Array, size: number, tile: Pixels, x: number, y: number, w: number, h: number) {
  const read = (sx: number, sy: number) => (tile.width ? (sy * tile.width + sx) * 4 : ((y + sy) * size + (x + sx)) * 4);
  const source = tile.width ? tile.data : data;
  for (let dy = -GUTTER; dy < h + GUTTER; dy++)
    for (let dx = -GUTTER; dx < w + GUTTER; dx++) {
      const inside = dx >= 0 && dy >= 0 && dx < w && dy < h;
      if (inside && !tile.width) continue;
      const tx = x + dx;
      const ty = y + dy;
      if (tx < 0 || ty < 0 || tx >= size || ty >= size) continue;
      const from = read(Math.min(Math.max(dx, 0), w - 1), Math.min(Math.max(dy, 0), h - 1));
      data.set(source.subarray(from, from + 4), (ty * size + tx) * 4);
    }
}
