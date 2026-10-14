import { Vector3 } from "three";
import { limb } from "../../../../src/ik";
const root = new Vector3(0.25, 1.1, -0.4);
const target = new Vector3(-0.3, 0.2, 1.2);
const bends = [[0, 0, 1], [0, 0, -1], [0, 0, 1]] as const;
const first = limb(root, target, [0.8, 0.65, 0.55, 0.4], bends);
let same = true;
for (let i = 0; i < 100; i++) {
  const again = limb(root, target, [0.8, 0.65, 0.55, 0.4], bends);
  for (let j = 0; j < first.length; j++) if (!first[j].equals(again[j])) same = false;
}
console.log(JSON.stringify({ same, points: first.map((p) => p.toArray()), endError: first.at(-1)!.distanceTo(target) }));
