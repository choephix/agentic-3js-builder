Cause: nullable joint tips must be narrowed, SDK frames must use `frame()`, `ChainPoint` values need `.at`, and `Vector3` values need converting to tuple points where array inference requires tuples.

```ts
<<<<<<< SEARCH
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
} from "agentic-3js-builder";
=======
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
  frame,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const lowerEdge = polyline([
      shoulder,
      [s * 0.49, 1.18, -0.13],
      [s * 0.72, 1.31, -0.31],
      [s * 0.92, 1.59, -0.38],
      tip,
    ]);
=======
    const lowerEdge = polyline([
      shoulder,
      [s * 0.49, 1.18, -0.13] as [number, number, number],
      [s * 0.72, 1.31, -0.31] as [number, number, number],
      [s * 0.92, 1.59, -0.38] as [number, number, number],
      tip,
    ]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at, axis: tail.at(t).tangent },
=======
      frame(at, tail.at(t).tangent),
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailEnd = tail.at(1);
=======
  const tailEnd = tail.at(1).at;
>>>>>>> REPLACE

<<<<<<< SEARCH
      head.local([0, 0.17, 0.18]),
      head.local([0.045, 0.1, 0.22]),
      head.local([0, 0.03, 0.28]),
      head.local([-0.045, 0.1, 0.22]),
=======
      head.local([0, 0.17, 0.18]).toArray() as [number, number, number],
      head.local([0.045, 0.1, 0.22]).toArray() as [number, number, number],
      head.local([0, 0.03, 0.28]).toArray() as [number, number, number],
      head.local([-0.045, 0.1, 0.22]).toArray() as [number, number, number],
>>>>>>> REPLACE
```