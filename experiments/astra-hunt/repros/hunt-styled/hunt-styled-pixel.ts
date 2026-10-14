import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { pixelArt, pixelTexture, tileBox, skinLayout, skinBox, cellPaint, pick, snapColor } from "../../../../kits/pixel";
import { rng } from "../../../../src/math";

const P = ["#101820", "#29334b", "#4e5d78", "#a6b4c9", "#d9e2f2"].map((c) => snapColor(c, 64));
const TILE = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => (x + y) % 5 === 0 ? P[3] : P[1]);
  g.stamp(2, 2, ["..aa..", ".aaaa.", "aaaaaa", ".aaaa."], { a: P[4] });
});
const layout = skinLayout({ head: [8, 8, 8], body: [10, 10, 6] });
const SHEET = pixelTexture(...layout.size, (g) => {
  for (const faces of Object.values(layout.faces)) for (const r of Object.values(faces)) g.fill((_x, y, _w, h) => pick(P, 0.2 + 0.6 * (1 - y / h)), r);
  const f = layout.faces.head.pz;
  g.stamp(f[0] + 1, f[1] + 2, [".ww..ww.", ".wk..kw.", "........"], { w: P[4], k: P[0] });
});
const GREY = pixelArt([".kk.", "kwwk", "kwwk", ".kk."], { k: "#333333", w: "#ffffff" });
const SKIN = cellPaint(0.02, (c) => c.pick(P, 0.25 + 0.5 * c.n.y), { dither: true });

export default function build() {
  const b = createBuilder({ name: "styled-pixel", detail: 0.7, paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0.55, 0] });
  const head = b.joint("head", { parent: root, at: [0, 1.1, 0.12], aim: [0, 1.1, 1] });
  b.part(tileBox([0.32, 0.25, 0.28], TILE, 0.02, { rand: rng(4), step: [1, 1] }), "#ffffff", { texture: TILE, bone: root, at: [0, 0.7, 0] });
  b.part(skinBox(SHEET, layout.faces.head, 0.02), "#ffffff", { texture: SHEET, bone: head, at: [0, 1.1, 0.14] });
  b.part(new THREE.PlaneGeometry(0.08, 0.08), "#cc4444", { texture: GREY, bone: head, at: [0, 1.1, 0.3], dir: [0, 0, 1], axis: "z" });
  b.sweep([[0, 0.64, 0], [0, 0.95, 0], [0, 1.1, 0.12]], [0.11, 0.09], { color: SKIN, section: { ngon: 6 }, smooth: false, caps: "flat", bone: root });
  return b.root;
}
