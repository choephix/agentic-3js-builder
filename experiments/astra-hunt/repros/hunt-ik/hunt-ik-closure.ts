import { Vector3 } from "three";
import { limb } from "../../../../src/ik";
for (const lengths of [[2, 1], [2, 1, 1], [3, 1, 1], [1, 1, 1]]) {
  const points = limb(new Vector3(), new Vector3(), lengths, [[0,0,1],[0,0,-1],[0,0,1]]);
  const end = points.at(-1)!;
  console.log(JSON.stringify({ lengths, points: points.map((p) => p.toArray()), endError: end.length, segmentLengths: points.slice(1).map((p, i) => p.distanceTo(points[i])) }));
}
