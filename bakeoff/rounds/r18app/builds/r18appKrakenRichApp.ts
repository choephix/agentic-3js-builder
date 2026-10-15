import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";

export const meta = { name: "t", description: "t", style: "Overwatch", commit: "88fc1f0" };

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const root = b.joint("base", { at: [0, 0.1, 0] });
  b.part(new THREE.SphereGeometry(0.5, 8, 6), "#ff0000", { bone: root, at: [0, 0.5, 0] });
  return b.root;
}
