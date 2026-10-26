Cause: the helper parameters were narrowed to `string` even though SDK colors also accept `Paint`; the stage-2 light helper also referenced an undefined local constant.

```text
<<<<<<< SEARCH
import * as THREE from "three";
import { type Builder, createBuilder, noise, paint, rng } from "agentic-3js-builder";
=======
import * as THREE from "three";
import { type Builder, createBuilder, noise, paint, rng } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: string,
=======
    color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color = P.PANEL,
=======
    color: ColorInput = P.PANEL,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: string,
=======
    color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
  box("ceilingBracketStandoff", [0.12, 0.055, 0.12], at(x, 2.712, 0.15), STEEL_DARK);
=======
  box("ceilingBracketStandoff", [0.12, 0.055, 0.12], at(x, 2.712, 0.15), HOUSING_EDGE);
>>>>>>> REPLACE
```