import { createBuilder } from "../../../../src/builder";

const b = createBuilder({ name: "attachmentProbe" });
const root = b.joint("root", { at: [0, 0, 0] });
const extruded = b.extrude([[-0.2, 0], [0.2, 0], [0.2, 0.4], [-0.2, 0.4]], {
  at: [0, 0.2, 0], thickness: 0.1, color: "#cc3333", bone: root, name: "plate",
});
const lathed = b.lathe([[0, -0.05], [0.15, -0.05], [0.15, 0.05], [0, 0.05]], {
  at: [0.5, 0.15, 0], axis: [0, 1, 0], segments: 8, color: "#3333cc", bone: root, name: "drum",
});
const scene = b.root;
console.log(JSON.stringify({
  returnedMeshes: [extruded.mesh.name, lathed.mesh.name],
  sceneMeshNames: scene.getObjectsByProperty("isMesh", true).map((mesh) => mesh.name),
  rootChildren: scene.children[0]?.children.map((child) => child.name),
  returnedGeometry: [extruded.mesh.geometry.getAttribute("position").count, lathed.mesh.geometry.getAttribute("position").count],
}, null, 2));
