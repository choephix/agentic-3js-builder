The shimenawa end knots use `STRAW`, which was never defined; the palette only declares `STRAWG`, so the fix is to use that existing straw colour.

<<<<<<< SEARCH
  for (const s of [1, -1]) sph(0.075, STRAW, [s * 1.34, 2.36, z0 + 0.2], [1, 1.3, 1]);
=======
  for (const s of [1, -1]) sph(0.075, STRAWG, [s * 1.34, 2.36, z0 + 0.2], [1, 1.3, 1]);
>>>>>>> REPLACE