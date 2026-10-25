Cause: in `buildCabShell`, the antenna was built with a zero-length `b.spike(..., 0.0, 0.0)` (a degenerate path with fewer than 2 distinct points), and the preceding `b.rod` also had identical endpoints. I replaced both with one real antenna rod.

<<<<<<< SEARCH
  b.rod([-0.8, 2.22, -0.5], [-0.85, 2.9 > 2.2 ? 2.2 + 0.0 : 2.2, -0.5], 0.01, { bone, color: P.steel });
  b.spike([-0.8, 2.22, -0.5], [0, 1, 0], 0.0, 0.0, { bone, color: P.steel });
=======
  b.rod([-0.8, 2.22, -0.5], [-0.85, 2.9, -0.5], 0.01, { bone, color: P.steel });
>>>>>>> REPLACE