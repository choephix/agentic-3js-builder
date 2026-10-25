`glow` is not exported by the main SDK module; it lives in the glow kit at `agentic-3js-builder/kits/glow`, so I import it from there.

## Edits

<<<<<<< SEARCH
import { type Builder, createBuilder, paint, mottle, noise, svg, glow, rng, mix, smoothstep } from "agentic-3js-builder";
=======
import { type Builder, createBuilder, paint, mottle, noise, svg, rng, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE