Cause: `sailOutline` is inferred as `OutlinePoint[]`, whose corners must include the literal `"sharp"` marker.

```text
<<<<<<< SEARCH
    [-0.055, 0],
    [0.06, 0],
    [0.13, 0.60],
    [0.045, 0.87],
    [-0.075, 0.87],
    [-0.12, 0.60],
=======
    [-0.055, 0, "sharp"],
    [0.06, 0, "sharp"],
    [0.13, 0.60, "sharp"],
    [0.045, 0.87, "sharp"],
    [-0.075, 0.87, "sharp"],
    [-0.12, 0.60, "sharp"],
>>>>>>> REPLACE
```