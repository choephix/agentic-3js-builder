The `arc(center, from, axis, angleDeg)` calls pass the same point as both `center` and `from`, so the radius is zero and the path collapses to a single point. The arch needs the centre at the arch axis and `from` at the right-hand springing point, and the sweep must go counter-clockwise about +Z so it passes over the top.

With `axis [0,0,1]`, rotating from +X by +180° goes through +Y (up), which is the arch shape wanted. The centre is `[RX, ARCH_C, RZ]` and `from` is `[RX + 0.42, ARCH_C, RZ]`.

<<<<<<< SEARCH
  const archPath = arc([RX + 0.42, ARCH_C, RZ], [RX + 0.42, ARCH_C, RZ], [0, 0, 1], 180);
=======
  const archPath = arc([RX, ARCH_C, RZ], [RX + 0.42, ARCH_C, RZ], [0, 0, 1], 180);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(arc([RX + 0.42, ARCH_C, RZ + zOff], [RX + 0.42, ARCH_C, RZ + zOff], [0, 0, 1], 180), 0.011, GOLD, {
=======
    b.sweep(arc([RX, ARCH_C, RZ + zOff], [RX + 0.42, ARCH_C, RZ + zOff], [0, 0, 1], 180), 0.011, GOLD, {
>>>>>>> REPLACE