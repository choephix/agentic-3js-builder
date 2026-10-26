```ts
// Cause: the local helper signatures were narrower than the SDK's ColorInput type, while the leaf outline revisited its starting point mid-loop and self-intersected.
<<<<<<< SEARCH
import { type Builder, createBuilder, rng, cells, countershade, grain, mix, paint, stripes, catmull, svg } from "agentic-3js-builder";
=======
import {
  type Builder,
  type ColorInput,
  createBuilder,
  rng,
  cells,
  countershade,
  grain,
  mix,
  paint,
  stripes,
  catmull,
  svg,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  at: [number, number, number],
=======
  color: ColorInput,
  at: [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  name: string,
=======
  color: ColorInput,
  name: string,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const outline: [number, number, "sharp"][] = [
      [0, 0, "sharp"],
      [0.045, 0.025, "sharp"],
      [0.082, 0.002, "sharp"],
      [0.052, -0.031, "sharp"],
      [0, 0, "sharp"],
      [-0.052, 0.031, "sharp"],
      [-0.082, -0.002, "sharp"],
      [-0.045, -0.025, "sharp"],
    ];
=======
    const outline: [number, number, "sharp"][] = [
      [0, 0.070, "sharp"],
      [0.080, 0.018, "sharp"],
      [0.050, -0.030, "sharp"],
      [0, -0.055, "sharp"],
      [-0.050, -0.030, "sharp"],
      [-0.080, 0.018, "sharp"],
    ];
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: string,
      name: string,
=======
      color: ColorInput,
      name: string,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: string,
    name: string,
=======
    color: ColorInput,
    name: string,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: string,
    at: [number, number, number],
=======
    color: ColorInput,
    at: [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: string,
    name: string,
=======
    color: ColorInput,
    name: string,
>>>>>>> REPLACE
```