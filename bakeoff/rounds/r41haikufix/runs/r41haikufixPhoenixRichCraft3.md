The `countershade` helper lives in `agentic-3js-builder` (from `src/paint`), not in the toon kit, so it must be imported from the SDK root alongside `gradient`.

<<<<<<< SEARCH
import { catmull, createBuilder, gradient, limb, rng } from "agentic-3js-builder";
import { animeEye, cel, countershade } from "agentic-3js-builder/kits/toon";
=======
import { catmull, countershade, createBuilder, gradient, limb, rng } from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
>>>>>>> REPLACE