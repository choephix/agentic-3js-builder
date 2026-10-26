`glow` lives in the kit module `agentic-3js-builder/kits/glow`, not the main SDK export, so it needs its own import.

<<<<<<< SEARCH
import { createBuilder, rng, paint, noise, mix, smoothstep, svg, glow } from "agentic-3js-builder";
=======
import { createBuilder, rng, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE