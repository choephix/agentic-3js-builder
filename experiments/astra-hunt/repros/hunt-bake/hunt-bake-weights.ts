import * as THREE from "three";
import { assemble, createSkinnedMesh } from "../../../../harness/assemble";

const root = new THREE.Group();
const hip = new THREE.Object3D();
hip.userData.joint = "hip";
root.add(hip);
const knee = new THREE.Object3D();
knee.userData.joint = "knee";
knee.position.y = 1;
hip.add(knee);
const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#ffffff" }));
mesh.userData.skinBones = ["hip", "knee"];
const count = geometry.getAttribute("position").count;
const indices = new Uint16Array(count * 4);
const weights = new Float32Array(count * 4);
for (let i = 0; i < count; i++) {
  indices[i * 4] = 0;
  indices[i * 4 + 1] = 1;
  weights[i * 4] = 1.25;
  weights[i * 4 + 1] = 0.75;
}
geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(indices, 4));
geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(weights, 4));
hip.add(mesh);
const assembly = await assemble(root, true);
const out = assembly.geometry.getAttribute("skinWeight");
let min = Infinity, max = -Infinity;
for (let i = 0; i < out.count; i++) {
  const sum = out.getX(i) + out.getY(i) + out.getZ(i) + out.getW(i);
  min = Math.min(min, sum); max = Math.max(max, sum);
}
console.log(JSON.stringify({ issues: assembly.issues, vertices: out.count, minWeightSum: min, maxWeightSum: max, first: [out.getX(0), out.getY(0), out.getZ(0), out.getW(0)] }));
const skinned = createSkinnedMesh(assembly, "repro");
const position = assembly.geometry.getAttribute("position");
const before = new THREE.Vector3().fromBufferAttribute(position, 0);
const got = new THREE.Vector3();
skinned.mesh.getVertexPosition(0, got);
console.log(JSON.stringify({ before: before.toArray(), bindPoseVertex: got.toArray() }));
