import * as THREE from "three";
import { assemble, createStaticMesh } from "../../../../harness/assemble";

const root = new THREE.Group();
const first = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: "#ffffff" }));
const sourceGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2).translate(10, 1, 0);
const second = new THREE.Mesh(sourceGeometry, new THREE.MeshStandardMaterial({ color: "#ff0000" }));
root.add(first, second);
root.updateMatrixWorld(true);
const sourceBox = new THREE.Box3().setFromObject(second, true);
const assembly = await assemble(root, false);
const output = createStaticMesh(assembly, "out");
output.updateMatrixWorld(true);
const outputBox = new THREE.Box3().setFromObject(output, true);
console.log(JSON.stringify({ sourceMin: sourceBox.min.toArray(), sourceMax: sourceBox.max.toArray(), outputMin: outputBox.min.toArray(), outputMax: outputBox.max.toArray(), reportBounds: assembly.bounds, parts: assembly.parts.map((p) => p.triangles) }));
