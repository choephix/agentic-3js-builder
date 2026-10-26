The errors come from helpers typed too narrowly for `Paint`, a nonexistent palette key, and nullable `.tip` references used where the SDK requires a definite joint.

```text
<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, frame, rng, paint, grain, noise, svg, polyline } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, createBuilder, catmull, frame, rng, paint, grain, noise, svg, polyline } from "agentic-3js-builder";
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
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
  cylinder(b, 0.17, 0.19, SKIN_PAINT, [0, 1.45, 0], [0, 1, 0], spine.tip, "skin");
=======
  cylinder(
    b,
    0.17,
    0.19,
    SKIN_PAINT,
    [0, 1.45, 0],
    [0, 1, 0],
    spine.joints[spine.joints.length - 1],
    "skin",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.092, 0.076, 0.032), C.leatherDark ?? C.leather, {
=======
    b.part(new THREE.BoxGeometry(0.092, 0.076, 0.032), C.leather, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE
```