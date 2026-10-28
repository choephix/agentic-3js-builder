`metal` is exported by the clockwork kit (`agentic-3js-builder/kits/clockwork`), not the main module, so the import has to move.

<<<<<<< SEARCH
import { createBuilder, catmull, polyline, metal, paint, noise, smoothstep, mix } from "agentic-3js-builder";
=======
import { createBuilder, catmull, polyline, paint, noise, smoothstep, mix } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE