The toon and pixel kits are separate modules, not part of the core `"agentic-3js-builder"` export, so `cel`, `animeEye` and `INK` must come from `"agentic-3js-builder/kits/toon"`; `mix`, `noise` and `paint` stay on the core import.

<<<<<<< SEARCH
import { createBuilder, catmull, cel, animeEye, INK, mix, noise, paint } from "agentic-3js-builder";
=======
import { createBuilder, catmull, mix, noise, paint } from "agentic-3js-builder";
import { animeEye, cel, INK } from "agentic-3js-builder/kits/toon";
>>>>>>> REPLACE