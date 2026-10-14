import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { polyline } from "../../../../src/path";

const b = createBuilder({ name: "closed-caps" });
b.joint("root", { at: [0, 0, 0] });
const path = polyline([
  [-0.5, 0, -0.5],
  [0.5, 0, -0.5],
  [0.5, 0, 0.5],
  [-0.5, 0, 0.5],
], { closed: true });
const sweep = b.sweep(path, 0.1, { color: "#ffffff" });
const end = path.at(1);
const verts: number[] = [];
for (const mesh of sweep.meshes) {
  const p = mesh.geometry.getAttribute("position");
  for (let i = 0; i < p.count; i++) verts.push(new THREE.Vector3().fromBufferAttribute(p, i).distanceTo(end));
}
const nearEnd = verts.filter((d) => d < 0.101).length;
console.log(JSON.stringify({ closed: path.closed, meshCount: sweep.meshes.length, vertexCount: verts.length, end, nearEnd, maxDistance: Math.max(...verts) }));
export default () => b.root;
