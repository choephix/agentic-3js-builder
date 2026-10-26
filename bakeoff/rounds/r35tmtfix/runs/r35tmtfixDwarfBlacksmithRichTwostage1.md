Cause: `spine` has three span joints but no tip joint, so `spine.tip` is `null`; use its final span joint instead.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  cylinder(b, 0.17, 0.19, C.skin, [0, 1.45, 0], [0, 1, 0], spine.tip, "skin");
=======
  cylinder(
    b,
    0.17,
    0.19,
    C.skin,
    [0, 1.45, 0],
    [0, 1, 0],
    spine.joints[spine.joints.length - 1],
    "skin",
  );
>>>>>>> REPLACE
```