import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
const b = createBuilder({ name: "legcap-default" });
const hips = b.joint("hips", { at: [0, 0, 0] });
const body = b.sweep([[0, 1, -1], [0, 1, 1]], 0.5, { bone: hips, color: "#999", sides: 8 });
const leg = b.chain("leg", [[0.42, 0.9, 0], [0.42, 0.35, 0], [0.12, 0.02, 0]], { parent: hips, names: ["leg1", "leg2"] });
const tube = b.sweep(leg, 0.16, { color: "#f00", sides: 8 });
b.pose("leg1", { axis: [0, 0, 1], deg: -35 });
function bounds(s: { meshes: THREE.Mesh[] }) {
  const box = new THREE.Box3();
  for (const m of s.meshes) { m.updateWorldMatrix(true, false); box.expandByObject(m); }
  return { min: box.min.toArray(), max: box.max.toArray() };
}
console.log(JSON.stringify({ body: bounds(body), leg: bounds(tube) }));
