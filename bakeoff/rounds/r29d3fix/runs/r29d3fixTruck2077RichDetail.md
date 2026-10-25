Cause: `coil` is exported by the clockwork kit (`agentic-3js-builder/kits/clockwork`), not by the main SDK module, and `metal` and `panelled` live there too. `glow` is also a kit export (`kits/glow`). I moved all four imports to their kit modules.

<<<<<<< SEARCH
import { createBuilder, rng, svg, metal, panelled, mottle, coil, catmull, glow } from "agentic-3js-builder";
=======
import { createBuilder, rng, svg, mottle, catmull } from "agentic-3js-builder";
import { metal, panelled, coil } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE