import build from "./hunt-mechanical-diorama";
import { MeshStandardMaterial } from "three";
const scene = build();
const rows: Record<string, unknown>[] = [];
scene.traverse((object) => {
  if (!object.isMesh || !(object.material instanceof MeshStandardMaterial)) return;
  const position = object.geometry.getAttribute("position");
  const normal = object.geometry.getAttribute("normal");
  rows.push({
    name: object.name,
    emissive: object.material.emissive.getHexString(),
    intensity: object.material.emissiveIntensity,
    vertices: position.count,
    normals: normal.count,
    flatSplit: position.count > 8 && position.count === normal.count,
  });
});
console.log(JSON.stringify(rows, null, 2));
