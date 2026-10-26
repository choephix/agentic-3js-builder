Cause: `b.along()` callbacks receive a `Frame`, not an indexed item, so `at.i` is undefined and produces an invalid `flow` direction.

<<<<<<< SEARCH
      flow: (at) => [
        side * 0.35,
        0.72 + 0.16 * (at.i / 4),
        -0.15,
      ],
=======
      flow: [side * 0.35, 0.80, -0.15],
>>>>>>> REPLACE