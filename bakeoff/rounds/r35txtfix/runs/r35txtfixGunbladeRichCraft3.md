`cel` and `metal` are kit exports, not exports of the core `agentic-3js-builder` module.

```ts
<<<<<<< SEARCH
  svg,
  cel,
  metal,
} from "agentic-3js-builder";
=======
  svg,
} from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { metal } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE
```