Cause: `spine.tip` is nullable, the mouth sweep’s raw point array needs an explicit path, and ear outline points must be marked `"sharp"` to satisfy `OutlinePoint`.

```text
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [
      [s * 0.22, 1.31, 0.84],
      [s * 0.17, 1.34, 0.88],
      [s * 0.1, 1.32, 0.88],
    ],
=======
    catmull([
      [s * 0.22, 1.31, 0.84],
      [s * 0.17, 1.34, 0.88],
      [s * 0.1, 1.32, 0.88],
    ]),
>>>>>>> REPLACE

<<<<<<< SEARCH
        [-0.06, 0.04],
        [-0.09, 0.19],
        [-0.06, 0.31],
        [0, 0.36],
        [0.07, 0.25],
        [0.07, 0.06],
=======
        [-0.06, 0.04, "sharp"],
        [-0.09, 0.19, "sharp"],
        [-0.06, 0.31, "sharp"],
        [0, 0.36, "sharp"],
        [0.07, 0.25, "sharp"],
        [0.07, 0.06, "sharp"],
>>>>>>> REPLACE
```