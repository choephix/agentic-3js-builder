Cause: the helper exposed `bone` as `unknown`, while nullable chain tips were passed where the SDK requires a definite `JointRef`.

<<<<<<< SEARCH
import {
  createBuilder,
  catmull,
=======
import {
  createBuilder,
  catmull,
>>>>>>> REPLACE

<<<<<<< SEARCH
  rng,
  svg,
} from "agentic-3js-builder";
=======
  rng,
  svg,
} from "agentic-3js-builder";
import type { JointRef } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  bone?: unknown,
) {
=======
  bone?: JointRef,
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE