The cause is a degenerate `rod` call in `buildPorchStairs`. It runs from `[x, 1.75, 2.0]` to the identical point, so `aim()` gets a zero-length direction. It was marked "degenerate guard removed below" but never removed.

<<<<<<< SEARCH
    rod(MID, [x, 2.0 - 0.25, 2.0], [x, 2.0 - 0.25, 2.0], 0.001); // (degenerate guard removed below)
=======
>>>>>>> REPLACE