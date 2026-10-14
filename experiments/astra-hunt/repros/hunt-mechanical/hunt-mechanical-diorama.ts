import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { glow } from "../../../../kits/glow";

export default function build() {
  const b = createBuilder({ name: "plainDiorama", detail: 0.7 });
  const root = b.joint("scene", { at: [0, 0, 0], role: "spine" });
  b.part(new THREE.BoxGeometry(2.4, 0.08, 1.6), "#283040", { bone: root, at: [0, 0.04, 0], flat: true, name: "ground", group: "scenery" });
  b.part(new THREE.BoxGeometry(0.72, 0.58, 0.72), "#596779", { bone: root, at: [-0.55, 0.37, 0.08], flat: true, name: "building", group: "scenery" });
  b.extrude([[-0.48, 0], [0.48, 0], [0.32, 0.26], [0, 0.4], [-0.32, 0.26]], {
    at: [-0.55, 0.66, 0.08], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.68, color: "#b4473d", bone: root, name: "roof", group: "scenery",
  });
  const lamp = b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 8), "#ffb347", { bone: root, at: [0.48, 0.52, 0.18], flat: true, name: "glowingLamp", group: "lights" });
  glow(lamp, 2.2);
  const beacon = b.lathe([[0, 0], [0.16, 0], [0.13, 0.24], [0, 0.24]], { at: [0.72, 0.08, -0.42], axis: [0, 1, 0], segments: 10, color: "#4fe3d0", bone: root, name: "glowingBeacon", group: "lights" });
  glow(beacon, 1.4);
  b.part(new THREE.BoxGeometry(0.4, 0.3, 0.28), "#8a6a48", { bone: root, at: [0.36, 0.19, -0.36], flat: true, name: "crate", group: "props" });
  return b.root;
}
