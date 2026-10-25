The hood wedge outline in `buildCab` crosses itself: its points `[-0.1,1.0]` and `[0.8,1.0]` lie on the same y=1.0 line as the bottom edge `[2.8,1.0]`→`[2.8,1.28]`... more precisely the closing edge 5→0 overlaps the base edge 0→1. The hood polygon starts at z=-0.1, so the bottom edge 0→1 runs from -0.1 to 2.8 while point 5 (0.8, 1.0) lies on that edge. Dropping that last point leaves a clean outline whose closing edge runs from `[0.9,1.5]` back to `[-0.1,1.0]`.

<<<<<<< SEARCH
    [[-0.1, 1.0], [2.8, 1.0], [2.8, 1.28], [2.3, 1.42], [0.9, 1.5], [0.8, 1.0]],
=======
    [[-0.1, 1.0], [2.8, 1.0], [2.8, 1.28], [2.3, 1.42], [0.9, 1.5]],
>>>>>>> REPLACE