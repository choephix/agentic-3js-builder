Cause: the helper `bone` parameters were typed as `unknown`, but the SDK requires `JointRef`.

<<<<<<< SEARCH
import type { Builder } from "agentic-3js-builder";
=======
import type { Builder, JointRef } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  bone?: unknown,
) {
=======
  bone?: JointRef,
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  bone?: unknown,
) {
=======
  bone?: JointRef,
) {
>>>>>>> REPLACE