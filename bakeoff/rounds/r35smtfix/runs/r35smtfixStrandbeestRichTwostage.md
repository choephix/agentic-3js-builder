Cause: `frame` was never imported, and line 211 returns a plain string where `paint` expects an `Rgb` (`mix` returns `Rgb`, but `c` was first inferred from a string-valued branch).

In `clothPaint`, `let c = mix(...)` is inferred as `Rgb`, and the later `c = ... ? WHITE : CAP_BLUE` in `snoutPaint` assigns strings. Line 211 is in `snoutPaint`, so I annotate `c` as `ColorInput` there and import the missing names.

<<<<<<< SEARCH
import { type Builder, createBuilder, paint, noise, mix, smoothstep, cells, svg } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, createBuilder, paint, noise, mix, smoothstep, cells, svg, frame } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  let c = mix(BOTTLE, WHITE, 0.3 * noise(p, 0.07, 31));
  const edge
=======
  let c: ColorInput = mix(BOTTLE, WHITE, 0.3 * noise(p, 0.07, 31));
  const edge
>>>>>>> REPLACE