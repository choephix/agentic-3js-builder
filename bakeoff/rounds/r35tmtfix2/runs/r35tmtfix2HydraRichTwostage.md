```ts
// Cause: the helper typed Paint-only colours as string, the neck parent allowed null, and the rear legs reused front joint names because their z coordinate was 0.43 instead of -0.38.

// Edits
<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, limb, spiral, frame, paint } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, createBuilder, catmull, limb, spiral, frame, paint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
    ["L", 1, 0.43, -0.38],
    ["R", -1, 0.43, -0.38],
=======
    ["L", 1, -0.38, -0.38],
    ["R", -1, -0.38, -0.38],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: torso.tip,
=======
    parent: torso.tip ?? undefined,
>>>>>>> REPLACE
```