import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
function run(a: number[][], b: number[][]) {
  const builder = createBuilder(); builder.joint("root", { at: [0, 0, 0] });
  try {
    const meshes = builder.membrane(a, b, { thickness: 0.1, color: "#fff", rows: 3, cols: 3 });
    const positions = meshes[0].geometry.getAttribute("position");
    return Array.from(positions.array).some((v) => !Number.isFinite(v));
  } catch { return false; }
}
const cases: [number[][], number[][]][] = [
  [[[-1, -1, 0], [1, 1, 0]], [[-1, 1, 0], [1, -1, 0]]],
  [[[-1, 0, 0], [1, 0, 0]], [[0, -1, 0], [0, 1, 0]]],
  [[[-1, -1, 0], [1, 1, 0]], [[1, -1, 0], [-1, 1, 0]]],
  [[[0, 0, 0], [1, 0, 0]], [[1, 0, 0], [0, 0, 0]]],
];
for (const [a, b] of cases) console.log(a, b, run(a, b));
