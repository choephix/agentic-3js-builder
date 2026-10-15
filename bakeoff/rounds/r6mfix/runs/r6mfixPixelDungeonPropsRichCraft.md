The cause: in `torch`, the flame-core line calls `box(...)` with the arguments in the wrong order (`color` is passed where `at` belongs, and a nonsense ternary builds the position), so the paint/colour object lands in `at`, which `toPoint` rejects.

<<<<<<< SEARCH
    glow(box([0.08, 0.05, 0.08], "#ff9a2a".length ? [x, base + 0.86, z] : [0, 0, 0], "#ff9a2a"), 1.2);
=======
    glow(box([0.08, 0.05, 0.08], [x, base + 0.86, z], "#ff9a2a"), 1.2);
>>>>>>> REPLACE

The other `torch` calls, such as `box([0.07, 0.72, 0.07], WOODP, [x, base + 0.36, z])`, also have `color` and `at` swapped, since `box` takes `(size, at, color)`. Fixing them:

<<<<<<< SEARCH
    box([0.07, 0.72, 0.07], WOODP, [x, base + 0.36, z]);
    box([0.1, 0.05, 0.1], IRONP, [x, base + 0.5, z]);
    box([0.1, 0.05, 0.1], IRONP, [x, base + 0.14, z]);
    box([0.14, 0.04, 0.14], IRONP, [x, base + 0.73, z]);
    box([0.11, 0.1, 0.11], "#3a2418", [x, base + 0.8, z]);
=======
    box([0.07, 0.72, 0.07], [x, base + 0.36, z], WOODP);
    box([0.1, 0.05, 0.1], [x, base + 0.5, z], IRONP);
    box([0.1, 0.05, 0.1], [x, base + 0.14, z], IRONP);
    box([0.14, 0.04, 0.14], [x, base + 0.73, z], IRONP);
    box([0.11, 0.1, 0.11], [x, base + 0.8, z], "#3a2418");
>>>>>>> REPLACE