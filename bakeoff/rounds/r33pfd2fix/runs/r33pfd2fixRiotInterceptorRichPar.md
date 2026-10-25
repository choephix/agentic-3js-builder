Cause: in `buildCab`, several antenna `b.rod` calls have identical start and end points (zero-length rods), so `polyline()` sees fewer than 2 distinct points. The first one hit is the `[-0.7, 2.22, 0]` → `[-0.7, 2.2, 0]` pair, whose points are too close to count as distinct; the other degenerate rods nearby fail the same way.

I gave the roof antennas real heights, and the in-loop antenna a real tip as well.

<<<<<<< SEARCH
    b.rod([s * 0.85, 2.22, -0.2], [s * 0.9, 2.95 > 2.2 ? 2.2 : 2.2, -0.2], 0.01, P.black, { bone });
=======
    b.rod([s * 0.85, 2.22, -0.2], [s * 0.9, 2.95, -0.2], 0.01, P.black, { bone });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([-0.7, 2.22, 0.0], [-0.7, 2.2, 0.0], 0.01, P.black, { bone });
  b.rod([0.8, 2.2, -0.15], [0.8, 2.2, -0.15], 0.01, P.black, { bone });
  b.rod([-0.8, 2.2, 0.0], [-0.85, 2.2, 0.0], 0.015, P.steel, { bone });
  b.rod([-0.8, 2.2, 0.0], [-0.88, 2.2, -0.0], 0.012, P.steel, { bone });
=======
  b.rod([-0.7, 2.22, 0.0], [-0.7, 2.7, 0.0], 0.01, P.black, { bone });
  b.rod([0.8, 2.2, -0.15], [0.8, 2.6, -0.15], 0.01, P.black, { bone });
  b.rod([-0.8, 2.2, 0.0], [-0.85, 2.45, 0.0], 0.015, P.steel, { bone });
  b.rod([-0.8, 2.2, 0.0], [-0.88, 2.4, -0.1], 0.012, P.steel, { bone });
>>>>>>> REPLACE