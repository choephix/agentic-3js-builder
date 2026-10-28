The cause: `glow` lives in the glow kit, not the main SDK module, so it has to be imported from `agentic-3js-builder/kits/glow`.

<<<<<<< SEARCH
import { glow } from "agentic-3js-builder";
=======
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE