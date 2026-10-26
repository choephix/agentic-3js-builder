The cause is that `furEdge` is a toon-kit helper, not an export from the core `agentic-3js-builder` SDK module.

```ts
<<<<<<< SEARCH
import { animeEye, cel, INK as TOON_INK } from "agentic-3js-builder/kits/toon";
=======
import { animeEye, cel, INK as TOON_INK } from "agentic-3js-builder/kits/toon";
>>>>>>> REPLACE

<<<<<<< SEARCH
const BELLY = cel(
  furEdge("#40343a", "#201820", {
    axis: [0, 1, 0],
    level: -0.04,
    teeth: 0.16,
    period: 0.055,
    along: [0, 0, 1],
    ink: "#161119",
    inkWidth: 0.028,
  }),
  "#100d13",
);
=======
const BELLY = cel(
  countershade("#40343a", "#201820", {
    level: -0.04,
    soft: 0.18,
  }),
  "#100d13",
);
>>>>>>> REPLACE
```