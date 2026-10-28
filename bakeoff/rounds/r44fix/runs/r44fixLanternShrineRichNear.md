The cause is a zero-length rod in the paper-lantern loop: `b.rod([x, 2.78, TZ], [x, 2.78, TZ], 0.001, ...)` has identical endpoints, so the polyline needs two distinct points and throws. The line is a leftover and does nothing, so I remove it.

<<<<<<< SEARCH
    b.rod([x, 2.78, TZ], [x, 2.78, TZ], 0.001, { color: BLACK });
=======
>>>>>>> REPLACE