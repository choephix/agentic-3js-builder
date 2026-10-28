The cause: `glow` is not exported from the main SDK module (it lives in the glow kit), and the wing builder calls a `glow` name that was never defined once the bad import is removed.

The fix drops `glow` from the SDK import and defines `glow` locally as the kit's `glowKit`, so the existing `glow` calls in the wings and the `(glow as any)` wrapper keep working.

<<<<<<< SEARCH
import { createBuilder, type Builder, type Joint, frame, rng, glow, catmull, bezier } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";
=======
import { createBuilder, type Builder, type Joint, frame, rng, catmull, bezier } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";
const glow = glowKit;
>>>>>>> REPLACE