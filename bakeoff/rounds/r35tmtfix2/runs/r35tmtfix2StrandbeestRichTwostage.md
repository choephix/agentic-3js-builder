Cause: the helper parameters typed `bone?: unknown` were passed to SDK options requiring `JointRef`.

<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, limb, noise, paint, rng } from "agentic-3js-builder";
=======
import { type Builder, type JointRef, createBuilder, catmull, limb, noise, paint, rng } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  bone?: unknown,
=======
  bone?: JointRef,
>>>>>>> REPLACE

<<<<<<< SEARCH
  bone?: unknown,
=======
  bone?: JointRef,
>>>>>>> REPLACE