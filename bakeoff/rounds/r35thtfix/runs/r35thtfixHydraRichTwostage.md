The errors come from overly broad `ColorInput` annotations, nullable joint references, outline tuples missing the required `"sharp"` marker, readonly tuple inference, and the undefined `IRON_DARK` constant.

```text
<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, countershade, limb, paint, scales, type ColorInput, line, polyline, frame, svg } from "agentic-3js-builder";
=======
import { type Builder, createBuilder, catmull, countershade, limb, paint, scales, type ColorInput, type Fill, line, polyline, frame, svg } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
=======
  color: Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
=======
  color: Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
=======
  color: Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: neck.tip,
=======
      bone: neck.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.24, 0],
    [-0.18, 0.18],
    [-0.08, 0.34],
    [0, 0.43],
    [0.09, 0.31],
    [0.2, 0.17],
    [0.25, 0],
=======
    [-0.24, 0, "sharp"],
    [-0.18, 0.18, "sharp"],
    [-0.08, 0.34, "sharp"],
    [0, 0.43, "sharp"],
    [0.09, 0.31, "sharp"],
    [0.2, 0.17, "sharp"],
    [0.25, 0, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      const a = v(scars[i][0]);
      const c = v(scars[i][1]);
=======
      const a = v([...scars[i][0]] as [number, number, number]);
      const c = v([...scars[i][1]] as [number, number, number]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  rod("s24PauldronRTopRim", [-0.835, 1.6, 0.18], [-0.835, 1.6, 0.65], 0.012, IRON_DARK ?? IRON);
=======
  rod("s24PauldronRTopRim", [-0.835, 1.6, 0.18], [-0.835, 1.6, 0.65], 0.012, IRON);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [-0.36, -0.29],
      [0.31, -0.29],
      [0.37, -0.18],
      [0.36, 0.22],
      [0.25, 0.3],
      [-0.25, 0.29],
      [-0.38, 0.14],
=======
      [-0.36, -0.29, "sharp"],
      [0.31, -0.29, "sharp"],
      [0.37, -0.18, "sharp"],
      [0.36, 0.22, "sharp"],
      [0.25, 0.3, "sharp"],
      [-0.25, 0.29, "sharp"],
      [-0.38, 0.14, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [-0.255, -0.12],
      [0.23, -0.12],
      [0.285, -0.035],
      [0.23, 0.105],
      [0.08, 0.155],
      [-0.135, 0.145],
      [-0.285, 0.035],
=======
      [-0.255, -0.12, "sharp"],
      [0.23, -0.12, "sharp"],
      [0.285, -0.035, "sharp"],
      [0.23, 0.105, "sharp"],
      [0.08, 0.155, "sharp"],
      [-0.135, 0.145, "sharp"],
      [-0.285, 0.035, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [-0.315, -0.135],
      [0.305, -0.135],
      [0.345, -0.045],
      [0.315, 0.095],
      [0.225, 0.145],
      [-0.23, 0.145],
      [-0.34, 0.035],
=======
      [-0.315, -0.135, "sharp"],
      [0.305, -0.135, "sharp"],
      [0.345, -0.045, "sharp"],
      [0.315, 0.095, "sharp"],
      [0.225, 0.145, "sharp"],
      [-0.23, 0.145, "sharp"],
      [-0.34, 0.035, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [-0.345, -0.085],
      [-0.245, -0.125],
      [-0.15, -0.095],
      [-0.04, -0.13],
      [0.08, -0.092],
      [0.2, -0.125],
      [0.335, -0.07],
      [0.315, 0.07],
      [0.23, 0.125],
      [-0.245, 0.125],
      [-0.34, 0.04],
=======
      [-0.345, -0.085, "sharp"],
      [-0.245, -0.125, "sharp"],
      [-0.15, -0.095, "sharp"],
      [-0.04, -0.13, "sharp"],
      [0.08, -0.092, "sharp"],
      [0.2, -0.125, "sharp"],
      [0.335, -0.07, "sharp"],
      [0.315, 0.07, "sharp"],
      [0.23, 0.125, "sharp"],
      [-0.245, 0.125, "sharp"],
      [-0.34, 0.04, "sharp"],
>>>>>>> REPLACE
```