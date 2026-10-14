import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
function run(name: string, points: number[][]) {
  const b = createBuilder(); b.joint("root", { at: [0, 0, 0] }); const mesh = b.slab(points, { thickness: 0.1, color: "#fff" }).mesh; const p = mesh.geometry.getAttribute("position"); let signedTop = 0; let signedBottom = 0; let zero = 0;
  const a = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) { a.fromBufferAttribute(p, i); c.fromBufferAttribute(p, i + 1); d.fromBufferAttribute(p, i + 2); const cross = c.clone().sub(a).cross(d.clone().sub(a)); const area = cross.length() / 2; if (area < 1e-8) zero++; if (i < 2 * (points.length - 2) * 3) signedTop += cross.z; else if (i < 4 * (points.length - 2) * 3) signedBottom += cross.z; }
  console.log(name, { triangles: p.count / 3, zero, signedTop, signedBottom, axis: mesh.userData });
}
run("concave-ccw", [[-1, 0, 0], [1, 0, 0], [1, 2, 0], [0, 1, 0], [-1, 2, 0]]);
run("concave-cw", [[-1, 2, 0], [0, 1, 0], [1, 2, 0], [1, 0, 0], [-1, 0, 0]]);
