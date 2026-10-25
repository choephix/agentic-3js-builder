The cab's antenna called `b.spike(base, tip, 0, ...)` with `len` set to 0. A `len` of 0 is a number, so the tip was read as a direction and the spike had zero length, which collapsed the sweep path to a single point. The fix is to remove that bogus spike, since the antenna is already drawn with the two rods beside it.

<<<<<<< SEARCH
  b.spike([-0.8, 1.95, -0.6], [-0.86, 1.0, 0.02] as any, 0, 0.012, { bone: body } as any);
=======
>>>>>>> REPLACE