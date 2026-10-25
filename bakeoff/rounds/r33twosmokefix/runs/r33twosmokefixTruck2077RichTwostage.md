`panelled` is exported by the clockwork kit (`agentic-3js-builder/kits/clockwork`), not the main SDK module, so the import failed.

<<<<<<< SEARCH
import { type Builder, createBuilder, paint, noise, mix, panelled, svg, rng } from "agentic-3js-builder";
=======
import { type Builder, createBuilder, paint, noise, mix, svg, rng } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE