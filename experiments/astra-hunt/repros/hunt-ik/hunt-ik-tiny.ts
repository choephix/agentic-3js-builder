import { Vector3 } from "three";
import { limb } from "../../../../src/ik";
for (const distance of [2e-9, 1.1e-9, 1e-9, 5e-10, 1e-12]) {
  const root = new Vector3();
  const target = new Vector3(0, distance, 0);
  const points = limb(root, target, [1, 1], [0, 0, 1]);
  const end = points.at(-1)!;
  console.log(JSON.stringify({ distance, end: end.toArray(), error: end.distanceTo(target), segmentLengths: points.slice(1).map((p, i) => p.distanceTo(points[i])) }));
}
