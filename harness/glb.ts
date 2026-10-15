import type { DataTexture } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { createSkinnedMesh, createStaticMesh } from "./assemble";
import type { Assembly } from "./assemble";

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

/**
 * RGBA PNG of a data texture's rows as stored (row 0 on top, which is v = 0 in both three with flipY off and glTF).
 * Written by hand because a canvas premultiplies alpha and so blanks the colour of transparent texels, which the
 * atlas fills on purpose so filtered cut-out edges keep their colour.
 */
async function encodePng(image: { data: ArrayLike<number>; width: number; height: number }) {
  const { data, width, height } = image;
  const stride = width * 4 + 1;
  const raw = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++)
    raw.set(
      Uint8Array.from({ length: width * 4 }, (_, i) => data[y * width * 4 + i]),
      y * stride + 1,
    );
  const deflated = new Uint8Array(
    await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer(),
  );
  const chunk = (type: string, body: Uint8Array) => {
    const out = new Uint8Array(12 + body.length);
    const view = new DataView(out.buffer);
    view.setUint32(0, body.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(body, 8);
    let crc = 0xffffffff;
    for (let i = 4; i < 8 + body.length; i++) crc = CRC_TABLE[(crc ^ out[i]) & 255] ^ (crc >>> 8);
    view.setUint32(8 + body.length, (crc ^ 0xffffffff) >>> 0);
    return out;
  };
  const header = new Uint8Array(13);
  new DataView(header.buffer).setUint32(0, width);
  new DataView(header.buffer).setUint32(4, height);
  header.set([8, 6, 0, 0, 0], 8);
  const parts = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflated),
    chunk("IEND", new Uint8Array(0)),
  ];
  return new Blob(parts, { type: "image/png" });
}

/** The exporter's internals this harness reaches into to hand it the atlas PNG (three 0.185). */
type Writer = {
  json: { images?: Array<{ mimeType: string; bufferView?: number }> };
  cache: { images: Map<unknown, Record<string, number>> };
  pending: Array<Promise<unknown>>;
  processBufferViewImage(blob: Blob): Promise<number>;
};

export type GlbLabel = { slug: string; arm: string; tag: string; meta: unknown; rig: unknown };

/** The model as one GLB: the baked mesh with the atlas, skinned to its bones with `skeleton`, else static. */
export async function exportGlb(assembly: Assembly, skeleton: boolean, label: GlbLabel): Promise<ArrayBuffer> {
  const object = skeleton ? createSkinnedMesh(assembly, label.slug).mesh : createStaticMesh(assembly, label.slug);
  object.userData = {
    creatureLab: {
      slug: label.slug,
      arm: label.arm,
      tag: label.tag,
      meta: label.meta,
      parts: assembly.parts.map(({ index, name, group, bone, color, texture }) => ({
        index,
        name,
        group,
        bone,
        color,
        texture,
      })),
      textures: assembly.textures,
      groups: assembly.groups,
      note: "Vertex attribute _PART holds the index into parts[].",
      ...(skeleton ? { joints: assembly.joints.map(({ name, parent }) => ({ name, parent })), rig: label.rig } : {}),
    },
  };
  const atlas = assembly.material.map as DataTexture;
  const png = await encodePng(atlas.image as { data: Uint8Array; width: number; height: number });
  const exporter = new GLTFExporter().register((writer) => ({
    beforeParse() {
      const w = writer as unknown as Writer;
      const imageDef: { mimeType: string; bufferView?: number } = { mimeType: "image/png" };
      w.pending.push(w.processBufferViewImage(png).then((index) => (imageDef.bufferView = index)));
      w.json.images ??= [];
      w.cache.images.set(atlas.image, { [`image/png:flipY/${atlas.flipY}`]: w.json.images.push(imageDef) - 1 });
    },
  }));
  const result = await exporter.parseAsync(object, { binary: true });
  if (!(result instanceof ArrayBuffer)) throw new Error("GLB export did not produce a binary buffer");
  return result;
}
