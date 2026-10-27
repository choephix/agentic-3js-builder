Cause: nullable chain tips were passed where the SDK requires a definite joint, the leg data omitted `front`, and two frame-like literals were passed where actual SDK `Frame`s are required.

```ts
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
    { s: 1, name: "legL", hip: [0.25, 0.77, -0.34], foot: [0.25, 0.16, -0.39] },
    { s: -1, name: "legR", hip: [-0.25, 0.77, -0.34], foot: [-0.25, 0.16, -0.39] },
    { s: 1, name: "legFL", hip: [0.24, 0.88, 0.29], foot: [0.24, 0.16, 0.31] },
    { s: -1, name: "legFR", hip: [-0.24, 0.88, 0.29], foot: [-0.24, 0.16, 0.31] },
=======
    { s: 1, name: "legL", front: false, hip: [0.25, 0.77, -0.34], foot: [0.25, 0.16, -0.39] },
    { s: -1, name: "legR", front: false, hip: [-0.25, 0.77, -0.34], foot: [-0.25, 0.16, -0.39] },
    { s: 1, name: "legFL", front: true, hip: [0.24, 0.88, 0.29], foot: [0.24, 0.16, 0.31] },
    { s: -1, name: "legFR", front: true, hip: [-0.24, 0.88, 0.29], foot: [-0.24, 0.16, 0.31] },
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.chain.tip,
=======
      bone: leg.chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.chain.tip,
=======
      bone: leg.chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.chain.tip,
=======
      bone: leg.chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: neck.joints[1],
=======
      bone: neck.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.chain.tip,
=======
      bone: leg.chain.tip!,
>>>>>>> REPLACE

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
  frame,
  rng,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: ankle.at, axis: ankle.tangent },
=======
      frame(ankle.at, ankle.tangent),
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: ankle.at, axis: ankle.tangent },
=======
      frame(ankle.at, ankle.tangent),
>>>>>>> REPLACE
```