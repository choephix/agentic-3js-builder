import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";

const b = createBuilder({ name: "limits" });
const root = b.joint("root", { at: [0, 0, 0] });
let parts = 0;
for (let i = 0; i < 1001; i++) {
  b.part(new THREE.BoxGeometry(0.01, 0.01, 0.01), "#123456", { bone: root, at: [0, 0, 0] });
  parts++;
}
let joints = 1;
for (let i = 1; i < 161; i++) {
  b.joint(`j${i}`, { parent: root, at: [i * 0.01, 0, 0] });
  joints++;
}
for (let i = 0; i < 65; i++) b.material(`#${i.toString(16).padStart(6, "0")}`);
console.log({ parts, meshes: b.ctx.meshes.values().reduce((n, xs) => n + xs.length, 0), joints, registeredJoints: b.ctx.joints.size, coloursRequested: 65 });
console.log("root read", b.root.children.length);
