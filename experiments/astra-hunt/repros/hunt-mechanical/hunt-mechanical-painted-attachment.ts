import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { metal } from "../../../../kits/clockwork";
const b = createBuilder({ name: "paintAttachment" });
const root = b.joint("root", { at: [0, 0, 0] });
const child = b.joint("child", { parent: root, at: [0, 1, 0] });
const plate = b.extrude([[-0.2, 0], [0.2, 0], [0.2, 0.4], [-0.2, 0.4]], {
  at: child.at, thickness: 0.1, color: metal("iron"), bone: child, name: "plate",
});
const plain = b.part(new THREE.BoxGeometry(0.4, 0.4, 0.1), "#aa3333", { bone: child, at: child.at, name: "plain" });
const scene = b.root;
console.log(JSON.stringify({
  rootChildren: scene.children[0]?.children.map((x) => x.name),
  sceneMeshes: scene.getObjectsByProperty("isMesh", true).map((x) => x.name),
  plateMesh: plate.mesh.name,
  material: plate.mesh.material instanceof THREE.MeshStandardMaterial ? plate.mesh.material.name : "other",
}, null, 2));
