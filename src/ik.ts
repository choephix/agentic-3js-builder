// Two-bone IK: solve the middle joint so a limb ends exactly on a target (feet planted on the floor).
import { Vector3 } from "three";
import { flatten, vec } from "./math";
import type { V3 } from "./math";

/**
 * Knee/elbow position for a two-bone limb from `root` to `target` with bone lengths [l1, l2], bending toward
 * `bendHint` (a direction, e.g. [0, 0, 1] for a knee pointing forward). Out-of-reach targets straighten the limb
 * toward the target; too-close targets fold it as far as the lengths allow.
 */
export function twoBoneIK(root: V3, target: V3, [l1, l2]: readonly [number, number], bendHint: V3) {
  const a = vec(root);
  const toTarget = vec(target).sub(a);
  const dir = toTarget.clone().normalize();
  const d = Math.min(Math.max(toTarget.length(), Math.abs(l1 - l2) + 1e-6), l1 + l2 - 1e-6);
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const height = Math.sqrt(Math.max(l1 * l1 - along * along, 0));
  let bend = flatten(vec(bendHint), dir);
  if (bend.lengthSq() < 1e-10) bend = flatten(new Vector3(0, 0, 1), dir);
  if (bend.lengthSq() < 1e-10) bend = flatten(new Vector3(1, 0, 0), dir);
  return a.addScaledVector(dir, along).addScaledVector(bend.normalize(), height);
}
