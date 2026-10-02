import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
function geometry(withColor: boolean) {
  const g = new THREE.PlaneGeometry(.1, .1);
  if (withColor) g.setAttribute("color", new THREE.Float32BufferAttribute([1,1,1, 1,1,1, 1,1,1], 3));
  return g;
}
const b = createBuilder({ name: "materials" });
b.joint("root", { at: [0, 1, 0] });
const data = new Uint8Array([255,255,255,255]);
const tex = new THREE.DataTexture(data, 1, 1);
const a = b.part(geometry(false), "#abcdef", { texture: tex, at: [0,1,0] });
const b2 = b.part(geometry(false), "#ABCDEF", { texture: tex, at: [.2,1,0] });
const c = b.part(geometry(true), "#abcdef", { texture: tex, at: [.4,1,0] });
console.log("same textured no-colors", a.mesh.material === b2.mesh.material);
console.log("vertex-color separation", a.mesh.material === c.mesh.material, (a.mesh.material as THREE.MeshStandardMaterial).vertexColors, (c.mesh.material as THREE.MeshStandardMaterial).vertexColors);
console.log("material props", (a.mesh.material as THREE.MeshStandardMaterial).alphaTest, (a.mesh.material as THREE.MeshStandardMaterial).roughness, (a.mesh.material as THREE.MeshStandardMaterial).metalness);
