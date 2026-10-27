Cause: `chain.tip` is nullable when the supplied names match the path spans, so nullable tips were passed as parents; the ear outline also required explicit `"sharp"` tuple markers.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.11, 0],
    [-0.17, 0.10],
    [-0.13, 0.28],
    [-0.045, 0.38],
    [0.065, 0.27],
    [0.10, 0.08],
    [0.06, 0],
=======
    [-0.11, 0, "sharp"],
    [-0.17, 0.10, "sharp"],
    [-0.13, 0.28, "sharp"],
    [-0.045, 0.38, "sharp"],
    [0.065, 0.27, "sharp"],
    [0.10, 0.08, "sharp"],
    [0.06, 0, "sharp"],
>>>>>>> REPLACE