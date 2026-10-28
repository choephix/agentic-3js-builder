`frame` is used in `leafFrame` but was never imported from the SDK; the fix adds it to the import.

<<<<<<< SEARCH
import { createBuilder, catmull, polyline, limb, paint, svg } from "agentic-3js-builder";
=======
import { createBuilder, catmull, polyline, limb, paint, svg, frame } from "agentic-3js-builder";
>>>>>>> REPLACE