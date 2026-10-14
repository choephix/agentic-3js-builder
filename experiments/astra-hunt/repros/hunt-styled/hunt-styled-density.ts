import { BoxGeometry } from "three";
import { tileBox, skinBox, skinFaces, pixelArt } from "../../../../kits/pixel";
const TEXEL = 0.02;
const tile = pixelArt(["abcdefghijklmnop", "abcdefghijklmnop", "abcdefghijklmnop", "abcdefghijklmnop"], Object.fromEntries("abcdefghijklmnop".split("").map((c,i)=>[c,`#${(i*0x10101+0x101010).toString(16).slice(-6)}`])));
const tileGeo = tileBox([0.16,0.08,0.12], tile, TEXEL);
const faces = skinFaces(0,0,[8,4,6]);
const sheet = pixelArt(Array.from({length:20},()=>"0".repeat(28)), {"0":"#fff"});
const skinGeo = skinBox(sheet, faces, TEXEL);
for (const [name, geo] of [["tile", tileGeo], ["skin", skinGeo]] as const) {
  const uv = geo.getAttribute("uv");
  const pos = geo.getAttribute("position");
  console.log(name);
  for (let f=0; f<6; f++) {
    const a=f*4, b=a+1;
    console.log(f, "world", [pos.getX(a),pos.getY(a),pos.getZ(a)], [pos.getX(b),pos.getY(b),pos.getZ(b)], "uv", [uv.getX(a),uv.getY(a)], [uv.getX(b),uv.getY(b)]);
  }
}
