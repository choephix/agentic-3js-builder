Cause: `b` is not an SDK export, and several chains have nullable `.tip` handles; use their final joint explicitly wherever a `JointRef` or `FrameInput` is required.

```ts
<<<<<<< SEARCH
import {
  bezier,
  b,
  catmull,
=======
import {
  bezier,
  catmull,
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
          parent: legChains[s > 0 ? 0 : 1].tip,
=======
          parent: legChains[s > 0 ? 0 : 1].joints[legChains[s > 0 ? 0 : 1].joints.length - 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
          parent: armChains[s > 0 ? 0 : 1].tip,
=======
          parent: armChains[s > 0 ? 0 : 1].joints[armChains[s > 0 ? 0 : 1].joints.length - 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.spike(tail.tip, tail.tip, 0.115, 0.026, {
=======
  b.spike(
    tail.joints[tail.joints.length - 1],
    tail.joints[tail.joints.length - 1],
    0.115,
    0.026,
    {
>>>>>>> REPLACE
<<<<<<< SEARCH
    name: "tailBarb",
  });
=======
    name: "tailBarb",
    },
  );
>>>>>>> REPLACE
```