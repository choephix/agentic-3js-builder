Cause: the `rightEdge` blade outline self-intersects because its first two points are reversed relative to the rest of the contour.

```text
<<<<<<< SEARCH
    [
      [-0.018, 0],
      [0.008, 0],
      [-0.03, 0.3],
      [-0.038, 1.37],
      [-0.11, 1.51],
      [-0.07, 1.59],
      [-0.02, 1.75],
      [0.0, 1.86],
    ],
=======
    [
      [0.008, 0],
      [-0.018, 0],
      [-0.03, 0.3],
      [-0.038, 1.37],
      [-0.11, 1.51],
      [-0.07, 1.59],
      [-0.02, 1.75],
      [0.0, 1.86],
    ],
>>>>>>> REPLACE
```