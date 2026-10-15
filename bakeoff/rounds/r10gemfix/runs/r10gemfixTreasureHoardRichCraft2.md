The helper function `mid` was used on line 416 to find the chain midpoint but was missing from the SDK import list.

## Edits

<<<<<<< SEARCH
import {
  createBuilder,
  bezier,
  catmull,
  paint,
  grain,
  mottle,
  svg,
  rng,
  aim,
  mix,
  smoothstep,
  noise,
  rgb,
} from "agentic-3js-builder";
=======
import {
  createBuilder,
  bezier,
  catmull,
  paint,
  grain,
  mottle,
  svg,
  rng,
  aim,
  mid,
  mix,
  smoothstep,
  noise,
  rgb,
} from "agentic-3js-builder";
>>>>>>> REPLACE