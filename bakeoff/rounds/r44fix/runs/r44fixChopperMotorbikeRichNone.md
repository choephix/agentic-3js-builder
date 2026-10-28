The cause is a leftover zero-length rod, `b.rod([-0.14, 0.7, -0.15], [-0.14, 0.7, -0.15], 0.001, DARK)`. Its two endpoints are identical, so the path has fewer than 2 distinct points and `polyline()` throws. It does nothing visible, so I removed it.

<<<<<<< SEARCH
  b.rod([-0.14, 0.7, -0.15], [-0.14, 0.7, -0.15], 0.001, DARK);
=======
>>>>>>> REPLACE