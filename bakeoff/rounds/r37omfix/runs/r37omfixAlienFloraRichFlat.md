Cause: `glow` is exported by the glow kit, while nullable chain tips must be narrowed before being passed as `bone`.

```ts
<<<<<<< SEARCH
import {
  createBuilder,
  catmull,
  glow,
} from "agentic-3js-builder";
=======
import {
  createBuilder,
  catmull,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: trunk.tip,
=======
        bone: trunk.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: tendril.tip,
=======
        bone: tendril.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: rootChain.tip,
=======
        bone: rootChain.tip!,
>>>>>>> REPLACE
```