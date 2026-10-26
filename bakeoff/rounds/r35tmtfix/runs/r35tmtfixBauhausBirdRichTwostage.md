Cause: nullable joint tips were passed where the SDK expects an optional `JointRef`, while several helpers were typed as accepting only strings; the feather outline also needed an explicit sharp-corner tuple type.

```ts
<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, frame, line, paint, rng } from "agentic-3js-builder";
=======
import {
  type Builder,
  type ColorInput,
  createBuilder,
  catmull,
  frame,
  line,
  paint,
  rng,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? legL.tip : legR.tip,
=======
      bone: (s > 0 ? legL.tip : legR.tip) ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? legL.tip : legR.tip,
=======
      bone: (s > 0 ? legL.tip : legR.tip) ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? legL.tip : legR.tip,
=======
      bone: (s > 0 ? legL.tip : legR.tip) ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const feather = [
    [-0.075, 0],
    [0.075, 0],
    [0.055, 0.46],
    [0, 0.61],
    [-0.055, 0.46],
  ] as [number, number, "sharp"][];
=======
  const feather: [number, number, "sharp"][] = [
    [-0.075, 0, "sharp"],
    [0.075, 0, "sharp"],
    [0.055, 0.46, "sharp"],
    [0, 0.61, "sharp"],
    [-0.055, 0.46, "sharp"],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? legL.tip : legR.tip,
=======
      bone: (s > 0 ? legL.tip : legR.tip) ?? undefined,
>>>>>>> REPLACE
```