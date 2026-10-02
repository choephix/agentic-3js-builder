import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { line } from "../../../../src/frame";
import { polyline } from "../../../../src/path";

function run(label: string, fn: () => unknown) {
  try { const x = fn(); console.log(label, "OK", x); }
  catch (e) { console.log(label, "ERR", e instanceof Error ? `${e.name}: ${e.message}` : String(e)); }
}
const b = createBuilder({ name: "forward", detail: 0.75 });
const root = b.joint("root", { at: [0, 1, 0], role: "spine" });
const chain = b.chain("tail", [[0, 1, 0], [0, 1, -1], [0.3, 1, -2]], { names: ["tail1", "tailTip"], role: "tail", group: "tailGroup", twist: 25 });
const tube = b.sweep(chain, 0.1, { color: "#884422", name: "tube", group: "tubeGroup", caps: "flat", detail: 0.5, skin: "smooth" });
run("root", () => b.root.userData.rig);
run("along-chain", () => b.along(chain, 3, (at) => { if (!at.bone) throw new Error("missing bone"); }));
run("along-sweep", () => b.along(tube, 3, (at) => { if (!at.bone) throw new Error("missing bone"); }, { from: 0.1, to: 0.9 }));
run("ring", () => b.ring(line([0, 1, 0], [0, 2, 0]), { count: 3, radius: 0.1, fromDeg: -30, toDeg: 30 }, (at) => { if (at.i < 0) throw new Error("bad"); }));
run("pose", () => b.pose(root, { axis: [0, 0, 1], deg: 20 }));
run("part", () => b.part(new THREE.BoxGeometry(.1,.1,.1), "red", { bone: root, at: [0, 1, 0], rotation: [0, 10, 0], scale: [1, 2, 1], group: "parts", name: "part" }));
run("stick", () => b.stick(new THREE.BoxGeometry(.1,.1,.1), "blue", tube.at(.5), { embed: .1, spin: 15, flow: [0, 1, 0], name: "stick", group: "sticks", flat: true }));
const tex = new THREE.DataTexture(new Uint8Array([255,255,255,255]), 1, 1);
run("cards", () => b.cards([tube.at(.2), tube.at(.7)], tex, { size: [.1,.2], lean: 30, bend: 20, cross: true, mirror: true, sink: .2, name: "cards", group: "cards", color: "white" }));
run("membrane", () => b.membrane([[0, 1, 0], [0.2, 1, -1]], [[.3, 1, 0], [.3, 1, -1]], { color: "green", thickness: .01, rows: 2, cols: 3, scallop: .1, name: "mem", group: "mem", skin: "smooth" }));
run("slab", () => b.slab([[0, 1, 0], [.1,1,0], [0,1,.1]], { color: "yellow", thickness: .01, name: "slab", group: "slab" }));
run("extrude", () => b.extrude([[0,0],[.1,0],[.1,.1],[0,.1]], { at: [0,1,0], color: "orange", thickness: .01, name: "ext", group: "ext", detail: .5 }));
run("lathe", () => b.lathe([[0,0],[.05,.05],[0,.1]], { at: [0,1,0], color: "purple", name: "lathe", group: "lathe", segments: 6 }));
run("region", () => { const r = b.region({ at: [0,1,0], scale: 2 }); return r.part(new THREE.BoxGeometry(.1,.1,.1), "cyan", { at: [0,0,0], name: "reg" }); });
run("sprout", () => b.sprout("spr", tube.at(0.4), [0, .5, 0], .02, { count: 1, names: ["spr"], color: "pink", group: "spr", twist: 10 }));
run("decal", () => b.decal(tube, tex, { at: tube.at(.5), dir: [0,1,0], size: [.1,.1], segments: 2, lift: .002, roll: 10, mirror: true, color: "white", name: "decal", group: "decals" }));
run("root2", () => ({ same: b.root === b.root, children: b.root.children.length }));
