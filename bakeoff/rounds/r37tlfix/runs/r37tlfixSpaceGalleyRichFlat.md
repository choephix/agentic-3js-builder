Cause: `INK` from the clockwork kit is an RGB array, but `b.part` only accepts colour strings or paints.

```ts
<<<<<<< SEARCH
import { metal, panelled, INK, GLINT } from "agentic-3js-builder/kits/clockwork";
=======
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const LIGHT = "#d8d6b5";
=======
  const LIGHT = "#d8d6b5";
  const INK = "#21140a";
>>>>>>> REPLACE
```