import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { line } from "../../../../src/frame";

function assemble() {
  const b = createBuilder({ name: "hingeProbe", detail: 0.8 });
  const root = b.joint("base", { at: [0, 0.35, 0] });
  const shoulder = b.joint("shoulder", { parent: root, at: [0, 0.9, 0], dir: [0, 1, 0], role: "hinge" });
  const elbow = b.joint("elbow", { parent: shoulder, at: [0, 1.65, 0], dir: [0, 1, 0], role: "hinge" });
  const wrist = b.joint("wrist", { parent: elbow, at: [0, 2.28, 0], dir: [0, 1, 0], role: "hinge" });
  const fore = b.part(new THREE.BoxGeometry(0.26, 0.58, 0.18), "#777777", { bone: elbow, at: [0, 1.95, 0], flat: true, name: "forearm" });
  const wristPart = b.part(new THREE.BoxGeometry(0.24, 0.16, 0.24), "#aaaaaa", { bone: wrist, at: wrist.at, flat: true, name: "wristBlock" });
  const elbowHinge = line(elbow, elbow.at.clone().add(new THREE.Vector3(1, 0, 0)));
  return { b, root, shoulder, elbow, wrist, fore, wristPart, elbowHinge };
}

export default function build() { return assemble().b.root; }

if (import.meta.url === `file://${process.argv[1]}`) {
  const { b, elbow, wrist, fore, wristPart, elbowHinge } = assemble();
  const beforeWrist = wrist.at;
  const beforeFore = fore.at;
  b.pose(elbow, { about: elbowHinge, deg: 45 });
  const afterWrist = wrist.at;
  const afterFore = fore.at;
  const expectedWrist = beforeWrist.clone().sub(elbowHinge.at).applyAxisAngle(elbowHinge.axis, Math.PI / 4).add(elbowHinge.at);
  const skinBones = fore.mesh.userData.skinBones;
  const foreMeshBones = Array.isArray(skinBones)
    ? skinBones.map((bone) => (bone && typeof bone === "object" && "name" in bone ? bone.name : undefined))
    : undefined;
  console.log(JSON.stringify({
    elbow: elbow.at.toArray(),
    beforeWrist: beforeWrist.toArray(), afterWrist: afterWrist.toArray(), expectedWrist: expectedWrist.toArray(),
    wristError: afterWrist.distanceTo(expectedWrist),
    beforeFore: beforeFore.toArray(), afterFore: afterFore.toArray(),
    foreMeshBones,
    foreSkinIndices: fore.mesh.geometry.getAttribute("skinIndex")?.count,
    root: b.root.userData.rig,
    wristPartAt: wristPart.at.toArray(),
  }, null, 2));
}
