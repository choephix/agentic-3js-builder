Cause: `RECEIVER_TEXTURE` is a `Paint` but the local `box()` helper only accepts `string`; the blade-edge outline also self-intersects because its return path crosses the rising edge.

<<<<<<< SEARCH
import { type Builder, createBuilder, paint, mix, noise } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, createBuilder, paint, mix, noise } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [
      [0.105, 0],
      [0.16, 0.22],
      [0.18, 0.88],
      [0.105, 1.34],
      [0.015, 1.72],
      [0.09, 1.28],
      [0.205, 0.87],
      [0.22, 0.22],
      [0.17, 0],
    ],
=======
    [
      [0.105, 0],
      [0.16, 0.22],
      [0.18, 0.88],
      [0.105, 1.34],
      [0.015, 1.72],
      [-0.075, 1.48],
      [-0.18, 0.98],
      [-0.2, 0.28],
      [-0.13, 0],
    ],
>>>>>>> REPLACE