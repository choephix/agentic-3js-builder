Cause: The main blade outline’s shoulder edges are detected as crossing by `extrude()`; replace it with a simpler consistently ordered silhouette.

```text
<<<<<<< SEARCH
      [-0.105, 0.66],
      [0.105, 0.66],
      [0.165, 0.84],
      [0.155, 1.18],
      [0.12, 1.48],
      [0.07, 1.77],
      [0.0, 1.94],
      [-0.07, 1.77],
      [-0.12, 1.48],
      [-0.155, 1.18],
      [-0.165, 0.84],
=======
      [-0.105, 0.66],
      [0.105, 0.66],
      [0.15, 0.85],
      [0.13, 1.2],
      [0.08, 1.5],
      [0.0, 1.94],
      [-0.08, 1.5],
      [-0.13, 1.2],
      [-0.15, 0.85],
>>>>>>> REPLACE
```