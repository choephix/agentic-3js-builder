Cause: in `addAntennaArray`, the leftover `b.spike([px, 0.02, z], [0, -1, 0], 0.0, 0.0, ...)` has length 0, so its start and end points coincide and `polyline()` rejects the degenerate path. The cone part on the next line already builds the ground spike, so the call can go.

<<<<<<< SEARCH
      b.spike([px, 0.02, z], [0, -1, 0], 0.0, 0.0, { color: STEEL });
=======
>>>>>>> REPLACE