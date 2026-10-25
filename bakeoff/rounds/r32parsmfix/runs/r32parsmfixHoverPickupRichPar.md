The cause is in `buildBed`, which calls `b.rod` between two identical points, `[-1.05, 1.5, -2.55]` to itself. That gives a zero-length path, so `polyline()` rejects it. The call is a leftover no-op, so I removed it.

<<<<<<< SEARCH
  b.rod([-1.05, 1.5, -2.55], [-1.05, 1.5, -2.55], 0.001, P.dark, { bone });
=======
>>>>>>> REPLACE