Cause: nullable chain/frame bone references were passed directly as `bone`, and the crest outlines were typed as sharp tuples while several entries omitted the `"sharp"` marker.

```text
<<<<<<< SEARCH
      bone: front.tip,
=======
      bone: front.tip ?? hips,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: rear.tip,
=======
      bone: rear.tip ?? hips,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: p.bone,
=======
      bone: p.bone ?? hips,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: p.bone,
=======
      bone: p.bone ?? hips,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.075, 0],
    [0.075, 0],
    [0.064, 0.055],
    [0.034, 0.13],
    [0.012, 0.235],
    [-0.012, 0.275, "sharp"],
    [-0.034, 0.16],
    [-0.073, 0.075],
=======
    [-0.075, 0, "sharp"],
    [0.075, 0, "sharp"],
    [0.064, 0.055, "sharp"],
    [0.034, 0.13, "sharp"],
    [0.012, 0.235, "sharp"],
    [-0.012, 0.275, "sharp"],
    [-0.034, 0.16, "sharp"],
    [-0.073, 0.075, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.052, 0.012],
    [0.052, 0.012],
    [0.042, 0.063],
    [0.019, 0.132],
    [0.006, 0.215, "sharp"],
    [-0.018, 0.135],
    [-0.051, 0.07],
=======
    [-0.052, 0.012, "sharp"],
    [0.052, 0.012, "sharp"],
    [0.042, 0.063, "sharp"],
    [0.019, 0.132, "sharp"],
    [0.006, 0.215, "sharp"],
    [-0.018, 0.135, "sharp"],
    [-0.051, 0.07, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.012, 0],
    [0.014, 0],
    [0.027, 0.09],
    [0.008, 0.166, "sharp"],
    [-0.013, 0.078],
=======
    [-0.012, 0, "sharp"],
    [0.014, 0, "sharp"],
    [0.027, 0.09, "sharp"],
    [0.008, 0.166, "sharp"],
    [-0.013, 0.078, "sharp"],
>>>>>>> REPLACE