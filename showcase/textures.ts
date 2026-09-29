// The Textures panel. The live sample's textures (the paint sheet, SVG drawings, any other map), each drawn v up over
// a checkerboard with the UV wireframes of the parts that use it; and the texture atlas of the latest harness render,
// the one image the exported GLBs carry, with its tiles outlined.
import type { Texture } from "three";
import { h } from "./dom";
import type { Inspection, Part } from "./inspect";
import { loadReport } from "./renders";
import type { Placed, Snapshot } from "./renders";

export type TexturesActions = {
  select: (index: number) => void;
  lightbox: (items: Array<{ url: string; caption: string }>, index: number) => void;
};

export type TexturesView = {
  element: HTMLElement;
  /** Draw this part's UVs (a part index), or none, on top of the others. */
  highlight: (part: number | null) => void;
};

/** Longest side of the UV overlay, in canvas pixels. */
const OVERLAY = 1024;
const WIRE = "rgba(0, 95, 184, 0.45)";
const HOT = "#ff5b1f";

/** What made a texture, from its name: the paint sheet, an SVG drawing, or anything else. */
const kindOf = (name: string) =>
  name === "paint" ? "Paint sheet" : name === "svg" ? "SVG drawing" : name || "Texture";

/** A readable name: what made it, then its number among the sample's textures. */
export function textureLabel(texture: Texture, index: number) {
  return `${kindOf(texture.name)} ${index + 1}`;
}

type Picture = { data?: ArrayLike<number>; width: number; height: number };

/** Draw a texture into `canvas` at its own size, v up (the top row is v = 1), once its pixels are in. */
async function paintTexture(texture: Texture, canvas: HTMLCanvasElement) {
  await Promise.resolve(texture.userData.ready).catch(() => undefined);
  const image = texture.image as (Picture & Partial<CanvasImageSource>) | null;
  if (!image?.width || !image.height) return;
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d")!;
  // With flipY, the first stored row (or the top of an image) is v = 1; without it, v = 0.
  if (image.data) {
    const pixels = new ImageData(image.width, image.height);
    const row = image.width * 4;
    for (let y = 0; y < image.height; y++) {
      const from = (texture.flipY ? y : image.height - 1 - y) * row;
      for (let i = 0; i < row; i++) pixels.data[y * row + i] = image.data[from + i];
    }
    context.putImageData(pixels, 0, 0);
  } else {
    if (!texture.flipY) context.setTransform(1, 0, 0, -1, 0, image.height);
    context.drawImage(image as CanvasImageSource, 0, 0, image.width, image.height);
  }
}

/** The triangles of `parts` in UV space as one path on `context` (w × h pixels, v up). */
function traceUvs(context: CanvasRenderingContext2D, parts: readonly Part[], w: number, h: number) {
  context.beginPath();
  for (const part of parts) {
    const geometry = part.mesh.geometry;
    const uv = geometry.getAttribute("uv");
    if (!uv) continue;
    const index = geometry.index;
    const count = index ? index.count : uv.count;
    const at = (i: number) => (index ? index.getX(i) : i);
    for (let i = 0; i + 2 < count; i += 3) {
      const [a, b, c] = [at(i), at(i + 1), at(i + 2)];
      context.moveTo(uv.getX(a) * w, (1 - uv.getY(a)) * h);
      context.lineTo(uv.getX(b) * w, (1 - uv.getY(b)) * h);
      context.lineTo(uv.getX(c) * w, (1 - uv.getY(c)) * h);
      context.closePath();
    }
  }
}

export function texturesPanel(
  info: Inspection,
  selected: number,
  latest: Snapshot | undefined,
  actions: TexturesActions,
): TexturesView {
  const body = h("div", { class: "textures" });
  let highlight: (part: number | null) => void = () => {};

  if (!info.textures.length)
    body.append(h("section", null, h("p", { class: "muted" }, "No textures: flat colours only.")));
  else {
    const current = Math.min(Math.max(selected, 0), info.textures.length - 1);
    const users = (texture: Texture) => info.parts.filter((part) => part.map === texture);

    // Every texture as a thumbnail.
    body.append(
      h(
        "section",
        null,
        h("h3", null, `Textures · ${info.textures.length}`),
        h(
          "div",
          { class: "tex-grid" },
          ...info.textures.map((texture, i) => {
            const canvas = h("canvas", { class: "tex-canvas" });
            void paintTexture(texture, canvas);
            const picture = texture.image as Picture | null;
            return h(
              "button",
              {
                class: `tex-thumb${i === current ? " on" : ""}`,
                onclick: () => actions.select(i),
                "data-tip":
                  typeof texture.userData.svg === "string" ? String(texture.userData.svg).slice(0, 240) : undefined,
              },
              h("span", { class: "tex-frame" }, canvas),
              h("span", { class: "name" }, textureLabel(texture, i)),
              h("span", { class: "muted" }, picture ? `${picture.width} × ${picture.height}` : ""),
            );
          }),
        ),
      ),
    );

    // The selected texture, large, with every using part's UVs over it.
    const texture = info.textures[current];
    const parts = users(texture);
    const picture = canvasPair();
    const tints = [
      ...new Set(
        parts.map((part) => (part.mesh.geometry.getAttribute("color") ? "vertex colours" : (part.color ?? "#ffffff"))),
      ),
    ];
    void paintTexture(texture, picture.image).then(() => {
      const { width, height } = picture.image;
      const scale = OVERLAY / Math.max(width, height, 1);
      picture.overlay.width = Math.round(width * scale);
      picture.overlay.height = Math.round(height * scale);
      picture.frame.style.aspectRatio = `${width} / ${height}`;
      highlight(null);
    });
    highlight = (hot) => {
      const { overlay } = picture;
      const context = overlay.getContext("2d")!;
      context.clearRect(0, 0, overlay.width, overlay.height);
      context.lineWidth = Math.max(1, overlay.width / 420);
      context.lineJoin = "round";
      traceUvs(context, parts, overlay.width, overlay.height);
      context.strokeStyle = WIRE;
      context.stroke();
      const focus = parts.find((part) => part.index === hot);
      if (!focus) return;
      traceUvs(context, [focus], overlay.width, overlay.height);
      context.fillStyle = "rgba(255, 91, 31, 0.25)";
      context.fill();
      context.lineWidth *= 1.6;
      context.strokeStyle = HOT;
      context.stroke();
    };
    picture.frame.onclick = () =>
      actions.lightbox(
        [
          { url: picture.image.toDataURL("image/png"), caption: textureLabel(texture, current) },
          { url: composite(picture), caption: `${textureLabel(texture, current)} with UVs` },
        ],
        0,
      );
    body.append(
      h(
        "section",
        null,
        h("h3", null, textureLabel(texture, current)),
        h(
          "div",
          { class: "nums" },
          h(
            "span",
            null,
            `${(texture.image as Picture | null)?.width ?? "?"} × ${(texture.image as Picture | null)?.height ?? "?"} px`,
          ),
          h("span", null, `${parts.length} part${parts.length === 1 ? "" : "s"}`),
          h(
            "span",
            null,
            "tint ",
            ...tints.map((tint) =>
              tint.startsWith("#")
                ? h("span", { class: "swatch", style: `background:${tint}`, "data-tip": tint })
                : h("span", { class: "muted" }, tint),
            ),
          ),
        ),
        picture.frame,
        h("p", { class: "muted small" }, "UVs of the parts using it; hover a part to single it out. Click to enlarge."),
        h(
          "div",
          { class: "rows table" },
          ...parts.map((part) =>
            h(
              "button",
              { class: "part-row", "data-focus": `part:${part.index}` },
              h("span", { class: "swatch", style: `background:${part.color ?? "#ccc"}` }),
              h("span", { class: "name" }, part.name),
              h("span", { class: "muted" }, part.bone ?? "—"),
              h("span", { class: "muted" }, part.group),
              h("span", { class: "muted num" }, part.triangles),
            ),
          ),
        ),
      ),
    );
  }

  body.append(atlasSection(latest, actions));
  return { element: body, highlight: (part) => highlight(part) };
}

/** An image canvas with a UV overlay canvas on top, in a checkerboard frame. */
function canvasPair() {
  const image = h("canvas", { class: "tex-canvas" });
  const overlay = h("canvas", { class: "tex-overlay" });
  const frame = h("div", { class: "tex-view" }, image, overlay);
  return { image, overlay, frame };
}

/** The texture with its UV overlay, as one PNG for the lightbox. */
function composite({ image, overlay }: { image: HTMLCanvasElement; overlay: HTMLCanvasElement }) {
  const canvas = h("canvas");
  canvas.width = overlay.width;
  canvas.height = overlay.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  context.drawImage(overlay, 0, 0);
  return canvas.toDataURL("image/png");
}

/** The latest render's atlas with its tiles outlined and listed; hovering a row outlines that tile. */
function atlasSection(latest: Snapshot | undefined, actions: TexturesActions) {
  const section = h("section", null, h("h3", null, latest ? `Atlas · ${latest.tag}` : "Atlas"));
  const shot = latest?.shots.find((entry) => entry.name === "atlas");
  if (!latest || !shot) {
    section.append(
      h(
        "p",
        { class: "muted" },
        latest
          ? `Render ${latest.tag} predates atlas images; the next \`npm run snap\` saves one.`
          : "No render yet: `npm run snap` saves the atlas the GLBs carry.",
      ),
    );
    return section;
  }
  const image = h("img", { src: shot.url, alt: "texture atlas", class: "tex-canvas" });
  const overlay = h("canvas", { class: "tex-overlay" });
  const frame = h("div", { class: "tex-view" }, image, overlay);
  frame.onclick = () => actions.lightbox([{ url: shot.url, caption: `Texture atlas · ${latest.tag}` }], 0);
  const rows = h("div", { class: "rows table" });
  section.append(
    frame,
    h(
      "p",
      { class: "muted small" },
      "The one texture of the exported GLBs: flat colour cells and every tinted texture, padded.",
    ),
    rows,
  );
  void loadReport(latest.report, latest.time).then((report) => {
    const atlas = report?.atlas;
    const layout = atlas?.layout;
    if (!atlas || !layout) return;
    overlay.width = overlay.height = OVERLAY;
    const scale = OVERLAY / atlas.size;
    const tiles: Array<{ label: string; tint: string | null; place: Placed }> = [
      { label: `Flat colours · ${report.colors}`, tint: null, place: layout.colors },
      ...layout.textures.map((tile, i) => ({
        label: `${kindOf(tile.texture.split(":")[0])} · tile ${i + 1}`,
        tint: tile.tint,
        place: tile,
      })),
    ];
    const draw = (hot: number | null) => {
      const context = overlay.getContext("2d")!;
      context.clearRect(0, 0, OVERLAY, OVERLAY);
      tiles.forEach(({ place }, i) => {
        // Layout y runs up from the bottom; the picture's rows run down from the top.
        const top = (atlas.size - place.y - place.h) * scale;
        context.lineWidth = i === hot ? 5 : 2;
        context.strokeStyle = i === hot ? HOT : WIRE;
        context.strokeRect(place.x * scale, top, place.w * scale, place.h * scale);
      });
    };
    draw(null);
    rows.replaceChildren(
      ...tiles.map(({ label, tint, place }, i) =>
        h(
          "div",
          { class: "part-row", onmouseenter: () => draw(i), onmouseleave: () => draw(null) },
          tint ? h("span", { class: "swatch", style: `background:${tint}`, "data-tip": `tint ${tint}` }) : h("span"),
          h("span", { class: "name" }, label),
          h("span", { class: "muted num" }, `${place.w} × ${place.h}`),
        ),
      ),
    );
    section.querySelector("h3")!.textContent = `Atlas · ${latest.tag} · ${atlas.size} px`;
  });
  return section;
}
