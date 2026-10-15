The cause is a degenerate zero-length rod, `rod([-0.5, 2.18, -0.86], [-0.5, 2.18, -0.86], 0.001, ...)`, in the bed contents. Both endpoints are identical, so `polyline()` rejects it for having fewer than 2 distinct points. I removed it.

<<<<<<< SEARCH
  rod([-0.5, 2.18, -0.86], [-0.5, 2.18, -0.86], 0.001, STEEL, chassis, 4);
=======
>>>>>>> REPLACE