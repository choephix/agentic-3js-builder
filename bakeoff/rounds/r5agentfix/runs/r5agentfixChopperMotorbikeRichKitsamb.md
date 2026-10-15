Cause: two `b.rod` calls (the "weld rings" on the frame backbone and the exhaust flange) have identical start and end points, so the zero-length path makes `polyline()` throw. Both are removed; the orange frame bands and the flange knob are separate parts and stay.

<<<<<<< SEARCH
  for (const t of [0.35, 0.72]) {
    const f = bbPath.at(t);
    b.rod(f, [f.x, f.y, f.z + 0.0], 0.001, { bone: frameJ, color: ORANGE });
  }
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod([s0.x, s0.y, s0.z], [s0.x, s0.y, s0.z], 0.001, { bone: frameJ, color: STEEL });
=======
>>>>>>> REPLACE