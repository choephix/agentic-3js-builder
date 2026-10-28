```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Swamp Troll",
  description: "Hunched Warcraft-style swamp troll blockout with tusks, mohawk and bone fetishes.",
};

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const SKIN = "#4a7f78", DARK = "#2f5552", BONE = "#e8dcc0", HAIR = "#c2336b", CLOTH = "#6b4a2b";

  const hips = b.joint("hips", { at: [0, 1.15, -0.1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.15, -0.1], [0, 1.5, 0.05], [0, 1.9, 0.3]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 1.9, 0.3], [0, 2.05, 0.5], [0, 2.1, 0.62]]), { parent: spine.joints[1], names: ["neck1", "neck2", "head"], role: "neck" });
  const head = neck.tip ?? neck.joints[neck.joints.length - 1];
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.08, 0.66], aim: [0, 2.0, 0.9], role: "jaw" });

  // torso, hunched belly
  b.sweep(catmull([[0, 1.15, -0.1], [0, 1.5, 0.05], [0, 1.9, 0.3]]), [0.38, 0.55, 0.45], { color: SKIN, bone: [spine, hips] });
  b.part(new THREE.SphereGeometry(0.36, 8, 6), SKIN, { at: [0, 1.25, 0.12], scale: [1, 0.9, 0.9], bone: hips });
  b.part(new THREE.BoxGeometry(0.8, 0.28, 0.5), CLOTH, { at: [0, 1.0, -0.05], bone: hips });

  // head and jaws
  b.part(new THREE.BoxGeometry(0.34, 0.3, 0.38), SKIN, { at: [0, 2.12, 0.7], bone: head });
  b.part(new THREE.BoxGeometry(0.4, 0.12, 0.3), SKIN, { at: [0, 2.0, 0.82], bone: jaw });
  b.part(new THREE.BoxGeometry(0.34, 0.1, 0.1), DARK, { at: [0, 2.28, 0.82], bone: head });
  for (const s of [1, -1]) {
    b.spike([s * 0.13, 2.04, 0.95], [0, 1, 0.2], 0.2, 0.04, { color: BONE, bone: jaw });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), "#f2d34a", { at: [s * 0.1, 2.2, 0.88], bone: head });
    b.spike([s * 0.2, 2.22, 0.68], [s * 1, 0.2, -0.3], 0.3, 0.05, { color: DARK, bone: head });
  }
  // mohawk
  for (let i = 0; i < 6; i++) {
    b.spike([0, 2.25 - i * 0.015, 0.8 - i * 0.1], [0, 1, -0.4], 0.28 - i * 0.02, 0.04, { color: HAIR, bone: head });
  }

  // arms (long, reaching down)
  for (const s of [1, -1]) {
    const sh: [number, number, number] = [s * 0.5, 1.85, 0.25];
    const arm = b.chain(s > 0 ? "armL" : "armR", catmull([sh, [s * 0.75, 1.4, 0.35], [s * 0.8, 0.9, 0.5], [s * 0.82, 0.55, 0.62]]), { parent: spine.joints[2] ?? spine.joints[1], names: [s > 0 ? "shoulderL" : "shoulderR", s > 0 ? "elbowL" : "elbowR", s > 0 ? "wristL" : "wristR", s > 0 ? "handL" : "handR"], role: "arm" });
    b.sweep(arm, [0.16, 0.1], { color: SKIN });
    b.part(new THREE.SphereGeometry(0.22, 8, 6), DARK, { at: [s * 0.5, 1.95, 0.25], bone: arm.joints[0] });
    b.part(new THREE.BoxGeometry(0.18, 0.2, 0.2), SKIN, { at: [s * 0.82, 0.5, 0.65], bone: arm.joints[arm.joints.length - 1] });
    // legs
    const hp: [number, number, number] = [s * 0.25, 1.1, -0.1];
    const leg = b.chain(s > 0 ? "legL" : "legR", catmull([hp, [s * 0.3, 0.6, 0.1], [s * 0.3, 0.12, 0.05]]), { parent: hips, names: [s > 0 ? "hipL" : "hipR", s > 0 ? "kneeL" : "kneeR", s > 0 ? "ankleL" : "ankleR"], role: "leg" });
    b.sweep(leg, [0.2, 0.12], { color: SKIN });
    b.part(new THREE.BoxGeometry(0.26, 0.12, 0.42), DARK, { at: [s * 0.3, 0.06, 0.2], bone: leg.joints[leg.joints.length - 1] });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 1.1, -0.3], [0, 0.8, -0.7], [0, 0.5, -1.1]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.12, 0.04], { color: SKIN });

  // bone fetishes
  b.rod([-0.3, 1.4, 0.4], [0.3, 1.0, 0.45], 0.025, BONE, { bone: spine.joints[0] });
  b.part(new THREE.SphereGeometry(0.1, 6, 5), BONE, { at: [0, 1.25, 0.52], bone: spine.joints[0] });
  b.part(new THREE.SphereGeometry(0.08, 6, 5), BONE, { at: [0.45, 1.05, 0.2], bone: hips });

  return b.root;
}
```