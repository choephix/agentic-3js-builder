`b.sprout` takes a Frame (a joint, hit, or `frame()`) as its second argument, but the tusk call passed a plain `[x, y, z]` array.

I wrapped the root point in `frame(...)` and imported it. The path already starts at that point, so it is not prepended twice.

<<<<<<< SEARCH
import { createBuilder, rng, catmull, offset, paint, mix, noise, smoothstep, svg, countershade } from "agentic-3js-builder";
=======
import { createBuilder, rng, catmull, offset, paint, mix, noise, smoothstep, svg, countershade, frame } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sprout(`tusk${s > 0 ? "L" : "R"}`, [s * 0.07, 1.0, 1.05], catmull(
=======
    b.sprout(`tusk${s > 0 ? "L" : "R"}`, frame([s * 0.07, 1.0, 1.05], [s * 0.3, -0.3, 1]), catmull(
>>>>>>> REPLACE