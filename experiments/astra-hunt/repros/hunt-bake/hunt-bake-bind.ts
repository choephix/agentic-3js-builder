import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { assemble, createSkinnedMesh } from "../../../../harness/assemble";

const b = createBuilder({ name: "bind" });
const root = b.joint("root", { at: [0, 1, 0] });
const chain = b.chain("body", [[0, 1, 0], [0, 1.3, 0.5], [0, 1.1, 1]], { parent: root, count: 3 });
b.sweep(chain, 0.22, { color: "#cc8844" });
const built = b.root;
const assembly = await assemble(built, true);
const mesh = createSkinnedMesh(assembly, "bind").mesh;
const position = assembly.geometry.getAttribute("position");
let maxError = 0, minSum = Infinity, maxSum = -Infinity;
const got = new THREE.Vector3();
for (let i = 0; i < position.count; i++) {
  const source = new THREE.Vector3().fromBufferAttribute(position, i);
  mesh.getVertexPosition(i, got);
  maxError = Math.max(maxError, source.distanceTo(got));
  const w = assembly.geometry.getAttribute("skinWeight");
  const sum = w.getX(i) + w.getY(i) + w.getZ(i) + w.getW(i);
  minSum = Math.min(minSum, sum); maxSum = Math.max(maxSum, sum);
}
console.log(JSON.stringify({ issues: assembly.issues, parts: assembly.parts.length, triangles: assembly.triangles, joints: assembly.joints.length, vertices: position.count, maxBindPoseError: maxError, minWeightSum: minSum, maxWeightSum: maxSum, bounds: assembly.bounds }));
