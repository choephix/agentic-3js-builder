import * as THREE from "three";
import { buildQuadruped } from "./hunt-quadruped-sample";

function boxOf(root: THREE.Object3D, name: string) {
  const node = root.getObjectByName(name);
  if (!node) throw new Error(`missing ${name}`);
  return new THREE.Box3().setFromObject(node, true);
}

function centre(box: THREE.Box3) {
  return box.getCenter(new THREE.Vector3()).toArray().map((n) => +n.toFixed(6));
}

type Probe = {
  builder: {
    pose: (joint: string, rotation: { axis: number[]; deg: number }) => unknown;
    ctx: { joints: Map<string, { at: THREE.Vector3; axis: THREE.Vector3 }> };
  };
};
const root = buildQuadruped();
const probe = root.userData.probe as Probe;
const pawAxisBefore = probe.builder.ctx.joints.get("hindLPaw")!.axis.toArray().map((n) => +n.toFixed(6));
const pawBefore = probe.builder.ctx.joints.get("hindLPaw")!.at.toArray().map((n) => +n.toFixed(6));
const names = ["hindLClaw", "hindLTube", "EarL", "body", "jawMuzzle"];
const before = Object.fromEntries(names.map((name) => [name, centre(boxOf(root, name))]));
probe.builder.pose("hindLPaw", { axis: [1, 0, 0], deg: 35 });
const pawAxisAfter = probe.builder.ctx.joints.get("hindLPaw")!.axis.toArray().map((n) => +n.toFixed(6));
const pawAfter = probe.builder.ctx.joints.get("hindLPaw")!.at.toArray().map((n) => +n.toFixed(6));
const afterLeg = Object.fromEntries(names.map((name) => [name, centre(boxOf(root, name))]));
probe.builder.pose("neck2", { axis: [1, 0, 0], deg: -25 });
const afterNeck = Object.fromEntries(names.map((name) => [name, centre(boxOf(root, name))]));
probe.builder.pose("jaw", { axis: [1, 0, 0], deg: 30 });
const afterJaw = Object.fromEntries(names.map((name) => [name, centre(boxOf(root, name))]));
console.log(JSON.stringify({ pawAxisBefore, pawAxisAfter, pawBefore, pawAfter, before, afterLeg, afterNeck, afterJaw }, null, 2));
