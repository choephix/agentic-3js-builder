import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
export default function build() {
  const b = createBuilder({ name: "stiffcheck" });
  const root = b.joint("root", { at: [0, 1, 0] });
  const child = b.joint("child", { parent: root, at: [0, 1.5, 0] });
  b.joint("tip", { parent: child, at: [0, 2, 0] });
  b.part(new THREE.BoxGeometry(2, 2, 2), "#cc3333", { bone: root, at: [0, 1, 0] });
  return b.root;
}
