`metal` lives in the clockwork kit, not the main SDK module, and the module never uses it, so I'm dropping it from the import.

<<<<<<< SEARCH
import { createBuilder, catmull, metal, paint, mix, mottle, noise, smoothstep, grain, svg } from "agentic-3js-builder";
=======
import { createBuilder, catmull, paint, mix, mottle, noise, smoothstep, grain, svg } from "agentic-3js-builder";
>>>>>>> REPLACE