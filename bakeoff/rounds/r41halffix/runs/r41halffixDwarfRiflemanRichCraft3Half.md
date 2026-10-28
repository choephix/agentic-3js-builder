`metal` is exported by the clockwork kit (`agentic-3js-builder/kits/clockwork`), not the main SDK module, so the import must come from there.

<<<<<<< SEARCH
import { createBuilder, offset, catmull, polyline, svg, metal, grain, countershade, paint } from "agentic-3js-builder";
=======
import { createBuilder, offset, catmull, polyline, svg, grain, countershade, paint } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE