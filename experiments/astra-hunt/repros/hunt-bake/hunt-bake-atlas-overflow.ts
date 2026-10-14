import { DataTexture, RGBAFormat, UnsignedByteType } from "three";
import { buildAtlas } from "../../../../harness/atlas";

const count = 60_000;
const sources = [];
for (let i = 0; i < count; i++) {
  const bytes = new Uint8Array([i & 255, (i >> 8) & 255, (i >> 16) & 255, 255]);
  const texture = new DataTexture(bytes, 1, 1, RGBAFormat, UnsignedByteType);
  texture.needsUpdate = true;
  sources.push({ key: `tile${i}`, texture, tint: "#ffffff" });
}
const started = Date.now();
try {
  const atlas = await buildAtlas([], sources);
  console.log(JSON.stringify({ elapsedMs: Date.now() - started, size: atlas.size, packed: atlas.packed }));
} catch (error) {
  console.log(JSON.stringify({ elapsedMs: Date.now() - started, error: String(error) }));
}
