`glow` is exported by the glow kit, not the main SDK module, and the module already imports it from the kit as `glowKit`, so the duplicate main-module import is dropped.

<<<<<<< SEARCH
import { createBuilder, rng, glow } from "agentic-3js-builder";
=======
import { createBuilder, rng } from "agentic-3js-builder";
>>>>>>> REPLACE