The cloak hem outline went down to (0.4, -1.0) and then doubled back up to (0.4, -0.97), so edge 2→3 overlapped edge 4→5; the fix removes the redundant corner points at both sides.

<<<<<<< SEARCH
    const pts: Pt[] = [[0.2, 0], [0.25, -0.3], [0.33, -0.7], [0.4, -1.0]];
=======
    const pts: Pt[] = [[0.2, 0], [0.25, -0.3], [0.33, -0.7]];
>>>>>>> REPLACE
<<<<<<< SEARCH
    pts.push([-0.4, -1.0], [-0.33, -0.7], [-0.25, -0.3], [-0.2, 0]);
=======
    pts.push([-0.33, -0.7], [-0.25, -0.3], [-0.2, 0]);
>>>>>>> REPLACE