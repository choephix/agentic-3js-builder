import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { gearGeometry, gearTrain, metal } from "../../../../kits/clockwork";

export default function build() {
  const b = createBuilder({ name: "mechanicalRobot", detail: 0.8 });
  const root = b.joint("base", { at: [0, 0.35, 0], role: "spine" });
  const shoulder = b.joint("shoulder", { parent: root, at: [0, 0.9, 0], dir: [0, 1, 0], role: "hinge" });
  const elbow = b.joint("elbow", { parent: shoulder, at: [0, 1.65, 0], dir: [0, 1, 0], role: "hinge" });
  const wrist = b.joint("wrist", { parent: elbow, at: [0, 2.28, 0], dir: [0, 1, 0], role: "hinge" });
  b.extrude([[-0.16, 0], [0.16, 0], [0.13, 0.65], [-0.13, 0.65]], {
    at: shoulder.at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.02, color: metal("iron"), bone: shoulder, name: "upperArmPlate", group: "arm",
  });
  b.extrude([[-0.13, 0], [0.13, 0], [0.11, 0.58], [-0.11, 0.58]], {
    at: elbow.at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, bevel: 0.015, color: metal("steel"), bone: elbow, name: "foreArmPlate", group: "arm",
  });
  b.lathe([[0, -0.10], [0.14, -0.10], [0.14, 0.10], [0, 0.10]], {
    at: elbow.at, axis: [1, 0, 0], segments: 8, color: metal("brass"), bone: elbow, name: "elbowBarrel", group: "hinge",
  });
  b.part(new THREE.BoxGeometry(0.38, 0.18, 0.42), "#30353b", { bone: root, at: [0, 0.52, 0], flat: true, name: "baseHousing", group: "base" });
  const drive = gearTrain(b, {
    at: root.at.clone().add(new THREE.Vector3(0, 0.42, 0.24)), axis: [0, 0, 1], module: 0.012, spin: "drive", bone: root, group: "gearbox",
    gears: [{ teeth: 16, spokes: 4, bore: 0.01 }, { teeth: 10, angle: 70, spokes: 3 }],
  });
  drive.spin(12);
  b.part(gearGeometry({ teeth: 12, module: 0.008, bore: 0.005, thickness: 0.012 }), metal("gilt"), { bone: wrist, at: wrist.at, dir: [0, 1, 0], flat: true, name: "wristGear", group: "wrist" });
  return b.root;
}

