The cause is the ribbon's `B` edge: `A[0]` is a `Vector3`, so `p[0]`, `p[1]` and `p[2]` are undefined and the first point of `B` becomes NaN.

<<<<<<< SEARCH
      sashHit.moved([0, 0.05, 0]).at,
=======
      sashHit.moved([0, 0.05, 0]).at.toArray(),
>>>>>>> REPLACE