The cause: `metal` is exported by the clockwork kit, not by the main SDK module. My first import line also pulled in a stray `metal as _unused` from `"agentic-3js-builder"`, which doesn't provide it. The real `metal` import from the kit is already there, so the stray alias and its `void` line can go.

<<<<<<< SEARCH
import { createBuilder, paint, patches, metal as _unused } from "agentic-3js-builder";
=======
import { createBuilder, paint, patches } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
void _unused;

=======
>>>>>>> REPLACE