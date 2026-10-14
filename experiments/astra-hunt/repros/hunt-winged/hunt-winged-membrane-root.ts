import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Chain } from "../../../../src/skeleton";

const b = createBuilder({ name: "bat-root", detail: 1 });
const body = b.joint("body", { at: [0, 1, 0], role: "spine" });
const fingerA: Chain = b.chain("fingerA", [[0.3, 1, 0], [0.9, 1.05, -0.2]], {
  parent: body,
  names: ["fingerABase", "fingerATip"],
  role: "digit",
});
const fingerB: Chain = b.chain("fingerB", [[0.3, 1, 0], [0.95, 0.75, -0.25]], {
  parent: body,
  names: ["fingerBBase", "fingerBTip"],
  role: "digit",
});
b.membrane(fingerA, fingerB, { thickness: 0.012, rows: 3, cols: 8, color: "#b96878", name: "wingWeb" });
const root = b.root;
const meshes: THREE.Mesh[] = [];
root.traverse((object) => { if ((object as THREE.Mesh).isMesh) meshes.push(object as THREE.Mesh); });
const wing = meshes.find((mesh) => mesh.name === "wingWeb");
if (!wing) throw new Error("wingWeb mesh missing");
const positions = wing.geometry.getAttribute("position");
const index = wing.geometry.getIndex();
const area = (a: number, c: number, d: number) => {
  const va = new THREE.Vector3().fromBufferAttribute(positions, a);
  const vc = new THREE.Vector3().fromBufferAttribute(positions, c);
  const vd = new THREE.Vector3().fromBufferAttribute(positions, d);
  return vc.sub(va).cross(vd.sub(va)).length();
};
let degenerate = 0;
for (let i = 0; i < (index ? index.count : positions.count); i += 3) {
  const a = index ? index.getX(i) : i;
  const c = index ? index.getX(i + 1) : i + 1;
  const d = index ? index.getX(i + 2) : i + 2;
  if (area(a, c, d) < 1e-10) degenerate++;
}
const weights = wing.geometry.getAttribute("skinWeight");
const weightSums = { zero: 0, unit: 0, other: 0 };
for (let i = 0; i < weights.count; i++) {
  const sum = weights.getX(i) + weights.getY(i) + weights.getZ(i) + weights.getW(i);
  if (sum < 1e-6) weightSums.zero++;
  else if (Math.abs(sum - 1) < 1e-6) weightSums.unit++;
  else weightSums.other++;
}
console.log({ vertices: positions.count, triangles: (index ? index.count : positions.count) / 3, degenerate, skinBones: wing.userData.skinBones, weightSums });
b.pose(fingerA.tip!, { axis: [1, 0, 0], deg: 70 });
root.updateMatrixWorld(true);
let posedDegenerate = 0;
for (let i = 0; i < (index ? index.count : positions.count); i += 3) {
  const a = index ? index.getX(i) : i;
  const c = index ? index.getX(i + 1) : i + 1;
  const d = index ? index.getX(i + 2) : i + 2;
  if (area(a, c, d) < 1e-10) posedDegenerate++;
}
console.log({ posedDegenerate, finite: Array.from(positions.array).every(Number.isFinite) });
