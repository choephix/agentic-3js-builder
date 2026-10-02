import { Vector3 } from "three";
import { limb } from "../../../../src/ik";

const root = new Vector3(0, 0, 0);
const sole = new Vector3(1, 0, 1).normalize();
const target = new Vector3(0, 1, 0).addScaledVector(sole, Math.SQRT2);
const shortTarget = new Vector3(0, 0, 0).addScaledVector(sole, Math.SQRT2);
for (const [name, t] of [["valid", target], ["short", shortTarget]] as const) {
  const points = limb(root, t, [1, Math.SQRT2], [0, 1, 0], { sole });
  console.log(name, JSON.stringify({ target: t.toArray(), points: points.map((p) => p.toArray()), error: points.at(-1)!.distanceTo(t), last: points.at(-1)!.clone().sub(points.at(-2)!).normalize().toArray() }));
}
