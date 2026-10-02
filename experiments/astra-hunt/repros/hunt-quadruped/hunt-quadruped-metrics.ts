import * as THREE from "three";
import { buildQuadruped } from "./hunt-quadruped-sample";

function measure(scale: number, detail: number) {
  const root = buildQuadruped(scale, detail);
  let meshes = 0;
  let triangles = 0;
  let nonFinite = 0;
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    meshes++;
    const position = node.geometry.getAttribute("position");
    triangles += node.geometry.index ? node.geometry.index.count / 3 : position.count / 3;
    for (let i = 0; i < position.count * position.itemSize; i++) if (!Number.isFinite(position.array[i])) nonFinite++;
  });
  const box = new THREE.Box3().setFromObject(root, true);
  return {
    scale,
    detail,
    meshes,
    triangles,
    size: box.getSize(new THREE.Vector3()).toArray().map((v) => +v.toFixed(4)),
    minY: +box.min.y.toFixed(5),
    maxY: +box.max.y.toFixed(5),
    nonFinite,
  };
}

for (const detail of [0.5, 1, 2, 3]) console.log(JSON.stringify(measure(1, detail)));
const base = measure(1, 1);
const fiveMetres = 5 / base.size[2];
console.log(JSON.stringify({ fiveMetres, ...measure(fiveMetres, 1) }));
console.log(JSON.stringify({ scale5: 5, ...measure(5, 1) }));
