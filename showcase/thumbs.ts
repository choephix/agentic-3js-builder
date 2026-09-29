// Sidebar thumbnails. The dev server keeps one image per sample, keyed by what the picture depends on (see
// `vite.config.mjs`); a missing or stale one is drawn here, one sample at a time, and posted back to be kept. The
// static site ships the images it was built with; there a missing or stale one is drawn for the visit only.
import type { SampleModule } from "./catalog";
import { inspect } from "./inspect";
import { Viewer } from "./viewer";

/** Edge in pixels: a sidebar column is about 128 CSS pixels, so this stays sharp on 2x screens. */
const SIZE = 256;
/** The render is twice the thumbnail and cropped to the sample, which the viewer frames with room to spare. */
const RENDER = 2 * SIZE;
/** Room around the cropped sample, as a share of its longer side. */
const MARGIN = 0.06;

type Kept = { key: string; fresh: boolean; url: string | null };

export class Thumbs {
  private index: Record<string, Kept> = {};
  /** Images drawn this visit that the server did not keep, by `slug/key`. */
  private readonly drawn = new Map<string, string>();
  private readonly queue: string[] = [];
  private running = false;
  private viewer: Viewer | null = null;

  constructor(
    private readonly load: (slug: string) => Promise<SampleModule>,
    private readonly onDrawn: (slug: string) => void,
  ) {}

  /** The newest image of a sample, stale or not; null until one exists. */
  url(slug: string) {
    const kept = this.index[slug];
    return (kept && this.drawn.get(`${slug}/${kept.key}`)) ?? kept?.url ?? null;
  }

  /** Reread which images the server keeps and whether they are fresh. */
  async reload() {
    this.index = await fetch("/__thumbs")
      .then((response) => (response.ok ? response.json() : {}))
      .catch(() => ({}));
  }

  /** Draw every missing or stale thumbnail among these samples, in this order, in the background. */
  update(slugs: readonly string[]) {
    for (const slug of slugs) if (this.stale(slug) && !this.queue.includes(slug)) this.queue.push(slug);
    void this.drain();
  }

  private stale(slug: string) {
    const kept = this.index[slug];
    return kept !== undefined && !kept.fresh && !this.drawn.has(`${slug}/${kept.key}`);
  }

  private async drain() {
    if (this.running) return;
    this.running = true;
    for (let slug = this.queue.shift(); slug !== undefined; slug = this.queue.shift()) {
      if (!this.stale(slug)) continue;
      // A sample that fails to build keeps its old image, or none; the list marks it once it is opened.
      if (await this.draw(slug, this.index[slug].key).catch(() => false)) this.onDrawn(slug);
      // Builds block the page; give input and the main viewer a turn between them.
      await new Promise((resolve) => setTimeout(resolve));
    }
    this.viewer?.show(null, null);
    this.running = false;
  }

  private async draw(slug: string, key: string) {
    const module = await this.load(slug);
    const root = module.default();
    if (!root?.isObject3D) return false;
    this.viewer ??= new Viewer(offscreenHost(), { pixelRatio: 1, grid: false });
    this.viewer.show(root, inspect(root));
    const image = await crop(await this.viewer.snapshot());
    const response = await fetch(`/__thumbs/${encodeURIComponent(slug)}/${key}`, {
      method: "POST",
      headers: { "Content-Type": image.type },
      body: image,
    }).catch(() => null);
    if (response?.ok) {
      const { url } = (await response.json()) as { url: string };
      this.index[slug] = { key, fresh: true, url };
      return true;
    }
    // The sample changed while it was drawn: the reload that change triggers queues it again.
    if (response?.status === 409) return false;
    // No server keeps images (the static site): this one lasts the visit.
    this.drawn.set(`${slug}/${key}`, URL.createObjectURL(image));
    return true;
  }
}

/** A square around the sample (pixels more than half opaque, so not its soft floor shadow), scaled to `SIZE`. */
function crop(frame: ImageBitmap) {
  const { width, height } = frame;
  const source = new OffscreenCanvas(width, height).getContext("2d")!;
  source.drawImage(frame, 0, 0);
  const alpha = source.getImageData(0, 0, width, height).data;
  let [left, top, right, bottom] = [width, height, 0, 0];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (alpha[(y * width + x) * 4 + 3] > 128) {
        left = Math.min(left, x);
        right = Math.max(right, x + 1);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y + 1);
      }
  if (right <= left) [left, top, right, bottom] = [0, 0, width, height];
  const side = Math.max(right - left, bottom - top) * (1 + 2 * MARGIN);
  const out = new OffscreenCanvas(SIZE, SIZE);
  const context = out.getContext("2d")!;
  context.imageSmoothingQuality = "high";
  context.drawImage(frame, (left + right - side) / 2, (top + bottom - side) / 2, side, side, 0, 0, SIZE, SIZE);
  frame.close();
  return out.convertToBlob({ type: "image/webp", quality: 0.9 });
}

/** A fixed-size box off the page for the thumbnail viewer's canvas. */
function offscreenHost() {
  const host = document.createElement("div");
  host.style.cssText = `position: fixed; left: ${-2 * RENDER}px; top: 0; width: ${RENDER}px; height: ${RENDER}px;`;
  host.setAttribute("aria-hidden", "true");
  document.body.append(host);
  return host;
}
