import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { assemble } from "../../../../harness/assemble";

const b = createBuilder({ name: "merged" });
const root = b.joint("root", { at: [0, 0, 0] });
const first = new THREE.BoxGeometry(0.1, 0.1, 0.1).translate(0, 0.5, 0);
const second = new THREE.BoxGeometry(0.2, 0.2, 0.2).translate(10, 1, 0);
b.part(first, "#ffffff", { bone: root, at: [0, 0, 0] });
b.part(second, "#ff0000", { bone: root, at: [0, 0, 0] });
const built = b.root;
const assembly = await assemble(built, true);
const positions = assembly.geometry.getAttribute("position");
let secondMin = [Infinity, Infinity, Infinity], secondMax = [-Infinity, -Infinity, -Infinity];
const part = assembly.geometry.getAttribute("_part");
for (let i = 0; i < positions.count; i++) if (Math.round(part.getX(i)) === 1) {
  for (let k = 0; k < 3; k++) { const x = positions.getComponent(i, k); secondMin[k] = Math.min(secondMin[k], x); secondMax[k] = Math.max(secondMax[k], x); }
}
console.log(JSON.stringify({ secondMin, secondMax, issues: assembly.issues, bounds: assembly.bounds }));
