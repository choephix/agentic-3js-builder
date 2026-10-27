Cause: `spine.tip` is `null` because the chain has only two named span joints; use the final joint `spine.joints[1]` as the parent.

```text
<<<<<<< SEARCH
    parent: spine.tip,
    at: [0, 1.28, 0.02],
=======
    parent: spine.joints[1],
    at: [0, 1.28, 0.02],
>>>>>>> REPLACE
```