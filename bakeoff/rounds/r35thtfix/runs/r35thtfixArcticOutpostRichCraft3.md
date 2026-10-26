Cause: the second cable-reel handle calls `rod()` with identical start and end points, producing a zero-length path.

<<<<<<< SEARCH
    rod(b, [2.25, 0.73, -0.2 + i * 0.5], [2.25, 0.73, -0.2 + i * 0.5], 0.02, COLORS.yellow, {
      name: `cableReelHandle${i}`,
    });
=======
    rod(b, [2.25, 0.73, -0.2 + i * 0.5], [2.25, 0.73, 0.02 + i * 0.5], 0.02, COLORS.yellow, {
      name: `cableReelHandle${i}`,
    });
>>>>>>> REPLACE