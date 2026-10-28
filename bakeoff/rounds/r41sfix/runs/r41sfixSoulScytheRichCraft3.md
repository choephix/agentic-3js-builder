`glow` and `metal` are kit exports, not part of the main SDK module, so they have to be imported from their kit paths.

<<<<<<< SEARCH
import { createBuilder, bezier, catmull, rng, glow } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { metal, paint, mottle, noise, smoothstep, mix } from "agentic-3js-builder";
=======
import { createBuilder, bezier, catmull, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { paint, mottle, noise, smoothstep, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE