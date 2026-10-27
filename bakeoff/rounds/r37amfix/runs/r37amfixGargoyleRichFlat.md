Cause: `chain.tip` is nullable when the chain has no explicit tip joint; use the chain itself as the parent, and construct the horn ring input with `frame()` instead of an untyped `{ at, axis }` object.

<<<<<<< SEARCH
import { createBuilder, catmull, limb } from "agentic-3js-builder";
=======
import { createBuilder, catmull, frame, limb } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck,
>>>>>>> REPLACE

<<<<<<< SEARCH
        { at: p, axis: hornPath.tangentAt((i + 1) / 4) },
=======
        frame(p, hornPath.tangentAt((i + 1) / 4)),
>>>>>>> REPLACE