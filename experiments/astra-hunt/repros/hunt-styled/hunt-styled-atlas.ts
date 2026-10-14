import { NearestFilter } from "three";
import { pixelArt, pixelTexture } from "../../../../kits/pixel";
import { svg } from "../../../../src/texture";
import { buildAtlas } from "../../../../harness/atlas";
const P = { k: "#111111", w: "#ffffff", r: "#e00020" };
const a = pixelArt(["kk", "ww"], P);
const b = pixelArt(["kk", "ww"], P);
const c = pixelTexture(4, 2, (g) => g.fill(() => "#808080"));
const d = svg('<svg viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#e00020"/></svg>', { size: 64 });
const atlas = await buildAtlas(["#112233", "#445566"], [
  { key: "a", texture: a, tint: "#ffffff" },
  { key: "b", texture: b, tint: "#ffffff" },
  { key: "c", texture: c, tint: "#ff0000" },
  { key: "d", texture: d, tint: "#ffffff" },
]);
console.log({ packed: atlas.packed, size: atlas.size, alpha: atlas.alpha, nearest: atlas.texture.magFilter === NearestFilter, a: atlas.tiles.get("a"), b: atlas.tiles.get("b"), c: atlas.tiles.get("c"), d: atlas.tiles.get("d") });
