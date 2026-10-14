import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
const b = createBuilder(); b.joint("root", { at: [0, 0, 0] });
const mesh = b.membrane([[-1, 0, 0], [1, 2, 0]], [[-1, 2, 0], [1, 0, 0]], { thickness: 0.1, color: "#fff", rows: 2, cols: 4 })[0];
const p = mesh.geometry.getAttribute("position"); const a = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3(); let zero = 0; let min = Infinity;
for (let k = 0; k < p.count; k += 3) { a.fromBufferAttribute(p, k); c.fromBufferAttribute(p, k + 1); d.fromBufferAttribute(p, k + 2); const area = c.clone().sub(a).cross(d.clone().sub(a)).length() / 2; min = Math.min(min, area); if (area < 1e-8) zero++; }
console.log({ triangles: p.count / 3, zeroArea: zero, minArea: min, vertices: p.count });
