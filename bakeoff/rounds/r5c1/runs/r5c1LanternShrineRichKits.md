`STRAW` was never defined: the palette declares `STRAWG`, and the shimenawa rope-end knots use the undefined name `STRAW`. The fix is to point those knots at `STRAWG`.

<<<<<<< SEARCH
  for (const s of [1, -1]) sph(0.075, STRAW, [s * 1.34, 2.36, z0 + 0.2], [1, 1.3, 1]);
=======
  for (const s of [1, -1]) sph(0.075, STRAWG, [s * 1.34, 2.36, z0 + 0.2], [1, 1.3, 1]);
>>>>>>> REPLACE