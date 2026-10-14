import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { line } from "../../../../src/frame";
import { metal } from "../../../../kits/clockwork";

const b = createBuilder({ name: "outlinePose" });
const root = b.joint("root", { at: [0, 0, 0] });
const hinge = b.joint("hinge", { parent: root, at: [0, 1, 0], dir: [0, 1, 0], role: "hinge" });
const plate = b.extrude([[-0.2, 0], [0.2, 0], [0.2, 0.5], [-0.2, 0.5]], {
  at: hinge.at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: metal("iron"), bone: hinge, name: "plate",
});
const drum = b.lathe([[0, -0.1], [0.15, -0.1], [0.15, 0.1], [0, 0.1]], {
  at: hinge.at, axis: [1, 0, 0], segments: 8, color: metal("brass"), bone: hinge, name: "drum",
});
const hingeLine = line(hinge, hinge.at.clone().add(new THREE.Vector3(1, 0, 0)));
const beforePlate = plate.at;
const beforeDrum = drum.at;
const beforePlateQuat = plate.quat;
const beforeDrumQuat = drum.quat;
b.pose(hinge, { about: hingeLine, deg: 90 });
console.log(JSON.stringify({
  beforePlate: beforePlate.toArray(), afterPlate: plate.at.toArray(),
  beforeDrum: beforeDrum.toArray(), afterDrum: drum.at.toArray(),
  plateAxisBefore: plate.dir([0, 1, 0]).toArray(),
  plateAxisAfter: plate.axis.toArray(),
  drumAxisBefore: drum.dir([0, 1, 0]).toArray(),
  drumAxisAfter: drum.axis.toArray(),
  plateQuatBefore: beforePlateQuat.toArray(), plateQuatAfter: plate.quat.toArray(),
  drumQuatBefore: beforeDrumQuat.toArray(), drumQuatAfter: drum.quat.toArray(),
  meshCount: b.root.getObjectsByProperty("isMesh", true).length,
  names: b.root.getObjectsByProperty("isMesh", true).map((mesh) => mesh.name),
}, null, 2));
