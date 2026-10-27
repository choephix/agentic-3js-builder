Cause: `gableOutline` is declared as `[number, number, "sharp"][]`, so its first two points must include the `"sharp"` marker.

```text
<<<<<<< SEARCH
    [-0.54, 0],
    [0.54, 0],
=======
    [-0.54, 0, "sharp"],
    [0.54, 0, "sharp"],
>>>>>>> REPLACE
```