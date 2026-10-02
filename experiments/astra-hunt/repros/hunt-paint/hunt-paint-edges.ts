import { Vector3 } from "three";
import { countershade, noise, paint, spots, stripes, cells, mix } from "../../../../src/paint";

const n = new Vector3(0, 1, 0);
const sample = (name: string, fn: () => unknown) => {
  try { console.log(name, fn()); } catch (e) { console.log(name, "THROW", String(e)); }
};
for (const p of [new Vector3(0.2, 0.4, -0.1), new Vector3(0.02, 0.01, 0.03), new Vector3(1,2,3)]) {
  sample(`noise size=0 @${p.toArray()}`, () => noise(p, 0));
  sample(`cells size=0 @${p.toArray()}`, () => cells(p, 0));
  sample(`spots size=0 @${p.toArray()}`, () => spots("#fff", "#000", { size: 0 }).at(p,n));
  sample(`spots size=-1 @${p.toArray()}`, () => spots("#fff", "#000", { size: -1 }).at(p,n));
  sample(`stripes size=0 @${p.toArray()}`, () => stripes("#fff", "#000", { size: 0 }).at(p,n));
  sample(`stripes size=-1 @${p.toArray()}`, () => stripes("#fff", "#000", { size: -1 }).at(p,n));
}
sample("stripes axis zero", () => stripes("#fff", "#000", { size: 0.1, axis: [0,0,0] }).at(new Vector3(0.2,0.4,0.1),n));
sample("countershade soft=0 at n.y=0", () => countershade("#fff", "#000", {soft:0}).at(new Vector3(), new Vector3(1,0,0)));
sample("countershade soft=-1", () => countershade("#fff", "#000", {soft:-1}).at(new Vector3(),n));
sample("mix paint runtime", () => Reflect.apply(mix, null, [paint(()=>"#fff"), "#000", 0.5]));
