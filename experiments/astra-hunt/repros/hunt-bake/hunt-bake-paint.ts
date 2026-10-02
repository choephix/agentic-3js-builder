import { DataTexture, Mesh, SRGBColorSpace } from "three";
import { createBuilder } from "../../../../src/builder";
import { paint } from "../../../../src/paint";

const b = createBuilder({ name: "paint", paintSize: 512 });
const root = b.joint("root", { at: [0, 1, 0] });
const pattern = paint(() => "#808080");
b.sweep(b.chain("tube", [[0, 1, 0], [0, 1, 1]], { parent: root }), 0.2, { color: pattern });
const built = b.root;
let found: { rgb: number[]; alpha: number } | null = null;
built.traverse((node) => {
  if (found || !(node instanceof Mesh)) return;
  const map = node.material instanceof Array ? null : node.material.map;
  if (!(map instanceof DataTexture) || !map.image?.data) return;
  const data = map.image.data as Uint8Array;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 255) {
      found = { rgb: [data[i], data[i + 1], data[i + 2]], alpha: data[i + 3] };
      break;
    }
  }
  console.log(JSON.stringify({ width: map.image.width, height: map.image.height, colorSpace: map.colorSpace, expectedColorSpace: SRGBColorSpace, minFilter: map.minFilter, magFilter: map.magFilter, found }));
});
