import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";

const b = createBuilder({ name: "triangle-budget" });
b.joint("root", { at: [0, 1, 0] });
// 256 × 128 segments produce 65,536 triangles: above GUIDE's stated 60k limit,
// but below the API/harness hard limit of 120k.
b.part(new THREE.SphereGeometry(0.5, 256, 128), "#ffffff", { bone: "root" });
export default function build() {
  return b.root;
}
