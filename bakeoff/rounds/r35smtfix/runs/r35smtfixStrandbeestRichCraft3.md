`mix` returns an `Rgb` tuple, so assigning it to a `let c` that was inferred as `Rgb` and then reassigning a colour string fails; typing `c` as `ColorInput` fixes it.

<<<<<<< SEARCH
    let c = mix("#e9c42b", "#f7da5c", smoothstep(0.3, 0.9, noise(p, 0.5, 3)));
=======
    let c: ColorInput = mix("#e9c42b", "#f7da5c", smoothstep(0.3, 0.9, noise(p, 0.5, 3)));
>>>>>>> REPLACE
<<<<<<< SEARCH
    let c = mix("#e8f6f4", "#bfe3ea", noise(p, 0.15, 5));
=======
    let c: ColorInput = mix("#e8f6f4", "#bfe3ea", noise(p, 0.15, 5));
>>>>>>> REPLACE
<<<<<<< SEARCH
    let c = mix("#f1e8d2", "#d8ccb0", noise(p, 0.3, 4) * 0.7);
=======
    let c: ColorInput = mix("#f1e8d2", "#d8ccb0", noise(p, 0.3, 4) * 0.7);
>>>>>>> REPLACE
<<<<<<< SEARCH
import { createBuilder, frame, polyline, catmull, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
=======
import { createBuilder, frame, polyline, catmull, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
>>>>>>> REPLACE