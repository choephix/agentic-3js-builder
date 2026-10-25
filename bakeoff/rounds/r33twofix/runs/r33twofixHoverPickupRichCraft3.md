`metal` and `panelled` are exported by the clockwork kit (`agentic-3js-builder/kits/clockwork`), not by the main SDK module, so the import failed.

<<<<<<< SEARCH
import { createBuilder, rng, countershade, mottle, svg, panelled, metal } from "agentic-3js-builder";
=======
import { createBuilder, rng, countershade, mottle, svg } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE