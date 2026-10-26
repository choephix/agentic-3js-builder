Cause: `OutlinePoint` was imported but unused, and `[number, number, string?][]` widens the optional third tuple element to `undefined`, which `OutlineInput` rejects.

<<<<<<< SEARCH
import type { OutlinePoint } from "agentic-3js-builder";
=======
import type { OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    outline: [number, number, string?][],
=======
    outline: OutlinePoint[],
>>>>>>> REPLACE