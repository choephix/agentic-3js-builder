The errors come from helper parameters being narrowed to `string`, nullable chain tips being passed as parents, and `Vector3` values being used where live SDK frames are required.

```ts
<<<<<<< SEARCH
import {
  createBuilder,
  catmull,
  limb,
  rng,
  svg,
} from "agentic-3js-builder";
=======
import {
  createBuilder,
  catmull,
  frame,
  limb,
  rng,
  svg,
} from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
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
  const STONE = cel("#6f7478", "#34383d", { threshold: 0.08 });
=======
  const STONE = cel("#6f7478", "#34383d", { threshold: 0.08 }) as any;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const STONE_LIGHT = cel("#909497", "#4a4d51", { threshold: 0.12 });
=======
  const STONE_LIGHT = cel("#909497", "#4a4d51", { threshold: 0.12 }) as any;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const STONE_DARK = cel("#44484d", "#202327", { threshold: 0.05 });
=======
  const STONE_DARK = cel("#44484d", "#202327", { threshold: 0.05 }) as any;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BELLY = cel("#77716c", "#3e3938", { threshold: 0.1 });
=======
  const BELLY = cel("#77716c", "#3e3938", { threshold: 0.1 }) as any;
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: wingL.joints[0],
=======
      parent: wingL.joints[0] ?? spine.joints[2],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: wingR.joints[0],
=======
      parent: wingR.joints[0] ?? spine.joints[2],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(a, [0, 0.12, -0.12], 0.075, 0.018, {
=======
    b.spike(frame(a, [0, 1, 0]), [0, 0.12, -0.12], 0.075, 0.018, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike(p, [0, 0.15, -0.25], 0.09 - i * 0.006, 0.025 - i * 0.002, {
=======
      b.spike(frame(p, [0, 1, 0]), [0, 0.15, -0.25], 0.09 - i * 0.006, 0.025 - i * 0.002, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(p, [0, 0.3, 0.05], 0.055, 0.012, {
=======
    b.spike(frame(p, [0, 1, 0]), [0, 0.3, 0.05], 0.055, 0.012, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(a, [0, 0.12, -0.12], 0.075, 0.018, {
=======
    b.spike(frame(a, [0, 1, 0]), [0, 0.12, -0.12], 0.075, 0.018, {
>>>>>>> REPLACE
```