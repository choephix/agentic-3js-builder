The crash comes from a leftover zero-length `b.spike(..., 0.0, 0.0, ...)` inside the staff-head crescent loop. Its length is 0, so the path has two identical points and `polyline()` throws. The spike has no purpose, so I'm removing it.

<<<<<<< SEARCH
    b.spike([SX + s * 0.23, 2.42 - 0.0, SZ], [0, 1, 0], 0.0, 0.0, GOLD, { bone: staffJ });
=======
>>>>>>> REPLACE