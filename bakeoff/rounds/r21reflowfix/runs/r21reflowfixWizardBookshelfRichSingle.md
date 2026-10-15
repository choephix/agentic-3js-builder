The cause is two degenerate `b.spike` calls with length 0, where the base equals the tip, so the path collapses to a single point: the stray one in bay 2 and the one in the floor scroll clutter.

<<<<<<< SEARCH
  b.spike([0.07, 0.73, 0.08], [0, -1, 0], 0.0, 0.0001, CORD, { sides: 3 });
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.spike(wp(at(-0.46, 0, 0.62, -10), [0.07, 0.02, 0.035]), [0.3, -1, 0.5], 0.0, 0.0001, CORD, { sides: 3 });
=======
  b.spike(wp(at(-0.46, 0, 0.62, -10), [0.07, 0.02, 0.035]), [0.3, -1, 0.5], 0.05, 0.01, CORD, { sides: 4 });
>>>>>>> REPLACE