Cause: the helper inferred an optional third tuple element as `string | undefined`, which is not assignable to the SDK’s `OutlineInput`; use the SDK’s `OutlinePoint` type.

<<<<<<< SEARCH
import { createBuilder } from "agentic-3js-builder";
=======
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    outline: [number, number, string?][],
=======
    outline: OutlinePoint[],
>>>>>>> REPLACE