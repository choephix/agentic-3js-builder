Cause: `glow` is exported by the separate glow kit, not by the core SDK index.

<<<<<<< SEARCH
import { createBuilder, catmull, bezier, glow } from "agentic-3js-builder";
=======
import { createBuilder, catmull, bezier } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE