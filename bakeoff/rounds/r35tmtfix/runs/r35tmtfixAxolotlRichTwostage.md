The errors come from a nullable chain tip used as a joint parent, a helper restricted to string colours despite receiving a `Paint`, and an outline annotation whose optional tuple element does not match `OutlineInput`.

<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, limb, mix, noise, paint, rng } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, createBuilder, catmull, limb, mix, noise, paint, rng } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const outline: [number, number, "sharp"?][] = [
=======
  const outline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE