The type errors come from helpers narrowing paint-capable colours to `string`, while the leaf crescent outline self-intersects because its inner return path crosses the outer path.

```text
<<<<<<< SEARCH
import { type Builder, type ColorInput, createBuilder, paint } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, type Paint, createBuilder, paint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  name: string,
=======
  color: string | Paint,
  name: string,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  name?: string,
=======
  color: string | Paint,
  name?: string,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [-0.10, 0.18],
      [0.02, 0.25],
      [0.16, 0.19],
      [0.23, 0.08],
      [0.17, 0.02],
      [0.09, 0.14],
      [-0.03, 0.15],
      [-0.15, 0.08],
      [-0.20, -0.01],
      [-0.14, -0.04],
      [-0.05, 0.06],
      [0.07, 0.08],
      [0.15, 0.04],
      [0.12, 0.00],
      [0.17, 0.14],
      [0.05, 0.19],
=======
      [-0.20, -0.03],
      [-0.16, 0.10],
      [-0.06, 0.20],
      [0.08, 0.23],
      [0.20, 0.15],
      [0.24, 0.02],
      [0.18, -0.10],
      [0.06, -0.14],
      [-0.02, -0.08],
      [0.07, -0.02],
      [0.12, 0.06],
      [0.05, 0.13],
      [-0.06, 0.11],
      [-0.13, 0.03],
>>>>>>> REPLACE
```