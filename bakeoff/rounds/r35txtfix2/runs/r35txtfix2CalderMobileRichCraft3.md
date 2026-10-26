The errors come from one missing type-only import, nullable chain tips, and passing a nullable joint where the SDK requires a `FrameInput`.

```text
<<<<<<< SEARCH
import type { Fill, OutlinePoint } from "agentic-3js-builder";
=======
import type { ColorInput, Fill, OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    middleDrop.tip,
    {
=======
    middleDrop.tip!,
    {
>>>>>>> REPLACE

<<<<<<< SEARCH
    upperLeftDrop.tip.at.clone().add(v(0, -0.12, 0)),
=======
    upperLeftDrop.tip!.at.clone().add(v(0, -0.12, 0)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    upperRightDrop.tip.at.clone().add(v(0, -0.13, 0)),
=======
    upperRightDrop.tip!.at.clone().add(v(0, -0.13, 0)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    middleLeftDrop.tip.at.clone().add(v(0, -0.13, 0)),
=======
    middleLeftDrop.tip!.at.clone().add(v(0, -0.13, 0)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    middleRightDrop.tip.at.clone().add(v(0, -0.13, 0)),
=======
    middleRightDrop.tip!.at.clone().add(v(0, -0.13, 0)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    lowerLeftDrop.tip.at.clone().add(v(0, -0.13, 0)),
=======
    lowerLeftDrop.tip!.at.clone().add(v(0, -0.13, 0)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    lowerRightDrop.tip.at.clone().add(v(0, -0.13, 0)),
=======
    lowerRightDrop.tip!.at.clone().add(v(0, -0.13, 0)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    frontDrop.tip.at.clone().add(v(0, -0.12, 0)),
=======
    frontDrop.tip!.at.clone().add(v(0, -0.12, 0)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    bottomDrop.tip.at.clone().add(v(0, -0.15, 0)),
=======
    bottomDrop.tip!.at.clone().add(v(0, -0.15, 0)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    upperLeftDrop.tip,
    0.0045,
=======
    upperLeftDrop.tip!,
    0.0045,
>>>>>>> REPLACE

<<<<<<< SEARCH
    upperRightDrop.tip,
    0.0045,
=======
    upperRightDrop.tip!,
    0.0045,
>>>>>>> REPLACE

<<<<<<< SEARCH
    middleLeftDrop.tip,
    0.0048,
=======
    middleLeftDrop.tip!,
    0.0048,
>>>>>>> REPLACE

<<<<<<< SEARCH
    middleRightDrop.tip,
    0.0043,
=======
    middleRightDrop.tip!,
    0.0043,
>>>>>>> REPLACE

<<<<<<< SEARCH
    lowerLeftDrop.tip,
    0.0045,
=======
    lowerLeftDrop.tip!,
    0.0045,
>>>>>>> REPLACE

<<<<<<< SEARCH
    lowerRightDrop.tip,
    0.0045,
=======
    lowerRightDrop.tip!,
    0.0045,
>>>>>>> REPLACE

<<<<<<< SEARCH
    frontDrop.tip,
    0.004,
=======
    frontDrop.tip!,
    0.004,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bottomDrop.tip,
    0.0048,
=======
    bottomDrop.tip!,
    0.0048,
>>>>>>> REPLACE

<<<<<<< SEARCH
    upperLeft.tip,
    0.0042,
=======
    upperLeft.tip!,
    0.0042,
>>>>>>> REPLACE

<<<<<<< SEARCH
    middleRight.tip,
    0.0042,
=======
    middleRight.tip!,
    0.0042,
>>>>>>> REPLACE

<<<<<<< SEARCH
    lowerLeft.tip,
    0.0042,
=======
    lowerLeft.tip!,
    0.0042,
>>>>>>> REPLACE

<<<<<<< SEARCH
  addFinial(b, "upperLeftWeight", upperLeft.tip.at.clone().add(v(0, -0.012, 0)), upperLeft.tip, BRASS);
  addFinial(b, "upperRightWeight", upperRight.tip.at.clone().add(v(0, -0.012, 0)), upperRight.tip, BRASS);
  addFinial(b, "middleRightWeight", middleRight.tip.at.clone().add(v(0, -0.012, 0)), middleRight.tip, CREAM);
  addFinial(b, "lowerRightWeight", lowerRight.tip.at.clone().add(v(0, -0.012, 0)), lowerRight.tip, BRASS);
=======
  addFinial(b, "upperLeftWeight", upperLeft.tip!.at.clone().add(v(0, -0.012, 0)), upperLeft.tip!, BRASS);
  addFinial(b, "upperRightWeight", upperRight.tip!.at.clone().add(v(0, -0.012, 0)), upperRight.tip!, BRASS);
  addFinial(b, "middleRightWeight", middleRight.tip!.at.clone().add(v(0, -0.012, 0)), middleRight.tip!, CREAM);
  addFinial(b, "lowerRightWeight", lowerRight.tip!.at.clone().add(v(0, -0.012, 0)), lowerRight.tip!, BRASS);
>>>>>>> REPLACE
```