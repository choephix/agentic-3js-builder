`rng` is exported by the SDK but the module never imported it, so the call failed to compile and then threw at runtime. The fix is to add it to the import.

<<<<<<< SEARCH
import { createBuilder } from "agentic-3js-builder";
=======
import { createBuilder, rng } from "agentic-3js-builder";
>>>>>>> REPLACE