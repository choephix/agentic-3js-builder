import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
const b = createBuilder(); b.joint("root", { at: [0, 0, 0] }); const mesh = b.slab([[-1, 0, 0], [1, 0, 0], [1, 2, 0], [0, 1, 0], [-1, 2, 0]], { thickness: 0.1, color: "#fff" }).mesh; const p = mesh.geometry.getAttribute("position");
const a = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
for (let i = 0; i < p.count; i += 3) { a.fromBufferAttribute(p, i); c.fromBufferAttribute(p, i + 1); d.fromBufferAttribute(p, i + 2); const cr = c.clone().sub(a).cross(d.clone().sub(a)); console.log(i / 3, a.toArray(), c.toArray(), d.toArray(), cr.toArray()); }
