Cause: the turret's yaw ring-light call `neon([-0.0, 2.72, tz + 0.36], [0.0, 2.72, tz + 0.36], ...)` passes two identical points (-0.0 equals 0.0), so the rod has zero length and `polyline()` rejects it.

<<<<<<< SEARCH
  neon([-0.0, 2.72, tz + 0.36], [0.0, 2.72, tz + 0.36], CYAN, yaw, 0.02, 1.2);
=======
  neon([-0.2, 2.72, tz + 0.36], [0.2, 2.72, tz + 0.36], CYAN, yaw, 0.02, 1.2);
>>>>>>> REPLACE