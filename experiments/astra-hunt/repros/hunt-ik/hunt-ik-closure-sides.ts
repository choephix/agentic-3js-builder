import { Vector3 } from "three";
import { limb } from "../../../../src/ik";
for (const [name, bends] of [["same", [[0,0,1],[0,0,1]]], ["alternating", [[0,0,1],[0,0,-1]]]] as const) {
  const points = limb(new Vector3(), new Vector3(), [1,1,1], bends);
  console.log(name, JSON.stringify({ points: points.map((p) => p.toArray()), endError: points.at(-1)!.length }));
}
