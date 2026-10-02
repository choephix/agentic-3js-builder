import { createBuilder } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { polyline } from "../../../../src/path";
import * as THREE from "three";

function check(label: string, f: () => unknown) {
  try { f(); console.log(label, "OK"); }
  catch (e) { console.log(label, e instanceof Error ? e.message : String(e)); }
}
const b = createBuilder();
b.joint("root", { at: [0, 0, 0] });
const bad = [1, 2] as unknown as readonly number[];
check("joint at", () => b.joint("j", { at: bad }));
check("chain path", () => b.chain("c", [bad, [0, 1, 0]]));
check("ring line", () => b.ring(bad, { count: 1 }));
check("part at", () => b.part(new THREE.BoxGeometry(), "red", { at: bad }));
check("sweep path", () => b.sweep([bad, [0, 1, 0]], 0.1, { color: "red" }));
check("rod a", () => b.rod(bad, [0, 1, 0], .1, { color: "red" }));
check("capsule b", () => b.capsule([0, 0, 0], bad, .1, { color: "red" }));
check("spike base", () => b.spike(bad, [0, 1, 0], 1, .1, { color: "red" }));
check("spike direction", () => b.spike([0, 0, 0], bad, 1, .1, { color: "red" }));
check("frustum a", () => b.frustumBox(bad, [0, 1, 0], [1,1], [1,1], { color: "red" }));
check("loft station", () => b.loft([{ at: bad, w: 1, h: 1 }, { at: [0,1,0], w:1,h:1 }], { color: "red" }));
check("sprout on", () => b.sprout("s", bad, [0,1,0], .1, { color: "red" }));
check("sprout tip", () => b.sprout("s2", [0,0,0], bad, .1, { color: "red" }));
check("stick on", () => b.stick(new THREE.BoxGeometry(), "red", bad));
check("slab point", () => b.slab([bad, [0,1,0], [1,0,0]], { color: "red", thickness: .1 }));
check("extrude at", () => b.extrude([[0,0],[1,0],[0,1]], { at: bad, color: "red", thickness: .1 }));
check("lathe at", () => b.lathe([[0,0],[1,1]], { at: bad, color: "red" }));
check("surface nearest", () => b.surface([]).nearest(bad));
check("surface ray origin", () => b.surface([]).ray(bad, [0, -1, 0]));
check("surface ray dir", () => b.surface([]).ray([0,1,0], bad));
check("frame at", () => frame(bad, [0,1,0]));
check("frame dir", () => frame([0,0,0], bad));
check("line a", () => line(bad, [0,1,0]));
check("polyline point", () => polyline([bad, [0,1,0]]));
