import { Vector3 } from "three";
import { limb } from "../../../../src/ik";
for (const [name, lengths, target] of [
  ["large-reach", [1e150, 1e150], new Vector3(0, 1e150, 0)],
  ["overflow-sum", [1e308, 1e308], new Vector3(0, 1e308, 0)],
  ["near-max", [Number.MAX_VALUE / 2, Number.MAX_VALUE / 2], new Vector3(0, Number.MAX_VALUE / 2, 0)],
] as const) {
  try {
    const points = limb(new Vector3(), target, lengths, [0,0,1]);
    console.log(name, JSON.stringify(points.map((p) => p.toArray())));
  } catch (e) { console.log(name, String(e)); }
}
