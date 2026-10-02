import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
const b = createBuilder({ name: "overlap-feathers" });
const root = b.joint("root", { at: [0, 1, 0] });
const outline = [[0, 0], [0.1, 0.01], [0.2, 0], [0, -0.04]] as const;
for (const name of ["featherA", "featherB"]) b.extrude(outline, { at: [0, 1, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.004, color: "#ca4", bone: root, name });
const meshes: THREE.Mesh[] = [];
b.root.traverse((object) => { if ((object as THREE.Mesh).isMesh) meshes.push(object as THREE.Mesh); });
const first = meshes[0].geometry.getAttribute("position");
const second = meshes[1].geometry.getAttribute("position");
let exact = 0;
for (let i = 0; i < first.count; i++) for (let j = 0; j < second.count; j++) {
  if (first.getX(i) === second.getX(j) && first.getY(i) === second.getY(j) && first.getZ(i) === second.getZ(j)) exact++;
}
console.log({ meshes: meshes.length, coincidentVertices: exact, verticesPerFeather: first.count });
