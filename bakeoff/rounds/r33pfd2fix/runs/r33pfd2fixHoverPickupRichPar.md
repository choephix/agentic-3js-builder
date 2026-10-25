The cab's antenna base `b.rod([-0.95, 2.2, -0.5], [-0.95, 2.2 + 0.0, -0.5], ...)` has identical start and end points, so `polyline()` gets only one distinct point and throws.

<<<<<<< SEARCH
  b.rod([-0.95, 2.2, -0.5], [-0.95, 2.2 + 0.0, -0.5], 0.01, P.metal, { bone });
=======
  b.rod([-0.95, 2.2, -0.5], [-0.95, 2.3, -0.5], 0.01, P.metal, { bone });
>>>>>>> REPLACE