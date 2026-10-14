import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Chain } from "../../../../src/skeleton";
const b = createBuilder({ name: "mirror-wing", detail: 1 });
const root = b.joint("root", { at: [0, 1, 0] });
const arms: Chain[] = [];
for (const side of [1, -1] as const) {
  const suffix = side > 0 ? "L" : "R";
  const arm = b.chain(`arm${suffix}`, [[side * 0.1, 1, 0.2], [side * 0.4, 1.2, 0.1], [side * 0.7, 1, -0.1]], { parent: root, names: [`arm${suffix}1`, `arm${suffix}2`, `arm${suffix}3`], role: "wing" });
  b.sweep(arm, [0.05, 0.03], { color: "#555", name: `armTube${suffix}` });
  const at = arm.at(0.75);
  b.extrude([[0, 0], [0.05, 0.02], [0.12, 0.01], [0.18, -0.04], [0, -0.03]], {
    at,
    y: at.dir([0, 1, 0]),
    x: at.dir([side, 0, 0]),
    thickness: 0.008,
    color: "#c94",
    name: `feather${suffix}`,
    bone: at.bone!,
  });
  arms.push(arm);
}
const rootObject = b.root;
rootObject.updateMatrixWorld(true);
const feathers: THREE.Mesh[] = [];
rootObject.traverse((object) => { if ((object as THREE.Mesh).isMesh && object.name.startsWith("feather")) feathers.push(object as THREE.Mesh); });
const positions = (mesh: THREE.Mesh) => {
  const out: THREE.Vector3[] = [];
  const attribute = mesh.geometry.getAttribute("position");
  for (let i = 0; i < attribute.count; i++) out.push(new THREE.Vector3().fromBufferAttribute(attribute, i).applyMatrix4(mesh.matrixWorld));
  return out;
};
const left = positions(feathers.find((mesh) => mesh.name === "featherL")!);
const right = positions(feathers.find((mesh) => mesh.name === "featherR")!);
let maxNearest = 0;
for (const point of left) {
  let nearest = Infinity;
  for (const other of right) nearest = Math.min(nearest, Math.hypot(point.x + other.x, point.y - other.y, point.z - other.z));
  maxNearest = Math.max(maxNearest, nearest);
}
console.log({ leftVertices: left.length, rightVertices: right.length, maxNearestMirrorError: maxNearest });
