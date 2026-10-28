The kit `pixel` does not export `grain`; `grain` comes from the SDK's `paint` module, which the main export re-exports, so the import moves to `agentic-3js-builder`.

<<<<<<< SEARCH
import { createBuilder, catmull, limb, noise, rng } from "agentic-3js-builder";
import { cellPaint, grain, pixelArt, pixelTexture, snapColor } from "agentic-3js-builder/kits/pixel";
=======
import { createBuilder, catmull, grain, limb, noise, rng } from "agentic-3js-builder";
import { cellPaint, pixelArt, pixelTexture, snapColor } from "agentic-3js-builder/kits/pixel";
>>>>>>> REPLACE