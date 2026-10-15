The crash comes from the "wrist cord" line in the arm loop, which calls `polyline` with a single point and a zero radius; `polyline` needs at least 2 points, so it throws. That sweep does nothing useful, so I'm removing it.

## Edits

<<<<<<< SEARCH
    // wrist cord and bone beads
    b.sweep(polyline([[hx, hy + 0.01, hz]]), 0.0, { color: ROPE, bone: wr }).meshes.length;
=======
    // wrist cord
    b.sweep(polyline([[hx, hy + 0.04, hz - 0.12], [hx, hy + 0.04, hz + 0.12]]), 0.012, { color: ROPE, bone: wr, sides: 5 });
>>>>>>> REPLACE