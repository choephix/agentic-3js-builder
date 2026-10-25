The cause is in `buildCab`: the line `glow(box(...).position.set(...) as any, 1)` passes a `Vector3` to `glow`. That `Vector3` has no `.mesh` or `.meshes`, so `glow` reads `.material` of `undefined`. The fix is to place the box directly and glow the part itself.

<<<<<<< SEARCH
    glow(box(0.03, 0.03, 1.5, P.neonMagenta, s * 1.02, 1.5, 0.35 - 0.0 - 0.2).position.set(s * 1.07, 1.2, 0.2) as any, 1);
=======
    glow(box(0.03, 0.03, 1.5, P.neonMagenta, s * 1.07, 1.2, 0.2), 1);
>>>>>>> REPLACE