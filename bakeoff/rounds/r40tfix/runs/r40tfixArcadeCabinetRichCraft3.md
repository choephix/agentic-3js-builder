The `box` helper (line 328) and the `cyl` helper (line 337) type `color` as `ColorInput`, but `b.part` takes `Fill`, which the SDK's `JointRef`/`Fill` types treat as narrower. Typing those two parameters as `Fill` fixes both lines.

<<<<<<< SEARCH
import type { ColorInput } from "agentic-3js-builder";
=======
import type { ColorInput, Fill } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const box = (w: number, h: number, d: number, color: ColorInput, at: THREE.Vector3, extra: object = {}) =>
=======
  const box = (w: number, h: number, d: number, color: Fill, at: THREE.Vector3, extra: object = {}) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: ColorInput,
    at: THREE.Vector3,
    dir: THREE.Vector3,
=======
    color: Fill,
    at: THREE.Vector3,
    dir: THREE.Vector3,
>>>>>>> REPLACE