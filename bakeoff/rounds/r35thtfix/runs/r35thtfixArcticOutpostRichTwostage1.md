Cause: `mastFlag` and `snowMarkerFlag` call `slab()` with `x: [0, 1, 0]`, which matches the helper’s default `y: [0, 1, 0]`.

<<<<<<< SEARCH
    [2.0, 2.8, -1.29],
    [0, 1, 0],
    0.025,
    RED,
  );

=======
    [2.0, 2.8, -1.29],
    [1, 0, 0],
    0.025,
    RED,
  );

>>>>>>> REPLACE

<<<<<<< SEARCH
    [2.7, 1.38, 2.0],
    [1, 0, 0],
    0.025,
    RED,
  );

=======
    [2.7, 1.38, 2.0],
    [1, 0, 0],
    0.025,
    RED,
  );

>>>>>>> REPLACE