Cause: in `buildWheels`, `b.rod([inX, cy + 0.35, z], [inX, cy + 0.35, z], ...)` has identical start and end points, so the path has fewer than 2 distinct points and `polyline()` throws.

<<<<<<< SEARCH
    b.rod([inX, cy + 0.35, z], [inX, cy + 0.35, z], 0.01, P.hullDark, { bone: j });
=======
>>>>>>> REPLACE