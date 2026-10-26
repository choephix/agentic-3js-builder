`offset()` returns a `Vector3`, but my `cyl` helper types `at` as `number[]`, so the call on line 69 fails the typecheck. Spreading the vector into a tuple fixes it.

<<<<<<< SEARCH
    cyl(r * 0.3, r * 0.3, 0.02, c3, offset(at, dir, 0.026), dir, 8);
=======
    cyl(r * 0.3, r * 0.3, 0.02, c3, offset(at, dir, 0.026).toArray(), dir, 8);
>>>>>>> REPLACE