`panelled` is exported by `agentic-3js-builder/kits/clockwork`, not by the main SDK module, so I moved it to a kit import. I also dropped the unused `glow as _unused` alias from the SDK import.

<<<<<<< SEARCH
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, panelled, glow as _unused, offset, catmull } from "agentic-3js-builder";
=======
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, offset, catmull } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE