`glow` is not exported by the main SDK module; it lives in the glow kit, and `metal`, `panelled` and `gearGeometry` come from the clockwork kit, so I import them from their kit paths.

<<<<<<< SEARCH
import { createBuilder, svg, metal, panelled, mottle, glow, rng } from "agentic-3js-builder";
import { gearGeometry } from "agentic-3js-builder/kits/clockwork";
=======
import { createBuilder, svg, mottle, rng } from "agentic-3js-builder";
import { gearGeometry, metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE