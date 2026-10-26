The nullable joint reference must be narrowed to `undefined`, and every `crestOutline` corner must include the required `"sharp"` marker.

```text
<<<<<<< SEARCH
      bone: ridge.bone,
=======
      bone: ridge.bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: knee.bone,
=======
      bone: knee.bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: ankle.bone,
=======
      bone: ankle.bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leftScale.bone,
=======
      bone: leftScale.bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: rightScale.bone,
=======
      bone: rightScale.bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: guard.bone,
=======
      bone: guard.bone ?? undefined,
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
```