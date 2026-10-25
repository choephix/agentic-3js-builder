`coil` is exported by the clockwork kit (`agentic-3js-builder/kits/clockwork`), not by the main SDK module, so it has to be imported from there.

<<<<<<< SEARCH
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, coil, catmull, frame } from "agentic-3js-builder";
=======
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, catmull, frame } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
import { metal, panelled, gaugeTexture } from "agentic-3js-builder/kits/clockwork";
=======
import { metal, panelled, gaugeTexture, coil } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE