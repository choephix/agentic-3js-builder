import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { metal } from "../../../../kits/clockwork";

export default function build() {
  const b = createBuilder({ name: "wheeledCart", detail: 0.75 });
  const chassis = b.joint("chassis", { at: [0, 0.42, 0], role: "spine" });
  b.part(new THREE.BoxGeometry(1.2, 0.18, 0.72), metal("iron"), { bone: chassis, at: [0, 0.42, 0], flat: true, name: "cartChassis", group: "cart" });
  b.part(new THREE.BoxGeometry(0.82, 0.65, 0.62), "#7a4d2b", { bone: chassis, at: [0, 0.82, -0.02], flat: true, name: "cargoBox", group: "cargo" });
  const wheelProfile: readonly [number, number][] = [[0, -0.07], [0.22, -0.07], [0.24, -0.04], [0.24, 0.04], [0.22, 0.07], [0, 0.07]];
  for (const [x, z, name] of [[-0.56, 0.33, "wheelLeftFront"], [0.56, 0.33, "wheelRightFront"], [-0.56, -0.33, "wheelLeftRear"], [0.56, -0.33, "wheelRightRear"]] as const) {
    const wheel = b.joint(name, { parent: chassis, at: [x, 0.28, z], dir: [1, 0, 0], role: "hinge" });
    b.lathe(wheelProfile, { at: wheel.at, axis: [1, 0, 0], segments: 10, spin: 9, color: metal("steel"), bone: wheel, name, group: "wheels" });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), "#222222", { bone: wheel, at: wheel.at, dir: [1, 0, 0], flat: true, name: `${name}Axle`, group: "wheels" });
  }
  b.part(new THREE.BoxGeometry(0.12, 0.75, 0.12), "#5c351f", { bone: chassis, at: [0, 1.15, -0.28], flat: true, name: "handlePost", group: "handle" });
  return b.root;
}
