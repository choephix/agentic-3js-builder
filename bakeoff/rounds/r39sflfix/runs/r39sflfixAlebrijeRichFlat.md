The `leaf` helper's return type `[number, number, "sharp"?][]` doesn't match the SDK's `OutlinePoint[]`, so I import that type and use it as the return type.

<<<<<<< SEARCH
import { createBuilder, catmull, bezier, polyline, limb, stripes, rng } from "agentic-3js-builder";
=======
import { createBuilder, catmull, bezier, polyline, limb, stripes, rng } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
function leaf(len: number, w: number): [number, number, "sharp"?][] {
  return [[0, 0], [len * 0.3, w], [len * 0.75, w * 0.8], [len, 0, "sharp"], [len * 0.75, -w * 0.8], [len * 0.3, -w]] as any;
}
=======
function leaf(len: number, w: number): OutlinePoint[] {
  return [[0, 0], [len * 0.3, w], [len * 0.75, w * 0.8], [len, 0, "sharp"], [len * 0.75, -w * 0.8], [len * 0.3, -w]];
}
>>>>>>> REPLACE